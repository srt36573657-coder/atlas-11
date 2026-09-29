import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import zlib from 'node:zlib';
import {root, INPUT_928, tempRoot} from './helpers.mjs';
import {num, parseIndexPrices, parseFlows, parseNews, titleKey, parseDisclosures, parseFredCSV, parseNaverSeries, flowRevisions, markProvisional, factorObservations, summarizeContext} from '../../lib/atlas11/context.mjs';
import {collectContext, makeFetcher} from '../../scripts/atlas11/collect_context.mjs';
import {readRecords} from '../../lib/atlas11/records.mjs';

const FX = path.join(root, 'tests/atlas11/fixtures/context');
const fx = f => fs.readFile(path.join(FX, f), 'utf8');
async function setupRoot() {
  const dir = await tempRoot();
  await fs.mkdir(path.join(dir, 'public/data'), {recursive: true});
  await fs.copyFile(path.join(root, INPUT_928), path.join(dir, 'public/data/input.json'));
  await fs.copyFile(path.join(root, 'public/data/rolling-calendar.json'), path.join(dir, 'public/data/rolling-calendar.json'));
  return dir;
}

test('num: 부호·쉼표·% 문자열을 수로 · 읽을 수 없으면 null(0 으로 바꾸지 않음)', () => {
  assert.equal(num('+53,759'), 53759); assert.equal(num('-2,508,369'), -2508369); assert.equal(num('46.48%'), 46.48); assert.equal(num('6,870.81'), 6870.81); assert.equal(num(12.5), 12.5);
  for (const bad of ['', '-', 'N/A', null, undefined, '1,2a', NaN, {}]) assert.equal(num(bad), null);
});

test('실제 응답 해석: 코스피 9/29 종가 6,870.81(−0.27%) · 삼성전자 9/29 외국인 −2,508,369 · 기관 +53,759 · 개인 +422,277 · 코드 어긋나면 거부', async () => {
  const k = parseIndexPrices(await fx('index-KOSPI.json'), 'KOSPI'); const r = k.rows.find(x => x.date === '2026-09-29');
  assert.deepEqual([r.close, r.changePct, r.open, r.high, r.low], [6870.81, -0.27, 6844.41, 6898.36, 6782.99]);
  assert.ok(k.rows.every((x, i) => i === 0 || x.date > k.rows[i - 1].date));
  const f = parseFlows(await fx('flows-005930.json'), '005930'); const d = f.rows.find(x => x.date === '2026-09-29');
  assert.deepEqual([d.foreignNet, d.institutionNet, d.individualNet, d.foreignHoldRatioPct, d.unit], [-2508369, 53759, 422277, 46.48, 'shares']);
  assert.ok(!('close' in d) && !('volume' in d), '수급 표의 가격·거래량은 받지 않는다(정규장 값 확인 불가)');
  const t5930 = await fx('flows-005930.json'); assert.throws(() => parseFlows(t5930, '000660'), /CODE_MISMATCH/);
  assert.throws(() => parseFlows('<html>', '005930'), /PARSE_FAILED/);
});

test('뉴스: 같은 기사·재게시(제목 같음) 가림 · 가장 이른 것이 대표 · 한국시간 표기 · 본문은 담지 않음', async () => {
  const n = parseNews(await fx('news-005930.json'), '005930', {name: '삼성전자'});
  assert.ok(n.items.length > 0 && n.raw >= n.items.length);
  assert.ok(n.items.every(i => /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:00\+09:00$/.test(i.publishedAt) && i.title && !('body' in i)));
  assert.equal(n.distinct + n.republished, n.items.length);
  assert.equal(titleKey('[속보] 삼성전자, “HBM 증산”'), titleKey('삼성전자 HBM 증산'));
  const dup = parseNews(JSON.stringify([{total: 2, items: [{officeId: '1', articleId: 'a', datetime: '202609300900', title: '[단독] 삼성전자 HBM 증산', mobileNewsUrl: 'u1'}, {officeId: '2', articleId: 'b', datetime: '202609300930', title: '삼성전자, HBM 증산', mobileNewsUrl: 'u2'}]}, {total: 1, items: [{officeId: '1', articleId: 'a', datetime: '202609300900', title: '[단독] 삼성전자 HBM 증산'}]}]), '005930');
  assert.equal(dup.raw, 3); assert.equal(dup.sameArticle, 1); assert.equal(dup.items.length, 2); assert.equal(dup.items[1].duplicateOf, '1-a'); assert.equal(dup.distinct, 1);
});

test('공시: 기업행위 낱말(배당락 등) 표시 · 시간대 없는 원문은 한국시간으로 해석했다고 남김', async () => {
  const d = parseDisclosures(await fx('disclosures-005930.json'), '005930');
  const div = d.items.find(i => /배당락/.test(i.title));
  assert.ok(div && div.corporateAction && div.actionWord === '배당락' && div.publishedAt.endsWith('+09:00') && /시간대 표기 없음/.test(div.timezoneAssumed));
  assert.ok(d.items.some(i => !i.corporateAction));
});

