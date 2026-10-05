import fs from 'node:fs/promises';
import path from 'node:path';
import {rollingHash} from '../lib/rolling-operation.mjs';
import {mergeReviewedSessionPrices} from '../lib/reviewed-session-prices.mjs';
const raw=await fs.readFile('public/data/atlas.json','utf8'),bundle=JSON.parse(raw),proposal=JSON.parse(await fs.readFile('reports/rolling/press-price-proposal.json','utf8'));
const before=rollingHash(bundle.input),at=new Date().toISOString(),hashes=[];
for(const r of proposal.rows){const p=path.resolve(r.rawSnapshotPath);if(!p.startsWith(path.resolve('reports')+path.sep))throw Error('RAW_PATH');const h=rollingHash(await fs.readFile(p));if(h!==r.rawHash)throw Error('RAW_HASH');hashes.push(h);}
const result=mergeReviewedSessionPrices(bundle.input,proposal,{expectedHash:before,now:at,verifiedHashes:hashes});
await fs.mkdir('reports/rolling/session-imports',{recursive:true});
await fs.writeFile('reports/rolling/session-imports/'+before+'.json',JSON.stringify(bundle.input),{flag:'wx'}).catch(e=>{if(e.code!=='EEXIST')throw e;});
if(await fs.readFile('public/data/atlas.json','utf8')!==raw)throw Error('CONCURRENT_EDIT');
await fs.writeFile('public/data/atlas.json.next',JSON.stringify({...bundle,input:result.input}));await fs.rename('public/data/atlas.json.next','public/data/atlas.json');await fs.writeFile('public/data/input.json',JSON.stringify(result.input));
const report={at,beforeInputHash:before,afterInputHash:rollingHash(result.input),today:proposal.date,stocks:result.input.assets.length,observations:proposal.rows.length,newJournalRows:result.input.priceRevisions.length-(bundle.input.priceRevisions?.length??0),originalSHA256:rollingHash(bundle.original),historyCompletelyRepaired:false};
await fs.writeFile('reports/rolling/session-imports/latest.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report));
