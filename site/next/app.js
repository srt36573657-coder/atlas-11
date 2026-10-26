/* 새 아틀란스(시험판 /next/) — 유튜브 뼈대(홈 · 보는 화면 · 쇼츠 · 채널 · 구독 · 나 · 최초 공개) + 잡스 방식(한 화면 한 가지 · 손가락으로 바로 · 내용이 주인공)
   사장님 2026-10-17(싱가포르) 02:22 「구글이 유투브를 만들었잖아 그 구조 그리고 그본질을 중심에 둔다 … 잡스가 애플 스마트폰을 만들었던 사고방식과 ui/ux를 방식으로 … 아틀란스응 아주 대 혁식」
   · 02:24 「가」(한 가지를 일곱 화면으로) · 02:38 「정교하게 만들어라」 · 규칙 74 · 설계 기록 docs/design/new-tube-2026-10-17.md
   자료 = 지금 아틀란스 파일 그대로(/atlas/data/*.json) · 7단은 지금 아틀란스 화면으로 이어 줌(/#/g · /#/i · /#/c/<번호>/…) · 앞날 말 없음 · 사고팔기 권하지 않음
   보는 기계 기억(구독 · 본 기록 · 나중에 볼 것)은 이 기기에만(localStorage · 서버에 안 감) · 글은 textContent 로만(보안 규칙 안 — 안에 쓴 스크립트 · 꾸밈 없음) */
import {ON as EN, startI18n, switchLang, nameEn, t as L} from '/next/i18n.js'; // 새 화면 제 영어 엔진 · 사전(/next/i18n/ — 2026-10-17 15:54 「예전 아트란스는 앞으로 어떠한 작업도 하지 말아라」로 /atlas/ 와 떼어 냄)
import {NAME, VIDEO, josa} from '/next/brand.js'; // 이름 한 곳(규칙 76) — 새로 쓰는 글은 이름을 박지 않고 여기서 읽음
import {glossView} from '/next/glossary.js'; // 낱말표 한 곳(사장님 2026-10-18 [10] 1 · 2 — 갈래 → 큰 업종 …) · 그리는 곳 한 줄(route)
import {shareButtons} from '/next/share-btn.js'; // 카톡 단추 한 곳(사장님 2026-10-18 16:39 [6] 2 · 일꾼 KB1) — 종목 줄 · 카드가 부름(kkWrap · 일꾼 KB2)
import {ZONES as TH_ZONES, pp as thPp} from '/next/theme-rule.js'; // 테마 시계 자리 이름 · %p 글 꼴(회사 화면 자리 한 줄 wZone · 첫 화면 칸이 이미 받는 파일)
import {homeBlock as themeHome, APP_ICON} from '/next/theme-home.js'; // 테마 시계 첫 화면 칸(사장님 2026-10-19 16:54 · 원칙 85) — 첫 그림에 같이 그림(모듈 · 모양 · 자료는 index.html 이 미리 받음)
import {stoneClock, clockDecoded, miniClock} from '/next/stone-clock.js'; // 돌 시계(사장님 2026-10-21 21:21 「시계있는거 현재신ㅇ로 해놓아」) — 첫 화면 돌 그림 바늘판이 지금 시각
import {essenceData, essenceLines, fourADay} from '/next/essence.js'; // 첫 화면 본질 세 줄(사장님 2026-10-18 16:39 [5] · 일꾼 KC) — 글 틀 · 셈은 essence.js 한 곳(본질 문이 같은 셈으로 맞댐)
const $ = (sel, r = document) => r.querySelector(sel);
const SVGNS = 'http://www.w3.org/2000/svg';
function h(tag, attrs = {}, ...kids) {
  const e = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs || {})) {
    if (v == null || v === false) continue;
    if (k === 'text') e.textContent = v;
    else if (k === 'class') e.className = v;
    else if (k === 'css') for (const [p, q] of Object.entries(v)) e.style.setProperty(p, q); // 꾸밈은 CSSOM 으로만(보안 규칙 style-src 'self')
    else if (k.startsWith('on') && typeof v === 'function') e.addEventListener(k.slice(2), v);
    else e.setAttribute(k, v === true ? '' : String(v));
  }
  for (const k of kids.flat(Infinity)) if (k != null && k !== false) e.append(k instanceof Node ? k : String(k));
  return e;
}
function sv(tag, attrs = {}) { const e = document.createElementNS(SVGNS, tag); for (const [k, v] of Object.entries(attrs)) if (v != null) e.setAttribute(k, String(v)); return e; }
const store = {
  get(k, d) { try { const v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch { return d; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); return true; } catch { return false; } },
};
const K_SUB = 'atlas:new:sub', K_HIST = 'atlas:new:hist', K_LATER = 'atlas:new:later';

/* 숫자 — 지금 아틀란스와 같은 반올림(크기로 · −7.25 → −7.3 · 100% 넘으면 소수 없음) */
const r1 = x => Math.sign(x) * Math.floor(Math.abs(x) * 10 + 0.5 + 1e-7) / 10;
function pct(x) { if (x == null || !isFinite(x)) return '?'; const v = r1(x), a = Math.abs(v); return (v > 0 ? '+' : v < 0 ? '−' : '') + (a >= 100 ? Math.floor(a + 0.5 + 1e-7).toLocaleString('ko-KR') : a.toFixed(1)) + '%'; }
/** 지수 · 미국 하루 — 자료가 둘째 자리까지라 둘째 자리 그대로(지금 아틀란스 p2 와 같음 · 한 자리로 다시 줄이면 2.05 → 2.1 처럼 두 번 반올림됨) */
const p2 = v => (v == null || !isFinite(v) ? '?' : (v > 0 ? '+' : v < 0 ? '−' : '') + Math.abs(v).toFixed(2) + '%');
const cls = x => (x == null || !isFinite(x)) ? 'q' : r1(x) > 0 ? 'up' : r1(x) < 0 ? 'dn' : 'fl';
const COLOR = {up: '#007A35', dn: '#1E4FC2', fl: '#222222', q: '#6B2A8C'}; // 돌 판(2026-10-19 10:31) 오름 · 내림 · 그대로 · 모름 — app.css html.white 토큰과 같은 값
const num = n => Number(n).toLocaleString('ko-KR');
const md = d => (typeof d === 'string' && /^\d{4}-\d{2}-\d{2}/.test(d)) ? (+d.slice(5, 7)) + '월 ' + (+d.slice(8, 10)) + '일' : '?';
const chgOf = v => (Array.isArray(v) && v.length > 1 && v[0] > 0 && v[v.length - 1] > 0) ? (v[v.length - 1] / v[0] - 1) * 100 : null;
const dayOf = v => (Array.isArray(v) && v.length > 1 && v[v.length - 2] > 0 && v[v.length - 1] > 0) ? (v[v.length - 1] / v[v.length - 2] - 1) * 100 : null;
const enc = encodeURIComponent;
/** 회사 20거래일 % — 사이트가 낸 값(c · 줄이지 않은 선으로 셈) 먼저 · 없으면 선으로(지금 아틀란스와 같은 숫자) */
const c20 = o => Number.isFinite(o?.c) ? o.c : chgOf(o?.l);
const first = s => (EN ? (String(L(String(s || '?'))).match(/[A-Za-z0-9]/) || ['?'])[0].toUpperCase() : (String(s || '?').match(/[가-힣]/) || [Array.from(String(s || '?'))[0]])[0]); // 동그라미 글자 = 이름의 첫 한글(「K-소비재」 → 소) · 영어면 영어 이름의 첫 글자(한글 한 글자를 사전이 낱말로 바꾸면 「금」 → Fri · 「소」 → cattle)
/** 이름을 부르지 않는 곳(지금 아틀란스 이야기 칸과 같은 자) — 하루 30% 넘게 튐 · 빈 날 · 사흘 그대로 */
function odd(l) {
  if (!Array.isArray(l) || l.length < 3 || l.some(v => !(v > 0))) return true;
  for (let i = 1; i < l.length; i++) if (Math.abs(l[i] / l[i - 1] - 1) >= 0.3) return true;
  const n = l.length; return l[n - 1] === l[n - 2] && l[n - 2] === l[n - 3];
}

/* 자료 — 못 받으면 null(화면은 「?」) · 15초 뒤 다시 받아 봄 */
const FILES = {core: 'core.json', mkt: 'mkt.json', home: 'home.json', surge: 'surge.json', cond: 'cond.json', sum: '/next/data/home-summary.json', theme: '/next/data/theme.json', themeHome: '/next/data/theme-home.json', themeCo: '/next/data/theme-co.json', themePath: '/next/data/theme-path.json'}; // theme = 테마 쪽 자료 · themeHome = 첫 화면 칸 자료(올릴 때 셈 · 2026-10-19) // sum = 첫 화면 요약(S2c · [9] 7 · 몇 KB) — / 로 시작하면 그 길 그대로
const D = {}, failAt = {}, inflight = {};
function need(k) {
  if (D[k] != null) return Promise.resolve(D[k]);
  if (failAt[k] && Date.now() - failAt[k] < 15000) return Promise.resolve(null);
  if (!inflight[k]) inflight[k] = fetch((FILES[k][0] === '/' ? '' : '/atlas/data/') + FILES[k], {cache: 'no-cache'}).then(r => r.ok ? r.json() : null).catch(() => null)
    .then(j => { delete inflight[k]; if (j) D[k] = j; else failAt[k] = Date.now(); return j; });
  return inflight[k];
}
let IXC = null;
/** 찾아보기 — 업종 · 갈래 · 날짜 줄(회사 선 칸 = core.dates · 처음 날 · 끝 날이 같을 때만) */
function ix() {
  if (IXC || !D.core || !D.mkt) return IXC;
  const core = D.core, mkt = D.mkt, co = mkt.companies || {};
  const ind = new Map((core.industries || []).map(x => [x.name, x])), grp = new Map((core.groups || []).map(x => [x.id, x]));
  const dates = Array.isArray(core.dates) && core.dates[0] === mkt.base && core.dates[core.dates.length - 1] === mkt.asOf ? core.dates : null;
  IXC = {core, mkt, co, ind, grp, dates}; return IXC;
}
let CONDC = null;
/** 몸값 · 업종 안 몸값 차례(1 = 대장주) · 5일 선 — cond.json(같은 날 자료일 때만) */
function condOf() {
  if (CONDC || !D.cond || !D.mkt) return CONDC;
  const C = D.cond.co, I = D.cond.ind || [];
  if (D.cond.asOf !== D.mkt.asOf || !C?.c) return null;
  CONDC = new Map(C.c.map((c, k) => [c, {cap: C.cap?.[k], rk: C.rk?.[k], r5: C.r5?.[k], l5: C.l5?.[k], i: I[C.i?.[k]]?.n}]));
  return CONDC;
}
/** 회사 선의 날짜 — 끝에서 맞춤(새로 든 회사는 칸이 짧을 수 있음) · 날짜 줄이 없으면 null */
function dateAt(n, i) { const d = ix()?.dates; return d && d.length >= n ? d[d.length - n + i] : null; }

/* 그림 조각 */
const ICONS = {
  search: [['circle', {cx: 10.5, cy: 10.5, r: 6.5}], ['path', {d: 'm15.5 15.5 5 5'}]],
  share: [['path', {d: 'M12 15V4M7.5 8.5 12 4l4.5 4.5M5 13v6h14v-6'}]], // 돌 판 보내기(노란 칠 말풍선 대신 가는 선 — 시안 platform3)
};
function icon(k) { const s = sv('svg', {class: 'ic', viewBox: '0 0 24 24', 'aria-hidden': 'true'}); for (const [t, a] of ICONS[k]) s.append(sv(t, a)); return s; }
/** 선 — 썸네일(16:9 칸 안 92% × 60% = 320 × 117 비율 그대로 · 끝 점) · 넓은 칸은 늘림(점 없음) */
function lineSvg(vals, {w = 320, ht = 117, fill = true, dot = true, sw = 4, draw = false, stretch = false} = {}) {
  const v = (vals || []).filter(x => Number.isFinite(x));
  if (v.length < 2) return null;
  const lo = Math.min(...v), hi = Math.max(...v), n = v.length, c = COLOR[cls(chgOf(v))];
  const P = v.map((y, i) => [i * w / (n - 1), (hi - y) * ht / ((hi - lo) || 1)]);
  const d = 'M' + P.map(p => p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join(' L');
  const svg = sv('svg', {class: 'ln', viewBox: `-8 -8 ${w + 16} ${ht + 16}`, preserveAspectRatio: stretch ? 'none' : null, 'aria-hidden': 'true'});
  if (fill) svg.append(sv('path', {d: d + ` L${w} ${ht + 8} L0 ${ht + 8} Z`, fill: c, opacity: '.13'}));
  svg.append(sv('path', {d, fill: 'none', stroke: c, 'stroke-width': sw, 'stroke-linejoin': 'round', 'stroke-linecap': 'round', 'vector-effect': 'non-scaling-stroke', pathLength: draw ? 1 : null, class: draw ? 'draw' : null}));
  if (dot && !stretch) { const [x, y] = P[n - 1]; svg.append(sv('circle', {cx: x.toFixed(1), cy: y.toFixed(1), r: 7, fill: c})); }
  return svg;
}
/** 썸네일 — 큰 숫자 = 그린 선의 처음 → 끝(늘 같은 뜻) · 아래 오른쪽 = 기간 */
function thumb(vals, badge, {play = false, kick = null, x: xo = null} = {}) {
  const x = Number.isFinite(xo) ? xo : chgOf(vals);
  return h('div', {class: 'th'}, lineSvg(vals), h('b', {class: 'big ' + cls(x), text: pct(x)}), badge ? h('span', {class: 'dur', text: badge}) : null,
    kick ? h('span', {class: 'kick', text: kick}) : null, play ? h('i', {class: 'play', 'aria-hidden': 'true'}) : null);
}
function numThumb(big, x, small) { return h('div', {class: 'th num'}, h('b', {class: cls(x), text: big}), small ? h('small', {text: small}) : null); }
function card(href, th, title, meta, av) {
  return h('a', {class: 'card', href}, th, h('div', {class: 'meta'}, h('span', {class: 'av', 'aria-hidden': 'true', text: av}), h('div', {}, h('b', {text: title}), h('small', {text: meta}))));
}
function toast(t) { const e = h('p', {class: 'toast', role: 'status', text: t}); document.body.append(e); setTimeout(() => e.remove(), 2400); }
/** 옛 보내기(제목 · 주소만) — 보내기 글상자(p-share)를 못 받았을 때만 씀 */
let GR = null; // gift-ref.js
async function share(title, url, text = '') { // text = 보낼 글(사장님 2026-10-25 「카톡 보내기」 글 단추 · share-btn.js kakaoText) — 없으면 예전 그대로(제목 · 주소)
  if (GR) url = GR.withRef(url);
  try { if (navigator.share) { await navigator.share(text ? {title, text, url} : {title, url}); return; } await navigator.clipboard.writeText(text ? text + '\n' + url : url); toast('주소를 담았어요. 붙여 넣어 보내세요.'); }
  catch (e) { if (e?.name !== 'AbortError') toast('보내기를 열지 못했어요.'); }
}
/** 보내기 글상자(사장님 2026-10-17 21:10 [4] — 「친구에게 무슨 말을 할래?」부터 · 수익률 글 없음) — 일꾼 C 의 p-share open(o) 을 부름
    o = {kind: 'share' | 'ask', title, url, code?, price?, day?} · 모듈을 못 받으면 옛 보내기(제목 · 주소) */
async function shareBox(o = {}) {
  let m = null; const h0 = location.hash; // 누른 쪽 — 모듈을 받는 사이(느린 망) 다른 쪽으로 가면 열지 않음(2026-10-20 늦게 뜬 글상자가 다음 쪽을 덮고 다른 회사 이름으로 열리던 것)
  try { m = await mod('share'); } catch (e) { console.error(e); }
  if (location.hash !== h0) return {how: 'close', text: null, url: null};
  if (typeof m?.open === 'function') { try { return await m.open(o); } catch (e) { console.error(e); } }
  return share(o.title, o.url);
}
const absUrl = hash => location.origin + '/' + hash;

/* 구독 · 본 기록 · 나중에 볼 것(이 기기에만) */
const subs = () => store.get(K_SUB, []).filter(x => typeof x === 'string');
const isSub = key => subs().includes(key);
/** 돌려줌 = 지금 담겼나 · 이 기기 저장이 막혔으면 null(담았다고 하지 않음 — 새 눈 검사 2026-10-19 22시 · 테마 관심 업종과 같은 잣대) */
function toggleSub(key) { const s = subs(), on = s.includes(key); const nx = on ? s.filter(x => x !== key) : [key, ...s].slice(0, 60); return store.set(K_SUB, nx) ? !on : null; }
const SAVE_FAIL = '이 기기에 담지 못했어요. 저장이 꺼져 있는지 봐 주세요.';
/* 관심 담기 단추(사장님 2026-10-17 21:10 [2] 8 — 옛 「구독」 · 「나중에 볼 것 담기」를 한 이름으로) · 기억 열쇠는 옛 이름 그대로(atlas:new:sub · atlas:new:later — 바꾸면 담아 둔 것이 사라짐) */
const KEEP_ON = '관심 담음', KEEP_OFF = '관심 담기';
const keepMsg = (name, on) => (on ? name + ' 관심에 담았어요. 관심 칸에 모여요.' : name + ' 관심에서 뺐어요.');
function subBtn(key, name) {
  const b = h('button', {class: 'sub-btn', type: 'button', 'aria-pressed': String(isSub(key)), text: isSub(key) ? KEEP_ON : KEEP_OFF});
  b.addEventListener('click', e => { e.preventDefault(); const on = toggleSub(key); if (on == null) { toast(SAVE_FAIL); return; } b.setAttribute('aria-pressed', String(on)); b.textContent = on ? KEEP_ON : KEEP_OFF; toast(keepMsg(name, on)); });
  return b;
}
function pushHist(code) { const s = store.get(K_HIST, []).filter(x => x !== code); store.set(K_HIST, [code, ...s].slice(0, 30)); }
const laters = () => store.get(K_LATER, []).filter(x => typeof x === 'string');
const isLater = code => laters().includes(code);
function toggleLater(code) { const s = laters(), on = !s.includes(code); return store.set(K_LATER, on ? [code, ...s].slice(0, 60) : s.filter(x => x !== code)) ? on : null; } // 막히면 null(toggleSub 와 같음)
/** 회사 관심 담기 단추 — 보는 화면 · 관심 칸이 함께 씀(cls = 꼴 이름) */
function laterBtn(code, name, cls = 'act') {
  const b = h('button', {class: cls, type: 'button', 'aria-pressed': String(isLater(code)), text: isLater(code) ? KEEP_ON : KEEP_OFF});
  b.addEventListener('click', e => { e.preventDefault(); const on = toggleLater(code); if (on == null) { toast(SAVE_FAIL); return; } b.setAttribute('aria-pressed', String(on)); b.textContent = on ? KEEP_ON : KEEP_OFF; toast(keepMsg(name, on)); });
  return b;
}
function chanName(key) {
  const X = ix(); if (!X) return key;
  if (key.startsWith('g:')) { const g = X.grp.get(key.slice(2)); return g ? g.name + ' 갈래' : '?'; }
  if (key.startsWith('i:')) { const i = X.ind.get(key.slice(2)); return i ? i.name + ' 업종' : '?'; }
  return '?';
}
const chanHref = key => '#/ch/' + key.slice(0, 1) + '/' + enc(key.slice(2));

/* 편지 여는 밤 — 다음 금요일 저녁 8시(서울) · 보는 기계 시계로 셈(정확한 시계는 편지 쪽이 서버로 맞춤) */
function nextOpen() {
  const now = Date.now(), k = new Date(now + 9 * 3600e3), dow = k.getUTCDay();
  let t = Date.UTC(k.getUTCFullYear(), k.getUTCMonth(), k.getUTCDate(), 11, 0, 0) + ((5 - dow + 7) % 7) * 864e5; // 금요일 20:00 서울 = 11:00 UTC
  if (t <= now) t += 7 * 864e5;
  return {t, d: new Date(t + 9 * 3600e3).toISOString().slice(0, 10)};
}
function premCard() {
  const o = nextOpen();
  return h('a', {class: 'prem', href: '/letter.html'}, h('div', {class: 'pth'}, h('b', {text: '금요일 밤 8시'}), h('small', {text: '최초 공개'})),
    h('div', {}, h('b', {text: '편지 여는 밤'}), h('small', {text: md(o.d) + ' · 쓴 편지가 다 함께 열려요'})));
}

/* ── 첫 화면 붙박이 — 지금 아틀란스(site/atlas/atlas.js)에서 그대로 옮김(규칙 62 · 65 · 66 · 67) ──
   사장님 글(격언 열 가지)과 상품권 줄은 글자 그대로 — next_check 가 atlas.js 의 HELLO_MSG · HELLO_PROMO 와 맞대 봄 */
const RM = matchMedia('(prefers-reduced-motion: reduce)');
const NB = ' ';
const HELLO_PROMO = '3명 소개하고 1분 영상 보면 스타벅스 상품권 1만원!'; // 사장님 2026-10-22 01:49 「… 마오는영상 1붘을 봐야 그게 정당해 그게 고지 해야고」 — 옛 「3명만 소개해도」는 영상 조건을 숨기므로 바꿈(order-0149 · 소개 쪽 상품권 칸과 같은 약속)
const HELLO_MSG = ['돌이 주식 격언 열 가지','1. 쉬는 것도 투자다. 안 사는 날이 더 많아야 합니다.', '2. 잃지 않는 게 버는 거다. 돈을 불리기 전에 먼저 지킵니다.', '3. 사기 전에 팔 곳부터 정해라. 떨어지면 어디서 팔지 미리 정합니다.', '4. 모두가 웃을 때 나는 늦었다. 다들 좋다고 떠들면 이미 비싼 겁니다.', '5. 헷갈리면 안 사는 게 답이다. 애매하면 그냥 넘깁니다.', '6. 자신 없으면 조금만. 확신이 없으면 내 돈의 열에 하나까지만.', '7. 시장이 흔들리면 나는 멈춘다. 크게 출렁이는 날은 쉽니다.', '8. 손해는 짧게, 이익은 길게. 떨어지면 빨리 팔고, 오르면 오래 들고 갑니다.', '9. 돈이 가는 길을 따라가라. 돈이 몰리는 업종에서만 고릅니다.', '10. 기회는 찾아오는 거지, 만드는 게 아니다. 억지로 사지 말고 좋은 때를 기다립니다.'];
const INTRO_FLY = 4200, INTRO_LAND = 800; // 날기 시작 · 나는 때(합 5초 = 여는 고도리 5초 · 규칙 66)
let helloIntro = true;
const ICON2 = {
  send: () => { const s = sv('svg', {width: 22, height: 22, viewBox: '0 0 24 24', 'aria-hidden': 'true'}); s.append(sv('path', {d: 'M3 11.5 21 4l-7.5 18-2.5-7.5z', fill: 'none', stroke: 'currentColor', 'stroke-width': 1.6, 'stroke-linejoin': 'round'}), sv('path', {d: 'm11 14.5 4-4', stroke: 'currentColor', 'stroke-width': 1.6, 'stroke-linecap': 'round'})); return s; },
  gift: () => { const s = sv('svg', {class: 'm4-gi', width: 22, height: 22, viewBox: '0 0 24 24', 'aria-hidden': 'true'}); s.append(sv('rect', {x: 3.5, y: 9, width: 17, height: 11.5, rx: 2, fill: 'none', stroke: 'currentColor', 'stroke-width': 1.6}), sv('path', {d: 'M3.5 13h17M12 9v11.5M12 9c-1.5-4-6-4-6-1.5S12 9 12 9zm0 0c1.5-4 6-4 6-1.5S12 9 12 9z', fill: 'none', stroke: 'currentColor', 'stroke-width': 1.6, 'stroke-linejoin': 'round'})); return s; },
};
/** 선물 상자 그림(위 막대 상품권 방 단추 · 편지 상품권 줄 그림과 같은 꼴) */
const giftIcon = () => { const s = sv('svg', {class: 'ic', width: 24, height: 24, viewBox: '0 0 24 24', 'aria-hidden': 'true'}); s.append(sv('rect', {x: 3.5, y: 9, width: 17, height: 11.5, rx: 2}), sv('path', {d: 'M3.5 13h17M12 9v11.5M12 9c-1.5-4-6-4-6-1.5S12 9 12 9zm0 0c1.5-4 6-4 6-1.5S12 9 12 9z'})); return s; };
/** 사장님 편지 + 친구에게 소개하기 + 상품권 줄 · 처음 열 때 한 번 보드리 5초(움직임 줄이기면 바로 글) */
function m4letter() {
  const intro = helloIntro && !RM.matches; helloIntro = false;
  const msg = h('span', {class: 'hmsg m4-msg', lang: 'ko'}, ...HELLO_MSG.map(t => h('span', {class: 'hml', text: t})), h('i', {class: 'm4-moon', 'aria-hidden': 'true'}),
    h('img', {class: 'm4-hp', src: '/media/makbi-hello.svg', alt: '', width: 88, height: 110, decoding: 'async', 'aria-hidden': 'true'}));
  const stars = h('span', {class: 'm4-stars', 'aria-hidden': 'true'}, ...[0, 1, 2, 3, 4, 5, 6].map(() => h('i')));
  const cut = HELLO_PROMO.indexOf('스타벅스');
  const a = h('a', {class: 'hello m4-letter', href: '/hello.html'}, stars, msg,
    h('span', {class: 'm4-act'}, h('span', {class: 'm4-ic'}, ICON2.send()), h('span', {class: 'm4-aw'}, h('b', {text: '친구에게 소개하기'}), (VIDEO.ready ? h('span', {}, VIDEO.title + ' ', h('span', {class: 'nb', text: '영상 · 보내기'})) : h('span', {}, NAME + ' 소개 ', h('span', {class: 'nb', text: '· 보내기'})))), h('i', {class: 'm4-chev', 'aria-hidden': 'true', text: '›'})),
    h('span', {class: 'm4-gift'}, ICON2.gift(), h('span', {}, HELLO_PROMO.slice(0, cut), h('span', {class: 'nb', text: HELLO_PROMO.slice(cut)}))));
  if (!intro) return a;
  a.classList.add('intro');
  const pi = h('span', {class: 'hpi', 'aria-hidden': 'true'}, h('i', {class: 'm4-bm'}), h('img', {class: 'hpi-bird', src: '/media/makbi-hello.svg', alt: '', width: 240, height: 300, decoding: 'async'}),
    ...['b1', 'b2', 'b3'].map(k => h('b', {class: 'hpi-b ' + k, text: '돌이!'})));
  a.append(pi);
  let done = false;
  const land = () => { if (done) return; done = true; a.classList.remove('intro', 'flying'); a.classList.add('rv', 'landed'); pi.remove(); };
  const fly = () => {
    if (!a.isConnected || done) return;
    const bi = pi.querySelector('img'), si = msg.querySelector('.m4-hp'), bm = pi.querySelector('.m4-bm'), sm = msg.querySelector('.m4-moon');
    if (!bi.animate) { land(); return; }
    a.classList.add('flying');
    for (const x of pi.querySelectorAll('.hpi-b')) x.animate([{opacity: getComputedStyle(x).opacity}, {opacity: 0}], {duration: 260, easing: 'ease-out', fill: 'forwards'});
    for (const [p, q] of [[bi, si], [bm, sm]]) { const r0 = p.getBoundingClientRect(), r1x = q.getBoundingClientRect(); if (!r0.width) continue; let cs = getComputedStyle(p).transform; cs = cs === 'none' ? '' : cs;
      const dx = (r1x.left + r1x.width / 2) - (r0.left + r0.width / 2), dy = (r1x.top + r1x.height / 2) - (r0.top + r0.height / 2), sc = r1x.width / r0.width; p.style.animation = 'none';
      p.animate([{transform: cs || 'none'}, {transform: `translate(${dx.toFixed(1)}px,${dy.toFixed(1)}px) ${cs} scale(${sc.toFixed(4)})`}], {duration: INTRO_LAND, easing: 'cubic-bezier(.55,0,.2,1)', fill: 'forwards'}); }
    setTimeout(land, INTRO_LAND);
  };
  let tries = 0;
  const start = () => { if (!a.isConnected) { if (++tries < 600) requestAnimationFrame(start); else land(); return; } setTimeout(fly, INTRO_FLY); setTimeout(land, INTRO_FLY + INTRO_LAND + 1500); };
  requestAnimationFrame(start);
  return a;
}
/* 오늘 한 줄(평소와 견줌 · 지난 사실만) — atlas.js gauge · todayWords 그대로 */
const mdN = d => { const p = String(d).split('-'); return (+p[1]) + '월 ' + (+p[2]) + '일'; };
const hasB = w => { const c = String(w).trim().slice(-1), k = c.charCodeAt(0) - 0xAC00; return k >= 0 && k <= 11171 ? k % 28 !== 0 : '013678'.includes(c); };
const jo = (w, a, b) => w + (hasB(w) ? a : b);
const a1 = x => pct(x).replace(/^[+−]/, '');
const isDay = d => /^\d{4}-\d{2}-\d{2}/.test(String(d ?? ''));
const isTime = t => /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}/.test(String(t ?? ''));
const kstNow = () => new Date(Date.now() + 9 * 36e5).toISOString();
const ampm = t => { if (!isTime(t)) return '?'; const hh = +t.slice(11, 13), mm = t.slice(14, 16); return `${hh < 12 ? '오전' : '오후'}${NB}${hh % 12 || 12}:${mm}`; };
const dayK = d => (!isDay(d) ? '?' : String(d).slice(0, 10) === kstNow().slice(0, 10) ? '오늘' : mdN(String(d).slice(0, 10)));
const tillT = t => `${dayK(t.slice(0, 10))} ${ampm(t)}까지`;
const tillOk = (w, d) => w.intra && isTime(w.t) && (!isDay(d) || w.t.slice(0, 10) === String(d).slice(0, 10));
const timesW = r => (r >= 2.4 && r < 2.5 ? String(Math.floor(r * 100 + 1e-9) / 100) : (r >= 10 ? Math.round(r) : Math.round(r * 10) / 10).toLocaleString('ko-KR'));
const usualW = r => (r == null ? '' : r >= 1.25 ? `평소의${NB}${timesW(r)}배` : r >= 0.8 ? '평소만큼' : '평소보다 작게');
const inSession = H => { if (!H?.live) return false; const n = kstNow(), t = n.slice(11, 16); return n.slice(0, 10) === String(H.kst ?? '').slice(0, 10) && t >= '09:00' && t < '15:30'; };
function whenOf(H, k, live) {
  const s0 = H?.stale?.[k], ok = isTime(s0), t = (ok ? s0 : H?.kst ?? '').slice(0, 16);
  const intra = ok ? (live ?? (t.slice(11, 16) >= '09:00' && t.slice(11, 16) < '15:30')) : !!(live ?? H?.live);
  return {t, stale: !!s0, intra, now: !s0 && intra && inSession(H)};
}
const idxOk = x => (x && Array.isArray(x.rows) && x.rows.length >= 2 && x.rows.every(r => Array.isArray(r) && r[1] > 0) ? x : null);
function gauge(x) {
  const r = x?.rows; if (!r || r.length < 22) return null;
  const d = [], ds = [];
  for (let k = 1; k < r.length; k++) if (r[k - 1][1] > 0 && r[k][1] > 0) { d.push((r[k][1] / r[k - 1][1] - 1) * 100); ds.push(r[k][0]); }
  const n = d.length, t = d[n - 1]; if (n < 21 || !isFinite(t)) return null;
  const same = v => (t < 0 ? v <= t : t > 0 ? v >= t : false);
  let since = null, gap = null; for (let k = n - 2; k >= 0; k--) if (same(d[k])) { since = ds[k]; gap = n - 1 - k; break; }
  const avg = d.slice(n - 21, n - 1).reduce((a, v) => a + Math.abs(v), 0) / 20;
  let streak = 0, acc = 1; for (let k = n - 1; k >= 0 && t !== 0 && Math.sign(d[k]) === Math.sign(t); k--) { streak++; acc *= 1 + d[k] / 100; }
  return {d, ds, n, t, since, gap, rank: t ? d.filter(same).length : null, avg, ratio: avg > 0 ? Math.abs(t) / avg : null, streak, streakChg: (acc - 1) * 100};
}
function todayWords(nm, X, w) {
  if (!X) return [`? ${nm} 값을 못 받았어요.`];
  const g = gauge(X), when = tillOk(w, X.date) ? tillT(w.t) : dayK(X.date);
  if (!g) return [`${when} ${jo(nm, '은', '는')} ${pct(X.day)}예요.`, '? 3달 값이 모자라 평소와 견주지 못했어요.'];
  const t = g.t, dn = t < 0, did = dn ? '내렸어요' : '올랐어요', out = [];
  if (pct(t) === '0.0%') return [`${when} ${jo(nm, '은', '는')} 거의 그대로였어요.`];
  out.push(`${when} ${jo(nm, '은', '는')} ${a1(t)}${NB}${did}.`);
  if (g.ratio != null) out.push(g.ratio >= 1.25 ? `${usualW(g.ratio)}예요.` : g.ratio >= 0.8 ? '평소만큼 움직였어요.' : '평소보다 작게 움직였어요.');
  if (g.ratio != null && g.ratio >= 1.25) { if (!g.since) out.push(`3달 동안 가장 크게 ${did}.`); else if (g.gap >= 5) out.push(`${mdN(g.since)} 이후 가장 크게 ${did}.`); }
  if (g.streak >= 3) out.push(`${g.streak}거래일 잇달아 ${dn ? '내렸고' : '올랐고'}, 그동안 ${a1(g.streakChg)}${NB}${dn ? '빠졌어요' : '뛰었어요'}.`);
  return out;
}
/** 큰 날 금빛 「!」(home-v3 · 미리 정한 문턱을 넘은 날만) */
function idxAlerts(H) {
  const ix = (H.alerts ?? []).filter(a => a.kind === 'idx'), out = [], way = xs => (xs.every(a => a.v < 0) ? '내렸어요' : xs.every(a => a.v > 0) ? '올랐어요' : '움직였어요');
  for (const why of ['big', 'usual']) { const xs = ix.filter(a => (a.why ?? 'usual') === why); if (!xs.length) continue;
    out.push(h('p', {class: 'm4-al', text: `! ${xs.length > 1 ? '코스피와 코스닥 모두' : jo(xs[0].name, '이', '가')} ${why === 'big' ? '하루 5% 넘게' : '평소의 2.5배 넘게'} ${way(xs)}.`})); }
  return out;
}
function dday(d) { const k = new Date(Date.now() + 9 * 36e5), t = Date.UTC(k.getUTCFullYear(), k.getUTCMonth(), k.getUTCDate()); const [y, m, x] = d.split('-').map(Number); return Math.round((Date.UTC(y, m - 1, x) - t) / 864e5); }
const ddayText = d => { const n = dday(d); return n > 0 ? 'D-' + n.toLocaleString('ko-KR') : n === 0 ? '오늘 엶' : '엶 날 지남 — 다시 셀 차례'; };

