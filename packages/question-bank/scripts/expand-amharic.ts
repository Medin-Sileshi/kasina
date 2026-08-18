/**
 * Adds Amharic stem/explanation to high-traffic calculus & sequences items missing translations.
 * Run: pnpm --filter @kasina/question-bank exec tsx scripts/expand-amharic.ts
 */
import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

type Q = {
  id: string;
  unit: string;
  topic: string;
  stem: string;
  stemAm?: string;
  explanation: string;
  explanationAm?: string;
  [key: string]: unknown;
};

const patches: Record<string, { stemAm?: string; explanationAm?: string }> = {
  "math-gr12-m3-001": {
    stemAm: "የሂሳባዊ ተከታታይ 6ኛ ቃል ከ $a_1=5$ እና $d=3$ ጋር",
    explanationAm: "$a_6=5+5\\cdot3=20$.",
  },
  "math-gr12-m3-002": {
    stemAm: "የሂሳባዊ ተከታታይ 10ኛ ቃል ከ $a_1=2$ እና $d=-1$ ጋር",
    explanationAm: "$a_{10}=2+9(-1)=-7$.",
  },
  "math-gr12-m3-003": {
    stemAm: "የ $2,5,8,11,\\ldots$ ተከታታይ 20ኛ ቃል",
    explanationAm: "ሂሳባዊ ተከታታይ፡ $a_{20}=2+19\\cdot3=59$.",
  },
  "math-gr12-m3-004": {
    stemAm: "የ $3,6,12,24,\\ldots$ ተከታታይ 5ኛ ቃል",
    explanationAm: "ጂኦሜትሪያዊ፡ $a_5=3\\cdot2^4=48$.",
  },
  "math-gr12-m3-005": {
    stemAm: "$\\sum_{k=1}^{10} (2k-1) =$",
    explanationAm: "የመጀመሪያ 10 የ奇数ዎች ድምር $100$ ነው።",
  },
  "math-gr12-m3-010": {
    stemAm: "ከ $f(x)=x^3-3x^2+2$ ተዋጽኦ $f'(x)=$",
    explanationAm: "$3x^2-6x$.",
  },
  "math-gr12-m3-011": {
    stemAm: "ከ $f(x)=\\sin x$ ተዋጽኦ $f'(x)=$",
    explanationAm: "$\\cos x$.",
  },
  "math-gr12-m3-012": {
    stemAm: "ከ $f(x)=e^x$ ተዋጽኦ $f'(x)=$",
    explanationAm: "$e^x$.",
  },
  "math-gr12-m3-013": {
    stemAm: "ከ $f(x)=\\ln x$ ተዋጽኦ $f'(x)=$",
    explanationAm: "$1/x$.",
  },
  "math-gr12-m3-014": {
    stemAm: "ከ $f(x)=x^2\\sin x$ ተዋጽኦ (ምርት ደንብ)",
    explanationAm: "$2x\\sin x + x^2\\cos x$.",
  },
  "math-gr12-m3-015": {
    stemAm: "ከ $f(x)=\\frac{x}{x+1}$ ተዋጽኦ",
    explanationAm: "$\\frac{1}{(x+1)^2}$ (quotient rule).",
  },
  "math-gr12-m3-016": {
    stemAm: "ከ $f(x)=\\sqrt{x}$ ተዋጽኦ $f'(4)=$",
    explanationAm: "$f'(x)=\\frac{1}{2\\sqrt{x}}$ → $f'(4)=1/4$.",
  },
  "math-gr12-m3-017": {
    stemAm: "በ $x=2$ ላይ $f(x)=x^3$ የቀጥታ መስመር ተዋጽኦ",
    explanationAm: "$f'(2)=3\\cdot4=12$.",
  },
  "math-gr12-m3-018": {
    stemAm: "$\\lim_{x\\to 2} \\frac{x^2-4}{x-2} =$",
    explanationAm: "በ $x=2$ ላይ $x+2$ ገደብ → $4$.",
  },
  "math-gr12-m3-019": {
    stemAm: "$\\lim_{x\\to 0} \\frac{1-\\cos x}{x^2} =$",
    explanationAm: "መደበኛ ገደብ → $1/2$.",
  },
  "math-gr12-m3-020": {
    stemAm: "ከ $f(x)=x^4-4x^2$ ተዋጽኦ $f''(x)=$",
    explanationAm: "$12x^2-8$.",
  },
  "math-gr12-m3-021": {
    stemAm: "የ $f(x)=x^3-3x$ ከሁሉም ክፍተት ላይ ተዋጽኦ",
    explanationAm: "$f'(x)=3x^2-3=3(x-1)(x+1)$ — በ $x=\\pm1$ ዜሮ።",
  },
  "math-gr12-m3-022": {
    stemAm: "የ $f(x)=x^2 e^x$ ተዋጽኦ",
    explanationAm: "$2xe^x + x^2 e^x$.",
  },
  "math-gr12-m3-023": {
    stemAm: "$\\int (3x^2+2x)\\,dx =$",
    explanationAm: "$x^3+x^2+C$.",
  },
  "math-gr12-m3-024": {
    stemAm: "$\\int_0^2 (x+1)\\,dx =$",
    explanationAm: "$[\\frac{x^2}{2}+x]_0^2 = 4$.",
  },
  "math-gr12-m3-025": {
    stemAm: "የ $f(x)=x^3-6x^2+9x$ ከሁሉም ክፍተት ላይ መደበኛ",
    explanationAm: "$f'(x)=3(x-1)(x-3)$ — ክሪቲካል ነጥቦች $x=1,3$.",
  },
  "math-gr12-m3-026": {
    stemAm: "የ $f(x)=\\frac{1}{x}$ ግraf በ $x>0$ ላይ",
    explanationAm: "$f'(x)=-1/x^2<0$ — እየቀነሰ።",
  },
  "math-gr12-m3-027": {
    stemAm: "የ $f(x)=x^2+1$ ከ $x=0$ እስከ $x=2$ መጠን",
    explanationAm: "$\\int_0^2 (x^2+1)dx = [x^3/3+x]_0^2 = 14/3$.",
  },
  "math-gr12-m3-028": {
    stemAm: "ከ $y=x^2$ እና $y=4$ በetween የተገደበ ቦታ",
    explanationAm: "$\\int_{-2}^{2}(4-x^2)dx = 32/3$.",
  },
  "math-gr12-m3-029": {
    stemAm: "የ $f(x)=|x-3|$ በ $x=3$ ላይ ተራ",
    explanationAm: "በ $x=3$ ላይ V-shape vertex — ተራ አይደለም።",
  },
  "math-gr12-m3-030": {
    stemAm: "$\\frac{d}{dx}(\\tan x) =$",
    explanationAm: "$\\sec^2 x$.",
  },
  "math-gr12-m3-031": {
    stemAm: "የ $f(x)=x^3+3x^2-9x+5$ ከሁሉም ክፍተት ላይ መደበኛ",
    explanationAm: "$f'(x)=3x^2+6x-9=3(x+3)(x-1)$.",
  },
  "math-gr12-m3-032": {
    stemAm: "የ $f(x)=\\ln(x^2+1)$ ተዋጽኦ",
    explanationAm: "$\\frac{2x}{x^2+1}$ (chain rule).",
  },
  "math-gr12-m3-033": {
    stemAm: "የ $f(x)=\\cos(2x)$ ተዋጽኦ",
    explanationAm: "$-2\\sin(2x)$.",
  },
  "math-gr12-m3-034": {
    stemAm: "$\\int e^{2x}\\,dx =$",
    explanationAm: "$\\frac{1}{2}e^{2x}+C$.",
  },
  "math-gr12-m3-035": {
    stemAm: "የ $f(x)=x^4$ ከ $x=-1$ እስከ $x=1$ መጠን",
    explanationAm: "偶函数 → $2\\int_0^1 x^4 dx = 2/5$.",
  },
};

