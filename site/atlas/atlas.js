// 새 ATLAS(aaa7377.com/atlas/) — 사장님 2026-10-11 06:13 「잡스 방식이 중심이 되고 구글팀 클로드팀 cai팀 그리고 찰리 망거팀 삼성팀 들이 도와서
//   일반인들이 바로 알수 있고 쉽게 사용가능하며 별도에 설명이 없어도 감탄이 니오게 새로운 아틀란스를 만들어 봐라 이 토대로 말이다」
// 잡스팀: 화면마다 질문 하나 · 같은 경주 그림으로 세 번 내려감(갈래 → 업종 → 회사) · 첫 화면 3개월 경주(약 6초 · 한 번 · 누르면 끝으로)
// 구글팀: 찾기 칸을 늘 위에 · 한 글자 · 첫 글자(ㅅㅅㅈㅈ) · 영어 이름 소리(에스케이) · 365곳 밖이면 깔때기로 까닭
// 클로드팀: 회사 1곳뿐인 업종 표시 · 고른 기준일 세로선 · 남의 짐작은 꼬리표 · 모르는 것은 「?」
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
function md(d) { const p = String(d).split('-'); return (+p[1]) + '월 ' + (+p[2]) + '일'; }
const ymd = d => String(d).slice(0, 4) + '년 ' + md(d);
function eok(v) { if (v == null) return '?'; const s = v < 0 ? '−' : '', a = Math.abs(v); if (a >= 10000) return s + r1(a / 10000).toLocaleString('ko-KR', {maximumFractionDigits: 1}) + '조 원'; return s + Math.round(a).toLocaleString('ko-KR') + '억 원'; }
/** 조사 — 받침 있으면 앞말(은 · 이 · 과) · 없으면 뒷말(는 · 가 · 와) · 한글이 아니면 둘 다 */
function josa(w, a, b) { const ch = String(w).trim().slice(-1), k = ch.charCodeAt(0) - 0xAC00; if (k < 0 || k > 11171) return w + a + '(' + b + ')'; return w + (k % 28 ? a : b); }
const won = v => (v == null ? '?' : Math.round(v).toLocaleString('ko-KR') + '원');
function fy(p) { if (!p) return '?'; const [y, m] = p.replace('E', '').split('.'); return y + '년' + (m && m !== '12' ? '(' + (+m) + '월 결산)' : ''); }
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[c]));
function h(tag, attrs = {}, ...kids) { const e = document.createElement(tag); for (const [k, v] of Object.entries(attrs)) { if (v == null || v === false) continue; if (k === 'class') e.className = v; else if (k === 'text') e.textContent = v; else if (k === 'html') e.innerHTML = v; else e.setAttribute(k, v === true ? '' : v); } for (const k of kids.flat()) if (k != null) e.append(k.nodeType ? k : document.createTextNode(k)); return e; }
function sv(tag, attrs = {}) { const e = document.createElementNS(NS, tag); for (const [k, v] of Object.entries(attrs)) e.setAttribute(k, v); return e; }
const pctEl = (x, tag = 'b') => h(tag, {class: 'num ' + cls(x), text: pct(x)});
const gById = id => D.core.groups.find(g => g.id === id);
const ind = name => D.core.industries.find(i => i.name === name);
const series = (node, mode = state.mode) => (mode === 'cw' ? node.cw : node.v);
const chgOf = (node, mode = state.mode) => (mode === 'cw' ? node.cwChg : node.chg);

// ── 자료 받기 ──
async function getJson(name) { const r = await fetch('/atlas/data/' + name, {cache: 'no-cache'}); if (!r.ok) throw Error(name + ' ' + r.status); return r.json(); }
let compP = null, namesP = null, pickP = null, daysP = null; const coP = new Map();
function needDays() { if (!daysP) daysP = getJson('days.json').then(d => { D.days = d; }).catch(e => { daysP = null; throw e; }); return daysP; }
function needCo(code) { if (!coP.has(code)) coP.set(code, getJson('co/' + encodeURIComponent(code) + '.json').catch(e => { coP.delete(code); throw e; })); return coP.get(code); }
function needPick() { if (!pickP) pickP = getJson('pick36.json').then(p => { D.pick = p; }).catch(e => { pickP = null; throw e; }); return pickP; }
function needComp() { if (!compP) compP = Promise.all([getJson('comp.json'), getJson('lines.json')]).then(([c, l]) => { D.comp = c.companies; D.lines = l.lines; }).catch(e => { compP = null; throw e; }); return compP; }
function needNames() { if (!namesP) namesP = getJson('names.json').then(n => { D.names = n; prepNames(); }).catch(e => { namesP = null; throw e; }); return namesP; }

// ── 경주판(잡스팀) — 줄 하나 = 갈래 · 업종 · 회사 하나 · 가운데 = 7월 6일과 같음 ──
//   items: [{key, name, href, v:[64], cw:[64], badge}] · parent: {v, cw}(흰 점선) · wide: 이름이 긴 줄(두 줄 모양)
function race(host, {items, parent, wide = false, label, onTick, onDone, auto = false}) {
  const C = D.core, n = C.dates.length;
  const board = h('div', {class: 'board' + (wide ? ' wide' : ''), role: 'list', 'aria-label': label});
  const scale = arrs => Math.max(5, Math.ceil(Math.max(0, ...arrs.flat().filter(x => x != null).map(x => Math.abs(x - 100))) * 1.06));
  const Meq = scale(items.map(it => it.v).concat(parent ? [parent.v] : [])), Mcw = scale(items.map(it => it.cw || it.v).concat(parent ? [parent.cw] : []));
  let M = state.mode === 'cw' ? Mcw : Meq;
  const rows = items.map(it => {
    const pos = h('i', {class: 'bar pos'}), neg = h('i', {class: 'bar neg'}), avg = parent ? h('i', {class: 'avg'}) : null;
    const val = h('b', {class: 'val num'}), nm = h('span', {class: 'nm'}, it.name, it.badge ? h('span', {class: 'badge', text: it.badge}) : null);
    const row = h('a', {class: 'row', href: it.href, role: 'listitem'}, nm, h('span', {class: 'track', 'aria-hidden': 'true'}, h('i', {class: 'zero'}), neg, pos, avg), val, h('span', {class: 'chev', 'aria-hidden': 'true', text: '›'}));
    board.append(row);
    return {it, row, pos, neg, avg, val, rank: -1, cur: 100};
  });
  host.append(board);
  const rowH = rows.length ? rows[0].row.getBoundingClientRect().height + (wide ? 4 : 0) : 0;
  board.style.height = (rows.length * rowH) + 'px';
  const at = (arr, k) => { const a = Math.floor(k), b = Math.min(n - 1, a + 1), f = k - a; const x = arr[a], y = arr[b]; if (x == null) return y; if (y == null) return x; return x + (y - x) * f; };
  let mode = state.mode;
  function paint(k, settle) {
    for (const r of rows) {
      const v = at(mode === 'cw' && r.it.cw ? r.it.cw : r.it.v, k); r.cur = v;
      const d = (v ?? 100) - 100, s = Math.min(1, Math.abs(d) / M);
      r.pos.style.transform = 'scaleX(' + (d > 0 ? s : 0) + ')'; r.neg.style.transform = 'scaleX(' + (d < 0 ? s : 0) + ')';
      r.val.textContent = pct(d); r.val.className = 'val num ' + cls(d);
      if (r.avg) { const p = at(mode === 'cw' ? parent.cw : parent.v, k) - 100; r.avg.style.left = (50 + Math.max(-1, Math.min(1, p / M)) * 50) + '%'; }
    }
    const order = rows.slice().sort((a, b) => (b.cur ?? 0) - (a.cur ?? 0));
    order.forEach((r, i) => { if (r.rank !== i || settle) { r.rank = i; r.row.style.transform = 'translateY(' + (i * rowH) + 'px)'; } });
    return order;
  }
  let raf = 0, playing = false, done = null;
  function finish() {
    cancelAnimationFrame(raf); playing = false; board.classList.remove('playing');
    const order = paint(n - 1, true);
    rows.forEach(r => r.row.classList.remove('win'));
    if (order[0]) { void order[0].row.offsetWidth; order[0].row.classList.add('win'); }
    if (done) { const f = done; done = null; f(order); }
    if (onDone) onDone(order);
  }
  function play() {
    if (RM.matches || n < 2) { finish(); return; }
    cancelAnimationFrame(raf); playing = true; board.classList.add('playing'); rows.forEach(r => r.row.classList.remove('win'));
    const per = 80, hold = 800, lowK = parent ? parent.v.indexOf(Math.min(...parent.v)) : -1;
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
    setMode(m) { mode = m; M = m === 'cw' ? Mcw : Meq; board.classList.add('smooth'); finish(); setTimeout(() => board.classList.remove('smooth'), 600); },
    stop() { cancelAnimationFrame(raf); playing = false; },
  };
}

