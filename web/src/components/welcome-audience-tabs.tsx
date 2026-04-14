"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { useState } from "react";
import type { AudienceTabCounts } from "@/lib/audience-tab-counts";

type TabId = "students" | "teachers" | "parents" | "staff";

const tabs: { id: TabId; label: string }[] = [
  { id: "students", label: "Students" },
  { id: "teachers", label: "Teachers" },
  { id: "parents", label: "Parents" },
  { id: "staff", label: "Staff" },
];

const emptyCounts: AudienceTabCounts = {
  students: 0,
  teachers: 0,
  parents: 0,
  staff: 0,
};

export function WelcomeAudienceTabs(props: {
  userName: string | null;
  isSuperAdmin?: boolean;
  tabCounts?: AudienceTabCounts;
  children?: ReactNode;
  /** Anchor for sidebar links; four audience tabs stay fixed in this block */
  sectionId?: string;
}) {
  const [active, setActive] = useState<TabId>("students");
  const greeting = props.userName?.trim() ? `, ${props.userName.trim()}` : "";
  const counts = props.tabCounts ?? emptyCounts;

  return (
    <section
      id={props.sectionId}
      className="mb-10 scroll-mt-24 rounded-2xl border border-stone-200 bg-white p-6 shadow-sm"
    >
      <h1 className="text-2xl font-semibold text-stone-900">
        Welcome{greeting}
      </h1>
      <p className="mt-2 text-sm text-stone-600">
        Select who you are working with today — quick links open the right area of the programme.
      </p>

      <div
        className="mt-6 grid grid-cols-2 gap-2 border-b border-stone-200 sm:grid-cols-4"
        role="tablist"
        aria-label="Audience"
      >
        {tabs.map((t) => {
          const isActive = active === t.id;
          const n = counts[t.id];
          return (
            <button
              key={t.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              aria-label={`${t.label}, ${n.toLocaleString()} in your programme scope`}
              className={`relative -mb-px border-b-2 px-2 py-3 text-center text-sm font-semibold transition sm:px-3 ${
                isActive
                  ? "border-teal-600 text-teal-900"
                  : "border-transparent text-stone-600 hover:border-stone-300 hover:text-stone-900"
              }`}
              onClick={() => setActive(t.id)}
            >
              <span className="block leading-tight">{t.label}</span>
              <span
                className={`mt-1 block tabular-nums text-base sm:text-lg ${
                  isActive ? "text-teal-800" : "text-stone-500"
                }`}
              >
                {n.toLocaleString()}
              </span>
            </button>
          );
        })}
      </div>

      {props.children}

      <div className="mt-6 text-sm text-stone-700" role="tabpanel">
        {active === "students" ? (
          <ul className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:gap-x-6 sm:gap-y-2">
            <li>
              <Link href="/students" className="font-medium text-teal-800 underline hover:text-teal-950">
                Student information
              </Link>
              <span className="text-stone-500"> — admission, lists, classes</span>
            </li>
            <li>
              <Link href="/students/attendance" className="font-medium text-teal-800 underline hover:text-teal-950">
                Student attendance
              </Link>
              <span className="text-stone-500"> — daily roll</span>
            </li>
            <li>
              <Link href="/evaluations" className="font-medium text-teal-800 underline hover:text-teal-950">
                Evaluations
              </Link>
              <span className="text-stone-500"> — scores & classes</span>
            </li>
            <li>
              <Link href="/examinations" className="font-medium text-teal-800 underline hover:text-teal-950">
                Examinations
              </Link>
              <span className="text-stone-500"> — exams & marks</span>
            </li>
          </ul>
        ) : null}

        {active === "teachers" ? (
          <ul className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:gap-x-6 sm:gap-y-2">
            <li>
              <Link href="/teachers" className="font-medium text-teal-800 underline hover:text-teal-950">
                Teachers hub
              </Link>
              <span className="text-stone-500"> — resources & planned tools</span>
            </li>
            <li>
              <Link href="/teacher-content" className="font-medium text-teal-800 underline hover:text-teal-950">
                Teacher content
              </Link>
              <span className="text-stone-500"> — uploads & downloads</span>
            </li>
            <li>
              <Link href="/evaluations" className="font-medium text-teal-800 underline hover:text-teal-950">
                Evaluations
              </Link>
              <span className="text-stone-500"> — class assessment</span>
            </li>
          </ul>
        ) : null}

        {active === "parents" ? (
          <ul className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:gap-x-6 sm:gap-y-2">
            <li>
              <Link href="/parents" className="font-medium text-teal-800 underline hover:text-teal-950">
                Parents portal
              </Link>
              <span className="text-stone-500"> — overview & marks</span>
            </li>
            <li>
              <Link href="/family" className="font-medium text-teal-800 underline hover:text-teal-950">
                Family attendance
              </Link>
              <span className="text-stone-500"> — linked children</span>
            </li>
            <li>
              <Link href="/communications" className="font-medium text-teal-800 underline hover:text-teal-950">
                Communications
              </Link>
              <span className="text-stone-500"> — school messages</span>
            </li>
          </ul>
        ) : null}

        {active === "staff" ? (
          <ul className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:gap-x-6 sm:gap-y-2">
            <li>
              <Link href="/hr" className="font-medium text-teal-800 underline hover:text-teal-950">
                Human resources
              </Link>
              <span className="text-stone-500"> — HR hub & roadmap</span>
            </li>
            <li>
              <Link href="/hr/directory" className="font-medium text-teal-800 underline hover:text-teal-950">
                Staff directory
              </Link>
              <span className="text-stone-500"> — who is assigned where</span>
            </li>
            <li>
              <Link href="/attendance" className="font-medium text-teal-800 underline hover:text-teal-950">
                Student attendance (register)
              </Link>
              <span className="text-stone-500"> — record roll by school</span>
            </li>
            {props.isSuperAdmin ? (
              <li>
                <Link href="/admin" className="font-medium text-teal-800 underline hover:text-teal-950">
                  Administration
                </Link>
                <span className="text-stone-500"> — sites, schools, users</span>
              </li>
            ) : null}
          </ul>
        ) : null}
      </div>
    </section>
  );
}
