#!/usr/bin/env python3
"""싹에서 꽃이 되는 종목 — 지난 기록 셈(docs/design/sprout-flower-2026-10-22/spec-v1.md 그대로)

사장님 2026-10-22(서울) 16:56 「싹에서 꽃이 되는 종목을 찾는게 돌이에 본질이야 … 과거 데이타를 모조리 뒤져서 막 올리지말고 엄선하고
럼서해서 그것들만 올려야 해」 · 17:00 「어」(회사 하나하나에서).

쓰는 법: python3 scripts/atlas11/research/sprout_flower.py [자료 폴더=site/atlas/data] [결과 json]
읽기만 한다. 앞날을 맞히는 숫자가 아니라 지난 기록에서 센 횟수다.
"""
import json
import os
import sys

import warnings

import numpy as np

warnings.filterwarnings('ignore')
np.seterr(all='ignore')

ROOT = sys.argv[1] if len(sys.argv) > 1 else 'site/atlas/data'
OUT = sys.argv[2] if len(sys.argv) > 2 else None
REPS = 2000
BLOCK = 20
RNG = np.random.default_rng(20261022)

# ── 자료 ──
days = json.load(open(f'{ROOT}/days.json', encoding='utf8'))
D = days if isinstance(days, list) else (days.get('dates') or days.get('days'))
N = len(D)
mkt = json.load(open(f'{ROOT}/mkt.json', encoding='utf8'))['companies']
cond = json.load(open(f'{ROOT}/cond.json', encoding='utf8'))
RK = dict(zip(cond['co']['c'], cond['co']['rk']))
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

# ── 하루 변화 · 튐 · 시장 지수 ──
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


M = index_of(np.arange(C))

# 20 날 튐 수(t − 19 ~ t) · 10 날(t − 9 ~ t)
cj = np.cumsum(JUMP.astype(np.int32), axis=0)


def jumps_in(t_end, width):
    """t_end 까지 width 날(t_end − width + 1 ~ t_end)의 튄 날 수 — 배열(N, C)"""
    out = cj.copy()
    out[width:] = cj[width:] - cj[:-width]
    return out


J20 = jumps_in(None, 20)
J10 = jumps_in(None, 10)


def lag(a, k):
    out = np.full_like(a, np.nan)
    out[k:] = a[:-k]
    return out


def lead(a, k):
    out = np.full_like(a, np.nan)
    out[:-k] = a[k:]
    return out


Mc = M[:, None]
P5, P10, P20, P60 = lag(P, 5), lag(P, 10), lag(P, 20), lag(P, 60)
M5, M20, M60 = lag(M[:, None], 5), lag(M[:, None], 20), lag(M[:, None], 60)
X = ((P / P20) / (Mc / M20) - 1) * 100
Y = ((P / P5) / (Mc / M5) - 1) * 100
# 거래가 멈춘 회사(v5 · 따로 센 일꾼이 찾음) — t − 20 ~ t 스물한 날 종가가 모두 같으면 셀 수 없음(그날까지의 값만)
SAME = np.zeros((N, C), np.int32)
SAME[1:] = ((P[1:] == P[:-1]) & ~np.isnan(P[1:])).astype(np.int32)
cs_ = np.cumsum(SAME, axis=0)
S20 = cs_.copy()
S20[20:] = cs_[20:] - cs_[:-20]
FROZEN = S20 >= 20
COUNT = ~np.isnan(P) & ~np.isnan(P5) & ~np.isnan(P20) & (J20 == 0) & ~FROZEN
SPROUT = COUNT & (X < 5) & (Y >= 0)

# 결과 — 한 달(20날) 뒤 꽃 선(시장보다 5% 넘게 더 오름)
PF = lead(P, 20)
MF = lead(M[:, None], 20)
JF = lead(J20.astype(float), 20)  # t + 1 ~ t + 20 의 튄 날 수 = J20(t + 20)
DEF = ~np.isnan(P) & ~np.isnan(PF) & (np.nan_to_num(JF, nan=1.0) == 0)
EXF = (PF / P) / (MF / Mc) - 1
FLOWER = DEF & (EXF >= 0.05)
FALL = DEF & (EXF <= -0.05)
EXC = np.where(DEF, np.clip(np.nan_to_num(EXF, nan=0.0), -0.5, 0.5), 0.0)

