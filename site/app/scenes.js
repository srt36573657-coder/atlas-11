/* ATLAS 11 · 화면마다 그림 한 장(규칙 33) — 사장님 2026-10-08 01:27 「자 이런식으로 모두 첫페이지부터 마지막까지 다해 전나라 · 다 한다」
   · 01:31 「대충했던 모든 곳을 점검해서 더 정확히 · 시스템으로 그짓 못하게 해」 — 그림 속 숫자는 판 자료에서 그대로(그림마다 data-* 에 실은 값을 검사기가 판 자료로 다시 셈해 맞댐)
   · 「돈의 이동」(rotation.js · 규칙 32)과 같은 말씨: 청자 · 금 · 먹 · 달 · 붉은 낙관 / 글자는 그림 밖 HTML(이름 · 숫자만) / 한 번에 하나 · 기승전결 넷 · 다시 보기 · 소리로 듣기(art.js)
   · 옛 논평 무대(comment.js commentBox — 문장 · 거대 숫자 · 점)를 이 그림이 대신한다(규칙 1 · 넣으면서 뺀 것) — 셈(무엇을 말할지)은 comment.js 그대로(시험 tests/atlas11/comment.test.mjs)
   그림 열셋:
     지도 · 갈래  — 산수화 봉우리(물 위 = 오른 땅 · 물에 비친 푸른 그림자 = 내린 땅 · 가장 높은 봉우리 위에 붉은 해) · 가운데가 1위(가운데부터 좌우로)
     업종        — 방패연 다섯(높이 = 지난 20거래일 변화 · 실이 한 손으로 모임 · 점선 = 업종 평균 · 1위 연에 금빛)
     회사        — 먹 붓질(업종 회사들의 지난 20거래일 선 · 이 회사는 금빛 한 획 · 끝에 달)
     예비        — 매화 가지(꽃 하나 = 한 곳 · 꽃 크기 = 공통점 수 · 가지 끝 = 1위)
     오름 상위   — 풍등(등 하나 = 한 곳 · 높이 = 변화 · 점선 = 마지막 자리 문턱)
     출목표      — 구슬 두 그릇(붉은 구슬 = 오른 곳 · 푸른 구슬 = 내린 곳 · 금 구슬 = 1위)
     일정        — 달이 그날로(점 하나 = 하루 · 그날 위 별 = 중요도)
     찾기        — 다섯 나라 등불(크기 = 회사 수 · 지금 판 등에 불)
     기록        — 매듭 끈(매듭 하나 = 하루 · 크기 = 그날 기록 수 · 가장 새 매듭에 금빛)
     처음        — 물결 깊이(보통 회사 골 · 다섯 곳 골 = 가장 깊게 떨어진 때)
     안내        — 해시계(앙부일구 · 하루 시간 띠: 정규장 금빛 · NXT 옥빛 · 15:30 종가에 해)
     긴 눈       — 항아리 여섯(10 · 20 · 30년 · 주식 청자 · 아파트 백자 · 점선 = 처음 500만 원)
     한국 순위   — 돌계단 25(한 칸 = 한 시장 · 한국 등불이 오른 자리) */
import {h, korDate, pct, finite, signCls} from './util.js';
import {artStage, artSection, defs, hills, chgEl, sealEl, coName, grName, p1, JAR, star} from './art.js';
import {familiesByRise, familyOf, riseDesc, meanOf} from './family.js';
import {plain} from './comment.js';

/* ── 작은 도구 ── */
const F = v => (Math.round(v * 10) / 10).toFixed(1); // 좌표 소수 한 자리
/** 가운데부터 좌우로 — 차례 k 의 자리 번호(0 … n−1) · 1위가 가운데 */
export const centerOut = n => [...Array(n).keys()].sort((a, b) => Math.abs(a - (n - 1) / 2) - Math.abs(b - (n - 1) / 2) || a - b);
const tag = t => h('p', {class: 'ra-tag'}, t);
const longCls = t => (String(t).length > 12 ? ' ra-long2' : String(t).length > 6 ? ' ra-long' : '');
const lab = (...cols) => { const xs = cols.filter(Boolean); return h('div', {class: 'ra-lab' + (xs.filter(x => !x.classList.contains('ra-srow')).length === 1 ? ' ra-one' : '')}, ...xs); };
/** 낙관 한 줄(두 칸 너비) */
const srow = seal => h('div', {class: 'ra-srow'}, seal);
const col = (side, ...kids) => h('div', {class: `ra-col ${side === 'a' ? 'ra-ca' : 'ra-cb'}`}, ...kids.filter(Boolean));
const big = (t, s = 0) => h('p', {class: 'ra-big' + (s > 0 ? ' up' : s < 0 ? ' down' : '')}, t);
/** 그림 속 숫자를 검사기가 맞댈 수 있게 — data-check='{"k":v}' (화면에 보이지 않음 · 읽기 프로그램도 건너뜀) */
const check = (el, obj) => { el.dataset.check = JSON.stringify(obj); return el; };
const when = d => (d ? `${korDate(d)} 종가` : null);

