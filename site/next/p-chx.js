/* 1단 갈래 · 2단 업종 자세히(chx) — 지금 아틀란스 site/atlas/atlas.js 의 viewGroup(1단) · viewIndustry(2단)를 새 채널 화면 안으로 옮김
   (사장님 2026-10-17 04:04 「첫화면 부터 마지막 페이지 까지 모두 바꿔」 · 「정말 빠르면서도 정밀하게 · 에이전트 총 동원해」 · 규칙 74)
   채널(app.js vChannel)이 그리는 것 — 위 선 · 이름 · 회사 수 · 두 숫자(한 회사 한 표 · 큰 회사는 크게) · 구독 · 회사 · 업종 칸
   이 모듈이 그리는 것 — 지금 아틀란스 1 · 2단에 있고 채널에 없는 모든 것:
     7단 중 n단 · 보기 바꾸기 · 머리 숫자 · 이 기간 흐름(▲ 강하게 오름 · 힘 붙음) · n곳 중 오름 · 내림 · 고른 곳 · 다르게 보면 ·
     많이 오른 순 줄(작은 선 · 점선 = 기준일 값 · 흐린 점선 = 위 단 평균 · 숫자 · 흐름 · 1곳 · ? · 금빛) · 가장 낮던 날 · 1곳 · ? 줄 · 금빛 · 두 보기 정직 글 · 자료 줄
   셈은 지금 아틀란스와 같음 — 줄 값 = 선 끝 − 100 · 많이 오른 순(같으면 원래 차례 · 값 없음은 맨 끝) · 줄 눈금은 줄마다(기준일 100 · 위 단 평균 포함)
   글은 textContent 로만 · 꾸밈은 p-chx.css 와 CSSOM(보안 규칙) · 쓰지 않을 말 없음(옛 맨 아래 알림 글은 쓰지 않을 말을 빼고 같은 뜻 쉬운 말로) */
const NX = globalThis.NX;
const NBSP = ' ';
const SPW = 100, SPH = 30; // 줄 선 그림 칸(늘여 그림 · 선 굵기는 그대로)
const CAP = 10; // 업종 화면 — 많이 오른 차례 앞 열 곳은 바로, 나머지는 접은 칸(글은 모두 화면 안 · 접어도 숫자 그대로)
let MODE = 'eq'; // 보기 — 지금 아틀란스 state.mode 처럼 이 창에서 화면을 옮겨도 이어짐(eq = 한 회사 한 표 · cw = 큰 회사는 크게)

const h = (...a) => NX.h(...a);
const isD = d => /^\d{4}-\d{2}-\d{2}/.test(String(d ?? ''));
/** 날짜 — 「10월 13일」 붙임 띄어쓰기(지금 아틀란스 md 와 같음 · 「10월 / 13일」로 갈라지지 않게) */
const md = d => (isD(d) ? (+String(d).slice(5, 7)) + '월' + NBSP + (+String(d).slice(8, 10)) + '일' : '?');
const lc = x => (x == null ? 'fl' : NX.cls(x)); // 줄 선 색(값 없음 = 회색 · 지금 아틀란스 cls(null) = flat)
const pctEl = (x, tag = 'b') => h(tag, {class: 'pchx-n ' + NX.cls(x), text: NX.pct(x)});

/* 바탕 회사 이름(멍거 · 린치 조건 N곳 — 수는 자료에서) · 고른 길 — atlas.js NP · pickName · lyDay · pickHow 그대로 */
const NP = C => C?.funnel?.picked ?? '?';
const pickName = C => `${C?.rules?.name ?? '고른'} ${NP(C)}곳`;
const lyDay = C => (C?.rules?.lyDay ? md(C.rules.lyDay) : '모음 날');
const pickHow = C => `멍거 갈래는 3년 성적표만, 린치 갈래는 3년 성적표와 ${lyDay(C)} 값으로 골랐습니다`;
/** 회사 고리 — 모든 회사에 회사 파일이 있으면(core.co7) 보는 화면 · 옛 자료면 고른 곳만 보는 화면 · 나머지는 지금 아틀란스 밖 칸 */
const cHref = (C, c, pk) => (C?.co7 || pk ? '#/w/' + NX.enc(c) : (NX.ready?.('x') ? '#/x/' : '/atlas/#/x/') + NX.enc(c));
/** 업종 고리 — 1곳뿐인 업종은 그 회사로(atlas.js hrefInd 그대로) */
const hrefInd = (C, i) => (i.n === 1 ? cHref(C, i.members[0], !C?.mkt || i.pk) : '#/ch/i/' + NX.enc(i.name));

