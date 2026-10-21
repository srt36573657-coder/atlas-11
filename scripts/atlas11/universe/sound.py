# 상품권 앞 「우주 영상 1분」 소리(60초) — 사장님 2026-10-22(서울) 01:49 · 01:59 「맞아」(명령문 원문 docs/design/gift-2026-10-22/order-0149.txt)
#   잔잔한 화음 + 오르골 「반짝반짝 작은 별」(18세기 옛 민요 가락 · 저작권 없음 · 가사 없음) + 날 것이 나올 때마다 작은 별빛 소리 + 끝 하트 별자리 종소리
#   모두 계산으로 만듦(녹음 · 남의 음악 · 사람 목소리 없음) · 44.1kHz 두 귀 · 처음과 끝은 부드럽게 · 소리 크기는 낮게(꼭대기 −3dB 아래)
#   python3 sound.py out.wav '[{"at":5,"kind":"peter"}, …]'  (때는 film.mjs 의 SHOW 그대로)
import json, sys, wave
import numpy as np

SR = 44100
DUR = 60.0
N = int(SR * DUR)
L = np.zeros(N)
R = np.zeros(N)
rng = np.random.default_rng(20261022)
OUT = sys.argv[1] if len(sys.argv) > 1 else 'sound.wav'
EV = json.loads(sys.argv[2]) if len(sys.argv) > 2 else []


def add(sig, t0, gain=1.0, pan=0.0):
    i = int(t0 * SR)
    if i >= N or i < 0:
        return
    s = sig[:N - i] * gain
    L[i:i + len(s)] += s * np.sqrt(0.5 * (1 - pan))
    R[i:i + len(s)] += s * np.sqrt(0.5 * (1 + pan))


def bell(f, d=1.8, bright=1.0):  # 오르골 이 하나(살짝 어긋난 배음이 오르골 빛깔)
    t = np.arange(int(SR * d)) / SR
    parts = [(1.0, 1.0, 1.0), (2.0, 0.32 * bright, 1.7), (3.0, 0.1 * bright, 2.6), (4.18, 0.07 * bright, 3.4)]
    s = sum(a * np.sin(2 * np.pi * f * r * t) * np.exp(-t * 2.0 * k) for r, a, k in parts)
    return s * np.minimum(1, t / 0.004)


def pad(freqs, d, att=0.7, rel=1.0):  # 잔잔한 화음(두 줄을 살짝 어긋나게 · 천천히 숨 쉼)
    t = np.arange(int(SR * d)) / SR
    s = np.zeros_like(t)
    for f in freqs:
        for det in (-0.7, 0.7):
            s += np.sin(2 * np.pi * (f + det) * t) + 0.2 * np.sin(2 * np.pi * 2 * (f + det) * t)
    s /= len(freqs) * 2
    env = np.clip(np.minimum(t / att, (d - t) / rel), 0, 1)
    return s * env * (0.86 + 0.14 * np.sin(2 * np.pi * 0.18 * t))


PENTA = [1046.5, 1174.66, 1318.51, 1567.98, 1760.0, 2093.0]


def sparkle(t0, n=5, span=1.2, gain=0.05):  # 날 것이 나올 때 — 높은 별빛 소리 몇 개
    for k in range(n):
        add(bell(PENTA[rng.integers(len(PENTA))], 1.4, 0.6), t0 + span * k / n + rng.uniform(0, 0.08), gain * (1 - 0.1 * k), rng.uniform(-0.7, 0.7))


C5, D5, E5, F5, G5, A5 = 523.25, 587.33, 659.25, 698.46, 783.99, 880.0
P1, P2, P3 = [C5, C5, G5, G5, A5, A5, G5], [F5, F5, E5, E5, D5, D5, C5], [G5, G5, F5, F5, E5, E5, D5]
CH = {'C': [130.81, 164.81, 196.0, 261.63], 'F': [174.61, 220.0, 261.63, 349.23], 'G': [196.0, 246.94, 293.66, 392.0]}
SONG = [(P1, 'CCFC'), (P2, 'FCGC'), (P3, 'CFCG'), (P3, 'CFCG'), (P1, 'CCFC'), (P2, 'FCGC')]
T_SONG, BEAT = 6.0, 1.0  # 6초부터 한 박 1초 · 한 줄 8박 · 여섯 줄 = 48초 → 54초에 끝(하트 별자리)

add(pad(CH['C'], 6.6, att=2.5, rel=1.2), 0.2, 0.1)  # 제목 · 오로라
for k, (notes, chords) in enumerate(SONG):
    t0 = T_SONG + k * 8 * BEAT
    for j, f in enumerate(notes):
        add(bell(f, 2.2 if j == 6 else 1.6), t0 + j * BEAT, 0.2 if j % 2 == 0 else 0.17, -0.15 + 0.05 * j)
    for j, c in enumerate(chords):
        add(pad(CH[c], 2.7, att=0.5, rel=0.8), t0 + j * 2 * BEAT, 0.09)
# 끝 — 하트 별자리 · 고마워요(54 ~ 60초)
add(pad(CH['C'], 6.0, att=0.8, rel=3.0), 54.0, 0.1)
for j, f in enumerate([C5, E5, G5, 1046.5]):
    add(bell(f, 2.6), 54.2 + 0.32 * j, 0.16, -0.4 + 0.27 * j)
add(bell(1318.51, 3.0, 0.5), 55.6, 0.1, 0.3)
for e in EV:
    k, at = e.get('kind'), float(e.get('at', 0))
    if k == 'shower':
        for i in range(8):
            add(bell(PENTA[i % len(PENTA)] * 1.0, 1.0, 0.5), at + 0.37 * i, 0.035, rng.uniform(-0.8, 0.8))
    elif k != 'finale':
        sparkle(at + 0.1)

# 울림(짧은 메아리 셋 · 좌우를 바꿔 넓게)
dry_l, dry_r = L.copy(), R.copy()
for d, g in ((0.11, 0.26), (0.23, 0.16), (0.37, 0.09), (0.53, 0.05)):
    i = int(d * SR)
    L[i:] += dry_r[:N - i] * g
    R[i:] += dry_l[:N - i] * g
env = np.minimum(1, np.arange(N) / (SR * 1.5)) * np.clip((DUR - np.arange(N) / SR) / 2.5, 0, 1)
L *= env
R *= env
peak = max(np.abs(L).max(), np.abs(R).max(), 1e-9)
g = 0.68 / peak
st = np.stack([L * g, R * g], axis=1)
st = np.clip(st, -1, 1)
with wave.open(OUT, 'wb') as w:
    w.setnchannels(2)
    w.setsampwidth(2)
    w.setframerate(SR)
    w.writeframes((st * 32767).astype('<i2').tobytes())
print('소리', OUT, f'{DUR:.0f}초', '꼭대기', round(20 * np.log10(0.68), 1), 'dB')
