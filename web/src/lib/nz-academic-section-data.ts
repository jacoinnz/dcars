/**
 * Reference for academic sections / phases / divisions in NZ schools.
 * "Section" here means an organisational band (not a subject class line).
 *
 * @see https://newzealandcurriculum.tahurangi.education.govt.nz/
 */

export type NzSectionConceptRow = {
  concept: string;
  meaning: string;
  nzNotes: string;
};

export const NZ_SECTION_CONCEPTS: NzSectionConceptRow[] = [
  {
    concept: "Phase / school stage",
    meaning: "A reporting and pastoral band covering several year levels (e.g. junior secondary).",
    nzNotes: "Aligns with how timetables, deans, and NCEA transitions are often organised.",
  },
  {
    concept: "Division / community",
    meaning: "A named group spanning year levels — sometimes vertical (whānau / house).",
    nzNotes: "Common in full-primary or Year 7–13 schools for assemblies and sport.",
  },
  {
    concept: "Stream / pathway",
    meaning: "An academic or vocational track within a year band (e.g. sciences vs arts emphasis).",
    nzNotes: "Naming is school-specific; avoid clashing with subject class codes.",
  },
  {
    concept: "Campus / site",
    meaning: "When one organisation runs multiple sites, each may be a “section” for enrolment.",
    nzNotes: "Use site codes from your institution setup alongside academic section labels.",
  },
];

export type NzPhaseBandRow = {
  code: string;
  label: string;
  years: string;
  typicalUse: string;
};

/** Typical phase labels used in NZ (illustrative — your school may differ). */
export const NZ_PHASE_BANDS: NzPhaseBandRow[] = [
  {
    code: "PRI",
    label: "Primary",
    years: "Years 1–6 (sometimes 0–6)",
    typicalUse: "Syndicate or team structures; Te Whāriki transition into Year 1.",
  },
  {
    code: "INT",
    label: "Intermediate",
    years: "Years 7–8",
    typicalUse: "Standalone intermediate or middle of an area school / Year 7–13 college.",
  },
  {
    code: "JNR",
    label: "Junior secondary",
    years: "Years 9–10",
    typicalUse: "Broad curriculum; foundation before NCEA Level 1 in Year 11.",
  },
  {
    code: "SNR",
    label: "Senior secondary",
    years: "Years 11–13",
    typicalUse: "NCEA Levels 1–3; course selection and pathways focus.",
  },
  {
    code: "Y1-13",
    label: "Area / composite school",
    years: "Years 1–13 on one roll",
    typicalUse: "Single-site organisation; sections often split primary / middle / senior for leadership.",
  },
];

export type NzSectionNamingRow = {
  pattern: string;
  example: string;
  notes: string;
};

export const NZ_SECTION_NAMING: NzSectionNamingRow[] = [
  {
    pattern: "Phase abbreviation + label",
    example: "JNR — Junior",
    notes: "Short codes for SMS imports; pair with a full display name.",
  },
  {
    pattern: "Year range in name",
    example: "Years 9 & 10 Hub",
    notes: "Clear for families; longer in dropdowns — use a short code in parallel.",
  },
  {
    pattern: "Whānau / house name",
    example: "Tāne, Rongo (vertical)",
    notes: "Cross-year communities; membership is separate from academic year level.",
  },
  {
    pattern: "Curriculum level band (informal)",
    example: "NZC Levels 4–5 focus",
    notes: "Useful for planning; usually not a legal roll “section” on its own.",
  },
];

export type NzSectionExampleRow = {
  code: string;
  description: string;
  detail: string;
};

export const NZ_SECTION_EXAMPLES: NzSectionExampleRow[] = [
  { code: "SEC-LOWER", description: "Lower school (Years 7–10)", detail: "Example split in a Year 7–13 school" },
  { code: "SEC-UPPER", description: "Upper school (Years 11–13)", detail: "Deans / NCEA coordination" },
  { code: "PRI-N", description: "Primary North campus", detail: "Multi-site organisation" },
  { code: "WH-RUA", description: "Whānau Rua (vertical)", detail: "Pastoral / sport grouping" },
];
