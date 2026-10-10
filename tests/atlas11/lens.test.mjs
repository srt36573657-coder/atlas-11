// ATLAS 11 · 판 읽기(lib/atlas11/lens.mjs) — 「ATLAS 개편 실행 지시서」 13. 추가 필수 검사(작은 가짜 판으로)
//   종목별 종가 날짜 불일치 · 거래정지(오래된 종가) · 기업행사(가격 제한폭을 넘은 날) · 자료 지연 · 실제 순매수(주식 수)와 추정액 구분
//   · 최초 포착 이후 성과 · 평가 대기 · 중복 표본 · 공시 게시일 · 같은 공시 한 번 · 빈 판 · 지수 날짜 불일치 · 미국(순매매 없음)
import test from 'node:test';
import assert from 'node:assert/strict';
import {lensOf, checkLens, lensJson, RULES} from '../../lib/atlas11/lens.mjs';

const close = (a, b, eps = 1e-9) => assert.ok(Math.abs(a - b) < eps, `${a} ≠ ${b}`);
// 거래일 40개(평일만 · 2026-08-03 월요일부터) — 앞날 평가일을 셀 수 있게 기준일 뒤로도 10개
const SES = (() => { const out = []; const d = new Date(Date.UTC(2026, 7, 3)); while (out.length < 40) { const w = d.getUTCDay(); if (w && w < 6) out.push(d.toISOString().slice(0, 10)); d.setUTCDate(d.getUTCDate() + 1); } return out; })();
const AS_OF = SES[29]; // 기준일(30번째 거래일)
const series = (start, step, upto = 29, from = 0) => SES.slice(from, upto + 1).map((date, i) => ({date, close: +(start * (1 + step) ** i).toFixed(4)}));
function fixture() {
  const assets = [
    {code: 'A1', prices: series(100, 0.01)}, {code: 'A2', prices: series(100, 0.005)}, {code: 'A3', prices: series(100, -0.004)},
    {code: 'B1', prices: series(50, 0.002)}, {code: 'B2', prices: series(50, -0.01, 28)}, // B2 = 하루 늦음(기준일 종가 없음)
    {code: 'B3', prices: series(80, 0.0, 25)}, // B3 = 4거래일 늦음 → 오래된 종가
    {code: 'C1', prices: series(10, 0.001).map((r, i) => (i >= 20 ? {...r, close: r.close * 0.5} : r))}, // C1 = 21번째 날 −50%(제한폭을 넘음 → 기업행사 확인 필요)
  ];
  const companies = assets.map(a => ({code: a.code, name: '회사' + a.code, sector: a.code[0] === 'A' ? '공식가' : '공식나', group: {id: 'g' + a.code[0], label: '업종' + a.code[0]}, kind: 'quality'}));
  const board = {boardId: 'board-test', asOf: AS_OF, companies, groups: [{id: 'gA', label: '업종A', codes: ['A1', 'A2', 'A3'], hot: true}, {id: 'gB', label: '업종B', codes: ['B1', 'B2', 'B3']}, {id: 'gC', label: '업종C', codes: ['C1']}]};
  const index = {symbol: 'IDX', name: '지수', rows: SES.slice(0, 30).map((date, i) => ({date, close: 1000 + i}))};
  return {assets, board, index};
}

