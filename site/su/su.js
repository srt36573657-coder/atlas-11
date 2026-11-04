/* 수르 두 길(aaa7377.com/su/) — 꽃이 될 회사 · 돈이 몰린 회사 두 가지만
   사장님 2026-11-03 15:49(+04) 「수르가 말이야 물흐르듯 해야 하고 무엇을 클릭하면 그 연관된곳으로 명확하게 이동되서 그 정보를 제공해야 하는대 …
   잡스라면 … 특화된 수르를 만든다면 어떻게 만들거야 그리고 만들어봐」(설계 docs/design/su-two-2026-11-03/order-2049.txt)
   길 셋 — #/ 처음 · #/c/<번호> 회사 · #/i/<업종> 업종 · 누르면 그것이 나옴(설명 쪽 · 바깥 · 선물 · 카톡으로 가는 고리 0)
   보안 규칙(script-src 'self' · style-src 'self') — innerHTML 없음 · 글 속 style 없음 · 그림은 SVG 속성으로만 */
import {NAME, josa} from '/next/brand.js';
import {glossTree} from '/next/glossary.js'; // 낱말표 한 곳(몸값 → 회사 크기 …) — 지금 사이트와 같은 말 · 이름([data-proper])은 그대로
import {CODE, pct, moreLess, dateKo, bloomList, moneyList, reasonsFor, whyOf, idxLine, coLine, indRows, forwardTo} from '/su/su-data.js';
import {essenceData, essenceLines} from '/next/essence.js'; // 본질 세 줄(사장님 글자 그대로 · 명령문 [5] 2) — 첫 화면이 되면서(18:33 「응」) 처음 쪽 맨 아래에

const SVGNS = 'http://www.w3.org/2000/svg';
function h(tag, attrs = {}, ...kids) {
  const e = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs ?? {})) {
    if (v == null || v === false) continue;
    if (k === 'text') e.textContent = String(v);
    else if (k === 'class') e.className = v;
    else e.setAttribute(k, v === true ? '' : String(v));
  }
  for (const c of kids.flat()) if (c != null && c !== false) e.append(c instanceof Node ? c : String(c));
  return e;
}
const s = (tag, attrs = {}) => { const e = document.createElementNS(SVGNS, tag); for (const [k, v] of Object.entries(attrs)) e.setAttribute(k, String(v)); return e; };

const cache = new Map();
const get = url => { if (!cache.has(url)) cache.set(url, fetch(url).then(r => (r.ok ? r.json() : null)).catch(() => null)); return cache.get(url); };
const D = {B: '/next/data/theme-bloom.json', TH: '/next/data/theme.json', W: '/next/data/flow-why.json', S: '/next/data/home-summary.json', H: '/atlas/data/home.json', M: '/atlas/data/mkt.json', co: c => '/atlas/data/co/' + c + '.json'};

const SAFE = '지난 기록만 보여 줘요. 앞날을 맞히지 않고 사고팔기를 권하지 않아요.';
const NOT_PICK = '조건에 다 맞지는 않아요. ' + josa(NAME, '가') + ' 고른 회사가 아니에요.';
const coHref = code => '#/c/' + code;
const indHref = name => '#/i/' + encodeURIComponent(name);