/* 기간 안 방향 · 세기 · 힘 — atlas.js trText · trFill 그대로(셈은 site_build.py trend()) */
const TR_WORD = {up: '오름', down: '내림', flat: '옆걸음'};
function trText(t) { if (!t) return ''; return (t.d === 'up' ? '▲ ' : t.d === 'down' ? '▼ ' : '▶ ') + (t.s === 'strong' ? '강하게 ' : '') + TR_WORD[t.d] + (t.t === 'gain' ? ' · 힘 붙음' : t.t === 'fade' ? ' · 힘 빠짐' : ''); }
function trFill(el, t) {
  el.classList.remove('up', 'dn', 'fl');
  el.classList.add(t?.d === 'up' ? 'up' : t?.d === 'down' ? 'dn' : 'fl');
  if (!t) { el.replaceChildren(); el.removeAttribute('aria-label'); return el; }
  const w = trText(t), cut = w.indexOf(' · ');
  el.replaceChildren(h('span', {class: 'pchx-tdw', text: cut < 0 ? w : w.slice(0, cut)}), ...(cut < 0 ? [] : [h('span', {class: 'pchx-tt', text: w.slice(cut)})]));
  el.setAttribute('aria-label', `이 기간 ${w.replace(/[▲▼▶] /, '')}`);
  return el;
}

/* 7단 표시 — 지금 아틀란스 steps 그대로(일곱 칸 · 지금 단 · 앎의 종류) · 위 단으로 가는 길은 아래 따로 44px 고리 */
const LV = ['갈래', '업종', '회사', '지나온 길', '누구와 다투나', '앞으로 클까?', '범위 · 확인'];
const LK = ['기록', '기록', '기록', '기록', '조사', '판단', '셈'];
function steps(now, up) {
  const nm = LV[now - 1];
  const row = h('ol', {class: 'pchx-st'}, LV.map((name, k) => { const n = k + 1; return h('li', {class: n < now ? 'past' : n === now ? 'now' : 'next', 'aria-current': n === now ? 'step' : null}, h('b', {text: String(n)}), h('span', {class: 'pchx-sr', text: `단 ${name}`})); }));
  return h('nav', {class: 'pchx-steps', 'aria-label': `7단 가운데 ${now}단 — ${nm} · ${LK[now - 1]}`}, row,
    h('p', {class: 'pchx-st-t'}, h('b', {text: `7단 중 ${now}단`}), ` · ${nm} `, h('span', {class: 'pchx-lk', text: '· ' + LK[now - 1]})),
    up ? h('a', {class: 'pchx-up', href: up.href}, h('i', {'aria-hidden': 'true', text: '‹'}), h('span', {text: up.text})) : null);
}

/* 줄 선 — atlas.js race 의 한 줄 그림 그대로(0 ~ k 날 · 값이 빈 날은 끊음 · 세로 = 그 줄의 낮은 값 ~ 높은 값, 기준일 100 · 위 단 평균 포함) */
function at(arr, k, n) { const a = Math.floor(k), b = Math.min(n - 1, a + 1), f = k - a; const x = arr[a], y = arr[b]; if (x == null) return y; if (y == null) return x; return x + (y - x) * f; }
const sx = (j, n) => (j / Math.max(1, n - 1) * SPW).toFixed(2);
const sy = (v, [lo, hi]) => (hi - lo < 1e-9 ? SPH / 2 : 2 + (hi - v) / (hi - lo) * (SPH - 4)).toFixed(2);
function lineTo(arr, k, R, n) {
  if (!arr) return ''; let d = '', on = false; const a = Math.floor(k);
  for (let j = 0; j <= a && j < n; j++) { const x = arr[j]; if (x == null) { on = false; continue; } d += (on ? 'L' : 'M') + sx(j, n) + ' ' + sy(x, R); on = true; }
  if (k > a && a + 1 < n && on) { const x = at(arr, k, n); if (x != null) d += 'L' + sx(k, n) + ' ' + sy(x, R); }
  return d;
}

