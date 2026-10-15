// 급등 탭(사장님 2026-10-15 14:27(싱가포르) 「탭을 하나 더 만들어라 / 어떤 탭이냐면 최근 5일에 급등한 종목을 36개 모아높는곳이다 … 하루에 4번 업데이트할때미다 그때 선택도 하고 탈락도 시켜라」 · 규칙 69)
//   ① 지금 모음(10월 13일 값)으로 다시 고르면 저장된 surge.json 과 같은 목록(지문) · 노드 따로 세기 틀림 0
//   ② 따로 세기가 일부러 틀린 사본(5일 %· 회사 바꿈 · 나간 까닭 · 뺀 곳 · 속 상태)을 모두 잡음
//   ③ 넣고 빼기 작은 보기(결정표 v2) — 처음 · 남기 72번째 · +10% 바닥 · 맞바꿈 5%p · 다시 듦 가산 · 장 중 하루 몰림은 두 번 · 멈춤 조건
//   ④ 화면 코드 — 탭 넷째 · 1등 빛 끔 · 기관 이름 없음 · 금빛 줄은 장 중에 든 곳만 · 그 뒤 기록 상자 없음
//   ⑤ 회차 — 업데이트 때만 고름 · 같은 날 같은 업데이트 두 번째는 앞 판 그대로 · 못 받으면 지금 사이트 것(OPT_FILES) · 기록은 새 파일만
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {surgeHist, surgeCarry, surgePrevState, surgeRecState} from '../../scripts/atlas11/t365/roll.mjs';
const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '../..');
const DATA = path.join(ROOT, 'site/atlas/data');
const ENV = (() => { const e = {...process.env}; delete e.ATLAS_T365_CLOSES; delete e.ATLAS_D365_DIR; return e; })();
const J = f => JSON.parse(fs.readFileSync(f, 'utf8'));
const ACT = J(path.join(ROOT, 'scripts/atlas11/t365/universe.json'));
const rd = f => fs.readFileSync(path.join(ROOT, f), 'utf8');

let BOX = null; // 한 번만 고름(약 10초) — ①② 가 함께 씀
function box() {
  if (BOX) return BOX;
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 't365-surge-')), now = path.join(tmp, 'now.json'), out = path.join(tmp, 'data'), pf = path.join(tmp, 'prev.json'), sf = path.join(tmp, 'state.json');
  fs.mkdirSync(out);
  for (const f of ['core.json', 'mkt.json']) fs.copyFileSync(path.join(DATA, f), path.join(out, f));
  fs.writeFileSync(pf, 'null');
  let r = spawnSync('node', ['scripts/atlas11/t365/dump.mjs', ACT.bundle, now, ACT.asOf], {cwd: ROOT, env: ENV, encoding: 'utf8'});
  assert.equal(r.status, 0, r.stderr);
  r = spawnSync('python3', ['scripts/atlas11/t365/surge.py', now, out, '--prev', pf, '--at', '2026-10-15T07:45:00.000Z', '--slot', '', '--state-out', sf], {cwd: ROOT, env: ENV, encoding: 'utf8'});
  assert.equal(r.status, 0, r.stderr);
  BOX = {tmp, out, pf, sf, S: J(path.join(out, 'surge.json')), state: J(sf)};
  return BOX;
}
const verify = (dir, pf, sf) => { const o = path.join(box().tmp, 'v-' + Math.random().toString(36).slice(2) + '.json'); const r = spawnSync('node', ['scripts/atlas11/t365/surge_verify.mjs', dir, pf, o, ...(sf ? [sf] : [])], {cwd: ROOT, env: ENV, encoding: 'utf8'}); return {code: r.status, log: (r.stdout + r.stderr).slice(-400), rep: fs.existsSync(o) ? J(o) : null}; };

