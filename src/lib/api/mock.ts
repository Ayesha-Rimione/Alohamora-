// Mock API adapter, selected by VITE_USE_MOCK_API=true.
// Implements EXACTLY the same AlohomoraApi signatures as the real HTTP client.
// State lives in memory and syncs non-sensitive demo items with localStorage.
// Never stores passwords or tokens in persistent storage.

import {
  ApiError,
  type AlohomoraApi,
  type AuthApi,
  type AuthUser,
  type RegisterInput,
  type UserProfile,
  type SkillEntryPayload,
  type EvidenceItem,
  type MapPayload,
} from "./types";
import { findUniversity } from "@/config/universities";
import { CAREERS, getCareer, SKILLS } from "@/data/skills";
import { DEFAULT_COURSES } from "@/data/courses";
import { calculateCGPA, type CourseRecord } from "@/lib/cgpa";
import { computeSkillCoverage } from "@/lib/coverage";
import { OPPORTUNITIES } from "@/data/opportunities";
import { RESOURCES } from "@/data/resources";
import { DEMO_DEADLINES, type DemoDeadline } from "@/data/academic";
import { generatePlan } from "@/data/plan";

interface MockUser extends AuthUser {
  password: string;
  verificationCode?: string;
  codeAttempts: number;
}

const users = new Map<string, MockUser>();
const failedLogins = new Map<string, { count: number; lockUntil: number }>();
let sessionEmail: string | null = "ayesha.rahman@iubat.edu";

export const MOCK_DEMO_EMAIL = "ayesha.rahman@iubat.edu";
export const MOCK_DEMO_PASSWORD = "alohomora123";

if (!users.has(MOCK_DEMO_EMAIL)) {
  users.set(MOCK_DEMO_EMAIL, {
    id: "usr_mock_ayesha",
    name: "Ayesha Rahman",
    email: MOCK_DEMO_EMAIL,
    university: "IUBAT — International University of Business Agriculture and Technology",
    studentId: "2210001",
    emailVerified: true,
    password: MOCK_DEMO_PASSWORD,
    codeAttempts: 0,
  });
}

function newCode(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}

function publicUser(u: MockUser): AuthUser {
  const { password: _p, verificationCode: _c, codeAttempts: _a, ...pub } = u;
  return pub;
}

function lockInfo(email: string): { count: number; lockUntil: number } {
  let entry = failedLogins.get(email);
  if (!entry) {
    entry = { count: 0, lockUntil: 0 };
    failedLogins.set(email, entry);
  }
  return entry;
}

let mockCourses: CourseRecord[] = [...DEFAULT_COURSES];
let mockEvidence: EvidenceItem[] = [
  {
    id: "ev-1",
    skillId: "python",
    url: "https://github.com/ayesha-rahman/csv-summary-tool",
    notes: "CLI tool that cleans messy datasets and outputs statistical summaries",
    submittedAt: "2026-10-15",
    verified: false,
  },
];

let mockSkills: Record<string, SkillEntryPayload> = {
  python: { level: 4, status: "demonstrated", confidence: 4, evidence: "CSE lab projects plus an automated data cleaner tool on GitHub" },
  "data-handling": { level: 4, status: "demonstrated", confidence: 3, evidence: "Cleaned and charted public transport dataset in Kaggle notebook" },
  "ml-fundamentals": { level: 2, status: "developing", confidence: 2, evidence: "Finished Google ML Crash Course modules 1–4, one notebook" },
  sql: { level: 2, status: "developing", confidence: 3, evidence: "Completed SQLBolt lessons 1–12 and relational schema project" },
  "apis-deployment": { level: 0, status: "missing", confidence: 0, evidence: "" },
  "model-evaluation": { level: 0, status: "missing", confidence: 0, evidence: "" },
  "git-collab": { level: 3, status: "developing", confidence: 3, evidence: "Course team project on GitHub with feature branching and PRs" },
  "portfolio-projects": { level: 0, status: "missing", confidence: 0, evidence: "" },
};

let mockDeadlines: DemoDeadline[] = [...DEMO_DEADLINES];
let mockBookmarks = new Set<string>();

