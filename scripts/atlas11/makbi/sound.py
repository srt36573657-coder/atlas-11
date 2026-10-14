# 홍표 소개 영상 소리(35초 · 장착 · 홍표 세 번) — 배경 음악(영웅풍 전자음 · 120박) + 효과음 · 화면 때(video.mjs)와 같은 때에 맞춤
#   모두 계산으로 만듦(녹음 · 남의 음악 · 목소리 없음) · 35초 · 44.1kHz 두 귀 · 끝 −1dB 아래로 맞춤
import sys, wave
import numpy as np
from scipy.signal import butter, lfilter

SR = 44100
DUR = 35.0
N = int(SR * DUR)
L = np.zeros(N)
Rr = np.zeros(N)
rng = np.random.default_rng(20261014)


def mf(m):
    return 440.0 * 2 ** ((m - 69) / 12)


def tt(d):
    return np.arange(int(SR * d)) / SR


def add(sig, t0, gain=1.0, pan=0.0):
    i = int(t0 * SR)
    if i >= N:
        return
    sig = sig[: N - i]
    gl, gr = gain * np.sqrt((1 - pan) / 2), gain * np.sqrt((1 + pan) / 2)
    L[i:i + len(sig)] += sig * gl
    Rr[i:i + len(sig)] += sig * gr


def lp(x, fc, o=2):
    b, a = butter(o, min(fc, SR / 2 - 100) / (SR / 2), 'low')
    return lfilter(b, a, x)


def hp(x, fc, o=2):
    b, a = butter(o, fc / (SR / 2), 'high')
    return lfilter(b, a, x)


def bp(x, f1, f2, o=2):
    b, a = butter(o, [f1 / (SR / 2), f2 / (SR / 2)], 'band')
    return lfilter(b, a, x)


def env(n, a=0.005, r=0.2, sus=None):
    t = np.arange(n) / SR
    e = np.minimum(1, t / max(a, 1e-4))
    if sus is None:
        e *= np.exp(-np.maximum(0, t - a) / max(r, 1e-4))
    else:
        rel = np.clip((t - (n / SR - r)) / r, 0, 1)
        e *= (1 - rel)
    return e


def saw(f, t, det=0.0):
    ph = (f * (1 + det)) * t
    return 2 * (ph - np.floor(ph + 0.5))


def sq(f, t):
    return np.sign(np.sin(2 * np.pi * f * t))


def sweep(f0, f1, d, kind='sin'):
    t = tt(d)
    f = f0 * (f1 / f0) ** (t / d)
    ph = 2 * np.pi * np.cumsum(f) / SR
    return np.sin(ph) if kind == 'sin' else np.sign(np.sin(ph))


# ── 배경 음악 ──
def nt(e):  # 1판 때 → 2판 때(처음 6.5초가 새 장면 · 2장면은 3초로 줄임)
    return e + 2.5 if e >= 7 else 6.5 + (e - 3.5) * (3 / 3.5)


CH = [(0, 3.6, [50, 53, 57]), (3.6, 5.6, [50, 53, 57]), (5.6, 7.6, [46, 50, 53]), (7.6, 9.6, [53, 57, 60]), (9.6, 11.6, [48, 52, 55]),
      (11.6, 13.6, [50, 53, 57]), (13.6, 15.6, [46, 50, 53]), (15.6, 16.5, [48, 52, 55]), (16.5, 18.0, [43, 46, 50]), (18.0, 19.5, [45, 49, 52]),
      (19.5, 21.5, [46, 50, 53]), (21.5, 23.5, [48, 52, 55]), (23.5, 25.5, [50, 53, 57]), (25.5, 27.5, [46, 50, 53]), (27.5, 29.5, [53, 57, 60]),
      (29.5, 31.98, [48, 52, 55]), (31.98, 35.0, [53, 57, 60, 65])]


def dyn(t):  # 장면마다 음악 세기
    if t < 0.4: return 0.0
    if t < 3.6: return 0.3 + 0.2 * (t - 0.4) / 3.2
    if 16.5 <= t < 19.5: return 0.6
    return 1.0


