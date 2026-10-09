/* ATLAS · 친구에게 소개하기 — 보내기 한 곳(첫 화면 맨 위 띠 · 소개 영상 창 · hello.html 이 같이 씀)
   사장님 2026-10-09 19:54(중국 시각) 「지금 만든걸 아틀란에 맨위에 넣어 친구에게 소개하기로 지혜롭게」
   · 보내는 주소는 소개 영상 한 장(hello.html) — 카카오톡 미리보기에 공주님 그림(og-hello.jpg)이 뜨고, 받은 사람은 영상을 먼저 본 뒤 「ATLAS 보러 가기」
   · 휴대폰 공유 창(카카오톡 · 문자)이 있으면 그것으로 · 없으면 링크 복사 · 복사도 막히면 주소 글을 그대로 보여 줌 */
export const HELLO_PATH = '/hello.html';
export const helloUrl = () => new URL(HELLO_PATH, location.origin).href;
export const HELLO_SHARE = {title: 'ATLAS를 소개합니다', text: '공주님이 36초 동안 ATLAS를 소개해요. 행복하세요!'};

export async function shareHello() {
  const url = helloUrl();
  if (navigator.share) {
    try { await navigator.share({...HELLO_SHARE, url}); return {how: 'share', url}; }
    catch (e) { if (e?.name === 'AbortError') return {how: 'cancel', url}; } // 공유 창을 닫음 — 아무 말 없이
  }
  try { await navigator.clipboard.writeText(url); return {how: 'copy', url}; } catch {}
  return {how: 'show', url};
}

/** 보낸 뒤 한 줄(공유 창으로 보냈거나 닫았으면 빈 줄) */
export const shareSay = r => (r?.how === 'copy' ? '링크를 복사했습니다 · 카카오톡 대화창에 붙여 넣으세요' : r?.how === 'show' ? `이 주소를 보내 주세요: ${r.url}` : '');
