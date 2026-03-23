# Adding a Skill — Contributor Spec

All skills in this repository must conform to the Genesis Conductor optimization skill contract. This document defines the acceptance criteria and submission process.

---

## Acceptance Criteria

A skill PR will not be merged unless all of the following pass:

| Gate | Requirement |
|---|---|
| `SKILL.md` schema | Valid `multi-skill-orchestrator-mcp` registry definition (see schema below) |
| Examples | ≥ 3 ground truth JSON outputs covering distinct input domains |
| Worker | Deploys clean against `genesisconductor.io` zone or a new subdomain |
| Registry entry | One JSONL line added to `registry/index.jsonl` |
| CODEOWNERS | Skill path added with maintainer GitHub handle |
| No placeholder values | No `REPLACE_*` tokens in committed files (use `.env.example` pattern) |

---

## Directory Structure

```
skills/
└── <skill-id>/            # kebab-case, matches SKILL.md `name` field
    ├── SKILL.md            # Registry definition (required)
    ├── README.md           # Skill-level docs (required)
    ├── src/
    │   └── worker.js       # Cloudflare Worker (required)
    ├── wrangler.jsonc       # Wrangler config (required)
    ├── deploy.sh            # Deployment script (required)
    └── examples/           # Ground truth outputs (≥ 3 files required)
        └── <domain>-<YYYY-MM>.json
```

---

## SKILL.md Schema

```yaml
---
name: <skill-id>              # kebab-case, unique in registry
version: <semver>
description: >
  One paragraph. Include: domain, primary output, reasoning modes, integration points.
complexity: <float 1-10>      # Estimated reasoning complexity
reproducibility: <float 0-1>  # Empirically validated consistency score
tokens_estimate: <int>        # Expected token budget per execution
dependencies: []              # Other skill IDs this skill invokes
revenue_model: "<tiers>"
deployment: "<url>"
---
```

Required sections in body:
- `## Trigger Patterns` — activation phrases for multi-skill-orchestrator
- `## Input Schema` — YAML field definitions
- `## Execution Protocol` — state machine (State 1 → State N)
- `## Output Schema (JSON)` — typed JSON schema
- `## Integration Points` — table of connected surfaces

---

## Example Output Schema

Each file in `examples/` must include:

```json
{
  "_meta": {
    "skill": "<skill-id>",
    "version": "<semver>",
    "domain": "<domain>",
    "generated": "<YYYY-MM-DD>",
    "model": "claude-sonnet-4-20250514",
    "note": "Ground truth example. Input preserved for reproducibility."
  },
  "_input": { ... },
  ... (skill output fields)
}
```

The `_input` field is mandatory — it makes examples reproducible and testable.

---

## Registry Entry

Add one JSONL line to `registry/index.jsonl`:

```jsonl
{"skill_id":"<id>","name":"<Name>","version":"<semver>","description":"...","domain":["domain1"],"complexity":<float>,"reproducibility":<float>,"tokens_estimate":<int>,"dependencies":[],"deployment":{"runtime":"cloudflare-worker","url":"https://<subdomain>.genesisconductor.io","route":"<subdomain>.genesisconductor.io/*","zone":"genesisconductor.io"},"revenue_model":{...},"integration":{"multi_skill_orchestrator":"<skill_id>","coalition_gateway":true,"qmcp":true},"status":"production","added":"<YYYY-MM-DD>","maintainer":"<github-handle>","examples":["skills/<id>/examples/<file>.json"]}
```

---

## PR Checklist

```
[ ] SKILL.md present and schema-valid
[ ] src/worker.js deploys against genesisconductor.io zone
[ ] wrangler.jsonc has no REPLACE_* placeholders
[ ] deploy.sh is executable and idempotent
[ ] examples/ contains ≥ 3 JSON files with _meta and _input fields
[ ] registry/index.jsonl updated with new JSONL line
[ ] CODEOWNERS updated with skill path and maintainer handle
[ ] skill-level README.md present
```

---

## Naming Conventions

| Field | Convention | Example |
|---|---|---|
| `skill_id` | kebab-case | `pareto-audit` |
| `multi_skill_orchestrator` key | snake_case | `pareto_audit` |
| Worker name (`wrangler.jsonc`) | kebab-case with suffix | `pareto-engine` |
| Subdomain | matches skill prefix | `pareto.genesisconductor.io` |
| Example filenames | `<domain>-<YYYY-MM>.json` | `startup-founder-2026-03.json` |

---

*Questions: open an issue or ping @igor-holt.*
