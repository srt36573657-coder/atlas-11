/* 큐피트 1 · 2 · 3등 달력(주문 0938 · 사장님 2026-11-10 09:38 「자 달력을 만들어 1.2.3달력을 그리고 찾아낸 그날부터해서 첫페이지처럼 표현햐서 추적해
   그리고 10주씩 무조건 매수해 그리고 나서 수익율률을 추적하기 해봐   잡스라면」)
   길 #/r/c — 모든 사람(주문 1513 · 사장님 2026-11-10 15:13 「모든사람 휴대폰에 열리게 해」 · 0938 때는 사장님 열쇠 기기에서만이었음) · 기록 쪽 서랍 맨 앞
   잡스라면: 맨 위 큰 숫자 하나(10주씩 산 셈 — 지금 얼마) → 달력 하나(장이 서는 월 ~ 금 · 뽑힌 날에 1 · 2 · 3) → 누른 날의 세 칸(첫 페이지 칸처럼 이름 · 값 · 꺾은선)
   셈(화면에서): 산 값 = 그 판 날 마지막 값 × 10주 · 지금 = 가장 늦은 판 날 마지막 값 × 10주 · 번 것과 잃은 것을 함께 · 「100원이 ○원」(「%」 0) · 「산 셈」(쓰지 않을 말 0) · 순위 0
   자료 /su/data/su21-book.json(scripts/atlas11/next/su21_book.mjs — 판마다 · 한 번 적은 날은 고치지 않음) · 글은 textContent 로만 · 꾸밈 값은 CSSOM(보안 규칙 style-src 'self') */
import {h, s} from '/su/su-fig.js';
import {KIND} from '/su/su-21.js';

export const CSS = '/su/su-book.css';
const fin = v => typeof v === 'number' && Number.isFinite(v);
const num = v => (fin(v) ? Math.round(v).toLocaleString('ko-KR') : '?');
const DAY = /^\d{4}-\d{2}-\d{2}$/;
const md = d => (DAY.test(d ?? '') ? +d.slice(5, 7) + '월 ' + +d.slice(8, 10) + '일' : '?');
const WD = ['일', '월', '화', '수', '목', '금', '토'];
/** 돈 — 「196만 1,000원」 · 「4,500원」(억 · 만 자리) */
export const won = v => {
  if (!fin(v)) return '?';
  const a = Math.round(Math.abs(v)), e = Math.floor(a / 1e8), m = Math.floor((a % 1e8) / 1e4), r = a % 1e4;
  const out = [e ? num(e) + '억' : '', m ? num(m) + '만' : '', r || (!e && !m) ? num(r) : ''].filter(Boolean).join(' ');
  return out + '원';
};
/** 늘고 준 말 — 「11만 4,000원 늘었어요」 · 「그대로예요」 */
export const moved = d => (!fin(d) ? '?' : Math.round(d) > 0 ? won(d) + ' 늘었어요' : Math.round(d) < 0 ? won(d) + ' 줄었어요' : '그대로예요');
const r100 = (now, buy) => (fin(now) && fin(buy) && buy > 0 ? '100원이 ' + (Math.round(1000 * now / buy) / 10).toLocaleString('ko-KR') + '원' : '?');

/* ── 셈 — 산 셈마다 산 값 · 지금 값 · 지금까지 값 줄(산 날부터) ── */
export function bookCalc(B) {
  const qty = fin(B?.qty) ? B.qty : 10;
  const P = Object.fromEntries(Object.entries(B?.px ?? {}).map(([k, v]) => [k, (Array.isArray(v) ? v : Object.entries(v ?? {})).filter(([d, x]) => DAY.test(d) && fin(x) && x > 0).sort(([a], [b]) => a.localeCompare(b))]));
  const rows = (B?.days ?? []).flatMap(d => (d.picks ?? []).map(p => {
    const ser = (P[p.code] ?? []).filter(([dd]) => dd >= d.board), now = ser.length ? ser[ser.length - 1] : [d.board, p.px];
    return {day: d.board, seen: d.seen, place: p.place, k: p.k, code: p.code, name: p.name, buy: p.px, now: now[1], nowDay: now[0], ser: ser.length ? ser : [[d.board, p.px]], cost: p.px * qty, val: now[1] * qty};
  }));
  const cost = rows.reduce((a, r) => a + r.cost, 0), val = rows.reduce((a, r) => a + r.val, 0);
  const last = rows.map(r => r.nowDay).sort().pop() ?? B?.asOf ?? null;
  return {qty, rows, cost, val, diff: val - cost, last, days: [...new Set(rows.map(r => r.day))].sort()};
}

