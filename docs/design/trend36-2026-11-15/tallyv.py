import json,glob,collections,re
P=collections.Counter();O=collections.Counter();C=collections.Counter();why=collections.defaultdict(list);ow=collections.defaultdict(list)
n=0
for f in sorted(glob.glob('res/v*.json')):
    try: d=json.load(open(f))
    except Exception: continue
    n+=1
    for x in d.get('pick',[])[:3]:
        p=x.get('p','').strip().upper()
        if re.match(r'P\d\d',p): P[p]+=1; why[p].append(x.get('why',''))
    o=d.get('oppose') or {}
    if o.get('p'): O[o['p'].strip().upper()]+=1; ow[o['p'].strip().upper()].append(o.get('why',''))
    for c in d.get('common',[])[:5]: C[c.strip()]+=1
print('낸 사람',n)
for p,c in sorted(P.items(),key=lambda kv:-(kv[1]-O.get(kv[0],0)))[:12]:
    print(p,'고름',c,'반대',O.get(p,0),'|',' / '.join(why[p][:2])[:200])
print('--- 반대')
for p,c in O.most_common(5): print(p,c,'|',' / '.join(ow[p][:2])[:160])
print('--- 공통')
for k,c in C.most_common(15): print(c,k)
