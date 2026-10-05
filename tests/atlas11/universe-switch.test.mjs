// 종목 바꾸기(매일 실행기 안) — 2026-10-04 사장님 「오를 수 있는 52개 우량 종목을 찾아 첫 화면에 배열하는 구조로 싹 변경」 · 「알아서 해」
//   15:37 「이제 예측을 하지 않는다」 뒤: 실행기는 종가 모으기 · 종목 바꾸기 · 52곳 판 화면만(발행·채점 없음)
// 9/28 실제 입력 사본으로 9/29(화) 16:05 실행을 흉내 낸다. 새 52종목은 합성(옛 종목 26곳 + 가짜 코드 26곳 · 가격은 옛 종목 것을 빌림 · 실제 시세 아님).
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {runDaily} from '../../lib/atlas11/daily.mjs';
import {collect} from '../../scripts/atlas11/collect_naver.mjs';
import {readRecords, currentRecords} from '../../lib/atlas11/records.mjs';
import {loadRetired, RETIRED_DIR, WORKING_NEXT, UNIVERSE_CONFIG} from '../../lib/atlas11/universe-switch.mjs';
import {tempRoot, root, readJSON, INPUT_928} from './helpers.mjs';

const NOW = '2026-09-29T07:05:00.000Z', TODAY = '2026-09-29';
const noSleep = async () => {};
const ymd = d => d.replace(/-/g, '');
const xml = (symbol, rows) => `<?xml version="1.0" encoding="EUC-KR" ?><protocol><chartdata symbol="${symbol}" name="합성" count="${rows.length}" timeframe="day" precision="0">${rows.map(r => `<item data="${ymd(r.date)}|${r.open}|${r.high}|${r.low}|${r.close}|${r.volume}" />`).join('')}</chartdata></protocol>`;
const respond = (body, status = 200) => new Response(body, {status, headers: {'content-type': 'text/xml; charset=EUC-KR'}});

async function setup({failCodes = [], extra = 8} = {}) {
  const dir = await tempRoot();
  for (const [src, dst] of [[INPUT_928, 'public/data/input.json'], ['public/data/rolling-calendar.json', 'public/data/rolling-calendar.json']]) {
    await fs.mkdir(path.dirname(path.join(dir, dst)), {recursive: true}); await fs.copyFile(path.join(root, src), path.join(dir, dst));
  }
  const old = await readJSON(INPUT_928);
  // 새 52곳: 옛 종목 앞 26곳은 그대로 이어 쓰고 · 뒤 26곳 자리에 가짜 코드(가격은 뒤 26곳 것을 빌림 · 업종은 은행·제약 등으로)
  const sectors = ['은행', '제약', '화학', '자동차부품', '게임엔터테인먼트', '식품'];
  // 2026-10-04 180곳: 새 묶음은 곳 수가 다를 수 있다 — 가짜 extra 곳을 더해 52곳이 아닌 묶음(기본 60곳)으로 바꾸기를 본다
  const fake = (a, i, code) => ({...a, id: i + 1, code, name: '가짜' + code, sector: sectors[i % sectors.length], priceSource: {provider: 'NAVER', note: '합성'}, prices: a.prices.map(p => ({date: p.date, close: p.close, volume: 1000}))});
  const assets = [...old.assets.map((a, i) => i < 26 ? a : fake(a, i, String(900000 + i * 10))), ...old.assets.slice(0, extra).map((a, i) => fake(a, 52 + i, String(910000 + i * 10)))];
  const next = {...old, assets, universe: {id: 'u2-test', label: `가짜 묶음 ${assets.length}곳`, rules: 'test'}, priceRevisions: []};
  const text = JSON.stringify(next), nextFile = 'reports/atlas11/universe/test/next-input.json';
  await fs.mkdir(path.dirname(path.join(dir, nextFile)), {recursive: true}); await fs.writeFile(path.join(dir, nextFile), text);
  await fs.mkdir(path.dirname(path.join(dir, UNIVERSE_CONFIG)), {recursive: true});
  await fs.writeFile(path.join(dir, UNIVERSE_CONFIG), JSON.stringify({schema: 'atlas11-universe-config-1', order: {by: '사장님'}, current: {id: 'u1-sector52'}, next: {id: 'u2-test', count: assets.length, proposal: 'reports/atlas11/universe/test/proposal.json', input: nextFile, inputSHA256: createHash('sha256').update(text).digest('hex'), switchOn: TODAY}}));
  // 오늘 봉 하나(지난 종가 ×1.01) · failCodes 는 응답 없음
  const lastClose = new Map([...old.assets, ...assets].map(a => [a.code, a.prices.at(-1).close]));
  const fetch = async url => { const s = new URL(url).searchParams.get('symbol') ?? /\/item\/([^/]+)\/day/.exec(new URL(url).pathname)?.[1]; if (failCodes.includes(s)) return respond('no', 404); const p = lastClose.get(s) ?? 10000, c = Math.round(p * 1.01); return respond(xml(s, [{date: TODAY, open: p, high: Math.max(p, c), low: Math.min(p, c), close: c, volume: 123456}])); };
  const collector = (input, window) => collect(input, window, {fetch, now: NOW, count: 1, finalityDelayMs: 0, politeDelayMs: 0, market: [], sleep: noSleep, retries: 0});
  const seen = [];
  // 화면 묶음 단계(가짜): 그때 input.json 의 52곳을 적어 둔다 — 바꾼 날에는 새 52곳으로 화면을 만들어야 한다
  const buildView = async () => { const inp = JSON.parse(await fs.readFile(path.join(dir, 'public/data/input.json'), 'utf8')); seen.push(inp.assets.map(a => a.code)); return {boardId: 'b', files: 54}; };
  return {dir, old, next, collector, buildView, seen};
}

