#!/usr/bin/env python3
"""OCR images with the macOS Vision framework (Japanese + Simplified Chinese).

Usage: ocr.py <image> [<image> ...]
Emits one JSON object per line:
  {"file": name, "lines": [{"text":..,"conf":..,"x":..,"y":..,"w":..,"h":..}, ...]}
Coordinates are normalized with the Vision convention (origin at bottom-left).
"""
import json
import os
import sys
from multiprocessing import Pool

import Quartz
import Vision
from Foundation import NSURL

LANGS = ["ja-JP", "zh-Hans", "en-US"]


def recognize(path):
    url = NSURL.fileURLWithPath_(path)
    src = Quartz.CGImageSourceCreateWithURL(url, None)
    if src is None:
        return []
    cg = Quartz.CGImageSourceCreateImageAtIndex(src, 0, None)
    if cg is None:
        return []

    req = Vision.VNRecognizeTextRequest.alloc().init()
    req.setRecognitionLevel_(Vision.VNRequestTextRecognitionLevelAccurate)
    req.setRecognitionLanguages_(LANGS)
    req.setUsesLanguageCorrection_(False)
    req.setMinimumTextHeight_(0.006)

    handler = Vision.VNImageRequestHandler.alloc().initWithCGImage_options_(cg, None)
    handler.performRequests_error_([req], None)

    out = []
    for obs in (req.results() or []):
        cands = obs.topCandidates_(1)
        if not cands:
            continue
        c = cands[0]
        bb = obs.boundingBox()
        out.append({
            "text": c.string(),
            "conf": float(c.confidence()),
            "x": float(bb.origin.x),
            "y": float(bb.origin.y),
            "w": float(bb.size.width),
            "h": float(bb.size.height),
        })
    # Vision y grows upward: sort top -> bottom, then left -> right
    out.sort(key=lambda d: (-round(d["y"], 2), d["x"]))
    return out


def work(path):
    try:
        lines = recognize(path)
    except Exception as exc:  # keep the batch going
        lines = []
        sys.stderr.write(f"OCR failed for {path}: {exc}\n")
    return {"file": os.path.basename(path), "lines": lines}


def main():
    paths = sys.argv[1:]
    if not paths:
        sys.exit("usage: ocr.py <image> [...]")
    if len(paths) == 1 and os.path.isdir(paths[0]):
        d = paths[0]
        paths = [os.path.join(d, f) for f in sorted(os.listdir(d))
                 if f.lower().endswith((".png", ".jpg", ".jpeg"))]
    workers = min(8, os.cpu_count() or 4)
    with Pool(workers) as pool:
        for res in pool.imap_unordered(work, paths, chunksize=4):
            print(json.dumps(res, ensure_ascii=False), flush=True)


if __name__ == "__main__":
    main()
