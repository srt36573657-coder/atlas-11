/* ATLAS 11 · 첫 화면 「내일」
   2026-10-02 04:16 사장님 「이때로 돌아가」(2차 화면 그림 「ATLAS_2차_전체.png」): 2차 모습으로 되돌림.
     원은 처음에 점이 톡톡 나타나기만 한다(점마다 14ms 차이 · 0.5초 · 움직임 줄이기 설정이면 없음).
     글상자·진행 점·건너뛰기/다시 보기·아래 「기록 · 자료 상태」 링크는 이 화면에 없다(그 링크는 성적 화면 아래로 옮김).
     글자는 그림 그대로: 가운데 숫자만 · 「52종목 중 오를 쪽」 · 「나머지 40종목은 내릴 쪽입니다. / 속이 빈 28개는 거의 반반입니다.」
     · 「오를 쪽 12」「내릴 쪽 40」 · 「9월 29일 35/52」 · 「10월 1일 목요일 종가로 계산」.
   3차 이야기(다섯 장면 · 2026-10-02 01:34 사장님 승인)는 STORY = false 로 꺼 둠 — 지우지 않음. true 로 바꾸면 3차 그대로 돈다.
   2026-10-02 14:01 사장님 「동그라미 천천히 나오고 회사 이름 나오게 해봐」: 점 톡톡(0.7초) 대신 점이 12시부터 시계 방향으로 하나씩 천천히 나온다
     (점마다 0.36초 · 네 묶음이 바뀔 때 0.7초 쉼 · 모두 22초쯤). 점이 나올 때마다 가운데에 그 회사 이름과 「오를 쪽 · 확률 58%」가 뜬다.
     다 나오면 가운데는 2차 그대로(오를 쪽 수 · 「52종목 중 오를 쪽」). 그 뒤에도 점을 누르면 그 회사 이름이 2.5초 떴다가 돌아간다.
     움직임 줄이기 설정이면 처음부터 다 보인다(이름은 점을 누르면 뜸). 상태는 .t-page[data-roll] = playing · done · tap.
   한 물건: 52종목 원 하나. 12시 방향부터 시계 방향으로 ① 분명히 오를 쪽 ② 오를 쪽이지만 거의 반반 ③ 내릴 쪽이지만 거의 반반 ④ 분명히 내릴 쪽.
   오를 쪽 빨강(#ff3b30) · 내릴 쪽 파랑(#0a84ff) · 거의 반반(day1.closeCall || day1.statisticalTie)은 속이 빈 원.
   「내일 하루만」(2026-10-02 00:08 사장님 명령): 전망은 내일(manifest.futureDates[0]) 하나만 · 전망 요소마다 data-forecast-date. */
import {h, won, pct, prob, korDate, weekday, finite, speak, speakScreen, stopSpeak, reducedMotion} from './util.js';
import {state, loadCards, loadScores, loadJSON, prefs} from './store.js';
import {roadOf, roadSvg, roadKey, unitText} from './road.js';
import {sideRows} from './view-side.js';

/** 3차 이야기(장면) 스위치 — 2026-10-02 04:16 사장님 「이때로 돌아가」로 꺼 둠(지우지 않음) */
const STORY = false;