# ── 업종 ──
ind_of = np.array([mkt[c].get('i') or '' for c in codes])
rk_of = np.array([RK.get(c, 999) for c in codes])
inds = [g for g in sorted(set(ind_of)) if g and np.sum(ind_of == g) >= 5]
IX = np.full((N, C), np.nan)
IY = np.full((N, C), np.nan)
IREAL = np.zeros((N, C), bool)
IZS = np.zeros((N, C), bool)
IZB = np.zeros((N, C), bool)
IUP = np.zeros((N, C), bool)
IRRUN = np.zeros((N, C), np.int32)
cell10 = ~np.isnan(P) & ~np.isnan(P10) & (J10 == 0)
up2 = cell10 & (P * 100 > P10 * 102)
chg10 = np.where(cell10, P / P10 - 1, np.nan)
for g in inds:
    cols = np.where(ind_of == g)[0]
    I = index_of(cols)[:, None]
    ix = ((I / lag(I, 20)) / (Mc / M20) - 1) * 100
    iy = ((I / lag(I, 5)) / (Mc / M5) - 1) * 100
    p1 = iy >= 2
    nc = np.sum(cell10[:, cols], axis=1)
    nu = np.sum(up2[:, cols], axis=1)
    p2 = ((nu * 2 >= nc) & (nc > 0))[:, None]
    big = cols[rk_of[cols] <= 3]
    if len(big):
        bm = np.nanmean(chg10[:, big], axis=1) if np.any(~np.isnan(chg10[:, big])) else np.full(N, np.nan)
        with np.errstate(invalid='ignore'):
            p3 = (np.nan_to_num(bm, nan=-1) >= 0.01)[:, None]
    else:
        p3 = np.zeros((N, 1), bool)
    p4 = (I / lag(I, 10)) > 1
    zs = (ix < 5) & (iy >= 0)
    zb = (ix >= 5) & (iy >= 0)
    IX[:, cols] = ix
    IY[:, cols] = iy
    IZS[:, cols] = zs
    IZB[:, cols] = zb
    real = zs & p1 & p2 & p3 & p4
    IREAL[:, cols] = real
    IUP[:, cols] = (ix < 0) & (iy >= 2)
    rr = np.zeros(N, np.int32)
    for t in range(N):
        rr[t] = (rr[t - 1] + 1 if t else 1) if real[t, 0] else 0
    IRRUN[:, cols] = rr[:, None]

# ── 그날 몸값 어림 차례 ──
lastP = np.array([P[~np.isnan(P[:, j]), j][-1] if np.any(~np.isnan(P[:, j])) else np.nan for j in range(C)])
shares = np.array([CAP.get(c, np.nan) or np.nan for c in codes], float) / lastP
SIZE = P * shares[None, :]
TOP3H = np.zeros((N, C), bool)
for g in inds:
    cols = np.where(ind_of == g)[0]
    sz = SIZE[:, cols]
    key = np.where(np.isnan(sz), -np.inf, sz)
    order = np.argsort(-key, axis=1)[:, :3]
    for t in range(N):
        pick = cols[order[t]]
        ok = ~np.isnan(SIZE[t, pick])
        TOP3H[t, pick[ok]] = True

# ── 후보 모습 ──
H120 = np.full((N, C), np.nan)
for t in range(119, N):
    H120[t] = np.nanmax(P[t - 119:t + 1], axis=0)
VOL = np.full((N, C), np.nan)
for t in range(20, N):
    w = RV[t - 19:t + 1]
    VOL[t] = np.nanstd(w, axis=0)
volS = np.where(SPROUT, VOL, np.nan)
volMed = np.nanmedian(volS, axis=1)[:, None]
RUN = np.zeros((N, C), np.int32)
for t in range(1, N):
    RUN[t] = np.where(SPROUT[t], RUN[t - 1] + 1, 0)
with np.errstate(invalid='ignore'):
    CX60 = (P / P60) / (Mc / M60) - 1
    MK20 = (M / np.concatenate([np.full(20, np.nan), M[:-20]]))[:, None] > 1
