#!/usr/bin/env bash
# Vercel single-root build script.
# Builds all three apps via turbo (without daemon/telemetry, which break in
# Vercel's read-only sandbox), then drops the landing page at the root.

set -euo pipefail

export TURBO_TELEMETRY_DISABLED=1
export TURBO_DAEMON=false
export CI=1

echo "▸ Node $(node --version) · pnpm $(pnpm --version)"
echo "▸ Building all three apps (turbo)..."
pnpm exec turbo run build --no-daemon

echo "▸ Copying landing page to dist/index.html"
mkdir -p dist
cp tools/landing/index.html dist/index.html

echo "▸ Done. Output:"
ls -la dist/
