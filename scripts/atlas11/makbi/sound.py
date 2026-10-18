# 소개 영상 「(이름)의 고민」 소리(60초) — 사장님 2026-10-18(싱가포르) 16:39 「진화가 본질인 명령문」 [4] 4 · 5
#   [4] 4 「글상자와 움직임과 소리를 같은 순간에 맞춰라. 독백 한 줄이 나오는 동안 앵무새 마디 소리를 그 줄 길이만큼 낸다.」
#   [4] 5 「사람 목소리는 넣지 마라. 앵무새 마디 소리, 효과음, 배경 음악으로 한다.」
#   때는 모두 video.mjs 가 만든 때 표(cues.json) 하나에서 읽음 — 독백 글자 하나 = 앵무새 마디 하나(같은 때 · 같은 길이) · 효과음 = 때 표의 사건 · 음악 = 장면 때
#   모두 계산으로 만듦(녹음 · 남의 음악 · 목소리 없음) · 60초 · 44.1kHz 두 귀 · 끝을 부드럽게 눌러 −1dB 아래
#   python3 sound.py out.wav cues.json  (옛 1분 판 소리는 git f8cfcb1ed 의 이 파일)
import json, sys, wave
import numpy as np
from scipy.signal import butter, lfilter

SR = 44100
DUR = 60.0
N = int(SR * DUR)
L = np.zeros(N)
Rr = np.zeros(N)
rng = np.random.default_rng(20261018)
OUT = sys.argv[1] if len(sys.argv) > 1 else 'sound.wav'
CU = json.load(open(sys.argv[2]))
EV = CU['ev']
SC = {s['n']: (s['a'], s['b']) for s in CU['scenes']}
if len(SC) != 10 or SC[10][1] != 60:
    sys.exit('멈춤: 때 표 장면이 열 · 60초가 아님')


def ev(k, i=None):
    for e in EV:
        if e['k'] == k and (i is None or e.get('i') == i):
            return e['t']
    sys.exit('멈춤: 때 표에 사건 ' + k + ' 없음')


def evs(k):
    return [e['t'] for e in EV if e['k'] == k]


def mf(m):
    return 440.0 * 2 ** ((m - 69) / 12)


def tt(d):
    return np.arange(int(SR * d)) / SR


def add(sig, t0, gain=1.0, pan=0.0):
    i = int(round(t0 * SR))
    if i >= N or i < 0:
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


def saw(f, t, det=0.0):
    ph = (f * (1 + det)) * t
    return 2 * (ph - np.floor(ph + 0.5))


def sweep(f0, f1, d, vib=0.0):
    t = tt(d)
    f = f0 * (f1 / f0) ** (t / d) * (1 + vib * np.sin(2 * np.pi * 7 * t))
    return np.sin(2 * np.pi * np.cumsum(f) / SR)


# ── 악기 · 효과음 조각(계산) ──
def pluck(f, d=1.2, br=1.0, decay=1.0):  # 뜯는 줄(하프시코드 · 류트 비슷)
    n = int(d * SR); t = np.arange(n) / SR
    s = np.zeros(n)
    for h in range(1, 10):
        if f * h > 9000:
            break
        s += (1 / h ** 1.1) * np.sin(2 * np.pi * f * h * t + h) * np.exp(-t * (1.0 + 1.5 * h / br) / decay)
    s += lp(rng.standard_normal(n), 3500) * np.exp(-t / 0.004) * 0.25
    return s * np.minimum(1, t / 0.002) * 0.6


def pizz(f):
    return pluck(f, 0.45, 0.8, 0.28)


def pad(ms, d, fc=1600, trem=0.0, att=0.25):
    t = tt(d); s = np.zeros_like(t)
    for m in ms:
        for det in (-0.006, 0.0, 0.007):
            s += saw(mf(m), t, det)
    s = lp(s, fc) / (3 * len(ms))
    e = np.minimum(1, t / att) * np.minimum(1, (d - t) / 0.3 + 1e-4)
    if trem:
        e = e * (0.7 + 0.3 * np.sin(2 * np.pi * trem * t))
    return s * e


def timp(f=73.4, d=0.9):
    n = int(d * SR); t = np.arange(n) / SR
    fr = f * (1 + 0.25 * np.exp(-t / 0.03))
    s = np.sin(2 * np.pi * np.cumsum(fr) / SR) * np.exp(-t / 0.45) + 0.5 * np.sin(2 * np.pi * np.cumsum(fr * 1.5) / SR) * np.exp(-t / 0.25)
    return s + lp(rng.standard_normal(n), 600) * np.exp(-t / 0.05) * 0.5


