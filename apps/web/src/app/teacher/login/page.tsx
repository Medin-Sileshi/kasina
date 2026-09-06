"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { AuthCard } from "@/components/auth-chrome";
import { Field, PrimaryButton, TextInput, SecondaryButton } from "@/components/ui";
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
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [email, setEmail] = useState("teacher@kasina.local");
  const [password, setPassword] = useState("");
  const [showEmail, setShowEmail] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function sendOtp(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const { error: err } = await authClient.phoneNumber.sendOtp({
        phoneNumber: phone.trim(),
      });
      if (err) {
        setError(authErrorMessage(err));
        return;
      }
      setOtpSent(true);
    } catch (err) {
      setError(
        err instanceof Error ? authErrorMessage(err) : "Could not send code",
      );
    } finally {
      setLoading(false);
    }
  }

  async function verifyOtp(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const { error: err } = await authClient.phoneNumber.verify({
        phoneNumber: phone.trim(),
        code: otp.trim(),
      });
      if (err) {
        setError(authErrorMessage(err));
        return;
      }
      await queryClient.invalidateQueries({ queryKey: meQueryKey });
      router.push("/teacher");
    } catch (err) {
      setError(
        err instanceof Error ? authErrorMessage(err) : "Verification failed",
      );
    } finally {
      setLoading(false);
    }
  }

  async function onEmailSubmit(e: FormEvent) {
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
      subtitle="Sign in with phone OTP. Email is available as a backup."
      eyebrow="Teachers"
    >
      {!otpSent ? (
        <form onSubmit={sendOtp} className="flex flex-col gap-4">
          <Field label="Phone number">
            <TextInput
              type="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+251…"
              autoComplete="tel"
            />
          </Field>
          {error ? <p className="text-sm text-error-text">{error}</p> : null}
          <PrimaryButton type="submit" disabled={loading}>
            {loading ? "Sending…" : "Send code"}
          </PrimaryButton>
        </form>
      ) : (
        <form onSubmit={verifyOtp} className="flex flex-col gap-4">
          <Field label="Phone number">
            <TextInput value={phone} readOnly />
          </Field>
          <Field label="Verification code">
            <TextInput
              required
              inputMode="numeric"
              autoComplete="one-time-code"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="6-digit code"
            />
          </Field>
          {error ? <p className="text-sm text-error-text">{error}</p> : null}
          <PrimaryButton type="submit" disabled={loading}>
            {loading ? "Verifying…" : "Verify & sign in"}
          </PrimaryButton>
          <SecondaryButton
            type="button"
            disabled={loading}
            onClick={() => {
              setOtpSent(false);
              setOtp("");
              setError(null);
            }}
          >
            Use a different number
          </SecondaryButton>
        </form>
      )}

      <div className="mt-6 border-t border-gray-100 pt-4">
        <button
          type="button"
          className="text-sm font-medium text-gray-500 hover:text-primary-800"
          onClick={() => setShowEmail((v) => !v)}
        >
          {showEmail ? "Hide email sign-in" : "Sign in with email instead"}
        </button>
        {showEmail ? (
          <form onSubmit={onEmailSubmit} className="mt-4 flex flex-col gap-4">
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
            <PrimaryButton type="submit" disabled={loading}>
              {loading ? "Signing in…" : "Sign in with email"}
            </PrimaryButton>
          </form>
        ) : null}
      </div>

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
