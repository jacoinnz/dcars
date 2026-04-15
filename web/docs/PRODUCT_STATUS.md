# Product status — where we are & what’s outstanding

This document describes the **youth programme** web app (`web/`) as of the last update. Use it for onboarding, planning, and handoff. For setup and env vars, see [`README.md`](../README.md).

---

## 1. Stack & architecture

| Layer | Choice |
| --- | --- |
| Framework | Next.js (App Router), React |
| UI | Mantine (`@mantine/core`), shared shell (`AppShell`-style layout), `AppPage` max-width wrappers |
| Auth | NextAuth (credentials), `AUTH_SECRET` / `NEXTAUTH_URL` required in production |
| Database | PostgreSQL via Neon, Drizzle ORM (`drizzle-orm` + `@neondatabase/serverless` HTTP driver) |
| Files | Teacher uploads: Vercel Blob when `BLOB_READ_WRITE_TOKEN` set; else inline DB storage (size limits) |
| Deploy | e.g. Vercel — set **Root Directory** to `web` if the repo root is above `web/` |

---

## 2. What’s implemented (live)

### 2.1 Core admin

- **Sites** (`/admin/sites`) — programme delivery locations and codes.
- **Schools / institutions** (`/admin/institutions`, `/admin/institutions/[id]`) — schools under sites; staff assignment; classes; syllabuses; guardian links; student portal link; attendance family message; notices (holidays/events/out of class).
- **Users** (`/admin/users`, …) — accounts and access (incl. super-admin).

### 2.2 Participant / legacy entry

- **Participant registration** (`/entry`) — `participant_entries` tied to **sites** (youth programme intake).

### 2.3 Students (school roll)

- **Student list (default)** — `/students` shows the **full active roster** (`students` + institutions + class names), searchable table. Same view for `?tab=student-list` and most other `tab=` values (see §4).
- **New student registration** — `/students?tab=add-student` — tabbed **admission form** → inserts `students` (see `evaluations/actions` admit flow).
- **Delete / restore** — `/students?tab=delete-record` — soft delete (`students.deleted_at`, `deleted_by_user_id`), **7-day recovery** window; restore clears soft delete. Active students excluded from normal queries via `studentIsActive` (`lib/students-active.ts`).
- **Staff attendance hub** — `/students/attendance` — links to registers and portals.

### 2.4 Evaluations & examinations

- **Evaluations** (`/evaluations`) — performance scores by school/class/date; filters.
- **Per-school student workspace** (`/evaluations/students/[institutionId]`) — roster, admission, class matrix.
- **Examinations** (`/examinations`, `/examinations/[institutionId]/[seriesId]`) — exam series, schedule, mark sheet, PDF/print flows as implemented.

### 2.5 Attendance

- **Staff register** (`/attendance`) — daily marks per school for assigned staff.
- **Family** (`/family`) — guardian-linked attendance view.
- **Student / parent portals** — `/student/attendance`, `/parents/marks` (where linked).

### 2.6 Communications & content

- **Communications** (`/communications`, …) — school events/notices where wired.
- **Teacher content** (`/teacher-content`) — upload files per site + institution name; Mantine UI; download API route.

### 2.7 Academics sidebar modules (reference UIs)

These routes render **NZ-aligned reference catalogs** (not full SIS timetabling engines):

| Route | Content |
| --- | --- |
| `/academics/module/subjects-catalog` | NZC learning areas + suggested subject codes/names |
| `/academics/module/school-classes` | Year levels, class types, naming examples |
| `/academics/module/academic-section` | Phases / divisions / section concepts |
| `/academics/module/optional-subjects` | Electives / option-line naming |

Other **academics** keys in the sidebar still hit `/academics/module/[key]` and show the generic **planned** placeholder unless given a custom page.

### 2.8 Dashboard & reporting

- **Dashboard** (`/dashboard`) — aggregates, notices, audience tabs.
- **Reports** (`/reports`) — PDF / programme reporting as implemented.

### 2.9 HR / teachers / download / study / lesson plan