/** 위 막대 — 이름(처음으로) · 한 줄 */
const bar = () => h('header', {class: 'su-bar'}, h('a', {class: 'su-logo', href: '#/', 'aria-label': NAME + ' 처음으로'}, h('img', {src: '/media/makbi-icon.svg', alt: '', width: 28, height: 28}), h('b', {text: NAME})), h('span', {class: 'su-tag-line', text: '꽃이 될 회사 · 돈이 몰린 회사'}));
const safe = () => h('p', {class: 'su-safe', text: SAFE});
const back = () => h('a', {class: 'su-back', href: '#/'}, h('i', {'aria-hidden': 'true', text: '‹'}), h('span', {text: '처음으로'}));
/** 맨 아래 큰 「처음으로」 — 엄지가 닿는 자리(손가락 · 주문 0620 샘플 6 · 11) */
const backBig = () => h('a', {class: 'su-backb', href: '#/'}, h('i', {'aria-hidden': 'true', text: '‹'}), h('span', {text: '처음으로'}));
/** 신문 차례 맨 끝 — 출처(숫자를 어디서 언제 받았나 · 가장 작은 글씨 · 샘플 9) */
const foot = asOf => h('footer', {class: 'su-foot'},
  h('p', {class: 'su-src', text: '출처 · 숫자는 네이버 증권에서 받은 지난 기록이에요. ' + dateKo(asOf) + ' 자료예요.'}),
  h('a', {class: 'su-full', href: '/next/'}, h('span', {text: '모든 기록은 지금 ' + NAME + '에서'}), h('i', {'aria-hidden': 'true', text: '›'})));

/** 줄 목록 — 줄 하나 = 누르면 그 회사(또는 업종) 한 곳 */
function rowsOf(rows) {
  return h('ul', {class: 'su-rows'}, rows.map(r => h('li', {},
    h('a', {class: 'su-row', href: r.href},
      h('span', {class: 'su-rn'}, h('b', {'data-proper': '', text: r.name}), r.tag ? h('span', {class: 'su-chip', text: r.tag}) : null),
      r.sub ? h('span', {class: 'su-rs', text: r.sub}) : null,
      r.why ? h('span', {class: 'su-rw', text: r.why}) : null,
      h('span', {class: 'su-go'}, h('span', {text: '회사 쪽'}), h('i', {'aria-hidden': 'true', text: '›'}))),
    r.ind ? h('a', {class: 'su-indchip', href: indHref(r.ind)}, h('span', {text: r.ind + ' 업종 쪽으로'}), h('i', {'aria-hidden': 'true', text: '›'})) : null)));
}
/** 지난 기록 두 줄 — 「○○는 100번에 n번 꽃이 됐어요」 · 아무 회사 · 꽃의 뜻 */
function recBox(rec, who, short = false) {
  if (!rec) return null;
  return h('div', {class: 'su-rec'},
    short ? null : h('p', {class: 'su-rec-a'}, h('span', {text: josa(who, '는') + ' 100번에 '}), h('b', {text: rec.rate + '번'}), h('span', {text: ' 꽃이 됐어요.'})), // 짧게 = 머리 값 칸이 위에서 두 숫자를 이미 보였음
    short ? null : h('p', {class: 'su-rec-b', text: '아무 회사를 골랐다면 ' + rec.base + '번이었어요.'}),
    h('p', {class: 'su-rec-c', text: '꽃은 한 달 동안 시장보다 5% 넘게 더 오른 것이에요.'}));
}
/** 신문 첫 면 머리 값 — 큰 값 하나(가장 큰 글씨) · 받치는 말 · 막대는 한 번 자람(들어올 때 1초 안 · 움직임 줄이기면 끝 모습) */
function hero(label, big, unit, sub) {
  return h('section', {class: 'su-hero', 'aria-label': label},
    h('p', {class: 'su-hl', text: label}),
    h('p', {class: 'su-hv'}, h('b', {text: big}), unit ? h('span', {text: unit}) : null),
    sub ? h('p', {class: 'su-hs', text: sub}) : null);
}
function barsOf(items) {
  const mx = Math.max(1, ...items.map(i => i.v)), g = s('svg', {viewBox: '0 0 340 ' + (items.length * 24), class: 'su-bars', 'aria-hidden': 'true', focusable: 'false'});
  items.forEach((it, i) => g.append(s('rect', {x: 0, y: i * 24 + 3, width: Math.max(4, 340 * it.v / mx).toFixed(1), height: 16, rx: 5, class: 'su-bar-' + it.k})));
  return g;
}
const recHero = (rec, who) => rec ? [hero('지난 기록 · 100번 가운데', String(rec.rate), '번 꽃이 됐어요', null),
  h('div', {class: 'su-herob'}, barsOf([{v: rec.rate, k: 'a'}, {v: rec.base, k: 'b'}]),
    h('ul', {class: 'su-legend'},
      h('li', {class: 'su-lg-c'}, h('i', {'aria-hidden': 'true'}), h('span', {text: who}), h('b', {text: rec.rate + '번'})),
      h('li', {class: 'su-lg-i'}, h('i', {'aria-hidden': 'true'}), h('span', {text: '아무 회사'}), h('b', {text: rec.base + '번'}))))] : [];
