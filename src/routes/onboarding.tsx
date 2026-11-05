import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { api, USE_MOCK_API } from "@/lib/api";
import {
  ArrowLeft,
  ArrowRight,
  BookmarkCheck,
  Check,
  GraduationCap,
  HelpCircle,
  Plus,
  Save,
  Search,
  Sparkles,
  Star,
  Trash2,
  Wand2,
  ExternalLink,
  BookOpen,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Lock,
} from "lucide-react";
import { toast } from "sonner";

import { Owl } from "@/components/Owl";
import { LogoLockup } from "@/components/Brand";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useApp } from "@/state/app-state";
import { CAREERS, getCareer, getSkill, SKILLS, STUDY_LEVELS, type SkillDef } from "@/data/skills";
import { calculateCGPA, GRADE_OPTIONS, type CourseRecord } from "@/lib/cgpa";
import { computeSkillCoverage, LEVEL_LABELS, LEVEL_TO_STATUS } from "@/lib/coverage";
import { UNIVERSITIES } from "@/config/universities";
import {
  IUBAT_CSE_B231_CURRICULUM,
  getCoursesBySemester,
  searchCurriculumCourses,
  type CurriculumCourseItem,
} from "@/data/iubat-curriculum";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/onboarding")({
  head: () => ({
    meta: [
      { title: "Onboarding — Alohomora!" },
      {
        name: "description",
        content: "Personalized onboarding for your career readiness, academic record, and live Marauder Map.",
      },
      { property: "og:title", content: "Onboarding — Alohomora!" },
      { property: "og:description", content: "Personalized onboarding for your Marauder Map." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Onboarding,
});

const STEPS = [
  "Meet Your Owl",
  "About You",
  "Academic Record",
  "Your Skills",
  "Choose Destination",
  "Reveal Your Map",
];

export const SEMESTER_OPTIONS = [
  "1st Semester",
  "2nd Semester",
  "3rd Semester",
  "4th Semester",
  "5th Semester",
  "6th Semester",
  "7th Semester",
  "8th Semester",
  "9th Semester",
  "10th Semester",
  "11th Semester",
  "12th Semester",
] as const;

export interface SelectedSkillState {
  level: number; // 1 to 5
  hasProof: "yes" | "no" | "prefer_not";
  proofTitle: string;
  proofDescription: string;
  proofUrl: string;
}

export function Onboarding() {
  const { state, update, setProfile, setCourses, setSkill } = useApp();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);

  // Authenticated user baseline (Read-only values from account)
  const [accountEmail, setAccountEmail] = useState("");
  const [name, setName] = useState("");
  const [studentId, setStudentId] = useState("");
  const [university, setUniversity] = useState("");

  // Step 2: About You (Starts empty for newly registered students)
  const [degree, setDegree] = useState("");
  const [phone, setPhone] = useState("");
  const [academicYear, setAcademicYear] = useState("");
  const [semester, setSemester] = useState(""); // Selection required with 12 options, no default
  const [hours, setHours] = useState(8);
  const [links, setLinks] = useState("");

  // Step 3: Academic Record (One course at a time from IUBAT curriculum CSV, starts empty)
  const [courses, setLocalCourses] = useState<CourseRecord[]>([]);
  const [curriculumSearch, setCurriculumSearch] = useState("");
  const [selectedCurriculumSemester, setSelectedCurriculumSemester] = useState<number | "all">("all");
  const [activeCourseCode, setActiveCourseCode] = useState<string>("");

  // Active course editing state
  const [courseStatus, setCourseStatus] = useState<"completed" | "not_completed">("completed");
  const [courseGrade, setCourseGrade] = useState("A");
  const [courseRating, setCourseRating] = useState<number | null>(null);

  // Step 4: Skills Assessment (Catalogue first, student selects genuinely possessed skills, starts empty)
  const [assessed, setAssessed] = useState<Record<string, SelectedSkillState>>({});
  const [skillSearch, setSkillSearch] = useState("");
  const [skillCategoryFilter, setSkillCategoryFilter] = useState<string>("All");
  const [editingSkillId, setEditingSkillId] = useState<string | null>(null);

  // Skill Editor temporary form state
  const [editSkillLevel, setEditSkillLevel] = useState<number>(3);
  const [editSkillProofChoice, setEditSkillProofChoice] = useState<"yes" | "no" | "prefer_not">("prefer_not");
  const [editSkillProofTitle, setEditSkillProofTitle] = useState("");
  const [editSkillProofDesc, setEditSkillProofDesc] = useState("");
  const [editSkillProofUrl, setEditSkillProofUrl] = useState("");

  // Step 5: Destination (Target Career Role, starts empty or unselected)
  const [role, setRole] = useState("");

  const [error, setError] = useState("");

  // 1. Fetch current authenticated account info on mount
  useEffect(() => {
    let mounted = true;
    async function loadAccountData() {
      try {
        const user = await api.auth.getCurrentUser();
        if (user && mounted) {
          setName(user.name || "");
          setStudentId(user.studentId || "");
          setAccountEmail(user.email || "");
          setUniversity(user.university || "");
        }
      } catch (err) {
        console.error("Could not fetch current user in onboarding", err);
      }

      // Check if user already had saved draft progress on the server
      if (!USE_MOCK_API) {
        try {
          const saved = await api.onboarding.getState();
          if (saved && mounted) {
            if (saved.profile?.degree) setDegree(saved.profile.degree);
            if (saved.profile?.academicYear) setAcademicYear(saved.profile.academicYear);
            if (saved.profile?.semester) setSemester(saved.profile.semester);
            if (saved.profile?.weeklyHours) setHours(saved.profile.weeklyHours);
            if (saved.profile?.targetRole) setRole(saved.profile.targetRole);
            if (saved.profile?.links) setLinks(saved.profile.links);
            if (saved.courses && saved.courses.length > 0) {
              setLocalCourses(saved.courses);
            }
            if (saved.skills && Object.keys(saved.skills).length > 0) {
              const mapped: Record<string, SelectedSkillState> = {};
              for (const [id, sk] of Object.entries(saved.skills)) {
                mapped[id] = {
                  level: sk.level || 1,
                  hasProof: sk.evidence ? "yes" : "prefer_not",
                  proofTitle: "",
                  proofDescription: "",
                  proofUrl: sk.evidence || "",
                };
              }
              setAssessed(mapped);
            }
          }
        } catch {
          // New student, draft empty
        }
      }
    }

    loadAccountData();
    return () => {
      mounted = false;
    };
  }, []);

  // Update suggested courses semester filter when student selects their current semester
  useEffect(() => {
    if (semester) {
      const match = semester.match(/(\d+)/);
      if (match && match[1]) {
        const semNum = parseInt(match[1], 10);
        if (semNum >= 1 && semNum <= 11) {
          setSelectedCurriculumSemester(semNum);
          const semCourses = getCoursesBySemester(semNum);
          if (semCourses[0] && !activeCourseCode) {
            loadCourseIntoEditor(semCourses[0]);
          }
        }
      }
    }
  }, [semester]);

  // Derived CGPA from local courses (zero-credit courses excluded, not_completed excluded)
  const calculatedCgpa = useMemo(() => calculateCGPA(courses), [courses]);

  // Filtered curriculum courses based on search & semester filter
  const displayedCurriculum = useMemo(() => {
    let list = IUBAT_CSE_B231_CURRICULUM;
    if (selectedCurriculumSemester !== "all") {
      list = list.filter((c) => c.semester === selectedCurriculumSemester);
    }
    if (curriculumSearch.trim()) {
      const q = curriculumSearch.trim().toLowerCase();
      list = list.filter(
        (c) =>
          c.code.toLowerCase().includes(q) ||
          c.name.toLowerCase().includes(q) ||
          c.description.toLowerCase().includes(q)
      );
    }
    return list;
  }, [selectedCurriculumSemester, curriculumSearch]);

  // Active course item from curriculum
  const activeCurriculumCourse = useMemo(() => {
    if (!activeCourseCode) {
      return displayedCurriculum[0] || IUBAT_CSE_B231_CURRICULUM[0];
    }
    return IUBAT_CSE_B231_CURRICULUM.find((c) => c.code === activeCourseCode) || displayedCurriculum[0] || IUBAT_CSE_B231_CURRICULUM[0];
  }, [activeCourseCode, displayedCurriculum]);

  // When a course is selected from the curriculum
  function loadCourseIntoEditor(course: CurriculumCourseItem) {
    setActiveCourseCode(course.code);
    const existing = courses.find((c) => c.code.toUpperCase() === course.code.toUpperCase());
    if (existing) {
      setCourseStatus(existing.status === "not_completed" ? "not_completed" : "completed");
      setCourseGrade(existing.grade || "A");
      setCourseRating(existing.rating ?? existing.confidence ?? null);
    } else {
      setCourseStatus("completed");
      setCourseGrade("A");
      setCourseRating(null);
    }
  }

  // Handle adding or updating course in the student's academic record
  function handleSaveActiveCourse() {
    if (!activeCurriculumCourse) return;

    if (courseStatus === "completed" && !courseGrade) {
      toast.error("Please select a letter grade for the completed course.");
      return;
    }

    const courseRecord: CourseRecord = {
      id: `course-${activeCurriculumCourse.code.replace(/\s+/g, "-")}`,
      code: activeCurriculumCourse.code,
      name: activeCurriculumCourse.name,
      credits: activeCurriculumCourse.credits,
      semester: `${activeCurriculumCourse.semester}th Semester`,
      status: courseStatus,
      grade: courseStatus === "completed" ? courseGrade : "",
      confidence: courseRating || 3,
      rating: courseRating || undefined,
    };

    setLocalCourses((prev) => {
      const filtered = prev.filter((c) => c.code.toUpperCase() !== courseRecord.code.toUpperCase());
      return [...filtered, courseRecord];
    });

    toast.success(
      courseStatus === "completed"
        ? `Added ${courseRecord.code} (${courseGrade}) to your academic record. ✦`
        : `Recorded ${courseRecord.code} as Not Completed.`
    );
  }

  function handleRemoveCourse(code: string) {
    setLocalCourses((prev) => prev.filter((c) => c.code.toUpperCase() !== code.toUpperCase()));
    toast.info(`Removed ${code} from your academic record.`);
  }

  // Skill Editor helpers
  function openSkillEditor(skill: SkillDef) {
    setEditingSkillId(skill.id);
    const existing = assessed[skill.id];
    if (existing) {
      setEditSkillLevel(existing.level);
      setEditSkillProofChoice(existing.hasProof);
      setEditSkillProofTitle(existing.proofTitle);
      setEditSkillProofDesc(existing.proofDescription);
      setEditSkillProofUrl(existing.proofUrl);
    } else {
      setEditSkillLevel(3);
      setEditSkillProofChoice("prefer_not");
      setEditSkillProofTitle("");
      setEditSkillProofDesc("");
      setEditSkillProofUrl("");
    }
  }

  function handleSaveSkill() {
    if (!editingSkillId) return;

    const newSkillState: SelectedSkillState = {
      level: editSkillLevel,
      hasProof: editSkillProofChoice,
      proofTitle: editSkillProofChoice === "yes" ? editSkillProofTitle.trim() : "",
      proofDescription: editSkillProofChoice === "yes" ? editSkillProofDesc.trim() : "",
      proofUrl: editSkillProofChoice === "yes" ? editSkillProofUrl.trim() : "",
    };

    setAssessed((prev) => ({
      ...prev,
      [editingSkillId]: newSkillState,
    }));

    setEditingSkillId(null);
    toast.success(`Skill saved to your profile! ✦`);
  }

  function handleRemoveSkill(skillId: string) {
    setAssessed((prev) => {
      const next = { ...prev };
      delete next[skillId];
      return next;
    });
    setEditingSkillId(null);
    toast.info("Skill removed from your profile.");
  }

  // Derived Coverage for selected role based STRICTLY on student's selected skills
  const coveragePreview = useMemo(() => {
    if (!role) {
      return { percentage: 0, matched: 0, total: 0, details: [] };
    }
    const career = getCareer(role);
    const convertedAssessed: Record<string, { level: number; evidence: string; confidence: number }> = {};
    for (const [id, s] of Object.entries(assessed)) {
      convertedAssessed[id] = {
        level: s.level,
        evidence: s.proofUrl || s.proofTitle || "",
        confidence: s.level,
      };
    }
    return computeSkillCoverage(career.required, convertedAssessed);
  }, [role, assessed]);

  // Sync to global app state
  function syncStateToStore() {
    setProfile({
      name: name.trim() || "Student",
      studentId: studentId.trim(),
      university: university.trim(),
      degree: degree.trim(),
      academicYear,
      semester,
      weeklyHours: hours,
      targetRole: role,
      links,
    });
    setCourses(courses);
    for (const [id, s] of Object.entries(assessed)) {
      const status = s.level >= 4 ? "demonstrated" : s.level > 1 ? "developing" : "missing";
      setSkill(id, {
        status,
        level: s.level,
        confidence: s.level,
        evidence: s.proofUrl || s.proofTitle || "",
      });
    }
  }

  async function handleSaveAndContinueLater() {
    syncStateToStore();
    if (!USE_MOCK_API) {
      try {
        await api.onboarding.saveState({
          name: name.trim() || undefined,
          studentId: studentId.trim() || undefined,
          university: university || undefined,
          degree: degree.trim() || undefined,
          academicYear: academicYear || undefined,
          semester: semester || undefined,
          weeklyHours: hours,
          targetRole: role || undefined,
          links: links || undefined,
          courses: courses.map((c) => ({
            code: c.code,
            name: c.name,
            credits: c.credits,
            grade: c.grade,
            semester: c.semester,
            confidence: c.confidence,
          })),
          skills: Object.fromEntries(
            Object.entries(assessed).map(([k, v]) => [
              k,
              {
                level: v.level,
                evidence: v.proofUrl || v.proofTitle || "",
                confidence: v.level,
              },
            ])
          ),
          finish: false,
        });
      } catch (e) {
        console.error("Failed to persist onboarding state", e);
      }
    }
    toast.success("Progress safely preserved in your parchment. Return any time! ✦");
    navigate({ to: "/dashboard" });
  }

  function next() {
    setError("");
    if (step === 1) {
      // Step 2: About You validation
      if (!semester) {
        setError("Please select your current semester before continuing.");
        return;
      }
      if (!degree.trim()) {
        setError("Please enter or select your department / degree program.");
        return;
      }
    }
    if (step === 4 && !role) {
      setError("Please choose a target career destination to calibrate your Marauder Map.");
      return;
    }

    syncStateToStore();
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  }

  function prev() {
    setError("");
    setStep((s) => Math.max(s - 1, 0));
  }

  async function finish() {
    syncStateToStore();
    update({ onboarded: true });
    if (!USE_MOCK_API) {
      try {
        await api.onboarding.saveState({
          name: name.trim() || undefined,
          studentId: studentId.trim() || undefined,
          university: university || undefined,
          degree: degree.trim() || undefined,
          academicYear: academicYear || undefined,
          semester: semester || undefined,
          weeklyHours: hours,
          targetRole: role || undefined,
          links: links || undefined,
          courses: courses.map((c) => ({
            code: c.code,
            name: c.name,
            credits: c.credits,
            grade: c.grade,
            semester: c.semester,
            confidence: c.confidence,
          })),
          skills: Object.fromEntries(
            Object.entries(assessed).map(([k, v]) => [
              k,
              {
                level: v.level,
                evidence: v.proofUrl || v.proofTitle || "",
                confidence: v.level,
              },
            ])
          ),
          finish: true,
        });
      } catch (e) {
        console.error("Failed to save final onboarding state", e);
      }
    }
    toast.success("The grand gates of Alohomora Academy open! Your Marauder Map is live. ✦");
    navigate({ to: "/map" });
  }

  const activeEditingSkillDef = useMemo(() => {
    return editingSkillId ? getSkill(editingSkillId) : null;
  }, [editingSkillId]);

  return (
    <div className="plum-panel min-h-screen">
      <div className="mx-auto flex min-h-screen max-w-4xl flex-col px-4 py-8 sm:px-6">
        {/* Top bar with branding and Save Later */}
        <header className="flex items-center justify-between border-b border-gold/15 pb-4">
          <LogoLockup size={32} wordmarkClassName="text-lg text-cream" />
          <div className="flex items-center gap-3">
            <button
              onClick={handleSaveAndContinueLater}
              className="flex items-center gap-1.5 rounded-lg border border-gold-muted/40 bg-card/10 px-3 py-1.5 text-xs font-semibold text-gold transition-colors hover:bg-gold/20"
            >
              <Save className="size-3.5" /> Save & Continue Later
            </button>
            <button
              onClick={() => navigate({ to: "/" })}
              className="text-xs text-lavender/80 underline-offset-4 hover:underline"
            >
              Exit
            </button>
          </div>
        </header>

        {/* 6-Step Progress Indicator */}
        <nav aria-label="Onboarding Progress" className="mt-6">
          <ol className="flex items-center gap-1.5 sm:gap-2">
            {STEPS.map((s, i) => (
              <li key={s} className="flex flex-1 flex-col gap-1.5">
                <div
                  className={cn(
                    "h-2 rounded-full transition-all duration-300",
                    i < step
                      ? "bg-gold"
                      : i === step
                        ? "bg-gold shadow-[0_0_8px_rgba(235,203,122,0.8)]"
                        : "bg-lavender/25",
                  )}
                  aria-hidden
                />
                <span
                  className={cn(
                    "truncate text-[10px] leading-tight hidden sm:block",
                    i === step ? "font-bold text-gold" : i < step ? "text-cream/90" : "text-lavender/50",
                  )}
                >
                  {i + 1}. {s}
                </span>
              </li>
            ))}
          </ol>
        </nav>

        {/* Main Step Container */}
        <main className="mt-6 flex flex-1 flex-col rounded-3xl border border-gold/25 bg-card p-6 text-foreground shadow-magic sm:p-8">
          {/* STEP 1: Meet Your Owl */}
          {step === 0 && (
            <div className="flex flex-1 flex-col items-center justify-center text-center py-6">
              <Owl size={140} className="animate-bob" />
              <h1 className="mt-5 font-display text-2xl font-bold tracking-wide text-foreground sm:text-3xl">
                Welcome to Alohomora<span className="text-gold-muted">!</span>
              </h1>
              <p className="mt-3 max-w-lg text-sm leading-relaxed text-muted-foreground">
                I'm your <strong className="text-foreground">Keykeeper Owl</strong>. Your degree shows what you studied. Let's map what you can prove. It only takes a few minutes, and you can save and continue any time.
              </p>
            </div>
          )}

          {/* STEP 2: About You */}
          {step === 1 && (
            <div className="flex-1 space-y-6">
              <div>
                <h1 className="font-display text-2xl font-bold tracking-wide text-foreground">
                  About You
                </h1>
                <p className="mt-1 text-xs text-muted-foreground">
                  Your identity is anchored to your authenticated student account. All academic preferences start empty.
                </p>
              </div>

              {/* Account Fields (Read-Only from registration) */}
              <div className="rounded-2xl border border-gold-muted/30 bg-gold/5 p-4">
                <div className="flex items-center gap-2 text-xs font-bold text-gold uppercase tracking-wider mb-3">
                  <Lock className="size-3.5" />
                  <span>Account Information (from your registration � read-only)</span>
                </div>
                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">Full Name</Label>
                    <Input
                      value={name}
                      readOnly
                      disabled
                      className="bg-background/80 font-semibold cursor-not-allowed text-foreground"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">Student ID</Label>
                    <Input
                      value={studentId}
                      readOnly
                      disabled
                      className="bg-background/80 font-mono font-semibold cursor-not-allowed text-foreground"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">University Email</Label>
                    <Input
                      value={accountEmail}
                      readOnly
                      disabled
                      className="bg-background/80 font-mono text-xs cursor-not-allowed text-foreground"
                    />
                  </div>
                </div>
              </div>

              {/* Personal & Academic Details */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5 sm:col-span-2">
                  <Label htmlFor="ob-uni" className="text-foreground font-semibold">University</Label>
                  <Select value={university} onValueChange={setUniversity}>
                    <SelectTrigger id="ob-uni" className="w-full bg-card text-foreground">
                      <SelectValue placeholder="Select your university" />
                    </SelectTrigger>
                    <SelectContent>
                      {UNIVERSITIES.map((u) => (
                        <SelectItem key={u.name} value={u.name}>
                          {u.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="ob-degree" className="text-foreground font-semibold">
                    Department / Academic Program <span className="text-gold">*</span>
                  </Label>
                  <Input
                    id="ob-degree"
                    value={degree}
                    onChange={(e) => setDegree(e.target.value)}
                    placeholder="e.g. B.Sc. in Computer Science and Engineering"
                    className="bg-card text-foreground"
                  />
                  <p className="text-[11px] text-muted-foreground">Your undergraduate program (e.g. CSE, SE, EEE).</p>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="ob-phone" className="text-foreground font-semibold">
                    Phone Number (Optional)
                  </Label>
                  <Input
                    id="ob-phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="e.g. +880 1700 000000"
                    className="bg-card text-foreground"
                  />
                </div>

                <div className="space-y-1.5 sm:col-span-2">
                  <Label htmlFor="ob-year" className="text-foreground font-semibold">Academic Year</Label>
                  <Select value={academicYear} onValueChange={setAcademicYear}>
                    <SelectTrigger id="ob-year" className="w-full bg-card text-foreground">
                      <SelectValue placeholder="Select your academic standing (Optional)" />
                    </SelectTrigger>
                    <SelectContent>
                      {STUDY_LEVELS.map((lvl) => (
                        <SelectItem key={lvl} value={lvl}>
                          {lvl}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* CURRENT SEMESTER: 12 Selection Options */}
                <div className="space-y-2 sm:col-span-2 pt-2 border-t border-border">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-bold text-foreground">
                      Current Semester <span className="text-gold">*</span>
                    </Label>
                    <span className="text-xs text-muted-foreground">
                      {semester ? (
                        <span className="text-gold font-bold">{semester} selected</span>
                      ) : (
                        <span className="text-amber-500 font-semibold">Required — select one</span>
                      )}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Select your active semester. We will suggest curriculum courses from this semester to build your record.
                  </p>

                  <div
                    role="radiogroup"
                    aria-label="Current Semester Selection"
                    className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 pt-1"
                  >
                    {SEMESTER_OPTIONS.map((semOption) => {
                      const isSelected = semester === semOption;
                      return (
                        <button
                          key={semOption}
                          type="button"
                          role="radio"
                          aria-checked={isSelected}
                          onClick={() => setSemester(semOption)}
                          className={cn(
                            "rounded-xl border py-2.5 px-3 text-xs font-semibold transition-all text-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold",
                            isSelected
                              ? "border-gold bg-gold text-plum-950 font-bold shadow-[0_0_12px_rgba(235,203,122,0.6)] ring-1 ring-gold scale-[1.02]"
                              : "border-border bg-card/60 text-foreground hover:border-gold/40 hover:bg-gold/5"
                          )}
                        >
                          {semOption}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="space-y-1.5 sm:col-span-2 pt-2">
                  <div className="flex justify-between items-center">
                    <Label htmlFor="ob-hours" className="text-foreground font-semibold">Weekly Learning Goal</Label>
                    <span className="text-xs font-bold text-gold-muted bg-gold/15 px-2 py-0.5 rounded border border-gold-muted/30">
                      {hours} hrs / week
                    </span>
                  </div>
                  <Slider
                    id="ob-hours"
                    value={[hours]}
                    onValueChange={(v) => setHours(v[0] ?? hours)}
                    min={1}
                    max={20}
                    step={1}
                    className="mt-2"
                  />
                </div>

                <div className="space-y-1.5 sm:col-span-2">
                  <Label htmlFor="ob-links" className="text-foreground font-semibold">Portfolio / GitHub link (Optional)</Label>
                  <Input
                    id="ob-links"
                    value={links}
                    onChange={(e) => setLinks(e.target.value)}
                    placeholder="https://github.com/your-username"
                    className="bg-card text-foreground"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Academic Record — One Course at a Time */}
          {step === 2 && (
            <div className="flex-1 space-y-6">
              {/* Header with live calculated CGPA */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4">
                <div>
                  <h1 className="font-display text-2xl font-bold tracking-wide text-foreground">
                    Academic Record
                  </h1>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    Review and add your courses one by one from the official IUBAT B231 CSE curriculum catalogue.
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="rounded-xl border border-gold-muted/40 bg-gold/10 px-3.5 py-1.5 text-right">
                    <span className="block text-[10px] text-muted-foreground uppercase font-bold tracking-wider">
                      Computed CGPA
                    </span>
                    <span className="font-display text-lg font-bold text-foreground">
                      {calculatedCgpa.totalCredits > 0 ? calculatedCgpa.cgpa.toFixed(2) : "0.00"}
                      <span className="text-xs text-muted-foreground font-normal"> / 4.00</span>
                    </span>
                  </div>
                  <div className="rounded-xl border border-border bg-background px-3 py-1.5 text-right">
                    <span className="block text-[10px] text-muted-foreground uppercase font-bold tracking-wider">
                      Total Credits
                    </span>
                    <span className="font-display text-base font-bold text-foreground">
                      {calculatedCgpa.totalCredits} cr
                    </span>
                  </div>
                </div>
              </div>

              {/* Note on grading & non-verified skills */}
              <div className="rounded-xl border border-gold-muted/30 bg-gold/10 p-3 text-xs text-foreground flex items-start gap-2.5">
                <GraduationCap className="size-4 text-gold-muted mt-0.5 shrink-0" />
                <p>
                  <strong>Note on course records:</strong> Course grades help map subjects you have studied. They are never treated as demonstrated professional skills without portfolio evidence. Zero-credit courses (such as ART 103 or ELP 002) are recorded but excluded from credit-weighted CGPA.
                </p>
              </div>

              {/* Catalogue Search & Semester Filter */}
              <div className="space-y-2">
                <div className="flex flex-col sm:flex-row gap-2 justify-between items-start sm:items-center">
                  <div className="relative w-full sm:w-72">
                    <Search className="absolute left-2.5 top-2.5 size-3.5 text-muted-foreground" />
                    <Input
                      value={curriculumSearch}
                      onChange={(e) => setCurriculumSearch(e.target.value)}
                      placeholder="Search code or title (e.g. CSC 183, Algorithms)..."
                      className="pl-8 h-8 text-xs bg-card"
                    />
                  </div>
                  <div className="flex items-center gap-1 overflow-x-auto max-w-full pb-1 text-xs">
                    <span className="text-[11px] text-muted-foreground mr-1 whitespace-nowrap">Filter:</span>
                    <button
                      type="button"
                      onClick={() => setSelectedCurriculumSemester("all")}
                      className={cn(
                        "px-2 py-0.5 rounded text-[11px] font-semibold transition-colors whitespace-nowrap",
                        selectedCurriculumSemester === "all"
                          ? "bg-gold text-plum-950 font-bold"
                          : "bg-card border border-border text-muted-foreground hover:text-foreground"
                      )}
                    >
                      All (59)
                    </button>
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setSelectedCurriculumSemester(s)}
                        className={cn(
                          "px-2 py-0.5 rounded text-[11px] font-semibold transition-colors whitespace-nowrap",
                          selectedCurriculumSemester === s
                            ? "bg-gold text-plum-950 font-bold"
                            : "bg-card border border-border text-muted-foreground hover:text-foreground"
                        )}
                      >
                        Sem {s}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Suggested course chips */}
                <div className="flex items-center gap-1.5 overflow-x-auto py-1 text-xs">
                  <span className="text-[11px] text-muted-foreground font-semibold whitespace-nowrap">
                    Suggested Courses:
                  </span>
                  {displayedCurriculum.slice(0, 8).map((c) => {
                    const isAdded = courses.some((added) => added.code.toUpperCase() === c.code.toUpperCase());
                    const isActive = activeCurriculumCourse?.code === c.code;
                    return (
                      <button
                        key={c.code}
                        type="button"
                        onClick={() => loadCourseIntoEditor(c)}
                        className={cn(
                          "rounded-lg px-2.5 py-1 text-xs font-mono font-bold transition-all whitespace-nowrap flex items-center gap-1",
                          isActive
                            ? "border border-gold bg-gold text-plum-950 shadow-sm"
                            : isAdded
                              ? "border border-emerald-600/40 bg-emerald-500/10 text-emerald-400"
                              : "border border-border bg-card text-foreground hover:border-gold/40"
                        )}
                      >
                        {c.code}
                        {isAdded && <Check className="size-3 text-emerald-400" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* INDIVIDUAL COURSE CARD: ONE COURSE AT A TIME */}
              {activeCurriculumCourse && (
                <div className="rounded-2xl border-2 border-gold/30 bg-card p-5 space-y-4 shadow-md">
                  <div className="flex flex-wrap items-start justify-between gap-2 border-b border-border pb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-base font-extrabold text-gold">
                          {activeCurriculumCourse.code}
                        </span>
                        <span className="rounded-full bg-gold/15 border border-gold-muted/30 px-2.5 py-0.5 text-[10px] font-bold text-gold uppercase">
                          Semester {activeCurriculumCourse.semester}
                        </span>
                        <span className="rounded-full bg-border px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">
                          {activeCurriculumCourse.credits} Credit Hours
                        </span>
                      </div>
                      <h2 className="text-base font-bold text-foreground mt-1">
                        {activeCurriculumCourse.name}
                      </h2>
                    </div>

                    {courses.some((c) => c.code.toUpperCase() === activeCurriculumCourse.code.toUpperCase()) && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 px-2.5 py-1 text-xs font-bold text-emerald-400">
                        <CheckCircle2 className="size-3.5" /> In Academic Record
                      </span>
                    )}
                  </div>

                  {activeCurriculumCourse.description && (
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {activeCurriculumCourse.description}
                    </p>
                  )}

                  {/* Course Completion & Grade Controls */}
                  <div className="grid gap-4 sm:grid-cols-3 pt-2">
                    {/* A. Completion Status (Required) */}
                    <div className="space-y-1.5">
                      <Label className="text-xs font-bold text-foreground">
                        A. Completion Status <span className="text-gold">*</span>
                      </Label>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => setCourseStatus("completed")}
                          className={cn(
                            "rounded-xl border py-2 text-xs font-bold transition-all text-center",
                            courseStatus === "completed"
                              ? "border-emerald-500 bg-emerald-500 text-white shadow-sm"
                              : "border-border bg-background text-muted-foreground hover:text-foreground"
                          )}
                        >
                          Completed
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setCourseStatus("not_completed");
                            setCourseGrade("");
                          }}
                          className={cn(
                            "rounded-xl border py-2 text-xs font-bold transition-all text-center",
                            courseStatus === "not_completed"
                              ? "border-amber-500 bg-amber-500 text-white shadow-sm"
                              : "border-border bg-background text-muted-foreground hover:text-foreground"
                          )}
                        >
                          Not completed
                        </button>
                      </div>
                    </div>

                    {/* B. Grade Selector (Required if completed, disabled if not completed) */}
                    <div className="space-y-1.5">
                      <Label className="text-xs font-bold text-foreground">
                        B. Academic Grade {courseStatus === "completed" && <span className="text-gold">*</span>}
                      </Label>
                      {courseStatus === "completed" ? (
                        <Select value={courseGrade} onValueChange={setCourseGrade}>
                          <SelectTrigger className="h-9 text-xs bg-background text-foreground font-semibold">
                            <SelectValue placeholder="Select Grade" />
                          </SelectTrigger>
                          <SelectContent>
                            {GRADE_OPTIONS.map((g) => (
                              <SelectItem key={g.letter} value={g.letter} className="text-xs">
                                {g.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <div className="h-9 rounded-md border border-dashed border-border bg-background/50 px-3 flex items-center text-xs text-muted-foreground italic">
                          No grade (Not completed)
                        </div>
                      )}
                    </div>

                    {/* C. Personal Course Rating (Optional) */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <Label className="text-xs font-bold text-foreground">
                          C. Personal Rating <span className="text-muted-foreground font-normal">(Optional)</span>
                        </Label>
                        {courseRating && (
                          <button
                            type="button"
                            onClick={() => setCourseRating(null)}
                            className="text-[10px] text-muted-foreground hover:underline"
                          >
                            Clear
                          </button>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5 h-9 px-2 rounded-md border border-border bg-background">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setCourseRating(star)}
                            className="p-1 hover:scale-110 transition-transform"
                            aria-label={`Rate ${star} stars`}
                          >
                            <Star
                              className={cn(
                                "size-4",
                                (courseRating ?? 0) >= star
                                  ? "fill-gold text-gold"
                                  : "text-muted-foreground/40"
                              )}
                            />
                          </button>
                        ))}
                        <span className="text-[11px] text-muted-foreground ml-1">
                          {courseRating ? `${courseRating}/5` : "Unrated"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Course Card Action Buttons */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-border">
                    <Button
                      type="button"
                      onClick={handleSaveActiveCourse}
                      className="font-bold btn-sparkle"
                    >
                      <Plus className="size-4 mr-1.5" />
                      {courses.some((c) => c.code.toUpperCase() === activeCurriculumCourse.code.toUpperCase())
                        ? `Update ${activeCurriculumCourse.code} in Record`
                        : `Add ${activeCurriculumCourse.code} to Record`}
                    </Button>

                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const idx = displayedCurriculum.findIndex((c) => c.code === activeCurriculumCourse.code);
                          if (idx > 0) loadCourseIntoEditor(displayedCurriculum[idx - 1]!);
                        }}
                        disabled={displayedCurriculum.findIndex((c) => c.code === activeCurriculumCourse.code) <= 0}
                        className="text-xs"
                      >
                        ← Prev Course
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const idx = displayedCurriculum.findIndex((c) => c.code === activeCurriculumCourse.code);
                          if (idx >= 0 && idx < displayedCurriculum.length - 1) {
                            loadCourseIntoEditor(displayedCurriculum[idx + 1]!);
                          }
                        }}
                        disabled={displayedCurriculum.findIndex((c) => c.code === activeCurriculumCourse.code) >= displayedCurriculum.length - 1}
                        className="text-xs"
                      >
                        Next Course →
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* Student's Added Courses Summary Tray */}
              <div className="space-y-2 pt-2">
                <div className="flex justify-between items-center">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Your Added Academic Record ({courses.length})
                  </h3>
                  <span className="text-xs text-muted-foreground">
                    Explicitly added courses only
                  </span>
                </div>

                {courses.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-border p-6 text-center text-xs text-muted-foreground">
                    No courses added to your record yet. Select a course from the curriculum suggestions above and click "Add to Record".
                  </div>
                ) : (
                  <div className="grid gap-2 sm:grid-cols-2 max-h-60 overflow-y-auto pr-1">
                    {courses.map((c) => (
                      <div
                        key={c.code}
                        className="flex items-center justify-between rounded-xl border border-border bg-background p-3 text-xs transition-colors hover:border-gold-muted/40"
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-gold font-mono">{c.code}</span>
                            <span className="text-foreground truncate font-medium">{c.name}</span>
                          </div>
                          <div className="flex items-center gap-2 mt-1 text-[11px] text-muted-foreground">
                            <span>{c.credits} cr</span>
                            <span>•</span>
                            {c.status === "completed" ? (
                              <span className="text-emerald-400 font-bold">Grade: {c.grade}</span>
                            ) : (
                              <span className="text-amber-400 font-semibold">Not completed</span>
                            )}
                            {c.rating && (
                              <>
                                <span>•</span>
                                <span className="flex items-center gap-0.5 text-gold">
                                  <Star className="size-3 fill-gold" /> {c.rating}/5
                                </span>
                              </>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-1 ml-2 shrink-0">
                          <button
                            type="button"
                            onClick={() => {
                              const found = IUBAT_CSE_B231_CURRICULUM.find((item) => item.code.toUpperCase() === c.code.toUpperCase());
                              if (found) loadCourseIntoEditor(found);
                            }}
                            className="text-xs text-gold hover:underline p-1"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRemoveCourse(c.code)}
                            className="text-muted-foreground hover:text-destructive p-1 rounded"
                            aria-label={`Remove course ${c.code}`}
                          >
                            <Trash2 className="size-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* STEP 4: Your Skills — Catalogue First, Personal Selection Second */}
          {step === 3 && (
            <div className="flex-1 space-y-5">
              <div>
                <h1 className="font-display text-2xl font-bold tracking-wide text-foreground">
                  Your Skills
                </h1>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Browse the skill catalogue and select only the skills you genuinely possess. All skills start unselected.
                </p>
              </div>

              {/* Selected Skills Tray */}
              <div className="rounded-2xl border border-gold-muted/30 bg-gold/5 p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <h2 className="text-xs font-bold uppercase tracking-wider text-gold">
                    Your Selected Skills ({Object.keys(assessed).length})
                  </h2>
                  <span className="text-xs text-muted-foreground">
                    Only selected skills will be saved to your profile
                  </span>
                </div>

                {Object.keys(assessed).length === 0 ? (
                  <p className="text-xs text-muted-foreground italic py-1">
                    No skills selected yet. Search or browse the catalogue below to add your genuine skills.
                  </p>
                ) : (
                  <div className="flex flex-wrap gap-2 pt-1">
                    {Object.entries(assessed).map(([id, item]) => {
                      const def = getSkill(id);
                      if (!def) return null;
                      return (
                        <div
                          key={id}
                          className="flex items-center gap-2 rounded-xl border border-gold-muted/40 bg-card px-3 py-1.5 text-xs"
                        >
                          <div>
                            <span className="font-bold text-foreground">{def.name}</span>
                            <span className="text-[11px] text-gold-muted ml-1.5">
                              Level {item.level}/5
                            </span>
                            {item.hasProof === "yes" && (
                              <span className="ml-1.5 rounded bg-emerald-500/20 text-emerald-400 px-1 py-0.2 text-[10px] font-semibold">
                                Proof attached
                              </span>
                            )}
                          </div>
                          <button
                            type="button"
                            onClick={() => openSkillEditor(def)}
                            className="text-gold hover:underline text-[11px] ml-1"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRemoveSkill(id)}
                            className="text-muted-foreground hover:text-destructive p-0.5"
                          >
                            <Trash2 className="size-3" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* ACTIVE SKILL EDITOR PANEL / MODAL */}
              {activeEditingSkillDef && (
                <div className="rounded-2xl border-2 border-gold bg-card p-5 space-y-4 shadow-magic animate-in fade-in-50">
                  <div className="flex items-start justify-between gap-3 border-b border-border pb-3">
                    <div>
                      <span className="rounded-full bg-gold/15 px-2 py-0.5 text-[10px] font-bold text-gold uppercase tracking-wider">
                        {activeEditingSkillDef.category}
                      </span>
                      <h2 className="text-lg font-bold text-foreground mt-1">
                        {activeEditingSkillDef.name}
                      </h2>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {activeEditingSkillDef.why}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setEditingSkillId(null)}
                      className="text-muted-foreground hover:text-foreground text-xs"
                    >
                      Close ✕
                    </button>
                  </div>

                  {/* 1. Skill Self-Assessment Rating (1-5) */}
                  <div className="space-y-2">
                    <Label className="text-xs font-bold text-foreground">
                      Self-Assessed Proficiency Rating (1 to 5) <span className="text-gold">*</span>
                    </Label>
                    <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
                      {[
                        { lvl: 1, label: "1: Beginner", desc: "Foundational theory" },
                        { lvl: 2, label: "2: Developing", desc: "Basic hands-on tasks" },
                        { lvl: 3, label: "3: Competent", desc: "Builds independently" },
                        { lvl: 4, label: "4: Advanced", desc: "Solves complex bugs" },
                        { lvl: 5, label: "5: Expert", desc: "Production mastery" },
                      ].map((item) => {
                        const isChosen = editSkillLevel === item.lvl;
                        return (
                          <button
                            key={item.lvl}
                            type="button"
                            onClick={() => setEditSkillLevel(item.lvl)}
                            className={cn(
                              "rounded-xl border p-2.5 text-left transition-all",
                              isChosen
                                ? "border-gold bg-gold text-plum-950 font-bold shadow-sm"
                                : "border-border bg-background hover:border-gold/30 text-foreground"
                            )}
                          >
                            <span className="block text-xs font-bold">{item.label}</span>
                            <span className={cn("block text-[10px]", isChosen ? "text-plum-900" : "text-muted-foreground")}>
                              {item.desc}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                    <p className="text-[11px] text-amber-400/90 font-medium pt-1">
                      * Note: This is your self-assessment, not an independently evaluated skill level.
                    </p>
                  </div>

                  {/* 2. Optional Proof of Skill */}
                  <div className="space-y-3 pt-2 border-t border-border">
                    <Label className="text-xs font-bold text-foreground">
                      Do you have a project or demo that demonstrates this skill?
                    </Label>
                    <div className="flex flex-wrap gap-2">
                      {[
                        { key: "yes", label: "Yes, I have proof" },
                        { key: "no", label: "No project yet" },
                        { key: "prefer_not", label: "Prefer not to add evidence now" },
                      ].map((choice) => (
                        <button
                          key={choice.key}
                          type="button"
                          onClick={() => setEditSkillProofChoice(choice.key as any)}
                          className={cn(
                            "rounded-lg border px-3 py-1.5 text-xs font-semibold transition-all",
                            editSkillProofChoice === choice.key
                              ? "border-gold bg-gold/20 text-gold font-bold"
                              : "border-border bg-background text-muted-foreground hover:text-foreground"
                          )}
                        >
                          {choice.label}
                        </button>
                      ))}
                    </div>

                    {editSkillProofChoice === "yes" && (
                      <div className="space-y-2.5 rounded-xl border border-border bg-background/50 p-3.5 animate-in fade-in-50">
                        <div>
                          <Label className="text-[11px] font-semibold text-foreground">Project / Demo Title (Optional)</Label>
                          <Input
                            value={editSkillProofTitle}
                            onChange={(e) => setEditSkillProofTitle(e.target.value)}
                            placeholder="e.g. Student Management REST API"
                            className="h-8 text-xs bg-card"
                          />
                        </div>
                        <div>
                          <Label className="text-[11px] font-semibold text-foreground">Description (Optional)</Label>
                          <Input
                            value={editSkillProofDesc}
                            onChange={(e) => setEditSkillProofDesc(e.target.value)}
                            placeholder="e.g. Built with Express and MySQL, includes JWT authentication"
                            className="h-8 text-xs bg-card"
                          />
                        </div>
                        <div>
                          <Label className="text-[11px] font-semibold text-foreground">Project / GitHub URL (Optional)</Label>
                          <Input
                            value={editSkillProofUrl}
                            onChange={(e) => setEditSkillProofUrl(e.target.value)}
                            placeholder="https://github.com/your-username/project"
                            className="h-8 text-xs bg-card"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-2 border-t border-border">
                    <div>
                      {assessed[activeEditingSkillDef.id] && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveSkill(activeEditingSkillDef.id)}
                          className="text-destructive hover:bg-destructive/10 text-xs"
                        >
                          Remove Skill
                        </Button>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setEditingSkillId(null)}
                        className="text-xs"
                      >
                        Cancel
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        onClick={handleSaveSkill}
                        className="font-bold btn-sparkle text-xs"
                      >
                        Save Skill to Profile
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* Skills Catalogue Search & Filter */}
              <div className="space-y-3">
                <div className="flex flex-col sm:flex-row gap-2 justify-between items-start sm:items-center">
                  <div className="relative w-full sm:w-72">
                    <Search className="absolute left-2.5 top-2.5 size-3.5 text-muted-foreground" />
                    <Input
                      value={skillSearch}
                      onChange={(e) => setSkillSearch(e.target.value)}
                      placeholder="Search skill (e.g. Python, SQL, React)..."
                      className="pl-8 h-8 text-xs bg-card"
                    />
                  </div>
                  <div className="flex items-center gap-1 overflow-x-auto max-w-full pb-1 text-xs">
                    {["All", "Coding", "Data", "AI/ML", "Craft", "Working like a pro"].map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setSkillCategoryFilter(cat)}
                        className={cn(
                          "px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap",
                          skillCategoryFilter === cat
                            ? "bg-gold text-plum-950 font-bold"
                            : "bg-card border border-border text-muted-foreground hover:text-foreground"
                        )}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Skills Grid */}
                <div className="grid gap-3 sm:grid-cols-2 max-h-72 overflow-y-auto pr-1">
                  {SKILLS.filter((s) => {
                    if (skillCategoryFilter !== "All" && s.category !== skillCategoryFilter) return false;
                    if (skillSearch.trim()) {
                      const q = skillSearch.trim().toLowerCase();
                      return s.name.toLowerCase().includes(q) || s.why.toLowerCase().includes(q);
                    }
                    return true;
                  }).map((skill) => {
                    const isSelected = Boolean(assessed[skill.id]);
                    const currentItem = assessed[skill.id];
                    return (
                      <div
                        key={skill.id}
                        className={cn(
                          "rounded-xl border p-3.5 flex flex-col justify-between transition-all",
                          isSelected
                            ? "border-gold bg-gold/10"
                            : "border-border bg-background hover:border-gold/30"
                        )}
                      >
                        <div>
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-bold text-sm text-foreground">{skill.name}</span>
                            <span className="rounded-full bg-border px-2 py-0.5 text-[10px] text-muted-foreground uppercase">
                              {skill.category}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                            {skill.why}
                          </p>
                        </div>

                        <div className="mt-3 flex items-center justify-between border-t border-border/50 pt-2 text-xs">
                          {isSelected ? (
                            <span className="text-gold font-bold text-xs">
                              Selected: Level {currentItem?.level}/5
                            </span>
                          ) : (
                            <span className="text-muted-foreground text-[11px]">
                              Not selected
                            </span>
                          )}

                          <Button
                            type="button"
                            size="sm"
                            variant={isSelected ? "outline" : "default"}
                            onClick={() => openSkillEditor(skill)}
                            className={cn("h-7 text-xs font-bold", !isSelected && "btn-sparkle")}
                          >
                            {isSelected ? "Edit Skill" : "+ Add Skill"}
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* STEP 5: Choose Destination (Target Role) */}
          {step === 4 && (
            <div className="flex-1 space-y-6">
              <div>
                <h1 className="font-display text-2xl font-bold tracking-wide text-foreground">
                  Choose Destination
                </h1>
                <p className="mt-1 text-xs text-muted-foreground">
                  Pick the career role you want to prepare for. Your live Marauder Map will track your skill coverage against this role.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                {CAREERS.map((c) => {
                  const isSelected = role === c.id;
                  return (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setRole(c.id)}
                      className={cn(
                        "rounded-2xl border p-4 text-left transition-all",
                        isSelected
                          ? "border-gold bg-gold/15 shadow-md ring-2 ring-gold/40 scale-[1.01]"
                          : "border-border bg-background hover:border-gold/30"
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-display font-bold text-base text-foreground">{c.title}</span>
                        {isSelected && <Check className="size-4 text-gold" />}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                        {c.blurb}
                      </p>
                      <div className="mt-3 flex flex-wrap gap-1">
                        {c.required.map((reqSkillId) => {
                          const hasSkill = Boolean(assessed[reqSkillId]);
                          const def = getSkill(reqSkillId);
                          return (
                            <span
                              key={reqSkillId}
                              className={cn(
                                "rounded px-1.5 py-0.5 text-[10px] font-mono",
                                hasSkill
                                  ? "bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30"
                                  : "bg-border text-muted-foreground"
                              )}
                            >
                              {def?.name || reqSkillId}
                            </span>
                          );
                        })}
                      </div>
                    </button>
                  );
                })}
              </div>

              {role && (
                <div className="rounded-xl border border-gold-muted/30 bg-gold/5 p-4 text-xs text-foreground flex items-center justify-between">
                  <div>
                    <span className="font-bold text-gold uppercase text-[10px] tracking-wider block">Skill Coverage Preview</span>
                    <span className="text-sm font-bold text-foreground">
                      {coveragePreview.percentage.toFixed(1)}% of required skills covered
                    </span>
                    <p className="text-muted-foreground text-[11px] mt-0.5">
                      Based on your {Object.keys(assessed).length} selected skill{Object.keys(assessed).length === 1 ? "" : "s"}.
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="font-mono text-xl font-extrabold text-gold">
                      {coveragePreview.matched} / {coveragePreview.total}
                    </span>
                    <span className="block text-[10px] text-muted-foreground uppercase">Skills</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* STEP 6: Reveal Your Map */}
          {step === 5 && (
            <div className="flex flex-1 flex-col items-center justify-center text-center py-4 space-y-5">
              <Owl size={100} className="animate-bob" />
              <div>
                <h1 className="font-display text-2xl font-bold tracking-wide text-foreground sm:text-3xl">
                  Your Parchment is Ready!
                </h1>
                <p className="mt-1 max-w-md text-xs text-muted-foreground">
                  Your academic record and selected skills have been calibrated into your live Marauder Map.
                </p>
              </div>

              {/* Summary Parchment Card */}
              <div className="w-full max-w-md rounded-2xl border-2 border-gold/40 bg-card p-5 text-left space-y-3.5 shadow-magic">
                <div className="border-b border-border pb-2.5 flex items-center justify-between">
                  <div>
                    <h2 className="font-bold text-foreground text-sm">{name}</h2>
                    <span className="text-xs text-muted-foreground font-mono">{studentId} • {semester}</span>
                  </div>
                  <span className="rounded-full bg-gold/15 border border-gold-muted/30 px-2 py-0.5 text-[10px] font-bold text-gold uppercase">
                    {getCareer(role).title}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="rounded-xl border border-border bg-background p-2.5">
                    <span className="block text-[10px] text-muted-foreground uppercase font-bold">Courses</span>
                    <span className="font-mono text-base font-bold text-foreground">{courses.length}</span>
                  </div>
                  <div className="rounded-xl border border-border bg-background p-2.5">
                    <span className="block text-[10px] text-muted-foreground uppercase font-bold">CGPA</span>
                    <span className="font-mono text-base font-bold text-gold">{calculatedCgpa.totalCredits > 0 ? calculatedCgpa.cgpa.toFixed(2) : "0.00"}</span>
                  </div>
                  <div className="rounded-xl border border-border bg-background p-2.5">
                    <span className="block text-[10px] text-muted-foreground uppercase font-bold">Coverage</span>
                    <span className="font-mono text-base font-bold text-emerald-400">{coveragePreview.percentage.toFixed(0)}%</span>
                  </div>
                </div>

                {/* Exact Required Disclaimer */}
                <div className="rounded-xl border border-border bg-background/60 p-3 text-[11px] text-muted-foreground leading-relaxed">
                  <p className="italic">
                    "This is coverage of the skills defined for this role, not a probability of getting hired."
                  </p>
                </div>
              </div>

              <Button
                size="lg"
                onClick={finish}
                className="w-full max-w-md font-display text-sm font-bold tracking-wider btn-sparkle h-12"
              >
                <Sparkles className="size-4 mr-2" />
                Open My Marauder Map ✦
              </Button>
            </div>
          )}

          {/* Validation Error Message */}
          {error && (
            <div className="mt-4 flex items-center gap-2 rounded-xl border border-destructive/40 bg-destructive/10 p-3 text-xs text-destructive">
              <AlertCircle className="size-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Bottom Navigation Buttons */}
          <div className="mt-8 flex items-center justify-between border-t border-border pt-4">
            {step > 0 ? (
              <Button
                type="button"
                variant="outline"
                onClick={prev}
                className="text-xs font-semibold"
              >
                <ArrowLeft className="size-3.5 mr-1.5" /> Back
              </Button>
            ) : (
              <div />
            )}

            {step < STEPS.length - 1 && (
              <Button
                type="button"
                onClick={next}
                className="text-xs font-bold btn-sparkle"
              >
                Next <ArrowRight className="size-3.5 ml-1.5" />
              </Button>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
export default Onboarding;
