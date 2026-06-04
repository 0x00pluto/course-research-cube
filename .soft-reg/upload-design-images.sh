#!/usr/bin/env bash
set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
# shellcheck source=doc-tokens.env
source "$SCRIPT_DIR/doc-tokens.env"
DOC="${DOC_DESIGN:?Set DOC_DESIGN in doc-tokens.env}"
ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$ROOT/docs/soft-copyright/screenshots"

pairs=(
  "7.1 系统登录与工作台|01-login.png|02-dashboard.png"
  "7.2 课程设计中心|03-courses-design.png|04-courses-my.png"
  "7.3 知识库与反馈分析|06-knowledge-search.png|12-feedback-analysis.png"
  "7.4 报告、OPC 与管理|14-reports-analysis.png|16-opc.png|17-admin.png"
)

for p in "${pairs[@]}"; do
  IFS='|' read -r cap f1 f2 f3 <<< "$p"
  lark-cli docs +update --api-version v2 --doc "$DOC" --command append --doc-format markdown --as user \
    --content $'\n\n### '"$cap"$'\n\n' >/dev/null
  for f in "$f1" "$f2" "$f3"; do
    [[ -n "$f" && -f "./$f" ]] || continue
    lark-cli docs +media-insert --doc "$DOC" --file "./$f" --as user --align center --caption "$cap" >/dev/null
    echo "inserted $f"
  done
done

echo "Design spec images inserted."
