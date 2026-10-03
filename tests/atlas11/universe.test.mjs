// 「튼튼한 회사 52곳」 고르기 — 2026-10-04 사장님 「오를 수 있는 52개 우량 종목을 찾아 첫 화면에 배열하는 구조로 싹 변경」 · 「알아서 해」
// 회사 요약(integration)은 2026-09-29 실제 응답(reports/atlas11/probe/deep)으로, 나머지는 합성 원문(실제 시세·실제 결산 아님)으로 검사한다.
import test from 'node:test';
import assert from 'node:assert/strict';
import {QUALITY52, num, koreanAmountEok, parseIntegration, parseMarketSumHtml, parseMarketValueJson, parseUpjongList, parseCopAnalysisHtml, parseFinanceJson, financeMetrics, historyCheck, selectQuality52, failsOf} from '../../lib/atlas11/universe.mjs';
import {collectBundle, proposeFromBundle, lastCompletedSession, URLS} from '../../scripts/atlas11/collect_universe.mjs';
import {groupsFor, FROZEN_GROUPS, groupIdOfSector, makeGroupOf} from '../../lib/atlas11/groups.mjs';
import {readJSON} from './helpers.mjs';
import fs from 'node:fs/promises';

test('숫자 풀기: 쉼표·단위·조억', () => {
  assert.equal(num('22,292원'), 22292); assert.equal(num('12.34배'), 12.34); assert.equal(num('-1,234'), -1234); assert.equal(num('N/A'), null); assert.equal(num('-'), null); assert.equal(num(''), null);
  assert.equal(koreanAmountEok('1,607조 7,266억'), 16077266); assert.equal(koreanAmountEok('7,266억'), 7266); assert.equal(koreanAmountEok('3조'), 30000);
});

test('회사 요약: 2026-09-29 실제 응답에서 시총·PER·EPS·업종번호', async () => {
  const text = await fs.readFile('reports/atlas11/probe/deep/naver-integration-005930.json', 'utf8');
  const x = parseIntegration(text);
  assert.equal(x.code, '005930'); assert.equal(x.name, '삼성전자'); assert.equal(x.endType, 'stock'); assert.equal(x.industryCode, '278');
  assert.equal(x.marketCapEok, 16077266); assert.equal(x.per, 12.34); assert.equal(x.eps, 22292); assert.equal(x.bps, 86052); assert.equal(x.pbr, 3.2);
});

const MARKET_SUM = `<table class="type_2"><thead><tr><th scope="col">N</th><th scope="col">종목명</th><th scope="col">현재가</th><th scope="col">전일비</th><th scope="col">등락률</th><th scope="col">액면가</th><th scope="col">시가총액</th><th scope="col">상장주식수</th></tr></thead>
<tbody><tr><td class="no">1</td><td><a href="/item/main.naver?code=005930" class="tltle">삼성전자</a></td><td class="number">276,000</td><td class="number"><span class="tah p11 red02">6,000</span></td><td class="number"><span>+2.22%</span></td><td class="number">100</td><td class="number">1,640,000</td><td class="number">5,919,638</td></tr>
<tr><td class="no">2</td><td><a href="/item/main.naver?code=000660" class="tltle">SK하이닉스</a></td><td class="number">1,790,000</td><td class="number">0</td><td class="number">0.00%</td><td class="number">5,000</td><td class="number">1,303,000</td><td class="number">728,002</td></tr></tbody></table>`;
test('시가총액 표(HTML): 머리글로 「시가총액」 칸을 찾는다', () => {
  const rows = parseMarketSumHtml(MARKET_SUM, 'KOSPI');
  assert.deepEqual(rows.map(r => [r.code, r.name, r.listValue]), [['005930', '삼성전자', 1640000], ['000660', 'SK하이닉스', 1303000]]);
  assert.deepEqual(parseMarketValueJson(JSON.stringify({stocks: [{itemCode: '005930', stockName: '삼성전자', stockEndType: 'stock', marketValue: '1,607,726,600'}]}), 'KOSPI').map(r => r.listValue), [1607726600]);
  assert.deepEqual(parseUpjongList('<a href="/sise/sise_group_detail.naver?type=upjong&no=278">반도체와반도체장비</a><a href="/sise/sise_group_detail.naver?type=upjong&amp;no=301">은행</a>'), [{no: '278', name: '반도체와반도체장비'}, {no: '301', name: '은행'}]);
});

