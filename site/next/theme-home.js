/* 테마 시계 첫 화면 칸(#/ 맨 위 · app.js 가 처음부터 부름) + 쪽들이 같이 쓰는 그림 조각(시계 · 점 넷 · 막대 · 줄 · 성적표 · 다음 단추)
   사장님 2026-10-19(싱가포르) 16:06 · 16:46 · 16:54 — 셈은 결정표 그대로(올릴 때 /next/data/theme-home.json · theme.json) · 이 파일은 그리기만
   첫 그림이 가볍게(느린 4G 2.5초 · check_white ③): 이 파일 + theme-rule.js + theme-home.json(4KB 남짓)만 · 쪽들(p-theme.js)은 누를 때 받음
   글은 textContent 로만(보안 규칙) · 앞날 말 없음 · 사고팔기 권하지 않음 */
import {ZONES, RULE, pp, nearBar} from './theme-rule.js';

const nx = () => globalThis.NX;
const h = (...a) => nx().h(...a);
const sv = (...a) => nx().sv(...a);
const enc = s => encodeURIComponent(s);
const num = n => Number(n).toLocaleString('ko-KR');
const cls = v => (!Number.isFinite(v) ? '' : Math.round(v * 10) === 0 ? 'fl' : v > 0 ? 'up' : 'dn');
export const indOf = (TH, n) => TH?.inds?.find(i => i.n === n) ?? null;
const okHome = j => !!j && j.schema === 'dori-theme-1-home' && Array.isArray(j.inds) && j.order && j.count;
/** 첫 화면 자료 — app.js 공용 받기(need('themeHome') · index.html 이 미리 받음 · 15초 뒤 다시) */
export const themeHomeData = () => (nx()?.need ? nx().need('themeHome').then(j => (okHome(j) ? j : null)).catch(() => null) : Promise.resolve(null));

/** 쪽 아래 「다음」 큰 단추 하나 */
export function nextBtn(title, href, lead = '다음') {
  return h('a', {class: 'th-next', href}, h('span', {class: 'th-nx'}, h('small', {text: lead}), h('b', {text: title})), h('i', {'aria-hidden': 'true', text: '›'}));
}
/** 있는 쪽 맨 아래 「다음」 한 줄(app.js flowFoot) — 가운데 맞춘 글 한 덩이(그 쪽 「글 시작 왼쪽 줄 셋」 규칙 [10] 7 에 줄을 더하지 않음) */
export function footBtn(title, href) { return h('a', {class: 'th-next th-one', href}, h('span', {text: `다음 · ${title} ›`})); }
/* ── 그림: 테마 시계(가로 = 한 달 동안 시장보다 더 오른 %p · 세로 = 지난 닷새 · 꽃 선 = 가로 5) ── */
let HIT_SEQ = 0;
/** 번호 하나의 누르는 칸 — (cx, cy) 둘레 네모(±r)를 다른 번호와의 가운데 선으로 자름(그 번호가 가장 가까운 곳) · 꼭짓점 목록 */
function voronoiCell(cx, cy, r, others) {
  let poly = [[cx - r, cy - r], [cx + r, cy - r], [cx + r, cy + r], [cx - r, cy + r]];
  for (const o of others) {
    const nx = o.cx - cx, ny = o.cy - cy, m = ((o.cx * o.cx + o.cy * o.cy) - (cx * cx + cy * cy)) / 2; // 남길 곳: nx·x + ny·y ≤ m
    if (!nx && !ny) continue;
    const side = ([x, y]) => nx * x + ny * y - m, out = [];
    for (let j = 0; j < poly.length; j++) {
      const P = poly[j], Q = poly[(j + 1) % poly.length], a = side(P), b = side(Q);
      if (a <= 0) out.push(P);
      if ((a < 0 && b > 0) || (a > 0 && b < 0)) { const t = a / (a - b); out.push([P[0] + (Q[0] - P[0]) * t, P[1] + (Q[1] - P[1]) * t]); }
    }
    poly = out; if (poly.length < 3) break;
  }
  return poly;
}
function txt(x, y, s, a = {}) { const e = sv('text', {x, y, ...a}); e.textContent = s; return e; }
/** links = 첫 화면 시계 — 주황 번호 셋은 그 업종 쪽 · 싹 칸은 싹 자리 전부로 넘어감(사장님 2026-10-20 07:05 「여기 주황색 있는 4곳 클릭하면 해당페이지로 넘어가게」 · 07:08 「응」)
 *  그림(점 · 길 · 글)은 aria-hidden 묶음 · 누르는 곳만 <a>(글 읽기 프로그램 · 키보드도 감) · 누르는 자리는 투명 원 · 네모(320 폭에서도 48px 넘게 — 흰 판 새 단추) */
