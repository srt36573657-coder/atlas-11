"""ATLAS 11 공부 · 「대세 상승 초입의 출목표」 넷째 판(표본) 따로 세기 — road_start_samples.mjs 의 코드를 쓰지 않고 파이썬으로 처음부터 다시 셈
   (출목표 놓는 법도 site/app/road.js 를 읽어 다시 적음 · 반올림은 자바스크립트 Math.round 와 같게 floor(x + 0.5))
   ① 표본마다 그 날 종가 · 6달(1달) 안 가장 높은/낮은 값 · 그림 ② 똑같은 그림 짝이 정말 같은 그림인지 · 그 그림이 몇 번 나왔는지
   ③ 가장 닮은 그림 30개(빠른 길 없이 모든 날을 하나하나 견줘 셈) ④ 「때」 세 날의 365곳 비율 ⑤ 1달 「빨강 2배」 두 날의 수 · 365곳 전체
   쓰는 법: python3 -I scripts/atlas11/study/road_start_samples_check.py reports/atlas11/study/road-start/samples.json"""
import gzip, json, math, sys
import os
R = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', '..')) + '/'
b = json.loads(gzip.open(R + 'reports/atlas11/universe/2026-10-05-0940/bundle.json.gz').read())
board = json.load(open(R + 'public/data/atlas11/view/board.json'))
inb = {c['code'] for c in board['companies']}
res = json.load(open(sys.argv[1] if len(sys.argv) > 1 else R + 'reports/atlas11/study/road-start/samples.json', encoding='utf-8'))
WIN, AHEAD, JUMP = 20, 120, 0.31

def layout(rets, unit):
    cells, occ, last, cs0, col, row, turned = [], set(), None, -1, 0, 0, False
    for day, r in enumerate(rets):
        n = math.floor(abs(r) / unit + 0.5)
        o = 'up' if r > 0 else 'down'
        for _ in range(n):
            if o != last:
                cs0 += 1
                while (cs0, 0) in occ: cs0 += 1
                col, row, turned = cs0, 0, False
            elif (not turned) and row < 5 and (col, row + 1) not in occ:
                row += 1
            else:
                col += 1; turned = True
            occ.add((col, row)); cells.append((col, row, o)); last = o
    return cells, (max(c[0] for c in cells) + 1 if cells else 0)

def road(closes):
    rets = [closes[i + 1] / closes[i] - 1 for i in range(len(closes) - 1)]
    unit = 0.01; cells, cols = layout(rets, unit)
    for u in (0.02, 0.03, 0.05):
        if cols <= 24: break
        unit = u; cells, cols = layout(rets, u)
    beads = ''.join('u' if c[2] == 'up' else 'd' for c in cells)
    runs = []
    for ch in beads:
        if runs and runs[-1][0] == ch: runs[-1][1] += 1
        else: runs.append([ch, 1])
    return {'unit': round(unit * 100), 'cells': cells, 'beads': beads, 'first': runs[0][0] if runs else '-', 'lens': [n for _, n in runs], 'up': beads.count('u'), 'down': beads.count('d')}

# 모든 날 다시 만들기
W = []
series = {}
for code, s in b['stocks'].items():
    rows = (s.get('fchart') or {}).get('rows')
    if not isinstance(rows, list) or len(rows) < WIN + 1 + AHEAD: continue
    ds = [str(r[0]) for r in rows]; cs = [float(r[4]) for r in rows]
    if any(not (v > 0) for v in cs): continue
    series[code] = (ds, cs)
    jump = [0] + [1 if abs(cs[i] / cs[i - 1] - 1) > JUMP else 0 for i in range(1, len(cs))]
    cum = [0] * len(cs)
    for i in range(1, len(cs)): cum[i] = cum[i - 1] + jump[i]
    for t in range(WIN, len(cs) - AHEAD):
        if cum[t + AHEAD] - cum[t - WIN] > 0: continue
        rd = road(cs[t - WIN:t + 1])
        fut = cs[t + 1:t + AHEAD + 1]; m20 = cs[t + 1:t + 21]
        W.append((code, ds[t], rd['unit'], rd['first'], rd['lens'], rd['up'], rd['down'], max(fut) / cs[t], min(fut) / cs[t], max(m20) / cs[t], min(m20) / cs[t], rd['beads']))
