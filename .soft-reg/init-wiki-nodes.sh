#!/usr/bin/env bash
set -euo pipefail
PARENT="SNJpwvL8Ui4q00krjuVcGhbjnJd"
ENV_FILE="$(dirname "$0")/doc-tokens.env"

create_node() {
  local title="$1"
  lark-cli wiki +node-create --parent-node-token "$PARENT" --title "$title" --as user
}

echo "Creating wiki child nodes under $PARENT ..."

SRC_JSON=$(create_node "课研魔方 V1.0 — 源代码文档")
MAN_JSON=$(create_node "课研魔方 V1.0 — 用户操作手册")
INFO_JSON=$(create_node "课研魔方 V1.0 — 信息采集表")
DES_JSON=$(create_node "课研魔方 V1.0 — 设计说明书")

parse() {
  python3 -c "import json,sys; d=json.load(sys.stdin); x=d.get('data',d); print(x.get('obj_token',''), x.get('node_token',''))" <<<"$1"
}

read -r DOC_SOURCE WIKI_SOURCE <<< "$(parse "$SRC_JSON")"
read -r DOC_MANUAL WIKI_MANUAL <<< "$(parse "$MAN_JSON")"
read -r DOC_INFO WIKI_INFO <<< "$(parse "$INFO_JSON")"
read -r DOC_DESIGN WIKI_DESIGN <<< "$(parse "$DES_JSON")"

cat > "$ENV_FILE" <<EOF
# 课研魔方 V1.0 软著 — 飞书文档 token
PARENT_WIKI_NODE="SNJpwvL8Ui4q00krjuVcGhbjnJd"
PARENT_INDEX_DOC="Po58dbi0vozNgrxypQLcY5THn5b"
WIKI_SPACE_ID="7637315931366034618"

DOC_SOURCE="$DOC_SOURCE"
DOC_MANUAL="$DOC_MANUAL"
DOC_INFO="$DOC_INFO"
DOC_DESIGN="$DOC_DESIGN"
WIKI_SOURCE="$WIKI_SOURCE"
WIKI_MANUAL="$WIKI_MANUAL"
WIKI_INFO="$WIKI_INFO"
WIKI_DESIGN="$WIKI_DESIGN"
EOF

echo "doc-tokens.env updated:"
cat "$ENV_FILE"