/* 시황 사실(옛 쇼츠) — 「왜 움직였나」만(사장님 2026-10-17 21:10 [2] 10 「급등 목록은 넣지 마라. 몰려 사기를 부추긴다.」)
   지수 하루 → 오른 곳 · 내린 곳 수 → 업종 · 갈래가 어디로 갔나 → 미국 · 사이트 자료로만 셈 · 날짜를 함께
   뺀 것: 급등 칸 1등 · 모든 회사 가운데 가장 많이 오른 곳(급등 목록과 같은 몰림) · 고른 곳 오름 수(시장이 왜 움직였나가 아님) · 편지 여는 밤(보유종목 바로 가기에 남음)
   st = 보내기 제목(숫자 · 수익률 없음 — [4] 5 「수익률은 보내지 마라」) */
function shortFacts() {
  const X = ix(), out = [];
  if (!X) return out;
  const H = D.home, core = X.core, mkt = X.mkt;
  const kp = H?.idx?.KOSPI, kq = H?.idx?.KOSDAQ;
  // 첫 장 머리 = 첫 화면 띠 · #/today 와 같은 셈(whenOf — 총정리 2026-10-22 C19: 지난 장 중 값이 「10월 12일 장 중」으로 「지금」처럼 읽히던 것) — 지난 값은 「? 10월 12일 오후 2:59까지」
  const kw = kp ? whenOf(H, 'idx', kp.live) : null, kd = String(kp?.date ?? '').slice(0, 10);
  const kk = !kw ? '' : (kw.stale ? '? ' : '') + (kw.now ? `${md(kd)} ${ampm(kw.t)} 장 중` : kw.intra && isTime(kw.t) ? `${md(kw.t.slice(0, 10))} ${ampm(kw.t)}까지` : `${md(kd)} 장 마감`);
  if (kp && Number.isFinite(kp.day)) out.push({id: 'idx', k: kk, l1: '코스피는 하루', big: p2(kp.day), bc: cls(kp.day),
    l2: kq && Number.isFinite(kq.day) ? '코스닥은 ' + p2(kq.day) + '이에요' : '코스닥은 ?', mini: (kp.rows || []).slice(-21).map(r => r[1]), ml: '선은 코스피 20거래일이에요', go: '#/w/KOSPI', tile: ['코스피 ' + p2(kp.day), md(kp.date)],
    st: md(kp.date) + ' 코스피 · 코스닥 시황'});
  let up = 0, dn = 0, fl = 0;
  for (const c of Object.values(X.co)) { const x = dayOf(c.l); if (x == null) continue; if (x > 0) up++; else if (x < 0) dn++; else fl++; }
  if (up + dn + fl) out.push({id: 'breadth', k: md(mkt.asOf) + ' 장 마감', l1: '모든 회사 ' + num(up + dn + fl) + '곳 가운데', big: num(Math.max(up, dn)) + '곳', bc: up >= dn ? 'up' : 'dn',
    l2: up >= dn ? '올랐어요' : '내렸어요', ratio: {up, fl, dn}, go: null, tile: [num(Math.max(up, dn)) + '곳', up >= dn ? '오른 곳' : '내린 곳'], st: md(mkt.asOf) + ' 오른 곳과 내린 곳'});
  const r0 = core.rise?.list?.[0];
  if (r0) out.push({id: 'rise', k: '닷새 동안 · ' + md(core.rise.from) + '부터', l1: r0.name, big: pct(r0.chg), bc: cls(r0.chg), l2: '닷새 동안 오른 업종 ' + core.rise.list.length + '개 가운데 가장 많이 올랐어요', mini: r0.v, ml: '선은 닷새예요', go: '#/ch/i/' + enc(r0.name), tile: [pct(r0.chg), r0.name], // 「1등」 · 「1주」(주식 한 주와 헷갈림) 지움 — 총정리 C19 · C13
    st: r0.name + ' 업종 닷새 시황'});
  const gs = [...(core.groups || [])].filter(g => Number.isFinite(g.chg)).sort((a, b) => b.chg - a.chg);
  if (gs.length) {
    const g = gs[0], w = gs[gs.length - 1];
    out.push({id: 'gtop', k: '20거래일 · ' + md(core.base) + '부터', l1: g.name + ' 갈래', big: pct(g.chg), bc: cls(g.chg), l2: '큰 갈래 ' + gs.length + '개 가운데 가장 많이 올랐어요', mini: g.v, ml: '선은 20거래일이에요', go: '#/ch/g/' + enc(g.id), tile: [pct(g.chg), g.short || g.name],
      st: g.name + ' 갈래 20거래일 시황'});
    if (w !== g) out.push({id: 'glow', k: '20거래일 · ' + md(core.base) + '부터', l1: w.name + ' 갈래', big: pct(w.chg), bc: cls(w.chg), l2: '큰 갈래 가운데 가장 많이 내렸어요', mini: w.v, ml: '선은 20거래일이에요', go: '#/ch/g/' + enc(w.id),
      st: w.name + ' 갈래 20거래일 시황'});
  }
  const us = H?.us?.rows;
  if (Array.isArray(us) && us[0] && Number.isFinite(us[0].chg)) out.push({id: 'us', k: '미국 · ' + md(H.us.date), l1: us[0].name, big: p2(us[0].chg), bc: cls(us[0].chg), l2: us.slice(1, 3).map(r => r.name + ' ' + p2(r.chg)).join(' · '), go: '#/f/us',
    st: '미국 ' + md(H.us.date) + ' 마감 시황'});
  return out;
}

/* ── 첫 화면 한 화면(2026-10-18 명령문 0015 [6] 1 ~ 4 · 8 · 9 · [9] 7 · 일꾼 S2 → S2x) ──
   고르기 칩 → 이야기 입구 → 한 줄 띠(날짜는 여기 한 번 · 코스피 · 코스닥 하루 % · 큰 날 금빛 「!」 · 누르면 #/today) → 「친구야, 왜 사?」 → 고도리 칸 → 「더 보기」(닫힘) → 안전 한 줄
   「더 보기」 안 = 오늘 시장 세 줄(묶음마다 큰 숫자 하나 + 까닭 한 줄 · 자료로만 셈 · 띠 날과 다른 날이면 「사흘 지난 값」) + 오른 업종 · 큰 업종 한 줄 목록 · 편지 여는 밤 · 봉인 줄 · 약속
   뺀 것: 지수 카드 둘 · 「오늘 한 줄」 · 시황 선반(띠 숫자와 같은 숫자) · 오늘 시장 여섯 칸(→ #/today) · 급등 카드([6] 5) · 대장주 · 고른 곳 카드(→ 그 칩)
   자료: home.json(7KB — 띠 · 사고팔기 · 미국) + 요약 /next/data/home-summary.json(3KB — 모든 회사 하루 · 「더 보기」 목록) · mkt · cond 는 받지 않음 · 요약이 없거나 옛것(src.home ≠ home.json kst)이면 home.json + core 로 그림 */
const homeSrc = () => D.home ?? null;
const AGO = ['', '하루', '이틀', '사흘', '나흘', '닷새'];
/** 띠 날과 다른 날의 꼬리표 — 지수 선의 거래일로 셈(없으면 달력 날) · 같은 날이면 '' */
function agoTag(d, band, rows) {
  if (!isDay(d) || !isDay(band)) return '';
  const a = String(d).slice(0, 10), b = String(band).slice(0, 10); if (a === b) return '';
  const ds = Array.isArray(rows) ? rows.map(r => r?.[0]) : [], ia = ds.indexOf(a), ib = ds.indexOf(b);
  const n = ia >= 0 && ib >= 0 ? ib - ia : Math.round((Date.parse(b) - Date.parse(a)) / 864e5);
  return n < 0 ? '더 새 값' : !n ? '' : n < AGO.length ? AGO[n] + ' 지난 값' : n + '일 지난 값';
}
const eokH = v => { const a = Math.abs(Math.round(v)), j = Math.floor(a / 10000), r = a % 10000; return (j ? j.toLocaleString('ko-KR') + '조' + (r ? ' ' : '') : '') + (r || !j ? r.toLocaleString('ko-KR') + '억' : '') + ' 원'; };
/** 한 줄 띠 — 날짜(한 번) · 코스피 · 코스닥 하루 % · 큰 날 금빛 「!」(home-v3 문턱 그대로) · 못 받은 값이면 금빛 「?」 */
function homeBand(H, short = false) { // short = 흰 첫 화면 한 줄(날짜 · 장 중만 · 사이 점 없음 — 글자 수 잣대)
  const SB = sumOk()?.band, fromSum = (x, k) => (x && Number.isFinite(SB?.[k]?.day) ? {...x, day: SB[k].day, date: SB[k].date ?? x.date} : x); // 요약이 새것이면 띠 숫자는 요약에서(같은 home.json 으로 만든 값)
  const K = fromSum(H?.idx?.KOSPI, 'KOSPI'), Q = fromSum(H?.idx?.KOSDAQ, 'KOSDAQ'), X0 = K ?? Q, a = h('a', {class: 'hm-band', href: '#/today'}), chev = h('i', {class: 'hm-chev', 'aria-hidden': 'true', text: '›'});
  if (!X0 || !isDay(X0.date)) { a.append(h('span', {class: 'hm-row'}, h('span', {class: 'hm-bd', text: '? 오늘 시장 값을 못 받았어요'}), chev)); return {el: a, day: null}; }
  const w = whenOf(H, 'idx', X0.live), d = String(X0.date).slice(0, 10);
  const when = short ? (w.now ? `${mdN(d)} ${isTime(w.t) ? w.t.slice(11, 16) : '장 중'}` : mdN(d)) : w.now ? `${mdN(d)} ${ampm(w.t)} 장 중` : w.intra && isTime(w.t) ? `${mdN(w.t.slice(0, 10))} ${ampm(w.t)}까지` : `${mdN(d)} 마감`; // 흰 첫 화면 장 중 = 받은 시각 숫자(글자 수 잣대 밖) — 사장님 2026-10-20 09:45 「응」 첫 화면 글 두 자 줄이기(장 중 두 자 때문에 107 > 105)
  const ixs = [[K, '코스피'], [Q, '코스닥']].filter(([x]) => x).flatMap(([x, nm], i) => [i ? (short ? ' ' : ' · ') : null, h('span', {class: 'hm-ix'}, h('span', {text: nm}), ' ', h('b', {class: 'num ' + cls(x.day), text: p2(x.day)}))]);
  a.append(h('span', {class: 'hm-row'}, w.stale ? [h('b', {class: 'hm-q', 'aria-hidden': 'true', text: '?'}), ' '] : null, h('span', {class: 'hm-bd', text: when}), chev), h('span', {class: 'hm-ixs'}, ...ixs)); // 날짜 줄 · 숫자 줄(늘 같은 두 줄 · 글 흐름 — 읽어 주기도 「코스피 −3.28% · 코스닥 −4.36%」)
  if (idxOk(K) || idxOk(Q)) { const al = idxAlerts(H); // 큰 날 금빛 「!」 = 띠 안(명령문 [6] 1)
    if (short && al.length) a.append(h('p', {class: 'm4-al', text: '! 크게 움직인 날'})); // 흰 첫 화면 = 짧은 꼴(글자 수 잣대 · 자세한 글은 누르면 #/today)
    else a.append(...al); }
  return {el: a, day: d};
}
/** 오늘 시장 세 줄 — 묶음마다 큰 숫자 하나(마지막 날 하루 값) + 까닭 한 줄(자료로만) · 띠 숫자(코스피 · 코스닥 하루 %)는 되풀이하지 않음 */
function homeSum(H, band) {
  const rows = (H?.idx?.KOSPI ?? H?.idx?.KOSDAQ)?.rows, out = [];
  const item = (k, label, big, bc, why, d) => { const tg = agoTag(d, band, rows);
    return h('li', {class: 'hm-it', 'data-k': k}, h('span', {class: 'hm-lb'}, ...label.map(t => h('span', {text: t})), tg ? h('small', {class: 'hm-tag', text: tg}) : null), h('b', {class: 'hm-big num ' + bc, text: big}), h('span', {class: 'hm-why', text: why})); };
  // ① 회사 수 — 요약 파일(새것일 때만 · sumOk)의 모든 회사 마지막 날 하루: 큰 숫자 = 오른 · 내린 회사 수 · 까닭 = 작은 회사 수와 큰 회사(회사 크기 위 100곳) 평균이 어느 쪽인가
  //   요약이 없거나 옛것이면 home.json 네이버 업종 회사 수 · 까닭 = 큰 회사 기준 코스피가 같은 쪽으로 갔나
  const Y = sumOk()?.day, S = H?.sectors, B = S?.breadth, k = H?.idx?.KOSPI?.day;
  if (Y && Y.n > 0 && Y.small?.n > 0 && Number.isFinite(Y.big?.eq)) {
    const dn = Y.dn > Y.up, sDn = Y.small.dn > Y.small.up, n = num(sDn ? Y.small.dn : Y.small.up), bk = Math.abs(Y.big.eq) < 0.05 ? 0 : Math.sign(Y.big.eq), sv0 = sDn ? '내렸고' : '올랐고';
    const why = bk === 0 ? `작은 회사 ${n}곳은 ${sv0}, 큰 회사는 거의 그대로였어요` : (bk < 0) !== sDn ? `작은 회사 ${n}곳은 ${sv0}, 큰 회사는 ${bk < 0 ? '내렸어요' : '올랐어요'}` : `작은 회사 ${n}곳이 ${sv0}, 큰 회사도 ${bk < 0 ? '내렸어요' : '올랐어요'}`;
    out.push(item('br', [dn ? '내린 회사' : '오른 회사'], num(dn ? Y.dn : Y.up) + '곳', dn ? 'dn' : 'up', why, Y.date));
  } else if (B && B.up + B.down + B.flat > 0) {
    const dn = B.down > B.up, kk = Number.isFinite(k) ? (Math.abs(k) < 0.005 ? 0 : Math.sign(k)) : null;
    const why = kk == null ? '? 코스피 값이 없어 큰 회사와 견주지 못했어요' : kk === 0 ? '큰 회사 기준 코스피는 거의 그대로였어요' : (kk < 0) === dn ? `큰 회사 기준 코스피도 함께 ${dn ? '내렸어요' : '올랐어요'}` : `${dn ? '내린' : '오른'} 회사가 많았지만, 큰 회사 기준 코스피는 ${kk < 0 ? '내렸어요' : '올랐어요'}`;
    out.push(item('br', [dn ? '내린 회사' : '오른 회사'], num(dn ? B.down : B.up) + '곳', dn ? 'dn' : 'up', why, S.date));
  } else out.push(item('br', ['오른 회사'], '?', 'q', '? 이번에 오른 곳 · 내린 곳 수를 못 받았어요', null));
  // ② 사고팔기 — 가장 크게 움직인 쪽의 돈 · 까닭 = 누가 판 것을 누가 샀나
  const F = H?.flows, fm = F?.KOSPI ? 'KOSPI' : F?.KOSDAQ ? 'KOSDAQ' : null, x0 = fm ? F[fm] : null;
  const who = x0 ? [['personal', '개인'], ['foreign', '외국인'], ['institutional', '기관']].map(([q, nm]) => [nm, x0[q]]).filter(x => Number.isFinite(x[1])) : [];
  if (who.length) {
    const by = f => [...who].sort(f)[0], big = by((p, q) => Math.abs(q[1]) - Math.abs(p[1])), sell = by((p, q) => p[1] - q[1]), buy = by((p, q) => q[1] - p[1]);
    const why = sell[1] < 0 && buy[1] > 0 ? `${jo(sell[0], '이', '가')} 판 것을 ${jo(buy[0], '이', '가')} 샀어요` : `셋 모두 더 ${buy[1] > 0 ? '샀어요' : '팔았어요'}`;
    out.push(item('fl', [fm === 'KOSPI' ? '코스피' : '코스닥', `${jo(big[0], '이', '가')} 더 ${big[1] < 0 ? '판 돈' : '산 돈'}`], eokH(big[1]), '', why, x0.date));
  } else out.push(item('fl', ['사고팔기'], '?', 'q', '? 이번에 사고판 돈을 못 받았어요', null));
  // ③ 미국 — S&P 500 하루 · 까닭 = 세 지수가 같은 쪽인가
  const U = H?.us, by3 = Object.fromEntries((Array.isArray(U?.rows) ? U.rows : []).filter(r => r?.key && Number.isFinite(r.chg)).map(r => [r.key, r])), three = ['INX', 'IXIC', 'DJI'].map(q => by3[q]).filter(Boolean);
  if (three.length) {
    const up = three.filter(r => r.chg > 0).length, why = three.length < 3 ? `${three.length}개 지수 가운데 ${up}개가 올랐어요` : up === 3 ? '세 지수 모두 올랐어요' : up === 0 ? '세 지수 모두 내렸어요' : `세 지수 가운데 ${up}개가 올랐어요`;
    out.push(item('us', ['미국', three[0].name], p2(three[0].chg), cls(three[0].chg), why, U.date));
  } else out.push(item('us', ['미국'], '?', 'q', '? 이번에 미국 값을 못 받았어요', null));
  return h('section', {class: 'hm-mkt', 'aria-label': '오늘 시장'}, h('h2', {class: 'sec', text: '오늘 시장'}), h('ul', {class: 'hm-sum'}, ...out), h('a', {class: 'more', href: '#/today', text: '오늘 시장 자세히 ›'}));
}
/** 「더 보기」를 처음 열 때 — 1주 오른 업종 · 큰 업종(한 달 가장 센 곳 · 약한 곳) 한 줄 목록 · 편지 여는 밤 · 봉인 줄 · 약속
    요약 파일로 그림(mkt · cond 를 안 받음 [9] 7) · 요약이 없거나 옛것이면 core 하나만 받음 · 급등 · 지수 · 대장주 · 고른 곳은 그 칩에서 */
