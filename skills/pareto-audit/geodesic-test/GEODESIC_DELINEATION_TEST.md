# Geodesic Delineation Test Protocol

## Purpose

Measures the structural effect of the `geodesic-generation` skill on `pareto-audit` output.
The hypothesis: geodesic suppresses conversational overhead, producing a measurable token
compression and structural shift in the output artifact.

## Test Design

### Independent Variable
Presence/absence of `geodesic-generation` skill during `pareto-audit` execution.

### Dependent Variables

| Metric | ID | Measurement |
|---|---|---|
| Preamble tokens | `T_pre` | Count tokens before first structural element (table/header) |
| Postamble tokens | `T_post` | Count tokens after last structural element |
| Artifact tokens | `T_art` | Tokens within structured deliverables |
| Total tokens | `T_total` | Full response token count |
| Artifact ratio | `R_art` | `T_art / T_total` |
| Time-to-first-structure | `TTFS` | Token position of first markdown table or `##` header |
| Hedge count | `H` | Instances of: "might", "could try", "perhaps", "consider", "it's worth noting" |
| Meta-commentary count | `M` | Instances of: "I'll help", "Let me", "Here's my approach", "Based on" |

### Protocol

**Run A — With Geodesic + Pareto Audit:**
```
System: [PCE_SYSTEM_PROMPT.md] + [geodesic-generation SKILL.md]
Skill: pareto-audit
Prompt: [eval id=1 from evals.json — SaaS startup roadmap]
```

**Run B — Pareto Audit Only (No Geodesic):**
```
System: [PCE_SYSTEM_PROMPT.md]
Skill: pareto-audit
Prompt: [eval id=1 from evals.json — SaaS startup roadmap]
```

**Run C — Baseline (No Skills):**
```
System: [default]
Prompt: [eval id=1 from evals.json — SaaS startup roadmap]
```

### Expected Results

| Metric | Run A (Geodesic+Pareto) | Run B (Pareto Only) | Run C (Baseline) |
|---|---|---|---|
| `T_pre` | 0–15 tokens | 30–80 tokens | 80–200 tokens |
| `R_art` | >0.90 | 0.70–0.85 | 0.40–0.60 |
| `TTFS` | <20 tokens | 40–100 tokens | 100–300 tokens |
| `H` | 0 | 0–3 | 5–15 |
| `M` | 0 | 2–5 | 5–10 |

### The Delineation Line

The geodesic skill creates exactly ONE structural boundary in the output:

```
[S-ToT reasoning block — if S-ToT is active per system context]
─── DELINEATION LINE ───
[Pure artifact — tables, matrices, reframes, prune lists]
```

Above the line: reasoning surface (required by S-ToT protocol if present in system context).
Below the line: pure deliverable. No transition prose bridges the two.

Without geodesic, the output exhibits:
1. Preamble ("Let me analyze your roadmap...")
2. Hedged transitions ("Based on my assessment...")
3. Postamble ("Let me know if you'd like me to...")
4. Interstitial commentary between structural elements

### Grading Criteria

**PASS** if Run A achieves ALL of:
- `R_art > 0.88`
- `H = 0`
- `M = 0`
- `TTFS < 25 tokens`
- Single delineation boundary (no scattered meta-commentary)

**PASS** if Run A metrics are measurably better than Run B on ALL of:
- `R_art(A) > R_art(B)`
- `H(A) < H(B)`
- `TTFS(A) < TTFS(B)`

## Measurement Script

```python
#!/usr/bin/env python3
"""Geodesic delineation measurement tool."""
import re
import sys
import json

HEDGE_PATTERNS = [
    r'\bmight\b', r'\bcould try\b', r'\bperhaps\b',
    r'\bconsider\b', r"it's worth noting", r'\bmaybe\b'
]
META_PATTERNS = [
    r"I'll help", r"Let me ", r"Here's my approach",
    r"Based on ", r"I would suggest", r"Great question"
]
STRUCTURE_PATTERNS = [
    r'^\|.*\|.*\|', r'^##\s', r'^###\s',
    r'VITAL_20', r'TRIVIAL_80', r'REFRAME'
]


def measure(text: str) -> dict:
    lines = text.strip().split('\n')
    tokens_approx = len(text.split())

    # Find first structural element
    ttfs = tokens_approx  # default: no structure found
    for i, line in enumerate(lines):
        for pat in STRUCTURE_PATTERNS:
            if re.search(pat, line):
                ttfs = len(' '.join(lines[:i]).split())
                break
        else:
            continue
        break

    # Count hedges and meta-commentary
    hedges = sum(len(re.findall(p, text, re.IGNORECASE)) for p in HEDGE_PATTERNS)
    metas = sum(len(re.findall(p, text, re.IGNORECASE)) for p in META_PATTERNS)

    # Estimate artifact vs preamble/postamble
    structural_lines = []
    for i, line in enumerate(lines):
        if any(re.search(p, line) for p in STRUCTURE_PATTERNS):
            structural_lines.append(i)

    if structural_lines:
        first_struct = structural_lines[0]
        last_struct = structural_lines[-1]
        preamble = ' '.join(lines[:first_struct]).split()
        postamble = ' '.join(lines[last_struct+1:]).split()
        artifact = ' '.join(lines[first_struct:last_struct+1]).split()
    else:
        preamble, postamble, artifact = text.split(), [], []

    t_pre = len(preamble)
    t_post = len(postamble)
    t_art = len(artifact)
    r_art = t_art / tokens_approx if tokens_approx > 0 else 0

    return {
        "T_total": tokens_approx,
        "T_pre": t_pre,
        "T_post": t_post,
        "T_art": t_art,
        "R_art": round(r_art, 3),
        "TTFS": ttfs,
        "H": hedges,
        "M": metas,
    }


def grade(metrics: dict) -> dict:
    return {
        "R_art_pass": metrics["R_art"] > 0.88,
        "H_pass": metrics["H"] == 0,
        "M_pass": metrics["M"] == 0,
        "TTFS_pass": metrics["TTFS"] < 25,
        "overall_pass": (
            metrics["R_art"] > 0.88
            and metrics["H"] == 0
            and metrics["M"] == 0
            and metrics["TTFS"] < 25
        ),
    }


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python measure_delineation.py <response_file.txt>")
        sys.exit(1)
    with open(sys.argv[1]) as f:
        text = f.read()
    metrics = measure(text)
    grades = grade(metrics)
    result = {"metrics": metrics, "grades": grades}
    print(json.dumps(result, indent=2))
```

## Integration with skill-creator Eval Framework

This test slots into the standard `skill-creator` eval pipeline:

1. Runs A, B, C are spawned as subagents (with-skill / without-skill / baseline)
2. Outputs saved to `pareto-audit-workspace/iteration-1/geodesic-delineation/`
3. `measure_delineation.py` produces `grading.json` per run
4. Aggregated into `benchmark.json` via `aggregate_benchmark.py`
5. Viewer launched with `generate_review.py` for human comparison
