import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createRequire} from 'node:module';
import {pathToFileURL} from 'node:url';
import {transformWithOxc} from 'vite';
import {JSDOM} from 'jsdom';

test('breaking UI: explicit targets, KST publication, candidate review, future-only line and gated JSON request',async()=>{
 const dom=new JSDOM('<html><body><div id="root"></div></body></html>',{url:'https://example.test',pretendToBeVisual:true});
 for(const k of ['window','document','HTMLElement','Event','MouseEvent','getComputedStyle'])Object.defineProperty(globalThis,k,{value:dom.window[k],configurable:true});
 globalThis.IS_REACT_ACT_ENVIRONMENT=true;
 const {default:React,act}=await import('react'),{createRoot}=await import('react-dom/client');
 const req=createRequire(import.meta.url);let {code}=await transformWithOxc(fs.readFileSync('src/breaking.tsx','utf8'),'src/breaking.tsx',{jsx:{runtime:'automatic'}});
 for(const id of ['react/jsx-runtime','react'])code=code.replaceAll('"'+id+'"','"'+pathToFileURL(req.resolve(id)).href+'"');
 const {BreakingWorkbench}=await import('data:text/javascript;base64,'+Buffer.from(code).toString('base64'));
 const assets=Array.from({length:52},(_,i)=>({code:String(i+1).padStart(6,'0'),name:`검사 종목 ${i+1}`,sector:'시험 업종',prices:[{date:'2026-09-17',close:100},{date:'2026-09-23',close:110}]}));
 const baseAssets=assets.map(a=>({...a,rows:[{date:'2026-09-17',p50:100},{date:'2026-09-23',p50:108},{date:'2026-09-28',p50:111},{date:'2026-10-30',p50:120}]}));
 const state={input:{assets,actualAsOf:'2026-09-23',calendar:{sessions:['2026-09-17','2026-09-23','2026-09-28','2026-10-30']}},versions:[{id:'base',assets:baseAssets}],breaking:{events:[],decisions:[],forecasts:[],evaluations:[],premises:[],candidates:[],collectionStatus:[]}};
 const snapshot=JSON.stringify(state);const calls=[];const root=createRoot(document.getElementById('root'));const render=()=>act(async()=>root.render(React.createElement(BreakingWorkbench,{state,onAction:async(action,payload)=>{calls.push({action,payload});}})));
 const click=async el=>act(async()=>el.dispatchEvent(new MouseEvent('click',{bubbles:true})));
 const textButton=t=>[...document.querySelectorAll('button')].find(b=>b.textContent.trim()===t);
 const fill=async(el,value)=>act(async()=>{const proto=el.tagName==='TEXTAREA'?dom.window.HTMLTextAreaElement.prototype:dom.window.HTMLInputElement.prototype;Object.getOwnPropertyDescriptor(proto,'value').set.call(el,value);el.dispatchEvent(new Event('input',{bubbles:true}));});
 try{
 await render();assert.equal(document.querySelectorAll('[data-breaking-code]').length,52);assert.equal(document.querySelectorAll('[data-breaking-displayed-forecast]').length,1);assert.equal(document.querySelector('.breaking-chart-change'),null);assert.ok(document.querySelector('.breaking-chart-baseline'));assert.ok(document.body.textContent.includes('실시간 감시 연결을 확인한 상태가 아닙니다.'));
 await click(document.querySelector('[data-breaking-code="000002"]'));await click(textButton('돌발 뉴스 등록 ＋'));
 const form=document.querySelector('[data-breaking-form]');const field=label=>[...form.querySelectorAll('label')].find(l=>l.textContent.startsWith(label))?.querySelector('input,textarea');
 await fill(field('뉴스 제목'),'기업 공시 검토');await fill(field('확인한 내용'),'이것은 동작 검사용 입력입니다.');await fill(field('발표·기사'),'https://example.test/release');await fill(field('공개 시각'),'2026-09-27T09:00');await fill(field('같은 경제'),'test-event');await fill(field('사건 단계'),'announcement');
 await act(async()=>form.dispatchEvent(new Event('submit',{bubbles:true,cancelable:true})));
 assert.equal(calls.length,1);assert.equal(calls[0].action,'breakingRecord');const event=calls[0].payload.event;assert.deepEqual(event.targetCodes,['000002']);assert.equal(event.publishedAt,'2026-09-27T00:00:00.000Z');assert.equal(event.sourceBodyReviewed,false);assert.equal(event.sourceType,'unverified');assert.ok(!('approvedImpact' in event));
 state.breaking.events=[{...event,id:'event-1',knownAt:'2026-09-27T07:00:00Z',discoveredAt:'2026-09-27T07:00:00Z'}];state.breaking.candidates=[{id:'candidate-1',code:'000002',title:'미검토 후보',url:'https://example.test/candidate',publishedAt:null,observedAt:'2026-09-27T07:00:00Z'}];
 state.breaking.forecasts=[{id:'f-1',code:'000002',kind:'KEEP',baselineId:'base',issuedAt:'2026-09-27T07:00:00Z',effectiveFrom:'2026-09-28',sourceOriginal:{asset:baseAssets[1]},rows:baseAssets[1].rows}];await render();
 assert.equal(document.querySelectorAll('[data-breaking-displayed-forecast]').length,1);assert.equal(document.querySelector('.breaking-chart-change'),null);
 await act(async()=>{const select=document.querySelector('[aria-label="돌발 판단 전망 선택"]');Object.getOwnPropertyDescriptor(dom.window.HTMLSelectElement.prototype,'value').set.call(select,'f-1');select.dispatchEvent(new Event('change',{bubbles:true}));});
 const changed=document.querySelector('.breaking-chart-change');assert.equal(document.querySelectorAll('[data-breaking-displayed-forecast]').length,1);assert.equal(document.querySelector('.breaking-chart-baseline'),null);assert.equal(changed.getAttribute('data-breaking-effective-from'),'2026-09-28');assert.equal((changed.getAttribute('d').match(/[ML]/g)||[]).length,2);assert.ok(document.body.textContent.includes('선택한 유지 기록'));
 await click(textButton('변경 검토'));const reason=document.querySelector('.breaking-decision-form textarea');await fill(reason,'실제 검토 자료가 없으므로 엔진 자격 검사가 필요합니다.');await fill(document.querySelector('[aria-label="돌발 변경 검증 자료 JSON"]'),'{bad');
 await act(async()=>document.querySelector('.breaking-decision-form').dispatchEvent(new Event('submit',{bubbles:true,cancelable:true})));assert.equal(calls.length,1);assert.ok(document.body.textContent.includes('JSON 문법'));
 await fill(document.querySelector('[aria-label="돌발 변경 검증 자료 JSON"]'),'');await act(async()=>document.querySelector('.breaking-decision-form').dispatchEvent(new Event('submit',{bubbles:true,cancelable:true})));assert.equal(calls[1].action,'breakingDecision');assert.equal(calls[1].payload.decision,'REVISE');assert.ok(!('approvedImpact' in calls[1].payload));
 await click(document.querySelector('.breaking-candidate-list button'));const candidateForm=document.querySelector('[data-breaking-form]');assert.equal(candidateForm.querySelector('input[type="datetime-local"]').value,'');assert.equal(candidateForm.querySelector('input[type="url"]').value,'https://example.test/candidate');assert.equal(candidateForm.querySelector('input[type="checkbox"]').checked,false); // target 000001 is not selected
 assert.equal(JSON.stringify({input:state.input,versions:state.versions}),JSON.stringify({input:JSON.parse(snapshot).input,versions:JSON.parse(snapshot).versions}));
 }finally{await act(async()=>root.unmount());dom.window.close();}
});
