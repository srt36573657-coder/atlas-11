/* 말하는 불빛 — 첫 화면 ① 돈 흐름 · 몰린 곳 칸을 펼치면 그리는 불빛 판과 말풍선(site/next/home-new.js upItem 이 칸을 처음 열 때 부름)
   사장님 2026-10-30 14:48(+08) 「애매한 도식화 정말 쉽게 재밌게 분명하게 … 잡스라면 … 대 혁식적으로 만들어라」 → 그림 「말하는 불빛」 · 15:15(+08) 「응」(사이트 첫 화면에)
   말씀 원문 docs/design/why11-2026-10-30/order-1615.txt · 결정표 decision.md 6 · 모양 site/next/home-talk.css(밤 무대 색은 clock_theme.py 가 그 파일 끝에 지음)
   따로 받는 까닭: 이 칸 코드 · 모양을 첫 화면 파일에 넣으니 느린 4G 가장 큰 그림이 2413ms → 2575ms(2.5초 선 넘음) — 칸을 열 때만 받음
   글은 textContent 로만 · 그림은 글자 없는 svg · 글 속 style 없음(꼬리 자리만 CSSOM --tail) */
import {ON as EN} from './i18n.js';
import {GODS, LIGHTS} from './roman72.js'; // 불빛마다 지킴이 신(사장님 2026-10-31 07:32(+03) 「어 달면서 신들에 / 이미지도 캐릭터화해서 해」 · docs/design/roman72-site-2026-10-31/order-1332.txt)
import {faceBtn, capBox} from './roman-say.js'; // 얼굴을 누르면 그 신 이야기를 소리로(2026-10-31 10:58(+04) 「응」 · order-1558.txt)

const nx = () => globalThis.NX;
const h = (...a) => nx().h(...a);
const sv = (...a) => nx().sv(...a);

/* 펼친 칸 = 말하는 불빛(사장님 2026-10-30 14:48(+08) 「애매한 도식화 정말 쉽게 재밌게 분명하게 … 잡스라면 … 대 혁식적으로」 → 그림 「말하는 불빛」 · 15:15(+08) 「응」 — 첫 화면에)
   불빛 판(무리 넷 · 누르는 불빛 열하나) → 누른 불빛이 말풍선으로 답함(번호 · 이름 · 네 / 아니요 / 몰라요 · 물음 · 기록 글 · 출처 · 쉬운 말)
   8 환율과 금리 = 비 오는 날 파전집 그림 · 9 다른 나라 = 바다 건너 같은 가게 그림(글자 없는 선 그림) · 앞 · 다음 불빛 · 소리로 듣기(폰이 읽어 줌 · 누를 때만)
   글 · 불빛은 자료 그대로(flow-why.json) · 물음과 쉬운 말은 아래 표(TALK_Q) · 그림 모양은 자료 셈(calc.fx · rate · us)에서 고름 · 앞날 말 · 사고팔기 말 없음 */
