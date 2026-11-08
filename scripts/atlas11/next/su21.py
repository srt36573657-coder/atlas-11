#!/usr/bin/env python3
"""수르 21곳 — 한국 상장 회사 모두 → 우량주 365곳 → 불장 7 · 꽃이 될 7 · 돈이 몰리는 7(주문 2044 · 사장님 2026-11-04 15:44(+04) 「수르 전면 개편 명령서」)
  [1. 수르가 하는 일은 셋뿐이다] 1. 한국 상장 종목 전체를 세어 적어라 2. 그 가운데 우량주 365곳을 먼저 골라라 3. 우량주 기준은 이전 기록 것을 먼저 써라
  4. 365곳 안에서 불장 종목 7곳 5. 꽃이 될 종목 7곳 6. 돈이 몰리는 종목 7곳 7. 두 곳에 걸린 종목은 겹쳤다고 표시해라
  우량주 365 = 지금 사이트가 내는 판(n365-v1 · /data/atlas11/view/board.json · 2026-10-05 사장님 「지금 180개를 365개로 한다」 · lib/atlas11/universe.mjs —
    두 해 잇달아 이익 · 자기자본이익 5 넘게 · 빚 150 아래(금융은 빚 셈 빼고) · 업종마다 5곳 · 73업종)
  불장 = 그 판의 「불장 업종」(지난 20거래일 365곳 업종 평균이 오른 업종 · 큰 순 11까지) 안 회사 가운데 20거래일 오른 만큼 큰 순 · 업종마다 둘까지 · 값이 늦은 회사 뺌
  꽃이 될 = 365곳 가운데 「싹」(theme-co z=S — 한 달 앞선 만큼 5 아래 · 닷새 동안 시장에 뒤지지 않음)이고 회사 크기가 위 20 안(cond.cap) · 업종 앞선 만큼 큰 순 → 회사 앞선 만큼 큰 순
    (꽃 조건 전부 — 업종이 한 달 동안 시장보다 15 넘게 — 를 다 채운 회사가 0곳이면 「가장 가까운 7곳」이라고 적음)
  돈이 몰리는 = 한 달 동안 시장보다 더 오른 업종(theme.json x>0) 큰 순 → 업종마다 365곳 가운데 20거래일 동안 회사 크기가 원으로 가장 많이 는 회사 하나 · 하루 35 넘는 움직임 뺌
  쓰는 법: python3 scripts/atlas11/next/su21.py --live <사이트 받은 곳(atlas/data · next/data)> --repo <저장소> --out site/su/data/su21.json
  숫자는 모두 받은 자료 그대로 — 지어낸 숫자 없음 · 빈 칸은 None(화면 「확인 필요」)"""
import json, sys, collections, datetime, argparse

ap = argparse.ArgumentParser()
ap.add_argument('--live', required=True); ap.add_argument('--repo', required=True); ap.add_argument('--out', required=True)
A = ap.parse_args()
J = lambda p: json.load(open(p, encoding='utf-8'))
b = J(A.repo + '/public/data/atlas11/view/board.json')
mkt = J(A.live + '/atlas/data/mkt.json'); MK = mkt['companies']
tco = J(A.live + '/next/data/theme-co.json')['co']
th = J(A.live + '/next/data/theme.json')
cond = J(A.live + '/atlas/data/cond.json')
cap = {c: cond['co']['cap'][k] for k, c in enumerate(cond['co']['c'])}
lands = J(A.repo + '/scripts/atlas11/t365/groups.json')['groups']
IND = {i['n']: i for i in th['inds']}
B = {c['code']: c for c in b['companies']}
late = {x['code'] for x in b['late']}
nm = lambda c: (MK.get(c) or {}).get('n') or B[c]['name']
r1 = lambda v: None if v is None else round(v, 1)
r2 = lambda v: None if v is None else round(v, 2)
SRC_P = '네이버 증권 그날 마지막 값 · 수르가 셈'

