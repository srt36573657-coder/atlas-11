import json, math
import numpy as np
from statistics import NormalDist
Phi = NormalDist().cdf
rows = json.load(open('rows2.json'))['rows']; landT = json.load(open('rows.json'))['landT']
rng = np.random.default_rng(11)
def st(rs, g):
    xs = [r for r in rs if g in r['g']]; n = len(xs)
    if n < 10: return None
    r_ = np.array([x['g'][g] for x in xs]); p0 = np.array([x['p0'] for x in xs])
    lose = int((r_ < 0).sum()); exp = float(p0.sum()); var = float((p0 * (1 - p0)).sum()) * 5
    k10 = max(1, n // 10); R7 = np.array([x['rs7'] for x in xs]); sims = R7[np.arange(n)[None, :], rng.integers(0, R7.shape[1], size=(300, n))]
    return dict(n=n, lr=lose / n, exp=exp / n, z=(exp - lose) / math.sqrt(var), avg=float(r_.mean()), cvar=float(np.sort(r_)[:k10].mean()), cvar7=float(np.sort(sims, axis=1)[:, :k10].mean()))
half = len(rows) // 2; A, B = rows[:half], rows[half:]; same = [r for r in rows if r['land'] == landT]
f = lambda x: '%.1f' % (100 * x)
out = {}
for g in ('low7', 'ov2', 'ov3', 'union'):
    out[g] = {nm: st(rs, g) for nm, rs in (('all', rows), ('A', A), ('B', B), ('same', same))}
    for nm, s in out[g].items():
        if s: print(g, nm, 'n', s['n'], '잃은 몫', f(s['lr']), '아무렇게나', f(s['exp']), 'z', round(s['z'], 2), '평균', f(s['avg']), '꼬리', f(s['cvar']), '꼬리7', f(s['cvar7']))
print('겹친 곳 수 평균', round(np.mean([r['n']['ov2'] for r in rows]), 1), round(np.mean([r['n']['ov3'] for r in rows]), 1), '모두', round(np.mean([r['n']['union'] for r in rows]), 1))
json.dump(out, open('result2.json', 'w'), ensure_ascii=False, indent=1)