test('바꾸는 날: 새 묶음(52곳이 아닌 60곳) 종가가 모두 확정이면 그때 바꿈 → 화면 묶음은 새 60곳 · 옛 입력은 보관 · 다시 돌려도 한 번만 · 예측·채점 기록 없음 · 예비 예약은 60/60 을 보고 건너뜀', async () => {
  const {dir, old, next, collector, buildView, seen} = await setup();
  const r = await runDaily({now: NOW, rootDir: dir, collector, buildView});
  assert.equal(r.status, 'complete', JSON.stringify({warnings: r.warnings, error: r.error, steps: r.steps.map(s => [s.step, s.status, s.error])}).slice(0, 600));
  assert.equal(r.prediction, 'off'); assert.equal(next.assets.length, 60);
  assert.equal(r.universe.switched, true); assert.equal(r.universe.from, 'u1-sector52'); assert.equal(r.universe.to, 'u2-test'); assert.equal(r.universe.kept, 26); assert.equal(r.universe.added, 34);
  assert.equal(r.confirmedTodayStocks, 60); assert.equal(r.expectedStocks, 60); assert.equal(r.exitCode, 0); assert.equal(r.actualAsOf, TODAY);
  const {alreadyDone} = await import('../../scripts/atlas11/already_done.mjs');
  assert.equal(alreadyDone({...r, dayKST: TODAY}, NOW).skip, true, '60곳 묶음 · 60/60 이면 예비 예약은 건너뜀');
  assert.equal(alreadyDone({...r, dayKST: TODAY, confirmedTodayStocks: 59, status: 'partial', exitCode: 2}, NOW).skip, false);
  const now = JSON.parse(await fs.readFile(path.join(dir, 'public/data/input.json'), 'utf8'));
  assert.equal(now.universe.id, 'u2-test'); assert.deepEqual(now.assets.map(a => a.code), next.assets.map(a => a.code));
  assert.ok(now.assets.every(a => a.prices.at(-1).date === TODAY && a.prices.at(-1).finalClose === true), '새 60곳 모두 오늘 확정 종가');
  assert.deepEqual(seen.at(-1), next.assets.map(a => a.code), '화면 묶음은 새 60곳 입력을 읽었다');
  // 옛 입력 보관본: 옛 52종목 · 오늘 종가까지
  const retired = await loadRetired(dir);
  assert.equal(retired.length, 1); assert.equal(retired[0].id, 'u1-sector52'); assert.equal(retired[0].file, path.join(RETIRED_DIR, 'u1-sector52.json'));
  assert.deepEqual(retired[0].input.assets.map(a => a.code), old.assets.map(a => a.code)); assert.ok(retired[0].input.assets.every(a => a.prices.at(-1).date === TODAY));
  const ops = currentRecords(await readRecords(dir, 'operation')).map(x => x.body).filter(b => b.kind === 'universe_switch');
  assert.equal(ops.length, 1); assert.equal(ops[0].from, 'u1-sector52'); assert.equal(ops[0].to, 'u2-test');
  await assert.rejects(fs.access(path.join(dir, WORKING_NEXT)), '작업본은 바꾼 뒤 지움');
  for (const type of ['forecast', 'score', 'analysis']) assert.equal((await readRecords(dir, type)).length, 0, type + ' 기록은 쓰지 않는다');
  // 같은 날 다시 돌려도: 다시 바꾸지 않고 · 바꾸기 기록도 하나
  const r2 = await runDaily({now: NOW, rootDir: dir, collector, buildView});
  assert.equal(r2.universe, undefined, '이미 바꿈 → 바꿀 일 없음'); assert.equal(r2.universeId, 'u2-test');
  assert.equal(currentRecords(await readRecords(dir, 'operation')).filter(x => x.body.kind === 'universe_switch').length, 1);
});

test('새 종목 종가가 하나라도 빠지면 바꾸지 않고 옛 종목으로 계속 · 받은 것은 작업본에 이어 둠', async () => {
  const {dir, old, collector, buildView, seen} = await setup({failCodes: ['900300']});
  const r = await runDaily({now: NOW, rootDir: dir, collector, buildView});
  assert.equal(r.universe.switched, false); assert.match(r.universe.reason, /59\/60/); assert.equal(r.expectedStocks, 52, '오늘은 옛 52곳으로 계속');
  const now = JSON.parse(await fs.readFile(path.join(dir, 'public/data/input.json'), 'utf8'));
  assert.equal(now.universe, undefined); assert.deepEqual(now.assets.map(a => a.code), old.assets.map(a => a.code));
  assert.deepEqual(seen.at(-1), old.assets.map(a => a.code), '오늘 화면은 옛 52종목으로');
  const working = JSON.parse(await fs.readFile(path.join(dir, WORKING_NEXT), 'utf8'));
  assert.equal(working.universe.id, 'u2-test'); assert.equal(working.assets.filter(a => a.prices.at(-1).date === TODAY).length, 59);
  assert.deepEqual(await loadRetired(dir), [], '보관본 없음(안 바꿨으니)');
});
