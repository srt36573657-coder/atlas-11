// 이름 바꾸기 — 아틀란스 → 보드리(사장님 2026-10-17 15:48 「이름을 변경하자 아틀란스에서 보드리로 모두 변경해」 · 15:52 「가」 · 15:54 「예전 아트란스는 앞으로 어떠한 작업도 하지 말아라 현재 것만 하라」)
//   검사가 함께 쓰는 한 곳(scripts/atlas11/next/next_check.mjs · check_*.mjs · probe/live_view.mjs · tests/atlas11/next-modules.test.mjs)
//   ① oldToNew(글, 그대로 둘 글) — 옛 쪽(/atlas/ · 손대지 않아 늘 「아틀란스 · ATLAS」)의 글을 바꾸는 말 표대로 고쳐 새 쪽(/next/ · 「보드리」)과 맞댐
//      → 이름만 맞춰 주고 숫자 · 글의 다른 틀림은 그대로 걸림 · 옛 기록(업데이트 까닭 등 자료 원문)은 「그대로 둘 글」로 넘기면 바꾸지 않음
//   ② nameScan(화면 안에서 돎) + oldNamesIn — 새 쪽 보이는 글 · 창 제목 · aria-label · alt · title · 머리말에 아틀란스 · 아틀라스 · ATLAS 가 남았는지
//      (남의 글 [data-proper] · 원문 [lang="ko"] · 자료의 회사 이름(아틀라스링크 같은 실제 회사)은 뺌) → 실패 이름 「옛 이름 남음」
//   ③ jsStrings(소스) — 자바스크립트 소스의 따옴표 글 · 틀 글(` `)만 뽑음(풀이 글 · 정규식은 뺌) — 시험의 정적 검사가 씀
// 2026-10-17 17:34 「보드리를 고도리로 변경하자」 · 17:57 「… 시스템에 세팅후 작업해」(규칙 76) — 이름은 site/next/brand.js 한 곳에서 읽음(여기 글자를 박지 않음)
import {BRAND, josa} from '../../../site/next/brand.js';
import {gloss} from '../../../site/next/glossary.js'; // 낱말표(2026-10-18 [10] 1) — 새 쪽은 그려진 글을 낱말표로 바꾸므로 옛 쪽 글도 같은 표로 맞춰 맞댐
const GLOSS_RE = /갈래|몸값|한 회사 한 표|큰 회사는 크게|거래일|다섯 문|쉬는 돈|챕터/;
export const NEW_NAME = BRAND.ko;
export const SAFE_LINE = josa(NEW_NAME, '는') + ' 지난 기록만 보여 줘요. 사고팔기를 권하지 않아요.'; // 새 쪽 안전 문장(옛 「아틀란스는 …」 · 「보드리는 …」)
export const TITLE_TAIL = ' · ' + NEW_NAME; // 창 제목 끝(옛 「 · 새 아틀란스」 · 「 · 보드리」)
export const LETTER_TITLE = NEW_NAME + ' 주식 격언 열 가지'; // 사장님 편지 첫 줄(옛 「아틀란스 · 보드리 주식 격언 열 가지」 · 나머지 열 줄 · 상품권 줄은 글자 그대로)
const escRe = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
export const OLD_NAMES = [...new Set([...BRAND.was.flatMap(w => [w.ko, w.en]), '아틀라스', 'Atlas'])].filter(x => x && x !== BRAND.ko && x !== BRAND.en); // 옛 이름(소문자 atlas 는 주소 · 기억 열쇠 · 파일 이름 = 속 이름이라 셈 밖)
export const OLD_NAME_RE = new RegExp(OLD_NAMES.map(escRe).join('|'));
export const OLD_NAME_FAIL = '옛 이름 남음';

