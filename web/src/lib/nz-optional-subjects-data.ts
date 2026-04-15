/**
 * Reference for optional / elective subjects in NZ schools — cataloguing and naming.
 * Complements the core subjects list; NCEA course codes come from NZQA / your SMS.
 *
 * @see https://www.nzqa.govt.nz/
 */

export type NzOptionalConceptRow = {
  term: string;
  meaning: string;
  nzNotes: string;
};

export const NZ_OPTIONAL_CONCEPTS: NzOptionalConceptRow[] = [
  {
    term: "Elective / optional line",
    meaning: "A subject students choose instead of (or in addition to) a default pathway.",
    nzNotes: "Senior years: aligns with NCEA course selection; junior years: often rotation or short modules.",
  },
  {
    term: "Core vs option",
    meaning: "Core = compulsory for the year or programme; option = chosen from a list within rules.",
    nzNotes: "Schools publish option booklets; prerequisites and staffing drive what runs each year.",
  },
  {
    term: "Module / rotation",
    meaning: "Short blocks (e.g. half-year, term) through arts, tech, or languages.",
    nzNotes: "Common in Years 9–10 before specialising for NCEA.",
  },
  {
    term: "Half-course / full-course",
    meaning: "Contact hours and credits differ; two half-courses may fill one line on the timetable.",
    nzNotes: "Naming should show level and duration in your SMS to avoid clashes.",
  },
];

export type NzOptionalDomainRow = {
  domain: string;
  examples: string;
  codeHints: string;
};

/** Common domains for optional lines (illustrative). */
export const NZ_OPTIONAL_DOMAINS: NzOptionalDomainRow[] = [
  {
    domain: "Additional languages",
    examples: "Second language beyond compulsory Te Reo pathway; community languages.",
    codeHints: "LANG-OPT-*, align with subjects catalog codes.",
  },
  {
    domain: "Arts & performance",
    examples: "Dance, drama, music, visual arts beyond core minimum.",
    codeHints: "ART-*-OPT or year+set e.g. 10ART-B-OPT.",
  },
  {
    domain: "Technology & design",
    examples: "DVC, digital tech, food, hard materials, textiles — extra lines.",
    codeHints: "TEC-DVC-OPT; keep distinct from compulsory tech rotation codes.",
  },
  {
    domain: "Business & social sciences",
    examples: "Accounting, economics, tourism, psychology as electives.",
    codeHints: "SOC-*-EL; check NCEA subject packages for official titles.",
  },
  {
    domain: "Science extensions",
    examples: "Extra science when not all are compulsory; scholarship prep lines.",
    codeHints: "SCI-*-ADV; document prerequisites in your option booklet.",
  },
];

export type NzOptionalNamingRow = {
  pattern: string;
  example: string;
  notes: string;
};

export const NZ_OPTIONAL_NAMING: NzOptionalNamingRow[] = [
  {
    pattern: "OPT- prefix",
    example: "OPT-12-GEO",
    notes: "Shows optional line + year + subject abbreviation.",
  },
  {
    pattern: "ELEC + band",
    example: "ELEC-Y10-SEM2",
    notes: "Semester-based electives in junior secondary.",
  },
  {
    pattern: "Same subject code + -OPT",
    example: "MUS-OPT",
    notes: "When optional is an extension of a core offering.",
  },
  {
    pattern: "NZQA-aligned title in display name",
    example: "Display: “Level 2 Biology” — Code: 12BIO-OPT",
    notes: "Official assessment titles live in NZQA; your code is for timetable and roll.",
  },
];

export type NzOptionalExampleRow = {
  code: string;
  description: string;
  detail: string;
};

export const NZ_OPTIONAL_EXAMPLES: NzOptionalExampleRow[] = [
  { code: "10-ROT-DVC", description: "Year 10 rotation — DVC module", detail: "Junior option block" },
  { code: "11-EL-PSY", description: "Year 11 elective — Psychology", detail: "NCEA course line" },
  { code: "12-OPT-SPA", description: "Year 12 optional — Spanish", detail: "Additional language" },
  { code: "OPT-HOS-L2", description: "Optional hospitality — Level 2", detail: "Vocational pathway" },
];
