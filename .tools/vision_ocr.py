#!/usr/bin/env python3
"""Vision OCR helpers: region crops, upscaling, per-language passes, top-N candidates."""
import io
import os
from multiprocessing import Pool

import Quartz
import Vision
from Foundation import NSData
from PIL import Image

# Vision bounding boxes use a bottom-left origin; helpers here take top-origin
# fractions (0,0 = top-left of the frame) because that is how the video is cropped.


def _cgimage(path_or_img, box=None, scale=1.0, mode="L"):
    """Load an image, optionally crop (top-origin fractions) and upscale."""
    if isinstance(path_or_img, Image.Image):
        img = path_or_img
    else:
        img = Image.open(path_or_img)
    img = img.convert("RGB")
    if box is not None:
        w, h = img.size
        x0, y0, x1, y1 = box
        img = img.crop((int(x0 * w), int(y0 * h), int(x1 * w), int(y1 * h)))
    if scale != 1.0:
        img = img.resize((int(img.width * scale), int(img.height * scale)), Image.LANCZOS)
    if mode == "L":
        img = img.convert("L")
    buf = io.BytesIO()
    img.save(buf, format="PNG")
    data = NSData.dataWithBytes_length_(buf.getvalue(), len(buf.getvalue()))
    src = Quartz.CGImageSourceCreateWithData(data, None)
    return Quartz.CGImageSourceCreateImageAtIndex(src, 0, None)


def recognize(cg, langs=("ja-JP", "zh-Hans"), n=1, min_height=0.004, correction=False):
    """Run Vision text recognition; return list of observations with n candidates."""
    req = Vision.VNRecognizeTextRequest.alloc().init()
    req.setRecognitionLevel_(Vision.VNRequestTextRecognitionLevelAccurate)
    req.setRecognitionLanguages_(list(langs))
    req.setUsesLanguageCorrection_(correction)
    req.setMinimumTextHeight_(min_height)

    handler = Vision.VNImageRequestHandler.alloc().initWithCGImage_options_(cg, None)
    handler.performRequests_error_([req], None)

    out = []
    for obs in (req.results() or []):
        cands = obs.topCandidates_(n)
        if not cands:
            continue
        bb = obs.boundingBox()
        out.append({
            "text": cands[0].string(),
            "conf": float(cands[0].confidence()),
            "cands": [{"text": c.string(), "conf": float(c.confidence())} for c in cands],
            "x": float(bb.origin.x),
            "y": float(bb.origin.y),
            "w": float(bb.size.width),
            "h": float(bb.size.height),
        })
    out.sort(key=lambda d: (-round(d["y"], 2), d["x"]))
    return out


def recognize_file(path, box=None, scale=1.0, langs=("ja-JP", "zh-Hans"), n=1, mode="L"):
    cg = _cgimage(path, box=box, scale=scale, mode=mode)
    return recognize(cg, langs=langs, n=n)


_WORKER_CFG = {}


def _init_worker(cfg):
    _WORKER_CFG.update(cfg)


def _worker(path):
    cfg = _WORKER_CFG
    try:
        return {"file": os.path.basename(path),
                "lines": recognize_file(path, box=cfg.get("box"), scale=cfg.get("scale", 1.0),
                                        langs=cfg.get("langs", ("ja-JP", "zh-Hans")),
                                        n=cfg.get("n", 1), mode=cfg.get("mode", "L"))}
    except Exception as exc:
        return {"file": os.path.basename(path), "lines": [], "error": str(exc)}


def recognize_paths(paths, box=None, scale=1.0, langs=("ja-JP", "zh-Hans"), n=1, workers=8):
    cfg = {"box": box, "scale": scale, "langs": langs, "n": n}
    with Pool(min(workers, max(1, len(paths))), initializer=_init_worker, initargs=(cfg,)) as pool:
        yield from pool.imap_unordered(_worker, paths, chunksize=4)
