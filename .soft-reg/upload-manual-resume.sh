#!/usr/bin/env bash
# Resume manual upload from chapter N (1-based), e.g. ./upload-manual-resume.sh 10
set -euo pipefail
exec "$(dirname "$0")/upload-manual.sh" "${1:-10}"
