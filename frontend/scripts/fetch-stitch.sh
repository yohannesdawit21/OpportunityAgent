#!/usr/bin/env bash
# Fetch Stitch screens (HTML + PNG) via MCP — project OpportunityAgent
set -euo pipefail

PROJECT_ID="${STITCH_PROJECT_ID:-3374957064951637134}"
OUT_DIR="$(cd "$(dirname "$0")/.." && pwd)/stitch-assets/${PROJECT_ID}"
MCP_URL="https://stitch.googleapis.com/mcp"

if [[ -z "${STITCH_API_KEY:-}" ]]; then
  STITCH_API_KEY=$(python3 -c "import json; print(json.load(open('$HOME/.cursor/mcp.json'))['mcpServers']['stitch']['headers']['X-Goog-Api-Key'])")
fi

mkdir -p "$OUT_DIR"

declare -A SCREENS=(
  ["47e9f3b6d9514813b4e89893ea622ca4"]="application-helper"
  ["2b0151e48d5f48fc9f3f1f10dcd85748"]="matched-opportunities"
  ["3be25b259f724bf88ff24e63654963b0"]="intake-onboarding"
  ["c17ffa12d3124cacb1e9dd222c101d47"]="ai-scanning-state"
)

for SID in "${!SCREENS[@]}"; do
  SLUG="${SCREENS[$SID]}"
  echo "Fetching $SLUG ($SID)…"
  RESP=$(curl -sS -X POST "$MCP_URL" \
    -H "Content-Type: application/json" \
    -H "X-Goog-Api-Key: $STITCH_API_KEY" \
    -d "{\"jsonrpc\":\"2.0\",\"id\":1,\"method\":\"tools/call\",\"params\":{\"name\":\"get_screen\",\"arguments\":{\"name\":\"projects/${PROJECT_ID}/screens/${SID}\",\"projectId\":\"${PROJECT_ID}\",\"screenId\":\"${SID}\"}}}")

  SS_URL=$(echo "$RESP" | python3 -c "import json,sys; d=json.load(sys.stdin); o=json.loads(d['result']['content'][0]['text']); print(o['screenshot']['downloadUrl'])")
  HTML_URL=$(echo "$RESP" | python3 -c "import json,sys; d=json.load(sys.stdin); o=json.loads(d['result']['content'][0]['text']); print(o['htmlCode']['downloadUrl'])")

  curl -sSL "$SS_URL" -o "$OUT_DIR/${SLUG}.png"
  curl -sSL "$HTML_URL" -o "$OUT_DIR/${SLUG}.html"
done

curl -sS -X POST "$MCP_URL" \
  -H "Content-Type: application/json" \
  -H "X-Goog-Api-Key: $STITCH_API_KEY" \
  -d "{\"jsonrpc\":\"2.0\",\"id\":1,\"method\":\"tools/call\",\"params\":{\"name\":\"get_project\",\"arguments\":{\"name\":\"projects/${PROJECT_ID}\"}}}" \
  | python3 -c "import json,sys; d=json.load(sys.stdin); o=json.loads(d['result']['content'][0]['text']); json.dump({'title':o.get('title'),'designTheme':o.get('designTheme')}, open('$OUT_DIR/design-theme.json','w'), indent=2)"

echo "Done → $OUT_DIR"