def boom(d=1.4):
    n = int(d * SR); t = np.arange(n) / SR
    f = 34 + 80 * np.exp(-t / 0.12)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / 0.5) + lp(rng.standard_normal(n), 900) * np.exp(-t / 0.18) * 0.6


def whoosh(d=0.6, f0=300, f1=3000, up=True):
    n = int(d * SR); t = np.arange(n) / SR
    x = rng.standard_normal(n); u = np.arange(n) / n
    fc = f0 * (f1 / f0) ** (u if up else 1 - u)
    al = 1 - np.exp(-2 * np.pi * fc / SR)
    y = np.empty(n); z = 0.0
    for i in range(n):
        z += al[i] * (x[i] - z); y[i] = z
    y = hp(y, 150)
    return y / (np.max(np.abs(y)) + 1e-9) * np.sin(np.pi * np.minimum(1, t / d)) ** 1.5


def swish(d=0.6):  # 막 천 스치는 소리
    n = int(d * SR); t = np.arange(n) / SR
    return bp(rng.standard_normal(n), 400, 5000) * np.sin(np.pi * t / d) ** 2 * (0.7 + 0.3 * np.sin(2 * np.pi * 23 * t))


def chime(fs, d=1.2):
    n = int(d * SR); t = np.arange(n) / SR
    s = np.zeros(n)
    for i, f in enumerate(fs):
        s += (np.sin(2 * np.pi * f * t) + 0.3 * np.sin(2 * np.pi * f * 2.01 * t)) * np.exp(-t / (0.35 + 0.1 * i))
    return s / len(fs)


def puff():
    n = int(.22 * SR); t = np.arange(n) / SR
    return lp(rng.standard_normal(n), 1400) * np.exp(-t / .05)


def thump(f=110):
    n = int(.3 * SR); t = np.arange(n) / SR
    return np.sin(2 * np.pi * f * t) * np.exp(-t / .07) + lp(rng.standard_normal(n), 500) * np.exp(-t / .02) * .4


def slide_whistle(f0, f1, d):
    s = sweep(f0, f1, d, vib=0.012)
    t = tt(d)
    return s * np.minimum(1, t / 0.03) * np.minimum(1, (d - t) / 0.05 + 1e-4)


def boing():  # 용수철(꼬리로 매달림)
    d = 0.8; t = tt(d)
    f = 240 + 170 * np.sin(2 * np.pi * 11 * t) * np.exp(-t / 0.35) + 60 * t
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / 0.4)


def creak(d=0.55):  # 가지 삐걱
    n = int(d * SR); t = np.arange(n) / SR
    imp = (np.sin(2 * np.pi * (38 + 20 * t / d) * t) > 0.92).astype(float)
    return bp(imp + 0.05 * rng.standard_normal(n), 300, 1800) * np.sin(np.pi * t / d)


def wood(f=1900):
    n = int(.08 * SR); t = np.arange(n) / SR
    return (np.sin(2 * np.pi * f * t) + .5 * np.sin(2 * np.pi * f * 1.6 * t)) * np.exp(-t / .018)


def flip(d=0.22):  # 종이 넘김
    n = int(d * SR); t = np.arange(n) / SR
    return bp(rng.standard_normal(n), 900, 6000) * np.sin(np.pi * t / d) ** 2 * (1 + np.sin(2 * np.pi * 14 * t)) / 2


def rustle(d=0.3):
    n = int(d * SR); t = np.arange(n) / SR
    return bp(rng.standard_normal(n), 2500, 9000) * (0.5 + 0.5 * np.abs(np.sin(2 * np.pi * 37 * t))) * np.hanning(n)


def scratch(d=0.12):  # 깃펜 긁기
    n = int(d * SR); t = np.arange(n) / SR
    return bp(rng.standard_normal(n), 2500, 7000) * (0.6 + 0.4 * rng.random(n) ** 3) * np.sin(np.pi * t / d) ** .5 * .5


def flutter(d, rate=18.0):  # 날갯짓
    n = int(d * SR); t = np.arange(n) / SR
    return bp(rng.standard_normal(n), 250, 2600) * (0.5 + 0.5 * np.sin(2 * np.pi * rate * t)) ** 2 * np.sin(np.pi * t / d)


