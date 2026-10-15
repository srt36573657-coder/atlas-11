// 달력 탭(사장님 2026-10-15(싱가포르) 19:28 「달력 턉 … 10에서 40프로에 종목들을 한눈에 보고 관리하고 판단할수 있는 지혜로운 구조」 · 19:36 「가 로 해라」 ·
//   20:04 「달력에 종목이름 등락률 나와야 해」 · 20:51 「추적하는 시스탬 … cia처런 끈질기게」 · 20:57 「구글이면 … 100군데」 · 21:24 「가 로 해」(지난 한 달 되짚음) · 규칙 70)
//   ① 셈(surgetr.py tr-v1) = 따로 세기(surgetr_verify.mjs · 결정표만 보고 씀) — 모음 자료 · 기록 날이 창 안에 있는 기록으로도 틀림 0
//   ② 파일 규칙 — 종목 하나 = 파일 하나 · 뽑힌 날 종가 = 0 · 60거래일 · 씨앗 날 「되짚음」 · 36자리 다툼은 탈락이 아님(제 칸으로만)
//   ③ 화면 · 길 — 아래 탭 다섯째 「달력」 · #/cal · #/cal/<번호> · 회사 3단 · 관심 · 관심 없음은 보는 기계에만 · 판정 말 없음
//   ④ 회차 — 셈 → 따로 세기 → 못 하면 지금 사이트 것 · 네 눈 점검 길 지도
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '../..');
const J = f => JSON.parse(fs.readFileSync(f, 'utf8'));
const ACT = J(path.join(ROOT, 'scripts/atlas11/t365/universe.json'));
const env = {...process.env}; delete env.ATLAS_T365_CLOSES; delete env.ATLAS_D365_DIR;
const run = (cmd, args) => { const r = spawnSync(cmd, args, {cwd: ROOT, env, encoding: 'utf8', maxBuffer: 256 << 20, timeout: 600000}); assert.equal(r.status, 0, `${args[0]} 멈춤: ${(r.stderr || r.stdout).slice(-600)}`); return r.stdout.trim().split('\n').at(-1); };
let BOX = null;
function box() {
  if (BOX) return BOX;
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'atlas-cal-')), now = path.join(tmp, 'now.json'), out = path.join(tmp, 'data');
  fs.mkdirSync(out); fs.copyFileSync(path.join(ROOT, 'site/atlas/data/mkt.json'), path.join(out, 'mkt.json'));
  run('node', ['scripts/atlas11/t365/dump.mjs', ACT.bundle, now, ACT.asOf]);
  BOX = {tmp, now, out}; return BOX;
}

test('① 셈 = 따로 세기 — 저장된 기록 · 씨앗(되짚음) · 모음 일봉', () => {
  const {now, out} = box();
  const sum = JSON.parse(run('python3', ['scripts/atlas11/t365/surgetr.py', now, out, '--records', '-', '--at', '2026-10-15T11:02:06.000Z']));
  const v = JSON.parse(run('node', ['scripts/atlas11/t365/surgetr_verify.mjs', out, '-', path.join(out, 'v.json')]));
  assert.equal(v.ok, true); assert.equal(v.bad, 0); assert.ok(v.checks > 1000);
  const T = J(path.join(out, 'surgetr.json')), K = J(path.join(out, 'surgetr-case.json'));
  assert.equal(T.version, 'tr-v1'); assert.equal(T.cases.length, sum.public);
  assert.deepEqual(T.seed, {from: '2026-09-15', to: '2026-10-14'}, '사장님 21:24 (가) — 지난 한 달 되짚음');
  assert.ok(T.days.some(x => x.seed), '씨앗 날 표시'); assert.ok(T.cases.every(r => r[10] === 1 || r[11]), '씨앗 파일 = 되짚음 · 기록 파일 = 기록 때');
  // 저장된 사이트 자료와 같은 셈(만든 때 칸만 다름)
  const S = J(path.join(ROOT, 'site/atlas/data/surgetr.json')); assert.deepEqual({...T, kst: null}, {...S, kst: null}, '저장된 surgetr.json = 다시 센 것');
  assert.deepEqual(K, J(path.join(ROOT, 'site/atlas/data/surgetr-case.json')));
});

