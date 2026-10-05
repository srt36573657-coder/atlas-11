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
function fakeFetch(url) {
  const u = new URL(url), ok = body => ({ok: true, status: 200, text: async () => JSON.stringify(body), headers: new Map()});
  let m;
  if ((m = u.pathname.match(/\/stock\/exchange\/(\w+)\/marketValue$/))) {
    const page = Number(u.searchParams.get('page')), size = Number(u.searchParams.get('pageSize')), list = companies.filter(c => c.ex === m[1]);
    return ok({stocks: list.slice((page - 1) * size, page * size).map(c => ({stockEndType: c.sym === 'S7' ? 'etf' : 'stock', reutersCode: c.sym + (c.ex === 'NASDAQ' ? '.O' : ''), symbolCode: c.sym, stockName: '회사' + c.sym.slice(1), stockNameEng: 'Company ' + c.sym,
      industryCodeType: {code: '5710', industryGroupKor: c.ind, name: 'Ind'}, marketValue: c.cap.toLocaleString('en-US'), closePrice: '10.00', stockExchangeType: {name: c.ex}})), totalCount: list.length});
  }
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

test('자료 받기 흐름(가짜 응답): 1,500곳 → 365곳 · 추정 칸 버림 · ETF 빠짐 · 이력 짧은 회사 빠짐 · 입력 · 기록 폴더', async () => {
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
    assert.ok(!input.assets.some(a => Number(a.code.slice(1)) % 50 === 3), '일봉 100개뿐인 회사는 빠짐');
    assert.ok(input.assets.every(a => a.prices.length >= 253 && a.prices.every(p => p.close > 0)));
    const q = input.assets.find(a => a.quality.kind === 'quality');
    assert.equal(q.quality.metrics.fiscalYear, '2025.12.', '추정(E) 칸은 버리고 마지막 확정 해');
    assert.ok(input.assets.filter(a => a.quality.kind === 'quality').length > 200);
    assert.ok(input.calendar.sessions.length >= 253);
    assert.equal(ctx.index.length, 3); assert.ok(ctx.news.length >= 300);
    const runs = await fs.readdir('reports/atlas11/us/runs'), run = path.join('reports/atlas11/us/runs', runs[0]);
    const files = (await fs.readdir(run)).sort();
    assert.deepEqual(files, ['candidates.json.gz', 'context.json.gz', 'history.json.gz', 'input.json.gz', 'log.json', 'proposal.json', 'samples']);
    const hist = JSON.parse(zlib.gunzipSync(await fs.readFile(path.join(run, 'history.json.gz'))).toString());
    assert.equal(Object.keys(hist.rows).length, 1500, '1,500곳 일봉(날짜 · 종가)을 모두 남김 — 규칙을 고칠 때 다시 받지 않게');
    const cand = JSON.parse(zlib.gunzipSync(await fs.readFile(path.join(run, 'candidates.json.gz'))).toString());
    assert.equal(cand.candidates.length, 1500);
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
