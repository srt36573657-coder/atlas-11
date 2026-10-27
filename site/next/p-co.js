/* 3단 회사 자세히 — 고도리(/next/) 보는 화면 #/w/<번호> 의 머리(길 표시 · 이름 · 오늘 값 · 탭 넷 · 꼬리표) 밑 칸(app.js vWatch 가 page('co', 번호) 로 부름)
   사장님 2026-10-17(싱가포르) 04:04 「첫화면 부터 마지막 페이지 까지 모두 바꿔」 · 04:23 「정말 빠르면서도 정밀하게 · 에이전트 총 동원해」
   옛 판(site/atlas/atlas.js) viewCompany · coEntry · lineChart · whyBox · outBox · funnel · stopSay · viewMissing 의 셈과 글을 그대로 옮김(사장님 2026-10-18 [10] 1 · 2 로 낱말만 바꿈:
   20거래일 → 한 달 · 멍거 갈래 · 린치 갈래 → 멍거 조건 · 린치 조건(큰 업종이 아님) · 깔때기 두 갈래 → 깔때기 두 가지 · 몸값 → 회사 크기 — 낱말표 site/next/glossary.js 와 같은 말 · 검사가 옛 글과 맞댈 때 같은 표로 바꿔 견줌)
   보는 화면이 이미 그린 것(큰 선 · 길 표시 · 이름 · 오늘 값 · 하루 · 한 달 · 꼬리표 · 탭 넷 · 업종 채널 · 같은 업종 다음 볼 것)은 다시 그리지 않음 — 여기는 그 밖의 것만:
     7단 중 3단 · 시장 · 번호 · 1주 값 · 고른 곳 줄 → 업종 평균과 견준 한 달 그림(기준일 = 100 · 고른 날 금빛 세로선) → 세 숫자 · 100만 원 줄 · 출처
     → 왜 들었나요?(넘은 조건마다 해마다 값) / 왜 밖인가요?(멈춘 자리 · 까닭 · 깔때기 두 가지) → 다음 단 → 자료 줄 · 안전 문장
   옛 맺음 글의 「매수 · 매도」는 새 화면 금지 말이라 같은 뜻의 안전 문장으로 바꿈 · 사이트 맨 아래 고리(친구에게 소개하기 · 미국 판)는 새 화면 틀이 맡음
   보안 규칙(CSP) — 글은 textContent · 꾸밈은 p-co.css 와 CSSOM(setProperty)만 · 입체 · 바둑판 없음 · 검사 scripts/atlas11/next/check_co.mjs
   글씨 --fs-1 ~ --fs-5 · 간격 --sp-1 ~ --sp-3 · 글 시작 왼쪽 줄 16 · 32 · 48px 셋(p-co.css 머리말) */
import {NAME, josa as nameJosa} from './brand.js'; // 이름 한 곳(규칙 76) — 「밖」 칸 맨 위 결 한 줄(총정리 C12) · 아래 josa(w, a, b)는 옛 판 셈 그대로 둠
const NX = globalThis.NX;
const {h, sv} = NX;

