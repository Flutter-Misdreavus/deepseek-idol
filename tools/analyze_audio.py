"""Measure the song's beat grid and write mv/src/data/beats.json.

Tempo + phase: a fixed grid is fitted by maximizing the onset envelope sampled on the grid over 0-110 s
(the song is a constant 166 BPM; 2:06-2:40 is syncopated/sparse so it is left out of the fit).
Accent: per-beat onset strength (full band + high band for crashes/snares), normalized to 0..1,
so scenes can put flashes on the real hits.
usage: python3 -I tools/analyze_audio.py
"""
import json
from pathlib import Path

import librosa
import numpy as np

ROOT = Path(__file__).resolve().parent.parent
AUDIO = ROOT / "mv/public/audio/song.mp3"
OUT = ROOT / "mv/src/data/beats.json"

y, sr = librosa.load(AUDIO, sr=22050)
duration = len(y) / sr

hop = 64
fr = sr / hop
env = librosa.onset.onset_strength(y=y, sr=sr, hop_length=hop)


def grid_score(bpm, first, a, b):
    ts = np.arange(first, b, 60 / bpm)
    idx = (ts[ts >= a] * fr).astype(int)
    return env[idx[idx < len(env)]].mean()


best = max(
    ((grid_score(b, ph, 0, 110), b, ph) for b in np.arange(165.0, 167.0, 0.02) for ph in np.arange(0, 60 / b, 0.002)),
    key=lambda x: x[0],
)
_, bpm, first = best
bpm = float(round(bpm, 2))
period = 60 / bpm
# the grid after the bridge sits ~20 ms early; split the difference
first = float(first) - 0.008
count = int((duration - first) // period) + 1

# accents: max onset within +-40 ms of each beat, full band and >4 kHz
S = np.abs(librosa.stft(y, n_fft=1024, hop_length=hop))
f = librosa.fft_frequencies(sr=sr, n_fft=1024)
hi = np.log1p(S[f > 4000].sum(0))
hi = np.maximum(0, np.diff(hi, prepend=hi[0]))
w = int(0.04 * fr)


def per_beat(x):
    v = np.array([x[max(0, int((first + i * period) * fr) - w):int((first + i * period) * fr) + w + 1].max(initial=0)
                  for i in range(count)])
    return v / np.percentile(v, 98)


accent = np.clip(0.6 * per_beat(env) + 0.4 * per_beat(hi), 0, 1)

data = {
    "source": AUDIO.name,
    "duration": round(duration, 3),
    "bpm": bpm,
    "period": period,
    "firstBeat": round(first, 4),
    "beatCount": count,
    "accent": [round(float(a), 2) for a in accent],
}
OUT.parent.mkdir(parents=True, exist_ok=True)
OUT.write_text(json.dumps(data))
print({k: v for k, v in data.items() if k != "accent"})
