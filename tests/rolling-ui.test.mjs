import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
import {mounted,component} from './helpers/factor36-ui.mjs';

const publication=JSON.parse(fs.readFileSync('public/data/rolling-forecast.json','utf8'));
const fetchFor=(edition=publication)=>async url=>{
  if(url==='/data/rolling-forecast.json')return Response.json(edition);
  if(url==='/data/rolling-scores.json')return Response.json({schema:'atlas-rolling-scores-1',actualAsOf:edition.actualAsOf,assets:edition.assets.map(a=>({code:a.code,horizons:Object.fromEntries([1,5,10,20].map(h=>[h,{ape:null,reason:'NO_ELIGIBLE_PRIOR_PUBLICATION'}]))}))});
  throw Error('Unexpected network access in rolling UI test: '+url);
};

test('real rolling edition renders five metrics, 52 clickable stocks, exact anchor and all20 forecast points',async()=>mounted(async h=>{
  const {RollingPage,rollingGeometry,validateRollingEdition}=await component('../../src/rolling.tsx');
  assert.equal(validateRollingEdition(publication).assets.length,52);
  await h.render(h.React.createElement(RollingPage));
  await h.wait(()=>document.querySelectorAll('[data-rolling-metrics]>article').length===5);
  assert.equal(document.querySelector('[data-rolling-page]').dataset.rollingEdition,publication.id);
  assert.equal(document.querySelector('[data-rolling-anchor-difference]').textContent,'0원');
  assert.equal(document.querySelectorAll('[data-rolling-line=actual]').length,1);
  assert.equal(document.querySelectorAll('[data-rolling-line=current]').length,1);
  assert.equal(document.querySelectorAll('[data-rolling-line=previous]').length,publication.assets.find(a=>a.code==='005930').previous?1:0);
  assert.equal(document.querySelectorAll('[data-rolling-band]').length,1);
  assert.equal(document.querySelectorAll('[data-rolling-anchor-line]').length,1);
  assert.equal(document.querySelectorAll('[data-rolling-date]').length,21);
  assert.equal(document.querySelectorAll('[data-error-horizon]').length,4);
  if(publication.staleAnchor)assert.match(document.querySelector('[data-rolling-stale]').textContent,/보관 종가/);
  await h.click(document.querySelector('.rolling-stock-button'));
  assert.equal(document.querySelectorAll('[data-rolling-stock]').length,52);
  for(const asset of publication.assets){
    const geometry=rollingGeometry(asset),actualEnd=geometry.actual.at(-1),forecastStart=geometry.current[0];
    assert.equal(actualEnd.date,forecastStart.date);
    assert.equal(geometry.x(actualEnd.date),geometry.anchorX);
    assert.equal(geometry.y(actualEnd.value),geometry.anchorY);
    assert.equal(geometry.y(forecastStart.value),geometry.anchorY);
    assert.equal(asset.rows.length-1,20);
    assert.equal(geometry.path(geometry.current).includes('C'),false,'No synthetic smoothing');
  }
  const chosen=publication.assets.find(a=>a.code!=='005930');
  await h.click(document.querySelector(`[data-rolling-stock="${chosen.code}"]`));
  assert.equal(document.querySelector('[data-rolling-chart]').dataset.rollingChart,chosen.code);
  const date=chosen.rows[5].date;
  await h.click(document.querySelector(`[data-rolling-date="${date}"]`));
  assert.equal(document.querySelector('[data-rolling-play-date]').textContent,date);
  assert.match(document.querySelector('[data-rolling-reason]').textContent,new RegExp(chosen.name));
  await h.click(h.button('52종목 · 1만원'));
  assert.equal(document.querySelectorAll('[data-rolling-normalized-line]').length,52);
  assert.equal(document.querySelectorAll('[data-rolling-rank]').length,52);
  assert.equal(document.querySelector('[data-rolling-page]').dataset.rollingEdition,publication.id);
},{fetchImpl:fetchFor(),url:'https://atlas-unit.test/'}),{timeout:15000});

test('actual publication news pauses playback; each same-day event needs acknowledgement and next importantday stops again',async()=>mounted(async h=>{
  const {RollingPage}=await component('../../src/rolling.tsx');
  await h.render(h.React.createElement(RollingPage));
  await h.wait(()=>document.querySelector('[data-rolling-play]'));
  const asset=publication.assets.find(a=>a.code==='005930');
  const days=asset.rows.map(r=>r.date),eventDates=[...new Set(asset.news.map(n=>n.date))].filter(d=>days.includes(d)).sort();
  assert.ok(eventDates.length>=2,'The actual source includes multiple linked news dates');
  const first=eventDates[0],before=days[days.indexOf(first)-1];
  await h.click(document.querySelector(`[data-rolling-date="${before}"]`));
  await h.click(document.querySelector('[data-rolling-play]'));
  await h.wait(()=>document.querySelector('[data-rolling-continue]'));
  assert.equal(document.querySelector('[data-rolling-play-date]').textContent,first);
  assert.equal(document.querySelector('[data-rolling-play]').disabled,true);
  const events=asset.news.filter(n=>n.date===first);
  for(let i=0;i<events.length;i++){
    await h.click(document.querySelector('[data-rolling-continue]'));
    if(i<events.length-1)assert.ok(document.querySelector('[data-rolling-continue]'),'Second same-day news remains paused');
  }
  assert.equal(document.querySelector('[data-rolling-continue]'),null);
  await h.click(document.querySelector('[data-rolling-play]'));
  const next=eventDates[1],preceding=days[days.indexOf(next)-1];
  await h.click(document.querySelector(`[data-rolling-date="${preceding}"]`));
  await h.click(document.querySelector('[data-rolling-play]'));
  await h.wait(()=>document.querySelector('[data-rolling-continue]'));
  assert.equal(document.querySelector('[data-rolling-play-date]').textContent,next);
},{fetchImpl:fetchFor(),url:'https://atlas-unit.test/'}),{timeout:15000});

