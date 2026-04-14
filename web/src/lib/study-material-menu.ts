/** Keys exposed under Study material in the sidebar (`/study-material/module/[key]`). */
export const STUDY_MATERIAL_SIDEBAR_KEYS = new Set([
  "study-upload-content",
  "study-assignment",
  "study-syllabus",
  "study-other-downloads",
]);

export function isStudyMaterialSidebarModuleKey(key: string): boolean {
  return STUDY_MATERIAL_SIDEBAR_KEYS.has(key);
}
