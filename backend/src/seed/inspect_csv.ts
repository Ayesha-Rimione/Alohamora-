import fs from "fs";
import path from "path";

// A CSV parser that correctly handles multi-line quoted fields
export function parseCsv(content: string) {
  const rows: string[][] = [];
  let currentRow: string[] = [];
  let currentVal = "";
  let insideQuote = false;

  for (let i = 0; i < content.length; i++) {
    const char = content[i];
    const nextChar = content[i + 1];

    if (char === '"' && insideQuote && nextChar === '"') {
      currentVal += '"';
      i++;
    } else if (char === '"') {
      insideQuote = !insideQuote;
    } else if (char === "," && !insideQuote) {
      currentRow.push(currentVal.trim());
      currentVal = "";
    } else if ((char === "\r" || char === "\n") && !insideQuote) {
      if (char === "\r" && nextChar === "\n") i++;
      currentRow.push(currentVal.trim());
      if (currentRow.length > 1 || (currentRow.length === 1 && currentRow[0] !== "")) {
        rows.push(currentRow);
      }
      currentRow = [];
      currentVal = "";
    } else {
      currentVal += char;
    }
  }

  if (currentVal || currentRow.length > 0) {
    currentRow.push(currentVal.trim());
    if (currentRow.length > 1 || (currentRow.length === 1 && currentRow[0] !== "")) {
      rows.push(currentRow);
    }
  }

  return rows;
}

const csvPath = path.resolve(__dirname, "../../../IUBAT'S Curriculamn - IUBAT CSE Curriculum (B231).csv");
const text = fs.readFileSync(csvPath, "utf-8");
const rows = parseCsv(text);
const dataRows = rows.slice(1);

console.log(`Parsed ${dataRows.length} courses from CSV.`);
const allCourses = dataRows.map((r) => ({
  code: r[0],
  name: r[1],
  credits: parseFloat(r[2]) || 0,
  semester: parseInt(r[3], 10) || 1,
  description: r[4] || "",
  topics: r[5] || "",
  projects: r[6] || "",
  co1: r[7] || "",
  co2: r[8] || "",
  co3: r[9] || "",
  co4: r[10] || "",
  co5: r[11] || "",
}));

// Find zero-credit courses
const zeroCredits = allCourses.filter((c) => c.credits === 0);
console.log("Zero credit courses:", zeroCredits.map((c) => `${c.code} (${c.name}, Sem ${c.semester})`));

// Distribution
const semDist: Record<number, number> = {};
for (const c of allCourses) {
  semDist[c.semester] = (semDist[c.semester] || 0) + 1;
}
console.log("Semester counts:", semDist);
