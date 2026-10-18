/* 고도리 칸 — 조건으로 거른 곳과 나눠 두는 비중(사장님 2026-10-17(싱가포르) 17:54 「고도리 만들기 · 한 장 명령문」 명령 9 ~ 12 · 14)
   자료 = /next/data/gdr.json(gdr-v1 · gdr-v2 둘 다 읽음 · scripts/atlas11/next/gdr/pick.mjs · pick2.mjs · 결정표 docs/design/godori-2026-10-17/brief.md · godori-2026-10-18/gdr-v2.md)
   gdrSection(G) = 첫 화면 칸(작은 칸 → 누르면 열림) · render(arg) = #/gdr · #/gdr/<번호>
   회사 이름 · 격언은 남의 글(data-proper) · 이름은 brand.js 한 곳(규칙 76)
   2026-10-17 21:10 「하나로 묶은 명령문」 [6] 고도리 칸 안전(일 나누기 brief2.md · 일꾼 D):
   ① 열한 질문을 마친 사람에게만 엶(p-why.js doneOnce — 아니면 잠금 + #/why · 같은 화면에서 마치면 그 자리에서 엶)
   ② 곳마다 「틀린다면 이유」 한 줄(gdr.json wrong · wrong-v1 — 화면은 그 글 그대로 · 없으면 「?」)
   ③ 성적은 고른 날부터 같은 때 코스피와 견줌(회사 = co/<번호>.json 오늘 값 · 코스피 = home.json idx.KOSPI.rows · 날짜가 안 맞으면 「?」 — 시장이 오르면 아무거나 오름)
   ④ 나빠도 숨기지 않음 — 가장 나쁜 곳 · 값을 못 받은 곳 수 · 날이 적어도 적은 대로
   2026-10-18 00:15 「72개와 카톡 두 번 가입」(order-0015 · 일 나누기 brief4.md · 일꾼 S9):
   [9] 1 금액 · 팔 선 · 절반 팔 선 · 「담겠어 · 팔겠어」 문장은 화면에서 뺌 — 자본시장법 변호사의 서면 의견을 받기 전까지(자료 gdr.json 의 sell · half 는 그대로 · 비중 · 이유 · 틀린다면 이유는 둠)
   [9] 4 내 돈 칸(atlas:godori-money)은 숨김 — 읽지도 쓰지도 지우지도 않음(서버에 올리지 않음)
   [6] 10 잠긴 칸은 한 줄(→ #/why) · 오늘 매매일지를 끝냈으면 열린 칸 맨 위에 「오늘 점수 준비 n / 22 · 다시 하기」 한 줄(p-why.js todayResult — 없으면 그 줄 없음)
   [5] 7 오늘 판정이 「오늘은 쉬어 가자」(verdict 'rest')면 칸을 닫고 「오늘은 담는 칸을 닫아 둘게」 한 줄만(지우지 않음 · 기록이 바뀌면 그 자리에서 다시 그림)
   [8] 1 고른 날이 사이트 자료 날보다 앞이면 카드마다 「고른 날 값 → 오늘 값」(두 날짜 · co/<번호>.json close × days.json dates)
   [8] 9 카드마다 한 줄: PER · PBR · 회사 크기(c.cap 억 원) · 1년 꼭대기 대비(close 지난 1년 가장 높은 종가와 마지막 종가) · 없으면 「?」 · 이유 글의 「업종 돈」 → 「업종 거래」
   [10] 3 「고른 곳」은 멍거 · 린치 조건 뜻으로만 — 이 칸은 「고도리 칸 n곳」
   [9] 8 칸 목록: role=list 바깥 칸 · role=listitem 은 감싼 칸 · 단추는 그냥 단추
   2026-10-18 낮 (일꾼 S9c — 앞 일꾼 S9 이 멈춰 이어받음) [10] 5 ~ 10: 글씨는 var(--fs-n) 셋 · 간격은 var(--sp-n)(8 · 16 · 24) · 음수 간격 없음 · 글 시작 왼쪽 줄 셋(16 · 32 · 오른쪽 칸) ·
   같은 칸은 같은 높이(둘째 줄까지 두 줄) · 확인 못 한 것(?)은 두 줄 안이면 한 문단 · 길면 「?」 한 줄 + 누르면 펼침 · 카드 머리 = 이름(누르는 고리 한 줄) 밑에 「n번 · 업종」
   종가 두 값(고른 날 → 오늘)은 회사 파일 close × days.json 날짜에서(그 날이 파일에 없을 때만 gdr.json 값) · PER 소수 한 자리 · PBR 소수 두 자리(끝 0 도 적음)
   gdr-v2(일꾼 G1c — 명령문 [8] 2 ~ 10): 격언 · sell · half 없음(격언 줄은 있을 때만) · 곳마다 near(가까스로 넘음) · mc(한 달 뒤 고른 날 값보다 위 10번 중 lo~hi번 + 무엇을 넣어 셈했나 접음) ·
   rules 줄(문턱마다 값 · 왜 이 값인가 · 조금 움직이면 남는 곳 수 접음) · 큰 업종 비중 합 · 세 곳이 함께 내린 날 · 목록 문(status.lists) · 분기 숫자(status.quarters) · 고른 곳 0도 그림 */
