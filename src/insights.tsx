import React,{useMemo,useRef,useEffect,useState,useId} from 'react';
import {calculateFomo} from '../lib/fomo.mjs';
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
   <div className="fomo-top"><b>{f.score!==null?'FOMO':'가격 열기'} <strong>{(f.score??f.priceHeat)?.toFixed(1)??'—'}</strong><small>/100</small></b><span>FOMO 자료 {f.available}/18</span></div>
   <p>{day(f.asOf)}까지 최근 10거래일{f.carried?' · 마지막 관측값':''} · {f.score===null?'FOMO 종합은 자료 부족':'연구용 대용 지표'}</p>
   {!compact&&<><p>{f.name}의 비교 기준: {f.referenceEnd} 이전 과거 창. 현재 가격 전망에 더한 값은 <b>0원</b>입니다. {f.forecastIntegration.reason}.</p>
    <div className="fomo-groups">{f.groups.map((g:any)=><div key={g.name}><span>{g.name}</span><b>{g.complete?g.score.toFixed(1):'미완성'}</b><small>{g.available}/3항목</small></div>)}</div>
    <p>점수가 높을수록 해당 관측이 이 종목의 평소보다 강합니다. 추가 상승 확률이나 매수 신호는 아닙니다.</p>
    <details><summary>18개 계산값·방정식·자료 부족 이유</summary><ol className="fomo-features">{f.features.map((v:any)=><li key={v.id}><b>{v.label} · {v.score===null?'계산 유보':v.score.toFixed(1)+'점'}</b><code>{v.equation}</code><small>{v.value===null?v.reason:`원값 ${v.value.toPrecision(5)} · 비교 창 ${v.referenceCount}개${v.weight!==null?' · 중복 할인 가중치 '+v.weight.toFixed(3):''}`}</small></li>)}</ol></details>
    <p className="muted">{f.vintage} 거래규모 대용값 C×V는 실제 거래대금과 다릅니다. 기록된 출처·관측 시각이 있는 보조 자료만 사용합니다.</p>
   </>}
 </section>;
}
export function PriceStory({asset,version,explanation}:any){
 const s=forecastSummary(asset,version),f=explanation.forecast,change=explanation.actual?.change??f?.p50Change;
 const used=explanation.events.filter((e:any)=>e.used),context=explanation.events.filter((e:any)=>!e.used);
 const cause=explanation.kind==='holiday'?'휴장 · 새로운 가격 없음':explanation.kind==='actual'?'관측 종가 · 원인은 가격만으로 확정 불가':used.length?`${used.map((e:any)=>e.title).join(' · ')} — 해당 종목 분포 반영`:context.length?'예정 일정은 설명용·유보 · 가격 영향 미반영':'별도 반영 사건 없음 · 이 종목의 일반일 분포';
 return <div className="price-story" data-price-story={asset.code}>
  <div><b>{day(explanation.date)} {explanation.kind==='actual'?'실제':'모형'} 변화 {pct(change?.rate)}</b><span>{change?`${change.amount>0?'+':''}${won(change.amount)}원`:'—'}</span></div>
  <p>{cause}</p>
  {f&&<p>이 날짜 모형 범위 {won(f.p10)}~{won(f.p90)}원{f.modelDistributionComparison?` · 일반일 대비 모형 평균 차이 ${won(f.modelDistributionComparison.meanDifference)}원`:''}</p>}
  <details><summary>이 날짜의 계산 방식 · 반영 상태</summary><p>{s.flatReason}</p><p>방향 반영 {s.directional} · 변동 분포만 {s.volatilityOnly} · 설명 일정 {s.context} · 유보 {s.held}건. 중앙값 변화는 개별 뉴스의 인과 효과가 아닙니다.</p></details>
 </div>;
}
export function StockTrendChart({asset,version,input,cursorDate,onDateSelect,fitHeight=false,showRange=false,commonScale=false}:any){
 const pointer=useRef<{x:number,y:number}|null>(null);
 const ref=useRef<HTMLDivElement>(null),[size,setSize]=useState({w:400,h:340}),clipId=useId().replace(/:/g,'');
 useEffect(()=>{if(!ref.current||typeof ResizeObserver==='undefined')return;const o=new ResizeObserver(([e])=>setSize({w:Math.max(160,e.contentRect.width),h:fitHeight?Math.max(160,e.contentRect.height):340}));o.observe(ref.current);return()=>o.disconnect();},[fitHeight]);
 const W=size.w,H=fitHeight?size.h:270,L=62,R=18,top=42,bottom=H-48;
 const dates=input.calendar.sessions.filter((d:string)=>d>=input.origin&&d<=input.end),summary=forecastSummary(asset,version),anchor=summary.start;
 const source=input.assets.find((a:any)=>a.code===asset.code),actual=source.prices.filter((p:any)=>p.date>=input.origin&&p.date<=input.actualAsOf&&p.close>0&&p.quality!=='conflict');
 const overviewBase=actual.find((p:any)=>p.date===input.origin)?.close??anchor;
 const x=(d:string)=>L+Math.max(0,dates.indexOf(d))*(W-L-R)/Math.max(1,dates.length-1);
 const returns=asset.rows.map((r:any)=>({...r,p10:r.p10,p50:r.p50,p90:r.p90}));
 const domains=commonScale?version.assets.map((a:any)=>chartDomain([...a.rows,...(input.assets.find((s:any)=>s.code===a.code)?.prices??[]).filter((p:any)=>p.date>=input.origin&&p.date<=input.actualAsOf&&p.close>0&&p.quality!=="conflict").map((p:any)=>({p50:p.close}))],a.rows[0].p50,showRange)):[chartDomain([...returns,...actual.map((p:any)=>({p50:p.close}))],anchor,showRange)];
 const lo=Math.min(...domains.map((d:any)=>d.lo)),hi=Math.max(...domains.map((d:any)=>d.hi));
 const y=(price:number)=>top+(hi-(price/anchor-1))/(hi-lo)*(bottom-top);
 const overviewValues=actual.map((p:any)=>p.close/overviewBase-1),latestActual=actual.at(-1);
 const oLo=Math.min(0,...overviewValues),oHi=Math.max(0,...overviewValues),oPad=Math.max(.001,(oHi-oLo)*.12);
 const oy=(price:number)=>25+(oHi+oPad-(price/overviewBase-1))/(oHi-oLo+2*oPad)*(top-57);
 const line=(rows:any[],field:string,fy:any)=>rows.map((r:any,i:number)=>`${i?'L':'M'}${x(r.date)},${fy(r[field])}`).join(' ');
 const newsByDate=new Map();for(const p of asset.news){const list=newsByDate.get(p.date)??[];list.push(p);newsByDate.set(p.date,list);}
 const tickStep=W>=520?5:8;
 const ticks=dates.filter((_:any,i:number)=>i===dates.length-1||(i%tickStep===0&&i<dates.length-5));
 const selected=asset.rows.find((r:any)=>r.date===cursorDate),last=asset.rows.at(-1);
 const eventDates=[...newsByDate.keys()].sort();
 const hitBounds=(date:string)=>{const i=eventDates.indexOf(date),cx=x(date),left=i>0?(x(eventDates[i-1])+cx)/2:L,right=i<eventDates.length-1?(x(eventDates[i+1])+cx)/2:W-R;return {x:Math.max(cx-14,left+.5),width:Math.max(0,Math.min(cx+14,right-.5)-Math.max(cx-14,left+.5))};};

 return <div className="chart-wrap trend-chart" ref={ref} data-full-horizon={input.end} data-range-visible={String(showRange)} data-scale={commonScale?'shared':'own'}>
  <svg viewBox={`0 0 ${W} ${H}`} role="group" tabIndex={fitHeight?0:-1} data-chart-keyboard={fitHeight?'enabled':'date-grid'} onKeyDown={e=>{if(e.target!==e.currentTarget)return;const i=Math.max(0,dates.indexOf(cursorDate));const n=e.key==='ArrowRight'?Math.min(dates.length-1,i+1):e.key==='ArrowLeft'?Math.max(0,i-1):e.key==='Home'?0:e.key==='End'?dates.length-1:-1;if(n>=0){e.preventDefault();onDateSelect(dates[n]);}}} aria-describedby={`${clipId}-reading`} aria-label={`${asset.name} 실제 종가와 ${day(version.origin)} 실제 종가 기준 모형 전망`} onPointerDown={e=>{pointer.current={x:e.clientX,y:e.clientY};}} onClick={e=>{if(pointer.current&&Math.hypot(e.clientX-pointer.current.x,e.clientY-pointer.current.y)>8){pointer.current=null;return;}pointer.current=null;const rect=e.currentTarget.getBoundingClientRect();if(rect.width>0){const pos=Math.max(0,Math.min(1,((e.clientX-rect.left)*W/rect.width-L)/(W-L-R)));onDateSelect(dates[Math.round(pos*(dates.length-1))]);}}}>
   <desc id={`${clipId}-reading`}>밝은 선: 실제 종가. 색상 선: 모형 중앙값. 금색 점: 이 종목에 연결된 일정. 전체 기간은 9월 17일부터 10월 30일까지이며 날짜별 값과 이유는 아래 날짜 칸으로 확인합니다. 화면맞춤에서는 그래프에 초점을 두고 좌우 방향키로 날짜를 이동할 수 있습니다. 실제 적중률은 검증되지 않았습니다.</desc>
   <defs><clipPath id={clipId}><rect className="reveal-clip" x={L-2} y={top-5} width={W-L-R+4} height={bottom-top+10} data-entire-period="true"/></clipPath></defs>
   <g data-actual-overview={asset.code}>
    <text x={L} y={18} className="actual-caption">밝은 선 실제 · 색상 선 모형</text>
    <text x={W-R} y={18} textAnchor="end" className="actual-caption">{day(version.origin)} 기준</text>
   </g>
   {[lo,(lo+hi)/2,hi].map(v=><g key={v}><line x1={L} x2={W-R} y1={y(anchor*(1+v))} y2={y(anchor*(1+v))} stroke="var(--chart-grid)"/><text x={L-6} y={y(anchor*(1+v))+4} textAnchor="end">{pct(v)}</text></g>)}
   <line x1={L} x2={W-R} y1={y(anchor)} y2={y(anchor)} stroke="var(--chart-muted)" opacity=".5"/>
   <g clipPath={`url(#${clipId})`}>
    {showRange&&<path d={`${line(asset.rows,'p90',y)} ${[...asset.rows].reverse().map((r:any)=>`L${x(r.date)},${y(r.p10)}`).join(' ')} Z`} fill="var(--chart-band)" opacity=".25"/>}
    <path data-forecast-code={asset.code} data-forecast-end={version.end} data-forecast-values={asset.rows.map((r:any)=>r.date+":"+r.p50).join("|")} d={line(asset.rows,'p50',y)} stroke="var(--chart-forecast)" strokeWidth="2.8"  fill="none"/>
    {asset.rows.slice(1).map((r:any,j:number)=><line key={r.date} x1={x(asset.rows[j].date)} y1={y(asset.rows[j].p50)} x2={x(r.date)} y2={y(r.p50)} stroke={r.p50>=asset.rows[j].p50?"#ff6477":"#7cb4ff"} strokeWidth="2.9"/>)}
    <path data-actual-path={asset.code} d={actual.map((p:any,i:number)=>{const prev=actual[i-1],continuous=prev&&input.calendar.sessions.indexOf(p.date)===input.calendar.sessions.indexOf(prev.date)+1;return `${continuous?'L':'M'}${x(p.date)},${y(p.close)}`;}).join(' ')} stroke="var(--chart-actual)" strokeWidth="2.4" fill="none"/>
    {actual.filter((p:any)=>p.date>=version.origin).map((p:any)=><circle key={p.date} cx={x(p.date)} cy={y(p.close)} r="2.5" fill="var(--chart-actual)"/>)}
   </g>
   <line x1={x(version.origin)} x2={x(version.origin)} y1={top} y2={bottom} stroke="var(--chart-muted)" strokeDasharray="3 3" data-forecast-boundary={version.origin}/>
   <text x={W-R} y={Math.max(top+13,Math.min(bottom-8,y(last.p50)-9))} textAnchor="end" className="endpoint-label" data-endpoint={asset.code}>{day(version.end)} {pct(summary.endReturn)}</text>
   {[...newsByDate.entries()].map(([date,ps]:any)=>{const status=ps.some((p:any)=>eventState(p)==='direction')?'direction':ps.some((p:any)=>eventState(p)==='variance')?'variance':ps.some((p:any)=>eventState(p)==='held')?'held':'context';return <g key={date} role="button" tabIndex={fitHeight?0:-1} aria-label={`${date} · 예정 일정 ${ps.length}건 · ${ps.map((p:any)=>p.name).join(' / ')}`} onKeyDown={e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();e.stopPropagation();onDateSelect(date);}}} onClick={e=>{e.stopPropagation();onDateSelect(date);}} className="event-marker" data-event-state={status}><rect className="event-hit-target" x={hitBounds(date).x} y={bottom+1} width={hitBounds(date).width} height="24" fill="transparent" pointerEvents="all"/><circle cx={x(date)} cy={bottom+13} r={status==='direction'?4:3} fill={status==='direction'?'var(--chart-event)':status==='variance'?'var(--chart-actual)':'var(--surface)'} stroke={status==='held'?'var(--negative)':'var(--chart-event)'}><title>{[date,status==='direction'?'방향 반영':status==='variance'?'변동 분포만':status==='held'?'유보':'설명 일정',ps.map((p:any)=>p.name).join(' / ')].join(' · ')}</title></circle></g>;})}
   <line className="play-cursor" x1={x(cursorDate)} x2={x(cursorDate)} y1={22} y2={bottom+17} stroke="var(--chart-cursor)" strokeWidth="1"/>
   {selected&&<circle cx={x(cursorDate)} cy={y(selected.p50)} r="4" fill="var(--chart-forecast)"/>}
   {ticks.map((d:string)=><text key={d} data-axis-date={d} x={x(d)} y={H-15} textAnchor="middle">{day(d)}</text>)}
   <text x={L} y={H-1} className="event-caption">{"● 방향　● 분포만　○ 설명·유보 · 날짜 선택으로 확인"}</text>
  </svg>

 </div>;
}

