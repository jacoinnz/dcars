import type { CSSProperties } from "react";
import { Box, Button, Paper, Stack, Text, Title } from "@mantine/core";
import { AppPage } from "@/components/app-page";
import { NextMantineAnchor } from "@/components/next-mantine-links";
import { adminCreateUser } from "@/app/admin/actions";

export const metadata = {
  title: "New user — Admin",
};

const fieldInputStyle: CSSProperties = {
  marginTop: 4,
  borderRadius: "var(--mantine-radius-md)",
  border: "1px solid var(--mantine-color-gray-4)",
  padding: "8px 12px",
  fontSize: "var(--mantine-font-size-sm)",
  width: "100%",
};

export default function AdminNewUserPage() {
  return (
    <AppPage>
      <Stack gap="xl">
        <Stack gap="xs">
          <NextMantineAnchor href="/admin/users" size="sm" fw={500}>
            ← Users
          </NextMantineAnchor>
          <Title order={1}>New user</Title>
          <Text size="sm" c="dimmed" maw={480}>
            After creation you can assign per-site permissions (unless they are a super admin).
          </Text>
        </Stack>

        <Paper component="form" action={adminCreateUser} withBorder shadow="sm" radius="lg" p="xl" maw={480}>
          <Stack gap="md">
            <Box>
              <Text component="label" size="sm" fw={500} htmlFor="new-user-email" display="block">
                Email
              </Text>
              <input
                id="new-user-email"
                name="email"
                type="email"
                required
                autoComplete="email"
                style={fieldInputStyle}
              />
            </Box>
            <Box>
              <Text component="label" size="sm" fw={500} htmlFor="new-user-name" display="block">
                Display name
              </Text>
              <input id="new-user-name" name="name" required style={fieldInputStyle} />
            </Box>
            <Box>
              <Text component="label" size="sm" fw={500} htmlFor="new-user-password" display="block">
                Password
              </Text>
              <input
                id="new-user-password"
                name="password"
                type="password"
                required
                minLength={8}
                autoComplete="new-password"
                style={fieldInputStyle}
              />
            </Box>
            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: "var(--mantine-spacing-sm)",
                fontSize: "var(--mantine-font-size-sm)",
                cursor: "pointer",
              }}
            >
              <input name="isSuperAdmin" type="checkbox" />
              <span>Super admin (full access, no per-site matrix)</span>
            </label>
            <Button type="submit" color="dark" mt="xs">
              Create user
            </Button>
          </Stack>
        </Paper>
      </Stack>
    </AppPage>
  );
}
