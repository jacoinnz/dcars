import { Stack, Text, Title } from "@mantine/core";
import { AppPage } from "@/components/app-page";
import { NextMantineAnchor } from "@/components/next-mantine-links";
import { adminCreateUser } from "@/app/admin/actions";

export const metadata = {
  title: "New user — Admin",
};

export default function AdminNewUserPage() {
  return (
    <AppPage>
      <Stack gap="lg">
      <NextMantineAnchor href="/admin/users" size="sm" fw={500}>
        ← Users
      </NextMantineAnchor>
      <Title order={1} mt="md">
        New user
      </Title>
      <Text size="sm" c="dimmed">
        After creation you can assign per-site permissions (unless they are a super admin).
      </Text>

      <form action={adminCreateUser} className="mt-8 max-w-md space-y-4 rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
        <label className="block text-sm font-medium text-stone-800">
          Email
          <input
            name="email"
            type="email"
            required
            autoComplete="email"
            className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2 text-sm"
          />
        </label>
        <label className="block text-sm font-medium text-stone-800">
          Display name
          <input
            name="name"
            required
            className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2 text-sm"
          />
        </label>
        <label className="block text-sm font-medium text-stone-800">
          Password
          <input
            name="password"
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
            className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2 text-sm"
          />
        </label>
        <label className="flex items-center gap-2 text-sm text-stone-800">
          <input name="isSuperAdmin" type="checkbox" className="rounded border-stone-300" />
          Super admin (full access, no per-site matrix)
        </label>
        <button
          type="submit"
          className="rounded-xl bg-stone-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-stone-800"
        >
          Create user
        </button>
      </form>
      </Stack>
    </AppPage>
  );
}
