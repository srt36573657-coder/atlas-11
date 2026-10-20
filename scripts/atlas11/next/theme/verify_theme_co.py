#!/usr/bin/env python3
# -*- coding: utf-8 -*-
# 회사 자리 따로 세기(결정표 docs/design/theme-2026-10-19/theme-engine.md 9 · v1.3 · 2026-10-20) — 다른 일꾼이 결정표만 보고 짠 것 그대로(구현 파일을 열지 않음)
#   저장소 판: 셈은 그대로 · 기본 길만 인자로 — python3 -I scripts/atlas11/next/theme/verify_theme_co.py <site>/atlas/data <결과.json>
#   2026-10-20 맞댐: 회사 2,548 · 못 셈 9 · 자리 틀림 0 · 소수 둘째 자리 값 틀림 0(site/next/data/theme-co.json 과) — docs/design/co-stage-2026-10-20/verify.json
"""Independent recount of the per-company theme clock zone.

Source of the rules: docs/design/theme-2026-10-19/theme-engine.md (v1.3),
sections 「들어오는 자료」, 「1. 지수」, 「2. 시계 자리」, 「8. 자료 파일」, 「9. 회사 자리」.
Written from the decision table text only (no existing implementation read).

Run:  python3 -I recount_co.py [DATA_DIR] [OUT_JSON]
"""
import json
import math
import os
import sys

DATA = 'site/atlas/data'
OUT = 'recount_co.json'
if len(sys.argv) > 1:
    DATA = sys.argv[1]
if len(sys.argv) > 2:
    OUT = sys.argv[2]

JUMP = 0.35        # section 1 / 9 ②: |r| >= 0.35
BLOOM_LINE = 5     # section 2: 꽃 선 x = 5


def load(path):
    with open(path, encoding='utf-8') as f:
        return json.load(f)


def usable(v):
    """A close exists unless it is 0, empty, or not a number (들어오는 자료: 0 · 빈 값 = 없음)."""
    if isinstance(v, bool) or not isinstance(v, (int, float)):
        return False
    if isinstance(v, float) and not math.isfinite(v):
        return False
    return v != 0


# ---- 들어오는 자료 ---------------------------------------------------------
dates = load(os.path.join(DATA, 'days.json'))['dates']
N = len(dates)
T = N - 1                                        # 기준일 T = N − 1

companies = load(os.path.join(DATA, 'mkt.json'))['companies']
# 회사 = mkt.json 의 회사 가운데 co 파일이 있는 곳 (mkt.json order kept)
codes = [c for c in companies if os.path.isfile(os.path.join(DATA, 'co', c + '.json'))]
code_set = set(codes)
no_file = [c for c in companies if c not in code_set]

series = {}                                      # code -> (k0, close list)
for c in codes:
    o = load(os.path.join(DATA, 'co', c + '.json'))
    series[c] = (o['k0'], o['close'])


def close(c, t):
    """close(t) of company c: close[j] with t = j + k0; None when absent."""
    k0, cl = series[c]
    j = t - k0
    if 0 <= j < len(cl) and usable(cl[j]):
        return cl[j]
    return None


# ---- 1. 지수 : 시장 지수 M (모든 회사 · 같은 무게) ---------------------------
M = [0.0] * N
M[0] = 100.0                                     # I(0) = 100
for t in range(1, N):
    s = 0.0
    n = 0
    for c in codes:
        a = close(c, t)
        b = close(c, t - 1)
        if a is None or b is None:               # 두 날 종가가 다 있을 때만
            continue
        r = a / b - 1                            # r(c, t) = close(t) ÷ close(t − 1) − 1
        if abs(r) >= JUMP:                       # |r| ≥ 0.35 이면 그날 그 회사는 뺌
            continue
        s += r
        n += 1
    m = s / n if n else 0.0                      # 평균 · 하나도 없으면 0
    M[t] = M[t - 1] * (1 + m)                    # I(t) = I(t − 1) × (1 + m(t))


# ---- 2. 시계 자리 (four zones, decided on unrounded values) ------------------
def zone(x, y):
    if x >= BLOOM_LINE:
        return 'B' if y >= 0 else 'W'            # 꽃 · 시듦
    return 'S' if y >= 0 else 'Q'                # 싹 · 잠잠


# ---- 9. 회사 자리 (날 T · 모든 회사) ----------------------------------------
def cx(c, k):
    # cx(c, k) = (close(T) ÷ close(T − k)) ÷ (M(T) ÷ M(T − k)) − 1
    return (close(c, T) / close(c, T - k)) / (M[T] / M[T - k]) - 1


out_co = {}
skipped = {}
for c in codes:
    reasons = []
    # ① close(T) · close(T − 5) · close(T − 20) 가운데 하나라도 없음
    miss = [f'T-{k} ({dates[T - k]})' if k else f'T ({dates[T]})'
            for k in (0, 5, 20) if close(c, T - k) is None]
    if miss:
        reasons.append('missing close: ' + ', '.join(miss))
    # ② s = T − 19 ~ T 가운데 close(s − 1) · close(s) 가 다 있고 |…| ≥ 0.35 인 날
    jumps = []
    for s in range(T - 19, T + 1):
        a = close(c, s)
        b = close(c, s - 1)
        if a is None or b is None:
            continue
        r = a / b - 1
        if abs(r) >= JUMP:
            jumps.append(f'{dates[s]} (r={r:+.4f})')
    if jumps:
        reasons.append('jump day: ' + ', '.join(jumps))
    if reasons:
        skipped[c] = '; '.join(reasons)
        continue
    x = cx(c, 20) * 100                          # 가로 x = cx(c, 20) × 100
    y = cx(c, 5) * 100                           # 세로 y = cx(c, 5) × 100
    out_co[c] = [x, y, zone(x, y)]

zones = {'B': 0, 'W': 0, 'S': 0, 'Q': 0}
for v in out_co.values():
    zones[v[2]] += 1

result = {
    'asOf': dates[T],
    'from20': dates[T - 20],
    'from5': dates[T - 5],
    'n': len(out_co),
    'skip': len(skipped),
    'zones': zones,
    'co': out_co,
    'skipped': skipped,
}
with open(OUT, 'w', encoding='utf-8') as f:
    json.dump(result, f, ensure_ascii=False)

print('asOf', result['asOf'], 'from20', result['from20'], 'from5', result['from5'])
print('companies', len(codes), 'mkt.json entries without co file', len(no_file))
print('n', result['n'], 'skip', result['skip'], 'zones', zones)
print('M(T-20)', repr(M[T - 20]), 'M(T-5)', repr(M[T - 5]), 'M(T)', repr(M[T]))
for c, why in skipped.items():
    print('skip', c, companies[c].get('n'), '-', why)
