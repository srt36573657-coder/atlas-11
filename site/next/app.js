/* 새 아틀란스(시험판 /next/) — 유튜브 뼈대(홈 · 보는 화면 · 쇼츠 · 채널 · 구독 · 나 · 최초 공개) + 잡스 방식(한 화면 한 가지 · 손가락으로 바로 · 내용이 주인공)
   사장님 2026-10-17(싱가포르) 02:22 「구글이 유투브를 만들었잖아 그 구조 그리고 그본질을 중심에 둔다 … 잡스가 애플 스마트폰을 만들었던 사고방식과 ui/ux를 방식으로 … 아틀란스응 아주 대 혁식」
   · 02:24 「가」(한 가지를 일곱 화면으로) · 02:38 「정교하게 만들어라」 · 규칙 74 · 설계 기록 docs/design/new-tube-2026-10-17.md
   자료 = 지금 아틀란스 파일 그대로(/atlas/data/*.json) · 7단은 지금 아틀란스 화면으로 이어 줌(/#/g · /#/i · /#/c/<번호>/…) · 앞날 말 없음 · 사고팔기 권하지 않음
   보는 기계 기억(구독 · 본 기록 · 나중에 볼 것)은 이 기기에만(localStorage · 서버에 안 감) · 글은 textContent 로만(보안 규칙 안 — 안에 쓴 스크립트 · 꾸밈 없음) */
