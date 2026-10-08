/* ATLAS 11 · 「불장 닮은 7곳」(#/similar · 아래 탭 「예비」) — 예측 없음
   2026-10-05 05:03 사장님 「탬을 두개 더 만든다 가장 눈요겨 볼것 그것은 불장에 공통된점을 찾아 아직 불징이 아닌 종목 7개를 곧 예비후보가 될 가능성을 있다는것 한탐하고
     매일 7시에 저냑 7시에 불장에서 내오든 불장같은 것이 불장이 된것이든 즉 여러 주건들에 이동이 내영되게 하라」 · 05:07 「해」
   05:05 그림 카드대로 — 「곧 될 가능성」은 앞날 말이라 숫자·말로 쓰지 않고, 같은 고르는 법을 지난 사실의 이름(「불장 닮은 7곳」)으로 보인다
   맨 위: 저녁 7시 들고 남(바로 앞 기록과 견줌) → 7곳(줄마다 공통점 ✓) → 불장 회사들의 공통점(불장 · 나머지 몇 %인지 막대) → 어떻게 셌나(접어 둠)
   셈은 lib/atlas11/similar.mjs(판을 만들 때) — 화면은 판에 적힌 값만 그린다 */
import {similarArt, quietArt} from './scenes.js'; // 그림 한 장(매화 가지 · 규칙 33) · 닮은 곳이 0곳인 날은 빈 하늘(2026-10-08 05:05 빈 날 막기)
import {h, korDate, pct, signCls, finite, place} from './util.js';
import {state, loadBoard} from './store.js';
import {foot, sparkSvg, sparkScale, hotSwitch, hotCounts, movesBox, sunTag} from './parts.js';
import {sunOf} from './shapes.js';
export {movesBox};
import {mode} from './view-home.js';
import {riseDesc} from './family.js';
import {similarReason, beatsEl} from './reason.js'; // 「왜 예비인가」 기승전결 넷(2026-10-08 06:48 「왜 예비 후보인지 그 근거와 이유가 분명히 기승전결로」)

const share = x => x.known ? x.yes / x.known : 0;
const pc = v => `${Math.round(v * 100)}%`;

// 저녁 7시 들고 남 칸(movesBox)은 parts.js 로 옮김 — 탭 「불장」의 세 화면(불장 · 예비 · 오름 상위) 스위치 바로 아래 같은 자리에 같은 칸(2026-10-05 「잡스라면」 24번)

