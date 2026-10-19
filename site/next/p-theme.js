/* 테마 시계(#/ 맨 위 칸 · #/t/… 열아홉 쪽) — 사장님 2026-10-19(싱가포르) 16:06 「테마가 된 게 아니라 될 듯한 걸 찾아 주는 거야 … 이 본질이 중심이자 시작」 ·
   16:46 「클릭을 하면 물 흐르듯 … 다음다음다음이 제대로 이어지게 … 총 36장」 · 16:54 「이제 aaa7377.com에 올려 … 큰 구조는 건들이지 말고 더 스마트한 내부 시스템」
   견본 = docs/design/theme-2026-10-19/flow36/(서른여섯 장 · 사장님 승인) · 셈 = 결정표 docs/design/theme-2026-10-19/theme-engine.md(site/next/theme-engine.js · 올릴 때 /next/data/theme.json)
   이 파일은 그리기만 — 숫자는 theme.json · theme-more.json 그대로(화면에서 다시 세지 않음) · 글은 textContent 로만(보안 규칙) · 앞날 말 없음 · 사고팔기 권하지 않음
   길: #/t/hello 1 · (#/ 2 = 첫 화면 homeBlock) · how 3 · sprout 4 · bloom 5 · wilt 6 · i/<업종>[/path|spread|big|co|near] 7 ~ 12 · c/<번호>[/lead|why|rank|unknown|keep] 13 ~ 18 · today 36
   19 ~ 35 는 있는 쪽(#/why/<번호> · #/sub · #/why · #/me · #/game · #/shorts · #/jinhwa)이 맡음 — 그 쪽 맨 아래 「다음」 한 줄은 app.js flowFoot */
import {ZONES, DOT_TEXT, RULE, pp, zoneOf} from './theme-rule.js';
import {clock, dots, bar, row, simpleRow, recordLine, yearsOf, nextBtn, footBtn, indOf, homeBlock} from './theme-home.js'; // 그림 조각 · 첫 화면 칸은 theme-home.js 한 곳
export {nextBtn, footBtn, homeBlock}; // app.js flowFoot(mod('theme').footBtn) · 옛 길

const nx = () => globalThis.NX;
const h = (...a) => nx().h(...a);
const sv = (...a) => nx().sv(...a);
const enc = s => encodeURIComponent(s);
const num = n => Number(n).toLocaleString('ko-KR');
const md = d => (typeof d === 'string' && /^\d{4}-\d{2}-\d{2}/.test(d) ? `${+d.slice(5, 7)}월 ${+d.slice(8, 10)}일` : '?');
const cls = v => (!Number.isFinite(v) ? '' : Math.round(v * 10) === 0 ? 'fl' : v > 0 ? 'up' : 'dn');

/* ── 자료(한 번 받고 기억 · 못 받으면 15초 뒤 다시) ── */
const C = {};
function load(name) {
  const c = C[name]; if (c && (c.v || Date.now() - c.t < 15000)) return c.p;
  const p = fetch('/next/data/' + name, {cache: 'no-cache'}).then(r => (r.ok ? r.json() : null)).catch(() => null)
    .then(j => { const ok = j && typeof j.schema === 'string' && j.schema.startsWith('dori-theme-1'); C[name].v = ok ? j : null; return ok ? j : null; });
  C[name] = {p, v: null, t: Date.now()}; return p;
}
const okTheme = j => !!j && j.schema === 'dori-theme-1' && Array.isArray(j.inds) && j.order && j.count;
/** 첫 화면 자료 — app.js 공용 받기(need('theme') · 모듈과 같이 받음 · 15초 뒤 다시) */
export const themeData = () => (nx()?.need ? nx().need('theme').then(j => (okTheme(j) ? j : null)).catch(() => null) : load('theme.json'));
const moreData = () => load('theme-more.json');
const zw = z => ZONES[z] ?? '?';

