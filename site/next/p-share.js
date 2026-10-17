/* 고도리 보내기 — 「친구에게 무슨 말을 할래?」 글상자 · 친구가 연 주소(#/s/…) 화면
   사장님 2026-10-17 21:10(싱가포르) 「고도리 · 하나로 묶은 명령문」 [4] 1 ~ 9 · 일 나누기 docs/design/godori-2026-10-17/brief2.md(일꾼 C)
   open(o) — 모든 보내기 단추가 부름(앱 NX.shareBox · 소개 쪽 /hello-send.js · 편지 쪽 /letter.js) · 앱(globalThis.NX) 없이도 돎
     o = {kind: 'share' | 'ask', title, url, code?, price?, day?, name?, text?}
       · text = 같이 가는 그 쪽 소개 한 줄(고칠 수 없음 · 글상자 셈 밖) · 사람이 쓰는 말 = 글상자(50자까지)
     차례: 글상자 + 빠른 말 셋 → words.js 로 거름(걸리면 그 낱말을 골라 보여 주고 고칠 때까지 못 보냄 · 수익 숫자도) →
           휴대폰 공유 창에 글 + 주소 함께 → 공유 창이 없으면 글 + 주소를 함께 복사 → 복사도 막히면 글을 보여 주고 골라 둠
   주소(회사 주식): <곳>#/s/<번호>/<보낸 날>/<그날 값>/<s|a>[/<말>] — s = 보내기 · a = 같이 따져 줘 · 말 = UTF-8 → base64url(150바이트까지 · 200자 안)
   render(arg) — 친구가 연 주소: 보낸 날 값 · 오늘 값(그림 한 장) → 왜 사? 질문부터 → 다 답한 뒤에 보낸 사람 말 · 같이 따져 줘면 「반토막 난다면 왜일까?」
   보안 규칙 안: innerHTML · 글 속 style 없음 · 다른 주소 스크립트 없음(카카오 공식 카드는 꺼 둔 채 준비만 — docs/design/godori-2026-10-17/kakao.md)
   이름은 brand.js 한 곳 · 거르는 말은 words.js 한 곳 */
import {sendHits} from './words.js';
import {NAME, josa, hasBatchim} from './brand.js';

const SVGNS = 'http://www.w3.org/2000/svg';
const nx = () => globalThis.NX ?? null;
function h(tag, a = {}, ...kids) {
  const e = document.createElement(tag);
  for (const [k, v] of Object.entries(a ?? {})) {
    if (v == null || v === false) continue;
    if (k === 'class') e.className = v; else if (k === 'text') e.textContent = v;
    else if (k.startsWith('on') && typeof v === 'function') e.addEventListener(k.slice(2), v);
    else e.setAttribute(k, v === true ? '' : String(v));
  }
  for (const c of kids.flat(Infinity)) if (c != null && c !== false) e.append(c instanceof Node ? c : String(c));
  return e;
}
function sv(tag, a = {}) { const e = document.createElementNS(SVGNS, tag); for (const [k, v] of Object.entries(a)) if (v != null) e.setAttribute(k, String(v)); return e; }
const num = n => Number(n).toLocaleString('ko-KR');
const md = d => (typeof d === 'string' && /^\d{4}-\d{2}-\d{2}/.test(d) ? `${+d.slice(5, 7)}월 ${+d.slice(8, 10)}일` : '?');
const ira = w => (hasBatchim(w) ? '이라' : '라');

/** 빠른 말 셋(명령문 [4] 2) · 같이 따져 줘 물음([4] 8) · 글상자 칸 */
export const QUICK = Object.freeze(['이거 어때?', '같이 공부하자', '나는 이렇게 봤어']);
export const ASK_Q = '반토막 난다면 왜일까?';
export const MAX = 50, MSG_BYTES = 150;
const DEF = {share: QUICK[0], ask: '같이 따져 줘. ' + ASK_Q};
const CODE_RE = /^[0-9A-Z]{6}$/, DAY_RE = /^\d{4}-\d{2}-\d{2}$/;
const ZW = /[\u0000-\u001F\u007F-\u009F­​-‏‪-‮⁠-⁩﻿]/g;

