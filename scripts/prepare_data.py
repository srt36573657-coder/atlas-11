"""Normalize preserved, sourced prices. Never invent missing observations."""
from pathlib import Path
from collections import defaultdict, Counter
from datetime import date, timedelta
import json
ROOT=Path(__file__).resolve().parents[1]
raw=json.loads((ROOT/'engine/data/prices.json').read_text())
holidays={'2026-07-17':'제헌절','2026-08-17':'광복절 대체휴일','2026-09-24':'추석','2026-09-25':'추석','2026-10-05':'개천절 대체휴일','2026-10-09':'한글날'}
sessions=[];d=date(2026,7,14)
while d<=date(2026,10,30):
    if d.weekday()<5 and d.isoformat() not in holidays:sessions.append(d.isoformat())
    d+=timedelta(days=1)
grouped=defaultdict(list)
for row in raw['observations']:grouped[row['code'],row['date']].append(row)
overrides={('066570','2026-09-17'):{'close':197900,'url':'https://kr.investing.com/equities/lg-electronics-inc-historical-data','retrievedAt':'2026-09-24','reason':'한국어 원문 재조회 197900. StockAnalysis와 일치. 이전 INV 검색 결과 198900을 정정 기록으로 보존.'}}
review_path=ROOT/'engine/research/reconciled_naver.json'
review=json.loads(review_path.read_text()) if review_path.exists() else []
for r in review:
    if r.get('status')=='reconciled':overrides[r['code'],r['date']]=r
review_by={(r['code'],r.get('date')):r for r in review}
audit=[];assets=[]
for u in raw['universe']:
    prices=[]
    for day in sessions:
        if day>'2026-09-23':continue
        obs=grouped.get((u['codeF'],day),[])
        known=[(o,float(o['close'])) for o in obs if o.get('close') is not None]
        values={v for o,v in known};status='missing';close=None
        if (u['codeF'],day) in overrides:
            ov=overrides[u['codeF'],day];close=ov['close'];status='reconciled';audit.append({'code':u['codeF'],'date':day,**ov})
        elif any(o.get('unresolvedProvider') for o in obs):status='conflict'
        elif len(values)==1:close=next(iter(values));status='compared' if len({o['provider'] for o,v in known})>1 else 'single_source'
        elif len(values)>1:status='conflict'
        sources=[{'provider':o['provider'],'url':o['url'],'retrievedAt':o['retrievedAt'],'observedClose':o.get('close')} for o in obs]
        reviewed=review_by.get((u['codeF'],day))
        if reviewed and reviewed.get('naverClose') is not None:sources.append({'provider':'NAVER','url':reviewed['url'],'retrievedAt':reviewed['retrievedAt'],'observedClose':reviewed['naverClose']})
        prices.append({'date':day,'close':close,'quality':status,'sources':sources})
    assets.append({'id':u['id'],'sector':u['sector'],'name':u['nameF'],'code':u['codeF'],'leaderStatus':'사용자 지정 후보 · 당시 시총 1위 미검증','prices':prices})
events=json.loads((ROOT/'engine/data/events.json').read_text()).get('candidates',[])
output={'schema':2,'origin':'2026-09-17','end':'2026-10-30','actualAsOf':'2026-09-23','retrievedAt':'2026-09-24','informationPolicy':'historical_reconstruction','calendar':{'sessions':sessions,'holidays':holidays,'status':'KRX 휴장 원칙·증권사 2026 휴장 공지 대조','sources':['https://global.krx.co.kr/contents/GLB/06/0602/0602010201/GLB0602010201T1.jsp','https://corp.tossinvest.com/en/post?category=52&id=21740&type=notice','https://www.kasa.go.kr/prog/bbsArticle/BBSMSTR_000000000010/view.do?bbsId=BBSMSTR_000000000010&nttId=B000000001860Pe2zT3']},'assets':assets,'events':events,'corrections':audit,'inputs':{'price':'사용','volume':'미확보','flow':'미확보','psychology':'미확보','news':'일정 후보만 · 수익 영향 미반영'},'provenance':'기존 수집 원자료를 재사용. 현재 제공사 이력을 이용한 사후 재구성이며 당시 저장된 예측 실적이 아님. 기업행사 당시 조정 이력·대표 종목 시총 순위는 독립 검증되지 않음.'}
(ROOT/'public/data/input.json').write_text(json.dumps(output,ensure_ascii=False,separators=(',',':')))
print(json.dumps({'assets':len(assets),'forecast_sessions':len([d for d in sessions if d>output['origin']]),'price_quality':dict(Counter(p['quality'] for a in assets for p in a['prices'])),'anchor_missing':[a['code'] for a in assets if not next((p['close'] for p in a['prices'] if p['date']==output['origin']),None)]},ensure_ascii=False))
