#!/usr/bin/env python3
"""꽃이 될 싹 고르는 조건 — 후보 365 → 37 → 3 → 1 (docs/design/sprout365-2026-10-27/spec.md 그대로)

사장님 2026-10-27(서울) 17:34 「꽃이될 싹을 고르는 조건을 365가지 예비 후보를 만들어서 그중 37개를 선택한 다음 다시 더 깊이 있게
분석해서 3개를 도입하고 마지막으로 3개에 날까로운 분석을 1개로 만들어 돌이에게 적용시켜 업데이트를 하고 그 적용값을 페이지에 기록하여
이용자들이 볼수 있도록 해라」.

쓰는 법:
  python3 scripts/atlas11/research/sprout365.py --list [후보 json]        후보 365 목록만(결과 셈 없음 — 셈 전에 적음)
  python3 scripts/atlas11/research/sprout365.py [자료 폴더] [결과 json]   셈(앞 기록으로 37 · 3 · 1 · 뒤 기록 한 번)
읽기만 한다. 앞날을 맞히는 숫자가 아니라 지난 기록에서 센 횟수다.
"""
import json
import os
import sys
import warnings

import numpy as np

warnings.filterwarnings('ignore')
np.seterr(all='ignore')

ARGS = [a for a in sys.argv[1:] if a != '--list']
LIST = '--list' in sys.argv[1:]
SPLIT = '2025-04-04'  # 앞 · 뒤 기록 가름(theme-engine.js BLOOM.split 과 같음)
T0 = 120
REPS, BLOCK = 2000, 20
SEED = 20261027

# ── 낱 조건 134(갈래 · 이름 · 셈) — 셈은 F(이름 공간)를 받아 (N, C) 참거짓 ──
A = []


def at(i, fam, label, f):
    A.append({'id': i, 'fam': fam, 'label': label, 'f': f})


# 회사 81
for i, (lab, f) in enumerate([
    ('한 달에 시장보다 15% 넘게 처짐', lambda F: F.X < -15), ('한 달에 시장보다 10% 넘게 처짐', lambda F: F.X < -10),
    ('한 달에 시장보다 5% 넘게 처짐', lambda F: F.X < -5), ('한 달에 시장보다 처짐', lambda F: F.X < 0),
    ('한 달 시장과 비슷(−5 ~ 5)', lambda F: F.X >= -5), ('꽃 선 바로 아래(0 ~ 5)', lambda F: F.X >= 0),
    ('꽃 선 아주 가까이(2 ~ 5)', lambda F: F.X >= 2), ('한 달 조금 처짐(−10 ~ 0)', lambda F: (F.X >= -10) & (F.X < 0))], 1):
    at(f'cx{i}', 'cx', lab, f)
for i, (lab, f) in enumerate([
    ('닷새 힘 1 이상', lambda F: F.Y >= 1), ('닷새 힘 2 이상', lambda F: F.Y >= 2), ('닷새 힘 3 이상', lambda F: F.Y >= 3),
    ('닷새 힘 5 이상', lambda F: F.Y >= 5), ('닷새 힘 8 이상', lambda F: F.Y >= 8), ('닷새 힘 2 아래', lambda F: F.Y < 2),
    ('닷새 힘 5 아래', lambda F: F.Y < 5), ('닷새 힘 2 ~ 5', lambda F: (F.Y >= 2) & (F.Y < 5)),
    ('닷새 힘 5 ~ 10', lambda F: (F.Y >= 5) & (F.Y < 10)), ('닷새 힘 10 이상', lambda F: F.Y >= 10)], 1):
    at(f'cy{i}', 'cy', lab, f)
for i, (lab, f) in enumerate([
    ('열흘 시장보다 오름', lambda F: F.R10 > 0), ('열흘 시장보다 3% 넘게 오름', lambda F: F.R10 > 3),
    ('열흘 시장보다 6% 넘게 오름', lambda F: F.R10 > 6), ('열흘 시장보다 처짐', lambda F: F.R10 < 0),
    ('열흘 시장보다 3% 넘게 처짐', lambda F: F.R10 < -3)], 1):
    at(f'c10{"abcde"[i - 1]}', 'c10', lab, f)
for i, (lab, f) in enumerate([
    ('석 달 시장보다 오름', lambda F: F.R60 > 0), ('석 달 시장보다 10% 넘게 오름', lambda F: F.R60 > 10),
    ('석 달 시장보다 20% 넘게 오름', lambda F: F.R60 > 20), ('석 달 시장보다 처짐', lambda F: F.R60 < 0),
    ('석 달 시장보다 10% 넘게 처짐', lambda F: F.R60 < -10), ('석 달 시장보다 20% 넘게 처짐', lambda F: F.R60 < -20)], 1):
    at(f'c60{"abcdef"[i - 1]}', 'c60', lab, f)
for i, (lab, f) in enumerate([
    ('반년 시장보다 오름', lambda F: F.R120 > 0), ('반년 시장보다 20% 넘게 오름', lambda F: F.R120 > 20),
    ('반년 시장보다 처짐', lambda F: F.R120 < 0), ('반년 시장보다 20% 넘게 처짐', lambda F: F.R120 < -20)], 1):
    at(f'c120{"abcd"[i - 1]}', 'c120', lab, f)
