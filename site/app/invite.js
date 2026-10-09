/* ATLAS 11 · 선물형 초대장(invite.html · /i/<번호>) — 사장님 2026-10-09 16:12(마카오 시각) 첨부 「아틀라스용 ‘카카오톡으로 보내는 선물형 초대장’ 제작 프롬프트」
   두 사람의 흐름
     보내는 사람: 받는 사람 · 보내는 사람 · 짧은 메시지 → 미리 보기(받는 쪽 화면 그대로 · 눌러서 열어 볼 수 있음) → 카카오톡으로 보내기(카카오 열쇠가 있으면 카카오 공유 · 없으면 휴대폰 공유 창) · 링크 복사
     받는 사람: 링크 → 「○○님께」와 청자 합 → 누른 자리에서 뚜껑이 열리고 빛 → 일곱 별(북두칠성) → 메시지가 가운데 → 「ATLAS 후보 n곳 보기」(그때의 최신 후보 화면 #/)
   지키는 것: 가입 없음 · 홈 화면은 그대로(이 연출은 초대장 주소에서만) · 소리 없음 · 움직임 줄이기면 움직임 없이 같은 정보 · 「바로 보기」 · 3초 안에 메시지
     · 메시지 · 이름은 글자로만(textContent) · 주소에는 번호만 · 종목 · 가격 · 이유를 이 화면에 지어 넣지 않음(후보 수 · 기준 날짜는 판 자료 lens.json 그대로)
     · 별 일곱 = 후보 자리 일곱(규칙 43 「최대 7곳」) — 후보가 7곳보다 적은 날은 빈 자리를 빈 고리로
   사진이 든 선물(2026-10-09 17:22 · 17:29 마카오 시각 · 사장님 초대장에만): 합을 열면 사진이 입에서 떠올라 제자리로 · 장면이 사진의 하늘빛으로 · 별 일곱은 사진 둘레 띠에서(invite-photo.js)
     · 사진을 못 읽으면 지어내지 않고 사진 없는 원래 장면으로 */
import {photoStage} from './invite-photo.js';
const API = '/api/invite';
const ID_RE = /^[A-Za-z0-9_-]{22}$/;
const LIMIT = {name: 24, message: 300};
export const DEFAULT_MESSAGE = '좋은 기회는 소중한 사람과 함께 나누고 싶었습니다.\n당신의 다음 선택에 도움이 되길 바랍니다.';
const DAY = '일월화수목금토';

/* ── 작은 도구 ── */
function h(tag, attrs, ...kids) {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs ?? {})) {
    if (v == null || v === false) continue;
    if (k === 'class') el.className = v;
    else if (k.startsWith('on')) el.addEventListener(k.slice(2), v);
    else el.setAttribute(k, v === true ? '' : String(v));
  }
  for (const k of kids.flat()) if (k != null && k !== false) el.append(k instanceof Node ? k : document.createTextNode(String(k)));
  return el;
}
const svgEl = markup => { const t = document.createElement('template'); t.innerHTML = markup.trim(); return t.content.firstElementChild; }; // 정해 둔 그림만(받은 글은 넣지 않음)
const korDay = d => { const t = Date.parse((d ?? '') + 'T00:00:00Z'); if (!Number.isFinite(t)) return null; const x = new Date(t); return `${x.getUTCMonth() + 1}월 ${x.getUTCDate()}일(${DAY[x.getUTCDay()]})`; };
const chars = s => Array.from(s ?? '').length;
const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
const lowPower = () => (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4) || (navigator.deviceMemory && navigator.deviceMemory <= 2) || matchMedia('(prefers-reduced-data: reduce)').matches;
const store = {get(k) { try { return localStorage.getItem(k); } catch { return null; } }, set(k, v) { try { localStorage.setItem(k, v); } catch {} },
  sget(k) { try { return sessionStorage.getItem(k); } catch { return null; } }, sset(k, v) { try { sessionStorage.setItem(k, v); } catch {} }};
const wait = ms => new Promise(r => setTimeout(r, ms));
function anim(el, frames, opts) { // 움직임 하나 — 끝나면 끝 모습을 지킴(fill forwards)
  if (!el?.animate) return Promise.resolve();
  const a = el.animate(frames, {fill: 'forwards', ...opts});
  return a.finished.catch(() => {});
}

