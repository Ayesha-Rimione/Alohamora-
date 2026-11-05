// Authoritative Coordinate Registry and Sample Data for The Marauder Map (Phase 1 Prototype)
// NOTE: All student progression data here is strictly ILLUSTRATIVE SAMPLE DATA for Phase 1 testing.
// Real data integration will follow in Phase 2.

export type RelationshipType =
  | "ACADEMIC_SEQUENCE"
  | "MANDATORY_SKILL_PREREQUISITE"
  | "RECOMMENDED_SKILL_FOUNDATION"
  | "CAREER_REQUIRED_COMPETENCY"
  | "OPTIONAL_SPECIALIZATION";

export interface MapRegion {
  id: string;
  name: string;
  latinMotto: string;
  x: number;
  y: number;
  width: number;
  height: number;
  colorTheme: string;
}

export interface MapNode {
  id: string;
  label: string;
  type: "skill" | "destination" | "quest" | "landmark";
  regionId: string;
  x: number;
  y: number;
  category: "Foundations" | "Systems" | "Intelligence" | "Web & Cloud" | "Career Citadel";
  description: string;

  // STRICT SEPARATION OF COMPETENCY AND VERIFICATION (Phase 1 Illustrated State)
  selfAssessedLevel: 0 | 1 | 2 | 3 | 4 | 5; // Student self-assessment
  submittedEvidence: { title: string; url: string; submittedAt?: string } | null;
  reviewStatus: "unsubmitted" | "submitted_unreviewed";
  verifiedStatus: "not_verified"; // Explicit: no real verifier platform active
  coursework: { code: string; name: string; grade: string; credits: number } | null;

  questTitle?: string;
  questPrompt?: string;
  isDestination?: boolean;
}

export interface MapEdge {
  id: string;
  sourceId: string;
  targetId: string;
  type: RelationshipType;
  mandatory: boolean;
  rationale: string;
}

export interface MapLandmark {
  id: string;
  name: string;
  x: number;
  y: number;
  type: "mountains" | "forest" | "tower" | "bridge" | "sea_monster" | "compass";
  scale?: number;
}

// Bounding Realm Coordinates: [-1000, 1000] x [-700, 700]
export const MAP_REALM_BOUNDS = {
  minX: -1000,
  minY: -700,
  maxX: 1000,
  maxY: 700,
  width: 2000,
  height: 1400,
};

export const SAMPLE_REGIONS: MapRegion[] = [
  {
    id: "realm_foundations",
    name: "The Realm of Foundations",
    latinMotto: "Prima Principia Scientiae",
    x: -620,
    y: 0,
    width: 480,
    height: 480,
    colorTheme: "#8b5a2b",
  },
  {
    id: "citadel_systems",
    name: "The Citadel of Systems & Core",
    latinMotto: "Structura et Architectura",
    x: -80,
    y: -360,
    width: 520,
    height: 400,
    colorTheme: "#4a3b32",
  },
  {
    id: "high_bastion_ai",
    name: "The High Bastion of AI & Data",
    latinMotto: "Cognitio Machinae et Data",
    x: 480,
    y: -220,
    width: 540,
    height: 460,
    colorTheme: "#53234f",
  },
  {
    id: "grand_port_crafts",
    name: "The Grand Port of Web Crafts",
    latinMotto: "Navigatio Telaris et Distributa",
    x: -60,
    y: 340,
    width: 560,
    height: 440,
    colorTheme: "#241c30",
  },
  {
    id: "citadels_destination",
    name: "The Citadels of Career Destiny",
    latinMotto: "Finis Coronat Opus",
    x: 680,
    y: 280,
    width: 420,
    height: 420,
    colorTheme: "#ebcb7a",
  },
];

