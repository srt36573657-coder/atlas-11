"""새 ATLAS 바탕 365곳(t365-v1) ② 고르기 — 쓰는 법: python3 scripts/atlas11/t365/select.py <후보 표 json> <결과 json>
   우량 문(여섯) → 흐름 문(2026 · 2027 가운데 하나 이상) → 두 흐름 모두 → 한 흐름 · 각각 시가총액 큰 순 → 365곳 · 같은 원문이면 언제나 같은 365곳"""
import json, sys, os, collections, statistics as st
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__))); from rules import *
D=json.load(open(sys.argv[1])); R=D['rows']
CAP, ATV, DEBT, DAYS, R1Y, N = 1000, 3, 200, 260, 0.20, 365
fails=collections.Counter()
P=[]
for r in R:
    f=blue(r,CAP,ATV,DEBT,DAYS)
    if f: fails[f]+=1
    else: P.append(r)
thr=R1Y
out=[]
for r in P:
    gok, gsrc, ga, gb = growth(r)
    t26 = r['px']['r1y'] is not None and r['px']['r1y'] >= thr and gok
    th = SECTOR2THEME.get(nz(r['sector']))
    t27 = th is not None and gok
    if t26 or t27:
        out.append({**{k: r[k] for k in ['code','name','market','sector','capEok','capRank']}, 'r1y': r['px']['r1y'], 'atv': r['px']['atvEok'],
                    'op25': fv(r,'op','2025.12'), 'op26e': fv(r,'op','2026.12E'), 'op24': fv(r,'op','2024.12'), 'net25': fv(r,'net','2025.12'),
                    'roe': (r['metrics'] or {}).get('roe'), 'debt': (r['metrics'] or {}).get('debt'), 'growthBy': gsrc, 'gA': ga, 'gB': gb,
                    't26': t26, 't27': t27, 'theme': th})
both=[x for x in out if x['t26'] and x['t27']]; one=[x for x in out if not (x['t26'] and x['t27'])]
both.sort(key=lambda x: -x['capEok']); one.sort(key=lambda x: -x['capEok'])
picked=(both+one)[:N]
cut = one[N-len(both)-1]['capEok'] if len(both) < N and len(one) >= N-len(both) else None
res={'asOf': D['asOf'], 'collectedAt': D['collectedAt'], 'universe': len(R), 'pool': len(P), 'fails': fails.most_common(), 'thrR1y': thr, 'union': len(out), 'both': len(both), 'only26': sum(1 for x in out if x['t26'] and not x['t27']), 'only27': sum(1 for x in out if x['t27'] and not x['t26']),
     'picked': picked, 'dropped': (both+one)[N:], 'cutCapEok': cut}
json.dump(res, open(sys.argv[2],'w'), ensure_ascii=False, indent=1)
print({k: res[k] for k in ['universe','pool','thrR1y','union','both','only26','only27','cutCapEok']}); print('fails', res['fails'])
c=collections.Counter(x['sector'] for x in picked); print('sectors', len(c)); print(c.most_common(15))
t=collections.Counter(x['theme'] or '(2026 흐름만)' for x in picked); print(t.most_common())
print('t26 in picked', sum(x['t26'] for x in picked), 't27', sum(x['t27'] for x in picked), 'both', sum(x['t26'] and x['t27'] for x in picked))
print('cap min', min(x['capEok'] for x in picked), 'median', st.median(x['capEok'] for x in picked))
print('markets', collections.Counter(x['market'] for x in picked))
# 지금 365곳과 겹침
cur=json.load(open(os.path.join(os.path.dirname(os.path.abspath(__file__)),'..','..','..','public','data','input.json')))['assets']; cc={a['code'] for a in cur}
print('overlap with current 365', sum(1 for x in picked if x['code'] in cc))
print('dropped (last 20 by cap)', [(x['name'], x['capEok']) for x in res['dropped'][:20]])
