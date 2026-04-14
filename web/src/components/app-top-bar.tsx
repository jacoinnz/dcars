"use client";

import { IconSearch } from "@tabler/icons-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { Anchor, Box, Flex, Group, Loader, Paper, Text, TextInput } from "@mantine/core";

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
    <Flex
      component="header"
      align="center"
      gap="md"
      h="3.5rem"
      pos="sticky"
      top={0}
      justify="flex-start"
      wrap="nowrap"
      pl={{ base: "md", lg: "lg" }}
      pr={{ base: "md", lg: "lg" }}
      py="sm"
      style={{
        zIndex: 30,
        flexShrink: 0,
        borderBottom: "1px solid var(--mantine-color-gray-3)",
        backgroundColor: "rgba(255, 255, 255, 0.95)",
        backdropFilter: "blur(8px)",
      }}
    >
      <Box ref={wrapRef} pos="relative" style={{ minWidth: 0 }} flex={1}>
        <TextInput
          type="search"
          name="app-search"
          autoComplete="off"
          placeholder="Search students, roll no., phone, schools…"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          aria-label="Search students and schools"
          leftSection={<IconSearch size={18} stroke={1.5} />}
          radius="md"
          styles={{
            input: {
              backgroundColor: "var(--mantine-color-gray-0)",
              borderColor: "var(--mantine-color-gray-3)",
              maxWidth: "36rem",
            },
          }}
        />

        {open && (query.trim().length >= 2 || loading || unauthorized) ? (
          <Paper
            shadow="md"
            p={0}
            withBorder
            radius="md"
            pos="absolute"
            left={0}
            right={0}
            top="100%"
            mt={4}
            style={{
              zIndex: 40,
              maxHeight: "min(70vh, 28rem)",
              overflow: "auto",
            }}
            maw={{ base: "100%", md: 448 }}
          >
            {unauthorized ? (
              <Text size="sm" c="dimmed" px="md" py="sm">
                <Anchor component={Link} href="/login" fw={600} c="blue.8">
                  Sign in
                </Anchor>{" "}
                to search the directory.
              </Text>
            ) : loading ? (
              <Group px="md" py="sm" gap="xs">
                <Loader size="sm" />
                <Text size="sm" c="dimmed">
                  Searching…
                </Text>
              </Group>
            ) : students.length === 0 && schools.length === 0 ? (
              <Text size="sm" c="dimmed" px="md" py="sm">
                No matches for that search.
              </Text>
            ) : (
              <Box component="ul" p={0} m={0} style={{ listStyle: "none" }}>
                {schools.length > 0 ? (
                  <>
                    <Text component="li" fz={10} fw={600} tt="uppercase" c="dimmed" px="sm" py={4}>
                      Schools
                    </Text>
                    {schools.map((s) => (
                      <Box component="li" key={s.id}>
                        <Anchor
                          component={Link}
                          href={`/evaluations/students/${s.id}`}
                          display="block"
                          px="md"
                          py="sm"
                          c="dark"
                          style={{ textDecoration: "none" }}
                          onClick={() => {
                            setOpen(false);
                            setQuery("");
                          }}
                        >
                          <Text span fw={500}>
                            {s.name}
                          </Text>
                          <Text span ml="sm" size="xs" c="dimmed">
                            Student centre
                          </Text>
                        </Anchor>
                      </Box>
                    ))}
                  </>
                ) : null}
                {students.length > 0 ? (
                  <>
                    <Text component="li" fz={10} fw={600} tt="uppercase" c="dimmed" px="sm" py={4} mt="xs">
                      Students
                    </Text>
                    {students.map((s) => (
                      <Box component="li" key={s.id}>
                        <Anchor
                          component={Link}
                          href={`/evaluations/students/${s.institutionId}`}
                          display="block"
                          px="md"
                          py="sm"
                          c="dark"
                          style={{ textDecoration: "none" }}
                          onClick={() => {
                            setOpen(false);
                            setQuery("");
                          }}
                        >
                          <Text span fw={500}>
                            {s.firstName} {s.middleName ? `${s.middleName} ` : ""}
                            {s.lastName}
                          </Text>
                          {s.admissionNumber ? (
                            <Text span ml="sm" size="xs" c="dimmed">
                              #{s.admissionNumber}
                            </Text>
                          ) : null}
                          <Text size="xs" c="dimmed" display="block" mt={2}>
                            {s.schoolName}
                          </Text>
                        </Anchor>
                      </Box>
                    ))}
                  </>
                ) : null}
              </Box>
            )}
          </Paper>
        ) : null}
      </Box>
    </Flex>
  );
}
