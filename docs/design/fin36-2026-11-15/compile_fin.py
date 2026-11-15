import json,glob,os
rows=[]
for f in sorted(glob.glob('res/a*.json')):
    try: d=json.load(open(f))
    except Exception as e: print('못 읽음',f,e); continue
    s=d.get('scores') or {}
    vals=[v for v in s.values() if isinstance(v,(int,float))]
    avg=round(sum(vals)/len(vals),2) if vals else 0
    rows.append((avg,d))
rows.sort(key=lambda r:-r[0])
out=['# 조사단 36 모음 — 금융 앱 디자인(점수 평균 높은 차례) · 점수는 조사한 사람의 판단','']
for avg,d in rows:
    s=d.get('scores') or {}
    out.append(f"## A{int(d.get('id',0)):02d} {d.get('app','')} ({d.get('country','')}) — 평균 {avg}")
    out.append('- 점수: '+' · '.join(f'{k} {v}' for k,v in s.items()))
    aw=d.get('awards') or []
    out.append('- 상: '+(' / '.join(aw[:3]) if aw else '못 찾음'))
    for m in (d.get('moves') or [])[:5]:
        out.append(f"- 수: {m.get('name','')} — {m.get('what','')} → {m.get('apply','')}")
    out.append(f"- 한 줄: {d.get('verdict','')}")
    out.append('')
open('FIN_ALL.md','w').write('\n'.join(out))
print('apps',len(rows),'bytes',len('\n'.join(out).encode()))
for avg,d in rows[:12]: print(avg,d.get('app'))
