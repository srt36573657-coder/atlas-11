/* 4단 지나온 길 — 새 아틀란스(/next/ · #/w/<번호>/past)
   지금 아틀란스 site/atlas/atlas.js viewPast · priceChart 를 옮김(사장님 2026-10-17 04:04(싱가포르) 「첫화면 부터 마지막 페이지 까지 모두 바꿔」 · 04:23 「에이전트 총 동원해」)
   · 숫자 · 셈 · 뜻 있는 글은 옛 쪽 그대로 — 1주 값(20거래일 · 1년 · 3년) · 고른 곳 평균 점선 · 가장 깊이 빠짐 · 꼭대기에서 지금 · 100만 원어치 ·
     하루 30% 넘게 바뀐 날 「?」 · 해마다 번 돈(결산 기록 · 증권사 짐작 값 없음) · 몸값(접은 칸) · 출처 · 알림 글
   · 모양은 새 아틀란스 — 큰 제목 → 챕터 일곱 → 기간 → 그림 → 숫자 → 해마다 번 돈 → 접은 몸값 → 다음 챕터
   · 꾸밈은 p-past.css(클래스 ppast-) 와 CSSOM 으로만 · 글은 textContent 로만(보안 규칙) · 입체 · 캔버스 없음 · 빨강 = 오름 · 파랑 = 내림 · 금빛 = 「?」 · 하루 30% 넘게 바뀐 날만
   · 옛 쪽과 맞대는 검사 scripts/atlas11/next/check_past.mjs */
const NX = globalThis.NX;
const {h, sv} = NX;

/* 숫자 · 말 — 옛 쪽(atlas.js)과 글자 하나 다르지 않게 같은 셈 */
const r1 = x => Math.sign(x) * Math.floor(Math.abs(x) * 10 + 0.5 + 1e-7) / 10; // 반올림은 크기로(−7.25 → −7.3)
function pct(x) { if (x == null || !isFinite(x)) return '?'; const v = r1(x), a = Math.abs(v); return (v > 0 ? '+' : v < 0 ? '−' : '') + (a >= 100 ? Math.floor(a + 0.5 + 1e-7).toLocaleString('ko-KR') : a.toFixed(1)) + '%'; }
const md = d => { const p = String(d).split('-'); return (+p[1]) + '월\u00a0' + (+p[2]) + '일'; }; // 붙임 띄어쓰기 — 「10월 / 13일」로 갈라지지 않게
const ymd = d => String(d).slice(0, 4) + '년 ' + md(d);
function eok(v) { if (v == null) return '?'; const s = v < 0 ? '−' : '', a = Math.abs(v); if (a >= 10000) return s + r1(a / 10000).toLocaleString('ko-KR', {maximumFractionDigits: 1}) + '조 원'; return s + Math.round(a).toLocaleString('ko-KR') + '억 원'; }
const won = v => (v == null ? '?' : Math.round(v).toLocaleString('ko-KR') + '원');
function fy(p) { if (!p) return '?'; const [y, m] = p.replace('E', '').split('.'); return y + '년' + (m && m !== '12' ? '(' + (+m) + '월 결산)' : ''); }
const pctEl = x => h('b', {class: 'ppast-v ' + NX.cls(x), text: pct(x)}); // 색 = up · dn · fl · q(모름 = 금빛)
const NP = C => C?.funnel?.picked ?? '?'; // 고른 곳 수(멍거 · 린치 조건 N곳)
const pickName = C => `${C?.rules?.name ?? '고른'} ${NP(C)}곳`;
const lyDay = C => (C?.rules?.lyDay ? md(C.rules.lyDay) : '모음 날');
const pickHow = C => `멍거 갈래는 3년 성적표만, 린치 갈래는 3년 성적표와 ${lyDay(C)} 값으로 골랐습니다`;