for a, b, notes in CH:
    d = b - a
    t = tt(d)
    pad = np.zeros_like(t)
    for m in notes:
        for det in (-0.006, 0.0, 0.007):
            pad += saw(mf(m + 12), t, det)
    pad = lp(pad, 1800 if a < 31.9 else 2600) / (3 * len(notes))
    pe = np.minimum(1, t / 0.25) * np.minimum(1, (d - t) / 0.12 + 0.0001)
    g = 0.16 * dyn(a + 0.1) * (1.35 if a >= 31.9 else 1.0)
    if a >= 31.9:
        pe *= np.exp(-t / 2.2)
    add(pad * pe, a, g, -0.25)
    add(pad * pe, a + 0.012, g, 0.25)
    # 낮은 소리(8분 박 펄스)
    root = mf(notes[0] - 12)
    if a >= 3.6 and a < 31.9:
        for k in range(int(round(d / 0.25))):
            st = a + k * 0.25
            n = int(0.22 * SR)
            tb = np.arange(n) / SR
            s = lp(saw(root, tb) * 0.7 + sq(root, tb) * 0.3, 600) * env(n, 0.003, 0.09)
            add(s, st, 0.28 * dyn(st), 0)
    # 반짝 아르페지오(16분)
    if (9.5 <= a < 16.5) or (23.5 <= a < 31.9):
        seq = [notes[0] + 24, notes[1] + 24, notes[2] + 24, notes[1] + 24]
        for k in range(int(round(d / 0.125))):
            st = a + k * 0.125
            n = int(0.11 * SR)
            tb = np.arange(n) / SR
            s = lp(sq(mf(seq[k % 4]), tb), 3500) * env(n, 0.002, 0.045)
            add(s, st, 0.06, 0.45 if k % 2 else -0.45)

# 북 — 큰북(박) · 작은북(2 · 4박) · 하이햇(8분)
def kick():
    n = int(0.35 * SR); t = np.arange(n) / SR
    f = 52 + 120 * np.exp(-t / 0.045)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / 0.16)


def snare():
    n = int(0.25 * SR); t = np.arange(n) / SR
    return (hp(rng.standard_normal(n), 1200) * 0.6 + np.sin(2 * np.pi * 190 * t) * 0.5) * np.exp(-t / 0.07)


def hat():
    n = int(0.06 * SR); t = np.arange(n) / SR
    return hp(rng.standard_normal(n), 7000) * np.exp(-t / 0.018)


K, S_, HH = kick(), snare(), hat()
b = 3.6
while b < 31.9:
    half = 16.5 <= b < 19.5
    rel = b - 3.6
    if not half or abs((rel % 1.0)) < 1e-6:
        add(K, b, 0.55 if not half else 0.35)
    if (6.6 <= b < 16.5 or 19.5 <= b < 31.9) and abs((rel % 1.0) - 0.5) < 1e-6:
        add(S_, b, 0.32)
    for h8 in (0, 0.25):
        add(HH, b + h8, 0.07 if not half else 0.035, 0.3)
    b = round(b + 0.5, 6)
for k in range(9):
    add(S_, 23.5 + k * 0.05, 0.12 + 0.03 * k)

# ── 효과음 ──
def boom(d=1.4):
    n = int(d * SR); t = np.arange(n) / SR
    f = 34 + 80 * np.exp(-t / 0.12)
    s = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / 0.5)
    s += lp(rng.standard_normal(n), 900) * np.exp(-t / 0.18) * 0.6
    return s


def whoosh(d=0.6, f0=300, f1=3000, up=True):
    n = int(d * SR); t = np.arange(n) / SR
    x = rng.standard_normal(n)
    u = np.arange(n) / n
    fc = f0 * (f1 / f0) ** (u if up else 1 - u)
    al = 1 - np.exp(-2 * np.pi * fc / SR)
    y = np.empty(n); z = 0.0
    for i in range(n):
        z += al[i] * (x[i] - z); y[i] = z
    y = hp(y, 150)
    return y / (np.max(np.abs(y)) + 1e-9) * np.sin(np.pi * np.minimum(1, t / d)) ** 1.5


def blip(f, d=0.08, kind='sin'):
    n = int(d * SR); t = np.arange(n) / SR
    o = np.sin(2 * np.pi * f * t) if kind == 'sin' else lp(sq(f, t), 4000)
    return o * env(n, 0.002, d / 3)


def chime(fs, d=1.2):
    n = int(d * SR); t = np.arange(n) / SR
    s = np.zeros(n)
    for i, f in enumerate(fs):
        s += (np.sin(2 * np.pi * f * t) + 0.3 * np.sin(2 * np.pi * f * 2.01 * t)) * np.exp(-t / (0.35 + 0.1 * i))
    return s / len(fs)


def chirp():  # 짹 — 새소리
    out = []
    for f0, f1, d in ((2600, 4200, 0.05), (4200, 2800, 0.06), (3000, 4600, 0.05)):
        out.append(sweep(f0, f1, d) * np.hanning(int(d * SR)))
        out.append(np.zeros(int(0.015 * SR)))
    return np.concatenate(out)


def riser(d, f0=200, f1=1800):
    n = int(d * SR); t = np.arange(n) / SR
    tone = sweep(f0, f1, d) * 0.4
    nz = hp(rng.standard_normal(n), 2000) * (t / d) ** 2 * 0.6
    return (tone + nz) * (t / d) ** 1.5