async function homeRest() {
  const S = sumOk(), fromSum = !!(S?.rise?.list && S.groups), core = fromSum ? null : await need('core'), out = [];
  let rise = [], gs = [], T = null;
  if (fromSum) { rise = S.rise.list; gs = [S.groups.top, S.groups.low].filter(Boolean); T = S.time; }
  else if (core) {
    rise = (core.rise?.list || []).slice(0, 4);
    const x = [...(core.groups || [])].filter(o => Number.isFinite(o.chg)).sort((p, q) => q.chg - p.chg); gs = x.length > 1 ? [x[0], x[x.length - 1]] : x;
    T = core.time?.opens?.[0]?.date ? {id: core.time.id, open: core.time.opens[0].date} : null;
  } else out.push(...noData());
  if (rise.length) out.push(h('h2', {class: 'sec', text: '닷새 동안 오른 업종'}), crows(rise, r => ({href: '#/ch/i/' + enc(r.name), name: r.name, x: r.chg, v: r.v}))); // 「1주」 → 「닷새」(총정리 C13 — 「전부 보기」를 펼친 뒤에만 보임 · 첫 화면 글자 셈 밖)
  if (gs.length) out.push(h('h2', {class: 'sec', text: '큰 업종 · 한 달'}), crows(gs, g => ({href: '#/ch/g/' + enc(g.id), name: g.name, x: g.chg, v: g.v})));
  out.push(premCard());
  if (T?.open) out.push(h('a', {class: 'm4-mr', href: oldOr('time', '#/time')}, h('span', {class: 'l', text: `봉인 ${T.id}호 — 3 · 5 · 10년 뒤 다시 엶`}), h('span', {class: 'k'}, '3년 뒤까지 ', h('b', {class: 'num', text: ddayText(T.open)})), h('i', {class: 'm4-chev', 'aria-hidden': 'true', text: '›'})));
  out.push(h('section', {class: 'm4-seal-box', 'aria-label': '돌이 약속'}, h('span', {class: 'm4-seal', 'aria-hidden': 'true'}, h('i')), h('p', {class: 'm4-pr'}, h('span', {text: '돌이는 들은 것만 따라 말해요.'}), h('span', {text: '그래서 지난 기록만 보여요.'})), h('p', {class: 'm4-cap', text: fourADay(D.sum) ? '숫자는 네이버 증권에서 하루 4번 새로 받아요.' : '숫자는 네이버 증권에서 업데이트 때마다 새로 받아요.'}))); // 「하루 4번」은 지난 7일 기록과 맞을 때만([5] 4 · 일꾼 KC)
  return out.filter(Boolean);
}
/* 첫 화면 본질 세 줄(사장님 2026-10-18(싱가포르) 16:39 [5] 1 ~ 5 · 8 · 일꾼 KC) — 이야기 입구 바로 위 칸 하나(#view > section.ess) · 글 = essence.js 세 줄 그대로
   숫자 둘(회사 수 · 마지막으로 받은 때)은 요약 파일(sumOk — 새것일 때만)에서 · 없으면 「?」 · 받은 때가 오래되면 앞에 「? 」 · 「?」가 든 줄은 금빛
   처음 온 기기 = 펼침(세 줄) · 다시 온 기기 = 접힘(첫 줄 한 줄 · 누르면 세 줄) — 기억 atlas:essence-seen(저장소가 막히면 늘 펼침) · 쪽을 연 동안은 처음 정한 대로(누르면 따라감)
   VIDEO.ready 일 때만 칸 밑에 「VIDEO.title + 보기 ›」(소개 쪽 영상 · 이름 · 제목은 brand.js) · 이 칸은 이야기 입구 밑 세 덩이(규칙 79)와 따로 셈([5] 8) */
const K_ESS = 'atlas:essence-seen';
let essOpen = null;
function essenceBox(video = true) {
  if (essOpen == null) { essOpen = store.get(K_ESS, false) !== true; store.set(K_ESS, true); }
  const [l1, l2, l3] = essenceLines(essenceData({summary: sumOk(), now: Date.now()})), cl = t => (t.includes('?') ? 'ess-l q' : 'ess-l');
  const d = h('details', {class: 'ess-d', open: essOpen}, h('summary', {class: 'ess-s'}, h('span', {class: 'ess-t', 'data-ess': '1', text: l1})),
    h('p', {class: cl(l2), 'data-ess': '2', text: l2}), h('p', {class: cl(l3), 'data-ess': '3', text: l3}));
  d.addEventListener('toggle', () => { essOpen = d.open; });
  return h('section', {class: 'ess', 'aria-label': NAME + ' 세 줄'}, d, VIDEO.ready && video ? h('a', {class: 'ess-v', href: '/hello.html#hp-vid', text: VIDEO.title + ' 보기 ›'}) : null);
}

/* ── 흰 첫 화면(사장님 2026-10-19 02:03 「구글과 잡스 판」 · 고른 시안 w3-b · 잣대 docs/design/white-2026-10-19/brief-build.md · 검사 check_white.mjs) ──
   위에서 아래: 본질 카드(본질 세 줄 + 이 기기의 멈춤 · 약속 수) → 한 달 된 기록 금빛 한 줄 → 앵무새 물음 → 「친구야, 왜 사?」 찾기 칸 → 오늘 장 한 줄
   → 바로 가기 넷 → 「전부 보기」(한 줄에 하나 · 오르는 것은 여기서만) → 시황 사실(오른 곳 · 내린 곳 · 「왜 그럴까?」) → 안전 한 줄
   받는 것은 home.json · 요약 파일만(회사 목록은 찾기 칸을 누르거나 칠 때 · 매매일지 모듈은 한 달 된 기록이 있을 때만) · html.white 는 route 가 첫 화면에서만 붙임 */
const K_WHY = 'atlas:godori-why'; // 매매일지 기록(p-why 와 같은 열쇠 · 읽기만)
/** 이 기기의 멈춤 · 약속 수 — 멈춤 = 열한 답을 다 고른 기록 수 · 약속 = 「그날 정한 대로 했어?」에 「했어」 수 · 기억 못 하는 기계면 null(「?」 · 지어 채우지 않음) */
function myCounts() {
  let raw;
  try { const t = '__kk_t'; localStorage.setItem(t, '1'); localStorage.removeItem(t); raw = localStorage.getItem(K_WHY); } catch { return null; }
  let list = []; try { const x = JSON.parse(raw || '[]'); if (Array.isArray(x)) list = x; } catch { /* 깨진 기록 — 그리기에서만 건너뜀 */ }
  const full = list.filter(r => r && typeof r === 'object' && Array.isArray(r.answers) && r.answers.length === 11 && r.answers.every(k => Number.isInteger(k) && k >= 0 && k <= 2));
  return {stop: full.length, kept: full.filter(r => r.kept?.a === 'yes').length, list: full};
}
/** 한 달 된 기록 줄 — 달력으로 28일 지난 답 안 한 기록이 있을 때만 매매일지 모듈(p-why monthDue — 장 스무 번 셈 그대로)을 받아 봄 · 늦으면(0.8초) 달력 셈으로 그리고 뒤에 고침 */
async function monthLine(C) {
  const cand = (C?.list ?? []).some(r => !r.kept && Number.isFinite(Date.parse(r.at)) && (Date.now() - Date.parse(r.at)) / 864e5 >= 28);
  if (!cand) return null;
  const el = h('a', {class: 'w-month', href: '#/why'}, h('span', {text: '그날 정한 대로 했어?'}), h('i', {'aria-hidden': 'true', text: '›'}));
  const due = mod('why').then(W => W.monthDue()).catch(() => true); // 모듈을 못 받으면 달력 셈대로 둠
  const r = await Promise.race([due, new Promise(f => setTimeout(() => f('late'), 800))]);
  if (r === 'late') { due.then(x => { if (!x) el.remove(); }); return el; }
  return r ? el : null;
}
/** 본질 카드 — essenceBox(세 줄 그대로 · vHomeAll 이 그려 넘김 — 본질 문 ②가 그 부름을 봄) + 큰 멈춤 · 약속 수 */
function essCard(box, C) {
  box.classList.add('w-ess'); box.setAttribute('data-w', 'ess');
  const n = (v, t) => h('p', {class: 'w-n', 'data-num': ''}, h('b', {class: 'num', text: v == null ? '?' : num(v)}), h('span', {text: t}));
  box.querySelector('.ess-d')?.after(h('div', {class: 'w-cnt'}, n(C?.stop, '번 멈춤'), n(C?.kept, '번 약속'))); // 접힌 때도 보이게 세 줄 밖(카드 맨 밑)
  return box;
}
/* 찾기 칸 — 매매일지 종목 고르기와 같은 셈(NX.findMatch · 첫 글자 ㅅㅅㅈㅈ · 번호) · 회사 주식만 열한 질문으로(#/why/<번호>) · 그 밖은 까닭 한 줄
   회사 목록(core · mkt · names)은 칸을 누르거나 칠 때 받음 · 친 말은 이 쪽을 연 동안 기억(돌아와도 줄이 그대로 — 그 줄에 카톡 단추) */
let findQ = '';
const findWarm = () => { Promise.all([need('core'), need('mkt')]).then(() => findReady()).catch(() => {}); };
function findBox() {
  const inp = h('input', {type: 'search', class: 'w-in', value: findQ, placeholder: '친구야, 왜 사? 회사 이름', 'aria-label': '친구야, 왜 사? 회사 이름', autocomplete: 'off', enterkeyhint: 'go'});
  const hits = h('div', {class: 'w-hits', role: 'list', hidden: true});
  const go = h('button', {class: 'w-go', type: 'submit', 'aria-label': '열한 질문 시작', text: '시작'}); // 돌 판 — 흰 「시작」 하나(시안 platform3/home)
  const form = h('form', {class: 'w-find', 'data-w': 'find', role: 'search'}, inp, go, hits);
  let seq = 0, top = null;
  const run = async () => {
    const q = inp.value.trim(), my = ++seq; findQ = inp.value;
    if (!q) { hits.replaceChildren(); hits.hidden = true; top = null; return; }
    await Promise.all([need('core'), need('mkt')]); if (my !== seq) return;
    const X = ix(); if (!X) { hits.replaceChildren(...noData('회사 목록')); hits.hidden = false; return; }
    const all = findMatch(q).filter(x => x.k === 'c' || x.k === 'x'), rows = all.slice(0, 5);
    top = rows.find(x => x.k === 'c') ?? null;
    hits.replaceChildren(...(rows.length ? rows.map(x => {
      if (x.k !== 'c') return h('div', {class: 'w-xo', role: 'listitem'}, h('span', {class: 'nm', 'data-proper': '', text: x.n}), h('small', {text: x.w || '회사 주식만 매매일지에 적어요.'}));
      const o = X.co[x.c], a = h('a', {href: '#/why/' + x.c, 'data-path': 'q1'}, h('span', {class: 'nm', 'data-proper': '', text: o.n}), h('small', {text: (o.i || '?') + ' · ' + x.c}));
      const w = kkWrap(a, {code: x.c, name: o.n, kind: 'share'}, 'find.co', 'kkr kkh'); w.setAttribute('role', 'listitem'); return w;
    }) : [h('p', {class: 'note', text: '「' + q + '」 — 찾는 회사가 없어요. 첫 글자(ㅅㅅㅈㅈ)나 번호로도 찾아보세요.'})]));
    hits.hidden = false;
    if (!NAMES) findReady().then(() => { if (my === seq && inp.isConnected) run(); }); // 펀드 · 우선주까지 목록이 오면 다시
  };
  inp.addEventListener('focus', findWarm, {once: true});
  inp.addEventListener('input', run);
  inp.addEventListener('keydown', e => { if (e.key === 'Escape') { inp.value = ''; run(); } });
  form.addEventListener('submit', async e => {
    e.preventDefault(); if (!inp.value.trim()) { inp.focus(); return; } await run(); if (top) { location.hash = '#/why/' + top.c; return; }
    // 찾은 줄이 펀드 · 우선주뿐인데 「시작」 — 말없이 그 자리라 고장처럼 보이던 것(총정리 B1) → 칸 밑 한 줄(줄 글 · 차례는 그대로 · 다시 치면 사라짐)
    if (hits.querySelector('.w-xo') && !hits.querySelector('.w-st')) hits.prepend(h('p', {class: 'note w-st', role: 'status', text: '펀드 · 우선주는 열한 질문 밖이에요. 회사 이름을 골라 주세요.'}));
  });
  if (findQ.trim()) run();
  return form;
}
/** 바로 가기 넷 — 골똘이 칸 · 달력 · 조건 찾기 · 대장주(한 줄 · 그림 + 이름) · 골똘이 칸은 열한 질문을 끝낸 기기만 #/gdr — 그 전에는 매매일지(#/why · 본질 문 ④ 잠금 한 줄) */
const GO4 = open => [[open ? '#/gdr' : '#/why', NAME, [['path', {d: 'M4 5h16v11H11l-5 4v-4H4z'}]]], [oldOr('cal', '#/cal'), '달력', [['rect', {x: 4, y: 5.5, width: 16, height: 14.5, rx: 2}], ['path', {d: 'M4 10h16M8.5 3v4M15.5 3v4'}]]],
  [oldOr('cond', '#/cond'), '조건', [['path', {d: 'M4 5h16l-6.5 7.5V19l-3-1.5v-5z'}]]], ['#/f/lead', '대장주', [['path', {d: 'M5 20v-8M12 20V5M19 20v-6'}]]]];
function go4(open) {
  return h('nav', {class: 'w-go4', 'data-w': 'gdr', 'aria-label': '바로 가기'}, ...GO4(open).map(([href, t, d]) => { const s = sv('svg', {class: 'ic', viewBox: '0 0 24 24', 'aria-hidden': 'true'}); for (const [k, a] of d) s.append(sv(k, a)); return h('a', {href}, s, h('span', {text: t})); }));
}
/** 「전부 보기」 — 한 줄에 하나(네모 칸 없음) · 오르는 것(오르는 업종 · 급등)은 여기서만 · 처음 펼 때 오늘 시장 세 줄 · homeRest(요약 파일로) */
const ALL_ROWS = () => [['#/f/rise', '오르는 업종'], [oldOr('surge', '#/surge'), '급등'], ['#/f/group', '큰 업종'], ['#/f/ind', '업종'], ['#/f/us', '미국'], ['#/f/pick', '고른 곳'], [oldOr('talk', '#/talk'), '오늘의 이야기'], ['#/game', '가짜 돈 연습']]; // 가짜 돈 연습(2026-10-19 15:47 변호사 확인 뒤 공개)
function allBox(H, band) {
  const body = h('div', {class: 'w-allin'}), sum = h('summary', {'data-w': 'all', text: '전부 보기'}), d = h('details', {class: 'w-all'}, sum, body);
  let rowsIn = false, restIn = false;
  /* 두 번에 나눠 채움(2026-10-21 전체 검사 thumb 1/11 ③ 밀림 0.140) — 바로 가기 넷 옆 제자리(맨 아래)에서 펼치면 그 아래 진화 줄 · 맨 아래 줄이 화면 안에 있음
     ① 누름 그 자리: 가벼운 줄 목록만 → 펼친 첫 그림에 줄이 있어 그 아래가 그때 함께 화면 밖으로 밀림(누른 뒤 0.5초 안 = 밀림 셈 밖)
     ② 'toggle'(누름 뒤 따로 · 그린 다음): 무거운 나머지(요약 · 업종 · 봉인 · 약속) → 이미 화면 밖 아래에 붙음 · 누른 뒤 그려짐 0.2초도 지킴(무거운 일을 누름에 얹지 않음)
     누름 없이 열릴 때(다른 코드)는 'toggle' 이 둘 다 채움 */
  const rows = () => {
    if (rowsIn) return; rowsIn = true;
    body.prepend(h('ul', {class: 'w-rows'}, ...ALL_ROWS().map(([href, t]) => h('li', {}, h('a', {href}, h('span', {text: t}), h('i', {'aria-hidden': 'true', text: '›'})))),
      VIDEO.ready ? h('li', {}, h('a', {href: '/hello.html#hp-vid'}, h('span', {text: VIDEO.title + ' 보기'}), h('i', {'aria-hidden': 'true', text: '›'}))) : null));
  };
  const rest = () => {
    rows(); if (restIn) return; restIn = true;
    body.append(homeSum(H, band.day));
    homeRest().then(xs => body.append(...xs), e => { console.error(e); body.append(h('p', {class: 'empty', text: '? 나머지 칸을 그리지 못했어요.'})); });
  };
  sum.addEventListener('click', () => { if (!d.open) rows(); }); // 누름 처리는 열림보다 먼저 — 아직 닫혀 있으면 이제 열릴 차례
  d.addEventListener('toggle', () => { if (d.open) rest(); });
  return d;
}
/** 시황 사실 — 모든 회사 마지막 날 오른 곳 · 내린 곳(요약 파일 · 옛것이면 home.json 네이버 업종 회사 수) · 사실마다 「왜 그럴까?」 → 열한 걸음 이어 묻기(지난 사실만 · 앞날 없음)
    사장님 2026-10-22(서울) 08:53 「왜 그럴까를 뻔한 이야기로 하고 있어 … 원숭이 엉덩이는 빨개 빨가면 사과 … 11단계는 논리적으로 사방팔방으로 이야기 해야지 그 이야기를 움직이는 도식화로 해야 하고」
    (명령문 docs/design/total-2026-10-22/order-0853.txt) — 옛 물음 셋(누가 팔았을까? · 다른 날에도 그랬을까? · 내 이유와 상관있을까?)은 열한 걸음의 3 · 4 · 9 · 11 걸음이 맡음
    그림 · 걸음 글은 why-chain.js · why-steps.js(처음 누를 때 받음 — 첫 그림 · 첫 화면 글자 셈에 안 듦) · 펼칠 때마다 처음부터 움직임(el.play) */
function newsBox(H) {
  const Y = sumOk()?.day, B = H?.sectors?.breadth;
  const v = Y && Y.n > 0 ? {up: Y.up, dn: Y.dn, d: Y.date} : B && B.up + B.down + B.flat > 0 ? {up: B.up, dn: B.down, d: H.sectors.date} : null;
  const box = h('section', {class: 'w-news', 'data-w': 'news', 'aria-label': '시황 사실'});
  if (!v) { box.append(h('p', {class: 'note', 'data-num': '', text: '? 오른 곳 · 내린 곳 수를 못 받았어요'})); return box; }
  box.setAttribute('aria-label', '시황 사실 · ' + md(v.d)); // 날짜는 오늘 장 줄 · 읽어 주기에 — 보이는 글은 글자 수 잣대 안
  /* 돌 판(2026-10-19 10:31 · 시안 platform3/home) — 사실 두 줄(오른 곳 · 내린 곳)마다 「왜 그럴까?」 · 사이에 가는 막대 한 줄(길이 = 곳 수) */
  const fact = (c, t, n) => {
    const wrap = h('div', {class: 'w-chain', hidden: true}); // 열한 걸음 칸(옛 ul.w-qs 자리 · 누르기 전에는 비어 있음)
    const b = h('button', {type: 'button', class: 'w-why', 'aria-expanded': 'false', text: '왜 그럴까?'});
    let el = null, busy = false;
    b.addEventListener('click', async () => {
      if (!wrap.hidden) { wrap.hidden = true; b.setAttribute('aria-expanded', 'false'); return; }
      if (!el) {
        if (busy) return; busy = true;
        try {
          const [{whyChain}, {homeSteps}] = await Promise.all([import('/next/why-chain.js'), import('/next/why-steps.js')]), C = myCounts();
          el = whyChain(homeSteps({side: c === 'dn' ? 'dn' : 'up', n, date: v.d, H, TH: D.themeHome, mine: C ? {count: C.stop} : null}), {});
          wrap.replaceChildren(el);
        } catch (e) { console.error(e); wrap.replaceChildren(h('p', {class: 'note', text: '? 이어 묻기를 열지 못했어요. 잠시 뒤 다시 눌러 주세요.'})); }
        busy = false;
      }
      wrap.hidden = false; b.setAttribute('aria-expanded', 'true'); el?.play?.();
    });
    return h('div', {class: 'w-facts', 'data-fact': ''}, h('p', {class: 'w-fl'}, h('span', {class: 'w-f', 'data-num': ''}, h('span', {class: 'w-lb', text: t}), h('b', {class: 'num ' + c, text: Number.isFinite(n) ? num(n) : '?'}))), b, wrap);
  };
  const bar = h('div', {class: 's-split', 'aria-hidden': 'true'}), gu = h('i', {class: 'gu'}), gd = h('i', {class: 'gd'});
  if (Number.isFinite(v.up) && Number.isFinite(v.dn) && v.up + v.dn > 0) { gu.style.flexGrow = String(v.up); gd.style.flexGrow = String(v.dn); bar.append(gu, gd); }
  box.append(fact('up', '오른 곳', v.up), bar, fact('dn', '내린 곳', v.dn));
  return box;
}
/** 노란 말풍선(share-btn.js 와 같은 모양 · 색은 app.css .kk-ic .kk-b) */
function kkIcon() { const s = sv('svg', {class: 'kk-ic', viewBox: '0 0 24 24', width: 28, height: 28, 'aria-hidden': 'true', focusable: 'false'}); s.append(sv('path', {class: 'kk-b', d: 'M12 3C6.75 3 2.5 6.36 2.5 10.5c0 2.65 1.74 4.98 4.37 6.31l-1.1 4.02c-.1.36.31.65.62.44l4.78-3.17c.27.02.55.03.83.03 5.25 0 9.5-3.36 9.5-7.5S17.25 3 12 3z'})); return s; }
/** 진화 한 줄 — 진화 자료(/next/data/jinhwa.json)를 늦게 받아 채움(첫 그림을 막지 않음) · 못 받으면 「진화 보기 ›」 그대로 */
function evoLine() {
  const b = h('b', {text: '진화'}), t = h('span', {class: 'when', text: '보기'});
  const a = h('a', {class: 's-evo', href: '#/jinhwa'}, b, t, h('i', {'aria-hidden': 'true', text: '›'}));
  fetch('/next/data/jinhwa.json', {credentials: 'omit'}).then(r => (r.ok ? r.json() : null)).then(J => { if (Number.isInteger(J?.n) && J.n > 0) { b.textContent = '진화 ' + num(J.n) + '번째'; const w = (J.applied ?? []).find(x => x?.score && !x.score.at); t.textContent = w ? '채점 전' : '보기'; } }).catch(() => {});
  return a;
}
/** 다시 나오는 엄지 칸(2026-10-21 02:29 「어」) — 아래로 24px 넘게 읽으면 숨고(s-away) · 위로 8px 밀면 다시 나옴 · 맨 위(120px 안) · 맨 아래(320px 안) ·
 *  글 칸에 손이 가 있거나 찾은 줄이 떠 있으면 늘 보임 · 화면이 바뀌어 칸이 빠지면 듣기를 그만둠 · 움직임 줄이기면 미끄러짐 없이(stone.css) */
