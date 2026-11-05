// Skill catalog + career definitions for the Marauder Map.
// Pure data + pure functions — no UI, so it can later be swapped for API data.

import { computeSkillCoverage } from "@/lib/coverage";

export type SkillStatus = "demonstrated" | "developing" | "missing";

export interface SkillDef {
  id: string;
  name: string;
  category: "Coding" | "Data" | "AI/ML" | "Craft" | "Working like a pro";
  why: string;
  resource: { title: string; url: string; price: "Free" | "Paid" };
  quest: string;
}

export const SKILLS: SkillDef[] = [
  {
    id: "python",
    name: "Python",
    category: "Coding",
    why: "The default language for data, ML scripts, automation and backend work in most Bangladeshi tech teams.",
    resource: { title: "Python Official Tutorial", url: "https://docs.python.org/3/tutorial/", price: "Free" },
    quest: "Write a small CLI tool that reads a CSV file and prints a summary report.",
  },
  {
    id: "data-handling",
    name: "Data handling",
    category: "Data",
    why: "Real datasets are messy. Employers pay for people who can clean, join and reshape data without panic.",
    resource: { title: "Kaggle Learn: Pandas", url: "https://www.kaggle.com/learn/pandas", price: "Free" },
    quest: "Take a messy public dataset, clean it, and write a 200-word note on what you fixed.",
  },
  {
    id: "ml-fundamentals",
    name: "ML fundamentals",
    category: "AI/ML",
    why: "Understanding how models learn separates ML engineers from people who only run notebooks.",
    resource: { title: "Google ML Crash Course", url: "https://developers.google.com/machine-learning/crash-course", price: "Free" },
    quest: "Train and compare two models on one dataset and explain why the winner won.",
  },
  {
    id: "sql",
    name: "SQL",
    category: "Data",
    why: "Almost every product decision starts with a query. SQL shows up in nearly every technical interview.",
    resource: { title: "SQLBolt", url: "https://sqlbolt.com/", price: "Free" },
    quest: "Model a library database, then answer 5 business questions with JOIN queries.",
  },
  {
    id: "model-evaluation",
    name: "Model evaluation",
    category: "AI/ML",
    why: "Teams need engineers who know when a model is actually good — not just when accuracy looks high.",
    resource: { title: "Hugging Face Learn", url: "https://huggingface.co/learn", price: "Free" },
    quest: "Break a model deliberately with a bad train/test split, then fix it and document the difference.",
  },
  {
    id: "apis-deployment",
    name: "APIs & deployment",
    category: "Coding",
    why: "A model or feature that lives on your laptop proves nothing. Shipping it proves everything.",
    resource: { title: "The Odin Project", url: "https://www.theodinproject.com/", price: "Free" },
    quest: "Wrap your project in a REST API and deploy it publicly with a README.",
  },
  {
    id: "git-collab",
    name: "Git & collaboration",
    category: "Working like a pro",
    why: "Clean branches, readable commits and good PR descriptions are the first thing teammates notice.",
    resource: { title: "Git Handbook (GitHub Docs)", url: "https://docs.github.com/en/get-started/using-git/about-git", price: "Free" },
    quest: "Contribute a fix or docs improvement to an open-source project via a real pull request.",
  },
  {
    id: "portfolio-projects",
    name: "End-to-end projects",
    category: "Craft",
    why: "A finished, deployed, documented project is the strongest proof a student can show an employer.",
    resource: { title: "Frontend Mentor challenges", url: "https://www.frontendmentor.io/", price: "Free" },
    quest: "Ship one small project end-to-end: idea, build, deploy, README, demo link.",
  },
  {
    id: "js-fundamentals",
    name: "JavaScript",
    category: "Coding",
    why: "The language of the web. Frontend, backend and most product teams in Dhaka use it daily.",
    resource: { title: "MDN JavaScript Guide", url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide", price: "Free" },
    quest: "Build a small interactive app in vanilla JS before touching any framework.",
  },
  {
    id: "react",
    name: "React",
    category: "Coding",
    why: "The most requested frontend framework in Bangladeshi job posts; React fluency gets you interviews.",
    resource: { title: "React Official Docs (Learn)", url: "https://react.dev/learn", price: "Free" },
    quest: "Build a dashboard with routing, state and an external API — then deploy it.",
  },
  {
    id: "css-design",
    name: "CSS & design sense",
    category: "Craft",
    why: "Ugly products lose users. Developers who care about layout and polish stand out immediately.",
    resource: { title: "web.dev Learn CSS", url: "https://web.dev/learn/css", price: "Free" },
    quest: "Rebuild one screen of a product you admire from scratch — pixel-obsessed.",
  },
  {
    id: "node-backend",
    name: "Backend (Node/Express)",
    category: "Coding",
    why: "Someone has to build the part users never see — and get paid well for it.",
    resource: { title: "The Odin Project: NodeJS", url: "https://www.theodinproject.com/paths/full-stack-javascript/courses/nodejs", price: "Free" },
    quest: "Build an authenticated CRUD API with validation and error handling.",
  },
  {
    id: "system-design",
    name: "System design basics",
    category: "Working like a pro",
    why: "You won't design Google on day one, but junior engineers who think in trade-offs get promoted faster.",
    resource: { title: "System Design Primer (GitHub)", url: "https://github.com/donnemartin/system-design-primer", price: "Free" },
    quest: "Sketch the architecture of an app you use daily and write down 3 trade-offs.",
  },
  {
    id: "testing",
    name: "Testing",
    category: "Working like a pro",
    why: "Teams trust engineers whose code doesn't break things. Tests are how you prove it.",
    resource: { title: "Testing JavaScript (free lessons)", url: "https://testingjavascript.com/", price: "Free" },
    quest: "Add 5 meaningful tests to an existing project of yours.",
  },
  {
    id: "statistics",
    name: "Statistics",
    category: "Data",
    why: "Analysts who understand distributions and uncertainty make decisions; the rest just make charts.",
    resource: { title: "Khan Academy: Statistics & Probability", url: "https://www.khanacademy.org/math/statistics-probability", price: "Free" },
    quest: "Find a statistic making news rounds and explain in plain words whether it's misleading.",
  },
  {
    id: "data-viz",
    name: "Data visualization",
    category: "Data",
    why: "The chart is the product for analysts. Clear visuals get your findings used.",
    resource: { title: "Kaggle Learn: Data Visualization", url: "https://www.kaggle.com/learn/data-visualization", price: "Free" },
    quest: "Turn one dataset into three charts that tell three different honest stories.",
  },
  {
    id: "communication",
    name: "Communication",
    category: "Working like a pro",
    why: "Interviews, standups and reports are all communication. Skilled and silent loses to skilled and clear.",
    resource: { title: " freeCodeCamp: technical writing", url: "https://www.freecodecamp.org/news/tag/technical-writing/", price: "Free" },
    quest: "Write a README that lets a stranger run your project in under 10 minutes.",
  },
  {
    id: "ux-research",
    name: "UX research",
    category: "Craft",
    why: "Designers who talk to users defend their decisions with evidence, not taste.",
    resource: { title: "Google UX Design Certificate preview", url: "https://www.coursera.org/professional-certificates/google-ux-design", price: "Paid" },
    quest: "Interview 3 classmates about one app they find confusing; summarise findings.",
  },
  {
    id: "prototyping",
    name: "Prototyping",
    category: "Craft",
    why: "Fast, rough prototypes get feedback cheaply — before anyone writes real code.",
    resource: { title: "Figma Learn: Design basics", url: "https://help.figma.com/hc/en-us/categories/360002051613", price: "Free" },
    quest: "Prototype a 4-screen flow and put it in front of one real user.",
  },
  {
    id: "figma",
    name: "Figma",
    category: "Craft",
    why: "The shared language of design teams; job-ready designers are fluent in it.",
    resource: { title: "Figma for beginners (official)", url: "https://www.figma.com/resource-library/design-basics/", price: "Free" },
    quest: "Recreate a popular app's home screen with proper auto-layout and components.",
  },
  {
    id: "problem-solving",
    name: "Problem solving",
    category: "Working like a pro",
    why: "Every technical interview is a problem-solving interview. Practice is the only shortcut.",
    resource: { title: "CS50 (Harvard, free)", url: "https://cs50.harvard.edu/x/", price: "Free" },
    quest: "Solve 10 small algorithm problems and write one sentence on your approach for each.",
  },
  {
    id: "mobile-flutter",
    name: "Mobile (Flutter)",
    category: "Coding",
    why: "Mobile-first is the default in Bangladesh; Flutter skills open many local product roles.",
    resource: { title: "Flutter official codelabs", url: "https://docs.flutter.dev/get-started/codelab", price: "Free" },
    quest: "Build a two-screen app with state and a form, then run it on a real phone.",
  },
];

export interface CareerDef {
  id: string;
  title: string;
  blurb: string;
  required: string[];
}

export const CAREERS: CareerDef[] = [
  {
    id: "aiml",
    title: "AI/ML Engineer",
    blurb: "Build and ship models that actually solve problems — not just notebooks.",
    required: ["python", "data-handling", "ml-fundamentals", "sql", "model-evaluation", "apis-deployment", "git-collab", "portfolio-projects"],
  },
  {
    id: "swe",
    title: "Software Engineer",
    blurb: "Build reliable products end-to-end with clean, tested code.",
    required: ["problem-solving", "python", "js-fundamentals", "apis-deployment", "sql", "testing", "git-collab", "portfolio-projects"],
  },
  {
    id: "frontend",
    title: "Frontend Developer",
    blurb: "Turn designs into fast, accessible interfaces people love to use.",
    required: ["js-fundamentals", "react", "css-design", "apis-deployment", "testing", "git-collab", "prototyping", "portfolio-projects"],
  },
  {
    id: "backend",
    title: "Backend Developer",
    blurb: "Design the APIs, data models and services behind real products.",
    required: ["python", "node-backend", "sql", "apis-deployment", "system-design", "testing", "git-collab", "portfolio-projects"],
  },
  {
    id: "data-analyst",
    title: "Data Analyst",
    blurb: "Turn messy data into decisions leaders can act on.",
    required: ["python", "sql", "statistics", "data-viz", "data-handling", "communication", "problem-solving", "portfolio-projects"],
  },
  {
    id: "uiux",
    title: "UI/UX Designer",
    blurb: "Research, design and prototype experiences that make sense to real users.",
    required: ["ux-research", "figma", "prototyping", "css-design", "communication", "problem-solving", "js-fundamentals", "portfolio-projects"],
  },
];

export function getSkill(id: string): SkillDef | undefined {
  return SKILLS.find((s) => s.id === id);
}

export function getCareer(id: string | undefined): CareerDef {
  return (id ? CAREERS.find((c) => c.id === id) : undefined) ?? CAREERS[0]!;
}

const STATUS_WEIGHT: Record<SkillStatus, number> = {
  demonstrated: 1,
  developing: 0.5,
  missing: 0,
};

export interface CoverageArea {
  skill: SkillDef;
  status: SkillStatus;
}

export interface Coverage {
  percent: number;
  areas: CoverageArea[];
  demonstrated: number;
  developing: number;
  missing: number;
}

/** Transparent logic powered by src/lib/coverage.ts:
 *  coverage = 100 × Σ(wᵢ × min(aᵢ / rᵢ, 1)) / Σwᵢ.
 *  Measures skill coverage of role requirements — not hiring probability. */
export function computeCoverage(
  roleId: string,
  skills: Record<string, { status: SkillStatus; level?: number }>,
): Coverage {
  const career = getCareer(roleId);
  const areas: CoverageArea[] = career.required.map((id) => ({
    skill: getSkill(id)!,
    status: skills[id]?.status ?? "missing",
  }));
  const result = computeSkillCoverage(career.required, skills);
  return {
    percent: result.percent,
    areas,
    demonstrated: result.demonstratedCount,
    developing: result.developingCount,
    missing: result.missingCount,
  };
}

export interface MapStage {
  title: string;
  caption: string;
  skillIds: string[];
  done: boolean;
}

/** Group the role's required skills into learning milestones for the map. */
export function buildMapStages(roleId: string, skills: Record<string, { status: SkillStatus }>): MapStage[] {
  const career = getCareer(roleId);
  const req = career.required.filter((id) => id !== "portfolio-projects");
  const chunk = Math.max(2, Math.ceil(req.length / 3));
  const groups: string[][] = [];
  for (let i = 0; i < req.length; i += chunk) groups.push(req.slice(i, i + chunk));

  const stages: MapStage[] = [
    { title: "Your Starting Point", caption: "Where you stand today", skillIds: [], done: true },
    { title: "Foundations", caption: "Core tools of the trade", skillIds: groups[0] ?? [], done: false },
    { title: "Skill-Building Quests", caption: "Depth in your craft", skillIds: groups[1] ?? [], done: false },
    { title: "Portfolio Workshop", caption: "Proof you can build", skillIds: ["portfolio-projects"], done: false },
    {
      title: "Interview Preparation",
      caption: "Explain your work with confidence",
      skillIds: (groups[2] ?? ["problem-solving", "communication"]).filter((id) => id !== "portfolio-projects"),
      done: false,
    },
    { title: "Application-Ready", caption: "Résumé, portfolio and practice done", skillIds: [], done: false },
  ];

  const stageDone = (ids: string[]) =>
    ids.length > 0 && ids.every((id) => skills[id]?.status === "demonstrated");
  stages.forEach((s) => {
    if (s.skillIds.length) s.done = stageDone(s.skillIds);
    else if (s.title === "Application-Ready")
      s.done = computeCoverage(roleId, skills).percent >= 100;
  });
  return stages;
}

export const STATUS_LABEL: Record<SkillStatus, string> = {
  demonstrated: "Demonstrated",
  developing: "Developing",
  missing: "Needs evidence",
};

export const STUDY_LEVELS = [
  "1st year",
  "2nd year",
  "3rd year",
  "4th year (final)",
  "Master's student",
];
