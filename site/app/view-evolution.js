/* ATLAS 11 · 진화 — 질문 하나: 「ATLAS는 시장의 답을 받아들여 나아졌는가?」 · 약속: 처음 보는 사람도 5초 안에 답을 안다.
   순서: 결론 한 문장·표본 → 막힘 한 가지 → 그림 하나(날짜별 잣대 선 + ●바꿈 ○시험만 ▲공사) → 날짜마다 세 박자(누르면 까닭) → 공사 기록 → 전문가용(접힘).
   숫자는 모두 timeline.json(기록 장부에서 만든 사실표)에서만 가져온다. */
import {h, shortDate, korDate, weekday, num, pctRaw, chartScale} from './util.js';
import {loadJSON, loadEvolution, setSummary, state} from './store.js';
import {headline, editionSource} from './frame.js';
import {bars} from './chart.js';

const NS = 'http://www.w3.org/2000/svg';
const svgEl = (tag, attrs = {}, text = null) => { const e = document.createElementNS(NS, tag); for (const [k, v] of Object.entries(attrs)) if (v != null) e.setAttribute(k, v); if (text != null) e.textContent = text; return e; };
const signed = (v, d = 2) => (v > 0 ? '+' : v < 0 ? '−' : '') + Math.abs(v).toFixed(d) + '%';
const pctOf = (v, d = 0) => (v * 100).toFixed(d) + '%';
const section = (title, ...children) => h('section', {class: 'card'}, h('h2', null, title), ...children);

/* ---------- 그림 하나: 날짜별 잣대 선 ----------
   화면 폭을 재서 그 폭으로 그린다(휴대폰에서도 글자가 줄어들지 않게) · 폭이 바뀌면 다시 그린다.
   층: 바탕(덜 틀림·더 틀림) → 눈금·「발행일 종가 그대로」 선 → 선의 흐린 그림자 → 선·점·값 → 기록 줄(●바꿈 ○시험만 ▲공사) · 좌표는 꾸미지 않는다. */
