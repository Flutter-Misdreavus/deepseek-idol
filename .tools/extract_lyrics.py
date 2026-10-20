#!/usr/bin/env python3
"""Extract the burned-in bilingual lyrics from the downloaded video.

Layout discovered in the source video (1920x1080, lyrics in the lower band):
  * one row holds the Chinese translation, another row holds the Japanese
    original; the two rows swap order in a couple of sections, so rows are
    separated by *position*, never by assumed order
  * both rows read cleanly at confidence 1.0 when Vision is primed with their
    own language, and are garbled when primed with the other language

Pipeline
  1. sample frames (default 4 fps, JPEG q=2)
  2. pass A  zh-Hans primary  and  pass B  ja-JP primary  over the lyric band, 2x
  3. rejoin observations that Vision split inside one text row
  4. split the two rows apart by geometry + script, drop cross-language
     misreads, then verify every resulting line with a tight 4x crop
  5. fold frames into timed segments and write lyric sheets plus .srt files

Usage: extract_lyrics.py --video <file> --out <dir> [--work <dir>] [--fps 4]
"""
import argparse
import json
import os
import re
import subprocess
import sys
from collections import Counter, defaultdict

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import vision_ocr as V  # noqa: E402

KANA = re.compile(r"[\u3040-\u309f\u30a0-\u30ff]")
HIRA = re.compile(r"[\u3040-\u309f]")
KATA = re.compile(r"[\u30a0-\u30ff]")
CJK = re.compile(r"[\u4e00-\u9fff]")
HAN = re.compile(r"[\u4e00-\u9fff]")
TITLE = re.compile(r"YOASOBI|アイドル\s*[（(]\s*偶像")


def looks_japanese(text):
    """A Chinese line never contains hiragana. A lone misread katakana
    (才->オ, 口->ロ, a dash->ー) must not promote a Chinese row to Japanese,
    so katakana alone only counts when there are several of them."""
    return bool(HIRA.search(text)) or len(KATA.findall(text)) >= 2

BAND_TOP = 0.72          # lyric band occupies frame rows 0.72 .. 1.0
BAND_H = 1.0 - BAND_TOP
ROW_TOL = 0.07           # same text row if Vision y differs by less than this
ROW_SEP = 0.08           # different rows must differ by at least this
MIN_DUR = 0.4
MIN_LEN = 3
LOW_CONF = 0.7


def log(*a):
    print(*a, file=sys.stderr, flush=True)


def extract_frames(video, outdir, fps):
    os.makedirs(outdir, exist_ok=True)
    have = [f for f in os.listdir(outdir) if f.endswith(".jpg")]
    if len(have) > 10:
        log(f"frames already present in {outdir} ({len(have)}), reusing")
        return
    cmd = ["ffmpeg", "-v", "error", "-i", video, "-vf", f"fps={fps}",
           "-q:v", "2", "-y", os.path.join(outdir, "f_%05d.jpg")]
    log("extracting frames:", " ".join(cmd))
    subprocess.run(cmd, check=True)


def run_pass(frames, langs, tag, cachedir):
    cache = os.path.join(cachedir, f"ocr_{tag}.jsonl")
    if os.path.exists(cache) and os.path.getsize(cache) > 0:
        log(f"reusing OCR cache {cache}")
        with open(cache, encoding="utf-8") as fh:
            return [json.loads(l) for l in fh if l.strip()]
    log(f"OCR pass {tag}: {len(frames)} frames, langs={langs}")
    results = []
    with open(cache, "w", encoding="utf-8") as fh:
        for i, res in enumerate(V.recognize_paths(frames, box=(0.0, BAND_TOP, 1.0, 1.0),
                                                  scale=2.0, langs=langs, n=5)):
            results.append(res)
            fh.write(json.dumps(res, ensure_ascii=False) + "\n")
            if (i + 1) % 200 == 0:
                log(f"  {tag}: {i + 1}/{len(frames)}")
    return results


def frame_time(name, fps):
    return (int(re.search(r"(\d+)", name).group(1)) - 1) / fps


