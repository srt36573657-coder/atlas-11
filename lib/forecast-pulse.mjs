// Presentation statistics only. Saved forecast prices and the numerical engine are immutable.
export function pulseRows(asset,sessions){
 const seen=new Set();for(const row of asset.rows){if(seen.has(row.date))throw Error('Duplicate forecast date');seen.add(row.date);}
 const rows=asset.rows.filter(r=>sessions.includes(r.date)).sort((a,b)=>a.date.localeCompare(b.date));
 return rows.map((r,i)=>{const prev=rows[i-1],valid=Number.isFinite(r.p50)&&r.p50>0,consecutive=prev&&sessions.indexOf(r.date)===sessions.indexOf(prev.date)+1&&sessions.includes(r.date),rate=valid&&prev?.p50>0&&consecutive?r.p50/prev.p50-1:null;return{...r,rate,amount:rate===null?null:r.p50-prev.p50,sign:rate===null?'missing':rate>0?'up':rate<0?'down':'flat'};});
}
export function pulseDomain(rows,range=false){
 const values=rows.flatMap(r=>range?[r.p10,r.p50,r.p90]:[r.p50]).filter(x=>Number.isFinite(x)&&x>0);
 if(!values.length)return null;const min=Math.min(...values),max=Math.max(...values),pad=Math.max((max-min)*.15,max*.0001);return{min:min-pad,max:max+pad,rateMax:Math.max(.0001,...rows.map(r=>Math.abs(r.rate??0)))*1.15};
}
export function pulseTurns(rows){return rows.filter((r,i)=>i>1&&Number.isFinite(r.rate)&&Number.isFinite(rows[i-1].rate)&&r.rate*rows[i-1].rate<0).map(r=>r.date);}
