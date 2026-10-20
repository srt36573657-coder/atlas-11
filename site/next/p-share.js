/* 고도리 보내기 — 「친구에게 무슨 말을 할래?」 글상자 · 친구가 연 주소(#/s/…) 화면
   사장님 2026-10-17 21:10(싱가포르) 「고도리 · 하나로 묶은 명령문」 [4] 1 ~ 9 · 일 나누기 docs/design/godori-2026-10-17/brief2.md(일꾼 C)
   open(o) — 모든 보내기 단추가 부름(앱 NX.shareBox · 소개 쪽 /hello-send.js · 편지 쪽 /letter.js) · 앱(globalThis.NX) 없이도 돎
     o = {kind: 'share' | 'ask', title, url, code?, price?, day?, name?, text?}
       · text = 같이 가는 그 쪽 소개 한 줄(고칠 수 없음 · 글상자 셈 밖) · 사람이 쓰는 말 = 글상자(50자까지)
     차례: 글상자 + 빠른 말 셋 → words.js 로 거름(걸리면 그 낱말을 골라 보여 주고 고칠 때까지 못 보냄 · 수익 숫자도) →
           휴대폰 공유 창에 글 + 주소 함께 → 공유 창이 없으면 글 + 주소를 함께 복사 → 복사도 막히면 글을 보여 주고 골라 둠
   주소(회사 주식): <곳>#/s/<번호>/<보낸 날>/<그날 값>/<s|a>[/<말>] — s = 보내기 · a = 같이 따져 줘 · 말 = UTF-8 → base64url(150바이트까지 · 200자 안)
   render(arg) — 친구가 연 주소: 종목 이름(맨 위 한 줄) → 왜 사? 질문부터 → 다 답한 뒤에 보낸 사람 말 · 같이 따져 줘면 「반토막 난다면 왜일까?」 → 맨 밑에 보낸 날 값 · 오늘 값(그림 한 장 · 사장님 2026-10-18 [5] 10 「질문을 맨 위로 · 값 칸은 질문 뒤로」)
   보안 규칙 안: innerHTML · 글 속 style 없음 · 다른 주소 스크립트 없음 — 이 파일은 카카오 도구도 카카오 주소도 받지 않음
   카톡(사장님 2026-10-18 [2] 2 ~ 7 · 일꾼 K2c → 2026-10-18 16:39 「진화가 본질인 명령문」 [6] · [7] · 일꾼 KB1): 공유 스위치가 켜졌고 카카오 도구가 켜졌을 때만(NX.kakao.share · sdkReady) —
     보내기 = 카카오 그림 카드 하나(종목 이름 · 보낸 사람 말 · 보낸 날 값 · 단추: 가입이 꺼짐 = 「열어 보기」 하나 / 가입이 켜짐 = 「카카오로 시작하기」 · 「그냥 보기」) · 글상자에 그 카드 미리보기 ·
     빠른 말 셋은 누르는 즉시 보냄(카톡 단추 1 + 빠른 말 1 = 누름 두 번에 카톡 친구 고르기) · 보내는 글 첫 줄 = 종목 이름 · 그날 값(저절로 · 칠 것 0) · 급등 줄은 반값 한 줄(halfLine)
     offerBox() = 매매일지를 끝낸 뒤 한 번 뜨는 「이 기록 지키기」 칸(kakao.js 가 부름). 꺼져 있으면(NX.kakao 없음 · 공유 꺼짐 · 도구 없음) 카드 길은 한 줄도 안 돌고 휴대폰 공유 창(글 + 주소) → 글 + 주소 복사로 감
   이름은 brand.js 한 곳 · 거르는 말은 words.js 한 곳 */