test('② 파일 규칙 — 뽑힌 날 0 · 값은 뽑힌 날부터 마지막 날까지 · 사건은 제 칸으로만 · 답 한 줄 수', () => {
  const T = J(path.join(ROOT, 'site/atlas/data/surgetr.json')), K = J(path.join(ROOT, 'site/atlas/data/surgetr-case.json')).cases;
  const seen = new Set();
  for (const r of T.cases) {
    assert.ok(!seen.has(r[0]), '종목 하나 = 파일 하나'); seen.add(r[0]);
    const k = K[r[0]], i0 = T.dates.indexOf(r[2]); assert.ok(k && i0 >= 0);
    assert.equal(k.p.length, T.dates.length - i0); if (k.p[0] != null) assert.equal(k.p[0], 0, '뽑힌 날 종가 = 0');
    assert.ok(T.dates.length - 1 - i0 <= 60, '60거래일 안');
    assert.match(k.q, /^[1234x?]*$/); for (const e of k.ev) { assert.ok(['out', 'mv', 're', 'warn'].includes(e[1])); assert.ok(e[0] >= r[2] && e[0] <= T.asOf); }
    // 사건 = 제 칸 바뀜(앞 비교 = ? 아닌 가장 늦은 칸)
    for (let i = 1; i < k.q.length; i++) { const q = k.q[i]; if (q === '?') continue; let pv = null; for (let t = i - 1; t >= 0; t--) if (k.q[t] !== '?') { pv = k.q[t]; break; } if (pv == null) continue;
      const d = T.dates[i0 + i], ev = k.ev.filter(e => e[0] === d && e[1] !== 'warn');
      const want = pv !== 'x' && q !== 'x' && pv !== q ? [['mv', q]] : pv !== 'x' && q === 'x' ? [['out', null]] : pv === 'x' && q !== 'x' ? [['re', q]] : [];
      assert.deepEqual(ev.map(e => [e[1], e[2]]), want, `${r[1]} ${d}`); }
  }
  const N = T.cases.filter(r => r[6] !== 'n').length, a = T.cases.filter(r => r[6] === 'u').length;
  assert.equal(T.N, N); assert.equal(T.a, a); if (N) assert.equal(T.n10, Math.floor((20 * a + N) / (2 * N)));
  assert.ok((T.alerts ?? []).length <= 2, '금빛 줄 두 줄 안');
});

test('③ 기록 날이 창 안 — 기록이 연 파일은 기록의 칸 · 5일 오름 · 때(되짚음 아님) · 따로 세기 틀림 0', () => {
  const {now, out, tmp} = box();
  const S = J(path.join(ROOT, 'site/atlas/data/surge.json')); assert.equal(S.bands.version, 'sb-v1');
  const rec = {records: [{asOf: S.asOf, provisional: !!S.provisional, kst: '2026-10-13 18:00', slot: '18:00', bands: S.bands}]}, rf = path.join(tmp, 'rec.json');
  fs.writeFileSync(rf, JSON.stringify(rec));
  const o2 = path.join(tmp, 'd2'); fs.mkdirSync(o2); fs.copyFileSync(path.join(out, 'mkt.json'), path.join(o2, 'mkt.json'));
  run('python3', ['scripts/atlas11/t365/surgetr.py', now, o2, '--records', rf, '--at', '2026-10-13T09:05:00.000Z', '--slot', '18:00']);
  const v = JSON.parse(run('node', ['scripts/atlas11/t365/surgetr_verify.mjs', o2, rf, path.join(o2, 'v.json')])); assert.equal(v.bad, 0);
  const T = J(path.join(o2, 'surgetr.json')), day = T.days.find(x => x.d === S.asOf);
  assert.equal(T.first, S.asOf); assert.equal(day.seed, false, '기록이 있는 날은 되짚음이 아님');
  for (const c of day.sel) { const r = T.cases.find(x => x[0] === c); assert.equal(r[10], 0); assert.equal(r[11], '2026-10-13 18:00'); }
});

