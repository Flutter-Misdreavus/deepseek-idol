"""Cut the subject out of an illustration with macOS Vision subject lifting -> RGBA PNG.

usage: PYTHONPATH=.tools/py python3 -I tools/lift.py <in.png> <out.png> [--erase x0,y0,x1,y1 ...] [--mask mask.png]
  --erase: rectangles (fractions of width/height, top-left origin) forced transparent, e.g. a stray second tail
  --mask:  also save the alpha mask, for inspection
Refinement (illustrations on soft gradient backgrounds): the background color is estimated by normalized
convolution of the pixels Vision calls background; pixels close to it are cleared, clearly different pixels
that Vision kept only partially (e.g. a dark tail) are made solid, and small islands are dropped.
"""
import sys

sys.path.insert(0, ".tools/py")

import numpy as np
import Quartz
import Vision
from Foundation import NSURL
from PIL import Image, ImageDraw, ImageFilter
from scipy import ndimage

args = sys.argv[1:]
src, out = args[0], args[1]
erase = [list(map(float, args[i + 1].split(","))) for i, a in enumerate(args) if a == "--erase"]
mask_out = args[args.index("--mask") + 1] if "--mask" in args else None

handler = Vision.VNImageRequestHandler.alloc().initWithURL_options_(NSURL.fileURLWithPath_(src), None)
req = Vision.VNGenerateForegroundInstanceMaskRequest.alloc().init()
ok, err = handler.performRequests_error_([req], None)
assert ok, err
obs = req.results()[0]
buf, err = obs.generateScaledMaskForImageForInstances_fromRequestHandler_error_(obs.allInstances(), handler, None)
assert buf is not None, err

# CVPixelBuffer (OneComponent32Float) -> numpy
Quartz.CVPixelBufferLockBaseAddress(buf, 0)
w, h = Quartz.CVPixelBufferGetWidth(buf), Quartz.CVPixelBufferGetHeight(buf)
stride = Quartz.CVPixelBufferGetBytesPerRow(buf)
raw = Quartz.CVPixelBufferGetBaseAddress(buf).as_buffer(stride * h)
m = np.frombuffer(raw, dtype=np.float32).reshape(h, stride // 4)[:, :w].copy()
Quartz.CVPixelBufferUnlockBaseAddress(buf, 0)

img = Image.open(src).convert("RGBA")
a = np.asarray(Image.fromarray((np.clip(m, 0, 1) * 255).astype(np.uint8)).resize(img.size, Image.LANCZOS)) / 255.0

# refine against the estimated background color
rgb = np.asarray(img.convert("RGB")).astype(np.float32)
bgw = (a < 0.05).astype(np.float32)
num = np.stack([ndimage.gaussian_filter(rgb[..., c] * bgw, 40) for c in range(3)], -1)
den = ndimage.gaussian_filter(bgw, 40)[..., None] + 1e-6
dist = np.linalg.norm(rgb - num / den, axis=-1)
a = np.where((dist < 16) & (a < 0.9), 0, a)
a = np.where((dist > 45) & (a > 0.1), 1, a)
lab, n = ndimage.label(a > 0.5)
if n > 1:
    sizes = ndimage.sum(np.ones_like(a), lab, range(1, n + 1))
    a[np.isin(lab, 1 + np.flatnonzero(sizes < 0.002 * a.size))] = 0
alpha = Image.fromarray((np.clip(a, 0, 1) * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(0.7))
if erase:
    d = ImageDraw.Draw(alpha)
    W, H = img.size
    for x0, y0, x1, y1 in erase:
        d.rectangle([x0 * W, y0 * H, x1 * W, y1 * H], fill=0)
    alpha = alpha.filter(ImageFilter.GaussianBlur(1))
img.putalpha(alpha)
img.save(out)
if mask_out:
    alpha.save(mask_out)
print(out, img.size)
