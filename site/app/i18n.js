/* ATLAS 11 · 언어팩 — 한 주소(aaa7377.com · /us/)에서 한국어 · 영어 · 중국어(간체)
   사장님 2026-10-06 20:33 「친구가 중국 그리고 미국인이야 언어팩을 만들어 줘야해」 · 22:00 「한도메인에서 탭을 누르면 영어 중국어가 나오게 해야 돼」
   · 말 고르기: 위 막대 말 단추(app.js) → 주소 ?lang=en|zh|ko 로 다시 열고 이 기기에 기억(atlas11:lang) · 주소에 없으면 기억한 말 · 그것도 없으면 한국어
   · 한국어 화면 코드는 그대로 둔다 — 그려진 글자(글 · aria-label · title · placeholder · alt · data-speak · 창 제목)를 사전으로 바꾼다
     한국어로 볼 때는 아무것도 하지 않는다 → 한국어 화면 · 화면 검사 그대로
   · 사전 열쇠 = 「틀」: 날짜 「10월 6일(화)」 → {d} · 시각 「15:30」 → {t} · 회사 · 업종 · 갈래 · 지수 이름 → {e} · 숫자 → {n} · 원문 「…」 → {q}
     번역 틀에서 {n} {e} … 는 나온 차례대로 채움({n2} 처럼 번호를 달면 그 번째) · {pl:한|여럿} = 바로 앞 숫자가 1이면 앞 말
   · 원문(기사 · 공시 제목 · 사장님 말씀 · 업데이트 기록 글)은 lang="ko" 로 표시돼 바꾸지 않는다
   · 사전에 없는 틀은 「 · 」(괄호 밖)로 나눠 조각마다 다시 찾는다 — 그래도 없으면 한국어 그대로(scripts/atlas11/i18n_check.mjs 가 남은 한국어를 센다) */
/* 말 목록 — 주식시장이 있는 나라들의 말(2026-10-07 05:13 사장님 「언어팩을 주식시장이 있는 전세게 나라가 있잖아 다 만들어」)
   · code = 주소 ?lang= 값 · 사전 파일 이름(i18n/<code>.json) · tag = html lang · name = 그 말 글자로 쓴 이름(어느 말로 보든 자기 말을 찾게)
   · rtl = 오른쪽부터 쓰는 말(html dir="rtl") · my = 만 · 억을 그대로 쓰는 말(틀에 万 · 萬 · 億 — 나머지 말은 다 풀어 씀)
   · 어느 나라 거래소의 말인지는 docs/ATLAS_언어팩.md · 위 세 줄(한국어 · English · 简体中文)은 처음부터 있던 말 */
