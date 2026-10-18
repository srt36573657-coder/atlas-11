// 진화 회차 자기 시험 — node scripts/atlas11/jinhwa/round.mjs --selftest [--verbose]
//   망 없이: 셈 시험(① ~ ⑱) + 진짜 round.mjs 명령을 임시 git 원격(맨 저장소 · 이 기계 안)에 대고 끝까지 돌림(E1 ~ E8)
//   가짜로 갈음하는 것 = 열쇠 없는 상태 읽기 · 올리기 목록(gh run list) · 바뀐 쪽 검사 · 빠른 검사 · 모든 쪽 미리 검사 결과 · 그림 찍기 · 지금 사이트 자료 · 합계 칸
//   진짜로 도는 것 = git(가지 · 얹기 · 지문 · 앞으로만 밀기 · 되돌리기 · 잠금) · 본질 파일 · 잠금 맞대기 · words.js · brand.js · 잣대 파일 · 진화 칸 자료 꼴 · 기록(새 파일만)
//   임시 폴더는 끝에 지움 · 끝 코드 0 = 실패 0
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import zlib from 'node:zlib';
import {spawnSync} from 'node:child_process';
import {pathToFileURL} from 'node:url';
import * as L from './lib.mjs';
import * as G from './gh.mjs';
import {runCommand, ROOT, loadWords} from './round.mjs';

const T = [];
const test = (name, fn) => T.push({name, fn});
const eq = (a, b, m) => { if (JSON.stringify(a) !== JSON.stringify(b)) throw Error(`${m ?? ''} — 기대 ${JSON.stringify(b)} · 받음 ${JSON.stringify(a)}`); };
const ok = (c, m) => { if (!c) throw Error(m ?? '참이 아님'); };
const readJson = f => JSON.parse(fs.readFileSync(f, 'utf8'));

// ───────────── 공통 거리 ─────────────
const METRICS = readJson(path.join(ROOT, L.METRICS_FILE));
const ESS = L.readEssence(ROOT);
const UNITS = L.essenceUnits(ESS.lines);
const ID = n => `20261019-0930-${n}`;
const card = (id, o = {}) => ({id, title: '오늘 칸 날짜 옆에 받은 때', pick: false, serves: '② 지난 기록만 보여 준다.', before: L.imgOf(id, 'before'), after: L.imgOf(id, 'after'),
  voices: {kahneman: '서두르게 하지 않아요.', munger: '망치는 길에 닿지 않아요.', popper: '틀리면 바로 되돌려요.'}, predict: {text: '다른 곳이 0 으로 남아요.', measure: L.measureRules(METRICS).find(r => r.measure === 'fact' && r.dir === 'zero').text, days: 10},
  revert: '다른 곳이 하나라도 나오면 되돌려요.', premortem: '날짜가 늦게 와서 헷갈렸을 수 있어요.', big: false, risks: [], branch: L.branchOf(id), files: ['site/next/p-today.js'], checks: {changed: 0, preview: 0}, ...o});
const data = (o = {}) => ({schema: L.SCHEMA, made: '2026-10-19T09:00:00+09:00', essence: ESS.first, n: 0, next: '2026-10-19T12:00:00+09:00', waiting: [], applied: [], fixed: [], facts: {mismatch: 0, at: '2026-10-19T08:00:00+09:00'}, ...o});
const rec = (id, o = {}) => ({schema: L.REC_SCHEMA, id, start: '2026-10-19T09:30:00+09:00', ...o});
const madeRec = (ids, state = 'pass') => rec('20261019-0930', {made: ids.map(id => ({id, ok: true, changeHash: 'h' + id.slice(-1), commit: 'c'.repeat(39) + id.slice(-1), files: ['site/next/p-today.js'], preview: {state}}))});
const st = (items, ok = true) => (ok ? {ok: true, why: '', items, unknown: 0} : {ok: false, why: 'x', items: [], unknown: 0});

