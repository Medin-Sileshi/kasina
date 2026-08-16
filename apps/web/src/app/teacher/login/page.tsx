"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { AuthCard } from "@/components/auth-chrome";
import { Field, PrimaryButton, TextInput } from "@/components/ui";
import { authClient } from "@/lib/auth-client";
import { meQueryKey } from "@/lib/session";

function authErrorMessage(err: { message?: string } | null | undefined) {
  const msg = err?.message?.trim();
  if (!msg || msg === "Failed to fetch" || /fetch failed/i.test(msg)) {
    return "Cannot reach the server or database. Is the API running, and is Supabase online?";
  }
  return msg;
}

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
    try {
      const { error: err } = await authClient.signIn.email({ email, password });
      if (err) {
        setError(authErrorMessage(err));
        return;
      }
      await queryClient.invalidateQueries({ queryKey: meQueryKey });
      router.push("/teacher");
    } catch (err) {
      setError(
        err instanceof Error
          ? authErrorMessage(err)
          : "Login failed",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthCard
      title="Teacher login"
      subtitle="Manage classes, assignments, and results."
      eyebrow="Teachers"
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
