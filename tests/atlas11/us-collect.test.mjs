// 미국 판 자료 받기(scripts/atlas11/us/collect.mjs)의 흐름 — 2026-10-05 18:02 사장님 「이제는 미국 주식도 같은 개념으로 365개를 만들어라」
// 네이버 증권 해외주식 대신 이 시험이 만든 가짜 응답(fetch 바꿔 끼움)으로: 목록 → 결산 → 일봉 → 365곳 → 기사·지수 → 입력 파일 · 기록 폴더
// 가짜 회사 · 값은 임시 폴더에만 쓴다(저장소 자료 · 화면에는 쓰지 않음). 실제 원문 모양은 깃허브 시험(reports/atlas11/us/probe)으로 확인한다.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import zlib from 'node:zlib';
import {fileURLToPath} from 'node:url';
import {parseList, parseDay, parseFinance, metricsOf, parseUsNews, parseIndex, hangeulAmount, codeOf, dayOf} from '../../lib/atlas11/us/naver.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const IND = Array.from({length: 90}, (_, i) => `업종${String(i).padStart(2, '0')}`);
const days = []; for (let d = new Date('2025-07-01T00:00:00Z'); d <= new Date('2026-10-02T00:00:00Z'); d = new Date(d.getTime() + 864e5)) if (d.getUTCDay() % 6) days.push(d.toISOString().slice(0, 10));
const companies = Array.from({length: 1650}, (_, i) => ({sym: 'S' + i, ex: i % 10 === 9 ? 'AMEX' : i % 2 ? 'NASDAQ' : 'NYSE', ind: IND[i % 90], cap: 5e12 / (i + 1)}));
const nq = v => v == null ? '--' : (v < 0 ? '-$' : '$') + Math.abs(v).toLocaleString('en-US');
function fakeFetch(url) {
  const u = new URL(url), ok = body => ({ok: true, status: 200, text: async () => JSON.stringify(body), headers: new Map()});
  let m;
  // 나스닥 종목표(나라) — S11 · S12 는 캐나다 회사라고 해 본다
  if (u.host === 'api.nasdaq.com' && u.pathname === '/api/screener/stocks') return ok({data: {rows: companies.map(c => ({symbol: c.sym, country: /^S1[12]$/.test(c.sym) ? 'Canada' : 'United States', marketCap: String(c.cap)}))}});
  // 나스닥 결산표 — S5 로 끝나는 회사는 없음(404 → 네이버 결산으로) · S2 로 끝나면 자기자본 마이너스
  if (u.host === 'api.nasdaq.com' && (m = u.pathname.match(/^\/api\/company\/([^/]+)\/financials$/))) {
    const sym = decodeURIComponent(m[1]), i = Number(sym.replace(/\D/g, ''));
    if (i % 10 === 5) return {ok: false, status: 404, text: async () => '{"data":null}', headers: new Map()};
    const loss = i % 4 === 1, eq = i % 10 === 2 ? -500 : 1000, liab = i % 7 === 0 ? 3000 : 800;
    const hd = {value1: 'Period Ending:', value2: '12/31/2025', value3: '12/31/2024', value4: '12/31/2023', value5: '12/31/2022'}, row = (label, v) => ({value1: label, value2: nq(v), value3: nq(v), value4: nq(v), value5: nq(v)});
    return ok({data: {symbol: sym, incomeStatementTable: {headers: hd, rows: [row('Total Revenue', 5000), row('Operating Income', loss ? -50 : 300), row('Net Income', loss ? -30 : 150)]},
      balanceSheetTable: {headers: hd, rows: [row('Total Liabilities', liab), row('Total Equity', eq)]}, financialRatiosTable: {headers: hd, rows: [{value1: 'After Tax ROE', value2: '15%', value3: '15%', value4: '15%', value5: '15%'}]}}, status: {rCode: 200}});
  }
  if ((m = u.pathname.match(/\/stock\/exchange\/(\w+)\/marketValue$/))) {
    const page = Number(u.searchParams.get('page')), size = Number(u.searchParams.get('pageSize')), list = companies.filter(c => c.ex === m[1]);
    return ok({stocks: list.slice((page - 1) * size, page * size).map(c => ({stockEndType: c.sym === 'S7' ? 'etf' : 'stock', reutersCode: c.sym + (c.ex === 'NASDAQ' ? '.O' : ''), symbolCode: c.sym, stockName: '회사' + c.sym.slice(1), stockNameEng: 'Company ' + c.sym,
      industryCodeType: {code: '5710', industryGroupKor: c.ind, name: 'Ind'}, marketValue: c.cap.toLocaleString('en-US'), closePrice: '10.00', stockExchangeType: {name: c.ex}})), totalCount: list.length});
  }
  // 결산은 첫 길(api.stock.naver.com)이 막히고(409) 둘째 길(m.stock.naver.com/api)만 열린다고 해 본다 — 길 바꾸기 시험
  if (u.host === 'api.stock.naver.com' && /\/finance\/annual$/.test(u.pathname)) return {ok: false, status: 409, text: async () => 'conflict', headers: new Map()};
  if ((m = u.pathname.match(/\/stock\/([^/]+)\/finance\/annual$/))) {
    const i = Number(decodeURIComponent(m[1]).replace(/\D/g, '')), loss = i % 4 === 1;
    return ok({financeInfo: {trTitleList: [{isConsensus: 'N', title: '2023.12.', key: '202312'}, {isConsensus: 'N', title: '2024.12.', key: '202412'}, {isConsensus: 'N', title: '2025.12.', key: '202512'}, {isConsensus: 'Y', title: '2026.12.(E)', key: '202612'}],
      rowList: [['매출액', 100], ['영업이익', loss ? -5 : 20], ['당기순이익', loss ? -3 : 15], ['ROE', 12], ['부채비율', i % 7 === 0 ? 300 : 80]].map(([title, v]) => ({title, columns: {202312: {value: String(v)}, 202412: {value: String(v)}, 202512: {value: String(v)}, 202612: {value: '-999'}}}))}});
  }
  if ((m = u.pathname.match(/\/chart\/foreign\/item\/([^/]+)\/day$/))) {
    const i = Number(decodeURIComponent(m[1]).replace(/\D/g, '')), short = i % 50 === 3;
    return ok((short ? days.slice(-100) : days).map((d, k) => ({localDate: d.replace(/-/g, ''), closePrice: Number((20 + (i % 13) + Math.sin(k / 9 + i) * 2).toFixed(2)), openPrice: 1, highPrice: 1, lowPrice: 1, accumulatedTradingVolume: 1000})));
  }
  if ((m = u.pathname.match(/\/chart\/foreign\/index\/([^/]+)\/day$/))) return ok(days.slice(-12).map((d, k) => ({localDate: d.replace(/-/g, ''), closePrice: 6000 + k * 10})));
  if ((m = u.pathname.match(/\/news\/worldStock\/([^/]+)$/))) { const s = decodeURIComponent(m[1]).replace(/\.O$/, ''); return ok([{tit: `회사${s.slice(1)} 신제품 발표`, ohnm: '연합뉴스', dt: '20261004093000', oid: '001', aid: '00' + s.slice(1)}, {tit: '증시 마감 시황', ohnm: '뉴시스', dt: '20261004100000', oid: '003', aid: '9' + s.slice(1)}]); }
  return {ok: false, status: 404, text: async () => 'not found', headers: new Map()};
}

