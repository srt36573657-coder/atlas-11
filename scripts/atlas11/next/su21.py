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

lists = {'hot': HOT, 'bloom': BLOOM, 'money': MONEY}
inl = collections.defaultdict(list)
for k, L in lists.items():
    for c in L: inl[c].append(k)
land_of = {}
for G in lands:
    for i in G['industries']: land_of[i] = G

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
    else:
        i, gn = mrow[c]
        co['why'] = {'indX': i['x'], 'gain': gn, 'lead': i.get('lead')}
    return co

out = {
    'schema': 'su21-1', 'made': datetime.datetime.now(datetime.timezone.utc).isoformat(timespec='seconds'),
    'asOf': {'board': b['asOf'], 'data': th['asOf'], 'mkt': mkt.get('asOf'), 'cond': cond.get('asOf')},
    'src': {'price': SRC_P, 'board': '/data/atlas11/view/board.json', 'theme': '/next/data/theme.json · theme-co.json', 'cap': '/atlas/data/cond.json', 'mkt': '/atlas/data/mkt.json'},
    'counts': {'listed': mkt.get('n'), 'listedWhat': '코스피 · 코스닥 보통주', 'b365': len(B), 'kinds': dict(collections.Counter(v.get('kind') for v in B.values())),
               'markets': None, 'hotInds': len(hot), 'hotPool': len(f1), 'bloomPool': len(spr), 'bloomFull': len(full), 'late': len(late)},
    'rules': {'b365': '두 해 잇달아 이익 · 자기자본이익 5 넘게 · 빚 150 아래(금융은 빚 셈 빼고) · 업종마다 5곳 · 73업종 · 2026년 10월 5일에 정한 판(n365-v1)',
              'hot': '불장 업종(지난 20거래일 365곳 업종 평균이 오른 업종) 안에서 20거래일 동안 가장 많이 오른 차례 · 업종마다 둘까지 · 값이 늦은 회사는 뺌',
              'bloom': '싹(시장보다 앞선 만큼 아직 5 아래 · 닷새 동안 뒤지지 않음)이고 회사 크기가 위 20 안 · 업종이 시장보다 많이 앞선 차례(꽃 선 15)',
              'money': '한 달 동안 시장보다 더 오른 업종 차례로 · 업종마다 20거래일 동안 회사 크기가 원으로 가장 많이 는 회사 하나'},
    'lists': {k: [item(c, k) for c in L] for k, L in lists.items()},
    'overlap': [{'code': c, 'name': nm(c), 'in': ks} for c, ks in inl.items() if len(ks) > 1],
    'distinct': len(inl),
    'lands': [{'id': G['id'], 'name': G['name'], 'say': G.get('say'),
               'inds': [{'name': g['label'], 'ch20': r1(g['change20'] * 100) if g.get('change20') is not None else None, 'hot': bool(g.get('hot')),
                         'cos': [{'code': c, 'name': nm(c), 'kind': B[c].get('kind'), 'ch20': r1(B[c]['change20'] * 100) if B[c].get('change20') is not None else None, 'in': inl.get(c, [])}
                                 for c in g['codes'] if c in B]}
                        for g in b['groups'] if g['label'] in G['industries']]}
              for G in lands],
}
out['lands'] = [L for L in out['lands'] if L['inds']]
lands_out = out.pop('lands') # 땅 지도는 따로(첫 화면이 가볍게 — 느린 휴대폰) · su21-map.json
json.dump(out, open(A.out, 'w', encoding='utf-8'), ensure_ascii=False, separators=(',', ':'))
json.dump({'schema': 'su21-map-1', 'asOf': out['asOf'], 'lands': lands_out}, open(A.out.replace('su21.json', 'su21-map.json'), 'w', encoding='utf-8'), ensure_ascii=False, separators=(',', ':'))
print('ok', {k: [nm(c) for c in L] for k, L in lists.items()}, 'distinct', len(inl), 'overlap', [o['name'] for o in out['overlap']], 'lands', len(lands_out))
