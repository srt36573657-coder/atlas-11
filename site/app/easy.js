/* ATLAS 11 · 쉬운 말(한국어 화면) — 규칙 48
   사장님 2026-10-09 22:40(마카오 시각) 「이 전문가에 중심은 지킨다 그러나 아이큐 92 남자 고등학생이 이해하고 공감가며 사용할수 있도록 해야 한다 …
     아틀란스를 처음부터 마지막 페이지까지 하나하나 다 대 수정 … 글은 참쉽게 그리고 ui/ux도 정말 쉽게 … 3단클릭은 유지 … 교차 검증을 100만번」
   · 한국어 화면의 말 단계 둘: 「쉬운 말」(처음 · 기본) · 「전문가 말」(옛 화면 글 그대로) — 맨 위 「이 화면은?」 줄 단추 · 위 막대 점 셋 메뉴로 오감
     이 기기에 기억(atlas11:level) · 주소 ?level=easy|pro 가 먼저
   · 화면 코드는 전문가 말 그대로 — 그려진 글자(글 · aria-label · title · placeholder · alt · data-speak · 창 제목)를 쉬운 말 사전(easy-ko.js)으로 바꾼다
     (i18n.js 와 같은 길 · 다른 73개 말은 전문가 말을 번역 — 쉬운 말은 한국어 화면에만)
   · 바꾸는 차례: ① 한 줄 통째 틀(숫자 {n} · 날짜 {d} · 시각 {t} · 「…」 {q} · 이름 {e}) ② 괄호 밖 「 · 」 「 — 」 「 → 」 「: 」로 나눠 조각마다 다시
                  ③ 낱말 사전(긴 말부터 · 낱말 안은 바꾸지 않음 · 뒤에 붙은 조사는 받침에 맞춰 — 은/는 · 이/가 · 을/를 · 과/와 · 으로/로 …)
   · 바꾸지 않는 것: 숫자 · 날짜 · 시각 · 회사 · 업종 · 갈래 이름 · 원문(lang="ko" — 기사 · 공시 제목 · 사장님 말씀) · 식별자(data-ident · code)
     → 교차 검증(scripts/atlas11/verify/easy_million.mjs · full_check 쉬운 말 층): 쉬운 말 화면의 숫자 = 전문가 말 화면의 숫자 · 어려운 말 0 · 금지 말 0 · 조사 맞음 · 두 번 바꿔도 같음 */
import {LANG} from './i18n.js';
import {WORDS, TPL, WHAT, HARD, GLOSS} from './easy-ko.js';

const STORE = 'atlas11:level';
const okLevel = v => (v === 'easy' || v === 'pro' ? v : null);
/** 말 단계 — 주소(?level=) → 이 기기에 기억한 것 → 쉬운 말 */
export const LEVEL = (() => {
  let q = null; try { q = okLevel(new URLSearchParams(location.search).get('level')); } catch {}
  if (q) { try { localStorage.setItem(STORE, q); } catch {} return q; }
  try { const v = okLevel(localStorage.getItem(STORE)); if (v) return v; } catch {}
  return 'easy';
})();
/** 쉬운 말 화면인가(한국어 화면에서만 — 다른 말은 전문가 말을 번역) */
export const EASY = LANG === 'ko' && LEVEL === 'easy';

/** 말 단계 바꾸기 — 이 기기에 적고 같은 화면을 다시 엶(주소의 ?level= 은 뺌 · 말 고르기와 같은 길) */
export function setLevel(v) {
  if (!okLevel(v)) return;
  try { localStorage.setItem(STORE, v); } catch {}
  const p = new URLSearchParams(location.search); p.delete('level');
  const q = p.toString(), next = location.pathname + (q ? '?' + q : '') + location.hash;
  if ((q ? '?' + q : '') === location.search) location.reload(); else location.href = next;
}

