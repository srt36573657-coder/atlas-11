#!/usr/bin/env node
// 모든 쪽 검사 일 나누기 — atlas11-next-full.yml 의 plan 이 부름(2026-10-18 고도리 길 1 · C1 · 사장님 10:09 「속도를 지금보다 10배 빠르게」)
//   쪽마다 걸린 초(아래 COST · 깃허브 실측)로 몫 수와 작업 묶음을 정함 — 동시 P 대(local 20 · live 10)에서 긴 작업부터 돌 때 끝나는 때(어림)가 가장 이른 나눔 · 작업은 20개까지
//   · 몫으로 나눌 수 있는 검사(--shard k/n): en(next_en_check) · co · range · past · grow — 몫 하나 = 작업 하나(이름 = 쪽 이름 + 번호 · 예 co2 — 옛 쪽 기준값 캐시가 이어짐)
//   · 나머지 쪽은 목표 초 안에서 큰 것부터 한 작업에 묶음(이름 = 쪽 이름을 - 로 이음 · 같은 쪽 묶음이면 같은 이름)
//   · 모르는 새 쪽(COST 에 없음)은 제 작업 하나 · 맨 앞(길이를 모르니 일찍 시작)
//   · 몫 수를 손으로: en_shards(영어) · split(예 co=2,past=3 · 1 이면 안 나눔) — 나머지는 셈으로 정함
//   쓰는 법(깃허브 밖 시험): node scripts/atlas11/next/shard/plan.mjs [--local] [--pages co,en] [--en 12] [--split co=2,past=3] [--par 20]
//   깃허브: env WANT · LOCAL(true/false) · NS · SPLIT · PAR → GITHUB_OUTPUT 에 list(작업 · 쪽 · 몫) · split(몫 수) · shards(영어 몫 수) · est(어림 초)
//   2026-11-05(주문 1023) — 작업 하나가 검사 J 개(local 3 · live 1)를 함께 돎: pages = 「쪽」 또는 「몫 이름@쪽@k/n」 을 빈칸으로 이은 것(워크플로가 혼자 쪽 SOLO 먼저 · 나머지 J 개씩)
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
/** 검사 초(쪽 하나를 한 번에 다 돌 때 · 브라우저 · 자료 받기 포함 · 몫이면 몫 초를 모두 더한 것) — 깃허브 실측
 *  local: 2026-10-18 39092369729(옛 쪽 기준값 없이 · en 11 몫 2,370 · past 2 몫 402 · co 2 몫 243) + 39091891146(range 2 몫 165) — 쪽 검사가 자라면(새 검사 칸) 여기를 새로 잼
 *  live: 2026-10-17 39044543448 + co · range 는 local 에서 늘어난 만큼 더함(새 검사 칸은 화면 안 셈이라 사이트 빠르기와 상관없음) */
export const COST = { // local 은 2026-11-05 41949468910 로 새로 잼(주문 1023 — 전에 없던 쪽 열하나가 「모르는 쪽」이라 작업 하나씩 차지하던 것)
  local: {en: 2535, past: 405, co: 278, roman: 243, chx: 186, gift: 174, range: 160, theme: 155, grow: 139, gdr: 127, kakao: 123, next: 113, share: 112, sage: 102,
    hold: 79, why11: 68, white: 67, why: 53, rivals: 51, misc: 47, su: 47, cond: 45, jinhwa: 43, help: 17, essence: 8},
  live: {en: 3217, co: 742, past: 629, grow: 607, range: 531, next: 321, rivals: 292, chx: 182, misc: 57, share: 56, why: 46, cond: 39, gdr: 26, hold: 15},
}; // 달력(cal) · 급등(surge) · 오늘 시장(today) 쪽 검사는 쪽을 닫아 지움(주문 1114-1306)
export const SPLITTABLE = ['en', 'co', 'range', 'past', 'grow'];
const START = {local: 5, live: 8}; // 검사 하나를 띄우는 초(노드 · 브라우저 · 자료) — 몫마다 한 번씩 더 듦
const SETUP = {local: 78, live: 32}; // 작업마다 준비 초(저장소 받기 · 브라우저 · local 은 묶고 띄우기 — local 2026-11-05 실측 75 ~ 80)
const UNKNOWN = {local: 150, live: 300}; // COST 에 없는 쪽 — 어림만
const MAXN = 20;
/** 한 작업 안에서 함께 도는 검사 수 — 사장님 2026-11-05 04:42(+03) 「속도를 지금 보다 5배 빠르게 하는 방법 찾아서 작업을 하라」(주문 1023 [0])
 *  깃허브 공개 저장소 실행기는 4코어인데 검사가 하나씩 돌아 한 코어만 씀 → local 은 셋씩 함께(쪽 묶음은 쪽마다 · 나눌 수 있는 쪽은 작업마다 몫 셋으로)
 *  live 는 하나 그대로(실제 사이트를 한꺼번에 두드리면 「자료를 못 받음」이 남 — 아래 page 의 max-parallel 6 과 같은 까닭) */
