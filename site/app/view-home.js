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
     · 업종 탭 갈래 단추도 같은 순 · 단추에 갈래 평균 · 73칸은 처음부터 지난 20거래일 평균이 큰 차례
   2026-10-06 00:21 「자 더 깊이 본질로 간다 잡스라면 이 아틀란스를 어떻게 만들었을까? 그리고 개선하라」 — 탭 「업종」 → 탭 「지도」:
     · 맨 위에 지도 한 장(landmap.js · 땅 = 큰 갈래 · 칸 = 업종 · 색 = 지난 20거래일) — 로고 5번 「땅 나누기」가 화면에서 커진 것
     · 땅을 누르면 아래 73칸이 그 갈래만 — 옛 큰 갈래 단추 12개(familyFilter)를 지도가 대신(규칙 1) · 73칸 · 칸 넷 · 오른 순은 그대로
   2026-10-06 07:03 사장님(휴대폰 사진과 함께) 「왜 3단 클릭 구조가 아니지?」 — 지도는 세 번이면 회사: 땅 → 그 갈래 화면(#/map/f/<갈래> · renderLand) → 업종 → 회사
     · 옛 판은 땅을 누르면 지도 아래 73칸만 걸러졌다 — 휴대폰에서는 그 칸들이 화면 밖이라 눌러도 아무 일이 없는 것처럼 보였다
     · 넣으면서 뺀 것(규칙 1): 땅 거르기 · 「모두 보기」 단추 · 거르기 안내 줄 · 기억해 두던 고른 갈래(prefs mapFamily)
   2026-10-06 14:55 「해」(14:48 카드 「1 해」 — ATLAS 지도에 지수가 1년 가운데 가장 높던 값보다 몇 % 아래인지 · 지난 6달 앞서 달린 업종 안의 앞서 달린 회사를 지난 기록으로만):
     · 지도 탭 맨 아래 접힌 상자 하나 「지난 6개월 앞서 달린 곳」(lead6Box · 셈은 lib/atlas11/lead6.mjs 한 곳 · 지도 그림(땅 · 칸)은 그대로 — 규칙 16 · 10/4 「구도 … 건들리지 않는다」)
     · 규칙 3(기간 잣대는 20거래일 하나)의 예외는 이 접힌 상자 하나뿐 — 상자 안 차례도 120거래일 변화 순
     · 넣으면서 뺀 것(규칙 1): 73칸 아래 설명 한 줄(t-key — 머리 줄 · 지도 설명 줄과 겹치던 「칸 하나 = 업종 하나 · 차례 · 누르면 그 업종 · 종가 시각」) */
import {h, korDate, pct, num, finite, signCls, place} from './util.js';
import {state, loadBoard} from './store.js';
import {marketStrip} from './frame.js';
import {foot, promiseBox, hotSwitch, hotCounts, movesBox, sunNum, sunKey} from './parts.js';
import {sunOf, sunCount} from './shapes.js';
import {FAMILIES, OTHER, familyOf, familiesByRise, riseDesc, meanOf} from './family.js';
import {landMap} from './landmap.js';

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
    h('p', {class: 't-key muted xs'}, `큰 흐름 = 같은 큰 갈래의 불장 업종을 한 장에 모은 것(갈래 이름은 ATLAS가 업종 이름을 보고 묶음) · 업종 ${groups.length}개 전체는 아래 탭 「지도」 · ${korDate(board.asOf)} ${place.close} 종가`),
    sunKey(shp), // ☀ 표시의 뜻 + 출목표 「태양」으로 가는 길(B5)
    promiseBox(),
    foot(manifest)));
}

/* ───────── 탭 「지도」(#/map · 옛 「업종」) — 맨 위 지도 한 장 · 아래 73칸 판 ───────── */

/** 칸 하나 — 넷: 「불장 n위」(또는 n위) · 이름 · ▲변화 · 몇 곳 오름 · 누르면 그 업종 화면
   2026-10-05 15:24 「잡스가 … 36가지」 B4: 첫 줄 오른쪽에 그 업종의 태양 수(「☀2곳」 · 없으면 비움 — 칸은 그대로 넷) */