/** 공통점 표시 — ✓ 가짐 · 「·」 안 가짐 · 「?」 값 모름(색만이 아니라 글자로) */
function chips(x, common) {
  return h('span', {class: 'sm-chips'}, ...common.map(t => {
    const has = x.has.includes(t.id), unknown = x.unknown?.includes(t.id);
    return h('span', {class: 'sm-chip' + (has ? ' on' : unknown ? ' unk' : ''), 'data-trait': t.id}, h('span', {class: 'sm-ck', 'aria-hidden': 'true'}, has ? '✓' : unknown ? '?' : '·'), has ? t.chip : unknown ? `${t.chip} 모름` : t.chip);
  }));
}
/** 「왜 예비인가」 — 줄 아래 접힌 칸(누르면 기승전결 넷 · reason.js) · 줄 링크(.sm-row) 밖 · 뒤에 둠(줄 모양 그대로 — 검사기가 줄을 읽음) */
function whyFold(board, x) {
  const beats = similarReason(board, x);
  return beats ? h('details', {class: 'rs-fold', 'data-why': 'similar'}, h('summary', {'aria-label': `${x.name} · 왜 예비인가`}, '왜 예비인가'), beatsEl(beats, {speak: true})) : null;
}
function similarList(sim, byCode, items = sim.items ?? [], shp = null, board = null) {
  const common = (sim.common ?? []).map(id => sim.traits.find(t => t.id === id)).filter(Boolean);
  if (!items.length) return h('p', {class: 'b-note'}, sim.hotCompanies ? `불장 밖에서 공통점을 ${sim.need}가지 넘게 가진 회사가 없습니다` : '불장 업종이 없어 공통점을 셀 수 없습니다');
  const sc = sparkScale(items.map(x => byCode.get(x.code)).filter(Boolean));
  return h('ol', {class: 'sm-list'}, ...items.map((x, i) => { const c = byCode.get(x.code);
    return h('li', {class: 'sm-li', 'data-code': x.code}, h('a', {class: 'sm-row', href: '#/stock/' + x.code, 'aria-label': `${i + 1}. ${x.name} · ${x.groupLabel ?? ''} · 공통점 ${common.length}가지 중 ${x.matched}가지 · 지난 20거래일 ${pct(x.change20, 1)}`},
      h('span', {class: 'sm-no', 'aria-hidden': 'true'}), // 차례 숫자는 CSS 셈(counter)으로 그림 — 글로 세지 않는 표시
      h('span', {class: 'nc-mid'}, h('span', {class: 'nc-name'}, x.name, sunTag(shp?.sparkle.has(x.code))), h('small', {class: 'nc-ind'}, x.groupLabel ?? '')),
      c ? sparkSvg(c, sc) : h('span', {class: 'sp-none'}, '선 그래프 없음'),
      h('b', {class: 'chg20 nc-chg ' + (signCls(x.change20) || 'flat')}, finite(x.change20) ? pct(x.change20, 1) : '없음'),
      // 공통점을 모두 가진 줄은 「✓ 모두」 한마디(2026-10-05 15:24 「잡스가 … 36가지」 D3 — 같은 칩 다섯이 줄마다 되풀이되지 않게 · 무엇인지는 아래 「불장 회사들의 공통점」)
      h('span', {class: 'sm-cnt'}, h('b', null, `공통점 ${common.length}가지 중 ${x.matched}가지`), x.matched === common.length && common.length ? h('span', {class: 'sm-all'}, '✓ 모두') : chips(x, common))),
      board ? whyFold(board, x) : null); }));
}
/** 공통점 막대 한 줄 — 불장 회사 · 나머지 회사 가운데 몇 %가 가졌나(폭은 CSSOM 으로만) */
function traitRow(t, sim) {
  const bar = (who, x, cls) => { const b = h('span', {class: 'tr-fill ' + cls}); b.style.width = `${Math.max(1, share(x) * 100)}%`;
    return h('span', {class: 'tr-line'}, h('span', {class: 'tr-who'}, who), h('span', {class: 'tr-track', 'aria-hidden': 'true'}, b), h('b', {class: 'tr-val'}, pc(share(x))), h('small', {class: 'tr-n'}, `${x.yes}/${x.known}곳`)); };
  return h('li', {class: 'tr-row', 'data-trait': t.id},
    h('p', {class: 'tr-h'}, h('b', null, `✓ ${t.chip}`), h('span', {class: 'tr-rule'}, t.rule)),
    bar(`불장 ${sim.hotCompanies}곳`, t.hot, 'hot'), bar(`나머지 ${sim.restCompanies}곳`, t.rest, 'rest'));
}
function howBox(sim, board) {
  const r = sim.rules ?? {}, noFlows = place.flows === false;
  // 미국 판: 수급 공개 자료가 없어 수급 공통점(외국인·기관·보유)은 한 곳도 셀 수 없다 — 0/0곳 줄을 늘어놓지 않고 뺐다고 적는다(2026-10-05 18:02 「미국 주식도」)
  const traits = noFlows ? sim.traits.filter(t => t.hot.known || t.rest.known) : sim.traits, cut = sim.traits.length - traits.length;
  return h('details', {class: 'b-how'}, h('summary', null, `어떻게 셌나 · 공통점 후보 ${traits.length}가지 모두`),
    h('ul', null,
      h('li', null, `불장 = 지난 20거래일 동안 업종 회사들의 종가가 평균 많이 오른 업종 ${board.hot?.items?.length ?? 0}개(첫 화면 「불장」) · 그 업종 회사 ${sim.hotCompanies}곳과 나머지 ${sim.restCompanies}곳을 견줌`),
      h('li', null, `공통점 = 아래 후보 가운데 불장 회사의 ${pc(r.minShare ?? .5)} 넘게 가졌고, 나머지 회사보다 ${Math.round((r.minGap ?? .1) * 100)}%p 넘게 많이 가진 것${sim.filled ? ` · 그런 것이 ${r.minCommon ?? 3}가지보다 적어 차이가 큰 차례로 채움` : ''}`),
      h('li', null, `닮은 7곳 = 불장 업종 밖 회사 가운데 공통점을 많이 가진 차례(${sim.need}가지 이상만) · 같으면 지난 20거래일 많이 오른 차례 · 한 업종 ${sim.perIndustry}곳까지`),
      h('li', null, noFlows ? '판을 새로 만들 때마다(「미국 주식 자료 받기」를 누를 때) 다시 셉니다' : '판을 새로 만들 때마다(거래일 16:00 · 저녁 7시) 다시 셉니다 · 들고 남은 저녁 7시 기록끼리 견줍니다(기록은 지우지 않음)'),
      h('li', null, noFlows ? `지난 종가 · 기사로 센 것입니다(미국은 수급 자료가 없어 수급 공통점 ${cut}가지는 뺌) · 앞날을 맞히지 않습니다` : '지난 종가 · 수급 · 기사로 센 것입니다 · 앞날을 맞히지 않습니다')),
    h('ol', {class: 'tr-all'}, ...traits.map(t => h('li', {'data-common': String(t.common)}, h('b', null, `${t.common ? '✓ 공통점' : '· 아님'} — ${t.chip}`), `: ${t.rule} · 불장 ${pc(share(t.hot))}(${t.hot.yes}/${t.hot.known}곳) · 나머지 ${pc(share(t.rest))}(${t.rest.yes}/${t.rest.known}곳)`))));
}

