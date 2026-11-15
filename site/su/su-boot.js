/* 첫 칠함 전에 한 번 도는 작은 판 고르기(주문 1115-1836 · 사장님 2026-11-15(마카오) 17:36 「지금보다 속도 3배 빠르게 하는 방법찾아서 작업해」 · 17:37 「사이트」)
   index.html 머리 속에서 바로 돎(자바스크립트 묶음 · 자료를 기다리지 않음) — 짝: su.js route()(같은 고리 셈) · su-sonja.css
   · 첫 쪽(#/ — su.js route() 의 m · t 둘 다 아닌 고리) = html.sj-on → index.html 이 처음부터 든 머리 줄 · 표지(붓 글씨 그림)가 바로 보임 · 옛 쪽 꾸밈 파일은 끈 채 받기만 함
   · 다른 쪽 = 옛 쪽 꾸밈 파일(link[data-old-css] · 처음엔 media="print")을 바로 켬 — 옛 쪽은 그대로(su.js 도 옛 쪽을 그리기 전에 다 받을 때까지 기다림)
   보안 규칙: 글 속 스크립트 없음(이 파일은 같은 주소 파일) · 사이트 밖 주소 없음 */
(function () {
  var hh = location.hash || '#/', d = document.documentElement, i;
  var home = !/^#\/(c|i|k|r|p|q|m)\/(.+)$/.test(hh) && !/^#\/(b|k|r|p|q|j|m|f|n|s)$/.test(hh);
  if (home) {
    d.classList.add('sj-on');
    var t = document.querySelectorAll('meta[name="theme-color"]');
    for (i = 0; i < t.length; i++) t[i].setAttribute('content', '#F1E3D3');
  } else {
    var l = document.querySelectorAll('link[data-old-css]');
    for (i = 0; i < l.length; i++) l[i].media = 'all';
  }
  try { if (localStorage.getItem('su-big-text') === '1') d.classList.add('su-lg'); } catch (e) { /* 저장소 없음 */ }
})();