def chirp(f0=2600, f1=4200, d=0.06):  # 작은 새 짹
    return sweep(f0, f1, d) * np.hanning(int(d * SR))


def snare():
    n = int(0.2 * SR); t = np.arange(n) / SR
    return (hp(rng.standard_normal(n), 1200) * 0.6 + np.sin(2 * np.pi * 190 * t) * 0.4) * np.exp(-t / 0.06)


def syl(f0, f1, f2, d, shift=0):  # 앵무새 소리 한 마디(사람 목소리 아님)
    n = int(d * SR); t = np.arange(n) / SR
    f = np.interp(t, [0, d * .5, d], [f0, f1, f2]) * (2 ** (shift / 12))
    ph = 2 * np.pi * np.cumsum(f) / SR
    x = np.sin(ph) + .45 * np.sin(2 * ph) + .25 * np.sin(3 * ph)
    x *= 1 + .35 * np.sin(2 * np.pi * 38 * t)
    x += .22 * bp(rng.standard_normal(n), 1500, 5000)
    return x * np.hanning(n)


# ── 앵무새 마디 — 때 표의 글자마다 하나(같은 때 · 같은 길이) ──
nsyl = 0
for li, ln in enumerate(CU['lines']):
    who = ln['who']
    for s in ln['syl']:
        t0, d, j, end = s['t'], max(0.06, s['d']), s['j'], s['end']
        if who == 'flock':  # 새 떼 외침 = 작은 새 여럿이 짹(앵무새 아님)
            for k in range(3):
                f0 = 2400 + 900 * rng.random(); add(chirp(f0, f0 * (1.35 + .3 * rng.random()), 0.05 + 0.03 * rng.random()), t0 + 0.02 * k, 0.16, rng.uniform(-.8, .8))
            continue
        base = [1250, 1420, 1330, 1520][(j * 3 + li) % 4]
        if who == 'card':
            base *= 1.08
        if who == 'name':
            base = [1500, 1750, 2050][j % 3]
        f0, f1, f2 = base, base * 1.18, base * 1.02
        if end == '?':
            f0, f1, f2 = base * .95, base * 1.25, base * 1.55
        elif end == '!':
            f0, f1, f2 = base * 1.1, base * 1.45, base * 1.3
        elif end in '.…':
            f0, f1, f2 = base * 1.05, base * .98, base * .78
        g = 0.34 if who != 'name' else 0.42
        add(syl(f0, f1, f2, d * 0.95), t0, g, -0.1 if who == 'card' else 0.08)
        nsyl += 1
        if ln.get('write'):
            add(scratch(min(0.14, d)), t0 + 0.01, 0.16, -0.3)

# ── 배경 음악 · 효과음 — 장면 때 ──
D_MIN, G_MIN, A_MAJ, F_MAJ, C_MAJ, B_FLAT = [50, 53, 57], [43, 50, 55, 58], [45, 52, 57, 61], [41, 53, 57, 60], [48, 52, 55, 60], [46, 50, 53, 58]


def arp(ms, a, b, step=0.25, g=0.10, oct_=12, pan=0.35):
    j = 0; t = a
    seq = [ms[0], ms[1 % len(ms)], ms[2 % len(ms)], ms[1 % len(ms)]]
    while t < b - 0.05:
        add(pluck(mf(seq[j % 4] + oct_), 0.9, 1.1, 0.7), t, g, pan if j % 2 else -pan)
        t += step; j += 1


# ① 막 열림 · 제목 쾅 · 깃 · 날개를 가슴에
ACT, ROLL, CHEST = evs('act'), evs('roll'), evs('chest')
if len(ACT) != 3 or len(ROLL) != 2 or len(CHEST) != 2:
    sys.exit('멈춤: 때 표 막 · 북 · 가슴 사건 수가 다름')
for k in range(32):
    add(timp(73.4, 0.3), ROLL[0] + k * 0.05, 0.04 + 0.17 * (k / 32) ** 2)
add(swish(1.6), ev('curtain'), 0.32)
h = ev('hit')
add(timp(73.4, 1.4), h, 0.5); add(boom(1.2), h, 0.25); add(pad([38, 50, 53, 57], 3.6, 1400, att=0.02), h, 0.22)
for m in (50, 53, 57, 62):
    add(pluck(mf(m), 1.6), h + 0.01, 0.12)
