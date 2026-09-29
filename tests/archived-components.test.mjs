import test from 'node:test';import assert from 'node:assert/strict';import{component,mounted}from'./helpers/factor36-ui.mjs';import{sealStudy}from'../lib/sealed-manifest.mjs';
function scoreFixture(){
  const dates=['2026-09-17','2026-09-18','2026-09-21','2026-09-23','2026-10-30'];
  const asset={code:'005930',name:'선택 검사 종목',sector:'시험',prices:dates.slice(0,4).map((date,i)=>({date,close:100+i,quality:'single_source'}))};
  const version=(id,start)=>({id,origin:'2026-09-17',createdAt:'2026-09-17T07:00:00Z',assets:[{...asset,rows:dates.map((date,i)=>({date,p50:start+i}))}]});
  const first=version('operating-first',110),second=version('operating-second',120);
  const ledger=(v,date,n)=>({id:v.id+'-'+date,forecastId:v.id,code:asset.code,name:asset.name,date,forecastOrigin:v.origin,predicted:n,actual:103,errorWon:103-n,absolutePercentageError:Math.abs(103-n)/103,directionMatched:true,interval:{inside:true},evaluationKind:'PROSPECTIVE',actualObservedAt:'2026-09-24T07:00:00Z',recordedAt:'2026-09-24T07:00:00Z',diagnosis:[]});
  const state={active:second.id,original:first.id,versions:[first,second],input:{origin:dates[0],end:dates.at(-1),actualAsOf:'2026-09-23',assets:[asset],calendar:{sessions:dates}},evaluationLedger:[ledger(first,'2026-09-18',111),ledger(first,'2026-09-21',112),ledger(second,'2026-09-23',123)],evolution:{activeId:'shadow-record',versions:[{...version('shadow-record',130),sourceId:first.id,origin:'2026-09-21',issuedAt:'2026-09-20T07:00:00Z',informationCutoff:'2026-09-20T07:00:00Z'}],evaluations:[],notes:[]}};
  return {state,first,second};
}
test('single-view components: selected forecast controls score rows and evolution values; alternative evolution record replaces rather than overlays',async()=>{
  await mounted(async({React,render,change})=>{
    const {ScoreWorkbench}=await component('../../src/workbench.tsx'),{EvolutionWorkbench}=await component('../../src/evolution.tsx');
    const {state,first,second}=scoreFixture(),before=JSON.stringify(state);
    const view=selectedVersion=>React.createElement(React.Fragment,null,React.createElement(ScoreWorkbench,{state,selectedVersion,onOpenDate:()=>{}}),React.createElement(EvolutionWorkbench,{state,selectedVersion}));
    await render(view(first));
    await change(document.querySelector('.score-date select'),'2026-09-18');
    assert.match(document.querySelector('.score-workbench tbody').textContent,/111원/);
    const oldPath=document.querySelector('[data-evolution-displayed-forecast]').getAttribute('d');
    await render(view(second));
    assert.match(document.querySelector('.score-filters output').textContent,/g-second/);
    assert.equal(document.querySelector('.score-date select').value,'2026-09-23','stale date from different forecast must not hide new score');
    assert.match(document.querySelector('.score-workbench tbody').textContent,/123원/);
    assert.match(document.querySelector('.evo-version-controls').textContent,/operating-second/);
    assert.match(document.querySelector('.evo-values').textContent,/123원/);
    assert.notEqual(document.querySelector('[data-evolution-displayed-forecast]').getAttribute('d'),oldPath);
    await change(document.querySelector('[aria-label="진화 차트 표시 전망"]'),'shadow-record');
    assert.equal(document.querySelectorAll('[data-evolution-displayed-forecast]').length,1);
    assert.equal(document.querySelectorAll('.evo-chart .evo-actual').length,1);
    assert.equal(document.querySelectorAll('.evo-chart .evo-baseline').length,0);
    assert.equal(document.querySelectorAll('.evo-chart .evo-original').length,0);
    assert.match(document.querySelector('.evo-version-controls').textContent,/shadow-record/);
    await change(document.querySelector('[aria-label="진화 차트 표시 전망"]'),'operating');
    assert.equal(document.querySelectorAll('[data-evolution-displayed-forecast]').length,1);
    assert.match(document.querySelector('.evo-values').textContent,/123원/);
    assert.equal(JSON.stringify(state),before,'display selection does not mutate saved forecast or score ledger');
  });
});

