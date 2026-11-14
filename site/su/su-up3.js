/* 큐피트 새 잣대 1 · 2 · 3등 — 한 회사 쪽(#/c/<번호>/t · 주문 1112-0044)
   사장님 2026-11-12 00:44(서울) 「여기 1.2.3에 그래프 그리고 다양한 정보 직관적으로 보이게 하고 클릭 하면 그정보가 이어지게 해」
   첫 페이지 1 · 2 · 3등 칸을 누르면 이어지는 쪽 — 칸에서 본 것을 크게:
     ① 칩 셋(현재가 · 한 달 · 업종) ② 한 달 꺾은선(처음 · 끝 날 · 한 달 전 값 줄 · 마지막 값 점)
     ③ 잣대 넷 막대(가운데 = 보통 · 오른쪽 = 높아요 · 왼쪽 = 낮아요) + 잣대마다 쉬운 풀이 한 줄 ④ 넷을 더한 차례 · 처음 뽑힌 날(달력 장부에 있으면)
     ⑤ 지난 기록(남겨 둔 기간까지 · 앞날을 맞히지 않음) ⑥ 다른 두 곳(누르면 그 곳 쪽) ⑦ 달력 · 회사 쪽 · 「왜 사?」
   자료 = su21.json top3(우량주 365곳 · 넷 고른 섞기 · 판 날 값 · 21 마지막 값) · 처음 뽑힌 날 = su21-book.json(새 잣대 판 날만) · 그리기는 h · s 만(글 속 style 없음) */
import {h, s} from '/su/su-fig.js';
import {NEED, num} from '/su/su-six.js';
import {dateKo, won100} from '/su/su-data.js'; // 「%」 대신 「100원이 ○원」(주문 1114-1306 ① — 첫 페이지 1 · 2 · 3등 칸과 같은 말)
import {load21} from '/su/su-21.js';

export const CSS = '/su/su-up3.css';
const CSSW = '/su/su-why36.css'; // 칩 · 상자 · 번호 줄은 「왜?」 쪽과 같은 틀
const fin = v => typeof v === 'number' && Number.isFinite(v);
export const HOW = Object.freeze(['긴 오름세 · 덜 흔들림', '1년 오른 날 몫', '업종 따라잡기', '닷새 눌림']);
/* 쉬운 판(주문 1112-0253) — 기준 넷을 문장으로(첫 페이지 su-apple.js EASYHOW 와 같은 말 · 자료 이름은 그대로) */
export const EASYHOW = Object.freeze({'긴 오름세 · 덜 흔들림': '1년 꾸준히 오름', '1년 오른 날 몫': '1년 오른 날이 많음', '업종 따라잡기': '업종보다 덜 오름', '닷새 눌림': '최근 5일 쉼'});
/** 잣대마다 쉬운 풀이(su21_up3.py parts 와 같은 뜻) */
export const SAYS = Object.freeze([
  '1년 동안 많이 오르고 덜 흔들린 회사일수록 높아요. 마지막 한 달은 빼고 봐요.',
  '1년 동안 오른 날이 많을수록 높아요.',
  '업종은 한 달 동안 올랐는데 이 회사가 덜 올랐으면 높아요.',
  '닷새 동안 시장보다 덜 올랐으면 높아요.']);
export const sz = v => (fin(v) ? (v >= 0.5 ? '높아요' : v <= -0.5 ? '낮아요' : '보통이에요') : NEED);
const ord = n => (n === 1 ? '첫 번째' : n + '번째');
const won = v => (fin(v) ? num(Math.round(v)) + '원' : NEED);
const w100 = x => (fin(x) ? won100(x) : NEED); // 한 달 동안 100원이 얼마가 됐나(옛 「한 달 −42.2%」)
const day = d => (typeof d === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(d) ? dateKo(d) : NEED);
const ym = d => (/^\d{4}-\d{2}/.test(d ?? '') ? d.slice(0, 4) + '년 ' + +d.slice(5, 7) + '월' : NEED);
const f1 = v => Math.round(v * 10) / 10;

