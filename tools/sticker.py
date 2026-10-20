"""Bake a white die-cut border + soft navy shadow into a transparent PNG (offline, so frames stay cheap).
usage: python3 -I tools/sticker.py in.png out.png [--width 8]
"""
import argparse

import numpy as np
from PIL import Image
from scipy import ndimage

ap = argparse.ArgumentParser()
ap.add_argument("src")
ap.add_argument("dst")
ap.add_argument("--width", type=int, default=8)
a = ap.parse_args()

im = Image.open(a.src).convert("RGBA")
w = a.width
pad = w * 4
canvas = Image.new("RGBA", (im.width + 2 * pad, im.height + 2 * pad))
canvas.paste(im, (pad, pad))
alpha = np.asarray(canvas)[..., 3].astype(np.float32) / 255

# disc dilation of the silhouette, slightly softened
yy, xx = np.mgrid[-w:w + 1, -w:w + 1]
border = ndimage.grey_dilation(alpha, footprint=(xx ** 2 + yy ** 2) <= w * w)
border = ndimage.gaussian_filter(border, 0.7)
shadow = ndimage.shift(ndimage.gaussian_filter(border, w * 0.8), (w * 1.1, 0)) * 0.28

out = np.zeros(alpha.shape + (4,), np.float32)
out[..., :3] = np.array([38, 48, 92], np.float32)
out[..., 3] = shadow
# white border over shadow
a_b = border
out[..., :3] = (out[..., :3] * out[..., 3:4] * (1 - a_b[..., None]) + 255 * a_b[..., None]) / np.maximum(
    out[..., 3:4] * (1 - a_b[..., None]) + a_b[..., None], 1e-6)
out[..., 3] = a_b + out[..., 3] * (1 - a_b)
# original on top
src = np.asarray(canvas).astype(np.float32)
a_s = src[..., 3:4] / 255
rgb = (src[..., :3] * a_s + out[..., :3] * out[..., 3:4] * (1 - a_s)) / np.maximum(a_s + out[..., 3:4] * (1 - a_s), 1e-6)
out[..., :3] = rgb
out[..., 3] = a_s[..., 0] + out[..., 3] * (1 - a_s[..., 0])
res = Image.fromarray(np.dstack([out[..., :3], out[..., 3:] * 255]).clip(0, 255).astype(np.uint8))
res.crop(res.getbbox()).save(a.dst)
print(a.dst, res.getbbox())
