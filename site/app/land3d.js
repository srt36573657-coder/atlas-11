/* ATLAS 11 · 「후보 7」 입체 땅 — 사장님 2026-10-09 08:26(마카오 시각) 「현재 있는 아틀란스 개선한다 넘 글이 많다 잡스였다면 어떻게 개선했을까? 입체적으로 보여야하는 중심으로 기획해서 만들어봐라」
   한 장으로 읽히게(잡스라면 — 한 장면 · 한 생각): 돈이 빠진 땅은 꺼지고(파랑) · 돈이 들어온 땅은 솟고(빨강) · 솟은 땅 위에 후보가 탑으로 선다
   · 땅 높이 · 깊이 = 돈 흐름(업종 순환)의 금액 — 시장 대비 시가총액 몫 변화(실제 투자금 아님) · 늘어난 곳 · 줄어든 곳 같은 잣대(0부터 · 곧은 비례)
   · 탑 높이 = 외국인+기관 10거래일 순매수 ÷ 시가총액(추정 · 같은 잣대 · 0부터 · 곧은 비례) · 탑 색 = 상태(초록 조건 충족 · 모래 조건 대기 · 회색 재검토 — 값의 빨강 · 파랑과 다른 뜻)
   · 그림 안에는 글자가 없음 — 업종 이름 · 금액 · 순위 숫자는 그림 위 HTML(늘 또렷함 · 말 바꾸기 · 소리로 읽기)
   · 탑 · 순위 동그라미를 누르면 그 한 곳만 아래 카드로(설명은 한 번에 한 가지) — 같은 일을 하는 단추는 아래 줄 일곱(키보드 · 화면 읽기)
   · 걸음(재생): 0 땅(꺼짐 · 솟음) → 1 탑 → 카드의 위험 줄 → 카드의 다음 단추 — 한 걸음에 움직이는 것은 하나(규칙 42) */
import {h, finite} from './util.js';
import {keyEl} from './charts.js';

const L = 50, K = 59, M = 100, T = 13, GAP = 15, TMAX = 110, GMAX = 26, FLOOR = 3; // 땅 한 변 · 땅 사이 · 앞뒤 줄 사이 · 탑 한 변 · 탑 사이 · 가장 높은 탑 · 가장 큰 땅 높이(깊이) · 가장 낮게 그리는 높이
const P = (x, y, z) => [x - y, (x + y) / 2 - z]; // 보는 쪽이 (+x, +y) 인 2:1 입체(등축) — 화면 x = x − y · 화면 y = (x + y)/2 − z
const pts = arr => arr.map(([x, y, z]) => P(x, y, z).map(v => v.toFixed(1)).join(',')).join(' ');
const poly = (cls, arr) => `<polygon class="${cls}" points="${pts(arr)}"/>`;
/** 상자 — 바닥 [x0,x1]×[y0,y1] · 높이 z0 → z1 · 보이는 면 셋(위 · 왼쪽 = y1 면 · 오른쪽 = x1 면) */
function box(cls, x0, x1, y0, y1, z0, z1) {
  return poly(cls + '-l', [[x0, y1, z1], [x1, y1, z1], [x1, y1, z0], [x0, y1, z0]]) + poly(cls + '-r', [[x1, y0, z1], [x1, y1, z1], [x1, y1, z0], [x1, y0, z0]])
    + poly(cls + '-t', [[x0, y0, z1], [x1, y0, z1], [x1, y1, z1], [x0, y1, z1]]);
}
/** 꺼진 땅 — 구멍 바닥(z = −d) · 안쪽 뒷벽 둘 · 구멍 입구 밖은 그리지 않음(입구 모양으로 자름) */
function pit(id, x0, x1, y0, y1, d) {
  return `<clipPath id="${id}"><polygon points="${pts([[x0, y0, 0], [x1, y0, 0], [x1, y1, 0], [x0, y1, 0]])}"/></clipPath><g clip-path="url(#${id})">`
    + poly('l3-dn-f', [[x0, y0, -d], [x1, y0, -d], [x1, y1, -d], [x0, y1, -d]])
    + poly('l3-dn-w1', [[x0, y0, 0], [x0, y1, 0], [x0, y1, -d], [x0, y0, -d]])
    + poly('l3-dn-w2', [[x0, y0, 0], [x1, y0, 0], [x1, y0, -d], [x0, y0, -d]]) + '</g>'
    + poly('l3-dn-lip', [[x0, y0, 0], [x1, y0, 0], [x1, y1, 0], [x0, y1, 0]]);
}
const tile = (x0, x1, y0, y1, pad = 6) => poly('l3-tile', [[x0 - pad, y0 - pad, 0], [x1 + pad, y0 - pad, 0], [x1 + pad, y1 + pad, 0], [x0 - pad, y1 + pad, 0]]);
let seq = 0;