// ① ~ ⑤ 확인된 것만 · 하나씩
test('① 확인 없음 → 넣지 않음', () => { const p = L.planRound({data: data({waiting: [card(ID(1), {pick: true})]}), status: st([]), records: [madeRec([ID(1)])]}); eq(p.change, null); eq(p.next, 'retest'); });
test('② 둘 확인 → 이른 것 하나만 · 다른 하나는 다음 회차', () => {
  const p = L.planRound({data: data({waiting: [card(ID(1), {pick: true}), card(ID(2))]}), status: st([{id: ID(2), state: 'confirmed', at: '2026-10-19T00:20:00Z'}, {id: ID(1), state: 'confirmed', at: '2026-10-19T00:10:00Z'}]), records: [madeRec([ID(1), ID(2)])]});
  eq(p.change?.id, ID(1)); eq(p.change?.kind, 'apply'); ok(p.ignored.some(x => x.id === ID(2) && /한 번에 하나/.test(x.why)));
});
test('③ 상태 꼴을 모름 → 넣지 않음(닫힌 쪽)', () => {
  for (const raw of [null, 'x', {foo: 1}, 42]) { const s = L.normalizeStatus(raw); eq(s.ok, false); eq(L.planRound({data: data({waiting: [card(ID(1), {pick: true})]}), status: s, records: [madeRec([ID(1)])]}).change, null); }
  const s = L.normalizeStatus({items: [{id: ID(1), state: '???'}]}); eq(L.planRound({data: data({waiting: [card(ID(1), {pick: true})]}), status: s, records: [madeRec([ID(1)])]}).change, null, '모르는 상태');
});
test('④ 거둔 확인 · 되돌리기를 거둠 → 아무것도 안 함', () => {
  for (const state of ['withdrawn', 'kept', 'waiting']) eq(L.planRound({data: data({waiting: [card(ID(1), {pick: true})]}), status: L.normalizeStatus({items: [{id: ID(1), state}]}), records: [madeRec([ID(1)])]}).change, null, state);
});
test('⑤ 이미 들어감 · 지문 기록 없음 · 회차 때 뒤에 온 확인 · 내려간 대안 → 넣지 않음', () => {
  const a = {id: ID(1), title: 't', at: '2026-10-19T10:00:00+09:00', before: L.imgOf(ID(1), 'before'), after: L.imgOf(ID(1), 'after'), predict: card(ID(1)).predict, score: {at: null, ok: null, text: 'x'}};
  eq(L.planRound({data: data({applied: [a], n: 1}), status: st([{id: ID(1), state: 'confirmed', at: null}]), records: []}).change, null, '이미 들어감');
  eq(L.planRound({data: data({waiting: [card(ID(1), {pick: true})]}), status: st([{id: ID(1), state: 'confirmed', at: null}]), records: []}).change, null, '지문 없음');
  eq(L.planRound({data: data({waiting: [card(ID(1), {pick: true})]}), status: st([{id: ID(1), state: 'confirmed', at: '2026-10-19T00:45:00Z'}]), records: [madeRec([ID(1)])], cutoff: '2026-10-19T09:30:00+09:00'}).change, null, '때 뒤');
  eq(L.planRound({data: data({waiting: [card(ID(1), {pick: true})]}), status: st([{id: ID(1), state: 'confirmed', at: null}]), records: [madeRec([ID(1)]), rec('20261019-1130', {dropped: [{id: ID(1), why: 'x'}]})]}).change, null, '내려감');
  eq(L.planRound({data: data({waiting: [card(ID(1), {pick: true})]}), status: st([{id: ID(1), state: 'confirmed', at: '2026-10-19T00:29:00Z'}]), records: [madeRec([ID(1)])], cutoff: '2026-10-19T09:30:00+09:00'}).change?.id, ID(1), '때 앞이면 넣음');
});
test('⑥ 다른 올리기가 돎 → 기다림 · 못 읽으면 바쁜 것으로', async () => {
  const run = (rows, okk = true) => () => ({ok: okk, out: JSON.stringify(rows)});
  eq(G.deploysRunning('.', {runner: run([{databaseId: 1, status: 'in_progress'}])}).running.length, 3, '작업 셋 모두 돎');
  eq(G.deploysRunning('.', {runner: run([], false)}).ok, false);
  const w = await G.waitDeploys('.', {maxMin: 0.0005, every: 0.01, runner: run([{databaseId: 1, status: 'queued'}])});
  eq(w.clear, false);
  eq((await G.waitDeploys('.', {maxMin: 0.01, every: 0.01, runner: run([{databaseId: 1, status: 'completed'}])})).clear, true);
});
test('⑦ 들어감 — applied 에 번호 · 때 · n + 1 · 기다림에서 빠짐 · 남은 것은 세 사람 꼬리표 없이 그대로', () => {
  const d = data({waiting: [card(ID(1), {pick: true}), card(ID(2), {title: '둘'}), card(ID(3), {title: '셋'})]});
  const n = L.nextJinhwa(d, {now: new Date('2026-10-19T00:40:00Z'), essence: ESS.first, apply: {id: ID(1), at: '2026-10-19T09:41:00+09:00'}});
  eq(n.n, 1); eq(n.applied[0].id, ID(1)); eq(n.applied[0].at, '2026-10-19T09:41:00+09:00'); eq(n.waiting.map(w => w.id), [ID(2), ID(3)]); eq(n.waiting.some(w => w.pick), false);
  eq(L.validateJinhwa(n, {measures: L.measureTexts(METRICS), units: UNITS}).ok, true);
  const r = L.nextJinhwa(n, {now: new Date('2026-10-20T00:40:00Z'), essence: ESS.first, revert: {id: ID(1), at: '2026-10-20T09:41:00+09:00'}});
  eq(r.applied[0].revertedAt, '2026-10-20T09:41:00+09:00'); eq(r.n, 1);
});
test('⑧ 할 일 — 기다림 0 → make · 있으면 retest · 넣은 회차 → none · 못 본 미리 검사 → finish', () => {
  eq(L.planRound({data: data(), status: st([]), records: []}).next, 'make');
  eq(L.planRound({data: data({waiting: [card(ID(1), {pick: true})]}), status: st([]), records: [madeRec([ID(1)])]}).next, 'retest');
  eq(L.planRound({data: data({waiting: [card(ID(1), {pick: true})]}), status: st([{id: ID(1), state: 'confirmed', at: null}]), records: [madeRec([ID(1)])]}).next, 'none');
  eq(L.planRound({data: data(), status: st([]), records: [madeRec([ID(1)], 'running')]}).next, 'finish');
});
test('⑨ 카드 — 서로 다른 셋 · 1번 = 세 사람이 함께 · 세 눈 · 빈 칸 · 본질 줄 · 잣대 밖 · 큰 것 위험 두 줄 · 낱말 · 알림 한 줄', async () => {
  const W = await loadWords(ROOT), words = {screenHits: W.screenHits, ruinHits: W.ruinHits, gainHits: W.gainHits, oldNames: W.oldNames};
  const eyes = {kahneman: {faster: false}, munger: {ruin: false, bend: false}, popper: {predict: true, revert: true, small: true}};
  const all = {kahneman: true, munger: true, popper: true};
  const alts = [{n: 1, title: 'a', changeHash: 'x1', eyes, accept: all}, {n: 2, title: 'b', changeHash: 'x2', eyes, accept: all}, {n: 3, title: 'c', changeHash: 'x3', eyes, accept: {...all, popper: false}}];
  eq(L.pickCheck({top: {kahneman: 2, munger: 2, popper: 1}, alts}).order, [2, 1, 3]);
  ok(!L.pickCheck({top: {kahneman: 1, munger: 1, popper: 1}, alts: alts.map(a => ({...a, changeHash: 'same'}))}).ok, '같은 고침');
  ok(!L.pickCheck({top: {kahneman: 3, munger: 3, popper: 3}, alts: alts.map(a => ({...a, accept: {...all, munger: false}}))}).ok, '셋이 함께 고른 것 없음');
  ok(!L.pickCheck({top: {kahneman: 1, munger: 2, popper: 3}, alts}).ok, '1번을 맨 먼저 꼽은 사람이 하나');
  ok(!L.pickCheck({top: {kahneman: 1, munger: 1, popper: 1}, alts: [{...alts[0], eyes: {...eyes, kahneman: {faster: true}}}]}).ok, '카너먼 눈');
  ok(!L.eyesCheck({...eyes, munger: {ruin: false, bend: true}}).ok, '멍거 눈 잣대 비틂'); ok(!L.eyesCheck({...eyes, popper: {predict: true, revert: false, small: true}}).ok, '포퍼 눈');
  const draft = {title: '오늘 칸 날짜 옆에 받은 때', serves: '② 지난 기록만 보여 준다.', voices: {kahneman: '서두르게 하지 않아요.', munger: '망치는 길에 닿지 않아요.', popper: '틀리면 바로 되돌려요.'},
    predict: {text: '다른 곳이 0 으로 남아요.', rule: {measure: 'fact', num: 'mismatch', dir: 'zero'}}, revert: '다른 곳이 나오면 되돌려요.', premortem: '날짜가 늦게 와서 헷갈렸을 수 있어요.', big: false, risks: []};
  const o = {id: ID(1), pick: true, files: ['site/next/p-today.js'], units: UNITS, metrics: METRICS, big: [], words};
  const c = L.cardFrom(draft, o); ok(c.ok, c.why.join(' · ')); eq(c.rule, {measure: 'fact', num: 'mismatch', dir: 'zero'});
  for (const [what, d2, o2] of [
    ['빈 한마디', {...draft, voices: {...draft.voices, popper: ''}}],
    ['본질 줄이 아님', {...draft, serves: '더 많이 오게 한다.'}],
    ['잣대 셋 밖(방문 수)', {...draft, predict: {...draft.predict, rule: {measure: 'visit', num: 'visit', dir: 'up'}}}],
    ['큰 것인데 위험 한 줄', {...draft, big: true, risks: ['하나']}],
    ['기계가 찾은 큰 것 · 위험 없음', draft, {big: ['카카오']}],
    ['쓰지 않을 말(예측)', {...draft, voices: {...draft.voices, kahneman: '예측이 맞을 거예요.'}}],
    ['망치는 길 낱말(대박)', {...draft, title: '대박 칸'}],
    ['옛 이름', {...draft, premortem: '고도리 때처럼 헷갈림.'}],
    ['퍼센트', {...draft, predict: {...draft.predict, text: '10% 늘어요.'}}],
    ['빈 되돌릴 조건', {...draft, revert: ''}],
  ]) ok(!L.cardFrom(d2, {...o, ...(o2 ?? {})}).ok, what);
  ok(/새 대안 3개/.test(L.noticeLine(3, new Date('2026-10-19T03:00:00Z'), W.name)) && L.noticeLine(3, null, W.name).startsWith(W.name), '알림 한 줄');
});
test('⑩ 작음 — 6개 막힘 · 5개 지남 · 못 고치는 파일 · 지운 파일 · 잣대 신호 줄', () => {
  const f = n => Array.from({length: n}, (_, i) => ({path: `site/next/p-x${i}.js`, status: 'M'}));
  eq(L.fileCheck(f(6)).ok, false); eq(L.fileCheck(f(5)).ok, true);
  for (const p of [L.essenceFileOf(ROOT), 'docs/꼴똘이_본질.md', L.LOCK_FILE, L.ORDER_FILE, L.METRICS_FILE, 'site/next/words.js', 'site/next/tally.js', 'scripts/atlas11/jinhwa/round.mjs', L.ROUND_DOC,
    'reports/atlas11/jinhwa/x.json', 'site/next/data/jinhwa.json', '.github/workflows/atlas11-daily.yml', 'scripts/atlas11/next/essence_check.mjs', 'scripts/atlas11/next/check_why.mjs', 'site/atlas/app.js', 'site/next/brand.js', 'lib/atlas11/jinhwa.mjs', 'site/next/p-jinhwa.js'])
    ok(!L.fileCheck([{path: p, status: 'M'}]).ok, '지킴 ' + p);
  ok(!L.fileCheck([{path: 'site/next/p-why.js', status: 'D'}]).ok, '지운 파일');
  ok(!L.fileCheck([{path: 'site/next/p-why.js', status: 'M'}], {patch: "diff --git a/site/next/p-why.js b/site/next/p-why.js\n+  tally('stop_rest');"}).ok, '잣대 신호');
  ok(L.bigReasons([{path: 'site/next/p-why.js', status: 'M'}]).length > 0 && L.bigReasons([{path: 'site/next/new.js', status: 'A'}]).includes('새 기능(새 파일)') && L.bigReasons([{path: 'site/next/p-today.js', status: 'M'}], "localStorage.setItem('x', 1)").length > 0, '큰 것');
  eq(L.bigReasons([{path: 'site/next/p-today.js', status: 'M'}], 'const a = 1;'), [], '작은 것');
});
test('⑪ 고장 고침 — 갈래 셋 · 3파일 · 20줄 · 줄마다 작게 · css · 새 파일', () => {
  const P = (a, b) => `diff --git a/site/next/p-today.js b/site/next/p-today.js\n@@ -1 +1 @@\n-${a}\n+${b}`;
  const typo = P("text: '받은 떄'", "text: '받은 때'");
  ok(L.fixCheck([{path: 'site/next/p-today.js', status: 'M'}], [{add: '1', del: '1'}], '오타', typo).ok, '작은 오타 고침');
  ok(!L.fixCheck([{path: 'site/next/p-today.js', status: 'M'}], [{add: '1', del: '1'}], '모양', typo).ok, '갈래 밖');
  ok(!L.fixCheck(['a', 'b', 'c', 'd'].map(x => ({path: `site/next/p-${x}.js`, status: 'M'})), [], '오타', '').ok, '4파일');
  ok(!L.fixCheck([{path: 'site/next/p-today.css', status: 'M'}], [{add: '1', del: '1'}], '오타', typo).ok, 'css');
  ok(!L.fixCheck([{path: 'site/next/p-new.js', status: 'A'}], [{add: '1', del: '0'}], '깨진 길', '').ok, '새 파일');
  ok(!L.fixCheck([{path: 'site/next/p-today.js', status: 'M'}], [{add: '12', del: '12'}], '오타', typo).ok, '24줄');
  ok(!L.fixCheck([{path: 'site/next/p-today.js', status: 'M'}], [{add: '1', del: '1'}], '오타', P("text: '받은 때'", "text: '이 칸은 이제 완전히 다른 뜻을 말하는 새 글로 바뀌었어요'")).ok, '뜻이 바뀜');
  ok(!L.fixCheck([{path: 'site/next/p-today.js', status: 'M'}], [{add: '2', del: '1'}], '오타', P('a', 'b') + '\n+c').ok, '줄을 더함');
});
test('⑫ 기록은 새 파일만 — 같은 이름이면 쓰지 않음 · 번호 꼴', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'jh-rec-'));
  try {
    L.writeRecord(dir, {schema: L.REC_SCHEMA, id: '20261019-0930', a: 1});
    let threw = null; try { L.writeRecord(dir, {schema: L.REC_SCHEMA, id: '20261019-0930', a: 2}); } catch (e) { threw = e.code; }
    eq(threw, 'EEXIST'); eq(readJson(path.join(dir, '20261019-0930.json')).a, 1, '처음 것 그대로');
    let bad = false; try { L.writeRecord(dir, {id: '../x'}); } catch { bad = true; } ok(bad, '번호 꼴');
  } finally { fs.rmSync(dir, {recursive: true, force: true}); }
});
test('⑬ 지시문 첫 줄 = 본질 먼저 · 꼭 있을 말 · 회차 도구에 비밀 값 · 사장님 열쇠 0', () => {
  const doc = fs.readFileSync(path.join(ROOT, L.ROUND_DOC), 'utf8');
  const first = doc.split('\n')[0].replace(/^#\s*/, '');
  ok(first.startsWith(`먼저 ${L.essenceFileOf(ROOT)}를 읽는다`), '첫 줄: ' + first.slice(0, 60));
  for (const w of ['gh api', '/api/jinhwa/status', 'round.mjs begin', 'round.mjs apply', 'round.mjs record', '한 번에 하나', '카너먼', '멍거', '포퍼', 'PushNotification', '세 줄', '확인 없이', '고친 고장', '사전 부검', '큰 것', '10거래일', '없으면 없다고'])
    ok(doc.includes(w), '지시문에 「' + w + '」');
  for (const f of ['round.mjs', 'gh.mjs', 'lib.mjs', 'shots.mjs', 'selftest.mjs'].map(f => path.join(ROOT, 'scripts/atlas11/jinhwa', f)).concat(path.join(ROOT, L.ROUND_DOC))) {
    const t = fs.readFileSync(f, 'utf8');
    ok(!/(ghp_|github_pat_|gho_|nfp_|sk-ant-)[A-Za-z0-9_]{16,}/.test(t), '비밀 값 ' + f);
    if (!/selftest|ROUND_DOC|jinhwa-round/.test(path.basename(f))) ok(!/x-atlas-owner/i.test(t), '사장님 열쇠 머리글 ' + f);
  }
});
test('⑭ 10거래일 뒤 채점 — 전 · 모으는 중 · 맞음 · 소음 · 틀림 · 사실 · 60거래일', () => {
  const cal = readJson(path.join(ROOT, L.CAL_FILE));
  const days = {}, put = (from, to, v) => { for (let d = from; d <= to; d = L.addDays(d, 1)) days[d] = {...v}; };
  const rule = {measure: 'stop', num: 'stop_rest', den: 'stop', dir: 'up'};
  eq(L.scoreApplied({rule, at: '2026-10-19T09:41:00+09:00', today: '2026-10-25', cal, tally: {ok: true, days}}).done, false, '10거래일 전');
  put('2026-09-01', '2026-11-30', {stop: 1, stop_rest: 0});
  const small = L.scoreApplied({rule, at: '2026-10-19T09:41:00+09:00', today: '2026-11-05', cal, tally: {ok: true, days}});
  eq([small.done, small.ok], [false, null], '표본 작음 → 모으는 중');
  put('2026-10-01', '2026-10-18', {stop: 10, stop_rest: 2}); put('2026-10-19', '2026-11-30', {stop: 10, stop_rest: 6});
  const good = L.scoreApplied({rule, at: '2026-10-19T09:41:00+09:00', today: '2026-11-05', cal, tally: {ok: true, days}});
  eq([good.done, good.ok], [true, true], '뚜렷이 늘면 맞음');
  put('2026-10-19', '2026-11-30', {stop: 10, stop_rest: 2});
  const same = L.scoreApplied({rule, at: '2026-10-19T09:41:00+09:00', today: '2026-11-05', cal, tally: {ok: true, days}});
  eq([same.done, same.ok], [true, null], '같으면 소음 → 판단 못 함');
  put('2026-10-19', '2026-11-30', {stop: 10, stop_rest: 0});
  eq(L.scoreApplied({rule, at: '2026-10-19T09:41:00+09:00', today: '2026-11-05', cal, tally: {ok: true, days}}).ok, false, '뚜렷이 줄면 틀림');
  eq(L.scoreApplied({rule, at: '2026-10-19T09:41:00+09:00', today: '2026-11-05', cal, tally: {ok: false, days: {}}}).done, false, '합계를 못 읽으면 미룸');
  const fz = {measure: 'fact', num: 'mismatch', dir: 'zero'};
  eq(L.scoreApplied({rule: fz, at: '2026-10-19T09:41:00+09:00', today: '2026-11-05', cal, rounds: [{date: '2026-10-20', mismatch: 0}, {date: '2026-10-27', mismatch: 0}]}).ok, true, '사실 0 내내');
  eq(L.scoreApplied({rule: fz, at: '2026-10-19T09:41:00+09:00', today: '2026-11-05', cal, rounds: [{date: '2026-10-20', mismatch: 0}, {date: '2026-10-27', mismatch: 2}]}).ok, false, '사실 한 번 2');
  const tiny = {}; for (let d = '2026-06-01'; d <= '2027-03-31'; d = L.addDays(d, 1)) tiny[d] = {stop: 0, stop_rest: 0};
  const r60 = L.scoreApplied({rule, at: '2026-10-19T09:41:00+09:00', today: '2027-03-01', cal, tally: {ok: true, days: tiny}});
  eq([r60.done, r60.ok, r60.n], [true, null, 60], '60거래일까지 모아도 작으면 판단 못 함');
});
test('⑮ 진화 칸 자료 — 지금 파일 · 빈 판 꼴 검사(낱말 · 잣대 · 본질 줄 · 그림)', async () => {
  const W = await loadWords(ROOT), words = {screenHits: W.screenHits, ruinHits: W.ruinHits, gainHits: W.gainHits, oldNames: W.oldNames};
  const f = path.join(ROOT, L.DATA_FILE);
  if (fs.existsSync(f)) { const v = L.validateJinhwa(readJson(f), {measures: L.measureTexts(METRICS), units: UNITS, words, exists: x => fs.existsSync(path.join(ROOT, x))}); ok(v.ok, v.errors.join(' · ')); }
  const e = L.emptyJinhwa({essence: ESS.first, now: new Date('2026-10-18T09:00:00Z')});
  ok(L.validateJinhwa(e, {words}).ok); eq([e.n, e.waiting.length, e.applied.length, e.fixed.length], [0, 0, 0, 0]);
  ok(!L.validateJinhwa({...e, n: 1}).ok, 'n 이 들어간 수와 다름');
  ok(!L.validateJinhwa(data({waiting: [card(ID(1)), card(ID(2), {pick: true, title: '둘'})]})).ok, '세 사람이 고른 것이 맨 앞이 아님');
  for (const t of L.measureTexts(METRICS)) eq(L.textHits(t, words), [], '재는 법 글 ' + t);
});
test('⑯ 사실 잣대 — 지금 사이트 모든 쪽 검사 결과에서 셈 · 못 읽으면 「?」', () => {
  const dir = path.join(ROOT, L.LIVE_DIR), sum = fs.existsSync(path.join(dir, 'summary.json')) ? readJson(path.join(dir, 'summary.json')) : null;
  if (sum) { const f = L.factsFrom(sum, n => { try { return readJson(path.join(dir, n + '.json')); } catch { return null; } }, new Date(sum.at)); ok(Number.isInteger(f.mismatch), JSON.stringify(f)); }
  eq(L.factsFrom(null).mismatch, null);
  eq(L.factsFrom({mode: 'live', at: '2026-10-18T08:26:25.988Z', pages: [{name: 'a', code: 0}]}, () => null, new Date('2026-10-18T09:00:00Z')).mismatch, null, '쪽 결과 없음');
  eq(L.factsFrom({mode: 'live', at: '2026-10-18T08:26:25.988Z', pages: [{name: 'a', code: 1}, {name: 'b', code: 0}]}, n => ({fails: n === 'a' ? [1, 2] : 0}), new Date('2026-10-18T09:00:00Z')).mismatch, 2);
  eq(L.factsFrom({mode: 'live', at: '2026-10-10T08:26:25.988Z', pages: [{name: 'a', code: 0}]}, () => ({fails: []}), new Date('2026-10-18T09:00:00Z')).mismatch, null, '이틀 넘게 묵음');
});
test('⑰ 본질 잠금 — 지금 저장소 맞음 · 한 글자 바꾸면 회차를 멈춤', () => {
  ok(L.essenceLockCheck(ROOT).ok, L.essenceLockCheck(ROOT).why.join(' · '));
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'jh-lock-'));
  try {
    for (const f of [L.essenceFileOf(ROOT), L.LOCK_FILE, L.ORDER_FILE]) { fs.mkdirSync(path.join(dir, path.dirname(f)), {recursive: true}); fs.copyFileSync(path.join(ROOT, f), path.join(dir, f)); }
    ok(L.essenceLockCheck(dir).ok, '사본 맞음');
    fs.appendFileSync(path.join(dir, L.essenceFileOf(ROOT)), '\n6. 더 빨리 사게 한다.\n');
    ok(!L.essenceLockCheck(dir).ok, '고친 본질');
  } finally { fs.rmSync(dir, {recursive: true, force: true}); }
});
test('⑱ 때 — 회차 때 · 실리는 업데이트 · 확인하면 들어가는 업데이트', () => {
  eq(L.isoKst(L.roundCutoff(new Date('2026-10-19T00:33:00Z'))), '2026-10-19T09:30:00+09:00');
  eq(L.isoKst(L.carrySlot(new Date('2026-10-19T00:50:00Z'))), '2026-10-19T10:00:00+09:00');
  eq(L.isoKst(L.carrySlot(new Date('2026-10-19T00:57:00Z'))), '2026-10-19T12:00:00+09:00', '4분 안이면 다음 업데이트');
  eq(L.isoKst(L.nextSlot(new Date('2026-10-18T10:00:00Z'))), '2026-10-19T12:00:00+09:00', '일요일 저녁 판 → 월요일 12시');
  eq(L.roundId(new Date('2026-10-19T00:30:00Z')), '20261019-0930');
});

