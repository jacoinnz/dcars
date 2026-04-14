import { and, count, countDistinct, eq, inArray, sql } from "drizzle-orm";
import { getDb } from "@/db";
import {
  institutions,
  institutionStaff,
  studentGuardians,
  students,
} from "@/db/schema";
import type { SiteScope } from "@/lib/site-scope";

export type AudienceTabCounts = {
  students: number;
  teachers: number;
  parents: number;
  staff: number;
};

/** Schools whose programme site is in scope (all sites, listed sites, or none). */
function institutionScopeCondition(siteScope: SiteScope) {
  if (siteScope === "all") return sql`true`;
  if (Array.isArray(siteScope) && siteScope.length === 0) return sql`false`;
  return inArray(institutions.siteId, siteScope as string[]);
}

/**
 * Headline counts for the welcome audience tabs, scoped like other programme aggregates:
 * students and school-linked roles/parents under institutions in the user’s site scope.
 */
export async function getAudienceTabCounts(siteScope: SiteScope = "all"): Promise<AudienceTabCounts> {
  const db = getDb();
  const scope = institutionScopeCondition(siteScope);

  const [studentRow, teacherRow, parentRow, staffRow] = await Promise.all([
    db
      .select({ c: count(students.id) })
      .from(students)
      .innerJoin(institutions, eq(students.institutionId, institutions.id))
      .where(scope),
    db
      .select({ c: countDistinct(institutionStaff.userId) })
      .from(institutionStaff)
      .innerJoin(institutions, eq(institutionStaff.institutionId, institutions.id))
      .where(and(scope, eq(institutionStaff.role, "teacher"))),
    db
      .select({ c: countDistinct(studentGuardians.guardianUserId) })
      .from(studentGuardians)
      .innerJoin(students, eq(studentGuardians.studentId, students.id))
      .innerJoin(institutions, eq(students.institutionId, institutions.id))
      .where(scope),
    db
      .select({ c: countDistinct(institutionStaff.userId) })
      .from(institutionStaff)
      .innerJoin(institutions, eq(institutionStaff.institutionId, institutions.id))
      .where(and(scope, eq(institutionStaff.role, "management"))),
  ]);

  return {
    students: Number(studentRow[0]?.c ?? 0),
    teachers: Number(teacherRow[0]?.c ?? 0),
    parents: Number(parentRow[0]?.c ?? 0),
    staff: Number(staffRow[0]?.c ?? 0),
  };
}
