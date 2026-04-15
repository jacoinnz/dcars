import { asc, eq, inArray } from "drizzle-orm";
import { NextResponse } from "next/server";
import { getDb } from "@/db";
import { institutions, sites } from "@/db/schema";
import { getServerSessionWithBypass } from "@/lib/auth-options";
import { getManageableInstitutionIds, getViewableInstitutionIds } from "@/lib/school-access";

export async function GET() {
  const session = await getServerSessionWithBypass();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;
  const isSuperAdmin = Boolean(session.user.isSuperAdmin);

  const [viewable, manageable] = await Promise.all([
    getViewableInstitutionIds(userId, isSuperAdmin),
    getManageableInstitutionIds(userId, isSuperAdmin),
  ]);

  if (viewable.length === 0) {
    return NextResponse.json({ institutions: [] });
  }

  const manageableSet = new Set(manageable);
  const db = getDb();
  const rows = await db
    .select({
      id: institutions.id,
      name: institutions.name,
      siteName: sites.name,
    })
    .from(institutions)
    .innerJoin(sites, eq(sites.id, institutions.siteId))
    .where(inArray(institutions.id, viewable))
    .orderBy(asc(institutions.name));

  return NextResponse.json({
    institutions: rows.map((r) => ({
      ...r,
      canManage: manageableSet.has(r.id),
    })),
  });
}

