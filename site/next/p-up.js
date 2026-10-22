/* 업데이트 기록(#/up) — 지금 아틀란스(site/atlas/atlas.js viewUpdates · upChart · surgeRecLine)를 새 화면으로 옮김(2026-10-17 04:23 「에이전트 총 동원해」 · 규칙 74)
   사장님 2026-10-11 12:41 「업데이트는 하루에 4번 … 업데이트 탭 만들어서 기록해놓아라」 · 2026-10-12 12:41 「시장을 판독해서 … 애플 구글 클로드 cia방식으로 각각 1000만번씩」
   자료 = /atlas/data/updates.json(회차마다 한 줄 · 지우지 않음) · 글 · 숫자는 옛 쪽 그대로(scripts/atlas11/next/check_misc.mjs 가 맞대 봄)
   모양만 새 아틀란스: 제목 → 그림(회차마다 들고 난 수) → 시장 판독 · 네 눈 점검 → 회차 기록(최근 10번 · 앞 회차는 접은 칸) → 맨 아래 */
import {warn} from '/next/warn.js'; // 노란 경고 글은 두 줄까지 — 길면 「?」 한 줄로 접힘(사장님 2026-10-18 [10] 10 · warn.js)
import {fourText} from '/next/essence.js'; // 「하루 4번」 글은 지난 7일 기록이 맞을 때만(사장님 2026-10-18 16:39 [5] 4 · 요약 fourADay · 일꾼 KI) — 제목 · 밑 줄
const NX = globalThis.NX;
const {h, sv} = NX;
const NB = ' ';
const md = d => { const p = String(d).split('-'); return (+p[1]) + '월 ' + (+p[2]) + '일'; }; // 옛 쪽 md 그대로(붙임 띄어쓰기)
const pctEl = (x, tag = 'b') => h(tag, {class: 'num ' + NX.cls(x), text: NX.pct(x)});
const NP = C => C?.funnel?.picked ?? '?';
const pickName = C => `${C?.rules?.name ?? '고른'} ${NP(C)}곳`;
const lyDay = C => (C?.rules?.lyDay ? md(C.rules.lyDay) : '모음 날');
const pickHow = C => `멍거 갈래는 3년 성적표만, 린치 갈래는 3년 성적표와 ${lyDay(C)} 값으로 골랐습니다`;
/** 그림 색 — 색 이름(app.css :root)에서 읽음 · 못 읽으면 같은 값(옛 쪽 tok 그대로) */
const TOK0 = {up: '#FF5A65', down: '#5B96FF', gold: '#E9B949', ink: '#F2EFE8', night: '#0C0E12', mute: '#8E959F', sub: '#B0B5BD', 'm4-soft': '#1C1F26', 'm4-line': '#272B34', 'm4-neu': '#6F7782'};
function tok() { const s = getComputedStyle(document.documentElement), o = {}; for (const k of Object.keys(TOK0)) o[k] = s.getPropertyValue('--' + k).trim() || TOK0[k]; return o; }
/** 칸 넓이를 알 때 그림 — 화면에 붙은 뒤 · 넓이가 바뀔 때마다 다시(옛 쪽 chartDraw · resize 와 같은 뜻) */
function whenWide(host, draw) {
  let w0 = 0, seen = false;
  const go = () => { const w = host.clientWidth; if (!w || w === w0) return; w0 = w; draw(w); }; // clientWidth = 칸의 실제 넓이(큰 글씨 zoom 에도 그대로 · getBoundingClientRect 는 zoom 만큼 커짐)
  if (typeof ResizeObserver === 'function') { const ro = new ResizeObserver(() => { if (!host.isConnected) { if (seen) ro.disconnect(); return; } seen = true; go(); }); ro.observe(host); }
  else { const t = () => { if (host.isConnected) go(); else requestAnimationFrame(t); }; requestAnimationFrame(t); }
}
function foot(C) {
  return h('footer', {class: 'pup-foot'},
    h('p', {class: 'pup-links'}, h('a', {href: '/hello.html', text: '친구에게 소개하기'}), h('a', {href: '/us/', text: '미국 판'})),
    h('p', {text: `자료: ${C.sources?.price ?? '?'} · 기준일 = 마지막 종가 날(${md(C.asOf)})의 ${C.days}거래일 전(${md(C.base)}) · ${pickName(C)} — ${pickHow(C)}(그 뒤 주가는 안 씀).`}),
    C.provisional ? warn(`? ${md(C.asOf)} 값은 그날 저녁 8시 전에 받아 아직 바뀔 수 있습니다(시간외 · 넥스트레이드) — 다음 받기에서 고쳐집니다.`, {cls: 'in'}) : null,
    h('p', {class: 'safe', text: '돌이는 지난 기록만 보여 줘요. 사고팔기를 권하지 않아요.'}),
    h('p', {class: 'safe pup-safe2', text: '투자 상담이 아니에요. 지난 기록을 센 공부예요.'}));
}

