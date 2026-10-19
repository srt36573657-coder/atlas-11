/* 보드리(새 화면 /next/) 영어 팩 — 2026-10-17 지금 아틀란스 site/atlas/i18n.js 에서 떼어 온 사본(그 뒤로 /atlas/ 는 손대지 않음 · 사장님 15:54) · 사전 = /next/i18n/(빌드 scripts/atlas11/next/i18n_build.mjs)
   옛 머리글: 새 ATLAS · 영어 팩 — 한 주소(aaa7377.com)에서 맨 위 언어 단추로 한국어 · English
   사장님 2026-10-15(싱가포르) 23:30 「영어 팩도 올려」 · 23:35 「예 알틀란스는 영구 삭제한다 그리고 언어팩을 선태기하면 아틀란스가 영어로 나오게 하라」
   (앞서 2026-10-06 20:33 「친구가 중국 그리고 미국인이야 언어팩을 만들어 줘야해」 · 22:00 「한도메인에서 탭을 누르면 영어 중국어가 나오게 해야 돼」)
   · 말 고르기: 맨 위 언어 단추(atlas.js langSheet) → 주소 ?lang=en|ko 로 다시 열고 이 기기에 기억(atlas:lang) · 주소에 없으면 기억한 말 · 그것도 없으면 한국어
     옛 주소의 다른 말(?lang=zh · ja …)은 영어로(옛 판 — 74개 말 — 은 2026-10-15 23:35 영구 삭제)
   · 한국어 화면 코드는 그대로 둔다 — 그려진 글자(글 · aria-label · title · placeholder · alt)를 사전으로 바꾼다(옛 판 site/app/i18n.js 와 같은 틀 방식)
     한국어로 볼 때는 아무것도 하지 않는다 → 한국어 화면 · 화면 검사 그대로
   · 사전 열쇠 = 「틀」: 날짜 「10월 6일(화)」 → {d} · 시각 「15:30」 → {t} · 회사 · 업종 · 갈래 이름 → {e} · 숫자 → {n} · 원문 「…」 → {q}
     번역 틀에서 {n} {e} … 는 나온 차례대로 채움({n2} 처럼 번호를 달면 그 번째) · {pl:한|여럿} = 바로 앞 숫자가 1이면 앞 말
   · 원문(사장님 글 · 기사 제목 · 회사 공시)은 lang="ko" 로 표시돼 바꾸지 않는다
   · 사전에 없는 틀은 「 · 」 「 — 」 「 → 」 「: 」(괄호 밖)로 나눠 조각마다 다시 찾는다 — 그래도 없으면 한국어 그대로(site_check --lang en 이 남은 한국어를 셈)
   · 이름 찾기는 앞에서부터 가장 긴 이름(옛 판의 큰 정규식 대신 — 이름 4,300개)
   · 영어 이름이 없는 회사 = 로마자(국어의 로마자 표기법 · 소리 바뀜은 생략) */
