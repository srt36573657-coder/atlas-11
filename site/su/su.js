/* 수르 두 길(aaa7377.com/su/) — 꽃이 될 회사 · 돈이 몰린 회사 두 가지만
   사장님 2026-11-03 15:49(+04) 「수르가 말이야 물흐르듯 해야 하고 무엇을 클릭하면 그 연관된곳으로 명확하게 이동되서 그 정보를 제공해야 하는대 …
   잡스라면 … 특화된 수르를 만든다면 어떻게 만들거야 그리고 만들어봐」(설계 docs/design/su-two-2026-11-03/order-2049.txt)
   신문 차례 — 주문 0508(사장님 11월 4일 0시 8분 사장님 시계 · 원문 docs/design/jinhwa-paper-2026-11-04/order-0508.txt) · 샘플 열하나의 장점을 한 판에
   쪽마다 ① 큰 값 ② 중간 값 ③ 자세히 ④ 출처
   길 셋 — #/ 처음 · #/c/<번호> 회사 · #/i/<업종> 업종 · 누르면 그것이 나옴(설명 쪽 · 바깥 · 선물 · 카톡으로 가는 고리 0)
   보안 규칙(script-src 'self' · style-src 'self') — innerHTML 없음 · 글 속 style 없음 · 그림은 SVG 속성으로만 · 움직임은 su.css(한 번 · 움직임 줄이기면 끝 모습)
   새 셈 없음 — 그림의 숫자는 모두 su-data.js 가 고른 자료 그대로 */
import {NAME, josa} from '/next/brand.js';
import {glossTree} from '/next/glossary.js'; // 낱말표 한 곳(몸값 → 회사 크기 …) — 지금 사이트와 같은 말 · 이름([data-proper])은 그대로
import {CODE, pct, moreLess, dateKo, bloomList, moneyList, reasonsFor, whyOf, idxLine, coLine, indRows, forwardTo} from '/su/su-data.js';
import {essenceData, essenceLines, kstText} from '/next/essence.js'; // 본질 세 줄(사장님 글자 그대로 · 명령문 [5] 2) — 처음 쪽 맨 아래 · 받은 때(출처 칸)

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
const fin = v => typeof v === 'number' && Number.isFinite(v);
/** 내림 · 오름을 말로도(화면 읽기 · 샘플 07) — 빼기표만으로 뜻을 전하지 않음 */
const WORD = ['영', '하나', '둘', '셋', '넷', '다섯', '여섯', '일곱', '여덟', '아홉', '열'];
const word = n => WORD[n] ?? String(n);
const saidPct = v => (fin(v) ? (Math.abs(v).toFixed(1) === '0.0' ? '그대로예요' : Math.abs(v).toFixed(1) + '% ' + (v > 0 ? '올랐어요' : '내렸어요')) : '?');
let seen = null; // 방금 본 회사 {code, name, ind} — 업종 쪽에서 「보던 회사」 표시 · 바로 돌아가기(샘플 02 · 03)

/** 위 막대 — 이름(처음으로) · 한 줄 */
const bar = () => h('header', {class: 'su-bar'}, h('a', {class: 'su-logo', href: '#/', 'aria-label': NAME + ' 처음으로'}, h('img', {src: '/media/makbi-icon.svg', alt: '', width: 28, height: 28}), h('b', {text: NAME})), h('span', {class: 'su-tag-line', text: '꽃이 될 회사 · 돈이 몰린 회사'}));
const safe = () => h('p', {class: 'su-safe', text: SAFE});
const back = (cls = '') => h('a', {class: 'su-back ' + cls, href: '#/'}, h('i', {'aria-hidden': 'true', text: '‹'}), h('span', {text: '처음으로'}));
/** 쪽 이름표와 자료 날짜(샘플 01 · 09) — 신문 머리의 날짜 줄 */
const kicker = (tag, asOf) => h('p', {class: 'su-kick'}, h('b', {text: tag}), h('span', {text: dateKo(asOf) + ' 자료'}));

