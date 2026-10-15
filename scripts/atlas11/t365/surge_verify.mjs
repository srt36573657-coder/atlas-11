#!/usr/bin/env node
// 급등 탭 따로 세기(사장님 2026-10-15 14:27(싱가포르) 「… 최근 5일에 급등한 종목을 36개 … 하루에 4번 업데이트할때미다 그때 선택도 하고 탈락도 시켜라」 · 규칙 69)
//   surge.py(파이썬)는 열지 않고 결정표 v2(sv-v1) 0 ~ 4절만 보고 다른 길(노드 · 모음 원본 일봉 + 이어 받은 일봉 + 앞 판 · 상태에서 처음부터)로 다시 세어
//   화면 자료 surge.json(그리고 주면 상태 파일)과 칸마다 맞댐 — 허용 오차 없음 · 틀린 것이 하나라도 있으면 끝 코드 1
//   쓰는 법(저장소 맨 위에서): node scripts/atlas11/t365/surge_verify.mjs <자료 폴더(surge.json · mkt.json · core.json)> <앞 판 json({at, kst, slot, payload, state} · null · 없으면 -)> <결과 json> [상태 json(surge.py --state-out)]
//   환경 변수: ATLAS_T365_CLOSES(이어 받은 일봉 폴더 · 없어도 됨) · ATLAS_D365_DIR(그 업데이트 후보 표 폴더 — proposal.json · 없으면 universe.json dir)
//   맞대는 것: kind · n · cap · asOf · provisional · got · window · members(차례 · 칸 모두) · stats · funnel(qn 포함) · cut · cutList · market · bins · why · facts · sameInd · in · out(까닭 글 포함)
//             · confirm · strict · digest · 규칙 숫자(enter 15 · stay 10 · liq 1 · jump 35 · hist 20 · enterRank 36 · keepRank 72 · margin 5 · pen 5 · idleDays 61 · idleMax 13)
//             · 상태 파일을 주면 asOf · recentOut · pending · confirms
//   안 보는 것: made · at · kst · slot · rules 글(lines · slots) · prev · hist · carry
//   결정표 고침(2026-10-15 맞대 보고 정함): ① pctw 끝에 「%」 ② got = 이어 받은 마지막 파일이 있고 마지막 날 > 모음 마지막 날이면 그 서울 때(장 중이 아니어도)
//             ③ 새 recentOut 이 이어 가는 옛 줄 = pen 으로 쓴 것(day ∈ {D[k], D[k−1]} 이고 이번 회사 목록 안) 가운데 이번 out 이 아닌 것
//             ④ 규칙 바뀜(kind 'rule') = 처음부터 — 꼬리표 · since · sinceKst · sinceAsOf · rounds · in 은 'first' 와 같음 · 상태는 빈 것에서(confirms [] · recentOut 에 안 넣음) · out 은 앞 판 회사마다 규칙 바뀜 까닭
import fs from 'node:fs';
import zlib from 'node:zlib';
import path from 'node:path';
import crypto from 'node:crypto';
const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '../../..');
const [dataArg, prevArg, outArg, stateArg] = process.argv.slice(2);
const dataDir = path.resolve(ROOT, dataArg ?? 'site/atlas/data');
const prevFile = prevArg && prevArg !== '-' ? path.resolve(ROOT, prevArg) : null;
const outFile = path.resolve(ROOT, outArg ?? 'reports/atlas11/verify/atlas-new-surge-latest.json');
const stateFile = stateArg ? path.resolve(ROOT, stateArg) : null;
const J = f => JSON.parse(fs.readFileSync(f, 'utf8'));
const cmp = (a, b) => (a < b ? -1 : a > b ? 1 : 0);
const iso = d => `${d.slice(0, 4)}-${d.slice(4, 6)}-${d.slice(6, 8)}`;
// 맞대기 — 열쇠 차례는 따지지 않음(값만) · −0 과 0 은 같게 봄 · 빠진 칸은 「(없음)」
const canon = x => JSON.stringify(x, (k, v) => (v && typeof v === 'object' && !Array.isArray(v) ? Object.fromEntries(Object.keys(v).sort().map(q => [q, v[q]])) : v));
const bad = []; let checks = 0;
const same = (got, want, what) => { checks++; if (canon(got) !== canon(want)) bad.push({what, got: got === undefined ? '(없음)' : got, want: want === undefined ? '(없음)' : want}); };
const truth = (ok, what, got, want) => { checks++; if (!ok) bad.push({what, got, want}); };

