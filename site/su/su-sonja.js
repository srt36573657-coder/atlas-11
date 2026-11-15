/* 손자병법 첫 쪽(#/) — 빈 파일에서 새로 씀(주문 1115-1706) · 병법 서른여섯 가지만(주문 1115-1843)
   사장님 2026-11-15(마카오) 16:06 「이걸로 해서 기준을 잡고 만들어  정밀하게 순서가 맞게」 · 16:09 「응」 · 16:10 「이름도 손자 병법으로 변경해」
   · 16:32 「기존에 있던것 단 한나도 디자임 사용하지말고 완전 새로게 만들어」(원문 docs/design/sonja-ink-2026-11-15/order-1706.txt)
   · 17:43 「… 병법으로 주식해서 손실보지 않고 요즘 상황애 어떤 병벙으로 거래 해야 투자자들이 손실을 보지 않을 방법을 병법으로 풀어 내는 곳이다 … 기존애 돈모리는곳 불장 꽃은 다 삭제 하고 병법 36가지 만 표현 되개 해야 한다」 · 17:46 「응」(원문 docs/design/sonja-ink-2026-11-15/order-1843.txt)
   기준 = 샘플 사 「화제와 도장」(기준 한 장 docs/design/sonja-ink-2026-11-15/standard.md)
   차례: 머리 줄 · 표지(su-sonja-top.js — index.html 이 처음부터 듦) → 형세 보고(요즘 장을 병법의 땅으로) → 덜 잃은 꾀 차례(서른여섯 꾀 · 그 땅의 지난 기록으로 줄 세움) → 자세히(본질) → 끝 줄 → 이야기 막대 · 탭
   옛 불장 · 꽃이 될 · 돈이 몰리는 곳(지금 일곱 · 될 듯 일곱) · 조용한 힘 · 1 · 2 · 3등 · 오늘 이름이 오른 회사 · 칸 읽는 법 · 겹친 곳은 지움(17:43)
   한눈 판별 = 도장: 한 달 내림 = 짙은 남빛 찬 도장 + 흰 글 · 오름 = 옅은 먹 테 도장(빨강 없음 — 한국에서 빨강은 오름)
   보안 규칙: innerHTML 없음 · 글 속 style 없음 · 다른 주소 스크립트 없음 */
import {h, s} from '/su/su-fig.js';
import {NEED, ymd} from '/su/su-six.js';
import {NAME, josa} from '/next/brand.js';
import {essenceData, essenceLines, kstText} from '/next/essence.js';
import {hardLeft} from '/su/su-word.js'; // 풀이 없이 남은 어려운 낱말 셈(검사 · 보고가 main data-hard 를 셈 — 화면에는 안 붙임)
import {topBar, cover, stepDay, endSec as endLine, dockNav, tabNav} from '/su/su-sonja-top.js'; // 머리 줄 · 표지 = 자료 없이 먼저 칠하는 판(su.js 가 먼저 붙임 — 느린 휴대폰 첫 화면) · 끝 줄 · 이야기 막대 · 탭은 모든 쪽이 같은 판(주문 1115-2328)

export const CSS = '/su/su-sonja.css';
export const D21 = '/su/data/su21.json', D36 = '/su/data/su21-s36.json', DST = '/su/data/su21-settle.json'; // 첫 화면 자료 · 꾀 칸 자료(첫 칠함 뒤) · 정산 장부
export const LANDK = ['fall', 'shake', 'rise', 'narrow', 'calm'];
export const KN = ['', '한', '두', '세', '네', '다섯', '여섯', '일곱', '여덟', '아홉', '열']; // 잃은 몫 「열 번에 ○ 번」(lose10)
/** 첫 화면 자료(su21.json) — X.get 이 주소마다 한 번만 받음(옛 su-21.js load21 을 옮김 · 주문 1115-2328 옛 21곳 파일은 지움) */
export const load21 = get => get(D21);
/** 서른여섯 꾀 칸 수(꾀마다 앞 일곱까지) — 꾀 칸 자료가 없으면 null */
export const n36of = T => { const m = T?.s36n; if (!m || typeof m !== 'object') return null; const v = Object.values(m); return v.length === 36 && v.every(x => Number.isInteger(x) && x >= 0) ? v.reduce((a, x) => a + Math.min(7, x), 0) : null; };