export function clock(TH, {hi = null, marks = null, W = 326, H = 300, links = false} = {}) {
  const X0 = RULE.bloomX, pad = 14, hiI = hi ? indOf(TH, hi) : null;
  const hp = (hiI ? [[hiI.x, hiI.y], ...(Array.isArray(hiI.t) ? hiI.t : [])] : (marks ?? []).map(n => indOf(TH, n)).filter(Boolean).map(i => [i.x, i.y])).filter(([a, b]) => Number.isFinite(a) && Number.isFinite(b));
  const SX = Math.max(15, ...hp.map(([a]) => Math.ceil(Math.abs(a - X0) * 1.15))), SY = Math.max(6, ...hp.map(([, b]) => Math.ceil(Math.abs(b) * 1.15))); // 고른 업종(지나온 길 꼬리 · 첫 화면 번호 셋)이 끝에 붙거나 번호가 그림 밖으로 나가지 않게 눈금을 넓힘(2026-10-19 실제 사이트 첫 화면 ① 이 잘림)
  const X = v => W / 2 + Math.max(-1, Math.min(1, (v - X0) / SX)) * (W / 2 - pad);
  const Y = v => H / 2 - Math.max(-1, Math.min(1, v / SY)) * (H / 2 - pad);
  const s = sv('svg', links ? {class: 'th-clock', viewBox: `0 0 ${W} ${H}`, width: '100%', role: 'group', 'aria-label': '테마 시계'} : {class: 'th-clock', viewBox: `0 0 ${W} ${H}`, width: '100%', 'aria-hidden': 'true', focusable: 'false'});
  const g = links ? sv('g', {'aria-hidden': 'true'}) : s, tap = []; // g = 그림 · tap = 누르는 곳(그림 위에 얹음)
  const defs = sv('defs'), mk = sv('marker', {id: 'th-ah', viewBox: '0 0 10 10', refX: 8, refY: 5, markerWidth: 7, markerHeight: 7, orient: 'auto'});
  mk.append(sv('path', {d: 'M0 0L10 5L0 10z', class: 'th-arw'})); defs.append(mk); s.append(defs); if (links) s.append(g);
  g.append(sv('rect', {x: 0, y: 0, width: W / 2, height: H / 2, class: 'th-sz'}), sv('line', {x1: 0, y1: H / 2, x2: W, y2: H / 2, class: 'th-ax'}), sv('line', {x1: W / 2, y1: H / 2, x2: W / 2, y2: H, class: 'th-ax'}),
    sv('line', {x1: W / 2, y1: 0, x2: W / 2, y2: H / 2, class: 'th-bl'}));
  for (const d of [`M ${W / 2 - 50} 40 Q ${W / 2} 14 ${W / 2 + 50} 40`, `M ${W - 40} ${H / 2 - 50} Q ${W - 14} ${H / 2} ${W - 40} ${H / 2 + 50}`, `M ${W / 2 + 50} ${H - 40} Q ${W / 2} ${H - 14} ${W / 2 - 50} ${H - 40}`, `M 40 ${H / 2 + 50} Q 14 ${H / 2} 40 ${H / 2 - 50}`])
    g.append(sv('path', {d, class: 'th-turn', 'marker-end': 'url(#th-ah)'}));
  const inds = TH.inds ?? [], mark = hi ? [hi] : (marks ?? []);
  for (const i of inds) if (mark.includes(i.n) && Array.isArray(i.t)) g.append(sv('polyline', {points: i.t.map(([a, b]) => X(a).toFixed(1) + ',' + Y(b).toFixed(1)).join(' '), class: 'th-tail'}));
  for (const i of inds) { const on = mark.includes(i.n) || (!hi && i.z === 'S'); g.append(sv('circle', {cx: X(i.x).toFixed(1), cy: Y(i.y).toFixed(1), r: on ? 6 : 3.5, class: on ? 'th-dot on' : 'th-dot'})); }
  if (hi) { const i = indOf(TH, hi); if (i) { const lx = X(i.x), right = lx < W / 2; g.append(txt((right ? lx + 12 : lx - 12).toFixed(1), (Y(i.y) - 12).toFixed(1), i.n, {class: 'th-lb', 'text-anchor': right ? 'start' : 'end'})); } }
  else {
    const bs = (marks ?? []).map((n, k) => { const i = indOf(TH, n); return i ? {i, k, cx: X(i.x) + (k % 2 ? 16 : -16), cy: Y(i.y) - 18} : null; }).filter(Boolean);
    for (const {i, k, cx, cy} of bs) {
      const parts = [sv('circle', {cx: cx.toFixed(1), cy: cy.toFixed(1), r: 12, class: 'th-nb'}), txt(cx.toFixed(1), (cy + 6).toFixed(1), String(k + 1), {class: 'th-nbt', 'text-anchor': 'middle'})];
      if (!links) { g.append(...parts); continue; }
      const a = sv('a', {href: '#/t/i/' + enc(i.n), class: 'th-tap th-tapn', 'aria-label': `${k + 1}번 ${i.n} 보기`}); // 번호 = 그 업종 쪽
      // 누르는 원 r 33(320 폭 51px · 흰 판 새 단추 48) — 번호끼리 가까우면 원이 겹쳐 옆 번호를 덮음(2026-10-20 ① ③ 35 떨어짐) →
      // 원을 「이 번호가 가장 가까운 곳」만 남게 자름(가까운 번호 쪽으로 감 · 보이는 번호는 늘 제 고리)
      const id = 'th-hc' + (++HIT_SEQ), cell = voronoiCell(cx, cy, 33, bs.filter(o => o.k !== k));
      const cp = sv('clipPath', {id}); cp.append(sv('polygon', {points: cell.map(([x, y]) => x.toFixed(1) + ',' + y.toFixed(1)).join(' ')})); defs.append(cp);
      a.append(sv('circle', {cx: cx.toFixed(1), cy: cy.toFixed(1), r: 33, class: 'th-hit', 'clip-path': `url(#${id})`}), ...parts); tap.push(a);
    }
  }
  g.append(txt(10, 24, ZONES.S, {class: 'th-zl th-zs'}), txt(W - 10, 24, ZONES.B, {class: 'th-zl', 'text-anchor': 'end'}), txt(W - 10, H - 10, ZONES.W, {class: 'th-zl th-zq', 'text-anchor': 'end'}), txt(10, H - 10, ZONES.Q, {class: 'th-zl th-zq'}),
    txt(W / 2 + 6, H / 2 - 8, '꽃 선', {class: 'th-bt'}));
  if (links) { // 싹 칸(투명 네모 — 점 · 「싹」 글 위) 먼저 · 번호 셋이 그 위
    const za = sv('a', {href: '#/t/sprout', class: 'th-tap th-tapz', 'aria-label': '싹 자리 전부 보기'});
    za.append(sv('rect', {x: 0, y: 0, width: W / 2, height: H / 2, class: 'th-hit'})); s.append(za, ...tap.reverse()); // ① 이 맨 위(겹치면 앞 번호)
  }
  return s;
}
/** 점 넷(채운 동그라미 = 참) */
export function dots(i) { const s = sv('svg', {class: 'th-dots', viewBox: '0 0 88 20', width: 88, height: 20, role: 'img', 'aria-label': '점 넷 가운데 ' + i.sc + '개'}); i.dots.forEach((v, k) => s.append(sv('circle', {cx: 10 + k * 22, cy: 10, r: 7, class: v ? 'th-d on' : 'th-d'}))); return s; }
/** 꽃까지 막대 */
export function bar(x) { const W = 64, s = sv('svg', {class: 'th-bar', viewBox: `0 0 ${W} 8`, width: W, height: 8, preserveAspectRatio: 'none', 'aria-hidden': 'true'}); s.append(sv('rect', {x: 0, y: 0, width: W, height: 8, rx: 4, class: 'th-bar0'}), sv('rect', {x: 0, y: 0, width: Math.round(nearBar(x) * W), height: 8, rx: 4, class: 'th-bar1'})); return s; } // 길이 64 하나(줄마다 같은 길이)
/** 줄 하나(싹 · 꽃 · 시듦 목록 · 첫 화면) */
export function row(i, k, {num: showNum = true, meta = 'near'} = {}) {
  const tag = i.d === 1 ? '새로 들어옴' : i.d + '일째';
  const mid = h('span', {class: 'th-mid2'}, h('span', {class: 'th-rn', text: i.n}),
    meta === 'near' ? h('span', {class: 'th-meta'}, h('em', {class: 'th-tg' + (i.d === 1 ? ' new' : ''), text: tag}), h('span', {class: 'th-to'}, h('span', {text: '꽃까지'}), bar(i.x))) // 둘째 줄 며칠째 · 셋째 줄 「꽃까지 ▬」(견본 차례 · 줄 높이 늘 같게 · 새 눈 검사 2026-10-19 22시)
      : h('span', {class: 'th-meta'}, h('em', {class: 'th-tg', text: tag}), h('span', {text: '한 달 시장보다'}), h('b', {class: cls(i.x), text: pp(i.x) + '%p'})));
  return h('a', {class: 'th-row', href: '#/t/i/' + enc(i.n)}, showNum ? h('span', {class: 'th-n' + (k < 3 ? ' th-top' : ''), text: String(k + 1)}) : null, mid, dots(i), h('i', {class: 'th-go', 'aria-hidden': 'true', text: '›'}));
}
/** 꽃 · 시듦 목록 줄(견본 flow36 5 · 6 쪽 그대로) — 이름 · 한 달 동안 시장보다 더 오른 %p · 「한 달」 */
export function simpleRow(i, {zone = false} = {}) {
  return h('a', {class: 'th-srow', href: '#/t/i/' + enc(i.n)}, h('span', {class: 'th-rn', text: i.n}), zone ? h('b', {class: 'th-z ' + i.z, text: ZONES[i.z] ?? '?'}) : null, h('b', {class: 'th-sv ' + cls(i.x), text: pp(i.x) + '%p'}), h('span', {class: 'th-sk', text: '한 달'}));
}
export const yearsOf = TH => { const a = Date.parse(TH.recFrom), b = Date.parse(TH.recTo); return Number.isFinite(a) && Number.isFinite(b) ? Math.max(1, Math.round((b - a) / (365.25 * 864e5))) : null; };
/** 성적표 한 줄 — 지난 기록에서 센 횟수(앞날을 맞히는 숫자 아님 · 결정표 6) */
export function recordLine(TH) {
  const R = TH.record, y = yearsOf(TH);
  if (!R?.real?.n || R.real.p == null || R.all.p == null) return h('p', {class: 'th-rec', text: '? 지난 기록을 아직 못 셌어요.'});
  return h('p', {class: 'th-rec'}, h('span', {text: '지난 ' + (y ?? '?') + '년 기록'}),
    h('span', {text: R.more ? `진짜 싹이었던 날, 100번 가운데 ${Math.round(R.real.p)}번은 한 달 뒤 꽃 선을 넘었어요.` : `진짜 싹이었던 날도 아무 업종과 차이가 없었어요.`}),
    h('span', {text: `아무 업종은 100번 가운데 ${Math.round(R.all.p)}번이었어요.`}));
}