/** ① 큰 값 — 이름 한 줄 · 가장 큰 숫자 · 풀이 한 줄 */
function bigVal({label, num, unit, sub, tag = 'p', cls = ''}) {
  return h(tag, {class: 'su-big ' + cls, ...(tag === 'h1' ? {tabindex: '-1'} : {})},
    h('span', {class: 'su-big-l', text: label}),
    h('span', {class: 'su-big-n'}, h('b', {text: num}), unit ? h('span', {text: unit}) : null),
    sub ? h('span', {class: 'su-big-s', text: sub}) : null);
}
/** ② 중간 값 — 칸 둘셋(누르지 않는 납작한 칸 · 샘플 06) */
const mids = items => h('ul', {class: 'su-mid'}, items.filter(Boolean).map(it => h('li', {class: it.cls ?? ''},
  h('span', {class: 'su-mid-l', text: it.label}), h('b', {class: 'su-mid-n', text: it.value}), it.sub ? h('span', {class: 'su-mid-s', text: it.sub}) : null, it.fig ?? null)));

/** 조건 칸 — 맞음 ✓ · 안 맞음 ✗(색을 지워도 모양과 말로 · 샘플 03 · 07 · 11) */
function condMarks(ok, all, big = false) {
  const n = Math.max(0, all | 0), k = Math.min(n, Math.max(0, ok | 0));
  return h('span', {class: 'su-cm' + (big ? ' su-cm-big' : ''), role: 'img', 'aria-label': `조건 ${n}가지 가운데 ${k}가지 맞음`},
    Array.from({length: n}, (_, i) => h('i', {class: i < k ? 'su-cm-ok' : 'su-cm-no', 'aria-hidden': 'true', text: i < k ? '✓' : '✗'})));
}
/** 막대 — 값까지 자람 · 조건 선(점선) · 숫자는 막대 밖 글(샘플 01 · 02 · 03 · 11) */
function barFig(v, max, line = null, cls = '') {
  if (!fin(v) || !fin(max) || max <= 0) return null;
  const W = 300, H = 16, x = Math.max(2, Math.min(W, W * Math.max(0, v) / max));
  const g = s('svg', {viewBox: `0 0 ${W} ${H}`, class: 'su-barf ' + cls, 'aria-hidden': 'true', focusable: 'false'});
  g.append(s('rect', {x: 0, y: 3, width: W, height: 10, rx: 5, class: 'su-bt'}));
  g.append(s('rect', {x: 0, y: 3, width: x.toFixed(1), height: 10, rx: 5, class: 'su-bf'}));
  if (fin(line) && line > 0 && line <= max) { const lx = (W * line / max).toFixed(1); g.append(s('line', {x1: lx, x2: lx, y1: 0, y2: H, class: 'su-bline'})); }
  return g;
}
/** 지난 기록 점 100개(샘플 05 · 09 · 11 — 숫자에 약해도 「16이 26보다 적다」가 보임) */
function dots100(n, cls) {
  const k = Math.max(0, Math.min(100, Math.round(n ?? 0)));
  const g = s('svg', {viewBox: '0 0 325 52', class: 'su-dots ' + cls, role: 'img', 'aria-label': `100번에 ${k}번`});
  for (let c = 0; c < 25; c++) { // 넷씩 한 칸 — 왼쪽부터 차오름(막대처럼 길이로 견줌)
    const col = s('g', {class: 'su-dr c' + (c + 1)});
    for (let r = 0; r < 4; r++) { const i = c * 4 + r; col.append(s('circle', {cx: 6.5 + c * 13, cy: 6.5 + r * 13, r: 5, class: i < k ? 'su-d1' : 'su-d0'})); }
    g.append(col);
  }
  return g;
}
/** 지난 기록 칸 — 점 100개 두 판 · 한 줄 풀이 · 꽃의 뜻 */
function recBox(rec, who, compact = false) {
  if (!rec) return null;
  return h('div', {class: 'su-rec', role: 'group', 'aria-label': '지난 기록'},
    h('p', {class: 'su-rec-h', text: '지난 기록 · 꽃이 된 수'}),
    h('figure', {class: 'su-rec-f su-rec-me'}, h('figcaption', {}, h('span', {text: who}), h('b', {text: '100번에 ' + rec.rate + '번'})), dots100(rec.rate, 'su-dots-me')),
    h('figure', {class: 'su-rec-f'}, h('figcaption', {}, h('span', {text: '아무 회사'}), h('b', {text: '100번에 ' + rec.base + '번'})), dots100(rec.base, 'su-dots-any')),
    compact ? null : h('p', {class: 'su-rec-a'}, h('span', {text: josa(who, '는') + ' 100번에 '}), h('b', {text: rec.rate + '번'}), h('span', {text: ' 꽃이 됐어요.'})),
    compact ? null : h('p', {class: 'su-rec-b', text: '아무 회사를 골랐다면 ' + rec.base + '번이었어요.'}),
    compact ? null : h('p', {class: 'su-rec-c su-rec-d', text: '지난 일을 센 것이에요. 앞날을 맞히는 숫자가 아니에요.'}),
    h('p', {class: 'su-rec-c', text: '꽃은 한 달 동안 시장보다 5% 넘게 더 오른 것이에요.'}));
}
/** ④ 출처 — 세 쪽 같은 꼴(샘플 09) · 맨 끝 · 가장 작은 글씨 */
function srcBox({asOf, S, extra = [], brief = false}) {
  const at = S?.fetchedAt ? kstText(S.fetchedAt) : null;
  if (brief) return h('section', {class: 'su-src su-src-brief', 'aria-label': '출처'},
    h('p', {}, h('b', {text: '출처'}), h('span', {text: ' 자료 날짜 ' + dateKo(asOf)}), ...extra.map(([k, v]) => h('span', {text: ' · ' + k + ' ' + v}))));
  return h('section', {class: 'su-src', 'aria-label': '출처'},
    h('h2', {class: 'su-src-h', text: '출처'}),
    h('ul', {}, [brief ? null : ['숫자', '네이버 증권'], ['자료 날짜', dateKo(asOf)], brief || !at ? null : ['마지막으로 받은 때', at], ...extra].filter(Boolean)
      .map(([k, v]) => h('li', {}, h('span', {text: k}), h('b', {text: v})))));
}
const foot = () => h('footer', {class: 'su-foot'},
  h('a', {class: 'su-full', href: '/next/'}, h('span', {text: '모든 기록은 지금 ' + NAME + '에서'}), h('i', {'aria-hidden': 'true', text: '›'})));