import {NAME, josa} from './brand.js';
import * as WHY from './p-why.js'; // 매매일지(일꾼 S1)의 doneOnce() · todayResult() — 없거나 못 읽으면 기록을 직접 읽거나 그 줄을 뺌
const NX = globalThis.NX;
const {h} = NX;
const WHY_KEY = 'atlas:godori-why'; // 내 돈 칸 열쇠(atlas:godori-money)는 [9] 1 · 4 동안 쓰지 않음 — 값은 그대로 둠
const md = d => { const p = String(d ?? '').split('-'); return p.length === 3 ? `${+p[1]}월 ${+p[2]}일` : '?'; };
const wTxt = w => (Number.isInteger(w) ? String(w) : (+w).toFixed(1)) + '%';
const pctEl = x => h('b', {class: 'num ' + NX.cls(x), text: NX.pct(x)});
const one = x => (Math.floor(Math.abs(x) * 10 + 0.5 + 1e-7) / 10).toFixed(1);
const fin = x => (typeof x === 'number' && Number.isFinite(x) ? x : null);
const wonP = n => Math.round(n).toLocaleString('ko-KR') + '원'; // 종가(주가 사실)
const dec = (x, k) => Number(x.toFixed(k)).toLocaleString('ko-KR', {minimumFractionDigits: k, maximumFractionDigits: k}); // PER 한 자리 · PBR 두 자리(끝 0 도 적음)
/** 억 원 → 「1조 7,507억 원」(지금 아틀란스 eokW 와 같은 꼴) */
const eok = v => { const a = Math.abs(Math.round(v)), jo = Math.floor(a / 10000), r = a % 10000; return (jo ? jo.toLocaleString('ko-KR') + '조' + (r ? ' ' : '') : '') + (r || !jo ? r.toLocaleString('ko-KR') + '억' : '') + ' 원'; };
/** 이유 한 줄 — gdr-v1 의 「업종 돈 n배」는 「업종 거래 n배」로([8] 9 · v2 는 이미 그 말이면 그대로) */
const reasonTxt = s => String(s ?? '').replace(/업종 돈(\s*[\d.]+배)/g, '업종 거래$1');
/** 확인 못 한 것 알림([10] 10 — 두 줄까지) — 「? 짧은 글」 한 줄을 보이고 누르면 나머지가 펼쳐짐(<details>) */
const warnP = (cls, short, full) => h('details', {class: 'gdr-wd ' + cls}, h('summary', {class: 'gdr-wq'}, h('b', {class: 'gdr-qm', text: '? '}), h('span', {text: short})), h('p', {class: 'gdr-wb', text: full}));
/** 접은 칸(「?」 아님) — 한 줄을 보이고 누르면 펼쳐짐 */
const foldP = (cls, short, ...body) => h('details', {class: 'gdr-wd ' + cls}, h('summary', {class: 'gdr-wq', text: short}), ...body);
const GATES_KO = ['이익 늘었나', '아직 조용한가', '석 달 천천히 올랐나', '두 배 넘게 안 올랐나', '돈 들어오는 업종인가']; // 사장님 다섯 문 이름(gdr-v1 · v2 같음)
const isV2 = G => !!G && G.version !== 'gdr-v1' && (Array.isArray(G.rules) || G.version === 'gdr-v2');
const maxOf = G => fin(G?.limits?.max) ?? fin(G?.max) ?? 36;
/** gdr-v2 rules — 배열(문턱마다 {gate, key, name, v, unit, why, sens}) · 못 읽으면 [] */
const rulesOf = G => { const r = G?.rules; return (Array.isArray(r) ? r : Array.isArray(r?.list) ? r.list : Array.isArray(r?.items) ? r.items : []).filter(x => x && typeof x === 'object'); };
const needOf = G => (G?.limits?.need ?? G?.need ?? G?.rules?.need) === 4 ? 4 : 5;
const numTxt = x => (typeof x === 'number' && Number.isFinite(x) ? x.toLocaleString('ko-KR') : '?');
/** 기준 값 + 단위 — 큰 원 금액(거래대금)은 「10억 원」 꼴로 */
const unitTxt = (v, u) => (u === '원' && typeof v === 'number' && Math.abs(v) >= 1e8 ? eok(v / 1e8) : numTxt(v) + (typeof u === 'string' ? u : ''));

/** 열한 질문을 한 번이라도 끝냈나([6] 1) — 매매일지 doneOnce() 먼저 · 없으면 기록(답 열한 개)을 직접 봄 */
export function opened() {
  try { if (typeof WHY.doneOnce === 'function') return !!WHY.doneOnce(); } catch { return false; }
  try { const x = JSON.parse(localStorage.getItem(WHY_KEY) || '[]'); return Array.isArray(x) && x.some(r => Array.isArray(r?.answers) && r.answers.length === 11 && r.answers.every(k => k === 0 || k === 1 || k === 2)); } catch { return false; }
}
/** 오늘 매매일지 결과(p-why.js todayResult · {at, code, verdict: 'go'|'wait'|'rest', ready, of: 22}) — 없거나 못 읽으면 null */
export function today() {
  try { if (typeof WHY.todayResult === 'function') { const r = WHY.todayResult(); return r && typeof r === 'object' ? r : null; } } catch { /* 못 읽음 — 줄을 뺌 */ }
  return null;
}
const stateSig = () => { const o = opened(), T = o ? today() : null; return JSON.stringify([o, T?.verdict ?? null, T?.ready ?? null, T?.at ?? null]); };
/** 같은 화면에서 매매일지가 바뀌면(질문을 마침 · 오늘 판정이 바뀜) 1.5초 안에 그 자리에서 다시 그림 — 화면을 떠나면 멈춤 */
function watch(box, G, opt) {
  const s0 = stateSig(), t0 = Date.now(); let seen = false;
  const t = setInterval(() => {
    if (box.isConnected) seen = true; else { if (seen || Date.now() - t0 > 60000) clearInterval(t); return; }
    if (stateSig() !== s0) { clearInterval(t); const nb = gdrSection(G, opt); box.replaceWith(nb); try { opt.sync?.(nb); } catch { /* 곁 칸 맞춤 못 함 */ } }
  }, 1500);
  return box;
}

