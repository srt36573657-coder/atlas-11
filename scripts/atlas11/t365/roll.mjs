// 새 ATLAS 회차(하루 4번) — 사장님 2026-10-11 09:37 「기준일을 항상 현재 날짜에서 지난 20일 거래로 하라 … 항상 그렇게 하라」
//   12:41 「아니 내일이면 내일 다시 그다음날도 다시 기준은 항상 오늘날짜로 해야 하고 업데이트는 하루에 4번 해야 하고 업데이트 탭 만들어서 기록해놓아라」
//   올리기 묶음(scripts/atlas11/package.mjs)이 site/ 를 dist/ 로 옮긴 바로 뒤에 부른다 — 하루 4번(10:00 · 12:00 · 14:00 · 18:00 서울 · Claude 예약 작업이 1분 앞에 「aaa7377.com 올리기」를 누름 ·
//   2026-10-12 12:41 「10시 12시 14시 18시 업데이틀 하라」 — 그 전은 08:10 · 12:10 · 16:10 · 21:10 · 회차 이름 목록은 universe.json slots) ·
//   평일 16:47 · 19:00 예약 올리기 · 손 올리기가 모두 이 길을 지남(예약 작업 파일 atlas11-daily.yml · atlas11-evening.yml 은 고치지 않음 — 규칙 7)
//   ① 깃허브 실행기면 후보 모두(모음 회사 모두 · 2026-10-14 08:41 「가」부터 전 종목) 일봉(종가 · 거래량)을 이어 받는다(closes_fetch.mjs → 임시 폴더 · 모음 뒤 날을 한 번에 받으므로 지난 파일이 필요 없음)
//   ② dump.mjs → ml.py --closes(멍거 · 린치 조건 ml-v1 · 사장님 2026-10-14 06:05 「가」 — 모음 결산 · 모음 날 값만으로 고름 · 같은 모음이면 회차마다 같은 곳 ·
//      새 결산이 담긴 모음이 들어와야 바뀜) → organize.mjs → ml_verify.mjs(노드로 따로 · 틀림 0) · 옛 mg-v1 = munger.py · munger_verify.mjs 는 멍거 갈래로 그대로
//      (옛 h365-v1 = h365.py · h365_verify.mjs · 옛 d365-v2 = daese.py · daese_verify.mjs 는 기록 · 봉인 1호 다시 셈에 그대로 둠)
//   ③ site_build.py(ATLAS_T365_CLOSES · ATLAS_D365_DIR) → site_verify.mjs(틀림 0) → range_mc.py(7단 범위 · 같은 값이면 지금 사이트 범위를 그대로 씀) → range_verify.mjs(틀림 0) — 36곳은 2026-10-13 06:45 「매수 검토 36곳 영구 삭제 하라」로 지움
//   ④ 모두 통과하면 dist/atlas/data 를 바꿈 · 하나라도 멈추면 지금 사이트(aaa7377.com)의 자료를 그대로 받아 올림(옛 바탕으로 돌아가지 않게) · 그것도 못 하면 저장소 바탕 그대로
//   ⑤ 회차 기록: reports/atlas11/t365/updates/<받은 때 UTC>.json(새 파일 · 지우지 않음) + 화면 「업데이트」 탭 자료 dist/atlas/data/updates.json(마지막 60회차)
//   ⑤-2 첫 화면 종합 정보(2026-10-12 14:54 · market_fetch.mjs → home_build.mjs → 자료 home.json)
//   ⑥ 시장 판독(2026-10-12 12:41 「시장을 판독해서」 · market_read.mjs — 지난 사실만 · 판독 규칙 mr-v1) · 네 눈 점검(같은 날 「업데이트 할때마다 아틀란스 점검을
//      애플 구글 클로드 cia방식으로 각각 1000만번씩」 · inspect4.mjs — 새 자료 + 화면 코드를 눈마다 ATLAS_INSPECT_N 번(기본 111) · 하나라도 걸리면 ④처럼 새 자료를 올리지 않음)
//      기록: 회차 기록의 market · inspect(짧은 꼴) + 깃허브 실행기면 reports/atlas11/t365/inspect/<받은 때>.json(전부 · 새 파일)
//   결과는 통과로 꾸미지 않음 — 「바꿈」 · 「그대로」(새 값 없음) · 「실패」(까닭) 가운데 하나
import fs from 'node:fs/promises';
import fss from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import crypto from 'node:crypto';
import {spawnSync} from 'node:child_process';
import {readMarket} from './market_read.mjs';
import {inspectBrief} from './inspect4.mjs';