export const fin = x => typeof x === 'number' && Number.isFinite(x);
export const NF = new Intl.NumberFormat('ko-KR');
export const won = v => NF.format(Math.round(v)) + '원';
export const mday = d => { const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(d ?? '')); return m ? +m[2] + '월 ' + +m[3] + '일' : null; };
export const ym = t => { const m = /^(\d{4})-(\d{2})-\d{2}$/.exec(String(t ?? '')); return m ? m[1] + '년 ' + +m[2] + '월' : null; };
export const day = d => ymd(d) ?? NEED;
export const w100 = r => (fin(r) ? (100 * (1 + r)).toFixed(1).replace(/\.0$/, '') + '원' : NEED);
/** 한 달 판별 — 꺾은선 처음(한 달 전)과 끝(그날)으로 · 값이 없으면 null */
export const monOf = sp => (!sp ? null : sp[sp.length - 1] < sp[0] ? 'dn' : sp[sp.length - 1] > sp[0] ? 'up' : 'eq');
export const MONW = {dn: '한 달 내림', up: '오름', eq: '같음'};

/* ── 작은 부품(새로 그림) ── */
/** 한 달 꺾은선(먹 선 · 한 달 전 값 점선 · 끝 점 = 내림 남빛 · 오름 먹) */
export function spark(sp, w = 96, hh = 34, cls = '') {
  const g = s('svg', {class: 'sj-sp' + (cls ? ' ' + cls : ''), viewBox: `0 0 ${w} ${hh}`, width: w, height: hh, 'aria-hidden': 'true', focusable: 'false'});
  if (!sp) return g;
  const P = 4, n = sp.length, lo = Math.min(...sp), hi = Math.max(...sp);
  const x = i => P + ((w - 2 * P) * i) / (n - 1), y = v => (hi === lo ? hh / 2 : P + (hh - 2 * P) * (1 - (v - lo) / (hi - lo)));
  const f = v => Math.round(v * 10) / 10, m = monOf(sp);
  g.append(s('path', {d: `M${P} ${f(y(sp[0]))}H${w - P}`, class: 'sj-sp0'}),
    s('path', {d: 'M' + sp.map((v, i) => f(x(i)) + ' ' + f(y(v))).join('L'), class: 'sj-sp1'}),
    s('circle', {cx: f(x(n - 1)), cy: f(y(sp[n - 1])), r: 3.6, class: 'sj-spe sj-spe-' + m}));
  return g;
}
/** 장 머리 — 위 여백의 붓 글씨 한 낱말 · 가는 세로 먹선 · 장 번호 · 제목(장마다 좌우 뒤집음) */
export const head = (bw, pno, title, flip = false, more = []) => h('div', {class: 'sj-sh' + (flip ? ' sj-flip' : '')},
  h('p', {class: 'sj-bw', 'aria-hidden': 'true', text: bw}), h('i', {class: 'sj-axis', 'aria-hidden': 'true'}),
  h('div', {class: 'sj-sht'}, h('p', {class: 'sj-pno', text: pno}), title, ...more));
export const endSeal = t => h('span', {class: 'sj-endseal', 'aria-hidden': 'true', text: t});

/* ── 자료 ── */
export const ok36 = (g, T) => !!g && g.schema === 'su21-s36-1' && Array.isArray(g.kinds) && g.kinds.length === 36 && !!g.lists && typeof g.lists === 'object' && g.asOf?.board === T?.asOf?.board
  && g.kinds.every(k => (g.lists[k] ?? []).length === T?.s36n?.[k]);
