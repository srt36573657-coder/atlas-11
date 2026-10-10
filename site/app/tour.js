/* ATLAS 11 · 첫 화면 「후보 7」 저절로 둘러보기(화면) — 규칙 49 ④ · 걸음 글과 셈은 tour-model.js
   사장님 2026-10-10 05:14(마카오) 「4너에제안대로 해」 — 설계 보고 ④: 저절로 재생 · 읽는 동안 멈춤 · 「움직임 줄이기」 기기는 돌지 않음 · 끌 수 있음
   · 가만히 두면(막대 그림이 화면에 반 넘게 보이고 1.5초) 1위부터 8걸음씩 → 7곳 한 바퀴 → 처음(1위)으로 돌아와 멈춤(끝없이 돌지 않음 · 이 창에서 한 번)
   · 움직이는 것은 막대 그림 하나(고른 줄 금빛 · 막대가 20거래일 전 길이에서 오늘 길이로 · 같은 업종 후보 줄 테 — 2026-10-10 「3d 영구 삭제해」 · 「바둑판 영구 삭제해」 뒤로 섬 · 칸 그림 없음) — 글은 움직이지 않고 바로 바뀜 · 그림 「재생」이 돌면 기다림(한 번에 하나 · 규칙 28)
   · 읽는 동안 멈춤 — 화면을 만지거나 · 누르거나 · 굴리거나 · 글쇠를 누르면 멈춤(「이어 보기」로 다시) · 글 위 마우스 · 막대 그림과 글 칸이 모두 화면 밖 · 다른 탭 · 소리로 읽는 중이면 기다림
   · 「움직임 줄이기」: 저절로 시작하지 않음 · 단추로는 걸음만 바뀜(그림은 움직이지 않고 끝 모습) · 이 기기에서 끔: prefs 'tour' = 'off'(멈춘 뒤 줄 · 「자세히」 안)
   · 한국어 화면만(번역은 미룸 — 사장님 2026-10-09 03:14 「번역 작업 하지마」) · 화면 코드에 글자를 그리는 곳은 HTML 뿐(범위 띠 그림 SVG 에는 글자 없음)
   검사기용 표시: data-tour = play | pause | rest · data-tour-pos · data-tour-step · data-tour-code · data-tour-auto(저절로 시작했으면 1) · el.__tour.state() */
import {h, speak, stopSpeak, korDate} from './util.js';
import {state, prefs} from './store.js';
import {pv} from './lensparts.js';
import {TOUR_STEPS, KSS, tourOf, fanOf, speakOf, pctR} from './tour-model.js';

const TEST_SPEED = (() => { try { const v = Number(JSON.parse(localStorage.getItem('atlas11:speed') ?? '1')); return v >= 1 && v <= 10 ? v : 1; } catch { return 1; } })(); // 검사기만(art.js 와 같은 열쇠)
const mm = q => typeof matchMedia === 'function' && matchMedia(q).matches;
const NS = 'http://www.w3.org/2000/svg';
export const TOUR_KEY = 'tour'; // 이 기기에서 저절로 돌기(store.js prefs · 두 판이 함께)
export const tourOff = () => prefs.get(TOUR_KEY, 'on') === 'off';
const voiceOn = () => document.getElementById('voice-btn')?.getAttribute('aria-pressed') === 'true';

