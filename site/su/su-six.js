/* 수르 — 육하원칙 엔진 + 「그래서 무슨 뜻」 + 전문가 숫자(빈 파일에서 새로 씀 · 주문 1807)
   사장님 2026-11-04 13:07(+04) [안쪽 엔진] 「엔진은 육하원칙 칸으로 짜라 · 값마다 누가·언제·어디서 · 무엇을·어떻게·왜 · 빈 칸은 「확인 필요」」
   [쉬운 말과 전문가 정보] 「5. 정보는 전문가 수준으로 넣어라 6. 숫자는 공식 자료와 원문에서만 가져와라 7. 숫자마다 「그래서 무슨 뜻」을 붙여라
   8. 쉽게 하려고 정보를 빼지 마라 9. 전문가용 자세한 값은 눌러야 열리게 해라」(원문 docs/design/su-easy-2026-11-04/order-1807.txt)
   값 하나 = {v, v2, unit, label, six: 여섯 칸, mean: 그래서 무슨 뜻(학생 말 한 줄)} · 쪽 하나 = {big, mids, rows, say(기승전결 넷), pro(전문가 숫자 — 이름 · 값 · 셈과 출처)}
   숫자는 모두 자료(네이버 증권 종가로 수르가 센 기록) 그대로 · 뜻 줄의 셈은 100 빼기 · 100 더하기 같은 한 걸음만 · 빈 칸은 null → 화면 「확인 필요」 */
import {pct, moreLess, dateKo, jo} from './su-data.js';

export const SIX = Object.freeze(['누가', '언제', '어디서', '무엇을', '어떻게', '왜']);
export const NEED = '확인 필요';
let BRAND = '수르';
export function brand(n) { if (typeof n === 'string' && n) BRAND = n; }
const fin = v => typeof v === 'number' && Number.isFinite(v);
const str = v => (typeof v === 'string' && v.trim() ? v.trim() : null);
const KN = ['영', '하나', '둘', '셋', '넷', '다섯', '여섯', '일곱', '여덟', '아홉', '열'];
export const kn = n => KN[n] ?? String(n);
const KC = ['영', '한', '두', '세', '네', '다섯', '여섯', '일곱', '여덟', '아홉', '열'];
export const kc = n => KC[n] ?? String(n);
const ORD = ['', '첫째', '둘째', '셋째', '넷째', '다섯째', '여섯째', '일곱째', '여덟째', '아홉째', '열째'];
export const num = n => (fin(n) ? n.toLocaleString('ko-KR') : null);
const r0 = v => (fin(v) ? Math.round(v) : null);
const r1 = v => (fin(v) ? Math.round(v * 10) / 10 : null);

export function six(c = {}) { return Object.freeze(Object.fromEntries(SIX.map(k => [k, str(c?.[k])]))); }
export const holes = s => SIX.filter(k => !s?.[k]);
/** 값 하나 — 값이 숫자가 아니면 null(화면 「확인 필요」) · mean = 그래서 무슨 뜻 */
export function val(v, unit, label, cells, extra = {}) {
  const t = v == null || v === '' || (typeof v === 'number' && !Number.isFinite(v)) ? null : (typeof v === 'number' ? num(v) : String(v));
  return Object.freeze({v: t, unit: unit ?? '', label: str(label) ?? '', six: six(cells), mean: str(extra.mean) ?? null, ...extra});
}
/** 전문가 숫자 한 줄 — k 이름 · v 값(자료 그대로) · how 셈과 출처 */
const P = (k, v, how) => ({k, v: v == null || (typeof v === 'number' && !Number.isFinite(v)) ? NEED : typeof v === 'number' ? num(v) : String(v), how: how ?? null});
export function ymd(d) { const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(d ?? '')); return m ? `${m[1]}년 ${+m[2]}월 ${+m[3]}일` : null; }
export function ym(d) { const m = /^(\d{4})-(\d{2})/.exec(String(d ?? '')); return m ? `${m[1]}년 ${+m[2]}월` : null; }
const day = d => { const t = dateKo(d); return t === '?' ? null : t; };
const span = (a, b) => (ymd(a) && ymd(b) ? ymd(a) + '부터 ' + ymd(b) + '까지' : null);
const recOk = r => r && fin(r.rate) && fin(r.base);
const SRC = '네이버 증권 그날 마지막 값으로 ' + '수르가 셈';
const BLOOM_HOW = '그날 고른 회사가 한 달 뒤 시장보다 5% 넘게 더 올랐는지 셈';
/** 뜻 줄 — 100번에 a번 대 b번 */
function vsMean(a, b, who, n = null, short = false) { // short — 바로 위 이름표가 「대 아무 회사」를 말할 때(큰 값) 「아무 회사보다」를 뺌 // n = 센 수 — 30번보다 적으면 「이 숫자만 믿기 어렵다」(시안 3 장점)
  if (!fin(a) || !fin(b)) return null;
  const A = r0(a), B = r0(b), miss = 100 - A;
  const than = short ? '' : '아무 회사보다 ';
  return (A > B ? who + '가 ' + than + '꽃이 더 자주 됐어요.' : A < B ? who + '가 ' + than + '꽃이 덜 자주 됐어요.' : who + '와 아무 회사가 같았어요.')
    + (A > B ? ' 그래도' : ' 그리고') + ' 100번에 ' + miss + (short ? '번은 못 됐어요.' : '번은 꽃이 못 됐어요.')
    + (fin(n) && n > 0 && n < 30 ? ' 센 수가 ' + n + '번뿐이라 이 숫자만 믿기는 어려워요.' : '');
}
/** 셈을 그대로 — 전문가가 다시 셀 수 있게(시안 5 장점) */
const r2 = x => Math.round(x * 100) / 100;
const calc = (a, b, how, stated = null) => (fin(a) && fin(b) && b > 0 ? num(a) + ' ÷ ' + num(b) + ' × 100 = ' + r2(100 * a / b) + (fin(stated) ? (Math.abs(r2(100 * a / b) - stated) < 0.006 ? ' · 자료 값과 ✓ 맞음' : ' · 자료 값 ' + stated + '과 다름 · 확인 필요') : '') + ' · ' + how : how); // 시안 11 — 셈이 자료와 맞는지
/** 뜻 줄 — 한 달 줄(처음 = 100)의 끝 값 */
const lineMean = (last, who) => (fin(last) ? '한 달 전 ' + jo(who, '의') + ' 값이 100원이었다면 지금 ' + r1(100 + last) + '원이라는 뜻이에요.' : null); // 용돈 말(시안 1 장점)
const jo2 = (w, p) => (p === '의' ? w + '의' : jo(w, p));

