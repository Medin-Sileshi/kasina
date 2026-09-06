"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { AuthCard } from "@/components/auth-chrome";
import { Field, PrimaryButton, TextInput } from "@/components/ui";
import { authClient } from "@/lib/auth-client";
import { isUnauthorized, meQueryKey, useMe } from "@/lib/session";

function authErrorMessage(err: { message?: string } | null | undefined) {
  const msg = err?.message?.trim();
  if (!msg || msg === "Failed to fetch" || /fetch failed/i.test(msg)) {
    return "Cannot reach the server or database. Is the API running, and is Supabase online?";
  }
  return msg;
}

export default function MedinAdminLoginPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const meQuery = useMe();
  const [email, setEmail] = useState("medin@kasina.com");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (meQuery.data?.user.role === "admin") {
      router.replace("/medin");
    }
  }, [meQuery.data, router]);

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
      router.replace("/medin");
    } catch (err) {
      setError(
        err instanceof Error ? authErrorMessage(err) : "Login failed",
      );
    } finally {
      setLoading(false);
    }
  }

  if (meQuery.isPending && !isUnauthorized(meQuery.error) && !meQuery.data) {
    return (
      <main className="mx-auto max-w-lg px-6 py-16 text-center text-gray-500">
        Checking session…
      </main>
    );
  }

  return (
    <AuthCard
      title="Admin"
      subtitle="Sign in to manage schools, approvals, and OTP."
      eyebrow="Kasina"
      backHref="/"
    >
      <form onSubmit={onSubmit} className="flex flex-col gap-4">
        <Field label="Email">
          <TextInput
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="username"
          />
        </Field>
        <Field label="Password">
          <TextInput
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
          />
        </Field>
        {error ? <p className="text-sm text-error-text">{error}</p> : null}
        <PrimaryButton type="submit" disabled={loading}>
          {loading ? "Signing in…" : "Sign in"}
        </PrimaryButton>
      </form>
    </AuthCard>
  );
}
