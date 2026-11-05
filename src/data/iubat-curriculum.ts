// Auto-generated from IUBAT'S Curriculamn - IUBAT CSE Curriculum (B231).csv
// Source of truth for IUBAT B.Sc. in CSE (B231 curriculum: 59 courses, 11 semesters)

export interface CurriculumCourseItem {
  code: string;
  name: string;
  credits: number;
  semester: number;
  description: string;
  topics: string;
  projects: string;
  cos: string[];
}

export const IUBAT_CSE_B231_CURRICULUM: CurriculumCourseItem[] = [
  {
    "code": "ENG 101",
    "name": "Basic English Composition",
    "credits": 4,
    "semester": 1,
    "description": "Foundational course in English grammar, paragraph and essay structure, and academic writing conventions.",
    "topics": "• Paragraph structure\n• Grammar & sentence construction\n• Academic writing conventions\n• Peer editing & revision",
    "projects": "• Short essays\n• In-class writing exercises\n• Peer review workshops",
    "cos": [
      "Construct grammatically correct sentences and paragraphs",
      "Organize ideas into a structured essay",
      "Apply basic academic writing conventions",
      "Revise written work based on feedback"
    ]
  },
  {
    "code": "CSC 103",
    "name": "Fundamentals of Computers and Applications",
    "credits": 3,
    "semester": 1,
    "description": "Introduces computer hardware/software basics, operating systems, and common productivity applications.",
    "topics": "• Computer hardware basics\n• OS fundamentals\n• Word processing & spreadsheets\n• File management\n• Internet basics",
    "projects": "• Document formatting exercise\n• Spreadsheet data-entry assignment",
    "cos": [
      "Identify core computer hardware and software components",
      "Operate common productivity applications",
      "Manage files and folders effectively",
      "Describe basic internet and networking concepts"
    ]
  },
  {
    "code": "CSC 104",
    "name": "Computer Applications Lab",
    "credits": 1,
    "semester": 1,
    "description": "Hands-on lab pairing CSC 103, practicing office productivity software and basic computer operations.",
    "topics": "• Word processing practice\n• Spreadsheet formulas\n• Basic presentation software\n• File organization",
    "projects": "• Formatted document lab\n• Spreadsheet calculation lab\n• Slide deck exercise",
    "cos": [
      "Demonstrate proficiency in word processing software",
      "Build spreadsheets using basic formulas",
      "Create a simple slide presentation"
    ]
  },
  {
    "code": "ENV 103",
    "name": "Environmental Science",
    "credits": 2,
    "semester": 1,
    "description": "Survey of ecological principles, environmental issues, and sustainability concepts.",
    "topics": "• Ecosystems & biodiversity\n• Pollution & climate change\n• Sustainability principles\n• Environmental policy basics",
    "projects": "• Environmental issue report\n• Class discussion/case study",
    "cos": [
      "Explain fundamental ecological concepts",
      "Identify major environmental issues",
      "Discuss sustainability practices relevant to technology and industry"
    ]
  },
  {
    "code": "ART 102",
    "name": "Educational Planning",
    "credits": 1,
    "semester": 1,
    "description": "Orientation course helping students plan their academic path and set goals for university life.",
    "topics": "• Academic goal-setting\n• Time management\n• University resources & policies",
    "projects": "• Personal academic plan document",
    "cos": [
      "Develop a personal academic plan",
      "Apply basic time-management techniques",
      "Identify university academic support resources"
    ]
  },
  {
    "code": "ART 103",
    "name": "Professional Etiquette and Grooming",
    "credits": 0,
    "semester": 3,
    "description": "Non-credit orientation course covering professional conduct, communication etiquette, and presentation.",
    "topics": "• Workplace etiquette\n• Professional communication\n• Personal presentation standards",
    "projects": "• Mock professional interaction exercise",
    "cos": [
      "Demonstrate appropriate professional etiquette",
      "Apply grooming and presentation standards expected in professional settings"
    ]
  },
  {
    "code": "ART 204",
    "name": "Modern Living",
    "credits": 2,
    "semester": 1,
    "description": "General studies course examining contemporary social, cultural, and lifestyle topics relevant to modern life.",
    "topics": "• Contemporary social issues\n• Cultural awareness\n• Personal finance basics\n• Health & well-being",
    "projects": "• Reflective essay\n• Group discussion presentation",
    "cos": [
      "Discuss contemporary social and cultural issues",
      "Apply basic personal-finance concepts",
      "Reflect on lifestyle choices affecting well-being"
    ]
  },
  {
    "code": "CSC 183",
    "name": "Programming C",
    "credits": 3,
    "semester": 2,
    "description": "Introduction to procedural programming using C, covering syntax, control flow, and basic data structures.",
    "topics": "• Variables & data types\n• Control flow (loops/conditionals)\n• Functions\n• Arrays & pointers\n• Basic I/O",
    "projects": "• Calculator program\n• Array-based data processing program\n• Small command-line utility",
    "cos": [
      "Write and debug C programs using core control structures",
      "Implement functions and manage scope",
      "Use arrays and pointers for data manipulation"
    ]
  },
  {
    "code": "CSC 184",
    "name": "Programming C Lab",
    "credits": 1,
    "semester": 2,
    "description": "Lab component of CSC 183, focused on hands-on implementation and debugging of C programs.",
    "topics": "• Compiling & debugging C code\n• Function implementation\n• Pointer exercises",
    "projects": "• Weekly lab programming exercises\n• Small console application",
    "cos": [
      "Implement working C programs from specification",
      "Debug common syntax and logic errors independently"
    ]
  },
  {
    "code": "ENG 102",
    "name": "English Comprehensions and Speaking",
    "credits": 3,
    "semester": 2,
    "description": "Builds on ENG 101 with focus on reading comprehension, oral communication, and presentation skills.",
    "topics": "• Reading comprehension strategies\n• Oral presentation skills\n• Public speaking basics\n• Listening skills",
    "projects": "• Oral presentation\n• Reading comprehension assessments",
    "cos": [
      "Summarize and interpret written texts",
      "Deliver a structured oral presentation",
      "Apply active-listening techniques"
    ]
  },
  {
    "code": "MAT 147",
    "name": "Applied Calculus",
    "credits": 3,
    "semester": 2,
    "description": "Covers differential and integral calculus with applications relevant to engineering and computing.",
    "topics": "• Limits & derivatives\n• Integration techniques\n• Applications of calculus\n• Series & sequences (intro)",
    "projects": "• Problem sets\n• Applied calculus case study",
    "cos": [
      "Compute derivatives and integrals of standard functions",
      "Apply calculus to solve rate-of-change and optimization problems",
      "Interpret graphical representations of functions"
    ]
  },
  {
    "code": "CSC 283",
    "name": "Programming (C++)",
    "credits": 3,
    "semester": 3,
    "description": "Introduces object-oriented programming concepts using C++, building on procedural C foundations.",
    "topics": "• OOP fundamentals (classes/objects)\n• Inheritance & polymorphism\n• Encapsulation\n• Standard Template Library (intro)\n• Memory management basics",
    "projects": "• Class-based simulation program\n• Inheritance hierarchy project\n• Small OOP application",
    "cos": [
      "Design classes using encapsulation and abstraction",
      "Apply inheritance and polymorphism",
      "Implement basic C++ programs using OOP principles"
    ]
  },
  {
    "code": "CSC 284",
    "name": "Programming Lab (C++)",
    "credits": 1,
    "semester": 3,
    "description": "Lab component of CSC 283 focused on implementing object-oriented C++ programs.",
    "topics": "• Class implementation practice\n• Debugging OOP code\n• STL container usage",
    "projects": "• Weekly OOP lab exercises\n• Small class-hierarchy project",
    "cos": [
      "Implement class hierarchies in C++",
      "Debug object-oriented programs"
    ]
  },
  {
    "code": "ENG 203",
    "name": "Advanced English Composition",
    "credits": 3,
    "semester": 3,
    "description": "Advanced academic and technical writing, including research-based and argumentative essays.",
    "topics": "• Argumentative writing\n• Research & citation basics\n• Technical writing conventions\n• Editing for clarity",
    "projects": "• Research-based essay\n• Technical report draft",
    "cos": [
      "Construct well-supported argumentative essays",
      "Apply proper citation practices",
      "Produce clear technical writing"
    ]
  },
  {
    "code": "MAT 219",
    "name": "Linear Algebra",
    "credits": 2,
    "semester": 3,
    "description": "Introduces vectors, matrices, and linear transformations with applications to computing and data science.",
    "topics": "• Vectors & matrix operations\n• Systems of linear equations\n• Eigenvalues & eigenvectors\n• Linear transformations",
    "projects": "• Matrix computation problem sets\n• Applied linear-algebra case study (e.g. transformations in graphics)",
    "cos": [
      "Perform matrix operations and solve linear systems",
      "Compute eigenvalues and eigenvectors",
      "Apply linear algebra concepts to computing applications"
    ]
  },
  {
    "code": "PHY 111",
    "name": "Physics",
    "credits": 3,
    "semester": 3,
    "description": "Introductory physics covering mechanics, energy, and basic electromagnetism relevant to engineering students.",
    "topics": "• Kinematics & dynamics\n• Energy & work\n• Basic electromagnetism\n• Waves (intro)",
    "projects": "• Physics lab problem sets\n• Applied physics report",
    "cos": [
      "Apply Newtonian mechanics to solve motion problems",
      "Explain energy conservation principles",
      "Describe basic electromagnetic phenomena"
    ]
  },
  {
    "code": "PHY 112",
    "name": "Physics Lab",
    "credits": 1,
    "semester": 3,
    "description": "Lab component of PHY 111 with hands-on experiments in mechanics and basic electromagnetism.",
    "topics": "• Experimental measurement techniques\n• Data recording & analysis\n• Basic circuit experiments",
    "projects": "• Lab experiment reports\n• Measurement & error-analysis exercise",
    "cos": [
      "Conduct basic physics experiments accurately",
      "Record and analyze experimental data",
      "Report findings in a structured lab report"
    ]
  },
  {
    "code": "CSC 231",
    "name": "Fundamentals of Electronics and Digital",
    "credits": 3,
    "semester": 5,
    "description": "Covers basic electronics and digital logic concepts foundational to computer hardware.",
    "topics": "• Basic circuit theory\n• Digital logic gates\n• Number systems\n• Combinational logic (intro)",
    "projects": "• Digital logic problem sets\n• Basic circuit design exercise",
    "cos": [
      "Explain fundamental electronic circuit concepts",
      "Analyze basic digital logic circuits",
      "Convert between number systems used in digital systems"
    ]
  },
  {
    "code": "CSC 232",
    "name": "Electronics and Digital Lab",
    "credits": 1,
    "semester": 5,
    "description": "Lab component of CSC 231, hands-on construction and testing of basic digital circuits.",
    "topics": "• Breadboard circuit building\n• Logic gate testing\n• Basic circuit troubleshooting",
    "projects": "• Digital circuit lab exercises\n• Simple logic circuit build",
    "cos": [
      "Build and test basic digital logic circuits",
      "Troubleshoot simple circuit faults"
    ]
  },
  {
    "code": "CSC 391",
    "name": "Data Structures and Algorithms",
    "credits": 4,
    "semester": 4,
    "description": "Core course covering fundamental data structures and algorithm design/analysis techniques.",
    "topics": "• Arrays, linked lists, stacks & queues\n• Trees & graphs\n• Sorting & searching algorithms\n• Algorithm complexity (Big-O)\n• Recursion",
    "projects": "• Custom data structure implementation\n• Sorting algorithm comparison project\n• Graph traversal implementation",
    "cos": [
      "Implement core data structures from scratch",
      "Analyze algorithm time/space complexity",
      "Apply appropriate data structures to solve computational problems",
      "Design and implement sorting and searching algorithms"
    ]
  },
  {
    "code": "ELP 002",
    "name": "Intermediate English",
    "credits": 0,
    "semester": 4,
    "description": "Non-credit supplementary English language course for students needing additional language support.",
    "topics": "• Grammar reinforcement\n• Vocabulary building\n• Basic conversational English",
    "projects": "• Language practice exercises",
    "cos": [
      "Apply intermediate-level English grammar",
      "Communicate using expanded vocabulary"
    ]
  },
  {
    "code": "MAT 247",
    "name": "Numerical Analysis",
    "credits": 3,
    "semester": 4,
    "description": "Covers numerical methods for solving mathematical problems computationally.",
    "topics": "• Root-finding methods\n• Numerical integration/differentiation\n• Interpolation\n• Error analysis",
    "projects": "• Numerical method implementation (e.g., in Python/C)\n• Comparative accuracy analysis",
    "cos": [
      "Implement numerical methods for root-finding and integration",
      "Analyze error and convergence of numerical methods",
      "Apply interpolation techniques to data"
    ]
  },
  {
    "code": "STA 240",
    "name": "Statistics",
    "credits": 3,
    "semester": 4,
    "description": "Introduces probability and statistics concepts foundational to data analysis and machine learning.",
    "topics": "• Descriptive statistics\n• Probability distributions\n• Hypothesis testing\n• Regression basics",
    "projects": "• Statistical analysis of a dataset\n• Probability problem sets",
    "cos": [
      "Compute descriptive statistics from data",
      "Apply probability distributions to model uncertainty",
      "Conduct basic hypothesis tests",
      "Interpret regression results"
    ]
  },
  {
    "code": "BUS 201",
    "name": "Business Communications",
    "credits": 3,
    "semester": 5,
    "description": "Focuses on professional written and verbal communication in business/workplace contexts.",
    "topics": "• Business writing (memos, reports, emails)\n• Professional presentations\n• Workplace communication etiquette",
    "projects": "• Business report writing\n• Mock professional presentation",
    "cos": [
      "Draft professional business documents",
      "Deliver an effective workplace presentation",
      "Apply appropriate business communication etiquette"
    ]
  },
  {
    "code": "CHM 117",
    "name": "General Chemistry",
    "credits": 3,
    "semester": 6,
    "description": "Introductory chemistry covering atomic structure, chemical bonding, and reactions.",
    "topics": "• Atomic structure\n• Chemical bonding\n• Reaction types & stoichiometry\n• States of matter",
    "projects": "• Chemistry problem sets\n• Applied chemistry report",
    "cos": [
      "Explain atomic structure and bonding",
      "Balance and interpret chemical equations",
      "Describe properties of different states of matter"
    ]
  },
  {
    "code": "CHM 118",
    "name": "Chemistry Lab",
    "credits": 1,
    "semester": 6,
    "description": "Lab component of CHM 117 with hands-on experiments in basic chemical reactions and measurement.",
    "topics": "• Lab safety & technique\n• Titration & measurement\n• Basic reaction experiments",
    "projects": "• Chemistry lab reports",
    "cos": [
      "Conduct basic chemistry experiments safely",
      "Record and interpret experimental results"
    ]
  },
  {
    "code": "PHI 114",
    "name": "Introduction to Philosophy",
    "credits": 3,
    "semester": 6,
    "description": "Survey of major philosophical questions, reasoning methods, and ethical frameworks.",
    "topics": "• Logic & argumentation\n• Ethical frameworks\n• Epistemology basics\n• Philosophy of mind (intro)",
    "projects": "• Philosophical argument essay\n• Class debate",
    "cos": [
      "Construct logically valid arguments",
      "Analyze ethical frameworks applied to real scenarios",
      "Critically evaluate philosophical positions"
    ]
  },
  {
    "code": "CSC 197",
    "name": "Assembly Language",
    "credits": 3,
    "semester": 4,
    "description": "Introduces low-level programming concepts using assembly language and processor architecture basics.",
    "topics": "• CPU registers & memory addressing\n• Instruction sets\n• Low-level program flow\n• Assembly-to-machine code mapping",
    "projects": "• Assembly language programs (arithmetic, loops)\n• Register-level debugging exercise",
    "cos": [
      "Write basic assembly language programs",
      "Explain how high-level constructs map to low-level instructions",
      "Debug programs at the register/memory level"
    ]
  },
  {
    "code": "CSC 247",
    "name": "Computer Organization and Architecture",
    "credits": 3,
    "semester": 5,
    "description": "Covers CPU architecture, memory hierarchy, and instruction execution at the hardware level.",
    "topics": "• CPU architecture\n• Memory hierarchy & caching\n• Instruction pipelines\n• I/O organization",
    "projects": "• CPU simulation exercise\n• Memory hierarchy performance analysis",
    "cos": [
      "Explain CPU architecture and instruction execution",
      "Analyze memory hierarchy performance trade-offs",
      "Describe pipelining and its effect on performance"
    ]
  },
  {
    "code": "CSC 329",
    "name": "Logic Design and Switching Circuits",
    "credits": 3,
    "semester": 5,
    "description": "Advanced digital logic design covering combinational and sequential circuits.",
    "topics": "• Combinational circuit design\n• Sequential circuits & flip-flops\n• State machines\n• Karnaugh maps",
    "projects": "• Sequential circuit design project\n• State machine implementation",
    "cos": [
      "Design combinational logic circuits using minimization techniques",
      "Design sequential circuits using flip-flops",
      "Model systems as finite state machines"
    ]
  },
  {
    "code": "CSC 330",
    "name": "Logic Lab",
    "credits": 1,
    "semester": 5,
    "description": "Lab component of CSC 329, hands-on design and testing of digital logic circuits.",
    "topics": "• Circuit simulation tools\n• Sequential circuit testing\n• State machine verification",
    "projects": "• Digital logic lab builds",
    "cos": [
      "Implement and test sequential logic circuits",
      "Verify circuit behavior against a design specification"
    ]
  },
  {
    "code": "CSC 433",
    "name": "Database Management Systems",
    "credits": 3,
    "semester": 7,
    "description": "Covers relational database theory, design, and query languages.",
    "topics": "• Relational model\n• ER modeling\n• Normalization\n• SQL querying\n• Transactions & concurrency (intro)",
    "projects": "• Database schema design project\n• SQL query assignment set",
    "cos": [
      "Design a normalized relational database schema",
      "Write SQL queries to retrieve and manipulate data",
      "Explain transaction and concurrency concepts"
    ]
  },
  {
    "code": "CSC 434",
    "name": "Database Management Systems Lab",
    "credits": 1,
    "semester": 7,
    "description": "Lab component of CSC 433, hands-on database implementation and querying.",
    "topics": "• SQL DDL/DML practice\n• Database implementation in a RDBMS\n• Query optimization basics",
    "projects": "• Hands-on database build and query lab",
    "cos": [
      "Implement a relational database from a schema design",
      "Execute and optimize SQL queries"
    ]
  },
  {
    "code": "MAT 257",
    "name": "Discrete Mathematics",
    "credits": 3,
    "semester": 5,
    "description": "Covers discrete structures foundational to computer science: logic, sets, graphs, and combinatorics.",
    "topics": "• Propositional & predicate logic\n• Set theory\n• Graph theory\n• Combinatorics\n• Proof techniques",
    "projects": "• Proof-writing problem sets\n• Graph theory application exercise",
    "cos": [
      "Construct formal logical proofs",
      "Apply graph theory to model computational problems",
      "Solve combinatorics problems relevant to algorithm analysis"
    ]
  },
  {
    "code": "CSC 215",
    "name": "Engineering Ethics",
    "credits": 1,
    "semester": 8,
    "description": "Introduces ethical principles and professional responsibility in engineering and technology practice.",
    "topics": "• Professional codes of ethics\n• Case studies in engineering ethics\n• Ethical decision-making frameworks",
    "projects": "• Ethics case study analysis",
    "cos": [
      "Apply ethical frameworks to engineering decision-making",
      "Analyze real-world engineering ethics case studies"
    ]
  },
  {
    "code": "CSC 307",
    "name": "Operating System",
    "credits": 3,
    "semester": 7,
    "description": "Covers operating system concepts including process management, memory management, and file systems.",
    "topics": "• Process & thread management\n• CPU scheduling\n• Memory management & virtual memory\n• File systems\n• Synchronization & deadlocks",
    "projects": "• Process scheduling simulation\n• Synchronization problem implementation (e.g., producer-consumer)",
    "cos": [
      "Explain process and memory management in an OS",
      "Implement CPU scheduling algorithms",
      "Analyze synchronization problems and deadlock conditions"
    ]
  },
  {
    "code": "CSC 347",
    "name": "Computer Hardware and Maintenance",
    "credits": 2,
    "semester": 9,
    "description": "Practical course on computer hardware components, assembly, and troubleshooting.",
    "topics": "• Hardware components & assembly\n• Troubleshooting techniques\n• Preventive maintenance\n• Peripheral devices",
    "projects": "• Hardware assembly/diagnostic exercise",
    "cos": [
      "Assemble and configure computer hardware components",
      "Diagnose and resolve common hardware faults"
    ]
  },
  {
    "code": "CSC 348",
    "name": "Hardware Lab",
    "credits": 2,
    "semester": 9,
    "description": "Lab component of CSC 347, hands-on hardware assembly and diagnostics.",
    "topics": "• Hands-on hardware assembly\n• Diagnostic tool usage\n• Component testing",
    "projects": "• Hardware build lab\n• Diagnostic troubleshooting exercise",
    "cos": [
      "Perform hands-on hardware assembly and testing",
      "Use diagnostic tools to identify hardware faults"
    ]
  },
  {
    "code": "EEN 183",
    "name": "Circuit Analysis",
    "credits": 3,
    "semester": 8,
    "description": "Covers analysis of electrical circuits including DC/AC circuit theory.",
    "topics": "• DC circuit analysis\n• AC circuit theory\n• Circuit theorems (Thevenin/Norton)\n• Basic filters",
    "projects": "• Circuit analysis problem sets\n• Circuit simulation exercise",
    "cos": [
      "Analyze DC and AC circuits using standard techniques",
      "Apply circuit theorems to simplify complex circuits"
    ]
  },
  {
    "code": "EEN 184",
    "name": "Circuit Lab I",
    "credits": 1,
    "semester": 8,
    "description": "Lab component of EEN 183, hands-on circuit construction and measurement.",
    "topics": "• Circuit building & measurement\n• Oscilloscope/multimeter usage\n• Basic filter testing",
    "projects": "• Circuit lab experiments",
    "cos": [
      "Build and measure basic electrical circuits",
      "Use standard lab instruments for circuit analysis"
    ]
  },
  {
    "code": "ART 202",
    "name": "Career Planning and Development-I",
    "credits": 1,
    "semester": 11,
    "description": "Early career-planning course helping students explore career paths and build professional foundations.",
    "topics": "• Career exploration\n• Resume basics\n• Professional goal-setting",
    "projects": "• Draft resume/CV\n• Career exploration report",
    "cos": [
      "Draft a professional resume",
      "Identify career paths aligned with personal interests and skills"
    ]
  },
  {
    "code": "CSC 387",
    "name": "System Analysis and Design",
    "credits": 3,
    "semester": 9,
    "description": "Covers methodologies for analyzing and designing information systems, including requirements and modeling.",
    "topics": "• Requirements gathering\n• System modeling (DFD/UML)\n• SDLC methodologies\n• Design documentation",
    "projects": "• System analysis case study\n• Requirements/design document for a sample system",
    "cos": [
      "Gather and document system requirements",
      "Model a system using standard diagramming techniques",
      "Apply an SDLC methodology to a system design case study"
    ]
  },
  {
    "code": "CSE 3391",
    "name": "Web Engineering",
    "credits": 3,
    "semester": 8,
    "description": "Covers principles of designing, building, and engineering web-based applications and systems.",
    "topics": "• Web architecture\n• Frontend/backend fundamentals\n• HTTP & client-server model\n• Web application design principles",
    "projects": "• Multi-page web application project\n• Client-server web app prototype",
    "cos": [
      "Design a web application architecture",
      "Implement a functional client-server web application",
      "Apply web engineering principles to a project"
    ]
  },
  {
    "code": "ENG 250",
    "name": "Public Speaking",
    "credits": 3,
    "semester": 6,
    "description": "Develops formal public speaking and presentation skills for academic and professional contexts.",
    "topics": "• Speech structuring\n• Delivery techniques\n• Audience engagement\n• Handling Q&A",
    "projects": "• Formal public speech\n• Persuasive presentation",
    "cos": [
      "Deliver a structured formal speech",
      "Apply effective vocal and body-language delivery techniques",
      "Engage an audience and handle questions confidently"
    ]
  },
  {
    "code": "CSC 439",
    "name": "Visual Programming",
    "credits": 3,
    "semester": 9,
    "description": "Covers GUI-based application development using visual programming environments.",
    "topics": "• GUI design principles\n• Event-driven programming\n• Form/control-based development\n• Visual IDE tooling",
    "projects": "• Desktop GUI application project",
    "cos": [
      "Design a graphical user interface for an application",
      "Implement event-driven program logic",
      "Build a functioning desktop application using a visual IDE"
    ]
  },
  {
    "code": "CSC 440",
    "name": "Visual Programming Lab",
    "credits": 1,
    "semester": 9,
    "description": "Lab component of CSC 439, hands-on GUI application development.",
    "topics": "• Hands-on GUI building\n• Event-handler implementation",
    "projects": "• GUI application lab exercises",
    "cos": [
      "Implement working GUI components",
      "Debug event-driven application logic"
    ]
  },
  {
    "code": "CSE 4357",
    "name": "Principles and Techniques of Data Science",
    "credits": 3,
    "semester": 7,
    "description": "Introduces the data science pipeline: data collection, cleaning, analysis, and visualization.",
    "topics": "• Data cleaning & preprocessing\n• Exploratory data analysis\n• Data visualization\n• Intro to predictive modeling",
    "projects": "• End-to-end data analysis project on a real/sample dataset\n• Data visualization dashboard",
    "cos": [
      "Clean and preprocess a raw dataset",
      "Perform exploratory data analysis",
      "Build visualizations to communicate data insights",
      "Apply a basic predictive model to a dataset"
    ]
  },
  {
    "code": "CSE 4385",
    "name": "Computer Vision and Image Processing",
    "credits": 3,
    "semester": 7,
    "description": "Covers fundamentals of digital image processing and computer vision techniques.",
    "topics": "• Image representation & filtering\n• Edge detection\n• Feature extraction\n• Basic object detection concepts",
    "projects": "• Image filtering/processing project\n• Basic object detection exercise",
    "cos": [
      "Apply image processing filters to digital images",
      "Implement edge/feature detection techniques",
      "Explain fundamental computer vision pipeline concepts"
    ]
  },
  {
    "code": "CSC 488",
    "name": "Thesis",
    "credits": 3,
    "semester": 9,
    "description": "Independent research project applying CSE knowledge to a self-defined problem, under faculty supervision.",
    "topics": "• Research methodology\n• Literature review\n• Technical writing & documentation\n• Project/system implementation",
    "projects": "• Thesis proposal\n• Implemented thesis project/system\n• Final thesis report & defense",
    "cos": [
      "Formulate a research problem and literature review",
      "Design and implement a solution to the research problem",
      "Document and defend findings in a formal thesis report"
    ]
  },
  {
    "code": "CSC 397",
    "name": "Theory of Computation",
    "credits": 4,
    "semester": 9,
    "description": "Covers formal models of computation, automata theory, and computability/complexity.",
    "topics": "• Finite automata & regular languages\n• Context-free grammars\n• Turing machines\n• Computability & complexity (intro)",
    "projects": "• Automata design problem sets\n• Formal language proof assignments",
    "cos": [
      "Design finite automata for given languages",
      "Prove properties of formal languages",
      "Explain computability and complexity fundamentals"
    ]
  },
  {
    "code": "CSC 437",
    "name": "Compiler Design",
    "credits": 3,
    "semester": 10,
    "description": "Covers the phases of compiler construction from lexical analysis to code generation.",
    "topics": "• Lexical analysis\n• Parsing (syntax analysis)\n• Semantic analysis\n• Intermediate code generation\n• Optimization basics",
    "projects": "• Simple lexer/parser implementation\n• Mini-compiler project for a small language",
    "cos": [
      "Implement a lexical analyzer for a simple language",
      "Build a parser using a standard parsing technique",
      "Explain the stages of a compiler pipeline"
    ]
  },
  {
    "code": "CSC 465",
    "name": "Data Communication and Computer Network",
    "credits": 3,
    "semester": 10,
    "description": "Covers networking fundamentals including protocols, topologies, and the OSI/TCP-IP models.",
    "topics": "• OSI & TCP/IP models\n• Network protocols (TCP/UDP/IP)\n• Routing & switching basics\n• Network security fundamentals",
    "projects": "• Network simulation exercise\n• Protocol analysis assignment",
    "cos": [
      "Explain the OSI and TCP/IP models",
      "Analyze network protocol behavior",
      "Describe basic network security concepts"
    ]
  },
  {
    "code": "CSC 466",
    "name": "Network Lab",
    "credits": 1,
    "semester": 10,
    "description": "Lab component of CSC 465, hands-on network configuration and analysis.",
    "topics": "• Network configuration tools\n• Packet analysis (e.g. Wireshark-style)\n• Basic routing setup",
    "projects": "• Network configuration lab\n• Packet capture analysis exercise",
    "cos": [
      "Configure basic network settings and routing",
      "Analyze captured network traffic"
    ]
  },
  {
    "code": "CSE 4383",
    "name": "Artificial Intelligence and Expert Systems",
    "credits": 3,
    "semester": 10,
    "description": "Introduces AI fundamentals including search algorithms, knowledge representation, and expert systems.",
    "topics": "• Search algorithms\n• Knowledge representation\n• Expert system rule-based reasoning\n• Intro to machine learning concepts",
    "projects": "• Search algorithm implementation\n• Simple rule-based expert system project",
    "cos": [
      "Implement classic AI search algorithms",
      "Design a knowledge representation for a problem domain",
      "Build a simple rule-based expert system"
    ]
  },
  {
    "code": "CSC 471",
    "name": "Microprocessor Design",
    "credits": 3,
    "semester": 11,
    "description": "Covers microprocessor architecture, instruction execution, and interfacing with peripheral systems.",
    "topics": "• Microprocessor architecture\n• Instruction cycles\n• Memory & I/O interfacing\n• Embedded system basics",
    "projects": "• Microprocessor interfacing project\n• Simple embedded system design",
    "cos": [
      "Explain microprocessor architecture and instruction execution",
      "Design a basic microprocessor interfacing circuit",
      "Apply embedded system design principles"
    ]
  },
  {
    "code": "CSC 469",
    "name": "Software Engineering",
    "credits": 3,
    "semester": 11,
    "description": "Covers software development lifecycle, requirements engineering, design, and project management practices.",
    "topics": "• SDLC models (Agile/Waterfall)\n• Requirements engineering\n• Software design principles\n• Testing & QA\n• Project management basics",
    "projects": "• Software requirements specification for a sample project\n• Software design document",
    "cos": [
      "Apply an SDLC methodology to a software project",
      "Write a software requirements specification",
      "Design a software system using standard modeling techniques",
      "Apply basic testing and QA practices"
    ]
  },
  {
    "code": "CSC 470",
    "name": "Software Engineering Lab",
    "credits": 1,
    "semester": 11,
    "description": "Lab component of CSC 469, hands-on application of software engineering practices to a team project.",
    "topics": "• Team-based project development\n• Version control practice\n• Iterative development practice",
    "projects": "• Team software project implementation using an SDLC methodology",
    "cos": [
      "Apply software engineering practices in a team project setting",
      "Use version control in a collaborative development workflow"
    ]
  },
  {
    "code": "ART 203",
    "name": "Career Planning",
    "credits": 1,
    "semester": 11,
    "description": "Final-semester career-readiness course focused on job search strategy and transition to the workforce.",
    "topics": "• Job search strategy\n• Interview preparation\n• Personal branding\n• Workplace transition",
    "projects": "• Mock interview\n• Final resume/portfolio review",
    "cos": [
      "Apply an effective job search strategy",
      "Perform confidently in a mock interview",
      "Present a professional resume/portfolio"
    ]
  },
  {
    "code": "CSE 4317",
    "name": "Machine Learning and Practices",
    "credits": 3,
    "semester": 11,
    "description": "This course introduces the fundamental theory and design of machine learning algorithms. It covers formal models of learning, generalization theory, optimization methods, and core learning algorithms, progressing from linear models to ensemble methods and modern deep learning architectures.",
    "topics": "• Concept Learning\n• PAC Learning Framework\n• Bias-Variance Tradeoff\n• Linear Regression\n• Gradient Descent\n• Support Vector Machines\n• Decision Trees\n• Clustering\n• Multi-Layer Perceptrons\n• Convolutional Neural Networks\n• Attention & Transformers",
    "projects": "• (not specified in the source outline — example only) Applied ML project on a sample dataset",
    "cos": [
      "Explain the fundamentals of learning by machines with algorithms.",
      "Apply the concepts of learning theories and algorithms to solve problems.",
      "Analyze real life problems to propose a solution using the concepts of learning theories and algorithms."
    ]
  }
];

export function getCoursesBySemester(semester: number): CurriculumCourseItem[] {
  return IUBAT_CSE_B231_CURRICULUM.filter((c) => c.semester === semester);
}

export function searchCurriculumCourses(query: string): CurriculumCourseItem[] {
  const q = query.trim().toLowerCase();
  if (!q) return IUBAT_CSE_B231_CURRICULUM;
  return IUBAT_CSE_B231_CURRICULUM.filter(
    (c) => c.code.toLowerCase().includes(q) || c.name.toLowerCase().includes(q) || c.description.toLowerCase().includes(q)
  );
}
