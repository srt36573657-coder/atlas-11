/* 급등 다섯 칸 — 새 아틀란스(/next/) 쪽 모듈(사장님 2026-10-17 04:04 「첫화면 부터 마지막 페이지 까지 모두 바꿔」 · 04:23 「에이전트 총 동원해」)
   지금 아틀란스(site/atlas/atlas.js viewSurge · svMain · svBand · svChart · svCal · svDayPanel · svTrack · svSee · race · foot)를 옮김 —
   셈 · 숫자 · 뜻 있는 글은 옛 쪽 그대로(규칙 69 · 69 ⑧ — 2026-10-15 14:27 「최근 5일에 급등한 종목을 36개」 · 16:28 「총 5개」 · 16:34 「추적해서 달력에 기록」 · 16:40 「관심 없음」)
   주소: #/surge(급등) · #/surge/10 · /20 · /30 · /40(10%대 · 20%대 · 30%대 · 40% 이상) · 그 밖은 「없는 주소」
   자료 = surge.json(sv-v1 · 네 칸 bands sb-v1) · surgecal.json(sk-v1 · 못 받으면 그 칸만 「?」) — 화면은 보여 주기만(셈은 surge.py · 따로 세기 surge_verify.mjs)
   「관심 없음」 = 이 기기에만(localStorage atlas:surge-hide — 옛 쪽과 같은 열쇠 · 같은 꼴) · 회사 고리 = #/w/<번호>
   그림 「5일 오름 자」(svg · 점은 svg 안 — 바둑판 아님) · 줄 선(svg) · 입체 없음 · 글은 textContent 로만 · 자리 · 길이는 CSSOM 으로만(보안 규칙) · 모양 = p-surge.css(psurge-) */
import {shareButtons} from '/next/share-btn.js'; // 카톡 단추 한 곳(KB1) — 급등 줄(일꾼 KB2)
import {fourText} from '/next/essence.js'; // 「하루 4번」 글은 지난 7일 기록이 맞을 때만(사장님 2026-10-18 16:39 [5] 4 · 요약 fourADay · 일꾼 KI) — 「어떻게 골랐나요?」 규칙 글(surge.json)
const NX = globalThis.NX;
const {h, sv, pct, r1, enc} = NX;
const RM = NX.RM || matchMedia('(prefers-reduced-motion: reduce)');
const NB = '\u00a0';

/* ── 옛 쪽 말 그대로(atlas.js md · mdw · kstLabel · dayK · ampm) — 날짜 「10월 13일」은 붙임 띄어쓰기 ── */
const DOW = ['일', '월', '화', '수', '목', '금', '토'];
function md(d) { const p = String(d).split('-'); return (+p[1]) + '월\u00a0' + (+p[2]) + '일'; }
const mdw = d => { const x = new Date(d + 'T00:00:00Z'); return `${md(d)}(${DOW[x.getUTCDay()]})`; };
const kstLabel = k => { const d = new Date(k.slice(0, 10) + 'T00:00:00Z'); return `${md(k.slice(0, 10))}(${DOW[d.getUTCDay()]}) ${k.slice(11, 16)}`; };
const isDay = d => /^\d{4}-\d{2}-\d{2}/.test(String(d ?? ''));
const isTime = t => /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}/.test(String(t ?? ''));
const kstNow = () => new Date(Date.now() + 9 * 36e5).toISOString();
const ampm = t => { if (!isTime(t)) return '?'; const hh = +t.slice(11, 13), mm = t.slice(14, 16); return `${hh < 12 ? '오전' : '오후'}${NB}${hh % 12 || 12}:${mm}`; };
const dayK = d => (!isDay(d) ? '?' : String(d).slice(0, 10) === kstNow().slice(0, 10) ? '오늘' : md(String(d).slice(0, 10)));
/** 오름 · 내림 색 — 옛 cls 와 같음(값 없음은 회색 · 금빛 「?」는 옛 쪽이 따로 q 를 쓴 곳에만) */
const cl = x => (x == null ? 'fl' : r1(x) > 0 ? 'up' : r1(x) < 0 ? 'dn' : 'fl');
const pctEl = (x, tag = 'b') => h(tag, {class: 'psurge-num ' + cl(x), text: pct(x)});
const qEl = () => h('b', {class: 'psurge-num q', text: '?'});
const cHref = c => '#/w/' + enc(c);
const TOK0 = {up: '#FF5A65', down: '#5B96FF', gold: '#E9B949', ink: '#F2EFE8', night: '#0C0E12', mute: '#8E959F', sub: '#B0B5BD', 'm4-line': '#272B34'};
/** 그림 색 = 꾸밈 파일의 색 이름(app.css :root) — 못 읽으면 같은 값 */
function tok() { const s = getComputedStyle(document.documentElement), o = {}; for (const k of Object.keys(TOK0)) o[k] = s.getPropertyValue('--' + k).trim() || TOK0[k]; return o; }
const st = (el, css) => { for (const [k, v] of Object.entries(css)) el.style.setProperty(k, v); return el; };
/** 화면에 붙은 뒤에 재야 하는 것(넓이 · 글 넓이) — 새 앱은 render 가 돌려준 칸을 나중에 붙임 */
function onAttach(el, fn) { let n = 0; const go = () => { if (el.isConnected) { fn(); return; } if (++n < 600) requestAnimationFrame(go); }; requestAnimationFrame(go); }
/** 숫자 칸 — 긴 숫자가 칸 밖으로 넘치면 한 단 작게(숫자는 그대로 · 옛 fitNums) */
function fitNums(box) { const go = () => { for (const b of box.querySelectorAll('b')) { b.classList.remove('psurge-fit'); if (b.scrollWidth > b.clientWidth + 1) b.classList.add('psurge-fit'); } }; onAttach(box, () => { go(); document.fonts?.ready.then(() => { if (box.isConnected) go(); }); }); }
const sec = (text, id = null) => h('h2', {class: 'psurge-sec', id, text});
const more = (sum, kids, extra = '') => h('details', {class: 'psurge-more' + (extra ? ' ' + extra : '')}, h('summary', {text: sum}), h('div', {class: 'psurge-inn'}, ...kids));

/* ── 다섯 칸 이름(옛 SV_TABS · SV_NAME — \u2060 = 「10%」와 「대」 사이 줄 안 갈림 · \u00a0 = 「40%」와 「이상」 안 갈림) ── */
const SV_TABS = [['sv', '급등'], ['b10', '10%'], ['b20', '20%'], ['b30', '30%'], ['b40', '40%']];
const SV_NAME = {sv: '급등', b10: '10%\u2060대', b20: '20%\u2060대', b30: '30%\u2060대', b40: '40%\u00a0이상'};
const svJ = (o, tail) => Object.fromEntries(Object.entries(o).map(([k, x]) => [k, x + tail]));
const BN = {b10: SV_NAME.b10, b20: SV_NAME.b20, b30: SV_NAME.b30, b40: SV_NAME.b40};
const SV_KAN = {sv: '급등 칸에', ...svJ(BN, ' 칸에')}, SV_FROM = svJ(BN, ' 칸에서'), SV_TO = svJ(BN, ' 칸으로');
const svHref = t => '#/surge' + (t === 'sv' ? '' : '/' + t.slice(1));
const svChips = cur => h('nav', {class: 'psurge-chips', 'aria-label': '급등 다섯 칸'}, ...SV_TABS.map(([t, lab]) => h('a', {class: 'psurge-chip', href: svHref(t), 'aria-current': t === cur ? 'page' : null, text: lab})));

/* ── 때 · 바뀜 · 다음 업데이트(옛 svTime · svChange · svNext) ── */
const svTime = S => (S.provisional && isTime(S.got) ? `${dayK(S.got)} ${ampm(S.got)} 값` : isDay(S.asOf) ? `${md(S.asOf)} 장${NB}마감` : '?');
const svChange = S => (S.carry ? `목록은 ${kstLabel(S.carry.fromKst)}에 고른 그대로예요.`
  : S.kind !== 'pick' ? '처음 고른 목록이에요.'
  : (S.in?.length || S.out?.length) ? `${S.in.length}곳이 새로 들고 ${S.out.length}곳이 나갔어요.` : '이번에 바뀐 곳은 없어요.');
const svNext = S => { const sl = S?.rules?.slots ?? ['10:00', '12:00', '14:00', '18:00'], k = new Date(Date.now() + 9 * 36e5), m = k.getUTCHours() * 60 + k.getUTCMinutes(), wd = k.getUTCDay(), nx = sl.find(x => +x.slice(0, 2) * 60 + +x.slice(3, 5) > m); return wd > 0 && wd < 6 && nx ? `오늘 ${nx}` : `다음 장날 ${sl[0]}`; };