for i, (lab, f) in enumerate([
    ('반년 가장 높은 값의 95% 이상', lambda F: F.HI >= 0.95), ('반년 가장 높은 값의 90% 이상', lambda F: F.HI >= 0.90),
    ('반년 가장 높은 값의 80% 이상', lambda F: F.HI >= 0.80), ('반년 가장 높은 값의 70% 아래', lambda F: F.HI < 0.70),
    ('반년 가장 높은 값의 60% 아래', lambda F: F.HI < 0.60), ('반년 가장 높은 값의 절반 아래', lambda F: F.HI < 0.50)], 1):
    at(f'hi{i}', 'hi', lab, f)
for i, (lab, f) in enumerate([
    ('석 달 가장 낮은 값에서 5% 안', lambda F: F.LO <= 1.05), ('석 달 가장 낮은 값에서 10% 안', lambda F: F.LO <= 1.10),
    ('석 달 가장 낮은 값보다 30% 넘게 위', lambda F: F.LO >= 1.30), ('석 달 가장 낮은 값보다 50% 넘게 위', lambda F: F.LO >= 1.50)], 1):
    at(f'lo{i}', 'lo', lab, f)
for i, (lab, f) in enumerate([
    ('흔들림이 그날 싹 가운데 값의 0.75배 아래', lambda F: F.VREL < 0.75), ('흔들림이 그날 싹 가운데 값 아래', lambda F: F.VREL < 1.0),
    ('흔들림이 그날 싹 가운데 값 이상', lambda F: F.VREL >= 1.0), ('흔들림이 그날 싹 가운데 값의 1.5배 이상', lambda F: F.VREL >= 1.5)], 1):
    at(f'vol{i}', 'vol', lab, f)
for i, (lab, f) in enumerate([
    ('한 달 흔들림이 석 달보다 20% 넘게 작음', lambda F: F.VR < 0.8), ('한 달 흔들림이 석 달보다 작음', lambda F: F.VR < 1.0),
    ('한 달 흔들림이 석 달보다 20% 넘게 큼', lambda F: F.VR >= 1.2), ('한 달 흔들림이 석 달보다 50% 넘게 큼', lambda F: F.VR >= 1.5)], 1):
    at(f'vr{i}', 'vr', lab, f)
for i, (lab, f) in enumerate([
    ('열흘에 오른 날 여섯 이상', lambda F: F.UP10 >= 6), ('열흘에 오른 날 일곱 이상', lambda F: F.UP10 >= 7),
    ('열흘에 오른 날 넷 이하', lambda F: F.UP10 <= 4), ('열흘에 오른 날 셋 이하', lambda F: F.UP10 <= 3)], 1):
    at(f'up{i}', 'up', lab, f)
for i, (lab, f) in enumerate([
    ('싹 첫날', lambda F: F.RUN == 1), ('싹 첫날 · 둘째 날', lambda F: (F.RUN >= 1) & (F.RUN <= 2)),
    ('싹 닷새 안', lambda F: (F.RUN >= 1) & (F.RUN <= 5)), ('싹 닷새 넘게 이음', lambda F: F.RUN >= 5),
    ('싹 열흘 넘게 이음', lambda F: F.RUN >= 10)], 1):
    at(f'run{i}', 'run', lab, f)
for i, (lab, f) in enumerate([
    ('그날 업종 큰 회사 셋', lambda F: F.TOP3H), ('그날 몸값 위 20%', lambda F: F.SZP >= 0.8),
    ('그날 몸값 아래 20%', lambda F: F.SZP <= 0.2), ('그날 몸값 위 절반', lambda F: F.SZP >= 0.5)], 1):
    at(f'big{i}', 'big', lab, f)
for i, (lab, f) in enumerate([
    ('한 주 값 2,000원 아래', lambda F: F.P < 2000), ('한 주 값 5,000원 아래', lambda F: F.P < 5000),
    ('한 주 값 10,000원 이상', lambda F: F.P >= 10000), ('한 주 값 50,000원 이상', lambda F: F.P >= 50000)], 1):
    at(f'px{i}', 'px', lab, f)
for i, (lab, f) in enumerate([
    ('한 달 안에 하루 10% 넘게 오른 날 있음', lambda F: F.MXR >= 0.10), ('한 달 안에 하루 15% 넘게 오른 날 있음', lambda F: F.MXR >= 0.15),
    ('한 달 내내 하루 5% 안쪽으로만 움직임', lambda F: F.MXA < 0.05), ('한 달 안에 하루 5% 넘게 오른 날 없음', lambda F: F.MXR < 0.05)], 1):
    at(f'mr{i}', 'mr', lab, f)
for i, (lab, f) in enumerate([
    ('한 달 평균 값 위', lambda F: F.P >= F.MA20), ('한 달 평균 값보다 5% 넘게 위', lambda F: F.P >= 1.05 * F.MA20),
    ('석 달 평균 값 위', lambda F: F.P >= F.MA60), ('석 달 평균 값 아래', lambda F: F.P < F.MA60),
    ('한 달 평균이 석 달 평균 위', lambda F: F.MA20 >= F.MA60), ('한 달 평균이 석 달 평균 아래', lambda F: F.MA20 < F.MA60)], 1):
    at(f'ma{i}', 'ma', lab, f)
for i, (lab, f) in enumerate([
    ('한 달 가장 높은 값의 97% 이상', lambda F: F.H20 >= 0.97), ('한 달 가장 높은 값의 93% 이상', lambda F: F.H20 >= 0.93),
    ('한 달 가장 높은 값의 90% 아래', lambda F: F.H20 < 0.90)], 1):
    at(f'h20{"abc"[i - 1]}', 'h20', lab, f)
