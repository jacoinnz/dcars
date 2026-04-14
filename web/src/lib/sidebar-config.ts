export type SidebarNavLink = { id: string; href: string; label: string; locked?: boolean };
export type SidebarNavSection = {
  id: string;
  title: string;
  items: SidebarNavLink[];
  locked?: boolean;
};
export type SidebarNavConfig = { version: 1; sections: SidebarNavSection[] };

export const SIDEBAR_STORAGE_KEY = "dcaars-sidebar-config-v9";
export const SIDEBAR_CONFIG_EVENT = "dcaars-sidebar-config";

const LOCKED_SECTION_IDS = new Set([
  "sec-dashboard",
  "sec-programme",
  "sec-students",
  "sec-academics",
  "sec-people",
  "sec-portals",
  "sec-teaching",
  "sec-download",
  "sec-study",
  "sec-lesson-plan",
  "sec-admin",
]);

export function getDefaultSidebarConfig(params?: { isSuperAdmin?: boolean }): SidebarNavConfig {
  const isSuperAdmin = Boolean(params?.isSuperAdmin);
  return {
    version: 1,
    sections: [
      {
        id: "sec-dashboard",
        title: "Dashboard",
        locked: true,
        items: [
          { id: "lnk-dash-home", href: "/dashboard", label: "Dashboard", locked: true },
        ],
      },
      {
        id: "sec-programme",
        title: "Programme",
        locked: true,
        items: [
          { id: "lnk-entry", href: "/entry", label: "Register participant", locked: true },
          { id: "lnk-reports", href: "/reports", label: "Reports", locked: true },
        ],
      },
      {
        id: "sec-students",
        title: "Students & school",
        locked: true,
        items: [
          { id: "lnk-students", href: "/students", label: "Students", locked: true },
          { id: "lnk-stu-att", href: "/students/attendance", label: "Student attendance", locked: true },
          { id: "lnk-eval", href: "/evaluations", label: "Evaluations", locked: true },
          { id: "lnk-exam", href: "/examinations", label: "Examinations", locked: true },
          { id: "lnk-comm", href: "/communications", label: "Communications", locked: true },
        ],
      },
      {
        id: "sec-academics",
        title: "Academics",
        locked: true,
        items: [
          { id: "lnk-ac-opt", href: "/academics/module/optional-subjects", label: "Optional subjects", locked: true },
          { id: "lnk-ac-sec", href: "/academics/module/academic-section", label: "Section", locked: true },
          { id: "lnk-ac-cl", href: "/academics/module/school-classes", label: "Class", locked: true },
          { id: "lnk-ac-subj", href: "/academics/module/subjects-catalog", label: "Subjects", locked: true },
          { id: "lnk-ac-act", href: "/academics/module/assign-class-teacher", label: "Assign class teacher", locked: true },
          { id: "lnk-ac-as", href: "/academics/module/assign-subject", label: "Assign subject", locked: true },
          { id: "lnk-ac-cr", href: "/academics/module/classroom-allocation", label: "Class room", locked: true },
          { id: "lnk-ac-rt", href: "/academics/module/class-routine", label: "Class routine", locked: true },
        ],
      },
      {
        id: "sec-people",
        title: "People",
        locked: true,
        items: [
          { id: "lnk-hr", href: "/hr", label: "HR", locked: true },
          { id: "lnk-teachers", href: "/teachers", label: "Teachers", locked: true },
          { id: "lnk-parents", href: "/parents", label: "Parents", locked: true },
        ],
      },
      {
        id: "sec-portals",
        title: "Portals",
        locked: true,
        items: [
          { id: "lnk-student-p", href: "/student", label: "Student portal", locked: true },
          { id: "lnk-family", href: "/family", label: "Family", locked: true },
        ],
      },
      {
        id: "sec-teaching",
        title: "Teaching",
        locked: true,
        items: [{ id: "lnk-tc", href: "/teacher-content", label: "Teacher content", locked: true }],
      },
      {
        id: "sec-download",
        title: "Download center",
        locked: true,
        items: [
          { id: "lnk-dc-ct", href: "/download-center/module/content-type", label: "Content type", locked: true },
          { id: "lnk-dc-cl", href: "/download-center/module/content-list", label: "Content list", locked: true },
          { id: "lnk-dc-scl", href: "/download-center/module/shared-content-list", label: "Shared content list", locked: true },
          { id: "lnk-dc-vl", href: "/download-center/module/video-list", label: "Video list", locked: true },
        ],
      },
      {
        id: "sec-study",
        title: "Study material",
        locked: true,
        items: [
          { id: "lnk-sm-up", href: "/study-material/module/study-upload-content", label: "Upload content", locked: true },
          { id: "lnk-sm-as", href: "/study-material/module/study-assignment", label: "Assignment", locked: true },
          { id: "lnk-sm-sy", href: "/study-material/module/study-syllabus", label: "Syllabus", locked: true },
          { id: "lnk-sm-od", href: "/study-material/module/study-other-downloads", label: "Other downloads", locked: true },
        ],
      },
      {
        id: "sec-lesson-plan",
        title: "Lesson plan",
        locked: true,
        items: [
          { id: "lnk-lp-l", href: "/lesson-plan/module/lp-lesson", label: "Lesson", locked: true },
          { id: "lnk-lp-t", href: "/lesson-plan/module/lp-topic", label: "Topic", locked: true },
          { id: "lnk-lp-to", href: "/lesson-plan/module/lp-topic-overview", label: "Topic overview", locked: true },
          { id: "lnk-lp-p", href: "/lesson-plan/module/lp-lesson-plan", label: "Lesson plan", locked: true },
          { id: "lnk-lp-po", href: "/lesson-plan/module/lp-lesson-plan-overview", label: "Lesson plan overview", locked: true },
        ],
      },
      ...(isSuperAdmin
        ? ([
            {
              id: "sec-admin",
              title: "Administration",
              locked: true,
              items: [
                { id: "lnk-admin", href: "/admin", label: "Admin", locked: true },
                { id: "lnk-admin-adm-q", href: "/admin/module/admission-query", label: "Admission query", locked: true },
                { id: "lnk-admin-vis", href: "/admin/module/visitor-book", label: "Visitors book", locked: true },
                {
                  id: "lnk-admin-compl",
                  href: "/admin/module/complaint-phone-call-log",
                  label: "Complaint phone call log",
                  locked: true,
                },
                { id: "lnk-admin-stu-id", href: "/admin/module/student-id-card", label: "Student ID card", locked: true },
                { id: "lnk-admin-gen-id", href: "/admin/module/general-id-card", label: "General ID card", locked: true },
                { id: "lnk-admin-staff-id", href: "/admin/module/staff-id-card", label: "Staff ID card", locked: true },
              ],
            },
          ] satisfies SidebarNavSection[])
        : []),
    ],
  };
}

