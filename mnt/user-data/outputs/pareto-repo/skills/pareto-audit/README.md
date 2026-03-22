# pareto-audit — AI-Powered 80/20 Workflow Audit

**Skill ID:** `pareto-audit` · **Version:** 1.0.0 · **Complexity:** 6.5 · **Reproducibility:** 0.81

Identifies the 20% of inputs driving 80% of outputs across any domain. Produces ranked action matrix, pruning recommendations, and unconventional reframes via the Pareto Cognitive Engine (PCE).

---

## Deployment

**Live URL:** `https://pareto.genesisconductor.io`  
**Runtime:** Cloudflare Worker (single file, serves HTML + API proxy)  
**Auth:** Anthropic API key (`ANTHROPIC_API_KEY` Wrangler secret)  
**Rate limit:** 3 free audits/day/IP via Cloudflare KV

```bash
chmod +x deploy.sh
./deploy.sh
```

---

## API

```bash
POST https://pareto.genesisconductor.io/api/audit
Content-Type: application/json

{
  "domain": "startup",
  "goal": "Reach $10K MRR in 90 days",
  "activities": ["Cold outreach", "Discovery calls", "Feature building"],
  "outputs": "Optional observed metrics"
}
```

Response: JSON matching the PCE output schema (see `SKILL.md`).

---

## Example Results

Validated outputs in `examples/` — ground truth corpus for regression testing and showcasing:

| File | Domain | Key Finding |
|---|---|---|
| [`startup-founder-2026-03.json`](examples/startup-founder-2026-03.json) | Startup | Inbound conversion + discovery calls = 75% of output. Pause cold outreach. |
| [`engineering-team-2026-03.json`](examples/engineering-team-2026-03.json) | Engineering | PR cycle time (3.2 days) is the single throughput constraint. |
| [`product-manager-2026-03.json`](examples/product-manager-2026-03.json) | Product | 40% churn attributable to incomplete onboarding — one fixable step. |

---

## Files

```
pareto-audit/
├── SKILL.md              # multi-skill-orchestrator-mcp registry definition
├── README.md             # This file
├── src/
│   └── worker.js         # Cloudflare Worker (frontend + API)
├── wrangler.jsonc         # Wrangler config
├── deploy.sh              # One-command deployment
└── examples/
    ├── startup-founder-2026-03.json
    ├── engineering-team-2026-03.json
    └── product-manager-2026-03.json
```

---

## Revenue

| Tier | Price | Limit |
|---|---|---|
| Free | $0 | 3 audits/day/IP |
| Pro | $19/mo | Unlimited |
| Team | $149/mo | Team comparisons + export |

Post-deploy: replace `REPLACE_STRIPE_PRO_LINK` and `REPLACE_STRIPE_TEAM_LINK` in `src/worker.js`, then redeploy.
