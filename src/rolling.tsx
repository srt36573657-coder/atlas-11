import React, {useCallback, useEffect, useId, useMemo, useRef, useState} from 'react';
import './rolling.css';

const directions: Record<string,string> = {up:'상승',flat:'보합',down:'하락'};
const finite = (v:any):v is number => typeof v==='number' && Number.isFinite(v);
const money = (v:any) => finite(v) ? Math.round(v).toLocaleString('ko-KR')+'원' : '미산출';
const percent = (v:any,places=2) => finite(v) ? `${v>0?'+':''}${v.toFixed(places)}%` : '미산출';
const stamp = (v:any) => v ? new Date(v).toLocaleString('ko-KR',{timeZone:'Asia/Seoul',hour12:false}) : '미확보';
const shortDate = (v:string) => v?.slice(5).replace('-','/') || '—';
const returnFrom = (value:any,anchor:any) => finite(value)&&finite(anchor)&&anchor>0 ? (value/anchor-1)*100 : null;
const pendingReason = (reason:any) => ({no_published_vintage:'당시에 실제 발행한 전망이 없습니다',actual_missing:'평가일의 실제 종가가 아직 없습니다',missing_actual:'평가일의 실제 종가가 아직 없습니다',NO_ELIGIBLE_PRIOR_PUBLICATION:'당시에 실제 발행한 전망이 없습니다',forecast_not_published_before_target:'발행 뒤 실제값만 채점합니다'} as Record<string,string>)[reason]??(typeof reason==='string'&&/[가-힣]/.test(reason)?reason:'발행 이력 또는 평가일 실제 종가 미확보');
export function observedStockState(asset:any){
  const prices=(asset?.actual60??[]).map((row:any)=>row.close).filter(finite);if(prices.length<21)return null;
  const close=prices.at(-1)!,ma20=prices.slice(-20).reduce((a:number,b:number)=>a+b,0)/20,return20=close/prices.at(-21)!-1;
  return {label:close>ma20&&return20>0?'Bull':close<ma20&&return20<0?'Bear':'Neutral',basis:'종목 가격 상태 · 종가와 20일 평균 및 20일 수익률 비교 · 예측 방향 아님',ma20,return20};
}
const eventDate = (event:any) => event.date ?? event.effectiveDate ?? event.koreanDate;
const eventImportant = (event:any) => ['FOMC','BOK','CPI','PPI','JOBS','JOLTS'].includes(event.kind) || event.used===false || event.important===true || event.requiresAcknowledgement===true || event.importance==='high' || (finite(event.importance)&&event.importance>=1);
const eventKey = (event:any,index=0) => `${event.id??event.name??'news'}:${index}`;
const dateList = (asset:any) => [...new Set<string>([...(asset.actual60??[]).map((r:any)=>r.date),...(asset.rows??[]).map((r:any)=>r.date)])].sort();
const downloadText = (name:string,text:string) => {
  const url=URL.createObjectURL(new Blob(['\ufeff'+text],{type:'text/csv;charset=utf-8'}));
  const link=document.createElement('a'); link.href=url;link.download=name;document.body.append(link);link.click();link.remove();
  setTimeout(()=>URL.revokeObjectURL(url),1000);
};
const downloadJson = (name:string,value:any) => {
  const url=URL.createObjectURL(new Blob([JSON.stringify(value)],{type:'application/json;charset=utf-8'}));
  const link=document.createElement('a');link.href=url;link.download=name;document.body.append(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);
};
const csvCell = (v:any) => `"${String(v??'').replaceAll('"','""')}"`;

/** Validate the display contract before rendering; never join unrelated editions. */
export function validateRollingEdition(value:any) {
  if(value?.schema!=='atlas-rolling-forecast-1'||value.horizon!==20||!value.id||!Array.isArray(value.assets)||value.assets.length!==52) throw Error('52종목 · 20거래일 발행본을 확인할 수 없습니다.');
  if(new Set(value.assets.map((a:any)=>a.code)).size!==52) throw Error('중복 종목 코드가 있습니다.');
  for(const asset of value.assets){
    if(!Array.isArray(asset.rows)||asset.rows.length!==21||asset.rows[0]?.date!==asset.anchor?.date||!finite(asset.anchor?.close)||asset.anchor.close<=0||asset.rows[0]?.p50!==asset.anchor.close) throw Error(`${asset.code}: 실제 종가와 전망 첫 점이 일치하지 않습니다.`);
    if(new Set(asset.rows.map((r:any)=>r.date)).size!==21||asset.rows.some((r:any,i:number)=>i>0&&r.date<=asset.rows[i-1].date)) throw Error(`${asset.code}: 전망 거래일 순서가 잘못되었습니다.`);
  }
  return value;
}

