/* 손자병법 다른 쪽 — 꾀 모음 · 꾀 한 가지 · 회사 · 정산(주문 1115-2328 · 빈 파일에서 새로 씀 · 첫 쪽과 같은 기준 = 샘플 사 「화제와 도장」)
   사장님 2026-11-15(마카오) 22:28 「어고쳐」 — 물음 「다른 쪽들도 병법 서른여섯 가지에 맞게 고칠까요?」의 답
   · 앞 말씀 17:43 「… 기존애 돈모리는곳 불장 꽃은 다 삭제 하고 병법 36가지 만 표현 되개 해야 한다」(원문 docs/design/sonja-ink-2026-11-15/order-2328.txt)
   길 다섯 화면: 1 오늘(#/ · su-sonja.js) → 2 꾀(#/k/g01 ~ g36) → 3 회사(#/c/<번호>) → 4 「왜 사?」(#/q/<번호> · su-why.js) → 5 내 매매일지(#/j)
   탭 쪽: 꾀 모음(#/k · 여섯 묶음 × 여섯 꾀) · 정산(#/r/t · 서른여섯 꾀 표만 — 옛 여덟 묶음 · 겹친 곳은 지움)
   자료: su21.json(형세 · 덜 잃은 차례 · 첫 화면과 같은 판) · su21-s36.json(꾀 이름 · 뜻 · 고르는 법 · 오늘 일곱 곳 · 한 달 값) · su21-settle.json(10주씩 산 셈 · 가짜 돈) · 회사 자료 /atlas/data/co/<번호>.json(이름 · 시장)
   앞날을 맞히지 않음 · 사고팔기를 권하지 않음 · 「%」 0(「100원이 ○원」) · 늘어도 줄어도 같은 크기 · 모양 + 글(색만으로 뜻 0)
   보안 규칙: innerHTML 없음 · 글 속 style 없음 · 다른 주소 스크립트 없음 */
import {h, s} from '/su/su-fig.js';
import {NAME, josa} from '/next/brand.js';
import {kstText} from '/next/essence.js';
import {hardLeft} from '/su/su-word.js';
import {topBar, stepTag, endSec, dockNav, tabNav, meanCap} from '/su/su-sonja-top.js';
import {PIC, PM} from '/su/su-sonja-mean.js'; // 그림 뜻 한 줄(주문 1116-1313 — 그림마다 맨 위)
import {D36, DST, load21, n36of, okSun, sp36, rec36, chip, spark, head, endSeal, chev, mday, ym, day, w100, monOf, MONW, none36, fin} from '/su/su-sonja.js';
import {base36} from '/su/su-sonja-36.js'; // 꾀 칸 자료를 못 받은 날의 바탕 글(su21_s36.py 그대로)
import {kkoePic, ridgePic, heroPic, brushBar, sonmuPic} from '/su/su-sonja-ink.js'; // 먹그림(주문 1116-0118 — 손무의 이야기: 제3장 꾀를 펼치다 · 제4장 성을 살피다 · 장부 · 병서)
import {kkoeTile} from '/su/su-sonja.js';

const CODE = /^[0-9A-Z]{6}$/;
export const KKOE = /^g(0[1-9]|[12]\d|3[0-6])$/;
const K36 = Object.freeze(Array.from({length: 36}, (_, i) => 'g' + String(i + 1).padStart(2, '0')));
const SETW = ['이김', '맞섬', '공격', '혼란', '연합', '패배']; // 여섯 묶음 머리 붓 글씨(묶음 이름은 자료 set 그대로)
const NF = new Intl.NumberFormat('ko-KR');
const coUrl = c => '/atlas/data/co/' + c + '.json';

/* ── 자료 ── */
/** 꾀 칸 자료(su21-s36.json)가 쓸 만한가 — 이름 · 뜻 · 고르는 법 · 묶음이 서른여섯 모두 있음 */
const okG = g => !!g && g.schema === 'su21-s36-1' && Array.isArray(g.kinds) && g.kinds.length === 36 && g.kinds.every((k, i) => k === K36[i])
  && ['name', 'han', 'mean', 'say', 'set'].every(f => g[f] && K36.every(k => typeof g[f][k] === 'string' && g[f][k])) && !!g.lists && typeof g.lists === 'object';