const ACT = JSON.parse(fss.readFileSync(new URL('./universe.json', import.meta.url), 'utf8'));
export const BUNDLE_NOW = [ACT.bundle, ACT.asOf]; // 고를 때 · 회사 이름 · 몸값 · 결산(모음 날 값)
export const UPDATES_DIR = 'reports/atlas11/t365/updates';
const SITE = process.env.ATLAS_SITE_URL || 'https://aaa7377.com';
const DATA_FILES = ['core.json', 'comp.json', 'lines.json', 'names.json', 'days.json', 'range.json', 'mkt.json']; // mkt.json = 모든 회사(2026-10-14 「나」 — 업종 화면 회사 줄)
const OPT_FILES = ['time.json', 'grow.json', 'home.json', 'surge.json', 'surgecal.json', 'surgetr.json', 'surgetr-case.json']; // 봉인 시간 자료(14:37 · 14:39 「3년후 5년후 10년후 이야기」) · 회사 성장 이야기 요약(16:51) · 첫 화면 종합 정보(2026-10-12 14:54) · 급등 탭(2026-10-15 14:27 · 규칙 69) — 올리기 전 사이트엔 없을 수 있음 · 못 받으면 지금 묶음의 것을 그대로
// 급등 탭(사장님 2026-10-15 14:27(싱가포르) 「탭을 하나 더 만들어라 … 최근 5일에 급등한 종목을 36개 모아높는곳이다 기준은 cia라면 어떻게 할것인지 에이전트 총 사용해서 하고
//   하루에 4번 업데이트할때미다 그때 선택도 하고 탈락도 시켜라」 · 규칙 69) — 고른 판 기록은 새 파일만(reports/atlas11/t365/surge/<UTC>.json · 올라간 고르기만)
export const SURGE_DIR = 'reports/atlas11/t365/surge';
export const SURGECAL_LATEST = 'reports/atlas11/t365/surgecal-latest.json'; // 달력 · 따라가기(sk-v1) 마지막 판 — 올라간 고르기 때마다 덮어씀(업데이트 밖 올림이 그대로 씀)
/** 지난 급등 고르기 기록(올라간 것만 · 새 파일만 쌓임) — 이름 차례 */
export function readSurge(dir) {
  if (!dir || !fss.existsSync(dir)) return [];
  return fss.readdirSync(dir).filter(f => /^\d{8}T\d{6}Z\.json$/.test(f)).sort().map(f => { try { return JSON.parse(fss.readFileSync(path.join(dir, f), 'utf8')); } catch { return null; } }).filter(r => r?.payload?.schema === 'atlas-new-surge-1');
}
/** 급등 탭 들고 난 자취(최근 28번 고르기) — 화면 그림 · 업데이트 탭이 읽음 */
export const surgeHist = recs => recs.slice(-28).map(r => ({at: r.at, kst: r.kst, slot: r.slot ?? null, kind: r.kind, n: r.payload.n, in: r.payload.in?.length ?? 0, out: r.payload.out?.length ?? 0, asOf: r.payload.asOf, provisional: !!r.payload.provisional}));
/** 업데이트 때가 아닌 올림(손 올리기 · 종가 올리기 · 미국 판 올리기) — 앞에 고른 그대로(값도 그때 값) · 목록은 하루 4번 업데이트 때만 바뀜 */
export const surgeCarry = (last, recs, why = null) => ({...last.payload, hist: surgeHist(recs), carry: {from: last.at, fromKst: last.kst, fromSlot: last.slot ?? null, why}});
/** 앞 상태 — 마지막 기록의 상태 + 기록들의 사건(evNow) · 따라가기 시작(trackNew)을 이어 붙임(기록 파일엔 그 업데이트 몫만 · 크기를 늘리지 않으려고 · 결정표 v3) */
export function surgePrevState(recs) {
  const last = recs.at(-1); if (!last) return null;
  const st = {...(last.state ?? {})}; delete st.evNow; delete st.trackNew;
  st.events = recs.flatMap(r => r.state?.evNow ?? []);
  st.track = {}; for (const r of recs) for (const [c, v] of Object.entries(r.state?.trackNew ?? {})) st.track[c] = v; // 뒤 기록이 이김 — 25거래일 밖으로 내린 곳이 다시 들면 새 시작(surge.py 가 창 밖은 내림)
  return st;
}
/** 기록에 남길 상태 — 전체 사건 · 따라가기 목록은 빼고 그 업데이트 몫(evNow · trackNew)만 */
export const surgeRecState = st => { const o = {...st}; delete o.events; delete o.track; return o; };
/** 폴더 안 일봉 파일 지문(이름 차례 · 이름 + 내용) — 나중에 「그때 무엇으로 셌나」를 맞대 보려고 */
export function filesDigest(dir) {
  try { const h = crypto.createHash('sha256'); for (const f of fss.readdirSync(dir).filter(x => x.endsWith('.json.gz')).sort()) { h.update(f); h.update(fss.readFileSync(path.join(dir, f))); } return h.digest('hex').slice(0, 16); } catch { return null; }
}

async function copyAll(from, to) {
  await fs.mkdir(to, {recursive: true});
  for (const e of await fs.readdir(from, {withFileTypes: true})) {
    const a = path.join(from, e.name), b = path.join(to, e.name);
    if (e.isDirectory()) await copyAll(a, b); else await fs.copyFile(a, b);
  }
}
const kstOf = d => new Date(d.getTime() + 9 * 36e5).toISOString().replace('T', ' ').slice(0, 16); // 2026-10-12 16:10
/** 하루 4번 회차 이름(08:10 …) — 그 시각 5분 앞 ~ 50분 뒤에 시작했으면 그 회차 · 아니면 null(종가 올리기 · 손 올리기 등)
 *  (2026-10-11 15:52 손 올리기가 20분 앞이라 「16:10 회차」로 적힌 일 — 그 기록은 그대로 두고 창을 5분 앞으로 좁힘) */
/** 기록에 적을 회차 이름 — 손 올리기(까닭 글에 「회차」가 없음)는 회차 창 안이라도 회차로 적지 않음
 *  (2026-10-11 21:57 손 올리기 「앞으로 클까? …」가 「21:10 회차」로 한 번 더 적힌 일 — 그 기록은 그대로 둠) */
export const slotFor = (kst, reason = '') => (String(reason).trim() && !/회차/.test(reason) ? null : slotOf(kst));
export const slotOf = kst => { const m = +kst.slice(11, 13) * 60 + +kst.slice(14, 16); const s = (ACT.slots ?? []).map(x => [x, +x.slice(0, 2) * 60 + +x.slice(3, 5)]).find(([, t]) => m >= t - 5 && m <= t + 50); return s ? s[0] : null; };

/** 지난 회차 기록(새 파일만 쌓임) — 이름 차례 */
export function readRecords(root) {
  const dir = path.join(root, UPDATES_DIR);
  if (!fss.existsSync(dir)) return [];
  return fss.readdirSync(dir).filter(f => /^\d{8}T\d{6}Z\.json$/.test(f)).sort().map(f => { try { return JSON.parse(fss.readFileSync(path.join(dir, f), 'utf8')); } catch { return null; } }).filter(Boolean);
}
/** 옛 손 올리기 까닭 글 속 화면 단 이름(그 뒤 바뀜) — 기록 파일은 그대로 두고 업데이트 탭에만 지금 이름을 덧붙여 보임
 *  (2026-10-12 화면 돌기를 올리는 묶음 dist 로 돌리자 10-11 19:57 손 올리기 까닭 「4단 앞으로 클까?」가 걸림 — 그 뒤 7단에서 6단) */