export const LANG_LIST = Object.freeze([{code: 'ko', tag: 'ko', name: '한국어'}, {code: 'en', tag: 'en', name: 'English'}]);
const STORE = 'atlas:lang';
/** 영어 판을 보일까 — 2026-10-16 번역 일꾼이 사용 한도로 멈춰 남은 번역을 Claude 가 직접 하는 동안 false(지구 단추를 숨기고 늘 한국어 · 규칙 71 ③) · 번역이 다 차고 en_check 실패 0 이면 true */
export const EN_READY = true;
const norm = q => { const s = String(q ?? '').trim().toLowerCase(); return !s ? null : s === 'ko' ? 'ko' : 'en'; }; // 다른 말 = 영어
export const LANG = (() => {
  if (!EN_READY) return 'ko';
  let q = null; try { q = norm(new URLSearchParams(location.search).get('lang')); } catch { /* 주소 못 읽음 */ }
  if (q) { try { localStorage.setItem(STORE, q); } catch { /* 기억 못 함 */ } return q; }
  try { const v = localStorage.getItem(STORE); if (v === 'en' || v === 'ko') return v; } catch { /* 기억 못 함 */ }
  return 'ko';
})();
export const ON = LANG !== 'ko';
export const LOCALE = ON ? 'en-US' : 'ko-KR';
const HAN = /[가-힣ㄱ-ㅎㅏ-ㅣ]/, WORD = /[A-Za-z0-9가-힣]/, PARTICLE = /^[은는이가의을를도와과에로만]/;
const COPULA = /^(?:이에요|예요)(?![가-힣])/; // 이름 + 「이에요 · 예요」도 이름으로(2026-10-16 올린 뒤 탐침: 「… 업종은 연예 기획사예요.」 · 「2차전지예요」가 이름으로 안 잡혀 업종마다 틀이 따로 필요했던 것)
const WD = {월: 1, 화: 2, 수: 3, 목: 4, 금: 5, 토: 6, 일: 0};
const WD_EN = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MON_EN = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
let T = {}; const E = new Map(); let EMAX = 0;
const EL = new Map(); let ELMAX = 0; // 로마자 이름 회사(KCC · SOOP · YG PLUS …) — 사전에 없는 줄에서만 이름으로 봄(2026-10-16 · 아래 tr)
const cache = new Map(), misses = new Map(); // misses: 틀 → 처음 본 원문(검사 · 사전 만들기)

const fmtDate = (y, m, d, w) => `${MON_EN[m - 1]} ${d}${y ? `, ${y}` : ''}${w != null ? ` (${WD_EN[w]})` : ''}`;
/** 만 · 억 · 조 → 다 풀어 쓴 숫자(쉼표 없이 · 아래 fill 이 짧게: 345.6 billion) */
const UNIT = {만: 1e4, 억: 1e8, 조: 1e12};
const num = x => Number(String(x).replace(/,/g, ''));
const expandUnits = s => s.replace(/([+−\-]?)(\d[\d,]*(?:\.\d+)?)조\s?(\d[\d,]*)억/g, (all, sg, a, b) => { const v = num(a) * 1e12 + num(b) * 1e8; return Number.isFinite(v) ? sg + a.replace(/,/g, '') + '조\u0000' + String(num(b)) : all; }) // 「1조 2,000억」 = 한 수
  .replace(/(\d+)조\u0000(\d+)/g, (_, a, b) => String(Math.round(num(a) * 1e12 + num(b) * 1e8)))
  .replace(/([+−\-]?)(\d[\d,]*(?:\.\d+)?)\s?(조|억|만)(?!\d)/g, (all, sg, n, u) => {
  const v = Number(n.replace(/,/g, '')) * UNIT[u]; return !Number.isFinite(v) ? all : sg + (v >= 1e6 ? String(Math.round(v)) : Math.round(v).toLocaleString('en-US'));
});
const big = raw => { // 쉼표 없는 7자리 넘는 수(만 · 억 · 조를 푼 것) → 1.2 million · 345.6 billion · 1.4 trillion
  const m = /^([+−\-±]?)(\d{7,})$/.exec(raw); if (!m) return raw;
  const v = Number(m[2]); const [d, w] = v >= 1e12 ? [1e12, 'trillion'] : v >= 1e9 ? [1e9, 'billion'] : [1e6, 'million'];
  const x = v / d; return `${m[1]}${x >= 1000 ? Math.round(x).toLocaleString('en-US') : String(Math.round(x * 10) / 10)} ${w}`;
};
/** 여럿 말 — {pl:한|여럿}(바로 앞 숫자가 1이면 앞 말) */
const plural = (body, lastN) => { const n = lastN == null ? NaN : Math.abs(Number(String(lastN).replace(/[^\d.]/g, ''))); const [one, many = one] = body.split('|'); return n === 1 ? one : many; };

