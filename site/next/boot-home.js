/* 여는 동안 첫 화면 소개 칸(사장님 2026-10-28 11:12 「어」 새 첫 화면 · docs/design/why-mock-2026-10-28/order-1112.txt)
   첫 화면 길(#/ · 빈 주소)에서만 index.html 의 「여는 중입니다…」 자리에 소개 칸 글을 먼저 그림 — 가장 큰 그림(check_white ③ 느린 4G 2.5초)이
   app.js 와 자료를 기다리지 않게(옛 여는 화면 돌 시계 그림 자리) · 글은 home-new.js heroBox · flowMap 과 같게(tests/atlas11/home-new.test.mjs)
   2026-10-29 12:45 ~ 13:33 「바보도 … 요즘 주식판을 한눈에 · 헷갈리게 글을 적는 것 모두 빼」(docs/design/babo-2026-10-29/order-1245.txt) — ① 돈 흐름 틀(돈이 몰린 곳 · 빠진 곳 빈 줄 셋씩 · 같은 높이)
   업종 이름 · 막대는 자료가 와야 그림(app.js 가 같은 자리 · 같은 크기로 통째로 바꿈 — 빈 줄이 같은 높이라 아래가 안 밀림)
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
  const h2 = el('h2', 'nh-h1'); h2.append(el('span', null, '요즘 돈은'), ' ', el('span', 'nh-acc', '여기로 몰렸어요'));
  // ① 돈 흐름 틀(home-new.js flowMap 과 같은 글 · 같은 높이 — 줄은 빈 줄 셋씩)
  const fm = el('div', 'nh-fm'); fm.setAttribute('role', 'group'); fm.setAttribute('aria-label', '한 달 동안 시장보다 더 오른 업종과 덜 오른 업종');
  const key = (k, t) => { const p = el('p', 'nh-fk nh-fk-' + k); p.append(hid(el('i')), el('span', null, t)); return p; };
  const rows = k => { const ol = el('ol', 'nh-fl nh-fl-' + k); for (let j = 0; j < 3; j++) ol.append(el('li', 'nh-fr nh-f0')); return ol; };
  const sage = el('a', 'nh-sage'); sage.href = '#/sage/adamsmith'; sage.append(hid(el('i', null, '“')), el('b', null, '애덤 스미스'), ' ', el('span', null, '사려는 사람이 많으면 값이 올라요.')); // 다 그린 뒤(home-new.js sage)와 같은 고리 · 같은 높이
  fm.append(key('up', '돈이 몰린 곳'), rows('up'), key('dn', '돈이 빠진 곳'), rows('dn'), el('p', 'nh-fc', '한 달 동안 시장과 견준 값이에요.'), sage);
  const go = el('button', 'nh-go nh-gopick'); go.type = 'button'; go.append(el('span', null, '지난 기록으로 고른 회사 보기'), hid(el('i', null, '›')));
  const door = el('div', 'nh-door'); door.append(go);
  sec.append(pm, h2, fm, door, el('p', 'nh-no', '앞날을 맞히거나 사고팔기를 권하지 않습니다.'));
  const wrap = el('div', 'boot nh-bootw'); wrap.setAttribute('aria-busy', 'true'); wrap.append(sec);
  boot.replaceWith(wrap);
}
