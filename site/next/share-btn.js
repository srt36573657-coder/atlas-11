/* 카톡 단추 한 곳 — shareButtons(o, opt)(사장님 2026-10-18 16:39 싱가포르 「진화가 본질인 명령문」 [6] 1 · 2 · 3 · 6 · 9 · 일꾼 KB1)
   ── KB2 · 종목 줄 · 카드를 그리는 모든 곳은 이것 하나만 부른다(곳마다 새로 만들지 않음 · 고칠 때 이 파일 한 곳) ──
     import {shareButtons} from './share-btn.js';   // 작고 동기 — 이 파일은 아무 모듈도 받지 않음(누를 때 글상자 p-share.js 를 늦게 받음)
     const kk = shareButtons({code, name, price, day, kind: 'share'}, {kakao: true});   // → <button> 하나(배열 아님) · 번호가 틀리면 null
     row.append(kk);   // 줄 · 카드 오른쪽 끝 — 줄 고리 <a> 의 형제로 두기를 권함(고리 안이어도 누름은 고리로 새지 않음)
   o = {code, name, price, day, kind, half}
     · code  = 종목 번호 6자리(대문자 · 숫자) — 없거나 틀리면 단추를 만들지 않고 null 을 돌려줌
     · name  = 화면에 보이는 종목 이름 그대로(수익 숫자 넣지 않음)
     · price = 오늘 값(원 · 양수) · day = 그 값의 날 'YYYY-MM-DD' — 모르면 null(글상자가 자료 co/<번호>.json 에서 채움 · 사람이 칠 것 0)
     · kind  = 'share'(보통) | 'surge'(급등 줄 — 받는 카드 · 보내는 글에 「1년 전 날아오른 36곳 중 n곳이 그 뒤 1년 안에 반값 아래로 떨어진 적 있어요」 한 줄이 붙음 ·
               n 은 글상자가 /next/data/half36.json {n, of} 에서 읽음 · 없거나 깨지면 그 줄을 뺌 · 짓지 않음 · 글은 p-share.js halfLine 한 곳)
     · half  = {n, of}(넘기면 그 값 · 안 넘기면 파일) · 수익률 · 오른 폭은 받지 않음(넣어도 보내지 않음)
   단추 꼴(모양 = site/next/app.css 「카톡 단추」 묶음 — 앱의 모든 쪽에 늘 붙어 있음 · 글 속 style 없음):
     <button type="button" class="kk-btn kk-row" data-kk="<번호>" data-kind="share|surge" aria-label="<이름> 카톡 보내기">
       <svg class="kk-ic" aria-hidden="true">노란 말풍선</svg><span class="kk-t">카톡 보내기</span></button>
     · 글자 보임(사장님 2026-10-25 12:00) · 노란 두 줄 · 48px 넘게
     · 넓은 꼴 shareButtons(o, {kakao: true, text: '나도 보내기'}) → class="kk-btn kk-wide"(그림 + 글 · 높이 44px · 친구가 연 쪽)
     · 검사(KB2 check_kakao_rows.mjs)는 button.kk-btn[data-kk] 를 셈 — 종목 고리 수 = 이 단추 수
   누름: preventDefault + stopPropagation(줄 고리 · 줄 누름으로 가지 않음 · 쪽 이동 0) → NX.shareBox 가 있으면 그리로 · 없으면 p-share.js open 을 늦게 받아 엶
     · 누르기 시작(pointerdown)에 글상자 모듈 · 카카오 도구를 미리 받음 — 두 번째 누름(빠른 말)에 카톡 친구 고르기 화면이 바로 뜨게
   옛 꼴(opt.kakao 없음) = [「보내기」, 「같이 따져 줘」(회사 주식만)] 배열 — p-share.js 가 다시 내보냄(옛 부르는 곳 그대로) */
const SVGNS = 'http://www.w3.org/2000/svg';
const CODE_RE = /^[0-9A-Z]{6}$/;
export const KK_CLASS = 'kk-btn', KK_WIDE = 'kk-wide', KK_ICON = 'kk-ic';
export const KK_LABEL = '카톡 보내기', KK_ROW = 'kk-row';