/* ── 숫자 · 말 — atlas.js 와 같은 셈(반올림은 크기로 · 날짜는 붙임 띄어쓰기) ── */
const pct = NX.pct, r1 = NX.r1;
const md = d => (typeof d === 'string' && /^\d{4}-\d{2}-\d{2}/.test(d) ? NX.mdN(d) : '?');
function eok(v) { if (v == null) return '?'; const s = v < 0 ? '−' : '', a = Math.abs(v); if (a >= 10000) return s + r1(a / 10000).toLocaleString('ko-KR', {maximumFractionDigits: 1}) + '조 원'; return s + Math.round(a).toLocaleString('ko-KR') + '억 원'; }
/** 조사 — 받침 있으면 앞말 · 없으면 뒷말 · 한글이 아니면 둘 다(atlas.js josa 그대로) */
function josa(w, a, b) { const ch = String(w).trim().slice(-1), k = ch.charCodeAt(0) - 0xAC00; if (k < 0 || k > 11171) return w + a + '(' + b + ')'; return w + (k % 28 ? a : b); }
const won = v => (v == null ? '?' : Math.round(v).toLocaleString('ko-KR') + '원');
const pctEl = (x, tag = 'b') => h(tag, {class: 'num ' + NX.cls(x), text: pct(x)});
const NP = C => C?.funnel?.picked ?? '?';
const SPAN = C => (C?.days === 20 ? '한 달' : `${C?.days ?? '?'}거래일`); // 사장님 [10] 1 「20거래일 → 한 달」(자료가 20일이 아니면 옛 말 그대로)
const pickName = C => `${C?.rules?.name ?? '고른'} ${NP(C)}곳`;
const lyDay = C => (C?.rules?.lyDay ? md(C.rules.lyDay) : '모음 날');
const pickHow = C => `멍거 조건은 3년 성적표만, 린치 조건은 3년 성적표와 ${lyDay(C)} 값으로 골랐습니다`; // 옛 「멍거 갈래 · 린치 갈래」 — 큰 업종이 아니라 두 사람의 고르는 조건이라 「조건」(낱말표 glossary.js 와 같은 말)
const stopSay = (C, r) => (C.funnel?.groups ?? []).map(g => `${g.name}은 「${g.stopName?.[g.k === 'mg' ? r.sm : r.sl] ?? '고르기'}」에서`).join(', ') + ' 멈췄습니다';

/* ── 자료 — 고른 곳 = comp.json · lines.json / 고른 곳 밖 = co/<번호>.json 의 c · line(atlas.js coEntry 그대로 · 모든 회사 7단 core.co7) ── */
async function coEntry(code, X) {
  const coFile = () => NX.getJson('co/' + NX.enc(code) + '.json');
  const early = !X.co[code]?.p && X.core.co7 ? coFile() : null; // 고른 곳 밖이면 회사 파일을 함께 받음(한 번 더 기다리지 않게)
  const [comp, lines] = await Promise.all([NX.getJson('comp.json'), NX.getJson('lines.json')]);
  const pc = comp?.companies?.[code];
  if (pc) return Array.isArray(lines?.lines?.[code]) ? {c: pc, line: lines.lines[code], pk: true} : null;
  if (!comp && X.co[code]?.p) return null; // 고른 곳인데 comp.json 을 못 받음 — 「?」
  if (!X.core.co7) return null;
  const co = await (early ?? coFile());
  return co?.c && Array.isArray(co.line) ? {c: co.c, line: co.line, pk: false} : null;
}
let NM = null; // names.json(이름표 4천여 줄 · 밖인 까닭) — 번호로 찾는 표는 한 번만 만듦
function nameRow(code) {
  return NX.getJson('names.json').then(j => { if (!j?.rows) throw Error('names'); if (!NM || NM.src !== j) NM = {src: j, m: new Map(j.rows.map(r => [r.c, r]))}; return NM.m.get(code) ?? null; });
}

