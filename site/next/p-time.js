/* 봉인(#/time) — 지금 아틀란스(site/atlas/atlas.js viewTime · timeChart · growSummary)를 새 화면으로 옮김(2026-10-17 04:23 「에이전트 총 동원해」 · 규칙 74)
   사장님 2026-10-11 14:37 · 14:39 「… 3년후 5년후 10년후에 이야기를 담에내는 … 과감하게」 — 앞날 값은 그리지 않음(규칙 49): 고른 날을 봉인해 3 · 5 · 10년 뒤 그날 종가로 다시 엶
   16:57 「이건 봉인하지마」 — 회사마다 앞으로 클까?는 봉인과 따로 · 자료 = /atlas/data/time.json · core.json(grow)
   글 · 숫자는 옛 쪽 그대로(scripts/atlas11/next/check_misc.mjs 가 맞대 봄) · 모양만 새 아틀란스(제목 → 그림 → 지금 · 지나온 길 · 앞날 → 접은 칸 → 봉인 번호) */
const NX = globalThis.NX;
const {h, sv} = NX;
const md = d => { const p = String(d).split('-'); return (+p[1]) + '월 ' + (+p[2]) + '일'; }; // 옛 쪽 md 그대로(붙임 띄어쓰기)
const ymd = d => String(d).slice(0, 4) + '년 ' + md(d);
const pctEl = (x, tag = 'b') => h(tag, {class: 'num ' + NX.cls(x), text: NX.pct(x)});
const NP = C => C?.funnel?.picked ?? '?';
const pickName = C => `${C?.rules?.name ?? '고른'} ${NP(C)}곳`;
const lyDay = C => (C?.rules?.lyDay ? md(C.rules.lyDay) : '모음 날');
const pickHow = C => `멍거 갈래는 3년 성적표만, 린치 갈래는 3년 성적표와 ${lyDay(C)} 값으로 골랐습니다`;
const OLD_NAME = v => (/^mg-/.test(v ?? '') ? '멍거 조건' : /^h365/.test(v ?? '') ? '힘 붙음' : /^d365/.test(v ?? '') ? '대세 업종' : /^t365/.test(v ?? '') ? '1년 우량' : null); // 봉인의 판 — 그때 이름 그대로
const won100 = m => (m == null ? '?' : Math.round(m * 100).toLocaleString('ko-KR') + '만 원'); // 배 → 100만 원이 얼마(2.7157 → 272만 원)
function dday(d) { const k = new Date(Date.now() + 9 * 36e5), t = Date.UTC(k.getUTCFullYear(), k.getUTCMonth(), k.getUTCDate()); const [y, m, x] = d.split('-').map(Number); return Math.round((Date.UTC(y, m - 1, x) - t) / 864e5); } // 서울 오늘부터 남은 날
const ddayText = d => { const n = dday(d); return n > 0 ? 'D-' + n.toLocaleString('ko-KR') : n === 0 ? '오늘 엶' : '엶 날 지남 — 다시 셀 차례'; };
/** 그림 색 — 색 이름(app.css :root)에서 읽음 · 못 읽으면 같은 값(옛 쪽 tok 그대로) */
const TOK0 = {up: '#FF5A65', down: '#5B96FF', gold: '#E9B949', ink: '#F2EFE8', night: '#0C0E12', mute: '#8E959F', sub: '#B0B5BD', 'm4-soft': '#1C1F26', 'm4-line': '#272B34', 'm4-neu': '#6F7782'};
function tok() { const s = getComputedStyle(document.documentElement), o = {}; for (const k of Object.keys(TOK0)) o[k] = s.getPropertyValue('--' + k).trim() || TOK0[k]; return o; }
/** 그림 눈금(옛 쪽 niceTicks · gutterAxis 그대로) — 글은 그림 오른쪽 칸 · 가는 가로선 · 기준선은 점선 · 눈금 글 = 「좋은 수」 */
const TSTEP = [0.1, 0.2, 0.5, 1, 2, 5, 10, 20, 25, 50, 100, 200, 500, 1000, 2000, 5000, 1e4, 2e4, 5e4, 1e5, 2e5, 5e5, 1e6];
function niceTicks(lo, hi, max = 4) { let s = TSTEP.at(-1); for (const x of TSTEP) if ((hi - lo) / x <= max) { s = x; break; } const t = []; for (let a = Math.ceil(lo / s - 1e-9) * s; a <= hi + 1e-9; a += s) t.push(Math.round(a * 1000) / 1000); return t; }
const remPx = () => parseFloat(getComputedStyle(document.documentElement).fontSize) || 21;
const AXR = () => Math.round(remPx() * 3.05); // 오른쪽 눈금 칸 넓이 — 글씨 크기를 따라감
function gutterAxis(svg, wrap, {ticks, Y, x0, x1, base, fmt, H}) {
  const T = tok(), lab = h('div', {class: 'ptime-yr', 'aria-hidden': 'true'}), seen = new Set();
  const one = (t, b) => { const y = Y(t); svg.append(sv('line', {x1: x0, x2: x1 + 6, y1: y.toFixed(1), y2: y.toFixed(1), stroke: b ? T.mute : T['m4-soft'], 'stroke-width': 1, 'stroke-dasharray': b ? '2 4' : null}));
    const key = Math.round(y); if ([...seen].some(k => Math.abs(k - key) < 24)) return; seen.add(key); const s = h('span', {class: 'num', text: fmt(t)}); s.style.setProperty('top', (y / H * 100).toFixed(3) + '%'); lab.append(s); }; // 글 가운데 = 눈금선(몫 · translateY(-50%))
  if (base != null) one(base, true); // 기준선은 늘 그림(눈금 글이 겹치면 기준 글을 남김)
  for (const t of ticks) if (base == null || Math.abs(t - base) > 1e-9) one(t, false);
  wrap.append(lab);
}
/** 칸 넓이를 알 때 그림 — 화면에 붙은 뒤 · 넓이가 바뀔 때마다 다시(옛 쪽 chartDraw · resize 와 같은 뜻) */
function whenWide(host, draw) {
  let w0 = 0, seen = false;
  const go = () => { const w = host.clientWidth; if (!w || w === w0) return; w0 = w; draw(w); }; // clientWidth = 칸의 실제 넓이(큰 글씨 zoom 에도 그대로 · getBoundingClientRect 는 zoom 만큼 커짐)
  if (typeof ResizeObserver === 'function') { const ro = new ResizeObserver(() => { if (!host.isConnected) { if (seen) ro.disconnect(); return; } seen = true; go(); }); ro.observe(host); }
  else { const t = () => { if (host.isConnected) go(); else requestAnimationFrame(t); }; requestAnimationFrame(t); }
}
function foot(C) {
  return h('footer', {class: 'ptime-foot'},
    h('p', {class: 'ptime-links'}, h('a', {href: '/hello.html', text: '친구에게 소개하기'}), h('a', {href: '/us/', text: '미국 판'})),
    h('p', {text: `자료: ${C.sources?.price ?? '?'} · 기준일 = 마지막 종가 날(${md(C.asOf)})의 ${C.days}거래일 전(${md(C.base)}) · ${pickName(C)} — ${pickHow(C)}(그 뒤 주가는 안 씀).`}),
    C.provisional ? h('p', {class: 'q', text: `? ${md(C.asOf)} 값은 그날 저녁 8시 전에 받아 아직 바뀔 수 있습니다(시간외 · 넥스트레이드) — 다음 받기에서 고쳐집니다.`}) : null,
    h('p', {class: 'safe', text: '아틀란스는 지난 기록만 보여 줘요. 사고팔기를 권하지 않아요.'}),
    h('p', {class: 'safe ptime-safe2', text: '투자 상담이 아니에요. 지난 기록을 센 공부예요.'}));
}

