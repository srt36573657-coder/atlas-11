import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createRequire} from 'node:module';
import {pathToFileURL} from 'node:url';
import {transformWithOxc} from 'vite';
import {JSDOM} from 'jsdom';
import {sealStudy} from '../lib/sealed-manifest.mjs';

const dates=['2026-09-17','2026-09-18','2026-09-21','2026-10-30'];
const line=(n,estimated=true)=>estimated?{status:'ESTIMATED',centerReturn:n,price:100*(1+n),lowerReturn:n-.1,upperReturn:n+.1}:{status:'UNESTIMABLE',centerReturn:null,price:null,lowerReturn:null,upperReturn:null};
function fixture(){
 const assets=Array.from({length:52},(_,i)=>({code:String(i+1).padStart(6,'0'),name:`시험 종목 ${i+1}`,sector:'시험 업종',originPrice:100,priceBasisStatus:'UNVERIFIED',newsEvidence:[],reasons:['PRICE_VINTAGE_OR_CORPORATE_ACTION_UNVERIFIED'],rows:dates.map(date=>({date,widthReturn:.1,widthStatus:'EXPLORATORY',a:line(0),b:line(.03,i===1),reasons:i===1?[]:['NO_ESTIMABLE_NEWS_CENTER']}))}));
 const study=sealStudy({schema:1,id:'ui-sealed-fixture',createdAt:'2026-09-25T07:00:00Z',origin:dates[0],end:dates.at(-1),informationCutoff:'2026-09-17T16:00:00+09:00',retrospective:true,policy:{scoring:{magnitudeToleranceReturn:null}},sessions:dates,assets,recordCount:104,provenance:{fixtureOnly:true}});
 const scored=(n,hit)=>({price:100*(1+n),centerReturn:n,signedErrorPP:1,absoluteErrorPP:1,direction:{predicted:'UP',actual:'UP',matched:hit},dailyDirection:{predicted:'UP',actual:'UP',matched:hit},magnitudeHit:null,interval:{inside:true,scorePP:20,widthPP:20}});
 const reports=['2026-09-18','2026-09-21'].map((date,i)=>({id:'report-'+date,studyId:study.id,date,createdAt:'2026-09-26T07:00:00Z',revision:1,sealValid:true,rows:assets.map((a,j)=>({code:a.code,name:a.name,status:'OBSERVED_ONLY',blockers:['ACTUAL_VINTAGE_UNVERIFIED'],intervalBlockers:['BAND_CALIBRATION_UNVERIFIED'],actual:{price:101+i,return:.01*(i+1),dailyReturn:.01},a:null,b:null,observed:{a:scored(0,false),b:j===1?scored(.03,true):null},benchmark:{actualExcessReturn:null,reasons:['KOSPI_SERIES_UNAVAILABLE']}})),summary:{actualAvailable:52,formalPaired:0,observedPaired:1,prospective:false,formal:{a:{count:0,directionRate:null},b:{count:0,directionRate:null}},observed:{a:{count:1,meanAbsoluteErrorPP:2},b:{count:1,directionCorrect:1,directionRate:1,meanAbsoluteErrorPP:1,coverage:1,meanIntervalScorePP:20},centerImprovementPP:1},coMovement:{available:52,up:52,down:0,flat:0,majorityShare:1}}}));
 const revised=structuredClone(reports[1]);revised.id='report-revised';revised.revision=2;revised.createdAt='2026-09-27T07:00:00Z';revised.rows[0].actual={...revised.rows[0].actual,price:105,return:.05};reports.push(revised);
 return {sealedStudy:{schema:1,studies:[study],reports,proofs:[],errors:[]}};
}

