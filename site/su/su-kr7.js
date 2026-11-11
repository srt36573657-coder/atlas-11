/* 수르 — 한국 시장 일곱 가지(기록창 · 주문 0814 · 사장님 2026-11-09 08:14 「한국이 주식시장은 한국 문화가 엄청나게 적용 되어 있다 … 다른 나라와 비교할 때 어떤 다른 특징이 있는지
   정말 아주 다른 특징이 무엇인지 총 7가지를 파악해서 기록창을 만들어 먼저 기재 하라 에이전트 활용하라」 · 08:25 「수르에 올려야해」)
   길 #/r/k — 기록 쪽(#/r) 서랍에서 옴
   한 쪽(위 → 아래): 한 줄 요약 → 한눈 그림(한국 문화 일곱 → 시장 모습 일곱 · 칸마다 번호) → 일곱 칸(누르면 펼침: 한국은 · 다른 나라는 · 견줌 그림 · 한국 문화와 이어진 까닭 · 근거)
     → 어떻게 찾았나(도우미 셋이 따로 찾고 맞댐) → 기록 쪽으로
   글 · 숫자는 su/data/kr7.json 그대로(지어낸 숫자 0 · 근거는 이름과 날짜만 · 바깥 고리 0) · 새 문장에 「%」 없음 · 쓰지 않을 말 0(words.js) · 한국말만
   그리기: h() · s() 만(글 속 꾸밈 0 · 아무 수 0) · 색 · 움직임은 su-kr7.css 에만 */
import {h, s} from '/su/su-fig.js';

export const CSS = '/su/su-kr7.css';
const fin = v => typeof v === 'number' && Number.isFinite(v);
function ensureCss() { if (typeof document !== 'undefined' && !document.querySelector(`link[href="${CSS}"]`)) document.head.append(Object.assign(document.createElement('link'), {rel: 'stylesheet', href: CSS})); }
const ymdK = d => { const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(d ?? '')); return m ? `${+m[1]}년 ${+m[2]}월 ${+m[3]}일` : ''; };

/* ── 한눈 그림 — 왼쪽 한국 문화(다섯 글자 안) · 오른쪽 시장 모습(여덟 글자 안) · 가는 선으로 이음(번호 = 아래 칸 번호) ── */
const W = 350, RH = 58, TOP = 44;
function mapFig(items, L = '한국 문화', R = '시장 모습', pair = '한국 문화와 시장 모습 일곱 짝') {
  const H = TOP + items.length * RH + 8, kids = [s('rect', {x: 0, y: 0, width: W, height: H, rx: 18, class: 'k7-bg'}),
    s('text', {x: 18, y: 28, class: 'k7-mh', text: L}), s('text', {x: W - 18, y: 28, class: 'k7-mh', 'text-anchor': 'end', text: R})];
  items.forEach((it, i) => {
    const y = TOP + i * RH + RH / 2;
    kids.push(s('g', {class: 'k7-row', 'data-k7': String(i + 1)},
      s('path', {d: `M108 ${y}H162`, class: 'k7-ln'}),
      s('circle', {cx: 135, cy: y, r: 13, class: 'k7-dot'}), s('text', {x: 135, y: y + 6, 'text-anchor': 'middle', class: 'k7-dn', text: String(i + 1)}),
      s('text', {x: 18, y: y + 6, class: 'k7-mc', text: it.culture}),
      s('text', {x: W - 18, y: y + 6, 'text-anchor': 'end', class: 'k7-mm', text: it.tag})));
  });
  return s('svg', {class: 'k7-map', viewBox: `0 0 ${W} ${H}`, role: 'img', preserveAspectRatio: 'xMidYMid meet',
    'aria-label': pair + ' — ' + items.map((it, i) => (i + 1) + ' ' + it.culture + ' → ' + it.tag).join(' · ')}, kids);
}