/* ── 그림 한 장 「5일 오름 자」(옛 svChart 그대로) — 회색 산 = 값 있는 모든 회사가 몰린 곳(1%p 칸) · 점선 = 모든 회사 가운데값 · 진주 점선 = 들어오는 문턱(네 칸은 칸 끝 둘) ·
   빨간 점 = 목록 한 곳(쌓음) · 진주 테 = 이번에 새로 · 점을 누르면 이름과 5일 오름 ── */
const SV_LO = -20, SV_HI = 80;
function svChart(host, S, BD = null) {
  host.textContent = '';
  const T = tok(), M = BD ? BD.M : (S.members ?? []), wrap = h('div', {class: 'psurge-svr'}); host.append(wrap);
  const W = Math.max(200, Math.round(wrap.clientWidth || 320)), H = 150, P = 12, base = H - 6, mtH = 54; // 넓이 = 칸의 제 넓이(새 앱 「가」 글씨 크기는 화면 칸을 통째로 키움(zoom) — 보이는 넓이로 재면 글 자리가 어긋남)
  const X = x => P + (Math.max(SV_LO, Math.min(SV_HI, x)) - SV_LO) / (SV_HI - SV_LO) * (W - 2 * P);
  const bins = S.bins ?? [], mx = Math.max(1, ...bins.map(b => b[1]));
  const nNew = BD ? (BD.kind === 'pick' ? M.filter(m => m.tag === 'new').length : 0) : (S.kind === 'pick' ? S.in?.length ?? 0 : 0);
  const svg = sv('svg', {viewBox: `0 0 ${W} ${H}`, width: W, height: H, role: 'img', 'aria-label': `5일 오름 — 모든 회사 가운데 ${pct(S.market?.med)} · ${BD ? BD.name : '급등'} ${M.length}곳 ${M.length ? (BD ? `${pct(M.at(-1).r5)} ~ ${pct(M[0].r5)}` : `${pct(S.stats?.lo)} ~ ${pct(S.stats?.hi)}`) : '없음'}${nNew ? ` · 새로 ${nNew}곳` : ''}`});
  if (bins.length) { // 산 — 칸 가운데를 잇는 면 + 선(옅게)
    const pts = bins.map(([x, c]) => [X(x + 0.5), base - c / mx * mtH]);
    const d = `M${X(SV_LO).toFixed(1)} ${base}` + pts.map(([x, y]) => `L${x.toFixed(1)} ${y.toFixed(1)}`).join('') + `L${X(SV_HI).toFixed(1)} ${base}Z`;
    svg.append(sv('path', {d, fill: T.ink, 'fill-opacity': 0.08, stroke: T.sub, 'stroke-width': 1.2, 'stroke-linejoin': 'round'}));
  }
  svg.append(sv('line', {x1: P, x2: W - P, y1: base, y2: base, stroke: T['m4-line'], 'stroke-width': 1}));
  if (S.market?.med != null) svg.append(sv('line', {x1: X(S.market.med), x2: X(S.market.med), y1: base - mtH - 8, y2: base, stroke: T.mute, 'stroke-width': 1.5, 'stroke-dasharray': '3 4'}));
  const gate = BD ? [BD.lo, BD.hi].filter(x => x != null) : S.rules?.enter != null ? [S.rules.enter] : [];
  for (const x of gate) svg.append(sv('line', {x1: X(x), x2: X(x), y1: 6, y2: base, stroke: T.ink, 'stroke-opacity': 0.7, 'stroke-width': 1.5, 'stroke-dasharray': '2 4'}));
  const R = 4.6, col = new Map(), dots = [], keyOf = m => (m.r5 > SV_HI ? 'hi' : Math.floor(m.r5 / 2));
  const tall = Math.max(1, ...(() => { const c = new Map(); for (const m of M) c.set(keyOf(m), (c.get(keyOf(m)) ?? 0) + 1); return [...c.values()]; })());
  const step = Math.min(2 * R + 1.6, (base - 12) / tall);
  for (const m of [...M].sort((a, b) => a.r5 - b.r5 || (a.c < b.c ? -1 : 1))) {
    const key = keyOf(m), k = col.get(key) ?? 0; col.set(key, k + 1);
    const cx = key === 'hi' ? W - P - R : X(Math.floor(m.r5 / 2) * 2 + 1), cy = base - R - 1 - k * step, isNew = m.tag === 'new' && (BD ? BD.kind : S.kind) === 'pick';
    svg.append(sv('circle', {cx: cx.toFixed(1), cy: cy.toFixed(1), r: R, fill: T.up, stroke: isNew ? T.ink : T.night, 'stroke-width': isNew ? 2 : 1.2}));
    dots.push({m, x: cx, y: cy});
  }
  wrap.append(svg);
  // 글(HTML) — 문턱은 위 · 가운데값은 아래 왼쪽 · 끝(80% 넘게)에 쌓인 곳 수는 아래 오른쪽(넓이를 재어 자리 · 겹치면 끝 글을 숨김)
  const lab = h('div', {class: 'psurge-svl', 'aria-hidden': 'true'}), mk = (c2, text) => { const e = h('span', {class: c2 + ' psurge-num', text}); lab.append(e); return e; };
  const thX = gate.length ? gate.at(-1) : null, th = thX == null ? null : mk('psurge-th', BD ? (BD.hi == null ? `${BD.lo}% 이상` : `${BD.lo}% ~ ${BD.hi}%`) : `문턱 ${pct(S.rules.enter)}`), md0 = S.market?.med != null ? mk('psurge-md', `가운데 ${pct(S.market.med)}`) : null;
  const nHi = M.filter(m => m.r5 > SV_HI).length, hi = nHi ? mk('psurge-hi', `${SV_HI}% 넘게 ${nHi}곳`) : null;
  wrap.append(lab);
  const tip = h('div', {class: 'psurge-tip psurge-num'}); tip.hidden = true; wrap.append(tip);
  const place = () => {
    const at = (e, x, top) => { const w = e.offsetWidth || 80, L = Math.max(0, Math.min(W - w, x - w / 2)); st(e, {left: L + 'px', [top ? 'top' : 'bottom']: '0'}); return [L, L + w]; };
    if (th) { const w = th.offsetWidth || 120, x = X(thX), L = x + 6 + w <= W ? x + 6 : Math.max(0, x - 6 - w); st(th, {left: L + 'px', top: '0'}); }
    const m = md0 ? at(md0, X(S.market.med), false) : null;
    if (hi) { hi.hidden = false; const w = hi.offsetWidth || 120, L = W - w; st(hi, {left: L + 'px', bottom: '0'});
      if (m && m[1] + 8 > L) { const L2 = Math.max(0, L - 8 - (m[1] - m[0])); st(md0, {left: L2 + 'px'}); if (L2 + (m[1] - m[0]) + 8 > L) hi.hidden = true; } }
  };
  place(); requestAnimationFrame(place);
  const near = ev => { const r = svg.getBoundingClientRect(), x = (ev.clientX - r.left) * W / r.width, y = (ev.clientY - r.top) * H / r.height; let best = null, bd = 18 * 18; for (const d of dots) { const q = (d.x - x) ** 2 + (d.y - y) ** 2; if (q < bd) { bd = q; best = d; } } return best; };
  svg.addEventListener('pointerdown', ev => { const d = near(ev); if (!d) { tip.hidden = true; return; } tip.hidden = false; tip.textContent = `${d.m.n} ${pct(d.m.r5)}`;
    const tw = tip.offsetWidth || 160; st(tip, {left: Math.min(W - tw / 2, Math.max(tw / 2, d.x)) + 'px'}); }); // 이름이 길어도 그림 칸 안(옛 80px 자 → 쪽지 넓이로) · 그림 칸 제 단위(점 자리 = 칸 안 자리)
  svg.addEventListener('pointerleave', ev => { if (ev.pointerType === 'mouse') tip.hidden = true; });
}
/** 그림 칸 — 붙은 뒤 넓이를 재어 그리고, 넓이가 바뀌면 다시 그림(옛 chartDraw) · 높이는 미리 잡아 둠(돌아올 때 자리가 밀리지 않게) */
function chartBox(S, BD) {
  const host = h('div', {class: 'psurge-svc'});
  let w0 = -1;
  const draw = () => { if (!host.isConnected) return; const w = host.clientWidth; if (!w || w === w0) return; w0 = w; svChart(host, S, BD); };
  if ('ResizeObserver' in window) { const ro = new ResizeObserver(() => { if (!host.isConnected) { if (w0 >= 0) ro.disconnect(); return; } draw(); }); ro.observe(host); }
  onAttach(host, draw);
  return host;
}

