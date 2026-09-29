import fs from'node:fs/promises';import{currentFomoAudit}from'../lib/completion-fomo.mjs';
const {input}=JSON.parse(await fs.readFile('public/data/atlas.json','utf8'));
const audit=currentFomoAudit(input,{now:new Date()});
await fs.writeFile('reports/prediction-candidate/fomo52.json',JSON.stringify(audit,null,2));
console.log(JSON.stringify({stocks:audit.stocks52.length,fullFomo:audit.fullFomoCount,priceHeat:audit.partialPriceHeatCount,missing:[...new Set(audit.stocks52.flatMap(s=>s.missing))]}));