_OPEN = {}
def opens(c):
    # 수르 회사 쪽이 열리는 회사만 고름 — 회사 자료(atlas/data/co/<번호>.json)에 c 칸(이름 · 시장)이 있어야 그 쪽을 그림
    # (2026-11-05 진짜 사이트 검사 — 올릴 때 다시 센 꽃 칸의 F&F 383220 은 c 칸이 없어 「찾지 못했어요」 · 주문 0054 [2] 4 「누르면 왜 여기 있나 먼저」)
    if c not in _OPEN:
        try: _OPEN[c] = isinstance(J(A.live + '/atlas/data/co/' + c + '.json').get('c'), dict)
        except Exception: _OPEN[c] = False
    return _OPEN[c]

def per2(lst, k=7, per=2):
    out, cnt = [], collections.Counter()
    for c in lst:
        g = B[c]['group']['label']
        if cnt[g] >= per: continue
        cnt[g] += 1; out.append(c)
        if len(out) == k: break
    return out

# ① 불장
hot = {i['id']: i for i in b['hot']['items']}
f1 = sorted([c for c, v in B.items() if v['group']['id'] in hot and c not in late and v.get('change20') is not None and v['change20'] > 0 and opens(c)], key=lambda c: (-B[c]['change20'], c))
HOT = per2(f1)
# ② 꽃이 될
caps = sorted(v for v in cond['co']['cap'] if v and v > 0); n = len(caps)
thr = caps[next(r for r in range(n) if (r + 1) / n >= 0.8)]
spr = [c for c in B if c in tco and tco[c][2] == 'S' and (cap.get(c) or 0) >= thr and opens(c)]
full = [c for c in spr if (IND.get(MK.get(c, {}).get('i'), {}).get('x') or -1e9) >= 15]
ix = lambda c: IND.get(MK.get(c, {}).get('i'), {}).get('x')
spr.sort(key=lambda c: (-(ix(c) if ix(c) is not None else -1e9), -tco[c][0], c))
BLOOM = (full + [c for c in spr if c not in full])[:7]
# ③ 돈이 몰리는
def gain(c):
    l = (MK.get(c) or {}).get('l') or []
    if len(l) != 21 or not cap.get(c) or any(x is None or x <= 0 for x in l): return None
    if any(abs(q / p - 1) >= 0.35 for p, q in zip(l, l[1:])): return None
    if all(x == l[0] for x in l): return None
    return cap[c] * (1 - l[0] / l[-1])
MONEY, mrow = [], {}
for i in sorted([i for i in th['inds'] if i.get('x') is not None and i['x'] > 0], key=lambda i: -i['x']):
    g = sorted([(gain(c), c) for c in B if MK.get(c, {}).get('i') == i['n'] and gain(c) is not None and opens(c)], key=lambda t: (-t[0], t[1]))
    if g and g[0][0] > 0:
        MONEY.append(g[0][1]); mrow[g[0][1]] = (i, round(g[0][0]))
    if len(MONEY) == 7: break

# ④ 될 듯 셋(주문 1103 · 사장님 2026-11-08 11:03 「불장이 될듯 한 종목 7개 · 돈이 몰릴듯 한 종목 7개 · 싹에서 꽃이 될듯 한 7개 추가하자」 · 11:08 「응」)
#   지난 1년(su_next_past.py · reports/atlas11/su-next/past.json)에 날마다 똑같이 대어 한 달 안에 그렇게 된 일이 가장 많은 셈 + 일곱이 안 되면 다음 셈으로 채움
#   불장이 될 듯(H5) = 불장 업종 안 20거래일 차례 8 ~ 14째(일곱 바로 아래) → 모자라면 닷새 막 오르기 시작한 곳(업종도 닷새 오름 · 닷새 큰 순)
#   돈이 몰릴 듯(M4) = 돈이 몰리는 일곱 바로 아래 업종(8 ~ 14째)마다 회사 크기가 가장 많이 는 곳 → 모자라면 일곱 밖 업종마다 닷새 동안 가장 많이 는 곳
#   꽃이 될 듯(B5) = 싹(한 달 시장보다 앞선 만큼 5 아래 · 닷새 뒤지지 않음) 가운데 닷새 시장보다 2 넘게 앞서고 20거래일 오른 곳 → 모자라면 크기 위 20 안 싹을 닷새 차례로
CL = {}
for c, v in B.items():
    l = v.get('c')
    if isinstance(l, list) and len(l) == 21 and all(isinstance(x, (int, float)) and x > 0 for x in l) and not any(abs(q / p - 1) >= 0.35 for p, q in zip(l, l[1:])): CL[c] = l
