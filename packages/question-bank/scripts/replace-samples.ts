/**
 * Replaces [SAMPLE] placeholder questions with real items cloned from the same unit/topic pool.
 * Run: pnpm --filter @kasina/question-bank exec tsx scripts/replace-samples.ts
 */
import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

type Q = {
  id: string;
  grade: number;
  subject: string;
  stream?: string;
  year?: number;
  unit: string;
  topic: string;
  stem: string;
  stemAm?: string;
  options: unknown;
  correctOptionId: string;
  explanation: string;
  explanationAm?: string;
  difficulty?: string;
  tags?: string[];
};

function isSample(q: Q) {
  return (
    q.stem.includes("[SAMPLE]") ||
    (q.tags ?? []).some((t) => t.toLowerCase() === "sample")
  );
}

const seedPath = resolve(import.meta.dirname, "../data/grade12-math-seed.json");
const all = JSON.parse(readFileSync(seedPath, "utf8")) as Q[];

const real = all.filter((q) => !isSample(q));
const samples = all.filter(isSample);

const byTopic = new Map<string, Q[]>();
const byUnit = new Map<string, Q[]>();
for (const q of real) {
  const tk = `${q.unit}::${q.topic}`;
  byTopic.set(tk, [...(byTopic.get(tk) ?? []), q]);
  byUnit.set(q.unit, [...(byUnit.get(q.unit) ?? []), q]);
}

const used = new Map<string, number>();
function pickSource(sample: Q): Q {
  const tk = `${sample.unit}::${sample.topic}`;
  const pool =
    byTopic.get(tk) ??
    byUnit.get(sample.unit) ??
    real.filter((q) => q.unit.includes("Calculus") || q.unit.includes("Sequences"));
  if (!pool.length) throw new Error(`No real pool for ${sample.unit} / ${sample.topic}`);
  const idx = used.get(tk) ?? 0;
  used.set(tk, idx + 1);
  return pool[idx % pool.length]!;
}

const replacements = samples.map((sample) => {
  const source = pickSource(sample);
  const tags = (source.tags ?? []).filter((t) => t.toLowerCase() !== "sample");
  return {
    ...source,
    id: sample.id,
    year: sample.year ?? source.year,
    tags: [...new Set([...tags, "replaced-sample"])],
  };
});

const sampleIds = new Set(samples.map((s) => s.id));
const merged = [
  ...all.filter((q) => !sampleIds.has(q.id)),
  ...replacements,
];

writeFileSync(seedPath, JSON.stringify(merged, null, 2) + "\n");
console.log(
  JSON.stringify({
    replaced: replacements.length,
    total: merged.length,
    remainingSamples: merged.filter(isSample).length,
  }),
);
