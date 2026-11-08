/* 수르 값 그래프 틀 — 잡스 판(주문 2011 · 사장님 2026-11-08 20:11 「제 처음부터 끝까지 모든 페이지를 첫페이지 기준으로 모두 변경해」)
   옛 무하 포스터 틀(su-mucha.js frame — 아치 창 · 메달 · 덩굴)을 덜어 낸 판: 흰 바탕 · 맨 위 호박색 점 하나와 이름 한 줄 · 가는 선 · 그 아래 쪽의 값 그래프 그대로
   그래프는 복사해 담음(모양 · 값 · 차례 그대로 · 원본은 「자세히」 서랍에 그대로) · 넓이 390 그대로(글 크기 그대로) · 숨 쉬는 빛 하나(움직임 줄이기면 멈춤)
   쓰는 곳: su.js frameHero · framed(오늘 꽃 조건 · 업종 한 달 · 꽃이 못 된 까닭 · 날마다 · 해마다 · 가까운 회사) */
import {s} from '/su/su-fig.js';

export const CSS = '/su/su-frame-jobs.css';
const W = 390;
let UID = 0;
const f1 = v => Math.round(v * 10) / 10;
const viewOf = svg => { const v = String(svg?.getAttribute?.('viewBox') ?? '').trim().split(/[\s,]+/).map(Number); return v.length === 4 && v.every(Number.isFinite) && v[2] > 0 && v[3] > 0 ? v : null; };
function chartSvg(chart) {
  if (!chart || typeof chart !== 'object') return null;
  if (chart.localName === 'svg') return chart;
  return typeof chart.querySelector === 'function' ? (chart.querySelector('svg.su-svg') ?? chart.querySelector('svg')) : null;
}

/** 틀 — chart = 쪽의 값 그래프(svg 또는 그것을 담은 figure) · title = 이름 한 줄 · kind · tone 은 옛 틀과 같은 이름(표시만) */
export function frame(chart, {title = null, kind = 'line', tone = 'calm'} = {}) {
  const id = 'sfj' + (++UID), src = chartSvg(chart), vb = viewOf(src);
  const T = typeof title === 'string' && title.trim() ? title.trim() : '확인 필요';
  const TOP = 86, k = vb ? Math.min(1, W / vb[2]) : 1, ch = vb ? vb[3] * k : 120, H = Math.max(TOP + ch + 28, 560);
  const svg = s('svg', {class: 'su-svg su-frame-jobs', viewBox: `0 0 ${W} ${f1(H)}`, role: 'img', preserveAspectRatio: 'xMidYMid meet', 'data-clean': 'jobs', 'data-kind': String(kind), 'data-tone': String(tone),
    'aria-label': [T, src?.getAttribute?.('aria-label')].filter(Boolean).join(' — ')});
  svg.append(s('defs', {}, s('radialGradient', {id: id + 'g'}, s('stop', {offset: 0, class: 'sfj-g0'}), s('stop', {offset: 0.55, class: 'sfj-g1'}), s('stop', {offset: 1, class: 'sfj-g2'}))),
    s('rect', {x: 0, y: 0, width: W, height: f1(H), class: 'sfj-bg'}));
  const tw = Math.min(300, [...T].length * 20.5), dx = W / 2 - tw / 2 - 18;
  svg.append(s('g', {class: 'sfj-head sfj-in'},
    s('circle', {cx: f1(dx), cy: 40, r: 26, fill: `url(#${id}g)`, class: 'sfj-glow'}),
    s('circle', {cx: f1(dx), cy: 40, r: 6.5, class: 'sfj-dot'}),
    s('text', {x: f1(dx + 18), y: 47, class: 'sfj-title', text: T}),
    s('path', {d: `M20 ${TOP - 14}H${W - 20}`, class: 'sfj-rule'})));
  if (vb) {
    const body = src.cloneNode(true);
    const g = s('g', {class: 'sfj-chart sfj-fade', transform: `translate(${f1((W - vb[2] * k) / 2)} ${TOP}) scale(${+k.toFixed(5)})` + (vb[0] || vb[1] ? ` translate(${-vb[0]} ${-vb[1]})` : '')});
    while (body.firstChild) g.append(body.firstChild);
    svg.append(g);
  } else svg.append(s('text', {x: W / 2, y: TOP + 60, 'text-anchor': 'middle', class: 'sfj-need', text: '자료 확인 필요'}));
  return svg;
}

/* 부품 꼴(load · picture — 다른 그림 부품과 같게) — 이 틀은 쪽이 frame() 으로 부름 · 따로 부르면 「확인 필요」 틀 */
export async function load() { return {title: '확인 필요'}; }
export function picture(d = {}, opt = {}) { return frame(d?.chart ?? null, {title: d?.title ?? '확인 필요', kind: opt.kind ?? 'line', tone: opt.tone ?? 'calm'}); }