/* ── 줄(옛 race — 급등 탭은 경주 없이 끝 모습 · 1등 빛 없음 · 차례 번호 없음) — 줄 하나 = 이름 · 5일 % · 작은 선(5일 전 = 100 · 점선 = 5일 전 값 · 흐린 점선 = 셀 수 있는 회사 가운데값) ── */
const SPW = 100, SPH = 30;
function board(items, parent, label, n = 6) {
  const box = h('div', {class: 'psurge-board', role: 'group', 'aria-label': label});
  const at = (arr, k) => { const a = Math.floor(k), b = Math.min(n - 1, a + 1), f = k - a; const x = arr[a], y = arr[b]; if (x == null) return y; if (y == null) return x; return x + (y - x) * f; };
  const sx = j => (j / Math.max(1, n - 1) * SPW).toFixed(2);
  const sy = (v, [lo, hi]) => (hi - lo < 1e-9 ? SPH / 2 : 2 + (hi - v) / (hi - lo) * (SPH - 4)).toFixed(2);
  const lineTo = (arr, k, Rg) => { if (!arr) return ''; let d = '', on = false; const a = Math.floor(k);
    for (let j = 0; j <= a && j < n; j++) { const x = arr[j]; if (x == null) { on = false; continue; } d += (on ? 'L' : 'M') + sx(j) + ' ' + sy(x, Rg); on = true; }
    return d; };
  const rows = items.map(it => {
    const vs = [...it.v, ...(parent ? parent.v : []), 100].filter(x => x != null && isFinite(x)), Rg = [Math.min(...vs), Math.max(...vs)];
    const v = at(it.v, n - 1), d = v == null ? null : v - 100, y0 = sy(100, Rg);
    const spk = sv('svg', {class: 'psurge-spk', viewBox: `0 0 ${SPW} ${SPH}`, preserveAspectRatio: 'none', 'aria-hidden': 'true', focusable: 'false'});
    spk.append(sv('line', {class: 'psurge-b0', x1: 0, x2: SPW, y1: y0, y2: y0}));
    if (parent) spk.append(sv('path', {class: 'psurge-pa', d: lineTo(parent.v, n - 1, Rg)}));
    spk.append(sv('path', {class: 'psurge-ln ' + cl(d), d: lineTo(it.v, n - 1, Rg)}));
    const nm = h('span', {class: 'psurge-nm'}, h('span', {class: 'psurge-nt', text: it.name}), it.badge ? h('span', {class: 'psurge-badge', text: it.badge}) : null, it.gold ? h('span', {class: 'psurge-badge psurge-gold', text: it.gold}) : null);
    const row = kkRow(h('a', {class: 'psurge-br', href: it.href}, nm, h('b', {class: 'psurge-val psurge-num ' + (d == null ? 'q' : cl(d)), text: pct(d)}), h('span', {class: 'psurge-track', 'aria-hidden': 'true'}, spk), h('span', {class: 'psurge-chev', 'aria-hidden': 'true', text: '›'})), it.c, it.name, 'surge.board');
    return {row, cur: v};
  });
  for (const r of rows.slice().sort((a, b) => (b.cur ?? -Infinity) - (a.cur ?? -Infinity) || 0)) box.append(r.row); // 5일 동안 많이 오른 차례(옛 경주판 끝 차례)
  return box;
}
const boardItems = (M, prov, newOn) => M.map(m => ({c: m.c, name: m.n, href: cHref(m.c), v: m.v, badge: newOn && m.tag === 'new' ? '새로' : null, gold: prov && m.prov ? '? 장 중' : null}));
const boardKey = S => h('p', {class: 'psurge-key'}, h('span', {}, h('i', {class: 'psurge-kup'}), '오름'), h('span', {}, h('i', {class: 'psurge-kdn'}), '내림'), h('span', {}, h('i', {class: 'psurge-kavg'}), '셀 수 있는 회사 가운데값'), h('span', {}, h('i', {class: 'psurge-kb0'}), `5일 전(${md(S.window?.[0] ?? S.asOf)}) 값`));

/* ── 줄 조각(옛 svRow · svLi · svNames) ── */
const svRow = (o, showPct) => kkRow(h('a', {class: 'psurge-row', href: cHref(o.c)}, h('span', {class: 'psurge-rt'}, h('span', {class: 'psurge-nm', text: o.n}), showPct ? (o.r5 == null ? qEl() : pctEl(o.r5)) : null), h('span', {class: 'psurge-why' + (/^\?/.test(o.why) ? ' q' : ''), text: o.why}), h('span', {class: 'psurge-chev', 'aria-hidden': 'true', text: '›'})), o.c, o.n, 'surge.row');
/** 카톡 줄(사장님 2026-10-18 16:39 [6] 1 · 6 · 8 · 일꾼 KB2) — 줄 고리와 카톡 단추(share-btn.js 하나)를 형제로 · 급등 종목이라 kind 'surge'(받는 카드에 반값 한 줄) · 단추를 못 만들면 줄 그대로 */
function kkRow(a, c, name, place) { const kb = shareButtons({code: c, name, kind: 'surge'}, {kakao: true}); return kb ? h('div', {class: 'kkr psurge-kr', 'data-kkrow': place}, a, kb) : a; }
/** 숨긴 곳 줄(고리 · 되돌리기는 그대로) — 같은 카톡 단추를 줄 끝에 더함(고리와 형제 · 누름은 되돌리기로 새지 않음) */
function kkIn(row, c, name, place) { const kb = shareButtons({code: c, name, kind: 'surge'}, {kakao: true}); if (kb) { row.setAttribute('data-kkrow', place); row.append(kb); } return row; }
const svLi = (mark, b, t, names, mo = null) => h('li', {}, h('span', {class: 'psurge-m' + (mark === '?' ? ' q' : ' psurge-w'), text: mark}), h('span', {}, h('b', {text: b + ' '}), t, names?.length ? h('span', {class: 'psurge-nms', text: names.join(' · ')}) : null, mo ? h('span', {class: 'psurge-nms', text: `${mo[0]}: ${mo[1].join(' · ')}`}) : null));
/** 이름 고리 — 옮긴 곳(어디서 · 어디로)은 한 줄에 한 곳 · 나머지는 「 · 」로 잇고 15곳 넘으면 12곳 + 접은 칸 · xs = [{c, n, t}] */
function svNames(lab, xs) {
  const box = h('div', {class: 'psurge-nl'}), withT = xs.some(x => x.t), cut = xs.length > 15 ? 12 : xs.length;
  const one = x => [h('a', {class: 'psurge-inl', href: cHref(x.c), text: x.n}), x.t ? h('span', {class: 'psurge-tl', text: x.t}) : null];
  const body = ys => (withT ? h('ul', {class: 'psurge-ml'}, ...ys.map(x => h('li', {}, ...one(x)))) : h('p', {class: 'psurge-in'}, ...ys.flatMap((x, i) => [i ? ' · ' : null, ...one(x)])));
  box.append(h('p', {class: 'psurge-in'}, h('b', {text: `${lab} ${xs.length}곳`})), body(xs.slice(0, cut)));
  if (xs.length > cut) box.append(more(`나머지 ${xs.length - cut}곳 보기`, [body(xs.slice(cut))]));
  return box;
}

