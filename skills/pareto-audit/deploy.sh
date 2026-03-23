#!/usr/bin/env bash
#
# pareto-audit deployment script
# Deploys to pareto.genesisconductor.io
#
# Prerequisites:
#   - npx wrangler authenticated
#   - ANTHROPIC_API_KEY set as wrangler secret
#   - KV namespace created and ID updated in wrangler.jsonc
#
# Usage:
#   chmod +x deploy.sh
#   ./deploy.sh

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo "==> pareto-audit deployment"
echo "    Target: pareto.genesisconductor.io"
echo ""

# Check for placeholder values
if grep -q "REPLACE_" wrangler.jsonc; then
  echo "ERROR: Found REPLACE_* placeholders in wrangler.jsonc"
  echo "       Update the following before deploying:"
  grep -o "REPLACE_[A-Z_]*" wrangler.jsonc | sort -u | sed 's/^/         - /'
  exit 1
fi

# Check wrangler authentication
if ! npx wrangler whoami &>/dev/null; then
  echo "ERROR: Not authenticated with Cloudflare."
  echo "       Run: npx wrangler login"
  exit 1
fi

# Deploy
echo "==> Deploying worker..."
npx wrangler deploy

echo ""
echo "==> Deployment complete!"
echo "    Live at: https://pareto.genesisconductor.io"
echo ""
echo "    To set the API key secret:"
echo "    npx wrangler secret put ANTHROPIC_API_KEY"
