/* 여는 화면 돌 시계에 바늘 — 사장님 2026-10-26 01:33 「잘된 것 11가지 찾아서 더 잘하도록 하라 · 큰 쪽에서 7개 작은 곳에서 4개」 · 01:42 「응」 큰 폰 ⑤
   잘된 것: 여는 동안에도 돌 시계가 첫 화면 시계 자리 그대로 보임(index.html .s-boot) → 더 잘하게: 그때부터 바늘이 지금 시각을 가리킴(바늘 없는 시계가 1 ~ 2초 보이던 것)
   index.html 이 app.js 보다 먼저 부름(모듈은 문서 차례로 돎 — app.js 를 늦추지 않음) · 바늘 그리기 = stone-clock.js addHands(첫 화면 시계와 같은 바늘 · 같은 시각) · app.js 가 그리면 #view 안이 통째로 바뀌어 이 바늘도 같이 빠짐 */
import {addHands} from '/next/stone-clock.js';
const boot = document.querySelector('#view > .s-boot');
if (boot && !boot.querySelector('.s-hands')) addHands(boot);