/* 회차 한 줄의 말 — 옛 쪽 그대로 */
const DOW = ['일', '월', '화', '수', '목', '금', '토'];
const kstLabel = k => { const d = new Date(k.slice(0, 10) + 'T00:00:00Z'); return `${md(k.slice(0, 10))}(${DOW[d.getUTCDay()]}) ${k.slice(11, 16)}`; };
const RES_WORD = {'바꿈': '바꿈', '그대로': '그대로 — 새 값 없음', '실패': '실패'};
const OLD_NAME = v => (/^mg-/.test(v ?? '') ? '멍거 조건' : /^h365/.test(v ?? '') ? '힘 붙음' : /^d365/.test(v ?? '') ? '대세 업종' : /^t365/.test(v ?? '') ? '1년 우량' : null), OLD_RULE = v => (OLD_NAME(v) ? `옛 규칙(${OLD_NAME(v)})` : null); // 지난 회차 기록의 판 — 그때 이름 그대로 꼬리표로만
const RULE_TURN = (r, C) => `이 회차에 고르는 기준이 바뀌었습니다 — ${OLD_RULE(r.prevVersion) ?? '옛 규칙'} → ${r.version === C?.rules?.version ? pickName(C) : (OLD_RULE(r.version) ?? '새 규칙')}. 들고 난 곳이 많은 것은 기준 때문이고, 시장이 바뀐 것이 아닙니다.`;
function namesLine(list, max = 6) { return list.slice(0, max).map(x => x.n).join(' · ') + (list.length > max ? ` 외 ${list.length - max}곳` : ''); }
const manText = n => (n >= 1e4 && n % 1e4 === 0 ? (n / 1e4).toLocaleString('ko-KR') + '만' : Number(n).toLocaleString('ko-KR')); // 10000000 → 1,000만
/** 네 눈 점검 한 줄(사장님 2026-10-12 12:41 「업데이트 할때마다 아틀란스 점검을 애플 구글 클로드 cia방식으로 각각 1000만번씩」) */
const inspectLine = (I, all) => `네 눈 점검(눈마다 ${manText(I.nEach)} 번) — ` + (all || I.fail ? I.lenses.filter(l => all || l.fail).map(l => `${l.name} ${l.fail ? '걸림 ' + l.fail.toLocaleString('ko-KR') + '건' : '이상 없음'}`).join(' · ') : '모두 이상 없음');
/** 그 회차의 급등 고르기(규칙 69 · 네 칸 「선택됐다 탈락 됐다 이동 했다」) — 옛 쪽 surgeRecLine 그대로 */
const surgeRecLine = s => (s.kind === 'fail' ? `? 급등 탭 — 셈이 멈춰 앞에 고른 그대로 둠${s.why ? ` · ${s.why}` : ''}`
  : `급등 탭 — ${s.kind === 'first' ? `처음 고름 ${s.n ?? '?'}곳` : `새로 든 곳 ${s.in?.length ?? 0} · 빠진 곳 ${s.out?.length ?? 0} · 모두 ${s.n ?? '?'}곳`}${s.bands ? ` · 네 칸 ${s.bands.kind === 'first' ? '처음 고름' : `든 ${s.bands.in ?? 0} · 빠짐 ${s.bands.out ?? 0} · 옮김 ${s.bands.move ?? 0}`}` : ''}${s.published === false ? ' · ? 점검에 걸려 올라가지 않음' : ''}`);