CO_N = len(A)
# 업종 41
for i, (lab, f) in enumerate([
    ('업종은 꽃 자리', lambda F: F.IZB), ('업종도 싹 자리', lambda F: F.IZS), ('업종이 진짜 싹(점 넷)', lambda F: F.IREAL),
    ('업종이 바닥에서 막 오름', lambda F: F.IUP), ('업종은 시듦 자리', lambda F: F.IWILT), ('업종은 잠잠 자리', lambda F: F.IQ),
    ('업종 닷새 힘 0 이상', lambda F: F.IY0)], 1):
    at(f'iz{i}', 'iz', lab, f)
for i, (lab, f) in enumerate([
    ('업종 한 달 시장보다 오름', lambda F: F.IX >= 0), ('업종 한 달 5% 넘게 오름', lambda F: F.IX >= 5),
    ('업종 한 달 10% 넘게 오름', lambda F: F.IX >= 10), ('업종 한 달 15% 넘게 오름', lambda F: F.IX >= 15),
    ('업종 한 달 5 ~ 15% 오름', lambda F: (F.IX >= 5) & (F.IX < 15)), ('업종 한 달 시장보다 처짐', lambda F: F.IX < 0),
    ('업종 한 달 5% 넘게 처짐', lambda F: F.IX < -5)], 1):
    at(f'ix{i}', 'ix', lab, f)
for i, (lab, f) in enumerate([
    ('업종 닷새 힘 1 이상', lambda F: F.IY >= 1), ('업종 닷새 힘 2 이상', lambda F: F.IY >= 2), ('업종 닷새 힘 3 이상', lambda F: F.IY >= 3),
    ('업종 닷새 힘 0 아래', lambda F: F.IY < 0), ('업종 닷새 힘 −1 아래', lambda F: F.IY < -1),
    ('업종 닷새 힘 0 ~ 2', lambda F: (F.IY >= 0) & (F.IY < 2))], 1):
    at(f'iy{i}', 'iy', lab, f)
for i, (lab, f) in enumerate([
    ('업종 꽃 자리 이틀 안', lambda F: (F.IRB >= 1) & (F.IRB <= 2)), ('업종 꽃 자리 닷새 안', lambda F: (F.IRB >= 1) & (F.IRB <= 5)),
    ('업종 꽃 자리 닷새 넘게 이음', lambda F: F.IRB > 5), ('업종 꽃 자리 열흘 넘게 이음', lambda F: F.IRB > 10)], 1):
    at(f'ib{i}', 'ib', lab, f)
for i, (lab, f) in enumerate([
    ('업종 회사 절반 넘게 열흘 2% 오름', lambda F: F.IBR >= 0.5), ('업종 회사 60% 넘게 열흘 2% 오름', lambda F: F.IBR >= 0.6),
    ('업종 회사 30% 아래만 열흘 2% 오름', lambda F: F.IBR < 0.3), ('업종 회사 20% 아래만 열흘 2% 오름', lambda F: F.IBR < 0.2)], 1):
    at(f'ibr{i}', 'ibr', lab, f)
for i, (lab, f) in enumerate([
    ('업종 석 달 시장보다 오름', lambda F: F.I60 > 0), ('업종 석 달 10% 넘게 오름', lambda F: F.I60 > 10),
    ('업종 석 달 시장보다 처짐', lambda F: F.I60 < 0), ('업종 석 달 10% 넘게 처짐', lambda F: F.I60 < -10)], 1):
    at(f'i60{"abcd"[i - 1]}', 'i60', lab, f)
for i, (lab, f) in enumerate([
    ('업종 큰 회사 셋 열흘 1% 넘게 오름', lambda F: F.IBIG >= 0.01), ('업종 큰 회사 셋 열흘 내림', lambda F: F.IBIG < 0)], 1):
    at(f'ibig{i}', 'ibig', lab, f)
for i, (lab, f) in enumerate([
    ('회사 닷새 힘이 업종보다 큼', lambda F: F.Y > F.IY), ('회사 한 달이 업종보다 앞섬', lambda F: F.X > F.IX),
    ('회사 한 달이 업종보다 5 넘게 뒤짐', lambda F: F.X < F.IX - 5), ('회사 한 달이 업종보다 10 넘게 뒤짐', lambda F: F.X < F.IX - 10),
    ('회사 닷새 힘이 업종보다 2 넘게 큼', lambda F: F.Y > F.IY + 2)], 1):
    at(f'rel{i}', 'rel', lab, f)
for i, (lab, f) in enumerate([
    ('업종 회사 서른 곳 이상', lambda F: F.ISZ >= 30), ('업종 회사 열다섯 곳 아래', lambda F: F.ISZ < 15)], 1):
    at(f'isz{i}', 'isz', lab, f)
# 시장 12
for i, (lab, f) in enumerate([
    ('시장 한 달 오름', lambda F: F.MK20 > 0), ('시장 한 달 3% 넘게 오름', lambda F: F.MK20 > 3),
    ('시장 한 달 내림', lambda F: F.MK20 < 0), ('시장 한 달 3% 넘게 내림', lambda F: F.MK20 < -3)], 1):
    at(f'm20{"abcd"[i - 1]}', 'm20', lab, f)