export const LANG_LIST = Object.freeze([
  {code: 'ko', tag: 'ko', name: '한국어'}, {code: 'en', tag: 'en', name: 'English'}, {code: 'zh', tag: 'zh-CN', name: '简体中文', my: true},
  {code: 'zh-TW', tag: 'zh-TW', name: '繁體中文', my: true}, {code: 'ja', tag: 'ja', name: '日本語', my: true},
  {code: 'es', tag: 'es', name: 'Español'}, {code: 'pt', tag: 'pt-BR', name: 'Português'}, {code: 'fr', tag: 'fr', name: 'Français'}, {code: 'de', tag: 'de', name: 'Deutsch'},
  {code: 'it', tag: 'it', name: 'Italiano'}, {code: 'nl', tag: 'nl', name: 'Nederlands'}, {code: 'ru', tag: 'ru', name: 'Русский'}, {code: 'ar', tag: 'ar', name: 'العربية', rtl: true},
  {code: 'hi', tag: 'hi', name: 'हिन्दी'}, {code: 'bn', tag: 'bn', name: 'বাংলা'}, {code: 'ur', tag: 'ur', name: 'اردو', rtl: true}, {code: 'id', tag: 'id', name: 'Bahasa Indonesia'},
  {code: 'ms', tag: 'ms', name: 'Bahasa Melayu'}, {code: 'th', tag: 'th', name: 'ไทย'}, {code: 'vi', tag: 'vi', name: 'Tiếng Việt'}, {code: 'fil', tag: 'fil', name: 'Filipino'},
  {code: 'tr', tag: 'tr', name: 'Türkçe'}, {code: 'fa', tag: 'fa', name: 'فارسی', rtl: true}, {code: 'he', tag: 'he', name: 'עברית', rtl: true}, {code: 'pl', tag: 'pl', name: 'Polski'},
  {code: 'uk', tag: 'uk', name: 'Українська'}, {code: 'ro', tag: 'ro', name: 'Română'}, {code: 'cs', tag: 'cs', name: 'Čeština'}, {code: 'sk', tag: 'sk', name: 'Slovenčina'},
  {code: 'hu', tag: 'hu', name: 'Magyar'}, {code: 'el', tag: 'el', name: 'Ελληνικά'}, {code: 'bg', tag: 'bg', name: 'Български'}, {code: 'sr', tag: 'sr', name: 'Српски'},
  {code: 'hr', tag: 'hr', name: 'Hrvatski'}, {code: 'bs', tag: 'bs', name: 'Bosanski'}, {code: 'sl', tag: 'sl', name: 'Slovenščina'}, {code: 'mk', tag: 'mk', name: 'Македонски'},
  {code: 'sq', tag: 'sq', name: 'Shqip'}, {code: 'sv', tag: 'sv', name: 'Svenska'}, {code: 'nb', tag: 'nb', name: 'Norsk bokmål'}, {code: 'da', tag: 'da', name: 'Dansk'},
  {code: 'fi', tag: 'fi', name: 'Suomi'}, {code: 'is', tag: 'is', name: 'Íslenska'}, {code: 'et', tag: 'et', name: 'Eesti'}, {code: 'lv', tag: 'lv', name: 'Latviešu'},
  {code: 'lt', tag: 'lt', name: 'Lietuvių'}, {code: 'ga', tag: 'ga', name: 'Gaeilge'}, {code: 'mt', tag: 'mt', name: 'Malti'}, {code: 'lb', tag: 'lb', name: 'Lëtzebuergesch'},
  {code: 'be', tag: 'be', name: 'Беларуская'}, {code: 'ka', tag: 'ka', name: 'ქართული'}, {code: 'hy', tag: 'hy', name: 'Հայերեն'}, {code: 'az', tag: 'az', name: 'Azərbaycan dili'},
  {code: 'kk', tag: 'kk', name: 'Қазақ тілі'}, {code: 'uz', tag: 'uz', name: 'Oʻzbekcha'}, {code: 'ky', tag: 'ky', name: 'Кыргызча'}, {code: 'tg', tag: 'tg', name: 'Тоҷикӣ'},
  {code: 'tk', tag: 'tk', name: 'Türkmençe'}, {code: 'mn', tag: 'mn', name: 'Монгол'}, {code: 'ne', tag: 'ne', name: 'नेपाली'}, {code: 'si', tag: 'si', name: 'සිංහල'},
  {code: 'ta', tag: 'ta', name: 'தமிழ்'}, {code: 'dv', tag: 'dv', name: 'ދިވެހި', rtl: true}, {code: 'dz', tag: 'dz', name: 'རྫོང་ཁ'}, {code: 'km', tag: 'km', name: 'ខ្មែរ'},
  {code: 'lo', tag: 'lo', name: 'ລາວ'}, {code: 'my', tag: 'my', name: 'မြန်မာ'}, {code: 'sw', tag: 'sw', name: 'Kiswahili'}, {code: 'am', tag: 'am', name: 'አማርኛ'},
  {code: 'rw', tag: 'rw', name: 'Ikinyarwanda'}, {code: 'so', tag: 'so', name: 'Soomaali'}, {code: 'af', tag: 'af', name: 'Afrikaans'}, {code: 'zu', tag: 'zu', name: 'isiZulu'},
  {code: 'ht', tag: 'ht', name: 'Kreyòl ayisyen'},
]);
export const LANGS = LANG_LIST.map(x => x.code);
const STORE = 'atlas11:lang';
const norm = q => (q ? LANGS.find(c => c.toLowerCase() === String(q).toLowerCase()) ?? null : null); // ?lang=zh-tw 도 받음
export const LANG = (() => {
  let q = null; try { q = norm(new URLSearchParams(location.search).get('lang')); } catch {}
  if (q) { try { localStorage.setItem(STORE, JSON.stringify(q)); } catch {} return q; } // 주소로 고른 말은 이 기기에 기억(판 바꾸기 · 다음에 열 때)
  try { const v = norm(JSON.parse(localStorage.getItem(STORE) ?? 'null')); if (v) return v; } catch {}
  return 'ko';
})();
export const LANG_INFO = LANG_LIST.find(x => x.code === LANG) ?? LANG_LIST[0];
/** 소리 · 글꼴용 말 꼬리표 · 날짜 · 숫자 모양은 양력 · 아라비아 숫자로 고정(태국 불기 · 이란 양력 · 사우디 이슬람력 · 벵골 숫자로 바뀌지 않게) */
export const LOCALE = LANG === 'en' ? 'en-US' : LANG_INFO.tag; // 소리(말 꼬리표) — 영어는 처음 판처럼 en-US
const FMT_LOCALE = (() => { try { return Intl.getCanonicalLocales(LANG_INFO.tag + '-u-ca-gregory-nu-latn')[0]; } catch { return 'en-US'; } })();
export const ON = LANG !== 'ko';
const HAN = /[가-힣]/, WORD = /[A-Za-z0-9가-힣]/, PARTICLE = /^[은는이가의을를도와과에로만]/;
const WD = {월: 1, 화: 2, 수: 3, 목: 4, 금: 5, 토: 6, 일: 0};
const WD_EN = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'], WD_ZH = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
const MON_EN = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
let T = {}, CO = {}, E = new Map(), entRe = null, QO = '“', QC = '”'; // CO = 잘 알려진 한국 회사 영어 이름(코드 → 이름)
const cache = new Map(), misses = new Set();

