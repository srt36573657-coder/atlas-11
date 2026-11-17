"""지난 500거래일 — 날마다 서른여섯 꾀(지금 판 s36-v3)와 「업종마다 둘까지」 판을 다시 골라, 닷새 뒤 값 · 같은 날 아무렇게나 고른 일곱과 견줌"""
import json, time, collections
import numpy as np
from load import *
H, WIN = 5, 500
t0 = max(S36.NEED_T, T - H - WIN + 1); days = list(range(t0, T - H + 1))
KS = [k for k in S36.KINDS if k not in S36.BY]
_orig = S36._pick
def _pick_cap(k, cand, score, codes, mc, mask=None):
    s = np.asarray(score, float)
    order = sorted([j for j in cand if np.isfinite(s[j])], key=lambda j: (-s[j], codes[j]))
    out, per = [], {}
    for a in range(0, len(order), 16):
        chunk = order[a:a + 16]
        ok = mask[chunk] if mask is not None else mc.ok(k, chunk)
        for j, o in zip(chunk, ok):
            if not o: continue
            g = int(IXc[j])
            if per.get(g, 0) >= 2: continue
            per[g] = per.get(g, 0) + 1; out.append(codes[j])
            if len(out) >= S36.K: break
        if len(out) >= S36.K: break
    return out
idx = {c: j for j, c in enumerate(CODES)}
rng = np.random.default_rng(20261117)
rows, t_start = [], time.time()
for n, t in enumerate(days):
    v = np.isfinite(P[:, t]) & np.isfinite(P[:, t + H]) & (P[:, t] > 0)
    with np.errstate(invalid='ignore', divide='ignore'): r_all = P[:, t + H] / P[:, t] - 1
    rv = r_all[v]
    D = np.array([rng.choice(len(rv), 7, replace=False) for _ in range(400)])
    rec = {'t': t, 'd': DATES[t], 'land': SUN.land(SUN.market(P, t)), 'm': float(rv.mean()), 'p0': float((rv[D].mean(1) < 0).mean()),
           'q10': float(np.sort(rv[D].mean(1))[:40].mean()), 'rs7': [round(float(x), 5) for x in rv[D[:60]].mean(1)], 'r': {}, 'rc': {}, 'sect': {}}
    for key, pick in (('r', _orig), ('rc', _pick_cap)):
        S36._pick = pick
        R = S36.lists36(CODES, IXc, P, t, capv, dates=DATES)
        for k in KS:
            L = R['lists'].get(k) or []
            if not L: continue
            j = np.array([idx[c] for c in L]); rr = r_all[j]; rr = rr[np.isfinite(rr)]
            if len(rr): rec[key][k] = float(rr.mean())
            if key == 'r': rec['sect'][k] = max(collections.Counter(int(IXc[idx[c]]) for c in L).values())
    S36._pick = _orig
    rows.append(rec)
    if n % 50 == 0: print(n, len(days), DATES[t], round(time.time() - t_start), 's', flush=True)
json.dump({'days': len(days), 'T': T, 'dT': DATES[T], 'landT': SUN.land(SUN.market(P, T)), 'KS': KS, 'rows': rows}, open('rows.json', 'w'))
print('done', len(rows), round(time.time() - t_start), 's')
