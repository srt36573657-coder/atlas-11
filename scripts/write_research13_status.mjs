import fs from 'node:fs';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {completionGate,validateState} from './ATLAS_Research_13.mjs';
const read=p=>JSON.parse(fs.readFileSync(p));
const write=(p,d)=>fs.writeFileSync(p,typeof d==='string'?d:JSON.stringify(d,null,2));
const hash=v=>createHash('sha256').update(typeof v==='string'||Buffer.isBuffer(v)?v:JSON.stringify(v)).digest('hex');
const b=read('public/data/atlas.json'),state=validateState(read('reports/research-13-state.json'));
const gate=completionGate(state,b),events=read('reports/research-13/root-reviewed-events.json');
assert.ok(gate.errors.every(e=>e.endsWith(':UNRESOLVED')),'Reviewed event installation failed');
const names=Object.fromEntries(b.candidate.assets.map(a=>[a.code,a.name]));
const explanations={
 '034730':'회사채 9/29 수요예측·10/7 발행 후보는 보도에서 확인했으나 공식 증권신고서 본문에 접근하지 못해 유보.',
 '005490':'현재 읽을 수 있는 회사·공시 자료에서 기간 내 신규 확정일 미확보. 민간 실적 예상일은 서로 다르고 회사 확인이 아님.',
 '010130':'회사채 발행 보도의 날짜가 상충하며 발행사·주관사 공식 신고서 본문 미확보. 취소·변경된 자회사 지급일도 제외.',
 '138040':'공식 IR 동적 목록의 최신 공지는 8/12 실적 발표. 확인한 공개 목록에는 기간 내 후속 확정일이 아직 없음.',
 '047050':'10/28~29 산업 행사 날짜는 확인했으나 포스코인터내셔널의 지원·참여 역할을 명시한 공식 원문을 읽지 못해 유보.',
 '029780':'과거 공시에서 10월 채권 만기를 찾았지만 최신 잔액·조기상환 여부를 확인하지 못해 사건으로 추가하지 않음. 올해 실적 발표일도 미확보.',
 '030000':'공식 IR의 예정 일정이 비어 있고 최신 자료는 2분기. 민간 예상일과 광고제 심사 참여를 가격 사건으로 대체하지 않음.'
};
const verified=events.map(e=>({code:e.code,name:names[e.code],eventId:e.id,title:e.title,eventDate:e.eventDate,targetDate:e.targetDate,
 sourceUrl:e.sourceUrl,scope:e.throughSubsidiary?'subsidiary_business':'company',priceImpact:'ABSTAIN',trustProbability:null}));
const unresolved=gate.unresolved.map(code=>({code,name:names[code],state:state.rows[code].state,
 reason:explanations[code],nextAction:state.rows[code].attempts.at(-1).nextAction,
 nextEligibleCheckAt:state.rows[code].nextCheckAt,attempts:state.rows[code].attempts.length}));
const status={checkedAt:new Date().toISOString(),status:gate.status,taskComplete:false,required:13,verified:verified.length,
 remaining:unresolved.length,releaseId:b.input.newsResearch.releaseId,candidateId:b.candidate.id,closeDate:b.candidate.origin,
 fixedWindow:state.window,trackerRevision:state.revision,trackerSHA256:hash(state),verifiedEvents:verified,unresolved,
 researchIntegrated:gate.researchIntegrated,verifiedEventInstallationPassed:true,errors:gate.errors,
 coveredStocks:b.input.newsResearch.assets.filter(r=>r.byScope.company+r.byScope.sector>0).length,
 companyRelatedStocks:b.input.newsResearch.assets.filter(r=>r.byScope.company>0).length,
 limitations:['일정 확인은 가격 촉매·적중 확률 검증이 아니다. 신규 6건 모두 가격 영향 유보.',
 'KCC는 본사 IR가 아니라 간접 완전자회사 모멘티브 행사이다.',
 'KT&G는 계약 개시 반영일과 미국 고용 발표일이 10/6으로 겹쳐 기존 v6 결합 근거 유보 규칙이 두 사건 모두에 적용됐다. KT&G 모의 분포만 달라지고 무관한 51종목은 동일하다. 상승률을 새로 가정한 변화가 아니다.',
 '이번 실행은 뉴스 조사 갱신이며 9/23 보관 종가를 사용했다. 신규 종가 수집 완료로 표시하지 않는다.',
 '추적 코드는 검색 에이전트를 스스로 실행하지 않는다. 기존 정기 실행이 저장 상태를 읽어 후속 조사를 수행한다.',
 '재조사 가능 시각은 다음 실제 실행 시각을 보장하지 않는다. 미공개 일정·접근 제한은 해결된 것으로 세지 않는다.']};
