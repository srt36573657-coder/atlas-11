// 보유종목 점검 맞대기 — 사장님 2026-10-17(싱가포르) 21:10 「고도리 · 하나로 묶은 명령문」 [5] 1 ~ 3 · 5 ~ 10(일 나누기 docs/design/godori-2026-10-17/brief2.md · 일꾼 D)
//   쓰는 법: node scripts/atlas11/next/check_hold.mjs --base http://127.0.0.1:8826 [--pw /opt/node-tools/] [--path /next/?dev=1] [--out 결과.json] [--all | --limit N]
//     다른 쪽 검사처럼 --all · --limit N 을 받음(이 검사는 짧아서 둘 다 모든 판을 돎 · --limit N = 꾸민 보유를 N곳까지)
//   기준 = 명령문 원문(order-2110.txt [5] — 첫 질문 글 · 다섯 가지 이름) · 결정표(brief.md — 다섯 문 이름 · 질문 3 답) · 시험 서버 자료(mkt.json · names.json · co/<번호>.json ·
//          /next/data/gates.json — 없으면 mkt.json 으로 만든 가짜를 바꿔 넣고 결과에 밝힘) · 화면 코드(p-hold.js)는 읽지 않고 기대 값을 따로 셈
//   ① 질문이 먼저 — 답하기 전 카드 = 이름 · 오늘 값 · 질문만(산 값 · 수익률 · 색 · 다섯 가지 없음) · 어제 답은 다시 물음 · 답한 뒤 차례 = 답 → 색 → (참은 날) → 수익률 → ① ~ ⑤
//   ② 색 — 꾸민 보유마다 기대 색(문 1 지남 · 못 지남 · 못 셈 · 클 일 앞 · 지남 · 그냥 · 매매일지 없음 · 팔 선 2% · 딱 3% · 지남 · 망할 이유 · 닫힌 문) · 줄 글 · 다섯 문 이름 · 「지남」 글
//   ③ 참은 날 — 🔴로 처음 본 날부터 · 🔴 아니면 풂 · 값 · 문을 못 받은 날은 그대로 · 첫 문 색 기억(g0) · 「나타났어」 누름(다시 누르면 풂 · 기억)
//   ④ 몫 — 몫 그림(종목 · 업종 · 셋에 하나 넘으면 금빛) · 80 : 20 · 셋이 똑같이(딱 셋에 하나는 넘지 않음)
//   ⑤ 적기 · 팔았어(나눠 팖 · 다 팖) · 잘못 적었어 — 기억 줄 수가 줄지 않음(지우지 않음) · 지난 보유 · 틀린 입력 글
//   ⑥ 펀드 · 우선주 — 점검 못 하는 까닭(이름표 글의 종류 · #/x 고리) · 수익률 없음
//   ⑦ 자료를 바꾼 길 — gates.json 못 받음 · co 파일 못 받음 · 기억 못 하는 기계(이 화면에서만 적힘)
//   ⑧ 모양 — 두 폭(360×640 · 390×844) 옆 넘침 0 · 칸 밖 0 · 누르는 자리 44px · 글 17px · 캔버스 0 · 쓰지 않을 말 0(내 글 · 남의 글 data-proper · lang="ko" 밖) · 화면 오류 0
//   ⑪ 관심 소식(2026-10-18 · 일꾼 S5h) — 담은 업종 · 큰 업종의 뽑힘 · 옮김 · 빠짐 + 오늘 가장 움직인 곳 · 날짜 새 것 먼저 · 줄 수 = 자료에서 따로 센 수 · 자료 못 받음 「?」 · 담은 곳 없음 소식 0 · 두 폭
//   ⑫ 편지 접기 — 한 덩이 ≤ 214px(360×640) · 「펼치기」 ≥ 44px · 펼치면 본디 높이 · 편지 글 = HELLO_MSG · 여는 그림이 접힌 칸 안에서 처음 한 번(세 폭)
//   ⑬ 바로 가기 · 카카오 · 기록 파일 · 탈퇴 — 가짜 NX.kakao 넷(없음 · 꺼짐 · 켜짐 가입 안 함 · 켜짐 가입함) · 고리 하나 · 지킴 글 두 꼴 · 내려받기 잡기 · 망 요청 0 · withdraw 정확히 1번
//   ⑭ 글씨 · 간격 · 왼쪽 줄 · 낱말 — css 글(p-hold.css 전부 + app.css 내 블록) var(--fs-n) · 0 · 8 · 16 · 24 · 음수 0 · 쪽 재기(17px · 6가지 · 글 시작 왼쪽 줄 ≤ 3 · 그려진 모든 칸의 margin · padding · gap 이 0 · 8 · 16 · 24 · 음수 0 — 편지 칸 포함) · 옛 낱말 0
//   ⑮ 우리가 만든 팔 선 없음(2026-10-18 총괄 결정 — 변호사 서면 의견 전까지) — 한국어 · 영어: 기본 팔 선 · 기본 약속 · 산 값 × 0.9 · × 1.2 값이 0 · 네가 적은 팔 선 줄은 그대로 · 안 적으면 「?」 한 줄 · 기억은 한 줄도 안 지움
//   --only 11,12,13,14,15 = 새 칸만(고치는 동안 빨리) · 옛 ① ~ ⑧ 은 --only 1 · 빼면 모두
//   실패가 하나라도 있으면 끝 코드 1(결과 파일은 --out 을 줄 때만)
import fs from 'node:fs/promises';
import path from 'node:path';
import {createRequire} from 'node:module';
import {fileURLToPath} from 'node:url';
import {NEW_NAME} from './rename.mjs'; // 이름 = site/next/brand.js 한 곳(규칙 76) — 글자를 박지 않음
import {NAME_EN} from '../../../site/next/brand.js';
import {screenHits} from '../../../site/next/words.js'; // 쓰지 않을 말 한 곳(명령문 [4] 4 · 일꾼 C) — 「사라져」 같은 보통 말은 빼고 셈
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');
const argv = process.argv.slice(2);
const arg = (k, d) => { const i = argv.indexOf(k); return i >= 0 && argv[i + 1] != null && !argv[i + 1].startsWith('--') ? argv[i + 1] : d; };
const require = createRequire(String(arg('--pw', process.env.PW_DIR || '/opt/node-tools/')).replace(/\/?$/, '/'));
const {chromium} = require('playwright');
const base = arg('--base', 'http://127.0.0.1:8826').replace(/\/$/, ''), NEXT = arg('--path', '/next/?dev=1'), OUT = arg('--out', null), ALL = argv.includes('--all'), LIMIT = Math.max(0, +arg('--limit', 0) || 0);
const ONLY = String(arg('--only', '') || '').split(',').map(x => x.trim()).filter(Boolean); // 고르면 그 칸만(1 = 옛 ① ~ ⑧ · 11 ~ 14 = 새 칸)
const RUN = k => !ONLY.length || ONLY.includes(String(k));
const MUT_JS = arg('--mutate-js', null) ? await fs.readFile(path.resolve(arg('--mutate-js', '')), 'utf8') : null; // 검사 자체 시험 — 이 파일 글을 p-hold.js 대신 내줌(결과에 mutated 로 밝힘)
const fails = [], counts = {}, t0 = Date.now();
let COUNTS_FOLD = null, COUNTS_CSS = null, COUNTS_WORDS = null, COUNTS_MEASURE = null;
const fail = (k, x) => { counts.fail = (counts.fail || 0) + 1; if (fails.length < 500) fails.push([k, String(x).slice(0, 400)]); };
const bump = (k, n = 1) => { counts[k] = (counts[k] || 0) + n; };
const eq = (a, b) => JSON.stringify(a) === JSON.stringify(b);

/* 기준 — 명령문 [5] · 결정표 */
const ORDER = await fs.readFile(path.join(ROOT, 'docs/design/godori-2026-10-17/order-2110.txt'), 'utf8').catch(() => '');
const BRIEF = await fs.readFile(path.join(ROOT, 'docs/design/godori-2026-10-17/brief.md'), 'utf8').catch(() => '');
const SEC5 = (ORDER.split('[5 · 보유종목 점검]')[1] ?? '').split('[6 ·')[0];
const QTEXT = (/첫 질문: 「([^」]+)」/.exec(SEC5) || [])[1];
const ITEMS = [...SEC5.matchAll(/^\s*([①②③④⑤]) (.+?)\s*$/gm)].map(m => m[1] + ' ' + m[2].replace(/\(숫자\)$/, '').replace(/다섯 문/g, '조건 다섯')); // 2026-10-18 [10] 1 — 옛 낱말 「다섯 문」은 화면에서 「조건 다섯」
const GATES = ((/다섯 문으로 걸러라: ([^\n]+?)\n/.exec(BRIEF) || [])[1] ?? '').split(' · ').map(s => s.trim()).filter(Boolean);
const Q3 = (/^3 뭐가 좋아\? 🟢(.+?) 🟡(.+?) 🔴(.+?) -/m.exec(BRIEF) || []).slice(1);
if (!QTEXT || ITEMS.length !== 5 || GATES.length !== 5 || Q3.length !== 3) { console.error('명령문(order-2110.txt [5]) · 결정표(brief.md)에서 질문 · 다섯 가지 · 다섯 문 · 질문 3 답을 못 읽음', QTEXT, ITEMS, GATES, Q3); process.exit(1); }
const SHORT = ['산 이유', '문 색', '망할 이유', '팔 약속', '몫']; // 색 이름표에 쓰는 짧은 이름(① ~ ⑤ 차례)
const SAY = {g: '좋음', y: '주의', r: '위험', u: '셀 수 없음', q: '모름'}; // 다섯 가지 줄 머리 색 점을 읽어 주는 글([9] 8 · 매매일지 TONE 과 같은 말)
const ASK_N = 3; // 「살 거야 · 잘 모르겠어 · 안 살 거야」
const KEY = 'atlas:godori-hold', WHY_KEY = 'atlas:godori-why';

/* 꼴(화면과 같은 꼴 — 셈은 따로) */
const TODAY = new Date(Date.now() + 9 * 36e5).toISOString().slice(0, 10);
const addD = (d, n) => new Date(Date.parse(d + 'T00:00:00Z') + n * 864e5).toISOString().slice(0, 10);
const md = d => (typeof d === 'string' && /^\d{4}-\d{2}-\d{2}/.test(d) ? `${+d.slice(5, 7)}월 ${+d.slice(8, 10)}일` : '?');
const comma = n => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
const won = n => comma(Math.round(n)) + '원';
const sWon = n => (Math.round(n) > 0 ? '+' : Math.round(n) < 0 ? '−' : '') + comma(Math.abs(Math.round(n))) + '원';
const one = x => (Math.floor(Math.abs(x) * 10 + 0.5 + 1e-7) / 10).toFixed(1);
const r1 = x => Math.sign(x) * Math.floor(Math.abs(x) * 10 + 0.5 + 1e-7) / 10;
const pct = x => { const v = r1(x), a = Math.abs(v); return (v > 0 ? '+' : v < 0 ? '−' : '') + (a >= 100 ? comma(Math.floor(a + 0.5 + 1e-7)) : a.toFixed(1)) + '%'; };
const qtyTxt = q => (Number.isInteger(q) ? comma(q) : String(q)) + '주';
const sellOf = b => Math.floor(b * 9 / 10), halfOf = b => Math.floor(b * 12 / 10); // 옛 기본 약속(산 값 × 0.9 · × 1.2 · 원 아래 버림) — 2026-10-18 총괄 결정으로 화면에서 뺌: 이제 화면에 나오면 안 되는 값을 알아보는 데에만 씀(⑮ · noSystemSell)

/* 자료(시험 서버) */
const getJ = async f => { const r = await fetch(base + f, {cache: 'no-store'}); if (!r.ok) throw Error(f + ' ' + r.status); return r.json(); };
const [MKT, NAMES] = await Promise.all(['/atlas/data/mkt.json', '/atlas/data/names.json'].map(f => getJ(f).catch(e => { fail('자료', e.message); return null; })));
if (!MKT?.companies || !Array.isArray(NAMES?.rows)) { console.log(JSON.stringify({counts, fails}, null, 1)); process.exit(1); }
/* 옛 v1 자료 시험(2026-10-18 총괄: 첫 올림은 옛 v1 gates.json · gdr.json 을 싣고 v2 는 두 번째 올림 — #/me 가 둘 다 읽혀야 함) — 서버 파일은 안 건드리고 이 파일 글을 화면에 내줌
   --gates-file <gates.json> · --gdr-file <gdr.json>(예: git show HEAD:site/next/data/gates.json > 임시/gates.json) — 기대 문 색도 이 파일에서 읽음 */
const GATES_FILE = arg('--gates-file', null), GDR_FILE = arg('--gdr-file', null);
const GATES_TXT = GATES_FILE ? await fs.readFile(path.resolve(GATES_FILE), 'utf8') : null, GDR_TXT = GDR_FILE ? await fs.readFile(path.resolve(GDR_FILE), 'utf8') : null;
const dataRoutes = async (ctx, gatesBody) => { // gates.json · gdr.json 을 파일 글로 바꿔 줌(두 판 모두 — 시험 서버 파일은 그대로)
  if (gatesBody) await ctx.route('**/next/data/gates.json', r => r.fulfill({status: 200, contentType: 'application/json', body: gatesBody}));
  if (GDR_TXT) await ctx.route('**/next/data/gdr.json', r => r.fulfill({status: 200, contentType: 'application/json', body: GDR_TXT}));
};
let GATE = GATES_TXT ? JSON.parse(GATES_TXT) : await getJ('/next/data/gates.json').catch(() => null), gatesSrc = GATES_FILE ? 'file ' + path.basename(path.resolve(GATES_FILE, '..')) + '/' + path.basename(GATES_FILE) + (GDR_FILE ? ' + ' + path.basename(GDR_FILE) : '') : 'real';
if (!GATE?.co) { // 아직 없으면 가짜(번호로 정한 값 · 결과에 밝힘)
  gatesSrc = 'fake';
  const co = {}; for (const c of Object.keys(MKT.companies)) { let x = 7; for (const ch of c) x = (x * 31 + ch.charCodeAt(0)) >>> 0; co[c] = x % 7 === 0 ? [1, null, null, null, null, null] : [0, ...[0, 1, 2, 3, 4].map(i => (x >> (i + 3)) & 1)]; }
  GATE = {schema: 'godori-gates-1', version: 'fake', asOf: MKT.asOf, keys: ['x', 'g1', 'g2', 'g3', 'g4', 'g5'], co};
}
/* 문 1 을 지난 곳이 하나도 없는 자료(gdr-v2 · 2026-10-18 — 다섯 문을 다 센 432곳이 모두 문 1 못 지남) — 이 검사는 화면이 「주어진」 문 색을 제대로 읽는지 보는 것이라
   다섯 문을 다 센 곳을 차례대로 세어 짝수 번째의 문 1 만 「지남」으로 바꾼 사본을 쓰고, 같은 사본을 꾸민 판의 화면에도 넘김(결과 gatesSrc 에 밝힘 · 다른 칸 ⑪ ~ ⑭ 는 진짜 자료 그대로) */
let GATE_BODY = GATES_TXT; // 파일 글 그대로(아래에서 문 1 지난 곳이 0 이면 고친 사본으로 바뀜)
{
  const fullRow = gv => Array.isArray(gv) && gv[0] === 0 && gv.slice(1, 6).every(v => v === 0 || v === 1);
  const cs = Object.keys(GATE.co).sort();
  if (!cs.some(c => fullRow(GATE.co[c]) && GATE.co[c][1] === 1)) {
    const co = {...GATE.co}; let k = 0, n = 0;
    for (const c of cs) if (fullRow(co[c]) && k++ % 2 === 0) { co[c] = co[c].slice(); co[c][1] = 1; n++; }
    if (n) { GATE = {...GATE, co}; GATE_BODY = JSON.stringify(GATE); gatesSrc += ` + 문 1 지남 ${n}곳 바꿈(진짜 자료엔 문 1 지난 곳 0)`; }
  }
}
const coCache = new Map();
const priceOf = async c => { if (!coCache.has(c)) coCache.set(c, await getJ('/atlas/data/co/' + c + '.json').then(j => (j?.c?.price > 0 ? {p: j.c.price, d: j.c.priceDate} : null)).catch(() => null)); return coCache.get(c); };
const used = new Set(), usedInd = new Set();
const CODES = Object.keys(MKT.companies).sort();
/** 회사 하나 고르기 — 문 조건 · 값 조건 · 업종은 서로 다르게(몫이 셋에 하나를 넘지 않게) */
async function pick(pred, extra = () => true) {
  for (const c of CODES) {
    const o = MKT.companies[c]; if (used.has(c) || usedInd.has(o.i)) continue;
    const gv = GATE.co[c]; if (!Array.isArray(gv) || !pred(gv)) continue;
    const px = await priceOf(c); if (!px || !extra(px.p)) continue;
    used.add(c); usedInd.add(o.i); return {code: c, name: o.n, ind: o.i, gv, p: px.p, pd: px.d};
  }
  return null;
}
const q3 = k => [2, 0, k, 0, 0, 0, 0, 0, 0, 0, 0]; // 답 열한 개 — 3번 「뭐가 좋아?」만 바꿈
const qtyFor = p => Math.max(1, Math.round(1e6 / p)); // 곳마다 몸값 100만 원 안팎(몫이 고르게)
const recOf = (X, k, o = {}) => ({at: new Date(Date.now() - 6e5).toISOString(), asOf: GATE.asOf, code: X.code, name: X.name, price: X.p, day: X.pd, answers: q3(k), score: 2, reds: 1, verdict: '좋아, 정해 둔 대로만', groups: {}, picks: [],
  why: '이익이 줄어서', promise: {sell: Math.floor(X.p * 0.8), half: Math.floor(X.p * 1.5), text: '만약 값이 떨어지면 판다.'}, ...o});

/* 꾸민 보유 — 판 A(값 = 시험 서버 그대로) */
const SC = []; // {key, X, rec, hold, c: [① … ⑤ 기대 색], ...}
async function scene(key, pred, extra, mk) {
  if (LIMIT && SC.length >= Math.max(6, LIMIT)) return;
  const X = await pick(pred, extra); if (!X) { bump('못 꾸민 판 · ' + key); return; }
  const s = mk(X); SC.push({key, X, ...s, hold: {id: 'hd-' + key, code: X.code, name: X.name, buy: Math.round(X.p * 0.95), qty: qtyFor(X.p), day: addD(TODAY, -20), at: new Date().toISOString(), ...(s.hold ?? {})}});
}
const full = gv => gv[0] === 0 && gv.slice(1, 6).every(v => v === 0 || v === 1); // 먼저 안 뺐고 다섯 문을 다 셈(값이 빈 문 없음)
const x0 = full, g1p = gv => full(gv) && gv[1] === 1;
await scene('문1지남', g1p, undefined, X => ({rec: recOf(X, 0), hold: {red: {from: addD(TODAY, -5)}, ask: {d: addD(TODAY, -1), a: 0}}, c: ['g', 'g', 'g', 'g', 'g'], redAfter: null}));
await scene('문1못지남', gv => full(gv) && gv[1] === 0, undefined, X => ({rec: recOf(X, 0), hold: {red: {from: addD(TODAY, -3)}}, c: ['r', 'g', 'g', 'g', 'g'], endure: 3}));
await scene('문못셈', gv => gv[0] === 1, undefined, X => ({rec: recOf(X, 0), c: ['u', 'u', 'g', 'g', 'g'], xline: '거래가 너무 적어'})); // 먼저 뺀 곳 — 문 1 도 셀 수 없음(🟡 셀 수 없음)
await scene('클일앞', x0, undefined, X => ({rec: recOf(X, 1, {bigDay: addD(TODAY, 5)}), c: ['g', 'g', 'g', 'g', 'g'], line1: `「${Q3[1]}」 — 네가 적은 날(${md(addD(TODAY, 5))})까지 5일 남았어.`}));
await scene('클일지남', x0, undefined, X => ({rec: recOf(X, 1, {bigDay: addD(TODAY, -1)}), c: ['r', 'g', 'g', 'g', 'g'], endure: 0, line1: `「${Q3[1]}」 — 네가 적은 날(${md(addD(TODAY, -1))})이 지났어.`}));
await scene('그냥', x0, undefined, X => ({rec: recOf(X, 2), c: ['y', 'g', 'g', 'g', 'g'], line1: `「${Q3[2]}」`}));
await scene('매매일지없음', x0, undefined, () => ({rec: null, c: ['u', 'g', 'q', 'u', 'g']})); // 매매일지가 없으면 팔 약속도 없음 → ④ 「?」(우리가 만든 팔 선으로 채우지 않음 · 2026-10-18)
await scene('팔선2', g1p, p => p >= 1000, X => ({rec: recOf(X, 0, {promise: {sell: Math.floor(X.p * 0.98), half: Math.floor(X.p * 1.5), text: '만약 조금만 내려도 판다.'}}), c: ['g', 'g', 'g', 'r', 'g']}));
await scene('팔선딱3', g1p, p => p % 100 === 0, X => ({rec: recOf(X, 0, {promise: {sell: X.p * 97 / 100, half: Math.floor(X.p * 1.5), text: '만약 3% 내리면 판다.'}}), c: ['g', 'g', 'g', 'r', 'g'], d4: '3.0'}));
await scene('팔선지남', g1p, undefined, X => ({rec: recOf(X, 0, {promise: {sell: X.p + 100, half: Math.floor(X.p * 1.5), text: '만약 내리면 판다.'}}), c: ['g', 'g', 'g', 'r', 'g'], past4: true}));
await scene('망할이유', g1p, undefined, X => ({rec: recOf(X, 0), hold: {doom: {at: new Date().toISOString()}}, c: ['g', 'g', 'y', 'g', 'g']}));
await scene('닫힌문', gv => g1p(gv) && [2, 3, 4, 5].some(i => gv[i] === 0), undefined, X => ({rec: recOf(X, 0), hold: {g0: {d: '2026-10-01', ver: GATE.version ?? null, v: [0, 1, 1, 1, 1, 1]}}, c: ['g', 'y', 'g', 'g', 'g'],
  line2: `처음 적은 날(10월 1일)보다 닫힌 문: ${GATES.filter((_, i) => X.gv[i + 1] === 0).join(' · ')}.`}));
