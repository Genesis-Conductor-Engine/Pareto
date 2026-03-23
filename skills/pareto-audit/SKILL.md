---
name: pareto-audit
version: 1.0.0
description: >
  Applies 80/20 Pareto analysis to any domain. Identifies the vital 20% of inputs
  driving 80% of outputs. Produces ranked action matrix, pruning recommendations,
  and unconventional reframes via the Pareto Cognitive Engine (PCE). Reasoning modes:
  Reflective, Unconventional, Non-linear, Strategic, Hedonistic.
complexity: 6.5
reproducibility: 0.81
tokens_estimate: 3200
dependencies: []
revenue_model: "free:3/day/IP | pro:$19/mo | team:$149/mo"
deployment: "https://pareto.genesisconductor.io"
---

## Trigger Patterns

Activation phrases for `multi-skill-orchestrator-mcp`:

- "run a pareto audit on..."
- "apply 80/20 analysis to..."
- "identify the vital 20%..."
- "what should I prune from..."
- "pareto my workflow"
- "find the leverage points in..."
- "what's the 80/20 of..."

---

## Input Schema

```yaml
domain:
  type: string
  required: true
  description: Business domain context (startup, engineering, product, marketing, career, workflow)

goal:
  type: string
  required: true
  description: Primary objective with measurable target and timeframe

activities:
  type: array[string]
  required: true
  min_items: 3
  max_items: 20
  description: Current activities consuming time/resources

outputs:
  type: string
  required: false
  description: Observed metrics, results, or baseline data (improves analysis quality)
```

---

## Execution Protocol

```
State 1: INPUT VALIDATION
  └─ Validate required fields (domain, goal, activities)
  └─ Normalize activity list (deduplicate, standardize format)
  └─ Extract implicit metrics from outputs field
        ↓
State 2: CONTRIBUTION MAPPING
  └─ For each activity, estimate contribution to goal (0-100%)
  └─ Apply Pareto heuristics: identify natural 80/20 clustering
  └─ Flag activities with <5% contribution as trivial
        ↓
State 3: VITAL 20% EXTRACTION
  └─ Select top contributors summing to ~80% output
  └─ Generate insight explaining WHY each is vital
  └─ Identify hidden dependencies between vital activities
        ↓
State 4: TRIVIAL 80% ANALYSIS
  └─ List remaining activities
  └─ Generate prune_reason for each (specific, actionable)
  └─ Distinguish between prune (stop entirely) and defer (pause temporarily)
        ↓
State 5: UNCONVENTIONAL REFRAMES
  └─ Identify 3 conventional assumptions in the input
  └─ Generate Pareto-inverted perspectives
  └─ Apply reasoning modes: Reflective, Unconventional, Non-linear
        ↓
State 6: ACTION MATRIX GENERATION
  └─ Rank actions by (expected_impact × 1/effort)
  └─ Include exactly 5 actions
  └─ First action must be achievable within 24 hours
        ↓
State 7: RECURSIVE NOTE
  └─ Identify when to re-run audit (milestone or time-based)
  └─ Preview what the next Pareto layer will likely reveal
```

---

## Output Schema (JSON)

```json
{
  "summary": "string — One sentence capturing the core insight",

  "vital_20": [
    {
      "activity": "string",
      "contribution_pct": "number (0-100)",
      "insight": "string — Why this activity matters disproportionately"
    }
  ],

  "trivial_80": [
    {
      "activity": "string",
      "contribution_pct": "number (0-100)",
      "prune_reason": "string — Specific, actionable reason to stop or defer"
    }
  ],

  "unconventional_reframes": [
    {
      "conventional_assumption": "string",
      "pareto_reframe": "string — Inverted perspective applying 80/20 logic"
    }
  ],

  "action_matrix": [
    {
      "rank": "number (1-5)",
      "action": "string — Specific, actionable step",
      "expected_impact": "enum: high | medium | low",
      "effort": "enum: high | medium | low"
    }
  ],

  "recursive_note": "string — When and why to re-run this audit"
}
```

---

## Integration Points

| Surface | Method | Identifier |
|---|---|---|
| `multi-skill-orchestrator-mcp` | npm package | `pareto_audit` |
| Genesis Conductor Coalition | Plugin gateway | `coalition-gateway` entitlement |
| QMCP | MCP tool surface | `mcp.genesisconductor.io` |
| Direct HTTP | REST API | `POST /api/audit` |
| Slack Integration | Bot mention | `@pareto-audit` |

---

## PCE Reasoning Modes

The Pareto Cognitive Engine applies five reasoning modes during analysis:

1. **Reflective** — Examines assumptions embedded in the input
2. **Unconventional** — Inverts standard optimization logic
3. **Non-linear** — Identifies compounding effects and second-order consequences
4. **Strategic** — Evaluates timing and sequencing of actions
5. **Hedonistic** — Considers sustainable effort allocation and energy management

---

## Rate Limits

| Tier | Audits | Features |
|---|---|---|
| Free | 3/day/IP | Standard analysis |
| Pro ($19/mo) | Unlimited | + Export, history, saved templates |
| Team ($149/mo) | Unlimited | + Team comparisons, aggregated insights |

---

*Part of the Genesis Conductor thermodynamic AI orchestration ecosystem.*