// ───────────── 끝까지(임시 git 원격) ─────────────
const crc = (() => { const t = new Uint32Array(256); for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; t[n] = c >>> 0; } return b => { let c = 0xffffffff; for (const x of b) c = t[(c ^ x) & 0xff] ^ (c >>> 8); return (c ^ 0xffffffff) >>> 0; }; })();
const chunk = (type, body) => { const len = Buffer.alloc(4); len.writeUInt32BE(body.length); const tb = Buffer.concat([Buffer.from(type), body]); const c = Buffer.alloc(4); c.writeUInt32BE(crc(tb)); return Buffer.concat([len, tb, c]); };
/** 진짜 PNG(360 × 640 · 한 빛깔) */
function png(w = 360, h = 640, rgb = [240, 238, 230]) {
  const ihdr = Buffer.alloc(13); ihdr.writeUInt32BE(w, 0); ihdr.writeUInt32BE(h, 4); ihdr[8] = 8; ihdr[9] = 2;
  const row = Buffer.alloc(1 + w * 3); for (let i = 0; i < w; i++) row.set(rgb, 1 + i * 3);
  return Buffer.concat([Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]), chunk('IHDR', ihdr), chunk('IDAT', zlib.deflateSync(Buffer.concat(Array(h).fill(row)))), chunk('IEND', Buffer.alloc(0))]);
}
const sh = (cwd, cmd, args, input) => { const r = spawnSync(cmd, args, {cwd, encoding: 'utf8', input, env: {...process.env, GIT_AUTHOR_NAME: 't', GIT_AUTHOR_EMAIL: 't@t', GIT_COMMITTER_NAME: 't', GIT_COMMITTER_EMAIL: 't@t'}}); if (r.status !== 0) throw Error(`${cmd} ${args.join(' ')} — ${r.stderr}`); return r.stdout.trim(); };
const write = (root, f, t) => { fs.mkdirSync(path.dirname(path.join(root, f)), {recursive: true}); fs.writeFileSync(path.join(root, f), t); };

