/* 6단 「앞으로 클까?」 — 지금 아틀란스(site/atlas/atlas.js viewGrow · growChart · growNotes · checkLine · storyNone)를 새 화면으로 옮김
   사장님 2026-10-17(싱가포르) 04:04 「첫화면 부터 마지막 페이지 까지 모두 바꿔」 · 04:23 「정말 빠르면서도 정밀하게 · 에이전트 총 동원해」 · 규칙 74
   옛 말씀 그대로(2026-10-11 16:51 「… 주가를 … 하라는 얘기가 아니라 회사의 성장을 얘기 하란 얘기야 … 담백하게」 · 16:57 「이건 봉인하지마」 · 2026-10-12 00:50 7단):
   회사 크기(매출 · 기준 해 = 1)만 · 주가 숫자 없음 · 범위는 세 팀이 「100번 중 80번쯤 이 안」으로 잡은 따짐(맞힘 아님) · 봉인 안 함 · 이야기는 고른 곳만(밖은 「조사 전」)
   셈 · 글은 옛 쪽과 똑같이(xMul · 말 등급 · 「올해 증권사 평균치보다 작게 봄」 · 근거가 오래됨 · 다르게 보면 · 따로 다시 확인) — scripts/atlas11/next/check_grow.mjs 가 옛 쪽과 맞대 봄
   모양만 새 아틀란스 말투: 큰 제목 → 챕터 일곱 → 그림 한 장(매출 길) → 1 · 3 · 5 · 10년 칸 → 이야기가 틀리게 될 때 → 다르게 보면 → 접은 칸(왜 이렇게 봤나요?) → 다음 챕터
   남의 글(세 팀 이야기 · 기사 글)은 data-proper — 쓰지 않을 말 셈 밖(지금 아틀란스 site_check 와 같은 뜻) · 글은 textContent 로만 · 꾸밈은 p-grow.css 와 CSSOM 으로만 */
const NX = globalThis.NX;
const {h, sv} = NX;

const HZ = [['1', 2027], ['3', 2029], ['5', 2031], ['10', 2036]];
const xMul = m => (m == null ? '?' : (Math.round(m * 10 + 1e-9) / 10).toFixed(1) + '배');
const GTONE = {'아주 높다': 'g5', '높다': 'g4', '반반': 'g3', '낮다': 'g2', '아주 낮다': 'g1'};
/** 날짜 — 지금 아틀란스 md 와 같음(붙임 띄어쓰기 · 「10월 / 8일」로 갈리지 않게) */
const md = d => { const p = String(d).split('-'); return (+p[1]) + '월 ' + (+p[2]) + '일'; };
const NP = C => C?.funnel?.picked ?? '?';
const pickName = C => `${C?.rules?.name ?? '고른'} ${NP(C)}곳`;
const lyDay = C => (C?.rules?.lyDay ? md(C.rules.lyDay) : '모음 날');
const pickHow = C => `멍거 갈래는 3년 성적표만, 린치 갈래는 3년 성적표와 ${lyDay(C)} 값으로 골랐습니다`;
const PROPER = {'data-proper': '1'}; // 남의 글(세 팀 · 기사) — 화면 검사 쓰지 않을 말 셈 밖

/** 세 팀 이야기가 없을 때 — 고른 곳은 「아직 없음」 · 고른 곳 밖은 「조사 전」(이야기는 고른 곳만 사람이 조사해 씀) */
const storyNone = (C, pk) => (pk ? '? 세 팀 이야기는 아직 없습니다 — 멍거 · 린치 조건에 새로 든 회사는 사람이 조사해 새 기록 파일로 채웁니다(정해진 날 없음). 지금은 숫자만 보입니다.'
  : `? 세 팀 이야기는 조사 전입니다 — 이야기는 ${pickName(C)}만 사람이 조사해 씁니다. 이 회사는 숫자만 보입니다.`);
