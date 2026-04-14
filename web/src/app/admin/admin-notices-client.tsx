"use client";

import Link from "next/link";
import { format } from "date-fns";
import {
  Alert,
  Anchor,
  Button,
  Divider,
  Group,
  Paper,
  Stack,
  Text,
  Textarea,
  TextInput,
  Title,
} from "@mantine/core";
import {
  adminCreateNoticeBoardItem,
  adminDeleteNoticeBoardItem,
} from "@/app/admin/notice-board-actions";

export type AdminNoticeRow = {
  id: string;
  title: string;
  body: string;
  pinned: boolean;
  expiresAt: string | null;
  createdAt: string;
  isExpired: boolean;
};

export function AdminNoticesClient(props: {
  items: AdminNoticeRow[];
  ok?: boolean;
  err?: boolean;
}) {
  const { items, ok, err } = props;

  return (
    <Stack gap="xl">
      <div>
        <Title order={1} size="h2">
          Notice board
        </Title>
        <Text size="sm" c="dimmed" maw={672} mt="sm" lh={1.6}>
          Posts appear on the app home page and dashboard for all signed-in users. Expired notices stay
          listed here but are hidden from the public board.
        </Text>
      </div>

      {ok ? (
        <Alert color="green" variant="light" title="Saved">
          Notice added.
        </Alert>
      ) : null}
      {err ? (
        <Alert color="red" variant="light" title="Check fields">
          Title and body are required.
        </Alert>
      ) : null}

      <Paper component="form" action={adminCreateNoticeBoardItem} withBorder radius="lg" p="lg" shadow="sm" maw={576}>
        <Title order={2} size="h5">
          New notice
        </Title>
        <Stack gap="md" mt="md">
          <TextInput label="Title" name="title" required size="sm" />
          <Textarea label="Body" name="body" required minRows={4} size="sm" />
          <Group gap="xs" align="center">
            <input type="checkbox" name="pinned" id="admin-notice-pinned" style={{ width: 18, height: 18 }} />
            <Text component="label" htmlFor="admin-notice-pinned" size="sm">
              Pin to top
            </Text>
          </Group>
          <TextInput
            label="Expires (optional, local time)"
            name="expiresAt"
            type="datetime-local"
            size="sm"
          />
        </Stack>
        <Button type="submit" color="blue" mt="md" radius="md">
          Publish notice
        </Button>
      </Paper>

      <div>
        <Title order={2} size="h5">
          All notices ({items.length})
        </Title>
        {items.length === 0 ? (
          <Text size="sm" c="dimmed" mt="md">
            No notices yet.
          </Text>
        ) : (
          <Stack gap="md" mt="md">
            {items.map((n) => (
              <Paper key={n.id} withBorder radius="md" p="md" shadow="xs">
                <Group align="flex-start" justify="space-between" wrap="wrap" gap="md">
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <Text fw={600}>{n.title}</Text>
                    <Text size="sm" mt={6} style={{ whiteSpace: "pre-wrap" }} lh={1.6}>
                      {n.body}
                    </Text>
                    <Text size="xs" c="dimmed" mt="sm">
                      {format(new Date(n.createdAt), "d MMM yyyy HH:mm")}
                      {n.pinned ? " · pinned" : ""}
                      {n.expiresAt ? ` · expires ${format(new Date(n.expiresAt), "d MMM yyyy HH:mm")}` : ""}
                      {n.isExpired ? " · expired (hidden from board)" : ""}
                    </Text>
                  </div>
                  <form action={adminDeleteNoticeBoardItem}>
                    <input type="hidden" name="id" value={n.id} />
                    <Button type="submit" color="red" variant="light" size="compact-xs">
                      Delete
                    </Button>
                  </form>
                </Group>
              </Paper>
            ))}
          </Stack>
        )}
      </div>

      <Divider />
      <Text size="sm" c="dimmed">
        <Anchor component={Link} href="/admin" fw={600} c="blue.7" underline="always">
          ← Control center
        </Anchor>
      </Text>
    </Stack>
  );
}