/* ═════════ 1. 산수화 봉우리 — 지도(땅 12개) · 갈래(업종 n개) ═════════ */
const peakPath = (x, base, hh, bw) => `M${F(x - bw)},${F(base)} C${F(x - bw * 0.5)},${F(base)} ${F(x - bw * 0.28)},${F(base - hh * 0.92)} ${F(x)},${F(base - hh)} C${F(x + bw * 0.28)},${F(base - hh * 0.92)} ${F(x + bw * 0.5)},${F(base)} ${F(x + bw)},${F(base)} Z`;
function peaksSvg(p, vals) {
  const H = 200, n = vals.length, pos = vals.filter(v => v > 0), neg = vals.filter(v => v < 0);
  const wy = neg.length ? 136 : 166, upMax = wy - 40, dnMax = H - wy - 10;
  const mp = pos.length ? Math.max(...pos) : 0, mn = neg.length ? Math.max(...neg.map(v => -v)) : 0;
  const sc = Math.min(mp ? upMax / mp : Infinity, mn ? dnMax / mn : Infinity, 1e6);
  const slots = centerOut(n), W = 336 / n, bwAll = Math.max(W * 1.75, 36); // 밑이 넓은 봉우리 — 서로 겹쳐 산줄기가 됨(가운데 큰 산 · 둘레 작은 산)
  const xs = vals.map((_, k) => 12 + W * (slots[k] + 0.5));
  const ups = [], dns = [], ridges = [];
  vals.forEach((v, k) => {
    const x = xs[k], hh = Math.max(3, Math.abs(v) * sc), bw = Math.max(14, Math.min(bwAll, x - 2, 358 - x)); // 그림 밖으로 나가지 않게(끝 봉우리는 밑이 좁아짐 · 말 73개 검사가 잡음)
    if (v > 0) { ups.push(`<path d="${peakPath(x, wy, hh, bw)}" fill="url(#${p}-pk${k === 0 ? '1' : ''})" stroke="${k === 0 ? '#F2C46B' : '#0B1411'}" stroke-width="${k === 0 ? 1.2 : 0.8}" stroke-opacity="${k === 0 ? 0.9 : 0.6}"/>`);
      ridges.push(`<path d="M${F(x - bw * 0.42)},${F(wy - hh * 0.3)} Q${F(x - bw * 0.16)},${F(wy - hh * 0.62)} ${F(x)},${F(wy - hh)}" fill="none" stroke="#F4F1EA" stroke-opacity=".28" stroke-width=".9"/>`); }
    else if (v < 0) dns.push(`<path d="${peakPath(x, wy, -hh, bw)}" fill="url(#${p}-dn)" stroke="#0B1411" stroke-width=".8" stroke-opacity=".5"/>`);
    else ups.push(`<path d="M${F(x - bw * 0.6)},${F(wy)} L${F(x + bw * 0.6)},${F(wy)}" stroke="#F4F1EA" stroke-opacity=".5" stroke-width="2"/>`);
  });
  const top = vals[0] > 0 ? Math.max(3, vals[0] * sc) : 0, sx = xs[0], sy = Math.max(16, wy - top - 22);
  return `<svg class="ra-svg" viewBox="0 0 360 ${H}" aria-hidden="true" focusable="false">${defs(p)}
<defs><linearGradient id="${p}-pk" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#D9776F"/><stop offset=".42" stop-color="#5A4A44"/><stop offset="1" stop-color="#1B2622"/></linearGradient>
<linearGradient id="${p}-pk1" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#FF8F7E"/><stop offset=".38" stop-color="#7A4A40"/><stop offset="1" stop-color="#1B2622"/></linearGradient>
<linearGradient id="${p}-mist" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#CFE7DC" stop-opacity="0"/><stop offset="1" stop-color="#CFE7DC" stop-opacity=".14"/></linearGradient>
<linearGradient id="${p}-dn" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#1B2622"/><stop offset=".55" stop-color="#3D5E8E"/><stop offset="1" stop-color="#8DB8FF"/></linearGradient></defs>
${hills(p, wy + 2, 0.55)}
<path d="M0,${wy} C40,${wy - 22} 70,${wy - 30} 110,${wy - 18} C150,${wy - 6} 180,${wy - 34} 220,${wy - 26} C262,${wy - 18} 300,${wy - 30} 360,${wy - 12} L360,${wy} Z" fill="#8FD3B6" fill-opacity=".06"/>
<rect x="0" y="${wy}" width="360" height="${H - wy}" fill="#0A1512" fill-opacity=".55"/>
<path d="M14,${wy + 14} H120 M170,${wy + 22} H300 M40,${wy + 34} H200 M240,${wy + 44} H340" stroke="#8FD3B6" stroke-opacity=".10" stroke-width="1"/>
<g class="ak-up" data-at="1">${ups.join('')}${ridges.join('')}<rect x="0" y="${wy - 16}" width="360" height="16" fill="url(#${p}-mist)"/></g>
${dns.length ? `<g class="ak-dn" data-at="2">${dns.join('')}</g>` : `<path class="ak-draw" data-at="2" pathLength="100" d="M30,${wy + 10} C90,${wy + 4} 150,${wy + 16} 210,${wy + 9} C260,${wy + 4} 300,${wy + 14} 330,${wy + 9}" fill="none" stroke="#8FD3B6" stroke-opacity=".35" stroke-width="1.4"/>`}
<path class="ak-draw" data-at="0" pathLength="100" d="M6,${wy} L354,${wy}" stroke="#CFE7DC" stroke-opacity=".75" stroke-width="1.6" stroke-linecap="round"/>
${vals[0] > 0 ? `<g class="ak-mv" data-at="3" data-v="y0:44px"><circle cx="${F(sx)}" cy="${F(sy)}" r="22" fill="url(#${p}-sun)"/><circle cx="${F(sx)}" cy="${F(sy)}" r="9" fill="#E8574F"/></g>`
    : `<g class="ak-mv" data-at="3" data-v="y0:-30px"><circle cx="${F(sx)}" cy="${F(wy + Math.max(3, -vals[0] * sc) + 14 > H - 6 ? H - 10 : wy + Math.max(3, -vals[0] * sc) + 14)}" r="7" fill="#F4F1EA"/></g>`}
</svg>`;
}
/** 지도(#/map) — 땅 12개 · 가장 붉은 땅 · 가장 푸른 땅 · 붉은 땅 수 */
export function mapArt(board) {
  const fams = familiesByRise(board?.groups ?? []).filter(f => finite(f.avg));
  if (!fams.length) return null;
  const top = fams[0], low = fams.at(-1), up = fams.filter(f => f.avg > 0).length, vals = fams.map(f => f.avg);
  const tagA = top.avg > 0 ? '가장 붉은 땅' : '가장 덜 내린 땅', tagB = low.avg < 0 ? '가장 푸른 땅' : '가장 덜 오른 땅';
  const labels = lab(
    col('a', tag(tagA), grName(top.fam.label, 'ra-n ra-up-n' + longCls(top.fam.label)), h('p', {class: 'ra-m'}, chgEl(top.avg)), sealEl(null, `땅 ${fams.length}개 중 ${up}개 붉음`, 4)),
    fams.length > 1 ? col('b', tag(tagB), grName(low.fam.label, 'ra-n ra-dn-n' + longCls(low.fam.label)), h('p', {class: 'ra-m'}, chgEl(low.avg))) : null);
  const stage = artStage({key: 'map', svg: peaksSvg('akm', vals), labels: check(labels, {top: top.fam.id, topAvg: +top.avg.toFixed(6), low: low.fam.id, lowAvg: +low.avg.toFixed(6), up, n: fams.length}),
    steps: [{c: 0, at: 0, ms: 900}, {c: 0, at: 1, ms: 1500}, {c: 1, at: 2, ms: 1250}, {c: 2, at: 3, ms: 1350}, {c: 3, at: 4, ms: 900}],
    says: [[tagA, top.fam.label, p1(top.avg)], [tagB, low.fam.label, p1(low.avg)], [`땅 ${fams.length}개 중 ${up}개 붉음`], ['갈래 평균', '지난 20거래일']]});
  return artSection({key: 'map', label: '지도', kicker: '지도', when: `지난 20거래일 · ${when(board.asOf)}`, stage});
}
/** 갈래(#/map/f/<갈래>) — 그 갈래 업종들 · 1위 · 2위 · 오른 업종 수 */
export function landArt(board, famId) {
  const gs = (board?.groups ?? []).filter(g => familyOf(g.label).id === famId && finite(g.change20)).sort(riseDesc);
  if (!gs.length) return null;
  const g0 = gs[0], g1 = gs[1] ?? null, up = gs.filter(g => g.change20 > 0).length;
  const labels = lab(
    col('a', tag('1위'), grName(g0.label, 'ra-n ra-up-n' + longCls(g0.label)), h('p', {class: 'ra-m'}, chgEl(g0.change20))),
    g1 ? col('b', tag('2위'), grName(g1.label, 'ra-n' + longCls(g1.label)), h('p', {class: 'ra-m'}, chgEl(g1.change20))) : null,
    srow(sealEl(null, `업종 ${gs.length}개 가운데 ${up}개 오름`, 4)));
  const stage = artStage({key: 'land-' + famId, svg: peaksSvg('akl', gs.map(g => g.change20)), labels: check(labels, {g0: g0.id, v0: +g0.change20.toFixed(6), g1: g1?.id ?? null, up, n: gs.length}),
    steps: [{c: 0, at: 0, ms: 900}, {c: 0, at: 1, ms: 1500}, {c: 1, at: 2, ms: 1250}, {c: 2, at: 3, ms: 1350}, {c: 3, at: 4, ms: 900}],
    says: [['1위', g0.label, p1(g0.change20)], g1 ? ['2위', g1.label, p1(g1.change20)] : [], [`업종 ${gs.length}개 가운데 ${up}개 오름`], ['지난 20거래일']]});
  const fam = familyOf(g0.label);
  return artSection({key: 'land', label: fam.label, kicker: fam.label, when: `업종 ${gs.length}개 · 지난 20거래일 · ${when(board.asOf)}`, stage});
}

