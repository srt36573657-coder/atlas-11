"""주문 1117-1720 — 미리 적은 법대로: 앞 1년으로 하나를 고르고 뒤 1년에서만 확인"""
import json, math
import numpy as np
from statistics import NormalDist
Phi = NormalDist().cdf
rows = json.load(open('rows3.json'))['rows']; R1 = json.load(open('rows.json')); landT = R1['landT']
rng = np.random.default_rng(23)
NAMES = {'L1': '덜 흔들린 일곱', 'L2': '겹친 곳 덜 흔들린', 'L3': '추세 위 덜 흔들린', 'L4': '겹친 곳 추세 위 덜 흔들린', 'L5': '시장 덜 따르는', 'L6': '갈래 고루 덜 흔들린'}
def st(rs, g, key='g', p0k='p0', rsk='rs7', ov=5):
    xs = [r for r in rs if g in r[key] and rsk in r]; n = len(xs)
    if n < 10: return None
    a = np.array([x[key][g] for x in xs]); p0 = np.array([x[p0k] for x in xs])
    lose = int((a < 0).sum()); exp = float(p0.sum()); var = float((p0 * (1 - p0)).sum()) * ov
    k10 = max(1, n // 10); R7 = np.array([x[rsk] for x in xs]); sims = R7[np.arange(n)[None, :], rng.integers(0, R7.shape[1], size=(300, n))]
    tails = np.sort(sims, axis=1)[:, :k10].mean(1); tail = float(np.sort(a)[:k10].mean())
    return dict(n=n, lr=lose / n, exp=exp / n, z=(exp - lose) / math.sqrt(var), avg=float(a.mean()), tail=tail, tail7=float(tails.mean()), ptail=float((tails >= tail).mean()))
half = len(rows) // 2; A, B = rows[:half], rows[half:]
SA = {g: st(A, g) for g in NAMES}; SB = {g: st(B, g) for g in NAMES}
ok = [g for g in NAMES if SA[g] and SA[g]['lr'] <= SA[g]['exp'] + 0.05]
pick = sorted(ok, key=lambda g: (-SA[g]['tail'], SA[g]['lr'], g))[0] if ok else None
f = lambda x: '%.1f' % (100 * x)
print('앞 1년', A[0]['d'], '~', A[-1]['d'], '· 뒤 1년', B[0]['d'], '~', B[-1]['d'])
for g in NAMES:
    a, b = SA[g], SB[g]
    print(g, NAMES[g], '| 앞: 잃음', f(a['lr']), '아무', f(a['exp']), '꼬리', f(a['tail']), '꼬리7', f(a['tail7']), '| 뒤: 잃음', f(b['lr']), '아무', f(b['exp']), 'z', round(b['z'], 2), '꼬리', f(b['tail']), '꼬리7', f(b['tail7']), 'p꼬리', round(b['ptail'], 3), '평균', f(b['avg']), '| 남음' if g in ok else '| 뺌')
print('고른 법', pick, NAMES.get(pick))
# 지금 법 — 꾀 하나의 일곱(서른한 꾀 평균) · 뒤 1년
r1 = R1['rows']; h1 = len(r1) // 2; B1 = r1[h1:]
lose_k = [np.mean([1.0 if x['r'][k] < 0 else 0.0 for x in B1 if k in x['r']]) for k in R1['KS'] if sum(1 for x in B1 if k in x['r']) >= 10]
tail_k = []
for k in R1['KS']:
    a = np.array([x['r'][k] for x in B1 if k in x['r']])
    if len(a) >= 10: tail_k.append(float(np.sort(a)[:max(1, len(a) // 10)].mean()))
print('지금 법(꾀 하나 · 서른한 꾀 평균) 뒤 1년: 잃음', f(np.mean(lose_k)), '꼬리', f(np.mean(tail_k)))
# 고른 법의 뒤 1년 — 스무 날 뒤 · 내리는 땅
if pick:
    s20 = st(B, pick, key='g20', p0k='p020', rsk='rs720', ov=20)
    sB_fall = st([r for r in B if r['land'] == landT], pick)
    print('스무 날 뒤(뒤 1년)', s20 and dict(n=s20['n'], 잃음=f(s20['lr']), 아무=f(s20['exp']), 꼬리=f(s20['tail']), 꼬리7=f(s20['tail7']), p꼬리=round(s20['ptail'], 3)))
    print('내리는 땅(뒤 1년)', sB_fall and dict(n=sB_fall['n'], 잃음=f(sB_fall['lr']), 아무=f(sB_fall['exp']), 꼬리=f(sB_fall['tail']), 꼬리7=f(sB_fall['tail7']), p꼬리=round(sB_fall['ptail'], 3)))
json.dump({'A': [A[0]['d'], A[-1]['d']], 'B': [B[0]['d'], B[-1]['d']], 'SA': SA, 'SB': SB, 'ok': ok, 'pick': pick,
           'curB': {'lr': float(np.mean(lose_k)), 'tail': float(np.mean(tail_k))}}, open('result3.json', 'w'), ensure_ascii=False, indent=1)
