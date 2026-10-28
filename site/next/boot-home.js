/* 여는 동안 첫 화면 소개 칸(사장님 2026-10-28 11:12 「어」 새 첫 화면 · docs/design/why-mock-2026-10-28/order-1112.txt)
   첫 화면 길(#/ · 빈 주소)에서만 index.html 의 「여는 중입니다…」 자리에 소개 칸 글을 먼저 그림 — 가장 큰 그림(check_white ③ 느린 4G 2.5초)이
   app.js 와 자료를 기다리지 않게(옛 여는 화면 돌 시계 그림 자리) · 글은 home-new.js heroBox 와 같게(숫자 셋은 받은 뒤 app.js 가 그림 · 여기서는 「…」)
   감싼 칸은 .boot 그대로(검사 · 맨 아래 고리 숨김이 「아직 여는 중」으로 봄) · app.js 가 첫 화면을 다 그리면 같은 자리 · 같은 크기로 통째로 바뀜
   index.html 이 app.js 보다 먼저 부름(모듈은 문서 차례로 돎 — app.js 를 늦추지 않음) · 다른 길은 아무것도 안 함 */
const hs = location.hash || '#/', isHome = /^#\/?$/.test(hs);
// 최고급 핑크 판(2026-10-28 12:00)은 html.home 에 달림 — index.html 이 home 으로 시작하므로 다른 길은 여기서 곧바로 뗌(첫 화면이 아닌 쪽에 핑크가 비치지 않게) · 첫 화면은 창 위 띠도 포도주 빛
if (!isHome) document.documentElement.classList.remove('home');
else document.querySelector('meta[name="theme-color"]')?.setAttribute('content', '#3D1028');
const v = document.querySelector('#view'), boot = v?.querySelector(':scope > p.boot');
if (isHome && v && boot) {
  document.documentElement.classList.add('home');
  const el = (tag, cls, txt) => { const e = document.createElement(tag); if (cls) e.className = cls; if (txt != null) e.textContent = txt; return e; };
  const fact = label => { const d = el('div', 'nh-fact'); d.append(el('b', 'num', '…'), el('span', null, label)); return d; };
  const sec = el('section', 'nh-hero'); sec.setAttribute('aria-label', '이 사이트 소개');
  const h2 = el('h2', 'nh-h1'); h2.append(el('span', null, '주식을 사기 전에,'), ' ', el('span', 'nh-acc', '지난 기록으로 한 번 더 확인하세요'));
  const facts = el('div', 'nh-facts'); facts.append(fact('회사'), fact('업종'), fact('년 기록'));
  sec.append(el('p', 'nh-kick', '주식 지난 기록 확인'), h2, el('p', 'nh-sub', '코스피와 코스닥 회사, 업종의 지난 기록을 숫자로 보여 드립니다.'), facts, el('p', 'nh-no', '앞날을 맞히거나 사고팔기를 권하지 않습니다.'));
  const wrap = el('div', 'boot nh-bootw'); wrap.setAttribute('aria-busy', 'true'); wrap.append(sec);
  boot.replaceWith(wrap);
}