const SHOW_OLD = [['달 속 공주님', '달 속 그림(옛 그림 · 지움)'] /* 2026-10-13 03:38 「모든 흔적 다 지워」 — 지운 옛 그림 이름(10-12 11:14 손 올리기 까닭) · 영어 팩에도 그 이름 열쇠를 두지 않음(얼굴 문 시험) */, ['4단 앞으로 클까?', '앞으로 클까?(그때 4단 · 지금 6단)'], ['36곳 탭 영구 삭제', '아래 탭 하나 영구 삭제(사장님 06:45)'], ['365곳을 대세 365곳으로 바꿈', '365곳을 옛 규칙(대세 업종) 365곳으로 바꿈'], ['365곳 새 기준 — 힘 붙은 365곳', '365곳 새 기준 — 옛 규칙(힘 붙음) 365곳']]; // 넷째: 2026-10-14 00:03 「가 로 하자」(멍거 조건) 뒤 힘 붙은 365곳도 옛 규칙 꼬리표로만 // 셋째: 2026-10-13 13:04 「힘이 붙는 종목으로」 뒤 옛 기준 이름은 「옛 규칙(대세 업종)」 꼬리표로만(기록 파일은 그대로) // 둘째: 08:22 올리기 까닭 칸에 지운 탭 이름을 적은 것 — 기록 파일은 그대로 · 화면만(규칙 55 · 틀림 장부 20번)
export const showReason = s => SHOW_OLD.reduce((t, [a, b]) => t.split(a).join(b), String(s));
/** 화면 「업데이트」 탭 자료 — 새 회차가 위 · 365곳 목록은 빼고 들고 난 이름만 */
// 업데이트 탭: 까닭이 회차가 아니면(손 올리기) 회차 이름 없이 보임 — 옛 기록 파일은 그대로(클로드팀 2026-10-12: 15:52 · 21:57 손 올리기가 16:10 · 21:10 회차로 두 번 보이던 것)
export function tabData(records) {
  // 회차 이름은 그 회차가 적은 것 그대로(2026-10-12 12:41 회차 시각을 바꿈 — 옛 08:10 · 16:10 기록이 새 시각표로 다시 매겨지지 않게) · 손 올리기만 회차 이름을 지움
  const rows = records.slice(-60).reverse().map(r => ({at: r.at, kst: r.kst, slot: r.reason && !/회차/.test(r.reason) ? null : r.slot, reason: r.reason ? showReason(r.reason) : null, result: r.result, why: r.why || null,
    asOf: r.asOf, base: r.base, provisional: r.provisional, version: r.version, in: r.in ?? [], out: r.out ?? [], all: r.all ?? null, top: r.top ?? null,
    // 그대로 남은 수 · 든 까닭(h365-v1 기록만 · 멍거 조건 mg-v1 은 없음) · 기준이 바뀐 회차 — 옛 기록(d365)의 층 칸은 싣지 않음(기록 파일은 그대로)
    stay: r.stay ?? (Array.isArray(r.members) ? r.members.length - (r.in?.length ?? 0) : null), kinds: r.kinds ?? null, ruleChanged: r.ruleChanged ?? false, prevVersion: r.prevVersion ?? null,
    served: r.served, // 옛 기록의 36곳 칸은 화면 자료에 싣지 않음(2026-10-13 06:45 「매수 검토 36곳 영구 삭제 하라」 · 기록 파일은 그대로)
    market: r.market ? {asOf: r.market.asOf, provisional: r.market.provisional, lines: r.market.lines, day: r.market.day && {up: r.market.day.up, down: r.market.day.down, word: r.market.day.word}, size: r.market.span?.size ?? null} : null,
    // 급등 탭(규칙 69) — 그 회차에 고른 판(들고 난 이름) · 그대로 둔 판 · 멈춘 까닭
    surge: r.surge ? {kind: r.surge.kind, n: r.surge.n ?? null, in: r.surge.in ?? [], out: r.surge.out ?? [], published: r.surge.published ?? null, why: r.surge.why ?? null, fromKst: r.surge.fromKst ?? null,
      bands: r.surge.bands ? {kind: r.surge.bands.kind, n: r.surge.bands.n, in: r.surge.bands.in, out: r.surge.bands.out, move: r.surge.bands.move} : null} : null, // 네 칸(16:28 · 16:34) — 업데이트마다 든 · 빠짐 · 옮김 수
    inspect: r.inspect ? {nEach: r.inspect.nEach, fail: r.inspect.fail, lenses: r.inspect.lenses.map(l => ({key: l.key, name: l.name, n: l.n, fail: l.fail}))} : null}));
  return {schema: 'atlas-new-updates-1', made: new Date().toISOString(), slots: ACT.slots ?? [], n: records.length, records: rows};
}
async function getLive(file) { // 지금 사이트의 자료 한 벌(회차가 막혔을 때 옛 바탕으로 돌아가지 않게)
  const ac = new AbortController(), t = setTimeout(() => ac.abort(), 20000);
  try { const r = await fetch(`${SITE}/atlas/data/${file}`, {signal: ac.signal, headers: {'cache-control': 'no-cache'}}); if (!r.ok) throw Error(`${file} ${r.status}`); return Buffer.from(await r.arrayBuffer()); } finally { clearTimeout(t); }
}
async function mirrorLive(target) {
  const stage = target + '.live';
  await fs.rm(stage, {recursive: true, force: true}); await fs.mkdir(path.join(stage, 'co'), {recursive: true});
  for (const f of DATA_FILES) await fs.writeFile(path.join(stage, f), await getLive(f));
  for (const f of OPT_FILES) { try { await fs.writeFile(path.join(stage, f), await getLive(f)); } catch { try { await fs.copyFile(path.join(target, f), path.join(stage, f)); } catch { /* 없으면 없음 */ } } }
  const comp = JSON.parse(await fs.readFile(path.join(stage, 'comp.json'), 'utf8')).companies, codes = Object.keys(comp);
  let next = 0; const work = async () => { while (next < codes.length) { const c = codes[next++]; await fs.writeFile(path.join(stage, 'co', c + '.json'), await getLive(`co/${c}.json`)); } };
  await Promise.all([work(), work(), work(), work(), work(), work()]);
  await fs.rm(target, {recursive: true, force: true}); await fs.rename(stage, target);
}

