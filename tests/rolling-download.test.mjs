import test from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {gzipSync} from 'node:zlib';
import {createAtlasFetch} from '../scripts/drop-chunk-loader.mjs';
const hash=x=>createHash('sha256').update(x).digest('hex');
test('rolling download restores exact JSON, caches once, and rejects corrupt bytes before display',async()=>{
 const raw=Buffer.from(JSON.stringify({id:'edition-1',assets:[{code:'005930',rows:[{p50:100}]}]})),gz=gzipSync(raw);
 const manifest={schema:1,originalBytes:raw.length,originalSHA256:hash(raw),chunks:[{path:'/data/rolling-part-0.bin',bytes:gz.length,sha256:hash(gz)}]};
 let requests=0,corrupt=false;
 const native=async u=>{requests++;return new URL(u).pathname.endsWith('manifest.json')?Response.json(manifest):new Response(corrupt?Buffer.alloc(gz.length):gz)};
 let fetch=createAtlasFetch(native,'https://atlas.example/');
 const r=await fetch('/data/rolling-forecast.json');assert.equal(await r.text(),raw.toString());await fetch('/data/rolling-forecast.json');assert.equal(requests,2);
 corrupt=true;fetch=createAtlasFetch(native,'https://atlas.example/');await assert.rejects(fetch('/data/rolling-forecast.json'),/검증/);
 corrupt=false;assert.equal(await(await fetch('/data/rolling-forecast.json')).text(),raw.toString());
});
