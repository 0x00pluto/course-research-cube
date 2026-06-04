#!/usr/bin/env bash
# Extract front 2500 + back 2500 lines for 软著 source doc
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
OUT="$ROOT/docs/soft-copyright"
mkdir -p "$OUT"

FRONT_FILES=(
  "supabase/migrations/20260601113000_initial_schema.sql"
  "supabase/migrations/20260601120000_enhancements.sql"
  "supabase/migrations/20260601130000_prd_completion.sql"
  "supabase/migrations/20260601140000_platform_ops.sql"
  "lib/db.ts"
  "lib/types.ts"
  "lib/auth.ts"
  "lib/services.ts"
  "lib/courses-workspace.ts"
  "lib/knowledge-recommend.ts"
  "lib/knowledge-gap.ts"
  "lib/feedback-workspace.ts"
  "lib/reports-workspace.ts"
  "lib/framework.ts"
  "lib/design-templates.ts"
  "lib/iteration-actions.ts"
  "lib/platform-settings.ts"
  "lib/admin-audit.ts"
  "lib/output-sources.ts"
  "lib/nav.ts"
  "app/actions.ts"
  "app/api/courses/[id]/download/route.ts"
  "app/api/knowledge/recommend/route.ts"
  "app/api/external/llm/route.ts"
  "app/api/external/market/route.ts"
  "app/api/external/payment/route.ts"
  "proxy.ts"
)

BACK_FILES=(
  "app/(console)/layout.tsx"
  "app/(console)/dashboard/page.tsx"
  "app/(console)/courses/design/page.tsx"
  "app/(console)/courses/my/page.tsx"
  "app/(console)/courses/versions/page.tsx"
  "app/(console)/knowledge/search/page.tsx"
  "app/(console)/knowledge/new/page.tsx"
  "app/(console)/knowledge/list/page.tsx"
  "app/(console)/feedback/survey/page.tsx"
  "app/(console)/feedback/collect/page.tsx"
  "app/(console)/feedback/list/page.tsx"
  "app/(console)/feedback/analysis/page.tsx"
  "app/(console)/analytics/page.tsx"
  "app/(console)/reports/analysis/page.tsx"
  "app/(console)/reports/share/page.tsx"
  "app/(console)/opc/page.tsx"
  "app/(console)/admin/page.tsx"
  "app/(console)/admin/courses/[id]/page.tsx"
  "components/course-design-wizard.tsx"
  "components/course-framework-editor.tsx"
  "components/course-my-list.tsx"
  "components/dashboard-bento.tsx"
  "components/knowledge-item-list.tsx"
  "components/report-generate-form.tsx"
  "components/report-list.tsx"
  "components/survey-form.tsx"
  "components/opc-billing-confirm.tsx"
  "components/feishu-shell.tsx"
  "components/login-form.tsx"
  "app/share/[token]/page.tsx"
  "app/survey/[token]/page.tsx"
  "app/login/page.tsx"
  "scripts/db-migrate.mjs"
)

concat_files() {
  local -a files=("$@")
  for f in "${files[@]}"; do
    local path="$ROOT/$f"
    if [[ -f "$path" ]]; then
      printf '\n### %s\n\n' "$f"
      cat "$path"
      printf '\n'
    fi
  done
}

sanitize() {
  sed -E \
    -e '/[Mm]ock/d' \
    -e '/[Ss]eed/d' \
    -e '/localhost/d' \
    -e '/[Dd]emo/d' \
    -e '/api\/dev\//d' \
    -e '/lib\/mock\//d' \
    -e '/external-mocks/d'
}

set +o pipefail
concat_files "${FRONT_FILES[@]}" | sanitize | head -n 2500 > "$OUT/source-front-2500.txt"
concat_files "${BACK_FILES[@]}" | sanitize | tail -n 2500 > "$OUT/source-back-2500.txt"
set -o pipefail

wc -l "$OUT/source-front-2500.txt" "$OUT/source-back-2500.txt"
echo "Total project lines:"
find "$ROOT" \( -name "*.ts" -o -name "*.tsx" -o -name "*.sql" -o -name "*.mjs" \) \
  ! -path "*/node_modules/*" ! -path "*/.next/*" -exec cat {} + 2>/dev/null | wc -l
