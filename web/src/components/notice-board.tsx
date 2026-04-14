"use client";

import Link from "next/link";
import { format } from "date-fns";
import { Badge, Button, Group, Paper, Stack, Text, Title } from "@mantine/core";
import type { NoticeBoardItemRow } from "@/lib/notice-board";

export function NoticeBoard(props: {
  items: NoticeBoardItemRow[];
  showManageLink?: boolean;
  /** Inside welcome card, directly under the audience tabs */
  embedded?: boolean;
  /** DOM id for in-page anchors (e.g. dashboard sidebar links) */
  anchorId?: string;
}) {
  const { items, showManageLink, embedded, anchorId } = props;

  return (
    <Paper
      component="section"
      id={anchorId}
      withBorder
      radius={embedded ? "md" : "lg"}
      p="lg"
      shadow="sm"
      mb={embedded ? 0 : "xl"}
      mt={embedded ? "lg" : 0}
      style={{
        scrollMarginTop: "6rem",
        borderColor: "rgba(251, 191, 36, 0.45)",
        background: "linear-gradient(to bottom, rgba(255, 251, 235, 0.95), var(--mantine-color-white))",
      }}
      aria-labelledby="notice-board-heading"
    >
      <Group justify="space-between" align="flex-start" wrap="wrap" gap="md">
        <div>
          <Title order={2} id="notice-board-heading" size="h4" c="yellow.9">
            Notice board
          </Title>
          <Text size="sm" mt={4} c="yellow.9" style={{ opacity: 0.85 }}>
            Programme announcements for students, staff, and families.
          </Text>
        </div>
        {showManageLink ? (
          <Button
            component={Link}
            href="/admin/notices"
            size="xs"
            fw={600}
            variant="outline"
            color="yellow"
            radius="xl"
          >
            Add Notice
          </Button>
        ) : null}
      </Group>

      {items.length === 0 ? (
        <Text size="sm" c="dimmed" mt="lg">
          No notices at the moment.
        </Text>
      ) : (
        <Stack gap="md" mt="lg">
          {items.map((n) => (
            <Paper key={n.id} withBorder p="md" radius="md" shadow="xs" bg="white" style={{ opacity: 0.95 }}>
              <Group justify="space-between" align="flex-start" wrap="wrap" gap="xs">
                <Text fw={600}>{n.title}</Text>
                <Group gap="xs">
                  {n.pinned ? (
                    <Badge size="sm" color="blue" variant="light">
                      Pinned
                    </Badge>
                  ) : null}
                  <Text size="xs" c="dimmed" component="time" dateTime={n.createdAt.toISOString()}>
                    {format(n.createdAt, "d MMM yyyy")}
                  </Text>
                  {n.expiresAt ? (
                    <Text size="xs" c="dimmed">
                      · expires {format(n.expiresAt, "d MMM yyyy")}
                    </Text>
                  ) : null}
                </Group>
              </Group>
              <Text size="sm" mt="sm" style={{ whiteSpace: "pre-wrap" }} lh={1.6}>
                {n.body}
              </Text>
            </Paper>
          ))}
        </Stack>
      )}
    </Paper>
  );
}
