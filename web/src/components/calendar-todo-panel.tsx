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
import {
  ActionIcon,
  Box,
  Button,
  Checkbox,
  Group,
  Paper,
  SimpleGrid,
  Text,
  TextInput,
  Title,
} from "@mantine/core";

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
    // Hydrate from localStorage after mount (browser-only).
    queueMicrotask(() => {
      setTodos(loadTodos(todoKey));
      setHydrated(true);
    });
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
      <Box style={{ minWidth: 0 }}>
        <Paper
          component="section"
          id={calendarSectionId}
          withBorder
          radius="md"
          p="md"
          shadow="sm"
          className="scroll-mt-24"
          style={{ minHeight: "min(22rem, 50vh)" }}
          bg="gray.0"
          aria-labelledby="home-calendar-heading"
        >
          <Group justify="space-between" pb="sm" style={{ borderBottom: "1px solid var(--mantine-color-gray-3)" }}>
            <ActionIcon
              variant="default"
              size="lg"
              radius="md"
              aria-label="Previous month"
              onClick={() => setVisibleMonth((m) => subMonths(m, 1))}
            >
              ←
            </ActionIcon>
            <Title order={2} id="home-calendar-heading" size="h4" ta="center" flex={1}>
              {format(visibleMonth, "MMMM yyyy")}
            </Title>
            <ActionIcon
              variant="default"
              size="lg"
              radius="md"
              aria-label="Next month"
              onClick={() => setVisibleMonth((m) => addMonths(m, 1))}
            >
              →
            </ActionIcon>
          </Group>

          <SimpleGrid cols={7} spacing={4} mt="sm">
            {WEEKDAYS.map((d) => (
              <Text key={d} fz={11} fw={600} tt="uppercase" ta="center" c="dimmed" py={4}>
                {d}
              </Text>
            ))}
          </SimpleGrid>

          <SimpleGrid cols={7} spacing={4} mt={4}>
            {days.map((day) => {
              const inMonth = isSameMonth(day, visibleMonth);
              const isToday = isSameDay(day, new Date());
              return (
                <Box
                  key={day.toISOString()}
                  py={6}
                  ta="center"
                  style={{
                    borderRadius: "var(--mantine-radius-md)",
                    backgroundColor:
                      isToday && inMonth ? "var(--mantine-color-blue-6)" : undefined,
                    color: !inMonth
                      ? "var(--mantine-color-gray-4)"
                      : isToday && inMonth
                        ? "white"
                        : undefined,
                    fontWeight: isToday && inMonth ? 600 : undefined,
                  }}
                >
                  <time dateTime={format(day, "yyyy-MM-dd")}>{format(day, "d")}</time>
                </Box>
              );
            })}
          </SimpleGrid>
        </Paper>
      </Box>

      <Box style={{ minWidth: 0 }}>
        <Paper
          component="section"
          id={todoSectionId}
          withBorder
          radius="md"
          p="md"
          shadow="sm"
          className="scroll-mt-24"
          style={{ minHeight: "min(22rem, 50vh)" }}
          aria-labelledby="home-todo-heading"
        >
          <Title order={2} id="home-todo-heading" size="h4">
            To do
          </Title>
          <Text size="xs" c="dimmed" mt={4}>
            Saved in this browser for your account.
          </Text>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              addTodo();
            }}
          >
            <Group mt="md" gap="sm" align="flex-end" wrap="nowrap">
              <TextInput
                flex={1}
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="Add a task…"
                maxLength={200}
                size="sm"
              />
              <Button type="submit" color="blue" size="sm">
                Add
              </Button>
            </Group>
          </form>

          <Box component="ul" p={0} m={0} mt="md" style={{ listStyle: "none", maxHeight: "16rem", overflowY: "auto" }}>
            {todos.length === 0 ? (
              <Text component="li" size="sm" c="dimmed">
                No tasks yet.
              </Text>
            ) : (
              todos.map((t) => (
                <Paper
                  component="li"
                  key={t.id}
                  withBorder
                  p="xs"
                  mb="xs"
                  radius="md"
                  bg="gray.0"
                >
                  <Group justify="space-between" align="flex-start" wrap="nowrap" gap="xs">
                    <Checkbox
                      checked={t.done}
                      onChange={() => toggleTodo(t.id)}
                      label={t.text}
                      styles={{
                        root: { flex: 1 },
                        label: {
                          textDecoration: t.done ? "line-through" : undefined,
                          color: t.done ? "var(--mantine-color-dimmed)" : undefined,
                        },
                      }}
                    />
                    <Button
                      type="button"
                      variant="subtle"
                      color="red"
                      size="compact-xs"
                      onClick={() => removeTodo(t.id)}
                      aria-label="Remove task"
                    >
                      Remove
                    </Button>
                  </Group>
                </Paper>
              ))
            )}
          </Box>
        </Paper>
      </Box>
    </div>
  );
}
