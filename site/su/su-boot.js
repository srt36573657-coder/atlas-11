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
  // 열림 쪽(주문 1124-1942 · 사장님 2026-11-24(서울) 19:42 「여기 ui ux를 1000가지 분석해 그래서 손자 병법에 을 이렇게 고쳐」 — 치지 앱 첫 화면처럼 먹 바탕 · 가운데 앱 얼굴 · 굵은 이름 한 줄)
  //   새로 켤 때 한 번만(같은 창에서 탭을 오가거나 다시 들어오면 안 보임) · 1.5초 안에 걷힘 · 누르는 것을 막지 않음(그림뿐) · 움직임 줄이기면 움직이지 않고 짧게
  //   자동 검사 브라우저(navigator.webdriver)는 다른 검사를 가리지 않게 안 보임 — 주소에 ?sjopen=1(늘) · ?sjopen=2(사람처럼 창마다 한 번)를 붙이면 보임(check_su ㉟ 가 이 길로 따로 잼)
  try {
    var q = (/[?&]sjopen=([12])(&|$)/.exec(location.search) || [])[1], force = q === '1', user = q === '2', seen = false; // 1 = 늘 보임 · 2 = 사람처럼(창마다 한 번)
    try { seen = sessionStorage.getItem('sj-opened') === '1'; sessionStorage.setItem('sj-opened', '1'); } catch (e) { /* 저장소 없음 — 한 번 보임 */ }
    if (force || (!seen && (user || !navigator.webdriver))) {
      var calm = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      d.classList.add('sj-opening');
      if (calm) d.classList.add('sj-opening-calm');
      var off = function () { d.classList.remove('sj-opening', 'sj-opening-calm'); }; // 휴대폰 맨 위 띠 색은 그대로(화면 코드가 쪽마다 다시 칠함 — 바꿨다 되돌리면 깜빡임)
      // 시계는 첫 칠함부터(꾸밈 파일을 받는 동안 흘러가 버리면 느린 망에서 열림 쪽이 안 보임) — 그림이 처음 칠해지는 때(requestAnimationFrame)에 잼 · 4초 넘으면 그대로 걷음
      var held = setTimeout(off, 4000);
      requestAnimationFrame(function () { requestAnimationFrame(function () { clearTimeout(held); setTimeout(off, calm ? 900 : 1500); }); });
    }
  } catch (e) { /* 열림 쪽 없이 그대로 */ }
})();