test('자료 받기 흐름(가짜 응답): 후보 전부 → 365곳 · 추정 칸 버림 · ETF 빠짐 · 이력 짧은 회사 빠짐 · 입력 · 기록 폴더', async () => {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'atlas-usc-')), cwd = process.cwd(), real = globalThis.fetch;
  globalThis.fetch = async url => fakeFetch(String(url));
  process.env.ATLAS_US_PAUSE = '0';
  process.chdir(dir);
  try {
    const {collect} = await import(path.join(here, '../../scripts/atlas11/us/collect.mjs') + '?t=' + Date.now());
    const r = await collect({mode: 'auto'});
    assert.equal(r.mode, 'select'); assert.equal(r.assets, 365);
    const input = JSON.parse(await fs.readFile('public/data/atlas11/us/input.json', 'utf8')), ctx = JSON.parse(await fs.readFile('public/data/atlas11/us/context.json', 'utf8'));
    assert.equal(input.place, 'us'); assert.equal(input.assets.length, 365); assert.match(input.universe.id, /^us1-n365-v1-\d{4}-\d{2}-\d{2}$/);
    assert.ok(!input.assets.some(a => a.code === 'S7'), 'ETF 는 빠짐');
    assert.ok(!input.assets.some(a => a.code === 'S11' || a.code === 'S12'), '나라가 캐나다인 회사는 빠짐(미국 회사만)');
    assert.ok(!input.assets.some(a => Number(a.code.slice(1)) % 10 === 2 && a.quality.kind === 'quality'), '자기자본 마이너스 회사는 우량이 아님');
    const src = input.assets.reduce((t, a) => (t[a.quality.metrics?.source] = (t[a.quality.metrics?.source] ?? 0) + 1, t), {});
    assert.ok(src.nasdaq > 200 && src.naver > 0, `결산은 나스닥 먼저 · 없으면 네이버(${JSON.stringify(src)})`);
    assert.ok(!input.assets.some(a => Number(a.code.slice(1)) % 50 === 3), '일봉 100개뿐인 회사는 빠짐');
    assert.ok(input.assets.every(a => a.prices.length >= 253 && a.prices.every(p => p.close > 0)));
    const qn = input.assets.find(a => a.quality.kind === 'quality' && a.quality.metrics.source === 'naver');
    if (qn) assert.equal(qn.quality.metrics.fiscalYear, '2025.12.', '네이버 결산: 추정(E) 칸은 버리고 마지막 확정 해');
    const q = input.assets.find(a => a.quality.kind === 'quality' && a.quality.metrics.source === 'nasdaq');
    assert.equal(q.quality.metrics.fiscalYear, '2025-12-31', '나스닥 결산: 가장 최근 결산 해');
    assert.equal(q.quality.metrics.debt, 80, '부채비율 = 부채 총계 ÷ 자기자본(800 ÷ 1,000)');
    assert.equal(q.quality.metrics.roe, 15, 'ROE = 순이익 ÷ 자기자본(150 ÷ 1,000)');
    assert.ok(input.assets.filter(a => a.quality.kind === 'quality').length > 200);
    assert.ok(input.calendar.sessions.length >= 253);
    assert.equal(ctx.index.length, 3); assert.ok(ctx.news.length >= 300);
    const runs = await fs.readdir('reports/atlas11/us/runs'), run = path.join('reports/atlas11/us/runs', runs[0]);
    const lg = JSON.parse(await fs.readFile(path.join(run, 'log.json'), 'utf8'));
    assert.ok(lg.steps.some(x => x.name === '길' && x.kind === 'finance' && x.way === 1), '결산 첫 길이 막히면 둘째 길로 바꿔 끝까지 받음');
    assert.ok((lg.failures.finance ?? 0) <= 6, '길을 바꾼 뒤로는 첫 길을 다시 두드리지 않음(처음 함께 나간 6개만 막힘 · 그것도 둘째 길이 받아 냄)');
    const files = (await fs.readdir(run)).sort();
    assert.deepEqual(files, ['candidates.json.gz', 'context.json.gz', 'history.json.gz', 'input.json.gz', 'log.json', 'proposal.json', 'samples']);
    const hist = JSON.parse(zlib.gunzipSync(await fs.readFile(path.join(run, 'history.json.gz'))).toString());
    assert.equal(Object.keys(hist.rows).length, companies.length - 1, '후보 모두의 일봉(날짜 · 종가)을 남김 — 규칙을 고칠 때 다시 받지 않게(ETF 1곳만 목록에서 빠짐)');
    const cand = JSON.parse(zlib.gunzipSync(await fs.readFile(path.join(run, 'candidates.json.gz'))).toString());
    assert.equal(cand.candidates.length, companies.length - 1);
    // 두 번째는 같은 365곳 그대로(update) — 일봉만 새로
    const r2 = await collect({mode: 'auto'});
    assert.equal(r2.mode, 'update');
    const again = JSON.parse(await fs.readFile('public/data/atlas11/us/input.json', 'utf8'));
    assert.deepEqual(again.assets.map(a => a.code), input.assets.map(a => a.code));
    assert.deepEqual(again.universe, input.universe);
  } finally { process.chdir(cwd); globalThis.fetch = real; await fs.rm(dir, {recursive: true, force: true}); }
});