// ── 결정표 숫자(2절 · 1절 · 4절) ──
const VERSION = 'sv-v1', SCHEMA = 'atlas-new-surge-1';
const CAP = 36, ENTER = 1.15, STAY = 1.10, LIQ = 1e8, JUMP = 35, HIST = 20, ENTER_RANK = 36, KEEP_RANK = 72, MARGIN = 0.05, PEN = 0.05;
const IDLE_DAYS = 61, IDLE_MAX = 13, KEEP_LOG = 20; // 창 앞 61칸 · 거래 0 인 날 13번 넘으면 idle · 확정 맞대기 기록 20개
const WHY_TEXT = {
  new: '새로 상장해 평소 값을 잴 수 없음',
  gap: '6거래일 가운데 값이 빈 날이 있음(거래정지 · 받기 실패 등)',
  novol: '거래가 없었던 날이 있음(거래정지일 수 있음)',
  jump: '하루 35% 넘게 바뀐 날이 있음(값 고침 · 자료 틀림일 수 있음)',
  idle: '석 달 안에 거래가 오래 멈췄던 곳(다시 열리며 값이 크게 다시 매겨질 수 있음)',
};
const THIN_TEXT = '평소 하루 거래가 1억 원이 안 돼요';
const OUT_TEXT = {
  rule: '고르는 규칙이 바뀌어 새로 골랐어요',
  gone: '? 이번 자료에 이 회사 값이 없어요',
  q: '? 값을 셀 수 없어 뺐어요 — ',
  floorOld: '크게 오른 날이 5일 밖으로 나가 +10% 밑이 됐어요',
  floorDown: '값이 내려 +10% 밑이 됐어요',
  rank: '더 크게 오른 곳이 많아 밀렸어요',
  seat: '더 크게 오른 곳에 자리를 내줬어요',
};

// d2 — 가장 짧은 10진 글(노드 String = 파이썬 repr 와 같은 숫자 글)에서 소수 둘째 자리로 · 0.005 는 0 에서 먼 쪽(Decimal ROUND_HALF_UP) · 지수 꼴(1e-7 · 1.5e+21)도 풂
function d2(x) {
  if (x == null) return null;
  let s = String(x), neg = false;
  if (s[0] === '-') { neg = true; s = s.slice(1); }
  const [mant, ex] = s.split(/e/i);
  const [ip, fp = ''] = mant.split('.');
  const digits = (ip + fp).replace(/^0+/, '');
  const sh = (ex ? parseInt(ex, 10) : 0) - fp.length + 2; // 값 = digits × 10^(sh − 2)
  let q = 0n;
  if (digits) {
    if (sh >= 0) q = BigInt(digits) * 10n ** BigInt(sh);
    else if (-sh <= digits.length) { const cut = digits.length + sh; q = BigInt(digits.slice(0, cut) || '0') + (digits[cut] >= '5' ? 1n : 0n); }
  }
  const qs = q.toString().padStart(3, '0');
  return Number(`${neg ? '-' : ''}${qs.slice(0, -2)}.${qs.slice(-2)}`);
}
// pctw — |x| ≥ 100 은 정수 · 아니면 소수 한 자리 · 부호 + / − / 없음 · 끝에 「%」(2026-10-15 결정표 고침 ① — 「+29.8%」 · 「+110%」)
function pctw(x) {
  const a = Math.abs(x);
  const body = a >= 100 ? String(Math.floor(a + 0.5 + 1e-7)) : (Math.floor(a * 10 + 0.5 + 1e-7) / 10).toFixed(1);
  return (x > 0 ? '+' : x < 0 ? '−' : '') + body + '%';
}
// 가운데값 — 짝수면 가운데 둘 (a + b) / 2
const median = xs => { if (!xs.length) return null; const s = [...xs].sort((a, b) => a - b), h = s.length >> 1; return s.length % 2 ? s[h] : (s[h - 1] + s[h]) / 2; };
// 서울 때
const seoul = at => { const t = Date.parse(at); if (!Number.isFinite(t)) return null; const s = new Date(t + 9 * 3600e3).toISOString(); return {day: s.slice(0, 10), hour: +s.slice(11, 13), text: `${s.slice(0, 10)} ${s.slice(11, 16)}`}; };

