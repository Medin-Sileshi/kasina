"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { AuthCard } from "@/components/auth-chrome";
import { Field, PrimaryButton, TextInput } from "@/components/ui";
import { apiFetch } from "@/lib/auth-client";
import { meQueryKey } from "@/lib/session";
import { fetchSchools, type School } from "@/lib/schools";

type JoinResponse = {
  user: { name: string; approvalStatus?: string };
  class: { name: string; inviteCode: string };
  pendingApproval?: boolean;
};

export default function JoinPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [inviteCode, setInviteCode] = useState("DEMO2026");
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [schoolId, setSchoolId] = useState("");
  const [schools, setSchools] = useState<School[]>([]);
  const [schoolsError, setSchoolsError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    void fetchSchools()
      .then((list) => setSchools(list))
      .catch((err) =>
        setSchoolsError(
          err instanceof Error ? err.message : "Could not load schools",
        ),
      );
  }, []);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!schoolId) {
      setError("Please select your school.");
      return;
    }
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
          schoolId,
          ...(phone.trim() ? { phone: phone.trim() } : {}),
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
      subtitle="Enter your teacher's invite code and select your school."
      eyebrow="Get started"
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
        <Field label="School">
          <select
            required
            value={schoolId}
            onChange={(e) => setSchoolId(e.target.value)}
            className="h-12 w-full rounded-2xl border border-gray-200 bg-white px-3 text-gray-950 outline-none transition focus:border-primary-600"
          >
            <option value="">Select your school</option>
            {schools.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
                {s.subCity ? ` · ${s.subCity}` : ""}
              </option>
            ))}
          </select>
          {schoolsError ? (
            <span className="text-xs text-error-text">{schoolsError}</span>
          ) : null}
        </Field>
        <Field label="Full name">
          <TextInput
            required
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="Enter your full name"
          />
        </Field>
        <Field label="Phone (optional)" hint="Preferred for OTP sign-in later">
          <TextInput
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+251…"
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
        <PrimaryButton type="submit" disabled={loading || !schools.length}>
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
