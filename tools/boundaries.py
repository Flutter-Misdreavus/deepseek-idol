"""Contact sheet of the frames around every section cut: rows = sections, columns = s-3, s-1, s, s+1, s+4.
usage: python3 -I tools/boundaries.py full.mp4 out.png
"""
import subprocess
import sys
import tempfile
from pathlib import Path

from PIL import Image, ImageDraw

P, F0 = 0.43165, 0.337
BEATS = [3, 18, 49, 63, 95, 119, 135, 180, 196, 228, 252, 260, 268, 306, 356, 379, 405, 451, 471]
OFF = [-3, -1, 0, 1, 4]
src, dst = sys.argv[1], sys.argv[2]
starts = [round((F0 + b * P) * 30) for b in BEATS]
W, H = 320, 180
sheet = Image.new("RGB", (W * len(OFF) + 60, H * len(starts)), "white")
with tempfile.TemporaryDirectory() as d:
    for r, s in enumerate(starts):
        for c, o in enumerate(OFF):
            n = s + o
            out = Path(d) / f"{n}.png"
            # frame-accurate: decode from the start of the second, pick by frame number
            subprocess.run(["ffmpeg", "-loglevel", "error", "-ss", f"{max(0, n // 30 - 1)}", "-i", src, "-vf",
                            f"fps=30,trim=start_frame={n - 30 * max(0, n // 30 - 1)},scale={W}:{H}", "-frames:v", "1", str(out)], check=True)
            sheet.paste(Image.open(out).convert("RGB"), (60 + c * W, r * H))
        ImageDraw.Draw(sheet).text((4, r * H + 4), f"b{BEATS[r]}\n{s}", fill=(200, 0, 0))
sheet.save(dst)
print(dst)