test('원문 읽기 조각 — 숫자 · 날짜 · 한글 금액 · 기호 · 추정 칸 · 기사 주소', () => {
  assert.equal(hangeulAmount('3조 4,568억'), 3.4568e12);
  assert.equal(codeOf('brk/b', 'BRKb'), 'BRK.B'); assert.equal(codeOf('', 'JPM.N'), 'JPM'); assert.equal(codeOf('A^B', ''), null);
  assert.equal(dayOf('20251003'), '2025-10-03'); assert.equal(dayOf('2025.10.03'), '2025-10-03'); assert.equal(dayOf('2025-10-03T16:00:00-04:00'), '2025-10-03');
  const L = parseList({stocks: [{reutersCode: 'AAPL.O', symbolCode: 'AAPL', stockName: '애플', industryCodeType: {industryGroupKor: '컴퓨터·휴대폰'}, marketValueHangeul: '5,000조원'}]}, 'NASDAQ');
  assert.equal(L.items[0].capUsd, 5e15); assert.equal(L.items[0].industry, '컴퓨터·휴대폰'); assert.equal(L.items[0].name, '애플');
  assert.deepEqual(parseDay([{localDate: '20251002', closePrice: '1,234.5'}, {localDate: '20251001', closePrice: 0}]), [{date: '2025-10-02', close: 1234.5, open: null, high: null, low: null, volume: null}]);
  const f = parseFinance({financeInfo: {trTitleList: [{key: 'a', title: '2024', isConsensus: 'N'}, {key: 'b', title: '2025(E)', isConsensus: 'N'}], rowList: [{title: '영업이익', columns: {a: {value: '1'}, b: {value: '2'}}}]}});
  assert.deepEqual(f.cols.map(c => c.key), ['a'], '「(E)」 제목도 추정으로 봄'); assert.equal(f.droppedEstimates, 1);
  assert.equal(metricsOf({cols: [], rows: {}}), null);
  const n = parseUsNews([{tit: '애플 &amp; 신제품', ohnm: '연합뉴스', dt: '20261004093000', oid: '001', aid: '0001'}], 'AAPL');
  assert.equal(n.items[0].title, '애플 & 신제품'); assert.equal(n.items[0].url, 'https://n.news.naver.com/mnews/article/001/0001'); assert.equal(n.items[0].publishedAt, '2026-10-04T09:30:00+09:00');
  assert.deepEqual(parseIndex({result: [{localTradedAt: '2026-10-01', closePrice: '100'}, {localTradedAt: '2026-10-02', closePrice: '101'}]}).map(r => r.changePct), [1]);
});