import {sendHits} from './words.js';
import {shareButtons, kakaoButton} from './share-btn.js'; // 보내기 단추 한 곳(사장님 2026-10-18 16:39 [6] 2) — 옛 부르는 곳을 위해 아래에서 다시 내보냄
import {NAME, josa, hasBatchim} from './brand.js';
import {t as L} from './i18n.js'; // 보내는 글 속 붙박이 말(기본 말 · 「반토막 난다면」)은 지금 말로 — 화면 글은 엔진이 그려진 뒤 바꿈 · 한국어면 그대로
import {tally} from './tally.js'; // 합계 칸 참고 신호(사장님 2026-10-18 16:39 [10] · 일꾼 KD tally.js) — 보내기를 마친 때 한 번 · 몸은 {k} 하나 · 보내고 잊음(일꾼 KI)

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
/** 쓴 사람의 글(남의 글) — 한글이 있으면 lang="ko"(엔진이 바꾸지 않음 · p-why mine() 과 같음) */
const own = (cls, txt) => h('span', {class: cls, 'data-proper': '', lang: /[가-힣]/.test(txt) ? 'ko' : null, text: txt});

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
/** 회사 값(이름 · 오늘 값 · 그날) — 회사 파일 co/<번호>.json 의 c · 없으면 고른 곳 파일 comp.json companies[번호]
    (고른 곳 56곳은 회사 파일에 c 가 없고 값이 comp.json 에만 있음 — app.js vWatch 와 같은 셈 · 일꾼 KB2 알림 2026-10-18: #/f/pick · #/today 첫 줄들 · 친구가 연 쪽 오늘 값도) · j = 회사 파일(마감 기록) */
async function coInfo(code) {
  const j = await getJson('co/' + code + '.json');
  const c = j?.c ?? (await getJson('comp.json'))?.companies?.[code] ?? null, pd = String(c?.priceDate ?? '').slice(0, 10);
  return c ? {price: Number(c.price) > 0 ? Number(c.price) : null, day: DAY_RE.test(pd) ? pd : null, name: c.name ?? null, j} : {j};
}

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

/* ───── 카톡 그림 카드 · 가입 권유(사장님 2026-10-18 [2] 2 ~ 8) ─────
   카카오 도구 · 서버 길은 NX.kakao(site/next/kakao.js)가 맡음 — 여기서는 카드에 무엇을 담을지 · 어떻게 보일지만 정함
   NX.kakao 가 없거나(소개 · 편지 쪽) 가입 · 공유가 다 꺼졌으면 kk() 가 null → 아래 길은 한 줄도 안 돎 */
const kk = () => { try { const K = nx()?.kakao; return K && (K.on === true || K.share === true) ? K : null; } catch { return null; } }; // 가입(서버) 또는 공유 스위치가 켜짐(사장님 2026-10-18 16:39 [7] 1 · 스위치 둘)
export const CARD_BTN = Object.freeze(['카카오로 시작하기', '그냥 보기']); // 가입이 켜졌을 때 카드 단추 둘 · 이 차례(1 = 가입 길 · 2 = 가입 없이 보기)
export const CARD_OPEN = '열어 보기'; // 가입이 꺼졌을 때 카드 단추 하나([7] 5)
const CARD_IMG = '/og-makbi.jpg'; // 카드 그림(우리 사이트 것)
/** 카드에 담는 것([7] 5) — 종목 이름 · 보낸 사람 글 · (급등이면 반값 한 줄) · 보낸 날 값(수익률 없음 · 늘 마지막 줄)
    단추: 가입이 꺼짐 = 「열어 보기」 하나(보낸 주소) · 가입이 켜짐(서버가 켜짐 — K.on 또는 미리보기 signup) = 1 우리 주소 → 곧바로 카카오 동의 화면(보낸 사람 표가 있으면 함께) · 2 보낸 주소 그대로(가입 없음)
    K = null 이면 가입 길 주소가 없음(미리보기용) */
export function cardOf({name, msg = '', lead = '', half = '', price, day, see, signup = null}, K = kk(), origin = typeof location !== 'undefined' ? location.origin : '') {
  const value = L(`${md(day)} 값 ${num(price)}원`), said = [msg, lead].filter(Boolean);
  const join = signup ?? K?.on === true;
  const start = K && join ? origin + K.startUrl(see, {ref: K.ref()}) : null;
  return {title: L(String(name)), value, said, half: half || null, description: [...said, half, value].filter(Boolean).join('\n'), imageUrl: origin + CARD_IMG, url: see,
    buttons: join ? [{title: L(CARD_BTN[0]), url: start}, {title: L(CARD_BTN[1]), url: see}] : [{title: L(CARD_OPEN), url: see}]};
}
/** 급등 카드 한 줄([6] 8 · 글은 리드가 정함 2026-10-18 17:27 · 사장님 17:25 「현명하게 해」) — 「1년 전 날아오른 36곳 중 n곳이 그 뒤 1년 안에 반값 아래로 떨어진 적 있어요」
    n · 36 = /next/data/half36.json {n, of}(일꾼 KG · 1년 전 이맘때 5거래일 오름 상위 36곳) · 파일이 없거나 깨졌거나 못 센 곳(unknown)이 있으면 '' — 줄을 뺌(짓지 않음)
    「1년 전 날아오른 · 그 뒤」를 붙인 까닭: 급등 칩의 옛 줄 「36곳 중 31곳이 지난 1년 안에 …」(지금 36곳의 지난 1년)과 셈이 달라 숫자가 헷갈리지 않게 */
