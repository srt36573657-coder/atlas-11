/* ATLAS 11 · 「돈 흐름」(옛 「돈의 이동」) — 아래 탭 「돈 흐름」(#/flow · 2026-10-08 17:41 마카오 시각 「돈에 흐름과 불장을 분리한다 · 별도에 탭을하나더 만들어라」 — 그 전에는 탭 「불장」(#/) 맨 위) · 다섯 나라
   사장님 2026-10-07 21:55 「너가 이해를 잘못이해 한게 있어 뭐야 돈에 흐름이 지금 현재 뭐냐 현실적으로 지금은 거시적이잖아」
     → 22:06 「아니 내말은 어떤 업종에서 어떤 업종으로 돈에 이동이 되고 있냐 그리고 그 기간과 포모값은 어찌 되냐 이거야」
   앞 판(16:34 「ATLAS가 고른 돈 이야기」)은 기사로 고른 사슬 하나(일 → 돈 받는 곳 ⇢ 다음)였다 — 시장의 돈이 실제로 어디서 어디로 옮겨 가는지는 아니었다
   → 첫 화면 한 장(규칙 30): 기(결론) 빠지는 곳 → 들어가는 곳 / 승(기간) 언제부터 · 며칠째 / 전(포모값) 0점~100점 · 말 다섯 등급 / 결(누가) 판 쪽 · 산 쪽
   → 2026-10-08 00:12 「글이 너무 많아 · 더 과감하게 움직이는 도식화를 예술적으로」: 네 줄 글을 그림 한 장으로(규칙 32)
   → 2026-10-09 「ATLAS 업데이트 실행 프롬프트」 7: 그림은 같은 축 막대(늘어난 곳 · 줄어든 곳 1~3위 · 이름 붙인 상대 시가총액 비교 — 아래 figOf) · 처음에는 최신 결과가 멈춘 채로
   셈은 lib/atlas11/rotation.mjs(/story.json 의 rotation · 판을 쌀 때 저절로) · 이 파일은 그리기만
   「조 원」 = 업종 시가총액 몫(시장 전체가 같은 비율로 움직였을 때와 견준 차이 · 업종 73개를 더하면 0원) — 숫자와 단위는 따로 적음(다른 말에서 「조」를 큰 숫자로 펼치지 않게)
   2026-10-08 01:27 「다해 전나라」: 다섯 나라 모두 — 단위는 나라 돈(조 원 · 조 달러 · 조 위안 · 조 엔 · 조 동) · 순매매 자료가 없는 판(미국 · 중국 · 일본 · 베트남)은 결 낙관이 「빠지는 곳 포모값」(지어내지 않음)
   그림 틀은 art.js 하나(모든 화면 그림이 같이 씀 · 규칙 33 · 42) */
import {h, korDate, finite} from './util.js';
import {pic} from './story.js';
import {artStage, chgEl} from './art.js'; // 그림 한 장 공통 틀(처음에는 최신 결과 · 차례 넷 · 다시 보기 단추)
import {riseDesc} from './family.js'; // 회사 차례 = 오른 순(규칙 9)
import {barRows, axisOf, keyEl} from './charts.js'; // 같은 축 막대(2026-10-09)