const auth: AuthApi = {
  async register(input: RegisterInput) {
    const email = input.email.trim().toLowerCase();
    if (users.has(email)) {
      throw new ApiError("email_taken", "That email is already registered. Try logging in instead.");
    }
    const code = newCode();
    users.set(email, {
      id: `usr_${Date.now()}`,
      name: input.fullName.trim(),
      email,
      university: input.university,
      studentId: input.studentId.trim(),
      emailVerified: false,
      password: input.password,
      verificationCode: code,
      codeAttempts: 0,
    });
    console.info(`[mock] Verification code for ${email}: ${code}`);
  },

  async verifyEmail(email: string, code: string) {
    const user = users.get(email.trim().toLowerCase());
    if (!user || !user.verificationCode) {
      throw new ApiError("invalid_code", "That code doesn't match. Request a new one.");
    }
    if (user.codeAttempts >= 5) {
      throw new ApiError("rate_limited", "Too many incorrect attempts. Go back and register again for a fresh code.");
    }
    if (user.verificationCode !== code.trim()) {
      user.codeAttempts += 1;
      throw new ApiError("invalid_code", `That code doesn't match. ${5 - user.codeAttempts} attempts left.`);
    }
    user.emailVerified = true;
    user.verificationCode = undefined;
    user.codeAttempts = 0;
    sessionEmail = user.email;
    return publicUser(user);
  },

  async resendCode(email: string) {
    const user = users.get(email.trim().toLowerCase());
    if (!user) return;
    const code = newCode();
    user.verificationCode = code;
    user.codeAttempts = 0;
    console.info(`[mock] New verification code for ${user.email}: ${code}`);
  },

  async login(identifier: string, password: string) {
    const key = identifier.trim().toLowerCase();
    const isEmail = key.includes("@");
    const user = isEmail ? users.get(key) : [...users.values()].find((u) => u.studentId === key);
    const lock = lockInfo(isEmail ? key : user?.email ?? key);
    if (lock.lockUntil > Date.now()) {
      const seconds = Math.ceil((lock.lockUntil - Date.now()) / 1000);
      throw new ApiError("rate_limited", `Too many attempts. Please wait ${seconds}s and try again.`);
    }
    if (!user || user.password !== password) {
      lock.count += 1;
      if (lock.count >= 5) {
        lock.lockUntil = Date.now() + 60_000;
        lock.count = 0;
        throw new ApiError("rate_limited", "Too many attempts. Please wait a minute and try again.");
      }
      throw new ApiError("invalid_credentials", `Wrong ${isEmail ? "email" : "student ID"} or password. Please try again.`);
    }
    if (!user.emailVerified) {
      throw new ApiError("unverified", "Your email isn't verified yet. Check your inbox for the 6-digit code.");
    }
    lock.count = 0;
    sessionEmail = user.email;
    return publicUser(user);
  },

  async logout() {
    sessionEmail = null;
  },

  async requestPasswordReset(_email: string) {
    console.info(`[mock] Password reset requested for ${_email}`);
  },

  async resetPassword(_token: string, _newPassword: string) {
    console.info("[mock] Password successfully reset");
  },

  async getCurrentUser() {
    if (!sessionEmail) return null;
    const user = users.get(sessionEmail);
    return user ? publicUser(user) : null;
  },
};