R20 = {c: l[-1] / l[0] - 1 for c, l in CL.items()}; R5 = {c: l[-1] / l[-6] - 1 for c, l in CL.items()}
avg = lambda xs: sum(xs) / len(xs) if xs else None
M20, M5 = avg(list(R20.values())), avg(list(R5.values()))
INDS = collections.defaultdict(list)
for c in CL: INDS[B[c]['group']['label']].append(c)
I5 = {i: avg([R5[c] for c in cs]) for i, cs in INDS.items()}
ok_n = lambda c: c in CL and c not in late and opens(c)
def per2k(lst, k=7, per=2):
    out, cnt = [], collections.Counter()
    for c in lst:
        if c in out: continue
        g = B[c]['group']['label']
        if cnt[g] >= per: continue
        cnt[g] += 1; out.append(c)
        if len(out) == k: break
    return out
hot14 = per2(f1, k=14)
h_main = [c for c in hot14 if c not in HOT and c in CL]
h_fill = sorted([c for c in CL if ok_n(c) and c not in HOT and R5[c] > 0 and R20[c] > 0 and (I5.get(B[c]['group']['label']) or 0) > 0], key=lambda c: (-R5[c], c))
HOTN = per2k(h_main + h_fill)
hrow = {c: ('rank', hot14.index(c) + 1) if c in h_main else ('five', None) for c in HOTN}
def gain5(c):
    l = (MK.get(c) or {}).get('l') or []
    if len(l) != 21 or not cap.get(c) or any(x is None or x <= 0 for x in l): return None
    if any(abs(q / p - 1) >= 0.35 for p, q in zip(l, l[1:])): return None
    return cap[c] * (1 - l[-6] / l[-1])
MONEYN, mnrow, seen, rank_inds = [], {}, 0, set()
for i in sorted([i for i in th['inds'] if i.get('x') is not None and i['x'] > 0], key=lambda i: -i['x']):
    g = sorted([(gain(c), c) for c in B if MK.get(c, {}).get('i') == i['n'] and gain(c) is not None and opens(c)], key=lambda t: (-t[0], t[1]))
    if g and g[0][0] > 0:
        seen += 1
        if seen > 7 and g[0][1] not in MONEY: MONEYN.append(g[0][1]); mnrow[g[0][1]] = ('rank', i, round(g[0][0]), seen); rank_inds.add(i['n'])
    if len(MONEYN) == 7 or seen >= 14: break
top7 = {mrow[c][0]['n'] for c in MONEY}
fill = []
for i in th['inds']:
    if i['n'] in top7 or i['n'] in rank_inds: continue
    g = sorted([(gain5(c), c) for c in B if MK.get(c, {}).get('i') == i['n'] and gain5(c) is not None and opens(c) and c not in MONEY and c not in MONEYN], key=lambda t: (-t[0], t[1]))
    if g and g[0][0] > 0: fill.append((g[0][0], g[0][1], i))
for gn, c, i in sorted(fill, key=lambda t: (-t[0], t[1])):
    if len(MONEYN) == 7: break
    MONEYN.append(c); mnrow[c] = ('five', i, round(gn), None)
X20 = {c: R20[c] - M20 for c in CL}; X5 = {c: R5[c] - M5 for c in CL}
sprN = [c for c in CL if ok_n(c) and X20[c] < 0.05 and X5[c] >= 0 and c not in BLOOM]
b_main = sorted([c for c in sprN if X5[c] >= 0.02 and R20[c] > 0], key=lambda c: (-X5[c], c))
b_fill = sorted([c for c in sprN if (cap.get(c) or 0) >= thr], key=lambda c: (-X5[c], c))
BLOOMN = per2k(b_main + b_fill)
try: PAST = J(A.repo + '/reports/atlas11/su-next/past.json')
except Exception: PAST = None

lists = {'hot': HOT, 'bloom': BLOOM, 'money': MONEY, 'hotNext': HOTN, 'moneyNext': MONEYN, 'bloomNext': BLOOMN}
NOW3 = ('hot', 'bloom', 'money')
inl = collections.defaultdict(list)
for k, L in lists.items():
    for c in L: inl[c].append(k)