/* ① 바꾸는 말 표(안내 rename-brief 표와 같은 차례 — 긴 말 먼저) */
const RULES = [
  [/아틀란스도 지난 기록만 보여요\./g, '그래서 지난 기록만 보여요.'], // 「보드리는 들은 것만 따라 말해요.」 다음 줄 — 한 문장에 둘이 겹치지 않게
  [/지금 아틀란스/g, '옛 화면'], // 예전 화면을 가리키는 글
  [/새 아틀란스/g, NEW_NAME],
  [/새 ATLAS/g, NEW_NAME],
  [/아틀란스/g, NEW_NAME], // 토씨는 그대로(아틀란스 · 보드리 둘 다 받침 없음)
  [/ATLAS ?(는|가|를|의|와|도|로|에서|에|만)(?![가-힣])/g, NEW_NAME + '$1'], // 「ATLAS 는 어떻게 셌나요」 → 「보드리는 어떻게 셌나요」(우리말 이름은 토씨를 붙여 씀)
  [/ATLAS/g, NEW_NAME], // 맨 위 글자 · 「ATLAS 셈」 · 「ATLAS 업종」 · 창 제목 「… · ATLAS」
  ...BRAND.was.filter(w => !['아틀란스', 'ATLAS'].includes(w.ko)).flatMap(w => [[new RegExp(escRe(w.ko) + '(이에요|예요|으로|은|는|이|가|을|를|과|와|로|아|야)?', 'g'), (m, p) => (p ? josa(NEW_NAME, p) : NEW_NAME)], [new RegExp('\\b' + escRe(w.en) + '\\b', 'g'), BRAND.en]]), // 옛 쪽(/atlas/)의 앵무새 이름 보드리 · Bodri → 지금 이름(토씨 맞춤)
];
const HOLD = '\u0000';
/** 옛 쪽 글 → 새 이름 글 · keep = 바꾸지 않을 글(자료 원문 — 옛 쪽 · 새 쪽 모두 글자 그대로 보이는 것) */
export function oldToNew(s, keep = []) {
  if (s == null) return s;
  let t = String(s);
  const nm = OLD_NAME_RE.test(t), gl = GLOSS_RE.test(t);
  if (!nm && !gl) return t;
  const held = [];
  for (const k of [...new Set(keep)].filter(x => x && (OLD_NAME_RE.test(x) || GLOSS_RE.test(x))).sort((a, b) => b.length - a.length)) if (t.includes(k)) { t = t.split(k).join(HOLD + held.length + HOLD); held.push(k); }
  if (nm) for (const [re, to] of RULES) t = t.replace(re, to);
  if (gl) t = gloss(t); // 옛 쪽의 옛 낱말(갈래 · 20거래일 …) → 새 쪽과 같은 말 · 원문(keep)은 그대로
  return held.length ? t.replace(/\u0000(\d+)\u0000/g, (_, i) => held[+i]) : t;
}
/** 뽑은 것(글 · 줄 · 칸 묶음) 속 모든 글을 oldToNew 로 — 숫자 · 참 거짓 · 빈 값은 그대로 */
export function oldToNewDeep(x, keep = []) {
  if (typeof x === 'string') return oldToNew(x, keep);
  if (Array.isArray(x)) return x.map(v => oldToNewDeep(v, keep));
  if (x && typeof x === 'object') return Object.fromEntries(Object.entries(x).map(([k, v]) => [k, oldToNewDeep(v, keep)]));
  return x;
}

