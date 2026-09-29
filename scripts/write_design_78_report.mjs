import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {verifyFreshTests,verifyPrecision} from './verify_precision.mjs';
const root=new URL('../',import.meta.url),read=p=>fs.readFile(new URL(p,root),'utf8');
const hash=x=>createHash('sha256').update(x).digest('hex'),jh=x=>hash(JSON.stringify(x));
const before=JSON.parse(await read('reports/design-7.8/before/preservation.json'));
const old=JSON.parse(await read('reports/design-7.8/before/atlas.json'));
const bundle=JSON.parse(await read('public/data/atlas.json'));
const tests=verifyFreshTests(),precision=verifyPrecision();assert.equal(tests.passed,202);
assert.deepEqual(bundle.currentModelValidation.tests,{...old.currentModelValidation.tests,total:tests.passed,passed:tests.passed,sha256:tests.sha256});
const reverted=structuredClone(bundle);reverted.currentModelValidation.tests=old.currentModelValidation.tests;
assert.equal(jh(reverted),jh(old),'Only current test receipt may change');
for(const [file,expected] of Object.entries(before))if(file!=='public/data/atlas.json')assert.equal(hash(await fs.readFile(new URL(file,root))),expected,'Protected file changed: '+file);
const versions=new Map([bundle.original,...bundle.priorVersions,bundle.candidate].map(v=>[v.id,jh(v)]));
assert.deepEqual(Object.fromEntries(versions),Object.fromEntries([old.original,...old.priorVersions,old.candidate].map(v=>[v.id,jh(v)])));
const items=JSON.parse(await read('reports/design-7.8/improvements.json'));assert.equal(items.length,36);assert.equal(new Set(items.map(r=>r.id)).size,36);
for(const item of items)assert.ok((await read(item.file)).includes(item.marker),'Implementation location missing: '+item.id);
const result={appVersion:'7.8.0',libraryBaseVersion:24,checkedAt:new Date().toISOString(),designItems:36,tests,
 preservedForecasts:versions.size,originalSHA256:jh(bundle.original),candidateId:bundle.candidate.id,engineChanged:false,pricesChanged:false,newsAdded:0,
 protectedFiles:Object.keys(before).length,dataChanges:'currentModelValidation.tests receipt only',pixelBrowserVerified:false,
 allNewsComplete:false,remainingNewsCompanies:7,netlifyDeployed:false,precision};
const lines=['# ATLAS 7.8 — 디자인 개선 36개','',result.checkedAt,'',
 '52종목의 기존 전망을 더 쉽게 읽고 탐색하도록 화면을 다듬었습니다. “세계 최고”라는 객관적 인증을 받은 것이 아니라, 사용자의 높은 디자인 목표를 36개 구체적인 수정으로 구현한 버전입니다.','',
 '## 적용한 36개',''];
for(const group of [...new Set(items.map(i=>i.group))]){lines.push('### '+group,'');for(const i of items.filter(i=>i.group===group))lines.push(`${i.id}. **${i.title}** — ${i.change} 위치: \`${i.file}\`.`);lines.push('');}
lines.push('## 확인한 내용','',
 `전체 기능 검사 ${tests.passed}개 통과, 실패·취소·건너뜀 0개. 기능 검사를 부풀리기 위해 스타일마다 별도 검사를 만들지 않았으며 기존 UI 통합 검사에 다음 동작 검증을 추가했습니다.`,
 '- 메뉴 초점 이동만으로 화면을 바꾸지 않음, 본문 건너뛰기, 검색·삭제·Escape 초기화, 결과 수와 검색어 표시.',
 '- 카드 크기 전환 후 52종목과 같은 가격 경로 유지, 44개 날짜의 단일 Tab 진입·좌우·Home·End·경계 처리.',
 '- 하루 앞뒤 이동과 끝 날짜 버튼 잠금, 다른 종목 날짜 유지, 중요 뉴스 대기 상태와 확인 후 재생.',
 '- 기존 52개 전체 기간 표시, 중복 점선 제거, 관심 목록, 독립 재생, 설명 순서, 모달 초점 순환, 재계산 시 원본 보존.',
 '- 기본 색상 체계의 텍스트 대비 4.5:1, 주요 조작·그래프 선 대비 3:1 검사를 유지했습니다. 모든 조합이나 실제 화면 전체의 접근성 인증은 아닙니다.','',
 'CSS 반응형 규칙과 JSDOM 구조·조작 검사를 수행했습니다. 로컬 미리보기 접근 제한으로 실제 브라우저 픽셀·모바일 터치 확인은 수행하지 못했습니다. 화면 비율과 글꼴별 실제 렌더링 검사는 별도로 필요합니다.','',
 '## 원본 보존','',
 `52종목, 고정 기간 2026-09-17~2026-10-30, 현재 20,000경로, 보관 전망 ${versions.size}개, 엔진·뉴스·가격·수치 계산·기존 평가를 그대로 보존했습니다. atlas.json에서 최신 기능 검사 영수증만 갱신했습니다. 최초 원본 SHA256: \`${result.originalSHA256}\`.`,
 '이번 버전은 예측 정확도 개선을 주장하지 않습니다. 실제 신뢰 확률은 null이며, 기존 미확인 7종목 및 WorkGuard의 뉴스 미완료 상태를 유지합니다. 새 뉴스 수집이나 실제 Netlify 배포는 수행하지 않았습니다.','',
 '이전 소스·검사 결과·자료 체크포인트는 reports/design-7.8/before/에 보관합니다. 코드 수정 후 소스 해시를 캡처하고 전체 검사를 실행했으며 현재 소스와 검사 시작 소스가 일치함을 검증합니다.','');
const md=lines.join('\n');
for(const file of ['reports/design-7.8/result.json','public/downloads/design_36_7_8.json'])await fs.writeFile(new URL(file,root),JSON.stringify({...result,items},null,2)+'\n');
for(const file of ['reports/design-7.8/README.md','public/downloads/DESIGN_36_7_8.md'])await fs.writeFile(new URL(file,root),md);
for(const file of ['VALIDATION.md','public/downloads/VALIDATION.md','reports/AUDIT_REPAIRS.md','public/downloads/AUDIT_REPAIRS.md']){const oldText=await read(file);if(!oldText.includes('<!-- DESIGN_7_8 -->'))await fs.writeFile(new URL(file,root),oldText+'\n<!-- DESIGN_7_8 -->\n'+md);}
console.log(JSON.stringify(result));