export const TALK_Q = Object.freeze({
  1: ['외국인이 더 샀나?', 'Did foreign investors buy more?', '외국인은 다른 나라에서 온 투자자예요.', 'Investors from other countries.'],
  2: ['기관이 더 샀나?', 'Did institutions buy more?', '기관은 연금이나 은행처럼 큰돈을 굴리는 곳이에요.', 'Big money managers, like pension funds and banks.'],
  3: ['개인이 더 샀나?', 'Did individuals buy more?', '개인은 우리 같은 보통 사람이에요.', 'Everyday people like us.'],
  4: ['좋은 소식이 있었나?', 'Was there good news?', '회사가 알린 큰 계약이나 배당 같은 소식이에요.', 'News a company announced, like a big contract or a dividend.'],
  5: ['끌어 올린 회사가 있나?', 'Did a company pull it up?', '한 달 동안 가장 많이 오른 회사를 봐요.', 'We look at the company that rose the most in a month.'],
  6: ['여러 곳이 같이 올랐나?', 'Did many rise together?', '절반 이상 올랐으면 켜져요.', 'It lights up when half or more rose.'],
  7: ['시장보다 잘했나?', 'Did it beat the market?', '시장 전체와 견줘 봐요.', 'We compare it with the whole market.'],
  8: ['이번 달 날씨가 이 업종 편이었나?', "Was this month's weather on its side?", '여기서 날씨는 달러 값과 이자(금리)예요.', 'Here, weather means the price of a dollar and interest rates.'],
  9: ['미국의 같은 업종도 잘했나?', 'Did the same industry do well in the US?', '지금은 미국만 봐요.', 'For now we only look at the US.'],
  10: ['정부 정책 기사가 있었나?', 'Was there government-policy news?', '정부나 국회 이야기가 든 기사예요.', 'News about the government or the National Assembly.'],
  11: ['나라 사이 기사가 있었나?', 'Was there cross-border news?', '관세나 무역 같은 이야기가 든 기사예요.', 'News about things like tariffs or trade.'],
});
export const TALK_A = Object.freeze({on: ['네', 'Yes'], off: ['아니요', 'No'], q: ['몰라요', "Don't know"]});
const tl = ([ko, en]) => (EN ? en : ko);
const stOf = it => (it?.s === 'on' || it?.s === 'off' ? it.s : 'q');
/** 그림 모양(자료 셈에서 고름) — 8: on 비 · 불 켜짐 / rain 비 · 불 꺼짐(달러 값이나 금리가 움직였지만 이 업종 편이 아님) / sun 해(거의 그대로) / q 모름 · 9: on · off · q */
export function sceneKind(k, st, c) {
  if (k === 8) return st === 'q' ? 'q' : st === 'on' ? 'on' : c?.fx?.moved || c?.rate?.moved ? 'rain' : 'sun';
  if (k === 9) return st;
  return null;
}
const CAP = Object.freeze({
  8: {on: ['비 오는 날 파전집처럼, 날씨가 이 업종 편이었어요.', 'Like a pancake shop on a rainy day, the weather was on its side.'], rain: ['비는 왔지만, 이 업종 편은 아니었어요.', 'It rained, but not in its favor.'],
    sun: ['이번 달은 날씨가 거의 그대로였어요.', 'The weather barely changed this month.'], q: ['날씨 기록을 못 받았어요.', "We couldn't get the weather record."]},
  9: {on: ['바다 건너 같은 가게도 잘 됐어요.', 'The same shop across the sea did well too.'], off: ['바다 건너 같은 가게는 못 했어요.', "The same shop across the sea didn't do as well."],
    q: ['바다 건너 기록이 모자라요.', 'Not enough record from across the sea.'], none: ['바다 건너엔 같은 가게가 없어요.', 'There is no same shop across the sea.']},
});
const SCENE_LABEL = Object.freeze({
  8: {on: ['비가 오고 파전집 불이 켜진 그림', 'Rain falls and the pancake shop light is on'], rain: ['비가 와도 파전집 불이 꺼진 그림', 'Rain falls but the pancake shop light is off'],
    sun: ['해가 나고 파전집 불이 꺼진 그림', 'The sun is out and the pancake shop light is off'], q: ['날씨를 모르는 파전집 그림', 'A pancake shop with unknown weather']},
  9: {on: ['우리나라 가게와 바다 건너 미국 가게 모두 불이 켜진 그림', 'Both the Korean shop and the US shop across the sea are lit'], off: ['우리나라 가게는 불이 켜지고 바다 건너 미국 가게는 꺼진 그림', 'The Korean shop is lit and the US shop across the sea is dark'],
    q: ['우리나라 가게만 있고 바다 건너는 모르는 그림', 'The Korean shop, and an unknown shop across the sea']},
});
/** 큰 불빛(판 · 말풍선 머리 · 뜻 줄) — 켜짐 칠한 동그라미 · 꺼짐 빈 동그라미 · 모름 점선 동그라미 안 「?」(HTML 글 · 17px 넘게) */
const lampDot = st => h('span', {class: 'y11-c y11-c-' + st, 'aria-hidden': 'true', text: st === 'q' ? '?' : null});
/* 그림 도구(svg · 글자 없음) */
const sG = (cls, ...kids) => { const g = sv('g', {class: cls}); g.append(...kids); return g; };
const sR = (cls, x, y, w, hh, rx) => sv('rect', {class: cls, x, y, width: w, height: hh, rx});
const sC = (cls, cx, cy, r) => sv('circle', {class: cls, cx, cy, r});
const sP = (cls, d) => sv('path', {class: cls, d});
const sL = (x1, y1, x2, y2) => sv('line', {class: 'y11-ln', x1, y1, x2, y2});
/** 「?」 선 그림(가운데 cx · cy · 크기 k) */
const qMark = (cx, cy, k, big = false) => { const f = v => (+v).toFixed(2);
  return [sP('y11-sq' + (big ? ' y11-sqb' : ''), `M${f(cx - 4 * k)} ${f(cy - 4 * k)}A${f(4 * k)} ${f(4 * k)} 0 1 1 ${f(cx + 2.2 * k)} ${f(cy - 0.66 * k)}Q${f(cx)} ${f(cy + 0.8 * k)} ${f(cx)} ${f(cy + 2.6 * k)}`), sC('y11-sqd', f(cx), f(cy + 6 * k), f(1.4 * k))]; };