/* ── 1 오늘(기) ── */
export function eHome({S, B, bl, mo, asOf}) {
  const d = ymd(asOf), cs = bl?.say ?? [], hon = B?.honest, pick = bl?.mode === 'pick', near = bl?.mode === 'near', n = pick ? bl.rows.length : 0, coN = S?.coN;
  const big = val(n, '곳', '오늘 꽃 조건에 모두 맞은 회사', {누가: BRAND, 언제: d && d + ' 자료', 어디서: fin(coN) ? '코스피 · 코스닥 회사 ' + num(coN) + '곳 가운데' : '코스피 · 코스닥',
    무엇을: '이달 꽃 조건 ' + kc(cs.length) + ' 가지에 모두 맞은 회사를 셌어요', 어떻게: '조건을 하나씩 대어 보고 모두 맞은 회사만 남겼어요',
    왜: recOk(hon) ? '지난 기록에서 조건에 맞은 회사가 100번에 ' + r0(hon.rate) + '번 꽃이 됐어요' : null},
    {mean: n ? '오늘 조건에 다 맞은 회사가 ' + n + '곳 있다는 뜻이에요. 그래도 지난 기록에서 셋 가운데 둘은 꽃이 못 됐어요.' : '오늘은 조건에 다 맞은 회사가 없다는 뜻이에요. 서두를 까닭이 없어요.'});
  const mids = [
    near ? val(bl.rows.length, '곳', '조건에 가장 가까운 회사', {누가: bl.rows.map(r => r.name).join(' · '), 언제: d, 어디서: '조건에 다 맞은 회사가 없는 날', 무엇을: '이달 꽃 조건 가운데 하나만 못 맞았어요',
      어떻게: bl.miss ? '못 맞은 조건은 「' + bl.miss + '」예요' : null, 왜: recOk(bl.rec) ? '이런 회사는 지난 기록에서 100번에 ' + r0(bl.rec.rate) + '번 꽃이 됐어요' : null},
      {mean: '조건 하나만 못 맞은 회사가 ' + bl.rows.length + '곳이라는 뜻이에요. ' + jo(BRAND, '이') + ' 고른 회사는 아니에요.'}) : null,
    recOk(hon) ? val(r0(hon.rate), '번', '100번에 꽃 · 조건에 맞은 회사 대 아무 회사', {누가: '꽃 조건에 맞았던 회사', 언제: span(hon.from, hon.to), 어디서: '코스피 · 코스닥',
      무엇을: num(hon.n) + '번 가운데 ' + num(hon.hits) + '번 꽃이 됐어요', 어떻게: '아무 회사나 고르면 100번에 ' + r0(hon.base) + '번이었어요',
      왜: fin(hon.up) && fin(hon.scored) ? '센 ' + hon.scored + '달 가운데 ' + hon.up + '달은 나았고 ' + hon.down + '달은 못했어요' : null}, {v2: String(r0(hon.base)), mean: vsMean(hon.rate, hon.base, '조건에 맞은 회사', hon.n)}) : null,
    val(mo?.length ?? 0, '곳', '돈이 몰린 업종의 대장', {누가: (mo ?? []).map(r => r.name).join(' · ') || null, 언제: d && d + '까지 한 달', 어디서: (mo ?? []).map(r => r.ind).join(' · ') || null,
      무엇을: '시장보다 더 오른 업종에서 회사 크기가 가장 많이 는 회사예요', 어떻게: mo?.[0] ? mo[0].ind + ' 업종이 시장보다 ' + moreLess(mo[0].x) + ' 올랐어요' : null, 왜: mo?.[0]?.why?.line ?? null},
      {mean: '돈이 몰린 업종이 ' + (mo?.length ?? 0) + '곳 있었다는 뜻이에요. 앞으로 오른다는 뜻은 아니에요.'})].filter(Boolean);
  const rows = cs.map((t, i) => { const ok = near ? t !== bl.miss : pick ? true : null;
    return val(ok == null ? null : ok ? '맞음' : '못 맞음', '', t, {누가: '이달 꽃 조건 ' + (ORD[i + 1] ?? i + 1), 언제: ym(B?.today?.rule?.month), 어디서: '코스피 · 코스닥', 무엇을: t,
      어떻게: near ? (ok ? '가까운 회사가 맞았어요' : '가까운 회사가 못 맞았어요') : pick ? '고른 회사가 모두 맞았어요' : null,
      왜: ym(B?.today?.rule?.decided) ? ym(B.today.rule.decided) + '에 지난 기록으로 정한 조건이에요' : null},
      {mean: ok == null ? '오늘은 이 조건을 맞춰 볼 회사가 없어요.' : ok ? '오늘 가까운 회사들이 이 조건은 맞았다는 뜻이에요.' : '이 조건 하나 때문에 꽃 조건 회사가 못 됐다는 뜻이에요.'}); });
  const say = [jo(BRAND, '은') + ' 오늘 코스피 · 코스닥 회사' + (fin(coN) ? ' ' + num(coN) + '곳' : '') + '을 꽃 조건에 대어 봤어요.',
    pick ? n + '곳이 조건 ' + kn(cs.length) + '에 모두 맞았어요.' : near ? '모두 맞은 회사는 없어요. 가장 가까운 회사는 ' + bl.rows.length + '곳이에요.' : '오늘은 조건에 맞은 회사가 없어요.',
    recOk(hon) ? '그런데 조건에 맞아도 100번에 ' + r0(hon.rate) + '번만 꽃이 됐어요. 아무 회사는 ' + r0(hon.base) + '번이었어요.' : '그런데 지난 기록을 아직 못 셌어요.',
    '그래서 서두르지 말고 한 회사씩 봐요.'];
  const pro = [P('셀 수 있던 회사', coN, '코스피 · 코스닥 · 자료 ' + (d ?? NEED)), P('이달 조건 이름', B?.today?.rule?.id, '조건을 정한 달 ' + (ym(B?.today?.rule?.decided) ?? NEED)),
    P('꽃 조건에 모두 맞은 회사', n, '오늘 자료'), near ? P('가까운 회사 조건', B?.near?.rule?.atom, '못 맞은 조건의 선 ' + (fin(B?.near?.rule?.min) ? B.near.rule.min : NEED)) : null,
    ...honestPro(hon)].filter(Boolean);
  return {big, mids, rows, say, pro};
}
/** 정직한 기록 숫자 모두(전문가) */
function honestPro(hon) {
  if (!hon) return [P('지난 기록', null, null)];
  return [P('센 기간', span(hon.from, hon.to), '한 달 뒤가 다 지난 날까지'), P('고른 횟수', hon.n, '조건에 맞은 회사 × 날'), P('꽃이 된 횟수', hon.hits, BLOOM_HOW),
    P('100번에 꽃', r1(hon.rate), calc(hon.hits, hon.n, '꽃이 된 횟수 ÷ 고른 횟수 × 100', hon.rate)), P('아무 회사 100번에 꽃', r1(hon.base), calc(hon.baseHits, hon.baseN, '같은 날 셀 수 있던 모든 회사로 같은 셈', hon.base)),
    P('아무 회사 센 수', hon.baseN, '회사 × 날'), P('아무 회사 꽃', hon.baseHits, BLOOM_HOW), P('센 거래일', hon.days, '주식 시장이 열린 날'), P('고른 회사가 있던 날', hon.pickDays, '거래일 가운데'),
    P('센 달 · 나은 달 · 못한 달', fin(hon.scored) ? hon.scored + ' · ' + hon.up + ' · ' + hon.down : null, '아무 회사와 달마다 견줌')];
}