/** 꾀 칸 자료 — 첫 화면 자료(su21.json)에 꾀 수(s36n)가 있을 때만 받음(없는 날 404 를 부르지 않음) · 못 받거나 꼴이 틀리면 바탕 글(오늘 고른 곳 0 · fallback) */
const g36Of = async (X, T) => { const g = n36of(T) != null ? await X.get(D36) : null; return okG(g) ? g : base36(); };
/** 덜 잃은 차례 — {k: {…기록, i: 차례}} · 형세가 없으면 빈 것 */
const rankOf = T => (okSun(T?.sun) && new Set(T.sun.rank.map(r => r.k)).size === 36 ? Object.fromEntries(T.sun.rank.map((r, i) => [r.k, {...r, i: i + 1}])) : {});
const kNo = k => +k.slice(1); // 제 몇 계
/** 돈 — 「196만 1,000원」 · 「4,500원」(억 · 만 자리) */
export const won = v => {
  if (!fin(v)) return '?';
  const a = Math.round(Math.abs(v)), e = Math.floor(a / 1e8), m = Math.floor((a % 1e8) / 1e4), r = a % 1e4;
  return [e ? NF.format(e) + '억' : '', m ? NF.format(m) + '만' : '', r || (!e && !m) ? NF.format(r) : ''].filter(Boolean).join(' ') + '원';
};
/** 늘고 준 말 — 「11만 4,000원 늘었어요」 · 「그대로예요」 */
export const moved = d => (!fin(d) ? '?' : Math.round(d) > 0 ? won(d) + ' 늘었어요' : Math.round(d) < 0 ? won(d) + ' 줄었어요' : '그대로예요');
const SHAPE = Object.freeze({up: '▲', dn: '▼', eq: '―', one: '○', none: '·'});
const SAID = Object.freeze({one: '아직 하루치예요', none: '아직 산 셈이 없어요'});

/** 정산 장부(su21-settle.json) → 산 셈 줄 — {day, k, code, name, buy, now, nowDay, cost, val, one}(지금 = 그 회사 가장 늦은 값 · 산 날 뒤 값이 없으면 아직 하루치) */
export function settleRows(D) {
  if (!D || !Array.isArray(D.buys) || !Array.isArray(D.kinds)) return [];
  const q = Number.isFinite(D.qty) ? D.qty : 10;
  return D.buys.filter(b => Array.isArray(b) && KKOE.test(D.kinds[b[1]] ?? '') && fin(b[3]) && b[3] > 0).map(([dd, ki, code, buy]) => {
    const [now, nowDay] = Array.isArray(D.now?.[code]) && fin(D.now[code][0]) ? D.now[code] : [buy, dd], [name] = D.co?.[code] ?? [code];
    return {day: dd, k: D.kinds[ki], code, name: name ?? code, buy, now, nowDay, cost: buy * q, val: now * q, one: !(nowDay > dd)};
  });
}
/** 더함 — 산 돈 · 지금 · 늘고 준 돈 · 모양(모두 아직 하루치면 one · 늘고 줆은 반올림한 원으로) */
export function sumOf(rs) {
  const cost = rs.reduce((a, r) => a + r.cost, 0), val = rs.reduce((a, r) => a + r.val, 0), diff = val - cost, one = rs.length > 0 && rs.every(r => r.one);
  return {n: rs.length, days: new Set(rs.map(r => r.day)).size, cost, val, diff, one, st: !rs.length ? 'none' : one ? 'one' : Math.round(diff) > 0 ? 'up' : Math.round(diff) < 0 ? 'dn' : 'eq'};
}
/** 늘고 준 몫(산 돈에 견줘 · 백만에 하나까지) — 하루치 · 산 셈 없음은 null */
export const rateOf = g => (g.n && g.cost > 0 && !g.one ? Math.round((g.val - g.cost) / g.cost * 1e6) : null);
/** 꾀마다 — 서른여섯 모두(산 셈이 없는 꾀도) · 수익이 높은 차례(본질 8번 · 주문 1113-2224 「정산표에는 수익율이 높은 순으로」) · 같으면 꾀 차례 · 하루치 · 산 셈 없음은 맨 아래 */
export function settle36(D) {
  const rows = settleRows(D), by = new Map(K36.map(k => [k, []]));
  for (const r of rows) by.get(r.k)?.push(r);
  const K = K36.map(k => ({key: k, ...sumOf(by.get(k))}));
  K.sort((a, b) => (rateOf(a) === null) - (rateOf(b) === null) || (rateOf(b) ?? 0) - (rateOf(a) ?? 0) || K36.indexOf(a.key) - K36.indexOf(b.key));
  const miss = K36.reduce((a, k) => a + (Number.isInteger(D?.miss?.[k]) ? D.miss[k] : 0), 0);
  return {rows, K, T: sumOf(rows), miss, asOf: typeof D?.asOf === 'string' ? D.asOf : null};
}
const resText = g => (g.st === 'none' ? SAID.none : g.st === 'one' ? SAID.one : moved(g.diff));
const shapeI = st => h('i', {class: 'sj-shp sj-shp-' + st, 'aria-hidden': 'true', text: SHAPE[st] ?? ''});