function el(tag, a = {}, ...kids) {
  const e = document.createElement(tag);
  for (const [k, v] of Object.entries(a)) {
    if (v == null || v === false) continue;
    if (k === 'class') e.className = v; else if (k === 'text') e.textContent = v; else e.setAttribute(k, v === true ? '' : String(v));
  }
  for (const c of kids) if (c != null) e.append(c);
  return e;
}
function sv(tag, a = {}) { const e = document.createElementNS(SVGNS, tag); for (const [k, v] of Object.entries(a)) e.setAttribute(k, String(v)); return e; }
/** 노란 말풍선 — 모양만(색은 app.css .kk-ic .kk-b) · 글 · 상표 글자 없음 */
function bubble() {
  const s = sv('svg', {class: KK_ICON, viewBox: '0 0 24 24', width: 28, height: 28, 'aria-hidden': 'true', focusable: 'false'});
  s.append(sv('path', {class: 'kk-b', d: 'M12 3C6.75 3 2.5 6.36 2.5 10.5c0 2.65 1.74 4.98 4.37 6.31l-1.1 4.02c-.1.36.31.65.62.44l4.78-3.17c.27.02.55.03.83.03 5.25 0 9.5-3.36 9.5-7.5S17.25 3 12 3z'}));
  return s;
}
const nx = () => globalThis.NX ?? null;
let modP = null;
/** 글상자 열기 — 앱이면 NX.shareBox(모양 파일까지 붙임) · 아니면 p-share.js 를 받아 바로 open */
function openBox(o) {
  const N = nx();
  if (typeof N?.shareBox === 'function') return N.shareBox(o);
  modP = modP ?? import('./p-share.js');
  return modP.then(m => m.open(o)).catch(e => { modP = null; console.error(e); });
}
/** 미리 받기 — 글상자 모듈 · 카카오 도구(공유 스위치가 켜졌을 때만 kakao.js 가 받음) */
function warm() {
  const N = nx();
  try { if (typeof N?.mod === 'function') N.mod('share').catch(() => {}); else { modP = modP ?? import('./p-share.js'); modP.catch(() => { modP = null; }); } } catch { /* 못 받음 — 누를 때 다시 */ }
  try { N?.kakao?.sdkReady?.()?.catch?.(() => {}); } catch { /* 카카오 없음 */ }
}
/** 보낼 것 — 쓰는 곳이 준 것만 넘김(수익 숫자 칸 없음) */
function pack(o, kind) {
  const code = String(o?.code ?? ''), name = o?.name != null ? String(o.name) : null;
  const price = Number(o?.price) > 0 ? Number(o.price) : null, day = /^\d{4}-\d{2}-\d{2}$/.test(o?.day ?? '') ? o.day : null;
  const half = o?.half && Number.isInteger(o.half.n) && Number.isInteger(o.half.of) ? {n: o.half.n, of: o.half.of} : undefined;
  const url = typeof location !== 'undefined' ? location.origin + '/#/w/' + code : ''; // 앱이 글상자를 못 받았을 때 옛 보내기(제목 · 주소)용
  const prefill = typeof o?.prefill === 'string' ? o.prefill : undefined; // 글칸에 미리 넣을 말(친구 쪽 「나도 보내기」 — 같이 따져 줘 답) · 글상자가 다듬고 거름
  return {kind, code, name, price, day, half, prefill, title: o?.title, url: o?.url ?? url};
}

/** 카톡 단추 하나(opt.kakao) 또는 옛 단추 둘(배열) */
export function shareButtons(o, {kakao = false, text = null, cls = 'act', shareText = '보내기', askText = '같이 따져 줘'} = {}) {
  if (!kakao) {
    const run = k => () => { openBox({...o, kind: k}); };
    const out = [el('button', {class: cls, type: 'button', text: shareText})]; out[0].addEventListener('click', run('share'));
    if (CODE_RE.test(String(o?.code ?? ''))) { const b = el('button', {class: cls + ' ps-askb', type: 'button', text: askText}); b.addEventListener('click', run('ask')); out.push(b); }
    return out;
  }
  const code = String(o?.code ?? '');
  if (!CODE_RE.test(code)) return null;
  const kind = o?.kind === 'surge' ? 'surge' : 'share', name = o?.name != null && String(o.name).trim() ? String(o.name).trim() : null;
  const b = el('button', {class: KK_CLASS + ' ' + (text ? KK_WIDE : KK_ROW), type: 'button', 'data-kk': code, 'data-kind': kind,
    'aria-label': text ? null : (name ? name + ' ' + KK_LABEL : KK_LABEL)}, bubble(), el('span', {class: 'kk-t', text: text ?? KK_LABEL}), ' '); // 끝 빈칸 — 뒤 글과 붙어 읽히지 않게
  b.addEventListener('pointerdown', warm, {once: true});
  b.addEventListener('click', ev => { ev.preventDefault(); ev.stopPropagation(); openBox(pack(o, kind)); });
  return b;
}
/** 같은 것(이름만 짧게) — shareButtons(o, {kakao: true}) */
export const kakaoButton = (o, opt = {}) => shareButtons(o, {...opt, kakao: true});
/** 「카톡 보내기」 글 단추(사장님 2026-10-25 06:06 · 12:00) — o = {title, text, url} · 누르면 글상자부터 · 수익률 숫자 없음 */
/** 보낸 사람 표(r) 붙임 — gift-ref.js 가 적어 둔 표만 읽음(이 파일은 모듈을 받지 않음) · 우리 주소만 */
function withRef(url) {
  try {
    const r = localStorage.getItem('atlas:gift:ref');
    if (!/^[A-Za-z0-9_-]{16}$/.test(r ?? '')) return url;
    const u = new URL(url, location.origin);
    if (u.origin !== location.origin) return url;
    u.searchParams.set('r', r);
    return u.href;
  } catch { return url; }
}
export function kakaoText(o, label = KK_LABEL) {
  const b = el('button', {class: KK_CLASS + ' ' + KK_WIDE + ' kk-txt', type: 'button'}, bubble(), el('span', {class: 'kk-t', text: label}), ' ');
  b.addEventListener('pointerdown', warm, {once: true});
  b.addEventListener('click', ev => { ev.preventDefault(); ev.stopPropagation(); openBox({kind: 'share', title: String(o?.title ?? ''), text: String(o?.text ?? ''), url: withRef(String(o?.url ?? ''))}); });
  return b;
}