export const okSun = x => !!x && x.rule === 'sun-v1' && LANDK.includes(x.land) && Number.isInteger(x.m?.n) && x.m.n > 0 && Number.isInteger(x.m?.up) && x.m.up >= 0 && x.m.up <= x.m.n
  && typeof x.name === 'string' && typeof x.quote === 'string' && Array.isArray(x.rank) && x.rank.length === 36 && x.rank.every(r => typeof r?.k === 'string' && Number.isInteger(r.n));
export const sp36 = (g, code) => { const v = g?.line?.[code]; return v && Array.isArray(v.c) && v.c.length === 21 && v.c.every(x => fin(x) && x > 0) && fin(v.close) && v.close === v.c[20] && typeof v.date === 'string' && v.date === g?.asOf?.board ? v.c : null; };
const shakeSay = v => (!fin(v) ? null : v < 0.6 ? '평소의 절반쯤으로 잔잔해요' : v < 0.85 ? '평소보다 작아요' : v < 1.15 ? '평소와 비슷해요' : v < 1.5 ? '평소보다 커요' : '평소보다 훨씬 커요');
export const lose10 = r => { if (!r?.n) return null; if (!r.lose) return '한 번도 잃지 않았어요.'; const k = Math.round(r.lose / r.n * 10); return k ? '열 번에 ' + KN[k] + ' 번 잃었어요.' : '열 번에 한 번이 안 되게 잃었어요.'; };
export const none36 = w => (/거래량|사고판/.test(w ?? '') ? '그날 사고판 양을 받지 못해 고르지 못했어요.' : '지난 값이 모자라 고르지 못했어요.');
/* ── 1 머리 ── */
/* ── 2 표지 · 형세 보고 ── */
function sunSec(T) {
  const x = okSun(T.sun) ? T.sun : null;
  if (!x) return h('section', {class: 'sj-sec sj-sun sj-nosun', 'aria-label': '서른여섯 꾀'},
    h('h1', {class: 'sj-h1'}, h('span', {class: 'sj-h1a', text: '서른여섯 꾀'})),
    h('p', {class: 'sj-lead', text: day(T.asOf?.board) + ' 자료예요. 오늘 형세는 아직 세지 못해 꾀를 정한 차례로 놓았어요.'}));
  const m = x.m, P = (x.path ?? []).filter(k => LANDK.includes(k)).slice(-20), same = P.filter(k => k === x.land).length, upPart = m.up / m.n;
  const sh = shakeSay(m.shake), dd = mday(x.day);
  const BW = 340, BH = 30, upW = Math.round((BW - 6) * upPart);
  return h('section', {class: 'sj-sec sj-sun', 'data-land': x.land, 'aria-label': '오늘의 형세 · ' + x.name},
    h('p', {class: 'sj-k', text: '형세 보고' + (dd ? ' · ' + dd + ' 마지막 값' : '')}),
    h('div', {class: 'sj-today'},
      h('h1', {class: 'sj-h1'}, h('span', {class: 'sj-h1a', text: '지금은 '}), h('b', {class: 'sj-land', text: x.name}), h('span', {class: 'sj-h1c', text: '이에요.'})),
      h('span', {class: 'sj-seal sj-seal-big ' + (x.land === 'fall' ? 'sj-seal-dn' : 'sj-seal-up'), 'aria-hidden': 'true', text: x.name})),
    h('blockquote', {class: 'sj-q'}, h('p', {text: '「' + x.quote + '」'}), h('cite', {text: '손자병법 ' + (x.pian ?? '')})),
    h('ul', {class: 'sj-m'},
      h('li', {}, h('p', {class: 'sj-m1', text: m.n + '곳 가운데 ' + m.up + '곳이 한 달 전보다 올랐어요.'}),
        s('svg', {class: 'sj-bar', viewBox: `0 0 ${BW} ${BH}`, 'aria-hidden': 'true', focusable: 'false'},
          s('rect', {x: 1, y: 1, width: Math.max(upW, 2), height: BH - 2, class: 'sj-bar-up'}),
          s('rect', {x: upW + 5, y: 1, width: Math.max(BW - upW - 6, 2), height: BH - 2, class: 'sj-bar-dn'})),
        h('p', {class: 'sj-bl'}, h('span', {class: 'sj-blu'}, h('i', {class: 'sj-ms sj-ms-up', 'aria-hidden': 'true'}), '오른 곳 ' + m.up), h('span', {class: 'sj-bld'}, h('i', {class: 'sj-ms sj-ms-dn', 'aria-hidden': 'true'}), '나머지 ' + (m.n - m.up)))),
      h('li', {}, h('p', {class: 'sj-m2', text: '한가운데 회사는 한 달 동안 100원이 ' + w100(m.mid) + '이 됐어요.'})),
      sh ? h('li', {}, h('p', {class: 'sj-m3', text: '요즘 스무 날 하루 오르내림은 ' + sh + '.'})) : null),
    P.length ? h('div', {class: 'sj-path'},
      s('svg', {class: 'sj-strip', viewBox: `0 0 ${BW} 34`, 'aria-hidden': 'true', focusable: 'false'},
        ...P.map((k, i) => s('rect', {x: 1 + i * 17, y: 4, width: 13, height: 26, class: 'sj-day' + (k === x.land ? ' sj-same' : '') + (i === P.length - 1 ? ' sj-now' : '')}))),
      h('p', {class: 'sj-pc', text: '지난 ' + P.length + '거래일 가운데 ' + same + '날이 ' + x.name + '이었어요. 오른쪽 끝이 오늘이에요.'})) : null,
    h('p', {class: 'sj-do', 'data-say': '', text: (x.do ?? '') + ' 그래서 서른여섯 꾀를 덜 잃은 차례로 놓았어요.'}),
    x.lands && LANDK.every(k => typeof x.lands[k]?.rule === 'string') ? h('details', {class: 'sj-drawer sj-lands'},
      h('summary', {}, h('span', {class: 'sj-s1', text: '다섯 땅은 이렇게 나눠요'}), chev()),
      h('ol', {class: 'sj-ldl'}, ...LANDK.map(k => { const L = x.lands[k]; return h('li', {'data-land': k, class: 'sj-ld' + (k === x.land ? ' sj-ldnow' : '')},
        h('b', {text: L.name + (k === x.land ? ' · 지금' : '')}), h('p', {text: L.rule + (Number.isInteger(L.n) && x.hist?.days ? ' 지난 ' + x.hist.days + '거래일 가운데 ' + L.n + '날이었어요.' : '')}),
        h('p', {class: 'sj-ldq', text: '「' + L.quote + '」 손자병법 ' + L.pian})); })),
      h('p', {class: 'sj-ldp', text: '땅은 그날 마지막 값으로 가려요. 내일 땅을 맞히는 셈이 아니에요.'})) : null,
    h('p', {class: 'sj-safe', text: '지난 기록으로 본 모습이에요. 앞날을 맞히지 않고, 사고팔기를 권하지 않아요.'}),
    endSeal('형세'));
}
export const chev = () => s('svg', {class: 'sj-chev', viewBox: '0 0 24 24', 'aria-hidden': 'true', focusable: 'false'}, s('path', {d: 'M5 9l7 7 7-7'}));

