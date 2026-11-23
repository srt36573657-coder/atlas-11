"""손자병법 미국 판 자료 만들기 — 한국 판과 같은 서른여섯 꾀 셈(su21_s36.py lists36)을 미국 365곳 지난 종가에 그대로 씀
   사장님 2026-11-23 「미국판을 만들어 · 영어로 만들지 말고 다 한글로 · 지금 만든 방식으로 · 365개」
   읽기: public/data/atlas11/us/input.json(365곳 종가) · view/board.json · view/stocks/<번호>.json · 쓰기: site/su/data/us/su-us.json
   앞날을 맞히지 않음 · 사고팔기를 권하지 않음 — 지난 값 모습만 셈. 한 주 값은 천 배 가까이 키워(원처럼) 한국 셈의 「한 주 값 천 원 넘음」 거름을 그대로 둠(오르내림 비율은 안 바뀜)"""
import json, os, sys
import numpy as np
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '../../..'))
sys.path.insert(0, os.path.join(ROOT, 'scripts/atlas11/next'))
import su21_s36 as S36
U = os.path.join(ROOT, 'public/data/atlas11/us')
J = lambda p: json.load(open(p, encoding='utf-8'))
inp = J(U + '/input.json'); board = J(U + '/view/board.json'); man = J(U + '/view/manifest.json')
dates = inp['calendar']['sessions']; asof = man['asOf']; t = dates.index(asof)
A = inp['assets']; codes = [a['code'] for a in A]; N = len(codes)
SCALE = 1500.0
P = np.full((N, len(dates)), np.nan)
di = {d: i for i, d in enumerate(dates)}
for j, a in enumerate(A):
    for p in a['prices']:
        if p['date'] in di and isinstance(p['close'], (int, float)) and p['close'] > 0: P[j, di[p['date']]] = p['close'] * SCALE
P = P[:, :t + 1]
st = {c: J(U + '/view/stocks/%s.json' % c) for c in codes}
labs = sorted({st[c]['group']['label'] for c in codes}); li = {l: i for i, l in enumerate(labs)}
IX = np.array([li[st[c]['group']['label']] for c in codes])
cap = np.array([(a['quality'].get('capUsd') or 0) / 1e3 + 1e5 for a in A], float)  # 몸집 거름은 모두 지나게(크기만 차례에 씀)
late = {x['code'] for x in board.get('late', [])}
R = S36.lists36(codes, IX, P, t, cap, dates=dates, late=late, full=True)
co = {}
for c in codes:
    s = st[c]
    co[c] = {'name': s['name'], 'ind': s['group']['label'], 'close': s['close'], 'd1': s['change1'], 'd20': s.get('change20'), 'd120': s.get('change120'),
             'line': s['c'], 'hi52': s['info'].get('high52'), 'lo52': s['info'].get('low52'), 'pos52': s['info'].get('pos52'), 'date': s['date'], 'late': c in late}
used = {c for L in R['lists'].values() for c in L}
# 형세 — 지수와 오른 곳 수
ix = J(U + '/market/INX.json')['rows']
ixr = [(r[0], r[1]) if isinstance(r, list) else (r.get('date'), r.get('close')) for r in ix]
ixr = [x for x in ixr if x[0] and x[0] <= asof and x[1]]
def ret(n): return ixr[-1][1] / ixr[-1 - n][1] - 1 if len(ixr) > n else None
d1 = [v['d1'] for v in co.values() if isinstance(v['d1'], (int, float))]
d20 = [v['d20'] for v in co.values() if isinstance(v['d20'], (int, float))]
hi = ixr[-250:] ; ixmax = max(x[1] for x in hi)
sun = {'asOf': asof, 'ix': {'name': 'S&P 500(미국 대표 500곳 지수)', 'last': ixr[-1][1], 'd1': ret(1), 'd5': ret(5), 'd20': ret(20), 'd60': ret(60), 'fromHigh': ixr[-1][1] / ixmax - 1,
       'line': [x[1] for x in ixr[-60:]]},
       'up1': sum(1 for x in d1 if x > 0), 'down1': sum(1 for x in d1 if x < 0), 'n1': len(d1), 'up20': sum(1 for x in d20 if x > 0), 'n20': len(d20),
       'med1': float(np.median(d1)), 'med20': float(np.median(d20))}
out = {'schema': 'su-us-1', 'asOf': asof, 'n': N, 'k': S36.K, 'rule': S36.RULE_ID, 'kinds': S36.KINDS, 'han': S36.HAN, 'name': S36.NAME, 'mean': S36.MEAN, 'say': S36.SAY, 'set': S36.SETOF,
       'lists': R['lists'], 'why': R['why'], 'volNote': '미국 사고판 양 자료는 아직 받지 않아 사고판 양으로 재는 꾀 다섯은 비워 둬요.', 'funnel': R.get('funnel'),
       'co': {c: co[c] for c in codes}, 'used': sorted(used), 'sun': sun, 'late': sorted(late)}
os.makedirs(os.path.join(ROOT, 'site/su/data/us'), exist_ok=True)
json.dump(out, open(os.path.join(ROOT, 'site/su/data/us/su-us.json'), 'w', encoding='utf-8'), ensure_ascii=False, separators=(',', ':'))
print('ok', asof, N, 'used', len(used), {k: len(v) for k, v in R['lists'].items() if v}, 'empty', [k for k, v in R['lists'].items() if not v])
