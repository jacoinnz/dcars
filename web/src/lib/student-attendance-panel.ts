/** Student attendance hub: staff roll, student portal, and family views. */

export type StudentAttendancePanelStatus = "live" | "planned";

export type StudentAttendancePanelItem = {
  key: string;
  title: string;
  description: string;
  status: StudentAttendancePanelStatus;
  href?: string;
};

export type StudentAttendancePanelGroup = {
  id: string;
  title: string;
  description?: string;
  items: StudentAttendancePanelItem[];
};

export const STUDENT_ATTENDANCE_PANEL_GROUPS: StudentAttendancePanelGroup[] = [
  {
    id: "staff",
    title: "Staff — daily register",
    description:
      "Record one attendance mark per learner per calendar day for each school you support (present, absent, late, excused).",
    items: [
      {
        key: "daily-roll",
        title: "Student attendance (staff)",
        description:
          "Choose school and date, mark each student, and save. This is the programme roll — separate from HR staff attendance.",
        status: "live",
        href: "/attendance",
      },
    ],
  },
  {
    id: "portal",
    title: "Learner & family views",
    description: "Read-only views driven by the same roll data staff enter above.",
    items: [
      {
        key: "student-portal",
        title: "Student — my attendance",
        description:
          "Signed-in students linked to a profile can see their own marks for a date range.",
        status: "live",
        href: "/student/attendance",
      },
      {
        key: "family",
        title: "Family attendance",
        description:
          "Guardians linked under Admin → Schools see linked children’s attendance for the school.",
        status: "live",
        href: "/family",
      },
    ],
  },
];