const COP = (vals, est = true) => `<div class="section cop_analysis"><table class="tb_type1 tb_num tb_type1_ifrs"><thead>
<tr><th rowspan="3">주요재무정보</th><th colspan="4">최근 연간 실적</th><th colspan="6">최근 분기 실적</th></tr>
<tr><th scope="col">2023.12</th><th scope="col">2024.12</th><th scope="col">2025.12</th><th scope="col">2026.12${est ? '<br><em>(E)</em>' : ''}</th><th scope="col">2025.06</th><th scope="col">2025.09</th></tr>
<tr><th>IFRS연결</th></tr></thead><tbody>
${Object.entries(vals).map(([k, v]) => `<tr><th scope="row" class="h_th2"><strong>${k}</strong></th>${v.map(x => `<td class="">${x}</td>`).join('')}<td>1</td><td>2</td></tr>`).join('\n')}
</tbody></table></div>`;
test('기업실적분석 표(HTML): 연간 칸만 · 추정(E)은 빼고 마지막 두 해', () => {
  const fin = parseCopAnalysisHtml('<html>' + COP({'매출액': ['100', '120', '130', '140'], '영업이익': ['10', '-5', '20', '25'], '당기순이익': ['8', '3', '15', '18'], 'ROE(지배주주)': ['9.1', '3.2', '12.5', '13.0'], '부채비율': ['80.5', '90.1', '70.2', ''], '영업이익률': ['10', '-4', '15.4', '17']}) + '</html>');
  assert.deepEqual(fin.periods.map(p => [p.key, p.consensus]), [['2023.12', false], ['2024.12', false], ['2025.12', false], ['2026.12', true]]);
  const m = financeMetrics(fin);
  assert.deepEqual([m.fiscalYear, m.prevYear, m.op, m.opPrev, m.net, m.netPrev, m.roe, m.debt], ['2025.12', '2024.12', 20, -5, 15, 3, 12.5, 70.2]);
  const j = parseFinanceJson(JSON.stringify({financeInfo: {trTitleList: [{isConsensus: 'N', title: '2024.12.', key: '202412'}, {isConsensus: 'N', title: '2025.12.', key: '202512'}, {isConsensus: 'Y', title: '2026.12.', key: '202612'}],
    rowList: [{title: '영업이익', columns: {202412: {value: '1,000'}, 202512: {value: '1,200'}, 202612: {value: '1,500'}}}, {title: '당기순이익', columns: {202412: {value: '800'}, 202512: {value: '900'}}}, {title: 'ROE', columns: {202512: {value: '11.2'}}}, {title: '부채비율', columns: {202512: {value: '45.6'}}}]}}));
  assert.deepEqual(Object.values(financeMetrics(j)).slice(1), ['2025.12', '2024.12', null, 1200, 1000, 900, 800, 11.2, 45.6, null]);
});