/* ── 2 회사(승) ── */
export function eCo({co, rs = [], cl = null, il = null, asOf, rec = null, bl = null}) {
  const r = rs[0] ?? null, c = cl && cl.length >= 2 ? cl[cl.length - 1] - 100 : null, i = il && il.line?.length >= 2 ? il.line[il.line.length - 1] - 100 : null;
  const mk = co.market === 'KOSDAQ' ? '코스닥' : co.market === 'KOSPI' ? '코스피' : null, from = il?.from ?? null, to = il?.to ?? asOf, where = [mk, co.ind ? co.ind + ' 업종' : null].filter(Boolean).join(' ') || null;
  const why = r?.kind === 'pick' ? '이달 꽃 조건에 모두 맞아서 여기 있어요' : r?.kind === 'near' ? (r.no?.[0] ? '「' + r.no[0] + '」 조건 하나만 못 맞아 가까운 회사로 여기 있어요' : null)
    : r?.kind === 'money' ? (r.why?.line ?? r.ind + ' 업종에 돈이 몰려서 여기 있어요') : null;
  const big = val(c != null ? pct(c) : null, '', '한 달 동안 움직인 만큼', {누가: co.name, 언제: span(from, to), 어디서: where, 무엇을: c != null ? '한 달 동안 ' + pct(c) + ' 움직였어요' : null,
    어떻게: i != null ? '같은 때 ' + jo(il.name, '은') + ' ' + pct(i) + ' 움직였어요' : null, 왜: why}, {mean: lineMean(c, co.name)});
  const mids = [
    val(i != null ? pct(i) : null, '', (il?.name ?? '시장') + ' 한 달', {누가: il?.name ?? null, 언제: span(from, to), 어디서: mk, 무엇을: i != null ? '한 달 동안 ' + pct(i) + ' 움직였어요' : null,
      어떻게: '이 회사와 같은 날들로 셌어요', 왜: '회사 움직임을 시장과 견주려고 함께 봐요'},
      {mean: c != null && i != null ? (c > i ? '이 회사가 시장보다 더 올랐다는 뜻이에요.' : c < i ? '이 회사가 시장보다 더 내렸다는 뜻이에요.' : '이 회사와 시장이 같이 움직였다는 뜻이에요.') : null}),
    r?.kind === 'pick' || r?.kind === 'near' ? val((r.ok?.length ?? 0) + ' / ' + ((r.ok?.length ?? 0) + (r.no?.length ?? 0)), '', '맞은 꽃 조건', {누가: co.name, 언제: day(asOf), 어디서: where,
      무엇을: '이달 꽃 조건 ' + kn((r.ok?.length ?? 0) + (r.no?.length ?? 0)) + ' 가운데 ' + kn(r.ok?.length ?? 0) + '에 맞았어요', 어떻게: r.no?.[0] ? '못 맞은 조건은 「' + r.no[0] + '」예요' : '못 맞은 조건이 없어요', 왜: why},
      {mean: r.no?.length ? '조건 하나가 모자라 수르가 고른 회사는 아니라는 뜻이에요.' : '조건에 다 맞았다는 뜻이에요. 그래도 꽃이 된다는 뜻은 아니에요.'})
      : r?.kind === 'money' ? val(moreLess(r.x), '', r.ind + ' 업종 · 시장보다', {누가: r.ind + ' 업종', 언제: day(asOf) && day(asOf) + '까지 한 달', 어디서: mk, 무엇을: '한 달 동안 시장보다 ' + moreLess(r.x) + ' 올랐어요',
        어떻게: jo(co.name, '은') + ' 이 업종의 대장이에요', 왜: r.why?.line ?? null}, {mean: '이 회사가 있는 업종에 한 달 동안 돈이 몰렸다는 뜻이에요. 앞으로 오른다는 뜻은 아니에요.'}) : null,
    recOk(rec) ? val(r0(rec.rate), '번', '지난 기록 · 100번에 꽃이 된 횟수', {누가: r?.kind === 'pick' ? '조건에 맞았던 회사' : '조건에 가까웠던 회사', 언제: '지난 기록', 어디서: '코스피 · 코스닥',
      무엇을: (fin(rec.n) ? rec.n + '번 가운데 ' : '') + (fin(rec.hits) ? rec.hits + '번 꽃이 됐어요' : '꽃이 된 횟수를 셌어요'), 어떻게: '아무 회사는 100번에 ' + r0(rec.base) + '번이었어요', 왜: null},
      {v2: String(r0(rec.base)), mean: vsMean(rec.rate, rec.base, r?.kind === 'pick' ? '조건에 맞았던 회사' : '조건에 가까웠던 회사', rec.n)}) : null].filter(Boolean);
  const say = [jo(co.name, '은') + ' ' + (where ? where + ' 회사예요.' : '이런 회사예요.'),
    c != null ? '한 달 동안 ' + pct(c) + ' 움직였어요.' + (i != null ? ' 같은 때 ' + jo(il.name, '은') + ' ' + pct(i) + '였어요.' : '') : '한 달 움직임을 아직 못 받았어요.',
    r?.kind === 'near' && r.no?.[0] ? '그런데 「' + r.no[0] + '」 조건은 못 맞았어요.' : r?.kind === 'money' ? '그런데 돈이 몰린 것은 지난 한 달의 일이에요.' : r?.kind === 'pick' ? '그런데 조건에 맞아도 꽃이 안 된 적이 더 많았어요.' : '그런데 오늘 두 목록에는 없는 회사예요.',
    '그래서 이 회사가 있는 업종을 함께 봐요.'];
  const pro = [P('회사 번호', co.code, '한국거래소 종목 번호'), P('시장', mk, null), P('업종', co.ind, '네이버 증권 업종'), P('한 달 줄 처음 · 끝', cl ? '100 · ' + r1(cl[cl.length - 1]) : null, '처음 날을 100으로 · ' + SRC),
    P('시장 한 달 줄 처음 · 끝', il ? '100 · ' + r1(il.line[il.line.length - 1]) : null, (il?.name ?? '지수') + ' · 같은 날들'), P('센 날', span(from, to), null),
    r?.kind === 'near' ? P('업종이 시장보다(한 달)', fin(r.ix) ? r1(r.ix) : null, '넘어야 할 선 ' + (fin(bl?.min) ? bl.min : NEED)) : null,
    r?.kind === 'money' ? P('업종이 시장보다(한 달)', r1(r.x), '돈이 몰린 업종 셈') : null,
    recOk(rec) ? P('기록 고른 횟수 · 꽃', rec.n + ' · ' + rec.hits, BLOOM_HOW) : null].filter(Boolean);
  return {big, mids, rows: [], say, why, pro};
}

