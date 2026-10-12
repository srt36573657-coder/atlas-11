// 새 ATLAS(aaa7377.com/atlas/) — 사장님 2026-10-11 06:13 「잡스 방식이 중심이 되고 구글팀 클로드팀 cai팀 그리고 찰리 망거팀 삼성팀 들이 도와서
//   일반인들이 바로 알수 있고 쉽게 사용가능하며 별도에 설명이 없어도 감탄이 니오게 새로운 아틀란스를 만들어 봐라 이 토대로 말이다」
// 잡스팀: 화면마다 질문 하나 · 같은 경주 그림으로 세 번 내려감(갈래 → 업종 → 회사) · 첫 화면 지난 20거래일 경주(약 6초 · 한 번 · 누르면 끝으로)
// 사장님 2026-10-11 09:37 「기준일을 항상 현재 날짜에서 지난 20일 거래로 하라 … 항상 그렇게 하라」 — 기준일 = 마지막 종가 날의 20거래일 전(자료 core.base · core.days 를 읽음 · 날짜를 박지 않음)
// 구글팀: 찾기 칸을 늘 위에 · 한 글자 · 첫 글자(ㅅㅅㅈㅈ) · 영어 이름 소리(에스케이) · 365곳 밖이면 깔때기로 까닭
// 클로드팀: 회사 1곳뿐인 업종 표시 · 고른 날 세로선 · 남의 짐작은 꼬리표 · 모르는 것은 「?」
// CIA팀: 숫자 밑 「출처 · 때」 · 다르게 보면(큰 회사는 크게) · 확인할 것
// 멍거팀: 오른 % 옆에 같은 크기로 가장 깊이 빠짐 · 반값을 견딜 수 있나요 · 사기 전에 볼 것(기록만)
// 삼성팀: 360px 한 화면 · 아래 탭 · 뒤로 = 앞 화면(주소 #) · 늘 밤 화면 · 움직임은 위치 · 크기만
// 숫자는 자료(site_build.py)가 소수 둘째 자리까지 셈 · 화면은 한 가지 반올림(r1 · 반은 위로)으로만 보임
const $ = (s, el = document) => el.querySelector(s);
const NS = 'http://www.w3.org/2000/svg';
const RM = matchMedia('(prefers-reduced-motion: reduce)');
const D = {core: null, comp: null, lines: null, names: null};
const state = {mode: 'eq', played: false, font: 0};

// ── 숫자 · 말 ──
const r1 = x => Math.floor(x * 10 + 0.5 + 1e-7) / 10;
function pct(x) { if (x == null || !isFinite(x)) return '?'; const v = r1(x), a = Math.abs(v); return (v > 0 ? '+' : v < 0 ? '−' : '') + (a >= 100 ? Math.floor(a + 0.5 + 1e-7).toLocaleString('ko-KR') : a.toFixed(1)) + '%'; }  // 100% 넘으면 소수 없이(+215%)
const cls = x => (x == null ? 'flat' : r1(x) > 0 ? 'up' : r1(x) < 0 ? 'down' : 'flat');
function md(d) { const p = String(d).split('-'); return (+p[1]) + '월\u00a0' + (+p[2]) + '일'; } // 붙임 띄어쓰기 — 「10월 / 8일」로 갈라지지 않게(애플팀 2026-10-12)
const ymd = d => String(d).slice(0, 4) + '년 ' + md(d);
function eok(v) { if (v == null) return '?'; const s = v < 0 ? '−' : '', a = Math.abs(v); if (a >= 10000) return s + r1(a / 10000).toLocaleString('ko-KR', {maximumFractionDigits: 1}) + '조 원'; return s + Math.round(a).toLocaleString('ko-KR') + '억 원'; }
/** 조사 — 받침 있으면 앞말(은 · 이 · 과) · 없으면 뒷말(는 · 가 · 와) · 한글이 아니면 둘 다 */
function josa(w, a, b) { const ch = String(w).trim().slice(-1), k = ch.charCodeAt(0) - 0xAC00; if (k < 0 || k > 11171) return w + a + '(' + b + ')'; return w + (k % 28 ? a : b); }
const won = v => (v == null ? '?' : Math.round(v).toLocaleString('ko-KR') + '원');
function fy(p) { if (!p) return '?'; const [y, m] = p.replace('E', '').split('.'); return y + '년' + (m && m !== '12' ? '(' + (+m) + '월 결산)' : ''); }
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[c]));
function h(tag, attrs = {}, ...kids) { const e = document.createElement(tag); for (const [k, v] of Object.entries(attrs)) { if (v == null || v === false) continue; if (k === 'class') e.className = v; else if (k === 'text') e.textContent = v; else if (k === 'html') e.innerHTML = v; else e.setAttribute(k, v === true ? '' : v); } for (const k of kids.flat()) if (k != null) e.append(k.nodeType ? k : document.createTextNode(k)); return e; }
function sv(tag, attrs = {}) { const e = document.createElementNS(NS, tag); for (const [k, v] of Object.entries(attrs)) if (v != null) e.setAttribute(k, v); return e; }
const pctEl = (x, tag = 'b') => h(tag, {class: 'num ' + cls(x), text: pct(x)});
/** 두 값이 한 자리로 같아 보이면 둘째 자리까지(+3.46% · +3.54% — 「같은데 못했다」로 헷갈리지 않게) */
const pct2El = (x, y) => { if (x == null || y == null || pct(x) !== pct(y) || Math.abs(x) >= 100) return pctEl(x); const v = Math.round(x * 100) / 100; return h('b', {class: 'num ' + cls(x), text: (v > 0 ? '+' : v < 0 ? '−' : '') + Math.abs(v).toFixed(2) + '%'}); };
// 그림 색은 atlas.css 의 색 이름(토큰)에서 읽음(구글팀 2026-10-11 13:29 「고급스럽게」: 색 이름은 한 곳) — 못 읽으면 같은 값
const TOK0 = {up: '#F0506E', down: '#6EA0FF', gold: '#E9C46A', ink: '#EEF6F2', night: '#0C2824', mute: '#9BB6AC', violet: '#6CC7A8', 'violet-ink': '#9FE0C8'}; // 청자 밤(2026-10-12 10:53)
function tok() { const s = getComputedStyle(document.documentElement), o = {}; for (const k of Object.keys(TOK0)) o[k] = s.getPropertyValue('--' + k).trim() || TOK0[k]; return o; }
/** 숫자 카드 — 긴 숫자(+2,920%)가 카드 밖으로 넘치면 한 단 작게(애플팀: 넘치거나 잘리지 않게 · 숫자는 그대로) */
function fitNums(box) { const go = () => { for (const b of box.querySelectorAll('b')) { b.classList.remove('fit'); if (b.scrollWidth > b.clientWidth + 1) b.classList.add('fit'); } }; go(); document.fonts?.ready.then(() => { if (box.isConnected) go(); }); }
/** 선 아래 · 위 면(기준선까지 닫은 길) — 값이 빈 날은 끊음 */
function areaPath(arr, X, Y, by) { let d = '', seg = []; const flush = () => { if (seg.length) d += 'M' + X(seg[0]).toFixed(1) + ' ' + by.toFixed(1) + seg.map(i => 'L' + X(i).toFixed(1) + ' ' + Y(arr[i]).toFixed(1)).join('') + 'L' + X(seg[seg.length - 1]).toFixed(1) + ' ' + by.toFixed(1) + 'Z'; seg = []; }; arr.forEach((y, i) => { if (y == null) flush(); else seg.push(i); }); flush(); return d; }
/** 기준선 위 빨강 · 아래 파랑 옅은 면(판판한 번짐 — 입체 아님) */
function fadeDefs(defs, id, T, P, H, by) {
  const gu = sv('linearGradient', {id: id + 'gu', gradientUnits: 'userSpaceOnUse', x1: 0, y1: P, x2: 0, y2: by}); gu.append(sv('stop', {offset: 0, 'stop-color': T.up, 'stop-opacity': 0.26}), sv('stop', {offset: 1, 'stop-color': T.up, 'stop-opacity': 0.02}));
  const gd = sv('linearGradient', {id: id + 'gd', gradientUnits: 'userSpaceOnUse', x1: 0, y1: by, x2: 0, y2: H - P}); gd.append(sv('stop', {offset: 0, 'stop-color': T.down, 'stop-opacity': 0.02}), sv('stop', {offset: 1, 'stop-color': T.down, 'stop-opacity': 0.26}));
  defs.append(gu, gd);
}
const hairs = (svg, W, P, ys) => { const ink = tok().ink; for (const y of ys) svg.append(sv('line', {x1: P, x2: W - P, y1: y, y2: y, stroke: ink, 'stroke-opacity': 0.12, 'stroke-width': 1})); }; // 가는 눈금선 — 글 색(먹 · 흰빛)을 따라 옅게(2026-10-12 모래 달항아리 · 청자 밤)
const gById = id => D.core.groups.find(g => g.id === id);
const ind = name => D.core.industries.find(i => i.name === name);
const series = (node, mode = state.mode) => (mode === 'cw' ? node.cw : node.v);
const chgOf = (node, mode = state.mode) => (mode === 'cw' ? node.cwChg : node.chg);

// ── 자료 받기 ──
async function getJson(name) { const r = await fetch('/atlas/data/' + name, {cache: 'no-cache'}); if (!r.ok) throw Error(name + ' ' + r.status); return r.json(); }
let compP = null, namesP = null, pickP = null, daysP = null, updP = null; const coP = new Map();
function needDays() { if (!daysP) daysP = getJson('days.json').then(d => { D.days = d; }).catch(e => { daysP = null; throw e; }); return daysP; }
function needCo(code) { if (!coP.has(code)) coP.set(code, getJson('co/' + encodeURIComponent(code) + '.json').catch(e => { coP.delete(code); throw e; })); return coP.get(code); }
function needPick() { if (!pickP) pickP = getJson('pick36.json').then(p => { D.pick = p; }).catch(e => { pickP = null; throw e; }); return pickP; }
function needComp() { if (!compP) compP = Promise.all([getJson('comp.json'), getJson('lines.json')]).then(([c, l]) => { D.comp = c.companies; D.lines = l.lines; }).catch(e => { compP = null; throw e; }); return compP; }
// grow.json(회사 성장 요약)은 화면에서 읽지 않음 — 7단부터 회사마다 co/<번호>.json 의 grow 를 씀(자료 따로 세기 · 올린 뒤 확인에는 남음)
function needUpd() { if (!updP) updP = getJson('updates.json').then(u => { D.upd = u; }).catch(e => { updP = null; throw e; }); return updP; }
function needNames() { if (!namesP) namesP = getJson('names.json').then(n => { D.names = n; prepNames(); }).catch(e => { namesP = null; throw e; }); return namesP; }