/* ── 쪽 틀 ── */
/** 쪽 하나 — 머리 줄 · main(쪽 이름 data-page) · 이야기 막대 · 탭 · 풀이 없이 남은 어려운 낱말 셈(main data-hard) */
function frame({title, page, kids, step = null, next = null, tab = -1, lc = null, attrs = {}}) {
  const main = h('main', {class: 'sj-page sj-sub', 'data-page': page, ...attrs}, ...kids);
  const c = main.cloneNode(true); for (const e of c.querySelectorAll('svg, [aria-hidden="true"], [data-proper]')) e.remove();
  const left = hardLeft(c.textContent ?? '', []); main.dataset.hard = String(left.length); main.dataset.hardWords = left.join(','); main.dataset.glossed = '';
  return {title, dom: [topBar(), main, dockNav(step, next), tabNav(tab, lc)]};
}
/** 쪽 머리 — 걸음 · 작은 머리 글 · 큰 제목(도장) · 말씀 · 읽어 줄 한 줄 */
function pageHead({step = null, dd = null, kick, h1, proper = false, seal = null, sealDn = false, quote = null, say = null, pic = null, more = []}) {
  return h('section', {class: 'sj-sec sj-ph', 'aria-label': h1},
    step ? stepTag(step, dd) : null,
    h('p', {class: 'sj-k', text: kick}),
    h('div', {class: 'sj-today'}, h('h1', {class: 'sj-h1', ...(proper ? {'data-proper': ''} : {})}, h('b', {class: 'sj-land', text: h1})),
      seal ? h('span', {class: 'sj-seal sj-seal-big ' + (sealDn ? 'sj-seal-dn' : 'sj-seal-up'), 'aria-hidden': 'true', text: seal}) : null),
    pic,
    quote ? h('blockquote', {class: 'sj-q'}, h('p', {text: '「' + quote[0] + '」'}), h('cite', {text: quote[1]})) : null,
    say ? h('div', {class: 'sj-says'}, meanCap(PM.sonmu), h('span', {class: 'sj-saysp', 'aria-hidden': 'true'}, sonmuPic({w: 84, h: 100})), h('p', {class: 'sj-do', 'data-say': '', text: say})) : null, // 손무가 들려주는 한 줄(이야기의 한 사람) · 맨 위 그림 뜻
    ...more);
}
const goLink = (href, t) => h('a', {class: 'sj-go', href}, h('span', {text: t}), h('i', {'aria-hidden': 'true', text: '›'}));
const gotOf = S => (S?.fetchedAt ? kstText(S.fetchedAt) : null);
/** 자료를 못 받은 쪽 · 없는 쪽 — 같은 판 · 처음으로 */
function missPage(X, title, say) {
  return frame({title, page: 'miss', tab: -1, lc: X.cur?.()?.code ?? null, kids: [pageHead({kick: NAME, h1: '찾지 못했어요', say}), h('section', {class: 'sj-sec'}, goLink('#/', '처음으로 · 오늘 형세 보기')), endSec(NEED_DAY)]});
}
const NEED_DAY = '확인 필요';

/* ── 꾀 한 줄(꾀 모음 · 회사 쪽) ── */
function kkoeRow(g, k, r, extra = null) {
  return h('li', {class: 'sj-kr', 'data-k': k, 'data-rank': r ? String(r.i) : null},
    meanCap(PIC[k]), kkoeTile(k, g.name[k], 'sj-kpic', 120, 90), // 그림 뜻 한 줄 → 꾀 그림(주문 1116-1313)
    h('a', {class: 'sj-ka', href: '#/k/' + k, 'aria-label': '제' + kNo(k) + '계 · ' + g.name[k] + (r ? ' · 오늘 덜 잃은 차례 ' + r.i + '번째' : '')},
      h('span', {class: 'sj-kno', text: '제' + kNo(k) + '계'}),
      h('span', {class: 'sj-kt'}, h('b', {text: g.name[k]}), h('span', {class: 'sj-khan', text: g.han[k]})),
      r ? h('span', {class: 'sj-krk', text: r.i + '번째'}) : null, h('i', {'aria-hidden': 'true', text: '›'})), // 「○위」 대신 「○번째」(쓰지 않을 말 「1위」 — 수익 순위로 읽히지 않게)
    h('p', {class: 'sj-kmean', text: g.mean[k]}), extra);
}

