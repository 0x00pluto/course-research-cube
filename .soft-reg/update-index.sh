#!/usr/bin/env bash
set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
# shellcheck source=doc-tokens.env
source "$SCRIPT_DIR/doc-tokens.env"
DOC="${PARENT_INDEX_DOC:?}"

CONTENT=$'# 课研魔方 V1.0 — 软著材料索引\n\n> 生成日期：2026-06-01 | 著作权人：互远\n\n| 材料名称 | 飞书 Wiki | doc token | 截图数 | 本地路径 | 状态 |\n|----------|-----------|-----------|--------|----------|------|\n| 源代码文档 | https://fcnegd976pzo.feishu.cn/wiki/'"$WIKI_SOURCE"' | '"$DOC_SOURCE"' | 0 | docs/soft-copyright/source-*.txt | 已上传 |\n| 用户操作手册 | https://fcnegd976pzo.feishu.cn/wiki/'"$WIKI_MANUAL"' | '"$DOC_MANUAL"' | 20 | docs/soft-copyright/screenshots/ | 已上传 |\n| 信息采集表 | https://fcnegd976pzo.feishu.cn/wiki/'"$WIKI_INFO"' | '"$DOC_INFO"' | 0 | docs/soft-copyright/info-form.md | 已上传 |\n| 设计说明书 | https://fcnegd976pzo.feishu.cn/wiki/'"$WIKI_DESIGN"' | '"$DOC_DESIGN"' | 7 | docs/soft-copyright/design-spec.md | 已上传 |\n'

lark-cli docs +update --api-version v2 --doc "$DOC" --command append --doc-format markdown --as user --content "$CONTENT" >/dev/null
echo "Parent index table appended to $DOC"
