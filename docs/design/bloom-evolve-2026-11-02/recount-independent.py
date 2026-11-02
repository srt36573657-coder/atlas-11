#!/usr/bin/env python3
"""꽃 될 회사 고르는 법 다시 세우기 — 따로 센 일꾼(독립 재계산)

이 약속(docs/design/bloom-evolve-2026-11-02/spec.md v1)과 자료만 보고 처음부터 셈한다.
앞 판과 같은 뜻(자료 읽기 · 시장 지수 M · COUNT · SPROUT · FLOWER · FALL · EXC · BASEM · T0 · TL ·
이름 공간 F · 낱 조건 134 목록 A)은 scripts/atlas11/research/sprout365.py 에서 글자 그대로 옮겨 적었다.
그 파일의 후보 365 · 앞뒤 가름 · 37/3/1 셈은 옮기지 않았다.

쓰는 법:
  python3 recount-independent.py [자료 폴더] [결과 json] [--fin-ge] [--rk5-39] [--fall-pickdays] [--fin-noguard] [--base-pickdays]
    --fin-ge         실적을 「결산 달 끝 + 90일」 그날(거래일이면)부터 앎으로 셈(기본 = 그날이 지난 첫 거래일)
    --rk5-39         rk5 = 업종 77 차례 아래 39(가운데 업종 넣음 · 기본 = IX 가 가운데 값보다 작은 업종)
    --fall-pickdays  크게 떨어짐 잣대의 「같은 날 아무 회사」를 후보가 고른 날만으로(기본 = 배우는 날 모두)
    --fin-noguard    fin2 · fin3 에 「앞 해 매출 > 0」을 안 붙임(기본 = fin1 처럼 붙임)
    --base-pickdays  점수의 q(아무 회사 꽃 비율) · se 의 아무 회사 몫 · 크게 떨어짐 잣대를 후보가 고른 날만으로(기본 = 배우는 날 모두)
  기본(아무 깃발 없음)이 약속을 읽은 본 셈이고, 깃발은 뜻이 둘로 읽히는 자리의 흔들림 보기용이다.
읽기만 한다. 앞날을 맞히는 숫자가 아니라 지난 기록에서 센 횟수다.
"""
import bisect
import calendar
import datetime
import json
import os
import sys
import time
import warnings

import numpy as np

warnings.filterwarnings('ignore')
np.seterr(all='ignore')
T_START = time.time()
FLAGS = {a for a in sys.argv[1:] if a.startswith('--')}
ARGS = [a for a in sys.argv[1:] if not a.startswith('--')]
ROOT = ARGS[0] if len(ARGS) > 0 else 'site/atlas/data'
OUT = ARGS[1] if len(ARGS) > 1 else None
T0 = 120
BLOCK = 20
ZQ = 1.645
SPLIT_B = '2025-04-04'


def log(*a):
    print(f'[{time.time() - T_START:7.1f}s]', *a, flush=True)


# ════════════════════════════════════════════════════════════════════════════
# 아래 「낱 조건 134」 덩어리는 sprout365.py 30–168 줄 그대로
# ════════════════════════════════════════════════════════════════════════════
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
# ════════════════════════════════════════════════════════════════════════════
# 낱 조건 134 끝 · 아래 「자료 · 뜻」 덩어리는 sprout365.py 193–399 줄 그대로
# ════════════════════════════════════════════════════════════════════════════

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
# ════════════════════════════════════════════════════════════════════════════
# 옮긴 덩어리 끝 · 여기부터는 이 약속(spec v1)만 보고 새로 씀
# ════════════════════════════════════════════════════════════════════════════
TL = N - 21
log('base features done', 'N', N, 'C', C, 'inds', len(inds), 'TL', D[TL])
del RV, P5, P10, P20, P60, P120, SAME, cs_, S20, cnt_sz, order, chg10, up2, cell10, IEXF, UPD, cu, JF, EXC