/** 그림 — 회차마다 새로 든 곳(꽉 찬 진주 · 위) · 빠진 곳(테만 · 아래) · 실패 = 금빛 테 · 기준이 바뀐 회차 = 점선 빈 막대(자에서 뺌) · 오른쪽이 최근(옛 쪽 upChart 그대로) */
function upChart(host, rows, width) {
  host.textContent = '';
  const W = Math.max(260, Math.round(width || 320)), Hh = 132, P = 8, n = Math.max(rows.length, 1);
  const M = Math.max(4, ...rows.filter(r => !r.ruleChanged).flatMap(r => [r.in?.length ?? 0, r.out?.length ?? 0])) * 1.15, bw = Math.min((W - 2 * P) / n, 36), x0 = W - P - n * bw, Y0 = Hh / 2, sc = (Hh / 2 - P) / M;
  const svg = sv('svg', {viewBox: `0 0 ${W} ${Hh}`, width: W, height: Hh, role: 'img', 'aria-label': `최근 ${rows.length}회차 — 새로 든 곳 ${rows.reduce((t, r) => t + (r.in?.length ?? 0), 0)} · 빠진 곳 ${rows.reduce((t, r) => t + (r.out?.length ?? 0), 0)}`});
  const T = tok();
  for (const y of [P, Hh - P]) svg.append(sv('line', {x1: P, x2: W - P, y1: y, y2: y, stroke: T.ink, 'stroke-opacity': 0.12, 'stroke-width': 1}));
  svg.append(sv('line', {x1: P, x2: W - P, y1: Y0, y2: Y0, stroke: T.mute, 'stroke-width': 1}));
  rows.forEach((r, k) => {
    const x = x0 + k * bw + bw * 0.18, w = Math.max(2, bw * 0.64), a = (r.in?.length ?? 0) * sc, b = (r.out?.length ?? 0) * sc;
    if (r.ruleChanged) { svg.append(sv('rect', {x: x.toFixed(1), y: P, width: w.toFixed(1), height: Hh - 2 * P, rx: 1, fill: 'none', stroke: T.mute, 'stroke-width': 1.2, 'stroke-dasharray': '3 3'})); return; }
    if (r.result === '실패') svg.append(sv('rect', {x: x.toFixed(1), y: (Y0 - 7).toFixed(1), width: w.toFixed(1), height: 14, rx: 1, fill: 'none', stroke: T.gold, 'stroke-width': 1.5}));
    else if (!a && !b) svg.append(sv('circle', {cx: (x + w / 2).toFixed(1), cy: Y0, r: 2.5, fill: T.mute}));
    if (a) svg.append(sv('rect', {x: x.toFixed(1), y: (Y0 - a).toFixed(1), width: w.toFixed(1), height: a.toFixed(1), rx: 1, fill: T.ink}));
    if (b) svg.append(sv('rect', {x: (x + 0.75).toFixed(1), y: (Y0 + 0.75).toFixed(1), width: Math.max(1, w - 1.5).toFixed(1), height: Math.max(1, b - 1.5).toFixed(1), rx: 1, fill: 'none', stroke: T.sub, 'stroke-width': 1.5}));
  });
  host.append(svg);
  if (rows.length > 1) host.append(h('div', {class: 'pup-ax'}, h('span', {text: kstLabel(rows[0].kst)}), h('span', {text: kstLabel(rows[rows.length - 1].kst)})));
  else if (rows.length) host.append(h('div', {class: 'pup-ax'}, h('span', {}), h('span', {text: kstLabel(rows[0].kst)})));
}

