import test from 'node:test';import assert from 'node:assert/strict';import {spawnSync} from 'node:child_process';
test('official local calendar dates are identical under UTC, Seoul, London and New York server timezones',()=>{
 const script=`import fs from 'node:fs';import {parseBLS,parseFED} from './lib/news-sources.mjs';const i=JSON.parse(fs.readFileSync('tests/fixtures/input-v3.json'));console.log(JSON.stringify([...parseBLS(fs.readFileSync('news-research/bls2026.html','utf8'),2026,i.calendar.sessions,'2026-09-24T00:00:00Z'),...parseFED(fs.readFileSync('news-research/fed.html','utf8'),i.calendar.sessions,'2026-09-24T00:00:00Z')]));`;
 const {NODE_TEST_CONTEXT,...env}=process.env;let reference;
 for(const TZ of ['UTC','Asia/Seoul','Europe/London','America/New_York']){const r=spawnSync(process.execPath,['--input-type=module','-e',script],{cwd:new URL('../',import.meta.url),env:{...env,TZ},encoding:'utf8'});assert.equal(r.status,0,r.stderr);const events=JSON.parse(r.stdout);assert.equal(events.find(e=>e.kind==='JOBS'&&e.announcementDate==='2026-10-02').targetDate,'2026-10-06');if(reference)assert.deepEqual(events,reference);else reference=events;}
});