/** 글 조각 → 화면 조각({r: 비율} · {p: %} 는 빨강 · 파랑 숫자) */
const seg = parts => parts.map(p => (typeof p === 'string' ? p : 'r' in p ? pv(Number.isFinite(p.r) ? p.r * 100 : null) : 'p' in p ? pv(p.p) : ''));
/** 범위 띠 그림 — 옅은 띠 80% · 진한 띠 50% · 굵은 선 가운데 값 · 점선 대표 경로 3개 · 0% 선 · 눈금 글은 HTML */
function fanEl(F, asOf) {
  const g = fanOf(F);
  if (!g) return h('p', {class: 'tu-l'}, '범위 그림을 그릴 값이 모자람 — 지어내지 않음');
  const svg = document.createElementNS(NS, 'svg');
  for (const [k, v] of Object.entries({viewBox: `0 0 ${g.W} ${g.Hh}`, class: 'tu-svg', 'aria-hidden': 'true', preserveAspectRatio: 'none', focusable: 'false'})) svg.setAttribute(k, v);
  const add = (tag, attrs) => { const e = document.createElementNS(NS, tag); for (const [k, v] of Object.entries(attrs)) e.setAttribute(k, String(v)); svg.append(e); };
  add('polygon', {points: g.b80, class: 'tu-b80'}); add('polygon', {points: g.b50, class: 'tu-b50'});
  add('line', {x1: 0, x2: g.W, y1: g.zero, y2: g.zero, class: 'tu-zero'});
  for (const r of g.reps) add('polyline', {points: r.pts, class: 'tu-rep'});
  add('polyline', {points: g.mid, class: 'tu-mid'});
  const ticks = g.ticks.map(t => { const s = h('span', {class: `tu-y ${t.v > 0 ? 'up' : t.v < 0 ? 'down' : 'flat'}`}, pctR(t.v, 0)); s.style.setProperty('top', `${(t.y * 100).toFixed(2)}%`); return s; });
  return h('div', {class: 'tu-fan'}, h('div', {class: 'tu-plot'}, svg, ...ticks),
    h('p', {class: 'tu-x'}, h('span', null, `${asOf ? korDate(asOf) : '기준일'} 종가 = 0%`), h('span', null, `${F.H}거래일 뒤`)));
}
/** 소거 검사 열 개 — 표시 · 이름(값은 「자세히」) */
const checksEl = (cs, withValue = false) => h('ul', {class: 'tu-ck'}, ...cs.map(c => h('li', {class: `tu-ck-${c.verdict}`}, h('b', {class: 'tu-ck-m', 'aria-hidden': 'true'}, c.mark), ` ${c.label}`,
  h('span', {class: 'sr-only'}, ` ${c.verdict === 'pass' ? '통과' : c.verdict === 'hold' ? '보류' : c.verdict === 'out' ? '제외' : '판정 안 함'}`), withValue ? h('small', {class: 'tu-ck-v'}, ` — ${c.value}`) : null)));
const bodyOf = (s, asOf, withValue = false) => [h('p', {class: 'tu-t'}, s.title), ...s.lines.map(l => h('p', {class: 'tu-l'}, ...seg(l))),
  s.fan ? fanEl(s.fan, asOf) : null, s.checks?.length ? checksEl(s.checks, withValue) : null, s.note ? h('p', {class: 'tu-n'}, s.note) : null].filter(Boolean);

/**
 * 둘러보기 — C = lens.cand · lens = 판 읽기(mc · elim · stocks) · pic = candBars(…) 반환(tour 손잡이 — candbars.js) · show(code) = 카드 · 짧은 줄을 그 회사로(그림은 손대지 않음)
 *   hero = 지금 그림의 금빛 회사 · us = 미국 판 · 반환 {el, bind(raBox)} 또는 null(후보 없음 · 그림 없음)
 */
