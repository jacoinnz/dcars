/**
 * HTTP smoke test: hits every page route (+ a few API GETs) against a running server.
 * Run: SKIP_AUTH=true npm run start -- -p 3666 &  sleep 2  &&  npx tsx scripts/smoke-pages.ts http://localhost:3666
 *
 * Expects DATABASE_URL in .env.local for optional ID resolution (institutions, series, uploads).
 */
import { config } from "dotenv";
import { resolve } from "node:path";

config({ path: resolve(process.cwd(), ".env.local") });
config({ path: resolve(process.cwd(), ".env") });

import { asc } from "drizzle-orm";
import { getDb } from "@/db";
import {
  appUsers,
  institutionExamSeries,
  institutions,
  teacherContentUploads,
} from "@/db/schema";

const PLACEHOLDER_UUID = "00000000-0000-4000-8000-000000000001";

async function resolveDynamicIds(): Promise<{
  institutionId: string;
  examinationInstitutionId: string;
  seriesId: string;
  userId: string;
  teacherContentId: string;
}> {
  try {
    const db = getDb();
    const [inst] = await db
      .select({ id: institutions.id })
      .from(institutions)
      .orderBy(asc(institutions.name))
      .limit(1);
    const institutionId = inst?.id ?? PLACEHOLDER_UUID;

    const [seriesRow] = await db
      .select({
        id: institutionExamSeries.id,
        institutionId: institutionExamSeries.institutionId,
      })
      .from(institutionExamSeries)
      .limit(1);
    const seriesId = seriesRow?.id ?? PLACEHOLDER_UUID;
    const examinationInstitutionId = seriesRow?.institutionId ?? institutionId;

    const [user] = await db.select({ id: appUsers.id }).from(appUsers).limit(1);
    const userId = user?.id ?? PLACEHOLDER_UUID;

    const [upload] = await db.select({ id: teacherContentUploads.id }).from(teacherContentUploads).limit(1);
    const teacherContentId = upload?.id ?? PLACEHOLDER_UUID;

    return { institutionId, examinationInstitutionId, seriesId, userId, teacherContentId };
  } catch {
    return {
      institutionId: PLACEHOLDER_UUID,
      examinationInstitutionId: PLACEHOLDER_UUID,
      seriesId: PLACEHOLDER_UUID,
      userId: PLACEHOLDER_UUID,
      teacherContentId: PLACEHOLDER_UUID,
    };
  }
}

function buildPaths(ids: Awaited<ReturnType<typeof resolveDynamicIds>>): string[] {
  const { institutionId, examinationInstitutionId, seriesId, userId, teacherContentId } = ids;

  return [
    "/",
    "/entry",
    "/login",
    "/dashboard",
    "/reports",
    "/students",
    "/students/attendance",
    "/admin",
    "/admin/institutions",
    `/admin/institutions/${institutionId}`,
    "/admin/sites",
    "/admin/notices",
    "/admin/users",
    `/admin/users/${userId}`,
    "/admin/users/new",
    "/admin/module/user-accounts",
    "/teachers",
    "/teachers/feature/upload-content",
    "/evaluations",
    `/evaluations/students/${institutionId}`,
    `/evaluations/syllabuses/${institutionId}`,
    "/examinations",
    `/examinations/${examinationInstitutionId}`,
    `/examinations/${examinationInstitutionId}/${seriesId}`,
    "/examinations/feature/add-exam",
    "/communications",
    `/communications/${institutionId}`,
    "/attendance",
    "/hr",
    "/hr/directory",
    "/hr/feature/staff-directory",
    "/family",
    "/parents",
    "/parents/marks",
    "/parents/feature/marks",
    "/student",
    "/student/attendance",
    "/student/marks",
    "/student/materials",
    "/student/feature/attendance",
    "/teacher-content",
    "/settings/sidebar",
    "/academics/module/optional-subjects",
    "/download-center/module/content-type",
    "/study-material/module/study-upload-content",
    "/lesson-plan/module/lp-lesson",
    "/api/participants/template",
    "/api/search?q=test",
    "/api/report/pdf?from=2024-01-01&to=2024-01-31",
    `/api/teacher-content/${teacherContentId}/download`,
  ];
}

function classify(status: number): "ok" | "soft" | "bad" {
  if (status >= 200 && status < 300) return "ok";
  if (status === 404) return "soft";
  if (status === 401 || status === 403) return "bad";
  if (status >= 300 && status < 400) return "bad";
  return "bad";
}

async function main() {
  const base = process.argv[2] ?? "http://localhost:3000";
  const ids = await resolveDynamicIds();
  const paths = buildPaths(ids);

  console.log(`Base: ${base}`);
  console.log(
    `Resolved IDs: institution=${ids.institutionId.slice(0, 8)}… exams=${ids.examinationInstitutionId.slice(0, 8)}… user=${ids.userId.slice(0, 8)}…`,
  );
  console.log(`Paths: ${paths.length}\n`);

  const failures: { path: string; status: number }[] = [];
  const soft404: string[] = [];
  let okCount = 0;

  for (const path of paths) {
    const url = new URL(path, base).toString();
    let status = 0;
    try {
      const res = await fetch(url, {
        redirect: "manual",
        headers: { Accept: "text/html,application/json,*/*" },
      });
      status = res.status;
    } catch (e) {
      console.error(`FETCH_ERROR ${path}`, e);
      failures.push({ path, status: 0 });
      continue;
    }

    const pathOnly = path.split("?")[0];
    if (
      status === 307 &&
      (pathOnly === "/student/attendance" || pathOnly === "/student/materials")
    ) {
      okCount += 1;
      console.log(`OK 307 ${path} (redirect when user has no linked student portal)`);
      continue;
    }

    const c = classify(status);
    if (c === "ok") {
      okCount += 1;
      console.log(`OK ${status} ${path}`);
    } else if (c === "soft") {
      console.log(`404 ${path} (not found — may be missing row for dynamic segment)`);
      soft404.push(path);
    } else {
      console.log(`FAIL ${status} ${path}`);
      failures.push({ path, status });
    }
  }

  console.log("\n--- Summary ---");
  console.log(`2xx OK: ${okCount}`);
  if (soft404.length) console.log(`404 (soft): ${soft404.length}`);
  if (failures.length) {
    console.log(`Failed: ${failures.length}`);
    for (const f of failures) console.log(`  ${f.status} ${f.path}`);
    process.exit(1);
  }
  process.exit(0);
}

main();