at('m5a', 'm5', '시장 닷새 오름', lambda F: F.MK5 > 0)
at('m5b', 'm5', '시장 닷새 내림', lambda F: F.MK5 < 0)
at('m60a', 'm60', '시장 석 달 오름', lambda F: F.MK60 > 0)
at('m60b', 'm60', '시장 석 달 내림', lambda F: F.MK60 < 0)
at('mb1', 'mb', '시장 회사 절반 넘게 한 달 시장보다 앞섬', lambda F: F.MB >= 0.5)
at('mb2', 'mb', '시장 회사 40% 아래만 한 달 시장보다 앞섬', lambda F: F.MB < 0.4)
at('nb1', 'nb', '꽃 자리 업종 열다섯 곳 이상', lambda F: F.NB >= 15)
at('nb2', 'nb', '꽃 자리 업종 여덟 곳 아래', lambda F: F.NB < 8)
assert len(A) == 134, len(A)
assert CO_N == 81, CO_N
AT = {a['id']: a for a in A}

# ── 후보 365 ──
C3_SKIP = {'iz1', 'iz2', 'iz3', 'iz4', 'iz5', 'iz6', 'iz7', 'ix1', 'ix2', 'ix6', 'ix7', 'iy4', 'iy5'}
CANDS = [{'id': a['id'], 'base': '-', 'parts': [a['id']], 'fam': a['fam'], 'label': a['label']} for a in A]
CANDS += [{'id': 'C3+' + a['id'], 'base': 'C3', 'parts': ['iz1', a['id']], 'fam': a['fam'], 'label': '업종은 꽃 자리 + ' + a['label']} for a in A if a['id'] not in C3_SKIP]
CANDS += [{'id': 'IY0+' + a['id'], 'base': 'IY0', 'parts': ['iz7', a['id']], 'fam': a['fam'], 'label': '업종 닷새 힘 0 이상 + ' + a['label']} for a in A[:CO_N]]
CANDS += [{'id': 'IZS+' + a['id'], 'base': 'IZS', 'parts': ['iz2', a['id']], 'fam': a['fam'], 'label': '업종도 싹 자리 + ' + a['label']} for a in A if a['fam'] in ('cx', 'cy', 'c10', 'c60')]
assert len(CANDS) == 365, len(CANDS)
assert len({c['id'] for c in CANDS}) == 365

if LIST:
    out = ARGS[0] if ARGS else None
    txt = json.dumps({'schema': 'dori-sprout365-candidates-1', 'spec': 'docs/design/sprout365-2026-10-27/spec.md v1', 'n': len(CANDS),
                      'atoms': [{k: a[k] for k in ('id', 'fam', 'label')} for a in A],
                      'candidates': [{k: c[k] for k in ('id', 'base', 'parts', 'fam', 'label')} for c in CANDS]}, ensure_ascii=False, indent=1)
    if out:
        open(out, 'w', encoding='utf8').write(txt + '\n')
    print(len(A), 'atoms ·', len(CANDS), 'candidates')
    sys.exit(0)

ROOT = ARGS[0] if len(ARGS) > 0 else 'site/atlas/data'
OUT = ARGS[1] if len(ARGS) > 1 else None
RNG = np.random.default_rng(SEED)

# ── 자료 ──
days = json.load(open(f'{ROOT}/days.json', encoding='utf8'))
D = days if isinstance(days, list) else (days.get('dates') or days.get('days'))
N = len(D)
mkt = json.load(open(f'{ROOT}/mkt.json', encoding='utf8'))['companies']
cond = json.load(open(f'{ROOT}/cond.json', encoding='utf8'))
CAP = dict(zip(cond['co']['c'], cond['co']['cap']))
codes = sorted(c for c in mkt if os.path.exists(f'{ROOT}/co/{c}.json'))
C = len(codes)
P = np.full((N, C), np.nan)
for j, c in enumerate(codes):
    d = json.load(open(f'{ROOT}/co/{c}.json', encoding='utf8'))
    k0 = int(d.get('k0') or 0)
    for i, v in enumerate(d.get('close') or []):
        t = i + k0
        if 0 <= t < N and v:
            P[t, j] = float(v)

R = np.full((N, C), np.nan)
R[1:] = P[1:] / P[:-1] - 1
JUMP = np.zeros((N, C), bool)
JUMP[1:] = np.abs(np.nan_to_num(R[1:], nan=0.0)) >= 0.35
RV = np.where(JUMP, np.nan, R)


def index_of(cols):
    sub = RV[:, cols]
    cnt = np.sum(~np.isnan(sub), axis=1)
    s = np.nansum(sub, axis=1)
    m = np.where(cnt > 0, s / np.maximum(cnt, 1), 0.0)
    m[0] = 0.0
    return np.cumprod(1 + m)


def lag(a, k):
    out = np.full(a.shape, np.nan)
    out[k:] = a[:-k]
    return out


def lead(a, k):
    out = np.full(a.shape, np.nan)
    out[:-k] = a[k:]
    return out


def roll(a, w, fn):
    """t − w + 1 ~ t 모두 값이 있을 때만(하나라도 빈 날이면 빈 값) · fn = np.max · np.min · np.sum(줄여 셈 — 큰 사본을 안 만듦)"""
    out = np.full(a.shape, np.nan)
    if a.shape[0] < w:
        return out
    from numpy.lib.stride_tricks import sliding_window_view
    v = sliding_window_view(a, w, axis=0)  # (N − w + 1, C, w)
    with np.errstate(invalid='ignore'):
        r = fn(v, axis=-1)
    out[w - 1:] = r
    return out