test('가격 이력 점검: 600일 · 마지막 505거래일에 빠진 날이 없어야 · 거래정지 날(회사 분할·액면분할)은 종가가 있으니 괜찮음(q52-v2)', async () => {
  const sessions = (await readJSON('public/data/rolling-calendar.json')).sessions.filter(d => d <= '2026-10-02');
  const rows = sessions.map((d, i) => ({date: d, close: 1000 + i, volume: 10}));
  assert.equal(historyCheck(rows, sessions, {asOf: '2026-10-02'}).ok, true);
  assert.equal(historyCheck(rows.filter(r => r.date !== '2026-05-06'), sessions, {asOf: '2026-10-02'}).ok, false);
  const halted = rows.map(r => r.date === '2026-09-01' ? {...r, volume: 0} : r);
  assert.equal(historyCheck(halted, sessions, {asOf: '2026-10-02'}).halted, 1); assert.equal(historyCheck(halted, sessions, {asOf: '2026-10-02'}).ok, true);
  assert.equal(historyCheck(halted, sessions, {asOf: '2026-10-02', haltedDaysAllowed: false}).ok, false, 'q52-v1 은 멈춘 날도 뺐다');
  assert.equal(historyCheck(rows.slice(-599), sessions, {asOf: '2026-10-02'}).ok, false);
  assert.equal(lastCompletedSession(sessions.concat(['2026-10-06']), '2026-10-06T06:00:00Z'), '2026-10-02'); // 15:00 KST — 장이 안 끝남
  assert.equal(lastCompletedSession(sessions.concat(['2026-10-06']), '2026-10-06T06:45:00Z'), '2026-10-06');
});

