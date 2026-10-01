/* ATLAS 11 · 3차 첫 화면 「내일」 (2026-10-02 01:34 사장님 승인 3차 디자인 · 「aaa7377에 연결해봐」)
   한 물건: 52종목 원 하나. 12시 방향부터 시계 방향으로 ① 분명히 오를 쪽 ② 오를 쪽이지만 거의 반반 ③ 내릴 쪽이지만 거의 반반 ④ 분명히 내릴 쪽.
   오를 쪽 빨강(#ff3b30) · 내릴 쪽 파랑(#0a84ff) · 거의 반반(day1.closeCall || day1.statisticalTie)은 속이 빈 원.
   이야기 다섯 장면(글상자 = 소리 = 같은 말) — 새 발행본(forecastId)마다 한 번만 돈다 · 「다시 보기」로 다시 · 움직임 줄이기 설정이면 바로 끝 장면.
   근거: 애플 HIG Motion — 목적이 있을 때만 움직이고, 움직임만으로 뜻을 전하지 않으며(글·소리로도), 사람이 끊을 수 있게, 자주 하는 조작에는 넣지 않는다.
   「내일 하루만」(2026-10-02 00:08 사장님 명령): 전망은 내일(manifest.futureDates[0]) 하나만 · 전망 요소마다 data-forecast-date. */
import {h, won, pct, prob, korDate, weekday, finite, speak, speakScreen, stopSpeak, reducedMotion} from './util.js';
import {state, loadCards, loadScores, prefs} from './store.js';

const NS = 'http://www.w3.org/2000/svg';
const sleep = ms => new Promise(r => setTimeout(r, ms));
const longDate = d => d ? `${Number(d.slice(5, 7))}월 ${Number(d.slice(8, 10))}일 ${weekday(d)}요일` : '';
const seenMemory = new Set();
/** 소리 상태(앱 전체 한 벌) — app.js 의 🔊 단추가 바꾼다 */
export const voice = {on: false};
const story = {run: 0, playing: false, caption: '', onVoice: null, spoken: Promise.resolve(false)};
export function stopStory() { story.run++; story.playing = false; story.onVoice = null; }
/** 🔊 를 켰을 때: 이야기 중이면 지금 글상자를 읽고(다음 장면부터는 장면이 소리를 기다림), 끝났으면 화면 글자를 읽는다 */
export function voiceTurnedOn() { if (story.onVoice) { story.onVoice(); return true; } return false; }

const seen = id => { if (seenMemory.has(id)) return true; return prefs.get('storySeen', null) === id; };
const markSeen = id => { seenMemory.add(id); prefs.set('storySeen', id); };

/** 말하고 끝날 때까지 기다림(소리가 꺼져 있으면 바로) — 끝 신호가 오지 않는 기기를 위해 글 길이만큼 기다리면 넘어간다 */
function say(text) {
  if (!voice.on) return Promise.resolve(false);
  return new Promise(done => {
    let over = false; const end = () => { if (!over) { over = true; done(true); } };
    if (!speak(text, {onend: end})) return end();
    setTimeout(end, 2500 + text.length * 260);
  });
}

