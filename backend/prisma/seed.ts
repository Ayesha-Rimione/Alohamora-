import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const UNIVERSITIES_SEED = [
  {
    name: "IUBAT — International University of Business Agriculture and Technology",
    shortName: "IUBAT",
    domain: "iubat.edu",
    gradingScaleJson: JSON.stringify({
      "A+": 4.0,
      A: 4.0,
      "A-": 3.75,
      "B+": 3.5,
      B: 3.25,
      "B-": 3.0,
      "C+": 2.75,
      C: 2.5,
      D: 2.0,
      F: 0.0,
    }),
  },
  {
    name: "BUET — Bangladesh University of Engineering and Technology",
    shortName: "BUET",
    domain: "buet.ac.bd",
    gradingScaleJson: JSON.stringify({
      "A+": 4.0,
      A: 3.75,
      "A-": 3.5,
      "B+": 3.25,
      B: 3.0,
      "B-": 2.75,
      "C+": 2.5,
      C: 2.25,
      D: 2.0,
      F: 0.0,
    }),
  },
  {
    name: "University of Dhaka (DU)",
    shortName: "DU",
    domain: "du.ac.bd",
    gradingScaleJson: JSON.stringify({
      "A+": 4.0,
      A: 3.75,
      "A-": 3.5,
      "B+": 3.25,
      B: 3.0,
      "B-": 2.75,
      "C+": 2.5,
      C: 2.25,
      D: 2.0,
      F: 0.0,
    }),
  },
  {
    name: "BRAC University",
    shortName: "BRACU",
    domain: "g.bracu.ac.bd",
    gradingScaleJson: JSON.stringify({
      "A+": 4.0,
      A: 4.0,
      "A-": 3.7,
      "B+": 3.3,
      B: 3.0,
      "B-": 2.7,
      "C+": 2.3,
      C: 2.0,
      D: 1.0,
      F: 0.0,
    }),
  },
  {
    name: "North South University (NSU)",
    shortName: "NSU",
    domain: "northsouth.edu",
    gradingScaleJson: JSON.stringify({
      "A+": 4.0,
      A: 4.0,
      "A-": 3.7,
      "B+": 3.3,
      B: 3.0,
      "B-": 2.7,
      "C+": 2.3,
      C: 2.0,
      D: 1.0,
      F: 0.0,
    }),
  },
];

const SKILLS_SEED = [
  { id: "python", name: "Python", category: "Coding", description: "Default language for data, ML scripts, automation and backend work.", defaultTargetLevel: 4 },
  { id: "data-handling", name: "Data handling", category: "Data", description: "Cleaning, joining and reshaping tabular datasets.", defaultTargetLevel: 4 },
  { id: "ml-fundamentals", name: "ML fundamentals", category: "AI/ML", description: "Core learning algorithms, loss functions, optimization.", defaultTargetLevel: 4 },
  { id: "sql", name: "SQL", category: "Data", description: "Relational modeling, complex queries, joins, aggregations.", defaultTargetLevel: 4 },
  { id: "model-evaluation", name: "Model evaluation", category: "AI/ML", description: "Metrics, confusion matrices, cross-validation, bias-variance.", defaultTargetLevel: 4 },
  { id: "apis-deployment", name: "APIs & deployment", category: "Coding", description: "RESTful architecture, containerization, cloud deployment.", defaultTargetLevel: 4 },
  { id: "git-collab", name: "Git & collaboration", category: "Working like a pro", description: "Branching workflows, meaningful commits, PR reviews.", defaultTargetLevel: 4 },
  { id: "portfolio-projects", name: "End-to-end projects", category: "Craft", description: "Full lifecycle projects documented and deployed live.", defaultTargetLevel: 4 },
  { id: "js-fundamentals", name: "JavaScript", category: "Coding", description: "Modern ES6+, async/await, closures, browser runtime.", defaultTargetLevel: 4 },
  { id: "react", name: "React", category: "Coding", description: "Component lifecycle, hooks, state management, SPA routing.", defaultTargetLevel: 4 },
  { id: "css-design", name: "CSS & design sense", category: "Craft", description: "Modern responsive layout, accessibility, tokens.", defaultTargetLevel: 4 },
  { id: "node-backend", name: "Backend (Node/Express)", category: "Coding", description: "Server-side services, middleware, ORMs, authentication.", defaultTargetLevel: 4 },
  { id: "system-design", name: "System design basics", category: "Working like a pro", description: "High-level architecture, scalability, caching, queues.", defaultTargetLevel: 4 },
  { id: "testing", name: "Testing", category: "Working like a pro", description: "Unit, integration, and E2E testing best practices.", defaultTargetLevel: 4 },
  { id: "statistics", name: "Statistics", category: "Data", description: "Hypothesis testing, probability distributions, inference.", defaultTargetLevel: 4 },
  { id: "data-viz", name: "Data visualization", category: "Data", description: "Communicating insights through clear charts and dashboards.", defaultTargetLevel: 4 },
  { id: "communication", name: "Communication", category: "Working like a pro", description: "Technical documentation, client/team syncs, demos.", defaultTargetLevel: 4 },
  { id: "ux-research", name: "UX research", category: "Craft", description: "User interviews, usability testing, persona mapping.", defaultTargetLevel: 4 },
  { id: "prototyping", name: "Prototyping", category: "Craft", description: "Wireframing, clickable mockups, rapid iteration.", defaultTargetLevel: 4 },
  { id: "figma", name: "Figma", category: "Craft", description: "Design systems, auto-layout, interactive prototypes.", defaultTargetLevel: 4 },
  { id: "problem-solving", name: "Problem solving", category: "Working like a pro", description: "Algorithmic thinking, data structures, debugging.", defaultTargetLevel: 4 },
  { id: "mobile-flutter", name: "Mobile (Flutter)", category: "Coding", description: "Cross-platform mobile apps with Dart & Flutter framework.", defaultTargetLevel: 4 },
];