test('같은 기간 수익률 · 상태(지연 · 오래된 종가 · 기업행사) · 뺀 수와 사유', () => {
  const {assets, board, index} = fixture();
  const l = lensOf({place: 'kr', board, assets, index, sessions: SES, made: '2026-09-15T00:00:00Z'});
  const s = c => l.stocks.find(x => x.code === c);
  assert.equal(s('A1').status, 'ok'); close(s('A1').r20, (1.01 ** 20 - 1) * 100, 1e-3); close(s('A1').r1, 1, 1e-3);
  assert.equal(s('B2').status, 'late'); assert.equal(s('B2').r20, null, '기준일 종가가 없으면 계산 불가(오래된 값으로 채우지 않음)');
  assert.equal(s('B3').status, 'stale');
  assert.equal(s('C1').status, 'ca'); assert.deepEqual(s('C1').jumps, [SES[20]]); assert.equal(s('C1').r20, null);
  const gB = l.sectors.find(x => x.id === 'gB');
  assert.equal(gB.d20.n, 1); assert.equal(gB.d20.excluded, 2); assert.deepEqual(gB.excluded, {late: 1, stale: 1, ca: 0, missing: 0});
  assert.equal(gB.level, 'na', `유효 종목이 ${RULES.minN}곳보다 적으면 판단 보류`);
  const gA = l.sectors.find(x => x.id === 'gA');
  assert.equal(gA.d20.n, 3); assert.equal(gA.level, 'broad' === gA.level ? 'broad' : gA.level); // 2곳 오름 · 1곳 내림 → 상승 비율 66.7%
  close(gA.d20.upRatio, 200 / 3);
  assert.equal(l.when.late, 1); assert.equal(l.when.stale, 1); assert.equal(l.when.ca, 1); assert.equal(l.when.current, 5);
  assert.deepEqual(l.market.sample.excluded, {late: 1, stale: 1, ca: 1, missing: 0});
  close(l.market.ref.r20, (1029 / 1009 - 1) * 100); assert.equal(l.market.whole.status, 'none'); assert.equal(l.market.value.status, 'none');
  close(gA.vs20, gA.d20.mean - l.market.ref.r20);
  assert.deepEqual(checkLens(l), []);
  // 싣는 글은 소수 넷째 자리
  assert.ok(!/\d\.\d{5,}/.test(lensJson(l).replace(/"[^"]*"/g, '""')));
});

test('지수 날짜가 기준일과 다르면 지수 수익률은 계산 불가', () => {
  const {assets, board, index} = fixture();
  const l = lensOf({place: 'kr', board, assets, index: {...index, rows: index.rows.slice(0, 29)}, sessions: SES});
  assert.equal(l.market.ref.r20, null); assert.equal(l.sectors[0].vs20, null);
});

test('업종 상태 규칙 — 동반 강세 · 일부 종목 주도 · 약세(실험 규칙 · 숫자 그대로)', () => {
  const mk = (rets) => { // 20거래일 전 100 → 기준일 100×(1+r)
    const assets = rets.map((r, i) => ({code: 'X' + i, prices: SES.slice(0, 30).map((date, k) => ({date, close: k < 9 ? 100 : k === 29 ? 100 * (1 + r / 100) : 100}))}));
    const companies = assets.map(a => ({code: a.code, name: a.code, sector: '공식', group: {id: 'g', label: 'g'}}));
    return lensOf({place: 'us', board: {boardId: 'b', asOf: AS_OF, companies, groups: [{id: 'g', label: 'g', codes: companies.map(c => c.code)}]}, assets, sessions: SES}).sectors[0];
  };
  const hlb = mk([69.9, 38.5, -2.9, -5.5, -19.7]);
  close(hlb.d20.mean, 16.06, 1e-6); close(hlb.d20.median, -2.9, 1e-6); close(hlb.d20.upRatio, 40); close(hlb.d20.exTop1, 2.6, 1e-6); close(hlb.d20.exTop2, -9.366666666, 1e-6);
  assert.equal(hlb.level, 'narrow', '평균은 오르지만 중앙값 ≤ 0 → 일부 종목 주도');
  assert.equal(mk([5, 4, 3, 2, -1]).level, 'broad');
  assert.equal(mk([-5, -4, 3, 2, -1]).level, 'weak');
  assert.equal(mk([]).level, 'na');
});

test('순매매: 공식 값은 주식 수 · 금액은 추정(종가 × 주식 수) · 섞지 않음 · 20거래일은 계산 불가 · 잠정 표시', () => {
  const {assets, board, index} = fixture();
  const days = SES.slice(20, 30);
  const flows = board.companies.map(c => ({code: c.code, sourceUrl: `https://m.stock.naver.com/api/stock/${c.code}/trend?pageSize=10&page=1`, rows: days.map((date, i) => ({date, foreignNet: 10, institutionNet: -4, individualNet: -6, unit: 'shares', status: i === 9 ? 'provisional_same_day' : 'reported'}))}));
  const l = lensOf({place: 'kr', board, assets, index, sessions: SES, snap: {fetchedAt: '2026-09-14T08:00:00Z', flows}});
  assert.equal(l.flows.available, true); assert.equal(l.flows.unit, 'shares'); assert.equal(l.flows.official.amount, null);
  assert.equal(l.flows.provisional, true); assert.equal(l.flows.provisionalDay, AS_OF);
  const f = l.flows.market.foreign;
  assert.equal(f.d5.sh, 7 * 5 * 10); assert.equal(f.d20, null); assert.match(l.flows.d20.why, /계산 불가/);
  // 추정액: 기준일 종가가 없는 종목(B2 · B3)은 추정에서 빼고 수를 셈
  assert.equal(f.d1.estMissing, 2); assert.equal(f.d1.nEst, 5);
  const a1 = assets[0].prices.at(-1).close; assert.ok(Math.abs(l.stocks.find(s => s.code === 'A1').fl.f5e - 10 * assets[0].prices.slice(-5).reduce((t, r) => t + r.close, 0)) < 1e-6 && a1 > 0);
  assert.equal(l.flows.ratio.value, null, '거래대금이 없으면 비율은 계산 불가');
  assert.equal(f.persist.buyDays, 10); assert.equal(f.persist.streak, 10);
  const us = lensOf({place: 'us', board, assets, index, sessions: SES, snap: {flows}, placeInfo: {flowsNone: '미국은 투자자별 매매를 날마다 공개하지 않음'}});
  assert.equal(us.flows.available, false, '미국 판은 순매매를 만들어 넣지 않음'); assert.match(us.flows.reason, /공개하지 않음/);
  assert.equal(us.stocks.find(s => s.code === 'C1').status, 'ok', '미국은 가격 제한폭 검사를 하지 않음');
});

test('저녁 기록: 들고 남 · 새로 발견 · 근거 약화 · 원인(지연 해소) · 새 공시는 한 번 · 평가 대기 · 평가 끝 · 겹치는 표본', () => {
  const {assets, board, index} = fixture();
  const dPrev = SES[28], dCur = AS_OF;
  // A2 의 기준일 앞날 종가는 앞 기록 뒤에 들어옴(지연 해소)
  assets[1].prices = assets[1].prices.map(r => (r.date === dPrev ? {...r, observedAt: '2026-09-11T12:00:00Z'} : r));
  const prev = {asOf: dPrev, recordedAt: '2026-09-11T10:00:00Z', universe: 'u', hot: [], next: [{code: 'A3'}, {code: 'B1'}], similar: []};
  const cur = {asOf: dCur, recordedAt: '2026-09-14T10:00:00Z', universe: 'u', hot: [], next: [{code: 'A2'}, {code: 'B1'}], similar: []};
  const old = {asOf: SES[5], recordedAt: '2026-08-10T10:00:00Z', universe: 'u', hot: [{id: 'gA', label: '업종A'}], next: [{code: 'A1'}, {code: 'A1'}], similar: []}; // 같은 종목 두 번(중복 표본)
  const agenda = {byCode: {A1: {name: '회사A1', disclosures: [{id: 'd1', title: '실적', publishedAt: '2026-09-12T08:00:00+09:00', level: 3}, {id: 'd1', title: '실적', publishedAt: '2026-09-12T08:00:00+09:00', level: 3}, {id: 'd0', title: '옛 공시', publishedAt: '2026-09-01T08:00:00+09:00', level: 3}]}}};
  const l = lensOf({place: 'kr', board, assets, index, sessions: SES, evening: [cur, old, prev], agenda});
  assert.deepEqual(l.changes.nextIn, ['A2']); assert.deepEqual(l.changes.nextOut, ['A3']);
  assert.equal(l.changes.nDisclosures, 1, '같은 공시 번호는 한 번 · 앞 기록 전 공시는 뺌');
  const s = c => l.stocks.find(x => x.code === c);
  assert.equal(s('A2').bucket, 'new'); assert.equal(s('A2').bucketWhy[0].cause, 'caught', '앞 기록 때 종가가 아직 없었음 → 자료 지연 해소');
  assert.equal(s('A3').bucket, 'down'); assert.equal(s('A3').bucketWhy[0].k, 'leave');
  assert.equal(s('A1').bucket, 'new'); assert.equal(s('A1').bucketWhy[0].k, 'info', '새 ★★★ 공시 = 새 정보(조건 반복과 다름)');
  // 검증: 옛 기록(SES[5])의 5 · 10 · 20거래일은 끝 · 앞 기록(SES[28])의 5거래일은 평가 대기(평가일 = 달력의 5번째 거래일)
  const r0 = l.verify.records.find(r => r.asOf === SES[5]), r1 = l.verify.records.find(r => r.asOf === dPrev);
  const e5 = r0.evals.next.find(e => e.h === 5);
  assert.equal(e5.status, 'done'); assert.equal(e5.due, SES[10]); assert.equal(e5.n, 2, '표본 수는 선정 횟수 그대로(중복을 숨기지 않음)');
  close(e5.ret.mean, (1.01 ** 5 - 1) * 100, 1e-3); assert.ok(e5.mdd.mean === 0 && e5.minRet.mean > 0, '오르기만 했으면 최대 낙폭 0 · 최저 수익률 > 0');
  assert.equal(e5.success.n, 2);
  assert.equal(r1.evals.next.find(e => e.h === 5).status, 'pending'); assert.equal(r1.evals.next.find(e => e.h === 5).due, SES[33]);
  assert.equal(l.verify.unique.next, 4); assert.equal(l.verify.picks.next, 6);
  assert.equal(l.verify.firstDue, SES[33]);
  const hot = r0.evals.hot.find(e => e.h === 20); assert.equal(hot.status, 'done'); assert.equal(hot.n, 3);
  assert.ok(r0.baseline.next.every(e => e.status === 'done'), '비교 기준(단순 최근 상승률 상위)도 같은 날 · 같은 기간');
});

test('첫 화면 7곳(5판 규칙 폴더 발행본)도 채점 — 같은 날 처음 남은 목록과 규칙이 다를 때만 · 5 · 10 · 20 · 60거래일(사장님 2026-10-10 22:36 「알아서해」)', () => {
  const {assets, board, index} = fixture();
  const d = SES[5], first = {asOf: d, recordedAt: '2026-08-10T10:00:00Z', rules: 'cand-rules-2', cand: [{code: 'A1'}, {code: 'A2'}]};
  const g5 = {asOf: d, recordedAt: '2026-08-11T07:00:00Z', rules: 'cand-rules-5', cand: [{code: 'A3'}, {code: 'B1'}]};
  const l = lensOf({place: 'kr', board, assets, index, sessions: SES, candPubs: [first], growPubs: [g5]});
  const r = l.verify.records.find(x => x.asOf === d);
  assert.deepEqual(r.evals.grow.map(e => e.h), [5, 10, 20, 60], '첫 화면 7곳은 담는 기간(60거래일)까지');
  assert.deepEqual(r.evals.cand.map(e => e.h), [5, 10, 20], '같은 날 첫 목록(다른 규칙 판)은 그대로');
  assert.equal(r.grow.rules, 'cand-rules-5'); assert.equal(r.sizes.grow, 2);
  const e5 = r.evals.grow.find(e => e.h === 5); assert.equal(e5.status, 'done'); assert.equal(e5.due, SES[10]); assert.equal(e5.n, 2);
  // 규칙이 같으면 따로 세지 않음(같은 목록을 두 번 채점하지 않음)
  const same = lensOf({place: 'kr', board, assets, index, sessions: SES, candPubs: [first], growPubs: [{...g5, rules: 'cand-rules-2'}]});
  assert.equal(same.verify.records.find(x => x.asOf === d).evals.grow, undefined);
});

test('빈 판 · 기록 없음 — 멈추지 않고 계산 불가', () => {
  const l = lensOf({place: 'kr', board: {boardId: 'b0', asOf: AS_OF, companies: [], groups: []}, assets: [], sessions: SES});
  assert.equal(l.market.sample.d20.n, 0); assert.equal(l.market.sample.d20.mean, null); assert.equal(l.changes, null); assert.deepEqual(l.verify.records, []);
  assert.equal(l.verify.firstDue, null); assert.equal(l.flows.available, false);
  const l2 = lensOf({place: 'kr', board: {boardId: 'b0', asOf: '2030-01-01', companies: [], groups: []}, assets: [], sessions: SES});
  assert.ok(l2.problems.some(p => /달력/.test(p)));
});
