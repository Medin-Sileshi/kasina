import Image from "next/image";
import Link from "next/link";

const MARK_SRC = "/brand/kasina-mark.png";
/** Natural aspect ~369×822 */
const MARK_ASPECT = 369 / 822;

const SIZES = {
  sm: 28,
  md: 36,
  lg: 56,
  hero: 220,
} as const;

export type KasinaLogoSize = keyof typeof SIZES;

export function KasinaMark({
  size = "md",
  className = "",
  priority = false,
}: {
  size?: KasinaLogoSize;
  className?: string;
  priority?: boolean;
}) {
  const height = SIZES[size];
  const width = Math.round(height * MARK_ASPECT);
  return (
    <Image
      src={MARK_SRC}
      alt=""
      width={width}
      height={height}
      priority={priority}
      className={`h-auto w-auto object-contain ${className}`}
      style={{ height, width }}
    />
  );
}

export function KasinaLogo({
  size = "sm",
  withWordmark = true,
  href = "/",
  className = "",
  tone = "light",
  priority = false,
}: {
  size?: Exclude<KasinaLogoSize, "hero">;
  withWordmark?: boolean;
  href?: string | null;
  className?: string;
  /** light = dark text (paper); dark = white text (green/charcoal shells) */
  tone?: "light" | "dark";
  priority?: boolean;
}) {
  const titleClass =
    size === "lg"
      ? "text-xl sm:text-2xl"
      : size === "md"
        ? "text-lg"
        : "text-base sm:text-lg";
  const amClass =
    size === "lg" ? "text-sm sm:text-base" : "text-xs sm:text-sm";
  const ink = tone === "dark" ? "text-white" : "text-mkt-ink";
  const muted = tone === "dark" ? "text-white/75" : "text-mkt-ink-muted";

  const inner = (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <KasinaMark size={size} priority={priority} />
      {withWordmark ? (
        <span className="flex items-baseline gap-1.5 leading-none">
          <span className={`font-display font-semibold tracking-tight ${ink} ${titleClass}`}>
            Kasina
          </span>
          <span
            lang="am"
            className={`font-ethiopic font-semibold ${muted} ${amClass}`}
          >
            ካሲና
          </span>
        </span>
      ) : null}
    </span>
  );

  if (href) {
    return (
      <Link href={href} className="inline-flex shrink-0 items-center">
        {inner}
      </Link>
    );
  }
  return inner;
}

/** Small centered mark used as a section divider. */
export function KasinaMarkDivider({ className = "" }: { className?: string }) {
  return (
    <div className={`flex justify-center py-3 ${className}`} aria-hidden>
      <KasinaMark size="sm" className="opacity-80" />
    </div>
  );
}
