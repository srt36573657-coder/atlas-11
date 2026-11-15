import json, re, ast
R='/home/claude/atlas-11/'
d=json.load(open(R+'dist/su/data/su21.json'))
src=open(R+'scripts/atlas11/next/su21_s36.py',encoding='utf-8').read()
m=re.search(r'DEF = (\[.*?\n\])', src, re.S)
DEF=ast.literal_eval(m.group(1))
KINDS=['g%02d'%i for i in range(1,37)]
han={k:x[0] for k,x in zip(KINDS,DEF)}
easy={k:x[1] for k,x in zip(KINDS,DEF)}
mean={k:x[2] for k,x in zip(KINDS,DEF)}
say={k:x[3] for k,x in zip(KINDS,DEF)}
NUM=['영','한','두','세','네','다섯','여섯','일곱','여덟','아홉','열']
s=d['sun']
order=['rise','narrow','calm','shake','fall']
lands=[{'key':k,'name':s['lands'][k]['name'],'rule':s['lands'][k]['rule'],'days500':s['hist']['cnt'][k],'today':k==s['land']} for k in order]
rank=[];r=0;todo=[]
for e in s['rank']:
    k=e['k']
    if e['n']>0:
        r+=1
        t=round(e['lose']/e['n']*10)
        rank.append({'rank':r,'k':k,'easy':easy[k],'old':han[k],'say':say[k],'n':e['n'],'lose':e['lose'],'tenths':t,'line':f"열 번에 {NUM[t]} 번 잃었어요"})
    else:
        todo.append({'k':k,'easy':easy[k],'old':han[k],'say':say[k],'line':'아직 못 셈'})
def v100(ch): return round(100+ch,1)
def fmt(v):
    s=('%.1f'%v)
    return s
L=d['lists']
def item(x,withc=True):
    o={'name':x['name'],'ind':x.get('ind'),'ch20':x.get('ch20'),'v100':fmt(v100(x['ch20'])) if x.get('ch20') is not None else None,
       'down':(x.get('ch20') is not None and x['ch20']<0),'days':x.get('days'),'in':x.get('in',[])}
    if withc and x.get('c'): o['c']=x['c']
    return o
P=d['past']
out={
 'brand':'손자병법',
 'asOf':d['asOf']['board'],'asOfSay':'11월 6일 자료',
 'sun':{'land':s['land'],'name':s['name'],'quote':s['quote'],'do':s['do'],'lands':lands,'path20':s['path'],
        'pathNote':'지난 스무 날의 땅 · 왼쪽이 옛날 · 오른쪽 끝이 오늘','histDays':s['hist']['days'],'rankQuote':s['rankQ']['quote'],
        'market':{'n':s['m']['n'],'up':s['m']['up'],'say':'365곳 가운데 한 달 전보다 오른 곳 '+str(s['m']['up'])+'곳'}},
 'rest':{'easy':'쉬어 가기','line':'안 사면 100원은 100원 · 잃은 번 0'},
 'rank':rank,'notYet':todo,
 'groups':[
   {'key':'hot','name':'불장','what':'한 달 동안 크게 오른 업종 안의 회사','items':[item(x) for x in L['hot']]},
   {'key':'bloom','name':'꽃이 될','what':'아직 덜 오른 싹 가운데 몸집이 큰 회사','items':[item(x) for x in L['bloom']]},
   {'key':'money','name':'돈이 몰리는','what':'한 달 동안 시장보다 더 오른 업종의 회사','items':[item(x) for x in L['money']]}],
 'next':[
   {'key':'hotNext','name':'불장이 될 듯','what':P['what']['hotNext'],'per100':P['hotNext']['per100'],'base100':P['hotNext']['base100'],'items':[item(x,False) for x in L['hotNext']]},
   {'key':'bloomNext','name':'꽃이 될 듯','what':P['what']['bloomNext'],'per100':P['bloomNext']['per100'],'base100':P['bloomNext']['base100'],'items':[item(x,False) for x in L['bloomNext']]},
   {'key':'moneyNext','name':'돈이 몰릴 듯','what':P['what']['moneyNext'],'per100':P['moneyNext']['per100'],'base100':P['moneyNext']['base100'],'items':[item(x,False) for x in L['moneyNext']]}],
 'nextNote':'예언이 아니에요 · 지난 1년 실제로 그렇게 된 횟수를 함께 봐요',
 'overlap':[{'name':x['name'],'in':x['in']} for x in d.get('overlap',[])],
 'quiet':[item(x) for x in L.get('quiet',[])],
}
S36=json.load(open(R+'dist/su/data/su21-s36.json'))['lists']
for e in out['rank']+out['notYet']:
    e['picks']=[x['name'] for x in S36.get(e['k'],[])]
json.dump(out,open('samples/data.json','w'),ensure_ascii=False,indent=1)
print('rank',len(rank),'notYet',len(todo))
for e in rank[:8]: print(e['rank'],e['easy'],e['lose'],'/',e['n'],e['line'])
print([t['easy'] for t in todo])
for g in out['groups']:
    print(g['name'],[(i['name'],i['v100'],i['days']) for i in g['items']])
for g in out['next']:
    print(g['name'],g['per100'],g['base100'],[(i['name'],i['v100'],i['days']) for i in g['items']])
print(out['overlap'])
print(out['sun']['path20'])
