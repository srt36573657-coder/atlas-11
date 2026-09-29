import fs from 'node:fs/promises';import {gzipSync} from 'node:zlib';import {clientState} from '../lib/service.mjs';
const full=JSON.parse(await fs.readFile('public/data/daily-movement.json'));
const candidate=clientState({versions:[full.candidate],active:full.candidate.id,original:full.candidate.id}).versions[0];
const display={...full,candidate,displayOnly:true};
for(const a of candidate.assets){const original=full.candidate.assets.find(x=>x.code===a.code);if(JSON.stringify(a.rows.map(r=>[r.date,r.p50,r.dailyMovement]))!==JSON.stringify(original.rows.map(r=>[r.date,r.p50,r.dailyMovement])))throw Error('Display projection changed daily calculation');}
const raw=JSON.stringify(display);if(Buffer.byteLength(raw)>=10000000)throw Error('Display projection too large');await fs.writeFile('public/data/daily-movement-display.json',raw);console.log(JSON.stringify({dailyDisplayBytes:Buffer.byteLength(raw),rowsPreserved:true}));

await fs.writeFile('public/data/daily-movement-display.json.gz',gzipSync(raw,{level:9}));