/** 많이 오른 순 줄 — items: [{key, name, href, v, cw, badge, gold, pk, tr, trc}] · parent: {v, cw}(흐린 점선) · 끝 값으로 차례(같으면 원래 차례 · 값 없음 맨 끝) */
function rank(items, parent, n, mode) {
  const ser = it => (mode === 'cw' && it.cw ? it.cw : it.v);
  const par = parent ? (mode === 'cw' ? parent.cw : parent.v) : null;
  const rows = items.map(it => {
    const arr = ser(it), cur = Array.isArray(arr) ? at(arr, n - 1, n) : null, d = cur == null ? null : cur - 100;
    const vs = [...(Array.isArray(arr) ? arr : []), ...(Array.isArray(par) ? par : []), 100].filter(x => x != null && Number.isFinite(x));
    return {it, arr, par, cur, d, R: [Math.min(...vs), Math.max(...vs)]};
  });
  return rows.slice().sort((a, b) => (b.cur ?? -Infinity) - (a.cur ?? -Infinity) || 0);
}
function rowEl(r, n, mode) {
  const {it, d, R, arr, par} = r, S = NX.sv;
  const spk = S('svg', {class: 'pchx-spk', viewBox: `0 0 ${SPW} ${SPH}`, preserveAspectRatio: 'none', 'aria-hidden': 'true', focusable: 'false'});
  const y0 = sy(100, R);
  r.pa = par ? S('path', {class: 'pchx-pa', d: lineTo(par, n - 1, R, n)}) : null;
  r.ln = S('path', {class: 'pchx-ln ' + lc(d), d: lineTo(arr, n - 1, R, n)});
  spk.append(S('line', {class: 'pchx-b0', x1: 0, x2: SPW, y1: y0, y2: y0}), ...(r.pa ? [r.pa] : []), r.ln);
  const t = it.tr ? (mode === 'cw' && it.trc ? it.trc : it.tr) : null;
  return h('a', {class: 'pchx-row' + (it.pk ? ' pk' : '') + (t ? ' two' : ''), href: it.href},
    h('span', {class: 'pchx-nm'}, h('span', {class: 'pchx-nt', text: it.name}), it.badge ? h('span', {class: 'pchx-bd' + (it.badge === '?' ? ' q' : ''), text: it.badge}) : null, it.gold ? h('span', {class: 'pchx-bd gold', text: it.gold}) : null),
    h('b', {class: 'pchx-val ' + (d == null ? 'q' : NX.cls(d)), text: NX.pct(d)}),
    spk, t ? trFill(h('span', {class: 'pchx-trd'}), t) : null,
    h('i', {class: 'pchx-chev', 'aria-hidden': 'true', text: '›'}));
}

/** 소리 — 지금 아틀란스 speak 와 같은 차례(머리 · 몇 곳 · 위 세 줄) */
function speak(parts) {
  try { if (!('speechSynthesis' in window)) return; speechSynthesis.cancel(); const u = new SpeechSynthesisUtterance(parts.filter(Boolean).join('. ')); u.lang = 'ko-KR'; u.rate = 0.9; speechSynthesis.speak(u); } catch { /* 소리 없음 */ }
}
const sayPct = t => String(t).replace('−', '마이너스 ').replace('+', '플러스 ');
function playIcon() { const s = NX.sv('svg', {width: 16, height: 16, viewBox: '0 0 14 14', 'aria-hidden': 'true'}); s.append(NX.sv('path', {d: 'M3 1.5 L12 7 L3 12.5 Z', fill: 'currentColor'})); return s; }

