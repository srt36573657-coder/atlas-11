/* 셋의 길 — 옛 기능을 하나도 버리지 않고 셋(불장 · 꽃이 될 · 돈이 몰리는)을 돕는 자리에 놓음(빈 파일에서 새로 씀)
   사장님 2026-11-04 18:54(+03) 「수르 명령서 — 잡스 판」 [4] 1 ~ 8 · [5] 1 ~ 3
     「자료 2의 기능을 하나도 빼지 말고 넣어라」 「옛 기능은 자료 2 묶음대로 셋의 길에 놓아라」 「모든 기능이 새 판 안에서 열리게 해라」
     「어느 기능이든 7번 안에 닿게 해라」 「셋에 안 이어지는 기능은 따로 보고해라 (지우지 말고 사장님이 정하시게 한다)」
     「급등 다섯 칸과 급등 달력은 불장 7곳 곁에 둬라」 「급등 종목이 365곳 안이면 불장 칸과 이어라」 「급등 곁에는 며칠 뒤 기록을 늘 붙여라」
   길: 21곳(#/) → 셋의 길(#/g · 한 번) → 그 묶음(#/g/<묶음> · 두 번) → 기능(세 번) — 일곱 번 안
   옛 쪽(/next/ · /atlas/)은 ?su=<묶음> 을 붙여 열면 수르 탭 · 앵무새가 그 위에 얹힘(su-wrap.js) · 수르 쪽 기능(#/…)은 그대로 수르 안
   명단 = /su/su-feat.js FEAT(자료 2 그대로 · 열리는 주소는 브라우저로 따로 열어 봄) */
import {h, s} from '/su/su-fig.js';
import {val, NEED} from '/su/su-six.js';
import {NAME} from '/next/brand.js';

export const ORDER = Object.freeze(['hot', 'bloom', 'money', 'stop', 'guide', 'guest', 'back', 'sky']);
export const HEAD = Object.freeze({hot: '불장을 돕는 것', bloom: '꽃을 돕는 것', money: '돈을 돕는 것', stop: '사기 전에 멈추게 돕는 것', guide: '길잡이', guest: '손님 부르기', back: '뒤에서 도는 것', sky: '하늘 · 뒷배경'});
export const SHORT = Object.freeze({hot: '불장', bloom: '꽃이 될', money: '돈이 몰리는', stop: '멈춤', guide: '길잡이', guest: '손님', back: '뒤에서', sky: '하늘'});
const HELP = {hot: '불장 7곳', bloom: '꽃이 될 7곳', money: '돈이 몰리는 7곳', three: '셋 모두'};
let FP = null;
export const feats = () => (FP ??= import('/su/su-feat.js').then(m => m.FEAT ?? []).catch(() => []));

/** 기능 하나의 주소 — 수르 쪽(#/…)은 그대로 · 옛 쪽은 ?su=<묶음>(수르 틀) · 없으면 null
    co = 그날 21곳 안 회사 번호 — 회사 자세히(#/c/<번호>/more)는 21곳 안 회사만 열려서, 명단을 만든 날 번호 대신 그날 불장 첫 회사로 엶 */