/* ── 조건 줄(회사 쪽 자세한 값) ── */
export function eCondRows({co, bl, rs = [], asOf, B}) {
  const r = rs[0] ?? null, cs = bl?.say ?? [], pick = r?.kind === 'pick', near = r?.kind === 'near', d = ymd(asOf);
  return cs.map(t => { const ok = pick || (near && (r.ok ?? []).includes(t));
    return val(ok ? '맞음' : near ? '못 맞음' : null, '', t, {누가: co?.name ?? null, 언제: d, 어디서: co?.ind ? co.ind + ' 업종' : null, 무엇을: t,
      어떻게: ok ? '그날 자료로 맞았어요' : near ? '그날 자료로 못 맞았어요' : null, 왜: ym(B?.today?.rule?.month) ? ym(B.today.rule.month) + ' 꽃 조건이에요' : null},
      {mean: ok ? '이 조건은 넘었다는 뜻이에요.' : near ? '이 조건이 모자랐다는 뜻이에요.' : '이 회사는 오늘 꽃 조건 목록에 없어요.', ok}); });
}

/* ── 3 업종(승) ── */
export function eInd({name, x = null, wy = null, rows = [], asOf, cur = null, min = null}) {
  const known = rows.filter(r => fin(r.c)), up = known.filter(r => r.c > 0).length, d = day(asOf);
  const big = val(fin(x) ? moreLess(x) : rows.length, fin(x) ? '' : '곳', fin(x) ? '한 달 동안 시장보다' : '이 업종 회사', {누가: name + ' 업종', 언제: d && d + '까지 한 달', 어디서: '코스피 · 코스닥',
    무엇을: fin(x) ? '한 달 동안 시장보다 ' + moreLess(x) + ' 올랐어요' : '회사 ' + rows.length + '곳이에요', 어떻게: known.length ? '값을 아는 회사 ' + known.length + '곳 가운데 ' + up + '곳이 올랐어요' : null, 왜: wy?.line ?? null},
    {mean: fin(x) ? (x >= 0 ? '이 업종이 한 달 동안 시장보다 더 올랐다는 뜻이에요.' : '이 업종이 한 달 동안 시장보다 덜 올랐다는 뜻이에요.') + (fin(min) && x < min ? ' 꽃 조건의 선 ' + min + '에는 못 미쳤어요.' : '') : null});
  const mids = [
    val(rows.length, '곳', '이 업종 회사', {누가: name + ' 업종', 언제: d, 어디서: '코스피 · 코스닥', 무엇을: '회사 ' + rows.length + '곳이 있어요', 어떻게: '업종 이름이 같은 회사를 모두 셌어요', 왜: null},
      {mean: '하는 일이 비슷한 회사가 ' + rows.length + '곳 모여 있다는 뜻이에요.'}),
    known.length ? val(up, '곳', '한 달 동안 오른 회사', {누가: name + ' 업종 회사', 언제: d && d + '까지 한 달', 어디서: null, 무엇을: known.length + '곳 가운데 ' + up + '곳이 올랐어요', 어떻게: '한 달 움직임을 하나씩 봤어요', 왜: null},
      {mean: up * 2 >= known.length ? '이 업종에서 오른 회사가 절반이 넘는다는 뜻이에요.' : '이 업종에서 오른 회사가 절반이 안 된다는 뜻이에요.'}) : null,
    cur && fin(cur.c) ? val(pct(cur.c), '', '보던 회사 · ' + cur.name, {누가: cur.name, 언제: d && d + '까지 한 달', 어디서: name + ' 업종', 무엇을: '한 달 동안 ' + pct(cur.c) + ' 움직였어요', 어떻게: '업종 안 다른 회사와 같은 잣대예요', 왜: null},
      {mean: lineMean(cur.c, cur.name)}) : null].filter(Boolean);
  const top = rows.slice(0, 12).map(r => val(fin(r.c) ? pct(r.c) : null, '', r.name, {누가: r.name, 언제: d && d + '까지 한 달', 어디서: name + ' 업종', 무엇을: fin(r.c) ? '한 달 동안 ' + pct(r.c) + ' 움직였어요' : null, 어떻게: '많이 오른 차례예요', 왜: null},
    {code: r.code, c: r.c, mean: lineMean(r.c, r.name)}));
  const say = [name + ' 업종 회사 ' + rows.length + '곳이에요.', fin(x) ? '한 달 동안 시장보다 ' + moreLess(x) + ' 올랐어요.' : known.length ? '한 달 동안 ' + up + '곳이 올랐어요.' : '한 달 움직임을 아직 못 받았어요.',
    known.length - up > 0 ? '그런데 ' + (known.length - up) + '곳은 오르지 못했어요.' : '그런데 업종이 올랐다고 회사마다 꽃이 되지는 않았어요.', '그래서 지난 기록을 함께 봐요.'];
  const pro = [P('업종이 시장보다(한 달)', fin(x) ? r1(x) : null, '업종 회사들의 한 달 움직임 ÷ 시장 · ' + SRC), P('업종 회사 수', rows.length, '업종 이름이 같은 회사'), P('값을 아는 회사', known.length, null),
    P('한 달 동안 오른 회사', known.length ? up : null, null), fin(min) ? P('꽃 조건의 선(업종)', min, '이달 조건') : null, P('돈이 몰린 까닭(자료)', wy?.items?.length ? wy.items.length + '가지' : null, '외국인 · 기관 · 소식 자료')].filter(Boolean);
  return {big, mids, rows: top, say, pro};
}