import {ON as EN, startI18n, switchLang, nameEn, t as L} from '/next/i18n.js'; // 새 화면 제 영어 엔진 · 사전(/next/i18n/ — 2026-10-17 15:54 「예전 아트란스는 앞으로 어떠한 작업도 하지 말아라」로 /atlas/ 와 떼어 냄)
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
const COLOR = {up: '#FF5A65', dn: '#5B96FF', fl: '#8E959F', q: '#E9B949'};
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
const FILES = {core: 'core.json', mkt: 'mkt.json', home: 'home.json', surge: 'surge.json', cond: 'cond.json'};
const D = {}, failAt = {}, inflight = {};
function need(k) {
  if (D[k] != null) return Promise.resolve(D[k]);
  if (failAt[k] && Date.now() - failAt[k] < 15000) return Promise.resolve(null);
  if (!inflight[k]) inflight[k] = fetch('/atlas/data/' + FILES[k], {cache: 'no-cache'}).then(r => r.ok ? r.json() : null).catch(() => null)
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
async function share(title, url) {
  try { if (navigator.share) { await navigator.share({title, url}); return; } await navigator.clipboard.writeText(url); toast('주소를 담았어요. 붙여 넣어 보내세요.'); }
  catch (e) { if (e?.name !== 'AbortError') toast('보내기를 열지 못했어요.'); }
}
const absUrl = hash => location.origin + '/' + hash;

/* 구독 · 본 기록 · 나중에 볼 것(이 기기에만) */
const subs = () => store.get(K_SUB, []).filter(x => typeof x === 'string');
const isSub = key => subs().includes(key);
function toggleSub(key) { const s = subs(), on = s.includes(key); const nx = on ? s.filter(x => x !== key) : [key, ...s].slice(0, 60); store.set(K_SUB, nx); return !on; }
function subBtn(key, name) {
  const b = h('button', {class: 'sub-btn', type: 'button', 'aria-pressed': String(isSub(key)), text: isSub(key) ? '구독함' : '구독'});
  b.addEventListener('click', e => { e.preventDefault(); const on = toggleSub(key); b.setAttribute('aria-pressed', String(on)); b.textContent = on ? '구독함' : '구독'; toast(on ? name + ' 구독했어요. 구독 칸에 모여요.' : name + ' 구독을 풀었어요.'); });
  return b;
}
function pushHist(code) { const s = store.get(K_HIST, []).filter(x => x !== code); store.set(K_HIST, [code, ...s].slice(0, 30)); }
const laters = () => store.get(K_LATER, []).filter(x => typeof x === 'string');
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
const HELLO_PROMO = '3명만 소개해도 스타벅스 상품권 1만원!';
const HELLO_MSG = ['고도리 주식 격언 열 가지','1. 쉬는 것도 투자다. 안 사는 날이 더 많아야 합니다.', '2. 잃지 않는 게 버는 거다. 돈을 불리기 전에 먼저 지킵니다.', '3. 사기 전에 팔 곳부터 정해라. 떨어지면 어디서 팔지 미리 정합니다.', '4. 모두가 웃을 때 나는 늦었다. 다들 좋다고 떠들면 이미 비싼 겁니다.', '5. 헷갈리면 안 사는 게 답이다. 애매하면 그냥 넘깁니다.', '6. 자신 없으면 조금만. 확신이 없으면 내 돈의 열에 하나까지만.', '7. 시장이 흔들리면 나는 멈춘다. 크게 출렁이는 날은 쉽니다.', '8. 손해는 짧게, 이익은 길게. 떨어지면 빨리 팔고, 오르면 오래 들고 갑니다.', '9. 돈이 가는 길을 따라가라. 돈이 몰리는 업종에서만 고릅니다.', '10. 기회는 찾아오는 거지, 만드는 게 아니다. 억지로 사지 말고 좋은 때를 기다립니다.'];
const INTRO_FLY = 4200, INTRO_LAND = 800; // 날기 시작 · 나는 때(합 5초 = 보드리 5초 · 규칙 66)
let helloIntro = true;
const ICON2 = {
  send: () => { const s = sv('svg', {width: 22, height: 22, viewBox: '0 0 24 24', 'aria-hidden': 'true'}); s.append(sv('path', {d: 'M3 11.5 21 4l-7.5 18-2.5-7.5z', fill: 'none', stroke: 'currentColor', 'stroke-width': 1.6, 'stroke-linejoin': 'round'}), sv('path', {d: 'm11 14.5 4-4', stroke: 'currentColor', 'stroke-width': 1.6, 'stroke-linecap': 'round'})); return s; },
  gift: () => { const s = sv('svg', {class: 'm4-gi', width: 22, height: 22, viewBox: '0 0 24 24', 'aria-hidden': 'true'}); s.append(sv('rect', {x: 3.5, y: 9, width: 17, height: 11.5, rx: 2, fill: 'none', stroke: 'currentColor', 'stroke-width': 1.6}), sv('path', {d: 'M3.5 13h17M12 9v11.5M12 9c-1.5-4-6-4-6-1.5S12 9 12 9zm0 0c1.5-4 6-4 6-1.5S12 9 12 9z', fill: 'none', stroke: 'currentColor', 'stroke-width': 1.6, 'stroke-linejoin': 'round'})); return s; },
};
/** 사장님 편지 + 친구에게 소개하기 + 상품권 줄 · 처음 열 때 한 번 보드리 5초(움직임 줄이기면 바로 글) */
function m4letter() {
  const intro = helloIntro && !RM.matches; helloIntro = false;
  const msg = h('span', {class: 'hmsg m4-msg', lang: 'ko'}, ...HELLO_MSG.map(t => h('span', {class: 'hml', text: t})), h('i', {class: 'm4-moon', 'aria-hidden': 'true'}),
    h('img', {class: 'm4-hp', src: '/media/makbi-hello.svg', alt: '', width: 88, height: 110, decoding: 'async', 'aria-hidden': 'true'}));
  const stars = h('span', {class: 'm4-stars', 'aria-hidden': 'true'}, ...[0, 1, 2, 3, 4, 5, 6].map(() => h('i')));
  const cut = HELLO_PROMO.indexOf('스타벅스');
  const a = h('a', {class: 'hello m4-letter', href: '/hello.html'}, stars, msg,
    h('span', {class: 'm4-act'}, h('span', {class: 'm4-ic'}, ICON2.send()), h('span', {class: 'm4-aw'}, h('b', {text: '친구에게 소개하기'}), h('span', {}, '고도리 1분 ', h('span', {class: 'nb', text: '영상 · 보내기'}))), h('i', {class: 'm4-chev', 'aria-hidden': 'true', text: '›'})),
    h('span', {class: 'm4-gift'}, ICON2.gift(), h('span', {}, HELLO_PROMO.slice(0, cut), h('span', {class: 'nb', text: HELLO_PROMO.slice(cut)}))));
  if (!intro) return a;
  a.classList.add('intro');
  const pi = h('span', {class: 'hpi', 'aria-hidden': 'true'}, h('i', {class: 'm4-bm'}), h('img', {class: 'hpi-bird', src: '/media/makbi-hello.svg', alt: '', width: 240, height: 300, decoding: 'async'}),
    ...['b1', 'b2', 'b3'].map(k => h('b', {class: 'hpi-b ' + k, text: '고도리!'})));
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

/* 쇼츠 사실 — 사이트 자료로만 셈 · 날짜를 함께 · 이름은 이상한 선이면 부르지 않음 */
function shortFacts() {
  const X = ix(), out = [];
  if (!X) return out;
  const H = D.home, core = X.core, mkt = X.mkt;
  const kp = H?.idx?.KOSPI, kq = H?.idx?.KOSDAQ;
  if (kp && Number.isFinite(kp.day)) out.push({id: 'idx', k: md(kp.date) + (kp.live ? ' 장 중' : ' 장 마감'), l1: '코스피는 하루', big: p2(kp.day), bc: cls(kp.day),
    l2: kq && Number.isFinite(kq.day) ? '코스닥은 ' + p2(kq.day) + '이에요' : '코스닥은 ?', mini: (kp.rows || []).slice(-21).map(r => r[1]), ml: '선은 코스피 20거래일이에요', go: '#/w/KOSPI', tile: ['코스피 ' + p2(kp.day), md(kp.date)]});
  let up = 0, dn = 0, fl = 0;
  for (const c of Object.values(X.co)) { const x = dayOf(c.l); if (x == null) continue; if (x > 0) up++; else if (x < 0) dn++; else fl++; }
  if (up + dn + fl) out.push({id: 'breadth', k: md(mkt.asOf) + ' 장 마감', l1: '모든 회사 ' + num(up + dn + fl) + '곳 가운데', big: num(Math.max(up, dn)) + '곳', bc: up >= dn ? 'up' : 'dn',
    l2: up >= dn ? '올랐어요' : '내렸어요', ratio: {up, fl, dn}, go: null, tile: [num(Math.max(up, dn)) + '곳', up >= dn ? '오른 곳' : '내린 곳']});
  const r0 = core.rise?.list?.[0];
  if (r0) out.push({id: 'rise', k: '1주 동안 · ' + md(core.rise.from) + '부터', l1: r0.name, big: pct(r0.chg), bc: cls(r0.chg), l2: '1주 동안 오른 업종 ' + core.rise.list.length + '개 가운데 1등이에요', mini: r0.v, ml: '선은 1주예요', go: '#/ch/i/' + enc(r0.name), tile: [pct(r0.chg), r0.name]});
  const gs = [...(core.groups || [])].filter(g => Number.isFinite(g.chg)).sort((a, b) => b.chg - a.chg);
  if (gs.length) {
    const g = gs[0], w = gs[gs.length - 1];
    out.push({id: 'gtop', k: '20거래일 · ' + md(core.base) + '부터', l1: g.name + ' 갈래', big: pct(g.chg), bc: cls(g.chg), l2: '큰 갈래 ' + gs.length + '개 가운데 가장 많이 올랐어요', mini: g.v, ml: '선은 20거래일이에요', go: '#/ch/g/' + enc(g.id), tile: [pct(g.chg), g.short || g.name]});
    if (w !== g) out.push({id: 'glow', k: '20거래일 · ' + md(core.base) + '부터', l1: w.name + ' 갈래', big: pct(w.chg), bc: cls(w.chg), l2: '큰 갈래 가운데 가장 많이 내렸어요', mini: w.v, ml: '선은 20거래일이에요', go: '#/ch/g/' + enc(w.id)});
  }
  let best = null;
  for (const [code, c] of Object.entries(X.co)) { if (odd(c.l)) continue; const x = c20(c); if (x != null && (!best || x > best.x)) best = {code, c, x}; }
  if (best) out.push({id: 'riser', k: '20거래일 · ' + md(core.base) + '부터', l1: best.c.n, big: pct(best.x), bc: cls(best.x), l2: (best.c.i || '?') + ' · 모든 회사 가운데 가장 많이 올랐어요', mini: best.c.l, ml: '선은 20거래일이에요', go: '#/w/' + best.code});
  const S = D.surge, sm = Array.isArray(S?.members) ? [...S.members].filter(m => Number.isFinite(m.r5)).sort((a, b) => b.r5 - a.r5) : [];
  if (sm.length) out.push({id: 'surge', k: '5일 동안 · ' + md(S.asOf) + '까지', l1: '급등 칸 ' + sm.length + '곳 가운데 1등', big: pct(sm[0].r5), bc: cls(sm[0].r5), l2: sm[0].n + ' · ' + (sm[0].i || '?'), mini: sm[0].v, ml: '선은 5일이에요', go: '#/w/' + sm[0].c, tile: [pct(sm[0].r5), sm[0].n]});
  const s3 = H?.s365;
  if (s3 && Number.isFinite(s3.up) && Number.isFinite(s3.down)) out.push({id: 'pick', k: md(s3.date) + ' 하루', l1: '고른 곳 ' + s3.n + '곳 가운데', big: num(s3.up) + '곳', bc: 'up', l2: '올랐어요 · 내린 곳은 ' + num(s3.down) + '곳', ratio: {up: s3.up, fl: s3.flat || 0, dn: s3.down}, go: '#/f/pick'});
  const us = H?.us?.rows;
  if (Array.isArray(us) && us[0] && Number.isFinite(us[0].chg)) out.push({id: 'us', k: '미국 · ' + md(H.us.date), l1: us[0].name, big: p2(us[0].chg), bc: cls(us[0].chg), l2: us.slice(1, 3).map(r => r.name + ' ' + p2(r.chg)).join(' · '), go: '#/f/us'});
  const o = nextOpen();
  out.push({id: 'letter', k: '편지 여는 밤', l1: '다음 여는 밤은', big: md(o.d), bc: 'gd', l2: '금요일 밤 8시에 쓴 편지가 다 함께 열려요', go: '/letter.html', tile: ['금 8시', '편지 여는 밤']});
  return out;
}

/* ── 화면 ── 하나마다 { title, nodes } 를 돌려줌 · 늦게 끝난 앞 화면은 버림 */
const CHIPS = [['all', '전체'], ['rise', '오르는 업종'], ['surge', '급등'], ['lead', '대장주'], ['pick', '고른 곳'], ['group', '큰 갈래'], ['ind', '업종'], ['us', '미국']];
function chipsBar(on) { const ni = D.core?.industries?.length; return h('div', {class: 'chips', role: 'tablist', 'aria-label': '고르기'}, CHIPS.map(([id, t]) => h('a', {class: 'chip', href: id === 'all' ? '#/' : '#/f/' + id, 'aria-current': id === on ? 'page' : null, text: id === 'ind' && ni ? t + ' ' + ni : t}))); }
function noData(t = '자료') { return [h('p', {class: 'empty', text: '? ' + t + '를 받지 못했어요. 잠시 뒤 다시 열어 주세요.'})]; }

function idxCard(code) {
  const x = D.home?.idx?.[code]; if (!x || !Array.isArray(x.rows) || x.rows.length < 2) return null;
  const other = D.home.idx[code === 'KOSPI' ? 'KOSDAQ' : 'KOSPI'];
  return card('#/w/' + code, thumb(x.rows.map(r => r[1]), '3달', {play: true}), md(x.date) + ' ' + x.name + ' 하루 ' + p2(x.day) + (other ? ' · ' + other.name + ' ' + p2(other.day) : ''),
    '시장 · ' + (x.live ? '장 중' : '장 마감') + ' · 큰 숫자는 3달 동안', '시');
}
function coCard(code, badge = '20일', extra = null) {
  const c = ix()?.co?.[code]; if (!c) return null;
  return card('#/w/' + code, thumb(c.l, badge, {x: c20(c)}), c.n + ', 20거래일 동안 ' + pct(c20(c)), (c.i || '?') + ' 업종' + (extra ? ' · ' + extra : ''), first(c.i));
}
function riseCard(r) { const core = ix().core; return card('#/ch/i/' + enc(r.name), thumb(r.v, '1주', {x: r.chg}), r.name + ', 1주 동안 ' + pct(r.chg), '업종 채널 · ' + md(core.rise.from) + ' → ' + md(core.rise.to), first(r.name)); }
function groupCard(g) { return card('#/ch/g/' + enc(g.id), thumb(g.v, '20일', {x: g.chg}), g.name + ' 갈래, 20거래일 한 회사 한 표 ' + pct(g.chg), '회사 ' + num(g.n) + '곳 · 큰 회사는 크게 ' + pct(g.cwChg), first(g.short || g.name)); }
function surgeCard(m) { return card('#/w/' + m.c, thumb(m.v, '5일', {x: m.r5}), m.n + ', 5일 동안 ' + pct(m.r5), (m.i || '?') + ' · 급등 칸 · ' + md(D.surge?.asOf) + '까지', first(m.i)); }
function leadCard(code, o) { const c = ix().co[code]; return card('#/w/' + code, thumb(o.l5, '5일', {x: o.r5}), c.n + ', ' + (o.i || c.i) + ' 대장주 · 5일 ' + pct(o.r5), '업종 안 몸값 1등 · ' + md(D.cond.d5) + ' → ' + md(D.cond.asOf), first(o.i || c.i)); }
function shelf(fs) {
  const tiles = fs.map((f, i) => f.tile ? h('a', {class: 'st', href: '#/shorts/' + i, 'aria-label': '쇼츠 ' + f.l1}, h('b', {class: f.bc, text: f.tile[0]}), h('small', {text: f.tile[1]})) : null).filter(Boolean).slice(0, 4);
  return tiles.length ? [h('h2', {class: 'sec', text: '쇼츠 · 30초 시장'}), h('div', {class: 'shelf'}, tiles)] : [];
}

/** 첫 화면 가운데 — 「친구야, 왜 사?」 질문 열한 개(p-why) + 고도리 칸(p-gdr) · 모듈을 못 받으면 그 칸만 「?」 */
async function godoriHome() {
  try {
    const [W, P, G] = await Promise.all([mod('why'), mod('gdr'), gdr()]);
    return [W.whyCard(G), P.gdrSection(G)];
  } catch (e) { console.error(e); return [h('p', {class: 'empty', text: '? 질문 칸을 그리지 못했어요. 잠시 뒤 다시 열어 주세요.'})]; }
}
async function vHome(chip) {
  if (!CHIPS.some(c => c[0] === chip)) chip = 'all';
  await Promise.all([need('core'), need('mkt'), need('home'), (chip === 'all' || chip === 'surge') ? need('surge') : null, (chip === 'all' || chip === 'lead') ? need('cond') : null]);
  const X = ix(); if (!X) return {title: '홈', nodes: [...(chip === 'all' ? await godoriHome() : []), chipsBar(chip), ...noData()]};
  const core = X.core, nodes = chip === 'all' ? [] : [chipsBar(chip)], seen = new Set();
  const add = (key, el) => { if (!el || seen.has(key)) return; seen.add(key); nodes.push(el); };
  const rise = core.rise?.list || [], groups = [...(core.groups || [])].sort((a, b) => b.chg - a.chg);
  const sm = Array.isArray(D.surge?.members) ? [...D.surge.members].filter(m => X.co[m.c] && Number.isFinite(m.r5)).sort((a, b) => b.r5 - a.r5) : [];
  const C = condOf(), leads = C ? [...C.entries()].filter(([c, o]) => o.rk === 1 && X.co[c] && Array.isArray(o.l5) && Number.isFinite(o.r5)).sort((a, b) => b[1].r5 - a[1].r5 || a[0].localeCompare(b[0])) : [];
  const s3 = D.home?.s365, picks = Array.isArray(s3?.list) ? s3.list.filter(([c]) => X.co[c]) : [];
  if (chip === 'all') {
    // 첫 화면 붙박이(지금 아틀란스 그대로): 이야기 입구 → 큰 날 금빛 「!」 → 사장님 편지(격언 · 열면 보드리 · 친구 소개 · 상품권) → 고르기 칩 → 시장(오늘 한 줄)
    nodes.push(h('a', {class: 'tk-entry', href: oldOr('talk', '#/talk')}, h('b', {text: '오늘의 이야기'}), h('span', {text: '이야깃거리 · 대가 한마디 · 유튜브'}), h('i', {'aria-hidden': 'true', text: '›'})));
    const H = D.home, top = H && (idxOk(H.idx?.KOSPI) || idxOk(H.idx?.KOSDAQ)) ? idxAlerts(H) : [];
    if (top.length) nodes.push(h('div', {class: 'm4-top'}, ...top));
    nodes.push(...await godoriHome(), chipsBar(chip)); // 첫 화면 가운데 = 질문 열한 개 + 고도리 칸(2026-10-17 17:54 명령 1 · 2 — 사장님 편지는 「나」 칸으로)
    add('idx', idxCard('KOSPI'));
    if (H && (H.idx?.KOSPI || H.idx?.KOSDAQ)) {
      const w = whenOf(H, 'idx', (H.idx?.KOSPI ?? H.idx?.KOSDAQ)?.live);
      nodes.push(h('div', {class: 'today', 'aria-label': '오늘 한 줄'}, h('p', {class: 'tl'}, todayWords('코스피', idxOk(H.idx?.KOSPI), w).join(' ')), h('p', {class: 'tl'}, todayWords('코스닥', idxOk(H.idx?.KOSDAQ), w).join(' '))));
    }
    // 오늘 시장(지금 아틀란스 첫 화면의 지수 3달 · 오른 곳과 내린 곳 · 사고팔기 · 미국 · 고른 곳 · 큰 갈래 — 쪽 모듈 today · 2026-10-17 「모두 바꿔」)
    if (ready('today')) { try { const d = await page('today', 'home'); if (d?.nodes?.length) nodes.push(h('section', {class: 'today-d', 'aria-label': '오늘 시장'}, ...d.nodes)); } catch (e) { console.error(e); nodes.push(h('p', {class: 'empty', text: '? 오늘 시장을 그리지 못했어요.'})); } }
    if (rise[0]) add('i:' + rise[0].name, riseCard(rise[0]));
    for (const n of shelf(shortFacts())) nodes.push(n);
    if (sm[0]) add('c:' + sm[0].c, surgeCard(sm[0]));
    if (leads[0]) add('c:' + leads[0][0], leadCard(leads[0][0], leads[0][1]));
    if (picks[0]) add('c:' + picks[0][0], coCard(picks[0][0], '20일', '고른 곳 · ' + md(s3.date) + ' 하루 ' + pct(picks[0][1])));
    if (groups[0]) add('g:' + groups[0].id, groupCard(groups[0]));
    nodes.push(premCard());
    for (const r of rise.slice(1, 4)) add('i:' + r.name, riseCard(r));
    for (const m of sm.slice(1, 3)) add('c:' + m.c, surgeCard(m));
    add('idx2', idxCard('KOSDAQ'));
    if (groups.length > 1) add('g:' + groups[groups.length - 1].id, groupCard(groups[groups.length - 1]));
    const T = core.time;
    if (T?.opens?.[0]?.date) nodes.push(h('a', {class: 'm4-mr', href: oldOr('time', '#/time')}, h('span', {class: 'l', text: `봉인 ${T.id}호 — 3 · 5 · 10년 뒤 다시 엶`}), h('span', {class: 'k'}, '3년 뒤까지 ', h('b', {class: 'num', text: ddayText(T.opens[0].date)})), h('i', {class: 'm4-chev', 'aria-hidden': 'true', text: '›'})));
    nodes.push(h('section', {class: 'm4-seal-box', 'aria-label': '고도리 약속'}, h('span', {class: 'm4-seal', 'aria-hidden': 'true'}, h('i')), h('p', {class: 'm4-pr'}, h('span', {text: '고도리는 들은 것만 따라 말해요.'}), h('span', {text: '그래서 지난 기록만 보여요.'})), h('p', {class: 'm4-cap', text: '숫자는 네이버 증권에서 하루 4번 새로 받아요.'})));
    nodes.push(h('p', {class: 'safe', text: '고도리는 지난 기록만 보여 줘요. 사고팔기를 권하지 않아요.'}));
    return {title: '홈', nodes};
  }
  if (chip === 'rise') { nodes.push(h('p', {class: 'note', text: '1주 동안 오른 업종을 많이 오른 차례로 보여요(' + md(core.rise?.from) + ' → ' + md(core.rise?.to) + ').'})); if (!rise.length) nodes.push(h('p', {class: 'empty', text: '1주 동안 오른 업종이 없어요.'})); for (const r of rise) add('i:' + r.name, riseCard(r)); }
  else if (chip === 'surge') { if (!D.surge) return {title: '급등', nodes: [chipsBar(chip), ...noData('급등 자료')]}; nodes.push(h('p', {class: 'note', text: '급등 칸 ' + sm.length + '곳 · 5일 동안 많이 오른 차례 · ' + md(D.surge.asOf) + '까지'})); for (const m of sm) add('c:' + m.c, surgeCard(m)); nodes.push(h('a', {class: 'more', href: oldOr('surge', '#/surge'), text: '급등 다섯 칸 자세히 ›'})); }
  else if (chip === 'lead') { if (!C) return {title: '대장주', nodes: [chipsBar(chip), ...noData('몸값 자료')]}; nodes.push(h('p', {class: 'note', text: '업종마다 몸값 1등 ' + leads.length + '곳 · 5일 동안 많이 오른 차례'})); for (const [c, o] of leads) add('c:' + c, leadCard(c, o)); }
  else if (chip === 'pick') { if (!picks.length) return {title: '고른 곳', nodes: [chipsBar(chip), ...noData('고른 곳 자료')]}; nodes.push(h('p', {class: 'note', text: '고른 곳 ' + s3.n + '곳 · ' + md(s3.date) + ' 하루 많이 오른 차례'})); for (const [c, x] of picks) add('c:' + c, coCard(c, '20일', md(s3.date) + ' 하루 ' + pct(x))); }
  else if (chip === 'ind') { const inds = [...(core.industries || [])].sort((p, q) => q.chg - p.chg); nodes.push(h('p', {class: 'note', text: '업종 ' + inds.length + '개 · 20거래일 한 회사 한 표로 많이 오른 차례'})); for (const i of inds) add('i:' + i.name, card('#/ch/i/' + enc(i.name), thumb(i.v, '20일', {x: i.chg}), i.name + ' 업종, 20거래일 ' + pct(i.chg), '회사 ' + num(i.n) + '곳 · 큰 회사는 크게 ' + pct(i.cwChg), first(i.name))); }
  else if (chip === 'group') { nodes.push(h('p', {class: 'note', text: '큰 갈래 ' + groups.length + '개 · 20거래일 한 회사 한 표로 많이 오른 차례'})); for (const g of groups) add('g:' + g.id, groupCard(g)); }
  else if (chip === 'us') {
    const us = D.home?.us; if (!us?.rows?.length) return {title: '미국', nodes: [chipsBar(chip), ...noData('미국 자료')]};
    nodes.push(h('p', {class: 'note', text: '미국 마지막 장 · ' + md(us.date) + ' 마감'}));
    for (const r of us.rows) nodes.push(h('div', {class: 'card'}, numThumb(p2(r.chg), r.chg, r.name + ' · ' + num(r.close)), h('div', {class: 'meta'}, h('span', {class: 'av', 'aria-hidden': 'true', text: '미'}), h('div', {}, h('b', {text: r.name + ' 하루 ' + p2(r.chg)}), h('small', {text: md(r.date) + ' 마감 · 3달 낮은 값 ' + num(r.lo) + ' · 높은 값 ' + num(r.hi)})))));
  }
  return {title: CHIPS.find(c => c[0] === chip)[1], nodes};
}

/* 보는 화면 — 큰 선(그려지며 열림 · 손가락으로 끌면 그날 값) · 채널 · 챕터 일곱 = 7단 · 다음 볼 것 */
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
async function vWatch(a) {
  if (a === 'KOSPI' || a === 'KOSDAQ') return vIndex(a);
  { const [code, sub] = String(a).split('/'); if (sub) { if (['past', 'rivals', 'grow', 'range'].includes(sub) && ready(sub)) return page(sub, code); location.replace('/atlas/#/c/' + code + '/' + sub); return {title: '…', nodes: []}; } }
  await Promise.all([need('core'), need('mkt'), need('cond')]);
  const X = ix(); if (!X) return {title: '보는 화면', nodes: noData()};
  const c = X.co[a];
  if (!c) return {title: '없는 회사', nodes: [h('p', {class: 'empty', text: '? 이 번호의 회사를 찾지 못했어요.'}), h('a', {class: 'more', href: '#/find', text: '회사 찾기 ›'})]};
  pushHist(a);
  const l = c.l, n = l.length, x20 = c20(c), day = dayOf(l), I = X.ind.get(c.i), g = I ? X.grp.get(I.g) : null, Cd = condOf();
  const lab = i => { const d = dateAt(n, i); return (d ? md(d) : (i + 1) + '번째 날') + ' · 첫날보다 ' + pct((l[i] / l[0] - 1) * 100) + (i > 0 ? ' · 그날 ' + pct((l[i] / l[i - 1] - 1) * 100) : ''); };
  const d0 = dateAt(n, 0), d1 = dateAt(n, n - 1), tip0 = '20거래일 · ' + (d0 ? md(d0) : '?') + ' → ' + (d1 ? md(d1) : '?');
  const later = laters().includes(a);
  const laterB = h('button', {class: 'act', type: 'button', 'aria-pressed': String(later), text: later ? '담았어요' : '나중에 볼 것 담기'});
  laterB.addEventListener('click', () => { const s = laters(), on = !s.includes(a); store.set(K_LATER, on ? [a, ...s].slice(0, 60) : s.filter(x => x !== a)); laterB.setAttribute('aria-pressed', String(on)); laterB.textContent = on ? '담았어요' : '나중에 볼 것 담기'; toast(on ? '나 칸에 담았어요.' : '뺐어요.'); });
  const nodes = [
    player(l, lab, tip0),
    h('h1', {class: 'wt', text: c.n}),
    h('p', {class: 'ws'}, '20거래일 동안 ', h('b', {class: cls(x20), text: pct(x20)}), ' · 하루 ', h('b', {class: cls(day), text: pct(day)}), ' · ' + md(X.mkt.asOf) + ' 마감'),
    h('div', {class: 'chan'}, h('a', {href: '#/ch/i/' + enc(c.i)}, h('span', {class: 'av', 'aria-hidden': 'true', text: first(c.i)}), h('div', {}, h('b', {text: (c.i || '?') + ' 업종'}), h('small', {text: '회사 ' + (I ? num(I.n) : '?') + '곳' + (g ? ' · ' + g.short + ' 갈래' : '')}))), I ? subBtn('i:' + c.i, c.i + ' 업종') : null),
    h('div', {class: 'acts'}, laterB, h('button', {class: 'act', type: 'button', text: '보내기', onclick: () => share(L(c.n + ' · 고도리'), absUrl('#/w/' + a))}), h('a', {class: 'act', href: '/letter.html', text: '편지 쓰기'})),
    h('h2', {class: 'sec', text: '챕터 일곱 · 7단'}),
  ];
  nodes.push(chaps(a, '3'));
  nodes.push(h('p', {class: 'note', text: ready('past') ? '챕터를 누르면 그 단이 열려요.' : '1 · 2단은 새 채널로, 3 ~ 7단은 옛 화면의 그 단으로 가요.'}));
  if (ready('co')) { try { const d = await page('co', a); if (d?.nodes?.length) nodes.push(h('section', {class: 'co-d', id: 'd'}, ...d.nodes)); } catch (e) { console.error(e); nodes.push(h('p', {class: 'empty', text: '? 회사 자세히를 그리지 못했어요.'})); } }
  const mem = (I?.members || []).filter(m => m !== a && X.co[m]);
  if (mem.length) {
    const capOf = m => Cd?.get(m)?.cap ?? -1;
    mem.sort((p, q) => capOf(q) - capOf(p) || p.localeCompare(q));
    nodes.push(h('h2', {class: 'sec', text: '다음 볼 것 · 같은 업종'}), h('p', {class: 'note', text: Cd ? '몸값 큰 차례예요.' : '번호 차례예요.'}));
    const list = h('div', {});
    const row = m => { const o = X.co[m]; return h('a', {class: 'nx', href: '#/w/' + m}, thumb(o.l, '20일', {x: c20(o)}), h('div', {}, h('b', {text: o.n}), h('small', {text: '하루 ' + pct(dayOf(o.l))}))); };
    let shown = 0; const step = 6, more = h('button', {class: 'more', type: 'button'});
    const fill = () => { for (const m of mem.slice(shown, shown + step)) list.append(row(m)); shown = Math.min(mem.length, shown + step); more.textContent = '더 보기 · ' + (mem.length - shown) + '곳'; more.hidden = shown >= mem.length; };
    more.addEventListener('click', fill); fill();
    nodes.push(list, more);
  }
  return {title: c.n, nodes};
}
/* 챕터 일곱(7단) — 보는 화면 · 4 ~ 7단 쪽 모듈이 함께 씀(NX.chaps · NX.chapNext) · 지금 단은 금빛 테 */
function chapList(a) {
  const X = ix(), c = X?.co?.[a], I = c ? X.ind.get(c.i) : null, g = I ? X.grp.get(I.g) : null, base = '/atlas/#/c/' + enc(a), sub = k => (ready(k) ? '#/w/' + enc(a) + '/' + k : base + '/' + k);
  return [['1', '갈래', g ? '#/ch/g/' + enc(g.id) : null], ['2', '업종', I ? '#/ch/i/' + enc(I.name) : null], ['3', '회사', ready('co') ? '#/w/' + enc(a) : base], ['4', '지나온 길', sub('past')], ['5', '누구와 다투나', sub('rivals')], ['6', '앞으로 클까?', sub('grow')], ['7', '범위', sub('range')]];
}
function chaps(a, now) {
  const row = now !== '3'; // 4 ~ 7단 = 한 줄로 밀어 보기 · 보는 화면(3단) = 일곱 칸 모두
  const el = h('div', {class: 'chaps' + (row ? ' row' : ''), role: row ? 'navigation' : null, 'aria-label': row ? '챕터 일곱' : null}, chapList(a).map(([k, t, href]) => href ? h('a', {class: 'cp' + (k === now ? ' now' : ''), href, 'aria-current': k === now ? 'page' : null}, h('i', {text: k}), h('span', {text: t})) : h('span', {class: 'cp'}, h('i', {text: k}), h('span', {text: t + ' ?'}))));
  return el;
}
function chapNext(a, now) {
  const L = chapList(a), i = L.findIndex(x => x[0] === now), nx = L[i + 1];
  return nx?.[2] ? h('a', {class: 'more chap-next', href: nx[2], text: '다음 챕터 · ' + nx[0] + ' ' + nx[1] + ' ›'}) : h('a', {class: 'more chap-next', href: '#/w/' + enc(a), text: '회사로 돌아가기 ›'});
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

/* 쇼츠 — 위로 밀면 다음 사실 · 한 화면에 사실 하나 */
async function vShorts(a) {
  await Promise.all([need('core'), need('mkt'), need('home'), need('surge')]);
  const fs = shortFacts(); if (!fs.length) return {title: '쇼츠', nodes: noData()};
  const bar = h('div', {class: 'sbar', 'aria-hidden': 'true'}, fs.map(() => h('i', {})));
  const box = h('div', {class: 'shorts', tabindex: '0', 'aria-label': '쇼츠 · 위로 밀면 다음 사실'}, bar);
  fs.forEach((f, i) => {
    const side = h('div', {class: 'side'}, f.go ? h('a', {href: f.go, text: '보기'}) : null, h('button', {type: 'button', text: '보내기', onclick: () => share(L(f.l1 + ' ' + f.big + ' · 고도리'), absUrl('#/shorts/' + i))}));
    const sec = h('section', {class: 'sh', 'data-i': String(i), 'aria-label': (i + 1) + ' / ' + fs.length},
      h('p', {class: 'k', text: f.k}), h('p', {class: 'l1', text: f.l1}), h('p', {class: 'bg ' + (f.bc || ''), text: f.big}), h('p', {class: 'l2', text: f.l2}),
      f.ratio ? [h('div', {class: 'ratio', 'aria-hidden': 'true'}, h('i', {css: {flex: String(f.ratio.up), background: COLOR.up}}), h('i', {css: {flex: String(f.ratio.fl), background: COLOR.fl}}), h('i', {css: {flex: String(f.ratio.dn), background: COLOR.dn}})),
        h('p', {class: 'rl'}, h('span', {class: 'up', text: '오름 ' + num(f.ratio.up)}), h('span', {}, '그대로', ' ' + num(f.ratio.fl)), h('span', {class: 'dn', text: '내림 ' + num(f.ratio.dn)}))] : null,
      f.mini ? (() => { const s = lineSvg(f.mini, {w: 300, ht: 100, stretch: true}); s?.classList.add('mini'); return s; })() : null,
      f.mini && f.ml ? h('p', {class: 'ml', text: f.ml}) : null, // 작은 선의 기간 — 큰 숫자(하루)와 선(여러 날)의 색이 달라도 헷갈리지 않게
      h('div', {class: 'bub'}, h('img', {alt: '', src: '/media/makbi-icon.svg'}), h('span', {text: '고도리는 지난 기록만 따라 말해요'})),
      i === 0 ? h('p', {class: 'hint', text: '위로 밀면 다음 사실이에요'}) : null, side);
    box.append(sec);
  });
  const mark = i => bar.querySelectorAll('i').forEach((e, k) => e.classList.toggle('on', k <= i));
  const io = 'IntersectionObserver' in window ? new IntersectionObserver(es => { for (const e of es) if (e.isIntersecting) mark(+e.target.dataset.i); }, {root: box, threshold: 0.6}) : null;
  if (io) box.querySelectorAll('.sh').forEach(s => io.observe(s)); else mark(0);
  const start = Math.max(0, Math.min(fs.length - 1, parseInt(a, 10) || 0));
  requestAnimationFrame(() => { const t = box.querySelector('.sh[data-i="' + start + '"]'); if (t) box.scrollTop = t.offsetTop; mark(start); });
  return {title: '쇼츠', nodes: [box], noScroll: true};
}

/* 채널 — 업종(#/ch/i/<이름>) · 갈래(#/ch/g/<번호>) */
async function vChannel(a) {
  await Promise.all([need('core'), need('mkt'), need('cond')]);
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
  const nodes = [banner,
    h('div', {class: 'chhead'}, h('span', {class: 'av lg', 'aria-hidden': 'true', text: first(kind === 'g' ? ch.short || ch.name : ch.name)}), h('div', {}, h('h1', {text: name}),
      h('small', {text: '회사 ' + num(members.length) + '곳' + (kind === 'i' && g ? ' · ' + g.short + ' 갈래' : '') + (kind === 'g' ? ' · 업종 ' + inds.length + '개' : '')}))),
    h('div', {class: 'chan'}, h('span', {class: 'ws', text: '20거래일 · ' + md(X.core.base) + '부터'}), subBtn(key, name)),
    h('div', {class: 'stats'}, h('div', {}, h('small', {text: '한 회사 한 표'}), h('b', {class: cls(ch.chg), text: pct(ch.chg)})), h('div', {}, h('small', {text: '큰 회사는 크게'}), h('b', {class: cls(ch.cwChg), text: pct(ch.cwChg)})))];
  if (kind === 'g' && ch.say) nodes.push(h('p', {class: 'note', text: ch.say}));
  const tabs = kind === 'g' ? [['co', '회사'], ['ind', '업종']] : [['co', '회사']];
  const pane = h('div', {}), tabBar = h('div', {class: 'ctabs', role: 'tablist'});
  const showCo = () => {
    const grid = h('div', {class: 'grid'}); let shown = 0; const more = h('button', {class: 'more', type: 'button'});
    const fill = () => { for (const m of members.slice(shown, shown + 20)) { const o = X.co[m]; grid.append(h('a', {href: '#/w/' + m}, thumb(o.l, '20일', {x: c20(o)}), h('b', {text: o.n}), h('small', {text: kind === 'g' ? o.i : '하루 ' + pct(dayOf(o.l))}))); } shown = Math.min(members.length, shown + 20); more.textContent = '더 보기 · ' + (members.length - shown) + '곳'; more.hidden = shown >= members.length; };
    more.addEventListener('click', fill); fill();
    pane.replaceChildren(h('p', {class: 'note', text: Cd ? '몸값 큰 차례예요.' : '번호 차례예요.'}), grid, more);
  };
  const showInd = () => { pane.replaceChildren(...[...inds].sort((p, q) => q.chg - p.chg).map(i => card('#/ch/i/' + enc(i.name), thumb(i.v, '20일', {x: i.chg}), i.name + ' 업종, 20거래일 ' + pct(i.chg), '회사 ' + num(i.n) + '곳 · 큰 회사는 크게 ' + pct(i.cwChg), first(i.name)))); };
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

/* 구독 — 구독한 채널의 새 소식(오늘 가장 많이 움직인 곳) · 편지 여는 밤 */
async function vSub() {
  await Promise.all([need('core'), need('mkt')]);
  const X = ix(); if (!X) return {title: '구독', nodes: noData()};
  const ks = subs().filter(k => (k.startsWith('g:') && X.grp.has(k.slice(2))) || (k.startsWith('i:') && X.ind.has(k.slice(2))));
  const nodes = [h('h1', {class: 'h', text: '구독'})];
  if (!ks.length) {
    nodes.push(h('p', {class: 'note', text: '아직 구독한 채널이 없어요. 큰 갈래부터 구독해 보세요.'}));
    for (const g of [...X.core.groups].sort((a, b) => b.chg - a.chg)) nodes.push(h('div', {class: 'chan'}, h('a', {href: '#/ch/g/' + enc(g.id)}, h('span', {class: 'av', 'aria-hidden': 'true', text: first(g.short || g.name)}), h('div', {}, h('b', {text: g.name + ' 갈래'}), h('small', {text: '20거래일 한 회사 한 표 ' + pct(g.chg)}))), subBtn('g:' + g.id, g.name + ' 갈래')));
    nodes.push(premCard());
    return {title: '구독', nodes};
  }
  nodes.push(h('div', {class: 'avs'}, ks.map(k => { const nm = chanName(k); return h('a', {href: chanHref(k)}, h('span', {class: 'av lg on', 'aria-hidden': 'true', text: first(nm)}), h('small', {text: nm.replace(/ (갈래|업종)$/, '')})); })));
  nodes.push(h('p', {class: 'note', text: md(X.mkt.asOf) + ' 장 마감 · 구독한 채널 ' + ks.length + '개'}));
  for (const k of ks) {
    const ch = k.startsWith('g:') ? X.grp.get(k.slice(2)) : X.ind.get(k.slice(2));
    const mem = k.startsWith('g:') ? (ch.inds || []).flatMap(n => X.ind.get(n)?.members || []) : ch.members || [];
    let top = null;
    for (const m of mem) { const o = X.co[m]; if (!o || odd(o.l)) continue; const d = dayOf(o.l); if (d != null && (!top || Math.abs(d) > Math.abs(top.d))) top = {m, o, d}; }
    nodes.push(card(chanHref(k), thumb(ch.v, '20일', {x: ch.chg}), chanName(k) + ', 20거래일 한 회사 한 표 ' + pct(ch.chg), '큰 회사는 크게 ' + pct(ch.cwChg), first(chanName(k))));
    if (top) nodes.push(h('a', {class: 'nx', href: '#/w/' + top.m}, thumb(top.o.l, '20일', {x: c20(top.o)}), h('div', {}, h('small', {text: '오늘 가장 많이 움직인 곳'}), h('b', {text: top.o.n}), h('small', {}, '하루 ', h('b', {class: cls(top.d), text: pct(top.d)})))));
  }
  nodes.push(premCard());
  return {title: '구독', nodes};
}

/* 나 — 본 기록 · 나중에 볼 것 · 지금 아틀란스 바로 가기 */
async function vMe() {
  await Promise.all([need('core'), need('mkt')]);
  const X = ix(), hist = store.get(K_HIST, []).filter(c => X?.co?.[c]), lat = laters().filter(c => X?.co?.[c]), ns = subs().length;
  const nodes = [h('div', {class: 'lw'}, m4letter()), // 사장님 편지(격언 열 가지 · 친구 소개 · 상품권) — 2026-10-17 17:54 명령 1 「첫 화면 편지를 「나」 칸으로 옮겨라」
    h('div', {class: 'me'}, h('img', {alt: '', src: '/media/makbi-icon.svg'}), h('div', {}, h('b', {text: '내 기록'}), h('small', {text: '이 기기에만 남아요. 이름도 열쇠도 받지 않아요.'})))];
  try { const W = await mod('why'); nodes.push(W.meRecords()); } catch (e) { console.error(e); nodes.push(h('p', {class: 'empty', text: '? 왜 사? 기록을 그리지 못했어요.'})); } // 명령 13 — 날짜와 함께 쌓고 한 달 뒤 결과 · 지우지 않음
  nodes.push(h('h2', {class: 'sec', text: '본 기록'}));
  if (hist.length) nodes.push(h('div', {class: 'row'}, hist.slice(0, 12).map(c => h('a', {href: '#/w/' + c}, thumb(X.co[c].l, '20일', {x: c20(X.co[c])}), h('b', {text: X.co[c].n})))));
  else nodes.push(h('p', {class: 'note', text: '아직 본 회사가 없어요. 홈에서 카드를 눌러 보세요.'}));
  nodes.push(h('h2', {class: 'sec', text: '나중에 볼 것'}));
  if (lat.length) nodes.push(h('div', {class: 'lst'}, lat.map(c => h('a', {href: '#/w/' + c}, X.co[c].n, h('span', {class: cls(c20(X.co[c])), text: '20거래일 ' + pct(c20(X.co[c])) + ' ›'})))));
  else nodes.push(h('p', {class: 'note', text: '보는 화면에서 「나중에 볼 것 담기」를 누르면 여기 모여요.'}));
  nodes.push(h('h2', {class: 'sec', text: '바로 가기'}), h('div', {class: 'lst'},
    h('a', {href: '#/sub'}, '구독한 채널', h('span', {text: ns + '개 ›'})),
    h('a', {href: '#/why'}, '왜 사? 열한 질문', h('span', {text: '›'})),
    h('a', {href: '#/gdr'}, '고도리 칸 · 어떻게 골랐나', h('span', {text: '›'})),
    h('a', {href: '/letter.html'}, '편지 여는 밤', h('span', {text: '›'})),
    h('a', {href: oldOr('today', '#/today')}, '오늘 시장 · 지수 · 사고팔기 · 미국', h('span', {text: '›'})),
    h('a', {href: oldOr('surge', '#/surge')}, '급등 다섯 칸', h('span', {text: '›'})),
    h('a', {href: oldOr('cal', '#/cal')}, '달력 · 지켜보는 곳', h('span', {text: '›'})),
    h('a', {href: oldOr('cond', '#/cond')}, '조건 찾기', h('span', {text: '›'})),
    h('a', {href: oldOr('talk', '#/talk')}, '이야기 칸', h('span', {text: '›'})),
    h('a', {href: oldOr('time', '#/time')}, '봉인', h('span', {text: '›'})),
    h('a', {href: oldOr('up', '#/up')}, '업데이트 기록', h('span', {text: '›'})),
    h('a', {href: oldOr('info', '#/info')}, '도움말 · 이 사이트는?', h('span', {text: '›'}))));
  if (hist.length || lat.length) {
    const clr = h('button', {type: 'button', text: '본 기록 · 담은 것 지우기'}, h('span', {text: '›'}));
    clr.addEventListener('click', () => { if (!confirm(L('본 기록과 담은 것을 이 기기에서 지울까요?'))) return; store.set(K_HIST, []); store.set(K_LATER, []); toast('지웠어요.'); route(true); });
    nodes.push(h('div', {class: 'lst'}, clr));
  }
  nodes.push(h('p', {class: 'safe', text: '고도리는 지난 기록만 보여 줘요. 사고팔기를 권하지 않아요.'}));
  return {title: '나', nodes};
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
  await Promise.all([need('core'), need('mkt')]);
  const X = ix(); if (!X) return {title: '찾기', nodes: noData()};
  const N = await needNames();
  const rows = N?.rows ?? Object.entries(X.co).map(([c, o]) => { const x = nrm(o.n), y = nrm(sound(o.n)); return {c, n: o.n, _k: [x, y], _c: [cho(x), cho(y)]}; });
  const inp = h('input', {type: 'search', placeholder: '회사 이름이나 번호, 업종', 'aria-label': '찾기', enterkeyhint: 'search', autocomplete: 'off', value: a || ''});
  const hits = h('div', {class: 'hits', role: 'list'});
  const run = () => {
    const q = inp.value.trim(); hits.replaceChildren();
    if (!q) { hits.append(h('p', {class: 'note', text: '회사 ' + num(Object.keys(X.co).length) + '곳 · 업종 ' + X.ind.size + '개 · 큰 갈래 ' + X.grp.size + '개에서 찾아요.'}), h('p', {class: 'note', text: '이름 한 글자부터 찾아요. 첫 글자(ㅅㅅㅈㅈ)와 종목 번호도 돼요.' + (N ? ' 펀드 · 우선주까지 ' + num(rows.length) + '개 목록이에요.' : '')})); return; }
    const all = findHits(X, rows, q), top = all.slice(0, 40), out = [];
    for (const x of top) {
      if (x.kind === 'g') out.push(h('a', {href: '#/ch/g/' + enc(x.g.id), role: 'listitem'}, x.g.name + ' 갈래', h('small', {text: '큰 갈래 · 회사 ' + num(x.g.n) + '곳 · 20거래일 ' + pct(x.g.chg)})));
      else if (x.kind === 'i') out.push(h('a', {href: '#/ch/i/' + enc(x.i.name), role: 'listitem'}, x.i.name + ' 업종', h('small', {text: '업종 · 회사 ' + num(x.i.n) + '곳 · 20거래일 ' + pct(x.i.chg)})));
      else if (x.kind === 'c') { const o = X.co[x.r.c]; out.push(h('a', {href: '#/w/' + x.r.c, role: 'listitem'}, h('span', {class: 'nm', 'data-proper': '', text: o.n}), h('small', {text: (o.i || '?') + ' · 20거래일 ' + pct(c20(o))}))); }
      else out.push(h('a', {href: oldOr('x', '#/x/' + enc(x.r.c)), role: 'listitem', class: 'xo'}, h('span', {class: 'nm', 'data-proper': '', text: x.r.n}), h('small', {text: x.r.w || '회사 주식 밖'})));
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
/** 쪽 모듈 하나(모양 .css 와 함께 한 번만 받음) */
function mod(name) {
  if (!MODS[name]) {
    const l = document.createElement('link'); l.rel = 'stylesheet'; l.href = '/next/p-' + name + '.css'; document.head.append(l);
    MODS[name] = import('/next/p-' + name + '.js');
  }
  return MODS[name];
}
async function page(name, arg) { const m = await mod(name); return m.render(arg); }
/** 고도리 칸 자료(/next/data/gdr.json · gdr-v1 · 사장님 2026-10-17 17:54 「고도리 만들기 · 한 장 명령문」) — 못 받으면 null(15초 뒤 다시) */
let GDR = null, gdrFail = 0, gdrP = null;
function gdr() {
  if (GDR) return Promise.resolve(GDR);
  if (gdrFail && Date.now() - gdrFail < 15000) return Promise.resolve(null);
  if (!gdrP) gdrP = fetch('/next/data/gdr.json', {cache: 'no-cache'}).then(r => (r.ok ? r.json() : null)).catch(() => null).then(j => { gdrP = null; if (j && Array.isArray(j.picks)) GDR = j; else gdrFail = Date.now(); return GDR; });
  return gdrP;
}
globalThis.NX = {h, sv, store, pct, p2, r1, cls, COLOR, num, md, mdN, chgOf, dayOf, c20, enc, first, odd, need, D, ix, condOf, dateAt, lineSvg, thumb, numThumb, card, toast, share, absUrl,
  subBtn, isSub, toggleSub, pushHist, laters, jo, hasB, a1, NB, kstNow, dayK, ampm, isDay, isTime, idxOk, gauge, getJson, RM, player, ready, page, chaps, chapNext, noData, gdr, mod};
/* 길 — 화면마다 새 칸 · 늦게 끝난 앞 화면은 버림 · 돌아오면 그 자리 */
const VIEWS = {'': () => vHome('all'), f: a => vHome(a), w: vWatch, shorts: vShorts, ch: vChannel, sub: vSub, me: vMe, find: vFind};
const TABS = {'': 'home', f: 'home', shorts: 'shorts', sub: 'sub', me: 'me'};
const OLD_KINDS = new Set(['surge', 'cal', 'cond', 'talk', 'up', 'time', 'x', 'info', 'today', 'why', 'gdr']); // 아직 지금 아틀란스(/atlas/)에서 여는 쪽
let seq = 0, curHash = null;
const scrollMem = new Map();
function parse(hash) {
  const m = /^#\/([a-z0-9]*)\/?(.*)$/.exec(hash || '#/'); if (!m) return {k: null};
  let a = m[2] ?? ''; try { a = decodeURIComponent(a); } catch { return {k: m[1], a: null, raw: m[2]}; }
  return {k: m[1], a};
}
async function route(force) {
  const hash = location.hash || '#/';
  if (curHash != null && curHash !== hash) scrollMem.set(curHash, window.scrollY);
  if (hash === curHash && !force) return;
  curHash = hash;
  const {k, a: a0} = parse(hash);
  const a = a0 == null && OLD_KINDS.has(k) ? (k === 'x' ? '?' : '') : a0; // 깨진 주소(%E0 …) — 지금 아틀란스와 같게(급등 · 달력 · 조건은 처음 화면 · 밖 칸은 「?」)
  // 옛 주소(지금 아틀란스) — 새 화면이 있으면 그리로 · 아직 옮기지 않은 쪽은 /atlas/ 의 그 쪽으로(2026-10-17 04:04 「모두 바꿔」 — 단계마다 줄어듦)
  if (k === 'c' && a != null) { const [code, sub] = a.split('/'); if (sub) location.replace(['past', 'rivals', 'grow', 'range'].includes(sub) && ready(sub) ? '#/w/' + enc(code) + '/' + sub : '/atlas/' + hash); else location.replace('#/w/' + enc(code)); return; }
  if ((k === 'g' || k === 'i') && a != null) { location.replace('#/ch/' + k + '/' + enc(a)); return; }
  if (k === 'list') { location.replace('#/f/ind'); return; }
  if (k === '36') { location.replace('#/'); return; } // 지운 화면(규칙 55)
  if (OLD_KINDS.has(k) && !ready(k)) { location.replace('/atlas/' + hash); return; }
  const view = OLD_KINDS.has(k) ? (arg => page(k, arg)) : VIEWS[k];
  if (!view || a == null) { location.replace('#/'); return; }
  const my = ++seq, root = $('#view');
  for (const t of document.querySelectorAll('.tabs a')) t.removeAttribute('aria-current');
  if (TABS[k]) $('.tabs a[data-tab="' + TABS[k] + '"]')?.setAttribute('aria-current', 'page');
  root.replaceChildren(h('p', {class: 'boot', text: '여는 중이에요…'}));
  let out;
  try { out = await view(a); }
  catch (e) { console.error(e); out = {title: '?', nodes: [h('p', {class: 'empty', text: '? 화면을 그리지 못했어요. 잠시 뒤 다시 열어 주세요.'})]}; }
  if (my !== seq) return; // 늦게 끝난 앞 화면
  root.replaceChildren(...out.nodes);
  for (const r of root.querySelectorAll('.chaps.row')) { const n = r.querySelector('.now'); if (n) r.scrollLeft = Math.max(0, n.getBoundingClientRect().left - r.getBoundingClientRect().left + r.scrollLeft - 16); } // 4 ~ 7단 챕터 줄 — 지금 단이 보이게
  document.title = L(out.title + ' · 고도리'); // 영어면 창 제목도(엔진은 body 만 봄)
  document.body.classList.toggle('noscroll', !!out.noScroll);
  window.scrollTo(0, out.noScroll ? 0 : scrollMem.get(hash) ?? 0);
}
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
if (EN_NEXT || DEV) $('#langBtn')?.addEventListener('click', e => { e.preventDefault(); switchLang(EN ? 'ko' : 'en'); });
if (EN && !(EN_NEXT || DEV)) location.replace('/atlas/?lang=en' + (location.hash || '#/'));
else {
  if (EN) { const l = document.createElement('link'); l.rel = 'stylesheet'; l.href = '/next/en.css'; document.head.append(l); await startI18n(); }
  route();
}