function quickReturn(el) {
  let last = scrollY, acc = 0, was = false; // was = 한 번이라도 화면에 붙었음(붙기 전 · 여는 동안의 움직임으로 듣기를 그만두지 않게)
  const near = () => scrollY < 120 || innerHeight + scrollY > document.documentElement.scrollHeight - 320; // 맨 아래 320 안 = 칸이 제자리(바로 가기 위)에 와 있음 — 숨기면 바로 가기를 덮음
  const busy = () => el.contains(document.activeElement) || !!el.querySelector('.w-hits:not([hidden])');
  const gone = () => { if (el.isConnected) { was = true; return false; } return was; };
  /* 찾은 줄(2026-10-21 04:3x 진짜 사이트 「첫 질문까지 누름 2번 안」) — 칸이 붙은 채로 위로 펼침(stone.css) · 높이는 칸 위 남은 자리(머리줄 아래 · 세 줄 168 ~ 420) ·
     칸 밖을 누르면 닫힘(붙은 칸 위에 펼친 줄이 읽는 글을 계속 가리지 않게 · 찾은 줄 · 시작 · 보내기 단추는 칸 안이라 그대로) */
  const hits = el.querySelector('.w-hits');
  const fit = () => {
    if (!hits || hits.hidden || !el.isConnected) return;
    const head = document.querySelector('header.top')?.getBoundingClientRect().bottom ?? 0;
    hits.style.maxHeight = Math.max(168, Math.min(420, Math.floor(el.getBoundingClientRect().top - head - 12))) + 'px';
  };
  if (hits) new MutationObserver(fit).observe(hits, {attributes: true, attributeFilter: ['hidden'], childList: true});
  const out = e => { if (gone()) return removeEventListener('pointerdown', out, true); if (hits && !hits.hidden && !el.contains(e.target)) hits.hidden = true; };
  addEventListener('pointerdown', out, true);
  const on = () => {
    if (gone()) return removeEventListener('scroll', on);
    if (!el.isConnected) return;
    const y = scrollY, d = y - last; last = y;
    fit();
    if (near() || busy()) { el.classList.remove('s-away'); acc = 0; return; }
    acc = (d > 0) === (acc > 0) ? acc + d : d;
    if (acc > 24) el.classList.add('s-away'); else if (acc < -8) el.classList.remove('s-away');
  };
  addEventListener('scroll', on, {passive: true});
  el.addEventListener('focusin', e => {
    el.classList.remove('s-away');
    if (hits?.hidden && e.target?.matches?.('.w-in') && e.target.value.trim()) e.target.dispatchEvent(new Event('input')); // 밖을 눌러 닫은 뒤 다시 칸에 손을 대면 찾은 줄을 다시
  });
  return el;
}
async function vHomeAll() {
  /* 돌 판 첫 화면(사장님 2026-10-19 10:21 「1번으로 하자 그래서 전체 디자인을 해봐 … 돌이야」 · 10:31 「이제 실제로 만들어 이기준으로」 · 시안 docs/design/kakao-2026-10-19/platform3/home)
     위에서 아래: 큰 제목 「왜 사?」 + 돌 그림 → 돌이 물음 한 줄 → 읽는 곳 셋(① 본질 ② 지난 기록 = 오늘 장 + 오른 곳 · 내린 곳 ③ 한 달 뒤 물어볼게요) → 진화 한 줄
     → 엄지 자리(「친구야, 왜 사?」 찾기 칸 + 바로 가기 넷 + 「전부 보기」) → 안전 한 줄 · 표시(data-w · data-ess · data-say · data-fact · data-num · data-path)는 흰 판과 같음 */
  const H = homeSrc(), band = homeBand(H, true), C = myCounts();
  band.el.setAttribute('data-w', 'today'); band.el.setAttribute('data-num', ''); band.el.classList.add('w-today');
  const kk = h('button', {class: 'kk-btn w-kk', type: 'button', 'aria-label': NAME + ' 주소를 카톡으로 친구에게 보내기'}, icon('share')); // 이 곳 주소만(종목 · 숫자 · 답 없음) — 휴대폰 보내기 창(카톡이 그 안에)
  kk.addEventListener('click', () => share(NAME, absUrl('#/')));
  // 테마 시계(사장님 2026-10-19 16:06 「이 본질이 중심이자 시작」 · 16:54 「이제 aaa7377.com에 올려 … 큰 구조는 건들이지 말고」) — 맨 위 = 테마 시계(p-theme.js homeBlock · 견본 flow36 둘째 장) · 그 아래 읽는 곳 셋 · 엄지 자리 · 진화는 그대로
  // 2026-10-21 00:51 「확임 했어 이기준에 스마트하게 만들어」(00:49 시안 「지금 봄이 온 곳」) — 큰 제목 · 돌이 물음을 계절 말로(셈 · 칸 차례는 그대로 · 물음은 다시 온 기기 첫 화면 글자 105자 아래에 맞게 짧게 — check_white ②)
  // 돌 시계 판 ①(사장님 2026-10-26 08:16 「디자인 이렇게 하라고 어 다 다시해」 · 13:50 「다 해」) — 큰 제목 「업종 n곳은 지금」(그림 c1) · 자료를 못 받으면 예전 제목 그대로
  const TH0 = await need('themeHome').catch(() => null), cnt0 = TH0?.count, nInd = cnt0 ? ['S', 'B', 'Q', 'W'].reduce((p, z) => p + (Number.isFinite(cnt0[z]) ? cnt0[z] : 0), 0) : 0;
  const hd = h('div', {class: 's-hd'}, h('h1', {class: 's-h1', text: nInd > 0 ? `업종 ${num(nInd)}곳은 지금` : '지금 봄이 온 곳'})); // 그림의 「10월 13일 기록」 줄은 넣지 않음 — 보이는 날짜는 오늘 장 띠에 한 번([6] 2) · 다시 온 기기 첫 화면 글자 105자 안(check_white ②)
  // 돌 시계는 큰 제목 옆이 아니라 돌이 물음 아래 가운데 크게(사장님 2026-10-25 22:26 「돌시계을 중심으로 디자인 해야해」 · 22:52 「세계 최고로 만들어봐」 · 22:54 「어 진짜 싸이트까지 바꿔」 — 고르신 판 best ①) · 그 아래 네 칸(theme-home.js zoneCells)
  const clock = h('div', {class: 's-clk'}, stoneClock()); // 같은 그림을 index.html 여는 화면이 먼저 받음 · 아래 return 앞에서 풀림을 기다림(clockDecoded)
  if (!nInd) { const t = hd.firstChild, go = () => import('/next/home-title.js').then(m => m.rotateTitle(t)).catch(() => {}); // 자료를 못 받았을 때만 예전 큰 제목 돌리기(2026-10-21 23:55 「어 섹시하게」) — 돌 시계 판 제목은 한 줄 그대로
    const idle = () => (window.requestIdleCallback ? window.requestIdleCallback(go, {timeout: 2500}) : setTimeout(go, 600));
    if (document.readyState === 'complete') idle(); else window.addEventListener('load', idle, {once: true}); }
  const say = h('div', {class: 'w-say'}, h('p', {}, h('span', {class: 's-who', text: NAME}), h('span', {'data-say': '', text: '어느 계절일까?'})), kk);
  const theme = await themeHome().catch(() => h('p', {class: 'empty', text: '? 테마 시계를 그리지 못했어요. 잠시 뒤 다시 열어 주세요.'})); // 자료(need theme)는 vHome 이 home · 요약과 같이 받음
  const ch = (n, ...xs) => h('li', {class: 's-ch'}, h('span', {class: 's-no', 'aria-hidden': 'true', text: String(n)}), ...xs);
  const month = await monthLine(C);
  const ess = essCard(essenceBox(false), C); // 멈춤 · 약속 수(w-cnt)는 ③ 줄로 옮김(한 화면에 들게)
  const story = h('ol', {class: 's-story'},
    ch(1, ess),
    ch(2, h('p', {class: 's-lbl'}, h('span', {class: 't', text: '지난 기록'})), band.el, newsBox(H)),
    ch(3, month ?? h('a', {class: 's-ghost', href: '#/why'}, h('span', {text: '한 달 뒤 물어볼게요'})), h('div', {class: 's-mem'}, ess.querySelector('.w-cnt'), h('span', {class: 's-dev', text: '이 기기에만'}))));
  // 엄지 자리(사장님 2026-10-21 02:11 「친구야  왜? 사 이창 있잖아 너무 불편해 구글과 잡스라면 어떻게 개선할거야」 · 02:29 「어」) —
  //   붙어 있는 것은 「친구야, 왜 사?」 한 줄만(잡스 · 하나만) · 바로 가기 넷 · 전부 보기는 화면 안 제자리(붙지 않음)
  //   아래로 읽을 때는 그 한 줄도 숨고, 조금 위로 밀면 다시 나옴(구글 · 닐슨 노먼 그룹 2021 「다시 나오는 칸」) — quickReturn
  const short = h('div', {class: 's-short'}, go4((C?.stop ?? 0) > 0), allBox(H, band));
  const thumb = quickReturn(h('div', {class: 's-thumb'}, findBox())); // 아래 단추 바로 위에 붙음(stone.css sticky · 찾은 줄이 뜨면 풀림)
  // 돌 시계 판(사장님 2026-10-26 08:16 「디자인 이렇게 하라고 어 다 다시해」 · 어젯밤 22:03 돌 시계 판 ①) — 돌 시계를 네 칸 한가운데(위 싹 · 꽃 / 시계 / 아래 잠잠 · 시듦 · 시계 방향 화살 넷)
  //   그 아래 그림 단추 넷(꽃 될 회사 · 회사 찾기 · 싹 달력 · 고객센터) — 그 밑은 예전 그대로(본질 · 지난 기록 · 찾기 칸 · 바로 가기 · 진화)
  const zn = theme.querySelector?.('.th-zones'); if (zn) { zn.append(clock); zn.after(homeApps()); } // 그림 단추는 고리 바로 아래(테마 시계 칸 안 · 첫 화면 글자는 테마 칸 200자 셈)
  // 기승전결(사장님 2026-10-27 01:50 「돌이가 중요순으로 해서 기승전결이 되게해」 · 본보기 180가지 → 셋 → 보완한 하나) — 본질 세 줄(전 ① 왜 사? ② 지난 기록 · 결 ③ 한 달 뒤)을
  //   승(고른 싹이 꽃이 됐을까? · 싹 자리 모두 보기) 바로 뒤로 — 힘이 붙은 곳 · 싹 달력 · 카톡 · 선물 · 숫자 · 읽는 법 · 인사는 그 뒤(theme-home.js homeBlock 차례) · 칸이 없으면 예전 자리
  const seung = theme.querySelector?.('a.th-more') ?? theme.querySelector?.('a.th-pkhome') ?? null;
  if (seung) seung.after(story);
  const nodes = [hd, say, ...(zn ? [] : [clock]), theme, ...(seung ? [] : [story]), thumb, short, evoLine()];
  await clockDecoded(clock, 300); // 돌 시계 그림이 풀린 뒤 한 번에 그림(길어야 0.3초 — 늦게 툭 나타남 0) // 차례 그대로(찾기 칸 → 바로 가기 넷 → 전부 보기 → 진화 — next_check 첫 화면 차례) // 안전 글은 본질 세 줄(① 둘째 · 셋째 줄)에 있음 — 같은 말을 두 번 쓰지 않음(글자 수 잣대)
  return {title: '오늘 장', nodes};
}

/** 첫 화면 그림 단추 넷(돌 시계 판 · 2026-10-26) — 꽃 될 회사(오늘 고른 회사 수 · 첫 그림 뒤에 채움) · 회사 찾기 · 싹 달력 · 고객센터 */
function homeApps() {
  const badge = h('span', {class: 's-badge', hidden: true});
  // 색은 칸 이름(s-app-bloom …)으로 clock.css 에서 — 글 속 style 은 사이트 보안 규칙(CSP style-src 'self')이 막음(전체 검사 3/11 화면 오류 · 틀림 장부 124)
  const app = (label, href, kind, extra = null) => h('a', {class: 's-app s-app-' + kind, href}, extra, h('span', {class: 's-apb'}, APP_ICON[kind]()), h('span', {class: 's-apl', text: label}));
  const nav = h('nav', {class: 's-apps', 'aria-label': '바로 가기 넷'},
    app('꽃 될 회사', '#/t/picks', 'bloom', badge), app('회사 찾기', '#/find', 'search'), app('싹 달력', '#/t/cal', 'cal'), app('고객센터', '#/help', 'help'));
  setTimeout(() => { fetch('/next/data/theme-bloom.json', {cache: 'no-cache'}).then(r => (r.ok ? r.json() : null)).then(B => {
    const n = Array.isArray(B?.today?.inds) ? B.today.inds.reduce((a, i) => a + (Array.isArray(i?.co) ? i.co.length : 0), 0) : 0;
    if (n > 0) { badge.textContent = num(n); badge.hidden = false; }
  }).catch(() => {}); }, 0);
  return nav;
}

/* ── 화면 ── 하나마다 { title, nodes } 를 돌려줌 · 늦게 끝난 앞 화면은 버림 */
/* 칩(S2c · 2026-10-18 [6] 5 ~ 7 · [7] 5 · [9] 7) — 셋째 칸이 있으면 칩 쪽(#/f/…)이 아니라 그 화면으로 가는 고리(달력 · 조건 찾기) */
const CHIPS = [['all', '전체'], ['rise', '오르는 업종'], ['surge', '급등'], ['lead', '대장주'], ['pick', '고른 곳'], ['group', '큰 업종'], ['ind', '업종'], ['us', '미국'], ['cal', '달력', '#/cal'], ['cond', '조건 찾기', '#/cond']];
const chipPage = id => CHIPS.some(c => c[0] === id && !c[2]);
function chipsBar(on) { const ni = D.core?.industries?.length ?? D.sum?.chips?.ind?.n; return fadeEnd(h('div', {class: 'chips', role: 'tablist', 'aria-label': '고르기'}, CHIPS.map(([id, t, go]) => h('a', {class: 'chip', href: go ? oldOr(id, go) : id === 'all' ? '#/' : '#/f/' + id, 'aria-current': id === on ? 'page' : null, text: id === 'ind' && ni ? t + ' ' + ni : t})))); }
/** 오른쪽 끝 흐림([6] 7 · app.css .chips · .shelf mask) — 끝까지 밀었거나 넘치지 않으면 .end(흐림 걷음 — 마지막 칩이 흐린 채 남지 않게) */
function fadeEnd(el) {
  let n = 0; const f = () => { if (!el.isConnected) { if (n++ < 60) requestAnimationFrame(f); return; } el.classList.toggle('end', el.scrollLeft + el.clientWidth >= el.scrollWidth - 2); };
  el.addEventListener('scroll', f, {passive: true}); requestAnimationFrame(f); return el;
}
function noData(t = '자료') { const c = t.charCodeAt(t.length - 1) - 0xAC00, jo = c >= 0 && c < 11172 && c % 28 ? '을' : '를'; return [h('p', {class: 'empty', text: '? ' + t + jo + ' 받지 못했어요. 잠시 뒤 다시 열어 주세요.'})]; } // 받침이 있으면 「을」(업데이트 기록을 · 따로 본 눈 VEN 「기록를」)
/** 첫 화면 요약(/next/data/home-summary.json · 만듦 scripts/atlas11/next/build/home_summary.mjs) — home.json 의 kst 와 같을 때만 새것 · 아니면 null(옛 길) */
const SUM_SCHEMA = 'godori-home-summary-1';
function sumOk() { const S = D.sum; return S && S.schema === SUM_SCHEMA && D.home && S.src?.home === D.home.kst ? S : null; }
/** 급등 칸 반값 셈([6] 6) — 요약의 회사마다 표(지난 250거래일 안 반값 아래 = 1) · 요약이 옛것이고 모르는 회사가 있으면 null(「?」) */
function surgeHalf(ms) {
  const S = D.sum?.schema === SUM_SCHEMA ? D.sum.chips?.surge : null, f = S?.flags; if (!f || !ms.length) return null;
  const k = ms.filter(m => Object.hasOwn(f, m.c));
  if (D.sum.src?.surge !== D.surge?.kst && k.length < ms.length) return null;
  return {n: ms.length, half: k.reduce((a, m) => a + (f[m.c] ? 1 : 0), 0), known: k.length};
}
const halfLine = x => num(x.n) + '곳 중 ' + num(x.half) + '곳이 지난 1년 안에 반값 아래로 떨어진 적 있어요';
const ROWS = 10;
/** 칩 목록([7] 5) — 맨 앞 하나만 큰 카드 · 그다음 한 줄 목록(이름 · % · 작은 선) 10줄 · 나머지는 「나머지 n곳 보기」를 누르면 펼침 */
function chipList(items, big, row, unit = '곳') {
  if (!items.length) return [];
  const out = [big(items[0])].filter(Boolean), li = items.slice(1).map(row).filter(Boolean).map((r, k) => crowLi(r, k >= ROWS));
  if (li.length) out.push(h('ul', {class: 'clist'}, li));
  const rest = li.length - ROWS;
  if (rest > 0) { const b = h('button', {class: 'more', type: 'button', 'aria-expanded': 'false', text: '나머지 ' + num(rest) + unit + ' 보기'}); b.addEventListener('click', () => { for (const e of li) e.hidden = false; b.remove(); }); out.push(b); }
  return out;
}
/** 카톡 줄(사장님 2026-10-18 16:39 [6] 1 · 6 · 8 · 일꾼 KB2) — 종목 줄 · 카드 = 줄 고리(a)와 카톡 단추(share-btn.js shareButtons 하나)를 형제로 · 단추는 오른쪽 끝
    kk = {code, name, price?, day?, kind: 'share' | 'surge'} · place = 검사(check_kakao.mjs)가 곳마다 세는 이름 · cls = 줄 꼴(.kkr 줄 · .kkr.kkc 카드 · app.css 「카톡 줄」)
    단추를 못 만들면(번호가 틀림 · kk 없음) 줄 그대로 */
function kkWrap(el, kk, place, cls = 'kkr') {
  const b = el && kk ? shareButtons(kk, {kakao: true}) : null;
  return b ? h('div', {class: cls, 'data-kkrow': place}, el, b) : el;
}
/** 한 줄(이름 · % · 작은 선) — r = {href(null 이면 누르지 않는 줄), name, x, pt?, v, kk?(종목이면 카톡 단추 — kkWrap)} · 칩 목록 · 첫 화면 「더 보기」가 함께 씀 */
function crowLi(r, hide = false) {
  return h('li', {hidden: hide}, kkWrap(h(r.href ? 'a' : 'div', {class: 'crow', href: r.href || null}, r.sub ? h('span', {class: 'cn cn2'}, h('b', {text: r.name}), h('small', {text: r.sub})) : h('b', {class: 'cn', text: r.name}), h('span', {class: 'cp ' + cls(r.x), text: r.pt ?? pct(r.x)}), // r.sub = 이름 밑 작은 뜻 글(미국 지수 · 총정리 C6)
    lineSvg(r.v, {w: 96, ht: 36, fill: false, dot: false, sw: 2}) || h('i', {class: 'ln0', 'aria-hidden': 'true'})), r.kk, 'chip.row'));
}
function crows(items, row) { const li = items.map(row).filter(Boolean).map(r => crowLi(r)); return li.length ? h('ul', {class: 'clist'}, li) : null; }

function idxCard(code) {
  const x = D.home?.idx?.[code]; if (!x || !Array.isArray(x.rows) || x.rows.length < 2) return null;
  const other = D.home.idx[code === 'KOSPI' ? 'KOSDAQ' : 'KOSPI'];
  return card('#/w/' + code, thumb(x.rows.map(r => r[1]), '3달', {play: true}), md(x.date) + ' ' + x.name + ' 하루 ' + p2(x.day) + (other ? ' · ' + other.name + ' ' + p2(other.day) : ''),
    '시장 · ' + (x.live ? '장 중' : '장 마감') + ' · 큰 숫자는 3달 동안', '시');
}
const coOf = code => (ix()?.co ?? D.mkt?.companies)?.[code] ?? null; // 칩은 core 없이 mkt 만 받을 수 있음
/* 카드 넷 — bare = 첫 화면 「더 보기」용(S2 · [6] 2 · 3): 날짜 없음 · 그림 큰 숫자를 제목에 되풀이하지 않음 */
/** 큰 카드 그림([6] 8 「큰 숫자는 늘 마지막 날 하루 값이다. 기간 숫자는 작게 둬라.」 · 2026-10-18 검토 VH) — 큰 숫자 = 마지막 날 하루 %(앞에 작은 「하루」) ·
    아래 오른쪽 작은 칸 = 기간 이름 + 기간 %(예 「5일 +110%」) · 선 = 기간 · day 가 없으면 선의 마지막 두 값으로 셈 · 제목에는 숫자를 되풀이하지 않음 */
function dayThumb(vals, per, perX, day = null) {
  const d = Number.isFinite(day) ? day : dayOf(vals);
  return h('div', {class: 'th'}, lineSvg(vals), h('b', {class: 'big ' + cls(d)}, h('small', {class: 'bk', text: '하루'}), ' ', h('span', {text: pct(d)})),
    h('span', {class: 'dur'}, h('span', {text: per}), ' ', h('b', {class: cls(perX), text: pct(perX)})));
}
function coCard(code, badge = '한 달', extra = null, bare = false, day = null) {
  const c = coOf(code); if (!c) return null;
  return kkWrap(card('#/w/' + code, dayThumb(c.l, badge, c20(c), day), c.n, (c.i || '?') + ' 업종' + (extra ? ' · ' + extra : ''), first(c.i)), {code, name: c.n, kind: 'share'}, 'chip.card', 'kkr kkc');
}
function riseCard(r, bare = false) { const core = ix()?.core ?? D.core; return card('#/ch/i/' + enc(r.name), dayThumb(r.v, '닷새', r.chg), r.name, bare ? '닷새 동안 오른 업종' : '업종 채널 · ' + md(core?.rise?.from) + ' → ' + md(core?.rise?.to), first(r.name)); } // 「1주」 → 「닷새」(총정리 C13 — 주식 「한 주」와 헷갈리지 않게 · 테마 시계의 「지난 닷새」와 같은 말)
function groupCard(g, bare = false) { return card('#/ch/g/' + enc(g.id), dayThumb(g.v, '한 달', g.chg), g.name + ' 큰 업종', '회사 ' + num(g.n) + '곳 · 큰 회사 기준 ' + pct(g.cwChg), first(g.short || g.name)); }
/** 급등 카드 — 급등 칩 안에만(첫 화면에 두지 않음 · 「1등」 말 없음 [6] 5) · hf = surgeHalf() 면 숫자 옆에 반값 한 줄([6] 6) · 큰 숫자 = 마지막 날 하루(d1)
    카톡 단추 = kind 'surge'(사장님 2026-10-18 16:39 [6] 8 — 앞 명령문의 「급등 카드 보내기 없음」을 바꿈 · 받는 카드에 반값 한 줄) */
function surgeCard(m, hf = null) {
  const e = card('#/w/' + m.c, dayThumb(m.v, '5일', m.r5, m.d1), m.n, (m.i || '?') + ' · 급등 칸 · ' + md(D.surge?.asOf) + '까지', first(m.i));
  if (hf) e.querySelector('.meta b')?.after(h('span', {class: 'half', text: halfLine(hf)}));
  return kkWrap(e, {code: m.c, name: m.n, kind: 'surge'}, 'chip.card', 'kkr kkc');
}
function leadCard(code, o, bare = false) { const c = coOf(code); if (!c) return null; return kkWrap(card('#/w/' + code, dayThumb(o.l5, '5일', o.r5, dayOf(c.l) ?? dayOf(o.l5)), c.n + ', ' + (o.i || c.i) + ' 대장주', bare ? (o.i || c.i) + ' 대장주 · 업종에서 가장 큰 회사' : '업종에서 가장 큰 회사 · ' + md(D.cond?.d5) + ' → ' + md(D.cond?.asOf), first(o.i || c.i)), {code, name: c.n, kind: 'share'}, 'chip.card', 'kkr kkc'); } // 「1등」 말 없음([6] 5 · [10] 1 흔한 말)
function shelf(fs) {
  const tiles = fs.map((f, i) => f.tile ? h('a', {class: 'st', href: '#/shorts/' + i, 'aria-label': '시황 ' + f.l1}, h('b', {class: f.bc, text: f.tile[0]}), h('small', {text: f.tile[1]})) : null).filter(Boolean).slice(0, 4);
  return tiles.length ? [h('h2', {class: 'sec', text: '시황 · 왜 움직였나'}), h('div', {class: 'shelf'}, tiles)] : [];
}

async function vHome(chip) {
  if (!chipPage(chip)) chip = 'all';
  // 첫 줄 자료([9] 7): 첫 화면 = home.json(7KB) + 요약(home-summary.json · 3KB)만 · 「더 보기」도 요약으로(옛것이면 core 하나) · mkt · cond 는 대장주 · 고른 곳 칩(vChip) · 그 화면을 열 때만 · 요약이 없거나 옛것이어도 첫 화면은 home.json 으로 그림
  if (chip === 'all') { await Promise.all([need('home'), need('sum'), need('themeHome')]); return vHomeAll(); } // 첫 화면 한 화면(2026-10-18 명령문 0015 [6] — 일꾼 S2 · vHomeAll) · 테마 시계 칸 자료 theme-home.json(4KB 남짓 · index.html 이 미리 받음) — 첫 화면은 mkt · cond · theme.json 을 받지 않음([9] 7 · 2026-10-19)
  return vChip(chip);
}
/* 테마 시계 자리(총정리 2026-10-22 C1 ~ C7 · C24 · C25 · A24 — 칩 · 채널 · 관심 · 찾기 맨 위 결 한 줄)
   자료 = 첫 화면이 이미 받는 theme-home.json(5KB · 업종마다 자리 z) · 업종 쪽 자료 theme.json 을 받아 두었으면 날 수(d) · 점(sc)은 거기서(첫 화면 파일엔 앞 셋만 있음)
   못 받으면 null — 줄을 그리지 않음(지어 채우지 않음) · 지난 기록(올릴 때 셈)만 · 차례 · 목록은 그대로 */
const TZ = ['S', 'B', 'W', 'Q']; // 싹 · 꽃 · 시듦 · 잠잠(테마 시계 쪽과 같은 차례)
const thHome = () => { const j = D.themeHome; return j && j.schema === 'dori-theme-1-home' && Array.isArray(j.inds) && j.count && j.order ? j : null; };
const thFull = () => { const j = D.theme; return j && j.schema === 'dori-theme-1' && Array.isArray(j.inds) ? j : null; };
function thInd(n) {
  const b = thFull()?.inds?.find(i => i?.n === n) ?? thHome()?.inds?.find(i => i?.n === n);
  return b && TH_ZONES[b.z] ? {z: b.z, sc: Number.isFinite(b.sc) ? b.sc : null, d: Number.isFinite(b.d) ? b.d : null} : null;
}
/** 싹 먼저 차례(사장님 2026-10-22 09:41 「어그래」 — 업종 · 대장주 목록 · 업종 채널의 업종 탭) — 업종 이름 → 차례 번호(작을수록 앞)
    자리 싹 → 꽃 → 시듦 → 잠잠 · 자리 안은 theme.json order(테마 시계 쪽과 같은 차례 — 싹 = 점이 많이 찬 순서 · theme-engine.js)
    theme.json 을 못 받으면 theme-home.json 으로 같은 잣대(싹 = 앞 셋 order.S 다음 닷새 x · 꽃 = 한 달 큰 차례 · 시듦 = 닷새 작은 차례 · 잠잠 = 닷새 큰 차례 · 같으면 이름)
    둘 다 없으면 빈 표(부르는 쪽이 옛 차례를 둠) · 오른 크기로는 줄 세우지 않음 — 테마 자료에 없는 업종만 맨 뒤(부르기 전 차례 그대로) */
function sproutRank() {
  const r = new Map(), F = thFull();
  if (F?.order) { for (const z of TZ) for (const n of Array.isArray(F.order[z]) ? F.order[z] : []) if (typeof n === 'string' && !r.has(n)) r.set(n, r.size); if (r.size) return r; }
  const Hm = thHome(); if (!Hm) return r;
  const top = Array.isArray(Hm.order?.S) ? Hm.order.S : [], ti = n => (top.includes(n) ? top.indexOf(n) : 99), y = i => (Number.isFinite(i.y) ? i.y : 0), x = i => (Number.isFinite(i.x) ? i.x : 0);
  const inZone = (a, b) => (a.z === 'S' ? ti(a.n) - ti(b.n) || y(b) - y(a) : a.z === 'B' ? x(b) - x(a) : a.z === 'W' ? y(a) - y(b) : y(b) - y(a));
  Hm.inds.filter(i => TZ.includes(i?.z) && typeof i.n === 'string').sort((a, b) => TZ.indexOf(a.z) - TZ.indexOf(b.z) || inZone(a, b) || (a.n < b.n ? -1 : a.n > b.n ? 1 : 0)).forEach(i => { if (!r.has(i.n)) r.set(i.n, r.size); });
  return r;
}
/** 목록을 싹 먼저 차례로(같은 자리 · 테마 자료에 없는 것은 지금 차례 그대로 — 안정 정렬) · 표가 비면 null(옛 차례를 그대로 쓰라는 뜻) */
const bySprout = (xs, nameOf) => { const r = sproutRank(); if (!r.size) return null; const at = x => r.get(nameOf(x)) ?? 1e9; return [...xs].sort((p, q) => at(p) - at(q)); };
/** 업종 이름들의 자리 수 — 「싹 5 · 꽃 3」(0인 자리는 뺌 · 모르는 업종은 「? n」) · 테마 자료가 없으면 null */
function zoneCount(names) {
  if (!thHome() && !thFull()) return null;
  const c = {S: 0, B: 0, W: 0, Q: 0}; let q = 0;
  for (const n of names) { const z = thInd(n)?.z; if (z) c[z]++; else q++; }
  return [...TZ.filter(z => c[z]).map(z => TH_ZONES[z] + ' ' + num(c[z])), ...(q ? ['? ' + num(q)] : [])].join(' · ') || null;
}
/** 칩 쪽 맨 위 결 한 줄(총정리 C1 ~ C6) — 굵은 글 한 줄(문장 한두 개) + 작은 글 한 줄 + 고리 한 줄(48px) · note() 앞 · 차례 · 목록은 그대로 */
const chipLead = (t1, t2 = null, sub = null, go = null) => h('div', {class: 'c-lead'}, h('p', {class: 'c-lt'}, h('span', {text: t1}), t2 ? [' ', h('span', {text: t2})] : null),
  sub ? h('p', {class: 'c-ls', text: sub}) : null, go ? h('a', {class: 'c-go', href: go[0]}, h('span', {text: go[1]}), h('i', {'aria-hidden': 'true', text: '›'})) : null);