const NS = 'http://www.w3.org/2000/svg';
const sleep = ms => new Promise(r => setTimeout(r, ms));
const longDate = d => d ? `${Number(d.slice(5, 7))}월 ${Number(d.slice(8, 10))}일 ${weekday(d)}요일` : '';
const seenMemory = new Set();
/** 소리 상태(앱 전체 한 벌) — app.js 의 소리 단추가 바꾼다 */
export const voice = {on: false};
const story = {run: 0, playing: false, caption: '', onVoice: null, spoken: Promise.resolve(false)};
export function stopStory() { story.run++; story.playing = false; story.onVoice = null; }
/** 소리를 켰을 때: 이야기 중이면 지금 글상자를 읽고(다음 장면부터는 장면이 소리를 기다림), 끝났으면 화면 글자를 읽는다 */
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
  const [cardsDoc, scores, whyDoc] = await Promise.all([loadCards(), loadScores().catch(() => null), loadJSON('why.json').catch(() => null)]);
  const tomorrow = manifest.futureDates?.[0];
  const rows = (cardsDoc.cards ?? []).filter(c => c.day1).map(c => {
    const d1 = c.day1, sel = d1.selected === 'up' || d1.selected === 'down' ? d1.selected : (finite(d1.return) && d1.return < 0 ? 'down' : 'up');
    return {code: c.code, name: c.name, sel, close: Boolean(d1.closeCall || d1.statisticalTie || (d1.selected !== 'up' && d1.selected !== 'down')), p: d1.probabilities?.[sel], p50: d1.p50, ret: d1.return, date: d1.date ?? tomorrow, c: c.c ?? null};
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
  const lead = `${total}종목 중 ${upRows.length}종목이 오를 쪽입니다.`;
  state.summary = STORY ? T[4] : `${lead} 나머지 ${downRows.length}종목은 내릴 쪽입니다. 속이 빈 ${halves}개는 거의 반반입니다.`;

  // ── 머리: 큰 제목 「내일」 + 내일 날짜 ──
  // 2026-10-04 00:51 사장님 「52개 업종에서 찾는 게 아니라 오를 수 있는 52개 우량 종목을 찾아 첫 화면에 배열하는 구조로 싹 변경하자」 · 「알아서 해」
  //   → 날짜 밑에 「어떤 52곳인가」 한 줄 · 원 밑에 52곳을 이름으로 한눈에(원과 같은 순서: 분명히 오를 쪽 → … → 분명히 내릴 쪽) · 「이 52곳은 어떻게 골랐나」(눌러서 열림)
  //   말: 「튼튼한 회사 52곳」 — 사라·추천 같은 말은 쓰지 않는다(고른 기준은 숫자로 잰 회사 상태 · 오를지 내릴지는 ATLAS가 날마다 따로 적음)
  const uni = manifest.universeSet ?? {label: `${rows.length}종목`, how: []};
  const md = d => d ? `${Number(d.slice(5, 7))}월 ${Number(d.slice(8, 10))}일` : '';
  // 발행이 멈춰 이 화면의 예측 날이 이미 지났으면(그날 15:30 장 마감 뒤) 큰 제목을 「내일」 대신 「지난 예측」으로
  //   — 2026-10-04: 10/2 저녁 발행이 51/52 로 멈춘 뒤 10/4 에도 「내일 · 10월 2일 금요일」이 보였다(날짜는 그대로 둠)
  const past = Boolean(tomorrow) && Date.now() >= Date.parse(tomorrow + 'T15:30:00+09:00');
  // ── 바뀔 52곳 미리 보기(2026-10-04 07:40 사장님 「aaa7377에 올려」) — 바꾸기 전까지만 맨 위에 이름만 ──
  //   새 52곳의 오를까·내릴까는 바꾸는 날 장 마감 뒤 실행부터 낸다(장이 열린 날 마감 뒤 발행만 채점하므로) · 이름표는 누를 곳이 없어 링크가 아님
  const nx = manifest.universeNext, mdw = d => d ? `${md(d)}(${weekday(d)})` : '';
  const nextCard = nx?.companies?.length ? h('section', {class: 't-next', 'aria-label': `${nx.label} 미리 보기`, 'data-universe': nx.id},
    h('p', {class: 't-next-tag'}, nx.from ? `${mdw(nx.from)}부터` : `바뀔 ${nx.companies.length}곳`),
    h('h2', {class: 't-next-h', 'data-speak': ''}, nx.label),
    h('p', {class: 't-next-when', 'data-speak': ''}, nx.from && nx.firstTarget ? `${mdw(nx.from)} 장이 끝난 뒤부터 이 ${nx.companies.length}곳이 ${mdw(nx.firstTarget)}에 오를지 내릴지를 적습니다. 그때부터 첫 화면이 이 ${nx.companies.length}곳으로 바뀝니다.` : `첫 화면이 이 ${nx.companies.length}곳으로 바뀝니다.`),
    h('div', {class: 't-next-chips'}, ...nx.companies.map(c => h('span', {class: `t-next-chip${c.isNew ? ' new' : ''}`, 'data-code': c.code, 'data-len': [...c.name].length >= 8 ? 'l' : 's'},
      h('span', {class: 't-next-n'}, c.name), ...(c.isNew ? [h('span', {class: 't-next-new'}, '새')] : [])))),
    h('p', {class: 't-next-key'}, h('span', {class: 't-next-new'}, '새'), ` = 새로 들어온 ${nx.added}곳 · 나머지 ${nx.kept}곳은 지금의 ${nx.now}에서 이어짐`),
    ...(nx.how?.length ? [h('details', {class: 't-next-how'}, h('summary', null, `이 ${nx.companies.length}곳은 어떻게 골랐나`), h('ul', null, ...nx.how.map(x => h('li', null, x))), h('p', {class: 't-uni-note'}, '오를지 내릴지는 고를 때 쓰지 않았습니다 · ATLAS가 날마다 따로 적습니다'))] : []),
    ...(nx.dropped?.length ? [h('details', {class: 't-next-how t-next-out'}, h('summary', null, `빠지는 ${nx.dropped.length}곳`), h('p', null, nx.dropped.map(d => d.name).join(' · ')))] : [])) : null;
  const head = h('header', {class: 't-head'},
    h('h1', {class: 't-title', 'data-clarity': 'dated', ...(past ? {'data-past': 'true'} : {})}, past ? '지난 예측' : '내일'),
    h('p', {class: 't-when', 'data-clarity': 'date-anchor', 'data-forecast-date': tomorrow}, longDate(tomorrow)),
    h('p', {class: 't-uni', 'data-universe': uni.id ?? '', 'data-speak': `${uni.label}입니다.`}, h('b', null, uni.label), uni.selectedOn ? ` · ${md(uni.selectedOn)}${uni.id === 'u1-sector52' ? '부터' : ' 고름'}` : ''));

  // ── 둥근 판: 12시 방향부터 시계 방향 ──
  const svg = document.createElementNS(NS, 'svg'); svg.setAttribute('viewBox', '0 0 300 300'); svg.setAttribute('class', 't-ring'); svg.setAttribute('aria-hidden', 'true');
  const R = 132, C = 150, dots = [];
  order.forEach((r, i) => {
    const a = -Math.PI / 2 + i / order.length * Math.PI * 2, c = document.createElementNS(NS, 'circle');
    c.setAttribute('cx', (C + R * Math.cos(a)).toFixed(2)); c.setAttribute('cy', (C + R * Math.sin(a)).toFixed(2)); c.setAttribute('r', '7');
    c.setAttribute('class', `t-dot ${r.sel}${r.close ? ' half' : ''}`); c.setAttribute('data-forecast-date', r.date); c.setAttribute('data-code', r.code);
    c.style.setProperty('--i', String(i));
    const t = document.createElementNS(NS, 'title'); t.textContent = `${r.name} · ${r.close ? '거의 반반' : r.sel === 'up' ? '오를 쪽' : '내릴 쪽'}`; c.append(t);
    svg.append(c); dots.push({el: c, r});
  });
  const numN = h('span', {class: 't-n'}, ''), numU = h('span', {class: 't-u'}, '');
  const num = h('div', {class: 't-num', 'data-forecast-date': tomorrow}, ...(STORY ? [numN, numU] : [numN])), of = h('div', {class: 't-of'}, '');
  const dial = h('div', {class: 't-dial', role: 'img', 'aria-label': `${total}종목: 오를 쪽 ${upRows.length}종목, 내릴 쪽 ${downRows.length}종목, 그중 거의 반반 ${halves}개`, ...(STORY ? {} : {'data-speak': lead})}, svg, h('div', {class: 't-center'}, num, of));
  const cap = h('span', {class: 't-cap-text'}, '');
  const capBox = h('div', {class: 't-cap', 'aria-live': 'polite', 'data-clarity': 'dated', 'data-speak': ''}, cap);
  const bar = h('div', {class: 't-progress', role: 'img', 'aria-label': ''}, ...T.map(() => h('i')));
  const ctl = h('button', {class: 't-ctl', id: 't-ctl', type: 'button', dataset: {mode: 'skip'}}, '건너뛰기');
  const steps = h('div', {class: 't-steps'}, bar, ctl);
  // 2차: 원 아래 두 줄(그림 그대로)
  const sayLines = h('p', {class: 't-say', 'data-speak': `나머지 ${downRows.length}종목은 내릴 쪽입니다. 속이 빈 ${halves}개는 거의 반반입니다.`},
    `나머지 ${downRows.length}종목은 내릴 쪽입니다.`, h('br'), `속이 빈 ${halves}개는 거의 반반입니다.`);

  // ── 아래 목록 ──
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
    const bars = days.map(d => { const fill = h('i'); fill.style.width = (d.right / d.n * 100).toFixed(1) + '%'; return h('div', {class: 't-day'}, h('div', {class: 't-b'}, fill), h('p', null, `${Number(d.date.slice(5, 7))}월 ${Number(d.date.slice(8, 10))}일 `, h('b', null, String(d.right)), STORY ? `/${d.n}종목` : `/${d.n}`)); });
    scoreCard.append(h('div', {class: 't-big'}, `${Math.round(share * 100)}%`, h('small', null, '방향을 맞힌 몫')), h('div', {class: 't-days'}, ...bars), h('p', {class: 't-honest', 'data-speak': ''}, line));
  } else scoreCard.append(h('p', {class: 't-honest', 'data-speak': ''}, '아직 채점이 끝난 날이 없습니다.'));

  const after = h('div', {class: STORY ? 't-after hide' : 't-after', id: 't-after'},
    h('h2', {class: 't-h2', 'data-speak': ''}, STORY ? `오를 쪽 ${upRows.length}종목` : `오를 쪽 ${upRows.length}`), gUp,
    h('h2', {class: 't-h2', 'data-speak': ''}, STORY ? `내릴 쪽 ${downRows.length}종목` : `내릴 쪽 ${downRows.length}`), gDown,
    h('h2', {class: 't-h2'}, '지난 3번의 성적'), scoreCard,
    h('p', {class: 't-foot'}, STORY ? `${korDate(manifest.actualAsOf)} 종가로 계산` : `${longDate(manifest.actualAsOf)} 종가로 계산`),
    ...(STORY ? [h('p', {class: 't-links'}, h('a', {href: '#/records'}, '기록'), h('a', {href: '#/status'}, '자료 상태'))] : []));

  // ── 가운데 숫자 ──
  const setNum = (v, unit, color, label) => { numN.textContent = String(v); numU.textContent = unit; num.dataset.tone = color; of.textContent = label; };
  const col = d => d.r.sel === 'up' ? 'var(--t-up)' : 'var(--t-down)';

  if (!STORY) {
    // ── 2차: 원·두 줄·목록·성적이 처음부터 보임 · 속 찬 점 r 7.4 · 속 빈 점 r 6.2 + 선 2.6(2차 시안 그대로) ──
    for (const d of dots) { d.el.setAttribute('r', d.r.close ? '6.2' : '7.4'); const s = d.el.style; s.fill = d.r.close ? 'transparent' : col(d); s.stroke = d.r.close ? col(d) : 'none'; }
    setNum(upRows.length, '', 'ink', `${total}종목 중 오를 쪽`);
    // ── 2026-10-02 14:01 사장님 「동그라미 천천히 나오고 회사 이름 나오게 해봐」: 점이 하나씩 나오며 가운데에 회사 이름 ──
    const rollName = h('div', {class: 't-roll-name'}), rollSide = h('div', {class: 't-roll-side'});
    dial.querySelector('.t-center').append(h('div', {class: 't-roll', 'aria-live': 'off'}, rollName, rollSide));
    const cursor = document.createElementNS(NS, 'circle'); cursor.setAttribute('class', 't-cursor'); cursor.setAttribute('r', '13'); cursor.setAttribute('cx', '0'); cursor.setAttribute('cy', '0'); svg.append(cursor);
    // ── 2026-10-02 14:08 사장님 「36가지 … 종류와 점수 · 가장 높은 순 · 왜 그 종목을 오를 쪽으로 봤나 · 종목별로」: 원 아래 「왜 그렇게 봤나」 ──
    //   고른 종목(점이 나올 때마다 · 다 나오면 12시 첫 점 · 점을 누르면 그 종목)의 하루 기대 등락 몫을 높은 순으로 + 36가지 설계 점수표(높은 순 · 쓰는지 안 쓰는지)
    const fById = new Map((whyDoc?.factors ?? []).map(f => [f.id, f]));
    const whyBox = h('section', {class: 't-why', 'aria-label': '왜 그렇게 봤나'});
    const paths = whyDoc?.paths ? `${whyDoc.paths >= 10000 && whyDoc.paths % 10000 === 0 ? `${whyDoc.paths / 10000}만` : whyDoc.paths.toLocaleString('ko-KR')} 개 길` : '모의 길';
    const renderWhy = d => {
      const w = whyDoc?.stocks?.[d.r.code];
      if (!w) { whyBox.replaceChildren(); return; }
      whyBox.dataset.code = d.r.code;
      const r4 = v => Math.round(v * 1e4) / 1e4 || 0; // 0.01%p 아래는 0.00%(부호 없이)
      const items = [{label: '평균 성분', sub: '이 종목의 평소 하루 흐름', value: w.intercept}, ...w.parts.map(x => ({label: fById.get(x.id)?.name ?? x.id, sub: `${x.id} · 몫 ${Math.round(x.share ?? 0)}%`, value: x.value}))]
        .filter(x => finite(x.value)).map(x => ({...x, value: r4(x.value)})).sort((a, b) => b.value - a.value);
      const mx = Math.max(1e-9, ...items.map(x => Math.abs(x.value))), tone = v => v > 0 ? 'up' : v < 0 ? 'down' : '';
      const bar = x => { const fill = h('i', {class: tone(x.value)}); fill.style.width = (Math.abs(x.value) / mx * 100).toFixed(1) + '%'; return h('li', null, h('div', {class: 't-why-k'}, h('b', null, x.label), h('span', null, x.sub)), h('div', {class: 't-why-b'}, fill), h('span', {class: 't-why-v ' + tone(x.value)}, pct(x.value))); };
      const side = d.r.sel === 'up' ? '오를' : '내릴', flip = finite(w.mean) && ((w.mean > 0 && d.r.sel === 'down') || (w.mean < 0 && d.r.sel === 'up'));
      const used = (whyDoc.factors ?? []).filter(f => f.role !== 'not_used'), total36 = (whyDoc.factors ?? []).length;
      whyBox.replaceChildren(
        h('h2', {class: 't-why-h'}, `왜 ${side} 쪽으로 봤나 · ${d.r.name}`),
        h('p', {class: 't-why-dir'}, `${paths} 가운데 오른 길 ${prob(w.up)} · 내린 길 ${prob(w.down)} → ${side} 쪽${d.r.close ? ' · 거의 반반' : ''}`),
        // 2026-10-04 「바카라 그 표가 곳곳에」: 고른 종목의 출목표(지난 20거래일) — 지난 기록을 읽은 표 · 다음 날을 맞히는 말이 아님
        ...(Array.isArray(d.r.c) && d.r.c.length > 2 ? [(road => h('div', {class: 't-why-road'}, h('p', {class: 't-why-cap'}, `출목표 · 지난 ${road.days}거래일${road.unit !== 0.01 ? ' · ' + unitText(road) : ''}`), roadSvg(road), roadKey(road, {note: false})))(roadOf(d.r.c))] : []),
        h('p', {class: 't-why-cap'}, '하루 기대 등락을 이루는 몫 · 높은 순'),
        h('ul', {class: 't-why-bars'}, ...items.map(bar)),
        h('p', {class: 't-why-sum'}, '합계 = 하루 기대 등락 ', h('b', {class: tone(w.mean)}, pct(w.mean))),
        ...(flip ? [h('p', {class: 't-why-note'}, `평균은 ${w.mean > 0 ? '오를' : '내릴'} 쪽이지만, 방향은 ${paths}을 센 비율로 정합니다 · 큰 길 몇 개가 평균을 끌어당긴 경우입니다`)] : []),
        h('p', {class: 't-why-note'}, `${total36}가지 가운데 이 예측에 들어간 것 ${used.length}가지(평균 몫 ${used.filter(f => f.role === 'conditional_mean').length}가지 · 흔들림 폭 ${used.filter(f => f.role === 'variance').length}가지) · 나머지 ${total36 - used.length}가지는 자료를 아직 못 모았거나 검증 전이라 넣지 않았습니다`),
        h('details', {class: 't-why-36'}, h('summary', null, `${total36}가지 점수표 · 높은 순`),
          h('p', {class: 't-why-note'}, '점수 = 설계 때 미리 매긴 중요도(작동 원리 · 넓이 · 기간 · 관측 · 0점~100점) · 실제로 맞힌 정도가 아닙니다'),
          h('ol', null, ...(whyDoc.factors ?? []).map(f => h('li', {class: f.role !== 'not_used' ? 'on' : ''}, h('b', null, f.name), h('span', {class: 't-why-sc'}, ` ${f.score}점`), h('span', {class: 't-why-st'}, f.role === 'conditional_mean' ? '씀 · 평균 몫' : f.role === 'variance' ? '씀 · 흔들림 폭' : '안 씀'))))));
    };
    // ── 2026-10-04 08:19 사장님 「정리 정돈 — 상승할 것 같은 회사들만 한곳에, 그렇지 않은 회사들도 한곳으로 · 페이지 만들어서」 ──
    //   원 아래는 두 문(오를 쪽 · 내릴 쪽)만 — 회사마다 출목표·다가오는 일정·공시 중요도는 문을 열면(#/up · #/down) · 긴 목록과 52곳 이름표는 그쪽으로 옮김
    const W2 = {up: '오를 쪽', down: '내릴 쪽'};
    const door = side => { const list = sideRows(rows.map(r => ({...r, half: r.close})), side), names = list.slice(0, 6).map(r => r.name).join(' · ') + (list.length > 6 ? ` 외 ${list.length - 6}곳` : '');
      return h('a', {class: `t-door ${side}`, href: '#/' + side, 'data-side': side, 'data-count': String(list.length), 'aria-label': `${W2[side]} ${list.length}곳 보기 · 출목표 · 다가오는 일정 · 공시 중요도`},
        h('div', {class: 't-door-h', 'data-speak': `${W2[side]} ${list.length}곳`}, h('span', {class: 't-door-m', 'aria-hidden': 'true'}, side === 'up' ? '▲' : '▼'), h('b', null, W2[side]), h('span', {class: 't-door-n'}, `${list.length}곳`), h('span', {class: 't-door-go', 'aria-hidden': 'true'}, '›')),
        h('p', {class: 't-door-names'}, list.length ? names : '없음'),
        h('p', {class: 't-door-sub'}, '출목표 · 다가오는 일정 · 공시 중요도(★)')); };
    const doors = h('section', {class: 't-doors', 'aria-label': `${uni.label} · 오를 쪽 · 내릴 쪽`},
      h('h2', {class: 't-doors-h'}, `${uni.label} · 두 묶음`),
      door('up'), door('down'),
      ...(uni.how?.length ? [h('details', {class: 't-uni-how'}, h('summary', null, `이 ${rows.length}곳은 어떻게 골랐나`), h('ul', null, ...uni.how.map(x => h('li', null, x))), h('p', {class: 't-uni-note'}, '오를지 내릴지는 고를 때 쓰지 않았습니다 · ATLAS가 날마다 따로 적습니다'))] : []));
    // 아래: 지난 3번의 성적과 계산 기준일만(긴 목록은 두 쪽으로 옮김)
    const afterTidy = h('div', {class: 't-after', id: 't-after'},
      h('h2', {class: 't-h2'}, '지난 3번의 성적'), scoreCard,
      h('p', {class: 't-foot'}, `${longDate(manifest.actualAsOf)} 종가로 계산`));
    const page = h('section', {class: 't-page', 'data-story': 'off', 'data-roll': 'done'}, ...(nextCard ? [nextCard] : []), head, dial, sayLines, doors, whyBox, afterTidy);
    main.replaceChildren(page);
    story.run++; story.playing = false; story.onVoice = null;
    const me = story.run;
    const sideOf = r => `${r.sel === 'up' ? '오를' : '내릴'} 쪽 · ${r.close ? '거의 반반' : `확률 ${prob(r.p)}`}`;
    const sizeOf = n => n.length <= 4 ? 's' : n.length <= 6 ? 'm' : n.length <= 8 ? 'l' : 'xl';
    const showName = d => {
      rollName.textContent = d.r.name; rollName.dataset.size = sizeOf(d.r.name); rollSide.textContent = sideOf(d.r); rollSide.dataset.tone = d.r.sel;
      cursor.style.transform = `translate(${d.el.getAttribute('cx')}px, ${d.el.getAttribute('cy')}px)`; cursor.classList.add('on');
    };
    if (!reducedMotion()) {
      page.dataset.roll = 'playing';
      (async () => {
        await sleep(600);
        let prev = null;
        for (const d of dots) {
          if (me !== story.run) return;
          if (prev !== null && key(d.r) !== prev) await sleep(700); // 네 묶음(분명히 오름 → 오름·반반 → 내림·반반 → 분명히 내림)이 바뀔 때 숨 한 번
          if (me !== story.run) return;
          d.el.classList.add('on'); showName(d); renderWhy(d); prev = key(d.r);
          await sleep(360);
        }
        await sleep(900);
        if (me !== story.run) return;
        page.dataset.roll = 'done'; cursor.classList.remove('on'); renderWhy(dots[0]);
      })();
    }
    renderWhy(dots[0]); // 처음(움직임 줄이기면 끝까지): 12시 첫 점 — 분명히 오를 쪽 가운데 맨 앞
    for (const d of dots) if (reducedMotion()) d.el.classList.add('on');
    // 다 나온 뒤: 점(원 둘레 어디든)을 누르면 그 회사 이름이 2.5초 떴다가 숫자로 돌아간다
    let tapT = 0;
    svg.addEventListener('click', e => {
      if (page.dataset.roll === 'playing') return;
      const rc = svg.getBoundingClientRect(), x = (e.clientX - rc.left) / rc.width * 300 - C, y = (e.clientY - rc.top) / rc.height * 300 - C;
      if (Math.hypot(x, y) < R - 40) return; // 가운데 숫자 쪽은 점이 아니다
      let a = Math.atan2(y, x) + Math.PI / 2; if (a < 0) a += Math.PI * 2;
      const d = dots[Math.round(a / (Math.PI * 2) * dots.length) % dots.length];
      clearTimeout(tapT); page.dataset.roll = 'tap'; showName(d); renderWhy(d);
      tapT = setTimeout(() => { if (page.dataset.roll === 'tap') { page.dataset.roll = 'done'; cursor.classList.remove('on'); } }, 2500);
    });
    return;
  }

  main.replaceChildren(h('section', {class: 't-page', 'data-story': 'playing'}, head, dial, capBox, steps, after));
  const page = main.firstElementChild;

  // ── 점 모양 ──
  const look = (d, {fill = 'transparent', stroke, opacity = 1, scale = 1}) => { const s = d.el.style; s.fill = fill; s.stroke = stroke; s.opacity = String(opacity); s.transform = `scale(${scale})`; };
  const idle = d => look(d, {stroke: 'var(--t-idle)', opacity: 0, scale: 0.2});
  const shownDot = d => look(d, {stroke: 'var(--t-idle)'});
  const solid = d => look(d, {fill: col(d), stroke: col(d)});
  const ring = d => look(d, {stroke: col(d)});
  const final = d => (d.r.close ? ring : solid)(d);

  const count = async (to, unit, color, label, ms, me) => {
    setNum(0, unit, color, label);
    const t0 = performance.now();
    await new Promise(done => { const step = now => { if (me !== story.run) return done(); const k = Math.min(1, (now - t0) / ms), e = 1 - Math.pow(1 - k, 3); numN.textContent = String(Math.round(to * e)); k < 1 ? requestAnimationFrame(step) : done(); }; requestAnimationFrame(step); });
  };

  // ── 글상자 ──
  const mark = i => { [...bar.children].forEach((el, k) => el.classList.toggle('on', k === i)); bar.setAttribute('aria-label', `${T.length}장면 중 ${i + 1}번째`); };
  const showCaption = async (text, fade) => { story.caption = text; if (fade) { capBox.classList.add('out'); await sleep(260); } cap.textContent = text; capBox.dataset.speak = text; capBox.classList.remove('out'); };

  const ups = dots.filter(x => x.r.sel === 'up'), downs = dots.filter(x => x.r.sel === 'down'), halfDots = dots.filter(x => x.r.close);
  /** 지금 장면의 말이 끝날 때까지(말했으면 +0.7초) — 도중에 소리를 켜서 말이 바뀌면 바뀐 말을 기다린다 */
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
  // 장면 중에 소리를 켜면 지금 글상자를 읽고, 이 장면도 그 말이 끝날 때까지(+0.7초) 기다린다
  story.onVoice = () => { if (story.playing) { if (story.caption) story.spoken = say(story.caption); } else speakScreen(T[4]); };
  ctl.addEventListener('click', () => { if (ctl.dataset.mode === 'skip') { story.run++; stopSpeak(); finish(); } else play(); });

  if (seen(manifest.forecastId)) { story.run++; finish(); }
  else play();
}
