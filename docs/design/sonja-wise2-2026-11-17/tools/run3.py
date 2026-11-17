"""더 지혜롭게(주문 1117-1720) — 꾀들이 고른 곳으로 만드는 고르기 법 여섯 · 날마다 닷새 뒤 · 스무 날 뒤 값 · 같은 날 아무렇게나 일곱
   법(모두 업종마다 둘까지 · 모자라면 모자란 대로 · 채우지 않음)
   L1 덜 흔들린 일곱 — 꾀들이 고른 곳 모두에서 지난 60날 하루 흔들림이 작은 차례
   L2 겹친 곳 덜 흔들린 — 두 꾀 넘게 고른 곳에서 흔들림 작은 차례
   L3 추세 위 덜 흔들린 — L1 가운데 지난 120날 평균 값보다 위인 곳만
   L4 겹친 곳 추세 위 덜 흔들린 — L2 가운데 120날 평균 위
   L5 시장 덜 따르는 — 꾀들이 고른 곳에서 지난 60날 시장과 같이 움직인 정도(베타)가 작은 차례
   L6 갈래 고루 — 꾀 갈래 여섯(이길 · 맞설 · 칠 · 어지러울 · 함께 · 질 때)마다 덜 흔들린 곳을 돌아가며 하나씩"""
import json, time, collections
import numpy as np
from load import *
H, H2, WIN = 5, 20, 500
t0 = max(S36.NEED_T, T - H - WIN + 1); days = list(range(t0, T - H + 1))
KS = [k for k in S36.KINDS if k not in S36.BY]
idx = {c: j for j, c in enumerate(CODES)}
rng = np.random.default_rng(20261117)
def capk(order, k=7, cap=2):
    out, per = [], {}
    for c in order:
        g = int(IXc[idx[c]])
        if per.get(g, 0) >= cap: continue
        per[g] = per.get(g, 0) + 1; out.append(c)
        if len(out) >= k: break
    return out
rows, ts = [], time.time()
for n, t in enumerate(days):
    with np.errstate(invalid='ignore', divide='ignore'):
        r5 = P[:, t + H] / P[:, t] - 1
        r20 = P[:, t + H2] / P[:, t] - 1 if t + H2 <= T else np.full(len(CODES), np.nan)
        lr = np.diff(np.log(P[:, t - 60:t + 1]), axis=1)
        vol = np.nanstd(lr, axis=1)
        mk = np.nanmean(lr, axis=0); beta = np.array([np.nan if np.isfinite(lr[j]).sum() < 40 else np.cov(np.nan_to_num(lr[j]), mk)[0, 1] / np.var(mk) for j in range(len(CODES))])
        ma = P[:, t] / np.nanmean(P[:, t - 119:t + 1], axis=1) - 1
    v5 = np.isfinite(r5); rv = r5[v5]
    D = np.array([rng.choice(len(rv), 7, replace=False) for _ in range(400)])
    rec = {'t': t, 'd': DATES[t], 'land': SUN.land(SUN.market(P, t)), 'p0': float((rv[D].mean(1) < 0).mean()), 'rs7': [round(float(x), 5) for x in rv[D[:60]].mean(1)], 'g': {}, 'g20': {}, 'nk': {}}
    v20 = np.isfinite(r20)
    if v20.sum() > 100:
        rv2 = r20[v20]; D2 = np.array([rng.choice(len(rv2), 7, replace=False) for _ in range(200)])
        rec['p020'] = float((rv2[D2].mean(1) < 0).mean()); rec['rs720'] = [round(float(x), 5) for x in rv2[D2[:60]].mean(1)]
    R = S36.lists36(CODES, IXc, P, t, capv, dates=DATES)
    cnt = collections.Counter(c for k in KS for c in (R['lists'].get(k) or []))
    sets = collections.defaultdict(set)
    for k in KS:
        for c in (R['lists'].get(k) or []): sets[(int(k[1:]) - 1) // 6].add(c)
    U = [c for c in cnt if np.isfinite(vol[idx[c]])]
    byvol = lambda cs: sorted(cs, key=lambda c: (vol[idx[c]], c))
    up = lambda cs: [c for c in cs if np.isfinite(ma[idx[c]]) and ma[idx[c]] > 0]
    ov = [c for c in U if cnt[c] >= 2]
    rules = {'L1': capk(byvol(U)), 'L2': capk(byvol(ov)), 'L3': capk(byvol(up(U))), 'L4': capk(byvol(up(ov))),
             'L5': capk(sorted([c for c in U if np.isfinite(beta[idx[c]])], key=lambda c: (beta[idx[c]], c)))}
    seq, per, out = [byvol([c for c in sets[s] if c in set(U)]) for s in range(6)], {}, []
    pos = [0] * 6
    while len(out) < 7 and any(pos[s] < len(seq[s]) for s in range(6)):
        for s in range(6):
            while pos[s] < len(seq[s]):
                c = seq[s][pos[s]]; pos[s] += 1
                g = int(IXc[idx[c]])
                if c in out or per.get(g, 0) >= 2: continue
                per[g] = per.get(g, 0) + 1; out.append(c); break
            if len(out) >= 7: break
    rules['L6'] = out
    for nm, L in rules.items():
        rec['nk'][nm] = len(L)
        if not L: continue
        j = [idx[c] for c in L]
        a = r5[j]; a = a[np.isfinite(a)]
        if len(a): rec['g'][nm] = float(a.mean())
        b = r20[j]; b = b[np.isfinite(b)]
        if len(b): rec['g20'][nm] = float(b.mean())
    rows.append(rec)
    if n % 100 == 0: print(n, DATES[t], round(time.time() - ts), 's', flush=True)
json.dump({'rows': rows}, open('rows3.json', 'w'))
print('done', len(rows), round(time.time() - ts), 's')
