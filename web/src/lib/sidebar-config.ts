export type SidebarNavLink = { id: string; href: string; label: string };
export type SidebarNavSection = { id: string; title: string; items: SidebarNavLink[] };
export type SidebarNavConfig = { version: 1; sections: SidebarNavSection[] };

export const SIDEBAR_STORAGE_KEY = "dcaars-sidebar-config-v6";
export const SIDEBAR_CONFIG_EVENT = "dcaars-sidebar-config";

export function getDefaultSidebarConfig(): SidebarNavConfig {
  return {
    version: 1,
    sections: [
      {
        id: "sec-dashboard",
        title: "Dashboard",
        items: [
          { id: "lnk-dash-home", href: "/dashboard", label: "Dashboard" },
          { id: "lnk-dash-notice", href: "/dashboard#notice-board", label: "Notice board" },
          { id: "lnk-dash-cal", href: "/dashboard#dashboard-calendar", label: "Calendar" },
          { id: "lnk-dash-todo", href: "/dashboard#dashboard-todo", label: "To do list" },
        ],
      },
      {
        id: "sec-programme",
        title: "Programme",
        items: [
          { id: "lnk-entry", href: "/entry", label: "Register participant" },
          { id: "lnk-reports", href: "/reports", label: "Reports" },
        ],
      },
      {
        id: "sec-students",
        title: "Students & school",
        items: [
          { id: "lnk-students", href: "/students", label: "Students" },
          { id: "lnk-stu-att", href: "/students/attendance", label: "Student attendance" },
          { id: "lnk-eval", href: "/evaluations", label: "Evaluations" },
          { id: "lnk-exam", href: "/examinations", label: "Examinations" },
          { id: "lnk-comm", href: "/communications", label: "Communications" },
        ],
      },
      {
        id: "sec-academics",
        title: "Academics",
        items: [
          { id: "lnk-ac-opt", href: "/academics/module/optional-subjects", label: "Optional subjects" },
          { id: "lnk-ac-sec", href: "/academics/module/academic-section", label: "Section" },
          { id: "lnk-ac-cl", href: "/academics/module/school-classes", label: "Class" },
          { id: "lnk-ac-subj", href: "/academics/module/subjects-catalog", label: "Subjects" },
          { id: "lnk-ac-act", href: "/academics/module/assign-class-teacher", label: "Assign class teacher" },
          { id: "lnk-ac-as", href: "/academics/module/assign-subject", label: "Assign subject" },
          { id: "lnk-ac-cr", href: "/academics/module/classroom-allocation", label: "Class room" },
          { id: "lnk-ac-rt", href: "/academics/module/class-routine", label: "Class routine" },
        ],
      },
      {
        id: "sec-people",
        title: "People",
        items: [
          { id: "lnk-hr", href: "/hr", label: "HR" },
          { id: "lnk-teachers", href: "/teachers", label: "Teachers" },
          { id: "lnk-parents", href: "/parents", label: "Parents" },
        ],
      },
      {
        id: "sec-portals",
        title: "Portals",
        items: [
          { id: "lnk-student-p", href: "/student", label: "Student portal" },
          { id: "lnk-family", href: "/family", label: "Family" },
        ],
      },
      {
        id: "sec-teaching",
        title: "Teaching",
        items: [{ id: "lnk-tc", href: "/teacher-content", label: "Teacher content" }],
      },
      {
        id: "sec-download",
        title: "Download center",
        items: [
          { id: "lnk-dc-ct", href: "/download-center/module/content-type", label: "Content type" },
          { id: "lnk-dc-cl", href: "/download-center/module/content-list", label: "Content list" },
          { id: "lnk-dc-scl", href: "/download-center/module/shared-content-list", label: "Shared content list" },
          { id: "lnk-dc-vl", href: "/download-center/module/video-list", label: "Video list" },
        ],
      },
      {
        id: "sec-study",
        title: "Study material",
        items: [
          { id: "lnk-sm-up", href: "/study-material/module/study-upload-content", label: "Upload content" },
          { id: "lnk-sm-as", href: "/study-material/module/study-assignment", label: "Assignment" },
          { id: "lnk-sm-sy", href: "/study-material/module/study-syllabus", label: "Syllabus" },
          { id: "lnk-sm-od", href: "/study-material/module/study-other-downloads", label: "Other downloads" },
        ],
      },
      {
        id: "sec-lesson-plan",
        title: "Lesson plan",
        items: [
          { id: "lnk-lp-l", href: "/lesson-plan/module/lp-lesson", label: "Lesson" },
          { id: "lnk-lp-t", href: "/lesson-plan/module/lp-topic", label: "Topic" },
          { id: "lnk-lp-to", href: "/lesson-plan/module/lp-topic-overview", label: "Topic overview" },
          { id: "lnk-lp-p", href: "/lesson-plan/module/lp-lesson-plan", label: "Lesson plan" },
          { id: "lnk-lp-po", href: "/lesson-plan/module/lp-lesson-plan-overview", label: "Lesson plan overview" },
        ],
      },
    ],
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
    for (const it of sec.items) {
      if (!it || typeof it !== "object") return false;
      const link = it as Record<string, unknown>;
      if (typeof link.id !== "string" || typeof link.href !== "string" || typeof link.label !== "string") {
        return false;
      }
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