/** 줄 목록 — 회사 한 줄(누르면 그 회사) · 그 아래 업종 띠(누르면 그 업종 · 업종 이야기는 업종 곁에 · 샘플 02 · 06) */
function rowsOf(rows, mark = null) {
  return h('ul', {class: 'su-rows'}, rows.map(r => h('li', {class: r.code && mark === r.code ? 'su-seen' : ''},
    h('a', {class: 'su-row', href: r.href},
      h('span', {class: 'su-rn'}, h('b', {'data-proper': '', text: r.name}), r.tag ? h('span', {class: 'su-chip', text: r.tag}) : null, r.marks ?? null, r.seen ? h('span', {class: 'su-seen-t', text: '보던 회사'}) : null),
      r.sub ? h('span', {class: 'su-rs', text: r.sub}) : null,
      r.why ? h('span', {class: 'su-rw', text: r.why}) : null,
      r.fig ?? null,
      h('i', {class: 'su-go', 'aria-hidden': 'true', text: '›'})),
    r.ind ? h('a', {class: 'su-ib', href: indHref(r.ind)},
      h('span', {class: 'su-ib-n', text: r.ind + ' 업종'}),
      r.indFact ? h('span', {class: 'su-ib-f', text: r.indFact}) : null,
      r.indFig ?? null,
      h('i', {'aria-hidden': 'true', text: '›'})) : null)));
}
const cardHead = (k, title, note) => h('div', {class: 'su-ch'}, h('span', {class: 'su-dot su-dot-' + k, 'aria-hidden': 'true'}), h('h2', {class: 'su-ct', text: title}), note ? h('span', {class: 'su-cn', text: note}) : null);