def roll_mean(a, w):
    return roll(a, w, np.sum) / w


def roll_std(a, w):
    """모집단 표준편차(나눔 w) — 합과 제곱합으로"""
    s1, s2 = roll(a, w, np.sum), roll(a * a, w, np.sum)
    return np.sqrt(np.maximum(s2 / w - (s1 / w) ** 2, 0.0))


M = index_of(np.arange(C))
Mc = M[:, None]
cj = np.cumsum(JUMP.astype(np.int32), axis=0)
J20 = cj.copy()
J20[20:] = cj[20:] - cj[:-20]
J10 = cj.copy()
J10[10:] = cj[10:] - cj[:-10]
P5, P10, P20, P60, P120 = lag(P, 5), lag(P, 10), lag(P, 20), lag(P, 60), lag(P, 120)
M5, M10, M20, M60, M120 = (lag(Mc, k) for k in (5, 10, 20, 60, 120))
X = ((P / P20) / (Mc / M20) - 1) * 100
Y = ((P / P5) / (Mc / M5) - 1) * 100
SAME = np.zeros((N, C), np.int32)
SAME[1:] = ((P[1:] == P[:-1]) & ~np.isnan(P[1:])).astype(np.int32)
cs_ = np.cumsum(SAME, axis=0)
S20 = cs_.copy()
S20[20:] = cs_[20:] - cs_[:-20]
FROZEN = S20 >= 20
COUNT = ~np.isnan(P) & ~np.isnan(P5) & ~np.isnan(P20) & (J20 == 0) & ~FROZEN
SPROUT = COUNT & (X < 5) & (Y >= 0)

PF = lead(P, 20)
MF = lead(Mc, 20)
JF = lead(J20.astype(float), 20)
DEF = ~np.isnan(P) & ~np.isnan(PF) & (np.nan_to_num(JF, nan=1.0) == 0)
EXF = (PF / P) / (MF / Mc) - 1
FLOWER = DEF & (EXF >= 0.05)
FALL = DEF & (EXF <= -0.05)
EXC = np.where(DEF, np.clip(np.nan_to_num(EXF, nan=0.0), -0.5, 0.5), 0.0)
BASEM = COUNT & DEF


class NS:
    pass


F = NS()
F.P, F.X, F.Y = P, X, Y
F.R10 = ((P / P10) / (Mc / M10) - 1) * 100
F.R60 = ((P / P60) / (Mc / M60) - 1) * 100
F.R120 = ((P / P120) / (Mc / M120) - 1) * 100
F.HI = P / roll(P, 120, np.max)
F.LO = P / roll(P, 60, np.min)
F.H20 = P / roll(P, 20, np.max)
F.MA20 = roll_mean(P, 20)
F.MA60 = roll_mean(P, 60)
VOL = roll_std(R, 20)
VOL60 = roll_std(R, 60)
volMed = np.nanmedian(np.where(SPROUT, VOL, np.nan), axis=1)[:, None]
F.VREL = VOL / volMed
F.VR = VOL / VOL60
UPD = np.where(np.isnan(R), 0, (R > 0).astype(np.int32))
cu = np.cumsum(UPD, axis=0)
UP10 = cu.copy()
UP10[10:] = cu[10:] - cu[:-10]
UP10 = UP10.astype(float)
UP10[:10] = np.nan
F.UP10 = UP10
RUN = np.zeros((N, C), np.int32)
for t in range(1, N):
    RUN[t] = np.where(SPROUT[t], RUN[t - 1] + 1, 0)
RUN[0] = SPROUT[0].astype(np.int32)
F.RUN = RUN
F.MXR = roll(R, 20, np.max)
F.MXA = roll(np.abs(R), 20, np.max)

