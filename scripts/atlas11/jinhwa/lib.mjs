// 진화 회차 셈 한 곳 — 사장님 2026-10-18(싱가포르) 16:39 「[꼴똘이 · 진화가 본질인 명령문]」 [8] · [9] 8 · 9 · [10] 6 (원문 docs/design/kkolttori-2026-10-18/order-1639.txt)
//   이름 = 골똘이(17:18 「골똘이!」) — 본질 파일은 잠금 파일(config/atlas11/essence.lock.json)이 가리키는 docs/<이름>_본질.md · 이름 글자는 brand.js 에서만 읽음
//   망 · git · 브라우저를 부르지 않는 셈만 둔다(자기 시험이 망 없이 돎). 부르는 쪽 = round.mjs(차례) · gh.mjs(git · gh · 망) · shots.mjs(전후 그림)
//   이어받은 원칙(config/atlas11/evolution.v1.json 「모델·실행기는 이 파일과 채점 정책을 스스로 바꾸지 못한다」): JINHWA_PROTECTED 를 건드린 대안 · 고장 고침은 막힘
//   닫힌 쪽으로 실패: 확인 상태 꼴을 모르면 「확인 없음」 · 합계 칸 꼴을 모르면 채점 안 함 · 본질 해시가 잠금과 다르면 회차를 멈춤
//   자료 꼴(split.md · KD 의 진화 칸 site/next/p-jinhwa.js 와 서버 lib/atlas11/jinhwa.mjs 가 읽는 그대로):
//     pick = 참 거짓(세 사람이 함께 고른 1번만 참 · 차례 = waiting 목록 차례) · before · after = /next/data/jinhwa/<번호>-before.png · -after.png
//     되돌린 진화 = applied[].revertedAt(서울 시각 ISO) · predict.measure = 잣대 셋 가운데 하나를 쉬운 말로(재는 법 줄에 그대로 보임)
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {PROTECTED as GATE_PROTECTED, protectedTouched} from '../next/essence_check.mjs'; // 지킴 목록 한 곳 = 본질 문(KA) — 회차는 그 위에 더 막을 곳만 더함(ROUND_EXTRA)
import {judge as tallyJudge} from '../../../lib/atlas11/tally.mjs';                     // 판단 한 곳 = 합계 칸(KD) — 표본 30 · |z| < 1.96 = 보류(잣대 파일 judge 그대로)
export {GATE_PROTECTED};

export const REPO = 'srt36573657-coder/atlas-11';
export const SITE = 'https://aaa7377.com';
export const STATUS_URL = SITE + '/api/jinhwa/status'; // 열쇠 없는 읽기(KD) — 번호 · 상태 · 때만
export const TALLY_URL = SITE + '/api/tally/sum';      // 열쇠 없는 읽기(KD) — 잣대 칸 넷의 날마다 합계만(62일까지)
export const DATA_FILE = 'site/next/data/jinhwa.json';
export const IMG_DIR = 'site/next/data/jinhwa';
export const IMG_WEB = '/next/data/jinhwa';            // jinhwa.json 안 그림 길(p-jinhwa.js IMG_RE 와 같은 꼴)
export const REC_DIR = 'reports/atlas11/jinhwa';
export const ESSENCE_FILE = 'docs/골똘이_본질.md';     // 잠금 파일이 다른 이름을 가리키면 그것을 씀(essenceFileOf)
export const OLD_ESSENCE_FILES = Object.freeze(['docs/꼴똘이_본질.md', 'docs/꼴동이_본질.md']);
export const LOCK_FILE = 'config/atlas11/essence.lock.json';
export const METRICS_FILE = 'config/atlas11/jinhwa-metrics.v1.json';
export const ORDER_FILE = 'docs/design/kkolttori-2026-10-18/order-1639.txt';
export const ROUND_DOC = 'docs/design/kkolttori-2026-10-18/jinhwa-round.md';
export const CAL_FILE = 'public/data/rolling-calendar.json';
export const LIVE_DIR = 'reports/atlas11/probe/next-full';  // 지금 사이트 모든 쪽 검사(live) 결과 — 사실 잣대
export const SCHEMA = 'kkolttori-jinhwa-1';
export const REC_SCHEMA = 'kkolttori-jinhwa-round-1';
export const MAX_FILES = 5;                            // [8] 7 「바뀌는 파일 다섯 개 안」
export const FIX_MAX_FILES = 3, FIX_MAX_LINES = 20, FIX_MAX_CHARS = 24, FIX_MAX_PER_ROUND = 1; // [8] 9 고장 고침 — 작은 것만(모양 · 뜻이 바뀌면 고장 고침이 아님)
export const FIX_KINDS = Object.freeze(['깨진 길', '날짜 「?」', '오타']);
export const SLOTS = Object.freeze([[10, 0], [12, 0], [14, 0], [18, 0]]); // 하루 4번 업데이트(평일 · 서울) — 업데이트 예약 작업은 1분 앞 :59
export const ROUND_LEAD_MIN = 30;                      // 회차 = 업데이트 30분 전(09:30 · 11:30 · 13:30 · 17:30)
export const CARRY_MARGIN_MIN = 4;                     // 업데이트 4분 전까지 main 에 든 것이 그 업데이트에 실림
export const DEPLOY_WORKFLOWS = Object.freeze(['atlas11-site.yml', 'atlas11-daily.yml', 'atlas11-evening.yml']); // 사이트를 올리는 작업 — [8] 2 「다른 올리기가 돌고 있으면 끝날 때까지 기다려라」
export const LOCK_BRANCH = 'jinhwa-lock', LOCK_STALE_MIN = 100; // 회차 둘이 겹치지 않게(회차 사이 2시간 넘음)
export const ID_RE = /^(\d{8})-(\d{4})-([1-3])$/;      // 대안 번호 = 회차 때(서울) + 1 ~ 3
export const FIX_ID_RE = /^(\d{8})-(\d{4})-f([1-9])$/;  // 고장 고침 번호
export const ROUND_RE = /^\d{8}-\d{4}$/;
export const branchOf = id => 'jinhwa/' + id;           // 대안 가지 — 만든 그대로 둠(혼자서도 들어갈 수 있게 · [8] 4)
export const tryBranchOf = id => 'jinhwa-try/' + id;    // 다시 얹은 판의 미리 검사 가지(그 번호가 기다림에서 나가면 지움)
export const fixBranchOf = id => 'jinhwa-fix/' + id;
export const MIN_SAMPLE = 30;                          // [10] 5 — 잣대 파일 judge.minSample 이 있으면 그 값
export const SCORE_DAYS = 10, SCORE_MAX_DAYS = 60;    // [10] 6 10거래일 뒤 채점 · 표본이 작으면 같은 길이로 늘려 60거래일까지 모음(판단 문턱은 lib/atlas11/tally.mjs judge 한 곳)

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
const kstDate = (date, H, M) => new Date(`${date}T${p2(H)}:${p2(M)}:00+09:00`);
export const addDays = (date, n) => { const t = new Date(date + 'T00:00:00Z'); t.setUTCDate(t.getUTCDate() + n); return t.toISOString().slice(0, 10); };
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
/** 회차가 보는 확인의 끝 때 — 지금 바로 앞의 회차 때(업데이트 30분 전 · 60분 안) · 아니면 지금(손으로 돌린 회차)
 *  진화 칸(p-jinhwa.js slotAfter)은 「회차 때보다 늦게 온 확인 = 그다음 업데이트」로 보여 줌 — 같은 잣대로 그 약속을 지킴 */
export function roundCutoff(t = new Date()) {
  const now = new Date(t).getTime();
  for (const s of slotsFrom(new Date(now - 70 * 60e3), 3)) { const r = s.getTime() - ROUND_LEAD_MIN * 60e3; if (r <= now && now - r <= 60 * 60e3) return new Date(r); }
  return new Date(now);
}
/** 쉬운 말 시각 — 「10월 19일 12시」 · 「12시 30분」 */
export const sayKst = (t, {day = true} = {}) => { const k = kst(t); return `${day ? `${k.mo}월 ${k.d}일 ` : ''}${k.H}시${k.M ? ` ${k.M}분` : ''}`; };