/** 따로 다시 확인 — 판정을 쓰지 않은 다른 팀이 근거 기사를 직접 열어 봄(고친 수 fixed 를 밝힘 · 틀림 장부 29번) */
const checkLine = (C, K) => { const N = C.grow?.factN, X = K.fixed;
  return `따로 다시 확인(${md(K.made)}): 근거 기사${N ? ` ${N.toLocaleString('ko-KR')}개 가운데` : ''} ${K.facts.n}개를${X ? '' : ' 골라(표본)'} 다른 팀이 직접 열어 봄 — 맞음 ${K.facts['맞음']} · 일부만 맞음 ${K.facts['일부만 맞음']} · 틀림 ${K.facts['틀림']} · 못 엶 ${K.facts['못 엶']}.` +
    (X ? ` 처음 열어 볼 때 일부만 맞음 ${X.first['일부만 맞음']} · 틀림 ${X.first['틀림']}이던 ${X.fixed}개는 원문대로 고쳐 다시 열어 봤고, 본문이 안 열린 ${X.dropped}개는 뺐습니다.` : '') +
    (N && X && N > K.facts.n ? ` 나머지 ${(N - K.facts.n).toLocaleString('ko-KR')}개(앞서 쓴 이야기)는 아직 다시 열어 보지 못했습니다.` : '') +
    ` 「기사로 못 봄」 경쟁 회사 ${K.rivals.n}곳은 기사로 확인 ${K.rivals['기사로 확인']} · 다른 일을 함 ${K.rivals['다른 일을 함']} · 확인 못 함 ${K.rivals['확인 못 함']}.`; };
function growNotes(C, S, pk = true) { // pk = 고른 곳(「따로 다시 확인」 줄은 고른 곳 이야기에 대한 것 — 고른 곳 밖 「조사 전」 화면에는 싣지 않음)
  return h('div', {class: 'pgrow-notes'},
    h('p', {text: S ? `이 이야기는 봉인하지 않습니다 — 쓴 날 ${md(S.made)} · 새 소식이 나오면 고쳐 씁니다. 범위는 「100번 중 80번쯤 이 안」으로 잡은 세 팀의 따짐이며, 맞힘이 아닙니다.` : '세 팀 이야기를 쓰면 같은 자리에 범위와 까닭이 보입니다.'}),
    pk && C.grow?.check ? h('p', {text: checkLine(C, C.grow.check)}) : null);
}
/** 다음 챕터 — 7단 이름과 「여기부터 다시 주가」(지금 아틀란스 다음 단 단추의 두 줄 그대로) + 새 화면 고리 */
const next7 = code => [h('div', {class: 'pgrow-next'}, h('p', {class: 'pgrow-nx'}, h('b', {text: '7단 범위 · 확인'}), h('span', {text: '여기부터 다시 주가 — 한 달 범위(모형) · 조심할 것 · 모르는 것'})), NX.chapNext(code, '6'))];

/* ── 그림 한 장: 지난 매출(기록) · 올해 증권사 평균치(남의 짐작 · 점선) · 세 팀이 따져 본 범위(테 · 가운데 굵은 줄) — 기준 해 매출 = 1 ── */
const TOK0 = {ink: '#F2EFE8', mute: '#8E959F', sub: '#B0B5BD', 'm4-soft': '#1C1F26', 'm4-line': '#272B34'}; // 먹빛 — app.css :root 를 못 읽을 때만
function tok() { const s = getComputedStyle(document.documentElement), o = {}; for (const k of Object.keys(TOK0)) o[k] = s.getPropertyValue('--' + k).trim() || TOK0[k]; return o; }
const TSTEP = [0.1, 0.2, 0.5, 1, 2, 5, 10, 20, 25, 50, 100, 200, 500, 1000, 2000, 5000, 1e4, 2e4, 5e4, 1e5, 2e5, 5e5, 1e6];
function niceTicks(lo, hi, max = 4) { let s = TSTEP.at(-1); for (const x of TSTEP) if ((hi - lo) / x <= max) { s = x; break; } const t = []; for (let a = Math.ceil(lo / s - 1e-9) * s; a <= hi + 1e-9; a += s) t.push(Math.round(a * 1000) / 1000); return t; }
const remPx = () => parseFloat(getComputedStyle(document.documentElement).fontSize) || 21;
const AXR = () => Math.round(remPx() * 3.05); // 오른쪽 눈금 칸 넓이(지금 아틀란스와 같은 셈)
/** 눈금 — 글은 그림 오른쪽 칸 · 가는 가로선 · 기준선(1배)은 점선 · 겹치는 글은 하나만(기준 글을 남김)
 *  글 자리는 그림과 같은 비율의 겹친 칸 안 % — 글씨 크기(화면 칸 zoom)로 그림이 줄거나 늘어도 선과 글이 어긋나지 않게 */
