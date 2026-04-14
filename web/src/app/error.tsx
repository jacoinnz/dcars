"use client";

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="mx-auto flex max-w-lg flex-col items-center px-4 py-16 text-center">
      <h1 className="text-xl font-semibold text-stone-900">This page couldn’t load</h1>
      <p className="mt-3 text-sm text-stone-600">{error.message}</p>
      <p className="mt-4 text-xs text-stone-500">
        On Vercel, open <strong>Project → Settings → Environment Variables</strong> and set{" "}
        <code className="rounded bg-stone-100 px-1 py-0.5 text-xs">DATABASE_URL</code> to your Neon
        connection string (same as local <code className="rounded bg-stone-100 px-1 py-0.5 text-xs">.env.local</code>
        ), for <strong>Production</strong>, then redeploy.
      </p>
      <button
        type="button"
        onClick={() => reset()}
        className="mt-8 rounded-xl bg-teal-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-teal-800"
      >
        Try again
      </button>
    </div>
  );
}