// ───────────────────────── 본질 ─────────────────────────
export const sha256 = b => crypto.createHash('sha256').update(b).digest('hex');
/** 본질 파일 길 — 잠금 파일이 가리키는 docs/<이름>_본질.md(이름이 바뀌면 잠금 줄도 함께 바뀜) · 못 읽으면 ESSENCE_FILE */
export function essenceFileOf(root) {
  try {
    const lock = JSON.parse(fs.readFileSync(path.join(root, LOCK_FILE), 'utf8'));
    const f = Object.keys(lock?.files ?? {}).find(k => /^docs\/[^/]+_본질\.md$/.test(k));
    if (f) return f;
  } catch { /* 아래 */ }
  return ESSENCE_FILE;
}
/** 본질 파일 — {file, text, sha, first(본질 첫 줄), lines(번호 줄), ruin(망치는 길 갈래)} · 없으면 throw */
export function readEssence(root) {
  const file = essenceFileOf(root);
  const buf = fs.readFileSync(path.join(root, file));
  const text = buf.toString('utf8').replace(/\r\n/g, '\n');
  const lines = text.split('\n').map(l => l.trim()).filter(l => /^\d+\.\s/.test(l)).map(l => l.replace(/^\d+\.\s*/, ''));
  const after = text.split(/^##\s*망치는 길\s*$/m)[1] || '';
  const ruin = (after.split('\n').map(l => l.trim()).find(Boolean) || '').replace(/[.。]\s*$/, '').split(/\s*,\s*/).map(s => s.trim()).filter(Boolean);
  return {file, text, sha: sha256(buf), first: lines[0] || '', lines, ruin};
}
/** 본질 잠금 맞대기 — 잠금 파일의 파일마다 마지막 줄 sha256 = 지금 파일 · 줄마다 at · words(사장님 원문) · 본질 파일과 명령문이 꼭 있음
 *  (essence_check ① 과 같은 뜻 · 회차가 먼저 봄 — 다르면 회차를 멈춤) */
export function essenceLockCheck(root) {
  const bad = [];
  let lock;
  try { lock = JSON.parse(fs.readFileSync(path.join(root, LOCK_FILE), 'utf8')); } catch { return {ok: false, why: ['잠금 파일을 못 읽음']}; }
  const files = Object.keys(lock?.files ?? {});
  if (!files.some(f => /^docs\/[^/]+_본질\.md$/.test(f))) bad.push('잠금에 본질 파일 줄이 없음');
  if (!files.includes(ORDER_FILE)) bad.push('잠금에 명령문 줄이 없음');
  for (const f of files) {
    const rows = lock.files[f];
    if (!Array.isArray(rows) || !rows.length) { bad.push(`잠금에 ${f} 줄이 없음`); continue; }
    if (!rows.every(r => r && typeof r.at === 'string' && r.at && typeof r.words === 'string' && r.words && /^[0-9a-f]{64}$/.test(r.sha256 ?? ''))) bad.push(`잠금 ${f} 줄에 at · words · sha256 이 빠짐`);
    let now; try { now = sha256(fs.readFileSync(path.join(root, f))); } catch { bad.push(`${f} 를 못 읽음`); continue; }
    if (rows[rows.length - 1].sha256 !== now) bad.push(`${f} 해시가 잠금과 다름`);
  }
  return {ok: !bad.length, why: bad};
}
/** 섬기는 본질 줄 후보 — 번호 줄 그대로 · 머리(「…:」)를 뗀 줄 · ①②③ 마디 · 「…다.」 문장(카드 serves 는 이 가운데 하나와 글자까지 같아야 함) */
export function essenceUnits(lines, max = 80) {
  const out = new Set();
  for (const l of lines) {
    const s = String(l).trim(); if (!s) continue;
    out.add(s);
    const body = s.replace(/^[^:：「」]{1,20}[:：]\s*/, '');
    if (body !== s) out.add(body);
    for (const part of body.split(/(?=[①②③④⑤⑥⑦⑧⑨])/)) { const q = part.trim(); if (q.length >= 6) out.add(q); }
    for (const sent of body.split(/(?<=다\.)\s+/)) { const q = sent.trim(); if (q.length >= 6) out.add(q); }
  }
  return [...out].filter(u => u.length <= max);
}

// ───────────────────────── 잣대 셋(config/atlas11/jinhwa-metrics.v1.json — KD · 기계는 못 고침) ─────────────────────────
const CIRC = ['①', '②', '③', '④', '⑤'];
const josaI = w => { const c = String(w).charCodeAt(String(w).length - 1) - 0xac00; return w + (c >= 0 && c <= 11171 && c % 28 !== 0 ? '이' : '가'); };
const plain = s => String(s ?? '').replace(/\s*\([^)]*\)\s*$/, '').trim();
/** 잣대마다 잴 수 있는 규칙 — [{measure, num, den?, dir, text}] (어림 규칙은 이 가운데 하나만) */
export function measureRules(metrics) {
  const out = [];
  (metrics?.measures ?? []).forEach((m, i) => {
    const head = `${CIRC[i] ?? ''} ${m.name}`.trim();
    if (m.id === 'fact') {
      out.push({measure: 'fact', num: 'mismatch', dir: 'zero', text: `${head} · 화면 숫자가 자료와 다른 곳이 들어간 뒤 ${SCORE_DAYS}거래일 내내 0이면 맞아요`});
      out.push({measure: 'fact', num: 'mismatch', dir: 'down', text: `${head} · 화면 숫자가 자료와 다른 곳이 들어가기 전 ${SCORE_DAYS}거래일보다 줄면 맞아요`});
      return;
    }
    const c = m.counters ?? {}, keys = m.keys ?? {};
    if (!c.total || !c.of) return;
    const totalWhat = plain(String(m.what ?? '').split(' · ')[0] || keys[c.total] || c.total); // 「매매일지를 끝낸 수」 · 「한 달 뒤 「그날 정한 대로 했어?」에 답한 수」
    const shareWhat = plain(Object.values(keys).find(v => /÷/.test(String(v))) ?? `${c.of} ÷ ${c.total}`);
    for (const dir of ['up', 'down']) {
      const v = dir === 'up' ? '늘면' : '줄면';
      out.push({measure: m.id, num: c.total, dir, text: `${head} · ${josaI(totalWhat)} 들어가기 전 ${SCORE_DAYS}거래일보다 ${v} 맞아요`});
      out.push({measure: m.id, num: c.of, den: c.total, dir, text: `${head} · ${josaI(shareWhat)} 들어가기 전 ${SCORE_DAYS}거래일보다 ${v} 맞아요`});
    }
  });
  return out;
}
/** 어림 규칙 하나 맞대기 — {ok, why, rule(쉬운 말 text 포함)} */
export function ruleCheck(rule, metrics) {
  const all = measureRules(metrics);
  if (!rule || typeof rule !== 'object') return {ok: false, why: '어림을 잴 규칙(rule)이 없음', rule: null};
  const hit = all.find(r => r.measure === rule.measure && r.num === rule.num && (r.den ?? null) === (rule.den ?? null) && r.dir === rule.dir);
  return hit ? {ok: true, why: '', rule: hit} : {ok: false, why: `잣대 셋 밖의 규칙(${[rule.measure, rule.num, rule.den, rule.dir].filter(Boolean).join(' · ')})`, rule: null};
}
export const measureTexts = metrics => measureRules(metrics).map(r => r.text);