def rumble(d):
    n = int(d * SR); t = np.arange(n) / SR
    return lp(rng.standard_normal(n), 300) * (0.6 + 0.4 * np.sin(2 * np.pi * 9 * t))


# 처음 장면 — 출동 준비 · 장착 · 날아오름 · 내려앉기 · 홍표 세 번
def clank():
    n = int(.35 * SR); t = np.arange(n) / SR
    s = sum(np.sin(2 * np.pi * f * t) * np.exp(-t / d) for f, d in ((1850, .09), (2960, .06), (4410, .04), (620, .12)))
    s += hp(rng.standard_normal(n), 3000) * np.exp(-t / .02) * 1.2
    return s / 3


def squawk(shift=0):  # 「홍표!」 — 두 마디 앵무새 소리(사람 목소리 아님)
    def syl(f0, f1, f2, d):
        n = int(d * SR); t = np.arange(n) / SR
        f = np.interp(t, [0, d * .5, d], [f0, f1, f2]) * (2 ** (shift / 12))
        ph = 2 * np.pi * np.cumsum(f) / SR
        x = np.sin(ph) + .45 * np.sin(2 * ph) + .25 * np.sin(3 * ph)
        x *= 1 + .35 * np.sin(2 * np.pi * 38 * t)
        x += .25 * bp(rng.standard_normal(n), 1500, 5000)
        return x * np.hanning(n)
    return np.concatenate([syl(1300, 1700, 1500, .13), np.zeros(int(.03 * SR)), syl(2000, 2600, 1800, .17)])


add(sweep(220, 900, 0.5) * env(int(0.5 * SR), 0.05, 0.3, sus=True), 0.05, 0.18)
for k in range(9): add(blip(2400, 0.02, 'sq'), 0.15 + k * 0.07, 0.05)
nn0 = int(2.2 * SR); t0 = np.arange(nn0) / SR
add((np.sin(2 * np.pi * 110 * t0) + .5 * np.sin(2 * np.pi * 220 * t0)) * (0.6 + 0.4 * np.sin(2 * np.pi * 5 * t0)) * np.minimum(1, t0 / .4) * np.minimum(1, (2.2 - t0) / .3), 0.45, 0.1)
add(clank(), 1.0, 0.32, -0.3); add(clank(), 1.03, 0.28, 0.3)
add(clank(), 1.4, 0.3, -0.6); add(clank(), 1.43, 0.3, 0.6)
add(clank(), 1.8, 0.36)
add(chime([mf(74), mf(78), mf(81), mf(86)], 1.2), 1.95, 0.26)
add(riser(0.35, 300, 1400), 2.25, 0.25)
add(rumble(0.5), 2.6, 0.45); add(whoosh(0.4, 400, 4000), 2.6, 0.3)
add(boom(0.8) * 0.5, 2.92, 0.5); add(whoosh(0.4, 3000, 500, up=False), 2.92, 0.2)
add(riser(0.6, 200, 1800), 3.0, 0.3); add(rumble(0.6), 3.0, 0.35)
add(boom(1.5), 3.58, 0.95)
add(whoosh(0.7, 2500, 300, up=False), 3.62, 0.25)
add(sweep(600, 1400, 0.3) * env(int(0.3 * SR), 0.01, 0.12), 4.1, 0.12)
for i, a5 in enumerate((4.5, 5.0, 5.5)):
    add(blip(988 + 200 * i, 0.08), a5, 0.12)
    add(squawk(i * 2), a5 + 0.02, 0.32, (-0.4, 0.4, 0.0)[i])
# 2장면 뒤 — 1판 효과음 때를 2판 때로 옮겨 붙임(add 를 잠시 감쌈)
_add0 = add


def add(sig, t0, gain=1.0, pan=0.0):
    _add0(sig, nt(t0), gain, pan)


# 2장면
for k in range(3): add(blip(1800 + 200 * k, 0.05, 'sq'), 3.7 + k * 0.06, 0.08, -0.3)
add(blip(988, 0.09), 4.6, 0.16, 0.3)
add(sweep(300, 900, 0.25) * env(int(0.25 * SR), 0.01, 0.1), 5.75, 0.2)
# 3장면
add(sweep(1400, 500, 0.22) * env(int(0.22 * SR), 0.005, 0.08), 7.0, 0.16); add(blip(2400, 0.04, 'sq'), 7.2, 0.1)
add(whoosh(0.5, 400, 3000), 7.28, 0.22, 0.4)
add(whoosh(0.45, 400, 2500), 9.28, 0.15, -0.4)
nn = int(1.05 * SR); tl = np.arange(nn) / SR
add(np.sin(2 * np.pi * np.cumsum(500 + 700 * tl / 1.05 + 30 * np.sin(2 * np.pi * 7 * tl)) / SR) * env(nn, 0.05, 0.1, sus=True), 9.55, 0.07)
for k in range(3): add(blip(2093, 0.06), 10.62 + k * 0.1, 0.16)
add(whoosh(0.3, 3000, 600, up=False), 11.6, 0.14)
steps = [62, 64, 67, 69, 72, 74, 76]
for j in range(7):
    add(blip(mf(steps[j] + 12), 0.14), 11.8 + j * 0.3, 0.16, -0.6 + j * 0.2)
    add(lp(rng.standard_normal(int(0.2 * SR)), 1200) * env(int(0.2 * SR), 0.005, 0.07), 11.8 + j * 0.3, 0.18)
