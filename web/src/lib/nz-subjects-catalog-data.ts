/**
 * Reference subject catalog aligned with The New Zealand Curriculum (NZC)
 * learning areas and common secondary-school / NCEA-style offerings.
 * Schools may use local naming; codes are suggested for timetabling and reports.
 *
 * @see https://newzealandcurriculum.tahurangi.education.govt.nz/
 */

export type NzSubjectRow = {
  /** Short stable code for imports and reporting (suggested). */
  code: string;
  /** Display name as commonly used in NZ schools. */
  name: string;
  /** Optional note (e.g. NCEA Level typical, or junior integrated). */
  note?: string;
};

export type NzLearningAreaBlock = {
  /** NZC learning area id (slug). */
  id: string;
  /** English title (NZC). */
  title: string;
  /** Te reo name where commonly paired in curriculum materials. */
  titleMi?: string;
  /** Subjects / strands commonly listed under this area in NZ. */
  subjects: NzSubjectRow[];
};

export const NZ_LEARNING_AREAS: NzLearningAreaBlock[] = [
  {
    id: "english",
    title: "English",
    titleMi: "Reo Pākehā",
    subjects: [
      { code: "ENG", name: "English", note: "Reading, writing, listening, speaking — Years 1–13" },
      { code: "ENG-LIT", name: "Literacy / language inquiry" },
      { code: "ENG-ESOL", name: "English for speakers of other languages (ESOL)" },
    ],
  },
  {
    id: "the-arts",
    title: "The arts",
    titleMi: "Ngā Toi",
    subjects: [
      { code: "ART-DAN", name: "Dance" },
      { code: "ART-DRA", name: "Drama" },
      { code: "ART-MUS", name: "Music — Sound arts" },
      { code: "ART-MUS-ST", name: "Music studies" },
      { code: "ART-VIS", name: "Visual arts" },
      { code: "ART-AH", name: "Art history" },
    ],
  },
  {
    id: "health-pe",
    title: "Health and physical education",
    titleMi: "Hauora",
    subjects: [
      { code: "HPE-H", name: "Health education" },
      { code: "HPE-PE", name: "Physical education" },
      { code: "HPE-ODE", name: "Outdoor education" },
      { code: "HPE-SWIM", name: "Aquatics / swimming" },
    ],
  },
  {
    id: "languages",
    title: "Learning languages",
    titleMi: "Kia hora te reo",
    subjects: [
      { code: "LANG-TRM", name: "Te reo Māori", note: "National language of NZ; offered at all levels" },
      { code: "LANG-NZSL", name: "New Zealand Sign Language (NZSL)" },
      { code: "LANG-FR", name: "French" },
      { code: "LANG-DE", name: "German" },
      { code: "LANG-ES", name: "Spanish" },
      { code: "LANG-JA", name: "Japanese" },
      { code: "LANG-ZH", name: "Chinese" },
      { code: "LANG-SM", name: "Samoan" },
      { code: "LANG-TO", name: "Tongan" },
      { code: "LANG-FA", name: "Cook Islands Māori / other Pacific languages (as offered)" },
    ],
  },
  {
    id: "mathematics",
    title: "Mathematics and statistics",
    titleMi: "Pāngarau",
    subjects: [
      { code: "MAT", name: "Mathematics", note: "Number, algebra, geometry, measurement — often integrated in Years 7–10" },
      { code: "MAT-STAT", name: "Statistics" },
      { code: "MAT-CALC", name: "Calculus", note: "Typically NCEA Levels 2–3" },
      { code: "MAT-MECH", name: "Mechanics / modelling", note: "Where offered as extension" },
    ],
  },
  {
    id: "science",
    title: "Science",
    titleMi: "Pūtaiao",
    subjects: [
      { code: "SCI", name: "Science (integrated)", note: "Junior secondary; nature of science strands" },
      { code: "SCI-BIO", name: "Biology" },
      { code: "SCI-CHEM", name: "Chemistry" },
      { code: "SCI-PHY", name: "Physics" },
      { code: "SCI-EARTH", name: "Earth and space science" },
      { code: "SCI-AGH", name: "Agricultural and horticultural science" },
      { code: "SCI-ELEC", name: "Electronics" },
      { code: "SCI-ENV", name: "Education for sustainability / environmental science", note: "Cross-curricular" },
    ],
  },
  {
    id: "social-sciences",
    title: "Social sciences",
    titleMi: "Tikanga-ā-iwi",
    subjects: [
      { code: "SOC", name: "Social studies", note: "Often integrated Years 7–10" },
      { code: "SOC-HIST", name: "History" },
      { code: "SOC-GEO", name: "Geography" },
      { code: "SOC-CLAS", name: "Classical studies" },
      { code: "SOC-ECON", name: "Economics" },
      { code: "SOC-BUS", name: "Business studies" },
      { code: "SOC-ACC", name: "Accounting" },
      { code: "SOC-LAW", name: "Legal studies" },
      { code: "SOC-PSY", name: "Psychology" },
      { code: "SOC-MED", name: "Media studies" },
      { code: "SOC-TOUR", name: "Tourism" },
      { code: "SOC-SEN", name: "Senior social studies", note: "NCEA social inquiry" },
    ],
  },
  {
    id: "technology",
    title: "Technology",
    titleMi: "Hangarau",
    subjects: [
      { code: "TEC-DVC", name: "Design and visual communication (DVC)" },
      { code: "TEC-DIG", name: "Digital technologies", note: "Computational thinking & design — Digital Technologies | Hangarau Matihiko" },
      { code: "TEC-FOOD", name: "Food technology / hospitality" },
      { code: "TEC-HARD", name: "Hard materials technology" },
      { code: "TEC-TEX", name: "Textiles technology" },
      { code: "TEC-ENG", name: "Engineering / workshop technology" },
      { code: "TEC-AG", name: "Agriculture / primary industries technology" },
    ],
  },
];