function drawChart(box, c) {
  const width = Math.max(300, Math.round(box.clientWidth || 680)), mobile = width < 600;
  const k = chartScale(width), W = width, H = Math.round((mobile ? 258 : 278) * k), L = (mobile ? 42 : 52) * k, R = (mobile ? 10 : 20) * k, T = 30 * k, B = 76 * k, plotH = H - T - B;
  const days = c.sessions, idx = new Map(days.map((d, i) => [d, i]));
  const x = d => L + (days.length <= 1 ? 0 : (idx.get(d) ?? 0) / (days.length - 1) * (W - L - R));
  const cum = c.cumulative ?? [], maxAbs = Math.max(4, ...c.points.map(p => Math.abs(p.lessWrongPct)), ...cum.map(p => Math.abs(p.lessWrongPct))), D = Math.ceil((maxAbs + 1) / 2) * 2;
  const y = v => T + (D - v) / (2 * D) * plotH, y0 = y(0), laneY = T + plotH + 24 * k;
  const svg = svgEl('svg', {viewBox: `0 0 ${W} ${H}`, width: '100%', height: H, class: 'evo-chart', role: 'img', 'aria-label': `날짜별 그림: 1일 뒤 예측이 「발행일 종가 그대로」보다 덜 틀린 정도. 지금까지 합친 값 ${cum.map(p => `${korDate(p.date)} ${signed(p.lessWrongPct)}`).join(', ')}. 그날 하루 값 ${c.points.map(p => `${korDate(p.date)} ${signed(p.lessWrongPct)}`).join(', ')}. 바꿈 ${c.changes.length}번, 시험만 한 날 ${c.tests.length}번, 공사한 날 ${c.constructions.length}번. 판정 시작 ${c.judgementDate ? korDate(c.judgementDate) : '미정'}.`});
  svg.style.fontSize = (16 * k) + 'px'; const scaleK = k;
  const defs = svgEl('defs'); const blur = svgEl('filter', {id: 'evo-soft', x: '-10%', y: '-40%', width: '120%', height: '180%'}); blur.append(svgEl('feGaussianBlur', {stdDeviation: '4'})); defs.append(blur); svg.append(defs);
  // 층 1: 덜 틀림(위) · 더 틀림(아래) 바탕
  svg.append(svgEl('rect', {x: L, y: T, width: W - L - R, height: y0 - T, class: 'evo-zone better'}), svgEl('rect', {x: L, y: y0, width: W - L - R, height: T + plotH - y0, class: 'evo-zone worse'}));
  // 바탕 이름은 점이 없는 쪽(오른쪽 끝 90px 안에 점이 없으면 오른쪽, 있으면 왼쪽)
  const rightBusy = [...c.points, ...cum].some(p => x(p.date) > W - R - 110 * k), zx = rightBusy ? L + 8 * k : W - R - 8 * k, za = rightBusy ? 'start' : 'end';
  svg.append(svgEl('text', {x: zx, y: T + 16 * k, class: 'evo-zone-label', 'text-anchor': za}, '덜 틀림 ↑'), svgEl('text', {x: zx, y: T + plotH - 8 * k, class: 'evo-zone-label', 'text-anchor': za}, '더 틀림 ↓'));
  for (const v of [D, D / 2, 0, -D / 2, -D]) { svg.append(svgEl('line', {x1: L, x2: W - R, y1: y(v), y2: y(v), class: v === 0 ? 'evo-zero' : 'evo-grid'})); svg.append(svgEl('text', {x: L - 6 * k, y: y(v) + 4 * k, class: 'evo-tick', 'text-anchor': 'end'}, v === 0 ? '0%' : signed(v, 0))); }
  svg.append(svgEl('text', {x: zx, y: y0 - 6 * k, class: 'evo-zero-label', 'text-anchor': za}, mobile ? '「발행일 종가 그대로」' : '「발행일 종가 그대로」와 같음'));
  // 판정 시작(점선)
  if (c.judgementDate && idx.has(c.judgementDate)) { const jx = x(c.judgementDate); svg.append(svgEl('line', {x1: jx, x2: jx, y1: T - 8 * k, y2: T + plotH, class: 'evo-judge'}), svgEl('text', {x: jx, y: T - 12 * k, class: 'evo-judge-label', 'text-anchor': 'middle'}, `판정 시작 ${shortDate(c.judgementDate)}`)); }
  // 층 2: 그날 하루 값(흐린 점 · 값 글자 없음) — 날마다 오르내림
  const tip = (el, text) => { el.append(svgEl('title', {}, text)); return el; };
  c.points.forEach((p, i) => { svg.append(tip(svgEl('circle', {cx: x(p.date), cy: y(p.lessWrongPct), r: (mobile ? 3.2 : 3.6) * k, class: 'evo-daily'}), `${korDate(p.date)} 그날 하루: 「발행일 종가 그대로」보다 ${Math.abs(p.lessWrongPct).toFixed(2)}% ${p.lessWrongPct >= 0 ? '덜' : '더'} 틀림 (${p.n}종목)`)); if (i === c.points.length - 1 && c.points.length > 1) svg.append(svgEl('text', {x: x(p.date) + 8 * k, y: y(p.lessWrongPct) + (p.lessWrongPct < (cum.at(-1)?.lessWrongPct ?? 0) ? 16 : -8) * k, class: 'evo-daily-val', 'text-anchor': 'start'}, `그날 ${signed(p.lessWrongPct)}`)); });
  // 층 3: 지금까지 합친 값(선명한 선·점·값) — 마지막 점 = 맨 위 결론의 숫자
  if (cum.length) {
    const d = cum.map((p, i) => `${i ? 'L' : 'M'}${x(p.date).toFixed(1)},${y(p.lessWrongPct).toFixed(1)}`).join(' ');
    svg.append(svgEl('path', {d, class: 'evo-line-glow', filter: 'url(#evo-soft)'}), svgEl('path', {d, class: 'evo-line'}));
    cum.forEach((p, i) => { const px = x(p.date), py = y(p.lessWrongPct), last = i === cum.length - 1; svg.append(tip(svgEl('circle', {cx: px, cy: py, r: (last ? 5.5 : 4.5) * k, class: 'evo-dot' + (last ? ' last' : '')}), `${korDate(p.date)}까지 합친 값: 「발행일 종가 그대로」보다 ${Math.abs(p.lessWrongPct).toFixed(2)}% ${p.lessWrongPct >= 0 ? '덜' : '더'} 틀림 (1일 뒤 ${p.n}칸)`)); if (last || !mobile || cum.length <= 5) svg.append(svgEl('text', {x: px + 8 * k, y: py + (p.lessWrongPct < 0 ? 18 : last ? -9 : -12) * k, class: 'evo-val' + (last ? ' last' : ''), 'text-anchor': 'start'}, (last ? '지금까지 ' : '') + signed(p.lessWrongPct))); });
  }
  // 기록 줄 둘 — 위: 진화(●바꿈 ○시험만) · 아래: 공사(▲사람이 고침). 진화와 공사를 한 줄에 섞지 않는다.
  const laneEvo = laneY - 7 * k, laneBuild = laneY + 11 * k;
  for (const [ly, word] of [[laneEvo, '시험'], [laneBuild, '공사']]) svg.append(svgEl('line', {x1: L, x2: W - R, y1: ly, y2: ly, class: 'evo-lane'}), svgEl('text', {x: L - 10 * k, y: ly + 4 * k, class: 'evo-tick', 'text-anchor': 'end'}, word));
  const rMark = (mobile ? 4.5 : 5.5) * k;
  for (const k of c.tests) if (idx.has(k.date)) { svg.append(tip(svgEl('circle', {cx: x(k.date), cy: laneEvo, r: rMark, class: 'evo-test-mark'}), `${korDate(k.date)}: 고칠 거리 ${k.tested}개 시험 · 탈락 ${k.rejected} · 안 바꿈`)); svg.append(svgEl('text', {x: x(k.date) + rMark + 3, y: laneEvo + 4 * scaleK, class: 'evo-mark-count'}, `${k.tested}개`)); }
  for (const k of c.changes) if (idx.has(k.date)) { const cx = x(k.date); svg.append(tip(svgEl('path', {d: `M${cx},${laneEvo - rMark - 1} l${rMark + 1},${rMark + 1} l${-rMark - 1},${rMark + 1} l${-rMark - 1},${-rMark - 1} z`, class: 'evo-change-mark'}), `${korDate(k.date)}: 채택 ${k.adopted} · 되돌림 ${k.rolledBack}`)); }
  for (const k of c.constructions) if (idx.has(k.date)) { const cx = x(k.date); svg.append(tip(svgEl('path', {d: `M${cx - rMark},${laneBuild + rMark - 0.5} l${rMark},${-2 * rMark + 1} l${rMark},${2 * rMark - 1} z`, class: 'evo-build-mark'}), `${korDate(k.date)}: 사람이 고친 공사 ${k.count}건(예측 식은 그대로)`)); }
  // 날짜 눈금: 오늘 → 끝 → 처음 순으로 자리를 잡고, 겹치면 뒤의 것을 뺀다 · 양 끝은 안쪽으로 붙인다
  const placed = [];
  for (const [d, word] of [[c.today, ''], [c.to, '발행 끝'], [c.from, '']]) {
    if (!d || !idx.has(d) || placed.some(p => p.d === d)) continue;
    const tx = x(d), label = `${word ? word + ' ' : ''}${shortDate(d)}`, w = label.length * 7.4 * k, anchor = tx - w / 2 < 2 ? 'start' : tx + w / 2 > W - 2 ? 'end' : 'middle';
    const left = anchor === 'start' ? tx : anchor === 'end' ? tx - w : tx - w / 2;
    if (placed.some(p => left < p.right + 8 && left + w > p.left - 8)) continue;
    placed.push({d, left, right: left + w}); svg.append(svgEl('text', {x: tx, y: H - 10 * k, class: 'evo-tick', 'text-anchor': anchor}, label));
  }
  box.replaceChildren(svg);
}
function evolutionChart(c, sample) {
  const box = h('div', {class: 'evo-chart-box'});
  let lastW = 0, timer = null;
  const redraw = () => { const w = Math.round(box.clientWidth); if (!w || w === lastW) return; lastW = w; drawChart(box, c); };
  if (typeof ResizeObserver !== 'undefined') new ResizeObserver(() => { clearTimeout(timer); timer = setTimeout(redraw, 120); }).observe(box);
  requestAnimationFrame(redraw);
  return h('figure', {class: 'evo-figure'},
    h('figcaption', {class: 'evo-legend'},
      ...[[['line', '선: 첫날부터 그날까지 합친 값'], ['daily', '흐린 점: 그날 하루 값(위로 갈수록 덜 틀림)']], [['test', '시험했지만 안 바꾼 날(숫자 = 시험한 개수)'], ['change', '시장의 답으로 바뀐 날']], [['build', '사람이 장치를 고친 날 — 예측 식은 그대로라 「바뀐 것」에 세지 않음']]]
        .map(row => h('p', {class: 'leg'}, ...row.map(([k, text]) => h('span', {class: 'leg-item'}, h('span', {class: 'evo-key ' + k}), h('span', null, text)))))),
    box,
    h('p', {class: 'muted xs'}, `표본: 채점 ${sample.scoredDays}일 · 1일 뒤 ${num(sample.cellsDistance1)}칸 · ${sample.note}`));
}