export function rollingGeometry(asset:any,{normalized=false,dates:sharedDates,width=900}:any={}) {
  const dates=sharedDates??dateList(asset), height=width<600?300:360,left=width<600?58:70,right=width<600?16:22,top=26,bottom=42;
  const anchor=asset.anchor.close, scale=(n:any)=>finite(n)?normalized?n/anchor*10000:n:null;
  const actual=(asset.actual60??[]).map((r:any)=>({date:r.date,value:scale(r.close)}));
  const current=asset.rows.map((r:any)=>({date:r.date,value:scale(r.p50),low:scale(r.p10),high:scale(r.p90)}));
  const previous=(asset.previous?.rows??[]).filter((r:any)=>dates.includes(r.date)).map((r:any)=>({date:r.date,value:scale(r.p50)}));
  const all=[...actual.map((r:any)=>r.value),...current.flatMap((r:any)=>[r.value,r.low,r.high]),...previous.map((r:any)=>r.value)].filter(finite);
  const low=Math.min(...all),high=Math.max(...all),padding=Math.max((high-low)*.09,anchor*(normalized?10000/anchor:1)*.003),min=low-padding,max=high+padding;
  const x=(date:string)=>left+Math.max(0,dates.indexOf(date))/Math.max(1,dates.length-1)*(width-left-right);
  const y=(value:number)=>top+(max-value)/Math.max(1e-12,max-min)*(height-top-bottom);
  const path=(rows:any[])=>{let active=false;return rows.map(row=>{if(!finite(row.value)){active=false;return '';}const command=active?'L':'M';active=true;return `${command}${x(row.date).toFixed(3)},${y(row.value).toFixed(3)}`;}).join(' ');};
  // Only a fully available interval forms a band; missing bounds never become zero.
  const band=current.every((r:any)=>finite(r.low)&&finite(r.high))?current.map((r:any,i:number)=>`${i?'L':'M'}${x(r.date)},${y(r.high)}`).join(' ')+' '+[...current].reverse().map((r:any)=>`L${x(r.date)},${y(r.low)}`).join(' ')+' Z':'';
  return {dates,width,height,left,right,top,bottom,min,max,x,y,actual,current,previous,path,band,anchorX:x(asset.anchor.date),anchorY:y(scale(anchor)!)};
}

type Player={date:string,playing:boolean,speed:number,stop:string|null,ack:string[]};
const initialPlayer=(asset:any):Player=>({date:asset.anchor.date,playing:false,speed:1000,stop:null,ack:[]});

