import React,{useMemo,useState,useEffect,useRef} from 'react';
import {StockTrendChart} from './insights';
import {pulseRows,pulseDomain} from '../lib/forecast-pulse.mjs';
import './forecast-pulse.css';
const day=(d:string)=>d.slice(5).replace('-','/');const pct=(r:any)=>r==null?'—':`${r>0?'+':''}${(100*r).toFixed(2)}%`;
const price=(p:any)=>p==null?'—':Math.round(p).toLocaleString('ko-KR');
export function ForecastPulse(props:any){
 const {asset,version,input,cursorDate,onDateSelect,showRange,commonScale}=props;
 const [view,setView]=useState('pulse'),ref=useRef<HTMLDivElement>(null),[size,setSize]=useState({w:640,h:350});
 useEffect(()=>{if(!ref.current)return;const ob=new ResizeObserver(([e])=>setSize({w:Math.max(280,e.contentRect.width),h:Math.max(200,e.contentRect.height-65)}));ob.observe(ref.current);return()=>ob.disconnect();},[]);
 const rows=useMemo(()=>pulseRows(asset,input.calendar.sessions),[asset,input.calendar]);const selected=rows.find((r:any)=>r.date===cursorDate),dom=useMemo(()=>pulseDomain(rows,showRange),[rows,showRange]);
 const W=size.w,H=size.h,L=W<450?47:64,R=14,T=25,B=43,priceBottom=H*.63,barTop=H*.73,barBottom=H-28,zero=(barTop+barBottom)/2,cell=(W-L-R)/Math.max(1,rows.length-1);
 let domain=dom;if(dom&&commonScale){const all=version.assets.map((a:any)=>({a,d:pulseDomain(pulseRows(a,input.calendar.sessions),showRange)})).filter((x:any)=>x.d),base=rows[0].p50;domain={min:base*Math.min(...all.map((x:any)=>x.d.min/x.a.rows[0].p50)),max:base*Math.max(...all.map((x:any)=>x.d.max/x.a.rows[0].p50)),rateMax:Math.max(...all.map((x:any)=>x.d.rateMax))};}
 const x=(i:number)=>L+i*cell,y=(p:number)=>T+(domain.max-p)/(domain.max-domain.min)*(priceBottom-T),color=(r:number)=>r>0?'#ff6477':r<0?'#7cb4ff':'#aeb5c0';
 const seek=(i:number)=>onDateSelect(rows[Math.max(0,Math.min(rows.length-1,i))].date);
 return <div className="chart-wrap pulse-shell angular-pulse" ref={ref} data-full-horizon={input.end} data-pulse-stock={asset.code}>
  <div className="pulse-toolbar"><div role="group" aria-label="그래프 표현"><button aria-pressed={view==='pulse'} onClick={()=>setView('pulse')}>전망 확대</button><button aria-pressed={view==='price'} onClick={()=>setView('price')}>실제와 전체</button></div><span>거래일별 · {commonScale?'공통 눈금':'종목별 확대 눈금'}</span></div>
  {view==='price'?<StockTrendChart {...props}/>:<>
   <div className="pulse-callout" data-sign={selected?.sign??'flat'}><b>{selected?.rate!=null?`${day(selected.date)} ${selected.rate>0?'상승 ↑':selected.rate<0?'하락 ↓':'보합 —'} ${pct(selected.rate)}`:'날짜를 눌러 하루 변화 확인'}</b><span>{selected?.rate!=null?`${price(selected.p50-selected.amount)} → ${price(selected.p50)}원`:'모형 중앙값 · 미래 가격 확정 아님'}</span></div>
   {domain&&<svg viewBox={`0 0 ${W} ${H}`} role="group" tabIndex={0} aria-label={`${asset.name} 거래일별 예측 꺾은선과 하루 변화`} data-pulse-chart onKeyDown={e=>{if(e.target!==e.currentTarget)return;const i=Math.max(0,rows.findIndex((r:any)=>r.date===cursorDate)),n=e.key==='ArrowRight'?i+1:e.key==='ArrowLeft'?i-1:e.key==='Home'?0:e.key==='End'?rows.length-1:null;if(n!==null){e.preventDefault();seek(n);}}} onClick={e=>{const rect=e.currentTarget.getBoundingClientRect();seek(Math.round(((e.clientX-rect.left)/rect.width*W-L)/cell));}}>
    {[domain.min,(domain.min+domain.max)/2,domain.max].map((v:number)=><g key={v}><line x1={L} x2={W-R} y1={y(v)} y2={y(v)} className="pulse-grid"/><text x={L-6} y={y(v)+4} textAnchor="end">{price(v)}</text></g>)}
    <text x={L} y="13">모형 중앙값 · 원</text>
    {showRange&&<path d={rows.map((r:any,i:number)=>`${i?'L':'M'}${x(i)},${y(r.p90)}`).join(' ')+[...rows].reverse().map((r:any,j:number)=>`L${x(rows.length-1-j)},${y(r.p10)}`).join(' ')+'Z'} fill="var(--chart-band)" opacity=".16"/>}
    {rows.slice(1).map((r:any,j:number)=>r.rate==null?null:<line key={r.date} data-angular-segment={r.date} x1={x(j)} y1={y(rows[j].p50)} x2={x(j+1)} y2={y(r.p50)} stroke={color(r.rate)} strokeWidth={W<450?2.4:3.2}/>)}
    <line x1={L} x2={W-R} y1={zero} y2={zero} className="pulse-zero"/><text x={L} y={barTop-8}>전 거래일 대비</text><text x={L-6} y={zero+3} textAnchor="end">0%</text>
    {rows.map((r:any,i:number)=>{const h=(Math.abs(r.rate??0)/domain.rateMax)*(barBottom-barTop)/2;return <g key={r.date} role="button" tabIndex={r.date===cursorDate?0:-1} aria-label={`${r.date} ${pct(r.rate)} ${price(r.p50)}원`} onClick={e=>{e.stopPropagation();seek(i);}} onKeyDown={e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();seek(i);}}} data-pulse-date={r.date} data-rate={r.rate??''} data-session-x={x(i)} data-direction={r.sign}>
     <rect x={x(i)-cell*.48} y={T} width={cell*.96} height={H-T} fill={r.date===cursorDate?'#ffffff0a':'transparent'}/>
     <circle cx={x(i)} cy={y(r.p50)} r={r.date===cursorDate?5:W<450?2:3} fill={color(r.rate??0)} stroke={r.date===cursorDate?'#fff':'none'} strokeWidth="1"/>
     {r.rate!=null&&<rect data-session-body={r.date} x={x(i)-Math.max(2,cell*.22)} y={r.rate>0?zero-h:zero} width={Math.max(4,cell*.44)} height={h} fill={color(r.rate)}/>}
     {(i===0||i===rows.length-1||i%(W<450?6:4)===0)&&<text x={x(i)} y={H-6} textAnchor="middle">{day(r.date)}</text>}
     <title>{r.date} · {price(r.p50)}원 · {pct(r.rate)}</title>
    </g>;})}
   </svg>}
  </>}
 </div>;
}