/* ═════════ 2. 방패연 — 업종(회사 n곳) ═════════ */
function kitesSvg(p, cs, avg) {
  const H = 192, zy = 138, n = cs.length, vals = cs.map(c => c.change20);
  const mp = Math.max(0, ...vals), mn = Math.max(0, ...vals.map(v => -v));
  const sc = Math.min(mp ? 104 / mp : Infinity, mn ? 30 / mn : Infinity, 1e6);
  const slots = centerOut(n), xs = cs.map((_, k) => (n === 1 ? 180 : 34 + (292 / (n - 1)) * slots[k]));
  const ys = vals.map(v => Math.max(26, Math.min(166, zy - v * sc)));
  const kite = (x, y, k) => { const lead = k === 0, s = vals[k] > 0 ? '#FF7272' : vals[k] < 0 ? '#82B6FF' : '#F4F1EA', w = lead ? 17 : 14.5, hh = lead ? 21 : 18;
    return `<g><rect x="${F(x - w)}" y="${F(y - hh)}" width="${F(w * 2)}" height="${F(hh * 2)}" rx="3" fill="url(#${p}-${lead ? 'gold' : 'glz2'})" stroke="#0B1411" stroke-opacity=".55" stroke-width=".8"/>`
      + `<path d="M${F(x - w)},${F(y - hh)} L${F(x + w)},${F(y + hh)} M${F(x + w)},${F(y - hh)} L${F(x - w)},${F(y + hh)} M${F(x)},${F(y - hh)} V${F(y + hh)}" stroke="#0B1411" stroke-opacity=".28" stroke-width=".8"/>`
      + `<circle cx="${F(x)}" cy="${F(y)}" r="${F(w * 0.42)}" fill="#0B1411"/><path d="M${F(x - w * 0.5)},${F(y - hh)} A${F(w * 0.5)},${F(w * 0.5)} 0 0 0 ${F(x + w * 0.5)},${F(y - hh)} Z" fill="${s}"/></g>`; };
  const strings = cs.map((_, k) => { const hh = k === 0 ? 21 : 18; return `<path d="M${F(xs[k])},${F(ys[k] + hh)} Q${F((xs[k] + 180) / 2)},${F(Math.max(ys[k] + hh, 160) + 26)} 180,${H - 6}" pathLength="100"/>`; }).join('');
  const ay = Math.max(20, Math.min(172, zy - (finite(avg) ? avg : 0) * sc));
  return `<svg class="ra-svg" viewBox="0 0 360 ${H}" aria-hidden="true" focusable="false">${defs(p)}
${hills(p, H, 0.85)}
<path d="M10,${zy} H350" stroke="#F4F1EA" stroke-opacity=".14" stroke-width="1"/>
<g class="ak-mv" data-at="0" data-v="y0:${F(H - Math.min(...ys) + 10)}px">${cs.map((_, k) => kite(xs[k], ys[k], k)).join('')}</g>
<g class="ak-draw" data-at="1" fill="none" stroke="#E8E2D2" stroke-opacity=".5" stroke-width=".9">${strings}</g>
<path class="ak-x" data-at="2" d="M12,${F(ay)} H348" stroke="#F2C46B" stroke-width="1.6" stroke-dasharray="5 5" stroke-opacity=".85"/>
<circle class="ak-pop" data-at="3" cx="${F(xs[0])}" cy="${F(ys[0])}" r="31" fill="url(#${p}-halo)" stroke="#F2C46B" stroke-opacity=".55" stroke-width="1.2"/>
<circle cx="180" cy="${H - 6}" r="3.2" fill="#E8E2D2" fill-opacity=".7"/>
</svg>`;
}
/** 업종(#/i/<업종>) — 1위 회사 · 업종 평균 · 몇 곳이 올랐나 */
export function industryArt(board, g, upLineText) {
  if (!g) return null;
  const byCode = new Map((board?.companies ?? []).map(c => [c.code, c]));
  const cs = (g.codes ?? []).map(code => byCode.get(code)).filter(c => c && finite(c.change20)).sort(riseDesc);
  if (!cs.length) return null;
  const c0 = cs[0];
  const labels = lab(
    col('a', tag('1위'), coName(c0.name, 'ra-n' + longCls(c0.name)), h('p', {class: 'ra-m'}, chgEl(c0.change20)), sealEl(null, upLineText, 4)),
    col('b', tag('업종 평균'), h('p', {class: 'ra-m ra-mb'}, chgEl(g.change20))));
  const stage = artStage({key: 'ind-' + g.id, svg: kitesSvg('aki', cs, g.change20), labels: check(labels, {lead: c0.code, v0: +c0.change20.toFixed(6), avg: finite(g.change20) ? +g.change20.toFixed(6) : null, n: cs.length}),
    steps: [{c: 0, at: 0, ms: 1400}, {c: 0, at: 1, ms: 1050}, {c: 1, at: 2, ms: 1100}, {c: 2, at: 3, ms: 950}, {c: 3, at: 4, ms: 900}],
    says: [['1위', c0.name, p1(c0.change20)], ['업종 평균', p1(g.change20)], [upLineText], ['지난 20거래일']]});
  return artSection({key: 'industry', label: g.label, kicker: g.label, when: `${cs.length}곳 · 지난 20거래일 · ${when(board.asOf)}`, stage});
}

/* ═════════ 3. 먹 붓질 — 회사(업종 회사들의 지난 20거래일 선 · 이 회사 금빛) ═════════ */
const retsOf = c => { const xs = (c?.c ?? []).filter(v => finite(v) && v > 0); return xs.length >= 2 ? xs.map(v => v / xs[0] - 1) : null; };
function strokesSvg(p, me, peers) {
  const H = 132, all = [me, ...peers].map(retsOf).filter(Boolean), mine = retsOf(me); // 값 · 이름 아래라 낮게(한 화면 · 규칙 30)
  const lo = Math.min(0, ...all.flat()), hi = Math.max(0, ...all.flat()), span = Math.max(hi - lo, 1e-6);
  const y = v => 12 + (hi - v) / span * (H - 30), path = r => r.map((v, i) => `${i ? 'L' : 'M'}${F(14 + i * (330 / Math.max(1, r.length - 1)))},${F(y(v))}`).join(' ');
  const pr = peers.map(retsOf).filter(Boolean);
  const ex = 14 + 330, ey = mine ? y(mine.at(-1)) : y(0);
  return `<svg class="ra-svg" viewBox="0 0 360 ${H}" aria-hidden="true" focusable="false">${defs(p)}
${hills(p, H, 0.5)}
<path d="M10,${F(y(0))} H350" stroke="#F4F1EA" stroke-opacity=".22" stroke-width="1" stroke-dasharray="3 5"/>
${mine ? `<path class="ak-draw" data-at="0" pathLength="100" d="${path(mine)}" fill="none" stroke="#F2C46B" stroke-width="3.6" stroke-linecap="round" stroke-linejoin="round" filter="url(#${p}-glow)"/>` : ''}
<g class="ak-draw" data-at="1" fill="none" stroke="#A9C7BA" stroke-opacity=".55" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">${pr.map(r => `<path pathLength="100" d="${path(r)}"/>`).join('')}</g>
<g class="ak-pop" data-at="2"><circle cx="${F(ex)}" cy="${F(ey)}" r="15" fill="url(#${p}-halo)"/><circle cx="${F(ex)}" cy="${F(ey)}" r="6.5" fill="#F4F1EA"/></g>
</svg>`;
}
/** 회사(#/stock/CODE) — 지난 20거래일 · 업종 평균 · 업종 안 자리(comment.js companyComment 의 머리 문장) */
export function companyArt(board, s, cm) {
  if (!s || !finite(s.change20) || !board) return null;
  const g = (board.groups ?? []).find(x => x.id === s.group?.id); if (!g) return null;
  const byCode = new Map((board.companies ?? []).map(c => [c.code, c])), me = byCode.get(s.code) ?? s;
  const peers = (g.codes ?? []).filter(c => c !== s.code).map(c => byCode.get(c)).filter(Boolean);
  const head = cm ? plain(cm.head) : null;
  const labels = lab(
    col('a', tag('지난 20거래일'), h('p', {class: 'ra-m ra-mb'}, chgEl(s.change20))),
    col('b', tag('업종 평균'), h('p', {class: 'ra-m ra-mb'}, chgEl(g.change20))),
    head ? srow(sealEl(null, head, 3)) : null);
  const stage = artStage({key: 'co-' + s.code, svg: strokesSvg('akc', me, peers), labels: check(labels, {code: s.code, v: +s.change20.toFixed(6), avg: finite(g.change20) ? +g.change20.toFixed(6) : null, peers: peers.length}),
    steps: [{c: 0, at: 0, ms: 1500}, {c: 1, at: 1, ms: 1250}, {c: 2, at: 2, ms: 850}, {c: 3, at: 3, ms: 900}],
    says: [['지난 20거래일', p1(s.change20)], ['업종 평균', p1(g.change20)], [], head ? [head] : []]});
  return artSection({key: 'company', label: '지난 20거래일', kicker: '지난 20거래일', when: s.cFrom ? `${korDate(s.cFrom)}부터 ${korDate(s.date)}까지` : when(s.date), stage, cls: 'ak-mid'});
}

