import type { CourseRecord } from "@/lib/cgpa";

export const DEFAULT_COURSES: CourseRecord[] = [
  { id: "c-1", code: "CSE 111", name: "Computer Fundamentals & Programming", credits: 3, grade: "A", semester: "1st year, Term 1", confidence: 5 },
  { id: "c-2", code: "CSE 221", name: "Data Structures", credits: 3, grade: "A-", semester: "1st year, Term 2", confidence: 4 },
  { id: "c-3", code: "CSE 325", name: "Database Management Systems", credits: 3, grade: "B+", semester: "2nd year, Term 1", confidence: 4 },
  { id: "c-4", code: "CSE 331", name: "Algorithms Analysis & Design", credits: 3, grade: "A", semester: "2nd year, Term 2", confidence: 4 },
  { id: "c-5", code: "MAT 215", name: "Probability & Statistics", credits: 3, grade: "B", semester: "3rd year, Term 1", confidence: 3 },
  { id: "c-6", code: "BUS 201", name: "Business & Technical Communication", credits: 2, grade: "A", semester: "3rd year, Term 1", confidence: 4 },
];