/* ── 글 바꾸기(화면 없이도 도는 셈 — 시험 · 백만 번 맞대기가 그대로 씀) ── */
const HAN = /[가-힣]/, LAT = /\b(?:KST|ROE|EPS|PER)\b|%p\b/; // 한글이 없어도 바꿀 글(영어 약자 · %p)
const esc = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const isHan = ch => !!ch && ch >= '가' && ch <= '힣';
const WORDCH = /[A-Za-z가-힣]/;
/** 받침 — 끝 괄호(…)는 건너뛰고 마지막 소리로(「마감 가격(종가)」이면 「격」) · 숫자는 읽는 소리 */
export function finalOf(s) {
  let x = String(s).trimEnd();
  for (let i = 0; i < 3 && /\)$/.test(x); i++) x = x.replace(/\s*\([^()]*\)$/, '').trimEnd();
  const ch = x.at(-1) ?? '';
  if (isHan(ch)) { const c = (ch.charCodeAt(0) - 0xAC00) % 28; return {b: c !== 0, l: c === 8}; }
  if (/\d/.test(ch)) return {b: '0136781'.includes(ch), l: '178'.includes(ch)}; // 영 일 삼 육 칠 팔 = 받침 · 일 칠 팔 = ㄹ
  if (ch === '%') return {b: false, l: false}; // 퍼센트
  if (/[A-Za-z]/.test(ch)) return {b: /[LMNR]/i.test(ch), l: /[LR]/i.test(ch)};
  return {b: false, l: false};
}
// 조사 — [받침 있을 때, 없을 때] · 긴 것부터 찾음
const PAIRS = [['이었', '였'], ['이에요', '예요'], ['이지만', '지만'], ['이라고', '라고'], ['이라는', '라는'], ['이라서', '라서'], ['이라도', '라도'], ['이라면', '라면'], ['이라', '라'], ['이랑', '랑'], ['이든', '든'], ['이나', '나'],
  ['이면', '면'], ['이며', '며'], ['이고', '고'], ['이야', '야'], ['이다', '다'], ['으로', '로'], ['은', '는'], ['이', '가'], ['을', '를'], ['과', '와']];
// 받침과 상관없는 조사 · 붙는 말(이 뒤라면 낱말이 끝난 것)
const INV = ['에서는', '에서도', '에서', '에는', '에도', '에게', '에', '의', '도', '만', '마다', '까지', '부터', '보다', '처럼', '께서', '께', '쯤', '씩', '뿐', '조차', '밖에', '대로', '끼리', '들', '하고', '엔', '인', '일', '입니다', '별', '간', '당', '째', '짜리', '치'];
export const JOSA_PAIRS = PAIRS, JOSA_INV = INV; // 시험 · 백만 번 맞대기가 씀
const JOSA = [...PAIRS.flatMap(([a, b]) => [[a, a, b], [b, a, b]]), ...INV.map(x => [x, null, null])].sort((p, q) => q[0].length - p[0].length);
function josaAt(rest) { for (const j of JOSA) if (rest.startsWith(j[0])) return j; return null; }
/** 조사 맞추기 — 앞말(새 낱말)의 받침에 맞는 꼴 */
export function josaFor(word, a, b) { if (a == null) return null; const f = finalOf(word); if (a === '으로') return f.b && !f.l ? a : b; return f.b ? a : b; }

let W = new Map(), wordRe = null, T = {}, E = new Set(), entRe = null;
const cache = new Map();
/** 사전 넣기(화면은 처음에 · 시험은 바로) */
export function useEasyDict({words = WORDS, templates = TPL} = {}) {
  W = new Map(words.filter(([k, v]) => k && v != null && k !== v));
  const keys = [...W.keys()].sort((a, b) => b.length - a.length).map(esc);
  wordRe = keys.length ? new RegExp(keys.join('|'), 'g') : null;
  T = templates ?? {}; cache.clear();
}
useEasyDict();
/** 이름(회사 · 업종 · 갈래 · 지수) — 바꾸지 않는 자리 */
export function addEasyNames(names) {
  for (const n of names ?? []) if (n && String(n).length >= 2) E.add(String(n));
  const keys = [...E].sort((a, b) => b.length - a.length).map(esc);
  entRe = keys.length ? new RegExp(keys.join('|'), 'g') : null; cache.clear();
}
const okEdge = (s, i, len) => { const prev = s[i - 1] ?? '', next = s.slice(i + len); if (prev && WORDCH.test(prev)) return false; if (!next) return true; if (/^[A-Za-z0-9]/.test(next)) return false; return !isHan(next[0]) || !!josaAt(next); }; // 이름 자리 — 앞뒤가 글자로 이어지면 이름이 아님(「증권사」의 「증권」) · 뒤에 조사는 됨