/** 간판 불(켜짐이면 둘레 빛) */
const signLamp = (cx, cy, st) => sG('y11-sg' + (st === 'on' ? ' y11-lit' : ''), sC('y11-glo', cx, cy, 20), sC('y11-sl y11-sl-' + st, cx, cy, 11), ...(st === 'q' ? qMark(cx, cy, 1) : []));
/** 가게 하나(차양 · 벽 · 창 · 문 · 간판 불) — 9 그림 */
function shop(x, aw, st) {
  const a = []; for (let j = 0; j < 5; j++) a.push(sR(j % 2 ? 'y11-aw2' : aw, x + j * 20, 62, 20, 16));
  return [sR('y11-wal', x + 6, 78, 88, 54), sG('y11-aw', ...a), sR('y11-awo', x, 62, 100, 16), sR('y11-gls', x + 16, 88, 36, 26, 3), sR('y11-dor', x + 62, 94, 22, 38, 2), sL(x + 50, 62, x + 50, 49), signLamp(x + 50, 38, st)];
}
/** 8 그림 — 비 오는 날 파전집(날씨 = 달러 값 · 금리 · 파전집 = 이 업종 · 간판 불 = 8 불빛) */
function scene8(kind) {
  const rain = kind === 'on' || kind === 'rain', s = sv('svg', {class: 'y11-scn', viewBox: '0 0 320 150', role: 'img', 'aria-label': tl(SCENE_LABEL[8][kind])});
  s.append(sR('y11-sky', 0, 0, 320, 150), sR('y11-gnd', 0, 132, 320, 18));
  if (kind === 'sun') s.append(sG('y11-ray', ...Array.from({length: 8}, (_, j) => { const a = (j * Math.PI) / 4, c = Math.cos(a), n = Math.sin(a), f = v => (+v).toFixed(1); return sv('line', {x1: f(70 + 22 * c), y1: f(40 + 22 * n), x2: f(70 + 29 * c), y2: f(40 + 29 * n)}); })), sC('y11-sun', 70, 40, 16));
  if (rain) s.append(sG('y11-cld', sC(null, 62, 40, 18), sC(null, 88, 30, 24), sC(null, 116, 42, 18), sR(null, 44, 38, 90, 22, 11)),
    sG('y11-rain', ...[[56, 70], [76, 76], [96, 70], [116, 78], [64, 92], [88, 94], [110, 90], [132, 74], [46, 84]].map(([x, y]) => sv('line', {x1: x, y1: y, x2: x - 4, y2: y + 11}))),
    sG('y11-man', sP('y11-umb', 'M96 106a20 14 0 0 1 40 0z'), sL(116, 106, 116, 111), sC('y11-bod', 116, 115, 5.5), sR('y11-bod', 108, 121, 16, 11, 6)));
  const aw = []; for (let j = 0; j < 8; j++) aw.push(sR(j % 2 ? 'y11-aw2' : 'y11-aw1', 160 + j * 19, 52, 19, 18));
  s.append(sR('y11-wal', 168, 70, 136, 62), sG('y11-aw', ...aw), sR('y11-awo', 160, 52, 152, 18), sR('y11-gls', 180, 82, 64, 40, 4),
    sv('ellipse', {class: 'y11-pan', cx: 212, cy: 114, rx: 22, ry: 5}), sv('ellipse', {class: 'y11-cak', cx: 212, cy: 110, rx: 17, ry: 4.5}), sP('y11-oni', 'M203 109h6M212 108h7M219 111h5'),
    sG('y11-stm', sP(null, 'M205 102q-3-5 0-9q3-5 0-9'), sP(null, 'M213 100q-3-5 0-9q3-5 0-9'), sP(null, 'M221 102q-3-5 0-9q3-5 0-9')),
    sR('y11-dor', 256, 86, 34, 46, 3), sC('y11-knb', 283, 110, 2.5), sL(236, 52, 236, 38), signLamp(236, 26, kind === 'on' ? 'on' : kind === 'q' ? 'q' : 'off'));
  return h('div', {class: 'y11-sc', 'data-scene': '8-' + kind}, s);
}
/** 9 그림 — 바다 건너 같은 가게(왼쪽 우리나라 · 늘 켜짐 = 돈이 몰린 곳 · 오른쪽 미국 같은 업종 = 9 불빛) */
function scene9(kind) {
  const s = sv('svg', {class: 'y11-scn', viewBox: '0 0 320 150', role: 'img', 'aria-label': tl(SCENE_LABEL[9][kind])});
  s.append(sR('y11-sky', 0, 0, 320, 150), sR('y11-gnd', 0, 132, 116, 18), sR('y11-gnd', 204, 132, 116, 18), sP('y11-sea', 'M116 132q11-7 22 0t22 0t22 0t22 0V150H116Z'), sP('y11-arc', 'M66 24Q160-6 254 24'), ...shop(16, 'y11-aw1', 'on'));
  if (kind === 'q') s.append(sR('y11-qbox', 208, 62, 96, 70, 6), ...qMark(256, 92, 2.6, true)); else s.append(...shop(204, 'y11-aw3', kind));
  return h('div', {class: 'y11-sc', 'data-scene': '9-' + kind}, s, h('p', {class: 'y11-s9l'}, h('span', {text: EN ? 'Korea' : '우리나라'}), h('span', {text: EN ? 'US' : '미국'})));
}
/** 말풍선 꼬리 — 고른 불빛 가운데 위(몫 % · 큰 글씨 zoom 에서도 제자리) */
export function placeTail(x) {
  const b = x?.querySelector('.y11-lamp[aria-pressed="true"]'), bub = x?.querySelector('.y11-bub'); if (!b || !bub) return;
  const r = b.getBoundingClientRect(), q = bub.getBoundingClientRect(); if (!q.width) return;
  bub.style.setProperty('--tail', Math.max(6, Math.min(94, ((r.left + r.width / 2 - q.left) / q.width) * 100)).toFixed(1) + '%');
}
const talk = {on: false, rz: false};
const canSay = () => typeof globalThis.speechSynthesis !== 'undefined' && typeof globalThis.SpeechSynthesisUtterance === 'function';
/** 소리 — 누를 때만(폰이 읽어 줌 · 한국어 판 ko-KR · 영어 판 en-US) */
function sayIt(text) {
  try { if (!canSay()) return; speechSynthesis.cancel(); if (!text) return; const u = new SpeechSynthesisUtterance(text); u.lang = EN ? 'en-US' : 'ko-KR'; u.rate = 0.9; speechSynthesis.speak(u); } catch { /* 소리 없음 */ }
}
const sndIcon = () => { const s = sv('svg', {width: 22, height: 22, viewBox: '0 0 24 24', 'aria-hidden': 'true'}); s.append(sP('y11-spk', 'M3 9h4l5-4v14l-5-4H3z'), sP('y11-spw', 'M15.5 8.5a5 5 0 0 1 0 7M18.5 5.5a9 9 0 0 1 0 13')); return s; };
/** 말풍선 머리 위 지킴이 — 「(신 얼굴) 지킴이 · 신 이름 ›」 · 불빛 판(켜짐 · 꺼짐 · 모름)은 그대로(뜻이 섞이지 않게)
    얼굴 = 신 캐릭터 그림 단추 — 누르면 그 신 이야기를 소리로 · 글상자(.rms-cap)에 듣는 말 그대로(order-1558) · 이름 · › = 로마 신 72 그 신 카드(#/roman/<번호>) 고리
    묶음(.y11-gw) = 알약(.y11-god · 얼굴 단추 + 이름 고리) + 글상자 · 신 = roman72.js LIGHTS(SEATS 「talk」 무리 차례) */
