/** Teacher panel menu: live app routes vs planned features (`/teachers/feature/[key]`). */

export type TeacherPanelStatus = "live" | "planned";

export type TeacherPanelItem = {
  key: string;
  title: string;
  description: string;
  status: TeacherPanelStatus;
  href?: string;
};

export type TeacherPanelGroup = {
  id: string;
  title: string;
  description?: string;
  items: TeacherPanelItem[];
};

export const TEACHER_PANEL_GROUPS: TeacherPanelGroup[] = [
  {
    id: "resources",
    title: "Homework, materials & files",
    description: "Share learning resources and (when available) set homework tasks.",
    items: [
      {
        key: "homework",
        title: "Add homework",
        description:
          "Create homework tasks, due dates, and instructions for classes — coming in a future release.",
        status: "planned",
      },
      {
        key: "upload-content",
        title: "Upload content",
        description: "Upload files for a programme site and school (PDFs, slides, etc.).",
        status: "live",
        href: "/teacher-content",
      },
      {
        key: "study-material",
        title: "Study material",
        description: "Same library as uploads — organise materials students should study from.",
        status: "live",
        href: "/teacher-content",
      },
      {
        key: "other-downloads",
        title: "Other downloads",
        description: "Browse and download everything your site has uploaded (shared file list).",
        status: "live",
        href: "/teacher-content",
      },
    ],
  },
  {
    id: "assessment",
    title: "Evaluation & assignments",
    items: [
      {
        key: "evaluation-report",
        title: "Evaluation report",
        description: "Filter by school and class, view averages, and enter coursework scores.",
        status: "live",
        href: "/evaluations",
      },
      {
        key: "assignments",
        title: "Assignments (scores)",
        description: "Record marks and categories for ongoing class assignments and assessments.",
        status: "live",
        href: "/evaluations",
      },
    ],
  },
  {
    id: "classroom",
    title: "Students, exams & attendance",
    items: [
      {
        key: "managing-students",
        title: "Managing students",
        description:
          "Student list per school, admission forms, and class enrolment — open a school from Student information.",
        status: "live",
        href: "/students",
      },
      {
        key: "exam-marks",
        title: "Managing exam marks",
        description: "Exam periods, timetables, seat plans, and mark entry for formal exams.",
        status: "live",
        href: "/examinations",
      },
      {
        key: "managing-attendance",
        title: "Managing attendance",
        description:
          "Daily student roll (present, absent, late, excused) — hub lists staff register and family views.",
        status: "live",
        href: "/students/attendance",
      },
    ],
  },
  {
    id: "people",
    title: "Teacher & colleagues",
    items: [
      {
        key: "teacher-directory",
        title: "Teacher & staff directory",
        description: "See who is assigned to which school (teachers and management).",
        status: "live",
        href: "/hr/directory",
      },
    ],
  },
];

const ALL_KEYS = new Set(TEACHER_PANEL_GROUPS.flatMap((g) => g.items.map((i) => i.key)));

export function isTeacherFeatureKey(key: string): boolean {
  return ALL_KEYS.has(key);
}

export function getTeacherFeatureByKey(key: string): TeacherPanelItem | undefined {
  for (const g of TEACHER_PANEL_GROUPS) {
    const f = g.items.find((i) => i.key === key);
    if (f) return f;
  }
  return undefined;
}