/* ── 3 덜 잃은 꾀 차례(꾀 칸 자료는 첫 칠함 뒤에 받음 — 느린 휴대폰 첫 화면) ── */
function trickWait(T) {
  return n36of(T) != null ? h('section', {class: 'sj-sec sj-s36 sj-wait', 'aria-hidden': 'true', 'data-wait': ''}) : null;
}
export function rec36(r) {
  if (!r) return [];
  if (!r.n) return [h('p', {class: 'sj-tl sj-tnorec', text: '지난 기록을 세지 못했어요. 그날 사고판 양 자료가 있어야 세요.'})];
  const k = r.lose ? Math.max(1, Math.round(r.lose / r.n * 10)) : 0;
  return [h('p', {class: 'sj-dots', role: 'img', 'aria-label': '열 칸 가운데 잃은 몫 ' + k + '칸'}, ...Array.from({length: 10}, (_, i) => h('i', {class: i < k ? 'sj-dl' : 'sj-dk'}))),
    h('p', {class: 'sj-tl'}, h('b', {text: lose10(r)}), h('span', {text: ' ' + r.n + '번 가운데 ' + r.lose + '번'})),
    r.lose ? h('p', {class: 'sj-tl2', text: '잃은 주는 평균 100원이 ' + w100(r.avgLoss) + '이 됐어요. 가장 크게 잃은 주는 ' + w100(r.worst) + '이었어요.'}) : null,
    h('p', {class: 'sj-tl3', text: '모든 주를 고르면 평균 100원이 ' + w100(r.avg) + '이에요.'})];
}
export function chip(g, c, bd, ov) {
  const code = String(c.code ?? ''), name = String(c.name ?? NEED), dz = Number.isInteger(c.days) && c.days >= 1 ? c.days : null, sp = sp36(g, code), n = ov && Number.isInteger(c.n) ? c.n : null, m = monOf(sp);
  return h('li', {}, h('a', {class: 'sj-chip' + (ov ? ' sj-chip-ov' : ''), href: '#/c/' + encodeURIComponent(code), 'data-code': code, 'data-days': dz ? String(dz) : null, 'data-n': n ? String(n) : null, 'data-mon': m ?? 'na',
    'aria-label': name + (n ? ' · ' + n + '묶음' : '') + (dz ? ' · ' + dz + '일째' : '') + (sp ? ' · 한 달 전 ' + won(sp[0]) + ' · ' + (bd ? bd + ' ' : '') + '마지막 값 ' + won(sp[20]) + ' · ' + MONW[m] : '')},
    h('b', {text: name}), h('span', {class: 'sj-chipi'}, n ? h('span', {class: 'sj-chipn', text: n + '묶음'}) : null, h('span', {class: 'sj-chipd', text: dz ? dz + '일째' : ''})), sp ? spark(sp, 64, 26, 'sj-sps') : null, m ? h('i', {class: 'sj-chipm sj-chipm-' + m, 'aria-hidden': 'true', text: m === 'dn' ? '내림' : m === 'up' ? '오름' : '같음'}) : null));
}
function trickSec(g, T) {
  const sun = okSun(T.sun) ? T.sun : null, N = g.kinds.reduce((a, k) => a + Math.min(7, (g.lists[k] ?? []).length), 0), dd = mday(g?.asOf?.data) ?? mday(T.asOf?.board), bd = mday(g?.asOf?.board);
  const anySp = g.kinds.some(k => (g.lists[k] ?? []).slice(0, 7).some(c => sp36(g, String(c?.code ?? ''))));
  const S = sun && sun.rank.every(r => g.kinds.includes(r.k)) && new Set(sun.rank.map(r => r.k)).size === 36 ? sun : null;
  const order = S ? S.rank.map(r => r.k) : g.kinds, RB = S ? Object.fromEntries(S.rank.map((r, i) => [r.k, {...r, i: i + 1}])) : {};
  const one36 = k => { const L = (g.lists[k] ?? []).slice(0, 7), r = RB[k];
    return h('li', {class: 'sj-tk', 'data-k': k, 'data-n': String(L.length), 'data-rank': r ? String(r.i) : null},
      h('a', {class: 'sj-tkh', href: '#/k/' + k, 'aria-label': (r ? '차례 ' + r.i + ' · ' : '') + (g.name?.[k] ?? k) + ' · 이 꾀 자세히'}, r ? h('span', {class: 'sj-rk', text: String(r.i)}) : null,
        h('p', {class: 'sj-tn'}, h('b', {text: g.name?.[k] ?? k}), h('span', {text: ' ' + (g.han?.[k] ?? '') + ' · ' + L.length + '곳'})), h('i', {class: 'sj-tkgo', 'aria-hidden': 'true', text: '›'})), // 꾀 이름을 누르면 그 꾀 쪽(주문 1115-2328)
      ...rec36(r),
      h('p', {class: 'sj-say', text: g.say?.[k] ?? ''}),
      L.length ? h('ul', {class: 'sj-chips'}, ...L.map(c => chip(g, c, bd, false))) : h('p', {class: 'sj-tnone', text: none36(g.why?.[k])})); };
  const H = S ? S.hist : null, TOP = 7;
  return h('section', {class: 'sj-sec sj-s36', 'aria-label': (S ? '덜 잃은 꾀 차례 · ' : '') + '서른여섯 꾀 ' + N + '칸', 'data-n': String(N), 'data-order': S ? 'sun' : 'kind'},
    head('꾀', '제2장', h('h2', {class: 'sj-h2'}, h('span', {class: 'sj-brush', text: S ? '덜 잃은 꾀 차례' : '서른여섯 꾀'}), h('span', {class: 'sj-h2n', text: ' ' + N + '칸'})), true),
    S?.rankQ ? h('blockquote', {class: 'sj-q'}, h('p', {text: '「' + S.rankQ.quote + '」'}), h('cite', {text: '손자병법 ' + S.rankQ.pian})) : null,
    h('p', {class: 'sj-lead', text: '삼십육계(옛 병법에 전하는 서른여섯 가지 꾀)마다, 그날 그 꾀를 가장 닮은 일곱 곳이에요.'}),
    S && H ? h('p', {class: 'sj-rule', text: (H.all ? '지난 ' + H.days + '거래일을 모두 보고, ' : '지난 ' + H.days + '거래일 가운데 오늘처럼 ' + S.name + '이었던 ' + H.same + '날을 골라, ')
      + '꾀마다 고른 일곱 곳을 닷새 뒤 값과 견줬어요. 잃은 번이 적은 꾀가 위예요.' + (ym(H.from) && ym(H.to) ? ' 센 때는 ' + ym(H.from) + '부터 ' + ym(H.to) + '까지예요.' : '')}) : null,
    h('p', {class: 'sj-dayl', text: (dd ? dd + ' 마지막 값으로 골랐어요. ' : '') + (anySp ? '이름 옆 꺾은선은 한 달, 점선은 한 달 전 값이에요. ' : '') + '같은 회사가 여러 꾀에 들 수 있어요.' + (mday(g.daysFrom) ? ' 며칠째는 ' + mday(g.daysFrom) + ' 기록부터 셌어요.' : '')}),
    h('ol', {class: 'sj-tricks'}, ...order.slice(0, TOP).map(one36)),
    order.length > TOP ? h('details', {class: 'sj-drawer sj-tmore'}, h('summary', {}, h('span', {class: 'sj-s1', text: (S ? (TOP + 1) + '위부터 ' + order.length + '위까지 ' : '나머지 ') + '꾀 ' + (order.length - TOP) + '가지 더 보기'}), chev()),
      h('ol', {class: 'sj-tricks'}, ...order.slice(TOP).map(one36))) : null,
    h('p', {class: 'sj-safe', text: '지난 기록을 센 차례예요. 앞날을 맞히지 않고, 사고팔기를 권하지 않아요.'}),
    h('a', {class: 'sj-go', href: '#/r/t'}, h('span', {text: '서른여섯 꾀 정산 보기'}), h('i', {'aria-hidden': 'true', text: '›'})),
    endSeal('꾀'));
}