// 합성 후보: 업종 16개 × 5곳 = 80곳 + 우선주·스팩 · 몇 곳은 일부러 문에 걸린다
const SECTORS = ['반도체와반도체장비', '은행', '자동차', '화학', '제약', '조선', '식품', '건설', '증권', '철강', '게임엔터테인먼트', '화장품', '전기장비', '손해보험', '기계', '해운사'];
function world() {
  const list = [];
  SECTORS.forEach((s, si) => { for (let k = 0; k < 5; k++) { const n = si * 5 + k, code = String(100000 + n * 10).padStart(6, '0'); list.push({code, name: `합성${n}`, sector: s, upjongNo: String(200 + si), cap: 900000 - n * 9000, roe: 4 + ((n * 7) % 20), debt: 30 + ((n * 37) % 200), op: n % 13 === 5 ? -1 : 100 + n, opPrev: n % 17 === 3 ? -2 : 90 + n, net: 50 + n, netPrev: 40 + n}); } });
  list.push({code: '100005', name: '합성0우', sector: '반도체와반도체장비', upjongNo: '200', cap: 1, roe: 30, debt: 10, op: 1, opPrev: 1, net: 1, netPrev: 1});
  list.push({code: '199990', name: '합성스팩1호', sector: '증권', upjongNo: '208', cap: 2, roe: 30, debt: 10, op: 1, opPrev: 1, net: 1, netPrev: 1});
  return list;
}
function fakeFetch(stocks, sessions, {kosdaqJson = false, htmlFinance = new Set(), noLists = false} = {}) {
  const kospi = stocks.filter((s, i) => i % 3 !== 2), kosdaq = stocks.filter((s, i) => i % 3 === 2);
  const res = (body, type = 'application/json') => new Response(body, {status: 200, headers: {'content-type': type + '; charset=utf-8'}});
  const no = () => new Response('no', {status: 404});
  return async url => {
    const u = new URL(url), by = code => stocks.find(s => s.code === code);
    let m;
    if ((m = /\/api\/stocks\/marketValue\/(KOSPI|KOSDAQ)/.exec(u.pathname))) {
      if (noLists || (m[1] === 'KOSDAQ' && !kosdaqJson)) return no();
      const pg = Number(u.searchParams.get('page')), arr = (m[1] === 'KOSPI' ? kospi : kosdaq).slice((pg - 1) * 100, pg * 100);
      return res(JSON.stringify({stocks: arr.map(s => ({itemCode: s.code, stockName: s.name, stockEndType: 'stock', marketValue: String(s.cap * 100)}))}));
    }
    if (u.pathname === '/sise/sise_market_sum.naver') {
      if (noLists) return no();
      const pg = Number(u.searchParams.get('page')), arr = (u.searchParams.get('sosok') === '0' ? kospi : kosdaq).slice((pg - 1) * 50, pg * 50);
      return res(`<table class="type_2"><tr><th>N</th><th>종목명</th><th>현재가</th><th>시가총액</th></tr>${arr.map(s => `<tr><td>1</td><td><a href="/item/main.naver?code=${s.code}" class="tltle">${s.name}</a></td><td>1</td><td>${s.cap}</td></tr>`).join('')}</table>`, 'text/html');
    }
    if (u.pathname === '/sise/sise_group.naver') return res([...new Set(stocks.map(s => s.upjongNo + '|' + s.sector))].map(x => { const [n, name] = x.split('|'); return `<a href="/sise/sise_group_detail.naver?type=upjong&no=${n}">${name}</a>`; }).join(''), 'text/html');
    if ((m = /\/api\/stock\/(\d{6})\/integration/.exec(u.pathname))) { const s = by(m[1]); return s ? res(JSON.stringify({itemCode: s.code, stockName: s.name, stockEndType: 'stock', industryCode: s.upjongNo, totalInfos: [{code: 'marketValue', value: `${s.cap.toLocaleString('en-US')}억`}, {code: 'per', value: '10.0배'}, {code: 'eps', value: '1,000원'}, {code: 'bps', value: '9,000원'}], industryCompareInfo: stocks.filter(x => x.sector === s.sector && x.code !== s.code).map(x => ({itemCode: x.code, stockName: x.name}))})) : no(); }
    if ((m = /\/api\/stock\/(\d{6})\/finance\/annual/.exec(u.pathname))) {
      const s = by(m[1]); if (!s || htmlFinance.has(s.code)) return no();
      const col = (a, b) => ({202412: {value: String(a)}, 202512: {value: String(b)}});
      return res(JSON.stringify({financeInfo: {trTitleList: [{isConsensus: 'N', title: '2024.12.', key: '202412'}, {isConsensus: 'N', title: '2025.12.', key: '202512'}, {isConsensus: 'Y', title: '2026.12.', key: '202612'}],
        rowList: [{title: '영업이익', columns: col(s.opPrev, s.op)}, {title: '당기순이익', columns: col(s.netPrev, s.net)}, {title: 'ROE', columns: col(s.roe, s.roe)}, {title: '부채비율', columns: col(s.debt, s.debt)}]}}));
    }
    if (u.pathname === '/item/main.naver') { const s = by(u.searchParams.get('code')); return s ? res(COP({'영업이익': [1, s.opPrev, s.op, 9], '당기순이익': [1, s.netPrev, s.net, 9], 'ROE(지배주주)': [1, s.roe, s.roe, 9], '부채비율': [1, s.debt, s.debt, 9]}), 'text/html') : no(); }
    if (u.hostname === 'fchart.stock.naver.com') {
      const s = by(u.searchParams.get('symbol')); if (!s) return no();
      const n = Number(s.code.slice(0, 5)) % 97, rows = sessions.filter(d => !(s.code === '100150' && d === '2026-08-03')).map((d, i) => `<item data="${d.replaceAll('-', '')}|${n + 1000 + i}|${n + 1010 + i}|${n + 990 + i}|${n + 1000 + i}|${s.code === '100160' && d === '2026-08-03' ? 0 : 100 + i}" />`);
      return res(`<?xml version="1.0" encoding="EUC-KR" ?><protocol><chartdata symbol="${s.code}" name="${s.name}" count="840" timeframe="day" precision="0">${rows.join('')}</chartdata></protocol>`, 'text/xml');
    }
    return no();
  };
}

