/* ATLAS 11 · 탭 「불장」(#/ · 큰 흐름) · 탭 「업종」(#/map · 73칸 판) — 예측 없음
   2026-10-04 21:04 사장님 「업종 36개에서 180개 회사를 찾아서 요즘 불장인 11개를 찾아내고 다음 불장이 예상되는 22개 회사도 찾아내 180개 회사내에서」
   2026-10-04 21:55 「자 이제 학습한것 이상으로 만들어」 — 판 → 업종 화면(#/i/<업종>) → 회사 화면 · 두 번이면 어디든
   2026-10-05 02:44 「잡스였다면」 개혁 — 첫 줄 결론 · 칸 하나에 넷 · 앞날 말 걷어 냄(「다음 불장 후보」 → 지난 일을 말하는 이름)
   2026-10-05 05:03 「불장 그리고 뭐뭐가 있잖아 그걸 탭 처리로 하지 지금은 밑으로 내려야 하잖아」 · 05:07 「해」 — 탭 다섯
   2026-10-05 10:24 「잡스라면 … 큰틀에서 36가지」 → 「나 여기서 클릭하면 업로드되게 만들어 줘」 — 1차 올림:
     · 13번 아래 탭 다섯 → 넷(불장 · 업종 · 출목표 · 일정) · 14번 불장 탭 맨 위 스위치 [불장 | 예비 | 오름 상위](parts.js hotSwitch)
     · 15번 「불장」 이름 아래 73칸 전부가 나오던 어긋남을 풀었다 — 73칸 판은 탭 「업종」(#/map)으로, 탭 「불장」은 불장 업종만
     · 20번 불장 11칸을 큰 흐름으로 — 같은 큰 갈래(family.js)의 불장 업종을 한 장에 · 갈래 이름은 ATLAS 가 업종 이름을 보고 묶은 것
     · 19번 73칸 위에 큰 갈래 층 — 업종 탭 맨 위 갈래 단추(누르면 그 갈래 업종만 · 칸 차례는 판 차례 그대로)
     · 28번 이름에서 숫자를 뺐다 — 제목은 「불장」 · 「업종」, 개수는 제목 곁 작은 글
   2026-10-05 11:36 「모든 배치가 가장 많이 상승한순으로 배치해줘」 — 큰 흐름 장은 갈래 평균(그 갈래 업종들의 지난 20거래일 평균)이 큰 순 · 장 안 업종도 오른 순
     · 업종 탭 갈래 단추도 같은 순 · 단추에 갈래 평균 · 73칸은 처음부터 지난 20거래일 평균이 큰 차례 */
import {h, korDate, pct, finite, signCls} from './util.js';
import {state, loadBoard, prefs} from './store.js';
import {marketStrip} from './frame.js';
import {foot, promiseBox, hotSwitch, hotCounts, movesBox, sunNum, sunKey} from './parts.js';
import {sunOf, sunCount} from './shapes.js';
import {FAMILIES, OTHER, familyOf, familiesByRise} from './family.js';