/** 그림 한 장 — 3년 전 → 봉인 날(= 100) 실제 선 · 그 뒤 3년 뒤 여는 날까지는 비워 둠(앞날 값을 그리지 않음) · 끌면 그날 값(옛 쪽 timeChart 그대로) */
function timeChart(host, K, width) {
  host.textContent = '';
  const wrap = h('div', {class: 'ptime-tc'}), plot = h('div', {class: 'ptime-plot'}); wrap.append(plot); host.append(wrap); // plot = 그림 높이 그대로(눈금 글 · 앞날 글 · 손가락 글의 자리 바탕)
  const P = K.past, S = K.since, open3 = K.opens[0].date, T = tok();
  const W = Math.max(260, Math.round(width || 320)), H = 232, Pd = 10, PT = 34, padR = AXR(); // 위 띠(PT) = 「앞날은 비워 둡니다」 글 자리
  const day = d => Date.UTC(+d.slice(0, 4), +d.slice(5, 7) - 1, +d.slice(8, 10)) / 864e5;
  const x0 = day(P.from), x1 = day(open3), X = d => 4 + (day(d) - x0) / (x1 - x0) * (W - 4 - padR);
  const last365 = P.v365.at(-1), lastPool = P.vpool.at(-1); // 봉인 날 = 100 으로 맞춤
  const p365 = P.v365.map(v => (v == null ? null : v / last365 * 100)), ppool = P.vpool.map(v => (v == null ? null : v / lastPool * 100));
  const vals = [...p365, ...ppool, ...S.v365, ...S.vpool, 100].filter(v => v != null);
  let lo = Math.min(...vals), hi = Math.max(...vals); const pad = (hi - lo) * 0.08 || 4; lo -= pad; hi += pad;
  const Y = v => PT + (hi - v) * (H - PT - Pd) / (hi - lo);
  const svg = sv('svg', {viewBox: `0 0 ${W} ${H}`, width: W, height: H, role: 'img', 'aria-label': `봉인 ${K.id}호 — 3년 전 ${ymd(P.from)}부터 봉인 날 ${ymd(K.seal)}까지 실제 선(봉인 날 = 100) · 그 뒤 3년 뒤 ${ymd(open3)}까지는 비워 둠(앞날 값을 그리지 않음)`});
  const xs = X(S.dates.at(-1));
  svg.append(sv('rect', {x: xs.toFixed(1), y: PT, width: Math.max(0, W - padR - xs).toFixed(1), height: H - PT - Pd, fill: T.ink, 'fill-opacity': 0.04, rx: 1})); // 아직 오지 않은 날 — 비워 둠
  gutterAxis(svg, plot, {ticks: niceTicks(lo, hi), Y, x0: 4, x1: W - padR, base: 100, fmt: String, H}); // 눈금 = 봉인 날 100 과 같은 단위 · 100 은 점선
  const path = (ds, arr) => { let d = '', on = false; arr.forEach((v, i) => { if (v == null) { on = false; return; } d += (on ? 'L' : 'M') + X(ds[i]).toFixed(1) + ' ' + Y(v).toFixed(1); on = true; }); return d; };
  svg.append(sv('path', {d: path(P.dates, ppool), fill: 'none', stroke: T['m4-neu'], 'stroke-width': 1.5, 'stroke-linejoin': 'round'})); // 후보 모두 = 회색 실선
  svg.append(sv('path', {d: path(P.dates, p365), fill: 'none', stroke: T.ink, 'stroke-width': 2, 'stroke-linejoin': 'round', 'stroke-linecap': 'round'})); // 봉인 365곳 = 진주 선
  if (S.days) {
    svg.append(sv('path', {d: path(S.dates, S.vpool), fill: 'none', stroke: T['m4-neu'], 'stroke-width': 1.5}));
    svg.append(sv('path', {d: path(S.dates, S.v365), fill: 'none', stroke: T.ink, 'stroke-width': 2, 'stroke-linecap': 'round'}));
  }
  svg.append(sv('line', {x1: X(K.seal), x2: X(K.seal), y1: PT - 4, y2: H - Pd + 4, stroke: T.gold, 'stroke-width': 2})); // 봉인 날
  svg.append(sv('line', {x1: X(open3), x2: X(open3), y1: PT - 4, y2: H - Pd + 4, stroke: T.sub, 'stroke-width': 1.5, 'stroke-dasharray': '6 4'})); // 3년 뒤 여는 날
  const lk = S.dates.length - 1;
  svg.append(sv('circle', {cx: X(S.dates[lk]), cy: Y(S.v365[lk]), r: 4.5, fill: T.ink, stroke: T.night, 'stroke-width': 2}));
  const cx = sv('line', {y1: PT, y2: H - Pd, stroke: T.ink, 'stroke-opacity': 0.6, 'stroke-width': 1}); cx.setAttribute('visibility', 'hidden'); svg.append(cx);
  plot.prepend(svg);
  const fut = h('span', {class: 'ptime-fut', text: '앞날은 비워 둡니다'}); fut.style.setProperty('left', ((xs + 8) / W * 100).toFixed(2) + '%'); fut.style.setProperty('right', ((padR + 8) / W * 100).toFixed(2) + '%'); fut.style.setProperty('top', '2px'); plot.append(fut);
  wrap.append(h('div', {class: 'ptime-ax3' + (W - padR < 240 ? ' narrow' : '')}, h('span', {text: '3년 전'}), h('span', {text: `봉인 ${md(K.seal)}`}), h('span', {text: '3년 뒤'}))); // 좁은 칸(320 · 큰 글씨)은 눈금 칸 여백을 빼고 한 줄 — 글이 낱자로 꺾이지 않게
  const tip = h('div', {class: 'ptime-tip num'}); tip.hidden = true; plot.append(tip);
  const allD = [...P.dates, ...S.dates.slice(1)], all365 = [...p365, ...S.v365.slice(1)];
  const mv = e => { const r = svg.getBoundingClientRect(), x = (e.clientX - r.left) * W / r.width; if (x > xs + 2) { cx.setAttribute('visibility', 'hidden'); tip.hidden = true; return; }
    let i = 0, best = 1e9; allD.forEach((d, k) => { const dx = Math.abs(X(d) - x); if (dx < best) { best = dx; i = k; } });
    cx.setAttribute('x1', X(allD[i])); cx.setAttribute('x2', X(allD[i])); cx.setAttribute('visibility', 'visible');
    const lw = plot.clientWidth || W; tip.hidden = false; tip.textContent = `${ymd(allD[i])} · 365곳 ${Math.round(all365[i])}`; tip.style.setProperty('left', Math.min(lw - 120, Math.max(120, X(allD[i]) * lw / W)) + 'px'); }; // 자리는 칸의 실제 넓이로(큰 글씨 zoom 에도 제자리)
  svg.addEventListener('pointermove', mv); svg.addEventListener('pointerdown', mv); svg.addEventListener('pointerleave', () => { cx.setAttribute('visibility', 'hidden'); tip.hidden = true; });
}