/* ── 날마다 달력(옛 svCal · svDayOf · svDayPanel) — 월 ~ 금 다섯 줄 · 칸 = 그날 이 칸에 든 곳 · 뺀 곳 수 · 누르면 그날 이름 ── */
const dPlus = (d, k) => new Date(Date.parse(d + 'T00:00:00Z') + k * 864e5).toISOString().slice(0, 10), dDow = d => new Date(d + 'T00:00:00Z').getUTCDay();
const svCalOk = K => !!(K && K.version === 'sk-v1' && Array.isArray(K.dates) && K.dates.length && K.dates.every(isDay) && Array.isArray(K.days) && Array.isArray(K.track));
/** 이 칸의 그날 사건 — 든 = 처음 담음 · 새로 듦 · 옮겨 옴 / 뺌 = 빠짐 · 옮겨 감(회사 수) · 줄 = [때, 업데이트, 번호, 이름, 종류, 칸, 옮긴 칸] */
function svDayOf(K, d, tab) {
  const ev = (K.days.find(x => x.d === d)?.ev ?? []).filter(e => e[5] === tab || e[6] === tab);
  const isIn = e => (e[4] === 'move' ? e[6] === tab : (e[4] === 'first' || e[4] === 'in') && e[5] === tab), isOut = e => (e[4] === 'move' ? e[5] === tab : e[4] === 'out' && e[5] === tab);
  return {ev, nIn: new Set(ev.filter(isIn).map(e => e[2])).size, nOut: new Set(ev.filter(isOut).map(e => e[2])).size};
}
/** 고른 날 하나 — 업데이트(때)마다 늦은 때가 위 · 들어온 곳(처음 담음 · 새로 듦 · 옮겨 옴) · 나간 곳(빠짐 · 옮겨 감) */
function svDayPanel(K, d, tab) {
  const {ev, nIn, nOut} = svDayOf(K, d, tab), p = h('div', {class: 'psurge-day', 'data-d': d});
  p.append(h('p', {class: 'psurge-dh'}, h('b', {text: mdw(d)}), ev.length ? ' — ' + [nIn ? `들어온 곳 ${nIn}` : null, nOut ? `나간 곳 ${nOut}` : null].filter(Boolean).join(' · ') : ''));
  if (!ev.length) { p.append(h('p', {class: 'psurge-small', text: '이날 이 칸은 바뀐 곳이 없어요.'})); return p; }
  const G = new Map(); for (const e of ev) { const k = e[0] + '|' + (e[1] ?? ''); if (!G.has(k)) G.set(k, []); G.get(k).push(e); }
  for (const [k, es] of [...G].sort((a, b) => (a[0] < b[0] ? 1 : a[0] > b[0] ? -1 : 0))) {
    const [kst, slot] = k.split('|'), when = (kst.slice(0, 10) !== d && isDay(kst) ? md(kst.slice(0, 10)) + ' ' : '') + (slot || kst.slice(11, 16));
    p.append(h('p', {class: 'psurge-ut', text: slot ? `${when} 업데이트` : `${when}에 처음 골랐어요`}));
    const of = f => es.filter(f).map(e => ({c: e[2], n: e[3], e}));
    const ins = [['처음 담은 곳', of(e => e[4] === 'first' && e[5] === tab)], ['새로 든 곳', of(e => e[4] === 'in' && e[5] === tab)], ['옮겨 온 곳', of(e => e[4] === 'move' && e[6] === tab).map(x => ({...x, t: SV_FROM[x.e[5]]}))]].filter(x => x[1].length);
    const outs = [['빠진 곳', of(e => e[4] === 'out' && e[5] === tab)], ['다른 칸으로 옮겨 간 곳', of(e => e[4] === 'move' && e[5] === tab).map(x => ({...x, t: SV_TO[x.e[6]]}))]].filter(x => x[1].length);
    for (const [head, parts] of [['들어온 곳', ins], ['나간 곳', outs]]) {
      if (parts.length > 1) p.append(h('p', {class: 'psurge-io'}, h('b', {text: `${head} ${parts.reduce((a, x) => a + x[1].length, 0)}곳`}), ` = ${parts.map(x => x[0]).join(' + ')}`));
      for (const [lab, xs] of parts) p.append(svNames(lab, xs));
    }
  }
  return p;
}
/* 회사를 보고 뒤로 오면 그 칸의 고른 날 · 펼친 묶음 그대로(옛 svLeave · svBack — 자리(스크롤)는 새 앱이 돌려줌) · 이 열린 창 안에서만(저장 안 함) */
const MEM = new Map(); // 칸 → {day, open, gone}
let trail = [];
addEventListener('hashchange', e => { try { trail.push(new URL(e.newURL).hash || '#/'); if (trail.length > 30) trail = trail.slice(-30); } catch { /* 주소 못 읽음 */ } });
/** 바로 앞 화면의 주소 — 이 화면을 그리는 때가 hashchange 앞이든 뒤든 같은 답 */
function cameFrom() { const now = location.hash || '#/', n = trail.length; if (!n) return null; return trail[n - 1] === now ? (trail[n - 2] ?? null) : trail[n - 1]; }
const rec = tab => { if (!MEM.has(tab)) MEM.set(tab, {day: null, open: null, gone: false}); return MEM.get(tab); };
function svCal(v, tab, ok, K, back) {
  v.append(sec('날마다 달력', 'psurgeCalH'));
  if (!ok || !svCalOk(K)) { v.append(h('p', {class: 'q', text: '? 달력 자료를 못 받았어요. 잠시 뒤 다시 열어 주세요.'})); return; }
  const dates = K.dates, set = new Set(dates), last = dates.at(-1);
  const tabDays = K.days.filter(x => set.has(x.d) && x.ev.some(e => e[5] === tab || e[6] === tab)).map(x => x.d).sort();
  const f0 = K.days.filter(x => set.has(x.d) && x.ev.some(e => e[4] === 'first' && e[5] === tab)).map(x => x.d).sort()[0];
  const start = f0 && tabDays[0] === f0 ? f0 : dates[0]; // 이 칸을 처음 고른 날이 창 안이면 그 앞은 「기록 전」
  v.append(h('p', {class: 'psurge-note', text: `${NX.D.sum?.fourADay === true ? '하루 4번 업데이트' : '정해진 업데이트'} 때 적어요. 날짜를 누르면 그날 ${SV_KAN[tab]} 들어온 곳과 나간 곳이 나와요.`})) /* 「하루 4번」은 요약의 fourADay 일 때만([5] 4 · 일꾼 KC) */;
  if (start > dates[0]) v.append(h('p', {class: 'psurge-small', text: `${md(start)}부터 적었어요. 날마다 쌓여 지난 ${K.keep}거래일까지 남아요.`}));
  const head = h('div', {class: 'psurge-wk psurge-hd', 'aria-hidden': 'true'}, ...['월', '화', '수', '목', '금'].map(t => h('span', {text: t})));
  const from = start > dates[0] ? start : dates[0]; // 기록이 짧으면 처음 적은 주부터(빈 칸이 줄지어 서지 않게)
  const grid = h('div', {class: 'psurge-wk', role: 'group', 'aria-label': `${SV_NAME[tab]} 칸 날마다 달력 — ${md(from)} ~ ${md(last)}`});
  const panels = h('div', {class: 'psurge-days'}), seen = {pre: 0, off: 0, none: 0};
  let mo = '', pick = null;
  for (let d = dPlus(from, 1 - dDow(from)), end = dPlus(last, 5 - dDow(last)); d <= end; d = dPlus(d, 1)) {
    const w = dDow(d); if (w === 0 || w === 6) continue;
    if (d < dates[0] || d > last) { grid.append(h('div', {class: 'psurge-cell psurge-blank'})); continue; }
    const m = +d.slice(5, 7), dn = [m !== +mo ? h('span', {class: 'psurge-mo', text: `${m}월`}) : null, h('span', {class: 'psurge-dnum psurge-num', text: String(+d.slice(8, 10))})]; if (m !== +mo) mo = String(m);
    if (!set.has(d)) { seen.off++; grid.append(h('div', {class: 'psurge-cell psurge-off'}, ...dn, h('span', {class: 'psurge-cx', text: '쉼'}))); continue; }
    if (d < start) { seen.pre++; grid.append(h('div', {class: 'psurge-cell psurge-pre'}, ...dn, h('span', {class: 'psurge-cx', text: '—'}))); continue; }
    const {ev, nIn, nOut} = svDayOf(K, d, tab);
    if (!ev.length) seen.none++;
    const b = h('button', {type: 'button', class: 'psurge-cell', 'data-d': d, 'aria-pressed': 'false', 'aria-label': `${mdw(d)} ${ev.length ? `든 곳 ${nIn} · 빠진 곳 ${nOut}` : '바뀐 곳 없음'}`}, ...dn,
      ev.length ? [nIn ? h('span', {class: 'psurge-ci psurge-num', text: `든 ${nIn}`}) : null, nOut ? h('span', {class: 'psurge-co psurge-num', text: `뺌 ${nOut}`}) : null] : h('span', {class: 'psurge-cx', text: '없음'}));
    grid.append(b); const pn = svDayPanel(K, d, tab); pn.hidden = true; panels.append(pn);
    if (ev.length) pick = d;
  }
  pick = pick ?? last;
  const R = back ? MEM.get(tab) : null; if (R?.day && [...panels.children].some(p => p.dataset.d === R.day)) pick = R.day; // 회사에서 돌아오면 고른 날 그대로
  const sel = d => { for (const b of grid.querySelectorAll('button.psurge-cell')) b.setAttribute('aria-pressed', String(b.dataset.d === d)); for (const p of panels.children) p.hidden = p.dataset.d !== d; };
  grid.addEventListener('click', e => { const b = e.target.closest('button.psurge-cell'); if (b) { sel(b.dataset.d); rec(tab).day = b.dataset.d; } });
  v.append(h('div', {class: 'psurge-cal'}, head, grid));
  v.append(h('p', {class: 'psurge-lkey psurge-ckey'}, h('span', {text: '든 = 들어온 곳'}), h('span', {text: '뺌 = 나간 곳(빠지거나 다른 칸으로 옮긴 곳)'}), seen.none ? h('span', {text: '없음 = 바뀐 곳 없음'}) : null, seen.off ? h('span', {text: '쉼 = 장이 쉰 날'}) : null, seen.pre ? h('span', {text: '— = 기록 전'}) : null));
  v.append(panels); sel(pick);
}

