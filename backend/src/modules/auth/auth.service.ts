import { prisma } from "../../config/prisma";
import { env } from "../../config/env";
import { hashPassword, verifyPassword, generateVerificationCode } from "../../utils/password";
import { signSessionToken, generateResetToken } from "../../utils/tokens";
import { AppError } from "../../middleware/error";
import type {
  RegisterInput,
  LoginInput,
  VerifyEmailInput,
  ResetPasswordInput,
} from "./auth.schemas";

export class AuthService {
  async register(input: RegisterInput) {
    const existingEmail = await prisma.user.findUnique({
      where: { email: input.email },
    });
    if (existingEmail) {
      throw new AppError("email_taken", "An account with this email address already exists.", 409);
    }

    const existingStudentId = await prisma.user.findUnique({
      where: { studentId: input.studentId },
    });
    if (existingStudentId) {
      throw new AppError("email_taken", "An account with this Student ID already exists.", 409);
    }

    const passwordHash = await hashPassword(input.password);
    const verificationCode = generateVerificationCode();
    const verificationExpiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 mins

    // Match or link university if exists
    const matchedUni = await prisma.university.findFirst({
      where: { name: { contains: input.university.slice(0, 15) } },
    });

    const user = await prisma.user.create({
      data: {
        fullName: input.fullName,
        email: input.email,
        studentId: input.studentId,
        passwordHash,
        universityName: input.university,
        universityId: matchedUni?.id,
        emailVerified: false,
        verificationCode,
        verificationExpiresAt,
      },
    });

    // Create empty initial academic profile for newly registered student
    await prisma.academicProfile.create({
      data: {
        userId: user.id,
        degree: "",
        academicYear: "",
        semester: "",
        weeklyHours: 8,
        targetRole: "",
        links: "",
        targetCgpa: 0,
        upcomingCredits: 0,
        onboarded: false,
      },
    });

    if (env.NODE_ENV !== "production" || !env.SMTP_HOST) {
      console.log(`\n======================================================`);
      console.log(`[ALOHOMORA! DEV VERIFICATION CODE]`);
      console.log(`Recipient: ${input.email} (${input.fullName})`);
      console.log(`Verification Code: ${verificationCode}`);
      console.log(`Expires in: 15 minutes`);
      console.log(`======================================================\n`);
    }

    return {
      success: true,
      message: "Verification code sent to your university email.",
      ...(env.NODE_ENV !== "production" ? { devCode: verificationCode } : {}),
    };
  }

  async verifyEmail(input: VerifyEmailInput) {
    const user = await prisma.user.findUnique({
      where: { email: input.email },
    });

    if (!user) {
      throw new AppError("invalid_code", "Account not found.", 400);
    }

    if (!user.verificationCode || user.verificationCode !== input.code) {
      throw new AppError("invalid_code", "Invalid 6-digit verification code.", 400);
    }

    if (user.verificationExpiresAt && user.verificationExpiresAt < new Date()) {
      throw new AppError("invalid_code", "Verification code has expired. Please request a new one.", 400);
    }

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: true,
        verificationCode: null,
        verificationExpiresAt: null,
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        studentId: true,
        universityName: true,
        emailVerified: true,
      },
    });

    const token = signSessionToken({
      userId: updatedUser.id,
      email: updatedUser.email,
      studentId: updatedUser.studentId,
    });

    return {
      token,
      user: {
        id: updatedUser.id,
        name: updatedUser.fullName,
        email: updatedUser.email,
        university: updatedUser.universityName,
        studentId: updatedUser.studentId,
        emailVerified: updatedUser.emailVerified,
      },
    };
  }

  async resendCode(email: string) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      // Return success to avoid email enumeration
      return { success: true };
    }

    const newCode = generateVerificationCode();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        verificationCode: newCode,
        verificationExpiresAt: expiresAt,
      },
    });

    if (env.NODE_ENV !== "production" || !env.SMTP_HOST) {
      console.log(`[ALOHOMORA! DEV RESENT CODE] Email: ${email} | Code: ${newCode}`);
    }

    return { success: true };
  }

  async login(input: LoginInput) {
    const identifier = input.identifier.trim();

    const user = await prisma.user.findFirst({
      where: {
        OR: [{ email: identifier.toLowerCase() }, { studentId: identifier }],
      },
    });

    if (!user) {
      throw new AppError("invalid_credentials", "Invalid credentials. Check your email/ID and password.", 401);
    }

    const matches = await verifyPassword(input.password, user.passwordHash);
    if (!matches) {
      throw new AppError("invalid_credentials", "Invalid credentials. Check your email/ID and password.", 401);
    }

    if (!user.emailVerified) {
      throw new AppError("unverified", "Your university email is not verified. Please verify your code.", 403);
    }

    const token = signSessionToken({
      userId: user.id,
      email: user.email,
      studentId: user.studentId,
    });

    return {
      token,
      user: {
        id: user.id,
        name: user.fullName,
        email: user.email,
        university: user.universityName,
        studentId: user.studentId,
        emailVerified: user.emailVerified,
      },
    };
  }

  async forgotPassword(email: string) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return { success: true };
    }

    const resetToken = generateResetToken();
    const resetExpiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetPasswordToken: resetToken,
        resetPasswordExpiresAt: resetExpiresAt,
      },
    });

    if (env.NODE_ENV !== "production" || !env.SMTP_HOST) {
      console.log(`[ALOHOMORA! DEV RESET TOKEN] Email: ${email} | Token: ${resetToken}`);
    }

    return { success: true };
  }

  async resetPassword(input: ResetPasswordInput) {
    const user = await prisma.user.findFirst({
      where: {
        resetPasswordToken: input.token,
        resetPasswordExpiresAt: { gt: new Date() },
      },
    });

    if (!user) {
      throw new AppError("validation", "Password reset token is invalid or has expired.", 400);
    }

    const newHash = await hashPassword(input.newPassword);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash: newHash,
        resetPasswordToken: null,
        resetPasswordExpiresAt: null,
      },
    });

    return { success: true };
  }

  async getCurrentUser(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        fullName: true,
        email: true,
        studentId: true,
        universityName: true,
        emailVerified: true,
      },
    });

    if (!user) return null;

    return {
      id: user.id,
      name: user.fullName,
      email: user.email,
      university: user.universityName,
      studentId: user.studentId,
      emailVerified: user.emailVerified,
    };
  }
}

export const authService = new AuthService();