/* 청자 합 — viewBox 280×236 · 뚜껑(.lid) · 몸통 · 입(열리면 보임) · 상감(백토 선 · 흑점 일곱 = 별 자리) */
export const GIFT_SRC = `<svg viewBox="0 0 280 236" aria-hidden="true" focusable="false">
<defs>
 <linearGradient id="ivBody" x1="0" x2="1" y1="0" y2="0"><stop offset="0" stop-color="#3F7461"/><stop offset=".3" stop-color="#7EB59D"/><stop offset=".46" stop-color="#A3CFBA"/><stop offset=".62" stop-color="#7AB198"/><stop offset="1" stop-color="#3A6B59"/></linearGradient>
 <linearGradient id="ivLid" x1="0" x2="1" y1="0" y2=".4"><stop offset="0" stop-color="#5F9A82"/><stop offset=".34" stop-color="#9ECBB6"/><stop offset=".5" stop-color="#B7DCCB"/><stop offset=".7" stop-color="#86BBA2"/><stop offset="1" stop-color="#4A8069"/></linearGradient>
 <linearGradient id="ivTop" x1="0" x2="1"><stop offset="0" stop-color="#9FCDB8"/><stop offset=".5" stop-color="#C6E4D6"/><stop offset="1" stop-color="#93C3AD"/></linearGradient>
 <radialGradient id="ivMouth" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#FFF4DA"/><stop offset=".55" stop-color="#F6DFAE" stop-opacity=".6"/><stop offset="1" stop-color="#0E1C17" stop-opacity="0"/></radialGradient>
 <radialGradient id="ivShadow" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#000" stop-opacity=".55"/><stop offset="1" stop-color="#000" stop-opacity="0"/></radialGradient>
</defs>
<ellipse class="shadow" cx="140" cy="210" rx="104" ry="13" fill="url(#ivShadow)"/>
<path d="M90 194 L190 194 L186 204 C168 207.5 112 207.5 94 204 Z" fill="#2F5C4D"/>
<path d="M44 132 C44 166 80 194 140 196 C200 194 236 166 236 132 Z" fill="url(#ivBody)"/>
<path d="M62 160 C84 178 110 185 140 186 C170 185 196 178 218 160" fill="none" stroke="#F8FBF7" stroke-opacity=".5" stroke-width="1.3"/>
<path d="M70 170 C92 184 114 190 140 191 C166 190 188 184 210 170" fill="none" stroke="#17302A" stroke-opacity=".28" stroke-width=".9"/>
<path d="M58 140 C64 160 80 176 100 186" fill="none" stroke="#FFFFFF" stroke-opacity=".22" stroke-width="5" stroke-linecap="round"/>
<g fill="none" stroke="#17302A" stroke-opacity=".13" stroke-width=".6"><path d="M76 146 L88 160 L84 176"/><path d="M200 144 L190 158 L202 172"/><path d="M128 184 L138 172 L152 182"/></g>
<ellipse class="mouth" cx="140" cy="132" rx="96" ry="14" fill="#0E1C17"/>
<ellipse cx="140" cy="132" rx="96" ry="14" fill="none" stroke="#A9D2BF" stroke-opacity=".8" stroke-width="1.6"/>
<ellipse class="mouth-glow" cx="140" cy="133" rx="88" ry="12" fill="url(#ivMouth)" opacity="0"/>
<g class="lid">
 <path d="M38 132 C38 110 72 93 112 90 L168 90 C208 93 242 110 242 132 C242 141 198 147 140 147 C82 147 38 141 38 132 Z" fill="url(#ivLid)"/>
 <path d="M38 132 C38 141 82 147 140 147 C198 147 242 141 242 132 C242 136 198 141 140 141 C82 141 38 136 38 132 Z" fill="#2F5C4D" fill-opacity=".55"/>
 <ellipse cx="140" cy="90" rx="56" ry="9" fill="url(#ivTop)"/>
 <ellipse cx="140" cy="90" rx="47" ry="7" fill="none" stroke="#F8FBF7" stroke-opacity=".75" stroke-width="1.1"/>
 <g transform="translate(130.5 84.5) scale(.22)"><rect x="0" y="0" width="44" height="50" rx="9" fill="#F8FBF7" fill-opacity=".9"/><rect x="0" y="55" width="44" height="27" rx="7" fill="#17302A" fill-opacity=".55"/><rect x="49" y="0" width="33" height="28" rx="7" fill="#B23B3B" fill-opacity=".9"/><rect x="49" y="33" width="15" height="22" rx="5" fill="#17302A" fill-opacity=".55"/><rect x="67" y="33" width="15" height="22" rx="5" fill="#F8FBF7" fill-opacity=".9"/><rect x="49" y="60" width="33" height="22" rx="7" fill="#F8FBF7" fill-opacity=".9"/></g>
 <g fill="#F8FBF7" fill-opacity=".85"><circle cx="70" cy="114" r="1.8"/><circle cx="90" cy="104.5" r="1.8"/><circle cx="114" cy="99.5" r="1.8"/><circle cx="140" cy="98" r="2"/><circle cx="166" cy="99.5" r="1.8"/><circle cx="190" cy="104.5" r="1.8"/><circle cx="210" cy="114" r="1.8"/></g>
 <path d="M48 126 C66 134 100 138 140 138.5 C180 138 214 134 232 126" fill="none" stroke="#F8FBF7" stroke-opacity=".55" stroke-width="1"/>
 <text x="140" y="126" text-anchor="middle" font-family="Gowun Batang, serif" font-size="11.5" font-weight="700" letter-spacing="6" fill="#F8FBF7" fill-opacity=".8">ATLAS</text>
 <path d="M64 106 C78 98 96 94 112 92" fill="none" stroke="#FFFFFF" stroke-opacity=".35" stroke-width="4" stroke-linecap="round"/>
 <g fill="none" stroke="#17302A" stroke-opacity=".12" stroke-width=".6"><path d="M58 118 L70 124 L66 134"/><path d="M220 114 L210 122 L216 132"/></g>
</g>
</svg>`;
let giftN = 0;
const gift = () => { const u = 'g' + (++giftN); return svgEl(GIFT_SRC.replace(/iv(Body|Lid|Mouth|Shadow)/g, (m, k) => `iv${k}${u}`)); }; // 그림마다 그라데이션 이름을 따로(미리 보기 · 머리 그림이 한 화면에)
const LOGO = '/logo-band.svg';

/* 북두칠성 — 큰곰자리 일곱 별(국자 끝 두 별이 북극성을 가리킴) · 나타나는 차례 1→7 = 후보 자리 1→7 */
const DIPPER = [[0.93, 0.10], [0.91, 0.62], [0.66, 0.74], [0.62, 0.36], [0.43, 0.30], [0.25, 0.27], [0.05, 0.46]];
const LINE = [6, 5, 4, 3, 0, 1, 2, 3];

/* ── 판 자료(후보 수 · 기준 날짜) — 그때의 최신 발행 결과 그대로 · 못 읽으면 지어내지 않고 「화면에서 확인」 ── */
let lensInfo = null;
function loadLensInfo() {
  if (!lensInfo) lensInfo = fetch('/data/atlas11/view/lens.json', {cache: 'no-cache'}).then(r => (r.ok ? r.json() : null)).then(j => {
    const c = j?.cand; if (!c || !Array.isArray(c.items)) return null;
    return {n: c.items.length, want: c.want ?? 7, asOf: c.asOf ?? j.asOf ?? null};
  }).catch(() => null);
  return lensInfo;
}