/** 낱말 바꾸기 — 이름 자리는 건너뜀 · 낱말 안(앞이 글자 · 뒤가 조사가 아닌 글자)은 그대로 · 조사는 새 낱말에 맞춤 */
function wordsOf(s) {
  if (!wordRe) return s;
  // 이름 자리를 먼저 찾아 그 밖만 바꿈
  const spans = []; if (entRe) for (const m of s.matchAll(entRe)) if (okEdge(s, m.index, m[0].length)) spans.push([m.index, m.index + m[0].length]);
  let out = '', last = 0;
  const part = (a, b) => { const seg = s.slice(a, b); return seg ? wordsSeg(seg, s, a) : ''; };
  for (const [a, b] of spans) { if (a < last) continue; out += part(last, a) + s.slice(a, b); last = b; }
  return out + part(last, s.length);
}
function wordsSeg(seg, whole, base) {
  let out = '', i = 0;
  wordRe.lastIndex = 0;
  for (let m = wordRe.exec(seg); m; m = wordRe.exec(seg)) {
    const at = m.index, key = m[0], prev = at > 0 ? seg[at - 1] : whole[base - 1] ?? '';
    if (at < i) continue;
    if (!/^\s/.test(key) && prev && WORDCH.test(prev) && !/^[\d%]/.test(key)) { continue; } // 낱말 안(앞이 글자) — 숫자로 시작하는 열쇠(「20거래일」)는 그대로 봄
    const restAll = seg.slice(at + key.length), next = restAll[0] ?? '';
    let j = null;
    if (isHan(next)) { j = josaAt(restAll); if (!j && !/[^가-힣]$/.test(key)) continue; } // 뒤가 다른 글자로 이어지면(조사가 아니면) 낱말 안
    else if (next && /[A-Za-z0-9]/.test(next) && /[A-Za-z0-9]$/.test(key)) continue;
    const rep = W.get(key);
    out += seg.slice(i, at) + rep; i = at + key.length;
    if (j && j[1] != null) { let fix = josaFor(rep, j[1], j[2]); if (fix === '라' && /사$/.test(rep) && !isHan(restAll[j[0].length] ?? '')) fix = '여서'; out += fix; i += j[0].length; } // 「회사라 」는 금지 말 「사라 」로 읽힘 → 「회사여서 」
    wordRe.lastIndex = Math.max(wordRe.lastIndex, i);
  }
  return out + seg.slice(i);
}

