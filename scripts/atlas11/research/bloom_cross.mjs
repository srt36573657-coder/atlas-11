#!/usr/bin/env node
// 꽃 될 회사 — 달마다 고른 조건 · 셈 셋 교차 검증(docs/design/self-evolve-2026-11-02/spec.md v2 §5 · 주문 1313)
//   사장님 2026-11-02 08:13(+04) 「응 그리고 스스로 하건 점수화해소 교차 검증 하게 해」
//   ① 연구 셈 scripts/atlas11/research/bloom_month.py ② 따로 센 일꾼 docs/design/self-evolve-2026-11-02/recount-month.py
//   ③ 사이트 엔진 site/next/theme-engine.js + bloom-atoms.js(build/theme.mjs 를 같은 자료 · ① 의 결정으로 돌림)
//   셋이 달마다 결정 · 달 기록(n · h · nb · hb · days · pickDays · complete) · 모은 기록 · 오늘 고른 회사 · 회사마다 지난 기록까지 모두 같을 때만 새 판을 씀
//   쓰는 법: node scripts/atlas11/research/bloom_cross.mjs --research <①.json> --recount <②.json> --site <atlas/data 가 든 폴더>
//            [--stored site/next/data/bloom-months.json] [--out site/next/data/bloom-months.json] [--report <파일>] [--data live|stored]
//   끝 코드: 0 = 셋이 같음(새 판을 out 에 씀) · 1 = 다름(안 씀 · 까닭은 report) · 2 = 잘못 넣음
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');
const arg = (k, d = null) => (process.argv.includes(k) ? process.argv[process.argv.indexOf(k) + 1] : d);
const J = f => JSON.parse(fs.readFileSync(f, 'utf8'));
const RES = arg('--research'), REC = arg('--recount'), SITE = arg('--site'), STORED = arg('--stored'), OUT = arg('--out'), REPORT = arg('--report'), DATA = arg('--data', 'stored');
if (!RES || !REC || !SITE) { console.error('쓰는 법: --research ①.json --recount ②.json --site <폴더> [--out …]'); process.exit(2); }
const R = J(RES), Q = J(REC);
const SEAL_FROM = R.sealFrom ?? '2026-11';
const diffs = [], put = (where, what) => diffs.push(where + ' — ' + what);

// 새 판 후보(① 의 결정 · 봉인 = 2026-11 부터)
const cand = (R.months ?? []).map(m => ({month: m.month, s: m.s, id: m.id ?? null, sealed: m.month >= SEAL_FROM, fresh: m.fresh ?? null, lb: m.lb ?? null, d: m.d ?? null, nTrain: m.nTrain ?? null, elig: m.elig ?? null, trainDays: m.trainDays ?? null}));
if (!cand.length) { console.error('① 결정이 비었음'); process.exit(2); }
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'bloom-cross-'));
const candFile = path.join(tmp, 'bloom-months.json');
fs.writeFileSync(candFile, JSON.stringify({months: cand}));

// ③ 사이트 엔진 — 같은 자료 · 새 결정으로 build(바깥 사이트 파일은 안 건드림 · 임시 폴더에 씀)
const work = path.join(tmp, 'site');
fs.mkdirSync(path.join(work, 'atlas'), {recursive: true});
fs.symlinkSync(path.resolve(SITE, 'atlas', 'data'), path.join(work, 'atlas', 'data'));
const {build} = await import(path.join(ROOT, 'scripts/atlas11/next/build/theme.mjs'));
await build({siteDir: work, keptFile: path.join(tmp, 'kept.json'), monthsFile: candFile});
const E = J(path.join(work, 'next', 'data', 'theme-bloom.json'));