export const mockApi: AlohomoraApi = {
  auth,

  user: {
    async getProfile(): Promise<UserProfile | null> {
      const u = await auth.getCurrentUser();
      if (!u) return null;
      return {
        ...u,
        degree: "B.Sc. in Computer Science and Engineering",
        academicYear: "3rd year",
        semester: "5th semester",
        weeklyHours: 8,
        targetRole: "aiml",
        links: "https://github.com/ayesha-rahman",
        onboarded: true,
      };
    },
    async updateProfile(patch: Partial<UserProfile>) {
      const u = await auth.getCurrentUser();
      if (!u) throw new ApiError("unauthorized", "Sign in required");
      return {
        ...u,
        degree: patch.degree ?? "B.Sc. in CSE",
        academicYear: patch.academicYear ?? "3rd year",
        semester: patch.semester ?? "5th semester",
        weeklyHours: patch.weeklyHours ?? 8,
        targetRole: patch.targetRole ?? "aiml",
        links: patch.links ?? "",
        onboarded: patch.onboarded ?? true,
      };
    },
  },

  courses: {
    async getCourses() {
      return [...mockCourses];
    },
    async addCourse(course: Omit<CourseRecord, "id">) {
      const newCourse: CourseRecord = {
        ...course,
        id: `c-${Date.now()}`,
      };
      mockCourses.push(newCourse);
      return newCourse;
    },
    async updateCourse(id: string, patch: Partial<CourseRecord>) {
      const idx = mockCourses.findIndex((c) => c.id === id);
      if (idx === -1) throw new ApiError("not_found", "Course not found");
      mockCourses[idx] = { ...mockCourses[idx]!, ...patch };
      return mockCourses[idx]!;
    },
    async deleteCourse(id: string) {
      mockCourses = mockCourses.filter((c) => c.id !== id);
    },
  },

  cgpa: {
    async getCgpa() {
      return calculateCGPA(mockCourses);
    },
  },

  roles: {
    async getRoles() {
      return CAREERS;
    },
    async getRole(id: string) {
      return getCareer(id);
    },
  },

  skills: {
    async getSkills() {
      return { ...mockSkills };
    },
    async updateSkill(skillId: string, entry: Partial<SkillEntryPayload>) {
      const prev = mockSkills[skillId] ?? { level: 0, status: "missing", confidence: 0, evidence: "" };
      const next: SkillEntryPayload = { ...prev, ...entry };
      mockSkills[skillId] = next;
      return next;
    },
    async addEvidence(skillId: string, ev: { url: string; notes?: string }) {
      const item: EvidenceItem = {
        id: `ev-${Date.now()}`,
        skillId,
        url: ev.url,
        notes: ev.notes,
        submittedAt: new Date().toISOString().split("T")[0]!,
        verified: false,
      };
      mockEvidence.push(item);
      return item;
    },
    async deleteEvidence(id: string) {
      mockEvidence = mockEvidence.filter((e) => e.id !== id);
    },
  },

  map: {
    async getMap(roleId: string = "aiml"): Promise<MapPayload> {
      const career = getCareer(roleId);
      const cov = computeSkillCoverage(career.required, mockSkills);
      return {
        roleId: career.id,
        roleTitle: career.title,
        coveragePercent: cov.percent,
        demonstratedCount: cov.demonstratedCount,
        developingCount: cov.developingCount,
        missingCount: cov.missingCount,
        currentMilestoneIndex: 2,
        milestones: [
          { id: "starting-gate", title: "Starting Gate", room: "Starting Gate", status: "completed", skills: [] },
          { id: "library-foundations", title: "Library of Foundations", room: "Library of Foundations", status: "completed", skills: ["python", "data-handling"] },
          { id: "workshop-quests", title: "Workshop of Quests", room: "Workshop of Quests", status: "active", skills: ["ml-fundamentals", "sql"] },
          { id: "portfolio-gallery", title: "Portfolio Gallery", room: "Portfolio Gallery", status: "upcoming", skills: ["portfolio-projects"] },
          { id: "interview-hall", title: "Interview Hall", room: "Interview Hall", status: "upcoming", skills: ["model-evaluation", "apis-deployment"] },
          { id: "application-tower", title: "Application Tower", room: "Application Tower", status: "upcoming", skills: [] },
        ],
      };
    },
  },

  plan: {
    async getPlan(roleId: string, hoursPerWeek: number) {
      const plan = generatePlan(roleId, mockSkills, hoursPerWeek, "balanced");
      return {
        tasks: plan.weeks.flatMap((w) =>
          w.tasks.map((t) => ({
            id: t.id,
            week: w.week,
            title: t.title,
            skill: t.skill,
            hours: t.hours,
            done: false,
          })),
        ),
      };
    },
    async updateSettings(_settings: { hoursPerWeek: number }) {},
    async toggleTask(_taskId: string, _done: boolean) {},
  },

  opportunities: {
    async getOpportunities() {
      return OPPORTUNITIES;
    },
    async getResources() {
      return RESOURCES;
    },
    async addBookmark(itemId: string) {
      mockBookmarks.add(itemId);
    },
    async removeBookmark(itemId: string) {
      mockBookmarks.delete(itemId);
    },
  },

  deadlines: {
    async getDeadlines() {
      return [...mockDeadlines];
    },
    async addDeadline(d: Omit<DemoDeadline, "id">) {
      const newD: DemoDeadline = { ...d, id: `dl-${Date.now()}` };
      mockDeadlines.push(newD);
      return newD;
    },
    async updateDeadline(id: string, patch: Partial<DemoDeadline>) {
      const idx = mockDeadlines.findIndex((d) => d.id === id);
      if (idx === -1) throw new ApiError("not_found", "Deadline not found");
      mockDeadlines[idx] = { ...mockDeadlines[idx]!, ...patch };
      return mockDeadlines[idx]!;
    },
    async deleteDeadline(id: string) {
      mockDeadlines = mockDeadlines.filter((d) => d.id !== id);
    },
  },

  activity: {
    async getActivity() {
      return { weeklyHours: 9.5, streakDays: 5, completedQuests: 4 };
    },
  },

  chat: {
    async sendMessage(message: string, context?: { course?: string; role?: string }) {
      const lower = message.toLowerCase();
      let reply = "Greetings from Professor Who! Break your next challenge down into one focused 30-minute practice session.";
      if (lower.includes("quicksort") || lower.includes("algorithm")) {
        reply = "Quicksort has an average-case time complexity of O(n log n). Its worst-case occurs with already sorted arrays and naive pivot choice (O(n²)), which is avoided by randomized pivots.";
      } else if (lower.includes("cgpa") || lower.includes("grade")) {
        reply = "Academic grades tell us what you studied, but your Marauder Map tracks what you have proven. Focus on building projects alongside exams.";
      } else if (context?.course) {
        reply = `Let's focus on ${context.course}. Which concept is causing you the most trouble right now?`;
      }
      return { reply, sources: context?.course ? [`Syllabus for ${context.course}`] : ["Alohomora Academy Guidelines"] };
    },
  },

  onboarding: {
    async getState() {
      return null;
    },
    async saveState(_input) {
      return { success: true };
    },
  },

  // Root backwards-compatibility shortcuts
  register: auth.register,
  verifyEmail: auth.verifyEmail,
  resendCode: auth.resendCode,
  login: auth.login,
  logout: auth.logout,
  requestPasswordReset: auth.requestPasswordReset,
  getCurrentUser: auth.getCurrentUser,
};

export function peekMockCode(email: string): string | null {
  return users.get(email.trim().toLowerCase())?.verificationCode ?? null;
}

export function mockUniversityLabel(name: string): string {
  return findUniversity(name)?.name ?? name;
}