export const halfLine = j => (j && Number.isInteger(j.n) && Number.isInteger(j.of) && j.of > 0 && j.n >= 0 && j.n <= j.of && !(Number(j.unknown) > 0) ? `1년 전 날아오른 ${j.of}곳 중 ${j.n}곳이 그 뒤 1년 안에 반값 아래로 떨어진 적 있어요` : '');
let halfP = null;
function halfOf(given) {
  if (given && halfLine(given)) return Promise.resolve(halfLine(given));
  halfP = halfP ?? fetch('/next/data/half36.json', {cache: 'no-cache'}).then(r => (r.ok ? r.json() : null)).then(halfLine).catch(() => '');
  return halfP.then(s => { if (!s) halfP = null; return s; });
}
/** 가입 권유 칸([2] 7) — 글 「이 기록 지키기」 + 단추 하나 「카카오로 시작하기」 · 입력칸 · 닫기 없음 · 누르면 start() 한 번(kakao.js 가 매매일지를 끝낸 순간 한 번만 그림) */
const OFFER_H = '이 기록 지키기', OFFER_P = '폰을 바꿔도 이 기록이 남아요. 받는 것은 카카오 회원 번호 하나뿐이에요.';
export function offerBox({start} = {}) {
  const go = h('button', {class: 'ps-go ps-offer-go', type: 'button', text: CARD_BTN[0]});
  let used = false;
  go.addEventListener('click', () => {
    if (used) return; used = true; go.setAttribute('aria-disabled', 'true');
    try { start?.(); } catch (e) { console.error(e); }
    setTimeout(() => { used = false; go.removeAttribute('aria-disabled'); }, 4000); // 이동이 안 됐으면 다시 누를 수 있게
  });
  return h('section', {class: 'ps-offer', 'aria-labelledby': 'ps-offer-h'}, h('h2', {id: 'ps-offer-h', class: 'ps-h2', text: OFFER_H}), h('p', {class: 'ps-p', text: OFFER_P}), go);
}

/** 보내기 — 카톡 그림 카드(켜짐 + 카드 있음) → 공유 창(글 + 주소) → 없거나 막히면 글 + 주소 복사 → 그것도 막히면 'show' · 누른 손길 안에서 바로 부름(사이에 기다림 없음) */
async function deliver({title, text, url, card = null}) {
  const full = text + '\n' + url;
  if (card) { try { if (kk()?.sendCard(card)) return 'kakao'; } catch { /* 카드가 안 가면 아래 공유 창으로 */ } }
  if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
    try { await navigator.share({title, text, url}); return 'share'; }
    catch (e) { if (e?.name === 'AbortError') return 'cancel'; } // 닫음 — 다른 까닭이면 복사로
  }
  try { await navigator.clipboard.writeText(full); return 'copy'; } catch {}
  return 'show';
}

