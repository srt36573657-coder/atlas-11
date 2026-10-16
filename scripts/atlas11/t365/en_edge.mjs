#!/usr/bin/env node
/**
 * 새 ATLAS 영어 팩 — 사이트에서만 생기는 때를 영어로 돌기(사장님 2026-10-15(싱가포르) 23:35 「언어팩을 선태기하면 아틀란스가 영어로 나오게 하라」 · 규칙 71)
 *   까닭(2026-10-16): en_check 는 저장된 자료(장 마감 한 때)로 모든 길을 돎 — 올리기 전 바꿔치기 돌기에서 장 중 · 못 받은 때 글 33틀이 사전에 없었음
 *   ① 첫 화면 home.json 바꿔치기 — 지수 선(오름 · 내림 · 그대로 · 평소 견줌 · 이후 가장 크게 · 잇달아 · 짧은 선) · 받은 때(장 중 · 오전 · 오후 · 다음 날) ·
 *      못 받은 조각 15가지 · 큰 날 알림 · 사고팔기 · 미국 · 오른 곳 수 — 지수 · 기간 단추를 모두 누름(씨앗 고정 무작위 + 정해 둔 것)
 *   ② 장 중 판 — core · cond · surge · surgecal · surgetr 의 provisional · 급등 들고 남 · 확정 맞대기 · 두 번 넘기 · 앞 판 그대로 까닭 · 0곳
 *   ③ 실제 업데이트 기록의 급등 판(reports/atlas11/t365/surge/*.json 의 payload 마지막 셋) · surgecal-latest
 *   ④ 자료 없음 — 자료 파일마다 404 로 주요 길 · 회사 파일 404
 *   본다: 보이는 한글 0(lang="ko" 원문 빼고) · 사전에 없는 틀 0 · 옆 넘침 0 · 오류 0
 *   쓰는 법: node scripts/atlas11/t365/en_edge.mjs --base http://127.0.0.1:8824 [--data dist/atlas/data] [--rand 160] [--seed 20261016] [--jobs 2] [--out reports/atlas11/verify/atlas-new-en-edge-latest.json] [--miss 파일]
 *   틀린 것이 하나라도 있으면 끝 코드 1
 */
import fs from 'node:fs';
import path from 'node:path';
import {createRequire} from 'node:module';
const arg = (k, d) => { const i = process.argv.indexOf(k); return i < 0 ? d : process.argv[i + 1]; };
const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '../../..');
const base = arg('--base', 'http://127.0.0.1:8824'), DATA = path.resolve(ROOT, arg('--data', 'dist/atlas/data'));
const OUT = path.resolve(ROOT, arg('--out', 'reports/atlas11/verify/atlas-new-en-edge-latest.json')), MISS = arg('--miss', null);
const RAND = Number(arg('--rand', 160)), SEED = Number(arg('--seed', 20261016)), JOBS = Math.max(1, Number(arg('--jobs', 2)));
const require = createRequire(arg('--pw', '/opt/node-tools/')); const {chromium} = require('playwright');
const J = f => JSON.parse(fs.readFileSync(path.join(DATA, f), 'utf8'));
const tryJ = f => { try { return J(f); } catch { return null; } };
const C = x => JSON.parse(JSON.stringify(x));
const home = J('home.json'), core = J('core.json'), cond = tryJ('cond.json'), surge = tryJ('surge.json'), surgecal = tryJ('surgecal.json'), surgetr = tryJ('surgetr.json');
const FILES = fs.readdirSync(DATA).filter(f => f.endsWith('.json'));

