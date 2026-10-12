// 새 ATLAS 회차(하루 4번) — 사장님 2026-10-11 09:37 「기준일을 항상 현재 날짜에서 지난 20일 거래로 하라 … 항상 그렇게 하라」
//   12:41 「아니 내일이면 내일 다시 그다음날도 다시 기준은 항상 오늘날짜로 해야 하고 업데이트는 하루에 4번 해야 하고 업데이트 탭 만들어서 기록해놓아라」
//   ① closes_fetch.mjs — 네이버 일봉 XML(재생 모드)을 [날, 종가, 거래량] 으로 새 파일에 남김 · 후보 모두(1,378곳)가 기본 · 없는 곳은 errors
//   ② roll.mjs — 모음 뒤 가짜 하루(시험용 · 저장소에 남기지 않음)를 후보 모두에 이어 붙이면 365곳을 그날 값으로 다시 고르고(들고 난 곳) ·
//      기준일이 하루 따라가고 · 그날 종가가 없는 회사(거래정지처럼)와 지난 값이 다르게 다시 받힌 회사는 빠지고 · 따로 세기 셋 모두 틀림 0 · 회차 기록 · 업데이트 탭 자료가 생김
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import zlib from 'node:zlib';
import {spawnSync} from 'node:child_process';
import {rollAtlas, readRecords, tabData, slotOf, slotFor} from '../../scripts/atlas11/t365/roll.mjs';
process.env.ATLAS_INSPECT_N ??= '20000'; // 네 눈 점검 — 회차는 눈마다 1,000만 번 · 시험은 줄여 돎

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '../..');
const ACT = JSON.parse(fs.readFileSync(path.join(ROOT, 'scripts/atlas11/t365/universe.json'), 'utf8')); // 지금 쓰는 365곳 판
const bundle = JSON.parse(zlib.gunzipSync(fs.readFileSync(path.join(ROOT, ACT.bundle))).toString('utf8'));
const pro = JSON.parse(fs.readFileSync(path.join(ROOT, ACT.dir, 'proposal.json'), 'utf8'));
const codes = [...pro.picked.map(p => p.code), ...pro.outside.map(o => o.code)];
const cal = [...new Set([...JSON.parse(fs.readFileSync(path.join(ROOT, 'public/data/input.json'), 'utf8')).calendar.sessions, ...JSON.parse(fs.readFileSync(path.join(ROOT, 'public/data/rolling-calendar.json'), 'utf8')).sessions])].sort();
const rowsOf = c => (bundle.stocks[c]?.fchart?.rows ?? []).filter(r => r[4] > 0);

test('closes_fetch — 일봉 XML 을 [날, 종가, 거래량] 으로 · 후보 모두 · 새 파일 · 없는 곳은 errors', () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 't365-fetch-'));
  const fx = path.join(tmp, 'fx'); fs.mkdirSync(fx);
  for (const c of pro.picked.slice(0, 2).map(p => p.code)) {
    const items = rowsOf(c).slice(-5).map(r => `<item data="${r[0]}|${r[1]}|${r[2]}|${r[3]}|${r[4]}|${r[5]}" />`).join('\n');
    fs.writeFileSync(path.join(fx, c + '.xml'), `<?xml version="1.0" encoding="EUC-KR" ?>\n<protocol>\n<chartdata symbol="${c}" name="x" count="5" timeframe="day" precision="0" origintime="19900103">\n${items}\n</chartdata>\n</protocol>\n`);
  }
  const out = path.join(tmp, 'closes');
  const r = spawnSync('node', ['scripts/atlas11/t365/closes_fetch.mjs', '--fixture', fx, '--out', out, '--count', '5'], {cwd: ROOT, encoding: 'utf8'});
  assert.equal(r.status, 0, r.stderr);
  const files = fs.readdirSync(out);
  assert.equal(files.length, 1); assert.match(files[0], /^\d{8}T\d{6}Z\.json\.gz$/);
  const snap = JSON.parse(zlib.gunzipSync(fs.readFileSync(path.join(out, files[0]))).toString('utf8'));
  assert.equal(snap.schema, 'atlas-t365-closes-2'); assert.equal(snap.set, 'all'); assert.equal(snap.codes, codes.length); assert.equal(snap.ok, 2); assert.equal(snap.failed, codes.length - 2);
  const c0 = pro.picked[0].code;
  assert.deepEqual(snap.rows[c0], rowsOf(c0).slice(-5).map(r => [r[0], r[4], r[5]]));
  fs.rmSync(tmp, {recursive: true, force: true});
});