/* ── 그림 — atlas.js lineChart · gutterAxis · niceTicks · areaPath · fadeDefs 를 옮김(눈금 글 17px · 오른쪽 칸 52px) ── */
const TOK0 = {up: '#FF5A65', down: '#5B96FF', gold: '#E9B949', ink: '#F2EFE8', night: '#0C0E12', mute: '#8E959F', 'm4-soft': '#1C1F26'};
function tok() { const s = getComputedStyle(document.documentElement), o = {}; for (const k of Object.keys(TOK0)) o[k] = s.getPropertyValue('--' + k).trim() || TOK0[k]; return o; }
const TSTEP = [0.1, 0.2, 0.5, 1, 2, 5, 10, 20, 25, 50, 100, 200, 500, 1000, 2000, 5000, 1e4, 2e4, 5e4, 1e5, 2e5, 5e5, 1e6];
function niceTicks(lo, hi, max = 4) { let s = TSTEP.at(-1); for (const x of TSTEP) if ((hi - lo) / x <= max) { s = x; break; } const t = []; for (let a = Math.ceil(lo / s - 1e-9) * s; a <= hi + 1e-9; a += s) t.push(Math.round(a * 1000) / 1000); return t; }
const AXW = 48, LBL = 17; // 눈금 칸 넓이(p-co.css .pco-ax 셋째 칸과 같음) · 눈금 글 크기(--fs-1 = 17px) · 겹치는 눈금 글 빼기는 옛 그림과 같은 24px(같은 눈금 수)
function gutterAxis(svg, wrap, {ticks, Y, x0, x1, base, fmt}) {
  const T = tok(), lab = h('div', {class: 'pco-yr', 'aria-hidden': 'true'}), seen = new Set();
  const one = (t, b) => { const y = Y(t); svg.append(sv('line', {x1: x0, x2: x1 + 6, y1: y.toFixed(1), y2: y.toFixed(1), stroke: b ? T.mute : T['m4-soft'], 'stroke-width': 1, 'stroke-dasharray': b ? '2 4' : null}));
    const key = Math.round(y); if ([...seen].some(k => Math.abs(k - key) < 24)) return; seen.add(key); lab.append(h('span', {class: 'num', text: fmt(t), css: {top: (y - LBL / 2).toFixed(1) + 'px'}})); };
  if (base != null) one(base, true); // 기준선은 늘 그림(눈금 글이 겹치면 기준 글을 남김)
  for (const t of ticks) if (base == null || Math.abs(t - base) > 1e-9) one(t, false);
  wrap.append(lab);
}
function areaPath(arr, X, Y, by) { let d = '', seg = []; const flush = () => { if (seg.length) d += 'M' + X(seg[0]).toFixed(1) + ' ' + by.toFixed(1) + seg.map(i => 'L' + X(i).toFixed(1) + ' ' + Y(arr[i]).toFixed(1)).join('') + 'L' + X(seg[seg.length - 1]).toFixed(1) + ' ' + by.toFixed(1) + 'Z'; seg = []; }; arr.forEach((y, i) => { if (y == null) flush(); else seg.push(i); }); flush(); return d; }
function fadeDefs(defs, id, T, P, H, by) { // 기준선 위 빨강 · 아래 파랑 옅은 면(판판한 번짐 — 입체 아님)
  const gu = sv('linearGradient', {id: id + 'gu', gradientUnits: 'userSpaceOnUse', x1: 0, y1: P, x2: 0, y2: by}); gu.append(sv('stop', {offset: 0, 'stop-color': T.up, 'stop-opacity': 0.14}), sv('stop', {offset: 1, 'stop-color': T.up, 'stop-opacity': 0}));
  const gd = sv('linearGradient', {id: id + 'gd', gradientUnits: 'userSpaceOnUse', x1: 0, y1: by, x2: 0, y2: H - P}); gd.append(sv('stop', {offset: 0, 'stop-color': T.down, 'stop-opacity': 0}), sv('stop', {offset: 1, 'stop-color': T.down, 'stop-opacity': 0.14}));
  defs.append(gu, gd);
}
let lcN = 0;
/** 한 달(20거래일) 선 한 장 — 기준일 위 빨강 · 아래 파랑 · 회색 점선 = 업종 평균 · 금빛 세로선 = 고른 날(고른 곳만) · 끌면 그날 값 */
function drawChart(wrap, {C, v, avg, label, kPick}) {
  wrap.replaceChildren();
  const n = C.dates.length, W = Math.max(260, Math.round(wrap.getBoundingClientRect().width || 320)), H = 222, P = 10, PT = kPick != null ? 34 : 12, padR = AXW; // 위 띠(PT) = 「고른 날」 글 자리
  if (!v.some(x => x != null)) { wrap.append(h('p', {class: 'pco-q', text: `? 이 회사 ${SPAN(C)} 값을 못 읽었습니다`})); return; }
  const vals = [...v, ...(avg || []), 100].filter(x => x != null);
  let lo = Math.min(...vals), hi = Math.max(...vals); const pad = (hi - lo) * 0.06 || 2; lo -= pad; hi += pad;
  const X = i => 4 + i * (W - 4 - padR) / (n - 1), Y = y => PT + (hi - y) * (H - PT - P) / (hi - lo);
  const id = 'pcolc' + (++lcN), T = tok();
  const svg = sv('svg', {viewBox: `0 0 ${W} ${H}`, width: W, height: H, role: 'img', 'aria-label': label});
  const defs = sv('defs');
  const cu = sv('clipPath', {id: id + 'u'}); cu.append(sv('rect', {x: 0, y: 0, width: W, height: Y(100)}));
  const cd = sv('clipPath', {id: id + 'd'}); cd.append(sv('rect', {x: 0, y: Y(100), width: W, height: H - Y(100)}));
  defs.append(cu, cd); fadeDefs(defs, id, T, PT, H, Y(100)); svg.append(defs);
  gutterAxis(svg, wrap, {ticks: niceTicks(lo, hi), Y, x0: 4, x1: W - padR, base: 100, fmt: String}); // 눈금 = 기준일 100 과 같은 단위 · 100 은 점선
  const ad = areaPath(v, X, Y, Y(100));
  svg.append(sv('path', {d: ad, fill: `url(#${id}gu)`, 'clip-path': `url(#${id}u)`}), sv('path', {d: ad, fill: `url(#${id}gd)`, 'clip-path': `url(#${id}d)`}));
  if (kPick != null) svg.append(sv('line', {class: 'pco-pick', x1: X(kPick), x2: X(kPick), y1: PT - 4, y2: H - P + 4, stroke: T.gold, 'stroke-width': 2}));
  const path = arr => { let d = '', on = false; arr.forEach((y, i) => { if (y == null) { on = false; return; } d += (on ? 'L' : 'M') + X(i).toFixed(1) + ' ' + Y(y).toFixed(1); on = true; }); return d; };
  if (avg) svg.append(sv('path', {class: 'pco-avg', d: path(avg), fill: 'none', stroke: T.mute, 'stroke-width': 1.5, 'stroke-dasharray': '4 3', 'stroke-linecap': 'round'})); // 업종 평균 = 회색 점선
  const d = path(v);
  svg.append(sv('path', {class: 'pco-co', d, fill: 'none', stroke: T.up, 'stroke-width': 2, 'stroke-linejoin': 'round', 'stroke-linecap': 'round', 'clip-path': `url(#${id}u)`}));
  svg.append(sv('path', {class: 'pco-co', d, fill: 'none', stroke: T.down, 'stroke-width': 2, 'stroke-linejoin': 'round', 'stroke-linecap': 'round', 'clip-path': `url(#${id}d)`}));
  const lastK = v.map((x, i) => (x == null ? -1 : i)).filter(i => i >= 0).pop();
  svg.append(sv('circle', {cx: X(lastK), cy: Y(v[lastK]), r: 4.5, fill: v[lastK] >= 100 ? T.up : T.down, stroke: T.night, 'stroke-width': 2}));
  const cx = sv('line', {y1: PT, y2: H - P, stroke: T.ink, 'stroke-opacity': 0.6, 'stroke-width': 1, visibility: 'hidden'}), dot = sv('circle', {r: 5, fill: T.ink, stroke: T.night, 'stroke-width': 2, visibility: 'hidden'});
  svg.append(cx, dot);
  wrap.prepend(svg);
  const tip = h('div', {class: 'pco-tip num'}); tip.hidden = true; wrap.append(tip);
  if (kPick != null) { const pick = h('span', {class: 'pco-yl', text: '고른 날'}), xp = X(kPick); wrap.append(pick); if (xp - 6 >= 90) pick.style.setProperty('right', Math.max(0, 100 - ((xp - 6) / W) * 100).toFixed(2) + '%'); else pick.style.setProperty('left', Math.min(100, ((xp + 6) / W) * 100).toFixed(2) + '%'); } // 금빛 세로선 왼쪽 위 띠 — 오른쪽 끝을 선에 맞춤(재 둔 폭으로 왼쪽을 정하면 글꼴이 늦게 와 넓어질 때 화면 밖으로 나감 · 2026-10-22 20:53 아주 크게 글씨 #/w/025540 10px) · 선이 왼쪽 끝 가까우면 선 오른쪽 // 금빛 세로선 왼쪽 위 띠(선을 덮지 않게)
  wrap.append(h('div', {class: 'pco-ax'}, h('span', {text: md(C.dates[0]) + ' = 100'}), h('span', {text: md(C.dates[n - 1])})));
  const mv = e => { const r = svg.getBoundingClientRect(), x = (e.clientX - r.left) * W / r.width; let i = Math.round((x - 4) / ((W - 4 - padR) / (n - 1))); i = Math.max(0, Math.min(n - 1, i)); if (v[i] == null) return;
    cx.setAttribute('x1', X(i)); cx.setAttribute('x2', X(i)); cx.setAttribute('visibility', 'visible'); dot.setAttribute('cx', X(i)); dot.setAttribute('cy', Y(v[i])); dot.setAttribute('visibility', 'visible');
    tip.hidden = false; tip.textContent = md(C.dates[i]) + ' · ' + pct(v[i] - 100); const hw = (tip.offsetWidth || 160) / 2; // 이름표가 그림 칸 밖으로 나가지 않게(제 넓이의 반만큼 안쪽)
    tip.style.setProperty('left', Math.max(hw, Math.min(r.width - hw, X(i) * r.width / W)) + 'px'); };
  const lv = () => { cx.setAttribute('visibility', 'hidden'); dot.setAttribute('visibility', 'hidden'); tip.hidden = true; };
  svg.addEventListener('pointermove', mv); svg.addEventListener('pointerdown', mv); svg.addEventListener('pointerleave', lv);
}
/** 그림 칸 — 화면에 붙기 전에도 한 번(320 넓이) 그리고, 붙은 뒤 · 넓이가 바뀌면 그 넓이로 다시 그림(늦게 붙는 보는 화면 · 휴대폰 돌림) */
function chartBox(o) {
  const wrap = h('div', {class: 'pco-lc'});
  let lastW = -1, seen = false;
  const go = () => { const w = Math.round(wrap.getBoundingClientRect().width); if (w === lastW) return; lastW = w; drawChart(wrap, o); };
  go();
  if ('ResizeObserver' in globalThis) {
    const ro = new ResizeObserver(() => { if (!wrap.isConnected) { if (seen) ro.disconnect(); return; } seen = true; go(); });
    ro.observe(wrap);
  } else { let tries = 0; const t = () => { if (wrap.isConnected) go(); else if (++tries < 600) requestAnimationFrame(t); }; requestAnimationFrame(t); }
  return wrap;
}