/* ② 새 쪽에 옛 이름이 남았나 */
/** 화면 안에서 돎(page.evaluate(nameScan)) — 바깥 것을 쓰지 않음 · 숨은 칸 · 접은 칸 글도 봄(textContent) */
export function nameScan() {
  const cl = document.body.cloneNode(true);
  cl.querySelectorAll('[data-proper], [lang="ko"], script, style, noscript, template').forEach(e => e.remove()); // 남의 글 · 원문(사장님 편지 · 업데이트 까닭 · 기사 제목)은 셈 밖 — 편지는 따로 맞댐
  const attrs = [];
  for (const e of cl.querySelectorAll('[aria-label], [alt], [title], [placeholder], [aria-roledescription]')) for (const a of ['aria-label', 'alt', 'title', 'placeholder', 'aria-roledescription']) { const v = e.getAttribute(a); if (v) attrs.push(v); }
  const meta = [...document.querySelectorAll('meta[name="description"], meta[property^="og:"], meta[name^="twitter:"], meta[name="apple-mobile-web-app-title"], meta[name="application-name"]')].map(m => m.getAttribute('content') || '');
  return {title: document.title, text: cl.textContent, attrs, meta};
}
/** nameScan 결과에서 옛 이름 자리 — allow = 자료에 있는 실제 이름(회사 이름 등) · 돌려줌 = 「어디 「앞뒤 글」」 목록(없으면 빈 목록) */
export function oldNamesIn(scan, allow = []) {
  const hits = [], ok = [...new Set(allow)].filter(Boolean).sort((a, b) => b.length - a.length);
  const look = (where, s) => {
    let t = String(s ?? ''); if (!OLD_NAME_RE.test(t)) return;
    for (const a of ok) t = t.split(a).join(' ');
    const re = new RegExp(OLD_NAME_RE.source, 'g'); let m;
    while ((m = re.exec(t))) hits.push(where + ' 「' + t.slice(Math.max(0, m.index - 24), m.index + m[0].length + 24).replace(/\s+/g, ' ').trim() + '」');
  };
  look('창 제목', scan?.title); look('글', scan?.text);
  for (const a of scan?.attrs ?? []) look('이름표', a);
  for (const a of scan?.meta ?? []) look('머리말', a);
  return hits;
}
/** 자료에 있는 실제 이름 가운데 옛 이름 글자가 든 것(예: 회사 「아틀라스링크」) — 이 이름은 옛 이름이 아님 */
export function allowFromData({mkt = null, names = null, extra = []} = {}) {
  const out = new Set();
  for (const o of Object.values(mkt?.companies ?? {})) if (o?.n && OLD_NAME_RE.test(o.n)) out.add(o.n);
  for (const r of names?.rows ?? []) if (r?.n && OLD_NAME_RE.test(r.n)) out.add(r.n);
  for (const x of extra) if (x && OLD_NAME_RE.test(x)) out.add(x);
  return [...out];
}
/** 검사 자체 시험 — 바꾸는 말 표 · 옛 이름 찾기가 틀림을 잡는지(못 잡으면 그 까닭 목록) */
export function selfTest() {
  const bad = [], eq = (k, a, b) => { if (a !== b) bad.push(`${k}: 「${a}」 ≠ 「${b}」`); };
  eq('편지 첫 줄', oldToNew('아틀란스 주식 격언 열 가지'), LETTER_TITLE);
  eq('봉인 둘째 줄', oldToNew('아틀란스도 지난 기록만 보여요.'), '그래서 지난 기록만 보여요.');
  eq('안전 문장', oldToNew('아틀란스는 지난 기록만 보여 줘요. 사고팔기를 권하지 않아요.'), SAFE_LINE);
  eq('창 제목', oldToNew('삼성전자 · 새 아틀란스'), '삼성전자' + TITLE_TAIL);
  eq('옛 화면', oldToNew('지금 아틀란스 7단으로 보기 ›'), '옛 화면 7단으로 보기 ›');
  eq('ATLAS 토씨', oldToNew('ATLAS 는 어떻게 셌나요'), josa(NEW_NAME, '는') + ' 어떻게 셌나요');
  eq('ATLAS 셈', oldToNew('네이버 증권 · 10월 13일 종가 · ATLAS 셈'), '네이버 증권 · 10월 13일 종가 · ' + NEW_NAME + ' 셈');
  eq('ATLAS 업종', oldToNew('가장 많이 든 ATLAS 업종으로 가요.'), '가장 많이 든 ' + NEW_NAME + ' 업종으로 가요.');
  eq('그대로 둘 글', oldToNew('새 ATLAS 첫 화면 올림 · ATLAS 셈', ['새 ATLAS 첫 화면 올림']), '새 ATLAS 첫 화면 올림 · ' + NEW_NAME + ' 셈');
  eq('앵무새 옛 이름', oldToNew('보드리! 보드리는 들은 것만 따라 말해요.'), NEW_NAME + '! ' + josa(NEW_NAME, '는') + ' 들은 것만 따라 말해요.');
  eq('영어 옛 이름', oldToNew('Meet Bodri'), 'Meet ' + BRAND.en);
  eq('회사 이름', oldToNew('아틀라스링크 −14.2%'), '아틀라스링크 −14.2%');
  eq('숫자는 그대로', oldToNew('아틀란스 1,234곳 +5.6%'), NEW_NAME + ' 1,234곳 +5.6%');
  const hits = oldNamesIn({title: '홈 · 새 아틀란스', text: '아틀라스링크 · ATLAS 셈 · 보드리 편지', attrs: ['ATLAS 처음 화면', NEW_NAME + ' 홈', 'Meet Bodri'], meta: ['Atlas — 지난 기록']}, ['아틀라스링크']);
  eq('옛 이름 찾기 수', hits.length, 6);
  eq('회사 이름은 옛 이름 아님', oldNamesIn({title: '아틀라스링크 · ' + NEW_NAME, text: '아틀라스링크', attrs: [], meta: []}, ['아틀라스링크']).length, 0);
  const st = jsStrings("const a = /'아틀란스/g, b = x / 2 / y; // 'ATLAS'\n/* \"아틀란스\" */ const c = 'ATLAS', d = `x${'y'}아틀란스${`z${1}`}`;").map(x => x.s);
  eq('소스 글 뽑기', JSON.stringify(st), JSON.stringify(['ATLAS', 'x', 'y', '아틀란스', 'z', '', '']));
  return bad;
}