function gutterAxis(svg, wrap, {ticks, Y, x0, x1, base, fmt, W, H}) {
  const T = tok(), lab = h('div', {class: 'pgrow-yr', 'aria-hidden': 'true'}), seen = new Set();
  lab.style.setProperty('aspect-ratio', W + ' / ' + H);
  const one = (t, b) => { const y = Y(t); svg.append(sv('line', {x1: x0, x2: x1 + 6, y1: y.toFixed(1), y2: y.toFixed(1), stroke: b ? T.mute : T['m4-soft'], 'stroke-width': 1, 'stroke-dasharray': b ? '2 4' : null}));
    const key = Math.round(y); if ([...seen].some(k => Math.abs(k - key) < 24)) return; seen.add(key);
    const s = h('span', {class: 'num', text: fmt(t)}); s.style.setProperty('top', (y / H * 100).toFixed(3) + '%'); lab.append(s); };
  if (base != null) one(base, true);
  for (const t of ticks) if (base == null || Math.abs(t - base) > 1e-9) one(t, false);
  wrap.append(lab);
}
/** 그림 칸(slot) — 지난 매출 · 올해 짐작 · 1 · 3 · 5 · 10년 뒤 범위 · 자의 꼭대기(그림 · 해마다 칸 작은 띠가 같은 자) */
function slotsOf(G) {
  const S = G.story, base = G.baseRev;
  const act = G.years.map((y, k) => [y, G.rev[k]]).filter(([y]) => !y.endsWith('E')), est = G.years.map((y, k) => [y, G.rev[k]]).find(([y]) => y.endsWith('E'));
  const fut = S ? HZ.map(([k, y]) => [k, y, S.h[k]]) : [];
  const slots = [...act.map(([y, val]) => ({lab: y, kind: 'act', v: val / base})), ...(est && est[1] != null ? [{lab: est[0].replace('E', ''), kind: 'est', v: est[1] / base}] : []),
    ...fut.map(([k, y, x]) => ({lab: String(y), kind: 'fut', k, x}))];
  const top = Math.max(1.2, ...slots.map(s => (s.kind === 'fut' ? (s.x?.hi ?? 0) : s.v || 0))) * 1.08;
  return {slots, top};
}
function growChart(host, name, G) {
  host.textContent = '';
  const wrap = h('div', {class: 'pgrow-gc'}); host.append(wrap);
  const T = tok(), S = G.story;
  if (!G.baseRev) { wrap.append(h('p', {class: 'q pgrow-nochart', text: '? 마지막 결산 매출이 없어 그림을 못 그립니다'})); return; }
  const {slots, top} = slotsOf(G);
  const W = Math.max(260, Math.round(wrap.clientWidth || 320)), H = 230, P = 12, n = slots.length, padR = AXR(); // 넓이 = 칸의 실제 넓이(글씨 크기 zoom 안의 넓이 · 붙기 전에는 320)
  const X = j => 4 + (j + 0.5) * (W - 4 - padR) / n, bw = Math.min(34, (W - 4 - padR) / n * 0.56), Y = y => H - P - y / top * (H - 2 * P);
  const svg = sv('svg', {viewBox: `0 0 ${W} ${H}`, width: W, height: H, role: 'img', 'aria-label': `${name} 매출 길 — ${G.baseYear}년 매출 = 1 · ` +
    slots.map(s => s.kind === 'fut' ? `${s.k}년 뒤(${s.lab}) ${s.x?.mid != null ? xMul(s.x.lo) + '~' + xMul(s.x.hi) + ' 가운데 ' + xMul(s.x.mid) : '자료 모자람'}` : `${s.lab}${s.kind === 'est' ? ' 증권사 평균치' : ''} ${xMul(s.v)}`).join(', ')});
  const fmtX = t => (Number.isInteger(t) ? String(t) : t.toFixed(1)) + '배';
  gutterAxis(svg, wrap, {ticks: niceTicks(0, top).filter(t => t > 0), Y, x0: 4, x1: W - padR, base: 1, fmt: fmtX, W, H}); // 눈금 = 배(1배 = 기준 해 매출 · 점선)
  svg.append(sv('line', {x1: 4, x2: W - padR + 6, y1: Y(0), y2: Y(0), stroke: T['m4-line'], 'stroke-width': 1}));
  const jf = slots.findIndex(z => z.kind === 'fut'); if (jf > 0) { const xm = (X(jf - 1) + X(jf)) / 2; svg.append(sv('line', {x1: xm, x2: xm, y1: P, y2: H - P, stroke: T['m4-line'], 'stroke-width': 1, 'stroke-dasharray': '3 4'})); } // 기록 · 올해 | 1 · 3 · 5 · 10년 뒤 사이 가름 점선(해 사이가 같은 간격이 아님)
  const tipOf = [];
  slots.forEach((s, j) => {
    const x = X(j);
    if (s.kind === 'act') svg.append(sv('rect', {x: x - bw / 2, y: Y(Math.max(0, s.v)), width: bw, height: Math.max(1, Y(0) - Y(Math.max(0, s.v))), rx: 3, fill: T.sub}));
    else if (s.kind === 'est') svg.append(sv('rect', {x: x - bw / 2 + 1, y: Y(Math.max(0, s.v)), width: bw - 2, height: Math.max(1, Y(0) - Y(Math.max(0, s.v))), rx: 3, fill: 'none', stroke: T.sub, 'stroke-width': 2, 'stroke-dasharray': '6 4'}));
    else if (s.x && s.x.mid != null) {
      svg.append(sv('rect', {x: x - bw / 2, y: Y(s.x.hi), width: bw, height: Math.max(2, Y(s.x.lo) - Y(s.x.hi)), rx: 3, fill: T.ink, 'fill-opacity': 0.12, stroke: T.sub, 'stroke-width': 1}));
      svg.append(sv('line', {x1: x - bw / 2 - 3, x2: x + bw / 2 + 3, y1: Y(s.x.mid), y2: Y(s.x.mid), stroke: T.ink, 'stroke-width': 3, 'stroke-linecap': 'butt'}));
    } else svg.append(sv('line', {x1: x - bw / 2, x2: x + bw / 2, y1: Y(1), y2: Y(1), stroke: T.mute, 'stroke-width': 2, 'stroke-dasharray': '2 4'}));
    tipOf.push(s.kind === 'fut' ? `${s.k}년 뒤 ${s.lab}년 · ${s.x?.mid != null ? `${xMul(s.x.lo)} ~ ${xMul(s.x.hi)} · 가운데 ${xMul(s.x.mid)}` : '? 자료 모자람'}` : `${s.lab}년${s.kind === 'est' ? ' 증권사 평균치' : ''} · ${xMul(s.v)}`);
  });
  const cx = sv('line', {y1: P, y2: H - P, stroke: T.ink, 'stroke-opacity': 0.5, 'stroke-width': 1}); cx.setAttribute('visibility', 'hidden'); svg.append(cx);
  wrap.prepend(svg);
  const tip = h('div', {class: 'pgrow-tip num', role: 'status'}); tip.hidden = true; wrap.append(tip);
  wrap.append(h('div', {class: 'pgrow-ax'}, h('span', {text: `${slots[0].lab}년 →`}), h('span', {text: S ? `1 · 3 · 5 · 10년 뒤(${slots[n - 1].lab}년까지)` : `${slots[n - 1].lab}년`})));
  // 손가락 · 마우스 — 그 칸의 값(지금 아틀란스와 같은 글) · 이름표는 그림 칸 안에서만(좁은 화면 옆 넘침 없음)
  const mv = e => { const r = svg.getBoundingClientRect(), xx = (e.clientX - r.left) * W / r.width; const j = Math.max(0, Math.min(n - 1, Math.floor((xx - 4) / ((W - 4 - padR) / n))));
    cx.setAttribute('x1', X(j)); cx.setAttribute('x2', X(j)); cx.setAttribute('visibility', 'visible'); tip.hidden = false; tip.textContent = tipOf[j];
    const ww = wrap.clientWidth, tw = tip.offsetWidth, at = X(j) * ww / W; tip.style.setProperty('left', Math.max(0, Math.min(ww - tw, at - tw / 2)).toFixed(1) + 'px'); };
  svg.addEventListener('pointermove', mv); svg.addEventListener('pointerdown', mv); svg.addEventListener('pointerleave', () => { cx.setAttribute('visibility', 'hidden'); tip.hidden = true; });
}
/** 그림은 붙은 뒤 실제 넓이로 다시 그림 · 칸 넓이가 바뀌면(화면 넓이 · 글씨 크기 zoom) 다시 — 지금 아틀란스 chartDraw 와 같은 일 · 늘 마지막 그림 하나만
 *  ResizeObserver 알림 안에서는 그리지 않고 다음 그림 때(rAF)에 그림(알림 고리 오류가 나지 않게) · 칸이 떨어지면 지켜보기를 끝냄 */
