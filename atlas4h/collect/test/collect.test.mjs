// 자료 모으기(1단계) 시험 — 해석기 · 두 출처 규칙 · 0 채우지 않기 · 원문 해시 · 덧붙이기만 · 열쇠 안 남기기 · --fixtures 끝까지 한 번
import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import zlib from 'node:zlib';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {parseNaverStamped, parseKospiPage, parseFred, parseKrxIndex, parseEcos, pickMinuteBar, parsePolling, zonedToUTC, within, mergeSeries, buildVariable, minuteWindow, redact, STATUS} from '../collect.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(HERE, '../../..');
const FIX = path.join(HERE, 'fixtures');
const CLI = path.join(REPO, 'atlas4h/collect/collect.mjs');
const AT = '2026-09-29T22:30:00Z'; // 한국 9/30 07:30
const body = f => fs.readFileSync(path.join(FIX, f), 'utf8');
const sha = buf => createHash('sha256').update(buf).digest('hex');
const tmp = () => fs.mkdtempSync(path.join(os.tmpdir(), 'atlas4h-collect-'));
const runCLI = (args, env = {}) => JSON.parse(execFileSync(process.execPath, [CLI, ...args], {cwd: REPO, env: {...process.env, ATLAS4H_KRX_KEY: '', ATLAS4H_ECOS_KEY: '', ATLAS4H_DART_KEY: '', ATLAS4H_FRED_KEY: '', ...env}, encoding: 'utf8'}));
const walk = dir => fs.readdirSync(dir, {withFileTypes: true}).flatMap(e => e.isDirectory() ? walk(path.join(dir, e.name)) : [path.join(dir, e.name)]);

// ── 해석기: 실제 원문으로 ───────────────────────────────────────────────────
test('해석기 — 네이버 해외지수는 시각까지 UTC 로 읽는다(반도체지수 실제 원문)', () => {
  const rows = parseNaverStamped(body('naver-SOX.json'));
  assert.equal(rows.length, 10);
  assert.deepEqual(rows.at(-1), {date: '2026-09-29', value: 12629.16, stampedAt: '2026-09-29T21:15:59.000Z'});
});
test('해석기 — 네이버 환율은 날짜만 있어 시각은 비운다', () => {
  const rows = parseNaverStamped(body('naver-FX_USDKRW.json'));
  assert.deepEqual(rows.at(-1), {date: '2026-09-29', value: 1353, stampedAt: null});
});
test('해석기 — 코스피 일별(ATLAS 11 parseIndexPrices)', () => {
  assert.deepEqual(parseKospiPage(body('index-KOSPI.json')).at(-1), {date: '2026-09-29', value: 6870.81, stampedAt: null});
});
test('해석기 — FRED CSV 실제 원문 · 머리줄이 다른 시계열이면 실패', () => {
  const rows = parseFred(body('fred-DEXKOUS.csv'), 'DEXKOUS');
  assert.ok(rows.length > 10);
  assert.deepEqual(rows[0], {date: '2026-08-03', value: 1430.49, stampedAt: null});
  assert.ok(rows.every(r => r.value !== 0 && Number.isFinite(r.value)));
  assert.throws(() => parseFred(body('fred-DEXKOUS.csv'), 'SP500'), /SERIES_HEADER_MISMATCH/);
  assert.equal(parseFred(body('synthetic-fred-VIXCLS.csv'), 'VIXCLS').find(r => r.date === '2026-09-29'), undefined, "'.' 은 행을 만들지 않음");
});
test('해석기 — 분봉은 15:30 종가 단일가 봉을 쓰고 15:40 뒤 시간외 봉은 버린다', () => {
  const bar = pickMinuteBar(body('naver-minute-005930.json'), '2026-09-29');
  assert.deepEqual(bar, {value: 272500, observedAt: '2026-09-29T06:30:00.000Z', closingAuction: true, barTime: '15:30:00'});
  assert.equal(pickMinuteBar(body('naver-minute-005930.json'), '2026-09-30'), null, '다른 날 봉은 쓰지 않음');
});
test('해석기 — 실시간(polling) 거래대금은 원값(Raw) · 거래 상태 · 시각', () => {
  assert.deepEqual(parsePolling(body('naver-polling-005930.json'), '005930'), {tradingValue: 4253832000000, closePrice: 275000, marketStatus: 'CLOSE', tradeStop: 'TRADING', observedAt: '2026-09-29T11:00:00.000Z'});
  assert.throws(() => parsePolling(body('naver-polling-005930.json'), '000660'), /CODE_MISMATCH/);
});
test('해석기 — KRX·ECOS 꼴(2차 자료 필드 이름) · 꼴이 다르면 실패', () => {
  assert.deepEqual(parseKrxIndex(JSON.stringify({OutBlock_1: [{BAS_DD: '20260929', IDX_NM: '코스피', CLSPRC_IDX: '6,870.81'}, {BAS_DD: '20260929', IDX_NM: '코스피 200', CLSPRC_IDX: '900.1'}]})), [{date: '2026-09-29', value: 6870.81, stampedAt: null}]);
  assert.throws(() => parseKrxIndex('{"respMsg":"bad"}'), /SHAPE_KRX/);
  assert.deepEqual(parseEcos(JSON.stringify({StatisticSearch: {list_total_count: 1, row: [{TIME: '20260929', DATA_VALUE: '1352.5'}]}})), {total: 1, rows: [{date: '2026-09-29', value: 1352.5, stampedAt: null}]});
  assert.throws(() => parseEcos('{"RESULT":{"CODE":"INFO-100"}}'), /SHAPE_ECOS/);
});
test('시각 — 날짜만 있는 값의 마감 시각은 서머타임을 따져 UTC 로', () => {
  assert.equal(zonedToUTC('2026-09-29', '16:00:00', 'America/New_York'), '2026-09-29T20:00:00.000Z');
  assert.equal(zonedToUTC('2026-12-01', '16:00:00', 'America/New_York'), '2026-12-01T21:00:00.000Z');
  assert.equal(zonedToUTC('2026-09-29', '15:30:00', 'Asia/Seoul'), '2026-09-29T06:30:00.000Z');
});
test('분봉 창 — 장 전이면 앞 거래일 15:25~15:45, 장중이면 지금 앞 10분', () => {
  const sessions = ['2026-09-28', '2026-09-29', '2026-09-30'];
  assert.deepEqual(minuteWindow('2026-09-29T22:30:00Z', sessions), {day: '2026-09-29', start: '1525', end: '1545'});
  assert.deepEqual(minuteWindow('2026-09-30T03:00:00Z', sessions), {day: '2026-09-30', start: '1150', end: '1200'});
  assert.deepEqual(minuteWindow('2026-09-30T07:00:00Z', sessions), {day: '2026-09-30', start: '1525', end: '1545'});
});