/* ── 받는 쪽 장면 ── */
export function renderInvite(host, inv, {preview = false, onStatus = null} = {}) {
  const scene = h('section', {class: 'iv-scene', 'aria-label': 'ATLAS 초대장'});
  const giftBtn = h('button', {class: 'iv-gift', type: 'button', 'aria-label': `${inv.to}님께 온 선물 열어 보기`});
  giftBtn.append(gift(), h('span', {class: 'iv-glow'}));
  const sky = h('div', {class: 'iv-sky', 'aria-hidden': 'true'});
  const lineSvg = svgEl('<svg><polyline points=""/></svg>'); sky.append(lineSvg);
  const stars = DIPPER.map(() => h('span', {class: 'iv-star'})); sky.append(...stars);
  const openBtn = h('button', {class: 'iv-btn pri', type: 'button'}, '열어 보기');
  const skipBtn = h('button', {class: 'iv-link', type: 'button'}, '바로 보기');
  const live = h('p', {class: 'iv-sr', 'aria-live': 'polite'});
  const msg = inv.message?.trim();
  const card = h('article', {class: 'iv-card', 'aria-label': '받은 메시지', tabindex: '-1'},
    h('h1', null, `${inv.to}님께`),
    msg ? h('p', {class: 'iv-msg'}, msg) : h('p', {class: 'iv-msg none'}, `${inv.from}님이 ATLAS 초대장을 보냈습니다.`),
    h('p', {class: 'iv-sign'}, '— ', h('b', null, inv.from), ' 드림'));
  const goBtn = h(preview ? 'button' : 'a', preview ? {class: 'iv-btn pri', type: 'button'} : {class: 'iv-btn pri', href: '/#/'}, 'ATLAS 후보 보기');
  const goSub = h('p', {class: 'iv-go-sub'}, '기준 날짜와 시각은 열리는 화면 맨 위에 있습니다 · 연구용 · 성능 검증 전');
  const replay = h('button', {class: 'iv-link', type: 'button'}, '다시 보기');
  const after = h('div', {class: 'iv-after'}, card,
    h('div', {class: 'iv-go'}, goBtn, goSub),
    h('p', {class: 'iv-what'}, 'ATLAS는 한국 주식 365곳의 지난 종가 · 돈의 흐름 · 공시를 정리하고 매수 검토 후보를 최대 7곳까지 보여 줍니다 · 값의 앞날은 맞히지 않습니다'),
    replay);
  const stage = h('div', {class: 'iv-stage'},
    h('p', {class: 'iv-to'}, h('small', null, 'ATLAS 초대장'), `${inv.to}님께`),
    giftBtn,
    h('p', {class: 'iv-from'}, h('b', null, inv.from), '님이 보낸 작은 선물'),
    h('div', {class: 'iv-act iv-act-closed'}, openBtn, skipBtn),
    after);
  const brand = h('p', {class: 'iv-brand'}, h('img', {src: LOGO, alt: ''}), 'ATLAS');
  scene.append(brand, stage, sky, live);
  if (preview) goBtn.addEventListener('click', () => onStatus?.('미리 보기에서는 이동하지 않습니다 — 받는 사람은 이 단추로 ATLAS 후보 화면을 엽니다'));
  host.replaceChildren(scene);
  const lite = lowPower(); if (lite) scene.classList.add('iv-lite');

  // 사진이 든 선물 — 사진 무대(사진 · 별가루 띠 · 일곱 별)와 장면 맨 뒤 하늘. 사진을 못 읽으면 걷어 내고 원래 장면으로
  const ph = inv.photo?.src ? photoStage({src: inv.photo.src, w: inv.photo.w, h: inv.photo.h, alt: `${inv.from}님이 넣은 사진`}) : null;
  let photoOk = !!ph;
  const dropPhoto = () => { if (!ph || !photoOk) return; photoOk = false; ph.destroy(); ph.el.remove(); ph.backdrop.remove(); scene.classList.remove('iv-has-photo'); };
  if (ph) {
    scene.classList.add('iv-has-photo'); scene.prepend(ph.backdrop); after.prepend(ph.el);
    ph.ready.catch(() => { const wasOpen = state === 'open'; dropPhoto(); if (wasOpen) { place(targets()); lineSvg.style.opacity = '1'; } });
  }
  const landPhoto = () => { // 사진을 열린 화면의 제자리(흐름)로
    ph.el.getAnimations?.().forEach(a => a.cancel()); ph.el.classList.remove('flying');
    for (const k of ['left', 'top', 'width', 'height']) ph.el.style[k] = '';
    if (after.firstElementChild !== ph.el) after.prepend(ph.el);
  };

  // 후보 수 · 기준 날짜(그때의 최신 판)
  loadLensInfo().then(info => {
    if (!info) return;
    goBtn.textContent = info.n > 0 ? `ATLAS 후보 ${info.n}곳 보기` : 'ATLAS 후보 화면 보기';
    const day = korDay(info.asOf);
    goSub.textContent = `${day ? `${day} 15:30 종가 기준` : '기준 날짜는 열리는 화면 맨 위'} · 매수 검토 우선순위(예상 수익률 순위 아님) · 연구용 · 성능 검증 전${info.n === 0 ? ' · 이 날은 기준을 넘은 곳이 없습니다' : ''}`;
    stars.forEach((s, i) => s.classList.toggle('empty', i >= info.n));
    ph?.setCount(info.n);
  });

  // 별 자리 — 장면 위쪽 띠 안(너비 360까지 · 높이 130)
  const targets = () => {
    const w = scene.clientWidth, band = Math.min(w - 48, 360), left = (w - band) / 2, top = parseFloat(getComputedStyle(scene).paddingTop) + 34;
    return DIPPER.map(([x, y]) => [left + x * band, top + y * 120]);
  };
  const place = (pts, show = true) => {
    pts.forEach(([x, y], i) => { stars[i].style.transform = `translate(${x}px, ${y}px)`; stars[i].style.opacity = show ? (stars[i].classList.contains('empty') ? '.9' : '1') : '0'; });
    lineSvg.querySelector('polyline').setAttribute('points', LINE.map(i => pts[i].join(',')).join(' '));
  };
  let state = 'closed', running = false;

  const finish = () => { // 끝 모습 — 움직임 없이도 같은 정보
    for (const el of [giftBtn, ...stars, lineSvg, after, card, ...after.querySelectorAll('*')]) el.getAnimations?.().forEach(a => a.cancel());
    scene.classList.add('iv-open');
    if (photoOk) { ph.backdrop.getAnimations?.().forEach(a => a.cancel()); landPhoto(); ph.start('show'); }
    else { place(targets()); lineSvg.style.opacity = '1'; const pl = lineSvg.querySelector('polyline'); pl.getAnimations?.().forEach(a => a.cancel()); pl.style.strokeDasharray = ''; pl.style.strokeDashoffset = ''; }
    for (const el of after.querySelectorAll('.iv-go, .iv-what, .iv-link')) el.style.opacity = '1';
    state = 'open'; running = false;
    live.textContent = `${inv.from}님의 메시지가 열렸습니다`;
  };
  // 1막(같음): 누른 자리에서 뚜껑이 열리고 입에서 빛이 번짐
  const openLid = async e => {
    const r = giftBtn.getBoundingClientRect();
    const px = e && e.clientX ? e.clientX : r.left + r.width / 2; // 누른 자리(단추로 열면 한가운데)
    const side = Math.max(-1, Math.min(1, (px - (r.left + r.width / 2)) / (r.width / 2))); // -1 왼쪽 … 1 오른쪽
    const lid = giftBtn.querySelector('.lid'), glow = giftBtn.querySelector('.iv-glow'), mouthGlow = giftBtn.querySelector('.mouth-glow');
    live.textContent = '선물을 여는 중';
    giftBtn.disabled = true;
    const T = lite ? 0.7 : 1;
    anim(giftBtn.parentElement.querySelector('.iv-act-closed'), [{opacity: 1}, {opacity: 0}], {duration: 160});
    await anim(giftBtn, [{transform: 'scale(1)'}, {transform: 'scale(.975)'}, {transform: 'scale(1)'}], {duration: 180 * T, easing: 'ease-out'});
    // 뚜껑: 누른 쪽이 먼저 들림(반대쪽이 경첩) → 위로 물러나며 흐려짐
    lid.style.transformOrigin = side < 0 ? '242px 134px' : '38px 134px'; // 반대쪽 가장자리가 경첩(그림 좌표)
    const rot = (side < 0 ? 1 : -1) * (10 + Math.abs(side) * 8), dx = (side < 0 ? 1 : -1) * (18 + Math.abs(side) * 26);
    anim(lid, [{transform: 'translate(0,0) rotate(0deg)', opacity: 1}, {transform: `translate(${dx * 0.3}px,-22px) rotate(${rot * 0.7}deg)`, opacity: 1, offset: 0.42}, {transform: `translate(${dx}px,-64px) rotate(${rot}deg)`, opacity: 0}], {duration: 860 * T, easing: 'cubic-bezier(.3,.7,.2,1)'});
    // 안쪽 빛: 입에서 번짐(누른 쪽으로 조금 치우침)
    glow.style.left = `${50 + side * 12}%`;
    anim(mouthGlow, [{opacity: 0}, {opacity: 1}], {duration: 500 * T, delay: 140 * T});
    anim(glow, lite ? [{opacity: 0}, {opacity: .7}] : [{opacity: 0, transform: 'scale(.3)'}, {opacity: .95, transform: 'scale(1)', offset: .55}, {opacity: .55, transform: 'scale(1.12)'}], {duration: 1000 * T, delay: 160 * T, easing: 'ease-out'});
    return {side, T};
  };
  // 마지막 막(같음): 메시지 카드 → 단추 · 설명
  const showCard = async (e, T) => {
    const rest = [...after.querySelectorAll('.iv-go, .iv-what, .iv-link')]; rest.forEach(el => { el.style.opacity = '0'; });
    await anim(card, [{opacity: 0, transform: 'translateY(14px)'}, {opacity: 1, transform: 'none'}], {duration: 420 * T, easing: 'cubic-bezier(.2,.8,.2,1)'});
    await Promise.all(rest.map(el => anim(el, [{opacity: 0}, {opacity: 1}], {duration: 320 * T})));
    rest.forEach(el => { el.getAnimations?.().forEach(a => a.cancel()); el.style.opacity = '1'; });
    state = 'open'; running = false;
    live.textContent = `${inv.from}님의 메시지가 열렸습니다`;
    if (e === null) card.focus({preventScroll: true}); // 글쇠로 열었으면 메시지로 초점
  };
  // 2막 · 별: 별 일곱이 입에서 나와 북두칠성 자리로 차례로
  const playStars = async (e, {side, T}) => {
    const r = giftBtn.getBoundingClientRect(), sr = scene.getBoundingClientRect();
    const pts = targets(), mx = r.left - sr.left + r.width * (0.5 + side * 0.12), my = r.top - sr.top + r.height * 0.54;
    lineSvg.querySelector('polyline').setAttribute('points', LINE.map(i => pts[i].join(',')).join(' '));
    const run = stars.map((s, i) => anim(s, [
      {transform: `translate(${mx + (i - 3) * 4}px, ${my}px) scale(.35)`, opacity: 0},
      {opacity: 1, offset: 0.18},
      {transform: `translate(${pts[i][0]}px, ${pts[i][1]}px) scale(1)`, opacity: s.classList.contains('empty') ? 0.9 : 1}],
      {duration: 640 * T, delay: (520 + i * 95) * T, easing: 'cubic-bezier(.2,.75,.25,1)'}));
    // 별 사이 가는 선(별이 다 자리 잡을 즈음)
    const poly = lineSvg.querySelector('polyline'); const len = poly.getTotalLength?.() || 600;
    poly.style.strokeDasharray = String(len); poly.style.strokeDashoffset = String(len);
    anim(poly, [{strokeDashoffset: len}, {strokeDashoffset: 0}], {duration: (lite ? 1 : 520) * T, delay: 1500 * T, easing: 'ease-in-out'});
    // 합 · 이름은 물러나고 메시지가 가운데로
    await wait(1560 * T);
    await anim(stage.querySelector('.iv-to'), [{opacity: 1}, {opacity: 0}], {duration: 260 * T});
    anim(stage.querySelector('.iv-from'), [{opacity: 1}, {opacity: 0}], {duration: 200 * T});
    await anim(giftBtn, [{opacity: 1, transform: 'none'}, {opacity: 0, transform: 'translateY(14px) scale(.96)'}], {duration: 240 * T});
    await Promise.all(run);
    scene.classList.add('iv-open'); place(targets());
    stars.forEach(s => s.getAnimations?.().forEach(a => { a.commitStyles?.(); a.cancel(); })); place(targets());
    lineSvg.style.opacity = '1';
    await showCard(e, T);
  };
  // 2막 · 사진: 사진이 입에서 빛과 함께 떠올라 제자리로 · 장면이 사진의 하늘빛으로 · 별가루 띠가 소용돌이처럼 감기며 퍼짐
  const playPhoto = async (e, {side, T}) => {
    scene.classList.add('iv-open'); // 내려앉을 자리를 한 번 재고 바로 되돌림(그리기 전이라 깜빡이지 않음)
    const sr0 = scene.getBoundingClientRect(), fr = ph.el.getBoundingClientRect();
    scene.classList.remove('iv-open');
    const F = {x: fr.left - sr0.left, y: fr.top - sr0.top, w: fr.width, h: fr.height};
    const r = giftBtn.getBoundingClientRect(), sr = scene.getBoundingClientRect();
    ph.el.classList.add('flying');
    Object.assign(ph.el.style, {left: F.x + 'px', top: F.y + 'px', width: F.w + 'px', height: F.h + 'px'});
    scene.append(ph.el);
    const mx = r.left - sr.left + r.width * (0.5 + side * 0.08), my = r.top - sr.top + r.height * 0.55, fx = F.x + F.w / 2, fy = F.y + F.h * 0.62;
    ph.start('reveal', {delay: 420 * T});
    anim(ph.backdrop, [{opacity: 0}, {opacity: 1}], {duration: 1700 * T, delay: 200 * T, easing: 'ease-in-out', fill: 'both'});
    const fly = anim(ph.el, [ // 뚜껑이 열린 뒤 빛 속에서 천천히 떠올라 제자리에 사뿐히
      {transform: `translate(${mx - fx}px, ${my - fy}px) scale(.1)`, opacity: 0, filter: lite ? 'none' : 'blur(8px)'},
      {opacity: 1, offset: 0.2},
      {transform: 'translate(0px, 0px) scale(1)', opacity: 1, filter: 'blur(0px)'}],
      {duration: 1500 * T, delay: 240 * T, easing: 'cubic-bezier(.3,.62,.18,1)', fill: 'both'}); // 기다리는 동안에도 첫 모습(작게 · 숨김) — 큰 사진이 먼저 번쩍이지 않게
    await wait(720 * T); // 이름 · 합은 사진이 떠오르는 동안 물러남
    anim(stage.querySelector('.iv-to'), [{opacity: 1}, {opacity: 0}], {duration: 380 * T});
    anim(stage.querySelector('.iv-from'), [{opacity: 1}, {opacity: 0}], {duration: 300 * T});
    anim(giftBtn, [{opacity: 1, transform: 'none'}, {opacity: 0, transform: 'translateY(26px) scale(.92)'}], {duration: 560 * T, easing: 'ease-in'});
    await fly;
    scene.classList.add('iv-open'); landPhoto(); // 내려앉기 — 잰 자리와 같아서 튀지 않음
    ph.backdrop.getAnimations?.().forEach(a => a.cancel());
    await showCard(e, T);
  };
  const open = async e => {
    if (state !== 'closed' || running) return;
    running = true;
    if (reduced()) { finish(); card.focus({preventScroll: true}); return; }
    const c = await openLid(e);
    if (photoOk) { // 사진을 다 읽을 때까지(뚜껑이 열리는 동안 · 길어도 2.4초) — 못 읽으면 별 장면으로
      const ok = await Promise.race([ph.ready.then(() => true, () => false), wait(2400).then(() => false)]);
      if (ok && photoOk) return playPhoto(e, c);
      dropPhoto();
    }
    return playStars(e, c);
  };
  const reset = () => { // 다시 보기 — 닫힌 합으로
    for (const el of scene.querySelectorAll('*')) el.getAnimations?.().forEach(a => a.cancel());
    scene.classList.remove('iv-open'); giftBtn.disabled = false; state = 'closed'; running = false;
    stars.forEach(s => { s.style.opacity = '0'; }); lineSvg.style.opacity = '0';
    if (photoOk) { ph.reset(); landPhoto(); }
    for (const el of [stage.querySelector('.iv-to'), stage.querySelector('.iv-from'), giftBtn, stage.querySelector('.iv-act-closed')]) { el.style.opacity = ''; el.style.transform = ''; }
    giftBtn.querySelector('.lid').style.transformOrigin = '';
    for (const el of after.querySelectorAll('.iv-go, .iv-what, .iv-link')) el.style.opacity = '';
    openBtn.focus();
  };
  giftBtn.addEventListener('click', open);
  openBtn.addEventListener('click', () => open(null));
  skipBtn.addEventListener('click', () => { if (state === 'closed' && !running) { running = true; finish(); card.focus({preventScroll: true}); } });
  replay.addEventListener('click', reset);
  const onResize = () => { if (state === 'open' && !photoOk) place(targets()); };
  addEventListener('resize', onResize);
  lineSvg.style.opacity = '0';
  return {open, finish, reset, scene, destroy: () => { removeEventListener('resize', onResize); ph?.destroy(); }, get state() { return state; }, get photo() { return photoOk; }};
}

