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
import {topBar, cover, stepDay, endSec as endLine, dockNav, tabNav, meanCap, SAFE} from '/su/su-sonja-top.js';
import {MIX36, EQ36, NAME as KNAME, MEAN as KMEAN} from '/su/su-sonja-36.js'; // 여섯 식 · 꾀마다 섞은 식(주문 1116-2134 — 꾀 쪽 「이렇게 점수를 매겨요」)
import {mktNow, mktWords, kst} from '/su/su-mkt.js'; // 지금 시장 한 줄(주문 1125-1359)
import {stance3, STANCES, won100} from '/su/su-stance.js'; // 세 태세(주문 1120-0728 — 수비 · 보편 · 공격 · 지난 같은 땅 기록으로만)
import {MIND10, MIND_TITLE, MIND_RULE} from '/su/su-mind-core.js'; // 손자병법 주식 격언 열 가지(주문 1120-2116 — 사장님 2026-10-16 글 그대로)
import {PIC, PM} from '/su/su-sonja-mean.js'; // 그림 뜻 한 줄(주문 1116-1313 — 그림마다 맨 위)
import {landPic, kkoePic, arrowsPic, sonmuPic, brushBar, coverFilm} from '/su/su-sonja-ink.js'; // 먹그림(주문 1116-0118 — 글로 풀던 것을 옛 그림으로 · 한 사람 손무의 이야기) // 머리 줄 · 표지 = 자료 없이 먼저 칠하는 판(su.js 가 먼저 붙임 — 느린 휴대폰 첫 화면) · 끝 줄 · 이야기 막대 · 탭은 모든 쪽이 같은 판(주문 1115-2328)

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
const shakeSay = v => (!fin(v) ? null : v < 0.6 ? '평소의 절반쯤으로 작아요' : v < 0.85 ? '평소보다 작아요' : v < 1.15 ? '평소와 비슷해요' : v < 1.5 ? '평소보다 커요' : '평소보다 훨씬 커요');
export const lose10 = r => { if (!r?.n) return null; if (!r.lose) return '한 번도 잃지 않았어요.'; const k = Math.round(r.lose / r.n * 10); return k ? '열 번 가운데 ' + KN[k] + ' 번 잃었어요.' : '잃은 때가 열 번에 한 번도 안 돼요.'; };
export const none36 = w => (/거래량|사고판/.test(w ?? '') ? '그날 사고판 양 자료가 없어서 고르지 못했어요.' : /꾀 뜻/.test(w ?? '') ? NONE36 : '지난 값 자료가 모자라서 고르지 못했어요.');
/** 세 거름을 다 지난 곳이 없는 꾀(주문 1116-1539 — 모자라면 모자란 대로 · 다른 곳으로 채우지 않음) */
export const NONE36 = '오늘은 이 꾀에 맞는 회사가 없어요. 억지로 다른 회사를 채우지 않았어요.';
/* ── 세 거름(주문 1116-1539 · 사장님 2026-11-16(마카오) 14:39 「몬테카를로 … 10번 돌리고 코로 10번 돌리고 … 일곱 가지를 필터링 … 말이 같아야 될 거 아니야」) ──
   꾀마다 소거 열 가지 · 꾀 뜻 · 흉내 내 보기(값을 섞어 200번씩 10번)를 모두 지난 곳만 · 걸러진 수 = 자료 funnel(su21_s36.py lists36 full) */
export const PICK36 = 's36-v3'; // 주문 1116-2134 — 세 거름은 그대로 · 차례는 꾀 점수(수학 식 + 정서 식)
export const fun36 = (g, k) => { const f = g?.funnel?.[k], L = g?.lists?.[k];
  return g?.pick?.rule === PICK36 && f && ['n', 'cut', 'mean', 'mc', 'all', 'k'].every(x => Number.isInteger(f[x]) && f[x] >= 0) && f.all <= Math.min(f.cut, f.mean, f.mc)
    && Math.max(f.cut, f.mean, f.mc) <= f.n && f.k === Math.min(7, f.all) && Array.isArray(L) && L.length === f.k ? f : null; };
export const LEAD36 = g => '삼십육계는 옛날부터 전해 오는 꾀 서른여섯 가지예요. ' + (g?.pick?.rule === PICK36 ? '꾀마다 회사를 세 번 거른 뒤, 점수가 높은 회사를 일곱 곳까지 골랐어요.' : '꾀마다 그날 그 꾀를 가장 닮은 회사를 일곱 곳 골랐어요.');
export const funW = f => [['열 가지 기준을 통과한 회사', f.cut], ['꾀의 뜻에 맞는 회사', f.mean], ['우연으로 보기 어려운 회사', f.mc], ['세 가지를 모두 통과한 회사', f.all]];
export const funK = f => (!f.all ? '세 가지를 모두 통과한 회사가 없어서, 오늘은 고르지 않았어요.' : f.all > 7 ? '그 가운데 점수가 높은 7곳을 골랐어요.' : '통과한 ' + f.all + '곳을 모두 골랐어요.');
/** 꾀 하나의 걸러진 수(고르는 법 칸 · 꾀 쪽) — 자료가 맞지 않으면 그리지 않음 */
export function funnel36(g, k) {
  const f = fun36(g, k); if (!f) return null;
  return h('div', {class: 'sj-fun', 'data-k': k},
    h('p', {class: 'sj-funl', text: '큰 회사 ' + f.n + '곳을 세 번 걸렀어요.'}),
    h('ol', {class: 'sj-funs'}, ...funW(f).map(([t, n], i) => h('li', {class: i === 3 ? 'sj-funall' : null}, h('span', {text: t}), h('b', {text: n + '곳'})))),
    h('p', {class: 'sj-funk', text: funK(f)}));
}
/** 세 거름 풀이(꾀 차례 센 법 칸) — 소거 열 가지 이름 · 꾀 뜻 · 흉내 내 보기 · 채우지 않음 */
export function pickHow(g) {
  const P = g?.pick; if (P?.rule !== PICK36 || !Array.isArray(P.cut) || !P.cut.length || !Number.isInteger(P.runs) || !Number.isInteger(P.paths)) return [];
  return [h('p', {class: 'sj-pick'}, h('b', {text: '첫째, ' + (KN[P.cut.length] ? KN[P.cut.length] + ' 가지' : P.cut.length + '가지') + ' 기준'}), h('span', {text: ' — 이런 회사만 남겨요.'})),
    h('ul', {class: 'sj-pickcut'}, ...P.cut.map(t => h('li', {text: t}))),
    h('p', {class: 'sj-pick'}, h('b', {text: '둘째, 꾀의 뜻'}), h('span', {text: ' — 「고르는 법」에 적힌 모습과 맞아야 해요.'})),
    h('p', {class: 'sj-pick'}, h('b', {text: '셋째, 우연인지 따져 보기'}), h('span', {text: ' — 지난 값을 뒤섞어 ' + P.paths + '번씩 ' + P.runs + '번 다시 해 봐요. 우연으로 보기 어려운 회사만 남겨요.'})),
    h('p', {class: 'sj-pick'}, h('b', {text: '넷째, 점수'}), h('span', {text: ' — 꾀마다 수학 식과 정서 식을 똑같이 중요하게 더해요. 점수가 높은 회사부터 일곱 곳까지 골라요.'})),
    h('p', {class: 'sj-pick sj-picknone', text: '세 가지를 모두 통과한 회사가 일곱 곳보다 적으면, 적은 대로 둬요. 다른 회사로 채우지 않아요.'})];
}
/* ── 꾀 점수 풀이(주문 1116-2134 · 사장님 2026-11-16(마카오) 20:34 「이 방정식을 36걔 병법에 올려라 각 방에 맞게 그리고 앚 쉽게 설명 하라 이헎개 해서 찾아낸 종목이라고 하라」) ──
   꾀 쪽 「주식에서는 이렇게 골라요」 칸 — 이 꾀가 섞은 식(수학 식 · 정서 식)마다 「큰 곳 / 작은 곳」 쉬운 한 줄 · 같은 무게로 더한 점수 · 「이렇게 해서 찾아낸 회사」
   식과 글 = su-sonja-36.js MIX36 · EQ36(su21_s36.py 그대로) · 검사 check_su ㉕ 나) · ㉘ 가 따로 셈 */
export const EQF = Object.freeze({수학: '수학 식 — 값이 움직인 모습', 정서: '정서 식 — 사람 마음이 남긴 흔적'});
export const eqRows = k => (Array.isArray(MIX36[k]) ? MIX36[k] : []).filter(([e, d]) => Array.isArray(EQ36[e]) && (d === 1 || d === -1)).map(([e, d]) => ({e, d, f: EQ36[e][0], six: EQ36[e][1], t: d > 0 ? EQ36[e][3] : EQ36[e][4]}));
export const eqSum = n => '이 ' + (KN[n] ?? String(n)) + ' 식을 똑같이 중요하게 더해 점수를 내요. 걸러서 남은 회사 가운데 점수가 높은 회사부터 골라요.';
export const EQEND = '이렇게 찾아낸 회사는 아래 제3장에 있어요.';
export function eqBox(k) {
  const R = eqRows(k); if (!R.length || !R.some(r => r.f === '수학') || !R.some(r => r.f === '정서')) return null;
  const fam = f => { const rs = R.filter(r => r.f === f);
    return [h('p', {class: 'sj-eqf', text: EQF[f]}), h('ul', {class: 'sj-eqs', 'data-f': f}, ...rs.map(r => h('li', {'data-e': r.e, 'data-d': String(r.d)}, h('span', {class: 'sj-eqt', text: r.six}), h('span', {class: 'sj-eqw', text: r.t}))))]; };
  return h('div', {class: 'sj-eq', 'data-k': k},
    h('p', {class: 'sj-eqh', text: '이렇게 점수를 매겨요'}),
    ...fam('수학'), ...fam('정서'),
    h('p', {class: 'sj-eqk', text: eqSum(R.length)}),
    h('p', {class: 'sj-eqend', text: EQEND}));
}
/* ── 1 머리 ── */
/* ── 지금 시장(주문 1118-1239 · 사장님 2026-11-18(마카오) 12:39 「코스닥 지수 · 코스피 지수 · 외국인 수급 … 첫 화면에 보이게 … 하루에 세 번 … 아침 10시 · 오후 두시 · 장이 끝나고 6시 …
   그때 상황에 맞게끔 우리 손자병법이 어떤 지략으로 이 시장을 상대해야 되는 것인가 … 반응형」 · 12:48 「응」 — docs/design/su-now-2026-11-18/order-1239.txt)
   지수 둘 · 외국인이 사고판 돈(시장 전체 · 억 원) · 받은 때(한국 시각) · 장이 열려 있으면 굳지 않은 값 · 그때 땅에서 지난 기록으로 덜 잃은 꾀 하나(꾀 셋의 맨 앞 · 없으면 덜 잃은 차례 맨 위)
   앞날을 맞히지 않고 사고팔기를 권하지 않음 ── */
export const NOWIX = Object.freeze({KOSPI: '코스피', KOSDAQ: '코스닥'});
export const okNow = n => !!n && typeof n.day === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(n.day) && typeof n.hm === 'string' && /^\d{2}:\d{2}$/.test(n.hm) && !!n.index && Object.keys(NOWIX).some(s => fin(n.index[s]?.price) && n.index[s].price > 0);
export const hmWords = hm => { const H = +hm.slice(0, 2), M = +hm.slice(3, 5); return (H < 12 ? '오전 ' : '오후 ') + (H % 12 === 0 ? 12 : H % 12) + '시' + (M ? ' ' + M + '분' : ''); };
const IXF = new Intl.NumberFormat('ko-KR', {minimumFractionDigits: 2, maximumFractionDigits: 2});
export const ixMove = v => !fin(v.change) ? '' : v.change > 0 ? '어제보다 ' + IXF.format(v.change) + ' 올랐어요.' : v.change < 0 ? '어제보다 ' + IXF.format(-v.change) + ' 내렸어요.' : '어제와 같아요.';
export const flowSay = (who, s, v) => !fin(v) ? null : who + '은 ' + NOWIX[s] + '에서 ' + (v === 0 ? '산 돈과 판 돈이 같았어요.' : NF.format(Math.abs(Math.round(v))) + '억 원어치를 더 ' + (v > 0 ? '샀어요.' : '팔았어요.'));
export const nowPick = x => { const w = (x?.win3?.ks ?? []).filter(k => typeof KNAME[k] === 'string'), r = (x?.rank ?? []).map(q => q.k).filter(k => typeof KNAME[k] === 'string');
  return w.length ? {k: w[0], win: true} : r.length ? {k: r[0], win: false} : null; };