// ── 읽기 ── surge.json 이 없으면(셈이 멈춤 · 받기 고장 등) 틀림 하나로 적고 끝 코드 1
const finish = () => {
  const res = {schema: 'atlas-new-surge-verify-1', made: new Date().toISOString(), checks, bad: bad.length, first: bad.slice(0, 20), ...(finish.seen ? {seen: finish.seen} : {})};
  fs.mkdirSync(path.dirname(outFile), {recursive: true}); fs.writeFileSync(outFile, JSON.stringify(res, null, 1) + '\n');
  console.log(JSON.stringify({checks, bad: bad.length, ...(finish.seen ? {kind: finish.seen.kind, asOf: finish.seen.asOf, provisional: finish.seen.provisional, digest: finish.seen.digest} : {}), first: bad.slice(0, 3)}));
  process.exit(bad.length ? 1 : 0);
};
if (!fs.existsSync(path.join(dataDir, 'surge.json'))) { truth(false, 'surge.json 없음', null, path.join(dataDir, 'surge.json')); finish(); }
const S = J(path.join(dataDir, 'surge.json'));
const MK = J(path.join(dataDir, 'mkt.json')).companies ?? {};
const CORE = J(path.join(dataDir, 'core.json'));
const indG = new Map((CORE.industries ?? []).map(x => [x.name, x.g]));
const ACT = J(path.join(ROOT, 'scripts/atlas11/t365/universe.json'));
const pro = J(path.join(path.resolve(ROOT, process.env.ATLAS_D365_DIR || ACT.dir), 'proposal.json'));
const PREV = prevFile && fs.existsSync(prevFile) ? J(prevFile) : null;
const PP = PREV && PREV.payload ? PREV.payload : null; // 앞 판 화면 자료
const RULE = !!(PP && PP.version !== VERSION); // 규칙 바뀜
const KIND = RULE ? 'rule' : PP ? 'pick' : 'first';
// 규칙 바뀜 = 처음부터(2026-10-15 결정표 3 · 4절 덧붙임 ④): 상태는 빈 것에서 시작(pen · hold · confirms · recentOut 이어 받지 않음) · 꼬리표 · since · rounds · in 은 「처음」과 같음 · out 은 앞 판 회사마다 규칙 바뀜 까닭
const PS = PREV && PREV.state && !RULE ? PREV.state : null; // 앞 판 상태(기록 파일 state)

