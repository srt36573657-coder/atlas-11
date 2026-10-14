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
// 사장님 2026-10-13 13:04 「매번 업데이트 할때 365개 종목기준을 힘이 붙는 종목으로 기준을 변경한다 … cia팀이 중심이 되서 나머지팀은 협력하여 기횓한후 알트라스에 적용시킨다」
//   → 365곳 = 「힘 붙은 365곳」(h365-v1 · 네 팀 기획) — 이름 바로 밑에 늘 「그중 힘 붙음 n곳 · 나머지 m곳은 그다음 차례로 채움」 · 회사마다 앞 10거래일 → 뒤 10거래일 · 차례(순위)는 싣지 않음(규칙 55)
//   · 「힘 붙음」 글자는 빨강으로 칠하지 않음(덜 내린 곳도 들어 있음 · 규칙 53) · 옛 「대세 · 층 · 두 팀」 글은 지난 회차 기록의 「옛 규칙(대세 업종)」 꼬리표에만
// 사장님 2026-10-13 23:14(서울) 「기준 다시 만들어봐 찰리 멍거라면」 · 23:34 「철저하게 찰리 망거 조건만 해」 · 2026-10-14 00:03 「가 로 하자」
//   → 바탕 = 「멍거 조건 N곳」(mg-v1 · 3년 모두 돈 벎 · 빚이 자기 돈보다 적음 · 자기 돈 100원으로 해마다 18원 넘게 · 수는 자료에서 · 365곳 채우지 않음)
//   · 회사 3단 「왜 멍거 조건에 들었나요?」 = 세 조건 해마다 값 · 멍거 쪽 말은 접은 칸 · 「멍거가 고른 목록이 아님」 · 옛 「힘 붙은 365곳」 글은 지난 회차 기록의 「옛 규칙(힘 붙음)」 꼬리표에만
// 사장님 2026-10-14 05:37(싱가포르) 「세계적인 주식투자 2인을 더 찾아 내 봐」 · 06:03 「가」 · 06:05 「가」(멍거 26곳과 린치 18곳을 함께 · 겹치면 한 번)
//   → 바탕 = 「멍거 · 린치 조건 N곳」(ml-v1) — 이름 밑 「멍거 조건 a곳 · 린치 조건 b곳 · 둘 다 c곳」 · 3단 「왜 … 들었나요?」 = 넘은 갈래마다 값 · 깔때기 두 갈래 · 밖 회사는 갈래마다 멈춘 자리
// 사장님 2026-10-14 12:01(싱가포르) 「나」(「첫 화면부터 모두 모든 회사로 바꿔요. 고른 56곳은 금빛이에요」 · 11:58 「업종이 29개 밖에 … 정상적으로 다 해」)
//   → 경주판 갈래 · 업종 · 회사 = 모든 회사(core.mkt · core.groups · core.industries · mkt.json) · 고른 곳(멍거 · 린치 조건)은 금빛(줄 왼쪽 금빛 띠 + 금빛 이름표) · 고른 곳만 7단 화면 ·
//     나머지 회사 줄은 「밖」 칸(#/x/ — 이름 · 까닭 · 깔때기) · 업종 화면 「?」 = 하루 30% 넘게 바뀐 날이 있는 회사(주식 수 바뀜일 수 있음 · 확인 못 함)
//   2026-10-14 17:21(싱가포르) 「그리고 7단 클릭구조 부활 시켜」 · 17:25 「전부다 나오게 해」(규칙 62) — core.co7 이면 모든 회사가 3 ~ 7단(회사 파일 co/<번호>.json 의 c · line · coEntry) ·
//     고른 곳 밖 3단 = 「왜 … 밖인가요?」(이름표 까닭 · 깔때기) · 6단 이야기 = 「조사 전」(이야기는 고른 곳만 사람이 조사) · 7단 = range.json others · 밖 칸 #/x/ 는 회사 주식이 아닌 것(펀드 · 우선주 …)만 · 회사 주식의 옛 #/x/ 주소는 3단 회사로
const $ = (s, el = document) => el.querySelector(s);
/** 바탕 회사 수 · 이름(멍거 · 린치 조건 N곳 — 수는 회차마다 자료에서) · 이름 밑 한 줄(갈래마다 수 · 쉬운 말) */
const NP = (C = D.core) => C?.funnel?.picked ?? '?';
const pickName = (C = D.core) => `${C?.rules?.name ?? '고른'} ${NP(C)}곳`;
const pickLine = C => C?.rules?.line ?? (C?.rules?.conds?.length ? C.rules.conds.map(x => x.t).join(' · ') : '? 고른 기준을 못 읽었습니다');
const lyDay = (C = D.core) => (C?.rules?.lyDay ? md(C.rules.lyDay) : '모음 날'); // 린치 갈래가 쓴 값의 날(모음 날 · 그 뒤 주가는 안 씀)
const pickHow = (C = D.core) => `멍거 갈래는 3년 성적표만, 린치 갈래는 3년 성적표와 ${lyDay(C)} 값으로 골랐습니다`;
const NS = 'http://www.w3.org/2000/svg';
const RM = matchMedia('(prefers-reduced-motion: reduce)');
const D = {core: null, comp: null, lines: null, names: null, mkt: null};
const state = {mode: 'eq', played: false, font: 0, hub: 0, hubStop: false, hubDet: false}; // hub = 맨 위 슬라이드 7장 가운데 보는 장 · hubStop = 손대서 멈춤 · hubDet = 「자세히」 열림(사장님 2026-10-12 19:59 · 20:11)

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
let compP = null, namesP = null, rangeP = null, daysP = null, updP = null, mktP = null; const coP = new Map();
/** 모든 회사(2026-10-14 「나」) — 업종 화면 회사 줄(이름 · 업종 · 20거래일 · 선 · 고른 곳 p · 튐 j) */
function needMkt() { if (!mktP) mktP = getJson('mkt.json').then(m => { D.mkt = m.companies; D.mktN = m.n; }).catch(e => { mktP = null; throw e; }); return mktP; }
const MK = (C = D.core) => C?.mkt ?? C?.all; // 경주판 맨 위 묶음 = 모든 회사(옛 자료면 고른 곳 전체)
const MN = (C = D.core) => (C?.mkt?.n ?? NP(C)); // 모든 회사 수
function needDays() { if (!daysP) daysP = getJson('days.json').then(d => { D.days = d; }).catch(e => { daysP = null; throw e; }); return daysP; }
function needCo(code) { if (!coP.has(code)) coP.set(code, getJson('co/' + encodeURIComponent(code) + '.json').catch(e => { coP.delete(code); throw e; })); return coP.get(code); }
function needRange() { if (!rangeP) rangeP = getJson('range.json').then(p => { D.range = p; }).catch(e => { rangeP = null; throw e; }); return rangeP; } // 7단 범위(사장님 2026-10-13 06:45 말씀으로 고른 목록 · 차례는 지움)
/** 회사 자료 하나 — 고른 곳 = comp.json · lines.json / 고른 곳 밖 = co/<번호>.json 의 c · line
 *  (모든 회사 7단 · 사장님 2026-10-14 17:21(싱가포르) 「그리고 7단 클릭구조 부활 시켜」 · 17:25 「전부다 나오게 해」 — core.co7 = 회사 파일이 있는 회사 수) */
async function coEntry(code) {
  await needComp();
  if (D.comp[code]) return {c: D.comp[code], line: D.lines[code], pk: true};
  if (!D.core.co7) return null;
  try { const co = await needCo(code); return co?.c && co.line ? {c: co.c, line: co.line, pk: false} : null; } catch { return null; }
}
function needComp() { if (!compP) compP = Promise.all([getJson('comp.json'), getJson('lines.json')]).then(([c, l]) => { D.comp = c.companies; D.lines = l.lines; }).catch(e => { compP = null; throw e; }); return compP; }
// grow.json(회사 성장 요약)은 화면에서 읽지 않음 — 7단부터 회사마다 co/<번호>.json 의 grow 를 씀(자료 따로 세기 · 올린 뒤 확인에는 남음)
function needUpd() { if (!updP) updP = getJson('updates.json').then(u => { D.upd = u; }).catch(e => { updP = null; throw e; }); return updP; }
function needNames() { if (!namesP) namesP = getJson('names.json').then(n => { D.names = n; prepNames(); }).catch(e => { namesP = null; throw e; }); return namesP; }