export function nowBox(T, x) {
  const n = T?.now; if (!okNow(n)) return null;
  const pk = nowPick(x), F = n.flows ?? {}, ks = Object.keys(NOWIX).filter(s => fin(n.index[s]?.price) && n.index[s].price > 0), fs = Object.keys(NOWIX).filter(s => fin(F[s]?.foreign));
  const when = mday(n.day) + ' ' + hmWords(n.hm);
  return h('div', {class: 'sj-now', 'data-open': n.open ? '1' : '0', 'data-prov': n.prov ? '1' : '0', 'data-k': pk?.k ?? null},
    h('p', {class: 'sj-nowk', text: '지금 시장 · 한국 시간 ' + when}),
    n.open ? h('p', {class: 'sj-nowo', text: '장이 열려 있을 때 받은 값이에요. 아직 바뀔 수 있어요.'}) : null,
    h('ul', {class: 'sj-nowi'}, ...ks.map(s => { const v = n.index[s]; return h('li', {'data-ix': s},
      h('b', {class: 'sj-nowx', text: NOWIX[s]}), h('span', {class: 'sj-nowv', text: IXF.format(v.price)}),
      h('span', {class: 'sj-nowc', 'data-dir': fin(v.change) ? (v.change > 0 ? 'up' : v.change < 0 ? 'dn' : 'eq') : 'na', text: v.today === false ? mday(v.date) + ' 마지막 값이에요.' : ixMove(v)})); })),
    fs.length ? h('ul', {class: 'sj-nowf'}, ...fs.map(s => h('li', {'data-ix': s}, h('p', {text: (F[s].today === false ? mday(F[s].date) + ' 하루 동안 ' : '') + flowSay('외국인', s, F[s].foreign)})))) : h('p', {class: 'sj-nowf0', text: '외국인이 사고판 돈은 아직 받지 못했어요.'}),
    fs.some(s => fin(F[s].inst) || fin(F[s].indiv)) ? h('details', {class: 'sj-drawer sj-nowd'}, h('summary', {}, h('span', {class: 'sj-s1', text: '기관과 개인도 보기'}), chev()),
      h('ul', {class: 'sj-nowd2'}, ...fs.flatMap(s => [flowSay('기관', s, F[s].inst), flowSay('개인', s, F[s].indiv)].filter(Boolean).map(t2 => h('li', {}, h('p', {text: t2})))))) : null,
    pk ? h('a', {class: 'sj-nowp', href: '#/k/' + pk.k, 'data-win': pk.win ? '1' : '0'},
      h('span', {class: 'sj-nowp1', text: '지금은 이 꾀로 시장을 살펴봐요'}),
      h('b', {class: 'sj-nowp2', text: KNAME[pk.k]}),
      typeof KMEAN[pk.k] === 'string' ? h('span', {class: 'sj-nowp3', text: KMEAN[pk.k]}) : null,
      h('span', {class: 'sj-nowp4', text: pk.win ? '예전에 지금처럼 ' + x.name + '이었을 때, 아무 회사나 고른 것보다 덜 잃은 꾀예요.' : '예전에 지금처럼 ' + x.name + '이었을 때, 돈을 가장 덜 잃은 꾀예요.'})) : null,
    h('p', {class: 'sj-nows', text: '장이 열리는 날 오전 9시부터 오후 3시까지 한 시간마다, 하루 일곱 번 새로 봐요. 앞날을 맞히지 않고, 사고팔기를 권하지 않아요.'}));
}
/* ── 어제와 오늘(주문 1119-1151 · 사장님 2026-11-19(마카오) 11:51 「어제의 주식상황은 이랬고 오늘의 주식상황은 이렇게 변화가 있다 … 어제는 이런 병법으로 대처를 했고
   오늘은 이런 병법이어야 한다는 식의 구조를 첫페이지에 … 잡스라면」 — docs/design/sonja-yday-2026-11-19/order-1151.txt)
   한 가지만 크게 — 어제 시장 모습과 그때 꾀 → 오늘 시장 모습과 지금 꾀 · 어제 꾀는 날마다 적은 기록(그날 첫 쪽 그대로)이 있으면 그것 · 없으면 같은 법으로 다시 센 것 ── */
export function ydOf(T, x) {
  const now = nowPick(x), rows = Array.isArray(T?.sunLog?.rows) ? T.sunLog.rows : [], ok = (l, k) => LANDK.includes(l) && typeof KNAME[k] === 'string';
  const r = rows.filter(q => typeof q?.day === 'string' && typeof x?.day === 'string' && q.day < x.day && ok(q.land, q.k)).at(-1), pv = x?.prev;
  const y = r ? {day: r.day, land: r.land, k: r.k, rec: true} : pv && typeof pv.day === 'string' && ok(pv.land, pv.pick) ? {day: pv.day, land: pv.land, k: pv.pick, rec: false} : null;
  return now && y ? {y, t: {day: x.day, land: x.land, k: now.k}} : null;
}
function ydBox(T, x) {
  const Y = ydOf(T, x); if (!Y) return null;
  const nm = L => x.lands?.[L]?.name ?? (L === x.land ? x.name : '그 시장'), same = Y.y.land === Y.t.land, keep = Y.y.k === Y.t.k, now = x.prov ? '지금' : '오늘';
  const col = (who, d, cls) => h('div', {class: 'sj-ydc ' + cls, 'data-land': d.land}, h('p', {class: 'sj-ydd'}, h('b', {text: who}), h('span', {text: mday(d.day)})),
    h('b', {class: 'sj-ydl', text: nm(d.land)}), h('p', {class: 'sj-ydk'}, h('span', {text: '꾀 '}), h('b', {text: '「' + KNAME[d.k] + '」'})));
  return h('div', {class: 'sj-yd', 'data-same': same ? '1' : '0', 'data-keep': keep ? '1' : '0', 'data-rec': Y.y.rec ? '1' : '0', 'data-y': Y.y.day},
    h('p', {class: 'sj-ydh', text: '어제와 ' + now}),
    h('div', {class: 'sj-ydg'}, col('어제', Y.y, 'sj-ydy'), h('i', {class: 'sj-yda', 'aria-hidden': 'true', text: '→'}), col(now, Y.t, 'sj-ydt0')),
    h('p', {class: 'sj-ydt', 'data-say': '', text: same ? '어제와 같은 ' + nm(Y.t.land) + '이에요.' : '어제는 ' + nm(Y.y.land) + '이었어요. ' + now + '은 ' + nm(Y.t.land) + '이에요.'}),
    h('p', {class: 'sj-ydt2', 'data-say': '', text: keep ? '그래서 ' + now + '도 「' + KNAME[Y.t.k] + '」 꾀로 살펴봐요.' : '어제는 「' + KNAME[Y.y.k] + '」 꾀로 살펴봤어요. ' + now + '은 「' + KNAME[Y.t.k] + '」 꾀로 살펴봐요.'}),
    h('p', {class: 'sj-ydn', text: (Y.y.rec ? '어제 꾀는 어제 첫 쪽 기록 그대로예요. ' : '어제 꾀는 같은 법으로 다시 센 것이에요. ') + '꾀는 예전에 그런 시장에서 돈을 덜 잃은 것부터 골랐어요.'}));
}
/* ── 2 표지 · 형세 보고 ── */
function sunSec(T) {
  const x = okSun(T.sun) ? T.sun : null;
  if (!x) return h('section', {class: 'sj-sec sj-sun sj-nosun', 'aria-label': '서른여섯 꾀'},
    h('h1', {class: 'sj-h1'}, h('span', {class: 'sj-h1a', text: '서른여섯 꾀'})),
    h('p', {class: 'sj-lead', text: day(T.asOf?.board) + ' 자료예요. 오늘 시장 모습은 아직 세지 못했어요. 그래서 꾀를 원래 차례대로 놓았어요.'}));
  const m = x.m, P = (x.path ?? []).filter(k => LANDK.includes(k)).slice(-20), same = P.filter(k => k === x.land).length, upPart = m.up / m.n;
  const sh = shakeSay(m.shake), dd = mday(x.day);
  const up10 = Math.round(10 * upPart); // 깃발 열 가운데 선 깃발 = 오른 몫(열에 몇)
  return h('section', {class: 'sj-sec sj-sun', 'data-land': x.land, 'aria-label': '오늘 시장 · ' + x.name},
    h('p', {class: 'sj-k', text: '제1장 시장을 살피다' + (x.prov && okNow(T.now) && T.now.day === x.day ? ' · ' + mday(T.now.day) + ' ' + hmWords(T.now.hm) + ' 값' : dd ? ' · ' + dd + ' 마지막 값' : '')}), // 장중이면 그때 값(주문 1118-1239)
    h('div', {class: 'sj-today'},
      h('h1', {class: 'sj-h1'}, h('span', {class: 'sj-h1a', text: '지금은 '}), h('b', {class: 'sj-land', text: x.name}), h('span', {class: 'sj-h1c', text: '이에요.'})),
      h('span', {class: 'sj-seal sj-seal-big ' + (x.land === 'fall' ? 'sj-seal-dn' : 'sj-seal-up'), 'aria-hidden': 'true', text: x.name})),
    nowBox(T, x), // 지금 시장(주문 1118-1239) — 지수 둘 · 외국인 · 지금 볼 꾀 하나
    ydBox(T, x), // 어제와 오늘(주문 1119-1151) — 어제 시장 · 꾀 → 오늘 시장 · 꾀
    h('figure', {class: 'sj-ink sj-landfig'}, meanCap(PM.land, 'figcaption'), landPic({land: x.land, name: x.name, up: up10, path: P, sameName: x.name, title: false})), // 손무가 언덕에서 오늘 땅을 내려다봄 · 깃발 열 · 디딤돌 스물
    h('blockquote', {class: 'sj-q'}, h('p', {text: '「' + x.quote + '」'}), h('cite', {text: '손자병법 ' + (x.pian ?? '')})),
    h('div', {class: 'sj-says'}, meanCap(PM.sonmu), h('span', {class: 'sj-saysp', 'aria-hidden': 'true'}, sonmuPic({w: 84, h: 100})), // 손무가 들려주는 한 줄
      h('p', {class: 'sj-do', 'data-say': '', text: (x.do ?? '') + ' 아래 꾀는 예전에 이런 시장에서 돈을 덜 잃은 것부터 놓았어요.'})),
    h('details', {class: 'sj-drawer sj-nums'}, h('summary', {}, h('span', {class: 'sj-s1', text: '그림 속 숫자 자세히'}), chev()),
      h('ul', {class: 'sj-m'},
        h('li', {}, h('p', {class: 'sj-m1', text: '큰 회사 ' + m.n + '곳 가운데 ' + m.up + '곳이 한 달 전보다 올랐어요.'})),
        h('li', {}, h('p', {class: 'sj-m2', text: '회사들을 한 달 동안 오른 만큼 줄 세웠어요. 한가운데 회사는 100원이 ' + w100(m.mid) + '이 됐어요.'})),
        sh ? h('li', {}, h('p', {class: 'sj-m3', text: '요즘 스무 날 동안 하루하루 오르내린 폭은 ' + sh + '.'})) : null),
      P.length ? h('p', {class: 'sj-pc', text: '장이 열린 지난 ' + P.length + '일 가운데 ' + same + '일이 ' + x.name + '이었어요. 그림 오른쪽 끝 돌이 오늘이에요.'}) : null),
    x.lands && LANDK.every(k => typeof x.lands[k]?.rule === 'string') ? h('details', {class: 'sj-drawer sj-lands'},
      h('summary', {}, h('span', {class: 'sj-s1', text: '시장 모습은 이렇게 다섯 가지로 나눠요'}), chev()),
      h('ol', {class: 'sj-ldl'}, ...LANDK.map(k => { const L = x.lands[k]; return h('li', {'data-land': k, class: 'sj-ld' + (k === x.land ? ' sj-ldnow' : '')},
        h('b', {text: L.name + (k === x.land ? ' · 지금' : '')}), h('p', {text: L.rule + (Number.isInteger(L.n) && x.hist?.days ? ' 장이 열린 지난 ' + x.hist.days + '일 가운데 ' + L.n + '일이 그랬어요.' : '')}),
        h('p', {class: 'sj-ldq', text: '「' + L.quote + '」 손자병법 ' + L.pian})); })),
      h('p', {class: 'sj-ldp', text: x.prov ? '장이 열려 있을 때는 그때 값으로 나눠요. 장이 끝나면 마지막 값으로 다시 나눠요. 내일 시장을 맞히는 것이 아니에요.' : '시장 모습은 그날 마지막 값으로 나눠요. 내일 시장을 맞히는 것이 아니에요.'})) : null,
    h('p', {class: 'sj-safe', text: '지난 기록으로 본 모습이에요. 앞날을 맞히지 않고, 사고팔기를 권하지 않아요.'}),
    endSeal('시장'));
}
export const chev = () => s('svg', {class: 'sj-chev', viewBox: '0 0 24 24', 'aria-hidden': 'true', focusable: 'false'}, s('path', {d: 'M5 9l7 7 7-7'}));
// 긴 줄 접기(주문 1127-1714 · 일꾼 100명 머스크 정리 — 「위 일곱 펼침 · 나머지 서랍」 한 틀) — 줄은 한 목록 그대로 · 위 몇 줄만 보이고 나머지는 「더 보기」 한 번
export const FOLD7 = 7;
let f7n = 0; // 쪽마다 이 셈으로 단추와 줄을 잇는 이름(sj-f7-1 …)
export function fold7(ol, say, open = FOLD7) {
  const n = ol.children.length; if (n <= open) return [ol, null];
  ol.setAttribute('data-fold', String(open)); if (!ol.id) ol.id = 'sj-f7-' + (++f7n);
  const b = h('button', {class: 'sj-f7b', type: 'button', 'aria-expanded': 'false', 'aria-controls': ol.id, 'data-n': String(n - open), text: say(open, n)});
  b.addEventListener('click', () => { const on = !ol.hasAttribute('data-open'); ol.toggleAttribute('data-open', on); b.setAttribute('aria-expanded', String(on)); b.textContent = on ? '다시 접기' : say(open, n); });
  return [ol, b];
}

