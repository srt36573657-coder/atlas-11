/* ATLAS 11 · 「후보 7」 칸 그림 — 첫 화면(#/) ② 그림 칸 · 옛 섬(island.js · 입체 탑 · 2026-10-09 17:36)을 바꿈
   사장님 2026-10-10 09:51 · 09:53(마카오) 「3d 영구 삭제해」 · 「모두다」 — 입체 없이 같은 사실을 평평하게:
   · 칸 하나 = 회사 하나(판 읽기 365곳) · 왼쪽 위부터 1년 추세가 큰 차례 · 굵은 선 = 그물 기준선 · 선 위 = 그물 안(1년 추세 상위 20%)
   · 초록 칸 = 그물 안이면서 기준(그날 종가 · 흑자 · 위험 공시 없음)을 넘은 곳 · 옅은 칸 = 그물 밖 · 빗금 = 1년 추세를 셀 수 없음
   · 번호 칸 = 막 들어온 후보 7곳(옥빛) · 금빛 칸 + 위 이름표 = 고른 한 곳(하나만 빛남)
   · 가만히 두면 멈춘 그림(규칙 42) · 칸을 누르면 위 이름표 자리에 그 회사(「회사 보기 ›」 — 칸 위에 글을 얹지 않음) + 그림 아래 업종 칸(「업종 보기 ›」 · 같은 업종 회사 — 3단 클릭 · 규칙 47) · 닫으면 고른 한 곳으로 돌아옴
   · 「재생」 걸음(art.js data-step): 0 = 20거래일 전(7곳은 그물 밖 — 빈 칸) → 1~7 한 걸음에 한 곳씩 채움 → 카드 위험 줄 → 카드 단추(움직이는 것은 걸음 부품 하나)
   · 저절로 설명(tour.js · 규칙 49 ④) 손잡이: to(고름) · rise(빈 칸 → 채움 · 한 칸) · wave(같은 업종 칸에 차례로 테 — 움직임 없이 바뀜) · calm · busy · stage
   · 그림 속 글자는 모두 HTML · 칸은 CSS 칸(캔버스 · 그림자 · 입체 없음 — 빠짐없이 도는 검사의 입체 없음 층이 봄) · 움직임 줄이기면 바로 끝 모습 */
import {h} from './util.js';
import {tilesModel, pctTxt, placeTxt, tapInfo, zoneOf} from './tiles-model.js';

const mm = q => typeof matchMedia === 'function' && matchMedia(q).matches;

/**
 * C = 판 읽기 후보 묶음(lens.cand) · stocks = 판 읽기 종목(lens.stocks) · sel = 처음 고른 후보 기호 · onPick(code) = 후보를 고름(아래 카드)
 * 반환 {el, model, setSel(code, user), bind(raBox), tour} 또는 null(값이 없음 — 그리지 않음)
 */