function bloomCard(bl, asOf) {
  const head = cardHead('bl', '꽃이 될 회사', dateKo(asOf));
  const all = bl.say.length, ok = bl.mode === 'pick' ? all : Math.max(0, all - (bl.miss ? 1 : 0));
  const max = Math.max(fin(bl.min) ? bl.min * 1.3 : 0, ...bl.rows.map(r => (fin(r.ix) ? r.ix : 0)), 1);
  const rows = bl.rows.map(r => ({href: coHref(r.code), name: r.name, code: r.code, tag: bl.mode === 'near' ? '가까운 곳' : null,
    marks: all ? condMarks(ok, all) : null, ind: r.ind || null,
    indFact: fin(r.ix) ? '시장보다 ' + moreLess(r.ix) : null,
    indFig: fin(r.ix) ? barFig(r.ix, max, bl.min, 'su-barf-bl') : null}));
  if (bl.mode === 'pick') return h('section', {class: 'su-card su-bl', 'aria-label': '꽃이 될 회사'}, head,
    h('p', {class: 'su-lead', text: '오늘 조건에 모두 맞은 회사 ' + bl.rows.length + '곳이에요.'}), rowsOf(rows));
  if (bl.mode === 'near') return h('section', {class: 'su-card su-bl', 'aria-label': '꽃이 될 회사'}, head,
    fin(bl.min) ? h('p', {class: 'su-note su-legend-n', text: '막대 위 점선이 꽃 조건이에요.'}) : null,
    rowsOf(rows));
  return h('section', {class: 'su-card su-bl', 'aria-label': '꽃이 될 회사'}, head, h('p', {class: 'su-lead', text: '오늘은 조건에 맞은 회사가 없어요.'}));
}
function moneyCard(mo) {
  const head = cardHead('mo', '돈이 몰린 회사', '한 달 흐름');
  if (!mo.length) return h('section', {class: 'su-card su-mo', 'aria-label': '돈이 몰린 회사'}, head, h('p', {class: 'su-lead', text: '? 아직 못 셌어요.'}));
  const max = Math.max(...mo.map(r => r.x), 1);
  return h('section', {class: 'su-card su-mo', 'aria-label': '돈이 몰린 회사'}, head,
    h('p', {class: 'su-lead', text: '시장보다 많이 오른 업종의 대장 회사예요.'}),
    rowsOf(mo.map(r => ({href: coHref(r.code), name: r.name, code: r.code, why: r.why?.line ? '왜? ' + r.why.line : null,
      ind: r.ind, indFact: '시장보다 ' + moreLess(r.x), indFig: barFig(r.x, max, null, 'su-barf-mo')}))));
}

async function vHome() {
  const [B, TH, W, S] = await Promise.all([get(D.B), get(D.TH), get(D.W), get(D.S)]);
  const asOf = B?.asOf ?? TH?.asOf ?? W?.asOf;
  const bl = bloomList(B), mo = moneyList(TH, W);
  const nPick = bl.mode === 'pick' ? bl.rows.length : 0, all = bl.say.length, ok = bl.mode === 'pick' ? all : Math.max(0, all - (bl.miss ? 1 : 0));
  const sub = bl.mode === 'pick' ? '오늘 조건에 모두 맞은 회사예요. 아래에서 한 곳씩 보세요.'
    : bl.mode === 'near' ? '가장 가까운 회사 ' + bl.rows.length + '곳을 따로 보여 드려요. ' + josa(NAME, '가') + ' 고른 회사가 아니에요.' : '오늘은 조건에 맞은 회사가 없어요.';
  return {title: null, nodes: [bar(), h('main', {class: 'su-main su-anim'}, safe(),
    kicker('오늘', asOf),
    bigVal({tag: 'h1', label: '꽃 조건 ' + (all || '?') + '가지에 다 맞은 회사', num: String(nPick), unit: '곳', sub, cls: 'su-h1'}),
    mids([
      bl.rows.length && bl.mode === 'near' ? {label: '가장 가까운 회사', value: bl.rows.length + '곳', sub: '조건 ' + word(all) + ' 중 ' + word(ok) + ' 맞음', cls: 'su-mid-bl'} : null,
      mo.length ? {label: '돈이 몰린 회사', value: mo.length + '곳', sub: '업종의 대장 회사', cls: 'su-mid-mo'} : null]),
    bl.mode === 'near' ? recBox(bl.rec, '지난 빈 날 가장 가까운 회사', true) : recBox(bl.rec, '이렇게 고른 회사', true),
    bloomCard(bl, asOf), moneyCard(mo),
    srcBox({asOf, S, brief: true, extra: bl.rec?.n ? [['지난 기록', bl.rec.n + '번 가운데 ' + (bl.rec.hits ?? '?') + '번']] : []}),
    essBox(S))]};
}

