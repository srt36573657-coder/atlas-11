/* ATLAS 11 · 아래 탭 「처음」(#/start) — 처음 사는 사람에게 지난 기록으로 찍은 다섯(셈: lib/atlas11/start.mjs · 판의 start)
   사장님 2026-10-06 23:19 「여기서 초보들이 뭘사야 안전한지 알려줘 그 탭을 지혜롭게 만들어봐 잡스였다면」
        2026-10-07 00:40 「틀리더라도 일단 찍어」 · 00:49 「이대로 사이트에 올려줘」
        2026-10-07 02:29 「글씨가 너무 많아 집중이 않돼」 · 02:39 「아주 효율적으로 해」 — 회사마다 한 줄(순위 · 이름 · 값 · 막대) · 기준 한 줄 · 까닭 세 줄 · 나머지는 접힌 「자세히」
   한 문장(원칙 1번) 밖의 탭 — 기록 탭처럼 사장님이 정하신 예외(docs/ATLAS_원칙.md 규칙 21)
   넣으면서 뺀 것(규칙 1): 첫 화면 맨 아래 접힌 「ATLAS가 하지 않는 일」 → 이 화면 맨 아래로 옮김(셋째 줄은 「처음」 다섯에 맞게 고침)
   차례: 기준 한 줄 → 다섯(한 줄씩 · 막대) → 보통 회사 → 틀릴 수 있는 까닭(판 값으로 만든 글) → 접힌 「기준 · 숫자 자세히」(3년 날짜 · 기준 작은 글 · 회사마다 3년 · 1년 · 꼭대기)
   3년 종가가 모자란 판(미국 판)은 찍지 않고 「언제부터」만 */
import {startArt, quietArt} from './scenes.js'; // 그림 한 장(물결 깊이 · 3년이 모자란 판은 쌓인 날 항아리 · 규칙 33) · 값이 비는 날은 빈 하늘(2026-10-08 05:05 빈 날 막기)
import {h, korDate, pct, finite} from './util.js';
import {state, loadBoard} from './store.js';
import {foot, promiseBox, missionBox} from './parts.js';
import {startComment, commentSay} from './comment.js'; // 논평(2026-10-07 03:17)

/** 「처음」 탭 아래 세 화면으로 가는 카드 — 한국 주식시장 안내(05:31) · 500만 원을 오래 들고 있었다면(05:27) · 한국 주식시장은 몇 위인가(05:29) */
const cards = () => h('nav', {class: 'st-cards', 'aria-label': '더 보기'},
  h('a', {class: 'gd-card', href: '#/guide'}, h('b', null, '한국 주식시장 안내 ›'), h('small', null, '시간 · 규칙 · 계좌 · 세금 — 한국에 사는 외국인도')),
  h('a', {class: 'gd-card', href: '#/long'}, h('b', null, '500만 원을 오래 들고 있었다면 ›'), h('small', null, '10년 · 20년 · 30년 — 지난 기록에서 가장 나빴던 때로 · 주식과 아파트')),
  h('a', {class: 'gd-card', href: '#/korea'}, h('b', null, '한국 주식시장은 몇 위인가 ›'), h('small', null, '25개 시장과 견준 순위 10가지 · 수익 · 값 · 배당 · 오르내림')),
  h('a', {class: 'gd-card', href: '#/learn'}, h('b', null, '같은 평균, 다른 구조 — 읽는 법 연습 ›'), h('small', null, '평균이 모두 +4%인 연습 묶음 셋 · 상승 1위 제외해 비교'))); // 2026-10-09 셋째 개정본 0-E
