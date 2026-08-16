import type { ReactNode } from "react";

/** Shared green atmosphere used on landing, auth, and app shells. */
export function BrandAtmosphere({
  className = "",
}: {
  className?: string;
}) {
  return (
    <div aria-hidden className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(64,145,108,0.35),transparent_55%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_80%_70%,rgba(244,162,97,0.12),transparent_45%)]" />
      <div className="landing-drift absolute -left-24 top-24 h-72 w-72 rounded-full bg-primary-600/20 blur-3xl" />
      <div className="landing-drift-slow absolute -right-16 bottom-[20%] h-80 w-80 rounded-full bg-primary-900/40 blur-3xl" />
    </div>
  );
}

export function BrandWordmark({
  size = "md",
  className = "",
}: {
  size?: "md" | "lg";
  className?: string;
}) {
  const title =
    size === "lg"
      ? "text-[3rem] sm:text-[3.75rem]"
      : "text-[2.5rem] sm:text-[2.75rem]";
  const am = size === "lg" ? "text-2xl sm:text-3xl" : "text-xl sm:text-2xl";

  return (
    <div className={`text-center ${className}`}>
      <p className={`font-bold leading-none tracking-tight text-white ${title}`}>
        Kasina
      </p>
      <p
        lang="am"
        className={`mt-2.5 font-ethiopic font-semibold tracking-wide text-white/90 ${am}`}
      >
        ካሲና
      </p>
    </div>
  );
}

export function SheetHandle() {
  return (
    <div className="mx-auto mb-7 h-1.5 w-12 shrink-0 rounded-full bg-gray-200" />
  );
}

/** White bottom sheet — top radius only, flush to lower edge. */
export function BottomSheet({
  children,
  className = "",
  showHandle = true,
  maxWidth = "md",
}: {
  children: ReactNode;
  className?: string;
  showHandle?: boolean;
  maxWidth?: "md" | "lg" | "6xl" | "full";
}) {
  const width =
    maxWidth === "full"
      ? "max-w-none"
      : maxWidth === "6xl"
        ? "max-w-6xl"
        : maxWidth === "lg"
          ? "max-w-lg"
          : "max-w-md";

  return (
    <section
      className={`relative z-10 mx-auto flex w-full flex-col ${width} ${className}`}
    >
      <div className="landing-sheet-in flex flex-col rounded-t-[2.25rem] bg-white px-7 pb-10 pt-4 shadow-[0_-16px_48px_rgba(0,44,27,0.35)] sm:rounded-t-[2rem] sm:px-9 sm:pb-11 sm:pt-5">
        {showHandle ? <SheetHandle /> : null}
        {children}
      </div>
    </section>
  );
}
