// Read-only navigation over saved per-company daily explanations.
// Never draws paths, modifies forecasts, infers causal news effects or ranks stocks.
import {appliesTo,scopeOf} from './news-scope.mjs';
export const WATCHLIST_KEY='atlas-watchlist-v1';
const finite=x=>typeof x==='number'&&Number.isFinite(x);
const clean=s=>String(s??'').normalize('NFKC').replace(/\s+/g,'').toLocaleLowerCase('ko-KR');
export function readWatchlist(storage,codes){
  try {const value=JSON.parse(storage?.getItem(WATCHLIST_KEY)??'[]');return Array.isArray(value)?[...new Set(value.filter(code=>typeof code==='string'&&codes.includes(code)))]:[];}
  catch{return [];}
}
export function saveWatchlist(storage,codes){
  try {if(!storage)return false;storage.setItem(WATCHLIST_KEY,JSON.stringify([...new Set(codes)]));return true;}
  catch{return false;}
}
export function matchesLens(asset,lens,watchlist=[]){
  if(lens==='watchlist')return watchlist.includes(asset.code);
  const news=(asset.news??[]).filter(n=>appliesTo(n,asset));
  if(lens==='specific')return news.some(n=>['company','sector'].includes(scopeOf(n).type));
  if(lens==='used')return news.some(n=>n.used===true);
  return true;
}
export function filterStocks(assets,{query='',lens='all',watchlist=[]}={}){
  const needle=clean(query);
  return assets.filter(a=>clean(`${a.name} ${a.sector} ${a.code}`).includes(needle)&&matchesLens(a,lens,watchlist));
}
export function buildSmartGuide(rows,origin,selectedDate){
  const ordered=[...rows].sort((a,b)=>a.date.localeCompare(b.date));
  const next=ordered.find(r=>r.date>selectedDate&&r.events?.length>0)??null;
  let change=null,range=null;
  for(const r of ordered){
    if(r.kind!=='forecast'||r.date<=origin||r.forecast?.anchor)continue;
    const f=r.forecast,rate=f?.p50Change?.rate;
    if(finite(f?.p50)&&f.p50>0&&finite(rate)&&Math.abs(rate)>1e-12&&(!change||Math.abs(rate)>Math.abs(change.rate)))
      change={date:r.date,rate,amount:f.p50Change.amount};
    if(finite(f?.p10)&&finite(f?.p50)&&finite(f?.p90)&&f.p10>0&&f.p10<=f.p50&&f.p50<=f.p90){
      const width=f.p90-f.p10;
      if(width>0&&(!range||width>range.width))range={date:r.date,lower:f.p10,upper:f.p90,width};
    }
  }
  return {next:next?{date:next.date,title:next.events.map(e=>e.title).join(' · '),events:next.events.length,used:next.events.filter(e=>e.used).length}:null,
    change,range,basis:'저장된 종목별 모형 · 실제 적중률이나 매수 순위 아님'};
}
