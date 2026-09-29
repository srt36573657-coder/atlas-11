import fs from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {collectCompletionFomo,currentFomoAudit} from '../lib/completion-fomo.mjs';
const hash=x=>createHash('sha256').update(x).digest('hex');
const input=JSON.parse(await fs.readFile('public/data/atlas.json')).input,now=new Date(),at=now.toISOString();
const dir='reports/completion/raw-fomo',runDir='reports/completion/fomo-runs/'+at.replace(/[:.]/g,'-');await fs.mkdir(dir,{recursive:true});await fs.mkdir(runDir,{recursive:true});
const noNetwork=process.argv.includes('--existing'),configPath=process.argv.find(x=>x.startsWith('--config='))?.slice(9)??process.env.ATLAS_COLLECTION_CONFIG,config=configPath?JSON.parse(await fs.readFile(configPath)):{};
const report=noNetwork?{...currentFomoAudit(input,{now}),priceObservations:[],searchRecords:[],rawSnapshots:[],priceSuccessCount:0,networkAttempted:false,exitCode:2}:await collectCompletionFomo(input,{now,naverId:process.env.NAVER_CLIENT_ID,naverSecret:process.env.NAVER_CLIENT_SECRET,krxKey:process.env.KRX_API_KEY,krxServices:config.krxServices??[],maxKrxRequests:config.maxKrxRequests??12,onSnapshot:async s=>{const h=s.metadata.contentSha256;await fs.writeFile(dir+'/'+h+'.bin',s.body);await fs.writeFile(dir+'/'+h+'.json',JSON.stringify({source:s.source,metadata:s.metadata},null,2));}});
// Reuse verified saved observations with their original observation times; failed collection must not erase them.
let lastNormal=null;try{lastNormal=JSON.parse(await fs.readFile('reports/completion/fomo-latest.json','utf8'));}catch(e){if(e.code!=='ENOENT')throw e;}
let retained=null;try{retained=JSON.parse(await fs.readFile('reports/completion/fomo-price-proposals.json','utf8'));}catch(e){if(e.code!=='ENOENT')throw e;}
const fetched=report.priceObservations??[],selected=new Map();
for(const o of [...(retained?.priceObservations??[]),...(lastNormal?.priceObservations??[]),...fetched]){const key=o.code+':'+o.rows.map(r=>r.date).join(',');selected.set(key,o);}
const priorAudit=currentFomoAudit(input,{observations:[...selected.values()],records:report.searchRecords??[],now:new Date()});
Object.assign(report,priorAudit,{priceObservations:[...selected.values()],reusedEvidenceStocks:new Set([...(retained?.priceObservations??[]),...(lastNormal?.priceObservations??[])].map(o=>o.code)).size,runtimePriceSuccessCount:report.priceSuccessCount??0,priceSuccessCount:new Set([...selected.values()].filter(o=>o.rows.some(r=>r.date===priorAudit.cutoffDate)).map(o=>o.code)).size});
const observations=[];
for(const file of (await fs.readdir(dir)).filter(f=>/^web-price-\d+\.json$/.test(f))){
 const raw=await fs.readFile(dir+'/'+file),saved=JSON.parse(raw),text=saved.result.content.filter(c=>c.type==='text').map(c=>c.text).join('\n'),blocks=text.split(/\n-{20,}\n/);
 for(const a of saved.assets){const url=`https://m.stock.naver.com/domestic/stock/${a.code}/price`,block=blocks.find(b=>b.includes(url));const failed=!block||/Internal Error|Failed to fetch|not accessible/.test(block),identity=block?.includes('종목코드 '+a.code)??false;
  observations.push({code:a.code,name:a.name,sourceUrl:url,observedAt:saved.observedAt,rawHash:hash(raw),snapshotPath:dir+'/'+file,snapshotKind:'web_extracted_text_not_origin_html',bodyRead:!failed,identityVerified:identity,historyRows:0,finalCloseAccepted:false,status:failed?'source_unavailable':identity?'quote_page_without_historical_rows':'shell_or_unverified_identity',reason:failed?'web_fetch_failed':/로딩중/.test(block)?'daily_history_dynamic_loading; intraday_or_aftermarket_quote_not_final_close':'no_verified_daily_OHLCV_table',citationRef:block?.match(/【(turn\w+(?:view|search)\d+)】/)?.[1]??null});
 }
}
report.publicPageChecks=observations;
report.publicPageSummary={attempted:observations.length,bodyRead:observations.filter(x=>x.bodyRead).length,identityVerified:observations.filter(x=>x.identityVerified).length,historyAcquired:0};
report.requiredActions=[{item:'검색 관심 이력',action:'NAVER 개발자센터 애플리케이션의 데이터랩(검색어트렌드)을 활성화하고 서버 환경변수 NAVER_CLIENT_ID/NAVER_CLIENT_SECRET 설정',url:'https://developers.naver.com/docs/serviceapi/datalab/search/search.md'},{item:'공식 OHLCV·거래대금 이력',action:'KRX OPEN API 인증키 및 유가증권/코스닥 일별매매정보 서비스 승인 후 KRX_API_KEY와 승인 명세 endpoint/start 설정',url:'https://openapi.krx.co.kr/contents/OPP/INFO/OPPINFO003.jsp'},{item:'기업별 개인 거래대금',action:'개별 종목의 개인 매수·매도·순매수 금액을 포함한 공식 원자료 또는 사용권 있는 데이터 공급자 연결; 기관합계/NPS 합계로 대체하지 않음'}];
report.probabilityValidation='FOMO 점수와 가격 예측 기여는 별개; 관측 점수만으로 상승 가산 안 함';
await fs.writeFile(runDir+'/report.json',JSON.stringify(report,null,2));await fs.writeFile('reports/completion/fomo-latest.json',JSON.stringify(report,null,2));
console.log(JSON.stringify({at,cutoffDate:report.cutoffDate,priceSuccessCount:report.priceSuccessCount,fullFomoCount:report.fullFomoCount,partialPriceHeatCount:report.partialPriceHeatCount,publicPageSummary:report.publicPageSummary,exitCode:report.exitCode}));process.exitCode=report.exitCode;