function useChartWidth(){
  const container=useRef<HTMLDivElement>(null),[width,setWidth]=useState(900);
  useEffect(()=>{const node=container.current;if(!node)return;const measure=()=>{const size=node.getBoundingClientRect().width;if(size>0)setWidth(Math.max(280,Math.min(1100,Math.round(size))));};measure();const observer=new ResizeObserver(measure);observer.observe(node);return()=>observer.disconnect();},[]);
  return {container,width};
}
function RollingChart({asset,date,onDate}:any){
  const {container,width}=useChartWidth();
  const geometry=useMemo(()=>rollingGeometry(asset,{width}),[asset,width]),g=geometry,svg=useRef<SVGSVGElement>(null),titleId=useId();
  const current=asset.rows.find((r:any)=>r.date===date),actual=asset.actual60.find((r:any)=>r.date===date),selectedValue=actual?.close??current?.p50;
  const ticks=[0,.25,.5,.75,1].map(q=>g.min+(g.max-g.min)*q);
  const tickDates=[g.dates[0],g.dates[Math.floor(g.dates.indexOf(asset.anchor.date)/2)],asset.anchor.date,g.dates.at(-1)].filter((d,i,a)=>a.indexOf(d)===i);
  const seek=(event:React.MouseEvent<SVGSVGElement>)=>{const box=svg.current?.getBoundingClientRect();if(!box?.width)return;const position=(event.clientX-box.left)/box.width*g.width;const index=Math.max(0,Math.min(g.dates.length-1,Math.round((position-g.left)/(g.width-g.left-g.right)*(g.dates.length-1))));onDate(g.dates[index]);};
  return <div ref={container} className="rolling-chart-shell" data-rolling-chart={asset.code} data-rolling-forecast-points={asset.rows.length-1}>
    <svg ref={svg} className="rolling-chart" viewBox={`0 0 ${g.width} ${g.height}`} role="img" aria-labelledby={titleId} onClick={seek}>
      <title id={titleId}>{asset.name} 실제 {asset.actual60.length}거래일과 향후 20거래일 전망. 검정은 실제, 파랑은 이번 발행, 회색 점선은 이전 발행.</title>
      <rect width={g.width} height={g.height} fill="#ffffff"/>
      {ticks.map(t=><g key={t}><line x1={g.left} x2={g.width-g.right} y1={g.y(t)} y2={g.y(t)} stroke="#e8edf4"/><text x={g.left-9} y={g.y(t)+4} textAnchor="end">{Math.round(t).toLocaleString('ko-KR')}</text></g>)}
      {g.band&&<path d={g.band} fill="#2563eb" fillOpacity=".10" stroke="none" data-rolling-band="current"/>}
      {g.previous.length>0&&<path d={g.path(g.previous)} fill="none" stroke="#8b929e" strokeWidth="1" strokeDasharray="5 5" vectorEffect="non-scaling-stroke" data-rolling-line="previous"/>}
      <path d={g.path(g.actual)} fill="none" stroke="#141820" strokeWidth="2" strokeLinejoin="miter" vectorEffect="non-scaling-stroke" data-rolling-line="actual"/>
      <path d={g.path(g.current)} fill="none" stroke="#2563eb" strokeWidth="2" strokeLinejoin="miter" vectorEffect="non-scaling-stroke" data-rolling-line="current"/>
      <line x1={g.anchorX} x2={g.anchorX} y1={g.top} y2={g.height-g.bottom} stroke="#7b8492" strokeWidth="1" data-rolling-anchor-line/>
      <circle cx={g.anchorX} cy={g.anchorY} r="4" fill="#141820" data-rolling-anchor-point data-anchor-close={asset.anchor.close}/>
      {finite(selectedValue)&&date!==asset.anchor.date&&<circle cx={g.x(date)} cy={g.y(selectedValue)} r="5" fill="#fff" stroke={actual?'#141820':'#2563eb'} strokeWidth="2" data-rolling-selected-point/>}
      <text x={Math.min(g.width-82,Math.max(85,g.anchorX))} y={14} textAnchor="middle">종가 기준 {shortDate(asset.anchor.date)}</text>
      {tickDates.map(d=><text key={d} x={g.x(d!)} y={g.height-16} textAnchor={d===g.dates[0]?'start':d===g.dates.at(-1)?'end':'middle'}>{shortDate(d!)}</text>)}
    </svg>
    <div className="rolling-legend" aria-label="그래프 범례"><span><i data-line="actual"/>실제 종가</span><span><i data-line="current"/>이번 전망</span><span><i data-line="previous"/>직전 발행 {asset.previous?shortDate(asset.previous.actualAsOf):'없음'}</span><span><i data-line="band"/>모형 P10–P90</span></div>
  </div>;
}

function DailyReason({asset,date,player,onContinue}:any){
  const row=asset.rows.find((r:any)=>r.date===date),actual=asset.actual60.find((r:any)=>r.date===date),events=(asset.news??[]).filter((event:any)=>eventDate(event)===date),choice=row?.wave?.daily,model=asset.model??{},factors=model.factors??[],contributions=Object.entries(row?.factor36?.contributions??{}).map(([id,value]:any)=>({id,value,name:id==='F11'?'ATLAS52 가격 폭 대용값':factors.find((f:any)=>f.id===id)?.name??id})).filter((c:any)=>finite(c.value)).sort((a,b)=>Math.abs(b.value)-Math.abs(a.value));
  return <aside className="rolling-reason" data-rolling-reason={asset.code}>
    <div className="rolling-reason-top"><small>{asset.name} · 선택한 거래일</small><h3>{date}</h3><strong>{money(actual?.close??row?.p50)}</strong><span>{actual?'실제 종가':'모형 가격 중앙값'}</span></div>
    {player.stop&&<div className="rolling-news-stop" role="status"><b>중요 뉴스에서 멈췄습니다</b><p>이 날짜의 설명을 확인한 뒤 다음 사건으로 이어갑니다.</p><button onClick={onContinue} data-rolling-continue>확인 · 계속</button></div>}
    {actual?<p>{asset.name}의 보관된 실제 가격입니다. 과거 실제값에 지금 만든 전망이나 미래 뉴스를 붙이지 않습니다.</p>:<>
      <h4>이 날짜의 판단</h4><p>{choice?`${directions[choice.selected]??'미산출'} 선택 · 모형 비율 ${finite(choice.modelProbability)?(choice.modelProbability*100).toFixed(1)+'%':'미산출'}`:'방향 확률 미산출'}</p>
      {choice&&<div className="rolling-probabilities">{Object.entries(directions).map(([id,label])=><span key={id} data-selected={choice.selected===id}>{label}<b>{finite(choice.probabilities?.[id])?(choice.probabilities[id]*100).toFixed(1)+'%':'—'}</b></span>)}</div>}
      <h4>이 종목의 계산 근거</h4>{contributions.length?<ul className="rolling-contributions">{contributions.slice(0,4).map(c=><li key={c.id}><span>{c.name}</span><b>{percent(c.value*100,3)}</b></li>)}</ul>:<p>개별 요인 기여가 기록되지 않은 날짜입니다. 확인하지 못한 원인을 만들지 않습니다.</p>}
      {finite(row?.factor36?.meanLogReturn)&&<p>조건부 평균 로그수익률 {percent(row.factor36.meanLogReturn*100,3)}. 요인 기여는 모형 안의 분해이며 실제 움직임의 원인 증명이 아닙니다.</p>}
    </>}
    <h4>연결 뉴스 · {events.length}건</h4>{events.length?events.map((event:any,index:number)=><article className="rolling-event" key={eventKey(event,index)} data-rolling-event={event.id}><b>{event.name??event.title}</b><small>{eventImportant(event)?'확인 후 계속 · ':''}{event.scope?.type??event.scope??'대상 확인'} 일정</small><p>{event.used===true?'발행본에 기록된 입력입니다.':event.reason??event.deferredReason??'예정 일정은 확인했지만 비교 표본과 예상 대비 결과가 부족해 추가 가격 충격은 미산출입니다.'}</p>{(event.sources??[]).slice(0,2).map((source:any)=><a key={source.url} href={source.url} target="_blank" rel="noreferrer">{source.name??'원문 근거'} ↗</a>)}</article>):<p>이 종목에 연결된 확인 일정이 없습니다. 뉴스가 없다는 뜻이나 가격이 움직이지 않는다는 뜻은 아닙니다.</p>}
    <small className="rolling-research-note">상승·보합·하락 비율은 모형 안의 비율입니다. 실제 적중 확률과 별개입니다.</small>
  </aside>;
}

