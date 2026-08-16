import { readFileSync, readdirSync, statSync } from "node:fs";
import { resolve, join, extname } from "node:path";
import { questionBankSchema, questionSchema } from "../src/schema";

const args = process.argv.slice(2);
const target =
  args.find((a) => !a.startsWith("-")) ??
  resolve(import.meta.dirname, "../data/grade12-math-seed.json");

function collectJsonFiles(path: string): string[] {
  const st = statSync(path);
  if (st.isFile()) return [path];
  return readdirSync(path)
    .filter((f) => extname(f) === ".json")
    .map((f) => join(path, f));
}

function load(path: string): unknown {
  return JSON.parse(readFileSync(path, "utf8"));
}

let total = 0;
let failed = 0;

for (const file of collectJsonFiles(target)) {
  try {
    const data = load(file);
    const questions = Array.isArray(data)
      ? questionBankSchema.parse(data)
      : [questionSchema.parse(data)];

    // Extra required-field gate (explicit for CLI messaging)
    for (const q of questions) {
      if (!q.unit || !q.topic || !q.correctOptionId || !q.explanation) {
        throw new Error(`Missing required field on ${q.id}`);
      }
    }

    console.log(`OK  ${file} (${questions.length} question(s))`);
    total += questions.length;
  } catch (err) {
    failed += 1;
    console.error(`FAIL ${file}`);
    console.error(err instanceof Error ? err.message : err);
  }
}

if (failed > 0) {
  console.error(`\nValidation failed for ${failed} file(s).`);
  process.exit(1);
}

console.log(`\nValidated ${total} question(s).`);