/** 잠금 — 한 줄([6] 10) · 열한 질문으로 보냄 */
function lockBox(G, opt) {
  return watch(h('section', {class: 'gdr lock1' + (opt.page ? ' page' : ''), 'aria-label': `${NAME} 칸`},
    h('a', {class: 'gdr-l1', href: '#/why', text: `${NAME} 칸은 열한 질문 뒤에 열려요 ›`})), G, opt);
}
/** 쉬어 가는 날 — 칸을 닫고 한 줄만([5] 7 · 자료 · 기록은 그대로) */
function restBox(G, opt) {
  return watch(h('section', {class: 'gdr rest1' + (opt.page ? ' page' : ''), 'aria-label': `${NAME} 칸`},
    h('p', {class: 'gdr-rest', text: '오늘은 담는 칸을 닫아 둘게'})), G, opt);
}
/** 오늘 점수 한 줄([6] 10) — 준비 n / 22 · 다시 하기 → #/why */
function todayLine(T) {
  const n = fin(T.ready), of = fin(T.of) ?? 22;
  return h('a', {class: 'gdr-today', href: '#/why', text: `오늘 점수 준비 ${n == null ? '?' : n} / ${of} · 다시 하기 ›`});
}

/* 카드 자료 — co/<번호>.json(오늘 값 · PER · PBR · 회사 크기 · 종가 줄) · days.json(종가 줄의 날짜) · home.json(코스피) */
async function dataOf(G) {
  const [H, DD, cos] = await Promise.all([NX.need ? NX.need('home').catch(() => null) : null, NX.getJson('days.json').catch(() => null), Promise.all(G.picks.map(p => NX.getJson('co/' + p.code + '.json').catch(() => null)))]);
  const rows = Array.isArray(H?.idx?.KOSPI?.rows) ? H.idx.KOSPI.rows.filter(r => Array.isArray(r) && typeof r[0] === 'string' && r[1] > 0) : [];
  const K = new Map(rows.map(r => [r[0].slice(0, 10), r[1]])), at = G.asOf, per = new Map(), info = new Map();
  const dates = Array.isArray(DD?.dates) ? DD.dates : null;
  G.picks.forEach((p, i) => {
    const co = cos[i], c = co?.c, now = c?.price > 0 ? c.price : null, d = typeof c?.priceDate === 'string' ? c.priceDate.slice(0, 10) : null;
    info.set(p.code, infoOf(co, dates));
    if (!now || !d || !(p.price > 0) || d < at) { per.set(p.code, {miss: true}); return; }
    const k0 = K.get(at), k1 = K.get(d), kOk = !!(k0 && k1);
    per.set(p.code, {r: (now / p.price - 1) * 100, kr: kOk ? (k1 / k0 - 1) * 100 : null, d, n: kOk ? rows.filter(x => x[0] > at && x[0] <= d).length : null, zero: d === at});
  });
  return {per, info, site: NX.D?.mkt?.asOf ?? (typeof DD?.asOf === 'string' ? DD.asOf : null)};
}
/** 회사 하나 — PER · PBR · 회사 크기 · 마지막 종가와 그 날 · 지난 1년(마지막 날 1년 앞 날 다음부터) 가장 높은 종가 대비 % · 날짜로 종가 찾기 */
function infoOf(co, dates) {
  if (!co || typeof co !== 'object') return null;
  const cl = Array.isArray(co.close) ? co.close : null, k0 = Number.isInteger(co.k0) ? co.k0 : null, ok = !!(cl && dates && k0 != null);
  const dAt = i => (ok ? dates[k0 + i] ?? null : null);
  let last = null, lastD = null, hiPct = null;
  if (ok) for (let i = cl.length - 1; i >= 0; i--) if (cl[i] > 0 && dAt(i)) { last = cl[i]; lastD = dAt(i); break; }
  if (last) {
    const y0 = (+lastD.slice(0, 4) - 1) + lastD.slice(4); let hi = 0;
    for (let i = 0; i < cl.length; i++) { const d = dAt(i); if (d && d > y0 && d <= lastD && cl[i] > hi) hi = cl[i]; }
    if (hi > 0) hiPct = (last / hi - 1) * 100;
  }
  const closeOn = d => { if (!ok) return null; const j = dates.indexOf(d) - k0; return j >= 0 && j < cl.length && cl[j] > 0 ? cl[j] : null; };
  return {per: fin(co.per) ?? fin(co.c?.per), pbr: fin(co.pbr), cap: fin(co.c?.cap), last, lastD, hiPct, closeOn};
}