await scene('약속없음', g1p, undefined, X => ({rec: recOf(X, 0, {promise: null}), c: ['g', 'g', 'g', 'u', 'g']})); // 매매일지는 있는데 팔 약속이 없음 → ④ 「?」 한 줄 + 적으러 가는 고리(우리가 만든 팔 선 없음 · 2026-10-18)
await scene('절반없음', g1p, undefined, X => ({rec: recOf(X, 0, {promise: {sell: Math.floor(X.p * 0.8), half: null, text: '만약 값이 떨어지면 판다.'}}), c: ['g', 'g', 'g', 'g', 'g']})); // 절반 팔 선을 안 적음 → 우리가 채운 절반 팔 선 줄 없음(내 팔 선 줄만)
const PREF =NAMES.rows.find(r => r.c === '005935' && r.k) ?? NAMES.rows.find(r => r.k === 'pref') ?? NAMES.rows.find(r => r.k);
const XH = PREF ? {id: 'hd-밖', code: PREF.c, name: PREF.n, buy: 100000, qty: 10, day: addD(TODAY, -30), at: new Date().toISOString()} : null; // 회사 주식 밖(값을 모름 — 몫은 산 값으로)
const XLABEL = PREF ? String(PREF.w ?? '').split(' — ')[0] : null;
const PAST = [ // 지난 보유 — 판 것 · 잘못 적은 것(지우지 않음 · 카드로 안 나옴)
  {id: 'hd-판', code: SC[0]?.X.code ?? '005930', name: SC[0]?.X.name ?? '?', buy: 1000, qty: 5, day: addD(TODAY, -40), at: new Date().toISOString(), sold: {day: addD(TODAY, -2), price: 1100, at: new Date().toISOString()}},
  {id: 'hd-잘못', code: SC[1]?.X.code ?? '005930', name: SC[1]?.X.name ?? '?', buy: 2000, qty: 1, day: addD(TODAY, -10), at: new Date().toISOString(), wrong: {at: new Date().toISOString()}}];
if (SC.length < 6) fail('꾸민 판이 모자람', SC.map(s => s.key).join(','));
bump('꾸민 보유', SC.length);

/** 몫 — 따로 셈(지금 값 × 수량 · 값이 없으면 산 값) */
function sharesOf(holds) {
  const by = new Map(), ind = new Map(); let tot = 0;
  for (const o of holds) {
    if (o.sold || o.wrong) continue;
    const M = MKT.companies[o.code], p = M ? coCache.get(o.code)?.p ?? null : null, v = (p ?? o.buy) * o.qty, i = M ? M.i : String(NAMES.rows.find(r => r.c === o.code)?.w ?? '').split(' — ')[0];
    by.set(o.code, (by.get(o.code) ?? 0) + v); ind.set(i, (ind.get(i) ?? 0) + v); tot += v;
  }
  return {by, ind, tot};
}
const isBig = (v, tot) => v * 3 > tot * (1 + 1e-12);
/** 기대 색 이름표 */
function badgeOf(c, s) {
  if (c.includes('r')) return '🔴 ' + [...(c[3] === 'r' ? [s.past4 ? '팔 선 지남' : '팔 선 가까움'] : []), ...(c[0] === 'r' ? ['산 이유 없어짐'] : [])].join(' · ');
  const y = SHORT.filter((_, i) => c[i] === 'y'), u = SHORT.filter((_, i) => c[i] === 'u');
  return y.length || u.length ? '🟡 ' + [...(y.length ? [y.length > 1 ? `${y.length}가지 흔들림` : '하나 흔들림', ...y] : []), ...(u.length ? ['셀 수 없음', ...u] : [])].join(' · ') : '🟢 그대로';
}

/* 브라우저 — 한 번에 하나 · 판마다 새 칸 */
const exe = '/opt/pw-browsers/chromium', browser = await chromium.launch((await fs.stat(exe).catch(() => null)) ? {executablePath: exe} : {});
async function newPage(width, height, {holds = null, recs = null, store = 'ok', routes = [], allow = []} = {}) {
  const ctx = await browser.newContext({viewport: {width, height}, deviceScaleFactor: 1, hasTouch: true, locale: 'ko-KR', timezoneId: 'Asia/Seoul'});
  if (store === 'throw') await ctx.addInitScript(() => { Object.defineProperty(window, 'localStorage', {configurable: true, get() { throw new DOMException('막힘', 'SecurityError'); }}); });
  else if (holds || recs) await ctx.addInitScript(([k1, v1, k2, v2]) => { if (sessionStorage.getItem('hd-seeded')) return; if (v1) localStorage.setItem(k1, v1); if (v2) localStorage.setItem(k2, v2); sessionStorage.setItem('hd-seeded', '1'); }, [KEY, holds ? JSON.stringify(holds) : null, WHY_KEY, recs ? JSON.stringify(recs) : null]);
  await dataRoutes(ctx, GATE_BODY); // 바꾼 사본 · 옛 v1 파일(아래 routes 가 나중에 걸려 먼저 받음)
  if (MUT_JS) await ctx.route('**/next/p-hold.js', r => r.fulfill({status: 200, contentType: 'text/javascript; charset=utf-8', body: MUT_JS})); // 검사 자체 시험(--mutate-js): 옛 기본 팔 선 코드를 끼우면 ⑮ 와 ④ 가 걸려야 함
  for (const [pat, fn] of routes) await ctx.route(pat, fn);
  const p = await ctx.newPage(); p._errs = [];
  const allowed = u => allow.some(a => String(u || '').includes(a));
  p.on('pageerror', e => p._errs.push('pageerror ' + e.message));
  p.on('console', m => { if (m.type() !== 'error') return; const u = m.location()?.url; if (/Failed to load resource/.test(m.text()) && allowed(u)) return; p._errs.push(m.text() + (u ? ' @ ' + u : '')); });
  p.on('response', r => { if (r.status() >= 400 && r.url().startsWith(base) && !allowed(r.url())) p._errs.push(r.status() + ' ' + r.url()); });
  return p;
}
const errsOf = (p, tag) => { if (p._errs.length) { fail('화면 오류', tag + ' · ' + p._errs.slice(0, 3).join(' | ')); p._errs.length = 0; } };
const SEL = '#view section.hd';
async function open(p, hash = '#/me') {
  await p.goto(base + NEXT + hash, {waitUntil: 'domcontentloaded'});
  await p.waitForFunction(s => !!document.querySelector(s) && !document.querySelector('#view .boot'), SEL, {timeout: 30000});
  await p.waitForTimeout(150);
}
const store = (p, k = KEY) => p.evaluate(k => { try { return JSON.parse(localStorage.getItem(k) || 'null'); } catch { return '막힘'; } }, k);

/* 화면에서 읽기 */
const READH = sel => {
  const s = document.querySelector(sel); if (!s) return null;
  const cls = (e, re) => ((e?.className || '').match(re) || [])[1] ?? null;
  const cards = [...s.querySelectorAll('article.hd-card')].map(c => ({
    id: c.getAttribute('data-id'), code: c.getAttribute('data-code'), text: c.textContent,
    kids: [...c.children].map(k => (k.classList.contains('hd-kr') ? k.firstElementChild?.className.split(' ')[0] ?? 'hd-kr' : k.className.split(' ')[0])), // 이름 줄은 카톡 단추와 함께 감쌈(div.hd-kr = 이름 + 단추 · p-hold KB2) — 차례는 그 안 첫 칸(hd-ch)으로 셈(일꾼 KI)
    head: c.querySelector('.hd-ch')?.textContent ?? '', nameProper: !!c.querySelector('.hd-ch [data-proper]'), nameHref: c.querySelector('a.hd-name')?.getAttribute('href') ?? null,
    px: c.querySelector('.hd-px')?.textContent ?? '', qh: c.querySelector('.hd-qh')?.textContent ?? null, opts: [...c.querySelectorAll('.hd-opt')].map(b => b.textContent),
    ans: c.querySelector('.hd-ans b')?.textContent ?? null, badge: c.querySelector('.hd-badge') ? {c: cls(c.querySelector('.hd-badge'), /\bhd-c([gyrqu])\b/), t: c.querySelector('.hd-badge').textContent} : null,
    endure: c.querySelector('.hd-endure')?.textContent ?? null, ret: c.querySelector('.hd-ret')?.textContent ?? null,
    lines: [...c.querySelectorAll(':scope > .hd-line')].map(x => x.textContent), link: c.querySelector(':scope > .hd-link')?.getAttribute('href') ?? null,
    items: [...c.querySelectorAll('.hd-it')].map(it => ({c: cls(it, /\bhd-i([gyrqu])\b/), n: it.querySelector('.hd-in > span:not(.hd-dot)')?.textContent ?? '', dot: cls(it.querySelector('.hd-in .hd-dot'), /\bhd-c([gyrqu])\b/),
      say: it.querySelector('.hd-in .hd-dot > .hd-sr')?.textContent ?? null, dotHidden: it.querySelector('.hd-in .hd-dot')?.getAttribute('aria-hidden') ?? null, dotLast: it.querySelector('.hd-in')?.lastElementChild?.classList.contains('hd-dot') ?? false,
      lines: [...it.querySelectorAll('.hd-line')].map(x => x.textContent), gates: [...it.querySelectorAll('.hd-gates > li')].map(li => [li.querySelector('span:not(.hd-dot)')?.textContent ?? '', li.querySelector('b')?.textContent ?? '']),
      mine: [...it.querySelectorAll('.hd-mine q[data-proper]')].map(q => q.textContent), langs: [...it.querySelectorAll('.hd-mine q[data-proper]')].map(q => q.getAttribute('lang')), tog: it.querySelector('.hd-tog')?.getAttribute('aria-pressed') ?? null, link: it.querySelector('.hd-link')?.getAttribute('href') ?? null}))}));
  const bars = [...s.querySelectorAll('.hd-pic .hd-bars')].map(b => [...b.querySelectorAll('.hd-bar')].map(r => [r.querySelector('.hd-bn')?.textContent ?? '', r.querySelector('b')?.textContent ?? '', !!r.querySelector('.hd-fill.over'), !!r.querySelector('.hd-third')]));
  const past = s.querySelector('details.hd-past');
  return {cards, bars, empty: [...s.querySelectorAll(':scope > .hd-note')].map(x => x.textContent), mem: s.querySelector('.hd-q-note')?.textContent ?? null, leg: !!s.querySelector('details.hd-leg'), legText: s.querySelector('details.hd-leg')?.textContent ?? '', legLines: [...s.querySelectorAll('details.hd-leg > .hd-line')].map(x => x.textContent),
    pastN: past?.querySelector('summary')?.textContent ?? null, pastOpen: !!past?.open, pastRows: [...(past?.querySelectorAll('.hd-prow') ?? [])].map(r => r.textContent), add: !!s.querySelector('button.hd-add-b'), form: !!s.querySelector('form.hd-add'), err: s.querySelector('.hd-err')?.textContent ?? ''};
};
/** 모양 — 옆 넘침 · 칸 밖 · 누르는 자리 · 글 크기 · 캔버스 · 쓰지 않을 말(내 글 · 남의 글 · 이름표 글) */
const LAYOUT = sel => {
  const vw = document.documentElement.clientWidth, root = document.querySelector(sel);
  const out = {sw: document.documentElement.scrollWidth, vw, wide: [], small: [], tiny: [], canvas: 0, text: '', attrs: [], missing: !root};
  if (!root) return out;
  const desc = e => e.tagName.toLowerCase() + (typeof e.className === 'string' && e.className.trim() ? '.' + e.className.trim().split(/\s+/).join('.') : '') + ' 「' + (e.textContent || '').trim().slice(0, 24) + '」';
  for (const e of [root, ...root.querySelectorAll('*')]) {
    if (e.ownerSVGElement || e.closest('details:not([open]) > :not(summary)')) continue;
    const r = e.getBoundingClientRect(); if (r.width < 2 && r.height < 2) continue;
    if (r.right > vw + 1 || r.left < -1) out.wide.push(desc(e) + ' ' + Math.round(r.left) + '~' + Math.round(r.right));
    const cs = getComputedStyle(e);
    if (cs.visibility !== 'hidden' && [...e.childNodes].some(n => n.nodeType === 3 && n.textContent.trim()) && parseFloat(cs.fontSize) < 16.95) out.tiny.push(desc(e) + ' ' + cs.fontSize);
  }
  for (const e of root.querySelectorAll('a[href], button, input, select, textarea, summary, [role="button"]')) { const r = e.getBoundingClientRect(); if (!r.width || !r.height) continue; if (r.height < 43.5 || r.width < 43.5) out.small.push(desc(e) + ' ' + Math.round(r.width) + '×' + Math.round(r.height)); }
  out.canvas = root.querySelectorAll('canvas').length;
  const c = root.cloneNode(true); c.querySelectorAll('[data-proper], [lang="ko"]').forEach(x => x.remove()); out.text = c.textContent;
  for (const e of [c, ...c.querySelectorAll('*')]) for (const a of ['aria-label', 'title', 'alt', 'placeholder']) { const v = e.getAttribute?.(a); if (v) out.attrs.push(v); }
  return out;
};
async function layout(p, tag) {
  const s = await p.evaluate(LAYOUT, SEL); bump('모양 잰 화면');
  if (s.missing) { fail('칸 없음', tag); return; }
  if (s.sw > s.vw) fail('옆으로 넘침', `${tag}: ${s.sw} > ${s.vw}`);
  for (const x of s.wide.slice(0, 3)) fail('칸 밖으로 나감', `${tag}: ${x}`);
  for (const x of s.small.slice(0, 3)) fail('누르는 자리 44px 밑', `${tag}: ${x}`);
  for (const x of s.tiny.slice(0, 3)) fail('글 17px 밑', `${tag}: ${x}`);
  if (s.canvas) fail('캔버스(입체 없음 규칙 50)', tag);
  const T = s.text + '\n' + s.attrs.join('\n');
  for (const b of screenHits(T)) fail('쓰지 않을 말(words.js screenHits)', `${tag} 「${b}」`);
}
const cardOf = (g, id) => g?.cards.find(c => c.id === id) ?? null;

/** 답하기 전 — 이름 · 오늘 값 · 질문만(산 값 · 수익률 · 색 · 다섯 가지 없음) */
function checkAsk(c, o, tag) {
  if (!c) { fail('카드 없음', tag); return; }
  if (c.qh !== QTEXT) fail('첫 질문 글(명령문 [5] 3)', `${tag} 「${c.qh}」`);
  if (c.opts.length !== ASK_N) fail('답 셋', `${tag} ${JSON.stringify(c.opts)}`);
  if (c.ans != null || c.badge || c.ret != null || c.items.length || c.endure != null) fail('질문 앞에 수익률 · 색 · 점검이 보임([5] 3)', `${tag} ${JSON.stringify({ans: c.ans, badge: c.badge, ret: c.ret, items: c.items.length})}`);
  if (c.text.includes('산 값 ') || c.text.includes(won(o.buy))) fail('질문 앞에 산 값이 보임([5] 3)', `${tag} 「${c.text.slice(0, 120)}」`);
  if (/[+−]\d+(\.\d)?%/.test(c.text)) fail('질문 앞에 % 가 보임', `${tag} 「${c.text.slice(0, 120)}」`);
  if (!eq(c.kids, ['hd-ch', 'hd-px', 'hd-ask'])) fail('답하기 전 차례(이름 · 오늘 값 · 질문)', `${tag} ${c.kids.join(',')}`);
  bump('질문 먼저 맞댄 카드');
}
/** 우리가 만든 팔 선이 화면 글에 없음(2026-10-18 총괄 결정 — 자본시장법 변호사의 서면 의견을 받기 전까지 · 고도리 칸 [9] 1 · 규칙 77 「내 약속과 대조만」과 같게)
 *  T = 화면 글 · buy = 산 값 · keep = 화면에 따로 이유가 있어 나와도 되는 값(산 값 · 오늘 값 · 내가 적은 약속 숫자) · lang = ko | en
 *  보는 것 둘: ① 기본 팔 선 · 기본 약속 · 「산 값의 90% · 120%」 글 ② 옛 기본 약속 값(산 값 × 0.9 · × 1.2)이 숫자로 */
