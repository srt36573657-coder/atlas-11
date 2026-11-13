/* 큐피트 정산(주문 1112-1728 · 사장님 2026-11-12 17:28 「정산 페이지를 하나 만들어 테이블 하나 더 만들어 그럼 탭이 여섯 개가 되겠지 그래가지고 말이야
   거기에 일 이 삼 등 매일 사 그담에 불 장인 것도 사고 모든 여덟 개를 종류별로 업종별로 다 사는거별로 분류 별별로」 · 17:30 「어」 — docs/design/settle-2026-11-12/order-1728.txt)
   주문 1112-2042 「자 정산을 오늘 부터 한다 그동안에 기록은 다 지운다」 — 11월 12일부터(order-2042.txt)
   주문 1113-1623(사장님 2026-11-13 16:23 「난 말이야 이렇게 세분화 할 필요 없이 큰값으로만 알고 싶어 불 장 불 장이 될 듯한 거 돈이 몰린 곳 돈이 몰릴 듯한 곳 꽃이 필 듯 …
   조용히 뭐 저기 하는 곳 이렇게 나는 큰 달 락으로 말하고 싶어」 · 16:26 「맞아」 — order-1623.txt) — 업종마다 · 회사마다 표를 뺌 · 묶음마다 큰 값만
   길 #/r/t · 아래 탭 여섯째 「정산」 · 자료 /su/data/su21-settle.json(scripts/atlas11/next/su21_settle.mjs — 여덟 묶음을 고른 날 마지막 값으로 10주씩 산 셈 · 가짜 돈)
   한 쪽: 맨 위 「지금까지」(산 돈 · 지금 · 늘었나 줄었나 — 달력과 같은 꼴) → 「묶음마다」 여덟 줄(1 · 2 · 3등 → 불장 → 불장이 될 듯 → 돈 → 돈이 몰릴 듯 → 꽃 → 꽃이 될 듯 → 조용한 힘
          — 사장님 말씀 차례 그대로 · 늘고 준 크기 차례 0) · 줄마다 이름 · 산 돈 · 늘었나 줄었나만 · 맨 아래 「모두」 = 맨 위와 같은 수
   주문 1113-2033 「특징 열하나」 표는 주문 1113-2224 로 뺌
   주문 1113-2224(사장님 2026-11-13 22:24 「11 가지로 하지 말고 36가지 유형으로 … 손자병법을 적용해서 … 정산하고 연결해봐 36 가지가 다 7가지 정산까지 다 나누게」 · 22:26 「그래」
          · 22:27 「정산표에는 수익율이 높은 순으로 나열을 내봐」 — docs/design/s36-2026-11-13/order-2224.txt)
          — 아래에 「서른여섯 꾀」 표 하나(손자병법과 함께 내려오는 삼십육계로 고른 묶음 · 일곱 곳씩 · 10주씩) · 여덟 묶음과 따로 셈
          · 이 표만 산 돈에 견줘 많이 늘어난 차례(같으면 꾀 차례 · 산 셈이 없는 꾀는 맨 아래) — 본질 「수익 순위」와 부딪히나 사장님 말씀으로 이 표만 · 줄어든 꾀도 그대로 보임
   늘어도 줄어도 같은 크기 · 같은 굵기 · 모양 + 글(색만으로 뜻 0) · 「%」 0 · 글은 textContent 로만 · 꾸밈은 클래스(보안 규칙 style-src 'self') */
import {h} from '/su/su-fig.js';
import {won, moved, r100, sumOf, resText, shapeOf} from '/su/su-book.js';