/* 고른 날 뒤 성적 — 묶음 · 같은 날 값끼리만(날이 다르면 「?」) · 가장 나쁜 곳 · 가장 좋은 곳 · 못 받은 곳 수 */
function perfSum(G, per) {
  const ok = G.picks.filter(p => per.get(p.code) && !per.get(p.code).miss), miss = G.picks.length - ok.length;
  if (!ok.length) return {none: true, miss};
  const days = [...new Set(ok.map(p => per.get(p.code).d))];
  if (days.length > 1) return {mixed: true, miss};
  const d = days[0], f = per.get(ok[0].code);
  if (d === G.asOf) return {zero: true, miss};
  const ws = ok.reduce((s, p) => s + p.w, 0), r = ok.reduce((s, p) => s + p.w * per.get(p.code).r, 0) / ws;
  const worst = ok.reduce((a, p) => (per.get(p.code).r < per.get(a.code).r ? p : a)), best = ok.reduce((a, p) => (per.get(p.code).r > per.get(a.code).r ? p : a)); // 같으면 번호 작은 곳(picks 는 번호 차례)
  return {r, kr: f.kr, n: f.n, d, miss, k: ok.length, worst, best};
}
/** 카드 한 줄 — 이 회사 · 같은 때 코스피 */
function perfLine(G, x) {
  const el = h('p', {class: 'gdr-perf'});
  if (!x) el.append(h('span', {text: '고른 날 뒤 성적을 셈하는 중…'}));
  else if (x.miss) el.append(h('span', {text: '? 고른 날 뒤 값을 못 받았어요.'}));
  else if (x.zero) el.append(h('span', {text: `고른 날(${md(G.asOf)}) 뒤로 아직 잴 날이 없어요.`}));
  else el.append(h('span', {text: `고른 날(${md(G.asOf)}) 뒤 이 회사 `}), pctEl(x.r), h('span', {text: ' · 같은 때 코스피 '}), x.kr == null ? h('b', {class: 'num q', text: '?'}) : pctEl(x.kr));
  return el;
}
/** 성적 칸 — 나빠도 숨기지 않음([6] 4) */
function perfBox(el, G, per) {
  const head = h('h3', {class: 'gdr-ph', text: '고른 날 뒤 성적'});
  if (!per) { el.replaceChildren(head, h('p', {class: 'gdr-pl', text: '셈하는 중…'})); return; }
  const S = perfSum(G, per), kids = [head];
  if (S.none) kids.push(h('p', {class: 'gdr-pl'}, h('b', {class: 'gdr-qm', text: '? '}), h('span', {text: `${NAME} 칸 회사의 지금 값을 하나도 못 받았어요.`})));
  else if (S.mixed) kids.push(h('p', {class: 'gdr-pl'}, h('b', {class: 'gdr-qm', text: '? '}), h('span', {text: '날짜가 달라 묶음은 못 셌어요. 카드마다 봐 주세요.'})));
  else if (S.zero) kids.push(h('p', {class: 'gdr-pl', text: `고른 날(${md(G.asOf)}) 종가가 마지막 자료라 아직 잴 날이 없어요. 자료가 새로 오면 같은 때 코스피와 함께 보여 줄게요.`}));
  else {
    kids.push(h('p', {class: 'gdr-pl gdr-pd', text: `${md(G.asOf)} → ${md(S.d)} · ${S.n == null ? '?' : S.n}거래일`}),
      h('p', {class: 'gdr-pr'}, h('span', {text: `${NAME} 칸 ${S.k}곳 묶음(비중대로) `}), pctEl(S.r)),
      h('p', {class: 'gdr-pr'}, h('span', {text: '같은 때 코스피 '}), S.kr == null ? h('b', {class: 'num q', text: '?'}) : pctEl(S.kr)));
    if (S.kr == null) kids.push(h('p', {class: 'gdr-pl'}, h('b', {class: 'gdr-qm', text: '? '}), h('span', {text: '같은 날 코스피 값이 자료에 없어 견주지 못했어요.'})));
    else { const df = S.r - S.kr, z = one(df) === '0.0'; kids.push(h('p', {class: 'gdr-pl', text: z ? '코스피와 거의 같아요.' : `코스피보다 ${one(df)}%p ${df > 0 ? '높아요' : '낮아요'}.`})); }
    if (S.k >= 2) for (const [lab, p] of [['가장 나쁜 곳 ', S.worst], ['가장 좋은 곳 ', S.best]])
      kids.push(h('p', {class: 'gdr-pl'}, h('span', {text: lab + p.no + '번 '}), h('span', {'data-proper': '', text: p.name}), h('span', {text: ' '}), pctEl(per.get(p.code).r)));
    kids.push(h('p', {class: 'gdr-pl gdr-pn', text: '시장이 오르면 아무 회사나 올라요. 그래서 같은 때 코스피와 같이 봐요. 날이 적을수록 우연이 커요.'}));
  }
  if (S.miss) kids.push(h('p', {class: 'gdr-pl'}, h('b', {class: 'gdr-qm', text: '? '}), h('span', {text: `${S.miss}곳은 지금 값을 못 받아 묶음에서 뺐어요.`})));
  el.replaceChildren(...kids);
}
/** 못 돌린 날([8] 1) — 고른 날 종가 → 사이트 마지막 종가(두 날짜를 박음 · 사실만 · 두 값 모두 회사 파일 close × days.json 날짜 — 그 날이 파일에 없을 때만 gdr.json 값) */
function staleLine(G, p, I) {
  const p0 = I?.closeOn?.(G.asOf) ?? (p.price > 0 ? p.price : null), p1 = I?.last ?? null, d1 = I?.lastD ?? null;
  return h('p', {class: 'gdr-stl', text: `고른 날 ${md(G.asOf)} ${p0 ? wonP(p0) : '?'} → ${d1 ? md(d1) : '?'} ${p1 ? wonP(p1) : '?'}`});
}
/** PER · PBR · 회사 크기 · 1년 꼭대기 대비 한 줄([8] 9) — 조각마다 글 하나(영어 사전이 한 조각씩 맞춤) · 없으면 「?」 */
function valLine(I) {
  if (I === undefined) return h('p', {class: 'gdr-val', text: '회사 값을 받는 중…'});
  const per = I?.per ?? null, pbr = I?.pbr ?? null, cap = I?.cap ?? null, hp = I?.hiPct ?? null, sep = () => h('span', {class: 'gdr-vs', text: ' · '});
  return h('p', {class: 'gdr-val'},
    h('span', {text: `PER ${per == null ? '?' : dec(per, 1)}`}), sep(),
    h('span', {text: `PBR ${pbr == null ? '?' : dec(pbr, 2)}`}), sep(),
    h('span', {text: `회사 크기 ${cap == null ? '?' : eok(cap)}`}), sep(),
    h('span', {text: `1년 꼭대기 대비 ${hp == null ? '?' : NX.pct(hp)}`}));
}

