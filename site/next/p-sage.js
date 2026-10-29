/* 서른아홉 스승(#/sage · #/sage/<이름>) — 사장님 2026-10-29(서울) 19:14 「자 이 39명에 정신 철학 방식을 말이야 잡스가 정말 바보 천치도 알수 있게 하고 육하원칙에 논리적이면서
   기승전결이며 정말 정말 쉽기 이용하고 따딱딱 되게 만들며 제공되는 정조에 질은 하바드 이상이고 … 36가지 아이디를 낸다음 … 재 정비 하여 예술적인 걸작을 만들어 봐라 퍼음 부처 끝까지」
   (docs/design/wise39-2026-10-29/order-1914.txt · 아이디어 서른여섯과 재정비 ideas-36.md)
   뼈대 = 프랙털 기승전결 — 쪽 전체가 네 걸음(① 묻기 「정말 알아?」 → ② 보기 「직접 봤어?」 → ③ 따지기 「틀릴 수 있어?」 → ④ 지키기 「정한 대로 했어?」)이고
   한 사람 카드도 네 줄(기 누가 · 언제 · 어디서 → 승 왜 → 전 무엇을 · 어떻게 → 결 오늘 나라면)이라 육하원칙 여섯 칸이 네 줄 안에 다 듦
   자료 = /next/data/sage39.json(build.py — 남긴 말은 표시 넷: 글 그대로 옮김 · 글을 줄여 옮김 · 뜻을 풀어 씀 · 뒷사람이 적은 이야기 · 원문 · 출처)
   영어 화면은 자료의 영어 글을 바로 그림(사전 틀 없이 같은 질) · 앞날 말 · 사고팔기 말 없음 · 그림은 꾸밈(aria-hidden) — 글 설명이 같은 뜻을 말함
   읽는 종이 판(사장님 2026-10-30 00:03 「그게아니라 글씨체랑 글씨크기랑 배경색이랑 글씨색이 가독성이 떨어진다고」 · docs/design/read-2026-10-30/order-0003.txt)
   — 밝은 종이 바탕 · 본문 글꼴 하나 · 큰 글씨 · 검정 글은 p-sage.css 와 app.js whiteFor(html.pg-sage) */
import {ON as EN} from './i18n.js';
import {NAME, NAME_EN, josa} from './brand.js'; // 이름은 한 곳(규칙 76)

const nx = () => globalThis.NX;
const h = (...a) => nx().h(...a);
const SVGNS = 'http://www.w3.org/2000/svg';
const S = (tag, attrs = {}, ...kids) => { const e = document.createElementNS(SVGNS, tag); for (const [k, v] of Object.entries(attrs)) if (v != null) e.setAttribute(k, String(v)); for (const k of kids.flat()) if (k) e.append(k); return e; };

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

/* ── 첫 쪽(#/sage) ── 기 큰 제목 · 별자리 → 승 네 걸음 단추 → 전 걸음마다 사람 카드 → 결 한목소리 · 안전 문장 */
function index(d, note = '') {
  const jump = s => h('button', {type: 'button', class: `sg-jump s${s.k}`, onclick: () => document.getElementById('sg-s' + s.k)?.scrollIntoView({behavior: 'smooth', block: 'start'})},
    glyph(s.k), h('span', {class: 'sg-jn', text: T.step(s.k)}), h('b', {text: s[L].v}), h('span', {class: 'sg-jq', text: s[L].q}));
  const tile = p => h('li', {}, h('a', {class: `sg-tile s${p.step}`, href: '#/sage/' + p.id},
    glyph(p.step), h('b', {class: 'sg-tn', text: p[L].name}), h('span', {class: 'sg-tk2', text: p[L].key}), h('span', {class: 'sg-ta', text: T.ago(p.ago)}), h('i', {class: 'sg-tgo', 'aria-hidden': 'true', text: '›'})));
  const sec = s => {
    const ps = d.people.filter(p => p.step === s.k);
    return h('section', {class: `sg-step s${s.k}`, id: 'sg-s' + s.k, 'aria-labelledby': 'sg-h' + s.k},
      h('h2', {class: 'sg-sh', id: 'sg-h' + s.k}, h('span', {class: 'sg-sn', 'aria-hidden': 'true', text: String(s.k)}), h('span', {class: 'sg-sv', text: s[L].v}), h('span', {class: 'sg-sq', text: s[L].q})),
      h('p', {class: 'sg-st', text: s[L].t}),
      h('p', {class: 'sg-when'}, h('b', {text: T.when}), h('span', {text: s[L].when})),
      h('ul', {class: 'sg-grid'}, ps.map(tile)));
  };
  return {title: T.title, nodes: [h('div', {class: 'sg sg-index'},
    h('header', {class: 'sg-hero'}, h('h1', {class: 'h sg-h1', text: T.title}), h('p', {class: 'sg-lead', text: T.lead}), note ? h('p', {class: 'sg-note', role: 'status', text: note}) : null),
    h('figure', {class: 'sg-band'}, band(d), h('figcaption', {}, h('span', {class: 'sg-cap', text: T.band}), legend(d))),
    h('p', {class: 'sg-lead2', text: T.lead2}),
    h('nav', {class: 'sg-jumps', 'aria-label': T.steps}, d.steps.map(jump)),
    ...d.steps.map(sec),
    h('section', {class: 'sg-end', 'aria-labelledby': 'sg-hend'}, h('h2', {class: 'sg-eh', id: 'sg-hend', text: T.one}), h('p', {class: 'sg-one', text: T.oneLine}), h('p', {class: 'sg-note', text: T.note})),
    h('p', {class: 'safe', text: SAFE}))]};
}

/* ── 한 사람(#/sage/<이름>) ── 걸음 표 → 큰 낱말 · 이름 → 별자리에서 그 사람 자리 → 기승전결 네 줄 → 남긴 말 · 원문 · 출처 → 둘이에서 해 보기 → 앞 · 모두 · 다음 */
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
    h('header', {class: 'sg-head'}, h('p', {class: 'sg-key', text: t.key}), h('h1', {class: 'h sg-name', id: 'sg-name', text: t.name}), h('p', {class: 'sg-meta', text: `${t.life} · ${t.place}`})),
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
