import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createRequire} from 'node:module';
import {pathToFileURL} from 'node:url';
import {transformWithOxc} from 'vite';
import {JSDOM} from 'jsdom';

const firstDate='2026-09-18',secondDate='2026-09-21';
function fixture(){
 const assets=Array.from({length:52},(_,i)=>({code:String(i+1).padStart(6,'0'),name:'종목 '+(i+1),sector:'시험',rows:[{date:firstDate,p50:101,return:.01},{date:secondDate,p50:102,return:.02}],news:[]}));
 const selectedVersion={id:'forecast-selected',origin:'2026-09-17',end:'2026-10-30',assets};
 const otherVersion={...selectedVersion,id:'forecast-other'};
 const score=(i,date,matched,id='forecast-selected')=>({id:id+':'+date+':'+i,code:assets[i].code,name:assets[i].name,date,forecastId:id,forecastOrigin:'2026-09-17',predicted:101,actual:102,errorWon:1,absolutePercentageError:1/102,directionMatched:matched,interval:{inside:true},evaluationKind:'PROSPECTIVE',actualObservedAt:date+'T07:00:00Z',recordedAt:date+'T07:00:00Z',diagnosis:[]});
 return {selectedVersion,state:{active:selectedVersion.id,original:selectedVersion.id,versions:[selectedVersion,otherVersion],input:{actualAsOf:secondDate,assets,calendar:{sessions:['2026-09-17',firstDate,secondDate]}},evaluationLedger:[score(0,firstDate,true),score(1,firstDate,true),score(2,firstDate,false),score(3,firstDate,null),score(0,secondDate,true),score(1,secondDate,false),score(2,secondDate,false),score(0,firstDate,false,'forecast-other'),score(1,secondDate,true,'forecast-other')]}};
}

async function environment(){
 const dom=new JSDOM('<div id="root"></div>',{url:'https://example.test',pretendToBeVisual:true});
 for(const k of ['window','document','navigator','HTMLElement','Event','MouseEvent','getComputedStyle'])Object.defineProperty(globalThis,k,{value:dom.window[k],configurable:true});
 globalThis.requestAnimationFrame=fn=>fn();globalThis.IS_REACT_ACT_ENVIRONMENT=true;
 const {default:React,act}=await import('react'),{createRoot}=await import('react-dom/client');
 const req=createRequire(import.meta.url);let {code}=await transformWithOxc(fs.readFileSync('src/workbench.tsx','utf8'),'src/workbench.tsx',{jsx:{runtime:'automatic'}});
 for(const id of ['react/jsx-runtime','react-dom','react'])code=code.replaceAll('"'+id+'"',JSON.stringify(pathToFileURL(req.resolve(id)).href));
 for(const id of ['evaluation-ledger','news-scope'])code=code.replaceAll('"../lib/'+id+'.mjs"',JSON.stringify(new URL('../lib/'+id+'.mjs',import.meta.url).href));
 const components=await import('data:text/javascript;base64,'+Buffer.from(code).toString('base64'));
 const root=createRoot(document.getElementById('root'));
 return {dom,React,act,...components,
  render:component=>act(async()=>root.render(component)),
  click:async el=>{assert.ok(el);await act(async()=>el.dispatchEvent(new MouseEvent('click',{bubbles:true})));},
  change:async(el,value)=>act(async()=>{Object.getOwnPropertyDescriptor(dom.window.HTMLSelectElement.prototype,'value').set.call(el,value);el.dispatchEvent(new Event('change',{bubbles:true}));}),
  close:async()=>{await act(async()=>root.unmount());dom.window.close();},
 };
}

test('date result filters preserve full denominator and exact forecast/code/date navigation without editing data',async()=>{
 const e=await environment(),f=fixture(),before=JSON.stringify(f),opened=[];
 try{
  await e.render(e.React.createElement(e.ScoreWorkbench,{...f,onOpenDate:(...args)=>opened.push(args)}));
  assert.equal(document.querySelector('[data-score-workbench]').dataset.scoreForecastId,'forecast-selected');
  assert.equal(document.querySelectorAll('[data-score-row]').length,52);
  await e.change(document.querySelector('[aria-label="성적 목표 날짜"]'),firstDate);
  assert.match(document.querySelector('[data-score-filter="hit"]').textContent,/방향 일치 2/);
  assert.match(document.querySelector('[data-score-filter="miss"]').textContent,/방향 불일치 1/);
  assert.match(document.querySelector('[data-score-filter="pending"]').textContent,/미평가 49/);
  assert.match(document.querySelector('[data-score-direction-denominator]').textContent,/일치 2 \/ 방향 평가 3종목/);
  assert.match(document.querySelector('.score-metrics').textContent,/66.7%/);
  await e.click(document.querySelector('[data-score-filter="hit"]'));
  assert.equal(document.querySelectorAll('[data-score-row]').length,2);
  assert.match(document.querySelector('[data-score-direction-denominator]').textContent,/일치 2 \/ 방향 평가 3종목/);
  await e.click(document.querySelector('[data-score-row="000002"] button'));
  assert.deepEqual(opened.at(-1),['000002',firstDate,'forecast-selected']);
  const diagnosisButton=[...document.querySelectorAll('[data-score-row="000002"] button')].find(b=>b.textContent==='원인 점검');
  diagnosisButton.focus();await e.click(diagnosisButton);
  assert.ok(document.querySelector('[data-diagnosis-dialog]'));
  assert.equal(document.activeElement,document.querySelector('[aria-label="원인 점검 닫기"]'));
  await e.act(async()=>document.dispatchEvent(new e.dom.window.KeyboardEvent('keydown',{key:'Escape',bubbles:true,cancelable:true})));
  assert.equal(document.querySelector('[data-diagnosis-dialog]'),null);
  assert.equal(document.activeElement,diagnosisButton,'diagnosis returns keyboard focus to the filtered row');
  await e.click(document.querySelector('[data-score-filter="pending"]'));
  assert.equal(document.querySelectorAll('[data-score-row]').length,49);
  assert.equal(document.querySelector('[data-score-row="000004"]').dataset.scoreResult,'pending','null direction is not incorrect');
  await e.click(document.querySelector('[data-score-row="000052"] button'));
  assert.deepEqual(opened.at(-1),['000052',firstDate,'forecast-selected']);
  assert.equal(JSON.stringify(f),before);
 }finally{await e.close();}
});