function ScoreCells({asset,score}:any){
  const by=score?.assets?.find((s:any)=>s.code===asset.code)?.horizons??{};
  return <section className="rolling-error-panel" data-rolling-errors={asset.code}><div><h3>얼마나 틀렸는가</h3><p>평가 대상 {score?.targetDate??asset.anchor.date} · 보관 종가 {score?.actualAsOf??asset.anchor.date} · 절대 오차율</p></div><div className="rolling-error-grid">{[1,5,10,20].map(h=>{const cell=by[String(h)];return <article key={h} data-error-horizon={h}><span>{h}거래일 전 전망</span><strong>{finite(cell?.ape)?cell.ape.toFixed(2)+'%':'대기'}</strong><small>{finite(cell?.ape)?`${cell.originDate} 발행 · ${money(cell.forecast)}`:pendingReason(cell?.reason)}</small></article>;})}</div><p className="rolling-small">오차율 = |당시 전망 − 실제| ÷ 실제 × 100. 미확보는 0%가 아닙니다.</p></section>;
}

function AllStocks({edition,selected,onSelect,date,onDate}:any){
  const {container,width}=useChartWidth();
  const [order,setOrder]=useState<'model'|'name'>('model'),dates=edition.assets[0].rows.map((r:any)=>r.date),height=width<600?300:380,left=width<600?54:62,right=20,top=24,bottom=36;
  const series=edition.assets.map((a:any)=>({asset:a,points:a.rows.map((r:any)=>({date:r.date,value:finite(r.p50)?r.p50/a.anchor.close*10000:null}))}));
  const values=series.flatMap((s:any)=>s.points.map((p:any)=>p.value)).filter(finite),low=Math.min(...values),high=Math.max(...values),pad=Math.max(1,(high-low)*.1),min=low-pad,max=high+pad;
  const x=(d:string)=>left+Math.max(0,dates.indexOf(d))/20*(width-left-right),y=(v:number)=>top+(max-v)/(max-min)*(height-top-bottom);
  const displayDate=dates.includes(date)?date:dates[0],rank=series.map((s:any)=>({...s,value:s.points.find((p:any)=>p.date===displayDate)?.value})).sort((a:any,b:any)=>order==='name'?a.asset.name.localeCompare(b.asset.name,'ko'):(b.value??-Infinity)-(a.value??-Infinity));
  return <section className="rolling-overlay" data-rolling-overlay><div className="rolling-section-title"><div><h3>52종목, 같은 1만원에서</h3><p>같은 발행본 · {displayDate} 모형 순서 · 추천 순위가 아닙니다</p></div><label>정렬 <select aria-label="52종목 정렬" value={order} onChange={e=>setOrder(e.target.value as any)}><option value="model">선택일 모형 수익률</option><option value="name">종목 이름</option></select></label></div>
    <div ref={container}><svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label="52종목 1만원 동시 비교"><rect width={width} height={height} fill="white"/>{[0,.25,.5,.75,1].map(q=>{const v=min+(max-min)*q;return <g key={q}><line x1={left} x2={width-right} y1={y(v)} y2={y(v)} stroke="#e8edf4"/><text x={left-8} y={y(v)+4} textAnchor="end">{Math.round(v).toLocaleString()}</text></g>;})}
    {series.sort((a:any,b:any)=>Number(a.asset.code===selected)-Number(b.asset.code===selected)).map((s:any)=><path key={s.asset.code} data-rolling-normalized-line={s.asset.code} d={s.points.map((p:any,i:number)=>finite(p.value)?`${i?'L':'M'}${x(p.date)},${y(p.value)}`:'').join(' ')} stroke={s.asset.code===selected?'#2563eb':'#8b96a8'} strokeOpacity={s.asset.code===selected?1:.38} strokeWidth={s.asset.code===selected?2.5:1} fill="none" vectorEffect="non-scaling-stroke" onClick={()=>onSelect(s.asset.code)}/>)}
    <circle cx={x(displayDate)} cy={y(rank.find((s:any)=>s.asset.code===selected)?.value??10000)} r="4" fill="#2563eb"/>{[dates[0],dates[10],dates[20]].map((d:string)=><text key={d} x={x(d)} y={height-11} textAnchor="middle">{shortDate(d)}</text>)}</svg></div>
    <label className="rolling-overlay-slider">비교 거래일 <b>{displayDate}</b><input type="range" aria-label="52종목 비교 거래일" min="0" max="20" step="1" value={dates.indexOf(displayDate)} onChange={e=>onDate(dates[Number(e.target.value)])}/></label>
    <div className="rolling-rank-grid">{rank.map((s:any,i:number)=><button key={s.asset.code} aria-pressed={selected===s.asset.code} onClick={()=>onSelect(s.asset.code)} data-rolling-rank={s.asset.code}><small>{i+1}</small><span><b>{s.asset.name}</b><em>{(s.asset.news??[]).filter((n:any)=>eventDate(n)===displayDate).map((n:any)=>n.name??n.title).join(' · ')||'이 날짜 연결 일정 없음'}</em></span><strong>{money(s.value)}<small>{percent(finite(s.value)?(s.value/10000-1)*100:null)}</small></strong></button>)}</div>
  </section>;
}

