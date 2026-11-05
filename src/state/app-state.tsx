// Global app state for the Alohomora! prototype.
// Persisted to localStorage under one key — non-sensitive preferences, profile,
// courses and progress only. Never store passwords or secrets here.
//
// Single source of truth across Dashboard, Marauder Map, Onboarding, Accio Grades,
// Potion Lab, Profile and the Comeback Codex.

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { SkillStatus } from "@/data/skills";
import { calculateCGPA, type CGPAResult, type CourseRecord } from "@/lib/cgpa";
import { api, USE_MOCK_API } from "@/lib/api";

export interface SkillEntry {
  status: SkillStatus;
  level?: number; // 0 to 4
  confidence: number; // 0–5 self-reported
  evidence: string;
}

export interface Profile {
  name: string;
  studentId: string;
  university: string;
  degree: string;
  academicYear: string;
  semester: string;
  weeklyHours: number;
  targetRole: string;
  links: string;
}

export interface AppState {
  onboarded: boolean;
  profile: Profile;
  courses: CourseRecord[];
  targetCgpa: number;
  upcomingCredits: number;
  skills: Record<string, SkillEntry>;
  bookmarks: string[];
  planDone: Record<string, boolean>;
  movesDone: Record<string, boolean>;
  panicDone: Record<string, boolean>;
  panicPlan: { course: string; examAt: string; topics: string[]; hours: number } | null;
  codexQuests: string[];
}

const STORAGE_KEY = "alohomora.v1";

import { DEFAULT_COURSES } from "@/data/courses";
export { DEFAULT_COURSES };

export const seedState: AppState = {
  onboarded: false,
  profile: {
    name: "",
    studentId: "",
    university: "",
    degree: "",
    academicYear: "",
    semester: "",
    weeklyHours: 8,
    targetRole: "",
    links: "",
  },
  courses: [],
  targetCgpa: 0,
  upcomingCredits: 0,
  skills: {},
  bookmarks: [],
  planDone: {},
  movesDone: {},
  panicDone: {},
  panicPlan: null,
  codexQuests: [],
};

interface AppContextValue {
  state: AppState;
  cgpaResult: CGPAResult;
  /** Merge-patch any part of the state. */
  update: (patch: Partial<AppState>) => void;
  setProfile: (patch: Partial<Profile>) => void;
  setSkill: (id: string, entry: SkillEntry) => void;
  addCourse: (course: Omit<CourseRecord, "id"> | CourseRecord) => void;
  updateCourse: (id: string, patch: Partial<CourseRecord>) => void;
  removeCourse: (id: string) => void;
  setCourses: (courses: CourseRecord[]) => void;
  setTargetCgpa: (target: number) => void;
  setUpcomingCredits: (credits: number) => void;
  toggleBookmark: (id: string) => void;
  toggle: (bucket: "planDone" | "movesDone" | "panicDone", id: string) => void;
  resetDemo: () => void;
}

const AppContext = createContext<AppContextValue | null>(null);