test('나스닥 결산표 읽기 — 돈 글자 · 날짜 · 영업이익 · 순이익 · ROE · 부채비율 · 자기자본 마이너스', async () => {
  const {money, mdy, parseNasdaqFin, nasdaqMetrics, parseScreener} = await import('../../lib/atlas11/us/nasdaq.mjs');
  assert.equal(money('$416,161,000'), 416161000); assert.equal(money('-$321,000'), -321000); assert.equal(money('($5)'), -5); assert.equal(money('--'), null); assert.equal(money('151.9%'), 151.9);
  assert.equal(mdy('9/27/2025'), '2025-09-27');
  // 2026-10-05 19:39 깃허브 실행기 시험에서 받은 애플 결산표 모양 그대로(숫자는 그 원문 값)
  const hd = {value1: 'Period Ending:', value2: '9/27/2025', value3: '9/28/2024', value4: '9/30/2023', value5: '9/24/2022'};
  const j = {data: {symbol: 'AAPL', incomeStatementTable: {headers: hd, rows: [{value1: 'Operating Income', value2: '$133,050,000', value3: '$123,216,000', value4: '$114,301,000', value5: '$119,437,000'}, {value1: 'Net Income', value2: '$112,010,000', value3: '$93,736,000', value4: '$96,995,000', value5: '$99,803,000'}]},
    balanceSheetTable: {headers: hd, rows: [{value1: 'Total Liabilities', value2: '$285,508,000', value3: '$308,030,000', value4: '', value5: ''}, {value1: 'Total Equity', value2: '$73,733,000', value3: '$56,950,000', value4: '', value5: ''}]}}};
  const m = nasdaqMetrics(parseNasdaqFin(j));
  assert.equal(m.fiscalYear, '2025-09-27'); assert.equal(m.prevYear, '2024-09-28');
  assert.equal(m.op, 133050000); assert.equal(m.opPrev, 123216000); assert.equal(m.net, 112010000); assert.equal(m.netPrev, 93736000);
  assert.equal(m.roe, 151.91, 'ROE = 112,010 ÷ 73,733 — 나스닥 「After Tax ROE 151.91298%」와 같음');
  assert.equal(m.debt, 387.22, '부채비율 = 285,508 ÷ 73,733');
  const neg = nasdaqMetrics(parseNasdaqFin({data: {incomeStatementTable: {headers: hd, rows: [{value1: 'Net Income', value2: '$5'}]}, balanceSheetTable: {headers: hd, rows: [{value1: 'Total Equity', value2: '-$10'}, {value1: 'Total Liabilities', value2: '$50'}]}}}));
  assert.equal(neg.equityNeg, true); assert.equal(neg.roe, null); assert.equal(neg.debt, null);
  assert.equal(nasdaqMetrics(parseNasdaqFin({data: null})), null);
  const sc = parseScreener({data: {rows: [{symbol: 'BRK/B', country: 'United States', marketCap: '1000.00'}, {symbol: 'RY', country: 'Canada'}]}});
  assert.equal(sc.get('BRK.B').country, 'United States'); assert.equal(sc.get('RY').country, 'Canada');
});
