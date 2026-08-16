# Grade 12 MoE textbooks (R2)

PDFs are **not** committed. They live in Cloudflare R2 bucket `kasina-textbooks`.

| Subject | R2 key | MVP |
|---------|--------|-----|
| Mathematics | `textbooks/grade-12/mathematics/student-textbook.pdf` | Active (pilot) |
| Physics | `textbooks/grade-12/physics/student-textbook.pdf` | Archived |
| Chemistry | `textbooks/grade-12/chemistry/student-textbook.pdf` | Archived |
| Biology | `textbooks/grade-12/biology/student-textbook.pdf` | Archived |

- Manifest: [`manifest.json`](./manifest.json) and `apps/server/src/data/textbooks.json`
- Upload: place PDFs in `grade-12/`, then `pnpm textbooks:upload`
- App: signed-in users open Math via `GET /textbooks/grade-12/mathematics`