test('① sv-v1 — 모음 날 값으로 다시 고르면 저장된 surge.json 과 같음 · 따로 세기 틀림 0', () => {
  const {S, out, pf, sf, state} = box(), K = J(path.join(DATA, 'surge.json'));
  assert.equal(S.version, 'sv-v1'); assert.equal(S.cap, 36); assert.equal(S.kind, 'first'); assert.equal(S.asOf, ACT.asOf);
  assert.equal(S.digest, K.digest, '저장된 화면 자료와 같은 목록 · 같은 5일 %');
  assert.deepEqual(S.members.map(m => m.c), K.members.map(m => m.c));
  assert.ok(S.n <= S.cap && S.members.every(m => m.r5 >= 15), '자리 수 안 · 모두 +15% 넘음');
  for (const k of ['base', 'pending', 'recentOut', 'state']) assert.ok(!(k in S), `공개 자료에 속 칸 ${k} 없음`);
  assert.ok(S.members.every(m => !('rank' in m) && !('pk' in m)), '차례 · 고른 곳 칸 없음');
  assert.deepEqual(Object.keys(state).sort(), ['asOf', 'confirms', 'evNow', 'events', 'pending', 'recentOut', 'track', 'trackNew']);
  // 네 칸 · 달력 · 따라가기(사장님 16:28 · 16:34 · 16:40 — sb-v1 · sk-v1) — 다시 고르면 저장된 것과 같음
  const C = J(path.join(out, 'surgecal.json')), C0 = J(path.join(DATA, 'surgecal.json'));
  assert.equal(S.bands.version, 'sb-v1'); assert.equal(S.bands.kind, 'first'); assert.equal(S.bands.digest, K.bands.digest, '네 칸 지문 = 저장된 화면 자료');
  const seen = new Set(); for (const b of ['b10', 'b20', 'b30', 'b40']) { const B = S.bands[b]; assert.ok(B.members.length <= S.bands.cap && B.n === B.members.length); for (const m of B.members) { assert.ok(!seen.has(m.c), '칸끼리 안 겹침 ' + m.c); seen.add(m.c); } }
  assert.deepEqual(C, C0, '달력 · 따라가기 = 저장된 화면 자료'); assert.equal(C.version, 'sk-v1'); assert.ok(C.dates.length <= C.keep && C.dates.at(-1) === S.asOf);
  assert.ok(C.days.length === 1 && C.days[0].ev.every(e => e[4] === 'first'), '처음 고른 날은 「처음 담음」 줄만');
  assert.ok(C.track.every(t => t.d === S.asOf && t.path.length === 0), '처음 고른 날은 따라간 날이 아직 없음');
  assert.ok(!/surge-hide|관심 없음/.test(JSON.stringify(C)), '관심 없음은 보는 기계에만(공개 자료에 없음)');
  const v = verify(out, pf, sf);
  assert.equal(v.code, 0, v.log); assert.equal(v.rep.bad, 0); assert.ok(v.rep.checks > 500, '맞댄 수 ' + v.rep.checks);
});

test('② 따로 세기 — 일부러 틀린 사본은 모두 잡음', () => {
  const {S, out, pf, sf, tmp} = box();
  const cases = [
    ['5일 %', o => { o.members[0].r5 += 0.01; }],
    ['회사 바꿈', o => { o.members[1].c = o.members[2].c; }],
    ['나간 까닭(앞 판 있음 흉내 대신 들어온 글)', o => { o.members[0].tag = o.members[0].tag === 'new' ? 'stay' : 'new'; }],
    ['뺀 곳 까닭', o => { if (o.cutList.length) o.cutList[0].why = '평소 하루 거래가 많아요'; else o.cut.over += 1; }],
    ['조심 수', o => { o.facts.warn += 1; }],
    ['그림 칸', o => { o.bins[0][1] += 1; }],
    ['지문', o => { o.digest = '0000000000000000'; }],
  ];
  for (const [name, mut] of cases) {
    const d = fs.mkdtempSync(path.join(tmp, 'bad-'));
    for (const f of ['core.json', 'mkt.json']) fs.copyFileSync(path.join(out, f), path.join(d, f));
    const o = JSON.parse(JSON.stringify(S)); mut(o); fs.writeFileSync(path.join(d, 'surge.json'), JSON.stringify(o));
    const v = verify(d, pf, sf);
    assert.equal(v.code, 1, `${name} — 못 잡음 ${v.log}`);
  }
  const st0 = J(sf), bs = path.join(tmp, 'bad-state.json'); fs.writeFileSync(bs, JSON.stringify({...st0, pending: ['000000']}));
  assert.equal(verify(out, pf, bs).code, 1, '속 상태(기다림)를 바꾸면 잡음');
  const bs2 = path.join(tmp, 'bad-state2.json'); fs.writeFileSync(bs2, JSON.stringify({...st0, evNow: st0.evNow.slice(1)}));
  assert.equal(verify(out, pf, bs2).code, 1, '속 상태(이번 사건)를 바꾸면 잡음');
  // 네 칸 · 달력 · 따라가기 사본(16:28 · 16:34 · 16:40)
  const C0 = J(path.join(out, 'surgecal.json'));
  for (const [name, mutS, mutC] of [['칸 5일 %', o => { o.bands.b10.members[0].r5 += 0.01; }, null], ['칸 지문', o => { o.bands.digest = '0000000000000000'; }, null], ['칸 넘친 수', o => { o.bands.b20.over += 1; }, null],
    ['달력 날', null, c => { c.dates = c.dates.slice(1); }], ['달력 이름', null, c => { c.days[0].ev[0][3] = '가짜'; }], ['처음 든 칸', null, c => { c.track[0].t = c.track[0].t === 'sv' ? 'b10' : 'sv'; }], ['지금 든 칸', null, c => { c.track[0].now = []; }]]) {
    const d = fs.mkdtempSync(path.join(tmp, 'badc-'));
    for (const f of ['core.json', 'mkt.json']) fs.copyFileSync(path.join(out, f), path.join(d, f));
    const o = JSON.parse(JSON.stringify(S)), c = JSON.parse(JSON.stringify(C0)); mutS?.(o); mutC?.(c);
    fs.writeFileSync(path.join(d, 'surge.json'), JSON.stringify(o)); fs.writeFileSync(path.join(d, 'surgecal.json'), JSON.stringify(c));
    const v = verify(d, pf, sf); assert.equal(v.code, 1, `${name} — 못 잡음 ${v.log}`);
  }
});

