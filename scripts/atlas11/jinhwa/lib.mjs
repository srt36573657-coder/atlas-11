// 진화 회차 셈 한 곳 — 사장님 2026-10-18(싱가포르) 16:39 「[꼴똘이 · 진화가 본질인 명령문]」 [8] · [9] 8 · 9 · [10] 6 (원문 docs/design/kkolttori-2026-10-18/order-1639.txt)
//   망 · git · 브라우저를 부르지 않는 셈만 둔다(자기 시험이 망 없이 돎). 부르는 쪽 = round.mjs(순서) · gh.mjs(git · gh · 망) · shots.mjs(전후 그림)
//   이어받은 원칙(config/atlas11/evolution.v1.json): 「기계는 제 설정과 채점 규칙을 스스로 못 바꾼다」 → JINHWA_PROTECTED 를 건드린 대안 · 고장 고침은 막힘
//   닫힌 쪽으로 실패: 확인 상태 꼴을 모르면 「확인 없음」 · 합계 칸 꼴을 모르면 채점 안 함 · 본질 해시가 잠금과 다르면 회차를 멈춤
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

export const REPO = 'srt36573657-coder/atlas-11';
export const SITE = 'https://aaa7377.com';
export const STATUS_URL = SITE + '/api/jinhwa/status'; // 열쇠 없는 읽기(KD) — 번호 · 상태만
export const TALLY_URL = SITE + '/api/tally/sum';      // 열쇠 없는 읽기(KD) — 날마다 합계만
export const DATA_FILE = 'site/next/data/jinhwa.json';
export const IMG_DIR = 'site/next/data/jinhwa';
export const IMG_REL = 'data/jinhwa';                  // jinhwa.json 안 그림 길(/next/ 기준)
export const REC_DIR = 'reports/atlas11/jinhwa';
export const ESSENCE_FILE = 'docs/꼴똘이_본질.md';
export const LOCK_FILE = 'config/atlas11/essence.lock.json';
export const METRICS_FILE = 'config/atlas11/jinhwa-metrics.v1.json';
export const ORDER_FILE = 'docs/design/kkolttori-2026-10-18/order-1639.txt';
export const CAL_FILE = 'public/data/rolling-calendar.json';
export const LIVE_SUMMARY = 'reports/atlas11/probe/next-full/summary.json';
export const SCHEMA = 'kkolttori-jinhwa-1';
export const REC_SCHEMA = 'kkolttori-jinhwa-round-1';
export const MAX_FILES = 5;                            // [8] 7 「바뀌는 파일 다섯 개 안」
export const FIX_MAX_FILES = 3, FIX_MAX_LINES = 20;    // [8] 9 고장 고침 — 작은 것만(모양 · 뜻이 바뀌면 고장 고침이 아님)
export const FIX_KINDS = Object.freeze(['깨진 길', '날짜 「?」', '오타']);
export const SLOTS = Object.freeze([[10, 0], [12, 0], [14, 0], [18, 0]]); // 하루 4번 업데이트(평일 · 서울) — 예약 작업은 1분 앞 :59
export const ROUND_LEAD_MIN = 30;                      // 회차 = 업데이트 30분 전(09:30 · 11:30 · 13:30 · 17:30)
export const CARRY_MARGIN_MIN = 4;                     // 업데이트 4분 전까지 main 에 든 것이 그 업데이트에 실림
export const DEPLOY_WORKFLOWS = Object.freeze(['atlas11-site.yml', 'atlas11-daily.yml', 'atlas11-evening.yml']); // 올리기(deploy_netlify)가 있는 작업 — 같은 줄(atlas11-daily)
export const LOCK_BRANCH = 'jinhwa-lock', LOCK_STALE_MIN = 100; // 회차 둘이 겹치지 않게(회차 사이 2시간 넘음)
export const ID_RE = /^(\d{8})-(\d{4})-([1-3])$/;      // 대안 번호 = 회차 때(서울) + 1 ~ 3
export const FIX_ID_RE = /^(\d{8})-(\d{4})-f([1-9])$/;  // 고장 고침 번호
export const branchOf = id => 'jinhwa/' + id;
export const tryBranchOf = id => 'jinhwa-try/' + id;     // 넣기 · 되돌리기 · 고장 고침의 미리 검사 가지(끝나면 지움)
export const MIN_SAMPLE = 30;                          // [10] 5 표본이 작으면 판단하지 않음 — 잣대 파일에 minSample 이 있으면 그 값
export const SCORE_DAYS = 10, SCORE_MAX_DAYS = 60;      // [10] 6 10거래일 뒤 채점 · 표본이 작으면 60거래일까지 모음

// ───────────────────────── 때(서울 · 서머타임 없음) ─────────────────────────
const p2 = n => String(n).padStart(2, '0');
/** 서울 시각 조각 — {y, mo, d, H, M, wd(0 일요일), date 'YYYY-MM-DD'} */
export function kst(t = new Date()) {
  const x = new Date(new Date(t).getTime() + 9 * 36e5);
  return {y: x.getUTCFullYear(), mo: x.getUTCMonth() + 1, d: x.getUTCDate(), H: x.getUTCHours(), M: x.getUTCMinutes(), wd: x.getUTCDay(),
    date: `${x.getUTCFullYear()}-${p2(x.getUTCMonth() + 1)}-${p2(x.getUTCDate())}`};
}
/** 회차 번호 YYYYMMDD-HHMM(서울) */
export const roundId = t => { const k = kst(t); return `${k.y}${p2(k.mo)}${p2(k.d)}-${p2(k.H)}${p2(k.M)}`; };
/** ISO(서울 +09:00) — 화면에 서울 시각 그대로 */
export const isoKst = t => { const k = kst(t), s = new Date(t).getUTCSeconds(); return `${k.date}T${p2(k.H)}:${p2(k.M)}:${p2(s)}+09:00`; };
/** 서울 날 · 시 · 분 → Date */
const kstDate = (date, H, M) => new Date(`${date}T${p2(H)}:${p2(M)}:00+09:00`);
const addDays = (date, n) => { const t = new Date(date + 'T00:00:00Z'); t.setUTCDate(t.getUTCDate() + n); return t.toISOString().slice(0, 10); };
/** t 뒤(같거나)의 업데이트 때 n 개(평일 10 · 12 · 14 · 18시) */
export function slotsFrom(t, n = 1) {
  const out = [], t0 = new Date(t).getTime();
  for (let day = kst(t).date, guard = 0; out.length < n && guard < 30; day = addDays(day, 1), guard++) {
    const wd = new Date(day + 'T00:00:00Z').getUTCDay();
    if (wd === 0 || wd === 6) continue;
    for (const [H, M] of SLOTS) { const s = kstDate(day, H, M); if (s.getTime() >= t0 && out.length < n) out.push(s); }
  }
  return out;
}
/** 지금 main 에 넣으면 실리는 업데이트(4분 앞까지) */
export const carrySlot = (t = new Date()) => slotsFrom(new Date(new Date(t).getTime() + CARRY_MARGIN_MIN * 60e3))[0];
/** 「확인」하면 들어가는 업데이트 — 이 자료가 사이트에 오른 뒤 처음 도는 회차(업데이트 30분 전)의 업데이트 */
export function nextSlot(t = new Date()) {
  const live = carrySlot(t);
  return slotsFrom(new Date(live.getTime() + (ROUND_LEAD_MIN + 1) * 60e3))[0];
}
/** 쉬운 말 시각 — 「10월 19일 12시」 · 「12시 30분」 */
export const sayKst = (t, {day = true} = {}) => { const k = kst(t); return `${day ? `${k.mo}월 ${k.d}일 ` : ''}${k.H}시${k.M ? ` ${k.M}분` : ''}`; };