// 자료가 같은 판인지
if (R.asOf !== Q.asOf || R.asOf !== E.asOf) put('자료 날', `① ${R.asOf} · ② ${Q.asOf} · ③ ${E.asOf}`);
if (R.tl !== Q.tl) put('결과 난 마지막 날', `① ${R.tl} · ② ${Q.tl}`);
// 달마다 결정 · 기록
const F = ['n', 'h', 'nb', 'hb', 'days', 'pickDays', 'complete'];
const mQ = new Map((Q.months ?? []).map(m => [m.month, m])), mE = new Map((E.months ?? []).map(m => [m.month, m]));
if ((Q.months ?? []).length !== cand.length) put('달 수', `① ${cand.length} · ② ${(Q.months ?? []).length}`);
if ((E.months ?? []).length !== cand.length) put('달 수', `① ${cand.length} · ③ ${(E.months ?? []).length}`);
for (const m of R.months) {
  const q = mQ.get(m.month), e = mE.get(m.month);
  if (!q) { put(m.month, '② 에 없음'); continue; }
  if (!e) { put(m.month, '③ 에 없음'); continue; }
  if ((m.id ?? null) !== (q.id ?? null)) put(m.month, `결정 ① ${m.id} · ② ${q.id}`);
  if ((m.id ?? null) !== (e.id ?? null)) put(m.month, `결정 ① ${m.id} · ③ ${e.id}`);
  for (const f of F) {
    const a = m.record?.[f], b = q.record?.[f], c = e.rec?.[f];
    if (a !== b) put(m.month, `${f} ① ${a} · ② ${b}`);
    if (a !== c) put(m.month, `${f} ① ${a} · ③ ${c}`);
  }
}
// 모은 기록(쪽 · 첫 화면 결론 숫자)
const tR = R.totals ?? {}, tQ = Q.totals ?? {}, tE = {n: E.honest?.n, h: E.honest?.hits, nb: E.honest?.baseN, hb: E.honest?.baseHits};
for (const f of ['n', 'h', 'nb', 'hb']) { if (tR[f] !== tQ[f]) put('모은 기록', `${f} ① ${tR[f]} · ② ${tQ[f]}`); if (tR[f] !== tE[f]) put('모은 기록', `${f} ① ${tR[f]} · ③ ${tE[f]}`); }
// 오늘 고른 회사 · 회사마다 지난 기록(① 과 ③ — ② 는 오늘 목록을 안 셈)
const rowsE = (E.today?.inds ?? []).flatMap(i => i.co.map(r => r[0])).sort(), rowsR = [...(R.today?.rows ?? [])].sort();
if (JSON.stringify(rowsE) !== JSON.stringify(rowsR)) put('오늘 고른 회사', `① ${rowsR.length}곳 · ③ ${rowsE.length}곳`);
if ((R.today?.id ?? null) !== (E.today?.rule?.id ?? null)) put('오늘 조건', `① ${R.today?.id} · ③ ${E.today?.rule?.id}`);
for (const i of E.today?.inds ?? []) for (const r of i.co) { const p = R.today?.past?.[r[0]]; if (!p || p[0] !== r[4] || p[1] !== r[5]) put('회사 지난 기록 ' + r[0], `① ${JSON.stringify(p)} · ③ ${JSON.stringify([r[4], r[5]])}`); }
// 봉인 — 저장된 결정(2026-11 부터)은 그대로 이어졌는지
if (STORED && fs.existsSync(STORED)) {
  const S = J(STORED);
  for (const s of S.months ?? []) if (s.sealed && s.month >= SEAL_FROM) { const c = cand.find(x => x.month === s.month); if (!c || (c.id ?? null) !== (s.id ?? null)) put('봉인 ' + s.month, `저장 ${s.id} · 새 판 ${c?.id}`); }
}
const sum = t => ({n: t.n, h: t.h, nb: t.nb, hb: t.hb, rate: t.n ? Math.round((t.h / t.n) * 10000) / 100 : null, base: t.nb ? Math.round((t.hb / t.nb) * 10000) / 100 : null});
const check = {at: new Date().toISOString(), data: DATA, asOf: R.asOf, tl: R.tl, agree: diffs.length === 0, counts: 3, months: cand.length,
  research: sum(tR), recount: sum(tQ), engine: sum(tE), today: {date: E.asOf, id: E.today?.rule?.id ?? null, n: rowsE.length}, diffs: diffs.slice(0, 40)};
if (REPORT) fs.writeFileSync(REPORT, JSON.stringify(check, null, 1) + '\n');
fs.rmSync(tmp, {recursive: true, force: true});
if (diffs.length) { console.log(`셈 셋이 다름 ${diffs.length}곳 — 새 판을 쓰지 않음`); for (const d of diffs.slice(0, 20)) console.log('  ' + d); process.exit(1); }
const body = {schema: 'dori-bloom-months-1', spec: 'docs/design/self-evolve-2026-11-02/spec.md v2', made: check.at, data: DATA, asOf: R.asOf, tl: R.tl, sealFrom: SEAL_FROM, months: cand, check};
if (OUT) { const t = OUT + '.tmp' + process.pid; fs.writeFileSync(t, JSON.stringify(body, null, 1) + '\n'); fs.renameSync(t, OUT); }
console.log(`셈 셋이 같음 — 달 ${cand.length} · 모은 기록 ${tR.h}/${tR.n} · 오늘 ${E.asOf} ${E.today?.rule?.id ?? '-'} ${rowsE.length}곳${OUT ? ' · 새 판 ' + OUT : ''}`);