/** 회사 한 달 그림 — 그 회사 줄(실선 · 동그라미 끝) · 지수 줄(끊긴 선 · 네모 끝) · 줄이 그려짐 · 글은 그림 밖 HTML(큰 글씨) */
function chart(name, cl, il) {
  if (!cl) return null;
  const all = [...cl, ...(il?.line ?? [])], lo = Math.min(...all), hi = Math.max(...all), pad = Math.max(2, (hi - lo) * 0.12), y0 = lo - pad, y1 = hi + pad;
  const W = 340, H = 170, X = (i, n) => 8 + (W - 16) * i / Math.max(1, n - 1), Y = v => 8 + (H - 16) * (1 - (v - y0) / (y1 - y0));
  const pts = l => l.map((v, i) => X(i, l.length).toFixed(1) + ',' + Y(v).toFixed(1)).join(' ');
  const cEnd = cl[cl.length - 1] - 100, iEnd = il ? il.line[il.line.length - 1] - 100 : null;
  const g = s('svg', {viewBox: `0 0 ${W} ${H}`, class: 'su-svg', role: 'img', 'aria-label': name + '는 한 달 동안 ' + saidPct(cEnd) + (il ? ' 같은 때 ' + il.name + '는 ' + saidPct(iEnd) : '')});
  g.append(s('line', {x1: 8, x2: W - 8, y1: Y(100).toFixed(1), y2: Y(100).toFixed(1), class: 'su-base'}));
  if (il) { g.append(s('polyline', {points: pts(il.line), class: 'su-li'})); const n = il.line.length - 1; g.append(s('rect', {x: (X(n, il.line.length) - 4).toFixed(1), y: (Y(il.line[n]) - 4).toFixed(1), width: 8, height: 8, class: 'su-dotsq'})); }
  g.append(s('polyline', {points: pts(cl), class: 'su-lc', pathLength: 1}));
  const last = cl.length - 1; g.append(s('circle', {cx: X(last, cl.length).toFixed(1), cy: Y(cl[last]).toFixed(1), r: 5, class: 'su-dotc'}));
  return h('section', {class: 'su-card su-chart', 'aria-label': '한 달 그림'},
    h('h2', {class: 'su-ct', text: '한 달 동안 걸어온 길'}),
    il ? h('p', {class: 'su-cn2', text: dateKo(il.from) + '부터 ' + dateKo(il.to) + '까지'}) : null,
    g,
    h('ul', {class: 'su-legend'},
      h('li', {class: 'su-lg-c'}, h('i', {'aria-hidden': 'true'}), h('span', {text: name + ' · 실선'}), h('b', {text: pct(cEnd)})),
      il ? h('li', {class: 'su-lg-i'}, h('i', {'aria-hidden': 'true'}), h('span', {text: il.name + ' · 끊긴 선'}), h('b', {text: pct(iEnd)})) : null));
}
/** 왜 여기 있나 — 칸 하나에 까닭 하나 */
function reasonCard(r) {
  if (r.kind === 'pick') return h('section', {class: 'su-card su-why su-bl'}, cardHead('bl', '꽃이 될 회사예요'),
    h('p', {class: 'su-lead', text: '오늘 조건 ' + r.ok.length + '가지에 모두 맞았어요.'}),
    h('ul', {class: 'su-cond'}, r.ok.map(t => h('li', {class: 'su-ok'}, h('i', {'aria-hidden': 'true', text: '✓'}), h('span', {text: t}), h('em', {text: '맞음'})))),
    recBox(r.rec, '이렇게 고른 회사'));
  if (r.kind === 'near') return h('section', {class: 'su-card su-why su-bl'}, cardHead('bl', '조건에 가장 가까운 회사예요'),
    h('p', {class: 'su-note', text: NOT_PICK}),
    h('h3', {class: 'su-h3', text: '맞은 조건'}),
    h('ul', {class: 'su-cond'}, r.ok.map(t => h('li', {class: 'su-ok'}, h('i', {'aria-hidden': 'true', text: '✓'}), h('span', {text: t}), h('em', {text: '맞음'})))),
    h('h3', {class: 'su-h3', text: '안 맞은 조건'}),
    h('ul', {class: 'su-cond'}, r.no.map(t => h('li', {class: 'su-no'}, h('i', {'aria-hidden': 'true', text: '✗'}), h('span', {text: t}), h('em', {text: '안 맞음'})))),
    recBox(r.rec, '지난 빈 날 가장 가까운 회사'));
  if (r.kind === 'money') return h('section', {class: 'su-card su-why su-mo'}, cardHead('mo', '돈이 몰린 회사예요'),
    h('p', {class: 'su-lead', text: r.ind + ' 업종이 한 달 동안 시장보다 ' + moreLess(r.x) + ' 올랐어요.'}),
    r.why?.line ? h('p', {class: 'su-lead2', text: '왜? ' + r.why.line}) : null,
    r.why?.items?.length ? h('ul', {class: 'su-items'}, r.why.items.slice(0, 4).map(it => h('li', {}, h('b', {text: it.t}), it.sub ? h('span', {text: it.sub}) : null))) : null,
    h('a', {class: 'su-more', href: indHref(r.ind)}, h('span', {text: r.ind + ' 업종 회사 모두 보기'}), h('i', {'aria-hidden': 'true', text: '›'})));
  return null;
}
/** 회사 쪽 큰 값 — 이 회사가 여기 나온 까닭(샘플 01 · 03 · 08) */
function coBig(rs) {
  const r = rs[0];
  if (!r) return bigVal({label: '오늘 두 목록에', num: '없어요', sub: '이 회사는 오늘 두 목록에 없어요. 지난 한 달만 보여 드려요.', cls: 'su-big-none'});
  if (r.kind === 'pick') return h('div', {class: 'su-bigw'}, bigVal({label: '꽃 조건 ' + r.ok.length + '가지에', num: String(r.ok.length), unit: '가지 모두 맞았어요'}), condMarks(r.ok.length, r.ok.length, true));
  if (r.kind === 'near') { const all = r.ok.length + r.no.length; return h('div', {class: 'su-bigw'}, bigVal({label: '꽃 조건 ' + all + '가지 가운데', num: String(r.ok.length), unit: '가지 맞았어요'}), condMarks(r.ok.length, all, true)); }
  return bigVal({label: r.ind + ' 업종이 한 달 동안 시장보다', num: moreLess(r.x), unit: ' 올랐어요', cls: 'su-big-mo'});
}