/** 업종 채널 이름 밑 결 한 줄(총정리 C7) — 「테마 시계로 보면 지금 시듦 자리 2일째예요 ›」 → 테마 업종 쪽(#/t/i/<업종>) · 자료가 없으면 null(줄 없음) */
function chZone(n) {
  const I = thInd(n); if (!I) return null;
  return h('a', {class: 'ch-z', href: '#/t/i/' + enc(n)}, h('span', {class: 'ch-zt'}, h('span', {text: '테마 시계로 보면 지금'}), ' ', h('b', {text: TH_ZONES[I.z]}), ' ', h('span', {text: I.d ? '자리 ' + num(I.d) + '일째예요' : '자리예요'})), h('i', {'aria-hidden': 'true', text: '›'}));
}
/** 미국 지수 이름 밑 작은 뜻 글(총정리 C6 — 이름만으로는 무엇인지 모름) */
const US_MEAN = {INX: '미국 큰 회사 500곳', IXIC: '기술 회사가 많은 미국 시장', DJI: '미국 큰 회사 30곳', SOX: '미국 반도체 회사들', VIX: '겁날 때 오르는 숫자'};
/** 칩 쪽(#/f/…) — 칩마다 제 자료만 받음 · 맨 앞 하나만 큰 카드 + 한 줄 목록 10줄 + 「나머지 n곳 보기」([7] 5) · 급등은 반값 한 줄([6] 6) · 「1등」 말 · 보내기 없음([6] 5)
    총정리 2026-10-22 C1 ~ C6: 맨 위 결 한 줄(테마 시계 자리 · 뜻 · 지난 하루) 먼저 — 차례는 그대로(바꾸기는 사장님께 여쭘) */
const CHIP_NEED = {rise: ['core', 'themeHome'], group: ['core', 'themeHome'], ind: ['core', 'themeHome', 'theme'], us: ['home'], surge: ['surge', 'sum'], lead: ['cond', 'mkt', 'themeHome', 'theme'], pick: ['home', 'mkt']}; // theme = 업종 쪽 자료(30KB · 싹 먼저 차례 — 업종 · 대장주 칩을 열 때만)
async function vChip(chip) {
  await Promise.all(CHIP_NEED[chip].map(need));
  const T = CHIPS.find(c => c[0] === chip)[1], nodes = [chipsBar(chip)], none = t => ({title: T, nodes: [chipsBar(chip), ...noData(t)]});
  const note = t => nodes.push(h('p', {class: 'note', text: t})), core = D.core, lead = (...a) => nodes.push(chipLead(...a));
  if (chip === 'rise') {
    if (!core) return none();
    const rise = core.rise?.list || [], zs = zoneCount(rise.map(r => r.name));
    if (rise.length) lead('닷새 동안 오른 업종 ' + num(rise.length) + '곳' + (zs ? ' — ' + zs : ''));
    note('닷새 동안 오른 업종을 많이 오른 차례로 보여요(' + md(core.rise?.from) + ' → ' + md(core.rise?.to) + ').');
    if (!rise.length) nodes.push(h('p', {class: 'empty', text: '닷새 동안 오른 업종이 없어요.'}));
    nodes.push(...chipList(rise, riseCard, r => ({href: '#/ch/i/' + enc(r.name), name: r.name, x: r.chg, v: r.v}), '개'));
  } else if (chip === 'group') {
    if (!core) return none();
    const gs = [...(core.groups || [])].sort((a, b) => b.chg - a.chg);
    if (thHome() || thFull()) { // 큰 업종마다 싹 자리 업종 수(테마 시계 · 지난 셈) — 가장 많은 곳(같으면 함께)
      const sp = new Map(gs.map(g => [g.id, 0])); for (const i of core.industries || []) if (thInd(i.name)?.z === 'S' && sp.has(i.g)) sp.set(i.g, sp.get(i.g) + 1);
      const mx = Math.max(0, ...sp.values()), tops = gs.filter(g => mx > 0 && sp.get(g.id) === mx).slice(0, 3).map(g => g.short || g.name); // 짧은 이름(「K-소비재」) — 긴 이름은 안에 「 · 」가 있어 여럿을 이으면 어디서 끊기는지 모름
      const nm = tops.length < 2 ? tops.join('') : tops.length === 2 ? jo(tops[0], '과', '와') + ' ' + tops[1] : tops.slice(0, -1).join(', ') + ', ' + tops[tops.length - 1];
      lead(!tops.length ? '지금은 싹 자리 업종이 든 큰 업종이 없어요.' : '싹이 가장 많은 큰 업종은 ' + jo(nm, '이에요', '예요') + '(' + num(mx) + '곳' + (tops.length > 1 ? '씩' : '') + ').');
    }
    note('큰 업종 ' + gs.length + '개 · 한 달 평균으로 많이 오른 차례');
    nodes.push(...chipList(gs, groupCard, g => ({href: '#/ch/g/' + enc(g.id), name: g.name, x: g.chg, v: g.v}), '개'));
  } else if (chip === 'ind') {
    if (!core) return none();
    // 싹 먼저 차례(사장님 2026-10-22 09:41 「어그래」 — 옛 「한 달 평균으로 많이 오른 차례」를 바꿈) · 테마 자료를 못 받았을 때만 옛 차례 · 옛 글
    const inds0 = [...(core.industries || [])].sort((p, q) => q.chg - p.chg), sp = bySprout(inds0, i => i.name), inds = sp ?? inds0, TH = thHome();
    if (TH) lead(md(TH.asOf) + ' 기록 — ' + TZ.map(z => TH_ZONES[z] + ' ' + num(TH.count[z] ?? TH.inds.filter(i => i.z === z).length)).join(' · ') + '곳', null, null, ['#/t/sprout', '싹 자리 모두 보기']);
    note(sp ? '업종 ' + inds.length + '개 · 싹 자리부터 꽃 · 시듦 · 잠잠 차례' : '업종 ' + inds.length + '개 · 한 달 평균으로 많이 오른 차례');
    nodes.push(...chipList(inds, i => card('#/ch/i/' + enc(i.name), dayThumb(i.v, '한 달', i.chg), i.name + ' 업종', '회사 ' + num(i.n) + '곳 · 큰 회사 기준 ' + pct(i.cwChg), first(i.name)),
      i => ({href: '#/ch/i/' + enc(i.name), name: i.name, x: i.chg, v: i.v}), '개'));
  } else if (chip === 'surge') {
    if (!D.surge) return none('급등 자료');
    const miss = new Set(D.sum?.schema === SUM_SCHEMA ? D.sum.chips?.surge?.miss || [] : []);
    const sm = Array.isArray(D.surge.members) ? D.surge.members.filter(m => m && !miss.has(m.c) && Number.isFinite(m.r5)).sort((a, b) => b.r5 - a.r5) : [], hf = surgeHalf(sm);
    note('급등 칸 ' + sm.length + '곳 · 5일 동안 많이 오른 차례 · ' + md(D.surge.asOf) + '까지');
    nodes.push(h('p', {class: 'note half', text: hf ? halfLine(hf) : '? 1년 안에 반값 아래로 떨어진 적 있는 곳을 아직 못 셌어요'}));
    if (hf && hf.known < hf.n) note('? ' + num(hf.n - hf.known) + '곳은 1년 값이 모자라 못 셌어요');
    nodes.push(...chipList(sm, m => surgeCard(m, hf), m => ({href: '#/w/' + m.c, name: m.n, x: m.r5, v: m.v, kk: {code: m.c, name: m.n, kind: 'surge'}})));
    nodes.push(h('a', {class: 'more', href: oldOr('surge', '#/surge'), text: '급등 다섯 칸 자세히 ›'}));
  } else if (chip === 'lead') {
    const C = condOf(), co = D.mkt?.companies; if (!C || !co) return none('회사 크기 자료');
    // 싹 먼저 차례(사장님 2026-10-22 09:41 「어그래」) — 그 대장주가 든 업종의 자리 차례(업종 칩과 같은 표) · 같으면 종목 번호 · 테마 자료를 못 받았을 때만 옛 차례(5일 오른 차례) · 옛 글
    const all = [...C.entries()].filter(([c, o]) => o.rk === 1 && co[c] && Array.isArray(o.l5) && Number.isFinite(o.r5)), rk = sproutRank(), indOf = ([c, o]) => o.i || co[c]?.i;
    const leads = rk.size ? all.sort((a, b) => (rk.get(indOf(a)) ?? 1e9) - (rk.get(indOf(b)) ?? 1e9) || a[0].localeCompare(b[0])) : all.sort((a, b) => b[1].r5 - a[1].r5 || a[0].localeCompare(b[0]));
    const zs = zoneCount(leads.map(indOf)); // 그 대장주가 든 업종의 테마 시계 자리(「1등」 말 없음 — [6] 5 · [10] 1)
    if (leads.length) lead('대장주는 업종마다 회사 크기가 가장 큰 곳이에요.', null, zs ? '대장주 ' + num(leads.length) + '곳이 든 업종 자리 — ' + zs : null);
    note(rk.size ? '업종마다 가장 큰 회사 ' + leads.length + '곳 · 싹 업종의 대장주부터' : '업종마다 가장 큰 회사 ' + leads.length + '곳 · 5일 동안 많이 오른 차례');
    nodes.push(...chipList(leads, ([c, o]) => leadCard(c, o), ([c, o]) => ({href: '#/w/' + c, name: co[c].n, x: o.r5, v: o.l5, kk: {code: c, name: co[c].n, kind: 'share'}})));
  } else if (chip === 'pick') {
    const s3 = D.home?.s365, co = D.mkt?.companies || {}, picks = Array.isArray(s3?.list) ? s3.list.filter(([c]) => co[c]) : [];
    if (!picks.length) return none('고른 곳 자료');
    // 결(총정리 C5) — 누가 무슨 잣대로 고른 목록인지 · 사고팔기 권함이 아님 · 그날 오른 곳 · 내린 곳 수(#/today 고른 칸과 같은 셈 s365 up · down · flat)
    const ud = [[s3.up, '오름'], [s3.down, '내림'], [s3.flat, '그대로']].filter(([v]) => Number.isFinite(v) && v > 0).map(([v, t]) => num(v) + '곳 ' + t).join(' · ');
    lead('멍거 · 린치 조건을 넘은 ' + num(s3.n) + '곳이에요.', '사고팔기를 권하는 목록이 아니에요.', ud && isDay(s3.date) ? md(s3.date) + ': ' + ud : null);
    note('고른 곳 ' + s3.n + '곳 · ' + md(s3.date) + ' 하루 많이 오른 차례');
    nodes.push(...chipList(picks, ([c, x]) => coCard(c, '한 달', md(s3.date) + ' 마감', false, x),([c, x]) => ({href: '#/w/' + c, name: co[c].n, x, v: co[c].l, kk: {code: c, name: co[c].n, kind: 'share'}})));
  } else if (chip === 'us') {
    const us = D.home?.us; if (!us?.rows?.length) return none('미국 자료');
    // 결(총정리 C6) — 큰 지수 셋(S&P 500 · 나스닥 · 다우)이 같은 쪽이었나(첫 화면 「더 보기」 · #/today 와 같은 말) · 이름 밑 작은 뜻 글
    const three = ['INX', 'IXIC', 'DJI'].map(k => us.rows.find(r => r?.key === k)).filter(r => r && Number.isFinite(r.chg)), up3 = three.filter(r => r.chg > 0).length;
    if (three.length) lead((isDay(us.date) ? md(us.date) + ' ' : '') + '미국 — ' + (three.length < 3 ? `${three.length}개 지수 가운데 ${up3}개가 올랐어요` : up3 === 3 ? '세 지수 모두 올랐어요' : up3 === 0 ? '세 지수 모두 내렸어요' : `세 지수 가운데 ${up3}개가 올랐어요`));
    note('미국 마지막 장 · ' + md(us.date) + ' 마감');
    nodes.push(...chipList(us.rows, r => h('div', {class: 'card'}, numThumb(p2(r.chg), r.chg, r.name + ' · ' + num(r.close)), h('div', {class: 'meta'}, h('span', {class: 'av', 'aria-hidden': 'true', text: '미'}), h('div', {}, h('b', {text: r.name + ' 하루 ' + p2(r.chg)}), h('small', {text: (US_MEAN[r.key] ? US_MEAN[r.key] + ' · ' : '') + md(r.date) + ' 마감 · 3달 낮은 값 ' + num(r.lo) + ' · 높은 값 ' + num(r.hi)})))),
      r => ({href: null, name: r.name, sub: US_MEAN[r.key] ?? null, x: r.chg, pt: p2(r.chg), v: null})));
  }
  return {title: T, nodes};
}

/* 보는 화면 — 큰 선(그려지며 열림 · 손가락으로 끌면 그날 값) · 길 표시 · 탭 넷(4 ~ 7단) · 채널 · 다음 볼 것 */
function player(vals, labelAt, defaultTip) {
  const n = vals.length, svg = lineSvg(vals, {w: 320, ht: 130, draw: true});
  const cur = h('i', {class: 'cur', 'aria-hidden': 'true'}), tip = h('span', {class: 'tip', role: 'status', 'aria-live': 'polite', text: defaultTip}), bar = h('b', {}), scrub = h('div', {class: 'scrub', 'aria-hidden': 'true'}, bar);
  const box = h('div', {class: 'player', role: 'img', 'aria-label': defaultTip}, svg, h('i', {class: 'play', 'aria-hidden': 'true'}), cur, tip, scrub);
  const replay = () => { const p = svg?.querySelector('path.draw'); if (!p) return; p.classList.remove('draw'); void p.getBoundingClientRect(); p.classList.add('draw'); };
  let down = null;
  const at = e => { const r = box.getBoundingClientRect(), fx = Math.max(0, Math.min(1, (e.clientX - r.left - r.width * 0.03) / (r.width * 0.94))), i = Math.round(fx * (n - 1)); return {i, x: r.width * (0.03 + 0.94 * i / (n - 1))}; };
  const show = e => { const {i} = at(e); cur.style.setProperty('left', ((0.03 + 0.94 * i / (n - 1)) * 100).toFixed(2) + '%'); /* 몫으로 — 큰 글씨(zoom)에서도 제자리 */ bar.style.setProperty('width', ((i / (n - 1)) * 100).toFixed(1) + '%'); tip.textContent = labelAt(i); };
  box.addEventListener('pointerdown', e => { down = {x: e.clientX, t: Date.now(), moved: false}; box.setPointerCapture?.(e.pointerId); box.classList.add('scrubbing'); show(e); });
  box.addEventListener('pointermove', e => { if (!down) return; if (Math.abs(e.clientX - down.x) > 6) down.moved = true; show(e); });
  const end = () => { if (!down) return; const tap = !down.moved && Date.now() - down.t < 250; down = null; box.classList.remove('scrubbing'); if (tap) { replay(); bar.style.setProperty('width', '100%'); tip.textContent = defaultTip; } };
  box.addEventListener('pointerup', end); box.addEventListener('pointercancel', end);
  return box;
}
/* 회사 머리(3단 · 사장님 2026-10-18 [7] 1 ~ 4 · [10] 2 · 일꾼 S3) — 큰 선(▶ 표시 없음) → 이름 위 길 표시(7단 1 · 2단 「반도체 › 반도체 업종」) → 이름 → 오늘 값 · 하루 등락(크게 · 360×640 첫 화면 안)
   → 마감 날 · 한 달 → 4 ~ 7단 탭 넷(7단 이름 그대로 · 한 줄 · 넷 모두 보임 · 꼬리표보다 먼저라 꼬리표가 늘어도 첫 화면 안) → 든 목록 꼬리표(고도리 칸 n번 · 급등 칸 · 급등 n%대 칸 · 대장주 · 고른 곳 = 멍거 · 린치 조건만 · 누르면 그 목록) · 모양 p-co.css(.wpath · .wnow · .wtabs · .wtags) */
const W_BANDS = [['b10', '10%대'], ['b20', '20%대'], ['b30', '30%대'], ['b40', '40% 이상']]; // 급등 네 칸(p-surge SV_NAME 과 같은 이름 · surge.json bands)
const wShort = t => (String(t).length < 4 ? 'wsh' : ''); // 길 표시 고리 글이 네 글자 아래면 wsh(p-co.css .wpath > a.wsh)
function wPath(I, g) {
  return h('nav', {class: 'wpath', 'aria-label': '7단 길'},
    g ? h('a', {href: '#/ch/g/' + enc(g.id), text: g.short || g.name, class: wShort(g.short || g.name)}) : h('span', {text: '큰 업종 ?'}), // 글이 아주 짧으면(영어 「Bio」) 누르는 자리가 44px 안 돼 오른쪽만 넓힘(글 시작 줄은 그대로)
    h('span', {class: 'wsep', 'aria-hidden': 'true', text: '›'}),
    I ? h('a', {href: '#/ch/i/' + enc(I.name), text: I.name + ' 업종'}) : h('span', {text: '업종 ?'}));
}
function wTags(a, X, open = false) { // open = 열한 질문을 끝낸 기기(p-gdr opened() — 부르는 줄이 넘김) · 아니면 칸 번호 꼬리표를 뺌(본질 「골똘이 칸은 열한 질문 뒤에만」 · 본질 문 ④ · 일꾼 KI)
  const t = [], S = D.surge;
  if (open) for (const p of GDR?.picks ?? []) if (p.code === a) t.push([NAME + ' 칸 ' + p.no + '번', '#/gdr/' + p.no]);
  if (S?.members?.some(m => m.c === a)) t.push(['급등 칸', '#/surge']);
  for (const [k, nm] of W_BANDS) if (S?.bands?.[k]?.members?.some(m => m.c === a)) t.push(['급등 ' + nm + ' 칸', '#/surge/' + k.slice(1)]);
  const o = condOf()?.get(a); // 대장주 = 업종 안 회사 크기 1등 — #/f/lead 칩과 같은 자료 · 같은 걸름(차례 1 · 5일 선 · 5일 오름이 숫자)
  if (o && o.rk === 1 && X.co[a] && Array.isArray(o.l5) && Number.isFinite(o.r5)) t.push(['대장주', '#/f/lead']);
  if (X.co[a]?.p) t.push(['고른 곳', '#/f/pick']);
  return t.length ? h('div', {class: 'wtags'}, ...t.map(([text, href]) => h('a', {class: 'wtag' + (href === '#/f/pick' ? ' pk' : ''), href, text}))) : null;
}
function wTabs(a) { return h('nav', {class: 'wtabs', 'aria-label': '7단 중 4 ~ 7단'}, ...chapList(a).slice(3).map(([k, t, href]) => h('a', {class: 'wtab', href, 'data-step': k, text: t}))); }
/** 모양 파일이 붙을 때까지(늦으면 3초 뒤 그냥 그림) — 회사 머리 모양이 p-co.css 에 있음 */
function sheetReady(href) { const l = [...document.querySelectorAll('link[rel="stylesheet"]')].find(x => x.getAttribute('href') === href); return !l || l.sheet ? Promise.resolve() : new Promise(r => { l.addEventListener('load', r, {once: true}); l.addEventListener('error', r, {once: true}); setTimeout(r, 3000); }); }
/** 테마 시계 자리 한 줄 — 회사 한 곳을 업종 시계와 같은 잣대로(결정표 9 · 사장님 2026-10-20 21:56 「맞아 정말 맞아」 — 박승혁 님 「삼성전자를 치면 이게 지금 꽃을 피운 단계에 있는 건지 시듦의 단계인건지도」)
 *  자료(theme-co.json)를 못 받으면 줄 없음 · 셀 수 없는 회사(값 빔 · 크게 튄 날)는 「?」 한 줄 · 누르면 시계 읽는 법(#/t/how) · 지난 한 달 · 닷새 기록만(앞날 말 없음) */
