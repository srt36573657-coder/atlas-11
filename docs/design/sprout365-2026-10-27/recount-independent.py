"""Independent recount of sprout/flower backtest counts.
Uses only the written definitions given by the caller. Reads raw data only.
"""
import json, os, sys
import numpy as np

D = '/home/claude/atlas-11/site/atlas/data'

dates = json.load(open(os.path.join(D, 'days.json')))['dates']
N = len(dates)
comp_all = json.load(open(os.path.join(D, 'mkt.json')))['companies']

codes = sorted(c for c in comp_all if os.path.isfile(os.path.join(D, 'co', c + '.json')))
C = len(codes)

# price matrix, NaN = no price (0, null, missing)
P = np.full((C, N), np.nan)
for ci, code in enumerate(codes):
    d = json.load(open(os.path.join(D, 'co', code + '.json')))
    k0 = int(d['k0'])
    for j, v in enumerate(d['close']):
        t = j + k0
        if t < 0 or t >= N:
            continue
        if v is None or v == 0:
            continue
        P[ci, t] = float(v)

have = ~np.isnan(P)

# industries with >= 5 member companies
ind_of = [comp_all[c].get('i') or '' for c in codes]
from collections import Counter
cnt = Counter(g for g in ind_of if g)
industries = sorted(g for g, n in cnt.items() if n >= 5)
gidx = {g: k for k, g in enumerate(industries)}
cg = np.array([gidx.get(g, -1) for g in ind_of])

# daily change r(c,t), t>=1 ; NaN where not both prices exist
R = np.full((C, N), np.nan)
both = have[:, 1:] & have[:, :-1]
with np.errstate(invalid='ignore', divide='ignore'):
    rr = P[:, 1:] / P[:, :-1] - 1.0
R[:, 1:] = np.where(both, rr, np.nan)
rexists = ~np.isnan(R)
jump = rexists & (np.abs(np.where(rexists, R, 0.0)) >= 0.35)
valid = rexists & ~jump


def build_index(mask_rows):
    """Index: I(0)=1, I(t)=I(t-1)*(1+mean of valid r among rows). Sequential python sum for the mean."""
    I = np.empty(N)
    I[0] = 1.0
    rows = np.where(mask_rows)[0]
    for t in range(1, N):
        v = valid[rows, t]
        if v.any():
            vals = R[rows[v], t]
            m = float(np.sum(vals)) / len(vals)
            I[t] = I[t - 1] * (1.0 + m)
        else:
            I[t] = I[t - 1]
    return I


M = build_index(np.ones(C, dtype=bool))
IND = np.vstack([build_index(cg == k) for k in range(len(industries))])


def rel_series(A, Mx, k):
    """rel(a,t,k) for all t (NaN for t<k). A may be 1-D or 2-D (rows x N)."""
    out = np.full(A.shape, np.nan)
    with np.errstate(invalid='ignore', divide='ignore'):
        out[..., k:] = (A[..., k:] / A[..., :-k]) / (Mx[k:] / Mx[:-k]) - 1.0
    return out


x = 100.0 * rel_series(P, M, 20)
y = 100.0 * rel_series(P, M, 5)
ix = 100.0 * rel_series(IND, M, 20)
iy = 100.0 * rel_series(IND, M, 5)

# rolling helpers over windows s in [t-L+1 .. t]
def rolling_count(B, L):
    """number of True among columns t-L+1..t (only for t>=L-1; others NaN->-1)."""
    cs = np.zeros((B.shape[0], N + 1), dtype=np.int64)
    cs[:, 1:] = np.cumsum(B.astype(np.int64), axis=1)
    out = np.full(B.shape, -1, dtype=np.int64)
    out[:, L - 1:] = cs[:, L:] - cs[:, :N - L + 1]
    return out

jump20 = rolling_count(jump, 20)              # jumps among s=t-19..t
eqprev = np.zeros((C, N), dtype=bool)
eqprev[:, 1:] = have[:, 1:] & have[:, :-1] & (P[:, 1:] == P[:, :-1])
flat20 = rolling_count(eqprev, 20)            # equal-to-previous days among s=t-19..t

