/** Keys exposed under Academics in the sidebar (`/academics/module/[key]`). */
export const ACADEMICS_SIDEBAR_KEYS = new Set([
  "optional-subjects",
  "academic-section",
  "school-classes",
  "subjects-catalog",
  "assign-class-teacher",
  "assign-subject",
  "classroom-allocation",
  "class-routine",
]);

export function isAcademicsSidebarModuleKey(key: string): boolean {
  return ACADEMICS_SIDEBAR_KEYS.has(key);
}
