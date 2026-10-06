/* ATLAS 11 · 언어팩 — 영어판(/en/) · 중국어판(간체 · /zh/)
   사장님 2026-10-06 20:33 「친구가 중국 그리고 미국인이야 언어팩을 만들어 줘야해」
   · 한국어 화면 코드는 그대로 둔다 — 그려진 글자(글 · aria-label · title · placeholder · alt · data-speak · 창 제목)를 사전으로 바꾼다
     한국어판(/ · /us/)에서는 아무것도 하지 않는다 → 한국어 화면 · 화면 검사 그대로
   · 사전 열쇠 = 「틀」: 날짜 「10월 6일(화)」 → {d} · 시각 「15:30」 → {t} · 회사 · 업종 · 갈래 · 지수 이름 → {e} · 숫자 → {n} · 원문 「…」 → {q}
     번역 틀에서 {n} {e} … 는 나온 차례대로 채움({n2} 처럼 번호를 달면 그 번째) · {pl:한|여럿} = 바로 앞 숫자가 1이면 앞 말
   · 원문(기사 · 공시 제목 · 사장님 말씀 · 업데이트 기록 글)은 lang="ko" 로 표시돼 바꾸지 않는다
   · 사전에 없는 틀은 「 · 」(괄호 밖)로 나눠 조각마다 다시 찾는다 — 그래도 없으면 한국어 그대로(scripts/atlas11/i18n_check.mjs 가 남은 한국어를 센다) */
export const LANG = (() => { try { return /^\/(en|zh)(?=\/|$)/.exec(location.pathname)?.[1] ?? 'ko'; } catch { return 'ko'; } })();
export const LOCALE = {ko: 'ko-KR', en: 'en-US', zh: 'zh-CN'}[LANG];
export const ON = LANG !== 'ko';
const HAN = /[가-힣]/, WORD = /[A-Za-z0-9가-힣]/, PARTICLE = /^[은는이가의을를도와과에로만]/;
const WD = {월: 1, 화: 2, 수: 3, 목: 4, 금: 5, 토: 6, 일: 0};
const WD_EN = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'], WD_ZH = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
const MON_EN = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
let T = {}, CO = {}, E = new Map(), entRe = null; // CO = 잘 알려진 한국 회사 영어 이름(코드 → 이름)
const cache = new Map(), misses = new Set();

/** 날짜 한 개를 그 말로 — 「10월 6일(화)」 → Oct 6 (Tue) · 10月6日(周二) · 해가 있으면 Jan 2, 2025 · 2025年1月2日 */
const fmtDate = (y, m, d, w) => LANG === 'en' ? `${MON_EN[m - 1]} ${d}${y ? `, ${y}` : ''}${w != null ? ` (${WD_EN[w]})` : ''}` : `${y ? `${y}年` : ''}${m}月${d}日${w != null ? `(${WD_ZH[w]})` : ''}`;

/** 만 · 억 · 조(주 · 원) — 영어는 다 풀어 쓴다(12만주 → 120,000주) · 중국어는 万 · 亿 로 그대로 둔다(틀에서) */
const UNIT = {만: 1e4, 억: 1e8, 조: 1e12};
const expandUnits = s => LANG !== 'en' ? s : s.replace(/([+−\-]?)(\d[\d,]*(?:\.\d+)?)(만|억|조)(?=주|원|\s|$|\)|,|·)/g, (_, sg, n, u) => {
  const v = Number(n.replace(/,/g, '')) * UNIT[u]; return Number.isFinite(v) ? sg + Math.round(v).toLocaleString('en-US') : _;
});