export function RollingPage({active=true}:any){
  const [edition,setEdition]=useState<any>(null),[scores,setScores]=useState<any>(null),[failure,setFailure]=useState(''),[loading,setLoading]=useState(false),[selected,setSelected]=useState('005930'),[picker,setPicker]=useState(false),[query,setQuery]=useState(''),[view,setView]=useState<'stock'|'all'>('stock'),[players,setPlayers]=useState<Record<string,Player>>({}),[pending,setPending]=useState<any>(null);
  const playerRef=useRef(players),mounted=useRef(true),editionRef=useRef(edition),timers=useRef(new Map<string,any>());playerRef.current=players;editionRef.current=edition;
  const load=useCallback(async()=>{setLoading(true);setFailure('');try{const response=await fetch('/data/rolling-forecast.json',{cache:'no-store'});if(!response.ok)throw Error('20거래일 발행본을 불러오지 못했습니다. 전체 ZIP의 data 폴더를 함께 배포해 주세요.');const next=validateRollingEdition(await response.json());const scoreResponse=await fetch('/data/rolling-scores.json',{cache:'no-store'}).catch(()=>null);const score=scoreResponse?.ok?await scoreResponse.json():null;if(!mounted.current)return;if(Object.values(playerRef.current).some(p=>p.playing||p.stop)&&editionRef.current?.id!==next.id)setPending({edition:next,scores:score});else{if(editionRef.current&&editionRef.current.id!==next.id)setPlayers({});setEdition(next);setScores(score);setPending(null);}}catch(error:any){if(mounted.current)setFailure(error.message);}finally{if(mounted.current)setLoading(false);}},[]);
  useEffect(()=>{mounted.current=true;load();return()=>{mounted.current=false;for(const timer of timers.current.values())clearTimeout(timer);timers.current.clear();};},[load]);
  useEffect(()=>{if(!active)setPlayers(current=>Object.fromEntries(Object.entries(current).map(([code,p])=>[code,{...p,playing:false}])));},[active]);
  const asset=edition?.assets.find((a:any)=>a.code===selected)??edition?.assets[0],player=asset?players[asset.code]??initialPlayer(asset):null;
  const update=(code:string,change:Partial<Player>)=>setPlayers(current=>({...current,[code]:{...(current[code]??initialPlayer(editionRef.current.assets.find((a:any)=>a.code===code))),...change}}));
  const stopAll=()=>setPlayers(current=>Object.fromEntries(Object.entries(current).map(([code,p])=>[code,{...p,playing:false}])));
  const select=(code:string)=>{stopAll();setSelected(code);setPicker(false);};
  const seek=(date:string)=>update(asset.code,{date,playing:false,stop:null});
  useEffect(()=>{
    for(const timer of timers.current.values())clearTimeout(timer);timers.current.clear();
    if(!active||!edition)return;
    for(const [code,p] of Object.entries(players)){
      if(!p.playing||p.stop)continue;const a=edition.assets.find((x:any)=>x.code===code);if(!a)continue;
      const timer=setTimeout(()=>{timers.current.delete(code);setPlayers(current=>{const latest=current[code];if(!latest?.playing||latest.stop)return current;const dates=dateList(a),index=dates.indexOf(latest.date),next=dates[index+1];if(!next)return {...current,[code]:{...latest,playing:false}};const news=(a.news??[]).filter((n:any)=>eventDate(n)===next&&eventImportant(n)),unread=news.map((n:any,i:number)=>eventKey(n,i)).find((id:string)=>!latest.ack.includes(`${next}:${id}`));return {...current,[code]:{...latest,date:next,playing:!unread,stop:unread??null}};});},p.speed);
      timers.current.set(code,timer);
    }
    return()=>{for(const timer of timers.current.values())clearTimeout(timer);timers.current.clear();};
  },[active,edition,players]);
  const continueNews=()=>{const ack=[...player!.ack,`${player!.date}:${player!.stop}`],news=asset.news.filter((n:any)=>eventDate(n)===player!.date&&eventImportant(n)),next=news.map((n:any,i:number)=>eventKey(n,i)).find((id:string)=>!ack.includes(`${player!.date}:${id}`));update(asset.code,{ack,stop:next??null,playing:!next});};
  const start=()=>{if(player!.stop)return;const dates=dateList(asset),last=player!.date===dates.at(-1),date=last?asset.anchor.date:player!.date;const events=(asset.news??[]).filter((n:any)=>eventDate(n)===date&&eventImportant(n)),unread=events.map((n:any,i:number)=>eventKey(n,i)).find((id:string)=>!player!.ack.includes(`${date}:${id}`));update(asset.code,{date,playing:!unread,stop:unread??null});};
  const exportAll=()=>downloadText(`ATLAS_52_${edition.id}.csv`,['발행ID,종목코드,종목명,날짜,예측값,상단,하단',...edition.assets.flatMap((a:any)=>a.rows.map((r:any)=>[edition.id,a.code,a.name,r.date,r.p50,r.p90,r.p10].map(csvCell).join(',')))].join('\r\n'));
  const currentScore=scores?.assets?.find((s:any)=>s.code===asset?.code)?.horizons?.['1'];
  const next=asset?.rows[1],five=asset?.rows[5],twenty=asset?.rows[20],nextChoice=next?.wave?.daily,stockState=asset?.marketState?.stock??asset?.stockState??observedStockState(asset);
  return <section className="rolling-page" hidden={!active} data-rolling-page data-rolling-edition={edition?.id??''}>
    {!edition?<div className="rolling-loading" role={failure?'alert':'status'}><h2>{failure?'전망을 읽지 못했습니다':'52종목의 새 전망을 불러옵니다'}</h2><p>{failure||'실제 종가와 20거래일 전망의 연결을 확인하고 있습니다.'}</p>{failure&&<button onClick={load}>다시 읽기</button>}</div>:<>
      <div className="rolling-heading"><div><span className="rolling-eyebrow">52종목 · 실제 종가에서 시작합니다</span><h2>시장을 읽는 더 명확한 방법</h2></div><button onClick={load} disabled={loading} aria-label="최신 롤링 발행본 확인">{loading?'확인 중…':'새 자료 확인'}</button></div>
      <div className="rolling-publication"><span>실제 종가 <b>{edition.actualAsOf}</b></span><span>발행 <b>{stamp(edition.issuedAt)}</b></span><span>{edition.dataStatus==='current_close'?'최신 확인 종가':'보관 종가 사용 · 당일 종가 미확보'}</span></div>
      <details className="rolling-trust" data-price-basis-review><summary><span className="rolling-status-dot"/>연구용 전망 · 정확도 미검증 <span>자료 상태 보기 ＋</span></summary><p>정규장 종가 기준으로 대조 중입니다. 확인한 날짜만 수정했으며, 과거 전체 기간의 시간외 가격 혼입·기업행위 조정 검증은 미완료입니다. 이전 백테스트는 이번 수정 자료의 정확도 인증이 아닙니다.</p></details>
      {edition.staleAnchor&&<p className="rolling-alert" data-rolling-stale>현재 실제 종가가 미확보라 {edition.actualAsOf} 보관 종가에서 계산한 참고 전망입니다. 출발일 다음 20거래일 중 발행 시점 뒤 날짜는 {edition.summary?.afterIssuanceFuturePoints??'미확인'}개이며, 이미 지난 날짜는 사전 예측 성적으로 채점하지 않습니다.</p>}
      {failure&&<p className="rolling-alert" role="alert">{failure} 마지막으로 읽은 발행본을 표시합니다.</p>}
      {pending&&<div className="rolling-alert" role="status">새 발행본이 있습니다. 현재 재생을 마친 뒤 표시를 전환합니다. <button onClick={()=>{stopAll();setPlayers({});setEdition(pending.edition);setScores(pending.scores);setPending(null);}}>재생 마치고 새 자료 보기</button></div>}
      <div className="rolling-toolbar"><button className="rolling-stock-button" onClick={()=>setPicker(!picker)} aria-expanded={picker} aria-controls="rolling-stock-picker">{asset.name}<small>{asset.code}</small><span aria-hidden="true">⌄</span></button><div className="rolling-view-tabs" role="group" aria-label="롤링 전망 보기"><button aria-pressed={view==='stock'} onClick={()=>setView('stock')}>종목 상세</button><button aria-pressed={view==='all'} onClick={()=>setView('all')}>52종목 · 1만원</button></div></div>
      {picker&&<div className="rolling-picker" id="rolling-stock-picker" onKeyDown={e=>{if(e.key==='Escape'){setPicker(false);document.querySelector<HTMLButtonElement>('.rolling-stock-button')?.focus();}}}><div className="rolling-picker-heading"><h3>어떤 종목을 볼까요?</h3><button onClick={()=>{setPicker(false);document.querySelector<HTMLButtonElement>('.rolling-stock-button')?.focus();}} aria-label="종목 선택 닫기">닫기</button></div><label>52종목에서 선택 <input value={query} onChange={e=>setQuery(e.target.value)} placeholder="이름·코드 필터 (선택)"/></label><div className="rolling-picker-grid">{edition.assets.filter((a:any)=>`${a.name} ${a.code} ${a.sector}`.includes(query.trim())).map((a:any)=><button key={a.code} data-rolling-stock={a.code} aria-pressed={asset.code===a.code} onClick={()=>select(a.code)}><b>{a.name}</b><small>{a.code}</small></button>)}</div></div>}
      <div className="rolling-metrics" data-rolling-metrics>
        <article><span>지금, 확인된 종가</span><strong>{money(asset.anchor.close)}</strong><small>{asset.anchor.date} · 전망 첫 점과 차이 <b data-rolling-anchor-difference>{asset.rows[0].p50-asset.anchor.close}원</b></small></article>
        <article><span>{edition.staleAnchor?'기준 다음 거래일':'다음 거래일'} · {shortDate(next?.date)}</span><strong>{directions[nextChoice?.selected]??'미산출'}</strong><small>{finite(nextChoice?.modelProbability)?`모형 비율 ${(nextChoice.modelProbability*100).toFixed(1)}%`:'확률 자료 미확보'} · 적중률 아님</small></article>
        <article><span>5거래일 뒤 · {shortDate(five?.date)}</span><strong>{money(five?.p50)}</strong><small>{percent(returnFrom(five?.p50,asset.anchor.close))} · 기준 종가 대비</small></article>
        <article><span>20거래일 뒤 · {shortDate(twenty?.date)}</span><strong>{money(twenty?.p50)}</strong><small>{percent(returnFrom(twenty?.p50,asset.anchor.close))} · 기준 종가 대비</small></article>
        <article><span>최근 1일 전망 오차</span><strong>{finite(currentScore?.ape)?currentScore.ape.toFixed(2)+'%':'평가 대기'}</strong><small>{finite(currentScore?.ape)?'실제값 기준 절대 오차율':'발행 이후 실제값·이력 미확보'}</small></article>
      </div>
      <div className="rolling-regimes"><span>시장 <b>{edition.marketState?.market?.label??'판단 미확보'}</b></span><span>업종 <b>{asset.marketState?.sector?.label??'판단 미확보'}</b></span><span>종목 <b>{stockState?.label??'판단 미확보'}</b></span><small>{stockState?.basis??'공식 시장·업종 자료와 종목 자체 가격 판단을 구분합니다.'}</small></div>
      {view==='stock'?<div className="rolling-workspace"><div className="rolling-chart-column"><div className="rolling-section-title"><h3>{asset.name}</h3><span>실제 {asset.actual60.length}일 + 미래 20거래일</span></div><RollingChart asset={asset} date={player!.date} onDate={seek}/><div className="rolling-controls"><button className="rolling-play" onClick={()=>player!.playing?update(asset.code,{playing:false}):start()} disabled={Boolean(player!.stop)} data-rolling-play>{player!.playing?'일시정지':'재생'}</button><label>속도 <select aria-label={`${asset.name} 재생 속도`} value={player!.speed} onChange={e=>update(asset.code,{speed:Number(e.target.value)})}><option value={1000}>1거래일 · 1초</option><option value={2000}>1거래일 · 2초</option><option value={3000}>1거래일 · 3초</option></select></label><span data-rolling-play-date>{player!.date}</span><button onClick={()=>seek(asset.anchor.date)}>기준일</button></div><div className="rolling-date-strip" aria-label={`${asset.name} 전망 거래일`}>{asset.rows.map((row:any,i:number)=><button key={row.date} aria-pressed={player!.date===row.date} data-rolling-date={row.date} onClick={()=>seek(row.date)}><span>{i===0?'기준':`D+${i}`}</span><b>{shortDate(row.date)}</b>{(asset.news??[]).some((n:any)=>eventDate(n)===row.date)&&<i aria-label="연결 뉴스">●</i>}</button>)}</div><p className="rolling-small">{asset.previous?`회색은 ${asset.previous.actualAsOf} 종가 기준의 실제 이전 발행본입니다.`:'이전 롤링 발행본이 아직 없습니다. 어제 전망선을 새로 지어내지 않습니다.'} 파란 띠는 모형 P10–P90 범위입니다.</p></div><DailyReason asset={asset} date={player!.date} player={player} onContinue={continueNews}/></div>:<><AllStocks edition={edition} selected={asset.code} onSelect={select} date={player!.date} onDate={seek}/><div className="rolling-controls"><button onClick={()=>player!.playing?update(asset.code,{playing:false}):start()} disabled={Boolean(player!.stop)}>{player!.playing?'일시정지':'재생'}</button><span>1거래일 · {(player!.speed/1000).toFixed(0)}초 · {player!.date}</span>{player!.stop&&<button onClick={continueNews}>중요 뉴스 확인 · 계속</button>}</div><DailyReason asset={asset} date={player!.date} player={player} onContinue={continueNews}/></>}
      <ScoreCells asset={asset} score={scores}/>
      <details className="rolling-detail"><summary>근거와 기록 · 다운로드</summary><div><p><b>사용 방식 {edition.summary?.chosenMethod??'확인 중'}</b> · {edition.summary?.methodReason??'A와 B의 비교 결과를 확인해 채택합니다.'}</p><p>발행 ID <code>{edition.id}</code><br/>과거 전망은 수정하지 않고 새 실제값에서 다시 계산합니다. 이 화면의 종목별·1만원·설명은 같은 발행 ID를 사용합니다.</p><p>원자료가 미확보인 요인은 0으로 채우지 않습니다. 최근 실제 가격으로 재출발하는 것과 예측 정확도가 입증되는 것은 별개입니다.</p><div className="rolling-downloads">{asset.csvUrl?<a href={asset.csvUrl} download data-rolling-stock-csv>{asset.name} 전망 CSV</a>:<button onClick={()=>downloadText(`ATLAS_${asset.code}_${edition.issuedAt?.slice(0,10).replaceAll('-','')}.csv`,['날짜,예측값,상단,하단',...asset.rows.map((r:any)=>[r.date,r.p50,r.p90,r.p10].map(csvCell).join(','))].join('\r\n'))}>이 종목 CSV</button>}<button onClick={exportAll} data-rolling-all-csv>52종목 통합 CSV</button>{edition.csvZipUrl&&<a href={edition.csvZipUrl} download>52개 CSV ZIP</a>}<button onClick={()=>downloadJson(`ATLAS_${edition.id}.json`,edition)} data-rolling-raw>현재 발행본 원자료</button><a href="/data/rolling-scores.json" download>오차 기록</a><a href="/downloads/ATLAS_PREDICTION_PROGRESS.md" download>예측식 비교 결과</a><a href="/downloads/ATLAS_Candidate_52.csv" download>52종목 후보 계산 · 운영 미채택</a></div></div></details>
    </>}
  </section>;
}


/** Fast entry point: archived 90 MB state is read only after opening its route. */
export function RollingHome(){
  return <main id="atlas-top" data-experience-version="10.0.0" data-rolling-home>
    <a className="skip-link" href="#rolling-main">전망 본문으로 건너뛰기</a>
    <header className="rolling-home-header"><a href="/" className="rolling-home-brand" aria-label="ATLAS 오늘 전망"><img src="/atlas-mark.svg" alt="" width="34" height="34"/><b>ATLAS</b><span>10.0</span></a><nav aria-label="주요 화면"><a aria-current="page" href="/">오늘 전망</a><a href="/?view=legacy">이전 기록 · 자료</a></nav></header>
    <div id="rolling-main"><RollingPage/></div>
    <footer className="rolling-home-footer"><p>시장이 답이다. 과거 전망은 기록이고, 확인한 실제 종가는 새로운 출발점입니다.</p><span>52종목 · 연구용 모형 · 실전 우위 미입증</span></footer>
  </main>;
}