CAND = {
    'C0': ('싹만', np.ones((N, C), bool)),
    'C1': ('업종도 싹', IZS),
    'C2': ('업종이 진짜 싹', IREAL),
    'C3': ('업종은 꽃 자리', IZB),
    'C4': ('닷새 힘 2 이상', Y >= 2),
    'C5': ('꽃 선 바로 아래(0 ~ 5)', (X >= 0) & (X < 5)),
    'C6': ('한 달 많이 처짐(−5 아래)', X < -5),
    'C7': ('반년 가장 높은 값 가까이', P >= 0.95 * H120),
    'C8': ('석 달 시장보다 더 오름', np.nan_to_num(CX60, nan=-1) > 0),
    'C9': ('흔들림 작음', np.nan_to_num(VOL, nan=9) < volMed),
    'C10': ('업종보다 닷새 힘 큼', Y > np.nan_to_num(IY, nan=1e9)),
    'C11h': ('그날 업종 큰 회사 셋', TOP3H),
    'C12': ('싹 첫날 · 둘째 날', (RUN >= 1) & (RUN <= 2)),
    'C13': ('시장 한 달 오름', np.broadcast_to(MK20, (N, C))),
    'C14': ('업종이 바닥에서 막 오름', IUP),
    'C15': ('업종 진짜 싹 첫날 · 둘째 날', (IRRUN >= 1) & (IRRUN <= 2)),
    'C16': ('업종 싹 + 닷새 힘 2 이상', IZS & (Y >= 2)),
    'C17': ('업종 꽃 자리 + 회사 한 달 처짐', IZB & (X < 0)),
}

T0, TL = 120, N - 21
MID = (T0 + TL) // 2
PER = {'train': (T0, MID), 'test': (MID, TL + 1)}
BASEM = COUNT & DEF


def perdate(mask, a, b):
    m = mask[a:b]
    return (np.sum(m, axis=1).astype(float), np.sum(m & FLOWER[a:b], axis=1).astype(float),
            np.sum(m & FALL[a:b], axis=1).astype(float), np.sum(np.where(m, EXC[a:b], 0.0), axis=1))


def boot(nb, hb, ng, hg, eb, eg):
    L = len(nb)
    nblk = int(np.ceil(L / BLOCK))
    starts = RNG.integers(0, L - BLOCK + 1, size=(REPS, nblk))
    idx = (starts[:, :, None] + np.arange(BLOCK)[None, None, :]).reshape(REPS, -1)[:, :L]
    NB, NG = np.maximum(nb[idx].sum(1), 1), np.maximum(ng[idx].sum(1), 1)
    d = (hg[idx].sum(1) / NG - hb[idx].sum(1) / NB) * 100
    e = (eg[idx].sum(1) / NG - eb[idx].sum(1) / NB) * 100
    q = lambda a: (float(np.percentile(a, 2.5)), float(np.percentile(a, 97.5)))
    return q(d), q(e)


def stat(mask, per):
    a, b = PER[per]
    nb, hb, fb, eb = perdate(BASEM, a, b)
    ng, hg, fg, eg = perdate(mask & BASEM & SPROUT, a, b)
    n, h = ng.sum(), hg.sum()
    base = hb.sum() / max(nb.sum(), 1) * 100
    rate = h / max(n, 1) * 100
    (lo, hi), (elo, ehi) = boot(nb, hb, ng, hg, eb, eg)
    return {'n': int(n), 'dates': int(np.sum(ng > 0)), 'hits': int(h), 'rate': round(rate, 2), 'base': round(base, 2),
            'lift': round(rate / base, 3) if base else None, 'diff': round(rate - base, 2), 'lo': round(lo, 2), 'hi': round(hi, 2),
            'fall': round(fg.sum() / max(n, 1) * 100, 2), 'fall_base': round(fb.sum() / max(nb.sum(), 1) * 100, 2),
            'ex': round(eg.sum() / max(n, 1) * 100, 2), 'ex_base': round(eb.sum() / max(nb.sum(), 1) * 100, 2), 'elo': round(elo, 2), 'ehi': round(ehi, 2)}


def ok_train(s):
    return s['n'] >= 2000 and s['dates'] >= 50 and s['lift'] is not None and s['lift'] >= 1.2 and s['lo'] > 0 and s['elo'] > 0


res = {'schema': 'dori-sprout-flower-research-1', 'spec': 'docs/design/sprout-flower-2026-10-22/spec-v1.md (v2)', 'root': ROOT,
       'days': N, 'from': D[0], 'to': D[-1], 'companies': C, 'industries': len(inds),
       'train': [D[T0], D[MID - 1]], 'test': [D[MID], D[TL]], 'singles': {}, 'pairs': {}, 'picked': [], 'test_result': {}}
