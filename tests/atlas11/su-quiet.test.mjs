// 큐피트 넷째 창 — 조용한데 힘이 모이는 7곳 · 조용한 힘 달력(주문 1111-1334 · 사장님 2026-11-11 13:34 「조용한데 에너지가 모이는 주식창을 하나더 만들어라 그래서 총 28개로 만들고
//   몬태카를로 소거법으로을 찾아내라 그러면서 이것을 ㅊ 적하는 별도에 달력을 만들어라 잡스라면」)
//   고르기(scripts/atlas11/next/su21_quiet.py) · 따로 된 장부(su21_book.mjs --rank quiet) · 화면 글(site/su/su-quiet.js) · 길 · 그림 · 묶기 · 검사가 함께 바뀌었는지
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {stepBook, siteBook, emptyBook, okBook} from '../../scripts/atlas11/next/su21_book.mjs';
import {forwardTo} from '../../site/su/su-data.js';
import {screenHits, ruinHits} from '../../site/next/words.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const rd = f => fs.readFileSync(path.join(ROOT, f), 'utf8');
const py = code => JSON.parse(execFileSync('python3', ['-c', 'import sys, json; sys.path.insert(0, "scripts/atlas11/next"); import su21_quiet as Q\n' + code], {cwd: ROOT, encoding: 'utf8', maxBuffer: 1e7}));
const clean = s => [...screenHits(s), ...ruinHits(s)].map(x => x.word ?? x);

test('기준 일곱 — 서로 다른 이름 · 화면 글(쓰지 않을 말 0 · 「%」 0 · 영어 글자 0) · 셈 값', () => {
  const C = py('print(json.dumps({"crit": Q.QCRIT, "rule": Q.RULE_ID, "paths": Q.PATHS, "hist": Q.HIST, "win": Q.WIN, "pmax": Q.PMAX, "move": Q.MOVE}, ensure_ascii=False))');
  assert.equal(C.crit.length, 7); assert.equal(new Set(C.crit.map(c => c[0])).size, 7); assert.equal(new Set(C.crit.map(c => c[1])).size, 7);
  assert.match(C.rule, /^quiet7-v\d+$/); assert.equal(C.paths, 100000); assert.equal(C.hist, 250); assert.equal(C.win, 20); assert.equal(C.pmax, 0.2); assert.equal(C.move, 0.05);
  const all = C.crit.flatMap(c => c.slice(1)).join('\n');
  assert.deepEqual(clean(all), []); assert.ok(!all.includes('%') && !/[A-Za-z]/.test(all), all);
});

test('몬테카를로 — 같은 씨앗 같은 값 · 아주 좁은 폭은 드묾(작음) · 아주 넓은 폭은 흔함(1 가까이)', () => {
  const r = py(`import numpy as np
h = np.random.default_rng(7).normal(0, 0.02, 250)
print(json.dumps({"a": Q.quiet_p(h, 20, 0.05, 20000, 11), "b": Q.quiet_p(h, 20, 0.05, 20000, 11), "tiny": Q.quiet_p(h, 20, 0.001, 20000, 11), "wide": Q.quiet_p(h, 20, 2.0, 20000, 11)}))`);
  assert.equal(r.a, r.b, '같은 씨앗');
  assert.ok(r.tiny < 0.001, '아주 좁은 폭 ' + r.tiny); assert.ok(r.wide > 0.999, '아주 넓은 폭 ' + r.wide);
  assert.ok(r.a > r.tiny && r.a < r.wide);
});