/** 임시 저장소 — 본질 · 잠금 · 명령문 · 잣대 · 낱말 · 이름 · 달력 · 모든 쪽 검사 결과(진짜 사본) + 화면 파일 몇 개(가짜) */
function makeRepo(tmp) {
  const origin = path.join(tmp, 'origin.git'), work = path.join(tmp, 'work');
  sh(tmp, 'git', ['init', '-q', '--bare', '-b', 'main', origin]);
  sh(tmp, 'git', ['init', '-q', '-b', 'main', work]);
  sh(work, 'git', ['remote', 'add', 'origin', origin]);
  for (const f of [L.essenceFileOf(ROOT), L.LOCK_FILE, L.ORDER_FILE, L.METRICS_FILE, 'site/next/words.js', 'site/next/brand.js', L.CAL_FILE]) write(work, f, fs.readFileSync(path.join(ROOT, f)));
  for (const f of ['scripts/atlas11/jinhwa/lib.mjs', 'scripts/atlas11/jinhwa/gh.mjs', 'scripts/atlas11/jinhwa/round.mjs']) write(work, f, fs.readFileSync(path.join(ROOT, f)));
  write(work, `${L.LIVE_DIR}/summary.json`, JSON.stringify({schema: 'atlas11-next-full-1', at: '2026-10-19T00:10:00.000Z', mode: 'live', pages: [{name: 'next', code: 0}, {name: 'why', code: 0}]}));
  write(work, `${L.LIVE_DIR}/next.json`, JSON.stringify({fails: []})); write(work, `${L.LIVE_DIR}/why.json`, JSON.stringify({fails: 0}));
  for (const p of ['why', 'today', 'past', 'cal', 'co', 'time']) write(work, `site/next/p-${p}.js`, `// ${p}\nexport const T = '${p} 칸';\nexport function render() { return T; }\n`);
  write(work, 'site/next/p-past.css', '.past { color: #333; }\n');
  write(work, 'reports/atlas11/jinhwa/.keep', '');
  sh(work, 'git', ['add', '-A']); sh(work, 'git', ['commit', '-q', '-m', '시험 바탕']); sh(work, 'git', ['push', '-q', 'origin', 'main']);
  sh(work, 'git', ['fetch', '-q', 'origin']); sh(work, 'git', ['branch', '-q', '-u', 'origin/main']);
  return {origin, work};
}
/** 가짜 손발 — 상태 · 올리기 목록 · 검사 · 그림 · 미리 검사(가지는 진짜로 밂) */
function fakeDeps({work, run, now, status, deploys = () => [], changed = () => 0, preview = () => 'pass', gate = null, onChanged = null, staticFails = null}) {
  let sc = 0;
  return {
    root: work, run, now: () => new Date(now), sleep: async () => {}, every: 0.001, waitDeploysMin: 0.0005, previewMaxMin: 0.0005, say: () => {},
    fetchStatus: async () => (typeof status === 'function' ? status(sc++) : status),
    fetchTally: async () => ({schema: 'kkolttori-tally-1', days: [{d: '2026-10-19', stop: 3, stop_rest: 1, promise: 0, promise_yes: 0}]}),
    ghRunner: () => ({ok: true, out: JSON.stringify(deploys())}),
    essenceDiff: gate ?? (() => ({ok: true, why: ''})),
    essenceStatic: dir => (staticFails ? staticFails(dir) : {ran: true, code: 0, fails: []}),
    changedCheck: async (dir, files) => { if (onChanged) onChanged(dir, files); const f = changed(files); return {ok: !f, fails: f, tail: ''}; },
    quickCheck: async () => ({ok: true, fails: 0}),
    previewStart: o => { const p = G.pushBranch(work, o.sha, o.branch, {expect: o.expect}); return p.ok ? {ok: true, run: 7, branch: o.branch, sha: o.sha} : {ok: false, why: p.why}; },
    previewResult: async o => ({state: preview(o)}),
    shoot: async o => { fs.mkdirSync(o.out, {recursive: true}); for (const k of ['before', 'after']) fs.writeFileSync(path.join(o.out, `${o.id}-${k}.png`), png(360, 640, k === 'before' ? [240, 238, 230] : [220, 236, 228])); return {ok: true}; },
    liveData: async () => ({ok: false, why: '시험 — 저장소 자료'}),
  };
}
const R = async (D, ...argv) => runCommand(argv, D);
const mainFile = (work, f) => { sh(work, 'git', ['fetch', '-q', 'origin']); try { return sh(work, 'git', ['show', `origin/main:${f}`]); } catch { return null; } };
const commitIn = (dir, f, from, to, msg = '대안') => { const t = fs.readFileSync(path.join(dir, f), 'utf8'); if (!t.includes(from)) throw Error('바꿀 글 없음 ' + f); fs.writeFileSync(path.join(dir, f), t.replace(from, to)); sh(dir, 'git', ['add', '-A']); sh(dir, 'git', ['commit', '-q', '-m', msg]); };