/** 이름(회사 · 업종 · 갈래 · 지수) 더하기 — 판을 읽은 뒤 · 한국 이름 → 그 말 이름 */
export function addEntities(map) {
  if (!ON || !map) return;
  for (const [ko, x] of Object.entries(map)) if (ko && x && ko !== x && HAN.test(ko)) E.set(ko, x);
  const keys = [...E.keys()].sort((a, b) => b.length - a.length).map(k => k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  entRe = keys.length ? new RegExp(keys.join('|'), 'g') : null; cache.clear();
}
const okEdge = (s, i, len) => {
  const prev = s[i - 1] ?? '', next = s.slice(i + len);
  if (prev && WORD.test(prev)) return false;
  return !next || !WORD.test(next[0]) || PARTICLE.test(next) && !WORD.test(next[1] ?? '');
};

/** 한국어 글 → 틀 + 값 */
export function templateOf(s) {
  const v = {d: [], t: [], e: [], n: [], q: []};
  let x = String(s).replace(/「([^」]*)」/g, (_, q) => { v.q.push(q); return '{q}'; });
  x = x.replace(/(?:(\d{4})년\s?)?(\d{1,2})월\s?(\d{1,2})일(?:\((월|화|수|목|금|토|일)\))?/g, (_, y, m, d, w) => { v.d.push([y ? +y : null, +m, +d, w ? WD[w] : null]); return '{d}'; });
  x = x.replace(/\b\d{1,2}:\d{2}(?::\d{2})?\b/g, m => { v.t.push(m); return '{t}'; });
  if (entRe) { let out = '', last = 0; for (const m of x.matchAll(entRe)) { if (!okEdge(x, m.index, m[0].length)) continue; out += x.slice(last, m.index) + '{e}'; v.e.push(m[0]); last = m.index + m[0].length; } x = out + x.slice(last); }
  x = x.replace(/[+−\-±]?\d[\d,]*(?:\.\d+)?/g, m => { v.n.push(m); return '{n}'; });
  return {key: x, v};
}
function fill(tr, v) {
  const at = {d: 0, t: 0, e: 0, n: 0, q: 0}; let lastN = null;
  return tr.replace(/\{(d|t|e|n|q)(\d*)\}|\{pl:([^|}]*)\|([^}]*)\}/g, (all, k, idx, one, many) => {
    if (one != null || many != null) return lastN != null && Math.abs(Number(String(lastN).replace(/[^\d.\-]/g, ''))) === 1 ? one : many;
    const i = idx ? Number(idx) - 1 : at[k]++; const val = v[k][i];
    if (val == null) return '';
    if (k === 'd') return fmtDate(...val);
    if (k === 'e') return E.get(val) ?? val;
    if (k === 'n') { lastN = val; return val; }
    if (k === 'q') return `“${t(val)}”`; // 「…」 안 글(화면 이름 · 단추 이름)도 그 말로
    return val;
  });
}
/** 괄호 밖의 「 · 」로 나눔 */
function splitTop(s, sep) {
  const out = []; let depth = 0, cur = '';
  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    if (c === '(' || c === '「' || c === '[') depth++; else if ((c === ')' || c === '」' || c === ']') && depth > 0) depth--;
    if (!depth && s.startsWith(sep, i)) { out.push(cur); cur = ''; i += sep.length - 1; continue; }
    cur += c;
  }
  out.push(cur); return out;
}
const SEPS = [' · ', ' — ', ' → ', ': '];
function tr(core, depth = 0) {
  if (!HAN.test(core)) return core;
  const {key, v} = templateOf(core);
  if (T[key] != null) return fill(T[key], v);
  if (!HAN.test(key)) return fill(key, v); // 이름 · 날짜만 있는 글
  for (const sep of SEPS) {
    const parts = splitTop(core, sep);
    if (parts.length > 1 && depth < 6) return parts.map(p => { const lead = p.match(/^\s*/)[0], tail = p.match(/\s*$/)[0]; return lead + tr(p.trim(), depth + 1) + tail; }).join(sep);
  }
  misses.add(key); return core;
}
/** 글 하나를 그 말로(앞뒤 빈칸은 그대로 · 같은 글은 한 번만 셈) */
export function t(s) {
  if (!ON || s == null) return s;
  const str = String(s).replace(/\u200b/g, ''); if (!HAN.test(str)) return str; // 줄바꿈 자리 표시(ZWSP)는 떼고 셈
  if (cache.has(str)) return cache.get(str);
  const lead = str.match(/^\s*/)[0], tail = str.match(/\s*$/)[0], core = str.slice(lead.length, str.length - tail.length);
  const out = lead + tr(expandUnits(core)) + tail;
  cache.set(str, out); return out;
}
export const missing = () => [...misses];