/* ── 며칠 뒤 어떻게 됐나(옛 svSpark · svTrRow · svTrack) — 이 칸에 한 번이라도 든 곳 · 처음 찾은 날 종가부터 날마다 · 「관심 없음」은 이 기기에만 ── */
const SV_HIDE = 'atlas:surge-hide'; // 옛 쪽과 같은 열쇠 · 같은 꼴(번호 차례 배열) — 두 화면에서 같은 목록
let svHideMem = new Set();
function hideGet() { try { const x = JSON.parse(localStorage.getItem(SV_HIDE) || '[]'); return new Set(Array.isArray(x) ? x.filter(c => typeof c === 'string' && /^[0-9A-Z]{6}$/.test(c)).slice(0, 5000) : []); } catch { return new Set(svHideMem); } }
function hidePut(s) { svHideMem = new Set(s); try { localStorage.setItem(SV_HIDE, JSON.stringify([...s].sort())); return true; } catch { return false; } }
/** 줄 선 — 처음 찾은 날 종가 = 0 · 날마다 · 값이 빈 날은 끊음(앞뒤가 빈 날 하나는 점) · 마지막 값이 오르면 빨강 · 내리면 파랑 */
function svSpark(t, Pp) {
  const vals = [0, ...Pp.map(p => p[1])], n = vals.length, nn = vals.filter(x => x != null), lo = Math.min(0, ...nn), hi = Math.max(0, ...nn), span = hi - lo || 1;
  const X = i => 2 + i * 96 / Math.max(1, n - 1), Y = x => 3 + (hi - x) / span * 24, T = tok(), lastV = [...vals].reverse().find(x => x != null);
  const s = sv('svg', {viewBox: '0 0 100 30', preserveAspectRatio: 'none', class: 'psurge-tsp', role: 'img', 'aria-label': `${t.n} — 처음 찾은 날 종가부터 날마다: ` + (Pp.length ? Pp.map(p => `${md(p[0])} ${pct(p[1])}`).join(', ') : '아직 없음')});
  s.append(sv('line', {x1: 0, x2: 100, y1: Y(0).toFixed(1), y2: Y(0).toFixed(1), stroke: T.mute, 'stroke-width': 1, 'stroke-dasharray': '2 3', 'vector-effect': 'non-scaling-stroke'}));
  let d = '', pen = false; vals.forEach((x, i) => { if (x == null) { pen = false; return; } d += (pen ? 'L' : 'M') + X(i).toFixed(1) + ' ' + Y(x).toFixed(1); pen = true; });
  vals.forEach((x, i) => { if (x != null && vals[i - 1] == null && vals[i + 1] == null) d += `M${(X(i) - 1.4).toFixed(1)} ${Y(x).toFixed(1)}L${(X(i) + 1.4).toFixed(1)} ${Y(x).toFixed(1)}`; });
  s.append(sv('path', {d, class: 'psurge-ln ' + cl(lastV), fill: 'none', stroke: lastV > 0 ? T.up : lastV < 0 ? T.down : T.mute, 'stroke-width': 2.4, 'stroke-linejoin': 'round', 'stroke-linecap': 'round', 'vector-effect': 'non-scaling-stroke'}));
  return s;
}
/** 줄 하나 — 이름 | 관심 없음 · 처음 찾은 칸 / 지금 든 칸(두 줄) · 작은 선 | n일 뒤 ±x% */
function svTrRow(t) {
  const Pp = t.path ?? []; let li = -1; for (let i = Pp.length - 1; i >= 0; i--) if (Pp[i][1] != null) { li = i; break; }
  const nowT = (t.now ?? []).map(x => SV_NAME[x]).filter(Boolean);
  const kb = shareButtons({code: t.c, name: t.n, kind: 'surge'}, {kakao: true}); // 카톡 단추 = 첫 줄(이름 · 관심 없음) 오른쪽 끝(KB2 · [6] 1 · 8)
  return h('div', {class: 'psurge-tr', 'data-c': t.c, 'data-kkrow': kb ? 'surge.track' : null},
    h('div', {class: 'psurge-trt'}, h('a', {class: 'psurge-nm', href: cHref(t.c), text: t.n}), h('span', {class: 'psurge-tra'}, h('button', {type: 'button', class: 'psurge-hide', 'data-c': t.c, text: '관심 없음'}), kb)), // 이름이 길면 단추 둘이 한 덩이로 밑 줄 오른쪽 끝에(이름은 가르지 않음 · 카톡이 혼자 밑 줄 왼쪽으로 가지 않게 — 2026-10-18 모든 쪽 검사)
    h('p', {class: 'psurge-trsub'}, h('span', {text: `처음 찾은 칸: ${SV_NAME[t.t] ?? '?'}`}), h('span', {text: nowT.length ? `지금 든 칸: ${nowT.join(', ')}` : '지금은 다섯 칸 밖'})),
    svSpark(t, Pp),
    h('span', {class: 'psurge-v'}, li >= 0 ? h('span', {class: 'psurge-dd', text: `${li + 1}일 뒤 `}) : null, li >= 0 ? pctEl(Pp[li][1]) : qEl()));
}
function svTrack(v, tab, ok, K, back) {
  v.append(sec('며칠 뒤 어떻게 됐나', 'psurgeTrkH'));
  if (!ok || !svCalOk(K)) { v.append(h('p', {class: 'q', text: '? 따라간 기록을 못 받았어요. 잠시 뒤 다시 열어 주세요.'})); return; }
  const ever = new Set(K.track.filter(t => (t.now ?? []).includes(tab)).map(t => t.c));
  for (const x of K.days) for (const e of x.ev) if (e[5] === tab || e[6] === tab) ever.add(e[2]);
  const all = K.track.filter(t => ever.has(t.c)), went = all.filter(t => t.path?.length), fresh = all.filter(t => !t.path?.length && t.d === K.asOf).length, nobase = all.filter(t => !t.path?.length && t.d !== K.asOf).length;
  v.append(h('p', {class: 'psurge-note', text: `${SV_KAN[tab]} 한 번이라도 든 곳이에요. 다섯 칸 어디든 처음 찾은 날 종가부터 날마다 몇 %인지 적어요. 날은 장이 열린 날로 세고, 처음 찾은 날부터 ${K.keep}거래일까지 적어요.`}));
  if (went.length) v.append(h('p', {class: 'psurge-small', text: '「관심 없음」을 누르면 이 목록에서 빠져요. 다섯 칸 모두 같아요. 이 휴대폰에서만 그래요. 위 칸 목록은 그대로예요.'}));
  if (K.provisional && isDay(K.asOf) && went.length) v.append(h('p', {class: 'psurge-prov', text: `${md(K.asOf)} 값은 장 중 값이에요. 저녁 8시까지 바뀌어요.`}));
  const days = [...new Set(went.map(t => t.d))].sort().reverse(), byName = (a, b) => a.n.localeCompare(b.n, 'ko') || (a.c < b.c ? -1 : 1);
  const trk = h('div', {class: 'psurge-trk'}), box = h('div', {class: 'psurge-trs'}), live = h('p', {class: 'psurge-sr', role: 'status', 'aria-live': 'polite'});
  const R = back ? MEM.get(tab) : null;
  const goneEl = () => { const hid = hideGet(), gone = went.filter(t => hid.has(t.c)).sort(byName); if (!gone.length) return null;
    return more(`숨긴 곳 ${gone.length}곳 보기`, gone.map(t => kkIn(h('p', {class: 'psurge-g'}, h('a', {class: 'psurge-inl', href: cHref(t.c), text: t.n}), h('button', {type: 'button', class: 'psurge-show', 'data-c': t.c, text: '되돌리기'})), t.c, t.n, 'surge.gone')), 'psurge-gone'); }; // 숨긴 곳 줄도 종목 줄 — 카톡 단추(KB2)
  const tail = h('div', {class: 'psurge-tail'});
  let goneOpen0 = !!R?.gone;
  const drawTail = () => { const g0 = tail.querySelector('details.psurge-gone'), open = g0 ? g0.open : goneOpen0; goneOpen0 = false; tail.textContent = '';
    if (fresh) tail.append(h('p', {class: 'psurge-small', text: `${isDay(K.asOf) ? md(K.asOf) + '에' : '마지막 날'} 처음 찾은 ${fresh}곳은 다음 장날부터 적혀요.`}));
    if (nobase) tail.append(h('p', {class: 'q', text: `? 처음 찾은 날 종가가 없어 못 적은 곳 ${nobase}곳`}));
    const g = goneEl(); if (g) { if (open) g.open = true; tail.append(g); } };
  let open0 = R?.open ? new Set(R.open) : null; // 회사에서 돌아오면 펼친 묶음 그대로
  const draw = () => {
    const open = open0 ?? new Set([...box.querySelectorAll('details.psurge-grp[open]')].map(x => x.dataset.d)), first = !open0 && !box.childElementCount; open0 = null;
    box.textContent = '';
    const hid = hideGet(); let shownAny = false;
    if (!went.length) box.append(h('p', {class: 'q', text: '? 아직 따라간 날이 없어요.'}));
    for (const d of days) {
      const rows = went.filter(t => t.d === d && !hid.has(t.c)).sort(byName); if (!rows.length) continue;
      const k = Math.max(...rows.map(t => t.path.length)), g = more(`${md(d)}에 처음 찾은 곳 ${rows.length}곳 — ${k}일 뒤`, rows.map(svTrRow), 'psurge-grp'); g.dataset.d = d;
      if (first ? !shownAny : open.has(d)) g.open = true;
      box.append(g); shownAny = true;
    }
    if (went.length && !shownAny) box.append(h('p', {class: 'psurge-small', text: '보이는 곳이 없어요. 모두 숨겼어요.'}));
    drawTail();
  };
  const say = msg => { live.textContent = msg; };
  trk.addEventListener('click', e => {
    const b = e.target.closest('button[data-c]'); if (!b || !(box.contains(b) || tail.contains(b))) return;
    const c = b.dataset.c, t = all.find(x => x.c === c); if (!t) return;
    const hid = hideGet();
    if (b.classList.contains('psurge-hide')) { // 그 자리에 「숨겼어요 · 되돌리기」 — 줄 높이 그대로(아래 줄이 손가락 밑으로 올라오지 않게)
      hid.add(c); const kept = hidePut(hid), row = b.closest('.psurge-tr'), hh = row.offsetHeight;
      const undo = h('button', {type: 'button', class: 'psurge-undo', 'data-c': c, text: '되돌리기'}), ph = h('div', {class: 'psurge-ph', 'data-c': c}, h('span', {class: 'psurge-phn', text: `${t.n} 숨겼어요`}), undo);
      st(ph, {'min-height': hh + 'px'}); row.replaceWith(ph); drawTail(); try { undo.focus({preventScroll: true}); } catch { /* 초점 못 옮김 */ }
      say(`${t.n} 숨겼어요.${kept ? '' : ' 이 기계는 기억을 못 해 다시 열면 돌아와요.'}`);
    } else if (b.classList.contains('psurge-undo')) { hid.delete(c); hidePut(hid); b.closest('.psurge-ph').replaceWith(svTrRow(t)); drawTail(); say(`${t.n} 다시 보여요.`); }
    else if (b.classList.contains('psurge-show')) { hid.delete(c); hidePut(hid); open0 = new Set([...box.querySelectorAll('details.psurge-grp[open]')].map(x => x.dataset.d)); open0.add(t.d); draw(); say(`${t.n} 다시 보여요.`); } // 되돌린 줄이 든 묶음은 펼쳐 둠 — 그 날 묶음이 닫힌 채 다시 그려져 「다시 보여요」인데 안 보이던 것
  });
  trk.addEventListener('toggle', e => { const x = e.target; if (!(x instanceof HTMLDetailsElement)) return; // 펼친 묶음 · 숨긴 곳 칸 기억(회사를 보고 돌아올 때)
    if (x.classList.contains('psurge-grp')) rec(tab).open = [...box.querySelectorAll('details.psurge-grp')].filter(g => g.open).map(g => g.dataset.d);
    else if (x.classList.contains('psurge-gone')) rec(tab).gone = x.open; }, true);
  draw();
  trk.append(box, tail, live, h('p', {class: 'psurge-hon', text: '지난 값일 뿐 앞날을 말하지 않아요.'}));
  v.append(trk);
}