export async function renderStart(main, {manifest}) {
  const board = await loadBoard(), s = board.start;
  const year = String(board.asOf ?? '').slice(0, 4);
  const ymd = d => (d && d.slice(0, 4) !== year ? `${Number(d.slice(0, 4))}년 ` : '') + korDate(d); // 판 날짜와 해가 다르면 해를 붙임
  const pc = v => pct(v, finite(v) && Math.abs(v) < 0.01 ? 1 : 0); // 1% 안쪽은 소수 한 자리(「+0%」로 보이지 않게)
  const bar = (v, worst, cls) => { const f = h('span', {class: 'st-fill ' + cls}); f.style.width = `${Math.max(2, Math.min(100, Math.abs(v) / worst * 100))}%`; return h('span', {class: 'st-track', 'aria-hidden': 'true'}, f); };
  const month = m => `${Number(m.slice(0, 4))}년 ${Number(m.slice(5, 7))}월`, cm = startComment(board);
  // 바깥 판은 그 나라 도시 종가(미국 「뉴욕 종가」 · 중국 「상하이 종가」 · 일본 「도쿄 종가」 · 베트남 「호찌민 종가」 — 판 place.close 「15:00(상하이)」의 괄호 안) · 한국 판은 「종가」
  const closeCity = m => { const c = m?.place?.id && m.place.id !== 'kr' ? /\(([^)]+)\)/.exec(m.place.close ?? '')?.[1] : null; return c ? c + ' ' : ''; };
  if (!s?.ready) {
    const have = s?.have, ready = s?.readyMonth;
    state.summary = `${commentSay(cm)}처음. 이 판은 종가 기록이 3년이 안 되어 다섯 곳을 찍지 않습니다.${ready ? ` ${month(ready)}부터 찍습니다.` : ''}`;
    main.replaceChildren(h('div', {class: 'b-page st-page'},
      startArt(board, cm) ?? quietArt({key: 'start', label: '처음', when: `${korDate(board.asOf)} 종가`}), // 그림 한 장(물결 깊이 · 규칙 33 · 값이 비는 날은 빈 하늘) — 넣으면서 뺀 것: 논평 무대(같은 셈)
      h('header', {class: 'b-head'},
        h('h1', {class: 'b-title', 'data-speak': ''}, '처음'),
        h('p', {class: 'b-when', 'data-speak': ''}, `${korDate(board.asOf)} ${closeCity(manifest)}종가 · 종가 기록 ${have?.days ?? 0}거래일${have?.from ? `(${ymd(have.from)}부터)` : ''}`)),
      ready ? h('p', {class: 'st-wait', 'data-speak': ''}, `3년 기록이 쌓이는 ${month(ready)}부터 ${s?.rule?.want ?? 5}곳을 찍습니다`) : null,
      cards(),
      missionBox(),
      promiseBox(board),
      foot(manifest)));
    return;
  }
  const picks = s.picks ?? [], n = picks.length, worst = Math.max(...picks.map(p => Math.abs(p.mdd)), Math.abs(s.typical?.mdd ?? 0), 0.01);
  const from = picks.map(p => p.from).sort()[0] ?? s.from, to = picks.map(p => p.to).sort().at(-1) ?? s.to;
  state.summary = `${commentSay(cm)}처음. ${korDate(to)} 종가까지 지난 3년 기록으로 찍은 ${n}곳. ${picks.map(p => `${p.rank}위 ${p.name} ${pct(p.mdd, 0)}`).join('. ')}. 보통 회사는 ${pct(s.typical?.mdd, 0)}. 지난 기록일 뿐이라 틀릴 수 있습니다.`;
  const lowest = [...picks].filter(p => finite(p.change1y)).sort((a, b) => a.change1y - b.change1y)[0];
  const crowd = (s.sameGroup ?? []).reduce((t, g) => t + g.n, 0);
  const why = [
    '지난 3년 기록일 뿐 — 다음 3년은 다를 수 있음',
    s.index1y && lowest ? `덜 떨어진 곳은 덜 오르기도 함 — 1년 ${s.index1y.name ?? '지수'} ${pct(s.index1y.change, 0)} · ${lowest.name} ${pc(lowest.change1y)}` : null,
    crowd > 1 ? `${n}곳 중 ${crowd}곳이 ${s.sameGroup.map(g => g.label).join(' · ')}에 몰림` : null,
  ].filter(Boolean);
  const row = p => h('li', null, h('a', {class: 'st-row', href: '#/stock/' + encodeURIComponent(p.code), 'data-code': p.code},
    h('span', {class: 'st-top'}, h('span', {class: 'st-rk'}, `${p.rank}위`), h('span', {class: 'st-name', 'data-ident': ''}, p.name), h('small', {class: 'st-ind'}, p.group?.label ?? ''), h('b', {class: 'st-v'}, pct(p.mdd, 0))),
    bar(p.mdd, worst, 'st-ok'),
    p.atLow ? h('span', {class: 'st-low'}, `${korDate(p.to)} 종가가 3년 중 가장 낮은 자리`) : null));
  main.replaceChildren(h('div', {class: 'b-page st-page'},
      startArt(board, cm) ?? quietArt({key: 'start', label: '처음', when: `${korDate(board.asOf)} 종가`}), // 그림 한 장(물결 깊이 · 규칙 33 · 값이 비는 날은 빈 하늘) — 넣으면서 뺀 것: 논평 무대(같은 셈)
    h('header', {class: 'b-head'},
      h('h1', {class: 'b-title', 'data-speak': ''}, '처음 ', h('span', {class: 'b-count'}, `${n}곳`)),
      h('p', {class: 'b-when', 'data-speak': ''}, `${korDate(to)} 종가까지 지난 3년 기록`)),
    cards(), // 2026-10-07 05:31 안내 · 05:27 500만 원 · 05:29 몇 위
    h('p', {class: 'st-rule-t', 'data-speak': ''}, `우량 큰 회사 ${s.candidates}곳 중 지난 3년 가장 덜 떨어진 ${n}곳`),
    h('p', {class: 'st-key'}, '막대 = 3년 안에서 가장 깊게 떨어진 정도'),
    h('ol', {class: 'st-list'}, ...picks.map(row)),
    h('div', {class: 'st-base'},
      h('span', {class: 'st-top'}, h('span', {class: 'st-bn'}, `보통 회사(${s.measured}곳 가운데 값)`), h('b', {class: 'st-v'}, pct(s.typical?.mdd, 0))),
      bar(s.typical?.mdd ?? 0, worst, 'st-bad')),
    h('section', {class: 'b-how st-warn', 'aria-label': '틀릴 수 있는 까닭'},
      h('h2', {class: 'st-warn-h'}, `틀릴 수 있는 까닭 ${why.length}가지`),
      h('ul', null, ...why.map(t => h('li', {'data-speak': ''}, t)))),
    h('details', {class: 'b-how st-more'}, h('summary', null, '기준 · 숫자 자세히'),
      h('p', null, `지난 3년 = ${from ? ymd(from) : ''} ~ ${korDate(to)}(${s.rule.days}거래일)`),
      h('p', null, `우량 = 고를 때 우량 표시(연속 흑자 · ROE · 부채비율 기준 통과) · 큰 회사 = 시가총액 ${s.rule.capTop}위 안 · 종가만 셈(배당 뺌) · 하루에 ${Math.round(s.rule.jump * 100)}% 넘게 움직인 날이 있는 회사(분할 · 합병 같은 바뀜)는 재지 않음`),
      h('ul', null, ...picks.map(p => h('li', null, h('span', {class: 'st-mn', 'data-ident': ''}, p.name), h('span', null, `3년 ${pc(p.change)} · 1년 ${pc(p.change1y)} · 꼭대기 ${ymd(p.peak.date)} → 가장 낮은 때 ${ymd(p.trough.date)}`))))),
    missionBox(),
    promiseBox(board),
    foot(manifest)));
}
