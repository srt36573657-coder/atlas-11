/* ATLAS 11 · 처음 화면(#/) — 예측 없음 · 「36칸 판」
   2026-10-04 21:04 사장님 「업종 36개에서 180개 회사를 찾아서 요즘 불장인 11개를 찾아내고 다음 불장이 예상되는 22개 회사도 찾아내 180개 회사내에서」
   2026-10-04 21:55 「자 이제 학습한것 이상으로 만들어」 — 처음 화면(36칸 판) → 업종 화면(#/i/<업종>) → 회사 화면 · 두 번이면 어디든
   2026-10-05 02:44 「잡스가 이 아틀람스를 만들었다면 … 깊이 있는 공부를 한후 아틀란스를 대대적으로 잡스였다면이라는 기준으로 개혁하라」
     — 보고서 「잡스였다면 ATLAS 개혁 공부」(조사 넷 · 인용 106곳)의 개혁안대로 · 사장님이 시키신 아홉(180곳 · 업종 36 · 불장 11 · 22곳 · 출목표 · 첫 화면 선 그래프 · 수급·기사 · 예측 없음 · 고급 마감)은 그대로:
     · 첫 줄 = 결론 한 문장(업종 36개 가운데 몇 개가 올랐나 · 기간 날짜) · 「요즘」 대신 날짜 — 애플 차트 지침 「그래프 위에 무엇이 일어났나 한 문장」
     · 칸 하나에 넷 — 이름 · ▲변화 · 몇 곳 오름 · 「불장 n위」(순위와 불장 표시를 하나로) — 애플 WWDC20 「작은 칸엔 정보 넷까지」
       칸 바탕의 세기 색과 색 보기표는 덜어 냄: 칸 차례가 이미 크기를 말한다 · 빨강 세기를 키우면 판단을 흔든다(Bazley 외 2021) · 위 가는 선 하나만 오름 빨강 / 내림 파랑
     · 「다음 불장 후보」 → 「불장 밖에서 많이 오른 22곳」 — 셈법과 22곳은 그대로, 앞날을 말하는 이름만 지난 일을 말하는 이름으로(사장님 「예측 없음」 · 투자 조언으로 읽힐 위험)
       한 줄에 넷: 이름 · 업종 · 작은 선 그래프(22곳 같은 눈금) · ▲변화
     · 회사 종류 줄은 접힌 「어떤 회사들인가」 안으로 · 「ATLAS가 하지 않는 일」을 밝힌다(잡스: 안 한 일도 자랑) */
import {h, korDate, pct, finite, signCls} from './util.js';
import {state, loadBoard} from './store.js';
import {marketStrip} from './frame.js';
import {nextBox, foot, promiseBox, sparkSvg, sparkScale} from './parts.js';

const span = (from, to) => from && to ? `${korDate(from)}부터 ${korDate(to)}까지` : '';
/** 가장 많은 값(같으면 늦은 날) — 한 회사 종가가 늦어도 판 전체의 기간 글이 흔들리지 않게 */
const mode = xs => { const n = new Map(); for (const x of xs) if (x) n.set(x, (n.get(x) ?? 0) + 1); return [...n].sort((a, b) => b[1] - a[1] || (a[0] < b[0] ? 1 : -1))[0]?.[0] ?? null; };
/** 「업종 36개 · 우량주 114곳 · 시대 트렌드 51곳 · 흑자 11곳 · 채움 4곳」(없는 것은 빼고) */
export const kindsLine = (k, n) => [`업종 ${n}개`, `우량주 ${k.quality ?? 0}곳`, `시대 트렌드 ${k.trend ?? 0}곳`, k.profit ? `흑자 ${k.profit}곳` : null, k.size ? `채움 ${k.size}곳` : null].filter(Boolean).join(' · ');
export const upLine = g => g.measured ? (g.up === g.measured ? `${g.measured}곳 모두 오름` : g.up === 0 ? '오른 곳 없음' : `${g.measured}곳 중 ${g.up}곳 오름`) : '변화 없음';
/** 결론 한 문장 — 업종 몇 개가 올랐나(지난 20거래일 평균이 0 보다 큰 업종) */
export const headLine = (groups, n, from, to) => `업종 ${groups.length}개 가운데 ${groups.filter(g => finite(g.change20) && g.change20 > 0).length}개 오름 · ${n}곳 · 지난 20거래일 · ${span(from, to)}`;

