#!/usr/bin/env python3
"""Geodesic delineation measurement tool.

Measures the structural effect of geodesic-generation skill on output artifacts.
Quantifies preamble suppression, hedge elimination, and artifact density.

Usage:
    python measure_delineation.py <response_file.txt>
    python measure_delineation.py --compare <run_a.txt> <run_b.txt> [run_c.txt]
"""
import re
import sys
import json
from pathlib import Path

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
    ttfs = tokens_approx
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


def compare(metrics_a: dict, metrics_b: dict) -> dict:
    """Compare Run A (geodesic+pareto) vs Run B (pareto only)."""
    return {
        "R_art_delta": round(metrics_a["R_art"] - metrics_b["R_art"], 3),
        "H_delta": metrics_a["H"] - metrics_b["H"],
        "M_delta": metrics_a["M"] - metrics_b["M"],
        "TTFS_delta": metrics_a["TTFS"] - metrics_b["TTFS"],
        "A_strictly_better": (
            metrics_a["R_art"] > metrics_b["R_art"]
            and metrics_a["H"] < metrics_b["H"]
            and metrics_a["TTFS"] < metrics_b["TTFS"]
        ),
    }


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage:")
        print("  python measure_delineation.py <response.txt>")
        print("  python measure_delineation.py --compare <run_a.txt> <run_b.txt> [run_c.txt]")
        sys.exit(1)

    if sys.argv[1] == "--compare":
        files = sys.argv[2:]
        if len(files) < 2:
            print("Need at least 2 files for comparison")
            sys.exit(1)
        results = {}
        labels = ["run_a_geodesic_pareto", "run_b_pareto_only", "run_c_baseline"]
        for i, fpath in enumerate(files):
            text = Path(fpath).read_text()
            m = measure(text)
            label = labels[i] if i < len(labels) else f"run_{i}"
            results[label] = {"metrics": m, "grades": grade(m)}
        if len(files) >= 2:
            results["comparison_a_vs_b"] = compare(
                results["run_a_geodesic_pareto"]["metrics"],
                results["run_b_pareto_only"]["metrics"]
            )
        print(json.dumps(results, indent=2))
    else:
        text = Path(sys.argv[1]).read_text()
        metrics = measure(text)
        grades = grade(metrics)
        print(json.dumps({"metrics": metrics, "grades": grades}, indent=2))