/* ═════════ 4. 매화 가지 — 예비(닮은 n곳) ═════════ */
const bez = (t, a, b, c, d) => { const u = 1 - t; return u * u * u * a + 3 * u * u * t * b + 3 * u * t * t * c + t * t * t * d; };
function plumSvg(p, items, nCommon) {
  const H = 196, P = [[12, 188], [110, 176], [196, 96], [348, 30]], n = items.length;
  const pt = t => [bez(t, P[0][0], P[1][0], P[2][0], P[3][0]), bez(t, P[0][1], P[1][1], P[2][1], P[3][1])];
  const ts = items.map((_, k) => 0.94 - k * (0.78 / Math.max(1, n - 1)));
  const twigs = ts.map((t, k) => { const [x, y] = pt(t), dy = k % 2 ? 1 : -1; return `M${F(x)},${F(y)} q${F(8)},${F(dy * 14)} ${F(18)},${F(dy * 20)}`; }).join(' ');
  const flower = (x, y, r, lead) => Array.from({length: 5}, (_, i) => { const a = -Math.PI / 2 + i * 2 * Math.PI / 5; return `<circle cx="${F(x + Math.cos(a) * r * 0.82)}" cy="${F(y + Math.sin(a) * r * 0.82)}" r="${F(r * 0.62)}" fill="${lead ? '#FFD9D3' : '#F4B6AE'}" fill-opacity="${lead ? 1 : 0.9}"/>`; }).join('') + `<circle cx="${F(x)}" cy="${F(y)}" r="${F(r * 0.34)}" fill="#F2C46B"/>`;
  const fl = items.map((x, k) => { const [bx, by] = pt(ts[k]), dy = k % 2 ? 1 : -1, cx = bx + 18, cy = by + dy * 20, r = 6 + 6 * Math.min(1, (x.matched ?? 0) / Math.max(1, nCommon)); return {cx, cy, r}; });
  return `<svg class="ra-svg" viewBox="0 0 360 ${H}" aria-hidden="true" focusable="false">${defs(p)}
${hills(p, H, 0.6)}
<path class="ak-draw" data-at="0" pathLength="100" d="M${P[0]} C${P[1]} ${P[2]} ${P[3]} ${twigs}" fill="none" stroke="#3A2A22" stroke-width="5" stroke-linecap="round"/>
<path d="M${P[0]} C${P[1]} ${P[2]} ${P[3]}" fill="none" stroke="#8C6A55" stroke-opacity=".35" stroke-width="1.4" stroke-linecap="round"/>
<g class="ak-pop" data-at="1">${fl.map((f, k) => flower(f.cx, f.cy, f.r, k === 0)).join('')}</g>
<circle class="ak-pop" data-at="2" cx="${F(fl[0].cx)}" cy="${F(fl[0].cy)}" r="${F(fl[0].r * 2.6)}" fill="url(#${p}-halo)" stroke="#F2C46B" stroke-opacity=".5" stroke-width="1.2"/>
</svg>`;
}
/** 예비(#/similar) — 닮은 n곳 · 1위 · 불장 공통점 수 */
export function similarArt(board) {
  const sim = board?.similar, items = [...(sim?.items ?? [])].filter(x => finite(x.change20)).sort(riseDesc);
  if (!items.length) return null;
  const common = (sim.common ?? []).length, x0 = items[0];
  const labels = lab(
    col('a', tag('1위'), coName(x0.name, 'ra-n' + longCls(x0.name)), h('p', {class: 'ra-m'}, chgEl(x0.change20)), sealEl('예비', `${items.length}곳`, 3)),
    col('b', tag('불장 회사들의 공통점'), h('p', {class: 'ra-big'}, `${common}가지`)));
  const stage = artStage({key: 'similar', svg: plumSvg('aks', items, common), labels: check(labels, {lead: x0.code, v0: +x0.change20.toFixed(6), n: items.length, common}),
    steps: [{c: 0, at: 0, ms: 1350}, {c: 1, at: 1, ms: 1100}, {c: 2, at: 2, ms: 900}, {c: 3, at: 3, ms: 900}],
    says: [['예비', `${items.length}곳`], ['1위', x0.name, p1(x0.change20)], ['불장 회사들의 공통점', `${common}가지`], []]});
  return artSection({key: 'similar', label: '예비', kicker: '예비', when: when(board.asOf), stage});
}

/* ═════════ 5. 풍등 — 오름 상위(n곳) ═════════ */
function lanternsSvg(p, items) {
  const H = 196, n = items.length, vals = items.map(x => x.change20), mx = Math.max(...vals), mnv = Math.min(...vals);
  const slots = centerOut(n), W = 340 / n, xs = items.map((_, k) => 10 + W * (slots[k] + 0.5));
  const ys = vals.map(v => 34 + (mx - v) / Math.max(1e-6, mx - mnv) * 120);
  const lamp = (x, y, k) => { const s = k === 0 ? 1.45 : 1, w = 9 * s, hh = 12 * s;
    return `<g><rect x="${F(x - w / 2)}" y="${F(y - hh / 2)}" width="${F(w)}" height="${F(hh)}" rx="${F(2.6 * s)}" fill="url(#${p}-gold)"/><rect x="${F(x - w / 2 - .6)}" y="${F(y - hh / 2 - 1.6)}" width="${F(w + 1.2)}" height="2" rx="1" fill="#6B4A2A"/><circle cx="${F(x)}" cy="${F(y + hh / 2 - 2)}" r="${F(1.6 * s)}" fill="#FF6B45"/></g>`; };
  const ly = ys.at(-1) + 9;
  return `<svg class="ra-svg" viewBox="0 0 360 ${H}" aria-hidden="true" focusable="false">${defs(p)}
${hills(p, H, 0.7)}
<circle cx="318" cy="26" r="9" fill="#F4F1EA" fill-opacity=".85"/><circle cx="321.5" cy="24" r="7" fill="#DCD8CC" fill-opacity=".45"/>
<g class="ak-mv" data-at="0" data-v="y0:${F(H - 20)}px" filter="url(#${p}-glow)">${items.map((_, k) => lamp(xs[k], ys[k], k)).join('')}</g>
<circle class="ak-pop" data-at="1" cx="${F(xs[0])}" cy="${F(ys[0])}" r="20" fill="url(#${p}-halo)" stroke="#F2C46B" stroke-opacity=".5" stroke-width="1.1"/>
<path class="ak-x" data-at="2" d="M10,${F(ly)} H350" stroke="#F4F1EA" stroke-opacity=".45" stroke-width="1.2" stroke-dasharray="4 5"/>
</svg>`;
}
/** 오름 상위(#/rise) — n곳 · 1위 · 마지막 자리 */
export function riseArt(board) {
  const items = (board?.next?.items ?? []).filter(x => finite(x.change20));
  if (!items.length) return null;
  const x0 = items[0], xl = items.at(-1), n = items.length;
  const labels = lab(
    col('a', tag('1위'), coName(x0.name, 'ra-n' + longCls(x0.name)), h('p', {class: 'ra-m'}, chgEl(x0.change20)), sealEl('오름 상위', `${n}곳`, 3)),
    n > 1 ? col('b', tag(`${n}위`), coName(xl.name, 'ra-n' + longCls(xl.name)), h('p', {class: 'ra-m'}, chgEl(xl.change20))) : null);
  const stage = artStage({key: 'rise', svg: lanternsSvg('akr', items), labels: check(labels, {lead: x0.code, v0: +x0.change20.toFixed(6), last: xl.code, vl: +xl.change20.toFixed(6), n}),
    steps: [{c: 0, at: 0, ms: 1550}, {c: 1, at: 1, ms: 900}, {c: 2, at: 2, ms: 1000}, {c: 3, at: 3, ms: 900}],
    says: [['오름 상위', `${n}곳`], ['1위', x0.name, p1(x0.change20)], [`${n}위`, xl.name, p1(xl.change20)], ['지난 20거래일']]});
  return artSection({key: 'rise', label: '오름 상위', kicker: '오름 상위', when: `지난 20거래일 · ${when(board.asOf)}`, stage});
}

/* ═════════ 6. 구슬 두 그릇 — 출목표(오른 곳 · 내린 곳) ═════════ */
function pile(cx, n, cls) {
  // 구슬 더미 — 아래 19개에서 두 줄마다 하나씩 줄어 둥근 더미(맨 위도 6개 · 바늘처럼 솟지 않게) · 365개도 그릇 위 125px 안
  const out = [], cap = row => Math.max(6, 19 - Math.floor(row / 2));
  let left = n, row = 0, y = 177;
  while (left > 0 && row < 60) { const m = Math.min(cap(row), left), x0 = cx - (m - 1) * 3.5;
    for (let i = 0; i < m; i++) out.push(`<circle cx="${F(x0 + i * 7)}" cy="${F(y)}" r="3.15"/>`);
    left -= m; row++; y -= 6.1; }
  return {svg: `<g class="${cls}">${out.join('')}</g>`, top: y + 6.1};
}
const bowl = (cx, p) => `<path d="M${cx - 72},150 C${cx - 68},180 ${cx - 40},190 ${cx},190 C${cx + 40},190 ${cx + 68},180 ${cx + 72},150 Z" fill="url(#${p}-glz)" stroke="#264A3F" stroke-width=".9"/><ellipse cx="${cx}" cy="150" rx="72" ry="6" fill="none" stroke="#D4EEE2" stroke-opacity=".55" stroke-width="1.2"/>`
  + `<path d="M${cx - 30},168 c8,-5 16,-4 20,1 M${cx + 8},174 c6,-4 13,-3 16,1" fill="none" stroke="#F4F1EA" stroke-opacity=".35" stroke-width="1" stroke-linecap="round"/>`;