/* ── 꾀 모음(#/k) ── */
export async function vKkoeAll(X) {
  const [T, {S}] = await Promise.all([load21(X.get), X.base()]), g = await g36Of(X, T);
  const RB = rankOf(T), sun = okSun(T?.sun) ? T.sun : null, first = sun?.rank[0]?.k ?? null;
  const sets = []; for (let i = 0; i < 6; i++) sets.push(K36.slice(i * 6, i * 6 + 6));
  const kids = [
    pageHead({kick: '삼십육계 · 여섯 묶음', h1: '병법 서른여섯 가지', seal: '꾀', quote: sun?.rankQ ? [sun.rankQ.quote, '손자병법 ' + sun.rankQ.pian] : null,
      say: '삼십육계는 옛 병법에 전하는 서른여섯 가지 꾀예요. 여섯 묶음에 여섯 꾀씩 있어요.' + (sun ? ' 지금 ' + sun.name + '에서 지난 기록으로 덜 잃은 차례를 함께 적었어요.' : ''),
      more: [h('figure', {class: 'sj-ink sj-herofig'}, meanCap(PM.book, 'figcaption'), heroPic('book')), h('p', {class: 'sj-lead', text: '꾀 그림이나 이름을 누르면 그 꾀 쪽이 열려요.'})]}),
    ...sets.map((ks, i) => h('section', {class: 'sj-sec sj-kset', 'data-set': String(i + 1), 'aria-label': g.set[ks[0]]},
      head(SETW[i], '제' + (i + 1) + '묶음', h('h2', {class: 'sj-h2'}, h('span', {class: 'sj-brush', text: g.set[ks[0]]})), i % 2 === 1),
      h('ol', {class: 'sj-kl'}, ...ks.map(k => kkoeRow(g, k, RB[k]))),
      endSeal(SETW[i]))),
    h('p', {class: 'sj-safe sj-sec', text: '옛 꾀 이름과 뜻이에요. 차례는 지난 기록을 센 것이고, 앞날을 맞히지 않고 사고팔기를 권하지 않아요.'}),
    endSec(day(T?.asOf?.board), gotOf(S))];
  return frame({title: '서른여섯 꾀', page: 'kkoes', kids, tab: 1, lc: X.cur?.()?.code ?? null,
    next: first ? {href: '#/k/' + first, label: '맨 위 꾀는 어떤 꾀인가?'} : {href: '#/k/g01', label: '첫째 꾀는 어떤 꾀인가?'}});
}