export function candTour({C, lens, pic, show, hero = null, us = false}) {
  const T = tourOf({C, mc: lens?.mc ?? null, elim: lens?.elim ?? null, stocks: lens?.stocks ?? [], us});
  if (!T || !pic?.tour) return null;
  const I = pic.tour, N = T.items.length, asOf = lens?.mc && !lens.mc.none ? lens.mc.asOf : C.asOf;
  let pos = 0, step = 0, mode = 'rest', timer = 0, autoT = 0, more = false, autoed = false, touched = false, vis = false, visText = false, shown = hero ?? T.items[0].code, speaking = 0, tall = 0, wide = 0;
  let rm = mm('(prefers-reduced-motion: reduce)');
  const holds = new Set();
  const kEl = h('span', {class: 'tu-k'}), who = h('span', {class: 'tu-who'});
  const dots = h('span', {class: 'tu-dots', 'aria-hidden': 'true'}, ...TOUR_STEPS.map(() => h('i')));
  const kss = h('p', {class: 'tu-kss', 'aria-hidden': 'true'}, ...KSS.map(([k, w]) => h('span', {'data-k': k}, `${k} · ${w}`)));
  const body = h('div', {class: 'tu-body', 'aria-live': 'polite'});
  const mainBtn = h('button', {type: 'button', class: 'tu-b tu-main', 'aria-pressed': 'false', onclick: () => (mode === 'play' ? pause() : play())}, '저절로 설명');
  const prevBtn = h('button', {type: 'button', class: 'tu-b tu-arw', 'aria-label': '이전 걸음', title: '이전 걸음', onclick: () => move(-1)}, '‹');
  const nextBtn = h('button', {type: 'button', class: 'tu-b tu-arw', 'aria-label': '다음 걸음', title: '다음 걸음', onclick: () => move(1)}, '›');
  const moreBtn = h('button', {type: 'button', class: 'tu-b', 'aria-expanded': 'false', onclick: () => toggleMore()}, '자세히');
  const homeBtn = h('button', {type: 'button', class: 'tu-b', 'aria-label': '처음부터 다시(1위 첫 걸음)', onclick: () => home()}, '처음');
  const offLine = h('p', {class: 'tu-off', hidden: true}), moreBox = h('div', {class: 'tu-more', hidden: true});
  const el = h('div', {class: 'tu', role: 'region', 'aria-label': `후보 ${N}곳 저절로 설명`, 'data-tour': 'rest', 'data-tour-auto': '0'},
    h('p', {class: 'tu-head'}, kEl, who, dots), kss, body, h('div', {class: 'tu-ctl', role: 'group', 'aria-label': '저절로 설명 조작'}, prevBtn, mainBtn, nextBtn, moreBtn, homeBtn), offLine, moreBox);
  const ac = typeof AbortController === 'function' ? new AbortController() : null, signal = ac?.signal;
  let io = null, mo = null, wasIn = false;
  const alive = () => { if (el.isConnected) { wasIn = true; return true; } if (wasIn) cleanup(); return false; }; // 화면에 붙기 전(만드는 중)에는 치우지 않음 · 붙었다 떨어지면(다른 화면) 다 치움
  function cleanup() { clearTimeout(timer); clearTimeout(autoT); clearInterval(speaking); timer = autoT = speaking = 0; ac?.abort(); io?.disconnect(); mo?.disconnect(); if (mode === 'play') { mode = 'rest'; } }

  /* ── 그리기 ── */
  function paint(act) {
    const it = T.items[pos], s = it.steps[step];
    el.dataset.tourPos = String(pos); el.dataset.tourStep = String(step); el.dataset.tourCode = it.code;
    kEl.textContent = `${s.k} · ${step + 1}/8 ${s.name}`; who.textContent = `${pos + 1}/${N}곳 · ${it.name}`;
    [...dots.children].forEach((d, i) => d.classList.toggle('on', i === step));
    [...kss.children].forEach(x => x.classList.toggle('on', x.dataset.k === s.k));
    body.replaceChildren(...bodyOf(s, asOf));
    keepTall();
    if (act) { // 막대 그림 — 회사가 바뀌면 그 줄 금빛(카드 · 줄도) · 같은 회사면 걸음 움직임 하나(막대 자람 · 같은 업종 테)
      const changed = shown !== it.code;
      if (changed || s.act === 'to') { I.to(it.code); show(it.code); shown = it.code; }
      if (!changed && s.act === 'rise') I.rise(it.code); else if (!changed && s.act === 'wave') I.wave(it.code, s.peers ?? []);
    }
    if (more) fillMore();
  }
  /** 글 칸 높이는 커지기만(걸음마다 아래 카드 · 줄이 들썩이지 않게) — 폭이 바뀌면(글씨 · 화면 돌림) 다시 잼 */
  function keepTall() {
    if (!el.isConnected) return;
    const w = body.clientWidth; if (w !== wide) { wide = w; tall = 0; body.style.removeProperty('min-height'); }
    const hh = body.offsetHeight; if (hh > tall) { tall = hh; body.style.setProperty('min-height', `${tall}px`); }
  }
  function fillMore() {
    const it = T.items[pos];
    moreBox.replaceChildren(h('p', {class: 'tu-t'}, `${it.rank}위 · ${it.name} — 8걸음 한 번에`),
      ...it.steps.map((s, i) => h('div', {class: 'tu-mi'}, h('p', {class: 'tu-mk'}, `${s.k} · ${i + 1} ${s.name}`), ...bodyOf(s, asOf, true))), offOf(true));
  }
  function offOf(inMore = false) { // 저절로 돌기 — 이 기기에서 끔 · 다시 켬(두 판 함께)
    const off = tourOff();
    return h('p', {class: inMore ? 'tu-off tu-off-in' : 'tu-off'}, h('span', null, off ? '저절로 설명: 꺼짐(이 기기)' : '저절로 설명: 켬'), ' ',
      h('button', {type: 'button', class: 'tu-b tu-sw', 'aria-pressed': String(off), onclick: () => { prefs.set(TOUR_KEY, off ? 'on' : 'off'); if (!off && mode === 'play') pause(); setMode(mode); if (more) fillMore(); }}, off ? '다시 켜기' : '이 기기에서 끄기'));
  }
  function setMode(m) {
    mode = m; el.dataset.tour = m;
    mainBtn.textContent = m === 'play' ? '멈춤' : m === 'pause' ? '이어 보기' : '저절로 설명'; // 단추 이름은 「둘러보기」가 아님 — 쉬운 말 화면 아래 탭 「탐색」이 「둘러보기」라 겹침 mainBtn.setAttribute('aria-pressed', String(m === 'play'));
    body.setAttribute('aria-live', m === 'play' ? 'off' : 'polite'); // 저절로 바뀌는 동안은 화면 읽기가 걸음마다 끼어들지 않게(멈추면 다시 읽음)
    const showOff = m !== 'play' && !rm && (autoed || tourOff());
    offLine.hidden = !showOff; if (showOff) offLine.replaceChildren(...offOf().childNodes);
  }

  /* ── 걸음 넘기기 ── */
  function schedule(ms = null) {
    clearTimeout(timer); timer = 0;
    if (mode !== 'play' || holds.size) return;
    timer = setTimeout(advance, (ms ?? T.items[pos].steps[step].ms) / TEST_SPEED);
  }
  function advance() {
    timer = 0; if (!alive() || mode !== 'play' || holds.size) return;
    if (step < 7) step++; else if (pos < N - 1) { pos++; step = 0; } else { finish(); return; }
    paint(true); talk(); schedule();
  }
  function finish() { pos = 0; step = 0; setMode('rest'); paint(true); } // 한 바퀴 끝 — 처음(1위)으로 돌아와 멈춤
  function talk() { // 소리로 듣기를 켰으면 걸음 글을 읽고 다 읽은 뒤 넘김(설계 보고 ④ 「다 읽어야 다음 단계로」)
    if (!voiceOn() || typeof speechSynthesis === 'undefined') return;
    speak(speakOf(T.items[pos].steps[step])); hold('speech'); clearInterval(speaking);
    speaking = setInterval(() => { if (!alive()) return; if (!speechSynthesis.speaking) { clearInterval(speaking); speaking = 0; holds.delete('speech'); if (!holds.size) schedule(600); } }, 300);
  }
  function hold(why) { if (holds.has(why)) return; holds.add(why); clearTimeout(timer); timer = 0; }
  function unhold(why) { if (!holds.delete(why)) return; if (!holds.size && mode === 'play') schedule(); }
  function play(intro = false) { // intro = 처음 저절로 시작할 때 한 번 — 7곳이 하나씩 기준선을 넘는 모습(⓪) 뒤 첫 걸음(2026-10-10 다섯 팀 「오와!」)
    if (!alive()) return;
    setMode('play'); state.tourSeen = true;
    if (intro && I.cross) { paint(false); hold('intro'); I.cross(() => { holds.delete('intro'); if (!alive() || mode !== 'play') return; if (holds.size) { paint(false); return; } paint(true); talk(); schedule(); }, TEST_SPEED); return; } // 다른 까닭으로 기다리는 중(재생 · 읽는 중 · 화면 밖)이면 그림은 그대로 두고 기다림이 풀린 뒤 넘김
    paint(true); talk(); schedule();
  }
  function pause() { clearTimeout(timer); timer = 0; if (speaking) { clearInterval(speaking); speaking = 0; holds.delete('speech'); stopSpeak(); } if (mode === 'play') setMode('pause'); }
  function move(d) {
    if (mode === 'play') pause();
    if (d > 0) { if (step < 7) step++; else if (pos < N - 1) { pos++; step = 0; } else { pos = 0; step = 0; } }
    else if (step > 0) step--; else if (pos > 0) { pos--; step = 7; }
    paint(true); talk();
  }
  function home() { pos = 0; step = 0; if (rm) { if (mode === 'play') pause(); paint(true); return; } play(); }
  function toggleMore() {
    more = !more; moreBox.hidden = !more; moreBtn.setAttribute('aria-expanded', String(more));
    if (more) { if (mode === 'play') pause(); fillMore(); } else moreBox.replaceChildren();
  }

  /* ── 저절로 시작 · 기다림 · 멈춤 ── */
  const canAuto = () => !rm && !tourOff() && !state.tourSeen && !touched && mode === 'rest';
  function armAuto() { // 막대 그림이 반 넘게 보인 뒤 1.5초 — 그 사이 손을 대면 시작하지 않음
    clearTimeout(autoT); autoT = 0;
    if (!canAuto() || !vis) return;
    autoT = setTimeout(() => { autoT = 0; if (!alive() || !canAuto() || !vis || holds.has('art')) return; autoed = true; el.dataset.tourAuto = '1'; pos = 0; step = 0; play(true); }, 1500 / TEST_SPEED);
  }
  const userAct = e => { // 사람이 화면에 손댐 = 읽는 중 · 고르는 중 — 멈춤(다시 저절로 이어 가지 않음)
    if (!alive()) return;
    if (e.target instanceof Element && el.contains(e.target) && e.target.closest('button, a, summary')) return; // 둘러보기 단추는 단추가 맡음
    if (e.type === 'keydown' && ['Shift', 'Control', 'Alt', 'Meta'].includes(e.key)) return;
    touched = true; clearTimeout(autoT); autoT = 0;
    if (mode === 'play') pause();
  };
  for (const t of ['pointerdown', 'wheel', 'keydown']) document.addEventListener(t, userAct, {capture: true, passive: true, signal});
  document.addEventListener('visibilitychange', () => { if (!alive()) return; if (document.hidden) hold('hidden'); else unhold('hidden'); }, {signal});
  body.addEventListener('pointerenter', e => { if (e.pointerType === 'mouse') hold('hover'); }, {signal}); // 글 위에 마우스 = 읽는 중(단추 위는 아님 — 「이어 보기」를 누른 마우스가 그대로 있어도 넘어감)
  body.addEventListener('pointerleave', e => { if (e.pointerType === 'mouse') unhold('hover'); }, {signal});
  if (typeof matchMedia === 'function') matchMedia('(prefers-reduced-motion: reduce)').addEventListener?.('change', ev => { rm = ev.matches; if (rm) { clearTimeout(autoT); autoT = 0; } setMode(mode); }, {signal});
  if (typeof IntersectionObserver === 'function') { // 저절로 시작 = 막대 그림이 반 넘게 보일 때 · 걸음 넘김은 그림이나 글 칸 가운데 하나가 보이는 동안(둘 다 화면 밖이면 기다림)
    io = new IntersectionObserver(es => {
      if (!alive()) return;
      for (const x of es) { if (x.target === I.stage) vis = x.intersectionRatio >= 0.5; else visText = x.intersectionRatio >= 0.25; }
      if (vis || visText) unhold('view'); else hold('view');
      if (vis) armAuto(); else { clearTimeout(autoT); autoT = 0; }
    }, {threshold: [0, 0.25, 0.5, 1]});
    io.observe(I.stage); io.observe(el);
  }
  /** 그림 칸(.ra) — 「재생」 · 차례 단추로 끝 모습이 아니면 기다림(막대 그림은 그림 걸음이 맡음 · 하던 움직임은 끝 모습으로) */
  function bind(box) {
    if (!box || typeof MutationObserver !== 'function') return;
    const check = () => { if (!alive()) return; if (box.classList.contains('ra-done')) unhold('art'); else if (!holds.has('art')) { hold('art'); clearTimeout(autoT); autoT = 0; I.calm(); } else hold('art'); };
    mo = new MutationObserver(check); mo.observe(box, {attributes: true, attributeFilter: ['class']}); check();
  }
  if (document.hidden) holds.add('hidden');
  setMode('rest'); paint(false);
  el.__tour = {state: () => ({mode, pos, step, code: T.items[pos].code, holds: [...holds], auto: autoed, rm, off: tourOff(), n: N}), play, pause, move, steps: () => T.items.map(x => x.steps.map(s => s.ms))};
  return {el, bind};
}
