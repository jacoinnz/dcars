/**
 * Reference for class groups, rolls, and codes in NZ schools.
 * Aligns with common Year 0–13 labelling and timetabling practice.
 *
 * @see https://newzealandcurriculum.tahurangi.education.govt.nz/
 */

export type NzYearLevelRow = {
  year: string;
  label: string;
  typicalNotes: string;
};

/** NZ school year levels (common labelling). */
export const NZ_YEAR_LEVELS: NzYearLevelRow[] = [
  { year: "0", label: "Year 0 / New Entrant", typicalNotes: "First year of primary; overlap with ECE possible." },
  { year: "1–6", label: "Years 1–6 (primary)", typicalNotes: "Often taught in syndicates or year-level bands." },
  { year: "7–8", label: "Years 7–8 (intermediate)", typicalNotes: "May be on a separate site or part of a Year 7–13 college." },
  { year: "9–10", label: "Years 9–10 (junior secondary)", typicalNotes: "Broad curriculum; foundation for NCEA." },
  { year: "11", label: "Year 11", typicalNotes: "NCEA Level 1 cohort (most learners)." },
  { year: "12", label: "Year 12", typicalNotes: "NCEA Level 2 cohort." },
  { year: "13", label: "Year 13", typicalNotes: "NCEA Level 3 cohort; final year of schooling for most." },
];

export type NzClassKindRow = {
  kind: string;
  purpose: string;
  codeHints: string;
};

export const NZ_CLASS_KINDS: NzClassKindRow[] = [
  {
    kind: "Form / whānau / home room",
    purpose: "Daily organisation, pastoral care, attendance roll; may not map 1:1 to every subject line.",
    codeHints: "Often {Year}{Stream} e.g. 10A, 10B, 10WAI; or house-based codes.",
  },
  {
    kind: "Subject teaching class",
    purpose: "Timetabled teaching group for one subject — the line that appears on a student’s timetable.",
    codeHints: "Often {Year}{Subject}{Set} e.g. 12PHY-A, 9ENG-2, 11MAT-EXT.",
  },
  {
    kind: "Composite / multi-level",
    purpose: "Small schools may combine year levels in one teaching group.",
    codeHints: "e.g. 7/8SOC, 9–10PE; document which NZQA/NCEA rules apply for seniors.",
  },
  {
    kind: "Option / elective line",
    purpose: "Elective blocks (arts, tech rotations, languages).",
    codeHints: "Short codes + rotation term if needed e.g. 10OPT-DVC-T3.",
  },
];

export type NzNamingPatternRow = {
  pattern: string;
  example: string;
  notes: string;
};

export const NZ_NAMING_PATTERNS: NzNamingPatternRow[] = [
  {
    pattern: "Year + stream letter",
    example: "9A, 9B, 10C",
    notes: "Common for form classes; stream letters are local (A–Z, colours, whānau names).",
  },
  {
    pattern: "Year + subject abbreviation + set",
    example: "11ENG-1, 12BIO-A",
    notes: "Subject lines; keep abbreviations consistent with your subjects catalog.",
  },
  {
    pattern: "Kura / bilingual prefix",
    example: "RM10-ARO, 9RM-P",
    notes: "Bilingual or rumaki lines — prefix conventions are school-specific.",
  },
  {
    pattern: "Short internal code",
    example: "CLS-2026-10A",
    notes: "Use when exporting to SMS or analytics; pair with a human-readable label.",
  },
];

export type NzExampleRollRow = {
  code: string;
  description: string;
  detail: string;
};

/** Illustrative codes only — adopt patterns, not these exact strings. */
export const NZ_EXAMPLE_CLASS_CODES: NzExampleRollRow[] = [
  { code: "8MNU-1", description: "Year 8 Mathematics — set 1", detail: "Subject line" },
  { code: "10ART-A", description: "Year 10 Visual arts — class A", detail: "Subject line" },
  { code: "11ENG-LIT", description: "Year 11 English — literature focus", detail: "Subject line (if split)" },
  { code: "12FNS-2", description: "Year 12 course line (example code)", detail: "Align with NZQA course codes in your SMS" },
  { code: "13FORM-K", description: "Year 13 form / whānau group K", detail: "Pastoral / attendance roll" },
  { code: "9PE-ROT3", description: "Year 9 PE — rotation 3", detail: "Junior option / module rotation" },
];