add(chime([1568, 1976, 2349], 1.0), 13.6, 0.25)
# 4장면
add(chime([2637, 3136, 3520, 4186], 1.0) * np.linspace(1, 0.4, int(1.0 * SR)), 14.1, 0.12)
for k in range(8): add(blip(1500, 0.03, 'sq'), 14.8 + k * 0.1, 0.06)
nb = int(0.5 * SR); tb2 = np.arange(nb) / SR
add(lp(sq(110, tb2) + sq(116, tb2), 1500) * env(nb, 0.01, 0.1, sus=True) * 0.5, 15.45, 0.16)
add(chime([1760, 1318, 988, 659], 1.0), 16.1, 0.16)
add(whoosh(0.6, 3000, 800, up=False), 16.1, 0.1)
# 5장면 — 하나씩 셈
cnt = [60, 62, 64, 65, 67, 69, 71, 72, 74, 76]
for i in range(10):
    t0 = 17.35 + i * 0.24 if i < 8 else 21.1 + (i - 8) * 0.2
    add(blip(mf(cnt[i] + 12), 0.1), t0, 0.17, -0.5 + i * 0.1)
add(sweep(400, 1100, 0.18) * env(int(0.18 * SR), 0.005, 0.06), 19.95, 0.2)
add(whoosh(0.5, 500, 4000), 20.95, 0.22)
add(chime([mf(74), mf(78), mf(81), mf(86)], 1.4), 21.45, 0.3)
add(hp(rng.standard_normal(int(1.5 * SR)), 5000) * np.exp(-np.arange(int(1.5 * SR)) / SR / 0.5), 21.45, 0.12)
# 6장면
add(riser(0.5, 800, 3000), 22.45, 0.15)
add(chime([2093, 2637, 3136], 1.2), 22.85, 0.28)
add(blip(4186, 0.25), 23.1, 0.08)
add(whoosh(0.35, 600, 2000), 24.15, 0.12, 0.5)
for k in range(5):
    add(blip(880 if k % 2 == 0 else 660, 0.12, 'sq'), 24.6 + k * 0.2, 0.09)
add(sweep(300, 1000, 0.2) * env(int(0.2 * SR), 0.005, 0.07), 24.68, 0.2)
add(whoosh(0.5, 300, 2500), 25.5, 0.2)
add(chime([mf(69), mf(74), mf(78)], 1.0), 25.7, 0.25)
# 7장면
for k in range(3): add(chime([mf(81 + k * 2), mf(86 + k * 2)], 0.5), 26.75 + k * 0.6, 0.2)
add(chime([1568, 2093], 0.8), 28.15, 0.18)
add(riser(0.5, 200, 2500), 29.0, 0.4)
add(rumble(0.6), 29.0, 0.4)
add(boom(2.0), 29.48, 0.9)
add(hp(rng.standard_normal(int(2.5 * SR)), 4500) * np.exp(-np.arange(int(2.5 * SR)) / SR / 0.9), 29.48, 0.16)
add(chime([mf(65), mf(69), mf(72), mf(77)], 2.4), 29.5, 0.28)
add(chirp(), 30.45, 0.25, -0.2)
add(chirp(), 30.75, 0.18, 0.2)

add = _add0

# 끝 — 서서히 줄임 · 부드럽게 눌러 −1dB 아래
fo = np.ones(N); k0 = int(33.3 * SR); fo[k0:] = np.linspace(1, 0, N - k0) ** 1.5
L *= fo; Rr *= fo
mix = np.stack([L, Rr], 1)
mix = np.tanh(mix * 1.6) / np.tanh(1.6)
mix *= 0.89 / np.max(np.abs(mix))
out = sys.argv[1] if len(sys.argv) > 1 else 'hongpyo.wav'
with wave.open(out, 'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes((mix * 32767).astype('<i2').tobytes())
print('wav', out, round(DUR, 1), 's', 'peak', round(float(np.max(np.abs(mix))), 3))
