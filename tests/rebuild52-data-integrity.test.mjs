import test from 'node:test';
import assert from 'node:assert/strict';
import {eventsAsOf,pricesAsOf} from '../lib/evidence.mjs';
import {gateEvents} from '../lib/news-engine.mjs';
import {mergeNews} from '../lib/news-sources.mjs';
import {parseNaver} from '../lib/market-data.mjs';

const cutoff='2026-09-17T07:00:00Z',later='2026-09-24T07:00:00Z';
const base={id:'A',name:'Official event',kind:'TEST',status:'scheduled',announcementDate:'2026-10-01',targetDate:'2026-10-01',availableAt:'2026-09-01T00:00:00Z',sources:[{url:'https://issuer.example/event'}],scope:{type:'company',codes:['000001']}};
const input={assets:[{code:'000001',name:'A',sector:'A'}],calendar:{sessions:['2026-09-17','2026-10-01','2026-10-02']},end:'2026-10-30',events:[]};

test('an unrelated later revision cannot collapse same-ID conflicts at an earlier cutoff',()=>{
 const events=[base,{...base,targetDate:'2026-10-02'}],data={...input,events,newsRevisions:[{id:'unrelated',at:later,before:null,after:{id:'unrelated'}}]};
 assert.equal(eventsAsOf(data,cutoff).length,2);
 assert.equal(gateEvents(data,'2026-09-17',cutoff).accepted.length,0);
 assert.equal(gateEvents({...input,events},'2026-09-17',cutoff).accepted.length,0);
 assert.deepEqual(data.events,events);
});

test('a replay changes the journaled duplicate member and preserves the conflicting member',()=>{
 const before=structuredClone(base),after={...base,targetDate:'2026-10-02',availableAt:later},other={...base,name:'Different concurrent record'};
 const data={...input,events:[after,other],newsRevisions:[{id:base.id,at:later,before,after}]};
 const old=eventsAsOf(data,cutoff);
 assert.equal(old.length,2);assert.ok(old.some(e=>e.name===other.name));assert.ok(old.some(e=>e.targetDate===before.targetDate));
 assert.equal(gateEvents(data,'2026-09-17',cutoff).accepted.length,0);
});

test('equal-time revisions unwind in reverse journal order, including inserted events',()=>{
 const first={...base,targetDate:'2026-10-01',availableAt:later},second={...first,targetDate:'2026-10-02'};
 const data={...input,events:[second],newsRevisions:[{at:later,id:base.id,before:null,after:first},{at:later,id:base.id,before:first,after:second}]};
 assert.deepEqual(eventsAsOf(data,cutoff),[]);
 assert.deepEqual(eventsAsOf(data,later),[second]);
});

test('price replay replaces complete rows and reverses only explicitly journaled insertions',()=>{
 const before={date:'2026-09-17',close:90},after={...before,close:100,quality:'conflict',futureOnly:'introduced'},inserted={date:'2026-09-18',close:105};
 const data={assets:[{code:'000001',prices:[after,inserted]}],priceRevisions:[{code:'000001',date:before.date,at:later,beforeRow:before,afterRow:after},{code:'000001',date:inserted.date,at:later,beforeRow:null,afterRow:inserted}]};
 assert.deepEqual(pricesAsOf(data,cutoff)[0].prices,[before]);
 assert.deepEqual(data.assets[0].prices,[after,inserted]);
 assert.deepEqual(pricesAsOf({...data,priceRevisions:[]},cutoff),data.assets);
});

test('collection revisions preserve the actual assigned after state and do not backdate new events',()=>{
 const first=mergeNews({...input,events:[]},[base],[],later);
 assert.deepEqual(first.newsRevisions[0].after,first.events[0]);
 assert.equal(first.newsRevisions[0].before,null);assert.equal(first.events[0].availableAt,later);
 assert.deepEqual(eventsAsOf(first,cutoff),[]);
 const second=mergeNews({...input,events:[base]},[{...base,targetDate:'2026-10-02'}],[],later);
 assert.deepEqual(second.newsRevisions[0].after,second.events[0]);
 assert.equal(second.newsRevisions[0].after.availableAt,later);
 assert.deepEqual(eventsAsOf(second,cutoff),[base]);
});

test('changed eligibility evidence is a revision while observation-only checks are idempotent',()=>{
 const initial={...input,events:[{...base,sources:[{url:base.sources[0].url,sourceBodyRead:true,observedAt:cutoff}]}]};
 const checked=mergeNews(initial,[{...initial.events[0],sources:[{...initial.events[0].sources[0],observedAt:later}]}],[],later);
 assert.equal(checked.newsRevisions.length,0);
 const changed=mergeNews(initial,[{...initial.events[0],materialityEvidence:{verified:true,economicChannel:'contract'}}],[],later);
 assert.equal(changed.newsRevisions.length,1);assert.deepEqual(eventsAsOf(changed,cutoff),initial.events);
});

const xml=(code,rows)=>`<protocol><chartdata symbol="${code}">${rows.map(r=>`<item data="${r}"/>`).join('')}</chartdata></protocol>`;
const sessions=['2026-09-17','2026-09-18'];
test('NAVER validates symbol, OHLC bounds, numeric fields, calendar dates and whole response',()=>{
 const good='20260917|90|110|85|100|500';
 assert.equal(parseNaver(xml('005930',[good]),'005930','2026-09-17',sessions)[0].close,100);
 for(const body of [xml('000660',[good]),'<item data="'+good+'"/>',xml('005930',['20260917|90|99|85|100|500']),xml('005930',['20260917|90|110|85|100|NaN']),xml('005930',['20260230|90|110|85|100|500']),xml('005930',['20260917|0|0|0|100|500'])])assert.throws(()=>parseNaver(body,'005930','2026-09-17',sessions));
 assert.equal(parseNaver(xml('005930',['20260917|0|0|0|100|0']),'005930','2026-09-17',sessions)[0].close,100);
});

test('NAVER duplicate conflicts fail atomically and identical rows do not double count',()=>{
 const a='20260917|90|110|85|100|500',b='20260917|90|110|85|101|500';
 assert.equal(parseNaver(xml('005930',[a,a]),'005930','2026-09-17',sessions).length,1);
 assert.throws(()=>parseNaver(xml('005930',[a,b]),'005930','2026-09-17',sessions));
 const unsorted=xml('005930',['20260918|100|110|90|101|550',a]);
 assert.deepEqual(parseNaver(unsorted,'005930','2026-09-18',sessions).map(r=>r.date),sessions);
 assert.equal(parseNaver(unsorted,'005930','2026-09-17',sessions).length,1);
});
