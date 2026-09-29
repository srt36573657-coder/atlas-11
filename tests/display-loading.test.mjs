import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createHash,webcrypto} from 'node:crypto';
import {gzipSync} from 'node:zlib';
import {IDBFactory} from 'fake-indexeddb';
import {initialState,clientState} from '../lib/service.mjs';
import {DISPLAY_SCHEMA,createDisplayBundle,displayStateFromBundle} from '../lib/display-bundle.mjs';
import {createAtlasFetch} from '../scripts/drop-chunk-loader.mjs';
const hash=x=>createHash('sha256').update(x).digest('hex');
let seq=0;
async function storage(){globalThis.indexedDB=new IDBFactory();Object.defineProperty(globalThis,'crypto',{value:webcrypto,configurable:true});return import(`../src/storage.mjs?display-test=${++seq}`);}
function fixture(){
 const codes=['005930','000660'],input={schema:2,newsSchema:1,origin:'2026-09-17',end:'2026-10-30',actualAsOf:'2026-09-18',informationAsOf:'2026-09-18T08:00:00Z',events:[],calendar:{sessions:['2026-09-17','2026-09-18','2026-09-21','2026-10-30']},assets:codes.map(code=>({code,name:code,sector:'semi',prices:[{date:'2026-09-17',close:100},{date:'2026-09-18',close:101}]}))};
 const version={id:'2026-09-17-00000001',origin:input.origin,end:input.end,modelVersion:'atlas-news-8.1.0',createdAt:'2026-09-17T08:00:00Z',informationCutoff:'2026-09-17T08:00:00Z',assets:codes.map(code=>({code,name:code,sector:'semi',originPrice:100,news:[],rows:[{date:'2026-09-18',p50:101,p10:90,p90:112,numericalPrecision:{fullEvidence:'retained'}},{date:'2026-09-21',p50:102,p10:90,p90:115},{date:'2026-10-30',p50:110,p10:80,p90:130}]}))};
 const bundle={input,original:version,candidate:structuredClone(version),priorVersions:[],evaluationLedger:[]},raw=Buffer.from(JSON.stringify(bundle)),s=clientState(initialState(bundle));
 const projection={schema:DISPLAY_SCHEMA,displayOnly:true,sourceSHA256:hash(raw),sourceBytes:raw.length,fullURL:'/data/atlas-full.json'};
 const {input:_,versions,...displayState}=s;
 const display={displayProjection:projection,input,original:versions[0],candidate:versions[0],displayState,versionMetadata:versions.map(v=>({id:v.id,assets:[],detailLoaded:false}))};
 return {bundle,raw,display};
}
async function dbGet(key){return new Promise((resolve,reject)=>{const r=indexedDB.open('atlas-news-v3',1);r.onsuccess=()=>{const db=r.result,t=db.transaction('records','readonly'),q=t.objectStore('records').get(key);q.onsuccess=()=>resolve(q.result);t.oncomplete=()=>db.close();};r.onerror=()=>reject(r.error);});}
async function dbPut(key,value){return new Promise((resolve,reject)=>{const r=indexedDB.open('atlas-news-v3',1);r.onsuccess=()=>{const db=r.result,t=db.transaction('records','readwrite');t.objectStore('records').put(value,key);t.oncomplete=()=>{db.close();resolve();};t.onerror=()=>reject(t.error);};});}

test('real display transport preserves 52 complete paths, all 17 IDs and untouched engine input',()=>{
 const raw=fs.readFileSync(new URL('../public/data/atlas.json',import.meta.url)),b=JSON.parse(raw),before=JSON.stringify(b),s=clientState(initialState(b)),d=createDisplayBundle(b,s,{sourceSHA256:hash(raw),sourceBytes:raw.length}),v=displayStateFromBundle(d);
 assert.equal(v.versions.length,17);assert.deepEqual(v.versions.map(x=>x.id),s.versions.map(x=>x.id));assert.deepEqual(d.input,b.input);assert.equal(JSON.stringify(b),before);assert.ok(v.sealedStudy.archiveDeferred);
 for(const reference of [b.original,b.candidate]){const projected=v.versions.find(x=>x.id===reference.id);assert.equal(projected.assets.length,52);for(const a of reference.assets){const p=projected.assets.find(x=>x.code===a.code);assert.deepEqual(p.rows.map(r=>[r.date,r.p10,r.p50,r.p90]),a.rows.map(r=>[r.date,r.p10,r.p50,r.p90]));}}
 assert.ok(Buffer.byteLength(JSON.stringify(d))<raw.length/3);assert.equal(initialState(d)._displayOnly,true);
});