test('E1 만드는 회차 — 대안 셋(지킴 · 다섯 · 잣대 신호 · 본질 문 없음은 막힘) → 카드 → 미리 검사 → 기록(진화 칸 자료 · 그림 · 새 기록 파일)', async ctx => {
  const {work} = ctx.repo, run = path.join(ctx.tmp, 'run');
  const D = fakeDeps({work, run, now: '2026-10-19T00:30:00Z', status: {items: []}});
  ctx.D1 = D;
  const b = await R(D, 'begin'); eq(b.code, 0, JSON.stringify(b.out)); eq(b.out.plan.next, 'make'); eq(b.out.essence.first, ESS.first);
  const starts = {};
  for (const n of [1, 2, 3]) { const s = await R(D, 'alt-start', '--n', String(n)); eq(s.code, 0, JSON.stringify(s.out)); starts[n] = s.out.dir; }
  // 막혀야 하는 대안: 지킴 파일 · 여섯 파일 · 잣대 신호 · 본질 문 없음
  fs.writeFileSync(path.join(starts[1], L.METRICS_FILE), '{}'); sh(starts[1], 'git', ['commit', '-qam', '잣대 고침']);
  let r = await R(D, 'alt', '--n', '1', '--route', '#/why'); eq(r.code, 1); ok(/못 고치는 파일/.test(r.out.why), r.out.why);
  sh(starts[1], 'git', ['reset', '-q', '--hard', 'HEAD~1']);
  for (const p of ['why', 'today', 'past', 'cal', 'co', 'time']) commitIn(starts[1], `site/next/p-${p}.js`, `'${p} 칸'`, `'${p} 칸 새'`);
  r = await R(D, 'alt', '--n', '1', '--route', '#/why'); eq(r.code, 1); ok(/바뀐 파일 6개/.test(r.out.why), r.out.why);
  sh(starts[1], 'git', ['reset', '-q', '--hard', b.out.main]);
  commitIn(starts[1], 'site/next/p-why.js', 'return T;', "tally('stop_rest'); return T;");
  r = await R(D, 'alt', '--n', '1', '--route', '#/why'); eq(r.code, 1); ok(/잣대 신호/.test(r.out.why), r.out.why);
  sh(starts[1], 'git', ['reset', '-q', '--hard', b.out.main]);
  commitIn(starts[1], 'site/next/p-why.js', "'why 칸'", "'why 칸 · 한 번 더 멈춰요'");
  const Dg = {...D, essenceDiff: (base, head) => G.essenceDiff(work, base, head)}; // 이 시험 저장소에는 본질 문 파일이 없음 → 닫힌 쪽
  r = await R(Dg, 'alt', '--n', '1', '--route', '#/why'); eq(r.code, 1); ok(/본질 문/.test(r.out.why), r.out.why);
  const Ds = {...D, essenceStatic: dir => ({ran: true, code: 1, fails: dir.includes(`${path.sep}wt${path.sep}main${path.sep}`) ? ['4:fail:옛 까닭'] : ['4:fail:옛 까닭', '3:fail:망치는 길 낱말 새로']})};
  r = await R(Ds, 'alt', '--n', '1', '--route', '#/why'); eq(r.code, 1); ok(/일곱 가지에 새로 걸림 1곳/.test(r.out.why), r.out.why);
  const st0 = JSON.parse(fs.readFileSync(path.join(run, 'state.json'), 'utf8')); delete st0.gateBase; fs.writeFileSync(path.join(run, 'state.json'), JSON.stringify(st0)); // 바탕 결과를 다시 셈
  // 지나는 대안 셋
  r = await R(D, 'alt', '--n', '1', '--route', '#/why'); eq(r.code, 0, JSON.stringify(r.out));
  commitIn(starts[2], 'site/next/p-today.js', "'today 칸'", "'today 칸 · 받은 때'");
  r = await R(D, 'alt', '--n', '2', '--route', '#/today'); eq(r.code, 0, JSON.stringify(r.out));
  commitIn(starts[3], 'site/next/p-past.css', '#333', '#222');
  r = await R(D, 'alt', '--n', '3', '--route', '#/past'); eq(r.code, 0, JSON.stringify(r.out));
  // 같은 고침을 둘째로 내면 막힘
  const eyes = {kahneman: {faster: false}, munger: {ruin: false, bend: false}, popper: {predict: true, revert: true, small: true}}, all = {kahneman: true, munger: true, popper: true};
  const v = {kahneman: '서두르게 하지 않아요.', munger: '망치는 길에 닿지 않아요.', popper: '틀리면 바로 되돌려요.'};
  const debate = {mode: 'subagents', top: {kahneman: 2, munger: 2, popper: 1}, people: {kahneman: '초안', munger: '초안', popper: '초안'}, alts: [
    {n: 1, title: '왜 사 칸에 한 줄 더', serves: '① 「왜 사?」 열한 질문으로 내 이유를 확인한다.', voices: v, eyes, accept: all, predict: {text: '「쉬어 가자」 몫이 늘어요.', rule: {measure: 'stop', num: 'stop_rest', den: 'stop', dir: 'up'}}, revert: '몫이 줄면 되돌려요.', premortem: '글이 길어 안 읽었을 수 있어요.', big: true, risks: ['본질 칸이라 말이 바뀌면 멈춤이 줄 수 있어요.', '글이 길어지면 질문을 건너뛸 수 있어요.']},
    {n: 2, title: '오늘 칸 받은 때 한 줄', serves: '② 지난 기록만 보여 준다.', voices: v, eyes, accept: all, predict: {text: '화면 숫자가 자료와 다른 곳이 0 으로 남아요.', rule: {measure: 'fact', num: 'mismatch', dir: 'zero'}}, revert: '다른 곳이 나오면 되돌려요.', premortem: '받은 때가 늦게 와서 헷갈렸을 수 있어요.', big: false, risks: []},
    {n: 3, title: '지난 기록 글씨 조금 진하게', serves: '② 지난 기록만 보여 준다.', voices: v, eyes, accept: {...all, popper: false}, predict: {text: '「했어」 몫이 늘어요.', rule: {measure: 'promise', num: 'promise_yes', den: 'promise', dir: 'up'}}, revert: '몫이 줄면 되돌려요.', premortem: '진한 글씨가 눈에 안 띄었을 수 있어요.', big: false, risks: []},
  ]};
  const df = path.join(ctx.tmp, 'debate.json'); fs.writeFileSync(df, JSON.stringify(debate));
  r = await R(D, 'cards', '--debate', df); eq(r.code, 0, JSON.stringify(r.out)); eq(r.out.order, [2, 1, 3]);
  r = await R(D, 'finish', '--wait', '0'); eq(r.code, 0, JSON.stringify(r.out)); eq(r.out.newCards, [ID(2), ID(1), ID(3)]);
  r = await R(D, 'score'); eq(r.code, 0);
  r = await R(D, 'record'); eq(r.code, 0, JSON.stringify(r.out)); ok(/새 진화 대안 3개/.test(r.out.owner[0]), r.out.owner[0]); ok(r.out.notice.includes('새 대안 3개'));
  const d = JSON.parse(mainFile(work, L.DATA_FILE));
  eq(d.waiting.map(w => [w.id, w.pick]), [[ID(2), true], [ID(1), false], [ID(3), false]]); eq(d.n, 0);
  const W = await loadWords(ROOT);
  const val = L.validateJinhwa(d, {measures: L.measureTexts(METRICS), units: UNITS, words: {screenHits: W.screenHits, ruinHits: W.ruinHits, gainHits: W.gainHits, oldNames: W.oldNames}, exists: f => mainFile(work, f) !== null});
  ok(val.ok, val.errors.join(' · '));
  ok(mainFile(work, `${L.REC_DIR}/20261019-0930.json`), '기록 파일');
  eq(d.waiting.find(w => w.id === ID(1)).big, true); eq(d.waiting.find(w => w.id === ID(1)).risks.length, 2);
  r = await R(D, 'end'); eq(r.code, 0);
});
test('E2 확인 거둠(넣기 직전) → 넣지 않음 · 다른 회차가 도는 동안 → 바쁨', async ctx => {
  const {work} = ctx.repo;
  const D = fakeDeps({work, run: path.join(ctx.tmp, 'run2'), now: '2026-10-19T02:31:00Z', status: i => ({items: [{id: ID(1), state: i === 0 ? 'confirmed' : 'withdrawn', at: '2026-10-19T02:10:00Z'}]})});
  const before = sh(work, 'git', ['rev-parse', 'origin/main']);
  let r = await R(D, 'begin'); eq(r.code, 0, JSON.stringify(r.out)); eq(r.out.plan.change?.id, ID(1));
  const busy = await R({...D, run: path.join(ctx.tmp, 'run2b')}, 'begin'); eq(busy.code, 3, '다른 회차가 돎 → 바쁨 ' + JSON.stringify(busy.out));
  r = await R(D, 'apply', '--id', ID(1)); eq(r.code, 1); ok(/확인이 아님/.test(r.out.why), r.out.why);
  sh(work, 'git', ['fetch', '-q', 'origin']); eq(sh(work, 'git', ['rev-parse', 'origin/main']), before, 'main 그대로');
  r = await R(D, 'end'); eq(r.code, 0);
});
test('E3 넣는 회차 — 둘 확인 중 이른 것 하나 · plan 밖 번호 막힘 · 올리기 기다림 · 그새 기록만 앞선 main 위로 다시 얹음 · 바뀐 것 = 대안 그대로', async ctx => {
  const {work} = ctx.repo;
  let deployCalls = 0;
  const D = fakeDeps({work, run: path.join(ctx.tmp, 'run3'), now: '2026-10-19T04:31:00Z',
    status: {items: [{id: ID(1), state: 'confirmed', at: '2026-10-19T03:50:00Z'}, {id: ID(2), state: 'confirmed', at: '2026-10-19T03:00:00Z'}]},
    deploys: () => (deployCalls++ < 1 ? [{databaseId: 9, status: 'in_progress'}] : []),
    onChanged: () => { // 검사하는 동안 봇이 main 에 기록만 더함 → 넣을 때 앞으로만 밀기가 거절 → 새 main 위에 다시 얹어 밂
      const tmpc = path.join(ctx.tmp, 'bot'); if (!fs.existsSync(tmpc)) sh(ctx.tmp, 'git', ['clone', '-q', ctx.repo.origin, tmpc]); else sh(tmpc, 'git', ['pull', '-q', 'origin', 'main']);
      write(tmpc, 'reports/atlas11/probe/x.json', String(Date.now())); sh(tmpc, 'git', ['add', '-A']); sh(tmpc, 'git', ['-c', 'user.name=bot', '-c', 'user.email=b@b', 'commit', '-q', '-m', 'bot']); sh(tmpc, 'git', ['push', '-q', 'origin', 'HEAD:main']);
    }});
  let r = await R(D, 'begin'); eq(r.code, 0, JSON.stringify(r.out));
  eq(r.out.plan.change?.id, ID(2), '이른 확인'); ok(r.out.plan.ignored.some(x => x.id === ID(1) && /한 번에 하나/.test(x.why)));
  r = await R(D, 'apply', '--id', ID(1)); eq(r.code, 2, 'plan 밖 번호');
  const base = sh(work, 'git', ['rev-parse', 'origin/main']);
  r = await R(D, 'apply', '--id', ID(2)); eq(r.code, 0, JSON.stringify(r.out)); ok(deployCalls >= 2, '올리기 기다림');
  sh(work, 'git', ['fetch', '-q', 'origin']);
  const files = sh(work, 'git', ['diff', '--name-only', base, 'origin/main']).split('\n').filter(Boolean).filter(f => !f.startsWith('reports/'));
  eq(files, ['site/next/p-today.js'], '바뀐 파일 = 대안 2 그대로');
  ok(sh(work, 'git', ['log', '-1', '--format=%B', 'origin/main']).includes(`jinhwa: apply ${ID(2)}`));
  r = await R(D, 'apply', '--id', ID(2)); eq(r.code, 2, '한 회차에 둘째 넣기 막힘');
  r = await R(D, 'record'); eq(r.code, 0, JSON.stringify(r.out)); ok(/넣었어요/.test(r.out.owner[0]));
  const d = JSON.parse(mainFile(work, L.DATA_FILE));
  eq([d.n, d.applied[0].id, d.waiting.map(w => w.id)], [1, ID(2), [ID(1), ID(3)]]); eq(d.waiting.some(w => w.pick), false);
  r = await R(D, 'end'); eq(r.code, 0);
});
test('E4 가지가 만든 뒤 바뀜 → 넣지 않음(사장님이 본 것과 다름)', async ctx => {
  const {work} = ctx.repo;
  const t = path.join(ctx.tmp, 'tamper'); sh(ctx.tmp, 'git', ['clone', '-q', '-b', L.branchOf(ID(3)), ctx.repo.origin, t]);
  write(t, 'site/next/p-past.css', '.past { color: #000; }\n'); sh(t, 'git', ['-c', 'user.name=x', '-c', 'user.email=x@x', 'commit', '-qam', '몰래']); sh(t, 'git', ['push', '-q', 'origin', `HEAD:${L.branchOf(ID(3))}`]);
  const D = fakeDeps({work, run: path.join(ctx.tmp, 'run4'), now: '2026-10-19T08:31:00Z', status: {items: [{id: ID(3), state: 'confirmed', at: '2026-10-19T08:00:00Z'}]}});
  let r = await R(D, 'begin'); eq(r.code, 0, JSON.stringify(r.out)); eq(r.out.plan.change?.id, ID(3));
  r = await R(D, 'apply', '--id', ID(3)); eq(r.code, 1); ok(/바뀜/.test(r.out.why), r.out.why);
  r = await R(D, 'record'); eq(r.code, 0); ok(/넣지 않았어요/.test(r.out.owner[1]), r.out.owner.join(' / '));
  r = await R(D, 'end'); eq(r.code, 0);
});
test('E5 되돌리는 회차 — 들어간 커밋을 되돌림 · revertedAt · 확인 없이 들어간 것 0', async ctx => {
  const {work} = ctx.repo;
  const D = fakeDeps({work, run: path.join(ctx.tmp, 'run5'), now: '2026-10-20T00:31:00Z', status: {items: [{id: ID(2), state: 'revert', at: '2026-10-20T00:10:00Z'}, {id: ID(1), state: 'withdrawn', at: '2026-10-19T09:00:00Z'}]}});
  let r = await R(D, 'begin'); eq(r.code, 0, JSON.stringify(r.out)); eq(r.out.plan.change, {kind: 'revert', id: ID(2), at: '2026-10-20T00:10:00.000Z', why: '사장님 되돌리기 요청'});
  r = await R(D, 'revert', '--id', ID(2)); eq(r.code, 0, JSON.stringify(r.out));
  eq(mainFile(work, 'site/next/p-today.js').includes("'today 칸'"), true, '옛 글로 돌아감');
  r = await R(D, 'record'); eq(r.code, 0, JSON.stringify(r.out));
  const d = JSON.parse(mainFile(work, L.DATA_FILE)); ok(d.applied[0].revertedAt, '되돌린 때'); eq(d.n, 1);
  const recs = sh(work, 'git', ['ls-tree', '--name-only', 'origin/main', L.REC_DIR + '/']).split('\n').filter(f => f.endsWith('.json'));
  const applied = recs.map(f => JSON.parse(mainFile(work, f))).filter(x => x.apply?.ok);
  eq(applied.length, 1, '들어간 것은 확인된 하나뿐'); eq(applied[0].apply.id, ID(2));
  ok(applied.every(x => x.status.items.some(i => i.id === x.apply.id && i.state === 'confirmed')), '확인 없이 들어간 것 0');
  r = await R(D, 'end'); eq(r.code, 0);
});
test('E6 다시 시험하는 회차 — 새로 안 만듦 · 바뀐 가지는 내림 · 남은 것은 그대로', async ctx => {
  const {work} = ctx.repo;
  const D = fakeDeps({work, run: path.join(ctx.tmp, 'run6'), now: '2026-10-20T02:31:00Z', status: {items: []}});
  let r = await R(D, 'begin'); eq(r.code, 0, JSON.stringify(r.out)); eq(r.out.plan.next, 'retest'); eq(r.out.plan.retest, [ID(1), ID(3)]);
  r = await R(D, 'alt-start', '--n', '1'); eq(r.code, 2, '기다리는 대안이 있으면 새로 안 만듦');
  r = await R(D, 'retest'); eq(r.code, 0, JSON.stringify(r.out));
  eq(r.out.retested.map(x => [x.id, x.ok]), [[ID(1), true], [ID(3), false]]);
  r = await R(D, 'record'); eq(r.code, 0, JSON.stringify(r.out));
  eq(JSON.parse(mainFile(work, L.DATA_FILE)).waiting.map(w => w.id), [ID(1)]);
  r = await R(D, 'end'); eq(r.code, 0);
});
test('E7 고장 고침 — 작은 오타는 바로 main · 「고친 고장」 · 크게 바꾸면 막힘', async ctx => {
  const {work} = ctx.repo;
  const D = fakeDeps({work, run: path.join(ctx.tmp, 'run7'), now: '2026-10-20T04:31:00Z', status: {items: []}});
  let r = await R(D, 'begin'); eq(r.code, 0);
  r = await R(D, 'fix-start'); eq(r.code, 0, JSON.stringify(r.out));
  commitIn(r.out.dir, 'site/next/p-cal.js', "'cal 칸'", "'cal 칸 새 글과 또 다른 긴 설명이 이어지는 큰 바뀜입니다'");
  let f = await R(D, 'fix', '--kind', '오타', '--what', '달력 칸 글자 고침'); eq(f.code, 1); ok(/글자가 바뀜/.test(f.out.why), f.out.why);
  sh(r.out.dir, 'git', ['reset', '-q', '--hard', 'HEAD~1']);
  commitIn(r.out.dir, 'site/next/p-cal.js', "'cal 칸'", "'cal 칸.'");
  f = await R(D, 'fix', '--kind', '오타', '--what', '달력 칸 끝에 점'); eq(f.code, 0, JSON.stringify(f.out));
  r = await R(D, 'record'); eq(r.code, 0, JSON.stringify(r.out));
  eq(JSON.parse(mainFile(work, L.DATA_FILE)).fixed.map(x => x.what), ['달력 칸 끝에 점']);
  r = await R(D, 'end'); eq(r.code, 0);
});
test('E8 본질 파일이 잠금과 다르면 회차를 멈춤 · 기록 이름이 겹치면 쓰지 않음', async ctx => {
  const {work} = ctx.repo;
  const D = fakeDeps({work, run: path.join(ctx.tmp, 'run8'), now: '2026-10-19T00:30:30Z', status: {items: []}}); // 첫 회차와 같은 분 → 같은 기록 이름
  let r = await R(D, 'begin'); eq(r.code, 0);
  r = await R(D, 'record'); eq(r.code, 1); ok(/같은 이름의 기록/.test(r.out.why), r.out.why);
  r = await R(D, 'end'); eq(r.code, 0);
  fs.appendFileSync(path.join(work, L.essenceFileOf(ROOT)), '\n7. 사라고 권한다.\n');
  r = await R({...D, run: path.join(ctx.tmp, 'run8b')}, 'begin'); eq(r.code, 1); ok(/본질 잠금/.test(r.out.why), r.out.why);
  sh(work, 'git', ['checkout', '-q', '--', L.essenceFileOf(ROOT)]);
});