test('future actualAsOf metadata cannot create future date evaluation choices',async()=>{
 const e=await environment(),f=fixture();
 f.state.input.actualAsOf='2099-01-01';f.state.input.calendar.sessions.push('2099-01-01');
 try{
  await e.render(e.React.createElement(e.ScoreWorkbench,{...f,onOpenDate:()=>{}}));
  const choices=[...document.querySelector('[aria-label="성적 목표 날짜"]').options].map(o=>o.value);
  assert.equal(choices.includes('2099-01-01'),false);
  assert.equal(document.querySelector('.score-metrics').dataset.scoreDate,secondDate);
 }finally{await e.close();}
});

test('newly observed date with no ledger remains 52 pending rows and selected forecast change resets outcome filter',async()=>{
 const e=await environment(),f=fixture();
 f.state.evaluationLedger=f.state.evaluationLedger.filter(r=>r.date===firstDate);
 try{
  await e.render(e.React.createElement(e.ScoreWorkbench,{...f,onOpenDate:()=>{}}));
  assert.equal(document.querySelector('.score-metrics').dataset.scoreDate,secondDate);
  assert.equal(document.querySelectorAll('[data-score-pending]').length,52);
  assert.match(document.querySelector('[data-score-direction-denominator]').textContent,/일치 0 \/ 방향 평가 0종목/);
  await e.click(document.querySelector('[data-score-filter="hit"]'));
  assert.equal(document.querySelectorAll('[data-score-row]').length,0);
  await e.render(e.React.createElement(e.ScoreWorkbench,{...f,selectedVersion:f.state.versions[1],onOpenDate:()=>{}}));
  assert.equal(document.querySelector('[data-score-filter="all"]').getAttribute('aria-pressed'),'true');
  assert.equal(document.querySelector('[data-score-workbench]').dataset.scoreForecastId,'forecast-other');
  assert.equal(document.querySelectorAll('[data-score-row]').length,52);
 }finally{await e.close();}
});

test('news graph action passes the displayed stock event date and immutable forecast ID including null impact',async()=>{
 const e=await environment(),f=fixture(),opened=[];
 f.selectedVersion.assets[0].news=[{id:'a-event',date:firstDate,name:'기업 A 일정',reason:'A 회사 일정',scope:{type:'company',codes:['000001']},impact:{distributionChangePP:null,medianChangePP:null},sampleCount:0,sources:[]}];
 f.selectedVersion.assets[1].news=[{id:'b-event',date:secondDate,name:'기업 B 일정',reason:'B 회사 일정',scope:{type:'company',codes:['000002']},sampleCount:0,sources:[]}];
 const before=JSON.stringify(f.selectedVersion);
 function Harness(){const [code,setCode]=e.React.useState('000001');return e.React.createElement(e.NewsWorkbench,{version:f.selectedVersion,code,onCode:setCode,onOpenDate:(...args)=>opened.push(args)});}
 try{
  await e.render(e.React.createElement(Harness));
  assert.match(document.querySelector('.news-reading-list').textContent,/가격 영향 미산정/);
  await e.click(document.querySelector('[data-news-open-date]'));
  assert.deepEqual(opened.at(-1),['000001',firstDate,'forecast-selected']);
  await e.change(document.querySelector('[aria-label="뉴스 종목 선택"]'),'000002');
  assert.equal(document.querySelector('[data-selected-news]').dataset.selectedNews,'b-event');
  await e.click(document.querySelector('[data-news-open-date]'));
  assert.deepEqual(opened.at(-1),['000002',secondDate,'forecast-selected']);
  assert.equal(JSON.stringify(f.selectedVersion),before);
 }finally{await e.close();}
});
