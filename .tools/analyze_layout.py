#!/usr/bin/env python3
"""Analyze OCR JSONL output: vertical distribution of text and band structure."""
import json
import re
import sys
from collections import Counter, defaultdict

path = sys.argv[1] if len(sys.argv) > 1 else ".work/ocr_full.jsonl"

buckets = defaultdict(list)
rows = []
for line in open(path, encoding="utf-8"):
    line = line.strip()
    if not line:
        continue
    d = json.loads(line)
    m = re.search(r"(\d+)", d["file"])
    idx = int(m.group(1)) if m else 0
    rows.append((idx, d))
    for l in d["lines"]:
        b = round(l["y"] * 20) / 20  # 0.05 buckets
        buckets[b].append((idx, l["text"], l["conf"]))

print("frames analysed:", len(rows))
print("\n=== y-bucket distribution (Vision coords, 0=bottom) ===")
for b in sorted(buckets, reverse=True):
    items = buckets[b]
    texts = [t for _, t, _ in items]
    print(f"y~{b:.2f}  n={len(items):5d}  uniq={len(set(texts)):4d}")
    for t, c in Counter(texts).most_common(6):
        print(f"        {c:5d}  {t[:70]}")

print("\n=== per-frame row layout for first 40 frames ===")
for idx, d in sorted(rows)[:40]:
    print(f"--- frame {idx} ({idx-1}s)")
    for l in d["lines"]:
        print(f"    y={l['y']:.3f} c={l['conf']:.2f} | {l['text'][:80]}")