// ── 씨앗 고정 무작위 ──
let s0 = SEED >>> 0; const rnd = () => { s0 = (s0 + 0x6D2B79F5) >>> 0; let t = s0; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
const pick = xs => xs[Math.floor(rnd() * xs.length)];
const r2 = x => Math.round(x * 100) / 100;

// ── 날 · 때 ── 보는 날 = home.kst 의 날(서울) — 시계를 그날 · 다음 날로 맞춤
const TODAY = String(home.kst ?? '2026-10-14 14:00').slice(0, 10);
const addDays = (d, k) => new Date(Date.parse(d + 'T00:00:00Z') + k * 864e5).toISOString().slice(0, 10);
const bizBack = (d, k) => { let x = d, n = 0; while (n < k) { x = addDays(x, -1); const w = new Date(x + 'T00:00:00Z').getUTCDay(); if (w !== 0 && w !== 6) n++; } return x; };
const YDAY = bizBack(TODAY, 1), Y2 = bizBack(TODAY, 2);
const kstMs = (d, hm) => Date.parse(`${d}T${hm}:00+09:00`);
const CLOCKS = {in: kstMs(TODAY, '10:30'), after: kstMs(TODAY, '16:30'), next: kstMs(addDays(TODAY, 1), '09:30'), eve: kstMs(TODAY, '21:10')};

// ── ① 첫 화면 바꿔치기 ──
/** 지수 선 — n 줄 · 끝 날 end · 마지막 하루 t(%) · 앞 20일 평소 크기 avg · 같은 쪽 큰 날 gap(없으면 null) · 잇달아 k */
function rows(n, end, {t, avg = 1, gap = null, k = 1}) {
  const ds = []; let d = end; for (let i = 0; i < n; i++) { ds.unshift(d); d = bizBack(d, 1); }
  const mv = []; for (let i = 1; i < n; i++) mv.push((i % 2 ? 1 : -1) * avg * (0.6 + 0.8 * rnd())); // 오르내림이 번갈아(잇달아 없음)
  const m = mv.length; if (m) { mv[m - 1] = t; for (let j = 2; j <= k && m - j >= 0; j++) mv[m - j] = Math.sign(t || 1) * avg * (0.3 + 0.4 * rnd()); if (gap != null && m - 1 - gap >= 0) mv[m - 1 - gap] = t * 1.3; }
  const out = [[ds[0], 2500]]; for (let i = 1; i < n; i++) out.push([ds[i], r2(out[i - 1][1] * (1 + mv[i - 1] / 100))]);
  return out;
}
function idxOf(name, n, end, shape) {
  const rs = rows(n, end, shape), last = rs.at(-1)[1], prev = rs.at(-2)?.[1] ?? last;
  const hiI = rs.reduce((a, r, i) => (r[1] > rs[a][1] ? i : a), 0);
  return {name, rows: rs, date: end, close: last, day: r2((last / prev - 1) * 100), live: pick([true, false, undefined]), hi: rnd() < 0.1 ? null : {d: rs[hiI][0], v: rs[hiI][1], vs: r2((last / rs[hiI][1] - 1) * 100)}, chg20: r2((rnd() - 0.5) * 20)};
}
const SHAPES = [
  () => ({t: 2.6 + rnd(), avg: 1}), () => ({t: -(2.6 + rnd()), avg: 1}), // 평소의 n배 · 3달 동안 가장 크게
  () => ({t: 2.2, avg: 1, gap: 8}), () => ({t: -2.2, avg: 1, gap: 8}), // n월 n일 이후 가장 크게
  () => ({t: 2.2, avg: 1, gap: 3}), () => ({t: -2.2, avg: 1, gap: 3}), // 앞 큰 날이 5거래일 안
  () => ({t: 1.0, avg: 1}), () => ({t: -1.0, avg: 1}), // 평소만큼
  () => ({t: 0.3, avg: 1}), () => ({t: -0.3, avg: 1}), // 평소보다 작게
  () => ({t: 0, avg: 1}), () => ({t: 0.02, avg: 1}), // 거의 그대로
  () => ({t: 1.4, avg: 1, k: 4}), () => ({t: -1.4, avg: 1, k: 5}), () => ({t: 3.3, avg: 1, k: 3}), () => ({t: -3.3, avg: 1, k: 3}), // 잇달아
];
const ALERTS = [[], [{kind: 'idx', key: 'KOSPI', name: '코스피', v: -3.1, why: 'usual'}], [{kind: 'idx', key: 'KOSDAQ', name: '코스닥', v: 5.6, why: 'big'}],
  [{kind: 'idx', key: 'KOSPI', name: '코스피', v: -2.4, why: 'usual'}, {kind: 'idx', key: 'KOSDAQ', name: '코스닥', v: -3.0, why: 'usual'}],
  [{kind: 'idx', key: 'KOSPI', name: '코스피', v: 2.4, why: 'usual'}, {kind: 'idx', key: 'KOSDAQ', name: '코스닥', v: -3.0, why: 'usual'}],
  [{kind: 'idx', key: 'KOSPI', name: '코스피', v: 6.1, why: 'big'}, {kind: 'idx', key: 'KOSDAQ', name: '코스닥', v: 7.2, why: 'big'}],
  [{kind: 'idx', key: 'KOSPI', name: '코스피', v: -5.2, why: 'big'}, {kind: 'idx', key: 'KOSDAQ', name: '코스닥', v: 2.6, why: 'usual'}],
  [{kind: 'flow', key: 'KOSPI', v: -1.3e4}], [{kind: 'flow', key: 'KOSDAQ', v: 1.1e4}], [{kind: 'flow', key: 'KOSPI', v: 1.2e4}, {kind: 'flow', key: 'KOSDAQ', v: -1.05e4}]];
const PIECES = ['idx', 'sectors', 'flows', 'us'];
const TIMES = () => [`${YDAY} 14:59`, `${TODAY} 10:20`, `${YDAY} 09:40`, `${Y2} 21:00`, `${TODAY} 13:05`, 'x'];
function breadth() {
  const n = 2000 + Math.floor(rnd() * 900), kind = pick(['up', 'down', 'flat', 'allUp', 'allDown', 'even']);
  const B = kind === 'allUp' ? {up: n, flat: 0, down: 0} : kind === 'allDown' ? {up: 0, flat: 0, down: n} : kind === 'flat' ? {up: 100, flat: n - 300, down: 200} :
    kind === 'even' ? {up: Math.floor(n * 0.45), flat: n - 2 * Math.floor(n * 0.45), down: Math.floor(n * 0.45)} : kind === 'up' ? {up: Math.floor(n * (0.5 + rnd() * 0.45)), flat: 50, down: 0} : {up: 0, flat: 50, down: Math.floor(n * (0.5 + rnd() * 0.45))};
  if (kind === 'up') B.down = n - B.up - B.flat; if (kind === 'down') B.up = n - B.down - B.flat; B.n = B.up + B.flat + B.down; return B;
}
function randHome() {
  const H = C(home), endK = pick([TODAY, YDAY, Y2]), endQ = rnd() < 0.85 ? endK : pick([TODAY, YDAY, Y2]);
  H.idx = {KOSPI: rnd() < 0.07 ? null : idxOf('코스피', rnd() < 0.12 ? 3 + Math.floor(rnd() * 18) : 61, endK, pick(SHAPES)()),
    KOSDAQ: rnd() < 0.07 ? null : idxOf('코스닥', rnd() < 0.12 ? 3 + Math.floor(rnd() * 18) : endQ === endK ? 61 : 60, endQ, pick(SHAPES)())};
  H.kst = pick([`${TODAY} 10:06`, `${TODAY} 14:00`, `${TODAY} 15:45`, `${TODAY} 08:40`, `${YDAY} 20:10`, undefined]);
  if (H.kst === undefined) delete H.kst;
  H.live = pick([true, false]);
  H.stale = {}; for (const k of PIECES) if (rnd() < 0.3) H.stale[k] = pick(TIMES());
  H.alerts = C(pick(ALERTS));
  if (H.sectors) { H.sectors.breadth = rnd() < 0.1 ? null : breadth(); H.sectors.date = pick([TODAY, YDAY, undefined]); if (rnd() < 0.1) { H.sectors.strong = []; H.sectors.weak = []; } if (rnd() < 0.1) delete H.sectors.ranked; }
  if (rnd() < 0.06) H.sectors = null;
  if (H.flows) { for (const m of ['KOSPI', 'KOSDAQ']) if (H.flows[m]) { H.flows[m].date = pick([TODAY, YDAY]); for (const w of ['personal', 'foreign', 'institutional']) H.flows[m][w] = rnd() < 0.08 ? null : rnd() < 0.08 ? 0 : Math.round((rnd() - 0.5) * 30000); } H.flows.live = pick([true, false, undefined]); if (rnd() < 0.12) delete H.flows.KOSDAQ; if (rnd() < 0.05) H.flows = null; }
  if (H.us && Array.isArray(H.us.rows)) { const keep = H.us.rows.filter(r => rnd() < 0.85 || r.key === 'INX'); for (const r of keep) r.chg = r2((rnd() - 0.5) * 4); H.us.rows = keep; H.us.date = pick([TODAY, YDAY, Y2, undefined]); if (rnd() < 0.05) H.us = null; }
  return H;
}
/** 못 받은 조각 15가지 × 받은 때(오전 · 오후 · 모름) × 장 중(live) */
function staleHomes() {
  const out = [];
  for (let m = 1; m < 16; m++) for (const t of [`${YDAY} 14:59`, `${TODAY} 10:20`, 'x']) for (const live of [true, false]) {
    const H = C(home); H.idx.KOSPI = idxOf('코스피', 61, YDAY, SHAPES[0]()); H.idx.KOSDAQ = idxOf('코스닥', 61, YDAY, SHAPES[1]()); H.live = live; H.kst = `${TODAY} 11:00`;
    H.stale = {}; PIECES.forEach((k, i) => { if (m & (1 << i)) H.stale[k] = t; }); out.push(H);
  }
  return out;
}
const homeScen = [];
for (const H of staleHomes()) homeScen.push({name: '못 받은 조각', files: {'home.json': H}, clock: pick([CLOCKS.in, CLOCKS.after, CLOCKS.next]), hash: '#/', clicks: true});
for (let i = 0; i < RAND; i++) homeScen.push({name: '첫 화면 ' + i, files: {'home.json': randHome()}, clock: pick([CLOCKS.in, CLOCKS.after, CLOCKS.next, CLOCKS.eve]), hash: '#/', clicks: true});
homeScen.push({name: '첫 화면 자료 없음', files: {'home.json': 404}, hash: '#/'});

// ── ② 장 중 판 · 급등 들고 남 ──
const other = [];
const coPick = Object.keys(J('comp.json').companies ?? {})[0], coAll = Object.keys(tryJ('mkt.json')?.companies ?? {}), coOut = coAll.find(c => c !== coPick && !(J('comp.json').companies ?? {})[c]);
const ROUTES = ['#/', '#/list', '#/cond', '#/surge', '#/surge/10', '#/surge/40', '#/cal', '#/time', '#/info', '#/up', '#/g/' + core.groups[0].id, '#/i/' + encodeURIComponent(core.industries.find(i => i.n > 1).name),
  ...(coPick ? ['#/c/' + coPick, `#/c/${coPick}/past`, `#/c/${coPick}/range`] : []), ...(coOut ? ['#/c/' + coOut, `#/c/${coOut}/grow`] : []), ...(surgetr?.cases?.length ? ['#/cal/' + surgetr.cases[0][0]] : [])];
{ const K = C(core); K.provisional = true; for (const h of ROUTES) other.push({name: 'core 장 중', files: {'core.json': K}, hash: h, clock: CLOCKS.in}); }
if (cond) for (const p of [true, false]) { const X = C(cond); X.provisional = p; X.asOf = core.asOf; for (const h of ['#/cond', '#/cond/all-all-all', '#/cond/rise-top3-spike']) other.push({name: 'cond 장 중 ' + p, files: {'cond.json': X}, hash: h}); }
if (cond) { const X = C(cond); X.asOf = '2026-01-02'; other.push({name: 'cond 날이 다름', files: {'cond.json': X}, hash: '#/cond'}); }
const SVR = ['#/surge', '#/surge/10', '#/surge/20', '#/surge/30', '#/surge/40'];
if (surge) {
  const M = surge.members ?? [];
  const mk = f => { const S = C(surge); f(S); return S; };
  const vars = [
    ['급등 장 중', S => { S.provisional = true; S.got = `${S.asOf} 13:05`; for (const m of S.members.slice(0, 5)) m.prov = true; for (const m of S.members.slice(0, 3)) m.warnLive = true; for (const b of ['b10', 'b20', 'b30', 'b40']) for (const m of S.bands?.[b]?.members?.slice(0, 3) ?? []) m.prov = true; }],
    ['급등 장 중 받은 때 없음', S => { S.provisional = true; S.got = null; }],
    ['급등 들고 남', S => { S.kind = 'pick'; S.in = M.slice(0, 3).map(m => ({c: m.c, n: m.n, r5: m.r5, why: `5일 동안 +${m.r5.toFixed(1)}% 올라 들어왔어요`})); S.out = M.slice(3, 6).map(m => ({c: m.c, n: m.n, r5: 8.2, why: '값이 내려 10% 밑이 됐어요'}));
      for (const m of S.members.slice(0, 3)) m.tag = 'new'; S.prev = {at: '2026-10-16T03:01:27.296Z', kst: `${S.asOf} 12:01`, slot: '12:00', asOf: S.asOf, n: S.n - 1, version: 'sv-v1'};
      for (const b of ['b10', 'b20', 'b30', 'b40']) { const B = S.bands?.[b]; if (!B) continue; B.in = (B.members ?? []).slice(0, 2).map(m => ({c: m.c, n: m.n, r5: m.r5})); B.out = (B.members ?? []).slice(2, 4).map(m => ({c: m.c, n: m.n, r5: 9.1, why: '값이 내려 10% 밑이 됐어요'})); B.move = (B.members ?? []).slice(4, 6).map(m => ({c: m.c, n: m.n, r5: m.r5, from: 'b20', to: b})); } }],
    ['급등 확정 맞대기 빠짐', S => { S.confirm = {n: 4, miss: 2, day: core.asOf}; }],
    ['급등 확정 맞대기 모두', S => { S.confirm = {n: 3, miss: 0, day: core.asOf}; }],
    ['급등 두 번 넘기', S => { S.strict = true; }],
    ['급등 앞 판 그대로', S => { S.carry = {from: '2026-10-16T03:01:27.296Z', fromKst: `${S.asOf} 12:01`, fromSlot: '12:00', why: '같은 업데이트를 한 번 더 돌려 앞에 고른 그대로예요'}; }], // roll.mjs surgeCarry 꼴
    ['급등 앞 판 그대로(까닭 없음)', S => { S.carry = {from: '2026-10-16T03:01:27.296Z', fromKst: `${S.asOf} 12:01`, fromSlot: '12:00', why: null}; S.kind = 'pick'; }],
    ['급등 0곳', S => { S.members = []; S.n = 0; S.stats = {lo: null, hi: null, med: null}; }],
    ['급등 몇 곳', S => { S.members = S.members.slice(0, 4); S.n = 4; }],
    ['급등 늦은 목록', S => { S.asOf = bizBack(core.asOf, 2); }],
  ];
  for (const [nm, f] of vars) { const S = mk(f); for (const h of SVR) other.push({name: nm, files: {'surge.json': S}, hash: h, clock: CLOCKS.in}); }
}
if (surgecal) for (const [nm, f] of [['달력 장 중', T => { T.provisional = true; T.kst = `${T.asOf} 13:05`; }], ['달력 장 중 다른 날', T => { T.provisional = true; T.kst = `${addDays(T.asOf, 1)} 09:20`; }]]) { const T = C(surgecal); f(T); for (const h of [...SVR, '#/cal']) other.push({name: nm, files: {'surgecal.json': T}, hash: h, clock: CLOCKS.in}); }
if (surgetr) for (const [nm, f] of [['따라가기 장 중', T => { T.provisional = true; T.kst = `${T.asOf} 13:05`; }], ['따라가기 장 중 다른 날', T => { T.provisional = true; T.kst = `${addDays(T.asOf, 1)} 09:20`; }]]) { const T = C(surgetr); f(T); for (const h of ['#/cal', ...(T.cases?.slice(0, 4).map(r => '#/cal/' + r[0]) ?? [])]) other.push({name: nm, files: {'surgetr.json': T}, hash: h, clock: CLOCKS.in}); }
// ③ 실제 업데이트 기록의 급등 판(마지막 셋) · surgecal-latest
{ const dir = path.join(ROOT, 'reports/atlas11/t365/surge'); const recs = fs.existsSync(dir) ? fs.readdirSync(dir).filter(f => /^\d{8}T\d{6}Z\.json$/.test(f)).sort().slice(-3) : [];
  for (const f of recs) { let P = null; try { P = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8')).payload; } catch { /* 넘어감 */ } if (P?.schema === 'atlas-new-surge-1') for (const h of SVR) other.push({name: '기록 ' + f, files: {'surge.json': P}, hash: h, clock: CLOCKS.in}); }
  const lat = path.join(ROOT, 'reports/atlas11/t365/surgecal-latest.json'); if (fs.existsSync(lat)) { let K = null; try { K = JSON.parse(fs.readFileSync(lat, 'utf8')); K = K?.payload ?? K; } catch { /* 넘어감 */ } if (K?.track) for (const h of [...SVR, '#/cal']) other.push({name: 'surgecal-latest', files: {'surgecal.json': K}, hash: h, clock: CLOCKS.in}); } }
// ⑤ 누를 때만 나오는 글 — 글씨 크기 · 찾기(없는 이름) · 관심 없음 · 되돌리기 · 관심(★) · 숨김 풀기 · 칸 고르기 · 더 보기 · 조건 고르기 판 · 언어 · 도움말 · 기억 못 하는 기계(사생활 창)
const clickAll = async (p, sel, look, max = 8) => { const n = Math.min(max, await p.locator(sel).count()); for (let i = 0; i < n; i++) { const el = p.locator(sel).nth(i); if (await el.isVisible().catch(() => false)) { await el.click({timeout: 2000}).catch(() => {}); await p.waitForTimeout(120); await look(); } } };
const click1 = async (p, sel, look) => { const el = p.locator(sel).first(); if (await el.count() && await el.isVisible().catch(() => false)) { await el.click({timeout: 2000}).catch(() => {}); await p.waitForTimeout(150); await look(); return true; } return false; };
const latCal = (() => { const lat = path.join(ROOT, 'reports/atlas11/t365/surgecal-latest.json'); try { const K = JSON.parse(fs.readFileSync(lat, 'utf8')); return K?.payload ?? K; } catch { return null; } })();
const trackCodes = (latCal ?? surgecal)?.track?.filter(t => t.path?.length).map(t => t.c) ?? [], caseCodes = surgetr?.cases?.map(r => r[0]) ?? [];
const acts = [
  {name: '글씨 크기', hash: '#/', act: async (p, look) => { for (let i = 0; i < 3; i++) await click1(p, '#fontBtn', look); }},
  ...ROUTES.filter(h => h !== '#/' && h !== '#/info').map(h => ({name: '아주 크게', hash: h, act: async (p, look) => { await click1(p, '#fontBtn', look); await click1(p, '#fontBtn', look); }})), // 영어 긴 낱말이 큰 글씨에서 화면 밖으로(2026-10-16 사고팔기 값 42px)
  {name: '찾기', hash: '#/', act: async (p, look) => { if (!await click1(p, '#openFind', look)) return; for (const q of ['zzqq', '삼성', 'ㅅㅅㅈㅈ', '반도체', 'kb']) { await p.fill('#q', q).catch(() => {}); await p.waitForTimeout(250); await look(); } }},
  {name: '언어 · 도움말', hash: '#/', act: async (p, look) => { await click1(p, '#langBtn', look); await p.keyboard.press('Escape').catch(() => {}); await click1(p, '#helpBtn', look); }},
  {name: '첫 화면 접은 칸', hash: '#/', act: async (p, look) => { await clickAll(p, '#view details > summary', look, 12); }},
  ...[false, true].flatMap(priv => [
    {name: '급등 관심 없음' + (priv ? ' · 기억 못 함' : ''), priv, files: latCal ? {'surgecal.json': latCal} : {}, hash: '#/surge', act: async (p, look) => {
      if (!await click1(p, '#view button.sv-hide', look)) return; await click1(p, '#view button.sv-undo', look); await click1(p, '#view button.sv-hide', look);
      await clickAll(p, '#view details.sv-gone > summary', look, 1); await click1(p, '#view button.sv-show', look); }},
    {name: '달력 종목 관리' + (priv ? ' · 기억 못 함' : ''), priv, hash: caseCodes.length ? '#/cal/' + caseCodes[0] : '#/cal', act: async (p, look) => {
      for (let i = 0; i < 2; i++) { await click1(p, '#view button.cal-star', look); await click1(p, '#view button.cal-hide', look); } await clickAll(p, '#view button.cal-btn', look, 2); }},
  ]),
  {name: '달력 칸 고르기 · 숨긴 곳', hash: '#/cal', store: {'atlas:surge-hide': caseCodes.slice(0, 3), 'atlas:cal-star': caseCodes.slice(3, 5)}, act: async (p, look) => {
    await clickAll(p, '#view button[data-f]', look, 6); await clickAll(p, '#view details.cal-gone > summary', look, 1); await click1(p, '#view button.cal-show', look); await clickAll(p, '#view details > summary', look, 6); }},
  {name: '급등 숨긴 곳', hash: '#/surge/10', files: latCal ? {'surgecal.json': latCal} : {}, store: {'atlas:surge-hide': trackCodes.slice(0, 3)}, act: async (p, look) => {
    await clickAll(p, '#view details > summary', look, 10); await click1(p, '#view button.sv-show', look); await clickAll(p, '#view button.sv-cell', look, 6); }},
  {name: '조건 더 보기 · 고르기 판', hash: '#/cond/all-all-all', act: async (p, look) => {
    await click1(p, '#view button.cd-more', look); await click1(p, '#view button.cd-more', look);
    for (let k = 0; k < 3; k++) { if (!await click1(p, `#view button.cd-slot >> nth=${k}`, look)) continue; await clickAll(p, '.sheet:not([hidden]) button', look, 6); await p.keyboard.press('Escape').catch(() => {}); } }},
  {name: '회사 접은 칸', hash: coPick ? '#/c/' + coPick : '#/', act: async (p, look) => { await clickAll(p, '#view details > summary', look, 10); await clickAll(p, '#view button', look, 6); }},
];
for (const a of acts) other.push({...a, files: a.files ?? {}});
// ④ 자료 없음
for (const f of FILES) for (const h of ['#/', '#/list', '#/cond', '#/surge', '#/cal', '#/up', '#/time', ...(coPick ? ['#/c/' + coPick, `#/c/${coPick}/rivals`, `#/c/${coPick}/grow`] : [])]) other.push({name: f + ' 없음', files: {[f]: 404}, hash: h});
if (coPick) for (const h of ['#/c/' + coPick, `#/c/${coPick}/past`, `#/c/${coPick}/range`]) other.push({name: '회사 파일 없음', files: {[`co/${coPick}.json`]: 404}, hash: h});

// ── 돌기 ──
const exe = ['/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell'].find(f => fs.existsSync(f));
const b = await chromium.launch(exe ? {executablePath: exe} : {});
const fails = [], miss = new Map(); let screens = 0;
const fail = (where, what) => { if (fails.length < 2000) fails.push({where, what}); };
const see = p => p.evaluate(() => {
  const H = /[가-힣ㄱ-ㅎ]/, han = [];
  const vis = el => { const s = getComputedStyle(el); if (s.visibility === 'hidden' || s.display === 'none') return false; if (!el.getClientRects().length) return false; return !el.closest('details:not([open]) > :not(summary)'); };
  const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  for (let n = w.nextNode(); n; n = w.nextNode()) { const el = n.parentElement; if (!el || el.closest('[lang="ko"], script, style, noscript, [hidden], .sr')) continue; const t = n.nodeValue.trim(); if (t && H.test(t) && vis(el)) han.push(t.slice(0, 70)); }
  for (const a of ['aria-label', 'title', 'placeholder', 'alt']) for (const el of document.querySelectorAll(`[${a}]`)) { if (el.closest('[lang="ko"]')) continue; const v = el.getAttribute(a); if (H.test(v)) han.push('@' + a + ':' + v.slice(0, 50)); }
  return {han, over: document.documentElement.scrollWidth - innerWidth, miss: (window.__atlasI18n?.missing?.() ?? []).map(x => [x.key, x.ex]), en: document.documentElement.classList.contains('en')};
});
async function one(sc) {
  const ctx = await b.newContext({viewport: {width: 360, height: 640}, reducedMotion: 'reduce'});
  if (sc.store) await ctx.addInitScript(s => { for (const [k, v] of Object.entries(s)) { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* 기억 못 함 */ } } }, sc.store);
  if (sc.priv) await ctx.addInitScript(() => { Storage.prototype.setItem = function () { throw new Error('기억 못 하는 기계'); }; }); // 사생활 창 흉내 — 「이 기계는 기억을 못 해」 글
  for (const [f, body] of Object.entries(sc.files ?? {})) await ctx.route('**/atlas/data/' + f, r => (body === 404 ? r.fulfill({status: 404, body: 'no'}) : r.fulfill({contentType: 'application/json', body: JSON.stringify(body)})));
  const p = await ctx.newPage(), errs = []; p.on('pageerror', e => errs.push(String(e).slice(0, 160))); p.on('console', m => { if (m.type() === 'error' && !/404|Failed to load resource/.test(m.text())) errs.push(m.text().slice(0, 160)); });
  try {
    if (sc.clock) await p.clock.setFixedTime(new Date(sc.clock));
    await p.goto(base + '/atlas/index.html?lang=en' + sc.hash, {waitUntil: 'domcontentloaded'});
    await p.waitForFunction(() => window.__atlasI18n && !document.querySelector('#view p.boot'), null, {timeout: 20000}).catch(() => {});
    await p.waitForTimeout(350);
    const R = [await see(p)];
    if (sc.act) await sc.act(p, async () => { R.push(await see(p)); });
    if (sc.clicks) for (const sel of ['#view .m4-seg button', '#view .m4-per button']) { const n = await p.locator(sel).count(); for (let i = 0; i < n; i++) { const bt = p.locator(sel).nth(i); if (await bt.isEnabled().catch(() => false)) { await bt.click({timeout: 2000}).catch(() => {}); await p.waitForTimeout(60); R.push(await see(p)); } } }
    screens += R.length;
    for (const r of R) for (const [k, ex] of r.miss) if (!miss.has(k)) miss.set(k, {ex, at: sc.name + ' ' + sc.hash});
    const han = [...new Set(R.flatMap(r => r.han))];
    if (!R[0].en) fail(sc.name + ' ' + sc.hash, '영어 아님');
    if (han.length) fail(sc.name + ' ' + sc.hash, '한글 남음 ' + han.length + ': ' + han.slice(0, 3).join(' | '));
    if (R.some(r => r.over > 1)) fail(sc.name + ' ' + sc.hash, '옆 넘침 ' + Math.max(...R.map(r => r.over)) + 'px');
    if (errs.length) fail(sc.name + ' ' + sc.hash, '오류 ' + errs[0]);
  } catch (e) { fail(sc.name + ' ' + sc.hash, '멈춤 ' + String(e).slice(0, 140)); }
  await ctx.close();
}
const all = [...homeScen, ...other], t0 = Date.now();
let at = 0; await Promise.all(Array.from({length: JOBS}, async () => { while (at < all.length) { const sc = all[at++]; await one(sc); } }));
await b.close();
const res = {schema: 'atlas-new-en-edge-1', made: new Date().toISOString(), base, data: path.relative(ROOT, DATA), seed: SEED, rand: RAND, today: TODAY, scenarios: all.length, home: homeScen.length, other: other.length, screens,
  seconds: Math.round((Date.now() - t0) / 1000), missing: miss.size, missingFirst: [...miss].slice(0, 40).map(([k, x]) => ({key: k, ex: x.ex, at: x.at})), fails: fails.length, failFirst: fails.slice(0, 40), ok: !fails.length && !miss.size};
fs.mkdirSync(path.dirname(OUT), {recursive: true}); fs.writeFileSync(OUT, JSON.stringify(res, null, 1) + '\n');
if (MISS) fs.writeFileSync(MISS, JSON.stringify([...miss].map(([k, x]) => ({key: k, ex: x.ex, at: x.at})), null, 1));
console.log(JSON.stringify({scenarios: res.scenarios, screens, missing: res.missing, fails: res.fails, seconds: res.seconds, ok: res.ok}));
process.exit(res.ok ? 0 : 1);
