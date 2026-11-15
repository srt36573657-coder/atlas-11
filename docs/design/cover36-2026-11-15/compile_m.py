import json,glob
out=['# 토론단 36 판 모음 — 책 표지의 색 · 구도 · 글씨체로 요즘과 옛것이 만나는 앱(판 번호 = 토론자 번호)','']
n=0
for f in sorted(glob.glob('res/m*.json')):
    try: d=json.load(open(f))
    except Exception as e: print('못 읽음',f,e); continue
    b=d.get('board') or {}; n+=1
    i=int(d.get('id',0))
    def c(t,k=150):
        t=str(t or ''); return t if len(t)<=k else t[:k]+'…'
    cols=' · '.join(f'{x[0]} {x[1]}' for x in (b.get('colors') or []) if isinstance(x,(list,tuple)) and len(x)>=2)
    out+= [f"## P{i:02d} 「{b.get('name','')}」 — 갈래: {d.get('lens','')}",
           f"- 뜻: {c(b.get('idea'))}", f"- 색: {cols}", f"- 글씨: {c(b.get('type'),160)}",
           f"- 구도: {c(b.get('layout'),220)}", f"- 칸: {c(b.get('cell'))}", f"- 움직임: {c(b.get('motion'),100)}",
           f"- 띠: {c(b.get('band'),120)}", f"- 만남: {c(b.get('meet'),120)}", f"- 묘미: {c(b.get('myomi'),120)}",
           f"- 위험: {c(b.get('risk'),120)}", '']
open('BOARDS.md','w').write('\n'.join(out)); print('판',n,'bytes',len('\n'.join(out).encode()))