function wZone(a, TC) {
  if (!TC || typeof TC.co !== 'object' || !TC.co) return null;
  const v = TC.co[a];
  if (!Array.isArray(v) || !Number.isFinite(v[0]) || !Number.isFinite(v[1]) || !TH_ZONES[v[2]]) return h('p', {class: 'wz wz-q cw'}, h('span', {class: 'wz-t', text: '? 테마 시계 자리를 못 셌어요'}), h('small', {class: 'wz-n', text: '한 달 사이 값이 비었거나 크게 튄 날이 있어요.'}));
  const [x, y, z] = v;
  return h('a', {class: 'wz cw', href: '#/t/how', 'data-z': z},
    h('span', {class: 'wz-b'},
      h('span', {class: 'wz-t'}, h('span', {text: '테마 시계로 보면 지금'}), ' ', h('b', {class: 'wz-z ' + z, text: TH_ZONES[z]}), ' ', h('span', {text: '자리예요'})),
      h('small', {class: 'wz-n'}, h('span', {text: '한 달 시장보다 ' + thPp(x) + '%p'}), h('span', {text: '지난 닷새 시장보다 ' + thPp(y) + '%p'}))), // 두 줄(한 줄에 붙이면 390 폭에서 숫자가 끊겨 넘어감)
    h('i', {'aria-hidden': 'true', text: '›'}));
}
async function vWatch(a) {
  if (a === 'KOSPI' || a === 'KOSDAQ') return vIndex(a);
  { const [code, sub] = String(a).split('/'); if (sub) { if (['past', 'rivals', 'grow', 'range'].includes(sub) && ready(sub)) return page(sub, code); location.replace('/atlas/#/c/' + code + '/' + sub); return {title: '…', nodes: []}; } }
  const css = ready('co') ? mod('co').then(() => sheetReady('/next/p-co.css'), () => {}) : null; // 회사 머리 모양이 붙은 뒤에 그림(첫 화면 숫자 자리가 흔들리지 않게)
  const tcP = need('themeCo'); // 회사 자리(결정표 9 · 2026-10-20 「맞아 정말 맞아」 박승혁 님 생각) — 탭 아래 한 줄 · 못 받으면 줄 없음
  const rest = Promise.all([need('cond'), need('surge'), gdr(), css]); rest.catch(() => {}); // 먼저 시작 — 아래에서 회사 목록(core · mkt)을 기다리는 동안 함께 받음
  const gdrM = mod('gdr').catch(() => null); // 칸 번호 꼬리표 문(p-gdr opened — 못 받으면 꼬리표를 뺌 · 일꾼 KI)
  await Promise.all([need('core'), need('mkt')]);
  const known = !!ix()?.co?.[a]; // 모르는 번호는 회사 파일 · 고른 곳 파일을 받지 않음(없는 파일 404 가 화면 오류로 읽히지 않게)
  const coP = known ? getJson('co/' + enc(a) + '.json') : null, cmP = known ? getJson('comp.json') : null; // 오늘 값(이름 밑 첫 줄) · 보내기에 담을 그날 값 — 고른 곳 밖 = 회사 파일 c.price · c.priceDate / 고른 곳 = comp.json 의 그 회사(회사 파일에 c 가 없음) · 3단 자세히(p-co)가 같은 파일을 써서 한 번만 받음
  await rest;
  const X = ix(); if (!X) return {title: '보는 화면', nodes: noData()};
  const c = X.co[a];
  if (!c) return {title: '없는 회사', nodes: [h('p', {class: 'empty', text: '? 이 번호의 회사를 찾지 못했어요.'}), h('a', {class: 'more', href: '#/find', text: '회사 찾기 ›'})]};
  pushHist(a);
  const l = c.l, n = l.length, x20 = c20(c), day = dayOf(l), I = X.ind.get(c.i), g = I ? X.grp.get(I.g) : null, Cd = condOf();
  const lab = i => { const d = dateAt(n, i); return (d ? md(d) : (i + 1) + '번째 날') + ' · 첫날보다 ' + pct((l[i] / l[0] - 1) * 100) + (i > 0 ? ' · 그날 ' + pct((l[i] / l[i - 1] - 1) * 100) : ''); };
  const d0 = dateAt(n, 0), d1 = dateAt(n, n - 1), tip0 = '한 달 · ' + (d0 ? md(d0) : '?') + ' → ' + (d1 ? md(d1) : '?');
  const cj = await coP, cm = await cmP, cc = cj?.c ?? cm?.companies?.[a], pr = cc?.price, pd = cc?.priceDate, okP = Number.isFinite(pr) && pr > 0, pDay = okP && isDay(pd) ? String(pd).slice(0, 10) : null;
  const GM = await gdrM;
  /** 보내기 · 같이 따져 줘(2026-10-17 21:10 [4] 1 · 6 · 8) — 글상자(p-share)를 부름 · 그날 값과 날을 함께(친구가 열면 보낸 날 값 · 오늘 값) · 수익률 글 없음 */
  const sendBtn = (kind, text) => {
    const b = h('button', {class: kind === 'share' ? 'act kk-pgx kk-yel' : 'act', type: 'button', text}); // 카톡 보내기(2026-10-25)
    b.addEventListener('pointerdown', () => { mod('share').catch(() => {}); }, {once: true}); // 누르기 시작할 때 글상자를 미리 받음
    b.addEventListener('click', () => { shareBox({kind, title: L(c.n + ' · ' + NAME), url: absUrl('#/w/' + a), code: a, name: c.n, price: okP ? pr : null, day: pDay}); });
    return b;
  };
  const pl = player(l, lab, tip0); pl.querySelector('.play')?.remove(); pl.classList.add('cw'); // ▶ 표시 뺌([7] 1) · cw = 회사 화면 꾸밈(p-co.css — 이름표 글 시작 줄)
  const nodes = [
    pl,
    wPath(I, g),
    h('h1', {class: 'wt', text: c.n}),
    h('p', {class: 'wnow'}, h('b', {class: 'wn-p num', text: okP ? num(pr) + '원' : '?'}), h('span', {class: 'wn-k', text: '하루'}), h('b', {class: 'wn-d num ' + cls(day), text: pct(day)})),
    h('p', {class: 'ws'}, h('span', {text: md(X.mkt.asOf) + ' 마감'}), ' · ', h('span', {text: '한 달 동안'}), ' ', h('b', {class: cls(x20), text: pct(x20)})),
    wTabs(a), // 탭 넷이 먼저 — 꼬리표가 늘어 둘째 줄이 생겨도 탭 줄이 첫 화면(아래 막대 위 572px) 안에 머물게
    pDay && pDay !== X.mkt.asOf ? h('p', {class: 'wsd'}, h('span', {text: '값은 ' + md(pDay) + ' 종가'})) : null, // 값 날이 마감 날과 다르면 탭 아래 한 줄(2026-10-20 — 날 줄 뒤에 붙이면 360 폭에서 두 줄이 되어 탭 넷이 첫 화면 밖으로 밀렸음 · 실제 사이트 000500 탭 아래 끝 585 > 막대 572)
    wTags(a, X, GM?.opened?.() === true), // 칸 번호 꼬리표는 열한 질문 뒤에만(opened)
    // 「이 회사로 왜 사?」가 단추 셋보다 먼저(총정리 2026-10-22 04:09 · C11 — 본질 ② 사기 전에 한 번 멈춤이 이 쪽에서 가장 먼저 누를 것 · 금빛 테 p-co.css) — 높이 · 업종 줄 자리는 그대로(선 끌기 틀림 장부 90)
    h('a', {class: 'why-go cw', href: '#/why/' + enc(a)}, h('b', {text: '이 회사로 왜 사?'}), h('i', {'aria-hidden': 'true', text: '›'})),
    // 관심 담기(첫 단추 — 검사가 .acts 첫 .act 를 누름) · 보내기 · 매매일지로(2026-10-17 21:10 [3] 2 · 규칙 1 「하나 넣으면 하나 뺀다」 — 넣은 「이 회사로 왜 사?」 자리에서 「편지 쓰기」를 뺌 · 편지 여는 밤은 보유종목 바로 가기에)
    h('div', {class: 'acts cw'}, laterBtn(a, c.n), sendBtn('share', '카톡 보내기'), sendBtn('ask', '같이 따져 줘')),
    h('div', {class: 'chan cw'}, h('a', {href: '#/ch/i/' + enc(c.i)}, h('span', {class: 'av', 'aria-hidden': 'true', text: first(c.i)}), h('div', {}, h('b', {text: (c.i || '?') + ' 업종'}), h('small', {text: '회사 ' + (I ? num(I.n) : '?') + '곳' + (g ? ' · 큰 업종 ' + g.short : '')}))), I ? subBtn('i:' + c.i, c.i + ' 업종') : null),
    // 테마 시계 자리 한 줄(결정표 9) — 업종 줄 아래 · 탭 · 관심 담기 · 업종 담기 단추를 아래로 밀지 않게
    //   (2026-10-20 23:2x 전체 검사 co-stage 2번째 next 「선 끌기」 실패 — 탭 아래에 두면 390×844 에서 업종 담기 단추가 첫 화면 밖으로 밀려 누를 때 화면이 내려감 · 틀림 장부 90)
    wZone(a, await tcP),
  ].filter(Boolean);
  if (ready('co')) { try { const d = await page('co', a); if (d?.nodes?.length) nodes.push(h('section', {class: 'co-d', id: 'd'}, ...d.nodes)); } catch (e) { console.error(e); nodes.push(h('p', {class: 'empty', text: '? 회사 자세히를 그리지 못했어요.'})); } }
  const mem = (I?.members || []).filter(m => m !== a && X.co[m]);
  if (mem.length) {
    const capOf = m => Cd?.get(m)?.cap ?? -1;
    mem.sort((p, q) => capOf(q) - capOf(p) || p.localeCompare(q));
    nodes.push(h('h2', {class: 'sec', text: '다음 볼 것 · 같은 업종'}), h('p', {class: 'note', text: Cd ? '큰 회사부터 보여 줘요.' : '번호 차례예요.'}));
    const list = h('div', {});
    const row = m => { const o = X.co[m]; return kkWrap(h('a', {class: 'nx cw', href: '#/w/' + m}, h('div', {}, h('b', {text: o.n}), h('small', {text: '하루 ' + pct(dayOf(o.l))})), thumb(o.l, '한 달', {x: c20(o)})), {code: m, name: o.n, kind: 'share'}, 'watch.next', 'kkr kkn'); }; // 글이 왼쪽 · 작은 선이 오른쪽(글 시작 왼쪽 줄 하나 · [7] 5 한 줄 목록 꼴) · 카톡 단추는 그 오른쪽 끝(KB2)
    let shown = 0; const step = 6, more = h('button', {class: 'more', type: 'button'});
    const fill = () => { for (const m of mem.slice(shown, shown + step)) list.append(row(m)); shown = Math.min(mem.length, shown + step); more.textContent = '더 보기 · ' + (mem.length - shown) + '곳'; more.hidden = shown >= mem.length; };
    more.addEventListener('click', fill); fill();
    nodes.push(list, more);
  }
  return {title: c.n, nodes};
}
/* 7단 길(1 큰 업종 · 2 업종 · 3 회사 · 4 지나온 길 · 5 누구와 다투나 · 6 앞으로 클까? · 7 범위) — 보는 화면 머리(길 표시 · 탭 넷) · 4 ~ 7단 쪽 모듈이 함께 씀(NX.chaps · NX.chapNext) · 지금 단은 금빛 테 */
/* 테마 길로 들어온 회사(사장님 2026-10-20 12:59 「지금 3단 클릭 구조로 되어있는걸 7단 클릭구조로 만들어 더 깊이 클릭만으로 알수 있게 토스증권처럼」 · 13:04 「어」)
   테마 시계 → 업종 → 회사(3단) 다음에 4 지나온 길 · 5 누구와 다투나 · 6 앞으로 클까? · 7 범위가 이어짐 — 테마 업종 · 회사 쪽(p-theme.js)이 setTrail 로 알려 줌
   그 회사의 7단 줄은 1 · 2 · 3 을 테마 쪽(테마 시계 · 그 업종 · 그 회사)으로 · 7단 다음은 「사기 전에」(#/why/<번호> · 서른여섯 장 19 쪽) · 이 앱을 연 동안만 기억(다시 열면 처음 7단 줄) */
let TRAIL = null;
const setTrail = t => { TRAIL = t && typeof t.code === 'string' && typeof t.ind === 'string' && t.ind ? {code: t.code, ind: t.ind, name: typeof t.name === 'string' && t.name ? t.name : null} : null; };
function chapList(a) {
  const X = ix(), c = X?.co?.[a], I = c ? X.ind.get(c.i) : null, g = I ? X.grp.get(I.g) : null, base = '/atlas/#/c/' + enc(a), sub = k => (ready(k) ? '#/w/' + enc(a) + '/' + k : base + '/' + k);
  const T = TRAIL?.code === a ? TRAIL : null;
  const head = T ? [['1', '테마 시계', '#/'], ['2', '업종', '#/t/i/' + enc(T.ind)], ['3', T.name ?? '회사', '#/t/c/' + enc(a)]]
    : [['1', '갈래', g ? '#/ch/g/' + enc(g.id) : null], ['2', '업종', I ? '#/ch/i/' + enc(I.name) : null], ['3', '회사', ready('co') ? '#/w/' + enc(a) : base]];
  return [...head, ['4', '지나온 길', sub('past')], ['5', '누구와 다투나', sub('rivals')], ['6', '앞으로 클까?', sub('grow')], ['7', '범위', sub('range')]];
}
function chaps(a, now) {
  const row = now !== '3'; // 4 ~ 7단 = 한 줄로 밀어 보기 · 보는 화면(3단) = 일곱 칸 모두
  const el = h('div', {class: 'chaps' + (row ? ' row' : ''), role: row ? 'navigation' : null, 'aria-label': row ? '7단 길' : null}, chapList(a).map(([k, t, href]) => href ? h('a', {class: 'cp' + (k === now ? ' now' : ''), href, 'aria-current': k === now ? 'page' : null}, h('i', {text: k}), h('span', {text: t})) : h('span', {class: 'cp'}, h('i', {text: k}), h('span', {text: t + ' ?'}))));
  return el;
}
function chapNext(a, now) {
  if (now === '7' && TRAIL?.code === a) return h('a', {class: 'more chap-next', href: '#/why/' + enc(a), text: '다음 단 · 사기 전에 ›'}); // 테마 길 — 7단 다음은 서른여섯 장 19 쪽(왜 사? 열한 질문)
  const L = chapList(a), i = L.findIndex(x => x[0] === now), nx = L[i + 1];
  return nx?.[2] ? h('a', {class: 'more chap-next', href: nx[2], text: '다음 단 · ' + nx[0] + ' ' + nx[1] + ' ›'}) : h('a', {class: 'more chap-next', href: '#/w/' + enc(a), text: '회사로 돌아가기 ›'});
}
async function vIndex(code) {
  await Promise.all([need('core'), need('mkt'), need('home')]);
  const x = D.home?.idx?.[code]; if (!x?.rows?.length) return {title: code, nodes: noData('지수 자료')};
  const vals = x.rows.map(r => r[1]), n = vals.length, x3 = chgOf(vals);
  const lab = i => md(x.rows[i][0]) + ' · ' + num(x.rows[i][1]) + ' · 첫날보다 ' + pct((vals[i] / vals[0] - 1) * 100);
  const nodes = [player(vals, lab, '3달 · ' + md(x.rows[0][0]) + ' → ' + md(x.rows[n - 1][0])), h('h1', {class: 'wt', text: x.name}),
    h('p', {class: 'ws'}, md(x.date) + ' 하루 ', h('b', {class: cls(x.day), text: p2(x.day)}), ' · 3달 ', h('b', {class: cls(x3), text: pct(x3)}), x.live ? ' · 장 중' : ' · 장 마감'),
    h('div', {class: 'stats'}, x.hi ? h('div', {}, h('small', {text: '3달 높은 값 · ' + md(x.hi.d)}), h('b', {text: num(x.hi.v)})) : null, x.lo ? h('div', {}, h('small', {text: '3달 낮은 값 · ' + md(x.lo.d)}), h('b', {text: num(x.lo.v)})) : null)];
  const X = ix(), other = code === 'KOSPI' ? 'KOSDAQ' : 'KOSPI';
  nodes.push(h('h2', {class: 'sec', text: '다음 볼 것'}));
  const oc = idxCard(other); if (oc) nodes.push(oc);
  if (X) for (const g of [...X.core.groups].sort((a, b) => b.chg - a.chg)) nodes.push(groupCard(g));
  return {title: x.name, nodes};
}

/* 시황(옛 쇼츠) — 「왜 움직였나」만 · 위로 밀면 다음 사실 · 한 화면에 사실 하나 */
async function vShorts(a) {
  await Promise.all([need('core'), need('mkt'), need('home')]);
  const fs = shortFacts(); if (!fs.length) return {title: '시황', nodes: noData()};
  const bar = h('div', {class: 'sbar', 'aria-hidden': 'true'}, fs.map(() => h('i', {})));
  const box = h('div', {class: 'shorts', tabindex: '0', 'aria-label': '시황 · 위로 밀면 다음 사실'}, bar);
  fs.forEach((f, i) => {
    const sb = h('button', {class: 'kk-pgx kk-yel', type: 'button', text: '카톡 보내기'});
    sb.addEventListener('pointerdown', () => { mod('share').catch(() => {}); }, {once: true});
    sb.addEventListener('click', () => shareBox({kind: 'share', title: L(f.st + ' · ' + NAME), url: absUrl('#/shorts/' + i)})); // 제목에 숫자 · 수익률 없음([4] 5)
    const side = h('div', {class: 'side'}, f.go ? h('a', {href: f.go, text: '보기'}) : null, sb);
    const sec = h('section', {class: 'sh', 'data-i': String(i), 'aria-label': (i + 1) + ' / ' + fs.length},
      h('p', {class: 'k', text: f.k}), h('p', {class: 'l1', text: f.l1}), h('p', {class: 'bg ' + (f.bc || ''), text: f.big}), h('p', {class: 'l2', text: f.l2}),
      f.ratio ? [(() => { const t = f.ratio.up + f.ratio.fl + f.ratio.dn || 1, s = sv('svg', {class: 'ratio', viewBox: '0 0 100 10', preserveAspectRatio: 'none', 'aria-hidden': 'true'}); let x = 0; // 비율 막대 = 그림(svg) — 남는 높이를 채워도 빈 곳으로 안 셈([10] 9)
          for (const [v, c] of [[f.ratio.up, COLOR.up], [f.ratio.fl, COLOR.fl], [f.ratio.dn, COLOR.dn]]) { const w = v / t * 100; if (w > 0) s.append(sv('rect', {x: x.toFixed(3), y: 0, width: w.toFixed(3), height: 10, fill: c})); x += w; } return s; })(),
        h('p', {class: 'rl'}, h('span', {class: 'up', text: '오름 ' + num(f.ratio.up)}), ' · ', h('span', {}, '그대로', ' ' + num(f.ratio.fl)), ' · ', h('span', {class: 'dn', text: '내림 ' + num(f.ratio.dn)}))] : null, // 한 줄 · 왼쪽 줄 하나([10] 7)
      f.mini ? (() => { const s = lineSvg(f.mini, {w: 300, ht: 100, stretch: true}); s?.classList.add('mini'); return s; })() : null, // 선이 남는 높이를 채움 — 빈 곳 줄임([10] 9)
      f.mini && f.ml ? h('p', {class: 'ml', text: f.ml}) : null, // 작은 선의 기간 — 큰 숫자(하루)와 선(여러 날)의 색이 달라도 헷갈리지 않게
      f.id === 'us' ? (() => { const rs = (D.home?.us?.rows || []).slice(0, 3).filter(r => Number.isFinite(r?.chg)), mx = Math.max(...rs.map(r => Math.abs(r.chg)), 0.01); // 미국 장 — 세 지수 하루 막대(빈 곳 줄임 [10] 9 · 글은 위 두 줄과 같은 값)
        return rs.length ? h('div', {class: 'bars'}, rs.map(r => [h('p', {class: 'br'}, h('span', {text: r.name}), h('span', {class: cls(r.chg), text: p2(r.chg)})), (() => { const b = sv('svg', {class: 'bt', viewBox: '0 0 100 10', preserveAspectRatio: 'none', 'aria-hidden': 'true'}); b.append(sv('rect', {x: 0, y: 0, width: 100, height: 10, fill: '#1C1F26'}), sv('rect', {x: 0, y: 0, width: Math.max(2, Math.abs(r.chg) / mx * 100).toFixed(1), height: 10, fill: COLOR[cls(r.chg)]})); return b; })()])) : null; })() : null,
      h('div', {class: 'bub'}, h('span', {text: '돌이는 지난 기록만 따라 말해요'}), h('img', {alt: '', src: '/media/makbi-icon.svg'})), // 글이 먼저 — 글 시작이 위 글과 같은 줄([10] 7)
      side, i === 0 ? h('p', {class: 'hint', text: '위로 밀면 다음 사실이에요'}) : null); // 보기 · 보내기 = 글 아래 한 줄(옆 76px 자리 · 14px 글 없앰 [10] 5 · 8)
    box.append(sec);
  });
  const mark = i => bar.querySelectorAll('i').forEach((e, k) => e.classList.toggle('on', k <= i));
  const io = 'IntersectionObserver' in window ? new IntersectionObserver(es => { for (const e of es) if (e.isIntersecting) mark(+e.target.dataset.i); }, {root: box, threshold: 0.6}) : null;
  if (io) box.querySelectorAll('.sh').forEach(s => io.observe(s)); else mark(0);
  const start = Math.max(0, Math.min(fs.length - 1, parseInt(a, 10) || 0));
  requestAnimationFrame(() => { const t = box.querySelector('.sh[data-i="' + start + '"]'); if (t) box.scrollTop = t.offsetTop; mark(start); });
  return {title: '시황', nodes: [box], noScroll: true};
}

/* 채널 — 업종(#/ch/i/<이름>) · 갈래(#/ch/g/<번호>) */
async function vChannel(a) {
  await Promise.all([need('core'), need('mkt'), need('cond'), need('themeHome'), need('theme')]); // 테마 자료 — 업종 채널 이름 밑 자리 한 줄(총정리 C7 · theme.json 이 날 수를 가짐) · 큰 업종 채널 「업종」 탭의 싹 먼저 차례(사장님 2026-10-22 09:41 「어그래」)
  const X = ix(); if (!X) return {title: '채널', nodes: noData()};
  const kind = (a || '').slice(0, 1), id = (a || '').slice(2), Cd = condOf();
  const ch = kind === 'i' ? X.ind.get(id) : kind === 'g' ? X.grp.get(id) : null;
  if (!ch) return {title: '없는 채널', nodes: [h('p', {class: 'empty', text: '? 이 채널을 찾지 못했어요.'}), h('a', {class: 'more', href: '#/f/group', text: '큰 갈래 보기 ›'})]};
  const key = kind + ':' + id, name = kind === 'i' ? ch.name + ' 업종' : ch.name + ' 갈래', g = kind === 'i' ? X.grp.get(ch.g) : ch;
  const inds = kind === 'g' ? (ch.inds || []).map(n => X.ind.get(n)).filter(Boolean) : [];
  const members = (kind === 'i' ? ch.members || [] : inds.flatMap(i => i.members || [])).filter(m => X.co[m]);
  const capOf = m => Cd?.get(m)?.cap ?? -1;
  members.sort((p, q) => capOf(q) - capOf(p) || p.localeCompare(q));
  const banner = h('div', {class: 'banner', 'aria-hidden': 'true'}, lineSvg(ch.v, {w: 360, ht: 100, stretch: true}));
  const nodes = [banner, // 차례: 큰 선 → 이름 → 테마 시계 자리 한 줄 → 20거래일 · 관심 담기 → 두 숫자(next_check 이름 · 두 숫자 · 칸 수 그대로)
    h('div', {class: 'chhead'}, h('div', {}, h('h1', {text: name}), // 글이 먼저 · 동그라미는 오른쪽 끝 — 글 시작이 아래 줄들과 같은 왼쪽 줄(2026-10-18 [10] 7)
      h('small', {text: '회사 ' + num(members.length) + '곳' + (kind === 'i' && g ? ' · ' + g.short + ' 갈래' : '') + (kind === 'g' ? ' · 업종 ' + inds.length + '개' : '')})),
      h('span', {class: 'av lg', 'aria-hidden': 'true', text: first(kind === 'g' ? ch.short || ch.name : ch.name)})),
    kind === 'i' ? chZone(ch.name) : null, // 이름 칸 밑 결 한 줄(총정리 C7) — 테마 시계 자리 · 며칠째 · 누르면 테마 업종 쪽(#/t/i/) · 못 받으면 줄 없음
    h('div', {class: 'chan'}, h('span', {class: 'ws', text: '20거래일 · ' + md(X.core.base) + '부터'}), subBtn(key, name)),
    h('div', {class: 'stats chs'}, h('div', {}, h('small', {text: '한 회사 한 표'}), h('b', {class: cls(ch.chg), text: pct(ch.chg)})), h('div', {}, h('small', {text: '큰 회사는 크게'}), h('b', {class: cls(ch.cwChg), text: pct(ch.cwChg)})))]; // 두 숫자 = 한 칸 두 줄(이름 왼쪽 · 숫자 오른쪽 끝)
  if (kind === 'g' && ch.say) nodes.push(h('p', {class: 'note', text: ch.say}));
  const tabs = kind === 'g' ? [['co', '회사'], ['ind', '업종']] : [['co', '회사']];
  const pane = h('div', {}), tabBar = h('div', {class: 'ctabs', role: 'tablist'});
  const showCo = () => {
    const grid = h('div', {class: 'grid'}); let shown = 0; const more = h('button', {class: 'more', type: 'button'});
    const fill = () => { for (const m of members.slice(shown, shown + 20)) { const o = X.co[m]; grid.append(kkWrap(h('a', {href: '#/w/' + m}, thumb(o.l, '20일', {x: c20(o)}), h('b', {text: o.n}), h('small', {text: kind === 'g' ? o.i : '하루 ' + pct(dayOf(o.l))})), {code: m, name: o.n, kind: 'share'}, 'ch.grid', 'kkr kkg')); } shown = Math.min(members.length, shown + 20); more.textContent = '더 보기 · ' + (members.length - shown) + '곳'; more.hidden = shown >= members.length; }; // 칸마다 카톡 단추(KB2 — 그림 밑 글 줄 오른쪽 끝)
    more.addEventListener('click', fill); fill();
    pane.replaceChildren(h('p', {class: 'note', text: Cd ? '몸값 큰 차례예요.' : '번호 차례예요.'}), grid, more);
  };
  const showInd = () => { const i0 = [...inds].sort((p, q) => q.chg - p.chg); pane.replaceChildren(...(bySprout(i0, i => i.name) ?? i0).map(i => card('#/ch/i/' + enc(i.name), thumb(i.v, '20일', {x: i.chg}), i.name + ' 업종, 20거래일 ' + pct(i.chg), '회사 ' + num(i.n) + '곳 · 큰 회사는 크게 ' + pct(i.cwChg), first(i.name)))); }; // 싹 먼저 차례(사장님 2026-10-22 09:41 「어그래」 · 업종 칩과 같은 표) — 테마 자료가 없을 때만 옛 차례
  for (const [t, label] of tabs) {
    const b = h('button', {type: 'button', role: 'tab', 'aria-selected': String(t === 'co'), text: label});
    b.addEventListener('click', () => { for (const x of tabBar.children) x.setAttribute('aria-selected', String(x === b)); (t === 'co' ? showCo : showInd)(); });
    tabBar.append(b);
  }
  if (ready('chx')) { try { const d = await page('chx', a); if (d?.nodes?.length) nodes.push(h('section', {class: 'chx-d'}, ...d.nodes)); } catch (e) { console.error(e); nodes.push(h('p', {class: 'empty', text: '? 채널 자세히를 그리지 못했어요.'})); } }
  nodes.push(tabBar, pane); if (!ready('chx')) nodes.push(h('a', {class: 'more', href: kind === 'g' ? '/atlas/#/g/' + enc(ch.id) : '/atlas/#/i/' + enc(ch.name), text: '옛 화면 7단으로 보기 ›'}));
  showCo();
  return {title: name, nodes};
}

/* 관심(옛 구독 · 사장님 2026-10-17 21:10 [2] 4 · 8) — 담은 업종 · 갈래와 담은 회사(옛 「나중에 볼 것」)를 한 화면에
   차례: 담은 업종 · 갈래 동그라미 줄 → 관심 회사(줄마다 관심 담음 단추) → 업종 · 갈래 새 소식(오늘 가장 많이 움직인 곳)
   기억 열쇠는 그대로(atlas:new:sub · atlas:new:later) · 이 기기에만 */