/** 날짜 한 개를 그 말로 — 「10月6日(火)」 처럼 · 영어 · 중국어(간체)는 처음 판 그대로 · 나머지 말은 기기 달력(Intl · 양력 · 아라비아 숫자)
   요일은 원문 요일을 그대로(해가 없는 날짜에서 요일을 다시 셈하지 않음) */
const dtf = new Map();
const DTF = opt => { const k = JSON.stringify(opt); if (!dtf.has(k)) { try { dtf.set(k, new Intl.DateTimeFormat(FMT_LOCALE, {timeZone: 'UTC', ...opt})); } catch { dtf.set(k, new Intl.DateTimeFormat('en-US', {timeZone: 'UTC', ...opt})); } } return dtf.get(k); };
const wdName = w => DTF({weekday: 'short'}).format(new Date(Date.UTC(2023, 0, 1 + w))); // 2023-01-01 = 일요일
const fmtDate = (y, m, d, w) => {
  if (LANG === 'en') return `${MON_EN[m - 1]} ${d}${y ? `, ${y}` : ''}${w != null ? ` (${WD_EN[w]})` : ''}`;
  if (LANG === 'zh') return `${y ? `${y}年` : ''}${m}月${d}日${w != null ? `(${WD_ZH[w]})` : ''}`;
  const day = DTF(y ? {year: 'numeric', month: 'short', day: 'numeric'} : {month: 'short', day: 'numeric'}).format(new Date(Date.UTC(y ?? 2024, m - 1, d)));
  return w != null ? `${day} (${wdName(w)})` : day;
};