async function vCo(code) {
  if (!CODE.test(code ?? '')) return notFound('이 회사를 찾지 못했어요.');
  const [B, TH, W, H, S, co] = await Promise.all([get(D.B), get(D.TH), get(D.W), get(D.H), get(D.S), get(D.co(code))]);
  const c = co?.c; if (!c || typeof c.name !== 'string') return notFound('이 회사를 찾지 못했어요.');
  const bl = bloomList(B), rs = reasonsFor(code, bl, moneyList(TH, W)), ind = typeof c.i === 'string' ? c.i : null;
  const il = idxLine(H, c.market, H?.base, H?.asOf), cl = coLine(co);
  seen = {code, name: c.name, ind};
  const near = rs.find(r => r.kind === 'near'), cEnd = cl ? cl[cl.length - 1] - 100 : null, iEnd = il ? il.line[il.line.length - 1] - 100 : null;
  const max = near && fin(near.ix) ? Math.max(fin(near.min) ? near.min * 1.3 : 0, near.ix, 1) : null;
  return {title: c.name, nodes: [bar(), h('main', {class: 'su-main su-anim'}, back(), safe(),
    kicker('회사', H?.asOf),
    h('h1', {class: 'su-h1 su-coh', tabindex: '-1'}, h('span', {'data-proper': '', text: c.name})),
    ind ? h('a', {class: 'su-ind', href: indHref(ind)}, h('span', {text: ind + ' 업종'}), h('i', {'aria-hidden': 'true', text: '›'})) : null,
    coBig(rs),
    mids([
      near && fin(near.ix) ? {label: '업종이 시장보다', value: moreLess(near.ix), sub: fin(near.min) ? '점선이 꽃 조건이에요' : null, fig: barFig(near.ix, max, near.min, 'su-barf-bl'), cls: 'su-mid-wide'} : null,
      fin(cEnd) ? {label: c.name + ' 한 달', value: pct(cEnd), sub: saidPct(cEnd)} : null,
      fin(iEnd) ? {label: il.name + ' 한 달', value: pct(iEnd), sub: saidPct(iEnd)} : null]),
    rs.length ? rs.map(r => reasonCard(r)) : h('p', {class: 'su-lead2 su-none', text: '이 회사는 오늘 두 목록에 없어요. 지난 한 달만 보여 드려요.'}),
    chart(c.name, cl, il),
    h('a', {class: 'su-ask', href: '/next/#/why/' + code}, h('span', {class: 'su-ask-a', text: '사기 전에 한 번 멈춰요'}), h('span', {class: 'su-ask-b', text: '「왜 사?」 열한 질문으로 내 이유부터 확인해요'}), h('i', {'aria-hidden': 'true', text: '›'})),
    srcBox({asOf: H?.asOf, S, extra: il ? [['한 달 그림', dateKo(il.from) + '부터 ' + dateKo(il.to) + '까지']] : []}),
    back('su-back-end'), foot())]};
}