/* 그림 도구 — 옛 쪽 tok · niceTicks · areaPath · fadeDefs · gutterAxis 를 옮김(색 이름은 app.css :root 에서 읽음 · 못 읽으면 같은 값) */
const TOK0 = {up: '#FF5A65', down: '#5B96FF', gold: '#E9B949', ink: '#F2EFE8', night: '#0C0E12', mute: '#8E959F', 'm4-soft': '#1C1F26'};
function tok() { const s = getComputedStyle(document.documentElement), o = {}; for (const k of Object.keys(TOK0)) o[k] = s.getPropertyValue('--' + k).trim() || TOK0[k]; return o; }
const TSTEP = [0.1, 0.2, 0.5, 1, 2, 5, 10, 20, 25, 50, 100, 200, 500, 1000, 2000, 5000, 1e4, 2e4, 5e4, 1e5, 2e5, 5e5, 1e6];
function niceTicks(lo, hi, max = 4) { let s = TSTEP.at(-1); for (const x of TSTEP) if ((hi - lo) / x <= max) { s = x; break; } const t = []; for (let a = Math.ceil(lo / s - 1e-9) * s; a <= hi + 1e-9; a += s) t.push(Math.round(a * 1000) / 1000); return t; }
function areaPath(arr, X, Y, by) { let d = '', seg = []; const flush = () => { if (seg.length) d += 'M' + X(seg[0]).toFixed(1) + ' ' + by.toFixed(1) + seg.map(i => 'L' + X(i).toFixed(1) + ' ' + Y(arr[i]).toFixed(1)).join('') + 'L' + X(seg[seg.length - 1]).toFixed(1) + ' ' + by.toFixed(1) + 'Z'; seg = []; }; arr.forEach((y, i) => { if (y == null) flush(); else seg.push(i); }); flush(); return d; }
function fadeDefs(defs, id, T, P, H, by) { // 기준선 위 빨강 · 아래 파랑 옅은 면(판판한 번짐 — 입체 아님)
  const gu = sv('linearGradient', {id: id + 'gu', gradientUnits: 'userSpaceOnUse', x1: 0, y1: P, x2: 0, y2: by}); gu.append(sv('stop', {offset: 0, 'stop-color': T.up, 'stop-opacity': 0.14}), sv('stop', {offset: 1, 'stop-color': T.up, 'stop-opacity': 0}));
  const gd = sv('linearGradient', {id: id + 'gd', gradientUnits: 'userSpaceOnUse', x1: 0, y1: by, x2: 0, y2: H - P}); gd.append(sv('stop', {offset: 0, 'stop-color': T.down, 'stop-opacity': 0}), sv('stop', {offset: 1, 'stop-color': T.down, 'stop-opacity': 0.14}));
  defs.append(gu, gd);
}
/** 눈금 — 글은 그림 오른쪽 칸(HTML · 17px) · 가는 가로선 · 기준선(첫날 = 0%)은 점선 · 글끼리 24px 안이면 뒤 글을 뺌(옛 쪽과 같은 눈금 글) */
function gutterAxis(svg, lab, T, {ticks, Y, x0, x1, base, fmt}) {
  const seen = [];
  const one = (t, b) => { const y = Y(t); svg.append(sv('line', {x1: x0, x2: x1 + 6, y1: y.toFixed(1), y2: y.toFixed(1), stroke: b ? T.mute : T['m4-soft'], 'stroke-width': 1, 'stroke-dasharray': b ? '2 4' : null}));
    const key = Math.round(y); if (seen.some(k => Math.abs(k - key) < 24)) return; seen.push(key); const s = h('span', {text: fmt(t)}); s.style.setProperty('top', (y - 9).toFixed(1) + 'px'); lab.append(s); };
  if (base != null) one(base, true); // 기준선은 늘 그림(눈금 글이 겹치면 기준 글을 남김)
  for (const t of ticks) if (base == null || Math.abs(t - base) > 1e-9) one(t, false);
}
let lcN = 0;
const H = 222, P = 10, PT = 12; // 그림 높이 · 아래 · 위 여백 — 옛 쪽과 같음(눈금 글이 같은 자리에서 같게 빠짐)
const sgn = t => (t > 0 ? '+' : t < 0 ? '−' : '');
/** 1주 값 그림 — 첫날 위 빨강 · 아래 파랑 · 회색 점선 = 고른 곳 평균(같은 날 같은 값에서 출발) · 금빛 동그라미 = 하루 30% 넘게 바뀐 날 · 빈 동그라미 = 가장 높을 때 · 낮을 때
 *  누르거나 끌면 그날 값(위 한 줄) · 놓으면 처음 글 */