/* ── 그림 — 산 날부터 꺾은선(도형만 · 글은 HTML) · 산 값 줄 ── */
function spark(r) {
  const W = 300, H = 64, xs = r.ser.map(([, v]) => v), lo = Math.min(...xs, r.buy), hi = Math.max(...xs, r.buy), span = hi - lo || 1;
  const X = i => (r.ser.length > 1 ? 6 + (W - 12) * i / (r.ser.length - 1) : W / 2), Y = v => 8 + (H - 16) * (1 - (v - lo) / span);
  const d = r.ser.map(([, v], i) => (i ? 'L' : 'M') + X(i).toFixed(1) + ' ' + Y(v).toFixed(1)).join(' ');
  return s('svg', {class: 'bk-sp', viewBox: `0 0 ${W} ${H}`, 'aria-hidden': 'true', preserveAspectRatio: 'none'},
    s('line', {x1: 0, x2: W, y1: Y(r.buy).toFixed(1), y2: Y(r.buy).toFixed(1), class: 'bk-base'}),
    r.ser.length > 1 ? s('path', {d, class: 'bk-line ' + (r.now >= r.buy ? 'bk-upl' : 'bk-dnl')}) : null,
    s('circle', {cx: X(0).toFixed(1), cy: Y(r.ser[0][1]).toFixed(1), r: 4, class: 'bk-buy'}),
    s('circle', {cx: X(r.ser.length - 1).toFixed(1), cy: Y(r.ser[r.ser.length - 1][1]).toFixed(1), r: 5, class: 'bk-now'}));
}
/** 첫 페이지 칸처럼 — 등수 · 묶음 · 이름 · 꺾은선 · 산 값 → 지금 · 10주 늘고 준 것 · 100원이 ○원 */
function card(r, qty) {
  const st = r.now > r.buy ? 'up' : r.now < r.buy ? 'dn' : 'eq';
  return h('li', {class: 'bk-card bk-' + st, 'data-code': r.code, 'data-place': String(r.place)},
    h('p', {class: 'bk-top'}, h('b', {class: 'bk-pl', text: r.place + '등'}), ' ', KIND[r.k] ? h('span', {text: KIND[r.k] + ' 7곳'}) : null), // 첫 페이지 목록 이름(「불장 7곳」 · 「돈이 몰릴 듯 7곳」)
    h('h3', {class: 'bk-nm', text: r.name}),
    spark(r),
    h('p', {class: 'bk-px'}, h('span', {text: '산 값 ' + num(r.buy) + '원'}), ' ', h('span', {text: '지금 ' + num(r.now) + '원'})),
    h('p', {class: 'bk-mv'}, h('b', {text: qty + '주 — ' + moved(r.val - r.cost)}), ' ', h('span', {text: r100(r.now, r.buy) + (r.ser.length > 1 ? '' : ' · 아직 하루치예요')})),
    h('a', {class: 'bk-go', href: '#/c/' + r.code}, h('span', {text: '이 회사 쪽 보기'}), h('i', {'aria-hidden': 'true', text: '›'})));
}

/* ── 달력 — 장이 서는 월 ~ 금 · 뽑힌 날만 누름 · 1 · 2 · 3 칸은 늘었으면 꽉 찬 칸 · 줄었으면 빈 칸(색만으로 가르지 않음) ── */
function months(days, last) {
  const first = days[0] ?? last, end = last > (days[days.length - 1] ?? '') ? last : days[days.length - 1];
  const out = []; let y = +first.slice(0, 4), m = +first.slice(5, 7);
  while (y < +end.slice(0, 4) || (y === +end.slice(0, 4) && m <= +end.slice(5, 7))) { out.push([y, m]); m++; if (m > 12) { m = 1; y++; } }
  return out;
}
function calendar(C, pick) {
  const by = new Map(C.days.map(d => [d, C.rows.filter(r => r.day === d).sort((a, b) => a.place - b.place)]));
  const grid = (y, m) => {
    const n = new Date(Date.UTC(y, m, 0)).getUTCDate(), cells = [];
    for (let dd = 1; dd <= n; dd++) {
      const wd = new Date(Date.UTC(y, m - 1, dd)).getUTCDay(); if (wd === 0 || wd === 6) continue; // 장이 서지 않는 주말은 뺌
      const key = y + '-' + String(m).padStart(2, '0') + '-' + String(dd).padStart(2, '0'), rs = by.get(key);
      if (!cells.length) for (let k = 1; k < wd; k++) cells.push(h('span', {class: 'bk-d bk-pad', 'aria-hidden': 'true'})); // 첫 주 앞 빈칸(월요일부터)
      if (!rs) { cells.push(h('span', {class: 'bk-d' + (key === C.last ? ' bk-today' : ''), 'aria-hidden': 'true'}, h('i', {text: String(dd)}))); continue; }
      const b = h('button', {type: 'button', class: 'bk-d bk-pick', 'data-day': key, 'aria-label': md(key) + ' 판 — ' + rs.map(r => r.place + '등 ' + r.name + ' ' + (r.now > r.buy ? '늘었어요' : r.now < r.buy ? '줄었어요' : '그대로예요')).join(' · ')},
        h('i', {text: String(dd)}), h('span', {class: 'bk-123'}, rs.map(r => h('b', {class: r.now > r.buy ? 'bk-u' : r.now < r.buy ? 'bk-n' : 'bk-e', text: String(r.place)}))));
      b.addEventListener('click', () => pick(key));
      cells.push(b);
    }
    return h('section', {class: 'bk-mon', 'aria-label': y + '년 ' + m + '월'}, h('h3', {class: 'bk-mh', text: y + '년 ' + m + '월'}),
      h('div', {class: 'bk-grid'}, ['월', '화', '수', '목', '금'].map(w => h('span', {class: 'bk-wd', 'aria-hidden': 'true', text: w})), cells));
  };
  return h('div', {class: 'bk-cal'}, months(C.days, C.last).map(([y, m]) => grid(y, m)),
    h('p', {class: 'bk-key'}, h('b', {class: 'bk-u', text: '1'}), h('span', {text: '늘었어요'}), ' ', h('b', {class: 'bk-n', text: '1'}), h('span', {text: '줄었어요'}), ' ', h('b', {class: 'bk-e', text: '1'}), h('span', {text: '그대로'}), ' ', h('span', {text: '숫자는 등수예요.'})));
}