land_of = {}
for G in lands:
    for i in G['industries']: land_of[i] = G

HEAVY = ('c', 'flows', 'news', 'pos52', 'close')
slim = lambda co: {k: v for k, v in co.items() if k not in HEAVY}
def item(c, k):
    v = B[c]; ind = v['group']['label']; L = land_of.get(ind)
    co = {'code': c, 'name': nm(c), 'ind': ind, 'land': L['name'] if L else None, 'landId': L['id'] if L else None, 'kind': v.get('kind'), 'in': inl[c],
          'ch20': r1(v['change20'] * 100) if v.get('change20') is not None else None, 'close': v.get('close'), 'date': v.get('date'),
          'c': v.get('c'), 'flows': (v.get('brief') or {}).get('flows'), 'news': {k2: (v.get('brief') or {}).get(k2) for k2 in ('newsCount', 'newsNamed')},
          'pos52': (v.get('info') or {}).get('pos52'), 'cap': cap.get(c), 'x': tco.get(c, [None, None])[0], 'y': tco.get(c, [None, None])[1], 'z': tco.get(c, [None, None, None])[2]}
    if k == 'hot':
        h = hot[v['group']['id']]
        co['why'] = {'ind20': r1(h['change20'] * 100), 'from': h['from'], 'to': h['to'], 'up': h['up'], 'measured': h['measured']}
    elif k == 'bloom':
        co['why'] = {'indX': ix(c), 'full': c in full, 'line': 15, 'capTop20': thr}
    elif k == 'money':
        i, gn = mrow[c]
        co['why'] = {'indX': i['x'], 'gain': gn, 'lead': i.get('lead')}
    elif k == 'hotNext':
        how, rk = hrow[c]
        co['why'] = {'how': how, 'rank': rk, 'r20': r1(R20[c] * 100), 'r5': r1(R5[c] * 100), 'ind5': r1((I5.get(ind) or 0) * 100), 'hot7': r1(B[HOT[-1]]['change20'] * 100) if HOT else None}
    elif k == 'moneyNext':
        how, i, gn, rk = mnrow[c]
        co['why'] = {'how': how, 'rank': rk, 'indX': i.get('x'), 'gain': gn}
    else:
        co['why'] = {'how': 'main' if c in b_main else 'cap', 'x20': r1(X20[c] * 100), 'x5': r1(X5[c] * 100), 'r20': r1(R20[c] * 100), 'capTop20': thr}
    return co

