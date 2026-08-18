"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { AuthCard } from "@/components/auth-chrome";
import { Field, PrimaryButton, TextInput } from "@/components/ui";
import { apiFetch } from "@/lib/auth-client";
import { meQueryKey } from "@/lib/session";

function authErrorMessage(err: unknown) {
  const msg = err instanceof Error ? err.message : String(err);
  if (!msg || msg === "Failed to fetch" || /fetch failed/i.test(msg)) {
    return "Cannot reach the server or database. Is the API running, and is Supabase online?";
  }
  return msg;
}

export default function TeacherSignupPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [accessCode, setAccessCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await apiFetch("/teacher/signup", {
        method: "POST",
        body: JSON.stringify({ name, email, password, accessCode }),
      });
      await queryClient.invalidateQueries({ queryKey: meQueryKey });
      router.push("/teacher");
    } catch (err) {
      setError(authErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthCard
      title="Create teacher account"
      subtitle="Set up your classroom on Kasina. Pilot schools need an access code from Kasina."
      eyebrow="Teachers"
    >
      <form onSubmit={onSubmit} className="flex flex-col gap-4">
        <Field label="Full name">
          <TextInput
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </Field>
        <Field label="Email">
          <TextInput
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="teacher@kasina.local"
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
        <Field label="Teacher access code">
          <TextInput
            required
            value={accessCode}
            onChange={(e) => setAccessCode(e.target.value)}
            placeholder="From your Kasina pilot contact"
          />
        </Field>
        {error ? <p className="text-sm text-error-text">{error}</p> : null}
        <PrimaryButton type="submit" disabled={loading}>
          {loading ? "Creating…" : "Create account"}
        </PrimaryButton>
      </form>
      <p className="mt-5 text-center text-sm text-gray-500">
        Already registered?{" "}
        <Link
          href="/teacher/login"
          className="font-semibold text-primary-800 hover:underline"
        >
          Sign in
        </Link>
      </p>
    </AuthCard>
  );
}
