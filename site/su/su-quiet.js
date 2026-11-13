/* 큐피트 넷째 창 — 조용한데 힘이 모이는 7곳(#/s · 주문 1111-1334)
   사장님 2026-11-11 13:34 「조용한데 에너지가 모이는 주식창을 하나더 만들어라 그래서 총 28개로 만들고 몬태카를로 소거법으로을 찾아내라
     그러면서 이것을 ㅊ 적하는 별도에 달력을 만들어라 잡스라면」 · 13:35 이해 보고 「값은 잠잠한데, 거래가 조금씩 늘어 힘이 쌓이는 회사」
   한 쪽에 생각 하나 — 「값은 잠잠한데 외국인과 기관이 들어온 곳」: 위에서 아래로 한 문장 → 걸러 온 길(365곳 → 7곳 · 소거 일곱 · 몬테카를로) → 일곱(차례 · 1 · 2 · 3등)
     → 조용한 힘 달력(#/r/s · 따로 된 장부) · 자료 su/data/su21.json lists.quiet · quiet(scripts/atlas11/next/su21.py · su21_quiet.py)
   줄마다: 등수(첫 셋) · 이름 · 한 달 폭(100원에 ○원) · 이만큼 조용하기(100번에 ○번) · 닷새 동안 외국인과 기관 · 한 달 꺾은선(같은 눈금 — 첫 값 100 · 위아래 10)
   앞날을 맞히지 않음 — 조용한 뒤에 오를지 내릴지는 모름(쪽에 그대로 씀) · 사라는 말 · 순위 자랑 0 · 글은 textContent · 꾸밈은 클래스(보안 규칙 style-src 'self') */
import {h, s} from '/su/su-fig.js';

export const CSS = '/su/su-book.css';
const fin = v => typeof v === 'number' && Number.isFinite(v);
const NF = new Intl.NumberFormat('ko-KR');
const DAY = /^\d{4}-\d{2}-\d{2}$/;
const md = d => (DAY.test(d ?? '') ? +d.slice(5, 7) + '월 ' + +d.slice(8, 10) + '일' : '?');
const one = v => Math.round(v * 10) / 10;
/** 한 달 흔들림(옛 「한 달 폭」) — 가장 낮은 값을 100원으로 칠 때 가장 높은 값까지 몇 원(「%」 없이) */
export const spanSay = sp => (fin(sp) ? '한 달 흔들림: 100원에 ' + one(sp).toLocaleString('ko-KR') + '원' : '한 달 흔들림: 확인 필요'); // 쉬운 판(주문 1112-0253) — 「폭」 → 사이트 쉬운 말 「흔들림」(첫 페이지 칸 「흔들림 4.3%」와 같은 이름)
/** 이만큼 조용하기 — 몬테카를로 10만 번 가운데 지금 폭 이하가 나온 몫을 100번에 몇 번으로 */
export const rareSay = p => (!fin(p) ? '이만큼 조용하기: 확인 필요' : p * 100 < 0.1 ? '이만큼 조용하기: 100번에 0.1번 아래' : '이만큼 조용하기: 100번에 ' + one(p * 100).toLocaleString('ko-KR') + '번');
/** 닷새 동안 외국인 · 기관 — 더한 주식 수(들어옴 · 나감) */
export const flowSay = w => {
  if (!fin(w?.f) || !fin(w?.i)) return '외국인 · 기관: 확인 필요';
  const n = w.f + w.i, d = fin(w.days) ? (w.days === 5 ? '닷새' : w.days + '거래일') : '닷새';
  return d + ' 동안 외국인 · 기관 합쳐 ' + NF.format(Math.abs(Math.round(n))) + '주 ' + (n > 0 ? '들어왔어요' : n < 0 ? '나갔어요' : '그대로예요');
};
/** 한 달 꺾은선 — 첫 값 = 100 · 위아래 10 같은 눈금(조용한 곳은 납작하게 보임) · 도형만 */
const SW = 112, SH = 56;
function line(c) {
  const l = Array.isArray(c?.c) && c.c.length >= 2 && c.c.every(v => fin(v) && v > 0) ? c.c : null;
  if (!l) return null;
  const Y = v => Math.min(SH - 4, Math.max(4, SH / 2 - (100 * v / l[0] - 100) / 10 * (SH / 2 - 6))), X = i => 6 + (SW - 12) * i / (l.length - 1);
  return s('svg', {class: 'bk-sp qt-sp', viewBox: `0 0 ${SW} ${SH}`, width: SW, height: SH, 'aria-hidden': 'true'},
    s('line', {x1: 6, x2: SW - 6, y1: SH / 2, y2: SH / 2, class: 'bk-base'}),
    s('path', {d: l.map((v, i) => (i ? 'L' : 'M') + X(i).toFixed(1) + ' ' + Y(v).toFixed(1)).join(' '), class: 'bk-line qt-line'}),
    s('circle', {cx: 6, cy: Y(l[0]).toFixed(1), r: 4, class: 'bk-buy'}), s('circle', {cx: SW - 6, cy: Y(l[l.length - 1]).toFixed(1), r: 4.5, class: 'bk-now qt-now'}));
}
/** 걸러 온 길 — 단계마다 남은 수(글은 HTML · 막대는 도형) */
function funnel(steps) {
  const top = Math.max(1, ...steps.map(x => x.n || 0));
  return h('ol', {class: 'qt-steps', 'aria-label': '걸러 온 길'}, steps.map((x, i) => h('li', {class: 'qt-step' + (i === steps.length - 1 ? ' qt-last' : ''), 'data-n': String(x.n)},
    h('span', {class: 'qt-sn', text: x.name}), h('b', {class: 'qt-sv', text: NF.format(x.n) + '곳'}),
    s('svg', {class: 'qt-bar', width: '100%', height: 8, 'aria-hidden': 'true'}, s('rect', {x: 0, y: 0, width: Math.max(2.5, 100 * (x.n || 0) / top).toFixed(1) + '%', height: 8, rx: 4, class: 'qt-barf'}))))); // 막대 길이는 % · 둥근 끝은 늘어나지 않게(viewBox 없이)
}
function ensureCss() { if (typeof document !== 'undefined' && !document.querySelector(`link[href="${CSS}"]`)) document.head.append(Object.assign(document.createElement('link'), {rel: 'stylesheet', href: CSS})); }