test('고르기 — 소거 일곱(다른 세 창 · 잠잠 · 튀는 날 · 몸집 · 힘 · 기록) · 몬테카를로 드문 차례 · 같으면 힘 큰 차례 · 업종마다 둘 · 모자라면 「채움」 · 걸러 온 길은 줄어들기만', () => {
  const r = py(`import numpy as np
rng = np.random.default_rng(3)
class Ctx: pass
ctx = Ctx(); ctx.R = {}; ctx.T = 299
B, CL, cap, IND, now21 = {}, {}, {}, {}, set()
gain = {0: 900, 1: 800, 2: 700, 3: 600, 4: 500, 5: 400, 6: -50, 7: -10}
for k in range(14):
    c = '%06d' % (200000 + k)
    lr = rng.normal(0, 0.02, 300)
    if k <= 4 or k in (6, 7): lr[280:] = [0.001 if j % 2 == 0 else -0.001 for j in range(20)]   # 아주 잠잠한 한 달
    if k == 5:                                                                                       # 늘 잠잠한 회사 — 이만큼은 흔함(드물지 않음)
        lr[:280] = rng.normal(0, 0.003, 280); lr[280:] = [0.003] * 10 + [-0.003] * 10
    if k == 8: lr[280:] = [0.0] * 5 + [0.06, -0.06] + [0.0] * 13                                       # 튀는 날
    if k in (9, 10, 11): lr[280:] = 0.012                                                              # 한 달 동안 오름
    if k == 12: lr[280:] = 0.0; now21.add(c)                                                           # 다른 세 창 안
    if k == 13: lr[280:] = 0.0                                                                         # 몸집 작음
    lr[0] = 0.0
    cl = 100 * np.exp(np.cumsum(lr))
    ctx.R[c] = np.concatenate([[np.nan], np.diff(np.log(cl))])
    CL[c] = [float(v) for v in cl[279:300]]
    g = gain.get(k, 100)
    B[c] = {'brief': {'flows': {'foreign': g * 0.6, 'institution': g * 0.4, 'individual': -g, 'from': '2026-11-04', 'to': '2026-11-10', 'days': 5}}}
    cap[c] = 1 if k == 13 else 2 if k == 12 else 100 + k
    IND[c] = 'A' if k <= 2 else 'C' if k == 5 else 'B'
Q.PATHS = 20000
o = Q.find(ctx, B, CL, set(), lambda c: True, cap, now21, lambda c: IND[c], '2026-11-10')
print(json.dumps({"list": o['list'], "steps": o['steps'], "why": o['why'], "pool": o['pool'], "none": Q.flows_of({'brief': {}}), "code": {k: '%06d' % (200000 + k) for k in range(14)}}, ensure_ascii=False))`);
  const C = k => r.code[k];
  assert.deepEqual(r.list, [C(0), C(1), C(3), C(4), C(5)], '드문 넷(힘 큰 차례 · 업종 A 는 둘까지) 다음 채움 하나');
  assert.deepEqual(r.steps.map(x => x[0]), ['우량주', '값이 있음', '다른 세 창 밖', '한 달이 잠잠', '튀는 날 없음', '몸집이 작지 않음', '힘이 모임', '지난 1년 기록', '몬테카를로 드문 조용함', '업종마다 둘까지 · 일곱']);
  assert.deepEqual(r.steps.map(x => x[1]), [14, 14, 13, 10, 9, 8, 6, 6, 5, 5]);
  assert.equal(r.pool, 6);
  assert.deepEqual(r.list.map(c => r.why[c].place), [1, 2, 3, null, null], '첫 셋 = 1 · 2 · 3등');
  assert.deepEqual(r.list.map(c => r.why[c].rare), [true, true, true, true, false], '채움 표시');
  assert.ok(r.list.slice(0, 4).every(c => r.why[c].p <= 0.2) && r.why[C(5)].p > 0.2, JSON.stringify(r.list.map(c => r.why[c].p)));
  for (const c of r.list) { const w = r.why[c]; assert.ok(Math.abs(w.r20) < 5 && w.day5 < 5 && w.f + w.i > 0 && w.days === 5, c + ' ' + JSON.stringify(w)); }
  assert.equal(r.none, null, '흐름이 없으면 없음');
});

test('따로 된 장부 — quiet.rank 첫 셋을 그 판 날 마지막 값으로(kind quiet) · 1 · 2 · 3등 장부와 섞이지 않음', () => {
  const d = '2026-11-10', T = {asOf: {board: d}, listRule: 'mc365-v1', top3: {rank: [{place: 1, k: 'hot', code: '000001', name: 'ㄱ'}, {place: 2, k: 'hot', code: '000002', name: 'ㄴ'}, {place: 3, k: 'bloom', code: '000003', name: 'ㄷ'}]},
    quiet: {rule: 'quiet7-v1', rank: [{place: 1, k: 'quiet', code: '000004', name: 'ㄹ'}, {place: 2, k: 'quiet', code: '000005', name: 'ㅁ'}, {place: 3, k: 'quiet', code: '000006', name: 'ㅂ'}]}};
  const board = {asOf: d, companies: [1, 2, 3, 4, 5, 6].map(n => ({code: '00000' + n, name: '회사' + n, date: d, close: 1000 * n}))};
  const q = stepBook(null, T, board, '2026-11-10T16:00:00+09:00', 'quiet');
  assert.equal(q.book.kind, 'quiet'); assert.ok(okBook(q.book));
  assert.deepEqual(q.added.picks.map(p => [p.place, p.k, p.code, p.px]), [[1, 'quiet', '000004', 4000], [2, 'quiet', '000005', 5000], [3, 'quiet', '000006', 6000]]);
  assert.equal(q.added.rule, 'quiet7-v1');
  assert.equal(siteBook(q.book, d).kind, 'quiet');
  const t = stepBook(null, T, board, '2026-11-10T16:00:00+09:00');
  assert.deepEqual(t.added.picks.map(p => p.code), ['000001', '000002', '000003'], '1 · 2 · 3등 장부는 top3.rank 그대로');
  assert.equal(siteBook(t.book, d).kind, undefined);
  assert.equal(stepBook(null, {...T, quiet: null}, board, '2026-11-10T16:00:00+09:00', 'quiet').added, null, '넷째 창이 없으면 적지 않음');
  assert.equal(emptyBook('quiet').kind, 'quiet'); assert.ok(!emptyBook('quiet').note.includes('수익'));
});

