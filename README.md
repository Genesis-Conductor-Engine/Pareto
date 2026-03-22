# Genesis Conductor — Optimization Skills Repository

**Org:** `Genesis-Conductor-Engine` · **Maintainer:** Igor Holt (PI, Kovach Enterprises)

This repository is the canonical source for all **Genesis Conductor optimization skills** — self-contained AI inference modules that enforce thermodynamic efficiency principles across workflow, engineering, and strategic domains. Each skill is a deployable unit with a defined schema, Cloudflare Worker runtime, and validated example output corpus.

---

## Skill Registry

| Skill | Version | Domain | Complexity | Deployment | Status |
|---|---|---|---|---|---|
| [`pareto-audit`](./skills/pareto-audit/) | 1.0.0 | Business / Workflow / Engineering | 6.5 | `pareto.genesisconductor.io` | ✅ Production |

> Machine-readable registry: [`registry/index.jsonl`](./registry/index.jsonl)

---

## Repository Structure

```
Pareto/
├── CODEOWNERS
├── README.md                         # This file — org showcase
├── registry/
│   └── index.jsonl                   # Skill registry (JSONL, one record per skill)
├── skills/
│   └── <skill-name>/
│       ├── SKILL.md                  # Canonical skill definition (multi-skill-orchestrator-mcp compatible)
│       ├── src/
│       │   └── worker.js             # Cloudflare Worker (frontend + API proxy)
│       ├── wrangler.jsonc            # Wrangler deployment config
│       ├── deploy.sh                 # One-command deploy
│       └── examples/                 # Validated audit results (ground truth corpus)
│           └── <domain>-<date>.json
└── docs/
    └── adding-a-skill.md             # Contributor spec
```

---

## Skill Architecture

All skills conform to the **Pareto Cognitive Engine (PCE)** interface contract:

```
Input (HTTP POST /api/audit)
  └── { domain, goal, activities[], outputs? }
        ↓
  Cloudflare Worker
        ↓
  Anthropic API (claude-sonnet-4-20250514) + PCE system prompt
        ↓
Output (JSON)
  └── { summary, vital_20[], trivial_80[], unconventional_reframes[], action_matrix[], recursive_note }
```

Rate control: 3 free audits/day/IP via Cloudflare KV. Stripe entitlement gates Pro ($19/mo) and Team ($149/mo) tiers.

---

## Adding a Skill

See [`docs/adding-a-skill.md`](./docs/adding-a-skill.md) for the full contributor spec.

Minimum acceptance criteria:
- `SKILL.md` passes `multi-skill-orchestrator-mcp` registry validation
- ≥ 3 example outputs covering distinct domains
- Worker deploys clean against `pareto.genesisconductor.io` zone or a new subdomain
- Entry added to `registry/index.jsonl`

---

## Integration

| Surface | Method |
|---|---|
| `multi-skill-orchestrator-mcp` | `npm i -g multi-skill-orchestrator-mcp` → skill ID matches `registry/index.jsonl` |
| Genesis Conductor Coalition | Plugin-compatible via `coalition-gateway` entitlement |
| QMCP (`mcp.genesisconductor.io`) | MCP tool surface, skill IDs routed via Genesis Conductor agent layer |
| Direct HTTP | `POST https://<skill-subdomain>.genesisconductor.io/api/audit` |

---

## Deployment Prerequisites

- `npx wrangler` authenticated to Cloudflare account `04c59c95ce8d0a0be98099b7f7e39d18`
- `ANTHROPIC_API_KEY` set as Wrangler secret
- DNS `CNAME` for skill subdomain → worker route (managed under `genesisconductor.io` zone)

---

*Part of the Genesis Conductor thermodynamic AI orchestration ecosystem.*  
*ORCID: 0009-0008-8389-1297 · Kovach Enterprises · Pasadena, MD*
