# pareto-audit — AI-Powered 80/20 Workflow Audit

**Skill ID:** `pareto-audit` | **Version:** 1.0.0 | **Complexity:** 6.5 | **Reproducibility:** 0.81

Identifies the 20% of inputs driving 80% of outputs across any domain. Produces ranked action matrix, pruning recommendations, and unconventional reframes via the Pareto Cognitive Engine (PCE).

---

## Quick Start

```bash
# Deploy to Cloudflare
chmod +x deploy.sh
./deploy.sh

# Set API key
npx wrangler secret put ANTHROPIC_API_KEY
```

**Live URL:** `https://pareto.genesisconductor.io`

---

## API

```bash
POST https://pareto.genesisconductor.io/api/audit
Content-Type: application/json

{
  "domain": "startup",
  "goal": "Reach $10K MRR in 90 days",
  "activities": ["Cold outreach", "Discovery calls", "Feature building"],
  "outputs": "3 customers, $450 MRR"
}
```

### Input Schema

| Field | Type | Required | Description |
|---|---|---|---|
| `domain` | string | Yes | Context: startup, engineering, product, marketing, career, workflow |
| `goal` | string | Yes | Primary objective with measurable target |
| `activities` | array | Yes | Current activities (min 3, max 20) |
| `outputs` | string | No | Observed metrics/results |

### Output Schema

```json
{
  "summary": "Core insight in one sentence",
  "vital_20": [{ "activity", "contribution_pct", "insight" }],
  "trivial_80": [{ "activity", "contribution_pct", "prune_reason" }],
  "unconventional_reframes": [{ "conventional_assumption", "pareto_reframe" }],
  "action_matrix": [{ "rank", "action", "expected_impact", "effort" }],
  "recursive_note": "When to re-run audit"
}
```

---

## Examples

Validated outputs in `examples/` — ground truth corpus:

| File | Domain | Key Finding |
|---|---|---|
| [`startup-founder-2026-03.json`](examples/startup-founder-2026-03.json) | Startup | Inbound conversion + discovery = 75% of output |
| [`engineering-team-2026-03.json`](examples/engineering-team-2026-03.json) | Engineering | PR cycle time is the single throughput constraint |
| [`product-manager-2026-03.json`](examples/product-manager-2026-03.json) | Product | 40% churn from incomplete onboarding |

---

## Architecture

```
pareto-audit/
├── SKILL.md              # multi-skill-orchestrator-mcp registry definition
├── README.md             # This file
├── src/
│   └── worker.js         # Cloudflare Worker (frontend + API)
├── wrangler.jsonc        # Wrangler config
├── deploy.sh             # One-command deployment
└── examples/
    ├── startup-founder-2026-03.json
    ├── engineering-team-2026-03.json
    └── product-manager-2026-03.json
```

---

## Integration

| Surface | Method |
|---|---|
| `multi-skill-orchestrator-mcp` | Skill ID: `pareto_audit` |
| Genesis Conductor Coalition | Plugin gateway |
| QMCP | MCP tool surface |
| Direct HTTP | `POST /api/audit` |
| Slack | `@pareto-audit` mention |

---

## Rate Limits

| Tier | Price | Limit |
|---|---|---|
| Free | $0 | 3 audits/day/IP |
| Pro | $19/mo | Unlimited |
| Team | $149/mo | Team comparisons + export |

---

## PCE Reasoning Modes

1. **Reflective** — Examines assumptions in input
2. **Unconventional** — Inverts standard optimization logic
3. **Non-linear** — Identifies compounding effects
4. **Strategic** — Evaluates timing and sequencing
5. **Hedonistic** — Considers sustainable effort allocation

---

*Part of the Genesis Conductor thermodynamic AI orchestration ecosystem.*