test('끝까지: 목록(코스피 JSON · 코스닥은 HTML로 넘어감) → 요약 → 결산(일부 HTML) → 일봉 → 규칙대로 52곳 → 새 입력(겹치는 종목은 옛 가격 기록 그대로)', async () => {
  const cal = await readJSON('public/data/rolling-calendar.json'), sessions = cal.sessions.filter(d => d <= '2026-10-02'), stocks = world();
  const bundle = await collectBundle({now: '2026-10-04T05:00:00Z', fetch: fakeFetch(stocks, sessions, {htmlFinance: new Set(['100010', '100250'])}), concurrency: 8, politeDelayMs: 0});
  assert.equal(bundle.lists.source, 'mixed');
  assert.equal(bundle.stocks['100010'].finance.kind, 'html');
  const oldCode = '100020', input = {calendar: {sessions: cal.sessions.filter(d => d <= '2026-10-30')}, actualAsOf: '2026-10-02', assets: [{id: 1, code: oldCode, name: '합성2', sector: '반도체와반도체장비', priceSource: {provider: 'NAVER'}, prices: [{date: '2026-10-02', close: 7, priceBasis: 'KRX_REGULAR'}]}]};
  const {proposal, next} = proposeFromBundle(bundle, {input, now: '2026-10-04T05:10:00Z'});
  assert.equal(proposal.ok, true); assert.equal(proposal.picked.length, 52); assert.equal(proposal.asOf, '2026-10-02');
  const A = proposal.rules.applied; assert.ok([0, 1, 2, 3].includes(A.step)); // 합성 세상은 빚 많은 곳이 많아 1단계(200%)까지 늦출 수 있다
  const codes = proposal.picked.map(p => p.code);
  assert.ok(!codes.includes('100005') && !codes.includes('199990'), '우선주·스팩 제외');
  assert.ok(!codes.includes('100150'), '빠진 날이 있는 종목 제외');
  assert.ok(proposal.notPicked.every(x => x.code !== '100160' || !x.fails.some(f => f.startsWith('가격 이력'))), '거래정지 날만 있는 종목은 이력 문을 넘는다');
  for (const p of proposal.picked) { const s = stocks.find(x => x.code === p.code); assert.ok(s.op > 0 && (A.profitYears < 2 || s.opPrev > 0) || ['은행', '증권', '손해보험'].includes(s.sector), p.code); assert.ok(s.roe >= A.roeMinPct); assert.ok(s.debt <= A.debtMaxPct || ['은행', '증권', '손해보험'].includes(s.sector)); }
  const perSector = proposal.picked.reduce((m, p) => m.set(p.sector, (m.get(p.sector) ?? 0) + 1), new Map());
  assert.ok(Math.max(...perSector.values()) <= 4, '한 업종 4곳까지');
  assert.equal(next.assets.length, 52); assert.equal(next.universe.id, 'u2-q52-v2-2026-10-04'); assert.equal(next.universe.rules, 'q52-v2');
  // q52-v2: 조건을 다 넘은 회사 가운데 시가총액 큰 순(합성 세상은 코드 순 = 시가총액 순)
  assert.ok(proposal.picked.every((p, i) => i === 0 || proposal.picked[i - 1].marketCapEok >= p.marketCapEok), '시가총액 큰 순');
  if (codes.includes(oldCode)) assert.deepEqual(next.assets.find(a => a.code === oldCode).prices, input.assets[0].prices, '겹치는 종목은 옛 가격 기록 그대로');
  const fresh = next.assets.find(a => a.code !== oldCode);
  assert.equal(fresh.prices.at(-1).date, '2026-10-02'); assert.ok(fresh.prices.length >= 600);
  // 같은 원문이면 같은 52곳
  assert.deepEqual(proposeFromBundle(bundle, {input, now: '2026-10-04T05:10:00Z'}).proposal.picked.map(p => p.code), codes);
  // 묶음: 새 52곳은 업종 이름으로 아홉 묶음 안에
  const groups = groupsFor(next.assets); assert.equal(groups.reduce((s, g) => s + g.codes.length, 0), 52);
});