export const PAR_IN = Object.freeze({local: 3, live: 1});
/** 셋씩 함께 돌 때 쪽마다 느려지는 배수 = 함께 돈 초 ÷ 혼자 돈 초(2026-11-05 41954062442 ÷ 41949468910 실측 · 주문 1042) — 모르는 쪽은 1.6
 *  en 은 기다림이 많아 셋이 함께여도 그대로(1.0) · gdr · rivals · misc 는 화면 셈이 무거워 두 배 가까이 → 무거운 쪽은 혼자 한 작업에 두게 됨 */
export const SLOW = Object.freeze({en: 1, past: 1.5, co: 1.43, range: 1.8, grow: 1.4, gdr: 1.76, chx: 1.05, gift: 1.02, theme: 1.07, essence: 1, kakao: 1.28, help: 1.1, next: 1.16,
  share: 1, sage: 1.09, hold: 1, why11: 1, why: 1, rivals: 2.27, misc: 2.28, cond: 1.42, jinhwa: 1.23, roman: 1, su: 1, white: 1});
/** 느린 휴대폰 흉내로 시간을 재는 검사(check_su · check_white) — 함께 돌면 잰 시간이 늘어 틀리게 걸림 → 작업 안에서 혼자 먼저 돎(워크플로 SOLO 와 같게) */
export const SOLO = Object.freeze(['su', 'white']);

/** 쪽 이름 — next · en · check_<이름>.mjs(check_changed 는 쪽 검사 아님) */
export function pageNames(dir = DIR) {
  const all = fs.readdirSync(dir).map(f => (/^check_([a-z0-9]+)\.mjs$/.exec(f) || [])[1]).filter(n => n && n !== 'changed').sort();
  return [...new Set(['next', 'en', ...all])];
}
/** 'co=2,past=3' → {co: 2, past: 3} */
export const parseSplit = s => Object.fromEntries(String(s || '').split(',').map(x => x.trim()).filter(Boolean).map(x => x.split('=')).filter(([k, v]) => /^[a-z0-9]+$/.test(k ?? '') && /^\d+$/.test(v ?? '')).map(([k, v]) => [k, Math.min(MAXN, Math.max(1, +v))]));

/**
 * @param {{names: string[], local: boolean, en?: number|null, split?: Record<string, number>, par?: number, maxJobs?: number}} o
 * @returns {{jobs: {job: string, pages: string, base: string, shard: string, cost: number}[], split: Record<string, number>, est: number, T: number, warn: string}}
 */