// ③ 넣고 빼기 작은 보기 — 파이썬 surge.choose 를 가짜 하루로 부름(차례 줄 · 문 · 띠 · 맞바꿈 · 가산 · 장 중)
const PY = String.raw`
import sys, json
sys.path.insert(0, 'scripts/atlas11/t365')
import surge
class Day:
    def __init__(s, rs, thin=(), dirty=(), dom=()):
        s.ratio = list(rs); n = len(rs)
        s.clean = [j not in dirty for j in range(n)]
        s.liq = [(0.5e8 if j in thin else 1e9 - j) for j in range(n)]
        s.dom = [j in dom for j in range(n)]
        s.E = sorted([j for j in range(n) if s.clean[j] and j not in thin], key=s.key)
        s.rank = {j: k + 1 for k, j in enumerate(s.E)}
    def key(s, j):
        return (-s.ratio[j], -s.liq[j], j)
    def rank_of(s, j):
        return s.rank[j] if j in s.rank else 1 + sum(1 for e in s.E if s.key(e) < s.key(j))
def run(rs, prev, **kw):
    d = Day(rs, kw.pop('thin', ()), kw.pop('dirty', ()), kw.pop('dom', ()))
    seat, out, wait = surge.choose(d, prev, **kw)
    return {'seat': seat, 'out': {str(k): v for k, v in out.items()}, 'wait': wait}
R = {}
base = [round(1.60 - 0.01 * j, 2) for j in range(100)]  # 0번 +60% … 35번 +25% … 45번 +15% …
R['first'] = run(base, None)
R['thin'] = run(base, None, thin=(0, 1))
band = [1.20] * 30 + [1.12] * 30  # 0 ~ 29번 +20%(차례 1 ~ 30) · 30 ~ 59번 +12%(차례 31 ~ 60 — 들 문 밑)
R['stay'] = run(band, list(range(40, 46)))  # 앞 판 6곳(차례 41 ~ 46 · +12%) — 36번째 밖이어도 72번째 안 · +10% 위면 남음
low = list(band); low[45] = 1.09; low[44] = 1.105
R['floor'] = run(low, list(range(40, 46)))
far = [1.12] * 90 + [1.30] * 5 + [1.111] * 5  # 95 ~ 99번: +11.1% 로 남기 문은 넘지만 차례가 96번째 넘음
R['rank'] = run(far, [95, 96, 97, 98, 99])
sw = list(base); sw[10] = 1.16  # 앞 판(0 ~ 35번)의 가장 약한 곳이 10번 +16% — 밖의 36번 +24% 는 8%p 큼
R['swap'] = run(sw, list(range(36)))
R['pen'] = run([1.18] + [1.12] * 99, [], pen=frozenset([0]))  # 방금 빠진 곳 +18% − 5%p = +13% → 못 듦
R['penOff'] = run([1.18] + [1.12] * 99, [])
R['hold'] = run(base, None, hold=set(), dom=(0,))
R['hold2'] = run(base, None, hold={0}, dom=(0,))
R['strict'] = run(base, None, hold=set(), strict=True)
R['dirty'] = run(base, list(range(10, 46)), dirty=(12,))
print(json.dumps(R))
`;
test('③ 넣고 빼기 작은 보기 — 처음 · 얇음 · 남기 72번째 · +10% 바닥 · 맞바꿈 · 다시 듦 가산 · 장 중 두 번 · 멈춤 조건', () => {
  const r = spawnSync('python3', ['-c', PY], {cwd: ROOT, env: ENV, encoding: 'utf8'});
  assert.equal(r.status, 0, r.stderr);
  const R = JSON.parse(r.stdout.trim().split('\n').at(-1));
  assert.deepEqual(R.first.seat, Array.from({length: 36}, (_, j) => j), '처음 = 차례 줄 앞 36곳(+15% 넘음)');
  assert.ok(!R.thin.seat.includes(0) && !R.thin.seat.includes(1) && R.thin.seat.length === 36, '얇은 곳은 새로 못 듦');
  assert.deepEqual([...R.stay.seat].sort((a, b) => a - b), [...Array.from({length: 30}, (_, j) => j), 40, 41, 42, 43, 44, 45], '36번째 밖이어도 72번째 안 · +10% 위면 남고 빈자리는 들 문(+15%)을 넘은 곳만');
  assert.ok(R.floor.out['45'] === 'floor' && R.floor.seat.includes(44) && R.floor.seat.length === 35, '+10% 밑은 나감 · +10.5% 는 남음 · 모자라도 채우지 않음');
  assert.ok(Object.values(R.rank.out).every(x => x === 'rank') && Object.keys(R.rank.out).length === 5, '남기 차례 72번째 밖은 나감');
  assert.ok(R.swap.out['10'] === 'seat' && R.swap.seat.includes(36) && !R.swap.seat.includes(37) && R.swap.seat.length === 36, '밖의 큰 곳이 안의 가장 약한 곳보다 5%p 넘게 크면 맞바꿈(그 아래는 안 바꿈)');
  assert.deepEqual(R.pen.seat, [], '방금 빠진 곳은 +18% − 5%p = +13% 라 못 듦');
  assert.deepEqual(R.penOff.seat, [0], '가산이 없으면 +18% 로 듦');
  assert.ok(!R.hold.seat.includes(0) && R.hold.wait.includes(0), '장 중 하루 몰림은 첫 업데이트에선 기다림');
  assert.ok(R.hold2.seat.includes(0), '같은 날 다음 업데이트에서 한 번 더 넘으면 듦');
  assert.equal(R.strict.seat.length, 0, '멈춤 조건이면 모든 곳이 두 번 넘어야 듦');
  assert.equal(R.dirty.out['12'], 'q', '셀 수 없게 된 곳은 「?」로 나감');
});

