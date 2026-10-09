/* ATLAS 11 · 「후보 7」 입체 그림 — 사장님 2026-10-09 08:26(마카오 시각) 「현재 있는 아틀란스 개선한다 넘 글이 많다 잡스였다면 어떻게 개선했을까? 입체적으로 보여야하는 중심으로 기획해서 만들어봐라」
   · 11:35 「전종목 365개 … 돈에 유입이 강력한 7개」(규칙 4판) — 업종 땅 셋(솟은 땅 · 꺼진 땅) 대신 탑 일곱이 한 줄(아래 candLand) · 아래 옛 설명은 3판까지의 땅
   한 장으로 읽히게(잡스라면 — 한 장면 · 한 생각): 돈이 빠진 땅은 꺼지고(파랑) · 돈이 들어온 땅은 솟고(빨강) · 솟은 땅 위에 후보가 탑으로 선다
   · 땅 높이 · 깊이 = 돈 흐름(업종 순환)의 금액 — 시장 대비 시가총액 몫 변화(실제 투자금 아님) · 늘어난 곳 · 줄어든 곳 같은 잣대(0부터 · 곧은 비례)
   · 탑 높이 = 지난 10거래일을 1만 번 다시 뽑아 같은 규칙으로 7곳을 골랐을 때 이 회사가 든 횟수(규칙 cand-rules-3 · 2026-10-09 10:14 「모테카를로 … 소거법」)
     — 0부터 · 곧은 비례 · 빈 틀 = 1만 번(꽉 차면 매번 듦) · 탑 색 = 상태(초록 조건 충족 · 모래 조건 대기 · 회색 재검토 — 값의 빨강 · 파랑과 다른 뜻)
   · 그림 안에는 글자가 없음 — 업종 이름 · 금액 · 순위 숫자는 그림 위 HTML(늘 또렷함 · 말 바꾸기 · 소리로 읽기)
   · 탑 · 순위 동그라미를 누르면 그 한 곳만 아래 카드로(설명은 한 번에 한 가지) — 같은 일을 하는 단추는 아래 줄 일곱(키보드 · 화면 읽기)
   · 걸음(재생): 0 땅(꺼짐 · 솟음) → 1 탑 → 카드의 위험 줄 → 카드의 다음 단추 — 한 걸음에 움직이는 것은 하나(규칙 42) */
import {h, finite} from './util.js';
import {keyEl} from './charts.js';

const P = (x, y, z) => [x - y, (x + y) / 2 - z]; // 보는 쪽이 (+x, +y) 인 2:1 입체(등축) — 화면 x = x − y · 화면 y = (x + y)/2 − z
const pts = arr => arr.map(([x, y, z]) => P(x, y, z).map(v => v.toFixed(1)).join(',')).join(' ');
const poly = (cls, arr) => `<polygon class="${cls}" points="${pts(arr)}"/>`;
/** 상자 — 바닥 [x0,x1]×[y0,y1] · 높이 z0 → z1 · 보이는 면 셋(위 · 왼쪽 = y1 면 · 오른쪽 = x1 면) */
function box(cls, x0, x1, y0, y1, z0, z1) {
  return poly(cls + '-l', [[x0, y1, z1], [x1, y1, z1], [x1, y1, z0], [x0, y1, z0]]) + poly(cls + '-r', [[x1, y0, z1], [x1, y1, z1], [x1, y1, z0], [x1, y0, z0]])
    + poly(cls + '-t', [[x0, y0, z1], [x1, y0, z1], [x1, y1, z1], [x0, y1, z1]]);
}
const tile = (x0, x1, y0, y1, pad = 6) => poly('l3-tile', [[x0 - pad, y0 - pad, 0], [x1 + pad, y0 - pad, 0], [x1 + pad, y1 + pad, 0], [x0 - pad, y1 + pad, 0]]);

/**
 * 규칙 5판(2026-10-09 15:21 「만들어 줘」 — 기르기판) · 탑 높이 = 1년 추세(마지막 1달 뺌 · 0부터 곧은 비례) · 빈 틀 = 7곳 가운데 가장 센 1년 추세
 * (4판 2026-10-09 11:35 까지는 탑 높이 = 20만 번 다시 뽑아 7곳에 든 횟수 · 빈 틀 = 20만 번) — 업종 땅 셋 대신 탑 일곱이 한 줄
 *   C = 판 읽기 후보 묶음(lens.cand · 규칙 cand-rules-4) · sel = 고른 종목 기호 · onPick(code)
 *   · 탑 하나마다 작은 받침 — 받침 색 = 그 회사 업종의 돈 흐름(곁 정보 · 빨강 들어온 업종 1~3위 · 파랑 빠진 업종 1~3위 · 회색 그 밖)
 *   · 탑 높이 = 20만 번 다시 뽑아 7곳에 든 횟수(0부터 · 곧은 비례) · 점선 빈 틀 = 20만 번 · 탑 색 = 상태 · 순위 동그라미는 틀 위 · 그림 안 글자 없음(이름은 아래 줄)
 * 반환 {el, setSel(code), check} — check = 그림이 그린 값(검사기가 /story.json · 판 읽기로 따로 셈한 값과 맞댐)
 */
