import json,glob,os
out=['# 조사단 36 모음 — 판 P01~P36 · 트렌드 찾은 것','']
boards=[];finds=[]
for f in sorted(glob.glob('res/t*.json')):
    try: d=json.load(open(f))
    except Exception as e:
        out.append(f'(못 읽음 {os.path.basename(f)})'); continue
    n=int(d.get('id') or os.path.basename(f)[1:3])
    b=d.get('board') or {}
    boards.append((n,d.get('topic',''),b))
    for x in d.get('finds',[]):
        src=x.get('src') or []
        s0='; '.join(f"{s.get('t','')[:60]} ({s.get('d','')})" for s in src[:2])
        finds.append((n,x.get('trend',''),x.get('what',''),x.get('apply',''),x.get('risk',''),s0))
out.append('## 판 제안(조사단마다 하나)')
for n,topic,b in boards:
    cols=' · '.join(f"{c[0]} {c[1]}" for c in (b.get('colors') or []) if isinstance(c,(list,tuple)) and len(c)>=2)
    out.append(f"### P{n:02d} 「{b.get('name','')}」 — 갈래 {n} {topic}")
    out.append(f"- 뜻: {b.get('idea','')}")
    out.append(f"- 색: {cols} · 글꼴: {b.get('font','')}")
    out.append(f"- 모양: {b.get('shape','')} · 움직임: {b.get('motion','')}")
    out.append(f"- 바닥 띠: {b.get('band','')}")
    out.append(f"- 왜 지금: {b.get('why','')}")
out.append('')
out.append('## 찾은 트렌드(갈래 번호 · 이름 · 무엇 · 입히는 법 · 부딪힘 · 출처)')
for n,t,w,a,r,s in finds:
    out.append(f"- [{n:02d}] {t} — {w} / 입힘: {a} / 부딪힘: {r} / 출처: {s}")
open('TREND_ALL.md','w').write('\n'.join(out))
k=out.index('## 찾은 트렌드(갈래 번호 · 이름 · 무엇 · 입히는 법 · 부딪힘 · 출처)')
open('TREND_BOARDS.md','w').write('\n'.join(out[:k]))
print('boards',len(boards),'finds',len(finds),'bytes',len('\n'.join(out).encode()))
