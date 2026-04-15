/** Maps admin menu items to live routes or planned module keys (see `/admin/module/[key]`). */

export type AdminModuleStatus = "live" | "planned";

export type AdminModuleCard = {
  key: string;
  title: string;
  description: string;
  status: AdminModuleStatus;
  /** In-app path when status is `live` (opens directly). */
  href?: string;
};

export type AdminModuleGroup = {
  id: string;
  title: string;
  description?: string;
  items: AdminModuleCard[];
};

export const ADMIN_MODULE_GROUPS: AdminModuleGroup[] = [
  {
    id: "core",
    title: "Core admin setup",
    description: "Sites, schools, and who can sign in.",
    items: [
      {
        key: "user-accounts",
        title: "User accounts",
        description: "Create logins and per-site access (view/create/update/delete).",
        status: "live",
        href: "/admin/users",
      },
      {
        key: "sites",
        title: "Programme sites",
        description: "Delivery locations and site codes.",
        status: "live",
        href: "/admin/sites",
      },
      {
        key: "schools",
        title: "Schools",
        description: "Institutions under each site: classes, syllabuses, staff, guardians, attendance notes.",
        status: "live",
        href: "/admin/institutions",
      },
    ],
  },
  {
    id: "front-office",
    title: "Front office",
    description: "Reception workflows — planned as dedicated modules.",
    items: [
      {
        key: "front-office-setup",
        title: "Setup front office",
        description: "Configure reception desks, templates, and workflows (planned).",
        status: "planned",
      },
      {
        key: "admission-query",
        title: "Admission query",
        description: "Track and respond to admission enquiries (planned).",
        status: "planned",
      },
      {
        key: "visitor-book",
        title: "Visitor book",
        description: "Sign-in/out and badges for visitors (planned).",
        status: "planned",
      },
      {
        key: "phone-call-log",
        title: "Phone call log",
        description: "Log inbound and outbound calls (planned).",
        status: "planned",
      },
      {
        key: "postal-receive",
        title: "Postal receive",
        description: "Register incoming post and parcels (planned).",
        status: "planned",
      },
      {
        key: "postal-dispatch",
        title: "Postal dispatch",
        description: "Outgoing mail and courier records (planned).",
        status: "planned",
      },
      {
        key: "complaints",
        title: "Complaints",
        description: "Formal complaint intake, assignment, and resolution (planned).",
        status: "planned",
      },
      {
        key: "complaint-phone-call-log",
        title: "Complaint",
        description: "Log complaints received by phone with follow-up (planned).",
        status: "planned",
      },
    ],
  },
  {
    id: "people",
    title: "Teachers, students & parents",
    description: "What exists today in this app versus broader SIS features.",
    items: [
      {
        key: "classes-subjects",
        title: "Classes & syllabuses",
        description: "Per-school classes and syllabus documents (staff view + admin edit).",
        status: "live",
        href: "/admin/institutions",
      },
      {
        key: "student-admission",
        title: "Student admission",
        description: "Participant registration and linking students to a school record.",
        status: "live",
        href: "/students?tab=add-student",
      },
      {
        key: "student-details",
        title: "Student details",
        description: "Rosters, class enrolment, and profiles per school.",
        status: "live",
        href: "/students",
      },
      {
        key: "guardians",
        title: "Parents / guardians",
        description: "Link guardian accounts to students for family attendance (per school in Admin → school).",
        status: "live",
        href: "/admin/institutions",
      },
      {
        key: "student-category",
        title: "Student category",
        description: "Tags such as boarder, scholarship, SEND tier (planned).",
        status: "planned",
      },
      {
        key: "student-group",
        title: "Student group",
        description: "House, club, or cohort groups beyond classes (planned).",
        status: "planned",
      },
      {
        key: "disabled-students",
        title: "Disabled students",
        description: "Accessibility and learning-support flags (planned).",
        status: "planned",
      },
      {
        key: "student-promote",
        title: "Student promote",
        description: "Bulk move students to the next class/year (planned).",
        status: "planned",
      },
    ],
  },
  {
    id: "academics",
    title: "Academics & routine",
    items: [
      {
        key: "optional-subjects",
        title: "Optional subjects",
        description:
          "NZ electives and option lines — concepts, domains, naming patterns, and example codes (reference catalog).",
        status: "live",
        href: "/academics/module/optional-subjects",
      },
      {
        key: "academic-section",
        title: "Section",
        description:
          "NZ school phases, divisions, and section naming — reference for organisational bands (not subject classes).",
        status: "live",
        href: "/academics/module/academic-section",
      },
      {
        key: "school-classes",
        title: "Class",
        description:
          "NZ year levels, form vs subject classes, naming patterns, and example codes (reference for rolls and timetabling).",
        status: "live",
        href: "/academics/module/school-classes",
      },
      {
        key: "subjects-catalog",
        title: "Subjects",
        description:
          "NZ Curriculum learning areas and suggested subject names and codes for timetabling and reporting (reference catalog).",
        status: "live",
        href: "/academics/module/subjects-catalog",
      },
      {
        key: "assign-class-teacher",
        title: "Assign class teacher",
        description: "Homeroom and class teacher assignments (planned).",
        status: "planned",
      },
      {
        key: "assign-subject",
        title: "Assign subject",
        description: "Link subjects to classes and teachers (planned).",
        status: "planned",
      },
      {
        key: "classroom-allocation",
        title: "Class room",
        description: "Room codes, capacity, and allocation to classes (planned).",
        status: "planned",
      },
      {
        key: "class-routine",
        title: "Class routine",
        description: "Timetable / period grid per class (planned).",
        status: "planned",
      },
      {
        key: "exams-grades",
        title: "Exams & coursework grades",
        description: "Exam series and evaluation performance scores by class.",
        status: "live",
        href: "/examinations",
      },
      {
        key: "evaluations",
        title: "Coursework & evaluations",
        description: "Score entry and reports (categories, date range, class filters).",
        status: "live",
        href: "/evaluations",
      },
      {
        key: "exam-marks-email",
        title: "Email exam marks",
        description: "Send mark sheets or summaries to guardians by email (planned; needs mail provider).",
        status: "planned",
      },
    ],
  },
  {
    id: "attendance-certs",
    title: "Attendance & credentials",
    items: [
      {
        key: "attendance",
        title: "Student attendance",
        description: "Daily roll marks and family-facing view when guardians are linked.",
        status: "live",
        href: "/students/attendance",
      },
      {
        key: "student-certificate",
        title: "Student certificate",
        description: "Certificate templates and issuance history (planned).",
        status: "planned",
      },
      {
        key: "generate-certificate",
        title: "Generate certificate",
        description: "PDF generation for awards, completion, character (planned).",
        status: "planned",
      },
      {
        key: "student-id-card",
        title: "Student ID card",
        description: "ID card layout and data binding (planned).",
        status: "planned",
      },
      {
        key: "generate-id-card",
        title: "Generate ID card",
        description: "Export printable ID sheets or cards (planned).",
        status: "planned",
      },
      {
        key: "general-id-card",
        title: "General ID card",
        description: "Non-student ID credentials and templates (planned).",
        status: "planned",
      },
      {
        key: "staff-id-card",
        title: "Staff ID card",
        description: "Staff identity cards and reprints (planned).",
        status: "planned",
      },
    ],
  },
  {
    id: "events-comms",
    title: "Events & communications",
    items: [
      {
        key: "school-events",
        title: "School events & notices",
        description: "Holidays, events, and out-of-class notices per school.",
        status: "live",
        href: "/communications",
      },
      {
        key: "messaging",
        title: "Messaging between users",
        description: "In-app threads between staff, students, parents (planned).",
        status: "planned",
      },
    ],
  },
  {
    id: "finance",
    title: "Accounting",
    items: [
      {
        key: "accounting",
        title: "Income & expenses",
        description: "Fees, invoices, petty cash, and categories (planned).",
        status: "planned",
      },
    ],
  },
  {
    id: "facilities",
    title: "Library, dormitory & transport",
    items: [
      {
        key: "library",
        title: "Library",
        description: "Catalogue, loans, and fines (planned).",
        status: "planned",
      },
      {
        key: "dormitory",
        title: "Dormitory",
        description: "Rooms, bed allocation, and roll call (planned).",
        status: "planned",
      },
      {
        key: "transport",
        title: "Transport",
        description: "Routes, vehicles, and student assignments (planned).",
        status: "planned",
      },
    ],
  },
  {
    id: "download-center",
    title: "Download center",
    items: [
      {
        key: "content-type",
        title: "Content type",
        description: "Categories and rules for downloadable resources (planned).",
        status: "planned",
      },
      {
        key: "content-list",
        title: "Content list",
        description: "Files and documents available for download (planned).",
        status: "planned",
      },
      {
        key: "shared-content-list",
        title: "Shared content list",
        description: "Resources shared across sites or schools (planned).",
        status: "planned",
      },
      {
        key: "video-list",
        title: "Video list",
        description: "Video resources for streaming or download (planned).",
        status: "planned",
      },
    ],
  },
  {
    id: "study-material",
    title: "Study material",
    items: [
      {
        key: "study-upload-content",
        title: "Upload content",
        description: "Upload lesson files and resources for classes (planned).",
        status: "planned",
      },
      {
        key: "study-assignment",
        title: "Assignment",
        description: "Set and collect assignments with due dates (planned).",
        status: "planned",
      },
      {
        key: "study-syllabus",
        title: "Syllabus",
        description: "Per-class syllabus documents and versions (planned).",
        status: "planned",
      },
      {
        key: "study-other-downloads",
        title: "Other downloads",
        description: "Miscellaneous files for students and staff (planned).",
        status: "planned",
      },
    ],
  },
  {
    id: "lesson-plan",
    title: "Lesson plan",
    items: [
      {
        key: "lp-lesson",
        title: "Lesson",
        description: "Individual lesson records and sequencing (planned).",
        status: "planned",
      },
      {
        key: "lp-topic",
        title: "Topic",
        description: "Topics within a subject or unit (planned).",
        status: "planned",
      },
      {
        key: "lp-topic-overview",
        title: "Topic overview",
        description: "Summary view of topics and coverage (planned).",
        status: "planned",
      },
      {
        key: "lp-lesson-plan",
        title: "Lesson plan",
        description: "Structured lesson plans linked to classes (planned).",
        status: "planned",
      },
      {
        key: "lp-lesson-plan-overview",
        title: "Lesson plan overview",
        description: "Dashboard of plans by week, class, or teacher (planned).",
        status: "planned",
      },
    ],
  },
];

const ALL_KEYS = new Set(
  ADMIN_MODULE_GROUPS.flatMap((g) => g.items.map((i) => i.key)),
);

export function isAdminModuleKey(key: string): boolean {
  return ALL_KEYS.has(key);
}

export function getAdminModuleByKey(key: string): AdminModuleCard | undefined {
  for (const g of ADMIN_MODULE_GROUPS) {
    const found = g.items.find((i) => i.key === key);
    if (found) return found;
  }
  return undefined;
}
