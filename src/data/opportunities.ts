// Demo opportunity listings for Accio Opportunities.
// IMPORTANT: These are clearly-marked DEMO listings used to show how matched
// opportunities will look. They are NOT real openings. No real company has
// posted them, and no real application links or deadlines are claimed.

export interface OpportunityDef {
  id: string;
  role: string;
  company: string;
  location: string;
  remote: boolean;
  type: "Internship" | "Entry-level";
  level: string;
  skills: string[]; // skill ids from data/skills.ts
  why: string;
  /** "2026-12-01" — demo dates only. */
  deadline?: string;
}

export const OPPORTUNITIES: OpportunityDef[] = [
  {
    id: "opp-1",
    role: "Software Engineering Intern",
    company: "Demo: Chalanbill Tech",
    location: "Dhaka (Gulshan)",
    remote: false,
    type: "Internship",
    level: "Entry",
    skills: ["python", "apis-deployment", "sql", "git-collab"],
    why: "Your Python and API skills cover most of this internship's stack — a strong first team experience.",
    deadline: "2026-11-15",
  },
  {
    id: "opp-2",
    role: "AI/ML Intern",
    company: "Demo: Meghna AI Labs",
    location: "Remote (Bangladesh)",
    remote: true,
    type: "Internship",
    level: "Entry",
    skills: ["python", "data-handling", "ml-fundamentals", "model-evaluation"],
    why: "Matches your AI/ML Engineer goal directly; your demonstrated Python work is the entry ticket.",
    deadline: "2026-11-30",
  },
  {
    id: "opp-3",
    role: "Frontend Developer Intern",
    company: "Demo: Rickshaw Digital",
    location: "Dhaka (Banani)",
    remote: false,
    type: "Internship",
    level: "Entry",
    skills: ["js-fundamentals", "react", "css-design", "git-collab"],
    why: "A product team that mentors juniors — your React fundamentals fit its day-one tasks.",
    deadline: "2026-12-05",
  },
  {
    id: "opp-4",
    role: "Backend Developer Intern",
    company: "Demo: Padma Software",
    location: "Chattogram",
    remote: false,
    type: "Internship",
    level: "Entry",
    skills: ["node-backend", "sql", "apis-deployment", "testing"],
    why: "Great fit if you want to strengthen backend depth; your SQL work already helps.",
    deadline: "2026-11-22",
  },
  {
    id: "opp-5",
    role: "Data Analyst Intern",
    company: "Demo: Buriganga Analytics",
    location: "Hybrid — Dhaka",
    remote: false,
    type: "Internship",
    level: "Entry",
    skills: ["sql", "python", "data-viz", "data-handling"],
    why: "Combines your SQL and data-handling skills with a clear mentoring structure.",
    deadline: "2026-12-12",
  },
  {
    id: "opp-6",
    role: "Junior Software Engineer",
    company: "Demo: Karnaphuli Systems",
    location: "Dhaka (Mohakhali)",
    remote: false,
    type: "Entry-level",
    level: "0–1 years",
    skills: ["problem-solving", "python", "testing", "git-collab", "apis-deployment"],
    why: "Hires from final-year students; your portfolio project is exactly what they screen for.",
    deadline: "2026-12-20",
  },
  {
    id: "opp-7",
    role: "Junior Frontend Engineer (Remote)",
    company: "Demo: Sundarban Web Co.",
    location: "Remote (worldwide)",
    remote: true,
    type: "Entry-level",
    level: "0–2 years",
    skills: ["react", "js-fundamentals", "css-design", "testing"],
    why: "Remote-first team with async work — good for balancing your final semester.",
  },
  {
    id: "opp-8",
    role: "ML Engineering Intern",
    company: "Demo: Sylhet Data Works",
    location: "Remote (Bangladesh)",
    remote: true,
    type: "Internship",
    level: "Entry",
    skills: ["ml-fundamentals", "python", "apis-deployment", "portfolio-projects"],
    why: "Wants one deployed ML project — exactly what your Portfolio Workshop milestone builds.",
    deadline: "2026-11-28",
  },
  {
    id: "opp-9",
    role: "Product Design Intern",
    company: "Demo: Tamasha Studio",
    location: "Dhaka (Dhanmondi)",
    remote: false,
    type: "Internship",
    level: "Entry",
    skills: ["figma", "prototyping", "ux-research", "communication"],
    why: "Small studio where interns run their own research sessions — fast growth.",
    deadline: "2026-12-02",
  },
  {
    id: "opp-10",
    role: "Junior Data Analyst",
    company: "Demo: Teesta Commerce Group",
    location: "Dhaka (Motijheel)",
    remote: false,
    type: "Entry-level",
    level: "0–1 years",
    skills: ["sql", "data-viz", "statistics", "communication"],
    why: "Business-side analytics with a clear ladder from analyst to senior analyst.",
  },
];

export const OPPORTUNITY_ROLES = [...new Set(OPPORTUNITIES.map((o) => o.role.split(" ").slice(0, 2).join(" ")))];