test('archived sealed UI: one research forecast, null B stays missing, 52 choices, reports, immutable downloads and seal alarm',async()=>{
 const dom=new JSDOM('<html><body><div id="root"></div></body></html>',{url:'https://example.test',pretendToBeVisual:true});
 for(const k of ['window','document','navigator','HTMLElement','Event','MouseEvent','getComputedStyle'])Object.defineProperty(globalThis,k,{value:dom.window[k],configurable:true});
 globalThis.requestAnimationFrame=fn=>fn();globalThis.IS_REACT_ACT_ENVIRONMENT=true;
 const {default:React,act}=await import('react'),{createRoot}=await import('react-dom/client');
 const req=createRequire(import.meta.url);let {code}=await transformWithOxc(fs.readFileSync('src/sealed-study.tsx','utf8'),'src/sealed-study.tsx',{jsx:{runtime:'automatic'}});
 for(const id of ['react/jsx-runtime','react'])code=code.replaceAll('"'+id+'"','"'+pathToFileURL(req.resolve(id)).href+'"');
 code=code.replaceAll('"../lib/sealed-manifest.mjs"',JSON.stringify(new URL('../lib/sealed-manifest.mjs',import.meta.url).href));
 const {SealedStudyPanel}=await import('data:text/javascript;base64,'+Buffer.from(code).toString('base64'));
 let state=fixture();const before=JSON.stringify(state),root=createRoot(document.getElementById('root'));
 const render=()=>act(async()=>root.render(React.createElement(SealedStudyPanel,{state})));
 const click=async el=>{assert.ok(el,'click target exists');await act(async()=>el.dispatchEvent(new MouseEvent('click',{bubbles:true})));};
 const textButton=t=>[...document.querySelectorAll('button')].find(b=>b.textContent.trim()===t);
 const change=async(el,value)=>act(async()=>{Object.getOwnPropertyDescriptor(dom.window.HTMLSelectElement.prototype,'value').set.call(el,value);el.dispatchEvent(new Event('change',{bubbles:true}));});
 let downloaded=null;const nativeCreate=URL.createObjectURL,nativeRevoke=URL.revokeObjectURL,nativeClick=dom.window.HTMLAnchorElement.prototype.click;
 URL.createObjectURL=blob=>{downloaded=blob;return 'blob:sealed-test';};URL.revokeObjectURL=()=>{};dom.window.HTMLAnchorElement.prototype.click=function(){};
 try{
  await render();assert.equal(document.querySelectorAll('[data-sealed-code]').length,52);assert.equal(document.querySelectorAll('[data-sealed-date]').length,44);assert.equal(document.querySelectorAll('[data-sealed-row]').length,52);
  assert.equal(document.querySelector('[data-sealed-full-period]').getAttribute('data-sealed-full-period'),'2026-09-17/2026-10-30');assert.equal(document.querySelector('[data-sealed-forecast-path]'),null);assert.match(document.querySelector('[data-sealed-forecast-unavailable]').textContent,/연구예측 미산정/);assert.equal(document.querySelectorAll('.sealed-line-a,.sealed-band-a').length,0);assert.equal(document.querySelectorAll('[data-sealed-actual-path]').length,1);assert.match(document.body.textContent,/104개 · A 수치 52종목 · B 수치 1종목/);assert.match(document.body.textContent,/외부 시각 인증 미확보/);assert.match(document.body.textContent,/당시 발행본 아님/);assert.match(document.body.textContent,/전향 평가 0거래일/);assert.match(document.body.textContent,/현재 내용 지문 일치/);
  await click(textButton('2026-09-21 · 수정 1'));assert.match(document.querySelector('.sealed-day-prices').textContent,/102원/);assert.match(document.querySelector('.sealed-mode-note').textContent,/보고서 수정 1/);await click(textButton('2026-09-21 · 수정 2'));assert.match(document.querySelector('.sealed-day-prices').textContent,/105원/);
  await click(document.querySelector('[data-sealed-code="000002"]'));assert.ok(document.querySelector('[data-sealed-b-path]').getAttribute('d').length>0);assert.equal(document.querySelectorAll('[data-sealed-forecast-path]').length,1);assert.equal(document.querySelectorAll('[data-sealed-actual-path]').length,1);assert.equal(document.querySelector('[data-sealed-forecast-unavailable]'),null);assert.equal(document.querySelector('[data-sealed-code="000002"]').getAttribute('aria-pressed'),'true');
  const fixedFullPath=document.querySelector('[data-sealed-b-path]').getAttribute('d');await click(document.querySelector('[data-sealed-date="2026-09-18"]'));assert.equal(document.querySelector('[data-sealed-b-path]').getAttribute('d'),fixedFullPath);assert.equal(document.querySelector('.sealed-day-detail h3').textContent,'2026-09-18');
  await click(textButton('관측 진단'));assert.match(document.querySelector('.sealed-mode-note').textContent,/실전 적중 성적으로 세지 않습니다/);assert.match(document.querySelector('.sealed-metrics').textContent,/100.0%/);await click(textButton('방향 일치'));assert.equal(document.querySelectorAll('[data-sealed-row]').length,1);assert.equal(document.querySelector('[data-sealed-row]').getAttribute('data-sealed-row'),'000002');
  await click(textButton('미산정'));assert.equal(document.querySelectorAll('[data-sealed-row]').length,51);await click(textButton('전체'));assert.equal(document.querySelectorAll('[data-sealed-row]').length,52);
  assert.equal(document.querySelectorAll('[data-sealed-forecast-range]').length,0);await click(textButton('예측 범위 보기'));assert.equal(document.querySelectorAll('[data-sealed-forecast-range]').length,1);assert.equal(document.querySelectorAll('.sealed-line-a,.sealed-band-a,.sealed-band-switch').length,0);assert.equal(document.querySelectorAll('[data-sealed-forecast-path]').length,1);await click(textButton('예측 범위 닫기'));assert.equal(document.querySelectorAll('[data-sealed-forecast-range]').length,0);assert.match(document.querySelector('.sealed-reference-price').textContent,/기준가 참고/);assert.equal(textButton('두 띠'),undefined);assert.equal(textButton('A 띠'),undefined);
  await click(textButton('이 날짜 보고서 받기'));assert.equal(JSON.parse(await downloaded.text()).date,'2026-09-18');await click(textButton('봉인 묶음 받기'));assert.equal(JSON.parse(await downloaded.text()).study.seal.digest,state.sealedStudy.studies[0].seal.digest);
  await change(document.querySelector('[aria-label="날짜별 보고서"]'),'2026-10-30');assert.equal(textButton('이 날짜 보고서 받기').disabled,true);assert.match(document.querySelector('.sealed-mode-note').textContent,/보고서가 없습니다/);assert.equal(document.querySelectorAll('[data-sealed-row]').length,52);
  await click(document.querySelector('[data-sealed-date="2026-09-19"]'));assert.match(document.querySelector('.sealed-day-detail').textContent,/휴장일입니다/);assert.equal(JSON.stringify(state),before,'UI and downloads never mutate frozen data');
  state=structuredClone(state);state.sealedStudy.proofs=[{studyId:state.sealedStudy.studies[0].id,studyDigest:state.sealedStudy.studies[0].seal.digest,status:'VERIFIED',verified:true,fixtureOnly:false}];await render();assert.match(document.querySelector('[data-sealed-proof-display-only]').textContent,/외부 시각 인증 미확보/);
  state.sealedStudy.proofs=[{studyId:state.sealedStudy.studies[0].id,studyDigest:state.sealedStudy.studies[0].seal.digest,status:'VERIFIED_AGAINST_PROVIDED_ROOT',fixtureOnly:false}];await render();assert.match(document.querySelector('[data-sealed-proof-display-only]').textContent,/이 화면에서 토큰 재검증하지 않음/);
  state=structuredClone(state);state.sealedStudy.studies[0].assets[0].originPrice=999;await render();assert.match(document.querySelector('[role="alert"]').textContent,/봉인 내용이 지문과 일치하지 않습니다/);assert.equal(document.querySelector('.sealed-metrics strong').textContent,'미산정');assert.equal(document.querySelector('[data-sealed-forecast-path]'),null);assert.match(document.querySelector('[data-sealed-forecast-unavailable]').textContent,/봉인 검증 실패/);
  state={};await render();assert.match(document.body.textContent,/아직 봉인한 시험이 없습니다/);
 }finally{await act(async()=>root.unmount());URL.createObjectURL=nativeCreate;URL.revokeObjectURL=nativeRevoke;dom.window.HTMLAnchorElement.prototype.click=nativeClick;dom.window.close();}
});

test('retired sealed study stays out of active score while its component and records are preserved',()=>{
 const app=fs.readFileSync('src/atlas.tsx','utf8'),component=fs.readFileSync('src/sealed-study.tsx','utf8'),css=fs.readFileSync('src/sealed-study.css','utf8');
 assert.match(app,/<WaveScore version=\{version\}/);assert.doesNotMatch(app,/<SealedStudyPanel state=/);assert.doesNotMatch(component,/className="sealed-line-a"|className="sealed-band-a"|sealed-band-switch/);assert.match(component,/data-sealed-forecast-mode="single-news-center"/);assert.doesNotMatch(component,/clipPath/);assert.match(component,/URL\.revokeObjectURL/);assert.match(css,/focus-visible/);assert.match(css,/prefers-reduced-motion/);
});