test('single-view archive: unavailable news forecast draws no proxy; valid news forecast and optional range never add A',async()=>{
  await mounted(async({React,render,click,button})=>{
    const {SealedStudyPanel}=await component('../../src/sealed-study.tsx');
    const dates=['2026-09-17','2026-09-23','2026-10-30'],line=n=>({status:'ESTIMATED',price:100*(1+n),centerReturn:n,lowerReturn:n-.1,upperReturn:n+.1});
    const assets=Array.from({length:52},(_,i)=>({code:String(i+1).padStart(6,'0'),name:'검사'+i,sector:'시험',originPrice:100,newsEvidence:[],rows:dates.map((date,j)=>({date,a:line(0),b:i===1?line(.01*j):{status:'UNESTIMABLE',price:null,centerReturn:null,lowerReturn:null,upperReturn:null},widthReturn:.1,widthStatus:'EXPLORATORY',reasons:[]}))}));
    const study=sealStudy({schema:1,id:'single-ui-only-fixture',origin:dates[0],end:dates.at(-1),createdAt:'2026-09-27T07:00:00Z',informationCutoff:'2026-09-17T16:00:00+09:00',retrospective:true,policy:{},sessions:dates,assets,recordCount:104,provenance:{fixtureOnly:true}});
    const report={id:'single-ui-report',studyId:study.id,date:'2026-09-23',createdAt:'2026-09-27T07:00:00Z',rows:assets.map(a=>({code:a.code,name:a.name,actual:{price:102,return:.02},observed:{a:null,b:null},a:null,b:null})),summary:{}};
    const state={sealedStudy:{studies:[study],reports:[report],proofs:[],errors:[]}},before=JSON.stringify(state);
    await render(React.createElement(SealedStudyPanel,{state}));
    assert.equal(document.querySelectorAll('[data-sealed-forecast-path]').length,0);
    assert.equal(document.querySelectorAll('[data-sealed-actual-path]').length,1);
    assert.equal(document.querySelectorAll('.sealed-line-a,.sealed-band-a').length,0);
    assert.ok(document.querySelector('[data-sealed-forecast-unavailable]'));
    await click(document.querySelector('[data-sealed-code="000002"]'));
    assert.equal(document.querySelectorAll('[data-sealed-forecast-path]').length,1);
    assert.equal(document.querySelectorAll('[data-sealed-actual-path]').length,1);
    assert.equal(document.querySelectorAll('[data-sealed-forecast-range]').length,0,'range off by default');
    await click(button('예측 범위 보기'));
    assert.ok(document.querySelector('[data-sealed-forecast-range]'));
    assert.equal(document.querySelectorAll('[data-sealed-forecast-path]').length,1);
    assert.equal(document.querySelectorAll('.sealed-line-a,.sealed-band-a').length,0);
    await click(document.querySelector('[data-sealed-code="000001"]'));
    assert.equal(document.querySelectorAll('[data-sealed-forecast-path],[data-sealed-forecast-range]').length,0);
    assert.equal(JSON.stringify(state),before);
  });
});

test('single-view breaking chart: selected operating record and explicit later research record replace one another',async()=>{
  await mounted(async({React,render,change})=>{
    const {BreakingWorkbench}=await component('../../src/breaking.tsx');
    const {state,first,second}=scoreFixture();
    state.breaking={events:[],decisions:[],evaluations:[],premises:[],forecasts:[{id:'breaking-research-only',code:'005930',kind:'KEEP',baselineId:first.id,issuedAt:'2026-09-22T07:00:00Z',effectiveFrom:'2026-09-23',sourceOriginal:{asset:first.assets[0]},rows:first.assets[0].rows.map(r=>({...r,p50:r.p50+30}))}]};
    const before=JSON.stringify(state),view=selectedVersion=>React.createElement(BreakingWorkbench,{state,selectedVersion});
    await render(view(first));
    const chart=()=>document.querySelector('[data-breaking-chart]');
    assert.equal(chart().querySelectorAll('[data-breaking-displayed-forecast]').length,1);
    assert.equal(chart().querySelectorAll('.breaking-chart-actual').length,1);
    assert.equal(chart().querySelectorAll('.breaking-chart-change').length,0);
    const originalPath=chart().querySelector('[data-breaking-displayed-forecast]').getAttribute('d');
    await render(view(second));
    assert.match(document.querySelector('.breaking-chart-panel').textContent,/표시 발행본 operating-second/);
    assert.notEqual(chart().querySelector('[data-breaking-displayed-forecast]').getAttribute('d'),originalPath);
    await change(document.querySelector('[aria-label="돌발 판단 전망 선택"]'),'breaking-research-only');
    assert.equal(chart().querySelectorAll('[data-breaking-displayed-forecast]').length,1);
    assert.equal(chart().querySelectorAll('.breaking-chart-baseline').length,0);
    assert.equal(chart().querySelectorAll('.breaking-chart-actual').length,1);
    const revised=chart().querySelector('[data-breaking-displayed-forecast]');
    assert.equal(revised.dataset.breakingEffectiveFrom,'2026-09-23');
    assert.equal((revised.getAttribute('d').match(/[ML]/g)||[]).length,2,'research line starts at effective date and never rewrites older dates');
    await change(document.querySelector('[aria-label="돌발 판단 전망 선택"]'),'operating');
    assert.equal(chart().querySelectorAll('.breaking-chart-change').length,0);
    assert.match(document.querySelector('.breaking-chart-panel').textContent,/표시 발행본 operating-second/);
    assert.equal(JSON.stringify(state),before);
  });
});
