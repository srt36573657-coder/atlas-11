# 보드리 소개 영상 소리(1분) — 배경 음악(120박 · 한 마디 2초) + 효과음 · 화면 때(video.mjs)와 같은 때에 맞춤(곧은 시계 하나)
#   모두 계산으로 만듦(녹음 · 남의 음악 · 목소리 없음) · 60초 · 44.1kHz 두 귀 · 끝 −1dB 아래로 맞춤 · 옛 35초 판은 git d4b4bed3
#   HP_NEWS=1 → 7단 「뉴스 · 공시」 소리(신문 펄럭 · 도장) · HP_FR = 친구 수(셈 소리 수)
import os, sys, wave
import numpy as np
from scipy.signal import butter, lfilter

SR = 44100
DUR = 60.0
N = int(SR * DUR)
L = np.zeros(N)
Rr = np.zeros(N)
rng = np.random.default_rng(20261016)
NEWS = os.environ.get('HP_NEWS') == '1'
FR = int(os.environ.get('HP_FR', '3'))


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


# ── 효과음 조각 ──
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


def clank():  # 철컥
    n = int(.35 * SR); t = np.arange(n) / SR
    s = sum(np.sin(2 * np.pi * f * t) * np.exp(-t / d) for f, d in ((1850, .09), (2960, .06), (4410, .04), (620, .12)))
    s += hp(rng.standard_normal(n), 3000) * np.exp(-t / .02) * 1.2
    return s / 3


def syl(f0, f1, f2, d, shift=0):  # 앵무새 소리 한 마디(사람 목소리 아님)
    n = int(d * SR); t = np.arange(n) / SR
    f = np.interp(t, [0, d * .5, d], [f0, f1, f2]) * (2 ** (shift / 12))
    ph = 2 * np.pi * np.cumsum(f) / SR
    x = np.sin(ph) + .45 * np.sin(2 * ph) + .25 * np.sin(3 * ph)
    x *= 1 + .35 * np.sin(2 * np.pi * 38 * t)
    x += .25 * bp(rng.standard_normal(n), 1500, 5000)
    return x * np.hanning(n)


def squawk(n=2, shift=0):  # 「보-드-리!」 = 세 마디 · 따라 하기 = 두 마디
    shapes = [(1300, 1700, 1500, .12), (1700, 2200, 1900, .12), (2000, 2700, 1800, .18), (2200, 2900, 2000, .2)]
    out = []
    for i in range(n):
        out.append(syl(*shapes[min(i, 3)], shift=shift + i * 1.5)); out.append(np.zeros(int(.025 * SR)))
    return np.concatenate(out)


def rustle(d=0.14):  # 종이 사각
    n = int(d * SR); t = np.arange(n) / SR
    return bp(rng.standard_normal(n), 2500, 9000) * (0.5 + 0.5 * np.abs(np.sin(2 * np.pi * 37 * t))) * np.hanning(n)


def flip(d=0.28):  # 종이 넘김
    n = int(d * SR); t = np.arange(n) / SR
    return bp(rng.standard_normal(n), 900, 6000) * np.sin(np.pi * t / d) ** 2 * (1 + np.sin(2 * np.pi * 14 * t)) / 2


def stamp():  # 도장 쾅
    n = int(.4 * SR); t = np.arange(n) / SR
    return (np.sin(2 * np.pi * 85 * t) * np.exp(-t / .08) + lp(rng.standard_normal(n), 2500) * np.exp(-t / .025) * .8)


def scratch(d=0.6):  # 펜 긋기
    n = int(d * SR); t = np.arange(n) / SR
    return bp(rng.standard_normal(n), 2500, 7000) * (0.6 + 0.4 * rng.random(n) ** 3) * np.sin(np.pi * t / d) ** .5 * .5


def puff():  # 발 불꽃 퍽
    n = int(.22 * SR); t = np.arange(n) / SR
    return lp(rng.standard_normal(n), 1400) * np.exp(-t / .05)


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


# ── 배경 음악 — Dm · B♭ · F · C 를 두 초마다(옛 판과 같은 줄기) · 끝 화음 F ──
PROG = [[50, 53, 57], [46, 50, 53], [53, 57, 60], [48, 52, 55]]


def dyn(t):  # 장면마다 세기
    if t < 1.6: return 0.25 + 0.35 * t / 1.6
    if 12 <= t < 16: return 0.55
    if 16 <= t < 28.5: return 1.1
    if 38 <= t < 41: return 0.45
    return 0.9


def section(t):  # 북 · 낮은 소리 · 반짝이가 있는 곳
    if t < 3.0 or t >= 54.0: return 'none'
    if 12 <= t < 16: return 'calm'
    if 38 <= t < 41: return 'breath'
    return 'full'


