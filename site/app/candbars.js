/* ATLAS 11 · 「후보 7」 막대 그래프 — 첫 화면(#/) ② 그림 칸
   사장님 2026-10-10 11:19(마카오) 「바둑판 영구 삭제해」 — 같은 날 09:51 「3d 영구 삭제해」로 입체 섬을 바꾼 칸 그림(365칸 바둑판 · tiles.js)을 지우고 막대로
   · 줄 하나 = 후보 한 곳(순위 차례) · 막대 = 오늘 1년 추세(마지막 20거래일 뺌 · 판 읽기 cand.grow.m) · 점선 = 그물 기준선(1년 추세 상위 20%)
   · 짧은 세로 줄 = 20거래일 전 1년 추세(오늘 판 읽기 값) · 한 그림 안은 같은 축(0 · 기준선 · 모든 값) · 빨강 = 오름 · 파랑 = 내림(규칙 — 부호 · 단위를 함께)
   · 금빛 테 + 위 이름표 = 고른 한 곳(하나만 빛남) · 그 밖 365곳은 글 한 줄(그물 곳 수 · 기준 넘은 곳 — 바둑판 없이)
   · 가만히 두면 멈춘 그림(규칙 42) · 줄을 누르면 그 한 곳(카드 · 금빛) · 「재생」: 0 = 20거래일 전(막대가 그때 값 · 점선이 그때 기준선) → 1~7 한 걸음에 한 곳씩 오늘 값으로
     → 카드 위험 줄 → 카드 단추(움직이는 것은 걸음 부품 하나 — art.js)
   · 저절로 설명(tour.js · 규칙 49 ④) 손잡이: to(고름) · rise(그 막대가 20거래일 전 길이에서 오늘 길이로 · 한 번) · wave(같은 업종 후보 줄에 차례로 테 — 움직임 없이 바뀜) · calm · busy · stage
   · 평평한 막대(입체 · 바둑판 없음 — 규칙 50 · 51) · 글자는 HTML · 막대 자리와 길이는 CSS 변수(CSSOM — CSP) · 움직임 줄이기면 바로 끝 모습 */
import {h, finite, md} from './util.js';
import {axisOf, posOf} from './charts.js';

const mm = q => typeof matchMedia === 'function' && matchMedia(q).matches;
const fin = v => typeof v === 'number' && Number.isFinite(v);
/** % 값 → 「+165.2%」(0 이면 부호 없음 · 사이트 숫자 꼴) */
export const pctTxt = v => (fin(v) ? `${Number(Math.abs(v).toFixed(1)) === 0 ? '' : v > 0 ? '+' : '−'}${Math.abs(v).toFixed(1)}%` : '셀 수 없음');
const d1 = v => (fin(v) ? Number((v * 100).toFixed(1)) : null);
/** 막대 자리(셈만) — 같은 축 ax 에서 0 부터 v 까지 · {l(왼쪽 끝 %), w(너비 % · 아주 짧아도 0.6% 로 보이게)} · v 가 없으면 null(그리지 않음 · 지어내지 않음) */
export function barGeo(ax, v) { if (!fin(v) || !ax) return null; const a = posOf(ax, 0), z = posOf(ax, v); return {l: Math.min(a, z), w: Math.max(0.6, Math.abs(z - a))}; }

/**
 * 막대 그림 값(셈만 · 화면 없음) — C = 판 읽기 후보 묶음(lens.cand · 규칙 cand-rules-5)
 * 반환 {rows[], q, qp, ax, above, green, n} 또는 null(후보가 없거나 1년 추세 값이 없음 — 그리지 않음)
 *   row = {code, name, rank, status, sector, g, m12(오늘 1년 추세 %), m12p(20거래일 전 %)} · 순위 차례
 *   ax = 같은 축(0 · 오늘 기준선 · 20거래일 전 기준선 · 모든 값을 담음) · above = 그물 안 곳 수(flags 다섯째) · green = 그 가운데 기준 셋을 넘은 곳
 */
