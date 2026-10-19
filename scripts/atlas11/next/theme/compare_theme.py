import json,sys
# 쓰는 법: python3 -I scripts/atlas11/next/theme/compare_theme.py <따로 센 결과.json> [<site 폴더>] — 끝 코드 0 = 어긋남 0
ref=json.load(open(sys.argv[1]))
SITE=sys.argv[2] if len(sys.argv)>2 else 'site'
th=json.load(open(SITE+'/next/data/theme.json')); mo=json.load(open(SITE+'/next/data/theme-more.json'))
bad=[]; ZN={'B':'꽃','W':'시듦','S':'싹','Q':'잠잠'}
def eq(a,b,tol=0.0051):
  if a is None or b is None: return a is None and b is None
  return abs(float(a)-float(b))<=tol
mine={i['n']:i for i in th['inds']}
if ref['T']!=th['asOf']: bad.append(('T',ref['T'],th['asOf']))
if set(ref['industries'])!=set(mine): bad.append(('industry set',len(ref['industries']),len(mine)))
cnt=0
for n,r in ref['industries'].items():
  m=mine.get(n); mm=mo['inds'].get(n)
  if not m: continue
  cnt+=1
  chk=[('n',r['n'],m['k'],0),('zone',r['zone'],ZN[m['z']],None),('x',r['x'],m['x'],1),('y',r['y'],m['y'],1),('days',r['days'],m['d'],0),
       ('score',r['score'],m['sc'],0),('dots',[bool(v) for v in r['dots']],[bool(v) for v in m['dots']],None),
       ('sp',r['spread']['series'],m['sp'],None),('now',r['spread']['now'],m['up'],0),('before',r['spread']['before'],m['sp5'],0),('peak',r['spread']['peak'],m['peak'],0),('tot',r['spread']['tot'],m['tot'],0),
       ('bigAvg',r['big']['avg'],m['bigAvg'],1),('bigCodes',r['big']['codes'],[b['c'] for b in mm['big']],None),
       ('top8codes',[c for c,_ in r['top8']],[t['c'] for t in mm['top']],None)]
  for k,a,b,mode in chk:
    if mode==1: ok=eq(a,b)
    elif mode==0: ok=(a==b)
    else: ok=(a==b)
    if not ok: bad.append((n,k,a,b))
  for j,(p,q) in enumerate(zip(r['tail'],m['t'])):
    if not (eq(p[0],q[0]) and eq(p[1],q[1])): bad.append((n,'tail',j,p,q))
  if 'bigD10' in r:
    mine_b=[b['d10'] for b in mm['big']]
    if len(r['bigD10'])!=len(mine_b) or any(not ((x is None and y is None) or (x is not None and y is not None and eq(x,y))) for x,y in zip(r['bigD10'],mine_b)): bad.append((n,'bigD10',r['bigD10'],mine_b))
  if len(r['top8'])!=len(mm['top']): bad.append((n,'top8 len',len(r['top8']),len(mm['top'])))
  for (c,d),t in zip(r['top8'],mm['top']):
    if not eq(d,t['d10']): bad.append((n,'top8 d10',c,d,t['d10']))
if ref['sproutOrder']!=th['order']['S']: bad.append(('sproutOrder',ref['sproutOrder'][:5],th['order']['S'][:5]))
R=ref['record']; M=th['record']
for k in ['all','sprout','real']:
  if R[k]['n']!=M[k]['n'] or not eq(R[k]['p'],M[k]['p'],0.05): bad.append(('record',k,R[k],M[k]))
for d in range(5):
  a=R['byDots'][str(d)]; b=M['byDots'][d]
  if a['n']!=b['n'] or not eq(a['p'],b['p'],0.05): bad.append(('byDots',d,a,b))
for k in ['all','real']:
  if any(not eq(x,y,0.05) for x,y in zip(R['halves'][k],M[k]['h'])): bad.append(('halves',k,R['halves'][k],M[k]['h']))
print('industries compared',cnt,'mismatches',len(bad))
for b in bad[:30]: print(b)
sys.exit(1 if bad else 0)