# 업종(회원 5곳 이상) — 업종 지수 · 자리 · 고루 오름 · 그날 큰 회사 셋(그날 몸값 어림 · 오늘 차례는 안 씀)
ind_of = np.array([mkt[c].get('i') or '' for c in codes])
inds = [g for g in sorted(set(ind_of)) if g and np.sum(ind_of == g) >= 5]
lastP = np.array([P[~np.isnan(P[:, j]), j][-1] if np.any(~np.isnan(P[:, j])) else np.nan for j in range(C)])
shares = np.array([CAP.get(c, np.nan) or np.nan for c in codes], float) / lastP
SIZE = P * shares[None, :]
cnt_sz = np.where(COUNT & ~np.isnan(SIZE), SIZE, np.nan)
order = np.argsort(np.argsort(np.where(np.isnan(cnt_sz), np.inf, cnt_sz), axis=1), axis=1).astype(float)  # 0 = 가장 작음
nvalid = np.sum(~np.isnan(cnt_sz), axis=1)[:, None]
F.SZP = np.where(np.isnan(cnt_sz), np.nan, (order + 1) / np.maximum(nvalid, 1))
TOP3H = np.zeros((N, C), bool)
cell10 = ~np.isnan(P) & ~np.isnan(P10) & (J10 == 0)
up2 = cell10 & (P * 100 > P10 * 102)
chg10 = np.where(cell10, P / P10 - 1, np.nan)
IX = np.full((N, C), np.nan)
IY = np.full((N, C), np.nan)
I60 = np.full((N, C), np.nan)
IBR = np.full((N, C), np.nan)
IBIG = np.full((N, C), np.nan)
IREAL = np.zeros((N, C), bool)
IRB = np.zeros((N, C), np.int32)
ISZ = np.zeros((N, C), np.int32)
IEXF = np.full((N, C), np.nan)  # 업종 한 달 뒤 앞선 만큼(못 된 까닭 셈에만)
NB = np.zeros(N, np.int32)
for g in inds:
    cols = np.where(ind_of == g)[0]
    sz = SIZE[:, cols]
    key = np.where(np.isnan(sz), -np.inf, sz)
    top = np.argsort(-key, axis=1)[:, :3]
    for t in range(N):
        pick = cols[top[t]]
        okp = ~np.isnan(SIZE[t, pick])
        TOP3H[t, pick[okp]] = True
    I = index_of(cols)[:, None]
    ix = ((I / lag(I, 20)) / (Mc / M20) - 1) * 100
    iy = ((I / lag(I, 5)) / (Mc / M5) - 1) * 100
    i60 = ((I / lag(I, 60)) / (Mc / M60) - 1) * 100
    nc = np.sum(cell10[:, cols], axis=1)
    nu = np.sum(up2[:, cols], axis=1)
    br = np.where(nc > 0, nu / np.maximum(nc, 1), np.nan)[:, None]
    bigm = np.where(TOP3H[:, cols], chg10[:, cols], np.nan)
    bcnt = np.sum(~np.isnan(bigm), axis=1)
    bm = np.where(bcnt > 0, np.nansum(bigm, axis=1) / np.maximum(bcnt, 1), np.nan)[:, None]
    zb = (ix >= 5) & (iy >= 0)
    zs = (ix < 5) & (iy >= 0)
    p1 = iy >= 2
    p2 = (nu * 2 >= nc) & (nc > 0)
    p3 = np.nan_to_num(bm[:, 0], nan=-1) >= 0.01
    p4 = (I / lag(I, 10))[:, 0] > 1
    real = zs[:, 0] & p1[:, 0] & p2 & p3 & p4
    rb = np.zeros(N, np.int32)
    for t in range(N):
        rb[t] = (rb[t - 1] + 1 if t else 1) if zb[t, 0] else 0
    IX[:, cols], IY[:, cols], I60[:, cols] = ix, iy, i60
    IBR[:, cols], IBIG[:, cols] = br, bm
    IREAL[:, cols] = real[:, None]
    IRB[:, cols] = rb[:, None]
    ISZ[:, cols] = len(cols)
    IEXF[:, cols] = (lead(I, 20) / I) / (MF / Mc) - 1
    NB += zb[:, 0].astype(np.int32)
F.TOP3H = TOP3H
F.IX, F.IY, F.I60, F.IBR, F.IBIG, F.IRB, F.ISZ = IX, IY, I60, IBR, IBIG, IRB, ISZ
F.IZB = (IX >= 5) & (IY >= 0)
F.IZS = (IX < 5) & (IY >= 0)
F.IREAL = IREAL
F.IUP = (IX < 0) & (IY >= 2)
F.IWILT = (IX >= 5) & (IY < 0)
F.IQ = (IX < 5) & (IY < 0)
F.IY0 = IY >= 0
MK = lambda k: ((M / np.concatenate([np.full(k, np.nan), M[:-k]]) - 1) * 100)[:, None]
F.MK20, F.MK5, F.MK60 = MK(20), MK(5), MK(60)
F.MB = (np.sum(COUNT & (X >= 0), axis=1) / np.maximum(np.sum(COUNT, axis=1), 1))[:, None]
F.NB = NB[:, None]

# ── 앞 · 뒤 기록 ──
TL = N - 21
MID = next(t for t in range(T0 + 1, N) if D[t] >= SPLIT)
PER = {'train': (T0, MID), 'test': (MID, TL + 1)}


def mask_of_parts(parts):
    m = np.ones((N, C), bool)
    for p in parts:
        m &= np.asarray(np.broadcast_to(AT[p]['f'](F), (N, C)), bool)
    return m


def perday(mask, a, b):
    m = mask[a:b]
    return (np.sum(m, axis=1).astype(float), np.sum(m & FLOWER[a:b], axis=1).astype(float),
            np.sum(m & FALL[a:b], axis=1).astype(float), np.sum(np.where(m, EXC[a:b], 0.0), axis=1))


IDX = {}
for per, (a, b) in PER.items():
    L = b - a
    nblk = int(np.ceil(L / BLOCK))
    starts = RNG.integers(0, L - BLOCK + 1, size=(REPS, nblk))
    IDX[per] = (starts[:, :, None] + np.arange(BLOCK)[None, None, :]).reshape(REPS, -1)[:, :L]
BASE = {per: perday(BASEM, a, b) for per, (a, b) in PER.items()}


def q(v):
    return float(np.percentile(v, 2.5)), float(np.percentile(v, 97.5))


