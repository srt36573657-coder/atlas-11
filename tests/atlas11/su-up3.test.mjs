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
  assert.ok(/function legendUp3\(y, rank, day, how\)/.test(ap) && ap.includes("UP3 = RANK && d.top3.v === 'up3-v1'") && ap.includes('const LIST0 = UP3 ? PY0 + 292 + UP3H') && ap.includes("note2(yb + 30, '지난 기록 차례예요.', '앞날은 몰라요.', 'note4')")
    && ap.includes("s('a', {href: '#/r/c', class: 'sa-up3c'") && ap.includes("href: '#/c/' + encodeURIComponent(String(r?.code ?? '')) + '/t', class: 'sa-up3a sa-x'") && /const UPR = 140/.test(ap), '첫 페이지 — 넓은 칸 셋(칸마다 누르면 그 곳 쪽 · 누름 140) · 달력 고리 · 풀이(주문 1112-0044)');
  assert.ok(/export function up3Box\(T, c\)/.test(y) && y.includes("if (T?.top3?.v === 'up3-v1') return up3Box(T, c);"), '「왜?」 쪽 — 새 잣대 상자');
  assert.ok(/export const up3From = B =>/.test(bk) && bk.includes("const ruleNew = '새 기준은 우량주 365곳 가운데 1년 오르다 요즘 쉬거나 내린 곳이에요. 크게 내린 곳도 숨기지 않아요.';") && bk.includes("'부터는 새 기준으로 골랐어요. '") && !bk.includes('bk-intro bk-new'), '달력 — 새 잣대 첫 날(풀이는 표 밑 한 칸)');
  assert.ok(ck.includes('⑳ 새 잣대(주문 1111-1857)') && ck.includes("'⑳ 첫 페이지 — 42칸 모두 · 오늘의 1등 · 2등 · 3등 넓은 칸 셋(이름 · 현재가 · 한 달 · 업종 · 이유 · 한 달 꺾은선 · 누르면 그 곳 쪽)"), '검사 ⑳ — 새 잣대');
  const says = ['지난 기록 차례예요.', '앞날은 몰라요.', '고른 기준은 넷이에요. ', '1년 꾸준히 오름', '1년 오른 날이 많음', '업종보다 덜 오름', '최근 5일 쉼', '오늘의 1 · 2 · 3등', '누르면 이유 ›', '이유 — ', '이 칸은 1 · 2 · 3등이 아니에요', '넷을 더한 값이 ', '앞날을 맞히지 않아요. 지난 값으로 센 기록이에요.',
    '부터는 새 기준으로 골랐어요. ', '새 기준은 우량주 365곳 가운데 1년 오르다 요즘 쉬거나 내린 곳이에요. 크게 내린 곳도 숨기지 않아요.', '지난 기록이에요. ', '에는 열흘 뒤 오른 때가 100번에 ', '한 달은 내림 · ', '더 내릴 수도 있어요.'];
  for (const t of says) { assert.ok(!/[A-Za-z%]/.test(t) && !/매수|매도|추천|예측|확률|유망|신호|수익률/.test(t), '영어 · % · 쓰지 않을 말 없음 — ' + t); assert.deepEqual(screenHits(t), [], '화면 낱말 — ' + t); }
  // 주문 1114-1306 ① · ③ — 1 · 2 · 3등 칸 한 달 = 「한 달 100원이 ○원」 · 한 달 값이 내렸으면 이유 줄 첫 마디 「한 달은 내림 · 」(장 중 값으로 바뀌어도 다시 셈) · 머리 아래 「더 내릴 수도 있어요.」 · 검사 ⑳ 이 따로 셈
  assert.ok(ap.includes("mon = '한 달 ' + (c20 != null ? won100(c20) : NEED)") && ap.includes('wl = up3Why(c20, why)') && ap.includes("mon = '한 달 ' + won100(ch)") && ap.includes('const wl = up3Why(ch, c.why)') && ap.includes("T(PAD, y + 50, '더 내릴 수도 있어요.'"), '첫 페이지 1 · 2 · 3등 — 100원 말 · 손실 먼저');
  assert.ok(ck.includes("const whyW = r => '이유 — ' + (spOk(r) && c20Of(r) < 0 ? '한 달은 내림 · ' : '') + (topWhy(r) ?? '확인 필요');") && ck.includes("x.m === '한 달 ' + won100Of(c20Of(r))"), '검사 ⑳ — 한 달 · 이유 줄을 따로 셈');
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

