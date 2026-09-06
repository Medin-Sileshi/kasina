"use client";

import { FormEvent, useState } from "react";
import {
  MarketingEyebrow,
  MarketingH1,
  MarketingLead,
  MarketingPageShell,
} from "@/components/marketing/page-shell";
import { Field, PrimaryButton, TextInput } from "@/components/ui";
import { apiBase } from "@/lib/auth-client";

export default function SchoolJoinPage() {
  const [schoolName, setSchoolName] = useState("");
  const [subCity, setSubCity] = useState("");
  const [woreda, setWoreda] = useState("");
  const [region, setRegion] = useState("Addis Ababa");
  const [declaredSchoolType, setDeclaredSchoolType] = useState<
    "government" | "private" | "other"
  >("government");
  const [contactName, setContactName] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [estimatedTeachers, setEstimatedTeachers] = useState("");
  const [estimatedStudents, setEstimatedStudents] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${apiBase}/school-join-requests`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          schoolName,
          subCity: subCity || undefined,
          woreda: woreda || undefined,
          region: region || "Addis Ababa",
          declaredSchoolType,
          contactName,
          contactPhone,
          contactEmail: contactEmail || undefined,
          estimatedTeachers: estimatedTeachers
            ? Number(estimatedTeachers)
            : undefined,
          estimatedStudents: estimatedStudents
            ? Number(estimatedStudents)
            : undefined,
        }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        setError(data.error || `Request failed (${res.status})`);
        return;
      }
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not submit");
    } finally {
      setLoading(false);
    }
  }

  return (
    <MarketingPageShell>
      <MarketingEyebrow>Schools</MarketingEyebrow>
      <MarketingH1>Request to join Kasina</MarketingH1>
      <MarketingLead>
        Tell us about your school. A Kasina admin will review government-school
        eligibility and contact you — this does not create an account yet.
      </MarketingLead>

      {done ? (
        <div className="mt-10 rounded-xl border border-mkt-rule bg-mkt-panel px-5 py-6">
          <p className="font-display text-lg font-semibold text-mkt-ink">
            Request received
          </p>
          <p className="mt-2 text-[14px] text-mkt-ink-muted">
            We will review your submission and follow up with the contact phone
            you provided.
          </p>
        </div>
      ) : (
        <form
          onSubmit={onSubmit}
          className="mt-10 flex max-w-xl flex-col gap-4 rounded-xl border border-mkt-rule bg-mkt-panel px-5 py-6"
        >
          <Field label="School name">
            <TextInput
              required
              value={schoolName}
              onChange={(e) => setSchoolName(e.target.value)}
            />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Sub-city">
              <TextInput
                value={subCity}
                onChange={(e) => setSubCity(e.target.value)}
              />
            </Field>
            <Field label="Woreda">
              <TextInput
                value={woreda}
                onChange={(e) => setWoreda(e.target.value)}
              />
            </Field>
          </div>
          <Field label="Region">
            <TextInput
              value={region}
              onChange={(e) => setRegion(e.target.value)}
            />
          </Field>
          <Field label="School type (self-declared)">
            <select
              className="h-11 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm"
              value={declaredSchoolType}
              onChange={(e) =>
                setDeclaredSchoolType(
                  e.target.value as "government" | "private" | "other",
                )
              }
            >
              <option value="government">Government</option>
              <option value="private">Private</option>
              <option value="other">Other</option>
            </select>
          </Field>
          <Field label="Contact name">
            <TextInput
              required
              value={contactName}
              onChange={(e) => setContactName(e.target.value)}
            />
          </Field>
          <Field label="Contact phone">
            <TextInput
              required
              type="tel"
              placeholder="+251…"
              value={contactPhone}
              onChange={(e) => setContactPhone(e.target.value)}
            />
          </Field>
          <Field label="Contact email (optional)">
            <TextInput
              type="email"
              value={contactEmail}
              onChange={(e) => setContactEmail(e.target.value)}
            />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Est. teachers">
              <TextInput
                type="number"
                min={0}
                value={estimatedTeachers}
                onChange={(e) => setEstimatedTeachers(e.target.value)}
              />
            </Field>
            <Field label="Est. students">
              <TextInput
                type="number"
                min={0}
                value={estimatedStudents}
                onChange={(e) => setEstimatedStudents(e.target.value)}
              />
            </Field>
          </div>
          {error ? <p className="text-sm text-error-text">{error}</p> : null}
          <PrimaryButton type="submit" disabled={loading}>
            {loading ? "Submitting…" : "Submit request"}
          </PrimaryButton>
        </form>
      )}
    </MarketingPageShell>
  );
}