function tile(g, i, shp, {band = false} = {}) {
  const sg = signCls(g.change20) || 'flat', k = shp ? sunCount(shp, g.codes) : 0;
  const a = h('a', {class: `t-tile s-${sg}${g.hot ? ' t-hot' : ''}`, href: '#/i/' + g.id, 'data-group': g.id, 'data-family': familyOf(g.label).id, 'data-sun': String(k), 'aria-label': `${g.hot ? '불장 ' : ''}${i + 1}위 ${g.label} · 지난 20거래일 ${finite(g.change20) ? pct(g.change20, 1) : '없음'} · ${upLine(g)}${k ? ` · 태양 ${k}곳` : ''}`},
    h('span', {class: 't-top'}, g.hot ? h('span', {class: 't-fire'}, `불장 ${i + 1}위`) : h('span', {class: 't-rank'}, `${i + 1}위`), sunNum(k, 'sun-n t-sun')),
    h('span', {class: 't-name'}, g.label),
    h('span', {class: 't-chg', 'data-sign': signCls(g.change20) || null}, finite(g.change20) ? pct(g.change20, 1) : '없음'), // 세모(▲▼)는 style.css 가 붙임 — 글자는 그대로
    h('span', {class: 't-up'}, upLine(g)));
  // 갈래 화면(#/map/f/…)의 칸은 맨 위에 지도 칸과 같은 색 띠 — 지도의 땅을 크게 펼친 것으로 보이게(2026-10-06 07:03 「3단 클릭」)
  if (band) { const b = h('span', {class: 'lm-c t-band s-' + sg, 'aria-hidden': 'true'}); const kk = finite(g.change20) ? Math.min(1, Math.abs(g.change20) / 0.3) : 0; b.style.setProperty('--k', (0.14 + 0.86 * Math.pow(kk, 0.75)).toFixed(3)); a.prepend(b); }
  return a;
}
function setBox(set, board, groups) {
  const how = set?.how ?? [];
  return h('details', {class: 'b-how'}, h('summary', null, '어떤 회사들인가 · 어떻게 셌나'),
    h('ul', null, board.kinds ? h('li', {class: 'b-kinds'}, kindsLine(board.kinds, groups.length)) : null,
      ...how.map(x => h('li', null, x)), set?.selectedOn ? h('li', null, `${korDate(set.selectedOn)}에 고름`) : null,
      place.industryNote ? h('li', null, `업종 ${groups.length}개: ${place.industryNote}`) // 미국 판(util.js place)
      : board.companies.some(c => c.ksic)
        ? h('li', null, `업종 ${groups.length}개: 한국거래소 업종(한국표준산업분류 · 「제조업」 같은 끝말은 줄인 이름 · 업종 화면에 원래 이름) · 한국거래소 업종을 모르는 회사는 네이버 증권 업종으로 묶음`)
        : h('li', null, `업종 ${groups.length}개: 네이버 증권 업종 이름(화면에는 짧게 줄인 이름 · 업종 화면에 원래 이름) · 작은 업종 몇 개는 합침`),
      h('li', null, `큰 갈래 ${FAMILIES.length}개: ATLAS가 업종 이름을 보고 묶은 것(판 자료의 업종은 그대로) · 맞는 갈래가 없는 업종은 「${OTHER.label}」`),
      h('li', null, '표시: 우량 = 우량 네 조건을 모두 넘음 · 트렌드 = 시대 트렌드 업종 · 흑자 = 둘 다 아니지만 최근 결산 흑자(업종 5곳을 채우려고 넣음) · 채움 = 업종 5곳을 채우려고 넣은 그 업종 큰 회사'),
      h('li', null, `칸 차례: ${board.order}`),
      h('li', null, '불장: 지난 20거래일 동안 업종 5곳 종가가 평균 많이 오른 업종(오른 업종만 · 11개까지) · 오름 상위: 불장 업종 밖 회사 가운데 지난 20거래일 동안 많이 오른 회사(한 업종 2곳까지 · 22곳까지)'),
      h('li', null, '칸 위 가는 선: 빨강 = 20거래일 평균이 오름 · 파랑 = 내림 · 숫자 앞 ▲▼ 와 + · − 가 같은 뜻'),
      h('li', null, '둘 다 지난 종가로 센 차례입니다 · 앞날 값은 셈하지 않습니다')));
}
/** (옛 · 2026-10-06 00:21 까지) 큰 갈래 단추 12개 — 「모두」 + 갈래 평균이 큰 순 · 누르면 그 갈래 칸만 · 휴대폰에서는 옆으로 미는 한 줄(A3)
   지금 — 지도 한 장(landmap.js)이 그 일을 한다: 땅을 누르면 그 갈래 칸만 · 같은 땅을 한 번 더 누르거나 「모두 보기」면 73칸 모두 · 고른 것은 이 기기에 기억(옛 키 그대로) */