const ACTOR = {foreign: '외국인', institution: '기관', individual: '개인'};
const sign = v => (v > 0 ? '+' : v < 0 ? '−' : '');
/** 억 원 → 「−14.7」 + 「조 원」(숫자 · 단위 따로) · 1조 원보다 작으면 소수 둘째 자리 */
const UNIT = {kr: '조 원', us: '조 달러', cn: '조 위안', jp: '조 엔', vn: '조 동'};
export const unitOf = r => UNIT[r?.place] ?? '조 원';
const amt = (v, u = '조 원') => [h('span', {class: 'rt-a'}, h('b', {class: 'rt-n' + (v > 0 ? ' up' : v < 0 ? ' down' : '')}, sign(v) + (Math.abs(v) / 1e4).toFixed(Math.abs(v) >= 1e4 ? 1 : 2)), h('span', {class: 'rt-u'}, u))]; // 한국어는 숫자와 「조 원」이 한 줄(「원」만 다음 줄로 떨어지지 않게)
const heatOf = s => (!finite(s) ? 'none' : s >= 80 ? '5' : s >= 60 ? '4' : s >= 40 ? '3' : s >= 20 ? '2' : '1');
const score = s => (finite(s) ? `${Math.round(s)}점` : '없음');
const sinceLine = p => `${korDate(p.start)}부터 · ${p.days}거래일${p.atLeast ? ' 넘게' : '째'}`;
/** 메달 — 금 · 은 · 동 동그라미 안 숫자(그림 메달과 같은 색 · 숫자는 CSS 로 그림) · 화면 읽기 프로그램은 「1위」(aria-label · 사전 틀 {n}위 · 73개 말)
 *  메달 숫자는 CSS(::before) — 글자로 넣으면 또렷함 검사가 「단위 없는 숫자」로 셈 · 화면 읽기는 aria-label 「1위」(숨긴 글 칸은 글씨 200% 에서 화면 밖으로 잡혀 뺌) · cls = 회사 칸 메달(rc-md · 그림 아래 이름 칸 메달 수 검사와 섞이지 않게) */
const medal = (i, cls = 'ra-md') => [h('span', {class: `${cls} ${cls}${i + 1}`, role: 'img', 'aria-label': `${i + 1}위`, 'data-n': String(i + 1)})];

/** 판 쪽 · 산 쪽 — 빠지는 곳에서 가장 많이 판 쪽 · 들어가는 곳에서 가장 많이 산 쪽(외국인 · 기관 · 개인) */
function whoMoved(r) {
  const a = r.out[0]?.who, b = r.in[0]?.who;
  const sell = a ? Object.entries(a).sort((x, y) => x[1] - y[1])[0] : null, buy = b ? Object.entries(b).sort((x, y) => y[1] - x[1])[0] : null;
  return {sell: sell && sell[1] < 0 ? {actor: ACTOR[sell[0]], v: sell[1]} : null, buy: buy && buy[1] > 0 ? {actor: ACTOR[buy[0]], v: buy[1]} : null};
}

/* ── 그림 한 장 — 2026-10-09 「ATLAS 업데이트 실행 프롬프트」 7: 「금빛 자금 이동 → 이름 붙인 상대 시가총액 비교」
   같은 축 막대: 늘어난 곳 1~3위(빨강) · 줄어든 곳 1~3위(파랑) — 값 = 시장 대비 시가총액 변화(업종 73개를 더하면 0 · 실제 투자금 유입액 아님)
   차례 넷: 늘어난 곳(현재 관측) → 줄어든 곳(기여 요인) → 반대 근거(상대 값 · 시작일은 나중에 확인한 날 · 포모값은 실험) → 다음 확인(강세 파장 · 업종 화면)
   옛 그림(청자 매병 · 금빛 물결 다섯 · 금화 · 시상대 · 가마 불 · 낙관 · 신사 · 숙녀 — 2026-10-08)은 뺌(규칙 42) · 셈은 lib/atlas11/rotation.mjs 그대로 */