/* ── 더 확인할 곳 · 맨 아래 자료 줄 ── */
function svSee(v, S) {
  v.append(sec('더 확인할 곳'));
  v.append(h('ul', {class: 'psurge-chk psurge-see'},
    h('li', {}, h('span', {class: 'psurge-m', text: '·'}), h('span', {}, '거래소 경고 · 거래정지: ', h('a', {class: 'psurge-inl', href: 'https://kind.krx.co.kr/', target: '_blank', rel: 'noopener noreferrer', text: '한국거래소 공시'}))),
    h('li', {}, h('span', {class: 'psurge-m', text: '·'}), h('span', {}, '주식 수 바뀜 · 큰 계약: ', h('a', {class: 'psurge-inl', href: 'https://dart.fss.or.kr/', target: '_blank', rel: 'noopener noreferrer', text: '금융감독원 공시'}))),
    h('li', {}, h('span', {class: 'psurge-m', text: '·'}), h('span', {text: `다음 업데이트: ${svNext(S)}(서울) — 그때 넣고 빼요.`})),
    S.provisional ? h('li', {}, h('span', {class: 'psurge-m', text: '·'}), h('span', {text: '오늘 값이 굳는 때: 저녁 8시 뒤예요. 다음 장날 첫 업데이트에 들어가요.'})) : null));
}
const NP = C => C?.funnel?.picked ?? '?';
const pickName = C => `${C?.rules?.name ?? '고른'} ${NP(C)}곳`;
const lyDay = C => (C?.rules?.lyDay ? md(C.rules.lyDay) : '모음 날');
const pickHow = C => `멍거 갈래는 3년 성적표만, 린치 갈래는 3년 성적표와 ${lyDay(C)} 값으로 골랐습니다`;
/** 맨 아래 — 자료 줄(옛 foot 그대로 · 이 탭은 그 칸의 셈 줄) · 아직 바뀔 수 있는 값 「?」 · 안전 문장(새 화면 말 — 옛 「투자 상담사 …」 줄과 같은 뜻) */
function foot(C, src = null) {
  const price = C?.sources?.price ?? '?';
  return h('footer', {class: 'psurge-foot'},
    h('p', {text: src ? `자료: ${price} · ${src}.` : C ? `자료: ${price} · 기준일 = 마지막 종가 날(${md(C.asOf)})의 ${C.days}거래일 전(${md(C.base)}) · ${pickName(C)} — ${pickHow(C)}(그 뒤 주가는 안 씀).` : '? 자료 줄을 받지 못했어요.'}),
    C?.provisional ? h('p', {class: 'q', text: `? ${md(C.asOf)} 값은 그날 저녁 8시 전에 받아 아직 바뀔 수 있습니다(시간외 · 넥스트레이드) — 다음 받기에서 고쳐집니다.`}) : null,
    h('p', {class: 'psurge-safe', text: '둘이는 지난 기록만 보여 줘요. 사고팔기를 권하지 않아요.'}));
}
/** 칸 머리 — 제목 · 때 한 줄 */
const svHead = (v, title, S) => v.append(h('h1', {class: 'psurge-h', text: title}), h('p', {class: 'psurge-when', text: svTime(S)}));
/** 「며칠 뒤 어떻게 됐나 ↓」 — 그림 바로 밑(맨 밑 따라가기로 바로) */
function svJump() {
  const go = h('button', {type: 'button', class: 'psurge-go', text: '며칠 뒤 어떻게 됐나 ↓'});
  go.addEventListener('click', () => { const x = document.getElementById('psurgeTrkH'); if (x) x.scrollIntoView({block: 'start', behavior: RM.matches ? 'auto' : 'smooth'}); });
  return h('p', {class: 'psurge-jump'}, go);
}
const legend = (name, n, newOn, S) => h('p', {class: 'psurge-lkey'}, h('span', {}, h('i', {class: 'psurge-ldot'}), `${name} ${n}곳`), newOn ? h('span', {}, h('i', {class: 'psurge-ldot psurge-new'}), '이번에 새로') : null, h('span', {}, h('i', {class: 'psurge-lmt'}), `셀 수 있는 회사 ${(S.market?.n ?? 0).toLocaleString('ko-KR')}곳`));
/** 머리 밑 정직 글 · 「?」 — 두 칸 모두 같음 */
function honest(v, S, C) {
  if (S.provisional) v.append(h('p', {class: 'psurge-prov', text: '장 중 값이에요. 저녁 8시까지 바뀌어요.'})); // 장 중 = 회색 한 줄(금빛 아님)
  v.append(h('p', {class: 'psurge-hon', text: '사고팔 곳을 고른 목록이 아니에요.'}));
  v.append(h('p', {class: 'q', text: '? 오른 까닭은 몰라요.'}));
  if (C?.asOf && isDay(S.asOf) && S.asOf < C.asOf) v.append(h('p', {class: 'q', text: `? 이 목록은 ${md(S.asOf)} 값이에요. 그 뒤 값은 다음 업데이트에 들어가요.`})); // 목록이 사이트 값보다 늦음
  if (S.carry?.why) v.append(h('p', {class: 'q', text: '? ' + S.carry.why}));
}