const md=`# 13종목 조사 실행 결과\n\n${status.checkedAt}\n\n확인 ${status.verified}/13종목 · 미확보 ${status.remaining}종목 · **전체 완료 아님**.\n\n4개 조사팀의 원문 조사 뒤 별도 검토를 통과한 6건을 ATLAS에 설치했습니다. 52종목 중 기업·업종 일정이 연결된 종목은 ${status.coveredStocks}개입니다. 기업 관련 일정이 있는 종목은 ${status.companyRelatedStocks}개이며 KCC의 자회사 행사를 포함합니다.\n\n| 종목 | 확인한 일정 | 행사일 | 한국 거래일 연결 | 원문 |\n|---|---|---|---|---|\n${verified.map(e=>`| ${e.name} (${e.code}) | ${e.title} | ${e.eventDate} | ${e.targetDate} | [확인 자료](${e.sourceUrl}) |`).join('\n')}\n\n모두 비교 가능한 과거 표본이 부족해 가격 영향은 유보합니다. 행사일과 실제 발표 결과·주가 반응은 다릅니다. 삼성물산 팝업·KT&G 분양 계약 접수·전시 참가를 실적 발표로 바꾸지 않습니다.\n\n| 남은 종목 | 확인한 한계 |\n|---|---|\n${unresolved.map(e=>`| ${e.name} (${e.code}) | ${e.reason} |`).join('\n')}\n\n## 기록과 재개\n\n추적 상태는 reports/research-13-state.json, 검토 근거는 reports/research-13/, 설치 결과는 reports/research-13/integration-check.json에 있습니다. 모든 이전 시도와 실패를 유지했습니다. RUNBOOK의 plan → 조사 → record → check 순서로 이어갑니다. 13종목 모두 검증되기 전 check/finalize는 종료 코드 2와 PENDING을 반환합니다.\n\n${status.limitations.map(v=>'- '+v).join('\n')}\n`;
for(const dir of ['reports','public/downloads']){write(`${dir}/RESEARCH_13_STATUS.json`,status);write(`${dir}/RESEARCH_13_STATUS.md`,md);}
fs.copyFileSync('reports/research-13-state.json','public/downloads/research-13-state.json');
fs.copyFileSync('scripts/ATLAS_Research_13.mjs','public/downloads/ATLAS_Research_13.mjs');
for(const kind of ['finance','industrial','consumer','smallcap']){
 const file=`research13-${kind}`,r=read(`reports/${file}.json`);
 const sections=r.assets.map(a=>{
  const row=state.rows[a.code],e=verified.find(v=>v.code===a.code),urls=[...new Set([...(a.checkedUrls??[]),...(a.sources??[]).map(s=>s.url),...(events.find(v=>v.code===a.code)?.sources??[]).map(s=>s.url)].filter(Boolean))];
  return `## ${names[a.code]} (${a.code})\n\n최종 추적 상태: ${row.state}. ${e?`${e.title}, ${e.eventDate} → ${e.targetDate}. 가격 영향 유보.`:explanations[a.code]}\n\n${urls.map(u=>`- [조사 자료](${u})`).join('\n')}\n\n원 보고서의 후보·검토 대기 표시는 당시 조사팀 상태를 보존한 것입니다. 최종 별도 검토 결과는 추적 상태와 RESEARCH_13_STATUS.json을 따릅니다.\n`;
 }).join('\n');
 const text=`# ${kind} 조사팀 원문 대조 기록\n\n${sections}\n상세 시도·실패·시각·출처는 동명의 JSON에 보존했습니다. 조사 경로 자체는 사건 근거가 아닙니다.\n`;
 write(`reports/${file}.md`,text);write(`public/downloads/${file}.md`,text);
 fs.copyFileSync(`reports/${file}.json`,`public/downloads/${file}.json`);
}
const before=read('reports/preservation-research13-before.json'),versions=new Map([b.original,...b.priorVersions,b.candidate].map(v=>[v.id,v]));
assert.equal(hash(b.original),before.original);
for(const [id,digest]of Object.entries(before.versions))assert.equal(hash(versions.get(id)),digest,`Prior version changed: ${id}`);
for(const key of ['evaluation','actions','collectionLogs'])assert.equal(hash(b[key]),before[key],`Prior ${key} changed`);
assert.deepEqual(b.updates.slice(0,before.updates.length),before.updates);
for(const [p,digest]of Object.entries(before.files))assert.equal(hash(fs.readFileSync(p)),digest,`Preserved file changed: ${p}`);
write('reports/preservation-research13-after.json',{verifiedAt:new Date().toISOString(),status:'PASS',originalSHA256:hash(b.original),
 previousVersionsPreserved:Object.keys(before.versions).length,evaluationPreserved:true,collectionLogsPreserved:true,actionsPreserved:true,
 updateHistoryPreserved:true,filesPreserved:Object.keys(before.files),newVersion:b.candidate.id});
console.log({verified:status.verified,remaining:status.remaining,installed:verified.length,taskComplete:false,preservation:'PASS'});