test('거시: FRED CSV 머리줄 검사 · 빈 값(.)은 행을 만들지 않음 · 네이버 {result}/배열 두 모양 · 날짜는 그 시장 현지 거래일', async () => {
  const dex = await fx('fred-DEXKOUS.csv'), rows = parseFredCSV(dex, 'DEXKOUS'); assert.ok(rows.length > 10 && rows.every(r => Number.isFinite(r.value)));
  assert.throws(() => parseFredCSV(dex, 'VIXCLS'), /SERIES_HEADER_MISMATCH/);
  assert.deepEqual(parseFredCSV('observation_date,DGS2\n2026-09-25,.\n2026-09-26,3.51\n', 'DGS2'), [{date: '2026-09-26', value: 3.51}]);
  const kr3 = parseNaverSeries(await fx('naver-KR3YT.json')); assert.ok(kr3.length && kr3.at(-1).date === '2026-09-29' && kr3.at(-1).value === 4.072);
  const sox = parseNaverSeries(await fx('naver-SOX.json')); assert.equal(sox.find(r => r.date === '2026-09-29').value, 12629.16);
});

test('정정 추적: 같은 종목·날짜 값이 바뀌면 revisions · 당일 행은 잠정 표시', () => {
  const prev = [{code: '005930', fetchedAt: 'T1', rows: [{date: '2026-09-29', foreignNet: -100, institutionNet: 5, individualNet: 95, foreignHoldRatioPct: 46.5}]}];
  const cur = [{code: '005930', rows: [{date: '2026-09-29', foreignNet: -120, institutionNet: 5, individualNet: 115, foreignHoldRatioPct: 46.5}, {date: '2026-09-30', foreignNet: 1, institutionNet: 2, individualNet: 3, foreignHoldRatioPct: 46.4}]}];
  const rv = flowRevisions(prev, cur);
  assert.deepEqual(rv.map(r => [r.field, r.before, r.after]), [['foreignNet', -100, -120], ['individualNet', 95, 115]]);
  const m = markProvisional(cur, '2026-09-30'); assert.deepEqual(m[0].rows.map(r => r.status), ['reported', 'provisional_same_day']);
});

test('수집기(실제 응답 재생 · 두 종목): 지수·수급·뉴스·공시·거시를 모으고, 없는 자료는 0 이 아니라 오류로 · FRED 실패 시 대체 출처로 전환 · 예측 미사용', async () => {
  const dir = await setupRoot();
  const out = await collectContext({now: '2026-09-30T07:05:00.000Z', rootDir: dir, fixtures: FX, codes: ['005930', '196170']});
  assert.equal(out.status, 'partial'); assert.equal(out.day, '2026-09-30'); assert.equal(out.afterClose, true);
  const latest = JSON.parse(await fs.readFile(path.join(dir, 'reports/atlas11/context/latest.json'), 'utf8'));
  const ctx = JSON.parse(await fs.readFile(path.join(dir, latest.file), 'utf8'));
  assert.equal(ctx.usedInForecast, false); assert.equal(latest.usedInForecast, false);
  assert.deepEqual(ctx.index.map(i => i.symbol).sort(), ['KOSDAQ', 'KOSPI']);
  assert.equal(ctx.flows.length, 2); assert.equal(ctx.news.length, 2);
  assert.deepEqual(ctx.disclosures.map(d => d.code), ['005930'], '196170 공시는 응답이 없으므로 빈 목록으로 꾸미지 않는다');
  assert.ok(ctx.errors.some(e => e.kind === 'disclosures' && e.key === '196170'));
  const ids = ctx.macro.map(m => m.id);
  for (const id of ['DEXKOUS', 'FX_USDKRW', '.SOX', 'KR3YT=RR']) assert.ok(ids.includes(id), id);
  assert.equal(ctx.macro.find(m => m.id === '.VIX').switchedFrom, 'VIXCLS');
  assert.equal(ctx.macro.find(m => m.id === 'CLcv1').switchedFrom, 'DCOILWTICO');
  assert.ok(!ids.includes('SP500') && !ids.includes('KR10YT=RR'), '못 받은 시계열은 만들지 않는다');
  assert.equal(ctx.errors.find(e => e.key === 'WALCL')?.error, 'SOURCE_CIRCUIT_OPEN', '같은 출처가 연속 실패하면 차단기로 남은 요청을 멈춘다');
  for (const f of ctx.flows) for (const r of f.rows) for (const k of ['foreignNet', 'institutionNet', 'individualNet']) assert.ok(r[k] === null || Number.isFinite(r[k]));
  // 요인 현황: 관측 기록이지 예측 입력이 아님
  for (const id of ['F14', 'F16', 'F19', 'F30', 'F06', 'F09', 'F10', 'F03', 'F33']) { assert.equal(ctx.factors[id]?.observed, true, id); assert.equal(ctx.factors[id].usedInForecast, false); }
  assert.equal(ctx.factors.F16.componentOnly, true); assert.equal(ctx.factors.F14.stocks, 2);
  // 원문 보존 · 기록 장부
  const rawDir = path.join(dir, 'reports/atlas11/raw/context/2026-09-30'); const gz = (await fs.readdir(rawDir))[0];
  const raw = JSON.parse(zlib.gunzipSync(await fs.readFile(path.join(rawDir, gz))).toString());
  assert.ok(Object.keys(raw).some(u => u.includes('/trend?')) && Object.keys(raw).length === ctx.sources.filter(s => s.ok).length);
  const recs = await readRecords(dir, 'collection');
  const kinds = recs.map(r => r.body.kind);
  assert.equal(kinds.filter(k => k === 'context_market').length, 1); assert.equal(kinds.filter(k => k === 'context_flows').length, 2); assert.equal(kinds.filter(k => k === 'context_news').length, 2); assert.equal(kinds.filter(k => k === 'context_disclosures').length, 1);
  assert.ok(recs.every(r => r.body.usedInForecast === false));
  // 같은 시각 다시 실행 → 새 기록 0 (중복 실행 안전)
  const again = await collectContext({now: '2026-09-30T07:05:00.000Z', rootDir: dir, fixtures: FX, codes: ['005930', '196170']});
  assert.equal(again.records, 0);
  const s = summarizeContext(ctx); assert.equal(s.index.KOSPI.date, '2026-09-29'); assert.equal(s.index.KOSPI.status, 'earlier_day');
});

