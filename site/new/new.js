/* ATLAS 새 판 — 화면 셈(2026-10-10 18:29 서울 · 사장님 「올려봐 7377 에」)
   같은 날 13:39 「찰리 멍거 · 머스크 · 잡스 · 구글팀이 다같이 모여서 … 바보도 주식쟁이도 아줌마도 감탄하며 쓸 수 있는 것으로」 — 네 자리가 정한 것:
     멍거 = 나쁜 쪽부터(「100 중 n 손해」 · 「100만 원이 n만 원」) · 순위 번호 없음 · 이 규칙이 약했던 때를 먼저
     머스크 = 아래 탭 셋(오늘 · 찾기 · 기록) · 지울 수 있는 것은 지움
     잡스 = 한 화면에 한 가지 · 누르면 바로 회사(1번)
     구글 = 횟수로 말함(Hoffrage 외 2000) · 누름 칸 44px 이상 · 첫 글자로 찾기(ㅅㅅㅈㅈ → 삼성전자)
   자료: 사이트 판 묶음 그대로(한국 /data/atlas11/view · 미국 /us/data/atlas11/view — lens.json 의 cand · mc · elim, board.json, stocks/<기호>.json)
     → 날마다 올라오는 판이 바뀌면 이 쪽도 저절로 바뀐다. 셈은 판 읽기 값만 쓰고 새 숫자를 지어내지 않는다.
   지키는 것: 금지 말(추천 · 목표가 · 사라 · 팔라 · 확실 · 보장 · 무조건 · 확률) 없음 · 앞날 값은 「모형 가정 아래 추정 · 검증 전」과 함께 · 입체 없음 · 바둑판 없음
   보안 규칙(CSP): 글 속 style · 글 속 script · on… 속성 없음 — 모양은 new.css · 움직이는 값은 CSSOM(el.style) */

const SVGNS = 'http://www.w3.org/2000/svg';
const M = '−';
const BASE = {kr: '/data/atlas11/view/', us: '/us/data/atlas11/view/'};
/* 한국거래소 쉬는 날(주말 밖) — 채점 날짜 셈에만 씀 */
const KR_HOL = new Set(['2026-10-05', '2026-10-09', '2026-12-25', '2026-12-31', '2027-01-01', '2027-02-08', '2027-02-09', '2027-03-01', '2027-05-05', '2027-05-13', '2027-08-16', '2027-09-14', '2027-09-15', '2027-09-16', '2027-10-04', '2027-10-11', '2027-12-31']);
const SHORT = {'반도체와반도체장비': '반도체 장비', '오일 및 가스 수송 서비스': '석유·가스 운반', '통합 통신 서비스': '통신', '중장비 및 차량': '중장비·차량', '전자장비와기기': '전자 장비', '양방향미디어와서비스': '인터넷 서비스'};
const EASY_CHECK = {close: '마감 가격이 있다', stale: '거래가 멈추지 않았다', ca: '최근 20일 값이 이상하게 튀지 않았다', history: '1년 넘는 가격 기록이 있다', profit: '돈을 벌고 있다(흑자)', risk: '최근 30일 위험 공시가 없다', paths: '앞날 계산을 충분히 했다', converge: '계산이 흔들리지 않았다', liquidity: '거래가 충분하다', tail: '가장 나쁜 경우가 너무 나쁘지 않다'};

const S = {place: 'kr', expert: false, scale: 0, usShow: false, speaking: false, q: '', data: {}, wait: {}, err: {}, say: ''};
try { const p = JSON.parse(localStorage.getItem('atlas-new') || '{}'); S.expert = !!p.expert; S.scale = Math.max(0, Math.min(2, p.scale | 0)); if (p.place === 'us') S.place = 'us'; } catch (e) { /* 저장 안 되는 브라우저 — 처음 값으로 */ }
const save = () => { try { localStorage.setItem('atlas-new', JSON.stringify({expert: S.expert, scale: S.scale, place: S.place})); } catch (e) { /* 저장 안 됨 — 그대로 */ } };