export function normalizeSidebarConfigForUser(
  config: SidebarNavConfig,
  params?: { isSuperAdmin?: boolean },
): SidebarNavConfig {
  const isSuperAdmin = Boolean(params?.isSuperAdmin);
  const withLocks: SidebarNavConfig = {
    ...config,
    sections: config.sections.map((s) => ({
      ...s,
      locked: LOCKED_SECTION_IDS.has(s.id) ? true : Boolean(s.locked),
      items: s.items.map((i) => ({
        ...i,
        locked: LOCKED_SECTION_IDS.has(s.id) ? true : Boolean(i.locked),
      })),
    })),
  };
  if (isSuperAdmin) return withLocks;
  // Ensure non-admins never see admin links, even if present in saved config.
  return {
    ...withLocks,
    sections: withLocks.sections.filter((s) => s.id !== "sec-admin"),
  };
}

function isValidConfig(raw: unknown): raw is SidebarNavConfig {
  if (!raw || typeof raw !== "object") return false;
  const o = raw as Record<string, unknown>;
  if (o.version !== 1) return false;
  if (!Array.isArray(o.sections)) return false;
  for (const s of o.sections) {
    if (!s || typeof s !== "object") return false;
    const sec = s as Record<string, unknown>;
    if (typeof sec.id !== "string" || typeof sec.title !== "string" || !Array.isArray(sec.items)) {
      return false;
    }
    if (sec.locked !== undefined && typeof sec.locked !== "boolean") return false;
    for (const it of sec.items) {
      if (!it || typeof it !== "object") return false;
      const link = it as Record<string, unknown>;
      if (typeof link.id !== "string" || typeof link.href !== "string" || typeof link.label !== "string") {
        return false;
      }
      if (link.locked !== undefined && typeof link.locked !== "boolean") return false;
    }
  }
  return true;
}

export function loadSidebarConfig(): SidebarNavConfig | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(SIDEBAR_STORAGE_KEY);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    if (!isValidConfig(parsed)) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function saveSidebarConfig(config: SidebarNavConfig): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(SIDEBAR_STORAGE_KEY, JSON.stringify(config));
  window.dispatchEvent(new Event(SIDEBAR_CONFIG_EVENT));
}

export function clearSidebarConfig(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(SIDEBAR_STORAGE_KEY);
  window.dispatchEvent(new Event(SIDEBAR_CONFIG_EVENT));
}
