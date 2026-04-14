"use client";

import { useMemo, useState } from "react";

export type StudentListRow = {
  id: string;
  firstName: string;
  middleName: string | null;
  lastName: string;
  admissionNumber: string | null;
  gender: string | null;
  phone: string | null;
  email: string | null;
  admissionDate: string | null;
};

export function StudentListTable(props: {
  students: StudentListRow[];
  classNamesByStudentId: Record<string, string[]>;
}) {
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return props.students;
    return props.students.filter((st) => {
      const classes = (props.classNamesByStudentId[st.id] ?? []).join(" ");
      const blob = [
        st.firstName,
        st.middleName,
        st.lastName,
        st.admissionNumber,
        st.gender,
        st.phone,
        st.email,
        classes,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return blob.includes(s);
    });
  }, [props.students, props.classNamesByStudentId, q]);

  function displayName(st: StudentListRow) {
    const mid = st.middleName?.trim();
    return [st.firstName, mid, st.lastName].filter(Boolean).join(" ");
  }

  function contact(st: StudentListRow) {
    if (st.phone?.trim()) return st.phone.trim();
    if (st.email?.trim()) return st.email.trim();
    return "—";
  }

  return (
    <div>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <label className="block w-full max-w-lg">
          <span className="sr-only">Search students</span>
          <input
            type="search"
            placeholder="Search by name, roll number, class, phone…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm shadow-sm"
            autoComplete="off"
          />
        </label>
        <p className="shrink-0 text-xs text-stone-500">
          Showing {filtered.length} of {props.students.length}
        </p>
      </div>

      {filtered.length === 0 ? (
        <p className="rounded-lg border border-stone-200 bg-stone-50 px-4 py-6 text-center text-sm text-stone-600">
          {props.students.length === 0
            ? "No students recorded yet. Admit a learner using the form below."
            : "No students match your search."}
        </p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-stone-200 bg-white shadow-sm">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-stone-50 text-xs uppercase tracking-wide text-stone-600">
              <tr>
                <th className="whitespace-nowrap px-3 py-3">#</th>
                <th className="whitespace-nowrap px-3 py-3">Student</th>
                <th className="whitespace-nowrap px-3 py-3">Roll / adm. no.</th>
                <th className="whitespace-nowrap px-3 py-3">Gender</th>
                <th className="min-w-[7rem] px-3 py-3">Contact</th>
                <th className="min-w-[8rem] px-3 py-3">Classes</th>
                <th className="whitespace-nowrap px-3 py-3">Adm. date</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((st, i) => {
                const classes = props.classNamesByStudentId[st.id] ?? [];
                return (
                  <tr key={st.id} className="border-t border-stone-100">
                    <td className="whitespace-nowrap px-3 py-2.5 tabular-nums text-stone-500">{i + 1}</td>
                    <td className="px-3 py-2.5 font-medium text-stone-900">{displayName(st)}</td>
                    <td className="whitespace-nowrap px-3 py-2.5 text-stone-700">
                      {st.admissionNumber?.trim() || "—"}
                    </td>
                    <td className="whitespace-nowrap px-3 py-2.5 text-stone-700">{st.gender?.trim() || "—"}</td>
                    <td className="max-w-[12rem] break-words px-3 py-2.5 text-stone-700">{contact(st)}</td>
                    <td className="px-3 py-2.5 text-stone-700">
                      {classes.length ? [...classes].sort((a, b) => a.localeCompare(b)).join(", ") : "—"}
                    </td>
                    <td className="whitespace-nowrap px-3 py-2.5 text-stone-700">
                      {st.admissionDate?.trim() || "—"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