export const CSS = Object.freeze(['/su/su-book.css', '/su/su-settle.css']);
export const KIND_NAME = Object.freeze({top3: '1 · 2 · 3등', hot: '불장', bloom: '꽃이 될 곳', money: '돈이 몰리는 곳', quiet: '조용한데 힘이 모이는 곳', hotNext: '불장이 될 듯', bloomNext: '꽃이 될 듯', moneyNext: '돈이 몰릴 듯',
  // 서른여섯 꾀 쉬운 이름(주문 1113-2224 · su21_s36.py NAME 그대로 — 시험이 맞댐)
  g01: '몰래 바다 건너기', g02: '딴 데 쳐서 구하기', g03: '남의 칼 빌리기', g04: '쉬다가 치기', g05: '불난 틈 타기', g06: '동쪽 소리 서쪽 치기', g07: '없는 데서 만들기', g08: '몰래 다른 길 가기', g09: '강 건너 불 보기', g10: '웃음 속 칼', g11: '대신 쓰러지기', g12: '손에 걸린 양 끌기', g13: '풀 쳐서 뱀 놀래기', g14: '다시 살아나기', g15: '범을 산에서 끌어내기', g16: '잡으려고 놓아주기', g17: '벽돌 던져 옥 얻기', g18: '우두머리 잡기', g19: '솥 밑 장작 빼기', g20: '흐린 물 고기 잡기', g21: '허물 벗기', g22: '문 닫고 도둑 잡기', g23: '먼 데 사귀고 가까운 데 치기', g24: '길 빌려 치기', g25: '기둥 바꾸기', g26: '빗대어 꾸짖기', g27: '어리석은 척하기', g28: '지붕 올리고 사다리 치우기', g29: '나무에 꽃 달기', g30: '손님이 주인 되기', g31: '미인 꾀', g32: '빈 성 꾀', g33: '적 첩자 쓰기', g34: '제 몸 다치기', g35: '고리 잇기', g36: '달아나기'});