/** gdr-v2 가까스로 넘음 — near(문 열쇠 g1 ~ g5 또는 문턱 열쇠) → 문 이름들 */
function nearNames(G, p) {
  const R = rulesOf(G), out = [];
  for (const k of Array.isArray(p.near) ? p.near : []) {
    const m = /^g([1-5])$/.exec(String(k)) ?? /^g([1-5])$/.exec(String(R.find(r => r.key === k)?.gate ?? '')), nm = m ? GATES_KO[+m[1] - 1] : null;
    if (nm && !out.includes(nm)) out.push(nm);
  }
  return out;
}
/** gdr-v2 가까스로 넘음 한 줄 */
function nearLine(G, p) {
  const names = nearNames(G, p); if (!names.length) return null;
  const kids = [h('span', {class: 'gdr-wk', text: '가까스로 넘음 '})];
  names.forEach((n, i) => { if (i) kids.push(h('span', {class: 'gdr-vs', text: ', '})); kids.push(h('span', {text: n})); });
  return h('p', {class: 'gdr-near'}, ...kids);
}
/** gdr-v2 몬테카를로 한 줄 + 무엇을 넣어 셈했나(접음) — 정수 범위만 · 「모형 가정 아래 추정 · 검증 전」(규칙 49) */
function mcLines(p) {
  const m = p.mc; if (!m || !Number.isInteger(m.lo) || !Number.isInteger(m.hi) || m.lo < 0 || m.hi < m.lo) return [];
  const of = Number.isInteger(m.of) && m.of > 0 ? m.of : 10, hz = m.h === 20 ? '한 달 뒤 ' : '', inn = Array.isArray(m.in) ? m.in.filter(x => typeof x === 'string' && x.trim()).join(' ') : typeof m.in === 'string' ? m.in.trim() : '';
  return [h('p', {class: 'gdr-mc'}, h('span', {class: 'gdr-wk', text: hz + '고른 날 값보다 위 '}), h('b', {class: 'num', text: `${of}번 중 ${m.lo}~${m.hi}번`}), h('span', {class: 'gdr-vs', text: ' · '}), h('span', {class: 'gdr-vs', text: '모형 가정 아래 추정 · 검증 전'})),
    ...(inn ? [foldP('gdr-mcin', '무엇을 넣어 셈했나', h('p', {class: 'gdr-wb', text: inn}))] : [])];
}

/** 카드 하나 — 번호 · 업종 · 이유 한 줄 · 틀린다면 이유 · (가까스로 넘음) · (못 돌린 날 값) · 고른 날 뒤 성적 · 회사 값 한 줄 · (몬테카를로) · 비중 · 격언(있을 때만) */
function card(G, p, X) {
  const I = X ? X.info.get(p.code) ?? null : undefined, stale = !!(X?.site && G.asOf && G.asOf < X.site), say = G.sayings?.[p.saying], near = nearLine(G, p);
  return h('div', {class: 'gdr-card', id: 'gdr-' + p.no},
    h('a', {class: 'gdr-name', href: '#/w/' + NX.enc(p.code), 'data-proper': '', text: p.name}),
    h('p', {class: 'gdr-ind'}, h('b', {class: 'num', text: p.no + '번'}), h('span', {text: ' · ' + p.ind})),
    h('p', {class: 'gdr-why', text: reasonTxt(p.reason)}),
    h('p', {class: 'gdr-wrong'}, h('span', {class: 'gdr-wk', text: '틀린다면 이유 '}), typeof p.wrong === 'string' && p.wrong.trim() ? h('span', {text: p.wrong}) : h('span', {}, h('b', {class: 'gdr-qm', text: '? '}), h('span', {text: '아직 못 셌어요.'}))),
    ...(near ? [near] : []),
    ...(stale ? [staleLine(G, p, I)] : []),
    perfLine(G, X ? X.per.get(p.code) : null),
    valLine(I),
    ...mcLines(p),
    h('p', {class: 'gdr-w'}, h('span', {class: 'gdr-wk', text: '비중 '}), h('b', {class: 'num', text: wTxt(p.w)})),
    ...(typeof say === 'string' && say ? [h('p', {class: 'gdr-say'}, h('span', {class: 'gdr-sayk', text: '격언 '}), h('q', {'data-proper': '', text: say}))] : []));
}

/** 목록 문 · 분기 숫자를 못 받았을 때의 「?」 줄 — v1 은 관리 종목 수(counts.managed)가 없을 때 · v2 는 status.lists / status.quarters 가 'ok' 가 아닐 때 */
/** 고른 곳이 0 인 까닭이 자료가 아직 안 온 것이면 쉬운 말로 밝힘(「?」 — 지어낸 곳 없음 · 사장님 2026-10-18 낮 「목록 · 분기 숫자가 아직 안 와서 오늘은 고르지 못했다고 분명히」) */
function noneWarn(G) {
  if (G.picks.length) return null;
  const st = G.status ?? {}, why = String(G.counts?.why ?? ''), L = st.lists === 'missing' || (st.lists == null && why.includes('lists')), Q = st.quarters === 'missing' || (st.quarters == null && why.includes('quarters'));
  if (!L && !Q) return null;
  const what = L && Q ? '목록과 분기 숫자가' : L ? '목록이' : '분기 숫자가', notes = (Array.isArray(G.note) ? G.note : []).filter(x => typeof x === 'string' && x.trim());
  return h('details', {class: 'gdr-wd gdr-q gdr-none'}, h('summary', {class: 'gdr-wq'}, h('b', {class: 'gdr-qm', text: '? '}), h('span', {text: what}), h('span', {text: ' 아직 안 와서 지금은 담을 곳이 없어요'})),
    ...notes.map(t => h('p', {class: 'gdr-wb', text: t.trim()})), h('p', {class: 'gdr-wb', text: '못 본 채로 고르면 지어낸 것이 되니까 하나도 담지 않았어요. 전부 현금으로 둬요.'}));
}
function qWarns(G) {
  const none = noneWarn(G); if (none) return [none];
  const out = [], st = G.status;
  if (st ? st.lists !== 'ok' : G.counts?.managed == null) out.push(warnP('gdr-q', '관리 종목은 아직 못 걸렀어요', '투자 경고도 아직 못 걸렀어요. 사기 전에 꼭 확인해.'));
  if (st && st.quarters === 'missing') out.push(warnP('gdr-qq', '분기 숫자를 아직 못 받았어요', '이익 문은 분기 숫자가 있어야 봐요. 지금은 모두 「?」로 두고 못 지난 걸로 쳐요.'));
  return out;
}
/** gdr-v2 큰 업종 비중 합(위 끝) · 세 곳이 함께 내린 날 — 있을 때만 */
function bigNotes(G) {
  if (!G.picks.length) return [];
  const out = [], bigs = G.bigs && typeof G.bigs === 'object' && !Array.isArray(G.bigs) ? Object.entries(G.bigs).filter(([, v]) => fin(v) != null).sort((a, b) => b[1] - a[1] || (a[0] < b[0] ? -1 : 1)) : [], cap = fin(G.limits?.bigCap);
  if (bigs.length) {
    const kids = [h('span', {text: cap == null ? '큰 업종 비중 합 ' : `큰 업종 비중 합(위 끝 ${wTxt(cap)}) `})];
    bigs.slice(0, 6).forEach(([k, v], i) => { if (i) kids.push(h('span', {class: 'gdr-vs', text: ' · '})); kids.push(h('span', {text: k + ' '}), h('b', {class: 'num', text: wTxt(Math.round(v * 10) / 10)})); });
    out.push(h('p', {class: 'gdr-note gdr-bigs'}, ...kids));
  }
  const f = G.fall3;
  if (f && typeof f === 'object') out.push(h('p', {class: 'gdr-note gdr-fall3'}, ...(Number.isInteger(f.n) && f.n >= 0 ? [h('span', {text: '세 곳이 함께 내린 날 '}), h('b', {class: 'num', text: f.n + '일'})] : [h('b', {class: 'gdr-qm', text: '? '}), h('span', {text: '세 곳이 함께 내린 날은 담은 곳이 셋 아래라 못 셌어요.'})])));
  return out;
}