let live = null;
function fit(L) { if (!L.host.isConnected) return false; const w = L.host.clientWidth; if (w && w !== L.w) { L.w = w; L.draw(); } return true; }
function keepDrawn(host, draw) {
  live?.stop();
  const L = {host, draw, w: -1, stop: () => {}}; live = L;
  if (typeof ResizeObserver === 'function') {
    let q = 0; const ro = new ResizeObserver(() => { if (!q) q = requestAnimationFrame(() => { q = 0; if (!fit(L) && L.w > 0) L.stop(); }); });
    L.stop = () => { ro.disconnect(); if (q) cancelAnimationFrame(q); }; ro.observe(host);
  } else { // 옛 기계 — 붙을 때까지 기다렸다 한 번 · 화면 넓이가 바뀌면 다시
    let tries = 0, rt = 0; const first = () => { if (live === L && !fit(L) && ++tries < 600) requestAnimationFrame(first); }; requestAnimationFrame(first);
    const on = () => { clearTimeout(rt); rt = setTimeout(() => { if (live !== L || !fit(L)) L.stop(); }, 200); }; addEventListener('resize', on); L.stop = () => removeEventListener('resize', on);
  }
}
/** 해마다 칸 작은 띠 — 그림과 같은 자(0 ~ 꼭대기) · 범위 테 · 가운데 줄 · 1배 점선(글은 칸 숫자가 말함 · 읽기 장치는 건너뜀) */
function rangeBar(x, top) {
  if (!x || x.mid == null || x.lo == null || x.hi == null || !(top > 0)) return null;
  const at = v => Math.max(0, Math.min(100, v / top * 100)).toFixed(2) + '%';
  const bd = h('i', {class: 'pgrow-rb-bd'}), mid = h('i', {class: 'pgrow-rb-md'}), one = h('i', {class: 'pgrow-rb-one'});
  bd.style.setProperty('left', at(x.lo)); bd.style.setProperty('width', Math.max(0.6, (x.hi - x.lo) / top * 100).toFixed(2) + '%');
  mid.style.setProperty('left', at(x.mid)); one.style.setProperty('left', at(1));
  return h('div', {class: 'pgrow-rb', 'aria-hidden': 'true'}, one, bd, mid);
}

