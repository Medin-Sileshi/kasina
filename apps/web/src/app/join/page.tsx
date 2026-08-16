"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { AuthCard } from "@/components/auth-chrome";
import { Field, PrimaryButton, TextInput } from "@/components/ui";
import { apiFetch } from "@/lib/auth-client";
import { meQueryKey } from "@/lib/session";

type JoinResponse = {
  user: { name: string };
  class: { name: string; inviteCode: string };
};

export default function JoinPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [inviteCode, setInviteCode] = useState("DEMO2026");
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await apiFetch<JoinResponse>("/classes/join", {
        method: "POST",
        body: JSON.stringify({
          inviteCode,
          displayName,
          email,
          password,
        }),
      });
      await queryClient.invalidateQueries({ queryKey: meQueryKey });
      router.push("/student");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Join failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthCard
      title="Join a class"
      subtitle="Enter your teacher's invite code to get started."
    >
      <form onSubmit={onSubmit} className="flex flex-col gap-4">
        <Field label="Invite code">
          <TextInput
            required
            value={inviteCode}
            onChange={(e) => setInviteCode(e.target.value)}
            className="font-mono uppercase tracking-wide"
          />
        </Field>
        <Field label="Full name">
          <TextInput
            required
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="Enter your full name"
          />
        </Field>
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
          {loading ? "Joining…" : "Continue →"}
        </PrimaryButton>
      </form>
      <p className="mt-5 text-center text-sm text-gray-500">
        Already joined?{" "}
        <Link
          href="/student/login"
          className="font-semibold text-primary-800 hover:underline"
        >
          Sign in
        </Link>
      </p>
    </AuthCard>
  );
}