export async function vQuiet(X) {
  ensureCss();
  const [D, b] = await Promise.all([X.get('/su/data/su21.json').catch(() => null), X.base().catch(() => ({}))]);
  const L = D?.lists?.quiet, Q = D?.quiet;
  if (!Array.isArray(L) || !L.length || !Q) return X.notFound('조용한데 힘이 모이는 곳을 받지 못했어요. 다시 열어 주세요.');
  const T = '조용한데 힘이 모이는 ' + L.length + '곳'; // 보통 7곳(소거 일곱을 지난 곳이 일곱보다 적은 날은 그 수 그대로)
  const rows = L.map((c, j) => { const w = c.why ?? {}, pl = [1, 2, 3].includes(c.r3q) ? c.r3q : null;
    return h('li', {}, h('a', {class: 'bk-row qt-row', href: '#/c/' + c.code, 'data-code': c.code, 'data-ord': String(j + 1), 'data-place': pl ? String(pl) : ''},
      h('span', {class: 'bk-top'}, h('b', {class: 'bk-pl' + (pl ? '' : ' qt-ord'), text: pl ? pl + '등' : String(j + 1)}), h('span', {class: 'bk-nm', text: c.name}),
        w.rare === false ? h('span', {class: 'bk-tag', text: '채움'}) : null, h('i', {class: 'bk-chev', 'aria-hidden': 'true', text: '›'})),
      h('span', {class: 'qt-l1', text: spanSay(w.span20)}), h('span', {class: 'qt-l2', text: rareSay(w.p)}), h('span', {class: 'qt-l3', text: flowSay(w)}), line(c))); });
  const hero = h('div', {class: 'su-hero bk qt', 'data-g': 'su-quiet', 'data-n': String(L.length), 'data-pool': String(Q.pool ?? ''), 'data-rule': Q.rule ?? ''},
    h('p', {class: 'bk-intro', text: '값은 한 달 내내 잠잠한데, 외국인과 기관이 들어온 회사예요.'}),
    h('p', {class: 'bk-cap', text: '우량주 ' + NF.format(D.counts?.b365 ?? 365) + '곳에서 걸렀어요 · ' + md(D.asOf?.board) + ' 자료'}),
    h('ol', {class: 'bk-rows qt-rows'}, rows),
    h('p', {class: 'bk-key', text: '첫 셋이 1 · 2 · 3등이에요. 이만큼 조용하기가 가장 드문 차례예요.'}),
    h('p', {class: 'bk-key', text: '선은 한 달 값이에요. 점선은 한 달 전 값이에요. 위아래 눈금은 모두 같아요.'}),
    h('a', {class: 'qt-cal', href: '#/r/s'}, h('b', {text: '조용한 힘 달력'}), h('span', {text: '뽑힌 날부터 따라가요 ›'})),
    h('section', {class: 'qt-way', 'aria-label': '걸러 온 길'}, h('h2', {class: 'bk-bh', text: '이렇게 걸렀어요'}), funnel(Q.steps ?? [])),
    h('p', {class: 'bk-late', text: '조용한 뒤에 오를지 내릴지는 몰라요. 지난 기록만 보여 줘요.'}));
  const how = h('details', {class: 'bk-how'}, h('summary', {class: 'bk-hs'}, h('b', {text: '몬테카를로와 소거법'}), h('span', {text: '기준 일곱'})),
    h('ul', {class: 'bk-ul'}, [...(Q.crit ?? []).map(x => x.name + ' — ' + x.say),
      '몬테카를로: 회사마다 지난 ' + (Q.hist ?? 250) + '거래일 하루 값을 ' + (Q.win ?? 20) + '개씩 ' + NF.format(Q.paths ?? 100000) + '번 뽑아 한 달 길을 그렸어요.',
      '그 길들의 위아래 폭과 지금 폭을 견줬어요. 지금 폭보다 좁은 길이 드물수록 앞에 둬요.',
      '다섯 번에 한 번보다 흔한 조용함은 한 번 더 걸러 뺐어요. 일곱이 모자라면 다음 차례로 채우고 「채움」이라고 적어요.',
      '업종마다 둘까지만 넣어요. 지금 21곳과 겹치지 않아요.', '지난 기록이에요. 앞날을 맞히지 않아요.'].map(t => h('li', {text: t}))));
  // 탭 0 = 처음 쪽(주문 1114-0004 부터 탭 이름 301곳 — 지금 28곳 = 불장 · 꽃이 될 · 돈이 몰리는 · 조용한데 힘이 모이는 일곱씩 · 될 듯 21곳 · 서른여섯 꾀 252곳)
  return {title: T, tab: 0, step: null, kick: '넷째 창 · 몬테카를로 · 소거법', h1: T, proper: false, hero, body: [how],
    next: {href: '#/r/s', label: '조용한 힘 달력'}, asOf: D.asOf?.board ?? null, S: b?.S ?? null};
}