/** 한국어 글 → 틀 + 값(i18n.js 와 같은 모양 · 날짜 · 시각은 원래 글 그대로) */
export function easyTemplateOf(s, {noEnt = false} = {}) {
  const v = {d: [], t: [], e: [], n: [], q: []};
  let x = String(s).replace(/「([^」]*)」/g, (_, q) => { v.q.push(q); return '{q}'; });
  x = x.replace(/(?:\d{4}년\s?)?\d{1,2}월\s?\d{1,2}일(?:\((?:월|화|수|목|금|토|일)\))?/g, m => { v.d.push(m); return '{d}'; });
  x = x.replace(/\b\d{1,2}:\d{2}(?::\d{2})?\b/g, m => { v.t.push(m); return '{t}'; });
  if (entRe && !noEnt) { let out = '', last = 0; for (const m of x.matchAll(entRe)) { if (!okEdge(x, m.index, m[0].length)) continue; out += x.slice(last, m.index) + '{e}'; v.e.push(m[0]); last = m.index + m[0].length; } x = out + x.slice(last); }
  x = x.replace(/[+−\-±]?\d[\d,]*(?:\.\d+)?/g, m => { v.n.push(m); return '{n}'; });
  return {key: x, v};
}
function fill(tr, v) {
  const at = {d: 0, t: 0, e: 0, n: 0, q: 0};
  return tr.replace(/\{(d|t|e|n|q)(\d*)\}/g, (all, k, idx) => {
    const i = idx ? Number(idx) - 1 : at[k]++; const val = v[k][i];
    if (val == null) return '';
    return k === 'q' ? `「${ez(val)}」` : val;
  });
}
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
  const {key, v} = easyTemplateOf(core);
  if (T[key] != null) return fill(T[key], v);
  if (entRe) { const p = easyTemplateOf(core, {noEnt: true}); if (p.key !== key && T[p.key] != null) return fill(T[p.key], p.v); } // 이름과 같은 보통 말(업종 「증권」 · 「보험」 …)이 든 줄 — 이름으로 보지 않은 틀도 찾음(i18n.js 와 같은 길)
  for (const sep of SEPS) {
    const parts = splitTop(core, sep);
    if (parts.length > 1 && depth < 6) return parts.map(p => { const lead = p.match(/^\s*/)[0], tail = p.match(/\s*$/)[0]; return lead + tr(p.trim(), depth + 1) + tail; }).join(sep);
  }
  return wordsOf(core);
}
/** 글 하나를 쉬운 말로(앞뒤 빈칸은 그대로 · 같은 글은 한 번만 셈) */
export function ez(s) {
  if (s == null) return s;
  const str = String(s); if (!HAN.test(str) && !LAT.test(str)) return str;
  if (cache.has(str)) return cache.get(str);
  const lead = str.match(/^\s*/)[0], tail = str.match(/\s*$/)[0], core = str.slice(lead.length, str.length - tail.length);
  const out = lead + tr(core) + tail;
  if (cache.size > 20000) cache.clear();
  cache.set(str, out); return out;
}
/** 남은 어려운 말(검사 · 시험) — 쉬운 말 글에서 HARD 낱말을 찾음(낱말 안 · 이름 자리는 뺌) */
export function hardLeft(s) {
  const str = String(s ?? ''), hits = [];
  for (const w of HARD) {
    let from = 0;
    for (let at = str.indexOf(w, from); at >= 0; at = str.indexOf(w, from)) {
      from = at + 1;
      const prev = str[at - 1] ?? '', next = str.slice(at + w.length);
      if (prev && WORDCH.test(prev) && !/^[\d%]/.test(w)) continue;
      if (isHan(next[0]) && !josaAt(next)) continue;
      if (entRe) { let inName = false; for (const m of str.matchAll(entRe)) if (m.index <= at && at < m.index + m[0].length) { inName = true; break; } if (inName) continue; }
      hits.push(w); break;
    }
  }
  return hits;
}

/* ── 화면 바꾸기(그려진 뒤 · 새로 그려질 때마다) ── */
const ATTRS = ['aria-label', 'title', 'placeholder', 'alt', 'data-speak'];
const skip = el => !el || !!el.closest?.('[lang="ko"]:not(html), script, style, noscript, code, [data-ident], .lang, [data-ez-skip]');
const mine = new WeakMap(); // 이 글자는 내가 바꾼 것(다시 바꾸지 않음 — 관찰자가 제 바꿈을 또 보지 않게)
function doText(n) {
  const p = n.parentElement; if (skip(p)) return;
  const s = n.nodeValue; if (mine.get(n) === s) return;
  if (!HAN.test(s) && !LAT.test(s)) return;
  const o = ez(s); mine.set(n, o); if (o !== s) n.nodeValue = o;
}
function doEl(el) {
  if (skip(el)) return;
  const keep = el.getAttribute?.('data-orig-attr')?.split(' ') ?? [];
  for (const a of ATTRS) { if (keep.includes(a)) continue; const s = el.getAttribute?.(a); if (s && (HAN.test(s) || LAT.test(s))) { const o = ez(s); if (o !== s) el.setAttribute(a, o); } }
}
export function easyTree(root) {
  if (!EASY || !root) return;
  if (root.nodeType === 3) return doText(root);
  if (root.nodeType !== 1 && root.nodeType !== 9 && root.nodeType !== 11) return;
  if (root.nodeType === 1) doEl(root);
  const w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT);
  for (let n = w.nextNode(); n; n = w.nextNode()) { if (n.nodeType === 3) doText(n); else doEl(n); }
}
/** 쉬운 말 화면이면: 지금 그린 것을 바꾸고 · 이후 그려지는 것을 모두 바꾼다 */
export function startEasy() {
  if (!EASY || typeof document === 'undefined') return;
  document.documentElement.dataset.level = 'easy';
  document.title = ez(document.title);
  easyTree(document.body);
  new MutationObserver(list => {
    for (const m of list) {
      if (m.type === 'characterData') doText(m.target);
      else if (m.type === 'attributes') doEl(m.target);
      else for (const n of m.addedNodes) easyTree(n);
    }
  }).observe(document.body, {subtree: true, childList: true, characterData: true, attributes: true, attributeFilter: ATTRS});
}