- Many sidebar items route to **module placeholder pages** (`/hr/feature/[key]`, `/download-center/module/[key]`, `/study-material/module/[key]`, `/lesson-plan/module/[key]`, `/teachers/feature/[key]`) — mostly **roadmap** copy unless a specific page was built.

### 2.10 Admin “control center” catalogue

`lib/admin-control-center.ts` lists modules with `status: "live"` (has a real `href` or meaningful feature) vs `planned`. **Live** items are the source of truth for “shipped” admin-facing features; academics NZ reference pages are live with `href` under `/academics/module/…`.

---

## 3. Data model (high level)

Not exhaustive — see `web/src/db/schema.ts`.

- **Sites**, **institutions** (schools), **classes**, **students** (rich admission/profile), **student_classes** enrolment.
- **participant_entries** — separate from `students` (programme intake vs school roll).
- **Attendance**, **performance_records**, **exam** tables for marks/series.
- **Soft delete** on `students`: `deleted_at`, `deleted_by_user_id`.
- **Teacher content** uploads metadata + blob/inline storage.

---

## 4. `/students` URL behaviour (quick reference)

| URL | Behaviour |
| --- | --- |
| `/students` | **Student list** (full roster) |
| `/students?tab=student-list` | Same as above |
| `/students?tab=add-student` | **New student registration** (admission form only) |
| `/students?tab=delete-record` | Delete / restore (7-day window) |
| Other `tab=` values (e.g. sidebar stubs) | Currently show **student list** (not admission) |

`parseStudentsTab()` in `lib/students-page-tab.ts` normalises `tab` (including `string[]` from query repetition).

---

## 5. What’s outstanding (major buckets)

### 5.1 Roadmap modules (admin control center)

Dozens of entries remain **`planned`**: front office (visitor book, postal, complaints, …), student categories/groups/promote, **assign class teacher / subject**, **rooms**, **timetable**, certificates & ID cards, messaging, accounting, library/dorm/transport, download-center taxonomy, study-material workflows, lesson-plan tooling, email exam marks, etc.  
**Source of truth:** `ADMIN_MODULE_GROUPS` in `web/src/lib/admin-control-center.ts`.

### 5.2 Academics — beyond reference pages

- **Live:** Optional subjects, Section, Class, Subjects **catalog reference** UIs + exams + evaluations.
- **Not built:** Teacher assignment, subject-class-teacher links, room allocation, class routine/timetable as operational tools (still “planned” cards).

### 5.3 Students hub — sidebar links

Sidebar still lists many **`?tab=`** targets (multi-class, unassigned, attendance, export, …) that **all resolve to the student list** unless a dedicated feature is added later.

### 5.4 Soft delete

- No **automatic hard purge** after 7 days; rows stay soft-deleted and hidden from normal queries.
- Optional future work: scheduled job or admin “permanent delete” with policy checks.

### 5.5 Teacher / download / HR placeholders

Feature modules under `/teachers/feature/*`, `/download-center/module/*`, etc. are mostly **placeholders** for training/roadmap unless separately specified.

### 5.6 Operations

- Production needs **`DATABASE_URL`**, **`AUTH_SECRET` / `NEXTAUTH_SECRET`**, **`NEXTAUTH_URL`**, and after schema changes **`npm run db:push`** in the target environment.
- **`BLOB_READ_WRITE_TOKEN`** recommended for teacher content at scale.

---

## 6. Tests & smoke

- **`web/scripts/smoke-pages.ts`** — HTTP smoke against a running server; see script header for usage.
- No comprehensive automated E2E suite is documented here; rely on smoke + manual QA around auth and school scoping.

---

## 7. How to keep this document current

1. After a meaningful feature change, update **§2** (implemented) or **§5** (outstanding).
2. When adding a module in `admin-control-center.ts`, align **live vs planned** and this doc.
3. If `/students` routing changes, update **§4**.

---

*Last updated: product engineering handoff — see git history in `web/` for line-level changes.*
