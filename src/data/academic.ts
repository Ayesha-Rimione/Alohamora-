// Demo academic + progress data shared across the dashboard, Marauder Mode,
// Spellbook and the Comeback Codex. All of it is DEMO data.

export interface DemoDeadline {
  id: string;
  course: string;
  title: string;
  kind: "assignment" | "exam" | "quiz" | "lab";
  /** Demo dates near the prototype build window (late 2026). */
  due: string; // ISO date
  weight: string;
}

export const DEMO_DEADLINES: DemoDeadline[] = [
  { id: "dl-1", course: "CSE 331", title: "Algorithm assignment 3", kind: "assignment", due: "2026-11-02", weight: "10%" },
  { id: "dl-2", course: "CSE 325", title: "Database term project — schema demo", kind: "assignment", due: "2026-11-06", weight: "15%" },
  { id: "dl-3", course: "MAT 215", title: "Mid-term exam", kind: "exam", due: "2026-11-10", weight: "30%" },
  { id: "dl-4", course: "CSE 338", title: "ML lab report 2", kind: "lab", due: "2026-11-14", weight: "5%" },
  { id: "dl-5", course: "CSE 331", title: "Quiz 4", kind: "quiz", due: "2026-11-18", weight: "5%" },
  { id: "dl-6", course: "BUS 201", title: "Group presentation", kind: "assignment", due: "2026-11-24", weight: "10%" },
];

export interface DemoCourse {
  code: string;
  title: string;
  credits: number;
  progress: number; // 0-100 syllabus covered
  gradeGoal: string;
}

export const DEMO_COURSES: DemoCourse[] = [
  { code: "CSE 331", title: "Algorithms", credits: 3, progress: 62, gradeGoal: "A−" },
  { code: "CSE 325", title: "Database Systems", credits: 3, progress: 48, gradeGoal: "A" },
  { code: "MAT 215", title: "Statistics for Engineers", credits: 3, progress: 35, gradeGoal: "B+" },
  { code: "CSE 338", title: "Machine Learning", credits: 3, progress: 55, gradeGoal: "A−" },
  { code: "BUS 201", title: "Business Communication", credits: 2, progress: 70, gradeGoal: "A" },
];

export interface DemoBadge {
  id: string;
  name: string;
  desc: string;
  icon: string;
  earned: boolean;
}

export const DEMO_BADGES: DemoBadge[] = [
  { id: "bd-1", name: "First Spark", desc: "Completed your first learning quest", icon: "sparkles", earned: true },
  { id: "bd-2", name: "Map Reader", desc: "Revealed your full Marauder Map", icon: "map", earned: true },
  { id: "bd-3", name: "Brew Begun", desc: "Finished your first week in the Potion Lab", icon: "flask", earned: true },
  { id: "bd-4", name: "Steady Hand", desc: "Kept a 5-day learning streak", icon: "flame", earned: false },
  { id: "bd-5", name: "Shipped It", desc: "Deployed a portfolio project end-to-end", icon: "rocket", earned: false },
  { id: "bd-6", name: "Owl's Favourite", desc: "Studied with the Keykeeper 10 days this month", icon: "owl", earned: false },
];

export const DEMO_COMPLETED_QUESTS = [
  { id: "q-1", title: "Python refresher sprint", skill: "python", when: "Last week", kind: "Quest" },
  { id: "q-2", title: "SQL joins practice set", skill: "sql", when: "2 weeks ago", kind: "Quest" },
  { id: "q-3", title: "Cleaned a messy public dataset", skill: "data-handling", when: "3 weeks ago", kind: "Mini-project" },
  { id: "q-4", title: "ML crash course, modules 1–4", skill: "ml-fundamentals", when: "Last month", kind: "Course" },
];

export const DEMO_WEEK_ACTIVITY = [
  { day: "Mon", hours: 1.5 },
  { day: "Tue", hours: 2 },
  { day: "Wed", hours: 0.5 },
  { day: "Thu", hours: 2.5 },
  { day: "Fri", hours: 1 },
  { day: "Sat", hours: 3 },
  { day: "Sun", hours: 0 },
];

export const DEMO_QUESTIONS = [
  {
    id: "qq-1",
    course: "CSE 325 — Databases",
    question: "Which SQL clause filters rows *after* grouping?",
    options: ["WHERE", "HAVING", "ORDER BY", "LIMIT"],
    answer: 1,
    explain: "WHERE filters rows before grouping; HAVING filters the grouped results.",
  },
  {
    id: "qq-2",
    course: "CSE 331 — Algorithms",
    question: "What is the average-case time complexity of quicksort?",
    options: ["O(n)", "O(n log n)", "O(n²)", "O(log n)"],
    answer: 1,
    explain: "Quicksort averages O(n log n) with random pivots; the worst case is O(n²).",
  },
  {
    id: "qq-3",
    course: "CSE 338 — Machine Learning",
    question: "High training accuracy but low test accuracy is a classic sign of…",
    options: ["Underfitting", "Overfitting", "Data leakage", "Vanishing gradients"],
    answer: 1,
    explain: "The model memorised the training set instead of learning general patterns.",
  },
  {
    id: "qq-4",
    course: "MAT 215 — Statistics",
    question: "The central limit theorem says the sampling distribution of the mean becomes…",
    options: ["Uniform", "Bimodal", "Approximately normal", "Exactly exponential"],
    answer: 2,
    explain: "With a large enough sample size, sample means approach a normal distribution.",
  },
];

export const DEMO_NOTES = [
  { id: "nt-1", course: "CSE 325", title: "Normalization 1NF–3NF", updated: "Oct 20, 2026", excerpt: "1NF: atomic values. 2NF: no partial dependency on a composite key. 3NF: no transitive dependency…" },
  { id: "nt-2", course: "CSE 331", title: "Dynamic programming recipe", updated: "Oct 18, 2026", excerpt: "1) Define the state. 2) Write the recurrence. 3) Identify base cases. 4) Choose memo vs bottom-up…" },
  { id: "nt-3", course: "CSE 338", title: "Bias–variance in plain words", updated: "Oct 12, 2026", excerpt: "Bias = wrong assumptions (too simple). Variance = too sensitive to the sample (too flexible). Aim for the middle…" },
];
