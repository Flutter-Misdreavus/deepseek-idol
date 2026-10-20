"""Contact sheet from a video: every n-th frame, labelled with its absolute MV frame.
usage: python3 -I tools/sheet.py in.mp4 out.png [every=6] [first_abs_frame=0]
"""
import subprocess
import sys
import tempfile
from pathlib import Path

from PIL import Image, ImageDraw

src, dst = sys.argv[1], sys.argv[2]
every = int(sys.argv[3]) if len(sys.argv) > 3 else 6
first = int(sys.argv[4]) if len(sys.argv) > 4 else 0
with tempfile.TemporaryDirectory() as d:
    # (select= returns black frames with this ffmpeg build; fps= works)
    subprocess.run(["ffmpeg", "-loglevel", "error", "-i", src, "-vf", f"fps=30/{every}:round=down,scale=384:-1",
                    f"{d}/%04d.png"], check=True)
    frames = sorted(Path(d).glob("*.png"))
    cols = 5
    w, h = Image.open(frames[0]).size
    rows = (len(frames) + cols - 1) // cols
    sheet = Image.new("RGB", (cols * w, rows * h), "white")
    for i, p in enumerate(frames):
        im = Image.open(p).convert("RGB")
        ImageDraw.Draw(im).text((6, 4), str(first + i * every), fill=(255, 0, 0))
        sheet.paste(im, ((i % cols) * w, (i // cols) * h))
    sheet.save(dst)
print(dst, len(frames))
