/** Keys exposed under Lesson plan in the sidebar (`/lesson-plan/module/[key]`). */
export const LESSON_PLAN_SIDEBAR_KEYS = new Set([
  "lp-lesson",
  "lp-topic",
  "lp-topic-overview",
  "lp-lesson-plan",
  "lp-lesson-plan-overview",
]);

export function isLessonPlanSidebarModuleKey(key: string): boolean {
  return LESSON_PLAN_SIDEBAR_KEYS.has(key);
}