/* ③ 자바스크립트 소스의 글(따옴표 · 틀 글의 글 조각) — 풀이 글(// · /* *\/)과 정규식은 뺌 · 돌려줌 = [{s: 글(원문 그대로), line, start, end}] */
const KW = new Set(['return', 'typeof', 'case', 'do', 'else', 'in', 'of', 'new', 'delete', 'void', 'throw', 'instanceof', 'yield', 'await']);
export function jsStrings(src) {
  const out = [], n = src.length, tpl = []; // tpl = 틀 글 ${ } 안의 { 깊이
  let i = 0, prev = '', word = '';
  const lineAt = (() => { const nl = []; for (let k = 0; k < n; k++) if (src[k] === '\n') nl.push(k); return p => { let lo = 0, hi = nl.length; while (lo < hi) { const m = (lo + hi) >> 1; if (nl[m] < p) lo = m + 1; else hi = m; } return lo + 1; }; })();
  const regexOk = () => prev === '' || '(,=:[!&|?{};+-*%<>~^'.includes(prev) || (prev === 'w' && KW.has(word));
  const readTpl = from => { // from = 틀 글 조각의 첫 글자 자리 · 돌려줌 = 다음 자리
    let k = from;
    for (; k < n; k++) {
      if (src[k] === '\\') { k++; continue; }
      if (src[k] === '`') { out.push({s: src.slice(from, k), line: lineAt(from), start: from, end: k}); prev = '`'; return k + 1; }
      if (src[k] === '$' && src[k + 1] === '{') { out.push({s: src.slice(from, k), line: lineAt(from), start: from, end: k}); tpl.push(0); prev = '{'; return k + 2; }
    }
    throw Error('틀 글이 닫히지 않음 · ' + lineAt(from) + '번째 줄');
  };
  while (i < n) {
    const c = src[i];
    if (c === '\n' || c === ' ' || c === '\t' || c === '\r') { i++; continue; }
    if (c === '/' && src[i + 1] === '/') { while (i < n && src[i] !== '\n') i++; continue; }
    if (c === '/' && src[i + 1] === '*') { const e = src.indexOf('*/', i + 2); if (e < 0) throw Error('풀이 글이 닫히지 않음 · ' + lineAt(i) + '번째 줄'); i = e + 2; continue; }
    if (c === '"' || c === "'") {
      let k = i + 1; for (; k < n && src[k] !== c; k++) { if (src[k] === '\\') k++; else if (src[k] === '\n') throw Error('따옴표 글이 닫히지 않음 · ' + lineAt(i) + '번째 줄'); }
      out.push({s: src.slice(i + 1, k), line: lineAt(i), start: i + 1, end: k}); prev = 'w'; word = ''; i = k + 1; continue;
    }
    if (c === '`') { i = readTpl(i + 1); continue; }
    if (c === '/' && regexOk()) { // 정규식 — [ ] 안의 / 는 끝이 아님
      let k = i + 1, cls = false; for (; k < n; k++) { const d = src[k]; if (d === '\\') { k++; continue; } if (d === '\n') throw Error('정규식이 닫히지 않음 · ' + lineAt(i) + '번째 줄'); if (cls) { if (d === ']') cls = false; continue; } if (d === '[') cls = true; else if (d === '/') break; }
      k++; while (k < n && /[a-z]/i.test(src[k])) k++;
      prev = 'w'; word = ''; i = k; continue;
    }
    if (/[\w$]/.test(c) || c.charCodeAt(0) > 127) { let k = i; while (k < n && (/[\w$]/.test(src[k]) || src.charCodeAt(k) > 127)) k++; word = src.slice(i, k); prev = 'w'; i = k; continue; }
    if (c === '{' && tpl.length) tpl[tpl.length - 1]++;
    if (c === '}' && tpl.length) { if (tpl[tpl.length - 1] === 0) { tpl.pop(); i = readTpl(i + 1); continue; } tpl[tpl.length - 1]--; }
    prev = c === ')' || c === ']' ? 'w' : c; word = ''; i++;
  }
  if (tpl.length) throw Error('틀 글 ${ } 가 닫히지 않음');
  return out;
}
