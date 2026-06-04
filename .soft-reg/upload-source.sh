#!/usr/bin/env bash
set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
# shellcheck source=doc-tokens.env
source "$SCRIPT_DIR/doc-tokens.env"
DOC="${DOC_SOURCE:?Set DOC_SOURCE in doc-tokens.env}"
ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
OUT="$ROOT/docs/soft-copyright"
CHUNK=300
PROGRESS="$SCRIPT_DIR/source-doc-progress.json"

split_and_append() {
  local file="$1"
  local prefix="$2"
  local start_chunk="${3:-0}"
  local chunk_idx=0
  split -l "$CHUNK" "$file" "$SCRIPT_DIR/chunk_${prefix}_"
  for f in "$SCRIPT_DIR"/chunk_${prefix}_*; do
    [[ -f "$f" ]] || continue
    if (( chunk_idx < start_chunk )); then
      rm -f "$f"
      ((chunk_idx++)) || true
      continue
    fi
    lark-cli docs +update --api-version v2 --doc "$DOC" --command append --doc-format markdown --as user \
      --content "$(cat "$f")" >/dev/null
    echo "appended $(wc -l < "$f" | tr -d ' ') lines chunk ${prefix}_${chunk_idx}"
    echo "{\"section\":\"$prefix\",\"chunk\":$chunk_idx}" > "$PROGRESS"
    rm -f "$f"
    ((chunk_idx++)) || true
    sleep 0.3
  done
}

PART="${1:-all}"
START_FRONT="${2:-0}"
START_BACK="${3:-0}"

if [[ "$PART" == "all" || "$PART" == "front" ]]; then
  if [[ "$PART" == "all" && "$START_FRONT" == "0" ]]; then
    lark-cli docs +update --api-version v2 --doc "$DOC" --command overwrite --doc-format markdown --as user \
      --content $'# 课研魔方课程设计与质量分析平台 V1.0 — 源代码文档\n\n编程语言：TypeScript / JavaScript / SQL　版本：V1.0\n\n---\n\n## 第一部分：源程序前 2500 行\n\n' >/dev/null
    echo "header written"
  fi
  split_and_append "$OUT/source-front-2500.txt" front "$START_FRONT"
fi

if [[ "$PART" == "all" || "$PART" == "back" ]]; then
  if [[ "$PART" == "all" && "$START_BACK" == "0" ]]; then
    lark-cli docs +update --api-version v2 --doc "$DOC" --command append --doc-format markdown --as user \
      --content $'\n\n---\n\n## 第二部分：源程序后 2500 行\n\n' >/dev/null
    echo "part 2 header written"
  fi
  split_and_append "$OUT/source-back-2500.txt" back "$START_BACK"
fi

echo "Source doc upload complete."
