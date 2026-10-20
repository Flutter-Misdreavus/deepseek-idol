"""Final QC for the rendered MV: stream specs, A/V offset against the source song, blank and one-frame-flash frames.
usage: python3 -I tools/qc.py <video.mp4> <source_audio>
"""
import json
import subprocess
import sys

import numpy as np

video, song = sys.argv[1], sys.argv[2]

# --- stream specs
info = json.loads(subprocess.run(
    ["ffprobe", "-v", "error", "-show_streams", "-show_format", "-of", "json", video],
    capture_output=True, check=True).stdout)
for s in info["streams"]:
    keys = ["codec_type", "codec_name", "profile", "width", "height", "r_frame_rate", "nb_frames", "pix_fmt",
            "color_space", "color_primaries", "color_transfer", "sample_rate", "channels", "bit_rate", "start_time", "duration"]
    print({k: s[k] for k in keys if k in s})
print("format duration", info["format"]["duration"], "title", info["format"].get("tags", {}).get("title"))


# --- A/V offset: cross-correlate the rendered audio with the source song (mono, 4 kHz, first 60 s)
def pcm(path):
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", path, "-t", "60", "-ac", "1", "-ar", "4000", "-f", "f32le", "-"],
                         capture_output=True, check=True).stdout
    return np.frombuffer(raw, np.float32)


a, b = pcm(video), pcm(song)
n = min(len(a), len(b))
a, b = a[:n] - a[:n].mean(), b[:n] - b[:n].mean()
size = 1 << int(np.ceil(np.log2(2 * n)))
xc = np.fft.irfft(np.fft.rfft(a, size) * np.conj(np.fft.rfft(b, size)), size)
lag = int(np.argmax(np.concatenate([xc[-4000:], xc[:4001]]))) - 4000
print(f"audio offset vs source: {lag / 4000 * 1000:+.2f} ms (positive = rendered audio late)")

# --- per-frame luminance: blank frames and isolated one-frame spikes
W, H = 64, 36
raw = subprocess.run(["ffmpeg", "-v", "error", "-i", video, "-vf", f"scale={W}:{H}", "-f", "rawvideo", "-pix_fmt", "gray", "-"],
                     capture_output=True, check=True).stdout
frames = np.frombuffer(raw, np.uint8).reshape(-1, H, W).astype(np.float32)
m = frames.mean(axis=(1, 2))
print("decoded frames", len(m))
print("near-black frames (mean<12):", [int(i) for i in np.where(m < 12)[0]])
print("near-white frames (mean>245):", [int(i) for i in np.where(m > 245)[0]])
d = np.abs(np.diff(frames, axis=0)).mean(axis=(1, 2))
spikes = [i for i in range(1, len(d)) if d[i - 1] > 40 and d[i] > 40 and np.abs(frames[i - 1] - frames[i + 1]).mean() < 15]
print("one-frame flashes (frame differs from both neighbours, neighbours alike):", spikes)