function mapBox(groups) {
  const map = landMap(groups);
  return {map, box: h('div', {class: 'lm-box'}, map.el,
    h('p', {class: 'lm-key muted xs'}, '땅 = 큰 갈래(넓이 = 업종 수 · 자리는 날마다 같음) · 칸 = 업종(땅 안 위 왼쪽부터 오른 순) · 색 = 지난 20거래일 평균 — 빨강 오름 · 파랑 내림 · 진할수록 변화가 큼 · 땅을 누르면 그 갈래 업종'))};
}

/** 지도 탭 맨 아래 접힌 상자 「지난 6개월 앞서 달린 곳」 — 판 board.lead6 · groups[].change120/lead6 · companies[].change120/lead6 를 그대로 보여 준다(화면에서 다시 셈하지 않음 · 규칙 12)
   ① 지수 자리: 지난 250거래일 가운데 가장 높던 종가보다 몇 % 아래 ② 업종 위 20%(120거래일 업종 지수) 안에서 회사도 위 20%(120거래일 종가 변화)인 곳 — 차례는 120거래일 변화 순
   앞날 값은 없다 — 공부(reports/atlas11/study/대세 상승 초입 — 20년 기록 · 한국과 미국.md)의 「그 뒤 6달」 숫자는 싣지 않는다 */