/** 36칸 판의 칸 하나 — 넷: 「불장 n위」(또는 n위) · 이름 · ▲변화 · 몇 곳 오름 · 누르면 그 업종 화면 */
function tile(g, i) {
  const sg = signCls(g.change20) || 'flat';
  return h('a', {class: `t-tile s-${sg}${g.hot ? ' t-hot' : ''}`, href: '#/i/' + g.id, 'data-group': g.id, 'aria-label': `${g.hot ? '불장 ' : ''}${i + 1}위 ${g.label} · 지난 20거래일 ${finite(g.change20) ? pct(g.change20, 1) : '없음'} · ${upLine(g)}`},
    h('span', {class: 't-top'}, g.hot ? h('span', {class: 't-fire'}, `불장 ${i + 1}위`) : h('span', {class: 't-rank'}, `${i + 1}위`)),
    h('span', {class: 't-name'}, g.label),
    h('span', {class: 't-chg', 'data-sign': signCls(g.change20) || null}, finite(g.change20) ? pct(g.change20, 1) : '없음'), // 세모(▲▼)는 style.css 가 붙임 — 글자는 그대로
    h('span', {class: 't-up'}, upLine(g)));
}
/** 불장 밖에서 많이 오른 회사(한 업종 2곳까지) — 한 줄에 넷: 이름 · 업종 · 작은 선 그래프(모든 줄 같은 눈금) · ▲변화 */
function nextList(next, byCode) {
  const items = next?.items ?? [];
  if (!items.length) return h('p', {class: 'muted small'}, '불장 업종 밖에서 지난 20거래일 동안 오른 회사가 없습니다');
  const sc = sparkScale(items.map(x => byCode.get(x.code)).filter(Boolean));
  return h('ol', {class: 'nc-list'}, ...items.map(x => { const c = byCode.get(x.code);
    return h('li', null, h('a', {class: 'nc-row', href: '#/stock/' + x.code},
      h('span', {class: 'nc-mid'}, h('span', {class: 'nc-name'}, x.name), h('small', {class: 'nc-ind'}, x.groupLabel ?? '')),
      c ? sparkSvg(c, sc) : h('span', {class: 'sp-none'}, '선 그래프 없음'),
      h('b', {class: 'chg20 nc-chg ' + (signCls(x.change20) || 'flat')}, pct(x.change20, 1)))); }));
}
function setBox(set, board, groups) {
  const how = set?.how ?? [];
  return h('details', {class: 'b-how'}, h('summary', null, '어떤 회사들인가 · 어떻게 셌나'),
    h('ul', null, board.kinds ? h('li', {class: 'b-kinds'}, kindsLine(board.kinds, groups.length)) : null,
      ...how.map(x => h('li', null, x)), set?.selectedOn ? h('li', null, `${korDate(set.selectedOn)}에 고름`) : null,
      h('li', null, `업종 ${groups.length}개: 네이버 증권 업종 이름(화면에는 짧게 줄인 이름 · 업종 화면에 원래 이름) · 작은 업종 몇 개는 합침(보험 · 자동차·부품 · 인터넷·IT서비스 · 식품·담배 · 은행·카드 · 유통 · 운송 · 철강·금속 · 통신 · 전력·가스)`),
      h('li', null, '표시: 우량 = 우량 네 조건을 모두 넘음 · 트렌드 = 시대 트렌드 업종 · 흑자 = 둘 다 아니지만 최근 결산 흑자(업종 5곳을 채우려고 넣음) · 채움 = 업종 5곳을 채우려고 넣은 그 업종 큰 회사'),
      h('li', null, `칸 차례: ${board.order}`),
      h('li', null, '불장: 지난 20거래일 동안 업종 5곳 종가가 평균 많이 오른 업종(오른 업종만 · 11개까지) · 불장 밖에서 많이 오른 곳: 불장 업종 밖 회사 가운데 지난 20거래일 동안 많이 오른 회사(한 업종 2곳까지 · 22곳까지)'),
      h('li', null, '칸 위 가는 선: 빨강 = 20거래일 평균이 오름 · 파랑 = 내림 · 숫자 앞 ▲▼ 와 + · − 가 같은 뜻'),
      h('li', null, '둘 다 지난 종가로 센 차례입니다 · 앞날 값은 셈하지 않습니다')));
}

export async function renderHome(main, {manifest}) {
  const board = await loadBoard();
  const set = manifest.universeSet ?? {}, late = board.late ?? [], n = board.companies.length;
  const groups = board.groups?.length ? board.groups : [], byCode = new Map(board.companies.map(c => [c.code, c]));
  const sizes = new Set(groups.map(g => g.codes.length)), per = sizes.size === 1 ? [...sizes][0] : null;
  const hot = board.hot?.items ?? [], nn = board.next?.items?.length ?? 0, from = mode(board.companies.map(c => c.cFrom)), to = mode(board.companies.map(c => c.date)) ?? board.asOf;
  state.summary = `${korDate(to)} 종가 기준. 불장 ${hot.length}개. ${headLine(groups, n, from, to)}. ${hot.slice(0, 3).map((x, i) => `${i + 1}위 ${x.label} ${pct(x.change20, 1)}`).join(', ')}. 불장 밖에서 많이 오른 회사 ${nn}곳.`;
  main.replaceChildren(h('div', {class: 'b-page t-page'},
    marketStrip(manifest),
    nextBox(manifest.universeNext),
    h('header', {class: 'b-head'},
      h('h1', {class: 'b-title', 'data-speak': ''}, `불장 ${hot.length}개`),
      h('p', {class: 'b-when', 'data-speak': ''}, headLine(groups, n, from, to)),
      ...late.map(c => h('p', {class: 'b-late'}, `${c.name}: ${c.date ? korDate(c.date) + ' 종가' : '종가 없음'} · ${korDate(board.asOf)} 종가는 아직 받지 못함`))),
    hot.length ? null : h('p', {class: 'b-note'}, '지난 20거래일 동안 평균이 오른 업종이 없습니다'),
    h('nav', {class: 't-grid', 'aria-label': `업종 ${groups.length}개 · 지난 20거래일 변화가 큰 차례`}, ...groups.map(tile)),
    h('p', {class: 't-key muted xs'}, `칸 하나 = 업종 하나${per ? `(${per}곳)` : ''} · 지난 20거래일 평균 변화가 큰 차례 · 누르면 그 업종 · ${korDate(board.asOf)} 15:30 종가`),
    h('section', {class: 't-sec', 'aria-label': `불장 밖에서 많이 오른 ${nn}곳`},
      h('h2', {class: 't-h2', 'data-speak': ''}, `불장 밖에서 많이 오른 ${nn}곳`),
      h('p', {class: 't-sub'}, `불장 업종 밖 회사 가운데 지난 20거래일 동안 많이 오른 차례 · 한 업종 ${board.next?.perIndustry ?? 2}곳까지 · 선 그래프는 ${nn}곳이 같은 눈금(점선 = 첫날 종가) · 누르면 회사 화면`),
      nextList(board.next, byCode)),
    setBox(set, board, groups),
    promiseBox(),
    foot(manifest)));
}