/** 걸린 말 → 고칠 글 한 줄(걸린 낱말은 쓴 사람의 글이라 data-proper — 화면 쓰지 않을 말 셈 밖) · 글상자에서 그 낱말 자리 */
function badSay(x) {
  const w = x.word, q = own(null, `「${w}」`);
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
  const my = ++SEQ, h0 = typeof location !== 'undefined' ? location.hash : ''; // 누른 쪽 — 모양 · 회사 자료를 받는 사이 다른 쪽으로 가면 열지 않음(아래)
  await css();
  const code = String(o.code ?? ''), stock = CODE_RE.test(code);
  const kind = o.kind === 'ask' && stock ? 'ask' : 'share';
  const surge = stock && o.kind === 'surge'; // 급등 줄의 카톡 단추([6] 8) — 보내기와 같고 받는 카드 · 글에 반값 한 줄만 더함
  let day = DAY_RE.test(o.day ?? '') ? o.day : null, price = Number(o.price) > 0 ? Number(o.price) : null, name = o.name ?? null;
  const [c, halfTxt] = await Promise.all([stock && (!day || !price || !name) ? coInfo(code) : null, surge ? halfOf(o.half) : '']);
  if (c) { day = day ?? c.day; price = price ?? c.price; name = name ?? c.name; }
  if (my !== SEQ) return {how: 'close', text: null, url: null}; // 받는 사이에 다른 보내기를 눌렀음 — 새 것만 엶
  if (typeof location !== 'undefined' && location.hash !== h0) return {how: 'close', text: null, url: null}; // 받는 사이에 다른 쪽으로 감 — 늦게 떠서 다음 쪽을 덮지 않게(2026-10-20 실제 사이트 큰 시험 #/surge/30 · 40)
  const asStock = stock && !!day && !!price;
  const title = noGain(o.title) || (asStock && name ? L(name + ' · ' + NAME) : NAME), lead = noGain(o.text);
  const half = asStock && halfTxt ? L(halfTxt) : ''; // 보내는 글 · 카드에 들어가는 반값 한 줄(지금 말로) — 화면에는 한국어 원문(엔진이 바꿈)
  const head = asStock ? L(String(name ?? code)) + ' · ' + L(`${md(day)} 값 ${num(price)}원`) : ''; // 종목 이름 · 오늘 값은 저절로([6] 3 — 칠 글자 0) · 수익률 없음
  const urlFor = msg => (asStock ? stockUrl({code, day, price, kind, msg}) : String(o.url || (typeof location !== 'undefined' ? location.href : '')));
  const opener = document.activeElement;

  const ta = h('textarea', {id: 'ps-t', class: 'ps-t', rows: 2, maxlength: MAX, placeholder: '예) ' + DEF[kind], 'aria-describedby': 'ps-c ps-m', autocomplete: 'off'});
  const cnt = h('span', {id: 'ps-c', class: 'ps-c', text: '0 / ' + MAX});
  const say = h('p', {id: 'ps-m', class: 'ps-m', role: 'status', 'aria-live': 'polite'});
  const urlEl = h('span', {class: 'ps-url', text: urlFor('')});
  const go = h('button', {class: 'ps-go', type: 'button', text: '보내기'});
  const x = h('button', {class: 'ps-x', type: 'button', text: '닫기'});
  // 빠른 말 셋은 누르는 즉시 보냄([6] 4 — 카톡 단추 1 + 빠른 말 1 = 누름 두 번에 카톡 친구 고르기) · 보이는 글 그대로(영어면 바뀐 글) · 누른 손길 안에서 바로 보냄
  const quick = h('div', {class: 'ps-q', role: 'group', 'aria-label': '빠른 말'}, ...QUICK.map(q => h('button', {class: 'ps-qb', type: 'button', text: q, onclick: ev => { ta.value = ev.currentTarget.textContent || L(q); send(); }})));
  const what = asStock
    ? (kind === 'ask'
      ? [h('b', {text: name ?? code}), `${josa(name ?? code, '을').slice(String(name ?? code).length)} 친구와 같이 따져 봐요. 친구에게 「${ASK_Q}」를 물어요.`]
      : [h('b', {text: name ?? code}), ` · ${md(day)} 값 ${num(price)}원을 같이 보내요.`])
    : [h('b', {text: title})];
  const note = asStock ? '수익 숫자는 보내지 않아요. 친구는 질문에 다 답한 뒤에 네 말을 봐요.' : '수익 숫자는 보내지 않아요. 자랑이 퍼지면 남이 따라 하거든.';
  const leadEl = lead ? h('p', {class: 'ps-lead'}, h('span', {class: 'ps-pk', text: '같이 가는 글 '}), lead) : null;
  const halfEl = half ? h('p', {class: 'ps-lead ps-half'}, h('span', {class: 'ps-pk', text: '같이 가는 글 '}), halfTxt) : null; // 급등 — 받는 카드에도 같은 한 줄
  const shown = h('textarea', {class: 'ps-t ps-show', rows: 4, readonly: true, 'aria-label': '보낼 글과 주소', hidden: true});
  const kkEl = h('div', {class: 'ps-kk', hidden: true}); // 카톡 카드 미리보기 — 서버가 켜졌고 카카오 도구가 켜졌을 때만 보임(그 전엔 숨김) · 회사 주식 보내기만
  let kkOn = false;
  const box = h('div', {class: 'ps-in'},
    h('h2', {id: 'ps-h', class: 'ps-h', text: '친구에게 무슨 말을 할래?'}),
    h('p', {id: 'ps-d', class: 'ps-d'}, ...what),
    quick,
    h('div', {class: 'ps-lrow'}, h('label', {class: 'ps-lab', for: 'ps-t', text: '보낼 말'}), cnt), ta, say,
    h('p', {class: 'ps-n', text: note}), leadEl, halfEl, kkEl,
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
    if (asStock) urlEl.textContent = urlFor(bad.length ? '' : cleanMsg(v) || L(DEF[kind])); // 보낼 때와 같은 주소(비면 기본 말 · 지금 말로)
    if (kkOn) kkPaint(bad.length ? '' : cleanMsg(v) || L(DEF[kind]));
    return bad;
  }
  /** 카톡 카드 미리보기 — 보낼 카드(cardOf)와 같은 글: 종목 이름 · 보낸 사람 글 · (급등 반값 한 줄) · 보낸 날 값 · 단추(가입이 꺼짐 = 「열어 보기」 하나 · 켜짐 = 둘) */
  function kkPaint(msgNow) {
    const join = kk()?.on === true;
    const c = cardOf({name: name ?? code, msg: msgNow, lead, half: halfTxt, price, day, see: urlEl.textContent, signup: join}, null), nm = String(c.title);
    kkEl.replaceChildren(
      h('p', {class: 'ps-pk', text: '카톡 그림 카드로 가요'}),
      h('div', {class: 'ps-card', role: 'group', 'aria-label': '카드 미리보기'},
        h('b', {class: 'ps-card-t', text: nm}), // 이름은 지금 말로(영어면 영어 이름 · 엔진이 같은 이름표로 바꿈)
        ...c.said.map(s => own('ps-card-d', s)),
        c.half ? h('p', {class: 'ps-card-d ps-card-h', text: c.half}) : null,
        h('p', {class: 'ps-card-v', text: c.value}),
        h('p', {class: 'ps-card-b'}, ...(join ? CARD_BTN : [CARD_OPEN]).map(t => h('span', {text: t})))),
      join ? h('p', {class: 'ps-n', text: '가입은 친구가 직접 「카카오로 시작하기」를 눌러야 돼요. 보내기만으로는 가입되지 않아요.'}) : null);
  }
  function kkShow() { if (kkOn || closed || !asStock) return; kkOn = true; kkEl.hidden = false; judge(); }
  ta.addEventListener('input', judge);
  let busy = false; // 공유 창이 열려 있는 동안 다시 누름은 버림
  /** 보내기 — 「보내기」 단추와 빠른 말이 함께 씀(글칸의 말 · 비면 기본 말) · 걸리면 막고 그 낱말을 짚음 · 누른 손길 안에서 기다림 없이 카드 · 공유 창을 엶 */
  function send() {
    if (busy) return;
    const msg = cleanMsg(ta.value) || L(DEF[kind]), bad = judge().length ? hitsNow() : sendHits(msg);
    if (bad.length) { say.className = 'ps-m no'; say.replaceChildren(...badSay(bad[0])); go.setAttribute('aria-disabled', 'true'); const r = findIn(ta.value, bad[0].word); ta.focus(); if (r) ta.setSelectionRange(r[0], r[1]); return; }
    const url = urlFor(msg), text = [head, msg, lead, half].filter(Boolean).join('\n');
    const K = kk(), card = asStock && K?.canSend?.() ? cardOf({name: name ?? code, msg, lead, half, price, day, see: url}, K) : null; // 공유 스위치 + 도구가 켜졌으면 카드(누른 손길 안에서 만들어 바로 보냄 → 카톡 친구 고르기)
    sent = {text, url};
    say.className = 'ps-m'; say.textContent = '여는 중이에요…'; busy = true;
    deliver({title, text, url, card}).then(r => {
      busy = false; last = r;
      if (r === 'kakao' || r === 'share' || r === 'copy') tally('share'); // 보내기 마침 = 카톡 친구 고르기를 엶 · 공유 창을 마침 · 글과 주소를 담음(닫음 · 담기 막힘은 셈 밖)
      // 보낸 뒤 = 보던 자리 그대로(글상자만 닫고 연 단추로 돌아감 · 쪽 이동 · 폭죽 없음 [6] 7)
      if (r === 'share' || r === 'kakao') { close(r); toast(r === 'kakao' ? '카톡 친구 고르기를 열었어요.' : asStock ? '보냈어요. 친구가 열면 질문부터 봐요.' : '보냈어요.'); return; }
      if (r === 'cancel') { say.textContent = '보내기 창을 닫았어요. 다시 누르면 돼.'; return; }
      if (r === 'copy') { say.className = 'ps-m ok'; say.textContent = '글과 주소를 함께 담았어요. 카톡 대화창에 붙여 넣어 보내 줘.'; return; }
      shown.hidden = false; shown.value = text + '\n' + url; shown.focus(); shown.select();
      say.className = 'ps-m ok'; say.textContent = '담기가 막혔어요. 위 글을 길게 눌러 복사해 줘.';
    });
  }
  go.addEventListener('click', send);
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
  CUR = {D, close};
  // 서버가 켜졌고 카카오 도구가 켜졌으면 카드 미리보기를 그림(꺼져 있으면 아무 일도 없음 · 글상자는 기다리지 않고 먼저 열림)
  if (asStock) { try { nx()?.kakao?.sdkReady?.().then(ok => { if (ok && my === SEQ) kkShow(); }).catch(() => {}); } catch { /* 카카오 없음 */ } }
  if (o.prefill) ta.value = cleanMsg(o.prefill);
  judge();
  quick.querySelector('button')?.focus();
  return result;
}
/** 같이 따져 줘(명령문 [4] 8) — 회사 주식만 · 아니면 보통 보내기 */
export const ask = o => open({...o, kind: 'ask'});
/** 보내기 단추는 share-btn.js 한 곳(사장님 2026-10-18 16:39 [6] 2) — 옛 부르는 곳을 위해 다시 내보냄 · 카톡 단추 = shareButtons(o, {kakao: true}) */
export {shareButtons, kakaoButton};

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
  // 맨 위는 종목 이름 한 줄뿐 — 질문이 그 바로 밑(사장님 2026-10-18 [5] 10 「친구가 연 쪽에서는 질문을 맨 위로 · 값 칸(422px)은 질문 뒤로」) · 값 칸(그림 · 두 값 · 견줌)은 질문 · 친구 말 칸 뒤
  const kickText = S.kind === 'ask' ? '친구가 같이 따져 달래요' : '친구가 보낸 종목';
  const top = h('section', {class: 'ps-land ps-top', 'aria-label': kickText},
    h('h1', {class: 'ps-name'}, h('span', {class: 'ps-kick', text: kickText}), ' ', h('span', {'data-proper': '', text: name}), h('small', {class: 'ps-code', text: ' ' + S.code}))); // 이름표 + 이름 + 번호가 한 줄(들어가면) — 질문이 위로 올라 답 셋이 아래 탭 위에 다 보이게 · 글 시작 왼쪽 줄 한 줄
  const valsBox = h('section', {class: 'ps-land ps-vals'},
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
  // 질문 카드는 이름 한 줄 바로 밑 — 옛 머리글 「먼저 네 생각부터」 · 설명 한 줄은 지움(카드 머리 「친구야, 왜 사?」 · 「사기 전에 …」와 밑의 「질문에 다 답하면 …」 잠금 글이 같은 말) ·
  // 같이 따져 줘 물음 칸은 카드 밑으로(독립 점검 VJ 2026-10-18: 360×640 에서 답 셋이 아래 탭(572px~) 밑에 가려졌음 → 카드가 위로 올라 답 셋이 탭 위에 다 보임)
  return {title: name + ' · 친구가 보냄', nodes: [top,
    h('section', {class: 'ps-step'}, slot, askLine),
    after, valsBox, SAFE()]};
}
/** 보낸 사람 말(남의 글 data-proper) · 깨졌거나 거르는 말이 든 주소는 말을 보이지 않음 */
function senderMsg(S) {
  if (S.msg == null) return h('p', {class: 'ps-p', text: '? 보낸 말이 깨져서 보여 줄 수 없어요.'});
  if (!S.msg) return h('p', {class: 'ps-p', text: '친구가 따로 남긴 말은 없어요.'});
  if (sendHits(S.msg).length) return h('p', {class: 'ps-p', text: '? 보낸 말에 거르는 말이 있어서 보여 주지 않아요.'});
  return h('blockquote', {class: 'ps-said'}, own(null, '「' + S.msg + '」'));
}
/** 이 종목을 내가 다시 보내기 — 오늘 값이 있으면 오늘 값 · 날로(없으면 보낸 날 것) · prefill = 글상자에 미리 넣을 말 */
/** 「나도 보내기」(사장님 2026-10-18 16:39 [6] 9) — 친구가 연 쪽 · 질문에 다 답한 뒤에만 화면에 들어감(이 함수는 답한 뒤 그리는 칸에서만 부름) · 단추는 share-btn.js 한 곳(넓은 카톡 단추) */
export const AGAIN = '나도 보내기';
function againBtn(S, name, now, nowDay, later, prefill) {
  return shareButtons({kind: 'share', code: S.code, name, price: later ? now : S.price, day: later ? nowDay : S.day, prefill}, {kakao: true, text: AGAIN});
}
function msgPart(S, name, now, nowDay, later) {
  return [h('h2', {class: 'ps-h2', text: '친구가 보낸 말'}), senderMsg(S),
    h('div', {class: 'ps-acts'}, againBtn(S, name, now, nowDay, later), h('a', {class: 'ps-link', href: '#/w/' + S.code, text: '이 회사 자세히 보기 ›'}))];
}
/** 같이 따져 줘 — 「반토막 난다면 왜일까?」 친구 생각(왜 사? 두 줄 ① 답 · mine) 뒤에 보낸 사람 말 · 답장은 글상자로
    mine 이 없으면(질문 칸이 기록을 안 넘김) 여기서 한 줄 받음 — 답은 이 화면에만(어디에도 남기지 않음) */
