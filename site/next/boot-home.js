/* 여는 동안 첫 화면 소개 칸(사장님 2026-10-28 11:12 「어」 새 첫 화면 · docs/design/why-mock-2026-10-28/order-1112.txt)
   첫 화면 길(#/ · 빈 주소)에서만 index.html 의 「여는 중입니다…」 자리에 소개 칸 글을 먼저 그림 — 가장 큰 그림(check_white ③ 느린 4G 2.5초)이
   app.js 와 자료를 기다리지 않게(옛 여는 화면 돌 시계 그림 자리) · 글은 home-new.js heroBox · flowMap 과 같게(tests/atlas11/home-new.test.mjs)
   2026-10-29 12:45 ~ 13:33 「바보도 … 요즘 주식판을 한눈에 · 헷갈리게 글을 적는 것 모두 빼」(docs/design/babo-2026-10-29/order-1245.txt) — ① 돈 흐름 틀(돈이 몰린 곳 · 빠진 곳 빈 줄 셋씩 · 같은 높이)
   업종 이름 · 막대는 자료가 와야 그림(app.js 가 같은 자리 · 같은 크기로 통째로 바꿈 — 빈 줄이 같은 높이라 아래가 안 밀림)
   2026-10-30 04:27 「왜 몰리는지 이유를 11 가지를 거기다 적어놔야 돼」 · 05:03 「응」(docs/design/why11-2026-10-30) — 몰린 곳 줄마다 「왜?」 두 줄 자리 · 불빛 줄 자리(빈 칸 · 글 없음)
   · 머리는 늘 두 줄(시장이 내린 달 「시장이 n% 내릴 때 · 여기는 버텼어요」와 같은 높이) · 「권하지 않습니다」는 머리 밑(첫 한 화면 안 · 가장 큰 그림 — 늦게 그린 「왜?」 마디보다 큼)
   감싼 칸은 .boot 그대로(검사 · 맨 아래 고리 숨김이 「아직 여는 중」으로 봄) · index.html 이 app.js 보다 먼저 부름(모듈은 문서 차례로 돎 — app.js 를 늦추지 않음) · 다른 길은 아무것도 안 함 */