export function godOf(k) {
  const n = LIGHTS[k], g = GODS[n]; if (!g) return null;
  return h('div', {class: 'y11-gw', 'data-n': String(n)},
    h('div', {class: 'y11-god'}, faceBtn(n, {size: 52, cls: 'y11-gs'}),
      h('a', {class: 'y11-gk', href: '#/roman/' + n}, h('span', {class: 'y11-gl', text: EN ? 'Guardian' : '지킴이'}), ' ', h('b', {class: 'y11-gn', text: EN ? g[2] : g[0]}), ' ', h('i', {class: 'y11-gg', 'aria-hidden': 'true', text: '›'}))),
    capBox());
}
/** 펼친 칸 채우기 — 뜻 줄 · 불빛 판 · 말풍선(누른 불빛이 답함) · 앞 · 다음 · 소리 · 대표 회사 기록이라는 말(panel = home-new.js 가 만든 빈 칸 .y11-x) */
export function talkFill(panel, w, W, WG = []) {
  const L = o => (EN ? o?.en : o?.ko), it = k => (w.items ?? []).find(x => x?.k === k) ?? null, nameOf = k => L(W.names?.[k]) ?? '';
  const groups = Array.isArray(W.groups) && W.groups.length ? W.groups : WG.map(([ko, en, ks]) => ({ko, en, ks}));
  const order = groups.flatMap(g => g.ks ?? []), lamps = new Map(), body = h('div', {class: 'y11-bb'});
  let cur = order.find(k => stOf(it(k)) === 'on') ?? order[0] ?? 1;
  const key = st => h('span', {class: 'y11-k'}, lampDot(st), h('span', {text: tl(TALK_A[st])}));
  const lineOf = k => { const st = stOf(it(k)), kind = sceneKind(k, st, w.calc), cap = kind ? capOf(k, kind) : null;
    return [EN ? `${k}. ${nameOf(k)}.` : `${k}번 ${nameOf(k)}.`, tl(TALK_Q[k] ? [TALK_Q[k][0], TALK_Q[k][1]] : ['', '']), tl(TALK_A[st]) + '.', cap, L(it(k))?.t].filter(Boolean).join(' '); };
  const capOf = (k, kind) => tl(k === 9 && kind === 'q' && !w.calc?.us ? CAP[9].none : CAP[k][kind]);
  function fill(k) {
    const x = it(k), st = stOf(x), tx = L(x), q = TALK_Q[k] ?? ['?', '?', '', ''], kind = sceneKind(k, st, w.calc);
    body.replaceChildren(...[
      godOf(k),
      h('div', {class: 'y11-bh'}, h('b', {class: 'y11-bk', text: EN ? `${k} · ${nameOf(k)}` : `${k}번 ${nameOf(k)}`}), h('span', {class: 'y11-ans y11-a-' + st, text: tl(TALK_A[st])})),
      h('p', {class: 'y11-bq', text: EN ? q[1] : q[0]}),
      kind ? (k === 8 ? scene8(kind) : scene9(kind)) : null,
      kind ? h('p', {class: 'y11-cap', text: capOf(k, kind)}) : null,
      h('p', {class: 'y11-tt', text: tx?.t ?? '?'}),
      tx?.sub ? h('p', {class: 'y11-sub', text: tx.sub}) : null,
      h('p', {class: 'y11-ez'}, h('b', {text: EN ? 'Plain words' : '쉬운 말'}), h('span', {text: EN ? q[3] : q[2]}))].filter(Boolean)); // 빈 자리(null)는 빼고 — 글 「null」이 붙지 않게
  }
  function pick(k, said) {
    cur = k; for (const [kk, b] of lamps) b.setAttribute('aria-pressed', String(kk === k));
    fill(k); placeTail(panel); if (said && talk.on) sayIt(lineOf(k));
  }
  const step = d => { const i = order.indexOf(cur); pick(order[(i + d + order.length) % order.length], true); };
  const board = h('div', {class: 'y11-bd', role: 'group', 'aria-label': EN ? 'Eleven lights' : '불빛 열한 개'}, ...groups.map(g => h('div', {class: 'y11-bg'},
    h('b', {class: 'y11-bn', text: EN ? g.en : g.ko}), // 무리 이름 왼쪽 · 불빛 오른쪽(줄 넷) — 좁으면 불빛이 이름 아래로
    h('div', {class: 'y11-br'}, ...(g.ks ?? []).map(k => { const st = stOf(it(k));
      const b = h('button', {type: 'button', class: 'y11-lamp', 'data-k': String(k), 'data-s': st, 'aria-pressed': String(k === cur), 'aria-label': EN ? `${k} ${nameOf(k)}: ${tl(TALK_A[st])}` : `${k}번 ${nameOf(k)}, ${tl(TALK_A[st])}`, onclick: () => pick(k, true)}, lampDot(st));
      lamps.set(k, b); return b; })))));
  const snd = canSay() ? h('button', {type: 'button', class: 'y11-snd', 'aria-pressed': String(talk.on), onclick: () => {
    talk.on = !talk.on;
    for (const b of document.querySelectorAll('#view .y11-snd')) { b.setAttribute('aria-pressed', String(talk.on)); const t = b.querySelector('span'); if (t) t.textContent = talk.on ? (EN ? 'Stop sound' : '소리 끄기') : (EN ? 'Listen' : '소리로 듣기'); }
    sayIt(talk.on ? lineOf(cur) : null);
  }}, sndIcon(), h('span', {text: talk.on ? (EN ? 'Stop sound' : '소리 끄기') : (EN ? 'Listen' : '소리로 듣기')})) : null;
  fill(cur);
  panel.classList.remove('y11-wait'); panel.replaceChildren(...[h('p', {class: 'y11-hint', text: EN ? 'Tap a light and it answers.' : '불빛을 누르면 그 불빛이 답해요.'}),
    h('p', {class: 'y11-key'}, key('on'), key('off'), key('q')), board,
    h('div', {class: 'y11-bub', 'aria-live': 'polite'}, body, h('div', {class: 'y11-ctl'},
      h('button', {type: 'button', class: 'y11-pv', onclick: () => step(-1)}, EN ? '‹ Back' : '‹ 앞 불빛'),
      h('button', {type: 'button', class: 'y11-nx', onclick: () => step(1)}, EN ? 'Next ›' : '다음 불빛 ›'), snd)),
    L(W.note) ? h('p', {class: 'y11-note', text: L(W.note)}) : null].filter(Boolean)); // 빈 자리(null)는 빼고
  if (!talk.rz) { talk.rz = true; addEventListener('resize', () => { for (const x of document.querySelectorAll('#view details.y11-box[open] > .y11-x')) placeTail(x); }); }
  return panel;
}