/** 업종 회사 막대 — 0 선에서 오름은 오른쪽(채움) · 내림은 왼쪽(빗금) · 같은 자(샘플 07 · 08) */
function divFig(v, maxAbs) {
  if (!fin(v) || !fin(maxAbs) || maxAbs <= 0) return null;
  const W = 300, H = 16, mid = W / 2, w = Math.max(2, Math.min(mid, mid * Math.abs(v) / maxAbs));
  const g = s('svg', {viewBox: `0 0 ${W} ${H}`, class: 'su-barf su-divf', 'aria-hidden': 'true', focusable: 'false'});
  g.append(s('line', {x1: mid, x2: mid, y1: 0, y2: H, class: 'su-bz'}));
  g.append(s('rect', {x: (v >= 0 ? mid : mid - w).toFixed(1), y: 3, width: w.toFixed(1), height: 10, rx: 4, class: v >= 0 ? 'su-bf su-up' : 'su-bf su-dn'}));
  return g;
}
const SHOW = 12; // 업종 쪽 처음에 보일 회사 수(샘플 01 · 08 · 09 · 11 — 위 몇 곳만 먼저)

async function vInd(name) {
  const [B, TH, W, M, S] = await Promise.all([get(D.B), get(D.TH), get(D.W), get(D.M), get(D.S)]);
  const rows = indRows(M, name); if (!rows.length) return notFound('이 업종을 찾지 못했어요.');
  const t = (Array.isArray(TH?.inds) ? TH.inds : []).find(i => i?.n === name), w = whyOf(W, name), bl = bloomList(B);
  const min = bl.mode === 'near' && fin(bl.min) ? bl.min : null, x = t && fin(t.x) ? t.x : null;
  const from = seen && seen.ind === name ? seen : null;
  const maxAbs = Math.max(...rows.slice(0, SHOW).map(r => (fin(r.c) ? Math.abs(r.c) : 0)), 1);
  const list = rs => rowsOf(rs.map(r => ({href: coHref(r.code), name: r.name, code: r.code, seen: from && from.code === r.code, sub: '한 달 ' + pct(r.c), fig: divFig(r.c, maxAbs)})), from?.code);
  const rest = rows.slice(SHOW);
  const more = rest.length ? h('button', {type: 'button', class: 'su-more su-more-co', 'aria-expanded': 'false'}, h('span', {text: '나머지 ' + rest.length + '곳도 보기'}), h('i', {'aria-hidden': 'true', text: '⌄'})) : null;
  const restBox = rest.length ? h('div', {class: 'su-rest', hidden: true}, list(rest)) : null;
  if (more) more.addEventListener('click', () => { restBox.hidden = false; more.remove(); });
  return {title: name + ' 업종', nodes: [bar(), h('main', {class: 'su-main su-anim'}, back(), safe(),
    kicker('업종', M?.asOf),
    h('h1', {class: 'su-h1', tabindex: '-1'}, h('span', {text: name + ' 업종'})),
    x != null ? h('div', {class: 'su-bigw'}, bigVal({label: '한 달 동안 시장보다', num: moreLess(x), unit: ' 올랐어요', cls: 'su-big-ind'}),
      barFig(Math.max(0, x), Math.max(min ? min * 1.3 : 0, x, 1), min, 'su-barf-big'),
      min ? h('p', {class: 'su-note'}, h('span', {text: '점선은 꽃 조건이에요. '}), bl.miss ?? '') : null) : null,
    mids([
      {label: '이 업종 회사', value: rows.length + '곳', sub: rows.length > SHOW ? '한 달 많이 오른 차례로 ' + SHOW + '곳 먼저' : '한 달 많이 오른 차례'},
      from ? {label: '보던 회사', value: from.name, sub: '아래 줄에 「보던 회사」로 표시했어요', cls: 'su-mid-seen'} : null]),
    from ? h('a', {class: 'su-more su-back-co', href: coHref(from.code)}, h('span', {text: '‹ ' + from.name + '로 돌아가기'}), h('i', {'aria-hidden': 'true', text: '›'})) : null,
    w ? h('section', {class: 'su-card su-mo', 'aria-label': '돈이 몰린 까닭'}, cardHead('mo', '돈이 몰린 까닭'),
      w.line ? h('p', {class: 'su-lead', text: w.line}) : null,
      w.items.length ? h('ul', {class: 'su-items'}, w.items.slice(0, 4).map(it => h('li', {}, h('b', {text: it.t}), it.sub ? h('span', {text: it.sub}) : null))) : null) : null,
    h('section', {class: 'su-card', 'aria-label': '이 업종 회사'}, cardHead('co', '이 업종 회사 ' + rows.length + '곳', '한 달 많이 오른 차례'),
      list(rows.slice(0, SHOW)), restBox, more),
    h('a', {class: 'su-ask', href: '/next/#/why'}, h('span', {class: 'su-ask-a', text: '사기 전에 한 번 멈춰요'}), h('span', {class: 'su-ask-b', text: '「왜 사?」 열한 질문으로 내 이유부터 확인해요'}), h('i', {'aria-hidden': 'true', text: '›'})),
    srcBox({asOf: M?.asOf, S, extra: [['이 업종 회사', rows.length + '곳 모두']]}),
    back('su-back-end'), foot())]};
}