const SYS_RE = {ko: /기본 (절반 )?팔 선|기본 약속|산 값의 ?\d|약속으로 셌어/, en: /default|we used|of the price paid/i};
const numFmt = {ko: won, en: n => comma(Math.round(n)) + ' won'};
const hasNum = (T, w) => new RegExp('(?<![\\d,])' + w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '(?![\\d,])').test(T);
function noSystemSell(T, buy, keep, lang, at) {
  const m = SYS_RE[lang].exec(T);
  if (m) fail('우리가 만든 팔 선 글이 보임(변호사 서면 의견 전까지 없음)', `${at} [${lang}] 「…${T.slice(Math.max(0, m.index - 16), m.index + 36)}…」`);
  const keepS = keep.map(numFmt[lang]);
  if (buy > 0) for (const w of [sellOf(buy), halfOf(buy)].map(numFmt[lang])) if (!keepS.includes(w) && hasNum(T, w)) fail('우리가 만든 팔 선 값(산 값 × 0.9 · × 1.2)이 보임', `${at} [${lang}] 「${w}」`);
  bump('우리가 만든 팔 선 없음 맞댄 글 ' + lang);
}
/** ④ 줄 기대(따로 셈) — 네가 적은 팔 선이 있으면 그 선과 절반 팔 선까지 거리만, 없으면 「?」 한 줄(한국어 · 영어 — 영어는 사전 en-src.json 의 글) */
const NO_PROMISE = {ko: '? 팔 약속을 안 적어서 거리를 못 셌어. 매매일지에 적어 두면 네가 적은 숫자와 맞대 볼게.', en: "? No sell promise written, so no distance yet. Write one in your journal and we'll check it against the numbers you wrote."};
const LEG_PROMISE = {ko: '팔 약속은 네가 매매일지에 적은 숫자와만 맞대 봐요. 안 적었으면 「?」로 보여요.', en: "Your sell promise is only checked against the numbers you wrote in your journal. If you didn't write one, it shows “?”."};
function want4Lines(lang, p, P) {
  const F = numFmt[lang], sell = P?.sell, half = P?.half;
  if (!(sell > 0)) return [NO_PROMISE[lang]];
  const d = (p - sell) / p * 100, dp = (sell - p) / sell * 100, dh = (half - p) / p * 100;
  const L = lang === 'ko' ? [p <= sell ? (p === sell ? `네가 정한 팔 선(${F(sell)})에 닿았어.` : `네가 정한 팔 선(${F(sell)})을 지났어. 오늘 값이 팔 선보다 ${one(dp)}% 아래야.`) : `네가 정한 팔 선까지 ${one(d)}% 남았어. 한 주에 ${F(p - sell)}이야.`]
    : [p <= sell ? (p === sell ? `Hit the sell line you set (${F(sell)}).` : `Went past the sell line you set (${F(sell)}). Today's price is ${one(dp)}% below it.`) : `${one(d)}% left to the sell line you set. That's ${F(p - sell)} a share.`];
  if (half > 0) L.push(lang === 'ko' ? (p >= half ? `네가 정한 절반 팔 선(${F(half)})에 닿았어.` : `네가 정한 절반 팔 선(${F(half)})까지 ${one(dh)}% 남았어.`) : (p >= half ? `Hit the sell-half line you set (${F(half)}).` : `${one(dh)}% left to the sell-half line you set (${F(half)}).`));
  return L;
}
/** 답한 뒤 — 차례 · 색 · 수익률 · ① ~ ⑤ */
function checkDone(c, s, SH, tag, ansK) {
  const o = s.hold, X = s.X, p = X.p, at = `${tag} ${s.key}`;
  if (!c) { fail('카드 없음', at); return; }
  if (ansK != null && c.ans !== c.opts?.[ansK] && c.ans == null) fail('답 표시', at);
  const want = ['hd-ch', 'hd-px', 'hd-ans', 'hd-badge', ...(s.c.includes('r') ? ['hd-endure'] : []), 'hd-ret', 'hd-it', 'hd-it', 'hd-it', 'hd-it', 'hd-it', 'hd-act'];
  if (!eq(c.kids.slice(0, want.length), want)) fail('답한 뒤 차례(답 → 색 → 참은 날 → 수익률 → ① ~ ⑤)', `${at} ${c.kids.join(',')}`);
  if (!eq(c.items.map(x => x.n), ITEMS)) fail('다섯 가지 이름 · 차례(명령문 [5] 5)', `${at} ${JSON.stringify(c.items.map(x => x.n))}`);
  if (!eq(c.items.map(x => x.c), s.c) || !eq(c.items.map(x => x.dot), s.c)) fail('다섯 가지 색', `${at} ${c.items.map(x => x.c + '/' + x.dot).join(',')} ≠ ${s.c.join(',')}`);
  if (!eq(c.items.map(x => x.say), s.c.map(k => SAY[k])) || c.items.some(x => x.dotHidden !== null || !x.dotLast)) fail('다섯 가지 색 점을 읽어 주는 글([9] 8 · 좋음 · 주의 · 위험 · 셀 수 없음 · 모름 · 점은 숨기지 않고 글 뒤)', `${at} ${JSON.stringify(c.items.map(x => [x.say, x.dotHidden, x.dotLast]))} ≠ ${s.c.map(k => SAY[k]).join(',')}`);
  else bump('색 점 읽어 주는 글 맞댄 줄', c.items.length);
  const color = s.c.includes('r') ? 'r' : s.c.includes('y') || s.c.includes('u') ? 'y' : 'g';
  if (c.badge?.c !== color || c.badge?.t !== badgeOf(s.c, s)) fail('색 이름표([5] 7)', `${at} ${JSON.stringify(c.badge)} ≠ ${color} 「${badgeOf(s.c, s)}」`);
  const ret = (p / o.buy - 1) * 100, amt = (p - o.buy) * o.qty;
  const wantRet = `산 값 ${won(o.buy)} → 오늘 ${won(p)} ${pct(ret)} ${sWon(amt)}`;
  if (c.ret !== wantRet) fail('수익률(따로 셈)', `${at} 「${c.ret}」 ≠ 「${wantRet}」`);
  if (!c.px.startsWith(`오늘 값 ${won(p)} · ${md(X.pd)} 종가`)) fail('오늘 값 줄', `${at} 「${c.px}」`);
  if (c.nameHref !== '#/w/' + encodeURIComponent(X.code) || !c.nameProper) fail('이름 고리', `${at} ${c.nameHref}`);
  const [i1, i2, i3, i4, i5] = c.items;
  // ①
  if (s.rec === null) { if (i1.link !== '#/why/' + encodeURIComponent(X.code)) fail('① 매매일지 없음 → 이 회사로 왜 사? 고리', `${at} ${i1.link}`); }
  else {
    const cq = s.rec.answers[2];
    if (cq === 0) { const GD = md(GATE.asOf), want1 = X.gv[0] !== 0 || X.gv[1] == null ? `「${Q3[0]}」 — ? ${GD} 자료로 문 1(이익 늘었나)을 셀 수 없어.` : X.gv[1] === 1 ? `「${Q3[0]}」 — ${GD} 자료로도 문 1(이익 늘었나)을 지나.` : `「${Q3[0]}」 — ${GD} 자료로 문 1(이익 늘었나)을 못 지나. 산 이유가 없어졌어.`; /* 문 1 = gates.json 날짜의 자료(「오늘」 아님) */ if (!i1.lines.includes(want1)) fail('① 돈을 잘 번다 → 오늘 문 1', `${at} ${JSON.stringify(i1.lines)} ∌ 「${want1}」`); }
    if (s.line1 && !i1.lines.some(t => t.startsWith(s.line1))) fail('① 줄 글', `${at} ${JSON.stringify(i1.lines)} ∌ 「${s.line1}」`);
    const wd = md(new Date(Date.parse(s.rec.at) + 9 * 36e5).toISOString().slice(0, 10)); // 매매일지를 쓴 날(서울)
    if (!i1.lines.includes(`${wd} 매매일지에서 읽었어.`)) fail('① 매매일지 날짜(쓴 날)', `${at} ${JSON.stringify(i1.lines)}`);
  }
  // ② 다섯 문 오늘 색 — 이름(결정표) · 지남 글 · 처음 색과 견줌
  const wantG = GATES.map((n, i) => [n, X.gv[i + 1] === 1 ? '지남' : X.gv[i + 1] === 0 ? '못 지남' : '?']);
  if (!eq(i2.gates, wantG)) fail('② 다섯 문 이름 · 지남(gates.json)', `${at} ${JSON.stringify(i2.gates)} ≠ ${JSON.stringify(wantG)}`);
  const STALE_G = GATE.asOf < MKT.asOf, want2 = [`${md(GATE.asOf)} 종가로 센 색이에요.`, ...(STALE_G ? [`? 사이트 자료는 ${md(MKT.asOf)}까지라 지금 색과 다를 수 있어요.`] : [])]; // ② 첫 줄 = 센 날 · 사이트 자료가 더 새면 금빛 「?」 줄
  if (!eq(i2.lines.slice(0, want2.length), want2) || (!STALE_G && i2.lines.some(t => t.includes('사이트 자료는')))) fail('② 센 날 줄 · 사이트 자료 날 「?」 줄', `${at} ${JSON.stringify(i2.lines)} · 기대 ${JSON.stringify(want2)}`);
  if (s.xline && !i2.lines.some(t => t.startsWith(s.xline))) fail('② 먼저 뺀 까닭', `${at} ${JSON.stringify(i2.lines)}`);
  const nul = X.gv[0] === 0 ? GATES.filter((_, i) => X.gv[i + 1] == null) : [];
  if (nul.length ? !i2.lines.includes(`? ${md(GATE.asOf)} 자료로 셀 수 없는 문: ${nul.join(' · ')}.`) : i2.lines.some(t => t.includes('셀 수 없는 문'))) fail('② 셀 수 없는 문 줄(값이 빈 문 = 「?」)', `${at} ${JSON.stringify(i2.lines)}`);
  if (s.line2 ? !i2.lines.includes(s.line2) : !i2.lines.some(t => t.startsWith('처음 적은 날'))) fail('② 처음 색과 견줌', `${at} ${JSON.stringify(i2.lines)} · 기대 「${s.line2 ?? '처음 적은 날 …'}」`);
  // ③ 망할 이유 — 내 글(data-proper · lang=ko) · 누름
  if (s.rec?.why) { if (!eq(i3.mine, [s.rec.why]) || !eq(i3.langs, [/[가-힣]/.test(s.rec.why) ? 'ko' : null]) || i3.tog !== String(!!o.doom)) fail('③ 망할 이유 글(내가 쓴 글 · 한글이면 lang=ko) · 누름', `${at} ${JSON.stringify(i3.mine)} ${JSON.stringify(i3.langs)} ${i3.tog}`); }
  else if (i3.tog != null || !i3.lines.some(t => t.startsWith('?'))) fail('③ 망할 이유 없음 「?」', `${at} ${JSON.stringify(i3)}`);
  // ④ 팔 약속까지 — 네가 적은 약속과 견줌만(2026-10-18 총괄 결정: 우리가 만든 기본 팔 선 · 기본 절반 팔 선 · 산 값 × 0.9 · × 1.2 는 변호사 서면 의견 전까지 화면에 없음 — 고도리 칸 [9] 1 과 같게)
  const P = s.rec?.promise, own = !!P?.sell, want4 = want4Lines('ko', p, P);
  if (!eq(i4.lines, want4)) fail(own ? '④ 네가 적은 팔 선 · 절반 팔 선까지 거리만(따로 셈 · [5] 8 · 우리가 채운 줄 없음)' : '④ 팔 약속을 안 적음 → 「?」 한 줄만(우리가 만든 팔 선 없음)', `${at} ${JSON.stringify(i4.lines)} ≠ ${JSON.stringify(want4)}`);
  if (own) {
    if (s.d4 && !i4.lines.some(t => t.includes(`팔 선까지 ${s.d4}% 남았어`))) fail('④ 딱 3%', `${at} ${JSON.stringify(i4.lines)}`);
    if (P.text && !(eq(i4.mine, [P.text]) && eq(i4.langs, [null]))) fail('④ 내가 적은 약속 글(data-proper · lang 없음 — 영어 사전 틀로 바뀜)', `${at} ${JSON.stringify(i4.mine)} ${JSON.stringify(i4.langs)}`);
    if (i4.link !== null) fail('④ 약속을 적었는데 적으러 가는 고리가 있음', `${at} ${i4.link}`);
    bump('④ 네가 적은 팔 선 줄 맞댄 카드');
  } else {
    const wantLink = s.rec ? '#/why/' + encodeURIComponent(X.code) : null;
    if (i4.link !== wantLink) fail('④ 팔 약속을 안 적음 → 적으러 가는 고리(매매일지가 아예 없으면 ①에 같은 고리가 있어 여기엔 없음)', `${at} ${i4.link} ≠ ${wantLink}`);
    if (i4.mine.length) fail('④ 약속을 안 적었는데 「네가 적은 약속」 글이 있음', `${at} ${JSON.stringify(i4.mine)}`);
    bump('④ 팔 약속 안 적은 카드(「?」 한 줄)');
  }
  if (i4.lines.some(t => /팔아|파세요|팔 때/.test(t))) fail('④ 권하는 말', `${at} ${JSON.stringify(i4.lines)}`);
  noSystemSell(c.text, o.buy, [o.buy, p, Math.abs((p - o.buy) * o.qty), ...(own ? [P.sell, P.half].filter(v => v > 0) : [])], 'ko', at);
  // ⑤ 몫
  const v = SH.by.get(X.code), vi = SH.ind.get(X.ind), big = isBig(v, SH.tot) || isBig(vi, SH.tot);
  const want5 = `이 종목 몫 ${one(v / SH.tot * 100)}% · ${X.ind} 업종 몫 ${one(vi / SH.tot * 100)}%.` + (big ? ' 셋에 하나보다 커.' : '');
  if (!eq(i5.lines, [want5])) fail('⑤ 몫(따로 셈)', `${at} ${JSON.stringify(i5.lines)} ≠ 「${want5}」`);
  bump('답한 뒤 맞댄 카드');
}