/* ── 흐름(서른여섯 장 · 견본 flow36 차례) ── */
const CH = ['', '테마 시계', '업종 한 곳', '회사 한 곳', '왜 사? 열한 질문', '내 것', '돌이와 나'];
const IND_SUB = [['', null, 7], ['path', '지나온 길', 8], ['spread', '번지는 중일까', 9], ['big', '큰 회사도 움직였을까', 10], ['co', '함께 움직인 회사', 11], ['near', '이웃 업종', 12]];
const CO_SUB = [['', null, 13], ['lead', '먼저일까 뒤따름일까', 14], ['why', '왜 그럴까?', 15], ['rank', '업종 안 자리', 16], ['unknown', '아직 모르는 것', 17], ['keep', '관심 담기', 18]];
const chOf = no => (no <= 6 ? 1 : no <= 12 ? 2 : no <= 18 ? 3 : no <= 24 ? 4 : no <= 30 ? 5 : 6);
/** 쪽 위 한 줄(‹ 앞 쪽 · 마당 n / 36) */
function pgBar(no, prev) {
  return h('div', {class: 'th-pg'},
    prev ? h('a', {class: 'th-back', href: prev[1]}, h('span', {'aria-hidden': 'true', text: '‹'}), h('span', {text: prev[0]})) : h('span'),
    h('p', {class: 'th-no'}, h('span', {class: 'th-ch', text: CH[chOf(no)]}), h('b', {text: String(no)}), h('span', {text: '/ 36'})));
}
const safe = () => h('p', {class: 'th-safe', text: '돌이는 지난 기록만 보여 줘요. 사고팔기를 권하지 않아요.'});
const say = t => h('p', {class: 'th-say'}, h('span', {class: 'th-who', text: '돌이'}), h('span', {text: t}));
const hd = (t, art) => h('div', {class: 'th-hd'}, h('h1', {class: 'th-h1', text: t}), h('img', {class: 'th-art', src: '/media/stone/' + art + '.svg', alt: '', width: 96, height: 77, decoding: 'async'}));
const asOf = TH => h('p', {class: 'th-asof', text: md(TH.asOf) + ' 장 마감 기준' + (TH.provisional ? ' · 장중 값이 섞여 있어요' : '')});
const none = (title, what = '테마 시계') => ({title, nodes: [h('div', {class: 'tc', 'data-page': 'theme'}, hd(title, 'home'), h('p', {class: 'empty', text: '? ' + what + ' 자료를 받지 못했어요. 잠시 뒤 다시 열어 주세요.'}), nextBtn('테마 시계', '#/', '처음으로'))]});