/* ── 견줌 그림 — 줄마다 이름(위) · 가로 막대(아래 · 한국 또는 한국 사람 몫 = 호박색 · 다른 나라 = 회색) · 막대 끝에 값 글 그대로 ── */
function barsFig(b) {
  if (!b || !Array.isArray(b.rows) || b.rows.length < 2 || !b.rows.every(r => fin(r.v) && r.v >= 0 && typeof r.who === 'string' && typeof r.t === 'string')) return null;
  const max = Math.max(...b.rows.map(r => r.v)) || 1, BH = 28, RH = 64, H = b.rows.length * RH + 6, XW = W - 96;
  const kids = [];
  b.rows.forEach((r, i) => {
    const y = i * RH, w = Math.max(4, Math.round(XW * r.v / max)), kr = r.who === '한국' || r.kr === true; // 한국(또는 한국 사람 몫) = 호박색
    kids.push(s('g', {class: 'k7-bar' + (kr ? ' k7-kr' : ''), 'data-who': r.who, 'data-v': String(r.v)},
      s('text', {x: 0, y: y + 20, class: 'k7-bw', text: r.who}),
      s('rect', {x: 0, y: y + 28, width: w, height: BH, rx: 6, class: 'k7-bb'}),
      s('text', {x: w + 8, y: y + 49, class: 'k7-bt', text: r.t})));
  });
  return h('figure', {class: 'k7-fig'}, h('figcaption', {class: 'k7-cap', text: b.title}),
    s('svg', {class: 'k7-bars', viewBox: `0 0 ${W} ${H}`, role: 'img', preserveAspectRatio: 'xMidYMid meet', 'aria-label': b.title + ' — ' + b.rows.map(r => r.who + ' ' + r.t).join(' · ')}, kids),
    b.note ? h('p', {class: 'k7-note', text: b.note}) : null);
}

/* ── 일곱 칸 — 누르면 펼침(첫 칸은 펼친 채) ── */
function card(it, i, WHY = '한국 문화와 이어진 까닭') {
  return h('li', {class: 'k7-li', 'data-k7': String(i + 1)},
    h('details', {class: 'k7-d', open: i === 0},
      h('summary', {class: 'k7-sum'}, h('span', {class: 'k7-n', text: String(i + 1)}),
        h('span', {class: 'k7-tx'}, h('b', {class: 'k7-t', text: it.t}), h('span', {class: 'k7-one', text: it.one}))),
      h('div', {class: 'k7-body'},
        h('h3', {class: 'k7-h3', text: '한국은'}), h('p', {class: 'k7-s', text: it.kr}),
        barsFig(it.bars),
        h('h3', {class: 'k7-h3', text: '다른 나라는'}),
        h('ul', {class: 'k7-vs'}, it.vs.map(v => h('li', {class: 'k7-v'}, h('b', {class: 'k7-who', text: v.who}), h('span', {class: 'k7-s', text: v.s})))),
        h('h3', {class: 'k7-h3', text: WHY}), h('p', {class: 'k7-s k7-why', text: it.why}),
        h('h3', {class: 'k7-h3', text: '근거'}), h('ul', {class: 'k7-src'}, it.src.map(x => h('li', {class: 'k7-sr', text: x}))))));
}

export async function vKr7(X) {
  ensureCss();
  const [K, b] = await Promise.all([X.get('/su/data/kr7.json').catch(() => null), X.base().catch(() => ({}))]);
  const ok = K && Array.isArray(K.items) && K.items.length === 7 && K.items.every(it => it && typeof it.t === 'string' && typeof it.one === 'string' && typeof it.kr === 'string' && typeof it.why === 'string'
    && typeof it.culture === 'string' && typeof it.tag === 'string' && Array.isArray(it.vs) && it.vs.length >= 2 && Array.isArray(it.src) && it.src.length >= 1);
  if (!ok) return X.notFound('한국 시장 기록을 받지 못했어요. 다시 열어 주세요.');
  const hero = h('div', {class: 'su-hero k7', 'data-g': 'su-kr7', 'data-n': String(K.items.length), 'data-at': K.at},
    h('p', {class: 'k7-lead', text: K.lead}),
    h('p', {class: 'k7-when', text: ymdK(K.at) + ' 기록 · 숫자는 근거에 적힌 해의 값이에요.'}),
    mapFig(K.items),
    h('ol', {class: 'k7-ol'}, K.items.map((it, i) => card(it, i))));
  const how = h('section', {class: 'k7-how', 'aria-label': '어떻게 찾았나요'}, h('h2', {class: 'su-ft', text: '어떻게 찾았나요'}),
    h('ul', {class: 'k7-hw'}, (K.how ?? []).map(t => h('li', {class: 'k7-s', text: t}))),
    h('a', {class: 'su-ask', href: '#/r'}, h('b', {text: '기록 쪽으로'}), h('span', {text: '지난 기록 서랍을 봐요.'})));
  return {title: '한국 시장 일곱 가지', tab: 2, step: null, kick: '다른 나라와 견준 기록', h1: '한국 주식시장, 무엇이 다를까요?', proper: false, hero, body: [how],
    next: {href: '#/', label: '오늘 42칸 보기'}, asOf: K.at, S: b?.S ?? null};
}

