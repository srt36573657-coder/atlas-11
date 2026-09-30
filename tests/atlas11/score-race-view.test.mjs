import test from 'node:test';
import assert from 'node:assert/strict';
import {buildScoreboard, brierFor, isLivePublication} from '../../lib/atlas11/score.mjs';
import {buildRace} from '../../lib/atlas11/race.mjs';
import {buildViewBundle, validateViewBundle} from '../../lib/atlas11/view.mjs';
import {explainAsset} from '../../lib/atlas11/explain.mjs';
import {readAllPublications} from '../../lib/atlas11/forecast.mjs';
import {realInputs, readJSON, root} from './helpers.mjs';

async function latest() { return readJSON('reports/atlas11/versions/2026-09-28-atlas11-27e1f65cfc167be9.json'); }

test('채점: 발행 뒤 실제값만 · 실현값 없는 목표일은 채점하지 않음 · 보관 참조본 제외 · Brier', async () => {
  const {input, calendar} = await realInputs();
  const p = await latest();
  const publications = await readAllPublications(root);
  const sb = buildScoreboard({publications, input, calendar, now: '2026-09-28T13:40:00.000Z'});
  assert.equal(sb.targetDate, '2026-09-28');
  assert.equal(sb.firstScorableDate, '2026-09-29');
  assert.equal(sb.scoredDates, 0, '9/28 발행본의 목표일(9/29~)은 아직 실현값이 없다');
  assert.ok(sb.excluded.some(e => e.forecastId.startsWith('2026-09-23-rolling20')), '보관 종가 참조본은 기본 성적에서 제외');
  assert.ok(sb.livePublications.some(x => x.forecastId === p.forecastId));
  // 합성: 9/29 실제값이 들어오면 h=1 이 채점된다
  const future = structuredClone(input); const day = '2026-09-29';
  for (const a of future.assets) { const anchor = a.prices.at(-1).close; a.prices.push({date: day, close: Math.round(anchor * 1.02), quality: 'single_source', observedAt: day + 'T07:10:00.000Z', finalClose: true, finalizedAt: day + 'T07:10:00.000Z', finalitySourceUrl: 'https://example.test/final', finalityBasis: 'test'}); }
  future.actualAsOf = day;
  const sb2 = buildScoreboard({publications, input: future, calendar, now: '2026-09-29T08:00:00.000Z'});
  const d = sb2.byDate.find(x => x.date === day); assert.ok(d);
  assert.equal(d.horizonSummary[1].evaluated, 52); assert.equal(d.horizonSummary[5].evaluated, 0, '5거래일 전망은 아직 실현값 없음');
  const cell = d.rows[0].horizons[1]; assert.equal(cell.status, 'evaluated'); assert.equal(cell.observedDirection, 'up'); assert.ok(Number.isFinite(cell.brier)); assert.ok(cell.brier >= 0 && cell.brier <= 2);
  assert.ok(Math.abs(cell.ape - Math.abs(cell.forecast - cell.actual) / cell.actual * 100) < 1e-9);
  assert.ok(cell.forecastId.startsWith('2026-09-28-rolling20') || cell.forecastId.startsWith('2026-09-28-atlas11'), '같은 거래일 먼저 발행한 실시간 발행본 사용');
  assert.equal(brierFor({up: 1, flat: 0, down: 0}, 0.05), 0); assert.equal(brierFor({up: 0, flat: 0, down: 1}, 0.05), 2); assert.equal(brierFor(null, 0.05), null);
  assert.equal(isLivePublication({publicationStatus: 'stored_close_reference', dataStatus: 'stored_close'}), false);
});

test('1만원 비교: 52선 · 같은 시작일 1만원 · 순위 동률 규칙 · 두 순위 이름 분리', async () => {
  const p = await latest(); const r = buildRace(p);
  assert.equal(r.stocks.length, 52); assert.equal(r.dates.length, 41); assert.equal(r.actualDates.length, 21);
  for (const s of r.stocks) { assert.ok(Math.abs(s.actual[0].value - 10000) < 1e-9); assert.equal(s.forecast.length, 20); assert.equal(s.fromToday.length, 20); assert.ok(Math.abs(s.fromToday[19].value - 10000 * (1 + s.fromToday[19].return)) < 1e-6); }
  const last = r.dates.at(-1); assert.equal(r.levelRank[last].length, 52); assert.equal(new Set(r.levelRank[last]).size, 52);
  const values = Object.fromEntries(r.stocks.map(s => [s.code, s.forecast[19].value]));
  for (let i = 1; i < 52; i++) { const a = r.levelRank[last][i - 1], b = r.levelRank[last][i]; assert.ok(values[a] > values[b] || (values[a] === values[b] && a < b)); }
  assert.notEqual(r.names.level, r.names.futureReturn); assert.equal(r.forecastId, p.forecastId);
});