/* ── 급등 칸(옛 svMain) — 다섯 질문: 무엇이 변했나 → 견줌 → 어떤 곳들 → 조심할 것과 모르는 것 → 더 확인할 곳 · 며칠 뒤 ── */
function svMain(v, S, ok, K, C, back) {
  const M = S.members ?? [], n = M.length, F = S.facts ?? {}, cap = S.cap ?? n, FU = S.funnel ?? {}, CUT = S.cut ?? {};
  svHead(v, `급등 ${n}곳`, S);
  v.append(h('p', {class: 'psurge-lead', text: n ? `지난 5일 동안 ${n}곳이 ${pct(S.stats.lo)} ~ ${pct(S.stats.hi)} 올랐어요.` : '지난 5일 동안 문턱을 넘은 곳이 없어요.'}));
  v.append(chartBox(S, null), legend('급등', n, S.kind === 'pick' && !!S.in?.length, S), svJump());
  honest(v, S, C);
  if (S.strict) v.append(h('p', {class: 'q', text: '? 장 중에 든 곳이 장 마감 값으로 자주 빠져, 지금은 두 번 넘어야 들어와요.'}));
  if (n < cap) v.append(h('p', {class: 'psurge-note', text: `오늘은 문턱을 넘은 곳이 ${n}곳뿐이에요. 억지로 채우지 않아요.`}));
  // 들고 남 — 바뀐 수 한 문장 → 나간 곳(접음) → 앞 날 장 중에 든 곳 다시 보기
  v.append(h('p', {class: 'psurge-chg', text: svChange(S)}));
  if (S.out?.length) v.append(more(`나간 곳 ${S.out.length}곳 — 까닭 보기`, S.out.map(o => svRow(o, true)), 'psurge-outs'));
  if (S.confirm?.n) v.append(h('p', {class: 'psurge-small', text: S.confirm.miss ? `${md(S.confirm.day)} 장 중에 든 ${S.confirm.n}곳 가운데 ${S.confirm.miss}곳은 그날 장 마감 값으로는 문턱 밑이었어요.` : `${md(S.confirm.day)} 장 중에 든 ${S.confirm.n}곳은 모두 그날 장 마감 값으로도 문턱을 넘었어요.`}));
  svCal(v, 'sv', ok, K, back);
  // ② 견줌
  v.append(sec('다른 곳과 견주면?'));
  const trio = h('div', {class: 'psurge-trio'}, h('div', {}, h('span', {text: `급등 ${n}곳 가운데값`}), n ? pctEl(S.stats.med) : qEl()), h('div', {}, h('span', {text: '셀 수 있는 회사 가운데값'}), pctEl(S.market?.med)), h('div', {}, h('span', {text: '가장 적게 오른 곳'}), n ? pctEl(S.stats.lo) : qEl()));
  v.append(trio); fitNums(trio);
  // ③ 어떤 곳들인가요?
  v.append(sec('어떤 곳들인가요?'));
  if (n) {
    v.append(h('p', {class: 'psurge-alt', text: `${n}곳 가운데 ${F.half ?? '?'}곳은 1년 사이 꼭대기의 반값 아래로 떨어진 적이 있어요.`}));
    const mk = [['KOSDAQ', '코스닥'], ['KOSPI', '코스피']].map(([k, nm]) => [nm, M.filter(m => m.mk === k).length]).filter(x => x[1]), same = (S.sameInd ?? []).map(x => `${x[0]} ${x[1]}곳`);
    v.append(h('p', {class: 'psurge-small', text: mk.map(([nm, c]) => `${nm} ${c}곳`).join(' · ') + (same.length ? ` · 같은 업종 3곳 이상: ${same.join(' · ')}` : '')}));
    const W3 = S.why ?? {};
    v.append(h('p', {class: 'psurge-small', text: `업종 전체가 함께 오른 곳 ${W3.ind ?? '?'}곳 · 업종과 따로 오른 곳 ${W3.co ?? '?'}곳${W3.mkt ? ` · 시장 전체와 함께 ${W3.mkt}곳` : ''}이에요. 오른 까닭은 몰라요.`}));
    v.append(board(boardItems(M, S.provisional, S.kind === 'pick'), S.market?.avg6 ? {v: S.market.avg6} : null, `급등 ${n}곳 — 5일 동안 많이 오른 차례`), boardKey(S));
  }
  // ④ 조심할 것과 모르는 것 — 「!」마다 바로 밑에 그 이름 · 「?」
  v.append(sec('조심할 것과 모르는 것'));
  const chk = h('ul', {class: 'psurge-chk'});
  const warnN = M.filter(m => m.warn), liveN = M.filter(m => m.warnLive), downN = M.filter(m => m.d1 != null && m.d1 < 0);
  if (warnN.length || liveN.length) chk.append(svLi('!', `거래소 경고 기준만큼 오른 곳 ${warnN.length}곳`, '— 5일 60% 또는 15일 100%로만 셌어요. 거래소가 실제로 경고했는지는 몰라요.', warnN.map(m => m.n), liveN.length ? [`장 중 값으로만 닿은 곳 ${liveN.length}곳`, liveN.map(m => m.n)] : null));
  if (downN.length) chk.append(svLi('!', `마지막 날 내린 곳 ${downN.length}곳`, '— 5일로는 올랐지만 마지막 날은 내렸어요.', downN.map(m => m.n)));
  if (F.one) chk.append(svLi('!', `하루에 몰려 오른 곳 ${F.one}곳`, '— 5일 오름의 대부분이 하루에 났어요.'));
  if (F.quiet) chk.append(svLi('!', `거래가 덜 붙은 곳 ${F.quiet}곳`, '— 5일 거래가 평소의 2배도 안 됐어요.'));
  if (F.reb) chk.append(svLi('!', `되오른 곳 ${F.reb}곳`, '— 5일 전에 이미 크게 빠져 있었어요.'));
  chk.append(svLi('?', '오른 까닭', '— 몰라요. 뉴스와 공시를 못 봐요.'), svLi('?', '거래소 경고 · 거래정지', '— 여기서는 확인 못 해요.'), svLi('?', '공매도 · 빚내서 산 돈 · 주식 수 바뀜', '— 못 봐요.'));
  if (FU.q) chk.append(svLi('?', `셀 수 없는 곳 ${FU.q.toLocaleString('ko-KR')}곳`, '— 새로 상장했거나 값이 빈 날 · 거래가 멈춘 날이 있어요.'));
  v.append(chk);
  if (S.cutList?.length) v.append(more(`+15%를 넘었지만 값이나 거래 때문에 뺀 곳 ${S.cutList.length}곳 — 까닭 보기`, S.cutList.map(o => svRow(o, false)), 'psurge-outs'));
  if (CUT.seat) v.append(h('p', {class: 'psurge-small', text: `+15%를 넘었지만 아직 못 든 곳도 ${CUT.seat}곳 있어요. 자리가 찼거나 다음 업데이트에서 한 번 더 봐요. 이름은 싣지 않아요.`}));
  // ⑤ 더 확인할 곳 → 며칠 뒤 어떻게 됐나
  svSee(v, S);
  svTrack(v, 'sv', ok, K, back);
  v.append(more('어떻게 골랐나요?', (S.rules?.lines ?? []).map(t => h('p', {text: fourText(t, NX.D.sum)})), 'psurge-how'));
  v.append(foot(C, isDay(S.window?.[0]) && isDay(S.asOf) ? `급등 목록은 ${md(S.window[0])} 종가와 ${md(S.asOf)} 값을 견줘 셌어요` : null));
  return `급등 ${n}곳`;
}
/* ── 네 칸(10%대 · 20%대 · 30%대 · 40% 이상 — sb-v1 · 옛 svBand) — 급등 칸과 같은 차례 · 숫자는 surge.json bands 그대로 ── */
function svBand(v, S, b, ok, K, C, back) {
  const BS = S.bands, B = BS?.[b], name = SV_NAME[b];
  if (!B || BS.version !== 'sb-v1') { v.append(h('h1', {class: 'psurge-h', text: name}), h('p', {class: 'q', text: '? 이 칸 자료가 아직 없어요. 다음 업데이트에 들어가요.'})); svCal(v, b, ok, K, back); svTrack(v, b, ok, K, back); v.append(foot(C)); return name; }
  const M = B.members ?? [], n = M.length, cut = (BS.cuts ?? []).find(x => x[0] === b) ?? [b, null, null], lo = cut[1], hi = cut[2], range = hi == null ? `${lo}%${NB}이상` : `${lo}%에서 ${hi}% 사이`;
  const BD = {M, lo, hi, kind: BS.kind, name};
  svHead(v, `${name} ${n}곳`, S);
  v.append(h('p', {class: 'psurge-lead', text: n ? `지난 5일 동안 ${range} 올랐어요.` : `지난 5일 동안 ${range} 오른 곳이 없어요.`}));
  v.append(chartBox(S, BD), legend(name, n, BS.kind === 'pick' && M.some(m => m.tag === 'new'), S), svJump());
  honest(v, S, C);
  if (B.over) v.append(h('p', {class: 'psurge-note', text: `이 칸에 든 곳이 많아 많이 오른 차례로 ${BS.cap}곳만 실었어요. 나머지 ${B.over}곳은 싣지 않아요.`}));
  // 들고 남 — 새로 든 곳 · 옮겨 온 곳(다른 칸에서) · 빠진 곳(까닭) · 옮겨 간 곳(다른 칸으로)
  const ins = B.in ?? [], outs = B.out ?? [], mIn = (B.move ?? []).filter(x => x.to === b), mOut = (B.move ?? []).filter(x => x.from === b);
  const said = [ins.length ? `${ins.length}곳이 새로 들었어요.` : null, mIn.length ? `${mIn.length}곳이 다른 칸에서 옮겨 왔어요.` : null, outs.length ? `${outs.length}곳이 빠졌어요.` : null, mOut.length ? `${mOut.length}곳이 다른 칸으로 옮겨 갔어요.` : null].filter(Boolean);
  v.append(h('p', {class: 'psurge-chg', text: S.carry ? `목록은 ${kstLabel(S.carry.fromKst)}에 고른 그대로예요.` : BS.kind !== 'pick' ? '처음 고른 목록이에요.' : said.length ? said.join(' ') : '이번에 바뀐 곳은 없어요.'}));
  if (BS.kind === 'pick' && !S.carry) { // 든 곳 · 옮겨 온 곳 이름은 바로 밑 달력(오늘) 판에 — 두 번 싣지 않음 · 빠진 까닭은 여기만
    if (outs.length) v.append(more(`빠진 곳 ${outs.length}곳 — 까닭 보기`, outs.map(o => svRow(o, true)), 'psurge-outs'));
    if (mOut.length) v.append(more(`다른 칸으로 옮겨 간 곳 ${mOut.length}곳 — 어디로 갔나 보기`, mOut.map(o => svRow({c: o.c, n: o.n, r5: o.r5, why: `${SV_TO[o.to]} 옮겼어요`}, true)), 'psurge-outs'));
  }
  svCal(v, b, ok, K, back);
  // ② 견줌 — 칸 안 가장 많이 · 가장 적게 오른 곳(줄 값 그대로) · 셀 수 있는 회사 가운데값
  v.append(sec('다른 곳과 견주면?'));
  const trio = h('div', {class: 'psurge-trio'}, h('div', {}, h('span', {text: '이 칸에서 가장 많이 오른 곳'}), n ? pctEl(M[0].r5) : qEl()), h('div', {}, h('span', {text: '이 칸에서 가장 적게 오른 곳'}), n ? pctEl(M.at(-1).r5) : qEl()), h('div', {}, h('span', {text: '셀 수 있는 회사 가운데값'}), pctEl(S.market?.med)));
  v.append(trio); fitNums(trio);
  // ③ 어떤 곳들인가요?
  v.append(sec('어떤 곳들인가요?'));
  if (n) {
    const mk = [['KOSDAQ', '코스닥'], ['KOSPI', '코스피']].map(([k, nm]) => [nm, M.filter(m => m.mk === k).length]).filter(x => x[1]);
    if (mk.length) v.append(h('p', {class: 'psurge-small', text: mk.map(([nm, c]) => `${nm} ${c}곳`).join(' · ')}));
    v.append(board(boardItems(M, S.provisional, BS.kind === 'pick'), S.market?.avg6 ? {v: S.market.avg6} : null, `${name} ${n}곳 — 5일 동안 많이 오른 차례`), boardKey(S));
  } else v.append(h('p', {class: 'psurge-small', text: '이 칸에 든 곳이 없어요.'}));
  // ④ 조심할 것과 모르는 것
  v.append(sec('조심할 것과 모르는 것'));
  const downN = M.filter(m => m.d1 != null && m.d1 < 0), chk = h('ul', {class: 'psurge-chk'});
  if (downN.length) chk.append(svLi('!', `마지막 날 내린 곳 ${downN.length}곳`, '— 5일로는 올랐지만 마지막 날은 내렸어요.', downN.map(m => m.n)));
  chk.append(svLi('?', '오른 까닭', '— 몰라요. 뉴스와 공시를 못 봐요.'), svLi('?', '거래소 경고 · 거래정지', '— 여기서는 확인 못 해요.'), svLi('?', '공매도 · 빚내서 산 돈 · 주식 수 바뀜', '— 못 봐요.'));
  v.append(chk);
  svSee(v, S);
  svTrack(v, b, ok, K, back);
  v.append(more('어떻게 골랐나요?', [
    '5일 오름 = 마지막 값 ÷ 5일 전 종가예요. 5일은 장이 열린 날로 세요.',
    '칸은 10%대 · 20%대 · 30%대 · 40% 이상 넷이에요. 칸끼리 겹치지 않아요. 10%대는 10% 이상 20% 밑이에요.',
    '값이 빈 날 · 거래가 없던 날 · 하루 35% 넘게 바뀐 날이 있거나, 새로 상장했거나, 석 달 안에 오래 멈췄던 곳은 빼요. 평소 하루 거래가 1억 원이 안 되는 곳도 빼요.',
    `칸마다 많이 오른 차례로 ${BS.cap}곳까지 실어요. 채우려고 문턱을 낮추지 않아요.`,
    (NX.D.sum?.fourADay === true ? '하루 4번 업데이트' : '정해진 업데이트') + ' 때 다시 세요. 다른 칸으로 간 곳은 「옮김」으로 적어요. 다른 셈으로 한 번 더 세어 같을 때만 올려요.', // 「하루 4번」은 요약의 fourADay 일 때만([5] 4 · 일꾼 KC)
    '급등 칸과 따로 세요. 급등 칸은 들어오는 문 · 나가는 문이 따로 있어서, 한 회사가 급등 칸과 이 칸에서 다르게 보일 수 있어요.',
    '센 것일 뿐 다음 날을 말하지 않아요.'].map(t => h('p', {text: t})), 'psurge-how'));
  v.append(foot(C, isDay(S.window?.[0]) && isDay(S.asOf) ? `${name} 목록은 ${md(S.window[0])} 종가와 ${md(S.asOf)} 값을 견줘 셌어요` : null));
  return `${name} ${n}곳`;
}

