import React,{useMemo,useRef,useEffect,useState,useId} from 'react';
import {calculateFomoV2 as calculateFomo} from '../lib/fomo-v2.mjs';
import {chartDomain,eventState,forecastSummary} from '../lib/graph-explanation.mjs';
import {calendarDates} from '../lib/daily-explanation.mjs';
import {calendarPosition} from '../lib/daily-view-contract.mjs';
const pct=(v:any,d=2)=>v==null?'—':`${v>0?'+':''}${(100*v).toFixed(d)}%`;
const won=(v:any)=>v==null?'—':Math.round(v).toLocaleString('ko-KR');
const day=(d:string)=>d?.slice(5).replace('-','/');
const cache=new WeakMap<object,Map<string,any>>();
function fomoAt(input:any,code:string,date:string){let map=cache.get(input);if(!map){map=new Map();cache.set(input,map);}const known=[input.fomoInformationAsOf,input.informationAsOf,input.retrievedAt].map(Date.parse).filter(Number.isFinite);const cutoff=Math.min(Date.parse(date+'T23:59:59+09:00'),known.length?Math.max(...known):Infinity);const key=code+':'+(date<input.actualAsOf?date:input.actualAsOf)+':'+cutoff;if(!map.has(key))map.set(key,calculateFomo({input,code,date}));const value=map.get(key);return{...value,requestedDate:date,carried:date!==value.asOf};}
export function FomoPanel({input,code,date,compact=false}:any){
 const f=useMemo(()=>fomoAt(input,code,date),[input,code,date]);
 return <section className={`fomo-panel ${compact?'fomo-compact':''}`} data-fomo-code={code} data-fomo-asof={f.asOf}>
   <div className="fomo-top"><b>{f.score!==null?'FOMO':'가격 열기'} <strong>{(f.score??f.priceHeat)?.toFixed(1)??'—'}</strong><small>/100</small></b><span>핵심 자료 {f.coverage}/6</span></div>
   <p>{day(f.asOf)}까지 최근 10거래일{f.carried?' · 마지막 관측값':''} · {f.score===null?'FOMO 종합은 자료 부족':'연구용 대용 지표'}</p>
   {compact&&<div className="fomo-groups" data-fomo-core>{f.axes.map((a:any)=><div key={a.id}><span>{{attention:'관심',participation:'참여',chasing:'추격'}[a.id]}</span><b>{a.value===null?'미확보':(100*a.value).toFixed(1)}</b></div>)}</div>}
   <p className="muted">참고용 전체 FOMO 자료 {f.available}/18 · 가격 열기 항목 포함. 핵심 지수는 위 6항목을 따로 확인합니다.</p>
   {!compact&&<><p>{f.name}의 비교 기준: {f.referenceEnd} 이전 과거 창. 현재 가격 전망에 더한 값은 <b>0원</b>입니다. {f.integration.reason}.</p>
    <div className="fomo-groups" data-fomo-core>{f.axes.map((a:any)=><div key={a.id}><span>{{attention:'관심',participation:'참여',chasing:'추격'}[a.id]}</span><b>{a.value===null?'미확보':(100*a.value).toFixed(1)}</b><small>{a.required.length-a.missing.length}/{a.required.length}항목</small></div>)}</div><p>FOMO = 100 × (관심 × 참여 × 추격)의 세제곱근 · 과열 위치 {f.overheat===null?'미확보':f.overheat.toFixed(1)+'점'}</p><div className="fomo-groups">{f.groups.map((g:any)=><div key={g.name}><span>{g.name}</span><b>{g.complete?g.score.toFixed(1):'미완성'}</b><small>{g.available}/3항목</small></div>)}</div>
    <p>점수가 높을수록 해당 관측이 이 종목의 평소보다 강합니다. 추가 상승 확률이나 매수 신호는 아닙니다.</p>
    <details><summary>18개 계산값·방정식·자료 부족 이유</summary><ol className="fomo-features">{f.features.map((v:any)=><li key={v.id}><b>{v.label} · {v.score===null?'계산 유보':v.score.toFixed(1)+'점'}</b><code>{v.equation}</code><small>{v.value===null?v.reason:`원값 ${v.value.toPrecision(5)} · 비교 창 ${v.referenceCount}개${v.weight!==null?' · 중복 할인 가중치 '+v.weight.toFixed(3):''}`}</small></li>)}</ol></details>
    <p><a href="/downloads/ATLAS_FOMO_V2.md" target="_blank" rel="noreferrer">FOMO 수집·검증 보고서</a></p><p className="muted">{f.vintage} 거래규모 대용값 C×V는 실제 거래대금과 다릅니다. 기록된 출처·관측 시각이 있는 보조 자료만 사용합니다.</p>
   </>}
 </section>;
}