/** 판 날 값 · 21 마지막 값(끝 = 현재가일 때만) · 한 달 오른 만큼 — 첫 페이지 칸과 같은 셈 */
export function facts(r, board) {
  const px = fin(r?.close) && r.close > 0 && (!r.date || !board || r.date === board) ? r.close : null;
  const sp = Array.isArray(r?.c) && r.c.length === 21 && r.c.every(v => fin(v) && v > 0) && px === r.c[20] ? r.c : null;
  const ch = sp ? (fin(r?.ch20) ? r.ch20 : Math.round((sp[20] / sp[0] - 1) * 1000) / 10) : null;
  return {px, sp, ch};
}

/* ── 한 달 꺾은선(크게) — 21 마지막 값 그대로 · 높이는 한 달 가장 낮은 값 ~ 가장 높은 값 · 한 달 전 값에 옅은 줄 · 처음 · 끝 날 ── */
function bigLine(name, sp, from, to, ch) {
  const W = 350, H = 214, X0 = 10, X1 = 230, Y0 = 46, Y1 = 158; // 오른쪽 120 = 마지막 값 글 자리(점과 겹치지 않게)
  const lo = Math.min(...sp), hi = Math.max(...sp), n = sp.length;
  const px = i => X0 + ((X1 - X0) * i) / (n - 1), py = v => (hi === lo ? (Y0 + Y1) / 2 : Y1 - ((v - lo) / (hi - lo)) * (Y1 - Y0));
  const ex = f1(px(n - 1)), ey = f1(py(sp[n - 1])), sy = f1(py(sp[0]));
  return s('svg', {class: 'u3-line', viewBox: `0 0 ${W} ${H}`, role: 'img', preserveAspectRatio: 'xMidYMid meet',
    'aria-label': name + ' 한 달 꺾은선 · ' + day(from) + ' ' + won(sp[0]) + ' → ' + day(to) + ' ' + won(sp[n - 1]) + ' · 한 달 ' + w100(ch)},
    s('text', {x: X0, y: 24, class: 'u3-lt', text: '한 달 전 ' + won(sp[0])}),
    s('path', {d: `M${X0} ${sy}H${X1}`, class: 'u3-l0'}),
    s('path', {d: 'M' + sp.map((v, i) => f1(px(i)) + ' ' + f1(py(v))).join('L'), class: 'u3-lp'}),
    s('circle', {cx: f1(px(0)), cy: sy, r: 4.5, class: 'u3-ls'}),
    s('circle', {cx: ex, cy: ey, r: 6, class: 'u3-le'}),
    s('text', {x: X1 + 12, y: f1(Math.max(Y0 + 12, Math.min(Y1, ey + 6))), class: 'u3-lv', text: won(sp[n - 1])}),
    s('text', {x: X0, y: H - 14, class: 'u3-ld', text: day(from)}),
    s('text', {x: X1, y: H - 14, class: 'u3-ld', 'text-anchor': 'end', text: day(to)}));
}

/* ── 잣대 넷 막대 — 가운데 줄 = 보통(우량주끼리 견준 값 0) · 오른쪽으로 길면 높아요 · 왼쪽이면 낮아요 · 넘는 값은 끝에서 멈춤 ── */
function bars4(name, parts, how) {
  const W = 350, RH = 70, H = 4 * RH + 40, C = W / 2, M = 3;
  const g = s('svg', {class: 'u3-bars', viewBox: `0 0 ${W} ${H}`, role: 'img', preserveAspectRatio: 'xMidYMid meet',
    'aria-label': name + ' 이유 넷 — ' + how.map((t, j) => t + ' ' + sz(parts[j])).join(' · ')});
  how.forEach((t, j) => {
    const v = parts[j], y = j * RH, c = fin(v) ? Math.max(-M, Math.min(M, v)) : 0, x = C + (c / M) * (C - 2);
    g.append(s('g', {class: 'u3-bar', 'data-j': String(j + 1), 'data-v': fin(v) ? String(v) : ''},
      s('text', {x: 0, y: y + 22, class: 'u3-bt', text: (j + 1) + '  ' + t}),
      s('text', {x: W, y: y + 22, class: 'u3-bw' + (fin(v) && v >= 0.5 ? ' u3-up' : ''), 'text-anchor': 'end', text: sz(v)}),
      s('rect', {x: 0, y: y + 34, width: W, height: 16, rx: 8, class: 'u3-tr'}),
      fin(v) ? s('rect', {x: f1(Math.min(C, x)), y: y + 34, width: f1(Math.max(2, Math.abs(x - C))), height: 16, rx: 4, class: v >= 0 ? 'u3-bp' : 'u3-bn'}) : null,
      s('path', {d: `M${C} ${y + 29}V${y + 55}`, class: 'u3-bc'})));
  });
  g.append(s('text', {x: 0, y: H - 8, class: 'u3-bs', text: '‹ 낮아요'}), s('text', {x: C, y: H - 8, class: 'u3-bs', 'text-anchor': 'middle', text: '보통'}),
    s('text', {x: W, y: H - 8, class: 'u3-bs', 'text-anchor': 'end', text: '높아요 ›'}));
  return g;
}