def join_rows(lines):
    """Merge observations that belong to one physical text row."""
    rows = []
    for o in sorted(lines, key=lambda l: (-l["y"], l["x"])):
        for r in rows:
            if abs(r["y"] - o["y"]) <= ROW_TOL:
                r["items"].append(o)
                r["y"] = sum(i["y"] for i in r["items"]) / len(r["items"])
                break
        else:
            rows.append({"y": o["y"], "items": [o]})
    out = []
    for r in rows:
        items = sorted(r["items"], key=lambda l: l["x"])
        out.append({
            "text": " ".join(i["text"].strip() for i in items),
            "conf": max(i["conf"] for i in items),
            "y": r["y"],
            "h": max(i.get("h", 0.03) for i in items),
        })
    return out


def han_chars(s):
    return [c for c in s if HAN.match(c)]


def cross_overlap(a, b):
    """Share of a's Han characters also present in b (simplified/traditional
    drift shows up as a miss, which is fine for a coarse duplicate test)."""
    ca, sb = han_chars(a), set(han_chars(b))
    if not ca:
        return 0.0
    return sum(1 for c in ca if c in sb) / len(ca)


def usable(text, conf):
    t = re.sub(r"\s+", " ", text).strip()
    if conf < 0.3 or len(t) < 2 or TITLE.search(t):
        return None
    if not (KANA.search(t) or CJK.search(t)):
        return None
    return t


def merge(pass_a, pass_b, fps):
    """Split每行 by which language it actually is.

    Both passes see both rows, so rows are paired by position and the row's
    language is decided by script: a row whose Japanese-primed reading carries
    kana is the Japanese line even if the Chinese pass also produced a (kana
    free, garbled) reading for it, and vice versa.
    """
    frames = defaultdict(dict)
    for tag, results in (("zh", pass_a), ("ja", pass_b)):
        for res in results:
            frames[frame_time(res["file"], fps)][tag] = join_rows(res["lines"])

    merged = {}
    for t, passes in frames.items():
        zh_rows, ja_rows = [], []
        for r in passes.get("zh", []):
            txt = usable(r["text"], r["conf"])
            if txt:
                zh_rows.append({"text": txt, "conf": r["conf"], "y": r["y"], "h": r["h"]})
        for r in passes.get("ja", []):
            txt = usable(r["text"], r["conf"])
            if txt:
                ja_rows.append({"text": txt, "conf": r["conf"], "y": r["y"], "h": r["h"]})

        out_ja, out_zh, used_zh = [], [], set()
        for j in ja_rows:
            mate = next((i for i, z in enumerate(zh_rows)
                         if i not in used_zh and abs(z["y"] - j["y"]) < ROW_SEP), None)
            if looks_japanese(j["text"]):
                out_ja.append(j)
                if mate is not None:
                    used_zh.add(mate)
            elif mate is not None:
                # Japanese-primed read without kana: the row is the Chinese one
                out_zh.append(zh_rows[mate])
                used_zh.add(mate)
            elif j["conf"] >= 0.5:
                out_zh.append(j)      # Chinese row only the Japanese pass caught
        for i, z in enumerate(zh_rows):
            if i in used_zh:
                continue
            (out_ja if looks_japanese(z["text"]) else out_zh).append(z)
        merged[t] = {"ja": out_ja, "zh": out_zh}
    return merged


def similar(a, b):
    a, b = a.replace(" ", ""), b.replace(" ", "")
    if a == b:
        return True
    if len(a) < 4 or abs(len(a) - len(b)) > 3:
        return False
    shorter, longer = (a, b) if len(a) <= len(b) else (b, a)
    if shorter in longer and len(shorter) / len(longer) > 0.6:
        return True
    prev = list(range(len(shorter) + 1))
    for i, ch in enumerate(longer, 1):
        cur = [i]
        for j, c2 in enumerate(shorter, 1):
            cur.append(min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (ch != c2)))
        prev = cur
    return prev[-1] / max(len(a), len(b)) <= 0.15