def stat(mask, per):
    a, b = PER[per]
    nb, hb, fb, eb = BASE[per]
    g = mask & BASEM & SPROUT
    ng, hg, fg, eg = perday(g, a, b)
    n, h = ng.sum(), hg.sum()
    idx = IDX[per]
    NB_, NG_ = np.maximum(nb[idx].sum(1), 1), np.maximum(ng[idx].sum(1), 1)
    lo, hi = q((hg[idx].sum(1) / NG_ - hb[idx].sum(1) / NB_) * 100)
    elo, ehi = q((eg[idx].sum(1) / NG_ - eb[idx].sum(1) / NB_) * 100)
    base = hb.sum() / max(nb.sum(), 1) * 100
    rate = h / max(n, 1) * 100
    return {'n': int(n), 'dates': int(np.sum(ng > 0)), 'days': int(b - a), 'hits': int(h), 'rate': round(rate, 2), 'base': round(base, 2),
            'diff': round(rate - base, 2), 'lo': round(lo, 2), 'hi': round(hi, 2),
            'ex': round(eg.sum() / max(n, 1) * 100, 2), 'exBase': round(eb.sum() / max(nb.sum(), 1) * 100, 2), 'elo': round(elo, 2), 'ehi': round(ehi, 2),
            'fall': round(fg.sum() / max(n, 1) * 100, 2), 'fallBase': round(fb.sum() / max(nb.sum(), 1) * 100, 2)}


def deep(mask, per='train'):
    """37 → 3 잣대 다섯 · 적기만 하는 것(해마다 · 못 된 까닭)"""
    a, b = PER[per]
    g = (mask & BASEM & SPROUT)[a:b]
    ng = np.sum(g, axis=1)
    hg = np.sum(g & FLOWER[a:b], axis=1)
    bm = BASEM[a:b]
    nb = np.sum(bm, axis=1)
    hb = np.sum(bm & FLOWER[a:b], axis=1)
    L = b - a
    edges = [round(L * k / 4) for k in range(5)]
    blocks = []
    for k in range(4):
        s, e = edges[k], edges[k + 1]
        r = hg[s:e].sum() / max(ng[s:e].sum(), 1) * 100
        rb = hb[s:e].sum() / max(nb[s:e].sum(), 1) * 100
        blocks.append({'from': D[a + s], 'to': D[a + e - 1], 'n': int(ng[s:e].sum()), 'rate': round(r, 2), 'base': round(rb, 2), 'diff': round(r - rb, 2)})
    years = {}
    for yv in sorted({D[t][:4] for t in range(a, b)}):
        ts = np.array([t - a for t in range(a, b) if D[t][:4] == yv])
        r = hg[ts].sum() / max(ng[ts].sum(), 1) * 100
        rb = hb[ts].sum() / max(nb[ts].sum(), 1) * 100
        years[yv] = {'n': int(ng[ts].sum()), 'rate': round(r, 2), 'base': round(rb, 2), 'diff': round(r - rb, 2)}
    cols = np.where(g.any(axis=0))[0]
    per_ind = {}
    colsum = g.sum(axis=0)
    for j in cols:
        per_ind[ind_of[j]] = per_ind.get(ind_of[j], 0) + int(colsum[j])
    n = int(ng.sum())
    top = max(per_ind.items(), key=lambda kv: kv[1]) if per_ind else ('', 0)
    miss = g & ~FLOWER[a:b]
    ex = EXF[a:b]
    iexf = IEXF[a:b]
    w0 = int(np.sum(miss & (ex >= 0)))
    w1 = int(np.sum(miss & (ex < 0) & (np.nan_to_num(iexf, nan=0.0) < 0)))
    w2 = int(np.sum(miss & (ex < 0))) - w1
    return {'blocks': blocks, 'blocksUp': sum(1 for x in blocks if x['diff'] > 0), 'years': years,
            'topInd': top[0], 'topShare': round(top[1] / max(n, 1), 4), 'cover': round(float(np.mean(ng > 0)), 4), 'perDay': round(n / max(L, 1), 2),
            'why': [w0, w1, w2]}


res = {'schema': 'dori-sprout365-research-1', 'spec': 'docs/design/sprout365-2026-10-27/spec.md v1', 'root': ROOT, 'seed': SEED, 'reps': REPS, 'block': BLOCK,
       'days': N, 'from': D[0], 'to': D[-1], 'companies': C, 'industries': len(inds),
       'train': [D[T0], D[MID - 1]], 'test': [D[MID], D[TL]], 'candidates': {}}
MASK = {}
for c in CANDS:
    m = mask_of_parts(c['parts'])
    MASK[c['id']] = m
    s = stat(m, 'train')
    s.update({'base_': c['base'], 'fam': c['fam'], 'label': c['label']})
    s['ok'] = bool(s['n'] >= 1000 and s['dates'] >= 50 and s['elo'] > 0)
    res['candidates'][c['id']] = s
c3tr = res['candidates']['iz1']
res['c3'] = {'train': {k: c3tr[k] for k in ('n', 'rate', 'base', 'diff', 'lo', 'elo', 'fall', 'fallBase')}}

# ── 365 → 37 ──
rank = sorted(res['candidates'].items(), key=lambda kv: (not kv[1]['ok'], -kv[1]['lo'], -kv[1]['diff'], -kv[1]['n']))
seen, top37 = {}, []
for k, s in rank:
    sig = s['base_'] + ':' + s['fam']
    if seen.get(sig, 0) >= 2:
        continue
    seen[sig] = seen.get(sig, 0) + 1
    top37.append(k)
    if len(top37) == 37:
        break
res['n_ok'] = sum(1 for s in res['candidates'].values() if s['ok'])
res['top37'] = top37

# ── 37 → 3 ──
DEEP = {}
for k in top37:
    s = res['candidates'][k]
    d = deep(MASK[k])
    rules = [d['blocksUp'] >= 3, s['fall'] <= s['fallBase'] + 2, d['topShare'] <= 0.35, d['cover'] >= 0.30 and d['perDay'] <= 60, s['rate'] > c3tr['rate']]
    d['rules'] = rules
    d['pass'] = all(rules)
    DEEP[k] = d