test('chunk startup requests display only; full archive is separate, verified and cached on demand',async()=>{
 const paths=new Map(),requests=[];for(const [kind,body]of[['display','{"small":true}'],['archive','{"complete":true}']]){const raw=Buffer.from(body),gz=gzipSync(raw),part=kind==='display'?'/data/atlas-display-part-0.bin':'/data/atlas-part-0.bin';paths.set(part,gz);paths.set(kind==='display'?'/data/atlas-display-manifest.json':'/data/atlas-manifest.json',JSON.stringify({schema:1,originalBytes:raw.length,originalSHA256:hash(raw),chunks:[{path:part,bytes:gz.length,sha256:hash(gz)}]}));}
 const wrapped=createAtlasFetch(async url=>{const p=new URL(url).pathname;requests.push(p);return new Response(paths.get(p),{status:paths.has(p)?200:404});},'https://atlas.example/');
 assert.deepEqual(await(await wrapped('/data/atlas.json')).json(),{small:true});assert.equal(requests.some(p=>p==='/data/atlas-manifest.json'||p==='/data/atlas-part-0.bin'),false);
 assert.deepEqual(await(await wrapped('/data/atlas-full.json')).json(),{complete:true});await wrapped('/data/atlas-full.json');assert.equal(requests.filter(p=>p==='/data/atlas-manifest.json').length,1);
});

test('new static visitor does not download full archive or persist a projected state',async()=>{
 const f=fixture(),m=await storage();m.registerDisplayBundle(f.display);let requests=0;globalThis.fetch=async()=>{requests++;throw Error('unexpected archive');};
 assert.equal(await m.localLoad(f.display),null);assert.equal(requests,0);assert.equal(await dbGet('state'),undefined);
});

test('full hydration checks exact original hash and preserves subsequent full-state edits across display loads',async()=>{
 const f=fixture(),m=await storage();m.registerDisplayBundle(f.display);let fullRequests=0;globalThis.fetch=async url=>{assert.equal(url,'/data/atlas-full.json');fullRequests++;return new Response(f.raw);};
 const full=await m.loadFullLocalState(f.display);assert.equal(full._displayOnly,undefined);assert.equal(full.versions[0].assets[0].rows[0].numericalPrecision.fullEvidence,'retained');
 await m.localAction('defer',{id:f.bundle.candidate.id,requestId:'first'},f.display);await m.localAction('defer',{id:f.bundle.candidate.id,requestId:'other-full-tab'},f.bundle);
 const loaded=await m.localLoad(f.display);assert.ok(loaded.actions.some(a=>a.requestId==='other-full-tab'));assert.ok(loaded._displayOnly);assert.equal((await dbGet('state'))._displayOnly,undefined);assert.equal(fullRequests,1);
 const reloaded=await import(`../src/storage.mjs?reload-test=${++seq}`);reloaded.registerDisplayBundle(f.display);globalThis.fetch=async()=>{throw Error('offline');};const offline=await reloaded.localAction('defer',{id:f.bundle.candidate.id,requestId:'offline-cached'},f.display);assert.ok(offline.actions.some(a=>a.requestId==='offline-cached'));
});

test('a corrupt or changed full archive cannot overwrite existing local edits; failures remain retryable',async()=>{
 const f=fixture(),m=await storage();m.registerDisplayBundle(f.display);await m.localLoad(f.display);const saved={...initialState(f.bundle),revision:77};await dbPut('state',saved);
 globalThis.fetch=async()=>new Response(Buffer.from(f.raw.toString().replace('00000001','00000002')));await assert.rejects(m.loadFullLocalState(f.display),/지문/);assert.equal((await dbGet('state')).revision,77);
 globalThis.fetch=async()=>new Response(f.raw);assert.equal((await m.loadFullLocalState(f.display)).revision,77);
});

test('projection accidentally stored as full state rejects without a global event-handler throw',async()=>{
 const f=fixture(),m=await storage();await m.localLoad(f.display);await dbPut('state',{_displayOnly:true});globalThis.fetch=async()=>new Response(f.raw);await assert.rejects(m.loadFullLocalState(f.display),/표시 자료/);
});

test('version static fallback preserves full evidence; legitimate JSON API failures never fall back',async()=>{
 const f=fixture(),m=await storage();m.registerDisplayBundle(f.display);globalThis.fetch=async url=>url==='/data/atlas-full.json'?new Response(f.raw):new Response('<html>static</html>',{headers:{'content-type':'text/html'}});
 const result=await m.api('version',{id:f.bundle.original.id});assert.equal(result.version.assets[0].rows[0].numericalPrecision.fullEvidence,'retained');
 let archive=0;globalThis.fetch=async url=>{if(url==='/data/atlas-full.json')archive++;return Response.json({error:'Unauthorized'},{status:401});};await assert.rejects(m.api('version',{id:f.bundle.original.id}),/Unauthorized/);assert.equal(archive,0);
});
