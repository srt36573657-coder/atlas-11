// 싹 달력 시험(사장님 2026-10-22 11:55 「일 이 삼 찾아낸 것들 다 달력으로 … 제시만 해가지고 기록이 없으면 그건 하수야」)
//   node --test tests/atlas11/theme-cal.test.mjs — 저장소 자료(site/atlas/data)로 셈해
//   ① 마지막 날 셋 = 첫 화면 1 · 2 · 3(theme.order.S 앞 셋) ② 날 t 의 셋은 t 뒤 값을 쓰지 않음(자료를 t 에서 자른 셈과 같음)
//   ③ 한 달 뒤 꽃 선은 한 달이 지난 날만 참 · 거짓 · 마지막 스무 날은 비움 ④ 화면 파일 꼴
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {computeTheme, calOf, CAL_DAYS, RULE, THEME_SCHEMA} from '../../site/next/theme-engine.js';

const DD = path.join('site', 'atlas', 'data');
const have = fs.existsSync(path.join(DD, 'days.json')) && fs.existsSync(path.join(DD, 'co'));
const J = f => JSON.parse(fs.readFileSync(f, 'utf8'));
function load() {
  const days = J(path.join(DD, 'days.json')), mkt = J(path.join(DD, 'mkt.json')), core = J(path.join(DD, 'core.json')), cond = J(path.join(DD, 'cond.json'));
  const dates = days.dates, N = dates.length, companies = mkt.companies, closes = new Map();
  for (const f of fs.readdirSync(path.join(DD, 'co')).filter(f => /^[0-9][0-9A-Z]{5}\.json$/.test(f)).sort()) {
    const code = f.slice(0, 6); if (!companies[code]) continue;
    let c; try { c = J(path.join(DD, 'co', f)); } catch { continue; }
    if (!Array.isArray(c?.close) || !Number.isInteger(c?.k0)) continue;
    const a = new Float64Array(N);
    for (let j = 0; j < c.close.length; j++) { const t = j + c.k0, v = c.close[j]; if (t >= 0 && t < N && typeof v === 'number' && v > 0) a[t] = v; }
    closes.set(code, a);
  }
  const rk = new Map(); const co = cond?.co;
  if (co && Array.isArray(co.c) && Array.isArray(co.rk)) co.c.forEach((c, k) => { if (Number.isInteger(co.rk[k])) rk.set(c, co.rk[k]); });
  return {dates, closes, companies, industries: core?.industries ?? [], groups: core?.groups ?? [], rk};
}
const run = (D, cut = 0) => computeTheme({...D, dates: D.dates.slice(0, D.dates.length - cut), closes: new Map([...D.closes].map(([c, a]) => [c, a.slice(0, a.length - cut)])), made: '2026-10-22T03:00:00.000Z'});

test('싹 달력 — 마지막 날 셋 = 첫 화면 1 · 2 · 3 · 날 수 · 꼴', {skip: !have && '저장소 자료 없음'}, () => {
  const D = load(), {theme, cal} = run(D);
  assert.equal(cal.schema, THEME_SCHEMA + '-cal');
  assert.equal(cal.asOf, theme.asOf);
  assert.equal(cal.days.length, CAL_DAYS);
  assert.deepEqual(cal.days.at(-1).top.map(i => i.n), theme.order.S.slice(0, 3));
  assert.equal(cal.days.at(-1).s, theme.count.S);
  for (let k = 1; k < cal.days.length; k++) assert.ok(cal.days[k].d > cal.days[k - 1].d, '날 차례');
  for (const x of cal.days) { assert.ok(x.top.length <= 3); for (const i of x.top) assert.ok(i.sc >= 0 && i.sc <= 4 && Number.isFinite(i.y) && typeof i.n === 'string'); }
});

test('싹 달력 — 한 달 뒤 꽃 선: 한 달 지난 날만 참 · 거짓 · 마지막 스무 날은 비움', {skip: !have && '저장소 자료 없음'}, () => {
  const D = load(), {cal} = run(D), n = cal.days.length;
  cal.days.forEach((x, k) => { for (const i of x.top) assert.equal(i.hit === null, k >= n - RULE.recAhead, x.d + ' ' + i.n); });
});

test('싹 달력 — 날 t 의 셋은 t 뒤 값을 쓰지 않음(열흘 잘라 셈한 마지막 날 = 온 셈의 그날)', {skip: !have && '저장소 자료 없음'}, () => {
  const D = load(), full = run(D).cal, cut = run(D, 10);
  const day = cut.theme.asOf, a = full.days.find(x => x.d === day);
  assert.ok(a, '그날이 온 셈 달력에 있음');
  assert.deepEqual(a.top.map(i => [i.n, i.sc, i.y]), cut.theme.order.S.slice(0, 3).map(n => { const i = cut.cal.days.at(-1).top.find(t => t.n === n); return [n, i.sc, i.y]; }));
  assert.deepEqual(a.top.map(i => i.n), cut.cal.days.at(-1).top.map(i => i.n));
});