/** 첫 화면 칸 · #/gdr — open = 처음 열어 둘 번호 · 열한 질문을 마치기 전에는 잠금([6] 1) · 쉬어 가는 날은 닫음([5] 7) */
export function gdrSection(G, opt = {}) {
  const {page = false, open = null} = opt;
  if (!opened()) return lockBox(G, opt);
  const T = today();
  if (T?.verdict === 'rest') return restBox(G, opt);
  const box = h('section', {class: 'gdr' + (page ? ' page' : ''), 'aria-label': `${NAME} 칸`});
  if (T) box.append(todayLine(T));
  if (!G || !Array.isArray(G.picks)) { box.append(h('h2', {class: 'gdr-h', text: `${NAME} 칸`}), h('p', {class: 'gdr-note gdr-miss', text: `? ${NAME} 칸 자료를 못 받았어요. 잠시 뒤 다시 열어 주세요.`})); return watch(box, G, opt); }
  let openNo = open, X = null;
  const cash = G.counts?.cash ?? 0, wsum = G.picks.reduce((s, p) => s + p.w * 10, 0) / 10;
  const stalePh = h('div', {hidden: ''}), cells = h('div', {class: 'gdr-cells', role: 'list'}), slot = h('div', {class: 'gdr-slot', 'aria-live': 'polite'}), pbox = h('div', {class: 'gdr-pf', 'aria-live': 'polite'});
  const btns = new Map(G.picks.map(p => {
    const b = h('button', {class: 'gdr-cell', type: 'button', 'aria-expanded': 'false', 'aria-controls': 'gdr-' + p.no},
      h('span', {class: 'gdr-cn', 'data-proper': '', text: p.name}),
      h('span', {class: 'gdr-m'}, h('span', {class: 'gdr-no num', text: p.no + '번'}), h('span', {class: 'gdr-vs', text: ' · '}), h('span', {class: 'gdr-cw num', text: wTxt(p.w)})));
    b.addEventListener('click', () => { openNo = openNo === p.no ? null : p.no; show(); });
    return [p.no, b];
  }));
  cells.append(...G.picks.map(p => h('div', {class: 'gdr-li', role: 'listitem'}, btns.get(p.no))),
    h('div', {class: 'gdr-li', role: 'listitem'}, h('div', {class: 'gdr-cell cash'}, h('span', {class: 'gdr-no', text: '현금으로 둠'}), h('span', {class: 'gdr-cw num', text: wTxt(cash)}))));
  const show = () => { // 단추는 그대로 두고 표시만 바꿈(누른 단추에 초점이 남음)
    for (const [no, b] of btns) { b.classList.toggle('on', no === openNo); b.setAttribute('aria-expanded', String(no === openNo)); }
    const P = G.picks.find(p => p.no === openNo);
    slot.replaceChildren(...(P ? [card(G, P, X)] : []));
  };
  box.append(
    h('div', {class: 'gdr-head'}, h('div', {class: 'gdr-ht'}, h('h2', {class: 'gdr-h', text: `${NAME} 칸 ${G.picks.length}곳`}), h('p', {class: 'gdr-sub', text: `${md(G.asOf)} 종가 · 곳마다 비중과 이유`})),
      h('img', {src: '/media/makbi-icon.svg', alt: '', width: 40, height: 40})),
    cells, slot,
    h('p', {class: 'gdr-sum'}, h('span', {text: '비중 합 '}), h('b', {class: 'num', text: wTxt(Math.round((wsum + cash) * 10) / 10)})),
    ...(G.picks.length ? [pbox] : []),
    h('p', {class: 'gdr-note', text: `${NAME} 생각일 뿐이에요. 지난 기록으로 나눠 본 거고, 정하는 건 친구야.`}),
    stalePh, // 사이트 자료가 더 새면 자료가 온 뒤 여기에 밝힘(카드마다 두 값은 staleLine)
    ...qWarns(G),
    ...bigNotes(G),
    ...(!G.picks.length ? (noneWarn(G) ? [] : [h('p', {class: 'gdr-note', text: '지금은 담을 곳이 없어요. 전부 현금으로 둬요.'})])
      : G.picks.length < maxOf(G) ? [h('p', {class: 'gdr-note', text: `조건을 다 지난 곳이 ${G.picks.length}곳뿐이라 그만큼만 골랐어요. 남는 몫은 현금으로 둬요.`})] : []),
    ...(page ? [] : [h('a', {class: 'more', href: '#/gdr', text: '어떻게 골랐나 보기 ›'})]));
  show();
  perfBox(pbox, G, null);
  const staleNote = () => { if (X?.site && G.asOf && G.asOf < X.site && stalePh.isConnected) stalePh.replaceWith(warnP('gdr-stale', `고른 날은 ${md(G.asOf)} 종가예요`, `사이트 자료는 ${md(X.site)}까지라 지금 값과 다를 수 있어요.`)); };
  dataOf(G).then(x => { X = x; perfBox(pbox, G, x.per); show(); staleNote(); })
    .catch(() => { X = {per: new Map(G.picks.map(p => [p.code, {miss: true}])), info: new Map(), site: null}; perfBox(pbox, G, X.per); show(); });
  return watch(box, G, opt);
}