test('수집기: 값이 바뀐 수급은 정정 기록(잠정→확정) · 휴장일은 아무것도 쓰지 않음 · 15:40 전이면 당일 행을 버림', async () => {
  const dir = await setupRoot();
  await collectContext({now: '2026-09-30T07:05:00.000Z', rootDir: dir, fixtures: FX, codes: ['005930', '196170']});
  // 두 번째 수집: 삼성전자 9/29 외국인 값이 달라진 응답
  const fx2 = await tempRoot(); for (const f of await fs.readdir(FX)) await fs.copyFile(path.join(FX, f), path.join(fx2, f));
  const t = JSON.parse(await fs.readFile(path.join(fx2, 'flows-005930.json'), 'utf8')); t[0].foreignerPureBuyQuant = '-2,600,000'; await fs.writeFile(path.join(fx2, 'flows-005930.json'), JSON.stringify(t));
  const out = await collectContext({now: '2026-09-30T08:05:00.000Z', rootDir: dir, fixtures: fx2, codes: ['005930', '196170']});
  const latest = JSON.parse(await fs.readFile(path.join(dir, 'reports/atlas11/context/latest.json'), 'utf8'));
  const ctx = JSON.parse(await fs.readFile(path.join(dir, latest.file), 'utf8'));
  assert.deepEqual(ctx.revisions.map(r => [r.code, r.date, r.field, r.before, r.after]), [['005930', '2026-09-29', 'foreignNet', -2508369, -2600000]]);
  const recs = (await readRecords(dir, 'collection')).filter(r => r.body.kind === 'context_flows' && r.body.code === '005930');
  assert.ok(recs.some(r => r.body.status === '정정 있음' && r.body.revisions.length === 1));
  assert.ok(out.records >= 1);
  // 휴장일(10/5 월 · 개천절 대체공휴일)
  const d2 = await setupRoot(); const hol = await collectContext({now: '2026-10-05T07:05:00.000Z', rootDir: d2, fixtures: FX, codes: ['005930']});
  assert.equal(hol.status, 'not_trading_day'); await assert.rejects(fs.readdir(path.join(d2, 'reports/atlas11/context')));
  // 마감 전(9/29 14:00 KST) → 9/29 행 없음
  const d3 = await setupRoot(); await collectContext({now: '2026-09-29T05:00:00.000Z', rootDir: d3, fixtures: FX, codes: ['005930']});
  const l3 = JSON.parse(await fs.readFile(path.join(d3, 'reports/atlas11/context/latest.json'), 'utf8')); const c3 = JSON.parse(await fs.readFile(path.join(d3, l3.file), 'utf8'));
  assert.equal(c3.afterClose, false); assert.ok(c3.flows[0].rows.every(r => r.date < '2026-09-29')); assert.ok(c3.index.every(i => i.rows.every(r => r.date < '2026-09-29')));
});

test('가져오기: 제한된 재시도(1회) · 404 는 곧바로 포기 · 호스트 차단기', async () => {
  let calls = 0; const seq = [500, 200];
  const f1 = makeFetcher({retries: 1, fetchImpl: async () => { const s = seq[calls++]; return {ok: s === 200, status: s, text: async () => 'ok'}; }});
  const a = await f1.get('https://example.test/a'); assert.equal(a.ok, true); assert.equal(a.attempts.length, 2);
  let c404 = 0; const f2 = makeFetcher({retries: 3, fetchImpl: async () => { c404++; return {ok: false, status: 404, text: async () => ''}; }});
  assert.equal((await f2.get('https://example.test/b')).ok, false); assert.equal(c404, 1);
  const f3 = makeFetcher({retries: 0, breakerAfter: 2, fetchImpl: async () => { throw Error('down'); }});
  await f3.get('https://down.test/1'); await f3.get('https://down.test/2'); const third = await f3.get('https://down.test/3');
  assert.equal(third.error, 'SOURCE_CIRCUIT_OPEN');
});
