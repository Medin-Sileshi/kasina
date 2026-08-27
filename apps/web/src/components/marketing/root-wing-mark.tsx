/** Kasina root-to-wing mark — thin line illustration for marketing surfaces. */

export function RootWingMark({
  className = "",
  tone = "deep",
}: {
  className?: string;
  tone?: "deep" | "paper" | "green" | "gold";
}) {
  const stroke =
    tone === "paper"
      ? "#F7F5F0"
      : tone === "green"
        ? "#2F5D45"
        : tone === "gold"
          ? "#C79A46"
          : "#161D19";

  return (
    <svg
      viewBox="0 0 200 240"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden
    >
      {/* Roots */}
      <path
        d="M100 150 C92 170 70 190 48 210 M100 150 C100 175 95 195 100 220 M100 150 C108 170 130 190 152 210"
        stroke={stroke}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      {/* Trunk */}
      <path
        d="M100 150 V78"
        stroke={stroke}
        strokeWidth="1.75"
        strokeLinecap="round"
      />
      {/* Wing / canopy */}
      <path
        d="M100 78 C78 72 52 78 34 98 C58 88 78 90 100 104 C122 90 142 88 166 98 C148 78 122 72 100 78 Z"
        stroke={stroke}
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path
        d="M100 88 C88 96 78 108 74 122 M100 88 C112 96 122 108 126 122"
        stroke={stroke}
        strokeWidth="1.25"
        strokeLinecap="round"
        opacity="0.7"
      />
    </svg>
  );
}

export function RootWingDivider({ className = "" }: { className?: string }) {
  return (
    <div className={`flex justify-center py-2 ${className}`} aria-hidden>
      <RootWingMark className="h-8 w-7 opacity-70" tone="gold" />
    </div>
  );
}
