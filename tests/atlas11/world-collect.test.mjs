// 중국 · 일본 · 베트남 판 자료 받기(scripts/atlas11/world/collect.mjs)의 흐름 — 2026-10-07 05:25 「자 중국 일본 베트남 주식도 넣어라 미국 장 처럼 말이다」
// 네이버 증권 해외주식 · 야후 대신 이 시험이 만든 가짜 응답(fetch 바꿔 끼움)으로: 목록 → 결산(네이버 + 야후 부채) → 일봉 → 고르기 → 기사 · 지수 → 입력 파일
// 가짜 회사 · 값은 임시 폴더에만 쓴다. 실제 원문 모양은 깃허브 시험(reports/atlas11/world/probe/2026-10-07T03-20-34-289Z)으로 확인한 것.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const IND = Array.from({length: 90}, (_, i) => `업종${String(i).padStart(2, '0')}`);
const days = []; for (let d = new Date('2025-07-01T00:00:00Z'); d <= new Date('2026-10-02T00:00:00Z'); d = new Date(d.getTime() + 864e5)) if (d.getUTCDay() % 6) days.push(d.toISOString().slice(0, 10));
const makeCos = (exs, n, inds = 90) => Array.from({length: n}, (_, i) => ({sym: String(1000 + i), ex: exs[i % exs.length], ind: IND[i % inds], cap: 5e13 / (i + 1)}));
function fakeFetch(url, cos, suffix) {
  const u = new URL(url), ok = body => ({ok: true, status: 200, text: async () => JSON.stringify(body), headers: new Map()}); let m;
  if ((m = u.pathname.match(/\/stock\/exchange\/(\w+)\/marketValue$/))) {
    const page = Number(u.searchParams.get('page')), size = Number(u.searchParams.get('pageSize')), list = cos.filter(c => c.ex === m[1]);
    return ok({page, pageSize: size, totalCount: list.length, stocks: list.slice((page - 1) * size, page * size).map(c => ({stockEndType: c.sym === '1007' ? 'etf' : 'stock', reutersCode: c.sym + suffix, symbolCode: c.sym,
      stockName: '회사' + c.sym, stockNameEng: 'Company ' + c.sym, industryCodeType: {code: '5710', industryGroupKor: c.ind, name: 'Ind'}, marketValue: c.cap.toLocaleString('en-US'), closePrice: '1,000.0', stockExchangeType: {name: c.ex}}))});
  }
  if ((m = u.pathname.match(/\/stock\/([^/]+)\/finance\/annual$/))) {
    const i = Number(decodeURIComponent(m[1]).replace(/\D/g, '')), loss = i % 4 === 1;
    return ok({isExchangeable: true, unit: 'JPY(백만)', trTitleList: [{isConsensus: 'N', title: '2024.03.31', key: '2024.03.31'}, {isConsensus: 'N', title: '2025.03.31', key: '2025.03.31'}, {isConsensus: 'Y', title: '2026.03.31(E)', key: '2026.03.31'}],
      rowList: [['매출액', 100], ['EBIT', loss ? -5 : 20], ['당기순이익', loss ? -3 : 15], ['PER', 10], ['PBR', 1.2]].map(([title, v]) => ({title, columns: {'2024.03.31': {value: String(v)}, '2025.03.31': {value: String(v)}, '2026.03.31': {value: '999'}}}))});
  }
  if (u.host === 'query2.finance.yahoo.com') {
    const sym = u.searchParams.get('symbol'), i = Number(sym.replace(/\D/g, '')), liab = i % 7 === 0 ? 3000 : 800;
    const series = (type, v) => ({meta: {symbol: [sym], type: [type]}, [type]: [{asOfDate: '2024-03-31', reportedValue: {raw: v}}, {asOfDate: '2025-03-31', reportedValue: {raw: v}}]});
    return ok({timeseries: {result: [series('annualNetIncome', 150), series('annualOperatingIncome', 300), series('annualStockholdersEquity', 1000), series('annualTotalLiabilitiesNetMinorityInterest', liab)]}});
  }
  if ((m = u.pathname.match(/\/chart\/foreign\/item\/([^/]+)\/day$/))) {
    const i = Number(decodeURIComponent(m[1]).replace(/\D/g, '')), short = i % 50 === 3;
    return ok((short ? days.slice(-100) : days).map((d, k) => ({localDate: d.replace(/-/g, ''), closePrice: Number((2000 + (i % 13) * 10 + Math.sin(k / 9 + i) * 20).toFixed(1)), openPrice: 1, highPrice: 1, lowPrice: 1, accumulatedTradingVolume: 100})));
  }
  if (u.pathname.match(/\/chart\/foreign\/index\/([^/]+)\/day$/)) return ok(days.slice(-12).map((d, k) => ({localDate: d.replace(/-/g, ''), closePrice: 40000 + k * 10})));
  if ((m = u.pathname.match(/\/news\/worldStock\/([^/]+)$/))) { const s = decodeURIComponent(m[1]); return ok([{tit: `회사${s} 새 공장`, ohnm: '연합뉴스', dt: '20261004093000', oid: '001', aid: String(Number(s.replace(/\D/g, '')) + 1000)}]); }
  return {ok: false, status: 404, text: async () => 'not found', headers: new Map()};
}