const cardHead = (k, title, note) => h('div', {class: 'su-ch'}, h('span', {class: 'su-dot su-dot-' + k, 'aria-hidden': 'true'}), h('h2', {class: 'su-ct', text: title}), note ? h('span', {class: 'su-cn', text: note}) : null);

function bloomCard(bl, asOf) {
  const head = cardHead('bl', '꽃이 될 회사', dateKo(asOf));
  if (bl.mode === 'pick') return h('section', {class: 'su-card su-bl', 'aria-label': '꽃이 될 회사'}, head,
    h('p', {class: 'su-lead', text: '오늘 조건에 모두 맞은 회사 ' + bl.rows.length + '곳이에요.'}),
    rowsOf(bl.rows.map(r => ({href: coHref(r.code), name: r.name, ind: r.ind || null}))),
    recBox(bl.rec, '이렇게 고른 회사', true));
  if (bl.mode === 'near') return h('section', {class: 'su-card su-bl', 'aria-label': '꽃이 될 회사'}, head,
    h('p', {class: 'su-lead', text: '오늘은 조건에 다 맞은 회사가 없어요.'}),
    h('p', {class: 'su-lead2', text: '그래서 조건에 가장 가까운 회사 ' + bl.rows.length + '곳을 따로 보여 드려요.'}),
    rowsOf(bl.rows.map(r => ({href: coHref(r.code), name: r.name, tag: '가까운 곳', ind: r.ind || null}))),
    h('p', {class: 'su-note', text: NOT_PICK}),
    recBox(bl.rec, '지난 빈 날 가장 가까운 회사', true));
  return h('section', {class: 'su-card su-bl', 'aria-label': '꽃이 될 회사'}, head, h('p', {class: 'su-lead', text: '오늘은 조건에 맞은 회사가 없어요.'}), recBox(bl.rec, '이렇게 고른 회사', true));
}
function moneyCard(mo) {
  const head = cardHead('mo', '돈이 몰린 회사', '한 달 흐름');
  if (!mo.length) return h('section', {class: 'su-card su-mo', 'aria-label': '돈이 몰린 회사'}, head, h('p', {class: 'su-lead', text: '? 아직 못 셌어요.'}));
  return h('section', {class: 'su-card su-mo', 'aria-label': '돈이 몰린 회사'}, head,
    h('p', {class: 'su-lead', text: '한 달 동안 시장보다 많이 오른 업종 ' + mo.length + '곳의 대장 회사예요.'}),
    rowsOf(mo.map(r => ({href: coHref(r.code), name: r.name, ind: r.ind, sub: r.ind + ' 업종이 시장보다 ' + moreLess(r.x) + ' 올랐어요', why: r.why?.line ? '왜? ' + r.why.line : null}))));
}

async function vHome() {
  const [B, TH, W, S] = await Promise.all([get(D.B), get(D.TH), get(D.W), get(D.S)]);
  const asOf = B?.asOf ?? TH?.asOf ?? W?.asOf;
  const bl = bloomList(B);
  return {title: null, nodes: [bar(), h('main', {class: 'su-main'}, safe(),
    h('h1', {class: 'su-h1', tabindex: '-1'}, h('span', {text: '오늘 볼 것은'}), ' ', h('em', {text: '두 가지예요'})),
    recHero(bl.rec, bl.mode === 'pick' ? '이렇게 고른 회사' : '가장 가까운 회사'),
    bloomCard(bl, asOf), moneyCard(moneyList(TH, W)), essBox(S), foot(asOf))]};
}