test('화면 글 — 한 달 폭 · 이만큼 조용하기 · 외국인 · 기관(「%」 0 · 쓰지 않을 말 0) · 탭 0 · 쪽 짜임', async () => {
  const src = rd('site/su/su-quiet.js');
  const M = await import('data:text/javascript;base64,' + Buffer.from(src.replace("import {h, s} from '/su/su-fig.js';", 'const h = () => null, s = () => null;')).toString('base64'));
  assert.equal(M.spanSay(3.04), '한 달 폭: 100원에 3원'); assert.equal(M.spanSay(4.56), '한 달 폭: 100원에 4.6원');
  assert.equal(M.rareSay(0.00001), '이만큼 조용하기: 100번에 0.1번 아래'); assert.equal(M.rareSay(0.0312), '이만큼 조용하기: 100번에 3.1번');
  assert.equal(M.flowSay({f: 120000, i: 3456, days: 5}), '닷새 동안 외국인 · 기관 합쳐 123,456주 들어왔어요');
  assert.equal(M.flowSay({f: -10, i: 4, days: 4}), '4거래일 동안 외국인 · 기관 합쳐 6주 나갔어요');
  const texts = [...src.matchAll(/'([^'\n]*[가-힣][^'\n]*)'/g)].map(m => m[1]).join('\n');
  assert.deepEqual(clean(texts), []); assert.ok(!texts.includes('%'), '화면 글 「%」 0');
  assert.ok(!/\bstyle:/.test(src) && !/\.style\b/.test(src) && !/innerHTML/.test(src), '글 속 꾸밈 · innerHTML 0');
  assert.ok(/return \{title: T, tab: 0, step: null, kick: [^\n]*, h1: T, proper: false, hero, body: \[how\],\n/.test(src), '탭 0(28곳) · hero · body');
  assert.ok(src.includes("'조용한 뒤에 오를지 내릴지는 몰라요. 지난 기록만 보여 줘요.'"), '앞날을 맞히지 않음을 쪽에 씀');
  const css = rd('site/su/su-book.css');
  for (const [k, px] of [...css.matchAll(/font-size:\s*(\d+(?:\.\d+)?)px/g)].map(m => [m[0], +m[1]])) assert.ok(px >= 17, '글 17px 넘게 — ' + k);
  assert.ok(/\.qt-cal \{[^}]*min-height: 56px/.test(css), '달력 고리 누르는 곳 56');
});

test('길 · 서랍 · 그림 · 묶기 · 검사(주문 1111-1334)', () => {
  const su = rd('site/su/su.js'), ap = rd('site/su/su-apple.js'), s21 = rd('site/su/su-21.js'), pk = rd('scripts/atlas11/package.mjs'), ck = rd('scripts/atlas11/next/check_su.mjs'), p21 = rd('scripts/atlas11/next/su21.py');
  assert.equal(forwardTo('', '#/s'), null); assert.equal(forwardTo('', '#/r/s'), null);
  assert.ok(su.includes("else if (t && t[1] === 's') v = await (await import('/su/su-quiet.js')).vQuiet(X21);"), '길 #/s');
  assert.ok(su.includes("a === 's' ? await (await import('/su/su-book.js')).vBook(X21, 'quiet')"), '길 #/r/s');
  assert.ok(su.includes("drawer('#/r/s', '조용한 힘 달력'"), '기록 쪽 서랍');
  assert.ok(ap.includes("'data-k': 'quiet'") && ap.includes('function cellQ') && /nNow = [^\n]*quiet/.test(ap), '처음 쪽 그림 넷째 창 칸 · 지금 수에 일곱');
  assert.ok(s21.includes("'넷째 창 조용한데 힘이 모이는 ' + nq + '곳을 더해 ' + (21 + nq) + '곳이에요.'") && s21.includes("'aria-label': '지금 28곳 · 될 듯 21곳'"), '21곳 쪽 글 · 지금 28곳');
  assert.ok(p21.includes('import su21_quiet as QU') && p21.includes("'quiet': QUIET"), 'su21.py 가 넷째 창을 셈');
  assert.ok(/'--rank', 'quiet'[\s\S]{0,300}reports\/atlas11\/su21\/qbook\.json[\s\S]{0,100}\.\.\.\(keepJob \? \['--keep'\] : \[\]\)/.test(pk), '묶기 — 따로 된 장부 · 올리기 작업만 저장');
  assert.ok(ck.includes('㉒ 넷째 창 자료') && ck.includes('㉒ 조용한 힘 장부 자료') && ck.includes('#/s 줄 일곱 = 자료 차례') && ck.includes('#/r/s 조용한 힘 달력'), '검사 ㉒');
});