/* ── 만들기 도구 ── */
function h(tag, attrs, ...kids) {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs || {})) {
    if (v == null || v === false) continue;
    if (k === 'class') el.className = v;
    else if (k.startsWith('on') && typeof v === 'function') el.addEventListener(k.slice(2), v);
    else el.setAttribute(k, v === true ? '' : String(v));
  }
  for (const c of kids.flat(3)) { if (c == null || c === false) continue; el.append(c instanceof Node ? c : document.createTextNode(String(c))); }
  return el;
}
function s(tag, attrs, ...kids) {
  const el = document.createElementNS(SVGNS, tag);
  for (const [k, v] of Object.entries(attrs || {})) { if (v == null || v === false) continue; el.setAttribute(k, String(v)); }
  for (const c of kids.flat(3)) { if (c) el.append(c); }
  return el;
}
const icon = (paths, extra = {}) => s('svg', {viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': 2.2, 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'aria-hidden': 'true', ...extra}, ...paths.map(d => s('path', {d})));
const ICON = {
  speak: () => icon(['M11 5 6 9H3v6h3l5 4z', 'M15.5 8.5a5 5 0 0 1 0 7', 'M18.5 5.5a9 9 0 0 1 0 13']),
  sun: () => s('svg', {viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': 2.2, 'stroke-linecap': 'round', 'aria-hidden': 'true'}, s('circle', {cx: 12, cy: 12, r: 4.5}), s('path', {d: 'M12 2.5v2.2M12 19.3v2.2M2.5 12h2.2M19.3 12h2.2M5.3 5.3l1.6 1.6M17.1 17.1l1.6 1.6M5.3 18.7l1.6-1.6M17.1 6.9l1.6-1.6'})),
  find: () => s('svg', {viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': 2.2, 'stroke-linecap': 'round', 'aria-hidden': 'true'}, s('circle', {cx: 10.5, cy: 10.5, r: 6.5}), s('path', {d: 'm15.5 15.5 5 5'})),
  book: () => icon(['M5 4h11a3 3 0 0 1 3 3v13H8a3 3 0 0 1-3-3z', 'M9 9h6M9 13h6']),
  back: () => icon(['m15 5-7 7 7 7']),
  warn: () => icon(['M12 3 2 20h20z', 'M12 10v4', 'M12 17.5v.5']),
  arrow: () => s('svg', {viewBox: '0 0 34 24', fill: 'none', stroke: 'currentColor', 'stroke-width': 2.4, 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'aria-hidden': 'true'}, s('path', {d: 'M3 12h26'}), s('path', {d: 'm22 5 7 7-7 7'}))
};

/* ── 글 셈 ── */
const fin = v => typeof v === 'number' && isFinite(v);
const pct = (v, k = 0) => (fin(v) ? (v > 0 ? '+' : v < 0 ? M : '') + Math.abs(v).toFixed(k) + '%' : '–');
/* 셈 틀 범위 값은 앞 세 자리까지만(48,829원 → 48,800원) */
const sig3 = v => { if (!fin(v) || v === 0) return v; const p = Math.pow(10, Math.floor(Math.log10(Math.abs(v))) - 2); return Math.round(v / p) * p; };
const money = (v, kr) => (fin(v) ? (kr ? Math.round(v).toLocaleString('ko-KR') + '원' : '$' + (v >= 100 ? v.toFixed(0) : v.toFixed(2))) : '–');
const kday = (iso, base) => { const m = String(iso || '').match(/^(\d{4})-(\d{2})-(\d{2})/); if (!m) return '날짜 없음'; const yr = base && !String(base).startsWith(m[1]) ? m[1] + '년 ' : ''; return yr + Number(m[2]) + '월 ' + Number(m[3]) + '일'; };
const ktime = iso => { const m = String(iso || '').match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/); return m ? Number(m[2]) + '월 ' + Number(m[3]) + '일 ' + m[4] + ':' + m[5] : ''; };
const sec = x => SHORT[x] || x || '';
const nm = x => String(x || '').replace(' 홀딩스', '').replace(' (델라웨어)', '');
function addSessions(iso, n) {
  const d = new Date(String(iso).slice(0, 10) + 'T00:00:00Z'); if (isNaN(d)) return null;
  let c = 0;
  while (c < n) { d.setUTCDate(d.getUTCDate() + 1); const w = d.getUTCDay(), k = d.toISOString().slice(0, 10); if (w === 0 || w === 6 || KR_HOL.has(k)) continue; c++; }
  return d.toISOString().slice(0, 10);
}
const todaySeoul = () => new Date(Date.now() + 9 * 3600e3).toISOString().slice(0, 10);
function addWeekdays(iso, n) { const d = new Date(String(iso).slice(0, 10) + 'T00:00:00Z'); if (isNaN(d)) return null; let c = 0; while (c < n) { d.setUTCDate(d.getUTCDate() + 1); const w = d.getUTCDay(); if (w === 0 || w === 6) continue; c++; } return d.toISOString().slice(0, 10); }
/* 7일 뒤(5거래일 · 첫 채점일) — 사장님 2026-10-10 20:47(서울) 「7일 예측까지 해 · 가장 확률 높은 거 딱 하나만」
   셈 틀(몬테카를로)은 평균 기울기 0 — 오를지 내릴지를 정하지 않고 흔들림의 크기만 잰다. 그래서 「가장 그럴듯한 하나」는 회사 하나가 아니라
   「7곳 모두 반반 · 가운데 값이 지금 값 근처」 한 줄(구글 · 클로드 · 잡스 세 팀 검토). 값은 판 읽기 mc.bands[기호].q 의 5거래일 줄(10 · 25 · 50 · 75 · 90%)만 씀 */
function week7(D) {
  const track = D.mc && D.mc.track, days = track && Array.isArray(track.days) ? track.days : [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60], k = days.indexOf(5);
  if (k < 0) return null;
  const rows = D.items.map(x => ({x, q: x.band && Array.isArray(x.band.q) && Array.isArray(x.band.q[k]) ? x.band.q[k] : null})).filter(r => r.q && r.q.every(fin));
  if (!rows.length) return null;
  const meds = rows.map(r => r.q[2]), lo = Math.min(...meds), hi = Math.max(...meds), big = Math.max(...meds.map(Math.abs));
  const planted = D.items[0] ? D.items[0].planted : D.cand.asOf;
  return {day: D.kr ? addSessions(planted, 5) : addWeekdays(planted, 5), n: rows.length, lo, hi, big, band: Math.ceil(big * 100 + 1e-9), of: x => { const r = rows.find(y => y.x === x); return r ? r.q : null; }};
}
const median = xs => { const a = xs.filter(fin).sort((p, q) => p - q), n = a.length; return n ? (n % 2 ? a[(n - 1) / 2] : (a[n / 2 - 1] + a[n / 2]) / 2) : null; };

/* ── 자료 ── */
async function getJSON(u) { const r = await fetch(u, {cache: 'no-cache'}); if (!r.ok) throw new Error(u + ' ' + r.status); return r.json(); }
function ensure(place) {
  if (S.data[place]) return Promise.resolve(S.data[place]);
  if (S.wait[place]) return S.wait[place];
  S.wait[place] = (async () => {
    const base = BASE[place];
    const [lens, board] = await Promise.all([getJSON(base + 'lens.json'), getJSON(base + 'board.json')]);
    const items = (lens.cand && Array.isArray(lens.cand.items)) ? lens.cand.items : [];
    const stocks = {};
    await Promise.all(items.map(it => getJSON(base + 'stocks/' + encodeURIComponent(it.code) + '.json').then(x => { stocks[it.code] = x; }).catch(() => null)));
    S.data[place] = model(place, lens, board, stocks);
    return S.data[place];
  })().catch(e => { S.err[place] = String(e && e.message || e); S.wait[place] = null; throw e; });
  return S.wait[place];
}
function model(place, lens, board, stocks) {
  const cand = lens.cand || {}, mc = lens.mc || null, el = lens.elim || null;
  const rows = mc && Array.isArray(mc.rows) ? mc.rows : [], erows = el && Array.isArray(el.rows) ? el.rows : [];
  const comp = new Map((board.companies || []).map(c => [c.code, c]));
  const items = (cand.items || []).map(it => {
    const st = stocks[it.code] || null, er = erows.find(r => r.code === it.code) || null;
    const checks = er && Array.isArray(er.checks) ? er.checks.filter(c => c.verdict === 'pass' || c.verdict === 'hold' || c.verdict === 'out') : [];
    return {
      it, code: it.code, name: nm(it.name), sector: it.sector || (comp.get(it.code) || {}).sector || '', theme: ((comp.get(it.code) || {}).theme || {}).label || null,
      m12: it.grow ? it.grow.m12 : null, planted: (it.grow && it.grow.plantedAt) || cand.asOf, r20: it.r20, close: it.close, date: it.date,
      high52: it.high52, low52: it.low52, risk: it.risk ? it.risk.text : null, evidence: it.evidence || null,
      mc: rows.find(r => r.code === it.code) || null, band: mc && mc.bands ? mc.bands[it.code] : null, er, checks,
      pass: checks.filter(c => c.verdict === 'pass').length, tail: !!(er && Array.isArray(er.flags) && er.flags.includes('tail')),
      closes: st && Array.isArray(st.closes60) ? st.closes60.map(x => x.close).filter(fin) : []
    };
  });
  items.sort((a, b) => (fin(b.m12) ? b.m12 : -1e9) - (fin(a.m12) ? a.m12 : -1e9));
  return {place, kr: place === 'kr', lens, board, cand, mc, el, items, companies: board.companies || [], index: board.lead6 ? board.lead6.index : null, late: Array.isArray(board.late) ? board.late : []};
}

/* ── 그림 셈 ── */
function spark(cl, W = 120, H = 40, pad = 3) {
  const n = cl.length; if (n < 3) return null;
  const lo = Math.min(...cl), hi = Math.max(...cl), r = (hi - lo) || 1;
  const X = i => (pad + (W - 2 * pad) * i / (n - 1)).toFixed(1), Y = v => (H - pad - (H - 2 * pad) * (v - lo) / r).toFixed(1);
  const cut = n > 25 ? n - 20 : n - 1;
  const main = cl.slice(0, cut + 1).map((v, i) => X(i) + ',' + Y(v)).join(' ');
  const tail = cl.slice(cut).map((v, i) => X(cut + i) + ',' + Y(v)).join(' ');
  return {main, tail};
}
function fanGeo(item, track) {
  const cl = item.closes, b = item.band;
  if (cl.length < 3 || !b || !Array.isArray(b.q) || !track) return null;
  const last = cl[cl.length - 1], days = track.days || [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60], H = days[days.length - 1] || 60;
  const fut = b.q.map(row => row.map(x => last * (1 + x)));
  const lo = Math.min(Math.min(...cl), ...fut.map(r => r[0])), hi = Math.max(Math.max(...cl), ...fut.map(r => r[4])), rg = (hi - lo) || 1;
  const W = 340, Ht = 190, pt = 10, pb = 10, split = W * 0.5, n = cl.length;
  const X = i => (4 + (split - 4) * i / (n - 1)).toFixed(1), XF = d => (split + (W - split - 8) * d / H).toFixed(1);
  const Y = v => (pt + (Ht - pt - pb) * (1 - (v - lo) / rg)).toFixed(1);
  const poly = (a, c) => days.map((d, i) => XF(d) + ',' + Y(fut[i][a])).join(' ') + ' ' + days.map((d, i) => XF(d) + ',' + Y(fut[i][c])).reverse().join(' ');
  const end = fut[fut.length - 1];
  return {
    W, Ht, split: split.toFixed(1), futW: (W - split).toFixed(1), past: cl.map((v, i) => X(i) + ',' + Y(v)).join(' '),
    outer: poly(4, 0), inner: poly(3, 1), med: days.map((d, i) => XF(d) + ',' + Y(fut[i][2])).join(' '),
    nowY: Y(last), endX: XF(H), loY: Y(end[0]), hiY: Y(end[4]), p10: end[0], p50: end[2], p90: end[4], last
  };
}

/* ── 소리(화면 글자를 그대로 읽음 · 0.9 빠르기) ── */
function speak() {
  const ss = window.speechSynthesis; if (!ss) return;
  if (S.speaking) { ss.cancel(); S.speaking = false; render(); return; }
  const u = new SpeechSynthesisUtterance(S.say || 'ATLAS 새 판입니다.');
  u.lang = 'ko-KR'; u.rate = 0.9; u.pitch = 1; u.volume = 0.96;
  const v = ss.getVoices().find(x => /^ko/i.test(x.lang)); if (v) u.voice = v;
  u.onend = u.onerror = () => { S.speaking = false; const b = document.querySelector('.tool.say'); if (b) b.setAttribute('aria-pressed', 'false'); };
  ss.cancel(); ss.speak(u); S.speaking = true; render();
}
const bigger = () => { S.scale = (S.scale + 1) % 3; document.documentElement.style.fontSize = ['100%', '112.5%', '125%'][S.scale]; save(); };

/* ── 틀 ── */
function band() {
  return h('header', {class: 'band'},
    h('a', {class: 'brand', href: '/', 'aria-label': 'ATLAS 지금 화면으로 가기'}, h('img', {src: '/logo-band-night.svg', alt: ''}), h('b', {}, 'ATLAS'), h('small', {}, '새 판')),
    h('div', {class: 'tools'},
      h('button', {class: 'tool', type: 'button', 'aria-label': '글씨 크기 바꾸기', onclick: bigger}, '가'),
      h('button', {class: 'tool say', type: 'button', 'aria-pressed': S.speaking ? 'true' : 'false', 'aria-label': S.speaking ? '소리 멈추기' : '화면 글자 소리로 듣기', onclick: speak}, ICON.speak())));
}
function tabs(active) {
  const t = (href, label, ic, key) => h('a', {href, 'aria-current': active === key ? 'page' : null}, ic(), label);
  return h('div', {class: 'tabs'}, h('nav', {'aria-label': '주요 화면'}, t('#/', '오늘', ICON.sun, 'today'), t('#/find', '찾기', ICON.find, 'find'), t('#/record', '기록', ICON.book, 'record')));
}
function segs() {
  const b = (label, on, fn) => h('button', {type: 'button', 'aria-pressed': on ? 'true' : 'false', onclick: fn}, label);
  return h('div', {class: 'segs'},
    h('div', {class: 'seg', role: 'group', 'aria-label': '시장 고르기'},
      b('한국', S.place === 'kr', () => { S.place = 'kr'; save(); render(); }),
      b('미국', S.place === 'us', () => { S.place = 'us'; save(); render(); })),
    h('div', {class: 'seg', role: 'group', 'aria-label': '말 고르기'},
      b('쉬운 말', !S.expert, () => { S.expert = false; save(); render(); }),
      b('전문가 말', S.expert, () => { S.expert = true; save(); render(); })));
}
function waitOr(place, main) {
  if (S.data[place]) return S.data[place];
  if (S.err[place]) { main.append(h('div', {class: 'card'}, h('p', {class: 'body'}, '자료를 못 읽었습니다. 잠시 뒤 다시 열어 주세요.'), h('p', {class: 'small'}, S.err[place]), h('a', {class: 'btn', href: '/'}, '지금 ATLAS 화면으로'))); return null; }
  main.append(h('p', {class: 'boot'}, '오늘 자료를 불러오고 있습니다…'));
  ensure(place).then(render, render);
  return null;
}

/* ── ① 오늘 ── */
function viewToday(main) {
  const D = waitOr(S.place, main); if (!D) return;
  const kr = D.kr, ex = S.expert, its = D.items;
  const planted = its[0] ? its[0].planted : D.cand.asOf;
  const title = kr ? '1년 오른 무리에 새로 든 7곳' : '미국 · 검사가 덜 끝난 7곳';
  const sub = kr ? kday(D.cand.asOf) + ' 마감 값 · 첫 채점 ' + kday(addSessions(planted, 5)) : kday(its[0] ? its[0].date : D.cand.asOf) + '(미국) 마감 값';
  const mid = D.mc && Array.isArray(D.mc.rows) ? median(D.mc.rows.map(r => r.ploss)) : null;
  const legend = ex ? '오른쪽: 가장 나쁜 5% 경로 평균 · 60거래일 · 모형 가정 아래 추정 · 검증 전' : '오른쪽 숫자: 석 달 뒤 앞날 100가지(모형) 중 손해인 수' + (fin(mid) ? ' · ' + (kr ? '한국' : '미국') + ' 365곳 가운데값 ' + Math.round(mid * 100) : '');
  main.append(h('div', {class: 'head'}, h('h1', {class: 'h1'}, title), h('p', {class: 'sub'}, sub), (kr || S.usShow) && its.length ? h('p', {class: 'small'}, legend) : null));
  const W7 = (kr || S.usShow) && its.length ? week7(D) : null;
  if (W7) main.append(h('section', {class: 'w7 fade', 'aria-label': '7일 뒤'}, // 한 줄 + 덧말 한 줄(7곳 목록이 첫 화면에 남게 — 사장님이 좋아하신 이름 · 움직이는 그래프)
    h('p', {class: 'w7-big'}, '7일 뒤' + (W7.day ? '(' + kday(W7.day) + (ex ? ' · 5거래일' : '') + ')' : '') + ': ' + (ex ? '가운데 값 ' + pct(W7.lo * 100, 1) + ' ~ ' + pct(W7.hi * 100, 1) : W7.n + '곳 모두 반반')),
    h('p', {class: 'w7-sub'}, ex ? '기울기 0 모형 — 방향은 셈하지 않음 · 한 곳을 고를 근거 없음 · 모형 가정 아래 추정 · 검증 전' : '셈 틀은 오를지 내릴지 정하지 않아요 · 가장 흔한 모습은 지금 값 근처(±' + W7.band + '%) · 그래서 한 곳을 고르지 않음 · 셈 틀로 어림한 값 · 아직 확인 전')));
  const idx = D.index;
  if (kr && idx && fin(idx.gap) && idx.gap <= -0.1) main.append(h('a', {class: 'alert', href: '#/record'}, ICON.warn(), h('span', {}, '조심: 코스피가 1년 꼭대기보다 ' + Math.round(Math.abs(idx.gap) * 100) + '% 아래'), h('i', {'aria-hidden': 'true'}, '›')));
  if (!its.length) { main.append(h('div', {class: 'card'}, h('p', {class: 'body'}, '오늘은 적어 둔 곳이 없습니다. 규칙에 맞는 곳이 없으면 비워 둡니다.'))); S.say = title + '. 오늘은 적어 둔 곳이 없습니다.'; return; }
  if (!kr && !S.usShow) {
    main.append(h('div', {class: 'card gate fade'},
      h('p', {class: 'big'}, '미국 7곳은 「위험 공시」 검사를 아직 못 했습니다.'),
      h('p', {class: 'body'}, '회사의 나쁜 소식(공시) 자료가 아직 연결되지 않았습니다. 그래서 이름을 접어 두었습니다.'),
      h('button', {class: 'btn', type: 'button', onclick: () => { S.usShow = true; render(); }}, '그래도 이름 보기')));
    S.say = title + '. 미국 7곳은 위험 공시 검사를 아직 못 했습니다. 그래서 이름을 접어 두었습니다.';
    return;
  }
  const rows = h('div', {class: 'rows'}), say = [title + '. ' + sub + '.' + (W7 ? ' 7일 뒤, ' + W7.n + '곳 모두 반반입니다. 셈 틀은 오를지 내릴지 정하지 않습니다. 가장 흔한 모습은 지금 값 근처입니다.' : '')];
  for (const x of its) {
    const m = x.mc, loss = m && fin(m.ploss) ? Math.round(m.ploss * 100) : null;
    const sp = spark(x.closes);
    const l2 = ex ? '1년 ' + pct(x.m12) + ' · 한 달 ' + pct(x.r20) : sec(x.sector) + (kr ? '' : ' · 검사 ' + x.pass + '/' + x.checks.length);
    const r2 = ex ? (m && fin(m.cvar5) ? '나쁜 5% ' + pct(m.cvar5 * 100) : '모형 값 없음') : (loss != null ? '100 중 ' + loss + ' 손해' : '모형 값 없음');
    const aria = x.name + ', ' + sec(x.sector) + (loss != null ? ', 석 달 뒤 앞날 100가지 중 ' + loss + '가지 손해' : '');
    say.push(aria);
    rows.append(h('button', {class: 'row', type: 'button', 'aria-label': aria, onclick: () => { location.hash = '#/c/' + D.place + '/' + encodeURIComponent(x.code); }},
      h('span', {class: 'row-l'}, h('span', {class: 'row-name'}, x.name), h('span', {class: 'row-sub'}, l2)),
      h('span', {class: 'row-r'},
        sp ? s('svg', {viewBox: '0 0 120 40', 'aria-hidden': 'true'}, s('polyline', {class: 'ln draw', points: sp.main, pathLength: 1}), s('polyline', {class: 'ln-tail', points: sp.tail})) : null,
        h('span', {class: 'row-n num'}, r2))));
  }
  main.append(rows, h('p', {class: 'small'}, '순위가 아니라 규칙이 적어 둔 기록입니다. 1년 오른 폭 차례로만 놓았습니다. 그림 = 최근 석 달, 점선 = 최근 20거래일(규칙에서 뺀 기간).'));
  S.say = say.join('. ') + '.';
}

/* ── 회사 쪽(나쁜 쪽부터) ── */
function viewCompany(main, place, code) {
  const D = waitOr(place, main); if (!D) return;
  const x = D.items.find(i => i.code === code);
  const top = h('div', {class: 'sheet-top'}, h('a', {class: 'back', href: '#/'}, ICON.back(), '7곳'));
  main.append(top);
  if (!x) { main.append(h('div', {class: 'card'}, h('p', {class: 'body'}, '이 회사는 오늘 적어 둔 7곳에 없습니다.'))); S.say = '이 회사는 오늘 적어 둔 7곳에 없습니다.'; return; }
  const kr = D.kr, ex = S.expert, m = x.mc || {}, mcOk = fin(m.ploss);
  const loss = mcOk ? Math.round(m.ploss * 100) : null, w5 = fin(m.cvar5) ? Math.round(100 * (1 + m.cvar5)) : null;
  const g = fanGeo(x, D.mc ? D.mc.track : null);
  main.append(h('div', {},
    h('h1', {class: 'name'}, x.name),
    h('p', {class: 'body'}, '하는 일: ' + x.sector + (x.theme ? ' · ' + x.theme : '')),
    h('p', {class: 'sub'}, kday(x.planted) + ' 새로 든 곳 · 검사 ' + x.checks.length + '개 중 ' + x.pass + '개 통과')));
  if (!kr) main.append(h('p', {class: 'badge'}, '위험 공시: 미국은 자료가 없어 아직 못 봄'));
  if (x.tail) main.append(h('p', {class: 'badge'}, '하락 위험 표시 — 가장 나쁜 5% 평균이 −50%보다 나쁨(표시만 · 모형 검증 전)'));
  const tag = '모형 가정 아래 추정 · 검증 전 · ' + kday(x.date) + ' 종가 기준';
  if (mcOk) {
    const bar = h('div', {class: 'bar', 'aria-hidden': 'true'}, h('span', {})); bar.firstChild.style.width = loss + '%';
    const worst = h('div', {class: 'bar'}, h('span', {})); worst.firstChild.style.width = Math.max(2, Math.min(100, w5 || 0)) + '%';
    main.append(h('section', {class: 'card fade'},
      h('p', {class: 'cap down'}, '먼저, 나쁜 쪽부터'),
      h('p', {class: 'big'}, '석 달 뒤, 모형이 그린 앞날 100가지 중 ' + loss + '가지는 손해'), bar,
      w5 != null ? h('p', {class: 'big'}, '가장 나쁜 5가지 평균: 100만 원이 ' + w5 + '만 원') : null,
      w5 != null ? h('div', {class: 'pair', 'aria-hidden': 'true'}, h('em', {}, '넣은 돈'), h('div', {class: 'bar full'})) : null,
      w5 != null ? h('div', {class: 'pair', 'aria-hidden': 'true'}, h('em', {class: 'down'}, w5 + '만 원'), worst) : null,
      h('p', {class: 'small'}, tag)));
  } else main.append(h('div', {class: 'card'}, h('p', {class: 'body'}, '오늘은 이 회사의 앞날 계산이 없습니다(모형 계산이 올라오면 저절로 보입니다).')));
  const W7 = week7(D), q7 = W7 ? W7.of(x) : null;
  if (q7 && fin(x.close)) {
    main.append(h('section', {class: 'card w7c fade'},
      h('p', {class: 'cap'}, '7일 뒤' + (W7.day ? ' · ' + kday(W7.day) + ' 마감' : '')),
      h('p', {class: 'big'}, '100가지 중 80가지가 ' + money(sig3(x.close * (1 + q7[0])), kr) + ' ~ ' + money(sig3(x.close * (1 + q7[4])), kr) + ' 사이'),
      h('p', {class: 'body'}, ex ? '5거래일 10 · 50 · 90% ' + pct(q7[0] * 100, 1) + ' · ' + pct(q7[2] * 100, 1) + ' · ' + pct(q7[4] * 100, 1) + ' · 기준 ' + money(x.close, kr) + '(' + kday(x.date) + ' 종가)' : '가운데 값은 지금 값 근처(' + pct(q7[2] * 100, 1) + ') — 셈 틀은 오를지 내릴지 정하지 않습니다 · 기준 ' + money(x.close, kr) + '(' + kday(x.date) + ')'),
      h('p', {class: 'small'}, '셈 틀로 어림한 값 · 아직 확인 전 · 값 하나를 맞힌다는 뜻 아님')));
  }
  if (g) {
    main.append(h('figure', {class: 'fig'},
      s('svg', {viewBox: '0 0 ' + g.W + ' ' + g.Ht, role: 'img', 'aria-label': '지난 석 달 실제 가격과 앞으로 석 달의 추정 범위'},
        s('rect', {class: 'fan-future', x: g.split, y: 0, width: g.futW, height: g.Ht}),
        s('polygon', {class: 'fan-outer', points: g.outer}), s('polygon', {class: 'fan-inner', points: g.inner}),
        ex ? s('polyline', {class: 'fan-med', points: g.med}) : null,
        s('line', {class: 'fan-now', x1: g.split, y1: g.nowY, x2: g.endX, y2: g.nowY}),
        s('polyline', {class: 'ln draw', points: g.past, pathLength: 1}),
        s('circle', {class: 'dot-now', cx: g.split, cy: g.nowY, r: 4.5}), s('circle', {class: 'dot-lo', cx: g.endX, cy: g.loY, r: 5}), s('circle', {class: 'dot-hi', cx: g.endX, cy: g.hiY, r: 5})),
      h('div', {class: 'fig-axis'}, h('span', {}, '지난 석 달 · 실제'), h('span', {}, '앞으로 석 달 · 추정')),
      h('div', {class: 'fig-lines'},
        h('p', {class: 'fig-line'}, h('span', {class: 'chip lo', 'aria-hidden': 'true'}), h('b', {}, '석 달 뒤 10가지 중 1가지는 ' + money(g.p10, kr) + ' 아래')),
        h('p', {class: 'fig-line'}, h('span', {class: 'chip hi', 'aria-hidden': 'true'}), h('span', {}, '10가지 중 1가지는 ' + money(g.p90, kr) + ' 위')),
        ex ? h('p', {class: 'fig-line'}, h('span', {class: 'chip mid', 'aria-hidden': 'true'}), h('span', {}, '한가운데(50%) ' + money(g.p50, kr) + ' · 지금 ' + money(g.last, kr))) : null)));
  }
  const gq = D.cand.grow ? D.cand.grow.q : null;
  main.append(h('section', {class: 'card'}, h('p', {class: 'cap'}, '왜 이 목록에 있나'),
    h('p', {class: 'body'}, '지난 1년 ' + pct(x.m12) + ' 올랐습니다(최근 20거래일 뺌). 365곳 중 앞쪽 20% 무리' + (fin(gq) ? '(기준 ' + pct(gq) + ')' : '') + '에 ' + kday(x.planted) + ' 새로 들어왔습니다.')));
  main.append(h('section', {class: 'card warn'}, h('p', {class: 'cap'}, '알아둘 것'),
    x.risk ? h('p', {class: 'body'}, x.risk) : null,
    h('p', {class: 'body'}, '최근 한 달: ' + pct(x.r20, 1) + ' · 1년 사이 가장 낮은 값 ' + money(x.low52, kr) + ', 가장 높은 값 ' + money(x.high52, kr)),
    x.evidence && x.evidence.title ? h('p', {class: 'body'}, '최근 공시: ' + kday(x.evidence.date) + ' 「' + x.evidence.title + '」' + (x.evidence.kindLabel ? ' · ' + x.evidence.kindLabel : '')) : null,
    h('p', {class: 'body strong'}, '이 회사가 무엇으로 돈을 버는지 한 문장으로 말할 수 있나요? 못 하면 먼저 알아보세요.')));
  if (x.checks.length) {
    main.append(h('section', {class: 'card'}, h('p', {class: 'cap'}, '걸러내는 검사 · ' + kday(x.date) + ' 기준'),
      h('div', {class: 'checks'}, x.checks.map(c => {
        const ok = c.verdict === 'pass';
        return h('div', {class: 'check'}, h('i', {class: ok ? 'ok' : 'no', 'aria-hidden': 'true'}, ok ? '✓' : '–'),
          h('span', {}, ex ? (c.label + ': ' + c.value) : (c.id === 'risk' && c.verdict === 'hold' ? '위험 공시: 자료가 없어 못 봄' : (EASY_CHECK[c.id] || c.label))),
          h('em', {}, ok ? '통과' : c.verdict === 'hold' ? '보류' : '빠짐'));
      }))));
  }
  if (ex && mcOk) {
    const mm = D.mc.model || {};
    const kv = (k, v) => h('div', {class: 'kv'}, h('span', {}, k), h('span', {class: 'num'}, v));
    main.append(h('section', {class: 'card'}, h('p', {class: 'cap'}, '전문가 숫자'),
      kv('종가(' + kday(x.date) + ')', money(x.close, kr)),
      kv('60거래일 10% · 50% · 90%', pct(m.q10 * 100) + ' · ' + pct(m.median * 100, 1) + ' · ' + pct(m.q90 * 100)),
      kv('손실 경로 비율', (m.ploss * 100).toFixed(1) + '%' + (m.se && fin(m.se.ploss) ? ' (±' + (m.se.ploss * 100).toFixed(1) + '%p)' : '')),
      kv('나쁜 5% 경계 · 평균', pct(m.q05 * 100) + ' · ' + pct(m.cvar5 * 100)),
      fin(m.volNow) ? kv('출렁임(1년 환산) 지금', Math.round(m.volNow * 100) + '%') : null,
      kv('이 회사 경로 수', fin(m.n) ? m.n.toLocaleString('ko-KR') + '개' : '–'),
      kv('모형', (mm.id || '') + ' · 기울기 ' + (mm.drift ?? '–') + ' · ' + (mm.H || 60) + '거래일'),
      kv('계산 때', ktime(D.mc.made) + '(서울)')));
  }
  main.append(h('p', {class: 'small'}, '자료: ATLAS 판 ' + kday(D.cand.asOf) + (kr ? ' · 한국 값은 오후 3시 30분 마감 동시호가 값' : '') + (D.mc && D.mc.made ? ' · 모형 계산 ' + ktime(D.mc.made) + '(서울)' : '')));
  S.say = x.name + '. ' + (mcOk ? '석 달 뒤, 모형이 그린 앞날 100가지 중 ' + loss + '가지는 손해. ' + (w5 != null ? '가장 나쁜 5가지 평균, 100만 원이 ' + w5 + '만 원. ' : '') : '') + (q7 && fin(x.close) ? '7일 뒤, 100가지 중 80가지가 ' + money(sig3(x.close * (1 + q7[0])), kr) + '에서 ' + money(sig3(x.close * (1 + q7[4])), kr) + ' 사이. ' : '') + (g ? '석 달 뒤 10가지 중 1가지는 ' + money(g.p10, kr) + ' 아래. ' : '') + '모형 가정 아래 추정이고, 검증 전입니다.';
}

/* ── ② 찾기(첫 글자로 · 돈의 흐름) ── */
const CHO = ['ㄱ', 'ㄲ', 'ㄴ', 'ㄷ', 'ㄸ', 'ㄹ', 'ㅁ', 'ㅂ', 'ㅃ', 'ㅅ', 'ㅆ', 'ㅇ', 'ㅈ', 'ㅉ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ'];
const cho = str => { let o = ''; for (const ch of str) { const c = ch.charCodeAt(0); o += (c >= 0xAC00 && c <= 0xD7A3) ? CHO[Math.floor((c - 0xAC00) / 588)] : ch; } return o.replace(/\s+/g, ''); };
const IDX = {};
function index(place) {
  if (IDX[place]) return IDX[place];
  const D = S.data[place]; if (!D) return [];
  const cand = new Set(D.items.map(i => i.code));
  IDX[place] = D.companies.map(c => ({name: c.name, code: c.code, sector: c.sector || '', close: c.close, date: c.date, ret: c.info && fin(c.info.ret252) ? c.info.ret252 * 100 : null, place, cand: cand.has(c.code), ch: cho(c.name || ''), low: String(c.name || '').toLowerCase().replace(/\s+/g, '')}));
  return IDX[place];
}
function searchHits(q) {
  const ql = q.toLowerCase().replace(/\s+/g, ''); if (!ql) return {hits: [], total: 0};
  const only = /^[ㄱ-ㅎ]+$/.test(ql);
  const all = [...index('kr'), ...index('us')];
  const hits = all.filter(x => only ? x.ch.includes(ql) : (x.low.includes(ql) || x.code.toLowerCase().includes(ql)));
  hits.sort((a, b) => (b.cand - a.cand) || (((only ? a.ch : a.low).startsWith(ql) ? 0 : 1) - ((only ? b.ch : b.low).startsWith(ql) ? 0 : 1)) || ((a.place === 'kr' ? 0 : 1) - (b.place === 'kr' ? 0 : 1)) || (a.name.length - b.name.length));
  return {hits: hits.slice(0, 6), total: hits.length};
}
function drawHits(box, note) {
  box.replaceChildren();
  const q = S.q.trim();
  if (!q) { note.textContent = ''; return; }
  const {hits, total} = searchHits(q);
  const usWait = !S.data.us && !S.err.us;
  note.textContent = total === 0 ? (usWait ? '찾는 중입니다…' : '없습니다. ATLAS가 살피는 한국 365곳 · 미국 365곳 안에서만 찾습니다.') : total > 6 ? total + '곳 가운데 6곳만 보입니다. 한 글자 더 쳐 보세요.' : total + '곳 찾았습니다.';
  for (const x of hits) {
    const kr = x.place === 'kr';
    box.append(h('div', {class: 'hit'},
      h('div', {class: 'hit-a'}, h('b', {}, x.name), h('span', {class: 'num ' + (x.ret > 0 ? 'up' : x.ret < 0 ? 'down' : '')}, '1년 ' + pct(x.ret))),
      h('div', {class: 'hit-b'}, h('span', {}, (kr ? '한국' : '미국') + ' · ' + sec(x.sector) + ' · ' + money(x.close, kr) + '(' + kday(x.date) + ')'),
        x.cand ? h('a', {href: '#/c/' + x.place + '/' + encodeURIComponent(x.code)}, '오늘 7곳 ›') : h('a', {href: (kr ? '/' : '/us/') + '#/stock/' + encodeURIComponent(x.code).replace(/%2E/gi, '.')}, '회사 ›'))));
  }
}
function viewFind(main) {
  const D = waitOr('kr', main); if (!D) return;
  const box = h('div', {class: 'rows'}), note = h('p', {class: 'sub', 'aria-live': 'polite'});
  const input = h('input', {id: 'q', type: 'search', autocomplete: 'off', placeholder: '첫 글자만 쳐도 돼요', value: S.q});
  input.addEventListener('input', () => { S.q = input.value; drawHits(box, note); if (!S.data.us) ensure('us').then(() => drawHits(box, note), () => drawHits(box, note)); });
  const chip = c => h('button', {type: 'button', onclick: () => { input.value = c; S.q = c; drawHits(box, note); if (!S.data.us) ensure('us').then(() => drawHits(box, note), () => {}); }}, c);
  main.append(h('label', {class: 'h1', for: 'q'}, '회사 찾기'),
    h('div', {class: 'search'}, ICON.find(), input),
    h('div', {class: 'chips'}, h('span', {}, '눌러 보기'), chip('ㅅㅅㅈㅈ'), chip('ㅎㄷㅊ'), chip('ㅋㅋㅇ')),
    note, box);
  drawHits(box, note);
  const fl = D.cand.flow;
  main.append(h('h2', {class: 'h2'}, '돈의 흐름 · 한국'));
  if (fl && fl.pair && fl.pair.from && fl.pair.to) {
    main.append(h('section', {class: 'card'},
      h('p', {class: 'small'}, '돈이 옮겨 가는 길 · ' + kday(fl.pair.start) + '부터 ' + fl.pair.days + '거래일째'),
      h('div', {class: 'move'}, h('div', {class: 'out'}, h('p', {}, '빠지는 곳'), h('b', {}, fl.pair.from)), ICON.arrow(), h('div', {class: 'in'}, h('p', {}, '들어오는 곳'), h('b', {}, fl.pair.to)))));
  }
  if (fl && Array.isArray(fl.sectors) && fl.sectors.length) {
    const max = Math.max(...fl.sectors.map(g => Math.abs(g.amount || 0))) || 1;
    main.append(h('section', {class: 'card'},
      h('p', {class: 'cap'}, '돈이 가장 많이 들어온 업종 · ' + kday(fl.window.from) + '~' + kday(fl.window.to) + '(' + fl.window.days + '거래일)'),
      fl.sectors.map(g => { const b = h('div', {class: 'bar up', 'aria-hidden': 'true'}, h('span', {})); b.firstChild.style.width = Math.max(4, Math.round(100 * Math.abs(g.amount || 0) / max)) + '%'; return h('div', {class: 'flowrow'}, h('div', {}, h('span', {class: 'strong'}, g.label), h('span', {class: 'num up strong'}, '+' + ((g.amount || 0) / 10000).toFixed(1) + '조 원')), b); }),
      S.expert && Array.isArray(fl.out) ? h('p', {class: 'small'}, '빠진 업종: ' + fl.out.map(g => g.label + ' ' + M + (Math.abs(g.amount || 0) / 10000).toFixed(1) + '조 원').join(' · ')) : null,
      h('p', {class: 'small'}, '숫자 = 시장 전체와 견준 시가총액 몫이 늘어난 크기 · ATLAS 판 ' + kday(D.cand.asOf))));
  }
  const rank = Array.isArray(D.cand.rank) ? D.cand.rank.slice(0, 5) : [];
  if (rank.length) {
    main.append(h('section', {class: 'card warn'}, h('p', {class: 'cap'}, '사람이 가장 많이 몰린 회사'),
      rank.map(t => h('div', {class: 'list-kv'}, h('span', {}, t.nm), h('span', {class: 'num strong'}, '몰림 ' + t.x))),
      h('p', {class: 'body strong'}, '조심: 사람이 한꺼번에 몰려 산 종목은 그 뒤 20일 동안 평균보다 뒤처진 기록이 있습니다.'),
      h('p', {class: 'small'}, 'Barber 외, Journal of Finance(2022) · 몰림 = ATLAS 포모 지수(100이 가장 셈)')));
  }
  S.say = '회사 찾기. 첫 글자만 쳐도 찾습니다.' + (fl && fl.pair ? ' 돈의 흐름: ' + fl.pair.from + '에서 빠져 ' + fl.pair.to + '로 들어가는 중, ' + fl.pair.days + '거래일째.' : '');
}

/* ── ③ 기록(고치지 않는 장부) ── */
function viewRecord(main) {
  const D = waitOr('kr', main); if (!D) return;
  const its = D.items, planted = its[0] ? its[0].planted : D.cand.asOf, today = todaySeoul();
  const pts = [5, 10, 20, 60].map(n => ({n, d: addSessions(planted, n)}));
  const done = pts.filter(p => p.d && p.d <= today).length;
  main.append(h('h1', {class: 'h1'}, '고치지 않는 장부'), h('p', {class: 'sub'}, '적은 날의 값은 그대로 둡니다. 고칠 일은 새 줄로 남깁니다.'));
  const marks = h('div', {class: 'marks', 'aria-hidden': 'true'}, h('i', {}));
  [0, 24, 47, 70, 100].forEach((left, i) => { const sp = h('span', {class: i === 0 || i <= done ? 'done' : null}); sp.style.left = left === 100 ? 'calc(100% - 14px)' : left + '%'; marks.append(sp); });
  main.append(h('section', {class: 'card'},
    h('p', {class: 'cap'}, '채점 ' + done + '번 · 날짜는 미리 박아 둠'),
    h('p', {class: 'big'}, done === 0 ? '첫 채점은 ' + kday(pts[0].d) + ', 석 달 채점은 ' + kday(pts[3].d, planted) + '입니다.' : '채점 결과는 지금 ATLAS 「검증」 탭에 쌓입니다.'),
    marks,
    h('div', {class: 'marklabels'}, h('div', {}, h('span', {}, '적은 날'), h('b', {}, kday(planted))), pts.map(p => h('div', {}, h('span', {}, p.n + '거래일'), h('b', {}, kday(p.d, planted)))))));
  main.append(h('section', {class: 'card'}, h('p', {class: 'cap'}, kday(planted) + '에 적어 둔 7곳 · 그날 종가'),
    its.map(x => h('a', {class: 'ledger', href: '#/c/kr/' + encodeURIComponent(x.code)}, h('b', {}, x.name), h('span', {class: 'num'}, money(x.close, true) + ' ›')))));
  const idx = D.index;
  if (idx && fin(idx.close) && fin(idx.high)) {
    const nowBar = h('div', {class: 'bar'}, h('span', {})); nowBar.firstChild.style.width = Math.round(100 * idx.close / idx.high) + '%';
    main.append(h('section', {class: 'card warn'}, h('p', {class: 'cap'}, '이 규칙이 약했던 때'),
      h('p', {class: 'big'}, '시장이 크게 빠졌다가 다시 오를 때, 1년 동안 많이 오른 회사들이 크게 뒤처졌습니다.'),
      h('p', {class: 'small'}, 'Daniel · Moskowitz, 「Momentum Crashes」, Journal of Financial Economics(2016)'),
      h('p', {class: 'body strong'}, '지금 코스피 ' + Math.round(idx.close).toLocaleString('ko-KR') + ' — ' + kday(idx.highDate) + ' 꼭대기 ' + Math.round(idx.high).toLocaleString('ko-KR') + '보다 ' + Math.round(Math.abs(idx.gap) * 100) + '% 아래(' + kday(idx.date) + ')'),
      h('div', {class: 'pair', 'aria-hidden': 'true'}, h('em', {}, '꼭대기'), h('div', {class: 'bar full'})),
      h('div', {class: 'pair', 'aria-hidden': 'true'}, h('em', {class: 'down'}, '지금'), nowBar)));
  }
  const late = D.late;
  main.append(h('section', {class: 'card'}, h('p', {class: 'cap'}, '아직 비어 있는 곳'),
    h('div', {class: 'gap'}, h('i', {}, '1'), h('span', {}, '미국 7곳: 회사의 위험 공시 자료가 아직 없어 7곳 모두 「보류」입니다.')),
    late.length ? h('div', {class: 'gap'}, h('i', {}, '2'), h('span', {}, '한국 365곳 가운데 ' + late.length + '곳은 ' + kday(D.cand.asOf) + ' 종가가 아직 없어 그 전 값을 씁니다(' + late.slice(0, 3).map(l => l.name).join(' · ') + ' 등).')) : null,
    h('div', {class: 'gap'}, h('i', {}, late.length ? '3' : '2'), h('span', {}, '앞날 범위는 모형 가정 아래 추정입니다. 실제 값이 범위 안에 든 날 수는 채점 뒤에 밝힙니다.'))));
  main.append(h('section', {class: 'card'}, h('p', {class: 'cap'}, '어디서 왔나'),
    h('p', {class: 'body'}, '값: 한국은 오후 3시 30분 마감 동시호가 값 · ATLAS 판 ' + kday(D.cand.asOf) + (D.mc ? ' · 앞날 계산 ' + (D.mc.model ? D.mc.model.id : '') + ' ' + ktime(D.mc.made) + '(서울)' : '')),
    h('p', {class: 'body'}, '「100가지 중 몇 가지」로 말하는 까닭: 퍼센트보다 덜 헷갈립니다 — Hoffrage 외, Science(2000).'),
    h('p', {class: 'body'}, '사람이 몰린 종목의 뒤처짐 — Barber 외, Journal of Finance(2022).'),
    h('a', {class: 'btn', href: '/'}, '지금까지의 ATLAS 화면 보기')));
  S.say = '고치지 않는 장부. 채점 ' + done + '번. 첫 채점은 ' + kday(pts[0].d) + '입니다. 이 규칙이 약했던 때: 시장이 크게 빠졌다가 다시 오를 때입니다.';
}

/* ── 그리기 ── */
function render() {
  const app = document.getElementById('app'); if (!app) return;
  const hash = decodeURIComponent(location.hash || '#/');
  const m = hash.match(/^#\/c\/(kr|us)\/(.+)$/);
  const key = m ? 'company' : hash.startsWith('#/find') ? 'find' : hash.startsWith('#/record') ? 'record' : 'today';
  const keepFocus = key === 'find' && document.activeElement && document.activeElement.id === 'q';
  if (keepFocus) return; // 찾는 중에는 글자칸을 다시 그리지 않음(한글 입력이 끊기지 않게)
  const main = h('main', {class: 'main', id: 'main'});
  if (key === 'company') viewCompany(main, m[1], m[2]);
  else if (key === 'find') viewFind(main);
  else if (key === 'record') viewRecord(main);
  else viewToday(main);
  app.replaceChildren(...[band(), key === 'today' ? segs() : null, main, tabs(key === 'company' ? 'today' : key)].filter(Boolean));
  document.title = {company: '회사', find: '찾기', record: '기록', today: '오늘 7곳'}[key] + ' · ATLAS 새 판';
}
document.documentElement.style.fontSize = ['100%', '112.5%', '125%'][S.scale];
window.addEventListener('hashchange', () => { if (window.speechSynthesis && S.speaking) { window.speechSynthesis.cancel(); S.speaking = false; } window.scrollTo(0, 0); render(); });
render();
ensure('kr').then(render, render);