# ── 새 갈래 trd(값 흐름) ──
F.MA120 = roll_mean(P, 120)                       # 반년 평균 값(120날 모두 있을 때만)
F.MA60L20 = lag(F.MA60, 20)                       # 한 달 전 석 달 평균
F.MAX60 = roll(P, 60, np.max)                     # 석 달 가장 높은 값
F.MINR20 = roll(R, 20, np.min)                    # 한 달(t−19..t) 하루 오르내림 가운데 가장 낮은 값(빈 날 있으면 빈 값)
F.VOL20 = VOL                                     # 앞 판 한 달 흔들림(모집단 표준편차)

# ── 새 갈래 rk(업종 안 · 업종끼리 차례) ──
RK1 = np.zeros((N, C), bool)
RK2 = np.zeros((N, C), bool)
for g in sorted(set(ind_of)):
    if not g:
        continue
    cols = np.where(ind_of == g)[0]
    cmask = COUNT[:, cols]
    xg = np.where(cmask, X[:, cols], np.nan)
    med = np.nanmedian(xg, axis=1)[:, None]       # 그날 같은 업종 셀 수 있는 회사의 x 가운데 값
    RK1[:, cols] = cmask & (X[:, cols] >= med)
    RK2[:, cols] = cmask & (X[:, cols] < med)
