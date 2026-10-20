"""Build mv/src/data/lyrics.json from the OCR'd SRTs + the DS parody Chinese lines.

- ja: assets/music/lyrics_ja.srt with the OCR misreads from 提取报告.md fixed
- zh: assets/lyrics/ds_zh.txt, one line per SRT entry (72), in order
- zhOrig: the original translation (assets/music/lyrics_zh.srt), kept for reference
Also writes assets/lyrics/歌词_DS版对照.txt for review.
usage: python3 -I tools/build_lyrics.py
"""
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
MUSIC = ROOT / "assets/music"

FIXES = {
    "完壁で嘘つきの君は": "完璧で嘘つきの君は",
    "何を聞かれでものらりくらり": "何を聞かれても のらりくらり",
    "だけと 燦々と": "だけど 燦々と",
    "その笑顔で愛してるで": "その笑顔で愛してるって",
    "酒落臭い": "洒落臭い",
    "宿じてる": "信じてる",
    "あぁやっと言いた": "あぁ やっと言えた",
}


def ts(s):
    h, m, rest = s.split(":")
    sec, ms = rest.split(",")
    return int(h) * 3600 + int(m) * 60 + int(sec) + int(ms) / 1000


def srt(path):
    out = []
    for block in path.read_text(encoding="utf-8").strip().split("\n\n"):
        lines = block.strip().splitlines()
        a, b = re.match(r"(\S+) --> (\S+)", lines[1]).groups()
        out.append({"start": ts(a), "end": ts(b), "text": " ".join(lines[2:]).strip()})
    return out


ja = srt(MUSIC / "lyrics_ja.srt")
zh = srt(MUSIC / "lyrics_zh.srt")
ds = [l.strip() for l in (ROOT / "assets/lyrics/ds_zh.txt").read_text(encoding="utf-8").splitlines() if l.strip()]
assert len(ja) == len(zh) == len(ds), (len(ja), len(zh), len(ds))

rows = [
    {"start": j["start"], "end": j["end"], "ja": FIXES.get(j["text"], j["text"]), "zh": d, "zhOrig": z["text"]}
    for j, z, d in zip(ja, zh, ds)
]
assert all(f not in {r["ja"] for r in rows} for f in FIXES), "unapplied OCR fix"

out = ROOT / "mv/src/data/lyrics.json"
out.write_text(json.dumps(rows, ensure_ascii=False, indent=1), encoding="utf-8")

review = ["# 《我推的 DeepSeek》歌词对照：时间 / 日文原词 / DS版中文 / （原翻译）", ""]
for i, r in enumerate(rows, 1):
    m, s = divmod(r["start"], 60)
    review += [f"{i:02d} [{int(m)}:{s:05.2f}] {r['ja']}", f"    DS：{r['zh']}", f"    原：{r['zhOrig']}", ""]
(ROOT / "assets/lyrics/歌词_DS版对照.txt").write_text("\n".join(review), encoding="utf-8")
print(f"{len(rows)} lines -> {out.relative_to(ROOT)}")