test('1 · 2 · 3등 그림 · 이어지는 쪽(주문 1112-0044 · 사장님 2026-11-12 00:44 「여기 1.2.3에 그래프 그리고 다양한 정보 직관적으로 보이게 하고 클릭 하면 그정보가 이어지게 해」)', async () => {
  const py = rd('scripts/atlas11/next/su21.py'), ap = rd('site/su/su-apple.js'), su = rd('site/su/su.js'), u3 = rd('site/su/su-up3.js'), ck = rd('scripts/atlas11/next/check_su.mjs');
  assert.ok(py.includes("'c': B[r['code']].get('c'), 'cFrom': B[r['code']].get('cFrom')") && py.includes("'ch20': r1(B[r['code']]['change20'] * 100)"), '자료 — 1 · 2 · 3등에도 21 마지막 값 · 한 달(42칸과 같은 판 값)');
  for (const x of ["T(x + 12, y + 58, price, 'sa-px'", "'sa-val sa-up3m '", "'sa-found sa-up3i'", "'sa-days sa-up3w'", 'spark(sp, sx, y + 34, USW, USH, \'now\')', "'›', 'sa-chev'"]) assert.ok(ap.includes(x), '첫 페이지 칸 — ' + x);
  assert.ok(ap.includes("querySelectorAll('a.sa-cell[data-code], a.sa-up3a[data-code]')") && ap.includes('c.sw ?? SW, c.sh ?? 34'), '장 중 현재가 — 1 · 2 · 3등 칸도 같은 값 · 꺾은선 크기 그대로');
  assert.ok(su.includes("/^[0-9A-Z]{6}\\/t$/.test(a)) v = await (await import('/su/su-up3.js')).vUp3(X21, a.slice(0, 6));"), '길 #/c/<번호>/t');
  assert.ok(/export async function vUp3\(X, code\)/.test(u3) && u3.includes("X.notFound('이 회사는 오늘 1 · 2 · 3등이 아니에요.") && u3.includes("h('a', {class: 'su-ask', href: '#/r/c'}") && u3.includes("href: '#/c/' + r.code + '/t'"), '쪽 — 1 · 2 · 3등만 · 달력 · 다른 두 곳으로 이어짐');
  assert.ok(u3.includes("import {dateKo, won100} from '/su/su-data.js';") && u3.includes("chip('한 달', sp ? w100(ch) : NEED") && u3.includes("' · 한 달 ' + w100(ch)}") && u3.includes("' · 한 달 ' + (o.sp ? w100(o.ch) : NEED)") && !/toFixed\(1\) \+ '%'/.test(u3), '쪽 — 한 달은 「100원이 ○원」(칩 · 꺾은선 소리 이름표 · 다른 두 곳 · 주문 1114-1306 ①)');
  assert.ok(ck.includes("'⑳ 1 · 2 · 3등 한 곳 쪽(주문 1112-0044) — '") && ck.includes("'⑳ 1 · 2 · 3등이 아닌 회사의 새 잣대 쪽 — 찾지 못했어요'"), '검사 ⑳ — 이어지는 쪽');
  // 쪽에 나오는 고정 문장 — 영어 · % · 쓰지 않을 말 없음 · 화면 낱말
  const fu = f => new URL('../../site/su/' + f, import.meta.url).href; // 화면 모듈은 /su/… 로 부름 — 시험에서는 그림 도구만 빈 것으로 · 나머지는 그 파일
  const src = u3.replace("import {h, s} from '/su/su-fig.js';", 'const h = () => null, s = () => null;').replace("import {load21} from '/su/su-21.js';", 'const load21 = async () => null;')
    .replace("'/su/su-six.js'", JSON.stringify(fu('su-six.js'))).replace("'/su/su-data.js'", JSON.stringify(fu('su-data.js')));
  const {SAY_FIXED, sz, firstPick, facts} = await import('data:text/javascript;base64,' + Buffer.from(src).toString('base64'));
  assert.ok(Array.isArray(SAY_FIXED) && SAY_FIXED.length > 10, '쪽 모듈을 불러 셈');
  {
    for (const t of SAY_FIXED) { assert.ok(!/[A-Za-z%]/.test(t) && !/매수|매도|추천|예측|확률|유망|신호|수익률/.test(t), '쓰지 않을 말 없음 — ' + t); assert.deepEqual(screenHits(t), [], '화면 낱말 — ' + t); }
    assert.deepEqual([sz(0.5), sz(-0.5), sz(0.49), sz(NaN)], ['높아요', '낮아요', '보통이에요', '확인 필요']);
    const book = {days: [{board: '2026-11-11', rule: 'up3-v1', picks: [{place: 2, code: '000001', px: 100}]}, {board: '2026-11-12', rule: 'up3-v1', picks: [{place: 1, code: '000001', px: 110}]}, {board: '2026-11-10', rule: 'culture7-v1', picks: [{place: 1, code: '000001', px: 90}]}]};
    assert.deepEqual(firstPick(book, '000001'), {board: '2026-11-11', place: 2, px: 100, n: 2}, '처음 뽑힌 날 = 새 잣대 판 날만');
    const c = Array.from({length: 21}, (_, i) => 100 + i);
    assert.deepEqual(facts({close: 120, date: 'd', c}, 'd'), {px: 120, sp: c, ch: 20}, '한 달 = 끝 ÷ 처음');
    assert.equal(facts({close: 121, date: 'd', c}, 'd').sp, null, '끝 값이 현재가와 다르면 꺾은선 없음');
  }
});
