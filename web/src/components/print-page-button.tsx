"use client";

export function PrintPageButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="rounded-lg border border-stone-300 bg-white px-3 py-1.5 text-sm font-medium text-stone-800 hover:border-teal-400 hover:bg-teal-50"
    >
      Print or save as PDF
    </button>
  );
}
