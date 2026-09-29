// Quarantined retrospective experiment. Never bypasses production factor eligibility.
export function laggedMacro(rows,date,{lagDays=7,maxAgeDays=30}={}){
 if(!Number.isInteger(lagDays)||lagDays<1)throw Error('INVALID_PUBLICATION_LAG');
 const cutoff=new Date(Date.parse(date+'T00:00:00Z')-lagDays*86400000).toISOString().slice(0,10);
 const usable=rows.filter(r=>r.date<=cutoff&&Number.isFinite(r.value)).sort((a,b)=>a.date.localeCompare(b.date));
 const last=usable.at(-1);if(!last||Date.parse(date)-Date.parse(last.date)>maxAgeDays*86400000)return null;
 const same=usable.filter(r=>r.date===last.date);if(same.some(r=>r.value!==last.value))throw Error('MACRO_SOURCE_CONFLICT');
 return {...last,lagDays,publicationLagIsAssumption:true,pointInTimeVerified:false};
}
export function macroDesign(examples,series){
 const rows=[];for(const r of examples){const observations=series.map(s=>laggedMacro(s.rows,r.date));if(observations.every(Boolean))rows.push({...r,x:[...r.x,...observations.map(o=>o.value)]});}
 return rows;
}
export function macroScenario(examples,series,origin){
 return {selected:series.map(s=>{const current=laggedMacro(s.rows,origin);if(!current)throw Error('CURRENT_MACRO_MISSING');return{factorId:s.factorId,current:{...current,scenarioMode:'carry'},byTargetDate:Object.fromEntries(examples.map(r=>[r.date,laggedMacro(s.rows,r.date)?.value??null]))};})};
}
