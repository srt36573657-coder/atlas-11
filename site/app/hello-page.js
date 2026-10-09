/* ATLAS · 소개 영상 한 장(hello.html) — 친구가 카카오톡 링크를 누르면 여는 곳 · 영상(누르면 재생) · 「ATLAS 보러 가기」 · 「친구에게 보내기」
   사장님 2026-10-09 19:54(중국 시각) 「지금 만든걸 아틀란에 맨위에 넣어 친구에게 소개하기로 지혜롭게」 */
import {shareHello, shareSay} from './hello-share.js';

const msg = document.getElementById('hp-msg');
document.getElementById('hp-send')?.addEventListener('click', async () => { msg.textContent = shareSay(await shareHello()); });