/* ── 왜 들었나요? · 왜 밖인가요? · 깔때기 — atlas.js whyBox · outBox · funnel 그대로(숫자는 먹색 · 차례 없음 · 앞날 숫자 없음) ── */
function funnel(C, r) {
  const F = C.funnel, wrap = h('div', {class: 'pco-funnels'});
  for (const g of F?.groups ?? []) {
    const stop = r ? (g.k === 'mg' ? r.sm : r.sl) : null, at = stop ? (g.stop?.[stop] ?? g.steps.length) : g.steps.length;
    const ol = h('ol', {class: 'pco-funnel'});
    g.steps.forEach((s, ix) => { const fill = h('i', {class: 'fill', 'aria-hidden': 'true'}); fill.style.setProperty('width', (s.n / F.universe * 100) + '%');
      ol.append(h('li', {class: stop ? (ix < at ? 'past' : ix === at ? 'stop' : 'no') : null}, fill, h('span', {}, h('b', {class: 'num', text: s.n.toLocaleString('ko-KR') + '곳'}), h('span', {text: s.t})))); });
    wrap.append(h('p', {class: 'pco-fname'}, h('b', {text: `${g.name} ${g.n}곳`})), ol);
  }
  return wrap;
}
function more(summary, ...kids) { return h('details', {class: 'pco-more'}, h('summary', {text: summary}), h('div', {class: 'pco-in'}, ...kids)); }
/** 고른 곳 — 넘은 조건마다 해마다 값(멍거 = 세 조건 · 린치 = 두 조건) · 두 사람 말 · 값 · 한계는 접은 칸 */
function whyBox(C, c) {
  const p = c.pick, R = C.rules;
  const box = h('div', {class: 'pco-box'}, h('h2', {class: 'sec', text: `왜 ${pickName(C)}에 들었나요?`}), R?.notMunger ? h('p', {class: 'pco-hon', text: `${R.notMunger} 좋은 회사 순서가 아닙니다.`}) : null);
  if (!p?.tags?.length || !R?.groups || (!p.mg && !p.ly)) { box.append(h('p', {class: 'pco-q pco-p', text: '? 든 까닭을 못 읽었습니다'})); return box; }
  const row = (t, xs) => h('li', {}, h('b', {text: t}), ...xs.flatMap((x, k) => [k ? ' · ' : '', h('span', {class: 'num', text: x})]));
  const wonR = x => `${Math.round(x).toLocaleString('ko-KR')}원`;
  if (p.mg) { const m = p.mg, Y = m.years.map(y => String(y).slice(0, 4) + '년');
    box.append(h('p', {class: 'pco-p'}, h('b', {text: '멍거 조건 — 세 조건을 모두 넘었습니다'})), h('ul', {class: 'pco-tm'},
      row('① 해마다 남긴 돈 — ', m.net.map((x, k) => `${Y[k]} ${eok(x)}`)),
      row('② 자기 돈 100원에 빚 — ', m.debt.map((x, k) => `${Y[k]} ${Math.round(x)}원`)),
      row('③ 자기 돈 100원으로 번 돈 — ', m.roe.map((x, k) => `${Y[k]} ${r1(x).toFixed(1)}원`)))); }
  if (p.ly) { const l = p.ly;
    box.append(h('p', {class: 'pco-p'}, h('b', {text: '린치 조건 — 두 조건을 모두 넘었습니다'})), h('ul', {class: 'pco-tm'},
      row('① 한 주가 번 돈 — ', [`${l.years[0]}년 ${wonR(l.eps[0])}`, `${l.years[1]}년 ${wonR(l.eps[1])}`, `해마다 ${r1(l.g).toFixed(1)}% 큼`]),
      row('② 크는 빠르기에 견줘 값 — ', [`배당 ${r1(l.yld).toFixed(1)}%`, `이익의 ${r1(l.per).toFixed(1)}배 값`, `점수 ${l.score.toFixed(2)}`, '2 넘음', `${md(l.pxDay)} 값`])),
      h('p', {class: 'pco-small', text: '점수 = (한 주 이익이 해마다 큰 % + 배당 %) ÷ 1년 이익의 몇 배 값 — 린치는 2 넘는 것을 찾았습니다.'})); }
  box.append(more('두 사람의 말 · 값 · 한계 — 눌러서 보기', h('ul', {class: 'pco-tm pco-tm2'},
    ...R.groups.filter(g => p.tags.includes(g.k)).flatMap(g => [...g.conds.map(x => h('li', {text: `${x.t} — 「${x.q}」 · ${x.who}`})), h('li', {text: g.price}), h('li', {text: g.notCounted}), h('li', {text: g.limits})]),
    h('li', {text: `네이버 업종 「${p.sector}」 · ${C.sources?.pick ?? '?'}`}))));
  return box;
}
/** 고른 곳 밖 — 멈춘 자리 · 까닭(이름표) · 깔때기 두 가지(접은 칸) · 이름표는 늦게 받아 채움(받는 동안 「까닭을 받는 중…」) */
function outBox(C, code) {
  const box = h('div', {class: 'pco-box'}, h('h2', {class: 'sec', text: `왜 ${pickName(C)} 밖인가요?`}),
    h('p', {class: 'pco-hon pco-outk', text: `${nameJosa(NAME, '가')} 미리 정한 조건 두 가지에 안 든 회사예요. 나쁜 회사란 뜻은 아니에요.`})); // 맨 위 결 한 줄(사장님 2026-10-22 04:09 「결과부터」 · 총정리 C12) — 「밖 = 나쁜 회사」로 읽히기 전에 · 꼴은 왜 들었나요? 칸의 정직 글(.pco-hon)과 같음
  const wait = h('p', {class: 'pco-q pco-p', text: '까닭을 받는 중…'}); box.append(wait);
  const no = () => { wait.remove(); box.append(h('p', {class: 'pco-q pco-p', text: '? 까닭을 못 읽었습니다'})); };
  nameRow(code).then(r => {
    wait.remove(); if (!r) { no(); return; }
    box.append(h('p', {class: 'pco-p pco-lead', text: `${josa(r.n, '은', '는')} ${stopSay(C, r)}.`}), h('div', {class: 'pco-why', text: r.w ?? '?'}),
      more('깔때기 두 가지 — 어디서 멈췄나 보기', funnel(C, r)), h('p', {class: 'pco-small', text: `${pickHow(C)} — 새 1년 성적표가 나오면 다시 셉니다.`}));
  }).catch(no);
  return box;
}

