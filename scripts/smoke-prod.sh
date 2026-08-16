#!/usr/bin/env bash
# Smoke critical path against a deployed (or local) API.
# Usage:
#   ./scripts/smoke-prod.sh
#   API_URL=https://api.kasina.et ./scripts/smoke-prod.sh
set -euo pipefail

API_URL="${API_URL:-http://localhost:8787}"
WEB_URL="${WEB_URL:-http://localhost:3000}"
COOKIE_JAR="$(mktemp)"
trap 'rm -f "$COOKIE_JAR"' EXIT

echo "== health =="
curl -sS -m 20 "$API_URL/health" | tee /tmp/kasina-smoke-health.json
echo
grep -q '"ok":true' /tmp/kasina-smoke-health.json

echo "== web =="
code="$(curl -sS -m 20 -o /dev/null -w "%{http_code}" "$WEB_URL" || true)"
echo "GET $WEB_URL → $code"
# Soft check: web may be down while API-only smoke is useful
if [[ "$code" != "200" ]]; then
  echo "WARN: web did not return 200 (got $code)"
fi

TEACHER_EMAIL="${SMOKE_TEACHER_EMAIL:-smoke-teacher-$(date +%s)@kasina.et}"
TEACHER_PASS="${SMOKE_TEACHER_PASS:-SmokeTest123!}"

echo "== teacher sign-up ($TEACHER_EMAIL) =="
signup="$(curl -sS -m 30 -c "$COOKIE_JAR" -b "$COOKIE_JAR" \
  -H 'Content-Type: application/json' \
  -d "{\"email\":\"$TEACHER_EMAIL\",\"password\":\"$TEACHER_PASS\",\"name\":\"Smoke Teacher\",\"role\":\"teacher\"}" \
  -w "\n%{http_code}" \
  "$API_URL/api/auth/sign-up/email" || true)"
echo "$signup" | tail -5

echo "== teacher sign-in =="
curl -sS -m 30 -c "$COOKIE_JAR" -b "$COOKIE_JAR" \
  -H 'Content-Type: application/json' \
  -d "{\"email\":\"$TEACHER_EMAIL\",\"password\":\"$TEACHER_PASS\"}" \
  -o /tmp/kasina-smoke-login.json \
  -w "login:%{http_code}\n" \
  "$API_URL/api/auth/sign-in/email"
grep -q '"token"' /tmp/kasina-smoke-login.json || grep -q '"user"' /tmp/kasina-smoke-login.json

echo "== /me =="
curl -sS -m 20 -b "$COOKIE_JAR" -o /tmp/kasina-smoke-me.json -w "me:%{http_code}\n" "$API_URL/me"
grep -q '"role"' /tmp/kasina-smoke-me.json

echo "== create class =="
curl -sS -m 20 -b "$COOKIE_JAR" \
  -H 'Content-Type: application/json' \
  -d '{"name":"Smoke Class"}' \
  -o /tmp/kasina-smoke-class.json \
  -w "class:%{http_code}\n" \
  "$API_URL/classes"
CLASS_ID="$(node -e 'const j=require("/tmp/kasina-smoke-class.json"); process.stdout.write(j.class?.id||j.id||"")')"
if [[ -z "$CLASS_ID" ]]; then
  echo "WARN: could not parse class id; overview check only"
  curl -sS -m 60 -b "$COOKIE_JAR" -o /tmp/kasina-smoke-ov.json -w "overview:%{http_code}\n" "$API_URL/classes/overview"
else
  echo "classId=$CLASS_ID"
  echo "== class detail =="
  curl -sS -m 30 -b "$COOKIE_JAR" -o /tmp/kasina-smoke-detail.json -w "detail:%{http_code}\n" "$API_URL/classes/$CLASS_ID"
  echo "== class results =="
  curl -sS -m 60 -b "$COOKIE_JAR" -o /tmp/kasina-smoke-results.json -w "results:%{http_code}\n" "$API_URL/classes/$CLASS_ID/results"
fi

echo "== overview =="
curl -sS -m 60 -b "$COOKIE_JAR" -o /tmp/kasina-smoke-ov.json -w "overview:%{http_code}\n" "$API_URL/classes/overview"

echo "OK smoke finished against $API_URL"
