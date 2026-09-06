"use client";

import { FormEvent, Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { AuthCard } from "@/components/auth-chrome";
import { Field, PrimaryButton, TextInput } from "@/components/ui";
import { apiFetch, authClient } from "@/lib/auth-client";
import { meQueryKey, useMe } from "@/lib/session";

function authErrorMessage(err: { message?: string } | null | undefined) {
  const msg = err?.message?.trim();
  if (!msg || msg === "Failed to fetch" || /fetch failed/i.test(msg)) {
    return "Cannot reach the server. Is the API running?";
  }
  return msg;
}

function ActivateForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const meQuery = useMe({ enabled: true });
  const [phone, setPhone] = useState(searchParams.get("phone") ?? "");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const p = searchParams.get("phone");
    if (p) setPhone(p);
  }, [searchParams]);

  useEffect(() => {
    async function finishIfReady() {
      const me = meQuery.data;
      if (!me) return;
      if (me.user.approvalStatus === "invited") {
        try {
          await apiFetch("/me/activate-invite", { method: "POST" });
          await queryClient.invalidateQueries({ queryKey: meQueryKey });
        } catch {
          /* stay on page */
        }
        return;
      }
      if (me.user.approvalStatus === "approved") {
        if (me.user.role === "school_admin") router.replace("/school-admin");
        else if (me.user.role === "teacher") router.replace("/teacher");
        else if (me.user.role === "admin") router.replace("/medin");
        else router.replace("/student");
      }
    }
    void finishIfReady();
  }, [meQuery.data, queryClient, router]);

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
      await apiFetch("/me/activate-invite", { method: "POST" });
      await queryClient.invalidateQueries({ queryKey: meQueryKey });
    } catch (err) {
      setError(
        err instanceof Error ? authErrorMessage(err) : "Verification failed",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthCard
      title="Activate account"
      subtitle="Use the phone number from your school invite. Enter the OTP to activate."
      eyebrow="Kasina"
      backHref="/"
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
          <Field label="OTP code">
            <TextInput
              required
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              autoComplete="one-time-code"
            />
          </Field>
          {error ? <p className="text-sm text-error-text">{error}</p> : null}
          <PrimaryButton type="submit" disabled={loading}>
            {loading ? "Verifying…" : "Activate"}
          </PrimaryButton>
        </form>
      )}
    </AuthCard>
  );
}

export default function ActivatePage() {
  return (
    <Suspense fallback={<main className="p-16 text-center text-gray-500">Loading…</main>}>
      <ActivateForm />
    </Suspense>
  );
}