export function lead6Box(board, groups) {
  const L = board.lead6; if (!L) return null;
  const byCode = new Map(board.companies.map(c => [c.code, c])), desc = (a, b) => (b.change120 ?? -Infinity) - (a.change120 ?? -Infinity);
  const rows = groups.filter(g => g.lead6).sort(desc).map(g => ({g, cs: g.codes.map(c => byCode.get(c)).filter(c => c?.lead6).sort(desc)}));
  const withCo = rows.filter(r => r.cs.length), without = rows.filter(r => !r.cs.length), n = withCo.reduce((t, r) => t + r.cs.length, 0);
  const sizes = new Set(groups.map(g => g.codes.length)), per = sizes.size === 1 ? [...sizes][0] : null, ix = L.index;
  const p1 = v => pct(v, 1), chg = v => h('b', {class: 'chg20 ' + (signCls(v) || 'flat')}, finite(v) ? p1(v) : '없음');
  // 지수 이름(「S&P 500」)은 이름 그대로라 식별자(data-ident) · 지수 값에는 단위 「포인트」(또렷함 3번 — 펼친 상자를 따로 재어 찾음 · 10/6 15시)
  const ixLine = ix ? h('p', {class: 'm6-ix'}, h('span', {'data-ident': ''}, ix.name), `: ${korDate(ix.date)} 종가 ${num(ix.close, 2)}포인트 — 지난 ${ix.days}거래일 가운데 가장 높던 ${korDate(ix.highDate)} ${num(ix.high, 2)}포인트${ix.gap < 0 ? `보다 ${(Math.abs(ix.gap) * 100).toFixed(1)}% 아래` : '와 같음'}`)
    : h('p', {class: 'm6-ix muted'}, `지수 자리: ${L.indexMissing ?? '지수 종가 기록 없음'}`);
  return h('details', {class: 'b-how m6'},
    h('summary', null, '지난 6개월 앞서 달린 곳 · 지난 기록', h('small', {class: 'm6-n'}, `업종 ${withCo.length}개 · 회사 ${n}곳`)),
    ixLine,
    h('ul', {class: 'm6-list', 'aria-label': `지난 120거래일 업종 위 20% 안에서 회사도 위 20%인 곳 · 업종 ${withCo.length}개 · 회사 ${n}곳`},
      ...withCo.map(({g, cs}) => h('li', null,
        h('a', {class: 'm6-g', href: '#/i/' + g.id, 'data-group': g.id}, h('span', null, g.label), chg(g.change120)),
        h('span', {class: 'm6-cs'}, ...cs.map(c => h('a', {href: '#/stock/' + c.code, 'data-code': c.code}, h('span', {'data-ident': ''}, c.name), ' ', chg(c.change120))))))), // 회사 이름은 이름 그대로(「필립스 66」 속 숫자는 단위 없는 숫자가 아님)
    without.length ? h('p', {class: 'm6-rest muted xs'}, `업종은 위 20%지만 회사는 위 20%가 아닌 업종 ${without.length}개: ${without.map(r => r.g.label).join(' · ')}`) : null,
    // 셈 방법은 세 줄로(한 줄에 숫자를 몰아 두지 않음 — 또렷함 4번)
    h('p', {class: 'm6-how muted xs'}, `업종 = 지난 120거래일(약 6개월) 업종 지수(회사${per ? ` ${per}곳` : ''} 하루 오르내림을 같은 무게로 이어 붙임) · 업종 ${L.measured.groups}개 가운데 위 20%(${L.lead.groups}개)`, h('br'),
      `회사 = 지난 120거래일 종가 변화 · ${L.measured.companies}곳 가운데 위 20%(${L.lead.companies}곳) · 두 가지 모두 맞는 회사만`, h('br'),
      `${korDate(L.from)}부터 ${korDate(L.to)}까지 ${place.close} 종가 · 차례 = 120거래일 변화 순`),
    h('p', {class: 'm6-note muted xs'}, '지난 종가로 센 것입니다 · 앞날 값은 셈하지 않습니다'));
}

export async function renderMap(main, {manifest}) {
  const board = await loadBoard();
  const set = manifest.universeSet ?? {}, late = board.late ?? [], n = board.companies.length;
  const groups = board.groups?.length ? board.groups : [];
  const from = mode(board.companies.map(c => c.cFrom)), to = mode(board.companies.map(c => c.date)) ?? board.asOf;
  state.summary = `지도. ${korDate(to)} 종가 기준. 업종 ${groups.length}개. ${headLine(groups, n, from, to)}.`; // 태양 수는 아래 grid 를 만든 뒤 덧붙임
  const shp = sunOf(board); if (shp.sparkle.size) state.summary += ` 태양 ${shp.sparkle.size}곳.`;
  const grid = h('nav', {class: 't-grid', 'aria-label': `업종 ${groups.length}개 · 지난 20거래일 변화가 큰 차례`}, ...groups.map((g, i) => tile(g, i, shp)));
  const mb = mapBox(groups); state.land = null; // 지도 첫 장 — 업종 화면 「‹ 되돌아가기」는 지도로
  main.replaceChildren(h('div', {class: 'b-page t-page'},
    marketStrip(manifest),
    h('header', {class: 'b-head'},
      h('h1', {class: 'b-title', 'data-speak': ''}, '지도 ', h('span', {class: 'b-count'}, `업종 ${groups.length}개`)),
      h('p', {class: 'b-when', 'data-speak': ''}, headLine(groups, n, from, to)),
      ...lateLines(late, board)),
    mb.box,
    grid,
    lead6Box(board, groups), // 2026-10-06 14:55 「해」 — 접힌 상자 하나(넣은 것) · 뺀 것: 이 자리에 있던 73칸 설명 한 줄(t-key)
    sunKey(shp), // ☀ 표시의 뜻 + 출목표 「태양」으로 가는 길(B5)
    setBox(set, board, groups),
    foot(manifest)));
  mb.map.lay(); // 화면에 붙은 뒤 폭을 재서 그림(큰 글씨면 지도가 길어짐)
}

