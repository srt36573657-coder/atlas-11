# 「!」 문턱 견주기 — 지난 기록 전부 + 1억 날 흉내(블록 붓스트랩)
#   쓰는 법: python3 -I alert_study.py <index-long 폴더> <결과.json> [흉내 날 수=100000000]
import json, sys, math
import numpy as np
src, out = sys.argv[1], sys.argv[2]; NSIM = int(sys.argv[3]) if len(sys.argv) > 3 else 100_000_000
def load(name):
    rows = json.load(open(f'{src}/{name}.json'))
    d = np.array([r[0] for r in rows]); c = np.array([r[1] for r in rows], dtype=float)
    r = (c[1:] / c[:-1] - 1) * 100; dd = d[1:]
    ok = np.abs(r) < 30  # 기준 바꿈(× 10 등) 같은 받은 값 틈은 뺌
    return dd[ok], r[ok], int((~ok).sum())
def trail_mean_abs(r, w):  # 오늘 앞 w거래일(오늘 뺌) |r| 평균 — 모자라면 nan
    a = np.abs(r); cs = np.concatenate([[0.0], np.cumsum(a)]); m = np.full(len(r), np.nan)
    m[w:] = (cs[w:-1] - cs[:-w - 1]) / w; return m
def trail_std(r, w):
    cs = np.concatenate([[0.0], np.cumsum(r)]); cs2 = np.concatenate([[0.0], np.cumsum(r * r)]); s = np.full(len(r), np.nan)
    n = w; mu = (cs[w:-1] - cs[:-w - 1]) / n; ex2 = (cs2[w:-1] - cs2[:-w - 1]) / n; s[w:] = np.sqrt(np.maximum(ex2 - mu * mu, 0)); return s
def rules(r):
    a = np.abs(r); m20 = trail_mean_abs(r, 20); m250 = trail_mean_abs(r, 250)
    R = {}
    for t in (2.5, 3.0, 4.0): R[f'고정 {t:g}%'] = a >= t
    for k in (1.5, 2.0, 2.5, 3.0): R[f'평소(20일)의 {k:g}배'] = a >= k * m20
    R['평소(1년)의 2배'] = a >= 2 * m250
    for f in (1.0, 1.5, 2.0):
        R[f'2배 · 바닥 {f:g}%'] = (a >= 2 * m20) & (a >= f)
        for cap in (4.0, 5.0):
            R[f'2배 · 바닥 {f:g}% · 늘 {cap:g}%'] = ((a >= 2 * m20) & (a >= f)) | (a >= cap)
    for cap in (4.0, 5.0): R[f'2배 · 늘 {cap:g}%'] = (a >= 2 * m20) | (a >= cap)
    for k, f, cap in ((2.5, 1.5, 5.0), (1.5, 1.5, 4.0)): R[f'{k:g}배 · 바닥 {f:g}% · 늘 {cap:g}%'] = ((a >= k * m20) & (a >= f)) | (a >= cap)
    valid = ~np.isnan(m20) & ~np.isnan(m250)  # 모든 규칙이 셀 수 있는 날만(공정하게)
    return R, valid
def metrics(r, R, valid, vol_edges=None):
    a = np.abs(r)[valid]; s60 = trail_std(r, 60)[valid]
    if vol_edges is None: vol_edges = np.nanquantile(s60, [0.2, 0.4, 0.6, 0.8])
    q = np.digitize(s60, vol_edges)
    res = {}
    for name, al in R.items():
        x = al[valid]; n = x.sum()
        rate_q = [float(x[q == k].mean()) if (q == k).any() else float('nan') for k in range(5)]
        big5 = a >= 5; big4 = a >= 4
        prev = np.concatenate([[False], x[:-1]])
        res[name] = {'rate': float(x.mean()), 'perYear': float(x.mean() * 250), 'rateByVol': rate_q,
                     'calmVsWild': (rate_q[4] / rate_q[0]) if rate_q[0] > 0 else float('inf'),
                     'catch5': float(x[big5].mean()) if big5.any() else float('nan'), 'catch4': float(x[big4].mean()) if big4.any() else float('nan'),
                     'small': float((a[x] < 1.5).mean()) if n else float('nan'), 'tiny': float((a[x] < 1.0).mean()) if n else float('nan'),
                     'streak': float((x & prev).sum() / n) if n else float('nan')}
    return res, vol_edges
