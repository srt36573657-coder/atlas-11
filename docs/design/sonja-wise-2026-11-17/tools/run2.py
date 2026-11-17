"""다른 고르기 둘 — ① 두 꾀 넘게 함께 고른 곳(겹친 곳) ② 꾀들이 고른 곳 가운데 덜 흔들린 일곱(업종마다 둘까지) — 같은 날 아무렇게나 일곱과 견줌"""
import json, time, collections
import numpy as np
from load import *
H, WIN = 5, 500
t0 = max(S36.NEED_T, T - H - WIN + 1); days = list(range(t0, T - H + 1))
KS = [k for k in S36.KINDS if k not in S36.BY]
idx = {c: j for j, c in enumerate(CODES)}
rng = np.random.default_rng(20261117)
rows, ts = [], time.time()
def lowvol7(cands, t):
    with np.errstate(invalid='ignore', divide='ignore'):
        lr = np.diff(np.log(P[:, t - 60:t + 1]), axis=1)
    sd = {c: float(np.nanstd(lr[idx[c]])) for c in cands}
    out, per = [], {}
    for c in sorted(cands, key=lambda c: (sd[c] if np.isfinite(sd[c]) else 9, c)):
        g = int(IXc[idx[c]])
        if per.get(g, 0) >= 2: continue
        per[g] = per.get(g, 0) + 1; out.append(c)
        if len(out) >= 7: break
    return out
for n, t in enumerate(days):
    v = np.isfinite(P[:, t]) & np.isfinite(P[:, t + H]) & (P[:, t] > 0)
    with np.errstate(invalid='ignore', divide='ignore'): r_all = P[:, t + H] / P[:, t] - 1
    rv = r_all[v]
    D = np.array([rng.choice(len(rv), 7, replace=False) for _ in range(400)])
    R = S36.lists36(CODES, IXc, P, t, capv, dates=DATES)
    cnt = collections.Counter(c for k in KS for c in (R['lists'].get(k) or []))
    union = list(cnt)
    rec = {'t': t, 'd': DATES[t], 'land': SUN.land(SUN.market(P, t)), 'p0': float((rv[D].mean(1) < 0).mean()), 'rs7': [round(float(x), 5) for x in rv[D[:60]].mean(1)], 'g': {}}
    def put(name, L):
        if not L: return
        rr = r_all[[idx[c] for c in L]]; rr = rr[np.isfinite(rr)]
        if len(rr): rec['g'][name] = float(rr.mean())
    put('ov2', [c for c, x in cnt.items() if x >= 2]); put('ov3', [c for c, x in cnt.items() if x >= 3]); put('low7', lowvol7(union, t)); put('union', union)
    rec['n'] = {'ov2': sum(1 for x in cnt.values() if x >= 2), 'ov3': sum(1 for x in cnt.values() if x >= 3), 'union': len(union)}
    rows.append(rec)
    if n % 100 == 0: print(n, DATES[t], round(time.time() - ts), 's', flush=True)
json.dump({'rows': rows}, open('rows2.json', 'w'))
print('done', len(rows), round(time.time() - ts), 's')