/** 회사 한 달 그림 — 그 회사 줄 · 지수 줄(같은 날들 · 기준일 = 100) · 글은 그림 밖 HTML(큰 글씨) */
function chart(name, cl, il) {
  if (!cl) return null;
  const all = [...cl, ...(il?.line ?? [])], lo = Math.min(...all), hi = Math.max(...all), pad = Math.max(2, (hi - lo) * 0.12), y0 = lo - pad, y1 = hi + pad;
  const W = 340, H = 170, X = (i, n) => 8 + (W - 16) * i / Math.max(1, n - 1), Y = v => 8 + (H - 16) * (1 - (v - y0) / (y1 - y0));
  const pts = l => l.map((v, i) => X(i, l.length).toFixed(1) + ',' + Y(v).toFixed(1)).join(' ');
  const g = s('svg', {viewBox: `0 0 ${W} ${H}`, class: 'su-svg', role: 'img', 'aria-label': name + ' 한 달 ' + pct(cl[cl.length - 1] - 100) + (il ? ' · ' + il.name + ' 한 달 ' + pct(il.line[il.line.length - 1] - 100) : '')});
  g.append(s('line', {x1: 8, x2: W - 8, y1: Y(100).toFixed(1), y2: Y(100).toFixed(1), class: 'su-base'}));
  if (il) g.append(s('polyline', {points: pts(il.line), class: 'su-li'}));
  g.append(s('polyline', {points: pts(cl), class: 'su-lc', pathLength: 1}));
  const last = cl.length - 1; g.append(s('circle', {cx: X(last, cl.length).toFixed(1), cy: Y(cl[last]).toFixed(1), r: 5, class: 'su-dotc'}));
  return h('section', {class: 'su-card su-chart', 'aria-label': '한 달 그림'},
    h('h2', {class: 'su-ct', text: '한 달 동안 걸어온 길'}),
    il ? h('p', {class: 'su-cn2', text: dateKo(il.from) + '부터 ' + dateKo(il.to) + '까지'}) : null,
    g,
    h('ul', {class: 'su-legend'},
      h('li', {class: 'su-lg-c'}, h('i', {'aria-hidden': 'true'}), h('span', {text: name}), h('b', {text: pct(cl[last] - 100)})),
      il ? h('li', {class: 'su-lg-i'}, h('i', {'aria-hidden': 'true'}), h('span', {text: il.name}), h('b', {text: pct(il.line[il.line.length - 1] - 100)})) : null));
}
/** 왜 여기 있나 — 칸 하나에 까닭 하나 */
function reasonCard(r, code) {
  if (r.kind === 'pick') return h('section', {class: 'su-card su-why su-bl'}, cardHead('bl', '꽃이 될 회사예요'),
    h('p', {class: 'su-lead', text: '오늘 조건 ' + r.ok.length + '가지에 모두 맞았어요.'}),
    h('ul', {class: 'su-cond'}, r.ok.map(t => h('li', {class: 'su-ok'}, h('i', {'aria-hidden': 'true', text: '✓'}), h('span', {}, h('b', {class: 'su-tg', text: '맞아요 · '}), t)))),
    recBox(r.rec, '이렇게 고른 회사'));
  if (r.kind === 'near') return h('section', {class: 'su-card su-why su-bl'}, cardHead('bl', '조건에 가장 가까운 회사예요'),
    h('p', {class: 'su-note', text: NOT_PICK}),
    h('h3', {class: 'su-h3', text: '맞은 조건'}),
    h('ul', {class: 'su-cond'}, r.ok.map(t => h('li', {class: 'su-ok'}, h('i', {'aria-hidden': 'true', text: '✓'}), h('span', {}, h('b', {class: 'su-tg', text: '맞아요 · '}), t)))),
    h('h3', {class: 'su-h3', text: '안 맞은 조건'}),
    h('ul', {class: 'su-cond'}, r.no.map(t => h('li', {class: 'su-no'}, h('i', {'aria-hidden': 'true', text: '✗'}), h('span', {}, h('b', {class: 'su-tg', text: '안 맞아요 · '}), t)))),
    r.ix != null ? h('p', {class: 'su-lead2', text: r.ind + ' 업종은 한 달 동안 시장보다 ' + moreLess(r.ix) + ' 올랐어요.'}) : null,
    recBox(r.rec, '지난 빈 날 가장 가까운 회사'));
  if (r.kind === 'money') return h('section', {class: 'su-card su-why su-mo'}, cardHead('mo', '돈이 몰린 회사예요'),
    h('p', {class: 'su-lead', text: r.ind + ' 업종이 한 달 동안 시장보다 ' + moreLess(r.x) + ' 올랐어요.'}),
    r.why?.line ? h('p', {class: 'su-lead2', text: '왜? ' + r.why.line}) : null,
    r.why?.items?.length ? h('ul', {class: 'su-items'}, r.why.items.slice(0, 4).map(it => h('li', {}, h('b', {text: it.t}), it.sub ? h('span', {text: it.sub}) : null))) : null,
    h('a', {class: 'su-more', href: indHref(r.ind)}, h('span', {text: r.ind + ' 업종 회사 모두 보기'}), h('i', {'aria-hidden': 'true', text: '›'})));
  return null;
}