print('windows', len(W), '(셈: %d)' % res['windows'], 'stocks', len(series), '(셈: %d)' % res['stocks'])
idx = {(w[0], w[1]): i for i, w in enumerate(W)}
up = lambda w: w[7] >= 1.5; dn = lambda w: w[8] <= 1 / 1.5
print('baseUp %.6f (셈 %.6f) · baseDn %.6f (셈 %.6f)' % (sum(map(up, W)) / len(W), res['baseUp'], sum(map(dn, W)) / len(W), res['baseDn']))

def check(c, after='120', tag=''):
    w = W[idx[(c['code'], c['date'])]]
    ok = abs(w[7] - c['f120']) < 1e-3 and abs(w[8] - c['g120']) < 1e-3 and abs(w[9] - c['f20']) < 1e-3 and abs(w[10] - c['g20']) < 1e-3 and w[2] == c['unit'] and w[5] == c['up'] and w[6] == c['down']
    rd = road(series[c['code']][1][series[c['code']][0].index(c['date']) - WIN: series[c['code']][0].index(c['date']) + 1])
    cells_ok = sorted([(x, y, 1 if s == 'up' else 0) for x, y, s in rd['cells']]) == sorted(tuple(x) for x in c['cells'])
    print(f"  {tag}{c['name']} {c['date']} 종가 {series[c['code']][1][series[c['code']][0].index(c['date'])]:.0f} · 6달 최고 ×{w[7]:.4f} 최저 ×{w[8]:.4f} · 1달 ×{w[9]:.4f}/×{w[10]:.4f} · 그림 {w[2]}% 빨강{w[5]} 파랑{w[6]} → {'같음' if ok and cells_ok else '다름!'}")
    return ok and cells_ok

allok = True
print('① 크게 오르기 바로 전 날')
for r in res['rise']:
    allok &= check(r, tag=r['period'] + ' ')
    for k in ('nearest', 'nearestFell'):
        if r.get(k): allok &= check(r[k], tag='   닮은 ' + k + ' ')
print('② 똑같은 그림 짝')
for p in res['pairs']:
    a, f = W[idx[(p['rise']['code'], p['rise']['date'])]], W[idx[(p['fall']['code'], p['fall']['date'])]]
    same = a[11] == f[11] and a[2] == f[2]
    allok &= same and check(p['rise'], tag='  오름 ') and check(p['fall'], tag='  떨어짐 ')
    grp = [w for w in W if w[2] == a[2] and w[11] == a[11]]
    print(f"   그림 같음: {same} · 이 그림 전체 {len(grp)}번(셈 {p['same']['n']}) · 크게 오름 {sum(map(up, grp))}(셈 {p['same']['up']}) · 크게 떨어짐 {sum(map(dn, grp))}(셈 {p['same']['dn']}) · 회사 {len(set(w[0] for w in grp))}(셈 {p['sameCompanies']})")
    allok &= len(grp) == p['same']['n'] and sum(map(up, grp)) == p['same']['up'] and sum(map(dn, grp)) == p['same']['dn']

print('③ 가장 닮은 그림 30개 — 모든 날을 하나하나 견줘 셈(빠른 길 없이)')
def dist(a, b):
    m = max(len(a), len(b)); return sum(abs((a[i] if i < len(a) else 0) - (b[i] if i < len(b) else 0)) for i in range(m))
for r in res['rise']:
    q = W[idx[(r['code'], r['date'])]]
    cand = sorted(((dist(q[4], w[4]), j) for j, w in enumerate(W) if w[0] != q[0] and w[2] == q[2] and w[3] == q[3]))[:30]
    ds = [d for d, _ in cand]; ws = [W[j] for _, j in cand]
    u_, d_ = sum(map(up, ws)), sum(map(dn, ws))
    ok = abs(sum(ds) / 30 - r['near']['diffAvg']) < 1e-9 and max(ds) == r['near']['diffMax'] and u_ == r['near']['up'] and d_ == r['near']['dn']
    print(f"  {r['name']} {r['date']}: 차이 평균 {sum(ds)/30:.3f}(셈 {r['near']['diffAvg']:.3f}) · 가장 큰 차이 {max(ds)}(셈 {r['near']['diffMax']}) · 크게 오름 {u_}(셈 {r['near']['up']}) · 크게 떨어짐 {d_}(셈 {r['near']['dn']}) → {'같음' if ok else '다름!'}")
    allok &= ok

