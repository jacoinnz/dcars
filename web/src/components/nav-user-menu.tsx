"use client";

import Link from "next/link";
import { signOut } from "next-auth/react";

export function NavUserMenu(props: {
  email: string | null;
  isSuperAdmin: boolean;
}) {
  if (!props.email) {
    return (
      <Link
        href="/login"
        className="rounded-full border border-stone-300 bg-white px-3 py-1.5 text-sm font-medium text-stone-800 hover:border-teal-400"
      >
        Sign in
      </Link>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="max-w-[14rem] truncate text-xs text-stone-600" title={props.email}>
        {props.email}
        {props.isSuperAdmin ? (
          <span className="ml-1 rounded bg-teal-100 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-teal-900">
            Admin
          </span>
        ) : null}
      </span>
      {props.isSuperAdmin ? (
        <Link
          href="/admin"
          className="rounded-full border border-teal-200 bg-teal-50 px-3 py-1.5 text-sm font-medium text-teal-900 hover:bg-teal-100"
        >
          Admin
        </Link>
      ) : null}
      <button
        type="button"
        className="rounded-full border border-stone-200 bg-stone-50 px-3 py-1.5 text-sm text-stone-800 hover:border-stone-300"
        onClick={() => signOut({ callbackUrl: "/login" })}
      >
        Sign out
      </button>
    </div>
  );
}
