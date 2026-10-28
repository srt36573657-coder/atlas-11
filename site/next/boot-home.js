/* 여는 동안 첫 화면 소개 칸(사장님 2026-10-28 11:12 「어」 새 첫 화면 · docs/design/why-mock-2026-10-28/order-1112.txt)
   첫 화면 길(#/ · 빈 주소)에서만 index.html 의 「여는 중입니다…」 자리에 소개 칸 글을 먼저 그림 — 가장 큰 그림(check_white ③ 느린 4G 2.5초)이
   app.js 와 자료를 기다리지 않게(옛 여는 화면 돌 시계 그림 자리) · 글은 home-new.js heroBox · pathBox 와 같게(tests/atlas11/home-new.test.mjs)
   2026-10-29 01:48 「이 36이 둘리를 다 함께 아주 직관적으로」(docs/design/wise36-2026-10-29/order-0148.txt) — 네 걸음 그림 · 찾기 단추 둘(옛 네 마디 줄 · 숫자 셋 · 오늘 코스피 줄은 뺌)
   감싼 칸은 .boot 그대로(검사 · 맨 아래 고리 숨김이 「아직 여는 중」으로 봄) · app.js 가 첫 화면을 다 그리면 같은 자리 · 같은 크기로 통째로 바뀜
   index.html 이 app.js 보다 먼저 부름(모듈은 문서 차례로 돎 — app.js 를 늦추지 않음) · 다른 길은 아무것도 안 함 */
const hs = location.hash || '#/', isHome = /^#\/?$/.test(hs);
// 첫 화면 모양(home.css · home-new.css 의 html.home 규칙)은 첫 화면에서만 — index.html 이 home 으로 시작하므로 다른 길은 여기서 곧바로 뗌 · 핑크 바탕은 모든 쪽(clock.css · 2026-10-28 13:16) · 창 위 띠는 모든 쪽 포도주 빛
if (!isHome) document.documentElement.classList.remove('home');
else document.querySelector('meta[name="theme-color"]')?.setAttribute('content', '#3D1028');
const v = document.querySelector('#view'), boot = v?.querySelector(':scope > p.boot');
if (isHome && v && boot) {
  document.documentElement.classList.add('home');
  const el = (tag, cls, txt) => { const e = document.createElement(tag); if (cls) e.className = cls; if (txt != null) e.textContent = txt; return e; };
  const arrow = () => { const i = el('i', null, '›'); i.setAttribute('aria-hidden', 'true'); return i; };
  const sec = el('section', 'nh-hero'); sec.setAttribute('aria-label', '이 사이트 소개');
  const h2 = el('h2', 'nh-h1'); h2.append(el('span', null, '주식을 사기 전에,'), ' ', el('span', 'nh-acc', '지난 기록으로 2분만 확인하세요'));
  // 네 걸음(home-new.js PARTS · pathBox 와 같은 글 · 같은 높이 — 다 그려질 때 소개 칸이 밀리지 않게)
  const path = el('nav', 'nh-path'); path.setAttribute('aria-label', '네 걸음'); const ol = el('ol');
  for (const [n, k, c] of [['1', '찾기', '사려는 회사'], ['2', '보기', '지난 기록'], ['3', '묻기', '질문 11개'], ['4', '돌아보기', '한 달 뒤']]) {
    const b = el('button', 'nh-pt'); b.type = 'button'; const i = el('i', null, n); i.setAttribute('aria-hidden', 'true'); b.append(i, el('b', null, k), el('small', null, c));
    const li = el('li'); li.append(b); ol.append(li);
  }
  path.append(ol);
  const go = el('button', 'nh-go nh-gofind'); go.type = 'button'; go.append(el('span', null, '회사 이름 넣기'), arrow());
  const list = el('a', 'nh-link nh-golist'); list.href = '#/t/picks'; list.append(el('span', null, '지난 기록으로 고른 회사 보기'), arrow());
  const door = el('div', 'nh-door'); door.append(go, list);
  sec.append(el('p', 'nh-q', '나도 살까 싶을 때'), h2, path, door, el('p', 'nh-no', '앞날을 맞히거나 사고팔기를 권하지 않습니다.'));
  const wrap = el('div', 'boot nh-bootw'); wrap.setAttribute('aria-busy', 'true'); wrap.append(sec);
  boot.replaceWith(wrap);
}