const CAREERS_SEED = [
  {
    id: "aiml",
    title: "AI/ML Engineer",
    blurb: "Build and ship models that actually solve problems — not just notebooks.",
    skills: ["python", "data-handling", "ml-fundamentals", "sql", "model-evaluation", "apis-deployment", "git-collab", "portfolio-projects"],
  },
  {
    id: "swe",
    title: "Software Engineer",
    blurb: "Build reliable products end-to-end with clean, tested code.",
    skills: ["problem-solving", "python", "js-fundamentals", "apis-deployment", "sql", "testing", "git-collab", "portfolio-projects"],
  },
  {
    id: "frontend",
    title: "Frontend Developer",
    blurb: "Turn designs into fast, accessible interfaces people love to use.",
    skills: ["js-fundamentals", "react", "css-design", "apis-deployment", "testing", "git-collab", "prototyping", "portfolio-projects"],
  },
  {
    id: "data-analyst",
    title: "Data Analyst",
    blurb: "Turn messy rows into clear answers that guide real business decisions.",
    skills: ["sql", "data-handling", "statistics", "data-viz", "communication", "python", "portfolio-projects"],
  },
  {
    id: "product-designer",
    title: "Product Designer",
    blurb: "Design software that feels effortless, solves user problems, and looks sharp.",
    skills: ["figma", "prototyping", "ux-research", "css-design", "communication", "portfolio-projects"],
  },
  {
    id: "mobile-dev",
    title: "Mobile App Developer",
    blurb: "Build cross-platform mobile apps for Android and iOS devices.",
    skills: ["mobile-flutter", "js-fundamentals", "apis-deployment", "git-collab", "problem-solving", "portfolio-projects"],
  },
];

const RESOURCES_SEED = [
  {
    title: "Python Official Tutorial",
    url: "https://docs.python.org/3/tutorial/",
    provider: "Python Software Foundation",
    type: "documentation",
    price: "Free",
    isSponsored: false,
    tagsJson: JSON.stringify(["python", "programming", "backend"]),
  },
  {
    title: "Kaggle Learn: Pandas",
    url: "https://www.kaggle.com/learn/pandas",
    provider: "Kaggle",
    type: "tutorial",
    price: "Free",
    isSponsored: false,
    tagsJson: JSON.stringify(["data-handling", "pandas", "python"]),
  },
  {
    title: "Google ML Crash Course",
    url: "https://developers.google.com/machine-learning/crash-course",
    provider: "Google",
    type: "course",
    price: "Free",
    isSponsored: false,
    tagsJson: JSON.stringify(["ai", "ml", "tensorflow"]),
  },
  {
    title: "SQLBolt Interactive Lessons",
    url: "https://sqlbolt.com/",
    provider: "SQLBolt",
    type: "tutorial",
    price: "Free",
    isSponsored: false,
    tagsJson: JSON.stringify(["sql", "database", "backend"]),
  },
  {
    title: "The Odin Project (Full Stack JavaScript)",
    url: "https://www.theodinproject.com/",
    provider: "The Odin Project",
    type: "course",
    price: "Free",
    isSponsored: false,
    tagsJson: JSON.stringify(["fullstack", "javascript", "react", "node"]),
  },
  {
    title: "Frontend Masters React Path",
    url: "https://frontendmasters.com/courses/complete-react-v8/",
    provider: "Frontend Masters",
    type: "course",
    price: "Paid",
    isSponsored: true,
    sponsorName: "Educational Partner",
    tagsJson: JSON.stringify(["react", "frontend", "javascript"]),
  },
];