let EMPTY = null;
if (RUN(1)) { // ═══ 옛 ① ~ ⑧(일꾼 D · E) ═══
/* ① ~ ③ 판 A — 열 곳 넘게(값 = 시험 서버) · 360×640 */
const HOLDS = [...SC.map(s => s.hold), ...(XH ? [XH] : []), ...PAST], RECS = SC.filter(s => s.rec).map(s => s.rec);
const SH_A = sharesOf(HOLDS);
for (const s of SC) { const v = SH_A.by.get(s.X.code); if (isBig(v, SH_A.tot)) s.c[4] = 'y'; } // 몫이 셋에 하나를 넘는 판이면 ⑤ 기대도 따라감(곳이 적을 때 · --limit)
{
  const tag = '판A 360×640', p = await newPage(360, 640, {holds: HOLDS, recs: RECS});
  try {
    await open(p);
    let g = await p.evaluate(READH, SEL);
    const act = HOLDS.filter(o => !o.sold && !o.wrong);
    if (g.cards.length !== act.length) fail('카드 수 = 들고 있는 것(판 것 · 잘못 적은 것 빼고)', `${tag} ${g.cards.length} ≠ ${act.length}`);
    for (const o of act) checkAsk(cardOf(g, o.id), o, `${tag} ${o.id}`);
    // 몫 그림 — 종목 · 업종(큰 차례 · 위 여섯 · 넷 · 나머지는 「그 밖」) · 금빛 = 셋에 하나 넘음 · 점선
    const top = (m, k) => { const a = [...m].sort((x, y) => y[1] - x[1] || (x[0] < y[0] ? -1 : 1)); if (a.length <= k) return a; return [...a.slice(0, k - 1), [`그 밖 ${a.length - k + 1}곳`, a.slice(k - 1).reduce((s2, x) => s2 + x[1], 0)]]; };
    const nm = c => MKT.companies[c]?.n ?? HOLDS.find(o => o.code === c)?.name ?? c;
    const wantB = [top([...SH_A.by].map(([c, v]) => [nm(c), v]), 6), top([...SH_A.ind], 4)].map(rows => rows.map(([n, v]) => [n, one(v / SH_A.tot * 100) + '%', isBig(v, SH_A.tot), true]));
    if (!eq(g.bars, wantB)) fail('몫 그림(따로 셈)', `${tag} ${JSON.stringify(g.bars).slice(0, 300)} ≠ ${JSON.stringify(wantB).slice(0, 300)}`);
    if (!g.leg) fail('색 풀이 접힌 칸', tag);
    else { // 색 풀이 글에도 우리가 만든 팔 선(기본 약속 · 산 값의 90% · 120%)이 없고, 팔 약속 풀이는 「네가 적은 숫자와만 · 안 적으면 ?」
      if (!g.legLines.includes(LEG_PROMISE.ko)) fail('색 풀이 · 팔 약속 풀이(네가 적은 숫자와만 맞댐 · 안 적으면 「?」)', `${tag} ${JSON.stringify(g.legLines.slice(-2))}`);
      noSystemSell(g.legText, 0, [], 'ko', tag + ' 색 풀이');
    }
    if (!g.empty.some(t => t.includes('정식 투자자문업자') && t.includes(NEW_NAME))) fail('「정식 투자자문업자만」 줄([5] 8)', `${tag} ${JSON.stringify(g.empty)}`);
    if (g.pastN !== `지난 보유 ${PAST.length}곳` || g.pastOpen) fail('지난 보유(접힘 · 수)', `${tag} 「${g.pastN}」 ${g.pastOpen}`);
    await layout(p, tag + ' 답하기 전');
    // 답하기 — 카드마다 셋 가운데 하나(차례로 돌려 고름)
    let k = 0;
    for (const s of SC) {
      const ak = k++ % ASK_N;
      await p.locator(`${SEL} article.hd-card[data-id="${s.hold.id}"] button.hd-opt`).nth(ak).click({timeout: 8000});
      await p.waitForFunction(([sel, id]) => !!document.querySelector(`${sel} article.hd-card[data-id="${id}"] .hd-ans`), [SEL, s.hold.id], {timeout: 10000});
      g = await p.evaluate(READH, SEL);
      const c = cardOf(g, s.hold.id);
      if (c?.ans !== ['살 거야', '잘 모르겠어', '안 살 거야'][ak]) fail('답 표시', `${tag} ${s.key} 「${c?.ans}」`);
      checkDone(c, s, SH_A, tag, ak);
      for (const o of act) if (o.id !== s.hold.id && !SC.slice(0, k).some(x => x.hold.id === o.id)) { const c2 = cardOf(g, o.id); if (c2?.ret != null || c2?.badge) fail('답하지 않은 카드에 수익률 · 색', `${tag} ${o.id}`); }
    }
    if (XH) { // 회사 주식 밖 — 질문 → 까닭(#/x 와 같은 종류 글) · 수익률 없음 · 다섯 가지 없음
      await p.locator(`${SEL} article.hd-card[data-id="${XH.id}"] button.hd-opt`).nth(1).click({timeout: 8000});
      await p.waitForFunction(([sel, id]) => !!document.querySelector(`${sel} article.hd-card[data-id="${id}"] .hd-ans`), [SEL, XH.id], {timeout: 10000});
      const c = cardOf(await p.evaluate(READH, SEL), XH.id);
      if (c?.badge?.c !== 'q' || c.badge.t !== '? 점검 못 함' || c.items.length || !c.lines.includes(`${XLABEL} — 회사 주식이 아니라 조건 다섯을 셀 수 없어요.`) || c.link !== '#/x/' + encodeURIComponent(XH.code) || /[+−]\d+(\.\d)?%/.test(c.ret ?? c.text)) fail('회사 주식 밖 — 점검 못 하는 까닭([5] 9)', `${tag} ${JSON.stringify(c).slice(0, 300)}`);
      else bump('회사 주식 밖 맞댐');
    }
    await layout(p, tag + ' 모두 답함');
    // 기억 — 오늘 답 · 참은 날 · 첫 문 색(g0) · 지난 보유 그대로
    const st = await store(p);
    if (!Array.isArray(st) || st.length !== HOLDS.length) fail('기억 줄 수(지우지 않음)', `${tag} ${Array.isArray(st) ? st.length : st} ≠ ${HOLDS.length}`);
    else {
      for (const s of SC) {
        const o = st.find(x => x.id === s.hold.id), red = s.c.includes('r');
        if (o?.ask?.d !== TODAY) fail('오늘 답 기억', `${tag} ${s.key} ${JSON.stringify(o?.ask)}`);
        if (red && o?.red?.from !== (s.endure === 3 ? addD(TODAY, -3) : TODAY)) fail('참은 날 시작(🔴로 처음 본 날)', `${tag} ${s.key} ${JSON.stringify(o?.red)}`);
        if (!red && o?.red) fail('🔴 아니면 참은 날을 풂', `${tag} ${s.key} ${JSON.stringify(o?.red)}`);
        if (!s.hold.g0 && !(o?.g0?.d === GATE.asOf && eq(o.g0.v, s.X.gv.slice(0, 6)))) fail('첫 문 색 기억(g0)', `${tag} ${s.key} ${JSON.stringify(o?.g0)}`);
      }
      for (const x of PAST) { const o = st.find(y => y.id === x.id); if (!o || !eq(o.sold ?? null, x.sold ?? null) || !eq(o.wrong ?? null, x.wrong ?? null)) fail('지난 보유 그대로', `${tag} ${x.id}`); }
    }
    g = await p.evaluate(READH, SEL);
    for (const s of SC.filter(x => x.c.includes('r'))) {
      const c = cardOf(g, s.hold.id), n = s.endure === 3 ? 3 : 0;
      const want = n ? `참은 날 ${n}일 · 🔴로 처음 본 날 ${md(addD(TODAY, -3))}` : '참은 날 0일 · 오늘 처음 🔴로 봤어';
      if (c?.endure !== want) fail('참은 날 글([5] 10)', `${tag} ${s.key} 「${c?.endure}」 ≠ 「${want}」`);
    }
    // 「나타났어」 — 누르면 🟡 · 다시 누르면 그대로 · 기억
    const s1 = SC.find(x => x.key === '문1지남');
    if (s1) {
      const tog = p.locator(`${SEL} article.hd-card[data-id="${s1.hold.id}"] button.hd-tog`);
      await tog.click(); await p.waitForFunction(([sel, id]) => document.querySelector(`${sel} article.hd-card[data-id="${id}"] .hd-tog`)?.getAttribute('aria-pressed') === 'true', [SEL, s1.hold.id], {timeout: 8000});
      let c = cardOf(await p.evaluate(READH, SEL), s1.hold.id), o = (await store(p)).find(x => x.id === s1.hold.id);
      if (c.items[2].c !== 'y' || c.badge?.t !== '🟡 하나 흔들림 · 망할 이유' || !o?.doom) fail('③ 「나타났어」 누름 → 🟡 · 기억', `${tag} ${JSON.stringify(c.badge)} ${JSON.stringify(o?.doom)}`);
      await p.locator(`${SEL} article.hd-card[data-id="${s1.hold.id}"] button.hd-tog`).click(); await p.waitForFunction(([sel, id]) => document.querySelector(`${sel} article.hd-card[data-id="${id}"] .hd-tog`)?.getAttribute('aria-pressed') === 'false', [SEL, s1.hold.id], {timeout: 8000});
      c = cardOf(await p.evaluate(READH, SEL), s1.hold.id); o = (await store(p)).find(x => x.id === s1.hold.id);
      if (c.badge?.t !== '🟢 그대로' || o?.doom) fail('③ 다시 누르면 풂', `${tag} ${JSON.stringify(c.badge)}`);
      bump('누른 길');
    }
    // 다시 열기 — 오늘 답 그대로(질문 없이 점검) · 참은 날 그대로
    await p.reload({waitUntil: 'domcontentloaded'}); await p.waitForFunction(s => !!document.querySelector(s + ' article.hd-card'), SEL, {timeout: 30000});
    g = await p.evaluate(READH, SEL);
    for (const s of SC) checkDone(cardOf(g, s.hold.id), s, SH_A, tag + ' 다시 엶', null);
    // 지난 보유 펼치기 — 판 것(산 값 → 판 값 · 수익률) · 잘못 적은 것
    await p.locator(`${SEL} details.hd-past > summary`).click(); g = await p.evaluate(READH, SEL);
    const sold = PAST[0], wantSold = `산 값 ${won(sold.buy)} → 판 값 ${won(sold.sold.price)} ${pct((sold.sold.price / sold.buy - 1) * 100)}`;
    if (!g.pastRows.some(t => t.includes(wantSold) && t.includes(`${md(sold.sold.day)}에 팖`)) || !g.pastRows.some(t => t.includes('잘못 적어 뺐어'))) fail('지난 보유 줄', `${tag} ${JSON.stringify(g.pastRows)}`);
    await layout(p, tag + ' 지난 보유 펼침');
    errsOf(p, tag);
  } catch (e) { fail('판 멈춤', `${tag}: ${e.message.split('\n')[0]}`); }
  await p.context().close();
}

/* 판 A 넓은 폭 — 오늘 답을 미리 심음(바로 점검) · 390×844 */
{
  const tag = '판A 390×844', holds = HOLDS.map(o => (o.sold || o.wrong ? o : {...o, ask: {d: TODAY, a: 2}})), p = await newPage(390, 844, {holds, recs: RECS});
  try {
    await open(p);
    const g = await p.evaluate(READH, SEL);
    for (const s of SC) checkDone(cardOf(g, s.hold.id), {...s, hold: {...s.hold}}, SH_A, tag, null);
    await layout(p, tag);
    errsOf(p, tag);
  } catch (e) { fail('판 멈춤', `${tag}: ${e.message.split('\n')[0]}`); }
  await p.context().close();
}

/* ④ 몫 — 값을 정해 바꿔 넣음(co/<번호>.json 의 오늘 값 = 10,000원) */
const fixedPrice = codes => codes.map(c => [`**/atlas/data/co/${c}.json`, async r => { const res = await r.fetch(); const j = await res.json(); j.c = {...j.c, price: 10000, priceDate: MKT.asOf}; await r.fulfill({status: 200, contentType: 'application/json', body: JSON.stringify(j)}); }]);
const freeCodes = (() => { const out = [], seen = new Set(); for (const c of CODES) { const i = MKT.companies[c].i; if (used.has(c) || seen.has(i)) continue; seen.add(i); out.push(c); if (out.length >= 3) break; } return out; })();
for (const [nm, qty, wantBig] of [['80 : 20', [80, 20], [true, false]], ['셋이 똑같이', [10, 10, 10], [false, false, false]]]) {
  const codes = freeCodes.slice(0, qty.length), tag = `몫 ${nm}`;
  const holds = codes.map((c, i) => ({id: 'hd-몫' + i, code: c, name: MKT.companies[c].n, buy: 9000, qty: qty[i], day: addD(TODAY, -10), at: new Date().toISOString(), ask: {d: TODAY, a: 0}}));
  const p = await newPage(qty.length === 2 ? 390 : 360, qty.length === 2 ? 844 : 640, {holds, routes: fixedPrice(codes)});
  try {
    await open(p);
    const g = await p.evaluate(READH, SEL), tot = qty.reduce((s, x) => s + x, 0);
    holds.forEach((o, i) => {
      const c = cardOf(g, o.id), sh = one(qty[i] / tot * 100) + '%', i5 = c?.items?.[4];
      const want = `이 종목 몫 ${sh} · ${MKT.companies[o.code].i} 업종 몫 ${sh}.` + (wantBig[i] ? ' 셋에 하나보다 커.' : '');
      if (!i5 || i5.c !== (wantBig[i] ? 'y' : 'g') || !eq(i5.lines, [want])) fail('⑤ 몫 · 셋에 하나', `${tag} ${o.code} ${JSON.stringify(i5)} ≠ 「${want}」`);
    });
    const rows = g.bars[0] ?? [];
    if (!eq(rows.map(r => r[2]), [...wantBig].sort((a, b) => b - a)) || rows.length !== qty.length) fail('몫 그림 금빛(셋에 하나 넘음)', `${tag} ${JSON.stringify(rows)}`);
    await layout(p, tag); errsOf(p, tag); bump('몫 판');
  } catch (e) { fail('판 멈춤', `${tag}: ${e.message.split('\n')[0]}`); }
  await p.context().close();
}

/* 값이 빈 문 — 먼저 안 뺀 곳의 문 하나가 null(셀 수 없음) → 「?」 · 빨강 아님 · 흔들림 아님 · 🟡 셀 수 없음 · 그 문 이름을 밝힘(gates.json 을 바꿔 넣음) */
{
  const X = await pick(g1p), tag = '값이 빈 문 390×844';
  if (!X) fail('값이 빈 문 판을 꾸미지 못함', tag);
  else {
    const gv = [...X.gv]; gv[3] = null; const GX = {...GATE, co: {...GATE.co, [X.code]: gv}}, s = {key: '값이빈문', X: {...X, gv}, rec: recOf(X, 0), c: ['g', 'u', 'g', 'g', 'g']};
    s.hold = {id: 'hd-빈문', code: X.code, name: X.name, buy: Math.round(X.p * 0.95), qty: 1, day: addD(TODAY, -20), at: new Date().toISOString(), ask: {d: TODAY, a: 0}};
    const pad = XH ? [0, 1, 2].map(i => ({...XH, id: 'hd-채움' + i, buy: X.p, qty: 1})) : []; // 회사 주식 밖 셋으로 채움 — 이 회사 몫 25%(⑤ 그대로 · 🟡 는 빈 문 하나 때문)
    if (!pad.length) s.c[4] = 'y';
    const holds = [s.hold, ...pad];
    const p = await newPage(390, 844, {holds, recs: [s.rec], routes: [['**/next/data/gates.json', r => r.fulfill({status: 200, contentType: 'application/json', body: JSON.stringify(GX)})]]});
    try {
      await open(p);
      const g = await p.evaluate(READH, SEL), c = cardOf(g, s.hold.id);
      checkDone(c, s, sharesOf(holds), tag, null);
      if (pad.length && c?.badge?.t !== '🟡 셀 수 없음 · 문 색') fail('다섯 문 가운데 빈 문 하나 = 🟡 셀 수 없음(흔들림 아님)', `${tag} ${JSON.stringify(c?.badge)}`);
      if (c?.items?.[1]?.gates?.[2]?.[1] !== '?' || c?.badge?.t?.includes('흔들림 · 문 색')) fail('값이 빈 문 = 「?」(못 지남 · 흔들림 아님)', `${tag} ${JSON.stringify(c?.items?.[1])} ${JSON.stringify(c?.badge)}`);
      await layout(p, tag); errsOf(p, tag); bump('자료 바꾼 길');
    } catch (e) { fail('바꾼 길 멈춤', `${tag}: ${e.message.split('\n')[0]}`); }
    await p.context().close();
  }
}

/* 문 센 날이 사이트 자료보다 앞섬 — gates.json asOf 를 사흘 앞당겨 넣음 → ② 첫 줄 「{센 날} 종가로 센 색이에요.」 · 금빛 「? 사이트 자료는 …」 · ① 「{센 날} 자료로도」 */
{
  const X = SC.find(x => x.key === '문1지남')?.X, tag = '문 센 날이 앞섬 360×640', OLD = addD(GATE.asOf, -3);
  if (!X) fail('문 센 날 판을 꾸미지 못함', tag);
  else {
    const hold = {id: 'hd-앞섬', code: X.code, name: X.name, buy: Math.round(X.p * 0.95), qty: 1, day: addD(TODAY, -20), at: new Date().toISOString(), ask: {d: TODAY, a: 0}};
    const p = await newPage(360, 640, {holds: [hold], recs: [recOf(X, 0)], routes: [['**/next/data/gates.json', r => r.fulfill({status: 200, contentType: 'application/json', body: JSON.stringify({...GATE, asOf: OLD})})]]});
    try {
      await open(p);
      const c = cardOf(await p.evaluate(READH, SEL), hold.id), gold = await p.evaluate(([sel, id]) => [...document.querySelectorAll(`${sel} article.hd-card[data-id="${id}"] .hd-it .hd-line`)].filter(l => l.textContent.startsWith('? 사이트 자료는')).map(l => !!l.querySelector('b.gd')), [SEL, hold.id]);
      const want = [`${md(OLD)} 종가로 센 색이에요.`, `? 사이트 자료는 ${md(MKT.asOf)}까지라 지금 색과 다를 수 있어요.`];
      if (!eq(c?.items?.[1]?.lines?.slice(0, 2), want) || !eq(gold, [true])) fail('② 센 날 줄 · 금빛 「?」 사이트 자료 줄(문 센 날이 앞설 때)', `${tag} ${JSON.stringify(c?.items?.[1]?.lines)} ${JSON.stringify(gold)}`);
      if (!c?.items?.[0]?.lines?.includes(`「${Q3[0]}」 — ${md(OLD)} 자료로도 문 1(이익 늘었나)을 지나.`)) fail('① 문 1 날짜(문 센 날)', `${tag} ${JSON.stringify(c?.items?.[0]?.lines)}`);
      await layout(p, tag); errsOf(p, tag); bump('자료 바꾼 길');
    } catch (e) { fail('바꾼 길 멈춤', `${tag}: ${e.message.split('\n')[0]}`); }
    await p.context().close();
  }
}

/* ⑦ 자료를 바꾼 길 — gates.json 못 받음 · co 파일 하나 못 받음(참은 날은 그대로 둠) */
if (SC.length >= 2) {
  const [sa, sb] = [SC[0], SC[1]], tag = '문 · 값 못 받음 360×640';
  const holds = [{...sa.hold, red: {from: addD(TODAY, -2)}, ask: {d: TODAY, a: 0}}, {...sb.hold, red: null, ask: {d: TODAY, a: 0}}];
  const p = await newPage(360, 640, {holds, recs: [sa.rec, sb.rec].filter(Boolean), allow: ['/next/data/gates.json', `/atlas/data/co/${sa.X.code}.json`],
    routes: [['**/next/data/gates.json', r => r.fulfill({status: 404, contentType: 'text/plain', body: 'no'})], [`**/atlas/data/co/${sa.X.code}.json`, r => r.fulfill({status: 404, contentType: 'text/plain', body: 'no'})]]});
  try {
    await open(p);
    const g = await p.evaluate(READH, SEL), ca = cardOf(g, sa.hold.id), cb = cardOf(g, sb.hold.id);
    if (!ca?.px.startsWith('? 오늘 값을 못 받았어') || !String(ca?.ret).includes('? 오늘 값을 못 받아 수익률을 못 셌어') || ca?.items?.[3]?.c !== 'u' || !ca.items[3].lines.includes('? 오늘 값을 못 받아 거리를 못 셌어.')) fail('co 못 받음 → 「?」', `${tag} ${JSON.stringify(ca).slice(0, 300)}`);
    const pxA = coCache.get(sa.X.code); coCache.set(sa.X.code, null); const SHm = sharesOf(holds); coCache.set(sa.X.code, pxA); // 이 판에서 그 회사 값은 못 받음 → 몫은 산 값으로
    for (const [c, s, c4] of [[ca, sa, 'u'], [cb, sb, 'g']]) {
      if (c?.items?.[1]?.c !== 'u' || !c.items[1].lines.includes('? 오늘 문 색을 아직 못 받았어.') || c.items[1].gates.length) fail('gates 못 받음 → ② 「?」', `${tag} ${JSON.stringify(c?.items?.[1])}`);
      const want = ['u', 'u', 'g', c4, isBig(SHm.by.get(s.X.code), SHm.tot) || isBig(SHm.ind.get(s.X.ind), SHm.tot) ? 'y' : 'g'];
      if (c?.badge?.c === 'r' || c?.badge?.t !== badgeOf(want, s) || !eq(c?.items?.map(x => x.c), want)) fail('셀 수 없는 것 = 🟡 셀 수 없음(빨강 · 흔들림 아님)', `${tag} ${JSON.stringify(c?.badge)} ${JSON.stringify(c?.items?.map(x => x.c))} ≠ 「${badgeOf(want, s)}」 ${want}`);
      if (c?.items?.[0]?.c !== 'u' || !c.items[0].lines.includes(`「${Q3[0]}」 — ? 문 1(이익 늘었나)을 셀 수 없어.`)) fail('gates 못 받음 → ① 🟡', `${tag} ${JSON.stringify(c?.items?.[0])}`);
      if (c?.items?.[1]?.lines?.some(t => t.includes('종가로 센 색'))) fail('gates 못 받음 → 센 날 줄 없음', `${tag} ${JSON.stringify(c?.items?.[1])}`);
    }
    const st = await store(p);
    if (st.find(x => x.id === sa.hold.id)?.red?.from !== addD(TODAY, -2)) fail('값 · 문을 못 받은 날은 참은 날을 풀지 않음', `${tag} ${JSON.stringify(st.find(x => x.id === sa.hold.id)?.red)}`);
    await layout(p, tag); errsOf(p, tag); bump('자료 바꾼 길');
  } catch (e) { fail('바꾼 길 멈춤', `${tag}: ${e.message.split('\n')[0]}`); }
  await p.context().close();
}

/* 빈 칸 높이 — 보유종목이 없을 때 짧게(제목 · 한 줄 · 적기 단추) · 아래 사장님 편지가 첫 화면 가까이(360×640 · 결과에 남김) */
{
  const tag = '빈 칸 360×640', p = await newPage(360, 640, {holds: [], recs: []});
  try {
    await open(p); await p.waitForTimeout(300);
    EMPTY = await p.evaluate(sel => { const e = document.querySelector(sel), r = e.getBoundingClientRect(), L = document.querySelector('#view .lw'); return {h: Math.round(r.height), top: Math.round(r.top + scrollY), bottom: Math.round(r.bottom + scrollY), letterTop: L ? Math.round(L.getBoundingClientRect().top + scrollY) : null, vh: innerHeight}; }, SEL);
    const g = await p.evaluate(READH, SEL);
    if (g.cards.length || g.bars.length || g.leg || !eq(g.empty, ['아직 적은 보유종목이 없어요.']) || !g.add) fail('빈 칸은 짧게(제목 · 한 줄 · 적기)', `${tag} ${JSON.stringify(g.empty)}`);
    if (EMPTY.h > 260) fail('빈 칸이 김(260px 넘음)', `${tag} ${EMPTY.h}px`);
    await layout(p, tag); errsOf(p, tag); bump('빈 칸 판');
  } catch (e) { fail('빈 칸 판 멈춤', `${tag}: ${e.message.split('\n')[0]}`); }
  await p.context().close();
}

/* ⑤ 적기 · 팔았어 · 잘못 적었어 — 빈 기기에서(390×844) · 기억 못 하는 기계(360×640) */
async function addOne(p, tag, q, wantName, price, qty, day = TODAY) {
  if (!(await p.locator(`${SEL} form.hd-add`).count())) await p.locator(`${SEL} button.hd-add-b`).click();
  await p.locator(`${SEL} input.hd-in-s`).fill(q);
  const hit = p.locator(`${SEL} .hd-hit`).filter({has: p.locator(`span[data-proper]:text-is("${wantName}")`)}).first();
  await hit.waitFor({timeout: 20000}); await hit.click();
  const chosen = await p.locator(`${SEL} .hd-chosen b`).textContent();
  if (chosen !== wantName) fail('고른 종목', `${tag} 「${chosen}」 ≠ ${wantName}`);
  const inputs = p.locator(`${SEL} form.hd-add input.hd-in-n`);
  await inputs.nth(0).fill(price); await inputs.nth(1).fill(qty); await p.locator(`${SEL} form.hd-add input.hd-in-d`).fill(day);
  await p.locator(`${SEL} form.hd-add button.hd-go`).click();
}
const errText = p => p.locator(`${SEL} .hd-err`).first().textContent().catch(() => '');
{
  const tag = '적기 · 팔기 390×844', p = await newPage(390, 844, {holds: [], recs: []});
  try {
    await open(p);
    let g = await p.evaluate(READH, SEL);
    if (g.cards.length || !eq(g.empty, ['아직 적은 보유종목이 없어요.']) || g.leg) fail('빈 칸은 짧게(제목 · 한 줄 · 적기 — 색 풀이 · 긴 줄 없음)', `${tag} ${JSON.stringify(g.empty)} ${g.leg}`);
    await p.locator(`${SEL} button.hd-add-b`).click();
    await p.locator(`${SEL} form.hd-add button.hd-go`).click();
    if ((await errText(p)) !== '종목을 먼저 골라 줘.') fail('틀린 입력 글(종목)', `${tag} 「${await errText(p)}」`);
    await layout(p, tag + ' 적기 칸');
    await addOne(p, tag, '삼성전자', '삼성전자', 'abc', '3');
    if ((await errText(p)) !== '산 값을 숫자로 적어 줘.') fail('틀린 입력 글(산 값)', `${tag} 「${await errText(p)}」`);
    await p.locator(`${SEL} form.hd-add input.hd-in-n`).nth(0).fill('240,000'); await p.locator(`${SEL} form.hd-add input.hd-in-n`).nth(1).fill('');
    await p.locator(`${SEL} form.hd-add button.hd-go`).click();
    if ((await errText(p)) !== '수량을 숫자로 적어 줘.') fail('틀린 입력 글(수량)', `${tag} 「${await errText(p)}」`);
    await p.locator(`${SEL} form.hd-add input.hd-in-n`).nth(1).fill('3'); await p.locator(`${SEL} form.hd-add input.hd-in-d`).fill(addD(TODAY, 1));
    await p.locator(`${SEL} form.hd-add button.hd-go`).click();
    if ((await errText(p)) !== '산 날은 오늘이나 그 전이어야 해.') fail('틀린 입력 글(산 날)', `${tag} 「${await errText(p)}」`);
    await p.locator(`${SEL} form.hd-add input.hd-in-d`).fill(TODAY); await p.locator(`${SEL} form.hd-add button.hd-go`).click();
    await p.waitForFunction(s => document.querySelectorAll(s + ' article.hd-card').length === 1, SEL, {timeout: 15000});
    let st = await store(p), n0 = st?.length ?? 0;
    const o = st?.[0];
    if (!(n0 === 1 && o.code === '005930' && o.buy === 240000 && o.qty === 3 && o.day === TODAY)) fail('적은 것 기억(종목 · 산 값 · 수량 · 산 날)', `${tag} ${JSON.stringify(st)}`);
    g = await p.evaluate(READH, SEL); checkAsk(g.cards[0], {buy: 240000}, tag + ' 새로 적은 것');
    await p.locator(`${SEL} article.hd-card button.hd-opt`).first().click(); await p.waitForSelector(`${SEL} article.hd-card .hd-ret`, {timeout: 10000});
    // 나눠 팖 — 3주 가운데 1주(판 몫은 지난 보유 · 남은 2주는 그대로)
    await p.locator(`${SEL} article.hd-card button.hd-sold`).click();
    const sf = p.locator(`${SEL} article.hd-card form.hd-form`), sIn = sf.locator('input.hd-in-n');
    await sf.locator('input.hd-in-d').fill(TODAY); await sIn.nth(0).fill('250,000'); await sIn.nth(1).fill('5'); await sf.locator('button.hd-go').click();
    if ((await sf.locator('.hd-err').textContent()) !== '판 수량은 0보다 크고 3주 이하여야 해.') fail('틀린 입력 글(판 수량)', `${tag} 「${await sf.locator('.hd-err').textContent()}」`);
    await sIn.nth(1).fill('1'); await sf.locator('button.hd-go').click();
    await p.waitForFunction(s => !!document.querySelector(s + ' details.hd-past'), SEL, {timeout: 10000});
    st = await store(p);
    const live = st.filter(x => !x.sold && !x.wrong), gone = st.filter(x => x.sold);
    if (st.length !== 2 || live.length !== 1 || live[0].qty !== 2 || gone.length !== 1 || gone[0].qty !== 1 || gone[0].sold.price !== 250000 || gone[0].sold.day !== TODAY || gone[0].buy !== 240000) fail('나눠 팖 기억(지우지 않음)', `${tag} ${JSON.stringify(st)}`);
    g = await p.evaluate(READH, SEL);
    if (g.pastN !== '지난 보유 1곳') fail('지난 보유 수', `${tag} 「${g.pastN}」`);
    // 다 팖 — 남은 2주
    await p.locator(`${SEL} article.hd-card button.hd-sold`).click();
    const sf2 = p.locator(`${SEL} article.hd-card form.hd-form`);
    await sf2.locator('input.hd-in-d').fill(TODAY); await sf2.locator('input.hd-in-n').nth(0).fill('230000'); await sf2.locator('input.hd-in-n').nth(1).fill('2'); await sf2.locator('button.hd-go').click();
    await p.waitForFunction(s => !document.querySelector(s + ' article.hd-card'), SEL, {timeout: 10000});
    st = await store(p);
    if (st.length !== 2 || st.some(x => !x.sold)) fail('다 팖 → 지난 보유(줄 수 그대로)', `${tag} ${JSON.stringify(st)}`);
    await p.locator(`${SEL} details.hd-past > summary`).click(); g = await p.evaluate(READH, SEL);
    if (g.pastN !== '지난 보유 2곳' || !g.pastRows.some(t => t.includes(`산 값 240,000원 → 판 값 250,000원 ${pct((250000 / 240000 - 1) * 100)}`)) || !g.pastRows.some(t => t.includes(`산 값 240,000원 → 판 값 230,000원 ${pct((230000 / 240000 - 1) * 100)}`))) fail('지난 보유 줄(판 값 · 수익률)', `${tag} ${JSON.stringify(g.pastRows)}`);
    await layout(p, tag + ' 지난 보유');
    // 잘못 적었어 — 번호로 찾아 적고 「맞아, 옮겨 줘」 → 지난 보유 「잘못 적음」(지우지 않음)
    if (XH) {
      await addOne(p, tag, XH.code, XH.name, '100000', '1');
      await p.waitForFunction(s => document.querySelectorAll(s + ' article.hd-card').length === 1, SEL, {timeout: 15000});
      await p.locator(`${SEL} article.hd-card button.hd-opt`).first().click();
      await p.locator(`${SEL} article.hd-card button.hd-wrong`).click(); await layout(p, tag + ' 잘못 적었어 칸');
      await p.locator(`${SEL} article.hd-card .hd-form button.hd-go`).click();
      await p.waitForFunction(s => !document.querySelector(s + ' article.hd-card'), SEL, {timeout: 10000});
      st = await store(p);
      if (st.length !== 3 || !st.find(x => x.code === XH.code)?.wrong) fail('잘못 적었어 → 지난 보유(지우지 않음)', `${tag} ${JSON.stringify(st)}`);
      g = await p.evaluate(READH, SEL);
      if (g.pastN !== '지난 보유 3곳') fail('지난 보유 수(잘못 적음 포함)', `${tag} 「${g.pastN}」`);
    }
    errsOf(p, tag); bump('적기 길');
  } catch (e) { fail('적기 길 멈춤', `${tag}: ${e.message.split('\n')[0]}`); }
  await p.context().close();
}
{
  const tag = '기억 못 하는 기계 360×640', p = await newPage(360, 640, {store: 'throw'});
  try {
    await open(p);
    let g = await p.evaluate(READH, SEL);
    if (!g.mem?.includes('이 기기는 기억을 못 해요')) fail('기억 못 함 「?」 줄', `${tag} 「${g.mem}」`);
    await addOne(p, tag, '삼성전자', '삼성전자', '240000', '1');
    await p.waitForFunction(s => document.querySelectorAll(s + ' article.hd-card').length === 1, SEL, {timeout: 15000});
    g = await p.evaluate(READH, SEL); checkAsk(g.cards[0], {buy: 240000}, tag + ' 이 화면에만 적힘');
    await layout(p, tag); errsOf(p, tag); bump('자료 바꾼 길');
  } catch (e) { fail('바꾼 길 멈춤', `${tag}: ${e.message.split('\n')[0]}`); }
  await p.context().close();
}

} // ═══ 옛 ① ~ ⑧ 끝 ═══