/* ── 한국 투자자 특징 열하나(기록창 · 주문 2235 · 사장님 2026-11-09 22:35 「어 올려」 — 물음 「특징 열하나도 기록창에 올릴까요?」의 답)
   주문 1912(19:12 「한국에 주식하는 사람들에 특징 11가지를 에이전트 11개를 돌려서 찾아낸 다음 7가지에 정의를 내린 다음 …」)에서 도우미 열하나가 찾은 것
   길 #/r/i — 기록 쪽 서랍에서 옴 · 같은 꼴(한눈 그림 열한 짝: 왼쪽 특징 · 오른쪽 수르에서 쓰는 곳 → 열한 칸: 한국은 · 다른 나라는 · 수르에서는 · 근거)
   글 · 숫자는 su/data/ant11.json 그대로(지어낸 숫자 0 · 근거는 이름과 날짜만 · 바깥 고리 0) · 새 문장에 「%」 · 영어 글자 없음 ── */
export async function vAnt11(X) {
  ensureCss();
  const [K, b] = await Promise.all([X.get('/su/data/ant11.json').catch(() => null), X.base().catch(() => ({}))]);
  const ok = K && Array.isArray(K.items) && K.items.length === 11 && K.items.every(it => it && typeof it.t === 'string' && typeof it.one === 'string' && typeof it.kr === 'string' && typeof it.why === 'string'
    && typeof it.culture === 'string' && typeof it.tag === 'string' && Array.isArray(it.vs) && it.vs.length >= 1 && Array.isArray(it.src) && it.src.length >= 1);
  if (!ok) return X.notFound('한국 투자자 기록을 받지 못했어요. 다시 열어 주세요.');
  const hero = h('div', {class: 'su-hero k7', 'data-g': 'su-ant11', 'data-n': String(K.items.length), 'data-at': K.at},
    h('p', {class: 'k7-lead', text: K.lead}),
    h('p', {class: 'k7-when', text: ymdK(K.at) + ' 기록 · 숫자는 근거에 적힌 해의 값이에요.'}),
    mapFig(K.items, '한국 투자자', '큐피트에서', '한국 투자자 특징과 큐피트에서 쓰는 곳 열한 짝'),
    h('ol', {class: 'k7-ol'}, K.items.map((it, i) => card(it, i, '수르에서는'))));
  const how = h('section', {class: 'k7-how', 'aria-label': '어떻게 찾았나요'}, h('h2', {class: 'su-ft', text: '어떻게 찾았나요'}),
    h('ul', {class: 'k7-hw'}, (K.how ?? []).map(t => h('li', {class: 'k7-s', text: t}))),
    h('a', {class: 'su-ask', href: '#/r'}, h('b', {text: '기록 쪽으로'}), h('span', {text: '지난 기록 서랍을 봐요.'})));
  return {title: '한국 투자자 특징 열하나', tab: 2, step: null, kick: '도우미 열하나가 찾은 기록', h1: '한국 개인 투자자, 무엇이 다를까요?', proper: false, hero, body: [how],
    next: {href: '#/', label: '오늘 42칸 보기'}, asOf: K.at, S: b?.S ?? null};
}