test('④ 화면 코드 — 넷째 탭 · 1등 빛 끔 · 기관 이름 없음 · 그 뒤 기록 상자 없음 · 장 중 금빛만 · 다섯 칸 · 관심 없음은 이 기계에만', () => {
  const js = rd('site/atlas/atlas.js'), html = rd('site/atlas/index.html');
  assert.match(html, /<a href="#\/surge" id="tabSurge">급등<\/a>/);
  assert.match(js, /else if \(kind === 'surge'\) \{ \$\('#tabSurge'\)\.setAttribute\('aria-current', 'page'\); const t = !arg \? 'sv' : \/\^\(10\|20\|30\|40\)\$\/\.test\(arg\) \? 'b' \+ arg : null; if \(t\) await viewSurge\(v, t\); else viewMissing\(v\); \}/, '다섯 칸 주소 · 그 밖은 없는 주소');
  assert.match(js, /const SV_TABS = \[\['sv', '급등'\], \['b10', '10%'\], \['b20', '20%'\], \['b30', '30%'\], \['b40', '40%'\]\];/, '맨 위 다섯 칸(16:28 「총 5개」)');
  const H0 = js.indexOf("const SV_HIDE = 'atlas:surge-hide';"), H1 = js.indexOf('async function viewSurge(v, tab');
  assert.ok(H0 > 0 && H1 > H0); assert.equal(js.split("'atlas:surge-hide'").length, 2, '관심 없음 기억 이름은 한 곳');
  assert.ok(!/fetch\(|sendBeacon|XMLHttpRequest/.test(js.slice(H0, H1)), '관심 없음은 서버로 보내지 않음(이 기계에만 · 16:40)');
  assert.match(js.slice(H0, H1), /'관심 없음'/); assert.match(js.slice(H0, H1), /되돌리기/); assert.match(js.slice(H0, H1), /숨겼어요/); // 그 자리 「숨겼어요 · 되돌리기」(새 눈 점검 2)
  const a = js.indexOf('async function viewSurge(v, tab'), b = js.indexOf('/** 업데이트 탭 한 줄 — 그 회차의 급등 고르기');
  assert.ok(a > 0 && b > a); const V = js.slice(a, b);
  assert.match(V, /win: false/, '1등 빛 끔');
  assert.ok(!/CIA|씨아이에이|정보기관/i.test(V), '화면 글에 기관 이름 없음');
  assert.ok(!/svWarn|20거래일 뒤|많이 오른 뒤에는|base\./.test(V), '그 뒤 기록 상자 없음(지운 지난 기록 시험 · 규칙 55)');
  assert.match(V, /gold: S\.provisional && m\.prov \? '\? 장 중' : null/, '줄 금빛 = 장 중에 든 곳만');
  assert.match(js, /function race\(host, \{[^}]*win = true\}\)/);
});