/* ── 쉬운 화면 부품 ── */
const el = (tag, attrs = {}, ...kids) => { const x = document.createElement(tag); for (const [k, v] of Object.entries(attrs ?? {})) { if (v == null) continue; if (k === 'onclick') x.addEventListener('click', v); else x.setAttribute(k, v); } for (const k of kids.flat()) if (k != null) x.append(k); return x; };
/** 화면마다 맨 위 「이 화면은?」 한 줄 + 전문가 말 단추(쉬운 말 화면에서만) */
export function whatLine(view, place = 'kr') {
  if (!EASY || typeof document === 'undefined') return null;
  const w = WHAT[`${place}:${view}`] ?? WHAT[view]; if (!w) return null;
  return el('p', {class: 'ez-what', lang: 'ko', 'data-ez': '', 'data-ez-skip': ''}, // 한국어 화면에만 있는 줄(lang="ko" — 73개 말 계산 층 · 번역이 보지 않음)
    el('button', {class: 'ez-lv', type: 'button', 'aria-label': '전문가 말로 보기(옛 화면 글 그대로)', onclick: () => setLevel('pro')}, '전문가 말'), // 오른쪽에 띄움(글이 둘레로 흐름 — 한 줄을 아낌)
    el('b', null, '이 화면은? '), w);
}
/** 쉬운 말 화면에서 빽빽한 전문가 칸을 접어 둠(전문가 말 화면은 그대로 펼침) — 접힌 칸 이름은 쉬운 말 */
export function proFold(label, ...kids) {
  const list = kids.flat().filter(Boolean);
  if (!EASY || typeof document === 'undefined' || !list.length) return list;
  return [el('details', {class: 'b-how ez-pro', 'data-ez': ''}, el('summary', {lang: 'ko', 'data-ez-skip': ''}, label), ...list)];
}
/** 점 셋 메뉴 단추 — 쉬운 말 ↔ 전문가 말(한국어 화면에서만) */
export function levelButton() {
  if (LANG !== 'ko' || typeof document === 'undefined') return null;
  const on = LEVEL === 'easy';
  return el('button', {class: 'ez-lv-b', type: 'button', lang: 'ko', 'data-ez-skip': '', 'aria-pressed': String(on), 'aria-label': on ? '쉬운 말로 보는 중 — 누르면 전문가 말(옛 화면 글)' : '전문가 말로 보는 중 — 누르면 쉬운 말', title: on ? '누르면 전문가 말' : '누르면 쉬운 말', onclick: () => setLevel(on ? 'pro' : 'easy')}, '쉬운 말');
}
/** 어려운 말 풀이 칸(쉬운 말 화면 「처음」 맨 아래) — 뉴스 말 → 쉬운 말 · 한 줄 뜻(뉴스 말이 그대로 보이게 lang="ko" · 쉬운 말 셈이 건드리지 않음) */
export function glossaryBox() {
  if (!EASY || typeof document === 'undefined') return null;
  return el('section', {class: 'b-box ez-gloss ez-only', id: 'ez-gloss', lang: 'ko', 'data-ez': '', 'data-ez-skip': '', 'aria-label': '어려운 말 풀이'},
    el('h2', {class: 'b-box-h'}, '어려운 말 풀이', el('small', null, ' · 뉴스 · 증권 앱 말 → ATLAS 쉬운 말')),
    el('dl', {class: 'ez-gl'}, ...GLOSS.map(([pro, easy, mean]) => el('div', {class: 'ez-gi'}, el('dt', null, el('span', {class: 'ez-gp'}, pro), ' → ', el('b', null, easy)), el('dd', null, mean)))),
    el('p', {class: 'muted xs'}, '맨 위 「전문가 말」 단추를 누르면 뉴스와 같은 말로 볼 수 있어요'));
}