/** 작은 선(1000 = 열흘 전) */
function spark(l, w = 96, ht = 36) {
  const s = sv('svg', {class: 'th-sp', viewBox: `0 0 ${w} ${ht}`, width: w, height: ht, 'aria-hidden': 'true'});
  if (!Array.isArray(l) || l.length < 2) return s;
  const lo = Math.min(...l), hi = Math.max(...l), y = v => ht - 4 - (v - lo) / (hi - lo || 1) * (ht - 8), x = k => 4 + k * (w - 8) / (l.length - 1); // 끝 점(반지름 3.5)이 잘리지 않게
  s.append(sv('polyline', {points: l.map((v, k) => x(k).toFixed(1) + ',' + y(v).toFixed(1)).join(' '), class: 'th-spl ' + (l[l.length - 1] >= l[0] ? 'up' : 'dn')}));
  s.append(sv('circle', {cx: x(l.length - 1).toFixed(1), cy: y(l[l.length - 1]).toFixed(1), r: 3.5, class: 'th-spd ' + (l[l.length - 1] >= l[0] ? 'up' : 'dn')}));
  return s;
}
/** 큰 선(회사 열하나 날 · 앞 닷새 회색 · 뒤 닷새 주황) */
function bigLine(l, w = 358, ht = 110) {
  const s = sv('svg', {class: 'th-line', viewBox: `0 0 ${w} ${ht}`, width: '100%', height: ht, 'aria-hidden': 'true'});
  if (!Array.isArray(l) || l.length < 3) return s;
  const lo = Math.min(...l), hi = Math.max(...l), y = v => ht - 6 - (v - lo) / (hi - lo || 1) * (ht - 12), x = k => 6 + k * (w - 12) / (l.length - 1), m = Math.floor(l.length / 2); // 끝 점(반지름 5)이 잘리지 않게
  const pts = a => a.map(([k, v]) => x(k).toFixed(1) + ',' + y(v).toFixed(1)).join(' '), P = l.map((v, k) => [k, v]);
  s.append(sv('line', {x1: x(m), y1: 0, x2: x(m), y2: ht, class: 'th-mid'}), sv('polyline', {points: pts(P.slice(0, m + 1)), class: 'th-l0'}), sv('polyline', {points: pts(P.slice(m)), class: 'th-l1'}), sv('circle', {cx: x(l.length - 1), cy: y(l[l.length - 1]), r: 5, class: 'th-l1d'}));
  return s;
}
/* ── 쪽들 ── */
function shell(no, title, art, sayT, prev, next, body, {pageKey = 'theme'} = {}) {
  return h('div', {class: 'tc', 'data-page': pageKey}, pgBar(no, prev), hd(title, art), sayT ? say(sayT) : null, ...body, next ? nextBtn(next[0], next[1], next[2]) : null, safe());
}
async function pHello() {
  const steps = [['시계를 봐요', '업종이 지금 어느 자리인지'], ['싹 하나를 눌러요', '점 넷으로 진짜 싹인지'], ['회사를 눌러요', '먼저 움직였는지, 뒤따랐는지']];
  return {title: '돌이 인사', nodes: [shell(1, '돌이', 'home', '테마가 될 듯한 곳을 찾아 줘요.', null, ['테마 시계', '#/'],
    [h('h2', {class: 'th-ans', text: '세 번만 누르면 돼요'}), h('ol', {class: 'th-steps'}, steps.map(([a, b], k) => h('li', {}, h('span', {class: 'th-sn', text: String(k + 1)}), h('span', {class: 'th-st'}, h('b', {text: a}), h('span', {text: b})))))])]};
}
async function pHow() {
  const TH = await themeData(); if (!TH) return none('시계 읽는 법');
  const R = TH.record, y = yearsOf(TH);
  const zones = [['Q', '아직 꽃 선 전이고, 지난 닷새는 시장보다 덜 올랐어요.'], ['S', '아직 꽃 선 전이지만, 지난 닷새는 시장보다 더 올랐어요.'], ['B', '꽃 선을 넘었고, 지난 닷새도 시장보다 더 올랐어요.'], ['W', '꽃 선을 넘었지만, 지난 닷새는 시장보다 덜 올랐어요.']]; // 결정표 2 그대로
  const byDots = (R?.byDots ?? []).map((b, k) => h('div', {class: 'th-rb'}, h('span', {class: 'th-rbk', text: '점 ' + k + '개'}), h('span', {class: 'th-rbb'}, rb(b.p)), h('b', {text: b.p == null ? '?' : Math.round(b.p) + '번'})));
  return {title: '시계 읽는 법', nodes: [shell(3, '시계 읽는 법', 'today', '네 자리만 알면 돼요.', ['테마 시계', '#/'], ['싹 자리 전부', '#/t/sprout'], [
    h('div', {class: 'th-map'}, clock(TH), h('p', {class: 'th-cap'}, h('span', {text: '가로는 한 달 동안 시장보다 더 오른 만큼이에요.'}), h('span', {text: '세로는 지난 닷새 동안 시장보다 더 오른 만큼이에요.'}), h('span', {text: '한 달 동안 시장보다 5% 넘게 더 오르면 꽃 선을 넘어요.'}))),
    h('ol', {class: 'th-steps'}, zones.map(([z, t], k) => h('li', {}, h('span', {class: 'th-sn', text: String(k + 1)}), h('span', {class: 'th-st'}, h('b', {class: 'th-z ' + z, text: ZONES[z]}), h('span', {text: t}))))),
    h('h2', {class: 'th-h2', text: '점 넷'}),
    h('ol', {class: 'th-steps'}, [['시장보다 힘이 붙어요', '지난 닷새 시장보다 2% 넘게 더 올랐어요.'], [DOT_TEXT[1], '열흘 동안 2% 넘게 오른 회사가 절반 이상이에요.'], ['큰 회사도 움직여요', '가장 큰 회사 셋의 평균이 열흘 동안 1% 이상 올랐어요.'], ['값이 진짜로 올라요', '업종 값이 열흘 전보다 올랐어요.']]
      .map(([a, b], k) => h('li', {}, h('span', {class: 'th-sn', text: String(k + 1)}), h('span', {class: 'th-st'}, h('b', {text: a}), h('span', {text: b}))))),
    h('h2', {class: 'th-h2', text: '돌이 성적표'}),
    h('p', {class: 'th-sub', text: `지난 ${y ?? '?'}년 기록이에요. 싹 자리였던 날, 100번 가운데 몇 번이 한 달 뒤 꽃 선을 넘었을까?`}),
    h('div', {class: 'th-rbs'}, byDots, h('div', {class: 'th-rb all'}, h('span', {class: 'th-rbk', text: '아무 업종'}), h('span', {class: 'th-rbb'}, rb(R?.all?.p)), h('b', {text: R?.all?.p == null ? '?' : Math.round(R.all.p) + '번'}))),
    h('details', {class: 'th-fold'}, h('summary', {text: '돌이는 이렇게 셉니다'}),
      h('p', {text: `${md(TH.recFrom)}부터 ${md(TH.recTo)}까지, 업종마다 날마다 셌어요. 같은 업종의 이어진 날도 하루씩 셌어요.`}),
      h('p', {text: '지금 상장된 회사로만 셌어요. 큰 회사 셋은 오늘 몸값 차례로 지난날도 셌어요.'}),
      h('p', {text: '시장이 크게 내린 날 뒤에는 덜 내린 업종도 싹 자리에 많이 들어와요.'}),
      h('p', {text: '앞날을 맞히는 숫자가 아니에요. 지난 기록에서 센 횟수예요.'})),
  ])]};
}
function rb(p) { const s = sv('svg', {class: 'th-rbar', viewBox: '0 0 100 12', width: '100%', height: 12, preserveAspectRatio: 'none', 'aria-hidden': 'true'}); s.append(sv('rect', {x: 0, y: 0, width: 100, height: 12, rx: 6, class: 'th-bar0'}), sv('rect', {x: 0, y: 0, width: Number.isFinite(p) ? Math.max(0, Math.min(100, p)) : 0, height: 12, rx: 6, class: 'th-bar1'})); return s; }
async function pZone(z) {
  const TH = await themeData(); const T = {S: ['싹 자리 전부', 4, 'surge', '점이 많이 찬 순서예요.'], B: ['꽃 자리', 5, 'cond', '이미 테마가 된 곳이에요.'], W: ['시듦 자리', 6, 'sub', '꽃이 지고 있는 곳이에요.']}[z];
  if (!TH) return none(T[0]);
  const list = TH.order[z].map(n => indOf(TH, n)).filter(Boolean);
  const prev = {S: ['시계 읽는 법', '#/t/how'], B: ['싹 자리 전부', '#/t/sprout'], W: ['꽃 자리', '#/t/bloom']}[z];
  const top = TH.order.S[0];
  const next = {S: ['꽃 자리', '#/t/bloom'], B: ['시듦 자리', '#/t/wilt'], W: top ? [top, '#/t/i/' + enc(top)] : ['테마 시계', '#/']}[z];
  const body = [h('h2', {class: 'th-ans'}, h('span', {text: zw(z) + ' 자리 '}), h('em', {text: num(list.length) + '곳'}))];
  if (z === 'B') body.push(h('p', {class: 'th-sub', text: '돌이는 꽃보다 싹을 먼저 봐요. 꽃은 이미 오른 곳이라 늦을 수 있어요.'}));
  if (z === 'W') body.push(h('p', {class: 'th-sub', text: '힘이 빠지는 중이에요. 다시 잠잠으로 갈까?'}));
  body.push(list.length ? h('div', {class: 'th-rows'}, list.map((i, k) => (z === 'S' ? row(i, k) : simpleRow(i)))) : h('p', {class: 'empty', text: '지금 이 자리에는 업종이 없어요.'}));
  if (z !== 'S' && list.length) body.push(h('p', {class: 'th-cap2', text: '숫자는 한 달 동안 시장보다 더 오른 만큼이에요.'}));
  if (z === 'W') body.push(h('p', {class: 'th-sub', text: `잠잠 자리는 ${num(TH.count.Q)}곳이에요.`}));
  body.push(asOf(TH));
  return {title: T[0], nodes: [shell(T[1], T[0], T[2], T[3], prev, next, body)]};
}
const ckRow = (ok, t, d) => h('div', {class: 'th-ck'}, h('b', {class: ok ? 'y' : 'n', 'aria-label': ok ? '참' : '아님', text: ok ? '✓' : '✗'}), h('span', {class: 'th-st'}, h('span', {class: 'th-ckt', text: t}), d ? h('span', {class: 'th-ckd', text: d}) : null));
async function pInd(name, sub) {
  const [TH, TM] = await Promise.all([themeData(), moreData()]);
  const i = indOf(TH, name);
  if (!TH || !i) return none(name || '업종', TH ? '이 업종' : '테마 시계');
  const k = IND_SUB.findIndex(s => s[0] === sub); if (k < 0) return none(name, '이 쪽');
  const [, , no] = IND_SUB[k], M = TM?.inds?.[name] ?? null, base = '#/t/i/' + enc(name);
  const href = j => base + (IND_SUB[j][0] ? '/' + IND_SUB[j][0] : ''), title = j => IND_SUB[j][1] ?? name;
  const prev = k ? [title(k - 1), href(k - 1)] : ({S: ['싹 자리 전부', '#/t/sprout'], B: ['꽃 자리', '#/t/bloom'], W: ['시듦 자리', '#/t/wilt']}[i.z] ?? ['테마 시계', '#/']); // 들어온 목록으로(새 눈 검사 8)
  const lead = M?.top?.[0];
  const next = k < IND_SUB.length - 1 ? [title(k + 1), href(k + 1)] : lead ? [lead.n, '#/t/c/' + enc(lead.c)] : ['테마 시계', '#/'];
  let body = [], sayT = null, art = 'today';
  if (sub === '') {
    sayT = i.z === 'S' ? (i.d === 1 ? '싹 자리에 새로 들어왔어요.' : `싹 자리 ${num(i.d)}일째예요.`) : `${zw(i.z)} 자리 ${num(i.d)}일째예요.`;
    body = [h('h2', {class: 'th-ans'}, h('span', {text: '점 넷 가운데 '}), h('em', {text: num(i.sc) + '개'})), dots(i),
      ckRow(i.dots[0], DOT_TEXT[0], `지난 닷새 시장보다 ${pp(i.y)}%p`), ckRow(i.dots[1], DOT_TEXT[1], `${num(i.tot)}곳 가운데 ${num(i.up)}곳이 2% 넘게 올랐어요`),
      ckRow(i.dots[2], DOT_TEXT[2], i.bigAvg == null ? '? 큰 회사 값을 못 받았어요' : `가장 큰 회사 셋 평균 ${pp(i.bigAvg)}%`), ckRow(i.dots[3], DOT_TEXT[3], `열흘 동안 ${pp(i.m10)}%`),
      h('p', {class: 'th-sub', text: i.z === 'S' && i.sc === 4 ? '진짜 싹이에요. 한 달 뒤 꽃 선을 넘을까?' : i.z === 'S' ? '싹 자리지만, 점이 덜 찼어요. 꽃 선을 넘을까?' : i.z === 'B' ? '이미 꽃 자리예요. 늦은 건 아닐까?' : i.z === 'W' ? '꽃이 지는 중이에요. 다시 잠잠으로 갈까?' : '아직 잠잠해요. 힘이 붙을까?'})];
  } else if (sub === 'path') {
    art = 'cal'; sayT = '닷새 동안 어디서 왔을까?';
    body = [h('div', {class: 'th-map'}, clock(TH, {hi: name}), h('p', {class: 'th-cap', text: '닷새 전부터 오늘까지 지나온 길이에요.'})),
      h('div', {class: 'th-list'}, (i.tz ?? []).map((z, j) => h('div', {class: 'th-li'}, h('span', {text: md(TH.days6?.[j])}), h('b', {class: 'th-z ' + z, text: zw(z)}), h('span', {class: 'th-cap2', text: `한 달 ${pp(i.t?.[j]?.[0])}%p`}))))];
  } else if (sub === 'spread') {
    art = 'surge'; sayT = '오른 회사가 늘고 있을까?';
    const mx = Math.max(1, ...i.sp), W = 326, H = 96, bw = W / i.sp.length;
    const s = sv('svg', {class: 'th-bars', viewBox: `0 0 ${W} ${H}`, width: '100%', height: H, 'aria-hidden': 'true'});
    i.sp.forEach((v, j) => { const hh = Math.max(4, Math.round(v / mx * (H - 8))); s.append(sv('rect', {x: (j * bw + 2).toFixed(1), y: H - hh, width: (bw - 4).toFixed(1), height: hh, rx: 2, class: j >= i.sp.length - 6 ? 'th-b1' : 'th-b0'})); });
    body = [h('h2', {class: 'th-ans'}, h('span', {text: `${num(i.tot)}곳 가운데 `}), h('em', {text: num(i.up) + '곳'})),
      h('p', {class: 'th-sub', text: `열흘 전보다 2% 넘게 오른 회사 수예요. 닷새 전에는 ${num(i.sp5)}곳, 가장 많을 때는 ${num(i.peak)}곳이었어요.`}), s,
      h('p', {class: 'th-cap2', text: '날마다 오른 회사 수 · 주황은 최근 엿새'}),
      h('div', {class: 'th-box'}, h('b', {text: i.dots[1] ? '절반 이상 올랐어요 ✓' : '아직 절반이 안 돼요 ✗'}), h('span', {text: '절반 이상이면 넓게 번졌다고 봐요.'}))];
  } else if (sub === 'big') {
    art = 'company'; sayT = '큰 회사가 같이 가야 힘이 세요.';
    body = [h('h2', {class: 'th-ans'}, h('span', {text: '큰 회사 셋 '}), h('em', {class: cls(i.bigAvg), text: i.bigAvg == null ? '?' : pp(i.bigAvg) + '%'})),
      h('p', {class: 'th-sub', text: '업종에서 몸값이 가장 큰 회사 셋의 열흘 평균이에요.'}),
      h('div', {class: 'th-list'}, (M?.big ?? []).map(b => h('a', {class: 'th-li', href: '#/t/c/' + enc(b.c)}, h('span', {text: b.rk + '. ' + b.n}), h('b', {class: cls(b.d10), text: b.d10 == null ? '?' : pp(b.d10) + '%'}), h('span', {class: 'th-cap2', text: '열흘'})))),
      h('div', {class: 'th-box'}, h('b', {text: i.dots[2] ? '큰 회사도 움직였어요 ✓' : '큰 회사는 아직이에요 ✗'}), h('span', {text: '셋 평균이 1% 넘게 올라야 움직였다고 봐요.'}))];
  } else if (sub === 'co') {
    art = 'company'; sayT = '누가 앞장섰을까?';
    body = [h('div', {class: 'th-list'}, (M?.top ?? []).map(c => h('a', {class: 'th-cor', href: '#/t/c/' + enc(c.c)}, h('span', {class: 'th-rn2', text: c.n}), h('b', {class: cls(c.d10), text: pp(c.d10) + '%'}), spark(c.l)))),
      h('p', {class: 'th-cap2', text: `열흘 동안 · ${num(M?.ranked ?? i.k)}곳 가운데 많이 오른 차례`})];
  } else if (sub === 'near') {
    art = 'cond'; sayT = '같은 무리 업종도 움직일까?';
    const same = (TH.inds ?? []).filter(o => o.g && o.g === i.g && o.n !== name).sort((a, b) => b.x - a.x || (a.n < b.n ? -1 : 1)); // 보이는 숫자(한 달) 차례
    const live = same.filter(o => o.z === 'S' || o.z === 'B').length;
    body = [h('h2', {class: 'th-ans'}, h('span', {text: (i.gn ?? '같은 무리') + ' '}), h('em', {text: num(same.length) + '곳'})),
      h('p', {class: 'th-sub', text: `그 가운데 싹이나 꽃 자리가 ${num(live)}곳이에요. 함께 움직이면 테마가 커질 수 있어요.`}),
      h('div', {class: 'th-rows'}, same.map(o => simpleRow(o, {zone: true}))), h('p', {class: 'th-cap2', text: '숫자는 한 달 동안 시장보다 더 오른 만큼이에요.'})];
  }
  return {title: IND_SUB[k][1] ?? name, nodes: [shell(no, IND_SUB[k][1] ?? name, art, sayT, prev, next, [...body, asOf(TH)])]};
}
async function pCo(code, sub) {
  const [TH, TM] = await Promise.all([themeData(), moreData()]);
  if (!TH || !TM) return none('회사', '테마 시계');
  let ind = null, c = null;
  for (const [n, o] of Object.entries(TM.inds ?? {})) { const x = (o.top ?? []).find(t => t.c === code); if (x) { ind = n; c = x; break; } }
  if (!c) for (const [n, o] of Object.entries(TM.inds ?? {})) { const x = (o.big ?? []).find(t => t.c === code); if (x) { ind = n; c = {...x}; break; } } // 큰 회사 셋은 8곳 밖이어도 같은 칸(결정표 5 · v1.2)
  if (!c) return {title: '회사', nodes: [h('div', {class: 'tc', 'data-page': 'theme'}, hd('회사', 'company'), h('p', {class: 'empty', text: '이 회사는 테마 시계의 앞선 회사 줄에 없어요.'}), nextBtn('회사 자세히 보기', '#/w/' + enc(code)), safe())]};
  const k = CO_SUB.findIndex(s => s[0] === sub); if (k < 0) return none(c.n, '이 쪽');
  const I = indOf(TH, ind), M = TM.inds[ind], base = '#/t/c/' + enc(code), no = CO_SUB[k][2];
  const href = j => base + (CO_SUB[j][0] ? '/' + CO_SUB[j][0] : ''), title = j => CO_SUB[j][1] ?? c.n;
  const inTop = (M?.top ?? []).some(t => t.c === code);
  const prev = k ? [title(k - 1), href(k - 1)] : inTop ? ['함께 움직인 회사', '#/t/i/' + enc(ind) + '/co'] : ['큰 회사도 움직였을까', '#/t/i/' + enc(ind) + '/big']; // 들어온 줄로(새 눈 검사 8)
  const next = k < CO_SUB.length - 1 ? [title(k + 1), href(k + 1)] : ['사기 전에', '#/why/' + enc(code)];
  let body = [], sayT = null, art = 'company';
  const lead = c.a5 != null && I ? (c.a5 - I.A5) > (c.b5 - I.B5) : null;
  if (sub === '') {
    sayT = '먼저 움직였을까, 뒤따랐을까?';
    body = [h('p', {class: 'th-cap2', text: `${ind} 업종 회사예요.`}), bigLine(c.l), h('h2', {class: 'th-ans'}, h('span', {text: '열흘 동안 '}), h('em', {class: cls(c.d10), text: pp(c.d10) + '%'})),
      h('p', {class: 'th-sub', text: c.rank === 1 ? `${ind} ${num(M.ranked)}곳 가운데 가장 많이 올랐어요.` : c.rank ? `${ind} ${num(M.ranked)}곳 가운데 ${num(c.rank)}번째로 많이 올랐어요.` : `${ind} 업종에서 몸값이 큰 회사예요.`})];
  } else if (sub === 'lead') {
    art = 'cal'; sayT = '앞 닷새와 뒤 닷새를 견줘요.';
    body = [bigLine(c.l), h('div', {class: 'th-two'}, h('p', {}, h('span', {text: '앞 닷새'}), h('b', {class: cls(c.a5), text: pp(c.a5) + '%'}), h('small', {text: '업종 ' + pp(I?.A5) + '%'})), h('p', {}, h('span', {text: '뒤 닷새'}), h('b', {class: cls(c.b5), text: pp(c.b5) + '%'}), h('small', {text: '업종 ' + pp(I?.B5) + '%'}))),
      h('h2', {class: 'th-ans', text: lead == null ? '? 아직 못 견줬어요' : lead ? '업종보다 먼저 움직였어요' : '업종을 뒤따라 움직였어요'}),
      h('p', {class: 'th-sub', text: '업종보다 더 오른 때가 앞 닷새면 먼저, 뒤 닷새면 뒤따름이에요.'})];
  } else if (sub === 'why') {
    art = 'why'; sayT = '기록으로 찾은 것만 말해요.';
    const has5 = Number.isFinite(c.a5) && Number.isFinite(c.b5), late = has5 && c.b5 >= c.a5;
    const m10 = I?.m10, indT = !Number.isFinite(m10) ? '? 업종 값을 못 받았어요' : m10 > 0 ? '업종도 올랐어요' : m10 < 0 ? '업종은 내렸어요' : '업종은 그대로예요';
    body = [h('ol', {class: 'th-steps'},
      h('li', {}, h('span', {class: 'th-sn', text: '1'}), h('span', {class: 'th-st'}, h('b', {text: !has5 ? '? 닷새씩 못 견줬어요' : late ? '최근 닷새에 몰렸어요' : '앞 닷새에 몰렸어요'}), h('span', {text: `앞 닷새 ${pp(c.a5)}% · 뒤 닷새 ${pp(c.b5)}%`}))),
      h('li', {}, h('span', {class: 'th-sn', text: '2'}), h('span', {class: 'th-st'}, h('b', {text: c.rank === 1 ? '업종 안에서 가장 앞서요' : c.rank ? `업종 안에서 ${num(c.rank)}번째예요` : '업종에서 몸값이 큰 회사예요'}), h('span', {text: c.rank === 1 && Number.isFinite(c.gap) ? `다음 회사보다 ${pp(c.gap)}%p 더 올랐어요` : `열흘 동안 ${pp(c.d10)}%`}))),
      h('li', {}, h('span', {class: 'th-sn', text: '3'}), h('span', {class: 'th-st'}, h('b', {text: indT}), h('span', {text: `업종 열흘 ${pp(I?.m10)}%`})))),
      h('div', {class: 'th-box'}, h('b', {text: '뉴스는 아직 확인 전이에요'}), h('span', {text: '왜 올랐는지는 뉴스로 꼭 확인해요.'}))];
  } else if (sub === 'rank') {
    art = 'surge'; sayT = `${num(M.ranked)}곳 가운데 몇 번째일까?`;
    body = [h('h2', {class: 'th-ans'}, h('span', {text: '열흘 동안 '}), h('em', {text: c.rank ? num(c.rank) + '번째' : '?'})),
      h('div', {class: 'th-list'}, [...(M.top ?? []), ...(c.rank > (M.top ?? []).length ? [c] : [])].map(t => h('a', {class: 'th-li' + (t.c === code ? ' th-me' : ''), href: '#/t/c/' + enc(t.c)}, h('span', {text: t.rank + '. ' + t.n}), h('b', {class: cls(t.d10), text: pp(t.d10) + '%'}))))]; // 8곳 밖 회사(큰 회사 셋)는 제 줄을 맨 아래에
  } else if (sub === 'unknown') {
    art = 'sub'; sayT = '모르는 것도 꼭 말해요.';
    const R = TH.record;
    body = [h('div', {class: 'th-box'}, h('b', {text: '왜 올랐는지'}), h('span', {text: '뉴스를 아직 확인하지 않았어요.'})),
      h('div', {class: 'th-box'}, h('b', {text: '계속 오를지'}), h('span', {text: '많이 오른 곳은 크게 내리기도 해요.'})),
      h('div', {class: 'th-box'}, h('b', {text: '업종이 꽃이 될지'}), h('span', {text: R?.real?.p != null ? `진짜 싹도 100번 가운데 ${100 - Math.round(R.real.p)}번은 한 달 뒤 꽃 선을 넘지 못했어요.` : '싹 자리에서 다시 잠잠으로 가는 일도 많아요.'}))];
  } else if (sub === 'keep') {
    art = 'me'; sayT = '담아 두면 관심 칸에서 다시 봐요.';
    body = [h('h2', {class: 'th-ans', text: c.n}), nx().laterBtn(code, c.n, 'th-keep'), h('p', {class: 'th-sub', text: '사기 전에는 열한 질문을 먼저 해요.'})];
  }
  return {title: CO_SUB[k][1] ?? c.n, nodes: [shell(no, CO_SUB[k][1] ?? c.n, art, sayT, prev, next, [...body, asOf(TH)])]};
}
async function pToday() {
  const [TH, TM] = await Promise.all([themeData(), moreData()]); if (!TH) return none('오늘 정리');
  const top = indOf(TH, TH.order.S[0]), lead = top ? TM?.inds?.[top.n]?.top?.[0] : null;
  return {title: '오늘 정리', nodes: [shell(36, '오늘 정리', 'home', '시계는 날마다 또 돌아요.', ['진화', '#/jinhwa'], ['테마 시계', '#/', '처음으로'], [
    h('ol', {class: 'th-steps'},
      h('li', {}, h('span', {class: 'th-sn', text: '1'}), h('span', {class: 'th-st'}, h('b', {text: `진짜 싹 ${num(TH.count.real)}곳`}), h('span', {text: `싹 자리 ${num(TH.count.S)}곳 가운데`}))),
      h('li', {}, h('span', {class: 'th-sn', text: '2'}), h('span', {class: 'th-st'}, h('b', {text: '맨 앞 싹'}), h('span', {text: top ? top.n : '없어요'}))),
      h('li', {}, h('span', {class: 'th-sn', text: '3'}), h('span', {class: 'th-st'}, h('b', {text: '그 안에서 앞선 회사'}), h('span', {text: lead ? `${lead.n} 열흘 ${pp(lead.d10)}%` : '없어요'})))),
    recordLine(TH), asOf(TH)])]};
}

export async function render(arg = '') {
  const a = String(arg ?? ''), [k, x, y] = a.split('/');
  if (k === '' || k === 'hello') return pHello();
  if (k === 'how') return pHow();
  if (k === 'sprout') return pZone('S');
  if (k === 'bloom') return pZone('B');
  if (k === 'wilt') return pZone('W');
  if (k === 'today') return pToday();
  if (k === 'i' && x) return pInd(x, y ?? '');
  if (k === 'c' && /^[0-9A-Z]{6}$/.test(x ?? '')) return pCo(x, y ?? '');
  return none('테마 시계', '이 쪽');
}
export {zoneOf};