def build_segments(merged, fps):
    times = sorted(merged)
    span = 1.0 / fps
    out = {}
    for lang in ("ja", "zh"):
        windows = defaultdict(list)
        stats = defaultdict(lambda: {"best": 0.0, "count": 0, "y": [], "h": []})
        for t in times:
            for row in merged[t][lang]:
                windows[row["text"]].append([t, t + span])
                st = stats[row["text"]]
                st["best"] = max(st["best"], row["conf"])
                st["count"] += 1
                st["y"].append(row["y"])
                st["h"].append(row["h"])

        groups = []
        for text in sorted(windows, key=lambda s: (-stats[s]["best"], -len(s))):
            for g in groups:
                if any(similar(text, k) for k in g["keys"]):
                    g["keys"].add(text)
                    if (stats[text]["best"], len(text)) > (g["conf"], len(g["rep"])):
                        g["rep"], g["conf"] = text, stats[text]["best"]
                    break
            else:
                groups.append({"keys": {text}, "rep": text, "conf": stats[text]["best"]})

        segs = []
        for g in groups:
            keys = g["keys"]
            w = sorted(x for k in keys for x in windows[k])
            merged_w = []
            for a, b in w:
                if merged_w and a - merged_w[-1][1] <= 0.6:
                    merged_w[-1][1] = max(merged_w[-1][1], b)
                else:
                    merged_w.append([a, b])
            y = sorted(v for k in keys for v in stats[k]["y"])
            h = sorted(v for k in keys for v in stats[k]["h"])
            votes, confmap = {}, {}
            for k in keys:
                conf, cnt = stats[k]["best"], stats[k]["count"]
                votes[k] = votes.get(k, 0.0) + cnt * (1.0 + 0.5 * conf)
                confmap[k] = max(confmap.get(k, 0.0), conf)
            for a, b in merged_w:
                if b - a < MIN_DUR or len(g["rep"]) < MIN_LEN:
                    continue
                segs.append({
                    "text": g["rep"], "start": round(a, 3), "end": round(b, 3),
                    "conf": g["conf"], "y": y[len(y) // 2], "h": h[len(h) // 2],
                    "votes": dict(votes), "confmap": dict(confmap),
                })
        out[lang] = drop_fragments(segs, lang)
    return out


def drop_fragments(segs, lang):
    """Remove OCR fragments shadowed by a longer overlapping line, merge dups."""
    keep = []
    for s in segs:
        shadowed = False
        for o in segs:
            if o is s or len(o["text"]) <= len(s["text"]):
                continue
            overlap = min(s["end"], o["end"]) - max(s["start"], o["start"])
            if overlap <= 0:
                continue
            core = s["text"].replace(" ", "")
            if core in o["text"].replace(" ", "") and overlap >= 0.8 * (s["end"] - s["start"]):
                shadowed = True
                break
        if not shadowed:
            keep.append(s)
    keep.sort(key=lambda s: (s["text"], s["start"]))
    out = []
    for s in keep:
        if out and out[-1]["text"] == s["text"] and s["start"] - out[-1]["end"] <= 0.6:
            out[-1]["end"] = max(out[-1]["end"], s["end"])
            out[-1]["conf"] = max(out[-1]["conf"], s["conf"])
        else:
            out.append(dict(s))
    return out


def dedupe_languages(segs):
    """A misread Chinese row can survive as a Japanese segment; a real Japanese
    line carries several kana, a misread one at most a stray katakana dash."""
    drop = set()
    for ja in segs["ja"]:
        if len(HIRA.findall(ja["text"])) > 0:
            continue
        for zh in segs["zh"]:
            overlap = min(ja["end"], zh["end"]) - max(ja["start"], zh["start"])
            if overlap <= 0:
                continue
            if cross_overlap(ja["text"], zh["text"]) >= 0.6:
                drop.add(id(ja))
                break
    segs["ja"] = [s for s in segs["ja"] if id(s) not in drop]
    return segs


LANGS_FOR = {"ja": ("ja-JP", "zh-Hans"), "zh": ("zh-Hans", "ja-JP")}
SCALES = (3.0, 5.0)


def row_box(y, h=0.16, half=0.026):
    """Tight crop around one text row, as frame top-origin fractions.

    Vision's y is the *bottom* edge of the text box, so the row centre is
    y + h/2; treating y itself as the centre shifts the crop a whole half line
    downwards and pulls the neighbouring row into the image.
    """
    h = min(max(h, 0.06), 0.20)
    centre = BAND_TOP + (1.0 - (y + h / 2.0)) * BAND_H
    return (0.0, max(0.0, centre - half), 1.0, min(1.0, centre + half))


def _verify_worker(job):
    """Re-OCR one line from a tight crop; runs in a worker process."""
    lang, path, box, scale = job
    try:
        lines = V.recognize_file(path, box=box, scale=scale,
                                 langs=LANGS_FOR[lang], n=3)
    except Exception:
        return None
    best = None
    for l in lines:
        t = usable(l["text"], l["conf"])
        if not t:
            continue
        if lang == "ja" and not looks_japanese(t):
            continue
        if lang == "zh" and looks_japanese(t):
            continue
        if best is None or l["conf"] > best[1]:
            best = (t, l["conf"], [c["text"] for c in l["cands"]])
    return best


def verify_segments(segs, frames_dir, fps, workers=8):
    """Re-read every line from tight crops at several scales and frames,
    then let all readings (including the per-frame ones) vote on the text."""
    jobs = []
    for lang in ("ja", "zh"):
        for s in segs[lang]:
            i0 = int(s["start"] * fps) + 1
            i1 = max(i0, int(s["end"] * fps))
            idxs = sorted({i0, (i0 + i1) // 2, max(i0, i1 - 1)})
            box = row_box(s["y"], s["h"])
            for i in idxs:
                path = os.path.join(frames_dir, f"f_{i:05d}.jpg")
                if not os.path.exists(path):
                    continue
                for sc in SCALES:
                    jobs.append((lang, s, path, box, sc))

    log(f"verifying {len(jobs)} crops across {sum(len(segs[l]) for l in ('ja', 'zh'))} lines")
    from multiprocessing import Pool
    payload = [(lang, path, box, sc) for lang, _, path, box, sc in jobs]
    with Pool(min(workers, max(1, len(payload)))) as pool:
        for (lang, seg, _, _, _), res in zip(jobs, pool.map(_verify_worker, payload, chunksize=4)):
            if not res:
                continue
            text, conf, cands = res
            seg["votes"][text] = seg["votes"].get(text, 0.0) + 1.0 + 0.5 * conf
            seg["confmap"][text] = max(seg["confmap"].get(text, 0.0), conf)
            for c in cands:
                c = usable(c, conf)
                if not c:
                    continue
                if lang == "ja" and not looks_japanese(c):
                    continue
                if lang == "zh" and looks_japanese(c):
                    continue
                seg["votes"][c] = seg["votes"].get(c, 0.0) + 0.2
    return segs


def finalize_text(segs):
    """Pick each line's text from every reading of it.

    A tight crop that clips a glyph yields a high-confidence *fragment*
    ("答えて" -> "合えて" is really a clipped read), so readings far shorter
    than the longest reading of the same line are discarded first; among what
    remains the most confident reading wins, with the vote count as tie-break.
    """
    for lang in ("ja", "zh"):
        for s in segs[lang]:
            votes, confmap = s["votes"], s["confmap"]
            if not votes:
                continue
            longest = max(len(t.replace(" ", "")) for t in votes)
            floor = 0.75 * longest
            cands = {t: w for t, w in votes.items()
                     if len(t.replace(" ", "")) >= floor}
            text = max(cands, key=lambda t: (confmap.get(t, 0.0), cands[t], len(t)))
            s["text"] = text
            s["conf"] = confmap.get(text, s["conf"])
    return segs


def reclassify_rows(segs, frames_dir, fps):
    """A Chinese-primed read of the Japanese row has no kana, so it can slip
    into the Chinese track. Anything sitting on the Japanese row is re-read
    with the Japanese model: promoted if it really is Japanese, else dropped."""
    spans = [(s["start"], s["end"], s["y"]) for s in segs["ja"]]

    def ja_row_y(t):
        ys = sorted(y for a, b, y in spans if a - 1.5 <= t <= b + 1.5)
        return ys[len(ys) // 2] if ys else None

    kept, promoted = [], []
    for z in segs["zh"]:
        ref = ja_row_y((z["start"] + z["end"]) / 2)
        if ref is None or abs(z["y"] - ref) >= 0.06:
            kept.append(z)
            continue
        path = os.path.join(frames_dir, f"f_{int(z['start'] * fps) + 1:05d}.jpg")
        res = _verify_worker(("ja", path, row_box(z["y"], z["h"]), 4.0)) if os.path.exists(path) else None
        if res and res[1] >= 0.5 and looks_japanese(res[0]):
            z = dict(z, text=res[0], conf=res[1],
                     votes={res[0]: res[1]}, confmap={res[0]: res[1]})
            promoted.append(z)
            log(f"  row fix: promoted to Japanese -> {res[0]}")
        else:
            log(f"  row fix: dropped stray Chinese-row read '{z['text']}'")
    segs["zh"] = kept
    segs["ja"].extend(promoted)
    return segs


def merge_duplicates(segs, lang):
    """Collapse segments with the same text whose time spans touch."""
    ordered = sorted(segs, key=lambda s: s["start"])
    out = []
    for s in ordered:
        for o in out:
            if similar(o["text"], s["text"]) and s["start"] - o["end"] <= 0.5:
                o["end"] = max(o["end"], s["end"])
                if (s["conf"], len(s["text"])) > (o["conf"], len(o["text"])):
                    o["text"], o["conf"] = s["text"], s["conf"]
                break
        else:
            out.append(dict(s))
    return out


def fmt_ts(sec):
    h = int(sec // 3600)
    m = int((sec % 3600) // 60)
    s = sec % 60
    return f"{h:02d}:{m:02d}:{s:06.3f}".replace(".", ",")


def write_srt(path, segs):
    with open(path, "w", encoding="utf-8") as fh:
        for i, s in enumerate(segs, 1):
            fh.write(f"{i}\n{fmt_ts(s['start'])} --> {fmt_ts(s['end'])}\n{s['text']}\n\n")


def write_lines(path, segs, header, timed):
    with open(path, "w", encoding="utf-8") as fh:
        fh.write(header + "\n\n")
        for s in segs:
            fh.write(f"[{fmt_ts(s['start'])}] {s['text']}\n" if timed else s["text"] + "\n")
        fh.write("")


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--video", required=True)
    ap.add_argument("--out", required=True)
    ap.add_argument("--work", default=".work")
    ap.add_argument("--fps", type=float, default=4.0)
    ap.add_argument("--skip-verify", action="store_true")
    args = ap.parse_args()

    frames_dir = os.path.join(args.work, f"frames_{args.fps:g}fps")
    extract_frames(args.video, frames_dir, args.fps)
    frames = [os.path.join(frames_dir, f) for f in sorted(os.listdir(frames_dir))
              if f.endswith(".jpg")]
    log(f"{len(frames)} frames")

    pass_a = run_pass(frames, ("zh-Hans", "ja-JP"), "zh", args.work)
    pass_b = run_pass(frames, ("ja-JP", "zh-Hans"), "ja", args.work)
    merged = merge(pass_a, pass_b, args.fps)
    segs = build_segments(merged, args.fps)
    segs = dedupe_languages(segs)
    log(f"before verify: ja={len(segs['ja'])} zh={len(segs['zh'])}")
    if not args.skip_verify:
        segs = verify_segments(segs, frames_dir, args.fps)
    segs = finalize_text(segs)
    if not args.skip_verify:
        segs = reclassify_rows(segs, frames_dir, args.fps)
    segs = dedupe_languages(segs)
    for lang in ("ja", "zh"):
        segs[lang] = merge_duplicates(segs[lang], lang)
        segs[lang].sort(key=lambda s: s["start"])

    os.makedirs(args.out, exist_ok=True)
    write_srt(os.path.join(args.out, "lyrics_ja.srt"), segs["ja"])
    write_srt(os.path.join(args.out, "lyrics_zh.srt"), segs["zh"])
    write_lines(os.path.join(args.out, "歌词_日文版.txt"), segs["ja"],
                "# YOASOBI「アイドル」日文歌词\n"
                "# 由视频硬字幕 OCR 提取（macOS Vision），按演唱时间顺序", False)
    write_lines(os.path.join(args.out, "歌词_中文版.txt"), segs["zh"],
                "# YOASOBI「アイドル / 偶像」中文歌词\n"
                "# 由视频硬字幕 OCR 提取（macOS Vision），按时间顺序", False)
    write_lines(os.path.join(args.out, "歌词_中日对照.txt"),
                sorted(segs["ja"] + segs["zh"], key=lambda s: s["start"]),
                "# YOASOBI「アイドル / 偶像」中日歌词对照\n"
                "# 由视频硬字幕 OCR 提取（macOS Vision），[时间] 为该行出现时刻", True)

    log(f"ja lines: {len(segs['ja'])}, zh lines: {len(segs['zh'])}")
    low = [s for s in segs["ja"] + segs["zh"] if s["conf"] < LOW_CONF]
    log(f"lines below {LOW_CONF}: {len(low)}")
    with open(os.path.join(args.work, "lyrics.json"), "w", encoding="utf-8") as fh:
        json.dump({k: [s for s in v] for k, v in segs.items()},
                  fh, ensure_ascii=False, indent=1)


if __name__ == "__main__":
    main()