/* ── 3 덜 잃은 꾀 차례(꾀 칸 자료는 첫 칠함 뒤에 받음 — 느린 휴대폰 첫 화면) ── */
function trickWait(T) {
  return n36of(T) != null ? h('section', {class: 'sj-sec sj-s36 sj-wait', 'aria-hidden': 'true', 'data-wait': ''}) : null;
}
export function rec36(r, more = false) {
  if (!r) return [];
  if (!r.n) return [h('p', {class: 'sj-tl sj-tnorec', text: '사고판 양 자료가 없어서, 지난 기록을 세지 못했어요.'})];
  const k = r.lose ? Math.max(1, Math.round(r.lose / r.n * 10)) : 0;
  return [h('figure', {class: 'sj-ink sj-arw'}, meanCap(PM.arrows, 'figcaption'), arrowsPic(k)), // 화살 열 가운데 꺾인 화살 = 잃은 몫(옛 점 열 칸 대신) · 맨 위 그림 뜻(주문 1116-1313)
    h('p', {class: 'sj-tl'}, h('b', {text: lose10(r)}), h('span', {text: ' ' + r.n + '번 가운데 ' + r.lose + '번이에요.'})),
    more ? h('details', {class: 'sj-drawer sj-recmore'}, h('summary', {}, h('span', {class: 'sj-s1', text: '잃은 때 자세히'}), chev()),
      r.lose ? h('p', {class: 'sj-tl2', text: '잃은 때는 평균 100원이 ' + w100(r.avgLoss) + '이 됐어요. 가장 크게 잃은 때는 ' + w100(r.worst) + '이 됐어요.'}) : null,
      h('p', {class: 'sj-tl3', text: '모두 합치면 100원이 평균 ' + w100(r.avg) + '이 됐어요.'})) : null];
}
/** 꾀 그림 단추(누르면 그 꾀 쪽 · 소리 읽기는 꾀 이름 줄이 맡음 — 그림 단추는 건너뜀) */
export const kkoeTile = (k, name, cls = 'sj-tkpic', w = 200, hh = 150) => h('a', {class: cls, href: '#/k/' + k, tabindex: '-1', 'aria-hidden': 'true'}, kkoePic(k, {w, h: hh, label: name + ' 그림', rich: false}));
export function chip(g, c, bd, ov) {
  const code = String(c.code ?? ''), name = String(c.name ?? NEED), dz = Number.isInteger(c.days) && c.days >= 1 ? c.days : null, sp = sp36(g, code), n = ov && Number.isInteger(c.n) ? c.n : null, m = monOf(sp);
  return h('li', {}, h('a', {class: 'sj-chip' + (ov ? ' sj-chip-ov' : ''), href: '#/c/' + encodeURIComponent(code), 'data-code': code, 'data-days': dz ? String(dz) : null, 'data-n': n ? String(n) : null, 'data-mon': m ?? 'na',
    'aria-label': name + (n ? ' · ' + n + '묶음' : '') + (dz ? ' · ' + dz + '일째' : '') + (sp ? ' · 한 달 전 ' + won(sp[0]) + ' · ' + (bd ? bd + ' ' : '') + '마지막 값 ' + won(sp[20]) + ' · ' + MONW[m] : '')},
    h('b', {text: name}), h('span', {class: 'sj-chipi'}, n ? h('span', {class: 'sj-chipn', text: n + '묶음'}) : null, h('span', {class: 'sj-chipd', text: dz ? dz + '일째' : ''})), sp ? spark(sp, 64, 26, 'sj-sps') : null, m ? h('i', {class: 'sj-chipm sj-chipm-' + m, 'aria-hidden': 'true', text: m === 'dn' ? '내림' : m === 'up' ? '오름' : '같음'}) : null));
}
/* ── 큰 갈래 차례(주문 1116-1601 · 사장님 2026-11-16(마카오) 15:01 어떤 분 의견 「서른 여섯가지의 답에 나오는 회사들이 큰 테마로 보면 … 1~5위 … 등수 별로 오르고 내린 주식의 평균 퍼센트」 · 「이작업도 같이해」) ──
   서른여섯 꾀 답에 나온 회사를 같은 일 하는 회사끼리(판 업종 묶음) 모음 · 회사가 많이 나온 차례(같으면 꾀 답에 나온 번 · 많이 오른 차례가 아님) · 갈래마다 한 달 동안 100원이 평균 ○원(「%」 대신) · 오른 곳 · 내린 곳 · 회사들 */
export const okTheme = r => !!r && typeof r.name === 'string' && r.name !== '' && Number.isInteger(r.hits) && r.hits > 0 && Number.isInteger(r.n) && r.n > 0 && Array.isArray(r.codes) && r.codes.length === r.n
  && [r.up, r.dn, r.m].every(v => Number.isInteger(v) && v >= 0) && r.up + r.dn <= r.m && r.m <= r.n && (r.avg === null || (fin(r.avg) && r.avg > 0));
export const thRows = g => (g?.themes?.rule === 'themes-v1' && Array.isArray(g.themes.rows) ? g.themes.rows.filter(okTheme).slice(0, 5) : []);
export const thSt = r => (!fin(r.avg) ? 'na' : r.avg > 1 ? 'up' : r.avg < 1 ? 'dn' : 'eq');
export const thUd = r => '오른 회사 ' + r.up + '곳 · 내린 회사 ' + r.dn + '곳' + (r.m - r.up - r.dn ? ' · 그대로인 회사 ' + (r.m - r.up - r.dn) + '곳' : '');
export const thV = r => (fin(r.avg) ? '한 달 동안 100원이 평균 ' + w100(r.avg - 1) + '이 됐어요.' : '한 달 값이 모자라서 평균을 세지 못했어요.');
function themesBox(g) {
  const R = thRows(g); if (!R.length) return null;
  const in7 = code => g.kinds.filter(k => (g.lists[k] ?? []).slice(0, 7).some(c => c?.code === code)).length;
  const nameOf = code => { for (const k of g.kinds) { const c = (g.lists[k] ?? []).find(x => x?.code === code); if (c?.name) return String(c.name); } return NEED; };
  const mx = Math.max(0, ...R.filter(r => fin(r.avg)).map(r => Math.abs(r.avg - 1)));
  return h('div', {class: 'sj-th', 'data-n': String(R.length)},
    h('h3', {class: 'sj-h3 sj-thh3', text: '꾀가 많이 고른 분야'}),
    h('p', {class: 'sj-thlead', text: '꾀가 고른 회사를 하는 일이 같은 회사끼리 묶었어요. 회사가 많이 나온 분야부터 ' + R.length + '개예요.'}),
    meanCap(PM.themes), // 붓 막대 그림 뜻 — 줄 맨 위 한 번(주문 1116-1313)
    h('ol', {class: 'sj-thl'}, ...R.map((r, i) => h('li', {class: 'sj-thr', 'data-g': r.name, 'data-hits': String(r.hits), 'data-n': String(r.n), 'data-st': thSt(r)},
      h('p', {class: 'sj-thh'}, h('span', {class: 'sj-thn', text: String(i + 1)}), h('b', {class: 'sj-thg', text: r.name}), h('span', {class: 'sj-thc', text: '나온 회사 ' + r.n + '곳 · 꾀가 고른 횟수 ' + r.hits + '번'})), // 「회사」로 시작하면 「의료기기」 뒤에 붙어 「기회」로 읽힘(쓰지 않을 말)
      brushBar(fin(r.avg) && r.avg !== 1 ? r.avg - 1 : null, mx, {cls: 'sj-thbar'}), // 그대로(100원 → 100원)면 획 없음
      h('p', {class: 'sj-thv', text: thV(r)}),
      h('p', {class: 'sj-thud', text: thUd(r)}),
      h('details', {class: 'sj-drawer sj-thd'}, h('summary', {}, h('span', {class: 'sj-s1', text: '이 분야 회사 ' + r.n + '곳 보기'}), chev()),
        h('ul', {class: 'sj-thcos'}, ...r.codes.map(code => h('li', {}, h('a', {class: 'sj-thco', href: '#/c/' + encodeURIComponent(String(code)), 'data-code': String(code)},
          h('b', {text: nameOf(code)}), h('span', {text: '꾀 ' + in7(code) + '가지'}))))))))),
    h('p', {class: 'sj-thnote', text: '회사가 많이 나온 차례예요. 많이 오른 차례가 아니에요.'}));
}
/** 줄어든 갈래 한 칸(주문 1117-1120 · 샘플 다) — 큰 갈래 다섯 가운데 한 달 평균이 100원 아래로 준 갈래(가장 많이 준 하나) · 없으면 없다고 씀(손실 먼저 · 숨기지 않음) */
export const lossOf = g => { const R = thRows(g).filter(r => fin(r.avg) && r.avg < 1); return R.length ? R.reduce((a, r) => (r.avg < a.avg ? r : a)) : null; };
function lossTh(g) {
  if (!thRows(g).length) return null;
  const r = lossOf(g);
  return h('div', {class: 'sj-loss', 'data-g': r ? r.name : ''},
    h('p', {class: 'sj-lossk', text: '▼ 값이 줄어든 분야'}),
    r ? h('p', {class: 'sj-lossv'}, h('b', {class: 'sj-lossn', text: r.name}), h('span', {class: 'sj-lossw'}, h('span', {text: '한 달 전 100원이 '}), h('b', {text: w100(r.avg - 1)})))
      : h('p', {class: 'sj-lossv'}, h('b', {class: 'sj-lossn', text: '꾀가 많이 고른 분야 다섯은 한 달 동안 값이 줄지 않았어요.'})));
}
/** 크게 덜 잃는 일곱(주문 1117-1731 · 사장님 2026-11-17(마카오) 17:31 「응」 — 주문 1117-1720 에서 결과를 보기 전에 적은 법으로 앞 1년에 고르고 뒤 1년에서 확인한 법)
 *  두 꾀 넘게 함께 고른 곳 가운데 요즘 60날 덜 흔들린 차례 · 한 업종 둘까지 · 일곱까지(모자라면 채우지 않음) — 꾀 칸 자료 calm(su21.py · su21_s36.calm7)
 *  지난 기록(올릴 때마다 다시 셈 · rec): 가장 나빴던 열에 한 주 100원이 ○원 · 아무렇게나 고른 일곱 ○원 · 잃은 번 열 번에 ○번(아무렇게나 ○번) — 두 줄 모두 보임(손실 숨기지 않음) */
