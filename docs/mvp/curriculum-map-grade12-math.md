# Grade 12 Mathematics — curriculum map (MVP bank)

Kasina’s practice tags are a **teaching-oriented map**, not a 1:1 copy of MoE chapter titles. Use this table when assigning and when expanding the bank.

Seed file: [`packages/question-bank/data/grade12-math-seed.json`](../../packages/question-bank/data/grade12-math-seed.json)

## Bank units → MoE alignment

| Bank `unit` / `topic` | New MoE (5 units) | Old MoE (9 units) notes |
|----------------------|-------------------|-------------------------|
| **Sequences and Series** / Arithmetic, Geometric, Series Summation | Unit 1 Sequence and Series | Unit 1 Sequences & Series |
| **Calculus** / Limits | Unit 2 Intro to Calculus | Unit 2 Limits & Continuity |
| **Calculus** / Power Rule, Product Rule | Unit 2 | Units 3–4 Differential calculus |
| **Calculus** / Applications of Derivatives | Unit 2 | Unit 4 Applications |
| **Calculus** / Integrals | Unit 2 (intro) | Unit 5 Integral calculus |
| **Statistics** / Mean and Median, Probability | Unit 3 Statistics | Later statistics units |
| **Geometry** / Triangles, Circles, Coordinate | Supporting / review | Related to geometry strands |
| **Sets and Relations**, **Algebra** | Review (often Gr 11) | Review before Gr 12 core |
| *(not yet in bank)* Linear Programming | Unit 4 | — |
| *(not yet in bank)* Business math applications | Unit 5 | Unit 9 applications |
| *(not yet in bank)* 3D / Vectors | — | Unit 6 (NS track) |

## Pilot assignment guidance

Prefer topics with **≥10** questions so “Assign 10” does not reuse items heavily:

- Power Rule, Product Rule (after expansion)
- Sequences topics, Applications of Derivatives, Integrals
- Deepened Geometry / Statistics topics

## Content sources (for authors)

**Canonical MVP textbook:** Grade 12 Mathematics, read online as chapter pages (not a PDF download).  
Catalog: [`content/textbooks/manifest.json`](../../content/textbooks/manifest.json)  
Convert: `pnpm textbooks:convert`  
Upload: `pnpm textbooks:upload`  
App: `/read/mathematics` (students), `/teacher/textbook/mathematics` (teachers)

Chemistry and physics are real markdown chapters. Mathematics and biology are scanned books, so the reader loads one compressed page at a time.

Use the Math PDF when reviewing explanations and expanding `grade12-math-seed.json`. Past ESSLCE papers and optional Gr 11 review items remain secondary sources.

## Amharic

`stemAm` / `explanationAm` are optional in schema. MVP ships a **sample set** (~20+) on high-traffic calculus/sequences/geometry/stats items. Full Amharic coverage waits on textbook-backed review.