export function ChartReadingPanel({asset,version,input,cursorDate,onDateSelect}:any){
 const dates=calendarDates(input.origin,input.end),sessions=new Set(input.calendar.sessions);
 const source=input.assets.find((a:any)=>a.code===asset.code);
 const actual=(source?.prices??[]).filter((p:any)=>p.date>=input.origin&&p.date<=input.actualAsOf&&p.close>0&&p.quality!=='conflict');
 const actualByDate=new Map(actual.map((r:any)=>[r.date,r])),savedByDate=new Map(asset.rows.map((r:any)=>[r.date,r]));
 const readablePrice=(value:any)=>typeof value==='number'&&Number.isFinite(value)&&value>0?`${won(value)}원`:'—';
 const selected:any=savedByDate.get(cursorDate),selectedActual:any=actualByDate.get(cursorDate),isHoliday=!sessions.has(cursorDate);
 const referenceDate=isHoliday?dates.filter((d:string)=>d<cursorDate&&sessions.has(d)).at(-1):null;
 const referenceActual:any=referenceDate?actualByDate.get(referenceDate):null,referenceModel:any=referenceDate?savedByDate.get(referenceDate):null;
 const newsByDate=new Map();for(const p of asset.news){const list=newsByDate.get(p.date)??[];list.push(p);newsByDate.set(p.date,list);}
 const dateEvents=newsByDate.get(cursorDate)??[],eventDates=[...newsByDate.keys()].sort();
 return <div className="chart-reading-tools" data-chart-reading={asset.code}>
   <details className="chart-reading-panel">
    <summary><span>{day(cursorDate)} {isHoliday?'휴장':selectedActual?'실제':'모형'}</span><strong>{isHoliday?'참고값 보기':readablePrice(selectedActual?.close??selected?.p50)}</strong><span className="chart-reading-label">값·일정·표 ▾</span></summary>
    <div className="chart-reading-body">
     <section aria-label={`${asset.name} ${cursorDate} 저장된 값`} className="chart-date-readout">
      <h4>{asset.name} · <time dateTime={cursorDate}>{cursorDate}</time></h4>
      {isHoliday?<p data-holiday-reference>휴장일 · 새 종가 없음.{referenceDate?<> {referenceDate} 거래일 참고: 실제 {readablePrice(referenceActual?.close)} · 모형 {readablePrice(referenceModel?.p50)}</>:' 기간 안의 직전 거래일 자료 없음.'}</p>:<dl><div><dt>실제 종가</dt><dd>{readablePrice(selectedActual?.close)}</dd></div><div><dt>모형 중앙값</dt><dd>{readablePrice(selected?.p50)}</dd></div><div><dt>P10~P90</dt><dd>{readablePrice(selected?.p10)} ~ {readablePrice(selected?.p90)}</dd></div></dl>}
     </section>
     <p id={`chart-range-note-${asset.code}`} className="chart-range-note" data-range-explanation>P10~P90는 저장된 모형 분포의 10~90백분위 범위입니다. 실제 주가가 이 안에 들어올 확률 80%를 검증했다는 뜻은 아닙니다. 범위 표시는 그래프 아래 선택 항목에서 바꿀 수 있습니다.</p>
     <section className="chart-date-events" aria-label={`${cursorDate} 이 종목 일정`}><h4>선택 날짜 일정 {dateEvents.length}건</h4>{dateEvents.length?<ul>{dateEvents.map((p:any,i:number)=><li key={p.id??i}><b>{p.name}</b><span>{eventState(p)==='direction'?'방향 반영':eventState(p)==='variance'?'분포만 반영':eventState(p)==='held'?'판단 유보':'설명용 일정'}</span></li>)}</ul>:<p>연결된 일정이 없습니다.</p>}</section>
     <details className="chart-event-list"><summary>일정 날짜를 큰 버튼으로 선택</summary><div>{eventDates.map((date:string)=><button key={date} type="button" aria-pressed={date===cursorDate} onClick={()=>onDateSelect(date)}>{day(date)} · {newsByDate.get(date).length}건</button>)}</div></details>
     <details className="chart-data-table"><summary>날짜별 저장값 표 · {dates.length}일</summary><p>거래일 결측은 —로 표시합니다. 휴장일 참고값은 새 관측이 아니며 기준 날짜를 함께 표시합니다.</p><div className="chart-data-scroll" tabIndex={0} role="region" aria-label={`${asset.name} 날짜별 저장값 표 스크롤`}><table><caption>{asset.name} 실제 종가와 저장된 모형 값 · 원</caption><thead><tr><th scope="col">날짜</th><th scope="col">구분</th><th scope="col">실제</th><th scope="col">중앙값</th><th scope="col">P10</th><th scope="col">P90</th><th scope="col">휴장 참고</th></tr></thead><tbody>{dates.map((date:string)=>{const a:any=actualByDate.get(date),m:any=savedByDate.get(date),holiday=!sessions.has(date);const previous=holiday?dates.filter((d:string)=>d<date&&sessions.has(d)).at(-1):null;const pa:any=previous?actualByDate.get(previous):null,pm:any=previous?savedByDate.get(previous):null;return <tr key={date} aria-current={date===cursorDate?'date':undefined}><th scope="row"><button type="button" onClick={()=>onDateSelect(date)} aria-label={`${date} 선택`}>{date}</button></th><td>{holiday?'휴장':'거래일'}</td><td>{holiday?'—':readablePrice(a?.close)}</td><td>{holiday?'—':readablePrice(m?.p50)}</td><td>{holiday?'—':readablePrice(m?.p10)}</td><td>{holiday?'—':readablePrice(m?.p90)}</td><td>{holiday&&previous?`${previous} · 실제 ${readablePrice(pa?.close)} · 모형 ${readablePrice(pm?.p50)}`:'—'}</td></tr>;})}</tbody></table></div></details>
    </div>
   </details>
  </div>;
}
