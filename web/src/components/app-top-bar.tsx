"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

type StudentHit = {
  id: string;
  firstName: string;
  lastName: string;
  middleName: string | null;
  admissionNumber: string | null;
  institutionId: string;
  schoolName: string;
};

type SchoolHit = { id: string; name: string };

export function AppTopBar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [unauthorized, setUnauthorized] = useState(false);
  const [students, setStudents] = useState<StudentHit[]>([]);
  const [schools, setSchools] = useState<SchoolHit[]>([]);
  const wrapRef = useRef<HTMLDivElement>(null);

  const onLoginPage = pathname === "/login";

  const runSearch = useCallback(async (q: string) => {
    const t = q.trim();
    if (t.length < 2) {
      setStudents([]);
      setSchools([]);
      setUnauthorized(false);
      return;
    }
    setLoading(true);
    setUnauthorized(false);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(t)}`, { credentials: "same-origin" });
      if (res.status === 401) {
        setStudents([]);
        setSchools([]);
        setUnauthorized(true);
        return;
      }
      if (!res.ok) {
        setStudents([]);
        setSchools([]);
        return;
      }
      const data = (await res.json()) as { students: StudentHit[]; schools: SchoolHit[] };
      setStudents(data.students ?? []);
      setSchools(data.schools ?? []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (onLoginPage) return;
    const t = setTimeout(() => {
      void runSearch(query);
    }, 280);
    return () => clearTimeout(t);
  }, [query, runSearch, onLoginPage]);

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  if (onLoginPage) {
    return null;
  }

  return (
    <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center gap-3 border-b border-stone-200 bg-white/95 px-4 py-2 backdrop-blur supports-[backdrop-filter]:bg-white/80 md:px-6">
      <div className="relative min-w-0 flex-1" ref={wrapRef}>
        <label className="relative block">
          <span className="pointer-events-none absolute inset-y-0 left-0 flex w-10 items-center justify-center text-stone-400">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </span>
          <input
            type="search"
            name="app-search"
            autoComplete="off"
            placeholder="Search students, roll no., phone, schools…"
            className="w-full max-w-xl rounded-xl border border-stone-200 bg-stone-50 py-2 pl-10 pr-3 text-sm text-stone-900 placeholder:text-stone-400 focus:border-teal-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setOpen(true);
            }}
            onFocus={() => setOpen(true)}
            aria-label="Search students and schools"
          />
        </label>

        {open && (query.trim().length >= 2 || loading || unauthorized) ? (
          <div className="absolute left-0 right-0 top-full z-40 mt-1 max-h-[min(70vh,28rem)] overflow-auto rounded-xl border border-stone-200 bg-white py-2 shadow-lg md:w-[min(100%,28rem)]">
            {unauthorized ? (
              <p className="px-4 py-3 text-sm text-stone-600">
                <Link href="/login" className="font-semibold text-teal-800 underline">
                  Sign in
                </Link>{" "}
                to search the directory.
              </p>
            ) : loading ? (
              <p className="px-4 py-3 text-sm text-stone-500">Searching…</p>
            ) : students.length === 0 && schools.length === 0 ? (
              <p className="px-4 py-3 text-sm text-stone-500">No matches for that search.</p>
            ) : (
              <ul className="text-sm">
                {schools.length > 0 ? (
                  <>
                    <li className="px-3 pb-1 text-[10px] font-semibold uppercase tracking-wide text-stone-400">
                      Schools
                    </li>
                    {schools.map((s) => (
                      <li key={s.id}>
                        <Link
                          href={`/evaluations/students/${s.id}`}
                          className="block px-4 py-2 text-stone-800 hover:bg-teal-50"
                          onClick={() => {
                            setOpen(false);
                            setQuery("");
                          }}
                        >
                          <span className="font-medium">{s.name}</span>
                          <span className="ml-2 text-xs text-stone-500">Student centre</span>
                        </Link>
                      </li>
                    ))}
                  </>
                ) : null}
                {students.length > 0 ? (
                  <>
                    <li className="px-3 pb-1 pt-2 text-[10px] font-semibold uppercase tracking-wide text-stone-400">
                      Students
                    </li>
                    {students.map((s) => (
                      <li key={s.id}>
                        <Link
                          href={`/evaluations/students/${s.institutionId}`}
                          className="block px-4 py-2 text-stone-800 hover:bg-teal-50"
                          onClick={() => {
                            setOpen(false);
                            setQuery("");
                          }}
                        >
                          <span className="font-medium">
                            {s.firstName} {s.middleName ? `${s.middleName} ` : ""}
                            {s.lastName}
                          </span>
                          {s.admissionNumber ? (
                            <span className="ml-2 text-xs text-stone-500">#{s.admissionNumber}</span>
                          ) : null}
                          <span className="mt-0.5 block text-xs text-stone-500">{s.schoolName}</span>
                        </Link>
                      </li>
                    ))}
                  </>
                ) : null}
              </ul>
            )}
          </div>
        ) : null}
      </div>
    </header>
  );
}