function figOf(r) {
  const u = unitOf(r), ins = (r.in ?? []).slice(0, 3), outs = (r.out ?? []).slice(0, 3);
  const ax = axisOf([...ins, ...outs].map(x => x.amount));
  const row = (x, i, at) => ({id: x.id, name: x.label, href: '#/i/' + x.id, v: x.amount, txt: amt(x.amount, u), rank: `${i + 1}위`, at});
  const art = h('div', null,
    h('p', {class: 'bc-sub'}, '늘어난 곳'), barRows(ins.map((x, i) => row(x, i, 0)), {ax}),
    h('p', {class: 'bc-sub'}, '줄어든 곳'), barRows(outs.map((x, i) => row(x, i, 1)), {ax}),
    keyEl([{cls: 'up', label: '빨강 = 시장보다 시가총액 몫이 늘어난 업종'}, {cls: 'down', label: '파랑 = 줄어든 업종'}]));
  const ws = r.waves ?? [];
  const rw = ws.length ? h('ol', {class: 'rw', 'aria-label': '강세 파장'}, ...ws.map((x, i) => h('li', {class: 'rw-c' + (i === ws.length - 1 ? ' rw-now' : ''), 'data-n': String(x.n)}, h('b', {class: 'rw-k'}, `${x.n}차`), ' ', h('span', {class: 'rw-l'}, x.to.label)))) : null;
  const w = whoMoved(r), a = r.out[0], b = r.in[0];
  // 요약 한 줄(이름 · 금액)을 차트 위에(첫 화면에 숫자가 먼저 · 규칙 30) · 반대 근거 · 다음 확인 · 강세 파장은 차트 아래
  const labels = h('div', {class: 'ra-lab'}, h('p', {class: 'ra-li'}, h('span', {class: 'ra-k ra-tag'}, '늘어난 곳 1위'), h('b', null, b.label), ' ', ...amt(b.amount, u), ' · ', h('span', {class: 'ra-k ra-tag'}, '줄어든 곳 1위'), h('b', null, a.label), ' ', ...amt(a.amount, u)));
  const tail = h('div', {class: 'ra-tail'},
    h('p', {class: 'ra-li', 'data-at': '2'}, h('span', {class: 'ra-k ra-tag'}, '반대 근거'), `시장 대비 값 — 실제 투자금 유입액 아님 · 추정 시작일은 나중에 확인한 날 · 포모값 ${score(r.fomo.to)}(${r.fomo.toWord ?? '없음'} · 실험 · 검증 전)`),
    h('p', {class: 'ra-li', 'data-at': '3'}, h('span', {class: 'ra-k ra-tag'}, '확인할 것'), r.flows ? `판 쪽 ${w.sell?.actor ?? '없음'} · 산 쪽 ${w.buy?.actor ?? '없음'} · ` : '', '업종을 누르면 구성 종목'),
    rw);
  return artStage({key: 'rot', art, labels, labFirst: true, tail: [tail], steps: [{c: 0, at: 0, ms: 1300}, {c: 1, at: 1, ms: 1300}, {c: 2, at: 2, ms: 1300}, {c: 3, at: 3, ms: 1100}]});
}
/** 긴 업종 이름 — 옛 그림 이름표 글씨 줄임(지금은 쓰지 않음 · 다른 파일이 부를 수 있어 남김) */
export const longCls = t => (String(t).length > 12 ? ' ra-long2' : String(t).length > 6 ? ' ra-long' : '');

/** 돈 흐름 업종의 회사(사장님 2026-10-08 17:41 마카오 시각 「돈에 흐름에 관련된 종목들을 표기하라」) — 들어가는 곳 1위~3위 · 빠지는 곳 1위~3위 업종마다 판 자료의 그 업종 회사
 *  업종 줄: 메달 · 업종 이름(누르면 업종 화면) · 금액(그림과 같은 값) / 회사 줄: 이름(누르면 회사 화면) · 지난 20거래일 종가 변화 · 차례 = 오른 순(규칙 9 · family.js riseDesc)
 *  data-cos = [쪽, 차례, 업종, 회사 기호들] — 빠짐없이 도는 검사기가 판 자료로 따로 센 값과 맞댐(full_check · art_expect flowCos) */
