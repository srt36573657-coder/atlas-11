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
function txt(x, y, s, a = {}) { const e = sv('text', {x, y, ...a}); e.textContent = s; return e; }
export function clock(TH, {hi = null, marks = null, W = 326, H = 300} = {}) {
  const X0 = RULE.bloomX, pad = 14, hiI = hi ? indOf(TH, hi) : null;
  const hp = hiI ? [[hiI.x, hiI.y], ...(Array.isArray(hiI.t) ? hiI.t : [])].filter(([a, b]) => Number.isFinite(a) && Number.isFinite(b)) : [];
  const SX = Math.max(15, ...hp.map(([a]) => Math.ceil(Math.abs(a - X0) * 1.15))), SY = Math.max(6, ...hp.map(([, b]) => Math.ceil(Math.abs(b) * 1.15))); // 고른 업종(지나온 길)은 꼬리가 끝에 붙지 않게 눈금을 넓힘
  const X = v => W / 2 + Math.max(-1, Math.min(1, (v - X0) / SX)) * (W / 2 - pad);
  const Y = v => H / 2 - Math.max(-1, Math.min(1, v / SY)) * (H / 2 - pad);
  const s = sv('svg', {class: 'th-clock', viewBox: `0 0 ${W} ${H}`, width: '100%', 'aria-hidden': 'true', focusable: 'false'});
  const defs = sv('defs'), mk = sv('marker', {id: 'th-ah', viewBox: '0 0 10 10', refX: 8, refY: 5, markerWidth: 7, markerHeight: 7, orient: 'auto'});
  mk.append(sv('path', {d: 'M0 0L10 5L0 10z', class: 'th-arw'})); defs.append(mk); s.append(defs);
  s.append(sv('rect', {x: 0, y: 0, width: W / 2, height: H / 2, class: 'th-sz'}), sv('line', {x1: 0, y1: H / 2, x2: W, y2: H / 2, class: 'th-ax'}), sv('line', {x1: W / 2, y1: H / 2, x2: W / 2, y2: H, class: 'th-ax'}),
    sv('line', {x1: W / 2, y1: 0, x2: W / 2, y2: H / 2, class: 'th-bl'}));
  for (const d of [`M ${W / 2 - 50} 40 Q ${W / 2} 14 ${W / 2 + 50} 40`, `M ${W - 40} ${H / 2 - 50} Q ${W - 14} ${H / 2} ${W - 40} ${H / 2 + 50}`, `M ${W / 2 + 50} ${H - 40} Q ${W / 2} ${H - 14} ${W / 2 - 50} ${H - 40}`, `M 40 ${H / 2 + 50} Q 14 ${H / 2} 40 ${H / 2 - 50}`])
    s.append(sv('path', {d, class: 'th-turn', 'marker-end': 'url(#th-ah)'}));
  const inds = TH.inds ?? [], mark = hi ? [hi] : (marks ?? []);
  for (const i of inds) if (mark.includes(i.n) && Array.isArray(i.t)) s.append(sv('polyline', {points: i.t.map(([a, b]) => X(a).toFixed(1) + ',' + Y(b).toFixed(1)).join(' '), class: 'th-tail'}));
  for (const i of inds) { const on = mark.includes(i.n) || (!hi && i.z === 'S'); s.append(sv('circle', {cx: X(i.x).toFixed(1), cy: Y(i.y).toFixed(1), r: on ? 6 : 3.5, class: on ? 'th-dot on' : 'th-dot'})); }
  if (hi) { const i = indOf(TH, hi); if (i) { const lx = X(i.x), right = lx < W / 2; s.append(txt((right ? lx + 12 : lx - 12).toFixed(1), (Y(i.y) - 12).toFixed(1), i.n, {class: 'th-lb', 'text-anchor': right ? 'start' : 'end'})); } }
  else (marks ?? []).forEach((n, k) => { const i = indOf(TH, n); if (!i) return; const cx = X(i.x) + (k % 2 ? 16 : -16), cy = Y(i.y) - 18; s.append(sv('circle', {cx: cx.toFixed(1), cy: cy.toFixed(1), r: 12, class: 'th-nb'}), txt(cx.toFixed(1), (cy + 6).toFixed(1), String(k + 1), {class: 'th-nbt', 'text-anchor': 'middle'})); });
  s.append(txt(10, 24, ZONES.S, {class: 'th-zl th-zs'}), txt(W - 10, 24, ZONES.B, {class: 'th-zl', 'text-anchor': 'end'}), txt(W - 10, H - 10, ZONES.W, {class: 'th-zl th-zq', 'text-anchor': 'end'}), txt(10, H - 10, ZONES.Q, {class: 'th-zl th-zq'}),
    txt(W / 2 + 6, H / 2 - 8, '꽃 선', {class: 'th-bt'}));
  return s;
}
/** 점 넷(채운 동그라미 = 참) */
export function dots(i) { const s = sv('svg', {class: 'th-dots', viewBox: '0 0 88 20', width: 88, height: 20, role: 'img', 'aria-label': '점 넷 가운데 ' + i.sc + '개'}); i.dots.forEach((v, k) => s.append(sv('circle', {cx: 10 + k * 22, cy: 10, r: 7, class: v ? 'th-d on' : 'th-d'}))); return s; }
/** 꽃까지 막대 */
export function bar(x) { const W = 64, s = sv('svg', {class: 'th-bar', viewBox: `0 0 ${W} 8`, width: W, height: 8, 'aria-hidden': 'true'}); s.append(sv('rect', {x: 0, y: 0, width: W, height: 8, rx: 4, class: 'th-bar0'}), sv('rect', {x: 0, y: 0, width: Math.round(nearBar(x) * W), height: 8, rx: 4, class: 'th-bar1'})); return s; } // 길이 64 하나(줄마다 같은 길이)
/** 줄 하나(싹 · 꽃 · 시듦 목록 · 첫 화면) */
export function row(i, k, {num: showNum = true, meta = 'near'} = {}) {
  const tag = i.d === 1 ? '새로 들어옴' : i.d + '일째';
  const mid = h('span', {class: 'th-mid2'}, h('span', {class: 'th-rn', text: i.n}),
    meta === 'near' ? h('span', {class: 'th-meta'}, h('em', {class: 'th-tg' + (i.d === 1 ? ' new' : ''), text: tag}), h('span', {text: '꽃까지'}), bar(i.x))
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
export async function homeBlock() {
  const TH = await themeHomeData();
  const box = h('section', {class: 'th-home', 'data-w': 'theme', 'aria-label': '테마 시계'});
  if (!TH) { box.append(h('p', {class: 'empty', text: '? 테마 시계 자료를 받지 못했어요. 잠시 뒤 다시 열어 주세요.'})); return box; }
  const S = TH.order.S.map(n => indOf(TH, n)).filter(Boolean), top = S.slice(0, 3);
  box.append(h('div', {class: 'th-map'}, clock(TH, {marks: top.map(i => i.n)}), h('p', {class: 'th-cap th-cap1', text: `업종은 시계 방향으로 돌아요. 잠잠 → 싹 → 꽃 → 시듦. 지금 싹 자리에 ${num(TH.count.S)}곳이 있어요.`})));
  box.append(TH.count.real ? h('h2', {class: 'th-ans'}, h('span', {text: '진짜 싹 '}), h('em', {text: num(TH.count.real) + '곳'})) : h('h2', {class: 'th-ans', text: '지금은 진짜 싹이 없어요'}));
  box.append(h('div', {class: 'th-three'}, ...[[TH.count.real, '진짜 싹'], [TH.count.fresh, '새로 들어옴'], [TH.count.S, '싹 자리']].map(([n, t]) => h('p', {}, h('b', {text: num(n) + '곳'}), h('span', {text: t})))));
  box.append(h('p', {class: 'th-sub', text: '점 넷이 다 차면 진짜 싹이에요. 점이 많이 찬 순서예요.'})); // 싹 순서 = 점 수 → 지난 닷새(결정표 4)
  box.append(h('div', {class: 'th-rows'}, top.map((i, k) => row(i, k))));
  box.append(h('a', {class: 'th-more', href: '#/t/sprout'}, h('span', {text: `싹 자리 ${num(TH.count.S)}곳 모두 보기`}), h('i', {'aria-hidden': 'true', text: '›'})));
  box.append(recordLine(TH), nextBtn('시계 읽는 법', '#/t/how')); // 기준 날은 첫 화면에 안 씀(보이는 날짜는 띠에 한 번 — [6] 2 · next_check) · 테마 쪽마다 아래에 씀
  return box;
}
