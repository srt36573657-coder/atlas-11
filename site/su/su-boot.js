/* 첫 칠함 전에 한 번 도는 작은 판 고르기(주문 1115-1836 · 사장님 2026-11-15(마카오) 17:36 「지금보다 속도 3배 빠르게 하는 방법찾아서 작업해」 · 17:37 「사이트」)
   index.html 머리 속에서 바로 돎(자바스크립트 묶음 · 자료를 기다리지 않음) — 짝: su.js route()(같은 고리 셈) · su-sonja.css
   · 첫 쪽(#/ — su.js route() 의 m · t 둘 다 아닌 고리) = html.sj-on → index.html 이 처음부터 든 머리 줄 · 표지(붓 글씨 그림)가 바로 보임 · 옛 쪽 꾸밈 파일은 끈 채 받기만 함
   · 「왜 사?」 · 매매일지도 손자병법 판(주문 1116-0300 — 옛 쪽 꾸밈 파일을 켜던 갈래는 지움)
   보안 규칙: 글 속 스크립트 없음(이 파일은 같은 주소 파일) · 사이트 밖 주소 없음 */
(function () {
  var hh = location.hash || '#/', d = document.documentElement, i;
  // 주문 1115-2328 — 옛 틀은 「왜 사?」 · 매매일지만(#/q · #/p · #/q/<번호> · #/j) · 꾀 · 회사 · 정산(#/k · #/k/<꾀> · #/c/<번호> · #/r/t)은 손자병법 판(표지는 첫 쪽에만 — sj-sub) · 나머지(지운 쪽 포함)는 첫 쪽
  // 주문 1116-0300 — 모든 쪽이 손자병법 판(옛 쪽 꾸밈 파일 · 옛 틀은 지움) · 첫 쪽 밖의 쪽은 표지를 숨김(sj-sub)
  var sub = /^#\/k(\/.+)?$|^#\/c\/[0-9A-Z]{6}$|^#\/r\/t$|^#\/(q|p)(\/[^/]+)?$|^#\/j$/.test(hh);
  d.classList.add('sj-on');
  if (sub) d.classList.add('sj-sub');
  var t = document.querySelectorAll('meta[name="theme-color"]');
  for (i = 0; i < t.length; i++) t[i].setAttribute('content', '#F3F8F6');
  try { if (localStorage.getItem('su-big-text') === '1') d.classList.add('su-lg'); } catch (e) { /* 저장소 없음 */ }
})();
