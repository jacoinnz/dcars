/** Student portal menu (`/student`): live vs planned (`/student/feature/[key]`). */

export type StudentPanelStatus = "live" | "planned";

export type StudentPanelItem = {
  key: string;
  title: string;
  description: string;
  status: StudentPanelStatus;
  href?: string;
};

export type StudentPanelGroup = {
  id: string;
  title: string;
  description?: string;
  items: StudentPanelItem[];
};

export const STUDENT_PANEL_GROUPS: StudentPanelGroup[] = [
  {
    id: "schedule",
    title: "Schedule & attendance",
    items: [
      {
        key: "class-routine",
        title: "Class routine / timetable",
        description: "Your period-by-period timetable when the school publishes it here.",
        status: "planned",
      },
      {
        key: "attendance",
        title: "Attendance status",
        description: "See how your attendance has been recorded day by day.",
        status: "live",
        href: "/student/attendance",
      },
    ],
  },
  {
    id: "learning",
    title: "Marks & materials",
    items: [
      {
        key: "exam-marks",
        title: "Exam marks",
        description: "Formal exam papers and scores entered for your year group.",
        status: "live",
        href: "/student/marks",
      },
      {
        key: "study-materials",
        title: "Study materials & files",
        description: "Downloads your teachers uploaded for your school.",
        status: "live",
        href: "/student/materials",
      },
    ],
  },
  {
    id: "finance",
    title: "Fees & payments",
    items: [
      {
        key: "invoices",
        title: "Payment invoices",
        description: "View invoices and statements when billing is connected.",
        status: "planned",
      },
      {
        key: "pay-online",
        title: "Pay online",
        description: "Pay fees securely in the browser — planned with a payment provider.",
        status: "planned",
      },
    ],
  },
  {
    id: "communication",
    title: "Contact teachers",
    items: [
      {
        key: "messaging",
        title: "Communicate with teachers",
        description: "Secure messaging with staff — planned.",
        status: "planned",
      },
    ],
  },
];

const ALL_KEYS = new Set(STUDENT_PANEL_GROUPS.flatMap((g) => g.items.map((i) => i.key)));

export function isStudentFeatureKey(key: string): boolean {
  return ALL_KEYS.has(key);
}

export function getStudentFeatureByKey(key: string): StudentPanelItem | undefined {
  for (const g of STUDENT_PANEL_GROUPS) {
    const f = g.items.find((i) => i.key === key);
    if (f) return f;
  }
  return undefined;
}
