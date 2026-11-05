// Shared types for the Alohomora! API layer.
// Prepared for Node.js + MySQL backend with HttpOnly session cookies.
// Components never call fetch directly — everything routes through typed API clients.

import type { CourseRecord, CGPAResult } from "@/lib/cgpa";
import type { CareerDef, SkillDef, SkillStatus } from "@/data/skills";
import type { DemoDeadline } from "@/data/academic";
import type { Opportunity } from "@/data/opportunities";
import type { Resource } from "@/data/resources";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  university: string;
  studentId: string;
  emailVerified: boolean;
}

export interface UserProfile extends AuthUser {
  degree: string;
  academicYear: string;
  semester: string;
  weeklyHours: number;
  targetRole: string;
  links: string;
  onboarded: boolean;
}

export interface RegisterInput {
  fullName: string;
  university: string;
  email: string;
  studentId: string;
  password: string;
}

export type AuthErrorCode =
  | "invalid_credentials"
  | "email_taken"
  | "unverified"
  | "rate_limited"
  | "invalid_code"
  | "validation"
  | "network"
  | "unauthorized"
  | "not_found"
  | "unknown";

export class ApiError extends Error {
  code: AuthErrorCode;
  status?: number;
  details?: unknown;

  constructor(code: AuthErrorCode, message: string, status?: number, details?: unknown) {
    super(message);
    this.name = "ApiError";
    this.code = code;
    this.status = status;
    this.details = details;
  }
}

export interface SkillEntryPayload {
  level: number; // 0 to 4
  status: SkillStatus;
  confidence: number;
  evidence: string;
}

export interface EvidenceItem {
  id: string;
  skillId: string;
  url: string;
  notes?: string;
  submittedAt: string;
  verified: boolean; // Demo/unverified until actual review workflow
}

export interface MapMilestonePayload {
  id: string;
  title: string;
  room: string;
  status: "completed" | "active" | "upcoming";
  skills: string[];
}

export interface MapPayload {
  roleId: string;
  roleTitle: string;
  coveragePercent: number;
  demonstratedCount: number;
  developingCount: number;
  missingCount: number;
  currentMilestoneIndex: number;
  milestones: MapMilestonePayload[];
}

export interface ChatResponse {
  reply: string;
  sources?: string[];
}

export interface OnboardingState {
  profile: Partial<UserProfile>;
  courses: CourseRecord[];
  skills: Record<string, SkillEntryPayload>;
  targetCgpa: number;
  upcomingCredits: number;
  onboarded: boolean;
}

export interface SaveOnboardingPayload {
  step?: number;
  name?: string;
  studentId?: string;
  university?: string;
  degree?: string;
  academicYear?: string;
  semester?: string;
  weeklyHours?: number;
  targetRole?: string;
  links?: string;
  targetCgpa?: number;
  upcomingCredits?: number;
  courses?: Array<{
    code: string;
    name: string;
    credits: number;
    grade: string;
    semester?: string;
    confidence?: number;
  }>;
  skills?: Record<string, {
    level: number;
    status?: "demonstrated" | "developing" | "missing";
    confidence?: number;
    evidence?: string;
  }>;
  finish?: boolean;
}

export interface OnboardingApi {
  getState(): Promise<OnboardingState | null>;
  saveState(input: SaveOnboardingPayload): Promise<{ success: boolean }>;
}

export interface AuthApi {
  register(input: RegisterInput): Promise<void>;
  verifyEmail(email: string, code: string): Promise<AuthUser>;
  resendCode(email: string): Promise<void>;
  login(identifier: string, password: string): Promise<AuthUser>;
  logout(): Promise<void>;
  requestPasswordReset(email: string): Promise<void>;
  resetPassword(token: string, newPassword: string): Promise<void>;
  getCurrentUser(): Promise<AuthUser | null>;
}

export interface UserApi {
  getProfile(): Promise<UserProfile | null>;
  updateProfile(patch: Partial<UserProfile>): Promise<UserProfile>;
}

export interface CoursesApi {
  getCourses(): Promise<CourseRecord[]>;
  addCourse(course: Omit<CourseRecord, "id">): Promise<CourseRecord>;
  updateCourse(id: string, patch: Partial<CourseRecord>): Promise<CourseRecord>;
  deleteCourse(id: string): Promise<void>;
}

export interface CgpaApi {
  getCgpa(): Promise<CGPAResult>;
}

export interface RolesApi {
  getRoles(): Promise<CareerDef[]>;
  getRole(id: string): Promise<CareerDef | undefined>;
}

export interface SkillsApi {
  getSkills(): Promise<Record<string, SkillEntryPayload>>;
  updateSkill(skillId: string, entry: Partial<SkillEntryPayload>): Promise<SkillEntryPayload>;
  addEvidence(skillId: string, evidence: { url: string; notes?: string }): Promise<EvidenceItem>;
  deleteEvidence(id: string): Promise<void>;
}

export interface MapApi {
  getMap(roleId?: string): Promise<MapPayload>;
}

export interface PlanApi {
  getPlan(roleId: string, hoursPerWeek: number): Promise<{ tasks: Array<{ id: string; week: number; title: string; skill: string; hours: number; done: boolean }> }>;
  updateSettings(settings: { hoursPerWeek: number }): Promise<void>;
  toggleTask(taskId: string, done: boolean): Promise<void>;
}

export interface OpportunitiesApi {
  getOpportunities(filters?: { type?: string; query?: string }): Promise<Opportunity[]>;
  getResources(filters?: { tag?: string; price?: string }): Promise<Resource[]>;
  addBookmark(itemId: string, itemType: "opportunity" | "resource"): Promise<void>;
  removeBookmark(itemId: string): Promise<void>;
}

export interface DeadlinesApi {
  getDeadlines(): Promise<DemoDeadline[]>;
  addDeadline(deadline: Omit<DemoDeadline, "id">): Promise<DemoDeadline>;
  updateDeadline(id: string, patch: Partial<DemoDeadline>): Promise<DemoDeadline>;
  deleteDeadline(id: string): Promise<void>;
}

export interface ActivityApi {
  getActivity(): Promise<{ weeklyHours: number; streakDays: number; completedQuests: number }>;
}

export interface ChatApi {
  sendMessage(message: string, context?: { course?: string; role?: string }): Promise<ChatResponse>;
}

export interface AlohomoraApi {
  auth: AuthApi;
  user: UserApi;
  courses: CoursesApi;
  cgpa: CgpaApi;
  roles: RolesApi;
  skills: SkillsApi;
  map: MapApi;
  plan: PlanApi;
  opportunities: OpportunitiesApi;
  deadlines: DeadlinesApi;
  activity: ActivityApi;
  chat: ChatApi;
  onboarding: OnboardingApi;

  // Root backwards-compatibility shortcuts
  register: AuthApi["register"];
  verifyEmail: AuthApi["verifyEmail"];
  resendCode: AuthApi["resendCode"];
  login: AuthApi["login"];
  logout: AuthApi["logout"];
  requestPasswordReset: AuthApi["requestPasswordReset"];
  getCurrentUser: AuthApi["getCurrentUser"];
}
