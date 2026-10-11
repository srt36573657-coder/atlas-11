// 새 ATLAS 기준일 = 마지막 종가 날의 20거래일 전 · 날마다 굴리기(사장님 2026-10-11 09:37 「기준일을 항상 현재 날짜에서 지난 20일 거래로 하라 … 항상 그렇게 하라」)
//   ① closes_fetch.mjs — 네이버 일봉 XML(재생 모드)을 [날, 종가] 로 새 파일에 남김 · 없는 곳은 errors
//   ② roll.mjs — 모음 뒤 가짜 하루(시험용 · 저장소에 남기지 않음)를 이어 붙이면 기준일이 하루 따라가고, 지난 값이 다르게 다시 받힌 회사는 「?」 · 따로 세기 틀림 0
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import zlib from 'node:zlib';
import {spawnSync} from 'node:child_process';
import {rollAtlas} from '../../scripts/atlas11/t365/roll.mjs';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '../..');
const bundle = JSON.parse(zlib.gunzipSync(fs.readFileSync(path.join(ROOT, 'reports/atlas11/universe/2026-10-10/bundle.json.gz'))).toString('utf8'));
const codes = JSON.parse(fs.readFileSync(path.join(ROOT, 'reports/atlas11/universe/2026-10-10-t365/proposal.json'), 'utf8')).picked.map(p => p.code);
const cal = JSON.parse(fs.readFileSync(path.join(ROOT, 'public/data/input.json'), 'utf8')).calendar.sessions;
const rowsOf = c => bundle.stocks[c].fchart.rows.filter(r => r[4] > 0);

test('closes_fetch — 일봉 XML 을 [날, 종가] 로 · 새 파일 · 없는 곳은 errors', () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 't365-fetch-'));
  const fx = path.join(tmp, 'fx'); fs.mkdirSync(fx);
  for (const c of codes.slice(0, 2)) {
    const items = rowsOf(c).slice(-5).map(r => `<item data="${r[0]}|${r[1]}|${r[2]}|${r[3]}|${r[4]}|${r[5]}" />`).join('\n');
    fs.writeFileSync(path.join(fx, c + '.xml'), `<?xml version="1.0" encoding="EUC-KR" ?>\n<protocol>\n<chartdata symbol="${c}" name="x" count="5" timeframe="day" precision="0" origintime="19900103">\n${items}\n</chartdata>\n</protocol>\n`);
  }
  const out = path.join(tmp, 'closes');
  const r = spawnSync('node', ['scripts/atlas11/t365/closes_fetch.mjs', '--fixture', fx, '--out', out, '--count', '5'], {cwd: ROOT, encoding: 'utf8'});
  assert.equal(r.status, 0, r.stderr);
  const files = fs.readdirSync(out);
  assert.equal(files.length, 1); assert.match(files[0], /^\d{8}T\d{6}Z\.json\.gz$/);
  const snap = JSON.parse(zlib.gunzipSync(fs.readFileSync(path.join(out, files[0]))).toString('utf8'));
  assert.equal(snap.schema, 'atlas-t365-closes-1'); assert.equal(snap.ok, 2); assert.equal(snap.failed, codes.length - 2);
  assert.deepEqual(snap.rows[codes[0]], rowsOf(codes[0]).slice(-5).map(r => [r[0], r[4]]));
  fs.rmSync(tmp, {recursive: true, force: true});
});

test('roll — 가짜 하루를 이어 붙이면 기준일이 20거래일 전으로 따라감 · 고쳐 적힌 회사는 「?」 · 따로 세기 틀림 0', async () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 't365-roll-'));
  const closes = path.join(tmp, 'closes'); fs.mkdirSync(closes);
  const asOf0 = JSON.parse(fs.readFileSync(path.join(ROOT, 'site/atlas/data/core.json'), 'utf8')).asOf;
  const next = cal.find(d => d > asOf0), n8 = next.replaceAll('-', '');
  const rows = {};
  for (const c of codes) { const rs = rowsOf(c).slice(-25).map(r => [r[0], r[4]]); rs.push([n8, Math.round(rs.at(-1)[1] * 1.01)]); rows[c] = rs; }
  const bent = codes[0]; rows[bent] = rows[bent].map(([d, v], k) => [d, k === 20 ? Math.round(v * 1.1) : v]); // 모음 안 날 하나를 10% 다르게 = 지난 값을 고쳐 적은 것처럼
  fs.writeFileSync(path.join(closes, '20991231T070000Z.json.gz'), zlib.gzipSync(JSON.stringify({schema: 'atlas-t365-closes-1', startedAt: next + 'T07:00:00.000Z', rows, errors: []})));
  const dist = path.join(tmp, 'dist'); fs.cpSync(path.join(ROOT, 'site/atlas'), path.join(dist, 'atlas'), {recursive: true});
  const rep = await rollAtlas({root: ROOT, dist, closesDir: closes, log: () => {}});
  assert.equal(rep.used, 'rolled', rep.why);
  assert.equal(rep.asOf, next);
  const W = cal.filter(d => d <= next).slice(-21);
  assert.equal(rep.base, W[0]);
  assert.deepEqual(rep.roll, {files: 1, added: codes.length - 1, mismatch: 1});
  assert.equal(rep.provisional, true); // 16:00(서울) 받음 = 저녁 8시 전
  assert.match(rep.verify, /"bad":0/);
  const core = JSON.parse(fs.readFileSync(path.join(dist, 'atlas/data/core.json'), 'utf8'));
  const comp = JSON.parse(fs.readFileSync(path.join(dist, 'atlas/data/comp.json'), 'utf8')).companies;
  assert.deepEqual(core.dates, W); assert.equal(core.days, 20);
  assert.equal(comp[bent].chg, null); assert.equal(comp[bent].priceDate, asOf0);
  assert.ok(fs.existsSync(path.join(dist, 'atlas/data/pick36.json'))); // site_build 가 만들지 않는 파일은 그대로
  fs.rmSync(tmp, {recursive: true, force: true});
});