# countable (c,t)
countable = np.zeros((C, N), dtype=bool)
for t in range(20, N):
    countable[:, t] = (have[:, t] & have[:, t - 5] & have[:, t - 20]
                       & (jump20[:, t] == 0) & (flat20[:, t] != 20))

sprout = countable & (np.nan_to_num(x, nan=np.inf) < 5) & (np.nan_to_num(y, nan=-np.inf) >= 0)

bloom_g = (np.nan_to_num(ix, nan=-np.inf) >= 5) & (np.nan_to_num(iy, nan=-np.inf) >= 0)  # (G, N)
bloom = np.zeros((C, N), dtype=bool)
inind = cg >= 0
bloom[inind] = bloom_g[cg[inind]]

# outcome: close at t+20, no jump among s=t+1..t+20
outcome = np.zeros((C, N), dtype=bool)
flower = np.zeros((C, N), dtype=bool)
fwd = np.full((C, N), np.nan)
for t in range(0, N - 20):
    ok = countable[:, t] & have[:, t + 20] & (jump20[:, t + 20] == 0)
    outcome[:, t] = ok
    with np.errstate(invalid='ignore', divide='ignore'):
        f = (P[:, t + 20] / P[:, t]) / (M[t + 20] / M[t]) - 1.0
    fwd[:, t] = np.where(ok, f, np.nan)
    flower[:, t] = ok & (np.nan_to_num(f, nan=-np.inf) >= 0.05)

# hi1: all 120 closes t-119..t exist and close(t) >= 0.95*max
hi1 = np.zeros((C, N), dtype=bool)
have120 = rolling_count(have, 120)
for t in range(119, N):
    full = have120[:, t] == 120
    win = P[:, t - 119:t + 1]
    mx = np.where(full, np.nanmax(np.where(np.isnan(win), -np.inf, win), axis=1), np.inf)
    hi1[:, t] = full & (P[:, t] >= 0.95 * mx)

# c120d: close(t-120) exists and 100*rel(close,t,120) < -20
r120 = 100.0 * rel_series(P, M, 120)
c120d = np.nan_to_num(r120, nan=np.inf) < -20

# up2: number of s in t-9..t with r(s)>0 is >= 7
up = rexists & (np.where(rexists, R, 0.0) > 0)
up10 = rolling_count(up, 10)
up2 = up10 >= 7

# periods
t0 = 120
TL = N - 21
MID = next(t for t in range(121, N) if dates[t] >= '2025-04-04')
periods = {'Train': (t0, MID - 1), 'Test': (MID, TL)}


def tally(mask, a, b):
    m = mask[:, a:b + 1] & outcome[:, a:b + 1]
    n = int(m.sum())
    f = int((m & flower[:, a:b + 1]).sum())
    return n, f


def fmt(n, f):
    return f"n={n} flowers={f} rate={100.0 * f / n:.2f}" if n else f"n={n} flowers={f} rate=NA"


C3 = sprout & bloom
FINAL = C3 & hi1

if __name__ == '__main__':
    print('N', N, 'first', dates[0], 'last', dates[-1], 'companies', C, 'industries', len(industries),
          'MID', MID, dates[MID], 'TL', TL, dates[TL])
    print('companies without 5+ industry:', int((cg < 0).sum()))
    for name, (a, b) in periods.items():
        print(f'--- {name} t=[{a},{b}] {dates[a]}..{dates[b]}')
        print('  base ', fmt(*tally(countable, a, b)))
        print('  sprout', fmt(*tally(sprout, a, b)))
        print('  C3   ', fmt(*tally(C3, a, b)))
        print('  FINAL', fmt(*tally(FINAL, a, b)))
        if name == 'Train':
            print('  C3&c120d', fmt(*tally(C3 & c120d, a, b)))
            print('  C3&up2  ', fmt(*tally(C3 & up2, a, b)))
    T = N - 1
    lastF = sorted(codes[i] for i in np.where(FINAL[:, T])[0])
    print('last date', dates[T], 'sprout&bloom count', int(C3[:, T].sum()),
          'sprout&bloom&hi1 count', len(lastF))
    print('  list', lastF)