allb = stat(np.ones((N, C), bool), 'train')
res['base_train'] = allb['base']
for k, (name, m) in CAND.items():
    s = stat(np.asarray(m), 'train')
    s['name'] = name
    s['pass'] = bool(ok_train(s)) if k != 'C0' else False
    res['singles'][k] = s
good = sorted([k for k, s in res['singles'].items() if s['pass']], key=lambda k: (-res['singles'][k]['lift'], -res['singles'][k]['n']))
top4 = good[:4]
for i in range(len(top4)):
    for j in range(i + 1, len(top4)):
        a, b = top4[i], top4[j]
        s = stat(np.asarray(CAND[a][1]) & np.asarray(CAND[b][1]), 'train')
        s['name'] = CAND[a][0] + ' + ' + CAND[b][0]
        s['pass'] = bool(ok_train(s))
        res['pairs'][a + '+' + b] = s
pool = [(k, res['singles'][k]) for k in good] + [(k, s) for k, s in res['pairs'].items() if s['pass']]
pool.sort(key=lambda kv: (-kv[1]['lift'], -kv[1]['n']))
res['picked'] = [k for k, _ in pool[:3]]


def mask_of(key):
    m = np.ones((N, C), bool)
    for part in key.split('+'):
        m &= np.asarray(CAND[part][1])
    return m


res['test_result']['C0'] = stat(np.ones((N, C), bool), 'test')
for k in res['picked']:
    s = stat(mask_of(k), 'test')
    s['pass'] = bool(s['rate'] > s['base'] and s['lo'] > 0 and s['elo'] > 0)
    res['test_result'][k] = s
res['passed'] = [k for k in res['picked'] if res['test_result'][k]['pass']]
# v3 — 앞 기록 두 폭이 모두 0 위였던 것을 뒤 기록에서 한 번(EXTRA=C3,C17)
res['extra'] = [k for k in (os.environ.get('EXTRA') or '').split(',') if k]
for k in res['extra']:
    s = stat(mask_of(k), 'test')
    s['pass'] = bool(s['rate'] > s['base'] and s['lo'] > 0 and s['elo'] > 0)
    s['name'] = CAND[k][0] if k in CAND else k
    res['test_result'][k] = s
    if s['pass'] and k not in res['passed']:
        res['passed'].append(k)

# 오늘(T = N − 1) 싹 가운데 지나간 모습에 드는 회사
T = N - 1
today = {}
for k in res['passed']:
    m = mask_of(k)[T] & SPROUT[T]
    rows = [(codes[j], mkt[codes[j]].get('n'), ind_of[j], round(float(X[T, j]), 2), round(float(Y[T, j]), 2)) for j in np.where(m)[0]]
    rows.sort(key=lambda r: -r[4])
    today[k] = rows
res['today'] = {'date': D[T], 'match': today}

txt = json.dumps(res, ensure_ascii=False, indent=1)
if OUT:
    os.makedirs(os.path.dirname(OUT) or '.', exist_ok=True)
    open(OUT, 'w', encoding='utf8').write(txt + '\n')
print(json.dumps({k: res[k] for k in ('days', 'from', 'to', 'companies', 'industries', 'train', 'test', 'base_train', 'picked', 'passed')}, ensure_ascii=False))
for k, s in res['singles'].items():
    print(k, s['name'], 'n', s['n'], 'rate', s['rate'], 'base', s['base'], 'lift', s['lift'], 'ci', [s['lo'], s['hi']], 'ex', s['ex'], 'exb', s['ex_base'], 'eci', [s['elo'], s['ehi']], 'fall', s['fall'], 'fb', s['fall_base'], 'pass', s['pass'])
for k, s in res['pairs'].items():
    print(k, s['name'], 'n', s['n'], 'rate', s['rate'], 'lift', s['lift'], 'ci', [s['lo'], s['hi']], 'pass', s['pass'])
for k, s in res['test_result'].items():
    print('TEST', k, 'n', s['n'], 'rate', s['rate'], 'base', s['base'], 'lift', s['lift'], 'ci', [s['lo'], s['hi']], 'ex', s['ex'], 'exb', s['ex_base'], 'eci', [s['elo'], s['ehi']], 'fall', s['fall'], 'fb', s['fall_base'], 'pass', s.get('pass'))
for k, rows in today.items():
    print('TODAY', k, len(rows), rows[:5])