export function cosOf(r, board) {
  const byCode = new Map((board?.companies ?? []).map(c => [c.code, c])), gs = new Map((board?.groups ?? []).map(g => [g.id, g]));
  const side = (key, xs) => (xs ?? []).slice(0, 3).map((x, i) => { const g = gs.get(x.id) ?? null; return {side: key, rank: i + 1, x, g, cs: (g?.codes ?? []).map(c => byCode.get(c)).filter(Boolean).sort(riseDesc)}; });
  return [...side('in', r?.in), ...side('out', r?.out)];
}
export function rotationCos(r, board) {
  const all = cosOf(r, board), u = unitOf(r);
  if (!all.length) return null;
  const coRow = c => h('li', {class: 'rc-li'}, h('a', {class: 'rc-a', href: '#/stock/' + encodeURIComponent(c.code), 'data-code': c.code}, h('span', {class: 'rc-n', 'data-ident': ''}, c.name), ' ', chgEl(c.change20, 'rc-v')));
  const grp = s => h('div', {class: 'rc-g', 'data-rank': String(s.rank), 'data-group': s.x.id},
    h('p', {class: 'rc-gh'}, ...medal(s.rank - 1, 'rc-md'), s.g ? h('a', {class: 'rc-gl', href: '#/i/' + s.x.id}, s.x.label) : h('span', {class: 'rc-gl'}, s.x.label), ' ', h('span', {class: 'rc-m'}, ...amt(s.x.amount, u))),
    s.cs.length ? h('ul', {class: 'rc-ul'}, ...s.cs.map(coRow)) : h('p', {class: 'rc-none muted'}, '회사 0곳'));
  const block = (key, head) => { const xs = all.filter(s => s.side === key); return xs.length ? h('div', {class: 'rc-side', 'data-side': key}, h('p', {class: 'rc-h'}, head), ...xs.map(grp)) : null; };
  return h('div', {class: 'rc', 'data-cos': JSON.stringify(all.map(s => [s.side, s.rank, s.x.id, s.cs.map(c => c.code)]))},
    block('in', '늘어난 곳'), block('out', '줄어든 곳'), // 들어가는 곳 먼저(12:43 「돈에 흐름이 지금 어디로 가는가」 · 12:59 「돈이 빠지는곳도」)
    h('p', {class: 'rc-k muted xs'}, '회사 = 지난 20거래일 종가 변화 · 차례 = 20거래일 변화 순'));
}