arp(D_MIN, 2.0, SC[1][1], 0.25, 0.07)
add(puff(), ev('ruff'), 0.3); add(chime([mf(86), mf(93)], 0.5), ev('ruff') + 0.02, 0.08); add(thump(130), CHEST[0], 0.3)
# ② 날 것이냐 — 느린 류트 · 날개 펄럭 · 발끝 들썩
a2, b2 = SC[2]
for k, ch in enumerate([D_MIN, G_MIN, A_MAJ, D_MIN]):
    s0 = a2 + 2 * k
    add(pad([m + 12 for m in ch[-3:]], 2.0, 1300), s0, 0.07)
    arp(ch, s0, s0 + 2.0, 0.5, 0.09, 12)
add(flutter(0.35, 22), ev('wing'), 0.25); add(flutter(0.3, 22), ev('wing2'), 0.2); add(thump(120), CHEST[1], 0.3)
for i, tp in enumerate([x for x in evs('tip') if x < SC[3][0]]):
    add(pizz(mf(81 + 3 * i)), tp, 0.22); add(pizz(mf(86 + 3 * i)), tp + 0.12, 0.14)
# ③ 새 떼 · 바람 · 독백(떨림 현)
a3, b3 = SC[3]
add(swish(0.6), ACT[0] - 0.3, 0.3); add(timp(73.4, 0.6), ACT[0], 0.3)
fu = ev('flock_up')
for k in range(9):
    add(flutter(1.4, 16 + k), fu + 0.12 * k, 0.12, -0.8 + 0.2 * k)
add(whoosh(0.9, 300, 4500), ev('gust'), 0.4); add(whoosh(0.7, 4000, 600, up=False), ev('gust') + 0.5, 0.2)
t = a3
while t < 16.3:
    add(pizz(mf(50 if int((t - a3) * 4) % 4 else 62)), t, 0.16, -0.2); t += 0.125
for k, ch in enumerate([D_MIN, B_FLAT, G_MIN, A_MAJ]):
    s0 = 16.3 + 1.4 * k
    add(pad([m + 12 for m in ch[-3:]], 1.45, 1500, trem=11), s0, 0.09)
    add(pizz(mf(ch[0])), s0, 0.2)
for tp in [x for x in evs('tip') if a3 <= x < b3]:
    add(pizz(mf(86)), tp, 0.2)
# ④ 내밀기(오르는 뜯음) · 미끄러짐(미끄럼 피리) · 꼬리 매달림(용수철) · 삐걱
a4, b4 = SC[4]
for k in range(12):
    add(pizz(mf(62 + k)), a4 + 0.15 + k * 0.235, 0.1 + 0.012 * k)
for x in evs('lean'):
    add(creak(0.45), x, 0.2)
sl = ev('slip')
add(slide_whistle(1900, 320, ev('catch') - sl), sl, 0.3); add(whoosh(0.45, 2500, 500, up=False), sl, 0.22)
add(boing(), ev('catch'), 0.4); add(thump(90), ev('catch'), 0.35)
for x in evs('creak'):
    add(creak(0.6), x, 0.28)
add(pad([45, 52, 55, 61], 2.5, 1100, trem=3), ev('catch') + 0.1, 0.07)
# ⑤ 잠깐(음악 멈춤) · 번쩍 · 한 바퀴 돌아 착지
a5, b5 = SC[5]
add(chime([mf(88), mf(93)], 0.9), ev('idea'), 0.18)
t = ev('idea') + 0.5
while t < ev('flipup') - 0.1:
    add(pizz(mf([65, 69, 72, 69][int((t - a5) * 4) % 4] + 12)), t, 0.07, 0.3); t += 0.25
add(whoosh(0.4, 400, 3000), ev('flipup'), 0.3); add(thump(140), ev('land'), 0.32)
# ⑥ 열한 번 묻자 — 똑딱 · 카드 넘김 · 오르는 음
a6, b6 = SC[6]
add(swish(0.6), ACT[1] - 0.3, 0.3)
t = a6; k = 0
while t < b6 - 0.05:
    add(wood(1900 if k % 2 == 0 else 1500), t, 0.07, 0.4 if k % 2 else -0.4); t += 0.5; k += 1
for k, ch in enumerate([F_MAJ, C_MAJ, D_MIN, B_FLAT]):
    add(pad([m + 12 for m in ch[-3:]], 2.5, 1300), a6 + 2.5 * k, 0.06)
scale = [65, 67, 69, 70, 72, 74, 76, 77, 79, 81, 82]
for i, x in enumerate(evs('card')):
    add(flip(), x - 0.04, 0.3, -0.2); add(pluck(mf(scale[i % len(scale)] + 12), 0.5, 1.2, 0.4), x, 0.12, 0.2)
