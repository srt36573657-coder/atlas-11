import json,glob,collections,re
KEY=[('토스증권',2),('토스',1),('카카오뱅크',3),('카카오페이',4),('케이뱅크',5),('뱅크샐러드',6),('로빈후드',7),('레볼루트',8),('몬조',9),('와이즈',10),('wise',10),('캐시앱',11),('차임',12),('n26',13),('누뱅크',14),('퍼블릭',15),('웰스심플',16),('애플',17),('스트라이프',18),('클라르나',19),('페이팔',20),('코인베이스',21),('이토로',22),('웨불',23),('트레이딩',24),('무무',25),('머큐리',26),('램프',27),('코파일럿',28),('모나크',29),('와이냅',30),('ynab',30),('에이콘스',31),('스탈링',32),('번크',33),('bunq',33),('업 뱅크',34),('업뱅크',34),('제로다',35),('카이트',35),('신한',36),('kb',36),('쏠',36)]
NAME={}
for f in glob.glob('res/a*.json'):
    d=json.load(open(f)); NAME[int(d['id'])]=d.get('app','')
def app(t):
    t=(t or '').lower()
    for k,n in KEY:
        if k in t: return n
    return None
B=collections.Counter();S=collections.Counter();why=collections.defaultdict(list);mv=collections.defaultdict(list);sj=[];n=0;bad=[]
for f in sorted(glob.glob('res/f*.json')):
    try: d=json.load(open(f))
    except Exception as e: bad.append(f); continue
    n+=1; b=app(d.get('best')); s=app(d.get('second'))
    if b==int(d.get('id',0)): bad.append(f+' 자기 앱'); b=None
    if b: B[b]+=1; why[b].append(d.get('why','')); mv[b]+= [m.get('name','')+': '+m.get('how','') for m in d.get('moves',[])]
    if s: S[s]+=1
    if d.get('sonja'): sj.append(d['sonja'])
print('낸 사람',n,'못 읽음',bad)
pts={k:B[k]*2+S[k] for k in set(B)|set(S)}
for k,p in sorted(pts.items(),key=lambda kv:-kv[1])[:10]:
    print(f'A{k:02d} {NAME.get(k,"")} 1등 {B[k]} · 2등 {S[k]} · 점 {p} |',' / '.join(why[k][:3])[:260])
top=max(pts,key=lambda k:pts[k]) if pts else None
print('=== 1등',top,NAME.get(top))
for m in mv.get(top,[])[:40]: print('수',m[:150])
print('=== 손자병법 손길')
for s in sj[:36]: print('-',s[:120])