out = {
    'schema': 'su21-2', 'made': datetime.datetime.now(datetime.timezone.utc).isoformat(timespec='seconds'),
    'asOf': {'board': b['asOf'], 'data': th['asOf'], 'mkt': mkt.get('asOf'), 'cond': cond.get('asOf')},
    'src': {'price': SRC_P, 'board': '/data/atlas11/view/board.json', 'theme': '/next/data/theme.json · theme-co.json', 'cap': '/atlas/data/cond.json', 'mkt': '/atlas/data/mkt.json'},
    'counts': {'listed': mkt.get('n'), 'listedWhat': '코스피 · 코스닥 보통주', 'b365': len(B), 'kinds': dict(collections.Counter(v.get('kind') for v in B.values())),
               'markets': None, 'hotInds': len(hot), 'hotPool': len(f1), 'bloomPool': len(spr), 'bloomFull': len(full), 'late': len(late),
               'hotNextRank': len(h_main), 'moneyNextRank': len([c for c in MONEYN if mnrow[c][0] == 'rank']), 'bloomNextMain': len([c for c in BLOOMN if c in b_main]), 'sproutN': len(sprN)},
    'rules': {'b365': '두 해 잇달아 이익 · 자기자본이익 5 넘게 · 빚 150 아래(금융은 빚 셈 빼고) · 업종마다 5곳 · 73업종 · 2026년 10월 5일에 정한 판(n365-v1)',
              'hot': '불장 업종(지난 20거래일 365곳 업종 평균이 오른 업종) 안에서 20거래일 동안 가장 많이 오른 차례 · 업종마다 둘까지 · 값이 늦은 회사는 뺌',
              'bloom': '싹(시장보다 앞선 만큼 아직 5 아래 · 닷새 동안 뒤지지 않음)이고 회사 크기가 위 20 안 · 업종이 시장보다 많이 앞선 차례(꽃 선 15)',
              'money': '한 달 동안 시장보다 더 오른 업종 차례로 · 업종마다 20거래일 동안 회사 크기가 원으로 가장 많이 는 회사 하나',
              'hotNext': '불장 업종 안에서 20거래일 동안 오른 차례가 8 ~ 14째인 곳(불장 일곱 바로 아래 · 업종마다 둘) · 모자라면 닷새 동안 막 오르기 시작한 곳',
              'moneyNext': '돈이 몰리는 일곱 바로 아래 업종(8 ~ 14째)마다 20거래일 동안 회사 크기가 가장 많이 는 곳 · 모자라면 일곱 밖 업종마다 닷새 동안 가장 많이 는 곳',
              'bloomNext': '싹 가운데 닷새 동안 시장보다 2 넘게 앞서고 20거래일 동안 오른 곳 · 모자라면 회사 크기가 위 20 안인 싹을 닷새 차례로'},
    'past': ({'from': PAST['from'], 'to': PAST['to'], 'days': PAST['days'], 'within': PAST['within'], 'universe': PAST['universe'], 'src': 'reports/atlas11/su-next/past.json',
              'what': PAST['what'], **{g: {'n': v['picks'], 'hit': v['hits'], 'per100': round(v['per100']), 'base100': round(v['base100'])} for g, v in PAST['final'].items()}} if PAST else None),
    'lists': {k: [item(c, k) for c in L] if k in NOW3 else [slim(item(c, k)) for c in L] for k, L in lists.items()}, # 될 듯 셋은 가볍게(첫 화면 느린 휴대폰) — 21 마지막 값 · 수급 · 뉴스는 su21-next.json
    'overlap': [{'code': c, 'name': nm(c), 'in': [k for k in ks if k in NOW3]} for c, ks in inl.items() if len([k for k in ks if k in NOW3]) > 1],
    'distinct': len([c for c, ks in inl.items() if any(k in NOW3 for k in ks)]),
    'overlapNext': [{'code': c, 'name': nm(c), 'in': [k for k in ks if k not in NOW3]} for c, ks in inl.items() if len([k for k in ks if k not in NOW3]) > 1],
    'distinctNext': len([c for c, ks in inl.items() if any(k not in NOW3 for k in ks)]),
    'lands': [{'id': G['id'], 'name': G['name'], 'say': G.get('say'),
               'inds': [{'name': g['label'], 'ch20': r1(g['change20'] * 100) if g.get('change20') is not None else None, 'hot': bool(g.get('hot')),
                         'cos': [{'code': c, 'name': nm(c), 'kind': B[c].get('kind'), 'ch20': r1(B[c]['change20'] * 100) if B[c].get('change20') is not None else None, 'in': [k for k in inl.get(c, []) if k in NOW3]}
                                 for c in g['codes'] if c in B]}
                        for g in b['groups'] if g['label'] in G['industries']]}
              for G in lands],
}
out['lands'] = [L for L in out['lands'] if L['inds']]
lands_out = out.pop('lands') # 땅 지도는 따로(첫 화면이 가볍게 — 느린 휴대폰) · su21-map.json
json.dump(out, open(A.out, 'w', encoding='utf-8'), ensure_ascii=False, separators=(',', ':'))
json.dump({'schema': 'su21-map-1', 'asOf': out['asOf'], 'lands': lands_out}, open(A.out.replace('su21.json', 'su21-map.json'), 'w', encoding='utf-8'), ensure_ascii=False, separators=(',', ':'))
json.dump({'schema': 'su21-next-1', 'asOf': out['asOf'], 'lists': {k: [item(c, k) for c in lists[k]] for k in ('hotNext', 'moneyNext', 'bloomNext')}}, open(A.out.replace('su21.json', 'su21-next.json'), 'w', encoding='utf-8'), ensure_ascii=False, separators=(',', ':')) # 될 듯 회사의 출목표 쪽(#/c/<번호>/more)만 받음
print('ok', {k: [nm(c) for c in L] for k, L in lists.items()}, 'distinct', len(inl), 'overlap', [o['name'] for o in out['overlap']], 'lands', len(lands_out))