function loadStored(): AppState | null {
  // Browser-only; called from useEffect so SSR never touches window.
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<AppState>;
    return {
      ...seedState,
      ...parsed,
      profile: { ...seedState.profile, ...(parsed.profile || {}) },
      courses: Array.isArray(parsed.courses) ? parsed.courses : seedState.courses,
      skills: { ...seedState.skills, ...(parsed.skills || {}) },
    };
  } catch {
    return null;
  }
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(seedState);

  useEffect(() => {
    if (USE_MOCK_API) {
      const stored = loadStored();
      if (stored) setState(stored);
      return;
    }

    let active = true;
    async function loadBackendData() {
      try {
        const user = await api.auth.getCurrentUser();
        if (!user || !active) return;

        const [profile, courses, skills] = await Promise.all([
          api.user.getProfile().catch(() => null),
          api.courses.getCourses().catch(() => []),
          api.skills.getSkills().catch(() => ({})),
        ]);

        if (!active) return;

        setState((prev) => ({
          ...prev,
          onboarded: profile?.onboarded ?? false,
          targetCgpa: profile?.targetCgpa ?? 0,
          upcomingCredits: profile?.upcomingCredits ?? 0,
          profile: {
            name: profile?.name || user.name || "",
            studentId: profile?.studentId || user.studentId || "",
            university: profile?.university || user.university || "",
            degree: profile?.degree || "",
            academicYear: profile?.academicYear || "",
            semester: profile?.semester || "",
            weeklyHours: profile?.weeklyHours || 8,
            targetRole: profile?.targetRole || "",
            links: profile?.links || "",
          },
          courses: courses || [],
          skills: skills && typeof skills === "object" ? (skills as any) : {},
        }));
      } catch {
        // Unauthenticated or network error
      }
    }

    loadBackendData();
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (!USE_MOCK_API) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Storage can be unavailable (private mode) — the prototype still works.
    }
  }, [state]);

  const update = useCallback((patch: Partial<AppState>) => {
    setState((prev) => ({ ...prev, ...patch }));
  }, []);

  const setProfile = useCallback((patch: Partial<Profile>) => {
    setState((prev) => ({ ...prev, profile: { ...prev.profile, ...patch } }));
    if (!USE_MOCK_API) {
      api.user.updateProfile(patch).catch(() => {});
    }
  }, []);

  const setSkill = useCallback((id: string, entry: SkillEntry) => {
    setState((prev) => ({ ...prev, skills: { ...prev.skills, [id]: entry } }));
    if (!USE_MOCK_API) {
      api.skills.updateSkill(id, {
        level: entry.level,
        status: entry.status,
        confidence: entry.confidence,
        evidence: entry.evidence,
      }).catch(() => {});
    }
  }, []);

  const addCourse = useCallback((course: Omit<CourseRecord, "id"> | CourseRecord) => {
    const tempId = "id" in course && course.id ? course.id : `course-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const newCourse: CourseRecord = {
      ...course,
      id: tempId,
    };
    setState((prev) => ({
      ...prev,
      courses: [...prev.courses, newCourse],
    }));

    if (!USE_MOCK_API) {
      api.courses.addCourse({
        code: course.code,
        name: course.name,
        credits: course.credits,
        grade: course.grade,
        semester: course.semester || "Current",
        confidence: course.confidence || 3,
      }).then((saved) => {
        if (saved && saved.id) {
          setState((prev) => ({
            ...prev,
            courses: prev.courses.map((c) => (c.id === tempId ? { ...c, id: saved.id } : c)),
          }));
        }
      }).catch((e) => {
        console.error("Failed to add course to backend", e);
      });
    }
  }, []);

  const updateCourse = useCallback((id: string, patch: Partial<CourseRecord>) => {
    setState((prev) => ({
      ...prev,
      courses: prev.courses.map((c) => (c.id === id ? { ...c, ...patch } : c)),
    }));
    if (!USE_MOCK_API) {
      api.courses.updateCourse(id, patch).catch(() => {});
    }
  }, []);

  const removeCourse = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      courses: prev.courses.filter((c) => c.id !== id),
    }));
    if (!USE_MOCK_API) {
      api.courses.deleteCourse(id).catch(() => {});
    }
  }, []);

  const setCourses = useCallback((courses: CourseRecord[]) => {
    setState((prev) => ({ ...prev, courses }));
  }, []);

  const setTargetCgpa = useCallback((targetCgpa: number) => {
    setState((prev) => ({ ...prev, targetCgpa }));
    if (!USE_MOCK_API) {
      api.user.updateProfile({ targetCgpa }).catch(() => {});
    }
  }, []);

  const setUpcomingCredits = useCallback((upcomingCredits: number) => {
    setState((prev) => ({ ...prev, upcomingCredits }));
    if (!USE_MOCK_API) {
      api.user.updateProfile({ upcomingCredits }).catch(() => {});
    }
  }, []);

  const toggleBookmark = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      bookmarks: prev.bookmarks.includes(id)
        ? prev.bookmarks.filter((b) => b !== id)
        : [...prev.bookmarks, id],
    }));
  }, []);

  const toggle = useCallback(
    (bucket: "planDone" | "movesDone" | "panicDone", id: string) => {
      setState((prev) => ({
        ...prev,
        [bucket]: { ...prev[bucket], [id]: !prev[bucket][id] },
      }));
    },
    [],
  );

  const resetDemo = useCallback(() => {
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
    setState(seedState);
  }, []);

  const cgpaResult = useMemo(() => calculateCGPA(state.courses), [state.courses]);

  const value = useMemo(
    () => ({
      state,
      cgpaResult,
      update,
      setProfile,
      setSkill,
      addCourse,
      updateCourse,
      removeCourse,
      setCourses,
      setTargetCgpa,
      setUpcomingCredits,
      toggleBookmark,
      toggle,
      resetDemo,
    }),
    [
      state,
      cgpaResult,
      update,
      setProfile,
      setSkill,
      addCourse,
      updateCourse,
      removeCourse,
      setCourses,
      setTargetCgpa,
      setUpcomingCredits,
      toggleBookmark,
      toggle,
      resetDemo,
    ],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used inside <AppProvider>");
  return ctx;
}
