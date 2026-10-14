/* ATLAS · 소개 영상 한 장(hello.html)의 「친구에게 보내기」 — 2026-10-14(싱가포르) 22:29 「홍표 홍표 홍표 3번 하면서 더 아이어맨스럽게 만들어봐 그리고 아틀란스에 올려」(규칙 65)
   · 보내는 글 = 앵무새 홍표 · 35초 영상(옛 /app/hello-share.js 는 옛 판 띠가 쓰고 그대로 — 옛 판 화면 코드는 고치지 않음: 옛 판 빠짐없는 검사가 지키는 곳이고, 오늘 자료로 옛 판 둘러보기 검사가 걸려 있음)
   · 휴대폰 공유 창(카카오톡 · 문자)이 있으면 그것으로 · 없으면 링크 복사 · 복사도 막히면 주소 글을 그대로 보여 줌 */
const HELLO_SHARE = {title: 'ATLAS를 소개합니다', text: '앵무새 홍표가 35초 동안 ATLAS를 소개해요. 앵무새는 들은 것만 말해요 — ATLAS도 지난 기록만 말해요!'};
const helloUrl = () => new URL('/hello.html', location.origin).href;
async function shareHello() {
  const url = helloUrl();
  if (navigator.share) {
    try { await navigator.share({...HELLO_SHARE, url}); return {how: 'share', url}; }
    catch (e) { if (e?.name === 'AbortError') return {how: 'cancel', url}; } // 공유 창을 닫음 — 아무 말 없이
  }
  try { await navigator.clipboard.writeText(url); return {how: 'copy', url}; } catch {}
  return {how: 'show', url};
}
const shareSay = r => (r?.how === 'copy' ? '링크를 복사했습니다 · 카카오톡 대화창에 붙여 넣으세요' : r?.how === 'show' ? `이 주소를 보내 주세요: ${r.url}` : '');
const msg = document.getElementById('hp-msg');
document.getElementById('hp-send')?.addEventListener('click', async () => { msg.textContent = shareSay(await shareHello()); });
window.__helloShare = HELLO_SHARE; // 확인용(탐침이 보내는 글을 읽음)