export function makePlan({names, local, en = null, split = {}, par = local ? 20 : 10, maxJobs = 20, J = local ? PAR_IN.local : PAR_IN.live}) {
  const mode = local ? 'local' : 'live', s = START[mode], setup = SETUP[mode];
  const known = n => COST[mode][n] != null, C = n => COST[mode][n] ?? UNKNOWN[mode];
  const f = n => (J > 1 ? SLOW[n] ?? 1.6 : 1); // 함께 돌 때 느려지는 배수(J 가 하나면 1)
  const force = {...split, ...(en ? {en} : {})}; // 손으로 준 몫 수 = 그 쪽에 쓸 작업 수(작업마다 몫 J 개)
  /** 쪽 묶음 하나가 걸리는 초 — 쪽 하나면 혼자(느려짐 없음) · 혼자 쪽(SOLO)끼리는 차례로 · 나머지는 J 칸에 긴 것부터 넣은 끝나는 때(느려짐 배수 곱함) */
  const binTime = pages => {
    if (pages.length === 1) return C(pages[0]);
    const so = pages.filter(p => SOLO.includes(p)), rest = pages.filter(p => !SOLO.includes(p)).map(p => C(p) * f(p)).sort((a, b) => b - a);
    const slot = new Array(Math.max(1, J)).fill(0); for (const t of rest) { let i = 0; for (let q = 1; q < slot.length; q++) if (slot[q] < slot[i]) i = q; slot[i] += t; }
    return so.reduce((a, p) => a + C(p), 0) + (rest.length ? Math.max(...slot) : 0);
  };
  const fits = (b, n) => (SOLO.includes(n) ? b.pages.every(p => SOLO.includes(p)) : !b.pages.some(p => SOLO.includes(p))); // 혼자 쪽은 혼자 쪽끼리만(다른 검사와 한 작업에 두지 않음)
  let best = null, fewest = null;
  for (let T = 40; T <= 4000; T += 5) { // 목표 초 — 몫 · 묶음이 이 안에 들게
    const N = {}; // 쪽마다 작업 수 — 나눌 수 있는 쪽은 작업 N 개 × 몫 J 개(작업 하나가 몫 J 개를 함께 돎)
    for (const n of names) N[n] = SPLITTABLE.includes(n) ? Math.min(MAXN, Math.max(1, force[n] ?? Math.ceil((C(n) - s) * f(n) / J / Math.max(1, T - s * f(n))))) : 1;
    const jobs = [];
    for (const n of names) {
      const P = N[n] * J; if (!SPLITTABLE.includes(n) || P < 2) continue;
      for (let k = 1; k <= N[n]; k++) {
        const toks = Array.from({length: J}, (_, j) => { const i = (k - 1) * J + j + 1; return `${n}${i}@${n}@${i}/${P}`; }); // 몫 이름@쪽@k/n — 몫마다 결과 파일 이름 = 몫 이름(gather 가 1 ~ P 를 합침)
        jobs.push({job: n + k, pages: toks.join(' '), base: n, shard: '', cost: Math.ceil(((C(n) - s) / (N[n] * J) + s) * f(n))}); // 몫 J 개가 함께 — 몫 하나 초 × 느려짐
      }
    }
    const whole = n => !SPLITTABLE.includes(n) || N[n] * J < 2;
    const bins = [];
    for (const n of names.filter(n => whole(n) && known(n)).sort((a, b) => C(b) - C(a) || (a < b ? -1 : 1))) {
      const b = bins.find(b => fits(b, n) && binTime([...b.pages, n]) <= T); if (b) { b.pages.push(n); b.cost = Math.ceil(binTime(b.pages)); } else bins.push({pages: [n], cost: C(n)});
    }
    for (const b of bins) jobs.push({job: b.pages.join('-'), pages: b.pages.join(' '), base: '', shard: '', cost: b.cost});
    const unknown = names.filter(n => whole(n) && !known(n)).map(n => ({job: n, pages: n, base: '', shard: '', cost: C(n)}));
    const order = [...unknown, ...jobs.sort((a, b) => b.cost - a.cost || (a.job < b.job ? -1 : 1))]; // 긴 일부터(깃허브는 이 차례로 시작) · 모르는 쪽은 맨 앞
    const slot = new Array(Math.max(1, par)).fill(0);
    for (const j of order) { let i = 0; for (let q = 1; q < slot.length; q++) if (slot[q] < slot[i]) i = q; slot[i] += setup + j.cost; }
    const cand = {T, est: Math.max(...slot), jobs: order, split: Object.fromEntries(Object.entries(N).filter(([n, v]) => SPLITTABLE.includes(n) && v * J > 1).map(([n, v]) => [n, v * J]))}; // 쪽마다 몫 수(작업 수 × J) — gather 가 몫 1 ~ 이 수를 합침
    if (!fewest || order.length < fewest.jobs.length) fewest = cand;
    if (order.length > maxJobs) continue;
    if (!best || cand.est < best.est || (cand.est === best.est && order.length < best.jobs.length)) best = cand;
  }
  const pick = best ?? fewest;
  return {...pick, jobs: pick.jobs.map(({job, pages, base, shard, cost}) => ({job, pages, base, shard, cost})), warn: best ? '' : `작업 ${fewest.jobs.length}개 — ${maxJobs}개 넘음(손으로 준 몫 수 때문)`};
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  const argv = process.argv.slice(2), arg = (k, d) => { const i = argv.indexOf(k); return i >= 0 && argv[i + 1] != null ? argv[i + 1] : d; };
  const gh = !!process.env.GITHUB_OUTPUT;
  const local = gh ? process.env.LOCAL === 'true' || process.env.LOCAL === '1' : argv.includes('--local');
  const want = (gh ? process.env.WANT : arg('--pages', '') ?? '').split(',').map(x => x.trim()).filter(Boolean);
  const enN = parseInt(gh ? process.env.NS : arg('--en', ''), 10) || null;
  const split = parseSplit(gh ? process.env.SPLIT : arg('--split', ''));
  const par = parseInt(gh ? process.env.PAR : arg('--par', ''), 10) || (local ? 20 : 10);
  const names = pageNames().filter(n => !want.length || want.includes(n));
  const p = makePlan({names, local, en: enN, split, par});
  const list = p.jobs.map(({job, pages, base, shard}) => ({job, pages, base, shard}));
  if (gh) fs.appendFileSync(process.env.GITHUB_OUTPUT, `list=${JSON.stringify(list)}\nsplit=${JSON.stringify(p.split)}\nshards=${p.split.en ?? 1}\nest=${p.est}\n`);
  console.log(`${local ? 'local' : 'live'} · 동시 ${par} · 작업 ${list.length}개 · 몫 ${JSON.stringify(p.split)} · 목표 ${p.T}초 · 끝나는 때 어림 ${p.est}초(준비 포함 · 계획 · 모으기 빼고)${p.warn ? ' · ' + p.warn : ''}`);
  for (const j of p.jobs) console.log(`  ${j.job.padEnd(24)} ${String(j.cost).padStart(5)}초  ${j.pages}`);
}
