"use client";

import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  startOfMonth,
  startOfWeek,
  subMonths,
} from "date-fns";
import { useCallback, useEffect, useMemo, useState } from "react";

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;

type TodoItem = { id: string; text: string; done: boolean };

function loadTodos(key: string): TodoItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (x): x is TodoItem =>
        x &&
        typeof x === "object" &&
        typeof (x as TodoItem).id === "string" &&
        typeof (x as TodoItem).text === "string" &&
        typeof (x as TodoItem).done === "boolean",
    );
  } catch {
    return [];
  }
}

function saveTodos(key: string, items: TodoItem[]) {
  try {
    localStorage.setItem(key, JSON.stringify(items));
  } catch {
    /* ignore quota */
  }
}

export function CalendarTodoPanel(props: {
  storageKey: string;
  calendarSectionId?: string;
  todoSectionId?: string;
}) {
  const todoKey = `dcaars-todos:${props.storageKey}`;
  const [visibleMonth, setVisibleMonth] = useState(() => startOfMonth(new Date()));
  const [todos, setTodos] = useState<TodoItem[]>([]);
  const [draft, setDraft] = useState("");
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setTodos(loadTodos(todoKey));
    setHydrated(true);
  }, [todoKey]);

  useEffect(() => {
    if (!hydrated) return;
    saveTodos(todoKey, todos);
  }, [hydrated, todoKey, todos]);

  const days = useMemo(() => {
    const monthStart = startOfMonth(visibleMonth);
    const monthEnd = endOfMonth(visibleMonth);
    const gridStart = startOfWeek(monthStart, { weekStartsOn: 1 });
    const gridEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
    return eachDayOfInterval({ start: gridStart, end: gridEnd });
  }, [visibleMonth]);

  const addTodo = useCallback(() => {
    const text = draft.trim();
    if (!text) return;
    setTodos((prev) => [...prev, { id: crypto.randomUUID(), text, done: false }]);
    setDraft("");
  }, [draft]);

  const toggleTodo = useCallback((id: string) => {
    setTodos((prev) => prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));
  }, []);

  const removeTodo = useCallback((id: string) => {
    setTodos((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const { calendarSectionId, todoSectionId } = props;

  return (
    <div className="mt-6 grid w-full grid-cols-1 gap-4 lg:grid-cols-[7fr_3fr] lg:items-stretch lg:gap-6">
      <section
        id={calendarSectionId}
        className="flex min-h-[min(22rem,50vh)] min-w-0 scroll-mt-24 flex-col rounded-xl border border-stone-200 bg-stone-50/80 p-4 shadow-sm"
        aria-labelledby="home-calendar-heading"
      >
        <div className="flex items-center justify-between gap-2 border-b border-stone-200 pb-3">
          <button
            type="button"
            className="rounded-lg border border-stone-300 bg-white px-2.5 py-1.5 text-sm font-medium text-stone-800 shadow-sm hover:border-teal-400 hover:bg-teal-50"
            onClick={() => setVisibleMonth((m) => subMonths(m, 1))}
            aria-label="Previous month"
          >
            ←
          </button>
          <h2 id="home-calendar-heading" className="text-center text-base font-semibold text-stone-900">
            {format(visibleMonth, "MMMM yyyy")}
          </h2>
          <button
            type="button"
            className="rounded-lg border border-stone-300 bg-white px-2.5 py-1.5 text-sm font-medium text-stone-800 shadow-sm hover:border-teal-400 hover:bg-teal-50"
            onClick={() => setVisibleMonth((m) => addMonths(m, 1))}
            aria-label="Next month"
          >
            →
          </button>
        </div>

        <div className="mt-3 grid grid-cols-7 gap-0.5 text-center text-[11px] font-semibold uppercase tracking-wide text-stone-500">
          {WEEKDAYS.map((d) => (
            <div key={d} className="py-1">
              {d}
            </div>
          ))}
        </div>

        <div className="mt-1 grid flex-1 grid-cols-7 gap-0.5 text-sm">
          {days.map((day) => {
            const inMonth = isSameMonth(day, visibleMonth);
            const isToday = isSameDay(day, new Date());
            return (
              <div
                key={day.toISOString()}
                className={`flex h-9 items-center justify-center rounded-md text-sm ${
                  !inMonth ? "text-stone-300" : "text-stone-800"
                } ${isToday && inMonth ? "bg-teal-600 font-semibold text-white shadow-sm" : inMonth ? "hover:bg-stone-200/80" : ""}`}
              >
                <time dateTime={format(day, "yyyy-MM-dd")}>{format(day, "d")}</time>
              </div>
            );
          })}
        </div>
      </section>

      <section
        id={todoSectionId}
        className="flex min-h-[min(22rem,50vh)] min-w-0 scroll-mt-24 flex-col rounded-xl border border-stone-200 bg-white p-4 shadow-sm"
        aria-labelledby="home-todo-heading"
      >
        <h2 id="home-todo-heading" className="text-base font-semibold text-stone-900">
          To do
        </h2>
        <p className="mt-1 text-xs text-stone-500">Saved in this browser for your account.</p>

        <form
          className="mt-3 flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            addTodo();
          }}
        >
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Add a task…"
            className="min-w-0 flex-1 rounded-lg border border-stone-300 px-3 py-2 text-sm"
            maxLength={200}
          />
          <button
            type="submit"
            className="shrink-0 rounded-lg bg-teal-700 px-3 py-2 text-sm font-semibold text-white hover:bg-teal-800"
          >
            Add
          </button>
        </form>

        <ul className="mt-3 flex max-h-64 flex-col gap-2 overflow-y-auto pr-1">
          {todos.length === 0 ? (
            <li className="text-sm text-stone-500">No tasks yet.</li>
          ) : (
            todos.map((t) => (
              <li
                key={t.id}
                className="flex items-start gap-2 rounded-lg border border-stone-100 bg-stone-50/90 px-2 py-2 text-sm"
              >
                <label className="flex min-w-0 flex-1 cursor-pointer items-start gap-2">
                  <input
                    type="checkbox"
                    checked={t.done}
                    onChange={() => toggleTodo(t.id)}
                    className="mt-0.5 rounded border-stone-400"
                  />
                  <span className={t.done ? "text-stone-400 line-through" : "text-stone-800"}>{t.text}</span>
                </label>
                <button
                  type="button"
                  className="shrink-0 text-xs font-medium text-red-700 hover:text-red-900"
                  onClick={() => removeTodo(t.id)}
                  aria-label="Remove task"
                >
                  Remove
                </button>
              </li>
            ))
          )}
        </ul>
      </section>
    </div>
  );
}