bar = 0.0
k = 0
while bar < 54.0:
    a, b = bar, min(bar + 2.0, 54.0)
    notes = PROG[k % 4]
    d = b - a; t = tt(d)
    pad = np.zeros_like(t)
    for m in notes:
        for det in (-0.006, 0.0, 0.007):
            pad += saw(mf(m + 12), t, det)
    pad = lp(pad, 1700 if a < 16 else 2300) / (3 * len(notes))
    pe = np.minimum(1, t / 0.25) * np.minimum(1, (d - t) / 0.12 + 0.0001)
    g = 0.15 * dyn(a + 0.1)
    add(pad * pe, a, g, -0.25); add(pad * pe, a + 0.012, g, 0.25)
    sec = section(a + 0.01)
    root = mf(notes[0] - 12)
    if sec in ('full', 'calm'):  # 낮은 소리(8분 박)
        step = 0.25 if sec == 'full' else 0.5
        for j in range(int(round(d / step))):
            st = a + j * step; n = int(0.22 * SR); tb = np.arange(n) / SR
            add(lp(saw(root, tb) * 0.7 + sq(root, tb) * 0.3, 600) * env(n, 0.003, 0.09), st, 0.27 * dyn(st), 0)
    if (16 <= a < 28.5) or (41 <= a < 54):  # 반짝 아르페지오(16분)
        seq = [notes[0] + 24, notes[1] + 24, notes[2] + 24, notes[1] + 24]
        for j in range(int(round(d / 0.125))):
            st = a + j * 0.125; n = int(0.11 * SR); tb = np.arange(n) / SR
            add(lp(sq(mf(seq[j % 4]), tb), 3500) * env(n, 0.002, 0.045), st, 0.055, 0.45 if j % 2 else -0.45)
    if 12 <= a < 16:  # 오르골(8분 · 높게)
        seq = [notes[0] + 36, notes[2] + 24, notes[1] + 36, notes[2] + 24]
        for j in range(int(round(d / 0.25))):
            st = a + j * 0.25; n = int(0.5 * SR); tb = np.arange(n) / SR
            add((np.sin(2 * np.pi * mf(seq[j % 4]) * tb) + .3 * np.sin(4 * np.pi * mf(seq[j % 4]) * tb)) * np.exp(-tb / .18), st, 0.05, -0.3 if j % 2 else 0.3)
    bar = round(bar + 2.0, 6); k += 1

K, S_, HH = kick(), snare(), hat()
bt = 3.0
while bt < 54.0:
    sec = section(bt); rel = bt - 3.0
    on_bar = abs(rel % 2.0) < 1e-6
    if sec == 'full' or (sec == 'calm' and on_bar):
        add(K, bt, 0.55 if sec == 'full' else 0.4)
    if sec == 'full' and bt >= 6.0 and abs((rel % 1.0) - 0.5) < 1e-6:
        add(S_, bt, 0.3)
    if sec != 'none':
        for h8 in (0, 0.25):
            add(HH, bt + h8, 0.065 if sec != 'breath' else 0.05, 0.3)
    bt = round(bt + 0.5, 6)
for j in range(10):  # 계단 앞 작은북 몰아치기
    add(S_, 31.0 + j * 0.05, 0.1 + 0.025 * j)

# ── 효과음 — 장면 때 ──
# 1 별똥별 · 쾅
add(riser(0.9, 300, 2400), 0.05, 0.16)
add(whoosh(0.7, 600, 5000), 0.12, 0.28, 0.7); add(whoosh(0.5, 4000, 900, up=False), 0.55, 0.22, -0.7)
add(sweep(500, 2600, 0.55) * env(int(0.55 * SR), 0.05, 0.1, sus=True), 0.9, 0.16)
add(whoosh(0.55, 300, 4500), 0.92, 0.3)
add(boom(1.6), 1.45, 1.0); add(rumble(0.9), 1.45, 0.4)
add(hp(rng.standard_normal(int(1.2 * SR)), 4500) * np.exp(-np.arange(int(1.2 * SR)) / SR / 0.4), 1.45, 0.12)
for j in range(6): add(blip(2093 + 120 * j, 0.05, 'sq'), 1.75 + j * 0.17, 0.06, -0.5 + 0.2 * j)
# 2 반짝 점검 · 「보드리!」 셋
add(hp(rng.standard_normal(int(.08 * SR)), 3000) * np.exp(-np.arange(int(.08 * SR)) / SR / .02), 3.0, 0.3)
add(sweep(600, 1500, 0.3) * env(int(0.3 * SR), 0.01, 0.12), 3.02, 0.12)
add(chime([2637, 3136], 0.6), 3.2, 0.12); add(puff(), 3.4, 0.25)
for i, a5 in enumerate((3.5, 4.0, 4.5)):
    add(blip(988 + 200 * i, 0.08), a5, 0.1)
    add(squawk(3, i * 2), a5 + 0.02, 0.34, (-0.4, 0.4, 0.0)[i])
