/** Examinations menu: live routes vs planned (`/examinations/feature/[key]`). */

export type ExaminationPanelStatus = "live" | "planned";

export type ExaminationPanelItem = {
  key: string;
  title: string;
  description: string;
  status: ExaminationPanelStatus;
  /** Hub link when the whole flow starts at a fixed URL (e.g. `/examinations`). */
  href?: string;
};

export type ExaminationPanelGroup = {
  id: string;
  title: string;
  description?: string;
  items: ExaminationPanelItem[];
};

export const EXAMINATION_PANEL_GROUPS: ExaminationPanelGroup[] = [
  {
    id: "centre",
    title: "School examination centre",
    description: "Pick a school, create exam periods, and open a period for the full workspace.",
    items: [
      {
        key: "add-exam",
        title: "Add exam",
        description:
          "Create a new exam period (e.g. mid-year) under a school you manage, then add timetable slots and marks.",
        status: "live",
        href: "/examinations",
      },
      {
        key: "exam",
        title: "Exam",
        description:
          "Browse exam periods per school, open a period for routine text, timetable, seat plan, mark entry, and summary report.",
        status: "live",
        href: "/examinations",
      },
    ],
  },
  {
    id: "types",
    title: "Exam types & catalog",
    description: "Named exam categories and reusable templates — not wired to data yet.",
    items: [
      {
        key: "add-exam-type",
        title: "Add exam type",
        description:
          "Define types such as mid-term, final, or board-style exams with default rules — planned (needs catalog and policy fields).",
        status: "planned",
      },
    ],
  },
  {
    id: "schedule-venue",
    title: "Schedule, venue & instructions",
    items: [
      {
        key: "exam-schedule",
        title: "Exam schedule",
        description:
          "Published timetable of papers with date, start/end time, and venue — on each exam period page.",
        status: "live",
      },
      {
        key: "date-time-organization",
        title: "Date & time organization",
        description:
          "Add and maintain schedule slots (date, times, paper name, venue) for the period.",
        status: "live",
      },
      {
        key: "schedule-notice",
        title: "Schedule notice",
        description:
          "Short notice text for students and invigilators (arrival time, ID, equipment) shown with the schedule.",
        status: "live",
      },
      {
        key: "seat-plan",
        title: "Seat plan",
        description: "Free-text seating layout or room instructions for the exam period.",
        status: "live",
      },
      {
        key: "exam-routine",
        title: "Exam routine",
        description:
          "Rules, dress code, equipment, and general exam-day instructions for the period.",
        status: "live",
      },
      {
        key: "instruction",
        title: "Instruction",
        description:
          "Overall instructions for candidates; use the routine and schedule notice blocks on the period page.",
        status: "live",
      },
    ],
  },
  {
    id: "marks",
    title: "Marks, register & report",
    items: [
      {
        key: "marks-register",
        title: "Marks register",
        description:
          "Enter marks per student and paper in the grid; scores persist for the exam period.",
        status: "live",
      },
      {
        key: "mark-sheet-report",
        title: "Mark sheet & report",
        description:
          "Mark sheet grid plus an average summary table; use print for a PDF-friendly snapshot.",
        status: "live",
      },
      {
        key: "marks-grade",
        title: "Marks grade",
        description:
          "Letter or GPA bands from raw marks (per subject or scale) — planned (needs grading schemes).",
        status: "planned",
      },
      {
        key: "exam-attendance",
        title: "Exam attendance",
        description:
          "Register of who sat each paper (separate from daily roll) — planned (needs attendance model per session).",
        status: "planned",
      },
    ],
  },
  {
    id: "digital",
    title: "Question bank & online exam",
    description: "Digital item banks and invigilated online papers — roadmap.",
    items: [
      {
        key: "question-group",
        title: "Question group",
        description:
          "Group questions by topic, difficulty, or syllabus section for assembly into papers — planned.",
        status: "planned",
      },
      {
        key: "question-bank",
        title: "Question bank",
        description: "Central repository of items with versioning and approval — planned.",
        status: "planned",
      },
      {
        key: "online-exam",
        title: "Online exam",
        description:
          "Timed delivery, attempt limits, and integrity options — planned (requires assessment engine).",
        status: "planned",
      },
    ],
  },
];

const ALL_KEYS = new Set(EXAMINATION_PANEL_GROUPS.flatMap((g) => g.items.map((i) => i.key)));

export function isExaminationFeatureKey(key: string): boolean {
  return ALL_KEYS.has(key);
}

export function getExaminationFeatureByKey(key: string): ExaminationPanelItem | undefined {
  for (const g of EXAMINATION_PANEL_GROUPS) {
    const f = g.items.find((i) => i.key === key);
    if (f) return f;
  }
  return undefined;
}

/** Extra copy for live items that live inside an exam period (no top-level URL). */
export const EXAMINATION_FEATURE_EMBEDDED_HELP: Record<string, string> = {
  "exam-schedule":
    "On an exam period page, use the Schedule section: timetable table plus optional notice text above it.",
  "date-time-organization":
    "Still on the period page — add rows with paper name, date, start/end time, and venue; edit by removing a row and re-adding if needed.",
  "schedule-notice":
    "On the period page, in the Schedule section, edit the notice textarea (managers only) so it appears above the timetable.",
  "seat-plan": "On the period page, open the Seat plan section and save the free-text layout.",
  "exam-routine": "On the period page, use the Exam routine section at the top for rules and general instructions.",
  instruction:
    "Combine the routine block and the schedule notice for candidate instructions; both are on the exam period page.",
  "marks-register":
    "On the period page, scroll to the Mark sheet section: columns follow timetable papers (or your tab-separated override), then save marks.",
  "mark-sheet-report":
    "The same period page includes the mark sheet grid and, below it, the Exam report table with percentage and averages. Use your browser print for PDF.",
};