const OPPORTUNITIES_SEED = [
  {
    title: "Junior Machine Learning Intern",
    company: "Chaldal Labs (Demo Record)",
    role: "aiml",
    type: "internship",
    location: "Dhaka (Hybrid)",
    stipend: "৳15,000 / month",
    deadline: "End of month",
    isDemo: true,
    description: "Support our data science team with dataset cleaning, feature engineering, and model evaluation pipelines.",
    tagsJson: JSON.stringify(["python", "pandas", "scikit-learn", "sql"]),
    link: "https://example.com/careers/demo-ml-intern",
  },
  {
    title: "Junior Frontend Engineer",
    company: "Pathao Tech (Demo Record)",
    role: "frontend",
    type: "entry",
    location: "Gulshan, Dhaka",
    stipend: "৳35,000 – ৳45,000 / month",
    deadline: "Rolling applications",
    isDemo: true,
    description: "Build delightful web user interfaces for consumer-facing transport and commerce products.",
    tagsJson: JSON.stringify(["react", "typescript", "tailwind"]),
    link: "https://example.com/careers/demo-frontend",
  },
  {
    title: "Data Analyst Trainee",
    company: "bKash Digital Services (Demo Record)",
    role: "data-analyst",
    type: "internship",
    location: "Dhaka",
    stipend: "৳20,000 / month",
    deadline: "Next week",
    isDemo: true,
    description: "Analyze user engagement and financial transaction patterns using SQL and Tableau.",
    tagsJson: JSON.stringify(["sql", "excel", "data-viz"]),
    link: "https://example.com/careers/demo-analyst",
  },
];

export async function seedDatabase() {
  console.log("Seeding universities...");
  for (const u of UNIVERSITIES_SEED) {
    await prisma.university.upsert({
      where: { name: u.name },
      update: { shortName: u.shortName, domain: u.domain, gradingScaleJson: u.gradingScaleJson },
      create: u,
    });
  }

  console.log("Seeding skills...");
  for (const s of SKILLS_SEED) {
    await prisma.skill.upsert({
      where: { id: s.id },
      update: { name: s.name, category: s.category, description: s.description, defaultTargetLevel: s.defaultTargetLevel },
      create: s,
    });
  }

  console.log("Seeding career roles and requirements...");
  for (const c of CAREERS_SEED) {
    await prisma.careerRole.upsert({
      where: { id: c.id },
      update: { title: c.title, blurb: c.blurb },
      create: { id: c.id, title: c.title, blurb: c.blurb },
    });

    for (const skillId of c.skills) {
      await prisma.roleRequirement.upsert({
        where: {
          roleId_skillId: {
            roleId: c.id,
            skillId,
          },
        },
        update: { weight: 1.0, targetLevel: 4 },
        create: {
          roleId: c.id,
          skillId,
          weight: 1.0,
          targetLevel: 4,
        },
      });
    }
  }

  console.log("Seeding learning resources...");
  for (const r of RESOURCES_SEED) {
    const existing = await prisma.learningResource.findFirst({ where: { title: r.title } });
    if (!existing) {
      await prisma.learningResource.create({ data: r });
    }
  }

  console.log("Seeding demo opportunities...");
  for (const o of OPPORTUNITIES_SEED) {
    const existing = await prisma.opportunity.findFirst({ where: { title: o.title } });
    if (!existing) {
      await prisma.opportunity.create({ data: o });
    }
  }

  console.log("Database seeded successfully! ✦");
}

if (process.env.NODE_ENV !== "test" && !process.env.VITEST) {
  seedDatabase()
    .catch((err) => {
      console.error("Seed error:", err);
      process.exit(1);
    })
    .finally(() => prisma.$disconnect());
}