/* ---- 화면 바꾸기(그려진 뒤 · 새로 그려질 때마다) ---- */
const ATTRS = ['aria-label', 'title', 'placeholder', 'alt', 'data-speak']; // data-orig-attr="title" 이면 그 칸은 원문(출처 이름 같은)
const skip = el => !el || el.closest?.('[lang="ko"], script, style, noscript');
function doText(n) { const p = n.parentElement; if (skip(p)) return; const s = n.nodeValue; if (!HAN.test(s)) return; const o = t(s); if (o !== s) n.nodeValue = o; }
function doEl(el) {
  if (skip(el)) return;
  const keep = el.getAttribute?.('data-orig-attr')?.split(' ') ?? [];
  for (const a of ATTRS) { if (keep.includes(a)) continue; const s = el.getAttribute?.(a); if (s && HAN.test(s)) { const o = t(s); if (o !== s) el.setAttribute(a, o); } }
}
export function translateTree(root) {
  if (!ON || !root) return;
  if (root.nodeType === 3) return doText(root);
  if (root.nodeType !== 1 && root.nodeType !== 9 && root.nodeType !== 11) return;
  if (root.nodeType === 1) doEl(root);
  const w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT);
  for (let n = w.nextNode(); n; n = w.nextNode()) { if (n.nodeType === 3) doText(n); else doEl(n); }
}
let obs = null;
/** 사전 넣기(틀 · 손으로 고른 회사 영어 이름 · 이름) — 화면은 startI18n 이, 시험은 바로 */
export function useDict(j) { T = j?.templates ?? {}; CO = j?.companies ?? {}; addEntities(j?.entities ?? {}); cache.clear(); }
/** 언어판이면: 사전을 읽고 · 창 제목 · 문서 말을 바꾸고 · 이후 그려지는 것을 모두 바꾼다 */
export async function startI18n() {
  if (!ON) return;
  document.documentElement.lang = LANG === 'zh' ? 'zh-CN' : 'en';
  try { const r = await fetch(new URL(`./i18n/${LANG}.json`, import.meta.url), {cache: 'no-cache'}); if (r.ok) useDict(await r.json()); } catch {} // 사전은 이 파일 옆(/app/i18n/ · /us/app/i18n/)
  document.title = t(document.title);
  translateTree(document.body);
  obs = new MutationObserver(list => {
    for (const m of list) {
      if (m.type === 'characterData') doText(m.target);
      else if (m.type === 'attributes') doEl(m.target);
      else for (const n of m.addedNodes) translateTree(n);
    }
  });
  obs.observe(document.body, {subtree: true, childList: true, characterData: true, attributes: true, attributeFilter: ATTRS});
}
/** 영어 이름이 없는 한국 이름 → 로마자(국어의 로마자 표기법 · 소리 바뀜 규칙은 생략) — 「미래에셋」 → Miraeeset */
const RI = ['g', 'kk', 'n', 'd', 'tt', 'r', 'm', 'b', 'pp', 's', 'ss', '', 'j', 'jj', 'ch', 'k', 't', 'p', 'h'];
const RM = ['a', 'ae', 'ya', 'yae', 'eo', 'e', 'yeo', 'ye', 'o', 'wa', 'wae', 'oe', 'yo', 'u', 'wo', 'we', 'wi', 'yu', 'eu', 'ui', 'i'];
const RF = ['', 'k', 'k', 'k', 'n', 'n', 'n', 't', 'l', 'k', 'm', 'l', 'l', 'l', 'p', 'l', 'm', 'p', 'p', 't', 't', 'ng', 't', 't', 'k', 't', 'p', 't'];
export const romanize = s => String(s).replace(/[가-힣]+/g, w => { const r = [...w].map(ch => { const c = ch.charCodeAt(0) - 0xAC00; return RI[Math.floor(c / 588)] + RM[Math.floor((c % 588) / 28)] + RF[c % 28]; }).join(''); return r.charAt(0).toUpperCase() + r.slice(1); });
/** 판을 읽은 뒤: 회사 이름(한국 판 = 영어 이름 사전 · 없으면 로마자 · 미국 판 = 판의 nameEn) — 법인 꼬리말은 뗌 */
const LEGAL = /[\s,.]*\b(?:co\.?\s*,?\s*ltd|inc|incorporated|corp|corporation|ltd|limited|plc|n\.\s?v|s\.\s?a|se|ag|l\.\s?p|lp)\.?\s*$/i, TAIL_CO = /(?<!&|\band)[\s,]+co\.?\s*$/i; // 「& Co」 · 「and Co」 는 이름의 일부
const tidy = s => { let x = String(s ?? '').replace(/\s+/g, ' ').trim(), y; do { y = x; x = x.replace(LEGAL, '').replace(TAIL_CO, '').trim(); } while (x !== y && x); return x.replace(/[\s,]+$/, '') || String(s ?? '').trim(); };
const MARKET = /^(KOSPI|KOSDAQ|KONEX|KRX)$/i, okName = s => (s && !MARKET.test(String(s).trim()) ? s : null);
export function addBoardNames(board, namesKr) {
  if (!ON || !board?.companies) return;
  const m = {};
  for (const c of board.companies) { const en = okName(c.nameEn) ?? okName(CO[c.code]) ?? okName(namesKr?.[c.code]?.nameEn); m[c.name] = en ? tidy(en) : romanize(c.name); if (en && !c.nameEn) c.nameEn = tidy(en); } // 미국 판 영어 이름 → 손으로 고른 이름 → 야후 영문 정식 이름 → 로마자 · 한국 회사도 영어 이름으로 찾기(찾기 find.js 가 nameEn 을 봄 · 언어판에서만)
  addEntities(m);
  if (typeof document !== 'undefined') translateTree(document.body);
}