export const span = (from, to) => from && to ? `${korDate(from)}부터 ${korDate(to)}까지` : '';
/** 가장 많은 값(같으면 늦은 날) — 한 회사 종가가 늦어도 판 전체의 기간 글이 흔들리지 않게 */
export const mode = xs => { const n = new Map(); for (const x of xs) if (x) n.set(x, (n.get(x) ?? 0) + 1); return [...n].sort((a, b) => b[1] - a[1] || (a[0] < b[0] ? 1 : -1))[0]?.[0] ?? null; };
/** 「업종 36개 · 우량주 114곳 · 시대 트렌드 51곳 · 흑자 11곳 · 채움 4곳」(없는 것은 빼고) */
export const kindsLine = (k, n) => [`업종 ${n}개`, `우량주 ${k.quality ?? 0}곳`, `시대 트렌드 ${k.trend ?? 0}곳`, k.profit ? `흑자 ${k.profit}곳` : null, k.size ? `채움 ${k.size}곳` : null].filter(Boolean).join(' · ');
export const upLine = g => g.measured ? (g.up === g.measured ? `${g.measured}곳 모두 오름` : g.up === 0 ? '오른 곳 없음' : `${g.measured}곳 중 ${g.up}곳 오름`) : '변화 없음';
/** 결론 한 문장 — 업종 몇 개가 올랐나(지난 20거래일 평균이 0 보다 큰 업종) */
export const headLine = (groups, n, from, to) => `업종 ${groups.length}개 가운데 ${groups.filter(g => finite(g.change20) && g.change20 > 0).length}개 오름 · ${n}곳 · 지난 20거래일 · ${span(from, to)}`;
/** 늦은 종가 한 줄 — 2026-10-05 15:24 「잡스가 … 36가지」 A5: 굵은 주황 두 줄 → 작고 조용한 한 줄(알리되 소리치지 않게 · 글은 그대로 정직하게) */
const lateLines = (late, board) => late.map(c => h('p', {class: 'b-late', title: `${korDate(board.asOf)} 종가는 아직 받지 못함`}, c.date ? `${c.name}: ${korDate(c.date)} 종가까지만 있음` : `${c.name}: 종가 없음`));

/* ───────── 탭 「불장」(#/) — 불장 업종만 · 같은 큰 갈래끼리 한 장 ───────── */

/** 큰 흐름 한 장 — 갈래 이름 · 불장 업종 몇 개 · 업종 줄(「불장 n위」 · 이름 · ▲변화 · 몇 곳 오름 · 태양 몇 곳 · 누르면 그 업종)
   2026-10-05 15:24 「잡스가 … 36가지」 C3: 장 머리에 개수가 두 번(「5개 평균」 · 「불장 업종 5개」) → 한 번(「평균」 · 「불장 업종 5개」) · B4: 줄마다 그 업종의 태양 수 */
function flowCard(f, groups, shp) {
  return h('section', {class: 'hf-card', 'data-family': f.fam.id, 'aria-label': `${f.fam.label} · 불장 업종 ${f.groups.length}개`},
    h('p', {class: 'hf-h'}, h('span', {class: 'hf-l'}, h('b', {class: 'hf-name'}, f.fam.label), h('span', {class: 'hf-avg'}, '평균 ', h('b', {class: 'chg20 ' + (signCls(f.avg) || 'flat')}, finite(f.avg) ? pct(f.avg, 1) : '없음'))), h('span', {class: 'hf-n'}, `불장 업종 ${f.groups.length}개`)),
    h('ul', {class: 'hf-list'}, ...f.groups.map(g => { const i = groups.indexOf(g), k = sunCount(shp, g.codes);
      return h('li', null, h('a', {class: 'hf-row', href: '#/i/' + g.id, 'data-group': g.id, 'data-sun': String(k), 'aria-label': `불장 ${i + 1}위 ${g.label} · 지난 20거래일 ${finite(g.change20) ? pct(g.change20, 1) : '없음'} · ${upLine(g)}${k ? ` · 태양 ${k}곳` : ''}`},
        h('span', {class: 't-fire hf-rank'}, `불장 ${i + 1}위`),
        h('span', {class: 'hf-g'}, h('span', {class: 'hf-gname'}, g.label), h('span', {class: 'hf-sub'}, h('small', {class: 'hf-up'}, upLine(g)), sunNum(k, 'sun-n hf-sun'))),
        h('span', {class: 't-chg hf-chg', 'data-sign': signCls(g.change20) || null}, finite(g.change20) ? pct(g.change20, 1) : '없음'))); })));
}

