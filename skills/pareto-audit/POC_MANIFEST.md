# Pareto Audit PoC — Manifest

## Architecture

```
pareto-audit-poc/
├── POC_MANIFEST.md                          ← this file
├── skill/
│   └── SKILL.md                             ← Deployable pareto-audit skill (registry-compatible)
├── system-prompt/
│   └── PCE_SYSTEM_PROMPT.md                 ← Pareto Cognitive Engine system prompt
├── tests/
│   └── evals.json                           ← 3 test cases with assertions
└── geodesic-test/
    ├── GEODESIC_DELINEATION_TEST.md         ← Test protocol: measures geodesic skill effect
    └── measure_delineation.py               ← Quantitative measurement script
```

## What This Proves

| Claim | Artifact | Verification Method |
|---|---|---|
| PCE reasoning modes produce structured Pareto output | `skill/SKILL.md` + `tests/evals.json` | Run 3 evals, check assertion pass rates |
| Geodesic skill measurably compresses output | `geodesic-test/` | Compare R_art, TTFS, H, M across 3 run configurations |
| Skill is registry-compatible | `skill/SKILL.md` frontmatter | Validates against skill-creator schema |
| System prompt + skill are separable layers | Both artifacts | Prompt encodes *how to think*; skill encodes *what to do* |

## Deployment Paths

| Target | Method |
|---|---|
| Claude Code / Cowork | Install `skill/` directory as skill; apply PCE as system prompt |
| Claude.ai | Paste PCE into custom instructions; run skill protocol manually |
| multi-skill-orchestrator-mcp | Register `pareto_audit` in skill registry YAML |
| npm package | Bundle skill + measurement tools as `@genesis-conductor/pareto-audit` |

## Test Execution

### Quick (Inline — No Subagents)
Read `skill/SKILL.md`, then execute eval id=1 prompt. Measure output with `measure_delineation.py`.

### Full (Subagent — skill-creator Pipeline)
```bash
# From skill-creator workspace:
# 1. Spawn with-skill and without-skill runs for all 3 evals
# 2. Grade with assertions from evals.json
# 3. Run geodesic delineation comparison (3 configurations)
# 4. Aggregate into benchmark.json
# 5. Launch eval viewer
```

## Genesis Conductor Integration Points

The PCE system prompt maps directly to GC infrastructure:

- **Reflective mode** → Diamond Vault Edge (SURPLUS_MINING reflection ops)
- **Non-linear branching** → S-ToT Phase 1 (Quantum Branching)
- **Vital 20% execution** → Diamond Vault Reflex ops (1.1ms latency path)
- **80% noise filtering** → Swarm Dispatch consensus (multi-agent stress test)
- **Recursive optimization** → η_thermo improvement loop (re-apply post-prune)
