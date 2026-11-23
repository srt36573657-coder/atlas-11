import json,random,statistics as st
r=json.load(open('fall36-raw.json'));s=json.load(open('fall36.json'))
pool=r['pool'];mm=[]
def stats(v):
    n=len(v)
    return dict(rose=n,mean=sum(v)/n if n else 0,median=st.median(v) if n else 0,p5=sum(x>=5 for x in v)/n if n else 0,p21=sum(x==21 for x in v)/n if n else 0,max=max(v) if v else 0)
per={}
for g in sorted(r['runs']):
    v=[x[1] for x in r['runs'][g]];a=stats(v);k=s['kinds'][g]
    for f in['rose','mean','median','p5','max']:
        if f not in k:
            if a["rose"]: mm.append((g,f,"missing in summary"))
        elif abs(a[f]-k[f])>(0 if f in('rose','max') else 1e-6):mm.append((g,f,a[f],k[f]))
    per[g]=a
allv=[x for d in pool for x in pool[d]]
ra=stats(allv);rs=s['random']
for f in['mean','median']:
    if abs(ra[f]-rs[f])>1e-6:mm.append(('random',f,ra[f],rs[f]))
rng=random.Random(777);N=5000
for g in sorted(r['runs']):
    runs=[(d,x) for d,x in r['runs'][g] if d in pool]
    a=per[g]
    if not runs:
        a.update(beat_mean=None,beat_median=None,p05=None,p95=None,cls='not counted (no picks)' if a['rose']==0 else 'too few');continue
    ds=[d for d,_ in runs];v=[x for _,x in runs]
    sm=st.mean(v);smed=st.median(v);bm=bd=0;means=[]
    for _ in range(N):
        d=[rng.choice(pool[x]) for x in ds];m=sum(d)/len(d);means.append(m)
        bm+=sm>m;bd+=smed>st.median(d)
    means.sort();a.update(beat_mean=bm/N,beat_median=bd/N,p05=means[int(.05*N)],p95=means[int(.95*N)],kept=len(ds))
    if 'mc' in s['kinds'][g] and abs(a['beat_mean']-s['kinds'][g]['mc']['beat'])>0.02:mm.append((g,'beat',a['beat_mean'],s['kinds'][g]['mc']['beat']))
    b=a['beat_mean']
    a['cls']='not counted (no picks)' if a['rose']==0 else 'too few' if a['rose']<20 else 'longer than chance' if b>=.95 else 'shorter than chance' if b<=.05 else 'like chance'
out=dict(mismatches=mm,random={k:ra[k] for k in['mean','median','p5','p21']},per={g:{k:(round(v,4) if isinstance(v,float) else v) for k,v in a.items() if k in('rose','median','mean','p5','p21','beat_mean','beat_median','cls','kept')} for g,a in per.items()})
print(json.dumps(out,ensure_ascii=False))
