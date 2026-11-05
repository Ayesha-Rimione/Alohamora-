import { prisma } from "../../config/prisma";
import { AppError } from "../../middleware/error";
import { calculateCGPA, calculateRequiredGpa, UGC_GRADE_SCALE } from "../../utils/cgpa";
import type {
  CourseInput,
  UpdateCourseInput,
  SemesterInput,
  ProfileUpdateInput,
} from "./academic.schemas";

export class AcademicService {
  private async getStudentGradeScale(userId: string): Promise<Record<string, number>> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { university: true },
    });

    if (user?.university?.gradingScaleJson) {
      try {
        const parsed = JSON.parse(user.university.gradingScaleJson);
        if (typeof parsed === "object" && parsed !== null) {
          return parsed as Record<string, number>;
        }
      } catch {
        // Fallback to UGC scale if JSON invalid
      }
    }
    return UGC_GRADE_SCALE;
  }

  async getCourses(userId: string) {
    const courses = await prisma.course.findMany({
      where: { userId },
      orderBy: { createdAt: "asc" },
    });

    return courses.map((c) => ({
      id: c.id,
      code: c.code,
      name: c.name,
      credits: c.credits,
      grade: c.grade,
      semester: c.semesterName,
      confidence: c.confidence,
    }));
  }

  async addCourse(userId: string, input: CourseInput) {
    const course = await prisma.course.create({
      data: {
        userId,
        code: input.code.toUpperCase(),
        name: input.name,
        credits: input.credits,
        grade: input.grade.toUpperCase(),
        semesterName: input.semester,
        confidence: input.confidence,
      },
    });

    return {
      id: course.id,
      code: course.code,
      name: course.name,
      credits: course.credits,
      grade: course.grade,
      semester: course.semesterName,
      confidence: course.confidence,
    };
  }

  async updateCourse(userId: string, courseId: string, patch: UpdateCourseInput) {
    const course = await prisma.course.findUnique({ where: { id: courseId } });
    if (!course) {
      throw new AppError("not_found", "Course not found", 404);
    }
    if (course.userId !== userId) {
      throw new AppError("forbidden", "You do not have permission to modify this course record", 403);
    }

    const updated = await prisma.course.update({
      where: { id: courseId },
      data: {
        ...(patch.code ? { code: patch.code.toUpperCase() } : {}),
        ...(patch.name ? { name: patch.name } : {}),
        ...(patch.credits !== undefined ? { credits: patch.credits } : {}),
        ...(patch.grade ? { grade: patch.grade.toUpperCase() } : {}),
        ...(patch.semester ? { semesterName: patch.semester } : {}),
        ...(patch.confidence !== undefined ? { confidence: patch.confidence } : {}),
      },
    });

    return {
      id: updated.id,
      code: updated.code,
      name: updated.name,
      credits: updated.credits,
      grade: updated.grade,
      semester: updated.semesterName,
      confidence: updated.confidence,
    };
  }

  async deleteCourse(userId: string, courseId: string) {
    const course = await prisma.course.findUnique({ where: { id: courseId } });
    if (!course) {
      throw new AppError("not_found", "Course not found", 404);
    }
    if (course.userId !== userId) {
      throw new AppError("forbidden", "You do not have permission to delete this course record", 403);
    }

    await prisma.course.delete({ where: { id: courseId } });
  }

  async getSemesters(userId: string) {
    return prisma.semester.findMany({
      where: { userId },
      orderBy: { orderIndex: "asc" },
      include: { courses: true },
    });
  }

  async createSemester(userId: string, input: SemesterInput) {
    return prisma.semester.create({
      data: {
        userId,
        name: input.name,
        term: input.term,
        year: input.year,
        orderIndex: input.orderIndex,
      },
    });
  }

  async getCgpa(userId: string) {
    const courses = await prisma.course.findMany({ where: { userId } });
    const scale = await this.getStudentGradeScale(userId);

    const result = calculateCGPA(courses, scale);

    const profile = await prisma.academicProfile.findUnique({ where: { userId } });
    const targetCgpa = profile?.targetCgpa ?? 3.65;
    const upcomingCredits = profile?.upcomingCredits ?? 15;

    const requiredCalc = calculateRequiredGpa(
      result.cgpa,
      result.totalCredits,
      upcomingCredits,
      targetCgpa,
    );

    return {
      ...result,
      targetCgpa,
      upcomingCredits,
      requiredGpaCalculation: requiredCalc,
    };
  }

  async calculateRequiredForStudent(
    userId: string,
    targetCgpa: number,
    upcomingCredits: number,
  ) {
    const cgpaResult = await this.getCgpa(userId);
    return calculateRequiredGpa(
      cgpaResult.cgpa,
      cgpaResult.totalCredits,
      upcomingCredits,
      targetCgpa,
    );
  }

  async getProfile(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { academicProfile: true },
    });

    if (!user) {
      throw new AppError("not_found", "User not found", 404);
    }

    const p = user.academicProfile;

    return {
      id: user.id,
      name: user.fullName,
      email: user.email,
      university: user.universityName,
      studentId: user.studentId,
      degree: p?.degree ?? "",
      academicYear: p?.academicYear ?? "",
      semester: p?.semester ?? "",
      weeklyHours: p?.weeklyHours ?? 8,
      targetRole: p?.targetRole ?? "",
      links: p?.links ?? "",
      targetCgpa: p?.targetCgpa ?? 0,
      upcomingCredits: p?.upcomingCredits ?? 0,
      onboarded: p?.onboarded ?? false,
      emailVerified: user.emailVerified,
    };
  }

  async updateProfile(userId: string, patch: ProfileUpdateInput) {
    if (patch.name) {
      await prisma.user.update({
        where: { id: userId },
        data: { fullName: patch.name },
      });
    }

    const updatedProfile = await prisma.academicProfile.upsert({
      where: { userId },
      create: {
        userId,
        degree: patch.degree ?? "",
        academicYear: patch.academicYear ?? "",
        semester: patch.semester ?? "",
        weeklyHours: patch.weeklyHours ?? 8,
        targetRole: patch.targetRole ?? "",
        links: patch.links ?? "",
        targetCgpa: patch.targetCgpa ?? 0,
        upcomingCredits: patch.upcomingCredits ?? 0,
        onboarded: patch.onboarded ?? false,
      },
      update: {
        ...(patch.degree !== undefined ? { degree: patch.degree } : {}),
        ...(patch.academicYear !== undefined ? { academicYear: patch.academicYear } : {}),
        ...(patch.semester !== undefined ? { semester: patch.semester } : {}),
        ...(patch.weeklyHours !== undefined ? { weeklyHours: patch.weeklyHours } : {}),
        ...(patch.targetRole !== undefined ? { targetRole: patch.targetRole } : {}),
        ...(patch.links !== undefined ? { links: patch.links } : {}),
        ...(patch.targetCgpa !== undefined ? { targetCgpa: patch.targetCgpa } : {}),
        ...(patch.upcomingCredits !== undefined ? { upcomingCredits: patch.upcomingCredits } : {}),
        ...(patch.onboarded !== undefined ? { onboarded: patch.onboarded } : {}),
      },
    });

    const user = await prisma.user.findUnique({ where: { id: userId } });

    return {
      id: userId,
      name: user?.fullName ?? "",
      email: user?.email ?? "",
      university: user?.universityName ?? "",
      studentId: user?.studentId ?? "",
      degree: updatedProfile.degree,
      academicYear: updatedProfile.academicYear,
      semester: updatedProfile.semester,
      weeklyHours: updatedProfile.weeklyHours,
      targetRole: updatedProfile.targetRole,
      links: updatedProfile.links ?? "",
      targetCgpa: updatedProfile.targetCgpa,
      upcomingCredits: updatedProfile.upcomingCredits,
      onboarded: updatedProfile.onboarded,
      emailVerified: user?.emailVerified ?? false,
    };
  }

  async getCurriculum(query: { semesterLt?: number; semester?: number; q?: string }) {
    const where: any = {};
    if (query.semesterLt) {
      where.semester = { lt: Number(query.semesterLt) };
    } else if (query.semester) {
      where.semester = Number(query.semester);
    }
    if (query.q) {
      where.OR = [
        { code: { contains: query.q } },
        { name: { contains: query.q } },
      ];
    }
    return prisma.curriculumCourse.findMany({
      where,
      orderBy: [{ semester: "asc" }, { code: "asc" }],
    });
  }
}

export const academicService = new AcademicService();

