import test from 'node:test';
import assert from 'node:assert/strict';
import {buildSmartGuide,filterStocks,readWatchlist,saveWatchlist,WATCHLIST_KEY} from '../lib/smart-view.mjs';
const row=(date,rate,low=90,high=110)=>({date,kind:'forecast',events:[],forecast:{p50:100,p10:low,p90:high,p50Change:{rate,amount:rate*100}}});
test('smart dates exclude actual and closed days, preserve inputs and resolve ties by earliest date',()=>{
 const rows=[row('2026-10-03',-.04,70,140),row('2026-10-02',.04,70,140),{...row('2026-10-01',.9,1,999),kind:'actual'},
 {...row('2026-10-04',.8,1,999),kind:'holiday'},row('2026-09-30',.01)];
 rows[4].events=[{title:'기업 일정',used:false}];rows[1].events=[{title:'발표',used:true}];
 const before=structuredClone(rows),g=buildSmartGuide(rows,'2026-09-23','2026-09-29');
 assert.equal(g.next.date,'2026-09-30');assert.equal(g.next.used,0);assert.equal(g.change.date,'2026-10-02');
 assert.equal(g.change.rate,.04);assert.equal(g.range.date,'2026-10-02');assert.deepEqual(rows,before);
 assert.equal(buildSmartGuide(rows,'2026-09-23','2026-10-02').next,null);
});
test('flat, invalid and missing forecasts never create an invented significant date',()=>{
 const rows=[row('2026-10-01',0,100,100),row('2026-10-02',NaN,null,200),{date:'2026-10-03',kind:'missing'}];
 const g=buildSmartGuide(rows,'2026-09-23','2026-09-23');assert.equal(g.change,null);assert.equal(g.range,null);assert.equal(g.next,null);
});
test('filters preserve stock order, combine normalized search and company scope without cross-company leakage',()=>{
 const a=[{name:'삼성전자',sector:'반도체',code:'005930',news:[{scope:{type:'company',codes:['005930']},used:false}]},
 {name:'SK',sector:'지주',code:'034730',news:[{scope:{type:'company',codes:['005930']},used:true}]},
 {name:'삼성카드',sector:'금융',code:'029780',news:[{kind:'CPI',scope:{type:'market'},used:true}]}];
 assert.deepEqual(filterStocks(a,{query:' 삼 성 전 자 '}).map(v=>v.code),['005930']);
 assert.deepEqual(filterStocks(a,{query:'sk'}).map(v=>v.code),['034730']);
 assert.deepEqual(filterStocks(a,{lens:'specific'}).map(v=>v.code),['005930']);
 assert.deepEqual(filterStocks(a,{lens:'used'}).map(v=>v.code),['029780']);
 assert.deepEqual(filterStocks(a,{lens:'watchlist',watchlist:['029780','005930']}).map(v=>v.code),['005930','029780']);
});
test('watchlist survives storage failures, removes unknown values and keeps a separate storage key',()=>{
 const data=new Map(),s={getItem:k=>data.get(k),setItem:(k,v)=>data.set(k,v)};
 assert.ok(saveWatchlist(s,['005930','005930','bad']));assert.equal(data.size,1);assert.ok(data.has(WATCHLIST_KEY));
 assert.deepEqual(readWatchlist(s,['005930']),['005930']);data.set(WATCHLIST_KEY,'{broken');assert.deepEqual(readWatchlist(s,['005930']),[]);
 assert.equal(saveWatchlist({setItem(){throw Error('quota');}},['005930']),false);
 assert.deepEqual(readWatchlist({getItem(){throw Error('denied');}},['005930']),[]);
});