function askPart(S, name, now, nowDay, later, mine) {
  if (mine) return [h('h2', {class: 'ps-h2 ps-askq', text: ASK_Q}),
    h('p', {class: 'ps-mine'}, h('span', {class: 'ps-pk', text: '내 생각 '}), own(null, '「' + mine + '」')),
    h('h2', {class: 'ps-h2', text: '친구가 보낸 말'}), senderMsg(S),
    h('div', {class: 'ps-acts'}, againBtn(S, name, now, nowDay, later, L('반토막 난다면') + ' ' + mine), h('a', {class: 'ps-link', href: '#/w/' + S.code, text: '이 회사 자세히 보기 ›'}))];
  const ta = h('textarea', {id: 'ps-ask', class: 'ps-t', rows: 2, maxlength: MAX, placeholder: '예) 파는 물건이 덜 팔리면', 'aria-describedby': 'ps-askm'});
  const m = h('p', {id: 'ps-askm', class: 'ps-m', role: 'status', 'aria-live': 'polite'}), rest = h('div', {class: 'ps-rest'});
  const okB = h('button', {class: 'ps-go', type: 'button', text: '다 적었어'});
  const idk = h('button', {class: 'ps-qb', type: 'button', text: '잘 모르겠어', onclick: ev => { ta.value = ev.currentTarget.textContent || L('잘 모르겠어'); ta.focus(); }});
  okB.addEventListener('click', () => {
    const t = cleanMsg(ta.value), bad = sendHits(t);
    if (Array.from(t).length < 2) { m.className = 'ps-m no'; m.textContent = '한 줄만 적어 봐. 「잘 모르겠어」도 괜찮아.'; ta.focus(); return; }
    if (bad.length) { m.className = 'ps-m no'; m.replaceChildren(...badSay(bad[0])); const r = findIn(ta.value, bad[0].word); ta.focus(); if (r) ta.setSelectionRange(r[0], r[1]); return; }
    m.className = 'ps-m'; m.textContent = '';
    okB.remove(); idk.remove(); ta.readOnly = true;
    rest.replaceChildren(h('h2', {class: 'ps-h2', text: '친구가 보낸 말'}), senderMsg(S),
      h('div', {class: 'ps-acts'}, againBtn(S, name, now, nowDay, later, L('반토막 난다면') + ' ' + t), h('a', {class: 'ps-link', href: '#/w/' + S.code, text: '이 회사 자세히 보기 ›'})));
  });
  return [h('h2', {class: 'ps-h2 ps-askq', text: ASK_Q}),
    h('p', {class: 'ps-p', text: '친구가 같이 따져 달래. 1년 뒤 반토막 났다면 왜일지 한 줄로 적어 봐.'}),
    h('label', {class: 'ps-lab', for: 'ps-ask', text: '내 생각'}), ta, m, h('div', {class: 'ps-acts'}, idk, okB), rest];
}