/** 만 · 억 · 조(주 · 원) — 만 · 억을 쓰는 말(중국어 · 일본어)은 틀에서 그대로 · 나머지는 다 풀어 쓴다(12만주 → 120,000주 → 그 말 숫자 모양) */
const UNIT = {만: 1e4, 억: 1e8, 조: 1e12};
const expandUnits = s => LANG_INFO.my ? s : s.replace(/([+−\-]?)(\d[\d,]*(?:\.\d+)?)(만|억|조)(?=주|원|\s|$|\)|,|·)/g, (_, sg, n, u) => {
  const v = Number(n.replace(/,/g, '')) * UNIT[u]; return Number.isFinite(v) ? sg + Math.round(v).toLocaleString('en-US') : _;
});
/** 숫자 모양 — 원문은 1,234.5 꼴 · 그 말 모양으로(독일어 1.234,5 · 프랑스어 1 234,5 · 힌디어 1,23,456) · 묶음표도 소수점도 없는 숫자(해 2028 · 종목 번호 005930 · 순위 3)는 그대로 · 부호(+ −)는 원문 그대로 */
const nfs = new Map();
function locNum(raw) {
  if (LANG === 'en' || LANG === 'zh') return raw;
  const m = /^([+−\-±]?)(\d{1,3}(?:,\d{3})+|\d+)(?:\.(\d+))?$/.exec(raw); if (!m) return raw;
  const [, sg, int, dec] = m, grouped = int.includes(',');
  if (!grouped && !dec) return raw;
  const key = `${grouped}:${dec?.length ?? 0}`;
  if (!nfs.has(key)) { try { nfs.set(key, new Intl.NumberFormat(FMT_LOCALE, {useGrouping: grouped, minimumFractionDigits: dec?.length ?? 0, maximumFractionDigits: dec?.length ?? 0})); } catch { nfs.set(key, null); } }
  const f = nfs.get(key); if (!f) return raw;
  const v = Number(int.replace(/,/g, '') + (dec ? '.' + dec : '')); return Number.isFinite(v) ? sg + f.format(v) : raw;
}
/** 여럿 말 — {pl:한|여럿}(바로 앞 숫자가 1이면 앞 말) · {pl:one=…|few=…|many=…|other=…}(그 말의 셈 규칙 Intl.PluralRules) */
let PR = null;
const plural = (body, lastN) => {
  const n = lastN == null ? NaN : Math.abs(Number(String(lastN).replace(/[^\d.]/g, '')));
  if (/^(zero|one|two|few|many|other)=/.test(body)) {
    const forms = Object.fromEntries(body.split('|').map(x => { const i = x.indexOf('='); return [x.slice(0, i), x.slice(i + 1)]; }));
    if (!PR) { try { PR = new Intl.PluralRules(FMT_LOCALE); } catch { PR = {select: v => (v === 1 ? 'one' : 'other')}; } }
    const cat = Number.isFinite(n) ? PR.select(n) : 'other'; return forms[cat] ?? forms.other ?? Object.values(forms).at(-1);
  }
  const [one, many = one] = body.split('|'); return n === 1 ? one : many;
};

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
export function templateOf(s, {noEnt = false} = {}) {
  const v = {d: [], t: [], e: [], n: [], q: []};
  let x = String(s).replace(/「([^」]*)」/g, (_, q) => { v.q.push(q); return '{q}'; });
  x = x.replace(/(?:(\d{4})년\s?)?(\d{1,2})월\s?(\d{1,2})일(?:\((월|화|수|목|금|토|일)\))?/g, (_, y, m, d, w) => { v.d.push([y ? +y : null, +m, +d, w ? WD[w] : null]); return '{d}'; });
  x = x.replace(/\b\d{1,2}:\d{2}(?::\d{2})?\b/g, m => { v.t.push(m); return '{t}'; });
  if (entRe && !noEnt) { let out = '', last = 0; for (const m of x.matchAll(entRe)) { if (!okEdge(x, m.index, m[0].length)) continue; out += x.slice(last, m.index) + '{e}'; v.e.push(m[0]); last = m.index + m[0].length; } x = out + x.slice(last); }
  x = x.replace(/[+−\-±]?\d[\d,]*(?:\.\d+)?/g, m => { v.n.push(m); return '{n}'; });
  return {key: x, v};
}
function fill(tr, v) {
  const at = {d: 0, t: 0, e: 0, n: 0, q: 0}; let lastN = null;
  return tr.replace(/\{(d|t|e|n|q)(\d*)\}|\{pl:([^}]*)\}/g, (all, k, idx, pl) => {
    if (pl != null) return plural(pl, lastN);
    const i = idx ? Number(idx) - 1 : at[k]++; const val = v[k][i];
    if (val == null) return '';
    if (k === 'd') return fmtDate(...val);
    if (k === 'e') return E.get(val) ?? val;
    if (k === 'n') { lastN = val; return LANG_INFO.rtl ? `\u2066${locNum(val)}\u2069` : locNum(val); } // 오른쪽부터 쓰는 말: 숫자는 왼쪽부터 한 덩어리(LRI … PDI — 부호가 숫자 뒤로 가지 않게)
    if (k === 'q') return `${QO}${t(val)}${QC}`; // 「…」 안 글(화면 이름 · 단추 이름)도 그 말로 · 따옴표는 그 말 모양(사전 quotes · 없으면 “ ”)
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
  if (entRe) { const p = templateOf(core, {noEnt: true}); if (p.key !== key && T[p.key] != null) return fill(T[p.key], p.v); } // 이름 사전의 낱말(광고 · 가구 · 코스피 …)이 보통 말로 쓰인 줄 — 이름으로 바꾸지 않은 틀도 찾아봄(2026-10-07 「광고 없음」 · 「가구 66,465곳」)
  if (!HAN.test(key)) return fill(key, v); // 이름 · 날짜만 있는 글
  for (const sep of SEPS) {
    const parts = splitTop(core, sep);
    if (parts.length > 1 && depth < 6) return parts.map(p => { const lead = p.match(/^\s*/)[0], tail = p.match(/\s*$/)[0]; return lead + tr(p.trim(), depth + 1) + tail; }).join(sep);
  }
  const pre = /^(‹ |· |— |→ )/.exec(core); if (pre && depth < 6) return pre[0] + tr(core.slice(pre[0].length), depth + 1); // 앞에 붙은 「‹ 」「· 」(되돌아가기 · 이어 쓴 조각)는 떼고 나머지를 찾음(2026-10-07 · 「 · 」로 나눌 데가 없을 때만)
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
export function useDict(j) { T = j?.templates ?? {}; CO = j?.companies ?? {}; if (Array.isArray(j?.quotes) && j.quotes.length === 2) [QO, QC] = j.quotes; addEntities(j?.entities ?? {}); cache.clear(); }
/** 언어판이면: 사전을 읽고 · 창 제목 · 문서 말을 바꾸고 · 이후 그려지는 것을 모두 바꾼다 */
export async function startI18n() {
  if (!ON) return;
  document.documentElement.lang = LANG_INFO.tag; if (LANG_INFO.rtl) document.documentElement.dir = 'rtl'; // 오른쪽부터 쓰는 말(아랍어 · 히브리어 · 페르시아어 · 우르두어 · 디베히어)
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
  for (const c of board.companies) if (c.name && !HAN.test(c.name) && c.name.length >= 3) E.set(c.name, m[c.name] ?? c.name); // 영어 이름 회사(LS ELECTRIC …)도 이름 자리({e})로 — 「LS ELECTRIC 지난 20거래일 종가」를 틀로 찾게(2026-10-07) · 세 글자(KLA · AES)도(2026-10-07 12:08 미국 판 「오른 순 59위 KLA」가 영어 화면에 한국어로 남던 것)
  addEntities(m);
  if (typeof document !== 'undefined') translateTree(document.body);
}
