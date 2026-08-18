# Grade 12 textbooks (online reader)

Students do **not** download PDFs. Each book is converted to chapter markdown (or page images when the PDF is a scan) and read in the app.

| Subject | Format | Typical size |
|---------|--------|----------------|
| Chemistry | Markdown chapters | ~400 KB total |
| Physics | Markdown chapters | ~300 KB total |
| Mathematics | Chapter markdown + one compressed page at a time | ~50–130 KB per page |
| Biology | Same as mathematics | ~50–130 KB per page |

## Convert

```bash
# PDFs live in content/textbooks/grade-12/ (gitignored)
python3 scripts/pdf_to_markdown.py
```

Output: `content/textbooks/md/grade-12/{subject}/`

## Upload to R2

```bash
pnpm textbooks:upload
```

## App

- Students: `/read/mathematics`
- Teachers: `/teacher/textbook/mathematics`
- API: `GET /textbooks/grade-12/:subject` (index), `/chapters/:id` (markdown), `/pages/:file` (image)