export function barsModel(C) {
  const G = C?.grow, M = G?.m, F = C?.flags ?? {}, xs = [...(C?.items ?? [])].sort((a, b) => a.rank - b.rank);
  if (!G || !M || !xs.length) return null;
  const rows = xs.map(x => { const c = String(x.code), m = M[c] ?? [];
    return {code: c, name: x.name ?? c, rank: x.rank, status: x.status ?? null, sector: x.sector ?? null, g: x.g != null ? String(x.g) : null, m12: d1(m[0]), m12p: d1(m[1])}; });
  const q = fin(G.qD) ? G.qD : fin(G.q) ? Number(G.q.toFixed(1)) : null, qp = fin(G.qp) ? Number(G.qp.toFixed(1)) : null;
  const ax = axisOf([0, q, qp, ...rows.flatMap(r => [r.m12, r.m12p])]);
  const codes = Object.keys(F), up = c => String(F[c] ?? '')[4] === '1' && fin(M[c]?.[0]);
  return {rows, q, qp, ax, n: rows.length, above: codes.filter(up).length, green: codes.filter(c => up(c) && String(F[c]).slice(0, 3) === '111').length};
}

/**
 * C = 판 읽기 후보 묶음(lens.cand) · sel = 처음 고른 후보 기호 · onPick(code) = 후보를 고름(아래 카드)
 * 반환 {el, model, setSel(code, user), bind(raBox), tour} 또는 null(값이 없음)
 */