export function candLand(C, {sel = null, onPick = () => {}} = {}) {
  const items = C?.items ?? [], n = items.length, mOf = x => (finite(x.grow?.m12) ? x.grow.m12 : null);
  const top = Math.max(1, ...items.map(mOf).filter(finite)); // 빈 틀 = 7곳 가운데 가장 센 1년 추세(%)
  const PL = 22, KR = 24, TT = 12, TOP = 110, BASE = 4; // 받침 한 변 · 칸 사이(월드) · 탑 한 변 · 빈 틀 높이 · 받침 높이
  const th = v => (finite(v) && v > 0 ? Math.max(4, TOP * v / top) : 4);
  const mid = (n - 1) / 2, badges = [], plates = [];
  let ground = '', towers = '';
  items.forEach((x, i) => {
    const cx = (i - mid) * KR, cy = -(i - mid) * KR, x0 = cx - PL / 2, y0 = cy - PL / 2, dir = x.flow?.sector?.dir ?? 'mid';
    ground += tile(x0, x0 + PL, y0, y0 + PL, 3) + box(dir === 'in' ? 'l3-up' : dir === 'out' ? 'l3-blue' : 'l3-off', x0, x0 + PL, y0, y0 + PL, 0, BASE);
    plates.push([x.flow?.sector?.label ?? null, dir]);
    const st = x.status === 'met' ? 'met' : x.status === 'wait' ? 'wait' : 're', tx = cx - TT / 2, ty = cy - TT / 2, hh = th(mOf(x));
    towers += `<g class="l3-tw l3-tw-${st}" data-code="${x.code}" data-rank="${x.rank}" data-h="${hh.toFixed(2)}" data-m12="${finite(mOf(x)) ? mOf(x).toFixed(4) : ''}" data-of="${top.toFixed(4)}" data-dir="${dir}">`
      + box('l3-gh', tx, tx + TT, ty, ty + TT, BASE, BASE + TOP) + box('l3-' + st, tx, tx + TT, ty, ty + TT, BASE, BASE + hh) + '</g>'; // 빈 틀(가장 센 1년 추세) 먼저 · 찬 만큼 탑
    const [bx, by] = P(cx, cy, BASE + TOP);
    badges.push({code: x.code, rank: x.rank, st, x: bx, y: by - TT / 2 - 4});
  });
  const span = Math.max(1, n) * KR + PL, vb = {x: -180, y: Math.floor(-(BASE + TOP) - 34), w: 360, h: 0};
  vb.h = Math.ceil(PL + 30 - vb.y); // 아래 = 받침 앞 모서리 + 여유
  const svg = `<svg class="l3-svg" viewBox="${vb.x} ${vb.y} ${vb.w} ${vb.h}" role="img" aria-label="후보 탑 ${n}개 — 높이 = 1년 추세 · 빈 틀 = 7곳 가운데 가장 센 1년 추세 · 받침 색 = 업종 돈 흐름" data-span="${span}">`
    + `<g class="l3-g0" data-at="0">${ground}</g><g class="l3-g1" data-at="1">${towers}</g></svg>`;
  const at = (el, x, y) => { el.style.setProperty('--x', `${(((x - vb.x) / vb.w) * 100).toFixed(2)}%`); el.style.setProperty('--y', `${(((y - vb.y) / vb.h) * 100).toFixed(2)}%`); return el; };
  const bd = h('div', {class: 'l3-badges'}, ...badges.map(r => at(h('span', {class: `l3-rk l3-rk-${r.st}`, 'data-code': r.code, 'data-n': String(r.rank), 'aria-hidden': 'true'}), r.x, r.y)));
  const stage = h('div', {class: 'l3-stage', html: svg}); stage.append(bd);
  const scene = h('div', {class: 'l3 l3-row'}, stage);
  const pct = v => `${v > 0 ? '+' : v < 0 ? '−' : ''}${Math.abs(v).toFixed(1)}%`;
  const key = keyEl([{cls: 'met', label: '탑 높이 = 1년 추세'}, {cls: 'ghost', label: `빈 틀 = 7곳 가운데 가장 센 ${pct(top)}`}, {cls: 'wait', label: '모래색 탑 = 그물 밖'},
    {cls: 'up', label: '빨간 받침 = 돈이 들어온 업종'}, {cls: 'down', label: '파란 받침 = 돈이 빠진 업종'}]);
  const note = h('p', {class: 'muted xs l3-note'}, `탑 = 1년 추세 상위 ${C?.netPct ?? 20}% 그물에 새로 든 초입 · 회색 받침 = 업종 돈 흐름 1위~3위 밖(곁 정보) · 1년 추세 = 252거래일 전 종가에서 20거래일 전 종가까지 몇 % 올랐나(지난 기록 · 앞날 아님)`);
  const el = h('div', {class: 'l3-wrap'}, scene, key, note);
  scene.addEventListener('click', e => { const t = e.target.closest?.('[data-code]'); if (t && scene.contains(t)) onPick(t.dataset.code); });
  function setSel(code, picked = false) { // picked = 사람이 고름(그때부터 다른 탑을 조금 흐리게 — 처음에는 모두 또렷)
    for (const g of scene.querySelectorAll('.l3-tw')) g.classList.toggle('sel', g.dataset.code === code);
    for (const b of scene.querySelectorAll('.l3-rk')) b.classList.toggle('sel', b.dataset.code === code);
    if (picked) scene.classList.add('picked');
  }
  setSel(sel);
  const check = {plates, towers: items.map(x => [x.code, x.rank, x.status, finite(x.grow?.m12D) ? x.grow.m12D : null])}; // 받침 = [업종, 돈 흐름 방향] · 탑 = 1년 추세(%) — 판이 먼저 소수 첫째 자리로 셈한 값
  return {el, setSel, check};
}