G = len(inds)
gcols = [np.where(ind_of == g)[0] for g in inds]
GIX = np.column_stack([IX[:, cols[0]] for cols in gcols])   # (N, 77) 업종 한 달 IX — inds 는 이름 차례
GR3 = np.zeros((N, G), bool)
GR4 = np.zeros((N, G), bool)
GR5 = np.zeros((N, G), bool)
for t in range(N):
    v = GIX[t]
    okg = np.where(~np.isnan(v))[0]
    if len(okg) == 0:
        continue
    rank = sorted(okg.tolist(), key=lambda k: (-v[k], k))   # IX 큰 차례 · 같으면 이름 차례
    GR3[t, rank[:5]] = True
    GR4[t, rank[:10]] = True
    if '--rk5-39' in FLAGS:
        GR5[t, rank[len(rank) // 2:]] = True                 # 아래 39(가운데 넣음)
    else:
        medg = np.median(v[okg])
        GR5[t, okg[v[okg] < medg]] = True                    # IX 가 77 업종 가운데 값보다 작음(아래 38)
RK3 = np.zeros((N, C), bool)
RK4 = np.zeros((N, C), bool)
RK5 = np.zeros((N, C), bool)
for k, cols in enumerate(gcols):
    RK3[:, cols] = GR3[:, k:k + 1]
    RK4[:, cols] = GR4[:, k:k + 1]
    RK5[:, cols] = GR5[:, k:k + 1]
F.RK1, F.RK2, F.RK3, F.RK4, F.RK5 = RK1, RK2, RK3, RK4, RK5
log('trd rk done', 'rk5 per day (median over days>=T0):', float(np.median(GR5[T0:].sum(1))))

# ── 새 갈래 fin(해마다 실적 · 그날 알 수 있던 것만) ──
DDATE = [datetime.date.fromisoformat(x) for x in D]
FIN_GE = '--fin-ge' in FLAGS


def known_from(ystr):
    """결산 달 끝 + 90일이 지난 첫 거래일(기본 = 그날보다 뒤인 첫 거래일 · --fin-ge = 그날이거나 뒤) — 자료 밖이면 N"""
    yy, mo = (int(z) for z in ystr.split('.'))
    lim = datetime.date(yy, mo, calendar.monthrange(yy, mo)[1]) + datetime.timedelta(days=90)
    return bisect.bisect_left(DDATE, lim) if FIN_GE else bisect.bisect_right(DDATE, lim)


FIN = {k: np.zeros((N, C), bool) for k in range(1, 13)}
TIX = np.arange(N)
fin_years_seen = 0
for j, c in enumerate(codes):
    fn_ = json.load(open(f'{ROOT}/co/{c}.json', encoding='utf8')).get('fin') or {}
    ys = fn_.get('years') or []
    L = len(ys)
    if L == 0:
        continue
    fin_years_seen += L

    def vec(name):
        vs = list(fn_.get(name) or [])
        vs = (vs + [None] * L)[:L]
        return np.array([np.nan if v is None else float(v) for v in vs] + [np.nan])  # 끝 칸 = 없음

    av = np.array([known_from(y) for y in ys])
    assert np.all(np.diff(av) >= 0), (c, ys)
    yi = np.searchsorted(av, TIX, side='right') - 1    # 그날 알 수 있는 가장 늦은 결산 해(파일 차례) · 없으면 −1
    pi = yi - 1                                        # 앞 해 = 파일 years 차례 바로 앞
    yi_ = np.where(yi >= 0, yi, L)
    pi_ = np.where(pi >= 0, pi, L)
    rev, op, net, roe, debt = (vec(k) for k in ('rev', 'op', 'net', 'roe', 'debt'))
    rY, rP, oY, oP, nY, eY, dY = rev[yi_], rev[pi_], op[yi_], op[pi_], net[yi_], roe[yi_], debt[yi_]
    FIN[1][:, j] = (rY > rP) & (rP > 0)
    guard = np.ones(N, bool) if '--fin-noguard' in FLAGS else (rP > 0)
    FIN[2][:, j] = (10 * rY > 11 * rP) & guard         # 10% 넘게(정수 셈으로 정확히)
    FIN[3][:, j] = (5 * rY > 6 * rP) & guard           # 20% 넘게
    FIN[4][:, j] = (rY > 0) & (rY < rP)
    FIN[5][:, j] = oY > 0
    FIN[6][:, j] = oY < 0
    FIN[7][:, j] = oY > oP
    FIN[8][:, j] = (10 * oY >= rY) & (rY > 0)          # 영업이익률 10% 이상
    FIN[9][:, j] = nY > 0
    FIN[10][:, j] = (oP <= 0) & (oY > 0)
    FIN[11][:, j] = eY >= 10
    FIN[12][:, j] = (dY >= 0) & (dY < 100)
F.FIN = FIN
log('fin done', 'years seen', fin_years_seen, 'fin_ge', FIN_GE)

# ── 낱 조건 156 ──
SING = [{'id': a['id'], 'fam': a['fam'], 'label': a['label'], 'f': a['f']} for a in A]
FIN_LAB = ['매출이 앞 해보다 늘었음', '매출 10% 넘게 늘었음', '매출 20% 넘게 늘었음', '매출이 줄었음',
           '영업이익이 남', '영업이익이 모자람', '영업이익이 앞 해보다 늘었음', '영업이익률 10% 이상',
           '순이익이 남', '영업이익 모자람에서 남으로', 'ROE 10% 이상', '빚이 자기 돈보다 적음']
for k, lab in enumerate(FIN_LAB, 1):
    SING.append({'id': f'fin{k}', 'fam': 'fin', 'label': lab, 'f': (lambda F, k=k: F.FIN[k])})
for k, (lab, f) in enumerate([
    ('반년 평균 값 위', lambda F: F.P >= F.MA120),
    ('석 달 평균이 한 달 전보다 높음', lambda F: F.MA60 > F.MA60L20),
    ('석 달 가장 높은 값의 90% 이상', lambda F: F.P / F.MAX60 >= 0.90),
    ('한 달 동안 하루 5% 넘게 내린 날 없음', lambda F: F.MINR20 > -0.05),
    ('한 달 흔들림 2% 아래', lambda F: F.VOL20 < 0.02)], 1):
    SING.append({'id': f'trd{k}', 'fam': 'trd', 'label': lab, 'f': f})
for k, (lab, f) in enumerate([
    ('업종 안 한 달 x 위 절반', lambda F: F.RK1), ('업종 안 한 달 x 아래 절반', lambda F: F.RK2),
    ('업종 77 가운데 한 달 IX 위 다섯', lambda F: F.RK3), ('업종 77 가운데 한 달 IX 위 열', lambda F: F.RK4),
    ('업종 77 가운데 한 달 IX 아래 절반', lambda F: F.RK5)], 1):
    SING.append({'id': f'rk{k}', 'fam': 'rk', 'label': lab, 'f': f})
NSG = len(SING)
assert NSG == 156, NSG
FAMS = [s['fam'] for s in SING]

# ── 후보 = 낱 156 + 짝(다른 갈래끼리 모두) ──
PAIRS = [(i, j) for i in range(NSG) for j in range(i + 1, NSG) if FAMS[i] != FAMS[j]]
IDS = [s['id'] for s in SING] + [SING[i]['id'] + '&' + SING[j]['id'] for i, j in PAIRS]
NCAND = len(IDS)
assert len(set(IDS)) == NCAND
PI = np.array([i for i, _ in PAIRS])
PJ = np.array([j for _, j in PAIRS])
log('candidates', NSG, '+', len(PAIRS), '=', NCAND)

# ── 싹 바탕으로 줄임: 회사 · 날 = SPROUT & BASEM & T0 ≤ t ≤ TL ──
U = SPROUT & BASEM
U[:T0] = False
U[TL + 1:] = False
TT, JJ = np.nonzero(U)                             # t 차례로 놓임
NR = len(TT)
AM = np.zeros((NR, NSG), bool)
for k, s in enumerate(SING):
    v = np.broadcast_to(np.asarray(s['f'](F)), (N, C))
    AM[:, k] = v[TT, JJ]
FLR = FLOWER[TT, JJ]
FAR = FALL[TT, JJ]
log('sprout universe rows', NR, 'single hit counts (min/max)', int(AM.sum(0).min()), int(AM.sum(0).max()))

# ── 날마다 후보별 고른 수 · 꽃 수 · 크게 떨어짐 수 ──
ND = TL - T0 + 1
BOUND = np.searchsorted(TT, np.arange(T0, TL + 2))
nD = np.zeros((ND, NCAND), np.int32)
hD = np.zeros((ND, NCAND), np.int32)
fD = np.zeros((ND, NCAND), np.int32)
for d in range(ND):
    a0, a1 = BOUND[d], BOUND[d + 1]
    if a1 <= a0:
        continue
    Ad = AM[a0:a1].astype(np.float32)
    for Mx, out in ((Ad.T @ Ad, nD), (Ad.T @ (Ad * FLR[a0:a1, None]), hD), (Ad.T @ (Ad * FAR[a0:a1, None]), fD)):
        out[d, :NSG] = np.rint(np.diag(Mx))
        out[d, NSG:] = np.rint(Mx[PI, PJ])
BM = BASEM[T0:TL + 1]
nbD = BM.sum(1).astype(np.int64)
hbD = (BM & FLOWER[T0:TL + 1]).sum(1).astype(np.int64)
fbD = (BM & FALL[T0:TL + 1]).sum(1).astype(np.int64)
log('per-day counts done')


def cum(a):
    out = np.zeros((a.shape[0] + 1,) + a.shape[1:], np.int64)
    np.cumsum(a, axis=0, out=out[1:])
    return out


cN, cH, cF = cum(nD), cum(hD), cum(fD)
PD = (nD > 0)
cP = cum(PD.astype(np.int32))
cnb, chb, cfb = cum(nbD), cum(hbD), cum(fbD)
BASE_PD = '--base-pickdays' in FLAGS
FALL_PD = '--fall-pickdays' in FLAGS or BASE_PD
if FALL_PD:
    cnbP = cum(PD * nbD[:, None])
    cfbP = cum(PD * fbD[:, None])
if BASE_PD:
    chbP = cum(PD * hbD[:, None])
log('cumsums done')


def select(d_end):
    """배우는 날 = d 0 .. d_end(t = T0 .. T0 + d_end) · 들 수 있는 것 가운데 LB 가장 큰 것 · 같으면 n 큰 것 · 그다음 이름 차례"""
    L = d_end + 1
    n = cN[L] - cN[0]
    h = cH[L] - cH[0]
    f = cF[L] - cF[0]
    pdays = cP[L] - cP[0]
    nb = int(cnb[L] - cnb[0])
    hb = int(chb[L] - chb[0])
    fb = int(cfb[L] - cfb[0])
    if FALL_PD:
        nbp = cnbP[L] - cnbP[0]
        fbp = cfbP[L] - cfbP[0]
        fall_ok = 100 * f * nbp <= n * (100 * fbp + 2 * nbp)
    else:
        fall_ok = 100 * f * nb <= n * (100 * fb + 2 * nb)
    ok = (n >= 300) & (10 * pdays >= 4 * L) & (n <= 20 * pdays) & fall_ok
    idx = np.nonzero(ok)[0]
    info = {'train_days': L, 'n_eligible': int(len(idx)), 'base': round(100 * hb / nb, 4), 'nb': nb}
    if len(idx) == 0:
        return None, info
    nn = n[idx].astype(float)
    p = h[idx] / nn
    st = np.arange(0, L, BLOCK)
    en = np.minimum(st + BLOCK, L)
    NBk = (cN[en] - cN[st])[:, idx].astype(float)
    HBk = (cH[en] - cH[st])[:, idx].astype(float)
    if BASE_PD:
        nbq = (cnbP[L] - cnbP[0])[idx].astype(float)
        q = (chbP[L] - chbP[0])[idx] / nbq
        nbk = (cnbP[en] - cnbP[st])[:, idx].astype(float)
        hbk = (chbP[en] - chbP[st])[:, idx].astype(float)
        e = (HBk - p * NBk) / nn - (hbk - q * nbk) / nbq
    else:
        q = hb / nb
        nbk = (cnb[en] - cnb[st]).astype(float)
        hbk = (chb[en] - chb[st]).astype(float)
        e = (HBk - p * NBk) / nn - ((hbk - q * nbk) / nb)[:, None]
    se = 100 * np.sqrt(np.sum(e * e, axis=0))
    dd = 100 * (p - q)
    lb = dd - ZQ * se
    srt = sorted(range(len(idx)), key=lambda k: (-lb[k], -nn[k], IDS[idx[k]]))
    best = srt[0]
    ci = int(idx[best])
    # 바로 뒤 후보(고른 날 · 수가 다른 첫 후보)와의 틈 — 서로 다른 셈에서 차례가 뒤집힐 수 있는지 보려고
    gap = None
    for k in srt[1:]:
        if nn[k] != nn[best] or h[idx[k]] != h[ci] or abs(lb[k] - lb[best]) > 1e-12:
            gap = {'id': IDS[int(idx[k])], 'LB': round(float(lb[k]), 6), 'gap': float(lb[best] - lb[k])}
            break
    same = [IDS[int(idx[k])] for k in srt[1:12] if lb[k] == lb[best] and nn[k] == nn[best]]
    info.update({'id': IDS[ci], 'cand': ci, 'n': int(n[ci]), 'hits': int(h[ci]), 'rate': round(100 * float(p[best]), 4),
                 'LB': float(lb[best]), 'd': float(dd[best]), 'se': float(se[best]), 'runner_up': gap, 'exact_ties': same,
                 'top5': [(IDS[int(idx[k])], round(float(lb[k]), 4), int(nn[k])) for k in srt[:5]]})
    return ci, info


# ── 걸어가며 고르기(달력 달) ──
months = []
for t in range(N):
    mk = D[t][:7]
    if not months or months[-1][0] != mk:
        months.append([mk, t, t])
    else:
        months[-1][2] = t
wN = np.zeros(ND, np.int64)
wH = np.zeros(ND, np.int64)
wF = np.zeros(ND, np.int64)
steps = []
started = False
first_s = None
for mk, s, last in months:
    if s > TL:
        break
    train = s - 20 - T0 + 1
    if not started:
        if train < 250:
            continue
        started = True
        first_s = s
    ci, info = select(s - 20 - T0)
    e = min(last, TL)
    ds = slice(s - T0, e - T0 + 1)
    row = {'month': mk, 's_date': D[s], 'train_days': train, 'chosen_id': None, 'chosen_LB': None,
           'eval_from': D[s], 'eval_to': D[e], 'eval_days': e - s + 1, 'n_eligible': info['n_eligible']}
    if ci is not None:
        wN[ds] = nD[ds, ci]
        wH[ds] = hD[ds, ci]
        wF[ds] = fD[ds, ci]
        row.update({'chosen_id': info['id'], 'chosen_LB': round(info['LB'], 4), 'train_n': info['n'], 'train_rate': round(info['rate'], 2),
                    'train_base': round(info['base'], 2), 'runner_up': info['runner_up'], 'exact_ties': info['exact_ties'],
                    'oos_n': int(nD[ds, ci].sum()), 'oos_hits': int(hD[ds, ci].sum())})
    steps.append(row)
    log('step', mk, D[s], 'train', train, 'elig', info['n_eligible'], '->', row['chosen_id'], row['chosen_LB'],
        'oos', row.get('oos_n'), row.get('oos_hits'), 'next', (info.get('runner_up') or {}).get('id'), (info.get('runner_up') or {}).get('gap'))

MID = next(t for t in range(T0 + 1, N) if D[t] >= SPLIT_B)
A0, B0, E1 = first_s - T0, MID - T0, TL - T0 + 1


def pstats(nv, hv, fv, a, b, full=True):
    n, h, f = int(nv[a:b].sum()), int(hv[a:b].sum()), int(fv[a:b].sum())
    nb, hb, fb = int(nbD[a:b].sum()), int(hbD[a:b].sum()), int(fbD[a:b].sum())
    pdn = int(np.sum(nv[a:b] > 0))
    out = {'from': D[T0 + a], 'to': D[T0 + b - 1], 'days': b - a, 'n': n, 'hits': h,
           'rate': round(100 * h / max(n, 1), 2), 'base': round(100 * hb / max(nb, 1), 2)}
    if full:
        out.update({'pick_days': pdn, 'pick_day_share': round(100 * pdn / max(b - a, 1), 2), 'per_pick_day': round(n / max(pdn, 1), 2),
                    'fall': round(100 * f / max(n, 1), 2), 'fall_base': round(100 * fb / max(nb, 1), 2)})
    return out


def cstats(cid, a, b, full=True):
    c = IDS.index(cid)
    return pstats(nD[:, c], hD[:, c], fD[:, c], a, b, full)


# ── 마지막 고르기(배우는 날 T0 ~ TL 모두) ──
cf, finfo = select(ND - 1)
final = None
if cf is not None:
    final = {'id': finfo['id'], 'n': finfo['n'], 'hits': finfo['hits'], 'rate': round(finfo['rate'], 2), 'base': round(finfo['base'], 2),
             'LB': round(finfo['LB'], 4), 'd': round(finfo['d'], 4), 'se': round(finfo['se'], 4), 'n_eligible': finfo['n_eligible'],
             'train_days': finfo['train_days'], 'runner_up': finfo['runner_up'], 'exact_ties': finfo['exact_ties'], 'top5': finfo['top5']}
log('FINAL', final)

FIX = 'hi1&iz1'   # 지금 조건 C3+hi1 = 짝 (iz1, hi1) — 낱 조건 차례로는 hi1 이 앞
res = {
    'schema': 'bloom-evolve-recount-independent-1', 'spec': 'docs/design/bloom-evolve-2026-11-02/spec.md v1',
    'flags': sorted(FLAGS), 'root': ROOT, 'days': N, 'from': D[0], 'to': D[-1], 'companies': C, 'industries': len(inds),
    'T0': [T0, D[T0]], 'TL': [TL, D[TL]], 'sprout_rows': int(NR),
    'n_singles': NSG, 'n_pairs': len(PAIRS), 'n_candidates': NCAND,
    'steps': steps, 'final': final,
    'periodA': pstats(wN, wH, wF, A0, E1), 'periodB': pstats(wN, wH, wF, B0, E1),
    'iz1&hi1': {'id_in_singles_order': FIX, 'periodA': cstats(FIX, A0, E1), 'periodB': cstats(FIX, B0, E1)},
    'iz1': {'periodA': cstats('iz1', A0, E1), 'periodB': cstats('iz1', B0, E1)},
    'check_vs_sprout365': {
        'iz1_train': cstats('iz1', 0, MID - T0), 'iz1_test': cstats('iz1', MID - T0, E1),
        'hi1&iz1_train': cstats(FIX, 0, MID - T0), 'hi1&iz1_test': cstats(FIX, MID - T0, E1)},
}
txt = json.dumps(res, ensure_ascii=False, indent=1)
if OUT:
    os.makedirs(os.path.dirname(OUT) or '.', exist_ok=True)
    open(OUT, 'w', encoding='utf8').write(txt + '\n')
print(json.dumps({k: res[k] for k in ('n_singles', 'n_candidates', 'final', 'periodA', 'periodB', 'iz1&hi1')}, ensure_ascii=False))
print('CHECK', json.dumps(res['check_vs_sprout365'], ensure_ascii=False))
log('done')