/** 모두 돌리기 — {pass, fail, seconds} */
export async function selftest({verbose = false} = {}) {
  const t0 = Date.now();
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'jinhwa-selftest-'));
  const ctx = {tmp};
  let pass = 0, fail = 0;
  try {
    ctx.repo = makeRepo(tmp);
    for (const t of T) {
      const s = Date.now();
      try { await t.fn(ctx); pass++; if (verbose) console.log(`통과 ${t.name} · ${((Date.now() - s) / 1000).toFixed(1)}초`); }
      catch (e) { fail++; console.log(`실패 ${t.name}\n   ${String(e?.message ?? e).split('\n').slice(0, 4).join('\n   ')}`); if (/E\d/.test(t.name.slice(0, 2))) { /* 끝까지 시험은 앞 것에 기대므로 이어서 봄 */ } }
    }
  } finally {
    for (const d of ['run', 'run2', 'run2b', 'run3', 'run4', 'run5', 'run6', 'run7', 'run8', 'run8b']) { try { G.git(path.join(tmp, 'work'), ['worktree', 'prune']); } catch { /* 없음 */ } }
    fs.rmSync(tmp, {recursive: true, force: true});
  }
  const seconds = Math.round((Date.now() - t0) / 100) / 10;
  console.log(`진화 회차 자기 시험 — 통과 ${pass} · 실패 ${fail} · ${seconds}초 · 망 없이(임시 git 원격)`);
  return {pass, fail, seconds};
}