/* 회사마다 — 앞으로 클까?(봉인과 따로 · 16:57 「이건 봉인하지마」) — 옛 쪽 growSummary · checkLine 그대로 */
const GRADES_ALL = ['아주 높다', '높다', '반반', '낮다', '아주 낮다'];
const checkLine = (C, K) => { const N = C.grow?.factN, X = K.fixed;
  return `따로 다시 확인(${md(K.made)}): 근거 기사${N ? ` ${N.toLocaleString('ko-KR')}개 가운데` : ''} ${K.facts.n}개를${X ? '' : ' 골라(표본)'} 다른 팀이 직접 열어 봄 — 맞음 ${K.facts['맞음']} · 일부만 맞음 ${K.facts['일부만 맞음']} · 틀림 ${K.facts['틀림']} · 못 엶 ${K.facts['못 엶']}.` +
    (X ? ` 처음 열어 볼 때 일부만 맞음 ${X.first['일부만 맞음']} · 틀림 ${X.first['틀림']}이던 ${X.fixed}개는 원문대로 고쳐 다시 열어 봤고, 본문이 안 열린 ${X.dropped}개는 뺐습니다.` : '') +
    (N && X && N > K.facts.n ? ` 나머지 ${(N - K.facts.n).toLocaleString('ko-KR')}개(앞서 쓴 이야기)는 아직 다시 열어 보지 못했습니다.` : '') +
    ` 「기사로 못 봄」 경쟁 회사 ${K.rivals.n}곳은 기사로 확인 ${K.rivals['기사로 확인']} · 다른 일을 함 ${K.rivals['다른 일을 함']} · 확인 못 함 ${K.rivals['확인 못 함']}.`; };