/* ── 4 기록 한곳(전) ── */
export function eHub({B, mine = [], lastDay = null}) {
  const hon = B?.honest, all = B?.record?.all, n = mine.length;
  const big = val(recOk(hon) ? r0(hon.rate) : null, '번', '100번에 꽃 · 조건에 맞은 회사 대 아무 회사', {누가: '꽃 조건에 맞았던 회사', 언제: span(hon?.from, hon?.to), 어디서: '코스피 · 코스닥',
    무엇을: fin(hon?.n) ? num(hon.n) + '번 가운데 ' + num(hon.hits) + '번 꽃이 됐어요' : null, 어떻게: recOk(hon) ? '같은 날 아무 회사나 고르면 100번에 ' + r0(hon.base) + '번이었어요' : null,
    왜: fin(hon?.up) ? '센 ' + hon.scored + '달 가운데 ' + hon.up + '달은 나았고 ' + hon.down + '달은 못했어요' : null}, {v2: recOk(hon) ? String(r0(hon.base)) : null, mean: vsMean(hon?.rate, hon?.base, '조건에 맞은 회사', hon?.n, true)});
  const mids = [
    fin(hon?.scored) ? val(hon.up + ' · ' + hon.down, '달', '나았던 달 · 못했던 달', {누가: '꽃 조건에 맞았던 회사', 언제: span(hon.from, hon.to), 어디서: '코스피 · 코스닥', 무엇을: '달마다 아무 회사와 견줬어요', 어떻게: '한 달이 다 지난 달만 셌어요', 왜: null},
      {mean: (t10 => '열 달이면 ' + kc(t10) + ' 달쯤은 나았고 ' + kc(10 - t10) + ' 달쯤은 못했다는 뜻이에요. 늘 나은 것은 아니에요.')(Math.round(10 * hon.up / Math.max(1, hon.up + hon.down)))}) : null,
    fin(B?.why?.all?.miss) ? val(B.why.all.miss, '번', '꽃이 못 된 횟수', {누가: '꽃 조건에 맞았던 회사', 언제: span(hon?.from, hon?.to), 어디서: '코스피 · 코스닥', 무엇을: '한 달 뒤 꽃이 못 됐어요', 어떻게: '못 된 까닭을 셋으로 나눠 셌어요', 왜: null},
      {mean: fin(hon?.n) ? '고른 ' + num(hon.n) + '번 가운데 더 많은 쪽이 꽃이 못 됐다는 뜻이에요.' : null}) : null,
    val(n, '번', '내 매매일지', {누가: '나', 언제: n && ymd(lastDay) ? ymd(lastDay) + '이 마지막' : null, 어디서: '이 휴대폰', 무엇을: n ? '「왜 사?」 열한 질문에 ' + n + '번 답했어요' : '아직 답한 적이 없어요', 어떻게: '답은 이 휴대폰에만 남아요', 왜: null},
      {mean: n ? '사기 전에 ' + n + '번 멈췄다는 뜻이에요.' : '아직 사기 전에 멈춘 기록이 없다는 뜻이에요.'})].filter(Boolean);
  const say = ['지난 기록을 한곳에 모았어요. 꽃 지난 기록과 내 매매일지예요.', recOk(hon) ? '조건에 맞은 회사는 100번에 ' + r0(hon.rate) + '번 꽃이 됐어요. 아무 회사는 ' + r0(hon.base) + '번이었어요.' : '지난 기록을 아직 못 셌어요.',
    fin(hon?.down) ? '그런데 ' + hon.down + '달은 아무 회사보다 못했어요.' : '그런데 지난 기록이 앞날을 정해 주지는 않아요.', '그래서 달마다, 날마다, 못 된 까닭까지 하나씩 봐요.'];
  const pro = [...honestPro(hon),
    P('모든 날 기록 · 고른 횟수', all?.n, '2023년부터 · 모든 날'), P('모든 날 · 100번에 꽃', r1(all?.rate), calc(all?.hits, all?.n, '꽃이 된 횟수 ÷ 고른 횟수 × 100', all?.rate)), P('모든 날 · 아무 회사', r1(all?.base), calc(all?.baseHits, all?.baseN, '같은 날 셀 수 있던 모든 회사로 같은 셈', all?.base)),
    P('고른 회사가 시장보다 더 오른 평균', fin(all?.ex) ? r1(all.ex) : null, '한 달 · 회사마다 위아래 50에서 자름 · 시장보다 몇 만큼'), P('아무 회사가 시장보다 더 오른 평균', fin(all?.exBase) ? r1(all.exBase) : null, '같은 셈'),
    P('100번에 시장보다 5 넘게 덜 오름', fin(all?.fall) ? r1(all.fall) : null, '한 달 뒤 · 고른 회사'), P('아무 회사 · 100번에 5 넘게 덜 오름', fin(all?.fallBase) ? r1(all.fallBase) : null, '같은 셈'),
    P('plain(뜻 확인 필요)', fin(all?.plain) ? r1(all.plain) + ' · ' + num(all.plainN) : null, '자료 이름만 있고 뜻이 적혀 있지 않음'), P('old(뜻 확인 필요)', fin(all?.old) ? r1(all.old) + ' · ' + num(all.oldN) : null, '자료 이름만 있고 뜻이 적혀 있지 않음')];
  return {big, mids, rows: [], say, all, pro};
}