/**
 * C = 판 읽기 후보 묶음(lens.cand · 규칙 cand-rules-2) · fmt = 억 원 금액 글(「+25.0조」) · sel = 고른 종목 기호 · onPick(code)
 * 반환 {el, setSel(code), check} — check = 그림이 그린 값(검사기가 /story.json · 판 읽기로 따로 셈한 값과 맞댐)
 */
export function candLand(C, {fmt, sel = null, onPick = () => {}} = {}) {
  const secs = (C?.flow?.sectors ?? []).slice(0, 3), outs = (C?.flow?.out ?? []).slice(0, 3), items = C?.items ?? [];
  const amax = Math.max(1, ...secs.map(s => Math.abs(s.amount ?? 0)), ...outs.map(s => Math.abs(s.amount ?? 0)));
  const gh = a => (finite(a) && a !== 0 ? Math.max(FLOOR, GMAX * Math.abs(a) / amax) : 0); // 땅 높이 · 깊이(같은 잣대)
  const pmax = Math.max(...items.map(x => (finite(x.flow?.power) && x.flow.power > 0 ? x.flow.power : 0)), 1e-9);
  const th = p => (finite(p) && p > 0 ? Math.max(4, TMAX * p / pmax) : 4); // 탑 높이(같은 잣대 · 0부터)
  const col = i => ({cx: (i - 1) * K, cy: -(i - 1) * K}); // 칸 i 의 땅 가운데(월드) — 화면에서 가로로 나란히
  const id = `l3c${++seq}`;
  let ground = '', towers = '';
  const labs = [], plates = [], pits = [], tws = [];
  // 앞줄(아래) — 꺼진 땅: 돈이 빠진 업종 1위~3위
  outs.forEach((s, i) => {
    const {cx, cy} = col(i), x0 = cx + M - L / 2, y0 = cy + M - L / 2, d = gh(s.amount);
    ground += tile(x0, x0 + L, y0, y0 + L) + pit(`${id}p${i}`, x0, x0 + L, y0, y0 + L, d);
    const [sx, sy] = P(x0 + L, y0 + L, 0);
    labs.push({cls: 'l3-lab l3-out', x: sx, y: sy + 8, name: s.label, amt: fmt(s.amount), g: s.id});
    pits.push([s.label, Math.round(s.amount)]);
  });
  // 뒷줄(위) — 솟은 땅: 돈이 들어온 업종 1위~3위(조건을 못 넘은 업종은 낮은 빗금 땅 · 탑 없음)
  const topOf = []; // 탑 순위 동그라미 자리
  secs.forEach((s, i) => {
    const {cx, cy} = col(i), x0 = cx - L / 2, y0 = cy - L / 2, hp = gh(s.amount);
    ground += tile(x0, x0 + L, y0, y0 + L) + box(s.ok ? 'l3-up' : 'l3-off', x0, x0 + L, y0, y0 + L, 0, hp);
    const [sx, sy] = P(x0 + L, y0 + L, 0);
    labs.push({cls: 'l3-lab l3-in' + (s.ok ? '' : ' l3-no'), x: sx, y: sy + 8, name: s.label, amt: fmt(s.amount), g: s.id});
    plates.push([s.label, Math.round(s.amount), !!s.ok]);
    const mine = items.filter(x => x.flow?.sector?.id === s.id).sort((a, b) => a.rank - b.rank);
    mine.forEach((x, j) => {
      const p = (j - (mine.length - 1) / 2) * GAP, tx = cx + p - T / 2, ty = cy - p - T / 2, hh = th(x.flow?.power);
      const st = x.status === 'met' ? 'met' : x.status === 'wait' ? 'wait' : 're';
      tws.push({x, st, tx, ty, z0: hp, h: hh, key: tx + ty});
      const [bx, by] = P(tx + T / 2, ty + T / 2, hp + hh); // 탑 윗면 가운데
      topOf.push({code: x.code, rank: x.rank, st, x: bx, y: by - T / 2 - 4});
    });
  });
  // 탑은 뒤(화면 위)부터 그림 — 같은 줄은 왼쪽부터
  tws.sort((a, b) => a.key - b.key || (a.tx - a.ty) - (b.tx - b.ty));
  for (const t of tws) towers += `<g class="l3-tw l3-tw-${t.st}" data-code="${t.x.code}" data-rank="${t.x.rank}" data-h="${t.h.toFixed(2)}" data-pow="${finite(t.x.flow?.power) ? t.x.flow.power : ''}">${box('l3-' + t.st, t.tx, t.tx + T, t.ty, t.ty + T, t.z0, t.z0 + t.h)}</g>`;
  // 그림 크기 — 모든 점 + 이름표 자리
  const ys = [...topOf.map(r => r.y - 28), -(L / 2 + 6 + GMAX + 10)], ye = Math.max(...labs.map(l => l.y + 46), 150); // 위 = 순위 동그라미 · 땅 윗면 · 아래 = 이름표 두 줄
  const vb = {x: -180, y: Math.floor(Math.min(...ys)) - 4, w: 360, h: 0}; vb.h = Math.ceil(ye - vb.y);
  const svg = `<svg class="l3-svg" viewBox="${vb.x} ${vb.y} ${vb.w} ${vb.h}" role="img" aria-label="돈이 빠진 업종은 꺼진 땅 · 돈이 들어온 업종은 솟은 땅 · 그 위 후보 탑">`
    + `<g class="l3-g0" data-at="0">${ground}</g><g class="l3-g1" data-at="1">${towers}</g></svg>`;
  const at = (el, x, y) => { el.style.setProperty('--x', `${(((x - vb.x) / vb.w) * 100).toFixed(2)}%`); el.style.setProperty('--y', `${(((y - vb.y) / vb.h) * 100).toFixed(2)}%`); return el; };
  // 이름표 — 한국어 · 보통 글씨면 땅 바로 아래(그림 위 HTML) · 다른 말이나 큰 글씨면 그림 아래 세 칸(같은 차례 · 겹치지 않게 — lens.css)
  const over = h('div', {class: 'l3-over'},
    ...labs.map(l => at(h('a', {class: l.cls, href: '#/i/' + l.g, 'aria-label': `${l.name} ${l.amt} — 업종 화면`}, h('b', {class: 'l3-nm'}, l.name), h('span', {class: 'l3-amt'}, l.amt)), l.x, l.y)));
  const badges = h('div', {class: 'l3-badges'}, ...topOf.map(r => at(h('span', {class: `l3-rk l3-rk-${r.st}`, 'data-code': r.code, 'data-n': String(r.rank), 'aria-hidden': 'true'}), r.x, r.y)));
  const stage = h('div', {class: 'l3-stage', html: svg}); stage.append(badges); // 순위 동그라미는 그림 칸(stage)에 붙임 — 이름표가 그림 아래로 내려가도 자리가 그대로
  const scene = h('div', {class: 'l3'}, stage, over);
  const key = keyEl([{cls: 'up', label: '솟은 땅 = 돈이 들어온 업종'}, {cls: 'down', label: '꺼진 땅 = 빠진 업종'},
    {cls: 'met', label: '탑 높이 = 외국인+기관 순매수 ÷ 회사 크기'}, {cls: 'wait', label: '모래색 = 조건 대기'}]);
  const note = h('p', {class: 'muted xs l3-note'}, `땅 금액 = ${C?.flowDays ?? 10}거래일 시장 대비 시가총액 몫 변화(실제 투자금 아님) · 순매수 금액은 추정`);
  const el = h('div', {class: 'l3-wrap'}, scene, key, note);
  const pick = e => { const t = e.target.closest?.('[data-code]'); if (t && scene.contains(t)) onPick(t.dataset.code); };
  scene.addEventListener('click', pick);
  function setSel(code, picked = false) { // picked = 사람이 고름(그때부터 다른 탑을 조금 흐리게 — 처음에는 모두 또렷)
    for (const g of scene.querySelectorAll('.l3-tw')) g.classList.toggle('sel', g.dataset.code === code);
    for (const b of scene.querySelectorAll('.l3-rk')) b.classList.toggle('sel', b.dataset.code === code);
    if (picked) scene.classList.add('picked');
  }
  setSel(sel);
  const check = {plates, pits, towers: items.map(x => [x.code, x.rank, x.status, finite(x.flow?.power) ? Math.round(x.flow.power * 100) / 100 : null])}; // 세기는 화면 글과 같은 소수 둘째 자리
  return {el, setSel, check};
}