async function vSub() {
  await Promise.all([need('core'), need('mkt'), need('themeHome')]); // themeHome = 담은 업종의 테마 시계 자리 · 빈 관심의 싹 자리 셋(총정리 C24 · C25 — 첫 화면이 이미 받는 5KB)
  const X = ix(); if (!X) return {title: '관심', nodes: noData()};
  const ks = subs().filter(k => (k.startsWith('g:') && X.grp.has(k.slice(2))) || (k.startsWith('i:') && X.ind.has(k.slice(2))));
  const cos = laters().filter(c => X.co[c]);
  let Hm = null; try { Hm = await mod('hold'); } catch (e) { console.error(e); } // 가입 여부 · 소식 줄(p-hold — 2026-10-18 [4] 4 · [7] 7)
  const lead = h('p', {class: 'note'}), leadText = k => '회사 ' + num(cos.length) + '곳 · 업종 · 갈래 ' + num(ks.length) + '개 · ' + k;
  if (typeof Hm?.liveNote === 'function') Hm.liveNote(lead, leadText); else lead.textContent = leadText('이 기기에만 남아요.'); // 끝 말 = 가입 여부(가입 안 함 「이 기기에만 남아요.」 · 가입함 「카카오로 지켜요.」)
  const nodes = [h('h1', {class: 'h', text: '관심'}), lead];
  // 결(총정리 C25) — 담은 업종마다 지금 테마 시계 자리(큰 업종은 「큰 업종」) · 앞 여섯까지 · 테마 자료를 못 받으면 줄 없음
  if (ks.length && thHome()) {
    const zs = ks.slice(0, 6).map(k => (k.startsWith('g:') ? (X.grp.get(k.slice(2))?.name ?? '?') + ' 큰 업종' : k.slice(2) + ' ' + (TH_ZONES[thInd(k.slice(2))?.z] ?? '?'))), more = ks.length - zs.length;
    nodes.push(h('div', {class: 'c-lead'}, h('p', {class: 'c-lt', text: '담은 업종 ' + num(ks.length) + '곳 — ' + zs.join(' · ') + (more > 0 ? ' · 그 밖 ' + num(more) + '곳' : '')})));
  }
  // 동그라미 이름 — 업종은 이름 그대로 · 큰 업종은 이름 밑 「큰 업종」(같은 「반도체」 둘이 두 번 담은 것처럼 보이던 것 — 총정리 C25)
  if (ks.length) nodes.push(h('div', {class: 'avs'}, ks.map(k => { const nm = chanName(k), g = k.startsWith('g:'); return h('a', {href: chanHref(k)}, h('span', {class: 'av lg on', 'aria-hidden': 'true', text: first(nm)}), g ? h('small', {class: 'av-g'}, h('span', {text: nm.replace(/ 갈래$/, '')}), ' ', h('span', {text: '큰 업종'})) : h('small', {text: nm.replace(/ (갈래|업종)$/, '')})); })));
  if (ks.length && typeof Hm?.news === 'function') { try { const sb = await Hm.news(X, ks); if (sb) nodes.push(sb); } catch (e) { console.error(e); } } // [7] 7 소식 줄 — 담은 곳의 뽑힘 · 옮김 · 빠짐 · 오늘 가장 많이 움직인 곳을 날짜 새 것 먼저(오늘 가장 많이 움직인 곳 카드는 이 줄로 합침)
  // 관심 회사 — 줄 = 작은 선(20거래일) · 이름 · 업종 · 20거래일 % · 관심 담음(누르면 빼고 · 다시 누르면 담음)
  nodes.push(h('h2', {class: 'sec', text: '관심 회사'}));
  if (cos.length) {
    nodes.push(h('p', {class: 'note', text: md(X.mkt.asOf) + ' 장 마감 · 담은 차례예요.'}));
    for (const c of cos) {
      const o = X.co[c], x = c20(o);
      const kb = shareButtons({code: c, name: o.n, kind: 'share'}, {kakao: true}); // 카톡 단추 = 관심 담음 단추 오른쪽 끝(KB2 · 줄이 이미 고리와 단추를 형제로 둠)
      nodes.push(h('div', {class: 'chan wl', 'data-kkrow': kb ? 'sub.co' : null}, h('a', {href: '#/w/' + c}, h('span', {class: 'wl-th', 'aria-hidden': 'true'}, lineSvg(o.l, {w: 120, ht: 60, fill: false, sw: 3})),
        h('div', {}, h('b', {text: o.n}), h('small', {}, (o.i || '?') + ' · ', '20거래일 ', h('span', {class: cls(x) + ' wl-p', text: pct(x)})))), laterBtn(c, o.n, 'sub-btn'), kb));
    }
  } else nodes.push(h('p', {class: 'note', text: '회사 화면에서 「관심 담기」를 누르면 여기 모여요.'}));
  // 관심 업종 · 갈래
  nodes.push(h('h2', {class: 'sec', text: '관심 업종 · 갈래'}));
  if (!ks.length) {
    // 빈 관심(총정리 C24) — 결 「담은 업종이 없어요. 지금 싹 자리 업종부터 볼까요?」 → 기 싹 자리 셋(theme-home.json order.S · 점 많이 찬 차례 · 줄마다 관심 담기) → 승 「싹이 뭐예요? ›」 → 전 큰 업종 열은 접은 칸 안(줄 그대로)
    //   (옛 글은 「이미 오른 큰 업종」부터 권했음 — 본질 1 「될 듯한 곳」과 거꾸로) · 테마 자료를 못 받으면 옛 꼴 그대로
    const sp = (thHome()?.order?.S ?? []).filter(n => typeof n === 'string' && X.ind.has(n)).slice(0, 3);
    const big = [...X.core.groups].sort((a, b) => b.chg - a.chg).map(g => h('div', {class: 'chan'}, h('a', {href: '#/ch/g/' + enc(g.id)}, h('span', {class: 'av', 'aria-hidden': 'true', text: first(g.short || g.name)}), h('div', {}, h('b', {text: g.name + ' 갈래'}), h('small', {text: '20거래일 한 회사 한 표 ' + pct(g.chg)}))), subBtn('g:' + g.id, g.name + ' 갈래')));
    if (!sp.length) { nodes.push(h('p', {class: 'note', text: '아직 담은 업종 · 갈래가 없어요. 큰 갈래부터 담아 보세요.'}), ...big); return {title: '관심', nodes}; }
    nodes.push(h('div', {class: 'c-lead'}, h('p', {class: 'c-lt', text: '담은 업종이 없어요. 지금 싹 자리 업종부터 볼까요?'})));
    for (const n of sp) { const I = thInd(n); nodes.push(h('div', {class: 'chan'}, h('a', {href: '#/t/i/' + enc(n)}, h('span', {class: 'av', 'aria-hidden': 'true', text: first(n)}), h('div', {}, h('b', {text: n + ' 업종'}), h('small', {text: '싹 자리' + (Number.isFinite(I?.sc) ? ' · 점 ' + I.sc + '개' : '')}))), subBtn('i:' + n, n + ' 업종'))); }
    nodes.push(h('a', {class: 'more', href: '#/t/how', text: '싹이 뭐예요? ›'}), h('details', {class: 'hm-more sub-big'}, h('summary', {text: '큰 업종에서 고르기'}), ...big));
    return {title: '관심', nodes};
  }
  nodes.push(h('p', {class: 'note', text: md(X.mkt.asOf) + ' 장 마감 · 담은 업종 · 갈래 ' + ks.length + '개'}));
  for (const k of ks) {
    const ch = k.startsWith('g:') ? X.grp.get(k.slice(2)) : X.ind.get(k.slice(2));
    nodes.push(card(chanHref(k), thumb(ch.v, '20일', {x: ch.chg}), chanName(k) + ', 20거래일 한 회사 한 표 ' + pct(ch.chg), '큰 회사는 크게 ' + pct(ch.cwChg), first(chanName(k))));
  }
  return {title: '관심', nodes};
}

/** 쪽 모듈이 낸 것을 노드 목록으로 — {title, nodes} · 노드 하나 · 노드 목록 모두 받음 */
const asNodes = d => (d == null ? [] : d instanceof Node ? [d] : Array.isArray(d) ? d.filter(x => x instanceof Node) : Array.isArray(d.nodes) ? d.nodes.filter(x => x instanceof Node) : []);
/* 보유종목(옛 「나」 · 사장님 2026-10-17 21:10 [2] 5 · 9 · [3] 7 · 8 · [5])
   차례: 보유종목 점검(일꾼 D 의 p-hold render) → 사장님 편지(격언 열 가지 · 열면 고도리 · 친구 소개 · 상품권 — 그대로) → 바로 가기 → 본 기록
   옮긴 것: 왜 사? 기록 → 매매일지 화면 아래(p-why) · 「나중에 볼 것」 → 관심 칸 · 뺀 줄: 「왜 사? 열한 질문」(가운데 단추와 겹침 · 규칙 1) · 「구독한 채널」(아래 관심 단추와 겹침 · 규칙 1) */
async function vMe() {
  await Promise.all([need('core'), need('mkt')]);
  const X = ix(), hist = store.get(K_HIST, []).filter(c => X?.co?.[c]), nodes = [];
  let hold = [], Hm = null;
  try { Hm = await mod('hold'); hold = asNodes(await Hm.render()); } catch (e) { console.error(e); }
  if (!hold.some(n => n.matches?.('h1') || n.querySelector?.('h1'))) nodes.push(h('h1', {class: 'h', text: '보유종목'})); // 제목 = 탭 이름(규칙 2) — 모듈이 제목을 그리면 그것만
  if (hold.length) nodes.push(...hold);
  else nodes.push(h('p', {class: 'note', text: '? 보유종목 칸을 아직 열지 못했어요. 잠시 뒤 다시 열어 주세요.'}));
  const lw = h('div', {class: 'lw'}, m4letter()); // 사장님 편지(격언 열 가지 · 친구 소개 · 상품권) — 2026-10-17 17:54 명령 1 · 21:10 [2] 5 그대로(글은 손대지 않음)
  nodes.push(typeof Hm?.foldLetter === 'function' ? Hm.foldLetter(lw) : lw); // 첫 화면 ⅓ 높이로 접고 「펼치기」(2026-10-18 [7] 8 · p-hold foldLetter)
  // 바로 가기 = 내 것만(2026-10-18 [7] 9 · [4] 5 · 9 — 편지 여는 밤 · 기록 파일로 받기 · 가입한 사람만 탈퇴 · p-hold shortcuts) — 오늘 시장 · 급등 · 달력 · 조건 · 이야기 · 봉인 · 업데이트 · 도움말 고리는 뺌(첫 화면 칩 · 도움말 쪽으로)
  if (typeof Hm?.shortcuts === 'function') nodes.push(...Hm.shortcuts());
  else nodes.push(h('h2', {class: 'sec', text: '바로 가기'}), h('div', {class: 'lst'}, h('a', {href: '/letter.html'}, '편지 여는 밤', h('span', {text: '›'})))); // [2] 9 「편지 여는 밤은 보유종목의 바로 가기에 남겨라」
  // 본 기록(본 회사 열둘 · 이 기기에만) — 지우기는 본 기록만(관심 회사는 관심 칸에서 하나씩 뺌)
  nodes.push(h('h2', {class: 'sec', text: '본 기록'}), typeof Hm?.keepNote === 'function' ? Hm.keepNote() : h('p', {class: 'note', text: '이 기기에만 남아요. 이름도 열쇠도 받지 않아요.'})); // 가입한 사람에게만 「카카오로 지켜요.」(2026-10-18 [4] 4)
  if (hist.length) {
    nodes.push(h('div', {class: 'row'}, hist.slice(0, 12).map(c => kkWrap(h('a', {href: '#/w/' + c}, thumb(X.co[c].l, '20일', {x: c20(X.co[c])}), h('b', {text: X.co[c].n})), {code: c, name: X.co[c].n, kind: 'share'}, 'me.hist', 'kkr kkg')))); // 칸마다 카톡 단추(KB2)
    const clr = h('button', {type: 'button', text: '본 기록 지우기'}, h('span', {text: '›'}));
    clr.addEventListener('click', () => { if (!confirm(L('본 기록을 이 기기에서 지울까요?'))) return; store.set(K_HIST, []); toast('지웠어요.'); route(true); });
    nodes.push(h('div', {class: 'lst'}, clr));
  } else nodes.push(h('p', {class: 'note', text: '아직 본 회사가 없어요. 오늘 장에서 카드를 눌러 보세요.'}));
  nodes.push(h('p', {class: 'safe', text: '돌이는 지난 기록만 보여 줘요. 사고팔기를 권하지 않아요.'}));
  return {title: '보유종목', nodes};
}

/* 찾기 — 지금 아틀란스 찾기와 같은 잣대(한 글자 · 첫 글자 ㅅㅅㅈㅈ · 영어 글자 소리 · 종목 번호 · 영어로 볼 때는 영어 이름)
   목록 = 코스피 · 코스닥 모두(names.json — 펀드 · 우선주까지) · 회사 주식은 보는 화면 · 그 밖은 밖 칸(#/x/) · 못 받으면 회사만 */
const CHO = 'ㄱㄲㄴㄷㄸㄹㅁㅂㅃㅅㅆㅇㅈㅉㅊㅋㅌㅍㅎ';
const LAT = {A: '에이', B: '비', C: '씨', D: '디', E: '이', F: '에프', G: '지', H: '에이치', I: '아이', J: '제이', K: '케이', L: '엘', M: '엠', N: '엔', O: '오', P: '피', Q: '큐', R: '알', S: '에스', T: '티', U: '유', V: '브이', W: '더블유', X: '엑스', Y: '와이', Z: '지'};
const nrm = s => String(s).toLowerCase().replace(/[\s·.\-()&]/g, '');
const cho = s => [...s].map(ch => { const k = ch.charCodeAt(0) - 0xAC00; return k >= 0 && k < 11172 ? CHO[Math.floor(k / 588)] : ch; }).join('');
const sound = s => String(s).replace(/[A-Za-z]/g, ch => LAT[ch.toUpperCase()] || ch);
let NAMES = null;
async function needNames() {
  if (NAMES) return NAMES;
  const j = await getJson('names.json'); if (!Array.isArray(j?.rows)) return null;
  for (const r of j.rows) { const x = nrm(r.n), y = nrm(sound(r.n)), e = EN ? nrm(nameEn(r.n) ?? '') : ''; r._k = e ? [x, y, e] : [x, y]; r._c = [cho(x), cho(y)]; }
  return (NAMES = j);
}
let CO_ROWS = null;
/** 목록(names.json)을 못 받았을 때의 줄 — 회사 주식만(찾기와 같은 꼴 · 같은 자료면 한 번만 셈) */
function coRows(X) {
  if (CO_ROWS?.X !== X) CO_ROWS = {X, rows: Object.entries(X.co).map(([c, o]) => { const x = nrm(o.n), y = nrm(sound(o.n)); return {c, n: o.n, _k: [x, y], _c: [cho(x), cho(y)]}; })};
  return CO_ROWS.rows;
}
/** 찾기 잣대 하나(찾기 화면 · 매매일지 종목 고르기가 함께 씀 · 사장님 2026-10-17 21:10 [3] 1 「찾기와 같은 잣대를 써라」)
    → [{c, n, k, w?}] 찾기 화면과 같은 차례 · k = 'c' 회사 주식(보는 화면 #/w/<c>) · 'x' 그 밖(펀드 · 우선주 … · w = 까닭) · 'i' 업종(c = 업종 이름) · 'g' 큰 갈래(c = 갈래 번호)
    자료(core · mkt · names)를 아직 못 받았으면 받기를 시작하고 [] 또는 회사만 — 먼저 await NX.findReady() 하면 찾기 화면과 똑같음 */
function findMatch(q) {
  const X = ix();
  if (!X || !NAMES) findReady(); // 받기 시작(이미 받는 중이면 그대로)
  if (!X) return [];
  return findHits(X, NAMES?.rows ?? coRows(X), String(q ?? '')).map(x => (x.kind === 'g' ? {c: x.g.id, n: x.g.name, k: 'g'} : x.kind === 'i' ? {c: x.i.name, n: x.i.name, k: 'i'} : x.r.w ? {c: x.r.c, n: x.r.n, k: x.kind, w: x.r.w} : {c: x.r.c, n: x.r.n, k: x.kind}));
}
/** 찾기 자료가 다 왔나 — true = 찾기 화면과 같은 목록(펀드 · 우선주까지) · false = 회사만이거나 자료 없음 */
async function findReady() { await Promise.all([need('core'), need('mkt')]); await needNames(); return !!(ix() && NAMES); }
function findHits(X, rows, q) {
  const k = nrm(q); if (!k) return [];
  const onlyCho = /^[ㄱ-ㅎ]+$/.test(k), digits = /^\d+$/.test(k), codeK = !digits && /^\d[0-9a-z]{0,5}$/.test(k);
  const out = [];
  for (const g of X.grp.values()) if (nrm(g.name).includes(k) || nrm(g.short || '').includes(k) || (EN && nrm(L(g.name)).includes(k))) out.push({kind: 'g', score: nrm(g.name).startsWith(k) ? 0 : 1, g});
  for (const i of X.ind.values()) if (nrm(i.name).includes(k) || (onlyCho && cho(nrm(i.name)).includes(k)) || (EN && nrm(L(i.name)).includes(k))) out.push({kind: 'i', score: nrm(i.name).startsWith(k) ? 0 : 1, i});
  rows.forEach((r, ix) => {
    let sc = -1;
    if (digits) { if (r.c.startsWith(k)) sc = 0; }
    else if (codeK && r.c.toLowerCase().startsWith(k)) sc = 0;
    else if (onlyCho) { if (r._c.some(x => x.startsWith(k))) sc = 1; else if (r._c.some(x => x.includes(k))) sc = 3; }
    else if (r._k[0] === k) sc = -1.5; else if (r._k.some(x => x.startsWith(k))) sc = 0; else if (r._k.some(x => x.includes(k))) sc = 2;
    if (sc !== -1 || r._k[0] === k) out.push({kind: X.co[r.c] ? 'c' : 'x', score: sc + (X.co[r.c] ? 0 : 0.5), ix, r});
  });
  return out.sort((p, q2) => p.score - q2.score || ((p.ix ?? -1) - (q2.ix ?? -1)));
}
async function vFind(a) {
  await Promise.all([need('core'), need('mkt'), need('themeHome'), need('theme')]); // 테마 자료 = 업종 줄의 테마 시계 자리 · 점(총정리 A24 · 첫 화면 파일 + 업종 쪽 파일 · 회사 목록 names.json 보다 작음)
  const X = ix(); if (!X) return {title: '찾기', nodes: noData()};
  const N = await needNames();
  const rows = N?.rows ?? coRows(X);
  const inp = h('input', {type: 'search', placeholder: '회사 이름이나 번호, 업종', 'aria-label': '찾기', enterkeyhint: 'search', autocomplete: 'off', value: a || ''});
  const hits = h('div', {class: 'hits', role: 'list'});
  const coRow = c => { const o = X.co[c], a = h('a', {href: '#/w/' + c}, h('span', {class: 'nm', 'data-proper': '', text: o.n}), h('small', {text: (o.i || '?') + ' · 20거래일 ' + pct(c20(o))})), w = kkWrap(a, {code: c, name: o.n, kind: 'share'}, 'find.co', 'kkr kkh'); w.setAttribute('role', 'listitem'); return w; }; // 회사 줄 = 고리 + 카톡 단추(KB2 · 목록 칸은 둘을 감싼 줄)
  const run = () => {
    const q = inp.value.trim(); hits.replaceChildren();
    if (!q) {
      // 빈 화면 맨 위 = 최근 본 회사 셋(총정리 B4 — 매매일지 종목 고르기와 같은 기억 atlas:new:hist · 읽기만) → 안내 두 줄 그대로
      const hist = store.get(K_HIST, []).filter(c => typeof c === 'string' && X.co[c]).slice(0, 3);
      if (hist.length) hits.append(h('p', {class: 'note', text: '최근 본 회사'}), ...hist.map(coRow));
      hits.append(h('p', {class: 'note', text: '회사 ' + num(Object.keys(X.co).length) + '곳 · 업종 ' + X.ind.size + '개 · 큰 갈래 ' + X.grp.size + '개에서 찾아요.'}), h('p', {class: 'note', text: '이름 한 글자부터 찾아요. 첫 글자(ㅅㅅㅈㅈ)와 종목 번호도 돼요.' + (N ? ' 펀드 · 우선주까지 ' + num(rows.length) + '개 목록이에요.' : '')})); return;
    }
    const all = findMatch(q), top = all.slice(0, 40), out = []; let why = false; // 매매일지 종목 고르기와 같은 잣대(NX.findMatch)
    for (const x of top) {
      if (x.k === 'g') { const g = X.grp.get(x.c); out.push(h('a', {href: '#/ch/g/' + enc(g.id), role: 'listitem'}, g.name + ' 갈래', h('small', {text: '큰 갈래 · 회사 ' + num(g.n) + '곳 · 20거래일 ' + pct(g.chg)}))); }
      else if (x.k === 'i') { // 업종 줄 → 테마 업종 쪽(싹 찾기 길 · 총정리 A24) · 작은 글 = 테마 시계 자리 · 점(싹일 때) · 회사 수 — 테마 자료가 없으면 옛 채널 줄 그대로
        const i = X.ind.get(x.c), Z = thInd(i.name);
        out.push(Z ? h('a', {href: '#/t/i/' + enc(i.name), role: 'listitem'}, i.name + ' 업종', h('small', {text: TH_ZONES[Z.z] + ' 자리' + (Z.z === 'S' && Number.isFinite(Z.sc) ? ' · 점 ' + Z.sc + '개' : '') + ' · 회사 ' + num(i.n) + '곳'}))
          : h('a', {href: '#/ch/i/' + enc(i.name), role: 'listitem'}, i.name + ' 업종', h('small', {text: '업종 · 회사 ' + num(i.n) + '곳 · 20거래일 ' + pct(i.chg)})));
      }
      else if (x.k === 'c') { out.push(coRow(x.c)); if (!why) { why = true; out.push(h('a', {class: 'f-why', href: '#/why/' + enc(x.c), role: 'listitem'}, h('span', {text: '이 회사로 왜 사?'}), h('i', {'aria-hidden': 'true', text: '›'}))); } } // 찾은 맨 위 회사 줄에만 둘째 고리 — 사기 전에 열한 질문으로(총정리 B4 · 회사 화면 단추와 같은 말)
      else out.push(h('a', {href: oldOr('x', '#/x/' + enc(x.c)), role: 'listitem', class: 'xo'}, h('span', {class: 'nm', 'data-proper': '', text: x.n}), h('small', {text: x.w || '회사 주식 밖'})));
    }
    if (!out.length) out.push(h('p', {class: 'note', text: '「' + q + '」 — 찾는 이름이 없어요. ' + (N ? '코스피 · 코스닥 목록 ' + num(N.funnel?.universe ?? rows.length) + '개' + (N.collected ? '(' + N.collected + ' 모음 · 펀드 · 우선주까지)' : '') + ' 안에 없는 이름이에요. ' : '') + '띄어쓰기를 빼거나 첫 글자로도 찾아보세요.'}));
    else if (all.length > 40) out.push(h('p', {class: 'note', text: '찾은 것이 ' + num(all.length) + '개예요. 앞 40개만 보여요. 더 길게 써 보세요.'}));
    hits.append(...out);
  };
  inp.addEventListener('input', run); run();
  setTimeout(() => inp.focus({preventScroll: true}), 60);
  return {title: '찾기', nodes: [h('div', {class: 'find'}, inp), hits]};
}

/* 쪽 모듈 — 지금 아틀란스(/atlas/)의 쪽을 새 화면으로 옮긴 것(2026-10-17 04:23 「에이전트 총 동원해」)
   /next/p-<이름>.js 는 render(arg) → {title, nodes} 를 내보냄 · 모양은 /next/p-<이름>.css · 도구는 globalThis.NX
   READY 에 든 쪽만 새 화면으로 열고, 나머지는 지금 아틀란스로 넘김 · ?dev=1 이면 모든 모듈을 엶(옮기는 동안 시험) */
const READY = new Set(['co', 'past', 'rivals', 'grow', 'range', 'chx', 'surge', 'cond', 'talk', 'up', 'time', 'info', 'x', 'cal', 'today', 'why', 'gdr']); // why · gdr = 고도리 한 장 명령문(2026-10-17 17:54) // 옮긴 쪽(2026-10-17 · 쪽마다 check_<이름>.mjs 실패 0)
const DEV = (() => { try { return new URLSearchParams(location.search).get('dev') === '1'; } catch { return false; } })();
const ready = k => DEV || READY.has(k);
const oldOr = (k, hash) => (ready(k) ? hash : '/atlas/' + hash); // 새 화면이 있으면 새 화면 · 아니면 지금 아틀란스
const JC = {};
/** /atlas/data/ 아래 아무 파일 — 못 받으면 null(15초 뒤 다시) */
function getJson(name) {
  const c = JC[name]; if (c && (c.v !== null || Date.now() - c.t < 15000)) return c.p;
  const p = fetch('/atlas/data/' + name, {cache: 'no-cache'}).then(r => (r.ok ? r.json() : null)).catch(() => null).then(j => { JC[name].v = j; return j; });
  JC[name] = {p, v: undefined, t: Date.now()}; return p;
}
const MODS = {};
/** 쪽 모듈 하나(모양 .css 와 함께 한 번만 받음) · 못 받으면 다음에 다시 받아 봄(모양 고리는 한 번만 붙임) */
function mod(name) {
  if (!MODS[name]) {
    const href = '/next/p-' + name + '.css';
    if (![...document.querySelectorAll('link[rel="stylesheet"]')].some(x => x.getAttribute('href') === href)) { const l = document.createElement('link'); l.rel = 'stylesheet'; l.href = href; document.head.append(l); }
    MODS[name] = import('/next/p-' + name + '.js').catch(e => { delete MODS[name]; throw e; });
  }
  return MODS[name];
}
async function page(name, arg) { const m = await mod(name); await sheetReady('/next/p-' + name + '.css'); return m.render(arg); } // 모양 파일이 붙은 뒤 그림(늦어도 3초) — 느린 망에서 모양 없는 칸 · 좁아지기 전 넓이로 그린 그림이 한순간 넘치지 않게(2026-10-18 실제 사이트 검사 #/today 32px · #/ch 누르는 자리)
/** 고도리 칸 자료(/next/data/gdr.json · gdr-v1 · 사장님 2026-10-17 17:54 「고도리 만들기 · 한 장 명령문」) — 못 받으면 null(15초 뒤 다시) */
let GDR = null, gdrFail = 0, gdrP = null;
function gdr() {
  if (GDR) return Promise.resolve(GDR);
  if (gdrFail && Date.now() - gdrFail < 15000) return Promise.resolve(null);
  if (!gdrP) gdrP = fetch('/next/data/gdr.json', {cache: 'no-cache'}).then(r => (r.ok ? r.json() : null)).catch(() => null).then(j => { gdrP = null; if (j && Array.isArray(j.picks)) GDR = j; else gdrFail = Date.now(); return GDR; });
  return gdrP;
}
globalThis.NX = {h, sv, store, pct, p2, r1, cls, COLOR, num, md, mdN, chgOf, dayOf, c20, enc, first, odd, need, D, ix, condOf, dateAt, lineSvg, thumb, numThumb, card, toast, share, absUrl,
  subBtn, isSub, toggleSub, pushHist, laters, jo, hasB, a1, NB, kstNow, dayK, ampm, isDay, isTime, idxOk, gauge, getJson, RM, player, ready, page, chaps, chapNext, setTrail, noData, gdr, mod,
  findMatch, findReady, shareBox, laterBtn, isLater, toggleLater}; // findMatch · findReady = 찾기 잣대(매매일지 종목 고르기) · shareBox = 보내기 글상자(옛 share 대신) · laterBtn = 회사 관심 담기 단추