/** 이름(회사 · 업종 · 갈래 …) 더하기 — 한국 이름 → 영어 이름 */
export function addEntities(map) {
  if (!map) return;
  for (const [ko, x] of Object.entries(map)) if (ko && x && ko !== x && HAN.test(ko)) { E.set(ko, x); if (ko.length > EMAX) EMAX = Math.min(40, ko.length); }
  cache.clear();
}
const okEdge = (s, i, len) => {
  const prev = s[i - 1] ?? '', next = s.slice(i + len);
  if (prev && WORD.test(prev)) return false;
  return !next || !WORD.test(next[0]) || PARTICLE.test(next) && !WORD.test(next[1] ?? '') || COPULA.test(next);
};
/** 앞에서부터 가장 긴 이름 찾기(이름 4,300개 — 큰 정규식 대신) */
function entScan(x, push, latin = false) {
  if (!E.size || !HAN.test(x)) return x;
  let out = '', i = 0;
  while (i < x.length) {
    let hit = 0;
    if (!(i > 0 && WORD.test(x[i - 1]))) for (let L = Math.min(latin ? Math.max(EMAX, ELMAX) : EMAX, x.length - i); L >= 2; L--) { const k = x.substr(i, L); if ((E.has(k) || latin && EL.has(k)) && okEdge(x, i, L)) { hit = L; break; } }
    if (hit) { push(x.substr(i, hit)); out += '{e}'; i += hit; } else { out += x[i]; i++; }
  }
  return out;
}