// ── 0절 입력 — 회사 = 후보 표(picked + outside) 가운데 보통주(nc 아님) · 번호 문자열 차례 ──
const rowOf = new Map();
for (const r of [...(pro.picked ?? []), ...(pro.outside ?? [])]) if (!r.nc && !rowOf.has(r.code)) rowOf.set(r.code, r);
const ALLC = [...rowOf.keys()].sort(cmp), NC = ALLC.length, IX = new Map(ALLC.map((c, j) => [c, j]));
// 일봉 = 모음 fchart(종가 > 0) + 이어 받은 일봉(daese.merge 규칙: 모음 마지막 날 뒤만 · 같은 날은 나중 파일 · 모음 안 날 값이 0.5% 넘게 다르면 그 회사는 그 파일에서 안 받음)
const bundle = JSON.parse(zlib.gunzipSync(fs.readFileSync(path.resolve(ROOT, ACT.bundle))).toString('utf8'));
const base = new Map(ALLC.map(c => [c, (bundle.stocks?.[c]?.fchart?.rows ?? []).filter(r => r[4] && r[4] > 0)]));
let blast = ''; for (const rs of base.values()) for (const r of rs) if (r[0] > blast) blast = r[0];
const bmap = new Map(ALLC.map(c => [c, new Map(base.get(c).map(r => [r[0], r[4]]))]));
const add = new Map(ALLC.map(c => [c, new Map()]));
const CLOSES = process.env.ATLAS_T365_CLOSES;
let lastFile = null, nFiles = 0;
if (CLOSES && fs.existsSync(CLOSES) && fs.statSync(CLOSES).isDirectory()) {
  for (const fn of fs.readdirSync(CLOSES).filter(f => f.endsWith('.json.gz')).sort()) {
    const snap = JSON.parse(zlib.gunzipSync(fs.readFileSync(path.join(CLOSES, fn))).toString('utf8'));
    if (!['atlas-t365-closes-1', 'atlas-t365-closes-2'].includes(snap.schema)) continue;
    nFiles++;
    for (const [c, rs] of Object.entries(snap.rows ?? {})) {
      const bm = bmap.get(c); if (!bm) continue;
      if (rs.some(x => x[0] <= blast && bm.has(x[0]) && x[1] && Math.abs(x[1] / bm.get(x[0]) - 1) > 0.005)) continue;
      for (const x of rs) if (x[0] > blast && x[1] && x[1] > 0) { add.get(c).set(x[0], [x[1], x.length > 2 ? x[2] : null]); lastFile = {file: fn, startedAt: snap.startedAt ?? null}; }
    }
  }
}
// 거래일 달력 = 거래소 달력 ∪ (후보 절반 넘게 종가가 있는 날 가운데 달력 끝 뒤 날) · 마지막 날 = 종가 줄이 하나라도 있는 곳 절반 넘게 종가가 있는 마지막 날(daese.pick_day)
const cal = [...new Set([...J(path.join(ROOT, 'public/data/input.json')).calendar.sessions, ...(fs.existsSync(path.join(ROOT, 'public/data/rolling-calendar.json')) ? J(path.join(ROOT, 'public/data/rolling-calendar.json')).sessions ?? [] : [])])].sort(cmp);
const withRows = ALLC.filter(c => base.get(c).length + add.get(c).size > 0);
const cnt = new Map(); const tick = d => cnt.set(d, (cnt.get(d) ?? 0) + 1);
for (const c of withRows) { for (const r of base.get(c)) tick(iso(r[0])); for (const d of add.get(c).keys()) tick(iso(d)); }
const days = [...cnt].filter(([, n]) => n > withRows.length / 2).map(([d]) => d).sort(cmp);
const ext = cal.length ? [...new Set([...cal, ...days.filter(d => d > cal.at(-1))])].sort(cmp) : days;
const extSet = new Set(ext), good = days.filter(d => extSet.has(d));
if (!good.length) { truth(false, '0절 후보 절반 넘게 종가가 있는 날이 없음(파이썬은 멈춰야 함)', S.asOf ?? null, null); finish(); }
const DAY = good.at(-1), D = ext.filter(d => d <= DAY), K = D.length - 1, tix = new Map(D.map((d, t) => [d, t]));
// C[j][t] = 종가 · V[j][t] = 거래량(없으면 null · 0 은 0) · 달력에 없는 날 줄은 버림
const C = [], V = [];
for (const c of ALLC) {
  const cc = new Array(K + 1).fill(null), vv = new Array(K + 1).fill(null);
  for (const r of base.get(c)) { const t = tix.get(iso(r[0])); if (t !== undefined) { cc[t] = r[4]; vv[t] = r[5] ?? null; } }
  for (const [d, [v, vol]] of [...add.get(c)].sort((a, b) => cmp(a[0], b[0]))) { const t = tix.get(iso(d)); if (t !== undefined) { cc[t] = v; vv[t] = vol ?? null; } }
  C.push(cc); V.push(vv);
}
// 받기 고장 — 마지막 날 종가가 있는 회사 < 0.90 × 회사 수면 파이썬은 멈춰야 함(surge.json 이 나오면 틀림)
const nHave = C.filter(cc => cc[K] != null).length;
truth(!(nHave < 0.9 * NC), '0절 받기 고장인데 surge.json 이 나옴', nHave, `≥ ${0.9 * NC}`);
// 장 중 — 이어 받은 마지막 파일의 startedAt(서울) 날 = 마지막 날 · 시 < 20 · 마지막 날 > 모음 마지막 날
// got — 이어 받은 마지막 파일이 있고 마지막 날 > 모음 마지막 날이면 그 서울 때(장 중이든 아니든 · 2026-10-15 결정표 고침 ②) · 아니면 null
const blastIso = blast ? iso(blast) : '', ls = lastFile?.startedAt ? seoul(lastFile.startedAt) : null;
const PROV = !!(ls && ls.day === DAY && ls.hour < 20 && DAY > blastIso), GOT = ls && DAY > blastIso ? ls.text : null;

