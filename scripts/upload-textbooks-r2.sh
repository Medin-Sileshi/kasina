#!/usr/bin/env bash
# Upload Grade 12 MoE student textbooks to Cloudflare R2 (kasina-textbooks).
# Prereq: enable R2 in the Cloudflare dashboard, then wrangler login.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
DIR="$ROOT/content/textbooks/grade-12"
BUCKET="kasina-textbooks"
cd "$ROOT/apps/server"

if [[ ! -d "$DIR" ]]; then
  echo "Missing $DIR — copy the four PDFs there first."
  exit 1
fi

echo "Ensuring bucket $BUCKET exists..."
if ! npx wrangler r2 bucket list 2>/dev/null | grep -q "$BUCKET"; then
  npx wrangler r2 bucket create "$BUCKET"
fi

upload() {
  local subject="$1"
  local src="$2"
  local key="textbooks/grade-12/${subject}/student-textbook.pdf"
  if [[ ! -f "$src" ]]; then
    echo "Missing file: $src"
    exit 1
  fi
  echo "Uploading $subject ($(du -h "$src" | awk '{print $1}')) → $key"
  npx wrangler r2 object put "${BUCKET}/${key}" \
    --file "$src" \
    --content-type application/pdf \
    --remote
}

# Prefer clean local names; fall back to original kehulum filenames.
math_src=$(ls "$DIR"/grade-12-mathematics*.pdf 2>/dev/null | head -1)
phys_src=$(ls "$DIR"/grade-12-physics*.pdf 2>/dev/null | head -1)
chem_src=$(ls "$DIR"/grade-12-chemistry*.pdf 2>/dev/null | head -1)
bio_src=$(ls "$DIR"/grade-12-biology*.pdf 2>/dev/null | head -1)

upload mathematics "$math_src"
upload physics "$phys_src"
upload chemistry "$chem_src"
upload biology "$bio_src"

echo "Done. Verifying with Cloudflare API via wrangler bucket objects is optional."
echo "Keys:"
echo "  textbooks/grade-12/mathematics/student-textbook.pdf"
echo "  textbooks/grade-12/physics/student-textbook.pdf"
echo "  textbooks/grade-12/chemistry/student-textbook.pdf"
echo "  textbooks/grade-12/biology/student-textbook.pdf"