/** 어떻게 골랐나 — 상장 종목부터 고도리 칸까지 수(gdr.json counts) · 기준 숫자는 쉬운 말로 */
function funnel(G) {
  if (isV2(G)) return funnel2(G);
  const c = G.counts ?? {}, R = G.rules ?? {}, n = x => (x == null ? '?' : Number(x).toLocaleString('ko-KR'));
  const li = (a, b) => h('li', {}, h('span', {text: a}), h('b', {class: 'num', text: b}));
  return h('section', {class: 'gdr-fun', 'aria-label': '어떻게 골랐나'},
    h('h2', {class: 'sec', text: '어떻게 골랐나'}),
    h('ol', {class: 'gdr-ol'},
      li('상장된 모든 종목', n(c.listed) + '개'),
      li('그 가운데 회사 주식', n(c.companies) + '곳'),
      li('거래가 너무 적어 뺀 곳', n(c.outThin) + '곳'),
      li('거래가 멈춰 뺀 곳', n(c.outHalt) + '곳'),
      li('관리 종목으로 뺀 곳', c.managed == null ? '? 아직 못 거름' : n(c.managed) + '곳'),
      li('남은 곳', n(c.afterOut) + '곳'),
      li('이익 늘었나', n(c.g1) + '곳'),
      li('아직 조용한가', n(c.g2) + '곳'),
      li('석 달 천천히 올랐나', n(c.g3) + '곳'),
      li('두 배 넘게 안 올랐나', n(c.g4) + '곳'),
      li('돈 들어오는 업종인가', n(c.g5) + '곳'),
      li('조건 다섯을 다 지난 곳', n(c.passAll) + '곳'),
      li(`${NAME} 칸`, n(c.picked) + '곳'),
      li('현금으로 둠', wTxt(c.cash ?? 0))),
    h('h2', {class: 'sec', text: '기준 숫자'}),
    h('ul', {class: 'gdr-ul'},
      h('li', {text: `거래가 너무 적음: 최근 한 달 하루 평균 거래대금이 ${n((R.thin ?? 0) / 1e8)}억 원보다 적은 곳`}),
      h('li', {text: '거래 멈춤: 최근 5거래일 가운데 거래가 없던 날이 있는 곳'}),
      h('li', {text: '이익 늘었나: 마지막 해 영업이익이 0보다 크고 그 앞 해보다 많은 곳'}),
      h('li', {text: `아직 조용한가: 최근 한 달 거래대금이 그 앞 120거래일 평균의 ${R.quietX ?? '?'}배 안이고, 5일 오름이 ${R.hot5 ?? '?'}% 아래인 곳`}),
      h('li', {text: `석 달 천천히 올랐나: 60거래일 동안 ${R.r60?.[0] ?? '?'} ~ ${R.r60?.[1] ?? '?'}% 오르고, 하루에 ${R.jump ?? '?'}% 넘게 뛴 날이 없고, 그 사이 가장 높은 값의 ${Math.round((R.keep ?? 0) * 100)}% 위에 있는 곳`}),
      h('li', {text: `두 배 넘게 안 올랐나: 지난 250거래일 가장 낮은 값의 ${R.low2x ?? '?'}배 아래인 곳`}),
      h('li', {text: `돈 들어오는 업종인가: 업종 거래대금이 앞 60거래일보다 ${R.indX ?? '?'}배 넘게 늘고, 업종 회사들이 한 달 동안 가운데 값으로 오른 곳`}),
      h('li', {text: '고르기: 영업이익이 많이 는 차례로 한 업종 세 곳까지, 서른여섯 곳까지'}),
      h('li', {text: '비중: 1 ~ 12번 3% · 13 ~ 24번 2.5% · 25 ~ 36번 2% · 남는 몫은 현금으로 둠'})));
}