# 3 따라쟁이 · 「기록 없음」
for j in range(3): add(blip(1800 + 200 * j, 0.05, 'sq'), 6.15 + j * 0.06, 0.07, -0.3)
add(squawk(2, 0), 6.88, 0.3, 0.3); add(squawk(2, 1), 7.3, 0.26, 0.3)
add(stamp(), 8.1, 0.55); add(blip(1760, 0.06, 'sq'), 8.25, 0.08); add(blip(2093, 0.06, 'sq'), 8.33, 0.08)
# 4 지난 한 달 — 선 · 「오늘」에 딩 · 붓
for j in range(2): add(blip(1600 + 300 * j, 0.05, 'sq'), 9.0 + j * 0.07, 0.07, 0.4)
add(chirp(), 9.62, 0.24, -0.2)
nn = int(1.2 * SR); tl = np.arange(nn) / SR
add(np.sin(2 * np.pi * np.cumsum(420 + 600 * tl / 1.2 + 25 * np.sin(2 * np.pi * 7 * tl)) / SR) * env(nn, 0.05, 0.1, sus=True), 9.8, 0.06)
add(chime([1568, 2349], 1.0), 11.0, 0.22)
add(whoosh(0.8, 3500, 300, up=False), 11.58, 0.3)
# 5 편지
add(whoosh(0.5, 500, 3000), 12.05, 0.18, 0.5)
add(chime([mf(81), mf(88)], 0.9), 12.6, 0.22)
for j in range(3): add(rustle(), 12.72 + j * 0.13, 0.22, -0.2 + 0.2 * j)
for i in range(10): add(blip(mf(72 + [0, 2, 4, 5, 7, 9, 11, 12, 14, 16][i]), 0.12), 13.2 + i * 0.25, 0.1, -0.4 + 0.08 * i)
add(squawk(3, 3), 15.02, 0.28, 0.2)
# 6 다섯 탭
add(whoosh(0.5, 300, 2500), 16.0, 0.22)
add(scratch(0.9), 16.4, 0.12, -0.3); add(scratch(0.9), 16.6, 0.1, 0.3)
for sw in (18.5, 21.0, 23.5, 26.0):
    add(puff(), sw - 0.45, 0.2); add(blip(1318, 0.06), sw - 0.02, 0.14)
add(whoosh(0.4, 600, 3000), 18.6, 0.15)
for j in range(5): add(blip(2400, 0.03, 'sq'), 19.6 + j * 0.15, 0.08)
nr = int(1.15 * SR); tr = np.arange(nr) / SR
add(lp(sq(28 + 16 * tr, tr), 3000) * 0.3 * env(nr, 0.01, 0.1, sus=True), 21.05, 0.12)
for j in range(3): add(clank(), 21.6 + j * 0.3, 0.3, -0.5 + 0.5 * j)
for j in range(12): add(blip(2600 - j * 120, 0.04), 22.3 + j * 0.06, 0.06)
add(chime([2093, 2637], 0.6), 23.0, 0.14)
for j in range(5): add(blip(1047 + 150 * j, 0.06, 'sq'), 23.6 + j * 0.2, 0.07, -0.5 + 0.25 * j)
add(sweep(400, 1600, 1.2) * env(int(1.2 * SR), 0.05, 0.2, sus=True), 24.0, 0.07)
for j in range(4): add(chime([mf(84 + j * 2)], 0.5), 24.35 + j * 0.25, 0.14)
for j in range(3):
    add(flip(), 26.1 + j * 0.35, 0.2, -0.3 + 0.3 * j); add(blip(1760, 0.05), 26.5 + j * 0.35, 0.1)
# 7 회사 모두 — 빨라지는 틱 · 딩동
tk = 28.6
while tk < 30.45:
    add(blip(3000, 0.02, 'sq'), tk, 0.05); tk += max(0.035, 0.16 * (1 - (tk - 28.6) / 1.9))
add(whoosh(0.4, 3000, 600, up=False), 28.5, 0.15)
add(chime([mf(76), mf(81), mf(84)], 1.4), 30.5, 0.3); add(chime([mf(72), mf(76), mf(81)], 1.2), 30.75, 0.2)
# 8 일곱 계단
add(whoosh(0.4, 400, 2500), 31.5, 0.18)
steps = [62, 64, 66, 67, 69, 71, 74]
for j in range(7):
    add(blip(mf(steps[j] + 12), 0.16), 31.9 + j * 0.45, 0.17, -0.6 + 0.2 * j); add(puff(), 31.9 + j * 0.45 - 0.42, 0.14)