/** 한 화면(1단 · 2단) — spec: {C, now, up, node(갈래 · 업종), title, items, n, legendName, gold, countEq, countCw, altEq, altCw, sayLine, goldCodes, notes(mode)} */
function screen(X, spec) {
  const C = X.core, n = Array.isArray(C.dates) && C.dates.length > 1 ? C.dates.length : (spec.node.v?.length || 21), node = spec.node;
  const head = h('h2', {class: 'pchx-head'}), tr = h('p', {class: 'pchx-tr'}), count = h('p', {class: 'pchx-count'}), alt = h('p', {class: 'pchx-alt'});
  const words = m => {
    head.replaceChildren(`${spec.title} ${C.days}거래일 `, pctEl(m === 'cw' ? node.cwChg : node.chg, 'span'));
    trFill(tr, m === 'cw' ? node.trc : node.tr);
    count.replaceChildren(...(m === 'eq' ? spec.countEq() : spec.countCw()));
    alt.replaceChildren(...(m === 'eq' ? spec.altEq() : spec.altCw()));
  };
  // 보기 바꾸기(지금 아틀란스 seg) — 머리 숫자 · 흐름 · 몇 곳 · 다르게 보면 · 줄 차례와 숫자 · 흐린 점선이 함께 바뀜
  const bEq = h('button', {type: 'button', 'aria-pressed': String(MODE === 'eq'), text: '한 회사 한 표'}), bCw = h('button', {type: 'button', 'aria-pressed': String(MODE === 'cw'), text: '큰 회사는 크게'});
  const seg = h('div', {class: 'pchx-seg', role: 'group', 'aria-label': '평균 내는 법 바꾸기'}, bEq, bCw);
  // 많이 오른 순 줄
  const listBox = h('div', {class: 'pchx-list', role: 'group', 'aria-label': spec.listLabel}), tell = h('span', {class: 'pchx-t', text: `${md(C.base)} → ${md(C.asOf)}`});
  let rows = [], restOpen = false;
  const drawList = m => {
    const old = listBox.querySelector('details.pchx-rest'); if (old) restOpen = old.open;
    rows = rank(spec.items, node, n, m);
    const els = rows.map(r => rowEl(r, n, m));
    const cap = spec.cap ?? Infinity, top = els.slice(0, cap), rest = els.slice(cap);
    listBox.replaceChildren(...top, ...(rest.length ? [h('details', {class: 'pchx-rest', open: restOpen || null}, h('summary', {}, h('span', {text: `나머지 ${rest.length}${spec.unit} 보기`}), h('small', {text: '많이 오른 순'})), ...rest)] : []));
    if (!els.length) listBox.append(h('p', {class: 'pchx-note', text: '? 줄을 그릴 값이 없어요.'}));
  };
  const set = m => { stop(); MODE = m; bEq.setAttribute('aria-pressed', String(m === 'eq')); bCw.setAttribute('aria-pressed', String(m === 'cw')); words(m); drawList(m); };
  bEq.addEventListener('click', () => set('eq')); bCw.addEventListener('click', () => set('cw'));
  // 다시 보기(지금 아틀란스 경주 다시 보기) — 선이 기준일부터 날마다 자람 · 위 단이 가장 낮던 날에 잠깐 멈춤 · 끝나면 그대로 · 움직임 줄이기면 안 함
  let raf = 0, playing = false;
  function stop() { if (!playing) return; cancelAnimationFrame(raf); playing = false; listBox.classList.remove('playing'); for (const r of rows) { r.ln?.setAttribute('d', lineTo(r.arr, n - 1, r.R, n)); r.ln?.setAttribute('class', 'pchx-ln ' + lc(r.d)); r.pa?.setAttribute('d', lineTo(r.par, n - 1, r.R, n)); } tell.textContent = `${md(C.base)} → ${md(C.asOf)}`; }
  function play() {
    if (playing) { stop(); return; }
    if (NX.RM?.matches || n < 2 || !listBox.isConnected) return;
    playing = true; listBox.classList.add('playing');
    const per = Math.max(80, Math.round(4800 / Math.max(1, n - 1))), hold = 800, pv = node.v, lowK = Array.isArray(pv) ? pv.indexOf(Math.min(...pv.filter(x => x != null))) : -1; // 지금 아틀란스와 같이 위 단(한 회사 한 표) 가장 낮던 날에 멈춤
    let t0 = performance.now(), held = false;
    const paint = k => { for (const r of rows) { if (!r.ln) continue; const v = Array.isArray(r.arr) ? at(r.arr, k, n) : null; r.ln.setAttribute('d', lineTo(r.arr, k, r.R, n)); r.ln.setAttribute('class', 'pchx-ln ' + lc(v == null ? null : v - 100)); r.pa?.setAttribute('d', lineTo(r.par, k, r.R, n)); } tell.replaceChildren(h('b', {text: md(C.dates?.[Math.round(k)])})); }; // 선 색 = 그날 기준일보다 위(빨강) · 아래(파랑)
    const step = now => {
      if (!listBox.isConnected) { playing = false; return; }
      let el = now - t0, k = el / per;
      if (lowK > 0 && k >= lowK && !held) { if (el < lowK * per + hold) { paint(lowK); raf = requestAnimationFrame(step); return; } held = true; t0 += hold; el -= hold; k = el / per; }
      if (k >= n - 1) { stop(); return; }
      paint(k); raf = requestAnimationFrame(step);
    };
    paint(0); raf = requestAnimationFrame(step);
  }
  listBox.addEventListener('click', e => { if (playing) { e.preventDefault(); stop(); } }, true); // 그리는 중 누르면 끝으로(그 누름은 넘어가지 않음)
  const playB = h('button', {class: 'pchx-ib', type: 'button', 'aria-label': '선 다시 그리기', title: '다시 보기'}, playIcon());
  playB.addEventListener('click', play);
  const sayB = h('button', {class: 'pchx-ib', type: 'button', 'aria-label': '이 화면 소리로 듣기', text: '♪'});
  sayB.addEventListener('click', () => { const top = rows.slice(0, 3).map(r => { const t = r.it.tr ? (MODE === 'cw' && r.it.trc ? r.it.trc : r.it.tr) : null; return r.it.name + ' ' + sayPct(NX.pct(r.d)) + (t ? ', ' + trText(t).replace(/[▲▼▶] /, '') : ''); });
    speak([sayPct(head.textContent), sayPct(count.textContent), ...top]); });
  words(MODE); drawList(MODE);
  const legend = h('p', {class: 'pchx-key'}, h('span', {}, '오름', h('i', {class: 'k-up'})), h('span', {}, '내림', h('i', {class: 'k-dn'})), h('span', {}, spec.legendName + ' 평균', h('i', {class: 'k-avg'})), h('span', {}, '기준일(' + md(C.base) + ') 값', h('i', {class: 'k-b0'})),
    spec.gold ? h('span', {}, '금빛 = 고른 곳', h('i', {class: 'k-pk'})) : null); // 글 다음에 줄 표(글 시작 줄 하나 · 2026-10-18 [10] 7)
  // 고른 곳 이름(금빛 알약 · 누르면 3단 회사) — 넷까지는 펼친 채 · 더 많으면 접은 칸(채널 아래 회사 칸에는 금빛 표시가 없어 여기서 이름을 보여 줌)
  const gc = spec.goldCodes || [], chips = () => h('div', {class: 'pchx-chips'}, gc.map(c => h('a', {class: 'pchx-chip', href: cHref(C, c, true), text: X.co[c]?.n ?? c})));
  const goldLine = !gc.length ? null : gc.length <= 4 ? h('div', {class: 'pchx-gold'}, h('p', {class: 'pchx-gl', text: `고른 곳 ${gc.length}곳`}), chips())
    : h('details', {class: 'pchx-gold'}, h('summary', {}, h('span', {class: 'pchx-gl', text: `고른 곳 ${gc.length}곳`}), h('small', {text: '이름 보기'})), chips());
  const card = h('div', {class: 'pchx-card'}, seg, head, tr, count, spec.sayLine ? h('p', {class: 'pchx-say'}, spec.sayLine) : null, goldLine, alt);
  const listHead = h('div', {class: 'pchx-lh'}, h('div', {}, h('h2', {class: 'pchx-lt'}, spec.listTitle + ' · ', h('span', {class: 'pchx-nb', text: '많이 오른 순'})), h('p', {class: 'pchx-tell'}, tell)), h('span', {class: 'pchx-btns'}, playB, sayB));
  const notes = spec.notes().filter(Boolean);
  const out = [steps(spec.now, spec.up), card, listHead, legend, listBox, ...notes];
  // 자료 줄(지금 아틀란스 맨 아래 그대로) · 바뀔 수 있는 값은 금빛 「?」로 펼친 채 · 알림 글은 같은 뜻 쉬운 말로
  if (C.provisional) out.push(h('p', {class: 'pchx-note q', text: `? ${md(C.asOf)} 값은 그날 저녁 8시 전에 받아 아직 바뀔 수 있습니다(시간외 · 넥스트레이드) — 다음 받기에서 고쳐집니다.`}));
  out.push(h('details', {class: 'pchx-src'}, h('summary', {text: '자료 · 기준일'}), h('p', {text: `자료: ${C.sources?.price ?? '?'} · 기준일 = 마지막 종가 날(${md(C.asOf)})의 ${C.days}거래일 전(${md(C.base)}) · ${pickName(C)} — ${pickHow(C)}(그 뒤 주가는 안 씀).`})));
  out.push(h('p', {class: 'pchx-safe', text: '저는 투자 상담사가 아닙니다 · 이 자료는 지난 기록을 센 공부이며, 특정 종목을 사거나 팔거나 갖고 있으라고 권하지 않고 시장 앞날도 말하지 않습니다.'}));
  return out;
}