/* ── 끝 — 다음 단 · 자료 줄 · 안전 문장 ── */
function nextChap(code) {
  const href = NX.chapNext(code, '3')?.getAttribute('href') ?? '#/w/' + NX.enc(code) + '/past'; // 4단이 새 화면에 있으면 #/w/<번호>/past · 아니면 옛 판(app.js chapList 와 같은 길)
  return h('a', {class: 'pco-next', href}, h('span', {}, h('small', {text: '다음'}), h('b', {text: '4단 지나온 길'}), h('span', {class: 'pco-nd', text: '1년 · 3년 주가 · 해마다 번 돈 · 회사 크기'})), h('i', {class: 'pco-chev', 'aria-hidden': 'true', text: '›'}));
}
function foot(C) {
  return [h('p', {class: 'pco-foot', text: `자료: ${C.sources?.price ?? '?'} · 기준일 = 마지막 종가 날(${md(C.asOf)})의 ${SPAN(C)} 전(${md(C.base)}) · ${pickName(C)} — ${pickHow(C)}(그 뒤 주가는 안 씀).`}),
    C.provisional ? h('details', {class: 'pco-foot pco-warn'}, h('summary', {text: '? 아직 바뀔 수 있는 값이에요 ›'}), h('p', {text: `${md(C.asOf)} 값은 그날 저녁 8시 전에 받아 아직 바뀔 수 있습니다(시간외 · 넥스트레이드) — 다음 받기에서 고쳐집니다.`})) : null, // 긴 경고는 「?」 한 줄 + 누르면 펼침([10] 10)
    h('p', {class: 'safe pco-safe', text: '저는 투자 상담사가 아니에요. 둘이는 지난 기록만 보여 줘요. 사고팔기나 들고 있기를 권하지 않고, 시장 앞날도 말하지 않아요.'})];
}