/** G2b 지난 성적 한 줄(site/next/data/gdr-back.json — 같은 규칙으로 날마다 골랐다면 · 나빠도 실음) — 파일이 없거나 못 읽으면 아무것도 안 그림 · line.side(규칙이 다른 참고 줄)는 보이지 않음 */
let backP = null;
const backOf = () => (backP ??= fetch('/next/data/gdr-back.json', {cache: 'no-cache'}).then(r => (r.ok ? r.json() : null)).then(j => { const l = j?.line; return l && typeof l.ko === 'string' && l.ko.trim() ? {ko: l.ko.trim(), more: (Array.isArray(l.more) ? l.more : []).filter(x => typeof x === 'string' && x.trim()).map(x => x.trim())} : null; }).catch(() => null));
function backNodes(B) {
  return [h('p', {class: 'gdr-back', text: B.ko}), ...(B.more.length ? [foldP('gdr-bk', '더 보기', ...B.more.map(t => h('p', {class: 'gdr-wb', text: t})))] : [])];
}
/** gdr-v2 한 달 전 채점(score) — 한 줄 + 곳마다(접음) · 다시 셈한 것이면 밝힘 · 모형이 한 말(10번 중 lo~hi번)과 실제를 같이 */
function scoreNodes(G) {
  const S = G.score; if (!S || typeof S !== 'object' || !Number.isInteger(S.counted) || !Number.isInteger(S.up) || typeof S.from !== 'string' || typeof S.to !== 'string') return [];
  const rows = (Array.isArray(S.rows) ? S.rows : []).filter(r => r && typeof r.name === 'string' && fin(r.from) != null && fin(r.to) != null && Number.isInteger(r.lo) && Number.isInteger(r.hi));
  return [h('p', {class: 'gdr-score'}, h('span', {class: 'gdr-wk', text: '한 달 전 채점 '}), h('span', {text: `${md(S.from)} → ${md(S.to)} · ${S.counted}곳 가운데 `}), h('b', {class: 'num', text: S.up + '곳'}), h('span', {text: ' 올랐어요'}),
      ...(S.src === 'recomputed' ? [h('span', {class: 'gdr-vs', text: ' · 다시 셈한 것'})] : [])),
    ...(rows.length ? [foldP('gdr-sc', '곳마다 보기', ...rows.map(r => h('p', {class: 'gdr-wb'}, h('b', {class: 'num', 'data-proper': '', text: r.name}), h('span', {text: ` ${wonP(r.from)} → ${wonP(r.to)} `}), pctEl((r.to / r.from - 1) * 100), h('span', {class: 'gdr-vs', text: ' · 그때 모형 '}), h('b', {class: 'num', text: `10번 중 ${r.lo}~${r.hi}번`}))))] : [])];
}
/** gdr-v2 어떻게 골랐나 — 수 줄(목록 문 · 업종 자리 · 큰 업종 위 끝까지) · 기준 숫자(문턱마다 값과 왜 이 값인가) · 조금 움직이면 남는 곳 수(접음) */
function funnel2(G) {
  const c = G.counts ?? {}, rules = rulesOf(G), need = needOf(G), cnt = x => (x == null ? '?' : numTxt(x) + '곳');
  const li = (a, b) => h('li', {}, h('span', {text: a}), h('b', {class: 'num', text: b}));
  const sens = rules.filter(r => Array.isArray(r.sens) && r.sens.length);
  return h('section', {class: 'gdr-fun', 'aria-label': '어떻게 골랐나'},
    h('h2', {class: 'sec', text: '어떻게 골랐나'}),
    ...scoreNodes(G),
    h('ol', {class: 'gdr-ol'},
      li('상장된 모든 종목', c.listed == null ? '?' : numTxt(c.listed) + '개'),
      li('그 가운데 회사 주식', cnt(c.companies)),
      li('거래가 너무 적어 뺀 곳', cnt(c.outThin)),
      li('거래가 멈춰 뺀 곳', cnt(c.outHalt)),
      li('관리 종목으로 뺀 곳', c.outList == null || G.status?.lists === 'missing' ? '? 아직 못 거름' : cnt(c.outList)),
      li('남은 곳', cnt(c.afterOut)),
      ...GATES_KO.map((nm, i) => li(nm, i === 0 && G.status?.quarters === 'missing' ? '? 아직 못 셈' : cnt(c['g' + (i + 1)]))),
      li(need === 4 ? '조건 다섯 가운데 넷을 지난 곳' : '조건 다섯을 다 지난 곳', cnt(c.passAll)),
      li('한 업종 자리가 차서 뺀 곳', cnt(c.cutInd)),
      li('큰 업종 위 끝에 걸려 뺀 곳', cnt(c.cutBig)),
      li(`${NAME} 칸`, cnt(c.picked)),
      li('현금으로 둠', wTxt(c.cash ?? 0))),
    ...(rules.length ? [h('h2', {class: 'sec', text: '기준 숫자'}),
      h('ul', {class: 'gdr-ul'}, ...rules.map(r => h('li', {}, h('b', {class: 'gdr-rn'}, h('span', {text: r.name ?? ''}), h('span', {class: 'num', text: ' ' + unitTxt(r.v, r.unit)})), ...(typeof r.why === 'string' && r.why.trim() ? [h('span', {class: 'gdr-rw', text: r.why.trim()})] : [])))),
      ...(sens.length ? [foldP('gdr-sens', '조금 움직이면 남는 곳 수', ...sens.map(r => h('p', {class: 'gdr-wb'}, h('b', {class: 'num', text: (r.name ?? '') + ' '}),
        ...r.sens.slice(0, 3).flatMap((x, i) => [...(i ? [h('span', {class: 'gdr-vs', text: ' · '})] : []), h('span', {text: ['더 빡빡 ', '이 값 ', '더 느슨 '][i]}), h('b', {class: 'num', text: unitTxt(x?.v, r.unit)}), h('span', {class: 'gdr-vs', text: ' → '}), h('b', {class: 'num', text: cnt(x?.n)})]))))] : [])] : []));
}

export async function render(arg) {
  const [G] = await Promise.all([NX.gdr ? NX.gdr() : null, NX.need ? NX.need('mkt') : null]), no = /^\d+$/.test(String(arg ?? '')) ? +arg : null; // mkt = 사이트 자료 날짜(고른 날과 견줌)
  const fun = G && Array.isArray(G.picks) ? funnel(G) : null; // 잠겨 있거나 쉬어 가는 날이면 짧게(한 줄만) — 같은 화면에서 기록이 바뀌면 곁 깔때기도 따라감(sync)
  const sync = box => { if (!fun) return; const open = !box.classList.contains('lock1') && !box.classList.contains('rest1'); if (open && !fun.isConnected) box.after(fun); else if (!open) fun.remove(); };
  const nodes = [gdrSection(G, {page: true, open: no, sync})], on = opened() && today()?.verdict !== 'rest';
  if (fun) backOf().then(B => { if (B && !fun.querySelector('.gdr-back')) fun.querySelector('h2.sec')?.after(...backNodes(B)); }); // 지난 성적 한 줄 — 맨 위(제목 바로 밑)
  if (fun && on) nodes.push(fun);
  nodes.push(h('p', {class: 'safe', text: `${josa(NAME, '는')} 지난 기록만 보여 줘요. 나눠 담는 칸도 ${NAME} 생각이에요.`}));
  if (no && on) requestAnimationFrame(() => document.getElementById('gdr-' + no)?.scrollIntoView({block: 'center'}));
  return {title: `${NAME} 칸`, nodes};
}