/* ── 꾀 한 가지(#/k/g01 ~ g36) ── */
export async function vKkoe(X, k) {
  if (!KKOE.test(k)) return missPage(X, '꾀', '이 꾀를 찾지 못했어요.');
  const [T, D, {S}] = await Promise.all([load21(X.get), X.get(DST), X.base()]), g = await g36Of(X, T);
  const RB = rankOf(T), r = RB[k] ?? null, sun = okSun(T?.sun) ? T.sun : null, H = sun?.hist ?? null;
  const L = (Array.isArray(g.lists[k]) ? g.lists[k] : []).filter(c => CODE.test(String(c?.code ?? ''))).slice(0, 7), bd = mday(g.asOf?.board), dd = mday(g.asOf?.data) ?? bd;
  const anySp = L.some(c => sp36(g, c.code)), vol = g.by?.[k] === 'vol';
  const ST = D && Array.isArray(D.buys) ? settle36(D) : null, me = ST?.K.find(x => x.key === k) ?? null, meAt = me ? ST.K.indexOf(me) + 1 : null;
  const order = sun ? sun.rank.map(x => x.k) : K36, at = order.indexOf(k), prev = at > 0 ? order[at - 1] : null, nxt = at >= 0 && at < order.length - 1 ? order[at + 1] : null;
  const kids = [
    pageHead({step: 2, dd: bd, kick: '삼십육계 제' + kNo(k) + '계 · ' + g.set[k], h1: g.name[k], seal: r ? '차례 ' + r.i : '꾀', sealDn: sun?.land === 'fall',
      quote: [g.mean[k], '삼십육계 제' + kNo(k) + '계 ' + g.han[k]],
      pic: h('figure', {class: 'sj-ink sj-kfig'}, meanCap(PIC[k], 'figcaption'), kkoePic(k, {w: 390, h: 292, label: g.name[k] + ' 그림'})),
      say: sun ? (r?.n ? '지금 ' + sun.name + '에서 서른여섯 꾀 가운데 덜 잃은 차례 ' + r.i + '번째예요. 지난 같은 땅 기록으로 셌어요.' : '지금 ' + sun.name + '이에요. 이 꾀는 지난 기록을 세지 못해 맨 아래에 놓았어요.') : '오늘 형세는 아직 세지 못했어요. 꾀 차례 대신 옛 차례로 놓았어요.'}),
    h('section', {class: 'sj-sec sj-kway', 'aria-label': '주식에서는 이렇게 골라요'},
      head('법', '제1장', h('h2', {class: 'sj-h2'}, h('span', {class: 'sj-brush', text: '주식에서는 이렇게 골라요'}))),
      h('p', {class: 'sj-lead', 'data-say': '', text: g.say[k]}),
      vol ? h('p', {class: 'sj-note', text: '이 꾀는 그날 사고판 양 자료가 있어야 골라요.'}) : null,
      h('details', {class: 'sj-drawer sj-src'}, h('summary', {}, h('span', {class: 'sj-s1', text: '이름과 고르는 법은 어디서 왔나요'}), chev()),
        h('p', {class: 'sj-note', text: '꾀 이름과 뜻은 옛 병법 그대로예요. 고르는 법은 ' + josa(NAME, '가') + ' 그 뜻을 주식 값에 빗대어 정했어요.'})),
      endSeal('법')),
    h('section', {class: 'sj-sec sj-krec', 'aria-label': '지난 같은 땅 기록'},
      head('기록', '제2장', h('h2', {class: 'sj-h2'}, h('span', {class: 'sj-brush', text: '지난 같은 땅 기록'})), true),
      ...(r ? rec36(r, true) : [h('p', {class: 'sj-tl sj-tnorec', text: '오늘 형세를 아직 세지 못해 같은 땅 기록이 없어요.'})]),
      sun && H ? h('details', {class: 'sj-drawer sj-how'}, h('summary', {}, h('span', {class: 'sj-s1', text: '이렇게 셌어요'}), chev()),
        h('p', {class: 'sj-rule', text: (H.all ? '지난 ' + H.days + '거래일을 모두 보고, ' : '지난 ' + H.days + '거래일 가운데 오늘처럼 ' + sun.name + '이었던 ' + H.same + '날을 골라, ')
          + '이 꾀가 고른 일곱 곳을 닷새 뒤 값과 견줬어요.' + (ym(H.from) && ym(H.to) ? ' 센 때는 ' + ym(H.from) + '부터 ' + ym(H.to) + '까지예요.' : '')}),
        h('p', {class: 'sj-note', text: '화살 열은 지난 같은 땅 싸움 열 번이에요. 꺾인 화살이 잃은 몫이에요.'})) : null,
      h('p', {class: 'sj-safe', text: '지난 기록을 센 것이에요. 앞날을 맞히지 않고, 사고팔기를 권하지 않아요.'}),
      endSeal('기록')),
    h('section', {class: 'sj-sec sj-kco', 'aria-label': '오늘 이 꾀를 닮은 곳', 'data-n': String(L.length)},
      head('곳', '제3장', h('h2', {class: 'sj-h2'}, h('span', {class: 'sj-brush', text: '오늘 이 꾀를 닮은 곳'}), h('span', {class: 'sj-h2n', text: ' ' + L.length + '곳'}))),
      h('p', {class: 'sj-dayl', text: (dd ? dd + ' 마지막 값으로 골랐어요. ' : '') + (anySp ? '이름 옆 꺾은선은 한 달, 점선은 한 달 전 값이에요. ' : '') + '사도 된다는 뜻이 아니에요.'}),
      L.length ? h('ul', {class: 'sj-chips'}, ...L.map(c => chip(g, c, bd, false))) : h('p', {class: 'sj-tnone', text: g.fallback ? '오늘 고른 곳 자료를 아직 받지 못했어요.' : none36(g.why?.[k])}),
      endSeal('곳')),
    me ? h('section', {class: 'sj-sec sj-kst', 'aria-label': '이 꾀 정산', 'data-st': me.st},
      head('셈', '제4장', h('h2', {class: 'sj-h2'}, h('span', {class: 'sj-brush', text: '이 꾀 정산'})), true),
      h('p', {class: 'sj-lead', text: (mday(ST.rows.map(x => x.day).sort()[0]) ? mday(ST.rows.map(x => x.day).sort()[0]) + '부터 ' : '') + '날마다 이 꾀가 고른 곳을 10주씩 산 셈이에요. 가짜 돈이에요.'}),
      h('dl', {class: 'sj-money'}, h('dt', {text: '산 돈'}), h('dd', {text: won(me.cost)}), h('dt', {text: '지금'}), h('dd', {text: me.n ? won(me.val) : SAID.none})),
      h('p', {class: 'sj-res', 'data-st': me.st}, shapeI(me.st), h('b', {text: resText(me)})),
      meAt && rateOf(me) !== null ? h('p', {class: 'sj-note', text: '정산 표에서 서른여섯 꾀 가운데 ' + meAt + '번째예요. 많이 늘어난 꾀가 위예요.'}) : null,
      goLink('#/r/t', '서른여섯 꾀 정산 보기'),
      endSeal('셈')) : null,
    h('nav', {class: 'sj-sec sj-kpn', 'aria-label': '앞뒤 꾀'},
      prev ? h('a', {class: 'sj-kp', href: '#/k/' + prev}, h('i', {'aria-hidden': 'true', text: '‹'}), h('span', {text: (sun ? at + '번째 · ' : '') + g.name[prev]})) : null,
      nxt ? h('a', {class: 'sj-kp sj-kn', href: '#/k/' + nxt}, h('span', {text: (sun ? (at + 2) + '번째 · ' : '') + g.name[nxt]}), h('i', {'aria-hidden': 'true', text: '›'})) : null,
      goLink('#/k', '서른여섯 꾀 모두 보기')),
    endSec(day(g.asOf?.board ?? T?.asOf?.board), gotOf(S))];
  const c0 = L[0] ?? null;
  return frame({title: g.name[k], page: 'kkoe', attrs: {'data-k': k}, kids, step: 2, tab: 1, lc: X.cur?.()?.code ?? null,
    next: c0 ? {href: '#/c/' + c0.code, k: '3 / 5', label: '이 꾀가 고른 ' + josa(String(c0.name ?? '첫 곳'), '는') + ' 어떤 곳인가?'} : {href: '#/q', k: '4 / 5', label: '사기 전에 한 번 멈출까?'}});
}