export const CALM_RULE = 'calm7-v1';
export const okCalmRec = r => !!r && r.rule === CALM_RULE && Number.isInteger(r.n) && r.n > 0 && Number.isInteger(r.lose) && r.lose >= 0 && r.lose <= r.n && fin(r.exp) && r.exp >= 0 && r.exp <= r.n && fin(r.tail) && fin(r.tail7);
export const calmOf = g => (g?.calm?.rule === CALM_RULE && Array.isArray(g.calm.list) ? g.calm.list.filter(c => c && typeof c.code === 'string' && c.code !== '').slice(0, 7) : null);
export const ten = x => (Math.round(x * 100) / 10).toFixed(1).replace(/\.0$/, '');
export const p100 = x => String(Math.round(x * 100)); // 100번 가운데 몇 번(주문 1118-1700 — 「열 번에 3.9번」 대신)
function calmBox(g) {
  const L = calmOf(g); if (!L) return null;
  const R = okCalmRec(g.calm.rec) ? g.calm.rec : null, bd = mday(g?.asOf?.board);
  return h('div', {class: 'sj-calm', 'data-n': String(L.length)},
    h('p', {class: 'sj-calmk', text: '덜 흔들린 회사 일곱 곳'}),
    h('p', {class: 'sj-calml', text: '꾀 두 가지 이상이 함께 고른 회사 가운데, 요즘 덜 흔들린 회사예요. 하는 일이 같은 회사는 두 곳까지만 골랐어요.'}),
    L.length ? h('ul', {class: 'sj-chips'}, ...L.map(c => chip(g, c, bd, false))) : h('p', {class: 'sj-tnone', text: '오늘은 꾀 두 가지 이상이 함께 고른 회사가 없어요.'}),
    R ? h('p', {class: 'sj-calmr'}, h('span', {text: '가장 나빴던 때는 100원이 '}), h('b', {text: w100(R.tail)}), h('span', {text: '이 됐어요. 아무 회사나 일곱 곳을 고르면 ' + w100(R.tail7) + '이 됐어요.'}))
      : h('p', {class: 'sj-calmr', text: '지난 기록을 세지 못했어요.'}),
    R ? h('p', {class: 'sj-calmr2', text: '잃은 때는 100번 가운데 ' + p100(R.lose / R.n) + '번이에요. 아무 회사나 고르면 ' + p100(R.exp / R.n) + '번이에요.'}) : null,
    R ? h('p', {class: 'sj-calmd', text: '장이 열린 지난 ' + R.n + '일 동안, 날마다 같은 방법으로 골라 닷새 뒤 값과 비교했어요.' + (ym(R.from) && ym(R.to) ? ' 센 기간은 ' + ym(R.from) + '부터 ' + ym(R.to) + '까지예요.' : '')}) : null);
}
/** 요즘 주도주 일곱 곳(주문 1126-1748 · 사장님 2026-11-26(서울) 17:48 「두번재 그림이 덜 흔들리는걸로 배치 되러 있다 그걸 료즘 주도주 7주로 다시 찾아내 1등부터 7등까지 배치하라」)
 *  자료 = 첫 화면 자료 lists.hot(불장 일곱 · su21.py — 요즘 오르는 업종 안 · 한 달 오른 회사 → 빚투 쏠림 · 본전 버티기는 뺌 → 새 높은 값 · 사람이 몰린 날이 많은 차례 → 한 달 오른 만큼이 드문 차례 · 업종마다 둘)
 *  그 차례 그대로 1등부터 7등 · 오른 크기 숫자는 싣지 않음(수익 순위 아님 · 한 달 꺾은선과 오름 · 내림 표만) · 누르면 그 회사 쪽 · 사고팔기를 권하지 않음 */
export const LEAD_LINE = '요즘 오르는 업종 안에서 한 달 동안 오른 회사 가운데, 새 높은 값을 찍고 사람이 몰린 날이 많은 회사부터 1등이에요. 하는 일이 같은 회사는 두 곳까지만 골랐어요.';
export const leadOf = T => (Array.isArray(T?.lists?.hot) ? T.lists.hot.filter(c => c && /^\d{6}$/.test(String(c.code ?? '')) && typeof c.name === 'string' && c.name.trim() !== '').slice(0, 7) : null);
function leadChip(c, r, bd) {
  const code = String(c.code), name = c.name.trim(), sp = Array.isArray(c.c) && c.c.length >= 2 && c.c.every(v => fin(v) && v > 0) ? c.c : null, m = monOf(sp);
  return h('li', {}, h('a', {class: 'sj-chip sj-l7c', href: '#/c/' + encodeURIComponent(code), 'data-code': code, 'data-rank': String(r), 'data-mon': m ?? 'na',
    'aria-label': r + '등 · ' + name + (sp ? ' · 한 달 전 ' + won(sp[0]) + ' · ' + (bd ? bd + ' ' : '') + '마지막 값 ' + won(sp[sp.length - 1]) + ' · ' + MONW[m] : '')},
    h('b', {}, h('span', {class: 'sj-l7r', text: r + '등'}), h('span', {class: 'sj-l7n', 'data-proper': '', text: name})), sp ? spark(sp, 64, 26, 'sj-sps') : null,
    m ? h('i', {class: 'sj-chipm sj-chipm-' + m, 'aria-hidden': 'true', text: m === 'dn' ? '내림' : m === 'up' ? '오름' : '같음'}) : null));
}
function leadBox(T) {
  const L = leadOf(T); if (!L) return null;
  const bd = mday(T?.asOf?.board);
  return h('div', {class: 'sj-calm sj-lead7', 'data-n': String(L.length)},
    h('p', {class: 'sj-calmk', text: '요즘 주도주 일곱 곳'}),
    h('p', {class: 'sj-calml', text: LEAD_LINE}),
    L.length ? h('ol', {class: 'sj-chips sj-l7l'}, ...L.map((c, i) => leadChip(c, i + 1, bd))) : h('p', {class: 'sj-tnone', text: '오늘은 고른 회사가 없어요.'}),
    h('p', {class: 'sj-calmd', text: (bd ? bd + ' 마지막 값까지 센 지난 기록이에요. ' : '지난 기록이에요. ') + '앞날을 맞히지 않고, 사고팔기를 권하지 않아요.'}));
}
/** 지금 땅의 꾀 셋(주문 1117-1859 · 사장님 2026-11-17(마카오) 18:59 「지금 주식상황에 전략적으로 승리 할수 있는 병법 3가지를 선정해서 첫 페이지애 잘보이게 하라」)
 *  덜 잃은 차례(본질 8) 안에서, 같은 땅 날들에 ① 잃은 번이 아무렇게나 고른 일곱보다 적고 ② 가장 나빴던 열에 한 주가 아무렇게나 일곱보다 얕은 꾀 · 셋까지(su21_sun win3)
 *  꾀 칸 맨 위(차례 말씀 바로 아래) · 먹 칸에 크게 · 누르면 그 꾀 쪽 · 앞날을 맞히지 않음 — 지난 같은 땅 기록 */
export const WIN3_RULE = 'win3-v1';
export const win3Of = S => (S?.win3?.rule === WIN3_RULE && Array.isArray(S.win3.ks) ? S.win3.ks.filter(k => typeof k === 'string' && /^g\d\d$/.test(k)).slice(0, 3) : null);
export const okWinR = r => !!r && Number.isInteger(r.n) && r.n > 0 && Number.isInteger(r.lose) && r.lose >= 0 && r.lose <= r.n && fin(r.exp) && fin(r.tail) && fin(r.tail7);
/** 꾀마다 쌓인 값 작은 꺾은선(주문 1119-1317 · 사장님 2026-11-19(마카오) 13:17 「꾀 칸을 보면 눌러야 꺽기 그래프가 나와 바로 보이게 해」)
 *  꾀 칸 자료 g.tr(정산 쪽과 같은 값 — 날마다 기록 · 처음 넣은 100원) · 이미 있는 「한 달 꺾은선」 모양 · 이틀 넘게 있어야 그림 · 누르지 않아도 보임 */
export const trOf = (g, k) => { const T = g?.tr, j = Number(String(k).slice(1)) - 1;
  if (!T || !Array.isArray(T.days) || !Array.isArray(T.w) || T.days.length !== T.w.length || !(j >= 0 && j < 36)) return null;
  const sp = T.w.map(r => (Array.isArray(r) && Number.isFinite(r[j]) && r[j] > 0 ? r[j] / 1e4 : null)).filter(v => v != null); return sp.length > 1 ? sp : null; };
export const trSpark = (g, k) => { const sp = trOf(g, k); if (!sp) return null; const v = sp[sp.length - 1];
  return h('p', {class: 'sj-ktr', 'data-dir': v > sp[0] ? 'up' : v < sp[0] ? 'dn' : 'eq'}, spark(sp, 88, 28, 'sj-ktrsp'), h('span', {class: 'sj-ktrv', text: '정산에서 100원이 ' + w100(v / 100 - 1) + '이 됐어요'})); };
