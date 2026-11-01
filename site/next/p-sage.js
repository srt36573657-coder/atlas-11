/* 서른아홉 스승(#/sage · #/sage/<이름>) — 사장님 2026-10-29(서울) 19:14 「자 이 39명에 정신 철학 방식을 말이야 잡스가 정말 바보 천치도 알수 있게 하고 육하원칙에 논리적이면서
   기승전결이며 정말 정말 쉽기 이용하고 따딱딱 되게 만들며 제공되는 정조에 질은 하바드 이상이고 … 36가지 아이디를 낸다음 … 재 정비 하여 예술적인 걸작을 만들어 봐라 퍼음 부처 끝까지」
   (docs/design/wise39-2026-10-29/order-1914.txt · 아이디어 서른여섯과 재정비 ideas-36.md)
   뼈대 = 프랙털 기승전결 — 쪽 전체가 네 걸음(① 묻기 「정말 알아?」 → ② 보기 「직접 봤어?」 → ③ 따지기 「틀릴 수 있어?」 → ④ 지키기 「정한 대로 했어?」)이고
   한 사람 카드도 네 줄(기 누가 · 언제 · 어디서 → 승 왜 → 전 무엇을 · 어떻게 → 결 오늘 나라면)이라 육하원칙 여섯 칸이 네 줄 안에 다 듦
   자료 = /next/data/sage39.json(build.py — 남긴 말은 표시 넷: 글 그대로 옮김 · 글을 줄여 옮김 · 뜻을 풀어 씀 · 뒷사람이 적은 이야기 · 원문 · 출처)
   영어 화면은 자료의 영어 글을 바로 그림(사전 틀 없이 같은 질) · 앞날 말 · 사고팔기 말 없음 · 그림은 꾸밈(aria-hidden) — 글 설명이 같은 뜻을 말함
   읽는 종이 판(사장님 2026-10-30 00:03 「그게아니라 글씨체랑 글씨크기랑 배경색이랑 글씨색이 가독성이 떨어진다고」 · docs/design/read-2026-10-30/order-0003.txt)
   — 밝은 종이 바탕 · 본문 글꼴 하나 · 큰 글씨 · 검정 글은 p-sage.css 와 app.js whiteFor(html.pg-sage)
   듣기(사장님 2026-10-31 22:40(+04) 「응」 — 물음 「서른아홉 스승 쪽도 스승 이야기를 차례로 들려 드릴까요?」 · 22:41 「그냥 신 처럼 끝까지 다해」 · docs/design/sage-say-2026-11-01/order-0340.txt)
   — 로마 신 72 쪽 듣기 넷을 그대로: 한 사람 쪽 「이야기 듣기」 · 네 걸음마다 「열 스승 차례로 듣기」 · 맨 위 「서른아홉 스승 모두 듣기」 · 멈춘 스승부터 이어 듣기 + 「처음부터」
   읽는 말 = 쪽에 적힌 글 그대로(이름 · 큰 낱말 → 기 · 승 · 전 · 결 — 한 줄씩) · 소리 줄은 로마 신 쪽과 하나(roman-say.js sayAll — 한 번에 하나 · 누를 때만 · 쪽을 옮기면 멈춤)
   한 사람 쪽 = 읽는 줄에 테(글이 쪽에 있음) · 첫 쪽 = 읽는 칸에 테 + 쪽 아래 글상자(.sg-now — 칸에는 이름 · 낱말만 있어 지금 읽는 줄을 그대로 보임)
   캐릭터 얼굴(사장님 2026-11-01 05:46(+04) 「응 캐릭터 만들어서」 — 물음 「서른아홉 스승이 남긴 말도 소리로 읽어 드릴까요?」의 답 · docs/design/sage-art-2026-11-01/order-1046.txt)
   — 스승마다 새로 그린 얼굴(그림 기계 scripts/atlas11/next/sage_art.mjs → /next/sage-art/<이름>.svg) · 첫 쪽 칸 · 한 사람 쪽 머리
   — 얼굴을 누르면 그 스승이 남긴 말(쪽 글 그대로 「(이름)이 남긴 말. …」) · 첫 쪽 = 그 칸에 테 + 쪽 아래 글상자 · 한 사람 쪽 = 남긴 말 칸에 테 + 머리 아래 글상자 · 다시 누르면 멈춤
   — 이야기 듣기 · 차례로 듣기 · 모두 듣기도 사람마다 여섯째 줄 「남긴 말. …」 · 소리를 못 내는 휴대폰은 얼굴이 그림만(단추 아님) */