function beadsSvg(p, up, down) {
  const H = 196, a = pile(92, up, 'ak-b-up'), b = pile(268, down, 'ak-b-dn');
  return `<svg class="ra-svg" viewBox="0 0 360 ${H}" aria-hidden="true" focusable="false">${defs(p)}
${hills(p, H, 0.55)}
<g class="ak-mv" data-at="0" data-v="y0:-${F(Math.max(60, 180 - a.top + 20))}px" fill="#FF7272">${a.svg}</g>
<g class="ak-mv" data-at="1" data-v="y0:-${F(Math.max(60, 180 - b.top + 20))}px" fill="#82B6FF">${b.svg}</g>
${bowl(92, p)}${bowl(268, p)}
<g class="ak-mv" data-at="2" data-v="y0:${F(Math.max(20, 150 - a.top + 10))}px"><circle cx="92" cy="${F(Math.max(14, a.top - 18))}" r="16" fill="url(#${p}-halo)"/><circle cx="92" cy="${F(Math.max(14, a.top - 18))}" r="6.5" fill="url(#${p}-gold)" stroke="#FFE7AE" stroke-width=".8"/></g>
</svg>`;
}
/** 출목표(#/road) — 오른 곳 · 내린 곳 · 1위(comment.js roadComment 와 같은 셈) */
export function roadArt(board) {
  const cs = (board?.companies ?? []).filter(c => finite(c.change20)).sort(riseDesc);
  if (!cs.length) return null;
  const up = cs.filter(c => c.change20 > 0).length, down = cs.filter(c => c.change20 < 0).length, N = board.companies.length, c0 = cs[0];
  const labels = lab(
    col('a', tag('오름'), big(`${up}곳`, 1)),
    col('b', tag('내림'), big(`${down}곳`, -1)),
    srow(h('p', {class: 'ra-seal ra-seal-co', 'data-at': '3'}, h('span', {class: 'ra-st'}, '1위'), ' ', h('span', {class: 'ra-sw', 'data-ident': ''}, c0.name), ' ', h('span', {class: 'ra-sw ra-sv'}, p1(c0.change20)))));
  const stage = artStage({key: 'road', svg: beadsSvg('akd', up, down), labels: check(labels, {up, down, N, lead: c0.code, v0: +c0.change20.toFixed(6)}),
    steps: [{c: 0, at: 0, ms: 1300}, {c: 1, at: 1, ms: 1300}, {c: 2, at: 2, ms: 1000}, {c: 3, at: 3, ms: 900}],
    says: [[`${N}곳 중 ${up}곳이 올랐다`], [`${N}곳 중 ${down}곳이 내렸다`], ['1위', c0.name, p1(c0.change20)], ['지난 20거래일']]});
  return artSection({key: 'road', label: '출목표', kicker: '출목표', when: `${N}곳 · 지난 20거래일 · ${when(board.asOf)}`, stage});
}

/* ═════════ 7. 달이 그날로 — 일정(가장 중요한 일정까지 며칠) ═════════ */
const ARC = {cx: 180, cy: 560, r: 540, a: 17};
function moonSvg(p, dd, level) {
  const H = 176, rad = d => d * Math.PI / 180, n = Math.max(2, Math.min(61, dd + 1)); // 점 하나 = 하루(60일 넘으면 점 61개로 고르게)
  const mk = Array.from({length: n}, (_, i) => { const t = rad(-ARC.a + 2 * ARC.a * i / (n - 1)), x = ARC.cx + ARC.r * Math.sin(t), y = ARC.cy - ARC.r * Math.cos(t), end = i === n - 1 || i === 0;
    return `<circle cx="${F(x)}" cy="${F(y)}" r="${end ? 3.2 : 2}" fill="#F4F1EA" fill-opacity="${end ? '.85' : '.45'}"/>`; }).join('');
  const ex = ARC.cx + ARC.r * Math.sin(rad(ARC.a)), ey = ARC.cy - ARC.r * Math.cos(rad(ARC.a));
  const stars = Array.from({length: Math.max(1, Math.min(3, level))}, (_, i) => `<polygon points="${star(8.5)}" transform="translate(${F(ex - 18 * (Math.min(3, level) - 1) / 2 + i * 18 - 14)},${F(ey + 30 + (i % 2) * 8)})" fill="#FFE3A0"/>`).join('');
  return `<svg class="ra-svg" viewBox="0 0 360 ${H}" aria-hidden="true" focusable="false">${defs(p)}
${hills(p, H, 0.6)}
<path class="ak-draw" data-at="0" pathLength="100" d="M${F(ARC.cx - ARC.r * Math.sin(rad(ARC.a)))},${F(ey)} A${ARC.r},${ARC.r} 0 0 1 ${F(ex)},${F(ey)}" fill="none" stroke="#F4F1EA" stroke-opacity=".3" stroke-width="1.2"/>
${mk}
<g class="ak-turn" data-at="1" data-v="ox:${ARC.cx}px;oy:${ARC.cy}px;a0:${-ARC.a}deg;a1:${ARC.a}deg"><circle cx="${ARC.cx}" cy="${ARC.cy - ARC.r}" r="18" fill="url(#${p}-halo)"/><circle cx="${ARC.cx}" cy="${ARC.cy - ARC.r}" r="8" fill="#F4F1EA"/><circle cx="${ARC.cx + 3.5}" cy="${ARC.cy - ARC.r - 2}" r="6.4" fill="#DCD8CC" fill-opacity=".55"/></g>
<g class="ak-pop" data-at="2" filter="url(#${p}-glow)">${stars}</g>
</svg>`;
}
/** 일정(#/agenda) — comment.js agendaComment 와 같은 일정 · 같은 날 수(cm.ev · cm.dd · cm.day) */
export function agendaArt(cm) {
  const top = cm?.ev, dd = cm?.dd;
  if (!top || !Number.isFinite(dd) || dd < 0) return null;
  const nameEl = h('p', {class: 'ra-ev'}, h('span', {'data-ident': top.scope === 'market' ? null : '', lang: top.scope === 'market' ? null : 'ko'}, top.name));
  const labels = lab(
    col('a', tag('그날'), h('p', {class: 'ra-n ra-long'}, korDate(top.date)), nameEl),
    col('b', tag('남은 날'), big(dd ? `${dd}일 뒤` : '그날'), sealEl(null, `별 ${top.level}개`, 3)));
  const stage = artStage({key: 'agenda', svg: moonSvg('aka', dd, top.level), labels: check(labels, {date: top.date, day: cm.day, dd, level: top.level}),
    steps: [{c: 0, at: 0, ms: 950}, {c: 1, at: 1, ms: 1800}, {c: 2, at: 2, ms: 950}, {c: 3, at: 3, ms: 900}],
    says: [[korDate(top.date), top.name], [dd ? `${dd}일 뒤` : '그날'], [`별 ${top.level}개`], [plain(cm.cap)]]});
  return artSection({key: 'agenda', label: '일정', kicker: '일정', when: cm.day ? `${korDate(cm.day)} 기준` : null, stage});
}

/** 일정이 없는 판(중국 · 일본 · 베트남 — 일정 자료를 아직 모으지 않음) — 빈 하늘을 달이 건넘 · 일정 0건(지어내지 않음) */
export function agendaEmptyArt(agenda, nCo) {
  if (!agenda) return null;
  const nm = (agenda.market ?? []).length;
  const labels = lab(col('a', tag('일정'), big(`${nm}건`)), col('b', h('p', {class: 'ra-sub'}, `시장 전체 일정 ${nm}건`), h('p', {class: 'ra-sub'}, `회사·업종 일정 ${nCo}건`)),
    srow(sealEl(null, '확인된 일정만 모았습니다(일정마다 공식 출처)', 3)));
  const stage = artStage({key: 'agenda-none', svg: moonSvg('aka', 30, 0).replace(/<g class="ak-pop" data-at="2"[\s\S]*?<\/g>/, '<circle class="ak-pop" data-at="2" cx="330" cy="40" r="3" fill="#F4F1EA" fill-opacity=".6"/>'), labels: check(labels, {market: nm, company: nCo}),
    steps: [{c: 0, at: 0, ms: 950}, {c: 1, at: 1, ms: 1800}, {c: 2, at: 2, ms: 800}, {c: 3, at: 3, ms: 900}],
    says: [['일정', `${nm}건`], [`시장 전체 일정 ${nm}건`], [`회사·업종 일정 ${nCo}건`], ['확인된 일정만 모았습니다(일정마다 공식 출처)']]});
  return artSection({key: 'agenda', label: '일정', kicker: '일정', when: agenda.builtDay ? `${korDate(agenda.builtDay)} 기준` : null, stage});
}