/** 쪽 그리기 — arg = '' (급등) · '10' · '20' · '30' · '40' · 그 밖은 없는 주소(옛 viewMissing) */
export async function render(arg) {
  const a = arg == null ? '' : String(arg), tab = !a ? 'sv' : /^(10|20|30|40)$/.test(a) ? 'b' + a : null;
  const v = h('section', {class: 'psurge', 'aria-label': '급등 다섯 칸'});
  if (!tab) {
    const C = await NX.need('core');
    v.append(h('h1', {class: 'psurge-h', text: '없는 주소입니다'}), h('p', {class: 'psurge-when', text: '주소가 바뀌었거나 잘못 들어왔습니다.'}), h('p', {}, h('a', {class: 'psurge-btn', href: '#/', text: '처음 화면으로'})), foot(C));
    return {title: '없는 주소', nodes: [v]};
  }
  const [S, C, K] = await Promise.all([NX.need('surge'), NX.need('core'), NX.getJson('surgecal.json'), NX.need('sum')]); // 달력 · 따라가기는 못 받아도 목록은 보임(그 칸만 「?」) · sum = 「하루 4번」 글을 첫 화면과 같게(fourADay · 일꾼 KC)
  v.append(svChips(tab));
  if (!S) { v.append(...NX.noData('급등 자료')); return {title: '급등', nodes: [v]}; }
  const back = /^#\/(w|c)\//.test(cameFrom() || ''); // 회사를 보고 돌아온 길
  const title = tab === 'sv' ? svMain(v, S, !!K, K, C, back) : svBand(v, S, tab, !!K, K, C, back);
  return {title: String(title).replace(/[\u2060\u00a0]/g, m => (m === '\u00a0' ? ' ' : '')), nodes: [v]};
}