/* ── 4 자세히(눌러야 열림 — 이 쪽이 어떤 곳인지 · 본질 세 줄) ── */
function moreBox(S) {
  const lines = essenceLines(essenceData({summary: S}));
  return h('details', {class: 'sj-drawer sj-more'},
    h('summary', {}, h('span', {class: 'sj-s1', text: '자세히'}), h('span', {class: 'sj-s2', text: josa(NAME, '는') + ' 이런 곳이에요'}), chev()),
    h('div', {class: 'sj-morein'},
      h('section', {class: 'sj-mbox sj-ess', 'aria-label': NAME + ' 본질'}, h('h3', {class: 'sj-h3', text: josa(NAME, '는') + ' 이런 곳이에요'}), h('ol', {}, lines.map((t, i) => h('li', {'data-ess': String(i + 1), text: t})))),
      h('p', {class: 'sj-note', text: '꾀 차례는 그날 마지막 값과 지난 기록으로 셌어요. 앞날을 맞히는 차례가 아니에요.'})));
}

/* ── 11 끝 줄 ── */
function endSec(T, S) { return endLine(day(T.asOf?.board), S?.fetchedAt ? kstText(S.fetchedAt) : null); }

/* ── 12 이야기 막대 · 13 탭(모든 쪽이 같은 판 — su-sonja-top.js · 주문 1115-2328) ── */
/** 첫 쪽 다음 단추 — 덜 잃은 차례 맨 위 꾀(형세가 없으면 꾀 모음) */
const firstKkoe = T => (okSun(T?.sun) ? T.sun.rank[0]?.k ?? null : null);
const nextOf = T => { const k = firstKkoe(T); return {href: '#/k/' + (k ?? 'g01'), k: '2 / 5', label: k ? '맨 위 꾀는 어떤 꾀인가?' : '첫째 꾀는 어떤 꾀인가?'}; }; // 형세가 없으면 삼십육계 첫째 꾀(길 다섯 화면은 늘 그대로)