export async function renderHome(main, {manifest}) {
  const board = await loadBoard();
  const groups = board.groups ?? [], hot = groups.filter(g => g.hot), late = board.late ?? [];
  const from = mode(board.companies.map(c => c.cFrom)), to = mode(board.companies.map(c => c.date)) ?? board.asOf;
  const flows = familiesByRise(hot); // 가장 많이 오른 큰 흐름부터(갈래 평균이 큰 순)
  const shp = sunOf(board), hotSun = sunCount(shp, hot.flatMap(g => g.codes));
  state.summary = `${korDate(to)} 종가 기준. 불장 업종 ${hot.length}개, 큰 흐름 ${flows.length}개: ${flows.map(f => `${f.fam.label} ${f.groups.length}개`).join(', ')}.${shp.sparkle.size ? ` 태양 ${shp.sparkle.size}곳, 그 가운데 불장 업종에 ${hotSun}곳.` : ''}`;
  main.replaceChildren(h('div', {class: 'b-page h-page'},
    marketStrip(manifest),
    hotSwitch('home', hotCounts(board)),
    movesBox(board.moves), // 저녁 7시 들고 남 — 불장 · 예비 · 오름 상위 세 화면 같은 자리(24번)
    h('header', {class: 'b-head'},
      h('h1', {class: 'b-title', 'data-speak': ''}, '불장 ', h('span', {class: 'b-count'}, `업종 ${hot.length}개`)),
      hot.length ? h('p', {class: 'b-when hf-sum', 'data-speak': ''}, `큰 흐름 ${flows.length}개 — ${flows.map(f => f.fam.label).join(' · ')}`) : null,
      h('p', {class: 'b-when'}, `업종 ${groups.length}개 가운데 지난 20거래일 평균이 많이 오른 ${hot.length}개 · ${span(from, to)}`),
      ...lateLines(late, board)),
    hot.length ? null : h('p', {class: 'b-note'}, '지난 20거래일 동안 평균이 오른 업종이 없습니다'),
    h('div', {class: 'hf-flows'}, ...flows.map(f => flowCard(f, groups, shp))),
    h('p', {class: 't-key muted xs'}, `큰 흐름 = 같은 큰 갈래의 불장 업종을 한 장에 모은 것(갈래 이름은 ATLAS가 업종 이름을 보고 묶음) · 업종 ${groups.length}개 전체는 아래 탭 「업종」 · ${korDate(board.asOf)} 15:30 종가`),
    sunKey(shp), // ☀ 표시의 뜻 + 출목표 「태양」으로 가는 길(B5)
    promiseBox(),
    foot(manifest)));
}

/* ───────── 탭 「업종」(#/map) — 73칸 판 · 맨 위 큰 갈래 단추 ───────── */

/** 칸 하나 — 넷: 「불장 n위」(또는 n위) · 이름 · ▲변화 · 몇 곳 오름 · 누르면 그 업종 화면
   2026-10-05 15:24 「잡스가 … 36가지」 B4: 첫 줄 오른쪽에 그 업종의 태양 수(「☀2곳」 · 없으면 비움 — 칸은 그대로 넷) */
