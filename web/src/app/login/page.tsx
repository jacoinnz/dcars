import { Suspense } from "react";
import { Container } from "@mantine/core";
import { LoginForm } from "@/components/login-form";
import { LoginFormFallback } from "./login-fallback";

export const metadata = {
  title: "Sign in — Youth programme",
};

export default function LoginPage() {
  return (
    <Container size="xl" py="xl" style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", minHeight: "60vh" }}>
      <Suspense fallback={<LoginFormFallback />}>
        <LoginForm />
      </Suspense>
    </Container>
  );
}
