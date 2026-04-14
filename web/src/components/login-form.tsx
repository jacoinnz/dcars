"use client";

import { signIn } from "next-auth/react";
import { Alert, Button, Paper, PasswordInput, Stack, Text, TextInput, Title } from "@mantine/core";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    setError("");
    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
      callbackUrl,
    });
    setPending(false);
    if (res?.error) {
      setError("Invalid email or password.");
      return;
    }
    router.push(callbackUrl);
    router.refresh();
  }

  return (
    <Paper component="form" onSubmit={onSubmit} radius="lg" p="xl" withBorder shadow="sm" maw={448} mx="auto">
      <Stack gap="md">
        <div>
          <Title order={1} size="h3">
            Sign in
          </Title>
          <Text size="sm" c="dimmed" mt="xs">
            Use the account your administrator created for you.
          </Text>
        </div>

        {error ? (
          <Alert color="red" variant="light" title="Could not sign in">
            {error}
          </Alert>
        ) : null}

        <TextInput
          label="Email"
          name="email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <PasswordInput
          label="Password"
          name="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <Button type="submit" fullWidth loading={pending} color="blue" size="md" radius="md">
          {pending ? "Signing in…" : "Sign in"}
        </Button>
      </Stack>
    </Paper>
  );
}