const hs = location.hash || '#/', isHome = /^#\/?$/.test(hs);
// 첫 화면 모양(home.css · home-new.css 의 html.home 규칙)은 첫 화면에서만 — index.html 이 home 으로 시작하므로 다른 길은 여기서 곧바로 뗌 · 핑크 바탕은 모든 쪽(clock.css · 2026-10-28 13:16) · 창 위 띠는 모든 쪽 포도주 빛
if (!isHome) document.documentElement.classList.remove('home');
else document.querySelector('meta[name="theme-color"]')?.setAttribute('content', '#070514'); // 밤 무대 판 막대(2026-10-29 · 옛 핑크 #3D1028)
const v = document.querySelector('#view'), boot = v?.querySelector(':scope > p.boot');
if (isHome && v && boot) {
  document.documentElement.classList.add('home');
  const el = (tag, cls, txt) => { const e = document.createElement(tag); if (cls) e.className = cls; if (txt != null) e.textContent = txt; return e; };
  const hid = e => { e.setAttribute('aria-hidden', 'true'); return e; };
  const sec = el('section', 'nh-hero'); sec.setAttribute('aria-label', '요즘 돈 흐름');
  const pm = el('p', 'nh-pm'); pm.append(hid(el('i', null, '1')), el('span', null, '돈 흐름'));
  // 만수르(사장님 2026-10-31 23:14(+04) · docs/design/mansour-2026-11-01/order-0414.txt) — 다 그린 첫 화면(home-new.js mansour)과 같은 단추 · 같은 자리(머리가 밀리지 않게)
  const ms = el('a', 'nh-mans'); ms.href = 'https://shin-yxy.gino.im/'; ms.target = '_blank'; ms.rel = 'noopener noreferrer'; ms.append(el('span', null, '천사'), hid(el('span', 'nh-mgo', '›'))); pm.append(ms);
  const h2 = el('h2', 'nh-h1'); h2.append(el('span', null, '요즘 돈은'), ' ', el('span', 'nh-acc', '여기로 몰렸어요'));
  // ① 돈 흐름 틀(home-new.js flowMap 과 같은 글 · 같은 높이 — 줄은 빈 줄 셋씩)
  const fm = el('div', 'nh-fm'); fm.setAttribute('role', 'group'); fm.setAttribute('aria-label', '한 달 동안 시장보다 더 오른 업종과 덜 오른 업종');
  const key = (k, t) => { const p = el('p', 'nh-fk nh-fk-' + k); p.append(hid(el('i')), el('span', null, t)); return p; };
  // 몰린 곳 줄 = 빈 막대 줄 + 「왜?」 두 줄 자리 + 불빛 줄 자리(home-new.js upEmpty 와 같은 틀 · 같은 높이) · 빠진 곳 줄 = 빈 막대 줄
  const slot = () => { const li = el('li', 'y11-i y11-e'), w = el('div', 'y11-box'), ws = el('div', 'y11-s'); ws.append(el('div', 'nh-fr nh-f0'), el('div', 'y11-l'), el('div', 'y11-lt'), el('div', 'y11-m')); w.append(ws); li.append(w); return li; };
  const rows = k => { const ol = el('ol', 'nh-fl nh-fl-' + k); for (let j = 0; j < 3; j++) ol.append(k === 'up' ? slot() : el('li', 'nh-fr nh-f0')); return ol; };
  // 스승 얼굴(사장님 2026-11-01 10:25(+04) 「응」 · order-1525) · 얼굴을 누르면 남긴 말(12:30(+04) 「응」 · order-1730) — 다 그린 첫 화면(home-new.js sage)과 같은 꼴 · 같은 높이
  //   = 얼굴 칸 48px(그림 40px) + 이름과 말 고리(.nh-sl) · 여는 동안은 얼굴이 그림만(누르는 단추 · 소리 표 · 글상자는 다 그린 첫 화면이 담 — 소리 모듈은 다 그린 뒤 받음)
  const sf = hid(el('i', 'nh-sf')), sfi = document.createElement('img'); sfi.alt = ''; sfi.width = 40; sfi.height = 40; sfi.decoding = 'async'; sfi.src = '/next/sage-art/adamsmith.svg'; sf.append(sfi);
  const sl = el('a', 'nh-sl'); sl.href = '#/sage/adamsmith'; sl.append(el('b', null, '애덤 스미스'), ' ', el('span', null, '사려는 사람이 많으면 값이 올라요.'));
  const sage = el('div', 'nh-sage nh-sfw'); sage.dataset.id = 'adamsmith'; sage.append(sf, sl); // 다 그린 뒤(home-new.js sage)와 같은 고리 · 같은 높이
  fm.append(key('up', '돈이 몰린 곳'), rows('up'), key('dn', '돈이 빠진 곳'), rows('dn'), el('p', 'nh-fc', '한 달 동안 시장과 견준 값이에요.'), sage);
  // 스승 여섯 차례로 듣기(사장님 2026-11-01 14:48(+04) 「응」 · order-1948) — 다 그린 첫 화면(home-new.js sageAll)과 같은 알약 · 같은 자리(맨 위 스승 줄 바로 아래) · 소리를 못 내는 휴대폰은 없음
  if (typeof globalThis.speechSynthesis !== 'undefined' && typeof globalThis.SpeechSynthesisUtterance === 'function') {
    const all = el('button', 'nh-sall'), ic = document.createElementNS('http://www.w3.org/2000/svg', 'svg'), tri = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    all.type = 'button'; for (const [k, x] of [['width', 24], ['height', 24], ['viewBox', '0 0 24 24'], ['aria-hidden', 'true'], ['focusable', 'false'], ['fill', 'currentColor']]) ic.setAttribute(k, x);
    // 멈춘 스승부터 이어 듣기(16:22(+04) 「응」 · order-2122) — 이 휴대폰에 멈춘 스승이 있으면 다 그린 칸(home-new.js sageAll)과 같은 모양 · 같은 높이(이어 듣기 글 · 처음부터 · 멈춘 곳)
    const SN = {adamsmith: '애덤 스미스', socrates: '소크라테스', leekuanyew: '리콴유', darwin: '다윈', dengxiaoping: '덩샤오핑', peirce: '퍼스'};
    let at = null; try { at = JSON.parse(localStorage.getItem('atlas:home-sage-at') ?? 'null')?.id ?? null; } catch { at = null; }
    if (!Object.hasOwn(SN, at ?? '')) at = null;
    tri.setAttribute('d', 'M8 5.5v13l10.5-6.5z'); ic.append(tri); all.append(ic, el('span', null, at ? '멈춘 스승부터 이어 듣기' : '스승 여섯 차례로 듣기'));
    const row = el('div', 'nh-sallrow'), wrap = el('div', 'nh-sallw'); row.append(all); wrap.append(row);
    if (at) { const re = el('button', 'nh-sallr', '처음부터'); re.type = 'button'; row.append(re); wrap.append(el('p', 'nh-sallc', '멈춘 곳: ' + SN[at])); }
    fm.append(wrap);
  }
  // 첫 화면 두 칸(사장님 2026-11-02 10:38(+04) 「꽃이 될 종목과 돈이 몰린 종목 업종을 두가지로 나누어 첫화면에」 · 주문 1538) — 다 그린 칸(home-new.js twoBox)과 같은 틀 · 같은 높이(이름 줄 두 줄 자리 · 이름은 자료가 와야)
  const two = el('div', 'nh-two'); two.setAttribute('role', 'group'); two.setAttribute('aria-label', '꽃이 될 종목과 돈이 몰린 종목');
  const tw = (k, t, tag) => { const a = el(tag, 'nh-tw nh-tw-' + k), hd = el('span', 'nh-twh'); hd.append(hid(el('i', 'nh-twi nh-twi-' + k)), el('b', 'nh-twk', t), hid(el('i', 'nh-twg', '›'))); a.append(hd, el('span', 'nh-twn')); return a; };
  const tb = tw('bl', '꽃이 될 종목', 'a'); tb.href = '#/t/picks'; const tm = tw('mo', '돈이 몰린 종목', 'button'); tm.type = 'button'; two.append(tb, tm);
  const go = el('button', 'nh-go nh-gopick'); go.type = 'button'; go.append(el('span', null, '지난 기록으로 고른 회사 보기'), hid(el('i', null, '›')));
  const door = el('div', 'nh-door'); door.append(go);
  sec.append(pm, h2, el('p', 'nh-no', '앞날을 맞히거나 사고팔기를 권하지 않습니다.'), two, fm, door);
  const wrap = el('div', 'boot nh-bootw'); wrap.setAttribute('aria-busy', 'true'); wrap.append(sec);
  boot.replaceWith(wrap);
}
