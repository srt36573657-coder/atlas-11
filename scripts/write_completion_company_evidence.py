#!/usr/bin/env python3
"""Reviewed primary-source facts, deliberately separate from forecast feature records."""
import datetime,hashlib,json,pathlib
ROOT=pathlib.Path(__file__).resolve().parents[1];OUT=ROOT/'reports/completion';RAW=OUT/'raw-company'

def read(name):return json.loads((OUT/name).read_text())
fetch=read('company-reviewed-source-fetch.json')['results']
sources=[];facts=[]
def source(url,bodyfile,date):
    content=json.loads((RAW/bodyfile).read_text());text='\n'.join(c.get('text','') for c in content['result']['content'])
    blocks=text.split('\n\n--------------------------------------------------------------------------------\n')
    block=next(b for b in blocks if url in b and 'Source: open' in b and 'Total lines:' in b and 'Internal Error' not in b)
    raw=next((r for r in fetch if r['url']==url and r['status']=='body_downloaded_unreviewed'),None)
    if raw:digest=raw['rawHash'];file=raw['rawPath'];observed=raw['observedAt'];kind='original_http_response_bytes'
    else:
        snapshot=block+'\n';digest=hashlib.sha256(snapshot.encode()).hexdigest();file='reports/completion/raw-company/'+digest+'.extracted.txt';(ROOT/file).write_text(snapshot);observed=content['collectedAt'];kind='web_tool_extracted_source_body_not_original_http_bytes'
    meta={'sourceId':'company:'+str(len(sources)+1),'sourceUrl':url,'sourceBodyRead':True,'rawHash':digest,'rawPath':file,'hashKind':kind,'observedAt':observed,'sourcePublicationDate':date,'publishedAt':None,'pointInTimeVerified':False,'publisherRole':'company','sourceVintage':'current_retrieval_not_historical_snapshot'}
    sources.append(meta);return meta
def add(s,code,period,metric,value,unit,factors,kind='actual',**extra):
    facts.append({**s,'id':f'{code}:{period}:{metric}:{len(facts)}','code':code,'period':period,'metric':metric,'value':value,'unit':unit,'factorIds':factors,'kind':kind,'numericalModelEligible':False,'priceImpact':None,'blockers':['historical_point_in_time_vintage_not_verified','exact_publication_time_missing','training_history_or_comparable_event_sample_incomplete'],**extra})

s=source('https://news.samsung.com/global/samsung-electronics-announces-second-quarter-2026-results','companyBodies1.json','2026-07-30')
for m,v in [('revenue',171500),('operating_profit',89500)]:add(s,'005930','2026Q2',m,v,'KRW billion',['F26'])
add(s,'005930','2026Q2','earnings_per_share',10849,'KRW/share',['F27'],ttmVerified=False,shareAdjustmentVerified=False)
s=source('https://news.samsung.com/global/samsung-electronics-announces-first-quarter-2026-results','companyBodies1.json','2026-04-30')
for m,v in [('revenue',133900),('operating_profit',57200)]:add(s,'005930','2026Q1',m,v,'KRW billion',['F26'])
s=source('https://www.hyundai.com/content/hyundai/worldwide/en/newsroom/detail/0000001234.html','companyBodies1.json','2026-07-23')
for period,rev,op,net,vol in [('2026Q2',49215,2851,2888,991885),('2025Q2',48287,3602,3250,1065843)]:
    for m,v in [('revenue',rev),('operating_profit',op),('net_profit_including_noncontrolling',net)]:add(s,'005380',period,m,v,'KRW billion',['F26'],comparisonVintage='reported_on_2026-07-23')
    add(s,'005380',period,'wholesale_vehicle_sales',vol,'vehicles',['F31'],comparisonVintage='reported_on_2026-07-23')