/* ── 5 달마다 ── */
export function eMonths({B}) {
  const any = (Array.isArray(B?.months) ? B.months : []).filter(m => m?.rec && fin(m.rec.rate) && fin(m.rec.base)), ms = any.filter(m => m.rec.complete === true);
  const up = ms.filter(m => m.rec.rate > m.rec.base).length, down = ms.filter(m => m.rec.rate < m.rec.base).length, open = any.filter(m => m.rec.complete !== true);
  const big = val(up + ' · ' + down, '달', '아무 회사보다 나았던 달 · 못했던 달', {누가: '꽃 조건에 맞았던 회사', 언제: ms.length ? ym(ms[0].month) + '부터 ' + ym(ms[ms.length - 1].month) + '까지' : null, 어디서: '코스피 · 코스닥',
    무엇을: '다 센 ' + ms.length + '달 가운데 ' + up + '달은 나았고 ' + down + '달은 못했어요', 어떻게: '달마다 그달 조건으로 고른 회사와 아무 회사를 견줬어요', 왜: null},
    {mean: '조건이 늘 통하지는 않았다는 뜻이에요. ' + down + '달은 아무 회사가 더 나았어요.'});
  const best = ms.slice().sort((a, b) => b.rec.rate - a.rec.rate)[0], worst = ms.slice().sort((a, b) => (a.rec.rate - a.rec.base) - (b.rec.rate - b.rec.base))[0];
  const mval = (m, label) => val(r0(m.rec.rate), '번', label + ' · ' + ym(m.month), {누가: '그달 조건에 맞은 회사', 언제: ym(m.month), 어디서: '코스피 · 코스닥', 무엇을: m.rec.n + '번 가운데 ' + m.rec.h + '번 꽃이 됐어요',
    어떻게: '아무 회사는 100번에 ' + r0(m.rec.base) + '번이었어요', 왜: (m.say ?? []).join(' · ') || null}, {v2: String(r0(m.rec.base)), mean: vsMean(m.rec.rate, m.rec.base, '그달 고른 회사', m.rec.n)});
  const mids = [best ? mval(best, '가장 많이 꽃이 된 달') : null, worst ? mval(worst, '아무 회사보다 가장 못한 달') : null].filter(Boolean);
  const rows = any.slice().reverse().map(m => val(r0(m.rec.rate), '번', ym(m.month), {누가: '그달 조건에 맞은 회사', 언제: ym(m.month), 어디서: '코스피 · 코스닥', 무엇을: m.rec.n + '번 가운데 ' + m.rec.h + '번 꽃이 됐어요',
    어떻게: '아무 회사는 100번에 ' + r0(m.rec.base) + '번이었어요' + (m.rec.complete === true ? '' : ' 아직 한 달이 다 안 지나 세는 중이에요'), 왜: (m.say ?? []).join(' · ') || null},
    {v2: String(r0(m.rec.base)), month: m.month, up: m.rec.rate > m.rec.base, open: m.rec.complete !== true,
      mean: m.rec.complete !== true ? '아직 세는 중이라 숫자가 바뀔 수 있다는 뜻이에요.' : m.rec.rate > m.rec.base ? '그달은 아무 회사보다 ' + r0(m.rec.rate - m.rec.base) + '번 더 꽃이 됐다는 뜻이에요.' : '그달은 아무 회사보다 ' + r0(m.rec.base - m.rec.rate) + '번 덜 꽃이 됐다는 뜻이에요.'}));
  const say = ['달마다 그달 꽃 조건으로 고른 회사를 셌어요.', '다 센 ' + ms.length + '달 가운데 ' + up + '달은 아무 회사보다 나았어요.',
    '그런데 ' + down + '달은 아무 회사보다 못했어요. 숨기지 않고 모두 그렸어요.' + (open.length ? ' 세는 중인 ' + open.length + '달은 따로 표시했어요.' : ''), '그래서 한 달만 보고 판단하지 말아요.'];
  const pro = any.map(m => P(ym(m.month) + (m.rec.complete === true ? '' : ' · 세는 중'), m.rec.n + ' · ' + m.rec.h + ' · ' + r1(m.rec.rate) + ' 대 ' + r1(m.rec.base), '고른 횟수 · 꽃 · 100번에 꽃 대 아무 회사 · 아무 회사 센 수 ' + (fin(m.rec.nb) ? num(m.rec.nb) : NEED) + ' · 점수 ' + (fin(m.rec.score) ? r1(m.rec.score) : NEED)));
  return {big, mids, rows, say, ms: any, pro};
}

/* ── 6 못 된 까닭(전) ── */
export function eMiss({B}) {
  const w = B?.why, names = Array.isArray(w?.names) ? w.names : [], why = Array.isArray(w?.all?.why) ? w.all.why : [], miss = w?.all?.miss, hon = B?.honest;
  const top = why.length ? names[why.indexOf(Math.max(...why))] : null;
  const big = val(fin(miss) ? miss : null, '번', '조건에 맞고도 꽃이 못 된 횟수', {누가: '꽃 조건에 맞았던 회사', 언제: span(hon?.from, hon?.to), 어디서: '코스피 · 코스닥',
    무엇을: fin(hon?.n) && fin(miss) ? num(hon.n) + '번 가운데 ' + num(miss) + '번은 꽃이 못 됐어요' : null, 어떻게: '한 달 뒤 시장보다 5% 넘게 더 오르지 못한 것을 셌어요', 왜: top ? '가장 많은 까닭은 「' + top + '」예요' : null},
    {mean: '조건에 맞아도 꽃이 못 된 때가 더 많았다는 뜻이에요. 조건만 믿지 말아요.'});
  const mids = names.map((nm, k) => (fin(why[k]) ? val(why[k], '번', nm, {누가: '꽃이 못 된 회사', 언제: span(hon?.from, hon?.to), 어디서: '코스피 · 코스닥', 무엇을: nm, 어떻게: '못 된 까닭을 셋으로 나눠 셌어요', 왜: null},
    {mean: nm === top ? '꽃이 못 된 까닭 가운데 이것이 가장 많았다는 뜻이에요.' : '꽃이 못 된 까닭 가운데 하나라는 뜻이에요.'}) : null)).filter(Boolean).slice(0, 3);
  const say = ['사기 전에 지난 기록을 한 번 더 봐요.', fin(miss) && fin(hon?.n) ? '조건에 맞은 ' + num(hon.n) + '번 가운데 ' + num(miss) + '번은 꽃이 못 됐어요.' : '꽃이 못 된 횟수를 아직 못 셌어요.',
    '그런데 못 된 까닭은 늘 하나가 아니었어요.', '그래서 사기 전에 「왜 사?」 열한 질문으로 내 이유부터 확인해요.'];
  const pro = [P('꽃이 못 된 횟수', miss, BLOOM_HOW), ...names.map((nm, k) => P('까닭 · ' + nm, why[k], '못 된 것을 셋으로 나눔')),
    P('배운 기간 · 못 된 횟수', w?.train?.miss, '조건을 고를 때 본 기간'), P('안 본 기간 · 못 된 횟수', w?.test?.miss, '조건을 고를 때 안 본 기간')];
  return {big, mids, rows: [], say, pro};
}