test('④ 화면 · 길 · 회차 — 아래 탭 다섯째 · #/cal · 종목 파일 · 관심 · 관심 없음 · 판정 말 없음 · 셈 → 따로 세기 → 못 하면 지금 사이트 것', () => {
  const html = fs.readFileSync(path.join(ROOT, 'site/atlas/index.html'), 'utf8'), js = fs.readFileSync(path.join(ROOT, 'site/atlas/atlas.js'), 'utf8'), css = fs.readFileSync(path.join(ROOT, 'site/atlas/atlas.css'), 'utf8');
  assert.match(html, /<a href="#\/cal" id="tabCal">달력<\/a>/);
  assert.match(js, /else if \(kind === 'cal'\) \{ \$\('#tabCal'\)\.setAttribute\('aria-current', 'page'\); if \(!arg\) await viewCal\(v\); else if \(\/\^\[0-9A-Z\]\{6\}\$\/\.test\(arg\)\) await viewCalCase\(v, arg\); else viewMissing\(v\); \}/);
  const a = js.indexOf('// ════ 달력 탭(사장님'), b = js.indexOf('// ── 소리 · 글씨 ──'); assert.ok(a > 0 && b > a); const cal = js.slice(a, b);
  const strs = [...cal.matchAll(/'([^'\n]*)'|`([^`]*)`/g)].map(m => m[1] ?? m[2]).join('\n');
  for (const w of ['급등', '더 오름', '덜 오름', '사라', '팔라', '추천', '예측', '확률', '매수', '매도']) assert.ok(!strs.includes(w), `달력 화면 글에 「${w}」`);
  assert.match(cal, /const TR_STAR = 'atlas:cal-star'/); assert.match(cal, /hideGet\(\)/, '관심 없음 = 급등 탭과 같은 목록(atlas:surge-hide)');
  assert.match(cal, /cHref\(code\)/, '종목 파일 → 회사 3단'); assert.match(cal, /'사고팔 곳을 고른 목록이 아니에요\.'/); assert.match(cal, /'지난 값일 뿐 앞날을 말하지 않아요\.'/);
  assert.ok(!/style=/.test(cal), '글 속 style 없음(CSP)'); assert.ok(!/canvas/i.test(cal), '캔버스 없음(규칙 50)');
  assert.match(css, /\.vw h2\.cal-tile \{/); assert.match(css, /\.vw svg\.cal-dots/);
  const R = fs.readFileSync(path.join(ROOT, 'scripts/atlas11/t365/roll.mjs'), 'utf8');
  assert.match(R, /const OPT_FILES = \[[^\]]*'surgetr\.json', 'surgetr-case\.json'\]/);
  assert.ok(R.indexOf("run('달력 셈', 'python3', ['scripts/atlas11/t365/surgetr.py'") > 0 && R.indexOf("run('달력 따로 세기', 'node', ['scripts/atlas11/t365/surgetr_verify.mjs'") > R.indexOf("run('달력 셈'"));
  assert.match(R, /rep\.cal = \{kind: 'fail'/);
  const I = fs.readFileSync(path.join(ROOT, 'scripts/atlas11/t365/inspect4.mjs'), 'utf8');
  assert.match(I, /const TABS = \['#\/', '#\/list', '#\/surge', '#\/up', '#\/cal', '#\/info'\]/);
  const V = fs.readFileSync(path.join(ROOT, 'scripts/atlas11/t365/surgetr_verify.mjs'), 'utf8'); assert.ok(!/surgetr\.py/.test(V.split('\n').filter(l => !l.trim().startsWith('//')).join('\n')), '따로 세기는 셈 파일을 열지 않음');
});