/* ── 첫 화면(#/) 맨 위 칸 — app.js vHomeAll 이 부름(본질 세 줄 · 찾기 칸 · 바로 가기 넷 · 전부 보기는 그 아래 그대로) ── */
/** 관심 업종을 담은 기기인가(theme-watch.js 를 받기 전 · 저장소 한 칸만 봄) */
const hasWatch = () => { try { const a = JSON.parse(localStorage.getItem('dori:watch-ind') ?? '[]'); return Array.isArray(a) && a.length > 0; } catch { return false; } };
export async function homeBlock() {
  const TH = await themeHomeData();
  const box = h('section', {class: 'th-home', 'data-w': 'theme', 'aria-label': '테마 시계'});
  if (!TH) { box.append(h('p', {class: 'empty', text: '? 테마 시계 자료를 받지 못했어요. 잠시 뒤 다시 열어 주세요.'})); return box; }
  const S = TH.order.S.map(n => indOf(TH, n)).filter(Boolean), top = S.slice(0, 3);
  box.append(h('div', {class: 'th-map'}, clock(TH, {marks: top.map(i => i.n), links: true}), h('p', {class: 'th-cap th-cap1', text: `업종은 시계 방향으로 돌아요. 잠잠 → 싹 → 꽃 → 시듦. 지금 싹 자리에 ${num(TH.count.S)}곳이 있어요.`})));
  if (hasWatch()) { try { const nb = (await import('./theme-watch.js')).noticeBox(TH); if (nb) box.append(nb); } catch { /* 소식 칸 없이 */ } } // 관심 업종 소식(사이트 안 알림 · 2026-10-19 「다해」) — 담은 기기만 받음
  box.append(TH.count.real ? h('h2', {class: 'th-ans'}, h('span', {text: '진짜 싹 '}), h('em', {'data-tr': '업종', text: num(TH.count.real) + '곳'})) : h('h2', {class: 'th-ans', text: '지금은 진짜 싹이 없어요'})); // data-tr = 영어에서 「n곳」을 업종 수로(i18n.js 자리 표)
  box.append(h('div', {class: 'th-three', 'data-tr': '업종'}, ...[[TH.count.real, '진짜 싹'], [TH.count.fresh, '새로 들어옴'], [TH.count.S, '싹 자리']].map(([n, t]) => h('p', {}, h('b', {text: num(n) + '곳'}), h('span', {text: t})))));
  box.append(h('p', {class: 'th-sub', text: '점 넷이 다 차면 진짜 싹이에요. 점이 많이 찬 순서예요.'})); // 싹 순서 = 점 수 → 지난 닷새(결정표 4)
  box.append(h('div', {class: 'th-rows'}, top.map((i, k) => row(i, k))));
  box.append(h('a', {class: 'th-more', href: '#/t/sprout'}, h('span', {text: `싹 자리 ${num(TH.count.S)}곳 모두 보기`}), h('i', {'aria-hidden': 'true', text: '›'})));
  box.append(recordLine(TH), nextBtn('시계 읽는 법', '#/t/how')); // 기준 날은 첫 화면에 안 씀(보이는 날짜는 띠에 한 번 — [6] 2 · next_check) · 테마 쪽마다 아래에 씀
  box.append(h('a', {class: 'th-hi', href: '#/t/hello', text: '처음이세요? 돌이 인사 ›'})); // 서른여섯 장의 1장(돌이 인사)으로 가는 고리 — 가운데 맞춘 한 줄(2026-10-19 사장님 「다해」 · 못 한 것 5)
  return box;
}
