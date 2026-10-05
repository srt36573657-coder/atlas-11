#!/usr/bin/env python3
"""Normalize the downloaded World Bank workbook without fabricating publication vintages."""
import datetime, hashlib, json, pathlib, re
import openpyxl

ROOT=pathlib.Path(__file__).resolve().parents[1]
OUT=ROOT/'reports/completion'
RAW=OUT/'raw-company/worldbank-monthly.xlsx'
SOURCE='https://thedocs.worldbank.org/en/doc/74e8be41ceb20fa0da750cda2f6b9e4e-0050012026/related/CMO-Historical-Data-Monthly.xlsx'

def normalize():
    wb=openpyxl.load_workbook(RAW,read_only=True,data_only=True)
    rows=list(wb['Monthly Prices'].values)
    assert rows[0][0]=='World Bank Commodity Price Data (The Pink Sheet)'
    names,units=rows[4],rows[5]
    descriptions=[' '.join(str(v) for v in row if v is not None) for row in wb['Description'].values]
    observed=datetime.datetime.fromtimestamp(RAW.stat().st_mtime,datetime.timezone.utc).isoformat().replace('+00:00','Z')
    digest=hashlib.sha256(RAW.read_bytes()).hexdigest()
    series=[]
    for column,name in enumerate(names):
        if not name:continue
        values=[];seen=set()
        for row in rows[6:]:
            if not isinstance(row[0],str) or not re.fullmatch(r'\d{4}M\d{2}',row[0]):continue
            period=row[0].replace('M','-')
            if period in seen:raise ValueError('duplicate month: '+period)
            seen.add(period)
            value=row[column]
            if isinstance(value,bool):raise ValueError('boolean commodity value')
            valid=isinstance(value,(int,float))
            values.append({'period':period,'value':float(value) if valid else None,'sourceMissing':not valid})
        series.append({'id':'WB:'+re.sub('[^a-z0-9]+','-',name.lower()).strip('-'),'name':name.strip(),'unit':units[column],'frequency':'monthly','values':values,'observations':sum(v['value'] is not None for v in values),'missing':sum(v['value'] is None for v in values)})
    out={'schema':'atlas-commodity-source-history-1','factorId':'F33','sourceUrl':SOURCE,'publisher':'World Bank','sourceBodyRead':True,'rawHash':digest,'hashKind':'original_downloaded_xlsx_bytes','rawPath':str(RAW.relative_to(ROOT)),'observedAt':observed,'sourcePublicationDate':'2026-09-02','publishedAt':None,'pointInTimeVerified':False,'vintageId':'worldbank-20260902-observed-'+observed,'historyStart':min(v['period'] for s in series for v in s['values']),'historyEnd':max(v['period'] for s in series for v in s['values']),'seriesCount':len(series),'observationCount':sum(s['observations'] for s in series),'missingCount':sum(s['missing'] for s in series),'series':series,'descriptions':descriptions,'license':{'basis':'World Bank default CC BY 4.0 dataset terms; preserve named third-party provider conditions','url':'https://www.worldbank.org/ext/en/legal/terms-conditions/datasets','attribution':'The World Bank: Commodity Price Data (The Pink Sheet); original data providers listed in the Description sheet.'},'notes':['최신 빈티지의 과거 월별 자료. 과거 각 시점 원본/공개 시각 확보로 간주하지 않는다.','기업별 원가·제품 판매 노출, 헤지, 계약 반영 지연은 미확보. 52종목 전체에 일괄 충격을 더하지 않는다.','누락 기호 …/... 및 빈 셀은 null. 0으로 치환하지 않는다.','Workbook의 Mismatch Details 보조 시트는 가격 관측으로 사용하지 않으며 원본 그대로 보존한다.','일부 시리즈 정의/출처/추정치와 과거 정정 설명을 보존한다. LNG 일본은 최근 두 달 추정치라는 주석이 있다.'],'modelRecords':[],'eligibleStockCodes':[]}
    (OUT/'company-commodity-history.json').write_text(json.dumps(out,ensure_ascii=False,indent=2)+'\n')
    print(json.dumps({k:out[k] for k in ['seriesCount','observationCount','missingCount','historyStart','historyEnd','rawHash']},ensure_ascii=False))

if __name__=='__main__':normalize()
