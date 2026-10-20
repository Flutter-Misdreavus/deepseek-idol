"""Style check sheet: the style references in the top row, generated images below, each labelled.
usage: python3 -I tools/compare_sheet.py <out.png> <img1.png> [img2.png ...]
"""
import sys
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parent.parent
REFS = [ROOT / f"gen/ref/style_mv_{i}.png" for i in (1, 2, 3)]
W, H, PAD, LABEL = 720, 480, 16, 40
COLS = 3

out, imgs = sys.argv[1], [Path(p) for p in sys.argv[2:]]
try:
    font = ImageFont.truetype("/System/Library/Fonts/Hiragino Sans GB.ttc", 26)
except OSError:
    font = ImageFont.load_default()


def tile(path, label):
    im = Image.open(path).convert("RGBA")
    im.thumbnail((W, H))
    t = Image.new("RGB", (W, H + LABEL), "#1b1830")
    t.paste(im, ((W - im.width) // 2, LABEL + (H - im.height) // 2), im)  # cutouts over the dark tile
    ImageDraw.Draw(t).text((10, 6), label, fill="#ffd45e", font=font)
    return t


rows = [[tile(p, f"STYLE REF · {p.stem}") for p in REFS]]
gen = [tile(p, p.stem) for p in imgs]
rows += [gen[i:i + COLS] for i in range(0, len(gen), COLS)]
sheet = Image.new("RGB", (COLS * (W + PAD) + PAD, len(rows) * (H + LABEL + PAD) + PAD), "#0e0c1c")
for r, row in enumerate(rows):
    for c, t in enumerate(row):
        sheet.paste(t, (PAD + c * (W + PAD), PAD + r * (H + LABEL + PAD)))
sheet.save(out)
print(out)