export async function rollAtlas({root, dist, log = console.log, closesDir = null, recordDir = undefined, reason = process.env.ATLAS_UPDATE_REASON || '', liveFallback = undefined, now = new Date(), rangeQuick = false} = {}) {
  const ci = process.env.GITHUB_ACTIONS === 'true';
  const recDir = recordDir === undefined ? (ci && !closesDir ? path.join(root, UPDATES_DIR) : null) : recordDir;
  const useLive = liveFallback === undefined ? (ci && !closesDir) : liveFallback;
  const kst = kstOf(now);
  const rep = {schema: 'atlas-t365-update-1', at: now.toISOString(), kst, slot: slotFor(kst, reason), reason, ci, version: ACT.version, result: null, served: 'stored', why: null,
    fetch: null, asOf: null, base: null, provisional: null, roll: null, digest: null, members: null, in: null, out: null, counts: null, tiers: null, kinds: null, stay: null, ruleChanged: null, prevVersion: null, buffer: null,
    all: null, top: null, range: null, market: null, inspect: null, home: null, homeFetch: null, surge: null, cal: null, verify: {}, steps: []};
  const surgeDir = recDir ? path.join(path.dirname(recDir), 'surge') : path.join(root, SURGE_DIR); // 급등 고르기 기록(규칙 69) — 깃허브 실행기 = reports/atlas11/t365/surge · 시험 = 임시 폴더
  const sRecs = readSurge(surgeDir), sLast = sRecs.at(-1) ?? null;
  let surgeOut = null, surgeCal = null; // 이번에 고른 급등 판(올라가면 기록 파일로) · 그 달력 글
  const surgeCalLatest = recDir ? path.join(path.dirname(recDir), 'surgecal-latest.json') : path.join(root, SURGECAL_LATEST);
  const N4 = Math.max(1, +(process.env.ATLAS_INSPECT_N || 111)); // 네 눈 점검 — 눈마다 번 수(사장님 2026-10-18 23시(서울) 「111번으로 바꿔라」 · 옛 1000만번에서 줄임)
  let inspectFull = null;
  /** 네 눈 점검 — dataDir 자료 + dist 화면 코드 · 끝나지 못하면 throw · 걸린 것이 있으면 결과를 남기고 false */
  const inspectRun = (dataDir, market) => {
    const box = fss.mkdtempSync(path.join(os.tmpdir(), 'atlas-i4-')), mf = path.join(box, 'market.json'), of = path.join(box, 'inspect.json');
    try {
      fss.writeFileSync(mf, JSON.stringify(market ?? null));
      const t0 = Date.now(), r = spawnSync('node', ['scripts/atlas11/t365/inspect4.mjs', '--site', dist, '--data', dataDir, '--market', mf, '--n', String(N4), '--now', now.toISOString(), '--out', of], {cwd: root, encoding: 'utf8', timeout: 1500000, maxBuffer: 64 << 20});
      rep.steps.push({name: '네 눈 점검', code: r.status, sec: Math.round((Date.now() - t0) / 100) / 10});
      let full = null; try { full = JSON.parse(fss.readFileSync(of, 'utf8')); } catch { /* 아래 */ }
      if (!full) throw Error('네 눈 점검이 끝나지 못함: ' + tail(r.stderr || r.stdout || r.error?.message));
      inspectFull = full; rep.inspect = inspectBrief(full);
      return full.ok;
    } finally { fss.rmSync(box, {recursive: true, force: true}); }
  };
  const failLine = () => rep.inspect.lenses.filter(l => l.fail).map(l => `${l.name} ${l.fail}건(${l.first[0] ?? '-'})`).join(' · ');
  const tail = s => String(s ?? '').trim().split('\n').slice(-2).join(' | ').slice(0, 500);
  const run = (name, cmd, args, env = {}, timeout = 600000) => {
    const t0 = Date.now(), r = spawnSync(cmd, args, {cwd: root, env: {...process.env, ...env}, encoding: 'utf8', timeout, maxBuffer: 256 << 20});
    rep.steps.push({name, code: r.status, sec: Math.round((Date.now() - t0) / 100) / 10});
    if (r.status !== 0) throw Error(`${name} 멈춤: ` + tail(r.stderr || r.stdout || r.error?.message));
    return r;
  };
  const target = path.join(dist, 'atlas/data');
  const prevAll = readRecords(root), prev = [...prevAll].reverse().find(r => r.members?.length && r.result !== '실패') ?? null;
  let tmp = null;
  try {
    tmp = await fs.mkdtemp(path.join(os.tmpdir(), 'atlas-roll-'));
    let closes = closesDir;
    if (!closes && ci && process.env.ATLAS_T365_FETCH !== '0') {
      closes = path.join(tmp, 'closes');
      const t0 = Date.now(), r = spawnSync('node', ['scripts/atlas11/t365/closes_fetch.mjs', '--out', closes], {cwd: root, encoding: 'utf8', timeout: 540000, maxBuffer: 64 << 20});
      rep.steps.push({name: '일봉 받기', code: r.status, sec: Math.round((Date.now() - t0) / 100) / 10});
      try { rep.fetch = JSON.parse(String(r.stdout).trim().split('\n').at(-1)); } catch { rep.fetch = {code: r.status, err: tail(r.stderr)}; }
      if (r.status !== 0) throw Error('일봉을 한 곳도 못 받음: ' + tail(r.stderr || r.stdout));
    }
    if (!closes || !fss.existsSync(closes) || !fss.readdirSync(closes).some(f => f.endsWith('.json.gz'))) { rep.result = '그대로'; rep.why = '이어 받은 일봉 없음 — 저장된 자료 그대로'; return await done(); }
    const env = {ATLAS_T365_CLOSES: closes};
    const now0 = path.join(tmp, 'now.json'), upd = path.join(tmp, 'pick'), out = path.join(tmp, 'data');
    run('후보 표', 'node', ['scripts/atlas11/t365/dump.mjs', BUNDLE_NOW[0], now0, BUNDLE_NOW[1]]);
    await fs.mkdir(upd, {recursive: true});
    // 멍거 · 린치 조건(ml-v1) — 모음 결산 · 모음 날 값만 · 앞 회차 기록 · 회차 날 값은 고르는 데 안 씀(사장님 2026-10-14 06:05 「가」 · 같은 모음이면 회차마다 같은 곳)
    run('바탕 회사 고르기(멍거 · 린치 조건)', 'python3', ['scripts/atlas11/t365/ml.py', now0, upd, '--closes', closes]);
    run('업종 정리', 'node', ['scripts/atlas11/t365/organize.mjs', now0, path.join(upd, 'proposal.json'), upd]);
    const dv = run('고르기 따로 세기', 'node', ['scripts/atlas11/t365/ml_verify.mjs', now0, path.join(upd, 'proposal.json'), path.join(tmp, 'mv.json')], env);
    rep.verify.pick = tail(dv.stdout);
    const env2 = {...env, ATLAS_D365_DIR: upd};
    run('사이트 자료', 'python3', ['scripts/atlas11/t365/site_build.py', now0, out], env2);
    const sv = run('사이트 자료 따로 세기', 'node', ['scripts/atlas11/t365/site_verify.mjs', out, path.join(tmp, 'sv.json')], env2);
    rep.verify.site = tail(sv.stdout);
    // 7단 범위 — 같은 회사 · 같은 값이면 지금 사이트 범위를 그대로(셈 시간 아낌 · range_mc.py 가 판단) · numpy 가 없으면 깃허브 실행기에서 한 번 깔아 봄
    if (ci && spawnSync('python3', ['-c', 'import numpy'], {encoding: 'utf8'}).status !== 0) spawnSync('python3', ['-m', 'pip', 'install', '--user', '--break-system-packages', '-q', 'numpy'], {encoding: 'utf8', timeout: 240000});
    const rgArgs = ['scripts/atlas11/t365/range_mc.py', '--out', out, '--no-record', ...(rangeQuick ? ['--quick'] : [])]; // 빠른 셈은 시험에서만
    if (useLive) { try { await fs.writeFile(path.join(tmp, 'range-live.json'), await getLive('range.json')); rgArgs.push('--reuse', path.join(tmp, 'range-live.json')); } catch { /* 없으면 새로 셈 */ } }
    const rgRun = run('7단 범위 셈', 'python3', rgArgs, env2, 900000);
    const rv = run('7단 범위 따로 세기', 'node', ['scripts/atlas11/t365/range_verify.mjs', path.join(out, 'range.json'), path.join(tmp, 'rv.json'), ...(rangeQuick ? ['--allow-quick'] : [])], env2);
    rep.verify.range = tail(rv.stdout);
    // 첫 화면 종합 정보(사장님 2026-10-12 14:54 「첫화면에 3개월 코스피 코스닥 지수 그래프 … 365개 종목 … 업종 강 7 · 약 7 … 수급 … 미국장 분위기」 · 네 팀 합친 안)
    //   깃허브 실행기면 지수 · 수급 · 업종 · 미국장 원문을 받음(market_fetch.mjs · 못 받아도 회차는 계속) → home_build.mjs(못 받은 조각 = 지금 사이트 자료의 그 조각 · 「앞 회차 값」)
    let raw = null, prevHome = fss.existsSync(path.join(target, 'home.json')) ? path.join(target, 'home.json') : '';
    if (ci && !closesDir && process.env.ATLAS_HOME_FETCH !== '0') {
      raw = path.join(tmp, 'home-raw');
      const t0 = Date.now(), r = spawnSync('node', ['scripts/atlas11/t365/market_fetch.mjs', '--out', raw], {cwd: root, encoding: 'utf8', timeout: 300000, maxBuffer: 16 << 20});
      rep.steps.push({name: '첫 화면 원문 받기', code: r.status, sec: Math.round((Date.now() - t0) / 100) / 10});
      try { rep.homeFetch = JSON.parse(String(r.stdout).trim().split('\n').at(-1)); } catch { rep.homeFetch = {code: r.status, err: tail(r.stderr)}; }
    }
    if (useLive) { try { await fs.writeFile(path.join(tmp, 'home-live.json'), await getLive('home.json')); prevHome = path.join(tmp, 'home-live.json'); } catch { /* 지금 사이트에 아직 없음 — 저장된 것 */ } }
    const hb = run('첫 화면 자료', 'node', ['scripts/atlas11/t365/home_build.mjs', '--data', out, '--raw', raw ?? '', '--prev', prevHome, '--out', path.join(out, 'home.json'), '--now', now.toISOString()]);
    try { rep.home = JSON.parse(String(hb.stdout).trim().split('\n').at(-1)); } catch { rep.home = null; }
    // 급등 탭(규칙 69) — 하루 4번 업데이트(회차) 때만 넣고 빼기(앞 고른 판 기준) · 처음(앞 판 없음)이면 처음 고름 · 그 밖 올림은 앞에 고른 그대로(값도 그때 값)
    //   셈 surge.py(파이썬) → 따로 세기 surge_verify.mjs(노드 · 원문에서 처음부터) 틀림 0 일 때만 · 급등 셈만 멈추면 앞 판 그대로 + 까닭(사이트의 다른 자료는 계속)
    {
      const sf = path.join(out, 'surge.json');
      const calCarry = async () => { try { await fs.copyFile(path.join(surgeCalLatest), path.join(out, 'surgecal.json')); } catch { await fs.rm(path.join(out, 'surgecal.json'), {force: true}); } }; // 업데이트 밖 · 멈춤 = 마지막 달력 그대로(없으면 없음)
      const again = !!(sLast && rep.slot && sLast.slot === rep.slot && String(sLast.kst ?? '').slice(0, 10) === rep.kst.slice(0, 10)); // 같은 날 같은 업데이트 이름으로 두 번째(경보 눈 반대 4) — 앞에 고른 그대로
      if ((rep.slot || !sLast) && !again) {
        try {
          const pf = path.join(tmp, 'surge-prev.json'), sfo = path.join(tmp, 'surge-state.json');
          await fs.writeFile(pf, JSON.stringify(sLast ? {at: sLast.at, kst: sLast.kst, slot: sLast.slot ?? null, payload: sLast.payload, state: surgePrevState(sRecs)} : null));
          run('급등 고르기', 'python3', ['scripts/atlas11/t365/surge.py', now0, out, '--prev', pf, '--at', now.toISOString(), '--slot', rep.slot ?? '', '--state-out', sfo], env2);
          const gv = run('급등 따로 세기', 'node', ['scripts/atlas11/t365/surge_verify.mjs', out, pf, path.join(tmp, 'gv.json'), sfo], env2);
          rep.verify.surge = tail(gv.stdout);
          const P = JSON.parse(await fs.readFile(sf, 'utf8')), state = JSON.parse(await fs.readFile(sfo, 'utf8'));
          surgeOut = {at: rep.at, kst: rep.kst, slot: rep.slot, kind: P.kind, payload: P, state: surgeRecState(state), input: filesDigest(closes)}; // state = 방금 빠진 곳 · 기다림 · 확정 맞대기 · 그 업데이트 사건 · 따라가기 시작(공개 자료엔 없음) · input = 이어 받은 일봉 파일 지문(방첩 눈 반대 4 — 파일 통째는 크기 때문에 못 남김)
          surgeCal = await fs.readFile(path.join(out, 'surgecal.json'), 'utf8'); // 달력 · 따라가기(sk-v1) — 올라가면 SURGECAL_LATEST 로
          await fs.writeFile(sf, JSON.stringify({...P, hist: surgeHist([...sRecs, surgeOut])}) + '\n');
          rep.surge = {kind: P.kind, version: P.version, n: P.n, asOf: P.asOf, provisional: P.provisional, members: P.members.map(m => m.c), in: P.in.map(x => ({c: x.c, n: x.n})), out: P.out.map(x => ({c: x.c, n: x.n, why: x.why})), digest: P.digest, published: null,
            bands: P.bands ? {version: P.bands.version, kind: P.bands.kind, digest: P.bands.digest, n: Object.fromEntries(['b10', 'b20', 'b30', 'b40'].map(b => [b, P.bands[b]?.n ?? null])), in: ['b10', 'b20', 'b30', 'b40'].reduce((a, b) => a + (P.bands[b]?.in?.length ?? 0), 0), out: ['b10', 'b20', 'b30', 'b40'].reduce((a, b) => a + (P.bands[b]?.out?.length ?? 0), 0), move: (state.evNow ?? []).filter(e => e[4] === 'move').length} : null};
        } catch (e) {
          rep.surge = {kind: 'fail', why: String(e?.message ?? e).slice(0, 300), from: sLast?.at ?? null};
          if (sLast) { await fs.writeFile(sf, JSON.stringify(surgeCarry(sLast, sRecs, '이번 업데이트에 급등 셈이 멈춰 앞에 고른 그대로예요')) + '\n'); await calCarry(); }
          else { await fs.rm(sf, {force: true}); await fs.rm(path.join(out, 'surgecal.json'), {force: true}); }
        }
      } else {
        await fs.writeFile(sf, JSON.stringify(surgeCarry(sLast, sRecs, again ? '같은 업데이트를 한 번 더 돌려 앞에 고른 그대로예요' : null)) + '\n'); await calCarry();
        rep.surge = {kind: 'carry', from: sLast.at, fromKst: sLast.kst, fromSlot: sLast.slot ?? null, digest: sLast.payload.digest, ...(again ? {why: '같은 업데이트 두 번째'} : {})};
      }
    }
    // 달력 탭(사장님 2026-10-15 19:28 · 20:51 「추적하는 시스탬」 · 21:24 「가 로 해」 · 규칙 70) — 올라간 네 칸 기록(sb-v1) + 이번에 새로 고른 판 + 일봉으로 처음부터 다시 엮음
    //   셈 surgetr.py(tr-v1) → 따로 세기 surgetr_verify.mjs(노드 · 결정표만 보고 씀) 틀림 0 일 때만 · 멈추면 지금 사이트 것 → 저장소 바탕 것 그대로(없으면 없음 — 화면은 「?」) · 사이트의 다른 자료는 계속
    {
      const trIn = path.join(tmp, 'surgetr-records.json');
      const trRecs = [...sRecs, ...(surgeOut ? [surgeOut] : [])].filter(r => r?.payload?.bands?.version === 'sb-v1').map(r => ({asOf: r.payload.asOf, provisional: !!r.payload.provisional, kst: r.payload.kst ?? r.kst ?? null, slot: r.payload.slot ?? r.slot ?? null, bands: r.payload.bands}));
      try {
        await fs.writeFile(trIn, JSON.stringify({records: trRecs}));
        run('달력 셈', 'python3', ['scripts/atlas11/t365/surgetr.py', now0, out, '--records', trIn, '--at', now.toISOString(), '--slot', rep.slot ?? ''], env2);
        const tv = run('달력 따로 세기', 'node', ['scripts/atlas11/t365/surgetr_verify.mjs', out, trIn, path.join(tmp, 'tv.json')], env2);
        rep.verify.cal = tail(tv.stdout);
        const TR = JSON.parse(await fs.readFile(path.join(out, 'surgetr.json'), 'utf8'));
        rep.cal = {version: TR.version, asOf: TR.asOf, provisional: TR.provisional, records: trRecs.length, cases: TR.cases.length, N: TR.N, a: TR.a, b: TR.b, k: TR.k, n10: TR.n10, m10: TR.m10, alerts: (TR.alerts ?? []).map(x => [x.kind, x.n])};
      } catch (e) {
        rep.cal = {kind: 'fail', why: String(e?.message ?? e).slice(0, 300)};
        for (const f of ['surgetr.json', 'surgetr-case.json']) {
          await fs.rm(path.join(out, f), {force: true});
          try { if (!useLive) throw Error('no live'); await fs.writeFile(path.join(out, f), await getLive(f)); } catch { try { await fs.copyFile(path.join(target, f), path.join(out, f)); } catch { /* 없으면 없음 */ } }
        }
      }
    }
    // 조건 찾기 탭(사장님 2026-10-15(싱가포르) 23:53 「엘셀처럼 찾는 조건을 3가지 걸수 하자」 · 23:54 「가」 · 규칙 72) — 이번 사이트 자료만으로 회사마다 조건 성질을 셈
    //   셈 cond.py(cd-v1) → 따로 세기 cond_verify.mjs(노드 · 결정표만 보고 씀) 틀림 0 일 때만 · 멈추면 cond.json 을 빼고 올림(화면은 「?」 — 옛 날 값을 지금 것처럼 보이지 않게) · 사이트의 다른 자료는 계속
    try {
      const cs = run('조건 찾기 셈', 'python3', ['scripts/atlas11/t365/cond.py', out], env2);
      const cv = run('조건 찾기 따로 세기', 'node', ['scripts/atlas11/t365/cond_verify.mjs', out, path.join(tmp, 'cv.json')], env2);
      rep.verify.cond = tail(cv.stdout);
      rep.cond = {version: 'cd-v1', ...JSON.parse(String(cs.stdout).trim().split('\n').at(-1))};
    } catch (e) {
      rep.cond = {kind: 'fail', why: String(e?.message ?? e).slice(0, 300)};
      await fs.rm(path.join(out, 'cond.json'), {force: true});
    }
    // 회차 기록 — 고른 날 · 기준일 · 365곳 · 들고 난 곳 · 층 · 1등 갈래
    const pro = JSON.parse(await fs.readFile(path.join(upd, 'proposal.json'), 'utf8'));
    const core = JSON.parse(await fs.readFile(path.join(out, 'core.json'), 'utf8'));
    const rg = JSON.parse(await fs.readFile(path.join(out, 'range.json'), 'utf8'));
    const members = pro.picked.map(p => p.code), names = Object.fromEntries([...pro.picked, ...pro.outside].map(x => [x.code, x.name]));
    const before = prev?.members ?? Object.keys(JSON.parse(await fs.readFile(path.join(target, 'comp.json'), 'utf8')).companies);
    const bset = new Set(before), mset = new Set(members);
    Object.assign(rep, {asOf: core.asOf, base: core.base, provisional: core.provisional, roll: core.roll, members,
      in: members.filter(c => !bset.has(c)).map(c => ({c, n: names[c]})), out: before.filter(c => !mset.has(c)).map(c => ({c, n: names[c] ?? c})),
      counts: {picked: pro.counts.picked, mg: pro.counts.mg?.picked ?? null, ly: pro.counts.ly?.picked ?? null, both: pro.counts.both ?? null, q: pro.counts.q}, tiers: null,
      kinds: null, stay: members.filter(c => bset.has(c)).length,
      ruleChanged: !!prev && (prev.version ?? null) !== ACT.version, prevVersion: prev?.version ?? null, buffer: pro.from?.prev?.used ?? false,
      all: {chg: core.all.chg, up: core.all.up, down: core.all.down}, top: {short: core.groups[0]?.short, chg: core.groups[0]?.chg, ...(core.mkt ? {scope: 'mkt'} : {})}, // 1등 갈래 = 모든 회사로 센 갈래(2026-10-14 「나」 · 그 전 기록은 고른 곳으로 센 갈래)
      range: {eligible: rg.eligible, reused: /reused/.test(rgRun.stdout)}});
    // 값 지문 — 고른 날 · 이어 붙인 값 수 · 365곳 · 365곳 지수 · 아직 바뀜 여부 · 같으면 「그대로」(새 값 없음)
    rep.digest = crypto.createHash('sha256').update(JSON.stringify([pro.asOf, pro.from?.closes?.added, members, core.all.v, core.provisional, ...(rep.surge?.digest ? [rep.surge.digest] : []), ...(rep.surge?.bands?.digest ? [rep.surge.bands.digest] : [])])).digest('hex').slice(0, 16); // 급등 판 지문도(규칙 69 · 경보 눈 — 바탕 회사가 같아도 급등 목록이 바뀌면 「바꿈」)
    rep.result = prev && prev.digest === rep.digest ? '그대로' : '바꿈';
    if (rep.result === '그대로') rep.why = '새 값 없음 — 앞 회차와 같은 값으로 다시 만듦';
    // 시장 판독(지난 사실만) → 네 눈 점검(이번 회차 자료 + 화면 코드) — 걸리면 새 자료를 올리지 않음(아래 catch: 지금 사이트 자료 그대로)
    rep.market = readMarket(out, prev?.market ?? null, now);
    if (!inspectRun(out, rep.market)) throw Error('네 눈 점검에서 걸림 — ' + failLine());
    // 옮겨 놓고 한 번에 바꿈(반쯤 바뀐 자료가 올라가지 않게)
    const stage = target + '.roll';
    await fs.rm(stage, {recursive: true, force: true});
    await copyAll(out, stage);
    await fs.rm(target, {recursive: true, force: true}); await fs.rename(stage, target);
    rep.served = 'rolled';
    return await done();
  } catch (e) {
    rep.result = '실패'; rep.why = String(e?.message ?? e).slice(0, 500);
    rep.market = null; // 판독은 실제로 올라가는 자료(아래 지금 사이트 자료)로 다시(done) — 네 눈 점검 결과는 걸린 새 자료의 것을 그대로 둠(왜 막았는지)
    if (useLive) { try { await mirrorLive(target); rep.served = 'live'; rep.why += ' — 지금 사이트 자료 그대로 다시 올림'; } catch (e2) { rep.why += ' — 지금 사이트 자료도 못 받아 저장소 바탕 그대로: ' + String(e2?.message ?? e2).slice(0, 120); } }
    return await done();
  }
  async function done() { // 기록을 못 남겨도 올리기는 멈추지 않음
    if (tmp) await fs.rm(tmp, {recursive: true, force: true}).catch(() => {});
    if (rep.surge && surgeOut) rep.surge.published = rep.served === 'rolled'; // 고른 판이 실제로 올라갔는지(네 눈 점검에서 걸리면 지금 사이트 자료 그대로 — 그 고르기는 다음 업데이트의 앞 판이 아님)
    // 이번 회차에 올라가는 자료(새로 바꾸지 못했으면 지금 자료)의 시장 판독 · 네 눈 점검 — 이미 했으면(바꿈 · 걸림) 그대로
    if (!rep.market) { try { rep.market = readMarket(target, prev?.market ?? null, now); } catch (e) { rep.why = (rep.why ? rep.why + ' · ' : '') + '시장 판독 못 함: ' + String(e?.message ?? e).slice(0, 120); } }
    if (!rep.inspect) { try { if (!inspectRun(target, rep.market)) rep.why = (rep.why ? rep.why + ' · ' : '') + '네 눈 점검에서 걸림(올라가는 자료) — ' + failLine(); } catch (e) { rep.why = (rep.why ? rep.why + ' · ' : '') + String(e?.message ?? e).slice(0, 200); } }
    try { // 「업데이트」 탭 자료 — 이번 회차까지
      await fs.mkdir(target, {recursive: true});
      await fs.writeFile(path.join(target, 'updates.json'), JSON.stringify(tabData([...prevAll, rep])) + '\n');
    } catch (e) { rep.why = (rep.why ? rep.why + ' · ' : '') + '업데이트 탭 자료를 못 씀: ' + String(e?.message ?? e).slice(0, 120); }
    if (recDir) {
      try {
        await fs.mkdir(recDir, {recursive: true});
        const name = rep.at.replace(/[-:]/g, '').replace(/\.\d+Z$/, 'Z') + '.json';
        await fs.writeFile(path.join(recDir, name), JSON.stringify(rep, null, 1) + '\n', {flag: 'wx'});
        const dir = path.dirname(recDir); // 깃허브 실행기 = reports/atlas11/t365 · 시험 = 임시 폴더(저장소 기록을 건드리지 않음)
        if (inspectFull) { await fs.mkdir(path.join(dir, 'inspect'), {recursive: true}); await fs.writeFile(path.join(dir, 'inspect', name), JSON.stringify({...inspectFull, at: rep.at, kst: rep.kst, slot: rep.slot}, null, 1) + '\n', {flag: 'wx'}); }
        // 급등 고르기 기록(규칙 69) — 올라간 고르기만(네 눈 점검까지 지나 사이트 자료가 바뀐 때) · 새 파일만 · 다음 업데이트의 「앞 판」
        if (surgeOut && rep.served === 'rolled') { await fs.mkdir(surgeDir, {recursive: true}); await fs.writeFile(path.join(surgeDir, name), JSON.stringify({schema: 'atlas-t365-surge-rec-1', ...surgeOut}, null, 1) + '\n', {flag: 'wx'}); if (surgeCal) await fs.writeFile(surgeCalLatest, surgeCal); }
        await fs.writeFile(path.join(dir, 'roll-latest.json'), JSON.stringify({...rep, members: undefined}, null, 1) + '\n');
        await fs.appendFile(path.join(dir, 'roll-log.jsonl'), JSON.stringify({at: rep.at, kst: rep.kst, slot: rep.slot, result: rep.result, served: rep.served, asOf: rep.asOf, base: rep.base, in: rep.in?.length ?? null, out: rep.out?.length ?? null, inspectFail: rep.inspect?.fail ?? null, surge: rep.surge?.kind ?? null, why: rep.why}) + '\n');
      } catch (e) { rep.why = (rep.why ? rep.why + ' · ' : '') + '회차 기록을 못 남김: ' + String(e?.message ?? e).slice(0, 120); }
    }
    try { log(`atlas 회차: ${rep.result} · ${rep.kst}(${rep.slot ?? '회차 밖'}) · 고른 날 ${rep.asOf ?? '-'} · 기준일 ${rep.base ?? '-'} · 들어옴 ${rep.in?.length ?? '-'} · 빠짐 ${rep.out?.length ?? '-'} · 급등 ${rep.surge ? `${rep.surge.kind}${rep.surge.n != null ? ` ${rep.surge.n}곳 · 듦 ${rep.surge.in?.length ?? 0} · 빠짐 ${rep.surge.out?.length ?? 0}` : ''}` : '-'} · 네 눈 점검 ${rep.inspect ? rep.inspect.lenses.map(l => `${l.name} ${l.n}번 실패 ${l.fail}`).join(' · ') : '-'} · ${rep.why ?? ''}`); } catch { /* 로그 실패도 무시 */ }
    return rep;
  }
}