function tile(g, i, shp) {
  const sg = signCls(g.change20) || 'flat', k = shp ? sunCount(shp, g.codes) : 0;
  return h('a', {class: `t-tile s-${sg}${g.hot ? ' t-hot' : ''}`, href: '#/i/' + g.id, 'data-group': g.id, 'data-family': familyOf(g.label).id, 'data-sun': String(k), 'aria-label': `${g.hot ? '불장 ' : ''}${i + 1}위 ${g.label} · 지난 20거래일 ${finite(g.change20) ? pct(g.change20, 1) : '없음'} · ${upLine(g)}${k ? ` · 태양 ${k}곳` : ''}`},
    h('span', {class: 't-top'}, g.hot ? h('span', {class: 't-fire'}, `불장 ${i + 1}위`) : h('span', {class: 't-rank'}, `${i + 1}위`), sunNum(k, 'sun-n t-sun')),
    h('span', {class: 't-name'}, g.label),
    h('span', {class: 't-chg', 'data-sign': signCls(g.change20) || null}, finite(g.change20) ? pct(g.change20, 1) : '없음'), // 세모(▲▼)는 style.css 가 붙임 — 글자는 그대로
    h('span', {class: 't-up'}, upLine(g)));
}
function setBox(set, board, groups) {
  const how = set?.how ?? [];
  return h('details', {class: 'b-how'}, h('summary', null, '어떤 회사들인가 · 어떻게 셌나'),
    h('ul', null, board.kinds ? h('li', {class: 'b-kinds'}, kindsLine(board.kinds, groups.length)) : null,
      ...how.map(x => h('li', null, x)), set?.selectedOn ? h('li', null, `${korDate(set.selectedOn)}에 고름`) : null,
      board.companies.some(c => c.ksic)
        ? h('li', null, `업종 ${groups.length}개: 한국거래소 업종(한국표준산업분류 · 「제조업」 같은 끝말은 줄인 이름 · 업종 화면에 원래 이름) · 한국거래소 업종을 모르는 회사는 네이버 증권 업종으로 묶음`)
        : h('li', null, `업종 ${groups.length}개: 네이버 증권 업종 이름(화면에는 짧게 줄인 이름 · 업종 화면에 원래 이름) · 작은 업종 몇 개는 합침`),
      h('li', null, `큰 갈래 ${FAMILIES.length}개: ATLAS가 업종 이름을 보고 묶은 것(판 자료의 업종은 그대로) · 맞는 갈래가 없는 업종은 「${OTHER.label}」`),
      h('li', null, '표시: 우량 = 우량 네 조건을 모두 넘음 · 트렌드 = 시대 트렌드 업종 · 흑자 = 둘 다 아니지만 최근 결산 흑자(업종 5곳을 채우려고 넣음) · 채움 = 업종 5곳을 채우려고 넣은 그 업종 큰 회사'),
      h('li', null, `칸 차례: ${board.order}`),
      h('li', null, '불장: 지난 20거래일 동안 업종 5곳 종가가 평균 많이 오른 업종(오른 업종만 · 11개까지) · 오름 상위: 불장 업종 밖 회사 가운데 지난 20거래일 동안 많이 오른 회사(한 업종 2곳까지 · 22곳까지)'),
      h('li', null, '칸 위 가는 선: 빨강 = 20거래일 평균이 오름 · 파랑 = 내림 · 숫자 앞 ▲▼ 와 + · − 가 같은 뜻'),
      h('li', null, '둘 다 지난 종가로 센 차례입니다 · 앞날 값은 셈하지 않습니다')));
}
/** 큰 갈래 단추 — 「모두」 + 판에 있는 갈래(가장 앞 칸 차례대로) · 누르면 그 갈래 칸만 · 고른 것은 이 기기에 기억 */
function familyFilter(groups, grid, note) {
  const fams = familiesByRise(groups); // 갈래 평균이 큰 순(가장 많이 오른 갈래부터)
  const ids = new Set(fams.map(f => f.fam.id));
  let pick = prefs.get('mapFamily', 'all'); if (pick !== 'all' && !ids.has(pick)) pick = 'all';
  const ups = gs => gs.filter(g => finite(g.change20) && g.change20 > 0).length;
  const btns = [{id: 'all', label: '모두', n: groups.length, up: ups(groups), avg: null},
    ...fams.map(f => ({id: f.fam.id, label: f.fam.label, n: f.groups.length, up: ups(f.groups), avg: f.avg}))]
    .map(x => h('button', {class: 'fm-b', type: 'button', 'data-family': x.id, 'aria-pressed': 'false', 'aria-label': `${x.label} · 업종 ${x.n}개 가운데 ${x.up}개 오름${x.avg == null ? '' : ` · 갈래 평균 ${pct(x.avg, 1)}`}`, onclick: () => { pick = x.id; prefs.set('mapFamily', pick); apply(); }},
      h('span', {class: 'fm-l'}, x.label), h('small', {class: 'fm-n' + (x.avg == null ? '' : ' ' + (signCls(x.avg) || 'flat'))}, x.avg == null ? `${x.n}개` : (finite(x.avg) ? pct(x.avg, 1) : '없음'))));
  // 2026-10-05 15:24 「잡스가 … 36가지」 A3: 휴대폰에서는 갈래 단추 12개를 옆으로 미는 한 줄로(여섯 줄 → 한 줄 · 73칸이 첫 화면에) — 넓은 화면은 그대로 여러 줄
  const row = h('div', {class: 'fm-row', role: 'group', 'aria-label': '큰 갈래 고르기', 'data-scroll': 'x'}, ...btns);
  /** 고른 단추를 줄 가운데로(화면은 위아래로 움직이지 않게 줄만 옆으로) */
  const center = () => { const b = row.querySelector('[aria-pressed="true"]'); if (b && row.scrollWidth > row.clientWidth + 1) row.scrollLeft = Math.max(0, b.offsetLeft - row.offsetLeft - (row.clientWidth - b.offsetWidth) / 2); };
  function apply() {
    for (const b of btns) b.setAttribute('aria-pressed', String(b.dataset.family === pick));
    let shown = 0; for (const t of grid.children) { const on = pick === 'all' || t.dataset.family === pick; t.hidden = !on; if (on) shown++; }
    const f = fams.find(x => x.fam.id === pick);
    note.textContent = pick === 'all' ? `모두 · 업종 ${groups.length}개` : `${f?.fam.label ?? ''} · 업종 ${shown}개만 보는 중 · 「모두」를 누르면 ${groups.length}개`;
    requestAnimationFrame(center);
  }
  apply();
  return h('div', {class: 'fm-box'}, h('p', {class: 't-sub fm-sub'}, '큰 갈래 · 지난 20거래일 갈래 평균이 큰 순'), row);
}

