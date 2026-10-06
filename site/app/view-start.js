/* ATLAS 11 · 아래 탭 「처음」(#/start) — 처음 사는 사람에게 지난 기록으로 찍은 다섯(셈: lib/atlas11/start.mjs · 판의 start)
   사장님 2026-10-06 23:19 「여기서 초보들이 뭘사야 안전한지 알려줘 그 탭을 지혜롭게 만들어봐 잡스였다면」
        2026-10-07 00:40 「틀리더라도 일단 찍어」 · 00:49 「이대로 사이트에 올려줘」
        2026-10-07 02:29 「글씨가 너무 많아 집중이 않돼」 · 02:39 「아주 효율적으로 해」 — 회사마다 한 줄(순위 · 이름 · 값 · 막대) · 기준 한 줄 · 까닭 세 줄 · 나머지는 접힌 「자세히」
   한 문장(원칙 1번) 밖의 탭 — 기록 탭처럼 사장님이 정하신 예외(docs/ATLAS_원칙.md 규칙 21)
   넣으면서 뺀 것(규칙 1): 첫 화면 맨 아래 접힌 「ATLAS가 하지 않는 일」 → 이 화면 맨 아래로 옮김(셋째 줄은 「처음」 다섯에 맞게 고침)
   차례: 기준 한 줄 → 다섯(한 줄씩 · 막대) → 보통 회사 → 틀릴 수 있는 까닭(판 값으로 만든 글) → 접힌 「기준 · 숫자 자세히」(3년 날짜 · 기준 작은 글 · 회사마다 3년 · 1년 · 꼭대기)
   3년 종가가 모자란 판(미국 판)은 찍지 않고 「언제부터」만 */
import {h, korDate, pct, finite} from './util.js';
import {state, loadBoard} from './store.js';
import {foot, promiseBox} from './parts.js';
import {startComment, commentBox, commentSay} from './comment.js'; // 논평(2026-10-07 03:17)

export async function renderStart(main, {manifest}) {
  const board = await loadBoard(), s = board.start;
  const year = String(board.asOf ?? '').slice(0, 4);
  const ymd = d => (d && d.slice(0, 4) !== year ? `${Number(d.slice(0, 4))}년 ` : '') + korDate(d); // 판 날짜와 해가 다르면 해를 붙임
  const pc = v => pct(v, finite(v) && Math.abs(v) < 0.01 ? 1 : 0); // 1% 안쪽은 소수 한 자리(「+0%」로 보이지 않게)
  const bar = (v, worst, cls) => { const f = h('span', {class: 'st-fill ' + cls}); f.style.width = `${Math.max(2, Math.min(100, Math.abs(v) / worst * 100))}%`; return h('span', {class: 'st-track', 'aria-hidden': 'true'}, f); };
  const month = m => `${Number(m.slice(0, 4))}년 ${Number(m.slice(5, 7))}월`, cm = startComment(board);
  if (!s?.ready) {
    const have = s?.have, ready = s?.readyMonth;
    state.summary = `${commentSay(cm)}처음. 이 판은 종가 기록이 3년이 안 되어 다섯 곳을 찍지 않습니다.${ready ? ` ${month(ready)}부터 찍습니다.` : ''}`;
    main.replaceChildren(h('div', {class: 'b-page st-page'},
      h('header', {class: 'b-head'},
        h('h1', {class: 'b-title', 'data-speak': ''}, '처음'),
        commentBox(cm),
        h('p', {class: 'b-when', 'data-speak': ''}, `${korDate(board.asOf)} ${manifest?.place?.id === 'us' ? '뉴욕 종가' : '종가'} · 종가 기록 ${have?.days ?? 0}거래일${have?.from ? `(${ymd(have.from)}부터)` : ''}`)),
      ready ? h('p', {class: 'st-wait', 'data-speak': ''}, `3년 기록이 쌓이는 ${month(ready)}부터 ${s?.rule?.want ?? 5}곳을 찍습니다`) : null,
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
    h('header', {class: 'b-head'},
      h('h1', {class: 'b-title', 'data-speak': ''}, '처음 ', h('span', {class: 'b-count'}, `${n}곳`)),
      commentBox(cm),
      h('p', {class: 'b-when', 'data-speak': ''}, `${korDate(to)} 종가까지 지난 3년 기록`)),
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
    promiseBox(board),
    foot(manifest)));
}
