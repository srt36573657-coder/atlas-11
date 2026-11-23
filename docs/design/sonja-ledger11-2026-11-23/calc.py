#!/usr/bin/env python3
"""장부 잣대 열한 가지 — 지금 장부에 대 본 셈(주문 1123-2348 · 제안 보고의 숫자를 다시 냄)
읽는 것: reports/atlas11/su21/settle.json(장부 — 꾀마다 날마다 일곱 곳 · 회사마다 날마다 마지막 값 px)
        public/data/atlas11/view/board.json(오늘 판 — 우량주마다 21날 마지막 값 c · cFrom 부터 평일)
쓰는 법: python3 docs/design/sonja-ledger11-2026-11-23/calc.py  (저장소 맨 위에서)"""
import json, statistics as st, datetime as dt, random
b = json.load(open('reports/atlas11/su21/settle.json', encoding='utf-8'))
B = json.load(open('public/data/atlas11/view/board.json', encoding='utf-8'))
px, s36 = b['px'], b['s36']
c0 = B['companies'][0]; d = dt.date.fromisoformat(c0['cFrom']); cal = []
while len(cal) < len(c0['c']):
    if d.weekday() < 5: cal.append(d.isoformat())
    d += dt.timedelta(days=1)
U = {co['code']: co['c'] for co in B['companies'] if co.get('cFrom') == c0['cFrom'] and len(co['c']) == len(cal) and all(co['c'])}
assert all(U[c][cal.index(k)] == v for c in U if c in px for k, v in px[c].items() if k in cal), '판 값과 장부 값이 어긋남'
last = cal[-1]
rows = [(day, g, c, px[c][day], px[c][max(px[c])]) for day in sorted(s36) for g, cs in s36[day].items() for c in cs if day in px.get(c, {})]
old = [r for r in rows if r[0] != last]
uni = {k: st.mean(v[-1] / v[cal.index(k)] for v in U.values()) for k in sorted(s36) if k != last}
cost = sum(10 * r[3] for r in old); val = sum(10 * r[4] for r in old); uval = sum(10 * r[3] * uni[r[0]] for r in old)
print('① 시장과 나란히 — 장부 100원이 %.1f원 · 같은 날 판 전체(우량주 %d곳 · 같은 돈) %.1f원 · 차이 %.1f원' % (100 * val / cost, len(U), 100 * uval / cost, 100 * (val - uval) / cost))
r100 = lambda r: 100 * r[4] / r[3]
def after(r, k):
    ds = [x for x in sorted(px[r[2]]) if x > r[0]]
    return 100 * px[r[2]][ds[k - 1]] / r[3] if len(ds) >= k else None
for day in sorted(uni):
    a = [x for x in (after(r, 1) for r in rows if r[0] == day) if x]
    print('② 같은 날수로 — %s 산 것 하루 뒤 100원이 %.1f원 · 지금 %.1f원 · 지난 날 %d' % (day, st.mean(a), st.mean(r100(r) for r in rows if r[0] == day), len([x for x in cal if x > day])))
tr = [json.loads(l) for l in open('reports/atlas11/su21/settle-track.jsonl', encoding='utf-8') if l.strip()]
path = [(t['day'], 100 * sum(t['v']) / sum(t['c'])) for t in tr if sum(t['c'])]
pk, dd = -1, (0, None, None)
for day, v in path:
    pk = max(pk, v)
    if pk - v > dd[0]: dd = (pk - v, day, v)
print('③ 가장 깊이 빠진 때 — 쌓인 장부 %s 100원이 %.1f원 · 가장 높던 때보다 %.1f원' % (dd[1], dd[2], dd[0]))
mv = [r100(r) for r in old]
up = [x for x in mv if x >= 101]; dn = [x for x in mv if x <= 99]
print('④ 늘 때 평균 %.1f원 · 줄 때 평균 %.1f원' % (st.mean(up) - 100, 100 - st.mean(dn)))
rel = [r100(r) - 100 * uni[r[0]] for r in old]
print('⑤ 몇 번 중 몇 번 — %d줄 가운데 시장보다 나음 %d · 비슷함(1원 안쪽) %d · 못함 %d' % (len(rel), sum(x >= 1 for x in rel), sum(-1 < x < 1 for x in rel), sum(x <= -1 for x in rel)))
print('⑥ 가운데 줄 — %.1f원(합 %.1f원 · 오늘 산 것도 셈)' % (st.median(mv), 100 * sum(10 * r[4] for r in rows) / sum(10 * r[3] for r in rows)))
by = {}
for r in old: by.setdefault((r[0], r[1]), []).append(r100(r))
real = st.mean(x for v in by.values() for x in v); codes = list(U); rnd = random.Random(1123); sims = []
for t in range(1000):
    sims.append(st.mean(100 * U[c][-1] / U[c][cal.index(day)] for (day, g), v in by.items() for c in rnd.sample(codes, len(v))))
sims.sort()
print('⑦ 아무렇게나 천 번 — 장부(줄마다 같은 돈) %.1f원 · 아무렇게나 %.1f ~ %.1f원(가운데 %.1f) · 천 번 중 %d번보다 나음' % (real, sims[0], sims[-1], st.median(sims), sum(real > s for s in sims)))
G = {}
for r in old: G.setdefault(r[1], set()).add(r[0])
print('⑧ 아직 일러요 — 꾀마다 산 날', sorted({len(v) for v in G.values()}), '번')