/* ── 날마다(지난 60거래일) ── */
export function eDays({B}) {
  const ds = Array.isArray(B?.cal?.days) ? B.cal.days : [], on = ds.filter(x => fin(x?.n) && x.n > 0);
  const sum = k => on.reduce((a, x) => a + (fin(x[k]) ? x[k] : 0), 0), hit = sum('hit'), miss = sum('miss'), wait = sum('wait');
  const sp = span(B?.cal?.from, B?.cal?.to);
  const big = val(on.length, '날', '조건에 맞은 회사가 있던 날', {누가: '꽃 조건에 맞았던 회사', 언제: sp, 어디서: '코스피 · 코스닥', 무엇을: ds.length + '거래일 가운데 ' + on.length + '날 조건에 맞은 회사가 있었어요', 어떻게: '날마다 고른 회사를 한 달 뒤에 견줘요', 왜: null},
    {mean: '조건에 맞는 회사가 없는 날이 더 많았다는 뜻이에요. 매일 고를 것이 있지는 않아요.'});
  const mids = [
    val(hit, '번', '꽃이 된 횟수', {누가: '그날 고른 회사', 언제: sp, 어디서: '코스피 · 코스닥', 무엇을: '한 달 뒤 꽃이 됐어요', 어떻게: BLOOM_HOW, 왜: null}, {mean: '지난 60거래일에 고른 회사 가운데 꽃이 된 수예요.'}),
    val(miss, '번', '꽃이 못 된 횟수', {누가: '그날 고른 회사', 언제: sp, 어디서: '코스피 · 코스닥', 무엇을: '한 달 뒤 꽃이 못 됐어요', 어떻게: '못 된 까닭을 셋으로 나눠 셌어요', 왜: null}, {mean: hit < miss ? '꽃이 된 것보다 못 된 것이 더 많았다는 뜻이에요.' : '꽃이 된 것이 못 된 것보다 많았다는 뜻이에요.'}),
    val(wait, '번', '아직 한 달이 안 된 횟수', {누가: '그날 고른 회사', 언제: sp, 어디서: '코스피 · 코스닥', 무엇을: '한 달이 지나야 셀 수 있어요', 어떻게: '기다리는 중이에요', 왜: null}, {mean: '아직 결과가 안 나왔다는 뜻이에요.'})];
  const say = ['날마다 조건에 맞은 회사를 달력에 놓았어요.', ds.length + '거래일 가운데 ' + on.length + '날 맞은 회사가 있었어요.', '그런데 ' + miss + '번은 한 달 뒤 꽃이 못 됐어요. 아직 ' + wait + '번은 기다리는 중이에요.', '그래서 꽃이 된 날만 보지 말고 못 된 날도 함께 봐요.'];
  const pro = on.map(x => P(ymd(x.d) ?? x.d, x.n + ' · ' + x.hit + ' · ' + x.miss + ' · ' + x.wait, '고른 수 · 꽃 · 못 됨 · 기다림 · 그날 셀 수 있던 회사 ' + (fin(x.bn) ? num(x.bn) : NEED) + ' 가운데 꽃 ' + (fin(x.bh) ? num(x.bh) : NEED)));
  return {big, mids, rows: [], say, ds, hit, miss, wait, pro};
}

/* ── 해마다 ── */
export function eYears({B}) {
  const ys = Object.entries(B?.record?.years ?? {}).sort(([a], [b]) => (a < b ? -1 : 1)), all = B?.record?.all;
  const big = val(all && fin(all.rate) ? r0(all.rate) : null, '번', '모든 해 · 100번에 꽃 · 맞은 회사 대 아무 회사', {누가: '꽃 조건에 맞았던 회사', 언제: ys.length ? ys[0][0] + '년부터 ' + ys[ys.length - 1][0] + '년까지' : null,
    어디서: '코스피 · 코스닥', 무엇을: fin(all?.n) ? num(all.n) + '번 가운데 ' + num(all.hits) + '번 꽃이 됐어요' : null, 어떻게: fin(all?.base) ? '아무 회사는 100번에 ' + r0(all.base) + '번이었어요' : null, 왜: null},
    {v2: fin(all?.base) ? String(r0(all.base)) : null, mean: vsMean(all?.rate, all?.base, '조건에 맞은 회사', all?.n)});
  const rows = ys.map(([y, v]) => val(fin(v?.rate) ? r0(v.rate) : null, '번', y + '년', {누가: '꽃 조건에 맞았던 회사', 언제: y + '년', 어디서: '코스피 · 코스닥',
    무엇을: fin(v?.n) && v.n > 0 ? num(v.n) + '번 가운데 ' + num(v.hits) + '번 꽃이 됐어요' : '이해에는 조건에 맞춰 고른 적이 없어요', 어떻게: fin(v?.base) ? '아무 회사는 100번에 ' + r0(v.base) + '번이었어요' : null, 왜: null},
    {v2: fin(v?.base) ? String(r0(v.base)) : null, year: y, mean: fin(v?.rate) ? vsMean(v.rate, v.base, '그해 고른 회사', v.n) : '그해에는 고른 회사가 없어 아무 회사 기록만 있다는 뜻이에요.'}));
  const none = ys.filter(([, v]) => !(fin(v?.n) && v.n > 0)).map(([y]) => y + '년');
  const say = ['해마다 지난 기록을 나눠 봤어요.', all && fin(all.rate) ? '모두 합치면 100번에 ' + r0(all.rate) + '번 꽃이 됐어요. 아무 회사는 ' + r0(all.base) + '번이었어요.' : '모두 합친 기록을 아직 못 셌어요.',
    none.length ? '그런데 ' + none.join(' · ') + '에는 고른 적이 없어요. 그해는 아무 회사 기록만 있어요.' : '그런데 해마다 달랐어요.', '그래서 한 해만 보고 판단하지 말아요.'];
  const pro = ys.map(([y, v]) => P(y + '년', (fin(v?.n) ? num(v.n) : NEED) + ' · ' + (fin(v?.hits) ? num(v.hits) : NEED) + ' · ' + (fin(v?.rate) ? r1(v.rate) : NEED) + ' 대 ' + (fin(v?.base) ? r1(v.base) : NEED),
    '고른 횟수 · 꽃 · 100번에 꽃 대 아무 회사 · 시장보다 더 오른 평균 ' + (fin(v?.ex) ? r1(v.ex) : NEED) + ' 대 ' + (fin(v?.exBase) ? r1(v.exBase) : NEED) + ' · 5 넘게 덜 오름 ' + (fin(v?.fall) ? r1(v.fall) : NEED) + ' 대 ' + (fin(v?.fallBase) ? r1(v.fallBase) : NEED)));
  return {big, mids: [], rows, say, ys, pro};
}