/** 서른여섯 꾀 이름(사자성어) · 꾀 뜻 · 고르는 법(su21_s36.py HAN · MEAN · SAY 그대로) */
export const S36_HAN = Object.freeze({g01: '만천과해', g02: '위위구조', g03: '차도살인', g04: '이일대로', g05: '진화타겁', g06: '성동격서', g07: '무중생유', g08: '암도진창', g09: '격안관화', g10: '소리장도', g11: '이대도강', g12: '순수견양', g13: '타초경사', g14: '차시환혼', g15: '조호리산', g16: '욕금고종', g17: '포전인옥', g18: '금적금왕', g19: '부저추신', g20: '혼수모어', g21: '금선탈각', g22: '관문착적', g23: '원교근공', g24: '가도벌괵', g25: '투량환주', g26: '지상매괴', g27: '가치부전', g28: '상옥추제', g29: '수상개화', g30: '반객위주', g31: '미인계', g32: '공성계', g33: '반간계', g34: '고육계', g35: '연환계', g36: '주위상'});
export const S36_MEAN = Object.freeze({
  g01: '하늘을 속이고 바다를 건너요.',
  g02: '다른 곳을 쳐서 내 편을 구해요.',
  g03: '남의 칼을 빌려 싸워요.',
  g04: '쉬면서 지친 적을 기다려요.',
  g05: '불이 난 틈을 타요.',
  g06: '동쪽에서 소리 내고 서쪽을 쳐요.',
  g07: '없는 데서 있는 것을 만들어요.',
  g08: '보이는 길을 고치는 척 몰래 다른 길로 가요.',
  g09: '강 건너에서 불을 구경해요.',
  g10: '웃음 속에 칼을 숨겨요.',
  g11: '복숭아나무 대신 오얏나무가 쓰러져요.',
  g12: '손에 걸린 양을 끌고 가요.',
  g13: '풀을 쳐서 뱀을 놀라게 해요.',
  g14: '남의 몸을 빌려 다시 살아나요.',
  g15: '범을 산에서 꾀어내요.',
  g16: '잡으려면 먼저 놓아줘요.',
  g17: '벽돌을 던져 옥을 얻어요.',
  g18: '도적을 잡으려면 우두머리를 잡아요.',
  g19: '솥 밑에서 장작을 빼요.',
  g20: '물을 흐려 고기를 잡아요.',
  g21: '매미가 허물을 벗고 떠나요.',
  g22: '문을 닫고 도둑을 잡아요.',
  g23: '먼 나라와 사귀고 가까운 나라를 쳐요.',
  g24: '길을 빌려 다른 나라를 쳐요.',
  g25: '대들보를 훔치고 기둥을 바꿔요.',
  g26: '뽕나무를 가리키며 다른 나무를 꾸짖어요.',
  g27: '어리석은 척하되 흔들리지 않아요.',
  g28: '지붕에 올려 놓고 사다리를 치워요.',
  g29: '나무에 꽃을 달아 크게 보여요.',
  g30: '손님이 주인 자리를 차지해요.',
  g31: '아름다움으로 눈길을 끌어요.',
  g32: '빈 성을 열어 두고 태연해요.',
  g33: '적의 첩자를 거꾸로 써요.',
  g34: '제 몸을 다쳐 적을 속여요.',
  g35: '꾀를 고리처럼 이어요.',
  g36: '어려우면 달아나는 것이 가장 좋아요.',
});
export const S36_SAY = Object.freeze({
  g01: '하루하루는 잔잔한데 한 달 동안 가장 꾸준히 오른 곳이에요.',
  g02: '닷새 동안 업종이 내릴 때 혼자 오른 곳이에요.',
  g03: '업종이 한 달 오를 때 업종과 가장 닮게 따라 오른 곳이에요.',
  g04: '오래 조용하다가 지난 닷새 가장 크게 힘을 낸 곳이에요.',
  g05: '한 달 안에 시장이 가장 크게 내린 날들에 오히려 오른 곳이에요.',
  g06: '어제는 내리고 오늘은 크게 오른 곳이에요.',
  g07: '두 달 동안 좁게 움직이다가 오늘 그 위로 올라선 곳이에요.',
  g08: '값은 거의 그대로인데 사고판 양이 가장 크게 늘어난 곳이에요.',
  g09: '석 달 동안 시장이 흔들려도 가장 덜 따라 움직인 곳이에요.',
  g10: '한 달로는 올랐는데 지난 닷새는 내린 곳이에요.',
  g11: '닷새 동안 업종은 버티는데 혼자 크게 내린 곳이에요.',
  g12: '스무 날 가운데 오른 날이 가장 많은 곳이에요.',
  g13: '오늘 사고판 양이 평소보다 가장 크게 늘어난 곳이에요.',
  g14: '한 해 높은 값에서 크게 빠졌다가 한 달 사이 가장 크게 살아난 곳이에요.',
  g15: '반년 평균 값보다 가장 멀리 위로 나온 곳이에요.',
  g16: '반년으로는 올랐는데 한 달은 쉬어 간 곳이에요.',
  g17: '그 앞 닷새 조금 오르고 지난 닷새 더 크게 오른 곳이에요.',
  g18: '업종마다 몸집 1등인 곳 가운데 업종이 한 달 가장 많이 오른 곳이에요.',
  g19: '석 달 동안 많이 올랐는데 요즘 사고판 양이 가장 크게 줄어든 곳이에요.',
  g20: '지난 닷새 오르내림이 가장 거칠었던 곳이에요.',
  g21: '오늘 한 해 가장 높은 값을 가장 크게 넘어선 곳이에요.',
  g22: '스무 날 동안 오르내린 폭이 가장 좁은 곳이에요.',
  g23: '석 달 동안 같은 업종보다 시장 전체와 더 닮게 움직인 곳이에요.',
  g24: '한 달 내리던 업종이 닷새 사이 돌아섰을 때 함께 크게 오른 곳이에요.',
  g25: '요즘 한 달 오르내림이 반년 평소보다 가장 크게 바뀐 곳이에요.',
  g26: '한 달 동안 업종은 크게 내렸는데 혼자 버틴 곳이에요.',
  g27: '한 해 높은 값보다 많이 낮은데 요즘 가장 잔잔한 곳이에요.',
  g28: '한 달 크게 오르고 꼭대기에서 거의 안 내려온 곳이에요.',
  g29: '사고판 양은 평소보다 적은데 지난 닷새 크게 오른 곳이에요.',
  g30: '석 달 동안 업종 몸집 1등보다 가장 많이 더 오른 곳이에요.',
  g31: '오늘 하루 가장 크게 오른 곳이에요.',
  g32: '한 달 사고판 양이 가장 적은데 값은 버틴 곳이에요.',
  g33: '석 달 동안 같은 업종과 가장 거꾸로 움직인 곳이에요.',
  g34: '오늘 하루 가장 크게 내린 곳이에요.',
  g35: '오른 날이 오늘까지 가장 길게 이어진 곳이에요.',
  g36: '한 달 동안 가장 많이 내린 곳이에요.',
});
/** 보이는 차례(주문 1113-1623 — 사장님 말씀 차례: 불장 · 불장이 될 듯 · 돈이 몰린 곳 · 돈이 몰릴 듯 · 꽃 · 꽃이 될 듯 · 조용한 힘 · 1 · 2 · 3등은 맨 위 그대로) */
export const SHOW = Object.freeze(['top3', 'hot', 'hotNext', 'money', 'moneyNext', 'bloom', 'bloomNext', 'quiet']);
/** 서른여섯 꾀 꾀 차례(삼십육계 1 ~ 36) */
export const SHOW36 = Object.freeze(Array.from({length: 36}, (_, i) => 'g' + String(i + 1).padStart(2, '0')));
/** 거래량으로 고르는 다섯(그날 사고판 양을 받지 못하면 그날은 사지 않음) */
export const BYVOL = Object.freeze(['g08', 'g13', 'g19', 'g29', 'g32']);
/** 수익률 — 산 돈에 견줘 늘고 준 몫(백만에 하나까지 · 같으면 같은 차례) */
export const rateOf = g => (g.n && g.cost > 0 ? Math.round((g.val - g.cost) / g.cost * 1e6) : null);
/** 수익률 높은 차례(주문 1113-2224 「정산표에는 수익율이 높은 순으로」) — 산 셈이 있는 꾀는 수익률 큰 차례(같으면 꾀 차례) · 산 셈이 없는 꾀는 맨 아래(꾀 차례) */
export const byRate = (K, show = SHOW36) => { const ix = k => show.indexOf(k);
  return [...K].sort((a, b) => (rateOf(a) === null) - (rateOf(b) === null) || (rateOf(b) ?? 0) - (rateOf(a) ?? 0) || ix(a.key) - ix(b.key)); };