// ── 경주판(잡스팀) — 줄 하나 = 갈래 · 업종 · 회사 하나 · 가운데 = 기준일(20거래일 전)과 같음 ──
//   items: [{key, name, href, v:[21], cw:[21], badge}] · parent: {v, cw}(흰 점선) · wide: 이름이 긴 줄(두 줄 모양)
function race(host, {items, parent, wide = false, label, onTick, onDone, auto = false}) {
  const C = D.core, n = C.dates.length;
  const board = h('div', {class: 'board' + (wide ? ' wide' : ''), role: 'group', 'aria-label': label}); // 줄은 링크 그대로(구글팀 2026-10-12: role=listitem 이 링크를 가렸음)
  const scale = arrs => Math.max(5, Math.ceil(Math.max(0, ...arrs.flat().filter(x => x != null).map(x => Math.abs(x - 100))) * 1.06));
  const Meq = scale(items.map(it => it.v).concat(parent ? [parent.v] : [])), Mcw = scale(items.map(it => it.cw || it.v).concat(parent ? [parent.cw] : []));
  let M = state.mode === 'cw' ? Mcw : Meq;
  const rows = items.map(it => {
    const pos = h('i', {class: 'bar pos'}), neg = h('i', {class: 'bar neg'}), avg = parent ? h('i', {class: 'avg'}) : null;
    const val = h('b', {class: 'val num'}), nm = h('span', {class: 'nm'}, it.name, it.badge ? h('span', {class: 'badge', text: it.badge}) : null);
    const trd = it.tr ? trEl(state.mode === 'cw' && it.trc ? it.trc : it.tr) : null;
    const row = h('a', {class: 'row' + (trd ? ' two' : ''), href: it.href}, nm, h('span', {class: 'track', 'aria-hidden': 'true'}, h('i', {class: 'zero'}), neg, pos, avg), val, trd, h('span', {class: 'chev', 'aria-hidden': 'true', text: '›'}));
    board.append(row);
    return {it, row, pos, neg, avg, val, trd, rank: -1, cur: 100};
  });
  host.append(board);
  const rowH = rows.length ? rows[0].row.getBoundingClientRect().height + (wide ? 4 : 0) : 0;
  board.style.height = (rows.length * rowH) + 'px';
  const at = (arr, k) => { const a = Math.floor(k), b = Math.min(n - 1, a + 1), f = k - a; const x = arr[a], y = arr[b]; if (x == null) return y; if (y == null) return x; return x + (y - x) * f; };
  let mode = state.mode;
  function paint(k, settle) {
    for (const r of rows) {
      const v = at(mode === 'cw' && r.it.cw ? r.it.cw : r.it.v, k); r.cur = v;
      const d = v == null ? null : v - 100, s = d == null ? 0 : Math.min(1, Math.abs(d) / M);  // 값이 없는 날(거래정지 · 새 값 못 받음)은 「?」 · 막대 없음
      r.pos.style.transform = 'scaleX(' + (d > 0 ? s : 0) + ')'; r.neg.style.transform = 'scaleX(' + (d < 0 ? s : 0) + ')';
      r.val.textContent = pct(d); r.val.className = 'val num ' + cls(d);
      if (r.avg) { const p = at(mode === 'cw' ? parent.cw : parent.v, k) - 100; r.avg.style.left = (50 + Math.max(-1, Math.min(1, p / M)) * 50) + '%'; }
    }
    const order = rows.slice().sort((a, b) => (b.cur ?? -Infinity) - (a.cur ?? -Infinity) || 0);
    order.forEach((r, i) => { if (r.rank !== i || settle) { r.rank = i; r.row.style.transform = 'translateY(' + (i * rowH) + 'px)'; } });
    return order;
  }
  let raf = 0, playing = false, done = null, reo = 0;
  function finish() {
    cancelAnimationFrame(raf); playing = false; board.classList.remove('playing');
    const order = paint(n - 1, true);
    rows.forEach(r => r.row.classList.remove('win'));
    if (order[0]) { void order[0].row.offsetWidth; order[0].row.classList.add('win'); }
    clearTimeout(reo); reo = setTimeout(() => { if (!playing && board.isConnected) order.forEach(r => board.append(r.row)); }, 700); // 누름(Tab) 차례 = 보이는 차례(구글팀) — 움직임이 끝난 뒤에 줄을 다시 꽂음
    if (done) { const f = done; done = null; f(order); }
    if (onDone) onDone(order);
  }
  function play() {
    if (RM.matches || n < 2) { finish(); return; }
    cancelAnimationFrame(raf); playing = true; board.classList.add('playing'); rows.forEach(r => r.row.classList.remove('win'));
    const per = Math.max(80, Math.round(4800 / Math.max(1, n - 1))), hold = 800, lowK = parent ? parent.v.indexOf(Math.min(...parent.v)) : -1;
    let t0 = performance.now(), held = false;
    paint(0, true);
    const step = now => {
      let el = now - t0, k = el / per;
      if (lowK > 0 && k >= lowK && !held) { if (el < lowK * per + hold) { k = lowK; if (onTick) onTick(lowK, true, rows); raf = requestAnimationFrame(step); paint(k); return; } held = true; t0 += hold; el -= hold; k = el / per; }
      if (k >= n - 1) { finish(); return; }
      paint(k); if (onTick) onTick(Math.round(k), false, rows);
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
  }
  // 경주 중 누르면 끝으로(잡스팀) — 그 누름은 회사로 넘어가지 않음
  board.addEventListener('click', e => { if (playing) { e.preventDefault(); finish(); } }, true);
  finish();
  if (auto) play();
  return {
    play, finish,
    setMode(m) { mode = m; M = m === 'cw' ? Mcw : Meq; for (const r of rows) if (r.trd) trFill(r.trd, m === 'cw' && r.it.trc ? r.it.trc : r.it.tr); board.classList.add('smooth'); finish(); setTimeout(() => board.classList.remove('smooth'), 600); },
    stop() { cancelAnimationFrame(raf); playing = false; },
  };
}

// ── 20거래일 선(회사 화면 그림 한 장) — 기준일 위 빨강 · 아래 파랑 · 연보라 점선 = 업종 평균 · 금빛 세로선 = 고른 날(창 안에 있을 때만) ──
let lcN = 0;
function lineChart(host, {v, avg, label}) {
  const C = D.core, n = C.dates.length, kPick = C.kPick;
  host.textContent = '';
  const wrap = h('div', {class: 'lc'});
  host.append(wrap);
  const W = Math.max(260, Math.round(wrap.getBoundingClientRect().width || 320)), H = 210, P = 10;
  const vals = [...v, ...(avg || []), 100].filter(x => x != null);
  if (!v.some(x => x != null)) { wrap.append(h('p', {class: 'q', text: `? 이 회사 ${C.days}거래일 값을 못 읽었습니다`})); return; }
  let lo = Math.min(...vals), hi = Math.max(...vals); const pad = (hi - lo) * 0.06 || 2; lo -= pad; hi += pad;
  const X = i => P + i * (W - 2 * P) / (n - 1), Y = y => P + (hi - y) * (H - 2 * P) / (hi - lo);
  const id = 'lc' + (++lcN), T = tok();
  const svg = sv('svg', {viewBox: `0 0 ${W} ${H}`, width: W, height: H, role: 'img', 'aria-label': label});
  const defs = sv('defs');
  const cu = sv('clipPath', {id: id + 'u'}); cu.append(sv('rect', {x: 0, y: 0, width: W, height: Y(100)}));
  const cd = sv('clipPath', {id: id + 'd'}); cd.append(sv('rect', {x: 0, y: Y(100), width: W, height: H - Y(100)}));
  defs.append(cu, cd); fadeDefs(defs, id, T, P, H, Y(100)); svg.append(defs);
  hairs(svg, W, P, [P, H - P]); // 가로 가는 선 = 위 · 아래 끝(왼쪽 숫자 자리)
  const ad = areaPath(v, X, Y, Y(100));
  svg.append(sv('path', {d: ad, fill: `url(#${id}gu)`, 'clip-path': `url(#${id}u)`}), sv('path', {d: ad, fill: `url(#${id}gd)`, 'clip-path': `url(#${id}d)`}));
  svg.append(sv('line', {x1: P, x2: W - P, y1: Y(100), y2: Y(100), stroke: T.mute, 'stroke-width': 1}));
  if (kPick != null) svg.append(sv('line', {x1: X(kPick), x2: X(kPick), y1: P - 4, y2: H - P + 4, stroke: T.gold, 'stroke-width': 2}));
  const path = arr => { let d = '', on = false; arr.forEach((y, i) => { if (y == null) { on = false; return; } d += (on ? 'L' : 'M') + X(i).toFixed(1) + ' ' + Y(y).toFixed(1); on = true; }); return d; };
  if (avg) svg.append(sv('path', {d: path(avg), fill: 'none', stroke: T['violet-ink'], 'stroke-width': 3, 'stroke-dasharray': '0.1 6', 'stroke-linecap': 'round'}));
  const d = path(v);
  svg.append(sv('path', {d, fill: 'none', stroke: T.up, 'stroke-width': 2.5, 'stroke-linejoin': 'round', 'stroke-linecap': 'round', 'clip-path': `url(#${id}u)`}));
  svg.append(sv('path', {d, fill: 'none', stroke: T.down, 'stroke-width': 2.5, 'stroke-linejoin': 'round', 'stroke-linecap': 'round', 'clip-path': `url(#${id}d)`}));
  const lastK = v.map((x, i) => (x == null ? -1 : i)).filter(i => i >= 0).pop();
  svg.append(sv('circle', {cx: X(lastK), cy: Y(v[lastK]), r: 5.5, fill: v[lastK] >= 100 ? T.up : T.down, stroke: T.night, 'stroke-width': 2.5}));
  const cx = sv('line', {y1: P, y2: H - P, stroke: T.ink, 'stroke-opacity': 0.6, 'stroke-width': 1}), dot = sv('circle', {r: 5.5, fill: T.ink, stroke: T.night, 'stroke-width': 2});
  cx.setAttribute('visibility', 'hidden'); dot.setAttribute('visibility', 'hidden'); svg.append(cx, dot);
  wrap.append(svg);
  const yt = h('span', {class: 'yl num', text: Math.round(hi)}), yb = h('span', {class: 'yl num', text: Math.round(lo)});
  yt.style.top = '0'; yb.style.top = (H - 30) + 'px'; wrap.append(yt, yb);
  const tip = h('div', {class: 'tip num'}); tip.hidden = true; wrap.append(tip);
  if (kPick != null) { const pick = h('span', {class: 'yl', text: '고른 날'}); pick.style.top = '0'; pick.style.left = Math.min(W - 80, Math.max(0, X(kPick) - 74)) + 'px'; wrap.append(pick); }
  wrap.append(h('div', {class: 'ax'}, h('span', {text: md(C.dates[0]) + ' = 100'}), h('span', {text: md(C.dates[n - 1])})));
  const mv = e => { const r = svg.getBoundingClientRect(), x = (e.clientX - r.left) * W / r.width; let i = Math.round((x - P) / ((W - 2 * P) / (n - 1))); i = Math.max(0, Math.min(n - 1, i)); if (v[i] == null) return;
    cx.setAttribute('x1', X(i)); cx.setAttribute('x2', X(i)); cx.setAttribute('visibility', 'visible'); dot.setAttribute('cx', X(i)); dot.setAttribute('cy', Y(v[i])); dot.setAttribute('visibility', 'visible');
    tip.hidden = false; tip.textContent = md(C.dates[i]) + ' · ' + pct(v[i] - 100); tip.style.left = Math.min(W - 80, Math.max(80, X(i) * r.width / W)) + 'px'; };
  const lv = () => { cx.setAttribute('visibility', 'hidden'); dot.setAttribute('visibility', 'hidden'); tip.hidden = true; };
  svg.addEventListener('pointermove', mv); svg.addEventListener('pointerdown', mv); svg.addEventListener('pointerleave', lv);
}

// ── 공통 조각 ──
function foot() {
  const C = D.core;
  return h('footer', {class: 'foot'}, footFriends(),
    h('p', {class: 'links'}, h('a', {href: '/hello.html', text: '친구에게 소개하기'}), h('a', {href: '/old/', text: '옛 ATLAS'}), h('a', {href: '/us/', text: '미국 판'})),
    h('p', {text: `자료: ${C.sources.price} · 기준일 = 마지막 종가 날(${md(C.asOf)})의 ${C.days}거래일 전(${md(C.base)}) · 365곳은 ${md(C.pickAsOf)} 종가까지 보고 고름.`}),
    C.provisional ? h('p', {class: 'q', text: `? ${md(C.asOf)} 값은 그날 저녁 8시 전에 받아 아직 바뀔 수 있습니다(시간외 · 넥스트레이드) — 다음 받기에서 고쳐집니다.`}) : null,
    h('p', {text: '저는 투자 상담사가 아닙니다 · 이 자료는 지난 기록을 센 공부이며, 특정 종목의 매수 · 매도 · 보유 또는 시장 전망을 권하지 않습니다.'}));
}
function seg(onPick) {
  const a = h('button', {type: 'button', 'aria-pressed': String(state.mode === 'eq'), text: '한 회사 한 표'});
  const b = h('button', {type: 'button', 'aria-pressed': String(state.mode === 'cw'), text: '큰 회사는 크게'});
  const box = h('div', {class: 'seg', role: 'group', 'aria-label': '평균 내는 법 바꾸기'}, a, b);
  const set = m => { state.mode = m; a.setAttribute('aria-pressed', String(m === 'eq')); b.setAttribute('aria-pressed', String(m === 'cw')); onPick(m); };
  a.addEventListener('click', () => set('eq')); b.addEventListener('click', () => set('cw'));
  return box;
}
function tellRow(text, onPlay) {
  const t = h('span', {class: 't', text});
  const play = onPlay ? h('button', {class: 'ibtn', type: 'button', 'aria-label': '경주 다시 보기', title: '다시 보기'}, svgPlay()) : null;
  if (play) play.addEventListener('click', onPlay);
  const say = h('button', {class: 'ibtn', type: 'button', 'aria-label': '이 화면 소리로 듣기', text: '♪'});
  say.addEventListener('click', speak);
  return {el: h('div', {class: 'tell'}, t, h('span', {class: 'tell-b'}, play, ' ', say)), t};
}
function svgPlay() { const s = sv('svg', {width: 14, height: 14, viewBox: '0 0 14 14', 'aria-hidden': 'true'}); s.append(sv('path', {d: 'M3 1.5 L12 7 L3 12.5 Z', fill: 'currentColor'})); return s; }
function legend(parentName) {
  return h('p', {class: 'key'}, h('span', {}, h('i', {class: 'k-up'}), '오름'), h('span', {}, h('i', {class: 'k-dn'}), '내림'), h('span', {}, h('i', {class: 'k-avg'}), parentName + ' 평균'), h('span', {text: '가운데 = 기준일(' + md(D.core.base) + ')과 같음'}));
}
function crumbs(...parts) { const c = h('nav', {class: 'crumb', 'aria-label': '지금 자리'}); parts.forEach((p, i) => { if (i) c.append(h('i', {text: '›', 'aria-hidden': 'true'})); c.append(p.href ? h('a', {href: p.href, text: p.text}) : h('span', {text: p.text})); }); return c; }
const hrefInd = i => (i.n === 1 ? '#/c/' + i.members[0] : '#/i/' + encodeURIComponent(i.name));
// 7단(사장님 2026-10-12 00:50 「지금 5단계 클릭이잖아 7단계로 한다」 · 네 팀 — 구글 · 애플 · 클로드 · CIA): 4단 갈림길(지나온 길 · 앞으로 클까?)을 한 줄로 폄 ·
//   「앞으로 클까?」 한 화면에 몰린 경쟁 회사를 5단으로 떼어 냄 · 끝은 「사기」가 아니라 「확인」 · 단마다 앎의 종류(CIA팀 — 기록 · 조사 · 판단 · 셈)
const LV = ['갈래', '업종', '회사', '지나온 길', '누구와 다투나', '앞으로 클까?', '범위 · 확인'];
const LK = ['기록', '기록', '기록', '기록', '조사', '판단', '셈'];
/** 기간 안 방향 · 세기 · 힘(사장님 11:04 「업종이 기간내에 오르고 있는지 내리고 있는지 그 강도」 · 11:10 「이 화면에서 나와야 해」) — 셈은 site_build.py trend() */
const TR_WORD = {up: '오름', down: '내림', flat: '옆걸음'};
function trText(t) { if (!t) return ''; return (t.d === 'up' ? '▲ ' : t.d === 'down' ? '▼ ' : '▶ ') + (t.s === 'strong' ? '강하게 ' : '') + TR_WORD[t.d] + (t.t === 'gain' ? ' · 힘 붙음' : t.t === 'fade' ? ' · 힘 빠짐' : ''); }
function trFill(el, t) {
  el.className = el.className.replace(/\b(up|down|flat)\b/g, '').trim() + ' ' + (t?.d ?? 'flat');
  if (!t) { el.textContent = ''; return el; }
  const words = trText(t), cut = words.indexOf(' · ');
  el.replaceChildren(h('span', {class: 'tdw', text: cut < 0 ? words : words.slice(0, cut)}), cut < 0 ? '' : h('span', {class: 'tt', text: words.slice(cut)}));
  el.setAttribute('aria-label', `이 기간 ${words.replace(/[▲▼▶] /, '')}`);
  return el;
}
const trEl = (t, cls = 'trd') => trFill(h('span', {class: cls}), t);
/** 7단 표시 — hrefs[k] = k+1단으로 가는 길(지나온 단 · 바로 다음 단만) · 그 밖은 누르지 못함 */
function steps(now, hrefs = []) {
  const nm = LV[now - 1];
  const nav = h('nav', {class: 'steps', 'aria-label': `7단 가운데 ${now}단 — ${nm} · ${LK[now - 1]}`});
  const row = h('ol', {class: 'st'});
  LV.forEach((name, k) => {
    const n = k + 1, cls = n < now ? 'past' : n === now ? 'now' : 'next', inner = [h('b', {class: 'num', text: n}), h('span', {class: 'sr', text: `단 ${name}`})];
    row.append(h('li', {class: cls}, hrefs[k] && n !== now ? h('a', {href: hrefs[k], 'aria-label': `${n}단 ${name}로`}, ...inner) : h('span', {class: 'cell', 'aria-current': n === now ? 'step' : null}, ...inner)));
  });
  nav.append(row, h('p', {class: 'st-t'}, h('b', {text: `7단 중 ${now}단`}), ` · ${nm} `, h('span', {class: 'lk', text: '· ' + LK[now - 1]})));
  return nav;
}

// ── 화면 ① 한눈에 — 「지난 20거래일, 어느 쪽이 올랐나?」 ──
// ── 첫 화면 종합 정보(사장님 2026-10-12 14:54 「첫화면에 3개월 코스피 코스닥 지수 그래프 나와야 하고 365개 종목도 나와야 그리고 오늘 어떤 업종이 강했는지 약했는 각각 7가지 도 나와해고
//    수급도 나와야 하고 미국장 분위기도 나와야 즉 첫 페이지에서 종합정보가 있어야 해 … 애플 구글 cia 클로드라면 … 토론후 결정해서 만들어」) ──
//   네 팀을 서로 모르게 따로 돌려 합친 안(docs/design/new-atlas-2026-10-11.md 「첫 화면 종합 정보」):
//   카드 하나 = 이름표 → 한 문장 → 그림 하나 → 접힌 자세히(애플) · 때는 맨 위에 한 번 · 다를 때만 카드에(구글) · 지수는 3개월 전 = 100 으로 맞추지 않고 두 칸(같은 비율 폭) ·
//   업종은 회사 5곳 이상 · 오른 곳 수와 365곳 수를 함께 · 365곳의 치우침을 숫자로(CIA) · 「수급」 → 누가 사고팔았나 · 더 삼 / 더 팖 · VIX → 미국 불안 지수 · 한국 다음에 미국(클로드)
//   자료 = home.json(scripts/atlas11/t365/home_build.mjs · 회차마다) · 못 받은 조각은 「?」 · 앞날 · 사고팔기 말 없음(규칙 49) · 빨강 · 파랑은 오름 · 내림에만(수급 막대는 옥색 한 색)
let homeP = null;
function needHome() { if (!homeP) homeP = getJson('home.json').then(x => { D.home = x; }).catch(() => { D.home = null; homeP = null; }); return homeP; }
const mdw = d => { const x = new Date(d + 'T00:00:00Z'); return `${md(d)}(${DOW[x.getUTCDay()]})`; };
const numK = (v, k = 2) => (v == null ? '?' : Number(v).toLocaleString('ko-KR', {minimumFractionDigits: k, maximumFractionDigits: k}));
/** 억 원 → 「1조 7,507억 원」 */
const eokW = v => { if (v == null) return '?'; const a = Math.abs(Math.round(v)), jo = Math.floor(a / 10000), r = a % 10000; return (jo ? jo.toLocaleString('ko-KR') + '조' + (r ? ' ' : '') : '') + (r || !jo ? r.toLocaleString('ko-KR') + '억' : '') + ' 원'; };
const BW = (up, down) => { const n = up + down; if (!n) return '?'; const s = up / n; return s >= 0.65 ? '넓게 오른 날' : s <= 0.35 ? '넓게 내린 날' : '오른 곳 · 내린 곳이 섞인 날'; }; // 판독 규칙 mr-v1 과 같은 문턱
const staleNote = (H, k) => (H?.stale?.[k] ? h('p', {class: 'q', text: `? 이번에 못 받아 앞 회차(${H.stale[k]}) 값입니다.`}) : null);
const add = (v, ...xs) => v.append(...xs.filter(Boolean)); // 없는 조각(null)을 글 「null」로 붙이지 않게
/** 길이 · 자리는 CSSOM 으로(보안 규칙 CSP style-src 'self' — style 속성 글은 막힘) */
const st = (el, css) => { Object.assign(el.style, css); return el; };
/** 가운데 0 막대 한 줄(HTML) — 오름 · 내림 색(kind 'pm') 또는 옥색 한 색(kind 'one') */
function dbar(v, max, kind = 'pm') {
  const w = max ? Math.min(50, Math.abs(v ?? 0) / max * 50) : 0;
  return h('span', {class: 'dbar', 'aria-hidden': 'true'}, h('i', {class: 'z'}), v == null ? null : st(h('i', {class: 'f ' + (kind === 'one' ? 'one' : v > 0 ? 'up' : v < 0 ? 'down' : 'flat')}), {[v < 0 ? 'right' : 'left']: '50%', width: w.toFixed(1) + '%'}));
}
function homeHead(v, H) {
  const K = H?.idx?.KOSPI, Q = H?.idx?.KOSDAQ, day = H?.kst?.slice(0, 10), S = H?.s365, B = H?.sectors?.breadth;
  const when = K && K.date !== day ? mdw(K.date) : '오늘';
  v.append(h('h1', {class: 'head'}, K || Q ? [`${when} 코스피 `, pctEl(K?.day, 'span'), ' · 코스닥 ', pctEl(Q?.day, 'span')] : '오늘 시장 — ?'));
  v.append(h('p', {class: 'when'}, H ? `${mdw(day)} ${H.kst.slice(11, 16)} 받음 · ${H.live ? '장 중 — 값이 아직 바뀝니다' : '장 끝 값'}` : '? 첫 화면 종합 자료를 못 읽었습니다'));
  // 그림: 오른 곳 · 내린 곳 비율 막대 두 줄(시장 전체 · 365곳)
  const rows = [B ? ['시장 ' + B.n.toLocaleString('ko-KR') + '곳', B.up, B.flat, B.down] : null, S ? ['365곳', S.up, S.flat + S.none, S.down] : null].filter(Boolean);
  if (rows.length) {
    const box = h('div', {class: 'brd', role: 'img', 'aria-label': rows.map(r => `${r[0]} 가운데 ${r[1]}곳 오름 · ${r[3]}곳 내림`).join(' · ')});
    for (const [lab, up, flat, down] of rows) { const n = up + flat + down || 1;
      box.append(h('div', {class: 'brow'}, h('span', {class: 'bl', 'aria-hidden': 'true', text: lab}), h('span', {class: 'bb', 'aria-hidden': 'true'}, st(h('i', {class: 'up'}), {width: (up / n * 100).toFixed(1) + '%'}), st(h('i', {class: 'flat'}), {width: (flat / n * 100).toFixed(1) + '%'}), st(h('i', {class: 'down'}), {width: (down / n * 100).toFixed(1) + '%'})))); }
    v.append(box);
  }
  if (B) add(v, h('p', {class: 'lead'}, `시장 ${B.n.toLocaleString('ko-KR')}곳 중 `, h('b', {class: 'up', text: B.up.toLocaleString('ko-KR') + '곳 오름'}), ' · ', h('b', {class: 'down', text: B.down.toLocaleString('ko-KR') + '곳 내림'}), ` → ${BW(B.up, B.down)}`));
  for (const a of H?.alerts ?? []) v.append(h('p', {class: 'q alert', text: a.kind === 'idx' ? `! ${a.name}가 하루에 ${pct(a.v)} — 3% 넘게 움직인 날입니다` : `! 외국 투자자가 ${a.name}에서 하루에 ${eokW(a.v)} 더 ${a.v < 0 ? '팔았습니다' : '샀습니다'} — 1조 원 넘음`}));
}
function idxPanel(x, span, band, live) {
  const box = h('div', {class: 'ipan'});
  if (!x) { box.append(h('p', {class: 'q', text: '? 이 지수 값을 못 받았습니다.'})); return box; }
  box.append(h('p', {class: 'il'}, h('b', {text: x.name + ' '}), h('span', {class: 'num', text: numK(x.close)}), ' · 하루 ', pctEl(x.day, 'span')));
  const W = 320, Hh = 108, P = 6, rows = x.rows, n = rows.length, lv = rows.map(r => Math.log(r[1])), mid = (Math.max(...lv) + Math.min(...lv)) / 2, top = mid + span / 2, bot = mid - span / 2;
  const X = k => P + k * (W - 2 * P) / Math.max(1, n - 1), Y = l => P + (top - l) / (top - bot) * (Hh - 2 * P), T = tok();
  const svg = sv('svg', {viewBox: `0 0 ${W} ${Hh}`, width: '100%', height: Hh, role: 'img', 'aria-label': `${x.name} 3개월 — ${md(rows[0][0])} ${numK(rows[0][1])}에서 ${md(x.date)} ${numK(x.close)} · 가장 높던 날 ${md(x.hi.d)} · 가장 낮던 날 ${md(x.lo.d)}`});
  const k0 = band ? rows.findIndex(r => r[0] >= band[0]) : -1, k1 = band ? rows.findLastIndex(r => r[0] <= band[1]) : -1;
  if (k0 >= 0 && k1 > k0) svg.append(sv('rect', {x: X(k0).toFixed(1), y: 0, width: (X(k1) - X(k0)).toFixed(1), height: Hh, fill: T.violet, 'fill-opacity': 0.12}));
  svg.append(sv('path', {d: rows.map((r, k) => (k ? 'L' : 'M') + X(k).toFixed(1) + ' ' + Y(lv[k]).toFixed(1)).join(''), fill: 'none', stroke: T.ink, 'stroke-width': 2, 'stroke-linejoin': 'round'}));
  const kh = rows.findIndex(r => r[0] === x.hi.d), kl = rows.findIndex(r => r[0] === x.lo.d);
  for (const [k, c] of [[kh, T.mute], [kl, T.mute]]) if (k >= 0) svg.append(sv('circle', {cx: X(k).toFixed(1), cy: Y(lv[k]).toFixed(1), r: 3.5, fill: c}));
  svg.append(sv('circle', {cx: X(n - 1).toFixed(1), cy: Y(lv[n - 1]).toFixed(1), r: 5, fill: live ? T.night : (x.day < 0 ? T.down : T.up), stroke: x.day < 0 ? T.down : T.up, 'stroke-width': 2.5}));
  box.append(svg, h('div', {class: 'ax'}, h('span', {text: md(rows[0][0])}), h('span', {text: md(x.date)})));
  box.append(h('p', {class: 'cap'}, `가장 높던 ${md(x.hi.d)}보다 `, pctEl(x.hi.vs, 'span'), ` · 가장 낮던 ${md(x.lo.d)}보다 `, pctEl(x.lo.vs, 'span')));
  return box;
}
function homeIndex(v, H) {
  const K = H?.idx?.KOSPI, Q = H?.idx?.KOSDAQ, C = D.core;
  v.append(h('h2', {class: 'sec', text: '코스피 · 코스닥 — 3개월'}));
  if (!K && !Q) { v.append(h('p', {class: 'q', text: '? 지수 값을 못 받았습니다.'})); return; }
  add(v, h('p', {class: 'lead'}, '3개월 가운데 가장 높던 날보다 코스피 ', pctEl(K?.hi?.vs, 'span'), ' · 코스닥 ', pctEl(Q?.hi?.vs, 'span')), staleNote(H, 'idx'));
  // 두 칸 같은 비율 폭(로그) — 3개월 전 = 100 으로 맞추지 않음(시작 날 하루만 옮겨도 숫자가 크게 갈림 · CIA팀)
  const sp = [K, Q].filter(Boolean).map(x => Math.log(Math.max(...x.rows.map(r => r[1]))) - Math.log(Math.min(...x.rows.map(r => r[1])))), span = Math.max(...sp) * 1.08 || 0.1;
  const band = [C.base, C.asOf];
  v.append(h('div', {class: 'ipans'}, idxPanel(K, span, band, H.live), idxPanel(Q, span, band, H.live)));
  v.append(h('details', {class: 'more'}, h('summary', {text: '그림 읽는 법 · 출처'}), h('div', {class: 'in'},
    h('p', {text: `옅은 띠 = 아래 365곳 경주 기간(${md(C.base)} → ${md(C.asOf)} · 20거래일). 두 칸은 같은 비율 폭이라 기울기를 견줄 수 있습니다. 마지막 동그라미가 속이 비면 장 중 값(아직 바뀜)입니다.`}),
    h('p', {text: '날마다 종가 · 네이버 증권 지수. 지난 20거래일: 코스피 ' + pct(H.cmp20?.kospi) + ' · 코스닥 ' + pct(H.cmp20?.kosdaq) + '.'}))));
}
function srows(list, max) {
  return h('ol', {class: 'srows'}, ...list.map(g => h('li', {},
    h('p', {class: 'sl'}, h('span', {class: 'sn', text: g.name}), pctEl(g.chg, 'b')), dbar(g.chg, max),
    h('p', {class: 'ss', text: `오른 곳 ${g.up}/${g.n} · 365곳 ${g.in365}곳`}))));
}
function homeSectors(v, H) {
  const S = H?.sectors;
  v.append(h('h2', {class: 'sec', text: `오늘 업종 — ${S?.label ?? '강한 7'} · 약한 7`}));
  if (!S) { v.append(h('p', {class: 'q', text: '? 업종 값을 못 받았습니다.'})); return; }
  add(v, h('p', {class: 'lead'}, `시장 업종 ${S.ranked}개 가운데 가장 강한 ${S.strong[0]?.name ?? '?'} `, pctEl(S.strong[0]?.chg, 'span'), ` · 가장 약한 ${S.weak[0]?.name ?? '?'} `, pctEl(S.weak[0]?.chg, 'span')), staleNote(H, 'sectors'));
  const max = Math.max(...[...S.strong, ...S.weak].map(g => Math.abs(g.chg)), 0.5);
  v.append(h('h3', {class: 'sh', text: S.label}), srows(S.strong, max), h('h3', {class: 'sh', text: '약한 7'}), srows(S.weak, max));
  v.append(h('details', {class: 'more'}, h('summary', {text: '뺀 업종 · 셈'}), h('div', {class: 'in'},
    h('p', {text: `회사 5곳 미만 업종 ${S.skipped}개와 「기타」(${(S.other ?? 0).toLocaleString('ko-KR')}곳)는 순위에서 뺐습니다. 업종 %는 네이버 증권이 셈한 값입니다(셈법 ?). 「365곳 n곳」 = 우리 365곳 가운데 그 업종 회사 수.`}),
    h('p', {text: '오늘 강한 업종이 내일도 강하다는 뜻은 아닙니다 — 지난 사실만 적습니다.'}))));
}
function homeFlows(v, H) {
  const F = H?.flows;
  v.append(h('h2', {class: 'sec', text: '오늘 누가 사고팔았나'}));
  if (!F) { v.append(h('p', {class: 'q', text: '? 사고판 돈을 못 받았습니다.'})); return; }
  const who = [['personal', '개인'], ['foreign', '외국 투자자'], ['institutional', '기관']], mk = [['KOSPI', '코스피'], ['KOSDAQ', '코스닥']];
  const all = mk.flatMap(([m, mn]) => who.map(([k, kn]) => ({mn, kn, val: F[m]?.[k] ?? null}))).filter(x => x.val != null);
  const big = all.slice().sort((a, b) => Math.abs(b.val) - Math.abs(a.val))[0];
  add(v, h('p', {class: 'lead', text: big ? `${big.kn}가 ${big.mn}에서 ${eokW(big.val)} 더 ${big.val < 0 ? '팖' : '삼'}${F.live ? ' (장 중 · 잠정)' : ''}` : '? 값 없음'}), staleNote(H, 'flows'));
  const max = Math.max(...all.map(x => Math.abs(x.val)), 1);
  for (const [m, mn] of mk) {
    const d = F[m]; v.append(h('h3', {class: 'sh', text: `${mn}${d?.date ? ' · ' + md(d.date) : ''}`}));
    v.append(h('ol', {class: 'srows'}, ...who.map(([k, kn]) => { const x = d?.[k] ?? null;
      return h('li', {}, h('p', {class: 'sl'}, h('span', {class: 'sn', text: kn}), h('b', {class: 'num', text: x == null ? '?' : `${eokW(x)} 더 ${x < 0 ? '팖' : '삼'}`})), dbar(x, max, 'one')); })));
  }
  v.append(h('details', {class: 'more'}, h('summary', {text: '말 풀이 · 출처'}), h('div', {class: 'in'},
    h('p', {text: '더 삼 = 그날 산 돈이 판 돈보다 많음 · 더 팖 = 그 반대. 기관 = 연금 · 보험 · 증권사 · 은행 등. 세 쪽을 더해도 0이 아닌 까닭은 그 밖의 투자자(다른 법인 등)가 있기 때문입니다.'}),
    h('p', {text: '막대는 오름 · 내림이 아니라 돈의 방향이라 한 색(옥색)입니다. 장 중 값은 잠정 · 출처 네이버 증권 투자자별 매매 동향(억 원).'}))));
}
function homeUS(v, H) {
  const U = H?.us;
  v.append(h('h2', {class: 'sec', text: '미국 — 마지막 장'}));
  if (!U) { v.append(h('p', {class: 'q', text: '? 미국 값을 못 받았습니다.'})); return; }
  const vix = U.rows.find(r => r.key === 'VIX');
  add(v, h('p', {class: 'lead'}, `미국 ${U.date ? mdw(U.date) : '?'} 장 끝 — ${U.n}개 가운데 ${U.up}개 오름 · 불안 지수 `, pctEl(vix?.chg, 'span')), staleNote(H, 'us'));
  v.append(h('ol', {class: 'urows'}, ...U.rows.map(r => { const at = r.close != null && r.hi > r.lo ? (r.close - r.lo) / (r.hi - r.lo) * 100 : null;
    return h('li', {}, h('p', {class: 'sl'}, h('span', {class: 'sn', text: r.name}), h('span', {class: 'num uc', text: numK(r.close)}), pctEl(r.chg, 'b')),
      h('span', {class: 'ruler', role: 'img', 'aria-label': at == null ? `${r.name} 60거래일 자리 ?` : `${r.name} 60거래일 가장 낮음 ${numK(r.lo)} ~ 가장 높음 ${numK(r.hi)} 가운데 ${Math.round(at)}% 자리`}, h('i', {class: 'rl'}), at == null ? null : st(h('i', {class: 'rd'}), {left: at.toFixed(1) + '%'}))); })));
  v.append(h('p', {class: 'note', text: '줄 밑 자 = 지난 60거래일 가장 낮음(왼쪽) ~ 가장 높음(오른쪽) 가운데 지금 자리. 미국 장은 한국 장이 끝난 뒤 열려 한국 오늘 값과 같은 날이 아닙니다.'}));
}
function home365(v, H) {
  const S = H?.s365;
  v.append(h('h2', {class: 'sec', text: '365곳 — 오늘'}));
  if (!S || !S.list.length) { v.append(h('p', {class: 'q', text: '? 365곳 오늘 값이 없습니다.'})); return; }
  const day = H.kst.slice(0, 10);
  add(v, h('p', {class: 'lead'}, `${S.date === day ? '오늘' : mdw(S.date)} 365곳: `, h('b', {class: 'up', text: S.up + '곳 오름'}), ' · ', h('b', {class: 'down', text: S.down + '곳 내림'}), S.flat ? ` · ${S.flat}곳 그대로` : ''));
  // 그림: 365곳 하나하나를 가는 막대로 많이 오른 차례(바둑판 아님 — 그림 한 장 · 밀거나 누르면 회사 이름)
  const L = S.list, n = L.length, W = 360, Hh = 96, max = Math.max(...L.map(x => Math.abs(x[1])), 1), T = tok(), bw = W / n, mid = Hh / 2;
  const svg = sv('svg', {viewBox: `0 0 ${W} ${Hh}`, width: '100%', height: Hh, role: 'img', 'aria-label': `365곳 오늘 바뀐 비율 — 많이 오른 차례 · ${S.up}곳 오름 · ${S.down}곳 내림 · 가장 많이 오른 ${S.top?.n} ${pct(S.top?.chg)} · 가장 많이 내린 ${S.bot?.n} ${pct(S.bot?.chg)}`});
  svg.append(sv('line', {x1: 0, x2: W, y1: mid, y2: mid, stroke: T.mute, 'stroke-width': 1}));
  L.forEach(([, c], k) => { const hgt = Math.max(1, Math.abs(c) / max * (mid - 2)); svg.append(sv('rect', {x: (k * bw).toFixed(2), y: (c >= 0 ? mid - hgt : mid).toFixed(1), width: Math.max(0.6, bw - 0.2).toFixed(2), height: hgt.toFixed(1), fill: c > 0 ? T.up : c < 0 ? T.down : T.mute}));
  });
  const cur = sv('rect', {x: 0, y: 0, width: Math.max(2, bw), height: Hh, fill: T.gold, 'fill-opacity': 0, 'pointer-events': 'none'}); svg.append(cur);
  const pick = h('p', {class: 'pick'}), host = h('div', {class: 'strip'}, svg);
  const show = k => { const [c, x] = L[k], co = D.comp?.[c]; cur.setAttribute('x', (k * bw).toFixed(2)); cur.setAttribute('fill-opacity', 0.55);
    pick.replaceChildren(h('a', {class: 'play', href: '#/c/' + c}, `${co?.name ?? c} `, pctEl(x, 'span'), ' 보기 ›')); };
  const mv = e => { const r = svg.getBoundingClientRect(); show(Math.max(0, Math.min(n - 1, Math.floor((e.clientX - r.left) / r.width * n)))); };
  svg.addEventListener('pointerdown', e => { needComp().then(() => mv(e)).catch(() => mv(e)); }); svg.addEventListener('pointermove', e => { if (e.buttons || e.pointerType === 'mouse') mv(e); });
  v.append(host, h('div', {class: 'ax'}, h('span', {text: '많이 오름'}), h('span', {text: '많이 내림'})), pick);
  v.append(h('p', {class: 'links2 ends'}, S.top ? h('a', {href: '#/c/' + S.top.c}, '▲ 가장 많이 오른 ', h('b', {text: S.top.n}), ' ', pctEl(S.top.chg, 'span')) : null,
    S.bot ? h('a', {href: '#/c/' + S.bot.c}, '▼ 가장 많이 내린 ', h('b', {text: S.bot.n}), ' ', pctEl(S.bot.chg, 'span')) : null));
  // 지난 20거래일 견줌 — 365곳을 시장 옆에 같은 자로(CIA팀)
  const M = H.cmp20; if (M) {
    const list = [['코스피', M.kospi], ['코스닥', M.kosdaq], ['365곳 · 한 회사 한 표', M.eq], ['365곳 · 큰 회사는 크게', M.cw]], mx = Math.max(...list.map(x => Math.abs(x[1] ?? 0)), 1);
    v.append(h('h3', {class: 'sh', text: `지난 20거래일(${md(M.base)} → ${md(M.asOf)})`}), h('ol', {class: 'srows'}, ...list.map(([nm, x]) => h('li', {}, h('p', {class: 'sl'}, h('span', {class: 'sn', text: nm}), pctEl(x, 'b')), dbar(x, mx)))));
  }
  const B = H.sectors?.bias;
  if (B) v.append(h('p', {class: 'note', text: `365곳은 이미 오른 업종에서 골랐습니다 — 오늘 약한 7업종에 365곳 가운데 ${B.weak365}곳 · ${H.sectors.label}업종에 ${B.strong365}곳이 있습니다.`}));
}
async function viewHome(v) {
  await needHome();
  const C = D.core, A = C.all, F = C.facts, H = D.home;
  const top = (m) => C.groups.slice().sort((a, b) => chgOf(b, m) - chgOf(a, m))[0];
  const tell = tellRow(`${md(C.base)} → ${md(C.asOf)}`, () => rc.play());
  const head = h('h2', {class: 'sec rt'}), count = h('p', {class: 'count'}), alt = h('div', {class: 'alt'});
  const big = F.big.map(b => `${b.name} ${pct(b.chg)}`).join(' · ');
  function words(m) {
    const t = top(m);
    if (m === 'eq') {
      head.replaceChildren(`지난 ${C.days}거래일 1등은 `, t.short);  // 금빛 테 줄의 이름과 같게
      count.replaceChildren(h('b', {class: 'up', text: A.up + '곳 오름'}), ' · ', h('b', {class: 'down', text: A.down + '곳 내림'}), A.flat ? ` · ${A.flat}곳 그대로` : '', h('span', {class: 'sr', text: ` — 365곳 가운데`}));
      alt.replaceChildren('다르게 보면: 큰 회사는 크게 치면 365곳이 ', pctEl(A.cwChg), ` — ${big}. 아래 단추로 바꿔 보세요.`);
    } else {
      const negs = C.groups.filter(g => r1(g.cwChg) < 0).length;
      head.replaceChildren(negs === C.groups.length ? `큰 회사는 크게 치면 ${negs}갈래 모두 내림` : `큰 회사는 크게 치면 1등은 ${t.short}`);
      count.replaceChildren('365곳 몸값으로 세면 ', pctEl(A.cwChg), ` · ${big}`);
      alt.replaceChildren('한 회사 한 표로 세면 365곳 ', pctEl(A.chg), ` · ${A.up}곳 오름 · ${A.down}곳 내림.`);
    }
  }
  words(state.mode);
  const host = h('div');
  const hello = h('a', {class: 'hello', href: '/hello.html'}, h('img', {src: '/media/atlas-hello-132.jpg', alt: '', width: 44, height: 44, decoding: 'async'}) /* 띠 사진은 작은 판(6KB · 2026-10-12 구글팀: 720×1280 128KB 를 44px 로 받던 것) — 영상 표지는 그대로 */, h('span', {class: 'hw'}, h('b', {text: '친구에게 소개하기'}), h('span', {text: '공주님 1분 영상 · 보내기'})),
    h('span', {class: 'hello-mo', 'aria-hidden': 'true'}, MO.rainbow(46), MO.heart(16)), h('span', {class: 'chev', 'aria-hidden': 'true', text: '›'})); // 영상 친구들(16:29) — 무지개 · 하트
  v.append(hello);
  // 종합 정보 — 오늘 한눈에 → 지수 3개월 → 업종 강 7 · 약 7 → 누가 사고팔았나 → 미국 → 365곳(오늘 · 지난 20거래일 · 경주 = 1단 입구)
  homeHead(v, H); homeIndex(v, H); homeSectors(v, H); homeFlows(v, H); homeUS(v, H); home365(v, H);
  v.append(tell.el, head, count, host);
  const items = C.groups.map(g => ({key: g.id, name: g.short, href: '#/g/' + g.id, v: g.v, cw: g.cw, tr: g.tr, trc: g.trc}));
  const winner = C.groups.slice().sort((a, b) => b.chg - a.chg)[0];
  const rc = race(host, {items, parent: A, label: `큰 갈래 ${C.groups.length}개 — 지난 ${C.days}거래일 경주 · 많이 오른 순: ` + C.groups.map(g => g.short + ' ' + pct(g.chg)).join(', '),
    auto: !state.played && !RM.matches,
    onTick: (k, held, rows) => {
      if (held) { const w = rows.find(r => r.it.key === winner.id), rank = rows.slice().sort((a, b) => (b.cur ?? 0) - (a.cur ?? 0)).indexOf(w) + 1; tell.t.replaceChildren(h('b', {text: md(C.dates[k])}), ` · ${winner.short} ${rank}등 `, pctEl(w.cur - 100)); }
      else tell.t.replaceChildren(h('b', {text: md(C.dates[k])}));
    },
    onDone: () => { tell.t.textContent = `${md(C.base)} → ${md(C.asOf)}`; }});
  state.played = true;
  v.append(legend('365곳'), h('p', {class: 'note trn', text: `줄 아래 = ${md(C.base)} → ${md(C.asOf)} 방향 · 세기 · 힘: 「강하게」 = 곧게 10% 넘게 · 「힘 붙음」 = 뒤 ${Math.floor(C.days / 2)}거래일이 앞 ${Math.floor(C.days / 2)}거래일보다 3%p 넘게 더 오름(「힘 빠짐」은 그 반대)`}), seg(m => { words(m); rc.setMode(m); }), alt);
  const share = Math.round(F.dd50 / F.n1y * 10);
  v.append(h('p', {class: 'note', text: `이 365곳도 10곳 중 ${share}곳은 지난 1년 사이 꼭대기의 반값 아래로 떨어진 적이 있습니다 — 반값을 견딜 수 있나요? (${F.n1y}곳 가운데 ${F.dd50}곳 · ${md(C.asOf)}까지 1년 종가)`}));
  const T = C.time; // 시간 노선도는 한 줄 고리로(애플 · 구글 · 클로드 팀 — 첫 화면이 길어져서) · 봉인 화면은 그대로
  if (T) v.append(h('p', {class: 'links2'}, h('a', {href: '#/time'}, `봉인 ${T.id}호 — 3 · 5 · 10년 뒤 다시 엶 · 3년 뒤까지 `, h('b', {class: 'num', text: ddayText(T.opens[0].date)}), ' ›')));
  v.append(h('p', {class: 'note', text: `줄을 누르면 7단까지 내려갑니다 — 갈래 → 업종 → 회사 → 지나온 길 → 누구와 다투나 → 앞으로 클까? → 범위 · 확인. 365곳은 ${md(C.rules.pickWin.to)}까지 ${C.rules.pickWin.days}거래일 「대세」였던 업종부터 골랐기 때문에, 그 기간과 겹치는 선은 좋아 보이기 쉽습니다.`}));
  v.append(foot());
}

// ── 화면 ② 갈래 ──
function viewGroup(v, id) {
  const C = D.core, g = gById(id);
  if (!g) return viewMissing(v);
  const inds = g.inds.map(ind);
  const gtr = h('p', {class: 'trh'});
  const tell = tellRow(`${md(C.base)} → ${md(C.asOf)}`, () => rc.play());
  const head = h('h1', {class: 'head'}), count = h('p', {class: 'count'}), alt = h('div', {class: 'alt'});
  function words(m) {
    head.replaceChildren(`${g.name} ${C.days}거래일 `, pctEl(chgOf(g, m), 'span')); trFill(gtr, m === 'cw' ? g.trc : g.tr);
    if (m === 'eq') { count.replaceChildren(`${g.n}곳 중 `, h('b', {class: 'up', text: g.up + '곳 오름'}), ' · ', h('b', {class: 'down', text: g.down + '곳 내림'})); alt.replaceChildren('다르게 보면: 큰 회사는 크게 치면 ', pctEl(g.cwChg), '.'); }
    else { count.replaceChildren('몸값으로 세면 ', pctEl(g.cwChg), ` · 한 회사 한 표로는 `, pctEl(g.chg)); alt.replaceChildren('한 회사 한 표로 세면 ', pctEl(g.chg), ` · ${g.up}곳 오름 · ${g.down}곳 내림.`); }
  }
  words(state.mode);
  const host = h('div');
  v.append(crumbs({href: '#/', text: '한눈에'}, {text: g.short}), steps(1), tell.el, head, gtr, h('p', {class: 'say', text: `${inds.slice().sort((a, b) => b.n - a.n).slice(0, 3).map(x => x.name).join(' · ')}${inds.length > 3 ? ' 등' : ''} · 업종 ${inds.length}개`}), count, host); // 설명은 지금 업종에서(CIA팀 2026-10-12: 옛 365곳 설명이 남아 있던 것)
  const items = inds.map(i => ({key: i.name, name: i.name, href: hrefInd(i), v: i.v, cw: i.cw, badge: i.n === 1 ? '1곳' : null, tr: i.tr, trc: i.trc}));
  const rc = race(host, {items, parent: g, wide: true, label: `${g.name} 업종 ${inds.length}개 — ${C.days}거래일 많이 오른 순: ` + inds.map(i => i.name + ' ' + pct(i.chg)).join(', '),
    onTick: k => tell.t.replaceChildren(h('b', {text: md(C.dates[k])})), onDone: () => { tell.t.textContent = `${md(C.base)} → ${md(C.asOf)}`; }});
  v.append(legend(g.short), seg(m => { words(m); rc.setMode(m); }), alt);
  const low = g.low;
  v.append(h('p', {class: 'note', text: `${md(C.dates[low.k])}(이 갈래가 가장 낮던 날)에는 ${g.n}곳 중 ${low.below}곳이 ${md(C.base)}보다 아래였습니다 — 한 갈래는 함께 움직이기 쉽습니다.`}));
  if (inds.some(i => i.n === 1)) v.append(h('p', {class: 'note', text: '「1곳」 = 회사가 하나뿐인 업종 — 업종 평균이 아니라 그 회사 하나의 값입니다.'}));
  v.append(foot());
}

// ── 화면 ③ 업종 ──
async function viewIndustry(v, name) {
  const C = D.core, i = ind(name);
  if (!i) return viewMissing(v);
  if (i.n === 1) { location.replace('#/c/' + i.members[0]); return; }
  await needComp();
  const g = gById(i.g);
  const itr = h('p', {class: 'trh'});
  const tell = tellRow(`${md(C.base)} → ${md(C.asOf)}`, () => rc.play());
  const head = h('h1', {class: 'head'}), count = h('p', {class: 'count'}), alt = h('div', {class: 'alt'});
  function words(m) {
    head.replaceChildren(`${i.name} ${C.days}거래일 `, pctEl(chgOf(i, m), 'span')); trFill(itr, m === 'cw' ? i.trc : i.tr);
    if (m === 'eq') { count.replaceChildren(`${i.n}곳 중 `, h('b', {class: 'up', text: i.up + '곳 오름'}), ' · ', h('b', {class: 'down', text: i.down + '곳 내림'})); alt.replaceChildren('다르게 보면: 큰 회사는 크게 치면 ', pctEl(i.cwChg), '.'); }
    else { count.replaceChildren('몸값으로 세면 ', pctEl(i.cwChg), ' · 한 회사 한 표로는 ', pctEl(i.chg)); alt.replaceChildren('한 회사 한 표로 세면 ', pctEl(i.chg), ` · ${i.up}곳 오름 · ${i.down}곳 내림.`); }
  }
  words(state.mode);
  const host = h('div');
  v.append(crumbs({href: '#/', text: '한눈에'}, {href: '#/g/' + g.id, text: g.short}, {text: i.name}), steps(2, ['#/g/' + g.id]), tell.el, head, itr, count, host);
  const items = i.members.map(c => ({key: c, name: D.comp[c].name, href: '#/c/' + c, v: D.lines[c].map(x => (x == null ? null : x / 100)), cw: null}));
  const rc = race(host, {items, parent: i, wide: true, label: `${i.name} 회사 ${i.n}곳 — ${C.days}거래일 많이 오른 순: ` + i.members.map(c => D.comp[c].name + ' ' + pct(D.comp[c].chg)).join(', '),
    onTick: k => tell.t.replaceChildren(h('b', {text: md(C.dates[k])})), onDone: () => { tell.t.textContent = `${md(C.base)} → ${md(C.asOf)}`; }});
  v.append(legend(i.name), seg(m => { words(m); rc.setMode(m); }), alt);
  v.append(h('p', {class: 'note', text: '회사 줄은 그 회사 주가 그대로라 두 보기에서 같습니다 — 바뀌는 것은 점선(업종 평균)과 맨 위 숫자입니다.'}));
  v.append(foot());
}

// ── 화면 ④ 회사 ──
async function viewCompany(v, code) {
  await needComp();
  const C = D.core, c = D.comp[code];
  if (!c) return viewMissing(v, code);
  const i = ind(c.i), g = gById(c.g), line = D.lines[code].map(x => (x == null ? null : x / 100));
  v.append(crumbs({href: '#/', text: '한눈에'}, {href: '#/g/' + g.id, text: g.short}, i.n > 1 ? {href: hrefInd(i), text: i.name} : {text: i.name + '(1곳)'}));
  v.append(stepsCo(3, code, g, i));
  v.append(h('div', {class: 'co-head'}, h('h1', {text: c.name}), h('small', {text: `${c.market === 'KOSPI' ? '코스피' : '코스닥'} · ${code} · 1주 ${won(c.price)}`})));
  // 그림을 맨 위로(애플팀 2026-10-12 — 첫 화면에 그림이 없던 것) → 세 숫자 → 100만 원 줄 → 다음 단 → 왜 들었나
  const chartHost = h('div');
  v.append(chartHost);
  const trio = h('div', {class: 'trio'},
    h('div', {}, h('span', {text: `${C.days}거래일`}), pctEl(c.chg)),
    h('div', {}, h('span', {text: '1년'}), pctEl(c.r1y)),
    h('div', {}, h('span', {text: `가장 깊이 빠짐(${C.days}거래일)`}), pctEl(c.mdd))); // 칸 이름에 기간(클로드팀: 옆 「1년」 값처럼 읽히던 것)
  const draw = () => { lineChart(chartHost, {v: line, avg: i.n > 1 ? i.v : null, label: `${c.name} ${C.days}거래일 선 — 기준일 ${md(C.base)} = 100에서 ${pct(c.chg)} · 가장 깊이 빠짐 ${pct(c.mdd)}`}); fitNums(trio); };
  draw(); chartDraw = draw;
  v.append(h('p', {class: 'lkey'}, h('span', {}, h('i', {class: 'l-co'}), `${c.name} — ${md(C.base)}보다 위 빨강 · 아래 파랑`), i.n > 1 ? h('span', {}, h('i', {class: 'l-avg'}), i.name + ' 평균') : null, C.kPick != null ? h('span', {}, h('i', {class: 'l-pick'}), `고른 날 ${md(C.pickAsOf)}`) : null));
  v.append(trio); fitNums(trio);
  // 100만 원 줄 — 4단과 같은 뜻(산 날 = 기준일)으로 셈(클로드팀: 꼭대기 기준이라 4단과 달랐던 것)
  const lv = line.filter(x => x != null), low = lv.length ? Math.min(...lv) : null, last = lv.length ? lv.at(-1) : null, man = x => Math.round(x).toLocaleString('ko-KR') + '만 원'; // 선 = 기준일 100
  v.append(h('p', {class: 'won', text: low == null ? '? 값을 못 읽었습니다' : low < 100 ? `${md(C.base)}에 100만 원어치였다면 가장 낮을 때 ${man(low)} · 끝 ${man(last)}` : `${md(C.base)}에 100만 원어치였다면 그보다 낮아진 적 없이 끝 ${man(last)}`}));
  v.append(h('p', {class: 'src', text: `네이버 증권 · ${md(c.priceDate || C.asOf)} 종가 · ATLAS 셈`}));
  // 36곳 자리 · 봉인 줄은 7단 「범위 · 확인」으로 옮김(네 팀 — 회사 첫 화면에 결론처럼 먼저 보이지 않게)
  v.append(nextStep(`#/c/${code}/past`, '4단 지나온 길', '1년 · 3년 주가 · 해마다 번 돈 · 몸값'));
  // 왜 365곳에 들었나(사장님 11:43 대세 365곳) — 고를 때(그 30거래일) 값 · 업종은 네이버 업종 · 앞날 숫자는 쓰지 않음
  v.append(whyBox(c));
  v.append(foot());
}
// 4 ~ 7단 공통 — 단마다 가는 길(지나온 단 · 바로 다음 단만 누름) · 위치 줄은 회사까지만(길어지지 않게 · 지금 단은 단 표시가 보임)
const ALLH = (code, g, i) => ['#/g/' + g.id, i.n > 1 ? hrefInd(i) : null, '#/c/' + code, `#/c/${code}/past`, `#/c/${code}/rivals`, `#/c/${code}/grow`, `#/c/${code}/range`];
function stepsCo(now, code, g, i) { return steps(now, ALLH(code, g, i).map((x, k) => (k < now - 1 || k === now ? x : null))); }
const coCrumbs = (c, g, i, code) => crumbs({href: '#/', text: '한눈에'}, {href: '#/g/' + g.id, text: g.short}, i.n > 1 ? {href: hrefInd(i), text: i.name} : {text: i.name + '(1곳)'}, {href: '#/c/' + code, text: c.name});
// 왜 365곳에 들었나(사장님 2026-10-11 11:43 대세 365곳 · 클로드팀) — 층 · 네이버 업종 · 두 팀 잣대 · 이 회사 30거래일(고를 때 값만 · 앞날 숫자 없음)
function whyBox(c) {
  const C = D.core, p = c.pick, W = C.rules.pickWin, F = C.funnel;
  const box = h('div', {class: 'box'}, h('h2', {text: '왜 365곳에 들었나요?'}));
  const tier = {1: '1층 — 두 팀 모두 「대세」로 본 업종', 2: `2층 — ${p.google ? '구글팀' : 'CIA팀'}만 「대세」로 본 업종`, 3: '3층 — 대세에 가까운 순서로 채운 업종'}[p.tier];
  box.append(h('p', {}, h('b', {text: tier})));
  box.append(h('p', {text: `네이버 업종 「${p.sector}」 · ${F.sectors}업종 가운데 대세 순서 ${p.srank}번째 · 이 업종에서 기본 문을 지난 곳 ${p.sn}곳`}));
  box.append(h('p', {}, `${W.days}거래일(${md(W.from)} → ${md(W.to)}) 업종 `, pctEl(p.schg), ' · 이 회사 ', p.r30 == null ? h('span', {class: 'q', text: '? 셈 못 함'}) : pctEl(p.r30)));
  const cut = (on, t) => `${t} ${on ? '이상' : '밑'}`;
  box.append(h('details', {class: 'more'}, h('summary', {text: '두 팀이 잰 숫자 — 눌러서 보기'}), h('div', {class: 'in'}, h('ul', {class: 'tm'}, // 7단(네 팀): 두 팀 잣대 숫자는 접음
    h('li', {text: `구글팀 — 흔들림에 견주어 많이 오른 순 ${p.srank}번째 · 위 20%(${F.top}번째까지) ${p.google ? '안 → 고름' : '밖 → 안 고름'}`}),
    h('li', {text: `CIA팀 — 꾸준히 10% 넘게 오름 ${p.strong ? '맞음' : '아님'}(곧은 선 ${pct(p.sfit)}) · 오른 회사 ${r1(p.sbr).toFixed(1)}%(${cut(p.hits[0], '60%')}) · 거래대금 몫 ${pct(p.smon)}(${cut(p.hits[1], '+10%')}) · 이익 늘어난 회사(증권사 짐작) ${r1(p.searn).toFixed(1)}%(${cut(p.hits[2], '60%')}) → ${p.cia ? '고름' : '안 고름'}`})))));
  if (p.part) box.append(h('p', {text: `이 업종 ${p.sn}곳을 다 넣으면 365곳을 넘어서, 업종 안에서 ${W.days}거래일 많이 오른 순으로 ${p.inN}곳만 넣었습니다 — 이 회사는 ${p.prank}번째.`}));
  box.append(h('p', {class: 'small', text: `기본 문 ${C.rules.gate.length === 7 ? '일곱(흑자 · 빚 · 몸값 · 거래 · 기록 1년 · 보통주 · 그날 종가)' : C.rules.gate.length + '개'}을 지났을 뿐, 좋은 회사로 매긴 것은 아닙니다. 이미 오른 업종에서 골랐기 때문에 그 기간과 겹치는 선은 좋아 보이기 쉽습니다.`}));
  return box;
}
function nextStep(href, title, sub) { return h('a', {class: 'nextst', href}, h('span', {}, h('b', {text: title}), h('span', {text: sub})), h('span', {class: 'chev', 'aria-hidden': 'true', text: '›'})); }

// ── 4단 지나온 길 — 1주 값 20거래일 · 1년 · 3년(365곳 평균 점선) · 해마다 번 돈 · 몸값 ──
const PERIODS = [['20d', '20거래일', 21], ['1y', '1년', 253], ['3y', '3년', 757]];
async function viewPast(v, code) {
  await needComp();
  const C = D.core, c = D.comp[code];
  if (!c) return viewMissing(v, code);
  await Promise.all([needDays(), needCo(code).then(x => { D.co = x; })]);
  const co = await needCo(code), dd = D.days, i = ind(c.i), g = gById(c.g);
  v.append(stepsCo(4, code, g, i));
  v.append(h('div', {class: 'co-head'}, h('h1', {text: c.name + ' — 지나온 길'}), h('small', {text: `1주 값 · ${md(dd.asOf)} 종가까지`})));
  const stat = h('div', {class: 'trio'}), wonLine = h('p', {class: 'won'}), money = h('p', {class: 'won'}), chartHost = h('div'), key = h('p', {class: 'lkey'}), jumpNote = h('div');
  let per = state.per || '1y';
  const segBox = h('div', {class: 'seg seg3', role: 'group', 'aria-label': '기간 바꾸기'});
  const btns = PERIODS.map(([id, name]) => { const b = h('button', {type: 'button', 'aria-pressed': String(id === per), text: name}); b.addEventListener('click', () => { per = state.per = id; btns.forEach((x, k) => x.setAttribute('aria-pressed', String(PERIODS[k][0] === per))); draw(); }); return b; });
  segBox.append(...btns);
  const nextTop = h('div');
  v.append(segBox, chartHost, key, stat, wonLine, money, jumpNote, nextTop); // 7단(애플팀): 그림을 맨 위로 — 기간 단추 바로 밑 · 다음 단 단추는 첫 화면 가까이
  const nAll = dd.dates.length, k0 = co.k0;
  function draw() {
    const len = PERIODS.find(p => p[0] === per)[2], from = Math.max(k0, nAll - len);
    const dates = dd.dates.slice(from), cl = co.close.slice(from - k0), base = cl.find(x => x != null);
    const allv = dd.all.slice(from), avg = allv.map(x => x / allv[0] * base);
    const last = [...cl].reverse().find(x => x != null);
    let peak = 0, m = 0; for (const x of cl) { if (x == null) continue; peak = Math.max(peak, x); m = Math.min(m, x / peak - 1); }
    const name = PERIODS.find(p => p[0] === per)[1], short = from === k0 && nAll - len < k0;
    const same1y = per === '1y' && !short && c.r1y != null && c.mdd1y != null; // 1년은 회사 자료 값 그대로(3단 · 7단과 같은 숫자)
    stat.replaceChildren(
      h('div', {}, h('span', {text: name + (short ? '(상장 뒤)' : '')}), pctEl(same1y ? c.r1y : (last / base - 1) * 100)),
      h('div', {}, h('span', {text: '가장 깊이 빠짐'}), pctEl(same1y ? c.mdd1y : m * 100)),
      h('div', {}, h('span', {text: '꼭대기에서 지금'}), pctEl((last / peak - 1) * 100)));
    fitNums(stat);
    const lastK = cl.length - 1 - [...cl].reverse().findIndex(x => x != null);
    wonLine.textContent = `1주 ${ymd(dates[cl.findIndex(x => x != null)])} ${won(base)} → ${ymd(dates[lastK])} ${won(last)}`;
    const low = Math.min(...cl.filter(x => x != null)); // 산 날보다 가장 낮을 때 · 끝(돈으로 — 숫자에 약한 사람도 느끼게)
    const man = x => Math.round(x / base * 100).toLocaleString('ko-KR') + '만 원';
    money.textContent = low < base ? `100만 원어치였다면 산 날보다 가장 낮을 때 ${man(low)} · 끝 ${man(last)}` : `100만 원어치였다면 산 날보다 낮아진 적 없이 끝 ${man(last)}`;
    priceChart(chartHost, {dates, close: cl, avg, jumps: co.jumps, label: `${c.name} ${name} 1주 값 — ${won(base)}에서 ${won(last)}(${pct((last / base - 1) * 100)})`});
    chartDraw = draw;
    key.replaceChildren(h('span', {}, h('i', {class: 'l-co'}), `${c.name} — ${ymd(dates[0])}보다 위 빨강 · 아래 파랑`), h('span', {}, h('i', {class: 'l-avg'}), '365곳 평균(같은 날 같은 값에서 출발)'));
    const js = co.jumps.filter(j => j[0] >= dates[0]);
    jumpNote.replaceChildren(...(js.length ? [h('p', {class: 'note'}, h('span', {class: 'q', text: '? '}), `하루에 30% 넘게 바뀐 날 ${js.map(j => ymd(j[0]) + ' ' + pct(j[1])).join(' · ')} — 한국 주식은 하루 30%까지만 움직이므로 주식 수가 바뀐 날(쪼개기 · 증자)일 수 있습니다. 확인 못 함.`)] : []));
  }
  draw();
  // 해마다 번 돈(기록만 · 증권사 짐작 E 는 넣지 않음)
  const f = co.fin, rows = [];
  for (const [k, name] of [['rev', '매출'], ['op', '영업이익'], ['net', '순이익']]) { if (k === 'op' && co.key === 'net') continue; const vals = f[k] || []; if (vals.some(x => x != null)) rows.push([name, vals]); }
  const fb = h('div', {class: 'box'}, h('h2', {text: '해마다 번 돈(결산 기록)'}));
  if (!rows.length || !f.years.length) fb.append(h('p', {class: 'q', text: '? 결산 기록이 없습니다'}));
  for (const [name, vals] of rows) {
    const mx = Math.max(1, ...vals.filter(x => x != null).map(Math.abs));
    const list = h('ul', {class: 'fin'});
    f.years.forEach((y, k) => { const x = vals[k], bar = h('i', {class: 'fb ' + (x != null && x < 0 ? 'neg' : 'pos')}); if (x != null) bar.style.width = Math.max(2, Math.abs(x) / mx * 100) + '%';
      list.append(h('li', {}, h('span', {class: 'y', text: fy(y)}), h('span', {class: 'ft', 'aria-hidden': 'true'}, bar), h('b', {class: 'num', text: x == null ? '?' : eok(x)}))); });
    fb.append(h('h3', {text: name}), list);
  }
  fb.append(h('p', {class: 'small', text: `기록만 보입니다 — 증권사가 짐작한 올해 값은 넣지 않았습니다. 막대 길이는 같은 줄 안에서만 견줍니다.`}));
  v.append(fb);
  // 몸값
  const ly = f.years.length - 1;
  v.append(h('details', {class: 'more'}, h('summary', {text: '몸값 — 눌러서 보기'}), h('div', {class: 'in'}, h('ul', {class: 'chk'},
    h('li', {}, h('span', {class: 'm ok', text: '·'}), h('span', {}, h('b', {text: '시가총액 '}), eok(c.cap))),
    h('li', {}, h('span', {class: 'm ' + (co.per != null ? 'ok' : 'q'), text: co.per != null ? '·' : '?'}), h('span', {}, h('b', {text: '1년 순이익의 '}), co.per != null ? `${r1(co.per).toFixed(1)}배(365곳 가운데값 ${r1(C.facts.perMedian).toFixed(1)}배)` : '? 자료 없음')),
    h('li', {}, h('span', {class: 'm ' + (co.pbr != null ? 'ok' : 'q'), text: co.pbr != null ? '·' : '?'}), h('span', {}, h('b', {text: '장부 값의 '}), co.pbr != null ? `${r1(co.pbr).toFixed(1)}배` : '? 자료 없음')),
    ly >= 0 ? h('li', {}, h('span', {class: 'm ok', text: '·'}), h('span', {}, h('b', {text: `${fy(f.years[ly])} 빚 · 이익률 `}), `부채비율 ${f.debt?.[ly] != null ? r1(f.debt[ly]).toFixed(1) + '%' : '?'} · 자기자본 이익률 ${f.roe?.[ly] != null ? r1(f.roe[ly]).toFixed(1) + '%' : '?'}`)) : null))));
  v.append(h('p', {class: 'src', text: '네이버 증권 · 결산 · 10월 10일 모음'}));
  const G = co.grow, S5 = G?.story; // 다음 단 미리 보기는 판정 말 없이 사실만(클로드팀 · CIA팀 — 반대 근거보다 좋은 말이 먼저 보이지 않게)
  const nx = () => nextStep(`#/c/${code}/rivals`, '5단 누구와 다투나', G ? [S5?.shape, S5 ? `경쟁 회사 ${(S5.rivals || []).length}곳` : '세 팀 이야기 없음', `업종 안 매출 ${G.ind.rank ?? '?'}번째`].filter(Boolean).join(' · ') : '경쟁 회사 · 업종 안 크기');
  nextTop.append(nx());
  v.append(nx(), foot());
}

function priceChart(host, {dates, close, avg, jumps, label}) {
  host.textContent = '';
  const wrap = h('div', {class: 'lc'}); host.append(wrap);
  const n = close.length, W = Math.max(260, Math.round(wrap.getBoundingClientRect().width || 320)), H = 220, P = 10;
  const vals = [...close, ...avg].filter(x => x != null);
  if (!vals.length) { wrap.append(h('p', {class: 'q', text: '? 이 기간 값을 못 읽었습니다'})); return; }
  let lo = Math.min(...vals), hi = Math.max(...vals); const pad = (hi - lo) * 0.06 || 1; lo -= pad; hi += pad;
  const X = i => P + i * (W - 2 * P) / Math.max(1, n - 1), Y = y => P + (hi - y) * (H - 2 * P) / (hi - lo);
  const base = close.find(x => x != null), id = 'pc' + (++lcN), T = tok();
  const svg = sv('svg', {viewBox: `0 0 ${W} ${H}`, width: W, height: H, role: 'img', 'aria-label': label});
  const defs = sv('defs'); const cu = sv('clipPath', {id: id + 'u'}); cu.append(sv('rect', {x: 0, y: 0, width: W, height: Y(base)})); const cd = sv('clipPath', {id: id + 'd'}); cd.append(sv('rect', {x: 0, y: Y(base), width: W, height: H - Y(base)})); defs.append(cu, cd); fadeDefs(defs, id, T, P, H, Y(base)); svg.append(defs);
  hairs(svg, W, P, [P, H - P]);
  const ad = areaPath(close, X, Y, Y(base));
  svg.append(sv('path', {d: ad, fill: `url(#${id}gu)`, 'clip-path': `url(#${id}u)`}), sv('path', {d: ad, fill: `url(#${id}gd)`, 'clip-path': `url(#${id}d)`}));
  svg.append(sv('line', {x1: P, x2: W - P, y1: Y(base), y2: Y(base), stroke: T.mute, 'stroke-width': 1}));
  const path = arr => { let d = '', on = false; arr.forEach((y, i) => { if (y == null) { on = false; return; } d += (on ? 'L' : 'M') + X(i).toFixed(1) + ' ' + Y(y).toFixed(1); on = true; }); return d; };
  svg.append(sv('path', {d: path(avg), fill: 'none', stroke: T['violet-ink'], 'stroke-width': 3, 'stroke-dasharray': '0.1 6', 'stroke-linecap': 'round'}));
  const d = path(close);
  svg.append(sv('path', {d, fill: 'none', stroke: T.up, 'stroke-width': 2.5, 'stroke-linejoin': 'round', 'stroke-linecap': 'round', 'clip-path': `url(#${id}u)`}));
  svg.append(sv('path', {d, fill: 'none', stroke: T.down, 'stroke-width': 2.5, 'stroke-linejoin': 'round', 'stroke-linecap': 'round', 'clip-path': `url(#${id}d)`}));
  for (const [dt] of jumps) { const k = dates.indexOf(dt); if (k >= 0 && close[k] != null) svg.append(sv('circle', {cx: X(k), cy: Y(close[k]), r: 7, fill: 'none', stroke: T.gold, 'stroke-width': 2})); }
  const lastK = close.map((x, i) => (x == null ? -1 : i)).filter(i => i >= 0).pop();
  svg.append(sv('circle', {cx: X(lastK), cy: Y(close[lastK]), r: 5.5, fill: close[lastK] >= base ? T.up : T.down, stroke: T.night, 'stroke-width': 2.5}));
  const cx = sv('line', {y1: P, y2: H - P, stroke: T.ink, 'stroke-opacity': 0.6, 'stroke-width': 1}), dot = sv('circle', {r: 5.5, fill: T.ink, stroke: T.night, 'stroke-width': 2}); cx.setAttribute('visibility', 'hidden'); dot.setAttribute('visibility', 'hidden'); svg.append(cx, dot);
  wrap.append(svg);
  const cv = close.filter(x => x != null); // 위 · 아래 글 = 이 회사 실제 가장 높은 · 낮은 종가(CIA팀 2026-10-12: 여백을 덧댄 값이 보이던 것)
  const yt = h('span', {class: 'yl num', text: '가장 높을 때 ' + won(Math.max(...cv))}), yb = h('span', {class: 'yl num', text: '가장 낮을 때 ' + won(Math.min(...cv))}); yt.style.top = '0'; yb.style.top = (H - 30) + 'px'; wrap.append(yt, yb);
  const tip = h('div', {class: 'tip num'}); tip.hidden = true; wrap.append(tip);
  wrap.append(h('div', {class: 'ax'}, h('span', {text: ymd(dates[0])}), h('span', {text: ymd(dates[n - 1])})));
  const mv = e => { const r = svg.getBoundingClientRect(), x = (e.clientX - r.left) * W / r.width; let i = Math.round((x - P) / ((W - 2 * P) / Math.max(1, n - 1))); i = Math.max(0, Math.min(n - 1, i)); if (close[i] == null) return;
    cx.setAttribute('x1', X(i)); cx.setAttribute('x2', X(i)); cx.setAttribute('visibility', 'visible'); dot.setAttribute('cx', X(i)); dot.setAttribute('cy', Y(close[i])); dot.setAttribute('visibility', 'visible');
    tip.hidden = false; tip.textContent = `${ymd(dates[i])} · ${won(close[i])} · ${pct((close[i] / base - 1) * 100)}`; tip.style.left = Math.min(r.width - 120, Math.max(120, X(i) * r.width / W)) + 'px'; };
  svg.addEventListener('pointermove', mv); svg.addEventListener('pointerdown', mv); svg.addEventListener('pointerleave', () => { cx.setAttribute('visibility', 'hidden'); dot.setAttribute('visibility', 'hidden'); tip.hidden = true; });
}

// ── 7단 범위 · 확인 — 한 달 범위(몬테카를로 4방향 · 모형 셈) · 확인표 · 지켜볼 날 · 확인할 곳(7단 · 2026-10-12 00:50 네 팀)
//    끝은 「사기」가 아니라 「확인」(클로드팀 · CIA팀) — 「모형 가정 아래 추정 · 검증 전」을 맨 위에 · 모형 막대는 오름 · 내림 색을 쓰지 않음(규칙 53) · 36곳 고리 없음
const nextSlot = slots => { const k = new Date(Date.now() + 9 * 36e5), m = k.getUTCHours() * 60 + k.getUTCMinutes(), mm = x => +x.slice(0, 2) * 60 + +x.slice(3, 5), nx = slots.find(x => mm(x) > m); return nx ? nx : slots[0] + ' · 내일'; };
async function viewRange(v, code) {
  await Promise.all([needComp(), needPick()]);
  const C = D.core, c = D.comp[code];
  if (!c) return viewMissing(v, code);
  const [co] = await Promise.all([needCo(code).catch(() => null), needDays().catch(() => null)]); // 하루 30% 넘게 바뀐 날(1년 줄 「?」 — 클로드팀) · 1년 창은 거래일 표로
  const i = ind(c.i), g = gById(c.g), K = D.pick, k = K.companies[code], S = K.spec, B = K.backtest;
  v.append(stepsCo(7, code, g, i));
  v.append(h('div', {class: 'co-head'}, h('h1', {text: c.name + ' — 범위 · 확인'}), h('small', {text: `여기부터 다시 주가 · ${md(K.asOf)} 종가 · ${S.horizon}거래일(약 한 달) 뒤`})));
  const box = h('div', {class: 'box'}, h('h2', {text: '시장이 이렇게 가면 — 몬테카를로 4방향'}));
  box.append(h('p', {class: 'alt'}, h('b', {text: '모형 가정 아래 추정 · 검증 전'}), B ? ` — 같은 셈은 지난 ${B.n}번 가운데 ${B.wins}번만 365곳 평균보다 나았습니다.` : ' — 지난 기록 시험 ?'));
  if (!k || !k.ok) box.append(h('p', {class: 'q', text: '? 셈 못 함 — 어느 한 방향에서 이 회사 값이 있는 날이 20일이 안 됩니다.'}));
  else {
    const list = h('ul', {class: 'dirbars'});
    const okC = Object.values(K.companies).filter(x => x && x.ok), med = a => { const x = a.slice().sort((p, q) => p - q), m = x.length; return m ? (m % 2 ? x[(m - 1) / 2] : (x[m / 2 - 1] + x[m / 2]) / 2) : null; }; // 365곳 가운데값(CIA팀 2026-10-12: 견줄 값)
    K.dirs.forEach((d, j) => { const w = k.win[j], b = k.big[j], bw = h('i', {class: 'db pos'}), bb = h('i', {class: 'db neg'}); bw.style.width = w + '%'; bb.style.width = b + '%';
      const mw = med(okC.map(x => x.win[j])), mb = med(okC.map(x => x.big[j])), tw = h('i', {class: 'dm'}), tb = h('i', {class: 'dm'}); tw.style.left = mw + '%'; tb.style.left = mb + '%';
      list.append(h('li', {}, h('b', {class: 'dn', text: d.name}),
        h('span', {class: 'dl'}, h('span', {class: 'dt', role: 'img', 'aria-label': `번 길 ${r1(w).toFixed(1)}% · 365곳 가운데값 ${r1(mw).toFixed(1)}%`}, bw, tw), h('span', {class: 'num', text: `번 길 ${r1(w).toFixed(1)}%`})),
        h('span', {class: 'dl'}, h('span', {class: 'dt', role: 'img', 'aria-label': `크게 잃는 길 ${r1(b).toFixed(1)}% · 365곳 가운데값 ${r1(mb).toFixed(1)}%`}, bb, tb), h('span', {class: 'num', text: `크게 잃는 길 ${r1(b).toFixed(1)}%`})))); });
    box.append(list, h('p', {class: 'lkey'}, h('span', {}, h('i', {class: 'l-dw'}), '번 길'), h('span', {}, h('i', {class: 'l-db'}), '크게 잃는 길'), h('span', {}, h('i', {class: 'l-dm'}), '흰 눈금 = 365곳 가운데값')));
    box.append(h('p', {class: 'small', text: `방향마다 지난 날들에서 20일을 뽑아 ${S.paths.toLocaleString('ko-KR')}번 — 번 길 = 사고팔 돈 0.3% 빼고 남음 · 크게 잃는 길 = −15% 밑 · 어느 방향이 올지는 모릅니다`}));
    const status = k.rank ? `셈 차례: 36곳 가운데 ${k.rank}번째(번 길 4방향 평균 ${r1(k.avg).toFixed(1)}%)` : k.cut ? `지움 — 가장 나쁜 방향에서 크게 잃는 길(${r1(k.worst).toFixed(1)}%)이 큰 3분의 1에 들었습니다` : `남았지만 36곳 밖 — 번 길 4방향 평균 ${r1(k.avg).toFixed(1)}%`;
    box.append(h('p', {class: 'small'}, h('b', {text: status}), ' — 셈 차례일 뿐, 좋은 회사로 매긴 것이 아닙니다.'));
  }
  v.append(box);
  // 확인표(옛 「사기 전에 볼 것」 · 멍거팀) — 기록으로 채울 수 있는 것만 · 「·」 기록 · 「!」 조심 · 「?」 모름(클로드팀: ✓ 는 「좋음」으로 읽혀 「·」로)
  const f = c.fin, fk = f ? (f.key === 'net' ? '순이익' : '영업이익') : '이익';
  const rec = f && f.av != null ? (f.bv > f.av ? 'ok' : 'no') : 'q';
  const li = (m, ...kids) => h('li', {}, h('span', {class: 'm ' + m, 'aria-hidden': 'true', text: m === 'ok' ? '·' : m === 'no' ? '!' : '?'}), h('span', {}, h('span', {class: 'sr', text: m === 'ok' ? '기록: ' : m === 'no' ? '조심: ' : '모름: '}), ...kids));
  const chk = h('ul', {class: 'chk'},
    li(rec, h('b', {text: '번 돈(기록) '}), f && f.av != null ? `${fk} ${fy(f.a)} ${eok(f.av)} → ${fy(f.b)} ${eok(f.bv)} · ${f.bv > f.av ? '늘었음' : '줄었음'}` : h('span', {class: 'q', text: '? 두 해 기록이 없음'})),
    li(c.mdd1y != null && c.mdd1y <= -50 ? 'no' : 'ok', h('b', {text: '지나온 1년 '}), '1년 ', pctEl(c.r1y, 'span'), ' · 1년 안 가장 깊이 빠짐 ', pctEl(c.mdd1y, 'span'),
      (() => { const dd = D.days?.dates; if (!dd) return null; const j1 = (co?.jumps || []).filter(j => j[0] >= dd[Math.max(0, dd.length - 253)]); return j1.length ? h('span', {class: 'q', text: ` · ? 하루에 30% 넘게 바뀐 날 ${j1.length}번(4단) — 주식 수가 바뀐 날이면 이 숫자는 틀릴 수 있음`}) : null; })()),
    li(c.per != null ? 'ok' : 'q', h('b', {text: '몸값 '}), `시가총액 ${eok(c.cap)}`, c.per != null ? ` · 1년 순이익의 ${r1(c.per).toFixed(1)}배(365곳 가운데값 ${r1(C.facts.perMedian).toFixed(1)}배)` : h('span', {class: 'q', text: ' · 순이익 몇 배인지 ? 자료 없음'})),
    li('ok', h('b', {text: '1주 값 '}), `${won(c.price)}(${md(c.priceDate || C.asOf)} 종가) — 한 주의 값일 뿐, 싸고 비쌈이 아닙니다`),
    li(g.low.below / g.n >= 0.8 ? 'no' : 'ok', h('b', {text: '쏠림 '}), `같은 갈래 ${g.n}곳 중 ${g.low.below}곳이 ${md(C.dates[g.low.k])}에 함께 ${md(C.base)}보다 아래`),
    li('q', h('b', {text: '파는 것 '}), c.products ? `${c.products.split(',').slice(0, 2).join(',').trim()} — 한 줄로 말할 수 있나요?` : h('span', {class: 'q', text: '? 자료 없음 — 한 줄로 말할 수 있나요?'})),
    li('q', h('b', {text: '거래정지 · 관리종목 '}), h('span', {class: 'q', text: '? 확인 못 함'}), ' — 아래 「확인할 것」'));
  v.append(h('div', {class: 'box'}, h('h2', {text: '확인표 — 기록 · 조심 · 모름'}), h('p', {class: 'small', text: '· 기록  ! 조심  ? 모름'}), chk));
  // 지켜볼 날(CIA팀) — 무엇이 나오면 생각을 바꾸나 · 봉인 줄(3단에서 옮김)
  const watch = h('ul', {class: 'chk'},
    h('li', {}, h('span', {class: 'm ok', 'aria-hidden': 'true', text: '·'}), h('span', {class: 'nxw'}, h('b', {text: '다음 회차 '}), '?')),
    h('li', {}, h('span', {class: 'm ok', 'aria-hidden': 'true', text: '·'}), h('span', {}, h('b', {text: '3분기 실적 '}), '11월 중순까지(DART) — 올해 매출이 6단 점선(증권사 평균치 · 남의 짐작) 쪽으로 가는지')),
    h('li', {}, h('span', {class: 'm ok', 'aria-hidden': 'true', text: '·'}), h('span', {}, h('b', {text: '2027년 결산 '}), '결산 뒤 90일 안 사업보고서 — 6단 「1년 뒤」 범위가 맞았는지 처음 맞대 볼 때')));
  if (C.mcEnd) watch.insertBefore(h('li', {}, h('span', {class: 'm ok', 'aria-hidden': 'true', text: '·'}), h('span', {}, h('b', {text: '한 달 범위 맞대 볼 날 '}), `${ymd(C.mcEnd)} 종가 — 위 막대(${md(K.asOf)}에서 ${S.horizon}거래일 뒤)가 맞았는지 처음 볼 날`)), watch.children[1]); // CIA팀 2026-10-12
  const capLi = h('li', {}, h('span', {class: 'm q', 'aria-hidden': 'true', text: '?'}), h('span', {}, h('b', {text: '봉인 '}), '여는 중…'));
  watch.append(capLi);
  v.append(h('div', {class: 'box'}, h('h2', {text: '지켜볼 날 — 무엇이 나오면 생각이 바뀌나요?'}), watch));
  needUpd().then(() => { const el = watch.querySelector('.nxw'); if (el && D.upd?.slots?.length) el.replaceChildren(h('b', {text: '다음 회차 '}), h('span', {class: 'num', text: nextSlot(D.upd.slots)}), '(서울) — 새 종가가 있으면 365곳 · 범위를 다시 셉니다'); }).catch(() => {});
  const capSet = (m, ...kids) => { capLi.replaceChildren(h('span', {class: 'm ' + m, 'aria-hidden': 'true', text: m === 'ok' ? '·' : '?'}), h('span', {}, h('b', {text: '봉인 '}), ...kids)); };
  if (C.time) needTime().then(() => { const Kc = D.time.capsules?.[0], m = Kc?.members.find(x => x[0] === code);
    if (!Kc) capSet('q', '? 봉인 자료를 못 읽었습니다');
    else if (m) capSet('ok', `${Kc.id}호에 든 회사 — ${md(Kc.seal)} 종가 ${won(m[1])} 그대로 잠금 · 3년 뒤 ${ymd(Kc.opens[0].date)}에 다시 셉니다 `, h('b', {class: 'num dd', text: ddayText(Kc.opens[0].date)}), ' · ', h('a', {class: 'inl', href: '#/time', text: '봉인 보기'}));
    else capSet('ok', `${Kc.id}호(${md(Kc.seal)} 365곳)에는 없는 회사 — 그 뒤 회차에서 새로 든 곳입니다 · `, h('a', {class: 'inl', href: '#/time', text: '봉인 보기'})); }).catch(() => capSet('q', '? 봉인 자료를 못 읽었습니다'));
  else capSet('q', '? 봉인 자료가 없습니다');
  // 확인할 것(CIA팀) — 어디서 · 언제
  const more = h('details', {class: 'more'}, h('summary', {text: '확인할 것 — 어디서 · 언제'}), h('div', {class: 'in'}, h('ol', {},
    h('li', {}, '거래정지 · 관리종목 · 투자경고: ', h('a', {href: 'https://kind.krx.co.kr', rel: 'noopener', target: '_blank', text: 'KIND(한국거래소)'}), ' — ATLAS 는 아직 이 표시를 거르지 못합니다(?).'),
    h('li', {}, '3분기 실제 이익: ', h('a', {href: 'https://dart.fss.or.kr', rel: 'noopener', target: '_blank', text: 'DART(전자공시)'}), ' 분기보고서 — 11월 중순까지. 증권사 짐작과 견줘 보세요.'),
    h('li', {}, '주식 수 바뀜(쪼개기 · 증자): DART 주요사항보고서 — ', C.facts.jumpN ? `${C.days}거래일 선이 하루 30% 넘게 튄 곳 ${C.facts.jumpN}곳(? 확인 못 함).` : `${C.days}거래일 선이 하루 30% 넘게 튄 곳은 없었습니다.`),
    h('li', {text: `업종 「대세」가 이어지는지: 1단 · 2단 줄 아래 방향 · 세기 · 힘 — 날마다 새 종가로 다시 셉니다. 365곳은 회차마다(하루 4번) 그날까지 ${C.rules.pickWin.days}거래일로 다시 고릅니다 — 들고 난 곳은 「업데이트」 탭에 남습니다.`}))));
  v.append(more);
  v.append(h('p', {class: 'links2'}, h('a', {href: '#/c/' + code, text: '3단 회사로'}), h('a', {href: '#/', text: '처음 화면으로'})));
  v.append(foot());
}

// ── 5단 누구와 다투나 · 6단 앞으로 클까?(사장님 2026-10-11 16:51 「그 회사들이 경쟁 회사가 어떻게 되고 있는데 … 독점 회사면 독보적으로 끌 것이다 … 경쟁이 많아가지고 좀 그럴 것이다 …
//    상식적인 얘기로 미래 추론을 해라 … 주가를 … 하라는 얘기가 아니라 회사의 성장을 얘기 하란 얘기야 … 담백하게」 · 16:56 「3번」 365곳 모두 · 16:57 「이건 봉인하지마」)
//    7단(2026-10-12 00:50 「5단계 클릭이잖아 7단계로 한다」 · 네 팀): 한 화면에 몰렸던 것을 둘로 — 5단 = 경쟁(판의 모양 · 경쟁 회사 · 업종 안 매출 · 파는 것) → 6단 = 클까?(범위 · 말 등급 · 무너질 조건 · 근거)
//    회사 크기(매출 · 2025년 = 1)만 · 주가 숫자 없음 · 숫자 = 구글팀(grow.py) · 경쟁 회사 · 기사 = 애플팀 · 반대편 · 범위 = 클로드팀 · 말 등급 = 범위에서 셈(grow.py grade)
const HZ = [['1', 2027], ['3', 2029], ['5', 2031], ['10', 2036]];
const xMul = m => (m == null ? '?' : (Math.round(m * 10 + 1e-9) / 10).toFixed(1) + '배');
const GTONE = {'아주 높다': 'g5', '높다': 'g4', '반반': 'g3', '낮다': 'g2', '아주 낮다': 'g1'};
const SHAPE_SAY = {'혼자 앞섬': '사실상 혼자 앞서 있습니다. 이런 회사는 남보다 높은 이익이 천천히 줄어듭니다.', '몇 곳이 나눔': '큰 회사 몇 곳이 나눠 가진 판입니다.', '다투는 곳이 많음': '비슷한 회사가 많아 값 싸움이 흔한 판입니다. 남보다 높은 이익은 빨리 줄어듭니다.', '새로 생기는 판': '시장이 막 생겨 순서가 아직 정해지지 않았습니다.'};
async function viewRivals(v, code) {
  await needComp();
  const c = D.comp[code];
  if (!c) return viewMissing(v, code);
  const co = await needCo(code), G = co.grow, S = G?.story, i = ind(c.i), g = gById(c.g);
  v.append(stepsCo(5, code, g, i));
  v.append(h('div', {class: 'co-head'}, h('h1', {text: c.name + ' — 누구와 다투나?'}), h('small', {text: '판의 모양 · 경쟁 회사 · 같은 업종 안 크기 — 주가는 보지 않습니다'})));
  if (!G) { v.append(h('p', {class: 'q', text: '? 이 회사의 성장 자료를 못 읽었습니다'}), foot()); return; }
  v.append(peerBars(c, G, code)); // 그림 한 장 — 우리나라 상장 같은 업종 안 매출 막대(위 다섯 곳 + 이 회사)
  const nx6 = () => nextStep(`#/c/${code}/grow`, '6단 앞으로 클까?', '1 · 3 · 5 · 10년 뒤 회사 크기(매출) — 주가 아님');
  v.append(nx6()); // 다음 단 단추를 첫 화면 가까이(애플팀 2026-10-12)
  const box = h('div', {class: 'box'}, h('h2', {text: '판의 모양 · 경쟁 회사'}));
  if (S) {
    box.append(h('p', {}, h('b', {class: 'shape', text: S.shape}), ' — ', SHAPE_SAY[S.shape] || ''));
    if (S.rivals?.length) box.append(h('ul', {class: 'riv'}, ...S.rivals.map(r => h('li', {}, h('b', {text: r.name}), h('span', {class: 'w', text: ` · ${r.where || '?'}`}), r.note ? h('span', {text: ` — ${r.note}`}) : null,
      ' ', r.url ? h('a', {href: r.url, target: '_blank', rel: 'noopener noreferrer', text: '기사'}) // 띄어쓰기는 고리 밖(애플팀: 「다툼기사」로 붙던 것)
        : r.chk && r.chk.v === '기사로 확인' && r.chk.url ? h('a', {href: r.chk.url, target: '_blank', rel: 'noopener noreferrer', text: '따로 확인한 글'})
          : h('span', {class: 'w', text: r.chk ? `(따로 찾아봄 · ${r.chk.v})` : '(기사 확인 안 함 · 널리 알려진 이름)'})))));
    else box.append(h('p', {class: 'q', text: '? 이름을 댈 만한 경쟁 회사를 못 찾았습니다'}));
  } else box.append(h('p', {class: 'q', text: '? 세 팀 이야기는 아직 없습니다 — 365곳에 새로 든 회사는 사람이 조사해 새 기록 파일로 채웁니다(정해진 날 없음). 지금은 숫자만 보입니다.'}));
  v.append(box);
  if (S && (S.sells || S.why)) { // 무엇을 팔고 누가 사나 — 긴 글(그 시장 · 최근 큰 일)은 접음(구글팀)
    v.append(h('details', {class: 'more'}, h('summary', {text: '무엇을 팔고, 누가 사나요? — 눌러서 보기'}), h('div', {class: 'in'}, S.sells ? h('p', {text: S.sells}) : null, S.why ? h('p', {}, h('b', {text: '손님이 고르는 까닭 · 약점: '}), S.why) : null,
      S.market ? h('p', {}, h('b', {text: '그 시장: '}), S.market) : null, S.events && S.events !== '없음' ? h('p', {}, h('b', {text: '최근 큰 일: '}), S.events) : null))); // 글은 접음(애플팀)
  }
  v.append(nx6(), foot());
}
function peerBars(c, G, code) {
  const I = G.ind, top = G.top || [], inTop = top.some(t => t[2] === code);
  const rows = top.map(([nm, val, cc]) => [nm, val, cc === code]);
  if (!inTop && I.me != null) rows.push([`${c.name}(${I.rank ?? '?'}번째)`, I.me, true]);
  const mx = Math.max(1, ...rows.map(r => r[1] || 0));
  const box = h('div', {class: 'box'}, h('h2', {text: `우리나라 상장 후보 ${D.core.funnel.universe.toLocaleString('ko-KR')}곳 안 「${I.name}」 ${I.n}곳 가운데 매출 ${I.rank ?? '?'}번째`}));
  const ul = h('ul', {class: 'peers', 'aria-label': `같은 업종 ${I.size === 'net' ? '순이익' : '매출'} 막대 — ` + rows.map(r => `${r[0]} ${eok(r[1])}`).join(', ')});
  for (const [nm, val, me] of rows) { const bar = h('i', {class: 'pb' + (me ? ' me' : '')}); bar.style.width = Math.max(2, (val || 0) / mx * 100) + '%';
    ul.append(h('li', {class: me ? 'me' : null}, h('span', {class: 'pn', text: nm}), h('span', {class: 'pt', 'aria-hidden': 'true'}, bar), h('b', {class: 'num', text: eok(val)}))); }
  box.append(ul);
  box.append(h('p', {class: 'small', text: `${I.size === 'net' ? '매출이 없는 업종이라 순이익으로 셉니다 · ' : ''}이 회사 = 이 ${I.n}곳 매출 합의 ${I.share != null ? r1(I.share).toFixed(1) + '%' : '?'}(시장 점유율이 아님) · 매출이 절반 ~ 두 배인 비슷한 크기 ${I.near ?? '?'}곳 · 후보 밖 · 업종이 다르게 묶인 회사 · 나라 밖 경쟁 회사는 이 막대에 없습니다(아래 이름에만).`}));
  box.append(h('p', {class: 'src', text: '네이버 증권 결산 · 10월 10일 모음 · ATLAS 업종으로 셈'}));
  return box;
}
async function viewGrow(v, code) {
  await needComp();
  const C = D.core, c = D.comp[code];
  if (!c) return viewMissing(v, code);
  const co = await needCo(code), G = co.grow, S = G?.story, i = ind(c.i), g = gById(c.g);
  v.append(stepsCo(6, code, g, i));
  v.append(h('div', {class: 'co-head'}, h('h1', {text: c.name + ' — 앞으로 클까?'}), h('small', {text: '회사 크기(매출)만 봅니다 · 주가는 보지 않습니다'})));
  if (!G) { v.append(h('p', {class: 'q', text: '? 이 회사의 성장 자료를 못 읽었습니다'}), foot()); return; }
  // ① 그림 한 장: 지난 매출 · 올해 증권사 평균치(남의 짐작 · CIA팀) · 세 팀이 따져 본 범위(2025년 = 1)
  const host = h('div'); v.append(host);
  const draw = () => growChart(host, c, G); draw(); chartDraw = draw;
  v.append(h('p', {class: 'lkey'}, h('span', {}, h('i', {class: 'l-gact'}), '지난 매출(기록)'), h('span', {}, h('i', {class: 'l-gest'}), '올해 증권사 평균치(남의 짐작)'),
    S ? h('span', {}, h('i', {class: 'l-gband'}), '세 팀이 따져 본 범위 · 가운데') : null, h('span', {}, h('i', {class: 'l-gone'}), `${G.baseYear ?? '?'}년 매출 = 1`)));
  v.append(h('p', {class: 'src', text: `네이버 증권 결산(${G.years.filter(y => !y.endsWith('E')).join(' · ')}) · 올해 증권사 평균치 · 10월 10일 모음`}));
  const next7 = () => nextStep(`#/c/${code}/range`, '7단 범위 · 확인', '여기부터 다시 주가 — 한 달 범위(모형) · 조심할 것 · 모르는 것');
  if (!S) {
    v.append(h('p', {class: 'note'}, h('span', {class: 'q', text: '? '}), '세 팀 이야기는 아직 없습니다 — 365곳에 새로 든 회사는 사람이 조사해 새 기록 파일로 채웁니다(정해진 날 없음). 지금은 숫자만 보입니다.'));
    v.append(growNotes(null), next7(), foot()); return;
  }
  // ② 1 · 3 · 5 · 10년 — 지금의 몇 배쯤 · 더 커져 있을까요?(말 등급)
  // 기준 해를 숨기지 않음(CIA팀 2026-10-12: 「지금의 몇 배」로 읽혀 올해 짐작보다 작은데도 「높다」로 보이던 것) — 2025년 = 1 · 올해 증권사 평균치보다 작으면 그렇다고 적음
  const BY = G.baseYear ?? '?', ek = G.years.findIndex(y => y.endsWith('E')), er = ek >= 0 && G.rev[ek] && G.baseRev ? G.rev[ek] / G.baseRev : null;
  v.append(h('h2', {class: 'sec', text: `1 · 3 · 5 · 10년 뒤 — ${BY}년 매출의 몇 배쯤?`}));
  v.append(h('ol', {class: 'yrs'}, ...HZ.map(([k, y]) => { const x = S.h[k];
    return h('li', {}, h('p', {class: 'yh'}, h('b', {text: `${k}년 뒤`}), ` · ${y}년`),
      x && x.mid != null ? h('p', {class: 'ym'}, h('b', {class: 'num', text: xMul(x.mid) + '쯤'}), h('span', {class: 'num', text: ` (${xMul(x.lo)} ~ ${xMul(x.hi)})`})) : h('p', {class: 'ym'}, h('span', {class: 'q', text: '? 자료 모자람'})),
      x && x.g ? h('p', {class: 'yg'}, `${BY}년보다 커져 있을까요? `, h('b', {class: 'gchip ' + GTONE[x.g], text: x.g})) : null,
      x && x.mid != null && er != null && x.mid < er ? h('p', {class: 'yg'}, h('span', {class: 'q', text: '! '}), `올해 증권사 평균치(${xMul(er)} · 남의 짐작)보다 작게 봄`) : null,
      x && x.t ? h('p', {class: 'yt', text: x.t}) : null); })));
  v.append(next7()); // 다음 단 단추를 카드 바로 밑에도(애플팀)
  // ③ 반대 근거와 아직 모르는 것(펼침) — 무너질 조건 · 못 찾은 것
  const fds = S.facts.map(f => String(f.date || '')).filter(d => /^\d{4}-\d{2}/.test(d)).sort(), newest = fds.at(-1) ?? null; // 근거 기사가 모두 1년 넘었으면 그렇다고(CIA팀)
  const stale = newest != null && newest.slice(0, 7) < String(+C.asOf.slice(0, 4) - 1) + C.asOf.slice(4, 7);
  if (S.brk || (S.unknown && S.unknown !== '없음') || stale || !newest) v.append(h('div', {class: 'box'}, h('h2', {text: '이야기가 틀리게 될 때'}), h('ul', {class: 'chk'},
    S.brk ? h('li', {}, h('span', {class: 'm q', text: '!'}), h('span', {}, h('b', {text: '이런 일이 생기면 이야기가 바뀝니다 '}), S.brk)) : null,
    S.unknown && S.unknown !== '없음' ? h('li', {}, h('span', {class: 'm q', text: '?'}), h('span', {}, h('b', {text: '못 찾은 것 '}), S.unknown)) : null,
    stale ? h('li', {}, h('span', {class: 'm q', text: '?'}), h('span', {}, h('b', {text: '근거가 오래됨 '}), `근거 기사가 모두 1년 넘은 글입니다(가장 새 글 ${newest.slice(0, 4)}년 ${+newest.slice(5, 7)}월) — 그 뒤 일은 반영되지 않았을 수 있습니다.`)) : null,
    !newest ? h('li', {}, h('span', {class: 'm q', text: '?'}), h('span', {}, h('b', {text: '근거 날짜 '}), '근거 기사의 날짜를 모릅니다.')) : null)));
  // ④ 다르게 보면(CIA팀 「바깥에서 보기」 · 치우침 기록 — grow_bias.py)
  const BI = C.grow?.bias, m10 = S.h['10']?.mid;
  if (BI) v.append(h('p', {class: 'alt'}, h('b', {text: '다르게 보면 — '}), `365곳 10년 뒤 가운데 ${xMul(BI.m10)}쯤 · 이 회사 ${m10 != null ? xMul(m10) + '쯤' : '? 자료 모자람'}. 세 팀은 증권사보다 한 해쯤 조심스럽게 봤습니다(2027년 가운데 ÷ 올해 증권사 평균치 = ${BI.cons.toFixed(2)}배 · ${BI.consN}곳 가운데값).`));
  // ⑤ 왜 이렇게 봤나요?(접음 · 애플팀) — 세 팀 한 줄 · 현실 기준선 · 근거 기사(따로 다시 확인 판정이 있으면 함께)
  const T3 = S.teams || {};
  v.append(h('details', {class: 'more'}, h('summary', {text: `왜 이렇게 봤나요? — 세 팀 한 줄 · 근거 기사 ${S.facts.length}개`}), h('div', {class: 'in'},
    h('ul', {class: 'chk'},
      T3.google ? h('li', {}, h('span', {class: 'm ok', text: 'G'}), h('span', {}, h('b', {text: '구글팀(숫자) '}), T3.google)) : null,
      T3.apple ? h('li', {}, h('span', {class: 'm ok', text: 'A'}), h('span', {}, h('b', {text: '애플팀(제품 · 손님) '}), T3.apple)) : null,
      T3.claude ? h('li', {}, h('span', {class: 'm ok', text: 'C'}), h('span', {}, h('b', {text: '클로드팀(반대편) '}), T3.claude)) : null),
    h('p', {text: '현실 기준선 — 빨리 큰 회사가 오래 계속 빨리 크는 일은 드뭅니다. 증권사 평균치도 좋게 나오는 쪽으로 기웁니다(Chan · Karceski · Lakonishok 2003). 다투는 회사가 많으면 남보다 높은 이익은 평균으로 돌아옵니다(Fama · French 2000).'}),
    h('ol', {}, ...S.facts.map(f => h('li', {}, f.text, ' ', h('a', {href: f.url, target: '_blank', rel: 'noopener noreferrer', text: `(${f.date || '날짜 ?'} 글)`}), f.chk ? h('span', {class: 'w', text: ` · 따로 다시 확인: ${f.chk}`}) : null))))));
  v.append(growNotes(S), next7(), foot());
}
function growNotes(S) {
  return h('div', {class: 'note'},
    h('p', {text: S ? `이 이야기는 봉인하지 않습니다 — 쓴 날 ${md(S.made)} · 새 소식이 나오면 고쳐 씁니다. 범위는 「100번 중 80번쯤 이 안」으로 잡은 세 팀의 따짐이며, 맞힘이 아닙니다.` : '세 팀 이야기를 쓰면 같은 자리에 범위와 까닭이 보입니다.'}),
    D.core.grow?.check ? h('p', {text: checkLine(D.core.grow.check)}) : null);
}
function growSummary(Gs) {
  const rows = [...GRADES_ALL.map(gr => [gr, Gs.g10[gr] ?? 0]), ['? 자료 모자람', Gs.g10none ?? 0], ['조사 중', Gs.of - Gs.written]];
  const mx = Math.max(1, ...rows.map(r => r[1]));
  const ul = h('ul', {class: 'gbars', 'aria-label': `10년 뒤 더 커져 있을까요 — ` + rows.map(r => `${r[0]} ${r[1]}곳`).join(', ')});
  for (const [name, n] of rows) { const f = h('i', {class: 'gf'}); f.style.width = (n / mx * 100) + '%'; ul.append(h('li', {}, h('span', {text: name}), h('span', {class: 'gt', 'aria-hidden': 'true'}, f), h('b', {class: 'num', text: n + '곳'}))); }
  return h('section', {class: 'gsum'}, h('h2', {class: 'sec', text: '회사마다 — 앞으로 클까?'}),
    h('p', {text: `세 팀이 365곳 가운데 ${Gs.written}곳을 따졌습니다 — 주가가 아니라 회사 크기(매출)만 봅니다. 10년 뒤 2025년보다 더 커져 있을까요?`}), ul,
    h('p', {class: 'note', text: `판의 모양: 혼자 앞섬 ${Gs.shapes['혼자 앞섬']}곳 · 몇 곳이 나눔 ${Gs.shapes['몇 곳이 나눔']}곳 · 다투는 곳이 많음 ${Gs.shapes['다투는 곳이 많음']}곳 · 새로 생기는 판 ${Gs.shapes['새로 생기는 판']}곳. 회사마다 5단 「누구와 다투나」에서 경쟁 회사를, 6단 「앞으로 클까?」에서 범위와 까닭을 봅니다. 이 이야기는 봉인하지 않습니다.`}),
    Gs.check ? h('p', {class: 'note', text: checkLine(Gs.check)}) : null);
}
const GRADES_ALL = ['아주 높다', '높다', '반반', '낮다', '아주 낮다'];
// 따로 다시 확인(17:56 「예약」 4차) — 판정을 쓰지 않은 다른 팀이 근거 기사를 직접 열어 봄
const checkLine = K => `따로 다시 확인(${md(K.made)}): 근거 기사${D.core.grow?.factN ? ` ${D.core.grow.factN.toLocaleString('ko-KR')}개 가운데` : ''} ${K.facts.n}개를 골라(표본) 다른 팀이 직접 열어 봄 — 맞음 ${K.facts['맞음']} · 일부만 맞음 ${K.facts['일부만 맞음']} · 틀림 ${K.facts['틀림']} · 못 엶 ${K.facts['못 엶']}. 「기사로 못 봄」 경쟁 회사 ${K.rivals.n}곳은 기사로 확인 ${K.rivals['기사로 확인']} · 다른 일을 함 ${K.rivals['다른 일을 함']} · 확인 못 함 ${K.rivals['확인 못 함']}.`;
function growChart(host, c, G) {
  host.textContent = '';
  const wrap = h('div', {class: 'gc'}); host.append(wrap);
  const T = tok(), S = G.story, base = G.baseRev;
  const act = G.years.map((y, k) => [y, G.rev[k]]).filter(([y]) => !y.endsWith('E')), est = G.years.map((y, k) => [y, G.rev[k]]).find(([y]) => y.endsWith('E'));
  const fut = S ? HZ.map(([k, y]) => [k, y, S.h[k]]) : [];
  if (!base) { wrap.append(h('p', {class: 'q', text: '? 마지막 결산 매출이 없어 그림을 못 그립니다'})); return; }
  const slots = [...act.map(([y, val]) => ({lab: y, kind: 'act', v: val / base})), ...(est && est[1] != null ? [{lab: est[0].replace('E', ''), kind: 'est', v: est[1] / base}] : []),
    ...fut.map(([k, y, x]) => ({lab: String(y), kind: 'fut', k, x}))];
  const W = Math.max(260, Math.round(wrap.getBoundingClientRect().width || 320)), H = 230, P = 12, n = slots.length;
  const top = Math.max(1.2, ...slots.map(s => (s.kind === 'fut' ? (s.x?.hi ?? 0) : s.v || 0))) * 1.08;
  const X = j => P + (j + 0.5) * (W - 2 * P) / n, bw = Math.min(34, (W - 2 * P) / n * 0.56), Y = y => H - P - y / top * (H - 2 * P);
  const svg = sv('svg', {viewBox: `0 0 ${W} ${H}`, width: W, height: H, role: 'img', 'aria-label': `${c.name} 매출 길 — ${G.baseYear}년 매출 = 1 · ` +
    slots.map(s => s.kind === 'fut' ? `${s.k}년 뒤(${s.lab}) ${s.x?.mid != null ? xMul(s.x.lo) + '~' + xMul(s.x.hi) + ' 가운데 ' + xMul(s.x.mid) : '자료 모자람'}` : `${s.lab}${s.kind === 'est' ? ' 증권사 평균치' : ''} ${xMul(s.v)}`).join(', ')});
  hairs(svg, W, P, [Y(0)]);
  svg.append(sv('line', {x1: P, x2: W - P, y1: Y(1), y2: Y(1), stroke: T.mute, 'stroke-width': 1}));
  const tipOf = [];
  slots.forEach((s, j) => {
    const x = X(j);
    if (s.kind === 'act') svg.append(sv('rect', {x: x - bw / 2, y: Y(Math.max(0, s.v)), width: bw, height: Math.max(1, Y(0) - Y(Math.max(0, s.v))), rx: 1, fill: T['violet-ink']}));
    else if (s.kind === 'est') svg.append(sv('rect', {x: x - bw / 2 + 1, y: Y(Math.max(0, s.v)), width: bw - 2, height: Math.max(1, Y(0) - Y(Math.max(0, s.v))), rx: 1, fill: 'none', stroke: T['violet-ink'], 'stroke-width': 2, 'stroke-dasharray': '6 4'}));
    else if (s.x && s.x.mid != null) {
      svg.append(sv('rect', {x: x - bw / 2, y: Y(s.x.hi), width: bw, height: Math.max(2, Y(s.x.lo) - Y(s.x.hi)), rx: 1, fill: T.violet, 'fill-opacity': 0.38, stroke: T['violet-ink'], 'stroke-width': 1}));
      svg.append(sv('line', {x1: x - bw / 2 - 3, x2: x + bw / 2 + 3, y1: Y(s.x.mid), y2: Y(s.x.mid), stroke: T.ink, 'stroke-width': 3, 'stroke-linecap': 'butt'}));
    } else svg.append(sv('line', {x1: x - bw / 2, x2: x + bw / 2, y1: Y(1), y2: Y(1), stroke: T.mute, 'stroke-width': 2, 'stroke-dasharray': '2 4'}));
    tipOf.push(s.kind === 'fut' ? `${s.k}년 뒤 ${s.lab}년 · ${s.x?.mid != null ? `${xMul(s.x.lo)} ~ ${xMul(s.x.hi)} · 가운데 ${xMul(s.x.mid)}` : '? 자료 모자람'}` : `${s.lab}년${s.kind === 'est' ? ' 증권사 평균치' : ''} · ${xMul(s.v)}`);
  });
  const cx = sv('line', {y1: P, y2: H - P, stroke: T.ink, 'stroke-opacity': 0.5, 'stroke-width': 1}); cx.setAttribute('visibility', 'hidden'); svg.append(cx);
  wrap.append(svg);
  const yt = h('span', {class: 'yl num', text: xMul(top)}); yt.style.top = '0'; wrap.append(yt); // 「${G.baseYear}년 = 1」 은 그림 밑 표(.lkey)에만(애플팀 2026-10-12: 막대를 가리던 것)
  const tip = h('div', {class: 'tip num'}); tip.hidden = true; wrap.append(tip);
  wrap.append(h('div', {class: 'ax'}, h('span', {text: `${slots[0].lab}년 →`}), h('span', {text: S ? `1 · 3 · 5 · 10년 뒤(${slots[n - 1].lab}년까지)` : `${slots[n - 1].lab}년`})));
  const mv = e => { const r = svg.getBoundingClientRect(), xx = (e.clientX - r.left) * W / r.width; const j = Math.max(0, Math.min(n - 1, Math.floor((xx - P) / ((W - 2 * P) / n))));
    cx.setAttribute('x1', X(j)); cx.setAttribute('x2', X(j)); cx.setAttribute('visibility', 'visible'); tip.hidden = false; tip.textContent = tipOf[j]; tip.style.left = Math.min(r.width - 130, Math.max(130, X(j) * r.width / W)) + 'px'; };
  svg.addEventListener('pointermove', mv); svg.addEventListener('pointerdown', mv); svg.addEventListener('pointerleave', () => { cx.setAttribute('visibility', 'hidden'); tip.hidden = true; });
}

// ── 화면 ⑥ 36곳(사장님 00:15 「몬테카를로 1억 × 4방향 → 소거법 → 36개 · 각 한 주씩」 · 12:41 「하루에 4번」부터 회차마다 새 365곳으로 다시 셈) — 지난 기록 시험을 맨 위에 그대로 ──
async function view36(v) {
  await Promise.all([needPick(), needComp()]);
  const C = D.core, K = D.pick, S = K.spec, B = K.backtest;
  const tell = tellRow(`${md(K.asOf)} 종가 · ${S.horizon}거래일(약 한 달) 뒤를 셈`, null);
  v.append(tell.el, h('h1', {class: 'head', text: `매수 검토 ${K.picks.length}곳 — ${md(K.asOf)} 값`}),
    h('p', {class: 'count', text: `몬테카를로 ${Math.round(S.totalPairs / 1e8)}억 길(찾기 4방향 + 지우기 4방향) · ${K.eligible}곳 셈 → ${K.cutN}곳 지움 → ${K.picks.length}곳`}),
    h('p', {class: 'alt'}, h('b', {text: '모형 가정 아래 추정 · 검증 전'}), ' — 셈으로 추린 목록일 뿐 좋은 회사로 매긴 것이 아닙니다. 아래 지난 기록 시험부터 보세요.')); // 규칙 49(클로드팀 2026-10-12)
  if (B) {
    const box = h('div', {class: 'test'}, h('h2', {text: '먼저 — 지난 기록에서는?'}),
      h('p', {class: 'big', text: `같은 셈을 지난 ${B.n}번에 대입했더니, 36곳이 365곳 평균보다 나았던 때는 ${B.wins}번(${Math.round(B.rate * 100)}%)${B.rate < 0.5 ? '뿐' : ''}입니다.`}),
      h('p', {}, '한 달 평균: 36곳 ', pct2El(B.meanPick, B.meanAll), ' · 365곳 ', pct2El(B.meanAll, B.meanPick), ` — ${B.passes ? '정해 둔 문턱(60% · 두 절반 55% · 우연일 몫 5% 밑)을 넘었습니다. 그래도 지난 기록일 뿐입니다.' : (B.meanPick < B.meanAll ? '아무거나 고른 것보다 못했습니다. ' : '한 달 평균은 나았지만, ') + '정해 둔 문턱(60% · 두 절반 55% · 우연일 몫 5% 밑)을 못 넘어 「통한다」고 할 수 없습니다.'}`));
    box.append(h('p', {class: 'small', text: `시험 기간: ${ymd(B.rows[0].t)} ~ ${ymd(B.rows[B.rows.length - 1].to)} · 한 달(20거래일)씩.` + (B.skipped?.length ? ` 셀 수 없어 뺀 때 ${B.skipped.length}번(${B.skipped.map(ymd).join(' · ')}) — 그때까지 어느 방향 날이 20일이 안 됨(기준대로 뺌).` : '')}));
    const host = h('div', {class: 'bt'}); box.append(host); v.append(box);
    btChart(host, B.rows);
    box.append(h('p', {class: 'small note', text: '막대 하나 = 한 번의 시험(한 달) · 위 빨강 = 36곳이 365곳 평균보다 나음 · 아래 파랑 = 못함.'}));
  }
  v.append(h('div', {class: 'dirs4'}, ...K.dirs.map(d => h('div', {}, h('b', {text: d.name}), h('span', {text: `지난 ${K.window.days}거래일 가운데 ${d.days}일`})))));
  { const up = K.dirs.find(d => d.id === 'up')?.days ?? 0, dn = K.dirs.find(d => d.id === 'down')?.days ?? 0;
    v.append(h('p', {class: 'note', text: `「4방향」 = 시장이 갈 방향 넷. 어느 쪽이 올지는 모른다고 보고 넷을 같은 무게로 셌습니다. 36곳은 셈으로 추린 목록일 뿐 좋은 회사로 매긴 것이 아닙니다.` + (up > dn * 2 ? ` 지난 ${K.window.days}거래일은 오르는 장(${up}일)이 내리는 장(${dn}일)보다 훨씬 많았습니다.` : '')})); }
  const ol = h('ol', {class: 'p36'});
  for (const p of K.picks) { const c = D.comp[p.code];
    ol.append(h('li', {}, h('a', {href: '#/c/' + p.code}, h('span', {class: 'no num', text: p.rank}), h('span', {class: 'nm', text: p.name}), h('b', {class: 'val num', text: '번 길 ' + r1(p.avg).toFixed(1) + '%'}),
      h('span', {class: 'g2', text: `${p.i} · 1주 ${won(p.price)} · 크게 잃는 길 ${r1(p.worst).toFixed(1)}%(가장 나쁜 방향) · ${D.core.days}거래일 ${c ? pct(c.chg) : '? 지금 365곳 밖'}`})))); }
  v.append(h('h2', {class: 'sec', text: `${K.picks.length}곳 — 번 길 많은 순`}), h('p', {text: `번 길 = ${S.horizon}거래일 뒤 사고팔 돈(0.3%)을 빼고도 남은 길의 몫 · 4방향 평균`}), ol);
  v.append(h('div', {class: 'alt'}, `${K.picks.length}곳을 1주씩이면 합계 `, h('b', {class: 'num', text: won(K.total)}), ` — ${md(K.asOf)} 값으로 셈 · 사는 날 값은 다르고, 사고파는 데 드는 돈은 넣지 않았습니다.`));
  v.append(h('details', {class: 'more'}, h('summary', {text: '어떻게 셌나요 — 돌리기 전에 정한 기준'}), h('div', {class: 'in'}, h('ul', {},
    h('li', {text: `방향: 날마다 그날로 끝나는 20거래일 시장(365곳 같은 무게)으로 가름 — 흔들림이 위 25%면 크게 출렁이는 장, 아니면 +3% 넘게 오름 · −3% 넘게 내림 · 그 사이`}),
    h('li', {text: `길: 그 방향 날들에서 20일을 뽑아 365곳에 똑같이 적용(함께 움직임을 지킴) · 방향마다 ${S.paths.toLocaleString('ko-KR')}길 × 365곳 = 약 1억`}),
    h('li', {text: `찾기: 번 길의 몫(사고팔 돈 0.3% 빼고) · 지우기: 다른 난수로 다시 돌려 −15% 넘게 잃는 길의 몫이 가장 나쁜 방향에서 큰 순으로 3분의 1`}),
    h('li', {text: `고르기: 남은 곳에서 번 길 많은 순 · 한 업종 ${S.perIndustry}곳까지 · 기준을 먼저 적어 둔 기록(커밋 ${S.specCommit ?? '73f94cca'} · ${S.version})`}),
    h('li', {text: '지난 기록 시험: 2024년 7월부터 한 달(20거래일)마다 그날까지 자료로만 같은 셈(길은 방향마다 1천만) → 한 달 뒤 값으로 채점'}),
    h('li', {text: `한계: 365곳은 ${md(C.rules.pickWin.to)}까지 ${C.rules.pickWin.days}거래일 「대세」 업종으로 고른 곳이라 이미 오른 회사가 많고, 지난 기록 시험도 그 365곳 안에서만 했습니다. 모형 가정 아래 셈일 뿐 앞날 값이 아닙니다.`})))));
  v.append(foot());
}
function btChart(host, rows) {
  const W = Math.max(260, Math.round(host.getBoundingClientRect().width || 320)), Hh = 150, P = 8, n = rows.length;
  const ex = rows.map(r => r.pick - r.all), M = Math.max(1, ...ex.map(Math.abs)) * 1.1;
  const bw = (W - 2 * P) / n, Y = x => Hh / 2 - x / M * (Hh / 2 - P);
  const svg = sv('svg', {viewBox: `0 0 ${W} ${Hh}`, width: W, height: Hh, role: 'img', 'aria-label': `지난 ${n}번 시험 — 36곳이 365곳 평균보다 나은 때 ${ex.filter(x => x > 0).length}번`});
  const T = tok();
  hairs(svg, W, P, [P, Hh - P]);
  ex.forEach((x, k) => { const y0 = Y(0), y1 = Y(x); svg.append(sv('rect', {x: (P + k * bw + bw * 0.15).toFixed(1), y: Math.min(y0, y1).toFixed(1), width: (bw * 0.7).toFixed(1), height: Math.max(1, Math.abs(y1 - y0)).toFixed(1), rx: 1, fill: x > 0 ? T.up : T.down})); });
  svg.append(sv('line', {x1: P, x2: W - P, y1: Y(0), y2: Y(0), stroke: T.mute, 'stroke-width': 1}));
  host.append(svg);
  host.append(h('div', {class: 'ax'}, h('span', {text: ymd(rows[0].t)}), h('span', {text: ymd(rows[n - 1].t)})));
  const tip = h('div', {class: 'tip num'}); tip.hidden = true; host.append(tip);
  const mv = e => { const r = svg.getBoundingClientRect(); let k = Math.floor(((e.clientX - r.left) * W / r.width - P) / bw); k = Math.max(0, Math.min(n - 1, k)); const q = rows[k];
    tip.hidden = false; tip.textContent = `${md(q.t)} · 36곳 ${pct(q.pick)} · 365곳 ${pct(q.all)}`; tip.style.left = Math.min(r.width - 120, Math.max(120, (P + (k + 0.5) * bw) * r.width / W)) + 'px'; };
  svg.addEventListener('pointermove', mv); svg.addEventListener('pointerdown', mv); svg.addEventListener('pointerleave', () => { tip.hidden = true; });
}

// ── 화면 ⑦ 업데이트(사장님 2026-10-11 12:41 「업데이트는 하루에 4번 해야 하고 업데이트 탭 만들어서 기록해놓아라」) ──
//   회차마다 한 줄 — 언제 · 어느 회차 · 결과(바꿈 · 그대로 · 실패) · 고른 날 · 기준일 · 새로 든 곳 · 빠진 곳 · 층 · 1등 갈래 · 그림 = 회차마다 들고 난 수
const DOW = ['일', '월', '화', '수', '목', '금', '토'];
const kstLabel = k => { const d = new Date(k.slice(0, 10) + 'T00:00:00Z'); return `${md(k.slice(0, 10))}(${DOW[d.getUTCDay()]}) ${k.slice(11, 16)}`; };
const RES_WORD = {'바꿈': '바꿈', '그대로': '그대로 — 새 값 없음', '실패': '실패'};
function namesLine(list, max = 6) { return list.slice(0, max).map(x => x.n).join(' · ') + (list.length > max ? ` 외 ${list.length - max}곳` : ''); }
const manText = n => (n >= 1e4 && n % 1e4 === 0 ? (n / 1e4).toLocaleString('ko-KR') + '만' : Number(n).toLocaleString('ko-KR')); // 10000000 → 1,000만
/** 네 눈 점검 한 줄(사장님 2026-10-12 12:41 「업데이트 할때마다 아틀란스 점검을 애플 구글 클로드 cia방식으로 각각 1000만번씩」) */
const inspectLine = (I, all) => `네 눈 점검(눈마다 ${manText(I.nEach)} 번) — ` + (all || I.fail ? I.lenses.filter(l => all || l.fail).map(l => `${l.name} ${l.fail ? '걸림 ' + l.fail.toLocaleString('ko-KR') + '건' : '이상 없음'}`).join(' · ') : '모두 이상 없음');
async function viewUpdates(v) {
  await needUpd();
  const U = D.upd, R = U.records, last = R[0];
  const tell = tellRow(`하루 4번 · ${U.slots.join(' · ')}(서울)`, null);
  v.append(tell.el, h('h1', {class: 'head', text: '업데이트 기록 — 하루 4번'}),
    h('p', {class: 'count', text: last ? `마지막 ${kstLabel(last.kst)} · ${RES_WORD[last.result] ?? last.result}` + (last.asOf ? ` · 고른 날 ${md(last.asOf)}` : '') : '아직 기록이 없습니다.'}));
  v.append(h('p', {class: 'note', text: '회차마다 그날까지 값으로 365곳을 다시 고릅니다(뽑는 규칙은 그대로). 기준일은 늘 고른 날의 20거래일 전입니다. 회차마다 시장을 읽어 적고, 애플 · 구글 · 클로드 · CIA 네 눈으로 각각 1,000만 번 점검합니다 — 하나라도 걸리면 새 자료를 올리지 않습니다. 기록은 지우지 않습니다.'}));
  // 시장 판독(사장님 2026-10-12 12:41 「시장을 판독해서」) — 마지막 회차가 올린 자료로 · 지난 사실만(규칙 49 · 판독 규칙 mr-v1 = market_read.mjs)
  if (last?.market?.lines?.length) v.append(h('div', {class: 'alt mread'}, h('p', {}, h('b', {text: '지금 시장 판독'}), ' — 지난 값만 · 앞날 맞히기 아님'), h('ul', {}, ...last.market.lines.map(t => h('li', {text: t})))));
  if (last?.inspect) v.append(h('p', {class: last.inspect.fail ? 'q' : 'note'}, (last.inspect.fail ? '? ' : '') + inspectLine(last.inspect, true)));
  { const k = new Date(Date.now() + 9 * 36e5), m = k.getUTCHours() * 60 + k.getUTCMinutes(), nx = U.slots.find(x => +x.slice(0, 2) * 60 + +x.slice(3, 5) > m) ?? U.slots[0];
    v.append(h('p', {class: 'note nx'}, MO.parrot(34), h('span', {}, '다음 회차 ', h('b', {class: 'num', text: nx}), `(서울${U.slots.indexOf(nx) === 0 && +nx.slice(0, 2) * 60 + +nx.slice(3, 5) <= m ? ' · 내일' : ''}) — 새 종가가 있으면 365곳과 봉인 뒤 값을 그때 다시 셉니다.`))); } // 앵무새 막비가 다음 회차를 알림 — 글은 한 덩어리로 옆에서 흐름
  const host = h('div', {class: 'upchart'}); v.append(host); upChart(host, R.slice(0, 28).reverse());
  v.append(h('p', {class: 'lkey'}, h('span', {}, h('i', {class: 'l-in'}), '새로 든 곳'), h('span', {}, h('i', {class: 'l-out'}), '빠진 곳'), h('span', {text: '막대 하나 = 회차 하나 · 오른쪽이 최근'})));
  const ol = h('ol', {class: 'uplist'});
  for (const r of R) {
    const li = h('li', {class: 'r-' + ({'바꿈': 'ch', '그대로': 'same', '실패': 'fail'}[r.result] ?? 'same')});
    li.append(h('p', {class: 'uh'}, h('b', {text: kstLabel(r.kst)}), ` · ${r.slot ? r.slot + ' 회차' : '그 밖 올림'} `, h('span', {class: 'chip res', text: RES_WORD[r.result] ?? r.result})));
    if (!r.slot && r.reason) li.append(h('p', {class: 'small', text: r.reason}));
    if (r.asOf) li.append(h('p', {text: `고른 날 ${md(r.asOf)}${r.provisional ? '(그날 저녁 8시 전 값 — 아직 바뀜)' : ''} · 기준일 ${md(r.base)}` + (r.tiers ? ` · 1층 ${r.tiers[0]} · 2층 ${r.tiers[1]} · 3층 ${r.tiers[2]}` : '')}));
    if (r.in?.length || r.out?.length) {
      li.append(h('p', {}, h('b', {class: 'ni', text: `새로 든 곳 ${r.in.length}`}), r.in.length ? ' ' + namesLine(r.in) : ''));
      li.append(h('p', {}, h('b', {class: 'no2', text: `빠진 곳 ${r.out.length}`}), r.out.length ? ' ' + namesLine(r.out) : ''));
      if (r.in.length > 6 || r.out.length > 6) li.append(h('details', {class: 'more'}, h('summary', {text: '모두 보기'}), h('div', {class: 'in'}, h('p', {text: '새로 든 곳: ' + r.in.map(x => x.n).join(' · ')}), h('p', {text: '빠진 곳: ' + r.out.map(x => x.n).join(' · ')}))));
    } else if (r.result !== '실패') li.append(h('p', {text: '365곳은 앞 회차와 같습니다.'}));
    if (r.top?.short) li.append(h('p', {}, `1등 갈래 ${r.top.short} `, pctEl(r.top.chg, 'span'), ' · 365곳 ', pctEl(r.all?.chg, 'span'), ` · 20거래일`));
    if (r.market?.day) li.append(h('p', {class: 'small', text: `시장 판독 — 하루 ${r.market.day.up}곳 오름 · ${r.market.day.down}곳 내림(${r.market.day.word}) · ${r.market.size}`}));
    if (r.inspect) li.append(h('p', {class: r.inspect.fail ? 'q' : 'small', text: (r.inspect.fail ? '? ' : '') + inspectLine(r.inspect, false)}));
    if (r.result === '실패' || (r.result === '그대로' && !r.asOf)) li.append(h('p', {class: r.result === '실패' ? 'q' : 'small', text: (r.result === '실패' ? '? ' : '') + (r.why ?? '')}));
    ol.append(li);
  }
  v.append(h('h2', {class: 'sec', text: `회차 ${U.n}번 가운데 최근 ${R.length}번`}), ol);
  v.append(foot());
}
function upChart(host, rows) {
  const W = Math.max(260, Math.round(host.getBoundingClientRect().width || 320)), Hh = 132, P = 8, n = Math.max(rows.length, 1);
  const M = Math.max(4, ...rows.flatMap(r => [r.in?.length ?? 0, r.out?.length ?? 0])) * 1.15, bw = Math.min((W - 2 * P) / n, 36), x0 = W - P - n * bw, Y0 = Hh / 2, sc = (Hh / 2 - P) / M; // 오른쪽이 최근 · 막대 폭은 36 까지
  const svg = sv('svg', {viewBox: `0 0 ${W} ${Hh}`, width: W, height: Hh, role: 'img', 'aria-label': `최근 ${rows.length}회차 — 새로 든 곳 ${rows.reduce((t, r) => t + (r.in?.length ?? 0), 0)} · 빠진 곳 ${rows.reduce((t, r) => t + (r.out?.length ?? 0), 0)}`});
  const T = tok();
  hairs(svg, W, P, [P, Hh - P]);
  svg.append(sv('line', {x1: P, x2: W - P, y1: Y0, y2: Y0, stroke: T.mute, 'stroke-width': 1}));
  rows.forEach((r, k) => {
    const x = x0 + k * bw + bw * 0.18, w = Math.max(2, bw * 0.64), a = (r.in?.length ?? 0) * sc, b = (r.out?.length ?? 0) * sc;
    if (r.result === '실패') svg.append(sv('rect', {x: x.toFixed(1), y: (Y0 - 7).toFixed(1), width: w.toFixed(1), height: 14, rx: 1, fill: 'none', stroke: T.gold, 'stroke-width': 1.5}));
    else if (!a && !b) svg.append(sv('circle', {cx: (x + w / 2).toFixed(1), cy: Y0, r: 3, fill: T.mute}));
    if (a) svg.append(sv('rect', {x: x.toFixed(1), y: (Y0 - a).toFixed(1), width: w.toFixed(1), height: a.toFixed(1), rx: 1, fill: T.violet}));
    if (b) svg.append(sv('rect', {x: x.toFixed(1), y: Y0, width: w.toFixed(1), height: b.toFixed(1), rx: 1, fill: T['violet-ink']}));
  });
  host.append(svg);
  if (rows.length > 1) host.append(h('div', {class: 'ax'}, h('span', {text: kstLabel(rows[0].kst)}), h('span', {text: kstLabel(rows[rows.length - 1].kst)})));
  else if (rows.length) host.append(h('div', {class: 'ax'}, h('span', {}), h('span', {text: kstLabel(rows[0].kst)})));
}

// ── 영상 친구들(사장님 2026-10-11 16:29 「곳곳에 영상에 있는 고양이 무지개 앵무새 꽃 무지개 우주서 하트 이런것들 있잖아 공주님은 절대 넣지 말고 곳곳에 잘어울리게 먼저 배치해봐 구글팀 클로드팀 애플팀이라면 어떻게 배치할것인지 기획한다음 해」) ──
//   소개 영상(공주님 1분 영상)의 친구들을 판판한 작은 그림으로 — 주황 아기 고양이 · 하얀 고양이 · 앵무새 막비(갈라 — 분홍 몸 · 회색 날개) · 무지개 · 웃는 달 · 별 · 우주 고래 · 꽃 · 하트 · 나비
//   공주님은 그리지 않음 · 그림 파일 없이 코드로(가벼움) · 모두 화면 읽기에서 숨김(aria-hidden) · 입체 · 그림자 · 빛 없음(규칙 50) · 빨강 · 파랑은 쓰지 않음(규칙 53 — 오름 · 내림 색과 헷갈리지 않게)
//   클로드팀: 숫자 · 회사 · 그림(차트) · 조심 상자 옆에는 두지 않음(「좋다」로 읽히지 않게 — site_check 「꾸밈 자리」가 잼) · 애플팀: 뜻 있는 자리에 작게 · 구글팀: 한 벌(같은 색 · 같은 굵기)
const MOC = {pink: '#F2A7D6', galah: '#EFA6D2', crest: '#F9D6E4', lav: '#C9B6F2', lavD: '#A893E0', yellow: '#F6D97A', yellowD: '#8A6A2A', white: '#F6F3FF', whiteL: '#CFC6EE',
  orange: '#F2A65A', orangeD: '#C9761F', grey: '#ABA8BE', mint: '#9EDDB4', peach: '#F9C48F', whale: '#B4A4EE', whaleL: '#DCD3FA', whaleD: '#9887DD', eye: '#3A2F5A', cheek: '#F6BCDD', beak: '#EDE7F2'};
// 색 — 빨강 · 파랑은 오름 · 내림에만(규칙 53): 분홍은 자홍 쪽(OKLab 색상 340°대) · 고래는 연보라 · 무지개에 파랑 띠 없음 — site_check 「영상 친구」가 색상 25° 안을 잼
function moSvg(name, w, hgt, vb, ...kids) { const s = sv('svg', {class: 'mo mo-' + name, viewBox: vb, width: w, height: hgt, 'aria-hidden': 'true', focusable: 'false'}); s.append(...kids.flat().filter(Boolean)); return s; }
const moLine = (d, color, wd = 2) => sv('path', {d, fill: 'none', stroke: color, 'stroke-width': wd, 'stroke-linecap': 'round', 'stroke-linejoin': 'round'});
const starD = (cx, cy, R, r) => { let d = ''; for (let k = 0; k < 10; k++) { const a = -Math.PI / 2 + k * Math.PI / 5, q = k % 2 ? r : R; d += (k ? 'L' : 'M') + (cx + q * Math.cos(a)).toFixed(1) + ' ' + (cy + q * Math.sin(a)).toFixed(1); } return d + 'Z'; };
const MO = {
  heart: (z = 18) => moSvg('heart', z, z, '0 0 48 48', sv('path', {d: 'M24 41C10 31 4 23 4 15.5 4 9.5 8.8 5 14.5 5c4 0 7.5 2.2 9.5 5.5C26 7.2 29.5 5 33.5 5 39.2 5 44 9.5 44 15.5 44 23 38 31 24 41Z', fill: MOC.pink})),
  star: (z = 22) => moSvg('star', z, z, '0 0 48 48', sv('path', {d: starD(24, 25, 19, 8.5), fill: MOC.yellow, stroke: MOC.yellow, 'stroke-width': 4, 'stroke-linejoin': 'round'})),
  moon: (z = 24) => moSvg('moon', z, z, '0 0 48 48', sv('circle', {cx: 24, cy: 24, r: 19, fill: MOC.yellow}), moLine('M15.5 22.5q2.8 2.6 5.6 0', MOC.yellowD, 2.2), moLine('M26.9 22.5q2.8 2.6 5.6 0', MOC.yellowD, 2.2),
    moLine('M20 29.5q4 3.4 8 0', MOC.yellowD, 2), sv('circle', {cx: 14, cy: 27.5, r: 2.6, fill: MOC.cheek}), sv('circle', {cx: 34, cy: 27.5, r: 2.6, fill: MOC.cheek})),
  daisy: (z = 22) => moSvg('daisy', z, z, '0 0 48 48', [0, 45, 90, 135, 180, 225, 270, 315].map(a => sv('ellipse', {cx: 24, cy: 11.5, rx: 5.4, ry: 9.5, fill: MOC.white, transform: `rotate(${a} 24 24)`})), sv('circle', {cx: 24, cy: 24, r: 6.8, fill: MOC.yellow})),
  tulip: (z = 24) => moSvg('tulip', z * 0.75, z, '0 0 36 48', moLine('M18 46V24', MOC.mint, 3), sv('path', {d: 'M18 38q-8-2-10-10 8 1 10 8Z', fill: MOC.mint}), sv('path', {d: 'M8 10q2 15 10 15t10-15l-5 4-5-7-5 7Z', fill: MOC.galah})),
  cat: (kind = 'orange', z = 40) => { const b = kind === 'orange' ? MOC.orange : MOC.white, line = kind === 'orange' ? null : MOC.whiteL;
    return moSvg('cat', z * 0.85, z, '0 0 40 47', moLine('M30 41q9-2 7-12-1-4-4-3', b, 4.5), sv('ellipse', {cx: 20, cy: 35, rx: 12, ry: 10.5, fill: b, stroke: line, 'stroke-width': line ? 1.2 : 0}),
      sv('path', {d: 'M9.5 13 12 2l7 7.5ZM20.5 9.5 28 2l2.5 11Z', fill: b, stroke: line, 'stroke-width': line ? 1.2 : 0, 'stroke-linejoin': 'round'}), sv('circle', {cx: 20, cy: 19, r: 11, fill: b, stroke: line, 'stroke-width': line ? 1.2 : 0}),
      sv('path', {d: 'M12.6 9.6 13.6 5l3 3.4ZM23.4 8.4 26.4 5l1 4.6Z', fill: MOC.cheek}), moLine('M14 19.5q2-2.4 4 0', MOC.eye, 1.8), moLine('M22 19.5q2-2.4 4 0', MOC.eye, 1.8),
      sv('path', {d: 'M19 22.4h2l-1 1.3Z', fill: MOC.cheek}), moLine('M18.3 24.6q1.7 1.3 3.4 0', MOC.eye, 1.3),
      kind === 'orange' ? [moLine('M16 10.6l1 3', MOC.orangeD, 1.7), moLine('M20 9.6v3.4', MOC.orangeD, 1.7), moLine('M24 10.6l-1 3', MOC.orangeD, 1.7), moLine('M13 33q3 1 5 0', MOC.orangeD, 1.6)] : moLine('M12.5 28.5q7.5 4 15 0', MOC.galah, 2.2)); },
  catSleep: (z = 64) => moSvg('catsleep', z, z * 0.56, '0 0 64 36', moLine('M53 27q7 6-6 8-17 2-30-2', MOC.orange, 5), sv('ellipse', {cx: 35, cy: 24, rx: 21, ry: 10.5, fill: MOC.orange}),
    sv('path', {d: 'M8 17 9 7l7 6ZM18 13l6-6 1 10Z', fill: MOC.orange, 'stroke-linejoin': 'round'}), sv('circle', {cx: 16, cy: 22, r: 10, fill: MOC.orange}),
    moLine('M10.5 22.5q2 1.6 4 0', MOC.eye, 1.6), moLine('M17.5 22.5q2 1.6 4 0', MOC.eye, 1.6), moLine('M31 15q2 4 0 8', MOC.orangeD, 2), moLine('M39 14.5q2 4 0 8', MOC.orangeD, 2), moLine('M47 16q2 3.6 0 7', MOC.orangeD, 2),
    sv('g', {class: 'zz'}, moLine('M27 3h4l-4 4.5h4', MOC.lav, 1.5), moLine('M33.5 1h3l-3 3.4h3', MOC.lav, 1.3))),
  parrot: (z = 34) => moSvg('parrot', z * 0.83, z, '0 0 40 48', sv('path', {d: 'M19 38 15 47l8-5Z', fill: MOC.grey}), sv('ellipse', {cx: 21, cy: 28, rx: 10, ry: 13, fill: MOC.galah}),
    sv('path', {d: 'M24 19q10 6 6 20-4 4-10 2 4-10 4-22Z', fill: MOC.grey}), sv('circle', {cx: 18, cy: 14, r: 8, fill: MOC.galah}), sv('path', {d: 'M12.5 9q2-7.5 9.5-6.5-4 2-3 5.5Z', fill: MOC.crest}),
    sv('path', {d: 'M10.6 14.6q-4.2 1-3.6 4.6 2.6-1 4.6-2.3Z', fill: MOC.beak}), sv('circle', {cx: 15.6, cy: 13, r: 2.7, fill: MOC.crest}), sv('circle', {cx: 15.6, cy: 13, r: 1.5, fill: MOC.eye}),
    moLine('M18 41v3.5', MOC.grey, 2), moLine('M23 41v3.5', MOC.grey, 2)),
  rainbow: (w = 50) => moSvg('rainbow', w, w * 0.56, '0 0 60 34', [MOC.pink, MOC.peach, MOC.yellow, MOC.mint, MOC.lav].map((c, i) => { const r = 26 - i * 4.2; return moLine(`M${(30 - r).toFixed(1)} 31A${r.toFixed(1)} ${r.toFixed(1)} 0 0 1 ${(30 + r).toFixed(1)} 31`, c, 4); }),
    [[6, 30], [54, 30]].map(([x, y]) => [sv('circle', {cx: x - 3.5, cy: y, r: 3.6, fill: MOC.white}), sv('circle', {cx: x, cy: y - 2.4, r: 4.2, fill: MOC.white}), sv('circle', {cx: x + 3.8, cy: y, r: 3.4, fill: MOC.white})])),
  whale: (z = 40) => moSvg('whale', z, z * 0.6, '0 0 58 35', sv('path', {d: 'M5 19q2-13 21-13 16 0 21 9 5-6 9-9-1 7-4 10 4 2 5 8-6-1-10-4-6 8-21 8-19 0-21-9Z', fill: MOC.whale}),
    sv('path', {d: 'M8 22q8 7 22 6 10-1 15-6-15 4-37 0Z', fill: MOC.whaleL}), sv('path', {d: 'M23 23q4 6 10 5-4-3-5-6Z', fill: MOC.whaleD}), sv('circle', {cx: 13, cy: 16, r: 1.7, fill: MOC.eye}),
    moLine('M8.5 20.5q4 3 8 1', MOC.eye, 1.3), sv('path', {d: 'M15 0.5l1 3.4 3.4 1-3.4 1-1 3.4-1-3.4-3.4-1 3.4-1Z', fill: MOC.yellow}), sv('path', {d: 'M22 3l.7 2.3 2.3.7-2.3.7-.7 2.3-.7-2.3-2.3-.7 2.3-.7Z', fill: MOC.yellow})),
  butterfly: (z = 26) => moSvg('butterfly', z, z * 0.8, '0 0 40 32', sv('ellipse', {cx: 12, cy: 11, rx: 9, ry: 7, fill: MOC.lav}), sv('ellipse', {cx: 28, cy: 11, rx: 9, ry: 7, fill: MOC.lav}),
    sv('ellipse', {cx: 14, cy: 22, rx: 6, ry: 5, fill: MOC.galah}), sv('ellipse', {cx: 26, cy: 22, rx: 6, ry: 5, fill: MOC.galah}), moLine('M20 8v18', MOC.eye, 2), moLine('M20 8q-3-5-6-6', MOC.eye, 1.2), moLine('M20 8q3-5 6-6', MOC.eye, 1.2)),
};
/** 맨 아래 꽃밭 — 모든 화면 끝에 꽃 · 나비 · 고양이 둘이 가는 선 위에 앉아 있음(끝까지 읽은 사람에게 작은 인사) */
function footFriends() { return h('div', {class: 'foot-mo', 'aria-hidden': 'true'}, h('span', {class: 'fm-l'}, MO.daisy(24), MO.tulip(28), MO.daisy(18), MO.butterfly(26)), h('span', {class: 'fm-r'}, MO.cat('orange', 38), MO.cat('white', 42))); }

// ── 시간(사장님 2026-10-11 14:37 · 14:39 「현재에 집중하며 과거도 존중하며 3년후 5년후 10년후에 이야기를 담에내는 섹시한 묘미를 담은 아틀란스를 한층 업그래이드하라 과감하게 하라」) ──
//   클로드팀: 앞날 값은 그리지 않음(규칙 49) — 고른 날을 봉인해 3 · 5 · 10년 뒤 그날 종가로 다시 엶 · 봉인 뒤는 회차마다 실제 값으로 한 칸씩
//   애플팀: 시간 노선도(지난 3년 → 지금 → 3 · 5 · 10년 뒤) · 남은 날은 「D-1,093」 · 구글팀: 봉인 번호(sha256)로 잠근 내용을 누구나 맞대 봄 · 셈은 site_build.py ⑥ · 따로 세기 site_verify.mjs ⑫
const won100 = m => (m == null ? '?' : Math.round(m * 100).toLocaleString('ko-KR') + '만 원'); // 배 → 100만 원이 얼마(2.7157 → 272만 원)
function dday(d) { const k = new Date(Date.now() + 9 * 36e5), t = Date.UTC(k.getUTCFullYear(), k.getUTCMonth(), k.getUTCDate()); const [y, m, x] = d.split('-').map(Number); return Math.round((Date.UTC(y, m - 1, x) - t) / 864e5); } // 서울 오늘부터 남은 날
const ddayText = d => { const n = dday(d); return n > 0 ? 'D-' + n.toLocaleString('ko-KR') : n === 0 ? '오늘 엶' : '엶 날 지남 — 다시 셀 차례'; };
let timeP = null;
function needTime() { if (!timeP) timeP = getJson('time.json').then(t => { D.time = t; }).catch(e => { timeP = null; throw e; }); return timeP; }
function timeLine(T) {
  const P = T.past, S = T.since;
  const st = (cls, when, sub, icon, ...what) => h('li', {class: cls}, h('p', {class: 'when'}, h('b', {text: when}), sub ? ' · ' : null, sub ? h('span', {class: 'nw'}, sub, icon) : icon), h('p', {class: 'what'}, ...what)); // 날짜와 친구 그림은 함께 줄바꿈(그림만 홀로 한 줄 X)
  const sky = y => (y <= 3 ? MO.star(22) : y <= 5 ? MO.moon(24) : MO.whale(40)); // 멀수록 먼 우주(16:29 영상 친구들)
  const ol = h('ol', {class: 'stations', 'aria-label': '시간 노선도 — 3년 전 · 지금(봉인) · 3년 뒤 · 5년 뒤 · 10년 뒤'},
    st('past', '3년 전', ymd(P.from), MO.daisy(22), '그때 100만 원어치씩 샀다면 봉인 날 365곳 평균 ', h('b', {class: 'num', text: won100(P.mult365)}), ' · 후보 모두 ', h('b', {class: 'num', text: won100(P.multPool)})),
    st('now', '지금 · 봉인 ' + T.id + '호', md(T.seal), null, ...(S.days ? [`봉인 뒤 ${S.days}거래일 — 365곳 `, pctEl(S.chg365, 'b'), ' · 36곳 ', pctEl(S.chg36, 'b'), ' · 후보 모두 ', pctEl(S.chgPool, 'b')]
      : [`365곳 · 36곳을 이날 종가 그대로 잠금 — 다음 거래일부터 한 칸씩 채웁니다`])),
    ...T.opens.map(o => st('future', `${o.y}년 뒤`, ymd(o.date), sky(o.y), h('b', {class: 'num dd', text: ddayText(o.date)}), ' · 그날 종가로 엽니다')));
  return h('section', {class: 'tl'}, h('h2', {class: 'sec', text: '시간 — 지난 3년 · 지금 · 3 · 5 · 10년 뒤'}), ol,
    h('p', {class: 'note tln', text: `지난 3년은 지금 고른 곳을 거꾸로 본 값이라 좋아 보이기 쉽고, 그 사이 ${P.n365}곳 중 ${P.half}곳은 한때 반값 아래로 떨어졌습니다. 앞날 값은 그리지 않습니다.`}),
    nextStep('#/time', `봉인 ${T.id}호 열어 보기`, `봉인 번호 ${T.digest} · 잠근 규칙 · 봉인 뒤 지금까지`));
}
function timeChart(host, K) {
  host.textContent = '';
  const wrap = h('div', {class: 'tc'}); host.append(wrap);
  const P = K.past, S = K.since, open3 = K.opens[0].date, T = tok();
  const W = Math.max(260, Math.round(wrap.getBoundingClientRect().width || 320)), H = 220, Pd = 10;
  const day = d => Date.UTC(+d.slice(0, 4), +d.slice(5, 7) - 1, +d.slice(8, 10)) / 864e5;
  const x0 = day(P.from), x1 = day(open3), X = d => Pd + (day(d) - x0) / (x1 - x0) * (W - 2 * Pd);
  const last365 = P.v365.at(-1), lastPool = P.vpool.at(-1); // 봉인 날 = 100 으로 맞춤
  const p365 = P.v365.map(v => (v == null ? null : v / last365 * 100)), ppool = P.vpool.map(v => (v == null ? null : v / lastPool * 100));
  const vals = [...p365, ...ppool, ...S.v365, ...S.v36, ...S.vpool, 100].filter(v => v != null);
  let lo = Math.min(...vals), hi = Math.max(...vals); const pad = (hi - lo) * 0.08 || 4; lo -= pad; hi += pad;
  const Y = v => Pd + (hi - v) * (H - 2 * Pd) / (hi - lo);
  const svg = sv('svg', {viewBox: `0 0 ${W} ${H}`, width: W, height: H, role: 'img', 'aria-label': `봉인 ${K.id}호 — 3년 전 ${ymd(P.from)}부터 봉인 날 ${ymd(K.seal)}까지 실제 선(봉인 날 = 100) · 그 뒤 3년 뒤 ${ymd(open3)}까지는 비워 둠(앞날 값을 그리지 않음)`});
  const xs = X(S.dates.at(-1));
  svg.append(sv('rect', {x: xs.toFixed(1), y: Pd, width: Math.max(0, W - Pd - xs).toFixed(1), height: H - 2 * Pd, fill: T.violet, 'fill-opacity': 0.07, rx: 1})); // 아직 오지 않은 날 — 비워 둠
  hairs(svg, W, Pd, [Pd, H - Pd]);
  svg.append(sv('line', {x1: Pd, x2: W - Pd, y1: Y(100), y2: Y(100), stroke: T.mute, 'stroke-width': 1}));
  const path = (ds, arr) => { let d = '', on = false; arr.forEach((v, i) => { if (v == null) { on = false; return; } d += (on ? 'L' : 'M') + X(ds[i]).toFixed(1) + ' ' + Y(v).toFixed(1); on = true; }); return d; };
  svg.append(sv('path', {d: path(P.dates, ppool), fill: 'none', stroke: T.mute, 'stroke-width': 2, 'stroke-dasharray': '6 4', 'stroke-linejoin': 'round'}));
  svg.append(sv('path', {d: path(P.dates, p365), fill: 'none', stroke: T['violet-ink'], 'stroke-width': 2.5, 'stroke-linejoin': 'round', 'stroke-linecap': 'round'}));
  if (S.days) {
    svg.append(sv('path', {d: path(S.dates, S.vpool), fill: 'none', stroke: T.mute, 'stroke-width': 2, 'stroke-dasharray': '6 4'}));
    svg.append(sv('path', {d: path(S.dates, S.v36), fill: 'none', stroke: T.violet, 'stroke-width': 2.5, 'stroke-linecap': 'round'}));
    svg.append(sv('path', {d: path(S.dates, S.v365), fill: 'none', stroke: T['violet-ink'], 'stroke-width': 2.5, 'stroke-linecap': 'round'}));
  }
  svg.append(sv('line', {x1: X(K.seal), x2: X(K.seal), y1: Pd - 4, y2: H - Pd + 4, stroke: T.gold, 'stroke-width': 2})); // 봉인 날
  svg.append(sv('line', {x1: X(open3), x2: X(open3), y1: Pd - 4, y2: H - Pd + 4, stroke: T['violet-ink'], 'stroke-width': 2, 'stroke-dasharray': '6 4'})); // 3년 뒤 여는 날
  const lk = S.dates.length - 1;
  svg.append(sv('circle', {cx: X(S.dates[lk]), cy: Y(S.v365[lk]), r: 5.5, fill: T['violet-ink'], stroke: T.night, 'stroke-width': 2.5}));
  const cx = sv('line', {y1: Pd, y2: H - Pd, stroke: T.ink, 'stroke-opacity': 0.6, 'stroke-width': 1}); cx.setAttribute('visibility', 'hidden'); svg.append(cx);
  wrap.append(svg);
  const yt = h('span', {class: 'yl num', text: Math.round(hi)}), yb = h('span', {class: 'yl num', text: Math.round(lo)}); yt.style.top = '0'; yb.style.top = (H - 30) + 'px'; wrap.append(yt, yb);
  const fut = h('span', {class: 'fut', text: '앞날은 비워 둡니다'}); fut.style.left = (xs + 8) + 'px'; fut.style.right = '8px'; fut.style.top = (H / 2 - 30) + 'px'; wrap.append(fut);
  wrap.append(h('div', {class: 'ax3'}, h('span', {text: '3년 전'}), h('span', {text: `봉인 ${md(K.seal)}`}), h('span', {text: '3년 뒤'})));
  const tip = h('div', {class: 'tip num'}); tip.hidden = true; wrap.append(tip);
  const allD = [...P.dates, ...S.dates.slice(1)], all365 = [...p365, ...S.v365.slice(1)];
  const mv = e => { const r = svg.getBoundingClientRect(), x = (e.clientX - r.left) * W / r.width; if (x > xs + 2) { cx.setAttribute('visibility', 'hidden'); tip.hidden = true; return; }
    let i = 0, best = 1e9; allD.forEach((d, k) => { const dx = Math.abs(X(d) - x); if (dx < best) { best = dx; i = k; } });
    cx.setAttribute('x1', X(allD[i])); cx.setAttribute('x2', X(allD[i])); cx.setAttribute('visibility', 'visible');
    tip.hidden = false; tip.textContent = `${ymd(allD[i])} · 365곳 ${Math.round(all365[i])}`; tip.style.left = Math.min(r.width - 120, Math.max(120, X(allD[i]) * r.width / W)) + 'px'; };
  svg.addEventListener('pointermove', mv); svg.addEventListener('pointerdown', mv); svg.addEventListener('pointerleave', () => { cx.setAttribute('visibility', 'hidden'); tip.hidden = true; });
}
async function viewTime(v) {
  await needTime();
  const K = D.time.capsules?.[0];
  if (!K) { v.append(h('h1', {class: 'head', text: '봉인이 아직 없습니다'}), h('p', {class: 'count', text: '? 봉인 파일을 못 찾았습니다.'})); v.append(foot()); return; }
  const P = K.past, S = K.since, tell = tellRow(`봉인 ${ymd(K.seal)} · 봉인 번호 ${K.digest.slice(0, 12)}`, null);
  v.append(tell.el, h('h1', {class: 'head', text: `봉인 ${K.id}호 — ${md(K.seal)} 365곳을 3 · 5 · 10년 뒤 다시 엽니다`}),
    h('p', {class: 'count', text: `365곳 · 36곳 · 후보 ${K.nPool.toLocaleString('ko-KR')}곳을 ${md(K.seal)} 종가 그대로 잠금 · 앞날 값은 그리지 않습니다`}));
  const host = h('div'); v.append(host); const draw = () => timeChart(host, K); draw(); chartDraw = draw;
  v.append(h('p', {class: 'lkey'}, h('span', {}, h('i', {class: 'l-k365'}), '봉인 365곳'), S.days ? h('span', {}, h('i', {class: 'l-k36'}), '봉인 36곳') : null, h('span', {}, h('i', {class: 'l-kpool'}), '후보 모두'),
    h('span', {}, h('i', {class: 'l-pick'}), `봉인 날 = 100`), h('span', {}, h('i', {class: 'l-open'}), `3년 뒤 여는 날`)));
  // 지금 — 봉인 뒤 지금까지(현재에 집중)
  v.append(h('h2', {class: 'sec', text: '지금 — 봉인 뒤 지금까지'}));
  if (!S.days) v.append(h('p', {}, h('span', {class: 'q', text: '? '}), `아직 0거래일 — ${md(K.seal)}이 봉인 날이자 마지막 종가 날입니다. 다음 거래일부터 회차마다(하루 4번) 한 칸씩 채웁니다.`), MO.catSleep(72)); // 기다리는 자리 — 잠든 아기 고양이(16:29)
  else {
    const trio = h('div', {class: 'trio'}, h('div', {}, h('span', {text: '봉인 365곳'}), pctEl(S.chg365)), h('div', {}, h('span', {text: '봉인 36곳'}), pctEl(S.chg36)), h('div', {}, h('span', {text: '후보 모두'}), pctEl(S.chgPool)));
    v.append(trio); fitNums(trio);
    v.append(h('p', {class: 'src', text: `${md(K.seal)} 종가 → ${md(S.dates.at(-1))} 종가 · 봉인 뒤 ${S.days}거래일 · 같은 돈 나눠 사서 그대로 · 값 있는 ${S.have365}곳 · ${S.have36}곳 · ${S.havePool.toLocaleString('ko-KR')}곳` + (S.stale365 ? ` · 마지막 날 값 없는 ${S.stale365}곳은 앞 값` : '')}));
  }
  // 지나온 길 — 3년 전부터(과거 존중)
  v.append(h('h2', {class: 'sec', text: '지나온 길 — 3년 전부터'}),
    h('p', {}, `${ymd(P.from)}에 봉인 365곳 가운데 그때 값이 있던 ${P.n365}곳을 100만 원어치씩 샀다면, 봉인 날 한 곳 평균 `, h('b', {class: 'num', text: won100(P.mult365)}), ' · 가운데 회사 ', h('b', {class: 'num', text: won100(P.med365)}),
      ` · 후보 모두(${P.nPool.toLocaleString('ko-KR')}곳) 평균 `, h('b', {class: 'num', text: won100(P.multPool)}), '.'),
    h('p', {class: 'note', text: `그 3년 사이 ${P.n365}곳 가운데 ${P.half}곳은 한때 꼭대기의 반값 아래로 떨어졌습니다 — 오른 길도 곧은 길이 아니었습니다.`}),
    h('p', {class: 'note', text: `이 365곳은 ${md(K.seal)}에 고른 곳이라, 3년을 거꾸로 보면 좋아 보이기 쉽습니다(뒤늦게 고른 효과). 3년 전에는 이 365곳을 알 수 없었습니다. 그때 값이 없던 ${P.skip365}곳은 뺐습니다.`}));
  // 앞날 — 다시 여는 날(3 · 5 · 10년 뒤)
  v.append(h('h2', {class: 'sec', text: '앞날 — 다시 여는 날'}),
    h('ol', {class: 'opens'}, ...K.opens.map(o => h('li', {}, o.y <= 3 ? MO.star(24) : o.y <= 5 ? MO.moon(26) : MO.whale(44), h('span', {class: 'oy', text: `${o.y}년 뒤`}), h('span', {class: 'od', text: ymd(o.date)}), h('b', {class: 'num dd', text: ddayText(o.date)})))),
    h('p', {class: 'note', text: '그날 장이 쉬면 그 뒤 첫 거래일 종가로 엽니다. 365곳 · 36곳이 후보 모두보다 나았는지만 셉니다 — 그 사이 365곳을 날마다 다시 골라도 이 봉인은 그대로입니다.'}));
  if (D.core.grow) v.append(growSummary(D.core.grow)); // 회사마다 앞으로 클까?(사장님 16:51 · 봉인과 따로 — 16:57 「이건 봉인하지마」)
  v.append(h('details', {class: 'more'}, h('summary', {text: '그날 이렇게 셉니다 — 봉인과 함께 잠근 규칙'}), h('div', {class: 'in'}, h('ol', {}, ...K.rules.map(r => h('li', {text: r}))))));
  v.append(h('div', {class: 'box seal'}, h('h2', {text: `봉인 번호 ${K.digest.slice(0, 12)}`}), h('p', {class: 'digest', text: K.digest}),
    h('p', {class: 'small', text: `기록 파일 ${K.file} · 지우지 않음 · 잠근 내용(날 · 규칙 · 회사 · 종가)이 한 글자만 바뀌어도 번호가 달라집니다 — 회차마다 다른 셈(노드)으로 번호를 다시 맞대 봅니다.`})));
  v.append(foot());
}

// ── 화면 ⑤ 업종 63 ──
function viewList(v) {
  const C = D.core;
  const multi = C.industries.filter(i => i.n > 1).sort((a, b) => b.chg - a.chg), single = C.industries.filter(i => i.n === 1).sort((a, b) => b.chg - a.chg);
  v.append(h('h1', {class: 'head', text: `업종 ${C.industries.length}개 — ${C.days}거래일 많이 오른 순`}), h('p', {class: 'count', text: `${md(C.base)} → ${md(C.asOf)} · 큰 갈래와 상관없이 업종만 줄 세웠습니다.`}));
  const mk = (list, label) => { const host = h('div'); v.append(host); race(host, {items: list.map(i => ({key: i.name, name: i.name, href: hrefInd(i), v: i.v, cw: i.cw, badge: gById(i.g).short})), parent: null, wide: true, label}); };
  v.append(h('h2', {class: 'sec', text: `회사 2곳 이상인 업종 ${multi.length}개`}));
  mk(multi, `회사 2곳 이상 업종 ${multi.length}개 — ${C.days}거래일 많이 오른 순`);
  v.append(h('h2', {class: 'sec', text: `회사 1곳뿐인 업종 ${single.length}개`}), h('p', {text: '업종 평균이 아니라 그 회사 하나의 값입니다.'}));
  mk(single, `회사 1곳뿐인 업종 ${single.length}개`);
  v.append(foot());
}
function viewMissing(v, code) { // 365곳에서 빠진 회사(회차마다 다시 고름)의 옛 주소면 이름 · 까닭 · 깔때기(구글팀 2026-10-12)
  const head = h('h1', {class: 'head', text: '없는 주소입니다'}), say = h('p', {class: 'count', text: code ? `「${code}」는 지금 365곳에 없습니다. 찾기로 이름을 쳐 보세요.` : '주소가 바뀌었거나 잘못 들어왔습니다.'}), more = h('div');
  v.append(head, say, more, h('p', {}, h('a', {class: 'play', href: '#/', text: '처음 화면으로'})), foot());
  if (code) needNames().then(() => { const r = D.names?.rows.find(x => x.c === code); if (!r || !head.isConnected) return;
    head.textContent = r.n + ' — 지금 365곳 밖'; say.textContent = `${josa(r.n, '은', '는')} ${D.core.funnel.stopName[r.s] ?? '365곳 고르기'}에서 멈췄습니다 — 회차마다(하루 4번) 다시 고르므로 다음 회차에 들어올 수도 있습니다.`;
    more.append(h('div', {class: 'why', text: r.w}), funnel(r.s)); }).catch(() => {});
}

// ── 찾기(구글팀) — 한 글자 · 첫 글자 · 영어 이름 소리 · 종목 번호 ──
const CHO = 'ㄱㄲㄴㄷㄸㄹㅁㅂㅃㅅㅆㅇㅈㅉㅊㅋㅌㅍㅎ';
const LAT = {A: '에이', B: '비', C: '씨', D: '디', E: '이', F: '에프', G: '지', H: '에이치', I: '아이', J: '제이', K: '케이', L: '엘', M: '엠', N: '엔', O: '오', P: '피', Q: '큐', R: '알', S: '에스', T: '티', U: '유', V: '브이', W: '더블유', X: '엑스', Y: '와이', Z: '지'};
const norm = s => String(s).toLowerCase().replace(/[\s·.\-()&]/g, '');
const cho = s => [...s].map(ch => { const k = ch.charCodeAt(0) - 0xAC00; return k >= 0 && k < 11172 ? CHO[Math.floor(k / 588)] : ch; }).join('');
const sound = s => String(s).replace(/[A-Za-z]/g, ch => LAT[ch.toUpperCase()] || ch);
function prepNames() {
  for (const r of D.names.rows) { const a = norm(r.n), b = norm(sound(r.n)); r._k = [a, b]; r._c = [cho(a), cho(b)]; }
}
function search(q) {
  const k = norm(q); if (!k) return [];
  const onlyCho = /^[ㄱ-ㅎ]+$/.test(k), digits = /^\d+$/.test(k);
  const hits = [];
  for (const g of D.core.groups) if (norm(g.name).includes(k) || norm(g.short).includes(k)) hits.push({kind: 'g', score: norm(g.name).startsWith(k) ? 0 : 1, g});
  for (const i of D.core.industries) if (norm(i.name).includes(k) || (onlyCho && cho(norm(i.name)).includes(k))) hits.push({kind: 'i', score: norm(i.name).startsWith(k) ? 0 : 1, i});
  D.names.rows.forEach((r, ix) => {
    let s = -1;
    if (digits) { if (r.c.startsWith(k)) s = 0; }
    else if (onlyCho) { if (r._c.some(x => x.startsWith(k))) s = 1; else if (r._c.some(x => x.includes(k))) s = 3; }
    else if (r._k.some(x => x.startsWith(k))) s = 0; else if (r._k.some(x => x.includes(k))) s = 2;
    if (s >= 0) hits.push({kind: 'c', score: s + (r.s === 'in' ? 0 : 0.5), ix, r});
  });
  return hits.sort((a, b) => a.score - b.score || (a.kind === 'c' && b.kind === 'c' ? a.ix - b.ix : 0)).slice(0, 40);
}
function openSheet(id) { const s = $('#' + id); s.hidden = false; document.body.dataset.sheet = id; return s; }
function closeSheet(id) { const s = $('#' + id); if (s.hidden) return; s.hidden = true; delete document.body.dataset.sheet; if (/^#\/(find|info|x\/)/.test(location.hash)) location.replace(lastMain || '#/'); }
async function openFind() {
  if (!location.hash.startsWith('#/find')) location.hash = '#/find';
}
async function showFind() {
  openSheet('findSheet');
  const q = $('#q'); q.value = q.value || ''; setTimeout(() => q.focus(), 30);
  try { await Promise.all([needNames(), needComp()]); } catch { $('#qHint').textContent = '? 이름표를 못 읽었습니다 — 잠시 뒤 다시 열어 주세요.'; return; }
  renderHits();
}
function renderHits() {
  const q = $('#q').value, ul = $('#hits'), hint = $('#qHint'); ul.textContent = '';
  if (!q.trim()) { hint.textContent = '이름 한 글자부터 찾습니다 · 첫 글자(ㅅㅅㅈㅈ) · 종목 번호도 됩니다.'; return; }
  const hits = search(q);
  if (!hits.length) { hint.textContent = `「${q}」 — 찾는 이름이 없습니다. 코스피 · 코스닥 ${D.names.funnel.universe.toLocaleString('ko-KR')}곳(${D.names.collected} 모음) 안에 없는 이름입니다. 띄어쓰기를 빼거나 첫 글자로도 찾아보세요.`; return; }
  hint.textContent = `「${q}」 — ${hits.length >= 40 ? '앞 40개' : hits.length + '개'}`;
  for (const x of hits) {
    if (x.kind === 'g') ul.append(h('li', {}, h('a', {href: '#/g/' + x.g.id, 'data-go': '1'}, h('span', {class: 'nm', text: x.g.name}), pctEl(x.g.chg), h('span', {class: 'g2', text: `큰 갈래 · ${x.g.n}곳`}))));
    else if (x.kind === 'i') ul.append(h('li', {}, h('a', {href: hrefInd(x.i), 'data-go': '1'}, h('span', {class: 'nm', text: x.i.name}), pctEl(x.i.chg), h('span', {class: 'g2', text: `업종 · ${gById(x.i.g).short} · ${x.i.n}곳`}))));
    else if (x.r.s === 'in') { const c = D.comp[x.r.c]; ul.append(h('li', {}, h('a', {href: '#/c/' + x.r.c, 'data-go': '1'}, h('span', {class: 'nm', text: x.r.n}), pctEl(c.chg), h('span', {class: 'g2', text: `${c.i} · ${gById(c.g).short} · ${D.core.days}거래일`})))); }
    else ul.append(h('li', {class: 'out'}, h('a', {href: '#/x/' + x.r.c, 'data-go': '1'}, h('span', {class: 'nm', text: x.r.n}), h('span', {class: 'chip', text: '365곳 밖'}), h('span', {class: 'g2', text: x.r.w}))));
  }
}

// ── 도움말 · 365곳 밖(깔때기) ──
function funnel(stop) {
  const F = D.core.funnel, steps = F.steps;  // 줄 · 멈춘 자리는 자료(site_build.py)가 정함
  const at = F.stop[stop] ?? steps.length;
  const ol = h('ol', {class: 'funnel'});
  steps.forEach((s, ix) => { const fill = h('i', {class: 'fill'}); fill.style.width = (s.n / F.universe * 100) + '%';
    ol.append(h('li', {class: stop ? (ix < at ? 'past' : ix === at ? 'stop' : 'no') : ''}, fill, h('span', {}, h('b', {class: 'num', text: s.n.toLocaleString('ko-KR') + '곳'}), h('span', {text: s.t})))); });
  return ol;
}
function showInfo(code) {
  const s = openSheet('infoSheet'), body = $('#infoBody'), C = D.core, F = C.facts; body.textContent = '';
  if (code) {
    const r = D.names?.rows.find(x => x.c === code);
    $('#infoTitle').textContent = r ? r.n + ' — 365곳 밖' : '365곳 밖';
    if (!r) { body.append(h('p', {class: 'q', text: '? 이 이름표를 못 찾았습니다.'})); return; }
    const stopName = C.funnel.stopName[r.s] ?? '365곳 고르기';
    body.append(h('p', {text: `${josa(r.n, '은', '는')} ${stopName}에서 멈췄습니다(${r.m === 'KOSPI' ? '코스피' : '코스닥'}).`}), h('div', {class: 'why', text: r.w}), funnel(r.s));
    body.append(h('p', {class: 'note', text: `365곳은 ${md(C.rules.pickWin.to)} 종가까지 ${C.rules.pickWin.days}거래일로 고른 것이고, 회차마다(하루 4번) 그날 값으로 다시 고릅니다 — 다음 회차에 들어올 수도 있습니다.`}));
    return;
  }
  $('#infoTitle').textContent = 'ATLAS 는 어떻게 셌나요';
  body.append(h('p', {text: `${md(C.rules.pickWin.to)}까지 ${C.rules.pickWin.days}거래일 「대세」였던 업종부터 고른 한국 주식 365곳이 지난 ${C.days}거래일(기준일 ${md(C.base)} → ${md(C.asOf)} · 장이 열린 날 ${C.days}번, 약 한 달) 어떻게 움직였는지, 큰 갈래 → 업종 → 회사 → 7단까지 눌러 봅니다. 앞날 값은 6단 회사 크기 범위(세 팀의 따짐)와 7단 몬테카를로 범위(모형 셈)로만 보이며, 맞힘이 아닙니다.`}));
  body.append(h('p', {text: `줄 아래 「▲ 강하게 오름 · 힘 붙음」 = 이 기간의 방향 · 세기 · 힘입니다. 방향 = 기간 동안 그은 곧은 선이 3% 넘게 기울고 처음보다 끝도 같은 쪽(아니면 「옆걸음」) · 강하게 = 그 선이 10% 넘고 들쭉날쭉하지 않음 · 힘 붙음 = 뒤 ${Math.floor(C.days / 2)}거래일이 앞 ${Math.floor(C.days / 2)}거래일보다 3%p 넘게 더 오름(「힘 빠짐」은 그 반대). 지난 기록이고 앞날 값이 아닙니다.`}));
  body.append(h('h2', {class: 'sec', text: '365곳은 이렇게 골랐습니다'}), funnel(null));
  const RU = C.rules;
  body.append(h('details', {class: 'more'}, h('summary', {text: `기본 문 ${RU.gate.length}개 · 대세 순서 — 원문`}), h('div', {class: 'in'}, h('ul', {}, ...RU.gate.map(t => h('li', {text: t})), h('li', {text: RU.window}), h('li', {text: RU.google}), h('li', {text: RU.cia}), ...RU.tiers.map(t => h('li', {text: t}))))));
  body.append(h('p', {class: 'note', text: `${RU.bias} (${C.days}거래일 가운데값: ` + F.tiers.map(t => `${t.t}층 ${t.n}곳 ${pct(t.med)}`).join(' · ') + ')'}));
  body.append(h('h2', {class: 'sec', text: '셈'}), h('ul', {class: 'note'},
    h('li', {text: `${md(C.base)} 종가 = 100. 「한 회사 한 표」 = 날마다 회사들의 오르내림을 같은 무게로 평균 내어 이어 곱함(하루 ±50% 넘는 값은 자료 오류로 뺌).`}),
    h('li', {text: `「큰 회사는 크게」 = ${md(C.base)}에 시가총액만큼 사 두었다고 보고 그대로 둔 값.`}),
    h('li', {text: '배당은 넣지 않은 주가만 셉니다. 「가장 깊이 빠짐」 = 꼭대기에서 가장 많이 내려간 비율.'})));
  body.append(h('h2', {class: 'sec', text: '자료 · 때'}), h('ul', {class: 'note'}, h('li', {text: C.sources.price}), h('li', {text: C.sources.pick})));
  body.append(h('h2', {class: 'sec', text: '모르는 것 ?'}), h('ul', {class: 'note'},
    h('li', {text: '? 거래정지 · 관리종목 · 투자경고 표시 — 아직 거르지 못합니다.'}),
    h('li', {text: C.sincePick ? `? 고른 뒤 기록 — ${md(C.pickAsOf)} 뒤 ${C.sincePick}거래일뿐이라 아직 짧습니다.` : `? 고른 뒤 기록 — ${md(C.pickAsOf)} 종가로 골라 고른 뒤 기록은 아직 없습니다. 지금 보이는 선은 모두 고른 기간 안입니다.`}),
    h('li', {text: '? 증권사 짐작 — 자주 바뀝니다. CIA팀 잣대 ③(이익이 늘어난 회사)과 6단 그림의 올해 매출 한 칸(점선 · 「남의 짐작」)에 쓰고, 세 팀 이야기 글 속에 증권사 짐작을 옮긴 곳도 있습니다 — 그대로 믿을 값이 아닙니다.'}),
    h('li', {text: `? 다시 고르기 — ${RU.next}.`})));
  const th = h('details', {class: 'more'}, h('summary', {text: `업종 대세 순서 ${RU.sectors.length}개 — 1층 · 2층 · 3층`}), h('div', {class: 'in'}, h('ol', {class: 'srank'},
    ...RU.sectors.map(x => h('li', {}, h('b', {text: x.name}), ` — ${x.tier}층${x.google ? ' · 구글팀' : ''}${x.cia ? ' · CIA팀' : ''} · 30거래일 ${pct(x.chg)} · ${x.in === x.n ? `${x.n}곳 모두` : x.in ? `${x.n}곳 중 ${x.in}곳` : `${x.n}곳 밖`}`))),
    h('p', {class: 'small', text: `업종 = 네이버 업종 · 기본 문 지난 회사가 3곳 미만인 업종 ${RU.unranked.sectors}개(${RU.unranked.companies}곳)는 순서를 매기지 않았습니다.`})));
  body.append(th, foot());
}

// ── 소리 · 글씨 ──
function speak() {
  try { if (!('speechSynthesis' in window)) return; speechSynthesis.cancel();
    const v = $('#view'), parts = [v.querySelector('h1')?.textContent, v.querySelector('.count')?.textContent, ...[...v.querySelectorAll('.board .row')].sort((a, b) => a.getBoundingClientRect().top - b.getBoundingClientRect().top).slice(0, 3).map(r => r.querySelector('.nm').textContent + ' ' + r.querySelector('.val').textContent.replace('−', '마이너스 ').replace('+', '플러스 ') + (r.querySelector('.trd') ? ', ' + r.querySelector('.trd').textContent.replace(/[▲▼▶] /, '') : ''))].filter(Boolean);
    const u = new SpeechSynthesisUtterance(parts.join('. ')); u.lang = 'ko-KR'; u.rate = 0.9; speechSynthesis.speak(u); } catch { /* 소리 없음 */ }
}
const FONTS = ['보통', '크게', '아주 크게'];
function setFont(k) { state.font = k; const r = document.documentElement; r.classList.toggle('f2', k === 1); r.classList.toggle('f3', k === 2); $('#fontBtn').setAttribute('aria-label', '글씨 크기 바꾸기 (지금 ' + FONTS[k] + ')'); try { localStorage.setItem('atlas:font', String(k)); } catch { /* 저장 못 함 */ } }

// ── 길(주소 #) — 뒤로 = 앞 화면(삼성팀) ──
let chartDraw = null, lastMain = '', routeSeq = 0, freshAt = Date.now();
/** 오래 열어 둔 화면(10분 넘게) — 회차가 지나 자료가 바뀌었으면 다시 엶(구글팀 2026-10-12: 옛 · 새 자료가 섞이던 것) */
async function freshCheck() {
  if (Date.now() - freshAt < 600000 || !D.core) return; freshAt = Date.now();
  try { const r = await fetch('/atlas/data/core.json', {cache: 'no-store'}); if (!r.ok) return; const x = await r.json(); if (x.made && D.core.made && x.made !== D.core.made) location.reload(); } catch { /* 망 없음 — 그대로 */ }
}
async function route() {
  if (!D.core) return; // 첫 자료를 받은 뒤 boot 가 길을 엶(구글팀: 받는 중에 탭을 누르면 멈추던 것)
  freshCheck();
  // 주소 풀기 — 깨진 주소(%E0 · %ZZ …)는 멈추지 않고 null → 「없는 주소」(CIA 눈 2026-10-12: 「자료를 못 읽었습니다」로 까닭이 틀리던 것 · #/x/ 는 아예 멈추던 것)
  const dec = s => { try { return decodeURIComponent(s); } catch { return null; } };
  const hsh = location.hash || '#/';
  if (hsh.startsWith('#/find')) { showFind(); return; }
  if (hsh.startsWith('#/info')) { showInfo(null); return; }
  if (hsh.startsWith('#/x/')) { try { await needNames(); } catch { /* 아래에서 ? */ } showInfo(dec(hsh.slice(4)) ?? '?'); return; }
  for (const id of ['findSheet', 'infoSheet']) { const s = $('#' + id); if (!s.hidden) { s.hidden = true; delete document.body.dataset.sheet; } }
  if (hsh === lastMain && $('#view').childElementCount) return;
  lastMain = hsh;
  const my = ++routeSeq, root = $('#view'); root.textContent = ''; chartDraw = null;
  const v = h('div', {class: 'vw'}); root.append(v); // 길마다 새 칸 — 늦게 끝난 앞 화면은 떨어진 칸에 그려져 보이지 않음(구글팀: 두 화면이 겹치던 것)
  const opening = h('p', {class: 'boot'}, MO.cat('white', 34), ' 여는 중입니다…'); v.append(opening); // 느린 망에서 빈 화면 대신(애플팀) — 다 그리면 지움
  for (const t of ['#tabHome', '#tabList', '#tab36', '#tabUp']) $(t)?.toggleAttribute('aria-current', false);
  try {
    const [, kind, raw] = hsh.match(/^#\/(\w*)\/?(.*)$/) || [], arg = dec(raw ?? '');
    if (!kind) { $('#tabHome').setAttribute('aria-current', 'page'); await viewHome(v); }
    else if (arg == null && /^[gic]$/.test(kind)) viewMissing(v); // 깨진 주소 = 없는 주소
    else if (kind === 'list') { $('#tabList').setAttribute('aria-current', 'page'); viewList(v); }
    else if (kind === '36') { $('#tab36').setAttribute('aria-current', 'page'); await view36(v); }
    else if (kind === 'up') { $('#tabUp').setAttribute('aria-current', 'page'); await viewUpdates(v); }
    else if (kind === 'time') await viewTime(v);
    else if (kind === 'g') viewGroup(v, arg);
    else if (kind === 'i') await viewIndustry(v, arg);
    else if (kind === 'c') { const [code, sub] = arg.split('/'); if (sub === 'past') await viewPast(v, code); else if (sub === 'rivals') await viewRivals(v, code); else if (sub === 'grow') await viewGrow(v, code); else if (sub === 'range') await viewRange(v, code); else if (!sub) await viewCompany(v, code); else viewMissing(v, code); }
    else { location.replace('/old/' + location.search + location.hash); return; } // 옛 ATLAS 주소(#/stocks · #/road …)는 옛 판으로
  } catch (e) {
    console.error(e);
    if (my !== routeSeq) return;
    v.textContent = ''; v.append(MO.catSleep(72), h('h1', {class: 'head', text: '자료를 못 읽었습니다'}), h('p', {class: 'count', text: '? 잠시 뒤 다시 열어 주세요.'}));
    const again = h('button', {class: 'play', type: 'button', text: '다시 열기'}); again.addEventListener('click', () => { lastMain = ''; route(); }); v.append(again);
  }
  if (my !== routeSeq) return; // 그 사이 다른 화면으로 갔음 — 제목 · 자리 · 초점을 건드리지 않음
  opening.remove();
  window.scrollTo(0, 0);
  document.title = (v.querySelector('h1')?.textContent || 'ATLAS') + ' · ATLAS';
  try { root.focus({preventScroll: true}); } catch { /* 초점 못 옮김 */ } // 화면 읽기가 새 화면 제목부터
}

async function boot() {
  try { const lg = new URLSearchParams(location.search).get('lang'); if (lg && lg !== 'ko') { location.replace('/old/' + location.search + location.hash); return; } } catch { /* 주소 못 읽음 */ }
  try { const k = +localStorage.getItem('atlas:font'); if (k === 1 || k === 2) setFont(k); } catch { /* 저장 못 함 */ }
  $('#fontBtn').addEventListener('click', () => { setFont((state.font + 1) % 3); lastMain = ''; route(); });
  $('#helpBtn').addEventListener('click', () => { location.hash = '#/info'; });
  $('#infoSheet .sheet-top')?.insertBefore(MO.rainbow(44), $('#infoSheet .close')); // 도움말 판 머리 — 무지개(16:29 영상 친구들)
  $('#openFind').addEventListener('click', openFind); $('#tabFind')?.addEventListener('click', openFind); // 아래 탭 「찾기」 자리는 「업데이트」(12:41) — 찾기는 맨 위 단추
  document.querySelectorAll('[data-close]').forEach(b => b.addEventListener('click', () => closeSheet(b.dataset.close)));
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && document.body.dataset.sheet) closeSheet(document.body.dataset.sheet); });
  $('#q').addEventListener('input', () => { if (D.names) renderHits(); });
  $('#hits').addEventListener('click', e => { const a = e.target.closest('a[data-go]'); if (!a) return; e.preventDefault(); const to = a.getAttribute('href'); $('#findSheet').hidden = true; delete document.body.dataset.sheet; if (to.startsWith('#/x/')) location.hash = to; else location.replace(to); });
  let rt = 0; addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(() => { if (chartDraw) chartDraw(); }, 200); });
  addEventListener('hashchange', route);
  document.querySelector('.tabbar')?.addEventListener('click', e => { const a = e.target.closest('a[href^="#/"]'); if (a && a.getAttribute('href') === (location.hash || '#/')) { e.preventDefault(); window.scrollTo({top: 0, behavior: RM.matches ? 'auto' : 'smooth'}); } });
  try { D.core = await getJson('core.json'); $('#tabList').textContent = '업종 ' + D.core.industries.length; }
  catch (e) { console.error(e); const v = $('#view'); v.textContent = ''; const again = h('button', {class: 'play', type: 'button', text: '다시 열기'}); again.addEventListener('click', () => location.reload()); v.append(MO.catSleep(72), h('h1', {class: 'head', text: '자료를 못 읽었습니다'}), h('p', {class: 'count', text: '? 잠시 뒤 다시 열어 주세요.'}), again); return; }
  await route();
  setTimeout(() => { needComp().catch(() => {}); }, 400);
}
boot();