function winBox(g, S, RB) {
  const ks = win3Of(S); if (!ks) return null;
  const n = ks.length, KN3 = ['', '하나', '둘', '셋'];
  return h('div', {class: 'sj-win3', 'data-n': String(n)},
    h('p', {class: 'sj-win3k', text: S.name + '에서 덜 잃은 꾀' + (n ? ' ' + KN3[n] : '')}),
    h('p', {class: 'sj-win3l', text: (S.hist?.all ? '지난 기록을 모두 봤어요.' : '예전에 지금처럼 ' + S.name + '이었던 날들을 봤어요.') + ' 아무 회사나 고른 것보다 덜 자주 잃고, 크게 잃을 때도 덜 잃은 꾀예요.'}),
    n && n < 3 ? h('p', {class: 'sj-win3f', text: '두 가지를 모두 갖춘 꾀는 ' + KN3[n] + '뿐이에요. 억지로 채우지 않았어요.'}) : null,
    ks.length ? h('ol', {class: 'sj-win3o'}, ...ks.map((k, i) => { const r = RB[k], ok = okWinR(r);
      return h('li', {class: 'sj-w3', 'data-k': k},
        h('a', {class: 'sj-w3a', href: '#/k/' + k, 'aria-label': (i + 1) + ' · ' + (g.name?.[k] ?? k) + ' · 이 꾀 자세히'},
          h('span', {class: 'sj-w3n', text: String(i + 1)}),
          h('span', {class: 'sj-w3b'}, h('b', {class: 'sj-w3t', text: g.name?.[k] ?? k}), h('span', {class: 'sj-w3h', text: g.han?.[k] ?? ''})),
          h('i', {class: 'sj-tkgo', 'aria-hidden': 'true', text: '›'})),
        trSpark(g, k), // 쌓인 값 작은 꺾은선 — 누르지 않아도(주문 1119-1317)
        h('p', {class: 'sj-w3m', text: g.mean?.[k] ?? ''}),
        ok ? h('p', {class: 'sj-w3r', text: '100번 가운데 ' + p100(r.lose / r.n) + '번 잃었어요. 아무 회사나 고르면 ' + p100(r.exp / r.n) + '번 잃었어요.'}) : null,
        ok ? h('p', {class: 'sj-w3r2', text: '가장 나빴던 때는 100원이 ' + w100(r.tail) + '이 됐어요. 아무 회사나 고르면 ' + w100(r.tail7) + '이 됐어요.'}) : null); }))
      : h('p', {class: 'sj-tnone', text: '오늘은 두 가지를 모두 갖춘 꾀가 없어요. 아래 꾀 차례를 보세요.'}),
    h('p', {class: 'sj-win3s', text: '지금 같은 시장이었던 지난 기록으로 고른 꾀예요. 앞날을 맞히지 않고, 사고팔기를 권하지 않아요.'}));
}
function trickSec(g, T) {
  const sun = okSun(T.sun) ? T.sun : null, N = g.kinds.reduce((a, k) => a + Math.min(7, (g.lists[k] ?? []).length), 0), dd = mday(g?.asOf?.data) ?? mday(T.asOf?.board), bd = mday(g?.asOf?.board);
  const anySp = g.kinds.some(k => (g.lists[k] ?? []).slice(0, 7).some(c => sp36(g, String(c?.code ?? ''))));
  const S = sun && sun.rank.every(r => g.kinds.includes(r.k)) && new Set(sun.rank.map(r => r.k)).size === 36 ? sun : null;
  const order = S ? S.rank.map(r => r.k) : g.kinds, RB = S ? Object.fromEntries(S.rank.map((r, i) => [r.k, {...r, i: i + 1}])) : {};
  const one36 = k => { const L = (g.lists[k] ?? []).slice(0, 7), r = RB[k];
    return h('li', {class: 'sj-tk', 'data-k': k, 'data-n': String(L.length), 'data-rank': r ? String(r.i) : null},
      meanCap(PIC[k]), kkoeTile(k, g.name?.[k] ?? k), // 그림 뜻 한 줄 → 꾀 그림(주문 1116-1313)
      h('a', {class: 'sj-tkh', href: '#/k/' + k, 'aria-label': (r ? '차례 ' + r.i + ' · ' : '') + (g.name?.[k] ?? k) + ' · 이 꾀 자세히'}, r ? h('span', {class: 'sj-rk', text: String(r.i)}) : null,
        h('p', {class: 'sj-tn'}, h('b', {text: g.name?.[k] ?? k}), h('span', {text: ' ' + (g.han?.[k] ?? '') + ' · ' + L.length + '곳'})), h('i', {class: 'sj-tkgo', 'aria-hidden': 'true', text: '›'})), // 꾀 이름을 누르면 그 꾀 쪽(주문 1115-2328)
      trSpark(g, k), // 쌓인 값 작은 꺾은선 — 누르지 않아도(주문 1119-1317)
      ...rec36(r),
      L.length ? h('ul', {class: 'sj-chips'}, ...L.map(c => chip(g, c, bd, false))) : h('p', {class: 'sj-tnone', text: none36(g.why?.[k])}), // 회사 단추는 바로 보임(사장님 2026-11-16 01:56 「지금 7곳이라고 클릭해야 나오잖아 바로 종목들이 나오개 해」)
      h('details', {class: 'sj-drawer sj-cos'}, h('summary', {}, h('span', {class: 'sj-s1', text: '고르는 법'}), chev()), // 긴 풀이만 접은 칸(주문 1116-0118)
        h('p', {class: 'sj-say', text: g.say?.[k] ?? ''}), funnel36(g, k))); }; // 세 거름을 지난 수(주문 1116-1539)
  const H = S ? S.hist : null, TOP = 3; // 첫 쪽은 꾀 셋만(주문 1117-1120 샘플 다 「창호지 한 장」 — 서른여섯 모두는 꾀 탭 #/k)
  return h('section', {class: 'sj-sec sj-s36', 'aria-label': S ? '덜 잃은 꾀 차례' : '서른여섯 꾀', 'data-n': String(N), 'data-order': S ? 'sun' : 'kind'},
    head('꾀', '제2장', h('h2', {class: 'sj-h2'}, h('span', {class: 'sj-brush', text: S ? '덜 잃은 꾀 차례' : '서른여섯 꾀'})), true),
    S?.rankQ?.quote ? h('blockquote', {class: 'sj-q'}, h('p', {text: '「' + S.rankQ.quote + '」'}), h('cite', {text: '손자병법 ' + (S.rankQ.pian ?? '')})) : null,
    S ? winBox(g, S, RB) : null, // 지금 땅의 꾀 셋(주문 1117-1859) — 꾀 칸 맨 위에 크게
    lossTh(g), // 줄어든 갈래 한 칸 — 손실 먼저(주문 1117-1120 샘플 다)
    leadBox(T), // 요즘 주도주 일곱 곳 · 1등부터 7등(주문 1126-1748 — 옛 「덜 흔들린 회사 일곱 곳」 자리)
    themesBox(g), // 큰 갈래 차례(주문 1116-1601) — 꾀 서른여섯을 하나하나 보기 전에 한눈에
    h('ol', {class: 'sj-tricks'}, ...order.slice(0, TOP).map(one36)),
    h('a', {class: 'sj-go sj-pkgo', href: '#/o'}, h('span', {text: '여러 꾀가 고른 회사 보기'}), h('i', {'aria-hidden': 'true', text: '›'})), // 여러 꾀가 고른 회사(주문 1120-0950)
    h('a', {class: 'sj-go sj-all', href: '#/k'}, h('span', {text: '서른여섯 꾀 모두 보기'}), h('i', {'aria-hidden': 'true', text: '›'})), // 나머지 꾀는 꾀 탭에서(주문 1117-1120)
    h('details', {class: 'sj-drawer sj-how'}, h('summary', {}, h('span', {class: 'sj-s1', text: '꾀 차례는 이렇게 셌어요'}), chev()), // 센 법 · 고른 날(긴 풀이는 접은 칸 — 주문 1116-0118)
      h('p', {class: 'sj-lead', text: LEAD36(g)}),
      ...pickHow(g), // 세 거름 풀이(주문 1116-1539)
      S && H ? h('p', {class: 'sj-rule', text: (H.all ? '장이 열린 날로 지난 ' + H.days + '일을 모두 봤어요. ' : '장이 열린 날로 지난 ' + H.days + '일을 봤어요. 그 가운데 오늘처럼 ' + S.name + '이었던 ' + H.same + '일을 골랐어요. ')
        + '그날마다 꾀가 고른 회사 일곱 곳의 닷새 뒤 값을 봤어요. 잃은 때가 적은 꾀를 위에 놓았어요.' + (ym(H.from) && ym(H.to) ? ' 센 기간은 ' + ym(H.from) + '부터 ' + ym(H.to) + '까지예요.' : '')}) : null,
      h('p', {class: 'sj-dayl', text: (dd ? dd + ' 마지막 값으로 골랐어요. ' : '') + (anySp ? '회사 이름 옆 꺾은선은 한 달 동안의 값이에요. 점선은 한 달 전 값이에요. ' : '') + '한 회사가 여러 꾀에 함께 들 수 있어요.' + (mday(g.daysFrom) ? ' 「며칠째」는 ' + mday(g.daysFrom) + ' 기록부터 셌어요.' : '')}),
      h('p', {class: 'sj-note', text: '화살 열 개는 지난 기록을 열 번으로 줄여 그린 거예요. 꺾인 화살이 잃은 때예요.'})),
    h('p', {class: 'sj-safe', text: '지난 기록으로 정한 차례예요. 앞날을 맞히지 않고, 사고팔기를 권하지 않아요.'}),
    h('a', {class: 'sj-go', href: '#/r/t'}, h('span', {text: '서른여섯 꾀 정산 보기'}), h('i', {'aria-hidden': 'true', text: '›'})),
    endSeal('꾀'));
}

/* ── 0 오늘 한 장(주문 1120-0001 · 사장님 2026-11-20(마카오) 00:01 「손자병법을 대 개선 한다 / 머스크가 손자병버을 만들었다면 … 매우 매우 직관적이면서 매루매우 활용적이면서 매우매우 아름닥게」 · 00:05 「어 맞아」)
   참모 서른여섯 2차 표 — 뼈대 m08 「깃털 한 장」(첫째로 8표) + m04 「네 번째 비행」(18표 · 한 달 전 약속을 첫 쪽으로) + d07 「멈춤 문」(15표 · 가장 큰 단추는 사기가 아니라 멈춤)
   첫 화면 한 장 = 오늘 시장 한 마디 · 이런 시장에서 덜 잃은 꾀 셋 · 「사기 전에 멈춰요」 큰 단추 · (한 달 지난 약속이 있는 날만) 그날 정한 대로 했어? · 앞날을 맞히지 않음 ── */
/** 세 태세 한 줄(주문 1120-0728) — 줄 하나가 단추 하나(누르면 그 꾀 쪽) · 잃는 쪽 먼저(s04 · 가장 나쁜 날 → 잃은 날 → 평균 · 모두 같은 크기)
 *  수비가 바탕(s01 · 맞는 꾀가 없으면 비움 — 억지로 채우지 않음) · 세 줄 같은 꼴(d02) */
const tsLine = (cls, k, v) => h('span', {class: cls}, h('span', {class: 'sj-tsk', text: k}), h('b', {text: v}));
function stRow(d, r) {
  if (!r || typeof KNAME[r.k] !== 'string') return h('li', {class: 'sj-ts sj-ts0', 'data-st': d.st},
    h('p', {class: 'sj-ts0t'}, h('span', {class: 'sj-tsg', text: d.tag}), h('span', {class: 'sj-ts0s', text: d.st === 'att' ? '이런 시장에서 평균이 늘어난 꾀가 없었어요.' : '고루 갖춘 꾀가 없었어요.'})),
    h('p', {class: 'sj-ts0x', text: '억지로 채우지 않았어요.'}));
  return h('li', {class: 'sj-ts', 'data-st': d.st, 'data-k': r.k},
    h('a', {class: 'sj-tsa', href: '#/k/' + r.k},
      h('span', {class: 'sj-tst'}, h('span', {class: 'sj-tsg', text: d.tag}), h('b', {class: 'sj-tsn', text: KNAME[r.k]}), h('i', {'aria-hidden': 'true', text: '›'})),
      h('span', {class: 'sj-tsv'}, tsLine('sj-tsw', '가장 나쁜 날', won100(r.worst)), tsLine('sj-tsl', '잃은 날', r.n + '번 중 ' + r.lose + '번'), tsLine('sj-tsm', '평균', won100(r.avg)))));
}
export function todayCard(T, lc = null) {
  const x = okSun(T.sun) ? T.sun : null, dd = mday(x?.day ?? T.asOf?.board), st = x ? stance3(x) : null;
  const card = h('div', {class: 'sj-tc', 'data-land': x?.land ?? null, 'data-stance': st ? st.rule : null},
    h('p', {class: 'sj-tck', text: '오늘 시장' + (dd ? ' · ' + dd + ' 마지막 값' : '')}),
    x ? h('p', {class: 'sj-tcl'}, h('b', {class: 'sj-tcn', text: x.name}), h('span', {class: 'sj-tcl2', text: '이에요.'})) // 「지금은」 줄을 지움(세 태세 줄 자리 · d02 「시장 문장 두 줄을 한 줄로」)
      : h('p', {class: 'sj-tcl', text: '오늘 시장 모습은 아직 세지 못했어요.'}),
    st ? h('p', {class: 'sj-tch', text: '이런 시장의 세 태세 · 지키는 쪽부터'}) : null,
    st?.def ? h('p', {class: 'sj-tcd', text: (x.hist?.all ? '지난 모든 날' : '지난 같은 시장') + ' · 100원이 닷새 뒤'}) : null,
    st?.def ? h('ol', {class: 'sj-tcst', 'aria-label': '세 태세 · 수비형 · 보편형 · 공격형'}, ...STANCES.map(d => stRow(d, st[d.st])))
      : st ? h('p', {class: 'sj-tcd', text: '센 날이 모자라 세 태세를 세지 못했어요. 억지로 채우지 않았어요.'}) : null,
    h('a', {class: 'sj-tcgo', href: lc ? '#/q/' + lc : '#/q'}, h('b', {text: '사기 전에 멈춰요'}), h('span', {text: '열한 가지를 하나씩 물어요'}), h('i', {'aria-hidden': 'true', text: '›'})),
    h('p', {class: 'sj-tcs', text: '지난 기록이에요. 앞날을 맞히지 않고, 사고팔기를 권하지 않아요.'})); // 한 달 전 약속 칸은 지움(주문 1121-0044 · 사장님 00:44 「정확히 4곳을 지우는 거야」 — 매매일지 맨 위 약속은 그대로)
  return card;
}