function growSummary(C, Gs) {
  const rows = [...GRADES_ALL.map(gr => [gr, Gs.g10?.[gr] ?? 0]), ['? 자료 모자람', Gs.g10none ?? 0], ['조사 중', Gs.of - Gs.written]];
  const mx = Math.max(1, ...rows.map(r => r[1]));
  const ul = h('ul', {class: 'ptime-gbars', 'aria-label': `10년 뒤 더 커져 있을까요 — ` + rows.map(r => `${r[0]} ${r[1]}곳`).join(', ')});
  for (const [name, n] of rows) { const f = h('i', {class: 'ptime-gf'}); f.style.setProperty('width', (n / mx * 100) + '%'); ul.append(h('li', {}, h('span', {class: 'ptime-gn', text: name}), h('b', {class: 'num', text: n + '곳'}), h('span', {class: 'ptime-gt', 'aria-hidden': 'true'}, f))); }
  return h('section', {class: 'ptime-gsum'}, h('h2', {class: 'sec', text: '회사마다 — 앞으로 클까?'}),
    h('p', {class: 'ptime-p', text: `세 팀이 ${NP(C)}곳 가운데 ${Gs.written}곳을 따졌습니다 — 주가가 아니라 회사 크기(매출)만 봅니다. 10년 뒤 2025년보다 더 커져 있을까요?`}), ul,
    h('p', {class: 'note', text: `판의 모양: 혼자 앞섬 ${Gs.shapes?.['혼자 앞섬']}곳 · 몇 곳이 나눔 ${Gs.shapes?.['몇 곳이 나눔']}곳 · 다투는 곳이 많음 ${Gs.shapes?.['다투는 곳이 많음']}곳 · 새로 생기는 판 ${Gs.shapes?.['새로 생기는 판']}곳. 회사마다 5단 「누구와 다투나」에서 경쟁 회사를, 6단 「앞으로 클까?」에서 범위와 까닭을 봅니다. 이 이야기는 봉인하지 않습니다.`}),
    Gs.check ? h('p', {class: 'note', text: checkLine(C, Gs.check)}) : null);
}