function priceChart(box, {dates, close, avg, jumps, label, width}) {
  box.replaceChildren();
  const n = close.length, vals = [...close, ...avg].filter(x => x != null);
  const tip = h('p', {class: 'ppast-tip', role: 'status', 'aria-live': 'polite', text: '선을 누르면 그날 값이 보여요'});
  if (!vals.length) { box.append(h('p', {class: 'empty q', text: '? 이 기간 값을 못 읽었습니다'})); return; }
  let lo = Math.min(...vals), hi = Math.max(...vals); const pad = (hi - lo) * 0.06 || 1; lo -= pad; hi += pad;
  const base = close.find(x => x != null), toP = y => (y / base - 1) * 100, ticks = niceTicks(toP(lo), toP(hi)), fmt = t => `${sgn(t)}${Math.abs(t)}%`;
  const W = Math.max(120, Math.round(width)), padR = Math.max(52, Math.round(Math.max(...ticks.map(t => fmt(t).length), 2) * 10.5 + 8)); // 오른쪽 눈금 칸 = 가장 긴 눈금 글이 들어가는 넓이(17px 글)
  const X = i => 4 + i * (W - 4 - padR) / Math.max(1, n - 1), Y = y => PT + (hi - y) * (H - PT - P) / (hi - lo);
  const id = 'ppast' + (++lcN), T = tok(), by = Y(base);
  const svg = sv('svg', {viewBox: `0 0 ${W} ${H}`, width: W, height: H, role: 'img', 'aria-label': label});
  const defs = sv('defs'), cu = sv('clipPath', {id: id + 'u'}), cd = sv('clipPath', {id: id + 'd'});
  cu.append(sv('rect', {x: 0, y: 0, width: W, height: by})); cd.append(sv('rect', {x: 0, y: by, width: W, height: H - by}));
  defs.append(cu, cd); fadeDefs(defs, id, T, PT, H, by); svg.append(defs);
  const lab = h('div', {class: 'ppast-yr', 'aria-hidden': 'true'});
  gutterAxis(svg, lab, T, {ticks, Y: t => Y(base * (1 + t / 100)), x0: 4, x1: W - padR, base: 0, fmt}); // 눈금 = 첫날 대비 %(0% 는 점선)
  const ad = areaPath(close, X, Y, by);
  svg.append(sv('path', {d: ad, fill: `url(#${id}gu)`, 'clip-path': `url(#${id}u)`}), sv('path', {d: ad, fill: `url(#${id}gd)`, 'clip-path': `url(#${id}d)`}));
  const path = arr => { let d = '', on = false; arr.forEach((y, i) => { if (y == null) { on = false; return; } d += (on ? 'L' : 'M') + X(i).toFixed(1) + ' ' + Y(y).toFixed(1); on = true; }); return d; };
  svg.append(sv('path', {class: 'ppast-avg', d: path(avg), fill: 'none', stroke: T.mute, 'stroke-width': 1.5, 'stroke-dasharray': '4 3', 'stroke-linecap': 'round'}));
  const d = path(close);
  svg.append(sv('path', {d, fill: 'none', stroke: T.up, 'stroke-width': 2, 'stroke-linejoin': 'round', 'stroke-linecap': 'round', 'clip-path': `url(#${id}u)`}));
  svg.append(sv('path', {d, fill: 'none', stroke: T.down, 'stroke-width': 2, 'stroke-linejoin': 'round', 'stroke-linecap': 'round', 'clip-path': `url(#${id}d)`}));
  for (const [dt] of jumps) { const k = dates.indexOf(dt); if (k >= 0 && close[k] != null) svg.append(sv('circle', {class: 'ppast-jmp', cx: X(k), cy: Y(close[k]), r: 7, fill: 'none', stroke: T.gold, 'stroke-width': 2})); }
  const cv = close.filter(x => x != null), mxV = Math.max(...cv), mnV = Math.min(...cv); // 가장 높은 · 낮은 종가 — 그림에는 빈 동그라미 · 글은 그림 밑 한 줄
  for (const z of [mxV, mnV]) { const k = close.indexOf(z); if (k >= 0) svg.append(sv('circle', {class: 'ppast-ext', cx: X(k), cy: Y(z), r: 4, fill: T.night, stroke: T.ink, 'stroke-width': 1.5})); }
  const lastK = close.map((x, i) => (x == null ? -1 : i)).filter(i => i >= 0).pop();
  svg.append(sv('circle', {cx: X(lastK), cy: Y(close[lastK]), r: 4.5, fill: close[lastK] >= base ? T.up : T.down, stroke: T.night, 'stroke-width': 2}));
  const cx = sv('line', {y1: PT, y2: H - P, stroke: T.ink, 'stroke-opacity': 0.6, 'stroke-width': 1, visibility: 'hidden'}), dot = sv('circle', {r: 5, fill: T.ink, stroke: T.night, 'stroke-width': 2, visibility: 'hidden'});
  svg.append(cx, dot);
  const lc = h('div', {class: 'ppast-lc'}, svg, lab);
  tip.classList.toggle('two', W < 310); // 좁은 칸은 날 값 글이 두 줄이 될 수 있어 미리 두 줄 자리(누르는 동안 그림이 밀리지 않게)
  box.append(tip, lc, h('div', {class: 'ppast-ax'}, h('span', {text: ymd(dates[0])}), h('span', {text: ymd(dates[n - 1])})),
    h('p', {class: 'ppast-hl'}, h('span', {text: '가장 높을 때 ' + won(mxV)}), ' · ', h('span', {text: '가장 낮을 때 ' + won(mnV)})));
  const tip0 = tip.textContent;
  const mv = e => { const r = svg.getBoundingClientRect(); if (!r.width) return; const x = (e.clientX - r.left) * W / r.width; let i = Math.round((x - 4) / ((W - 4 - padR) / Math.max(1, n - 1))); i = Math.max(0, Math.min(n - 1, i)); if (close[i] == null) return;
    cx.setAttribute('x1', X(i)); cx.setAttribute('x2', X(i)); cx.setAttribute('visibility', 'visible'); dot.setAttribute('cx', X(i)); dot.setAttribute('cy', Y(close[i])); dot.setAttribute('visibility', 'visible');
    tip.classList.add('on'); tip.textContent = `${ymd(dates[i])} · ${won(close[i])} · ${pct((close[i] / base - 1) * 100)}`; };
  const lv = () => { cx.setAttribute('visibility', 'hidden'); dot.setAttribute('visibility', 'hidden'); tip.classList.remove('on'); tip.textContent = tip0; };
  svg.addEventListener('pointermove', mv); svg.addEventListener('pointerdown', mv);
  svg.addEventListener('pointerleave', e => { if (e.pointerType !== 'touch') lv(); }); // 손가락은 떼어도 그날 값이 남음(새 아틀란스 보는 화면과 같음) · 마우스는 나가면 처음 글
  svg.addEventListener('pointercancel', lv); // 그림 위에서 시작한 위아래 밀기(화면 넘김)는 값을 남기지 않음
}