for m,v,u in [('annual_revenue_growth_low',1,'percent'),('annual_revenue_growth_high',2,'percent'),('annual_operating_margin_low',6.3,'percent'),('annual_operating_margin_high',7.3,'percent'),('annual_wholesale_guidance',4160000,'vehicles')]:add(s,'005380','2026FY',m,v,u,['F25'],'guidance',revisionValue=None)
s=source('https://samsungsem.com/kr/newsroom/news/view.do?id=10461','companyBodies2.json','2026-07-30')
for m,v in [('revenue',34572),('operating_profit',4404)]:add(s,'009150','2026Q2',m,v,'KRW 100 million',['F26'])
s=source('https://inside.lgensol.com/2026/04/lg%EC%97%90%EB%84%88%EC%A7%80%EC%86%94%EB%A3%A8%EC%85%98-2026%EB%85%84-1%EB%B6%84%EA%B8%B0-%EC%8B%A4%EC%A0%81%EB%B0%9C%ED%91%9C-%EB%A7%A4%EC%B6%9C-6%EC%A1%B05550%EC%96%B5-%EC%9B%90-%EC%98%81%EC%97%85/','companyBodies2.json','2026-04-30')
for m,v in [('revenue',65550),('operating_profit',-2078),('north_american_production_subsidy',1898)]:add(s,'373220','2026Q1',m,v,'KRW 100 million',['F26'],accountingComparability='2026 presentation change requires original statements before comparing old quarters')
for period,date,filename,ending,rev,op,assets,equity,liabilities,orders in [
    ('2025Q4','2026-01-21','companyBodies2.json','fourth-quarter-and-fiscal-year-2025',12857,5283,110607,74511,36096,212),
    ('2026Q1','2026-04-22','companyBodies3.json','first-quarter-2026',12571,5808,119950,79228,40722,214),
    ('2026Q2','2026-07-23','companyBodies2.json','second-quarter-2026',13209,5864,126526,83619,42907,217)]:
    s=source('https://samsungbiologics.com/kr/media/company-news/samsung-biologics-reports-'+ending+'-financial-results',filename,date)
    for m,v in [('revenue',rev),('operating_profit',op)]:add(s,'207940',period,m,v,'KRW 100 million',['F26'])
    for m,v in [('assets',assets),('equity',equity),('liabilities',liabilities)]:add(s,'207940',period,m,v,'KRW 100 million',['F28'])
    add(s,'207940',period,'cumulative_orders_since_incorporation',orders,'USD 100 million',['F31'],quarterlyOrders=None)
    for m,v in [('annual_revenue_growth_low',15),('annual_revenue_growth_high',20)]:add(s,'207940','2026FY',m,v,'percent',['F25'],'guidance',revisionValue=None,scopeCaveat='2025Q4 and 2026Q1 guidance excludes Rockville; Q2 wording is upper-end outlook, scope comparability requires review')
s=source('https://kbfg.com/IR_new/2026_2/player/vod_kor.html','companyBodies2.json',None)
for m,v in [('CET1_ratio',13.74),('BIS_ratio',15.91)]:add(s,'105560','2026Q2',m,v,'percent',['F28'],financialStatementCompleteness='capital_ratio_component_only',provisional=True)
add(s,'105560','2026H2','announced_share_buyback_cancellation_budget',7000,'KRW 100 million',['F29'],'announcement',phaseId='board_announcement',executionAmount=None,cancellationAmount=None)

observations={'schema':'atlas-company-primary-observations-1','createdAt':datetime.datetime.now(datetime.timezone.utc).isoformat().replace('+00:00','Z'),'facts':facts,'sources':sources,'strictModelRecords':[],'notes':['실적 실제값과 서프라이즈는 다름. 발표 전 컨센서스 미확보이므로 F26 충격 미산출.','회사 가이던스 범위는 F25 원자료 구성요소다. 변경·철회·동일 범위와 비교 범위 검증 없이 전망 수정 충격으로 쓰지 않음.','현대차 2025Q2 비교 수치는 2026년 발표 본문에서 관측한 값이며 2025년 당시 원본으로 인증하지 않음.','KB금융 자사주 7000억원은 발표 단계이며 집행·소각 실적으로 바꾸지 않음.','과거 웹 추출 본문 해시는 HTTP 원문 바이트 해시와 구분해 기록.']}
(OUT/'company-observations.json').write_text(json.dumps(observations,ensure_ascii=False,indent=2)+'\n')
print(json.dumps({'facts':len(facts),'sources':len(sources),'companyCodes':sorted(set(f['code'] for f in facts))},ensure_ascii=False))
