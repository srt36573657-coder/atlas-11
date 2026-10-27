/* ATLAS · 소개 영상 한 장(hello.html)의 「친구에게 보내기」 — 2026-10-14(싱가포르) 22:29 「홍표 홍표 홍표 3번 하면서 더 아이어맨스럽게 만들어봐 그리고 아틀란스에 올려」(규칙 65)
   · 보내는 글 = 앵무새 고도리 · 1분 영상(2026-10-17 · 이름은 site/next/brand.js 한 곳)(옛 /app/hello-share.js 는 옛 판 띠가 쓰고 그대로 — 옛 판 화면 코드는 고치지 않음: 옛 판 빠짐없는 검사가 지키는 곳이고, 오늘 자료로 옛 판 둘러보기 검사가 걸려 있음)
   · 2026-10-17 21:10(싱가포르) 「고도리 · 하나로 묶은 명령문」 [4] 1 ~ 4 — 「친구에게 무슨 말을 할래?」 글상자부터(/next/p-share.js · 빠른 말 셋 · words.js 로 거름 · 걸리면 고치게)
     → 휴대폰 공유 창(카카오톡 · 문자)에 내 말 + 소개 글 + 주소 함께 · 없으면 함께 복사 · 복사도 막히면 글상자에 글을 보여 줌 */
// 영어 팩(사장님 2026-10-15(싱가포르) 23:35 「언어팩을 선태기하면 아틀란스가 영어로 나오게 하라」) — 이 기기에서 영어를 골랐으면 소개 쪽 글도 영어로(새 ATLAS 와 같은 사전 · 영상 속 말은 한국어 그대로)
//   2026-10-17 이름 바꾸기(사장님 15:48 「아틀란스에서 보드리로 모두 변경해」 · 15:54 「예전 아트란스는 앞으로 어떠한 작업도 하지 말아라」 · 규칙 75) — 엔진 · 사전은 지금 사이트 것(/next/i18n.js · 사전 원본 scripts/atlas11/next/i18n/en-src.json · 옛 /atlas/i18n.js 는 고치지 않는 옛 판)
import {ON as EN, startI18n, t as L} from '/next/i18n.js';
import {open as shareBox} from '/next/p-share.js';
import {VIDEO, NAME, josa} from '/next/brand.js';
if (VIDEO.ready) document.querySelector('.hp-vid')?.removeAttribute('hidden'); // 새 영상이 올라간 뒤에만 영상 칸을 보임(사장님 2026-10-18 16:39 [3] 9)
// 사전(en.json 1MB 남짓)을 받는 동안에도 「친구에게 보내기」가 먹게 — 단추는 바로 붙이고, 누르면 사전을 기다렸다가 엶
//   (2026-10-20 실제 사이트 큰 시험 「글상자가 안 열림 — 390×844 영어 소개 쪽」: 단추를 사전을 다 받은 뒤에 붙여서, 느린 망에서 그 전에 누르면 아무 일이 없던 것)
const ready = startI18n().catch(() => null); // 사전이 깨져도 글상자는 열림(한국어 글로)
const helloShare = () => ({title: L('둘이를 소개합니다'), text: L(`앵무새 ${josa(NAME, '는')} 싹에서 꽃이 되는 종목을 지난 기록으로 찾아 줘요. 앵무새는 들은 것만 말해요!`)}); // 보내는 글 = 본질 1(총정리 2026-10-22 D14 · 상품권 방 p-gift.js 와 같은 글)
const helloUrl = () => new URL('/hello.html', location.origin).href;
/** 글상자를 열고 닫힐 때 결과 — {how: 'share' | 'copy' | 'show' | 'cancel' | 'close', text, url} */
const shareHello = () => shareBox({kind: 'share', ...helloShare(), url: helloUrl()});
const shareSay = r => L(r?.how === 'copy' ? '글과 주소를 함께 복사했어요 · 카카오톡 대화창에 붙여 넣으세요' : r?.how === 'show' ? `이 주소를 보내 주세요: ${r.url}` : '');
if (EN) { const go = document.querySelector('.hp-go'); if (go) go.setAttribute('href', '/?lang=en'); for (const a of document.querySelectorAll('nav.tabs a')) a.setAttribute('href', a.getAttribute('href').replace('/#/', '/?lang=en#/')); } // 영어로 보던 사람은 영어 화면으로(아래 단추 다섯도 — 2026-10-18)
if (EN) for (const a of document.querySelectorAll('a[href="/privacy.html"]')) a.setAttribute('href', '/privacy.html#en'); // 처리방침도 영어 칸으로(총정리 D23 — 그 쪽은 스크립트가 없어 스스로 말을 못 고름)
const msg = document.getElementById('hp-msg');
document.getElementById('hp-send')?.addEventListener('click', async () => { await ready; msg.textContent = shareSay(await shareHello()); });
await ready;
window.__helloShare = helloShare(); // 확인용(탐침이 보내는 글을 읽음 · 사전을 받은 뒤의 글)
// 친구 소개 세기(사장님 2026-10-25 13:40 「편지를 보내지 않아도 … 카톡 친구 세 명으로 세 명을 보냈다 라는 걸 알 수 있게끔」) — 이 쪽 주소에 보낸 사람 표(r)가 있으면 한 번 세고 주소에서 지움(/next/gift-ref.js) · 없으면 아무것도 안 함
import('/next/gift-ref.js').then(m => m.visit()).catch(() => {});
