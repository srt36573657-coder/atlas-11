# 내리는 장에서 오른 꾀가 며칠 이어지나(주문 1124-0354) — 지난 기록 셈(앞날을 맞히지 않음 · 사고팔기를 권하지 않음)
import json, sys, time, numpy as np
REPO = '/home/claude/atlas-11'; LIVE = '/tmp/claude-0/-home-claude/e38c6e2a-a659-5015-b86a-265061dd2612/scratchpad/wc36/dist-live'
OUT = sys.argv[1]
sys.path.insert(0, REPO + '/scripts/atlas11/next')
import su21_s36 as S36, su21_sun as SUN
J = lambda p: json.load(open(p, encoding='utf-8'))
b = J(REPO + '/public/data/atlas11/view/board.json'); B = {c['code']: c for c in b['companies']}
DATES = J(LIVE + '/atlas/data/days.json')['dates']
cond = J(LIVE + '/atlas/data/cond.json'); cap = {c: cond['co']['cap'][k] for k, c in enumerate(cond['co']['c'])}
CODES = sorted(B); IXN = sorted(set(B[c]['group']['label'] for c in CODES)); IXI = {n: i for i, n in enumerate(IXN)}
IXc = np.array([IXI[B[c]['group']['label']] for c in CODES]); capv = np.array([cap.get(c) or np.nan for c in CODES], float)
PM = np.full((len(CODES), len(DATES)), np.nan)
for j, c in enumerate(CODES):
    try: co = J(LIVE + '/atlas/data/co/' + c + '.json')
    except Exception: continue
    cl, k0 = co.get('close'), co.get('k0')
    if not isinstance(cl, list) or not isinstance(k0, int): continue
    for i, x in enumerate(cl):
        t = i + k0
        if 0 <= t < len(DATES) and isinstance(x, (int, float)) and x > 0: PM[j, t] = x
HMAX = 20; T = len(DATES) - 1; t0 = S36.NEED_T
rng = np.random.default_rng(1124)
fall = []; runs = {k: [] for k in S36.KINDS}; runday = {k: [] for k in S36.KINDS}; tried = {k: 0 for k in S36.KINDS}; picked = {k: 0 for k in S36.KINDS}
pool = {}   # 날마다 아무렇게나 일곱(오른 것만) 오름 날수
def run_len(path):   # path = 1..HMAX 날 뒤 산 값 대비(평균) — 첫날 올랐을 때 산 값 위에 머문 날수(HMAX 넘으면 HMAX+1)
    n = 0
    for v in path:
        if np.isfinite(v) and v > 0: n += 1
        else: break
    return n if n <= HMAX - 1 else HMAX + 1 if n == HMAX else n
st = time.time()
for t in range(t0, T - HMAX + 1):
    L = SUN.land(SUN.market(PM, t))
    if L != 'fall': continue
    fall.append(t)
    with np.errstate(invalid='ignore', divide='ignore'):
        F = PM[:, t + 1:t + HMAX + 1] / PM[:, t:t + 1] - 1     # 회사 × 1..20 날 뒤
    R = S36.lists36(CODES, IXc, PM, t, capv, dates=DATES)
    idx = {c: j for j, c in enumerate(CODES)}
    for k, Lk in R['lists'].items():
        tried[k] += 1
        if not Lk: continue
        picked[k] += 1
        jj = [idx[c] for c in Lk]
        with np.errstate(invalid='ignore'):
            path = np.nanmean(F[jj], axis=0)
        if np.isfinite(path[0]) and path[0] > 0:
            runs[k].append(run_len(path)); runday[k].append(t)
    ok = np.where(np.isfinite(F).all(axis=1))[0]
    if len(ok) >= 30:
        sel = ok[np.argpartition(rng.random((3000, len(ok))), 7, axis=1)[:, :7]]
        P7 = F[sel].mean(axis=1)                      # 3000 × 20
        up = P7[:, 0] > 0
        pos = P7[up] > 0
        # 첫 날 뒤로 처음 산 값 아래로 간 날 전까지 센 날수
        first_bad = np.where(pos.all(axis=1), HMAX, np.argmin(pos, axis=1))
        rl = np.where(first_bad >= HMAX, HMAX + 1, first_bad)
        pool[t] = rl[rng.integers(0, len(rl), 1000)] if len(rl) else None
print('fall days', len(fall), 'took', round(time.time() - st, 1), 's', file=sys.stderr)
# 몬테카를로 — 꾀가 오른 날마다 그날 아무렇게나 일곱(오른 것)으로 바꿔 평균 날수를 2,000번
SIMS = 2000
out = {'asOf': DATES[T], 'from': DATES[t0], 'fallDays': len(fall), 'fallFrom': DATES[fall[0]] if fall else None, 'fallTo': DATES[fall[-1]] if fall else None, 'hmax': HMAX, 'sims': SIMS, 'kinds': {}}
allpool = np.concatenate([pool[t] for t in fall if pool.get(t) is not None]) if fall else np.array([])
out['random'] = {'mean': float(allpool.mean()) if len(allpool) else None, 'median': float(np.median(allpool)) if len(allpool) else None,
                 'hist': [int((allpool == d).sum()) for d in range(0, HMAX + 2)]}
eps = {}
for k in S36.KINDS:
    r = np.array(runs[k]); ds = runday[k]
    rec = {'tried': tried[k], 'picked': picked[k], 'rose': len(r), 'hist': [int((r == d).sum()) for d in range(0, HMAX + 2)]}
    if len(r):
        rec.update(mean=float(r.mean()), median=float(np.median(r)), p5=float((r >= 5).mean()), max=int(r.max()))
        # 떨어진 하락장 덩어리 수(이어진 내리는 날을 한 덩어리로)
        ep = 1 + sum(1 for a, b2 in zip(ds, ds[1:]) if b2 - a > 1) if ds else 0
        rec['episodes'] = ep
        keep = [i for i, t in enumerate(ds) if pool.get(t) is not None]   # 그날 아무렇게나 일곱을 셀 수 있었던 날만(꾀 쪽도 같은 날만)
        if keep:
            P = np.stack([pool[ds[i]] for i in keep]); rk = r[keep]
            pick = rng.integers(0, P.shape[1], (SIMS, len(keep)))
            sim = P[np.arange(len(keep))[None, :], pick].mean(axis=1)
            rec['mc'] = {'n': len(keep), 'mean': float(rk.mean()), 'p05': float(np.percentile(sim, 5)), 'p50': float(np.percentile(sim, 50)), 'p95': float(np.percentile(sim, 95)),
                         'beat': float((rk.mean() > sim).mean())}
    out['kinds'][k] = rec
json.dump(out, open(OUT, 'w', encoding='utf-8'), ensure_ascii=False)
raw = {'dates': [DATES[t] for t in fall], 'runs': {k: [[DATES[t], int(x)] for t, x in zip(runday[k], runs[k])] for k in S36.KINDS},
       'pool': {DATES[t]: pool[t].tolist() for t in fall if pool.get(t) is not None}, 'hmax': HMAX, 'note': 'run 21 = 20일 넘게(스무 날 내내 산 값 위) · pool = 그날 아무렇게나 일곱 가운데 다음 날 오른 것의 오름 날수 1,000개'}
json.dump(raw, open(OUT.replace('.json', '-raw.json'), 'w', encoding='utf-8'))
print('done', file=sys.stderr)
