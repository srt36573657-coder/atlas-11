/* ATLAS · 소개 영상 한 장(hello.html)의 「친구에게 보내기」 — 2026-10-14(싱가포르) 22:29 「홍표 홍표 홍표 3번 하면서 더 아이어맨스럽게 만들어봐 그리고 아틀란스에 올려」(규칙 65)
   · 보내는 글 = 앵무새 고도리 · 1분 영상(2026-10-17 · 이름은 site/next/brand.js 한 곳)(옛 /app/hello-share.js 는 옛 판 띠가 쓰고 그대로 — 옛 판 화면 코드는 고치지 않음: 옛 판 빠짐없는 검사가 지키는 곳이고, 오늘 자료로 옛 판 둘러보기 검사가 걸려 있음)
   · 2026-10-17 21:10(싱가포르) 「고도리 · 하나로 묶은 명령문」 [4] 1 ~ 4 — 「친구에게 무슨 말을 할래?」 글상자부터(/next/p-share.js · 빠른 말 셋 · words.js 로 거름 · 걸리면 고치게)
     → 휴대폰 공유 창(카카오톡 · 문자)에 내 말 + 소개 글 + 주소 함께 · 없으면 함께 복사 · 복사도 막히면 글상자에 글을 보여 줌 */
// 영어 팩(사장님 2026-10-15(싱가포르) 23:35 「언어팩을 선태기하면 아틀란스가 영어로 나오게 하라」) — 이 기기에서 영어를 골랐으면 소개 쪽 글도 영어로(새 ATLAS 와 같은 사전 · 영상 속 말은 한국어 그대로)
//   2026-10-17 이름 바꾸기(사장님 15:48 「아틀란스에서 보드리로 모두 변경해」 · 15:54 「예전 아트란스는 앞으로 어떠한 작업도 하지 말아라」 · 규칙 75) — 엔진 · 사전은 지금 사이트 것(/next/i18n.js · 사전 원본 scripts/atlas11/next/i18n/en-src.json · 옛 /atlas/i18n.js 는 고치지 않는 옛 판)
import {ON as EN, startI18n, t as L} from '/next/i18n.js';
import {open as shareBox} from '/next/p-share.js';
await startI18n();
const HELLO_SHARE = {title: L('고도리를 소개합니다'), text: L('앵무새 고도리가 1분 동안 자기를 소개해요. 앵무새는 들은 것만 말해요 — 그래서 지난 기록만 말해요!')};
const helloUrl = () => new URL('/hello.html', location.origin).href;
/** 글상자를 열고 닫힐 때 결과 — {how: 'share' | 'copy' | 'show' | 'cancel' | 'close', text, url} */
const shareHello = () => shareBox({kind: 'share', title: HELLO_SHARE.title, text: HELLO_SHARE.text, url: helloUrl()});
const shareSay = r => L(r?.how === 'copy' ? '글과 주소를 함께 복사했어요 · 카카오톡 대화창에 붙여 넣으세요' : r?.how === 'show' ? `이 주소를 보내 주세요: ${r.url}` : '');
if (EN) { const go = document.querySelector('.hp-go'); if (go) go.setAttribute('href', '/?lang=en'); for (const a of document.querySelectorAll('nav.tabs a')) a.setAttribute('href', a.getAttribute('href').replace('/#/', '/?lang=en#/')); } // 영어로 보던 사람은 영어 화면으로(아래 단추 다섯도 — 2026-10-18)
const msg = document.getElementById('hp-msg');
document.getElementById('hp-send')?.addEventListener('click', async () => { msg.textContent = shareSay(await shareHello()); });
window.__helloShare = HELLO_SHARE; // 확인용(탐침이 보내는 글을 읽음)