export async function render() {
  const [C, TM] = await Promise.all([NX.need('core'), NX.getJson('time.json')]);
  if (!C || !TM) return {title: '봉인', nodes: NX.noData('봉인 자료')};
  const K = TM.capsules?.[0], root = h('div', {class: 'ptime', 'data-page': 'time'});
  if (!K) { root.append(h('h1', {class: 'wt', text: '봉인이 아직 없습니다'}), h('p', {class: 'ptime-count', text: '? 봉인 파일을 못 찾았습니다.'}), foot(C)); return {title: '봉인', nodes: [root]}; }
  const P = K.past, S = K.since;
  root.append(h('h1', {class: 'wt', text: `봉인 ${K.id}호 — ${md(K.seal)} 365곳을 3 · 5 · 10년 뒤 다시 엽니다`}),
    h('p', {class: 'ws ptime-tell', text: `봉인 ${ymd(K.seal)} · 봉인 번호 ${K.digest.slice(0, 12)}`}),
    h('p', {class: 'ptime-count', text: `365곳 · 후보 ${K.nPool.toLocaleString('ko-KR')}곳을 ${md(K.seal)} 종가 그대로 잠금 · 앞날 값은 그리지 않습니다`}));
  // 그림 한 장 — 지난 3년(실제 선) · 봉인 날 · 비워 둔 앞날
  const host = h('div', {class: 'ptime-chart'}); root.append(host); whenWide(host, w => timeChart(host, K, w));
  root.append(h('p', {class: 'ptime-key'}, h('span', {}, h('i', {class: 'k-365'}), '봉인 365곳'), h('span', {}, h('i', {class: 'k-pool'}), '후보 모두'),
    h('span', {}, h('i', {class: 'k-seal'}), '봉인 날 = 100'), h('span', {}, h('i', {class: 'k-open'}), '3년 뒤 여는 날')));
  // 지금 — 봉인 뒤 지금까지(현재에 집중)
  root.append(h('h2', {class: 'sec', text: '지금 — 봉인 뒤 지금까지'}));
  if (!S.days) root.append(h('p', {class: 'ptime-p'}, h('span', {class: 'q', text: '? '}), `아직 0거래일 — ${md(K.seal)}이 봉인 날이자 마지막 종가 날입니다. 다음 거래일부터 회차마다(하루 4번) 한 칸씩 채웁니다.`));
  else {
    root.append(h('div', {class: 'ptime-trio'}, h('div', {}, h('span', {text: '봉인 365곳'}), pctEl(S.chg365)), h('div', {}, h('span', {text: '후보 모두'}), pctEl(S.chgPool))));
    root.append(h('p', {class: 'ptime-src', text: `${md(K.seal)} 종가 → ${md(S.dates.at(-1))} 종가 · 봉인 뒤 ${S.days}거래일 · 같은 돈 나눠 사서 그대로 · 값 있는 ${S.have365}곳 · ${S.havePool.toLocaleString('ko-KR')}곳` + (S.stale365 ? ` · 마지막 날 값 없는 ${S.stale365}곳은 앞 값` : '')}));
  }
  // 지나온 길 — 3년 전부터(과거 존중)
  root.append(h('h2', {class: 'sec', text: '지나온 길 — 3년 전부터'}),
    h('p', {class: 'ptime-p'}, `${ymd(P.from)}에 봉인 365곳 가운데 그때 값이 있던 ${P.n365}곳을 100만 원어치씩 샀다면, 봉인 날 한 곳 평균 `, h('b', {class: 'num', text: won100(P.mult365)}), ' · 가운데 회사 ', h('b', {class: 'num', text: won100(P.med365)}),
      ` · 후보 모두(${P.nPool.toLocaleString('ko-KR')}곳) 평균 `, h('b', {class: 'num', text: won100(P.multPool)}), '.'),
    h('p', {class: 'note', text: `그 3년 사이 ${P.n365}곳 가운데 ${P.half}곳은 한때 꼭대기의 반값 아래로 떨어졌습니다 — 오른 길도 곧은 길이 아니었습니다.`}),
    h('p', {class: 'note', text: `이 365곳은 ${md(K.seal)}에 고른 곳이라, 3년을 거꾸로 보면 좋아 보이기 쉽습니다(뒤늦게 고른 효과). 3년 전에는 이 365곳을 알 수 없었습니다. 그때 값이 없던 ${P.skip365}곳은 뺐습니다.`}));
  // 앞날 — 다시 여는 날(3 · 5 · 10년 뒤)
  root.append(h('h2', {class: 'sec', text: '앞날 — 다시 여는 날'}),
    h('ol', {class: 'ptime-opens'}, ...K.opens.map(o => h('li', {}, h('span', {class: 'oy', text: `${o.y}년 뒤`}), h('span', {class: 'od', text: ymd(o.date)}), h('b', {class: 'num dd', text: ddayText(o.date)})))),
    h('p', {class: 'note', text: '그날 장이 쉬면 그 뒤 첫 거래일 종가로 엽니다. 봉인한 365곳이 후보 모두보다 나았는지만 셉니다 — 그 사이 고르는 기준이 바뀌어도 이 봉인은 그대로입니다.'}),
    K.version !== C.rules?.version ? h('p', {class: 'note', text: `봉인 ${K.id}호는 ${md(K.seal)} 옛 규칙(${OLD_NAME(K.version) ?? K.version})으로 고른 365곳을 잠근 것입니다. 그 뒤 고르는 기준이 바뀌어(${pickName(C)}) 봉인 ${K.id}호의 365곳과 지금 ${NP(C)}곳은 다릅니다.`}) : null);
  if (C.grow) root.append(growSummary(C, C.grow)); // 회사마다 앞으로 클까?(사장님 16:51 · 봉인과 따로 — 16:57 「이건 봉인하지마」)
  root.append(h('details', {class: 'ptime-more'}, h('summary', {text: '그날 이렇게 셉니다 — 봉인과 함께 잠근 규칙'}), h('div', {class: 'ptime-in'}, h('ol', {}, ...(K.rules ?? []).map(r => h('li', {text: r}))), K.rulesNote ? h('p', {class: 'ptime-small', text: K.rulesNote}) : null)));
  root.append(h('div', {class: 'ptime-seal'}, h('h2', {text: `봉인 번호 ${K.digest.slice(0, 12)}`}), h('p', {class: 'ptime-digest', text: K.digest}),
    h('p', {class: 'ptime-small', text: `기록 파일 ${K.file} · 지우지 않음 · 잠근 내용(날 · 규칙 · 회사 · 종가)이 한 글자만 바뀌어도 번호가 달라집니다 — 회차마다 다른 셈(노드)으로 번호를 다시 맞대 봅니다.`})));
  root.append(foot(C));
  return {title: `봉인 ${K.id}호`, nodes: [root]};
}