/* ── 받는 쪽 페이지 ── */
function noteView(main, title, text, {retry = null} = {}) {
  main.replaceChildren(h('section', {class: 'iv-scene'},
    h('p', {class: 'iv-brand'}, h('img', {src: LOGO, alt: ''}), 'ATLAS'),
    h('div', {class: 'iv-stage'}, h('div', {class: 'iv-note', role: 'alert'},
      h('span', {class: 'iv-wait', 'aria-hidden': 'true'}), h('h1', null, title), h('p', null, text),
      retry ? h('button', {class: 'iv-btn pri', type: 'button', onclick: retry}, '다시 열기') : null,
      h('a', {class: 'iv-btn pri', href: '/#/'}, 'ATLAS 둘러보기'))),
    h('p', {class: 'iv-foot'}, h('a', {href: '/invite.html'}, '나도 초대장 보내기'))));
}
async function receive(main, id) {
  document.body.className = 'iv-night';
  if (!ID_RE.test(id)) return noteView(main, '주소가 올바르지 않습니다', '받은 주소가 끝까지 복사되었는지 확인해 주세요. 초대장 주소는 /i/ 뒤에 글자 22자가 붙습니다.');
  main.replaceChildren(h('section', {class: 'iv-scene'}, h('p', {class: 'iv-brand'}, h('img', {src: LOGO, alt: ''}), 'ATLAS'),
    h('div', {class: 'iv-stage'}, h('div', {class: 'iv-note'}, h('span', {class: 'iv-wait', 'aria-hidden': 'true'}), h('p', {role: 'status'}, '초대장을 가져오는 중입니다'))), h('span')));
  loadLensInfo();
  let res = null, body = null;
  try { res = await fetch(`${API}?id=${encodeURIComponent(id)}`, {cache: 'no-store'}); body = await res.json().catch(() => null); }
  catch { return noteView(main, '초대장을 가져오지 못했습니다', '인터넷 연결을 확인한 뒤 다시 열어 주세요.', {retry: () => receive(main, id)}); }
  if (res.status === 404) return noteView(main, '찾을 수 없는 초대장입니다', '주소가 바뀌었거나 끝까지 복사되지 않았을 수 있습니다. 보낸 분께 링크를 다시 받아 주세요.');
  if (res.status === 410) return noteView(main, '열 수 있는 기간이 지난 초대장입니다', `초대장은 보낸 날부터 180일 동안 열립니다${body?.expiresAt ? ` · ${korDay(body.expiresAt.slice(0, 10))}에 닫혔습니다` : ''}.`);
  if (res.status === 400) return noteView(main, '주소가 올바르지 않습니다', '받은 주소가 끝까지 복사되었는지 확인해 주세요.');
  if (!res.ok || !body?.to) return noteView(main, '초대장을 가져오지 못했습니다', '잠시 뒤 다시 열어 주세요.', {retry: () => receive(main, id)});
  document.title = `${body.to}님께 · ATLAS 초대장`;
  renderInvite(main, body);
}