res['deep'] = DEEP
order3 = sorted(top37, key=lambda k: (-sum(DEEP[k]['rules']), -res['candidates'][k]['lo'], -res['candidates'][k]['n']))
top3, sigs = [], set()
for k in order3:
    sig = res['candidates'][k]['base_'] + ':' + res['candidates'][k]['fam']
    if sig in sigs:
        continue
    sigs.add(sig)
    top3.append(k)
    if len(top3) == 3:
        break
res['top3'] = top3

# ── 3 → 1 ──
m1, m2, m3 = (MASK[k] for k in top3)
OPTS = {
    top3[0]: m1, top3[1]: m2, top3[2]: m3,
    f'{top3[0]} & {top3[1]}': m1 & m2, f'{top3[0]} & {top3[2]}': m1 & m3, f'{top3[1]} & {top3[2]}': m2 & m3,
    f'{top3[0]} & {top3[1]} & {top3[2]}': m1 & m2 & m3,
    f'셋 가운데 둘 이상': (m1.astype(np.int8) + m2.astype(np.int8) + m3.astype(np.int8)) >= 2,
}
res['options'] = {}
for k, m in OPTS.items():
    s = stat(m, 'train')
    d = deep(m)
    s.update({'cover': d['cover'], 'perDay': d['perDay'], 'topShare': d['topShare'], 'blocksUp': d['blocksUp'], 'why': d['why']})
    s['ok'] = bool(s['n'] >= 1000 and d['cover'] >= 0.30)
    res['options'][k] = s
okopts = [k for k, s in res['options'].items() if s['ok']]
final = max(okopts, key=lambda k: (res['options'][k]['lo'], res['options'][k]['n'])) if okopts else max(res['options'], key=lambda k: res['options'][k]['lo'])
res['final'] = final
FM = OPTS[final]
a, b = PER['train']
gg = [(MASK[k] & BASEM & SPROUT)[a:b] for k in top3]
res['overlap'] = {f'{top3[i]}~{top3[j]}': round(float(np.sum(gg[i] & gg[j]) / max(np.sum(gg[i] | gg[j]), 1)), 4) for i in range(3) for j in range(i + 1, 3)}

# ── 뒤 기록 한 번 ──
c3te = stat(MASK['iz1'], 'test')
fte = stat(FM, 'test')
res['c3']['test'] = {k: c3te[k] for k in ('n', 'rate', 'base', 'diff', 'lo', 'elo', 'fall', 'fallBase')}
fte['pass'] = bool(fte['lo'] > 0 and fte['elo'] > 0 and fte['rate'] > c3te['rate'])
res['final_test'] = fte
res['final_deep_test'] = deep(FM, 'test')
res['c3_deep_test'] = deep(MASK['iz1'], 'test')


# 요즘 40날(적기만) — 결과가 있는 마지막 40날 · 같은 날 아무 회사와
def recent(mask, nd=40):
    a, b = TL - nd + 1, TL + 1
    g = (mask & BASEM & SPROUT)[a:b]
    bm = BASEM[a:b]
    n, h = int(g.sum()), int((g & FLOWER[a:b]).sum())
    nb_, hb_ = int(bm.sum()), int((bm & FLOWER[a:b]).sum())
    return {'from': D[a], 'to': D[TL], 'n': n, 'rate': round(h / max(n, 1) * 100, 2), 'base': round(hb_ / max(nb_, 1) * 100, 2)}


res['recent'] = {'final': recent(FM), 'c3': recent(MASK['iz1'])}

# 오늘(T = N − 1)
T = N - 1
rows = []
for j in np.where(FM[T] & SPROUT[T])[0]:
    rows.append([codes[j], mkt[codes[j]].get('n'), ind_of[j], round(float(X[T, j]), 2), round(float(Y[T, j]), 2)])
rows.sort(key=lambda r: (r[2], r[1] or ''))
res['today'] = {'date': D[T], 'n': len(rows), 'c3': int(np.sum(MASK['iz1'][T] & SPROUT[T])), 'rows': rows}

txt = json.dumps(res, ensure_ascii=False, indent=1)
if OUT:
    os.makedirs(os.path.dirname(OUT) or '.', exist_ok=True)
    open(OUT, 'w', encoding='utf8').write(txt + '\n')
print(json.dumps({k: res[k] for k in ('days', 'from', 'to', 'companies', 'industries', 'train', 'test', 'n_ok', 'top3', 'final')}, ensure_ascii=False))
print('C3', res['c3'])
for k in top37:
    s, d = res['candidates'][k], DEEP[k]
    print('37', k, s['label'], 'n', s['n'], 'rate', s['rate'], 'base', s['base'], 'lo', s['lo'], 'elo', s['elo'], 'fall', s['fall'], s['fallBase'], 'rules', d['rules'], 'cover', d['cover'], 'perDay', d['perDay'], 'top', d['topShare'])
for k, s in res['options'].items():
    print('OPT', k, 'n', s['n'], 'rate', s['rate'], 'lo', s['lo'], 'elo', s['elo'], 'cover', s['cover'], 'perDay', s['perDay'], 'ok', s['ok'])
print('FINAL', final, 'TEST', fte, 'C3TEST', res['c3']['test'])
print('RECENT', res['recent'])
print('TODAY', res['today']['n'], 'c3', res['today']['c3'], res['today']['rows'][:8])