/** 회사 쪽 머리 값 = 그 회사 한 달 값 · 받치는 말 = 지수 한 달 · 맞은 조건 수 */
function coHero(name, cl, il, rs) {
  if (!cl) return null;
  const v = cl[cl.length - 1] - 100, r = rs.find(x => x.kind === 'near');
  const sub = [il ? il.name + ' 한 달 ' + pct(il.line[il.line.length - 1] - 100) : null, r ? '조건 ' + (r.ok.length + r.no.length) + '가지 가운데 ' + r.ok.length + '가지가 맞아요' : null].filter(Boolean).join(' · ');
  return hero(name + ' 한 달', pct(v), '', sub || null);
}
async function vCo(code) {
  if (!CODE.test(code ?? '')) return notFound('이 회사를 찾지 못했어요.');
  const [B, TH, W, H, co] = await Promise.all([get(D.B), get(D.TH), get(D.W), get(D.H), get(D.co(code))]);
  const c = co?.c; if (!c || typeof c.name !== 'string') return notFound('이 회사를 찾지 못했어요.');
  const rs = reasonsFor(code, bloomList(B), moneyList(TH, W)), ind = typeof c.i === 'string' ? c.i : null;
  const il = idxLine(H, c.market, H?.base, H?.asOf);
  return {title: c.name, nodes: [bar(), h('main', {class: 'su-main'}, back(), safe(),
    h('h1', {class: 'su-h1 su-coh', tabindex: '-1'}, h('span', {'data-proper': '', text: c.name})),
    coHero(c.name, coLine(co), il, rs),
    ind ? h('a', {class: 'su-ind', href: indHref(ind)}, h('span', {text: ind + ' 업종'}), h('i', {'aria-hidden': 'true', text: '›'})) : null,
    rs.length ? rs.map(r => reasonCard(r, code)) : h('p', {class: 'su-lead2 su-none', text: '이 회사는 오늘 두 목록에 없어요. 지난 한 달만 보여 드려요.'}),
    chart(c.name, coLine(co), il),
    h('a', {class: 'su-ask', href: '/next/#/why/' + code}, h('span', {class: 'su-ask-a', text: '사기 전에 한 번 멈춰요'}), h('span', {class: 'su-ask-b', text: '「왜 사?」 열한 질문으로 내 이유부터 확인해요'}), h('i', {'aria-hidden': 'true', text: '›'})),
    backBig(), foot(H?.asOf))]};
}

