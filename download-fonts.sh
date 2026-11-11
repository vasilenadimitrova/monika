#!/usr/bin/env bash
# download-fonts.sh
# Self-hosts Google Fonts for Monica Healing site (WS-A — GDPR + performance).
# Run once before deploying to GitHub Pages:
#   chmod +x download-fonts.sh && ./download-fonts.sh
#
# Requirements: curl (macOS built-in)
# Output: assets/fonts/*.woff2 (16 files — Latin + Cyrillic for each weight/style)

set -euo pipefail

FONTS_DIR="$(dirname "$0")/assets/fonts"
UA="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
mkdir -p "$FONTS_DIR"

echo "Fetching Cormorant Garamond CSS…"
CG_CSS=$(curl -sA "$UA" \
  "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500&display=swap")

echo "Fetching Jost CSS…"
J_CSS=$(curl -sA "$UA" \
  "https://fonts.googleapis.com/css2?family=Jost:wght@300;400;500&display=swap")

# ── Helper: download woff2 files from a CSS block ──────────────────────────
# We parse each @font-face block to extract weight, style, subset, and src URL
# then download it with a deterministic filename.

download_fonts() {
  local css="$1"
  local prefix="$2"   # CG or J
  local current_subset="" current_style="normal" current_weight=""

  while IFS= read -r line; do
    if [[ "$line" =~ ^/\*\ ([a-z-]+)\ \*/ ]]; then
      current_subset="${BASH_REMATCH[1]}"
    elif [[ "$line" =~ font-weight:[[:space:]]*([0-9]+) ]]; then
      current_weight="${BASH_REMATCH[1]}"
    elif [[ "$line" =~ font-style:[[:space:]]*(normal|italic) ]]; then
      current_style="${BASH_REMATCH[1]}"
    elif [[ "$line" =~ url\(([^)]+\.woff2)\) ]]; then
      local url="${BASH_REMATCH[1]}"
      local italic_suffix=""
      [[ "$current_style" == "italic" ]] && italic_suffix="i"
      local subset_suffix=""
      [[ "$current_subset" != "latin" ]] && subset_suffix="-${current_subset}"
      local filename="${prefix}-${current_weight}${italic_suffix}${subset_suffix}.woff2"
      if [[ ! -f "$FONTS_DIR/$filename" ]]; then
        echo "  ↓ $filename"
        curl -sfA "$UA" -o "$FONTS_DIR/$filename" "$url"
      else
        echo "  ✓ $filename (cached)"
      fi
    fi
  done <<< "$css"
}

download_fonts "$CG_CSS" "CG"
download_fonts "$J_CSS"  "J"

echo ""
echo "Done. $(ls "$FONTS_DIR"/*.woff2 2>/dev/null | wc -l | tr -d ' ') woff2 files in $FONTS_DIR"
echo "Verify: no requests to fonts.googleapis.com or fonts.gstatic.com in DevTools Network."