export async function renderSimilar(main, {manifest}) {
  const board = await loadBoard();
  const sim = board.similar ?? {items: [], traits: [], common: [], hotCompanies: 0, restCompanies: 0};
  const byCode = new Map(board.companies.map(c => [c.code, c])), to = mode(board.companies.map(c => c.date)) ?? board.asOf, shp = sunOf(board);
  const common = (sim.common ?? []).map(id => sim.traits.find(t => t.id === id)).filter(Boolean), n = sim.items?.length ?? 0, hotN = board.hot?.items?.length ?? 0;
  // 고르는 법(공통점 많은 차례)은 그대로 · 보이는 차례는 지난 20거래일 많이 오른 순(2026-10-05 11:36 「모든 배치가 가장 많이 상승한순으로」)
  const shown = [...(sim.items ?? [])].sort(riseDesc);
  state.summary = `${korDate(to)} 종가 기준. 예비, 불장 닮은 ${n}곳. 불장 ${hotN}개 업종 ${sim.hotCompanies}곳의 공통점 ${common.length}가지: ${common.map(t => t.chip).join(', ')}. ${shown.map((x, i) => `${i + 1}. ${x.name}, ${common.length}가지 중 ${x.matched}가지`).join('. ')}.`;
  main.replaceChildren(h('div', {class: 'b-page s-page'},
    hotSwitch('similar', hotCounts(board)),
    similarArt(board) ?? quietArt({key: 'similar', label: '예비', word: '0곳', when: `${korDate(board.asOf)} 종가`}), // 그림 한 장(매화 가지 · 규칙 33 · 0곳인 날은 빈 하늘) — 넣으면서 뺀 것: 아래 긴 설명 두 줄(「어떻게 셌나」로 접음)
    movesBox(board.moves),
    h('header', {class: 'b-head'},
      h('h1', {class: 'b-title', 'data-speak': ''}, '예비 ', h('span', {class: 'b-count'}, `${n}곳`)),
      h('details', {class: 'b-how ak-more'}, h('summary', null, '어떻게 셌나'), h('p', {class: 'b-when', 'data-speak': ''}, `불장 닮은 ${n}곳 — 불장 ${hotN}개 업종 ${sim.hotCompanies}곳의 공통점 ${common.length}가지를 많이 가진, 불장 밖 회사 · ${korDate(to)} 종가`),
        h('p', {class: 't-sub'}, `지난 20거래일 많이 오른 순 · 줄마다 공통점 ✓(모두 가지면 「✓ 모두」) · 선 그래프는 ${n}곳이 같은 눈금(지난 20거래일 · 점선 = 첫날 종가) · 누르면 회사 화면`))),
    h('section', {class: 't-sec sm-sec', 'aria-label': `닮은 ${n}곳`},
      similarList(sim, byCode, shown, shp, board)),
    h('section', {class: 't-sec', 'aria-label': '불장 회사들의 공통점'},
      h('h2', {class: 't-h2', 'data-speak': ''}, `불장 회사들의 공통점 ${common.length}가지`),
      h('p', {class: 't-sub'}, `막대 = 그 점을 가진 회사가 몇 %인가 · 위 불장 ${sim.hotCompanies}곳 · 아래 나머지 ${sim.restCompanies}곳`),
      common.length ? h('ul', {class: 'tr-list'}, ...common.map(t => traitRow(t, sim))) : h('p', {class: 'muted small'}, '공통점을 셀 불장 업종이 없습니다')),
    howBox(sim, board),
    foot(manifest)));
}
