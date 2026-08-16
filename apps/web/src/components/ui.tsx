import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode } from "react";

export function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <p className="text-xs font-medium uppercase tracking-[0.08em] text-gray-400">
      {children}
    </p>
  );
}

export function PrimaryButton({
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className={`inline-flex min-h-11 h-[52px] w-full items-center justify-center rounded-xl bg-primary-800 px-5 text-base font-semibold text-white transition hover:bg-primary-700 disabled:opacity-60 ${className}`}
    />
  );
}

export function SecondaryButton({
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className={`inline-flex h-12 w-full items-center justify-center rounded-xl border border-gray-200 bg-white px-5 text-base font-semibold text-gray-800 transition hover:bg-gray-50 disabled:opacity-60 ${className}`}
    />
  );
}

export function GhostButton({
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className={`inline-flex h-12 w-full items-center justify-center rounded-xl px-5 text-base font-medium text-gray-600 transition hover:text-primary-600 disabled:opacity-60 ${className}`}
    />
  );
}

export function Field({
  label,
  children,
  hint,
}: {
  label: string;
  children: ReactNode;
  hint?: string;
}) {
  return (
    <label className="flex flex-col gap-1.5 text-sm text-gray-700">
      <span className="font-medium text-gray-800">{label}</span>
      {children}
      {hint ? <span className="text-xs text-gray-400">{hint}</span> : null}
    </label>
  );
}

export function TextInput({
  className = "",
  ...props
}: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`h-12 w-full rounded-xl border border-gray-200 bg-white px-3 text-gray-950 outline-none transition placeholder:text-gray-400 focus:border-primary-600 ${className}`}
    />
  );
}

export function Card({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-2xl border border-gray-200/80 bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04),0_8px_24px_rgba(15,23,42,0.04)] ${className}`}
    >
      {children}
    </div>
  );
}

export function MetricCard({
  label,
  value,
  hint,
  accent,
  valueClassName = "",
}: {
  label: string;
  value: ReactNode;
  hint?: ReactNode;
  accent?: "default" | "warning" | "danger";
  valueClassName?: string;
}) {
  const bar =
    accent === "warning"
      ? "border-l-[3px] border-l-warning"
      : accent === "danger"
        ? "border-l-[3px] border-l-error"
        : "";
  return (
    <Card className={`p-5 ${bar}`}>
      <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-gray-400">
        {label}
      </p>
      <div
        className={`mt-2.5 text-[2rem] font-bold leading-none tracking-tight text-gray-950 ${valueClassName}`}
      >
        {value}
      </div>
      {hint ? <div className="mt-2 text-sm text-gray-500">{hint}</div> : null}
    </Card>
  );
}

export function StatusPill({
  children,
  tone = "neutral",
}: {
  children: ReactNode;
  tone?: "neutral" | "success" | "warning" | "danger" | "accent";
}) {
  const styles = {
    neutral: "bg-gray-100 text-gray-600",
    success: "bg-primary-100 text-primary-800",
    warning: "bg-warning-bg text-warning-text",
    danger: "bg-error-bg text-error-text",
    accent: "bg-accent-100 text-accent-600",
  };
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${styles[tone]}`}
    >
      {children}
    </span>
  );
}

export function DifficultyBadge({
  difficulty,
}: {
  difficulty?: string | null;
}) {
  if (!difficulty) return null;
  const styles: Record<string, string> = {
    easy: "bg-primary-50 text-primary-700 border-primary-100",
    medium: "bg-warning-bg text-warning-text border-[#FDE68A]",
    hard: "bg-error-bg text-error-text border-[#FECDD3]",
  };
  return (
    <span
      className={`rounded-full border px-2 py-0.5 text-xs font-medium capitalize ${styles[difficulty] ?? "bg-gray-100 text-gray-600 border-gray-200"}`}
    >
      {difficulty}
    </span>
  );
}

export function EmptyState({
  icon,
  title,
  body,
  action,
}: {
  icon: ReactNode;
  title: string;
  body: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center px-6 py-16 text-center">
      <div className="text-gray-300">{icon}</div>
      <h2 className="mt-4 text-lg font-semibold text-gray-950">{title}</h2>
      <p className="mt-2 max-w-sm text-sm text-gray-500">{body}</p>
      {action ? <div className="mt-6 w-full max-w-xs">{action}</div> : null}
    </div>
  );
}

export function ContentSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <div className="animate-pulse space-y-4" aria-busy="true" aria-label="Loading">
      <div className="h-7 w-48 rounded-lg bg-gray-200/80" />
      <div className="h-4 w-72 max-w-full rounded-lg bg-gray-200/60" />
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="h-24 rounded-2xl bg-gray-200/50"
          style={{ opacity: 1 - i * 0.12 }}
        />
      ))}
    </div>
  );
}

export function BrandMark({
  className = "",
  light = false,
}: {
  className?: string;
  light?: boolean;
}) {
  return (
    <span className={`font-bold tracking-tight ${light ? "text-white" : "text-gray-950"} ${className}`}>
      Kasina{" "}
      <span lang="am" className="font-ethiopic font-semibold opacity-90">
        (ካሲና)
      </span>
    </span>
  );
}