test('a real prior record can render third line; missing data stays absent; malformed anchor is blocked',async()=>mounted(async h=>{
  const {RollingPage,validateRollingEdition}=await component('../../src/rolling.tsx');
  const invalid=structuredClone(publication);invalid.assets[0].rows[0].p50+=1;
  assert.throws(()=>validateRollingEdition(invalid),/첫 점/);
  const fixture=structuredClone(publication),asset=fixture.assets.find(a=>a.code==='005930');
  asset.previous={id:'EXPLICIT_TEST_ONLY_PRIOR',actualAsOf:asset.anchor.date,issuedAt:'2026-09-20T06:30:00Z',rows:structuredClone(asset.rows)};
  await h.render(h.React.createElement(RollingPage));await h.wait(()=>document.querySelector('[data-rolling-chart]'));
  assert.equal(document.querySelectorAll('[data-rolling-line=previous]').length,1);
  assert.equal(document.querySelector('[data-rolling-line=previous]').getAttribute('stroke-dasharray'),'5 5');
  assert.equal(document.querySelector('[data-rolling-line=previous]').getAttribute('stroke-width'),'1');
  assert.equal(document.querySelectorAll('[data-error-horizon]').length,4);
  assert.equal([...document.querySelectorAll('[data-error-horizon] strong')].every(n=>n.textContent==='대기'),true);
},{fetchImpl:async url=>{
  const fixture=structuredClone(publication),asset=fixture.assets.find(a=>a.code==='005930');
  asset.previous={id:'EXPLICIT_TEST_ONLY_PRIOR',actualAsOf:asset.anchor.date,issuedAt:'2026-09-20T06:30:00Z',rows:structuredClone(asset.rows)};
  return fetchFor(fixture)(url);
},url:'https://atlas-unit.test/'}),{timeout:10000});

test('stock selection preserves each playback date and tab leave pauses a running session',async()=>mounted(async h=>{
  const {RollingPage}=await component('../../src/rolling.tsx');
  await h.render(h.React.createElement(RollingPage,{active:true}));await h.wait(()=>document.querySelector('[data-rolling-chart]'));
  const first=publication.assets.find(a=>a.code==='005930'),second=publication.assets.find(a=>a.code!=='005930');
  await h.click(document.querySelector(`[data-rolling-date="${first.rows[5].date}"]`));
  await h.click(document.querySelector('.rolling-stock-button'));await h.click(document.querySelector(`[data-rolling-stock="${second.code}"]`));
  assert.equal(document.querySelector('[data-rolling-play-date]').textContent,second.anchor.date);
  await h.click(document.querySelector(`[data-rolling-date="${second.rows[10].date}"]`));
  await h.click(document.querySelector('.rolling-stock-button'));await h.click(document.querySelector('[data-rolling-stock="005930"]'));
  assert.equal(document.querySelector('[data-rolling-play-date]').textContent,first.rows[5].date);
  await h.click(document.querySelector(`[data-rolling-date="${first.anchor.date}"]`));
  await h.click(document.querySelector('[data-rolling-play]'));
  await h.render(h.React.createElement(RollingPage,{active:false}));
  assert.equal(document.querySelector('[data-rolling-page]').hidden,true);
  await h.render(h.React.createElement(RollingPage,{active:true}));
  assert.equal(document.querySelector('[data-rolling-play]').textContent,'재생');
},{fetchImpl:fetchFor(),url:'https://atlas-unit.test/'}),{timeout:10000});

test('built root starts with the current rolling edition without loading giant archived state',async()=>mounted(async h=>{
  const page=fs.readFileSync('publish/index.html','utf8'),entry=page.match(/src="(\/assets\/[^\"]+\.js)"/)[1];
  await h.act(async()=>{await import(pathToFileURL(path.resolve('publish'+entry)).href);});
  await h.wait(()=>document.querySelector('[data-rolling-home] [data-rolling-metrics]'));
  assert.equal(document.querySelector('[data-rolling-page]').dataset.rollingEdition,publication.id);
  assert.equal(document.querySelectorAll('[data-rolling-metrics]>article').length,5);
  assert.equal(h.requests.includes('/data/atlas.json'),false,'Archived input must not delay the current workspace');
  assert.equal(h.requests.includes('/data/news-wave.json.gz'),false,'Fixed-horizon forecast must not gate rolling entry');
  assert.ok(document.querySelector('a[href="/?view=legacy"]'),'Historical archive remains explicitly accessible');
  assert.equal(document.querySelector('[data-archive-notice]'),null,'Old archive metadata does not precede the new forecast');
},{fetchImpl:fetchFor(),url:'https://atlas-unit.test/'}),{timeout:10000});