async function vInd(name) {
  const [TH, W, M] = await Promise.all([get(D.TH), get(D.W), get(D.M)]);
  const rows = indRows(M, name); if (!rows.length) return notFound('이 업종을 찾지 못했어요.');
  const t = (Array.isArray(TH?.inds) ? TH.inds : []).find(i => i?.n === name), w = whyOf(W, name);
  return {title: name + ' 업종', nodes: [bar(), h('main', {class: 'su-main'}, back(), safe(),
    h('h1', {class: 'su-h1', tabindex: '-1'}, h('span', {text: name + ' 업종'})),
    t && typeof t.x === 'number' ? hero('한 달 동안 시장보다', moreLess(t.x), '', '이 업종 회사 ' + rows.length + '곳 · 한 달 동안 올랐어요.') : null,
    w ? h('section', {class: 'su-card su-mo', 'aria-label': '돈이 몰린 까닭'}, cardHead('mo', '돈이 몰린 까닭'),
      w.line ? h('p', {class: 'su-lead', text: w.line}) : null,
      w.items.length ? h('ul', {class: 'su-items'}, w.items.slice(0, 4).map(it => h('li', {}, h('b', {text: it.t}), it.sub ? h('span', {text: it.sub}) : null))) : null) : null,
    h('section', {class: 'su-card', 'aria-label': '이 업종 회사'}, cardHead('co', '이 업종 회사 ' + rows.length + '곳', '한 달 많이 오른 차례'),
      rowsOf(rows.map(r => ({href: coHref(r.code), name: r.name, sub: '한 달 ' + pct(r.c)})))),
    backBig(), foot(M?.asOf))]};
}

function notFound(msg) { return {title: '?', nodes: [bar(), h('main', {class: 'su-main'}, back(), h('p', {class: 'su-lead su-none', text: '? ' + msg}))]}; }

/** 본질 세 줄 — essence.js 그대로(회사 수 · 받은 때 = home-summary.json · 못 읽으면 「?」) · 「왜 사?」 열한 질문으로 가는 고리 하나(본질 2번) */
function essBox(S) {
  const lines = essenceLines(essenceData({summary: S}));
  return h('section', {class: 'su-ess', 'aria-label': NAME + ' 세 줄'},
    lines.map((t, i) => h('p', {'data-ess': String(i + 1), text: t})),
    h('a', {class: 'su-full', href: '/next/#/why'}, h('span', {text: '「왜 사?」 열한 질문 하기'}), h('i', {'aria-hidden': 'true', text: '›'})));
}

let seq = 0;
async function route() {
  const fw = forwardTo(location.search, location.hash); // 지금 수르 고리(#/w/ · #/s/ · ?lang= …)는 그쪽으로 그대로(첫 화면이 된 뒤 옛 고리 · 카톡으로 받은 고리)
  if (fw) { location.replace(fw); return; }
  const m = /^#\/(c|i)\/(.+)$/.exec(location.hash || '');
  let a = null; if (m) { try { a = decodeURIComponent(m[2]); } catch { a = m[2]; } }
  const my = ++seq, root = document.getElementById('su');
  let out;
  try { out = !m ? await vHome() : m[1] === 'c' ? await vCo(a) : await vInd(a); }
  catch (e) { console.error(e); out = notFound('화면을 그리지 못했어요. 잠시 뒤 다시 열어 주세요.'); }
  if (my !== seq) return;
  root.replaceChildren(...out.nodes.filter(Boolean));
  try { glossTree(root); } catch (e) { console.error(e); }
  document.title = (out.title ? out.title + ' · ' : '') + NAME;
  window.scrollTo(0, 0);
  root.querySelector('h1')?.focus?.({preventScroll: true});
}
window.addEventListener('hashchange', route);
route();