/** 회차 한 칸 — 옛 쪽 줄 그대로(언제 · 어느 회차 · 결과 · 고른 날 · 그대로 남은 곳 · 새로 든 곳 · 빠진 곳 · 1등 갈래 · 시장 판독 · 급등 · 네 눈 · 까닭) */
function recLi(r, C) {
  const li = h('li', {class: 'pup-r r-' + ({'바꿈': 'ch', '그대로': 'same', '실패': 'fail'}[r.result] ?? 'same')});
  li.append(h('p', {class: 'pup-uh'}, h('b', {text: kstLabel(r.kst)}), ` · ${r.slot ? r.slot + ' 회차' : '그 밖 올림'} `, h('span', {class: 'pup-res', text: RES_WORD[r.result] ?? r.result})));
  if (!r.slot && r.reason) li.append(h('p', {class: 'pup-small', lang: 'ko', text: r.reason})); // 올린 까닭 = 원문 기록(사장님 말씀 · 그때 적은 글)
  if (r.ruleChanged) li.append(warn(RULE_TURN(r, C), {cls: 'in pup-turn'}));
  if (r.asOf) li.append(h('p', {text: `고른 날 ${md(r.asOf)}${r.provisional ? '(그날 저녁 8시 전 값 — 아직 바뀜)' : ''} · 기준일 ${md(r.base)}` + (OLD_RULE(r.version) ? ` · ${OLD_RULE(r.version)}` : '')}));
  if (r.stay != null && (r.in?.length || r.out?.length)) li.append(h('p', {class: 'pup-stay'}, h('b', {class: 'num', text: `그대로 ${r.stay}`})));
  if (r.in?.length || r.out?.length) {
    li.append(h('p', {}, h('b', {class: 'pup-ni', text: `새로 든 곳 ${r.in.length}`}), r.in.length ? ' ' + namesLine(r.in) : ''));
    li.append(h('p', {}, h('b', {class: 'pup-no', text: `빠진 곳 ${r.out.length}`}), r.out.length ? ' ' + namesLine(r.out) : ''));
    if (r.in.length > 6 || r.out.length > 6) li.append(h('details', {class: 'pup-more'}, h('summary', {text: '모두 보기'}), h('div', {class: 'pup-in'}, h('p', {text: '새로 든 곳: ' + r.in.map(x => x.n).join(' · ')}), h('p', {text: '빠진 곳: ' + r.out.map(x => x.n).join(' · ')}))));
  } else if (r.result !== '실패') li.append(h('p', {text: '고른 곳은 앞 회차와 같습니다.'}));
  if (r.top?.short) li.append(h('p', {}, `${r.top.scope === 'mkt' ? '모든 회사 1등 갈래' : '1등 갈래'} ${r.top.short} `, pctEl(r.top.chg, 'span'), ' · 고른 곳 전체 ', pctEl(r.all?.chg, 'span'), ` · 20거래일` + (r.in?.length ? '(고른 곳이 바뀐 것도 섞임)' : '')));
  if (r.market?.day) li.append(h('p', {class: 'pup-small', text: `시장 판독 — 하루 ${r.market.day.up}곳 오름 · ${r.market.day.down}곳 내림(${r.market.day.word}) · ${r.market.size}`}));
  if (r.surge && r.surge.kind !== 'carry') li.append(r.surge.kind === 'fail' || r.surge.published === false ? warn(surgeRecLine(r.surge), {cls: 'in'}) : h('p', {class: 'pup-small', text: surgeRecLine(r.surge)})); // 업데이트 때 넣고 뺀 것 · 그 밖 올림은 앞 판 그대로라 적지 않음
  if (r.inspect) li.append(r.inspect.fail ? warn('? ' + inspectLine(r.inspect, false), {cls: 'in'}) : h('p', {class: 'pup-small', text: inspectLine(r.inspect, false)}));
  if (r.result === '실패' || (r.result === '그대로' && !r.asOf)) li.append(r.result === '실패' ? warn(h('span', {lang: 'ko', text: '? ' + (r.why ?? '')}), {cls: 'in'}) : h('p', {class: 'pup-small', lang: 'ko', text: r.why ?? ''})); // 까닭 글 = 그때 적은 원문
  return li;
}