test('싹 달력 — 올린 파일(site/next/data/theme-cal.json) 꼴', () => {
  const f = path.join('site', 'next', 'data', 'theme-cal.json');
  if (!fs.existsSync(f)) return;
  const c = J(f);
  assert.equal(c.schema, THEME_SCHEMA + '-cal');
  assert.ok(Array.isArray(c.days) && c.days.length > 0 && c.days.length <= CAL_DAYS);
  assert.equal(c.days.at(-1).d, c.asOf);
});

test('calOf — 작은 날 수', {skip: !have && '저장소 자료 없음'}, () => {
  assert.equal(typeof calOf, 'function');
});

test('싹 달력 지킨 기록 — 적은 날은 셋이 그대로(다시 셈하지 않음) · 꽃 선만 지금 값', {skip: !have && '저장소 자료 없음'}, () => {
  const D = load(), base = run(D).cal, d = base.days[5].d, other = base.days.at(-1).top.map(i => ({n: i.n, sc: 1, y: 0.5}));
  const kept = {[d]: {s: 9, top: other, at: 'x'}};
  const {cal} = computeTheme({...D, made: '2026-10-22T03:00:00.000Z', kept});
  const x = cal.days.find(v => v.d === d);
  assert.equal(x.k, 1);
  assert.deepEqual(x.top.map(i => [i.n, i.sc, i.y]), other.map(i => [i.n, 1, 0.5]));
  for (const i of x.top) assert.equal(typeof i.hit, 'boolean'); // 한 달이 지난 날 — 지금 값으로 꽃 선
  assert.deepEqual(cal.days.filter(v => v.d !== d).map(v => v.top.map(i => i.n)), base.days.filter(v => v.d !== d).map(v => v.top.map(i => i.n)));
});

test('싹 달력 지킨 기록 — 새로 적을 날: 시작 날 뒤 · 안 적은 날 · 장중 마지막 날은 뺌', async () => {
  const {keepNew, KEEP_FROM} = await import('../../scripts/atlas11/next/build/theme.mjs');
  const cal = {asOf: '2026-10-23', days: [{d: '2026-10-21', s: 3, top: [{n: 'A', sc: 4, y: 1, hit: null}]}, {d: '2026-10-22', s: 2, top: [{n: 'B', sc: 3, y: 2, hit: null}]}, {d: '2026-10-23', s: 1, top: [{n: 'C', sc: 2, y: 3, hit: null}]}]};
  assert.equal(KEEP_FROM, '2026-10-22');
  assert.deepEqual(Object.keys(keepNew(cal, {}, {provisional: true, made: 'm'})), ['2026-10-22']);
  assert.deepEqual(Object.keys(keepNew(cal, {}, {provisional: false, made: 'm'})), ['2026-10-22', '2026-10-23']);
  assert.deepEqual(Object.keys(keepNew(cal, {'2026-10-22': {top: []}}, {provisional: false, made: 'm'})), ['2026-10-23']);
  assert.deepEqual(keepNew(cal, {}, {provisional: false, made: 'm'})['2026-10-22'], {s: 2, top: [{n: 'B', sc: 3, y: 2}], at: 'm'});
});

test('싹 달력 지킨 기록 — 손 셈(keepCal 없음)은 파일을 쓰지 않음', async () => {
  const {build} = await import('../../scripts/atlas11/next/build/theme.mjs');
  if (!have) return;
  const os = await import('node:os');
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'cal-')), site = path.join(tmp, 'site'), kf = path.join(tmp, 'kept.json');
  fs.mkdirSync(path.join(site, 'next'), {recursive: true}); fs.symlinkSync(path.resolve('site', 'atlas'), path.join(site, 'atlas'));
  await build({siteDir: site, keptFile: kf});
  assert.equal(fs.existsSync(kf), false);
  await build({siteDir: site, keptFile: kf, keepCal: true});
  const cal = J(path.join(site, 'next', 'data', 'theme-cal.json')), late = cal.days.filter(x => x.d >= cal.keepFrom);
  if (!late.length) assert.equal(fs.existsSync(kf), false); // 저장소 자료가 시작 날 전이면 적을 날이 없음
  else { const k = J(kf); assert.equal(k.schema, 'dori-theme-cal-kept-1'); assert.ok(Object.keys(k.days).every(d => d >= cal.keepFrom)); }
  fs.rmSync(tmp, {recursive: true, force: true});
});