/* ── 가까운 회사 ── */
export function eNear({B}) {
  const rec = B?.near?.rec;
  const big = val(recOk(rec) ? r0(rec.rate) : null, '번', '100번에 꽃 · 가까운 회사 대 아무 회사', {누가: '조건에 가까웠던 회사', 언제: span(rec?.from, rec?.to), 어디서: '코스피 · 코스닥',
    무엇을: fin(rec?.n) ? rec.n + '번 가운데 ' + rec.hits + '번 꽃이 됐어요' : null, 어떻게: recOk(rec) ? '아무 회사는 100번에 ' + r0(rec.base) + '번이었어요' : null, 왜: recOk(rec) && rec.rate < rec.base ? '가까운 회사는 아무 회사보다 꽃이 된 적이 적었어요' : null},
    {v2: recOk(rec) ? String(r0(rec.base)) : null, mean: vsMean(rec?.rate, rec?.base, '가까운 회사', rec?.n)});
  const say = ['조건에 다 맞은 회사가 없던 날, 가장 가까운 회사를 셌어요.', recOk(rec) ? '100번에 ' + r0(rec.rate) + '번 꽃이 됐어요. 아무 회사는 ' + r0(rec.base) + '번이었어요.' : '아직 못 셌어요.',
    recOk(rec) && rec.rate < rec.base ? '그런데 가까운 회사가 아무 회사보다 적었어요.' : '그런데 센 횟수가 아직 적어요.', '그래서 가까운 회사는 ' + jo(BRAND, '이') + ' 고른 회사로 보지 않아요.'];
  const pro = [P('센 기간', span(rec?.from, rec?.to), null), P('센 횟수', rec?.n, '가까운 회사 × 날'), P('꽃', rec?.hits, BLOOM_HOW), P('100번에 꽃', r1(rec?.rate), null), P('아무 회사 100번에 꽃', r1(rec?.base), null),
    P('아무 회사 센 수 · 꽃', fin(rec?.baseN) ? num(rec.baseN) + ' · ' + num(rec.baseHits) : null, '같은 날들'), P('센 날', rec?.days, '고른 회사가 없던 날')];
  return {big, mids: [], rows: [], say, rec, pro};
}

/* ── 내 매매일지 ── */
export function eJournal({recs = [], due = 0, kept = 0, asked = 0, lastDay = null}) {
  const n = recs.length;
  const big = val(n, '번', '「왜 사?」에 답한 횟수', {누가: '나', 언제: n && ymd(lastDay) ? ymd(lastDay) + '이 마지막' : null, 어디서: '이 휴대폰', 무엇을: n ? '사기 전에 ' + n + '번 멈췄어요' : '아직 멈춘 기록이 없어요', 어떻게: '열한 질문에 답하면 한 줄씩 남아요', 왜: '사기 전에 내 이유부터 확인하려고요'},
    {mean: n ? '사기 전에 ' + n + '번 내 이유를 확인했다는 뜻이에요.' : '아직 사기 전에 멈춘 적이 없다는 뜻이에요.'});
  const mids = [
    val(due, '번', '한 달이 지나 돌아볼 기록', {누가: '나', 언제: '답한 날부터 20거래일 뒤', 어디서: '이 휴대폰', 무엇을: '「그날 정한 대로 했어?」를 물어요', 어떻게: '한 달 뒤 값과 함께 보여 줘요', 왜: null}, {mean: due ? '돌아볼 약속이 ' + due + '개 있다는 뜻이에요.' : '아직 돌아볼 약속이 없다는 뜻이에요.'}),
    val(asked ? kept + ' / ' + asked : 0, '', '정한 대로 했다고 답한 기록', {누가: '나', 언제: null, 어디서: '이 휴대폰', 무엇을: asked ? asked + '번 돌아보고 ' + kept + '번 정한 대로 했어요' : '아직 돌아본 기록이 없어요', 어떻게: '한 달 뒤 내가 답해요', 왜: null},
      {mean: asked ? '돌아본 약속 가운데 지킨 수라는 뜻이에요.' : '아직 지켰는지 돌아본 적이 없다는 뜻이에요.'})];
  const say = [n ? '사기 전에 멈춘 기록이 ' + n + '번 있어요.' : '아직 멈춘 기록이 없어요.', n && ymd(lastDay) ? '마지막은 ' + ymd(lastDay) + '이에요.' : '「왜 사?」 열한 질문에 답하면 여기에 남아요.',
    '그런데 기록은 이 휴대폰에만 있어요. 다른 기기에는 없어요.', '그래서 한 달 뒤에 꼭 돌아봐요.'];
  return {big, mids, rows: [], say};
}

/* ── 「왜 사?」 결과 ── */
export function eQuizResult({score, max, verdict, reds, type, day: d0 = null, name = null}) {
  const big = val(score + ' / ' + max, '', '준비 점수', {누가: '나', 언제: ymd(d0), 어디서: name ? name + ' 앞에서' : '이 휴대폰', 무엇을: '「왜 사?」 열한 질문에 모두 답했어요', 어떻게: '답마다 점수를 더했어요. 빨간 답은 ' + reds + '개예요', 왜: verdict ?? null},
    {mean: score * 2 >= max ? '사기 전 준비가 반 넘게 됐다는 뜻이에요.' : '사기 전 준비가 반도 안 됐다는 뜻이에요. 오늘은 쉬어 가요.'});
  const mids = [val(reds, '개', '빨간 답', {누가: '나', 언제: ymd(d0), 어디서: '이 휴대폰', 무엇을: '멈춰요 쪽 답을 셌어요', 어떻게: '네 개면 쉬어 가요', 왜: null}, {mean: reds >= 4 ? '멈춰야 할 답이 많다는 뜻이에요.' : reds ? '멈춰야 할 답이 조금 있다는 뜻이에요.' : '멈춰야 할 답이 없다는 뜻이에요.'}),
    val(type ?? null, '', '어떤 투자자', {누가: '나', 언제: ymd(d0), 어디서: '이 휴대폰', 무엇을: type ? type + '예요' : null, 어떻게: '답한 모양으로 나눴어요', 왜: null}, {mean: '오늘 답으로 본 내 모습이라는 뜻이에요. 날마다 달라질 수 있어요.'})];
  return {big, mids, rows: [], say: []};
}