test('규칙: 흑자·ROE·빚(금융 제외)·업종 4곳·52곳 안 차면 한 단계씩 늦춤', () => {
  const base = {endType: 'stock', history: {ok: true}, marketCapEok: 1000};
  const m = (o = {}) => ({fiscalYear: '2025.12', op: 10, opPrev: 10, net: 5, netPrev: 5, roe: 10, debt: 50, ...o});
  assert.deepEqual(failsOf({...base, code: '000010', name: 'A', sector: '화학', capRank: 1, metrics: m({opPrev: -1})}), ['2년 연속 흑자 아님']);
  assert.deepEqual(failsOf({...base, code: '000010', name: 'A', sector: '은행', capRank: 1, metrics: m({op: null, opPrev: null, debt: 900})}), [], '금융회사: 당기순이익만 · 빚 기준 제외');
  assert.deepEqual(failsOf({...base, code: '000010', name: 'A', sector: '화학', capRank: 301, metrics: m({roe: 4.9, debt: 151})}), ['시가총액 300위 밖', 'ROE 5% 미만', '부채비율 150% 초과']);
  // 52곳이 안 차는 세상: 빚 160%가 많으면 1단계(200%)로 늦춘다
  const cands = Array.from({length: 60}, (_, i) => ({...base, code: String(200000 + i * 10), name: 'B' + i, sector: SECTORS[i % 16], capRank: i + 1, marketCapEok: 1000 - i, metrics: m({debt: i < 20 ? 100 : 160, roe: 6 + (i % 9)})}));
  const sel = selectQuality52(cands);
  assert.equal(sel.ok, true); assert.equal(sel.step, 1); assert.equal(sel.rules.debtMaxPct, 200); assert.equal(sel.picked.length, 52);
  assert.equal(QUALITY52.count, 52);
});

test('묶음: 옛 52종목이면 옛 묶음 그대로 · 새 종목은 업종 이름으로', async () => {
  const input = await readJSON('tests/atlas11/fixtures/input-2026-09-28.json');
  assert.deepEqual(groupsFor(input.assets), FROZEN_GROUPS.map(g => ({id: g.id, name: g.name, codes: [...g.codes]})));
  assert.equal(groupIdOfSector('은행'), 'fin'); assert.equal(groupIdOfSector('디스플레이 패널'), 'semi'); assert.equal(groupIdOfSector('새로운바이오업종'), 'bio'); assert.equal(groupIdOfSector('알수없음'), 'cons');
  // 옛 묶음 배정이 업종 이름표와 어긋나지 않는다(옛 52종목의 업종 이름 → 같은 묶음)
  for (const a of input.assets) assert.equal(groupIdOfSector(a.sector), FROZEN_GROUPS.find(g => g.codes.includes(a.code)).id, a.name + ' ' + a.sector);
  const gOf = makeGroupOf([{code: '999990', sector: '은행'}]); assert.equal(gOf('999990').id, 'fin'); assert.equal(gOf('005930').id, 'semi');
});

test('목록을 둘 다 못 받으면: 지금 종목 + 같은 업종 이웃으로 후보를 만든다(source=peers)', async () => {
  const cal = await readJSON('public/data/rolling-calendar.json'), sessions = cal.sessions.filter(d => d <= '2026-10-02'), stocks = world();
  const fallbackCodes = SECTORS.map((s, si) => String(100000 + si * 50).padStart(6, '0'));
  const bundle = await collectBundle({now: '2026-10-04T05:00:00Z', fetch: fakeFetch(stocks, sessions, {noLists: true}), concurrency: 8, politeDelayMs: 0, fallbackCodes});
  assert.equal(bundle.lists.source, 'peers');
  const input = {calendar: {sessions: cal.sessions.filter(d => d <= '2026-10-30')}, actualAsOf: '2026-10-02', assets: []};
  const {proposal} = proposeFromBundle(bundle, {input, now: '2026-10-04T05:10:00Z'});
  assert.equal(proposal.ok, true); assert.equal(proposal.picked.length, 52);
});