/* ═════════ 8. 다섯 나라 등불 — 찾기(판마다 회사 수) ═════════ */
function lampsSvg(p, boards, hereId) {
  const H = 112, n = boards.length, mx = Math.max(...boards.map(b => b.n), 1), xs = boards.map((_, k) => 36 + (288 / Math.max(1, n - 1)) * k);
  const rope = `M8,16 Q180,52 352,16`, ropeY = x => { const t = (x - 8) / 344; return (1 - t) * (1 - t) * 16 + 2 * (1 - t) * t * 52 + t * t * 16; };
  const lamp = (x, b) => { const s = 0.55 + 0.45 * Math.sqrt(b.n / mx), w = 34 * s, hh = 44 * s, y0 = ropeY(x), y = y0 + 14, here = b.id === hereId;
    return `<g><path d="M${F(x)},${F(y0)} V${F(y)}" stroke="#8C6A55" stroke-width="1"/><ellipse cx="${F(x)}" cy="${F(y + hh / 2)}" rx="${F(w / 2)}" ry="${F(hh / 2)}" fill="url(#${p}-${here ? 'gold' : 'red'})" fill-opacity="${here ? 1 : 0.82}"/>`
      + `<path d="M${F(x - w / 2 + 3)},${F(y + hh / 2)} H${F(x + w / 2 - 3)} M${F(x)},${F(y + 2)} V${F(y + hh - 2)}" stroke="#0B1411" stroke-opacity=".25" stroke-width=".8"/><rect x="${F(x - w / 4)}" y="${F(y - 2)}" width="${F(w / 2)}" height="4" rx="1.5" fill="#3A2A22"/><rect x="${F(x - w / 4)}" y="${F(y + hh - 2)}" width="${F(w / 2)}" height="4" rx="1.5" fill="#3A2A22"/></g>`; };
  const hk = boards.findIndex(b => b.id === hereId), hx = xs[Math.max(0, hk)];
  return `<svg class="ra-svg" viewBox="0 0 360 ${H}" aria-hidden="true" focusable="false">${defs(p)}
<path class="ak-draw" data-at="0" pathLength="100" d="${rope}" fill="none" stroke="#A88A70" stroke-width="1.6"/>
<g class="ak-mv" data-at="1" data-v="y0:-70px">${boards.map((b, k) => lamp(xs[k], b)).join('')}</g>
<circle class="ak-pop" data-at="2" cx="${F(hx)}" cy="${F(ropeY(hx) + 36)}" r="34" fill="url(#${p}-halo)"/>
</svg>`;
}
/** 찾기(#/find) — 다섯 판 회사 수(boards = [{id, label, n}] · 위 막대 시장 차례) */
export function findArt(boards, hereId, when = null) {
  if (!boards?.length) return null;
  const N = boards.reduce((t, b) => t + b.n, 0);
  const labels = h('div', {class: 'ra-lab ra-five'}, ...boards.map(b => h('div', {class: 'ra-col ra-c5' + (b.id === hereId ? ' ra-here' : '')}, h('p', {class: 'ra-tag'}, b.label), h('p', {class: 'ra-m5'}, `${b.n}곳`))));
  const stage = artStage({key: 'find', svg: lampsSvg('akf', boards, hereId), labels: check(h('div', {class: 'ra-fwrap'}, labels, h('div', {class: 'ra-lab ra-one'}, h('div', {class: 'ra-col'}, sealEl(null, `${N}곳`, 3)))), {N, boards: boards.map(b => [b.id, b.n])}),
    steps: [{c: 0, at: 0, ms: 850}, {c: 1, at: 1, ms: 1150}, {c: 2, at: 2, ms: 850}, {c: 3, at: 3, ms: 850}],
    says: [['찾기'], boards.map(b => `${b.label} ${b.n}곳`), [], [`${N}곳`]], cls: 'ak-short'});
  return artSection({key: 'find', label: '찾기', kicker: '찾기', when, stage, cls: 'ak-find'}); // when = 기준 시각(또렷함 3번 — 숫자에는 기준)
}

/* ═════════ 9. 매듭 끈 — 기록(날마다 기록 수) ═════════ */
function knotsSvg(p, days) {
  const H = 120, n = days.length, mx = Math.max(...days.map(d => d.n), 1), xs = days.map((_, k) => (n === 1 ? 180 : 24 + (312 / (n - 1)) * k));
  const cy = x => 62 + Math.sin(x / 34) * 9;
  const cord = `M6,${F(cy(6))} ` + Array.from({length: 36}, (_, i) => { const x = 6 + (i + 1) * (348 / 36); return `L${F(x)},${F(cy(x))}`; }).join(' ');
  const col = d => (d.issue >= d.update && d.issue >= d.data ? '#FF8A80' : d.data > d.update ? '#F2C46B' : '#8FD3B6');
  const knots = days.map((d, k) => { const r = 4 + 9 * Math.sqrt(d.n / mx); return `<circle cx="${F(xs[k])}" cy="${F(cy(xs[k]))}" r="${F(r)}" fill="${col(d)}" stroke="#0B1411" stroke-opacity=".5" stroke-width="1"/><path d="M${F(xs[k] - r * 0.6)},${F(cy(xs[k]) - r * 0.2)} q${F(r * 0.6)},${F(-r * 0.7)} ${F(r * 1.2)},0" fill="none" stroke="#0B1411" stroke-opacity=".35" stroke-width="1"/>`; }).join('');
  const lx = xs.at(-1), ly = cy(lx);
  return `<svg class="ra-svg" viewBox="0 0 360 ${H}" aria-hidden="true" focusable="false">${defs(p)}
<path class="ak-draw" data-at="0" pathLength="100" d="${cord}" fill="none" stroke="#C9B49A" stroke-width="2.2" stroke-linecap="round"/>
<g class="ak-pop" data-at="1">${knots}</g>
<circle class="ak-pop" data-at="2" cx="${F(lx)}" cy="${F(ly)}" r="24" fill="url(#${p}-halo)" stroke="#F2C46B" stroke-opacity=".6" stroke-width="1.2"/>
</svg>`;
}
/** 기록(#/log) — 날마다 매듭 · 이슈 · 업데이트 · 자료 변경 수 · 가장 새 날 */
export function logArt(entries) {
  if (!entries?.length) return null;
  const by = new Map();
  for (const e of entries) { const d = String(e.live ?? '').slice(0, 10); if (!d) continue; const x = by.get(d) ?? {d, n: 0, issue: 0, update: 0, data: 0}; x.n++; if (x[e.kind] != null) x[e.kind]++; by.set(d, x); }
  const days = [...by.values()].sort((a, b) => a.d.localeCompare(b.d)), last = days.at(-1);
  const k = {issue: entries.filter(e => e.kind === 'issue').length, update: entries.filter(e => e.kind === 'update').length, data: entries.filter(e => e.kind === 'data').length};
  const labels = lab(
    col('a', tag('가장 새 날'), h('p', {class: 'ra-n ra-long'}, korDate(last.d)), h('p', {class: 'ra-sub'}, `${last.n}개`)),
    col('b', tag('모두'), big(`${entries.length}개`), sealEl(null, `${days.length}일`, 3)));
  const stage = artStage({key: 'log', svg: knotsSvg('akg', days), labels: check(labels, {n: entries.length, days: days.length, last: last.d, lastN: last.n, ...k}),
    steps: [{c: 0, at: 0, ms: 1150}, {c: 1, at: 1, ms: 1050}, {c: 2, at: 2, ms: 850}, {c: 3, at: 3, ms: 850}],
    says: [['기록', `${entries.length}개`], ['모두', `${entries.length}개`], ['가장 새 날', korDate(last.d), `${last.n}개`], [`${days.length}일`]], cls: 'ak-short'});
  return artSection({key: 'log', label: '기록', kicker: '기록', stage});
}