// ── 경주판(잡스팀) — 줄 하나 = 갈래 · 업종 · 회사 하나 · 가운데 = 기준일(20거래일 전)과 같음 ──
//   줄마다 작은 선 그래프(사장님 2026-10-13 12:30 「이 사진처럼 그 업종 이라든지 종목에 그래프가 표현되게해」) — 막대 대신 20거래일 선 ·
//   줄마다 제 눈금(사진처럼 모양이 보이게 — 크기는 옆 숫자가 말함) · 점선 = 기준일 값 · 흐린 점선 = 위 단 평균(같은 눈금) · 오르면 빨강 · 내리면 파랑 · 경주 때 선이 날마다 자람
//   items: [{key, name, href, v:[21], cw:[21], badge, gold, pk}] · parent: {v, cw}(흰 점선) · wide: 이름이 긴 줄(두 줄 모양)
//   gold = 금빛 이름표 글(고른 곳 · 고른 n곳) · pk = 줄 왼쪽 금빛 띠(고른 회사 · 고른 곳이 든 업종 — 2026-10-14 「나」)
const SPW = 100, SPH = 30; // 줄 선 그래프 viewBox(늘여 그림 · 선 굵기는 그대로)
function race(host, {items, parent, wide = false, label, onTick, onDone, auto = false, n: nDays = null}) { // nDays = 줄 선 칸 수(없으면 20거래일 창 · 요즘 오르는 업종 = 1주 6칸)
  const C = D.core, n = nDays ?? C.dates.length;
  const board = h('div', {class: 'board' + (wide ? ' wide' : ''), role: 'group', 'aria-label': label}); // 줄은 링크 그대로(구글팀 2026-10-12: role=listitem 이 링크를 가렸음)
  const scale = arrs => Math.max(5, Math.ceil(Math.max(0, ...arrs.flat().filter(x => x != null).map(x => Math.abs(x - 100))) * 1.06));
  const Meq = scale(items.map(it => it.v).concat(parent ? [parent.v] : [])), Mcw = scale(items.map(it => it.cw || it.v).concat(parent ? [parent.cw] : []));
  let M = state.mode === 'cw' ? Mcw : Meq;
  const rows = items.map(it => {
    const spk = sv('svg', {class: 'spk', viewBox: `0 0 ${SPW} ${SPH}`, preserveAspectRatio: 'none', 'aria-hidden': 'true', focusable: 'false'});
    const pa = parent ? sv('path', {class: 'pa'}) : null, ln = sv('path', {class: 'ln'});
    const b0 = sv('line', {class: 'b0', x1: 0, x2: SPW, y1: SPH / 2, y2: SPH / 2});
    spk.append(b0, ...(pa ? [pa] : []), ln);
    const val = h('b', {class: 'val num'}), nm = h('span', {class: 'nm'}, h('span', {class: 'nt', text: it.name}), it.badge ? h('span', {class: 'badge' + (it.badge === '?' ? ' qb' : ''), text: it.badge}) : null, it.gold ? h('span', {class: 'badge gold', text: it.gold}) : null);
    const trd = it.tr ? trEl(state.mode === 'cw' && it.trc ? it.trc : it.tr) : null;
    const row = h('a', {class: 'row' + (trd ? ' two' : '') + (it.pk ? ' pk' : ''), href: it.href}, nm, h('span', {class: 'track', 'aria-hidden': 'true'}, spk), val, trd, h('span', {class: 'chev', 'aria-hidden': 'true', text: '›'}));
    board.append(row);
    return {it, row, ln, pa, b0, rng: {}, val, trd, rank: -1, cur: 100};
  });
  host.append(board);
  const rowH = rows.length ? rows[0].row.getBoundingClientRect().height + (wide ? 4 : 0) : 0;
  board.style.height = (rows.length * rowH) + 'px';
  const at = (arr, k) => { const a = Math.floor(k), b = Math.min(n - 1, a + 1), f = k - a; const x = arr[a], y = arr[b]; if (x == null) return y; if (y == null) return x; return x + (y - x) * f; };
  // 선 — 0 ~ k 날까지(값이 빈 날은 끊음) · 세로 = 그 줄의 낮은 값 ~ 높은 값(기준일 값 100 · 위 단 평균 포함)
  const sx = j => (j / Math.max(1, n - 1) * SPW).toFixed(2);
  const sy = (v, [lo, hi]) => (hi - lo < 1e-9 ? SPH / 2 : 2 + (hi - v) / (hi - lo) * (SPH - 4)).toFixed(2);
  const lineTo = (arr, k, R) => { if (!arr) return ''; let d = '', on = false; const a = Math.floor(k);
    for (let j = 0; j <= a && j < n; j++) { const x = arr[j]; if (x == null) { on = false; continue; } d += (on ? 'L' : 'M') + sx(j) + ' ' + sy(x, R); on = true; }
    if (k > a && a + 1 < n && on) { const x = at(arr, k); if (x != null) d += 'L' + sx(k) + ' ' + sy(x, R); }
    return d; };
  const rngOf = r => { if (!r.rng[mode]) { const vs = [...(mode === 'cw' && r.it.cw ? r.it.cw : r.it.v), ...(parent ? (mode === 'cw' ? parent.cw : parent.v) : []), 100].filter(x => x != null && isFinite(x)); r.rng[mode] = [Math.min(...vs), Math.max(...vs)]; } return r.rng[mode]; };
  let mode = state.mode;
  function paint(k, settle) {
    for (const r of rows) {
      const v = at(mode === 'cw' && r.it.cw ? r.it.cw : r.it.v, k); r.cur = v;
      const d = v == null ? null : v - 100, s = d == null ? 0 : Math.min(1, Math.abs(d) / M);  // 값이 없는 날(거래정지 · 새 값 못 받음)은 「?」 · 막대 없음
      const R = rngOf(r), y0 = sy(100, R); if (r.b0.getAttribute('y1') !== y0) { r.b0.setAttribute('y1', y0); r.b0.setAttribute('y2', y0); }
      r.ln.setAttribute('d', lineTo(mode === 'cw' && r.it.cw ? r.it.cw : r.it.v, k, R)); r.ln.setAttribute('class', 'ln ' + cls(d)); void s;
      r.val.textContent = pct(d); r.val.className = 'val num ' + cls(d);
      if (r.pa) r.pa.setAttribute('d', lineTo(mode === 'cw' ? parent.cw : parent.v, k, R));
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
function lineChart(host, {v, avg, label, noPick = false}) {
  const C = D.core, n = C.dates.length, kPick = noPick ? null : C.kPick; // 고른 곳 밖 회사는 「고른 날」 금빛 줄을 긋지 않음(모든 회사 7단 · 고른 회사로 읽히지 않게)
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
    h('p', {text: `자료: ${C.sources.price} · 기준일 = 마지막 종가 날(${md(C.asOf)})의 ${C.days}거래일 전(${md(C.base)}) · ${pickName(C)} — ${pickHow(C)}(그 뒤 주가는 안 씀).`}),
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
function legend(parentName, gold, b0 = null) { // b0 = 바탕 줄 이름(없으면 기준일 · 요즘 오르는 업종은 1주 전)
  return h('p', {class: 'key'}, h('span', {}, h('i', {class: 'k-up'}), '오름'), h('span', {}, h('i', {class: 'k-dn'}), '내림'), parentName ? h('span', {}, h('i', {class: 'k-avg'}), parentName + ' 평균') : null, h('span', {}, h('i', {class: 'k-b0'}), b0 ?? '기준일(' + md(D.core.base) + ') 값'),
    gold ? h('span', {}, h('i', {class: 'k-pk'}), gold) : null); // 금빛 = 고른 곳(2026-10-14 「나」)
}
function crumbs(...parts) { const c = h('nav', {class: 'crumb', 'aria-label': '지금 자리'}); parts.forEach((p, i) => { if (i) c.append(h('i', {text: '›', 'aria-hidden': 'true'})); c.append(p.href ? h('a', {href: p.href, text: p.text}) : h('span', {text: p.text})); }); return c; }
/** 회사 고리 — 모든 회사에 회사 파일이 있으면(core.co7 · 2026-10-14 17:25 「전부다 나오게 해」) 모두 3단 회사 · 옛 자료면 고른 곳만 회사 · 나머지 밖 칸 */
const cHref = (c, pk) => (D.core?.co7 || pk ? '#/c/' : '#/x/') + c;
const hrefInd = i => (i.n === 1 ? cHref(i.members[0], !D.core?.mkt || i.pk) : '#/i/' + encodeURIComponent(i.name)); // 1곳뿐인 업종 — 그 회사로
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
// ── 첫 화면 여섯 장(사장님 2026-10-12 18:31 「그 친구 (소개하기) 밑에 바를 만들어가지고 이렇게 슬라이드로」) → 맨 위 슬라이드 7장(19:59 「이게 맨위에 있어서 슬라이드로 나오게 하라고요」 ·
//   20:11 확인 그림에 「응」) — 「친구에게 소개하기」 띠를 따로 두지 않고 맨 위 자리를 통째로 슬라이드로(1장 소개) · 바는 슬라이드 밑 · 5초마다 저절로 · 손대면 멈춤 — 아래 hub() 머리 글
let homeP = null;
function needHome() { if (!homeP) homeP = getJson('home.json').then(x => { D.home = x; }).catch(() => { D.home = null; homeP = null; }); return homeP; }
const mdw = d => { const x = new Date(d + 'T00:00:00Z'); return `${md(d)}(${DOW[x.getUTCDay()]})`; };
const numK = (v, k = 2) => (v == null ? '?' : Number(v).toLocaleString('ko-KR', {minimumFractionDigits: k, maximumFractionDigits: k}));
/** 억 원 → 「1조 7,507억 원」 */
const eokW = v => { if (v == null) return '?'; const a = Math.abs(Math.round(v)), jo = Math.floor(a / 10000), r = a % 10000; return (jo ? jo.toLocaleString('ko-KR') + '조' + (r ? ' ' : '') : '') + (r || !jo ? r.toLocaleString('ko-KR') + '억' : '') + ' 원'; };
const BW = (up, down) => { const n = up + down; if (!n) return '?'; const s = up / n; return s >= 0.65 ? '넓게 오른 날' : s <= 0.35 ? '넓게 내린 날' : '오른 곳 · 내린 곳이 섞인 날'; }; // 판독 규칙 mr-v1 과 같은 문턱
const staleNote = (H, k) => { const t = H?.stale?.[k]; return t ? h('p', {class: 'q', text: `? 이번에 못 받아 앞 회차(${/^\d{4}-\d{2}-\d{2}/.test(t) ? mdw(t.slice(0, 10)) + ' ' + t.slice(11, 16) : t}) 값입니다.`}) : null; };
const add = (v, ...xs) => v.append(...xs.filter(Boolean)); // 없는 조각(null)을 글 「null」로 붙이지 않게
/** 이름 뒤 「이 · 가」 — 받침이 있으면 이(코스닥이 · 개인이 · 기관이) · 없으면 가(코스피가 · 외국 투자자가) */
const iga = s => { const c = String(s).charCodeAt(String(s).length - 1); return c >= 0xAC00 && c <= 0xD7A3 && (c - 0xAC00) % 28 ? s + '이' : s + '가'; };
/** 길이 · 자리는 CSSOM 으로(보안 규칙 CSP style-src 'self' — style 속성 글은 막힘) */
const st = (el, css) => { Object.assign(el.style, css); return el; };
/** 가운데 0 막대 한 줄(HTML) — 오름 · 내림 색(kind 'pm') 또는 옥색 한 색(kind 'one') */
function dbar(v, max, kind = 'pm') {
  const w = max ? Math.min(50, Math.abs(v ?? 0) / max * 50) : 0;
  return h('span', {class: 'dbar', 'aria-hidden': 'true'}, h('i', {class: 'z'}), v == null ? null : st(h('i', {class: 'f ' + (kind === 'one' ? 'one' : v > 0 ? 'up' : v < 0 ? 'down' : 'flat')}), {[v < 0 ? 'right' : 'left']: '50%', width: w.toFixed(1) + '%'}));
}
/** 보는 사람의 서울 때(ISO) — 「오늘」은 값의 날짜가 이 날짜와 같을 때만(다음 날 아침에 어제 값을 「오늘」이라 하지 않음 · CIA팀 2026-10-12 18:31) */
const kstNow = () => new Date(Date.now() + 9 * 36e5).toISOString();
const dayWord = d => (!d ? '?' : d === kstNow().slice(0, 10) ? '오늘' : mdw(d));
/** 장 중 말 — 정규장(9:00 ~ 15:30)에 받은 값이고 지금도 그 장 안이면 「장 중」 · 그 장이 지났으면 「장 중에 받은 값」 · 장 밖에 받았으면 「장 끝 값」 */
const inSession = H => { if (!H?.live) return false; const n = kstNow(), t = n.slice(11, 16); return n.slice(0, 10) === H.kst.slice(0, 10) && t >= '09:00' && t < '15:30'; };
const liveWord = H => (!H?.live ? '장 끝 값' : inSession(H) ? '장 중 — 값이 아직 바뀝니다' : '장 중에 받은 값(마감 값과 다를 수 있음)');
const liveTag = H => (!H?.live ? '' : inSession(H) ? ' (장 중)' : ' (장 중에 받은 값)');
/** 오늘의 눈금(다섯 팀 합침 — 사장님 2026-10-12 23:10 「구글 삼성 그리고 머스크 그리고 cia 그리고 이건희 회장님 정신 철학을 녹여내」)
 *  3개월 날마다 움직임(종가 약 60개 → 하루 움직임 약 59개) 위에 오늘을 놓음 — 지난 사실만 · 다음 날 말은 없음
 *  평소 = 오늘 앞 20거래일 하루 움직임 크기의 평균(머스크 「흔들림 자」) · 언제 뒤 처음 = 오늘만큼 같은 쪽으로 움직인 마지막 날(CIA · 구글 「거울」) ·
 *  몇 번째 = 3개월에 오늘만큼 움직인 날 수(오늘 넣고 · 이건희 「눈금」) · 며칠째 = 같은 쪽으로 이어진 거래일 수와 그동안 비율(CIA) */
function gauge(x) {
  const r = x?.rows; if (!r || r.length < 22) return null;
  const d = [], ds = [];
  for (let k = 1; k < r.length; k++) if (r[k - 1][1] > 0 && r[k][1] > 0) { d.push((r[k][1] / r[k - 1][1] - 1) * 100); ds.push(r[k][0]); }
  const n = d.length, t = d[n - 1]; if (n < 21 || !isFinite(t)) return null;
  const same = v => (t < 0 ? v <= t : t > 0 ? v >= t : false);
  let since = null, gap = null; for (let k = n - 2; k >= 0; k--) if (same(d[k])) { since = ds[k]; gap = n - 1 - k; break; }
  const avg = d.slice(n - 21, n - 1).reduce((a, v) => a + Math.abs(v), 0) / 20;
  let streak = 0, acc = 1; for (let k = n - 1; k >= 0 && t !== 0 && Math.sign(d[k]) === Math.sign(t); k--) { streak++; acc *= 1 + d[k] / 100; }
  return {d, ds, n, t, since, gap, rank: t ? d.filter(same).length : null, avg, ratio: avg > 0 ? Math.abs(t) / avg : null, streak, streakChg: (acc - 1) * 100};
}
/** 평소와 견준 말 — 1.25배 넘으면 「평소의 n배」 · 0.8 ~ 1.25 「평소만큼」 · 그 밑 「평소보다 작게」(작은 수는 말로) */
const usualW = g => (g.ratio == null ? '평소 ?' : g.ratio >= 1.25 ? `평소의 ${(g.ratio >= 10 ? Math.round(g.ratio) : Math.round(g.ratio * 10) / 10).toLocaleString('ko-KR')}배` : g.ratio >= 0.8 ? '평소만큼' : '평소보다 작게');
/** 「코스피 — 평소의 2.5배로 내림 · 9월 2일 뒤 가장 큼」 — 「언제 뒤」는 5거래일 넘게 떨어졌을 때만(어제 · 그제 뒤 가장 큼은 뜻이 작음) · 3개월 안에 없으면 「3개월 중 가장 큼」 */
function gaugeLine(name, g) {
  if (!g) return `${name} — ? 3개월 값이 모자라 견주지 못함`;
  if (!g.t) return `${name} — 그대로(움직임 0)`;
  const way = g.t < 0 ? '내림' : '오름', u = usualW(g);
  const tail = !g.since ? ` · 3개월 중 가장 크게 ${way}` : g.gap >= 5 ? ` · ${md(g.since)} 뒤 가장 큼` : '';
  return `${name} — ${u}${u.endsWith('배') ? '로' : ''} ${way}${tail}`;
}
/** 눈금 그림 — 3개월 하루하루 막대(날짜 차례) · 점선 = 오늘 깊이 · 진한 막대 = 오늘만큼 같은 쪽으로 움직인 날 · 오늘 막대는 금빛 테(뜻 있는 표시) · 바둑판 아님(SVG 막대 한 장) */
function gaugeSvg(name, g, dw = '오늘', size = '') {
  // 눈금 높이는 오늘에 맞춤(오늘 막대 = 반 높이의 약 60%) — 3개월에 한두 번 있던 아주 큰 날(7월 −10.8% · +17.9%)이 오늘을 납작하게 만들지 않게 · 그보다 큰 날은 끝까지(잘림)
  const W = 320, Hh = size === 'big' ? 88 : 56, n = g.n, bw = W / n, mx = Math.max(Math.abs(g.t) * 1.6, 1), mid = Hh / 2, T = tok(), Y = v => mid - Math.max(-1, Math.min(1, v / mx)) * (mid - 2);
  const same = v => (g.t < 0 ? v <= g.t : g.t > 0 ? v >= g.t : false);
  const svg = sv('svg', {viewBox: `0 0 ${W} ${Hh}`, width: '100%', height: Hh, role: 'img', 'aria-label': `${name} 3개월 ${n}거래일 하루 움직임 — 오늘 ${pct(g.t)} · 오늘만큼 ${g.t < 0 ? '내린' : '오른'} 날 오늘 넣고 ${g.rank ?? '?'}날`});
  svg.append(sv('line', {x1: 0, x2: W, y1: mid, y2: mid, stroke: T.mute, 'stroke-width': 1}));
  g.d.forEach((v, k) => { const y = Y(v), on = k === n - 1 || same(v);
    const r = sv('rect', {x: (k * bw + 0.4).toFixed(2), y: Math.min(y, mid).toFixed(1), width: Math.max(1, bw - 0.8).toFixed(2), height: Math.max(1, Math.abs(y - mid)).toFixed(1), fill: v > 0 ? T.up : v < 0 ? T.down : T.mute, 'fill-opacity': on ? 1 : 0.25});
    if (k === n - 1) { r.setAttribute('stroke', T.gold); r.setAttribute('stroke-width', 2); }
    svg.append(r); });
  if (g.t) svg.append(sv('line', {x1: 0, x2: W, y1: Y(g.t).toFixed(1), y2: Y(g.t).toFixed(1), stroke: T.ink, 'stroke-width': 1, 'stroke-dasharray': '3 3', opacity: 0.8}));
  return h('div', {class: 'gauge' + (g.t > 0 ? ' gup' : '')}, svg, h('span', {class: 'gtd', 'aria-hidden': 'true', text: dw})); // 「오늘」은 보는 날짜가 값의 날일 때만(다음 날 아침엔 「10월 12일」) // 「오늘」 이름표는 오늘 막대 반대쪽 빈 반에(내린 날 = 위 · 오른 날 = 아래)
}
/** 2장 오늘 — 핵심 하나(사장님 2026-10-13 00:18 「핵심위주로」): 제목(오늘 두 지수) · 받은 때 · 결론 한 줄(평소의 몇 배 · 언제 뒤 가장 큼) · 눈금 그림(크게) · 읽는 법 한 줄
 *  코스닥 눈금 · 시장 넓이 · 「!」 글은 「자세히」(homeToday) · 지움(머스크 · 구글): 오르내림 막대 줄 · 「!」 단추 줄(문턱 표시는 바 칸 금빛 「!」 그대로) */
function homeHead(v, H, go) {
  const K = H.idx?.KOSPI, Q = H.idx?.KOSDAQ, d0 = H.kst.slice(0, 10);
  v.append(h('h1', {class: 'head'}, K || Q ? [`${dayWord((K ?? Q).date)} 코스피 `, pctEl(K?.day, 'span'), ' · 코스닥 ', pctEl(Q?.day, 'span')] : '오늘 시장 — ?'));
  v.append(h('p', {class: 'when', text: `${dayWord(d0) === '오늘' || d0 === (K ?? Q)?.date ? '' : mdw(d0) + ' '}${H.kst.slice(11, 16)} 받음 · ${liveWord(H)}`})); // 날짜는 제목에 한 번(받은 날이 값의 날과 다를 때만 여기에도)
  const main = gauge(K) ? ['코스피', gauge(K), K] : gauge(Q) ? ['코스닥', gauge(Q), Q] : null;
  if (!main) { v.append(h('p', {class: 'q', text: K || Q ? '? 3개월 값이 모자라 오늘을 견주지 못했습니다.' : '? 지수 값을 못 받았습니다.'})); return; }
  const td = dayWord(main[2].date) === '오늘', dw = td ? '오늘' : '이날'; // 다음 날 아침 = 「이날」(제목에 날짜) · 이름표는 「10월 12일」
  v.append(h('p', {class: 'lead say', text: gaugeLine(main[0], main[1])}), gaugeSvg(main[0], main[1], td ? '오늘' : md(main[2].date), 'big'),
    h('p', {class: 'gcap', text: `진한 막대 = ${main[0] === '코스피' ? '' : '코스닥이 '}${dw}만큼 ${main[1].t < 0 ? '내린' : '오른'} 날`}));
}
/** 2장 「자세히」 — 두 지수 눈금 · 시장 넓이(10곳 중 n곳 · 곳 수) · 문턱 「!」(글) · 읽는 법 */
function homeToday(v, H) {
  const K = H.idx?.KOSPI, Q = H.idx?.KOSDAQ, B = H.sectors?.breadth, A = H.alerts ?? [], d = (K ?? Q)?.date;
  v.append(h('h2', {class: 'sec', text: `${d ? dayWord(d) + ' ' : ''}시장 — 평소와 견줌`})); // 「오늘」은 보는 날짜가 값의 날일 때만(다음 날 아침 검사)
  for (const [name, x] of [['코스피', K], ['코스닥', Q]]) { if (!x) continue; const g = gauge(x);
    v.append(h('p', {class: 'lead', text: gaugeLine(name, g)})); if (g) v.append(gaugeSvg(name, g, dayWord(x.date) === '오늘' ? '오늘' : md(x.date))); }
  if (B && B.up + B.down) { const dn = B.down >= B.up, k = Math.round((dn ? B.down : B.up) / (B.up + B.flat + B.down) * 10), nn = B.n.toLocaleString('ko-KR');
    v.append(h('p', {}, `시장 ${nn}곳 중 `, h('b', {class: 'up', text: B.up.toLocaleString('ko-KR') + '곳 오름'}), ' · ', h('b', {class: 'down', text: B.down.toLocaleString('ko-KR') + '곳 내림'}), ` — 10곳 중 ${k}곳 ${dn ? '내림' : '오름'}${liveTag(H)}`)); }
  else v.append(h('p', {class: 'q', text: '? 시장 전체 오른 곳 · 내린 곳 수를 못 받았습니다.'}));
  const ix = A.filter(a => a.kind === 'idx'), fx = A.filter(a => a.kind === 'flow'), way = xs => (xs.every(a => a.v < 0) ? '내림' : xs.every(a => a.v > 0) ? '오름' : '움직임');
  // 「!」 문턱 home-v3(2026-10-13 01:28 「1억번 계산고 360도 사고」) — 평소의 2.5배 넘고 1.5% 넘음(usual) · 또는 하루 5% 넘음(big)
  for (const why of ['big', 'usual']) { const xs = ix.filter(a => (a.why ?? 'usual') === why); if (!xs.length) continue;
    v.append(h('p', {class: 'q', text: `! ${xs.length > 1 ? '두 지수 모두' : xs[0].name} ${why === 'big' ? '하루 5% 넘게' : '평소의 2.5배 넘게'} ${way(xs)} — 미리 정한 문턱`})); }
  for (const a of fx) v.append(h('p', {class: 'q', text: `! 외국 투자자가 ${a.name}에서 ${eokW(a.v)} 더 ${a.v < 0 ? '팖' : '삼'} — 하루 1조 원 문턱`}));
  v.append(h('details', {class: 'more'}, h('summary', {text: '눈금 읽는 법'}), h('div', {class: 'in'},
    h('p', {text: '막대 하나 = 3개월 가운데 하루(왼쪽이 옛날 · 맨 오른쪽 금빛 테가 오늘). 점선 = 오늘 움직인 깊이. 진한 막대 = 오늘만큼 같은 쪽으로 움직인 날.'}),
    h('p', {text: '평소 = 오늘 앞 20거래일 하루 움직임 크기의 평균. 「n월 n일 뒤 가장 큼」은 오늘만큼 움직인 마지막 날이 5거래일 넘게 앞일 때만 적습니다.'}),
    h('p', {text: '금빛 「!」 = 평소의 2.5배 넘게 움직이고 1.5% 넘을 때, 또는 하루 5% 넘을 때입니다. 코스피 1990년 · 코스닥 1996년부터의 날마다 기록과 1억 날 흉내로 280가지 문턱을 견줘 골랐습니다(해마다 약 18번 · 조용한 장과 거친 장의 차이가 가장 작음).'}),
    h('p', {text: '센 것일 뿐 — 다음 날을 말하지 않습니다.'}))));
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
  return box;
}
/** 2장 지수 — 두 칸 같은 비율 폭(로그) · 3개월 전 = 100 으로 맞추지 않음(시작 날 하루만 옮겨도 숫자가 크게 갈림 · CIA팀) · 칸 밑 「가장 높던 · 낮던 날」은 접음(애플 · 클로드팀) */
function homeIndex(v, H) {
  const K = H.idx?.KOSPI, Q = H.idx?.KOSDAQ, C = D.core;
  v.append(h('h2', {class: 'sec', text: '코스피 · 코스닥 — 3개월'}));
  if (!K && !Q) { v.append(h('p', {class: 'q', text: '? 지수 값을 못 받았습니다.'})); return; }
  const X = K ?? Q;
  add(v, h('p', {class: 'when', text: `${md(X.rows[0][0])} → ${md(X.date)}${liveTag(H)}`}),
    h('p', {class: 'lead'}, '3개월 가운데 가장 높던 날보다 코스피 ', pctEl(K?.hi?.vs, 'span'), ' · 코스닥 ', pctEl(Q?.hi?.vs, 'span')), staleNote(H, 'idx'));
  const sp = [K, Q].filter(Boolean).map(x => Math.log(Math.max(...x.rows.map(r => r[1]))) - Math.log(Math.min(...x.rows.map(r => r[1])))), span = Math.max(...sp) * 1.08 || 0.1;
  const band = [C.base, C.asOf];
  v.append(h('div', {class: 'ipans'}, idxPanel(K, span, band, H.live), idxPanel(Q, span, band, H.live)));
  v.append(h('details', {class: 'more'}, h('summary', {text: '그림 읽는 법 · 오늘의 눈금 · 출처'}), h('div', {class: 'in'},
    ...[K, Q].filter(Boolean).map(x => h('p', {}, `${x.name} — 가장 높던 ${md(x.hi.d)}보다 `, pctEl(x.hi.vs, 'span'), ` · 가장 낮던 ${md(x.lo.d)}보다 `, pctEl(x.lo.vs, 'span'))),
    // 오늘의 눈금(2장) 셈 — 지난 사실만(다섯 팀 합침 2026-10-12 23:10)
    ...[K, Q].filter(Boolean).map(x => { const g = gauge(x); return h('p', {text: !g ? `${x.name} 오늘의 눈금 — ? 3개월 값이 모자람` : `${x.name} 오늘의 눈금 — 오늘 ${pct(g.t)} · 평소(오늘 앞 20거래일 하루 움직임 크기 평균) ${numK(g.avg, 1)}% · 3개월 ${g.n}거래일 가운데 오늘만큼 ${g.t < 0 ? '내린' : '오른'} 날 ${g.rank ?? '?'}날(오늘 넣고)${g.since ? ` · 그 앞 마지막 날 ${md(g.since)}` : ''}${g.streak >= 2 ? ` · ${g.streak}거래일째 ${g.t < 0 ? '내림' : '오름'}(그동안 ${pct(g.streakChg)})` : ''}`}); }),
    h('p', {text: '「n월 n일 뒤 가장 큼」은 오늘만큼 움직인 마지막 날이 5거래일 넘게 앞일 때만 적습니다. 센 것일 뿐 — 다음 날을 말하지 않습니다.'}),
    h('p', {text: `옅은 띠 = 아래 ${C.mkt ? '모든 회사' : NP() + '곳'} 경주 기간(${md(C.base)} → ${md(C.asOf)} · 20거래일). 두 칸은 같은 비율 폭이라 기울기를 견줄 수 있습니다. 마지막 동그라미가 속이 비면 장 중에 받은 값(마감 값 아님)입니다.`}),
    h('p', {text: '날마다 종가 · 네이버 증권 지수. 지난 20거래일: 코스피 ' + pct(H.cmp20?.kospi) + ' · 코스닥 ' + pct(H.cmp20?.kosdaq) + '.'}))));
}
/** 「오늘 업종」 줄 → ATLAS 업종 화면(7단 중 2단 · 사장님 2026-10-14 15:01(싱가포르) 「여기 클릭 하면 7단구조 나오게해」) — 네이버 업종 이름 → core.secInd(그 네이버 업종 회사가 가장 많이 든 업종 · site_build 셈 · site_verify 따로 셈) · 없으면 고리 없음 */
const secHref = name => { const n = D.core?.secInd?.[String(name ?? '').replace(/\s+/g, '')], i = n ? D.core.industries?.find(x => x.name === n) : null; return i ? hrefInd(i) : null; };
/** 업종 줄 하나 — 고리가 있으면 줄 전체가 그 업종으로(오른쪽 끝 ›) */
function secRow(g, max) {
  const href = secHref(g.name), kids = [h('p', {class: 'sl'}, h('span', {class: 'sn', text: g.name}), pctEl(g.chg, 'b'), href ? h('i', {class: 'sgo', 'aria-hidden': 'true', text: '›'}) : null), dbar(g.chg, max)];
  return h('li', {}, href ? h('a', {class: 'srow', href}, ...kids) : kids);
}
function srows(list, max) {
  return h('ol', {class: 'srows'}, ...list.map(g => secRow(g, max)));
}
/** 3장 업종 — 강한 7 · 약한 7 한 장(나누면 「강한 7」 장이 살 목록처럼 읽힘 · CIA팀) · 줄마다 붙던 「오른 곳 · 365곳」은 접음(애플 · 클로드팀) */
function homeSectors(v, H) {
  const S = H.sectors, d = S?.date ?? H.idx?.KOSPI?.date;
  v.append(h('h2', {class: 'sec', text: `${d ? dayWord(d) + ' ' : ''}업종 — ${S?.label ?? '강한 7'} · 약한 7`}));
  if (!S) { v.append(h('p', {class: 'q', text: '? 업종 값을 못 받았습니다.'})); return; }
  add(v, h('p', {class: 'lead'}, `가장 강한 ${S.strong[0]?.name ?? '?'} `, pctEl(S.strong[0]?.chg, 'span'), ` · 가장 약한 ${S.weak[0]?.name ?? '?'} `, pctEl(S.weak[0]?.chg, 'span'), liveTag(H)), staleNote(H, 'sectors'));
  // 시장 넓이(2장에서 옮김 — 2장은 「10곳 중 n곳」 한 줄) · 그림 = 오른 곳 · 그대로 · 내린 곳 비율 막대 한 줄
  const B = S.breadth; if (B) { const n = B.up + B.flat + B.down || 1, nn = B.n.toLocaleString('ko-KR'), w = x => (x / n * 100).toFixed(1) + '%';
    v.append(h('div', {class: 'brd', role: 'img', 'aria-label': `시장 ${nn}곳 가운데 ${B.up.toLocaleString('ko-KR')}곳 오름 · ${B.down.toLocaleString('ko-KR')}곳 내림`},
      h('div', {class: 'brow'}, h('span', {class: 'bl', 'aria-hidden': 'true', text: '시장 ' + nn + '곳'}),
        h('span', {class: 'bb', 'aria-hidden': 'true'}, st(h('i', {class: 'up'}), {width: w(B.up)}), st(h('i', {class: 'flat'}), {width: w(B.flat)}), st(h('i', {class: 'down'}), {width: w(B.down)})))),
      h('p', {}, `시장 ${nn}곳 중 `, h('b', {class: 'up', text: B.up.toLocaleString('ko-KR') + '곳 오름'}), ' · ', h('b', {class: 'down', text: B.down.toLocaleString('ko-KR') + '곳 내림'}), ` → ${BW(B.up, B.down)}`)); }
  // 다르게 보면(CIA — 반대 사실 밝히기): 강한 7업종도 회사로 세면
  { const su = S.strong.reduce((a, g) => a + (g.up ?? 0), 0), sd = S.strong.reduce((a, g) => a + (g.down ?? 0), 0);
    if (su + sd) v.append(h('p', {class: 'note', text: `다르게 보면 — ${S.label}업종도 회사로 세면 ${su.toLocaleString('ko-KR')}곳 오름 · ${sd.toLocaleString('ko-KR')}곳 내림`})); }
  const max = Math.max(...[...S.strong, ...S.weak].map(g => Math.abs(g.chg)), 0.5);
  v.append(h('h3', {class: 'sh', text: S.label}), srows(S.strong, max), h('h3', {class: 'sh', text: '약한 7'}), srows(S.weak, max));
  v.append(h('details', {class: 'more'}, h('summary', {text: '업종마다 오른 곳 수 · 셈'}), h('div', {class: 'in'},
    h('ul', {}, ...[...S.strong, ...S.weak].map(g => h('li', {text: `${g.name} — 오른 곳 ${g.up}/${g.n}${g.in365 ? ` · 우리 ${NP()}곳 가운데 ${g.in365}곳` : ''}`}))),
    h('p', {text: `시장 업종 ${S.ranked}개만 줄 세웠습니다 — 회사 5곳 미만 업종 ${S.skipped}개와 「기타」(${(S.other ?? 0).toLocaleString('ko-KR')}곳)는 뺐습니다. 업종 %는 네이버 증권이 셈한 값입니다(셈법 ?).`}),
    h('p', {text: '오늘 강한 업종이 내일도 강하다는 뜻은 아닙니다 — 지난 사실만 적습니다.'}))));
}
/** 4장 사고팔기 — 개인 · 외국 투자자 · 기관 · 더 삼 / 더 팖 · 막대는 돈의 방향이라 옥색 한 색(클로드팀) */
function homeFlows(v, H) {
  const F = H.flows, d = F?.KOSPI?.date ?? F?.KOSDAQ?.date;
  v.append(h('h2', {class: 'sec', text: `${d ? dayWord(d) + ' ' : ''}누가 사고팔았나`}));
  if (!F) { v.append(h('p', {class: 'q', text: '? 사고판 돈을 못 받았습니다.'})); return; }
  const who = [['personal', '개인'], ['foreign', '외국 투자자'], ['institutional', '기관']], mk = [['KOSPI', '코스피'], ['KOSDAQ', '코스닥']];
  const all = mk.flatMap(([m, mn]) => who.map(([k, kn]) => ({mn, kn, val: F[m]?.[k] ?? null}))).filter(x => x.val != null);
  const big = all.slice().sort((a, b) => Math.abs(b.val) - Math.abs(a.val))[0], tag = F.live && !H.stale?.flows ? (inSession(H) ? ' (장 중 · 잠정)' : ' (장 중에 받은 잠정 값)') : '';
  add(v, h('p', {class: 'lead', text: big ? `${iga(big.kn)} ${big.mn}에서 ${eokW(big.val)} 더 ${big.val < 0 ? '팖' : '삼'}${tag}` : '? 값 없음'}), staleNote(H, 'flows'));
  const max = Math.max(...all.map(x => Math.abs(x.val)), 1);
  for (const [m, mn] of mk) {
    const x0 = F[m]; v.append(h('h3', {class: 'sh', text: `${mn}${x0?.date && x0.date !== d ? ' · ' + md(x0.date) : ''}`}));
    v.append(h('ol', {class: 'srows'}, ...who.map(([k, kn]) => { const x = x0?.[k] ?? null;
      return h('li', {}, h('p', {class: 'sl'}, h('span', {class: 'sn', text: kn}), h('b', {class: 'num', text: x == null ? '?' : `${eokW(x)} 더 ${x < 0 ? '팖' : '삼'}`})), dbar(x, max, 'one')); })));
  }
  v.append(h('details', {class: 'more'}, h('summary', {text: '말 풀이 · 출처'}), h('div', {class: 'in'},
    h('p', {text: '더 삼 = 그날 산 돈이 판 돈보다 많음 · 더 팖 = 그 반대. 기관 = 연금 · 보험 · 증권사 · 은행 등. 세 쪽을 더해도 0이 아닌 까닭은 그 밖의 투자자(다른 법인 등)가 있기 때문입니다.'}),
    h('p', {text: '막대는 오름 · 내림이 아니라 돈의 방향이라 한 색(옥색)입니다. 장 중 값은 잠정 · 출처 네이버 증권 투자자별 매매 동향(억 원).'}))));
}
/** 5장 미국 — 마지막 장 · 줄 밑 자 = 60거래일 가장 낮음 ~ 가장 높음 가운데 지금 자리 · 한국 다음에 미국(「미국 때문에」로 안 읽히게 · 클로드팀) */
function homeUS(v, H) {
  const U = H.us;
  v.append(h('h2', {class: 'sec', text: '미국 — 마지막 장'}));
  if (!U) { v.append(h('p', {class: 'q', text: '? 미국 값을 못 받았습니다.'})); return; }
  const vix = U.rows.find(r => r.key === 'VIX');
  add(v, h('p', {class: 'lead'}, `미국 ${U.date ? mdw(U.date) : '?'} 장 끝 — ${U.n}개 가운데 ${U.up}개 오름 · 불안 지수 `, pctEl(vix?.chg, 'span')), staleNote(H, 'us'));
  v.append(h('ol', {class: 'urows'}, ...U.rows.map(r => { const at = r.close != null && r.hi > r.lo ? (r.close - r.lo) / (r.hi - r.lo) * 100 : null;
    return h('li', {}, h('p', {class: 'sl'}, h('span', {class: 'sn', text: r.name}), h('span', {class: 'num uc', text: numK(r.close)}), pctEl(r.chg, 'b')),
      h('span', {class: 'ruler', role: 'img', 'aria-label': at == null ? `${r.name} 60거래일 자리 ?` : `${r.name} 60거래일 가장 낮음 ${numK(r.lo)} ~ 가장 높음 ${numK(r.hi)} 가운데 ${Math.round(at)}% 자리`}, h('i', {class: 'rl'}), at == null ? null : st(h('i', {class: 'rd'}), {left: at.toFixed(1) + '%'}))); })));
  v.append(h('details', {class: 'more'}, h('summary', {text: '자 읽는 법 · 출처'}), h('div', {class: 'in'},
    h('p', {text: '줄 밑 자 = 지난 60거래일 가장 낮음(왼쪽) ~ 가장 높음(오른쪽) 가운데 지금 자리.'}),
    h('p', {text: '미국 장은 한국 장이 끝난 뒤 열려 한국 오늘 값과 같은 날이 아닙니다. 출처 네이버 증권 해외 지수.'}))));
}
/** 6장 365곳 — 제목에 값의 날짜 · 「힘 붙음 회사부터 골랐다」를 그림 위로(CIA팀 · 2026-10-13 「힘 붙은 365곳」 · 이름 밑 한 줄) · 그림 = 365곳 하나하나를 가는 막대로 많이 오른 차례(바둑판 아님) · 20거래일 견줌은 접음 */
function home365(v, H) {
  const S = H.s365;
  v.append(h('h2', {class: 'sec', text: `${pickName()} — ${S?.date ? dayWord(S.date) : '?'}`}), h('p', {class: 'say', text: pickLine(D.core)}));
  if (!S || !S.list.length) { v.append(h('p', {class: 'q', text: `? ${NP()}곳 값이 없습니다.`})); return; }
  const B = H.sectors?.bias, sd = H.sectors?.date ?? H.idx?.KOSPI?.date;
  add(v, h('p', {class: 'lead'}, h('b', {class: 'up', text: S.up + '곳 오름'}), ' · ', h('b', {class: 'down', text: S.down + '곳 내림'}), S.flat ? ` · ${S.flat}곳 그대로` : ''),
    B ? h('p', {class: 'note', text: `${pickHow()} — ${sd ? dayWord(sd) + ' ' : ''}약한 7업종에 ${NP()}곳 가운데 ${B.weak365}곳 · ${H.sectors.label}업종에 ${B.strong365}곳이 있습니다.`}) : null);
  const L = S.list, n = L.length, W = 360, Hh = 96, max = Math.max(...L.map(x => Math.abs(x[1])), 1), T = tok(), bw = W / n, mid = Hh / 2;
  const svg = sv('svg', {viewBox: `0 0 ${W} ${Hh}`, width: '100%', height: Hh, role: 'img', 'aria-label': `${NP()}곳 바뀐 비율 — 많이 오른 차례 · ${S.up}곳 오름 · ${S.down}곳 내림 · 가장 많이 오른 ${S.top?.n} ${pct(S.top?.chg)} · 가장 많이 내린 ${S.bot?.n} ${pct(S.bot?.chg)}`});
  svg.append(sv('line', {x1: 0, x2: W, y1: mid, y2: mid, stroke: T.mute, 'stroke-width': 1}));
  L.forEach(([, c], k) => { const hgt = Math.max(1, Math.abs(c) / max * (mid - 2)); svg.append(sv('rect', {x: (k * bw).toFixed(2), y: (c >= 0 ? mid - hgt : mid).toFixed(1), width: Math.max(0.6, bw - 0.2).toFixed(2), height: hgt.toFixed(1), fill: c > 0 ? T.up : c < 0 ? T.down : T.mute})); });
  const cur = sv('rect', {class: 'cur', x: 0, y: 0, width: Math.max(2, bw), height: Hh, fill: T.gold, 'fill-opacity': 0, 'pointer-events': 'none'}); svg.append(cur);
  const pick = h('p', {class: 'pick'}), host = h('div', {class: 'strip'}, svg);
  const show = k => { const [c, x] = L[k], co = D.comp?.[c]; cur.setAttribute('x', (k * bw).toFixed(2)); cur.setAttribute('fill-opacity', 0.55);
    pick.replaceChildren(h('a', {class: 'play', href: '#/c/' + c}, `${co?.name ?? c} `, pctEl(x, 'span'), ' 보기 ›')); };
  const mv = e => { const r = svg.getBoundingClientRect(); show(Math.max(0, Math.min(n - 1, Math.floor((e.clientX - r.left) / r.width * n)))); };
  svg.addEventListener('pointerdown', e => { needComp().then(() => mv(e)).catch(() => mv(e)); }); svg.addEventListener('pointermove', e => { if (e.buttons || e.pointerType === 'mouse') mv(e); });
  v.append(host, h('div', {class: 'ax'}, h('span', {text: '많이 오름'}), h('span', {text: '많이 내림'})), pick);
  v.append(h('p', {class: 'links2 ends'}, S.top ? h('a', {href: '#/c/' + S.top.c}, '▲ 가장 많이 오른 ', h('b', {text: S.top.n}), ' ', pctEl(S.top.chg, 'span')) : null,
    S.bot ? h('a', {href: '#/c/' + S.bot.c}, '▼ 가장 많이 내린 ', h('b', {text: S.bot.n}), ' ', pctEl(S.bot.chg, 'span')) : null));
  // 지난 20거래일 견줌 — 365곳을 시장 옆에 같은 자로(CIA팀) · 접음(고른 기간이 이 20거래일과 같아 365곳이 좋아 보이기 쉬움 — 머리에 「고른 기간과 같은 날」 · 애플팀)
  const M = H.cmp20; if (M) {
    const list = [['코스피', M.kospi], ['코스닥', M.kosdaq], [`${NP()}곳 · 한 회사 한 표`, M.eq], [`${NP()}곳 · 큰 회사는 크게`, M.cw]], mx = Math.max(...list.map(x => Math.abs(x[1] ?? 0)), 1);
    v.append(h('details', {class: 'more'}, h('summary', {text: `지난 20거래일 견줌(${md(M.base)} → ${md(M.asOf)} · 고른 기간과 같은 날)`}), h('div', {class: 'in'},
      h('ol', {class: 'srows'}, ...list.map(([nm, x]) => h('li', {}, h('p', {class: 'sl'}, h('span', {class: 'sn', text: nm}), pctEl(x, 'b')), dbar(x, mx)))))));
  }
}
// ── 맨 위 슬라이드 7장(사장님 2026-10-12 19:59 「이게 맨위에 있어서 슬라이드로 나오게 하라고요」 · 20:11 확인 그림에 「응」) ──
//   맨 위 「친구에게 소개하기」 자리를 통째로 슬라이드로: 1 소개 · 2 오늘 · 3 지수 · 4 업종 · 5 사고팔기 · 6 미국 · 7 365곳 · 바로 밑에 바(칸 7 — 지금 칸이 차오름 · 누르면 그 장 ·
//   그 장에 문턱 넘은 값이면 금빛 「!」 · 못 받았거나 앞 회차 값이면 금빛 「?」) · 그 밑 「n / 7 · 이름」과 「‖ 멈춤」 단추
//   5초마다 저절로 넘어감(확인 그림 그대로 · 사장님 「응」) — 손가락 · 마우스 · 키보드가 닿거나 「자세히」를 열거나 「멈춤」을 누르면 멈춤 · 화면 밖 · 다른 창이면 쉼 · 움직임 줄이기면 저절로 안 넘어감(WCAG 2.2.2)
//   장은 짧은 요약(그림 하나) · 「자세히 ›」 = 바 밑에 그 장의 전부(14:54 종합 정보 칸 그대로) · 지금 장 밖 장은 visibility hidden + inert(옆으로 잘림 · 화면 읽기 · 누름 차례에서 뺌)
//   주소는 #/ 그대로(장 번호 · 멈춤 · 자세히는 state — 회사에 갔다 뒤로 오면 그대로 · 새로 열거나 아래 「한눈에」를 누르면 1장부터 다시 넘어감)
const SLIDES = [['hello', '소개'], ['today', '오늘'], ['idx', '지수'], ['sec', '업종'], ['flow', '사고팔기'], ['us', '미국'], ['s365', '멍거 · 린치']];
const DWELL = 5000; // 한 장에 머무는 때(확인 그림 「5초마다」)
let hubGo = null; // 아래 「한눈에」를 누르면 1장부터(맨 아래 tabbar)
/** 바 칸 표시 — 그 장에 문턱을 넘은 값이 있으면 「!」 · 못 받았거나 앞 회차 값이면 「?」(금빛 · 뒷장 조심이 첫 장에서도 보이게) */
function hubMark(H, id) {
  const S = H.stale ?? {}, A = H.alerts ?? [];
  const bang = (id === 'idx' && A.some(a => a.kind === 'idx')) || (id === 'flow' && A.some(a => a.kind === 'flow'));
  const q = (id === 'idx' && (!H.idx || S.idx)) || (id === 'sec' && (!H.sectors || S.sectors)) || (id === 'flow' && (!H.flows || S.flows)) || (id === 'us' && (!H.us || S.us)) || (id === 's365' && !H.s365?.list?.length);
  return (bang ? '!' : '') + (q ? '?' : '');
}
/** 1장 소개 — 그림 자리에 사장님 글(2026-10-13 05:42 「앵무새 그게 있는곳에 글 제대로 딱 올려 알겠지 이대로 올려」 — 글자 · 띄어쓰기 그대로 · 05:49 「생각해세요 여가 아니라 생각해보세요」로 끝 한 곳 · 05:52 「고쳐」로 「번신분 → 버신 분」만 고침) · 아래 「친구에게 소개하기」(막비 24초 영상 · 보내기)는 그대로 */
/** 친구 소개 상품권 한 줄(사장님 2026-10-14 14:56 「01090117377 내 번호 올리고 카톡으로 아틀란스 소개 10명 시켜 주면 스타벅스 아메리카노 상품권 1장 준다고 올려」 · 14:59 「너가 알아서 해 그냥 많이줘」) — 누르면 소개 쪽(/hello.html)의 상자(번호 · 문자 보내기 · 10명마다 1장) */
const HELLO_PROMO = '10명 소개하면 스타벅스 상품권 1만원!'; // 2026-10-14 18:19(싱가포르) 「스타벅스 상품권 1만원 이라고 해 1장이 아니라」 // 바로 위 「친구에게 소개하기」가 누구에게인지 말해 줌 — 한 줄에 들게(360 · 390)
// 2026-10-14 15:19(싱가포르) 「글을 이렇게 올려 내 친구 히구 가 돈 못버는건 아틀란스를 안보고 실력 없는 사람들 말 들어서다  아클란스가 답이다 이렇게」 · 15:19 「히구 가 하나라 하규야」 —
//   「생각해보세요」 자리에 새 글(「아클란스」 → 「아틀란스」만 고침) · 15:54 「안상미 전문님 돈 많 버세요 주식해서 도 올려」 — 「전무님」 · 「많이」로 읽음(여쭘) · 줄 나눔은 화면에 맞춤
//   17:13 「전무님이 맞아」 · 17:16 「하규는 아틀란스 해서 부자 될겁니다 로 변경해」(하규 두 줄을 바꿈 · 「아틀란스가 답이다」는 그대로 둔 안을 보여 드림) · 17:17 「10명중 1명은 지워」
const HELLO_MSG = ['주식해서', '돈 버신 분 몇분일까요?', '왜? 그럴까요!', '하규는 아틀란스 해서 부자 될겁니다', '아틀란스가 답이다', '안상미 전무님 주식해서 돈 많이 버세요', '아틀란스 올림!'];
function slideHello() {
  return h('a', {class: 'hello hs-hello hs-say', href: '/hello.html'}, h('span', {class: 'hmsg'}, ...HELLO_MSG.map(t => h('span', {class: 'hml', text: t}))),
    h('span', {class: 'hello-mo', 'aria-hidden': 'true'}, MO.rainbow(46), MO.heart(16)), h('span', {class: 'hw'}, h('b', {text: '친구에게 소개하기'}), h('span', {text: '홍표 35초 영상 · 보내기 ›'}),
      h('span', {class: 'hpr', text: HELLO_PROMO})));
}
/** 3장 지수 — 두 지수 3개월 선(같은 비율 폭 · 축 없음) */
function miniLine(x, span, live) {
  const box = h('div', {class: 'mline'});
  if (!x) { box.append(h('p', {class: 'q', text: '? 값 없음'})); return box; }
  box.append(h('p', {class: 'il'}, h('b', {text: x.name}), h('span', {class: 'num iv', text: numK(x.close)}), pctEl(x.day, 'b')));
  const W = 320, Hh = 60, P = 5, rows = x.rows, n = rows.length, lv = rows.map(r => Math.log(r[1])), mid = (Math.max(...lv) + Math.min(...lv)) / 2, top = mid + span / 2, bot = mid - span / 2;
  const X = k => P + k * (W - 2 * P) / Math.max(1, n - 1), Y = l => P + (top - l) / (top - bot) * (Hh - 2 * P), T = tok();
  const svg = sv('svg', {viewBox: `0 0 ${W} ${Hh}`, width: '100%', height: Hh, preserveAspectRatio: 'none', role: 'img', 'aria-label': `${x.name} 3개월 — 가장 높던 ${md(x.hi.d)}보다 ${pct(x.hi.vs)}`});
  svg.append(sv('path', {d: rows.map((r, k) => (k ? 'L' : 'M') + X(k).toFixed(1) + ' ' + Y(lv[k]).toFixed(1)).join(''), fill: 'none', stroke: T.ink, 'stroke-width': 2, 'stroke-linejoin': 'round'}),
    sv('circle', {cx: X(n - 1).toFixed(1), cy: Y(lv[n - 1]).toFixed(1), r: 4, fill: live ? T.night : (x.day < 0 ? T.down : T.up), stroke: x.day < 0 ? T.down : T.up, 'stroke-width': 2}));
  box.append(svg);
  return box;
}
function miniIdx(v, H) {
  const K = H.idx?.KOSPI, Q = H.idx?.KOSDAQ;
  v.append(h('h2', {class: 'sec', text: '코스피 · 코스닥 — 3개월'}));
  if (!K && !Q) { v.append(h('p', {class: 'q', text: '? 지수 값을 못 받았습니다.'})); return; }
  const X = K ?? Q, sp = [K, Q].filter(Boolean).map(x => Math.log(Math.max(...x.rows.map(r => r[1]))) - Math.log(Math.min(...x.rows.map(r => r[1])))), span = Math.max(...sp) * 1.08 || 0.1;
  add(v, h('p', {class: 'when', text: `${md(X.rows[0][0])} → ${md(X.date)}`}), staleNote(H, 'idx'), h('div', {class: 'mini2'}, miniLine(K, span, H.live), miniLine(Q, span, H.live))); // 장 중 꼬리표는 2장 받은 때 줄에 한 번
}
/** 4장 업종 — 강한 3 · 약한 3(7 · 7 과 막대는 「자세히」) */
function miniSec(v, H) {
  const S = H.sectors, d = S?.date ?? H.idx?.KOSPI?.date;
  v.append(h('h2', {class: 'sec', text: `${d ? dayWord(d) + ' ' : ''}업종 — ${(S?.label ?? '강한 7').replace('7', '3')} · 약한 3`}));
  if (!S) { v.append(h('p', {class: 'q', text: '? 업종 값을 못 받았습니다.'})); return; }
  const six = [...S.strong.slice(0, 3), ...S.weak.slice(0, 3)], max = Math.max(...six.map(g => Math.abs(g.chg)), 0.5);
  add(v, staleNote(H, 'sectors'), h('ol', {class: 'mrows bars'}, ...six.map(g => secRow(g, max))));
}
/** 5장 사고팔기 — 가장 큰 쪽 한 문장 + 코스피 세 줄(돈 · 막대는 「자세히」) */
function miniFlow(v, H) {
  const F = H.flows, d = F?.KOSPI?.date ?? F?.KOSDAQ?.date;
  v.append(h('h2', {class: 'sec', text: `${d ? dayWord(d) + ' ' : ''}누가 사고팔았나`}));
  if (!F) { v.append(h('p', {class: 'q', text: '? 사고판 돈을 못 받았습니다.'})); return; }
  const who = [['personal', '개인'], ['foreign', '외국 투자자'], ['institutional', '기관']], mk = [['KOSPI', '코스피'], ['KOSDAQ', '코스닥']];
  const big = mk.flatMap(([m, mn]) => who.map(([k, kn]) => ({mn, kn, val: F[m]?.[k] ?? null}))).filter(x => x.val != null).sort((a, b) => Math.abs(b.val) - Math.abs(a.val))[0];
  const m0 = F.KOSPI ? 'KOSPI' : 'KOSDAQ';
  add(v, h('p', {class: 'lead', text: big ? `${iga(big.kn)} ${big.mn}에서 ${eokW(big.val)} 더 ${big.val < 0 ? '팖' : '삼'}` : '? 값 없음'}), staleNote(H, 'flows'),
    h('p', {class: 'mcap', text: m0 === 'KOSPI' ? '코스피' : '코스닥'}), h('ol', {class: 'mrows bars'}, ...who.map(([k, kn]) => { const x = F[m0]?.[k] ?? null, mx = Math.max(...who.map(([q]) => Math.abs(F[m0]?.[q] ?? 0)), 1);
      return h('li', {}, h('p', {class: 'sl'}, h('span', {class: 'sn', text: kn}), h('b', {class: 'num', text: x == null ? '?' : `${eokW(x)} 더 ${x < 0 ? '팖' : '삼'}`})), dbar(x, mx, 'one')); })));
}
/** 6장 미국 — 마지막 장 · 지수마다 바뀐 비율(60거래일 자는 「자세히」) */
function miniUS(v, H) {
  const U = H.us;
  v.append(h('h2', {class: 'sec', text: '미국 — 마지막 장'}));
  if (!U) { v.append(h('p', {class: 'q', text: '? 미국 값을 못 받았습니다.'})); return; }
  add(v, h('p', {class: 'lead', text: `미국 ${U.date ? mdw(U.date) : '?'} 장 끝 — ${U.n}개 가운데 ${U.up}개 오름`}), staleNote(H, 'us'),
    h('ol', {class: 'mrows bars'}, ...U.rows.map(r => { const at = r.close != null && r.hi > r.lo ? (r.close - r.lo) / (r.hi - r.lo) * 100 : null;
      return h('li', {class: 'uin'}, h('span', {class: 'sn', text: r.name}), pctEl(r.chg, 'b'), h('span', {class: 'ruler', role: 'img', 'aria-label': at == null ? `${r.name} 60거래일 자리 ?` : `${r.name} 60거래일 가장 낮음 ~ 가장 높음 가운데 ${Math.round(at)}% 자리`}, h('i', {class: 'rl'}), at == null ? null : st(h('i', {class: 'rd'}), {left: at.toFixed(1) + '%'}))); })),
    h('p', {class: 'gcap', text: '자 = 60거래일 낮음 ~ 높음'}));
}
/** 7장 365곳 — 오른 곳 · 내린 곳 + 365곳 가는 막대 그림(누르는 그림 · 회사 고리는 「자세히」 — 옆 밀기와 손가락이 부딪히지 않게) */
function mini365(v, H) {
  const S = H.s365;
  v.append(h('h2', {class: 'sec', text: `${pickName()} — ${S?.date ? dayWord(S.date) : '?'}`}));
  if (!S || !S.list.length) { v.append(h('p', {class: 'q', text: `? ${NP()}곳 값이 없습니다.`})); return; }
  const L = S.list, n = L.length, W = 360, Hh = 110, max = Math.max(...L.map(x => Math.abs(x[1])), 1), T = tok(), bw = W / n, mid = Hh / 2;
  const svg = sv('svg', {viewBox: `0 0 ${W} ${Hh}`, width: '100%', height: Hh, role: 'img', 'aria-label': `${NP()}곳 바뀐 비율 — 많이 오른 차례 · ${S.up}곳 오름 · ${S.down}곳 내림`});
  svg.append(sv('line', {x1: 0, x2: W, y1: mid, y2: mid, stroke: T.mute, 'stroke-width': 1}));
  L.forEach(([, c], k) => { const hgt = Math.max(1, Math.abs(c) / max * (mid - 2)); svg.append(sv('rect', {x: (k * bw).toFixed(2), y: (c >= 0 ? mid - hgt : mid).toFixed(1), width: Math.max(0.6, bw - 0.2).toFixed(2), height: hgt.toFixed(1), fill: c > 0 ? T.up : c < 0 ? T.down : T.mute})); });
  add(v, h('p', {class: 'lead'}, h('b', {class: 'up', text: S.up + '곳 오름'}), ' · ', h('b', {class: 'down', text: S.down + '곳 내림'}), S.flat ? ` · ${S.flat}곳 그대로` : ''), h('div', {class: 'mstrip'}, svg),
    h('div', {class: 'ax'}, h('span', {text: '많이 오름'}), h('span', {text: '많이 내림'})),
    S.top ? h('p', {class: 'mtop'}, `▲ ${S.top.n} `, pctEl(S.top.chg, 'span'), ` · ▼ ${S.bot.n} `, pctEl(S.bot.chg, 'span')) : null);
}
function hub(v, H) {
  const N = SLIDES.length, box = h('section', {class: 'hub', 'aria-roledescription': '슬라이드 묶음', 'aria-label': '오늘 시장 — 슬라이드 7장'});
  const vp = h('div', {class: 'hvp'}), rail = h('div', {class: 'hrail'}), bar = h('div', {class: 'hbar', role: 'tablist', 'aria-label': '슬라이드 7장 — 눌러서 가기'});
  const nowT = h('span', {class: 'hn', 'aria-live': 'off'}), play = h('button', {type: 'button', class: 'hplay'});
  const prev = h('button', {type: 'button', class: 'hstep', 'aria-label': '앞 장', text: '‹'}), next = h('button', {type: 'button', class: 'hstep', 'aria-label': '다음 장', text: '›'}); // 엄지 줄(삼성 One UI — 누르는 것은 아래 · 앞 · 다음 · 멈춤)
  const now = h('p', {class: 'hnow'}, prev, nowT, next, RM.matches ? null : play);
  const close = h('button', {type: 'button', class: 'hclose', text: '접기 ×'}), detT = h('b'), det = h('div', {class: 'hdet', hidden: true}, h('p', {class: 'hdh'}, detT, close));
  const MINI = {today: (p, x) => homeHead(p, x, go), idx: miniIdx, sec: miniSec, flow: miniFlow, us: miniUS, s365: mini365};
  const FULL = {today: homeToday, idx: homeIndex, sec: homeSectors, flow: homeFlows, us: homeUS, s365: home365}; // 2장 「자세히」(2026-10-13 00:18 핵심 위주 — 코스닥 눈금 · 시장 넓이 · 「!」 글)
  const slides = [], tabs = [], dets = [];
  let cur = 0, timer = 0, settleT = 0, inView = true, swiped = 0;
  st(box, {}).style.setProperty('--dwell', DWELL + 'ms');
  const running = () => box.isConnected && !state.hubStop && !RM.matches && !document.hidden && inView && !state.hubDet;
  function fill(run) { tabs.forEach((t, j) => { t.classList.toggle('done', j < cur || (j === cur && !run)); t.classList.remove('on'); }); if (run) { void tabs[cur].offsetWidth; tabs[cur].classList.add('on'); } }
  function schedule() {
    clearTimeout(timer); const run = running();
    box.classList.toggle('run', run); fill(run);
    play.textContent = state.hubStop ? '▶ 넘기기' : '‖ 멈춤'; play.setAttribute('aria-label', state.hubStop ? '저절로 넘기기 다시' : '저절로 넘기기 멈춤');
    if (run) timer = setTimeout(() => { if (box.isConnected) go(cur + 1, 'auto'); }, DWELL);
  }
  function stop() { if (!state.hubStop) { state.hubStop = true; schedule(); } }
  function settle() { slides.forEach((s, j) => { const off = j !== cur; s.classList.toggle('off', off); if (off) s.setAttribute('aria-hidden', 'true'); else s.removeAttribute('aria-hidden'); s.inert = off; }); }
  function showDet() { const d = dets[cur]; det.hidden = !state.hubDet || !d; dets.forEach(x => { if (x) x.hidden = x !== d; }); detT.textContent = `자세히 — ${SLIDES[cur][1]}`; }
  function go(k, how) {
    k = ((k % N) + N) % N; cur = k; state.hub = k;
    slides[k].classList.remove('off'); slides[k].removeAttribute('aria-hidden'); slides[k].inert = false;
    rail.style.transform = `translateX(${-100 * k}%)`;
    tabs.forEach((t, j) => { t.setAttribute('aria-selected', String(j === k)); t.tabIndex = j === k ? 0 : -1; });
    nowT.replaceChildren(h('b', {text: `${k + 1} / ${N}`}), ` · ${SLIDES[k][1]}`);
    for (const d of dets) { d?.querySelector('.pick')?.replaceChildren(); d?.querySelector('rect.cur')?.setAttribute('fill-opacity', 0); } // 장을 바꾸면 그림에서 고른 회사 이름은 지움
    showDet();
    if (how === 'key') tabs[k].focus();
    clearTimeout(settleT); settleT = setTimeout(settle, RM.matches || !how ? 0 : 480); // 넘어가는 동안만 두 장이 보임
    schedule();
  }
  function openDet(k) { state.hubDet = true; state.hubStop = true; if (k !== cur) go(k, 'tab'); else { showDet(); schedule(); }
    const top = document.querySelector('.band')?.getBoundingClientRect().bottom ?? 0, y = det.getBoundingClientRect().top; if (y > innerHeight - 80) window.scrollTo({top: scrollY + y - top - 8, behavior: RM.matches ? 'auto' : 'smooth'}); }
  close.addEventListener('click', () => { state.hubDet = false; showDet(); const top = document.querySelector('.band')?.getBoundingClientRect().bottom ?? 0, y = box.getBoundingClientRect().top; if (y < top) window.scrollTo({top: scrollY + y - top - 8, behavior: RM.matches ? 'auto' : 'smooth'}); });
  SLIDES.forEach(([id, name], k) => {
    const mark = MINI[id] && FULL[id] ? hubMark(H, id) : '', say = (mark.includes('!') ? ' — 조심할 값 있음' : '') + (mark.includes('?') ? ' — 모르는 값 있음' : '');
    const tab = h('button', {type: 'button', role: 'tab', id: 'ht-' + id, 'aria-controls': 'hs-' + id, 'aria-selected': 'false', tabindex: '-1', 'aria-label': `${k + 1}장 ${name}${say}`}, h('b', {class: 'hm', 'aria-hidden': 'true', text: mark}), h('i', {class: 'hl', 'aria-hidden': 'true'}, h('i', {class: 'hf'})));
    tab.addEventListener('click', () => go(k, 'tab'));
    const sl = h('div', {class: 'hs' + (id === 'hello' ? ' hs0' : ''), role: 'tabpanel', id: 'hs-' + id, 'aria-roledescription': '슬라이드', 'aria-label': `7장 가운데 ${k + 1}장 — ${name}`});
    if (id === 'hello') sl.append(slideHello()); else MINI[id](sl, H);
    if (FULL[id]) { const more = h('button', {type: 'button', class: 'hmore', text: '자세히 ›'}); more.addEventListener('click', () => openDet(k)); sl.append(more);
      const d = h('div', {class: 'hd', id: 'hd-' + id, hidden: true}); FULL[id](d, H); dets[k] = d; det.append(d); }
    slides.push(sl); tabs.push(tab); rail.append(sl); bar.append(tab);
  });
  play.addEventListener('click', () => { state.hubStop = !state.hubStop; if (!state.hubStop) state.hubDet = false; showDet(); schedule(); });
  prev.addEventListener('click', () => { state.hubStop = true; go(cur - 1, 'tab'); }); next.addEventListener('click', () => { state.hubStop = true; go(cur + 1, 'tab'); });
  bar.addEventListener('keydown', e => { const k = {ArrowRight: cur + 1, ArrowLeft: cur - 1, Home: 0, End: N - 1}[e.key]; if (k == null) return; e.preventDefault(); go(k, 'key'); });
  // 손대면 멈춤 — 누름(손가락 · 마우스) · 키 · 키보드 초점(「‖ 멈춤」 단추는 빼고 — 그 단추가 켜고 끔)
  box.addEventListener('pointerdown', e => { if (!e.target.closest('.hplay')) stop(); });
  box.addEventListener('keydown', e => { if (!e.target.closest('.hplay')) stop(); });
  box.addEventListener('focusin', e => { if (e.target.matches?.(':focus-visible') && !e.target.closest('.hplay')) stop(); });
  // 옆으로 밀기 — 손가락 하나 · 화면 가장자리 24px 밖에서 시작 · 가로 50px 넘게 · 세로의 2배 넘게 · 끝 장에서는 제자리 · 민 뒤 0.4초 누름은 버림(소개 고리가 잘못 열리지 않게)
  let sx = null, sy = 0;
  vp.addEventListener('touchstart', e => { const t = e.touches[0]; sx = e.touches.length === 1 && t.clientX > 24 && t.clientX < innerWidth - 24 ? t.clientX : null; sy = t.clientY; }, {passive: true});
  vp.addEventListener('touchcancel', () => { sx = null; }, {passive: true});
  vp.addEventListener('touchend', e => { if (sx == null) return; const t = e.changedTouches[0], dx = t.clientX - sx, dy = t.clientY - sy; sx = null;
    if (Math.abs(dx) > 50 && Math.abs(dx) > 2 * Math.abs(dy)) { const k = cur + (dx < 0 ? 1 : -1); if (k >= 0 && k < N) { swiped = Date.now(); go(k, 'swipe'); } } }, {passive: true});
  vp.addEventListener('click', e => { if (Date.now() - swiped < 400) { e.preventDefault(); e.stopPropagation(); } }, true);
  // 화면 밖 · 다른 창이면 쉼
  if ('IntersectionObserver' in window) new IntersectionObserver(es => { for (const x of es) inView = x.isIntersecting; schedule(); }, {threshold: 0.5}).observe(vp);
  document.addEventListener('visibilitychange', () => { if (box.isConnected) schedule(); });
  vp.append(rail); box.append(vp, bar, now, det); v.append(box);
  go(Math.min(N - 1, Math.max(0, state.hub ?? 0)));
  hubGo = k => { state.hubStop = false; state.hubDet = false; go(k); };
}
async function viewHome(v) {
  await needHome();
  const C = D.core, F = C.facts, H = D.home, ALLN = !!C.mkt; // 경주판 위 단 평균 = 모든 회사(2026-10-14 「나」 · 옛 자료면 고른 곳)
  const whoS = ALLN ? '모든 회사' : `${NP()}곳`;
  // 요즘 오르는 업종(사장님 2026-10-14(싱가포르) 19:54 「이 곳은 상승 추세에 업종이 있게해 11개 업종 알겠지」 · 19:58 「아니 요즘 오르는중은 업종」 · 20:01 「1주일로 해」 · 규칙 64)
  //   = 맨 위 슬라이드 밑 경주판 — 큰 갈래 10줄 자리에 지난 1주 오른 업종(많이 오른 순 11개까지 · core.rise) · 큰 갈래는 경주판 밑 한 줄 고리(7단 중 1단 · 1번이면 닿음 그대로)
  //   15:03 「한눈에 … 업종이 오르는 것만 이곳에 올려」도 이것 · 이름은 사장님 말 「요즘 오르는」 · 「매수」 말은 쓰지 않음(사고팔기를 권하지 않음)
  const RI = C.rise, k0 = C.dates.length - 1 - RI.days, L = RI.list, G1 = C.groups.slice().sort((a, b) => b.chg - a.chg)[0];
  const tell = tellRow(`${md(RI.from)} → ${md(RI.to)}`, L.length ? () => rc.play() : null);
  const head = h('h2', {class: 'sec rt', text: '요즘 오르는 업종 — 지난 1주'});
  const count = h('p', {class: 'count'}, `업종 ${RI.of}개 중 지난 1주 `, h('b', {class: 'up', text: `${RI.n}개 오름`}), RI.n > RI.max ? ` · 많이 오른 순 ${RI.max}개` : '');
  const alt = h('div', {class: 'alt'}, `다르게 보면: 업종 ${RI.of - RI.n}개는 지난 1주 오르지 않았습니다 · 지난 ${C.days}거래일로 세면 1등 갈래는 ${G1.short} `, pctEl(G1.chg), '.');
  const glinks = h('p', {class: 'glinks'}, h('span', {class: 'gl-t', text: `큰 갈래 ${C.groups.length}개(7단 중 1단):`}), ...C.groups.map(g => h('a', {href: '#/g/' + g.id, text: g.short})));
  const host = h('div');
  const hello = h('a', {class: 'hello', href: '/hello.html'}, h('img', {src: '/media/makbi-icon.svg', alt: '', width: 44, height: 44, decoding: 'async'}) /* 띠 그림 = 둥근 막비 얼굴(코드 그림 · 3.6KB) */, h('span', {class: 'hw'}, h('b', {text: '친구에게 소개하기'}), h('span', {text: '막비 24초 영상 · 보내기'})),
    h('span', {class: 'hello-mo', 'aria-hidden': 'true'}, MO.rainbow(46), MO.heart(16)), h('span', {class: 'chev', 'aria-hidden': 'true', text: '›'})); // 영상 친구들(16:29) — 무지개 · 하트
  // 맨 위 = 슬라이드 7장(1장 「친구에게 소개하기」 · 사장님 19:59 · 20:11) → 그 아래 요즘 오르는 업종(2026-10-14 20:01 「1주일로 해」) · 자료를 못 읽으면 옛 소개 띠 + 「?」
  if (H) hub(v, H); else add(v, hello, h('h1', {class: 'head', text: '오늘 시장 — ?'}), h('p', {class: 'q', text: '? 오늘 시장 자료를 못 읽었습니다 — 아래 요즘 오르는 업종은 그대로입니다.'}));
  add(v, tell.el, head, count, h('p', {class: 'say pk'}, h('b', {text: pickName(C)}), ' — ' + pickLine(C)),
    ALLN ? h('p', {class: 'note gold-say', text: `금빛 = ${pickName(C)}이 든 곳 · 큰 갈래 ${C.groups.length}개 · 업종 ${C.industries.length}개`}) : null, host); // add = 없는 조각(null)은 건너뜀
  const items = L.map(r => { const i = ind(r.name); return {key: r.name, name: r.name, href: i ? hrefInd(i) : '#/list', v: r.v, gold: ALLN && i?.pk ? `고른 ${i.pk}곳` : null}; });
  const autoplay = L.length && !state.played && !RM.matches; state.played = true; // 경주는 화면에 들어올 때 한 번 저절로(애플팀 — 위에 일곱 장이 있어 처음엔 화면 밖에서 돌다 끝나던 것)
  const rc = L.length ? race(host, {items, parent: {v: RI.all, cw: RI.all}, n: RI.days + 1, label: `요즘 오르는 업종 — 지난 1주(${md(RI.from)} → ${md(RI.to)}) 많이 오른 순: ` + L.map(r => r.name + ' ' + pct(r.chg)).join(', '),
    onTick: k => tell.t.replaceChildren(h('b', {text: md(C.dates[k0 + k])})), onDone: () => { tell.t.textContent = `${md(RI.from)} → ${md(RI.to)}`; }}) : null;
  if (!L.length) host.append(h('p', {class: 'q', text: `? 지난 1주 오른 업종이 없습니다 — 업종 ${RI.of}개 모두 내리거나 그대로였습니다.`}));
  if (autoplay && 'IntersectionObserver' in window) { const io = new IntersectionObserver(es => { if (es.some(x => x.isIntersecting)) { io.disconnect(); if (host.isConnected) rc.play(); } }, {threshold: 0.35}); io.observe(host); }
  v.append(legend(whoS, ALLN && L.some(r => ind(r.name)?.pk) ? '금빛 = 고른 곳' : null, `1주 전(${md(RI.from)}) 값`), glinks, h('p', {class: 'note', text: `오른 업종 = 지난 1주 「한 회사 한 표」 업종 지수가 오른 곳(화면 숫자 +0.1% 이상) · 많이 오른 순 ${RI.max}개까지(적은 날은 있는 만큼) · 업데이트마다 다시 셉니다.`}), alt);
  const share = Math.round(F.dd50 / F.n1y * 10);
  v.append(h('p', {class: 'note', text: `${ALLN ? '고른 ' + NP(C) + '곳' : '이 ' + NP(C) + '곳'}도 10곳 중 ${share}곳은 지난 1년 사이 꼭대기의 반값 아래로 떨어진 적이 있습니다 — 반값을 견딜 수 있나요? (${F.n1y}곳 가운데 ${F.dd50}곳 · ${md(C.asOf)}까지 1년 종가)`}));
  const T = C.time; // 시간 노선도는 한 줄 고리로(애플 · 구글 · 클로드 팀 — 첫 화면이 길어져서) · 봉인 화면은 그대로
  if (T) v.append(h('p', {class: 'links2'}, h('a', {href: '#/time'}, `봉인 ${T.id}호 — 3 · 5 · 10년 뒤 다시 엶 · 3년 뒤까지 `, h('b', {class: 'num', text: ddayText(T.opens[0].date)}), ' ›')));
  v.append(h('p', {class: 'note', text: `줄을 누르면 업종 → 회사로 내려갑니다 · 큰 갈래는 경주판 밑 「큰 갈래」 줄에서 엽니다. 모든 회사가 7단까지 — 지나온 길 → 누구와 다투나 → 앞으로 클까? → 범위 · 확인. ${pickHow(C)} — 이 선은 지난 값이고 앞날 값이 아닙니다.`}));
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
    if (m === 'eq') { count.replaceChildren(`${g.n.toLocaleString('ko-KR')}곳 중 `, h('b', {class: 'up', text: g.up.toLocaleString('ko-KR') + '곳 오름'}), ' · ', h('b', {class: 'down', text: g.down.toLocaleString('ko-KR') + '곳 내림'}), g.pk ? ` · 고른 곳 ${g.pk}곳` : ''); alt.replaceChildren('다르게 보면: 큰 회사는 크게 치면 ', pctEl(g.cwChg), '.'); }
    else { count.replaceChildren('몸값으로 세면 ', pctEl(g.cwChg), ` · 한 회사 한 표로는 `, pctEl(g.chg)); alt.replaceChildren('한 회사 한 표로 세면 ', pctEl(g.chg), ` · ${g.up}곳 오름 · ${g.down}곳 내림.`); }
  }
  words(state.mode);
  const host = h('div');
  v.append(crumbs({href: '#/', text: '한눈에'}, {text: g.short}), steps(1), tell.el, head, gtr, h('p', {class: 'say', text: `${inds.slice().sort((a, b) => b.n - a.n).slice(0, 3).map(x => x.name).join(' · ')}${inds.length > 3 ? ' 등' : ''} · 업종 ${inds.length}개`}), count, host); // 설명은 지금 업종에서(CIA팀 2026-10-12: 옛 365곳 설명이 남아 있던 것)
  const items = inds.map(i => ({key: i.name, name: i.name, href: hrefInd(i), v: i.v, cw: i.cw, badge: i.n === 1 ? '1곳' : null, tr: i.tr, trc: i.trc, gold: i.pk ? `고른 ${i.pk}곳` : null, pk: i.pk > 0}));
  const rc = race(host, {items, parent: g, wide: true, label: `${g.name} 업종 ${inds.length}개 — ${C.days}거래일 많이 오른 순: ` + inds.map(i => i.name + ' ' + pct(i.chg)).join(', '),
    onTick: k => tell.t.replaceChildren(h('b', {text: md(C.dates[k])})), onDone: () => { tell.t.textContent = `${md(C.base)} → ${md(C.asOf)}`; }});
  v.append(legend(g.short, g.pk ? '금빛 = 고른 곳' : null), seg(m => { words(m); rc.setMode(m); }), alt);
  const low = g.low;
  v.append(h('p', {class: 'note', text: `${md(C.dates[low.k])}(이 갈래가 가장 낮던 날)에는 ${g.n}곳 중 ${low.below}곳이 ${md(C.base)}보다 아래였습니다 — 한 갈래는 함께 움직이기 쉽습니다.`}));
  if (inds.some(i => i.n === 1)) v.append(h('p', {class: 'note', text: '「1곳」 = 회사가 하나뿐인 업종 — 업종 평균이 아니라 그 회사 하나의 값입니다.'}));
  v.append(foot());
}

// ── 화면 ③ 업종 ──
async function viewIndustry(v, name) {
  const C = D.core, i = ind(name);
  if (!i) return viewMissing(v);
  if (i.n === 1) { location.replace(hrefInd(i)); return; }
  if (C.mkt) await needMkt(); else await needComp(); // 모든 회사 자료(2026-10-14 「나」) · 옛 자료면 고른 곳
  const row = c => (C.mkt ? D.mkt[c] : {n: D.comp[c].name, c: D.comp[c].chg, l: D.lines[c], p: 1});
  const g = gById(i.g);
  const itr = h('p', {class: 'trh'});
  const tell = tellRow(`${md(C.base)} → ${md(C.asOf)}`, () => rc.play());
  const head = h('h1', {class: 'head'}), count = h('p', {class: 'count'}), alt = h('div', {class: 'alt'});
  function words(m) {
    head.replaceChildren(`${i.name} ${C.days}거래일 `, pctEl(chgOf(i, m), 'span')); trFill(itr, m === 'cw' ? i.trc : i.tr);
    if (m === 'eq') { count.replaceChildren(`${i.n}곳 중 `, h('b', {class: 'up', text: i.up + '곳 오름'}), ' · ', h('b', {class: 'down', text: i.down + '곳 내림'}), C.mkt && i.pk ? ` · 금빛 = 고른 곳 ${i.pk}곳` : ''); alt.replaceChildren('다르게 보면: 큰 회사는 크게 치면 ', pctEl(i.cwChg), '.'); }
    else { count.replaceChildren('몸값으로 세면 ', pctEl(i.cwChg), ' · 한 회사 한 표로는 ', pctEl(i.chg)); alt.replaceChildren('한 회사 한 표로 세면 ', pctEl(i.chg), ` · ${i.up}곳 오름 · ${i.down}곳 내림.`); }
  }
  words(state.mode);
  const host = h('div');
  v.append(crumbs({href: '#/', text: '한눈에'}, {href: '#/g/' + g.id, text: g.short}, {text: i.name}), steps(2, ['#/g/' + g.id]), tell.el, head, itr, count, host);
  // 회사 줄 — 고른 곳(금빛)은 3단 회사 화면 · 나머지는 모든 회사 7단(core.co7)이면 3단 회사 · 옛 자료면 「밖」 칸(이름 · 까닭 · 깔때기) · 하루 30% 넘게 바뀐 날이 있으면 「?」
  //   기준일 종가가 없어 선을 못 그린 회사(새로 상장 · 그날 거래 멈춤 등)는 줄 대신 아래 「?」 한 줄에 이름 고리로(규칙 56 줄마다 선 · 「3번이면 회사」 그대로)
  const href = c => cHref(c, row(c).p), noLine = c => !row(c).l.some(x => x != null);
  const shown = i.members.filter(c => !noLine(c)), none = i.members.filter(noLine);
  const items = shown.map(c => { const m = row(c); return {key: c, name: m.n, href: href(c), v: m.l.map(x => (x == null ? null : x / 100)), cw: null, gold: C.mkt && m.p ? '고른 곳' : null, pk: !!(C.mkt && m.p), badge: m.j ? '?' : null}; });
  const rc = race(host, {items, parent: i, wide: true, label: `${i.name} 회사 ${shown.length}곳 — ${C.days}거래일 많이 오른 순: ` + shown.map(c => row(c).n + ' ' + pct(row(c).c)).join(', '),
    onTick: k => tell.t.replaceChildren(h('b', {text: md(C.dates[k])})), onDone: () => { tell.t.textContent = `${md(C.base)} → ${md(C.asOf)}`; }});
  v.append(legend(i.name, C.mkt && i.pk ? '금빛 = 고른 곳' : null), seg(m => { words(m); rc.setMode(m); }), alt);
  if (items.some(x => x.badge === '?')) v.append(h('p', {class: 'note'}, h('span', {class: 'q', text: '? '}), '= 하루에 30% 넘게 바뀐 날이 있는 회사 — 주식 수가 바뀌었을 수 있습니다(확인 못 함).'));
  if (none.length) v.append(h('p', {class: 'note noline'}, h('span', {class: 'q', text: '? '}), `기준일(${md(C.base)}) 종가가 없어 선을 못 그린 회사 ${none.length}곳 — `, ...none.flatMap((c, k) => [k ? ' · ' : '', h('a', {class: 'inl', href: href(c), text: row(c).n})])));
  if (C.mkt) v.append(h('p', {class: 'note', text: `금빛이 아닌 회사는 ${pickName(C)} 밖입니다 — ${C.co7 ? '눌러도 7단까지 볼 수 있고, 3단에 왜 밖인지 나옵니다' : '누르면 이름 · 까닭이 나옵니다'}.`}));
  v.append(h('p', {class: 'note', text: '회사 줄은 그 회사 주가 그대로라 두 보기에서 같습니다 — 바뀌는 것은 점선(업종 평균)과 맨 위 숫자입니다.'}));
  v.append(foot());
}

// ── 화면 ④ 회사 ──
async function viewCompany(v, code) {
  const E = await coEntry(code);
  if (!E) return viewMissing(v, code);
  const C = D.core, c = E.c;
  const i = ind(c.i), g = gById(c.g), line = E.line.map(x => (x == null ? null : x / 100));
  v.append(crumbs({href: '#/', text: '한눈에'}, {href: '#/g/' + g.id, text: g.short}, i.n > 1 ? {href: hrefInd(i), text: i.name} : {text: i.name + '(1곳)'}));
  v.append(stepsCo(3, code, g, i));
  v.append(h('div', {class: 'co-head'}, h('h1', {text: c.name}), h('small', {text: `${c.market === 'KOSPI' ? '코스피' : '코스닥'} · ${code} · 1주 ${won(c.price)}`})));
  if (!E.pk) v.append(h('p', {class: 'chipline'}, h('span', {class: 'chip', text: `${pickName(C)} 밖`}), ' 이 회사도 7단까지 볼 수 있습니다'));
  // 그림을 맨 위로(애플팀 2026-10-12 — 첫 화면에 그림이 없던 것) → 세 숫자 → 100만 원 줄 → 다음 단 → 왜 들었나
  const chartHost = h('div');
  v.append(chartHost);
  const trio = h('div', {class: 'trio'},
    h('div', {}, h('span', {text: `${C.days}거래일`}), pctEl(c.chg)),
    h('div', {}, h('span', {text: '1년'}), pctEl(c.r1y)),
    h('div', {}, h('span', {text: `가장 깊이 빠짐(${C.days}거래일)`}), pctEl(c.mdd))); // 칸 이름에 기간(클로드팀: 옆 「1년」 값처럼 읽히던 것)
  const draw = () => { lineChart(chartHost, {v: line, avg: i.n > 1 ? i.v : null, noPick: !E.pk, label: `${c.name} ${C.days}거래일 선 — 기준일 ${md(C.base)} = 100에서 ${pct(c.chg)} · 가장 깊이 빠짐 ${pct(c.mdd)}`}); fitNums(trio); };
  draw(); chartDraw = draw;
  v.append(h('p', {class: 'lkey'}, h('span', {}, h('i', {class: 'l-co'}), `${c.name} — ${md(C.base)}보다 위 빨강 · 아래 파랑`), i.n > 1 ? h('span', {}, h('i', {class: 'l-avg'}), i.name + ' 평균') : null, C.kPick != null && E.pk ? h('span', {}, h('i', {class: 'l-pick'}), `고른 날 ${md(C.pickAsOf)}`) : null));
  v.append(trio); fitNums(trio);
  // 100만 원 줄 — 4단과 같은 뜻(산 날 = 기준일)으로 셈(클로드팀: 꼭대기 기준이라 4단과 달랐던 것)
  const lv = line.filter(x => x != null), low = lv.length ? Math.min(...lv) : null, last = lv.length ? lv.at(-1) : null, man = x => Math.round(x).toLocaleString('ko-KR') + '만 원'; // 선 = 기준일 100
  v.append(h('p', {class: 'won', text: low == null ? '? 값을 못 읽었습니다' : low < 100 ? `${md(C.base)}에 100만 원어치였다면 가장 낮을 때 ${man(low)} · 끝 ${man(last)}` : `${md(C.base)}에 100만 원어치였다면 그보다 낮아진 적 없이 끝 ${man(last)}`}));
  v.append(h('p', {class: 'src', text: `네이버 증권 · ${md(c.priceDate || C.asOf)} 종가 · ATLAS 셈`}));
  // 봉인 줄은 7단 「범위 · 확인」으로 옮김(네 팀 — 회사 첫 화면에 결론처럼 먼저 보이지 않게)
  v.append(nextStep(`#/c/${code}/past`, '4단 지나온 길', '1년 · 3년 주가 · 해마다 번 돈 · 몸값'));
  // 왜 멍거 · 린치 조건에 들었나(ml-v1) — 넘은 갈래마다 값 · 앞날 숫자 · 차례는 쓰지 않음 · 고른 곳 밖이면 왜 밖인가(이름표 까닭 · 깔때기)
  v.append(E.pk ? whyBox(c) : outBox(code));
  v.append(foot());
}
/** 고른 곳 밖 회사 — 왜 밖인가요?(이름표 까닭 · 깔때기 · 옛 밖 칸 #/x/ 과 같은 글) */
function outBox(code) {
  const C = D.core, box = h('div', {class: 'box'}, h('h2', {text: `왜 ${pickName(C)} 밖인가요?`}));
  const fill = () => { const r = D.names?.rows.find(x => x.c === code); box.querySelector('.q')?.remove();
    if (!r) { box.append(h('p', {class: 'q', text: '? 까닭을 못 읽었습니다'})); return; }
    box.append(h('p', {text: `${josa(r.n, '은', '는')} ${stopSay(r)}.`}), h('div', {class: 'why', text: r.w}), funnel(r), h('p', {class: 'small', text: `${pickHow(C)} — 새 1년 성적표가 나오면 다시 셉니다.`})); };
  box.append(h('p', {class: 'q', text: '까닭을 받는 중…'}));
  needNames().then(fill).catch(() => { box.querySelector('.q')?.remove(); box.append(h('p', {class: 'q', text: '? 까닭을 못 읽었습니다'})); });
  return box;
}
// 4 ~ 7단 공통 — 단마다 가는 길(지나온 단 · 바로 다음 단만 누름) · 위치 줄은 회사까지만(길어지지 않게 · 지금 단은 단 표시가 보임)
const ALLH = (code, g, i) => ['#/g/' + g.id, i.n > 1 ? hrefInd(i) : null, '#/c/' + code, `#/c/${code}/past`, `#/c/${code}/rivals`, `#/c/${code}/grow`, `#/c/${code}/range`];
function stepsCo(now, code, g, i) { return steps(now, ALLH(code, g, i).map((x, k) => (k < now - 1 || k === now ? x : null))); }
const coCrumbs = (c, g, i, code) => crumbs({href: '#/', text: '한눈에'}, {href: '#/g/' + g.id, text: g.short}, i.n > 1 ? {href: hrefInd(i), text: i.name} : {text: i.name + '(1곳)'}, {href: '#/c/' + code, text: c.name});
// 왜 멍거 · 린치 조건에 들었나(사장님 2026-10-14 06:05 「가」 · ml-v1 — 멍거 갈래는 2026-10-14 00:03 「가 로 하자」 그대로)
//   넘은 갈래마다 값: 멍거 = 세 조건 해마다(① 남긴 돈 · ② 자기 돈 100원에 빚 · ③ 자기 돈 100원으로 번 돈) ·
//   린치 = ① 한 주가 번 돈 처음 해 · 끝 해 · 해마다 큰 % ② (해마다 큰 % + 배당 %) ÷ 1년 이익의 몇 배 값 = 점수(2 넘음) · 모음 날 값
//   두 사람 말 · 값 · 숫자로 못 세는 조건 · 한계는 접은 칸 · 확정 결산만 · 앞날 숫자 없음 · 차례(n번째)는 싣지 않음(규칙 55) · 숫자는 먹색(규칙 53)
function whyBox(c) {
  const C = D.core, p = c.pick, R = C.rules;
  const box = h('div', {class: 'box'}, h('h2', {text: `왜 ${pickName(C)}에 들었나요?`}));
  if (!p?.tags?.length || !R?.groups || (!p.mg && !p.ly)) { box.append(h('p', {class: 'q', text: '? 든 까닭을 못 읽었습니다'})); return box; }
  const row = (t, xs) => h('li', {}, h('b', {text: t}), ...xs.flatMap((x, k) => [k ? ' · ' : '', h('span', {class: 'num', text: x})])); // 한 칸씩(줄이 길면 칸 사이에서 꺾임 — 360px 옆 넘침 막음)
  const won = x => `${Math.round(x).toLocaleString('ko-KR')}원`;
  if (p.mg) { const m = p.mg, Y = m.years.map(y => String(y).slice(0, 4) + '년');
    box.append(h('p', {}, h('b', {text: '멍거 조건 — 세 조건을 모두 넘었습니다'})), h('ul', {class: 'tm why3'},
      row('① 해마다 남긴 돈 — ', m.net.map((x, k) => `${Y[k]} ${eok(x)}`)),
      row('② 자기 돈 100원에 빚 — ', m.debt.map((x, k) => `${Y[k]} ${Math.round(x)}원`)),
      row('③ 자기 돈 100원으로 번 돈 — ', m.roe.map((x, k) => `${Y[k]} ${r1(x).toFixed(1)}원`)))); }
  if (p.ly) { const l = p.ly;
    box.append(h('p', {}, h('b', {text: '린치 조건 — 두 조건을 모두 넘었습니다'})), h('ul', {class: 'tm why3'},
      row('① 한 주가 번 돈 — ', [`${l.years[0]}년 ${won(l.eps[0])}`, `${l.years[1]}년 ${won(l.eps[1])}`, `해마다 ${r1(l.g).toFixed(1)}% 큼`]),
      row('② 크는 빠르기에 견줘 값 — ', [`배당 ${r1(l.yld).toFixed(1)}%`, `이익의 ${r1(l.per).toFixed(1)}배 값`, `점수 ${l.score.toFixed(2)}`, '2 넘음', `${md(l.pxDay)} 값`])),
      h('p', {class: 'small', text: '점수 = (한 주 이익이 해마다 큰 % + 배당 %) ÷ 1년 이익의 몇 배 값 — 린치는 2 넘는 것을 찾았습니다.'})); }
  box.append(h('details', {class: 'more'}, h('summary', {text: '두 사람의 말 · 값 · 한계 — 눌러서 보기'}), h('div', {class: 'in'}, h('ul', {class: 'tm'},
    ...R.groups.filter(g => p.tags.includes(g.k)).flatMap(g => [...g.conds.map(x => h('li', {text: `${x.t} — 「${x.q}」 · ${x.who}`})), h('li', {text: g.price}), h('li', {text: g.notCounted}), h('li', {text: g.limits})]),
    h('li', {text: `네이버 업종 「${p.sector}」 · ${C.sources.pick}`})))));
  box.append(h('p', {class: 'small', text: `${R.notMunger} 좋은 회사 순서가 아닙니다.`}));
  return box;
}
function nextStep(href, title, sub) { return h('a', {class: 'nextst', href}, h('span', {}, h('b', {text: title}), h('span', {text: sub})), h('span', {class: 'chev', 'aria-hidden': 'true', text: '›'})); }

// ── 4단 지나온 길 — 1주 값 20거래일 · 1년 · 3년(365곳 평균 점선) · 해마다 번 돈 · 몸값 ──
const PERIODS = [['20d', '20거래일', 21], ['1y', '1년', 253], ['3y', '3년', 757]];
async function viewPast(v, code) {
  const E = await coEntry(code);
  if (!E) return viewMissing(v, code);
  const C = D.core, c = E.c;
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
    key.replaceChildren(h('span', {}, h('i', {class: 'l-co'}), `${c.name} — ${ymd(dates[0])}보다 위 빨강 · 아래 파랑`), h('span', {}, h('i', {class: 'l-avg'}), `${NP()}곳 평균(같은 날 같은 값에서 출발)`));
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
    h('li', {}, h('span', {class: 'm ' + (co.per != null ? 'ok' : 'q'), text: co.per != null ? '·' : '?'}), h('span', {}, h('b', {text: '1년 순이익의 '}), co.per != null ? `${r1(co.per).toFixed(1)}배(${NP()}곳 가운데값 ${r1(C.facts.perMedian).toFixed(1)}배)` : '? 자료 없음')),
    h('li', {}, h('span', {class: 'm ' + (co.pbr != null ? 'ok' : 'q'), text: co.pbr != null ? '·' : '?'}), h('span', {}, h('b', {text: '장부 값의 '}), co.pbr != null ? `${r1(co.pbr).toFixed(1)}배` : '? 자료 없음')),
    ly >= 0 ? h('li', {}, h('span', {class: 'm ok', text: '·'}), h('span', {}, h('b', {text: `${fy(f.years[ly])} 빚 · 이익률 `}), `부채비율 ${f.debt?.[ly] != null ? r1(f.debt[ly]).toFixed(1) + '%' : '?'} · 자기자본 이익률 ${f.roe?.[ly] != null ? r1(f.roe[ly]).toFixed(1) + '%' : '?'}`)) : null))));
  v.append(h('p', {class: 'src', text: '네이버 증권 · 결산 · 10월 10일 모음'}));
  const G = co.grow, S5 = G?.story; // 다음 단 미리 보기는 판정 말 없이 사실만(클로드팀 · CIA팀 — 반대 근거보다 좋은 말이 먼저 보이지 않게)
  const nx = () => nextStep(`#/c/${code}/rivals`, '5단 누구와 다투나', G ? [S5?.shape, S5 ? `경쟁 회사 ${(S5.rivals || []).length}곳` : (E.pk ? '세 팀 이야기 없음' : '이야기 조사 전'), `업종 안 매출 ${G.ind.rank ?? '?'}번째`].filter(Boolean).join(' · ') : '경쟁 회사 · 업종 안 크기');
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
//    끝은 「사기」가 아니라 「확인」(클로드팀 · CIA팀) — 「모형 가정 아래 추정 · 검증 전」을 맨 위에 · 모형 막대는 오름 · 내림 색을 쓰지 않음(규칙 53) · 고른 목록 · 차례 없음(2026-10-13 06:45 지움)
const nextSlot = slots => { const k = new Date(Date.now() + 9 * 36e5), m = k.getUTCHours() * 60 + k.getUTCMinutes(), mm = x => +x.slice(0, 2) * 60 + +x.slice(3, 5), nx = slots.find(x => mm(x) > m); return nx ? nx : slots[0] + ' · 내일'; };
async function viewRange(v, code) {
  const [E] = await Promise.all([coEntry(code), needRange()]);
  if (!E) return viewMissing(v, code);
  const C = D.core, c = E.c;
  const [co] = await Promise.all([needCo(code).catch(() => null), needDays().catch(() => null)]); // 하루 30% 넘게 바뀐 날(1년 줄 「?」 — 클로드팀) · 1년 창은 거래일 표로
  const i = ind(c.i), g = gById(c.g), K = D.range, k = E.pk ? K.companies[code] : K.others?.[code], S = K.spec; // 고른 곳 밖 = others(같은 방향 날 · 경로는 따로)
  v.append(stepsCo(7, code, g, i));
  v.append(h('div', {class: 'co-head'}, h('h1', {text: c.name + ' — 범위 · 확인'}), h('small', {text: `여기부터 다시 주가 · ${md(K.asOf)} 종가 · ${S.horizon}거래일(약 한 달) 뒤`})));
  const box = h('div', {class: 'box'}, h('h2', {text: '시장이 이렇게 가면 — 몬테카를로 4방향'}));
  box.append(h('p', {class: 'alt'}, h('b', {text: '모형 가정 아래 추정 · 검증 전'}), ' — 지난 날들을 다시 뽑아 본 셈일 뿐, 앞날 값이 아닙니다.'));
  if (!k || !k.ok) box.append(h('p', {class: 'q', text: '? 셈 못 함 — 어느 한 방향에서 이 회사 값이 있는 날이 20일이 안 됩니다.'}));
  else {
    const list = h('ul', {class: 'dirbars'});
    const okC = Object.values(K.companies).filter(x => x && x.ok), med = a => { const x = a.slice().sort((p, q) => p - q), m = x.length; return m ? (m % 2 ? x[(m - 1) / 2] : (x[m / 2 - 1] + x[m / 2]) / 2) : null; }; // 365곳 가운데값(CIA팀 2026-10-12: 견줄 값)
    K.dirs.forEach((d, j) => { const w = k.win[j], b = k.big[j], bw = h('i', {class: 'db pos'}), bb = h('i', {class: 'db neg'}); bw.style.width = w + '%'; bb.style.width = b + '%';
      const mw = med(okC.map(x => x.win[j])), mb = med(okC.map(x => x.big[j])), tw = h('i', {class: 'dm'}), tb = h('i', {class: 'dm'}); tw.style.left = mw + '%'; tb.style.left = mb + '%';
      list.append(h('li', {}, h('b', {class: 'dn', text: d.name}),
        h('span', {class: 'dl'}, h('span', {class: 'dt', role: 'img', 'aria-label': `번 길 ${r1(w).toFixed(1)}% · ${NP()}곳 가운데값 ${r1(mw).toFixed(1)}%`}, bw, tw), h('span', {class: 'num', text: `번 길 ${r1(w).toFixed(1)}%`})),
        h('span', {class: 'dl'}, h('span', {class: 'dt', role: 'img', 'aria-label': `크게 잃는 길 ${r1(b).toFixed(1)}% · ${NP()}곳 가운데값 ${r1(mb).toFixed(1)}%`}, bb, tb), h('span', {class: 'num', text: `크게 잃는 길 ${r1(b).toFixed(1)}%`})))); });
    box.append(list, h('p', {class: 'lkey'}, h('span', {}, h('i', {class: 'l-dw'}), '번 길'), h('span', {}, h('i', {class: 'l-db'}), '크게 잃는 길'), h('span', {}, h('i', {class: 'l-dm'}), `흰 눈금 = ${NP()}곳 가운데값`)));
    box.append(h('p', {class: 'small', text: `방향마다 지난 날들에서 20일을 뽑아 ${S.paths.toLocaleString('ko-KR')}번 — 번 길 = 사고팔 돈 0.3% 빼고 남음 · 크게 잃는 길 = −15% 밑 · 어느 방향이 올지는 모릅니다`}));
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
    li(c.per != null ? 'ok' : 'q', h('b', {text: '몸값 '}), `시가총액 ${eok(c.cap)}`, c.per != null ? ` · 1년 순이익의 ${r1(c.per).toFixed(1)}배(${NP()}곳 가운데값 ${r1(C.facts.perMedian).toFixed(1)}배)` : h('span', {class: 'q', text: ' · 순이익 몇 배인지 ? 자료 없음'})),
    li('ok', h('b', {text: '1주 값 '}), `${won(c.price)}(${md(c.priceDate || C.asOf)} 종가) — 한 주의 값일 뿐, 싸고 비쌈이 아닙니다`),
    li(g.low.below / g.n >= 0.8 ? 'no' : 'ok', h('b', {text: '쏠림 '}), `같은 갈래 ${g.n}곳 중 ${g.low.below}곳이 ${md(C.dates[g.low.k])}에 함께 ${md(C.base)}보다 아래`),
    li('q', h('b', {text: '파는 것 '}), c.products ? h('span', {'data-proper': '1', text: c.products.split(',').slice(0, 2).join(',').trim()}) : h('span', {class: 'q', text: '? 자료 없음 — 한 줄로 말할 수 있나요?'}), c.products ? ' — 한 줄로 말할 수 있나요?' : null), // 파는 것 = 회사 글(남의 글 · data-proper — 화면 검사 금지 말 셈 밖 · 모든 회사 7단 2026-10-14 「예측 솔루션」)
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
  needUpd().then(() => { const el = watch.querySelector('.nxw'); if (el && D.upd?.slots?.length) el.replaceChildren(h('b', {text: '다음 회차 '}), h('span', {class: 'num', text: nextSlot(D.upd.slots)}), '(서울) — 새 종가가 있으면 값 · 범위를 다시 셉니다'); }).catch(() => {});
  const capSet = (m, ...kids) => { capLi.replaceChildren(h('span', {class: 'm ' + m, 'aria-hidden': 'true', text: m === 'ok' ? '·' : '?'}), h('span', {}, h('b', {text: '봉인 '}), ...kids)); };
  if (C.time) needTime().then(() => { const Kc = D.time.capsules?.[0], m = Kc?.members.find(x => x[0] === code);
    if (!Kc) capSet('q', '? 봉인 자료를 못 읽었습니다');
    else if (m) capSet('ok', `${Kc.id}호에 든 회사 — ${md(Kc.seal)} 종가 ${won(m[1])} 그대로 잠금 · 3년 뒤 ${ymd(Kc.opens[0].date)}에 다시 셉니다 `, h('b', {class: 'num dd', text: ddayText(Kc.opens[0].date)}), ' · ', h('a', {class: 'inl', href: '#/time', text: '봉인 보기'}));
    else capSet('ok', E.pk ? `${Kc.id}호(${md(Kc.seal)} 365곳)에는 없는 회사 — 그 뒤 고르는 기준이 바뀌어 새로 든 곳입니다 · ` : `${Kc.id}호(${md(Kc.seal)} 365곳)에는 없는 회사입니다 · `, h('a', {class: 'inl', href: '#/time', text: '봉인 보기'})); }).catch(() => capSet('q', '? 봉인 자료를 못 읽었습니다'));
  else capSet('q', '? 봉인 자료가 없습니다');
  // 확인할 것(CIA팀) — 어디서 · 언제
  const more = h('details', {class: 'more'}, h('summary', {text: '확인할 것 — 어디서 · 언제'}), h('div', {class: 'in'}, h('ol', {},
    h('li', {}, '거래정지 · 관리종목 · 투자경고: ', h('a', {href: 'https://kind.krx.co.kr', rel: 'noopener', target: '_blank', text: 'KIND(한국거래소)'}), ' — ATLAS 는 아직 이 표시를 거르지 못합니다(?).'),
    h('li', {}, '3분기 실제 이익: ', h('a', {href: 'https://dart.fss.or.kr', rel: 'noopener', target: '_blank', text: 'DART(전자공시)'}), ' 분기보고서 — 11월 중순까지. 증권사 짐작과 견줘 보세요.'),
    h('li', {}, '주식 수 바뀜(쪼개기 · 증자): DART 주요사항보고서 — ', C.facts.jumpN ? `${C.days}거래일 선이 하루 30% 넘게 튄 곳 ${C.facts.jumpN}곳(? 확인 못 함).` : `${C.days}거래일 선이 하루 30% 넘게 튄 곳은 없었습니다.`),
    h('li', {text: E.pk ? `이 회사가 조건을 이어 지키는지: 새 1년 성적표가 나오면 다시 셉니다 — 3단 「왜 ${pickName(C)}에 들었나요?」를 보세요 · 들고 난 곳은 「업데이트」 탭에 남습니다.` : `이 회사가 조건에 드는지: 새 1년 성적표가 나오면 다시 셉니다 — 3단 「왜 ${pickName(C)} 밖인가요?」를 보세요 · 들고 난 곳은 「업데이트」 탭에 남습니다.`}))));
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
  const E = await coEntry(code);
  if (!E) return viewMissing(v, code);
  const c = E.c;
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
  } else box.append(h('p', {class: 'q', text: storyNone(E.pk)}));
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
  const box = h('div', {class: 'box'}, h('h2', {text: `우리나라 상장 회사 ${(D.core.funnel.companies ?? D.core.funnel.universe).toLocaleString('ko-KR')}곳 안 「${I.name}」 ${I.n}곳 가운데 매출 ${I.rank ?? '?'}번째`}));
  const ul = h('ul', {class: 'peers', 'aria-label': `같은 업종 ${I.size === 'net' ? '순이익' : '매출'} 막대 — ` + rows.map(r => `${r[0]} ${eok(r[1])}`).join(', ')});
  for (const [nm, val, me] of rows) { const bar = h('i', {class: 'pb' + (me ? ' me' : '')}); bar.style.width = Math.max(2, (val || 0) / mx * 100) + '%';
    ul.append(h('li', {class: me ? 'me' : null}, h('span', {class: 'pn', text: nm}), h('span', {class: 'pt', 'aria-hidden': 'true'}, bar), h('b', {class: 'num', text: eok(val)}))); }
  box.append(ul);
  box.append(h('p', {class: 'small', text: `${I.size === 'net' ? '매출이 없는 업종이라 순이익으로 셉니다 · ' : ''}이 회사 = 이 ${I.n}곳 매출 합의 ${I.share != null ? r1(I.share).toFixed(1) + '%' : '?'}(시장 점유율이 아님) · 매출이 절반 ~ 두 배인 비슷한 크기 ${I.near ?? '?'}곳 · 후보 밖 · 업종이 다르게 묶인 회사 · 나라 밖 경쟁 회사는 이 막대에 없습니다(아래 이름에만).`}));
  box.append(h('p', {class: 'src', text: '네이버 증권 결산 · 10월 10일 모음 · ATLAS 업종으로 셈'}));
  return box;
}
async function viewGrow(v, code) {
  const E = await coEntry(code);
  if (!E) return viewMissing(v, code);
  const C = D.core, c = E.c;
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
    v.append(h('p', {class: 'note'}, h('span', {class: 'q', text: '? '}), storyNone(E.pk).slice(2)));
    v.append(growNotes(null, E.pk), next7(), foot()); return;
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
  if (BI) v.append(h('p', {class: 'alt'}, h('b', {text: '다르게 보면 — '}), `${NP()}곳 10년 뒤 가운데 ${xMul(BI.m10)}쯤 · 이 회사 ${m10 != null ? xMul(m10) + '쯤' : '? 자료 모자람'}. 세 팀은 증권사보다 한 해쯤 조심스럽게 봤습니다(2027년 가운데 ÷ 올해 증권사 평균치 = ${BI.cons.toFixed(2)}배 · ${BI.consN}곳 가운데값).`));
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
function growNotes(S, pk = true) { // pk = 고른 곳(「따로 다시 확인」 줄은 고른 곳 이야기에 대한 것 — 고른 곳 밖 「조사 전」 화면에는 싣지 않음 · 2026-10-14 17:25)
  return h('div', {class: 'note'},
    h('p', {text: S ? `이 이야기는 봉인하지 않습니다 — 쓴 날 ${md(S.made)} · 새 소식이 나오면 고쳐 씁니다. 범위는 「100번 중 80번쯤 이 안」으로 잡은 세 팀의 따짐이며, 맞힘이 아닙니다.` : '세 팀 이야기를 쓰면 같은 자리에 범위와 까닭이 보입니다.'}),
    pk && D.core.grow?.check ? h('p', {text: checkLine(D.core.grow.check)}) : null);
}
function growSummary(Gs) {
  const rows = [...GRADES_ALL.map(gr => [gr, Gs.g10[gr] ?? 0]), ['? 자료 모자람', Gs.g10none ?? 0], ['조사 중', Gs.of - Gs.written]];
  const mx = Math.max(1, ...rows.map(r => r[1]));
  const ul = h('ul', {class: 'gbars', 'aria-label': `10년 뒤 더 커져 있을까요 — ` + rows.map(r => `${r[0]} ${r[1]}곳`).join(', ')});
  for (const [name, n] of rows) { const f = h('i', {class: 'gf'}); f.style.width = (n / mx * 100) + '%'; ul.append(h('li', {}, h('span', {text: name}), h('span', {class: 'gt', 'aria-hidden': 'true'}, f), h('b', {class: 'num', text: n + '곳'}))); }
  return h('section', {class: 'gsum'}, h('h2', {class: 'sec', text: '회사마다 — 앞으로 클까?'}),
    h('p', {text: `세 팀이 ${NP()}곳 가운데 ${Gs.written}곳을 따졌습니다 — 주가가 아니라 회사 크기(매출)만 봅니다. 10년 뒤 2025년보다 더 커져 있을까요?`}), ul,
    h('p', {class: 'note', text: `판의 모양: 혼자 앞섬 ${Gs.shapes['혼자 앞섬']}곳 · 몇 곳이 나눔 ${Gs.shapes['몇 곳이 나눔']}곳 · 다투는 곳이 많음 ${Gs.shapes['다투는 곳이 많음']}곳 · 새로 생기는 판 ${Gs.shapes['새로 생기는 판']}곳. 회사마다 5단 「누구와 다투나」에서 경쟁 회사를, 6단 「앞으로 클까?」에서 범위와 까닭을 봅니다. 이 이야기는 봉인하지 않습니다.`}),
    Gs.check ? h('p', {class: 'note', text: checkLine(Gs.check)}) : null);
}
const GRADES_ALL = ['아주 높다', '높다', '반반', '낮다', '아주 낮다'];
/** 세 팀 이야기가 없을 때 — 고른 곳은 「아직 없음(사람이 조사해 채움)」 · 고른 곳 밖(2026-10-14 「전부다 나오게 해」)은 「조사 전」 — 이야기는 고른 곳만 사람이 조사해 씀 */
const storyNone = pk => (pk ? '? 세 팀 이야기는 아직 없습니다 — 멍거 · 린치 조건에 새로 든 회사는 사람이 조사해 새 기록 파일로 채웁니다(정해진 날 없음). 지금은 숫자만 보입니다.'
  : `? 세 팀 이야기는 조사 전입니다 — 이야기는 ${pickName()}만 사람이 조사해 씁니다. 이 회사는 숫자만 보입니다.`);
// 따로 다시 확인(17:56 「예약」 4차) — 판정을 쓰지 않은 다른 팀이 근거 기사를 직접 열어 봄
// 2026-10-14 「완벽하게 해」 — 42곳은 근거 기사를 모두 열어 봄(표본 아님) · 처음에 틀리거나 일부만 맞던 문장은 원문대로 고쳐 다시 열어 봄 → 「골라(표본)」은 기록에 고친 수(fixed)가 없을 때만
const checkLine = K => { const N = D.core.grow?.factN, X = K.fixed;
  return `따로 다시 확인(${md(K.made)}): 근거 기사${N ? ` ${N.toLocaleString('ko-KR')}개 가운데` : ''} ${K.facts.n}개를${X ? '' : ' 골라(표본)'} 다른 팀이 직접 열어 봄 — 맞음 ${K.facts['맞음']} · 일부만 맞음 ${K.facts['일부만 맞음']} · 틀림 ${K.facts['틀림']} · 못 엶 ${K.facts['못 엶']}.` +
    (X ? ` 처음 열어 볼 때 일부만 맞음 ${X.first['일부만 맞음']} · 틀림 ${X.first['틀림']}이던 ${X.fixed}개는 원문대로 고쳐 다시 열어 봤고, 본문이 안 열린 ${X.dropped}개는 뺐습니다.` : '') +
    (N && X && N > K.facts.n ? ` 나머지 ${(N - K.facts.n).toLocaleString('ko-KR')}개(앞서 쓴 이야기)는 아직 다시 열어 보지 못했습니다.` : '') +
    ` 「기사로 못 봄」 경쟁 회사 ${K.rivals.n}곳은 기사로 확인 ${K.rivals['기사로 확인']} · 다른 일을 함 ${K.rivals['다른 일을 함']} · 확인 못 함 ${K.rivals['확인 못 함']}.`; };
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

// ── 화면 ⑦ 업데이트(사장님 2026-10-11 12:41 「업데이트는 하루에 4번 해야 하고 업데이트 탭 만들어서 기록해놓아라」) ──
//   회차마다 한 줄 — 언제 · 어느 회차 · 결과(바꿈 · 그대로 · 실패) · 고른 날 · 기준일 · 그대로 남은 곳(가장 큰 글씨) · 새로 든 곳 · 빠진 곳 · 1등 갈래 · 그림 = 회차마다 들고 난 수
//   2026-10-13 13:04 「힘이 붙는 종목으로」 — 고르는 기준이 바뀐 회차는 한 줄로 밝힘(들고 난 곳이 많은 까닭) · 그림은 점선 빈 막대 · 자(가장 큰 수)에서 뺌 · 옛 기록은 「옛 규칙(대세 업종)」 꼬리표(애플 · 클로드팀)
const DOW = ['일', '월', '화', '수', '목', '금', '토'];
const kstLabel = k => { const d = new Date(k.slice(0, 10) + 'T00:00:00Z'); return `${md(k.slice(0, 10))}(${DOW[d.getUTCDay()]}) ${k.slice(11, 16)}`; };
const RES_WORD = {'바꿈': '바꿈', '그대로': '그대로 — 새 값 없음', '실패': '실패'};
const OLD_NAME = v => (/^mg-/.test(v ?? '') ? '멍거 조건' : /^h365/.test(v ?? '') ? '힘 붙음' : /^d365/.test(v ?? '') ? '대세 업종' : /^t365/.test(v ?? '') ? '1년 우량' : null), OLD_RULE = v => (OLD_NAME(v) ? `옛 규칙(${OLD_NAME(v)})` : null); // 지난 회차 기록 · 봉인의 판 — 그때 이름 그대로 꼬리표로만
const RULE_TURN = r => `이 회차에 고르는 기준이 바뀌었습니다 — ${OLD_RULE(r.prevVersion) ?? '옛 규칙'} → ${r.version === D.core?.rules?.version ? pickName() : (OLD_RULE(r.version) ?? '새 규칙')}. 들고 난 곳이 많은 것은 기준 때문이고, 시장이 바뀐 것이 아닙니다.`;
function namesLine(list, max = 6) { return list.slice(0, max).map(x => x.n).join(' · ') + (list.length > max ? ` 외 ${list.length - max}곳` : ''); }
const manText = n => (n >= 1e4 && n % 1e4 === 0 ? (n / 1e4).toLocaleString('ko-KR') + '만' : Number(n).toLocaleString('ko-KR')); // 10000000 → 1,000만
/** 네 눈 점검 한 줄(사장님 2026-10-12 12:41 「업데이트 할때마다 아틀란스 점검을 애플 구글 클로드 cia방식으로 각각 1000만번씩」) */
const inspectLine = (I, all) => `네 눈 점검(눈마다 ${manText(I.nEach)} 번) — ` + (all || I.fail ? I.lenses.filter(l => all || l.fail).map(l => `${l.name} ${l.fail ? '걸림 ' + l.fail.toLocaleString('ko-KR') + '건' : '이상 없음'}`).join(' · ') : '모두 이상 없음');
async function viewUpdates(v) {
  await needUpd();
  const U = D.upd, R = U.records, last = R[0];
  const tell = tellRow(`하루 ${U.slots.length}번 · ${U.slots.join(' · ')}(서울)`, null);
  v.append(tell.el, h('h1', {class: 'head', text: `업데이트 기록 — 하루 ${U.slots.length}번`}),
    h('p', {class: 'count', text: last ? `마지막 ${kstLabel(last.kst)} · ${RES_WORD[last.result] ?? last.result}` + (last.asOf ? ` · 고른 날 ${md(last.asOf)}` : '') : '아직 기록이 없습니다.'}));
  const h0 = [...R].reverse().find(r => r.version === D.core.rules.version); // 이 규칙으로 처음 고른 회차(지난 기록에서 셈 · 날짜를 박지 않음)
  v.append(h('p', {class: 'note', text: `회차마다 값과 그림을 새로 셉니다 — ${pickName()}은 새 1년 성적표가 들어와야 바뀝니다(${h0 ? md(h0.kst.slice(0, 10)) + '부터' : '이번 회차부터'} 이 규칙 · 그 전 기록은 옛 규칙). 기준일은 늘 마지막 종가 날의 20거래일 전입니다. 회차마다 시장을 읽어 적고, 애플 · 구글 · 클로드 · CIA 네 눈으로 각각 1,000만 번 점검합니다 — 하나라도 걸리면 새 자료를 올리지 않습니다. 기록은 지우지 않습니다.`}));
  // 시장 판독(사장님 2026-10-12 12:41 「시장을 판독해서」) — 마지막 회차가 올린 자료로 · 지난 사실만(규칙 49 · 판독 규칙 mr-v1 = market_read.mjs)
  if (last?.market?.lines?.length) v.append(h('div', {class: 'alt mread'}, h('p', {}, h('b', {text: '지금 시장 판독'}), ' — 지난 값만 · 앞날 맞히기 아님'), h('ul', {}, ...last.market.lines.map(t => h('li', {text: t})))));
  if (last?.inspect) v.append(h('p', {class: last.inspect.fail ? 'q' : 'note'}, (last.inspect.fail ? '? ' : '') + inspectLine(last.inspect, true)));
  { const k = new Date(Date.now() + 9 * 36e5), m = k.getUTCHours() * 60 + k.getUTCMinutes(), nx = U.slots.find(x => +x.slice(0, 2) * 60 + +x.slice(3, 5) > m) ?? U.slots[0];
    v.append(h('p', {class: 'note nx'}, MO.parrot(34), h('span', {}, '다음 회차 ', h('b', {class: 'num', text: nx}), `(서울${U.slots.indexOf(nx) === 0 && +nx.slice(0, 2) * 60 + +nx.slice(3, 5) <= m ? ' · 내일' : ''}) — 새 종가가 있으면 값과 봉인 뒤 값을 그때 다시 셉니다.`))); } // 앵무새 막비가 다음 회차를 알림 — 글은 한 덩어리로 옆에서 흐름
  const host = h('div', {class: 'upchart'}); v.append(host); upChart(host, R.slice(0, 28).reverse());
  const turnIn = R.slice(0, 28).find(r => r.ruleChanged);
  v.append(h('p', {class: 'lkey'}, h('span', {}, h('i', {class: 'l-in'}), '새로 든 곳'), h('span', {}, h('i', {class: 'l-out'}), '빠진 곳'), turnIn ? h('span', {}, h('i', {class: 'l-turn'}), `점선 = 고르는 기준이 바뀐 회차(새로 든 곳 ${turnIn.in?.length ?? '?'} · 자에서 뺌)`) : null, h('span', {text: '막대 하나 = 회차 하나 · 오른쪽이 최근'})));
  const ol = h('ol', {class: 'uplist'});
  for (const r of R) {
    const li = h('li', {class: 'r-' + ({'바꿈': 'ch', '그대로': 'same', '실패': 'fail'}[r.result] ?? 'same')});
    li.append(h('p', {class: 'uh'}, h('b', {text: kstLabel(r.kst)}), ` · ${r.slot ? r.slot + ' 회차' : '그 밖 올림'} `, h('span', {class: 'chip res', text: RES_WORD[r.result] ?? r.result})));
    if (!r.slot && r.reason) li.append(h('p', {class: 'small', text: r.reason}));
    if (r.ruleChanged) li.append(h('p', {class: 'q turn', text: RULE_TURN(r)}));
    if (r.asOf) li.append(h('p', {text: `고른 날 ${md(r.asOf)}${r.provisional ? '(그날 저녁 8시 전 값 — 아직 바뀜)' : ''} · 기준일 ${md(r.base)}` + (OLD_RULE(r.version) ? ` · ${OLD_RULE(r.version)}` : '')}));
    if (r.stay != null && (r.in?.length || r.out?.length)) li.append(h('p', {class: 'stay'}, h('b', {class: 'num', text: `그대로 ${r.stay}`}), ''));
    if (r.in?.length || r.out?.length) {
      li.append(h('p', {}, h('b', {class: 'ni', text: `새로 든 곳 ${r.in.length}`}), r.in.length ? ' ' + namesLine(r.in) : ''));
      li.append(h('p', {}, h('b', {class: 'no2', text: `빠진 곳 ${r.out.length}`}), r.out.length ? ' ' + namesLine(r.out) : ''));
      if (r.in.length > 6 || r.out.length > 6) li.append(h('details', {class: 'more'}, h('summary', {text: '모두 보기'}), h('div', {class: 'in'}, h('p', {text: '새로 든 곳: ' + r.in.map(x => x.n).join(' · ')}), h('p', {text: '빠진 곳: ' + r.out.map(x => x.n).join(' · ')}))));
    } else if (r.result !== '실패') li.append(h('p', {text: '고른 곳은 앞 회차와 같습니다.'}));
    if (r.top?.short) li.append(h('p', {}, `${r.top.scope === 'mkt' ? '모든 회사 1등 갈래' : '1등 갈래'} ${r.top.short} `, pctEl(r.top.chg, 'span'), ' · 고른 곳 전체 ', pctEl(r.all?.chg, 'span'), ` · 20거래일` + (r.in?.length ? '(고른 곳이 바뀐 것도 섞임)' : '')));
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
  const M = Math.max(4, ...rows.filter(r => !r.ruleChanged).flatMap(r => [r.in?.length ?? 0, r.out?.length ?? 0])) * 1.15, bw = Math.min((W - 2 * P) / n, 36), x0 = W - P - n * bw, Y0 = Hh / 2, sc = (Hh / 2 - P) / M; // 오른쪽이 최근 · 막대 폭은 36 까지 · 기준이 바뀐 회차는 자에서 뺌(다른 막대가 납작해지지 않게 · 애플팀)
  const svg = sv('svg', {viewBox: `0 0 ${W} ${Hh}`, width: W, height: Hh, role: 'img', 'aria-label': `최근 ${rows.length}회차 — 새로 든 곳 ${rows.reduce((t, r) => t + (r.in?.length ?? 0), 0)} · 빠진 곳 ${rows.reduce((t, r) => t + (r.out?.length ?? 0), 0)}`});
  const T = tok();
  hairs(svg, W, P, [P, Hh - P]);
  svg.append(sv('line', {x1: P, x2: W - P, y1: Y0, y2: Y0, stroke: T.mute, 'stroke-width': 1}));
  rows.forEach((r, k) => {
    const x = x0 + k * bw + bw * 0.18, w = Math.max(2, bw * 0.64), a = (r.in?.length ?? 0) * sc, b = (r.out?.length ?? 0) * sc;
    if (r.ruleChanged) { svg.append(sv('rect', {x: x.toFixed(1), y: P, width: w.toFixed(1), height: Hh - 2 * P, rx: 1, fill: 'none', stroke: T.mute, 'stroke-width': 1.2, 'stroke-dasharray': '3 3'})); return; } // 점선 빈 막대 = 기준이 바뀐 회차
    if (r.result === '실패') svg.append(sv('rect', {x: x.toFixed(1), y: (Y0 - 7).toFixed(1), width: w.toFixed(1), height: 14, rx: 1, fill: 'none', stroke: T.gold, 'stroke-width': 1.5}));
    else if (!a && !b) svg.append(sv('circle', {cx: (x + w / 2).toFixed(1), cy: Y0, r: 3, fill: T.mute}));
    if (a) svg.append(sv('rect', {x: x.toFixed(1), y: (Y0 - a).toFixed(1), width: w.toFixed(1), height: a.toFixed(1), rx: 1, fill: T.violet}));
    if (b) svg.append(sv('rect', {x: x.toFixed(1), y: Y0, width: w.toFixed(1), height: b.toFixed(1), rx: 1, fill: T['violet-ink']}));
  });
  host.append(svg);
  if (rows.length > 1) host.append(h('div', {class: 'ax'}, h('span', {text: kstLabel(rows[0].kst)}), h('span', {text: kstLabel(rows[rows.length - 1].kst)})));
  else if (rows.length) host.append(h('div', {class: 'ax'}, h('span', {}), h('span', {text: kstLabel(rows[0].kst)})));
}

// ── 영상 친구들(사장님 2026-10-11 16:29 「곳곳에 영상에 있는 고양이 무지개 앵무새 꽃 무지개 우주서 하트 이런것들 있잖아 … 곳곳에 잘어울리게 먼저 배치해봐 구글팀 클로드팀 애플팀이라면 어떻게 배치할것인지 기획한다음 해」) ──
//   옛 소개 영상의 친구들을 판판한 작은 그림으로 — 주황 아기 고양이 · 하얀 고양이 · 앵무새 막비(갈라 — 분홍 몸 · 회색 날개) · 무지개 · 웃는 달 · 별 · 우주 고래 · 꽃 · 하트 · 나비
//   사람 그림 없음 · 그림 파일 없이 코드로(가벼움) · 모두 화면 읽기에서 숨김(aria-hidden) · 입체 · 그림자 · 빛 없음(규칙 50) · 빨강 · 파랑은 쓰지 않음(규칙 53 — 오름 · 내림 색과 헷갈리지 않게)
//   클로드팀: 숫자 · 회사 · 그림(차트) · 조심 상자 옆에는 두지 않음(「좋다」로 읽히지 않게 — site_check 「꾸밈 자리」가 잼) · 애플팀: 뜻 있는 자리에 작게 · 구글팀: 한 벌(같은 색 · 같은 굵기)
const MOC = {pink: '#F2A7D6', galah: '#EFA6D2', crest: '#F9D6E4', lav: '#C9B6F2', lavD: '#A893E0', yellow: '#F6D97A', yellowD: '#8A6A2A', white: '#F6F3FF', whiteL: '#CFC6EE',
  orange: '#F2A65A', orangeD: '#C9761F', grey: '#ABA8BE', mint: '#9EDDB4', peach: '#F9C48F', whale: '#B4A4EE', whaleL: '#DCD3FA', whaleD: '#9887DD', eye: '#3A2F5A', cheek: '#F6BCDD', beak: '#EDE7F2'};
// 색 — 빨강 · 파랑은 오름 · 내림에만(규칙 53): 분홍은 자홍 쪽(OKLab 색상 340°대) · 고래는 연보라 · 무지개에 파랑 띠 없음 — site_check 「영상 친구」가 색상 25° 안을 잼
function moSvg(name, w, hgt, vb, ...kids) { const s = sv('svg', {class: 'mo mo-' + name, viewBox: vb, width: w, height: hgt, 'aria-hidden': 'true', focusable: 'false'}); s.append(...kids.flat(Infinity).filter(Boolean)); return s; } // 끝까지 폄(2026-10-14 — 무지개 구름 [[○ ○ ○], [○ ○ ○]]이 한 겹만 펴져 「[object SVGCircleElement]」 글로 들어가던 것 · 화면 돌기 null 검사가 찾음)
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
    st('now', '지금 · 봉인 ' + T.id + '호', md(T.seal), null, ...(S.days ? [`봉인 뒤 ${S.days}거래일 — 365곳 `, pctEl(S.chg365, 'b'), ' · 후보 모두 ', pctEl(S.chgPool, 'b')]
      : [`365곳을 이날 종가 그대로 잠금 — 다음 거래일부터 한 칸씩 채웁니다`])),
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
  const vals = [...p365, ...ppool, ...S.v365, ...S.vpool, 100].filter(v => v != null);
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
    h('p', {class: 'count', text: `365곳 · 후보 ${K.nPool.toLocaleString('ko-KR')}곳을 ${md(K.seal)} 종가 그대로 잠금 · 앞날 값은 그리지 않습니다`}));
  const host = h('div'); v.append(host); const draw = () => timeChart(host, K); draw(); chartDraw = draw;
  v.append(h('p', {class: 'lkey'}, h('span', {}, h('i', {class: 'l-k365'}), '봉인 365곳'), h('span', {}, h('i', {class: 'l-kpool'}), '후보 모두'),
    h('span', {}, h('i', {class: 'l-pick'}), `봉인 날 = 100`), h('span', {}, h('i', {class: 'l-open'}), `3년 뒤 여는 날`)));
  // 지금 — 봉인 뒤 지금까지(현재에 집중)
  v.append(h('h2', {class: 'sec', text: '지금 — 봉인 뒤 지금까지'}));
  if (!S.days) v.append(h('p', {}, h('span', {class: 'q', text: '? '}), `아직 0거래일 — ${md(K.seal)}이 봉인 날이자 마지막 종가 날입니다. 다음 거래일부터 회차마다(하루 4번) 한 칸씩 채웁니다.`), MO.catSleep(72)); // 기다리는 자리 — 잠든 아기 고양이(16:29)
  else {
    const trio = h('div', {class: 'trio'}, h('div', {}, h('span', {text: '봉인 365곳'}), pctEl(S.chg365)), h('div', {}, h('span', {text: '후보 모두'}), pctEl(S.chgPool)));
    v.append(trio); fitNums(trio);
    v.append(h('p', {class: 'src', text: `${md(K.seal)} 종가 → ${md(S.dates.at(-1))} 종가 · 봉인 뒤 ${S.days}거래일 · 같은 돈 나눠 사서 그대로 · 값 있는 ${S.have365}곳 · ${S.havePool.toLocaleString('ko-KR')}곳` + (S.stale365 ? ` · 마지막 날 값 없는 ${S.stale365}곳은 앞 값` : '')}));
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
    h('p', {class: 'note', text: '그날 장이 쉬면 그 뒤 첫 거래일 종가로 엽니다. 봉인한 365곳이 후보 모두보다 나았는지만 셉니다 — 그 사이 고르는 기준이 바뀌어도 이 봉인은 그대로입니다.'}),
    K.version !== D.core.rules.version ? h('p', {class: 'note', text: `봉인 ${K.id}호는 ${md(K.seal)} 옛 규칙(${OLD_NAME(K.version) ?? K.version})으로 고른 365곳을 잠근 것입니다. 그 뒤 고르는 기준이 바뀌어(${pickName()}) 봉인 ${K.id}호의 365곳과 지금 ${NP()}곳은 다릅니다.`}) : null);
  if (D.core.grow) v.append(growSummary(D.core.grow)); // 회사마다 앞으로 클까?(사장님 16:51 · 봉인과 따로 — 16:57 「이건 봉인하지마」)
  v.append(h('details', {class: 'more'}, h('summary', {text: '그날 이렇게 셉니다 — 봉인과 함께 잠근 규칙'}), h('div', {class: 'in'}, h('ol', {}, ...K.rules.map(r => h('li', {text: r}))), K.rulesNote ? h('p', {class: 'small', text: K.rulesNote}) : null)));
  v.append(h('div', {class: 'box seal'}, h('h2', {text: `봉인 번호 ${K.digest.slice(0, 12)}`}), h('p', {class: 'digest', text: K.digest}),
    h('p', {class: 'small', text: `기록 파일 ${K.file} · 지우지 않음 · 잠근 내용(날 · 규칙 · 회사 · 종가)이 한 글자만 바뀌어도 번호가 달라집니다 — 회차마다 다른 셈(노드)으로 번호를 다시 맞대 봅니다.`})));
  v.append(foot());
}