/* ── 3-2 손자병법 주식 격언 열 가지(주문 1120-2116 · 사장님 2026-11-20(마카오) 21:16 「… 주식을 할 때 가져야 할 자세 11가지 정리한 거 있어 그걸 첫 페이지에 멋지게 나열해봐」
   · 23:14 「이게 아니야 돌이를 만들때 주식을 하는 명언이 있던 걸로 기억해 … 기록을 찾아봐 그리고 글을 그 수채화 위에 글을 찾아서 올려」)
   글 = 사장님 2026-10-16 「아틀란스 주식 격언 열 가지」(돌이 첫 화면 편지 · site/next/app.js HELLO_MSG) 글자 그대로 · 남의 글 표시(data-proper)
   꼴 = 손자병법 한 폭과 같은 산수 수채화(/su/su-bg.svg — 번호 도장 · 점선 뺀 그림)를 깐 족자 · 위 하늘에 붓 글씨 제목 · 그 아래 격언 열 줄(번호 도장 · 격언 굵게 · 풀이)
   자리 = 첫 화면 맨 위 · 「오늘 시장」 칸(표지)보다 위(사장님 23:21 「그 글을 그림에 올려 글을 쓰고 맨 위에 두어라」 · 23:25 「맞아」) — index.html 이 같은 글로 먼저 칠함(없으면 여기서 맨 앞에 붙임) */
function mindSec() {
  return h('section', {class: 'sj-sec sj-mind', 'aria-label': MIND_TITLE, 'data-rule': MIND_RULE, 'data-n': String(MIND10.length)},
    h('p', {class: 'sj-k', text: '사기 전에 새기는 말'}),
    h('div', {class: 'sj-gk'},
      h('h2', {class: 'sj-gkh'}, h('span', {class: 'sj-brush', text: MIND_TITLE})),
      h('p', {class: 'sj-gkhint', text: '격언을 누르면 맞는 손자병법 말씀이 펼쳐져요.'}),
      h('ol', {class: 'sj-gkl', 'aria-label': MIND_TITLE}, ...MIND10.map(m => h('li', {class: 'sj-gki', 'data-n': String(m.n)},
        h('details', {class: 'sj-gkd'}, // 누르면 맞는 손자병법 말씀(사장님 2026-11-21 00:19 「그래 그렇게도 하고」)
          h('summary', {class: 'sj-gks'},
            h('span', {class: 'sj-gkn', 'aria-hidden': 'true', text: String(m.n)}),
            h('p', {class: 'sj-gkt', 'data-proper': ''}, h('b', {class: 'sj-gkm', text: m.say}), h('span', {class: 'sj-gkx', text: m.more})),
            chev()),
          h('blockquote', {class: 'sj-gkq'}, h('p', {text: '「' + m.quote + '」'}), h('cite', {text: '손자병법 ' + m.pian}))))))),
    h('p', {class: 'sj-mnote', text: '산수 그림 위에 적은 주식 격언 열 가지예요. 사고팔기를 권하는 말이 아니라, 사기 전에 한 번 멈추게 하는 말이에요.'}));
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
const nextOf = T => { const k = firstKkoe(T); return {href: '#/k/' + (k ?? 'g01'), k: '2 / 5', label: k ? '맨 위 꾀는 어떤 꾀일까?' : '첫째 꾀는 어떤 꾀일까?'}; }; // 형세가 없으면 삼십육계 첫째 꾀(길 다섯 화면은 늘 그대로)

/* ── 쪽 ── */
/** 첫 쪽 — {title, dom: [머리, 본문, 이야기 막대, 탭], after()} · su.js route 가 이것만 붙임(옛 page() · afterPaint() 를 거치지 않음) */
/** 첫 쪽 본문 — shell(su-sonja-top.js sonjaShell 이 먼저 칠한 머리 줄 · 표지)이 붙어 있으면 그 main 뒤에 본문을 이어 붙임(표지를 다시 그리지 않음) */
/* ── 지금 시장 한 줄(주문 1125-1359 · 사장님 2026-11-25(서울) 13:59 「어 해!」 — 「오늘」 화면 맨 위 · 머리 줄 바로 아래 · main 밖)
   장 상태 넷(쉬는 날 · 열리기 전 · 열려 있음 · 닫힘 — su-mkt.js) · 다음 일(여는 때 · 닫는 때 · 다음 장날) · 자료 때(오늘 받은 값이면 그 시각 · 아니면 판 날)
   모양으로도 가름(빈 동그라미 · 찬 동그라미 · 네모 · 줄 — 붉은색 없음) · 30초마다 다시 셈(말이 바뀔 때만 고침) ── */
// 사장님 응원 한 줄(주문 1125-2019 · 사장님 2026-11-25(서울) 20:19 「한사장 화이팅 힘내! 첫페이지에 너어라」) — 「오늘」 맨 위 · 글은 여기 한 곳만 고치면 됨
export const CHEER = '한사장 화이팅 힘내!';
export const cheerLine = () => h('div', {class: 'sj-cheer', role: 'note'}, h('i', {class: 'sj-cheeri', 'aria-hidden': 'true'}), h('p', {class: 'sj-cheerp', text: CHEER}));

export function mktLine(T) {
  const el = h('div', {class: 'sj-mkt', role: 'status'});
  const data = () => { const n = T?.now, today = kst(Date.now()).day; if (okNow(n) && n.day === today) return '자료는 오늘 ' + hmWords(n.hm) + ' 값이에요'; const b = T?.asOf?.board; return b ? '자료는 ' + mday(b) + ' 값이에요' : ''; };
  let key = '';
  const draw = () => {
    const m = mktNow(Date.now()), w = mktWords(m), d = data(), k = m.st + '|' + w.t + '|' + w.s + '|' + d;
    if (k === key) return; key = k; el.dataset.st = m.st;
    el.replaceChildren(h('i', {class: 'sj-mkti', 'aria-hidden': 'true'}), h('p', {class: 'sj-mktp'}, h('b', {class: 'sj-mktt', text: w.t}), w.s ? h('span', {class: 'sj-mkts', text: w.s}) : null, d ? h('span', {class: 'sj-mktd', text: d}) : null));
  };
  draw();
  const iv = setInterval(() => { if (!el.isConnected) { clearInterval(iv); return; } draw(); }, 30000);
  return el;
}
/* ── 0 오늘의 꾀 한 장(주문 1126-1249 · 사장님 직원 바람 「첫 화면에 오늘의 꾀가 무엇인지 오늘의 주된 컨텐츠를 이미지화 시켜서 만들고 밑에 지금의 aaa처럼 여러 꾀의 내용이 정리」 · 본보기 「오늘의 핵심 키워드」 넘기는 그림 칸) ──
 *  첫 화면 맨 위 · 옆으로 넘기는 세 장(오늘의 꾀 · 오늘 시장 · 오늘의 한 줄) · 아래 점 · 그 아래는 지금 첫 화면 그대로 · 오늘 시장을 아직 못 센 때는 두 장(가장 최근 꾀 · 한 줄)
 *  꾀 = 「지금 볼 꾀 하나」(nowPick — 지금 시장 칸과 같은 꾀) · 글은 그림 밖 글(HTML) · 빨강 없음 · 앞날을 맞히지 않고 사고팔기를 권하지 않음 */
function heroSec(T) {
  const x = okSun(T.sun) ? T.sun : null, pk = x ? nowPick(x) : null; // 오늘 시장을 아직 못 센 때(장중 자료가 모자란 때 sun = null)에도 한 장은 늘 — 가장 최근에 적은 꾀(sunLog · 그날 첫 쪽 그대로)
  const rows = Array.isArray(T?.sunLog?.rows) ? T.sunLog.rows : [], r = pk ? null : rows.filter(q => typeof q?.day === 'string' && LANDK.includes(q.land) && typeof KNAME[q.k] === 'string').at(-1) ?? null;
  const from = pk ? 'now' : r ? 'log' : 'none', k = pk ? pk.k : r ? r.k : null, dd = mday(x ? x.day : T.asOf?.board);
  const slide = (key, kick, title, sub, art, more = null) => h('article', {class: 'sj-heros', 'data-slide': key, 'aria-roledescription': '장', 'aria-label': kick},
    h('div', {class: 'sj-herotx'}, h('p', {class: 'sj-herok', text: kick}), h('h2', {class: 'sj-heroh', text: title}), sub ? h('p', {class: 'sj-herop', text: sub}) : null, more),
    h('div', {class: 'sj-heroart', 'aria-hidden': 'true'}, art));
  const mean = k && typeof KMEAN[k] === 'string' ? KMEAN[k] + ' ' : '', stamp = (b, s1, s2) => h('span', {class: 'sj-herostamp'}, s1 ? h('small', {text: s1}) : null, h('b', {text: b}), s2 ? h('small', {text: s2}) : null);
  const why = from === 'now' ? (pk.win ? '예전에 지금처럼 ' + x.name + '이었을 때, 아무 회사나 고른 것보다 덜 잃은 꾀예요.' : '예전에 지금처럼 ' + x.name + '이었을 때, 돈을 가장 덜 잃은 꾀예요.')
    : from === 'log' ? '오늘 시장은 아직 세는 중이에요. 그래서 ' + mday(r.day) + '에 고른 꾀를 먼저 보여 드려요.' : '오늘 시장 모습을 다 세면, 예전에 그런 시장에서 돈을 덜 잃은 꾀를 여기에 크게 보여 드려요.';
  const M = MIND10[((Number(String(x?.day ?? T.asOf?.board ?? '').slice(8, 10)) || 1) - 1) % MIND10.length], qt = typeof x?.quote === 'string' ? {q: x.quote, p: x.pian ?? ''} : M ? {q: M.quote, p: M.pian} : null; // 오늘의 한 줄 — 오늘 시장 글이 없으면 격언 열 가지의 손자 말(날짜로 하나)
  const S3 = [
    k ? slide('kkoe', '오늘의 꾀', KNAME[k], mean + why, stamp(String(+k.slice(1)), '제', '계'), h('a', {class: 'sj-herogo', href: '#/k/' + k, text: '이 꾀 보기 ›'}))
      : slide('kkoe', '오늘의 꾀', '서른여섯 꾀', why, stamp('36', null, '꾀')),
    x ? slide('land', '오늘 시장' + (dd ? ' · ' + dd : ''), '지금은 ' + x.name + '이에요.', typeof x.do === 'string' ? x.do : null,
      h('span', {class: 'sj-seal sj-seal-big ' + (x.land === 'fall' ? 'sj-seal-dn' : 'sj-seal-up'), text: x.name})) : null,
    qt ? slide('word', '오늘의 한 줄', '「' + qt.q + '」', '손자병법 ' + qt.p, h('span', {class: 'sj-herostamp sj-heroq'}, h('b', {text: '손자'}), h('small', {text: '병법'}))) : null].filter(Boolean); // 글 도장(그림 아님 — 그림 뜻 한 줄 규칙 밖)
  const track = h('div', {class: 'sj-herot', tabindex: '0', 'aria-label': '오늘의 꾀 · 옆으로 넘겨 보기'}, ...S3), dots = h('div', {class: 'sj-herodots', 'aria-hidden': 'true'}, ...S3.map((_, i) => h('i', {class: i ? '' : 'sj-heroon'})));
  let raf = 0; track.addEventListener('scroll', () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(() => { const i = Math.round(track.scrollLeft / Math.max(1, track.clientWidth)); [...dots.children].forEach((d, j) => d.classList.toggle('sj-heroon', j === i)); track.dataset.at = String(i); }); }, {passive: true});
  return h('section', {class: 'sj-sec sj-hero', 'data-from': from, ...(k ? {'data-k': k} : {}), ...(x ? {'data-land': x.land} : {}), 'data-n': String(S3.length), 'aria-label': '오늘의 꾀'}, track, dots);
}
/* ── 0-1 인사 두 줄 · 0-3 오늘의 기업 · 0-4 오늘의 투자 점검(주문 1126-1544 · 사장님 2026-11-26(서울) 15:44 직원 본보기 그림 다시 보내심 — docs/design/today-2026-11-26/order-1544.txt)
 *  그림 차례 그대로: 인사 → 오늘의 핵심 키워드(= 오늘의 꾀 한 장) → 오늘의 추천 종목 → 오늘의 투자 체크리스트 · 그 아래는 지금 첫 화면 그대로
 *  사이트 규칙으로만 바꿈 — 「추천 종목」 → 직원 글의 「오늘의 기업」(오늘의 꾀가 고른 첫 회사 · 사라고 권하지 않음) · 「+」 → 「›」(그 회사 쪽) · 「수익을 만듭니다」 → 「실력을 만듭니다」(돈을 약속하지 않음)
 *  「체크리스트」 → 「점검」(바깥말 없음) · 「무리한 매수는 피하기」 → 「무리하게 사지 않기」(매수 낱말 없음) · 상표 그림 대신 이름 첫 글자 · 빨강 · 퍼센트 기호 없음 */