/* ── 회사(#/c/<번호>) ── */
export async function vCo36(X, code) {
  const [T, co, {S}] = await Promise.all([load21(X.get), X.get(coUrl(code)), X.base()]), g = await g36Of(X, T);
  const G = g, mine = G ? K36.filter(k => (G.lists[k] ?? []).slice(0, 7).some(c => String(c?.code) === code)) : [];
  const inList = mine.length ? (G.lists[mine[0]] ?? []).find(c => String(c?.code) === code) : null;
  const c = co?.c ?? null, name = typeof c?.name === 'string' && c.name ? c.name : typeof inList?.name === 'string' ? inList.name : null;
  if (!name) return missPage(X, '찾지 못했어요', '이 회사를 찾지 못했어요.');
  X.setCur?.({code, name, ind: typeof c?.i === 'string' ? c.i : null});
  const RB = rankOf(T), sun = okSun(T?.sun) ? T.sun : null, sorted = [...mine].sort((a, b) => (RB[a]?.i ?? 99) - (RB[b]?.i ?? 99) || kNo(a) - kNo(b));
  const sp = G ? sp36(G, code) : null, m = monOf(sp), bd = mday(G?.asOf?.board), mk = c?.market === 'KOSDAQ' ? '코스닥' : c?.market === 'KOSPI' ? '코스피' : null;
  const kick = [mk, typeof c?.i === 'string' && c.i ? c.i + ' 업종' : null].filter(Boolean).join(' · ') || '회사';
  const line = sp ? h('figure', {class: 'sj-coline', 'data-mon': m ?? 'na', 'aria-label': '한 달 꺾은선 · 한 달 전 ' + won(sp[0]) + ' · ' + (bd ? bd + ' ' : '') + '마지막 값 ' + won(sp[20]) + ' · ' + MONW[m]},
    ridgePic(sp, {down: m === 'dn'}), // 한 달 값 = 산등성이 먹선 · 마지막 봉우리에 작은 성(제4장 성을 살피다)
    h('figcaption', {}, h('span', {text: '한 달 전 ' + won(sp[0])}), h('span', {text: (bd ? bd + ' ' : '') + '마지막 값 ' + won(sp[20])}),
      h('b', {text: '한 달 동안 100원이 ' + w100(sp[20] / sp[0] - 1) + '이 됐어요.'}))) : null;
  const kids = [
    pageHead({step: 3, dd: bd, kick, h1: name, proper: true, seal: m ? {dn: '내림', up: '오름', eq: '같음'}[m] : null, sealDn: m === 'dn',
      say: mine.length ? '오늘 서른여섯 꾀 가운데 ' + mine.length + '가지가 이 회사를 골랐어요.' : '오늘은 서른여섯 꾀 어디에도 들지 않았어요.',
      pic: h('figure', {class: 'sj-ink sj-herofig'}, meanCap(PM.castle, 'figcaption'), heroPic('castle')),
      more: [line ? meanCap(PM.ridge) : null, line, sp ? null : h('p', {class: 'sj-note', text: '한 달 산세는 오늘 꾀가 고른 곳만 그려요.'})]}), // 산세 그림 뜻은 그림 바로 위(그림 아래 글 figcaption 은 값 셋 그대로)
    h('section', {class: 'sj-sec sj-cok', 'aria-label': '이 회사를 고른 꾀', 'data-n': String(mine.length)},
      head('꾀', '제1장', h('h2', {class: 'sj-h2'}, h('span', {class: 'sj-brush', text: '이 회사를 고른 꾀'}), h('span', {class: 'sj-h2n', text: ' ' + mine.length + '가지'}))),
      mine.length && sun ? h('p', {class: 'sj-rule', text: '꾀마다 지금 ' + sun.name + '에서 지난 기록으로 덜 잃은 차례와 잃은 몫을 적었어요.'}) : null,
      mine.length ? h('ol', {class: 'sj-tricks sj-cotricks'}, ...sorted.map(k => { const r = RB[k] ?? null;
        return h('li', {class: 'sj-tk', 'data-k': k, 'data-rank': r ? String(r.i) : null},
          meanCap(PIC[k]), kkoeTile(k, G.name[k]), // 그림 뜻 한 줄 → 꾀 그림(주문 1116-1313)
          h('a', {class: 'sj-tkh', href: '#/k/' + k, 'aria-label': (r ? '차례 ' + r.i + ' · ' : '') + G.name[k] + ' · 이 꾀 자세히'}, r ? h('span', {class: 'sj-rk' + (r.i <= 3 ? ' sj-rk3' : ''), text: String(r.i)}) : null,
            h('p', {class: 'sj-tn'}, h('b', {text: G.name[k]}), h('span', {text: ' ' + G.han[k]})), h('i', {class: 'sj-tkgo', 'aria-hidden': 'true', text: '›'})),
          ...rec36(r), h('p', {class: 'sj-say', text: G.say[k]})); }))
        : h('p', {class: 'sj-lead', text: '꾀가 고른 곳만 이 쪽에 꾀 이름이 올라요. 꾀 모음에서 서른여섯 꾀를 볼 수 있어요.'}),
      mine.length ? null : goLink('#/k', '서른여섯 꾀 모두 보기'),
      h('p', {class: 'sj-safe', text: '꾀가 골랐다고 사도 된다는 뜻이 아니에요. 앞날을 맞히지 않고, 사고팔기를 권하지 않아요.'}),
      endSeal('꾀')),
    h('section', {class: 'sj-sec sj-costop', 'aria-label': '사기 전에 한 번 멈춰요'},
      h('a', {class: 'sj-ask', href: '#/q/' + code}, h('b', {text: '사기 전에 한 번 멈춰요'}), h('span', {text: '「왜 사?」 열한 질문으로 내 까닭부터 적어요.'}))),
    endSec(day(G?.asOf?.board ?? T?.asOf?.board), gotOf(S))];
  return frame({title: name, page: 'co', attrs: {'data-code': code}, kids, step: 3, tab: -1, lc: code,
    next: {href: '#/q/' + code, k: '4 / 5', label: '사기 전에 한 번 멈출까?'}});
}

