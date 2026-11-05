// Seed script for IUBAT CSE B231 curriculum from the real CSV
import fs from "fs";
import path from "path";
import { PrismaClient } from "@prisma/client";
import { parseCsv } from "./inspect_csv";

const prisma = new PrismaClient();

async function main() {
  const csvPath = path.resolve(__dirname, "../../../IUBAT'S Curriculamn - IUBAT CSE Curriculum (B231).csv");
  console.log("Reading real CSV from:", csvPath);
  const text = fs.readFileSync(csvPath, "utf-8");
  const rows = parseCsv(text);
  const dataRows = rows.slice(1);

  console.log(`Seeding ${dataRows.length} real curriculum courses...`);

  const courses = dataRows.map((r) => ({
    code: r[0],
    name: r[1],
    credits: parseFloat(r[2]) || 0,
    semester: parseInt(r[3], 10) || 1,
    description: r[4] || "",
    topics: r[5] || "",
    projects: r[6] || "",
    co1: r[7] || "",
    co2: r[8] || "",
    co3: r[9] || "",
    co4: r[10] || "",
    co5: r[11] || "",
    program: "B.Sc. in CSE",
    curriculumVersion: "B231",
  }));

  for (const c of courses) {
    await prisma.curriculumCourse.upsert({
      where: { code: c.code },
      update: {
        name: c.name,
        credits: c.credits,
        semester: c.semester,
        description: c.description,
        topics: c.topics,
        projects: c.projects,
        co1: c.co1,
        co2: c.co2,
        co3: c.co3,
        co4: c.co4,
        co5: c.co5,
        program: c.program,
        curriculumVersion: c.curriculumVersion,
      },
      create: c,
    });
  }

  const count = await prisma.curriculumCourse.count();
  console.log(`Successfully seeded ${count} curriculum courses into DB.`);

  // Write frontend curriculum file
  const frontendPath = path.resolve(__dirname, "../../../src/data/iubat-curriculum.ts");
  const fileContent = `// Auto-generated from IUBAT'S Curriculamn - IUBAT CSE Curriculum (B231).csv
// Source of truth for IUBAT B.Sc. in CSE (B231 curriculum: 59 courses, 11 semesters)

export interface CurriculumCourseItem {
  code: string;
  name: string;
  credits: number;
  semester: number;
  description: string;
  topics: string;
  projects: string;
  cos: string[];
}

export const IUBAT_CSE_B231_CURRICULUM: CurriculumCourseItem[] = ${JSON.stringify(
    courses.map((c) => ({
      code: c.code,
      name: c.name,
      credits: c.credits,
      semester: c.semester,
      description: c.description,
      topics: c.topics,
      projects: c.projects,
      cos: [c.co1, c.co2, c.co3, c.co4, c.co5].filter(Boolean),
    })),
    null,
    2,
  )};

export function getCoursesBySemester(semester: number): CurriculumCourseItem[] {
  return IUBAT_CSE_B231_CURRICULUM.filter((c) => c.semester === semester);
}

export function searchCurriculumCourses(query: string): CurriculumCourseItem[] {
  const q = query.trim().toLowerCase();
  if (!q) return IUBAT_CSE_B231_CURRICULUM;
  return IUBAT_CSE_B231_CURRICULUM.filter(
    (c) => c.code.toLowerCase().includes(q) || c.name.toLowerCase().includes(q) || c.description.toLowerCase().includes(q)
  );
}
`;

  fs.writeFileSync(frontendPath, fileContent, "utf-8");
  console.log(`Wrote frontend curriculum file at: ${frontendPath}`);
}

main()
  .catch((e) => {
    console.error("Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