async function runFake(market, exs, n, suffix, inds = 90) {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), `atlas-${market}-`)), cwd = process.cwd(), real = globalThis.fetch, cos = makeCos(exs, n, inds);
  globalThis.fetch = async u => fakeFetch(String(u), cos, suffix); process.env.ATLAS_WORLD_PAUSE = '0'; process.chdir(dir);
  try {
    const {collect} = await import(path.join(here, '../../scripts/atlas11/world/collect.mjs') + `?${market}${Date.now()}`);
    const r = await collect({market, mode: 'auto'});
    const input = JSON.parse(await fs.readFile(`public/data/atlas11/${market}/input.json`, 'utf8')), ctx = JSON.parse(await fs.readFile(`public/data/atlas11/${market}/context.json`, 'utf8'));
    const runs = await fs.readdir(`reports/atlas11/${market}/runs`);
    return {r, input, ctx, runs};
  } finally { process.chdir(cwd); globalThis.fetch = real; }
}

test('일본 판 자료 받기(가짜 응답): 도쿄 목록 → 결산(네이버 · 부채는 야후) → 일봉 → 365곳 · 추정 칸 버림 · ETF · 이력 짧은 회사 빠짐', async () => {
  const {r, input, ctx, runs} = await runFake('jp', ['TOKYO'], 2100, '.T');
  assert.equal(r.mode, 'select'); assert.equal(r.assets, 365);
  assert.equal(input.place, 'jp'); assert.match(input.universe.id, /^jp1-jp-n365-v1-\d{4}-\d{2}-\d{2}$/);
  assert.ok(!input.assets.some(a => a.code === '1007'), 'ETF 는 빠짐');
  assert.ok(!input.assets.some(a => Number(a.code) % 50 === 3), '일봉 100개뿐인 회사는 빠짐');
  assert.ok(input.assets.every(a => a.prices.length >= 240 && a.prices.every(p => p.close > 0)));
  const q = input.assets.find(a => a.quality.kind === 'quality');
  assert.equal(q.quality.metrics.debt, 80, '부채비율 = 야후 부채 총계 ÷ 자기자본(800 ÷ 1,000)');
  assert.equal(q.quality.metrics.source, 'naver+yahoo');
  assert.ok(!input.assets.some(a => a.quality.kind === 'quality' && Number(a.code) % 7 === 0), '부채비율 300% 회사는 우량 아님');
  assert.equal(ctx.index.length, 2); assert.ok(ctx.news.length >= 300);
  assert.equal(input.calendar.timezone, 'Asia/Tokyo'); assert.ok(runs.length === 1);
});

test('베트남 판(가짜 응답): 호찌민 · 하노이 · 업종 수는 5곳을 채운 만큼(73개보다 적음) · 야후는 .VN', async () => {
  const {r, input} = await runFake('vn', ['HOCHIMINH', 'HANOI'], 700, '.HM', 30); // 상장 약 700곳 · 업종 30개라고 해 봄
  assert.equal(input.place, 'vn'); assert.ok(r.assets > 0 && r.assets % 5 === 0 && r.assets < 365, `베트남 ${r.assets}곳`);
  assert.equal(input.assets.length / 5, Number(/업종 (\d+)개/.exec(input.universe.label)[1]));
});
