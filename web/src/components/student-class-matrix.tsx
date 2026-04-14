"use client";

import { useTransition } from "react";
import { setStudentEnrollment } from "@/app/evaluations/actions";

type Student = { id: string; firstName: string; lastName: string };
type ClassRow = { id: string; name: string };

export function StudentClassMatrix(props: {
  students: Student[];
  classes: ClassRow[];
  enrolled: { studentId: string; classId: string }[];
}) {
  const [pending, startTransition] = useTransition();
  const key = (sid: string, cid: string) => `${sid}:${cid}`;
  const set = new Set(props.enrolled.map((e) => key(e.studentId, e.classId)));

  function toggle(studentId: string, classId: string, next: boolean) {
    startTransition(async () => {
      await setStudentEnrollment(studentId, classId, next);
    });
  }

  if (props.classes.length === 0) {
    return (
      <p className="text-sm text-amber-800">
        Add classes for this school in Admin → Schools first.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full border-collapse text-sm">
        <thead>
          <tr className="border-b border-stone-200 bg-stone-50 text-left text-xs uppercase text-stone-600">
            <th className="px-2 py-2">Student</th>
            {props.classes.map((c) => (
              <th key={c.id} className="px-2 py-2 text-center">
                {c.name}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {props.students.map((s) => (
            <tr key={s.id} className="border-b border-stone-100">
              <td className="px-2 py-2 font-medium text-stone-900">
                {s.firstName} {s.lastName}
              </td>
              {props.classes.map((c) => {
                const on = set.has(key(s.id, c.id));
                return (
                  <td key={c.id} className="px-2 py-2 text-center">
                    <input
                      type="checkbox"
                      checked={on}
                      disabled={pending}
                      onChange={(e) => toggle(s.id, c.id, e.target.checked)}
                      aria-label={`${s.firstName} ${s.lastName} in ${c.name}`}
                    />
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
      {pending ? (
        <p className="mt-2 text-xs text-stone-500">Saving…</p>
      ) : null}
    </div>
  );
}