function ensureCss() {
  if (typeof document === 'undefined') return;
  for (const href of [CSSW, CSS]) if (!document.querySelector(`link[href="${href}"]`)) document.head.append(Object.assign(document.createElement('link'), {rel: 'stylesheet', href}));
}
const chip = (k, v, cls = '') => h('p', {class: 'yw-chip' + (cls ? ' ' + cls : '')}, h('span', {text: k}), h('b', {text: v}));

/** 처음 뽑힌 날 — 달력 장부(su21-book.json)에서 새 잣대 판(up3-v1) 날 가운데 이 회사가 든 첫 날 · 든 날 수 */
export function firstPick(book, code) {
  const ds = (Array.isArray(book?.days) ? book.days : []).filter(d => d?.rule === 'up3-v1' && Array.isArray(d.picks) && d.picks.some(p => p?.code === code));
  if (!ds.length) return null;
  const d0 = ds[0], p0 = d0.picks.find(p => p.code === code);
  return {board: d0.board, place: p0?.place ?? null, px: fin(p0?.px) ? p0.px : null, n: ds.length};
}

export async function vUp3(X, code) {
  ensureCss();
  const get = X.get;
  const [T, book, b] = await Promise.all([load21(get).catch(() => null), get('/su/data/su21-book.json').catch(() => null), X.base().catch(() => ({}))]);
  const t3 = T?.top3, rank = t3?.v === 'up3-v1' && Array.isArray(t3.rank) ? t3.rank : [];
  const me = rank.find(r => r?.code === code);
  if (!me) return X.notFound('이 회사는 오늘 1 · 2 · 3등이 아니에요. 첫 페이지에서 다시 골라 주세요.');
  if (X.setCur) X.setCur({code, name: me.name, ind: me.ind});
  const board = T?.asOf?.board ?? null, how = (Array.isArray(t3.how) && t3.how.length === 4 ? t3.how : HOW).map(t => EASYHOW[t] ?? t), parts = Array.isArray(me.parts) ? me.parts : [];
  const {px, sp, ch} = facts(me, board), name = String(me.name ?? NEED), P = t3.past ?? {};
  const head = h('section', {class: 'yw-sum u3-sum', 'aria-label': '현재가 · 한 달 · 업종'},
    chip('현재가', won(px), 'u3-px'), chip('한 달', sp ? w100(ch) : NEED, sp && ch >= 0 ? 'u3-pos' : ''), chip('업종', String(me.ind ?? NEED)));
  const graph = sp ? h('figure', {class: 'u3-fig', 'aria-label': '한 달 꺾은선'}, bigLine(name, sp, me.cFrom, me.date, ch),
    h('figcaption', {class: 'yw-s u3-cap', text: '꺾은선은 한 달 동안 날마다 마지막 값이에요. 옅은 줄은 한 달 전 값이에요.'}))
    : h('p', {class: 'yw-s u3-need', text: '한 달 꺾은선은 ' + NEED + '이에요.'});
  const fp = firstPick(book, code);
  const why = h('section', {class: 'yw-box u3-why', 'aria-label': '고른 이유 넷'},
    h('h2', {class: 'yw-h', text: '고른 이유 넷'}),
    h('p', {class: 'yw-s', text: '우량주 ' + (t3.n ?? NEED) + '곳 가운데 몸집이 작은 곳과 값이 모자란 곳을 빼고 ' + (t3.pool ?? NEED) + '곳끼리 날마다 견줘요. 가운데 줄이 보통이에요.'}),
    bars4(name, parts, how),
    h('ol', {class: 'yw-ol u3-ol'}, how.map((t, j) => h('li', {class: 'yw-li'}, h('span', {class: 'yw-n', 'aria-hidden': 'true', text: String(j + 1)}), ' ',
      h('div', {class: 'yw-tx'}, h('b', {class: 'yw-t', text: t + ' — ' + sz(parts[j])}), ' ', h('p', {class: 'yw-s', text: SAYS[j] ?? ''}))))),
    h('p', {class: 'yw-s yw-verdict u3-verdict', text: '넷을 더한 값이 우량주 ' + (t3.pool ?? NEED) + '곳 가운데 ' + ord(me.place) + '로 커서 ' + me.place + '등이에요.'}),
    fp ? h('p', {class: 'yw-s u3-first', text: '처음 뽑힌 날은 ' + day(fp.board) + '이에요. 그날 값은 ' + won(fp.px) + '이에요. 지금까지 ' + fp.n + '번 뽑혔어요.'}) : null);
  const past = P.design && P.hold ? h('section', {class: 'yw-box u3-past', 'aria-label': '지난 기록'}, h('h2', {class: 'yw-h', text: '지난 기록'}),
    h('p', {class: 'yw-s', text: ym(P.design.from) + ' ~ ' + ym(P.design.to) + '에는 1 · 2 · 3등이 열흘 뒤 오른 때가 100번에 ' + Math.round(P.design.up10) + '번이었어요.'}),
    h('p', {class: 'yw-s', text: ym(P.hold.from) + ' ~ ' + ym(P.hold.to) + '에는 100번에 ' + Math.round(P.hold.up10) + '번이었어요.'}),
    h('p', {class: 'yw-s', text: '앞날을 맞히지 않아요. 지난 값으로 센 기록이에요.'})) : h('p', {class: 'yw-s', text: '앞날을 맞히지 않아요. 지난 값으로 센 기록이에요.'});
  const others = rank.filter(r => r?.code !== code).sort((a, z) => a.place - z.place).map(r => {
    const o = facts(r, board);
    return h('a', {class: 'su-ask u3-other', href: '#/c/' + r.code + '/t', 'data-place': String(r.place), 'data-code': String(r.code)},
      h('b', {text: r.place + '등 ' + r.name + ' ›'}), h('span', {text: '현재가 ' + won(o.px) + ' · 한 달 ' + (o.sp ? w100(o.ch) : NEED)}));
  });
  const go = h('nav', {class: 'yw-go u3-go', 'aria-label': '다음에 볼 곳'},
    h('a', {class: 'su-ask', href: '#/r/c'}, h('b', {text: '1 · 2 · 3등 달력 보기'}), h('span', {text: '날마다 뽑힌 셋을 뽑힌 날부터 따라가요.'})),
    h('a', {class: 'su-ask', href: '#/c/' + code}, h('b', {text: '이 회사 쪽 보기'}), h('span', {text: '한 달 꺾은선과 업종을 봐요.'})),
    h('a', {class: 'su-ask', href: '#/q/' + code}, h('b', {text: '사기 전에 한 번 멈춰요'}), h('span', {text: '「왜 사?」 열한 질문으로 내 이유부터 확인해요.'})));
  const hero = h('div', {class: 'su-hero yw u3', 'data-g': 'su-up3', 'data-code': code, 'data-place': String(me.place)},
    head, graph, why, past,
    others.length ? h('section', {class: 'yw-box u3-others', 'aria-label': '다른 1 · 2 · 3등'}, h('h2', {class: 'yw-h', text: '다른 ' + (others.length === 2 ? '두 곳' : others.length + '곳')}), ...others) : null,
    go);
  return {title: name + ' · 오늘의 ' + me.place + '등', tab: 0, h1: name + ', 왜 ' + me.place + '등?', proper: false, hero, body: [],
    next: {href: '#/r/c', label: '1 · 2 · 3등 달력은?'}, asOf: board, S: b?.S ?? null};
}

/** 쓰지 않을 말 · 화면 낱말 검사용 — 이 쪽이 쓰는 고정 문장 */
export const SAY_FIXED = Object.freeze(['고른 이유 넷', '가운데 줄이 보통이에요.', '꺾은선은 한 달 동안 날마다 마지막 값이에요. 옅은 줄은 한 달 전 값이에요.', '지난 기록', '앞날을 맞히지 않아요. 지난 값으로 센 기록이에요.',
  '1 · 2 · 3등 달력 보기', '날마다 뽑힌 셋을 뽑힌 날부터 따라가요.', '이 회사 쪽 보기', '한 달 꺾은선과 업종을 봐요.', '‹ 낮아요', '보통', '높아요 ›', ...SAYS]);