/* 1단 갈래 — atlas.js viewGroup */
function group(X, id) {
  const C = X.core, g = X.grp.get(id);
  if (!g) return [];
  const inds = (g.inds || []).map(n => X.ind.get(n)).filter(Boolean);
  const items = inds.map(i => ({key: i.name, name: i.name, href: hrefInd(C, i), v: i.v, cw: i.cw, badge: i.n === 1 ? '1곳' : null, tr: i.tr, trc: i.trc, gold: i.pk ? `고른 ${i.pk}곳` : null, pk: i.pk > 0}));
  const loc = x => (Number.isFinite(x) ? x.toLocaleString('ko-KR') : '?');
  return screen(X, {now: 1, up: null, node: g, title: g.name, items, legendName: g.short, gold: !!g.pk, unit: '개',
    listTitle: `업종 ${inds.length}개`,
    listLabel: `${g.name} 업종 ${inds.length}개 — ${C.days}거래일 많이 오른 순: ` + inds.map(i => i.name + ' ' + NX.pct(i.chg)).join(', '),
    sayLine: [`${inds.slice().sort((a, b) => b.n - a.n).slice(0, 3).map(x => x.name).join(' · ')}${inds.length > 3 ? ' 등' : ''} · `, h('span', {class: 'pchx-nb', text: `업종 ${inds.length}개`})],
    goldCodes: inds.flatMap(i => i.members || []).filter(c => X.co[c]?.p),
    countEq: () => [`${loc(g.n)}곳 중 `, h('b', {class: 'up', text: loc(g.up) + '곳 오름'}), ' · ', h('b', {class: 'dn', text: loc(g.down) + '곳 내림'}), ...(g.pk ? [' · ', h('span', {class: 'pchx-nb', text: `고른 곳 ${g.pk}곳`})] : [])],
    countCw: () => ['몸값으로 세면 ', pctEl(g.cwChg), ' · 한 회사 한 표로는 ', pctEl(g.chg)],
    altEq: () => ['다르게 보면: 큰 회사는 크게 치면 ', pctEl(g.cwChg), '.'],
    altCw: () => ['한 회사 한 표로 세면 ', pctEl(g.chg), ' · ', h('span', {class: 'pchx-nb', text: `${g.up}곳 오름`}), ' · ', h('span', {class: 'pchx-nb', text: `${g.down}곳 내림.`})],
    notes: () => {
      const low = g.low, out = [];
      if (low && Number.isInteger(low.k)) out.push(h('p', {class: 'pchx-note', text: `${md(C.dates?.[low.k])}(이 갈래가 가장 낮던 날)에는 ${g.n}곳 중 ${low.below}곳이 ${md(C.base)}보다 아래였습니다 — 한 갈래는 함께 움직이기 쉽습니다.`}));
      if (inds.some(i => i.n === 1)) out.push(h('p', {class: 'pchx-note', text: '「1곳」 = 회사가 하나뿐인 업종 — 업종 평균이 아니라 그 회사 하나의 값입니다.'}));
      out.push(h('p', {class: 'pchx-note', text: '업종을 누르면 2단 업종, 회사를 누르면 3단 회사로 가요.'}));
      return out;
    }});
}