export function candBars(C, {sel = null, onPick = () => {}} = {}) {
  const M = barsModel(C); if (!M) return null;
  const rows = M.rows, n = rows.length, P = v => `${posOf(M.ax, v).toFixed(2)}%`, day = C.asOf ? md(C.asOf) : '마지막 종가', dayC = C.asOf ? `${md(C.asOf)} 종가` : '마지막 종가'; // 날짜는 판의 종가 날(「오늘」 같은 말 대신 — 또렷함 1)
  let rm = mm('(prefers-reduced-motion: reduce)'), hero = Math.max(0, rows.findIndex(r => r.code === sel)), picked = false, anim = null, waveT = [], waveEnd = 0;
  const parts = rows.map((r, k) => {
    const bar = h('span', {class: 'bc-bar cb-bar'}), past = h('span', {class: 'cb-past'}), ref = h('span', {class: 'bc-ref cb-ref'}), zero = h('span', {class: 'bc-zero'});
    zero.style.setProperty('--l', P(0)); past.style.setProperty('--l', P(fin(r.m12p) ? r.m12p : 0)); if (!fin(r.m12p)) past.hidden = true;
    const val = h('b', {class: 'bc-val cb-val', 'data-at': String(k + 1)}); // 걸음 부품 = 값 글(막대는 늘 보임 — 「재생」 동안 그때 길이)
    const btn = h('button', {type: 'button', class: 'bc-row cb-row', 'data-code': r.code, 'data-rank': String(r.rank), 'aria-pressed': 'false',
      'aria-label': `검토 순위 ${r.rank}위 ${r.name} — 1년 추세 ${pctTxt(r.m12)} · 20거래일 전 ${pctTxt(r.m12p)}`, onclick: () => pickRow(k, true)},
      h('span', {class: 'bc-top'}, h('span', {class: 'bc-rk'}, `${r.rank}위`), h('span', {class: 'bc-name', 'data-ident': ''}, r.name), r.sector ? h('span', {class: 'cb-sec'}, r.sector) : null, val),
      h('span', {class: 'bc-track cb-track', 'aria-hidden': 'true'}, zero, bar, ref, past));
    return {r, btn, bar, past, ref, val};
  });
  const when = h('p', {class: 'cb-when', hidden: true});
  const stage = h('div', {class: 'cb-stage', role: 'group', 'aria-label': `후보 ${n}곳 막대 — 막대 = ${dayC} 1년 추세 · 점선 = 그물 기준선 ${pctTxt(M.q)} · 짧은 세로 줄 = 20거래일 전 · 금빛 테 = 고른 한 곳`}, ...parts.map(p => p.btn), when);
  const hud = h('div', {class: 'cb-hud', 'aria-live': 'polite'});
  const el = h('div', {class: 'cb', 'data-at': '0', 'data-nav': '3'}, hud, stage);

  /* ── 그리기(상태 → 막대 · 움직임 없음) ── */
  const side = v => (fin(v) ? (v > 0 ? 'up' : v < 0 ? 'down' : 'flat') : 'na');
  function setBar(p, v, line) { // v = 그릴 값(오늘 · 20거래일 전) · line = 점선 자리(오늘 기준선 · 그때 기준선)
    const g = barGeo(M.ax, fin(v) ? v : 0);
    p.bar.className = `bc-bar cb-bar ${fin(v) ? side(v) : 'bc-none'}`;
    p.bar.style.setProperty('--l', `${g.l.toFixed(2)}%`); p.bar.style.setProperty('--w', `${g.w.toFixed(2)}%`);
    p.ref.hidden = !fin(line); if (fin(line)) p.ref.style.setProperty('--l', P(line));
    p.val.textContent = pctTxt(v); p.val.className = `bc-val cb-val ${side(v)}`;
  }
  const nowAll = () => parts.forEach(p => { setBar(p, p.r.m12, M.q); p.btn.classList.remove('past'); });
  function paintSel() { parts.forEach((p, k) => { p.btn.classList.toggle('sel', k === hero); p.btn.setAttribute('aria-pressed', String(k === hero)); }); }
  function hudFill(pastV = false) { // pastV = 「재생」에서 고른 곳이 아직 오늘 값으로 오기 전(20거래일 전 값 — 그림과 이름표가 같은 때)
    const r = rows[hero]; if (!r) { hud.replaceChildren(); return; }
    const say = pastV ? '20거래일 전 1년 추세' : r.status === 'met' || r.status == null ? '1년 추세 · 그물에 막 들어옴' : r.status === 'wait' ? '1년 추세 · 그물 밖' : '1년 추세 · 재검토';
    hud.replaceChildren(h('p', {class: 'cb-h1'}, h('span', {class: 'cb-rk'}, `${r.rank}위`), ' ', h('span', {class: 'cb-nm', 'data-ident': ''}, r.name), ' ', h('b', {class: 'cb-big'}, pctTxt(pastV ? r.m12p : r.m12))),
      h('p', {class: 'cb-cap'}, say));
  }
  const pop = k => { if (rm || !parts[k]?.bar.animate) return; anim?.finish(); anim = parts[k].bar.animate([{opacity: 0.35}, {opacity: 1}], {duration: 600, easing: 'ease-out'}); };
  function pickRow(k, user, notify = true) { // 후보 고름 — 카드 · 금빛 · 위 이름표
    if (!rows[k]) return;
    const prev = hero; hero = k;
    if (user) { picked = true; el.classList.add('picked'); pop(k); }
    paintSel(); hudFill();
    if (user && notify && prev !== k) onPick(rows[k].code);
  }

  /* ── 재생 걸음(art.js 의 data-step) — 0 = 20거래일 전(모든 막대 그때 값 · 점선 그때 기준선) · 1~n = 한 걸음에 한 곳씩 오늘 값 · 그 뒤와 끝 = 오늘 ── */
  let wasDone = true;
  function onStep(box) {
    const done = box.classList.contains('ra-done'), i = Number(box.dataset.step), moving = box.classList.contains('ra-moving');
    if (!done && i === 0 && moving && wasDone) { const r = stage.getBoundingClientRect(); if (r.top < 60 || r.bottom > innerHeight - 70) stage.scrollIntoView({block: 'center', behavior: rm ? 'auto' : 'smooth'}); } // 「재생」은 그림 아래 — 막대를 화면 가운데로
    wasDone = done; calm();
    const pastUpTo = done || !(i >= 0) || i > n ? 0 : i === 0 ? n : n - i; // 아직 그때 값으로 둘 줄 수(뒤에서부터)
    if (!pastUpTo) { nowAll(); when.hidden = true; }
    else { parts.forEach((p, k) => { const isPast = k >= n - pastUpTo; setBar(p, isPast ? p.r.m12p : p.r.m12, isPast ? M.qp : M.q); p.btn.classList.toggle('past', isPast); });
      const below = rows.filter(r => fin(r.m12p) && fin(M.qp) && r.m12p < M.qp).length; when.hidden = false;
      when.textContent = i === 0 ? `20거래일 전 — 그때 기준선 ${pctTxt(M.qp)} 아래 ${below}곳` : `${day} 값 ${i}곳째 — ${rows[i - 1].name}`; }
    hudFill(!done && i >= 0 && i <= n && hero >= (i === 0 ? 0 : i)); // 고른 곳이 오늘 값으로 오기 전 걸음 = 20거래일 전 값
  }
  function bind(box) { if (!box || typeof MutationObserver !== 'function') return; new MutationObserver(() => onStep(box)).observe(box, {attributes: true, attributeFilter: ['class', 'data-step']}); }
  if (typeof matchMedia === 'function') matchMedia('(prefers-reduced-motion: reduce)').addEventListener?.('change', ev => { rm = ev.matches; if (rm) calm(); });
  function setSel(code, user = false) { const k = rows.findIndex(r => r.code === code); if (k >= 0) pickRow(k, user, false); } // 아래 줄 · 카드에서 고름 — 카드는 이미 바뀜(다시 알리지 않음)

  /* ── 저절로 설명(tour.js · 규칙 49 ④) — 사람이 고른 것이 아님(picked 아님 · 카드에 다시 알리지 않음) · 한 번에 하나 · 움직임 줄이기면 바로 끝 모습 ── */
  const idxOf = code => rows.findIndex(r => r.code === code);
  /** 다른 움직임이 시작할 때(그림 「재생」) · 걸음이 바뀔 때 — 하던 것을 바로 끝 모습으로 */
  function calm() { anim?.finish(); anim = null; waveT.forEach(clearTimeout); waveT = []; waveEnd = 0; parts.forEach(p => p.btn.classList.remove('wv')); }
  /** ① 고르기 — 그 줄 금빛 · 위 이름표 · 막대가 한 번 옅었다 돌아옴 */
  function tourTo(code) { const k = idxOf(code); if (k < 0) return false; calm(); hero = k; paintSel(); hudFill(); pop(k); return true; }
  /** ③ 가장 큰 근거 — 그 막대가 20거래일 전 길이에서 오늘 길이로(한 번) */
  function tourRise(code) {
    const k = idxOf(code); if (k < 0) return false;
    calm(); const p = parts[k]; setBar(p, p.r.m12, M.q); p.btn.classList.remove('past');
    if (rm || !p.bar.animate || !fin(p.r.m12p) || !fin(p.r.m12)) return true;
    const at = v => { const g = barGeo(M.ax, v); return {left: `${g.l.toFixed(2)}%`, width: `${g.w.toFixed(2)}%`}; };
    anim = p.bar.animate([at(p.r.m12p), at(p.r.m12p), at(p.r.m12)].map((f, j) => ({...f, offset: [0, 0.25, 1][j]})), {duration: 1100, easing: 'ease-out'});
    return true;
  }
  /** ④ 함께 움직이는 곳 — 같은 업종 회사(peers · 판 읽기 g 로 센 기호) 가운데 이 그림에 있는 후보 줄에 차례로 테(움직임 없이 바뀜) */
  function tourWave(code, peers = []) {
    const k = idxOf(code); if (k < 0) return false;
    calm(); const set = new Set(peers), js = parts.map((p, j) => (set.has(p.r.code) ? j : -1)).filter(j => j >= 0);
    if (rm) return true;
    js.forEach((j, t) => { waveT.push(setTimeout(() => parts[j].btn.classList.add('wv'), 110 * (t + 1)), setTimeout(() => parts[j].btn.classList.remove('wv'), 110 * (t + 1) + 1100)); });
    waveEnd = js.length ? performance.now() + 110 * js.length + 1100 : 0; return true;
  }
  const waving = () => waveEnd > performance.now(); // 테 차례(웹 움직임이 아님 — 검사기는 이것을 움직이는 것 하나로 셈 · 막대가 옅어지거나 자라는 것은 웹 움직임으로 따로 셈)
  const busy = () => waving() || !!(anim && anim.playState === 'running');

  // 처음 — 그날 종가 그대로 멈춘 그림(고른 것 아님 — 1위가 금빛)
  nowAll(); paintSel(); hudFill();
  el.__cb = {state: () => ({hero: rows[hero]?.code ?? null, busy: waving(), picked, past: parts.filter(p => p.btn.classList.contains('past')).map(p => p.r.code), rows: rows.map(r => r.code)}),
    rowOf: code => parts[idxOf(code)]?.btn ?? null};
  return {el, model: M, setSel, bind, tour: {to: tourTo, rise: tourRise, wave: tourWave, calm, busy, stage}};
}