function greetSec() {
  return h('section', {class: 'sj-sec sj-greet', 'aria-label': '오늘 인사'},
    h('p', {class: 'sj-grh'}, h('span', {text: '오늘도'}), h('span', {text: '성장하는 투자자예요!'})),
    h('p', {class: 'sj-grs', text: '꾸준한 공부가 실력을 만듭니다'}));
}
const cdWon = v => Math.round(v).toLocaleString('ko-KR') + '원', cdChg = v => (v > 0 ? '▲ ' : v < 0 ? '▼ ' : '― ') + Math.abs(Math.round(v * 1000) / 10).toFixed(1) + '프로';
function coDaySec(k) { // 첫 칠함 — 자리만(꾀 칸 자료 su21-s36.json 을 받은 뒤 after 에서 채움)
  return h('section', {class: 'sj-sec sj-coday', 'aria-label': '오늘의 기업', 'data-wait': '', ...(k ? {'data-k': k} : {})},
    h('h2', {class: 'sj-cdh', text: '오늘의 기업'}), h('p', {class: 'sj-cdn', text: '꾀가 고른 회사를 불러오고 있어요.'}));
}
function coDayFill(sec, G) { // 오늘의 꾀(오늘의 꾀 한 장과 같은 꾀)가 고른 회사 가운데 첫째 · 값 = 꾀 칸 자료의 한 달 값(line) 마지막 · 그 앞날보다 오르내린 몫
  if (!sec?.isConnected) return;
  const k = sec.dataset.k ?? null, L = k && G ? G.lists?.[k] : null, c0 = Array.isArray(L) ? L.find(c => /^\d{6}$/.test(String(c?.code ?? '')) && typeof c?.name === 'string' && c.name.trim()) ?? null : null;
  const ln = c0 ? G.line?.[c0.code] : null, cs = Array.isArray(ln?.c) ? ln.c.filter(v => fin(v) && v > 0) : [], close = fin(ln?.close) && ln.close > 0 ? ln.close : cs.at(-1) ?? null, prev = cs.length >= 2 ? cs.at(-2) : null;
  sec.querySelector(':scope > .sj-cdn')?.remove();
  if (!c0 || !close) {
    sec.append(h('p', {class: 'sj-cdn', text: !k ? '오늘의 꾀가 정해지면 그 꾀가 고른 회사를 여기에 보여 드려요.' : !G ? '꾀가 고른 회사 자료가 아직 없어요. 억지로 채우지 않았어요.' : '오늘 이 꾀가 고른 회사가 없어요. 억지로 채우지 않았어요.'}));
    sec.removeAttribute('data-wait'); return;
  }
  const v = prev ? close / prev - 1 : null, ind = typeof G.ind?.[c0.code] === 'string' && G.ind[c0.code] ? G.ind[c0.code] : null, dd = mday(ln.date);
  sec.dataset.code = c0.code;
  sec.append(
    h('div', {class: 'sj-cdrow'},
      h('span', {class: 'sj-cdlogo', 'aria-hidden': 'true', text: c0.name.trim().slice(0, 1)}),
      h('div', {class: 'sj-cdtx'},
        h('b', {class: 'sj-cdname', 'data-proper': '', text: c0.name.trim()}),
        h('p', {class: 'sj-cdpx'}, h('span', {class: 'sj-cdwon', text: cdWon(close)}), v != null ? h('span', {class: 'sj-cdchg', 'data-m': v > 0 ? 'up' : v < 0 ? 'dn' : 'eq', text: cdChg(v)}) : null)),
      h('a', {class: 'sj-cdgo', href: '#/c/' + c0.code, 'aria-label': c0.name.trim() + ' 자세히 보기'}, h('i', {'aria-hidden': 'true', text: '›'}))),
    h('p', {class: 'sj-cdsub'}, h('span', {text: dd ? dd + ' 마지막 값' : '마지막 값'}), ind ? h('span', {'data-proper': '', text: ' · ' + ind}) : null),
    h('p', {class: 'sj-cdwhy', text: '「' + KNAME[k] + '」 꾀가 고른 회사 가운데 첫째예요. 사고팔기를 권하지 않아요.'}));
  sec.removeAttribute('data-wait');
}
export const TODO3 = Object.freeze(['시장 흐름 확인하기', '내 투자 회사 점검하기', '무리하게 사지 않기']), TODO_KEY = 'su-todo-v1';
function todoSec() { // 누르면 표시 · 이 휴대폰에만 그날 하루(이어 누른 날 세기 · 상 없음 — 본질: 연속 접속 보상 없음)
  const day = kst(Date.now()).day; let on = TODO3.map(() => false);
  try { const o = JSON.parse(localStorage.getItem(TODO_KEY) ?? 'null'); if (o && o.day === day && Array.isArray(o.on)) on = TODO3.map((_, i) => o.on[i] === true); } catch { /* 저장소 없음 — 표시만 */ }
  const save = () => { try { localStorage.setItem(TODO_KEY, JSON.stringify({day, on})); } catch { /* 저장소 없음 */ } };
  const items = TODO3.map((t, i) => {
    const b = h('button', {type: 'button', class: 'sj-tdb', 'aria-pressed': on[i] ? 'true' : 'false'}, h('span', {class: 'sj-tdm', 'aria-hidden': 'true', text: '✓'}), h('span', {class: 'sj-tdt', text: t}));
    b.addEventListener('click', () => { on[i] = !on[i]; b.setAttribute('aria-pressed', on[i] ? 'true' : 'false'); save(); });
    return h('li', {class: 'sj-tdi'}, b);
  });
  return h('section', {class: 'sj-sec sj-todo', 'aria-label': '오늘의 투자 점검'},
    h('h2', {class: 'sj-tdh', text: '오늘의 투자 점검'}), h('ul', {class: 'sj-tdl'}, ...items),
    h('p', {class: 'sj-tdn', text: '누르면 표시돼요. 이 휴대폰에만 오늘 하루 남아요.'}));
}
/* ── 잡스 판 첫 화면(주문 1128-0755 · 사장님 2026-11-28(서울) 07:55 「잡스가 인터페이스를 만들었다면 … 애플에 공식을 먼저 학습하라 … 먼저 샘플 3개를 제시하라」 · 08:17 「그래 1번으로 해 그런데 더 개선해 … 그 본질답게 개선하고 업그레이드」)
 *  샘플 1 「하나씩 크게」 + 본질 8번 차례: 오늘(날 · 응원) → 격언(산수 그림 위 · 맨 위 그대로) → 오늘의 땅 → 오늘의 꾀 → 덜 잃은 꾀 셋(손실 먼저 — 가장 낮을 때를 먼저) → 사기 전에 멈춤(가장 큰 단추 · 본질 2) → 안전 한 줄
 *  → 오늘 더 보기(인사 · 오늘의 기업 · 투자 점검 — 지우지 않고 한 번 더 누르면) → 표지 → 그 아래는 그대로
 *  잡스 「백 가지에 아니오」(WWDC 1997) · 애플 공식 안내서 Simplicity 「Include just what's necessary」 · Hierarchy · 글 17 · 누르는 자리 48 */