/* 길 — 화면마다 새 칸 · 늦게 끝난 앞 화면은 버림 · 돌아오면 그 자리 */
const VIEWS = {'': () => vHome('all'), f: a => vHome(a), w: vWatch, shorts: vShorts, ch: vChannel, sub: vSub, me: vMe, find: vFind};
VIEWS.t = a => page('theme', a); // 테마 시계 쪽(#/t/… · 사장님 2026-10-19 16:46 「36장」 · 16:54 「올려」 · p-theme.js)
VIEWS.game = a => page('game', a); // 가짜 돈 연습(사장님 2026-10-19 15:02 · 15:04 「일단해」 · p-game.js — PUBLIC 전에는 사장님 열쇠 기기만)
VIEWS.gift = a => page('gift', a); // 상품권 방(사장님 2026-10-22 03:38 「상품권 받는곳이 사용자자 이용많이 한 곳에 있어야 해 구글과 잡스라면 어떻개 하겠어 그렇게해」 · p-gift.js) — 모든 쪽 위 막대 금빛 선물 단추에서 한 번
VIEWS.dori = async () => { // 돌이 단추(아래 줄 넷째 · 사장님 2026-10-26 14:40 「어 넣어」 — 물음 「없어지는 셋은 돌이 단추 안에 넣을까요?」) — 시황 · 관심 · 보유종목 + 오늘 장 · 돌이 인사 · 고객센터
  const it = (label, href) => h('a', {class: 'dm-it', href}, h('b', {text: label}), h('i', {'aria-hidden': 'true', text: '›'}));
  return {title: NAME, nodes: [h('h1', {class: 'h', text: NAME}), h('nav', {class: 'dm', 'aria-label': NAME},
    it('한 달 뒤', '#/why/later'), it('보유종목', '#/me'), it('관심', '#/sub'), it('오늘 장', '#/'), it('시황', '#/shorts'), it(NAME + ' 인사', '#/t/hello'), it('고객센터', '#/help')), // 결(사장님 2026-10-27 01:50 「중요순 · 기승전결」) — 한 달 뒤 → 내 것 → 시장 → 인사 · 고객센터
    h('p', {class: 'safe', text: josa(NAME, '는') + ' 지난 기록만 보여 줘요. 사고팔기를 권하지 않아요.'})]};
};
VIEWS.help = a => page('help', a); // 고객센터(사장님 2026-10-21 22:54 · 22:55 「피드백 남기는 공간이랑 QA남기는공간 고객센터 안내 공간」 · 23:09 · p-help.js) — 모든 기기 · 맨 아래 고리
VIEWS.admin = a => page('admin', a); // 관리자 화면(사장님 2026-10-19 13:54 「관리자 페이지도 있어야 해」 · 사장님 열쇠 기기만 · p-admin.js)
VIEWS.jinhwa = a => page('jinhwa', a); import('/next/tally.js').then(m => m.tally('visit')).catch(() => {}); // 진화 쪽 길(사장님 2026-10-18 22:45 「진화 탭을 상단에 만들어」 · 22:46 「모든 사람들」 · 일꾼 KM) — 모든 기기가 엶 · 단추는 p-jinhwa 가 사장님 열쇠 기기에서만 그림 · 합계 칸 참고 「연 수」 쪽마다 한 번(일꾼 KD)
/* 위 막대 「진화」 단추(일꾼 KM · 2026-10-18 22:45) — 모든 사람 · 44px · 찾기 단추 앞 · 그 쪽이면 aria-current */
const jhBtn = h('a', {class: 'tbtn', id: 'jhBtn', href: '#/jinhwa', text: '진화'});
$('.top #langBtn')?.before(jhBtn);
/* 위 막대 금빛 선물 단추(사장님 2026-10-22 03:38 「상품권 받는곳이 사용자자 이용많이 한 곳에 있어야 해 구글과 잡스라면 어떻개 하겠어 그렇게해」 · order-0338)
   구글 = 사람이 어느 쪽에 있든 늘 보이는 자리(모든 쪽 위 막대)에서 한 번에 상품권 방(#/gift) · 잡스 = 글 없이 금빛 선물 그림 하나 · 진화 단추 옆
   글이 없어 첫 화면 글자 잣대 · 테마 시계 자리를 건드리지 않음 · 320 폭에서도 넘침 0(이름 칸이 줄어 듦 · 2026-10-22 이 방에서 잼) */
const giftBtn = h('a', {class: 'ibtn tgift', id: 'giftBtn', href: '#/gift', 'aria-label': '상품권 받기 — 친구 3명 소개하고 우주 영상 1분 보기'}, giftIcon());
jhBtn.after(giftBtn);
/* 아래 단추 다섯(사장님 2026-10-17 21:10 [2] · 규칙 2 「탭 이름 = 화면 제목 · 숫자 없음」) — data-tab 값 → 그 탭 이름(창 제목) */
const TABS = {'': 'home', f: 'home', shorts: 'shorts', why: 'why', sub: 'sub', me: 'me'};
const TAB_NAME = {home: '오늘 장', shorts: '시황', why: '매매일지', sub: '관심', me: '보유종목'};
const DOCK = {dori: 'dori', shorts: 'dori', sub: 'dori', me: 'dori', help: 'dori'}; // 아래 단추 넷(꽃 될 회사 · 지난 기록 · 왜 사? · 돌이 — 기승전결 · 사장님 2026-10-27 01:50 · 02:15 · 옛 넷 2026-10-26 14:40 왜 사? · 한 달 뒤 · 지난 기록 · 돌이) · 창 제목은 위 TAB_NAME 그대로(쪽 이름)
const OLD_KINDS = new Set(['surge', 'cal', 'cond', 'talk', 'up', 'time', 'x', 'info', 'today', 'why', 'gdr']); // 아직 지금 아틀란스(/atlas/)에서 여는 쪽
/* 흰 판(사장님 2026-10-19 02:03 · 올리기 ① 「색과 첫 화면」) — html.white 는 첫 화면(#/ · 칩 없는 '' 길)에서만 · 다른 길은 뗌 · 창 위 띠 색(theme-color)도 같이
   index.html 이 white 로 시작(첫 그림이 늦지 않게) → 여기서 곧바로 길에 맞춤 → 화면을 바꿀 때마다 새 화면과 같은 순간에 바꿈 */
function whiteFor(k) {
  const on = true; // 2026-10-19 둘째 올림 — 다른 쪽도 흰 판(사장님 02:03 「둘로 올려라 … ② 다른 쪽」)
  document.documentElement.classList.toggle('white', on);
  document.documentElement.classList.add('clock'); // 돌 시계 청록 판(사장님 2026-10-26 08:16 「디자인 이렇게 하라고 어 다 다시해」) — 흰 판 자리 규칙 위에 색만(site/next/clock.css)
  document.documentElement.classList.toggle('home', k === ''); // 첫 화면 모양(home.css)은 첫 화면 길에서만
  $('meta[name="theme-color"]')?.setAttribute('content', '#152D30'); // 청록 판 창 위 띠(2026-10-26) — 옛 흰 판 #FFFFFF // 맑은 연초록(2026-10-23 00:01 「맑은 은은한 녹색」) — 옛 숲 초록(2026-10-22 23:23) · 우주 밤하늘(2026-10-20 20:27)
}
whiteFor(parse(location.hash || '#/').k);
/** 글꼴 표 — 첫 화면을 그린 다음 그림 때에 한 번 붙임(그 전에는 기기 글꼴 · 받으면 바뀜 font-display: swap) */
let fontsOn = false;
const fontsAdd = () => { if (document.querySelector('link[href="/atlas/fonts.css"]')) return; const l = document.createElement('link'); l.rel = 'stylesheet'; l.href = '/atlas/fonts.css'; document.head.append(l); };
/** 본질 첫 줄 높이 잡기(2026-10-21 전체 검사 thumb 1/11 ③ 밀림 0.140) — 첫 화면은 기기 글꼴로 먼저 그리고 글꼴 표는 그린 뒤에 붙임(위 fontsLater)
 *  받은 글꼴이 기기 글꼴보다 좁으면 본질 첫 줄이 세 줄 → 두 줄로 줄어 그 아래가 모두 28px 위로 밀림(맨 아래 「전부 보기」를 보던 사람 눈앞에서)
 *  처음 그린 높이를 아래 한도로 잡아 둠 · 그 줄 글꼴이 다 왔고 그 줄이 화면 아래 밖일 때만 놓음 — 놓을 때 움직이는 것은 화면 밖뿐
 *  재기는 첫 그림 다음(그리기 길에 강제 배치를 더하지 않음 · 가장 큰 그림 2.5초) — fontsLater 보다 먼저 불러서 글꼴 표가 붙기 전에 잼 */
function holdEss(root) {
  const t = root.querySelector('.w-ess .ess-t'); if (!t || document.querySelector('link[href="/atlas/fonts.css"]')?.sheet) return;
  requestAnimationFrame(() => setTimeout(() => { if (t.isConnected && !document.querySelector('link[href="/atlas/fonts.css"]')?.sheet) hold(t); }, 0));
}
function hold(t) {
  t.style.minHeight = Math.ceil(t.getBoundingClientRect().height) + 'px';
  const ready = () => {
    if (!document.querySelector('link[href="/atlas/fonts.css"]')?.sheet || document.fonts?.status === 'loading') return false;
    try { const s = getComputedStyle(t); return document.fonts?.check?.(`${s.fontWeight} ${s.fontSize} ${s.fontFamily}`, t.textContent) !== false; } catch { return true; } // 못 재면 놓아도 됨(놓는 때는 어차피 화면 밖)
  };
  const stop = () => { removeEventListener('scroll', free); document.fonts?.removeEventListener?.('loadingdone', free); };
  const free = () => {
    if (!t.isConnected) return stop();
    if (ready() && t.getBoundingClientRect().top > innerHeight) { t.style.minHeight = ''; stop(); }
  };
  addEventListener('scroll', free, {passive: true});
  document.fonts?.addEventListener?.('loadingdone', free);
}
function fontsLater() {
  if (fontsOn) return; fontsOn = true;
  requestAnimationFrame(() => setTimeout(fontsAdd, 0));
}
// 첫 화면이 아닌 쪽으로 바로 열면 글꼴 표를 곧바로 붙임(옛 꼴 그대로 — 그린 뒤 글꼴이 바뀌어 보던 자리가 밀리지 않게 · 모든 쪽 검사 2026-10-19 03:40 보내기 검사)
if (parse(location.hash || '#/').k !== '') { fontsOn = true; fontsAdd(); }
/* 서른여섯 장 흐름(사장님 2026-10-19 16:46 「클릭을 하면 물 흐르듯 … 다음다음다음이 제대로 이어지게」 · 견본 flow36) — 테마 쪽(#/t/…)은 p-theme.js 가 「다음」을 그림 ·
   있는 쪽은 여기서 맨 아래에 「다음」 한 줄만 더함(그 쪽 칸 · 차례는 그대로) · 질문 중(#/why/<번호>) · 시황(#/shorts · 한 화면 넘김)은 더하지 않음 */
const FLOW_NEXT = {sub: ['알림', '#/t/alert'], why: ['한 달 뒤', '#/why/later'], 'why/later': ['돌이', '#/dori'], me: ['가짜 돈 연습', '#/game'], game: ['진화', '#/jinhwa'], jinhwa: ['오늘 정리', '#/t/today']}; // 기승전결 길(사장님 2026-10-27 01:50 · 02:15) — 꽃 될 회사 → 지난 기록 → 왜 사? → 한 달 뒤 → 돌이 · 옛 why → 보유종목
function flowFoot(k, a, root, my) {
  const n = a ? (FLOW_NEXT[k + '/' + a] ?? null) : FLOW_NEXT[k]; if (!n) return;
  mod('theme').then(async m => { await sheetReady('/next/p-theme.css'); if (my === seq && root.isConnected && !root.querySelector('.th-foot')) root.append(h('nav', {class: 'th-foot', 'aria-label': '다음 쪽'}, m.footBtn(n[0], n[1]))); }).catch(() => {});
}
let seq = 0, curHash = null;
const scrollMem = new Map();
/* 카톡 보내기 모든 곳(사장님 2026-10-25 06:06 · 12:00 「진짜모든곳에」 · kk-all.js) — 첫 화면은 다 그린 뒤 · 친구가 연 쪽 #/s/ 없음 · 매매일지는 맨 아래 하나 */
let KKM = null, kkStop = () => {};
const afterLoad = fn => { const go = () => (window.requestIdleCallback ? requestIdleCallback(fn, {timeout: 3000}) : setTimeout(fn, 800)); if (document.readyState === 'complete') go(); else addEventListener('load', go, {once: true}); };
const kkMod = () => (KKM ??= import('/next/kk-all.js').catch(e => { console.error(e); KKM = null; return null; }));
const kkMode = k => (k === 's' ? null : k === '' ? {page: false, boxes: true} : k === 'why' ? {page: 'end', boxes: false} : {page: 'end', boxes: true}); // 쪽 「카톡 보내기 · 선물 받기」 줄은 모든 쪽 맨 아래 = 결(사장님 2026-10-27 01:50 「중요순으로 해서 기승전결」 · 02:15 「첫호면부터 전체」 — 옛 제목 밑 'top') // 보유종목 · 진화 · 업데이트도 쪽 단추는 맨 아래(편지 · 첫 카드 그림 · 「요즘 바뀐 것」이 제목 바로 밑 한 화면 안 — check_hold · check_jinhwa · check_misc)
function parse(hash) {
  const m = /^#\/([a-z0-9]*)\/?(.*)$/.exec(hash || '#/'); if (!m) return {k: null};
  let a = m[2] ?? ''; try { a = decodeURIComponent(a); } catch { return {k: m[1], a: null, raw: m[2] ?? ''}; }
  return {k: m[1], a, raw: m[2] ?? ''};
}
async function route(force) {
  const hash = location.hash || '#/';
  if (curHash != null && curHash !== hash) scrollMem.set(curHash, window.scrollY);
  if (hash === curHash && !force) return;
  curHash = hash;
  const {k, a: a0, raw} = parse(hash);
  const a = a0 == null && OLD_KINDS.has(k) ? (k === 'x' ? '?' : '') : a0; // 깨진 주소(%E0 …) — 지금 아틀란스와 같게(급등 · 달력 · 조건은 처음 화면 · 밖 칸은 「?」)
  // 옛 주소(지금 아틀란스) — 새 화면이 있으면 그리로 · 아직 옮기지 않은 쪽은 /atlas/ 의 그 쪽으로(2026-10-17 04:04 「모두 바꿔」 — 단계마다 줄어듦)
  if (k === 'c' && a != null) { const [code, sub] = a.split('/'); if (sub) location.replace(['past', 'rivals', 'grow', 'range'].includes(sub) && ready(sub) ? '#/w/' + enc(code) + '/' + sub : '/atlas/' + hash); else location.replace('#/w/' + enc(code)); return; }
  if ((k === 'g' || k === 'i') && a != null) { location.replace('#/ch/' + k + '/' + enc(a)); return; }
  if (k === 'list') { location.replace('#/f/ind'); return; }
  if (k === '36') { location.replace('#/'); return; } // 지운 화면(규칙 55)
  if (OLD_KINDS.has(k) && !ready(k)) { location.replace('/atlas/' + hash); return; }
  // #/s/<보낸 것> = 친구가 받은 보내기(일꾼 C 의 p-share render) — #/s/ 뒤 글을 풀지 않은 그대로 한 덩이로 넘김(조각마다 풀기는 p-share · 글 속 % · / 도 그대로 닿게)
  const view = k === 's' ? (() => page('share', raw)) : OLD_KINDS.has(k) ? (arg => page(k, arg)) : VIEWS[k];
  if (!view || (a == null && k !== 's')) { location.replace('#/'); return; }
  const my = ++seq, root = $('#view');
  kkStop(); kkStop = () => {};
  const kkM = kkMode(k), kkP = k === '' || !kkM ? null : kkMod();
  for (const t of document.querySelectorAll('.tabs a, #jhBtn, #giftBtn')) t.removeAttribute('aria-current');
  if (k === 'jinhwa') jhBtn.setAttribute('aria-current', 'page');
  if (k === 'gift') giftBtn.setAttribute('aria-current', 'page');
  { const dk = k === 'why' ? 'why' : k === 't' && /^picks(\/|$)/.test(a ?? '') ? 'bloom' : k === 't' && /^pick(\/|$)/.test(a ?? '') ? 'rec' : DOCK[k]; if (dk) $('.tabs a[data-tab="' + dk + '"]')?.setAttribute('aria-current', 'page'); } // 아래 단추 넷 = 기승전결(사장님 2026-10-27 01:50 「돌이가 중요순으로 해서 기승전결이 되게해」 · 02:15 「첫호면부터 전체」) — 꽃 될 회사(승) · 지난 기록(승) · 왜 사?(전 · 한 달 뒤 포함) · 돌이(결) · 시황 · 관심 · 보유종목은 돌이 단추 안
  root.replaceChildren(h('p', {class: 'boot', text: '여는 중이에요…'}));
  let out;
  try { out = await view(a); }
  catch (e) { console.error(e); out = {title: '?', nodes: [h('p', {class: 'empty', text: '? 화면을 그리지 못했어요. 잠시 뒤 다시 열어 주세요.'})]}; }
  if (my !== seq) return; // 늦게 끝난 앞 화면
  const kkm = kkP ? await kkP : null;
  if (my !== seq) return;
  whiteFor(k);
  root.replaceChildren(...[...(out.nodes ?? [])].filter(x => x != null && x !== false)); // null 칸은 글자로 안 그림(2026-10-22 고장 찾기)
  if (kkM) { const o = {title: out.title ?? '', url: absUrl(hash), ...kkM};
    const run = m => { if (!m || my !== seq) return; try { m.sweep(root, o); kkStop = m.watch(root, o); } catch (e) { console.error(e); } };
    if (kkm) run(kkm); else afterLoad(() => kkMod().then(run)); }
  stoneArt(k, a, root);
  const cp = k === 'why' && !a ? mod('admin').then(m => { if (my === seq && root.isConnected && !root.querySelector('.cp-card')) root.append(m.couponCard()); }).catch(() => {}) : Promise.resolve(); // 커피 쿠폰 칸 — 매매일지 쪽 맨 아래(위 칸을 밀지 않음 · 2026-10-19 13:54)
  cp.then(() => flowFoot(k, a, root, my)); // 서른여섯 장 흐름 — 있는 쪽 맨 아래 「다음」 한 줄(쿠폰 칸 뒤)
  if (k === '') holdEss(root); // 첫 화면 — 글꼴 표가 아직이면 본질 첫 줄 높이를 잡아 둠(글꼴이 바뀌어도 아래가 안 밀리게)
  fontsLater();
  for (const r of root.querySelectorAll('.chaps.row')) { const n = r.querySelector('.now'); if (n) r.scrollLeft = Math.max(0, n.getBoundingClientRect().left - r.getBoundingClientRect().left + r.scrollLeft - 16); } // 4 ~ 7단 챕터 줄 — 지금 단이 보이게
  const tabName = k === 'why' && a === 'later' ? '한 달 뒤' : k !== 'f' && TABS[k] ? TAB_NAME[TABS[k]] : null; // 탭 화면(오늘 장 · 시황 · 매매일지 · 관심 · 보유종목)은 창 제목 = 탭 이름(규칙 2) · 칩 화면은 칩 이름
  document.title = L((tabName ?? out.title) + ' · ' + NAME); // 영어면 창 제목도(엔진은 body 만 봄)
  glossView(root); // 낱말표(site/next/glossary.js) — 한국어면 이 화면 · 창 제목 · 뒤에 그려지는 칸의 옛 낱말을 바꿈 · 영어면 영어 엔진 뒤에 「20 trading days」만
  enPrivacy(); // 영어면 처리방침 고리를 영어 칸(#en)으로(총정리 D23)
  document.body.classList.toggle('noscroll', !!out.noScroll);
  window.scrollTo(0, out.noScroll ? 0 : scrollMem.get(hash) ?? 0);
}
/* 돌 그림(사장님 2026-10-19 10:21 「1번으로 하자 그래서 전체 디자인을 해봐」 · 10:31 「이제 실제로 만들어 이기준으로」 · 시안 platform3 열세 장)
   화면 맨 위 큰 제목(첫 h1) 오른쪽에 그 화면의 돌 그림 한 장(/media/stone/<이름>.svg · 꾸밈 그림 · 읽지 않음) · 첫 화면은 vHomeAll 이 직접 그림 · 그림이 없는 쪽은 그대로
   입체 · 그림자는 이 그림 파일 안에만(사장님 10:12 「다써」) — 글 · 단추는 평평 */
const STONE = {shorts: 'shorts', today: 'today', surge: 'surge', sub: 'sub', me: 'me', cal: 'cal', cond: 'cond', jinhwa: 'jinhwa', help: 'why-q1', gift: 'why-q1'}; // help = 고객센터(빈 돌판 — 쓰는 곳)
function stoneArt(k, a, root) {
  const n = k === 'why' ? (a ? 'why-q1' : 'why') : k === 'w' ? (a && !a.includes('/') ? 'company' : null) : STONE[k];
  if (n === 'shorts') { const sh = root.querySelector('.shorts'); if (sh && !sh.querySelector('.st-art')) sh.append(h('img', {class: 'st-art st-abs', src: '/media/stone/shorts.svg', alt: '', width: 96, height: 77, decoding: 'async'})); return; } // 시황은 큰 제목이 없어 오른쪽 위 빈 자리에
  const t = n ? root.querySelector('h1') : null; if (!t || t.querySelector('.st-art')) return;
  t.classList.add('st-h'); if (k === 'why') t.classList.add('st-why'); if (k === 'why' || k === 'jinhwa') t.classList.add('st-sm'); // 작은 그림 — 매매일지 답 셋 · 진화 첫 카드 그림이 한 화면에 들게(check_why [5] 3 · check_jinhwa)
  if (n === 'company') { // 회사 쪽은 작은 돌 시계 + 이 회사 업종 자리 점(사장님 2026-10-26 08:16 「디자인 이렇게 하라고」 · 돌 시계 판 ④) — 자리를 못 셌으면 점 없이
    const z = root.querySelector('a.wz[data-z]')?.getAttribute('data-z'); const mc = miniClock(/^[SBWQ]$/.test(z ?? '') ? 'd' + z : null); mc.classList.add('st-art'); t.append(mc); return;
  }
  t.append(h('img', {class: 'st-art', src: '/media/stone/' + n + '.svg', alt: '', width: 96, height: 77, decoding: 'async'}));
}
window.addEventListener('hashchange', e => { try { globalThis.NX_FROM = new URL(e.oldURL).hash; } catch { /* 옛 주소 못 읽음 */ } }); // 바로 전 길 — 고객센터 한마디의 「보던 화면 이름」(p-help.js · 첫 마디만)
window.addEventListener('hashchange', () => route());
$('#findBtn')?.replaceChildren(icon('search'));
/* 글씨 크기 — 지금 아틀란스와 같은 세 칸(보통 · 크게 · 아주 크게)과 같은 기억(atlas:font) · 화면 칸을 통째로 키움(app.css html.f2 · f3) */
const FONTS = ['보통', '크게', '아주 크게'];
let fontK = (() => { try { const k = +localStorage.getItem('atlas:font'); return k === 1 || k === 2 ? k : 0; } catch { return 0; } })();
function setFont(k) { fontK = k; const r = document.documentElement; r.classList.toggle('f2', k === 1); r.classList.toggle('f3', k === 2); $('#fontBtn')?.setAttribute('aria-label', '글씨 크기 바꾸기 (지금 ' + FONTS[k] + ')'); try { localStorage.setItem('atlas:font', String(k)); } catch { /* 기억 못 함 */ } }
setFont(fontK);
$('#fontBtn')?.addEventListener('click', () => { setFont((fontK + 1) % 3); toast('글씨 ' + FONTS[fontK]); });
/* 영어 — 지금 아틀란스 영어 엔진(/atlas/i18n.js · 규칙 71 · 그려진 한국어를 사전 틀로 바꿈 · 기억 atlas:lang 그대로)을 새 화면에도
   EN_NEXT 가 false 인 동안(새 화면 글의 사전이 차기 전)은 지금 아틀란스 영어 판으로 넘김 · ?dev=1 이면 새 화면 영어를 시험으로 엶 */
const EN_NEXT = true; // 2026-10-17 새 화면 글 사전 다 참(next_en_check 실패 0) — 영어도 새 아틀란스로
/* 지구 단추 뒤 돌아오는 길(총정리 2026-10-22 A23 — 한 번 누르면 계속 영어 · 그림뿐이라 돌아오는 길을 모름)
   읽어 주는 이름 = 갈 말(「영어로 보기」 · 영어 화면은 「한국어로 보기」) · 바꾼 그 순간의 첫 화면에만 두 말 알림 한 줄(주소 표시 sw=1 — 새 저장 열쇠 0 · 띄운 뒤 주소에서 지움) · 단추 그림 · 위 막대 그대로 */
const LANG_SW = (() => { try { return new URLSearchParams(location.search).get('sw') === '1'; } catch { return false; } })();
if (LANG_SW) { try { const u = new URL(location.href); u.searchParams.delete('sw'); history.replaceState(history.state, '', u.pathname + u.search + u.hash); } catch { /* 주소 못 고침 — 알림은 그대로 */ } }
$('#langBtn')?.setAttribute('aria-label', EN ? '한국어로 보기' : '영어로 보기');
if (EN_NEXT || DEV) $('#langBtn')?.addEventListener('click', e => {
  e.preventDefault();
  try { const u = new URL(location.href); u.searchParams.set('sw', '1'); history.replaceState(history.state, '', u.pathname + u.search + u.hash); } catch { /* 표시 없이 바꿈 */ }
  switchLang(EN ? 'ko' : 'en'); // 같은 주소(sw=1 포함)를 그 말로 다시 엶
});
function langTip() {
  if (!LANG_SW || !EN) return;
  const e = h('p', {class: 'toast lang-tip', role: 'status'}, h('span', {text: 'Tap 🌐 again for '}), h('span', {lang: 'ko', text: '한국어'}), ' · ', h('span', {lang: 'ko', text: '🌐 를 다시 누르면 한국어'}));
  document.body.append(e); setTimeout(() => e.remove(), 6000);
}
/** 영어 화면 — 처리방침 고리(맨 아래 고리 · 상품권 방 · 고객센터)를 그 쪽 영어 칸(/privacy.html#en)으로(총정리 D23 — 처리방침 쪽은 스크립트가 없어 스스로 영어를 못 고름) · 그린 뒤 · 누를 때 한 번 더 */
function enPrivacy(root = document) { if (EN) for (const a of root.querySelectorAll('a[href="/privacy.html"]')) a.setAttribute('href', '/privacy.html#en'); }
if (EN) document.addEventListener('click', e => { const a = e.target?.closest?.('a[href="/privacy.html"]'); if (a) a.setAttribute('href', '/privacy.html#en'); }, true);
if (EN && !(EN_NEXT || DEV)) location.replace('/atlas/?lang=en' + (location.hash || '#/'));
else {
  if (EN) { const l = document.createElement('link'); l.rel = 'stylesheet'; l.href = '/next/en.css'; document.head.append(l); await startI18n(); }
  enPrivacy(); // 맨 아래 고리(쪽 밖)
  const r0 = route(); r0.then(langTip, langTip);
  /* 카카오 모듈(가입 · 공유 · 조용한 로그인 · kakao.js 32KB — 예전엔 index.html 이 app.js 와 함께 받음) — 첫 화면 길은 첫 그림 뒤에(느린 4G 가장 큰 그림 2.5초 · 큰 검사 gift-kakao 4/11 2508ms · 2026-10-25) · 다른 길은 바로(보유종목 쪽 가입 꼴) */
  { let kd = false; const kk = () => { if (kd) return; kd = true; import('/next/kakao.js').catch(e => console.error(e)); };
    if (/^#?\/?$/.test(location.hash)) r0.finally(() => { requestAnimationFrame(() => setTimeout(kk, 0)); setTimeout(kk, 1500); }); else kk(); }
  /* 친구 소개 세기(사장님 2026-10-25 13:40 · gift-ref.js) — 다 그린 뒤 */
  afterLoad(() => import('/next/gift-ref.js').then(m => { GR = m; m.visit().catch(() => {}); m.ref().catch(() => {}); }).catch(() => {}));
}