test('화면 묶음: 모든 화면 같은 발행본 · 카드/상세/1만원 숫자 일치 · 종목별 설명이 서로 다름 · 변조 시 실패', async () => {
  const {input, calendar} = await realInputs();
  const p = await latest(); const publications = await readAllPublications(root);
  const files = buildViewBundle({publication: p, input, calendar, publications, now: '2026-09-28T13:40:00.000Z'});
  assert.equal(files.size, 60);
  assert.equal(validateViewBundle(files, p), true);
  const m = files.get('manifest.json'); assert.equal(m.forecastId, p.forecastId); assert.equal(Object.keys(m.files).length, 59);
  // v5: 관계망 파일 · 카드/상세의 종목 정보 · 1만원 비교의 묶음 — 같은 발행본 · 같은 기준일 · 카드와 상세의 베타가 같음
  const net = files.get('network.json'); assert.equal(net.forecastId, p.forecastId); assert.equal(net.actualAsOf, p.actualAsOf); assert.equal(net.nodes.length, 52); assert.equal(net.groups.reduce((s, g) => s + g.codes.length, 0), 52);
  const c0 = files.get('cards.json').cards[0], d0 = files.get('stocks/' + c0.code + '.json'); assert.equal(c0.info.beta, d0.info.beta); assert.equal(d0.info.close, d0.anchor.close); assert.ok(d0.info.high52 >= d0.anchor.close && d0.info.low52 <= d0.anchor.close);
  assert.equal(files.get('race.json').groups.reduce((s, g) => s + g.count, 0), 52); assert.ok(files.get('race.json').stocks.every(s => s.group));
  const badNet = new Map(files); const n2 = structuredClone(net); n2.actualAsOf = '2020-01-01'; badNet.set('network.json', n2);
  assert.throws(() => validateViewBundle(badNet, p), /VIEW_NETWORK/);
  const texts = p.assets.map(a => files.get('stocks/' + a.code + '.json').explain[p.futureDates[3]].text); assert.equal(new Set(texts).size, 52);
  const tampered = new Map(files); const card = structuredClone(files.get('cards.json')); card.cards[0].close += 1; tampered.set('cards.json', card);
  assert.throws(() => validateViewBundle(tampered, p), /VIEW_ANCHOR/);
  const wrongId = new Map(files); const race = structuredClone(files.get('race.json')); race.forecastId = 'other'; wrongId.set('race.json', race);
  assert.throws(() => validateViewBundle(wrongId, p), /VIEW_FORECAST_ID_MISMATCH/);
  // v9 전망 헤드라인: 증거 그래프 마지막 값 = 카드 52장에서 센 「상승 선택」 수 = 발행본 값 · 한 숫자만 틀려도 실패
  const cj = files.get('cards.json'), upNow = p.assets.filter(a => a.rows[1].direction.daily.selected === 'up').length;
  assert.equal(cj.directionHistory.at(-1).date, p.futureDates[0]); assert.equal(cj.directionHistory.at(-1).predictedUp, upNow); assert.equal(cj.day1.up, upNow);
  assert.ok(cj.directionHistory.slice(0, -1).every(d => d.date < p.futureDates[0] && d.evaluated > 0 && d.actualUp != null), '앞 점들은 채점이 끝난 날만');
  const badHead = new Map(files); const cj2 = structuredClone(cj); cj2.directionHistory.at(-1).predictedUp += 1; badHead.set('cards.json', cj2);
  assert.throws(() => validateViewBundle(badHead, p), /VIEW_HEADLINE_FORECAST/);
});

test('v9 시장 띠: 수집 기록의 지수 행을 그대로 싣는다 · 숫자·날짜가 아니면 실패', async () => {
  const {input, calendar} = await realInputs();
  const p = await latest(); const publications = await readAllPublications(root);
  const marketIndex = {day: p.actualAsOf, fetchedAt: '2026-09-28T08:00:00Z', file: 'reports/atlas11/context/test.json', items: [{symbol: 'KOSPI', name: '코스피', date: p.actualAsOf, close: 6838.04, change: -32.77, changePct: -0.48, status: 'same_day', sourceName: '네이버 증권 지수', sourceUrl: 'https://m.stock.naver.com/api/index/KOSPI/price?pageSize=10&page=1', rawSHA256: 'a'.repeat(64)}]};
  const files = buildViewBundle({publication: p, marketIndex, input, calendar, publications, now: '2026-09-28T13:40:00.000Z'});
  const m = files.get('manifest.json'); assert.equal(m.market.items[0].close, 6838.04); assert.equal(m.market.items[0].changePct, -0.48); assert.equal(m.market.usedInForecast, false);
  const bad = new Map(files); const m2 = structuredClone(m); m2.market.items[0].close = null; bad.set('manifest.json', m2);
  assert.throws(() => validateViewBundle(bad, p), /VIEW_MARKET/);
});

test('날짜별 설명: 그 종목 숫자로 만든 문장 · 실제/출발/전망 구분 · 일정 사용 여부 명시', async () => {
  const p = await latest(); const a = p.assets.find(x => x.code === '005930');
  const e = explainAsset(a, {missingFactors: ['F06', 'F14']});
  assert.equal(Object.keys(e.byDate).length, 80);
  assert.equal(e.byDate[a.anchor.date].kind, 'anchor'); assert.equal(e.byDate[p.futureDates[0]].kind, 'forecast'); assert.equal(e.byDate[a.actual60[0].date].kind, 'actual');
  const x = e.byDate[p.futureDates[0]];
  assert.match(x.text, /중앙 전망/); assert.match(x.text, /모형 비율은 실제 적중률이 아닙니다/);
  assert.ok(x.events.every(ev => ev.used === false)); assert.ok(x.missing.length >= 2); assert.ok(x.sources.length >= 1);
});