export const SAMPLE_NODES: MapNode[] = [
  // FOUNDATIONS
  {
    id: "skill_python",
    label: "Python Haven",
    type: "skill",
    regionId: "realm_foundations",
    x: -680,
    y: -80,
    category: "Foundations",
    description: "Core syntax, data types, scripting, and modular programming.",
    selfAssessedLevel: 4,
    submittedEvidence: {
      title: "Automated CSV Cleaner CLI",
      url: "https://github.com/sample/py-cleaner",
      submittedAt: "2026-10-15",
    },
    reviewStatus: "submitted_unreviewed",
    verifiedStatus: "not_verified",
    coursework: { code: "CSC 103", name: "Fundamentals of Computers", grade: "A", credits: 3 },
    questTitle: "The Alchemist's CLI",
    questPrompt: "Build a Python command-line utility to parse structured logs without third-party tools.",
  },
  {
    id: "skill_c_prog",
    label: "C Programming Glade",
    type: "skill",
    regionId: "realm_foundations",
    x: -560,
    y: 80,
    category: "Foundations",
    description: "Memory models, pointers, memory allocation, and control structures.",
    selfAssessedLevel: 3,
    submittedEvidence: null,
    reviewStatus: "unsubmitted",
    verifiedStatus: "not_verified",
    coursework: { code: "CSC 183", name: "Programming C", grade: "A-", credits: 3 },
    questTitle: "Pointer Labyrinth",
    questPrompt: "Implement a dynamic memory allocator simulation in ANSI C.",
  },
  {
    id: "skill_math_calc",
    label: "Calculus Overlook",
    type: "skill",
    regionId: "realm_foundations",
    x: -720,
    y: 120,
    category: "Foundations",
    description: "Derivatives, integrals, limits, and mathematical modeling.",
    selfAssessedLevel: 2,
    submittedEvidence: null,
    reviewStatus: "unsubmitted",
    verifiedStatus: "not_verified",
    coursework: { code: "MAT 147", name: "Applied Calculus", grade: "B+", credits: 3 },
    questTitle: "Gradient Descent Geometry",
    questPrompt: "Derive partial derivatives for a multivariate quadratic loss curve.",
  },

  // SYSTEMS & CORE
  {
    id: "skill_data_structs",
    label: "Data Structures Vault",
    type: "skill",
    regionId: "citadel_systems",
    x: -220,
    y: -320,
    category: "Systems",
    description: "Binary search trees, balanced heaps, hash tables, and asymptotic notation.",
    selfAssessedLevel: 3,
    submittedEvidence: {
      title: "Self-Balancing AVL Tree Benchmark",
      url: "https://github.com/sample/avl-bench",
    },
    reviewStatus: "submitted_unreviewed",
    verifiedStatus: "not_verified",
    coursework: { code: "CSC 283", name: "Data Structures", grade: "A", credits: 3 },
    questTitle: "The Balanced Vault",
    questPrompt: "Implement a red-black tree with logarithmic insertion guarantees.",
  },
  {
    id: "skill_algorithms",
    label: "Algorithms Spire",
    type: "skill",
    regionId: "citadel_systems",
    x: 40,
    y: -420,
    category: "Systems",
    description: "Divide and conquer, greedy methods, dynamic programming, and graph traversals.",
    selfAssessedLevel: 2,
    submittedEvidence: null,
    reviewStatus: "unsubmitted",
    verifiedStatus: "not_verified",
    coursework: { code: "CSC 351", name: "Algorithm Analysis & Design", grade: "B", credits: 3 },
    questTitle: "Dijkstra's Lantern",
    questPrompt: "Solve the shortest-path courier problem with a Fibonacci heap priority queue.",
  },
  {
    id: "skill_os",
    label: "Kernel Keep (OS)",
    type: "skill",
    regionId: "citadel_systems",
    x: -80,
    y: -240,
    category: "Systems",
    description: "Processes, multithreading, concurrency locks, virtual memory paging.",
    selfAssessedLevel: 1,
    submittedEvidence: null,
    reviewStatus: "unsubmitted",
    verifiedStatus: "not_verified",
    coursework: null,
    questTitle: "Deadlock Dissolution",
    questPrompt: "Demonstrate and resolve the Dining Philosophers deadlock with mutex semaphores.",
  },

  // INTELLIGENCE & DATA
  {
    id: "skill_data_handling",
    label: "Pandas & Data Marsh",
    type: "skill",
    regionId: "high_bastion_ai",
    x: 340,
    y: -280,
    category: "Intelligence",
    description: "Data sanitation, vector operations, missing value imputation, EDA.",
    selfAssessedLevel: 3,
    submittedEvidence: {
      title: "Dhaka Transit Analysis Notebook",
      url: "https://kaggle.com/sample/transit-eda",
    },
    reviewStatus: "submitted_unreviewed",
    verifiedStatus: "not_verified",
    coursework: null,
    questTitle: "Sanitize the Swamps",
    questPrompt: "Clean an untidy 100k-row demographic dataset with reproducible Pandas pipelines.",
  },
  {
    id: "skill_ml_basics",
    label: "Machine Learning Ridge",
    type: "skill",
    regionId: "high_bastion_ai",
    x: 520,
    y: -340,
    category: "Intelligence",
    description: "Supervised classification, regression, loss functions, gradient descent.",
    selfAssessedLevel: 2,
    submittedEvidence: null,
    reviewStatus: "unsubmitted",
    verifiedStatus: "not_verified",
    coursework: null,
    questTitle: "The Predictive Oracle",
    questPrompt: "Train and evaluate two regularization models (Ridge vs Lasso) on housing features.",
  },
  {
    id: "skill_model_eval",
    label: "Model Evaluation Watch",
    type: "skill",
    regionId: "high_bastion_ai",
    x: 640,
    y: -180,
    category: "Intelligence",
    description: "Precision-recall curves, ROC-AUC, cross-validation, and bias-variance tradeoff.",
    selfAssessedLevel: 0,
    submittedEvidence: null,
    reviewStatus: "unsubmitted",
    verifiedStatus: "not_verified",
    coursework: null,
    questTitle: "The Truth Mirror",
    questPrompt: "Diagnose an overfitted ensemble model and quantify data leakage.",
  },

  // WEB CRAFTS & DISTRIBUTED
  {
    id: "skill_sql",
    label: "Relational Mines (SQL)",
    type: "skill",
    regionId: "grand_port_crafts",
    x: -180,
    y: 280,
    category: "Web & Cloud",
    description: "Schema normalization, complex multi-table joins, subqueries, and indexing.",
    selfAssessedLevel: 3,
    submittedEvidence: {
      title: "Bookstore Schema & Queries",
      url: "https://github.com/sample/sql-bookstore",
    },
    reviewStatus: "submitted_unreviewed",
    verifiedStatus: "not_verified",
    coursework: { code: "CSC 311", name: "DBMS", grade: "A-", credits: 3 },
    questTitle: "Query of the Depths",
    questPrompt: "Optimize a slow correlated subquery using window functions and composite indexes.",
  },
  {
    id: "skill_apis",
    label: "API Crossings & REST",
    type: "skill",
    regionId: "grand_port_crafts",
    x: 60,
    y: 280,
    category: "Web & Cloud",
    description: "RESTful architecture, status codes, JWT authentication, and request validation.",
    selfAssessedLevel: 2,
    submittedEvidence: null,
    reviewStatus: "unsubmitted",
    verifiedStatus: "not_verified",
    coursework: null,
    questTitle: "The Secure Gatehouse",
    questPrompt: "Author a stateless Express REST API with cookie auth and schema validation.",
  },
  {
    id: "skill_react",
    label: "React Spire",
    type: "skill",
    regionId: "grand_port_crafts",
    x: 160,
    y: 420,
    category: "Web & Cloud",
    description: "Component composition, hooks, state machines, and accessible UI interactions.",
    selfAssessedLevel: 3,
    submittedEvidence: {
      title: "Interactive Cartography Widget",
      url: "https://github.com/sample/map-widget",
    },
    reviewStatus: "submitted_unreviewed",
    verifiedStatus: "not_verified",
    coursework: null,
    questTitle: "The Living Parchment",
    questPrompt: "Construct an interactive dashboard widget with keyboard accessibility.",
  },

  // CAREER DESTINATIONS (CITADELS)
  {
    id: "dest_aiml_engineer",
    label: "Citadel of AI/ML Engineer",
    type: "destination",
    regionId: "citadels_destination",
    x: 820,
    y: -80,
    category: "Career Citadel",
    description: "Architect, train, evaluate, and deploy machine learning models in production.",
    selfAssessedLevel: 2,
    submittedEvidence: null,
    reviewStatus: "unsubmitted",
    verifiedStatus: "not_verified",
    coursework: null,
    isDestination: true,
  },
  {
    id: "dest_fullstack_dev",
    label: "Guild of Full-Stack Developer",
    type: "destination",
    regionId: "citadels_destination",
    x: 780,
    y: 380,
    category: "Career Citadel",
    description: "Build end-to-end applications from database architecture to responsive interfaces.",
    selfAssessedLevel: 3,
    submittedEvidence: null,
    reviewStatus: "unsubmitted",
    verifiedStatus: "not_verified",
    coursework: null,
    isDestination: true,
  },
];