test('⑤ 회차 — 업데이트 때만 고름 · 같은 날 같은 업데이트 두 번째는 앞 판 그대로 · 지금 사이트 것으로 받음 · 기록은 새 파일만', () => {
  const R = rd('scripts/atlas11/t365/roll.mjs');
  assert.match(R, /const OPT_FILES = \[[^\]]*'surge\.json', 'surgecal\.json'\]/, '못 받으면 지금 사이트 것(달력 · 따라가기도)');
  assert.match(R, /const again = !!\(sLast && rep\.slot && sLast\.slot === rep\.slot && String\(sLast\.kst \?\? ''\)\.slice\(0, 10\) === rep\.kst\.slice\(0, 10\)\)/);
  assert.match(R, /if \(\(rep\.slot \|\| !sLast\) && !again\)/, '업데이트 때만(처음은 손 올리기 때도)');
  assert.match(R, /'--state-out', sfo/); assert.match(R, /surge_verify\.mjs', out, pf, path\.join\(tmp, 'gv\.json'\), sfo/);
  assert.match(R, /JSON\.stringify\(\{schema: 'atlas-t365-surge-rec-1', \.\.\.surgeOut\}, null, 1\) \+ '\\n', \{flag: 'wx'\}/, '기록은 새 파일만');
  const recs = Array.from({length: 30}, (_, k) => ({at: `t${k}`, kst: '2026-10-15 10:00', slot: '10:00', kind: 'pick', payload: {n: 36, in: [1], out: [], asOf: '2026-10-15', provisional: true}}));
  const h = surgeHist(recs); assert.equal(h.length, 28); assert.equal(h.at(-1).at, 't29');
  const c = surgeCarry(recs.at(-1), recs, '까닭'); assert.equal(c.carry.from, 't29'); assert.equal(c.carry.why, '까닭'); assert.equal(c.n, 36);
  // 앞 상태 = 마지막 기록 상태 + 기록마다 그 업데이트 사건(evNow) · 따라가기 시작(trackNew — 뒤 기록이 이김: 25거래일 밖으로 내린 곳이 다시 들면 새로)
  const st = surgePrevState([{state: {asOf: 'd1', recentOut: [], pending: [], confirms: [], evNow: [['d1', 'k1', null, 'A', 'first', 'sv', null]], trackNew: {A: ['d1', 'k1', 'sv', '에이']}}},
    {state: {asOf: 'd2', recentOut: [{c: 'B', day: 'd2'}], pending: ['C'], confirms: [], evNow: [['d2', 'k2', '10:00', 'B', 'out', 'sv', null]], trackNew: {A: ['d2', 'k2', 'b10', '에이']}}}]);
  assert.equal(st.asOf, 'd2'); assert.deepEqual(st.pending, ['C']); assert.equal(st.events.length, 2); assert.deepEqual(st.track.A, ['d2', 'k2', 'b10', '에이']); assert.ok(!('evNow' in st) && !('trackNew' in st));
  assert.equal(surgePrevState([]), null);
  assert.deepEqual(Object.keys(surgeRecState({asOf: 'x', events: [1], track: {a: 1}, evNow: [], trackNew: {}})).sort(), ['asOf', 'evNow', 'trackNew'], '기록 파일엔 그 업데이트 몫만');
  assert.match(R, /surgecal-latest\.json/); assert.match(R, /await calCarry\(\)/, '업데이트 밖 올림은 마지막 달력 그대로');
});