/** 맨 위 무대 — 제목 · 기간(달 위) · 그림 한 장 · 이름 · 숫자 · 낙관 · 차례 점 · 단추 둘 · 업종 회사(1위~3위 · 2026-10-08 17:41) · 아래에 빠지는 곳 · 들어가는 곳 모두 · 셈 방법(접힘) */
export function rotationBox(r, board = null) {
  if (!r || r.none || !r.pair) return null;
  const p = r.pair;
  const u = unitOf(r), li = x => h('li', {class: 'rt-li'}, h('span', {class: 'rt-l'}, x.label), h('span', {class: 'rt-v'}, ...amt(x.amount, u)), h('span', {class: 'rt-f'}, h('span', null, '포모값'), ' ', h('b', {class: 'rt-heat', 'data-heat': heatOf(x.fomo)}, score(x.fomo))));
  return h('section', {class: 'fig sy-fig rt', 'aria-label': '업종 순환', 'data-from': p.from.id, 'data-to': p.to.id, 'data-place': r.place ?? 'kr',
    'data-check': JSON.stringify({from: p.from.id, to: p.to.id, start: p.start, days: p.days, outAmt: r.out[0].amount, inAmt: r.in[0].amount, outs: (r.out ?? []).slice(0, 3).map(x => [x.id, x.amount]), ins: (r.in ?? []).slice(0, 3).map(x => [x.id, x.amount]), fomo: r.fomo.to, waves: (r.waves ?? []).map(x => [x.n, x.to.id, x.start, x.end])})}, // 빠짐없이 도는 검사기가 /story.json 과 맞댐(규칙 34 · 파장은 scripts/atlas11/verify/waves_verify.py 가 따로 셈)
    h('p', {class: 'sy-k'}, h('span', null, '업종 순환'), h('span', {class: 'sy-kw'}, `지난 ${r.window.days}거래일 · ${korDate(r.asOf)} 종가까지`)), // 이름 = 아래 탭 「돈 흐름」(규칙 2 · 2026-10-08 17:41 · 옛 「돈의 이동」)
    h('p', {class: 'ra-t'}, h('span', {class: 'ra-ts'}, `${korDate(p.start)}부터`), ' ', h('b', {class: 'ra-td'}, `${p.days}거래일${p.atLeast ? ' 넘게' : '째'}`)), // 기간(자막 띠를 빼며 그림 위로 되돌림)
    figOf(r),
    board ? rotationCos(r, board) : null,
    h('div', {class: 'rt-all'},
      h('div', {class: 'rt-col', 'data-side': 'out'}, h('p', {class: 'rt-h'}, '줄어든 곳'), h('ol', {class: 'rt-ol'}, ...r.out.map(li))),
      h('div', {class: 'rt-col', 'data-side': 'in'}, h('p', {class: 'rt-h'}, '늘어난 곳'), h('ol', {class: 'rt-ol'}, ...r.in.map(li)))),
    h('details', {class: 'rt-how'}, h('summary', null, '어떻게 셌나'),
      h('p', null, `「${u}」 = 업종 시가총액 몫 — 시장 전체가 같은 비율로 움직였을 때와 견준 차이(업종 ${r.groups}개 · 더하면 0)`),
      h('p', null, '추정 시작일 = 늘어난 곳이 줄어든 곳보다 앞서기 시작한 날(두 업종 지수 비의 마지막 바닥 · 나중에 확인한 날)'),
      h('p', null, `포모값 = 옛 ATLAS FOMO ${r.fomo.of}가지 가운데 종가로 셀 수 있는 ${r.fomo.items}가지(10일 상승률 · 상승 가속 · 상승일 비중 · 20일 평균 이격 · 60일 고점 돌파 · 상승 변동 집중)를 지난 ${r.fomo.refs}번과 견준 백분위 · 거래량 · 장중 · 개인 · 관심 ${r.fomo.of - r.fomo.items}가지는 자료가 없어 뺌`),
      r.flows ? h('p', null, `순매매 = 외국인 · 기관 · 개인이 사고판 주식 수 × 그날 종가(어림) · ${korDate(r.flows.from)}~${korDate(r.flows.to)}`) : null));
}

/** 탭 「돈 흐름」 맨 아래 「결」 — 맨 위 결론을 한 번 더(2026-10-07 20:04 「기승전결」 · 2026-10-08 17:41 탭 「불장」에서 옮김) */
export function rotationEnd(r) {
  if (!r || r.none || !r.pair) return null;
  const p = r.pair;
  return h('section', {class: 'sy-end rt-end', 'aria-label': '업종 순환'},
    h('p', {class: 'sy-end-k'}, h('span', {class: 'sy-chl', lang: 'ko', 'data-ident': '', 'aria-hidden': 'true'}, '결'), h('span', null, '업종 순환')),
    h('p', {class: 'sy-end-m', 'data-speak': ''}, pic('m:in', 'sy-ifi'), h('span', null, `${p.from.label} → ${p.to.label}`)),
    h('p', {class: 'sy-end-s'}, sinceLine(p)),
    h('p', {class: 'sy-end-s'}, h('span', null, '포모값'), ' ', h('b', null, score(r.fomo.to)), ' · ', h('span', null, r.fomo.toWord ?? '없음')));
}

/** 소리로 듣기 한 줄(화면 요약) */
export const rotationSay = r => (!r || r.none || !r.pair ? '' : `업종 순환. 줄어든 곳: ${r.pair.from.label}. 늘어난 곳: ${r.pair.to.label}. ${sinceLine(r.pair)}. 포모값 ${score(r.fomo.to)}, ${r.fomo.toWord ?? '없음'}. `);