/* 요즘 바뀐 것(총정리 2026-10-22 D19 · 사장님 04:09 「결과부터」) — 사람이 쓴 「바뀐 것」 기록(reports/atlas11/changelog → 올릴 때 /changelog.json · scripts/atlas11/package.mjs)의 최신 업데이트 셋
   고객센터 「바뀐 것은 업데이트 기록에 남겨요」 약속이 닿는 곳 · 제목은 사람이 쓴 한국어 그대로(lang="ko") · 못 받으면 「?」 한 줄(멈추지 않음) */
const NEW_N = 3;
/** /changelog.json → 업데이트 줄(새것부터 · 미국 판 줄은 뺌) — 못 받거나 꼴이 다르면 null */
export function recentOf(log, n = NEW_N) {
  if (log?.schema !== 'atlas11-changelog-1' || !Array.isArray(log.entries)) return null;
  const at = e => String(e.live ?? e.made ?? '');
  return log.entries.filter(e => e?.kind === 'update' && e.place !== 'us' && typeof e.title === 'string' && e.title.trim() && /^\d{4}-\d{2}-\d{2}/.test(at(e)))
    .sort((a, b) => (at(a) < at(b) ? 1 : at(a) > at(b) ? -1 : 0)).slice(0, n);
}
const getLog = () => fetch('/changelog.json', {cache: 'no-cache'}).then(r => (r.ok ? r.json() : null)).catch(() => null);
function newBox(xs) {
  const box = h('section', {class: 'pup-new', 'aria-labelledby': 'pup-newh'}, h('h2', {class: 'sec', id: 'pup-newh', text: '요즘 바뀐 것'}));
  if (!xs) box.append(h('p', {class: 'pup-newq q', text: '? 바뀐 것 기록을 받지 못했어요'}));
  else if (!xs.length) box.append(h('p', {class: 'pup-newq', text: '아직 바뀐 것 기록이 없어요.'}));
  else box.append(h('ul', {class: 'pup-newl'}, ...xs.map(e => h('li', {}, h('b', {class: 'pup-nd', text: md(String(e.live ?? e.made).slice(0, 10))}), ' · ', h('span', {lang: 'ko', text: e.title.trim()})))));
  return box;
}