// ── 두 출처 규칙 ──────────────────────────────────────────────────────────────
const C = {rule: 'relative', tolerance: 0.0005};
test('두 출처 — 날짜마다 ok · 한 출처 · 확인 중(값 null) · 비는 날은 비운 채', () => {
  const s = mergeSeries({name: 'naver', rows: [{date: '2026-09-24', value: 100}, {date: '2026-09-25', value: 100}, {date: '2026-09-28', value: 100}]},
    {name: 'fred', rows: [{date: '2026-09-25', value: 100.01}, {date: '2026-09-28', value: 105}, {date: '2026-09-29', value: 99}]}, C);
  assert.deepEqual(s, [
    {date: '2026-09-24', value: 100, sources: {naver: 100}, status: STATUS.ONE},
    {date: '2026-09-25', value: 100, sources: {naver: 100, fred: 100.01}, status: STATUS.OK},
    {date: '2026-09-28', value: null, sources: {naver: 100, fred: 105}, status: STATUS.CHECK},
    {date: '2026-09-29', value: 99, sources: {fred: 99}, status: STATUS.ONE},
  ]);
  assert.equal(s.find(r => r.date === '2026-09-26'), undefined, '주말은 만들지 않음');
  assert.ok(s.every(r => r.value !== 0));
  assert.equal(within(100, 100.05, C), true); assert.equal(within(100, 100.06, C), false); assert.equal(within(1, 1, {rule: 'exact', tolerance: 0}), true);
});
const src = (name, rows, extra = {}) => ({name, url: `https://example.test/${name}`, ok: true, rawSha256: 'a'.repeat(64), fetchedAt: '2026-09-29T22:30:00.000Z', rows, ...extra});
const row = (date, value, observedAt) => ({date, value, observedAt});
const at = '2026-09-29T22:30:00.000Z';
test('지금 값 — 같은 날짜 두 출처가 허용 폭 안이면 ok', () => {
  const v = buildVariable({id: 'sp500', first: src('naver', [row('2026-09-29', 7670.84, '2026-09-29T20:38:43.000Z')]), second: src('fred', [row('2026-09-29', 7670.84, '2026-09-29T20:00:00.000Z')]), compare: C, at});
  assert.equal(v.status, STATUS.OK); assert.equal(v.value, 7670.84); assert.equal(v.sources.length, 2);
  for (const s of v.sources) for (const k of ['name', 'url', 'value', 'observedAt', 'rawSha256']) assert.ok(s[k] != null, k);
});
test('지금 값 — 둘째가 그 날짜를 아직 안 냈으면 한 출처 + 늦은 확인 기록', () => {
  const v = buildVariable({id: 'vix', first: src('naver', [row('2026-09-28', 16.07, '2026-09-28T20:15:00.000Z'), row('2026-09-29', 16.5, '2026-09-29T20:15:00.000Z')]), second: src('fred', [row('2026-09-28', 16.07, '2026-09-28T20:15:00.000Z')]), compare: {rule: 'relative', tolerance: 0.002}, at});
  assert.equal(v.status, STATUS.ONE); assert.equal(v.value, 16.5);
  assert.deepEqual(v.lateCheck, {date: '2026-09-28', first: 16.07, second: 16.07, agree: true});
});
test('지금 값 — 두 출처가 다르면 확인 중이고 값은 null(안 씀)', () => {
  const v = buildVariable({id: 'wti', first: src('naver', [row('2026-09-29', 89.38, '2026-09-29T21:00:00.000Z')]), second: src('fred', [row('2026-09-29', 85, '2026-09-29T21:00:00.000Z')]), compare: {rule: 'relative', tolerance: 0.02}, at});
  assert.equal(v.status, STATUS.CHECK); assert.equal(v.value, null); assert.deepEqual(v.sources.map(s => s.value), [89.38, 85]);
});
test('지금 값 — 4시간 넘으면 옛값(장 닫힘)', () => {
  const v = buildVariable({id: 'kospi', first: src('naver', [row('2026-09-29', 6870.81, '2026-09-29T06:30:00.000Z')]), compare: C, at});
  assert.equal(v.status, STATUS.OLD); assert.equal(v.value, 6870.81); assert.deepEqual(v.marks, [STATUS.OLD, STATUS.ONE, '장 닫힘']);
});
test('지금 값 — 둘 다 끊기면 없음(null, 0 아님) · 앞 장 값이 있으면 옛값·끊김', () => {
  const dead = {name: 'naver', url: 'https://example.test/n', ok: false, error: 'FETCH_FAILED', rows: []};
  const v = buildVariable({id: 'sox', first: dead, compare: C, at});
  assert.equal(v.status, STATUS.NONE); assert.equal(v.value, null); assert.notEqual(v.value, 0); assert.ok(v.reason);
  const carried = buildVariable({id: 'sox', first: dead, compare: C, at, previous: {value: 12629.16, observedAt: '2026-09-29T21:15:59.000Z', fetchedAt: '2026-09-29T21:30:00.000Z', file: 'atlas4h/ledger/inputs/x.json'}});
  assert.equal(carried.status, STATUS.OLD); assert.deepEqual(carried.marks, [STATUS.OLD, '끊김']); assert.equal(carried.carriedFrom, 'atlas4h/ledger/inputs/x.json');
});
test('지금 값 — 첫째가 끊기고 둘째만 있으면 둘째 값을 한 출처로', () => {
  const v = buildVariable({id: 'sp500', first: {name: 'naver', url: 'u', ok: false, error: 'FETCH_FAILED', rows: []}, second: src('fred', [row('2026-09-29', 7670.84, '2026-09-29T20:00:00.000Z')]), compare: C, at});
  assert.equal(v.status, STATUS.ONE); assert.equal(v.value, 7670.84); assert.match(v.reason, /첫째 출처 끊김/);
});
test('열쇠 가리기 — 주소 속 열쇠는 {KEY} 로', () => {
  assert.equal(redact('https://ecos.bok.or.kr/api/StatisticSearch/ABC123/json', ['ABC123']), 'https://ecos.bok.or.kr/api/StatisticSearch/{KEY}/json');
});