export const SAMPLE_EDGES: MapEdge[] = [
  // Academic & Core Foundations
  {
    id: "e_c_to_ds",
    sourceId: "skill_c_prog",
    targetId: "skill_data_structs",
    type: "ACADEMIC_SEQUENCE",
    mandatory: true,
    rationale: "Data structures in C require understanding pointers, structs, and dynamic memory.",
  },
  {
    id: "e_ds_to_algo",
    sourceId: "skill_data_structs",
    targetId: "skill_algorithms",
    type: "ACADEMIC_SEQUENCE",
    mandatory: true,
    rationale: "Algorithmic design builds on trees, graphs, priority queues, and hash maps.",
  },
  {
    id: "e_algo_to_os",
    sourceId: "skill_algorithms",
    targetId: "skill_os",
    type: "RECOMMENDED_SKILL_FOUNDATION",
    mandatory: false,
    rationale: "Process scheduling and memory page management utilize queueing and graph algorithms.",
  },

  // AI & Data Track
  {
    id: "e_py_to_data",
    sourceId: "skill_python",
    targetId: "skill_data_handling",
    type: "MANDATORY_SKILL_PREREQUISITE",
    mandatory: true,
    rationale: "Data manipulation with Pandas requires foundational Python syntax and data structures.",
  },
  {
    id: "e_calc_to_ml",
    sourceId: "skill_math_calc",
    targetId: "skill_ml_basics",
    type: "RECOMMENDED_SKILL_FOUNDATION",
    mandatory: false,
    rationale: "Gradient descent and backpropagation are rooted in multivariate partial differentiation.",
  },
  {
    id: "e_data_to_ml",
    sourceId: "skill_data_handling",
    targetId: "skill_ml_basics",
    type: "MANDATORY_SKILL_PREREQUISITE",
    mandatory: true,
    rationale: "Machine learning algorithms ingest clean tabular matrices and engineered features.",
  },
  {
    id: "e_ml_to_eval",
    sourceId: "skill_ml_basics",
    targetId: "skill_model_eval",
    type: "MANDATORY_SKILL_PREREQUISITE",
    mandatory: true,
    rationale: "Rigorous evaluation and bias-variance diagnosis presuppose training experience.",
  },
  {
    id: "e_eval_to_dest_ai",
    sourceId: "skill_model_eval",
    targetId: "dest_aiml_engineer",
    type: "CAREER_REQUIRED_COMPETENCY",
    mandatory: true,
    rationale: "Production ML roles require verifiable evaluation, validation, and monitoring.",
  },

  // Web & Full-Stack Track
  {
    id: "e_sql_to_apis",
    sourceId: "skill_sql",
    targetId: "skill_apis",
    type: "RECOMMENDED_SKILL_FOUNDATION",
    mandatory: false,
    rationale: "Backend REST endpoints typically query normalized relational databases.",
  },
  {
    id: "e_apis_to_react",
    sourceId: "skill_apis",
    targetId: "skill_react",
    type: "RECOMMENDED_SKILL_FOUNDATION",
    mandatory: false,
    rationale: "Single-page React clients consume asynchronous JSON APIs via HTTP fetch.",
  },
  {
    id: "e_react_to_dest_fs",
    sourceId: "skill_react",
    targetId: "dest_fullstack_dev",
    type: "CAREER_REQUIRED_COMPETENCY",
    mandatory: true,
    rationale: "Full-stack development demands practical frontend UI fluency and backend integration.",
  },
  {
    id: "e_apis_to_dest_fs",
    sourceId: "skill_apis",
    targetId: "dest_fullstack_dev",
    type: "CAREER_REQUIRED_COMPETENCY",
    mandatory: true,
    rationale: "Server-side REST API development is fundamental to full-stack engineering.",
  },
];

export const SAMPLE_LANDMARKS: MapLandmark[] = [
  { id: "lm_compass", name: "Compass Rose", x: -840, y: -520, type: "compass", scale: 1.2 },
  { id: "lm_mountains_north", name: "The Northern Crags", x: -120, y: -580, type: "mountains", scale: 1.0 },
  { id: "lm_mountains_ai", name: "The Crest of Gradient", x: 420, y: -480, type: "mountains", scale: 0.9 },
  { id: "lm_forest_foundations", name: "The Wood of Syntax", x: -440, y: -180, type: "forest", scale: 0.8 },
  { id: "lm_forest_east", name: "Trained Groves", x: 260, y: -140, type: "forest", scale: 0.7 },
  { id: "lm_port_ships", name: "Anchor Bay", x: -280, y: 520, type: "sea_monster", scale: 0.8 },
];