test('회차 이름 — 10:00 · 12:00 · 14:00 · 18:00 근처만 그 회차(2026-10-12 12:41 「10시 12시 14시 18시」)', () => {
  assert.equal(slotOf('2026-10-12 10:02'), '10:00'); assert.equal(slotOf('2026-10-12 09:56'), '10:00'); assert.equal(slotOf('2026-10-12 14:47'), '14:00'); assert.equal(slotOf('2026-10-12 15:20'), null);
  assert.equal(slotOf('2026-10-12 17:58'), '18:00'); assert.equal(slotOf('2026-10-12 08:12'), null); assert.equal(slotOf('2026-10-12 21:12'), null); // 옛 시각은 이제 회차가 아님
  assert.equal(slotOf('2026-10-12 11:40'), null); // 20분 앞 손 올리기는 회차가 아님(창은 5분 앞부터)
  assert.equal(slotFor('2026-10-12 12:20', '앞으로 클까? 365곳 모두'), null); // 회차 창 안이라도 손 올리기는 회차가 아님
  assert.equal(slotFor('2026-10-12 18:03', '18:00 회차'), '18:00'); assert.equal(slotFor('2026-10-12 12:02', ''), '12:00'); assert.equal(slotFor('2026-10-12 14:30'), '14:00');
});

test('업데이트 탭 — 회차 시각을 바꿔도 옛 회차 기록의 회차 이름은 그대로 · 손 올리기만 지움', () => {
  const recs = [{at: '2026-10-11T23:12:27Z', kst: '2026-10-12 08:12', slot: '08:10', reason: '08:10 회차', result: '바꿈'},
    {at: '2026-10-12T03:12:11Z', kst: '2026-10-12 12:12', slot: '12:10', reason: '12:10 회차', result: '바꿈'},
    {at: '2026-10-12T03:27:00Z', kst: '2026-10-12 12:27', slot: '12:10', reason: '청자 밤 올림', result: '그대로'},
    {at: '2026-10-11T07:12:00Z', kst: '2026-10-11 16:12', slot: '16:10', reason: '', result: '바꿈'}];
  const t = tabData(recs).records;
  assert.deepEqual(t.map(r => r.slot), ['16:10', null, '12:10', '08:10']); // 새 회차가 위(넣은 차례의 거꾸로)
  assert.deepEqual(tabData([]).slots, ['10:00', '12:00', '14:00', '18:00']);
  // 옛 화면 단 이름이 든 손 올리기 까닭은 탭에서만 지금 이름을 덧붙임(기록 파일은 그대로)
  const old = tabData([{at: '2026-10-11T10:57:02Z', kst: '2026-10-11 19:57', slot: null, reason: '4단 앞으로 클까? — 회사 성장 이야기 271곳(사장님 16:51)', result: '바꿈'}]).records[0];
  assert.equal(old.reason, '앞으로 클까?(그때 4단 · 지금 6단) — 회사 성장 이야기 271곳(사장님 16:51)'); assert.ok(!old.reason.includes('4단 앞으로 클까?'));
  for (const r of readRecords(ROOT)) assert.ok(!tabData([r]).records[0].reason?.includes('4단 앞으로 클까?'), r.kst);
});