/** 한국어 글 → 틀 + 값 */
export function templateOf(s, {noEnt = false, latin = false} = {}) {
  const v = {d: [], m: [], t: [], e: [], n: [], q: []};
  let x = String(s).replace(/「([^」]*)」/g, (_, q) => { v.q.push(q); return '{q}'; });
  x = x.replace(/(?:(\d{4})년\s?)?(\d{1,2})월[\s\u00a0]?(\d{1,2})일(?:\s?\((월|화|수|목|금|토|일)\))?/g, (_, y, m, d, w) => { v.d.push([y ? +y : null, +m, +d, w ? WD[w] : null]); return '{d}'; });
  // 달 — 한 번에 앞에서부터(「2025년 8월」 → Aug 2025 · 「8월부터」 → Aug): 해 붙은 달과 해 없는 달을 두 번에 나눠 찾으면 값이 화면 차례와 어긋남
  //   (2026-10-16 영어 미리보기: 「2026년 7월 … 8월에는 … 2025년 5월」이 「Jul 2026 … May 2025 … Aug」로 채워지던 것)
  x = x.replace(/(?:(\d{4})년\s?)?(?<![\d.,])(\d{1,2})월(?![\s\u00a0]?\d{1,2}일)/g, (all, y, m) => { if (!y && (+m < 1 || +m > 12)) return all; v.m.push([y ? +y : null, +m]); return '{m}'; });
  x = x.replace(/\b\d{1,2}:\d{2}(?::\d{2})?\b/g, m => { v.t.push(m); return '{t}'; });
  if (!noEnt) x = entScan(x, e => v.e.push(e), latin);
  x = x.replace(/[+−\-±]?\d[\d,]*(?:\.\d+)?/g, m => { v.n.push(m); return '{n}'; });
  return {key: x, v};
}
function fill(tr, v) {
  const at = {d: 0, m: 0, t: 0, e: 0, n: 0, q: 0}; let lastN = null;
  return tr.replace(/\{(d|m|t|e|n|q)(\d*)\}|\{pl:([^}]*)\}/g, (all, k, idx, pl) => {
    if (pl != null) return plural(pl, lastN);
    const i = idx ? Number(idx) - 1 : at[k]++; const val = v[k][i];
    if (val == null) return '';
    if (k === 'd') return fmtDate(...val);
    if (k === 'm') return val[0] ? `${MON_EN[val[1] - 1]} ${val[0]}` : MON_EN[val[1] - 1];
    if (k === 'e') return E.get(val) ?? EL.get(val) ?? romanize(val);
    if (k === 'n') { lastN = val; return big(val); }
    if (k === 'q') return `“${t(val)}”`; // 「…」 안 글(화면 이름 · 단추 이름)도 영어로
    return val;
  });
}
/** 괄호 밖의 나눔 표로 나눔 */
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
const SEPS = [' · ', ' — ', ' → ', ': ', ' / ', ', '];
/** 「, 」는 목록일 때만 나눔(날짜 목록 · 짧은 조각 셋 넘게) — 글 속 쉼표는 문장째로 찾음 */
const listy = parts => parts.length >= 3 && parts.every(p => templateOf(p.trim()).key.length <= 30) || parts.every(p => /\{d\}/.test(templateOf(p).key)); // 길이는 틀로 잼(2026-10-16 — 「CJ CGV 2300000000000 원, …」처럼 큰 수 · 긴 이름이 든 막대 이름표 목록이 나뉘지 않던 것)
function tr(core, depth = 0, ctx = null) {
  if (!HAN.test(core)) return core;
  const {key, v} = templateOf(core);
  if (ctx && T[ctx + '|' + key] != null) return fill(T[ctx + '|' + key], v); // 자리 표(data-tr) — 같은 글도 그 자리 뜻으로(테마 쪽 「n곳」 = 업종 수 · 2026-10-19)
  if (T[key] != null) return fill(T[key], v);
  if (EL.size) { const q = templateOf(core, {latin: true}); if (q.key !== key && T[q.key] != null) return fill(T[q.key], q.v); } // 로마자 이름 회사 줄(「KCC 매출 길」 → 「{e} 매출 길」)
  if (E.size) { const p = templateOf(core, {noEnt: true}); if (p.key !== key && T[p.key] != null) return fill(T[p.key], p.v); } // 이름 사전의 낱말(반도체 · 화학 …)이 보통 말로 쓰인 줄
  if (!HAN.test(key)) return fill(key, v); // 이름 · 날짜 · 숫자만 있는 글
  for (const sep of SEPS) {
    const parts = splitTop(core, sep);
    if (sep === ', ' && !listy(parts)) continue;
    if (parts.length > 1 && depth < 6) return parts.map(p => { const lead = p.match(/^\s*/)[0], tail = p.match(/\s*$/)[0]; return lead + tr(p.trim(), depth + 1, ctx) + tail; }).join(sep);
  }
  const pre = /^(‹ |· |— |→ |✓ |★ |☆ |▲ |▼ |▶ |! |\? )/.exec(core); if (pre && depth < 6) return pre[0] + tr(core.slice(pre[0].length), depth + 1, ctx);
  const post = /( ›| →)$/.exec(core); if (post && depth < 6) return tr(core.slice(0, -post[0].length), depth + 1, ctx) + post[0];
  const wrap = /^\((.*)\)$/.exec(core); if (wrap && depth < 6) return '(' + tr(wrap[1], depth + 1, ctx) + ')';
  if (!misses.has(key)) misses.set(key, core);
  return core;
}
/** 글 하나를 영어로(앞뒤 빈칸은 그대로 · 같은 글은 한 번만 셈) · ctx = 자리 표(그 칸 · 조상의 data-tr — 사전의 「ctx|틀」을 먼저 봄) */
export function t(s, ctx = null) {
  if (!ON || s == null) return s;
  const str = String(s).replace(/[\u200b\u2060]/g, ''); if (!HAN.test(str)) return str;
  const ck = ctx ? ctx + '\u0001' + str : str;
  if (cache.has(ck)) return cache.get(ck);
  const lead = str.match(/^\s*/)[0], tail = str.match(/\s*$/)[0], core = str.slice(lead.length, str.length - tail.length).replace(/\u00a0/g, ' ');
  const out = lead + tr(expandUnits(core), 0, ctx) + tail;
  cache.set(ck, out); return out;
}
export const missing = () => [...misses].map(([key, ex]) => ({key, ex}));

