"""손자병법 서른여섯 꾀 — 지난 날 다시 세기용 자료 읽기(su21.py 와 같은 자료 · 같은 차례)"""
import json, sys, os
import numpy as np
REPO = '/home/claude/atlas-11'
LIVE = '/tmp/claude-0/-home-claude/e38c6e2a-a659-5015-b86a-265061dd2612/scratchpad/dist3'
sys.path.insert(0, REPO + '/scripts/atlas11/next')
import su21_s36 as S36
import su21_sun as SUN
J = lambda p: json.load(open(p, encoding='utf-8'))
b = J(REPO + '/public/data/atlas11/view/board.json')
B = {c['code']: c for c in b['companies']}
DATES = J(LIVE + '/atlas/data/days.json')['dates']
cond = J(LIVE + '/atlas/data/cond.json')
cap = {c: cond['co']['cap'][k] for k, c in enumerate(cond['co']['c'])}
CODES = sorted(B)
INDN = lambda c: B[c]['group']['label']
IXN = sorted(set(INDN(c) for c in CODES)); IXI = {n: i for i, n in enumerate(IXN)}
IXc = np.array([IXI[INDN(c)] for c in CODES])
capv = np.array([cap.get(c) or np.nan for c in CODES], float)
def close(c):
    p = LIVE + '/atlas/data/co/%s.json' % c
    a = np.full(len(DATES), np.nan)
    if not os.path.exists(p): return a
    co = J(p); cl, k0 = co.get('close'), co.get('k0')
    if not isinstance(cl, list) or not isinstance(k0, int): return a
    for j, x in enumerate(cl):
        t = j + k0
        if 0 <= t < len(DATES) and isinstance(x, (int, float)) and x > 0: a[t] = x
    return a
P = np.array([close(c) for c in CODES])
T = len(DATES) - 1
NAME = {k: S36.NAME[k] for k in S36.KINDS}
SECT = {c: INDN(c) for c in CODES}
CNAME = {c: B[c]['name'] for c in CODES}