print('③-2 날짜가 6달(120거래일) 넘게 떨어진 닮은 그림만 — 모든 날을 하나하나 견줘 셈')
dates = sorted({w[1] for w in W}); didx = {d: i for i, d in enumerate(dates)}
for r in res['rise']:
    q = W[idx[(r['code'], r['date'])]]
    cand = sorted(((dist(q[4], w[4]), j) for j, w in enumerate(W) if w[0] != q[0] and w[2] == q[2] and w[3] == q[3] and abs(didx[w[1]] - didx[q[1]]) > 120))[:30]
    ds = [d for d, _ in cand]; ws = [W[j] for _, j in cand]
    u_, d_ = sum(map(up, ws)), sum(map(dn, ws))
    nf = r['nearFar']
    ok = abs(sum(ds) / 30 - nf['diffAvg']) < 1e-9 and max(ds) == nf['diffMax'] and u_ == nf['up'] and d_ == nf['dn']
    print(f"  {r['name']} {r['date']}: 차이 평균 {sum(ds)/30:.3f}(셈 {nf['diffAvg']:.3f}) · 크게 오름 {u_}(셈 {nf['up']}) · 크게 떨어짐 {d_}(셈 {nf['dn']}) → {'같음' if ok else '다름!'}")
    allok &= ok

print('④ 「때」')
for k in ('lowest', 'highest', 'median'):
    d = res['when'][k]['d']; ws = [w for w in W if w[1] == d and w[0] in inb]
    u_, d_ = sum(map(up, ws)) / len(ws), sum(map(dn, ws)) / len(ws)
    ok = abs(u_ - res['when'][k]['up']) < 1e-12 and abs(d_ - res['when'][k]['dn']) < 1e-12
    print(f"  {k} {d}: 365곳 가운데 {len(ws)}곳 · 크게 오름 {u_*100:.1f}% · 크게 떨어짐 {d_*100:.1f}% → {'같음' if ok else '다름!'}")
    allok &= ok

print('⑤ 1달 「빨강이 파랑의 2배」')
rt = lambda w: w[5] > 0 and w[5] >= 2 * w[6]
for k in ('good', 'bad'):
    m = res['month'][k]; ws = [w for w in W if w[1] == m['date'] and w[0] in inb and rt(w)]
    nu, nd = sum(1 for w in ws if w[9] >= 1.3), sum(1 for w in ws if w[10] <= 1 / 1.3)
    ok = len(ws) == m['n'] and nu == m['nUp30'] and nd == m['nDn23']
    print(f"  {k} {m['date']}: 이 모양 {len(ws)}곳(셈 {m['n']}) · 한 달 안 +30% {nu}(셈 {m['nUp30']}) · −23% {nd}(셈 {m['nDn23']}) → {'같음' if ok else '다름!'}")
    allok &= ok
    for s in ('rose', 'fell', 'least'):
        if m.get(s): allok &= check(m[s], tag='   ' + s + ' ')
ws = [w for w in W if w[0] in inb]; r2 = [w for w in ws if rt(w)]
a = res['month']['all365']
print(f"  365곳 전체: 날 {len(ws)}(셈 {a['days']}) · 이 모양 {len(r2)}(셈 {a['redTwice']['n']}) · 이 모양 뒤 +30% {sum(1 for w in r2 if w[9] >= 1.3)/len(r2)*100:.2f}%(셈 {a['redTwice']['up30']*100:.2f}) · 아무 날 {sum(1 for w in ws if w[9] >= 1.3)/len(ws)*100:.2f}%(셈 {a['base']['up30']*100:.2f})")
print('모두 같음' if allok else '다른 것이 있음')
