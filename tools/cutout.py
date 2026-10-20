"""Cut a character off a plain background (white or flat green screen).

Background = pixels close to the corner colour that are connected to the image border, so
white areas enclosed by line art (apron, frills) survive. Edge pixels are un-mixed from the
background colour to avoid halos. With --split, each large figure becomes its own file.

usage: python3 -I tools/cutout.py in.png out.png [--split] [--tol 28] [--min-area 20000] [--edges tlr] [--bg r,g,b]
--edges: which image borders seed the background (drop b for bust shots cut off at the bottom)
--bg: background colour, for close-ups whose corners are mostly figure (default: median of the corners)
"""
import argparse
from pathlib import Path

import numpy as np
from PIL import Image
from scipy import ndimage

ap = argparse.ArgumentParser()
ap.add_argument("src")
ap.add_argument("dst")
ap.add_argument("--split", action="store_true")
ap.add_argument("--tol", type=float, default=28)
ap.add_argument("--min-area", type=int, default=20000)
ap.add_argument("--edges", default="tblr")
ap.add_argument("--bg")
a = ap.parse_args()

rgb = np.asarray(Image.open(a.src).convert("RGB")).astype(np.float32)
h, w, _ = rgb.shape
corners = np.array([rgb[2, 2], rgb[2, -3], rgb[-3, 2], rgb[-3, -3]])
bg = np.array([float(v) for v in a.bg.split(",")]) if a.bg else np.median(corners, axis=0)
dist = np.linalg.norm(rgb - bg, axis=2)

near = dist < a.tol
# green screen: nothing in the character is green, so every keyed pixel is background, including
# pockets enclosed by hair strands; on white, only border-connected white is (keeps aprons, frills)
green = bg[1] > bg[0] + 60 and bg[1] > bg[2] + 60
if green:
    background = near
else:
    lab, _ = ndimage.label(near)
    edges = {"t": lab[0], "b": lab[-1], "l": lab[:, 0], "r": lab[:, -1]}
    border = np.unique(np.concatenate([edges[e] for e in a.edges]))
    background = np.isin(lab, border[border > 0])

# soft alpha on the boundary band: ramp by colour distance
alpha = np.where(background, 0.0, 1.0)
band = ndimage.binary_dilation(background, iterations=2) & ~ndimage.binary_erosion(background, iterations=1)
ramp = np.clip((dist - a.tol * 0.35) / (a.tol * 1.6), 0, 1)
alpha = np.where(band, np.minimum(alpha + ramp, 1.0) * (dist > a.tol * 0.35), alpha)
alpha = ndimage.gaussian_filter(alpha, 0.6)
alpha[background & ~band] = 0

# un-mix background colour from semi-transparent edge pixels
am = np.clip(alpha, 1e-3, 1)[..., None]
fg = np.clip((rgb - (1 - am) * bg) / am, 0, 255)
fg = np.where(alpha[..., None] > 0.98, rgb, fg)
if green:  # despill: green never exceeds the larger of red/blue in this palette
    fg[..., 1] = np.minimum(fg[..., 1], np.maximum(fg[..., 0], fg[..., 2]))
rgba = np.dstack([fg, alpha * 255]).astype(np.uint8)
rgba[rgba[..., 3] == 0] = 0  # no stray colour under fully transparent pixels

dst = Path(a.dst)
if not a.split:
    Image.fromarray(rgba).save(dst)
    print(dst)
else:
    figs, n = ndimage.label(ndimage.binary_closing(alpha > 0.5, iterations=6))
    sizes = ndimage.sum(np.ones_like(alpha), figs, range(1, n + 1))
    keep = sorted([i + 1 for i, s in enumerate(sizes) if s >= a.min_area],
                  key=lambda i: ndimage.center_of_mass(figs == i)[1])
    for k, i in enumerate(keep):
        ys, xs = np.where(figs == i)
        pad = 12
        y0, y1 = max(0, ys.min() - pad), min(h, ys.max() + pad)
        x0, x1 = max(0, xs.min() - pad), min(w, xs.max() + pad)
        part = rgba[y0:y1, x0:x1].copy()
        part[..., 3] = np.where((figs[y0:y1, x0:x1] == i) | (part[..., 3] < 128), part[..., 3], 0)
        out = dst.with_name(f"{dst.stem}_{k}{dst.suffix}")
        Image.fromarray(part).save(out)
        print(out, part.shape[1], "x", part.shape[0])