/* ═══ 2026-10-18 일꾼 S5h(줄 13 · 잣대 accept/S5h.md) — ⑪ 관심 소식 · ⑫ 편지 접기 · ⑬ 바로 가기 · 카카오 · 기록 파일 · 탈퇴 · ⑭ 글씨 · 간격 · 왼쪽 줄 · 낱말 ═══
   기대 값은 사이트 화면 코드를 읽지 않고 자료(surgetr.json · core.json · mkt.json)와 명령문에서 따로 셈 · 카카오는 쪽을 열기 전에 가짜 NX.kakao 를 끼워 넣음(없음 · 꺼짐 · 켜짐 가입 안 함 · 켜짐 가입함) */
const APP_SRC = await fs.readFile(path.join(ROOT, 'site/next/app.js'), 'utf8');
const HELLO = JSON.parse((/const HELLO_MSG = (\[[^\]]*\]);/.exec(APP_SRC) || [, 'null'])[1].replace(/'/g, '"')); // 편지 글 = app.js HELLO_MSG(글자 그대로)
const NEWS_KIND = {mov: ['오늘 가장 많이 움직인 곳', 0], sel: ['뽑힘', 1], re: ['다시 뽑힘', 2], mv: ['옮김', 3], out: ['빠짐', 4]};
const NEWS_BOX = {'1': '10%대로', '2': '20%대로', '3': '30%대로', '4': '40% 이상으로'};
const OLD_WORDS = /다섯 문|갈래|몸값|20거래일|한 회사 한 표|큰 회사는 크게|쉬는 돈/;
const SEEDS = {
  sub: JSON.stringify(['g:semi', 'i:반도체']),
  one: JSON.stringify(['i:반도체']),
};
const NEW_RUN = [11, 12, 13, 14].some(RUN);
let TRJ = null, CORE = null;
if (NEW_RUN) { [TRJ, CORE] = await Promise.all(['/atlas/data/surgetr.json', '/atlas/data/core.json'].map(f => getJ(f).catch(e => { fail('자료', e.message); return null; }))); }
const oddLine = l => { if (!Array.isArray(l) || l.length < 3 || l.some(v => !(v > 0))) return true; for (let i = 1; i < l.length; i++) if (Math.abs(l[i] / l[i - 1] - 1) >= 0.3) return true; const n = l.length; return l[n - 1] === l[n - 2] && l[n - 2] === l[n - 3]; };
const dayPct = l => (Array.isArray(l) && l.length > 1 && l[l.length - 2] > 0 && l[l.length - 1] > 0 ? (l[l.length - 1] / l[l.length - 2] - 1) * 100 : null);
const clsOf = x => (x == null ? 'q' : r1(x) > 0 ? 'up' : r1(x) < 0 ? 'dn' : 'fl');
/** 관심 소식 기대 줄 — 자료에서 따로 셈(keys = 담은 곳 차례 · tr = surgetr.json 또는 null) */
function newsExpect(keys, tr) {
  const chans = [];
  for (const k of keys) {
    const id = k.slice(2); let label, mem;
    if (k[0] === 'g') { const g = CORE.groups.find(x => x.id === id); if (!g) continue; label = '큰 업종 ' + g.name; mem = g.inds.flatMap(n => CORE.industries.find(x => x.name === n)?.members ?? []); }
    else { const i = CORE.industries.find(x => x.name === id); if (!i) continue; label = i.name + ' 업종'; mem = i.members ?? []; }
    chans.push({label, mem: mem.filter(c => MKT.companies[c]), at: chans.length});
  }
  const owner = new Map(); for (const c of chans) for (const code of c.mem) if (!owner.has(code)) owner.set(code, c);
  const rows = [], seen = new Set();
  const add = (d, code, kind, box, ch) => { const key = d + '|' + code + '|' + kind; if (seen.has(key)) return; seen.add(key); rows.push({d, code, kind, box: box in NEWS_BOX ? box : null, label: ch.label, at: ch.at, pct: null}); };
  if (tr) {
    const d0 = new Map(); for (const r of tr.cases) d0.set(r[0] + '|' + r[2], r[3]);
    for (const day of tr.days) {
      for (const code of day.sel ?? []) { const c = owner.get(code); if (c) add(day.d, code, 'sel', d0.get(code + '|' + day.d), c); }
      for (const e of day.re ?? []) { const c = owner.get(e[0]); if (c) add(day.d, e[0], 're', e[1], c); }
      for (const e of day.mv ?? []) { const c = owner.get(e[0]); if (c) add(day.d, e[0], 'mv', e[1], c); }
      for (const code of day.out ?? []) { const c = owner.get(code); if (c) add(day.d, code, 'out', null, c); }
    }
  }
  for (const c of chans) { // 오늘 가장 많이 움직인 곳 — 담은 곳마다 한 줄(값이 이상한 회사는 뺌 · 같으면 앞 회사)
    const cand = c.mem.map(code => ({code, v: oddLine(MKT.companies[code].l) ? null : dayPct(MKT.companies[code].l)})).filter(x => x.v != null);
    let top = null; for (const x of cand) if (!top || Math.abs(x.v) > Math.abs(top.v)) top = x;
    if (top) rows.push({d: MKT.asOf, code: top.code, kind: 'mov', box: null, label: c.label, at: c.at, pct: top.v});
  }
  rows.sort((a, b) => (a.d < b.d ? 1 : a.d > b.d ? -1 : 0) || NEWS_KIND[a.kind][1] - NEWS_KIND[b.kind][1] || a.at - b.at || MKT.companies[a.code].n.localeCompare(MKT.companies[b.code].n, 'ko') || (a.code < b.code ? -1 : 1));
  return rows;
}
const rowKey = r => [r.d, r.code, r.kind, r.box ?? '', r.label].join('|');
const rowSub = r => [md(r.d), r.label, ...(r.kind === 'mov' ? [NEWS_KIND.mov[0]] : []), ...(r.box ? [NEWS_BOX[r.box]] : [])].join(' · ');
/** 가짜 카카오를 끼운 새 칸(쪽을 열기 전) — kk = null(없음) · {on, member, wdFail, exportFalse} */
async function newPage2(width, height, {seed = {}, kk = null, routes = [], allow = []} = {}) {
  const ctx = await browser.newContext({viewport: {width, height}, deviceScaleFactor: 1, hasTouch: true, locale: 'ko-KR', timezoneId: 'Asia/Seoul', acceptDownloads: true});
  await ctx.addInitScript(([sd, mode]) => {
    try { if (!sessionStorage.getItem('s5h-seeded')) { for (const [k, v] of Object.entries(sd)) localStorage.setItem(k, v); sessionStorage.setItem('s5h-seeded', '1'); } } catch { /* 막힘 */ }
    const st = {member: !!mode?.member, calls: {withdraw: 0, exportFile: 0}}; window.__fk = st;
    if (!mode) return;
    const k = {on: mode.on !== false, member: () => st.member, async withdraw() { st.calls.withdraw++; await new Promise(r => setTimeout(r, 40)); if (mode.wdFail) return false; st.member = false; dispatchEvent(new CustomEvent('nx:kakao', {detail: {on: k.on, member: false}})); return true; }, exportFile() { st.calls.exportFile++; return mode.exportFalse ? false : {ok: true, name: 'x.json', bytes: 1, keys: 4}; }};
    let nx; Object.defineProperty(window, 'NX', {configurable: true, get: () => nx, set(v) { nx = v; try { Object.defineProperty(v, 'kakao', {configurable: true, get: () => k, set() { /* 앱이 진짜를 붙여도 가짜 그대로 */ }}); } catch { /* 못 붙임 */ } }});
  }, [seed, kk]);
  await dataRoutes(ctx, GATES_TXT); // --gates-file · --gdr-file 을 줬을 때만(고친 사본은 이 판에 안 씀)
  for (const [pat, fn] of routes) await ctx.route(pat, fn);
  const p = await ctx.newPage(); p._errs = [];
  const allowed = u => allow.some(a => String(u || '').includes(a));
  p.on('pageerror', e => p._errs.push('pageerror ' + e.message));
  p.on('console', m => { if (m.type() !== 'error') return; const u = m.location()?.url; if (/Failed to load resource/.test(m.text()) && allowed(u)) return; p._errs.push(m.text() + (u ? ' @ ' + u : '')); });
  p.on('response', r => { if (r.status() >= 400 && r.url().startsWith(base) && !allowed(r.url())) p._errs.push(r.status() + ' ' + r.url()); });
  return p;
}
async function openHash(p, hash, sel) {
  await p.goto(base + NEXT + hash, {waitUntil: 'domcontentloaded'});
  await p.waitForFunction(q => !document.querySelector('#view .boot') && !!document.querySelector(q), sel, {timeout: 30000});
  await p.waitForTimeout(150);
}
/** 영어 칸 — ?lang=en · 사전 = en-src.json 그대로(통합 전에도 add.mjs 로 넣은 줄이 보임 · quick.mjs 와 같음) */
const EN_BODY = await (async () => { try { const S = JSON.parse(await fs.readFile(path.join(ROOT, 'scripts/atlas11/next/i18n/en-src.json'), 'utf8')); return JSON.stringify({schema: 'atlas-new-i18n-1', lang: 'en', note: 'check_hold — en-src.json 그대로', entities: S.entities, templates: S.templates}); } catch { return null; } })();
const EN_ROUTE = [[/\/next\/i18n\/en\.json(\?|$)/, r => r.fulfill({status: 200, contentType: 'application/json; charset=utf-8', body: EN_BODY})]];
const NEXT_EN = NEXT + (NEXT.includes('?') ? '&' : '?') + 'lang=en';
async function openEn(p, hash, sel) {
  await p.goto(base + NEXT_EN + hash, {waitUntil: 'domcontentloaded'});
  await p.waitForFunction(q => !document.querySelector('#view .boot') && !!document.querySelector(q), sel, {timeout: 30000});
  await p.waitForTimeout(500);
}
const HAN = /[가-힣]/;
const missingEn = p => p.evaluate(() => { try { return window.__atlasI18n?.missing?.() ?? null; } catch { return null; } });
/** 모양(내 화면용) — LAYOUT 과 같은 잣대 · 편지(S7l 몫)는 칸 밖 · 글 크기에서 뺌 */
const LAYOUT2 = sel => {
  const vw = document.documentElement.clientWidth, root = document.querySelector(sel);
  const out = {sw: document.documentElement.scrollWidth, vw, wide: [], small: [], tiny: [], canvas: 0, text: '', attrs: [], missing: !root};
  if (!root) return out;
  const desc = e => e.tagName.toLowerCase() + (typeof e.className === 'string' && e.className.trim() ? '.' + e.className.trim().split(/\s+/).join('.') : '') + ' 「' + (e.textContent || '').trim().slice(0, 24) + '」';
  for (const e of [root, ...root.querySelectorAll('*')]) {
    if (e.ownerSVGElement || e.closest('details:not([open]) > :not(summary)')) continue;
    const r = e.getBoundingClientRect(); if (r.width < 2 && r.height < 2) continue;
    const inLetter = !!e.closest('a.m4-letter') && !e.matches('a.m4-letter');
    if (!inLetter && (r.right > vw + 1 || r.left < -1)) out.wide.push(desc(e) + ' ' + Math.round(r.left) + '~' + Math.round(r.right));
    const cs = getComputedStyle(e);
    if (cs.visibility !== 'hidden' && [...e.childNodes].some(n => n.nodeType === 3 && n.textContent.trim()) && parseFloat(cs.fontSize) < 16.95) out.tiny.push(desc(e) + ' ' + cs.fontSize);
  }
  for (const e of root.querySelectorAll('a[href], button, input, select, textarea, summary, [role="button"]')) { const r = e.getBoundingClientRect(); if (!r.width || !r.height || getComputedStyle(e).visibility === 'hidden') continue; if (r.height < 43.5 || r.width < 43.5) out.small.push(desc(e) + ' ' + Math.round(r.width) + '×' + Math.round(r.height)); }
  out.canvas = root.querySelectorAll('canvas').length;
  const c = root.cloneNode(true); c.querySelectorAll('[data-proper], [lang="ko"]').forEach(x => x.remove()); out.text = c.textContent;
  for (const e of [c, ...c.querySelectorAll('*')]) for (const a of ['aria-label', 'title', 'alt', 'placeholder']) { const v = e.getAttribute?.(a); if (v) out.attrs.push(v); }
  return out;
};
async function layout2(p, tag, sel = '#view') {
  const s = await p.evaluate(LAYOUT2, sel); bump('모양 잰 화면');
  if (s.missing) { fail('칸 없음', tag); return s; }
  if (s.sw > s.vw) fail('옆으로 넘침', `${tag}: ${s.sw} > ${s.vw}`);
  for (const x of s.wide.slice(0, 3)) fail('칸 밖으로 나감', `${tag}: ${x}`);
  for (const x of s.small.slice(0, 3)) fail('누르는 자리 44px 밑', `${tag}: ${x}`);
  for (const x of s.tiny.slice(0, 3)) fail('글 17px 밑', `${tag}: ${x}`);
  if (s.canvas) fail('캔버스(입체 없음 규칙 50)', tag);
  for (const b of screenHits(s.text + '\n' + s.attrs.join('\n'))) fail('쓰지 않을 말(words.js screenHits)', `${tag} 「${b}」`);
  return s;
}

/* ⑪ 관심 소식 — 두 폭 · 큰 업종 + 업종(수백 줄) · 작은 업종 · 자료 못 받음 · 담은 곳 없음 */
if (RUN(11)) {
  const READN = () => {
    const s = document.querySelector('#view section.sb'); if (!s) return null;
    const row = a => ({href: a.getAttribute('href'), kind: a.getAttribute('data-kind'), d: a.getAttribute('data-d'), name: a.querySelector('.sb-nm')?.textContent ?? '', right: a.querySelector('.sb-k, .sb-p')?.textContent ?? '', rcls: a.querySelector('.sb-p')?.className ?? '', sub: a.querySelector('.sb-s')?.textContent ?? ''});
    const det = s.querySelector('details.sb-rest');
    return {head: s.querySelector('h2')?.textContent ?? '', notes: [...s.querySelectorAll(':scope > p.note')].map(x => x.textContent), rows: [...s.querySelectorAll('a.sb-n')].map(row), shown: [...s.querySelectorAll(':scope > .sb-list > a.sb-n, :scope > .sb-list > [data-kkrow] > a.sb-n')].length, /* 줄 = 고리 · 카톡 단추와 함께 감싼 줄(kkWrap · data-kkrow) 안의 고리도 셈(일꾼 KI) */ rest: det?.querySelector('summary')?.textContent ?? null, restOpen: !!det?.open, h2s: [...document.querySelectorAll('#view h2.sec')].map(x => x.textContent), labelled: s.getAttribute('aria-labelledby')};
  };
  const run = async (tag, w, h, keys, {tr = true, routes = [], allow = []} = {}) => {
    const p = await newPage2(w, h, {seed: {'atlas:new:sub': JSON.stringify(keys)}, routes, allow});
    try {
      await openHash(p, '#/sub', '#view h1.h'); await p.waitForTimeout(250);
      const exp = newsExpect(keys, tr ? TRJ : null), g = await p.evaluate(READN);
      if (!g) { fail('소식 칸 없음', tag); await p.context().close(); return; }
      const SHOW = 4;
      if (g.head !== '소식' || g.labelled !== 'sb-h') fail('소식 칸 제목', `${tag} 「${g.head}」 ${g.labelled}`);
      const noteWant = tr ? `급등 달력의 뽑힘 · 옮김 · 빠짐이에요. ${md(TRJ.asOf)} 기록까지 셌어요.` : '? 소식 자료를 못 받았어요. 오늘 많이 움직인 곳만 보여요.';
      if (!g.notes.includes(noteWant)) fail('소식 안내 글(자료 있음 · 없음)', `${tag} ${JSON.stringify(g.notes)} ∌ 「${noteWant}」`);
      if (!tr && exp.some(r => r.kind !== 'mov')) fail('(검사 틀림) 자료 없는 판 기대에 뽑힘 줄', tag);
      if (exp.length > SHOW) {
        if (g.shown !== SHOW || g.rows.length !== SHOW || g.rest !== `나머지 ${exp.length - SHOW}줄 보기` || g.restOpen) fail('처음 네 줄 · 「나머지 n줄 보기」(접힘 · n = 따로 센 수)', `${tag} 보임 ${g.shown} · 「${g.rest}」 · 따로 셈 ${exp.length}`);
        await p.locator('#view section.sb details.sb-rest > summary').click();
        await p.waitForFunction(n => document.querySelectorAll('#view section.sb a.sb-n').length === n, exp.length, {timeout: 8000}).catch(() => {});
      } else if (g.rest != null || g.rows.length !== exp.length) fail('줄이 네 줄 이하면 접는 칸 없음', `${tag} ${g.rows.length} · ${g.rest} · 따로 셈 ${exp.length}`);
      const all = await p.evaluate(READN);
      if (all.rows.length !== exp.length) fail('줄 수 = 자료에서 따로 센 수', `${tag} 화면 ${all.rows.length} ≠ 따로 셈 ${exp.length}`);
      // 날짜 차례 — 새 것 먼저 · 같은 날은 오늘 가장 많이 움직인 곳 → 뽑힘 → 다시 뽑힘 → 옮김 → 빠짐
      let bad = 0, badK = 0; for (let i = 1; i < all.rows.length; i++) { const a = all.rows[i - 1], b = all.rows[i]; if (b.d > a.d) bad++; else if (b.d === a.d && NEWS_KIND[b.kind][1] < NEWS_KIND[a.kind][1]) badK++; }
      if (bad) fail('날짜 차례 어긋남(새 것 먼저)', `${tag} ${bad}곳`); if (badK) fail('같은 날 종류 차례 어긋남', `${tag} ${badK}곳`);
      bump('소식 날짜 차례 맞댄 줄', all.rows.length);
      // 줄 하나하나 = 따로 센 줄(날 · 회사 · 종류 · 칸 · 담은 곳) — 같은 묶음 · 같은 차례
      const gotKeys = all.rows.map(r => [r.d, r.href.replace('#/w/', ''), r.kind, ...(/\d+%/.test(r.sub) ? [Object.entries(NEWS_BOX).find(([, t]) => r.sub.endsWith(t))?.[0] ?? ''] : ['']), (r.sub.split(' · ')[1] ?? '')].join('|'));
      const wantKeys = exp.map(r => [r.d, r.code, r.kind, r.box ?? '', r.label].join('|'));
      const cnt = a => { const m = new Map(); for (const x of a) m.set(x, (m.get(x) ?? 0) + 1); return m; }, cg = cnt(gotKeys), cw = cnt(wantKeys);
      let diff = 0, ex = []; for (const [k, v] of cw) if (cg.get(k) !== v) { diff++; if (ex.length < 3) ex.push('없음/다름 ' + k); } for (const [k, v] of cg) if (cw.get(k) !== v) { diff++; if (ex.length < 6) ex.push('남음 ' + k); }
      if (diff) fail('줄 내용(날 · 회사 · 종류 · 칸 · 담은 곳)이 따로 센 것과 다름', `${tag} ${diff}건 ${ex.join(' / ')}`);
      // 종류 · 숫자 · 글 · 색 · 고리 — 줄마다(앞 40줄 + 마지막 20줄 + 종류마다 처음 줄)
      const byKey = new Map(exp.map(r => [rowKey(r), r])); let nTxt = 0;
      for (const r of all.rows) {
        const e = byKey.get([r.d, r.href.replace('#/w/', ''), r.kind, /\d+%/.test(r.sub) ? (Object.entries(NEWS_BOX).find(([, t]) => r.sub.endsWith(t))?.[0] ?? '') : '', r.sub.split(' · ')[1] ?? ''].join('|')); if (!e) continue;
        const want = e.kind === 'mov' ? pct(e.pct) : NEWS_KIND[e.kind][0], name = MKT.companies[e.code].n;
        if (r.name !== name || r.right !== want || r.sub !== rowSub(e) || r.href !== '#/w/' + encodeURIComponent(e.code)) { fail('소식 줄 글(이름 · 종류나 하루 % · 날 · 담은 곳 · 칸)', `${tag} ${JSON.stringify(r)} ≠ ${name} ${want} 「${rowSub(e)}」`); break; }
        if (e.kind === 'mov' && !(r.rcls.split(/\s+/).includes(clsOf(e.pct)))) { fail('하루 % 색(빨강 오름 · 파랑 내림)', `${tag} ${r.name} ${r.right} 「${r.rcls}」`); break; }
        nTxt++;
      }
      bump('소식 줄 글 맞댐', nTxt);
      if (g.h2s.filter(t => t === '소식').length !== 1) fail('소식 칸이 하나가 아님', `${tag} ${JSON.stringify(g.h2s)}`);
      await layout2(p, tag); errsOf(p, tag);
    } catch (e) { fail('소식 길 멈춤', `${tag}: ${e.message.split('\n')[0]}`); }
    await p.context().close(); bump('소식 판');
  };
  await run('소식 큰 업종 + 업종 360×640', 360, 640, ['g:semi', 'i:반도체']);
  await run('소식 큰 업종 + 업종 390×844', 390, 844, ['g:semi', 'i:반도체']);
  // 작은 업종(줄이 네 줄 이하면 접는 칸 없음) — 자료에서 따로 골라 봄
  const small = [...CORE.industries].filter(i => (i.members ?? []).some(c => MKT.companies[c])).map(i => ({name: i.name, n: newsExpect(['i:' + i.name], TRJ).length})).filter(x => x.n >= 1 && x.n <= 4).sort((a, b) => b.n - a.n)[0];
  if (small) await run(`소식 작은 업종(${small.name}) 360×640`, 360, 640, ['i:' + small.name]); else bump('작은 업종 판 없음(자료)');
  await run('소식 자료 못 받음 360×640', 360, 640, ['g:semi', 'i:반도체'], {tr: false, allow: ['surgetr.json'], routes: [['**/atlas/data/surgetr.json', r => r.fulfill({status: 404, contentType: 'text/plain', body: 'no'})]]});
  { // 영어 — 큰 업종 + 업종 · 나머지 줄까지 펼쳐 한국어 0 · 사전에 없는 틀 0(회사 이름은 엔진이 바꾸는 이름이라 뺌)
    const tag = '소식 영어 360×640', p = await newPage2(360, 640, {seed: {'atlas:new:sub': SEEDS.sub}, routes: EN_ROUTE});
    try {
      await openEn(p, '#/sub', '#view section.sb'); await p.locator('#view section.sb details.sb-rest > summary').click(); await p.waitForTimeout(600);
      const t = await p.evaluate(() => { const s = document.querySelector('#view section.sb'); const c = s.cloneNode(true); c.querySelectorAll('.sb-nm, [data-proper]').forEach(x => x.remove()); return {text: c.textContent, n: s.querySelectorAll('a.sb-n').length, rest: s.querySelector('details.sb-rest summary')?.textContent ?? '', note: s.querySelector(':scope > p.note')?.textContent ?? ''}; });
      if (HAN.test(t.text)) fail('영어 소식 칸에 한국어가 남음', `${tag} 「${t.text.match(/.{0,12}[가-힣]+.{0,12}/)?.[0]}」`);
      if (!/^Show \d+ more lines?$/.test(t.rest)) fail('영어 「나머지 n줄 보기」', `${tag} 「${t.rest}」`);
      const miss = await missingEn(p); if (miss == null || miss.length) fail('영어 사전에 없는 틀(소식)', `${tag} ${JSON.stringify(miss)?.slice(0, 200)}`);
      errsOf(p, tag); bump('소식 영어 판');
    } catch (e) { fail('소식 영어 길 멈춤', `${tag}: ${e.message.split('\n')[0]}`); }
    await p.context().close();
  }
  { // 담은 곳 없음 — 소식 칸 0
    const tag = '담은 곳 없음 360×640', p = await newPage2(360, 640, {});
    try { await openHash(p, '#/sub', '#view h1.h'); await p.waitForTimeout(250); const n = await p.evaluate(() => document.querySelectorAll('#view section.sb, #view a.sb-n').length); if (n) fail('담은 곳 없으면 소식 칸 0', `${tag} ${n}`); await layout2(p, tag); errsOf(p, tag); bump('소식 판'); } catch (e) { fail('소식 길 멈춤', `${tag}: ${e.message.split('\n')[0]}`); }
    await p.context().close();
  }
}

/* ⑫ 편지 접기 — 360×640 · 390×844 · 320×568 */
if (RUN(12)) {
  const FOLD = () => {
    const w = document.querySelector('#view .hd-fold'), a = w?.querySelector('a.m4-letter'), b = w?.querySelector('.hd-fold-b'); if (!w || !a || !b) return null;
    const R = e => { if (!e) return null; const r = e.getBoundingClientRect(); return {l: r.left, t: r.top + scrollY, r: r.right, b: r.bottom + scrollY, w: r.width, h: r.height}; };
    const cs = getComputedStyle(a);
    return {fold: R(w), a: R(a), btn: R(b), open: w.getAttribute('data-open'), exp: b.getAttribute('aria-expanded'), ctl: b.getAttribute('aria-controls'), ctlOk: !!document.getElementById(b.getAttribute('aria-controls') || '~'), label: b.querySelector('span')?.textContent ?? '', intro: a.classList.contains('intro'),
      lines: [...a.querySelectorAll('.m4-msg .hml')].map(x => x.textContent), href: a.getAttribute('href'), clipped: a.scrollHeight > a.clientHeight + 1, ov: cs.overflow,
      hpi: document.querySelectorAll('#view .hpi').length, bird: R(a.querySelector('.hpi-bird')), moon: R(a.querySelector('.hpi .m4-bm')), bubbles: [...a.querySelectorAll('.hpi-b')].map(x => ({r: R(x), t: x.textContent, op: +getComputedStyle(x).opacity})), small: R(a.querySelector('.m4-hp')), vh: innerHeight};
  };
  const inside = (r, A, tol = 1.5) => !r || (r.l >= A.l - tol && r.r <= A.r + tol && r.t >= A.t - tol && r.b <= A.b + tol);
  for (const [w, h] of [[360, 640], [390, 844], [320, 568]]) {
    const tag = `편지 접기 ${w}×${h}`, p = await newPage2(w, h, {});
    try {
      await p.goto(base + NEXT + '#/me', {waitUntil: 'domcontentloaded'});
      await p.waitForFunction(() => !!document.querySelector('#view .hd-fold a.m4-letter') && !document.querySelector('#view .boot'), null, {timeout: 30000});
      // 접힌 칸 — 처음 열 때 여는 그림이 칸 안에서 돎(0.4 · 1.4 · 2.6 · 3.6초 — 보드리 · 말풍선 셋 · 달이 모두 칸 안)
      const t0 = Date.now(); let seenB = 0, seenIntro = false;
      for (const at of [400, 1400, 2600, 3600]) {
        await p.waitForTimeout(Math.max(0, at - (Date.now() - t0)));
        const f = await p.evaluate(FOLD); if (!f) { fail('접는 칸 없음', tag); break; }
        if (f.intro) { seenIntro = true; if (f.hpi !== 1) fail('여는 그림은 한 번(.hpi 하나)', `${tag} ${f.hpi}`); if (f.bubbles.length !== 3 || f.bubbles.some(x => x.t !== NEW_NAME + '!')) fail(`말풍선 「${NEW_NAME}!」 셋`, `${tag} ${JSON.stringify(f.bubbles.map(x => x.t))}`);
          for (const [nm, r] of [['새', f.bird], ['말풍선', ...f.bubbles.filter(x => x.op > 0.05).map(x => x.r)]]) if (r && !inside(r, f.a)) fail('여는 그림이 접힌 칸 밖(새 · 말풍선)', `${tag} ${at}ms ${nm} ${JSON.stringify(r)} ⊄ ${JSON.stringify(f.a)}`);
          for (const x of f.bubbles) if (x.op > 0.05 && !inside(x.r, f.a)) fail('여는 그림이 접힌 칸 밖(말풍선)', `${tag} ${at}ms ${JSON.stringify(x.r)} ⊄ ${JSON.stringify(f.a)}`);
          if (f.moon && !(f.moon.l + f.moon.w / 2 >= f.a.l && f.moon.l + f.moon.w / 2 <= f.a.r && f.moon.t + f.moon.h / 2 >= f.a.t && f.moon.t + f.moon.h / 2 <= f.a.b)) fail('여는 달 가운데가 접힌 칸 밖', `${tag} ${at}ms`);
          seenB += f.bubbles.filter(x => x.op > 0.5).length; }
        if (f.fold.h > f.vh / 3 + 0.6) fail('접은 편지 한 덩이(편지 + 펼치기)가 첫 화면 ⅓ 넘음', `${tag} ${at}ms ${f.fold.h.toFixed(1)} > ${(f.vh / 3).toFixed(1)}`);
        if (w === 360 && h === 640 && f.fold.h > 214) fail('접은 편지 한 덩이 ≤ 214px(360×640)', `${tag} ${f.fold.h.toFixed(1)}`);
      }
      if (!seenIntro) fail('처음 열 때 여는 그림이 안 보임', tag); else if (!seenB) fail('말풍선이 한 번도 안 보임', tag); else bump('접힌 칸 안 여는 그림 맞댐');
      await p.waitForFunction(() => !document.querySelector('#view a.m4-letter.intro'), null, {timeout: 14000});
      await p.waitForTimeout(400);
      let f = await p.evaluate(FOLD), fh0 = f.fold.h;
      if (f.open !== 'false' || f.exp !== 'false' || f.label !== '펼치기' || !f.ctlOk) fail('접힘 상태(data-open · aria-expanded · 「펼치기」 · 칸 이름표)', `${tag} ${JSON.stringify({o: f.open, e: f.exp, l: f.label, c: f.ctl, ok: f.ctlOk})}`);
      if (f.btn.h < 44) fail('「펼치기」 높이 44px 밑', `${tag} ${f.btn.h}`);
      if (!f.clipped || f.ov === 'visible') fail('접힌 편지가 잘려 있지 않음', `${tag} ${f.ov} ${f.clipped}`);
      if (!eq(f.lines, HELLO)) fail('편지 글자 = HELLO_MSG 그대로(접어도 글은 그대로)', `${tag} ${JSON.stringify(f.lines).slice(0, 160)}`);
      if (!inside(f.small, f.a)) fail('접힌 칸의 작은 보드리가 칸 밖', `${tag} ${JSON.stringify(f.small)} ⊄ ${JSON.stringify(f.a)}`);
      if (f.hpi) fail('여는 그림이 내려앉은 뒤에도 남음', `${tag} ${f.hpi}`);
      // 접힌 편지를 누르면 펼침(바로 소개 쪽으로 튀지 않음)
      const url0 = p.url(); await p.mouse.click(Math.round((f.a.l + f.a.r) / 2), Math.round(f.a.t + 40)); await p.waitForTimeout(250);
      let g = await p.evaluate(FOLD); if (g.open !== 'true' || p.url() !== url0) fail('접힌 편지를 누르면 펼쳐지고 쪽을 떠나지 않음', `${tag} ${g.open} ${p.url()}`);
      if (g.href !== '/hello.html') fail('펼친 편지 고리', `${tag} ${g.href}`);
      // 펼침 — 높이 = 본디 높이(같은 편지를 감싸개 밖에 꺼내 잰 값) · 단추 이름 「접기」
      const natural = await p.evaluate(() => { const wr = document.querySelector('#view .hd-fold'), lw = wr.firstElementChild, a = lw.querySelector('a.m4-letter'); wr.before(lw); const h = a.getBoundingClientRect().height; wr.prepend(lw); return h; });
      g = await p.evaluate(FOLD);
      if (g.open !== 'true' || g.exp !== 'true' || g.label !== '접기') fail('펼친 상태(data-open · aria-expanded · 「접기」)', `${tag} ${JSON.stringify({o: g.open, e: g.exp, l: g.label})}`);
      if (Math.abs(g.a.h - natural) > 1) fail('펼치면 편지 높이 = 접기 전 본디 높이', `${tag} 펼침 ${g.a.h.toFixed(1)} · 본디 ${natural.toFixed(1)}`);
      if (g.a.h < fh0 * 3) fail('펼친 높이가 접은 높이의 세 배 안 됨(편지가 안 펼쳐짐)', `${tag} ${g.a.h} · ${fh0}`);
      if (!eq(g.lines, HELLO)) fail('펼친 편지 글자 = HELLO_MSG', tag);
      if (w === 360 && h === 640) { COUNTS_FOLD = {folded: +fh0.toFixed(1), unit: +fh0.toFixed(1), btn: +f.btn.h.toFixed(1), open: +g.a.h.toFixed(1), natural: +natural.toFixed(1), before: 1146}; }
      await layout2(p, tag + ' 펼침');
      // 접기 — 다시 접힘
      await p.locator('#view .hd-fold-b').click(); await p.waitForTimeout(250);
      g = await p.evaluate(FOLD); if (g.open !== 'false' || Math.abs(g.fold.h - fh0) > 1) fail('「접기」를 누르면 다시 접힘', `${tag} ${g.open} ${g.fold.h} ≠ ${fh0}`);
      await layout2(p, tag + ' 접음');
      // 두 번째 열면 그림 0 — 앱 안에서 처음으로 갔다가 다시
      await p.evaluate(() => { location.hash = '#/'; }); await p.waitForTimeout(700);
      await p.evaluate(() => { location.hash = '#/me'; });
      await p.waitForFunction(() => !!document.querySelector('#view .hd-fold a.m4-letter'), null, {timeout: 20000}); await p.waitForTimeout(600);
      const again = await p.evaluate(() => ({hpi: document.querySelectorAll('.hpi').length, intro: !!document.querySelector('a.m4-letter.intro')}));
      if (again.hpi || again.intro) fail('두 번째 열면 여는 그림 0', `${tag} ${JSON.stringify(again)}`);
      errsOf(p, tag); bump('편지 접기 판');
    } catch (e) { fail('편지 접기 길 멈춤', `${tag}: ${e.message.split('\n')[0]}`); }
    await p.context().close();
  }
}

/* ⑬ 바로 가기 · 카카오 · 기록 파일 · 탈퇴 — 가짜 NX.kakao 넷(없음 · 꺼짐(member 참인데 on false) · 켜짐 가입 안 함 · 켜짐 가입함) */
if (RUN(13)) {
  const DEVICE = '이 기기에만 남아요. 이름도 열쇠도 받지 않아요.', MEMBER = '카카오로 지켜요.', IPHONE = '아이폰은 7일 동안 안 열면 기록이 지워질 수 있어요.';
  const FOUR = {'atlas:godori-why': JSON.stringify([{at: '2026-10-17T01:00:00.000Z', code: '005930', name: '삼성전자'}]), 'atlas:new:sub': JSON.stringify(['g:semi']), 'atlas:new:later': JSON.stringify(['005930']), 'atlas:godori-hold': JSON.stringify([{id: 'hd-x', code: '005930', name: '삼성전자', buy: 1000, qty: 1, day: TODAY, at: new Date().toISOString()}])};
  const MONEY = {'atlas:godori-money': JSON.stringify({secret: 'S5H-SECRET-DO-NOT-EXPORT'})};
  const SC13 = () => {
    const box = document.querySelector('#view .hd-sc'); if (!box) return null;
    const items = [...box.querySelectorAll('a[href], button')].map(e => ({tag: e.tagName.toLowerCase(), text: e.textContent.trim(), href: e.getAttribute('href'), h: e.getBoundingClientRect().height, cls: e.className}));
    const secs = [...document.querySelectorAll('#view h2.sec')].map(e => e.textContent), h2 = box.previousElementSibling?.textContent ?? '';
    const note = document.querySelector('#view p.hd-keep')?.textContent ?? null, sub = document.querySelector('#view .hd-sub')?.textContent ?? null;
    return {items, h2, secs, note, sub, text: box.textContent, iphone: [...box.querySelectorAll('.hd-sc-n')].map(e => e.textContent), asking: !!box.querySelector('.hd-wd'), q: box.querySelector('.hd-wd-q')?.textContent ?? null, wdBtns: [...box.querySelectorAll('.hd-wd button')].map(e => e.textContent), wdExp: box.querySelector('.hd-sc-wd')?.getAttribute('aria-expanded') ?? null, err: box.querySelector('.hd-err')?.textContent ?? null, page: document.querySelector('#view').textContent, dl: box.querySelector('.hd-sc-dl')?.getBoundingClientRect().height ?? 0, calls: {...window.__fk.calls}, member: window.__fk.member};
  };
  const FORMS = [['없음', null, false], ['꺼짐(on false · member 참)', {on: false, member: true}, false], ['켜짐 · 가입 안 함', {on: true, member: false}, false], ['켜짐 · 가입함', {on: true, member: true}, true]];
  for (const [nm, kk, isMember] of FORMS) {
    const tag = `바로 가기 · 카카오 ${nm} 360×640`, p = await newPage2(360, 640, {seed: {...FOUR, ...MONEY}, kk});
    try {
      await openHash(p, '#/me', '#view .hd-sc'); await p.waitForTimeout(300);
      const s = await p.evaluate(SC13);
      if (s.h2 !== '바로 가기') fail('바로 가기 제목', `${tag} 「${s.h2}」`);
      const want = ['편지 여는 밤›', '기록 파일로 받기↓', ...(isMember ? ['탈퇴›'] : [])];
      if (!eq(s.items.map(x => x.text), want)) fail('바로 가기 줄 = 편지 여는 밤 · 기록 파일로 받기 · (가입한 사람만) 탈퇴', `${tag} ${JSON.stringify(s.items.map(x => x.text))} ≠ ${JSON.stringify(want)}`);
      const links = s.items.filter(x => x.tag === 'a'); if (links.length !== 1 || links[0].href !== '/letter.html') fail('바로 가기 고리는 편지 여는 밤 하나(그 밖 고리 0 · 오늘 시장 · 급등 · 달력 0)', `${tag} ${JSON.stringify(links)}`);
      if (/#\/(today|surge|cal|cond|talk|up|time|info|gdr)/.test(s.items.map(x => x.href ?? '').join(' '))) fail('바로 가기에 옛 고리가 남음', tag);
      for (const x of s.items) if (x.h < 43.5) fail('바로 가기 누르는 자리 44px 밑', `${tag} ${x.text} ${x.h}`);
      if (!eq(s.iphone, [IPHONE])) fail('아이폰 7일 한 줄', `${tag} ${JSON.stringify(s.iphone)}`);
      if (s.items.some(x => /지우|삭제|delete|remove/i.test(x.text))) fail('지우는 단추 0', `${tag} ${JSON.stringify(s.items.map(x => x.text))}`);
      // [4] 4 지킴 글 — 가입 안 함 = 옛 문장 그대로 · 가입함 = 「카카오로 지켜요.」 · 옛 문장 0
      if (isMember) { if (s.note !== MEMBER || s.page.includes('이름도 열쇠도 받지 않아요') || !String(s.sub).startsWith(MEMBER)) fail('가입함 → 「카카오로 지켜요.」 · 옛 문장 0', `${tag} 「${s.note}」 「${s.sub}」 옛문장 ${s.page.includes('이름도 열쇠도')}`); }
      else if (s.note !== DEVICE || String(s.sub) !== '이 기기에만 남아요. 판 것도 지우지 않아요.' || s.page.includes('카카오로 지켜요')) fail('가입 안 함 → 「이 기기에만 남아요. 이름도 열쇠도 받지 않아요.」 그대로 · 「카카오로 지켜요.」 0', `${tag} 「${s.note}」 「${s.sub}」`);
      // [4] 5 기록 파일 — 누르면 파일 하나 · 열쇠 넷 · 내 돈 칸 0 · 망 요청 0
      const reqs = []; p.on('request', r => { if (/^https?:/.test(r.url())) reqs.push(r.url()); });
      const before = await p.evaluate(() => Object.keys(localStorage).sort().map(k => k + '=' + localStorage.getItem(k)).join('\n'));
      const KEYSNAP = await p.evaluate(() => Object.fromEntries(['atlas:godori-why', 'atlas:new:sub', 'atlas:new:later', 'atlas:godori-hold'].map(k => [k, localStorage.getItem(k)]))); // 누르기 바로 전 이 기기 기록(쪽이 g0 같은 줄을 더 적을 수 있어 심은 값이 아니라 이 값과 맞댐)
      const useFake = !!kk && !kk.exportFalse; // 카카오 쪽 exportFile 이 있으면(꺼져 있어도 — 기록 파일은 늘 됨) 그것 · 없거나 false 면 여기서 만듦
      let dl = null; const dp = p.waitForEvent('download', {timeout: 6000}).then(d => { dl = d; }).catch(() => {});
      const nReq0 = reqs.length; await p.locator('#view .hd-sc-dl').click();
      await Promise.race([dp, p.waitForTimeout(1500)]); await p.waitForTimeout(500);
      const calls = (await p.evaluate(SC13)).calls;
      if (useFake) { if (calls.exportFile !== 1 || dl) fail('카카오 쪽 exportFile 이 있으면 그것 한 번(여기서 또 만들지 않음)', `${tag} 부름 ${calls.exportFile} · 내려받기 ${!!dl}`); else bump('기록 파일 카카오 쪽 한 번'); }
      else {
        if (!dl) fail('기록 파일 내려받기가 안 일어남(여기서 만듦)', `${tag} 부름 ${calls.exportFile}`);
        else {
          const fp = await dl.path(), txt = await fs.readFile(fp, 'utf8'), name = dl.suggestedFilename();
          let J = null; try { J = JSON.parse(txt); } catch { /* 아래서 */ }
          const want = Object.keys(FOUR).sort();
          if (!J || !eq(Object.keys(J.keys ?? {}).sort(), want)) fail('기록 파일 = JSON 하나 · 열쇠 넷 그대로', `${tag} ${J ? JSON.stringify(Object.keys(J.keys ?? {})) : '못 읽음'}`);
          else for (const k of want) if (!eq(J.keys[k], JSON.parse(KEYSNAP[k]))) fail('기록 파일 값이 이 기기 기록과 다름', `${tag} ${k}`);
          if (txt.includes('atlas:godori-money') || txt.includes('S5H-SECRET')) fail('기록 파일에 내 돈 칸이 들어감', tag);
          if (!new RegExp('^' + NAME_EN.toLowerCase() + '-records-\\d{4}-\\d{2}-\\d{2}\\.json$').test(name)) fail('기록 파일 이름', `${tag} ${name}`);
          bump('기록 파일 맞댐');
        }
        if (calls.exportFile && kk?.exportFalse) bump('exportFile false → 여기서 만듦');
      }
      if (reqs.length !== nReq0) fail('기록 파일 누를 때 망 요청 0', `${tag} ${reqs.slice(nReq0).join(' ')}`);
      const afterKeys = await p.evaluate(() => Object.keys(localStorage).sort().map(k => k + '=' + localStorage.getItem(k)).join('\n'));
      if (afterKeys !== before) fail('기록 파일을 받아도 이 기기 기록은 그대로', tag);
      // [4] 9 탈퇴 — 가입 안 함이면 줄 0
      if (!isMember && (s.asking || s.items.some(x => /탈퇴/.test(x.text)) || /탈퇴/.test(s.text))) fail('가입 안 함이면 탈퇴 줄 0', tag);
      if (isMember) {
        const W = '#view .hd-sc-wd';
        let a = await p.evaluate(SC13); if (a.asking || a.calls.withdraw !== 0) fail('탈퇴 — 처음엔 묻지도 부르지도 않음', `${tag} ${JSON.stringify(a.calls)}`);
        if (a.items.at(-1).text !== '탈퇴›') fail('탈퇴 줄은 바로 가기 맨 아래', `${tag} ${JSON.stringify(a.items.map(x => x.text))}`);
        await p.locator(W).click(); await p.waitForTimeout(150); a = await p.evaluate(SC13);       // 누름 1
        if (!a.asking || !a.q || a.wdBtns.join('/') !== '탈퇴하기/그만두기' || a.calls.withdraw !== 0 || a.wdExp !== 'true') fail('첫 누름은 묻기만(withdraw 0번)', `${tag} ${JSON.stringify({ask: a.asking, b: a.wdBtns, c: a.calls, e: a.wdExp})}`);
        await layout2(p, tag + ' 묻는 중');
        await p.locator('#view .hd-wd .hd-no').click(); await p.waitForTimeout(150); a = await p.evaluate(SC13); // 그만두기
        if (a.asking || a.calls.withdraw !== 0) fail('「그만두기」는 부르지 않고 닫기만', `${tag} ${JSON.stringify(a.calls)}`);
        await p.locator(W).click(); await p.waitForTimeout(150);
        const keysBefore = await p.evaluate(() => ['atlas:godori-why', 'atlas:new:sub', 'atlas:new:later', 'atlas:godori-hold'].map(k => localStorage.getItem(k)));
        await p.locator('#view .hd-wd .hd-go').click();                                          // 누름 2
        await p.waitForFunction(() => window.__fk.calls.withdraw >= 1 && !document.querySelector('#view .hd-sc-wd'), null, {timeout: 6000}).catch(() => {});
        await p.waitForTimeout(250); a = await p.evaluate(SC13);
        if (a.calls.withdraw !== 1) fail('두 번째 누름 → NX.kakao.withdraw() 정확히 1번', `${tag} ${a.calls.withdraw}`);
        if (a.items.some(x => /탈퇴/.test(x.text)) || a.note !== DEVICE || String(a.sub) !== '이 기기에만 남아요. 판 것도 지우지 않아요.') fail('탈퇴 뒤 줄 · 글이 가입 안 함 꼴로(nx:kakao 로 다시 그림)', `${tag} ${JSON.stringify({items: a.items.map(x => x.text), note: a.note, sub: a.sub})}`);
        const keysAfter = await p.evaluate(() => ['atlas:godori-why', 'atlas:new:sub', 'atlas:new:later', 'atlas:godori-hold'].map(k => localStorage.getItem(k))); if (!eq(keysAfter, keysBefore)) fail('탈퇴 뒤에도 이 기기 기록 그대로', tag);
        if (!(await p.evaluate(() => document.body.textContent.includes('탈퇴했어요.')))) bump('탈퇴 알림 글 못 봄(알림은 잠깐)');
        bump('탈퇴 두 번 맞댐');
      }
      await layout2(p, tag); errsOf(p, tag); bump('바로 가기 판');
    } catch (e) { fail('바로 가기 길 멈춤', `${tag}: ${e.message.split('\n')[0]}`); }
    await p.context().close();
  }
  { // 가입함 + 탈퇴 실패(서버 오류) → 줄 그대로 · 알림 글 · 1번 불렀음 / 가입함 + exportFile false → 여기서 만듦
    const tag = '탈퇴 실패 360×640', p = await newPage2(360, 640, {seed: FOUR, kk: {on: true, member: true, wdFail: true, exportFalse: true}});
    try {
      await openHash(p, '#/me', '#view .hd-sc-wd'); await p.waitForTimeout(200);
      await p.locator('#view .hd-sc-wd').click(); await p.locator('#view .hd-wd .hd-go').click();
      await p.waitForFunction(() => window.__fk.calls.withdraw >= 1 && !!document.querySelector('#view .hd-wd .hd-err'), null, {timeout: 6000}).catch(() => {}); await p.waitForTimeout(200);
      const a = await p.evaluate(SC13);
      if (a.calls.withdraw !== 1 || !a.asking || a.err !== '탈퇴를 마치지 못했어요. 잠시 뒤 다시 눌러 주세요.' || !a.items.some(x => x.text === '탈퇴›') || a.note !== MEMBER) fail('탈퇴 실패 → 줄 그대로 · 「마치지 못했어요」 · 가입 표시 그대로', `${tag} ${JSON.stringify({c: a.calls, ask: a.asking, e: a.err, n: a.note})}`);
      let dl = null; const dp = p.waitForEvent('download', {timeout: 6000}).then(d => { dl = d; }).catch(() => {});
      await p.locator('#view .hd-sc-dl').click(); await Promise.race([dp, p.waitForTimeout(1500)]);
      if (!dl) fail('카카오 쪽 exportFile 이 false 면 여기서 파일을 만듦', tag); else bump('기록 파일 대신 만듦');
      errsOf(p, tag); bump('바로 가기 판');
    } catch (e) { fail('탈퇴 실패 길 멈춤', `${tag}: ${e.message.split('\n')[0]}`); }
    await p.context().close();
  }
  { // 영어 — 가입함 꼴 · 접기 · 탈퇴 묻는 중 · 가입 안 함 꼴 모두 한국어 0 · 사전에 없는 틀 0
    for (const [nm, kk] of [['가입함', {on: true, member: true}], ['가입 안 함', null]]) {
      const tag = `바로 가기 영어(${nm}) 360×640`, p = await newPage2(360, 640, {seed: FOUR, kk, routes: EN_ROUTE});
      try {
        await openEn(p, '#/me', '#view .hd-sc');
        const grab = () => p.evaluate(() => { const pick = s => document.querySelector(s)?.textContent ?? ''; return {sc: pick('#view .hd-sc'), keep: pick('#view p.hd-keep'), sub: pick('#view .hd-sub'), fold: pick('#view .hd-fold-b'), h2: [...document.querySelectorAll('#view h2.sec')].map(x => x.textContent).join('|')}; });
        let g = await grab();
        for (const k of ['sc', 'keep', 'sub', 'fold', 'h2']) if (HAN.test(g[k])) fail('영어 화면에 한국어가 남음', `${tag} ${k} 「${g[k].slice(0, 80)}」`);
        if (g.fold !== 'Show all') fail('영어 「펼치기」', `${tag} 「${g.fold}」`);
        if (nm === '가입함') { if (g.keep !== 'Kept safe with Kakao.') fail('영어 가입함 지킴 글', `${tag} 「${g.keep}」`); await p.locator('#view .hd-sc-wd').click(); await p.waitForTimeout(250); g = await grab(); if (HAN.test(g.sc)) fail('영어 탈퇴 묻기에 한국어가 남음', `${tag} 「${g.sc.slice(0, 120)}」`); }
        else if (g.keep !== 'Saved only on this device. No name or password needed.') fail('영어 가입 안 함 지킴 글(옛 문장 그대로)', `${tag} 「${g.keep}」`);
        await p.locator('#view .hd-fold-b').click(); await p.waitForTimeout(200); if ((await grab()).fold !== 'Show less') fail('영어 「접기」', tag);
        const miss = await missingEn(p); if (miss == null || miss.length) fail('영어 사전에 없는 틀(바로 가기 · 접기)', `${tag} ${JSON.stringify(miss)?.slice(0, 240)}`);
        errsOf(p, tag); bump('바로 가기 영어 판');
      } catch (e) { fail('바로 가기 영어 길 멈춤', `${tag}: ${e.message.split('\n')[0]}`); }
      await p.context().close();
    }
  }
  { // 처음엔 가입 안 함 → 나중에 가입함(nx:kakao) → 쪽 글 · 바로 가기가 다시 그려짐
    const tag = '가입 뒤 다시 그림 360×640', p = await newPage2(360, 640, {seed: FOUR, kk: {on: true, member: false}});
    try {
      await openHash(p, '#/me', '#view .hd-sc'); await p.waitForTimeout(200);
      await p.evaluate(() => { window.__fk.member = true; dispatchEvent(new CustomEvent('nx:kakao', {detail: {on: true, member: true}})); }); await p.waitForTimeout(250);
      const a = await p.evaluate(SC13);
      if (a.note !== MEMBER || !a.items.some(x => x.text === '탈퇴›') || !String(a.sub).startsWith(MEMBER)) fail('나중에 가입하면 쪽 글 · 탈퇴 줄이 다시 그려짐', `${tag} ${JSON.stringify({n: a.note, s: a.sub, i: a.items.map(x => x.text)})}`);
      errsOf(p, tag); bump('바로 가기 판');
    } catch (e) { fail('가입 뒤 길 멈춤', `${tag}: ${e.message.split('\n')[0]}`); }
    await p.context().close();
  }
  for (const [nm, kk, want, not] of [['가입함', {on: true, member: true}, '카카오로 지켜요.', '이 기기에만'], ['가입 안 함', {on: true, member: false}, '이 기기에만 남아요.', '카카오로']]) { // 관심 머리 글 끝 말도 가입 여부를 따라감
    const tag = `관심 머리 글 ${nm} 360×640`, p = await newPage2(360, 640, {seed: {'atlas:new:sub': SEEDS.one}, kk});
    try {
      await openHash(p, '#/sub', '#view h1.h'); await p.waitForTimeout(200);
      const t = await p.evaluate(() => document.querySelector('#view h1.h + p.note')?.textContent ?? '');
      if (!/^회사 \d+곳 · /.test(t) || !t.endsWith(' · ' + want) || t.includes(not)) fail('관심 머리 글 끝 말(가입 안 함 「이 기기에만 남아요.」 · 가입함 「카카오로 지켜요.」)', `${tag} 「${t}」`);
      if (nm === '가입함') { await p.evaluate(() => { window.__fk.member = false; dispatchEvent(new CustomEvent('nx:kakao', {detail: {on: true, member: false}})); }); await p.waitForTimeout(200); const t2 = await p.evaluate(() => document.querySelector('#view h1.h + p.note')?.textContent ?? ''); if (!t2.endsWith(' · 이 기기에만 남아요.')) fail('가입이 풀리면 관심 머리 글이 다시 그려짐', `${tag} 「${t2}」`); }
      errsOf(p, tag); bump('관심 머리 글 판');
    } catch (e) { fail('관심 머리 글 길 멈춤', `${tag}: ${e.message.split('\n')[0]}`); }
    await p.context().close();
  }
}

/* ⑭ 글씨 · 간격 · 왼쪽 줄 · 낱말 — css 글(내 파일 · 내 블록) + 쪽 재기(#/me 비었을 때 · 보유 둘 · #/sub 소식) */
if (RUN(14)) {
  const stripC = s => s.replace(/\/\*[\s\S]*?\*\//g, '');
  const decls = src => { const out = []; for (const m of stripC(src).matchAll(/([^{}]+)\{([^{}]*)\}/g)) { const sel = m[1].trim().replace(/\s+/g, ' '); if (/^@/.test(sel)) continue; for (const d of m[2].split(';')) { const i = d.indexOf(':'); if (i < 0) continue; out.push({sel, prop: d.slice(0, i).trim().toLowerCase(), val: d.slice(i + 1).trim()}); } } return out; };
  const SPROP = /^(margin|padding)(-(top|right|bottom|left|inline|block)(-(start|end))?)?$|^(row-|column-)?gap$/;
  const splitVal = v => { const t = []; let cur = '', depth = 0; for (const ch of v) { if (ch === '(') depth++; if (ch === ')') depth--; if (/\s/.test(ch) && !depth) { if (cur) t.push(cur); cur = ''; } else cur += ch; } if (cur) t.push(cur); return t; };
  const OKSP = new Set(['0', 'auto', 'inherit', 'initial', 'unset', 'normal', 'var(--sp-1)', 'var(--sp-2)', 'var(--sp-3)']);
  const audit = (decl, label) => {
    let nf = 0, ns = 0, nn = 0;
    for (const {sel, prop, val} of decl) {
      if (prop === 'font-size' && !/^var\(--fs-[1-6]\)$/.test(val) && !/^(inherit|initial)$/.test(val)) { nf++; fail('글씨 크기가 var(--fs-n) 아님([10] 6)', `${label} ${sel} {font-size: ${val}}`); }
      if (SPROP.test(prop)) for (const t of splitVal(val.replace(/\s*!important$/, ''))) { if (/^-|calc\(\s*-/.test(t)) { nn++; fail('음수 간격([10] 8)', `${label} ${sel} {${prop}: ${val}}`); } else if (!OKSP.has(t)) { ns++; fail('간격이 0 · 8 · 16 · 24 토큰이 아님([10] 8)', `${label} ${sel} {${prop}: ${val}}`); } }
    }
    return {nf, ns, nn};
  };
  const holdCss = decls(await fs.readFile(path.join(ROOT, 'site/next/p-hold.css'), 'utf8'));
  const appCss = decls(await fs.readFile(path.join(ROOT, 'site/next/app.css'), 'utf8'));
  const MINE = new Set(['.chan', '.chan > a', '.chan b', '.chan small', '.sub-btn', '.sub-btn[aria-pressed="true"]', '.wl > a', '.wl-th', '.wl-th .ln', '.chan.wl b', '.wl + .wl', '.wl > a > div', '.wl-p', 'html.f2 .chan.wl, html.f3 .chan.wl', 'html.f2 .chan.wl > a, html.f3 .chan.wl > a', '.avs', '.avs::-webkit-scrollbar', '.avs a', '.avs small', '.row', '.row::-webkit-scrollbar', '.row a', '.row b', '.lst', '.lst a, .lst button', '.lst span', '.lw']);
  const aH = audit(holdCss, 'p-hold.css'), aA = audit(appCss.filter(d => MINE.has(d.sel)), 'app.css(관심 · 보유종목 블록)');
  COUNTS_CSS = {holdDecls: holdCss.length, appMine: appCss.filter(d => MINE.has(d.sel)).length, fontNotToken: aH.nf + aA.nf, spacingNotToken: aH.ns + aA.ns, negative: aH.nn + aA.nn};
  // 낱말 — p-hold.js 글(주석 뺌)
  const js = await fs.readFile(path.join(ROOT, 'site/next/p-hold.js'), 'utf8');
  const lits = []; { let i = 0, n = js.length; const take = (q, st) => { let s = ''; while (i < n && js[i] !== q) { if (js[i] === '\\') { s += js[i + 1] ?? ''; i += 2; continue; } s += js[i++]; } i++; lits.push(s); }; while (i < n) { const c = js[i]; if (c === '/' && js[i + 1] === '/') { while (i < n && js[i] !== '\n') i++; } else if (c === '/' && js[i + 1] === '*') { i += 2; while (i < n && !(js[i] === '*' && js[i + 1] === '/')) i++; i += 2; } else if (c === "'" || c === '"' || c === '`') { i++; take(c); } else i++; } }
  const badLit = lits.filter(t => OLD_WORDS.test(t)); for (const t of badLit.slice(0, 4)) fail('내 글(p-hold.js)에 옛 낱말([10] 1)', `「${t.slice(0, 50)}」`);
  COUNTS_WORDS = {literals: lits.length, oldWords: badLit.length};
  const EDGES = () => {
    const view = document.querySelector('#view'), vw = document.documentElement.clientWidth, R = document.createRange(), SKIP = new Set(['SCRIPT', 'STYLE', 'NOSCRIPT', 'TEMPLATE', 'TITLE']);
    const vis = (el, q) => { let l = q.left, t = q.top, r = q.right, b = q.bottom; for (let a = el; a && a !== document.documentElement; a = a.parentElement) { const cs = getComputedStyle(a); if (cs.overflowX !== 'visible' || cs.overflowY !== 'visible') { const x = a.getBoundingClientRect(); l = Math.max(l, x.left); t = Math.max(t, x.top); r = Math.min(r, x.right); b = Math.min(b, x.bottom); } } return r - l >= 1 && b - t >= 1; };
    const blockOf = el => { for (let a = el; a; a = a.parentElement) { const d = getComputedStyle(a).display; if (d !== 'inline' && d !== 'contents') return a; } return document.body; };
    const blocks = new Map(), sizes = new Map(), own = new Map(), letterSizes = new Map(); const tw = document.createTreeWalker(view, NodeFilter.SHOW_TEXT);
    for (let n; (n = tw.nextNode());) {
      if (!n.nodeValue.trim()) continue; const el = n.parentElement; if (!el || SKIP.has(el.tagName)) continue;
      R.selectNodeContents(n); const rs = [...R.getClientRects()].filter(q => q.width >= 1 && q.height >= 1); if (!rs.length) continue;
      if (el.checkVisibility && !el.checkVisibility({checkOpacity: true, checkVisibilityCSS: true})) continue;
      if (!vis(el, rs[0])) continue;
      const f = Math.round(parseFloat(getComputedStyle(el).fontSize) * 2) / 2, inL = !!el.closest('a.m4-letter');
      (inL ? letterSizes : sizes).set(f, (sizes.get(f) || 0) + 1); if (!own.has(el)) own.set(el, f);
      const b = blockOf(el); if (!blocks.has(b)) blocks.set(b, {n, q: rs[0]});
    }
    const xs = new Map(), ex = {};
    for (const [b, t] of blocks) { if (/center|right|end/.test(getComputedStyle(b).textAlign)) continue; const x = Math.round(t.q.left); if (x < 0 || x >= vw) continue; xs.set(x, (xs.get(x) || 0) + 1); if (!ex[x]) ex[x] = b.tagName.toLowerCase() + '.' + String(b.className).split(' ')[0] + ' 「' + t.n.nodeValue.trim().slice(0, 12) + '」'; }
    // 간격([10] 8) — #view 안 그려진 칸(가려지거나 잘린 것도)의 margin · padding · gap 이 0 · 8 · 16 · 24 인지, 음수는 없는지(measure_type.mjs 와 같은 잣대 — auto · % 는 뺌)
    const PROPS = ['margin-top', 'margin-right', 'margin-bottom', 'margin-left', 'padding-top', 'padding-right', 'padding-bottom', 'padding-left', 'row-gap', 'column-gap'], SPV = [0, 8, 16, 24];
    const nm = el => el.tagName.toLowerCase() + (typeof el.className === 'string' && el.className.trim() ? '.' + el.className.trim().split(/\s+/)[0] : '');
    const spBad = new Map(); let spN = 0, neg = 0; const negEx = [];
    for (const el of view.querySelectorAll('*')) {
      if (el.closest('svg') && el.tagName.toLowerCase() !== 'svg') continue;
      if (!el.getClientRects().length) continue;
      const map = el.computedStyleMap ? el.computedStyleMap() : null, cs = getComputedStyle(el);
      for (const pr of PROPS) {
        if (pr.endsWith('gap') && !/flex|grid/.test(cs.display)) continue;
        let v = null; const sv = map?.get(pr);
        if (sv && sv.constructor?.name === 'CSSKeywordValue') continue;
        if (sv && sv.constructor?.name === 'CSSUnitValue') { if (sv.unit === 'percent') continue; v = sv.unit === 'px' ? sv.value : parseFloat(cs.getPropertyValue(pr)); } else v = parseFloat(cs.getPropertyValue(pr));
        if (!Number.isFinite(v)) continue;
        if (v < -0.5) { neg++; if (negEx.length < 6) negEx.push(nm(el) + ' ' + pr + ' ' + Math.round(v)); continue; }
        if (SPV.some(s => Math.abs(s - v) < 0.6)) continue;
        spN++; const k = nm(el) + ' ' + pr.replace(/-(top|right|bottom|left)$/, '') + ' ' + Math.round(v * 10) / 10; spBad.set(k, (spBad.get(k) || 0) + 1);
      }
    }
    return {lefts: Object.fromEntries([...xs].sort((a, b) => a[0] - b[0])), ex, sizes: [...new Set([...sizes.keys()])].sort((a, b) => a - b), letter: [...letterSizes.keys()].sort((a, b) => a - b), px: Math.max(document.documentElement.scrollHeight, document.body.scrollHeight), spN, neg, negEx, spEx: [...spBad].sort((a, b) => b[1] - a[1]).slice(0, 8).map(([k, n]) => k + ' ×' + n)};
  };
  const HX = SC.slice(0, 2).map(s => ({...s.hold, ask: {d: TODAY, a: 0}}));
  const measure = async (tag, w, h, hash, seed, readyFn, {open = false, maxEdges = 3} = {}) => {
    const p = await newPage2(w, h, {seed});
    try {
      await openHash(p, hash, readyFn); await p.waitForFunction(() => !document.querySelector('#view a.m4-letter.intro'), null, {timeout: 14000}).catch(() => {}); await p.waitForTimeout(500);
      if (open) { await p.locator('#view .hd-fold-b').click(); await p.waitForTimeout(250); }
      const m = await p.evaluate(EDGES), nEdge = Object.keys(m.lefts).length;
      const bad = m.sizes.filter(f => f < 16.95); if (bad.length) fail('17px 아래 글([10] 5)', `${tag} ${bad}`);
      if (m.sizes.length > 6) fail('글씨 크기 6가지 넘음([10] 6)', `${tag} ${m.sizes}`);
      const nt = m.sizes.filter(f => ![17, 19, 21, 24, 30, 48].includes(f)); if (nt.length) fail('글씨 크기가 토큰(17 · 19 · 21 · 24 · 30 · 48) 밖([10] 6)', `${tag} ${nt}`);
      if (nEdge > maxEdges) fail(`글 시작 왼쪽 줄 ${maxEdges} 넘음([10] 7)`, `${tag} ${JSON.stringify(m.lefts)} ${JSON.stringify(m.ex)}`);
      if (m.neg) fail('음수 간격이 그려진 칸에 있음([10] 8)', `${tag} ${m.neg}곳 ${m.negEx.join(' | ')}`);
      if (m.spN) fail('간격이 0 · 8 · 16 · 24 아닌 칸이 그려져 있음([10] 8)', `${tag} ${m.spN}곳 ${m.spEx.join(' | ')}`);
      const lay = await layout2(p, tag); if (OLD_WORDS.test(lay.text) && /#\/me/.test(hash)) fail('쪽 글에 옛 낱말([10] 1)', `${tag} ${lay.text.match(OLD_WORDS)?.[0]}`);
      errsOf(p, tag); bump('글씨 · 간격 재기 판');
      return {tag, ...m, nEdge};
    } catch (e) { fail('재기 길 멈춤', `${tag}: ${e.message.split('\n')[0]}`); return null; }
    finally { await p.context().close(); }
  };
  const M = [];
  M.push(await measure('#/me 비었을 때(접힘) 360×640', 360, 640, '#/me', {}, '#view .hd-fold'));
  M.push(await measure('#/me 보유 둘 · 답함(접힘) 360×640', 360, 640, '#/me', {'atlas:godori-hold': JSON.stringify(HX), 'atlas:godori-why': JSON.stringify(SC.slice(0, 2).map(s => s.rec).filter(Boolean))}, '#view .hd-card .hd-badge'));
  M.push(await measure('#/me 펼침(편지 포함 · 안내만) 360×640', 360, 640, '#/me', {}, '#view .hd-fold', {open: true, maxEdges: 99}));
  M.push(await measure('#/sub 소식 360×640', 360, 640, '#/sub', {'atlas:new:sub': SEEDS.sub}, '#view section.sb', {maxEdges: 99}));
  COUNTS_MEASURE = M.filter(Boolean).map(m => ({tag: m.tag, px: m.px, sizes: m.sizes, letter: m.letter, lefts: m.lefts, ex: m.ex, spacingOff: m.spN, negative: m.neg}));
}

/* ⑮ 우리가 만든 팔 선 없음 — 한국어 · 영어 둘 다(2026-10-18 총괄 결정: 자본시장법 변호사의 서면 의견을 받기 전까지 · 고도리 칸 [9] 1 · 규칙 77 「내 약속과 대조만」과 같게)
   보유 다섯(매매일지 없음 · 매매일지만 있고 팔 약속 없음 · 절반 팔 선만 안 적음 · 네가 적은 팔 선이 먼 것 · 팔 선을 지난 것)을 답해 둔 채로 #/me 를 열어 본다
   ① 쪽 글 전체 · 카드 · 색 풀이에 기본 팔 선 · 기본 약속 · 「산 값의 90% · 120%」 글이 0 ② 옛 기본 약속 값(산 값 × 0.9 · × 1.2)이 숫자로 0(보이는 다른 숫자와 같으면 건너뜀)
   ③ 네가 적은 약속이 있으면 「네가 정한 팔 선까지 n% 남았어」 꼴 줄이 그대로(영어는 사전 글) · 없으면 「?」 한 줄 + 적으러 가는 고리 ④ 영어에 한글 0 · 사전에 없는 틀 0
   ⑤ 기억(보유종목 · 매매일지)은 한 줄도 지우지 않음 · 산 값 · 수량 · 산 날 · 매매일지 글 그대로 */
if (RUN(15)) {
  const std = (sell, half) => `만약 ${won(sell)} 아래로 가면 다 판다. 만약 ${won(half)} 위로 가면 절반 판다.`; // 매매일지가 저장하는 약속 글 꼴(영어 사전에 있음)
  const mine = ['매매일지없음', '약속없음', '절반없음', '문1지남', '팔선지남'].map(k => SC.find(x => x.key === k)).filter(Boolean);
  if (mine.length < 5) fail('⑮ 꾸민 판이 모자람', mine.map(x => x.key).join(','));
  const holds15 = mine.map(x => ({...x.hold, ask: {d: TODAY, a: 0}})), recs15 = mine.map(x => (x.rec?.promise?.sell ? {...x.rec, promise: {...x.rec.promise, text: x.rec.promise.half ? std(x.rec.promise.sell, x.rec.promise.half) : undefined}} : x.rec)).filter(Boolean);
  const keepAll = mine.flatMap(x => [x.hold.buy, x.X.p, Math.abs((x.X.p - x.hold.buy) * x.hold.qty), ...[x.rec?.promise?.sell, x.rec?.promise?.half].filter(v => v > 0)]);
  const P15 = x => (x.rec?.promise?.sell ? {sell: x.rec.promise.sell, half: x.rec.promise.half} : null);
  for (const lang of ['ko', 'en']) {
    const tag = `팔 선 없음 ${lang === 'en' ? '영어' : '한국어'} 360×640`, p = await newPage(360, 640, {holds: holds15, recs: recs15, routes: lang === 'en' ? EN_ROUTE : []});
    try {
      if (lang === 'en') await openEn(p, '#/me', SEL + ' article.hd-card .hd-badge'); else await openHash(p, '#/me', SEL + ' article.hd-card .hd-badge');
      const g = await p.evaluate(READH, SEL), T = await p.evaluate(sel => document.querySelector(sel).textContent, SEL);
      if (g.cards.length !== mine.length) fail('⑮ 카드 수', `${tag} ${g.cards.length} ≠ ${mine.length}`);
      for (const x of mine) {
        const c = cardOf(g, x.hold.id), at = `${tag} ${x.key}`, i4 = c?.items?.[3];
        if (!i4) { fail('⑮ 카드 · ④ 칸 없음', at); continue; }
        const want = want4Lines(lang, x.X.p, P15(x));
        if (!eq(i4.lines, want)) fail(`⑮ ④ 줄(${lang})`, `${at} ${JSON.stringify(i4.lines)} ≠ ${JSON.stringify(want)}`);
        const wantLink = !P15(x) && x.rec ? '#/why/' + encodeURIComponent(x.X.code) : null;
        if (i4.link !== wantLink) fail(`⑮ ④ 적으러 가는 고리(${lang})`, `${at} ${i4.link} ≠ ${wantLink}`);
        if (lang === 'en' && HAN.test(i4.lines.join(' ') + (c.badge?.t ?? ''))) fail('⑮ 영어 ④ · 색 이름표에 한국어가 남음', `${at} ${JSON.stringify(i4.lines)} ${c.badge?.t}`);
        noSystemSell(c.text, x.hold.buy, keepAll, lang, at);
        if (P15(x)) bump(`⑮ 네가 적은 팔 선 줄 ${lang}`); else bump(`⑮ 팔 약속 안 적은 「?」 줄 ${lang}`);
      }
      if (!g.legLines.includes(LEG_PROMISE[lang])) fail(`⑮ 색 풀이 · 팔 약속 풀이(${lang})`, `${tag} ${JSON.stringify(g.legLines.slice(-2))}`);
      if (lang === 'en' && HAN.test(g.legText)) fail('⑮ 영어 색 풀이에 한국어가 남음', `${tag} 「${g.legText.match(/.{0,12}[가-힣]+.{0,12}/)?.[0]}」`);
      noSystemSell(T, 0, [], lang, tag + ' 쪽 전체 글(정규식)');
      if (GDR_TXT) { // 옛 v1 gdr.json(rules.sell 0.9 · half 1.2 · base 기준 돈 · picks 마다 sell · half)의 값이 #/me 에 새지 않음
        const D = JSON.parse(GDR_TXT), nums = [...(D.picks ?? []).flatMap(y => [y.sell, y.half]), D.base].filter(v => Number.isFinite(v) && v > 0 && !keepAll.includes(v));
        const forms = [...new Set([...nums.flatMap(v => [comma(Math.round(v)), ...(v >= 1e6 && v % 1e4 === 0 ? [comma(v / 1e4) + '만', (v / 1e7) + '천만'] : [])]), '90%', '120%'])], leaks = forms.filter(w => hasNum(T, w));
        if (leaks.length) fail('⑮ 옛 gdr.json(v1)의 팔 선 · 절반 팔 선 · 기준 돈 값이 #/me 에 보임', `${tag} ${leaks.join(' · ')}`); else bump(`⑮ 옛 gdr.json 값 새지 않음 맞댄 수 ${lang}`, forms.length);
      }
      for (const x of mine) noSystemSell(T, x.hold.buy, keepAll, lang, `${tag} 쪽 전체 글 · ${x.key}`);
      if (lang === 'en') { const miss = await missingEn(p); if (miss == null || miss.length) fail('⑮ 영어 사전에 없는 틀(팔 약속)', `${tag} ${JSON.stringify(miss)?.slice(0, 300)}`); }
      // 기억은 한 줄도 안 지움 — 보유종목은 산 값 · 수량 · 산 날 그대로 · 매매일지는 글자 그대로
      const st = await store(p), why = await store(p, WHY_KEY);
      if (!Array.isArray(st) || st.length !== holds15.length || holds15.some(h0 => { const o = st.find(y => y.id === h0.id); return !o || o.code !== h0.code || o.buy !== h0.buy || o.qty !== h0.qty || o.day !== h0.day; })) fail('⑮ 기억(보유종목)이 바뀜 — 지우지 않음', `${tag} ${JSON.stringify(st)?.slice(0, 200)}`);
      if (JSON.stringify(why) !== JSON.stringify(recs15)) fail('⑮ 기억(매매일지)이 바뀜 — 지우지 않음', `${tag}`);
      else bump('⑮ 기억 그대로 맞댄 판');
      errsOf(p, tag); bump('⑮ 팔 선 없음 판 ' + lang);
    } catch (e) { fail('⑮ 팔 선 없음 길 멈춤', `${tag}: ${e.message.split('\n')[0]}`); }
    await p.context().close();
  }
}

await browser.close();
const sec = Math.round((Date.now() - t0) / 1000);
const res = {schema: 'atlas11-next-hold-1', when: new Date().toISOString(), base, path: NEXT, all: ALL, mutated: !!MUT_JS, gatesSrc, gatesAsOf: GATE.asOf ?? null, scenes: SC.map(s => s.key), empty360: EMPTY, fold360: COUNTS_FOLD, css: COUNTS_CSS, words: COUNTS_WORDS, measure: COUNTS_MEASURE, only: ONLY, sec, counts, fails, ok: !fails.length};
if (OUT) { await fs.mkdir(path.dirname(path.resolve(OUT)), {recursive: true}); await fs.writeFile(path.resolve(OUT), JSON.stringify(res, null, 1) + '\n'); }
console.log(JSON.stringify({sec, gatesSrc, scenes: res.scenes.length, empty360: EMPTY, fold360: COUNTS_FOLD, css: COUNTS_CSS, words: COUNTS_WORDS, measure: COUNTS_MEASURE, counts}, null, 1));
if (fails.length) { console.log('실패 ' + (counts.fail || 0) + '건:'); for (const [k, x] of fails.slice(0, 60)) console.log(' -', k, '·', x); process.exit(1); }
console.log('실패 0');