import {ON as EN} from './i18n.js';
import {NAME, NAME_EN, josa} from './brand.js'; // 이름은 한 곳(규칙 76)
import {sayAll, sayText, spkMark, canSpeak, playing, stop as hush} from './roman-say.js'; // 듣기(order-0340) — 로마 신 쪽과 같은 소리 줄(이 쪽 방 지킴이 아폴로 얼굴도 이 줄 · 하나가 말하면 다른 것은 멈춤) · 스승 얼굴(order-1046) = sayText

const nx = () => globalThis.NX;
const h = (...a) => nx().h(...a);
const SVGNS = 'http://www.w3.org/2000/svg';
const S = (tag, attrs = {}, ...kids) => { const e = document.createElementNS(SVGNS, tag); for (const [k, v] of Object.entries(attrs)) if (v != null) e.setAttribute(k, String(v)); for (const k of kids.flat()) if (k) e.append(k); return e; };

/** 걸음마다 사람 수를 말로(차례로 듣기 단추 글 — 「열 스승」 · 「Hear all ten」 · 로마 신 쪽과 같은 셈) */
const KO_N = ['', '한', '두', '세', '네', '다섯', '여섯', '일곱', '여덟', '아홉', '열', '열한', '열두', '열세', '열네', '열다섯', '열여섯', '열일곱', '열여덟', '열아홉', '스무'];
const EN_N = ['', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen', 'twenty'];
/** 화면 말(자료 밖) — 한국어 · 영어 두 벌 */
const T = EN ? {
  title: '39 Masters', lead: 'Ways of thinking found by 39 people in the East and West over 2,500 years.', lead2: 'Put together, they make four steps.',
  band: 'Each dot is one person. Left is long ago; right is recent. East above, West below.', east: 'East', west: 'West', axis: ['2,500 years ago', 'Now'],
  steps: 'Four steps', step: k => `Step ${k}`, when: 'When', one: 'One voice from 39 people', oneLine: 'Ask, look, weigh, and keep.',
  note: 'Every person has a source. Where we paraphrase, we say so.', pos: (i, n) => `${i} / ${n}`,
  beats: ['Who · When · Where', 'Why', 'What · How', 'Try today'], spine: ['1', '2', '3', '4'],
  said: 'In their words', kinds: {quote: 'Translated as written', short: 'Shortened translation', gist: 'Meaning paraphrased', told: 'Told by a later writer'},
  orig: 'Original', src: 'Source', tryIt: `Try it on ${NAME_EN}`, all: 'All 39', ago: n => `${n.toLocaleString('en-US')} years ago`,
  miss: '? Could not load the masters. Please open it again in a moment.', none: 'There is no such person. Here are all 39.',
  q: s => `“${s}”`, people: '39 people',
  story: 'Hear the story', stop: 'Stop', all: n => `Hear all ${EN_N[n] ?? n} in order`, every: 'Hear all thirty-nine in order',
  resume: 'Resume where I stopped', again: 'From the start', stopped: x => `Stopped at: ${x}`,
  face: n => `Hear ${n}’s words`, faceSay: (n, s) => `In ${n}’s words. ${s}`, hint: 'Tap a face to hear that master’s words.',
} : {
  title: '서른아홉 스승', lead: '2,500년 동안 동양과 서양의 서른아홉 사람이 찾은 생각하는 법을 모았어요.', lead2: '모아 보니 네 걸음이에요.',
  band: '점 하나가 한 사람이에요. 왼쪽이 오래전, 오른쪽이 요즘이에요. 위는 동양, 아래는 서양이에요.', east: '동양', west: '서양', axis: ['2,500년 전', '지금'],
  steps: '네 걸음', step: k => `${k}걸음`, when: '이럴 때', one: '서른아홉 사람의 한목소리', oneLine: '묻고, 보고, 따지고, 지켜요.',
  note: '사람마다 출처를 적었어요. 뜻을 풀어 쓴 말은 그렇다고 표시했어요.', pos: (i, n) => `${i} / ${n}`,
  beats: ['누가 · 언제 · 어디서', '왜', '무엇을 · 어떻게', '오늘 나라면'], spine: ['기', '승', '전', '결'],
  said: '남긴 말', kinds: {quote: '글 그대로 옮김', short: '글을 줄여 옮김', gist: '뜻을 풀어 씀', told: '뒷사람이 적은 이야기'},
  orig: '원문', src: '출처', tryIt: `${NAME}에서 해 보기`, all: '모두 보기', ago: n => `${n.toLocaleString('en-US')}년 전`,
  miss: '? 스승 자료를 받지 못했어요. 잠시 뒤 다시 열어 주세요.', none: '그런 사람은 없어요. 서른아홉 사람을 모두 보여 드려요.',
  q: s => `「${s}」`, people: '서른아홉 사람',
  story: '이야기 듣기', stop: '멈추기', all: n => `${KO_N[n] ?? n} 스승 차례로 듣기`, every: '서른아홉 스승 모두 듣기',
  resume: '멈춘 스승부터 이어 듣기', again: '처음부터', stopped: x => `멈춘 곳: ${x}`,
  face: n => `${n} 남긴 말 듣기`, faceSay: (n, s) => `${josa(n, '이')} 남긴 말. ${s}`, hint: '얼굴을 누르면 그 스승이 남긴 말을 들려줘요.',
};
const L = EN ? 'en' : 'ko';
const SAFE = `${josa(NAME, '는')} 지난 기록만 보여 줘요. 사고팔기를 권하지 않아요.`; // 둘이 안전 문장(돌이 단추 안과 같은 글 — 영어 화면은 엔진 사전이 바꿈)

/* 자료 — 모듈을 받자마자 같이 받기 시작(모양 파일과 나란히) · 못 받으면 다음에 다시 */
let DATA = null, DP = null;
const load = () => {
  if (DATA) return Promise.resolve(DATA);
  if (!DP) DP = fetch('/next/data/sage39.json', {cache: 'no-cache'}).then(r => (r.ok ? r.json() : null)).catch(() => null)
    .then(j => { DP = null; if (j && Array.isArray(j.people) && j.people.length && Array.isArray(j.steps)) DATA = j; return DATA; });
  return DP;
};
load();

/* 걸음 그림 넷(24 칸 · 선 · 걸음 빛) — ① 물음표 · ② 눈 · ③ 저울 · ④ 닻 */
const GLYPH = {
  1: ['M12 3.5a8.5 8.5 0 1 1 0 17a8.5 8.5 0 1 1 0-17z', 'M9.6 9.6a2.5 2.5 0 1 1 3.4 2.3c-.7.3-1 .8-1 1.6v.5', 'M12 16.9v.2'],
  2: ['M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6z', 'M12 9.4a2.6 2.6 0 1 1 0 5.2a2.6 2.6 0 1 1 0-5.2z'],
  3: ['M12 4v16', 'M8 20h8', 'M5 7.5h14', 'M5 7.5l-2.5 6h5z', 'M19 7.5l-2.5 6h5z'],
  4: ['M12 3.2a2 2 0 1 1 0 4a2 2 0 1 1 0-4z', 'M12 7.2V21', 'M8.5 10.5h7', 'M4.5 13.5a7.5 7.5 0 0 0 15 0'],
};
const glyph = (k, cls = 'sg-gl') => S('svg', {class: cls, viewBox: '0 0 24 24', 'aria-hidden': 'true', focusable: 'false'}, ...GLYPH[k].map(d => S('path', {d})));

/* 별자리 띠 — 해(가로 · 기원전 600년 ~ 2026년 같은 간격) · 위 동양 · 아래 서양 · 겹치면 바깥쪽으로 한 칸씩 쌓음 · hi = 이 사람만 밝게 */
const W = 360, X0 = 34, X1 = 348, Y0 = -600, Y1 = 2026, M = 80, R = 5, STEP = 11;
const xOf = y => X0 + (y - Y0) / (Y1 - Y0) * (X1 - X0);
function layout(people) {
  const out = new Map(), placed = {e: [], w: []};
  for (const p of [...people].sort((a, b) => a.year - b.year)) {
    const side = p.east ? 'e' : 'w', x = xOf(p.year), dir = p.east ? -1 : 1;
    for (let lv = 0; lv < 12; lv++) {
      const y = M + dir * (15 + lv * STEP);
      if (placed[side].every(q => (q.x - x) ** 2 + (q.y - y) ** 2 >= (2 * R + 1) ** 2)) { placed[side].push({x, y}); out.set(p.id, {x, y}); break; }
    }
  }
  return out;
}
function band(d, hi = null) {
  const pos = layout(d.people), ys = [...pos.values()].map(v => v.y), top = Math.min(...ys) - R - 8, bot = Math.max(...ys) + R + 8;
  const svg = S('svg', {class: 'sg-sky', viewBox: `0 ${Math.floor(top)} ${W} ${Math.ceil(bot - top)}`, 'aria-hidden': 'true', focusable: 'false'});
  svg.append(S('line', {class: 'sg-ax', x1: X0 - 8, x2: X1, y1: M, y2: M}));
  for (const yr of [-500, 2026]) svg.append(S('line', {class: 'sg-tk', x1: xOf(yr), x2: xOf(yr), y1: M - 4, y2: M + 4}));
  for (const p of d.people) {
    const v = pos.get(p.id); if (!v) continue;
    svg.append(S('circle', {class: `sg-dot s${p.step}${hi ? (p.id === hi ? ' on' : ' off') : ''}`, cx: v.x.toFixed(1), cy: v.y.toFixed(1), r: p.id === hi ? R + 2 : R}));
  }
  if (hi && pos.get(hi)) { const v = pos.get(hi); svg.append(S('circle', {class: 'sg-ring', cx: v.x.toFixed(1), cy: v.y.toFixed(1), r: R + 6})); }
  return h('div', {class: 'sg-skyw'}, svg, h('p', {class: 'sg-axl', 'aria-hidden': 'true'}, h('span', {class: 'a0', text: T.axis[0]}), h('span', {class: 'a1', text: T.axis[1]})));
}
const legend = d => h('ul', {class: 'sg-legend', 'aria-label': T.steps}, d.steps.map(s => h('li', {class: `s${s.k}`}, h('i', {'aria-hidden': 'true'}), h('span', {text: s[L].v}))));

/* ── 듣기(order-0340) ── 로마 신 72 쪽과 같은 단추 · 같은 소리 줄 */
const dot = s => (/[.?!]$/.test(s) ? s : s + '.');
/** 한 사람 이야기 — 쪽에 적힌 글 그대로 여섯 줄(「이름. 큰 낱말.」 · 기 · 승 · 전 · 결 · 「남긴 말. …」 order-1046) · 한 줄씩 소리 줄에(긴 말 하나는 휴대폰이 중간에 끊기도 함) */
const linesOf = p => { const t = p[L]; return [`${dot(t.name)} ${dot(t.key)}`, t.gi, t.seung, t.jeon, t.today, `${T.said}. ${t.say}`]; };
/** 얼굴을 누르면 읽는 말 — 「(이름)이 남긴 말. (쪽에 적힌 남긴 말 그대로)」 */
const faceLine = p => T.faceSay(p[L].name, p[L].say);
const ART = id => `/next/sage-art/${id}.svg`;
/** 스승 얼굴(order-1046) — 소리를 내는 휴대폰 = 단추(누르면 남긴 말 · 오른쪽 아래 소리 표 · 읽는 이름 「(이름) 남긴 말 듣기」) · 못 내면 그림만(꾸밈)
    where() = 누른 그 순간의 {card 테, cap 글상자} · after(b) = 누른 뒤(첫 쪽 — 읽기 시작하면 그 칸을 글상자 위에 둠) · 그림 이름은 비움(이름이 곁에 있음) · 자리를 미리 잡음(밀림 0) */
function faceOf(p, size, where, lazy = false, after = null) {
  const im = h('img', {alt: '', width: size, height: size, decoding: 'async', loading: lazy ? 'lazy' : null, src: ART(p.id)});
  if (!canSpeak()) return h('span', {class: 'sg-face sg-fimg', 'aria-hidden': 'true'}, im);
  const b = h('button', {type: 'button', class: 'sg-face', 'aria-pressed': 'false', 'aria-label': T.face(p[L].name), 'data-id': p.id, onclick: e => { e.preventDefault(); e.stopPropagation(); sayText(faceLine(p), b, where()); after?.(b); }}, im);
  b.append(spkMark());
  return b;
}
const whoOf = p => `${T.step(p.step)} · ${p[L].name}`;
const still = () => !!globalThis.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;
/** 읽는 칸을 위 막대 아래 · 쪽 아래 글상자 위에 둠 — 글상자에 듣는 줄을 먼저 넣고 그 높이를 잼(긴 줄 · 아주 크게면 글상자가 큼) · 가리거나 화면 밖이면 그 사이 가운데로 */
const keep = (a, now, text) => {
  if (now) { now.textContent = text; now.hidden = false; }
  const r = a.getBoundingClientRect(), lim = now ? now.getBoundingClientRect().top - 8 : innerHeight - 80;
  if (r.top >= 72 && r.bottom <= lim) return;
  scrollBy({top: r.top + r.height / 2 - (72 + lim) / 2, behavior: still() ? 'auto' : 'smooth'});
};
/** 첫 쪽 — 사람 칸(sel) 차례대로 한 사람 다섯 줄씩 · 칸 = 테 · 글상자 = 듣는 줄 그대로 · 화면에 두기는 keep(own — roman-say.js 는 안 굴림) */
const itemsOf = (d, sel, now) => [...document.querySelectorAll(sel)].flatMap(a => {
  const p = d.people.find(x => x.id === a.dataset.id); if (!p) return [];
  return linesOf(p).map(text => ({id: p.id, who: whoOf(p), text, label: text, card: a, face: a.querySelector('button.sg-face'), own: true, go: () => keep(a, now, text)}));
});
const SVG_ICON = {viewBox: '0 0 24 24', width: 28, height: 28, 'aria-hidden': 'true', focusable: 'false', fill: 'currentColor'};
/** 처음 = 세모(듣기) · 읽는 중 = 네모(멈추기) · 글자 없는 그림 */
const playIcon = on => S('svg', SVG_ICON, on ? S('rect', {x: 6, y: 6, width: 12, height: 12, rx: 2}) : S('path', {d: 'M8 5.5v13l10.5-6.5z'}));
/** 듣기 단추 하나 — label = 처음 글 · run(b, set) = 누르면 · set(on) 이 단추 모양(읽는 중 「멈추기」 · 네모) */
function listenBtn(label, run, extra = '') {
  const t = h('span', {class: 'sg-allt', text: label});
  let ic = playIcon(false);
  const look = on => { b.classList.toggle('sg-allon', on); const x = playIcon(on); ic.replaceWith(x); ic = x; };
  const b = h('button', {type: 'button', class: 'sg-allb' + (extra ? ' ' + extra : ''), onclick: () => run(b)}, ic, t);
  return {b, t, look};
}
/** 걸음 하나 차례로 듣기 — 그 걸음 사람 칸 차례대로 · now = 쪽 아래 글상자 */
function stepBar(d, k, n, now) {
  if (!canSpeak()) return null; // 소리를 못 내는 휴대폰 — 단추 없음(칸은 그대로)
  const label = T.all(n);
  const {b, t, look} = listenBtn(label, btn => sayAll(itemsOf(d, `#view #sg-s${k} .sg-tile`, now), btn, {cap: now, set}));
  const set = on => { look(on); t.textContent = on ? T.stop : label; };
  return h('div', {class: 'sg-all'}, b);
}
/** 멈춘 스승(이 휴대폰에만) — {id 이름, at 때} · 못 읽거나 자료에 없는 이름이면 없음 */
const AT_KEY = 'atlas:sage-at';
const atLoad = d => { try { const v = JSON.parse(localStorage.getItem(AT_KEY) ?? 'null'); return v && d.people.some(p => p.id === v.id) ? v.id : null; } catch { return null; } };
const atSave = id => { try { if (id) localStorage.setItem(AT_KEY, JSON.stringify({id, at: Date.now()})); else localStorage.removeItem(AT_KEY); } catch { /* 기억 못 하는 휴대폰 — 늘 처음부터 */ } };
/** 서른아홉 스승 모두 듣기 + 멈춘 스승부터 이어 듣기 — 쪽 칸 차례 그대로 · 멈추면 읽던 사람을 기억 · 끝까지 들으면 지움
    처음 = 「서른아홉 스승 모두 듣기」 · 멈춘 사람이 있으면 「멈춘 스승부터 이어 듣기」 + 「처음부터」 · 단추 아래 「멈춘 곳: …」 · 읽는 중 = 「멈추기」 · 쪽 아래 글상자 = 듣는 줄 */
function everyBar(d, now) {
  if (!canSpeak()) return null;
  const SEL = '#view .sg-step .sg-tile';
  const cap = h('p', {class: 'sg-allc', 'aria-live': 'polite', hidden: true});
  const play = (btn, fromStart) => {
    if (playing(btn)) { hush(); return; } // 읽는 중 = 멈춤(멈춘 사람은 set 이 적음)
    if (fromStart) atSave(null);
    const list = itemsOf(d, SEL, now), id = atLoad(d), k = id ? Math.max(0, list.findIndex(x => x.id === id)) : 0;
    sayAll(list.slice(k), btn, {cap: now, set});
  };
  const {b, t, look} = listenBtn(T.every, btn => play(btn, false));
  const re = h('button', {type: 'button', class: 'sg-allr', hidden: true, onclick: () => play(b, true), text: T.again});
  const idle = () => { // 멈춘 사람이 있으면 이어 듣기 모양
    const id = atLoad(d), p = id ? d.people.find(x => x.id === id) : null;
    t.textContent = p ? T.resume : T.every; re.hidden = !p;
    if (p) { cap.textContent = T.stopped(whoOf(p)); cap.hidden = false; } else { cap.textContent = ''; cap.hidden = true; }
  };
  const set = (on, info) => {
    look(on);
    if (on) { t.textContent = T.stop; re.hidden = true; cap.hidden = true; return; }
    if (info?.done) atSave(null); else if (info?.item?.id) atSave(info.item.id); // 끝까지 = 지움 · 중간에 멈춤 = 읽던 사람
    idle();
  };
  idle();
  return h('div', {class: 'sg-all sg-every'}, h('div', {class: 'sg-allrow'}, b, re), cap);
}
/** 한 사람 쪽 「이야기 듣기」 — 머리(이름 · 큰 낱말) → 기 · 승 · 전 · 결 → 남긴 말(order-1046) · 읽는 칸에 테(글이 쪽에 있어 글상자 없음 · 로마 신 카드와 같음) */
function storyBar(p) {
  if (!canSpeak()) return null;
  const items = () => { const v = document.querySelector('#view .sg-card'); if (!v) return []; const at = [v.querySelector('.sg-head'), ...v.querySelectorAll('.sg-story .sg-b'), v.querySelector('.sg-say')]; return linesOf(p).map((text, i) => ({id: p.id, who: whoOf(p), text, label: text, card: at[i] ?? null})); };
  const {b, t, look} = listenBtn(T.story, btn => sayAll(items(), btn, {set}), 'sg-storyb');
  const set = on => { look(on); t.textContent = on ? T.stop : T.story; };
  return h('div', {class: 'sg-all'}, b);
}

/* ── 첫 쪽(#/sage) ── 기 큰 제목 · 별자리 → 승 네 걸음 단추 → 전 걸음마다 사람 카드 → 결 한목소리 · 안전 문장 */
function index(d, note = '') {
  const now = canSpeak() ? h('p', {class: 'sg-now', 'aria-live': 'polite', hidden: true}) : null; // 듣는 줄 그대로(order-0340) — 쪽 맨 끝에 두고 아래 막대 위에 붙임(어느 칸을 읽어도 보임)
  // 걸음 단추 — 그 걸음으로 옮김(움직임 줄이기면 바로 · 2026-11-01 진짜 사이트 큰 검사 41271127432 — 얼굴 칸으로 쪽이 길어져 부드럽게 옮기는 동안 검사가 먼저 잼)
  const jump = s => h('button', {type: 'button', class: `sg-jump s${s.k}`, onclick: () => document.getElementById('sg-s' + s.k)?.scrollIntoView({behavior: still() ? 'auto' : 'smooth', block: 'start'})},
    glyph(s.k), h('span', {class: 'sg-jn', text: T.step(s.k)}), h('b', {text: s[L].v}), h('span', {class: 'sg-jq', text: s[L].q}));
  // 사람 칸 = 칸(div) — 얼굴 단추(누르면 남긴 말 · order-1046)와 한 사람 쪽 고리를 나눔(단추를 고리 안에 넣지 않음 · 로마 신 카드와 같음) · 얼굴은 화면 가까이 올 때 받음
  const tile = p => { const t = h('div', {class: `sg-tile s${p.step}`, 'data-id': p.id});
    t.append(faceOf(p, 64, () => ({card: t, cap: now}), true, b => { if (b.getAttribute('aria-pressed') === 'true') keep(t, now, faceLine(p)); }), h('a', {class: 'sg-tl', href: '#/sage/' + p.id},
      h('b', {class: 'sg-tn', text: p[L].name}), h('span', {class: 'sg-tk2', text: p[L].key}), h('span', {class: 'sg-ta', text: T.ago(p.ago)}), h('i', {class: 'sg-tgo', 'aria-hidden': 'true', text: '›'})));
    return h('li', {}, t); };
  const sec = s => {
    const ps = d.people.filter(p => p.step === s.k);
    return h('section', {class: `sg-step s${s.k}`, id: 'sg-s' + s.k, 'aria-labelledby': 'sg-h' + s.k},
      h('h2', {class: 'sg-sh', id: 'sg-h' + s.k}, h('span', {class: 'sg-sn', 'aria-hidden': 'true', text: String(s.k)}), h('span', {class: 'sg-sv', text: s[L].v}), h('span', {class: 'sg-sq', text: s[L].q})),
      h('p', {class: 'sg-st', text: s[L].t}),
      h('p', {class: 'sg-when'}, h('b', {text: T.when}), h('span', {text: s[L].when})),
      stepBar(d, s.k, ps.length, now), '\n', // 그 걸음 차례로 듣기(order-0340) · 빈 줄 = 쪽 글을 이어 읽을 때 「…듣기」와 첫 칸 글이 붙지 않게(next_check 쓰지 않을 말 · 칸 판에서는 안 보임)
      h('ul', {class: 'sg-grid'}, ps.map(tile)));
  };
  return {title: T.title, nodes: [h('div', {class: 'sg sg-index'},
    h('header', {class: 'sg-hero'}, h('h1', {class: 'h sg-h1', text: T.title}), h('p', {class: 'sg-lead', text: T.lead}), note ? h('p', {class: 'sg-note', role: 'status', text: note}) : null,
      everyBar(d, now), '\n', now ? h('p', {class: 'sg-hint', text: T.hint}) : null), // 서른아홉 스승 모두 듣기 · 멈춘 스승부터 이어 듣기(order-0340) · 얼굴 안내(order-1046 — 소리를 내는 휴대폰만)
    h('figure', {class: 'sg-band'}, band(d), h('figcaption', {}, h('span', {class: 'sg-cap', text: T.band}), legend(d))),
    h('p', {class: 'sg-lead2', text: T.lead2}),
    h('nav', {class: 'sg-jumps', 'aria-label': T.steps}, d.steps.map(jump)),
    ...d.steps.map(sec),
    h('section', {class: 'sg-end', 'aria-labelledby': 'sg-hend'}, h('h2', {class: 'sg-eh', id: 'sg-hend', text: T.one}), h('p', {class: 'sg-one', text: T.oneLine}), h('p', {class: 'sg-note', text: T.note})),
    h('p', {class: 'safe', text: SAFE}), now)]};
}

/* ── 한 사람(#/sage/<이름>) ── 걸음 표 → 얼굴 · 큰 낱말 · 이름 → 별자리에서 그 사람 자리 → 기승전결 네 줄 → 남긴 말 · 원문 · 출처 → 수르에서 해 보기 → 앞 · 모두 · 다음 */
function card(d, i) {
  const p = d.people[i], n = d.people.length, s = d.steps[p.step - 1], t = p[L];
  const prev = d.people[(i - 1 + n) % n], next = d.people[(i + 1) % n];
  // 한 줄 = 머리(기 · 승 · 전 · 결 동그라미 + 이름표) 아래에 글 — 글이 쪽 너비를 다 씀(2026-10-30 00:03 읽는 종이 판 · 글 24px 이 한 줄에 열넷 자쯤)
  const beat = (k, label, text) => h('li', {class: 'sg-b b' + (k + 1)},
    h('p', {class: 'sg-bh'}, h('span', {class: 'sg-sp', 'aria-hidden': 'true', text: T.spine[k]}), h('b', {class: 'sg-bl', text: label})),
    h('div', {class: 'sg-bt'}, h('p', {text})));
  const showOrig = p.orig && !(EN && p.olang === 'en'); // 영어 화면에서 영어 원문은 남긴 말과 같아 뺌
  return {title: `${t.name} · ${T.title}`, nodes: [h('article', {class: `sg sg-card s${p.step}`, 'aria-labelledby': 'sg-name'},
    h('p', {class: 'sg-top'}, h('a', {class: `sg-chip s${p.step}`, href: '#/sage'}, glyph(p.step), h('span', {text: `${T.step(p.step)} · ${s[L].v} · ${s[L].q}`})), h('span', {class: 'sg-pos', text: T.pos(i + 1, n)})),
    h('header', {class: 'sg-head'}, faceOf(p, 96, () => ({card: document.querySelector('#view .sg-card .sg-say'), cap: document.querySelector('#view .sg-card .sg-fcap')})), // 얼굴(order-1046) — 누르면 남긴 말 · 남긴 말 칸에 테 · 머리 아래 글상자
      h('div', {class: 'sg-ht'}, h('p', {class: 'sg-key', text: t.key}), h('h1', {class: 'h sg-name', id: 'sg-name', text: t.name}), h('p', {class: 'sg-meta', text: `${t.life} · ${t.place}`})),
      canSpeak() ? h('p', {class: 'sg-fcap', 'aria-live': 'polite', hidden: true}) : null),
    storyBar(p), '\n', // 이야기 듣기(order-0340) — 머리 → 네 줄 차례로 · 빈 줄 = 쪽 글을 이어 읽을 때 옆 글과 붙지 않게
    h('figure', {class: 'sg-band sg-band-sm'}, band(d, p.id), h('figcaption', {}, h('span', {class: 'sg-cap', text: `${T.ago(p.ago)} · ${p.east ? T.east : T.west}`}))),
    h('ol', {class: 'sg-story'}, beat(0, T.beats[0], t.gi), beat(1, T.beats[1], t.seung), beat(2, T.beats[2], t.jeon), beat(3, T.beats[3], t.today)),
    h('figure', {class: 'sg-say'},
      h('figcaption', {class: 'sg-sayh'}, h('b', {text: T.said}), h('span', {class: `sg-kind k-${t.kind}`, text: T.kinds[t.kind]})),
      h('blockquote', {class: 'sg-q'}, h('p', {text: T.q(t.say)})),
      showOrig ? h('p', {class: 'sg-orig'}, h('b', {text: T.orig}), h('span', {lang: p.olang, text: p.orig})) : null,
      h('p', {class: 'sg-src'}, h('b', {text: T.src}), h('span', {text: t.src}))),
    h('a', {class: `sg-go s${p.step}`, href: s.href}, h('span', {class: 'sg-gol', text: T.tryIt}), h('b', {text: s[L].go}), h('i', {'aria-hidden': 'true', text: '›'})),
    h('nav', {class: 'sg-nav', 'aria-label': T.people},
      h('a', {class: 'sg-nb prev', href: '#/sage/' + prev.id, rel: 'prev'}, h('i', {'aria-hidden': 'true', text: '‹'}), h('span', {text: prev[L].short})),
      h('a', {class: 'sg-nb next', href: '#/sage/' + next.id, rel: 'next'}, h('span', {text: next[L].short}), h('i', {'aria-hidden': 'true', text: '›'})),
      h('a', {class: 'sg-nb all', href: '#/sage'}, h('span', {text: T.all}))))]};
}

export async function render(arg) {
  const d = await load();
  if (!d) return {title: T.title, nodes: [h('h1', {class: 'h', text: T.title}), h('p', {class: 'empty', text: T.miss})]};
  const id = String(arg ?? '').split('/')[0];
  if (!id) return index(d);
  const i = d.people.findIndex(p => p.id === id);
  return i < 0 ? index(d, T.none) : card(d, i);
}