/* 자료 — 고른 곳 = comp.json 의 회사 · 나머지 = co/<번호>.json 의 c(옛 쪽 coEntry 와 같음) · 값은 co/<번호>.json · 날짜와 고른 곳 평균은 days.json */
const PERIODS = [['20d', '20거래일', 21], ['1y', '1년', 253], ['3y', '3년', 757]];
let per = '1y'; // 고른 기간 — 옛 쪽 state.per 처럼 앱을 연 동안 기억(처음은 1년)
const widthGuess = () => { const v = document.querySelector('#view'), z = parseFloat(v ? getComputedStyle(v).zoom : 1) || 1; return Math.min((document.documentElement.clientWidth || 360) / z, 720) - 32; }; // 화면에 붙기 전 어림(붙으면 실제 넓이로 다시)

export async function render(arg) {
  const code = String(arg ?? '').split('/')[0];
  const [core, mkt, comp, dd] = await Promise.all([NX.need('core'), NX.need('mkt'), NX.getJson('comp.json'), NX.getJson('days.json')]);
  const known = !!NX.ix()?.co?.[code] || !!comp?.companies?.[code]; // 모든 회사 목록에 없는 번호(펀드 · 잘못된 주소)는 회사 파일을 부르지 않음(없는 파일 404 를 만들지 않게)
  const co = code && (known || !mkt || !comp) ? await NX.getJson('co/' + encodeURIComponent(code) + '.json') : null;
  const pk = !!comp?.companies?.[code], c = pk ? comp.companies[code] : co?.c;
  if (!core || !dd?.dates?.length) return {title: '지나온 길', nodes: NX.noData()};
  if (!co || !c) {
    if (known || (co && !comp)) return {title: '지나온 길', nodes: NX.noData('회사 자료')}; // 받지 못함(15초 뒤 다시) — 없는 회사와 가름
    return {title: '없는 회사', nodes: [h('p', {class: 'empty', text: '? 이 번호의 회사를 찾지 못했어요.'}), h('a', {class: 'more', href: '#/find', text: '회사 찾기 ›'})]};
  }
  const C = core, nAll = dd.dates.length, k0 = co.k0 ?? 0, jumps = Array.isArray(co.jumps) ? co.jumps : [];
  const nodes = [];
  nodes.push(h('h1', {class: 'wt', text: c.name + ' — 지나온 길'}), h('p', {class: 'ws', text: `1주 값 · ${md(dd.asOf)} 종가까지`}), NX.chaps(code, '4'),
    h('p', {class: 'ppast-lv', text: '7단 중 4단 · 지나온 길 · 기록'})); // 앎의 종류(옛 쪽 7단 표시 그대로 — 이 단은 지난 기록 · 조사 · 판단 · 셈이 아님)

  // 기간 단추 → 그림 → 그림 이름 → 세 숫자 → 1주 값 · 100만 원어치 → 하루 30% 넘게 바뀐 날
  const chartBox = h('div', {class: 'ppast-chart'}), key = h('div', {class: 'ppast-key'}), trio = h('div', {class: 'ppast-trio'}), wonLine = h('p', {class: 'ppast-won'}), money = h('p', {class: 'ppast-won'}), jumpNote = h('div');
  const seg = h('div', {class: 'ppast-seg', role: 'group', 'aria-label': '기간 바꾸기'});
  const btns = PERIODS.map(([id, name]) => h('button', {type: 'button', 'aria-pressed': String(id === per), text: name, onclick: () => { per = id; btns.forEach((x, k) => x.setAttribute('aria-pressed', String(PERIODS[k][0] === per))); draw(); }}));
  seg.append(...btns);
  let drawnW = 0;
  function draw() {
    const [, name, len] = PERIODS.find(p => p[0] === per), from = Math.max(k0, nAll - len);
    const dates = dd.dates.slice(from), cl = co.close.slice(from - k0), base = cl.find(x => x != null);
    const allv = dd.all.slice(from), avg = allv.map(x => x / allv[0] * base);
    const last = [...cl].reverse().find(x => x != null);
    let peak = 0, m = 0; for (const x of cl) { if (x == null) continue; peak = Math.max(peak, x); m = Math.min(m, x / peak - 1); }
    const short = from === k0 && nAll - len < k0; // 기간보다 늦게 들어온 회사(상장 뒤)
    const same1y = per === '1y' && !short && c.r1y != null && c.mdd1y != null; // 1년은 회사 자료 값 그대로(3단 · 7단과 같은 숫자)
    const row = (t, x) => h('div', {}, h('span', {text: t}), pctEl(x));
    trio.replaceChildren(row(name + (short ? '(상장 뒤)' : ''), same1y ? c.r1y : (last / base - 1) * 100), row('가장 깊이 빠짐', same1y ? c.mdd1y : m * 100), row('꼭대기에서 지금', (last / peak - 1) * 100));
    const lastK = cl.length - 1 - [...cl].reverse().findIndex(x => x != null);
    wonLine.textContent = `1주 ${ymd(dates[cl.findIndex(x => x != null)])} ${won(base)} → ${ymd(dates[lastK])} ${won(last)}`;
    const low = Math.min(...cl.filter(x => x != null)); // 산 날보다 가장 낮을 때 · 끝(돈으로 — 숫자에 약한 사람도 느끼게)
    const man = x => Math.round(x / base * 100).toLocaleString('ko-KR') + '만 원';
    money.textContent = low < base ? `100만 원어치였다면 산 날보다 가장 낮을 때 ${man(low)} · 끝 ${man(last)}` : `100만 원어치였다면 산 날보다 낮아진 적 없이 끝 ${man(last)}`;
    drawnW = (chartBox.isConnected && chartBox.clientWidth) || widthGuess(); // 넓이는 칸 자리 넓이(clientWidth — 글씨 크기 단추의 zoom 밖 값 · 그림 글 자리와 같은 단위)
    priceChart(chartBox, {dates, close: cl, avg, jumps, width: drawnW, label: `${c.name} ${name} 1주 값 — ${won(base)}에서 ${won(last)}(${pct((last / base - 1) * 100)})`});
    key.replaceChildren(h('span', {}, h('i', {class: 'ppast-k-co', 'aria-hidden': 'true'}), `${c.name} — ${ymd(dates[0])}보다 위 빨강 · 아래 파랑`), h('span', {}, h('i', {class: 'ppast-k-avg', 'aria-hidden': 'true'}), `${NP(C)}곳 평균(같은 날 같은 값에서 출발)`));
    const js = jumps.filter(j => j[0] >= dates[0]);
    jumpNote.replaceChildren(...(js.length ? [h('p', {class: 'ppast-jump'}, h('span', {class: 'q', text: '? '}), `하루에 30% 넘게 바뀐 날 ${js.map(j => ymd(j[0]) + ' ' + pct(j[1])).join(' · ')} — 한국 주식은 하루 30%까지만 움직이므로 주식 수가 바뀐 날(쪼개기 · 증자)일 수 있습니다. 확인 못 함.`)] : []));
  }
  draw();
  nodes.push(seg, chartBox, key, trio, wonLine, money, jumpNote);
  // 화면에 붙은 뒤 · 넓이가 바뀌면(화면 돌림 · 글씨 크기 단추의 zoom — 창 크기 알림이 없음) 실제 넓이로 다시 그림 — 이 화면을 떠나면 듣기를 그침
  let mounted = false;
  const refit = () => { if (!chartBox.isConnected) return; mounted = true; const w = chartBox.clientWidth; if (w && Math.abs(w - drawnW) > 1) draw(); };
  if (typeof ResizeObserver === 'function') {
    const ro = new ResizeObserver(() => { if (!chartBox.isConnected) { if (mounted) ro.disconnect(); return; } requestAnimationFrame(refit); }); // 다시 그리기는 다음 장면에(알림 고리 없음)
    ro.observe(chartBox);
  } else {
    let tries = 0, rt = 0;
    const fit = () => { if (chartBox.isConnected) refit(); else if (++tries < 600) requestAnimationFrame(fit); };
    requestAnimationFrame(fit);
    const onResize = () => { clearTimeout(rt); rt = setTimeout(() => { if (chartBox.isConnected) refit(); else if (mounted || tries >= 600) removeEventListener('resize', onResize); }, 200); };
    addEventListener('resize', onResize);
  }

  // 해마다 번 돈(기록만 · 증권사 짐작 E 는 넣지 않음)
  const f = co.fin || {}, years = f.years || [], rows = [];
  for (const [k, name] of [['rev', '매출'], ['op', '영업이익'], ['net', '순이익']]) { if (k === 'op' && co.key === 'net') continue; const vals = f[k] || []; if (vals.some(x => x != null)) rows.push([name, vals]); }
  const fb = h('div', {class: 'ppast-fin'});
  if (!rows.length || !years.length) fb.append(h('p', {class: 'ppast-q q', text: '? 결산 기록이 없습니다'}));
  for (const [name, vals] of rows) {
    const mx = Math.max(1, ...vals.filter(x => x != null).map(Math.abs));
    const list = h('ul', {});
    years.forEach((y, k) => { const x = vals[k], bar = h('i', {class: 'ppast-fb' + (x != null && x < 0 ? ' neg' : '')}); if (x != null) bar.style.setProperty('width', Math.max(2, Math.abs(x) / mx * 100) + '%');
      list.append(h('li', {}, h('span', {class: 'ppast-y', text: fy(y)}), h('span', {class: 'ppast-ft', 'aria-hidden': 'true'}, bar), h('b', {class: 'ppast-fv' + (x == null ? ' q' : ''), text: x == null ? '?' : eok(x)}))); });
    fb.append(h('h3', {text: name}), list);
  }
  fb.append(h('p', {class: 'ppast-small', text: '기록만 보입니다 — 증권사가 짐작한 올해 값은 넣지 않았습니다. 막대 길이는 같은 줄 안에서만 견줍니다.'}));
  nodes.push(h('h2', {class: 'sec', text: '해마다 번 돈(결산 기록)'}), fb);

  // 몸값(접은 칸)
  const ly = years.length - 1, mark = ok => h('span', {class: 'ppast-m' + (ok ? '' : ' q'), 'aria-hidden': 'true', text: ok ? '·' : '?'});
  nodes.push(h('details', {class: 'ppast-more'}, h('summary', {text: '몸값 — 눌러서 보기'}), h('ul', {class: 'ppast-chk'},
    h('li', {}, mark(true), h('span', {}, h('b', {text: '시가총액 '}), eok(c.cap))),
    h('li', {}, mark(co.per != null), h('span', {}, h('b', {text: '1년 순이익의 '}), co.per != null ? `${r1(co.per).toFixed(1)}배(${NP(C)}곳 가운데값 ${r1(C.facts?.perMedian).toFixed(1)}배)` : '? 자료 없음')),
    h('li', {}, mark(co.pbr != null), h('span', {}, h('b', {text: '장부 값의 '}), co.pbr != null ? `${r1(co.pbr).toFixed(1)}배` : '? 자료 없음')),
    ly >= 0 ? h('li', {}, mark(true), h('span', {}, h('b', {text: `${fy(years[ly])} 빚 · 이익률 `}), `부채비율 ${f.debt?.[ly] != null ? r1(f.debt[ly]).toFixed(1) + '%' : '?'} · 자기자본 이익률 ${f.roe?.[ly] != null ? r1(f.roe[ly]).toFixed(1) + '%' : '?'}`)) : null)));
  nodes.push(h('p', {class: 'ppast-src', text: '네이버 증권 · 결산 · 10월 10일 모음'}));

  // 다음 챕터 — 미리 보기는 판정 말 없이 사실만(옛 쪽 그대로 — 반대 근거보다 좋은 말이 먼저 보이지 않게)
  const G = co.grow, S5 = G?.story;
  const sub = G ? [S5?.shape, S5 ? `경쟁 회사 ${(S5.rivals || []).length}곳` : (pk ? '세 팀 이야기 없음' : '이야기 조사 전'), `업종 안 매출 ${G.ind?.rank ?? '?'}번째`].filter(Boolean).join(' · ') : '경쟁 회사 · 업종 안 크기';
  nodes.push(h('p', {class: 'ppast-nx'}, h('b', {text: '5 누구와 다투나'}), h('span', {text: sub})), NX.chapNext(code, '4'));

  // 출처 · 알림(옛 쪽 맨 아래 글 — 쓰지 않을 말 둘만 쉬운 말로: 「매수 · 매도」 → 「사고팔기」)
  nodes.push(h('footer', {class: 'ppast-foot'},
    h('p', {text: `자료: ${C.sources?.price ?? '?'} · 기준일 = 마지막 종가 날(${md(C.asOf)})의 ${C.days}거래일 전(${md(C.base)}) · ${pickName(C)} — ${pickHow(C)}(그 뒤 주가는 안 씀).`}),
    C.provisional ? h('p', {class: 'q', text: `? ${md(C.asOf)} 값은 그날 저녁 8시 전에 받아 아직 바뀔 수 있습니다(시간외 · 넥스트레이드) — 다음 받기에서 고쳐집니다.`}) : null,
    h('p', {text: '저는 투자 상담사가 아닙니다 · 이 자료는 지난 기록을 센 공부이며, 특정 종목의 사고팔기 · 보유 또는 시장 전망을 권하지 않습니다.'})));
  return {title: c.name + ' — 지나온 길', nodes: [h('div', {class: 'ppast'}, ...nodes)]};
}