/* ── 보내는 쪽 페이지 ── */
let kakaoReady = null;
function kakaoInit() { // 열쇠 · SDK 판 · 무결성 값이 모두 있을 때만(지어내지 않음) — invite-config.json 은 config/atlas11/invite.json 에서 package.mjs 가 만듦
  if (!kakaoReady) kakaoReady = fetch('/invite-config.json', {cache: 'no-cache'}).then(r => (r.ok ? r.json() : null)).then(c => {
    const k = c?.kakao; if (!k?.key || !k?.version || !k?.integrity) return null;
    return new Promise(resolve => {
      const s = document.createElement('script');
      s.src = `https://t1.kakaocdn.net/kakao_js_sdk/${encodeURIComponent(k.version)}/kakao.min.js`; s.integrity = k.integrity; s.crossOrigin = 'anonymous';
      s.onload = () => { try { if (!window.Kakao.isInitialized()) window.Kakao.init(k.key); resolve(window.Kakao); } catch { resolve(null); } };
      s.onerror = () => resolve(null);
      document.head.append(s);
    });
  }).catch(() => null);
  return kakaoReady;
}
function field(id, label, input, extra) { return h('div', {class: 'iv-field'}, h('label', {for: id}, label), input, extra); }

/* 사장님 사진 열쇠 — https://aaa7377.com/invite.html#owner=<열쇠> 로 한 번 열면 이 기기에 기억(주소에서는 바로 지움) · 서버가 SHA-256 으로 맞춰 봄 */
const OWNER_KEY = 'atlas11:invite:owner';
function ownerKeyFromUrl() {
  const m = /(?:^#|&)owner=([A-Za-z0-9_-]{16,128})(?:&|$)/.exec(location.hash);
  if (!m) return false;
  store.set(OWNER_KEY, m[1]);
  try { history.replaceState(null, '', location.pathname + location.search); } catch {}
  return true;
}
/* 사진 줄이기 — 휴대폰에서 고른 사진을 JPEG 로(가장 긴 쪽 1100px부터 · 780KB 안 · 비율 1:2.5~2.5:1 로 가운데 자름) · 사진은 서버에 이것만 감 */
async function shrinkPhoto(file) {
  let src = null;
  if (window.createImageBitmap) src = await createImageBitmap(file, {imageOrientation: 'from-image'}).catch(() => createImageBitmap(file).catch(() => null));
  if (!src) src = await new Promise((resolve, reject) => { const fr = new FileReader(); fr.onload = () => { const im = new Image(); im.onload = () => resolve(im); im.onerror = reject; im.src = fr.result; }; fr.onerror = reject; fr.readAsDataURL(file); });
  const W0 = src.width || src.naturalWidth, H0 = src.height || src.naturalHeight;
  if (!W0 || !H0) throw Error('photo');
  let sx = 0, sy = 0, sw = W0, sh = H0; // 너무 긴 사진은 가운데만
  if (W0 / H0 > 2.5) { sw = Math.round(H0 * 2.5); sx = Math.round((W0 - sw) / 2); } else if (H0 / W0 > 2.5) { sh = Math.round(W0 * 2.5); sy = Math.round((H0 - sh) / 2); }
  for (const [max, q] of [[1100, 0.86], [1000, 0.8], [880, 0.74], [760, 0.7], [640, 0.66]]) {
    const k = Math.min(1, max / Math.max(sw, sh)), w = Math.max(1, Math.round(sw * k)), hh = Math.max(1, Math.round(sh * k));
    const c = document.createElement('canvas'); c.width = w; c.height = hh;
    const g = c.getContext('2d'); g.fillStyle = '#000'; g.fillRect(0, 0, w, hh); g.drawImage(src, sx, sy, sw, sh, 0, 0, w, hh);
    const url = c.toDataURL('image/jpeg', q);
    if (url.startsWith('data:image/jpeg') && url.length * 0.75 < 780000) { let x = 2166136261; for (let i = 0; i < url.length; i += 7) { x ^= url.charCodeAt(i); x = Math.imul(x, 16777619); } return {src: url, w, h: hh, id: (x >>> 0).toString(36) + url.length.toString(36)}; }
  }
  throw Error('too big');
}

function compose(main) {
  document.body.className = 'iv-day';
  document.title = 'ATLAS 초대장 보내기';
  let saved = null; try { saved = JSON.parse(store.sget('atlas11:invite:draft') ?? 'null'); } catch {}
  const to = h('input', {class: 'iv-in', id: 'iv-to', name: 'to', type: 'text', maxlength: String(LIMIT.name * 2), autocomplete: 'off', placeholder: '예: 하늘', 'aria-describedby': 'iv-to-err'});
  const from = h('input', {class: 'iv-in', id: 'iv-from', name: 'from', type: 'text', maxlength: String(LIMIT.name * 2), autocomplete: 'nickname', placeholder: '예: 바다', 'aria-describedby': 'iv-from-err'});
  const message = h('textarea', {class: 'iv-in', id: 'iv-msg', name: 'message', rows: '5', 'aria-describedby': 'iv-msg-count'});
  to.value = saved?.to ?? ''; from.value = saved?.from ?? store.get('atlas11:invite:from') ?? ''; message.value = saved?.message ?? DEFAULT_MESSAGE;
  const toErr = h('p', {class: 'iv-err', id: 'iv-to-err'}), fromErr = h('p', {class: 'iv-err', id: 'iv-from-err'});
  const count = h('span', {id: 'iv-msg-count'});
  const resetMsg = h('button', {type: 'button'}, '기본 문구로');
  const pvBtn = h('button', {class: 'iv-btn pri', type: 'submit'}, '미리 보기');
  // 사진(사장님 초대장만) — 사진 열쇠가 이 기기에 있을 때만 보임
  const ownerNew = ownerKeyFromUrl(), ownerKey = store.get(OWNER_KEY);
  let photo = null; try { photo = ownerKey ? JSON.parse(store.sget('atlas11:invite:photo') ?? 'null') : null; } catch { photo = null; }
  if (!(typeof photo?.src === 'string' && photo.src.startsWith('data:image/jpeg') && photo.w > 0 && photo.h > 0 && photo.id)) photo = null;
  const photoIn = h('input', {class: 'iv-file', id: 'iv-photo', type: 'file', accept: 'image/*'});
  const photoThumb = h('img', {class: 'iv-photo-thumb', alt: '고른 사진'});
  const photoPick = h('label', {class: 'iv-photo-pick', for: 'iv-photo'}, '사진 고르기');
  const photoDrop = h('button', {class: 'iv-photo-drop', type: 'button'}, '빼기');
  const photoErr = h('p', {class: 'iv-err', id: 'iv-photo-err', role: 'alert'});
  const photoField = ownerKey ? h('div', {class: 'iv-field iv-photo'},
    h('span', {class: 'iv-label'}, '사진', h('small', null, '사장님 전용 · 넣지 않아도 됩니다')),
    h('div', {class: 'iv-photo-row'}, photoThumb, h('div', {class: 'iv-photo-act'}, photoPick, photoDrop)),
    h('p', {class: 'iv-photo-note'}, '이 초대장 링크로만 볼 수 있습니다 · 선물을 열면 사진이 별빛 속에 떠오르고 금빛 별가루가 둘레를 돕니다'),
    photoIn, photoErr) : null;
  const ownerNote = ownerNew ? h('p', {class: 'iv-owner-ok', role: 'status'}, '이 휴대폰에서 사진을 넣을 수 있습니다') : null;
  const form = h('form', {class: 'iv-form', novalidate: true},
    ownerNote,
    field('iv-to', h('span', null, '받는 사람'), to, toErr),
    field('iv-from', h('span', null, '보내는 사람'), from, fromErr),
    field('iv-msg', h('span', null, '메시지', h('small', null, '고쳐 쓰셔도 됩니다 · 비워도 됩니다')), message, h('div', {class: 'iv-row'}, count, resetMsg)),
    photoField,
    h('p', {class: 'iv-privacy'}, h('b', null, '링크를 가진 사람은 누구나 이 초대장을 열 수 있습니다.'), ' 초대장은 180일 동안 열리고, 보낸 뒤에는 고칠 수 없습니다. 주소에는 메시지가 들어가지 않습니다.'),
    pvBtn);
  const pv = h('section', {class: 'iv-pv', 'aria-label': '미리 보기와 보내기'}); pv.hidden = true;
  const hero = h('div', {class: 'iv-hero'}, gift(), h('div', null, h('h1', null, 'ATLAS 초대장 보내기'), h('p', null, '소중한 사람에게 ATLAS를 작은 선물처럼 보냅니다.')));
  main.replaceChildren(
    h('header', {class: 'iv-top'}, h('div', {class: 'iv-top-in'}, h('a', {href: '/#/'}, h('img', {src: LOGO, alt: ''}), 'ATLAS'), h('a', {class: 'iv-back', href: '/#/'}, 'ATLAS로 돌아가기'))),
    h('div', {class: 'iv-wrap'}, hero, form, pv));

  const draft = () => ({to: to.value.trim(), from: from.value.trim(), message: message.value.replace(/\s+$/g, '')});
  const keep = () => { store.sset('atlas11:invite:draft', JSON.stringify(draft())); };
  const upd = () => { const n = chars(message.value); count.textContent = `${n} / ${LIMIT.message}자`; count.className = n > LIMIT.message ? 'iv-err' : ''; };
  const links = new Map(); // 글(받는 사람 · 보내는 사람 · 메시지) → {id, url} — 같은 글로 두 번 만들지 않음
  const keyOf = (d, pic = photo) => JSON.stringify(d) + '|' + (pic?.id ?? '');
  let shownKey = null; // 지금 미리 보기에 보이는 글
  for (const el of [to, from, message]) el.addEventListener('input', () => { el.removeAttribute('aria-invalid'); upd(); keep(); if (!pv.hidden && shownKey !== keyOf(draft())) pv.hidden = true; }); // 글을 고치면 지난 미리 보기는 닫음(옛 글이 보내지지 않게)
  resetMsg.addEventListener('click', () => { message.value = DEFAULT_MESSAGE; upd(); keep(); message.focus(); });
  upd();
  const photoUi = () => {
    if (!photoField) return;
    photoField.classList.toggle('has', !!photo); photoDrop.hidden = !photo;
    if (photo) photoThumb.src = photo.src; else photoThumb.removeAttribute('src');
    photoPick.textContent = photo ? '다른 사진' : '사진 고르기';
  };
  if (photoField) {
    photoUi();
    photoIn.addEventListener('change', async () => {
      const f = photoIn.files?.[0]; if (!f) return;
      photoErr.textContent = ''; photoPick.textContent = '사진을 줄이는 중…';
      try { photo = await shrinkPhoto(f); store.sset('atlas11:invite:photo', JSON.stringify(photo)); }
      catch { photoErr.textContent = '이 사진은 열 수 없습니다 — 다른 사진을 골라 주세요'; }
      photoIn.value = ''; photoUi(); if (!pv.hidden && shownKey !== keyOf(draft())) pv.hidden = true;
    });
    photoDrop.addEventListener('click', () => { photo = null; try { sessionStorage.removeItem('atlas11:invite:photo'); } catch {} photoUi(); if (!pv.hidden && shownKey !== keyOf(draft())) pv.hidden = true; photoPick.focus(); });
  }

  const check = () => {
    const d = draft(); let first = null;
    toErr.textContent = ''; fromErr.textContent = '';
    if (!d.to) { toErr.textContent = '받는 사람 이름을 적어 주세요'; to.setAttribute('aria-invalid', 'true'); first ??= to; }
    else if (chars(d.to) > LIMIT.name) { toErr.textContent = `이름은 ${LIMIT.name}자까지입니다`; to.setAttribute('aria-invalid', 'true'); first ??= to; }
    if (!d.from) { fromErr.textContent = '보내는 사람 이름을 적어 주세요'; from.setAttribute('aria-invalid', 'true'); first ??= from; }
    else if (chars(d.from) > LIMIT.name) { fromErr.textContent = `이름은 ${LIMIT.name}자까지입니다`; from.setAttribute('aria-invalid', 'true'); first ??= from; }
    if (chars(d.message) > LIMIT.message) { first ??= message; }
    if (first) { first.focus(); return null; }
    return d;
  };

  form.addEventListener('submit', e => {
    e.preventDefault();
    const d = check(); if (!d) return;
    store.set('atlas11:invite:from', d.from);
    showPreview(d);
  });

  let pvCtl = null;
  function showPreview(d) {
    const pic = photo; // 미리 보기를 연 때의 사진(그 뒤에 바꾸면 이 미리 보기는 닫힘)
    const status = h('p', {class: 'iv-status', role: 'status', 'aria-live': 'polite'});
    const say = (t, bad = false) => { status.textContent = t; status.className = 'iv-status' + (bad ? ' bad' : ''); };
    const frame = h('div', {class: 'iv-frame'});
    const sendBtn = h('button', {class: 'iv-btn pri', type: 'button'}, '카카오톡으로 보내기');
    const copyBtn = h('button', {class: 'iv-btn sec', type: 'button'}, '링크 복사');
    const editBtn = h('button', {class: 'iv-link', type: 'button'}, '고치기');
    const hint = h('p', {class: 'iv-hint'}, '휴대폰 공유 창이 열리면 카카오톡을 고르세요');
    const madeBox = h('div', {class: 'iv-made'}); madeBox.hidden = true;
    pv.replaceChildren(
      h('div', {class: 'iv-pv-h'}, h('h2', null, '받는 사람에게 이렇게 보입니다'), h('p', null, '합을 눌러 열어 보세요')),
      frame,
      h('div', {class: 'iv-share'}, sendBtn, hint, copyBtn, madeBox, status, editBtn));
    pv.hidden = false; shownKey = keyOf(d, pic);
    pvCtl?.destroy?.(); pvCtl = renderInvite(frame, {...d, photo: pic ? {src: pic.src, w: pic.w, h: pic.h} : null}, {preview: true, onStatus: t => say(t)});
    pv.scrollIntoView({behavior: reduced() ? 'auto' : 'smooth', block: 'start'});
    let K = null; // 불러 둔 카카오 — 누른 순간 기다림 없이 쓰려고
    kakaoInit().then(k => { K = k; if (k) hint.textContent = '카카오톡에서 받을 사람이나 대화방을 고르세요'; });

    // 초대장 주소는 미리 보기를 여는 때 서버에 만들어 둔다(보내기 전에는 아무에게도 가지 않음 · 번호를 모르면 못 엶)
    // — 휴대폰(아이폰 Safari · 카카오톡 안 브라우저)은 단추를 누른 그 순간에만 복사 · 공유 창 · 카카오 공유를 허락하므로, 누른 뒤 서버를 기다리지 않게
    const key = keyOf(d, pic);
    let pending = null, lastErr = '';
    const create = async () => {
      try {
        const headers = {'content-type': 'application/json'}; if (pic && ownerKey) headers['x-atlas-owner'] = ownerKey;
        const r = await fetch(API, {method: 'POST', headers, body: JSON.stringify(pic ? {...d, photo: pic.src} : d)});
        const b = await r.json().catch(() => null);
        if (!r.ok || !b?.id) {
          lastErr = r.status === 403 && b?.error === 'photo_owner_only' ? '사진 열쇠가 맞지 않습니다 — 사진을 빼면 보낼 수 있습니다'
            : r.status === 413 ? '사진이 너무 큽니다 — 다른 사진을 골라 주세요'
            : r.status === 400 ? (b?.fields?.some(f => f.field === 'photo') ? '이 사진은 보낼 수 없습니다 — 다른 사진을 골라 주세요' : '받는 사람 · 보내는 사람 이름을 확인해 주세요')
            : '초대장을 만들지 못했습니다 — 잠시 뒤 다시 눌러 주세요';
          return null;
        }
        const m = {id: b.id, url: `${location.origin}/i/${b.id}`}; links.set(key, m); lastErr = '';
        return m;
      } catch { lastErr = '인터넷 연결을 확인한 뒤 다시 눌러 주세요'; return null; }
    };
    const ready = () => links.get(key) ?? null;
    const ensure = () => (ready() ? Promise.resolve(ready()) : (pending ??= create().finally(() => { pending = null; }))); // 같은 글로는 한 번만
    ensure();
    const showUrl = m => {
      if (madeBox.querySelector('input')?.value === m.url) return;
      madeBox.replaceChildren(h('label', {for: 'iv-url'}, '초대장 주소'), h('input', {id: 'iv-url', type: 'text', readonly: true, value: m.url}));
      madeBox.hidden = false;
    };
    const copyNow = m => { // 누른 그 순간에 부름
      showUrl(m);
      const done = () => say('링크를 복사했습니다 — 카카오톡 대화방에 붙여 넣으세요');
      const byHand = () => { // 복사를 막는 곳: 주소 칸을 골라 두고(옛 방식 복사도 한 번) 길게 눌러 복사하게
        const inp = madeBox.querySelector('input'); inp?.focus(); inp?.select();
        let ok = false; try { ok = document.execCommand('copy'); } catch {}
        if (ok) done(); else say('아래 주소를 길게 눌러 복사해 주세요', true);
      };
      if (navigator.clipboard?.writeText) navigator.clipboard.writeText(m.url).then(done, byHand); else byHand();
    };
    const sendNow = m => {
      showUrl(m);
      if (K?.Share?.sendDefault) {
        try {
          K.Share.sendDefault({objectType: 'feed', content: {title: 'ATLAS 초대장이 도착했습니다', description: `${d.from}님이 보낸 작은 선물 · 눌러서 열어 보세요`, imageUrl: `${location.origin}/og-invite.png`, link: {mobileWebUrl: m.url, webUrl: m.url}},
            buttons: [{title: '초대장 열기', link: {mobileWebUrl: m.url, webUrl: m.url}}]});
          say('카카오톡 공유 창을 열었습니다'); return;
        } catch { /* 아래 공유 창 · 복사로 */ }
      }
      if (navigator.share) {
        navigator.share({title: 'ATLAS 초대장', text: `${d.from}님이 보낸 ATLAS 초대장이 도착했습니다.`, url: m.url}).then(
          () => say('공유 창에서 보냈습니다'),
          e => { if (e?.name === 'AbortError') say('공유 창을 닫았습니다 — 다시 누르거나 링크를 복사하세요'); else copyNow(m); });
        return;
      }
      copyNow(m); // 카카오 공유도 휴대폰 공유 창도 없는 곳(컴퓨터 등)
    };
    const press = async (act, isSend) => {
      const m = ready();
      if (m) { act(m); return; } // 보통: 주소가 이미 있음 → 누른 순간 바로
      sendBtn.disabled = copyBtn.disabled = true; say('초대장 주소를 만드는 중입니다');
      const r = await ensure();
      sendBtn.disabled = copyBtn.disabled = false;
      if (!r) { say(lastErr || '초대장을 만들지 못했습니다 — 잠시 뒤 다시 눌러 주세요', true); return; }
      if (isSend) { showUrl(r); say('초대장 주소가 준비됐습니다 — 「카카오톡으로 보내기」를 한 번 더 눌러 주세요'); sendBtn.focus(); return; } // 기다린 뒤에는 휴대폰이 공유 창을 막을 수 있어 한 번 더
      say(''); act(r); // 복사는 그대로 해 보고, 막히면 주소 칸을 골라 둠
    };
    sendBtn.addEventListener('click', () => press(sendNow, true));
    copyBtn.addEventListener('click', () => press(copyNow, false));
    editBtn.addEventListener('click', () => { pv.hidden = true; to.focus(); form.scrollIntoView({behavior: reduced() ? 'auto' : 'smooth', block: 'start'}); });
  }
}

/* ── 시작: /i/<번호> 또는 ?i=<번호> 면 받는 쪽, 아니면 보내는 쪽 ── */
export function inviteIdFrom(loc) {
  const m = loc.pathname.match(/\/i\/([^/?#]+)\/?$/);
  if (m) return decodeURIComponent(m[1]);
  return new URLSearchParams(loc.search).get('i');
}
const main = document.getElementById('iv-main');
if (main) {
  const id = inviteIdFrom(location);
  if (id != null) receive(main, id); else compose(main);
  addEventListener('hashchange', () => { if (inviteIdFrom(location) == null && /(?:^#|&)owner=/.test(location.hash)) compose(main); }); // 열린 쓰기 화면에 사진 열쇠 링크를 다시 열어도 받음
}