/* ---------- 날짜마다 세 박자 ---------- */
const beat = (label, text, cls) => h('span', {class: 'beat ' + cls}, h('span', {class: 'beat-label'}, label), h('span', {class: 'beat-text'}, text));
function distanceTable(d) {
  return h('div', {class: 'evo-dist'}, ...Object.entries(d.byDistance).map(([k, s]) => h('div', {class: 'evo-dist-item'},
    h('p', {class: 'evo-dist-head'}, `${k}일 뒤 예측 · ${s.n}종목`),
    h('p', {class: 'small'}, h('b', {class: s.lessWrongPct >= 0 ? 'ok' : 'warn'}, `「발행일 종가 그대로」보다 ${Math.abs(s.lessWrongPct).toFixed(1)}% ${s.lessWrongPct >= 0 ? '덜' : '더'} 틀림`), h('span', {class: 'muted'}, ` — 가격 차이 평균: ATLAS ${s.atlasAPE.toFixed(2)}% · 「발행일 종가 그대로」 ${s.naiveAPE.toFixed(2)}%`)),
    h('p', {class: 'small'}, `방향 맞힘 ${s.directionHits}개(${pctOf(s.directionRate)})`, h('span', {class: 'muted'}, ` — 동전 던지기(반반)면 ${Math.round(s.n / 2)}개`)),
    h('p', {class: 'small'}, `80% 범위에 담김 ${s.coverage == null ? '—' : pctOf(s.coverage)}`, h('span', {class: 'muted'}, ' — 80%에 가까울수록 좋음(너무 높으면 범위가 헐거움)')))));
}
function dayRow(d, t) {
  const summary = h('summary', null, h('span', {class: 'evo-date'}, korDate(d.date)),
    h('span', {class: 'beats'}, beat('시장이 답했다', d.line.answer, 'answer'), h('span', {class: 'beat-arrow', 'aria-hidden': 'true'}, '→'), beat('배웠다', d.line.learned, 'learned'), h('span', {class: 'beat-arrow', 'aria-hidden': 'true'}, '→'), beat(d.changed?.adopted ? '바꿨다' : d.changed?.rolledBack ? '되돌렸다' : '안 바꿨다', d.line.changed, 'changed')));
  if (!d.scored) return h('details', {class: 'evo-day empty'}, summary, h('p', {class: 'small muted'}, '이 거래일에는 채점 기록이 장부에 없습니다(실행이 없었거나 실패). 빈 날도 지우지 않고 보입니다.'));
  const c = d.classes, ch = d.changed, L = d.learned;
  const answer = h('div', {class: 'evo-beat-detail'}, h('h4', null, '시장이 답했다 — 확인된 사실'),
    h('p', {class: 'small'}, `채점 ${d.evaluated}칸: 둘 다 맞음 ${c[1]} · 방향만 맞음 ${c[2]} · 크기만 맞음 ${c[3]} · 둘 다 틀림 ${c[4]}`, h('span', {class: 'muted xs'}, ' (「크기」 = 가격 차이가 허용 폭 안)')),
    distanceTable(d), ...d.answer.facts.map(f => h('p', {class: 'small'}, f)));
  const learned = h('div', {class: 'evo-beat-detail'}, h('h4', null, '배웠다 — 틀린 까닭의 가설'),
    L.analysisRecorded ? (() => { const box = h('div', {class: 'bars'}); bars(box, [...L.hypotheses.map(x => ({label: x.word, value: x.cells})), {label: '설명 못 함', value: L.unexplainedCells}].sort((a, b) => b.value - a.value), {format: v => v + '칸'}); return h('div', null, box, L.unexplainedMeanShare != null ? h('p', {class: 'muted xs'}, `오차 가운데 시장 전체로 설명 안 되는 몫 평균 ${pctOf(L.unexplainedMeanShare)}`) : null); })() : h('p', {class: 'small muted'}, '그날 원인 분석 기록이 없습니다.'),
    h('p', {class: 'muted xs'}, L.note));
  const changed = h('div', {class: 'evo-beat-detail'}, h('h4', null, (ch.adopted ? '바꿨다' : ch.rolledBack ? '되돌렸다' : '안 바꿨다') + ' — 까닭'),
    ch.tested ? (ch.testsOff ? h('p', {class: 'small muted', 'data-off': 'tests'}, ch.testsOff) : h('p', {class: 'small'}, `고칠 거리 ${ch.tested}개를 과거 120일로 시험 · 떨어짐 ${ch.rejected} · 실전 관찰 ${ch.observing}`)) : null,
    ch.nearMisses.length ? h('div', null, h('p', {class: 'small'}, h('b', null, `한 가지만 모자라 떨어진 것 ${ch.nearMisses.length}개`)), h('ul', {class: 'plain small'}, ...ch.nearMisses.map(n => h('li', null, `${n.label}(${n.familyWord}): `, n.unmet.map(u => u.text).join(' · '))))) : null,
    ch.candidates.length ? h('details', {class: 'more'}, h('summary', null, `시험한 ${ch.candidates.length}개 모두 보기`), h('div', {class: 'table-wrap'}, h('table', {class: 'table small'}, h('thead', null, h('tr', null, ...['고칠 거리', '무엇을 바꿨나', '평균 가격 오차 지금 → 후보', '결과', '모자란 것'].map(x => h('th', null, x)))), h('tbody', null, ...ch.candidates.map(k => h('tr', null, h('td', null, k.label), h('td', null, k.familyWord), h('td', null, `${k.operatingErrorPct?.toFixed(4)}% → ${k.errorPct?.toFixed(4)}%`), h('td', null, k.status ?? k.decision), h('td', null, k.unmet.map(u => u.text).join(' · ') || '—'))))))) : null,
    ch.noTestReason ? h('p', {class: 'small'}, '시험 없음: ' + ch.noTestReason) : null,
    ...(ch.adoptionsDetail ?? []).map(a => h('p', {class: 'small ok'}, `채택: ${a.from} → ${a.modelVersion}`)),
    ...(ch.rollbacksDetail ?? []).map(a => h('p', {class: 'small warn'}, `되돌림: ${a.from} → ${a.to} (${a.reason})`)),
    d.constructions.length ? h('p', {class: 'muted xs'}, `이날 공사 ${d.constructions.length}건은 아래 「공사 기록」에 따로 적었습니다(진화 아님).`) : null);
  return h('details', {class: 'evo-day'}, summary, h('div', {class: 'evo-detail'}, answer, learned, changed));
}

