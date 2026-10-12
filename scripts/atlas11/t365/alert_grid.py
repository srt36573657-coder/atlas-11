# 섞은 문턱 넓게 찾기 — 평소(20일)의 k배 그리고 바닥 f% · 또는 늘 c% — 진짜 기록(코스피 · 코스닥)
import json, sys, itertools
import numpy as np
src = sys.argv[1]
def load(name):
    rows = json.load(open(f'{src}/{name}.json')); c = np.array([r[1] for r in rows], dtype=float); d = np.array([r[0] for r in rows])
    r = (c[1:] / c[:-1] - 1) * 100; return d[1:], r
def tm(r, w):
    a = np.abs(r); cs = np.concatenate([[0.0], np.cumsum(a)]); m = np.full(len(r), np.nan); m[w:] = (cs[w:-1] - cs[:-w - 1]) / w; return m
def ts(r, w):
    cs = np.concatenate([[0.0], np.cumsum(r)]); cs2 = np.concatenate([[0.0], np.cumsum(r * r)]); s = np.full(len(r), np.nan)
    mu = (cs[w:-1] - cs[:-w - 1]) / w; ex2 = (cs2[w:-1] - cs2[:-w - 1]) / w; s[w:] = np.sqrt(np.maximum(ex2 - mu * mu, 0)); return s
D = {}
for idx in ('kospi', 'kosdaq'):
    d, r = load(idx); a = np.abs(r); m20 = tm(r, 20); s60 = ts(r, 60); v = ~np.isnan(m20) & ~np.isnan(tm(r, 250))
    q = np.digitize(s60, np.nanquantile(s60[v], [0.2, 0.4, 0.6, 0.8])); D[idx] = (d, r, a, m20, v, q)
rows = []
for k, f, c in itertools.product((1.5, 1.75, 2.0, 2.25, 2.5, 2.75, 3.0, 3.5), (0.0, 1.0, 1.25, 1.5, 1.75, 2.0, 2.5), (None, 4.0, 4.5, 5.0, 6.0)):
    res = {}
    for idx, (d, r, a, m20, v, q) in D.items():
        al = (a >= k * m20) & (a >= f); al = al | (a >= c) if c else al
        x = al[v]; av = a[v]; qq = q[v]; n = x.sum(); prev = np.concatenate([[False], x[:-1]])
        rq = [x[qq == j].mean() for j in range(5)]
        res[idx] = {'perYear': x.mean() * 250, 'calm': rq[0], 'wild': rq[4], 'ratio': rq[4] / rq[0] if rq[0] else np.inf, 'catch5': x[av >= 5].mean(), 'catch4': x[av >= 4].mean(),
                    'small': (av[x] < 1.5).mean() if n else 0, 'streak': (x & prev).sum() / n if n else 0, 'last59': int(al[-59:].sum())}
    rows.append({'k': k, 'floor': f, 'cap': c, **{f'{i}_{m}': v for i in res for m, v in res[i].items()}})
ok = [x for x in rows if all(x[f'{i}_catch5'] == 1 and x[f'{i}_small'] == 0 and 12 <= x[f'{i}_perYear'] <= 24 for i in ('kospi', 'kosdaq'))]
ok.sort(key=lambda x: (max(x['kospi_ratio'], x['kosdaq_ratio']), x['kospi_streak'] + x['kosdaq_streak']))
fmt = lambda x: f"{x['k']:g}배 · 바닥 {x['floor']:g}% · 늘 {x['cap'] if x['cap'] else '-'}%  | 피 해{x['kospi_perYear']:4.1f} 조{x['kospi_calm']*100:4.1f}/거{x['kospi_wild']*100:4.1f} ×{x['kospi_ratio']:4.1f} 4%잡 {x['kospi_catch4']*100:4.0f} 이{x['kospi_streak']*100:4.1f} 최{x['kospi_last59']:2d} | 닥 해{x['kosdaq_perYear']:4.1f} ×{x['kosdaq_ratio']:4.1f} 4%잡 {x['kosdaq_catch4']*100:4.0f} 이{x['kosdaq_streak']*100:4.1f} 최{x['kosdaq_last59']:2d}"
print('조건(5% 날 모두 잡음 · 1.5% 밑 「!」 0 · 해마다 12 ~ 24번 — 두 지수 모두) 통과', len(ok), '/', len(rows))
for x in ok[:15]: print(fmt(x))
fixed = [x for x in rows if x['floor'] == 3.0] or []
json.dump({'rows': rows, 'ok': ok[:30]}, open(sys.argv[2], 'w'), ensure_ascii=False, default=float)