/* ═════════ 10. 물결 깊이 — 처음(다섯 곳 · 보통 회사 · 가장 깊게 떨어진 때) ═════════ */
function wavesSvg(p, picks, typ) {
  const H = 186, sea = 34, mx = Math.max(Math.abs(typ), ...picks.map(x => Math.abs(x))), sc = (H - sea - 26) / Math.max(1e-6, mx);
  const trough = (d, k, n) => { const x0 = 18 + k * 6, x1 = 342 - (n - k) * 4, mid = 150 + (k - n / 2) * 10, y = sea + Math.abs(d) * sc;
    return `M${F(x0)},${sea} C${F(x0 + 50)},${sea} ${F(mid - 70)},${F(y)} ${F(mid)},${F(y)} C${F(mid + 70)},${F(y)} ${F(x1 - 60)},${sea} ${F(x1)},${sea}`; };
  return `<svg class="ra-svg" viewBox="0 0 360 ${H}" aria-hidden="true" focusable="false">${defs(p)}
<rect x="0" y="${sea}" width="360" height="${H - sea}" fill="#0A1512" fill-opacity=".5"/>
<path class="ak-draw" data-at="0" pathLength="100" d="M6,${sea} C60,${sea - 6} 120,${sea + 6} 180,${sea} S300,${sea - 6} 354,${sea}" fill="none" stroke="#CFE7DC" stroke-opacity=".8" stroke-width="1.8" stroke-linecap="round"/>
<path class="ak-draw" data-at="1" pathLength="100" d="${trough(typ, 0, 1).replace(/^M18/, 'M10')}" fill="none" stroke="#82B6FF" stroke-opacity=".75" stroke-width="3.2" stroke-linecap="round"/>
<g class="ak-draw" data-at="2" fill="none" stroke="#F2C46B" stroke-width="2" stroke-linecap="round" filter="url(#${p}-glow)">${picks.map((d, k) => `<path pathLength="100" d="${trough(d, k + 1, picks.length + 1)}"/>`).join('')}</g>
</svg>`;
}
function fillSvg(p, frac) {
  const H = 150, y = 132 - 104 * Math.max(0, Math.min(1, frac));
  return `<svg class="ra-svg" viewBox="0 0 360 ${H}" aria-hidden="true" focusable="false">${defs(p)}
${hills(p, H, 0.5)}
<g transform="translate(140,28) scale(1)"><clipPath id="${p}-in"><path d="${JAR}"/></clipPath><path d="${JAR}" fill="url(#${p}-glz)" stroke="#264A3F" stroke-width=".9"/>
<g clip-path="url(#${p}-in)"><rect class="ak-up" data-at="1" data-v="k:1" x="-4" y="${F(y - 28)}" width="88" height="${F(132 - y)}" fill="url(#${p}-gold)" fill-opacity=".9"/></g></g>
<path class="ak-draw" data-at="0" pathLength="100" d="M110,132 H250" stroke="#F4F1EA" stroke-opacity=".5" stroke-width="1.4"/>
<g class="ak-pop" data-at="2"><path d="M128,28 H232" stroke="#F2C46B" stroke-width="1.6" stroke-dasharray="4 4"/><circle cx="244" cy="28" r="5" fill="#F2C46B"/></g>
</svg>`;
}
/** 처음(#/start) — comment.js startComment(다섯 곳의 가장 깊게 떨어진 때 · 보통 회사) · 3년이 모자란 판은 쌓인 날 항아리 */
export function startArt(board, cm) {
  const s = board?.start; if (!s || !cm) return null;
  if (!s.ready) {
    const need = s.rule?.days ?? 756, have = s.have?.days ?? 0;
    const labels = lab(col('a', tag(plain(cm.head)), big(cm.big?.t ?? '')), srow(sealEl(null, `지금은 ${have}거래일`, 3)));
    const stage = artStage({key: 'start-wait', svg: fillSvg('akw', have / need), labels: check(labels, {have, need}),
      steps: [{c: 0, at: 0, ms: 900}, {c: 1, at: 1, ms: 1400}, {c: 2, at: 2, ms: 900}, {c: 3, at: 3, ms: 900}], says: [[plain(cm.head)], [`지금은 ${have}거래일`], [cm.big?.t ?? ''], []]});
    return artSection({key: 'start', label: '처음', kicker: '처음', when: when(board.asOf), stage});
  }
  const picks = (s.picks ?? []).map(x => x.mdd).filter(finite), typ = s.typical?.mdd;
  if (!picks.length || !finite(typ)) return null;
  const worst = Math.min(...picks);
  const labels = lab(
    col('a', tag(`${picks.length}곳 · 가장 깊게 떨어진 때`), big(pct(worst, 0), -1)),
    col('b', tag(`보통 회사(${s.measured}곳 가운데 값)`), big(pct(typ, 0), -1)),
    srow(sealEl(null, plain(cm.head), 3)));
  const stage = artStage({key: 'start', svg: wavesSvg('akt', picks, typ), labels: check(labels, {worst: +worst.toFixed(6), typ: +typ.toFixed(6), n: picks.length}),
    steps: [{c: 0, at: 0, ms: 900}, {c: 1, at: 1, ms: 1400}, {c: 2, at: 2, ms: 1400}, {c: 3, at: 3, ms: 900}],
    says: [[plain(cm.head)], [`보통 회사(${s.measured}곳 가운데 값)`, pct(typ, 0)], [`${picks.length}곳`, pct(worst, 0)], [plain(cm.cap)]]});
  return artSection({key: 'start', label: '처음', kicker: '처음', when: `${korDate(board.asOf)} 종가까지 지난 3년 기록`, stage});
}

/* ═════════ 11. 해시계(앙부일구) — 안내(하루 시간 띠) ═════════ */
function dialSvg(p, bars) {
  const H = 178, cx = 180, cy = 158, R = 140, a = x => Math.PI - (x - 6) / 16 * Math.PI; // 06시(왼쪽 끝) ~ 22시(오른쪽 끝)
  const pt = (x, r = R) => [cx + Math.cos(a(x)) * r, cy - Math.sin(a(x)) * r];
  const arc = (x0, x1, r) => { const [ax, ay] = pt(x0, r), [bx, by] = pt(x1, r); return `M${F(ax)},${F(ay)} A${r},${r} 0 0 1 ${F(bx)},${F(by)}`; };
  const ticks = Array.from({length: 17}, (_, i) => { const x = 6 + i, [ax, ay] = pt(x, R - 6), [bx, by] = pt(x, R + (i % 3 === 0 ? 6 : 2)); return `<path d="M${F(ax)},${F(ay)} L${F(bx)},${F(by)}"/>`; }).join('');
  const reg = bars.find(b => b[3] === 'reg'), nxt = bars.find(b => b[3] === 'nxt'), [sx, sy] = pt(reg[2], R - 22);
  return `<svg class="ra-svg" viewBox="0 0 360 ${H}" aria-hidden="true" focusable="false">${defs(p)}
<path class="ak-draw" data-at="0" pathLength="100" d="${arc(6, 22, R)}" fill="none" stroke="#9CCDB8" stroke-opacity=".7" stroke-width="2.4"/>
<g stroke="#CFE7DC" stroke-opacity=".4" stroke-width="1">${ticks}</g>
<path d="M${cx - R},${cy} H${cx + R}" stroke="#4E6E62" stroke-width="1.4"/>
<path class="ak-draw" data-at="1" pathLength="100" d="${arc(reg[1], reg[2], R - 22)}" fill="none" stroke="#F2C46B" stroke-width="11" stroke-linecap="round"/>
<path class="ak-draw" data-at="2" pathLength="100" d="${arc(nxt[1], nxt[2], R - 44)}" fill="none" stroke="#8FD3B6" stroke-width="7" stroke-linecap="round" stroke-opacity=".85"/>
<g class="ak-pop" data-at="3"><path d="M${cx},${cy} L${F(sx)},${F(sy)}" stroke="#F4F1EA" stroke-width="2"/><circle cx="${F(sx)}" cy="${F(sy)}" r="16" fill="url(#${p}-sun)"/><circle cx="${F(sx)}" cy="${F(sy)}" r="7" fill="#E8574F"/></g>
<circle cx="${cx}" cy="${cy}" r="4" fill="#CFE7DC"/>
</svg>`;
}
/** 안내(#/guide) — 정규장 · NXT · 종가 시각(view-guide.js DAY_BARS 와 같은 줄) */
export function guideArt(bars, hm) {
  const reg = bars?.find(b => b[3] === 'reg'), nxt = bars?.find(b => b[3] === 'nxt');
  if (!reg || !nxt) return null;
  const labels = lab(
    col('a', tag('정규장'), h('p', {class: 'ra-m ra-mt'}, `${hm(reg[1])}~${hm(reg[2])}`), sealEl('종가', hm(reg[2]), 4)),
    col('b', tag(nxt[0]), h('p', {class: 'ra-m ra-mt'}, `${hm(nxt[1])}~${hm(nxt[2])}`)));
  labels.querySelector('.ra-cb .ra-tag')?.setAttribute('data-ident', '');
  const stage = artStage({key: 'guide', svg: dialSvg('akh', bars), labels: check(labels, {reg: [reg[1], reg[2]], nxt: [nxt[1], nxt[2]]}),
    steps: [{c: 0, at: 0, ms: 1000}, {c: 1, at: 1, ms: 1200}, {c: 2, at: 2, ms: 1200}, {c: 3, at: 3, ms: 850}, {c: 3, at: 4, ms: 850}],
    says: [['한국 주식시장 안내'], ['정규장', `${hm(reg[1])}~${hm(reg[2])}`], [nxt[0], `${hm(nxt[1])}~${hm(nxt[2])}`], ['종가', hm(reg[2])]]});
  return artSection({key: 'guide', label: '시간(한국 시각)', kicker: '시간(한국 시각)', stage});
}