function notFound(msg) { return {title: '?', nodes: [bar(), h('main', {class: 'su-main'}, back(), h('p', {class: 'su-lead su-none', text: '? ' + msg}))]}; }

/** 본질 세 줄 — essence.js 그대로(회사 수 · 받은 때 = home-summary.json · 못 읽으면 「?」) · 「왜 사?」 열한 질문으로 가는 고리 하나(본질 2번) */
function essBox(S) {
  const lines = essenceLines(essenceData({summary: S}));
  return h('section', {class: 'su-ess', 'aria-label': NAME + ' 세 줄'},
    lines.map((t, i) => h('p', {'data-ess': String(i + 1), text: t})),
    h('a', {class: 'su-full', href: '/next/#/why'}, h('span', {text: '「왜 사?」 열한 질문 하기'}), h('i', {'aria-hidden': 'true', text: '›'})),
    h('a', {class: 'su-full', href: '/next/'}, h('span', {text: '모든 기록은 지금 ' + NAME + '에서'}), h('i', {'aria-hidden': 'true', text: '›'})));
}

const pos = new Map(); // 처음 쪽으로 돌아오면 보던 자리(샘플 02 · 08)
let cur = null, seq = 0;
async function route() {
  const fw = forwardTo(location.search, location.hash); // 지금 수르 고리(#/w/ · #/s/ · ?lang= …)는 그쪽으로 그대로(첫 화면이 된 뒤 옛 고리 · 카톡으로 받은 고리)
  if (fw) { location.replace(fw); return; }
  if (cur != null) pos.set(cur, window.scrollY);
  const m = /^#\/(c|i)\/(.+)$/.exec(location.hash || '');
  let a = null; if (m) { try { a = decodeURIComponent(m[2]); } catch { a = m[2]; } }
  const my = ++seq, root = document.getElementById('su'), key = m ? location.hash : '#/';
  let out;
  try { out = !m ? await vHome() : m[1] === 'c' ? await vCo(a) : await vInd(a); }
  catch (e) { console.error(e); out = notFound('화면을 그리지 못했어요. 잠시 뒤 다시 열어 주세요.'); }
  if (my !== seq) return;
  root.replaceChildren(...out.nodes.filter(Boolean));
  try { glossTree(root); } catch (e) { console.error(e); }
  document.title = (out.title ? out.title + ' · ' : '') + NAME;
  cur = key;
  window.scrollTo(0, key === '#/' && pos.has(key) ? pos.get(key) : 0);
  root.querySelector('h1')?.focus?.({preventScroll: true});
}
window.addEventListener('hashchange', route);
route();