/* ── 정산(#/r/t) — 서른여섯 꾀 표만 ── */
export async function vSettle36(X) {
  const [D, T, {S}] = await Promise.all([X.get(DST), load21(X.get), X.base()]), G = await g36Of(X, T), nameOf = k => G.name[k] ?? '제' + kNo(k) + '계';
  if (!D || !Array.isArray(D.buys) || !Array.isArray(D.kinds)) return missPage(X, '정산', '정산 장부를 받지 못했어요. 잠시 뒤 다시 열어 주세요.');
  const ST = settle36(D), {K, T: TT, rows} = ST, first = rows.map(r => r.day).sort()[0] ?? null, rated = K.some(x => rateOf(x) !== null);
  const mx = Math.max(0, ...K.map(rateOf).filter(v => v !== null).map(Math.abs));
  const dn = K.filter(x => x.st === 'dn').sort((a, b) => a.diff - b.diff);
  const bar = x => brushBar(rateOf(x), mx); // 붓 막대 — 늘면 오른쪽 먹 획 · 줄면 왼쪽 남빛 획(주문 1116-0118)
  const kids = [
    pageHead({kick: '정산 · 10주씩 산 셈 · 가짜 돈', h1: '서른여섯 꾀 정산', seal: '셈', sealDn: TT.st === 'dn', pic: h('figure', {class: 'sj-ink sj-herofig'}, meanCap(PM.ledger, 'figcaption'), heroPic('ledger')),
      say: (first ? mday(first) + '부터 ' : '') + '날마다 서른여섯 꾀가 고른 곳을 10주씩 산 셈이에요. 가짜 돈이고, 줄어든 꾀도 숨기지 않아요.',
      more: [h('dl', {class: 'sj-money sj-money-big', 'data-st': TT.st}, h('dt', {text: '산 돈'}), h('dd', {text: won(TT.cost)}), h('dt', {text: '지금'}), h('dd', {text: TT.n ? won(TT.val) : SAID.none})),
        h('p', {class: 'sj-res sj-res-big', 'data-st': TT.st}, shapeI(TT.st), h('b', {text: resText(TT)})),
        h('p', {class: 'sj-note', text: (first ? mday(first) + '부터 · ' : '') + '산 셈 ' + NF.format(rows.length) + '번 · 고른 날 ' + NF.format(TT.days) + '일' + (ST.miss ? ' · 값이 없어 못 센 ' + NF.format(ST.miss) + '번' : '') + (ST.asOf ? ' · ' + mday(ST.asOf) + ' 값까지' : '')})]}),
    h('section', {class: 'sj-sec sj-st36', 'aria-label': '꾀마다 정산', 'data-n': String(K.length)},
      head('셈', '제1장', h('h2', {class: 'sj-h2'}, h('span', {class: 'sj-brush', text: '꾀마다 정산'}), h('span', {class: 'sj-h2n', text: ' ' + K.length + '가지'}))),
      h('p', {class: 'sj-rule', text: rated ? '산 돈에 견줘 많이 늘어난 꾀가 맨 위예요. 날마다 다시 줄 세워요. 줄어든 꾀도 숨기지 않아요.' : '아직 하루치라서 꾀 차례로 놓았어요. 하루가 더 지나면 많이 늘어난 꾀가 맨 위로 가요.'}),
      h('p', {class: 'sj-loss', 'data-say': '', text: dn.length ? '줄어든 꾀 ' + dn.length + '가지 · 가장 많이 줄어든 꾀는 ' + nameOf(dn[0].key) + '(' + won(-dn[0].diff) + ' 줄었어요)' : '줄어든 꾀는 아직 없어요.'}),
      meanCap(PM.bars), // 붓 막대 그림 뜻 — 줄 맨 위 한 번(주문 1116-1313)
      h('ol', {class: 'sj-stl'}, ...K.map((x, i) => h('li', {class: 'sj-str', 'data-k': x.key, 'data-st': x.st},
        h('a', {class: 'sj-sta', href: '#/k/' + x.key, 'aria-label': (i + 1) + '번째 · ' + nameOf(x.key) + ' · ' + resText(x)},
          h('span', {class: 'sj-stn', text: String(i + 1)}), h('b', {class: 'sj-stk', text: nameOf(x.key)}), h('i', {'aria-hidden': 'true', text: '›'})),
        h('p', {class: 'sj-stv'}, h('span', {text: '산 돈 ' + won(x.cost)}), h('span', {class: 'sj-res', 'data-st': x.st}, shapeI(x.st), h('span', {text: resText(x)}))),
        bar(x)))),
      h('div', {class: 'sj-sttot', 'data-st': TT.st}, h('b', {text: '모두'}), h('span', {text: '산 돈 ' + won(TT.cost)}), h('span', {class: 'sj-res', 'data-st': TT.st}, shapeI(TT.st), h('span', {text: resText(TT)}))),
      h('p', {class: 'sj-safe', text: '가짜 돈으로 지난 기록을 센 표예요. 앞날을 맞히지 않고, 사고팔기를 권하지 않아요.'}),
      endSeal('셈')),
    endSec(ST.asOf ? day(ST.asOf) : day(T?.asOf?.board), gotOf(S), '지금 값은 그 회사의 가장 늦은 마지막 값이에요. 산 날 뒤 값이 아직 없으면 하루치로 셈해요.')];
  return frame({title: '정산', page: 'settle', kids, tab: 4, lc: X.cur?.()?.code ?? null, next: {href: '#/k', label: '서른여섯 꾀는 어떤 꾀인가?'}});
}
export {chev};
