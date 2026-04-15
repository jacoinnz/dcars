import { and, desc, eq, gte, inArray, isNull, lte, or } from "drizzle-orm";
import { NextResponse } from "next/server";
import { getDb } from "@/db";
import { institutionNotices, noticeBoardItems } from "@/db/schema";
import { getServerSessionWithBypass } from "@/lib/auth-options";
import { canManageInstitution, getViewableInstitutionIds } from "@/lib/school-access";

type NoticeType = "holiday" | "event" | "out_of_class";

function isYmd(s: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(s);
}

function clampText(s: unknown, max: number): string {
  return String(s ?? "").trim().slice(0, max);
}

function parseNoticeType(raw: unknown): NoticeType {
  const s = String(raw ?? "").trim();
  if (s === "holiday" || s === "event" || s === "out_of_class") return s;
  return "event";
}

// FullCalendar expects end-exclusive for all-day spans. We store endDate inclusive,
// so when mapping to events we convert end to (endDate + 1 day).
function addOneDayYmd(s: string): string {
  const [yy, mm, dd] = s.split("-").map((x) => Number(x));
  const d = new Date(Date.UTC(yy, mm - 1, dd));
  d.setUTCDate(d.getUTCDate() + 1);
  const y = String(d.getUTCFullYear());
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export async function GET(req: Request) {
  const session = await getServerSessionWithBypass();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const from = (searchParams.get("from") ?? "").trim();
  const to = (searchParams.get("to") ?? "").trim();
  const institutionId = (searchParams.get("institutionId") ?? "").trim();

  if (!isYmd(from) || !isYmd(to)) {
    return NextResponse.json({ error: "Missing or invalid date range." }, { status: 400 });
  }

  const userId = session.user.id;
  const isSuperAdmin = Boolean(session.user.isSuperAdmin);
  const viewable = await getViewableInstitutionIds(userId, isSuperAdmin);
  if (viewable.length === 0) return NextResponse.json({ events: [] });

  const allowedInstitutions =
    institutionId && viewable.includes(institutionId) ? [institutionId] : viewable;

  const db = getDb();

  // Institution notices that intersect the requested range.
  const notices = await db
    .select({
      id: institutionNotices.id,
      institutionId: institutionNotices.institutionId,
      noticeType: institutionNotices.noticeType,
      title: institutionNotices.title,
      body: institutionNotices.body,
      startDate: institutionNotices.startDate,
      endDate: institutionNotices.endDate,
      updatedAt: institutionNotices.updatedAt,
    })
    .from(institutionNotices)
    .where(
      and(
        inArray(institutionNotices.institutionId, allowedInstitutions),
        // Simple inclusive overlap with nulls treated as open-ended
        and(
          or(isNull(institutionNotices.startDate), lte(institutionNotices.startDate, to)),
          or(isNull(institutionNotices.endDate), gte(institutionNotices.endDate, from)),
        ),
      ),
    )
    .orderBy(desc(institutionNotices.updatedAt));

  const events = notices.map((n) => {
    const start = n.startDate ?? from;
    const endExclusive = n.endDate ? addOneDayYmd(n.endDate) : addOneDayYmd(start);
    const isHoliday = n.noticeType === "holiday";
    const color = isHoliday ? "#ef4444" : n.noticeType === "out_of_class" ? "#f59e0b" : "#14b8a6";
    return {
      id: `inst_${n.id}`,
      title: n.title,
      start,
      end: endExclusive,
      allDay: true,
      backgroundColor: color,
      borderColor: color,
      textColor: "white",
      extendedProps: {
        source: "institution_notice" as const,
        institutionId: n.institutionId,
        noticeType: n.noticeType,
        body: n.body,
        readOnly: false,
      },
    };
  });

  // Optional: notice board items as read-only FYI events (all-day).
  // We include items in range using createdAt/expiresAt.
  const nb = await db
    .select({
      id: noticeBoardItems.id,
      title: noticeBoardItems.title,
      body: noticeBoardItems.body,
      pinned: noticeBoardItems.pinned,
      createdAt: noticeBoardItems.createdAt,
      expiresAt: noticeBoardItems.expiresAt,
    })
    .from(noticeBoardItems)
    .orderBy(desc(noticeBoardItems.pinned), desc(noticeBoardItems.createdAt))
    .limit(150);

  const nbEvents = nb
    .map((n) => {
      const createdYmd = n.createdAt.toISOString().slice(0, 10);
      const expiresYmd = n.expiresAt ? n.expiresAt.toISOString().slice(0, 10) : null;
      const start = createdYmd;
      const end = addOneDayYmd(expiresYmd ?? createdYmd);
      return {
        id: `nb_${n.id}`,
        title: n.title,
        start,
        end,
        allDay: true,
        backgroundColor: "#3b82f6",
        borderColor: "#3b82f6",
        textColor: "white",
        extendedProps: {
          source: "notice_board" as const,
          body: n.body,
          readOnly: true,
        },
      };
    })
    .filter((e) => e.start <= to && e.end >= from);

  return NextResponse.json({ events: [...events, ...nbEvents] });
}

export async function POST(req: Request) {
  const session = await getServerSessionWithBypass();
  if (!session?.user?.id) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const body = (await req.json().catch(() => null)) as any;
  const institutionId = clampText(body?.institutionId, 128);
  const title = clampText(body?.title, 120);
  const details = clampText(body?.body, 4000);
  const noticeType = parseNoticeType(body?.noticeType);
  const startDate = clampText(body?.startDate, 10) || null;
  const endDate = clampText(body?.endDate, 10) || null;

  if (!institutionId || !title) {
    return NextResponse.json({ ok: false, error: "Missing required fields." }, { status: 400 });
  }
  if (startDate && !isYmd(startDate)) {
    return NextResponse.json({ ok: false, error: "Invalid start date." }, { status: 400 });
  }
  if (endDate && !isYmd(endDate)) {
    return NextResponse.json({ ok: false, error: "Invalid end date." }, { status: 400 });
  }

  const userId = session.user.id;
  const isSuperAdmin = Boolean(session.user.isSuperAdmin);
  const viewable = await getViewableInstitutionIds(userId, isSuperAdmin);
  if (!viewable.includes(institutionId)) {
    return NextResponse.json({ ok: false, error: "Not allowed." }, { status: 403 });
  }
  if (!(await canManageInstitution(userId, isSuperAdmin, institutionId))) {
    return NextResponse.json({ ok: false, error: "You do not have permission to add events for this school." }, { status: 403 });
  }

  const now = new Date();
  const db = getDb();
  const id = crypto.randomUUID();
  await db.insert(institutionNotices).values({
    id,
    institutionId,
    noticeType,
    title,
    body: details || "(no details)",
    startDate,
    endDate,
    sortOrder: 0,
    createdAt: now,
    updatedAt: now,
  });

  return NextResponse.json({ ok: true, id });
}

export async function PATCH(req: Request) {
  const session = await getServerSessionWithBypass();
  if (!session?.user?.id) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const body = (await req.json().catch(() => null)) as any;
  const rawId = clampText(body?.id, 200);
  const institutionId = clampText(body?.institutionId, 128);
  const title = clampText(body?.title, 120);
  const details = clampText(body?.body, 4000);
  const noticeType = parseNoticeType(body?.noticeType);
  const startDate = clampText(body?.startDate, 10) || null;
  const endDate = clampText(body?.endDate, 10) || null;

  if (!rawId || !rawId.startsWith("inst_")) {
    return NextResponse.json({ ok: false, error: "Invalid event id." }, { status: 400 });
  }
  const id = rawId.slice("inst_".length);

  if (!institutionId || !title) {
    return NextResponse.json({ ok: false, error: "Missing required fields." }, { status: 400 });
  }
  if (startDate && !isYmd(startDate)) {
    return NextResponse.json({ ok: false, error: "Invalid start date." }, { status: 400 });
  }
  if (endDate && !isYmd(endDate)) {
    return NextResponse.json({ ok: false, error: "Invalid end date." }, { status: 400 });
  }

  const userId = session.user.id;
  const isSuperAdmin = Boolean(session.user.isSuperAdmin);
  const viewable = await getViewableInstitutionIds(userId, isSuperAdmin);
  if (!viewable.includes(institutionId)) {
    return NextResponse.json({ ok: false, error: "Not allowed." }, { status: 403 });
  }
  if (!(await canManageInstitution(userId, isSuperAdmin, institutionId))) {
    return NextResponse.json({ ok: false, error: "You do not have permission to edit events for this school." }, { status: 403 });
  }

  const db = getDb();
  const now = new Date();
  await db
    .update(institutionNotices)
    .set({
      noticeType,
      title,
      body: details || "(no details)",
      startDate,
      endDate,
      updatedAt: now,
    })
    .where(eq(institutionNotices.id, id));

  return NextResponse.json({ ok: true });
}

