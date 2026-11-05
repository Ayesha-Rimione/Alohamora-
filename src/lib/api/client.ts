// Real HTTP client for the Node.js + MySQL backend (built separately).
// Authenticates with an httpOnly session cookie, so every request sends
// credentials: "include" — never tokens in localStorage.

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
  type OnboardingState,
  type SaveOnboardingPayload,
} from "./types";
import type { CourseRecord, CGPAResult } from "@/lib/cgpa";
import type { CareerDef } from "@/data/skills";
import type { Opportunity } from "@/data/opportunities";
import type { Resource } from "@/data/resources";
import type { DemoDeadline } from "@/data/academic";

const API_URL = import.meta.env.VITE_API_URL ?? "/api";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${API_URL}${path}`, {
      credentials: "include",
      headers: init?.body ? { "Content-Type": "application/json" } : undefined,
      ...init,
    });
  } catch {
    throw new ApiError("network", "Can't reach the server. Check your connection and try again.");
  }
  if (!res.ok) {
    let code: ApiError["code"] = "unknown";
    let message = "Something went wrong. Please try again.";
    try {
      const body = (await res.json()) as { code?: string; message?: string };
      if (body.code) code = body.code as ApiError["code"];
      if (body.message) message = body.message;
    } catch {
      // Non-JSON error body
    }
    throw new ApiError(code, message, res.status);
  }
  if (res.status === 204) return undefined as T;
  const json = (await res.json()) as any;
  if (json && typeof json === "object" && "data" in json && Array.isArray(json.data)) {
    return json.data as T;
  }
  return json as T;
}

let cachedUser: AuthUser | null | undefined;

const auth: AuthApi = {
  async register(input: RegisterInput) {
    await request<void>("/auth/register", { method: "POST", body: JSON.stringify(input) });
  },
  async verifyEmail(email: string, code: string) {
    const user = await request<AuthUser>("/auth/verify-email", {
      method: "POST",
      body: JSON.stringify({ email, code }),
    });
    cachedUser = user;
    return user;
  },
  async resendCode(email: string) {
    await request<void>("/auth/resend-code", { method: "POST", body: JSON.stringify({ email }) });
  },
  async login(identifier: string, password: string) {
    const user = await request<AuthUser>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ identifier, password }),
    });
    cachedUser = user;
    return user;
  },
  async logout() {
    await request<void>("/auth/logout", { method: "POST" });
    cachedUser = undefined;
  },
  async requestPasswordReset(email: string) {
    await request<void>("/auth/forgot-password", { method: "POST", body: JSON.stringify({ email }) });
  },
  async resetPassword(token: string, newPassword: string) {
    await request<void>("/auth/reset-password", {
      method: "POST",
      body: JSON.stringify({ token, newPassword }),
    });
  },
  async getCurrentUser() {
    if (cachedUser !== undefined) return cachedUser;
    try {
      cachedUser = await request<AuthUser | null>("/auth/me");
    } catch {
      cachedUser = null;
    }
    return cachedUser;
  },
};

export const realApi: AlohomoraApi = {
  auth,

  user: {
    async getProfile() {
      return request<UserProfile | null>("/me");
    },
    async updateProfile(patch: Partial<UserProfile>) {
      return request<UserProfile>("/me/profile", {
        method: "PUT",
        body: JSON.stringify(patch),
      });
    },
  },

  courses: {
    async getCourses() {
      return request<CourseRecord[]>("/courses");
    },
    async addCourse(course: Omit<CourseRecord, "id">) {
      return request<CourseRecord>("/courses", {
        method: "POST",
        body: JSON.stringify(course),
      });
    },
    async updateCourse(id: string, patch: Partial<CourseRecord>) {
      return request<CourseRecord>(`/courses/${id}`, {
        method: "PUT",
        body: JSON.stringify(patch),
      });
    },
    async deleteCourse(id: string) {
      return request<void>(`/courses/${id}`, { method: "DELETE" });
    },
  },

  cgpa: {
    async getCgpa() {
      return request<CGPAResult>("/me/cgpa");
    },
  },

  roles: {
    async getRoles() {
      return request<CareerDef[]>("/roles");
    },
    async getRole(id: string) {
      return request<CareerDef>(`/roles/${id}`);
    },
  },

  skills: {
    async getSkills() {
      return request<Record<string, SkillEntryPayload>>("/me/skills");
    },
    async updateSkill(skillId: string, entry: Partial<SkillEntryPayload>) {
      return request<SkillEntryPayload>(`/me/skills/${skillId}`, {
        method: "PUT",
        body: JSON.stringify(entry),
      });
    },
    async addEvidence(skillId: string, ev: { url: string; notes?: string }) {
      return request<EvidenceItem>(`/me/skills/${skillId}/evidence`, {
        method: "POST",
        body: JSON.stringify(ev),
      });
    },
    async deleteEvidence(id: string) {
      return request<void>(`/evidence/${id}`, { method: "DELETE" });
    },
  },

  map: {
    async getMap(roleId?: string) {
      const qs = roleId ? `?roleId=${encodeURIComponent(roleId)}` : "";
      return request<MapPayload>(`/me/map${qs}`);
    },
  },

  plan: {
    async getPlan(roleId: string, hoursPerWeek: number) {
      return request<{ tasks: Array<{ id: string; week: number; title: string; skill: string; hours: number; done: boolean }> }>(
        `/me/plan?roleId=${encodeURIComponent(roleId)}&hours=${hoursPerWeek}`,
      );
    },
    async updateSettings(settings: { hoursPerWeek: number }) {
      return request<void>("/me/plan/settings", {
        method: "PUT",
        body: JSON.stringify(settings),
      });
    },
    async toggleTask(taskId: string, done: boolean) {
      return request<void>(`/me/plan/tasks/${taskId}`, {
        method: "PATCH",
        body: JSON.stringify({ done }),
      });
    },
  },

  opportunities: {
    async getOpportunities(filters) {
      const q = new URLSearchParams();
      if (filters?.type) q.set("type", filters.type);
      if (filters?.query) q.set("q", filters.query);
      const qs = q.toString() ? `?${q.toString()}` : "";
      return request<Opportunity[]>(`/opportunities${qs}`);
    },
    async getResources(filters) {
      const q = new URLSearchParams();
      if (filters?.tag) q.set("tag", filters.tag);
      if (filters?.price) q.set("price", filters.price);
      const qs = q.toString() ? `?${q.toString()}` : "";
      return request<Resource[]>(`/resources${qs}`);
    },
    async addBookmark(itemId: string, itemType: "opportunity" | "resource") {
      return request<void>("/bookmarks", {
        method: "POST",
        body: JSON.stringify({ itemId, itemType }),
      });
    },
    async removeBookmark(itemId: string) {
      return request<void>(`/bookmarks/${itemId}`, { method: "DELETE" });
    },
  },

  deadlines: {
    async getDeadlines() {
      return request<DemoDeadline[]>("/me/deadlines");
    },
    async addDeadline(deadline: Omit<DemoDeadline, "id">) {
      return request<DemoDeadline>("/me/deadlines", {
        method: "POST",
        body: JSON.stringify(deadline),
      });
    },
    async updateDeadline(id: string, patch: Partial<DemoDeadline>) {
      return request<DemoDeadline>(`/me/deadlines/${id}`, {
        method: "PATCH",
        body: JSON.stringify(patch),
      });
    },
    async deleteDeadline(id: string) {
      return request<void>(`/me/deadlines/${id}`, { method: "DELETE" });
    },
  },

  activity: {
    async getActivity() {
      return request<{ weeklyHours: number; streakDays: number; completedQuests: number }>("/me/activity");
    },
  },

  chat: {
    async sendMessage(message: string, context?: { course?: string; role?: string }) {
      return request<{ reply: string; sources?: string[] }>("/chat", {
        method: "POST",
        body: JSON.stringify({ message, ...context }),
      });
    },
  },

  onboarding: {
    async getState() {
      return request<OnboardingState | null>("/onboarding");
    },
    async saveState(input: SaveOnboardingPayload) {
      return request<{ success: boolean }>("/onboarding", {
        method: "POST",
        body: JSON.stringify(input),
      });
    },
  },

  // Backwards-compatible shortcuts
  register: auth.register,
  verifyEmail: auth.verifyEmail,
  resendCode: auth.resendCode,
  login: auth.login,
  logout: auth.logout,
  requestPasswordReset: auth.requestPasswordReset,
  getCurrentUser: auth.getCurrentUser,
};