const DAY = /^\d{4}-\d{2}-\d{2}$/;
const md = d => (DAY.test(d ?? '') ? +d.slice(5, 7) + '월 ' + +d.slice(8, 10) + '일' : '?');
const NF = new Intl.NumberFormat('ko-KR');

/** 산 셈 줄 — [날, 묶음 차례, 번호, 산 값] → {day, k, code, name, ind, buy, now, nowDay, cost, val, one}(지금 = 그 회사 가장 늦은 값 · 산 날 뒤 값이 없으면 아직 하루치) */
export function settleRows(D) {
  const q = Number.isFinite(D?.qty) ? D.qty : 10;
  return (D?.buys ?? []).map(([day, ki, code, buy]) => {
    const [now, nowDay] = D.now?.[code] ?? [buy, day], [name, ind] = D.co?.[code] ?? [code, null];
    return {day, k: D.kinds[ki], code, name: name ?? code, ind: ind ?? '업종 모름', buy, now, nowDay, cost: buy * q, val: now * q, one: !(nowDay > day)};
  });
}
/** 묶어 더함 — 열쇠마다 산 돈 · 지금 · 늘고 준 돈(sumOf) · 산 셈 수 · 고른 날 수 · 첫날 · 회사 수(나온 차례 그대로) */
export function groupBy(rows, key) {
  const m = new Map();
  for (const r of rows) { const k = key(r); if (!m.has(k)) m.set(k, []); m.get(k).push(r); }
  return [...m].map(([k, rs]) => ({key: k, rows: rs, n: rs.length, days: new Set(rs.map(r => r.day)).size, cos: new Set(rs.map(r => r.code)).size, first: rs.map(r => r.day).sort()[0], ...sumOf(rs)}));
}
/** 오늘 판 날보다 앞 날 값으로 센 회사 — 그 날(아니면 null) */
export const lateOf = (r, asOf) => (DAY.test(asOf ?? '') && DAY.test(r?.nowDay ?? '') && r.nowDay < asOf ? r.nowDay : null);
/** 맨 위 작은 한 줄 — 첫날 · 산 셈 수 · 고른 날 수 · 못 센 수 · 앞 날 값으로 센 회사 수(숨기지 않음) */
export const capText = (rows, miss = 0, late = 0) => { const first0 = rows.map(r => r.day).sort()[0] ?? null;
  return (first0 ? md(first0) + '부터 · ' : '') + '산 셈 ' + NF.format(rows.length) + '번 · 고른 날 ' + NF.format(new Set(rows.map(r => r.day)).size) + '일'
    + (miss ? ' · 값이 없어 못 센 ' + NF.format(miss) + '번' : '') + (late ? ' · 앞 날 값으로 센 회사 ' + NF.format(late) + '곳' : ''); };