/* ---------- 화면 ---------- */
export async function renderEvolution(main, {manifest} = {}) {
  const [t, ev] = await Promise.all([loadJSON('timeline.json'), loadEvolution().catch(() => null)]);
  const b = t.blocker, s = t.sample, cum = t.chart.cumulative ?? [], last = cum.at(-1), changed = (t.changes.adopted ?? 0) + (t.changes.rolledBack ?? 0);
  const judge = t.chart.judgementDate ? `예측 실력 판정은 채점 ${s.requiredDays}일째인 ${korDate(t.chart.judgementDate)}부터입니다.` : `예측 실력 판정은 채점 ${s.requiredDays}일째부터입니다.`;
  setSummary(`진화. ${last ? `${korDate(last.date)}까지 채점 ${s.scoredDays}일, 1거래일 전망이 발행일 종가 그대로보다 ${pctRaw(Math.abs(last.lessWrongPct))} ${last.lessWrongPct >= 0 ? '덜' : '더'} 틀림.` : '아직 채점한 날이 없습니다.'} 시장의 답으로 바꾼 모델 ${changed}건. ${t.headline.word}. ${judge}${b ? ` 막힘: ${b.line}.` : ''}`);
  const auto = ev?.autoEvolution;
  // ① 헤드라인: 첫 그래프(지금까지 합친 선)의 마지막 값 = 헤드라인 숫자
  const hl = last ? headline({speak: `${korDate(last.date)}까지 채점 ${s.scoredDays}일, 1거래일 전망이 발행일 종가 그대로보다 ${pctRaw(Math.abs(last.lessWrongPct))} ${last.lessWrongPct >= 0 ? '덜' : '더'} 틀림, 시장의 답으로 바꾼 모델 ${changed}건`,
    parts: [`${korDate(last.date)}까지 채점 ${s.scoredDays}일 · 1거래일 전망이 「발행일 종가 그대로」보다 `, {figure: pctRaw(Math.abs(last.lessWrongPct))}, ` ${last.lessWrongPct >= 0 ? '덜' : '더'} 틀림 · 시장의 답으로 바꾼 모델 ${changed}건`],
    source: [['이 숫자', `ATLAS 의 평균 가격 오차율이 「발행일 종가 그대로」의 평균 가격 오차율보다 몇 % 작은가 · 1거래일 뒤 ${num(s.cellsDistance1)}칸을 첫날부터 ${korDate(last.date)}까지 합쳐 셈`], ['발행일 종가 그대로', t.metric.naive], ['쓰임', t.metric.use], ['검산', t.check ? (t.check.ok ? `기록 장부에서 따로 다시 센 ${t.check.checked}곳 모두 같음` : `어긋남 ${t.check.mismatches.length}곳`) : '없음'], ...(manifest ? editionSource(manifest, 'timeline.json') : [])]})
    : headline({parts: ['아직 채점한 날이 없습니다 · 시장의 답으로 바꾼 모델 ', {figure: `${changed}건`}], source: manifest ? editionSource(manifest, 'timeline.json') : []});
  main.replaceChildren(hl,
    h('section', {class: 'card panel evo-hero'},
      h('p', {class: 'evo-question'}, t.question),
      h('p', {class: 'evo-word'}, t.headline.word),
      h('p', {class: 'evo-sentence'}, judge),
      t.tomorrowOnly ? h('p', {class: 'banner off-note', role: 'note', 'data-off': 'tests'}, '꺼 둠 · ', t.tomorrowOnly.testsOff) : null,
      b ? h('details', {class: 'evo-blocker' + (b.needsOwnerDecision ? ' owner' : '')}, h('summary', null, h('span', {class: 'tag'}, '막힘'), h('span', null, b.line)), h('ul', {class: 'plain small'}, ...b.detail.map(x => h('li', null, x)))) : null),
    h('section', {class: 'card'}, h('h2', null, '날짜별 예측 실력 · 1거래일 전망'), evolutionChart(t.chart, s), t.check ? h('p', {class: 'xs ' + (t.check.ok ? 'muted' : 'warn')}, t.check.ok ? `검산: 이 화면의 숫자 ${t.check.checked}곳을 기록 장부에서 따로 다시 세어 모두 같음을 확인했습니다.` : `검산 어긋남 ${t.check.mismatches.length}곳: ` + t.check.mismatches.slice(0, 3).map(m => m.field).join(' · ')) : null),
    h('section', {class: 'card'}, h('h2', null, '날짜마다: 시장이 답했다 → 배웠다 → 바꿨다'), h('p', {class: 'muted small'}, '한 줄을 누르면 박자마다 까닭이 열립니다. 늦은 날짜가 위에 있습니다.'), h('div', {class: 'evo-days'}, ...t.days.map(d => dayRow(d, t)))),
    h('details', {class: 'card more'}, h('summary', null, `공사 기록 ${t.constructions.length}건 열기 — 사람이 고친 장치(진화 아님 · 장부 원문 그대로)`), h('p', {class: 'muted small'}, '시장 결과로 바뀐 것이 아니라, 시장의 답을 더 잘 받고 적으려고 고친 것입니다. 한 줄마다 「그래서 무엇을 더 잘 듣게 됐나」를 적습니다.'),
      h('ol', {class: 'evo-build'}, ...t.constructions.slice().reverse().map(c => h('li', null, h('span', {class: 'evo-date'}, korDate(c.date)), h('div', null, h('b', null, c.title), h('p', {class: 'small'}, '더 잘 듣게 된 점: ' + c.heard), h('p', {class: 'muted xs'}, ...(c.sources?.commits ?? []).flatMap(x => ['커밋 ', h('code', null, x), ' · ']), ...(c.sources?.docs ?? []).flatMap(x => [h('code', null, x), ' · ']), c.recordedLater ? '나중에 적음' : '')))))),
    h('details', {class: 'card more evo-expert'}, h('summary', null, '전문가용 — 운영 식 · 채택 규칙 · 잣대 식'),
      ev?.operating ? h('pre', {class: 'formula'}, ev.operating.formula.join('\n')) : null,
      auto?.config ? h('ul', {class: 'plain small'}, h('li', null, '핵심 규칙: ' + auto.config.adoption.coreRule), ...Object.entries(auto.config.adoption.gates).map(([k, rule]) => h('li', null, `관문 ${k}: ${rule}`)), h('li', null, '불확실성: ' + auto.config.adoption.uncertainty), auto.config.liveObservation ? h('li', null, `실전 관찰: ${auto.config.liveObservation.rule} · 최소 ${auto.config.liveObservation.minScoredDates} 채점일`) : null) : null,
      h('p', {class: 'small'}, `잣대 식: ${t.metric.formula} · 「발행일 종가 그대로」 = ${t.metric.naive} · ${t.metric.use}`),
      h('p', {class: 'small'}, `판정 규칙: ${t.verdict.rule}`),
      h('p', {class: 'small'}, h('a', {href: '#/records'}, '기록 검색에서 실험·모델·요인 기록 전체 보기·내려받기 ›')),
      h('p', {class: 'muted xs'}, `근거: ${t.sources.ledger} · ${t.sources.config} · 대표 셀: ${t.sources.headlineRule} · 만든 시각 ${t.generatedAt}`)));
}