/** 말 다듬기 — 한글 모아 쓰기 · 보이지 않는 글자 · 줄 바꿈 지움 · 50자까지 */
export const cleanMsg = s => Array.from(String(s ?? '').normalize('NFC').replace(/[\r\n\t]+/g, ' ').replace(ZW, '').replace(/\s{2,}/g, ' ').trim()).slice(0, MAX).join('');
/** 보내는 글의 이름표 · 소개 글에서 수익 숫자를 뺌(명령문 [4] 5 — 사이트가 만든 제목에 「+12.3%」가 들어 있어도 보내지 않음) */
const noGain = s => String(s ?? '').replace(/[+＋\-−▲▼↑↓]?\s*[0-9０-９][0-9０-９.,]*\s*(?:%|％|퍼센트|프로)/g, '').replace(/\(\s*\)|·\s*·/g, '·').replace(/\s{2,}/g, ' ').replace(/^[\s·]+|[\s·]+$/g, '').trim();

/* 주소 속 말 — UTF-8 → base64url(150바이트까지 · 글자 가운데서 자르지 않음) */
const TE = typeof TextEncoder === 'function' ? new TextEncoder() : null;
function cutBytes(s, n) { let out = '', used = 0; for (const ch of Array.from(String(s))) { const k = TE.encode(ch).length; if (used + k > n) break; out += ch; used += k; } return out; }
export function encMsg(s) {
  const t = cleanMsg(s); if (!t || !TE) return '';
  let bin = ''; for (const b of TE.encode(cutBytes(t, MSG_BYTES))) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}