const none = k => ({key: k, rows: [], n: 0, days: 0, cos: 0, first: null, ...sumOf([])});
/** 묶음마다 — 보이는 차례(SHOW) 그대로 여덟 줄(산 셈이 없는 묶음도 한 줄 · 자료에 없는 묶음은 뺌) */
export const byKind = (D, rows, show = SHOW) => show.filter(k => D.kinds.includes(k)).map(k => groupBy(rows.filter(r => r.k === k), () => k)[0] ?? none(k));
/** 여덟 · 서른여섯 나누기 — 줄 · 모두 · 못 센 수(묶음마다 따로 셈) */
export const part = (D, rows, show) => { const rs = rows.filter(r => show.includes(r.k)); return {rows: rs, T: sumOf(rs), K: byKind(D, rs, show), miss: show.reduce((a, k) => a + (Number.isFinite(D.miss?.[k]) ? D.miss[k] : 0), 0)}; };
/** 늘었나 줄었나 칸 — 산 셈이 없으면 「아직 없음」 */
const diffCell = g => h('span', {class: 'bk-ddiff', 'data-st': g.n ? g.st : 'none'}, g.n ? [shapeOf(g.st), h('span', {class: 'bk-dv', text: resText(g)})] : h('span', {class: 'bk-dv', text: '아직 없음'}));
/** 줄 하나 — 묶음 이름 · 산 돈 · 늘었나 줄었나만(주문 1113-1623 「큰값으로만」) */
const row = (g, name) => h('div', {class: 'bk-drow st-row', 'data-key': String(g.key), 'data-st': g.n ? g.st : 'none'},
  h('span', {class: 'bk-dday', text: name}), h('span', {class: 'bk-dcost', text: won(g.cost)}), diffCell(g));
/** 표 — 이름 · 머리 · 줄 · 맨 아래 모두(= 맨 위) */
function table(cls, title, head, rows, T) {
  return h('section', {class: 'bk-days st-tab ' + cls, 'aria-label': title},
    h('h2', {class: 'bk-dh', text: title}),
    h('div', {class: 'bk-dhead', 'aria-hidden': 'true'}, h('span', {class: 'bk-hd', text: head}), h('span', {class: 'bk-hc', text: '산 돈'}), h('span', {class: 'bk-hr', text: '늘었나 줄었나'})),
    h('div', {class: 'bk-drows'}, rows),
    h('div', {class: 'bk-dtot', 'data-st': T.st}, h('span', {class: 'bk-dday', text: '모두'}), h('span', {class: 'bk-dcost', text: won(T.cost)}), diffCell({...T, n: 1})));
}
function moneyCard(T, asOf) {
  return h('section', {class: 'bk-money st-money', 'aria-label': '지금까지 산 돈과 지금', 'data-st': T.st},
    h('p', {class: 'bk-mh'}, h('b', {text: '지금까지'}), h('span', {text: md(asOf) + ' 값까지'})),
    h('p', {class: 'bk-ml bk-mcost'}, h('span', {text: '산 돈'}), h('b', {text: won(T.cost)})),
    h('p', {class: 'bk-ml bk-mval'}, h('span', {text: '지금'}), h('b', {text: won(T.val)})),
    h('p', {class: 'bk-mres'}, shapeOf(T.st, 'big'), h('span', {text: T.one ? '아직 하루치예요' : moved(T.diff)})),
    T.one ? null : h('p', {class: 'bk-m100', text: '모두 합치면 ' + r100(T.val, T.cost)}));
}
function ensureCss() {
  if (typeof document === 'undefined') return;
  for (const f of CSS) if (!document.querySelector(`link[href="${f}"]`)) document.head.append(Object.assign(document.createElement('link'), {rel: 'stylesheet', href: f}));
}

