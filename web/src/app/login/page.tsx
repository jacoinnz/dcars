import { Suspense } from "react";
import { LoginForm } from "@/components/login-form";
import { LoginFormFallback } from "./login-fallback";

export const metadata = {
  title: "Sign in — Youth programme",
};

export default function LoginPage() {
  return (
    <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col justify-center px-4 py-16">
      <Suspense fallback={<LoginFormFallback />}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