add(chime([1568, 1976, 2349, 3136], 1.2), 34.6, 0.28)
for j in range(7): add(blip(1200 + 90 * j, 0.04), 35.1 + j * 0.18, 0.06)
if NEWS:
    add(flip(0.4), 36.4, 0.3, 0.5); add(stamp(), 37.0, 0.5); add(chirp(), 37.4, 0.2)
else:
    add(chime([mf(79), mf(83), mf(86)], 1.0), 36.6, 0.2); add(chirp(), 36.7, 0.22, 0.3)
# 9 영어로도
add(whoosh(0.45, 500, 3500), 38.1, 0.2); add(sweep(700, 1500, 0.3) * env(int(0.3 * SR), 0.01, 0.1), 38.9, 0.12)
for j in range(2): add(blip(1500 + 300 * j, 0.06, 'sq'), 39.4 + j * 0.08, 0.08, -0.4)
add(squawk(2, 4), 40.02, 0.3, 0.4)
# 10 친구 셋 — 벌써 끝?
add(whoosh(0.8, 3500, 300, up=False), 40.58, 0.3)
for i in range(FR): add(blip(mf(72 + [0, 4, 7, 12, 16][min(i, 4)]), 0.14), 41.5 + i * 0.6, 0.2, -0.4 + 0.4 * i)
add(sweep(400, 1300, 0.22) * env(int(0.22 * SR), 0.005, 0.07), 43.1, 0.22)
add(chime([mf(74), mf(78), mf(81), mf(86)], 1.3), 43.35, 0.3)
add(hp(rng.standard_normal(int(1.2 * SR)), 5000) * np.exp(-np.arange(int(1.2 * SR)) / SR / 0.45), 43.35, 0.1)
# 11 상품권 · 커피 · 네 거
add(riser(0.45, 800, 3000), 44.45, 0.15)
add(chime([2093, 2637, 3136], 1.2), 44.85, 0.28); add(blip(4186, 0.25), 45.1, 0.07)
add(whoosh(0.35, 600, 2000), 46.25, 0.12, 0.5)
for j in range(6): add(blip(880 if j % 2 == 0 else 660, 0.12, 'sq'), 46.6 + j * 0.25, 0.08)
add(sweep(300, 1000, 0.2) * env(int(0.2 * SR), 0.005, 0.07), 46.68, 0.18)
add(whoosh(0.5, 300, 2500), 48.25, 0.2)
add(chime([mf(69), mf(74), mf(78)], 1.0), 48.4, 0.24)
# 12 받는 법
for j in range(3): add(chime([mf(81 + j * 2), mf(86 + j * 2)], 0.5), 50.0 + j * 0.7, 0.2)
add(chime([1568, 2093], 0.8), 52.0, 0.18)
# 13 「아 · 틀 · 란 · 스」
add(riser(0.6, 200, 2500), 54.0, 0.35); add(rumble(0.6), 54.0, 0.35)
add(boom(1.4), 54.58, 0.8)
for i in range(4):
    t0 = 54.8 + i * 0.45
    add(K, t0, 0.7); add(S_, t0, 0.35); add(boom(0.5) * 0.6, t0, 0.35)
    add(syl(1500 + i * 150, 2100 + i * 200, 1800 + i * 150, 0.2, shift=i), t0 + 0.01, 0.3, (-0.3, 0.1, -0.1, 0.3)[i])
add(hp(rng.standard_normal(int(2.5 * SR)), 4500) * np.exp(-np.arange(int(2.5 * SR)) / SR / 0.9), 56.15, 0.14)
nf = int(3.85 * SR); tf = np.arange(nf) / SR
fin = np.zeros(nf)
for m in (53, 57, 60, 65):
    for det in (-0.006, 0.0, 0.007):
        fin += saw(mf(m + 12), tf, det)
fin = lp(fin, 2600) / 12 * np.minimum(1, tf / 0.05) * np.exp(-tf / 2.4)
add(fin, 56.15, 0.3, -0.2); add(fin, 56.162, 0.3, 0.2)
add(chime([mf(65), mf(69), mf(72), mf(77)], 2.4), 56.2, 0.26)
add(chirp(), 57.3, 0.24, -0.2); add(chirp(), 57.65, 0.18, 0.2)

# 끝 — 서서히 줄임 · 부드럽게 눌러 −1dB 아래
fo = np.ones(N); k0 = int(58.3 * SR); fo[k0:] = np.linspace(1, 0, N - k0) ** 1.5
L *= fo; Rr *= fo
mix = np.stack([L, Rr], 1)
mix = np.tanh(mix * 1.6) / np.tanh(1.6)
mix *= 0.89 / np.max(np.abs(mix))
out = sys.argv[1] if len(sys.argv) > 1 else 'bodri.wav'
with wave.open(out, 'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes((mix * 32767).astype('<i2').tobytes())
print('wav', out, round(DUR, 1), 's', 'peak', round(float(np.max(np.abs(mix))), 3))