export async function renderTomorrow(main, {manifest}) {
  const [cardsDoc, scores] = await Promise.all([loadCards(), loadScores().catch(() => null)]);
  const tomorrow = manifest.futureDates?.[0];
  const rows = (cardsDoc.cards ?? []).filter(c => c.day1).map(c => {
    const d1 = c.day1, sel = d1.selected === 'up' || d1.selected === 'down' ? d1.selected : (finite(d1.return) && d1.return < 0 ? 'down' : 'up');
    return {code: c.code, name: c.name, sel, close: Boolean(d1.closeCall || d1.statisticalTie || (d1.selected !== 'up' && d1.selected !== 'down')), p: d1.probabilities?.[sel], p50: d1.p50, ret: d1.return, date: d1.date ?? tomorrow};
  });
  const total = rows.length;
  const key = r => (r.sel === 'up' ? (r.close ? 1 : 0) : (r.close ? 2 : 3));
  const order = [...rows].sort((a, b) => key(a) - key(b) || (b.ret ?? 0) - (a.ret ?? 0));
  const upRows = rows.filter(r => r.sel === 'up').sort((a, b) => (b.ret ?? 0) - (a.ret ?? 0));
  const downRows = rows.filter(r => r.sel === 'down').sort((a, b) => (a.ret ?? 0) - (b.ret ?? 0));
  const halves = rows.filter(r => r.close).length;
  const T = [
    `ATLAS가 보는 ${total}종목입니다.`,
    `이 중 ${upRows.length}종목이 내일 오를 쪽입니다.`,
    `나머지 ${downRows.length}종목은 내릴 쪽입니다.`,
    `속이 빈 ${halves}개는 오를 확률과 내릴 확률이 거의 같습니다.`,
    `그래서 내일은 ${total}종목 중 ${upRows.length}종목이 오를 쪽입니다.`,
  ];
  state.summary = T[4];

  // ── 머리: 큰 제목 「내일」 + 내일 날짜 ──
  const head = h('header', {class: 't-head'},
    h('h1', {class: 't-title', 'data-clarity': 'dated'}, '내일'),
    h('p', {class: 't-when', 'data-clarity': 'date-anchor', 'data-forecast-date': tomorrow}, longDate(tomorrow)));

  // ── 둥근 판: 12시 방향부터 시계 방향 ──
  const svg = document.createElementNS(NS, 'svg'); svg.setAttribute('viewBox', '0 0 300 300'); svg.setAttribute('class', 't-ring'); svg.setAttribute('aria-hidden', 'true');
  const R = 132, C = 150, dots = [];
  order.forEach((r, i) => {
    const a = -Math.PI / 2 + i / order.length * Math.PI * 2, c = document.createElementNS(NS, 'circle');
    c.setAttribute('cx', (C + R * Math.cos(a)).toFixed(2)); c.setAttribute('cy', (C + R * Math.sin(a)).toFixed(2)); c.setAttribute('r', '7');
    c.setAttribute('class', `t-dot ${r.sel}${r.close ? ' half' : ''}`); c.setAttribute('data-forecast-date', r.date); c.setAttribute('data-code', r.code);
    const t = document.createElementNS(NS, 'title'); t.textContent = `${r.name} · ${r.close ? '거의 반반' : r.sel === 'up' ? '오를 쪽' : '내릴 쪽'}`; c.append(t);
    svg.append(c); dots.push({el: c, r});
  });
  const numN = h('span', {class: 't-n'}, ''), numU = h('span', {class: 't-u'}, '');
  const num = h('div', {class: 't-num', 'data-forecast-date': tomorrow}, numN, numU), of = h('div', {class: 't-of'}, '');
  const dial = h('div', {class: 't-dial', role: 'img', 'aria-label': `${total}종목: 오를 쪽 ${upRows.length}종목, 내릴 쪽 ${downRows.length}종목, 그중 거의 반반 ${halves}개`}, svg, h('div', {class: 't-center'}, num, of));
  const cap = h('span', {class: 't-cap-text'}, '');
  const capBox = h('div', {class: 't-cap', 'aria-live': 'polite', 'data-clarity': 'dated', 'data-speak': ''}, cap);
  const bar = h('div', {class: 't-progress', role: 'img', 'aria-label': ''}, ...T.map(() => h('i')));
  const ctl = h('button', {class: 't-ctl', id: 't-ctl', type: 'button', dataset: {mode: 'skip'}}, '건너뛰기');
  const steps = h('div', {class: 't-steps'}, bar, ctl);

  // ── 아래 목록(이야기가 끝나면 올라온다) ──
  const row = r => h('a', {class: 't-row', href: `#/stock/${r.code}`, 'data-forecast-date': r.date, 'data-code': r.code},
    h('div', {class: 't-left'}, h('div', {class: 't-name'}, r.name), h('div', {class: 't-note'}, r.close ? '거의 반반' : `${r.sel === 'up' ? '오를' : '내릴'} 확률 ${prob(r.p)}`)),
    h('div', {class: 't-right'}, h('div', {class: 't-price'}, won(r.p50)), h('span', {class: `t-pill ${finite(r.ret) && Math.abs(r.ret) < 0.001 ? 'flat' : (r.ret ?? 0) >= 0 ? 'up' : 'down'}`, 'data-forecast-date': r.date}, pct(r.ret))));
  const gUp = h('div', {class: 't-group'}, ...upRows.map(row));
  const gDown = h('div', {class: 't-group'});
  let openDown = false;
  const drawDown = () => {
    const shown = openDown ? downRows : downRows.slice(0, 5);
    const more = downRows.length > 5 ? h('button', {class: 't-more', type: 'button', 'aria-expanded': String(openDown), onclick: () => { openDown = !openDown; drawDown(); }}, openDown ? '접기' : `${downRows.length - shown.length}종목 더 보기`) : null;
    gDown.replaceChildren(...shown.map(row), ...(more ? [more] : []));
  };
  drawDown();

  // ── 지난 3번의 성적: 1거래일 방향 맞힘(채점 끝난 마지막 3날) ──
  const scoreCard = h('div', {class: 't-group t-score'});
  const days = (scores?.byDate ?? []).map(d => { const ev = (d.rows ?? []).map(x => x.horizons?.['1']).filter(x => x && x.status === 'evaluated' && typeof x.directionCorrect === 'boolean'); return {date: d.date, n: ev.length, right: ev.filter(x => x.directionCorrect).length}; }).filter(d => d.n > 0).sort((a, b) => a.date < b.date ? -1 : 1).slice(-3);
  if (days.length) {
    const right = days.reduce((s, d) => s + d.right, 0), n = days.reduce((s, d) => s + d.n, 0), share = right / n;
    const line = `${n}번 가운데 ${right}번 맞혔습니다.` + (share >= 0.4 && share <= 0.6 ? ' 하루 방향은 아직 반반에 가깝습니다.' : '');
    const bars = days.map(d => { const fill = h('i'); fill.style.width = (d.right / d.n * 100).toFixed(1) + '%'; return h('div', {class: 't-day'}, h('div', {class: 't-b'}, fill), h('p', null, `${Number(d.date.slice(5, 7))}월 ${Number(d.date.slice(8, 10))}일 `, h('b', null, String(d.right)), `/${d.n}종목`)); });
    scoreCard.append(h('div', {class: 't-big'}, `${Math.round(share * 100)}%`, h('small', null, '방향을 맞힌 몫')), h('div', {class: 't-days'}, ...bars), h('p', {class: 't-honest', 'data-speak': ''}, line));
  } else scoreCard.append(h('p', {class: 't-honest', 'data-speak': ''}, '아직 채점이 끝난 날이 없습니다.'));

  const after = h('div', {class: 't-after hide', id: 't-after'},
    h('h2', {class: 't-h2', 'data-speak': ''}, `오를 쪽 ${upRows.length}종목`), gUp,
    h('h2', {class: 't-h2', 'data-speak': ''}, `내릴 쪽 ${downRows.length}종목`), gDown,
    h('h2', {class: 't-h2'}, '지난 3번의 성적'), scoreCard,
    h('p', {class: 't-foot'}, `${korDate(manifest.actualAsOf)} 종가로 계산`),
    h('p', {class: 't-links'}, h('a', {href: '#/records'}, '기록'), h('a', {href: '#/status'}, '자료 상태')));

  main.replaceChildren(h('section', {class: 't-page', 'data-story': 'playing'}, head, dial, capBox, steps, after));
  const page = main.firstElementChild;

  // ── 점 모양 ──
  const look = (d, {fill = 'transparent', stroke, opacity = 1, scale = 1}) => { const s = d.el.style; s.fill = fill; s.stroke = stroke; s.opacity = String(opacity); s.transform = `scale(${scale})`; };
  const col = d => d.r.sel === 'up' ? 'var(--t-up)' : 'var(--t-down)';
  const idle = d => look(d, {stroke: 'var(--t-idle)', opacity: 0, scale: 0.2});
  const shownDot = d => look(d, {stroke: 'var(--t-idle)'});
  const solid = d => look(d, {fill: col(d), stroke: col(d)});
  const ring = d => look(d, {stroke: col(d)});
  const final = d => (d.r.close ? ring : solid)(d);

  // ── 가운데 숫자 ──
  const setNum = (v, unit, color, label) => { numN.textContent = String(v); numU.textContent = unit; num.dataset.tone = color; of.textContent = label; };
  const count = async (to, unit, color, label, ms, me) => {
    setNum(0, unit, color, label);
    const t0 = performance.now();
    await new Promise(done => { const step = now => { if (me !== story.run) return done(); const k = Math.min(1, (now - t0) / ms), e = 1 - Math.pow(1 - k, 3); numN.textContent = String(Math.round(to * e)); k < 1 ? requestAnimationFrame(step) : done(); }; requestAnimationFrame(step); });
  };

  // ── 글상자 ──
  const mark = i => { [...bar.children].forEach((el, k) => el.classList.toggle('on', k === i)); bar.setAttribute('aria-label', `${T.length}장면 중 ${i + 1}번째`); };
  const showCaption = async (text, fade) => { story.caption = text; if (fade) { capBox.classList.add('out'); await sleep(260); } cap.textContent = text; capBox.dataset.speak = text; capBox.classList.remove('out'); };

  const ups = dots.filter(x => x.r.sel === 'up'), downs = dots.filter(x => x.r.sel === 'down'), halfDots = dots.filter(x => x.r.close);
  /** 지금 장면의 말이 끝날 때까지(말했으면 +0.7초) — 도중에 🔊 를 켜서 말이 바뀌면 바뀐 말을 기다린다 */
  const speechDone = async () => { for (;;) { const p = story.spoken, talked = await p; if (p === story.spoken) { if (talked) await sleep(700); return; } } };
  const later = (me, ms, fn) => setTimeout(() => { if (me === story.run) fn(); }, ms);
  const scenes = [
    {hold: 3200, run: async me => { count(total, '종목', 'ink', '보는 종목', 1800, me); dots.forEach((x, i) => later(me, i * 34, () => shownDot(x))); await sleep(dots.length * 34 + 500); }},
    {hold: 3500, run: async me => { ups.forEach((x, i) => later(me, i * 140, () => solid(x))); await count(upRows.length, '종목', 'up', '오를 쪽', ups.length * 140 + 300, me); }},
    {hold: 3500, run: async me => { downs.forEach((x, i) => later(me, i * 45, () => solid(x))); await count(downRows.length, '종목', 'down', '내릴 쪽', downs.length * 45 + 300, me); }},
    {hold: 4200, run: async me => {
      for (const x of dots) if (!x.r.close) look(x, {fill: x.el.style.fill, stroke: x.el.style.stroke, opacity: 0.22});
      halfDots.forEach((x, i) => later(me, i * 60, () => { look(x, {stroke: col(x), scale: 1.35}); later(me, 420, () => look(x, {stroke: col(x)})); }));
      await count(halves, '개', 'half', '거의 반반', halfDots.length * 60 + 300, me); }},
    {hold: 1400, run: async me => { for (const x of dots) final(x); await count(upRows.length, '종목', 'ink', `${total}종목 중 오를 쪽`, 1100, me); }},
  ];

  const finish = () => {
    story.playing = false;
    for (const x of dots) final(x);
    setNum(upRows.length, '종목', 'ink', `${total}종목 중 오를 쪽`);
    capBox.classList.remove('out'); cap.textContent = T[4]; capBox.dataset.speak = T[4]; story.caption = T[4]; mark(T.length - 1);
    after.classList.remove('hide'); ctl.textContent = '다시 보기'; ctl.dataset.mode = 'replay'; page.dataset.story = 'done';
    markSeen(manifest.forecastId);
  };
  const play = async () => {
    const me = ++story.run; story.playing = true; page.dataset.story = 'playing';
    after.classList.add('hide'); ctl.textContent = '건너뛰기'; ctl.dataset.mode = 'skip'; numN.textContent = ''; numU.textContent = ''; of.textContent = '';
    for (const x of dots) idle(x);
    if (reducedMotion()) { finish(); if (voice.on) say(T[4]); return; }
    await sleep(500);
    for (const [i, s] of scenes.entries()) {
      if (me !== story.run) return;
      mark(i);
      await showCaption(T[i], i > 0);
      story.spoken = say(T[i]);
      await s.run(me);
      if (me !== story.run) return;
      await Promise.all([sleep(s.hold), speechDone()]);
    }
    if (me === story.run) finish();
  };
  // 장면 중에 🔊 를 켜면 지금 글상자를 읽고, 이 장면도 그 말이 끝날 때까지(+0.7초) 기다린다
  story.onVoice = () => { if (story.playing) { if (story.caption) story.spoken = say(story.caption); } else speakScreen(T[4]); };
  ctl.addEventListener('click', () => { if (ctl.dataset.mode === 'skip') { story.run++; stopSpeak(); finish(); } else play(); });

  if (seen(manifest.forecastId)) { story.run++; finish(); }
  else play();
}