/* ── 화면 ── */
export async function render(arg) {
  const code = String(arg ?? '').split('/')[0];
  await Promise.all([NX.need('core'), NX.need('mkt')]);
  const X = NX.ix(); if (!X) return {title: '회사', nodes: NX.noData()};
  const C = X.core, M = X.co[code];
  if (!M) return {title: '없는 회사', nodes: [h('p', {class: 'empty', text: '? 이 번호의 회사를 찾지 못했어요.'})]};
  const root = h('div', {class: 'pco'}, h('h2', {class: 'sec', text: '이 회사 자세히'}), h('p', {class: 'pco-kind'}, h('b', {text: '7단 중 3단'}), ' · 회사 ', h('span', {text: '· 기록'})));
  const E = await coEntry(code, X);
  if (!E) { // 회사 파일을 못 받음(옛 viewMissing 자리) — 「?」 · 밖이면 이름표 까닭은 따로 받아 봄
    root.append(...NX.noData('회사 자료'));
    if (!M.p) root.append(outBox(C, code));
    root.append(nextChap(code), ...foot(C).filter(Boolean));
    return {title: M.n, nodes: [root]};
  }
  const c = E.c, I = X.ind.get(c.i), multi = (I?.n ?? 1) > 1, line = E.line.map(x => (x == null ? null : x / 100)); // 선 = 기준일 100
  const kPick = E.pk && C.kPick != null ? C.kPick : null; // 고른 곳 밖은 「고른 날」 금빛 줄을 긋지 않음(고른 회사로 읽히지 않게)
  root.append(h('p', {class: 'pco-meta', text: `${c.market === 'KOSPI' ? '코스피' : '코스닥'} · ${code} · 1주 ${won(c.price)}`}));
  root.append(E.pk ? h('p', {class: 'pco-chip pk'}, h('span', {class: 'pco-badge', text: '고른 곳'}), ` ${pickName(C)}에 든 회사입니다 — 두 사람이 고른 목록은 아닙니다`)
    : h('p', {class: 'pco-chip'}, h('span', {class: 'pco-tag', text: `${pickName(C)} 밖`}), ' 이 회사도 7단까지 볼 수 있습니다'));
  // 그림 → 범례 → 세 숫자 → 100만 원 줄 → 출처(옛 3단 차례 그대로)
  root.append(chartBox({C, v: line, avg: multi ? I.v : null, kPick, label: `${c.name} ${SPAN(C)} 선 — 기준일 ${md(C.base)} = 100에서 ${pct(c.chg)} · 가장 깊이 빠짐 ${pct(c.mdd)}`}));
  root.append(h('p', {class: 'pco-key'}, h('span', {}, h('i', {class: 'k-co', 'aria-hidden': 'true'}), `${c.name} — ${md(C.base)}보다 위 빨강 · 아래 파랑`), multi ? h('span', {}, h('i', {class: 'k-avg', 'aria-hidden': 'true'}), I.name + ' 평균') : null,
    kPick != null ? h('span', {}, h('i', {class: 'k-pick', 'aria-hidden': 'true'}), `고른 날 ${md(C.pickAsOf)}`) : null));
  root.append(h('div', {class: 'pco-trio'},
    h('div', {}, h('span', {text: SPAN(C)}), pctEl(c.chg)),
    h('div', {}, h('span', {text: '1년'}), pctEl(c.r1y)),
    h('div', {}, h('span', {text: `가장 깊이 빠짐(${SPAN(C)})`}), pctEl(c.mdd))));
  // 100만 원 줄 — 4단과 같은 뜻(산 날 = 기준일)
  const lv = line.filter(x => x != null), low = lv.length ? Math.min(...lv) : null, last = lv.length ? lv.at(-1) : null, man = x => h('span', {class: 'pco-nw', text: Math.round(x).toLocaleString('ko-KR') + '만 원'}); // 「81만 / 원」으로 갈리지 않게
  root.append(low == null ? h('p', {class: 'pco-won pco-q', text: '? 값을 못 읽었습니다'})
    : h('p', {class: 'pco-won'}, `${md(C.base)}에 100만 원어치였다면 `, ...(low < 100 ? ['가장 낮을 때 ', man(low), ' · 끝 ', man(last)] : ['그보다 낮아진 적 없이 끝 ', man(last)])));
  root.append(h('p', {class: 'pco-src', text: `네이버 증권 · ${md(c.priceDate || C.asOf)} 종가 · 둘이 셈`}));
  root.append(E.pk ? whyBox(C, c) : outBox(C, code));
  root.append(nextChap(code), ...foot(C).filter(Boolean));
  return {title: c.name, nodes: [root]};
}