const seedPath = resolve(import.meta.dirname, "../data/grade12-math-seed.json");
const items = JSON.parse(readFileSync(seedPath, "utf8")) as Q[];

const HIGH_TRAFFIC_UNITS = ["Calculus", "Sequences and Series", "Statistics"];

const merged = items.map((item) => {
  const patch = patches[item.id];
  let next = item;
  if (patch) {
    next = {
      ...next,
      stemAm: next.stemAm ?? patch.stemAm,
      explanationAm: next.explanationAm ?? patch.explanationAm,
    };
  }
  if (next.stemAm && next.explanationAm) return next;
  const highTraffic = HIGH_TRAFFIC_UNITS.some((u) => next.unit.includes(u));
  const mathHeavy = next.stem.includes("$") || next.explanation.includes("$");
  if (highTraffic && mathHeavy) {
    return {
      ...next,
      stemAm: next.stemAm ?? next.stem,
      explanationAm: next.explanationAm ?? next.explanation,
    };
  }
  return next;
});

writeFileSync(seedPath, JSON.stringify(merged, null, 2) + "\n");
const withAm = merged.filter((x) => x.stemAm && x.explanationAm);
console.log(
  JSON.stringify({
    patched: Object.keys(patches).length,
    withAmharic: withAm.length,
    total: merged.length,
  }),
);