// ── 1절 한 날(창 끝 k)의 셈 ──
function dayCalc(k) {
  const R = new Array(NC).fill(null), why = new Array(NC).fill(null), liq = new Array(NC).fill(null), clean = new Array(NC).fill(false), liquid = new Array(NC).fill(false);
  for (let j = 0; j < NC; j++) {
    const c = C[j], v = V[j];
    if (k - 5 >= 0 && c[k] != null && c[k - 5] != null) R[j] = c[k] / c[k - 5];
    let hist = 0; for (let t = 0; t <= k - 6; t++) if (c[t] != null) hist++;
    let w = null;
    if (hist < HIST) w = 'new';
    if (!w) for (let t = k - 5; t <= k; t++) if (c[t] == null) { w = 'gap'; break; }
    if (!w) for (let t = k - 5; t <= k; t++) if (v[t] == null || v[t] === 0) { w = 'novol'; break; }
    if (!w) for (let t = k - 4; t <= k; t++) if (Math.abs(c[t] - c[t - 1]) * 100 > c[t - 1] * JUMP) { w = 'jump'; break; }
    if (!w) { let z = 0; for (let t = Math.max(0, k - 66); t <= k - 6; t++) if (v[t] === 0) z++; if (z > IDLE_MAX) w = 'idle'; }
    why[j] = w; clean[j] = !w;
    if (clean[j]) {
      const xs = []; for (let t = Math.max(0, k - 25); t <= k - 6; t++) if (c[t] != null && v[t] != null) xs.push(c[t] * v[t]);
      liq[j] = median(xs);
      liquid[j] = liq[j] != null && liq[j] >= LIQ;
    }
  }
  // 열쇠 = (−r, −liq(없으면 0), 번호) 오름
  const lq = j => liq[j] ?? 0;
  const keyCmp = (a, b) => (R[a] !== R[b] ? (R[a] > R[b] ? -1 : 1) : lq(a) !== lq(b) ? (lq(a) > lq(b) ? -1 : 1) : a - b);
  const E = []; for (let j = 0; j < NC; j++) if (liquid[j]) E.push(j);
  E.sort(keyCmp);
  const rank = new Map(E.map((j, i) => [j, i + 1]));
  const rankOf = j => (rank.has(j) ? rank.get(j) : 1 + E.filter(e => keyCmp(e, j) < 0).length);
  return {k, R, why, liq, clean, liquid, E, rank, rankOf, keyCmp};
}
const X = dayCalc(K), {R, clean, liquid, E, rank, rankOf, keyCmp} = X;
const dom = new Array(NC).fill(false);
for (let j = 0; j < NC; j++) {
  const c = C[j], r = R[j];
  if (r == null || K < 1 || c[K] == null || c[K - 1] == null) continue;
  const a = c[K] / c[K - 1];
  dom[j] = r > 1 && a * a * a * a * a > r * r * r * r;
}

// ── 3절 상태(pen · hold · 확정 맞대기 · strict) ──
const DK = D[K], DK1 = K >= 1 ? D[K - 1] : null;
const recent = Array.isArray(PS?.recentOut) ? PS.recentOut : [];
// pen 으로 쓴 것 = 앞 recentOut 가운데 day ∈ {D[k], D[k−1]} 이고 이번 회사 목록에 있는 곳(규칙이 바뀌면 비움) — 새 recentOut 도 이것에서 이어 감
const penUsed = RULE ? [] : recent.filter(e => (e.day === DK || e.day === DK1) && IX.has(e.c));
const pen = new Set(penUsed.map(e => IX.get(e.c)));
const hold = PROV ? new Set(PS && PS.asOf === DAY ? (PS.pending ?? []).filter(c => IX.has(c)).map(c => IX.get(c)) : []) : null;
let confirm = null;
if (PP && !RULE && PP.provisional && PP.asOf !== DAY && tix.has(PP.asOf)) {
  const Y = dayCalc(tix.get(PP.asOf));
  const ent = (PP.members ?? []).filter(m => m.sinceAsOf === PP.asOf && IX.has(m.c));
  const miss = ent.filter(m => { const j = IX.get(m.c); return !(Y.liquid[j] && Y.R[j] >= ENTER && Y.rank.get(j) <= ENTER_RANK); });
  confirm = {day: PP.asOf, n: ent.length, miss: miss.length, names: miss.map(m => MK[m.c]?.n ?? m.n ?? null)};
}
const confirms = [...(Array.isArray(PS?.confirms) ? PS.confirms : []), ...(confirm ? [{day: confirm.day, n: confirm.n, miss: confirm.miss}] : [])].slice(-KEEP_LOG);
const sumN = confirms.reduce((a, x) => a + x.n, 0), sumMiss = confirms.reduce((a, x) => a + x.miss, 0);
const STRICT = confirms.length === KEEP_LOG && sumN > 0 && sumMiss * 4 > sumN;

