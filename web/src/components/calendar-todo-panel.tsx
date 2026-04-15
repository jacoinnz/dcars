"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Box,
  Button,
  Checkbox,
  Flex,
  Group,
  Paper,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import { DashboardCalendar } from "@/components/dashboard-calendar";

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
    <Flex
      mt="lg"
      gap={{ base: "md", lg: "lg" }}
      align="stretch"
      direction={{ base: "column", lg: "row" }}
      w="100%"
    >
      <Box style={{ flex: "7 1 0%", minWidth: 0 }}>
        <section id={calendarSectionId} style={{ scrollMarginTop: "6rem" }}>
          <DashboardCalendar />
        </section>
      </Box>

      <Box style={{ flex: "3 1 0%", minWidth: 0 }}>
        <Paper
          component="section"
          id={todoSectionId}
          withBorder
          radius="md"
          p="md"
          shadow="sm"
          style={{ minHeight: "min(22rem, 50vh)", scrollMarginTop: "6rem" }}
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
    </Flex>
  );
}