function ensureCss() { if (typeof document !== 'undefined' && !document.querySelector(`link[href="${CSS}"]`)) document.head.append(Object.assign(document.createElement('link'), {rel: 'stylesheet', href: CSS})); }

export async function vBook(X) {
  ensureCss();
  const T = '1 · 2 · 3등 달력';
  const [B, b] = await Promise.all([X.get('/su/data/su21-book.json').catch(() => null), X.base().catch(() => ({}))]);
  if (!B || !Array.isArray(B.days) || !B.days.length) return X.notFound('1 · 2 · 3등 장부를 받지 못했어요. 다시 열어 주세요.');
  const C = bookCalc(B);
  const st = C.diff > 0 ? 'up' : C.diff < 0 ? 'dn' : 'eq';
  const detail = h('section', {class: 'bk-day', 'aria-live': 'polite'});
  let cal = null;
  const pick = key => {
    const rs = C.rows.filter(r => r.day === key).sort((a, b) => a.place - b.place), seen = rs[0]?.seen ?? '';
    detail.replaceChildren(...[h('h2', {class: 'su-ft', text: md(key) + ' 판 — 1등부터 3등까지'}), // replaceChildren 은 null 을 「null」 글로 넣음 — 빈 것은 뺌
      DAY.test(seen.slice(0, 10)) && seen.slice(0, 10) > key ? h('p', {class: 'bk-note', text: md(seen.slice(0, 10)) + '에 처음 뽑혔어요. 값은 ' + md(key) + ' 마지막 값으로 셌어요.'}) : null,
      h('ol', {class: 'bk-cards'}, rs.map(r => card(r, C.qty)))].filter(Boolean));
    for (const e of cal?.querySelectorAll('.bk-pick') ?? []) { const on = e.getAttribute('data-day') === key; e.classList.toggle('bk-on', on); e.setAttribute('aria-pressed', String(on)); }
  };
  cal = calendar(C, pick);
  const hero = h('div', {class: 'su-hero bk', 'data-g': 'su-book', 'data-days': String(C.days.length), 'data-n': String(C.rows.length), 'data-diff': String(Math.round(C.diff))},
    h('section', {class: 'bk-big bk-' + st, 'aria-label': '10주씩 산 셈 — 지금'},
      h('p', {class: 'bk-k', text: C.qty + '주씩 산 셈 · 가짜 돈'}),
      h('p', {class: 'bk-v', text: moved(C.diff)}),
      h('p', {class: 'bk-s bk-two'}, h('span', {text: '산 값 ' + won(C.cost)}), h('span', {text: '지금 ' + won(C.val)})),
      h('p', {class: 'bk-s', text: r100(C.val, C.cost) + '이 됐어요.'}),
      h('p', {class: 'bk-when', text: md(C.last) + ' 마지막 값까지 · 산 셈 ' + C.rows.length + '번'})),
    cal, detail);
  pick(C.days[C.days.length - 1]);
  const how = h('details', {class: 'bk-how'}, h('summary', {class: 'bk-hs'}, h('b', {text: '이렇게 셌어요'}), h('span', {text: '진짜 돈이 아니에요'})),
    h('ul', {class: 'bk-ul'}, ['그 판 날 마지막 값으로 ' + C.qty + '주씩 산 셈이에요.', '산 뒤에는 팔지 않고 들고 있다고 쳐요.', '한 번 적은 날은 고치지 않아요.',
      '판 날보다 늦게 뽑힌 날은 판 날 값으로 셌어요.', '값은 네이버 증권 그날 마지막 값이에요.', '지난 기록이에요. 앞날을 맞히지 않아요.'].map(t => h('li', {text: t}))));
  // 탭 4 = 달력(주문 0040 — 이 쪽을 열면 아래 「달력」 탭이 켜짐)
  return {title: T, tab: 4, step: null, kick: C.qty + '주씩 산 셈 · 가짜 돈', h1: T, proper: false, hero, body: [how],
    next: {href: '#/r', label: '지난 기록 한곳'}, asOf: B.asOf ?? null, S: b?.S ?? null};
}
