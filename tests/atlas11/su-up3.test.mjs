// 큐피트 1 · 2 · 3등 새 잣대(주문 1111-1857 · 사장님 2026-11-11 18:57 「자 지금 1.2.3등 선정 기준에 문제가 있는듯해 이렇개 선택한 종목이 지금 다 하락이잖아
//   선정 기준을 상승할것 같은 종목 으로 해야 해! 에이전트 100개 만들어서 알고리즘 만들어 재대로 상황 공부하고 대입해」)
//   셈(su21_up3.py — 실험실 up3_lab.py 와 같은 Feat) · 오늘 판(su21.py) · 장부(su21_book.mjs — 42칸 밖 회사도 그 판 날 값으로) · 첫 페이지 · 「왜?」 쪽 · 달력 · 검사 ⑳ · 저장된 판
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {stepBook, okBook} from '../../scripts/atlas11/next/su21_book.mjs';
import {screenHits} from '../../site/next/words.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const rd = f => fs.readFileSync(path.join(ROOT, f), 'utf8');

test('새 잣대 셈 — 넷 고른 섞기 · 실험실과 같은 Feat · 몸집 아래 열에 둘 뺌 · 지난 기록', () => {
  const u = rd('scripts/atlas11/next/su21_up3.py'), lab = rd('scripts/atlas11/next/up3_lab.py');
  assert.ok(/^import up3_lab as LAB$/m.test(u) && /LAB\.Feat\(/.test(u), '실험실과 같은 셈(Feat)');
  assert.ok(/VERSION = 'up3-v1'/.test(u) && /CAPQ = 20/.test(u) && /WIN = 300/.test(u), '판 이름 · 몸집 아래 열에 둘 · 날 창');
  for (const x of ['F.zcs(F.ret(250) - F.ret(20)) - 0.5 * F.zcs(F.vol(120))', 'F.updays(250)', 'im = F.indmean(r)', 'F.zcs((im - r) * (im > 0))', 'F.zcs(-F.rel(5))', 'return F.zcs(L1), F.zcs(L2), np.nan_to_num(S1), np.nan_to_num(S2)'])
    assert.ok(u.includes(x), '잣대 — ' + x);
  assert.ok(u.includes("np.isfinite(F.roll(F.lr, 60, 'sum')[-1])") && u.includes('np.percentile(capv[have], CAPQ)'), '고를 수 있는 곳 — 지난 60거래일 · 몸집');
  assert.ok(/DESIGN = \('2023-11-01', '2025-06-30'\)/.test(lab) && /HOLD = \('2025-07-01', '2026-11-11'\)/.test(lab) && /def check_causal\(F, fn\)/.test(lab) && /UP3_HOLD/.test(lab), '실험실 — 설계 · 남겨 둔 기간 · 앞날 쓰기 검사');
  for (const k of ["'ex10': 1.49", "'up10': 53.3", "'ex10': -0.64", "'up10': 48.1", "'agents': 100"]) assert.ok(u.includes(k), '지난 기록(남겨 둔 기간 한 번) — ' + k);
});

test('오늘 판 — 새 잣대가 1 · 2 · 3등 · 칸에 든 회사만 칸 등수 · 값은 판 값', () => {
  const py = rd('scripts/atlas11/next/su21.py');
  assert.ok(/^import su21_up3 as UP3$/m.test(py) && /T3 = UP3\.top3\(CTX, list\(B\), cap, nm\) if A\.top3 else None/.test(py), 'su21.py — 새 잣대(올릴 때 --top3)');
  assert.ok(py.includes("PLACE = {(k, c): r['place'] for r in (T3 or {}).get('rank', []) for k, c in CELLS if c == r['code']}"), '칸 등수 = 칸 회사가 등수일 때만');
  assert.ok(py.includes("'close': B[r['code']].get('close'), 'date': B[r['code']].get('date')") && py.includes("'in': [k for k, c in CELLS if c == r['code']]"), '값 = 판 · 든 칸');
  assert.ok(!/import su21_top3 as TOP3/.test(py), '옛 1억 번 셈은 더 부르지 않음(파일은 남김 — 옛 판 다시 읽기)');
});

test('장부 — 42칸 밖 회사도 그 판 날 값(1 · 2 · 3등 줄)으로 · 새 잣대 날 표', () => {
  const day = '2026-11-12', rank = [1, 2, 3].map(p => ({place: p, k: 'up3', code: '00000' + p, name: '회사' + p, close: 1000 * p, date: day}));
  const T = {asOf: {board: day}, listRule: 'culture7-v1', top3: {v: 'up3-v1', rank}, lists: {hot: [{code: '999999', name: '딴곳', close: 5, date: day}]}};
  // 판이 다른 날(저장된 판 · 검사 실행기) — 값은 1 · 2 · 3등 줄에서
  const r1 = stepBook(null, T, {asOf: '2026-11-13', companies: []}, '2026-11-12T16:00+09:00');
  assert.ok(r1.added && r1.added.rule === 'up3-v1' && r1.added.picks.map(p => p.code + ':' + p.px).join() === '000001:1000,000002:2000,000003:3000', JSON.stringify(r1.added));
  assert.ok(okBook(r1.book), '장부 꼴');
  // 판이 그 날 — 값은 판에서
  const board = {asOf: day, companies: rank.map(r => ({code: r.code, name: r.name, close: r.close + 1, date: day}))};
  const r2 = stepBook(null, T, board, '2026-11-12T16:00+09:00');
  assert.equal(r2.added.picks.map(p => p.px).join(), '1001,2001,3001');
  // 옛 판(1억 번 셈)은 규칙 이름 그대로
  const r3 = stepBook(null, {...T, top3: {v: 'top3-v2', rank: rank.map(r => ({...r, k: 'hot'}))}}, board, '2026-11-12T16:00+09:00');
  assert.equal(r3.added.rule, 'culture7-v1');
});

test('화면 — 첫 페이지 이름 셋 · 「왜?」 쪽 상자 · 달력 첫 날 · 검사 ⑳ · 쓰지 않을 말', () => {
  const ap = rd('site/su/su-apple.js'), y = rd('site/su/su-why36.js'), bk = rd('site/su/su-book.js'), ck = rd('scripts/atlas11/next/check_su.mjs');
  assert.ok(/function legendUp3\(y, rank\)/.test(ap) && ap.includes("UP3 = RANK && d.top3.v === 'up3-v1'") && ap.includes('const LIST0 = UP3 ? 720') && ap.includes("note2(y + 84, '새 잣대로', '우량주 365곳에서 골랐어요.', 'note4')") && ap.includes("s('a', {href: '#/r/c', class: 'sa-up3a'") && ap.includes('height: 90'), '첫 페이지 — 이름 셋 · 한 덩이로 누르면 1 · 2 · 3등 달력(48 × 48 넘게) · 풀이');
  assert.ok(/export function up3Box\(T, c\)/.test(y) && y.includes("if (T?.top3?.v === 'up3-v1') return up3Box(T, c);"), '「왜?」 쪽 — 새 잣대 상자');
  assert.ok(/export const up3From = B =>/.test(bk) && bk.includes("' 판부터는 새 잣대로 골라요. 우량주 365곳에서 긴 오름세와 잠깐 눌림을 함께 봐요.'"), '달력 — 새 잣대 첫 날');
  assert.ok(ck.includes('⑳ 새 잣대(주문 1111-1857)') && ck.includes("'⑳ 첫 페이지 — 42칸 모두 · 새 잣대 1등 · 2등 · 3등 이름 셋(누르면 1 · 2 · 3등 달력)"), '검사 ⑳ — 새 잣대');
  const says = ['새 잣대로', '우량주 365곳에서 골랐어요.', '새 잣대는 넷이에요. ', '긴 오름세 · 덜 흔들림', '1년 오른 날 몫', '업종 따라잡기', '닷새 눌림', '이 칸은 1 · 2 · 3등이 아니에요', '넷을 더한 값이 ', '앞날을 맞히지 않아요. 지난 값으로 센 기록이에요.',
    ' 판부터는 새 잣대로 골라요. 우량주 365곳에서 긴 오름세와 잠깐 눌림을 함께 봐요.', '지난 기록이에요. ', '에는 열흘 뒤 오른 때가 100번에 '];
  for (const t of says) { assert.ok(!/[A-Za-z%]/.test(t) && !/매수|매도|추천|예측|확률|유망|신호|수익률/.test(t), '영어 · % · 쓰지 않을 말 없음 — ' + t); assert.deepEqual(screenHits(t), [], '화면 낱말 — ' + t); }
});

test('저장된 판 — 새 잣대 셋 · 그 판 날 값 · 칸 등수 맞음', () => {
  const T = JSON.parse(rd('site/su/data/su21.json')), N = JSON.parse(rd('site/su/data/su21-next.json')), t3 = T.top3;
  assert.equal(t3?.v, 'up3-v1');
  assert.ok(t3.rank.length === 3 && t3.rank.map(r => r.place).join() === '1,2,3' && new Set(t3.rank.map(r => r.code)).size === 3 && t3.how.length === 4 && t3.pool >= 100 && t3.pool <= t3.n, JSON.stringify(t3).slice(0, 200));
  assert.ok(t3.rank.every((r, i) => r.date === T.asOf.board && r.close > 0 && r.parts.length === 4 && (!i || r.score <= t3.rank[i - 1].score)), '그 판 날 값 · 점수 차례');
  for (const L of [...Object.values(T.lists), ...Object.values(N.lists)]) for (const c of L) {
    const r = t3.rank.find(x => x.code === c.code);
    assert.equal(c.r3 ?? null, r ? r.place : null, '칸 등수 — ' + c.name);
  }
});

test('공부 기록 — 일꾼 100 · 고르기 약속 · 남겨 둔 기간 결과', () => {
  const dir = 'docs/design/up3-2026-11-11';
  const R = JSON.parse(rd(dir + '/agents.json'));
  assert.equal(R.agents.length + R.research.length, 100, '일꾼 100(공부 10 · 잣대 90)');
  assert.equal(R.research.length, 10);
  assert.ok(R.agents.every(a => a.idea && a.best && a.design?.h10 && typeof a.keep === 'boolean'), '잣대 일꾼마다 생각 · 고른 판 · 설계 기간 성적 · 남김');
  const pick = rd(dir + '/pick.md');
  assert.ok(pick.includes('c2') && pick.includes('남겨 둔 기간') && pick.includes('갈아타지 않는다'), '고르기 약속(남겨 둔 기간을 보기 전에 적음)');
  const res = rd(dir + '/result.md');
  assert.ok(res.includes('−0.64') && res.includes('48.1') && res.includes('b01'), '남겨 둔 기간 결과를 그대로 적음(나빠도)');
});