export function hrefOf(f, g = f?.group, co = null) {
  let o = f?.open; if (!o) return null;
  if (co && /^[0-9A-Z]{6}$/.test(co) && /^#\/c\/[0-9A-Z]{6}\/more$/.test(o)) o = '#/c/' + co + '/more';
  if (o.startsWith('#/')) return o;
  try { const u = new URL(o, 'https://aaa7377.com'); u.searchParams.set('su', ORDER.includes(g) ? g : 'guide'); return u.pathname + u.search + u.hash; } catch { return null; }
}
const helpText = f => (f.helps ? '돕는 것 · ' + (HELP[f.helps] ?? f.helps) : '셋과 안 이어짐 · 사장님이 정하실 것');
/** 화면 이름 — 명단(su-feat.js)의 name 은 자료 2 글자 그대로 · 화면에 쓰지 않는 말이 든 이름은 say 로 보임 · 「(사장님만)」은 따로 붙임 */
export const nameOf = f => (f?.say ?? f?.name ?? '').replace(/\s*\(사장님만\)\s*$/, '');
/** 누를 곳이 없는 칸의 한 줄 — 하늘은 뒷배경에서 날고, 옛 화면에만 있던 것은 여는 곳이 없음 */
const noneText = f => (f.group === 'sky' ? '뒷배경에서 날아요' : '지금은 여는 곳이 없어요');
const noneShort = f => (f.group === 'sky' ? '뒷배경' : '여는 곳 없음');

/** 묶음 막대 그림 — 묶음마다 기능 수(셋은 21칸과 같은 색 · 돕는 길은 옅은 금빛) */
function roadBars(rows) {
  const W = 390, rh = 44, H = rows.length * rh + 12, max = Math.max(1, ...rows.map(r => r.n));
  return s('svg', {class: 'su-svg su-roads', viewBox: `0 0 ${W} ${H}`, role: 'img', 'aria-label': '묶음마다 옛 기능 수'},
    rows.map((r, i) => { const y = 6 + i * rh, w = 168 * r.n / max, cls = {hot: 'g-bad', bloom: 'g-basefill', money: 'g-ok'}[r.g] ?? 'g-mute'; // 셋은 21칸과 같은 색(불장 살구 · 꽃 연두 · 돈 금빛 — 주문 0054 [2] 3) · 돕는 길은 옅은 금빛
      return [s('text', {x: 12, y: y + 27, class: 'g-tl g-tsub', text: SHORT[r.g]}), s('rect', {x: 120, y: y + 8, width: Math.max(4, w), height: 26, rx: 13, class: cls + ' b' + (1 + (i % 4)) + ' a-gx'}),
        s('text', {x: 128 + w, y: y + 28, class: 'g-tl g-tland', text: r.n + '가지'})]; }));
}

/** 셋의 길 모두(#/g) · 묶음 하나(#/g/<묶음>) */
export async function vRoads(X, g = null) {
  const [{S}, F, T] = await Promise.all([X.base(), feats(), import('/su/su-21.js').then(m => m.load21(X.get)).catch(() => null)]);
  const co = T?.lists?.hot?.[0]?.code ?? null; // 회사 자세히를 여는 그날 21곳 안 회사
  const by = k => F.filter(f => f.group === k);
  if (!g) {
    const rows = ORDER.map(k => ({g: k, n: by(k).length}));
    const open = F.filter(f => hrefOf(f)).length, none = F.filter(f => !f.helps), skyN = F.filter(f => !hrefOf(f) && f.group === 'sky').length, goneN = F.length - open - skyN;
    const big = val(F.length, '가지', '옛 기능 모두 · 하나도 버리지 않음', {누가: NAME, 언제: null, 어디서: '셋의 길 여덟 묶음', 무엇을: '옛 기능을 묶음대로 셋의 길에 놓았어요', 어떻게: '사장님이 정하신 묶음 그대로', 왜: '모든 기능이 셋을 돕게 하려고요'},
      {mean: '옛 기능 ' + F.length + '가지가 모두 수르 안에 자리가 있다는 뜻이에요.'});
    const mids = [val(open, '가지', '누르면 수르 틀 안에서 열림', {누가: NAME, 언제: null, 어디서: '수르 · 옛 쪽', 무엇을: '열리는 주소가 있는 기능', 어떻게: '브라우저로 하나씩 열어 봤어요', 왜: '튕기지 않게 하려고요'}, {mean: '뒷배경 하늘 ' + skyN + '가지' + (goneN ? '와 옛 화면에만 있던 ' + goneN + '가지' : '') + '를 빼면 모두 열린다는 뜻이에요.'}),
      val(none.length, '가지', '셋과 안 이어짐', {누가: NAME, 언제: null, 어디서: '셋의 길', 무엇을: none.map(nameOf).join(' · ') || null, 어떻게: '셋 가운데 무엇을 돕는지 하나씩 적었어요', 왜: '지우지 않고 사장님이 정하시게'}, {mean: none.length ? '이 기능들은 지우지 않고 그대로 두었다는 뜻이에요.' : '모두 셋 가운데 하나를 돕는다는 뜻이에요.'})];
    const list = h('section', {class: 'su-roadl', 'aria-label': '묶음'}, h('h2', {class: 'su-ft', text: '묶음 여덟 · 누르면 그 길'}),
      ORDER.map(k => h('a', {class: 'su-fcard', href: '#/g/' + k}, h('b', {text: HEAD[k] + ' · ' + by(k).length + '가지'}), h('span', {text: by(k).slice(0, 4).map(nameOf).join(' · ') + (by(k).length > 4 ? ' …' : '')}))));
    return {title: '셋의 길', tab: 0, kick: '옛 기능 자리', h1: '셋의 길', big,
      ...X.artHero('su-road-art', 'roads', X.fig('roads', [roadBars(rows)], {label: '셋의 길 묶음', hero: true, cap: ['옛 기능을 여덟 묶음으로 나눴어요.', '셋(불장 · 꽃이 될 · 돈이 몰리는)을 돕는 묶음이 맨 위예요.', '그런데 하늘 그림처럼 누르는 기능이 아닌 것도 있어요.', '그래서 묶음을 누르면 그 기능이 수르 안에서 열려요.']})),
      mids, body: [list], pro: F.map(f => ({k: SHORT[f.group] + ' · ' + nameOf(f), v: hrefOf(f) ? '열림' : noneShort(f), how: f.how + ' · ' + helpText(f)})),
      next: {href: '#/g/hot', label: '불장을 돕는 것은?'}, asOf: null, S};
  }
  if (!ORDER.includes(g)) return X.notFound('이 길을 찾지 못했어요.');
  const L = by(g), first = L.find(f => hrefOf(f, g, co));
  const big = val(L.length, '가지', HEAD[g], {누가: NAME, 언제: null, 어디서: '셋의 길 · ' + SHORT[g], 무엇을: L.map(nameOf).join(' · ') || null, 어떻게: '사장님이 정하신 묶음 그대로', 왜: ['hot', 'bloom', 'money'].includes(g) ? HELP[g] + '을 볼 때 함께 쓰려고요' : '셋을 찾는 길을 도우려고요'},
    {mean: L.length + '가지 기능이 ' + (['hot', 'bloom', 'money'].includes(g) ? HELP[g] + ' 곁에' : '이 길에') + ' 있다는 뜻이에요.'});
  const card = f => { const href = hrefOf(f, g, co);
    return h(href ? 'a' : 'div', {class: 'su-fcard su-feat' + (href ? '' : ' su-featx'), href: href ?? null, 'data-feat': f.id},
      h('b', {text: nameOf(f) + (f.owner ? ' · 사장님만' : '')}), h('span', {text: f.how}), h('em', {class: 'su-help', text: helpText(f)}), href ? null : h('em', {class: 'su-help', text: noneText(f)})); };
  const body = [h('section', {class: 'su-flist', 'aria-label': HEAD[g]}, h('h2', {class: 'su-ft', text: HEAD[g] + ' · 누르면 수르 안에서 열림'}), L.map(card))];
  if (g === 'hot') body.unshift(surgeBox(X));
  return {title: HEAD[g], tab: g === 'stop' ? 3 : g === 'back' || g === 'guest' ? 2 : 0, kick: '셋의 길 · ' + SHORT[g], h1: HEAD[g], big,
    ...X.artHero('su-road-art', 'roads', X.fig('roads', [roadBars([{g, n: L.length}, ...ORDER.filter(k => k !== g).slice(0, 3).map(k => ({g: k, n: by(k).length}))])], {label: HEAD[g], hero: true, cap: [HEAD[g] + ' ' + L.length + '가지예요.', '다른 묶음과 견주어 보여요.', '그런데 옛 쪽 글과 숫자는 바꾸지 않았어요.', '그래서 누르면 옛 쪽이 수르 틀 안에서 열려요.']})),
    mids: [], body, pro: L.map(f => ({k: nameOf(f), v: hrefOf(f, g, co) ? '열림' : noneShort(f), how: (hrefOf(f, g, co) ?? '주소 없음') + ' · ' + helpText(f)})),
    next: first ? {href: hrefOf(first, g, co), label: nameOf(first) + ' 열기'} : {href: '#/g', label: '셋의 길 모두'}, asOf: null, S};
}

/** 불장 곁 급등(주문 0054 [5] 1 ~ 3) — 급등 다섯 칸 · 급등 달력 고리 + 급등 회사 가운데 365곳 안 · 불장 7 이음 + 며칠 뒤 기록 고리 */
function surgeBox(X) {
  const box = h('section', {class: 'su-why su-surge', 'aria-label': '불장 곁 급등'}, h('h2', {class: 'su-ft', text: '불장 곁 · 급등 다섯 칸 · 급등 달력'}),
    h('p', {class: 'su-lead', text: '닷새 동안 크게 오른 회사 목록이에요. 크게 오른 뒤 며칠 뒤에 어땠는지 기록을 꼭 함께 봐요.'}),
    h('p', {class: 'su-chips'}, h('a', {class: 'su-chipa su-chip21', href: '/next/?su=hot#/surge', text: '급등 다섯 칸 ›'}), h('a', {class: 'su-chipa', href: '/next/?su=hot#/cal', text: '급등 달력 ›'}), h('a', {class: 'su-chipa', href: '/next/?su=hot#/surge', text: '며칠 뒤 기록 ›'})));
  Promise.all([X.get('/atlas/data/surge.json').catch(() => null), import('/su/su-21.js').then(m => m.load21(X.get)).catch(() => null), X.get('/su/data/su21-map.json').catch(() => null)]).then(([U, T, M]) => {
    const mem = Array.isArray(U?.members) ? U.members : [];
    if (!mem.length) { box.append(h('p', {class: 'su-help', text: '급등 목록을 받지 못했어요. 확인 필요.'})); return; }
    const hot = new Set((T?.lists?.hot ?? []).map(c => c.code)), in365 = new Set((M?.lands ?? []).flatMap(L => L.inds.flatMap(g => g.cos.map(c => c.code))));
    const top = [...mem].sort((a, b) => (b.r5 ?? -1e9) - (a.r5 ?? -1e9)).slice(0, 7);
    box.append(h('p', {class: 'su-help', text: (U.asOf ?? NEED) + ' 까지 닷새 · 급등 ' + mem.length + '곳 가운데 많이 오른 차례 일곱 · 365곳 안이면 ✦'}),
      h('ol', {class: 'su-surgel'}, top.map(m => { const in3 = in365.has(m.c) || hot.has(m.c);
        return h('li', {}, h('a', {class: 'su-chipa' + (in3 ? ' su-chip21' : ''), href: in3 ? '#/c/' + m.c : '/next/?su=hot#/w/' + m.c, 'data-proper': ''}, in3 ? '✦ ' : '', m.n ?? m.c),
          h('span', {class: 'su-help', text: (hot.has(m.c) ? '불장 7에도 · ' : in3 ? '365곳 안 · ' : '365곳 밖 · ') + '닷새 ' + (Number.isFinite(m.r5) ? (m.r5 > 0 ? '+' : '') + m.r5.toFixed(1) : NEED)})); })),
      h('p', {class: 'su-help', text: '크게 오른 것을 자랑하지 않아요. 며칠 뒤 기록은 급등 다섯 칸 쪽에서 함께 봐요.'}));
  });
  return box;
}