// ── 화면 ⑤ 업종 63 ──
function viewList(v) {
  const C = D.core, ALLN = !!C.mkt;
  const multi = C.industries.filter(i => i.n > 1).sort((a, b) => b.chg - a.chg), single = C.industries.filter(i => i.n === 1).sort((a, b) => b.chg - a.chg);
  v.append(h('h1', {class: 'head', text: `업종 ${C.industries.length}개 — ${C.days}거래일 많이 오른 순`}), h('p', {class: 'count', text: `${md(C.base)} → ${md(C.asOf)} · ${ALLN ? `모든 회사 ${MN(C).toLocaleString('ko-KR')}곳 · ` : ''}큰 갈래와 상관없이 업종만 줄 세웠습니다.`}));
  if (ALLN) v.append(h('p', {class: 'note gold-say', text: `금빛 줄 = ${pickName(C)}이 든 업종(${C.industries.filter(i => i.pk).length}개).`}));
  // 금빛 줄(고른 곳이 든 업종) — 이름표는 큰 갈래 이름 하나(줄이 넘치지 않게 · 고른 곳 수는 업종 화면에서)
  const mk = (list, label) => { const host = h('div'); v.append(host); race(host, {items: list.map(i => ({key: i.name, name: i.name, href: hrefInd(i), v: i.v, cw: i.cw, badge: gById(i.g).short, pk: ALLN && i.pk > 0})), parent: null, wide: true, label}); };
  if (single.length) v.append(h('h2', {class: 'sec', text: `회사 2곳 이상인 업종 ${multi.length}개`}));
  mk(multi, `회사 2곳 이상 업종 ${multi.length}개 — ${C.days}거래일 많이 오른 순`);
  if (single.length) { v.append(h('h2', {class: 'sec', text: `회사 1곳뿐인 업종 ${single.length}개`}), h('p', {text: '업종 평균이 아니라 그 회사 하나의 값입니다.'}));
    mk(single, `회사 1곳뿐인 업종 ${single.length}개`); }
  v.append(foot());
}
function viewMissing(v, code) { // 바탕 회사에서 빠진 회사의 옛 주소면 이름 · 까닭 · 깔때기(구글팀 2026-10-12)
  const head = h('h1', {class: 'head', text: '없는 주소입니다'}), say = h('p', {class: 'count', text: code ? `「${code}」는 지금 ${pickName()}에 없습니다. 찾기로 이름을 쳐 보세요.` : '주소가 바뀌었거나 잘못 들어왔습니다.'}), more = h('div');
  v.append(head, say, more, h('p', {}, h('a', {class: 'play', href: '#/', text: '처음 화면으로'})), foot());
  if (code) needNames().then(() => { const r = D.names?.rows.find(x => x.c === code); if (!r || !head.isConnected) return;
    head.textContent = `${r.n} — 지금 ${pickName()} 밖`; say.textContent = `${josa(r.n, '은', '는')} ${stopSay(r)} — 새 1년 성적표가 나오면 다시 셉니다.`;
    more.append(h('div', {class: 'why', text: r.w}), funnel(r)); }).catch(() => {});
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
  const onlyCho = /^[ㄱ-ㅎ]+$/.test(k), digits = /^\d+$/.test(k), codeK = !digits && /^\d[0-9a-z]{0,5}$/.test(k); // 번호 — 새로 상장한 곳은 숫자 · 영문이 섞임(0126Z0 · 2026-10-14 틀림 장부 26번)
  const hits = [];
  for (const g of D.core.groups) if (norm(g.name).includes(k) || norm(g.short).includes(k)) hits.push({kind: 'g', score: norm(g.name).startsWith(k) ? 0 : 1, g});
  for (const i of D.core.industries) if (norm(i.name).includes(k) || (onlyCho && cho(norm(i.name)).includes(k))) hits.push({kind: 'i', score: norm(i.name).startsWith(k) ? 0 : 1, i});
  D.names.rows.forEach((r, ix) => {
    let s = -1;
    if (digits) { if (r.c.startsWith(k)) s = 0; }
    else if (codeK && r.c.toLowerCase().startsWith(k)) s = 0;
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
  if (!hits.length) { hint.textContent = `「${q}」 — 찾는 이름이 없습니다. 코스피 · 코스닥 목록 ${D.names.funnel.universe.toLocaleString('ko-KR')}개(${D.names.collected} 모음 · 펀드 · 우선주까지) 안에 없는 이름입니다. 띄어쓰기를 빼거나 첫 글자로도 찾아보세요.`; return; }
  hint.textContent = `「${q}」 — ${hits.length >= 40 ? '앞 40개' : hits.length + '개'}`;
  for (const x of hits) {
    if (x.kind === 'g') ul.append(h('li', {}, h('a', {href: '#/g/' + x.g.id, 'data-go': '1'}, h('span', {class: 'nm', text: x.g.name}), pctEl(x.g.chg), h('span', {class: 'g2', text: `큰 갈래 · ${x.g.n}곳`}))));
    else if (x.kind === 'i') ul.append(h('li', {}, h('a', {href: hrefInd(x.i), 'data-go': '1'}, h('span', {class: 'nm', text: x.i.name}), pctEl(x.i.chg), h('span', {class: 'g2', text: `업종 · ${gById(x.i.g).short} · ${x.i.n}곳`}))));
    else if (x.r.s === 'in') { const c = D.comp[x.r.c]; ul.append(h('li', {}, h('a', {href: '#/c/' + x.r.c, 'data-go': '1'}, h('span', {class: 'nm', text: x.r.n}), pctEl(c.chg), h('span', {class: 'g2', text: `${c.i} · ${gById(c.g).short} · ${D.core.days}거래일`})))); }
    else ul.append(h('li', {class: 'out'}, h('a', {href: (x.r.k ? '#/x/' : cHref(x.r.c, false)), 'data-go': '1'}, h('span', {class: 'nm', text: x.r.n}), h('span', {class: 'chip', text: `${D.core.rules.name} 밖`}), h('span', {class: 'g2', text: x.r.w}))));
  }
}

// ── 도움말 · 365곳 밖(깔때기) ──
// 깔때기 두 갈래(멍거 · 린치 — 2026-10-14 06:05 「가」) — r = 밖 회사 이름표(갈래마다 멈춘 자리 sm · sl) · 없으면 깔때기만
const stopSay = r => (D.core.funnel.groups ?? []).map(g => `${g.name}은 「${g.stopName[g.k === 'mg' ? r.sm : r.sl] ?? '고르기'}」에서`).join(', ') + ' 멈췄습니다';
function funnel(r) {
  const F = D.core.funnel, wrap = h('div', {class: 'funnels'});
  for (const g of F.groups ?? []) {
    const stop = r ? (g.k === 'mg' ? r.sm : r.sl) : null, at = stop ? (g.stop[stop] ?? g.steps.length) : g.steps.length;
    const ol = h('ol', {class: 'funnel'});
    g.steps.forEach((s, ix) => { const fill = h('i', {class: 'fill'}); fill.style.width = (s.n / F.universe * 100) + '%';
      ol.append(h('li', {class: stop ? (ix < at ? 'past' : ix === at ? 'stop' : 'no') : ''}, fill, h('span', {}, h('b', {class: 'num', text: s.n.toLocaleString('ko-KR') + '곳'}), h('span', {text: s.t})))); });
    wrap.append(h('p', {class: 'fname'}, h('b', {text: `${g.name} ${g.n}곳`})), ol);
  }
  return wrap;
}
function showInfo(code) {
  const s = openSheet('infoSheet'), body = $('#infoBody'), C = D.core, F = C.facts; body.textContent = '';
  if (code) {
    const r = D.names?.rows.find(x => x.c === code);
    $('#infoTitle').textContent = r ? `${r.n} — ${pickName(C)} 밖` : `${pickName(C)} 밖`;
    if (!r) { body.append(h('p', {class: 'q', text: '? 이 이름표를 못 찾았습니다.'})); return; }
    body.append(h('p', {text: `${josa(r.n, '은', '는')} ${stopSay(r)}(${r.m === 'KOSPI' ? '코스피' : '코스닥'}).`}), h('div', {class: 'why', text: r.w}));
    const mk = D.mkt?.[code], mi = mk ? ind(mk.i) : null; // 모든 회사 자료(2026-10-14 「나」) — 업종 화면에서 왔으면 이미 받음
    if (mk && mi) body.append(h('p', {}, '업종 ', h('a', {class: 'inl', href: hrefInd(mi), text: mi.name}), ` · ${C.days}거래일 `, pctEl(mk.c, 'span')));
    body.append(funnel(r));
    body.append(h('p', {class: 'note', text: `${pickHow(C)} — 새 1년 성적표가 나오면 다시 셉니다.`}));
    return;
  }
  $('#infoTitle').textContent = 'ATLAS 는 어떻게 셌나요';
  body.append(h('p', {}, h('b', {text: pickName(C)}), ` — ${pickLine(C)}.`));
  body.append(h('p', {text: `${C.rules.notMunger} ${pickHow(C)} · 앞날 값은 쓰지 않았습니다 · 순서가 아닙니다.`}));
  body.append(h('p', {text: C.mkt ? `모든 회사 ${MN(C).toLocaleString('ko-KR')}곳이 지난 ${C.days}거래일(기준일 ${md(C.base)} → ${md(C.asOf)} · 장이 열린 날 ${C.days}번, 약 한 달) 어떻게 움직였는지, 큰 갈래 → 업종 → 회사로 눌러 봅니다. 금빛 = ${pickName(C)} — 이 회사들만 7단까지 봅니다. 앞날 값은 6단 회사 크기 범위(세 팀의 따짐)와 7단 몬테카를로 범위(모형 셈)로만 보이며, 맞힘이 아닙니다.`
    : `이 ${NP(C)}곳이 지난 ${C.days}거래일(기준일 ${md(C.base)} → ${md(C.asOf)} · 장이 열린 날 ${C.days}번, 약 한 달) 어떻게 움직였는지, 큰 갈래 → 업종 → 회사 → 7단까지 눌러 봅니다. 앞날 값은 6단 회사 크기 범위(세 팀의 따짐)와 7단 몬테카를로 범위(모형 셈)로만 보이며, 맞힘이 아닙니다.`}));
  body.append(h('p', {text: `줄 아래 「▲ 강하게 오름 · 힘 붙음」 = 이 기간의 방향 · 세기 · 힘입니다. 방향 = 기간 동안 그은 곧은 선이 3% 넘게 기울고 처음보다 끝도 같은 쪽(아니면 「옆걸음」) · 강하게 = 그 선이 10% 넘고 들쭉날쭉하지 않음 · 힘 붙음 = 뒤 ${Math.floor(C.days / 2)}거래일이 앞 ${Math.floor(C.days / 2)}거래일보다 3%p 넘게 더 오름(「힘 빠짐」은 그 반대). 지난 기록이고 앞날 값이 아닙니다. ${pickHow(C)}.`}));
  body.append(h('h2', {class: 'sec', text: `${pickName(C)}은 이렇게 골랐습니다`}), funnel(null));
  const RU = C.rules;
  for (const g of RU.groups ?? []) body.append(h('p', {}, h('b', {text: `${g.name} ${g.n}곳`}), ` — ${g.conds.map(x => x.t).join(' · ')} · ${g.who}`));
  body.append(h('details', {class: 'more'}, h('summary', {text: '두 사람의 말 · 원문'}), h('div', {class: 'in'}, h('ul', {}, ...RU.conds.map(x => h('li', {text: `${x.t} — 「${x.q}」 · ${x.who}`})), h('li', {text: RU.data}), h('li', {text: RU.q})))));
  body.append(h('ul', {class: 'note'}, h('li', {text: RU.price}), h('li', {text: RU.wait}), h('li', {text: RU.notCounted}), h('li', {text: RU.limits}),
    F.mg?.per30 ? h('li', {text: `멍거 갈래에서 값이 1년 이익의 30배 넘는 곳 ${F.mg.per30}곳도 그대로 둡니다 — 회사마다 몇 배인지 보여 드립니다.`}) : null,
    C.provisional ? h('li', {text: '? 장 중 값 — 오후 3시 30분 종가 전이라 오늘 값은 바뀔 수 있습니다. 고른 곳은 그대로입니다.'}) : null));
  body.append(h('h2', {class: 'sec', text: '셈'}), h('ul', {class: 'note'},
    h('li', {text: `${md(C.base)} 종가 = 100. 「한 회사 한 표」 = 날마다 회사들의 오르내림을 같은 무게로 평균 내어 이어 곱함(하루 ±50% 넘는 값은 자료 오류로 뺌).`}),
    h('li', {text: `「큰 회사는 크게」 = ${md(C.base)}에 시가총액만큼 사 두었다고 보고 그대로 둔 값.`}),
    h('li', {text: '배당은 넣지 않은 주가만 셉니다. 「가장 깊이 빠짐」 = 꼭대기에서 가장 많이 내려간 비율.'})));
  body.append(h('h2', {class: 'sec', text: '자료 · 때'}), h('ul', {class: 'note'}, h('li', {text: C.sources.price}), h('li', {text: C.sources.pick})));
  body.append(h('h2', {class: 'sec', text: '모르는 것 ?'}), h('ul', {class: 'note'},
    h('li', {text: '? 거래정지 · 관리종목 · 투자경고 표시 — 아직 거르지 못합니다.'}),
    h('li', {text: C.sincePick ? `? 고른 뒤 기록 — ${md(C.pickAsOf)} 뒤 ${C.sincePick}거래일뿐이라 아직 짧습니다.` : `? 고른 뒤 기록 — ${md(C.pickAsOf)} 종가로 골라 고른 뒤 기록은 아직 없습니다. 지금 보이는 선은 모두 고른 기간 안입니다.`}),
    h('li', {text: '? 증권사 짐작 — 자주 바뀝니다. 6단 그림의 올해 매출 한 칸(점선 · 「남의 짐작」)에 쓰고, 세 팀 이야기 글 속에 증권사 짐작을 옮긴 곳도 있습니다 — 그대로 믿을 값이 아닙니다. 고를 때는 쓰지 않습니다.'}),
    C.funnel.q ? h('li', {text: `? 두 조건 모두 셀 자료가 없는 ${C.funnel.q}곳은 넣지 않았습니다.`}) : null,
    h('li', {text: `? 다시 고르기 — ${RU.next}.`})));
  body.append(foot());
}

// ── 소리 · 글씨 ──
function speak() {
  try { if (!('speechSynthesis' in window)) return; speechSynthesis.cancel();
    const v = $('#view'), hs = v.querySelector('.hub .hs:not(.off)'), say = t => t?.replace(/−/g, '마이너스 ').replace(/\+/g, '플러스 ');
    const parts = [...(hs ? [hs.querySelector('h1, h2')?.textContent, ...[...hs.querySelectorAll('.say')].map(e => e.textContent)].map(say) : [v.querySelector('h1')?.textContent]), v.querySelector('.count')?.textContent, ...[...v.querySelectorAll('.board .row')].sort((a, b) => a.getBoundingClientRect().top - b.getBoundingClientRect().top).slice(0, 3).map(r => r.querySelector('.nm').textContent + ' ' + r.querySelector('.val').textContent.replace('−', '마이너스 ').replace('+', '플러스 ') + (r.querySelector('.trd') ? ', ' + r.querySelector('.trd').textContent.replace(/[▲▼▶] /, '') : ''))].filter(Boolean);
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
  if (hsh.startsWith('#/x/')) { await Promise.allSettled([needNames(), D.core.mkt ? needMkt() : null]); /* 못 받으면 아래에서 ? · 업종 줄 없음 */ const xc = dec(hsh.slice(4)); if (xc && D.core.co7 && D.mkt?.[xc]) { location.replace('#/c/' + xc); return; } /* 모든 회사 7단 — 옛 밖 칸 주소는 회사로 */ showInfo(xc ?? '?'); return; }
  for (const id of ['findSheet', 'infoSheet']) { const s = $('#' + id); if (!s.hidden) { s.hidden = true; delete document.body.dataset.sheet; } }
  if (hsh === lastMain && $('#view').childElementCount) return;
  lastMain = hsh;
  const my = ++routeSeq, root = $('#view'); root.textContent = ''; chartDraw = null;
  const v = h('div', {class: 'vw'}); root.append(v); // 길마다 새 칸 — 늦게 끝난 앞 화면은 떨어진 칸에 그려져 보이지 않음(구글팀: 두 화면이 겹치던 것)
  const opening = h('p', {class: 'boot'}, MO.cat('white', 34), ' 여는 중입니다…'); v.append(opening); // 느린 망에서 빈 화면 대신(애플팀) — 다 그리면 지움
  for (const t of ['#tabHome', '#tabList', '#tabUp']) $(t)?.toggleAttribute('aria-current', false);
  try {
    const [, kind, raw] = hsh.match(/^#\/(\w*)\/?(.*)$/) || [], arg = dec(raw ?? '');
    if (!kind) { $('#tabHome').setAttribute('aria-current', 'page'); await viewHome(v); }
    else if (arg == null && /^[gic]$/.test(kind)) viewMissing(v); // 깨진 주소 = 없는 주소
    else if (kind === 'list') { $('#tabList').setAttribute('aria-current', 'page'); viewList(v); }
    else if (kind === '36') { location.replace('#/'); return; } // 지운 화면(사장님 2026-10-13 06:45 「영구 삭제」) — 옛 주소는 첫 화면으로
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
  document.querySelector('.tabbar')?.addEventListener('click', e => { const a = e.target.closest('a[href^="#/"]'); if (!a) return; if (a.getAttribute('href') === '#/') { state.hub = 0; state.hubStop = false; state.hubDet = false; hubGo?.(0); } /* 「한눈에」를 누르면 슬라이드 1장부터 다시 넘어감(뒤로 가기는 보던 장 · 멈춤 그대로) */ if (a.getAttribute('href') === (location.hash || '#/')) { e.preventDefault(); window.scrollTo({top: 0, behavior: RM.matches ? 'auto' : 'smooth'}); } });
  try { D.core = await getJson('core.json'); $('#tabList').textContent = '업종 ' + D.core.industries.length; }
  catch (e) { console.error(e); const v = $('#view'); v.textContent = ''; const again = h('button', {class: 'play', type: 'button', text: '다시 열기'}); again.addEventListener('click', () => location.reload()); v.append(MO.catSleep(72), h('h1', {class: 'head', text: '자료를 못 읽었습니다'}), h('p', {class: 'count', text: '? 잠시 뒤 다시 열어 주세요.'}), again); return; }
  await route();
  setTimeout(() => { needComp().catch(() => {}); }, 400);
}
boot();