const SHOW = 10; // 처음 보이는 회차 수 — 앞 회차는 접은 칸(긴 목록은 접음 · 규칙 53)
export async function render() {
  const [C, U, , LOG] = await Promise.all([NX.need('core'), NX.getJson('updates.json'), NX.need('sum'), getLog()]); // sum = 첫 화면 요약(fourADay — 못 받으면 참인 말) · LOG = 요즘 바뀐 것
  if (!C || !U || !Array.isArray(U.records) || !Array.isArray(U.slots)) return {title: '업데이트 기록', nodes: NX.noData('업데이트 기록')};
  const R = U.records, last = R[0];
  const root = h('div', {class: 'pup', 'data-page': 'up'});
  // 결 — 요즘 바뀐 것 · 다음 회차(아래에 있던 줄을 위로 · 글 그대로)
  let nxEl = null;
  { const k = new Date(Date.now() + 9 * 36e5), m = k.getUTCHours() * 60 + k.getUTCMinutes(), nx = U.slots.find(x => +x.slice(0, 2) * 60 + +x.slice(3, 5) > m) ?? U.slots[0];
    if (nx) nxEl = h('p', {class: 'pup-nx'}, h('img', {src: '/media/makbi-icon.svg', alt: '', width: 40, height: 40, 'aria-hidden': 'true'}), h('span', {}, '다음 회차 ', h('b', {class: 'num', text: nx}),
      `(서울${U.slots.indexOf(nx) === 0 && +nx.slice(0, 2) * 60 + +nx.slice(3, 5) <= m ? ' · 내일' : ''}) — 새 종가가 있으면 값과 봉인 뒤 값을 그때 다시 셉니다.`)); } // 보드리가 다음 회차를 알림
  root.append(h('h1', {class: 'wt', text: fourText(`업데이트 기록 — 하루 ${U.slots.length}번`, NX.D.sum)}),
    h('p', {class: 'ws pup-tell', text: fourText(`하루 ${U.slots.length}번 · ${U.slots.join(' · ')}(서울)`, NX.D.sum)}),
    newBox(recentOf(LOG)), ...(nxEl ? [nxEl] : []),
    h('p', {class: 'pup-count', text: last ? `마지막 ${kstLabel(last.kst)} · ${RES_WORD[last.result] ?? last.result}` + (last.asOf ? ` · 고른 날 ${md(last.asOf)}` : '') : '아직 기록이 없습니다.'}));
  // 그림 한 장 — 최근 28회차(오른쪽이 최근)
  const rows = R.slice(0, 28).reverse(), host = h('div', {class: 'pup-chart'});
  root.append(host); whenWide(host, w => upChart(host, rows, w));
  const turnIn = R.slice(0, 28).find(r => r.ruleChanged);
  root.append(h('p', {class: 'pup-key'}, h('span', {}, h('i', {class: 'k-in'}), '새로 든 곳'), h('span', {}, h('i', {class: 'k-out'}), '빠진 곳'),
    turnIn ? h('span', {}, h('i', {class: 'k-turn'}), `점선 = 고르는 기준이 바뀐 회차(새로 든 곳 ${turnIn.in?.length ?? '?'} · 자에서 뺌)`) : null, h('span', {text: '막대 하나 = 회차 하나 · 오른쪽이 최근'})));
  // 시장 판독(사장님 2026-10-12 12:41 「시장을 판독해서」) — 마지막 회차가 올린 자료로 · 지난 사실만(규칙 49)
  if (last?.market?.lines?.length) root.append(h('div', {class: 'pup-mread'}, h('p', {}, h('b', {text: '지금 시장 판독'}), ' — 지난 값만 · 앞날 맞히기 아님'), h('ul', {}, ...last.market.lines.map(t => h('li', {text: t})))));
  if (last?.inspect) root.append(last.inspect.fail ? warn('? ' + inspectLine(last.inspect, true)) : h('p', {class: 'pup-line'}, inspectLine(last.inspect, true)));
  const h0 = [...R].reverse().find(r => r.version === C.rules?.version); // 이 규칙으로 처음 고른 회차(지난 기록에서 셈 · 날짜를 박지 않음)
  root.append(h('p', {class: 'note pup-how', text: `회차마다 값과 그림을 새로 셉니다 — ${pickName(C)}은 새 1년 성적표가 들어와야 바뀝니다(${h0 ? md(h0.kst.slice(0, 10)) + '부터' : '이번 회차부터'} 이 규칙 · 그 전 기록은 옛 규칙). 기준일은 늘 마지막 종가 날의 20거래일 전입니다. 회차마다 시장을 읽어 적고, 애플 · 구글 · 클로드 · CIA 네 눈으로 각각 111 번 점검합니다 — 하나라도 걸리면 새 자료를 올리지 않습니다. 기록은 지우지 않습니다.`})); // 네 눈 번 수 = 111(사장님 2026-10-18 「111번으로 바꿔라」 · roll.mjs b73b572e · 옛 1,000만 번)
  // 회차 기록 — 최근 10번은 펼침 · 앞 회차는 접은 칸(한 번 누르면 모두)
  root.append(h('h2', {class: 'sec', text: `회차 ${U.n}번 가운데 최근 ${R.length}번`}));
  root.append(h('ol', {class: 'pup-list'}, ...R.slice(0, SHOW).map(r => recLi(r, C))));
  if (R.length > SHOW) root.append(h('details', {class: 'pup-older'}, h('summary', {text: `앞 회차 ${R.length - SHOW}번 더 보기`}), h('ol', {class: 'pup-list', start: String(SHOW + 1)}, ...R.slice(SHOW).map(r => recLi(r, C)))));
  root.append(foot(C));
  return {title: '업데이트 기록', nodes: [root]};
}