/** 깨지면 null */
export function decMsg(b) {
  if (typeof b !== 'string' || !/^[A-Za-z0-9_-]{2,400}$/.test(b) || b.length % 4 === 1) return null;
  try {
    const bin = atob(b.replace(/-/g, '+').replace(/_/g, '/') + '='.repeat((4 - b.length % 4) % 4));
    return cleanMsg(new TextDecoder('utf-8', {fatal: true}).decode(Uint8Array.from(bin, c => c.charCodeAt(0))));
  } catch { return null; }
}
/** 보내는 주소의 앞 — 지금 쪽 그대로(시험판 /next/?dev=1 은 그대로 이어 감 · ?lang= 같은 다른 물음은 뺌) */
function baseHref() {
  if (typeof location === 'undefined') return 'https://aaa7377.com/';
  const dev = /[?&]dev=1(&|$)/.test(location.search) ? '?dev=1' : '';
  return location.origin + (/^\/next\/?(index\.html)?$/.test(location.pathname) ? location.pathname : '/') + dev;
}
/** 회사 주식 주소(명령문 [4] 6) — #/s/<번호>/<보낸 날>/<그날 값>/<s|a>[/<말>] */
export function stockUrl({code, day, price, kind = 'share', msg = ''}, base = baseHref()) {
  const m = encMsg(msg);
  return base + '#/s/' + code + '/' + day + '/' + Math.round(Number(price)) + '/' + (kind === 'ask' ? 'a' : 's') + (m ? '/' + m : '');
}
/** #/s/ 뒤 → {code, day, price, kind, msg} · 꼴이 틀리면 null · 말이 깨졌으면 msg = null */
export function parseShare(arg) {
  const p = String(arg ?? '').replace(/[?#].*$/, '').split('/').filter((x, i, a) => x !== '' || i < a.length - 1);
  const [code, day, price, k = 's', m = ''] = p;
  if (p.length < 3 || p.length > 5 || !CODE_RE.test(code ?? '') || !DAY_RE.test(day ?? '') || !/^[1-9]\d{0,9}$/.test(price ?? '') || !['s', 'a'].includes(k)) return null;
  const t = Date.parse(day + 'T00:00:00Z'); if (!Number.isFinite(t) || new Date(t).toISOString().slice(0, 10) !== day) return null;
  return {code, day, price: +price, kind: k === 'a' ? 'ask' : 'share', msg: m ? decMsg(m) : ''};
}

/* 자료 — 앱이면 NX.getJson · 아니면 직접(/atlas/data/ 는 읽기만) */
function getJson(name) {
  const N = nx(); if (N?.getJson) return N.getJson(name);
  return fetch('/atlas/data/' + name, {cache: 'no-cache'}).then(r => (r.ok ? r.json() : null)).catch(() => null);
}
async function coInfo(code) { const j = await getJson('co/' + code + '.json'); const c = j?.c; return c ? {price: Number(c.price) > 0 ? Number(c.price) : null, day: DAY_RE.test(c.priceDate ?? '') ? c.priceDate : null, name: c.name ?? null, j} : {j}; }

/* 모양 — 앱은 NX.mod 가 붙임 · 소개 · 편지 쪽은 여기서 한 번(다 받을 때까지 기다림 · 1.5초까지) */
let cssP = null;
function css() {
  if (cssP) return cssP;
  let l = document.querySelector('link[rel="stylesheet"][href$="/next/p-share.css"]');
  if (l?.sheet) return (cssP = Promise.resolve());
  if (!l) { l = h('link', {rel: 'stylesheet', href: '/next/p-share.css'}); document.head.append(l); }
  cssP = new Promise(res => { l.addEventListener('load', res, {once: true}); l.addEventListener('error', res, {once: true}); setTimeout(res, 1500); });
  return cssP;
}
function toast(t) { const e = h('p', {class: 'ps-toast', role: 'status', text: t}); document.body.append(e); setTimeout(() => e.remove(), 2800); }

/* 카카오 공식 카드 — 꺼 둠(명령문 [4] 9 「카카오 앱 열쇠와 보안 규칙 허락이 있어야 켠다」)
   켜는 법 docs/design/godori-2026-10-17/kakao.md — 앱 열쇠(key) · 보안 규칙 script-src 허락 · 도구를 부르는 곳을 함께 바꿔야 켜짐 · 지금은 이 길을 지나지 않음 */
const KAKAO = Object.freeze({on: false, key: '', sdk: '', integrity: ''}); // 켤 때 채움(sdk = 카카오 도구 주소 · integrity = 그 판의 SRI 값) — 지금은 비어 있어 아무것도 받지 않음
let kakaoP = null;
/** 카카오 도구 받기 — KAKAO.on 일 때만(지금은 늘 false) · 보안 규칙 script-src 에 그 주소가 허락돼 있어야 함 */
function kakaoLoad() {
  if (!KAKAO.on || !KAKAO.key || !KAKAO.sdk || !KAKAO.integrity) return Promise.resolve(false);
  if (!kakaoP) kakaoP = new Promise(res => {
    const s = h('script', {src: KAKAO.sdk, integrity: KAKAO.integrity, crossorigin: 'anonymous'});
    s.addEventListener('load', () => { try { if (!globalThis.Kakao.isInitialized()) globalThis.Kakao.init(KAKAO.key); res(true); } catch { res(false); } }, {once: true});
    s.addEventListener('error', () => res(false), {once: true});
    document.head.append(s);
  });
  return kakaoP;
}
function kakaoSend({text, url}) {
  const K = globalThis.Kakao;
  if (!KAKAO.on || !KAKAO.key || !K?.isInitialized?.() || !K.Share?.sendDefault) return false;
  try { K.Share.sendDefault({objectType: 'text', text, link: {mobileWebUrl: url, webUrl: url}, buttonTitle: '열어 보기'}); return true; } catch { return false; }
}

/** 보내기 — 공유 창(글 + 주소) → 없거나 막히면 글 + 주소 복사 → 그것도 막히면 'show' · 누른 손길 안에서 바로 부름(사이에 기다림 없음) */
async function deliver({title, text, url}) {
  const full = text + '\n' + url;
  if (kakaoSend({text, url})) return 'kakao';
  if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
    try { await navigator.share({title, text, url}); return 'share'; }
    catch (e) { if (e?.name === 'AbortError') return 'cancel'; } // 닫음 — 다른 까닭이면 복사로
  }
  try { await navigator.clipboard.writeText(full); return 'copy'; } catch {}
  return 'show';
}

/** 걸린 말 → 고칠 글 한 줄(걸린 낱말은 쓴 사람의 글이라 data-proper — 화면 쓰지 않을 말 셈 밖) · 글상자에서 그 낱말 자리 */
function badSay(x) {
  const w = x.word, q = h('span', {'data-proper': '', text: `「${w}」`});
  if (x.kind === '수익 자랑') return [q, ' 같은 수익 숫자는 보내지 않아요. 왜 그렇게 봤는지만 적어 줘.'];
  return [q, `${hasBatchim(w) ? '은' : '는'} ${x.kind}${ira(x.kind)} 못 보내요. 고쳐 줄래?`];
}
function findIn(v, w) {
  const chars = Array.from(String(w).replace(/\s+/g, '')); if (!chars.length) return null;
  const re = new RegExp(chars.map(c => c.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('\\s*'), 'i'), m = re.exec(v);
  return m ? [m.index, m.index + m[0].length] : null;
}

let CUR = null, SEQ = 0;
/** 「친구에게 무슨 말을 할래?」 — 닫히면 {how: 'share' | 'copy' | 'show' | 'cancel' | 'close' | 'kakao', text, url} */
export async function open(o = {}) {
  if (CUR) CUR.close('replace');
  const my = ++SEQ;
  await css();
  const code = String(o.code ?? ''), stock = CODE_RE.test(code);
  const kind = o.kind === 'ask' && stock ? 'ask' : 'share';
  let day = DAY_RE.test(o.day ?? '') ? o.day : null, price = Number(o.price) > 0 ? Number(o.price) : null, name = o.name ?? null;
  if (stock && (!day || !price || !name)) { const c = await coInfo(code); day = day ?? c.day; price = price ?? c.price; name = name ?? c.name; }
  if (my !== SEQ) return {how: 'close', text: null, url: null}; // 받는 사이에 다른 보내기를 눌렀음 — 새 것만 엶
  const asStock = stock && !!day && !!price;
  const title = noGain(o.title) || NAME, lead = noGain(o.text);
  const urlFor = msg => (asStock ? stockUrl({code, day, price, kind, msg}) : String(o.url || (typeof location !== 'undefined' ? location.href : '')));
  const opener = document.activeElement;

  const ta = h('textarea', {id: 'ps-t', class: 'ps-t', rows: 2, maxlength: MAX, placeholder: '예) ' + DEF[kind], 'aria-describedby': 'ps-c ps-m', autocomplete: 'off'});
  const cnt = h('span', {id: 'ps-c', class: 'ps-c', text: '0 / ' + MAX});
  const say = h('p', {id: 'ps-m', class: 'ps-m', role: 'status', 'aria-live': 'polite'});
  const urlEl = h('span', {class: 'ps-url', text: urlFor('')});
  const go = h('button', {class: 'ps-go', type: 'button', text: '보내기'});
  const x = h('button', {class: 'ps-x', type: 'button', text: '닫기'});
  const quick = h('div', {class: 'ps-q', role: 'group', 'aria-label': '빠른 말'}, ...QUICK.map(q => h('button', {class: 'ps-qb', type: 'button', text: q, onclick: () => { ta.value = q; judge(); ta.focus(); }})));
  const what = asStock
    ? (kind === 'ask'
      ? [h('b', {text: name ?? code}), `${josa(name ?? code, '을').slice(String(name ?? code).length)} 친구와 같이 따져 봐요. 친구에게 「${ASK_Q}」를 물어요.`]
      : [h('b', {text: name ?? code}), ` · ${md(day)} 값 ${num(price)}원을 같이 보내요.`])
    : [h('b', {text: title})];
  const note = asStock ? '수익 숫자는 보내지 않아요. 친구는 질문에 다 답한 뒤에 네 말을 봐요.' : '수익 숫자는 보내지 않아요. 자랑이 퍼지면 남이 따라 하거든.';
  const leadEl = lead ? h('p', {class: 'ps-lead'}, h('span', {class: 'ps-pk', text: '같이 가는 글 '}), lead) : null;
  const shown = h('textarea', {class: 'ps-t ps-show', rows: 4, readonly: true, 'aria-label': '보낼 글과 주소', hidden: true});
  const box = h('div', {class: 'ps-in'},
    h('h2', {id: 'ps-h', class: 'ps-h', text: '친구에게 무슨 말을 할래?'}),
    h('p', {id: 'ps-d', class: 'ps-d'}, ...what),
    quick,
    h('div', {class: 'ps-lrow'}, h('label', {class: 'ps-lab', for: 'ps-t', text: '보낼 말'}), cnt), ta, say,
    h('p', {class: 'ps-n', text: note}), leadEl,
    h('p', {class: 'ps-pv'}, h('span', {class: 'ps-pk', text: '같이 가는 주소 '}), urlEl), shown);
  const acts = h('div', {class: 'ps-acts ps-stick'}, go, x); // 보내기 · 닫기는 늘 보이게(칸 밑에 붙음)
  const native = typeof HTMLDialogElement === 'function' && typeof HTMLDialogElement.prototype.showModal === 'function';
  const D = native ? h('dialog', {class: 'ps-dlg', 'aria-labelledby': 'ps-h', 'aria-describedby': 'ps-d'}, box, acts)
    : h('div', {class: 'ps-dlg ps-fb', role: 'dialog', 'aria-modal': 'true', 'aria-labelledby': 'ps-h', 'aria-describedby': 'ps-d'}, box, acts);
  let last = 'close', sent = null, done = null, closed = false;
  const result = new Promise(res => { done = res; });

  function hitsNow() { return sendHits(ta.value); }
  function judge() {
    const v = ta.value, n = Array.from(v.trim()).length; cnt.textContent = n + ' / ' + MAX;
    const bad = hitsNow();
    go.setAttribute('aria-disabled', String(bad.length > 0));
    say.className = 'ps-m' + (bad.length ? ' no' : '');
    say.replaceChildren(...(bad.length ? badSay(bad[0]) : []));
    if (asStock) urlEl.textContent = urlFor(bad.length ? '' : cleanMsg(v) || DEF[kind]); // 보낼 때와 같은 주소(비면 기본 말)
    return bad;
  }
  ta.addEventListener('input', judge);
  let busy = false; // 공유 창이 열려 있는 동안 다시 누름은 버림
  go.addEventListener('click', () => {
    if (busy) return;
    const msg = cleanMsg(ta.value) || DEF[kind], bad = judge().length ? hitsNow() : sendHits(msg);
    if (bad.length) { say.className = 'ps-m no'; say.replaceChildren(...badSay(bad[0])); go.setAttribute('aria-disabled', 'true'); const r = findIn(ta.value, bad[0].word); ta.focus(); if (r) ta.setSelectionRange(r[0], r[1]); return; }
    const url = urlFor(msg), text = [msg, lead].filter(Boolean).join('\n');
    sent = {text, url};
    say.className = 'ps-m'; say.textContent = '여는 중이에요…'; busy = true;
    deliver({title, text, url}).then(r => {
      busy = false; last = r;
      if (r === 'share' || r === 'kakao') { close(r); toast(asStock ? '보냈어요. 친구가 열면 질문부터 봐요.' : '보냈어요.'); return; }
      if (r === 'cancel') { say.textContent = '보내기 창을 닫았어요. 다시 누르면 돼.'; return; }
      if (r === 'copy') { say.className = 'ps-m ok'; say.textContent = '글과 주소를 함께 담았어요. 카톡 대화창에 붙여 넣어 보내 줘.'; return; }
      shown.hidden = false; shown.value = text + '\n' + url; shown.focus(); shown.select();
      say.className = 'ps-m ok'; say.textContent = '담기가 막혔어요. 위 글을 길게 눌러 복사해 줘.';
    });
  });
  x.addEventListener('click', () => close('close'));
  // 갇힌 차례(Tab) · Esc 닫기 — 열린 칸 밖으로 나가지 않음
  D.addEventListener('keydown', e => {
    if (e.key === 'Escape') { e.preventDefault(); close('close'); return; }
    if (e.key !== 'Tab') return;
    const f = [...D.querySelectorAll('button, textarea, a[href], input')].filter(el => !el.hidden && !el.closest('[hidden]') && el.getClientRects().length);
    if (!f.length) return;
    const a = f[0], z = f[f.length - 1];
    if (e.shiftKey && document.activeElement === a) { e.preventDefault(); z.focus(); }
    else if (!e.shiftKey && document.activeElement === z) { e.preventDefault(); a.focus(); }
  });
  if (native) D.addEventListener('cancel', e => { e.preventDefault(); close('close'); });
  function close(r) {
    if (closed) return; closed = true;
    if (r === 'replace') last = 'close';
    try { if (native && D.open) D.close(); } catch {}
    D.remove(); document.documentElement.classList.remove('ps-open');
    if (CUR?.D === D) CUR = null;
    if (opener && typeof opener.focus === 'function' && document.contains(opener)) opener.focus({preventScroll: true});
    done({how: r === 'share' || r === 'kakao' ? r : last, text: sent?.text ?? null, url: sent?.url ?? urlFor('')});
  }
  document.body.append(D); document.documentElement.classList.add('ps-open');
  if (native) D.showModal();
  kakaoLoad(); // 꺼 둠 — KAKAO.on 이 false 라 아무것도 받지 않음(켜면 글상자를 열 때 미리 받아 보내기 누름 안에서 바로 부름)
  CUR = {D, close};
  if (o.prefill) ta.value = cleanMsg(o.prefill);
  judge();
  quick.querySelector('button')?.focus();
  return result;
}
/** 같이 따져 줘(명령문 [4] 8) — 회사 주식만 · 아니면 보통 보내기 */
export const ask = o => open({...o, kind: 'ask'});
/** 앱 보내기 단추 — 「보내기」 + 회사 주식이면 「같이 따져 줘」 · cls = 앱 단추 꼴(.act 등) · 누르면 NX.shareBox 가 있으면 그리로(아니면 바로 open) */
export function shareButtons(o, {cls = 'act', shareText = '보내기', askText = '같이 따져 줘'} = {}) {
  const run = k => () => { const N = nx(), oo = {...o, kind: k}; if (N?.shareBox) N.shareBox(oo); else open(oo); };
  const out = [h('button', {class: cls, type: 'button', text: shareText, onclick: run('share')})];
  if (CODE_RE.test(String(o?.code ?? ''))) out.push(h('button', {class: cls + ' ps-askb', type: 'button', text: askText, onclick: run('ask')}));
  return out;
}

/* ───── 친구가 연 주소 #/s/… (명령문 [4] 6 · 7 · 8) ───── */
/** 보낸 날부터 오늘까지 선 — 금빛 점 = 보낸 날 · 끝 점 = 오늘 · 값이 없으면 빈 축 */
function priceArt(vals, at, dir) {
  const W = 320, H = 120, s = sv('svg', {class: 'ps-art', viewBox: `-10 -12 ${W + 20} ${H + 24}`, role: 'img', 'aria-label': '보낸 날부터 오늘까지 마감 값 선'});
  const v = vals.filter(Number.isFinite);
  s.append(sv('line', {x1: 0, y1: H, x2: W, y2: H, class: 'ps-ax'}));
  if (v.length < 2) return s;
  const lo = Math.min(...v), hi = Math.max(...v), n = vals.length, xy = i => [i * W / (n - 1), (hi - vals[i]) * H / ((hi - lo) || 1)];
  s.append(sv('polyline', {points: vals.map((_, i) => xy(i).map(q => q.toFixed(1)).join(',')).join(' '), class: 'ps-ln ' + dir}));
  if (at != null && at >= 0 && at < n) { const [x0, y0] = xy(at); s.append(sv('circle', {cx: x0.toFixed(1), cy: y0.toFixed(1), r: 8, class: 'ps-sent'})); }
  const [x1, y1] = xy(n - 1); s.append(sv('circle', {cx: x1.toFixed(1), cy: y1.toFixed(1), r: 6, class: 'ps-end ' + dir}));
  return s;
}
const SAFE = () => h('p', {class: 'ps-safe', text: `${josa(NAME, '는')} 지난 기록만 보여 줘요. 사고팔기를 권하지 않아요.`});

export async function render(arg) {
  const S = parseShare(arg);
  if (!S) return {title: '?', nodes: [h('section', {class: 'ps-land'}, h('h1', {class: 'ps-name', text: '? 주소가 이상해요'}),
    h('p', {class: 'ps-p', text: '친구가 보낸 주소가 잘렸거나 바뀌었어요. 친구에게 다시 보내 달라고 해 봐.'}), h('a', {class: 'ps-link', href: '#/', text: '첫 화면으로 ›'})), SAFE()]};
  const N = nx(), [c, days, G] = await Promise.all([coInfo(S.code), getJson('days.json'), N?.gdr ? N.gdr().catch(() => null) : null]);
  let name = c.name;
  if (!name && N?.need) { const m = await N.need('mkt').catch(() => null); name = m?.companies?.[S.code]?.n ?? null; }
  name = name ?? S.code;
  // 보낸 날 값 = 주소의 값(보낸 사람이 본 값) · 기록의 그날 마감과 다르면 「?」 · 오늘 값 = 기록의 마지막 마감(co.c.price · priceDate)
  const close = Array.isArray(c.j?.close) ? c.j.close : null, k0 = Number.isInteger(c.j?.k0) ? c.j.k0 : 0, D = Array.isArray(days?.dates) ? days.dates : null;
  const sentIdx = close && D ? D.indexOf(S.day) - k0 : -1, sentRec = sentIdx >= 0 && sentIdx < (close?.length ?? 0) ? close[sentIdx] : null;
  const now = c.price, nowDay = c.day, later = now != null && nowDay != null && nowDay >= S.day;
  const dir = !later ? 'q' : now > S.price ? 'up' : now < S.price ? 'dn' : 'fl';
  const cmp = !later ? '? 오늘 값을 아직 못 받았어요.' : dir === 'up' ? '보낸 날보다 올랐어요.' : dir === 'dn' ? '보낸 날보다 내렸어요.' : '보낸 날과 같아요.';
  let vals = [], at = null;
  if (close?.length) {
    const from = sentIdx >= 0 ? Math.max(0, sentIdx - 5) : Math.max(0, close.length - 20);
    vals = close.slice(from).map(Number); at = sentIdx >= 0 ? sentIdx - from : null;
  }
  const head = h('section', {class: 'ps-land', 'aria-label': S.kind === 'ask' ? '친구가 같이 따져 달래요' : '친구가 보낸 종목'},
    h('p', {class: 'ps-kick', text: S.kind === 'ask' ? '친구가 같이 따져 달래요' : '친구가 보낸 종목'}),
    h('h1', {class: 'ps-name'}, h('span', {'data-proper': '', text: name}), h('small', {class: 'ps-code', text: ' ' + S.code})),
    h('figure', {class: 'ps-fig'}, priceArt(vals, at, dir === 'q' ? 'fl' : dir),
      h('figcaption', {class: 'ps-cap'}, at != null ? [h('span', {class: 'ps-dot', 'aria-hidden': 'true'}), ' 보낸 날 · 끝 점 = 오늘 값'] : (vals.length ? '보낸 날은 그림보다 앞이에요 · 끝 점 = 오늘 값' : '? 값 기록을 못 받았어요'))),
    h('div', {class: 'ps-two'},
      h('div', {class: 'ps-v'}, h('span', {class: 'ps-vk', text: '보낸 날 값'}), h('b', {class: 'ps-vn', text: num(S.price) + '원'}), h('small', {class: 'ps-vd', text: md(S.day)}),
        sentRec != null && Math.round(sentRec) !== S.price ? h('small', {class: 'ps-q', text: `? 기록의 그날 마감은 ${num(sentRec)}원이에요`}) : null),
      h('div', {class: 'ps-v'}, h('span', {class: 'ps-vk', text: '오늘 값'}), h('b', {class: 'ps-vn ' + dir, text: later ? num(now) + '원' : '?'}), h('small', {class: 'ps-vd', text: later ? md(nowDay) + ' 마감 기록' : '?'}))),
    h('p', {class: 'ps-cmp ' + dir, text: cmp}));
  // 왜 사? 질문부터(명령문 [4] 7) — 보낸 사람 말은 다 답한 뒤에야 화면에 넣음(그 전엔 글 자체가 없음)
  const slot = h('div', {class: 'ps-why'}), after = h('section', {class: 'ps-after', 'aria-live': 'polite'});
  const lock = h('p', {class: 'ps-lock', text: S.kind === 'ask' ? '질문에 다 답하면 친구 물음이 열려요.' : '질문에 다 답하면 친구 말이 열려요.'});
  after.append(lock);
  let opened = false;
  /** rec = 왜 사? 기록(onDone) — 같이 따져 줘면 rec.why(「1년 뒤 반토막 났다면 왜?」 답)를 친구 생각으로 씀 */
  const reveal = rec => {
    if (opened) return; opened = true;
    if (S.kind === 'ask') after.replaceChildren(...askPart(S, name, now, nowDay, later, typeof rec?.why === 'string' ? cleanMsg(rec.why) : ''));
    else after.replaceChildren(...msgPart(S, name, now, nowDay, later));
  };
  try {
    const W = await (N?.mod ? N.mod('why') : import('./p-why.js'));
    const card = W.whyCard(G, {code: S.code, onDone: rec => reveal(rec)});
    slot.append(card);
    // 질문 칸이 끝을 알리지 않는 판이어도 결과 칸이 그려지면 엶(onDone 이 먼저 불리면 그쪽 기록을 씀)
    const mo = new MutationObserver(() => { if (card.querySelector('.wy-res')) { mo.disconnect(); queueMicrotask(() => reveal(null)); } });
    mo.observe(card, {childList: true, subtree: true});
  } catch (e) {
    console.error(e); slot.append(h('p', {class: 'ps-p', text: '? 질문을 열지 못했어요. 친구 말을 바로 보여 줄게.'})); reveal(null);
  }
  const askLine = S.kind === 'ask' ? h('p', {class: 'ps-askline'}, h('span', {text: '친구 물음 '}), h('b', {text: '「' + ASK_Q + '」'}), h('br'), h('span', {class: 'ps-p', text: '질문 끝에 그 까닭을 적는 칸이 있어.'})) : null;
  return {title: name + ' · 친구가 보냄', nodes: [head,
    h('section', {class: 'ps-step'}, h('h2', {class: 'ps-h2', text: '먼저 네 생각부터'}), h('p', {class: 'ps-p', text: '친구 말을 보기 전에 왜 사는지 먼저 확인해 봐.'}), askLine, slot),
    after, SAFE()]};
}
/** 보낸 사람 말(남의 글 data-proper) · 깨졌거나 거르는 말이 든 주소는 말을 보이지 않음 */
function senderMsg(S) {
  if (S.msg == null) return h('p', {class: 'ps-p', text: '? 보낸 말이 깨져서 보여 줄 수 없어요.'});
  if (!S.msg) return h('p', {class: 'ps-p', text: '친구가 따로 남긴 말은 없어요.'});
  if (sendHits(S.msg).length) return h('p', {class: 'ps-p', text: '? 보낸 말에 거르는 말이 있어서 보여 주지 않아요.'});
  return h('blockquote', {class: 'ps-said'}, h('span', {'data-proper': '', text: '「' + S.msg + '」'}));
}
/** 이 종목을 내가 다시 보내기 — 오늘 값이 있으면 오늘 값 · 날로(없으면 보낸 날 것) · prefill = 글상자에 미리 넣을 말 */
function againBtn(S, name, now, nowDay, later, label, prefill) {
  return h('button', {class: 'ps-go', type: 'button', text: label, onclick: () => {
    const N = nx(), o = {kind: 'share', code: S.code, name, price: later ? now : S.price, day: later ? nowDay : S.day, title: name + ' · ' + NAME, prefill};
    if (N?.shareBox) N.shareBox(o); else open(o);
  }});
}
function msgPart(S, name, now, nowDay, later) {
  return [h('h2', {class: 'ps-h2', text: '친구가 보낸 말'}), senderMsg(S),
    h('div', {class: 'ps-acts'}, againBtn(S, name, now, nowDay, later, '나도 친구에게 보내기'), h('a', {class: 'ps-link', href: '#/w/' + S.code, text: '이 회사 자세히 보기 ›'}))];
}
/** 같이 따져 줘 — 「반토막 난다면 왜일까?」 친구 생각(왜 사? 두 줄 ① 답 · mine) 뒤에 보낸 사람 말 · 답장은 글상자로
    mine 이 없으면(질문 칸이 기록을 안 넘김) 여기서 한 줄 받음 — 답은 이 화면에만(어디에도 남기지 않음) */
function askPart(S, name, now, nowDay, later, mine) {
  if (mine) return [h('h2', {class: 'ps-h2 ps-askq', text: ASK_Q}),
    h('p', {class: 'ps-mine'}, h('span', {class: 'ps-pk', text: '내 생각 '}), h('span', {'data-proper': '', text: '「' + mine + '」'})),
    h('h2', {class: 'ps-h2', text: '친구가 보낸 말'}), senderMsg(S),
    h('div', {class: 'ps-acts'}, againBtn(S, name, now, nowDay, later, '친구에게 내 생각 보내기', '반토막 난다면 ' + mine), h('a', {class: 'ps-link', href: '#/w/' + S.code, text: '이 회사 자세히 보기 ›'}))];
  const ta = h('textarea', {id: 'ps-ask', class: 'ps-t', rows: 2, maxlength: MAX, placeholder: '예) 파는 물건이 덜 팔리면', 'aria-describedby': 'ps-askm'});
  const m = h('p', {id: 'ps-askm', class: 'ps-m', role: 'status', 'aria-live': 'polite'}), rest = h('div', {class: 'ps-rest'});
  const okB = h('button', {class: 'ps-go', type: 'button', text: '다 적었어'});
  const idk = h('button', {class: 'ps-qb', type: 'button', text: '잘 모르겠어', onclick: () => { ta.value = '잘 모르겠어'; ta.focus(); }});
  okB.addEventListener('click', () => {
    const t = cleanMsg(ta.value), bad = sendHits(t);
    if (Array.from(t).length < 2) { m.className = 'ps-m no'; m.textContent = '한 줄만 적어 봐. 「잘 모르겠어」도 괜찮아.'; ta.focus(); return; }
    if (bad.length) { m.className = 'ps-m no'; m.replaceChildren(...badSay(bad[0])); const r = findIn(ta.value, bad[0].word); ta.focus(); if (r) ta.setSelectionRange(r[0], r[1]); return; }
    m.className = 'ps-m'; m.textContent = '';
    okB.remove(); idk.remove(); ta.readOnly = true;
    rest.replaceChildren(h('h2', {class: 'ps-h2', text: '친구가 보낸 말'}), senderMsg(S),
      h('div', {class: 'ps-acts'}, againBtn(S, name, now, nowDay, later, '친구에게 내 생각 보내기', '반토막 난다면 ' + t), h('a', {class: 'ps-link', href: '#/w/' + S.code, text: '이 회사 자세히 보기 ›'})));
  });
  return [h('h2', {class: 'ps-h2 ps-askq', text: ASK_Q}),
    h('p', {class: 'ps-p', text: '친구가 같이 따져 달래. 1년 뒤 반토막 났다면 왜일지 한 줄로 적어 봐.'}),
    h('label', {class: 'ps-lab', for: 'ps-ask', text: '내 생각'}), ta, m, h('div', {class: 'ps-acts'}, idk, okB), rest];
}