// ───────────────────────── 본질 ─────────────────────────
export const sha256 = b => crypto.createHash('sha256').update(b).digest('hex');
/** 본질 파일 — {text, sha, first(본질 첫 줄), lines(번호 줄), ruin(망치는 길 낱말)} · 없으면 throw */
export function readEssence(root) {
  const buf = fs.readFileSync(path.join(root, ESSENCE_FILE));
  const text = buf.toString('utf8').replace(/\r\n/g, '\n');
  const lines = text.split('\n').map(l => l.trim()).filter(l => /^\d+\.\s/.test(l)).map(l => l.replace(/^\d+\.\s*/, ''));
  const first = lines[0] || '';
  const after = text.split(/^##\s*망치는 길\s*$/m)[1] || '';
  const ruin = (after.split('\n').map(l => l.trim()).find(Boolean) || '').replace(/[.。]\s*$/, '').split(/\s*,\s*/).map(s => s.trim()).filter(Boolean);
  return {text, sha: sha256(buf), first, lines, ruin};
}
/** 본질 잠금 맞대기 — 잠금 파일 마지막 줄 sha256 = 지금 파일 · 명령문도 같이(essence_check ① 과 같은 뜻 · 회차가 먼저 봄) */
export function essenceLockCheck(root) {
  const bad = [];
  let lock;
  try { lock = JSON.parse(fs.readFileSync(path.join(root, LOCK_FILE), 'utf8')); } catch { return {ok: false, why: ['잠금 파일을 못 읽음']}; }
  for (const f of [ESSENCE_FILE, ORDER_FILE]) {
    const rows = lock?.files?.[f];
    if (!Array.isArray(rows) || !rows.length) { bad.push(`잠금에 ${f} 줄이 없음`); continue; }
    let now; try { now = sha256(fs.readFileSync(path.join(root, f))); } catch { bad.push(`${f} 를 못 읽음`); continue; }
    if (rows[rows.length - 1].sha256 !== now) bad.push(`${f} 해시가 잠금과 다름`);
  }
  return {ok: !bad.length, why: bad};
}
/** 망치는 길 낱말 — 본질 파일 목록 + 그 낱말의 머리(「폭죽과 연속 접속 보상」 → 「폭죽」 · 「연속 접속」) + words.js RUIN(있으면) */
export function ruinWords(essenceRuin, wordsRuin = []) {
  const out = new Set();
  for (const r of [...essenceRuin, ...(Array.isArray(wordsRuin) ? wordsRuin : [])]) {
    const s = String(r).trim(); if (!s) continue;
    out.add(s);
    for (const part of s.split(/과\s|와\s|,\s*/)) { const q = part.trim(); if (q.length >= 2) out.add(q); }
  }
  out.add('폭죽'); out.add('연속 접속'); out.add('수익 순위'); out.add('급등 자랑');
  return [...out];
}

// ───────────────────────── 못 고치는 파일 · 큰 것 ─────────────────────────
// [8] 10 「기계는 본질 파일, 망치는 길 목록, 잣대, 이 명령문을 스스로 고치지 못한다.」 + evolution.v1 「제 설정과 채점 규칙」 + 규칙 75(옛 화면) · 규칙 7(예약 파일)
//   끝이 / 면 폴더 · 정규식이면 꼴 · 나머지는 파일 하나. KA 의 essence_check protectedTouched 와 함께 봄(둘 중 하나라도 걸리면 막힘)
export const JINHWA_PROTECTED = Object.freeze([
  ['docs/꼴똘이_본질.md', '본질 파일'], ['config/atlas11/essence.lock.json', '본질 잠금'], [/^docs\/design\/[^/]+\/order-[^/]*\.txt$/, '사장님 명령문'],
  ['site/next/words.js', '망치는 길 · 쓰지 않을 말 목록'], ['config/atlas11/jinhwa-metrics.v1.json', '잣대 셋'],
  ['lib/atlas11/tally.mjs', '잣대 세기'], ['functions/atlas11/tally.mjs', '잣대 세기'],
  ['config/atlas11/evolution.v1.json', '옛 진화 설정'], ['config/atlas11/scoring-policy.v1.json', '채점 규칙'],
  ['scripts/atlas11/jinhwa/', '진화 회차 도구'], ['docs/design/kkolttori-2026-10-18/jinhwa-round.md', '진화 회차 지시문'],
  ['reports/atlas11/jinhwa/', '진화 기록(기록 단계만 · 새 파일만)'], ['site/next/data/', '자료(셈으로만 · 진화 칸 자료는 기록 단계만)'],
  ['site/next/p-jinhwa.js', '진화 칸(확인 단추)'], ['site/next/p-jinhwa.css', '진화 칸(확인 단추)'],
  ['lib/atlas11/jinhwa.mjs', '확인 상태'], ['functions/atlas11/jinhwa.mjs', '확인 상태'], ['lib/atlas11/invite.mjs', '사장님 열쇠'],
  ['scripts/atlas11/next/essence_check.mjs', '본질 문'], ['scripts/atlas11/art_gate.mjs', '올리기 문'], ['scripts/atlas11/trust_gate.mjs', '장부 문'],
  ['scripts/atlas11/face_gate.mjs', '얼굴 문'], ['scripts/atlas11/changelog_commit_gate.mjs', '커밋 번호 문'], ['scripts/atlas11/hooks/', '밀어 넣기 문'],
  ['scripts/atlas11/deploy_netlify.mjs', '올리기'], ['scripts/atlas11/package.mjs', '묶기'],
  [/^scripts\/atlas11\/next\/(check_[a-z0-9]+|next_check|next_en_check|quick|wait_preview|wip_preview|page_rules|run_all|net|measure[a-z_]*)\.mjs$/, '검사'],
  ['scripts/atlas11/next/shard/', '검사 나누기'], ['scripts/atlas11/next/verify/', '따로 세기'], ['scripts/atlas11/next/fixtures/', '검사 자료'],
  ['tests/', '시험'], ['.github/', '깃허브 작업(예약 · 검사)'], ['.claude/', 'Claude 방 설정'],
  ['CLAUDE.md', '규칙'], ['docs/ATLAS_원칙.md', '원칙'], ['docs/고도리_지도.md', '지도'], ['docs/고도리_규칙원문.md', '규칙 원문'],
  ['reports/atlas11/trust/', '틀림 장부'], ['site/next/brand.js', '이름(사장님 말씀으로만)'],
  ['site/atlas/', '옛 화면(규칙 75)'], ['site/app/', '옛 화면(규칙 75)'], ['site/us/', '옛 화면(규칙 75)'], ['site/new/', '옛 화면(규칙 75)'],
  ['site/index.html', '옛 화면(규칙 75)'], ['scripts/atlas11/t365/', '옛 화면(규칙 75)'],
  ['public/data/', '받은 자료'], ['package.json', '패키지'], ['package-lock.json', '패키지'], ['netlify.toml', '넷리파이 설정'],
]);
const matchP = (p, f) => (p instanceof RegExp ? p.test(f) : p.endsWith('/') ? f.startsWith(p) : f === p);
/** 못 고치는 파일에 닿은 것 — [{file, why}] */
export const protectedHits = files => files.flatMap(f => { const h = JINHWA_PROTECTED.find(([p]) => matchP(p, f)); return h ? [{file: f, why: h[1]}] : []; });

// [8] 8 「본질, 돈, 법, 개인정보, 카카오, 보안 규칙, 예약 작업, 새 기능에 닿는 대안은 「큰 것」 꼬리표와 위험 두 줄을 붙여라.」
export const BIG_PATHS = Object.freeze([
  [/^site\/next\/(essence\.js|p-why\.(js|css)|p-gdr\.(js|css))$/, '본질(열한 질문 · 꼴똘이 칸 · 본질 세 줄)'],
  [/^scripts\/atlas11\/next\/(build_data|half36)\.mjs$|^scripts\/atlas11\/next\/gdr\//, '본질 숫자 셈'],
  [/^site\/(hello|letter|invite)[^/]*$/, '돈(상품권) · 초대'],
  [/^site\/(privacy|terms)[^/]*$/, '법 · 개인정보'],
  [/kakao/i, '카카오'], [/^site\/next\/(share-btn\.js|p-share\.(js|css))$/, '카카오 · 보내기 글'],
  [/^functions\/|^lib\/atlas11\/|^scripts\/atlas11\/site_headers\.mjs$|^site\/_(headers|redirects)$/, '보안 규칙 · 서버'],
  [/^\.github\/|^scripts\/atlas11\/jinhwa\//, '예약 작업'],
]);
export const BIG_WORDS = Object.freeze([
  [/localStorage|sessionStorage|indexedDB|document\.cookie|sendBeacon|method:\s*['"]POST/i, '개인정보(기기에 담기 · 보내기)'],
  [/innerHTML|outerHTML|insertAdjacentHTML|\beval\(|new Function|<script/i, '보안 규칙'],
  [/상품권|만원|[0-9,]+\s*원\b/, '돈'],
]);
/** 큰 것 까닭 — files [{path, status}] · added = 더한 줄 글 */
export function bigReasons(files, added = '') {
  const out = new Set();
  for (const {path: f, status} of files) {
    if (status === 'A') out.add('새 기능(새 파일)');
    for (const [re, why] of BIG_PATHS) if (re.test(f)) out.add(why);
  }
  for (const [re, why] of BIG_WORDS) if (re.test(added)) out.add(why);
  return [...out];
}

/** 대안 크기 검사 — [8] 7 바뀐 파일 다섯 안 · 못 고치는 파일 0 · 지운 파일 0(한 번에 되돌리기 쉬운 것) */
export function fileCheck(files, {max = MAX_FILES} = {}) {
  const why = [], list = files.map(f => f.path);
  if (!files.length) why.push('바뀐 파일이 없음');
  if (files.length > max) why.push(`바뀐 파일 ${files.length}개 — ${max}개까지`);
  const ph = protectedHits(list);
  for (const h of ph) why.push(`못 고치는 파일 ${h.file}(${h.why})`);
  for (const f of files) if (f.status === 'D') why.push(`지운 파일 ${f.path} — 지우는 대안은 안 됨`);
  for (const f of files) if (!/^[\w.\-/가-힣]+$/.test(f.path) || f.path.includes('..')) why.push(`파일 이름이 이상함 ${f.path}`);
  return {ok: !why.length, why, count: files.length, protected: ph};
}
/** 고장 고침 검사 — [8] 9 갈래 셋 · 3파일 · 20줄 · css · 새 파일 · 지운 파일 0 · 못 고치는 파일 0 */
export function fixCheck(files, numstat, kind) {
  const why = [];
  if (!FIX_KINDS.includes(kind)) why.push(`고장 갈래가 아님(${kind || '없음'}) — ${FIX_KINDS.join(' · ')} 만`);
  const fc = fileCheck(files, {max: FIX_MAX_FILES});
  why.push(...fc.why);
  for (const f of files) {
    if (f.status === 'A') why.push(`새 파일 ${f.path} — 고장 고침이 아님`);
    if (/\.css$/.test(f.path)) why.push(`모양 파일 ${f.path} — 화면 모양이 바뀌면 고장 고침이 아님`);
  }
  const lines = numstat.reduce((s, r) => s + (Number(r.add) || 0) + (Number(r.del) || 0), 0);
  if (numstat.some(r => r.add === '-' || r.del === '-')) why.push('글이 아닌 파일(그림 등)이 바뀜 — 고장 고침이 아님');
  if (lines > FIX_MAX_LINES) why.push(`바뀐 줄 ${lines}줄 — ${FIX_MAX_LINES}줄까지`);
  return {ok: !why.length, why, lines};
}

/** 바뀐 내용 지문 — 줄 번호 · 둘레 줄 없이 파일마다 더한 줄 · 뺀 줄만(바탕이 바뀌어 다시 얹어도 같음 · 내용이 바뀌면 다름) */
export function changeHash(patchU0) {
  const per = new Map(); let cur = null;
  for (const l of String(patchU0).split('\n')) {
    if (l.startsWith('diff --git ')) { const m = / b\/(.+)$/.exec(l); cur = m ? m[1] : l; per.set(cur, []); continue; }
    if (!cur || l.startsWith('+++') || l.startsWith('---') || l.startsWith('@@') || l.startsWith('index ') || l.startsWith('new file') || l.startsWith('deleted file') || l.startsWith('similarity') || l.startsWith('rename ') || l.startsWith('old mode') || l.startsWith('new mode')) continue;
    if (l.startsWith('+') || l.startsWith('-') || l.startsWith('Binary files')) per.get(cur).push(l);
  }
  const h = crypto.createHash('sha256');
  for (const f of [...per.keys()].sort()) { h.update(f + '\n'); for (const l of per.get(f)) h.update(l + '\n'); h.update('\0'); }
  return h.digest('hex').slice(0, 16);
}
/** 더한 줄 글만(큰 것 · 낱말 검사용) */
export const addedText = patchU0 => String(patchU0).split('\n').filter(l => l.startsWith('+') && !l.startsWith('+++')).map(l => l.slice(1)).join('\n');

// ───────────────────────── 확인 상태(열쇠 없는 읽기) ─────────────────────────
const STATE_WORDS = Object.freeze({
  confirmed: ['confirmed', 'confirm', '확인', '확인함'],
  withdrawn: ['withdrawn', 'withdraw', '거둠', '확인 거둠', 'cancelled', 'canceled'],
  revert: ['revert', 'reverting', 'revert-requested', 'revert_requested', '되돌리기', '되돌림 요청'],
  waiting: ['waiting', 'none', 'new', '기다림', ''],
});
const stateOf = s => { const x = String(s ?? '').trim().toLowerCase(); for (const [k, ws] of Object.entries(STATE_WORDS)) if (ws.includes(x)) return k; return 'unknown'; };
const tsOf = v => { const t = Date.parse(v); return Number.isFinite(t) ? new Date(t).toISOString() : null; };
/** 상태 읽기 결과 → {ok, why, items: [{id, state, at}], unknown: n} — 꼴을 모르면 ok false(아무것도 넣지 않음) */
export function normalizeStatus(raw) {
  if (raw == null || typeof raw !== 'object') return {ok: false, why: '상태 꼴을 모름(글이 아님)', items: [], unknown: 0};
  let rows = null;
  if (Array.isArray(raw)) rows = raw;
  else for (const k of ['items', 'states', 'list', 'status', 'cards']) {
    const v = raw[k];
    if (Array.isArray(v)) { rows = v; break; }
    if (v && typeof v === 'object') { rows = Object.entries(v).map(([id, x]) => (x && typeof x === 'object' ? {id, ...x} : {id, state: x})); break; }
  }
  if (!rows) return {ok: false, why: '상태 꼴을 모름(items · states 없음)', items: [], unknown: 0};
  const items = [], seen = new Set(); let unknown = 0;
  for (const r of rows) {
    const id = String(r?.id ?? '');
    if (!ID_RE.test(id) || seen.has(id)) { unknown++; continue; }
    const state = stateOf(r.state ?? r.status);
    if (state === 'unknown') unknown++;
    seen.add(id);
    items.push({id, state, at: tsOf(r.at ?? r.time ?? r.updatedAt ?? r.confirmedAt ?? r.when)});
  }
  return {ok: true, why: '', items, unknown};
}

// ───────────────────────── 기록(새 파일만) ─────────────────────────
export const recordName = id => `${id}.json`;
/** 기록 읽기 — 이름 차례(때 차례) · 꼴이 다른 파일은 건너뜀 */
export function readRecords(dir) {
  let names = []; try { names = fs.readdirSync(dir).filter(n => n.endsWith('.json')).sort(); } catch { return []; }
  const out = [];
  for (const n of names) { try { const r = JSON.parse(fs.readFileSync(path.join(dir, n), 'utf8')); if (r?.schema === REC_SCHEMA) out.push({...r, _file: n}); } catch { /* 깨진 파일은 건너뜀 */ } }
  return out;
}
/** 기록 쓰기 — 같은 이름이 있으면 쓰지 않음([8] 10 새 파일만 · 지우지 않음) */
export function writeRecord(dir, rec) {
  fs.mkdirSync(dir, {recursive: true});
  const f = path.join(dir, recordName(rec.id));
  fs.writeFileSync(f, JSON.stringify(rec, null, 1) + '\n', {flag: 'wx'}); // 있으면 EEXIST
  return f;
}
/** 기록에서 대안 하나의 첫 지문 · 규칙 · 들어간 커밋 · 되돌림 */
export function memoryOf(records) {
  const m = new Map();
  const get = id => { if (!m.has(id)) m.set(id, {id}); return m.get(id); };
  for (const r of records) {
    for (const x of r.made ?? []) if (x?.ok && x.id) Object.assign(get(x.id), {changeHash: get(x.id).changeHash ?? x.changeHash, rule: x.rule ?? get(x.id).rule, madeAt: r.start, files: x.files});
    for (const x of r.pending ?? []) if (x?.id) Object.assign(get(x.id), {pending: {...x, round: r.id}});
    for (const x of r.made ?? []) if (x?.id && x.ok) delete get(x.id).pending;
    if (r.apply?.ok) Object.assign(get(r.apply.id), {merge: r.apply.merge, appliedAt: r.apply.at});
    if (r.revert?.ok) Object.assign(get(r.revert.id), {reverted: r.revert.at, revertCommit: r.revert.commit});
    for (const x of r.dropped ?? []) if (x?.id) Object.assign(get(x.id), {dropped: x.why});
  }
  return m;
}

// ───────────────────────── 이번 회차 할 일 ─────────────────────────
/** [8] 2 · 3 — 먼저 되돌리기 요청 · 확인된 것 하나(한 번에 하나 · 때 이른 것부터) → 그다음 기다리는 것이 있으면 다시 시험 · 없으면 새 대안 셋
 *  넣거나 되돌린 회차에는 새 대안을 만들지 않음(한 회차에 main 고침 하나 · 30분 안) — 남은 기다림은 다시 시험 */
export function planRound({data, status, records = []}) {
  const mem = memoryOf(records);
  const applied = new Map((data?.applied ?? []).map(a => [a.id, a]));
  const waiting = new Map((data?.waiting ?? []).map(w => [w.id, w]));
  const ignored = [];
  let change = null;
  if (status?.ok) {
    const order = (a, b) => (a.at ?? '9999').localeCompare(b.at ?? '9999') || a.id.localeCompare(b.id);
    const reverts = [], confirms = [];
    for (const it of status.items) {
      if (it.state === 'revert') {
        if (!applied.has(it.id)) ignored.push({id: it.id, why: '되돌리기 요청 — 들어간 목록에 없음'});
        else if (applied.get(it.id).reverted || mem.get(it.id)?.reverted) ignored.push({id: it.id, why: '이미 되돌림'});
        else reverts.push(it);
      } else if (it.state === 'confirmed') {
        if (applied.has(it.id) || mem.get(it.id)?.merge) ignored.push({id: it.id, why: '이미 들어감'});
        else if (!waiting.has(it.id)) ignored.push({id: it.id, why: '확인 — 기다리는 목록에 없음(내려간 대안)'});
        else confirms.push(it);
      } else if (it.state === 'unknown') ignored.push({id: it.id, why: '모르는 상태 — 확인으로 치지 않음'});
    }
    reverts.sort(order); confirms.sort(order);
    if (reverts[0]) change = {kind: 'revert', id: reverts[0].id, at: reverts[0].at, why: '사장님 되돌리기 요청'};
    else if (confirms[0]) change = {kind: 'apply', id: confirms[0].id, at: confirms[0].at, why: '사장님 확인'};
    for (const x of [...reverts.slice(change?.kind === 'revert' ? 1 : 0), ...confirms.slice(change?.kind === 'apply' ? 1 : 0)])
      ignored.push({id: x.id, why: '한 번에 하나 — 다음 회차'});
  }
  const left = [...waiting.keys()].filter(id => !(change?.kind === 'apply' && change.id === id));
  const pending = [...mem.values()].filter(x => x.pending && !waiting.has(x.id) && !x.dropped && !x.merge).map(x => x.id);
  let next;
  if (pending.length) next = 'finish';          // 지난 회차에 만들었는데 미리 검사를 못 기다린 것 — 결과부터
  else if (left.length) next = 'retest';        // [8] 3 있으면 새로 만들지 말고 새 자료로 다시 시험
  else if (change) next = 'none';               // 넣은 회차 — 새 대안은 다음 회차
  else next = 'make';                           // [8] 3 없으면 세 사람 토론 → 대안 셋
  return {change, next, retest: next === 'retest' ? left : [], pending, ignored, statusOk: !!status?.ok, statusWhy: status?.ok ? '' : status?.why ?? '상태를 못 읽음'};
}

// ───────────────────────── 화면 글 검사 ─────────────────────────
/** 카드 · 진화 칸 글 검사 — 쓰지 않을 말 · 망치는 길 · 수익 자랑 낱말 · 옛 이름 · 퍼센트 → 걸린 것 목록 */
export function textHits(text, {screenHits = () => [], ruin = [], gainWords = [], oldNames = []} = {}) {
  const t = String(text ?? ''), out = [];
  for (const w of screenHits(t)) out.push(`쓰지 않을 말 「${w}」`);
  for (const w of ruin) if (w && t.includes(w)) out.push(`망치는 길 낱말 「${w}」`);
  for (const w of gainWords) if (w && t.includes(w)) out.push(`수익 자랑 낱말 「${w}」`);
  for (const w of oldNames) if (w && t.includes(w)) out.push(`옛 이름 「${w}」`);
  if (/[%％]|퍼센트/.test(t)) out.push('퍼센트 — 「10번 중 n번」처럼 말로');
  return [...new Set(out)];
}

// ───────────────────────── jinhwa.json(KE 가 씀 · KD 가 그림 · split.md 꼴 그대로) ─────────────────────────
export const TOP_KEYS = Object.freeze(['schema', 'made', 'essence', 'n', 'next', 'waiting', 'applied', 'fixed', 'facts']);
export const WAIT_KEYS = Object.freeze(['id', 'title', 'pick', 'serves', 'before', 'after', 'voices', 'predict', 'revert', 'premortem', 'big', 'risks', 'branch', 'files', 'checks']);
export const APPLIED_KEYS = Object.freeze(['id', 'title', 'at', 'before', 'after', 'predict', 'score']);
export const APPLIED_OPT = Object.freeze(['reverted']); // 되돌린 것 — {at}(split.md 에 없는 더한 칸 · 보고에 적음)
export const LIM = Object.freeze({title: 40, serves: 80, voice: 120, text: 120, what: 120});
export const imgOf = (id, which) => `${IMG_REL}/${id}-${which}.png`;
export const imgFileOf = (id, which) => `${IMG_DIR}/${id}-${which}.png`;

/** 정직한 빈 판 — 진화 0 · 기다림 0 · 들어간 것 0 · 고친 고장 0 */
export function emptyJinhwa({essence, now = new Date()}) {
  return {schema: SCHEMA, made: isoKst(now), essence, n: 0, next: isoKst(nextSlot(now)), waiting: [], applied: [], fixed: [], facts: {mismatch: null, at: null}};
}
const isStr = (v, max) => typeof v === 'string' && v.trim().length > 0 && v.length <= max;
const exactKeys = (o, keys, opt = []) => { const k = Object.keys(o ?? {}); return keys.every(x => k.includes(x)) && k.every(x => keys.includes(x) || opt.includes(x)); };
const ISO_RE = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2})?(\.\d+)?(Z|[+-]\d{2}:\d{2})$/;
/** 꼴 검사 — {ok, errors} · measures = 잣대 번호들 · exists(파일) = 그림이 있나(없으면 안 봄) · words = textHits 옵션 */
export function validateJinhwa(d, {measures = null, exists = null, words = null} = {}) {
  const e = [], E = s => e.push(s);
  if (!d || typeof d !== 'object' || Array.isArray(d)) return {ok: false, errors: ['글이 아님']};
  if (!exactKeys(d, TOP_KEYS)) E(`맨 위 칸이 다름 — ${Object.keys(d).join(',')}`);
  if (d.schema !== SCHEMA) E('schema 가 다름');
  if (!ISO_RE.test(d.made ?? '')) E('made 가 때 꼴이 아님');
  if (!isStr(d.essence, 120)) E('essence 가 비었음');
  if (!ISO_RE.test(d.next ?? '')) E('next 가 때 꼴이 아님');
  for (const k of ['waiting', 'applied', 'fixed']) if (!Array.isArray(d[k])) E(`${k} 가 목록이 아님`);
  if (e.length) return {ok: false, errors: e};
  if (!Number.isInteger(d.n) || d.n !== d.applied.length) E(`n(${d.n}) = 들어간 수(${d.applied.length}) 가 아님`);
  if (d.waiting.length > 3) E('기다리는 대안은 셋까지');
  const ids = new Set(), picks = new Set();
  const txt = [];
  const predictOk = (p, where) => {
    if (!exactKeys(p, ['text', 'measure', 'days'])) { E(`${where} predict 칸이 다름`); return; }
    if (!isStr(p.text, LIM.text)) E(`${where} predict.text`);
    if (p.days !== SCORE_DAYS) E(`${where} predict.days 는 ${SCORE_DAYS}`);
    if (!isStr(p.measure, 40) || (measures && !measures.includes(p.measure))) E(`${where} predict.measure 가 잣대 셋 밖(${p.measure})`);
    txt.push(p.text);
  };
  for (const [i, w] of d.waiting.entries()) {
    const at = `waiting[${i}]`;
    if (!exactKeys(w, WAIT_KEYS)) { E(`${at} 칸이 다름 — ${Object.keys(w ?? {}).join(',')}`); continue; }
    if (!ID_RE.test(w.id) || ids.has(w.id)) E(`${at} id`); ids.add(w.id);
    if (![1, 2, 3].includes(w.pick) || picks.has(w.pick)) E(`${at} pick`); picks.add(w.pick);
    if (!isStr(w.title, LIM.title)) E(`${at} title`);
    if (!isStr(w.serves, LIM.serves)) E(`${at} serves`);
    if (w.before !== imgOf(w.id, 'before') || w.after !== imgOf(w.id, 'after')) E(`${at} 전후 그림 길`);
    if (!exactKeys(w.voices, ['kahneman', 'munger', 'popper']) || !['kahneman', 'munger', 'popper'].every(k => isStr(w.voices[k], LIM.voice))) E(`${at} 세 사람 한마디`);
    else txt.push(w.voices.kahneman, w.voices.munger, w.voices.popper);
    predictOk(w.predict, at);
    if (!isStr(w.revert, LIM.text)) E(`${at} revert`); if (!isStr(w.premortem, LIM.text)) E(`${at} premortem`);
    if (typeof w.big !== 'boolean') E(`${at} big`);
    if (!Array.isArray(w.risks) || (w.big ? w.risks.length !== 2 : w.risks.length !== 0) || !w.risks.every(r => isStr(r, LIM.text))) E(`${at} 큰 것이면 위험 두 줄 · 아니면 빈 목록`);
    if (w.branch !== branchOf(w.id)) E(`${at} branch`);
    if (!Array.isArray(w.files) || !w.files.length || w.files.length > MAX_FILES || !w.files.every(f => typeof f === 'string')) E(`${at} files`);
    else if (protectedHits(w.files).length) E(`${at} 못 고치는 파일`);
    if (!exactKeys(w.checks, ['changed', 'preview']) || w.checks.changed !== 0 || w.checks.preview !== 0) E(`${at} 검사 실패 0 이 아님`);
    txt.push(w.title, w.revert, w.premortem, ...(w.risks ?? []));
    if (exists) for (const k of ['before', 'after']) if (!exists(imgFileOf(w.id, k))) E(`${at} ${k} 그림 파일이 없음`);
  }
  for (const [i, a] of d.applied.entries()) {
    const at = `applied[${i}]`;
    if (!exactKeys(a, APPLIED_KEYS, APPLIED_OPT)) { E(`${at} 칸이 다름 — ${Object.keys(a ?? {}).join(',')}`); continue; }
    if (!ID_RE.test(a.id) || ids.has(a.id)) E(`${at} id`); ids.add(a.id);
    if (!isStr(a.title, LIM.title)) E(`${at} title`);
    if (!ISO_RE.test(a.at ?? '')) E(`${at} at`);
    if (a.before !== imgOf(a.id, 'before') || a.after !== imgOf(a.id, 'after')) E(`${at} 전후 그림 길`);
    predictOk(a.predict, at);
    if (!exactKeys(a.score, ['at', 'ok', 'text']) || !(a.score.at === null || ISO_RE.test(a.score.at)) || ![true, false, null].includes(a.score.ok) || !isStr(a.score.text, LIM.text)) E(`${at} score`);
    else txt.push(a.score.text);
    if ('reverted' in a && !(exactKeys(a.reverted, ['at']) && ISO_RE.test(a.reverted.at ?? ''))) E(`${at} reverted`);
    txt.push(a.title);
    if (exists) for (const k of ['before', 'after']) if (!exists(imgFileOf(a.id, k))) E(`${at} ${k} 그림 파일이 없음`);
    if (i > 0 && String(a.at) < String(d.applied[i - 1].at)) E(`${at} 날짜 차례가 아님`);
  }
  for (const [i, f] of d.fixed.entries()) {
    if (!exactKeys(f, ['at', 'what']) || !ISO_RE.test(f.at ?? '') || !isStr(f.what, LIM.what)) E(`fixed[${i}]`);
    else txt.push(f.what);
  }
  if (!exactKeys(d.facts, ['mismatch', 'at']) || !(d.facts.mismatch === null || (Number.isInteger(d.facts.mismatch) && d.facts.mismatch >= 0)) || !(d.facts.at === null || ISO_RE.test(d.facts.at))) E('facts');
  if (words) for (const t of txt) for (const h of textHits(t, words)) E(`글 「${String(t).slice(0, 24)}」 — ${h}`);
  return {ok: !e.length, errors: e};
}

// ───────────────────────── 대안 셋 고르기 · 카드 ─────────────────────────
export const PEOPLE = Object.freeze(['kahneman', 'munger', 'popper']);
/** [8] 6 세 눈 — 카너먼: 더 빨리 사게 하나(아니오) · 멍거: 망치는 길에 닿나 · 잣대를 비트나(아니오) · 포퍼: 어림 · 되돌릴 조건 · 작은가(예) */
export function eyesCheck(eyes) {
  const why = [];
  const k = eyes?.kahneman, m = eyes?.munger, p = eyes?.popper;
  if (!k || k.faster !== false) why.push('카너먼 눈 — 더 빨리 사게 함(또는 답 없음)');
  if (!m || m.ruin !== false) why.push('멍거 눈 — 망치는 길에 닿음(또는 답 없음)');
  if (!m || m.bend !== false) why.push('멍거 눈 — 잣대를 비틂(또는 답 없음)');
  if (!p || p.predict !== true) why.push('포퍼 눈 — 어림이 없음');
  if (!p || p.revert !== true) why.push('포퍼 눈 — 되돌릴 조건이 없음');
  if (!p || p.small !== true) why.push('포퍼 눈 — 작지 않음');
  return {ok: !why.length, why};
}
/** 토론 결과 맞대기 — {ok, why, order: [n …](1번 = 셋이 함께 고른 것)}
 *  debate = {alts: [{n, changeHash, eyes, accept: {kahneman: bool, munger: bool, popper: bool}, top: {kahneman: n, …}}]} */
export function pickCheck(debate) {
  const why = [];
  const alts = Array.isArray(debate?.alts) ? debate.alts : [];
  if (!alts.length) return {ok: false, why: ['대안이 없음'], order: []};
  const hashes = new Set();
  for (const a of alts) {
    if (!a.changeHash) why.push(`대안 ${a.n} 지문이 없음`);
    else if (hashes.has(a.changeHash)) why.push(`대안 ${a.n} 이 다른 대안과 같은 고침 — 서로 달라야 함`);
    hashes.add(a.changeHash);
    const ec = eyesCheck(a.eyes); if (!ec.ok) why.push(`대안 ${a.n}: ${ec.why.join(' · ')}`);
  }
  const fileSets = alts.map(a => (a.files ?? []).slice().sort().join('|'));
  for (let i = 0; i < alts.length; i++) for (let j = i + 1; j < alts.length; j++) if (fileSets[i] && fileSets[i] === fileSets[j] && alts[i].title === alts[j].title) why.push(`대안 ${alts[i].n} 과 ${alts[j].n} 이 같은 고칠 거리`);
  const unanimous = alts.filter(a => PEOPLE.every(p => a.accept?.[p] === true));
  if (!unanimous.length) why.push('세 사람이 함께 고른 1번이 없음');
  const tops = a => PEOPLE.filter(p => a.n === debate.top?.[p]).length;
  const first = unanimous.slice().sort((a, b) => tops(b) - tops(a) || a.n - b.n)[0];
  const rest = alts.filter(a => a !== first).sort((a, b) => tops(b) - tops(a) || PEOPLE.filter(p => b.accept?.[p]).length - PEOPLE.filter(p => a.accept?.[p]).length || a.n - b.n);
  return {ok: !why.length, why, order: first ? [first.n, ...rest.map(a => a.n)] : []};
}
/** 카드 초안(토론이 쓴 것) → waiting 카드 · 검사 — 초안 = {title, serves, voices, predict: {text, measure, rule}, revert, premortem, big, risks} */
export function cardFrom(draft, {id, pick, files, essenceLines, measures, big: bigWhy, words}) {
  const why = [];
  const s = String(draft?.serves ?? '').trim();
  if (!essenceLines.some(l => l === s)) why.push('섬기는 본질 줄이 본질 파일의 줄 그대로가 아님');
  const card = {id, title: String(draft?.title ?? '').trim(), pick, serves: s, before: imgOf(id, 'before'), after: imgOf(id, 'after'),
    voices: {kahneman: String(draft?.voices?.kahneman ?? '').trim(), munger: String(draft?.voices?.munger ?? '').trim(), popper: String(draft?.voices?.popper ?? '').trim()},
    predict: {text: String(draft?.predict?.text ?? '').trim(), measure: String(draft?.predict?.measure ?? '').trim(), days: SCORE_DAYS},
    revert: String(draft?.revert ?? '').trim(), premortem: String(draft?.premortem ?? '').trim(), big: !!draft?.big || bigWhy.length > 0,
    risks: (Array.isArray(draft?.risks) ? draft.risks : []).map(r => String(r).trim()).filter(Boolean), branch: branchOf(id), files: files.slice(), checks: {changed: 0, preview: 0}};
  if (card.big && card.risks.length !== 2) why.push(`큰 것(${bigWhy.join(' · ') || '토론이 정함'}) — 위험 두 줄이 있어야 함`);
  if (!card.big) card.risks = [];
  const rule = draft?.predict?.rule;
  if (!rule || !card.predict.measure || rule.measure !== card.predict.measure || !['up', 'down', 'zero'].includes(rule.dir) || !rule.num) why.push('어림을 잴 규칙(predict.rule: measure · num · dir)이 없거나 measure 와 다름');
  if (measures && !measures.includes(card.predict.measure)) why.push(`잣대 셋 밖(${card.predict.measure}) — ${measures.join(' · ')} 만`);
  const v = validateJinhwa({schema: SCHEMA, made: isoKst(new Date(0)), essence: 'x', n: 0, next: isoKst(new Date(0)), waiting: [card], applied: [], fixed: [], facts: {mismatch: null, at: null}}, {measures, words});
  why.push(...v.errors.map(x => x.replace(/^waiting\[0\] ?/, '')));
  return {ok: !why.length, why, card, rule: rule ?? null};
}

// ───────────────────────── 채점([10] 6 · 10거래일 뒤) ─────────────────────────
/** 거래일 — 거래일 달력(public/data/rolling-calendar.json sessions) · 달력 밖은 평일 */
export function tradingDays(cal, fromDate, toDate) {
  const S = new Set(cal?.sessions ?? []), end = cal?.coverageEnd ?? '', out = [];
  for (let d = fromDate; d <= toDate; d = addDays(d, 1)) {
    const wd = new Date(d + 'T00:00:00Z').getUTCDay();
    if (d <= end && S.size) { if (S.has(d)) out.push(d); }
    else if (wd !== 0 && wd !== 6 && !(cal?.holidays && d in cal.holidays)) out.push(d);
  }
  return out;
}
/** 합계 칸 꼴 → {ok, days: {YYYY-MM-DD: {열쇠: 수}}} — 모르면 ok false(채점 안 함) */
export function normalizeTally(raw) {
  if (!raw || typeof raw !== 'object') return {ok: false, why: '합계 꼴을 모름', days: {}};
  let src = raw.days ?? raw.byDay ?? raw.daily ?? raw.rows ?? null;
  if (!src) return {ok: false, why: '합계 꼴을 모름(days 없음)', days: {}};
  const days = {};
  const put = (day, o) => { if (!/^\d{4}-\d{2}-\d{2}$/.test(String(day)) || !o || typeof o !== 'object') return; const x = {}; for (const [k, v] of Object.entries(o)) if (Number.isFinite(Number(v)) && typeof v !== 'boolean' && k !== 'day' && k !== 'date') x[k] = Number(v); days[day] = x; };
  if (Array.isArray(src)) for (const r of src) put(r?.day ?? r?.date, r?.counts ?? r?.n ?? r);
  else for (const [day, o] of Object.entries(src)) put(day, o?.counts ?? o);
  return {ok: true, why: '', days};
}
/** 들어간 대안 하나 채점 — {done, ok, text, n(쓴 거래일)} · done false = 아직(10거래일 안 됨 · 표본 모으는 중)
 *  rule = {measure, num, den?, dir: up | down | zero} · facts 잣대는 회차 기록의 facts.mismatch(때마다) 로 */
export function scoreApplied({rule, at, today, cal, tally, rounds = [], minSample = MIN_SAMPLE}) {
  const d0 = kst(at).date, before = tradingDays(cal, addDays(d0, -200), addDays(d0, -1)), after = tradingDays(cal, addDays(d0, 1), addDays(today, -1));
  if (after.length < SCORE_DAYS) return {done: false, ok: null, text: `채점 전 — 들어간 뒤 ${SCORE_DAYS}거래일이 지나면 매겨요`, n: after.length};
  if (!rule?.num || !['up', 'down', 'zero'].includes(rule.dir)) return {done: true, ok: null, text: '잴 규칙이 없어 채점 못 함 · ?', n: 0};
  const N = Math.min(after.length, SCORE_MAX_DAYS), A = after.slice(0, N), B = before.slice(-N);
  let va, vb, sa, sb;
  if (rule.measure === 'fact' || rule.num === 'mismatch') {
    const inWin = W => rounds.filter(r => W.includes(kst(r.at).date) && Number.isInteger(r.mismatch)).map(r => r.mismatch);
    const a = inWin(A), b = inWin(B);
    sa = a.length; sb = b.length; va = a.length ? Math.max(...a) : null; vb = b.length ? Math.max(...b) : null;
    if (!sa) return N >= SCORE_MAX_DAYS ? {done: true, ok: null, text: '사실 잣대 기록이 없어 판단 못 함 · ?', n: N} : {done: false, ok: null, text: '사실 잣대 기록을 모으는 중', n: N};
    const ok = rule.dir === 'zero' ? va === 0 : rule.dir === 'down' ? vb != null && va < vb : vb != null && va > vb;
    return {done: true, ok, text: ok ? '맞았어요 — 화면 숫자가 자료와 다른 곳이 그대로 0' : `틀렸어요 — 화면 숫자가 자료와 다른 곳 ${va}곳`, n: N};
  }
  if (!tally?.ok) return {done: false, ok: null, text: '합계 칸을 못 읽어 채점을 미뤄요 · ?', n: N};
  const sum = (W, k) => W.reduce((s, d) => s + (Number(tally.days[d]?.[k]) || 0), 0);
  const val = W => { const n = sum(W, rule.num); if (rule.den) { const den = sum(W, rule.den); return {v: den ? n / den : null, s: den}; } return {v: n / W.length, s: n}; };
  ({v: va, s: sa} = val(A)); ({v: vb, s: sb} = val(B));
  if (sa < minSample || sb < minSample || va == null || vb == null) {
    if (N >= SCORE_MAX_DAYS) return {done: true, ok: null, text: `${SCORE_MAX_DAYS}거래일 동안 표본이 작아 판단 못 했어요`, n: N};
    return {done: false, ok: null, text: '표본이 작아 판단하지 않아요 — 모으는 중', n: N};
  }
  const ok = rule.dir === 'up' ? va > vb : rule.dir === 'down' ? va < vb : va === 0;
  return {done: true, ok, text: ok ? `맞았어요 — 들어가기 전 ${N}거래일보다 나아졌어요` : `틀렸어요 — 들어가기 전 ${N}거래일보다 나아지지 않았어요`, n: N};
}

// ───────────────────────── 사실 잣대(화면 숫자 = 자료) ─────────────────────────
/** 지금 사이트 모든 쪽 검사(live) 결과 → {mismatch, at} · 쪽 파일의 fails 수 합(fails 가 없는데 실패면 1) · 이틀 넘게 묵으면 「?」(null) */
export function factsFrom(summary, pageFails = {}, now = new Date()) {
  if (!summary || summary.mode !== 'live' || !Array.isArray(summary.pages) || !ISO_RE.test(summary.at ?? '')) return {mismatch: null, at: null};
  if (new Date(now) - new Date(summary.at) > 2 * 864e5) return {mismatch: null, at: isoKst(summary.at)};
  let n = 0;
  for (const p of summary.pages) { const f = pageFails[p.name]; n += Number.isInteger(f) && f > 0 ? f : p.code !== 0 ? 1 : 0; }
  return {mismatch: n, at: isoKst(summary.at)};
}

// ───────────────────────── 사장님께 세 줄(아주 쉬운 말) ─────────────────────────
/** r = {applied, reverted, fixed, made, retested, dropped, waiting, carry, next, failed, notDone} → 세 줄(문장마다 짧게 · 「·」 하나까지) */
export function ownerLines(r) {
  const L = [];
  const when = r.carry ? sayKst(r.carry, {day: false}) : '다음';
  if (r.applied) L.push(`확인하신 진화 하나를 넣었어요. ${when} 업데이트에 실려요.`);
  else if (r.reverted) L.push(`말씀하신 진화 하나를 되돌렸어요. ${when} 업데이트에 실려요.`);
  else if (r.made) L.push(`새 진화 대안 ${r.made}개를 만들었어요.`);
  else if (r.retested) L.push(`기다리는 대안 ${r.retested}개를 새 자료로 다시 시험했어요.`);
  else if (r.fixed) L.push(`고장 ${r.fixed}개를 고쳤어요.`);
  else L.push('이번 진화 회차는 바꾼 것이 없어요.');
  if (r.failed) L.push(`${r.failed} — 그래서 넣지 않았어요.`);
  else if (r.waiting) L.push(`진화 칸에서 대안 ${r.waiting}개가 확인을 기다려요.`);
  else L.push('진화 칸에 기다리는 대안은 없어요.');
  L.push(`확인 없이 들어간 것은 0개예요. 못 한 것은 ${r.notDone ?? 0}가지예요.`);
  return L.slice(0, 3);
}
