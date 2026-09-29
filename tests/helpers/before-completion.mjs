import fs from'node:fs';import{gunzipSync}from'node:zlib';import{createHash}from'node:crypto';import assert from'node:assert/strict';
export function historicalBytes(){const raw=gunzipSync(fs.readFileSync('reports/completion/before/atlas-9.4.json.gz'));assert.equal(createHash('sha256').update(raw).digest('hex'),'235925fafa9010c7f036a4028fd7614bd855f5e54402f88b31f7d377402c455c');return raw;}
export const historicalBundle=()=>JSON.parse(historicalBytes());