test('회차 — 가짜 하루를 후보 모두에 이어 붙이면 그날 값으로 365곳을 다시 고르고 · 기준일이 따라가고 · 따로 세기 셋 틀림 0 · 기록 · 업데이트 탭', async () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 't365-roll-'));
  const closes = path.join(tmp, 'closes'); fs.mkdirSync(closes);
  const asOf0 = JSON.parse(fs.readFileSync(path.join(ROOT, 'site/atlas/data/core.json'), 'utf8')).asOf;
  const next = cal.find(d => d > asOf0), n8 = next.replaceAll('-', '');
  const rows = {};
  codes.forEach((c, j) => { const rs = rowsOf(c).slice(-25).map(r => [r[0], r[4], r[5]]); if (!rs.length) return; const m = ((j * 7919) % 1601 - 800) / 10000; rs.push([n8, Math.round(rs.at(-1)[1] * (1 + m)), rs.at(-1)[2]]); rows[c] = rs; });
  const bent = pro.picked[0].code, halt = pro.picked[1].code;
  rows[bent] = rows[bent].map(([d, v, vol], k) => [d, k === 20 ? Math.round(v * 1.1) : v, vol]); // 모음 안 날 하나를 10% 다르게 = 지난 값을 고쳐 적은 것처럼
  rows[halt] = rows[halt].slice(0, -1); // 새 날 값이 없음 = 거래정지처럼
  fs.writeFileSync(path.join(closes, '20991231T071000Z.json.gz'), zlib.gzipSync(JSON.stringify({schema: 'atlas-t365-closes-2', startedAt: next + 'T05:00:00.000Z', rows, errors: []})));
  const dist = path.join(tmp, 'dist'); fs.cpSync(path.join(ROOT, 'site/atlas'), path.join(dist, 'atlas'), {recursive: true});
  const rec = path.join(tmp, 'updates');
  const rep = await rollAtlas({root: ROOT, dist, closesDir: closes, recordDir: rec, now: new Date(next + 'T05:02:00Z'), pick36Quick: true, log: () => {}});
  assert.equal(rep.result, '바꿈', rep.why); assert.equal(rep.served, 'rolled');
  assert.equal(rep.slot, '14:00');
  assert.equal(rep.asOf, next);
  const W = cal.filter(d => d <= next).slice(-21);
  assert.equal(rep.base, W[0]);
  assert.equal(rep.provisional, true); // 14:02(서울) 받음 = 저녁 8시 전
  for (const k of ['daese', 'site', 'pick36']) assert.match(rep.verify[k], /"bad":0/, k);
  assert.ok(rep.out.some(x => x.c === bent) && rep.out.some(x => x.c === halt), '고쳐 적힌 회사 · 그날 값 없는 회사는 빠짐');
  assert.equal(rep.members.length, 365); assert.equal(new Set(rep.members).size, 365);
  const core = JSON.parse(fs.readFileSync(path.join(dist, 'atlas/data/core.json'), 'utf8'));
  const comp = JSON.parse(fs.readFileSync(path.join(dist, 'atlas/data/comp.json'), 'utf8')).companies;
  assert.deepEqual(core.dates, W); assert.equal(core.days, 20); assert.equal(core.pickAsOf, next);
  assert.equal(comp[bent], undefined); assert.equal(comp[halt], undefined);
  assert.equal(fs.readdirSync(path.join(dist, 'atlas/data/co')).length, 365);
  // 봉인 시간 자료(14:37 · 14:39 「3년후 5년후 10년후 이야기」) — 가짜 하루가 「봉인 뒤 지금까지」에 한 칸 붙고 · 3년 전 길과 다시 여는 날은 그대로
  const tm = JSON.parse(fs.readFileSync(path.join(dist, 'atlas/data/time.json'), 'utf8')).capsules[0];
  assert.equal(tm.since.days, 1); assert.deepEqual(tm.since.dates, [tm.seal, next]); assert.ok(tm.since.chg365 != null && tm.since.chgPool != null);
  assert.deepEqual(tm.opens.map(o => o.y), [3, 5, 10]); assert.equal(tm.past.to, tm.seal);
  assert.equal(core.time.since.days, 1); assert.equal(core.time.digest, tm.digest.slice(0, 12));
  const upd = JSON.parse(fs.readFileSync(path.join(dist, 'atlas/data/updates.json'), 'utf8'));
  assert.equal(upd.records[0].result, '바꿈'); assert.equal(upd.records[0].asOf, next); assert.equal(upd.records[0].in.length, rep.in.length);
  const files = fs.readdirSync(rec); assert.equal(files.length, 1);
  const saved = JSON.parse(fs.readFileSync(path.join(rec, files[0]), 'utf8'));
  assert.deepEqual(saved.members, rep.members);
  const tab = tabData([saved]); assert.equal(tab.records.length, 1); assert.equal(tab.records[0].members, undefined); // 탭 자료에는 365곳 목록을 싣지 않음
  // 시장 판독 · 네 눈 점검(2026-10-12 12:41) — 이번 회차 자료로 · 눈 넷 · 실패 0 · 기록(짧은 꼴) + 전부는 inspect/ 새 파일 · 업데이트 탭에도
  assert.equal(rep.market.asOf, next); assert.ok(rep.market.lines.length >= 3); assert.match(rep.market.lines[0], /곳 오름 · \d+곳 내림/);
  assert.equal(rep.inspect.fail, 0, JSON.stringify(rep.inspect.lenses.map(l => l.first))); assert.deepEqual(rep.inspect.lenses.map(l => [l.key, l.n]), [['apple', 20000], ['google', 20000], ['claude', 20000], ['cia', 20000]]);
  assert.ok(rep.steps.some(s => s.name === '네 눈 점검' && s.code === 0));
  const ins = fs.readdirSync(path.join(tmp, 'inspect')); assert.deepEqual(ins, files);
  assert.equal(JSON.parse(fs.readFileSync(path.join(tmp, 'inspect', ins[0]), 'utf8')).lenses.length, 4);
  assert.deepEqual(upd.records[0].market.lines, rep.market.lines); assert.equal(upd.records[0].inspect.fail, 0); assert.equal(upd.slots.join(), '10:00,12:00,14:00,18:00');
  fs.rmSync(tmp, {recursive: true, force: true});
});

test('회차 — 이어 받은 일봉이 없으면 「그대로」 · 저장된 자료 그대로 · 업데이트 탭은 이번 회차까지', async () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 't365-roll0-'));
  const empty = path.join(tmp, 'closes'); fs.mkdirSync(empty);
  const dist = path.join(tmp, 'dist'); fs.cpSync(path.join(ROOT, 'site/atlas'), path.join(dist, 'atlas'), {recursive: true});
  const rep = await rollAtlas({root: ROOT, dist, closesDir: empty, recordDir: null, log: () => {}});
  assert.equal(rep.result, '그대로'); assert.equal(rep.served, 'stored');
  const upd = JSON.parse(fs.readFileSync(path.join(dist, 'atlas/data/updates.json'), 'utf8'));
  assert.equal(upd.records[0].result, '그대로'); assert.equal(upd.n, readRecords(ROOT).length + 1);
  assert.ok(rep.market?.lines?.length >= 3 && rep.inspect?.lenses?.length === 4, '새 값이 없어도 올라가는 자료를 판독 · 점검');
  fs.rmSync(tmp, {recursive: true, force: true});
});