export async function vSettle(X) {
  ensureCss();
  const [D, b] = await Promise.all([X.get('/su/data/su21-settle.json').catch(() => null), X.base().catch(() => ({}))]);
  if (!D || D.schema !== 'su21-settle-1' || !Array.isArray(D.buys) || !Array.isArray(D.kinds)) return X.notFound('정산 장부를 받지 못했어요. 다시 열어 주세요.');
  const all = settleRows(D), P8 = part(D, all, SHOW), P36 = part(D, all, SHOW36);
  const rows = P8.rows, T = P8.T, K = P8.K, miss = P8.miss; // 맨 위 「지금까지」 · 작은 줄 · 「묶음마다」 = 여덟(주문 1112-1728 그대로)
  const late = new Set(rows.filter(r => lateOf(r, D.asOf)).map(r => r.code)).size;
  const first36 = P36.rows.map(r => r.day).sort()[0] ?? null, has36 = D.kinds.includes('g01');
  const hero = h('div', {class: 'su-hero bk st', 'data-g': 'su-settle', 'data-n': String(rows.length), 'data-days': String(new Set(rows.map(r => r.day)).size), 'data-miss': String(miss)},
    h('p', {class: 'bk-intro', text: '큐피트가 날마다 고른 여덟 묶음을 가짜 돈으로 주식 10주씩 산 셈이에요.'}),
    D.start ? h('p', {class: 'bk-intro st-replay st-start', text: md(D.start) + '부터 센 정산이에요.'}) : null, // 주문 1112-2042 「정산을 오늘 부터 한다 그동안에 기록은 다 지운다」
    D.replayTo ? h('p', {class: 'bk-intro st-replay', text: md(D.replayTo) + '까지는 지금 고르는 법으로 지난 날을 다시 센 기록이에요.'}) : null,
    moneyCard(T, D.asOf),
    h('p', {class: 'bk-cap st-cap', text: capText(rows, miss, late)}),
    table('st-kinds', '묶음마다', '묶음', K.map(g => row(g, KIND_NAME[g.key] ?? g.key)), T),
    // 주문 1113-2224 — 서른여섯 꾀(여덟과 따로 셈 · 수익률 높은 차례 · 표 맨 아래 「모두」 = 이 표 서른여섯 줄을 더한 돈)
    has36 ? h('p', {class: 'bk-intro st-s36i', text: '아래는 손자병법과 함께 내려오는 서른여섯 가지 꾀로 고른 묶음이에요. 꾀마다 일곱 곳을 10주씩 산 셈이고, 위 여덟 묶음과 따로 셌어요.'}) : null,
    has36 ? h('p', {class: 'bk-cap st-s36c', text: first36 ? capText(P36.rows, P36.miss, 0) : '아직 산 셈이 없어요. 장이 끝난 뒤 첫 묶음을 적어요.'}) : null,
    has36 ? h('p', {class: 'bk-cap st-s36o', text: '산 돈에 견줘 가장 많이 늘어난 꾀가 맨 위예요.'}) : null,
    has36 ? table('st-s36', '서른여섯 꾀', '꾀', byRate(P36.K).map(g => row(g, KIND_NAME[g.key] ?? g.key)), P36.T) : null);
  const how = h('details', {class: 'bk-how'}, h('summary', {class: 'bk-hs'}, h('b', {text: '이렇게 셌어요'}), h('span', {text: '진짜 돈이 아니에요'})),
    h('ul', {class: 'bk-ul'}, ['여덟 묶음은 1 · 2 · 3등, 불장, 불장이 될 듯, 돈이 몰리는 곳, 돈이 몰릴 듯, 꽃이 될 곳, 꽃이 될 듯, 조용한데 힘이 모이는 곳이에요.',
      '묶음마다 고른 회사를 고른 날 마지막 값으로 ' + (D.qty ?? 10) + '주씩 산 셈이에요.', '산 돈은 산 날 값에 ' + (D.qty ?? 10) + '주를 곱한 돈이에요. 지금은 가장 늦은 마지막 값에 ' + (D.qty ?? 10) + '주를 곱해요.',
      '같은 회사가 여러 묶음이나 여러 날에 들면 그때마다 따로 산 셈이에요.', '산 뒤에는 팔지 않고 들고 있다고 쳐요.',
      D.start ? '정산은 ' + md(D.start) + '부터 셌어요. 그 전 날은 세지 않아요.' : null,
      '1 · 2 · 3등은 달력과 같은 날 · 같은 값이에요.', D.replayTo ? md(D.replayTo) + '까지 날은 지금 고르는 법으로 지난 판을 다시 센 기록이에요. 그 뒤는 그날 적은 기록이에요.' : null,
      D.from?.quiet ? (D.from.quiet !== D.start ? '조용한데 힘이 모이는 곳은 ' + md(D.from.quiet) + '부터 적었어요.' : null) : '조용한데 힘이 모이는 곳은 아직 적은 날이 없어요.',
      miss ? '그날 값을 찾지 못한 산 셈 ' + NF.format(miss) + '번은 세지 않았어요.' : null,
      late ? '오늘 판에 없는 회사 ' + NF.format(late) + '곳은 가장 늦게 찾은 날 값으로 셌어요.' : null,
      has36 ? '서른여섯 꾀는 꾀마다 그날 그 꾀를 가장 닮은 일곱 곳이에요. 꾀마다 고르는 법은 아래 「서른여섯 꾀 풀이」에 있어요.' : null,
      has36 ? BYVOL.map(k => KIND_NAME[k]).join(', ') + '는 그날 사고판 양으로 골라요. 그 양을 받지 못한 날은 그 다섯을 사지 않아요.' : null,
      has36 ? '위 여덟 묶음은 늘 같은 차례예요. 서른여섯 꾀 표만 산 돈에 견줘 많이 늘어난 차례예요.' : '묶음은 늘 같은 차례예요. 늘고 준 크기 차례가 아니에요.', '셋은 장이 끝난 뒤에 골라요. 그 값에 실제로 살 수는 없었어요.', '수수료와 세금은 빼지 않았어요.',
      '값은 네이버 증권 그날 마지막 값이에요.', '지난 기록이에요. 앞날을 맞히지 않아요.'].filter(Boolean).map(t => h('li', {text: t}))));
  // 서른여섯 꾀 풀이(주문 1113-2224) — 꾀 차례 1 ~ 36 · 꾀 이름 · 쉬운 이름 · 꾀 뜻 · 고르는 법
  const s36how = has36 ? h('details', {class: 'bk-how st-s36how'}, h('summary', {class: 'bk-hs'}, h('b', {text: '서른여섯 꾀 풀이'}), h('span', {text: '꾀마다 고르는 법'})),
    h('ol', {class: 'bk-ul st-s36ul'}, SHOW36.map(k => h('li', {'data-key': k, text: S36_HAN[k] + ', ' + KIND_NAME[k] + '. ' + S36_MEAN[k] + ' ' + S36_SAY[k]})))) : null;
  // 탭 5 = 정산(주문 1112-1728 — 이 쪽을 열면 아래 「정산」 탭이 켜짐)
  return {title: '정산', tab: 5, step: null, kick: '여덟 묶음 · 10주씩 산 셈 · 가짜 돈', h1: '정산', proper: false, hero, body: [how, s36how].filter(Boolean),
    next: {href: '#/r/c', label: '1 · 2 · 3등 달력'}, asOf: D.asOf ?? null, S: b?.S ?? null};
}