const WD7 = ['일', '월', '화', '수', '목', '금', '토'];
export const jDate = (ms = Date.now()) => { const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(kst(ms).day ?? ''); if (!m) return ''; const w = new Date(Date.UTC(+m[1], +m[2] - 1, +m[3])).getUTCDay(); return +m[2] + '월 ' + +m[3] + '일 ' + WD7[w] + '요일'; };
export function jHead() {
  return h('section', {class: 'sj-sec sj-jh', 'aria-label': '오늘'}, h('p', {class: 'sj-jhk', text: jDate()}), h('h1', {class: 'sj-jht', text: '오늘'}), cheerLine());
}
function jLand(T, mkt) {
  const x = okSun(T.sun) ? T.sun : null;
  return h('section', {class: 'sj-sec sj-jl', 'aria-label': '오늘의 땅', ...(x ? {'data-land': x.land} : {})},
    h('p', {class: 'sj-jk', text: '오늘의 땅'}),
    x ? h('p', {class: 'sj-jlt', text: '지금은 ' + x.name + '이에요.'}) : null,
    x && typeof x.do === 'string' ? h('p', {class: 'sj-jls', text: x.do}) : null,
    mkt);
}
/** 꾀 하나의 날마다 값(정산과 같은 g.tr · 처음 넣은 100원) — {d0, d1, low, now} · 가장 낮을 때는 처음 100원도 셈 */
export function trPath(g, k) {
  const T = g?.tr, j = Number(String(k).slice(1)) - 1;
  if (!T || !Array.isArray(T.days) || !Array.isArray(T.w) || T.days.length !== T.w.length || !(j >= 0 && j < 36)) return null;
  const P = T.w.map((r, i) => (Array.isArray(r) && fin(r[j]) && r[j] > 0 ? {d: T.days[i], v: r[j] / 1e4} : null)).filter(Boolean);
  if (P.length < 2) return null;
  return {d0: P[0].d, d1: P.at(-1).d, low: Math.min(100, ...P.map(q => q.v)), now: P.at(-1).v};
}
const jWon = v => h('b', {class: 'sj-jv', 'data-m': v > 100.04 ? 'up' : v < 99.95 ? 'dn' : 'eq', text: w100(v / 100 - 1)});
function jKkoe(T) {
  const x = okSun(T.sun) ? T.sun : null, pk = x ? nowPick(x) : null;
  const rows = Array.isArray(T?.sunLog?.rows) ? T.sunLog.rows : [], r = pk ? null : rows.filter(q => typeof q?.day === 'string' && LANDK.includes(q.land) && typeof KNAME[q.k] === 'string').at(-1) ?? null;
  const from = pk ? 'now' : r ? 'log' : 'none', k = pk ? pk.k : r ? r.k : null;
  const why = from === 'now' ? (pk.win ? '예전에 지금처럼 ' + x.name + '이었을 때, 아무 회사나 고른 것보다 덜 잃은 꾀예요.' : '예전에 지금처럼 ' + x.name + '이었을 때, 돈을 가장 덜 잃은 꾀예요.')
    : from === 'log' ? '오늘 시장은 아직 세는 중이에요. 그래서 ' + mday(r.day) + '에 고른 꾀를 먼저 보여 드려요.' : '오늘 시장 모습을 다 세면, 예전에 그런 시장에서 덜 잃은 꾀를 여기에 크게 보여 드려요.';
  if (!k) return h('section', {class: 'sj-sec sj-jkk', 'data-from': from, 'aria-label': '오늘의 꾀'}, h('p', {class: 'sj-jk', text: '오늘의 꾀'}), h('h2', {class: 'sj-jkt', text: '서른여섯 꾀'}), h('p', {class: 'sj-jks', text: why}), h('a', {class: 'sj-jbtn sj-jbtn2', href: '#/k', text: '서른여섯 꾀 보기'}));
  const no = String(+k.slice(1));
  return h('section', {class: 'sj-sec sj-jkk', 'data-from': from, 'data-k': k, 'aria-label': '오늘의 꾀'},
    h('div', {class: 'sj-jkrow'},
      h('div', {class: 'sj-jktx'}, h('p', {class: 'sj-jk', text: '오늘의 꾀 · 제' + no + '계'}), h('h2', {class: 'sj-jkt', text: KNAME[k]}), typeof KMEAN[k] === 'string' ? h('p', {class: 'sj-jkm', text: KMEAN[k]}) : null),
      h('span', {class: 'sj-herostamp sj-jkst', 'aria-hidden': 'true'}, h('small', {text: '제'}), h('b', {text: no}), h('small', {text: '계'}))),
    h('p', {class: 'sj-jks', text: why}),
    h('p', {class: 'sj-jkr', 'data-wait': ''}),
    h('a', {class: 'sj-jbtn sj-jbtn2', href: '#/k/' + k, text: '이 꾀 보기'}));
}
/** 오늘의 꾀 기록 한 줄 — 가장 낮을 때를 먼저(손실 먼저 · 본질 8) */
function jRecFill(sec, g) {
  const p = sec?.querySelector(':scope > .sj-jkr'); if (!p?.isConnected) return;
  const e = sec.dataset.k ? trPath(g, sec.dataset.k) : null;
  if (!e) { p.remove(); return; }
  p.replaceChildren(h('span', {text: mday(e.d0) + '부터 ' + mday(e.d1) + '까지 가짜 돈 100원이 가장 낮을 때 '}), jWon(e.low), h('span', {text: ', 지금 '}), jWon(e.now), h('span', {text: '이에요.'}));
  p.removeAttribute('data-wait');
}
function jTop3Wait() { return h('section', {class: 'sj-sec sj-j3', 'aria-label': '덜 잃은 꾀', 'data-wait': ''}, h('p', {class: 'sj-jk', text: '덜 잃은 꾀'}), h('p', {class: 'sj-j3w', text: '꾀 차례를 불러오고 있어요.'})); }
/** 덜 잃은 꾀 셋 — 형세가 있으면 그 땅의 덜 잃은 차례(sun.rank) · 없으면 정산 기록에서 가장 낮을 때가 높은 꾀부터(손실 먼저) · 서른여섯 모두는 꾀 탭 */
function jTop3Fill(sec, g, T) {
  if (!sec?.isConnected) return;
  const S = okSun(T.sun) ? T.sun : null;
  let L = [], lead = '';
  if (S && Array.isArray(S.rank)) {
    L = S.rank.filter(r => typeof KNAME[r.k] === 'string').slice(0, 3).map(r => ({k: r.k, r}));
    lead = '예전에 지금처럼 ' + S.name + '이었던 날들에 잃은 때가 적은 꾀부터예요.';
  } else if (g && Array.isArray(g.kinds)) {
    L = g.kinds.map(k => { const e = trPath(g, k); return e && typeof KNAME[k] === 'string' ? {k, e} : null; }).filter(Boolean).sort((a, b) => b.e.low - a.e.low || b.e.now - a.e.now).slice(0, 3);
    lead = L.length ? mday(L[0].e.d0) + '부터 ' + mday(L[0].e.d1) + '까지 가짜 돈 100원이 가장 덜 내려간 꾀부터예요. 잃지 않는 것이 먼저예요.' : '';
  }
  sec.querySelector(':scope > .sj-j3w')?.remove();
  if (!L.length) { sec.append(h('p', {class: 'sj-j3w', text: '꾀 차례 자료가 아직 없어요. 억지로 채우지 않았어요.'})); sec.removeAttribute('data-wait'); return; }
  sec.append(h('p', {class: 'sj-j3l', text: lead}),
    h('ol', {class: 'sj-j3o'}, ...L.map((q, i) => h('li', {class: 'sj-j3i', 'data-k': q.k},
      h('a', {class: 'sj-j3a', href: '#/k/' + q.k},
        h('span', {class: 'sj-j3n', text: String(i + 1)}),
        h('span', {class: 'sj-j3b'}, h('b', {class: 'sj-j3t', text: KNAME[q.k]}),
          q.e ? h('span', {class: 'sj-j3v'}, h('span', {text: '가장 낮을 때 '}), jWon(q.e.low), h('span', {text: ' · 지금 '}), jWon(q.e.now))
            : h('span', {class: 'sj-j3v', text: '잃은 날 ' + q.r.n + '번 중 ' + q.r.lose + '번'})),
        h('i', {'aria-hidden': 'true', text: '›'}))))),
    h('a', {class: 'sj-jlink', href: '#/k'}, h('span', {text: '서른여섯 꾀 모두 보기'}), h('i', {'aria-hidden': 'true', text: '›'})));
  sec.removeAttribute('data-wait');
}
/** 사기 전에 멈춤 — 첫 화면에서 가장 큰 단추(본질 2 「주식을 사기 전에 한 번 멈추게 한다」 · 「왜 사?」 열한 질문) */
function jStop(lc) {
  return h('section', {class: 'sj-sec sj-jst', 'aria-label': '사기 전에 멈춤'},
    h('p', {class: 'sj-jk', text: '사기 전에'}),
    h('h2', {class: 'sj-jstt', text: '사려는 회사가 있나요?'}),
    h('p', {class: 'sj-jsts', text: '「왜 사?」 열한 가지를 하나씩 물어볼게요. 내 이유가 먼저예요.'}),
    h('a', {class: 'sj-jbtn', href: lc ? '#/q/' + lc : '#/q', text: '멈추고 물어보기'}));
}
/** 오늘의 한 줄(옛 「오늘의 꾀 한 장」 셋째 장 · 주문 1126-1249) — 오늘 시장 글의 손자 말 · 없으면 격언 열 가지의 손자 말(날짜로 하나) · 「오늘 더 보기」 맨 끝 */
function jWord(T) {
  const x = okSun(T.sun) ? T.sun : null, M = MIND10[((Number(String(x?.day ?? T.asOf?.board ?? '').slice(8, 10)) || 1) - 1) % MIND10.length];
  const qt = typeof x?.quote === 'string' ? {q: x.quote, p: x.pian ?? ''} : M ? {q: M.quote, p: M.pian} : null;
  return qt ? h('section', {class: 'sj-sec sj-jword', 'aria-label': '오늘의 한 줄'}, h('p', {class: 'sj-jk', text: '오늘의 한 줄'}), h('p', {class: 'sj-jwq', text: '「' + qt.q + '」'}), h('p', {class: 'sj-jwp', text: '손자병법 ' + qt.p})) : null;
}
/** 오늘 더 보기 — 인사 · 오늘의 기업 · 투자 점검(주문 1126-1544 — 지우지 않고 한 번 더 누르면 · 샘플 1) */
function jMore(...kids) {
  return h('details', {class: 'sj-drawer sj-jmore'}, h('summary', {}, h('span', {class: 'sj-s1', text: '오늘 더 보기'}), h('span', {class: 'sj-s2', text: '인사 · 오늘의 기업 · 투자 점검 · 오늘의 한 줄'}), chev()), ...kids);
}
export async function vSonja(X, shell = null) {
  const [{S}, T] = await Promise.all([X.base(), load21(X.get)]);
  if (!T) return null;
  const wait = trickWait(T);
  const dd = mday((okSun(T.sun) ? T.sun.day : null) ?? T.asOf?.board), body = [sunSec(T), wait, moreBox(S), endSec(T, S)];
  const keep = !!shell?.main?.isConnected, main = keep ? shell.main : h('main', {class: 'sj-page', 'data-page': 'sonja', 'data-wait': ''}, cover(null)); // data-wait — 꾀 칸을 채우면 뗌(검사가 기다림)
  main.setAttribute('data-board', T.asOf?.board ?? ''); main.setAttribute('data-wait', '');
  if (!main.querySelector(':scope > section.sj-mind')) main.prepend(mindSec());
  { const gl = main.querySelector(':scope > section.sj-mind ol.sj-gkl'); if (gl && !gl.parentElement.querySelector(':scope > button.sj-f7b')) { const [, b] = fold7(gl, (o, n) => '나머지 격언 ' + (n - o) + '가지 더 보기', 1); if (b) gl.after(b); } } // 격언 열 가지 = 맨 위 그대로 · 첫째만 보이고 「더 보기」(주문 1127-2148 · 사장님 21:48 「어그래」) — 먼저 칠한 판(index.html)도 data-fold=1 로 같은 꼴
  { // 잡스 판 차례(주문 1128-0755) — 오늘 → 격언 → 오늘의 땅 → 오늘의 꾀 → 덜 잃은 꾀 셋 → 사기 전에 멈춤 → 안전 한 줄 → 오늘 더 보기 → 표지 → 그 아래 그대로
    for (const e of main.querySelectorAll(':scope > section.sj-hero, :scope > section.sj-greet, :scope > section.sj-coday, :scope > section.sj-todo, :scope > .sj-jh, :scope > .sj-jl, :scope > .sj-jkk, :scope > .sj-j3, :scope > .sj-jst, :scope > .sj-jsafe, :scope > .sj-jmore')) e.remove();
    const kk = jKkoe(T), mind = main.querySelector(':scope > section.sj-mind');
    main.prepend(jHead());
    const J = [jLand(T, mktLine(T)), kk, jTop3Wait(), jStop(X.cur?.()?.code ?? null), h('p', {class: 'sj-safe sj-jsafe', text: SAFE}), jMore(greetSec(), coDaySec(kk.dataset.k ?? null), todoSec(), jWord(T))];
    if (mind) mind.after(...J); else main.querySelector(':scope > .sj-jh').after(...J);
  }
  const step = main.querySelector(':scope > .sj-cover .sj-step'); if (step && dd && !step.querySelector('.sj-stepd')) step.append(stepDay(dd));
  const aw = main.querySelector(':scope > .sj-cover .sj-artw'); if (aw && !aw.querySelector(':scope > svg.sj-artfx')) aw.insertBefore(coverFilm(), aw.querySelector(':scope > .sj-hwa')); // 표지 영화 덧칠(주문 1116-2310 — 안개 · 새 · 금빛 반짝임 · 빛 한 줄기 11초)
  main.querySelector(':scope > .sj-cover > .sj-tc')?.remove(); // 오늘 시장 · 세 태세 칸(오늘 한 장 · 주문 1120-0001 · 1120-0728)을 지움 — 주문 1126-1748 사장님 17:48 「지금 첫번째 구역은 헷갈린다 삭제 하라」(먼저 칠한 옛 판의 자리도 뗌)
  // 손자병법 한 폭(주문 1119-1648 · 첫 화면 가운데 산수 그림 · 번호 여섯 · 풀이 여섯)은 지움 — 주문 1120-2116 · 사장님 2026-11-21(마카오) 00:19 「두번째 그림은 다 지워줘」 · 00:24 「뒤에 있는 배경은 그대로 두고 첫 화면 중간에 있는 그림 지우면 돼」(뒤 배경 su-bg.svg 는 그대로)
  main.append(...body.filter(e => e != null)); // 꾀 칸 자료가 없는 날 wait = null — append 가 「null」 글로 붙이지 않게
  const hardOf = () => { const c = main.cloneNode(true); for (const e of c.querySelectorAll('svg, [aria-hidden="true"], [data-proper]')) e.remove(); const left = hardLeft(c.textContent ?? '', []); main.dataset.hard = String(left.length); main.dataset.hardWords = left.join(','); main.dataset.glossed = ''; };
  hardOf();
  const after = async () => { // 꾀 칸(su21-s36.json) — 첫 칠함 뒤에 받아 채움 · 오늘의 기업도 같은 자료로(주문 1126-1544)
    const g = wait ? await X.get(D36).catch(() => null) : null, G = ok36(g, T) ? g : null; // 꾀 칸 자료가 없는 날(s36n 없음)은 부르지 않음 — 없는 파일을 부르면 화면 오류(미리 보기 sonja-today4 1/11)
    if (!main.isConnected) return;
    coDayFill(main.querySelector('section.sj-coday'), G); // 오늘 더 보기 안(잡스 판)
    jRecFill(main.querySelector(':scope > section.sj-jkk'), G); jTop3Fill(main.querySelector(':scope > section.sj-j3'), G, T);
    if (wait?.isConnected) { if (G) wait.replaceWith(trickSec(G, T)); else wait.remove(); }
    hardOf(); main.removeAttribute('data-wait');
  };
  const dock = dockNav(1, nextOf(T)), tabs = tabNav(0, X.cur?.()?.code ?? null); // 응원 한 줄 · 지금 시장 한 줄은 main 안(잡스 판 — 오늘 · 오늘의 땅)
  if (keep) for (const e of main.parentElement?.querySelectorAll(':scope > .sj-mkt, :scope > .sj-cheer') ?? []) e.remove();
  return {title: '오늘', keep, dom: [keep ? shell.top : topBar(), main, dock, tabs], rest: [dock, tabs], after}; // keep = 먼저 칠한 판에 이어 붙임(su.js 는 rest 만 붙임)
}