/* ── 쪽 ── */
/** 첫 쪽 — {title, dom: [머리, 본문, 이야기 막대, 탭], after()} · su.js route 가 이것만 붙임(옛 page() · afterPaint() 를 거치지 않음) */
/** 첫 쪽 본문 — shell(su-sonja-top.js sonjaShell 이 먼저 칠한 머리 줄 · 표지)이 붙어 있으면 그 main 뒤에 본문을 이어 붙임(표지를 다시 그리지 않음) */
export async function vSonja(X, shell = null) {
  const [{S}, T] = await Promise.all([X.base(), load21(X.get)]);
  if (!T) return null;
  const wait = trickWait(T);
  const dd = mday((okSun(T.sun) ? T.sun.day : null) ?? T.asOf?.board), body = [sunSec(T), wait, moreBox(S), endSec(T, S)];
  const keep = !!shell?.main?.isConnected, main = keep ? shell.main : h('main', {class: 'sj-page', 'data-page': 'sonja', 'data-wait': ''}, cover(null)); // data-wait — 꾀 칸을 채우면 뗌(검사가 기다림)
  main.setAttribute('data-board', T.asOf?.board ?? ''); main.setAttribute('data-wait', '');
  const step = main.querySelector(':scope > .sj-cover .sj-step'); if (step && dd && !step.querySelector('.sj-stepd')) step.append(stepDay(dd));
  main.append(...body);
  const hardOf = () => { const c = main.cloneNode(true); for (const e of c.querySelectorAll('svg, [aria-hidden="true"], [data-proper]')) e.remove(); const left = hardLeft(c.textContent ?? '', []); main.dataset.hard = String(left.length); main.dataset.hardWords = left.join(','); main.dataset.glossed = ''; };
  hardOf();
  const after = async () => { // 꾀 칸(su21-s36.json) — 첫 칠함 뒤에 받아 채움
    if (!wait) { main.removeAttribute('data-wait'); return; }
    const g = await X.get(D36).catch(() => null);
    if (!wait.isConnected) return;
    if (ok36(g, T)) wait.replaceWith(trickSec(g, T)); else wait.remove();
    hardOf(); main.removeAttribute('data-wait');
  };
  const dock = dockNav(1, nextOf(T)), tabs = tabNav(0, X.cur?.()?.code ?? null);
  return {title: '오늘', keep, dom: [keep ? shell.top : topBar(), main, dock, tabs], rest: [dock, tabs], after}; // keep = 먼저 칠한 판에 이어 붙임(su.js 는 rest 만 붙임)
}