/* ───────── 지도 둘째 장 — 갈래 화면(#/map/f/<갈래>) ─────────
   2026-10-06 07:03 사장님 「왜 3단 클릭 구조가 아니지?」 — 지도에서 땅을 누르면 오는 곳(세 번이면 회사: 땅 → 업종 → 회사)
   · 그 갈래 업종 칸을 크게 — 칸 맨 위 띠는 지도 칸과 같은 색 · 차례는 지도 땅 안과 같다(오른 순 · 위 왼쪽이 가장 많이 오른 업종)
   · 칸의 순위는 지도 73칸 순위 그대로 · 칸을 누르면 업종 화면 · 업종 화면의 되돌아가기는 이 화면(「‹ 갈래 이름」) */
export async function renderLand(main, {hash, manifest}) {
  const board = await loadBoard();
  const id = hash.split('/').pop(), groups = board.groups ?? [];
  const fam = [...FAMILIES, OTHER].find(f => f.id === id), gs = [...groups.filter(g => familyOf(g.label).id === id)].sort(riseDesc);
  const back = h('a', {class: 'c-back', href: '#/map'}, '‹ 지도');
  if (!fam || !gs.length) { state.land = null; state.summary = '이 갈래는 지금 판에 없습니다.'; main.replaceChildren(h('div', {class: 'b-page t-page l-page'}, back, h('p', {class: 'b-note'}, '이 갈래는 지금 판에 없습니다'), foot(manifest))); return; }
  state.land = id; // 업종 화면 「‹ 되돌아가기」가 이 갈래 화면으로 오게
  const shp = sunOf(board), avg = meanOf(gs.map(g => g.change20)), up = gs.filter(g => finite(g.change20) && g.change20 > 0).length;
  const avgT = finite(avg) ? pct(avg, Math.abs(avg) < 0.0005 ? 2 : 1) : '없음';
  const from = mode(board.companies.map(c => c.cFrom)), to = mode(board.companies.map(c => c.date)) ?? board.asOf;
  state.summary = `${fam.label}. 업종 ${gs.length}개 가운데 ${up}개 오름. 갈래 평균 ${avgT}. ${gs.slice(0, 3).map((g, i) => `${i + 1}. ${g.label} ${pct(g.change20, 1)}`).join(', ')}.`;
  main.replaceChildren(h('div', {class: 'b-page t-page l-page', 'data-family': id},
    marketStrip(manifest),
    back,
    h('header', {class: 'b-head'},
      h('h1', {class: 'b-title', 'data-speak': ''}, fam.label + ' ', h('span', {class: 'b-count'}, `업종 ${gs.length}개`)),
      h('p', {class: 'b-when', 'data-speak': ''}, `업종 ${gs.length}개 가운데 ${up}개 오름 · 갈래 평균 ${avgT} · 지난 20거래일 · ${span(from, to)}`)),
    h('nav', {class: 't-grid l-grid', 'aria-label': `${fam.label} 업종 ${gs.length}개 · 지난 20거래일 변화가 큰 차례`}, ...gs.map(g => tile(g, groups.indexOf(g), shp, {band: true}))),
    h('p', {class: 't-key muted xs'}, `칸 하나 = 업종 하나 · 위 왼쪽부터 지난 20거래일 평균 변화가 큰 차례(지도 땅 안과 같음) · 순위는 업종 ${groups.length}개 가운데 · 누르면 그 업종`),
    foot(manifest)));
}