export async function renderMap(main, {manifest}) {
  const board = await loadBoard();
  const set = manifest.universeSet ?? {}, late = board.late ?? [], n = board.companies.length;
  const groups = board.groups?.length ? board.groups : [];
  const sizes = new Set(groups.map(g => g.codes.length)), per = sizes.size === 1 ? [...sizes][0] : null;
  const from = mode(board.companies.map(c => c.cFrom)), to = mode(board.companies.map(c => c.date)) ?? board.asOf;
  state.summary = `${korDate(to)} 종가 기준. 업종 ${groups.length}개. ${headLine(groups, n, from, to)}.`; // 태양 수는 아래 grid 를 만든 뒤 덧붙임
  const shp = sunOf(board); if (shp.sparkle.size) state.summary += ` 태양 ${shp.sparkle.size}곳.`;
  const grid = h('nav', {class: 't-grid', 'aria-label': `업종 ${groups.length}개 · 지난 20거래일 변화가 큰 차례`}, ...groups.map((g, i) => tile(g, i, shp)));
  const note = h('p', {class: 'fm-note muted small', role: 'status', 'aria-live': 'polite'});
  main.replaceChildren(h('div', {class: 'b-page t-page'},
    marketStrip(manifest),
    h('header', {class: 'b-head'},
      h('h1', {class: 'b-title', 'data-speak': ''}, '업종 ', h('span', {class: 'b-count'}, `${groups.length}개`)),
      h('p', {class: 'b-when', 'data-speak': ''}, headLine(groups, n, from, to)),
      ...lateLines(late, board)),
    familyFilter(groups, grid, note),
    note,
    grid,
    h('p', {class: 't-key muted xs'}, `칸 하나 = 업종 하나${per ? `(${per}곳)` : ''} · 지난 20거래일 평균 변화가 큰 차례 · 누르면 그 업종 · ${korDate(board.asOf)} 15:30 종가`),
    sunKey(shp), // ☀ 표시의 뜻 + 출목표 「태양」으로 가는 길(B5)
    setBox(set, board, groups),
    foot(manifest)));
}