// ── 3개월 선(회사 화면 그림 한 장) — 7월 6일 위 빨강 · 아래 파랑 · 연보라 점선 = 업종 평균 · 금빛 세로선 = 고른 기준일 ──
let lcN = 0;
function lineChart(host, {v, avg, label}) {
  const C = D.core, n = C.dates.length, kPick = C.kPick;
  host.textContent = '';
  const wrap = h('div', {class: 'lc'});
  host.append(wrap);
  const W = Math.max(260, Math.round(wrap.getBoundingClientRect().width || 320)), H = 210, P = 10;
  const vals = [...v, ...(avg || []), 100].filter(x => x != null);
  if (!v.some(x => x != null)) { wrap.append(h('p', {class: 'q', text: '? 이 회사 3개월 값을 못 읽었습니다'})); return; }
  let lo = Math.min(...vals), hi = Math.max(...vals); const pad = (hi - lo) * 0.06 || 2; lo -= pad; hi += pad;
  const X = i => P + i * (W - 2 * P) / (n - 1), Y = y => P + (hi - y) * (H - 2 * P) / (hi - lo);
  const id = 'lc' + (++lcN);
  const svg = sv('svg', {viewBox: `0 0 ${W} ${H}`, width: W, height: H, role: 'img', 'aria-label': label});
  const defs = sv('defs');
  const cu = sv('clipPath', {id: id + 'u'}); cu.append(sv('rect', {x: 0, y: 0, width: W, height: Y(100)}));
  const cd = sv('clipPath', {id: id + 'd'}); cd.append(sv('rect', {x: 0, y: Y(100), width: W, height: H - Y(100)}));
  defs.append(cu, cd); svg.append(defs);
  svg.append(sv('line', {x1: P, x2: W - P, y1: Y(100), y2: Y(100), stroke: '#A9A3CC', 'stroke-width': 1.5, 'stroke-dasharray': '5 5'}));
  svg.append(sv('line', {x1: X(kPick), x2: X(kPick), y1: P - 4, y2: H - P + 4, stroke: '#E9C46A', 'stroke-width': 2.5}));
  const path = arr => { let d = '', on = false; arr.forEach((y, i) => { if (y == null) { on = false; return; } d += (on ? 'L' : 'M') + X(i).toFixed(1) + ' ' + Y(y).toFixed(1); on = true; }); return d; };
  if (avg) svg.append(sv('path', {d: path(avg), fill: 'none', stroke: '#CDBEF6', 'stroke-width': 2.5, 'stroke-dasharray': '2 6', 'stroke-linecap': 'round'}));
  const d = path(v);
  svg.append(sv('path', {d, fill: 'none', stroke: '#FF5A66', 'stroke-width': 3.5, 'stroke-linejoin': 'round', 'clip-path': `url(#${id}u)`}));
  svg.append(sv('path', {d, fill: 'none', stroke: '#5C97FF', 'stroke-width': 3.5, 'stroke-linejoin': 'round', 'clip-path': `url(#${id}d)`}));
  const lastK = v.map((x, i) => (x == null ? -1 : i)).filter(i => i >= 0).pop();
  svg.append(sv('circle', {cx: X(lastK), cy: Y(v[lastK]), r: 5.5, fill: v[lastK] >= 100 ? '#FF5A66' : '#5C97FF', stroke: '#111433', 'stroke-width': 2}));
  const cx = sv('line', {y1: P, y2: H - P, stroke: '#F3F1FC', 'stroke-width': 1.5}), dot = sv('circle', {r: 6, fill: '#F3F1FC'});
  cx.setAttribute('visibility', 'hidden'); dot.setAttribute('visibility', 'hidden'); svg.append(cx, dot);
  wrap.append(svg);
  const yt = h('span', {class: 'yl num', text: Math.round(hi)}), yb = h('span', {class: 'yl num', text: Math.round(lo)});
  yt.style.top = '0'; yb.style.top = (H - 30) + 'px'; wrap.append(yt, yb);
  const tip = h('div', {class: 'tip num'}); tip.hidden = true; wrap.append(tip);
  const pick = h('span', {class: 'yl', text: '고른 기준일'}); pick.style.top = '0'; pick.style.left = Math.min(W - 110, Math.max(0, X(kPick) - 104)) + 'px'; wrap.append(pick);
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
  return h('footer', {class: 'foot'},
    h('p', {class: 'links'}, h('a', {href: '/hello.html', text: '친구에게 소개하기'}), h('a', {href: '/old/', text: '옛 ATLAS'}), h('a', {href: '/us/', text: '미국 판'})),
    h('p', {text: `자료: ${C.sources.price} · 3개월 = ${md(C.base)} → ${md(C.asOf)}(${C.days}거래일) · 365곳은 ${md(C.pickAsOf)} 종가까지 보고 고름.`}),
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
  const play = onPlay ? h('button', {class: 'ibtn', type: 'button', 'aria-label': '3개월 경주 다시 보기', title: '다시 보기'}, svgPlay()) : null;
  if (play) play.addEventListener('click', onPlay);
  const say = h('button', {class: 'ibtn', type: 'button', 'aria-label': '이 화면 소리로 듣기', text: '♪'});
  say.addEventListener('click', speak);
  return {el: h('div', {class: 'tell'}, t, h('span', {class: 'tell-b'}, play, ' ', say)), t};
}
function svgPlay() { const s = sv('svg', {width: 14, height: 14, viewBox: '0 0 14 14', 'aria-hidden': 'true'}); s.append(sv('path', {d: 'M3 1.5 L12 7 L3 12.5 Z', fill: 'currentColor'})); return s; }
function legend(parentName) {
  return h('p', {class: 'key'}, h('span', {}, h('i', {class: 'k-up'}), '오름'), h('span', {}, h('i', {class: 'k-dn'}), '내림'), h('span', {}, h('i', {class: 'k-avg'}), parentName + ' 평균'), h('span', {text: '가운데 = ' + md(D.core.base) + '과 같음'}));
}
function crumbs(...parts) { const c = h('nav', {class: 'crumb', 'aria-label': '지금 자리'}); parts.forEach((p, i) => { if (i) c.append(h('i', {text: '›', 'aria-hidden': 'true'})); c.append(p.href ? h('a', {href: p.href, text: p.text}) : h('span', {text: p.text})); }); return c; }
const hrefInd = i => (i.n === 1 ? '#/c/' + i.members[0] : '#/i/' + encodeURIComponent(i.name));
const LV = ['갈래', '업종', '회사', '지나온 길', '범위 · 점검'];
/** 5단 표시 — hrefs[k] = k+1단으로 가는 길(지나온 단 · 바로 다음 단만) · 그 밖은 누르지 못함 */
function steps(now, hrefs = []) {
  const nav = h('nav', {class: 'steps', 'aria-label': `5단 가운데 ${now}단 — ${LV[now - 1]}`});
  const row = h('ol', {class: 'st'});
  LV.forEach((name, k) => {
    const n = k + 1, cls = n < now ? 'past' : n === now ? 'now' : 'next', inner = [h('b', {class: 'num', text: n}), h('span', {class: 'sr', text: `단 ${name}`})];
    row.append(h('li', {class: cls}, hrefs[k] && n !== now ? h('a', {href: hrefs[k], 'aria-label': `${n}단 ${name}로`}, ...inner) : h('span', {class: 'cell', 'aria-current': n === now ? 'step' : null}, ...inner)));
  });
  nav.append(row, h('p', {class: 'st-t'}, h('b', {text: `5단 중 ${now}단`}), ` · ${LV[now - 1]}`));
  return nav;
}

// ── 화면 ① 한눈에 — 「지난 3개월, 어느 쪽이 올랐나?」 ──
function viewHome(v) {
  const C = D.core, A = C.all, F = C.facts;
  const top = (m) => C.groups.slice().sort((a, b) => chgOf(b, m) - chgOf(a, m))[0];
  const tell = tellRow(`${md(C.base)} → ${md(C.asOf)}`, () => rc.play());
  const head = h('h1', {class: 'head'}), count = h('p', {class: 'count'}), alt = h('div', {class: 'alt'});
  const big = F.big.map(b => `${b.name} ${pct(b.chg3)}`).join(' · ');
  function words(m) {
    const t = top(m);
    if (m === 'eq') {
      head.replaceChildren('지난 3개월 1등은 ', t.name);
      count.replaceChildren(h('b', {class: 'up', text: A.up + '곳 오름'}), ' · ', h('b', {class: 'down', text: A.down + '곳 내림'}), A.flat ? ` · ${A.flat}곳 그대로` : '', h('span', {class: 'sr', text: ` — 365곳 가운데`}));
      alt.replaceChildren('다르게 보면: 큰 회사는 크게 치면 365곳이 ', pctEl(A.cwChg), ` — ${big}. 아래 단추로 바꿔 보세요.`);
    } else {
      const negs = C.groups.filter(g => r1(g.cwChg) < 0).length;
      head.replaceChildren(negs === C.groups.length ? `큰 회사는 크게 치면 ${negs}갈래 모두 내림` : `큰 회사는 크게 치면 1등은 ${t.name}`);
      count.replaceChildren('365곳 몸값으로 세면 ', pctEl(A.cwChg), ` · ${big}`);
      alt.replaceChildren('한 회사 한 표로 세면 365곳 ', pctEl(A.chg), ` · ${A.up}곳 오름 · ${A.down}곳 내림.`);
    }
  }
  words(state.mode);
  const host = h('div');
  const hello = h('a', {class: 'hello', href: '/hello.html'}, h('img', {src: '/media/atlas-hello.jpg', alt: '', width: 44, height: 44, decoding: 'async'}), h('span', {class: 'hw'}, h('b', {text: '친구에게 소개하기'}), h('span', {text: '공주님 1분 영상 · 보내기'})), h('span', {class: 'chev', 'aria-hidden': 'true', text: '›'}));
  v.append(hello, tell.el, head, count, host);
  const items = C.groups.map(g => ({key: g.id, name: g.short, href: '#/g/' + g.id, v: g.v, cw: g.cw}));
  const winner = C.groups.slice().sort((a, b) => b.chg - a.chg)[0];
  const rc = race(host, {items, parent: A, label: '큰 갈래 10개 — 3개월 경주 · 많이 오른 순: ' + C.groups.map(g => g.short + ' ' + pct(g.chg)).join(', '),
    auto: !state.played && !RM.matches,
    onTick: (k, held, rows) => {
      if (held) { const w = rows.find(r => r.it.key === winner.id), rank = rows.slice().sort((a, b) => (b.cur ?? 0) - (a.cur ?? 0)).indexOf(w) + 1; tell.t.replaceChildren(h('b', {text: md(C.dates[k])}), ` · ${winner.short} ${rank}등 `, pctEl(w.cur - 100)); }
      else tell.t.replaceChildren(h('b', {text: md(C.dates[k])}));
    },
    onDone: () => { tell.t.textContent = `${md(C.base)} → ${md(C.asOf)}`; }});
  state.played = true;
  v.append(legend('365곳'), seg(m => { words(m); rc.setMode(m); }), alt);
  const share = Math.round(F.dd50 / F.n1y * 10);
  v.append(h('div', {class: 'munger'}, h('p', {class: 'mq', text: `이 365곳도 10곳 중 ${share}곳은 지난 1년 사이 꼭대기의 반값 아래로 떨어진 적이 있습니다.`}),
    h('p', {class: 's', text: `반값을 견딜 수 있나요? — ${F.n1y}곳 가운데 ${F.dd50}곳 · ${md(C.asOf)}까지 1년 종가로 셈`})));
  v.append(h('p', {class: 'note', text: `줄을 누르면 5단으로 내려갑니다 — 1단 갈래 → 2단 업종 → 3단 회사 → 4단 지나온 길 → 5단 범위 · 점검. 365곳 가운데 ${F.t26n}곳은 이미 1년에 20% 넘게 올라서 뽑혔기 때문에 선이 좋아 보이기 쉽습니다.`}));
  v.append(foot());
}

// ── 화면 ② 갈래 ──
function viewGroup(v, id) {
  const C = D.core, g = gById(id);
  if (!g) return viewMissing(v);
  const inds = g.inds.map(ind);
  const tell = tellRow(`${md(C.base)} → ${md(C.asOf)}`, () => rc.play());
  const head = h('h1', {class: 'head'}), count = h('p', {class: 'count'}), alt = h('div', {class: 'alt'});
  function words(m) {
    head.replaceChildren(g.name + ' 3개월 ', pctEl(chgOf(g, m), 'span'));
    if (m === 'eq') { count.replaceChildren(`${g.n}곳 중 `, h('b', {class: 'up', text: g.up + '곳 오름'}), ' · ', h('b', {class: 'down', text: g.down + '곳 내림'})); alt.replaceChildren('다르게 보면: 큰 회사는 크게 치면 ', pctEl(g.cwChg), '.'); }
    else { count.replaceChildren('몸값으로 세면 ', pctEl(g.cwChg), ` · 한 회사 한 표로는 `, pctEl(g.chg)); alt.replaceChildren('한 회사 한 표로 세면 ', pctEl(g.chg), ` · ${g.up}곳 오름 · ${g.down}곳 내림.`); }
  }
  words(state.mode);
  const host = h('div');
  v.append(crumbs({href: '#/', text: '한눈에'}, {text: g.short}), steps(1), tell.el, head, h('p', {class: 'say', text: g.say + ` · 업종 ${inds.length}개`}), count, host);
  const items = inds.map(i => ({key: i.name, name: i.name, href: hrefInd(i), v: i.v, cw: i.cw, badge: i.n === 1 ? '1곳' : null}));
  const rc = race(host, {items, parent: g, wide: true, label: `${g.name} 업종 ${inds.length}개 — 3개월 많이 오른 순: ` + inds.map(i => i.name + ' ' + pct(i.chg)).join(', '),
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
  const tell = tellRow(`${md(C.base)} → ${md(C.asOf)}`, () => rc.play());
  const head = h('h1', {class: 'head'}), count = h('p', {class: 'count'}), alt = h('div', {class: 'alt'});
  function words(m) {
    head.replaceChildren(i.name + ' 3개월 ', pctEl(chgOf(i, m), 'span'));
    if (m === 'eq') { count.replaceChildren(`${i.n}곳 중 `, h('b', {class: 'up', text: i.up + '곳 오름'}), ' · ', h('b', {class: 'down', text: i.down + '곳 내림'})); alt.replaceChildren('다르게 보면: 큰 회사는 크게 치면 ', pctEl(i.cwChg), '.'); }
    else { count.replaceChildren('몸값으로 세면 ', pctEl(i.cwChg), ' · 한 회사 한 표로는 ', pctEl(i.chg)); alt.replaceChildren('한 회사 한 표로 세면 ', pctEl(i.chg), ` · ${i.up}곳 오름 · ${i.down}곳 내림.`); }
  }
  words(state.mode);
  const host = h('div');
  v.append(crumbs({href: '#/', text: '한눈에'}, {href: '#/g/' + g.id, text: g.short}, {text: i.name}), steps(2, ['#/g/' + g.id]), tell.el, head, count, host);
  const items = i.members.map(c => ({key: c, name: D.comp[c].name, href: '#/c/' + c, v: D.lines[c].map(x => (x == null ? null : x / 100)), cw: null}));
  const rc = race(host, {items, parent: i, wide: true, label: `${i.name} 회사 ${i.n}곳 — 3개월 많이 오른 순: ` + i.members.map(c => D.comp[c].name + ' ' + pct(D.comp[c].chg3)).join(', '),
    onTick: k => tell.t.replaceChildren(h('b', {text: md(C.dates[k])})), onDone: () => { tell.t.textContent = `${md(C.base)} → ${md(C.asOf)}`; }});
  v.append(legend(i.name), seg(m => { words(m); rc.setMode(m); }), alt);
  v.append(h('p', {class: 'note', text: '회사 줄은 그 회사 주가 그대로라 두 보기에서 같습니다 — 바뀌는 것은 흰 점선(업종 평균)과 맨 위 숫자입니다.'}));
  v.append(foot());
}

// ── 화면 ④ 회사 ──
async function viewCompany(v, code) {
  await needComp();
  const C = D.core, c = D.comp[code];
  if (!c) return viewMissing(v, code);
  const i = ind(c.i), g = gById(c.g), line = D.lines[code].map(x => (x == null ? null : x / 100));
  v.append(crumbs({href: '#/', text: '한눈에'}, {href: '#/g/' + g.id, text: g.short}, i.n > 1 ? {href: hrefInd(i), text: i.name} : {text: i.name + '(1곳)'}));
  v.append(steps(3, ['#/g/' + g.id, i.n > 1 ? hrefInd(i) : null, null, `#/c/${code}/past`]));
  v.append(h('div', {class: 'co-head'}, h('h1', {text: c.name}), h('small', {text: `${c.market === 'KOSPI' ? '코스피' : '코스닥'} · ${code} · 1주 ${won(c.price)}`})));
  const keep = r1(100 + c.mdd3) / 100;
  v.append(h('div', {class: 'trio'},
    h('div', {}, h('span', {text: '3개월'}), pctEl(c.chg3)),
    h('div', {}, h('span', {text: '1년'}), pctEl(c.r1y)),
    h('div', {}, h('span', {text: '가장 깊이 빠짐'}), pctEl(c.mdd3))));
  v.append(h('p', {class: 'won', text: `100만 원어치였다면 3개월 안 가장 나쁠 때 ${Math.round(keep * 100).toLocaleString('ko-KR')}만 원이었습니다.`}));
  v.append(h('p', {class: 'src', text: `네이버 증권 · ${md(c.priceDate || C.asOf)} 종가 · ATLAS 셈`}));
  const slot36 = h('div'); v.append(slot36);
  needPick().then(() => { const p = D.pick.picks.find(x => x.code === code); if (p && slot36.isConnected) slot36.append(h('p', {class: 'in36'}, `월요일 매수 검토 36곳 가운데 ${p.rank}번째(번 길 ${r1(p.avg).toFixed(1)}%) · `, h('a', {href: '#/36', text: '36곳과 지난 기록 시험 보기'}))); }).catch(() => {});
  const chartHost = h('div');
  v.append(chartHost);
  const draw = () => lineChart(chartHost, {v: line, avg: i.n > 1 ? i.v : null, label: `${c.name} 3개월 선 — ${md(C.base)} = 100에서 ${pct(c.chg3)} · 가장 깊이 빠짐 ${pct(c.mdd3)}`});
  draw(); chartDraw = draw;
  v.append(h('p', {class: 'lkey'}, h('span', {}, h('i', {class: 'l-co'}), `${c.name} — ${md(C.base)}보다 위 빨강 · 아래 파랑`), i.n > 1 ? h('span', {}, h('i', {class: 'l-avg'}), i.name + ' 평균') : null, h('span', {}, h('i', {class: 'l-pick'}), `고른 기준일 ${md(C.pickAsOf)}`)));
  // 왜 365곳에 들었나(클로드팀) — 고를 때 값 · 남의 짐작은 꼬리표 · 앞날 숫자는 쓰지 않음
  const p = c.pick, gk = p.gkey === 'net' ? '순이익' : '영업이익';
  const why = h('div', {class: 'box'}, h('h2', {text: '왜 365곳에 들었나요?'}));
  if (p.t26) why.append(h('p', {}, '2026 흐름: 고를 때(', md(C.pickAsOf), '까지) 1년 주가 ', pctEl(p.r1y), ' · 20% 넘게 오름'));
  if (p.gsrc === 'e') why.append(h('p', {}, `이익: ${fy(p.estLabel)} ${gk}을 증권사들이 ${fy(c.fin?.b)}보다 많게 짐작함`, h('span', {class: 'tag', text: '남의 짐작'})));
  else if (p.gsrc === 'a') why.append(h('p', {text: `이익: ${gk} 기록이 늘어남(${fy(c.fin?.a)} → ${fy(c.fin?.b)})`}));
  if (p.t27) why.append(h('p', {}, `2027 흐름: 2027 정부 예산안 · 9월 수출에 나온 업종(${p.theme})`, h('span', {class: 'tag', text: 'ATLAS가 묶음'})));
  why.append(h('p', {class: 'small', text: '기본 문 여섯(흑자 · 빚 · 몸값 · 거래 · 기록 1년 · 보통주)을 지났을 뿐, 좋은 회사로 매긴 것은 아닙니다.'}));
  v.append(why);
  v.append(nextStep(`#/c/${code}/past`, '4단 지나온 길', '1년 · 3년 주가 · 해마다 번 돈 · 몸값'));
  v.append(foot());
}
function nextStep(href, title, sub) { return h('a', {class: 'nextst', href}, h('span', {}, h('b', {text: title}), h('span', {text: sub})), h('span', {class: 'chev', 'aria-hidden': 'true', text: '›'})); }

// ── 4단 지나온 길 — 1주 값 3개월 · 1년 · 3년(365곳 평균 점선) · 해마다 번 돈 · 몸값 ──
const PERIODS = [['3m', '3개월', 64], ['1y', '1년', 253], ['3y', '3년', 757]];
async function viewPast(v, code) {
  await needComp();
  const C = D.core, c = D.comp[code];
  if (!c) return viewMissing(v, code);
  await Promise.all([needDays(), needCo(code).then(x => { D.co = x; })]);
  const co = await needCo(code), dd = D.days, i = ind(c.i), g = gById(c.g);
  v.append(crumbs({href: '#/', text: '한눈에'}, {href: '#/g/' + g.id, text: g.short}, i.n > 1 ? {href: hrefInd(i), text: i.name} : {text: i.name + '(1곳)'}, {href: '#/c/' + code, text: c.name}));
  v.append(steps(4, ['#/g/' + g.id, i.n > 1 ? hrefInd(i) : null, '#/c/' + code, null, `#/c/${code}/range`]));
  v.append(h('div', {class: 'co-head'}, h('h1', {text: c.name + ' — 지나온 길'}), h('small', {text: `1주 값 · ${md(dd.asOf)} 종가까지`})));
  const stat = h('div', {class: 'trio'}), wonLine = h('p', {class: 'won'}), chartHost = h('div'), key = h('p', {class: 'lkey'}), jumpNote = h('div');
  let per = state.per || '1y';
  const segBox = h('div', {class: 'seg seg3', role: 'group', 'aria-label': '기간 바꾸기'});
  const btns = PERIODS.map(([id, name]) => { const b = h('button', {type: 'button', 'aria-pressed': String(id === per), text: name}); b.addEventListener('click', () => { per = state.per = id; btns.forEach((x, k) => x.setAttribute('aria-pressed', String(PERIODS[k][0] === per))); draw(); }); return b; });
  segBox.append(...btns);
  v.append(segBox, stat, wonLine, chartHost, key, jumpNote);
  const nAll = dd.dates.length, k0 = co.k0;
  function draw() {
    const len = PERIODS.find(p => p[0] === per)[2], from = Math.max(k0, nAll - len);
    const dates = dd.dates.slice(from), cl = co.close.slice(from - k0), base = cl.find(x => x != null);
    const allv = dd.all.slice(from), avg = allv.map(x => x / allv[0] * base);
    const last = [...cl].reverse().find(x => x != null);
    let peak = 0, m = 0; for (const x of cl) { if (x == null) continue; peak = Math.max(peak, x); m = Math.min(m, x / peak - 1); }
    const name = PERIODS.find(p => p[0] === per)[1], short = from === k0 && nAll - len < k0;
    stat.replaceChildren(
      h('div', {}, h('span', {text: name + (short ? '(상장 뒤)' : '')}), pctEl((last / base - 1) * 100)),
      h('div', {}, h('span', {text: '가장 깊이 빠짐'}), pctEl(m * 100)),
      h('div', {}, h('span', {text: '꼭대기에서 지금'}), pctEl((last / peak - 1) * 100)));
    const lastK = cl.length - 1 - [...cl].reverse().findIndex(x => x != null);
    wonLine.textContent = `1주 ${ymd(dates[cl.findIndex(x => x != null)])} ${won(base)} → ${ymd(dates[lastK])} ${won(last)}`;
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
  v.append(h('div', {class: 'box'}, h('h2', {text: '몸값'}), h('ul', {class: 'chk'},
    h('li', {}, h('span', {class: 'm ok', text: '·'}), h('span', {}, h('b', {text: '시가총액 '}), eok(c.cap))),
    h('li', {}, h('span', {class: 'm ' + (co.per != null ? 'ok' : 'q'), text: co.per != null ? '·' : '?'}), h('span', {}, h('b', {text: '1년 순이익의 '}), co.per != null ? `${r1(co.per).toFixed(1)}배(365곳 가운데값 ${r1(C.facts.perMedian).toFixed(1)}배)` : '? 자료 없음')),
    h('li', {}, h('span', {class: 'm ' + (co.pbr != null ? 'ok' : 'q'), text: co.pbr != null ? '·' : '?'}), h('span', {}, h('b', {text: '장부 값의 '}), co.pbr != null ? `${r1(co.pbr).toFixed(1)}배` : '? 자료 없음')),
    ly >= 0 ? h('li', {}, h('span', {class: 'm ok', text: '·'}), h('span', {}, h('b', {text: `${fy(f.years[ly])} 빚 · 이익률 `}), `부채비율 ${f.debt?.[ly] != null ? r1(f.debt[ly]).toFixed(1) + '%' : '?'} · 자기자본 이익률 ${f.roe?.[ly] != null ? r1(f.roe[ly]).toFixed(1) + '%' : '?'}`)) : null)));
  v.append(h('p', {class: 'src', text: '네이버 증권 · 결산 · 10월 10일 모음'}));
  v.append(nextStep(`#/c/${code}/range`, '5단 범위 · 점검', '몬테카를로 4방향 · 사기 전에 볼 것 · 확인할 곳'));
  v.append(foot());
}

function priceChart(host, {dates, close, avg, jumps, label}) {
  host.textContent = '';
  const wrap = h('div', {class: 'lc'}); host.append(wrap);
  const n = close.length, W = Math.max(260, Math.round(wrap.getBoundingClientRect().width || 320)), H = 220, P = 10;
  const vals = [...close, ...avg].filter(x => x != null);
  if (!vals.length) { wrap.append(h('p', {class: 'q', text: '? 이 기간 값을 못 읽었습니다'})); return; }
  let lo = Math.min(...vals), hi = Math.max(...vals); const pad = (hi - lo) * 0.06 || 1; lo -= pad; hi += pad;
  const X = i => P + i * (W - 2 * P) / Math.max(1, n - 1), Y = y => P + (hi - y) * (H - 2 * P) / (hi - lo);
  const base = close.find(x => x != null), id = 'pc' + (++lcN);
  const svg = sv('svg', {viewBox: `0 0 ${W} ${H}`, width: W, height: H, role: 'img', 'aria-label': label});
  const defs = sv('defs'); const cu = sv('clipPath', {id: id + 'u'}); cu.append(sv('rect', {x: 0, y: 0, width: W, height: Y(base)})); const cd = sv('clipPath', {id: id + 'd'}); cd.append(sv('rect', {x: 0, y: Y(base), width: W, height: H - Y(base)})); defs.append(cu, cd); svg.append(defs);
  svg.append(sv('line', {x1: P, x2: W - P, y1: Y(base), y2: Y(base), stroke: '#A9A3CC', 'stroke-width': 1.5, 'stroke-dasharray': '5 5'}));
  const path = arr => { let d = '', on = false; arr.forEach((y, i) => { if (y == null) { on = false; return; } d += (on ? 'L' : 'M') + X(i).toFixed(1) + ' ' + Y(y).toFixed(1); on = true; }); return d; };
  svg.append(sv('path', {d: path(avg), fill: 'none', stroke: '#CDBEF6', 'stroke-width': 2.5, 'stroke-dasharray': '2 6', 'stroke-linecap': 'round'}));
  const d = path(close);
  svg.append(sv('path', {d, fill: 'none', stroke: '#FF5A66', 'stroke-width': 3, 'stroke-linejoin': 'round', 'clip-path': `url(#${id}u)`}));
  svg.append(sv('path', {d, fill: 'none', stroke: '#5C97FF', 'stroke-width': 3, 'stroke-linejoin': 'round', 'clip-path': `url(#${id}d)`}));
  for (const [dt] of jumps) { const k = dates.indexOf(dt); if (k >= 0 && close[k] != null) svg.append(sv('circle', {cx: X(k), cy: Y(close[k]), r: 7, fill: 'none', stroke: '#E9C46A', 'stroke-width': 3})); }
  const lastK = close.map((x, i) => (x == null ? -1 : i)).filter(i => i >= 0).pop();
  svg.append(sv('circle', {cx: X(lastK), cy: Y(close[lastK]), r: 5.5, fill: close[lastK] >= base ? '#FF5A66' : '#5C97FF', stroke: '#111433', 'stroke-width': 2}));
  const cx = sv('line', {y1: P, y2: H - P, stroke: '#F3F1FC', 'stroke-width': 1.5}), dot = sv('circle', {r: 6, fill: '#F3F1FC'}); cx.setAttribute('visibility', 'hidden'); dot.setAttribute('visibility', 'hidden'); svg.append(cx, dot);
  wrap.append(svg);
  const yt = h('span', {class: 'yl num', text: won(Math.round(hi))}), yb = h('span', {class: 'yl num', text: won(Math.round(lo))}); yt.style.top = '0'; yb.style.top = (H - 30) + 'px'; wrap.append(yt, yb);
  const tip = h('div', {class: 'tip num'}); tip.hidden = true; wrap.append(tip);
  wrap.append(h('div', {class: 'ax'}, h('span', {text: ymd(dates[0])}), h('span', {text: ymd(dates[n - 1])})));
  const mv = e => { const r = svg.getBoundingClientRect(), x = (e.clientX - r.left) * W / r.width; let i = Math.round((x - P) / ((W - 2 * P) / Math.max(1, n - 1))); i = Math.max(0, Math.min(n - 1, i)); if (close[i] == null) return;
    cx.setAttribute('x1', X(i)); cx.setAttribute('x2', X(i)); cx.setAttribute('visibility', 'visible'); dot.setAttribute('cx', X(i)); dot.setAttribute('cy', Y(close[i])); dot.setAttribute('visibility', 'visible');
    tip.hidden = false; tip.textContent = `${ymd(dates[i])} · ${won(close[i])} · ${pct((close[i] / base - 1) * 100)}`; tip.style.left = Math.min(r.width - 120, Math.max(120, X(i) * r.width / W)) + 'px'; };
  svg.addEventListener('pointermove', mv); svg.addEventListener('pointerdown', mv); svg.addEventListener('pointerleave', () => { cx.setAttribute('visibility', 'hidden'); dot.setAttribute('visibility', 'hidden'); tip.hidden = true; });
}

// ── 5단 범위 · 점검 — 몬테카를로 4방향(36곳 셈 · 모든 365곳) · 사기 전에 볼 것 · 확인할 것 ──
async function viewRange(v, code) {
  await Promise.all([needComp(), needPick()]);
  const C = D.core, c = D.comp[code];
  if (!c) return viewMissing(v, code);
  const i = ind(c.i), g = gById(c.g), K = D.pick, k = K.companies[code], S = K.spec, B = K.backtest;
  v.append(crumbs({href: '#/', text: '한눈에'}, {href: '#/g/' + g.id, text: g.short}, i.n > 1 ? {href: hrefInd(i), text: i.name} : {text: i.name + '(1곳)'}, {href: '#/c/' + code, text: c.name}, {href: `#/c/${code}/past`, text: '지나온 길'}));
  v.append(steps(5, ['#/g/' + g.id, i.n > 1 ? hrefInd(i) : null, '#/c/' + code, `#/c/${code}/past`]));
  v.append(h('div', {class: 'co-head'}, h('h1', {text: c.name + ' — 범위 · 점검'}), h('small', {text: `${md(K.asOf)} 종가 · ${S.horizon}거래일(약 한 달) 뒤`})));
  const box = h('div', {class: 'box'}, h('h2', {text: '시장이 이렇게 가면 — 몬테카를로 4방향'}));
  if (!k || !k.ok) box.append(h('p', {class: 'q', text: '? 셈 못 함 — 어느 한 방향에서 이 회사 값이 있는 날이 20일이 안 됩니다.'}));
  else {
    const list = h('ul', {class: 'dirbars'});
    K.dirs.forEach((d, j) => { const w = k.win[j], b = k.big[j], bw = h('i', {class: 'db pos'}), bb = h('i', {class: 'db neg'}); bw.style.width = w + '%'; bb.style.width = b + '%';
      list.append(h('li', {}, h('b', {class: 'dn', text: d.name}), h('span', {class: 'dl'}, h('span', {class: 'dt'}, bw), h('span', {class: 'num', text: `번 길 ${r1(w).toFixed(1)}%`})), h('span', {class: 'dl'}, h('span', {class: 'dt'}, bb), h('span', {class: 'num', text: `크게 잃는 길 ${r1(b).toFixed(1)}%`})))); });
    box.append(h('p', {class: 'small', text: `방향마다 지난 날들에서 20일을 뽑아 ${S.paths.toLocaleString('ko-KR')}번 — 번 길 = 사고팔 돈 0.3% 빼고 남음 · 크게 잃는 길 = −15% 밑`}), list);
    const status = k.rank ? `월요일 매수 검토 36곳 가운데 ${k.rank}번째(번 길 4방향 평균 ${r1(k.avg).toFixed(1)}%)` : k.cut ? `지움 — 가장 나쁜 방향에서 크게 잃는 길(${r1(k.worst).toFixed(1)}%)이 큰 3분의 1에 들었습니다` : `남았지만 36곳 밖 — 번 길 4방향 평균 ${r1(k.avg).toFixed(1)}%`;
    box.append(h('p', {class: 'alt'}, h('b', {text: status}), ' · ', h('a', {class: 'inl', href: '#/36', text: '36곳 보기'})));
  }
  if (B) box.append(h('p', {class: 'small', text: `모형 가정 아래 셈일 뿐 앞날 값이 아닙니다 — 같은 셈은 지난 ${B.n}번 가운데 ${B.wins}번만 365곳 평균보다 나았습니다.`}));
  v.append(box);
  const p = c.pick;
  // 사기 전에 볼 것(멍거팀) — 기록으로 채울 수 있는 것만 · 모르면 ?
  const f = c.fin, fk = f ? (f.key === 'net' ? '순이익' : '영업이익') : '이익';
  const rec = f && f.av != null ? (f.bv > f.av ? 'ok' : 'no') : 'q';
  const li = (m, ...kids) => h('li', {}, h('span', {class: 'm ' + m, 'aria-hidden': 'true', text: m === 'ok' ? '✓' : m === 'no' ? '!' : '?'}), h('span', {}, ...kids));
  const chk = h('ul', {class: 'chk'},
    li(rec, h('b', {text: '번 돈(기록) '}), f && f.av != null ? `${fk} ${fy(f.a)} ${eok(f.av)} → ${fy(f.b)} ${eok(f.bv)} · ${f.bv > f.av ? '늘었음' : '줄었음'}` : h('span', {class: 'q', text: '? 두 해 기록이 없음'}), rec === 'no' && p.gsrc === 'e' ? h('span', {class: 'tag', text: '짐작으로 고름'}) : null),
    li(c.mdd1y != null && c.mdd1y <= -50 ? 'no' : 'ok', h('b', {text: '지나온 1년 '}), '1년 ', pctEl(c.r1y, 'span'), ' · 1년 안 가장 깊이 빠짐 ', pctEl(c.mdd1y, 'span')),
    li(c.per != null ? 'ok' : 'q', h('b', {text: '몸값 '}), `시가총액 ${eok(c.cap)}`, c.per != null ? ` · 1년 순이익의 ${r1(c.per).toFixed(1)}배(365곳 가운데값 ${r1(C.facts.perMedian).toFixed(1)}배)` : h('span', {class: 'q', text: ' · 순이익 몇 배인지 ? 자료 없음'})),
    li('ok', h('b', {text: '1주 값 '}), `${won(c.price)}(${md(c.priceDate || C.asOf)} 종가) — 한 주의 값일 뿐, 싸고 비쌈이 아닙니다`),
    li(g.low.below / g.n >= 0.8 ? 'no' : 'ok', h('b', {text: '쏠림 '}), `같은 갈래 ${g.n}곳 중 ${g.low.below}곳이 ${md(C.dates[g.low.k])}에 함께 ${md(C.base)}보다 아래`),
    li('q', h('b', {text: '파는 것 '}), c.products ? `${c.products.split(',').slice(0, 2).join(',').trim()} — 한 줄로 말할 수 있나요?` : h('span', {class: 'q', text: '? 자료 없음 — 한 줄로 말할 수 있나요?'})),
    li('q', h('b', {text: '거래정지 · 관리종목 '}), h('span', {class: 'q', text: '? 확인 못 함'}), ' — 아래 「확인할 것」'));
  v.append(h('div', {class: 'box'}, h('h2', {text: '사기 전에 볼 것'}), chk));
  // 확인할 것(CIA팀) — 어디서 · 언제
  const more = h('details', {class: 'more'}, h('summary', {text: '확인할 것 — 어디서 · 언제'}), h('div', {class: 'in'}, h('ol', {},
    h('li', {}, '거래정지 · 관리종목 · 투자경고: ', h('a', {href: 'https://kind.krx.co.kr', rel: 'noopener', target: '_blank', text: 'KIND(한국거래소)'}), ' — ATLAS 는 아직 이 표시를 거르지 못합니다(?).'),
    h('li', {}, '3분기 실제 이익: ', h('a', {href: 'https://dart.fss.or.kr', rel: 'noopener', target: '_blank', text: 'DART(전자공시)'}), ' 분기보고서 — 11월 중순까지. 증권사 짐작과 견줘 보세요.'),
    h('li', {}, '주식 수 바뀜(쪼개기 · 증자): DART 주요사항보고서 — 3개월 선이 하루 30% 넘게 튄 곳은 없었습니다.'),
    p.t27 ? h('li', {}, '2027 예산 국회 통과: ', h('a', {href: 'https://www.korea.kr', rel: 'noopener', target: '_blank', text: '정책브리핑'}), ' — 국회 의결 기한 12월 2일.') : null,
    p.t27 ? h('li', {text: '그 물건 수출: 산업통상부 「수출입 동향」 — 매달 1일.'}) : null)));
  v.append(more);
  v.append(h('p', {class: 'links2'}, h('a', {href: '#/c/' + code, text: '3단 회사로'}), h('a', {href: '#/', text: '처음 화면으로'})));
  v.append(foot());
}

// ── 화면 ⑥ 월요일 36곳(사장님 00:15 「몬테카를로 1억 × 4방향 → 소거법 → 36개 · 각 한 주씩」) — 지난 기록 시험을 맨 위에 그대로 ──
async function view36(v) {
  await Promise.all([needPick(), needComp()]);
  const C = D.core, K = D.pick, S = K.spec, B = K.backtest;
  const tell = tellRow(`${md(K.asOf)} 종가 · ${S.horizon}거래일(약 한 달) 뒤를 셈`, null);
  v.append(tell.el, h('h1', {class: 'head', text: `월요일 매수 검토 ${K.picks.length}곳`}),
    h('p', {class: 'count', text: `몬테카를로 ${Math.round(S.totalPairs / 1e8)}억 길(찾기 4방향 + 지우기 4방향) · ${K.eligible}곳 셈 → ${K.cutN}곳 지움 → ${K.picks.length}곳`}));
  if (B) {
    const box = h('div', {class: 'test'}, h('h2', {text: '먼저 — 지난 기록에서는?'}),
      h('p', {class: 'big', text: `같은 셈을 지난 ${B.n}번에 대입했더니, 36곳이 365곳 평균보다 나았던 때는 ${B.wins}번(${Math.round(B.rate * 100)}%)뿐입니다.`}),
      h('p', {}, '한 달 평균: 36곳 ', pctEl(B.meanPick), ' · 365곳 ', pctEl(B.meanAll), ` — ${B.passes ? '문턱을 넘었습니다.' : '아무거나 고른 것보다 못했습니다. 정해 둔 문턱(60% · 두 절반 55%)을 못 넘어 「통한다」고 할 수 없습니다.'}`));
    box.append(h('p', {class: 'small', text: `시험 기간: ${ymd(B.rows[0].t)} ~ ${ymd(B.rows[B.rows.length - 1].to)} · 한 달(20거래일)씩. 그 전 넉 달은 내리는 장 날이 20일이 안 되어 셀 수 없었습니다(기준대로 뺌).`}));
    const host = h('div', {class: 'bt'}); box.append(host); v.append(box);
    btChart(host, B.rows);
    box.append(h('p', {class: 'small note', text: '막대 하나 = 한 번의 시험(한 달) · 위 빨강 = 36곳이 365곳 평균보다 나음 · 아래 파랑 = 못함.'}));
  }
  v.append(h('div', {class: 'dirs4'}, ...K.dirs.map(d => h('div', {}, h('b', {text: d.name}), h('span', {text: `지난 ${K.window.days}거래일 가운데 ${d.days}일`})))));
  v.append(h('p', {class: 'note', text: `「4방향」 = 시장이 갈 방향 넷. 어느 쪽이 올지는 모른다고 보고 넷을 같은 무게로 셌습니다. 지난 2년은 오르는 장이 많아 내리는 장 날이 적습니다.`}));
  const ol = h('ol', {class: 'p36'});
  for (const p of K.picks) { const c = D.comp[p.code];
    ol.append(h('li', {}, h('a', {href: '#/c/' + p.code}, h('span', {class: 'no num', text: p.rank}), h('span', {class: 'nm', text: p.name}), h('b', {class: 'val num', text: '번 길 ' + r1(p.avg).toFixed(1) + '%'}),
      h('span', {class: 'g2', text: `${p.i} · 1주 ${won(p.price)} · 크게 잃는 길 ${r1(p.worst).toFixed(1)}%(가장 나쁜 방향) · 3개월 ${pct(c.chg3)}`})))); }
  v.append(h('h2', {class: 'sec', text: `${K.picks.length}곳 — 번 길 많은 순`}), h('p', {text: `번 길 = ${S.horizon}거래일 뒤 사고팔 돈(0.3%)을 빼고도 남은 길의 몫 · 4방향 평균`}), ol);
  v.append(h('div', {class: 'alt'}, `${K.picks.length}곳을 1주씩이면 합계 `, h('b', {class: 'num', text: won(K.total)}), ` — ${md(K.asOf)} 종가로 셈 · 월요일 값은 다릅니다.`));
  v.append(h('details', {class: 'more'}, h('summary', {text: '어떻게 셌나요 — 돌리기 전에 정한 기준'}), h('div', {class: 'in'}, h('ul', {},
    h('li', {text: `방향: 날마다 그날로 끝나는 20거래일 시장(365곳 같은 무게)으로 가름 — 흔들림이 위 25%면 크게 출렁이는 장, 아니면 +3% 넘게 오름 · −3% 넘게 내림 · 그 사이`}),
    h('li', {text: `길: 그 방향 날들에서 20일을 뽑아 365곳에 똑같이 적용(함께 움직임을 지킴) · 방향마다 ${S.paths.toLocaleString('ko-KR')}길 × 365곳 = 약 1억`}),
    h('li', {text: `찾기: 번 길의 몫(사고팔 돈 0.3% 빼고) · 지우기: 다른 난수로 다시 돌려 −15% 넘게 잃는 길의 몫이 가장 나쁜 방향에서 큰 순으로 3분의 1`}),
    h('li', {text: `고르기: 남은 곳에서 번 길 많은 순 · 한 업종 ${S.perIndustry}곳까지 · 기준을 먼저 적어 둔 기록(커밋 73f94cca)`}),
    h('li', {text: '지난 기록 시험: 2024년 7월부터 한 달(20거래일)마다 그날까지 자료로만 같은 셈(길은 방향마다 1천만) → 한 달 뒤 값으로 채점'}),
    h('li', {text: '한계: 365곳은 10월 2일까지 자료로 고른 곳이라 이미 오른 회사가 많습니다. 모형 가정 아래 셈일 뿐 앞날 값이 아닙니다.'})))));
  v.append(foot());
}
function btChart(host, rows) {
  const W = Math.max(260, Math.round(host.getBoundingClientRect().width || 320)), Hh = 150, P = 8, n = rows.length;
  const ex = rows.map(r => r.pick - r.all), M = Math.max(1, ...ex.map(Math.abs)) * 1.1;
  const bw = (W - 2 * P) / n, Y = x => Hh / 2 - x / M * (Hh / 2 - P);
  const svg = sv('svg', {viewBox: `0 0 ${W} ${Hh}`, width: W, height: Hh, role: 'img', 'aria-label': `지난 ${n}번 시험 — 36곳이 365곳 평균보다 나은 때 ${ex.filter(x => x > 0).length}번`});
  svg.append(sv('line', {x1: P, x2: W - P, y1: Y(0), y2: Y(0), stroke: '#A9A3CC', 'stroke-width': 1.5}));
  ex.forEach((x, k) => { const y0 = Y(0), y1 = Y(x); svg.append(sv('rect', {x: (P + k * bw + bw * 0.15).toFixed(1), y: Math.min(y0, y1).toFixed(1), width: (bw * 0.7).toFixed(1), height: Math.max(1, Math.abs(y1 - y0)).toFixed(1), rx: 2, fill: x > 0 ? '#FF5A66' : '#5C97FF'})); });
  host.append(svg);
  host.append(h('div', {class: 'ax'}, h('span', {text: ymd(rows[0].t)}), h('span', {text: ymd(rows[n - 1].t)})));
  const tip = h('div', {class: 'tip num'}); tip.hidden = true; host.append(tip);
  const mv = e => { const r = svg.getBoundingClientRect(); let k = Math.floor(((e.clientX - r.left) * W / r.width - P) / bw); k = Math.max(0, Math.min(n - 1, k)); const q = rows[k];
    tip.hidden = false; tip.textContent = `${md(q.t)} · 36곳 ${pct(q.pick)} · 365곳 ${pct(q.all)}`; tip.style.left = Math.min(r.width - 120, Math.max(120, (P + (k + 0.5) * bw) * r.width / W)) + 'px'; };
  svg.addEventListener('pointermove', mv); svg.addEventListener('pointerdown', mv); svg.addEventListener('pointerleave', () => { tip.hidden = true; });
}

// ── 화면 ⑤ 업종 63 ──
function viewList(v) {
  const C = D.core;
  const multi = C.industries.filter(i => i.n > 1).sort((a, b) => b.chg - a.chg), single = C.industries.filter(i => i.n === 1).sort((a, b) => b.chg - a.chg);
  v.append(h('h1', {class: 'head', text: `업종 ${C.industries.length}개 — 3개월 많이 오른 순`}), h('p', {class: 'count', text: `${md(C.base)} → ${md(C.asOf)} · 큰 갈래와 상관없이 업종만 줄 세웠습니다.`}));
  const mk = (list, label) => { const host = h('div'); v.append(host); race(host, {items: list.map(i => ({key: i.name, name: i.name, href: hrefInd(i), v: i.v, cw: i.cw, badge: gById(i.g).short})), parent: null, wide: true, label}); };
  v.append(h('h2', {class: 'sec', text: `회사 2곳 이상인 업종 ${multi.length}개`}));
  mk(multi, `회사 2곳 이상 업종 ${multi.length}개 — 3개월 많이 오른 순`);
  v.append(h('h2', {class: 'sec', text: `회사 1곳뿐인 업종 ${single.length}개`}), h('p', {text: '업종 평균이 아니라 그 회사 하나의 값입니다.'}));
  mk(single, `회사 1곳뿐인 업종 ${single.length}개`);
  v.append(foot());
}
function viewMissing(v, code) {
  v.append(h('h1', {class: 'head', text: '없는 주소입니다'}), h('p', {class: 'count', text: code ? `「${code}」는 365곳에 없습니다. 찾기로 이름을 쳐 보세요.` : '주소가 바뀌었거나 잘못 들어왔습니다.'}), h('p', {}, h('a', {class: 'play', href: '#/', text: '처음 화면으로'})));
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
  if (!hits.length) { hint.textContent = `「${q}」 — 찾는 이름이 없습니다. 코스피 · 코스닥 ${D.names.funnel.universe.toLocaleString('ko-KR')}곳(10월 5일 모음) 안에 없는 이름입니다. 띄어쓰기를 빼거나 첫 글자로도 찾아보세요.`; return; }
  hint.textContent = `「${q}」 — ${hits.length >= 40 ? '앞 40개' : hits.length + '개'}`;
  for (const x of hits) {
    if (x.kind === 'g') ul.append(h('li', {}, h('a', {href: '#/g/' + x.g.id, 'data-go': '1'}, h('span', {class: 'nm', text: x.g.name}), pctEl(x.g.chg), h('span', {class: 'g2', text: `큰 갈래 · ${x.g.n}곳`}))));
    else if (x.kind === 'i') ul.append(h('li', {}, h('a', {href: hrefInd(x.i), 'data-go': '1'}, h('span', {class: 'nm', text: x.i.name}), pctEl(x.i.chg), h('span', {class: 'g2', text: `업종 · ${gById(x.i.g).short} · ${x.i.n}곳`}))));
    else if (x.r.s === 'in') { const c = D.comp[x.r.c]; ul.append(h('li', {}, h('a', {href: '#/c/' + x.r.c, 'data-go': '1'}, h('span', {class: 'nm', text: x.r.n}), pctEl(c.chg3), h('span', {class: 'g2', text: `${c.i} · ${gById(c.g).short} · 3개월`})))); }
    else ul.append(h('li', {class: 'out'}, h('a', {href: '#/x/' + x.r.c, 'data-go': '1'}, h('span', {class: 'nm', text: x.r.n}), h('span', {class: 'chip', text: '365곳 밖'}), h('span', {class: 'g2', text: x.r.w}))));
  }
}

// ── 도움말 · 365곳 밖(깔때기) ──
function funnel(stop) {
  const F = D.core.funnel, R = D.core.rules, steps = [
    {k: 'universe', n: F.universe, t: '코스피 · 코스닥 시가총액 목록(10월 5일 모음)'},
    {k: 'gate', n: F.gate, t: '기본 문 여섯 — 흑자 · 빚 · 몸값 · 거래 · 기록 1년 · 보통주'},
    {k: 'union', n: F.union, t: '흐름 문 — 1년 20% 넘게 오르고 이익이 늘어남, 또는 2027 흐름 업종에 이익이 늘어남'},
    {k: 'picked', n: F.picked, t: '시가총액 큰 순 — 두 흐름 모두 든 곳부터'}];
  const at = {gate: 1, trend: 2, cut: 3}[stop] ?? 4;
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
    const stopName = {gate: '기본 문', trend: '흐름 문', cut: '365곳 자르기'}[r.s];
    body.append(h('p', {text: `${josa(r.n, '은', '는')} ${stopName}에서 멈췄습니다(${r.m === 'KOSPI' ? '코스피' : '코스닥'}).`}), h('div', {class: 'why', text: r.w}), funnel(r.s));
    body.append(h('p', {class: 'note', text: '365곳은 10월 2일 종가 · 10월 5일 모은 결산으로 한 번 고른 것입니다. 들고 빠짐은 다음에 다시 고를 때 바뀔 수 있습니다.'}));
    return;
  }
  $('#infoTitle').textContent = 'ATLAS 는 어떻게 셌나요';
  body.append(h('p', {text: `한국 우량주 365곳이 지난 3개월(${md(C.base)} → ${md(C.asOf)}) 어떻게 움직였는지, 큰 갈래 → 업종 → 회사로 세 번 눌러 봅니다. 앞날 값은 내지 않습니다.`}));
  body.append(h('h2', {class: 'sec', text: '365곳은 이렇게 골랐습니다'}), funnel(null));
  body.append(h('details', {class: 'more'}, h('summary', {text: '기본 문 여섯 · 흐름 문 — 원문'}), h('div', {class: 'in'}, h('ul', {}, ...D.core.rules.gate.map(t => h('li', {text: t})), h('li', {text: '2026 흐름: ' + D.core.rules.t26}), h('li', {text: '2027 흐름: ' + D.core.rules.t27})))));
  body.append(h('p', {class: 'note', text: `365곳 가운데 ${F.t26n}곳은 이미 1년에 20% 넘게 올라서 뽑혔습니다 — 그래서 3개월 선이 좋아 보이기 쉽습니다(3개월 가운데값: 그 ${F.t26n}곳 ${pct(F.t26med)} · 업종으로만 든 ${F.t27n}곳 ${pct(F.t27med)}).`}));
  body.append(h('h2', {class: 'sec', text: '셈'}), h('ul', {class: 'note'},
    h('li', {text: `${md(C.base)} 종가 = 100. 「한 회사 한 표」 = 날마다 회사들의 오르내림을 같은 무게로 평균 내어 이어 곱함(하루 ±50% 넘는 값은 자료 오류로 뺌).`}),
    h('li', {text: `「큰 회사는 크게」 = ${md(C.base)}에 시가총액만큼 사 두었다고 보고 그대로 둔 값.`}),
    h('li', {text: '배당은 넣지 않은 주가만 셉니다. 「가장 깊이 빠짐」 = 꼭대기에서 가장 많이 내려간 비율.'})));
  body.append(h('h2', {class: 'sec', text: '자료 · 때'}), h('ul', {class: 'note'}, h('li', {text: C.sources.price}), h('li', {text: C.sources.pick}), h('li', {text: C.sources.budget})));
  body.append(h('h2', {class: 'sec', text: '모르는 것 ?'}), h('ul', {class: 'note'},
    h('li', {text: '? 거래정지 · 관리종목 · 투자경고 표시 — 아직 거르지 못합니다.'}),
    h('li', {text: `? 고른 뒤 기록 — ${md(C.pickAsOf)} 뒤 ${C.days - C.kPick}거래일뿐이라 아직 짧습니다.`}),
    h('li', {text: '? 증권사 짐작 — 자주 바뀝니다. 짐작은 고른 까닭에만 쓰고 앞날 숫자로 보여 주지 않습니다.'})));
  const th = h('details', {class: 'more'}, h('summary', {text: '2027 흐름 업종 10가지 — 근거'}), h('div', {class: 'in'}, h('ul', {}, ...Object.entries(C.rules.themes).map(([t, ev]) => h('li', {text: `${t}: ${ev}`})))));
  body.append(th, foot());
}

// ── 소리 · 글씨 ──
function speak() {
  try { if (!('speechSynthesis' in window)) return; speechSynthesis.cancel();
    const v = $('#view'), parts = [v.querySelector('h1')?.textContent, v.querySelector('.count')?.textContent, ...[...v.querySelectorAll('.board .row')].sort((a, b) => a.getBoundingClientRect().top - b.getBoundingClientRect().top).slice(0, 3).map(r => r.querySelector('.nm').textContent + ' ' + r.querySelector('.val').textContent.replace('−', '마이너스 ').replace('+', '플러스 '))].filter(Boolean);
    const u = new SpeechSynthesisUtterance(parts.join('. ')); u.lang = 'ko-KR'; u.rate = 0.9; speechSynthesis.speak(u); } catch { /* 소리 없음 */ }
}
const FONTS = ['보통', '크게', '아주 크게'];
function setFont(k) { state.font = k; const r = document.documentElement; r.classList.toggle('f2', k === 1); r.classList.toggle('f3', k === 2); $('#fontBtn').setAttribute('aria-label', '글씨 크기 바꾸기 (지금 ' + FONTS[k] + ')'); try { localStorage.setItem('atlas:font', String(k)); } catch { /* 저장 못 함 */ } }

// ── 길(주소 #) — 뒤로 = 앞 화면(삼성팀) ──
let chartDraw = null, lastMain = '';
async function route() {
  const hsh = location.hash || '#/';
  if (hsh.startsWith('#/find')) { showFind(); return; }
  if (hsh.startsWith('#/info')) { showInfo(null); return; }
  if (hsh.startsWith('#/x/')) { try { await needNames(); } catch { /* 아래에서 ? */ } showInfo(decodeURIComponent(hsh.slice(4))); return; }
  for (const id of ['findSheet', 'infoSheet']) { const s = $('#' + id); if (!s.hidden) { s.hidden = true; delete document.body.dataset.sheet; } }
  if (hsh === lastMain && $('#view').childElementCount) return;
  lastMain = hsh;
  const v = $('#view'); v.textContent = ''; chartDraw = null;
  $('#tabHome').toggleAttribute('aria-current', false); $('#tabList').toggleAttribute('aria-current', false); $('#tab36').toggleAttribute('aria-current', false);
  try {
    const [, kind, arg] = hsh.match(/^#\/(\w*)\/?(.*)$/) || [];
    if (!kind) { $('#tabHome').setAttribute('aria-current', 'page'); viewHome(v); }
    else if (kind === 'list') { $('#tabList').setAttribute('aria-current', 'page'); viewList(v); }
    else if (kind === '36') { $('#tab36').setAttribute('aria-current', 'page'); await view36(v); }
    else if (kind === 'g') viewGroup(v, decodeURIComponent(arg));
    else if (kind === 'i') await viewIndustry(v, decodeURIComponent(arg));
    else if (kind === 'c') { const [code, sub] = decodeURIComponent(arg).split('/'); if (sub === 'past') await viewPast(v, code); else if (sub === 'range') await viewRange(v, code); else if (!sub) await viewCompany(v, code); else viewMissing(v, code); }
    else { location.replace('/old/' + location.search + location.hash); return; } // 옛 ATLAS 주소(#/stocks · #/road …)는 옛 판으로
  } catch (e) {
    v.textContent = ''; v.append(h('h1', {class: 'head', text: '자료를 못 읽었습니다'}), h('p', {class: 'count', text: '? 잠시 뒤 다시 열어 주세요. (' + e.message + ')'}));
    const again = h('button', {class: 'play', type: 'button', text: '다시 열기'}); again.addEventListener('click', () => { lastMain = ''; route(); }); v.append(again);
  }
  window.scrollTo(0, 0);
  document.title = (v.querySelector('h1')?.textContent || 'ATLAS') + ' · ATLAS';
}

async function boot() {
  try { const lg = new URLSearchParams(location.search).get('lang'); if (lg && lg !== 'ko') { location.replace('/old/' + location.search + location.hash); return; } } catch { /* 주소 못 읽음 */ }
  try { const k = +localStorage.getItem('atlas:font'); if (k === 1 || k === 2) setFont(k); } catch { /* 저장 못 함 */ }
  $('#fontBtn').addEventListener('click', () => { setFont((state.font + 1) % 3); lastMain = ''; route(); });
  $('#helpBtn').addEventListener('click', () => { location.hash = '#/info'; });
  $('#openFind').addEventListener('click', openFind); $('#tabFind').addEventListener('click', openFind);
  document.querySelectorAll('[data-close]').forEach(b => b.addEventListener('click', () => closeSheet(b.dataset.close)));
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && document.body.dataset.sheet) closeSheet(document.body.dataset.sheet); });
  $('#q').addEventListener('input', () => { if (D.names) renderHits(); });
  $('#hits').addEventListener('click', e => { const a = e.target.closest('a[data-go]'); if (!a) return; e.preventDefault(); const to = a.getAttribute('href'); $('#findSheet').hidden = true; delete document.body.dataset.sheet; if (to.startsWith('#/x/')) location.hash = to; else location.replace(to); });
  let rt = 0; addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(() => { if (chartDraw) chartDraw(); }, 200); });
  addEventListener('hashchange', route);
  try { D.core = await getJson('core.json'); }
  catch (e) { const v = $('#view'); v.textContent = ''; v.append(h('h1', {class: 'head', text: '자료를 못 읽었습니다'}), h('p', {class: 'count', text: '? 잠시 뒤 다시 열어 주세요. (' + e.message + ')'})); return; }
  await route();
  setTimeout(() => { needComp().catch(() => {}); }, 400);
}
boot();