// ── --fixtures 로 끝까지 한 번 ─────────────────────────────────────────────────
test('끝까지 — history: 파일 꼴 · 날짜별 상태 · 0 채우지 않기 · 원문 해시', () => {
  const root = tmp();
  const out = runCLI(['--mode', 'history', '--fixtures', FIX, '--root', root, '--now', AT]);
  assert.equal(out.status, 'ok');
  for (const id of ['kospi', 'sox', 'sp500', 'vix', 'usdkrw', 'wti', 'brent']) {
    const d = JSON.parse(fs.readFileSync(path.join(root, 'atlas4h/data/history', id + '.json'), 'utf8'));
    assert.equal(d.schema, 'atlas4h-history-1'); assert.equal(d.id, id); assert.equal(d.fetchedAt, '2026-09-29T22:30:00.000Z');
    assert.ok(d.series.length > 0);
    for (const r of d.series) {
      assert.ok([STATUS.OK, STATUS.ONE, STATUS.CHECK].includes(r.status), r.status);
      assert.notEqual(r.value, 0, `${id} ${r.date} 0 으로 채움`);
      assert.ok(Object.keys(r.sources).length >= 1);
      if (r.status === STATUS.CHECK) assert.equal(r.value, null);
    }
    const srcDates = new Set(); // 출처에 없는 날짜는 없다
    for (const s of d.sources) { assert.match(s.rawSha256, /^[0-9a-f]{64}$/); assert.ok(s.url.startsWith('https://')); }
    for (const r of d.series) srcDates.add(r.date);
    assert.equal(srcDates.size, d.series.length, '날짜 겹침 없음');
  }
  const sp = JSON.parse(fs.readFileSync(path.join(root, 'atlas4h/data/history/sp500.json'), 'utf8'));
  const at = date => sp.series.find(r => r.date === date);
  assert.deepEqual(at('2026-09-29'), {date: '2026-09-29', value: 7670.84, sources: {naver: 7670.84, fred: 7670.84}, status: STATUS.OK});
  assert.deepEqual(at('2026-09-25'), {date: '2026-09-25', value: null, sources: {naver: 7743.41, fred: 7820}, status: STATUS.CHECK});
  assert.deepEqual(at('2026-09-15'), {date: '2026-09-15', value: 7600, sources: {fred: 7600}, status: STATUS.ONE});
  assert.equal(at('2023-09-20'), undefined, '3년 창 밖은 버림');
  assert.equal(at('2026-09-26'), undefined, '주말은 만들지 않음');
  // 원문 해시 = 받은 바이트 그대로의 sha256
  const sox = JSON.parse(fs.readFileSync(path.join(root, 'atlas4h/data/history/sox.json'), 'utf8'));
  assert.equal(sox.sources[0].pages[0].rawSha256, sha(fs.readFileSync(path.join(FIX, 'naver-SOX.json'))));
  assert.equal(sp.sources[1].rawSha256, sha(fs.readFileSync(path.join(FIX, 'synthetic-fred-SP500.csv'))));
  // 원문 보관(gzip) — 다시 풀어 해시가 맞는다
  const gz = walk(path.join(root, 'atlas4h/raw')).filter(f => f.endsWith('.json.gz'));
  assert.equal(gz.length, 1);
  const raw = JSON.parse(zlib.gunzipSync(fs.readFileSync(gz[0])));
  assert.equal(raw.schema, 'atlas4h-raw-1');
  for (const [url, b] of Object.entries(raw.bodies)) assert.equal(sha(Buffer.from(b.text, 'utf8')), b.sha256, url);
  assert.ok(raw.bodies['https://api.stock.naver.com/index/.SOX/price?page=1&pageSize=10']);
});
test('끝까지 — now: 변수 열다섯 · 판 꼴 · 없음은 null · 장부는 덧붙이기만', () => {
  const root = tmp();
  runCLI(['--mode', 'history', '--fixtures', FIX, '--root', root, '--now', AT]);
  const out = runCLI(['--mode', 'now', '--fixtures', FIX, '--root', root, '--now', AT]);
  assert.equal(Object.keys(out.perVariable).length, 15);
  const file = path.join(root, 'atlas4h/ledger/inputs/2026-09-30T07-30.json');
  const snap = JSON.parse(fs.readFileSync(file, 'utf8'));
  const by = id => snap.variables.find(v => v.id === id);
  for (const v of snap.variables) {
    for (const k of ['id', 'value', 'observedAt', 'fetchedAt', 'status', 'sources']) assert.ok(k in v, `${v.id} ${k}`);
    assert.ok(Object.values(STATUS).includes(v.status), v.status);
    if (v.status === STATUS.NONE || v.status === STATUS.CHECK) assert.equal(v.value, null, v.id);
    assert.notEqual(v.value, 0, v.id);
  }
  assert.equal(by('sp500').status, STATUS.OK);
  assert.equal(by('sox').status, STATUS.ONE);
  assert.equal(by('wti').status, STATUS.CHECK);
  assert.equal(by('kospi').status, STATUS.OLD);
  assert.equal(by('vkospi').status, STATUS.NONE);
  assert.equal(by('stock-price:005930').status, STATUS.CHECK, '네이버 두 주소 종가가 다르면 쓰지 않음');
  assert.deepEqual(by('stock-price:005930').naverSelfCheck, {pollingClose: 275000, agree: false});
  assert.equal(by('stock-trading-value:005930').value, 4253832000000);
  assert.equal(by('stock-price:000720').status, STATUS.NONE); assert.equal(by('stock-price:000720').value, null);
  assert.equal(snap.variables.filter(v => v.variableId === 'stock-price').length, 52);
  // 장부: 두 번째 now 는 새 파일 · 앞 줄은 그대로
  const log = path.join(root, 'atlas4h/ledger/collect/2026-09-30.jsonl');
  const before = fs.readFileSync(log, 'utf8'), snapBefore = fs.readFileSync(file, 'utf8');
  runCLI(['--mode', 'now', '--fixtures', FIX, '--root', root, '--now', AT]);
  const after = fs.readFileSync(log, 'utf8');
  assert.ok(after.startsWith(before), '앞 줄을 고치지 않음');
  assert.equal(after.trim().split('\n').length, 3);
  for (const l of after.trim().split('\n')) { const j = JSON.parse(l); for (const k of ['at', 'mode', 'ok', 'perVariable', 'errors']) assert.ok(k in j, k); }
  assert.equal(fs.readFileSync(file, 'utf8'), snapBefore, '앞 장을 덮어쓰지 않음');
  assert.ok(fs.existsSync(path.join(root, 'atlas4h/ledger/inputs/2026-09-30T07-30-2.json')));
  // 두 번째 now 는 앞 장을 안다
  assert.equal(JSON.parse(fs.readFileSync(path.join(root, 'atlas4h/ledger/inputs/2026-09-30T07-30-2.json'), 'utf8')).previous, null, '같은 분의 장은 앞 장으로 치지 않음');
});
test('열쇠 — 있으면 쓰되 어떤 파일에도 남기지 않는다', () => {
  const root = tmp(), secret = 'SECRET-ecos-key-7f3a9c';
  runCLI(['--mode', 'history', '--fixtures', FIX, '--root', root, '--now', AT], {ATLAS4H_ECOS_KEY: secret, ATLAS4H_KRX_KEY: 'SECRET-krx-key-11aa'});
  runCLI(['--mode', 'now', '--fixtures', FIX, '--root', root, '--now', AT], {ATLAS4H_ECOS_KEY: secret, ATLAS4H_KRX_KEY: 'SECRET-krx-key-11aa'});
  const files = walk(root);
  assert.ok(files.length >= 10);
  for (const f of files) {
    const text = f.endsWith('.gz') ? zlib.gunzipSync(fs.readFileSync(f)).toString('utf8') : fs.readFileSync(f, 'utf8');
    assert.ok(!text.includes(secret) && !text.includes('SECRET-krx-key-11aa'), f);
  }
  const log = fs.readFileSync(path.join(root, 'atlas4h/ledger/collect/2026-09-30.jsonl'), 'utf8').trim().split('\n').map(l => JSON.parse(l));
  assert.equal(log[0].keys.ecos, true);
  assert.ok(log[0].errors.some(e => e.source === 'ecos' && e.url.includes('{KEY}')), 'ECOS 를 불렀고 주소의 열쇠는 가렸다');
  assert.ok(log[0].errors.some(e => e.source === 'krx'), 'KRX 를 불렀다(시험 재료가 없어 끊김)');
});