/* ---- 화면 바꾸기(그려진 뒤 · 새로 그려질 때마다) ---- */
const ATTRS = ['aria-label', 'title', 'placeholder', 'alt'];
const skip = el => !el || el.closest?.('[lang="ko"], script, style, noscript');
const done = new WeakMap(); // 이미 바꾼 글(바꾼 뒤 다시 들어오는 바뀜 알림은 넘어감 — 영어 글 속 한국어 이름 · 찾은 글자를 다시 찾지 않게)
function doText(n) { const p = n.parentElement; if (skip(p)) return; const s = n.nodeValue; if (!HAN.test(s) || done.get(n) === s) return; const o = t(s, p.closest('[data-tr]')?.getAttribute('data-tr') ?? null); if (o !== s) { n.nodeValue = o; done.set(n, o); } else done.set(n, s); }
function doEl(el) {
  if (skip(el)) return;
  for (const a of ATTRS) { const s = el.getAttribute?.(a); if (s && HAN.test(s) && done.get(el)?.[a] !== s) { const o = t(s); const m = done.get(el) ?? {}; m[a] = o; done.set(el, m); if (o !== s) el.setAttribute(a, o); } }
}
export function translateTree(root) {
  if (!ON || !root) return;
  if (root.nodeType === 3) return doText(root);
  if (root.nodeType !== 1 && root.nodeType !== 9 && root.nodeType !== 11) return;
  if (root.nodeType === 1) doEl(root);
  const w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT);
  for (let n = w.nextNode(); n; n = w.nextNode()) { if (n.nodeType === 3) doText(n); else doEl(n); }
}
/** 사전 넣기 — 화면은 startI18n 이, 시험은 바로 */
export function useDict(j, names, latin) {
  T = j?.templates ?? {}; addEntities(j?.entities ?? {}); if (names) addEntities(names);
  if (latin) for (const [ko, x] of Object.entries(latin)) if (ko && x && ko.length >= 2 && !HAN.test(ko) && !HAN.test(x)) { EL.set(ko, x); if (ko.length > ELMAX) ELMAX = Math.min(40, ko.length); }
  cache.clear();
}
let obs = null;
/** 영어면: 사전 · 이름을 읽고 · 문서 말 · 창 제목을 바꾸고 · 이후 그려지는 것을 모두 바꾼다 */
export async function startI18n() {
  if (!ON) return;
  document.documentElement.lang = 'en'; document.documentElement.classList.add('en');
  const get = async f => { try { const r = await fetch(new URL(`./i18n/${f}`, import.meta.url), {cache: 'no-cache'}); return r.ok ? await r.json() : null; } catch { return null; } };
  const [dict, co] = await Promise.all([get('en.json'), get('en-names.json')]);
  useDict(dict, co?.names ?? null, co?.latin ?? null);
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
  try { window.__atlasI18n = {missing, t, templateOf}; } catch { /* 창 없음 */ } // 검사(site_check --lang en)가 남은 틀을 셈
}
/** 영어 이름이 없는 한국 이름 → 로마자 — 「미래에셋」 → Miraeeset */
const RI = ['g', 'kk', 'n', 'd', 'tt', 'r', 'm', 'b', 'pp', 's', 'ss', '', 'j', 'jj', 'ch', 'k', 't', 'p', 'h'];
const RM = ['a', 'ae', 'ya', 'yae', 'eo', 'e', 'yeo', 'ye', 'o', 'wa', 'wae', 'oe', 'yo', 'u', 'wo', 'we', 'wi', 'yu', 'eu', 'ui', 'i'];
const RF = ['', 'k', 'k', 'k', 'n', 'n', 'n', 't', 'l', 'k', 'm', 'l', 'l', 'l', 'p', 'l', 'm', 'p', 'p', 't', 't', 'ng', 't', 't', 'k', 't', 'p', 't'];
export const romanize = s => String(s).replace(/[가-힣]+/g, w => { const r = [...w].map(ch => { const c = ch.charCodeAt(0) - 0xAC00; return RI[Math.floor(c / 588)] + RM[Math.floor((c % 588) / 28)] + RF[c % 28]; }).join(''); return r.charAt(0).toUpperCase() + r.slice(1); });
/** 회사 · 업종 이름의 영어 이름(찾기 칸이 영어로도 찾게) — 없으면 null */
export const nameEn = ko => E.get(String(ko ?? '')) ?? null;
/** 말 바꾸기 — 같은 주소(화면 #)를 그 말로 다시 엶 */
export function switchLang(code) {
  const c = code === 'en' ? 'en' : 'ko';
  try { localStorage.setItem(STORE, c); } catch { /* 기억 못 함 */ }
  const u = new URL(location.href); u.searchParams.set('lang', c); location.replace(u.pathname + u.search + u.hash);
}