export async function render(arg) {
  const code = String(arg ?? '').split('/')[0];
  await Promise.all([NX.need('core'), NX.need('mkt')]);
  const C = NX.D.core;
  if (!C) return {title: '앞으로 클까?', nodes: NX.noData()};
  const m = NX.ix()?.co?.[code]; // 모든 회사 목록(mkt.json) — 회사 파일 · comp.json 을 못 받았을 때 이름 · 챕터만이라도
  const noCo = () => ({title: (m ? m.n + ' — ' : '') + '앞으로 클까?', nodes: [h('h1', {class: 'wt pgrow-t', text: (m ? m.n + ' — ' : '') + '앞으로 클까?'}), m ? NX.chaps(code, '6') : null, ...NX.noData('회사 자료'), ...(m ? next7(code) : []), ...footOf(C)].filter(Boolean)});
  const comp = await NX.getJson('comp.json');
  if (!comp?.companies) return noCo();
  // 회사 자료 하나 — 고른 곳 = comp.json · 고른 곳 밖 = co/<번호>.json 의 c · line(지금 아틀란스 coEntry 와 같은 길)
  let E = null, co = null;
  if (comp.companies[code]) E = {c: comp.companies[code], pk: true};
  else if (C.co7 && /^[0-9A-Z]{6}$/.test(code)) {
    co = await NX.getJson('co/' + NX.enc(code) + '.json');
    if (co?.c && co.line) E = {c: co.c, pk: false};
    else if (!co && m) return noCo(); // 있는 회사인데 파일을 못 받음(망) — 「없는 주소」가 아님
  }
  if (!E) return missing(C, code);
  if (!co) co = await NX.getJson('co/' + NX.enc(code) + '.json');
  const c = E.c, G = co?.grow, S = G?.story, name = c.name;
  const nodes = [h('h1', {class: 'wt pgrow-t', text: name + ' — 앞으로 클까?'}), h('p', {class: 'ws', text: '회사 크기(매출)만 봅니다 · 주가는 보지 않습니다'}),
    NX.chaps(code, '6'), h('p', {class: 'pgrow-step'}, h('b', {text: '7단 중 6단'}), ' · 앞으로 클까? ', h('span', {text: '· 판단'}))];
  const foot = () => footOf(C);
  if (!G) { nodes.push(h('p', {class: 'q pgrow-none', text: '? 이 회사의 성장 자료를 못 읽었습니다'}), ...next7(code), ...foot()); return {title: name + ' — 앞으로 클까?', nodes}; }
  // ① 그림 한 장(위로)
  const host = h('div', {class: 'pgrow-host'});
  const draw = () => growChart(host, name, G); draw(); keepDrawn(host, draw);
  nodes.push(h('section', {class: 'pgrow-art', 'aria-label': '매출 길 그림'}, host,
    h('p', {class: 'pgrow-key'}, h('span', {}, h('i', {class: 'pgrow-k-act'}), '지난 매출(기록)'), h('span', {}, h('i', {class: 'pgrow-k-est'}), '올해 증권사 평균치(남의 짐작)'),
      S ? h('span', {}, h('i', {class: 'pgrow-k-band'}), '세 팀이 따져 본 범위 · 가운데') : null, h('span', {}, h('i', {class: 'pgrow-k-one'}), `${G.baseYear ?? '?'}년 매출 = 1`)),
    h('p', {class: 'pgrow-src', text: `네이버 증권 결산(${G.years.filter(y => !y.endsWith('E')).join(' · ')}) · 올해 증권사 평균치 · 10월 10일 모음`})));
  if (!S) {
    nodes.push(h('p', {class: 'pgrow-none'}, h('span', {class: 'q', text: '? '}), storyNone(C, E.pk).slice(2)));
    nodes.push(growNotes(C, null, E.pk), ...next7(code), ...foot());
    return {title: name + ' — 앞으로 클까?', nodes};
  }
  // ② 1 · 3 · 5 · 10년 — 기준 해 매출의 몇 배쯤 · 더 커져 있을까요?(말 등급) · 올해 증권사 평균치보다 작으면 그렇다고(기준 해를 숨기지 않음)
  const BY = G.baseYear ?? '?', ek = G.years.findIndex(y => y.endsWith('E')), er = ek >= 0 && G.rev[ek] && G.baseRev ? G.rev[ek] / G.baseRev : null;
  const top = G.baseRev ? slotsOf(G).top : null;
  nodes.push(h('h2', {class: 'sec pgrow-sec', text: `1 · 3 · 5 · 10년 뒤 — ${BY}년 매출의 몇 배쯤?`}));
  nodes.push(h('ol', {class: 'pgrow-yrs'}, ...HZ.map(([k, y]) => { const x = S.h[k];
    return h('li', {}, h('p', {class: 'pgrow-yh'}, h('b', {text: `${k}년 뒤`}), ` · ${y}년`),
      x && x.mid != null ? h('p', {class: 'pgrow-ym'}, h('b', {class: 'num', text: xMul(x.mid) + '쯤'}), h('span', {class: 'num', text: ` (${xMul(x.lo)} ~ ${xMul(x.hi)})`})) : h('p', {class: 'pgrow-ym'}, h('span', {class: 'q', text: '? 자료 모자람'})),
      rangeBar(x, top),
      x && x.g ? h('p', {class: 'pgrow-yg'}, `${BY}년보다 커져 있을까요? `, h('b', {class: 'pgrow-chip ' + GTONE[x.g], text: x.g})) : null,
      x && x.mid != null && er != null && x.mid < er ? h('p', {class: 'pgrow-yg pgrow-below'}, h('span', {class: 'q', text: '! '}), `올해 증권사 평균치(${xMul(er)} · 남의 짐작)보다 작게 봄`) : null,
      x && x.t ? h('p', {class: 'pgrow-yt', ...PROPER, text: x.t}) : null); })));
  nodes.push(...next7(code)); // 다음 챕터를 칸 바로 밑에도(지금 아틀란스 애플팀 — 첫 화면 가까이)
  // ③ 반대 근거와 아직 모르는 것 — 무너질 조건 · 못 찾은 것 · 근거 기사가 모두 1년 넘음 · 날짜 모름
  const facts = S.facts || [];
  const fds = facts.map(f => String(f.date || '')).filter(d => /^\d{4}-\d{2}/.test(d)).sort(), newest = fds.at(-1) ?? null;
  const stale = newest != null && newest.slice(0, 7) < String(+C.asOf.slice(0, 4) - 1) + C.asOf.slice(4, 7);
  if (S.brk || (S.unknown && S.unknown !== '없음') || stale || !newest) nodes.push(h('section', {class: 'pgrow-box', 'aria-label': '이야기가 틀리게 될 때'}, h('h2', {class: 'sec pgrow-sec', text: '이야기가 틀리게 될 때'}), h('ul', {class: 'pgrow-chk'},
    S.brk ? h('li', {}, h('span', {class: 'pgrow-m q', text: '!'}), h('span', {}, h('b', {text: '이런 일이 생기면 이야기가 바뀝니다 '}), h('span', {...PROPER, text: S.brk}))) : null,
    S.unknown && S.unknown !== '없음' ? h('li', {}, h('span', {class: 'pgrow-m q', text: '?'}), h('span', {}, h('b', {text: '못 찾은 것 '}), h('span', {...PROPER, text: S.unknown}))) : null,
    stale ? h('li', {}, h('span', {class: 'pgrow-m q', text: '?'}), h('span', {}, h('b', {text: '근거가 오래됨 '}), `근거 기사가 모두 1년 넘은 글입니다(가장 새 글 ${newest.slice(0, 4)}년 ${+newest.slice(5, 7)}월) — 그 뒤 일은 반영되지 않았을 수 있습니다.`)) : null,
    !newest ? h('li', {}, h('span', {class: 'pgrow-m q', text: '?'}), h('span', {}, h('b', {text: '근거 날짜 '}), '근거 기사의 날짜를 모릅니다.')) : null)));
  // ④ 다르게 보면(바깥에서 보기 · 치우침 기록 — grow_bias.py)
  const BI = C.grow?.bias, m10 = S.h['10']?.mid;
  if (BI) nodes.push(h('p', {class: 'pgrow-alt'}, h('b', {text: '다르게 보면 — '}), `${NP(C)}곳 10년 뒤 가운데 ${xMul(BI.m10)}쯤 · 이 회사 ${m10 != null ? xMul(m10) + '쯤' : '? 자료 모자람'}. 세 팀은 증권사보다 한 해쯤 조심스럽게 봤습니다(2027년 가운데 ÷ 올해 증권사 평균치 = ${Number.isFinite(BI.cons) ? BI.cons.toFixed(2) : '?'}배 · ${BI.consN}곳 가운데값).`));
  // ⑤ 왜 이렇게 봤나요?(접음) — 세 팀 한 줄 · 현실 기준선 · 근거 기사(따로 다시 확인 판정이 있으면 함께)
  const T3 = S.teams || {};
  nodes.push(h('details', {class: 'pgrow-more'}, h('summary', {text: `왜 이렇게 봤나요? — 세 팀 한 줄 · 근거 기사 ${facts.length}개`}), h('div', {class: 'pgrow-in'},
    h('ul', {class: 'pgrow-chk'},
      T3.google ? h('li', {}, h('span', {class: 'pgrow-m ok', text: 'G'}), h('span', {}, h('b', {text: '구글팀(숫자) '}), h('span', {...PROPER, text: T3.google}))) : null,
      T3.apple ? h('li', {}, h('span', {class: 'pgrow-m ok', text: 'A'}), h('span', {}, h('b', {text: '애플팀(제품 · 손님) '}), h('span', {...PROPER, text: T3.apple}))) : null,
      T3.claude ? h('li', {}, h('span', {class: 'pgrow-m ok', text: 'C'}), h('span', {}, h('b', {text: '클로드팀(반대편) '}), h('span', {...PROPER, text: T3.claude}))) : null),
    h('p', {text: '현실 기준선 — 빨리 큰 회사가 오래 계속 빨리 크는 일은 드뭅니다. 증권사 평균치도 좋게 나오는 쪽으로 기웁니다(Chan · Karceski · Lakonishok 2003). 다투는 회사가 많으면 남보다 높은 이익은 평균으로 돌아옵니다(Fama · French 2000).'}),
    h('ol', {class: 'pgrow-facts'}, ...facts.map(f => h('li', {}, h('span', {...PROPER, text: f.text}), ' ', h('a', {href: f.url, target: '_blank', rel: 'noopener noreferrer', text: `(${f.date || '날짜 ?'} 글)`}), f.chk ? h('span', {class: 'pgrow-w', text: ` · 따로 다시 확인: ${f.chk}`}) : null))))));
  nodes.push(growNotes(C, S), ...next7(code), ...foot());
  return {title: name + ' — 앞으로 클까?', nodes};
}
/** 없는 주소 — 지금 아틀란스 viewMissing 과 같은 글 · 펀드 · 우선주 같은 밖 칸의 이름 · 까닭은 지금 아틀란스 밖 칸으로 */
/** 맨 아래 — 지금 아틀란스 foot 의 자료 줄(출처 · 기준일 · 바탕 회사) · 아직 바뀔 수 있는 값 「?」 · 안전 문장(옛 「투자 상담사가 아닙니다」 글 자리 — 새 화면 말) */
function footOf(C) {
  return [h('footer', {class: 'pgrow-foot'},
    h('p', {text: `자료: ${C.sources?.price ?? '?'} · 기준일 = 마지막 종가 날(${md(C.asOf)})의 ${C.days}거래일 전(${md(C.base)}) · ${pickName(C)} — ${pickHow(C)}(그 뒤 주가는 안 씀).`}),
    C.provisional ? h('p', {class: 'q', text: `? ${md(C.asOf)} 값은 그날 저녁 8시 전에 받아 아직 바뀔 수 있습니다(시간외 · 넥스트레이드) — 다음 받기에서 고쳐집니다.`}) : null),
    h('p', {class: 'safe pgrow-safe', text: '아틀란스는 지난 기록만 보여 줘요. 사고팔기를 권하지 않아요.'})];
}
function missing(C, code) {
  const ok = /^[0-9A-Z]{6}$/.test(code);
  return {title: '없는 주소입니다', nodes: [h('h1', {class: 'wt', text: '없는 주소입니다'}),
    h('p', {class: 'pgrow-none', text: code ? `「${code}」는 지금 ${pickName(C)}에 없습니다. 찾기로 이름을 쳐 보세요.` : '주소가 바뀌었거나 잘못 들어왔습니다.'}),
    h('a', {class: 'more', href: '#/find', text: '회사 찾기 ›'}), ok ? h('a', {class: 'more', href: (NX.ready?.('x') ? '#/x/' : '/atlas/#/x/') + code, text: '이름 · 까닭 보기 ›'}) : null, h('a', {class: 'more', href: '#/', text: '처음 화면으로 ›'}),
    ...footOf(C)].filter(Boolean)};
}
