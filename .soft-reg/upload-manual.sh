#!/usr/bin/env bash
set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
# shellcheck source=doc-tokens.env
source "$SCRIPT_DIR/doc-tokens.env"
DOC="${DOC_MANUAL:?Set DOC_MANUAL in doc-tokens.env}"
ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
MANUAL_DIR="$ROOT/docs/soft-copyright/manual"
cd "$ROOT/docs/soft-copyright/screenshots"

append_md() { lark-cli docs +update --api-version v2 --doc "$DOC" --command append --doc-format markdown --as user --content "$1" >/dev/null; }
insert_img() { lark-cli docs +media-insert --doc "$DOC" --file "./$1" --as user --align center 2>/dev/null; echo "image: $1"; }

START="${1:-1}"

# chNN-slug.png pairs (order must match manual/ch*.md)
CHAPTER_FILES=(
  "ch01-login.md:01-login.png"
  "ch02-dashboard.md:02-dashboard.png"
  "ch03-courses-design.md:03-courses-design.png"
  "ch04-courses-my.md:04-courses-my.png"
  "ch05-courses-versions.md:05-courses-versions.png"
  "ch06-knowledge-search.md:06-knowledge-search.png"
  "ch07-knowledge-new.md:07-knowledge-new.png"
  "ch08-knowledge-list.md:08-knowledge-list.png"
  "ch09-feedback-survey.md:09-feedback-survey.png"
  "ch10-feedback-collect.md:10-feedback-collect.png"
  "ch11-feedback-list.md:11-feedback-list.png"
  "ch12-feedback-analysis.md:12-feedback-analysis.png"
  "ch13-analytics.md:13-analytics.png"
  "ch14-reports-analysis.md:14-reports-analysis.png"
  "ch15-reports-share.md:15-reports-share.png"
  "ch16-opc.md:16-opc.png"
  "ch17-admin.md:17-admin.png"
  "ch18-admin-course.md:18-admin-course.png"
  "ch19-survey-public.md:19-survey-public.png"
  "ch20-share-public.md:20-share-public.png"
)

if (( START <= 1 )); then
  lark-cli docs +update --api-version v2 --doc "$DOC" --command overwrite --doc-format markdown --as user --content $'# 课研魔方课程设计与质量分析平台 V1.0 — 用户操作手册\n\n> 适用对象：内部员工、培训负责人、OPC 讲师、平台管理员 | 软件版本：V1.0 | 建议使用 Chrome、Edge 等主流浏览器最新版本\n\n---\n\n' >/dev/null
  echo "header overwritten"
fi

idx=0
for pair in "${CHAPTER_FILES[@]}"; do
  ((idx++)) || true
  if (( idx < START )); then continue; fi
  IFS=':' read -r mdfile imgfile <<< "$pair"
  body_file="$MANUAL_DIR/$mdfile"
  [[ -f "$body_file" ]] || { echo "missing: $body_file"; exit 1; }
  [[ -f "./$imgfile" ]] || { echo "missing screenshot: $imgfile"; exit 1; }

  # Text before "**界面截图：**", then image, then separator
  text_part=$(sed '/^\*\*界面截图：\*\*/q' "$body_file" | sed '$d')
  append_md "${text_part}"$'\n\n'
  insert_img "$imgfile"
  append_md $'\n\n---\n\n'
  title=$(grep '^## ' "$body_file" | head -1 | sed 's/^## //')
  echo "uploaded chapter $idx: $title"
  sleep 0.5
done

echo "Manual upload complete."
