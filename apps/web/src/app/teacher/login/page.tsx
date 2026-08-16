"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { AuthCard } from "@/components/auth-chrome";
import { Field, PrimaryButton, TextInput } from "@/components/ui";
import { authClient } from "@/lib/auth-client";
import { meQueryKey } from "@/lib/session";

export default function TeacherLoginPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [email, setEmail] = useState("teacher@kasina.local");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const { error: err } = await authClient.signIn.email({ email, password });
    setLoading(false);
    if (err) {
      setError(err.message ?? "Login failed");
      return;
    }
    await queryClient.invalidateQueries({ queryKey: meQueryKey });
    router.push("/teacher");
  }

  return (
    <AuthCard
      title="Teacher login"
      subtitle="Manage classes, assignments, and results."
    >
      <form onSubmit={onSubmit} className="flex flex-col gap-4">
        <Field label="Email">
          <TextInput
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </Field>
        <Field label="Password">
          <TextInput
            type="password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </Field>
        {error ? <p className="text-sm text-error-text">{error}</p> : null}
        <PrimaryButton type="submit" disabled={loading}>
          {loading ? "Signing in…" : "Sign in"}
        </PrimaryButton>
      </form>
      <p className="mt-5 text-center text-sm text-gray-500">
        No account?{" "}
        <Link
          href="/teacher/signup"
          className="font-semibold text-primary-800 hover:underline"
        >
          Sign up
        </Link>
      </p>
    </AuthCard>
  );
}
