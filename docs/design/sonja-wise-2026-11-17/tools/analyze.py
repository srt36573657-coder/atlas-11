"""지혜로운 꾀 고르기 — 한 번 계산(자료 날까지 지난 500거래일 · 닷새 뒤 값)
   ① 같은 날 아무렇게나 고른 일곱과 견줌 ② 운 거르기(닷새 겹침을 셈한 믿음 · 서른한 꾀를 한꺼번에 볼 때 우연 걸러내기 BH)
   ③ 앞 절반 · 뒤 절반 모두 덜 잃었나 ④ 크게 잃은 꼬리가 아무렇게나 고른 일곱보다 나쁘지 않나 ⑤ 업종마다 둘까지
   그리고 앞 절반으로 고른 꾀 다섯이 뒤 절반에 어땠나(지금 법 · 지혜 법 · 아무렇게나)"""
import json, math, sys
import numpy as np
from statistics import NormalDist
Phi = NormalDist().cdf
D = json.load(open('rows.json')); rows = D['rows']; KS = D['KS']; landT = D['landT']
rng = np.random.default_rng(7)
OV = 5   # 닷새씩 겹침 — 날 수를 다섯에 하나로 봄
def stat(rs, key, k):
    xs = [r for r in rs if k in r[key]]
    n = len(xs)
    if n < 10: return None
    r_ = np.array([x[key][k] for x in xs]); p0 = np.array([x['p0'] for x in xs])
    lose = int((r_ < 0).sum()); exp = float(p0.sum()); var = float((p0 * (1 - p0)).sum()) * OV
    z = (exp - lose) / math.sqrt(var) if var > 0 else 0.0
    k10 = max(1, n // 10)
    R7 = np.array([x['rs7'] for x in xs]); sims = R7[np.arange(n)[None, :], rng.integers(0, R7.shape[1], size=(200, n))]
    cvar7 = float(np.sort(sims, axis=1)[:, :k10].mean())
    L = r_[r_ < 0]
    return dict(k=k, n=n, lose=lose, lr=lose / n, exp=exp / n, ex=(exp - lose) / n, z=z, p=1 - Phi(z), avg=float(r_.mean()),
                cvar=float(np.sort(r_)[:k10].mean()), cvar7=cvar7, avgLoss=float(L.mean()) if len(L) else 0.0, worst=float(r_.min()))
def site_key(s): return (round(s['lr'], 3), -s['avgLoss'], -s['worst'], -s['avg'], s['k'])
def bh(ps, q=0.10):
    o = sorted(range(len(ps)), key=lambda i: ps[i]); m = len(ps); ok = [False] * m; cut = 0
    for r, i in enumerate(o, 1):
        if ps[i] <= q * r / m: cut = r
    for r, i in enumerate(o, 1): ok[i] = r <= cut
    return ok
def wise(rs, key='rc'):
    half = len(rs) // 2; A, B = rs[:half], rs[half:]
    S = {k: stat(rs, key, k) for k in KS}; S = {k: s for k, s in S.items() if s}
    SA = {k: stat(A, key, k) for k in S}; SB = {k: stat(B, key, k) for k in S}
    ks = list(S); ok = dict(zip(ks, bh([S[k]['p'] for k in ks])))
    out = []
    for k in ks:
        s = S[k]; a, b = SA.get(k), SB.get(k)
        keep = ok[k] and a and b and a['ex'] > 0 and b['ex'] > 0 and s['cvar'] >= s['cvar7']
        neff = s['n'] / OV
        out.append(dict(s, luck=not ok[k], both=bool(a and b and a['ex'] > 0 and b['ex'] > 0), tail=s['cvar'] >= s['cvar7'], keep=bool(keep), shr=s['ex'] * neff / (neff + 20)))
    return sorted(out, key=lambda x: (not x['keep'], -x['shr'], x['k']))
def spear(a, b):
    ra = np.argsort(np.argsort(a)); rb = np.argsort(np.argsort(b)); return float(np.corrcoef(ra, rb)[0, 1])
def walk(rs):
    """앞 절반으로 다섯을 골라 뒤 절반에서 셈 — 지금 법(덜 잃은 차례 · 지금 판) · 지혜 법(앞 절반 안에서 다시 반으로 나눠 둘 다 덜 잃고 · 운 거르고 · 꼬리 보고 · 업종 둘까지)"""
    half = len(rs) // 2; A, B = rs[:half], rs[half:]
    SA = [s for s in (stat(A, 'r', k) for k in KS) if s]
    cur = [s['k'] for s in sorted(SA, key=site_key)[:5]]
    W = wise(A, 'rc'); wk = [w['k'] for w in W if w['keep']][:5]
    def onB(ks, key):
        ss = [stat(B, key, k) for k in ks]; ss = [s for s in ss if s]
        if not ss: return None
        return dict(ks=ks, lr=float(np.mean([s['lr'] for s in ss])), exp=float(np.mean([s['exp'] for s in ss])), ex=float(np.mean([s['ex'] for s in ss])),
                    avg=float(np.mean([s['avg'] for s in ss])), cvar=float(np.mean([s['cvar'] for s in ss])), cvar7=float(np.mean([s['cvar7'] for s in ss])))
    allB = onB(KS, 'r')
    exA = {s['k']: s['ex'] for s in SA}; SB = {k: stat(B, 'r', k) for k in exA}
    ks = [k for k in exA if SB.get(k)]
    return dict(A=(A[0]['d'], A[-1]['d'], len(A)), B=(B[0]['d'], B[-1]['d'], len(B)), cur=onB(cur, 'r'), wise=onB(wk, 'rc') if wk else None, all=allB,
                rho=spear([exA[k] for k in ks], [SB[k]['ex'] for k in ks]), randLR=float(np.mean([r['p0'] for r in B])))
same = [r for r in rows if r['land'] == landT]
res = {'dT': D['dT'], 'landT': landT, 'days': len(rows), 'same': len(same), 'from': rows[0]['d'], 'to': rows[-1]['d'],
       'site': [dict(s) for s in sorted([s for s in (stat(same if len(same) >= 20 else rows, 'r', k) for k in KS) if s], key=site_key)],
       'wiseSame': wise(same if len(same) >= 40 else rows, 'rc'), 'wiseAll': wise(rows, 'rc'), 'walkAll': walk(rows), 'walkSame': walk(same) if len(same) >= 80 else None,
       'sectMax': float(np.mean([v for r in rows for v in r['sect'].values()]))}
json.dump(res, open('result.json', 'w'), ensure_ascii=False, indent=1)
f = lambda x: '%.1f' % (100 * x)
print('자료', res['from'], '~', res['to'], '날', res['days'], '오늘 땅', landT, '같은 땅 날', res['same'], '고른 일곱 가운데 한 업종 최대 평균', round(res['sectMax'], 2))
print('지금 법 차례 앞 다섯(같은 땅):', [(s['k'], f(s['lr']), f(s['exp']), round(s['z'], 2)) for s in res['site'][:5]])
for nm in ('wiseSame', 'wiseAll'):
    W = res[nm]; print(nm, '남은 꾀', [(w['k'], f(w['lr']), f(w['exp']), round(w['z'], 2)) for w in W if w['keep']], '운 걸림', sum(w['luck'] for w in W), '/', len(W))
for nm in ('walkAll', 'walkSame'):
    w = res[nm]
    if not w: print(nm, '모자람'); continue
    print(nm, 'A', w['A'], 'B', w['B'], '순위 이어짐 rho', round(w['rho'], 2), '아무렇게나 잃은 몫', f(w['randLR']))
    for lab in ('cur', 'wise', 'all'):
        x = w[lab]; print('  ', lab, None if not x else (x['ks'][:5] if lab != 'all' else 'all', '잃은 몫', f(x['lr']), '아무렇게나', f(x['exp']), '평균', f(x['avg']), '꼬리', f(x['cvar']), '꼬리7', f(x['cvar7'])))
