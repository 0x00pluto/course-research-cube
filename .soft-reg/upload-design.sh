#!/usr/bin/env bash
set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
# shellcheck source=doc-tokens.env
source "$SCRIPT_DIR/doc-tokens.env"
DOC="${DOC_DESIGN:?Set DOC_DESIGN in doc-tokens.env}"
ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

lark-cli docs +update --api-version v2 --doc "$DOC" \
  --command overwrite --doc-format markdown --as user \
  --content "$(cat "$ROOT/docs/soft-copyright/design-spec.md")" >/dev/null
echo "design-spec text uploaded"
bash "$SCRIPT_DIR/upload-design-images.sh"