# ⑦ 기록장 · 깃펜 · 새 떼가 지쳐 돌아옴
a7, b7 = SC[7]
add(rustle(0.35), ev('book'), 0.3)
for k, ch in enumerate([D_MIN, B_FLAT, F_MAJ]):
    add(pad([m + 12 for m in ch[-3:]], 2.0, 1200), a7 + 2 * k, 0.07)
fb = ev('flock_back')
for k in range(6):
    add(flutter(1.6, 9 + k), fb + 0.2 * k, 0.1, -0.7 + 0.25 * k)
for k in range(10):
    f0 = 2600 - 60 * k; add(chirp(f0, f0 * 0.62, 0.11), fb + 0.6 + 0.17 * k, 0.09, rng.uniform(-.6, .6))
dr = ev('droop')
for i, m in enumerate((67, 66, 65, 61)):
    n = int(0.42 * SR); tb = np.arange(n) / SR
    tone = lp(saw(mf(m), tb) * (1 - 0.25 * np.cos(2 * np.pi * 5 * tb)), 1100) * np.minimum(1, tb / 0.03) * np.exp(-tb / 0.5)
    add(tone, dr + 0.42 * i, 0.08)
# ⑧ 본질 세 줄 — 따뜻한 화음 · 줄마다 오르골
a8, b8 = SC[8]
add(swish(0.6), ACT[2] - 0.3, 0.26); add(timp(73.4, 0.6), ACT[2], 0.22)
for k, ch in enumerate([F_MAJ, C_MAJ, D_MIN, B_FLAT]):
    s0 = a8 + 1.5 * k
    add(pad([m + 12 for m in ch[-3:]], 1.6, 1500), s0, 0.08)
    arp(ch, s0, s0 + 1.5, 0.25, 0.05, 24, 0.5)
for i, x in enumerate(evs('vow')):
    add(chime([mf(81 + 2 * i), mf(88 + 2 * i)], 1.0), x, 0.16)
# ⑨ 노란 카드 날아감 · 띵동 · 상품권 줄
a9, b9 = SC[9]
add(whoosh(0.5, 500, 3500), ev('send'), 0.3)
add(chime([mf(88)], 0.5), ev('msg'), 0.22); add(chime([mf(84)], 0.7), ev('msg') + 0.18, 0.22)
add(chime([mf(77), mf(81), mf(84), mf(89)], 1.0), ev('promo'), 0.14)
arp(F_MAJ, a9 + 0.1, b9, 0.125, 0.045, 24, 0.5)
add(pad([65, 69, 72], 3.0, 1600), a9, 0.06)
# ⑩ 이름 셋 · 북 · 이름 쾅 · 끝 화음(F)
a10, b10 = SC[10]
for k in range(12):
    add(snare(), ROLL[1] + k * 0.03, 0.06 + 0.02 * k)
s = ev('slam')
add(boom(1.4), s, 0.6); add(timp(87.3, 1.4), s, 0.5)
nf = int((DUR - s) * SR); tf = np.arange(nf) / SR
fin = np.zeros(nf)
for m in (53, 57, 60, 65):
    for det in (-0.006, 0.0, 0.007):
        fin += saw(mf(m + 12), tf, det)
fin = lp(fin, 2400) / 12 * np.minimum(1, tf / 0.04) * np.exp(-tf / 2.6)
add(fin, s, 0.3, -0.2); add(fin, s + 0.012, 0.3, 0.2)
for m in (53, 60, 65, 69, 72):
    add(pluck(mf(m), 1.7), s + 0.02, 0.1)
add(chime([mf(77), mf(81), mf(84)], 1.6), ev('site'), 0.12)

# 끝 — 서서히 줄임 · 부드럽게 눌러 −1dB 아래
fo = np.ones(N); k0 = int(59.2 * SR); fo[k0:] = np.linspace(1, 0, N - k0) ** 1.4
L *= fo; Rr *= fo
mix = np.stack([L, Rr], 1)
mix = np.tanh(mix * 1.5) / np.tanh(1.5)
mix *= 0.89 / np.max(np.abs(mix))
with wave.open(OUT, 'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes((mix * 32767).astype('<i2').tobytes())
print('wav', OUT, round(DUR, 1), 's · 앵무새 마디', nsyl, '· peak', round(float(np.max(np.abs(mix))), 3))