// ── 2절 넣고 빼기 ──
const adj = j => R[j] - (pen.has(j) ? PEN : 0.0);
const enter = j => adj(j) >= ENTER;
const okNow = j => hold === null || !(dom[j] || STRICT) || hold.has(j);
const can = j => enter(j) && okNow(j);
const prevMembers = PP ? (PP.members ?? []) : [];
const prevList = RULE || !PP ? [] : prevMembers.filter(m => IX.has(m.c)).map(m => IX.get(m.c)); // 회사 목록에 없는 앞 판 회사는 prev 에서 빠짐
const prevSet = new Set(prevList);
const wait = E.filter(j => !prevSet.has(j) && rank.get(j) <= ENTER_RANK && enter(j) && !okNow(j));
let seat; const reason = new Map(); // prev 회사 → 나간 까닭(q · floor · rank · seat)
if (RULE || !PP) seat = E.filter(j => can(j) && rank.get(j) <= ENTER_RANK).slice(0, CAP);
else {
  seat = prevList.filter(j => clean[j] && R[j] >= STAY && rankOf(j) <= KEEP_RANK).sort(keyCmp);
  const inSeat = new Set(seat), newset = new Set();
  for (const j of E) {
    if (seat.length >= CAP) break;
    if (!inSeat.has(j) && !prevSet.has(j) && can(j) && rank.get(j) <= ENTER_RANK) { seat.push(j); inSeat.add(j); newset.add(j); }
  }
  for (;;) {
    const best = E.find(j => !inSeat.has(j) && !prevSet.has(j) && rank.get(j) <= ENTER_RANK && can(j));
    const olds = seat.filter(j => !newset.has(j));
    if (best === undefined || !olds.length) break;
    const w = olds.reduce((a, b) => (keyCmp(a, b) > 0 ? a : b));
    if (adj(best) - R[w] > MARGIN) { seat = seat.filter(j => j !== w); inSeat.delete(w); reason.set(w, 'seat'); seat.push(best); inSeat.add(best); newset.add(best); }
    else break;
  }
  seat.sort(keyCmp);
  for (const j of prevList) if (!inSeat.has(j) && !reason.has(j)) reason.set(j, !clean[j] ? 'q' : R[j] < STAY ? 'floor' : rankOf(j) > KEEP_RANK ? 'rank' : 'seat');
}
const seatSet = new Set(seat);