/* 2단 업종 — atlas.js viewIndustry(1곳뿐인 업종도 이 화면 — 지금 아틀란스는 그 회사로 넘겼음) */
function industry(X, name) {
  const C = X.core, i = X.ind.get(name);
  if (!i) return [];
  const g = X.grp.get(i.g), mk = !!C.mkt;
  const row = c => X.co[c];
  const href = c => cHref(C, c, row(c)?.p), noLine = c => !(Array.isArray(row(c)?.l) && row(c).l.some(x => x != null));
  const members = i.members || [], shown = members.filter(c => !noLine(c)), none = members.filter(noLine);
  const items = shown.map(c => { const m = row(c); return {key: c, name: m.n, href: href(c), v: m.l.map(x => (x == null ? null : x / 100)), cw: null, gold: mk && m.p ? '고른 곳' : null, pk: !!(mk && m.p), badge: m.j ? '?' : null}; });
  return screen(X, {now: 2, up: g ? {href: '#/ch/g/' + NX.enc(g.id), text: `1단 ${g.short} 갈래로`} : null, node: i, title: i.name, items, legendName: i.name, gold: mk && !!i.pk, unit: '곳', cap: CAP,
    listTitle: `회사 ${shown.length}곳`,
    listLabel: `${i.name} 회사 ${shown.length}곳 — ${C.days}거래일 많이 오른 순: ` + shown.map(c => row(c).n + ' ' + NX.pct(row(c).c)).join(', '),
    sayLine: null,
    goldCodes: mk ? members.filter(c => row(c)?.p) : [],
    countEq: () => [`${i.n}곳 중 `, h('b', {class: 'up', text: i.up + '곳 오름'}), ' · ', h('b', {class: 'dn', text: i.down + '곳 내림'}), ...(mk && i.pk ? [' · ', h('span', {class: 'pchx-nb', text: `금빛 = 고른 곳 ${i.pk}곳`})] : [])],
    countCw: () => ['몸값으로 세면 ', pctEl(i.cwChg), ' · 한 회사 한 표로는 ', pctEl(i.chg)],
    altEq: () => ['다르게 보면: 큰 회사는 크게 치면 ', pctEl(i.cwChg), '.'],
    altCw: () => ['한 회사 한 표로 세면 ', pctEl(i.chg), ' · ', h('span', {class: 'pchx-nb', text: `${i.up}곳 오름`}), ' · ', h('span', {class: 'pchx-nb', text: `${i.down}곳 내림.`})],
    notes: () => {
      const out = [];
      if (i.n === 1) out.push(h('p', {class: 'pchx-note', text: '「1곳」 = 회사가 하나뿐인 업종 — 업종 평균이 아니라 그 회사 하나의 값입니다.'}));
      if (items.some(x => x.badge === '?')) out.push(h('p', {class: 'pchx-note'}, h('span', {class: 'q', text: '? '}), '= 하루에 30% 넘게 바뀐 날이 있는 회사 — 주식 수가 바뀌었을 수 있습니다(확인 못 함).'));
      if (none.length) out.push(h('p', {class: 'pchx-note pchx-noline'}, h('span', {class: 'q', text: '? '}), `기준일(${md(C.base)}) 종가가 없어 선을 못 그린 회사 ${none.length}곳 — `, ...none.flatMap((c, k) => [k ? h('span', {class: 'pchx-sep', text: ' · '}) : '', h('a', {class: 'pchx-inl', href: href(c), text: row(c)?.n ?? c})])));
      if (mk) out.push(h('p', {class: 'pchx-note', text: `금빛이 아닌 회사는 ${pickName(C)} 밖입니다 — ${C.co7 ? '눌러도 7단까지 볼 수 있고, 3단에 왜 밖인지 나옵니다' : '누르면 이름 · 까닭이 나옵니다'}.`}));
      out.push(h('p', {class: 'pchx-note', text: '회사 줄은 그 회사 주가 그대로라 두 보기에서 같습니다 — 바뀌는 것은 점선(업종 평균)과 맨 위 숫자입니다.'}));
      return out;
    }});
}

export async function render(a) {
  await Promise.all([NX.need('core'), NX.need('mkt')]);
  const X = NX.ix(); if (!X) return {title: '?', nodes: NX.noData()};
  const s = String(a || ''), kind = s.slice(0, 1), id = s.slice(2);
  const nodes = kind === 'g' ? group(X, id) : kind === 'i' ? industry(X, id) : [];
  return {title: kind === 'g' ? (X.grp.get(id)?.name ?? '?') + ' 갈래' : (X.ind.get(id)?.name ?? '?') + ' 업종', nodes};
}
