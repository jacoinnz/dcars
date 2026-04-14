import { Suspense } from "react";
import { LoginForm } from "@/components/login-form";

export const metadata = {
  title: "Sign in — Youth programme",
};

function LoginFormFallback() {
  return (
    <div className="mx-auto max-w-md rounded-2xl border border-stone-200 bg-white p-8 text-sm text-stone-600 shadow-sm">
      Loading…
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col justify-center px-4 py-16">
      <Suspense fallback={<LoginFormFallback />}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