/* ═════════ 12. 항아리 여섯 — 긴 눈(10 · 20 · 30년 · 주식 · 서울 아파트) ═════════ */
function jarsSvg(p, rows, start) {
  const H = 188, base = 176, top = 20, mx = Math.max(...rows.flatMap(r => [r.a, r.b])), k = (base - top) / mx, w = 40;
  const shell = (x, kind) => `<rect x="${F(x - w / 2)}" y="${F(top)}" width="${w}" height="${F(base - top)}" rx="14" fill="${kind === 'a' ? `url(#${p}-glz)` : '#E9E4D8'}" fill-opacity="${kind === 'a' ? '.20' : '.10'}" stroke="${kind === 'a' ? '#9CCDB8' : '#E9E4D8'}" stroke-opacity=".35"/>`;
  const fill = (x, v, kind) => { const hh = Math.max(4, v * k); return `<rect x="${F(x - w / 2 + 3)}" y="${F(base - hh)}" width="${w - 6}" height="${F(hh)}" rx="11" fill="${kind === 'a' ? `url(#${p}-gold)` : '#F4F1EA'}" fill-opacity="${kind === 'a' ? '.92' : '.78'}"/>`; };
  const ly = base - start * k, xs = [62, 180, 298];
  // 해마다 두 그릇(주식 · 아파트)을 한 묶음으로 — 한 번에 하나(규칙 28)
  return `<svg class="ra-svg" viewBox="0 0 360 ${H}" aria-hidden="true" focusable="false">${defs(p)}
${rows.map((r, i) => shell(xs[i] - 22, 'a') + shell(xs[i] + 22, 'b')).join('')}
${rows.map((r, i) => `<g class="ak-up" data-at="${i + 1}">${fill(xs[i] - 22, r.a, 'a')}${fill(xs[i] + 22, r.b, 'b')}</g>`).join('')}
<path class="ak-x" data-at="0" d="M14,${F(ly)} H346" stroke="#F4F1EA" stroke-opacity=".7" stroke-width="1.4" stroke-dasharray="4 4"/>
</svg>`;
}
/** 긴 눈(#/long) — 500만 원 · 10 · 20 · 30년 뒤(가장 나빴던 때) · 주식 · 서울 아파트 */
export function longArt(LONG, man, START) {
  const stock = LONG?.[0]?.[2]?.[0]?.[1], home = LONG?.[1]?.[2]?.[0]?.[1];
  if (!stock || !home) return null;
  const rows = [10, 20, 30].map(y => ({y, a: stock[y]?.[0], b: home[y]?.[0]})).filter(r => finite(r.a) && finite(r.b));
  if (rows.length !== 3) return null;
  const labels = h('div', {class: 'ra-lab ra-three'}, ...rows.map(r => h('div', {class: 'ra-col ra-c3'}, h('p', {class: 'ra-tag'}, `${r.y}년 뒤`), h('p', {class: 'ra-m3 ra-ga'}, man(r.a)), h('p', {class: 'ra-m3 ra-gb'}, man(r.b)))));
  const wrap = h('div', {class: 'ra-fwrap'}, labels, h('p', {class: 'ra-key'}, h('i', {class: 'ra-dot ra-ga', 'aria-hidden': 'true'}), '주식 — 코스피 · 배당 넣음(가정)', ' ', h('i', {class: 'ra-dot ra-gb', 'aria-hidden': 'true'}), '서울 아파트 — 값만'));
  // 세 해를 하나씩(10 → 20 → 30) — 짝(주식 · 아파트)은 한 묶음(jarsSvg)
  const stage = artStage({key: 'long', svg: jarsSvg('akj', rows, START), labels: check(wrap, {rows: rows.map(r => [r.y, r.a, r.b]), start: START}),
    steps: [{c: 0, at: 0, ms: 950}, {c: 1, at: 1, ms: 1150}, {c: 2, at: 2, ms: 1150}, {c: 3, at: 3, ms: 1150}],
    says: [['500만 원을 오래 들고 있었다면'], ['10년 뒤', man(rows[0].a), man(rows[0].b)], ['20년 뒤', man(rows[1].a), man(rows[1].b)], ['30년 뒤', man(rows[2].a), man(rows[2].b)]]});
  return artSection({key: 'long', label: '500만 원을 오래 들고 있었다면', kicker: '500만 원을 오래 들고 있었다면', stage});
}

/* ═════════ 13. 돌계단 — 한국 순위(25개 시장 · 10년 수익) ═════════ */
function stairsSvg(p, rank, n) {
  const H = 186, x0 = 16, y0 = 176, sw = 328 / n, shh = 150 / n;
  const steps = Array.from({length: n}, (_, i) => `<rect x="${F(x0 + i * sw)}" y="${F(y0 - (i + 1) * shh)}" width="${F(sw - 1.2)}" height="${F((i + 1) * shh)}" fill="${i === n - rank ? '#3E6E5E' : '#22352E'}" stroke="#4E6E62" stroke-opacity=".5" stroke-width=".6"/>`).join('');
  const i = n - rank, lx = x0 + i * sw + sw / 2, ly = y0 - (i + 1) * shh - 14;
  return `<svg class="ra-svg" viewBox="0 0 360 ${H}" aria-hidden="true" focusable="false">${defs(p)}
<g class="ak-up" data-at="0">${steps}</g>
<g class="ak-mv" data-at="1" data-v="x0:${F(-(lx - x0 - sw / 2))}px;y0:${F(y0 - shh - 14 - ly)}px"><circle cx="${F(lx)}" cy="${F(ly)}" r="16" fill="url(#${p}-sun)"/><ellipse cx="${F(lx)}" cy="${F(ly)}" rx="7" ry="9" fill="url(#${p}-gold)"/><rect x="${F(lx - 4)}" y="${F(ly - 11)}" width="8" height="3" rx="1" fill="#3A2A22"/></g>
<circle class="ak-pop" data-at="2" cx="${F(lx)}" cy="${F(ly)}" r="26" fill="none" stroke="#F2C46B" stroke-opacity=".7" stroke-width="1.4"/>
</svg>`;
}
/** 한국 순위(#/korea) — view-korea.js RANKS 첫 줄(10년 수익) */
export function koreaArt(RANKS) {
  const r = RANKS?.[0]; if (!r) return null;
  const [what, v, rank, n, how] = r;
  const labels = lab(
    col('a', tag(what), h('p', {class: 'ra-m ra-mb'}, v), sealEl(null, `${n}곳 중 ${rank}위`, 3)),
    how ? col('b', h('p', {class: 'ra-sub'}, how)) : null);
  const stage = artStage({key: 'korea', svg: stairsSvg('akk', rank, n), labels: check(labels, {rank, n, v}),
    steps: [{c: 0, at: 0, ms: 1100}, {c: 1, at: 1, ms: 1500}, {c: 2, at: 2, ms: 850}, {c: 3, at: 3, ms: 900}],
    says: [[what, v], [`${n}곳 중 ${rank}위`], how ? [how] : [], []]});
  return artSection({key: 'korea', label: '한국 주식시장은 몇 위인가', kicker: '한국 주식시장은 몇 위인가', stage});
}