// ───────────────────────── 못 고치는 파일 · 큰 것 ─────────────────────────
// [8] 10 「기계는 본질 파일, 망치는 길 목록, 잣대, 이 명령문을 스스로 고치지 못한다.」 + evolution.v1 「제 설정과 채점 규칙」 + 규칙 75(옛 화면) · 규칙 7(예약 파일)
//   지킴 목록은 한 곳 = 본질 문 scripts/atlas11/next/essence_check.mjs PROTECTED(본질 · 옛 이름 본질 · 잠금 · 명령문 · 잣대 · words.js · 본질 문 · 올리기 · 진화 회차 도구 ·
//   진화 칸 · 합계 칸 서버 · 예약 작업 파일) — protectedTouched 로 맞댐. 아래 ROUND_EXTRA 는 그 목록 밖에서 회차가 더 막는 곳(대안 = 화면 쪽 · 모양 · 글을 작게)
//   끝이 / 면 폴더 · 정규식이면 꼴 · 나머지는 파일 하나
export const ROUND_EXTRA = Object.freeze([
  [/^docs\/[^/]*_본질\.md$/, '본질 파일'], [/^docs\/design\/[^/]+\/order-[^/]*\.txt$/, '사장님 명령문'], ['docs/', '규칙 · 설계 · 지시문(사장님 말씀으로만)'],
  ['config/', '설정 · 잣대 · 채점 규칙'], ['site/next/tally.js', '잣대 세기(화면 신호)'], ['site/next/p-jinhwa.js', '진화 칸(확인 단추)'], ['site/next/p-jinhwa.css', '진화 칸(확인 단추)'],
  ['lib/atlas11/invite.mjs', '사장님 열쇠'], ['functions/atlas11/invite.mjs', '사장님 열쇠'],
  ['reports/', '기록 · 장부 · 검사 결과(기록 단계만 · 새 파일만)'], ['site/next/data/', '자료(셈으로만 · 진화 칸 자료는 기록 단계만)'],
  ['scripts/atlas11/art_gate.mjs', '올리기 문'], ['scripts/atlas11/trust_gate.mjs', '장부 문'], ['scripts/atlas11/face_gate.mjs', '얼굴 문'], ['scripts/atlas11/changelog_commit_gate.mjs', '커밋 번호 문'],
  ['scripts/atlas11/hooks/', '밀어 넣기 문'], ['scripts/atlas11/package.mjs', '묶기'], ['scripts/atlas11/site_headers.mjs', '보안 머리말'],
  [/^scripts\/atlas11\/next\/(check_[a-z0-9]+|next_check|next_en_check|quick|wait_preview|wip_preview|page_rules|run_all|net|half36|measure[a-z_]*)\.mjs$/, '검사 · 반값 셈'],
  ['scripts/atlas11/next/shard/', '검사 나누기'], ['scripts/atlas11/next/verify/', '따로 세기'], ['scripts/atlas11/next/fixtures/', '검사 자료'], ['scripts/atlas11/next/gdr/', '골똘이 칸 셈'],
  ['scripts/atlas11/invite_dev.mjs', '시험 서버'], ['tests/', '시험'], ['.github/', '깃허브 작업(예약 · 검사)'], ['.claude/', 'Claude 방 설정'],
  ['CLAUDE.md', '규칙'], ['site/next/brand.js', '이름(사장님 말씀으로만)'], ['site/media/', '영상 · 그림(사장님 말씀으로만)'],
  ['site/atlas/', '옛 화면(규칙 75)'], ['site/app/', '옛 화면(규칙 75)'], ['site/us/', '옛 화면(규칙 75)'], ['site/new/', '옛 화면(규칙 75)'],
  ['site/index.html', '옛 화면(규칙 75)'], ['scripts/atlas11/t365/', '옛 화면(규칙 75)'],
  ['public/', '받은 자료'], ['package.json', '패키지'], ['package-lock.json', '패키지'], ['netlify.toml', '넷리파이 설정'], ['.gitignore', '저장소 설정'],
]);
/** 보기용 한 줄 목록(지시문 · 보고) — 본질 문 목록 + 회차가 더 막는 곳 */
export const JINHWA_PROTECTED = Object.freeze([...GATE_PROTECTED.map(p => [p, '본질 문 지킴 목록']), ...ROUND_EXTRA]);
const matchP = (p, f) => (p instanceof RegExp ? p.test(f) : p.endsWith('/') ? f.startsWith(p) : f === p);
/** 못 고치는 파일에 닿은 것 — [{file, why}] · 먼저 본질 문 목록(protectedTouched — 한 곳) · 그다음 회차가 더 막는 곳 */
export function protectedHits(files) {
  const gate = new Set(protectedTouched(files));
  return files.flatMap(f => {
    const n = String(f).normalize('NFC');
    if (gate.has(n)) return [{file: f, why: '본질 문 지킴 목록(essence_check PROTECTED)'}];
    const h = ROUND_EXTRA.find(([p]) => matchP(p, n));
    return h ? [{file: f, why: h[1]}] : [];
  });
}
/** 잣대 신호를 건드린 줄(더하거나 뺀 줄에 tally( · /api/tally · /api/jinhwa) — 멍거 눈 「잣대를 비트나」를 기계로도 막음 */
export function yardstickLines(patchU0) {
  const out = [];
  for (const l of String(patchU0).split('\n')) {
    if (!/^[+-]/.test(l) || /^(\+\+\+|---)/.test(l)) continue;
    if (/\btally\s*\(|\/api\/tally|\/api\/jinhwa|['"]\.\/tally\.js['"]|atlas11:invite:owner/.test(l)) out.push(l.slice(0, 120));
  }
  return out;
}

// [8] 8 「본질, 돈, 법, 개인정보, 카카오, 보안 규칙, 예약 작업, 새 기능에 닿는 대안은 「큰 것」 꼬리표와 위험 두 줄을 붙여라.」
export const BIG_PATHS = Object.freeze([
  [/^site\/next\/(essence\.js|p-why\.(js|css)|p-gdr\.(js|css)|p-hold\.(js|css))$/, '본질(열한 질문 · 골똘이 칸 · 본질 세 줄 · 한 달 뒤 돌아보기)'],
  [/^scripts\/atlas11\/next\/build_data\.mjs$/, '본질 숫자 셈'],
  [/^site\/(hello|letter|invite)[^/]*$/, '돈(상품권) · 초대'],
  [/^site\/(privacy|terms)[^/]*$/, '법 · 개인정보'],
  [/kakao/i, '카카오'], [/^site\/next\/(share-btn\.js|p-share\.(js|css))$/, '카카오 · 보내기 글'],
  [/^functions\/|^lib\/atlas11\/|^site\/_(headers|redirects)$/, '보안 규칙 · 서버'],
]);
export const BIG_WORDS = Object.freeze([
  [/localStorage|sessionStorage|indexedDB|document\.cookie|sendBeacon|navigator\.(contacts|geolocation)|method:\s*['"]POST/i, '개인정보(기기에 담기 · 보내기)'],
  [/innerHTML|outerHTML|insertAdjacentHTML|\beval\(|new Function|<script|https?:\/\/(?!aaa7377\.com)/i, '보안 규칙(새 바깥 주소 · 글 넣기)'],
  [/상품권|만원|[0-9,]+\s*원\b/, '돈'],
  [/예약|schedule|cron/i, '예약 작업'],
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

/** 대안 크기 검사 — [8] 7 바뀐 파일 다섯 안 · 못 고치는 파일 0 · 지운 파일 0(되돌리기는 allowDelete) · 잣대 신호 0 */
export function fileCheck(files, {max = MAX_FILES, allowDelete = false, patch = ''} = {}) {
  const why = [], list = files.map(f => f.path);
  if (!files.length) why.push('바뀐 파일이 없음');
  if (files.length > max) why.push(`바뀐 파일 ${files.length}개 — ${max}개까지`);
  const ph = protectedHits(list);
  for (const h of ph) why.push(`못 고치는 파일 ${h.file}(${h.why})`);
  if (!allowDelete) for (const f of files) if (f.status === 'D') why.push(`지운 파일 ${f.path} — 지우는 대안은 안 됨`);
  for (const f of files) if (!/^[\w.\-/가-힣]+$/.test(f.path) || f.path.includes('..') || f.path.startsWith('/')) why.push(`파일 이름이 이상함 ${f.path}`);
  const ys = yardstickLines(patch);
  if (ys.length) why.push(`잣대 신호(합계 칸 · 진화 칸 · 사장님 열쇠)를 건드린 줄 ${ys.length}개 — 잣대를 비틀 수 있어 안 됨`);
  return {ok: !why.length, why, count: files.length, protected: ph};
}
/** 고장 고침 검사 — [8] 9 갈래 셋 · 3파일 · 20줄 · 줄마다 바꾼 글자 적음 · css · 새 파일 · 지운 파일 0 · 못 고치는 파일 0 */
export function fixCheck(files, numstat, kind, patch = '') {
  const why = [];
  if (!FIX_KINDS.includes(kind)) why.push(`고장 갈래가 아님(${kind || '없음'}) — ${FIX_KINDS.join(' · ')} 만`);
  const fc = fileCheck(files, {max: FIX_MAX_FILES, patch});
  why.push(...fc.why);
  for (const f of files) {
    if (f.status === 'A') why.push(`새 파일 ${f.path} — 고장 고침이 아님`);
    if (/\.css$/.test(f.path)) why.push(`모양 파일 ${f.path} — 화면 모양이 바뀌면 고장 고침이 아님`);
  }
  const lines = numstat.reduce((s, r) => s + (Number(r.add) || 0) + (Number(r.del) || 0), 0);
  if (numstat.some(r => r.add === '-' || r.del === '-')) why.push('글이 아닌 파일(그림 등)이 바뀜 — 고장 고침이 아님');
  if (lines > FIX_MAX_LINES) why.push(`바뀐 줄 ${lines}줄 — ${FIX_MAX_LINES}줄까지`);
  why.push(...smallEdits(patch).why);
  return {ok: !why.length, why, lines};
}
/** 줄 바꿈이 작은가 — 덩이마다 뺀 줄 수 = 더한 줄 수 · 짝마다 바뀐 글자 FIX_MAX_CHARS 안(앞뒤 같은 글자를 뺀 가운데) — 뜻 · 모양이 크게 바뀌는 고침을 막음 */
export function smallEdits(patchU0, maxChars = FIX_MAX_CHARS) {
  const why = [];
  let minus = [], plus = [], file = '';
  const flush = () => {
    if (!minus.length && !plus.length) return;
    if (minus.length !== plus.length) why.push(`${file}: 뺀 줄 ${minus.length} · 더한 줄 ${plus.length} — 고장 고침은 줄을 바꾸기만`);
    else minus.forEach((a, i) => { const b = plus[i]; let s = 0; while (s < a.length && s < b.length && a[s] === b[s]) s++; let e = 0; while (e < a.length - s && e < b.length - s && a[a.length - 1 - e] === b[b.length - 1 - e]) e++; const n = Math.max(a.length - s - e, b.length - s - e); if (n > maxChars) why.push(`${file}: 한 줄에서 ${n}글자가 바뀜 — ${maxChars}글자까지`); });
    minus = []; plus = [];
  };
  for (const l of String(patchU0).split('\n')) {
    if (l.startsWith('diff --git ')) { flush(); const m = / b\/(.+)$/.exec(l); file = m ? m[1] : l; continue; }
    if (l.startsWith('@@')) { flush(); continue; }
    if (l.startsWith('+++') || l.startsWith('---')) continue;
    if (l.startsWith('-')) minus.push(l.slice(1)); else if (l.startsWith('+')) plus.push(l.slice(1));
  }
  flush();
  return {ok: !why.length, why};
}

/** 바뀐 내용 지문 — 줄 번호 · 둘레 줄 없이 파일마다 더한 줄 · 뺀 줄만(바탕이 바뀌어 다시 얹어도 같음 · 내용이 바뀌면 다름) */
export function changeHash(patchU0) {
  const per = new Map(); let cur = null;
  for (const l of String(patchU0).split('\n')) {
    if (l.startsWith('diff --git ')) { const m = / b\/(.+)$/.exec(l); cur = m ? m[1] : l; per.set(cur, []); continue; }
    if (!cur || l.startsWith('+++') || l.startsWith('---') || l.startsWith('@@') || l.startsWith('index ') || l.startsWith('new file') || l.startsWith('deleted file') || l.startsWith('similarity') || l.startsWith('rename ') || l.startsWith('old mode') || l.startsWith('new mode')) continue;
    if (l.startsWith('+') || l.startsWith('-') || l.startsWith('Binary files') || l.startsWith('GIT binary patch') || /^(literal|delta) \d+$/.test(l)) per.get(cur).push(l);
  }
  const h = crypto.createHash('sha256');
  for (const f of [...per.keys()].sort()) { h.update(f + '\n'); for (const l of per.get(f)) h.update(l + '\n'); h.update('\0'); }
  return h.digest('hex').slice(0, 16);
}
/** 더한 줄 글만(큰 것 · 낱말 검사용) */
export const addedText = patchU0 => String(patchU0).split('\n').filter(l => l.startsWith('+') && !l.startsWith('+++')).map(l => l.slice(1)).join('\n');
/** 더한 줄 가운데 한글이 든 글(따옴표 안) — 화면에 나갈 글만 낱말 검사(코드 이름 · css 값은 뺌) */
export function addedKoreanStrings(patchU0) {
  const out = [];
  for (const raw of addedText(patchU0).split('\n')) {
    const line = raw.replace(/\/\*.*?\*\//g, ' ').replace(/<!--.*?-->/g, ' ').replace(/(^|\s)\/\/.*$/, ''); // 주석은 화면 글이 아님
    for (const m of line.matchAll(/(['"`])((?:\\.|(?!\1).)*?[가-힣](?:\\.|(?!\1).)*?)\1/g)) out.push(m[2]);
    if (!/['"`]/.test(line) && /[가-힣]/.test(line) && !/^\s*(\/\/|\/\*|\*)/.test(line)) out.push(line.trim()); // html 글 · 따옴표 없는 줄
  }
  return out;
}

// ───────────────────────── 확인 상태(열쇠 없는 읽기 · KD lib/atlas11/jinhwa.mjs statusOf) ─────────────────────────
const STATE_WORDS = Object.freeze({
  confirmed: ['confirmed', 'confirm', '확인', '확인함'],
  withdrawn: ['withdrawn', 'withdraw', '거둠', '확인 거둠'],
  revert: ['revert', '되돌리기', '되돌림 요청'],
  kept: ['kept', '되돌리기 거둠'],
  waiting: ['waiting', 'none', 'new', '기다림'],
});
const stateOf = s => { const x = String(s ?? '').trim().toLowerCase(); for (const [k, ws] of Object.entries(STATE_WORDS)) if (ws.includes(x)) return k; return 'unknown'; };
const tsOf = v => { const t = Date.parse(v); return Number.isFinite(t) ? new Date(t).toISOString() : null; };
/** 상태 읽기 결과 → {ok, why, items: [{id, state, at}], unknown: n} — 꼴을 모르면 ok false(아무것도 넣지 않음) */
export function normalizeStatus(raw) {
  if (raw == null || typeof raw !== 'object') return {ok: false, why: '상태 꼴을 모름(글이 아님)', items: [], unknown: 0};
  let rows = null;
  if (Array.isArray(raw)) rows = raw;
  else for (const k of ['items', 'states', 'list']) {
    const v = raw[k];
    if (Array.isArray(v)) { rows = v; break; }
    if (v && typeof v === 'object') { rows = Object.entries(v).map(([id, x]) => (x && typeof x === 'object' ? {id, ...x} : {id, state: x})); break; }
  }
  if (!rows) return {ok: false, why: '상태 꼴을 모름(items 없음)', items: [], unknown: 0};
  const items = [], seen = new Set(); let unknown = 0;
  for (const r of rows) {
    const id = String(r?.id ?? '');
    if (!ID_RE.test(id) || seen.has(id)) { unknown++; continue; }
    const state = stateOf(r.state ?? r.status);
    if (state === 'unknown') unknown++;
    seen.add(id);
    items.push({id, state, at: tsOf(r.at ?? r.time ?? r.updatedAt)});
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
  if (!ROUND_RE.test(rec?.id ?? '')) throw Error('기록 번호가 이상함');
  fs.mkdirSync(dir, {recursive: true});
  const f = path.join(dir, recordName(rec.id));
  fs.writeFileSync(f, JSON.stringify(rec, null, 1) + '\n', {flag: 'wx'}); // 있으면 EEXIST
  return f;
}
/** 기록에서 번호마다 — {id, changeHash, files, rule, commit, checked[], pending, merge, appliedAt, reverted, revertCommit, dropped} */
export function memoryOf(records) {
  const m = new Map();
  const get = id => { if (!m.has(id)) m.set(id, {id, checked: []}); return m.get(id); };
  for (const r of records) {
    for (const x of r.made ?? []) {
      if (!x?.id) continue;
      const g = get(x.id);
      if (!x.ok) { g.dropped = g.dropped ?? (x.why?.[0] ?? '만들기 검사에 걸림'); continue; }
      Object.assign(g, {changeHash: g.changeHash ?? x.changeHash, files: x.files, commit: x.commit, madeAt: r.start, big: x.big});
      if (x.preview?.state === 'pass') g.checked.push(x.commit);
      else if (x.preview?.state === 'running') g.pending = {kind: 'made', sha: x.commit, branch: branchOf(x.id), run: x.preview.run ?? null, round: r.id};
    }
    for (const x of r.cards ?? []) if (x?.id && x.ok && x.rule) get(x.id).rule = x.rule;
    for (const x of r.retested ?? []) {
      if (!x?.id) continue;
      const g = get(x.id);
      if (x.preview?.state === 'running') g.pending = {kind: 'retest', sha: x.sha, branch: tryBranchOf(x.id), run: x.preview.run ?? null, round: r.id};
      if (x.preview?.state === 'pass' && x.sha) g.checked.push(x.sha);
    }
    for (const x of r.finished ?? []) {
      if (!x?.id) continue;
      const g = get(x.id);
      if (x.state === 'pass') { if (x.sha) g.checked.push(x.sha); delete g.pending; }
      else if (x.state === 'fail') { delete g.pending; g.dropped = g.dropped ?? '전체 미리 검사 실패'; }
    }
    if (r.apply?.ok && r.apply.id) Object.assign(get(r.apply.id), {merge: r.apply.merge, appliedAt: r.apply.at});
    if (r.revert?.ok && r.revert.id) Object.assign(get(r.revert.id), {reverted: r.revert.at, revertCommit: r.revert.commit});
    for (const x of r.dropped ?? []) if (x?.id) { const g = get(x.id); g.dropped = g.dropped ?? x.why ?? '내려감'; delete g.pending; }
  }
  return m;
}

// ───────────────────────── 이번 회차 할 일 ─────────────────────────
/** [8] 2 · 3 — 먼저 되돌리기 요청 · 확인된 것 하나(한 번에 하나 · 이른 것부터) → 그다음:
 *  pending(지난 회차 미리 검사 결과를 아직 못 봄) → finish · 넣거나 되돌린 회차 → none(남은 기다림은 다음 회차가 새 main 위에서 다시 시험)
 *  기다리는 것이 있음 → retest(새로 만들지 않음) · 없음 → make(세 사람 토론 → 대안 셋)
 *  확인으로 치는 것 = 열쇠 없는 상태가 confirmed · 회차 끝 때(cutoff) 전에 옴 · 지금 jinhwa.json 기다림에 있음 · 기록에 지문이 있음 · 내려가지 않음 */
export function planRound({data, status, records = [], cutoff = null}) {
  const mem = memoryOf(records);
  const applied = new Map((data?.applied ?? []).map(a => [a.id, a]));
  const waiting = new Map((data?.waiting ?? []).map(w => [w.id, w]));
  const ignored = [];
  let change = null;
  const late = it => cutoff && it.at && Date.parse(it.at) > new Date(cutoff).getTime();
  if (status?.ok) {
    const order = (a, b) => (a.at ?? '9999').localeCompare(b.at ?? '9999') || a.id.localeCompare(b.id);
    const reverts = [], confirms = [];
    for (const it of status.items) {
      const g = mem.get(it.id);
      if (it.state === 'revert') {
        if (!applied.has(it.id)) ignored.push({id: it.id, why: '되돌리기 요청 — 들어간 목록에 없음'});
        else if (applied.get(it.id).revertedAt || applied.get(it.id).reverted || g?.reverted) ignored.push({id: it.id, why: '이미 되돌림'});
        else if (!g?.merge) ignored.push({id: it.id, why: '되돌리기 요청 — 들어간 커밋 기록이 없음'});
        else if (late(it)) ignored.push({id: it.id, why: '회차 때 뒤에 온 요청 — 다음 회차'});
        else reverts.push(it);
      } else if (it.state === 'confirmed') {
        if (applied.has(it.id) || g?.merge) ignored.push({id: it.id, why: '이미 들어감'});
        else if (!waiting.has(it.id)) ignored.push({id: it.id, why: '확인 — 기다리는 목록에 없음(내려간 대안)'});
        else if (g?.dropped) ignored.push({id: it.id, why: `확인 — 내려간 대안(${g.dropped})`});
        else if (!g?.changeHash || !g?.commit) ignored.push({id: it.id, why: '확인 — 기록에 지문이 없어 넣지 않음'});
        else if (late(it)) ignored.push({id: it.id, why: '회차 때 뒤에 온 확인 — 다음 회차'});
        else confirms.push(it);
      } else if (it.state === 'unknown') ignored.push({id: it.id, why: '모르는 상태 — 확인으로 치지 않음'});
    }
    reverts.sort(order); confirms.sort(order);
    if (reverts[0]) change = {kind: 'revert', id: reverts[0].id, at: reverts[0].at, why: '사장님 되돌리기 요청'};
    else if (confirms[0]) change = {kind: 'apply', id: confirms[0].id, at: confirms[0].at, why: '사장님 확인'};
    for (const x of [...reverts.slice(change?.kind === 'revert' ? 1 : 0), ...confirms.slice(change?.kind === 'apply' ? 1 : 0)])
      ignored.push({id: x.id, why: '한 번에 하나 — 다음 회차'});
  }
  const pending = [...mem.values()].filter(x => x.pending && !x.dropped && !x.merge).map(x => x.id);
  let next;
  if (pending.length) next = 'finish';
  else if (change) next = 'none';
  else if (waiting.size) next = 'retest';
  else next = 'make';
  return {change, next, retest: next === 'retest' ? [...waiting.keys()] : [], pending, ignored, statusOk: !!status?.ok, statusWhy: status?.ok ? '' : status?.why ?? '상태를 못 읽음'};
}

// ───────────────────────── 화면 글 검사 ─────────────────────────
/** 카드 · 진화 칸 글 검사 — 쓰지 않을 말(words.js screenHits) · 망치는 길(ruinHits — 본질 문 ③ 이 next/data/*.json 글을 봄) · 수익 자랑(gainHits) · 옛 이름 · 퍼센트 */
export function textHits(text, {screenHits = null, ruinHits = null, gainHits = null, oldNames = []} = {}) {
  const t = String(text ?? ''), out = [];
  if (screenHits) for (const w of screenHits(t)) out.push(`쓰지 않을 말 「${w}」`);
  if (ruinHits) for (const h of ruinHits(t)) out.push(`망치는 길 「${h.name}」 낱말 「${h.word}」`);
  if (gainHits) for (const h of gainHits(t)) out.push(`수익 자랑 「${h.word}」`);
  for (const w of oldNames) if (w && t.includes(w)) out.push(`옛 이름 「${w}」`);
  if (/[%％]|퍼센트/.test(t)) out.push('퍼센트 — 「10번 중 n번」처럼 말로');
  return [...new Set(out)];
}

// ───────────────────────── jinhwa.json(KE 가 씀 · KD 가 그림 · split.md 꼴) ─────────────────────────
export const TOP_KEYS = Object.freeze(['schema', 'made', 'essence', 'n', 'next', 'waiting', 'applied', 'fixed', 'facts']);
export const WAIT_KEYS = Object.freeze(['id', 'title', 'pick', 'serves', 'before', 'after', 'voices', 'predict', 'revert', 'premortem', 'big', 'risks', 'branch', 'files', 'checks']);
export const APPLIED_KEYS = Object.freeze(['id', 'title', 'at', 'before', 'after', 'predict', 'score']);
export const APPLIED_OPT = Object.freeze(['revertedAt']); // 되돌린 진화 — 서울 시각(KD 서버 · 화면이 이 이름으로 읽음 · split.md 에 더한 칸)
export const LIM = Object.freeze({title: 40, serves: 80, voice: 120, text: 120, what: 120, measure: 90});
export const imgOf = (id, which) => `${IMG_WEB}/${id}-${which}.png`;
export const imgFileOf = (id, which) => `${IMG_DIR}/${id}-${which}.png`;
export const SCORE_WAIT_TEXT = `채점 전 — 들어간 뒤 ${SCORE_DAYS}거래일이 지나면 매겨요`;

/** 정직한 빈 판 — 진화 0 · 기다림 0 · 들어간 것 0 · 고친 고장 0 · facts 는 넘긴 그대로(모르면 null) */
export function emptyJinhwa({essence, now = new Date(), facts = {mismatch: null, at: null}}) {
  return {schema: SCHEMA, made: isoKst(now), essence, n: 0, next: isoKst(nextSlot(now)), waiting: [], applied: [], fixed: [], facts};
}
const isStr = (v, max) => typeof v === 'string' && v.trim().length > 0 && v.length <= max;
const exactKeys = (o, keys, opt = []) => { const k = Object.keys(o ?? {}); return keys.every(x => k.includes(x)) && k.every(x => keys.includes(x) || opt.includes(x)); };
export const ISO_RE = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2})?(\.\d+)?(Z|[+-]\d{2}:\d{2})$/;
/** 꼴 검사 — {ok, errors} · measures = 재는 법 글(measureTexts) · units = 섬기는 본질 줄 후보 · exists(파일) = 그림이 있나 · words = textHits 옵션 */
export function validateJinhwa(d, {measures = null, units = null, exists = null, words = null} = {}) {
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
  // 세 사람이 고른 것(pick 참)은 하나까지 · 있으면 맨 앞(1번) — 1번이 들어간 뒤 남은 둘은 pick 거짓으로 남아 다시 시험됨([8] 3)
  if (d.waiting.filter(w => w?.pick === true).length > 1) E('세 사람이 고른 것(pick 참)은 하나까지');
  if (d.waiting.some((w, i) => w?.pick === true && i !== 0)) E('세 사람이 고른 것은 맨 앞(1번)');
  const ids = new Set(), txt = [];
  const predictOk = (p, where) => {
    if (!exactKeys(p, ['text', 'measure', 'days'])) { E(`${where} predict 칸이 다름`); return; }
    if (!isStr(p.text, LIM.text)) E(`${where} predict.text`);
    if (p.days !== SCORE_DAYS) E(`${where} predict.days 는 ${SCORE_DAYS}`);
    if (!isStr(p.measure, LIM.measure) || (measures && !measures.includes(p.measure))) E(`${where} predict.measure 가 잣대 셋 밖(${p.measure})`);
    txt.push(p.text);
  };
  for (const [i, w] of d.waiting.entries()) {
    const at = `waiting[${i}]`;
    if (!exactKeys(w, WAIT_KEYS)) { E(`${at} 칸이 다름 — ${Object.keys(w ?? {}).join(',')}`); continue; }
    if (!ID_RE.test(w.id) || ids.has(w.id)) E(`${at} id`); ids.add(w.id);
    if (typeof w.pick !== 'boolean') E(`${at} pick 은 참 거짓`);
    if (!isStr(w.title, LIM.title)) E(`${at} title`);
    if (!isStr(w.serves, LIM.serves) || (units && !units.includes(w.serves))) E(`${at} serves 가 본질 줄 그대로가 아님`);
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
    txt.push(w.title, w.serves, w.revert, w.premortem, ...(w.risks ?? []));
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
    if ('revertedAt' in a && !ISO_RE.test(a.revertedAt ?? '')) E(`${at} revertedAt`);
    txt.push(a.title);
    if (exists) for (const k of ['before', 'after']) if (!exists(imgFileOf(a.id, k))) E(`${at} ${k} 그림 파일이 없음`);
    if (i > 0 && String(a.at) < String(d.applied[i - 1].at)) E(`${at} 날짜 차례가 아님`);
  }
  for (const [i, f] of d.fixed.entries()) {
    if (!exactKeys(f, ['at', 'what']) || !ISO_RE.test(f.at ?? '') || !isStr(f.what, LIM.what)) E(`fixed[${i}]`);
    else txt.push(f.what);
  }
  if (!exactKeys(d.facts, ['mismatch', 'at']) || !(d.facts.mismatch === null || (Number.isInteger(d.facts.mismatch) && d.facts.mismatch >= 0)) || !(d.facts.at === null || ISO_RE.test(d.facts.at))) E('facts');
  if (words) { txt.push(d.essence); for (const t of txt) for (const h of textHits(t, words)) E(`글 「${String(t).slice(0, 24)}」 — ${h}`); }
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
 *  debate = {top: {kahneman: n, munger: n, popper: n}, alts: [{n, title, files, changeHash, eyes, accept: {kahneman, munger, popper}}]} */
export function pickCheck(debate) {
  const why = [];
  const alts = Array.isArray(debate?.alts) ? debate.alts : [];
  if (!alts.length) return {ok: false, why: ['대안이 없음'], order: []};
  if (alts.length > 3) why.push('대안은 셋까지');
  const hashes = new Set(), ns = new Set();
  for (const a of alts) {
    if (![1, 2, 3].includes(a.n) || ns.has(a.n)) why.push(`대안 번호 ${a.n} 이 이상함`); ns.add(a.n);
    if (!a.changeHash) why.push(`대안 ${a.n} 지문이 없음`);
    else if (hashes.has(a.changeHash)) why.push(`대안 ${a.n} 이 다른 대안과 같은 고침 — 서로 달라야 함`);
    hashes.add(a.changeHash);
    const ec = eyesCheck(a.eyes); if (!ec.ok) why.push(`대안 ${a.n}: ${ec.why.join(' · ')}`);
  }
  const fileSets = alts.map(a => (a.files ?? []).slice().sort().join('|'));
  const norm = s => String(s ?? '').replace(/\s+/g, '');
  for (let i = 0; i < alts.length; i++) for (let j = i + 1; j < alts.length; j++) {
    if (fileSets[i] && fileSets[i] === fileSets[j] && norm(alts[i].title) === norm(alts[j].title)) why.push(`대안 ${alts[i].n} 과 ${alts[j].n} 이 같은 고칠 거리`);
    else if (norm(alts[i].title) && norm(alts[i].title) === norm(alts[j].title)) why.push(`대안 ${alts[i].n} 과 ${alts[j].n} 의 이름이 같음 — 서로 다른 고칠 거리여야 함`);
  }
  const unanimous = alts.filter(a => PEOPLE.every(p => a.accept?.[p] === true));
  if (!unanimous.length) why.push('세 사람이 함께 고른 1번이 없음');
  const tops = a => PEOPLE.filter(p => a.n === debate.top?.[p]).length;
  const first = unanimous.slice().sort((a, b) => tops(b) - tops(a) || a.n - b.n)[0];
  if (first && tops(first) < 2) why.push(`1번(대안 ${first.n})을 맨 먼저 꼽은 사람이 둘이 안 됨 — 셋이 함께 고른 것이어야 함`);
  const rest = alts.filter(a => a !== first).sort((a, b) => tops(b) - tops(a) || PEOPLE.filter(p => b.accept?.[p]).length - PEOPLE.filter(p => a.accept?.[p]).length || a.n - b.n);
  return {ok: !why.length, why, order: first ? [first.n, ...rest.map(a => a.n)] : []};
}
/** 카드 초안(토론이 쓴 것) → waiting 카드 · 검사
 *  초안 = {title, serves, voices: {kahneman, munger, popper}, predict: {text, rule: {measure, num, den?, dir}}, revert, premortem, big, risks}
 *  o = {id, pick(참 거짓), files, units(섬기는 본질 줄 후보), metrics, big(기계가 찾은 큰 것 까닭), words} */
export function cardFrom(draft, {id, pick, files, units, metrics, big: bigWhy = [], words = null}) {
  const why = [];
  const rc = ruleCheck(draft?.predict?.rule, metrics);
  if (!rc.ok) why.push(rc.why);
  const card = {id, title: String(draft?.title ?? '').trim(), pick: !!pick, serves: String(draft?.serves ?? '').trim(), before: imgOf(id, 'before'), after: imgOf(id, 'after'),
    voices: {kahneman: String(draft?.voices?.kahneman ?? '').trim(), munger: String(draft?.voices?.munger ?? '').trim(), popper: String(draft?.voices?.popper ?? '').trim()},
    predict: {text: String(draft?.predict?.text ?? '').trim(), measure: rc.rule?.text ?? '', days: SCORE_DAYS},
    revert: String(draft?.revert ?? '').trim(), premortem: String(draft?.premortem ?? '').trim(), big: !!draft?.big || bigWhy.length > 0,
    risks: (Array.isArray(draft?.risks) ? draft.risks : []).map(r => String(r).trim()).filter(Boolean), branch: branchOf(id), files: files.slice(), checks: {changed: 0, preview: 0}};
  if (card.big && card.risks.length !== 2) why.push(`큰 것(${bigWhy.join(' · ') || '토론이 정함'}) — 위험 두 줄이 있어야 함`);
  if (!card.big) card.risks = [];
  const v = validateJinhwa({schema: SCHEMA, made: isoKst(new Date(0)), essence: 'x', n: 0, next: isoKst(new Date(0)), waiting: [{...card, pick: true}], applied: [], fixed: [], facts: {mismatch: null, at: null}},
    {measures: metrics ? measureTexts(metrics) : null, units, words});
  why.push(...v.errors.map(x => x.replace(/^waiting\[0\] ?/, '')));
  const rule = rc.rule ? {measure: rc.rule.measure, num: rc.rule.num, ...(rc.rule.den ? {den: rc.rule.den} : {}), dir: rc.rule.dir} : null;
  return {ok: !why.length, why, card, rule};
}

// ───────────────────────── 진화 칸 자료 다음 판 ─────────────────────────
/** 지금 판 + 이번 회차 → 다음 판(꼴 검사 전) — r = {now, essence, facts, apply: {id, at}, revert: {id, at}, applies · reverts: [{id, at}](지난 회차 맞춤),
 *  dropped: [id], newCards: [card], retestedCards: {id: card}, fixed: [{at, what}], scores: {id: score}} */
export function nextJinhwa(data, r) {
  const d = data && data.schema === SCHEMA ? JSON.parse(JSON.stringify(data)) : emptyJinhwa({essence: r.essence, now: r.now});
  const drop = new Set(r.dropped ?? []);
  // 넣은 것(이번 회차 + 지난 기록 · 커밋 표시로 맞춘 것 — 기록을 못 밀었던 회차가 있어도 다음 회차가 바로잡음)
  for (const ap of [...(r.applies ?? []), ...(r.apply?.id ? [r.apply] : [])]) {
    const w = d.waiting.find(x => x.id === ap.id);
    if (w && !d.applied.some(a => a.id === w.id)) d.applied.push({id: w.id, title: w.title, at: ap.at, before: w.before, after: w.after, predict: w.predict, score: {at: null, ok: null, text: SCORE_WAIT_TEXT}});
    drop.add(ap.id);
  }
  for (const rv of [...(r.reverts ?? []), ...(r.revert?.id ? [r.revert] : [])]) for (const a of d.applied) if (a.id === rv.id && !a.revertedAt) a.revertedAt = rv.at;
  d.waiting = d.waiting.filter(w => !drop.has(w.id)).map(w => (r.retestedCards?.[w.id] ? {...w, ...r.retestedCards[w.id], pick: w.pick} : w));
  if (r.newCards?.length) d.waiting = r.newCards.slice(0, 3);
  // 1번(세 사람이 고른 것)이 들어가거나 내려가도 「세 사람이 고른 것」 꼬리표를 남은 것에 옮겨 달지 않음(지어내지 않음) — 남은 것은 pick 거짓 그대로 기다리고 다시 시험됨([8] 3)
  for (const a of d.applied) if (r.scores?.[a.id]) a.score = r.scores[a.id];
  for (const f of r.fixed ?? []) d.fixed.push(f);
  d.applied.sort((a, b) => String(a.at).localeCompare(String(b.at)));
  d.n = d.applied.length;
  d.essence = r.essence; d.made = isoKst(r.now); d.next = isoKst(nextSlot(r.now));
  if (r.facts) d.facts = r.facts;
  return d;
}

// ───────────────────────── 채점([10] 6 · 10거래일 뒤) ─────────────────────────
/** 거래일 — 거래일 달력(public/data/rolling-calendar.json sessions · coverageEnd · holidays) · 달력 밖은 평일 */
export function tradingDays(cal, fromDate, toDate) {
  const S = new Set(cal?.sessions ?? []), end = cal?.coverageEnd ?? '', out = [];
  for (let d = fromDate; d <= toDate; d = addDays(d, 1)) {
    const wd = new Date(d + 'T00:00:00Z').getUTCDay();
    if (d <= end && S.size) { if (S.has(d)) out.push(d); }
    else if (wd !== 0 && wd !== 6 && !(cal?.holidays && d in cal.holidays)) out.push(d);
  }
  return out;
}
/** 합계 칸 꼴(KD sumOf {days: [{d, stop, …}]}) → {ok, days: {YYYY-MM-DD: {열쇠: 수}}} — 모르면 ok false(채점 안 함) */
export function normalizeTally(raw) {
  if (!raw || typeof raw !== 'object') return {ok: false, why: '합계 꼴을 모름', days: {}};
  const src = raw.days ?? null;
  if (!src || typeof src !== 'object') return {ok: false, why: '합계 꼴을 모름(days 없음)', days: {}};
  const days = {};
  const put = (day, o) => { if (!/^\d{4}-\d{2}-\d{2}$/.test(String(day)) || !o || typeof o !== 'object') return; const x = {}; for (const [k, v] of Object.entries(o)) if (typeof v === 'number' && Number.isFinite(v) && v >= 0) x[k] = v; days[day] = x; };
  if (Array.isArray(src)) for (const r of src) put(r?.d ?? r?.day ?? r?.date, r);
  else for (const [day, o] of Object.entries(src)) put(day, o);
  return {ok: true, why: '', days};
}
/** 합계 이어 붙이기 — 옛 기록(회차마다 남긴 62일) 위에 새 읽기를 덮음(같은 날은 새 것) */
export function mergeTally(...parts) {
  const days = {};
  for (const p of parts) if (p?.ok) for (const [d, v] of Object.entries(p.days)) days[d] = v;
  return {ok: parts.some(p => p?.ok), days};
}
/** 들어간 대안 하나 채점 — {done, ok, text, n(쓴 거래일)} · done false = 아직(10거래일 안 됨 · 표본 모으는 중)
 *  잣대 파일 judge 그대로(셈은 KD lib/atlas11/tally.mjs judge 한 곳): 들어간 날 = 뒤 칸 첫날 · 앞 칸 = 그 앞 N거래일이 걸친 서울 날짜 · 몫은 밑수가 · 수는 그 수가 양쪽 모두 minSample 이상일 때만 · |z| < 1.96 = 소음 → 판단 못 함
 *  표본이 작으면 같은 길이(10 · 20 · … 60거래일)로 늘려 모음([10] 5) · 사실은 표본 문턱 없음 — 뒤 칸 동안 한 번이라도 0 이 아니면 틀림 */
export function scoreApplied({rule, at, today, cal, tally, rounds = [], minSample = MIN_SAMPLE}) {
  const d0 = kst(at).date;
  const after = tradingDays(cal, d0, addDays(today, -1));
  if (after.length < SCORE_DAYS) return {done: false, ok: null, text: SCORE_WAIT_TEXT, n: after.length};
  if (!rule?.num || !['up', 'down', 'zero'].includes(rule.dir)) return {done: true, ok: null, text: '잴 규칙이 없어 채점 못 해요 · ?', n: 0};
  const before = tradingDays(cal, addDays(d0, -400), addDays(d0, -1));
  const span = (a, b) => { const out = []; for (let d = a; d <= b; d = addDays(d, 1)) out.push(d); return out; };
  if (rule.measure === 'fact') {
    const A = after.slice(0, SCORE_DAYS), inA = rounds.filter(x => Number.isInteger(x.mismatch) && x.date >= d0 && x.date <= A[A.length - 1]);
    if (!inA.length) return {done: false, ok: null, text: '사실 잣대 기록을 모으는 중 · ?', n: SCORE_DAYS};
    if (rule.dir === 'zero') { const bad = inA.filter(x => x.mismatch !== 0); return {done: true, ok: !bad.length, text: bad.length ? `틀렸어요 — 화면 숫자가 자료와 다른 곳이 ${Math.max(...bad.map(x => x.mismatch))}곳 나온 때가 있어요` : `맞았어요 — ${SCORE_DAYS}거래일 내내 다른 곳 0`, n: SCORE_DAYS}; }
    const B = before.slice(-SCORE_DAYS), inB = rounds.filter(x => Number.isInteger(x.mismatch) && B.length && x.date >= B[0] && x.date < d0);
    if (!inB.length) return {done: true, ok: null, text: '들어가기 전 사실 기록이 없어 판단 못 해요 · ?', n: SCORE_DAYS};
    const avg = xs => xs.reduce((s, x) => s + x.mismatch, 0) / xs.length;
    const ok = avg(inA) < avg(inB);
    return {done: true, ok, text: ok ? '맞았어요 — 다른 곳이 줄었어요' : '틀렸어요 — 다른 곳이 줄지 않았어요', n: SCORE_DAYS};
  }
  if (!tally?.ok) return {done: false, ok: null, text: '합계 칸을 못 읽어 채점을 미뤄요 · ?', n: after.length};
  for (let N = SCORE_DAYS; N <= SCORE_MAX_DAYS; N += SCORE_DAYS) {
    if (after.length < N) return {done: false, ok: null, text: '표본이 작아 판단하지 않아요 — 모으는 중', n: after.length};
    if (before.length < N) return {done: true, ok: null, text: '들어가기 전 기록이 모자라 판단 못 해요 · ?', n: N};
    const A = span(d0, after[N - 1]), B = span(before[before.length - N], addDays(d0, -1));
    if ([...A, ...B].some(d => !(d in tally.days))) return {done: false, ok: null, text: '합계 기록이 비는 날이 있어 채점을 미뤄요 · ?', n: N};
    const j = tallyJudge({rule: {num: rule.num, ...(rule.den ? {den: rule.den} : {}), dir: rule.dir}, before: B.map(d => tally.days[d]), after: A.map(d => tally.days[d]), minSample});
    const wide = N > SCORE_DAYS ? ` · 표본이 작아 ${N}거래일씩 견줌` : '';
    if (j.why === 'small') { if (N === SCORE_MAX_DAYS) return {done: true, ok: null, text: `${SCORE_MAX_DAYS}거래일 동안 표본이 작아 판단 못 했어요`, n: N}; continue; }
    if (j.why === 'rule') return {done: true, ok: null, text: '잴 규칙이 없어 채점 못 해요 · ?', n: N};
    if (j.why === 'noise' || j.ok == null) return {done: true, ok: null, text: `판단 못 했어요 — 앞뒤 차이가 소음 안이에요${wide}`, n: N, z: j.z};
    return {done: true, ok: j.ok, text: (j.ok ? '맞았어요 — 들어가기 전보다 ' : '틀렸어요 — 들어가기 전보다 ') + (j.z > 0 ? '늘었어요' : '줄었어요') + wide, n: N, z: j.z};
  }
  return {done: true, ok: null, text: `${SCORE_MAX_DAYS}거래일 동안 표본이 작아 판단 못 했어요`, n: SCORE_MAX_DAYS};
}

// ───────────────────────── 사실 잣대(화면 숫자 = 자료) ─────────────────────────
/** 지금 사이트 모든 쪽 검사(live) 결과 → {mismatch, at, note} — 쪽 결과 파일마다 걸린 수(fails 목록 길이 · 수)의 합 [가정: 쪽 검사는 화면 숫자를 자료와 맞댐]
 *  쪽 결과 파일을 못 읽거나 · fails 꼴을 모르거나 · 이틀 넘게 묵으면 mismatch null(「?」) · 끝 코드만 1 이고 fails 0 인 쪽은 note 에 적음(견본 자료 길 등 — 지금 사이트 숫자 아님) */
export function factsFrom(summary, pageOf = () => null, now = new Date()) {
  const none = note => ({mismatch: null, at: null, note});
  if (!summary || summary.mode !== 'live' || !Array.isArray(summary.pages) || !summary.pages.length || !ISO_RE.test(summary.at ?? '')) return none('지금 사이트 모든 쪽 검사 결과를 못 읽음');
  if (new Date(now) - new Date(summary.at) > 2 * 864e5) return {mismatch: null, at: isoKst(summary.at), note: '모든 쪽 검사 결과가 이틀 넘게 묵음'};
  let n = 0; const codeOnly = [];
  for (const p of summary.pages) {
    const j = pageOf(p.name);
    const f = Array.isArray(j?.fails) ? j.fails.length : Number.isInteger(j?.fails) ? j.fails : null;
    if (f == null) return {mismatch: null, at: isoKst(summary.at), note: `${p.name} 쪽 결과를 못 읽음`};
    n += f;
    if (p.code !== 0 && f === 0) codeOnly.push(p.name);
  }
  return {mismatch: n, at: isoKst(summary.at), note: codeOnly.length ? `끝 코드만 실패이고 걸린 곳 0 인 쪽: ${codeOnly.join(' · ')}` : ''};
}

// ───────────────────────── 사장님께 세 줄(아주 쉬운 말) · 알림 한 줄 ─────────────────────────
/** r = {applied, reverted, fixed, made, retested, failed, waiting, carry, notDone} → 세 줄(문장마다 짧게) */
export function ownerLines(r) {
  const L = [];
  const when = r.carry ? `${sayKst(r.carry, {day: false})} 업데이트` : '다음 업데이트';
  if (r.applied) L.push(`확인하신 진화 하나를 넣었어요. ${when}에 실려요.`);
  else if (r.reverted) L.push(`말씀하신 진화 하나를 되돌렸어요. ${when}에 실려요.`);
  else if (r.made) L.push(`새 진화 대안 ${r.made}개를 만들었어요.`);
  else if (r.retested) L.push(`기다리는 대안 ${r.retested}개를 새 자료로 다시 시험했어요.`);
  else if (r.fixed) L.push(`고장 ${r.fixed}개를 고쳤어요.`);
  else L.push('이번 진화 회차는 바꾼 것이 없어요.');
  if (r.failed) L.push(`${r.failed}. 그래서 넣지 않았어요.`);
  else if (r.waiting) L.push(`진화 칸에서 대안 ${r.waiting}개가 확인을 기다려요.`);
  else L.push('진화 칸에 기다리는 대안은 없어요.');
  L.push(`확인 없이 들어간 것은 0개예요. 못 한 것은 ${r.notDone ?? 0}가지예요.`);
  return L.slice(0, 3);
}
/** [9] 9 새 대안이 오르면 휴대폰 알림 한 줄 — name = brand.js NAME(이름 글자를 여기 박지 않음) */
export const noticeLine = (n, carry, name) => `${name} 진화 칸에 새 대안 ${n}개가 올라가요. ${carry ? sayKst(carry, {day: false}) + ' 업데이트부터 보여요.' : '다음 업데이트부터 보여요.'}`;