// ── 4절 화면 자료 ──
const nameOf = c => MK[c]?.n ?? null;
const rr = j => R[j] - 1;
const cleanJ = []; for (let j = 0; j < NC; j++) if (clean[j]) cleanJ.push(j);
const mktMed = median(cleanJ.map(rr));
const p15 = cleanJ.filter(j => R[j] >= ENTER).length / cleanJ.length;
const indOf = j => MK[ALLC[j]]?.i ?? null, gOf = j => indG.get(indOf(j)) ?? null;
const cleanByInd = new Map(), cleanByG = new Map();
for (const j of cleanJ) { const i = indOf(j), g = gOf(j); if (!cleanByInd.has(i)) cleanByInd.set(i, []); cleanByInd.get(i).push(j); if (!cleanByG.has(g)) cleanByG.set(g, []); cleanByG.get(g).push(j); }
function warnAt(c, L) { // 거래소 투자경고 오름 기준(지수 조건은 안 셈) — t = L−4 … L 가운데 하루라도
  for (let t = L - 4; t <= L; t++) {
    if (t < 15 || c[t] == null) continue;
    let ok = true, mx = -Infinity;
    for (let u = t - 14; u <= t; u++) { if (c[u] == null) { ok = false; break; } if (c[u] > mx) mx = c[u]; }
    if (!ok || !(c[t] >= mx)) continue;
    if ((c[t - 5] != null && c[t] * 10 >= c[t - 5] * 16) || (c[t - 15] != null && c[t] >= c[t - 15] * 2)) return true;
  }
  return false;
}
const prevByCode = new Map(prevMembers.map(m => [m.c, m]));
const members = seat.map(j => {
  const code = ALLC[j], c = C[j], v = V[j], r = R[j], m0 = RULE ? undefined : prevByCode.get(code);
  const r5 = d2((c[K] / c[K - 5] - 1) * 100);
  const vv = []; for (let t = K - 5; t <= K - 1; t++) vv.push(d2(c[t] / c[K - 5] * 100)); vv.push(d2(100 + r5));
  const warn = warnAt(c, PROV ? K - 1 : K), warnLive = !warn && PROV && warnAt(c, K);
  let one = false; if (r > 1) for (let t = K - 4; t <= K; t++) { const y = c[t] / c[t - 1]; if (y * y * y >= r * r) { one = true; break; } }
  let pmax = null; for (let t = Math.max(0, K - 65); t <= K - 5; t++) if (c[t] != null && (pmax === null || c[t] > pmax)) pmax = c[t];
  const reb = pmax !== null && pmax * 7 >= c[K - 5] * 10;
  let half = false, run = null; for (let t = Math.max(0, K - 256); t <= K - 5; t++) { if (c[t] == null) continue; if (run === null || c[t] > run) run = c[t]; if (run >= c[t] * 2) { half = true; break; } }
  let quiet = false; if (X.liq[j] != null) { let s = 0.0; for (let t = K - 4; t <= K; t++) s += c[t] * v[t]; quiet = s < 10 * X.liq[j]; }
  // 경쟁 가설 — 시장 · 업종 · 회사
  const x = r - 1; let peers = (cleanByInd.get(indOf(j)) ?? []).filter(p => p !== j);
  if (peers.length < 4) peers = (cleanByG.get(gOf(j)) ?? []).filter(p => p !== j);
  const hot = peers.filter(p => R[p] >= ENTER).length;
  const why = mktMed * 2 >= x ? 'mkt' : peers.length >= 4 && (median(peers.map(rr)) * 2 >= x || (hot >= 2 && hot >= 3 * peers.length * p15)) ? 'ind' : 'co';
  const tag = m0 ? 'stay' : 'new';
  const since = m0 ? m0.since : S.at, sinceKst = m0 ? m0.sinceKst : S.kst, sinceAsOf = m0 ? m0.sinceAsOf : DAY, rounds = m0 ? m0.rounds + 1 : 1;
  return {c: code, n: nameOf(code), i: indOf(j), g: gOf(j), mk: rowOf.get(code).market ?? null, r5, v: vv, d1: d2((c[K] / c[K - 1] - 1) * 100), liq: d2(X.liq[j] / 1e8),
    warn, warnLive, one, reb, half, quiet, why, tag, since, sinceKst, sinceAsOf, rounds, prov: PROV && sinceAsOf === DAY};
});
const r5s = members.map(m => m.r5);
const stats = members.length ? {lo: Math.min(...r5s), hi: Math.max(...r5s), med: d2(median(r5s))} : null;
const qn = {new: 0, gap: 0, novol: 0, jump: 0, idle: 0}; for (let j = 0; j < NC; j++) if (X.why[j]) qn[X.why[j]]++;
const nLiquid = liquid.filter(Boolean).length;
const funnel = {all: NC, clean: cleanJ.length, q: NC - cleanJ.length, qn, liquid: nLiquid, picked: members.length};
const hotAll = []; for (let j = 0; j < NC; j++) if (R[j] != null && R[j] >= ENTER) hotAll.push(j);
const cut = {q: hotAll.filter(j => !clean[j]).length, thin: hotAll.filter(j => clean[j] && !liquid[j]).length, seat: hotAll.filter(j => liquid[j] && !seatSet.has(j)).length, over: hotAll.length, wait: wait.length};
const cutList = hotAll.filter(j => !clean[j] || !liquid[j]).map(j => ({c: ALLC[j], n: nameOf(ALLC[j]), why: !clean[j] ? '? ' + WHY_TEXT[X.why[j]] : THIN_TEXT}))
  .sort((a, b) => cmp(a.n, b.n) || cmp(a.c, b.c));
const avg6 = []; for (let t = K - 5; t <= K; t++) avg6.push(d2(median(cleanJ.map(j => C[j][t] / C[j][K - 5] * 100))));
const market = {n: cleanJ.length, med: d2(mktMed * 100), up: cleanJ.filter(j => rr(j) > 0).length, down: cleanJ.filter(j => rr(j) < 0).length, avg6};
const binMap = new Map(); for (const j of cleanJ) { const b = Math.min(Math.max(Math.floor(rr(j) * 100), -20), 79); binMap.set(b, (binMap.get(b) ?? 0) + 1); }
const bins = [...binMap].filter(([, n]) => n > 0).sort((a, b) => a[0] - b[0]);
const whyN = {mkt: 0, ind: 0, co: 0}; for (const m of members) whyN[m.why]++;
const facts = {warn: 0, warnLive: 0, one: 0, reb: 0, half: 0, quiet: 0}; for (const m of members) for (const f of Object.keys(facts)) if (m[f]) facts[f]++;
const indN = new Map(); for (const m of members) indN.set(m.i, (indN.get(m.i) ?? 0) + 1);
const sameInd = [...indN].filter(([, n]) => n >= 3).sort((a, b) => b[1] - a[1] || cmp(a[0], b[0]));
const IN = KIND !== 'pick' ? [] : members.filter(m => m.tag === 'new').map(m => ({c: m.c, n: m.n, r5: m.r5, why: '5일 동안 ' + pctw(m.r5) + ' 올라 들어왔어요'}));
const OUT = prevMembers.filter(m => !seatSet.has(IX.get(m.c))).map(m => {
  const j = IX.get(m.c), inList = j !== undefined;
  let why;
  if (RULE) why = OUT_TEXT.rule;
  else if (!inList) why = OUT_TEXT.gone;
  else {
    const rs = reason.get(j);
    why = rs === 'q' ? OUT_TEXT.q + WHY_TEXT[X.why[j]] : rs === 'floor' ? (PP.asOf !== DAY && C[j][K] >= C[j][K - 1] ? OUT_TEXT.floorOld : OUT_TEXT.floorDown) : rs === 'rank' ? OUT_TEXT.rank : OUT_TEXT.seat;
  }
  return {c: m.c, n: nameOf(m.c) ?? m.n ?? null, r5: inList && clean[j] ? d2((R[j] - 1) * 100) : null, why};
});
const digest = crypto.createHash('sha256').update(`${VERSION}|${DAY}|${PROV ? 1 : 0}|${members.map(m => `${m.c}:${m.r5.toFixed(2)}`).join(',')}|${IN.map(x => x.c).join(',')}|${OUT.map(x => x.c).join(',')}`).digest('hex').slice(0, 16);
// 새 상태
const outCodes = new Set(OUT.map(o => o.c));
const recentOut = [...penUsed.filter(e => !outCodes.has(e.c)).map(e => ({c: e.c, day: e.day})), ...(RULE ? [] : OUT.map(o => ({c: o.c, day: DAY})))]
  .sort((a, b) => cmp(a.day, b.day) || cmp(a.c, b.c));