def per_year(dates, R, valid):
    yrs = np.array([d[:4] for d in dates]); out = {}
    for name, al in R.items():
        c = {}
        for y in sorted(set(yrs[valid])):
            m = (yrs == y) & valid
            if m.sum() >= 200: c[y] = int(al[m].sum())
        out[name] = c
    return out
report = {'made': None, 'data': {}, 'real': {}, 'years': {}, 'last59': {}, 'sim': {}}
series = {}
for idx in ('kospi', 'kosdaq'):
    d, r, dropped = load(idx); series[idx] = (d, r)
    R, valid = rules(r); m, edges = metrics(r, R, valid)
    report['data'][idx] = {'from': str(d[0]), 'to': str(d[-1]), 'days': int(len(r)), 'counted': int(valid.sum()), 'dropped': dropped, 'big5': int((np.abs(r)[valid] >= 5).sum()), 'big4': int((np.abs(r)[valid] >= 4).sum())}
    report['real'][idx] = m; report['years'][idx] = per_year(d, R, valid)
    report['last59'][idx] = {name: int(al[-59:].sum()) for name, al in R.items()} | {'_dates': [str(d[-59]), str(d[-1])]}
# 1억 날 흉내 — 코스피 하루 움직임을 60거래일 덩어리째 뽑아 이어 붙임(흔들림이 몰리는 모양을 살림) · 250거래일 = 한 해
rng = np.random.default_rng(20261013); d, r = series['kospi']; N = len(r); L = 60; CH = 10_000_000 - (10_000_000 % 250)
agg = {}; done = 0
while done < NSIM:
    n = min(CH, NSIM - done); n -= n % L; nb = n // L
    if nb == 0: break  # 남은 날이 덩어리 하나(60)보다 적으면 끝
    st = rng.integers(0, N - L, size=nb); idx = (st[:, None] + np.arange(L)).ravel(); rs = r[idx]
    R, valid = rules(rs); valid[:260] = False
    a = np.abs(rs)
    yr = n // 250
    for name, al in R.items():
        x = al & valid
        cnt = x[:yr * 250].reshape(yr, 250).sum(1); ok_y = valid[:yr * 250].reshape(yr, 250).all(1); cnt = cnt[ok_y]
        g = agg.setdefault(name, {'days': 0, 'alerts': 0, 'big5': 0, 'caught5': 0, 'small': 0, 'years': 0, 'zeroY': 0, 'over36Y': 0, 'counts': []})
        v = valid; g['days'] += int(v.sum()); g['alerts'] += int(x.sum()); b5 = (a >= 5) & v; g['big5'] += int(b5.sum()); g['caught5'] += int((x & b5).sum()); g['small'] += int((x & (a < 1.5)).sum())
        g['years'] += int(len(cnt)); g['zeroY'] += int((cnt == 0).sum()); g['over36Y'] += int((cnt > 36).sum()); g['counts'].append(np.bincount(np.minimum(cnt, 120), minlength=121))
    done += n
for name, g in agg.items():
    c = np.sum(g.pop('counts'), axis=0); cdf = np.cumsum(c) / c.sum()
    report['sim'][name] = {'days': g['days'], 'perYear': g['alerts'] / g['days'] * 250, 'catch5': g['caught5'] / max(1, g['big5']), 'small': g['small'] / max(1, g['alerts']),
                           'zeroYear': g['zeroY'] / g['years'], 'over36Year': g['over36Y'] / g['years'], 'years': g['years'],
                           'p10': int(np.searchsorted(cdf, 0.1)), 'p50': int(np.searchsorted(cdf, 0.5)), 'p90': int(np.searchsorted(cdf, 0.9))}
report['simDays'] = int(done); report['made'] = __import__('datetime').datetime.utcnow().isoformat() + 'Z'
json.dump(report, open(out, 'w'), ensure_ascii=False, indent=1)
print('ok', done)
