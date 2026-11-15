import json,glob
def c(t,k):
    t=str(t or '').replace('\n',' '); return t if len(t)<=k else t[:k]+'…'
full=['# 공부단 36 모음 — 서예 · 동양 미술의 아름다움과 틀을 깬 판(판 번호 = 공부한 사람 번호)','']
short=['# 판 36 짧은 모음 — 서예 · 동양 미술의 아름다움으로 틀을 깬 판(자세한 판은 STUDY_ALL.md)','']
n=0;finds=0
for f in sorted(glob.glob('res/s*.json')):
    try: d=json.load(open(f))
    except Exception as e: print('못 읽음',f,e); continue
    n+=1; i=int(d.get('id',0)); b=d.get('board') or {}
    L=d.get('learn') or []; finds+=len(L)
    cols=' '.join(f'{x[0]}{x[1]}' for x in (b.get('colors') or []) if isinstance(x,(list,tuple)) and len(x)>=2)
    full.append(f"## P{i:02d} 「{b.get('name','')}」 — 갈래: {d.get('topic','')}")
    for x in L[:5]:
        src='; '.join(f"{s.get('t','')} {s.get('u','')}" for s in (x.get('src') or [])[:2])
        full.append(f"- 배움: {c(x.get('what'),60)} — {c(x.get('why'),110)} → {c(x.get('apply'),110)} (출처: {c(src,160)})")
    for k,lab in [('idea','뜻'),('break','깨는 틀'),('type','글씨'),('layout','구도'),('cells','21곳'),('band','띠'),('motion','움직임'),('myomi','묘미'),('elder','어르신'),('risk','위험')]:
        full.append(f"- {lab}: {c(b.get(k),240)}")
    full.append(f"- 색: {cols}"); full.append('')
    short+=[f"## P{i:02d} 「{c(b.get('name'),20)}」 ({c(d.get('topic'),26)})",
            f"뜻 {c(b.get('idea'),80)} | 깨는 틀 {c(b.get('break'),70)}",
            f"구도 {c(b.get('layout'),150)}",
            f"21곳 {c(b.get('cells'),80)} | 띠 {c(b.get('band'),60)} | 색 {cols}",
            f"글씨 {c(b.get('type'),70)} | 묘미 {c(b.get('myomi'),70)}",'']
open('STUDY_ALL.md','w').write('\n'.join(full)); open('BOARDS_SHORT.md','w').write('\n'.join(short))
print('판',n,'배움',finds,'모음',len('\n'.join(full).encode()),'짧은',len('\n'.join(short).encode()))