export function candTiles(C, stocks, {sel = null, onPick = () => {}} = {}) {
  const M = tilesModel(C, stocks); if (!M) return null;
  const cells = M.cells, n = cells.length, seven = M.seven, isSeven = new Set(seven), q = C.grow?.qD;
  let rm = mm('(prefers-reduced-motion: reduce)'), heroI = seven.find(i => cells[i].code === sel) ?? seven[0] ?? -1, focus = -1, zoneKey = null, picked = false;
  let anim = null, waveT = [], waveEnd = 0;
  const els = new Array(n);
  const mk = i => { const c = cells[i], k = seven.indexOf(i);
    if (k >= 0) return h('button', {type: 'button', class: 'tl-c tl-seven', 'data-i': String(i), 'data-at': String(k + 1), 'data-code': c.code, 'data-rank': String(c.rank),
      'aria-label': `검토 순위 ${c.rank}위 ${c.name} — 1년 추세 ${pctTxt(c.m12)}`, onclick: e => { e.stopPropagation(); pickCand(i, true); }}); // 번호는 CSS(::before · data-rank) — 글자로 넣으면 단위 없는 숫자로 읽힘
    return h('span', {class: `tl-c ${c.up ? (c.elig ? 'tl-net' : 'tl-up') : c.m12 == null ? 'tl-na' : 'tl-out'}`, 'data-i': String(i), 'aria-hidden': 'true'}); };
  const grids = [0, 1, 2].map(b => h('div', {class: `tl-grid tl-b${b}`}));
  for (const i of M.order) { els[i] = mk(i); grids[cells[i].blk].append(els[i]); }
  const line = h('p', {class: 'tl-line'}, h('span', {class: 'tl-line-t'}, `그물 기준선 · 1년 추세 ${pctTxt(q)}`)); // 굵은 선(::after) — 선 위 = 그물 안
  const cap2 = M.none ? h('p', {class: 'tl-cap2'}, `1년 추세를 셀 수 없음 ${M.none}곳`) : null;
  const when = h('p', {class: 'tl-when', hidden: true});
  const stage = h('div', {class: 'tl-stage', role: 'group', 'aria-label': `${n}곳 칸 그림 · 칸 하나 = 회사 하나 · 왼쪽 위부터 1년 추세가 큰 차례 · 굵은 선 위 ${M.above}곳 = 그물 안(1년 추세 상위 ${C.netPct ?? 20}%) · 번호 칸 ${seven.length}개 = 막 들어온 후보 · 금빛 = 고른 한 곳`},
    grids[0], line, grids[1], ...(cap2 ? [cap2, grids[2]] : []), when);
  const hud = h('div', {class: 'tl-hud', 'aria-live': 'polite'});
  const zone = h('div', {class: 'tl-zone', hidden: true, 'aria-live': 'polite'}); // 3단 클릭 ② — 누른 칸의 업종: 업종 보기 › · 같은 업종 회사 이름(누르면 회사 화면)
  const el = h('div', {class: 'tl', 'data-at': '0', 'data-nav': '3'}, hud, stage, zone);

  /* ── 그리기(상태 → 칸 표시 · 움직임 없음) ── */
  function paintSel() {
    seven.forEach(i => { const on = i === heroI; els[i].classList.toggle('sel', on); els[i].setAttribute('aria-pressed', String(on)); });
  }
  function hudFill(past = false) { // past = 「재생」에서 고른 곳이 아직 채워지기 전(20거래일 전 값 — 그림과 이름표가 같은 때를 말함)
    if (focus >= 0) { const f = cells[focus]; hud.classList.add('tap'); // 누른 칸 — 같은 자리 · 같은 두 줄(그림이 밀리지 않게) · 먹빛(금빛은 고른 한 곳만)
      hud.replaceChildren(h('p', {class: 'tl-h1'}, h('span', {class: 'tl-tk'}, '누른 칸'), ' ', h('span', {class: 'tl-nm', 'data-ident': ''}, f.name), ' ', h('b', {class: 'tl-big'}, pctTxt(f.m12))),
        h('p', {class: 'tl-cap tl-tag'}, `${placeTxt(f)} · `, h('a', {href: `#/stock/${f.code}`}, '회사 보기 ›'))); return; }
    hud.classList.remove('tap');
    const c = cells[heroI]; if (!c) { hud.replaceChildren(); return; }
    const say = past ? '20거래일 전 1년 추세 · 그물 밖' : c.status === 'met' || c.status == null ? '1년 추세 · 그물에 막 들어옴' : c.status === 'wait' ? '1년 추세 · 그물 밖' : '1년 추세 · 재검토';
    hud.replaceChildren(h('p', {class: 'tl-h1'}, h('span', {class: 'tl-rk'}, `${c.rank}위`), ' ', h('span', {class: 'tl-nm', 'data-ident': ''}, c.name), ' ', h('b', {class: 'tl-big'}, pctTxt(past ? c.m12p : c.m12))),
      h('p', {class: 'tl-cap'}, say));
  }
  function zoneFill(i) { // 3단 클릭 ② — 누른 칸의 업종(업종 보기 › · 같은 업종 회사 이름 → 회사 화면) · i < 0 = 닫음
    const info = i >= 0 ? tapInfo(cells, {z: zoneOf(cells[i]), i}) : null;
    for (const e of stage.querySelectorAll('.tl-c.zn')) e.classList.remove('zn');
    zoneKey = info ? zoneOf(cells[i]) : null;
    if (!info) { zone.hidden = true; zone.replaceChildren(); return; }
    for (const x of info.zone.cos) { const j = cells.findIndex(c => c.code === x.code); if (j >= 0 && j !== i) els[j].classList.add('zn'); }
    zone.replaceChildren(h('p', {class: 'tl-zh'}, h('b', null, info.zone.label ?? '업종 없음'), ` · ${info.zone.cos.length}곳 · `, info.zone.href ? h('a', {href: info.zone.href}, '업종 보기 ›') : '업종 화면 없음'),
      h('p', {class: 'tl-cos'}, ...info.zone.cos.map(x => h('a', {class: 'tl-co', href: x.href, 'aria-current': x.on ? 'true' : null, 'data-ident': ''}, x.name))));
    zone.hidden = false;
  }
  const pop = i => { if (rm || !els[i]?.animate) return; anim?.finish(); anim = els[i].animate([{transform: 'scale(1)'}, {transform: 'scale(1.45)'}, {transform: 'scale(1)'}], {duration: 420, easing: 'ease-out'}); };
  function pickCand(i, user, notify = true) { // 후보 고름 — 카드 · 금빛 · 위 이름표
    if (!isSeven.has(i)) return;
    const prev = heroI; heroI = i;
    if (focus >= 0) els[focus].classList.remove('on'); focus = -1; zoneFill(-1);
    if (user) { picked = true; el.classList.add('picked'); pop(i); }
    paintSel(); hudFill();
    if (user && notify && prev !== i) onPick(cells[i].code);
  }
  function pickAny(i) { // 후보가 아닌 칸 — 위 이름표 자리에 그 회사(회사 보기 ›) · 그림 아래 업종 칸(카드는 후보만) · −1 = 닫음(고른 한 곳으로)
    if (focus >= 0) els[focus].classList.remove('on');
    if (i < 0) { focus = -1; zoneFill(-1); hudFill(); return; }
    if (isSeven.has(i)) { pickCand(i, true); return; }
    focus = i; els[i].classList.add('on'); zoneFill(i); hudFill();
  }
  /** 누른 점의 칸 — 칸 위면 그 칸 · 칸 사이 틈이면 가장 가까운 칸(칸 반 크기 안) · 아니면 −1 */
  function cellAt(target, x, y) {
    const t = target?.closest?.('.tl-c'); if (t && stage.contains(t)) return Number(t.dataset.i);
    const g = target?.closest?.('.tl-grid'); if (!g) return -1;
    let best = -1, bd = Infinity;
    for (const e of g.children) { const r = e.getBoundingClientRect(), d = Math.hypot(x - (r.left + r.width / 2), y - (r.top + r.height / 2)); if (d < bd) { bd = d; best = Number(e.dataset.i); } }
    const r0 = g.firstElementChild?.getBoundingClientRect(); return r0 && bd <= r0.width ? best : -1;
  }
  stage.addEventListener('click', e => { if (e.target.closest?.('.tl-seven')) return; const i = cellAt(e.target, e.clientX, e.clientY); pickAny(i === focus ? -1 : i); });

  /* ── 재생 걸음(art.js 의 data-step) — 0 = 20거래일 전(7곳 빈 칸) · 1~7 = 한 걸음에 한 곳씩 채움(움직임은 걸음 부품 .now 하나 — art.js) · 그 뒤와 끝 = 그날 ── */
  let wasDone = true;
  const setPast = (on, upTo = -1) => seven.forEach((j, k) => els[j].classList.toggle('past', on && k >= upTo));
  function onStep(box) {
    const done = box.classList.contains('ra-done'), i = Number(box.dataset.step), moving = box.classList.contains('ra-moving');
    if (!done && i === 0 && moving && wasDone) { const r = stage.getBoundingClientRect(); if (r.top < 60 || r.bottom > innerHeight - 70) stage.scrollIntoView({block: 'center', behavior: rm ? 'auto' : 'smooth'}); } // 「재생」은 그림 아래 — 칸 그림을 화면 가운데로
    wasDone = done; calm(); if (focus >= 0 && !done) { els[focus].classList.remove('on'); focus = -1; zoneFill(-1); } // 「재생」 동안은 누른 칸을 닫음(그림과 이름표가 같은 때)
    if (done || !(i >= 0)) { setPast(false); when.hidden = true; }
    else if (i === 0) { setPast(true, 0); when.hidden = false; when.textContent = `20거래일 전 — ${seven.length}곳은 그물 밖(빈 칸)`; }
    else if (i <= seven.length) { setPast(true, i); const j = seven[i - 1]; when.hidden = false; when.textContent = `그물에 ${i}곳째 — ${cells[j].name}`; }
    else { setPast(false); when.hidden = true; }
    hudFill(!done && i >= 0 && i < seven.indexOf(heroI) + 1); // 고른 곳이 채워지기 전 걸음 = 20거래일 전 값 · 채운 뒤 = 그날 값
  }
  function bind(box) { if (!box || typeof MutationObserver !== 'function') return; new MutationObserver(() => onStep(box)).observe(box, {attributes: true, attributeFilter: ['class', 'data-step']}); }
  if (typeof matchMedia === 'function') matchMedia('(prefers-reduced-motion: reduce)').addEventListener?.('change', ev => { rm = ev.matches; if (rm) calm(); });
  function setSel(code, user = false) { const i = cells.findIndex(c => c.code === code); if (i >= 0 && isSeven.has(i)) pickCand(i, user, false); } // 아래 줄 · 카드에서 고름 — 카드는 이미 바뀜(다시 알리지 않음)

  /* ── 저절로 설명(tour.js · 규칙 49 ④ · 2026-10-10 「4너에제안대로 해」) — 사람이 고른 것이 아님(picked 아님 · 카드에 다시 알리지 않음) · 한 번에 하나 · 움직임 줄이기면 바로 끝 모습 ── */
  const idxOf = code => cells.findIndex(c => c.code === code);
  /** 다른 움직임이 시작할 때(그림 「재생」) · 걸음이 바뀔 때 — 하던 것을 바로 끝 모습으로 */
  function calm() { anim?.finish(); anim = null; waveT.forEach(clearTimeout); waveT = []; waveEnd = 0; for (const e of stage.querySelectorAll('.tl-c.wv')) e.classList.remove('wv'); }
  /** ① 고르기 — 그 칸 금빛 · 위 이름표 · 칸이 한 번 커졌다 돌아옴 */
  function tourTo(code) {
    const i = idxOf(code); if (!isSeven.has(i)) return false;
    calm(); heroI = i; if (focus >= 0) els[focus].classList.remove('on'); focus = -1; zoneFill(-1);
    paintSel(); hudFill(); pop(i); return true;
  }
  /** ③ 가장 큰 근거 — 그 칸이 빈 칸(20거래일 전 그물 밖)에서 채워짐(지금 그물 안) */
  function tourRise(code) {
    const i = idxOf(code); if (i < 0) return false;
    calm(); els[i].classList.remove('past');
    if (rm || !els[i].animate) return true;
    const to = getComputedStyle(els[i]).backgroundColor;
    anim = els[i].animate([{backgroundColor: 'rgba(0, 0, 0, 0)'}, {backgroundColor: 'rgba(0, 0, 0, 0)', offset: 0.35}, {backgroundColor: to}], {duration: 1100, easing: 'ease-out'});
    return true;
  }
  /** ④ 함께 움직이는 곳 — 같은 업종 회사(peers · 판 읽기 g 로 센 기호) 칸에 그림 차례(왼쪽 위부터)로 테가 켜졌다 꺼짐(움직임 없이 바뀜) */
  const posOf = new Map(M.order.map((i, k) => [i, k]));
  function tourWave(code, peers = []) {
    const i = idxOf(code); if (i < 0) return false;
    calm(); const set = new Set(peers), js = cells.filter(c => set.has(c.code)).map(c => c.i).sort((a, b) => posOf.get(a) - posOf.get(b));
    if (rm) return true;
    js.forEach((j, k) => { waveT.push(setTimeout(() => els[j].classList.add('wv'), 110 * (k + 1)), setTimeout(() => els[j].classList.remove('wv'), 110 * (k + 1) + 1100)); });
    waveEnd = js.length ? performance.now() + 110 * js.length + 1100 : 0; return true;
  }
  const waving = () => waveEnd > performance.now(); // 테 차례(웹 움직임이 아님 — 검사기는 이것을 움직이는 것 하나로 셈 · 칸이 커지거나 채워지는 것은 웹 움직임으로 따로 셈)
  const busy = () => waving() || !!(anim && anim.playState === 'running');

  // 처음 — 그날 종가 그대로 멈춘 그림(고른 것 아님 — 1위가 금빛)
  paintSel(); hudFill();
  el.__tl = {state: () => ({hero: heroI >= 0 ? cells[heroI].code : null, focus: focus >= 0 ? cells[focus].code : null, zone: zoneKey, busy: waving(), picked,
    past: seven.filter(i => els[i].classList.contains('past')).map(i => cells[i].code), seven: seven.map(i => cells[i].code)}),
    cellOf: code => els[idxOf(code)] ?? null, codeAt: i => cells[i]?.code ?? null, order: () => M.order.map(i => cells[i].code)};
  return {el, model: M, setSel, bind, tour: {to: tourTo, rise: tourRise, wave: tourWave, calm, busy, stage}};
}