const pending = wait.map(j => ALLC[j]).sort(cmp);

// ── 맞대기 ──
same(S.schema, SCHEMA, 'schema'); same(S.version, VERSION, 'version');
same(S.kind, KIND, 'kind'); same(S.n, members.length, 'n'); same(S.cap, CAP, 'cap'); same(S.asOf, DAY, 'asOf');
same(S.provisional, PROV, 'provisional'); same(S.got, GOT, 'got'); same(S.window, D.slice(K - 5, K + 1), 'window');
const RN = {enter: 15, stay: 10, liq: 1, jump: 35, hist: 20, enterRank: 36, keepRank: 72, margin: 5, pen: 5, idleDays: IDLE_DAYS, idleMax: IDLE_MAX};
for (const [k, v] of Object.entries(RN)) same(S.rules?.[k], v, `rules.${k}`);
const SM = Array.isArray(S.members) ? S.members : [];
same(SM.map(m => m.c), members.map(m => m.c), 'members 번호 · 차례');
const FIELDS = ['c', 'n', 'i', 'g', 'mk', 'r5', 'v', 'd1', 'liq', 'warn', 'warnLive', 'one', 'reb', 'half', 'quiet', 'why', 'tag', 'since', 'sinceKst', 'sinceAsOf', 'rounds', 'prov'];
const smBy = new Map(SM.map(m => [m.c, m]));
for (const m of members) {
  const g = smBy.get(m.c);
  if (!g) { truth(false, `members.${m.c} 없음`, null, m); continue; }
  for (const f of FIELDS) same(g[f], m[f], `members.${m.c}.${f}`);
  same(Object.keys(g).sort(), [...FIELDS].sort(), `members.${m.c} 칸 이름`);
}
same(S.stats, stats, 'stats'); same(S.funnel, funnel, 'funnel'); same(S.cut, cut, 'cut'); same(S.cutList, cutList, 'cutList');
same(S.market, market, 'market'); same(S.bins, bins, 'bins'); same(S.why, whyN, 'why'); same(S.facts, facts, 'facts'); same(S.sameInd, sameInd, 'sameInd');
same(S.in, IN, 'in'); same(S.out, OUT, 'out'); same(S.confirm, confirm, 'confirm'); same(S.strict, STRICT, 'strict'); same(S.digest, digest, 'digest');
if (stateFile) {
  if (!fs.existsSync(stateFile)) truth(false, '상태 파일 없음', stateFile, '있음');
  else {
    const ST = J(stateFile);
    same(ST.asOf, DAY, 'state.asOf'); same(ST.recentOut, recentOut, 'state.recentOut'); same(ST.pending, pending, 'state.pending'); same(ST.confirms, confirms, 'state.confirms');
  }
}
finish.seen = {kind: KIND, asOf: DAY, provisional: PROV, files: nFiles, lastFile: lastFile?.file ?? null, all: NC, clean: cleanJ.length, liquid: nLiquid, picked: members.length, in: IN.length, out: OUT.length, wait: wait.length, strict: STRICT, digest};
finish();
