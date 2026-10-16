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
// 영어 팩(사장님 2026-10-15(싱가포르) 23:35 「언어팩을 선태기하면 아틀란스가 영어로 나오게 하라」) — 그려진 한국어를 틀로 바꿈(site/atlas/i18n.js) · 화면 코드는 한국어 그대로
import {ON as EN, EN_READY, startI18n, t as L, switchLang, nameEn} from './i18n.js';
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
const state = {mode: 'eq', played: false, font: 0}; // 맨 위 슬라이드 7장(hub · hubStop · hubDet)은 2026-10-15 먹빛 첫 화면으로 바뀌어 지움(규칙 67)

// ── 숫자 · 말 ──
const r1 = x => Math.sign(x) * Math.floor(Math.abs(x) * 10 + 0.5 + 1e-7) / 10; // 반올림은 크기로(−7.25 → −7.3 · +7.25 → +7.3 — 같은 크기는 부호와 상관없이 같게 · 다른 눈 점검 2026-10-15 · 틀림 장부 34번과 같은 일)
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
const TOK0 = {up: '#FF5A65', down: '#5B96FF', gold: '#E9B949', ink: '#F2EFE8', night: '#0C0E12', mute: '#8E959F', sub: '#B0B5BD', violet: '#D9D4C9', 'violet-ink': '#D8DCE2', 'm4-soft': '#1C1F26', 'm4-line': '#272B34', 'm4-neu': '#6F7782'}; // 먹빛(2026-10-15 12:43 「모든 화면을 바꿔」 — atlas.css :root 와 같은 값 · 꾸밈 파일을 못 읽을 때만)
function tok() { const s = getComputedStyle(document.documentElement), o = {}; for (const k of Object.keys(TOK0)) o[k] = s.getPropertyValue('--' + k).trim() || TOK0[k]; return o; }
/** 숫자 카드 — 긴 숫자(+2,920%)가 카드 밖으로 넘치면 한 단 작게(애플팀: 넘치거나 잘리지 않게 · 숫자는 그대로) */
function fitNums(box) { const go = () => { for (const b of box.querySelectorAll('b')) { b.classList.remove('fit'); if (b.scrollWidth > b.clientWidth + 1) b.classList.add('fit'); } }; go(); document.fonts?.ready.then(() => { if (box.isConnected) go(); }); }
/** 선 아래 · 위 면(기준선까지 닫은 길) — 값이 빈 날은 끊음 */
function areaPath(arr, X, Y, by) { let d = '', seg = []; const flush = () => { if (seg.length) d += 'M' + X(seg[0]).toFixed(1) + ' ' + by.toFixed(1) + seg.map(i => 'L' + X(i).toFixed(1) + ' ' + Y(arr[i]).toFixed(1)).join('') + 'L' + X(seg[seg.length - 1]).toFixed(1) + ' ' + by.toFixed(1) + 'Z'; seg = []; }; arr.forEach((y, i) => { if (y == null) flush(); else seg.push(i); }); flush(); return d; }
/** 기준선 위 빨강 · 아래 파랑 옅은 면(판판한 번짐 — 입체 아님) */
function fadeDefs(defs, id, T, P, H, by) {
  const gu = sv('linearGradient', {id: id + 'gu', gradientUnits: 'userSpaceOnUse', x1: 0, y1: P, x2: 0, y2: by}); gu.append(sv('stop', {offset: 0, 'stop-color': T.up, 'stop-opacity': 0.14}), sv('stop', {offset: 1, 'stop-color': T.up, 'stop-opacity': 0}));
  const gd = sv('linearGradient', {id: id + 'gd', gradientUnits: 'userSpaceOnUse', x1: 0, y1: by, x2: 0, y2: H - P}); gd.append(sv('stop', {offset: 0, 'stop-color': T.down, 'stop-opacity': 0}), sv('stop', {offset: 1, 'stop-color': T.down, 'stop-opacity': 0.14}));
  defs.append(gu, gd);
}
/** 그림 눈금(2026-10-15 먹빛 예술 · 데이터 눈) — 첫 화면 시장 그림과 같은 꼴: 글은 그림 오른쪽 칸 · 가는 가로선 · 기준선은 점선
 *  눈금 글 = 「좋은 수」(틀 값 — 위아래 여백을 더한 값 — 을 글로 쓰지 않음 · 옛 「105 · 76」은 실제 값이 아니었음) */
const TSTEP = [0.1, 0.2, 0.5, 1, 2, 5, 10, 20, 25, 50, 100, 200, 500, 1000, 2000, 5000, 1e4, 2e4, 5e4, 1e5, 2e5, 5e5, 1e6];
function niceTicks(lo, hi, max = 4) { let s = TSTEP.at(-1); for (const x of TSTEP) if ((hi - lo) / x <= max) { s = x; break; } const t = []; for (let a = Math.ceil(lo / s - 1e-9) * s; a <= hi + 1e-9; a += s) t.push(Math.round(a * 1000) / 1000); return t; }
const remPx = () => parseFloat(getComputedStyle(document.documentElement).fontSize) || 21;
const AXR = () => Math.round(remPx() * 3.05); // 오른쪽 눈금 칸 넓이 — 글씨 크기를 따라감(첫 화면 m4market padR 와 같음)
function gutterAxis(svg, wrap, {ticks, Y, x0, x1, base, fmt}) {
  const T = tok(), lab = h('div', {class: 'yr', 'aria-hidden': 'true'}), seen = new Set();
  const one = (t, b) => { const y = Y(t); svg.append(sv('line', {x1: x0, x2: x1 + 6, y1: y.toFixed(1), y2: y.toFixed(1), stroke: b ? T.mute : T['m4-soft'], 'stroke-width': 1, 'stroke-dasharray': b ? '2 4' : null}));
    const key = Math.round(y); if ([...seen].some(k => Math.abs(k - key) < 24)) return; seen.add(key); lab.append(st(h('span', {class: 'num', text: fmt(t)}), {top: (y - 11).toFixed(1) + 'px'})); };
  if (base != null) one(base, true); // 기준선은 늘 그림(눈금 글이 겹치면 기준 글을 남김)
  for (const t of ticks) if (base == null || Math.abs(t - base) > 1e-9) one(t, false);
  wrap.append(lab);
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
function needComp() { if (!compP) compP = Promise.all([getJson('comp.json'), getJson('lines.json')]).then(([c, l]) => { D.comp = c.companies; D.lines = l.lines; D.linesAsOf = l.asOf; }).catch(e => { compP = null; throw e; }); return compP; }
// grow.json(회사 성장 요약)은 화면에서 읽지 않음 — 7단부터 회사마다 co/<번호>.json 의 grow 를 씀(자료 따로 세기 · 올린 뒤 확인에는 남음)
function needUpd() { if (!updP) updP = getJson('updates.json').then(u => { D.upd = u; }).catch(e => { updP = null; throw e; }); return updP; }
let surgeP = null; // 급등 탭 자료(surge.json · 규칙 69 — 하루 4번 업데이트 때 고른 그대로)
function needSurge() { if (!surgeP) surgeP = getJson('surge.json').then(s => { D.surge = s; }).catch(e => { surgeP = null; throw e; }); return surgeP; }
function needNames() { if (!namesP) namesP = getJson('names.json').then(n => { D.names = n; prepNames(); }).catch(e => { namesP = null; throw e; }); return namesP; }

// ── 경주판(잡스팀) — 줄 하나 = 갈래 · 업종 · 회사 하나 · 가운데 = 기준일(20거래일 전)과 같음 ──
//   줄마다 작은 선 그래프(사장님 2026-10-13 12:30 「이 사진처럼 그 업종 이라든지 종목에 그래프가 표현되게해」) — 막대 대신 20거래일 선 ·
//   줄마다 제 눈금(사진처럼 모양이 보이게 — 크기는 옆 숫자가 말함) · 점선 = 기준일 값 · 흐린 점선 = 위 단 평균(같은 눈금) · 오르면 빨강 · 내리면 파랑 · 경주 때 선이 날마다 자람
//   items: [{key, name, href, v:[21], cw:[21], badge, gold, pk}] · parent: {v, cw}(흰 점선) · wide: 이름이 긴 줄(두 줄 모양)
//   gold = 금빛 이름표 글(고른 곳 · 고른 n곳) · pk = 줄 왼쪽 금빛 띠(고른 회사 · 고른 곳이 든 업종 — 2026-10-14 「나」)
const SPW = 100, SPH = 30; // 줄 선 그래프 viewBox(늘여 그림 · 선 굵기는 그대로)
function race(host, {items, parent, wide = false, label, onTick, onDone, auto = false, n: nDays = null, win = true}) { // win = 맨 위 줄 빛(급등 탭은 끔 — 1등 빛 없음 · 브리핑 눈) // nDays = 줄 선 칸 수(없으면 20거래일 창 · 요즘 오르는 업종 = 1주 6칸)
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
      r.val.textContent = pct(d); r.val.className = 'val num ' + (d == null ? 'q' : cls(d)); // 값이 없는 날 「?」 = 금빛(규칙 53 · 데이터 눈)
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
    if (win && order[0]) { void order[0].row.offsetWidth; order[0].row.classList.add('win'); }
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
  const W = Math.max(260, Math.round(wrap.getBoundingClientRect().width || 320)), H = 222, P = 10, PT = kPick != null ? 34 : 12, padR = AXR(); // 위 띠(PT) = 「고른 날」 글 자리 — 글이 선을 가리지 않게(데이터 눈)
  const vals = [...v, ...(avg || []), 100].filter(x => x != null);
  if (!v.some(x => x != null)) { wrap.append(h('p', {class: 'q', text: `? 이 회사 ${C.days}거래일 값을 못 읽었습니다`})); return; }
  let lo = Math.min(...vals), hi = Math.max(...vals); const pad = (hi - lo) * 0.06 || 2; lo -= pad; hi += pad;
  const X = i => 4 + i * (W - 4 - padR) / (n - 1), Y = y => PT + (hi - y) * (H - PT - P) / (hi - lo);
  const id = 'lc' + (++lcN), T = tok();
  const svg = sv('svg', {viewBox: `0 0 ${W} ${H}`, width: W, height: H, role: 'img', 'aria-label': label});
  const defs = sv('defs');
  const cu = sv('clipPath', {id: id + 'u'}); cu.append(sv('rect', {x: 0, y: 0, width: W, height: Y(100)}));
  const cd = sv('clipPath', {id: id + 'd'}); cd.append(sv('rect', {x: 0, y: Y(100), width: W, height: H - Y(100)}));
  defs.append(cu, cd); fadeDefs(defs, id, T, PT, H, Y(100)); svg.append(defs);
  gutterAxis(svg, wrap, {ticks: niceTicks(lo, hi), Y, x0: 4, x1: W - padR, base: 100, fmt: String}); // 눈금 = 기준일 100 과 같은 단위(「9월 9일 = 100」) · 100 은 점선
  const ad = areaPath(v, X, Y, Y(100));
  svg.append(sv('path', {d: ad, fill: `url(#${id}gu)`, 'clip-path': `url(#${id}u)`}), sv('path', {d: ad, fill: `url(#${id}gd)`, 'clip-path': `url(#${id}d)`}));
  if (kPick != null) svg.append(sv('line', {x1: X(kPick), x2: X(kPick), y1: PT - 4, y2: H - P + 4, stroke: T.gold, 'stroke-width': 2}));
  const path = arr => { let d = '', on = false; arr.forEach((y, i) => { if (y == null) { on = false; return; } d += (on ? 'L' : 'M') + X(i).toFixed(1) + ' ' + Y(y).toFixed(1); on = true; }); return d; };
  if (avg) svg.append(sv('path', {d: path(avg), fill: 'none', stroke: T.mute, 'stroke-width': 1.5, 'stroke-dasharray': '4 3', 'stroke-linecap': 'round'})); // 업종 평균 = 회색 점선(줄 선 · 범례와 같은 꼴)
  const d = path(v);
  svg.append(sv('path', {d, fill: 'none', stroke: T.up, 'stroke-width': 2, 'stroke-linejoin': 'round', 'stroke-linecap': 'round', 'clip-path': `url(#${id}u)`}));
  svg.append(sv('path', {d, fill: 'none', stroke: T.down, 'stroke-width': 2, 'stroke-linejoin': 'round', 'stroke-linecap': 'round', 'clip-path': `url(#${id}d)`}));
  const lastK = v.map((x, i) => (x == null ? -1 : i)).filter(i => i >= 0).pop();
  svg.append(sv('circle', {cx: X(lastK), cy: Y(v[lastK]), r: 4.5, fill: v[lastK] >= 100 ? T.up : T.down, stroke: T.night, 'stroke-width': 2}));
  const cx = sv('line', {y1: PT, y2: H - P, stroke: T.ink, 'stroke-opacity': 0.6, 'stroke-width': 1}), dot = sv('circle', {r: 5, fill: T.ink, stroke: T.night, 'stroke-width': 2});
  cx.setAttribute('visibility', 'hidden'); dot.setAttribute('visibility', 'hidden'); svg.append(cx, dot);
  wrap.prepend(svg);
  const tip = h('div', {class: 'tip num'}); tip.hidden = true; wrap.append(tip);
  if (kPick != null) { const pick = h('span', {class: 'yl', text: '고른 날'}); pick.style.top = '0'; wrap.append(pick); const pw = pick.offsetWidth || 76; pick.style.left = Math.max(0, Math.min(W - pw, X(kPick) - pw - 6)) + 'px'; } // 금빛 세로선 왼쪽 위 띠 — 넓이를 재어 자리(글씨가 커져도 선을 덮지 않게 · 장인 눈 L4)
  wrap.append(h('div', {class: 'ax'}, h('span', {text: md(C.dates[0]) + ' = 100'}), h('span', {text: md(C.dates[n - 1])})));
  const mv = e => { const r = svg.getBoundingClientRect(), x = (e.clientX - r.left) * W / r.width; let i = Math.round((x - 4) / ((W - 4 - padR) / (n - 1))); i = Math.max(0, Math.min(n - 1, i)); if (v[i] == null) return;
    cx.setAttribute('x1', X(i)); cx.setAttribute('x2', X(i)); cx.setAttribute('visibility', 'visible'); dot.setAttribute('cx', X(i)); dot.setAttribute('cy', Y(v[i])); dot.setAttribute('visibility', 'visible');
    tip.hidden = false; tip.textContent = md(C.dates[i]) + ' · ' + pct(v[i] - 100); tip.style.left = Math.min(r.width - 80, Math.max(80, X(i) * r.width / W)) + 'px'; };
  const lv = () => { cx.setAttribute('visibility', 'hidden'); dot.setAttribute('visibility', 'hidden'); tip.hidden = true; };
  svg.addEventListener('pointermove', mv); svg.addEventListener('pointerdown', mv); svg.addEventListener('pointerleave', lv);
}

// ── 공통 조각 ──
function foot({src = null} = {}) { // src = 그 화면만의 자료 줄(급등 탭 — 규칙 69 · 없으면 사이트 바탕 회사 줄)
  const C = D.core;
  return h('footer', {class: 'foot'}, footFriends(),
    h('p', {class: 'links'}, h('a', {href: '/hello.html', text: '친구에게 소개하기'}), h('a', {href: '/us/', text: '미국 판'})), // 「옛 ATLAS」 고리는 옛 판 영구 삭제(2026-10-15 23:35)로 뺌
    h('p', {text: src ? `자료: ${C.sources.price} · ${src}.` : `자료: ${C.sources.price} · 기준일 = 마지막 종가 날(${md(C.asOf)})의 ${C.days}거래일 전(${md(C.base)}) · ${pickName(C)} — ${pickHow(C)}(그 뒤 주가는 안 씀).`}),
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
// ── 첫 화면 여섯 장(2026-10-12 18:31) → 맨 위 슬라이드 7장(19:59 · 20:11) → 먹빛 첫 화면(2026-10-15 09:41 · 규칙 67 — 아래 「첫 화면 = 먹빛 판」 머리 글) ──
let homeP = null;
function needHome() { if (!homeP) homeP = getJson('home.json').then(x => { D.home = x; }).catch(() => { D.home = null; homeP = null; }); return homeP; }
const mdw = d => { const x = new Date(d + 'T00:00:00Z'); return `${md(d)}(${DOW[x.getUTCDay()]})`; };
const numK = (v, k = 2) => (v == null ? '?' : Number(v).toLocaleString('ko-KR', {minimumFractionDigits: k, maximumFractionDigits: k}));
/** 억 원 → 「1조 7,507억 원」 */
const eokW = v => { if (v == null) return '?'; const a = Math.abs(Math.round(v)), jo = Math.floor(a / 10000), r = a % 10000; return (jo ? jo.toLocaleString('ko-KR') + '조' + (r ? ' ' : '') : '') + (r || !jo ? r.toLocaleString('ko-KR') + '억' : '') + ' 원'; };
const add = (v, ...xs) => v.append(...xs.filter(Boolean)); // 없는 조각(null)을 글 「null」로 붙이지 않게
/** 길이 · 자리는 CSSOM 으로(보안 규칙 CSP style-src 'self' — style 속성 글은 막힘) */
const st = (el, css) => { Object.assign(el.style, css); return el; };
/** 보는 사람의 서울 때(ISO) — 「오늘」은 값의 날짜가 이 날짜와 같을 때만(다음 날 아침에 어제 값을 「오늘」이라 하지 않음 · CIA팀 2026-10-12 18:31) */
const kstNow = () => new Date(Date.now() + 9 * 36e5).toISOString();
/** 장 중 말 — 정규장(9:00 ~ 15:30)에 받은 값이고 지금도 그 장 안이면 「장 중」 · 그 장이 지났으면 「장 중에 받은 값」 · 장 밖에 받았으면 「장 끝 값」 */
const inSession = H => { if (!H?.live) return false; const n = kstNow(), t = n.slice(11, 16); return n.slice(0, 10) === String(H.kst ?? '').slice(0, 10) && t >= '09:00' && t < '15:30'; };
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
/** 「오늘 업종」 줄 → ATLAS 업종 화면(7단 중 2단 · 사장님 2026-10-14 15:01(싱가포르) 「여기 클릭 하면 7단구조 나오게해」) — 네이버 업종 이름 → core.secInd(그 네이버 업종 회사가 가장 많이 든 업종 · site_build 셈 · site_verify 따로 셈) · 없으면 고리 없음 */
const secHref = name => { const n = D.core?.secInd?.[String(name ?? '').replace(/\s+/g, '')], i = n ? D.core.industries?.find(x => x.name === n) : null; return i ? hrefInd(i) : null; };

// ── 첫 화면 = 먹빛 판(사장님 2026-10-15(싱가포르) 09:41 「(나)는 아니야 너가 제일 스마트하게 만들어 지금까지 만든것보다 더 월등하게 … 만배는 더 스마트 한게 만들어」 · 규칙 67) ──
//   앞 질문 (가) 「사이트 첫 화면을 가장 공들인 판으로 바꿔요」 — 샘플 11가지 가운데 4번 「밤 화면 · 먹」을 07:37 · 07:57 · 08:19 · 08:33 · 09:02 말씀으로 다듬은 판(v4g)을 사이트로
//   맨 위 슬라이드 7장(2026-10-12 19:59 · 20:11)은 이 판으로 바뀜 — 한 장을 내려 읽음:
//     사장님 편지(글자 그대로 · 열면 홍표 5초 — 규칙 66) → 시장 → 오른 곳과 내린 곳(오늘 강한 · 약한 업종 셋씩) → 요즘 오르는 업종(1주 · 규칙 64) → 사고팔기 → 미국 →
//     고른 곳(크게 움직인 곳) → 큰 갈래(7단 중 1단 · 1번이면 닿음) → 봉인 → 홍표 도장 · 맨 아래
//   똑똑한 것(「만배는 더 스마트」):
//     ① 오늘 한 줄 = 평소(앞 20거래일 하루 움직임 크기의 평균)와 견줌 · 언제 뒤 가장 큰지 · 며칠 잇달았는지(gauge — 지난 사실만 · 다음 날 말 없음)
//     ② 미리 정한 문턱(home-v3)을 넘은 날만 금빛 「!」 — 조용한 날은 아무것도 안 띄움
//     ③ 고른 곳: 가장 많이 오른 곳 · 가장 많이 내린 곳 / 제 평소의 2.5배 이상 움직인 곳(lines.json 20거래일 · 지수 「!」와 같은 2.5배) → 회사 화면(7단 중 3단)
//     ④ 못 받은 값은 받은 때마다 「?」 한 줄(그때 못 받은 조각을 모두 적음) + 그 칸 머리 때 앞 금빛 「?」 · 장 중에 받은 값은 받은 때까지라고 말함 · 「오늘」은 보는 날이 값의 날일 때만
//     ⑥ 한 칸이 자료 탓에 멈춰도 그 칸만 「?」(다른 칸은 그대로) · 다른 눈 점검(2026-10-15 11:5x 서울 · 스무 가지)을 모두 고침
//     ⑤ 고른 지수(코스피 · 코스닥) · 기간(1주 · 1달 · 3달)은 이 기기에 기억(localStorage — 못 쓰면 처음 값) · 사고팔기도 고른 지수를 따라감
//   먹빛 색은 모든 화면(atlas.css :root — 2026-10-15 12:43 사장님 「모든 화면을 바꿔」 = 여쭘 (나)) · html.m4 는 첫 화면 꾸밈만(「먹빛 첫 화면」 묶음)
//   빨강 · 파랑은 오름 · 내림에만(사고팔기 막대는 한 색 · 규칙 53) · 금빛은 고른 곳 · 문턱 「!」에만 · 그림자 · 입체 · 캔버스 · 바둑판 없음(규칙 50 · 51) · 움직임 줄이기면 움직임 없음
//   보안 규칙(CSP style-src 'self'): 글 속 style 없음 — 자리 · 길이는 CSSOM(st · el.style)
const HELLO_PROMO = '3명만 소개해도 스타벅스 상품권 1만원!'; // 2026-10-16 21:35(싱가포르) 「3명만 추천해도 1만원 스타벅스 준다고 대수정을 해」(규칙 62 · 옛 10명) // 2026-10-14 18:19(싱가포르) 「스타벅스 상품권 1만원 이라고 해 1장이 아니라」(규칙 62)
// 사장님 글(2026-10-13 05:42 「앵무새 그게 있는곳에 글 제대로 딱 올려 알겠지 이대로 올려」 · 10-14 15:19 · 15:54 · 17:13 · 17:16 · 17:17) — 글자 · 띄어쓰기 그대로
const HELLO_MSG = ['아틀란스 주식 격언 열 가지', '1. 쉬는 것도 투자다. 안 사는 날이 더 많아야 합니다.', '2. 잃지 않는 게 버는 거다. 돈을 불리기 전에 먼저 지킵니다.', '3. 사기 전에 팔 곳부터 정해라. 떨어지면 어디서 팔지 미리 정합니다.', '4. 모두가 웃을 때 나는 늦었다. 다들 좋다고 떠들면 이미 비싼 겁니다.', '5. 헷갈리면 안 사는 게 답이다. 애매하면 그냥 넘깁니다.', '6. 자신 없으면 조금만. 확신이 없으면 내 돈의 열에 하나까지만.', '7. 시장이 흔들리면 나는 멈춘다. 크게 출렁이는 날은 쉽니다.', '8. 손해는 짧게, 이익은 길게. 떨어지면 빨리 팔고, 오르면 오래 들고 갑니다.', '9. 돈이 가는 길을 따라가라. 돈이 몰리는 업종에서만 고릅니다.', '10. 기회는 찾아오는 거지, 만드는 게 아니다. 억지로 사지 말고 좋은 때를 기다립니다.']; // 1장 사장님 글 — 2026-10-16 20:08(싱가포르) 「아틀란스 주식 격언 열 가지 … 하규 안이사 인사 자리에 이글을 올려」 · 20:15 「가」(편지 전체를 바꿈) · 글자 그대로
// 열면 홍표(규칙 66 · 2026-10-15 04:10 「열면 홍표 니오게 해」 · 05:05 「첫화면 5초 있다 움직여」 → 06:01 「가」) — 처음 그릴 때 한 번:
//   달이 떠오르고 홍표 + 「홍표!」 세 번(0.6 · 1.5 · 2.4초) → 4.2초에 큰 홍표와 달이 편지 끝 달 속 제자리로 날아가 앉음(0.8초) → 5초에 사장님 글이 한 줄씩 써짐
//   시계는 화면에 붙어 그려지는 때부터 · 움직임 줄이기면 없음(바로 글) · 다시 첫 화면에 와도 다시 안 함(새로 열 때만)
const INTRO_FLY = 4200, INTRO_LAND = 800; // 날기 시작 · 나는 때(합 5초 = 홍표 5초)
let helloIntro = true;
const M4 = {idx: 0, per: 60}; // 고른 지수(0 코스피 · 1 코스닥) · 기간(점 수 6 · 21 · 60 = 1주 · 1달 · 3달)
const M4PER = [[6, '1주'], [21, '1달'], [60, '3달']];
function m4load() { try { const k = localStorage.getItem('atlas:m4idx'), p = +localStorage.getItem('atlas:m4per'); if (k === '0' || k === '1') M4.idx = +k; if (M4PER.some(x => x[0] === p)) M4.per = p; } catch { /* 저장 못 함 — 처음 값 */ } }
function m4save() { try { localStorage.setItem('atlas:m4idx', String(M4.idx)); localStorage.setItem('atlas:m4per', String(M4.per)); } catch { /* 저장 못 함 */ } }
// ── 말 ──
/** 받침 — 한글은 글자로 · 숫자 끝은 소리로(0 영 · 1 일 · 3 삼 · 6 육 · 7 칠 · 8 팔) · % 는 「퍼센트」(받침 없음) */
const hasB = w => { const c = String(w).trim().slice(-1), k = c.charCodeAt(0) - 0xAC00; return k >= 0 && k <= 11171 ? k % 28 !== 0 : '013678'.includes(c); };
const jo = (w, a, b) => w + (hasB(w) ? a : b);
const NB = ' ';
const a1 = x => pct(x).replace(/^[+−]/, ''); // 부호 뺀 한 자리 %(반올림은 pct 하나 — 같은 값이 두 곳에서 다르게 보이지 않게)
const p2 = v => (v == null ? '?' : (v > 0 ? '+' : v < 0 ? '−' : '') + Math.abs(v).toFixed(2) + '%'); // 지수 하루(자료가 둘째 자리까지)
const isDay = d => /^\d{4}-\d{2}-\d{2}/.test(String(d ?? ''));
const isTime = t => /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}/.test(String(t ?? ''));
const ampm = t => { if (!isTime(t)) return '?'; const hh = +t.slice(11, 13), mm = t.slice(14, 16); return `${hh < 12 ? '오전' : '오후'}${NB}${hh % 12 || 12}:${mm}`; };
const dayK = d => (!isDay(d) ? '?' : String(d).slice(0, 10) === kstNow().slice(0, 10) ? '오늘' : md(String(d).slice(0, 10))); // 「오늘」은 보는 사람의 서울 날짜가 값의 날일 때만(다음 날 아침 · CIA팀)
const onDay = d => (!isDay(d) ? '' : dayK(d) === '오늘' ? '오늘은' : `${md(String(d).slice(0, 10))}에는`); // 「오늘은」 · 「10월 13일에는」 · 날이 없으면 빈 글
const tillT = t => `${dayK(t.slice(0, 10))} ${ampm(t)}까지`; // 「오늘 오전 10:06까지」 · 「10월 12일 오후 2:59까지」 — 장 중에 받은 값은 받은 때까지라고 말함(「지금까지」라 하지 않음)
/** 장 중에 받은 값이고 그 값의 날이 받은 날일 때만 「… 까지」(장 열자마자 받아 아직 어제 값이면 그 값의 날로 말함) */
const tillOk = (w, d) => w.intra && isTime(w.t) && (!isDay(d) || w.t.slice(0, 10) === String(d).slice(0, 10));
/** 평소의 몇 배 — 2.5배 문턱(home-v3 · 고른 곳 2.5배) 바로 밑(2.40 ~ 2.49)은 둘째 자리 버림(2.47배) — 「2.5배」로 보이는데 「!」가 없는 일이 없게 */
const timesW = r => (r >= 2.4 && r < 2.5 ? String(Math.floor(r * 100 + 1e-9) / 100) : (r >= 10 ? Math.round(r) : Math.round(r * 10) / 10).toLocaleString('ko-KR'));
const usualW = r => (r == null ? '' : r >= 1.25 ? `평소의${NB}${timesW(r)}배` : r >= 0.8 ? '평소만큼' : '평소보다 작게');
/** 이름 — 「·」 · 「및」 · 「와」 · 「과」 · 「,」 뒤에서만 줄을 바꿀 수 있게(<wbr>) · 낱말 가운데서 끊기지 않게(네이버 업종 이름은 띄어쓰기가 없음) */
function nameEl(t, cls = 'nm') { // 「·」 앞은 붙임(U+2060 — 「도구 / ·서비스」처럼 「·」로 줄이 시작하지 않게 · 글 맞대기는 U+2060 을 빼고 봄)
  if (EN) return h('span', {class: cls, text: String(t)}); // 영어 화면 — 이름을 한 글 마디로(사전이 이름을 통째로 바꿈 · 영어는 띄어쓰기에서 줄이 바뀜 · 2026-10-16 올린 뒤 탐침: 「생명과 | 학도구및 | 서비스」로 나뉘어 영어로 못 바꾼 것)
  const e = h('span', {class: cls}), parts = String(t).replace(/·/g, '\u2060·').split(/(?<=[·,]|및|와|과)/);
  parts.forEach((p, i) => { e.append(p); if (i < parts.length - 1) e.append(h('wbr')); });
  return e;
}
/** 글 속 「·」 — 줄 첫머리가 「·」가 되지 않게: 띄운 「 · 」는 앞 칸을 붙임(NBSP) · 붙은 「X·Y」는 「·」 앞에 U+2060(다른 눈 두 번째 점검 2026-10-15) */
const tx = s => String(s).replace(/ · /g, NB + '· ').replace(/([^\s])·(?=[^\s])/g, '$1\u2060·').replace(/([」%])(?=[가-힣])/g, '$1\u2060'); // 「…」 · % 뒤 토씨도 붙임(「…」|는 · 0%|로 로 끊기지 않게)
/** 조각(idx · sectors · flows · us)을 받은 때 — t = 받은 때(못 받았으면 앞 값의 때) · intra = 장 중(서울 9:00 ~ 15:30)에 받은 값 · now = 지금도 그 장 안
 *  live 는 그 조각 자신의 값(지수 x.live · 사고판 돈 F.live) — 없으면 제때 받은 조각은 home.json live · 못 받은 조각은 받은 때로 셈(다른 조각 값을 빌리지 않음) */
function whenOf(H, k, live) {
  const s0 = H?.stale?.[k], ok = isTime(s0), t = (ok ? s0 : H?.kst ?? '').slice(0, 16);
  const intra = ok ? (live ?? (t.slice(11, 16) >= '09:00' && t.slice(11, 16) < '15:30')) : !!(live ?? H?.live);
  return {t, stale: !!s0, intra, now: !s0 && intra && inSession(H)};
}
/** 칸 머리 오른쪽 때 — 「오늘 오전 10:06 · 장 중」 · 「10월 12일 오후 2:59」 · 「10월 13일 장 마감」 */
const whenMeta = (w, date) => (w.now ? `${dayK(w.t)} ${ampm(w.t)}${NB}· 장${NB}중` : w.intra ? (isTime(w.t) ? `${dayK(w.t)} ${ampm(w.t)}` : isDay(date) ? dayK(date) : '?') : isDay(date) ? `${dayK(date)} 장${NB}마감` : '?'); // 장 중에 받았는데 받은 때를 모르면 날만(「장 마감」이라 하지 않음)
/** 「?」 줄 계획(다른 눈 점검 2026-10-15 H1 · M1) — 받은 때마다 한 줄 · 그때 못 받은 조각을 모두 적어 그중 첫 칸에 · 못 받은 칸은 머리 때 앞에 금빛 「?」
 *  제때 받았지만 장 중에 받은 값(지금은 장 밖)은 「장 중에 받은 값 …」 한 줄을 첫 칸에 한 번 · 칸을 다시 그려도(사고팔기 지수 바꿈) 같은 줄 */
const STALE_NM = {idx: '지수', sectors: '업종', flows: '사고판 돈', us: '미국 지수'}, NOTE_ORDER = ['idx', 'sectors', 'flows', 'us'];
let m4notes = {};
/** 선을 그릴 수 있는 지수 조각(종가 둘 이상 · 모두 0 보다 큼) — 못 그리면 없는 것으로(다른 눈 M3) */
const idxOk = x => (x && Array.isArray(x.rows) && x.rows.length >= 2 && x.rows.every(r => Array.isArray(r) && r[1] > 0) ? x : null);
const US3 = ['INX', 'IXIC', 'DJI'], usRows = U => (Array.isArray(U?.rows) ? U.rows.filter(r => US3.includes(r?.key)) : []);
/** 칸에 보이는 조각만(없는 조각은 그 칸이 「? 이번에 … 못 받았어요」 한 줄 · 「?」 줄 계획과 칸 머리 「?」가 같은 잣대) */
const hasPiece = (H, k) => (k === 'idx' ? !!(idxOk(H?.idx?.KOSPI) || idxOk(H?.idx?.KOSDAQ)) : k === 'sectors' ? !!H?.sectors : k === 'flows' ? !!(H?.flows?.KOSPI || H?.flows?.KOSDAQ) : usRows(H?.us).length > 0);
function planNotes(H) {
  const out = {}, by = new Map(), live = {idx: (H?.idx?.KOSPI ?? H?.idx?.KOSDAQ)?.live, sectors: undefined, flows: H?.flows?.live, us: false};
  for (const k of NOTE_ORDER) { const t = H?.stale?.[k]; if (!t || !hasPiece(H, k)) continue; const key = isTime(t) ? t.slice(0, 16) : '?'; if (!by.has(key)) by.set(key, []); by.get(key).push(k); }
  for (const [t, ks] of by) { const nm = ks.map(k => STALE_NM[k]), intra = t !== '?' && ks.some(k => k !== 'us' && whenOf(H, k, live[k]).intra);
    out[ks[0]] = h('p', {class: 'q m4-q', text: tx(`? 이번에 ${nm.slice(0, -1).map(x => x + ' · ').join('')}${jo(nm.at(-1), '을', '를')} 못 받아 ${t === '?' ? '앞 값을 그대로 보여요.' : `${md(t.slice(0, 10))} ${ampm(t)}에 받은 값이에요.`}${intra ? ` ${ks.includes('us') ? '한국 값은 ' : ''}장 중 값이라 마감 값과 다를 수 있어요.` : ''}`)}); }
  const fk = NOTE_ORDER.find(k => k !== 'us' && !H?.stale?.[k] && hasPiece(H, k) && !out[k] && (() => { const w = whenOf(H, k, live[k]); return w.intra && !w.now; })());
  if (fk) out[fk] = h('p', {class: 'm4-cap', text: '장 중에 받은 값이라 마감 값과 다를 수 있어요.'});
  return out;
}
const noteFor = k => m4notes[k] ?? null;
// ── 그림 조각 ──
const ICON = {
  send: () => { const s = sv('svg', {width: 22, height: 22, viewBox: '0 0 24 24', 'aria-hidden': 'true'}); s.append(sv('path', {d: 'M3 11.5 21 4l-7.5 18-2.5-7.5z', fill: 'none', stroke: 'currentColor', 'stroke-width': 1.6, 'stroke-linejoin': 'round'}), sv('path', {d: 'm11 14.5 4-4', stroke: 'currentColor', 'stroke-width': 1.6, 'stroke-linecap': 'round'})); return s; },
  gift: () => { const s = sv('svg', {class: 'm4-gi', width: 22, height: 22, viewBox: '0 0 24 24', 'aria-hidden': 'true'}); s.append(sv('rect', {x: 3.5, y: 9, width: 17, height: 11.5, rx: 2, fill: 'none', stroke: 'currentColor', 'stroke-width': 1.6}), sv('path', {d: 'M3.5 13h17M12 9v11.5M12 9c-1.5-4-6-4-6-1.5S12 9 12 9zm0 0c1.5-4 6-4 6-1.5S12 9 12 9z', fill: 'none', stroke: 'currentColor', 'stroke-width': 1.6, 'stroke-linejoin': 'round'})); return s; },
};
/** 칸 머리 — 달 속 막비(::before 바탕 그림) + 제목 + 오른쪽 때(못 받은 값이면 앞에 금빛 「?」) · h1 은 시장 칸 하나 · 나머지 h2 */
function m4head(tag, title, meta, id, q = false) {
  return h('div', {class: 'm4-sh'}, h(tag, {class: tag === 'h1' ? 'head m4-t' : 'm4-t', id}, title), meta ? h('span', {class: 'm4-meta'}, q ? h('b', {class: 'm4-mq', text: '?' + NB}) : null, meta) : null);
}
const m4lead = (t, cls = '') => h('p', {class: 'm4-lead' + (cls ? ' ' + cls : '')}, typeof t === 'string' ? tx(t) : t);
/** 「어떻게 셌나요?」 — 칸 이름을 화면 읽기에 함께(여섯 칸이 같은 글이라 구분되게) */
const m4how = (what, ...ps) => h('details', {class: 'm4-how'}, h('summary', {'aria-label': `${what} — 어떻게 셌나요?`, text: '어떻게 셌나요?'}), h('div', {class: 'm4-in'}, ...ps.map(t => h('p', {text: tx(t)}))));
/** 화면에 들어오면 한 번 — 막대가 자라고 · 선이 그려지고 · 숫자가 세어 오름(움직임 줄이기면 바로 끝 모양) */
function m4io(el, f) {
  if (RM.matches || !('IntersectionObserver' in window)) { el.classList.add('in'); f?.(true); return; }
  el.classList.add('io'); const ob = new IntersectionObserver(es => { for (const x of es) if (x.isIntersecting) { ob.disconnect(); el.classList.add('in'); f?.(false); } }, {threshold: 0.25}); ob.observe(el);
}
function countUp(el, to, still) { const end = to.toLocaleString('ko-KR'); if (still) { el.textContent = end; return; } const t0 = performance.now(), T = 1200; const fr = t => { if (!el.isConnected) return; const u = Math.min(1, (t - t0) / T), e = 1 - (1 - u) ** 3; el.textContent = Math.round(to * e).toLocaleString('ko-KR'); if (u < 1) requestAnimationFrame(fr); else el.textContent = end; }; el.textContent = '0'; requestAnimationFrame(fr); }

// ── ① 사장님 편지 ──
function m4letter() {
  const intro = helloIntro && !RM.matches; helloIntro = false;
  const msg = h('span', {class: 'hmsg m4-msg', lang: 'ko'}, ...HELLO_MSG.map(t => h('span', {class: 'hml', text: t})), h('i', {class: 'm4-moon', 'aria-hidden': 'true'}),
    h('img', {class: 'm4-hp', src: '/media/makbi-hello.svg', alt: '', width: 88, height: 110, decoding: 'async', 'aria-hidden': 'true'}));
  const stars = h('span', {class: 'm4-stars', 'aria-hidden': 'true'}, ...[0, 1, 2, 3, 4, 5, 6].map(() => h('i')));
  const cut = HELLO_PROMO.indexOf('스타벅스'); // 「스타벅스 상품권 1만원!」은 한 줄에(규칙 62)
  const a = h('a', {class: 'hello m4-letter', href: '/hello.html'}, stars, msg,
    h('span', {class: 'm4-act'}, h('span', {class: 'm4-ic'}, ICON.send()), h('span', {class: 'm4-aw'}, h('b', {text: '친구에게 소개하기'}), h('span', {}, '보드리 35초 ', h('span', {class: 'nb', text: '영상 · 보내기'}))), h('i', {class: 'm4-chev', 'aria-hidden': 'true', text: '›'})),
    h('span', {class: 'm4-gift'}, ICON.gift(), h('span', {}, HELLO_PROMO.slice(0, cut), h('span', {class: 'nb', text: HELLO_PROMO.slice(cut)}))));
  if (!intro) return a;
  a.classList.add('intro');
  const pi = h('span', {class: 'hpi', 'aria-hidden': 'true'}, h('i', {class: 'm4-bm'}), h('img', {class: 'hpi-bird', src: '/media/makbi-hello.svg', alt: '', width: 240, height: 300, decoding: 'async'}),
    ...['b1', 'b2', 'b3'].map(k => h('b', {class: 'hpi-b ' + k, text: '보드리!'})));
  a.append(pi);
  let done = false;
  const land = () => { if (done) return; done = true; a.classList.remove('intro', 'flying'); a.classList.add('rv', 'landed'); pi.remove(); if (a.isConnected) document.dispatchEvent(new Event('m4:landed')); };
  const fly = () => { // 큰 홍표 · 큰 달 → 편지 끝 작은 홍표 · 작은 달 자리로(0.8초) — 「홍표!」 말풍선은 옅어짐
    if (!a.isConnected || done) return;
    const bi = pi.querySelector('img'), si = msg.querySelector('.m4-hp'), bm = pi.querySelector('.m4-bm'), sm = msg.querySelector('.m4-moon');
    if (!bi.animate) { land(); return; }
    a.classList.add('flying');
    for (const x of pi.querySelectorAll('.hpi-b')) x.animate([{opacity: getComputedStyle(x).opacity}, {opacity: 0}], {duration: 260, easing: 'ease-out', fill: 'forwards'});
    for (const [p, q] of [[bi, si], [bm, sm]]) { const r0 = p.getBoundingClientRect(), r1x = q.getBoundingClientRect(); if (!r0.width) continue; let cs = getComputedStyle(p).transform; cs = cs === 'none' ? '' : cs;
      const dx = (r1x.left + r1x.width / 2) - (r0.left + r0.width / 2), dy = (r1x.top + r1x.height / 2) - (r0.top + r0.height / 2), sc = r1x.width / r0.width; p.style.animation = 'none';
      p.animate([{transform: cs || 'none'}, {transform: `translate(${dx.toFixed(1)}px,${dy.toFixed(1)}px) ${cs} scale(${sc.toFixed(4)})`}], {duration: INTRO_LAND, easing: 'cubic-bezier(.55,0,.2,1)', fill: 'forwards'}); }
    setTimeout(land, INTRO_LAND);
  };
  let tries = 0;
  const start = () => { if (!a.isConnected) { if (++tries < 600) requestAnimationFrame(start); else land(); return; } setTimeout(fly, INTRO_FLY); setTimeout(land, INTRO_FLY + INTRO_LAND + 1500); }; // 붙은 뒤 첫 그림 때부터 셈 · 마지막 줄(움직임이 안 끝나는 때)
  requestAnimationFrame(start);
  return a;
}

// ── ② 시장 — 오늘 한 줄(평소와 견줌) · 큰 날만 금빛 「!」 · 두 산줄기(같은 눈금 · 고른 기간 첫날 = 0%) ──
/** 오늘 한 줄 — 「10월 12일 오후 2:59까지 코스피는 3.3% 내렸어요. 평소의 2.5배예요. 9월 2일 이후 가장 크게 내렸어요. 4거래일 잇달아 내렸고, 그동안 8.5% 빠졌어요.」 */
function todayWords(nm, X, w) {
  if (!X) return [`? ${nm} 값을 못 받았어요.`];
  const g = gauge(X), when = tillOk(w, X.date) ? tillT(w.t) : dayK(X.date);
  if (!g) return [`${when} ${jo(nm, '은', '는')} ${pct(X.day)}예요.`, '? 3달 값이 모자라 평소와 견주지 못했어요.'];
  const t = g.t, dn = t < 0, did = dn ? '내렸어요' : '올랐어요', out = [];
  if (pct(t) === '0.0%') return [`${when} ${jo(nm, '은', '는')} 거의 그대로였어요.`];
  out.push(`${when} ${jo(nm, '은', '는')} ${a1(t)}${NB}${did}.`);
  if (g.ratio != null) out.push(g.ratio >= 1.25 ? `${usualW(g.ratio)}예요.` : g.ratio >= 0.8 ? '평소만큼 움직였어요.' : '평소보다 작게 움직였어요.');
  if (g.ratio != null && g.ratio >= 1.25) { if (!g.since) out.push(`3달 동안 가장 크게 ${did}.`); else if (g.gap >= 5) out.push(`${md(g.since)} 이후 가장 크게 ${did}.`); }
  if (g.streak >= 3) out.push(`${g.streak}거래일 잇달아 ${dn ? '내렸고' : '올랐고'}, 그동안 ${a1(g.streakChg)}${NB}${dn ? '빠졌어요' : '뛰었어요'}.`);
  return out;
}
/** 큰 날 금빛 「!」(home-v3 · 미리 정한 문턱 — 평소의 2.5배 넘고 1.5% 넘음 · 또는 하루 5% 넘음) — 문턱을 넘은 날만 */
function idxAlerts(H) {
  const ix = (H.alerts ?? []).filter(a => a.kind === 'idx'), out = [], way = xs => (xs.every(a => a.v < 0) ? '내렸어요' : xs.every(a => a.v > 0) ? '올랐어요' : '움직였어요');
  for (const why of ['big', 'usual']) { const xs = ix.filter(a => (a.why ?? 'usual') === why); if (!xs.length) continue;
    out.push(h('p', {class: 'm4-al', text: `! ${xs.length > 1 ? '코스피와 코스닥 모두' : jo(xs[0].name, '이', '가')} ${why === 'big' ? '하루 5% 넘게' : '평소의 2.5배 넘게'} ${way(xs)}.`})); }
  return out;
}
function m4market(v, H) {
  const K = idxOk(H?.idx?.KOSPI), Q = idxOk(H?.idx?.KOSDAQ), XS = [K, Q], NM = ['코스피', '코스닥'];
  if (!XS[M4.idx]) M4.idx = XS[0] ? 0 : 1;
  const w = whenOf(H, 'idx', (K ?? Q)?.live);
  const sec = h('section', {class: 'm4-sec m4-mk', 'aria-labelledby': 'm4-h-mk'});
  sec.append(m4head('h1', '시장', K || Q ? whenMeta(w, (K ?? Q).date) : null, 'm4-h-mk', w.stale));
  v.append(sec);
  if (!K && !Q) { sec.append(h('p', {class: 'q m4-q', text: '? 이번에 지수 값을 못 받았어요.'})); return null; }
  const lead = m4lead(''), seg = h('div', {class: 'm4-seg', role: 'group', 'aria-label': '지수 고르기'}), per = h('div', {class: 'm4-per', role: 'group', 'aria-label': '기간 고르기'});
  const ib = NM.map((nm, k) => { const b = h('button', {type: 'button', 'aria-pressed': 'false', disabled: XS[k] ? null : true, text: nm}); b.addEventListener('click', () => { if (M4.idx === k) return; M4.idx = k; m4save(); sync(true); onIdx?.(); }); return b; });
  const pb = M4PER.map(([p, nm]) => { const b = h('button', {type: 'button', 'aria-pressed': 'false', text: nm}); b.addEventListener('click', () => { if (M4.per === p) return; M4.per = p; m4save(); sync(true); }); return b; });
  seg.append(...ib); per.append(...pb);
  const big = h('span', {class: 'm4-v num'}), vt = h('span', {class: 'm4-vt'}), dayB = h('b', {class: 'num'}), perN = h('span', {class: 'm4-pn'}), perB = h('b', {class: 'num'});
  const hero = h('div', {class: 'm4-hero'}, h('div', {class: 'm4-hv'}, big, vt), h('div', {class: 'm4-cg'}, h('span', {}, '하루', dayB), h('span', {}, perN, perB)));
  const ylab = h('div', {class: 'm4-yl', 'aria-hidden': 'true'});
  const svg = sv('svg', {'aria-hidden': 'true', focusable: 'false'}), defs = sv('defs'), gr = sv('linearGradient', {id: 'm4ag', x1: 0, y1: 0, x2: 0, y2: 1}), T = tok();
  gr.append(sv('stop', {offset: 0, 'stop-color': T.ink, 'stop-opacity': 0.18}), sv('stop', {offset: 1, 'stop-color': T.ink, 'stop-opacity': 0})); defs.append(gr);
  const grid = sv('g', {class: 'grid'}), ag2 = sv('path', {class: 'ag2'}), lg = sv('path', {class: 'lg'}), af = sv('path', {class: 'af', fill: 'url(#m4ag)'}), lf = sv('path', {class: 'lf', pathLength: 1}),
    cur = sv('line', {class: 'cur'}), now = sv('circle', {class: 'now', r: 4.5}), hd = sv('circle', {class: 'hd', r: 5}), cd = sv('circle', {class: 'cd', r: 5});
  svg.append(defs, grid, ag2, lg, af, lf, cur, now, hd, cd);
  const ch = h('div', {class: 'm4-ch', role: 'img'}, svg, ylab), ax0 = h('span'), ax1 = h('span'), axl = h('div', {class: 'm4-axl', 'aria-hidden': 'true'}, ax0, ax1);
  const lgF = h('b'), lgG = h('b'), lgd = h('div', {class: 'm4-lgd', 'aria-hidden': 'true'}, h('span', {}, h('i'), lgF), h('span', {class: 'g2'}, h('i', {class: 'g'}), lgG), h('span', {class: 'z', text: '첫날 = 0%'}));
  const capP = h('p', {class: 'm4-cap m4-pc'}), vh = h('p', {class: 'm4-vh'}), hint = h('p', {class: 'm4-hint', text: '선을 누른 채 옆으로 끌면 그날 값이 보여요.'});
  add(sec, lead, seg, hero, ch, axl, per, lgd, capP, vh, hint, noteFor('idx'),
    m4how('시장', '네이버 증권에서 받은 지수예요. 고른 기간의 첫날을 0%로 놓고 코스피와 코스닥을 같은 눈금에 그렸어요.',
      '평소 = 그 앞 20거래일 동안 하루에 움직인 크기의 평균이에요. 「n월 n일 이후 가장 크게」는 그만큼 움직인 마지막 날이 5거래일 이상 앞일 때만 적어요.',
      '금빛 「!」 = 평소의 2.5배 넘게 움직이고 1.5% 넘을 때, 또는 하루 5% 넘을 때예요. 코스피 1990년 · 코스닥 1996년부터의 날마다 기록으로 미리 정한 문턱이에요. 해마다 18번쯤 떠요.',
      '센 것일 뿐 다음 날을 말하지 않아요.'));
  const same = !!(K && Q && K.rows.length === Q.rows.length && K.rows.every((r, i) => r[0] === Q.rows[i][0]));
  const DATA = XS.map((x, k) => (x ? {n: NM[k], v: x.rows.map(r => r[1]), d: x.rows.map(r => md(r[0])), close: x.close, day: x.day, hi: x.hi, x} : null));
  let onIdx = null, F, G, PF, PG, X, Y, W = 0, raf = 0, busy = false, played = false, down = false, offT = 0;
  const Hh = 170, padL = 4, padR = Math.round((parseFloat(getComputedStyle(document.documentElement).fontSize) || 21) * 3.05), top = 10, bot = 10; // 오른쪽 눈금 글 자리 = 글씨 크기를 따라감
  const sl = o => { const n = o.v.length, s = Math.max(0, n - M4.per); return {v: o.v.slice(s), d: o.d.slice(s), b: o.v[s]}; };
  const pcts = o => o.v.map(a => (a / o.b - 1) * 100);
  /** 기간 이름 — 자료가 모자라면 실제 거래일 수(「3달」이라 하지 않음 · 다른 눈 L6) */
  const pnOf = o => { const n = Math.min(o.v.length, M4.per); return n < M4.per ? `${n - 1}거래일` : M4PER.find(x => x[0] === M4.per)[1]; };
  const ticks = (lo, hi) => { const stp = [0.5, 1, 2, 5, 10, 20, 50]; let s = stp.at(-1); for (const x of stp) if ((hi - lo) / x <= 4) { s = x; break; } const t = []; for (let a = Math.ceil(lo / s) * s; a <= hi + 1e-9; a += s) t.push(Math.round(a * 100) / 100); return t; };
  const pth = p => p.map((a, i) => (i ? 'L' : 'M') + X(i).toFixed(1) + ' ' + Y(a).toFixed(1)).join(' ');
  const sgn = t => (t > 0 ? '+' : t < 0 ? '−' : '');
  function words() {
    const D0 = DATA[M4.idx]; lead.replaceChildren(...todayWords(NM[M4.idx], D0?.x, w).flatMap((s, i) => (i ? [' ', s] : [s])));
    const pn = pnOf(D0), ch0 = DATA.map(o => (o ? (o.v.at(-1) / o.v[Math.max(0, o.v.length - M4.per)] - 1) * 100 : null));
    const say = (k, last) => { const c = ch0[k]; const did = pct(c) === '0.0%' ? (last ? '그대로였어요' : '그대로였고') : `${a1(c)}${NB}${c > 0 ? '올랐' : '내렸'}${last ? '어요' : '고'}`; return `${jo(NM[k], '은', '는')}${NB}${did}`; };
    capP.textContent = same ? `${pn} 동안 ${say(0, false)}, ${say(1, true)}.` : `${pn} 동안 ${say(M4.idx, true)}.`; // 두 지수 날이 다르면 한 지수만(다른 눈 L6)
  }
  function draw() {
    const o = DATA[M4.idx], g2 = same ? DATA[1 - M4.idx] : null; F = sl(o); G = g2 ? sl(g2) : null; PF = pcts(F); PG = G ? pcts(G) : []; const n = PF.length;
    let lo = Math.min(0, ...PF, ...PG), hi = Math.max(0, ...PF, ...PG); const m = (hi - lo) * 0.08 || 1; lo -= m; hi += m;
    W = Math.max(200, ch.clientWidth || 320); X = i => padL + i * (W - padL - padR) / Math.max(1, n - 1); Y = p => top + (hi - p) * (Hh - top - bot) / (hi - lo);
    svg.setAttribute('viewBox', `0 0 ${W} ${Hh}`); svg.setAttribute('width', W); svg.setAttribute('height', Hh);
    grid.replaceChildren(); ylab.replaceChildren();
    for (const t of ticks(lo, hi)) { const y = Y(t); grid.append(sv('line', {class: t === 0 ? 'g0' : 'gl', x1: 0, x2: W - padR + 6, y1: y.toFixed(1), y2: y.toFixed(1)})); ylab.append(st(h('span', {class: 'num', text: `${sgn(t)}${Math.abs(t)}%`}), {top: (y - 11).toFixed(1) + 'px'})); }
    const base = ` L${X(n - 1).toFixed(1)} ${Hh} L${X(0).toFixed(1)} ${Hh} Z`, df = pth(PF);
    lf.setAttribute('d', df); af.setAttribute('d', df + base);
    if (G) { const dg = pth(PG); lg.setAttribute('d', dg); ag2.setAttribute('d', dg + base); } else { lg.setAttribute('d', ''); ag2.setAttribute('d', ''); }
    now.setAttribute('cx', X(n - 1).toFixed(1)); now.setAttribute('cy', Y(PF[n - 1]).toFixed(1));
    big.textContent = numK(o.close); dayB.textContent = p2(o.day); dayB.className = 'num ' + cls(o.day);
    perN.textContent = pnOf(o); perB.textContent = pct(PF[n - 1]); perB.className = 'num ' + cls(PF[n - 1]);
    ax0.textContent = F.d[0]; ax1.textContent = F.d[n - 1]; lgF.textContent = o.n; lgG.textContent = G ? DATA[1 - M4.idx].n : ''; lgd.classList.toggle('one', !G);
    vh.replaceChildren(...(o.hi && isDay(o.hi.d) ? [`3달 가운데 가장 높던 ${md(o.hi.d)}과 견주면 `, pctEl(o.hi.vs, 'b')] : []));
    ch.setAttribute('aria-label', `${pnOf(o)} 동안 ${o.n} ${pct(PF[n - 1])}${G ? ` · ${DATA[1 - M4.idx].n} ${pct(PG[n - 1])}` : ''} — ${F.d[0]}을 0%로 놓은 같은 눈금`);
    words();
  }
  function sync(go) {
    ib.forEach((b, k) => b.setAttribute('aria-pressed', String(k === M4.idx))); pb.forEach((b, k) => b.setAttribute('aria-pressed', String(M4PER[k][0] === M4.per)));
    off(); draw(); if (go) play();
  }
  /** 앞 산줄기가 그려지는 동안 큰 숫자와 날짜가 함께 달림 → 끝나면 뒤 산줄기 · 면이 떠오름 */
  function play() {
    if (RM.matches || !lf.getTotalLength) return; cancelAnimationFrame(raf);
    const n = PF.length; if (n < 2) return; const cum = [0]; for (let i = 1; i < n; i++) cum[i] = cum[i - 1] + Math.hypot(X(i) - X(i - 1), Y(PF[i]) - Y(PF[i - 1]));
    const tot = cum[n - 1] || 1, t0 = performance.now(), T = M4.per < 10 ? 1100 : M4.per < 30 ? 1400 : 1800; busy = true;
    lf.style.strokeDasharray = '1'; lf.style.strokeDashoffset = '1'; ch.classList.add('play');
    const fr = tn => { if (!ch.isConnected) return; const t = Math.min(1, (tn - t0) / T), f = 1 - (1 - t) ** 3, L = f * tot; let j = 0; while (j < n - 2 && cum[j + 1] < L) j++;
      const sg = cum[j + 1] - cum[j]; let u = sg ? (L - cum[j]) / sg : 0; u = Math.max(0, Math.min(1, u)); const ix = u > 0.5 ? j + 1 : j;
      lf.style.strokeDashoffset = String(1 - f); hd.setAttribute('cx', (X(j) + (X(j + 1) - X(j)) * u).toFixed(1)); hd.setAttribute('cy', (Y(PF[j]) + (Y(PF[j + 1]) - Y(PF[j])) * u).toFixed(1));
      big.textContent = numK(F.v[ix]); vt.textContent = F.d[ix]; hero.classList.add('sc');
      if (t < 1) raf = requestAnimationFrame(fr); else { busy = false; big.textContent = numK(DATA[M4.idx].close); lf.style.strokeDasharray = ''; lf.style.strokeDashoffset = ''; ch.classList.remove('play'); hero.classList.remove('sc'); } };
    raf = requestAnimationFrame(fr);
  }
  function at(e) { if (busy) return; const n = PF.length, r = ch.getBoundingClientRect(); let i = Math.round((e.clientX - r.left - padL) / Math.max(1, r.width - padL - padR) * (n - 1)); i = Math.max(0, Math.min(n - 1, i));
    const px = X(i).toFixed(1); cur.setAttribute('x1', px); cur.setAttribute('x2', px); cur.setAttribute('y1', 0); cur.setAttribute('y2', Hh); cd.setAttribute('cx', px); cd.setAttribute('cy', Y(PF[i]).toFixed(1));
    big.textContent = numK(F.v[i]); vt.textContent = F.d[i]; hero.classList.add('sc'); ch.classList.add('on'); }
  function off() { down = false; clearTimeout(offT); if (!busy) { ch.classList.remove('on'); hero.classList.remove('sc'); vt.textContent = ''; if (DATA[M4.idx]) big.textContent = numK(DATA[M4.idx].close); } }
  ch.addEventListener('pointerdown', e => { down = true; try { ch.setPointerCapture(e.pointerId); } catch { /* 못 잡음 */ } at(e); });
  ch.addEventListener('pointermove', e => { if (down || e.pointerType === 'mouse') at(e); });
  ch.addEventListener('pointerup', () => { down = false; clearTimeout(offT); offT = setTimeout(() => { if (!down) off(); }, 1600); });
  ch.addEventListener('pointercancel', off); ch.addEventListener('pointerleave', e => { if (e.pointerType === 'mouse') off(); });
  sync(false);
  chartDraw = () => { if (!busy && ch.isConnected) draw(); }; // 화면 넓이가 바뀌면 다시 그림(route 의 resize)
  // 그래프가 화면에 꽉 들어오고 여는 홍표가 끝났을 때 한 번 그려짐(위에서 홍표가 나는 동안 숫자가 달리지 않게)
  const tryPlay = () => { if (played || !ch.isConnected) return; if (document.querySelector('#view .m4-letter.intro')) return; played = true; play(); };
  if (!RM.matches && 'IntersectionObserver' in window) { let vis = false; const ob = new IntersectionObserver(es => { for (const x of es) vis = x.isIntersecting; if (vis) tryPlay(); if (played) ob.disconnect(); }, {threshold: 0.75}); ob.observe(ch);
    if (document.querySelector('#view .m4-letter.intro')) document.addEventListener('m4:landed', () => setTimeout(() => { if (vis) tryPlay(); }, 900), {once: true}); } // 여는 홍표를 기다릴 때만(다른 눈 L2 — 다시 올 때마다 쌓이지 않게)
  return {setOnIdx(f) { onIdx = f; }};
}

// ── ③ 오른 곳과 내린 곳 — 시장 넓이(네이버 업종 회사 수) · 오늘 강한 업종 셋 · 약한 업종 셋 → 업종 화면 ──
/** 「10곳 중 n곳」 — 모두 · 대부분 그대로 · 1 ~ 9 로 묶음(「10곳 중 10곳」 · 「10곳 중 0곳」이라 하지 않음 · 다른 눈 L1) */
function breadthWords(B, when) {
  const n = B.up + B.flat + B.down, dn = B.down >= B.up, c = dn ? B.down : B.up, did = dn ? '내렸어요' : '올랐어요', pre = when ? when + ' ' : '';
  if (B.flat > B.up + B.down) return `${pre}대부분 그대로였어요.`;
  if (c === n) return `${pre}모두 ${did}.`;
  return `${pre}10곳${NB}중${NB}${Math.min(9, Math.max(1, Math.round(c / n * 10)))}곳이 ${did}.`;
}
function m4breadth(v, H) {
  const S = H?.sectors, B = S?.breadth, w = whenOf(H, 'sectors', undefined), d = isDay(S?.date) ? S.date : H?.idx?.KOSPI?.date; // 업종 조각의 장 중은 그 조각의 받은 때로(지수 값을 빌리지 않음 · 다른 눈 M6)
  const sec = h('section', {class: 'm4-sec', 'aria-labelledby': 'm4-h-br'}, m4head('h2', '오른 곳과 내린 곳', S ? whenMeta(w, d) : null, 'm4-h-br', w.stale));
  v.append(sec);
  if (!S) { sec.append(h('p', {class: 'q m4-q', text: '? 이번에 업종 값을 못 받았어요.'})); return; }
  const n = B ? B.up + B.flat + B.down : 0;
  if (!B || !n) sec.append(h('p', {class: 'q m4-q', text: tx('? 이번에 오른 곳 · 내린 곳 수를 못 받았어요.')})); // 업종 줄은 그대로 보임
  else {
    sec.append(m4lead(breadthWords(B, tillOk(w, d) ? tillT(w.t) : onDay(d))));
    const bar = h('div', {class: 'm4-bar', role: 'img', 'aria-label': `${(B.n ?? n).toLocaleString('ko-KR')}곳 가운데 ${B.up.toLocaleString('ko-KR')}곳 오름 · ${B.flat.toLocaleString('ko-KR')}곳 그대로 · ${B.down.toLocaleString('ko-KR')}곳 내림`},
      ...[['u', B.up], ['f', B.flat], ['d', B.down]].map(([c, x]) => st(h('i', {class: c}), {width: (x / n * 100).toFixed(2) + '%'})));
    const nums = [['오름', 'up', B.up], ['그대로', 'flat', B.flat], ['내림', 'down', B.down]].map(([t, c, x]) => { const b = h('b', {class: 'num ' + c, text: x.toLocaleString('ko-KR')}); return [h('span', {}, t, b), b, x]; });
    const box = h('div', {class: 'm4-brd'}, bar, h('div', {class: 'm4-bl'}, ...nums.map(x => x[0])));
    sec.append(box, h('p', {class: 'm4-cap', text: `네이버 증권 업종 회사 ${(B.n ?? n).toLocaleString('ko-KR')}곳의 하루`}));
    m4io(box, still => { for (const [, b, x] of nums) countUp(b, x, still); });
  }
  // 오늘 강한 · 약한 업종(회사 5곳 이상 업종만 · 네이버 증권 업종 %) — 줄을 누르면 ATLAS 업종 화면(core.secInd)
  const row = g => { const href = secHref(g.name), kids = [h('span', {class: 'top'}, nameEl(g.name), h('b', {class: 'num ' + cls(g.chg), text: pct(g.chg)})), h('i', {class: 'm4-chev', 'aria-hidden': 'true', text: href ? '›' : ''})]; // 이름이 길면 %가 다음 줄 오른쪽으로
    return href ? h('a', {class: 'm4-sr', href}, ...kids) : h('div', {class: 'm4-sr'}, ...kids); };
  const SS = (S.strong ?? []).slice(0, 3), SW = (S.weak ?? []).slice(0, 3);
  const two = SS.length || SW.length ? h('div', {class: 'm4-two'},
    SS.length ? h('div', {}, h('p', {class: 'm4-sl', text: '강한 업종'}), ...SS.map(row)) : null,
    SW.length ? h('div', {}, h('p', {class: 'm4-sl', text: '약한 업종'}), ...SW.map(row)) : null) : null;
  add(sec, two, noteFor('sectors'),
    m4how('오른 곳과 내린 곳', `${jo(`네이버 증권 업종 회사${B?.n ? ` ${B.n.toLocaleString('ko-KR')}곳` : ''}`, '을', '를')} 그 앞 거래일 종가와 견줬어요. 「10곳 중 n곳」은 오른 곳 · 그대로 · 내린 곳을 모두 넣고 셌어요.`,
      `업종은 회사 5곳 이상인 ${S.ranked ?? '?'}개만 줄 세웠어요. 업종마다 오른 비율은 네이버 증권이 셈한 값이에요. 줄을 누르면 그 회사들이 가장 많이 든 ATLAS 업종으로 가요.`,
      '이날 강한 업종이 다음 날도 강하다는 뜻은 아니에요.'));
}

// ── ④ 요즘 오르는 업종 — 지난 1주(5거래일) 오른 업종 · 많이 오른 순 11개까지(규칙 64) · 줄마다 1주 선(점선 = 1주 전 값 · 흐린 점선 = 모든 회사 평균 · 규칙 56) ──
function m4spark(vals, parent) {
  const w = 104, hh = 22, pad = 2, all = [...vals, ...(parent ?? []), 100].filter(x => x != null), lo = Math.min(...all), hi = Math.max(...all), rg = hi - lo || 1;
  const P = arr => arr.map((x, i) => (x == null ? '' : `${i ? 'L' : 'M'}${(pad + i * (w - 2 * pad) / Math.max(1, arr.length - 1)).toFixed(1)} ${(pad + (hi - x) * (hh - 2 * pad) / rg).toFixed(1)}`)).join(' ');
  const s = sv('svg', {class: 'm4-spk', viewBox: `0 0 ${w} ${hh}`, width: w, height: hh, 'aria-hidden': 'true', focusable: 'false'}), y0 = (pad + (hi - 100) * (hh - 2 * pad) / rg).toFixed(1), c = cls(vals.at(-1) - vals[0]);
  s.append(sv('line', {class: 'b0', x1: 0, x2: w, y1: y0, y2: y0}));
  if (parent) s.append(sv('path', {class: 'pa', d: P(parent)}));
  s.append(sv('path', {class: 'ln ' + c, d: P(vals), pathLength: 1}));
  return s;
}
function m4rise(v) {
  const C = D.core, RI = C.rise, L = RI?.list ?? [];
  const sec = h('section', {class: 'm4-sec', 'aria-labelledby': 'm4-h-ri'}, m4head('h2', '요즘 오르는 업종', RI ? `${md(RI.from)} → ${md(RI.to)}` : null, 'm4-h-ri'));
  v.append(sec);
  if (!RI) { sec.append(h('p', {class: 'q m4-q', text: '? 1주 업종 값을 못 읽었어요.'})); return; }
  if (!L.length) { sec.append(m4lead('지난 1주 동안 오른 업종이 없어요.'), h('p', {class: 'm4-cap', text: `업종 ${RI.of}개 모두 내리거나 그대로였어요.`})); return; }
  sec.append(m4lead(`1주 동안 가장 많이 오른 업종은 ${L[0].name}${hasB(L[0].name) ? '이에요' : '예요'}.`));
  const list = h('div', {class: 'm4-rows'});
  L.forEach((r, k) => { const i = ind(r.name), href = i ? hrefInd(i) : '#/list';
    list.append(h('a', {class: 'm4-tr', href}, h('span', {class: 'no' + (k < 3 ? ' t3' : ''), text: k + 1}), nameEl(r.name),
      h('span', {class: 'sub'}, m4spark(r.v, RI.all), C.mkt && i?.pk ? h('span', {class: 'm4-pk', text: `고른 ${i.pk}곳`}) : null), h('b', {class: 'v num ' + cls(r.chg), text: pct(r.chg)}))); });
  sec.append(list);
  m4io(list);
  sec.append(h('p', {class: 'm4-cap', text: `${md(RI.to)}까지 1주 동안 업종 ${RI.of}개 가운데 ${RI.n}개가 올랐어요.${RI.n > RI.max ? ` 많이 오른 ${RI.max}개만 보여요.` : ''}`}),
    m4how('요즘 오르는 업종', `업종마다 그 업종 회사들이 오른 비율을 한 회사 한 표로 평균했어요. 1주 동안 ${RI.min}% 이상 오른 업종만 많이 오른 차례로 보여요.`,
      `작은 선 = 그 업종의 1주. 점선 = 1주 전인 ${md(RI.from)} 값, 흐린 점선 = 모든 회사 평균이에요. 금빛 「고른 n곳」 = ${pickName(C)} 가운데 그 업종에 든 수예요.`,
      '줄을 누르면 업종 → 회사로 내려가요. 지난 값이고 앞날 값이 아니에요.'));
}

// ── ⑤ 사고팔기 — 개인 · 외국인 · 기관(고른 지수를 따라감) · 막대는 돈의 방향이라 한 색(규칙 53) · 금빛 「!」는 두 시장 모두(다른 눈 M7) ──
function m4flows(v, H) {
  const sec = h('section', {class: 'm4-sec', 'aria-labelledby': 'm4-h-fl'}); v.append(sec);
  const paint = () => {
    const F = H?.flows, m = M4.idx === 1 && F?.KOSDAQ ? 'KOSDAQ' : F?.KOSPI ? 'KOSPI' : 'KOSDAQ', mn = m === 'KOSPI' ? '코스피' : '코스닥', x0 = F?.[m], w = whenOf(H, 'flows', F?.live);
    sec.replaceChildren(m4head('h2', '사고팔기', x0 ? `${mn}, ${whenMeta(w, x0.date)}` : null, 'm4-h-fl', w.stale));
    const fa = (H?.alerts ?? []).filter(a => a.kind === 'flow').map(a => h('p', {class: 'm4-al', text: `! ${a.key === 'KOSDAQ' ? '코스닥' : '코스피'}에서 외국인이 하루 1조 원 넘게 ${a.v < 0 ? '팔았어요' : '샀어요'}.`}));
    if (!x0) { add(sec, ...fa, h('p', {class: 'q m4-q', text: '? 이번에 사고판 돈을 못 받았어요.'})); return; }
    const who = [['personal', '개인'], ['foreign', '외국인'], ['institutional', '기관']].map(([k, nm]) => [nm, x0[k] ?? null]), max = Math.max(...who.map(x => Math.abs(x[1] ?? 0)), 1);
    const bigW = who.filter(x => x[1] != null).sort((a, b) => Math.abs(b[1]) - Math.abs(a[1]))[0], till = tillOk(w, x0.date) ? tillT(w.t) : onDay(x0.date);
    add(sec, ...fa, bigW ? m4lead(`${till ? till + ' ' : ''}${mn}에서 ${jo(bigW[0], '이', '가')} 가장${NB}많이 ${bigW[1] < 0 ? '팔았어요' : '샀어요'}.`) : null);
    const rows = h('div', {class: 'm4-fl'}, ...who.map(([nm, x]) => h('div', {class: 'm4-fr'}, h('span', {class: 'fn', text: nm}), h('span', {class: 'fb', 'aria-hidden': 'true'}, x == null ? null : st(h('i'), {width: (Math.abs(x) / max * 100).toFixed(1) + '%'})),
      h('b', {class: 'num', text: x == null ? '?' : Math.round(x) === 0 ? '0억' : `${eokW(x).replace(/ 원$/, '')} 더${NB}${x < 0 ? '팖' : '삼'}`}))));
    add(sec, rows, noteFor('flows'),
      m4how('사고팔기', `${mn}에서 ${w.intra || w.stale ? `${isTime(w.t) ? `${md(w.t.slice(0, 10))} ${ampm(w.t)}` : '?'}까지` : `${isDay(x0.date) ? md(x0.date) : '?'} 하루`} 산 돈과 판 돈의 차이예요. 단위는 억 원이에요. 더 삼 = 산 돈이 더 많음, 더 팖 = 판 돈이 더 많음.`,
        '막대는 오름 · 내림이 아니라 돈의 방향이라 한 색이고, 세 줄이 같은 자로 그려져요. 셋을 더해도 0이 아닌 까닭은 다른 회사 같은 그 밖의 투자자가 있어서예요.',
        `위 시장 칸에서 고른 지수를 따라가요. 지금은 ${jo(mn, '이에요', '예요')}. 금빛 「!」 = 외국인이 하루 1조 원 넘게 사거나 판 날이에요. 두 시장 모두 보여요. 네이버 증권 투자자별 매매 동향이에요.`));
    m4io(rows);
  };
  paint();
  return paint;
}

// ── ⑥ 미국 — 마지막 장 끝(한국 장이 끝난 뒤 열림) ──
function m4us(v, H) {
  const U = H?.us, w = whenOf(H, 'us', false), rows = Array.isArray(U?.rows) ? U.rows.filter(r => r && r.key) : [], by = Object.fromEntries(rows.map(r => [r.key, r])), three = US3.map(k => by[k]).filter(Boolean); // 늘 S&P 500 · 나스닥 · 다우 차례
  const sec = h('section', {class: 'm4-sec', 'aria-labelledby': 'm4-h-us'}, m4head('h2', '미국', three.length ? (isDay(U.date) ? `${dayK(U.date)} 장${NB}끝` : '?') : null, 'm4-h-us', !!three.length && w.stale)); v.append(sec);
  if (!U || !three.length) { add(sec, h('p', {class: 'q m4-q', text: '? 이번에 미국 값을 못 받았어요.'}), noteFor('us')); return; }
  const up = three.filter(r => r.chg > 0).length, dl = onDay(U.date);
  sec.append(m4lead(`${dl ? dl + ' ' : ''}${three.length < 3 ? `${three.length}개 지수 가운데 ${up}개가 올랐어요.` : up === 3 ? '세 지수 모두 올랐어요.' : up === 0 ? '세 지수 모두 내렸어요.' : `세 지수 가운데 ${up}개가 올랐어요.`}`));
  sec.append(h('div', {class: 'm4-us'}, ...three.map(r => h('div', {}, h('span', {text: r.name}), h('b', {class: 'num ' + cls(r.chg), text: p2(r.chg)})))));
  const vix = by.VIX; if (vix) sec.append(h('p', {class: 'm4-vh'}, `미국 불안 지수 ${numK(vix.close)}, 하루 `, h('b', {class: 'num ' + cls(vix.chg), text: p2(vix.chg)})));
  add(sec, noteFor('us'), m4how('미국', '네이버 증권 해외 지수예요. 미국 장은 한국 장이 끝난 뒤 열려 한국 같은 날 값과 같은 날이 아니에요.', '미국 불안 지수는 VIX라고도 해요. 오르면 미국 투자자들이 더 불안해한다는 뜻이에요.'));
}

// ── ⑦ 고른 곳 — 오른 곳 · 내린 곳 · 가장 많이 오른 · 내린 곳 · 제 평소의 2.5배 이상 움직인 곳(lines.json) → 회사 화면 ──
/** 고른 곳마다 마지막 하루 바뀜과 평소(그 앞 거래일 하루 움직임 크기의 평균) — lines.json 21개 값(기준일 = 10000) */
function pickMoves(S) {
  const out = []; if (!D.lines || !S?.list || D.linesAsOf !== S.date) return out; // 선(lines.json)과 하루 값(home.json)이 같은 날일 때만 견줌 — 날이 다르면 「평소의 n배」를 안 씀
  for (const [c, chg] of S.list) { const l = D.lines[c]; if (!l || l.length < 6 || l.at(-1) == null || l.at(-2) == null) continue; const d = []; for (let k = 1; k < l.length; k++) if (l[k - 1] > 0 && l[k] > 0) d.push((l[k] / l[k - 1] - 1) * 100);
    if (d.length < 5) continue; const t = (l.at(-1) / l.at(-2) - 1) * 100, prev = d.slice(0, -1), avg = prev.reduce((a, x) => a + Math.abs(x), 0) / prev.length; out.push({c, chg, t, avg, ratio: avg > 0 ? Math.abs(t) / avg : null}); }
  return out;
}
const BIGX = 2.5; // 「크게 움직인 곳」 문턱 = 지수 「!」와 같은 평소의 2.5배(home-v3 alertK) · 이상
function m4picks(v, H) {
  const C = D.core, S = H?.s365, name = `고른 ${NP(C)}곳`;
  const segs = String(pickLine(C)).split(' · '), say = h('p', {class: 'm4-say'}, h('span', {class: 'nb', text: `${C.rules?.name ?? '?'}:`}), ' '); // 「·」 뒤에서만 줄이 바뀜(줄 첫머리가 「·」가 되지 않게)
  segs.forEach((t, i) => { say.append(h('span', {class: 'nb', text: t + (i < segs.length - 1 ? ' ·' : '')})); if (i < segs.length - 1) say.append(' '); });
  const sec = h('section', {class: 'm4-sec', 'aria-labelledby': 'm4-h-pk'}, m4head('h2', name, isDay(S?.date) ? dayK(S.date) : null, 'm4-h-pk'), say); v.append(sec);
  if (!S || !S.list?.length) { sec.append(h('p', {class: 'q m4-q', text: `? ${NP(C)}곳 하루 값이 없어요.`})); return; }
  const dl = onDay(S.date);
  sec.append(m4lead(`${dl ? dl + ' ' : ''}${S.up}곳이 오르고 ${S.down}곳이 내렸어요.${S.flat ? ` ${S.flat}곳은 그대로였어요.` : ''}${S.none ? ` 값이 없는 곳은 ${S.none}곳이에요.` : ''}`));
  const mv = pickMoves(S), byC = new Map(mv.map(x => [x.c, x])), nm = c => D.comp?.[c]?.name ?? (S.top?.c === c ? S.top.n : S.bot?.c === c ? S.bot.n : c);
  const chgOf = c => byC.get(c)?.chg ?? S.list.find(y => y[0] === c)?.[1] ?? (S.top?.c === c ? S.top.chg : S.bot?.c === c ? S.bot.chg : null); // 목록에 없으면 양 끝 값(다른 눈 L3)
  const row = (c, tag) => { const x = byC.get(c), chg = chgOf(c);
    return h('a', {class: 'm4-mv', href: cHref(c, true)}, h('span', {class: 'top'}, h('span', {class: 'nm', text: nm(c)}), h('b', {class: 'num ' + cls(chg), text: pct(chg)})), // 이름이 길면 %가 다음 줄 오른쪽으로(이름을 낱말 가운데서 끊지 않음)
      h('span', {class: 'tg', text: [tag, usualW(x?.ratio)].filter(Boolean).join(', ')}), h('i', {class: 'm4-chev', 'aria-hidden': 'true', text: '›'})); };
  // 두 묶음(다른 눈 M2): 가장 많이 오른 곳 · 내린 곳 / 제 평소의 2.5배 이상 움직인 곳(그 밖에서 큰 차례 셋)
  const ends = [[S.top?.c, '가장 많이 오름'], [S.bot?.c, '가장 많이 내림']].filter(([c], i, a) => c && a.findIndex(y => y[0] === c) === i);
  if (ends.length) sec.append(h('p', {class: 'm4-sl', text: '가장 많이 오른 곳과 내린 곳'}), h('div', {class: 'm4-mvs'}, ...ends.map(([c, t]) => row(c, t))));
  if (mv.length) { // 선(lines.json)이 하루 값과 같은 날일 때만 — 위 두 곳에 든 곳은 「위 n곳 말고」로 셈(같은 곳을 두 번 안 보임)
    const bigAll = mv.filter(x => x.ratio != null && x.ratio >= BIGX), seen = new Set(ends.map(x => x[0])), more = bigAll.filter(x => !seen.has(x.c)).sort((a, b) => b.ratio - a.ratio), show = more.slice(0, 3), inTop = bigAll.length - more.length;
    const tail = !bigAll.length ? '' : inTop && !more.length ? ' — 모두 위에 있어요' : inTop ? ` — 위 ${inTop}곳 말고 ${more.length > 3 ? '큰 차례로 ' : ''}${show.length}곳` : more.length > 3 ? ` — 큰 차례로 ${show.length}곳` : '';
    const rest = more.slice(3); // 큰 차례로 셋 밖 — 접은 칸에 모두(첫 화면에서 다 닿게 · 다른 눈 M2)
    add(sec, h('p', {class: 'm4-sl', text: bigAll.length ? `제 평소의 2.5배 이상 움직인 곳 ${bigAll.length}곳${tail}` : '제 평소의 2.5배 이상 움직인 곳은 없어요'}),
      show.length ? h('div', {class: 'm4-mvs'}, ...show.map(x => row(x.c, ''))) : null,
      rest.length ? h('details', {class: 'm4-more'}, h('summary', {'aria-label': `제 평소의 2.5배 이상 움직인 나머지 ${rest.length}곳 보기`, text: `나머지 ${rest.length}곳 보기`}), h('div', {class: 'm4-mvs'}, ...rest.map(x => row(x.c, '')))) : null);
  }
  const F = C.facts; if (F?.n1y && F.dd50 > 0) sec.append(h('p', {class: 'm4-vh', text: `${F.dd50 >= F.n1y ? '고른 곳 모두' : `고른 곳도 10곳 중 ${Math.min(9, Math.max(1, Math.round(F.dd50 / F.n1y * 10)))}곳은`} 1년 사이 꼭대기의 반값 아래로 떨어진 적이 있어요. 반값을 견딜 수 있나요?`}));
  { const rn = C.rules?.name; sec.append(h('p', {class: 'm4-cap', text: rn ? tx(`${jo(rn, '으로', '로')} 센 것이고, ${jo(rn.replace(/ 조건$/, ''), '이', '가')} 고른 목록이 아니에요.`) : '? 고른 기준을 못 읽었어요.'})); }
  sec.append(m4how('고른 곳', `평소 = 그 회사가 앞 ${C.days - 1}거래일 동안 하루에 움직인 크기의 평균이에요. 「평소의 n배」는 마지막 하루 움직임을 그 평균으로 나눈 값이에요.`,
    `멍거 갈래는 3년 성적표만, 린치 갈래는 3년 성적표와 ${lyDay(C)} 값으로 골랐어요. 반값 = ${md(C.asOf)}까지 1년 종가에서 꼭대기의 반 아래로 떨어진 적이 있는 곳이에요. ${F?.n1y ?? '?'}곳 가운데 ${F?.dd50 ?? '?'}곳이에요.`,
    '줄을 누르면 그 회사 화면으로 가요. 7단 중 3단이에요.'));
}

// ── ⑧ 큰 갈래(7단 중 1단 — 첫 화면에서 1번) · 봉인 ──
function m4groups(v) {
  const C = D.core, gs = C.groups.slice().sort((a, b) => b.chg - a.chg);
  const sec = h('section', {class: 'm4-sec', 'aria-labelledby': 'm4-h-gr'}, m4head('h2', `큰 갈래 ${C.groups.length}개`, `${C.days}거래일`, 'm4-h-gr')); v.append(sec);
  if (gs.length) sec.append(m4lead(`${md(C.base)}부터 ${C.days}거래일 동안 ${gs[0].chg < 0 ? '가장 덜 내린' : '가장 많이 오른'} 갈래는 ${jo(gs[0].short, '이에요', '예요')}.`)); // 모두 내린 날은 「가장 덜 내린」(다른 눈 L1)
  sec.append(h('div', {class: 'm4-gs'}, ...gs.map(g => h('a', {class: 'm4-g', href: '#/g/' + g.id}, nameEl(g.short), h('b', {class: 'num ' + cls(g.chg), text: pct(g.chg)})))));
  sec.append(h('p', {class: 'm4-cap', text: '갈래를 누르면 업종, 회사 차례로 내려가요. 7단 중 1단이에요.'}));
  const T = C.time; if (T) sec.append(h('a', {class: 'm4-mr', href: '#/time'}, h('span', {class: 'l', text: `봉인 ${T.id}호 — 3 · 5 · 10년 뒤 다시 엶`}), h('span', {class: 'k'}, '3년 뒤까지 ', h('b', {class: 'num', text: ddayText(T.opens[0].date)})), h('i', {class: 'm4-chev', 'aria-hidden': 'true', text: '›'})));
}

// ── ⑨ 홍표 도장 · 맨 아래 ──
function m4seal(v) {
  const f = h('section', {class: 'm4-seal-box', 'aria-label': '보드리 약속'}, h('span', {class: 'm4-seal', 'aria-hidden': 'true'}, h('i')), h('p', {class: 'm4-pr'}, h('span', {text: '보드리는 들은 것만 따라 말해요.'}), h('span', {text: '아틀란스도 지난 기록만 보여요.'})), h('p', {class: 'm4-cap', text: '숫자는 네이버 증권에서 하루 4번 새로 받아요.'}));
  v.append(f); m4io(f);
}

async function viewHome(v) {
  await Promise.allSettled([needHome(), needComp()]); // 고른 곳 이름 · 선(lines.json)은 고른 곳 칸 · 회사 고리에 씀 — 못 받으면 그 칸만 줄여 그림
  const H = D.home; m4load(); m4notes = H ? planNotes(H) : {};
  /** 칸 하나가 자료 탓에 멈춰도 첫 화면 전체가 「자료를 못 읽었습니다」가 되지 않게 — 그 칸 자리에 「?」 한 줄(다른 눈 M3) */
  const safe = (name, f) => { try { return f(); } catch (e) { console.warn('첫 화면 칸', name, e); v.append(h('section', {class: 'm4-sec'}, h('p', {class: 'q m4-q', text: `? ${name} 칸을 그리지 못했어요.`}))); return null; } };
  // 큰 날 금빛 「!」는 편지 위 — 편지가 격언 열 가지로 길어져(2026-10-16) 시장 칸이 첫 화면(390×844) 밖으로 밀려서
  const top = H && (idxOk(H.idx?.KOSPI) || idxOk(H.idx?.KOSDAQ)) ? idxAlerts(H) : [];
  if (top.length) v.append(h('div', {class: 'm4-top'}, ...top));
  v.append(m4letter());
  if (!H) add(v, h('h1', {class: 'head m4-t m4-h1x', text: '시장 — ?'}), h('p', {class: 'q m4-q', text: '? 시장 자료를 못 읽었어요. 아래 요즘 오르는 업종은 그대로예요.'}));
  else { const mk = safe('시장', () => m4market(v, H)); safe('오른 곳과 내린 곳', () => m4breadth(v, H)); safe('요즘 오르는 업종', () => m4rise(v)); const fl = safe('사고팔기', () => m4flows(v, H)); if (fl) mk?.setOnIdx(fl); safe('미국', () => m4us(v, H)); safe('고른 곳', () => m4picks(v, H)); }
  if (!H) safe('요즘 오르는 업종', () => m4rise(v));
  safe('큰 갈래', () => m4groups(v)); m4seal(v);
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
  v.append(crumbs({href: '#/', text: '한눈에'}, {text: g.short}), steps(1), tell.el, head, gtr, h('p', {class: 'say', text: `${inds.slice().sort((a, b) => b.n - a.n).slice(0, 3).map(x => x.name).join(' · ')}${inds.length > 3 ? ' 등' : ''} · 업종 ${inds.length}개`}), count, legend(g.short, g.pk ? '금빛 = 고른 곳' : null), host); // 범례는 판 바로 위(2026-10-15 먹빛 예술 · 데이터 눈 — 선을 읽기 전에 뜻을) // 설명은 지금 업종에서(CIA팀 2026-10-12: 옛 365곳 설명이 남아 있던 것)
  const items = inds.map(i => ({key: i.name, name: i.name, href: hrefInd(i), v: i.v, cw: i.cw, badge: i.n === 1 ? '1곳' : null, tr: i.tr, trc: i.trc, gold: i.pk ? `고른 ${i.pk}곳` : null, pk: i.pk > 0}));
  const rc = race(host, {items, parent: g, wide: true, label: `${g.name} 업종 ${inds.length}개 — ${C.days}거래일 많이 오른 순: ` + inds.map(i => i.name + ' ' + pct(i.chg)).join(', '),
    onTick: k => tell.t.replaceChildren(h('b', {text: md(C.dates[k])})), onDone: () => { tell.t.textContent = `${md(C.base)} → ${md(C.asOf)}`; }});
  v.append(seg(m => { words(m); rc.setMode(m); }), alt);
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
  v.append(crumbs({href: '#/', text: '한눈에'}, {href: '#/g/' + g.id, text: g.short}, {text: i.name}), steps(2, ['#/g/' + g.id]), tell.el, head, itr, count, legend(i.name, C.mkt && i.pk ? '금빛 = 고른 곳' : null), host); // 범례는 판 바로 위
  // 회사 줄 — 고른 곳(금빛)은 3단 회사 화면 · 나머지는 모든 회사 7단(core.co7)이면 3단 회사 · 옛 자료면 「밖」 칸(이름 · 까닭 · 깔때기) · 하루 30% 넘게 바뀐 날이 있으면 「?」
  //   기준일 종가가 없어 선을 못 그린 회사(새로 상장 · 그날 거래 멈춤 등)는 줄 대신 아래 「?」 한 줄에 이름 고리로(규칙 56 줄마다 선 · 「3번이면 회사」 그대로)
  const href = c => cHref(c, row(c).p), noLine = c => !row(c).l.some(x => x != null);
  const shown = i.members.filter(c => !noLine(c)), none = i.members.filter(noLine);
  const items = shown.map(c => { const m = row(c); return {key: c, name: m.n, href: href(c), v: m.l.map(x => (x == null ? null : x / 100)), cw: null, gold: C.mkt && m.p ? '고른 곳' : null, pk: !!(C.mkt && m.p), badge: m.j ? '?' : null}; });
  const rc = race(host, {items, parent: i, wide: true, label: `${i.name} 회사 ${shown.length}곳 — ${C.days}거래일 많이 오른 순: ` + shown.map(c => row(c).n + ' ' + pct(row(c).c)).join(', '),
    onTick: k => tell.t.replaceChildren(h('b', {text: md(C.dates[k])})), onDone: () => { tell.t.textContent = `${md(C.base)} → ${md(C.asOf)}`; }});
  v.append(seg(m => { words(m); rc.setMode(m); }), alt);
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
  else v.append(h('p', {class: 'chipline pk'}, h('span', {class: 'badge gold', text: '고른 곳'}), ` ${pickName(C)}에 든 회사입니다 — 두 사람이 고른 목록은 아닙니다`)); // 고른 회사 머리에도 금빛 한 줄(2026-10-15 먹빛 예술 · 믿음 눈 — 금빛 = 고른 곳을 머리에서 바로)
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
  const box = h('div', {class: 'box'}, h('h2', {text: `왜 ${pickName(C)}에 들었나요?`}), R?.notMunger ? h('p', {class: 'small hon', text: `${R.notMunger} 좋은 회사 순서가 아닙니다.`}) : null); // 정직 글은 머리 바로 밑 · 진주 글(2026-10-15 먹빛 예술 · 믿음 눈 — 접은 칸 뒤 아래쪽에 묻히던 것)
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
  const n = close.length, W = Math.max(260, Math.round(wrap.getBoundingClientRect().width || 320)), H = 222, P = 10, PT = 12, padR = AXR();
  const vals = [...close, ...avg].filter(x => x != null);
  if (!vals.length) { wrap.append(h('p', {class: 'q', text: '? 이 기간 값을 못 읽었습니다'})); return; }
  let lo = Math.min(...vals), hi = Math.max(...vals); const pad = (hi - lo) * 0.06 || 1; lo -= pad; hi += pad;
  const X = i => 4 + i * (W - 4 - padR) / Math.max(1, n - 1), Y = y => PT + (hi - y) * (H - PT - P) / (hi - lo);
  const base = close.find(x => x != null), id = 'pc' + (++lcN), T = tok();
  const svg = sv('svg', {viewBox: `0 0 ${W} ${H}`, width: W, height: H, role: 'img', 'aria-label': label});
  const defs = sv('defs'); const cu = sv('clipPath', {id: id + 'u'}); cu.append(sv('rect', {x: 0, y: 0, width: W, height: Y(base)})); const cd = sv('clipPath', {id: id + 'd'}); cd.append(sv('rect', {x: 0, y: Y(base), width: W, height: H - Y(base)})); defs.append(cu, cd); fadeDefs(defs, id, T, PT, H, Y(base)); svg.append(defs);
  const sgn = t => (t > 0 ? '+' : t < 0 ? '−' : ''), toP = y => (y / base - 1) * 100; // 눈금 = 첫날 대비 %(첫 화면 「첫날 = 0%」와 같은 말) · 0% 는 점선
  gutterAxis(svg, wrap, {ticks: niceTicks(toP(lo), toP(hi)), Y: t => Y(base * (1 + t / 100)), x0: 4, x1: W - padR, base: 0, fmt: t => `${sgn(t)}${Math.abs(t)}%`});
  const ad = areaPath(close, X, Y, Y(base));
  svg.append(sv('path', {d: ad, fill: `url(#${id}gu)`, 'clip-path': `url(#${id}u)`}), sv('path', {d: ad, fill: `url(#${id}gd)`, 'clip-path': `url(#${id}d)`}));
  const path = arr => { let d = '', on = false; arr.forEach((y, i) => { if (y == null) { on = false; return; } d += (on ? 'L' : 'M') + X(i).toFixed(1) + ' ' + Y(y).toFixed(1); on = true; }); return d; };
  svg.append(sv('path', {d: path(avg), fill: 'none', stroke: T.mute, 'stroke-width': 1.5, 'stroke-dasharray': '4 3', 'stroke-linecap': 'round'}));
  const d = path(close);
  svg.append(sv('path', {d, fill: 'none', stroke: T.up, 'stroke-width': 2, 'stroke-linejoin': 'round', 'stroke-linecap': 'round', 'clip-path': `url(#${id}u)`}));
  svg.append(sv('path', {d, fill: 'none', stroke: T.down, 'stroke-width': 2, 'stroke-linejoin': 'round', 'stroke-linecap': 'round', 'clip-path': `url(#${id}d)`}));
  for (const [dt] of jumps) { const k = dates.indexOf(dt); if (k >= 0 && close[k] != null) svg.append(sv('circle', {cx: X(k), cy: Y(close[k]), r: 7, fill: 'none', stroke: T.gold, 'stroke-width': 2})); }
  const cv = close.filter(x => x != null), mxV = Math.max(...cv), mnV = Math.min(...cv); // 가장 높은 · 낮은 종가 — 그림에는 빈 동그라미 · 글은 그림 밑 한 줄(글이 선을 가리지 않게 · 데이터 눈)
  for (const z of [mxV, mnV]) { const k = close.indexOf(z); if (k >= 0) svg.append(sv('circle', {cx: X(k), cy: Y(z), r: 4, fill: T.night, stroke: T.ink, 'stroke-width': 1.5})); }
  const lastK = close.map((x, i) => (x == null ? -1 : i)).filter(i => i >= 0).pop();
  svg.append(sv('circle', {cx: X(lastK), cy: Y(close[lastK]), r: 4.5, fill: close[lastK] >= base ? T.up : T.down, stroke: T.night, 'stroke-width': 2}));
  const cx = sv('line', {y1: PT, y2: H - P, stroke: T.ink, 'stroke-opacity': 0.6, 'stroke-width': 1}), dot = sv('circle', {r: 5, fill: T.ink, stroke: T.night, 'stroke-width': 2}); cx.setAttribute('visibility', 'hidden'); dot.setAttribute('visibility', 'hidden'); svg.append(cx, dot);
  wrap.prepend(svg);
  const tip = h('div', {class: 'tip num'}); tip.hidden = true; wrap.append(tip);
  wrap.append(h('div', {class: 'ax'}, h('span', {text: ymd(dates[0])}), h('span', {text: ymd(dates[n - 1])})));
  wrap.append(h('p', {class: 'lc-ext'}, h('span', {class: 'num', text: '가장 높을 때 ' + won(mxV)}), ' · ', h('span', {class: 'num', text: '가장 낮을 때 ' + won(mnV)}))); // 이 회사 실제 가장 높은 · 낮은 종가(CIA팀 2026-10-12)
  const mv = e => { const r = svg.getBoundingClientRect(), x = (e.clientX - r.left) * W / r.width; let i = Math.round((x - 4) / ((W - 4 - padR) / Math.max(1, n - 1))); i = Math.max(0, Math.min(n - 1, i)); if (close[i] == null) return;
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
  box.append(h('p', {class: 'alt model'}, h('b', {text: '모형 가정 아래 추정 · 검증 전'}), ' — 지난 날들을 다시 뽑아 본 셈일 뿐, 앞날 값이 아닙니다.')); // model = 정직 표지 꼴(진주 띠 · 진주 글 — 숫자만큼 또렷하게)
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
    h('li', {text: E.pk ? `이 회사가 조건을 이어 지키는지: 새 1년 성적표가 나오면 다시 셉니다 — 3단 「왜 ${pickName(C)}에 들었나요?」를 보세요 · 들고 난 곳은 「업데이트 기록」(도움말 ?)에 남습니다.` : `이 회사가 조건에 드는지: 새 1년 성적표가 나오면 다시 셉니다 — 3단 「왜 ${pickName(C)} 밖인가요?」를 보세요 · 들고 난 곳은 「업데이트 기록」(도움말 ?)에 남습니다.`}))));
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
  const W = Math.max(260, Math.round(wrap.getBoundingClientRect().width || 320)), H = 230, P = 12, n = slots.length, padR = AXR();
  const top = Math.max(1.2, ...slots.map(s => (s.kind === 'fut' ? (s.x?.hi ?? 0) : s.v || 0))) * 1.08;
  const X = j => 4 + (j + 0.5) * (W - 4 - padR) / n, bw = Math.min(34, (W - 4 - padR) / n * 0.56), Y = y => H - P - y / top * (H - 2 * P);
  const svg = sv('svg', {viewBox: `0 0 ${W} ${H}`, width: W, height: H, role: 'img', 'aria-label': `${c.name} 매출 길 — ${G.baseYear}년 매출 = 1 · ` +
    slots.map(s => s.kind === 'fut' ? `${s.k}년 뒤(${s.lab}) ${s.x?.mid != null ? xMul(s.x.lo) + '~' + xMul(s.x.hi) + ' 가운데 ' + xMul(s.x.mid) : '자료 모자람'}` : `${s.lab}${s.kind === 'est' ? ' 증권사 평균치' : ''} ${xMul(s.v)}`).join(', ')});
  const fmtX = t => (Number.isInteger(t) ? String(t) : t.toFixed(1)) + '배';
  gutterAxis(svg, wrap, {ticks: niceTicks(0, top).filter(t => t > 0), Y, x0: 4, x1: W - padR, base: 1, fmt: fmtX}); // 눈금 = 배(1배 = 기준 해 매출 · 점선) — 옛 맨 위 「n배」 한 글(틀 값) 대신
  svg.append(sv('line', {x1: 4, x2: W - padR + 6, y1: Y(0), y2: Y(0), stroke: T['m4-line'], 'stroke-width': 1}));
  const jf = slots.findIndex(z => z.kind === 'fut'); if (jf > 0) { const xm = (X(jf - 1) + X(jf)) / 2; svg.append(sv('line', {x1: xm, x2: xm, y1: P, y2: H - P, stroke: T['m4-line'], 'stroke-width': 1, 'stroke-dasharray': '3 4'})); } // 기록 · 올해 | 1 · 3 · 5 · 10년 뒤 사이 가름 점선(해 사이가 같은 간격이 아님)
  const tipOf = [];
  slots.forEach((s, j) => {
    const x = X(j);
    if (s.kind === 'act') svg.append(sv('rect', {x: x - bw / 2, y: Y(Math.max(0, s.v)), width: bw, height: Math.max(1, Y(0) - Y(Math.max(0, s.v))), rx: 3, fill: T.sub}));
    else if (s.kind === 'est') svg.append(sv('rect', {x: x - bw / 2 + 1, y: Y(Math.max(0, s.v)), width: bw - 2, height: Math.max(1, Y(0) - Y(Math.max(0, s.v))), rx: 3, fill: 'none', stroke: T.sub, 'stroke-width': 2, 'stroke-dasharray': '6 4'}));
    else if (s.x && s.x.mid != null) {
      svg.append(sv('rect', {x: x - bw / 2, y: Y(s.x.hi), width: bw, height: Math.max(2, Y(s.x.lo) - Y(s.x.hi)), rx: 3, fill: T.ink, 'fill-opacity': 0.12, stroke: T.sub, 'stroke-width': 1}));
      svg.append(sv('line', {x1: x - bw / 2 - 3, x2: x + bw / 2 + 3, y1: Y(s.x.mid), y2: Y(s.x.mid), stroke: T.ink, 'stroke-width': 3, 'stroke-linecap': 'butt'}));
    } else svg.append(sv('line', {x1: x - bw / 2, x2: x + bw / 2, y1: Y(1), y2: Y(1), stroke: T.mute, 'stroke-width': 2, 'stroke-dasharray': '2 4'}));
    tipOf.push(s.kind === 'fut' ? `${s.k}년 뒤 ${s.lab}년 · ${s.x?.mid != null ? `${xMul(s.x.lo)} ~ ${xMul(s.x.hi)} · 가운데 ${xMul(s.x.mid)}` : '? 자료 모자람'}` : `${s.lab}년${s.kind === 'est' ? ' 증권사 평균치' : ''} · ${xMul(s.v)}`);
  });
  const cx = sv('line', {y1: P, y2: H - P, stroke: T.ink, 'stroke-opacity': 0.5, 'stroke-width': 1}); cx.setAttribute('visibility', 'hidden'); svg.append(cx);
  wrap.prepend(svg);
  const tip = h('div', {class: 'tip num'}); tip.hidden = true; wrap.append(tip);
  wrap.append(h('div', {class: 'ax'}, h('span', {text: `${slots[0].lab}년 →`}), h('span', {text: S ? `1 · 3 · 5 · 10년 뒤(${slots[n - 1].lab}년까지)` : `${slots[n - 1].lab}년`})));
  const mv = e => { const r = svg.getBoundingClientRect(), xx = (e.clientX - r.left) * W / r.width; const j = Math.max(0, Math.min(n - 1, Math.floor((xx - 4) / ((W - 4 - padR) / n))));
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
// ── 급등 탭(사장님 2026-10-15 14:27(싱가포르) 「탭을 하나 더 만들어라 … 최근 5일에 급등한 종목을 36개 모아높는곳이다 … 하루에 4번 업데이트할때미다 그때 선택도 하고 탈락도 시켜라」 · 규칙 69)
//   일꾼 여섯(분석 · 방첩 · 수집 실험 · 경보 · 레드 셀 · 브리핑)이 따로 → 결정표 → 반대만 받는 토론 한 판 → 결정표 v2(sv-v1)
//   한 장 차례(다섯 질문): 머리(때 한 줄 · 판단 한 문단 · 정직 한 문장 · ? 한 줄) → 그림 「5일 오름 자」(첫 화면 안) → 들고 남 → 견줌(세 숫자) → 어떤 곳들(줄) → 조심할 것과 모르는 것 → 더 확인할 곳 → 지난 업데이트 → 어떻게 골랐나요?
//   숫자는 모두 surge.json(surge.py 셈 · surge_verify.mjs 따로 셈) — 화면은 보여 주기만 · 차례 번호 · 1등 빛 · 「들어온 뒤 %」 · 그 뒤 기록 상자 · 기관 이름 없음 · 금빛은 「?」 「!」 · 장 중에 든 줄만
const SV_LO = -20, SV_HI = 80; // 그림 자 — 5일 오름 %(곧은 눈금 · 넘는 곳은 끝에 쌓음)
const svTime = S => (S.provisional && isTime(S.got) ? `${dayK(S.got)} ${ampm(S.got)} 값` : isDay(S.asOf) ? `${md(S.asOf)} 장${NB}마감` : '?'); // 장 중은 짧게(아주 큰 글씨 · 좁은 화면에서도 한 줄 — 새 눈 점검 2 · 9) · 「장 중」은 그림 밑 회색 한 줄 // 때 한 줄(브리핑 눈 — 같은 때를 두 번 쓰지 않음 · 고른 때는 아래 「지난 업데이트」)
const svChange = S => (S.carry ? `목록은 ${kstLabel(S.carry.fromKst)}에 고른 그대로예요.`
  : S.kind !== 'pick' ? '처음 고른 목록이에요.'
  : (S.in?.length || S.out?.length) ? `${S.in.length}곳이 새로 들고 ${S.out.length}곳이 나갔어요.` : '이번에 바뀐 곳은 없어요.');
const svNext = () => { const sl = D.surge?.rules?.slots ?? ['10:00', '12:00', '14:00', '18:00'], k = new Date(Date.now() + 9 * 36e5), m = k.getUTCHours() * 60 + k.getUTCMinutes(), wd = k.getUTCDay(), nx = sl.find(x => +x.slice(0, 2) * 60 + +x.slice(3, 5) > m); return wd > 0 && wd < 6 && nx ? `오늘 ${nx}` : `다음 장날 ${sl[0]}`; };
/** 그림 한 장 「5일 오름 자」(브리핑 눈) — 회색 산 = 값 있는 모든 회사가 몰린 곳(1%p 칸) · 점선 = 모든 회사 가운데값 · 진주 점선 = 들어오는 문턱 · 빨간 점 = 목록 한 곳(쌓음) · 진주 테 = 이번에 새로 */
function svChart(host, S, BD = null) { // BD = 네 칸 가운데 하나(10%대 · 20%대 · 30%대 · 40% 넘게) — 점 = 그 칸 줄 · 점선 둘 = 칸 끝
  host.textContent = '';
  const T = tok(), M = BD ? BD.M : (S.members ?? []), wrap = h('div', {class: 'svr'}); host.append(wrap);
  const W = Math.max(260, Math.round(wrap.getBoundingClientRect().width || 320)), H = 150, P = 12, base = H - 6, mtH = 54;
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
  // 글(HTML · 21px) — 문턱은 위 · 가운데값은 아래 왼쪽 · 끝(80% 넘게)에 쌓인 곳 수는 아래 오른쪽(좁은 화면에서도 겹치지 않게 넓이를 재어 자리 · 그래도 겹치면 끝 글을 범례 줄로)
  const lab = h('div', {class: 'svl', 'aria-hidden': 'true'}), mk = (cls2, text) => { const e = h('span', {class: cls2 + ' num', text}); lab.append(e); return e; };
  const thX = gate.length ? gate.at(-1) : null, th = thX == null ? null : mk('sv-th', BD ? (BD.hi == null ? `${BD.lo}% 이상` : `${BD.lo}% ~ ${BD.hi}%`) : `문턱 ${pct(S.rules.enter)}`), md0 = S.market?.med != null ? mk('sv-md', `가운데 ${pct(S.market.med)}`) : null;
  const nHi = M.filter(m => m.r5 > SV_HI).length, hi = nHi ? mk('sv-hi', `${SV_HI}% 넘게 ${nHi}곳`) : null;
  wrap.append(lab);
  const tip = h('div', {class: 'tip num'}); tip.hidden = true; wrap.append(tip);
  const place = () => {
    const at = (e, x, top) => { const w = e.offsetWidth || 80, L = Math.max(0, Math.min(W - w, x - w / 2)); st(e, {left: L + 'px', [top ? 'top' : 'bottom']: '0'}); return [L, L + w]; };
    if (th) { const w = th.offsetWidth || 120, x = X(thX), L = x + 6 + w <= W ? x + 6 : Math.max(0, x - 6 - w); st(th, {left: L + 'px', top: '0'}); } // 문턱 글은 그림 위쪽 빈 곳 · 점선 오른쪽(위 띠를 없애 그림을 첫 화면 안으로 · 새 눈 점검 1)
    const m = md0 ? at(md0, X(S.market.med), false) : null;
    if (hi) { hi.hidden = false; const w = hi.offsetWidth || 120, L = W - w; st(hi, {left: L + 'px', bottom: '0'});
      if (m && m[1] + 8 > L) { const L2 = Math.max(0, L - 8 - (m[1] - m[0])); st(md0, {left: L2 + 'px'}); if (L2 + (m[1] - m[0]) + 8 > L) hi.hidden = true; } }
  };
  place(); requestAnimationFrame(place);
  const near = ev => { const r = svg.getBoundingClientRect(), x = (ev.clientX - r.left) * W / r.width, y = (ev.clientY - r.top) * H / r.height; let best = null, bd = 18 * 18; for (const d of dots) { const q = (d.x - x) ** 2 + (d.y - y) ** 2; if (q < bd) { bd = q; best = d; } } return best; };
  svg.addEventListener('pointerdown', ev => { const d = near(ev); if (!d) { tip.hidden = true; return; } tip.hidden = false; tip.textContent = `${d.m.n} ${pct(d.m.r5)}`; const r = svg.getBoundingClientRect(); tip.style.left = Math.min(r.width - 80, Math.max(80, d.x * r.width / W)) + 'px'; });
  svg.addEventListener('pointerleave', ev => { if (ev.pointerType === 'mouse') tip.hidden = true; }); // 손가락으로 누르면 떼는 순간 pointerleave 가 와서 바로 숨던 것(새 눈 점검 2) — 마우스만 숨김
}
const svRow = (o, showPct) => h('a', {class: 'sv-row', href: cHref(o.c)}, h('span', {class: 'top'}, h('span', {class: 'nm', text: o.n}), showPct ? (o.r5 == null ? h('b', {class: 'num q', text: '?'}) : pctEl(o.r5)) : null), h('span', {class: 'why' + (/^\?/.test(o.why) ? ' q' : ''), text: o.why}), h('span', {class: 'chev', 'aria-hidden': 'true', text: '›'}));
// ── 급등 다섯 칸 · 날마다 달력 · 며칠 뒤(사장님 2026-10-15(싱가포르) 16:28 「10프로 20프로 30프로40프로 탭도 만들어 총 5개를 만드는거야」 · 16:34 「가 가 각각 최대 36를 찾고 / 이렇개 찾아내 종목들을 추적해서 달력에 기록하는 시스템 … 매일 매일 선택됐다 탈락 됐다 이동 했다 해야해」 · 16:40 「아니 매일매일 그리고 나서 내가 관심 없음 버트을 클릭하면 없어지는구조」 · 16:44 「그래 만들어」)
//   칸 = 급등(sv-v1 그대로) · 10%대 · 20%대 · 30%대 · 40% 넘게(sb-v1 · 칸끼리 안 겹침 · 칸마다 자리 36까지) — 급등 화면 맨 위 다섯 칸(#/surge · #/surge/10 · /20 · /30 · /40)
//   달력 · 따라가기 = surgecal.json(sk-v1 — surge.py 셈 · surge_verify.mjs 따로 셈 · 지난 25거래일) · 화면은 보여 주기만
//   「관심 없음」 = 보는 기계에만(localStorage) — 따라가기 목록에서만 빠짐 · 셈 · 공개 자료 · 다섯 칸 목록은 그대로 · 숨긴 곳도 고리는 남김(접은 칸 「다시 보기」)
const SV_TABS = [['sv', '급등'], ['b10', '10%'], ['b20', '20%'], ['b30', '30%'], ['b40', '40%']];
const SV_NAME = {sv: '급등', b10: '10%\u2060대', b20: '20%\u2060대', b30: '30%\u2060대', b40: '40%\u00a0이상'}; // 40% 칸 = 1.40 이상(새 눈 점검 2 — 「넘게」가 아님) · \u00a0 = 「40%」와 「이상」이 갈리지 않게 // \u2060 = 「10%」와 「대」 사이에서 줄이 갈리지 않게(보이지 않는 이음표)
const svJ = (o, tail) => Object.fromEntries(Object.entries(o).map(([k, x]) => [k, x + tail]));
const SV_KAN = {sv: '급등 칸에', ...svJ({b10: SV_NAME.b10, b20: SV_NAME.b20, b30: SV_NAME.b30, b40: SV_NAME.b40}, ' 칸에')};
const SV_FROM = svJ({b10: SV_NAME.b10, b20: SV_NAME.b20, b30: SV_NAME.b30, b40: SV_NAME.b40}, ' 칸에서'), SV_TO = svJ({b10: SV_NAME.b10, b20: SV_NAME.b20, b30: SV_NAME.b30, b40: SV_NAME.b40}, ' 칸으로');
const svHref = t => '#/surge' + (t === 'sv' ? '' : '/' + t.slice(1));
const svChips = cur => h('nav', {class: 'sv-chips', 'aria-label': '급등 다섯 칸'}, ...SV_TABS.map(([t, lab]) => h('a', {class: 'sv-chip', href: svHref(t), 'aria-current': t === cur ? 'page' : null, text: lab})));
let surgeCalP = null; // 달력 · 따라가기(surgecal.json) — 못 받으면 그 칸만 「?」
function needSurgeCal() { if (!surgeCalP) surgeCalP = getJson('surgecal.json').then(s => { D.surgeCal = s; }).catch(e => { surgeCalP = null; throw e; }); return surgeCalP; }
const dPlus = (d, k) => new Date(Date.parse(d + 'T00:00:00Z') + k * 864e5).toISOString().slice(0, 10), dDow = d => new Date(d + 'T00:00:00Z').getUTCDay();
const svCalOk = K => !!(K && K.version === 'sk-v1' && Array.isArray(K.dates) && K.dates.length && K.dates.every(isDay) && Array.isArray(K.days) && Array.isArray(K.track));
/** 이 칸의 그날 사건 — 든 = 처음 담음 · 새로 듦 · 옮겨 옴 / 뺌 = 빠짐 · 옮겨 감(회사 수) · 줄 = [때, 업데이트, 번호, 이름, 종류, 칸, 옮긴 칸] */
function svDayOf(K, d, tab) {
  const ev = (K.days.find(x => x.d === d)?.ev ?? []).filter(e => e[5] === tab || e[6] === tab);
  const isIn = e => (e[4] === 'move' ? e[6] === tab : (e[4] === 'first' || e[4] === 'in') && e[5] === tab), isOut = e => (e[4] === 'move' ? e[5] === tab : e[4] === 'out' && e[5] === tab);
  return {ev, nIn: new Set(ev.filter(isIn).map(e => e[2])).size, nOut: new Set(ev.filter(isOut).map(e => e[2])).size};
}
/** 이름 고리 — 옮긴 곳(어디서 · 어디로)은 한 줄에 한 곳 · 나머지는 「 · 」로 잇고 15곳 넘으면 12곳 + 접은 칸 · xs = [{c, n, t}] */
function svNames(lab, xs) {
  const box = h('div', {class: 'sv-nl'}), withT = xs.some(x => x.t), cut = xs.length > 15 ? 12 : xs.length;
  const one = x => [h('a', {class: 'inl', href: cHref(x.c), text: x.n}), x.t ? h('span', {class: 'sv-tl', text: x.t}) : null];
  const body = ys => (withT ? h('ul', {class: 'sv-ml'}, ...ys.map(x => h('li', {}, ...one(x)))) : h('p', {class: 'sv-in'}, ...ys.flatMap((x, i) => [i ? ' · ' : null, ...one(x)])));
  box.append(h('p', {class: 'sv-in'}, h('b', {text: `${lab} ${xs.length}곳`})), body(xs.slice(0, cut)));
  if (xs.length > cut) box.append(h('details', {class: 'more'}, h('summary', {text: `나머지 ${xs.length - cut}곳 보기`}), h('div', {class: 'in'}, body(xs.slice(cut)))));
  return box;
}
/** 고른 날 하나 — 업데이트(때)마다 늦은 때가 위 · 들어온 곳(처음 담음 · 새로 듦 · 옮겨 옴) · 나간 곳(빠짐 · 옮겨 감) — 달력 칸 「든 · 뺌」 수와 같은 묶음(새 눈 점검 10) */
function svDayPanel(K, d, tab) {
  const {ev, nIn, nOut} = svDayOf(K, d, tab), p = h('div', {class: 'sv-day', 'data-d': d});
  p.append(h('p', {class: 'sv-dh'}, h('b', {text: mdw(d)}), ev.length ? ' — ' + [nIn ? `들어온 곳 ${nIn}` : null, nOut ? `나간 곳 ${nOut}` : null].filter(Boolean).join(' · ') : ''));
  if (!ev.length) { p.append(h('p', {class: 'small', text: '이날 이 칸은 바뀐 곳이 없어요.'})); return p; }
  const G = new Map(); for (const e of ev) { const k = e[0] + '|' + (e[1] ?? ''); if (!G.has(k)) G.set(k, []); G.get(k).push(e); }
  for (const [k, es] of [...G].sort((a, b) => (a[0] < b[0] ? 1 : a[0] > b[0] ? -1 : 0))) {
    const [kst, slot] = k.split('|'), when = (kst.slice(0, 10) !== d && isDay(kst) ? md(kst.slice(0, 10)) + ' ' : '') + (slot || kst.slice(11, 16));
    p.append(h('p', {class: 'sv-ut', text: slot ? `${when} 업데이트` : `${when}에 처음 골랐어요`}));
    const of = f => es.filter(f).map(e => ({c: e[2], n: e[3], e}));
    const ins = [['처음 담은 곳', of(e => e[4] === 'first' && e[5] === tab)], ['새로 든 곳', of(e => e[4] === 'in' && e[5] === tab)], ['옮겨 온 곳', of(e => e[4] === 'move' && e[6] === tab).map(x => ({...x, t: SV_FROM[x.e[5]]}))]].filter(x => x[1].length);
    const outs = [['빠진 곳', of(e => e[4] === 'out' && e[5] === tab)], ['다른 칸으로 옮겨 간 곳', of(e => e[4] === 'move' && e[5] === tab).map(x => ({...x, t: SV_TO[x.e[6]]}))]].filter(x => x[1].length);
    for (const [head, parts] of [['들어온 곳', ins], ['나간 곳', outs]]) {
      if (parts.length > 1) p.append(h('p', {class: 'sv-io'}, h('b', {text: `${head} ${parts.reduce((a, x) => a + x[1].length, 0)}곳`}), ` = ${parts.map(x => x[0]).join(' + ')}`));
      for (const [lab, xs] of parts) p.append(svNames(lab, xs));
    }
  }
  return p;
}
/** 날마다 달력(무엇이 변했나 — 날마다) — 월 ~ 금 다섯 줄 · 칸 = 그날 이 칸에 든 곳 · 뺀 곳 수 · 누르면 그날 이름 */
function svCal(v, tab, ok) {
  v.append(h('h2', {class: 'sec', id: 'svCalH', text: '날마다 달력'}));
  const K = D.surgeCal;
  if (!ok || !svCalOk(K)) { v.append(h('p', {class: 'q', text: '? 달력 자료를 못 받았어요. 잠시 뒤 다시 열어 주세요.'})); return; }
  const dates = K.dates, set = new Set(dates), last = dates.at(-1);
  const tabDays = K.days.filter(x => set.has(x.d) && x.ev.some(e => e[5] === tab || e[6] === tab)).map(x => x.d).sort();
  const f0 = K.days.filter(x => set.has(x.d) && x.ev.some(e => e[4] === 'first' && e[5] === tab)).map(x => x.d).sort()[0];
  const start = f0 && tabDays[0] === f0 ? f0 : dates[0]; // 이 칸을 처음 고른 날이 창 안이면 그 앞은 「기록 전」
  v.append(h('p', {class: 'note', text: `하루 4번 업데이트 때 적어요. 날짜를 누르면 그날 ${SV_KAN[tab]} 들어온 곳과 나간 곳이 나와요.`}));
  if (start > dates[0]) v.append(h('p', {class: 'small', text: `${md(start)}부터 적었어요. 날마다 쌓여 지난 ${K.keep}거래일까지 남아요.`}));
  const head = h('div', {class: 'sv-wk hd', 'aria-hidden': 'true'}, ...['월', '화', '수', '목', '금'].map(t => h('span', {text: t})));
  const from = start > dates[0] ? start : dates[0]; // 기록이 짧으면 처음 적은 주부터(빈 칸이 줄지어 서지 않게)
  const grid = h('div', {class: 'sv-wk', role: 'group', 'aria-label': `${SV_NAME[tab]} 칸 날마다 달력 — ${md(from)} ~ ${md(last)}`});
  const panels = h('div', {class: 'sv-days'}), seen = {pre: 0, off: 0, none: 0};
  let mo = '', pick = null;
  for (let d = dPlus(from, 1 - dDow(from)), end = dPlus(last, 5 - dDow(last)); d <= end; d = dPlus(d, 1)) {
    const w = dDow(d); if (w === 0 || w === 6) continue;
    if (d < dates[0] || d > last) { grid.append(h('div', {class: 'sv-cell blank'})); continue; }
    const m = +d.slice(5, 7), dn = [m !== +mo ? h('span', {class: 'mo', text: `${m}월`}) : null, h('span', {class: 'dn num', text: String(+d.slice(8, 10))})]; if (m !== +mo) mo = String(m);
    if (!set.has(d)) { seen.off++; grid.append(h('div', {class: 'sv-cell off'}, ...dn, h('span', {class: 'cx', text: '쉼'}))); continue; }
    if (d < start) { seen.pre++; grid.append(h('div', {class: 'sv-cell pre'}, ...dn, h('span', {class: 'cx', text: '—'}))); continue; }
    const {ev, nIn, nOut} = svDayOf(K, d, tab);
    if (!ev.length) seen.none++;
    const b = h('button', {type: 'button', class: 'sv-cell', 'data-d': d, 'aria-pressed': 'false', 'aria-label': `${mdw(d)} ${ev.length ? `든 곳 ${nIn} · 빠진 곳 ${nOut}` : '바뀐 곳 없음'}`}, ...dn,
      ev.length ? [nIn ? h('span', {class: 'ci num', text: `든 ${nIn}`}) : null, nOut ? h('span', {class: 'co num', text: `뺌 ${nOut}`}) : null] : h('span', {class: 'cx', text: '없음'}));
    grid.append(b); const pn = svDayPanel(K, d, tab); pn.hidden = true; panels.append(pn);
    if (ev.length) pick = d;
  }
  pick = pick ?? last;
  const sel = d => { for (const b of grid.querySelectorAll('button.sv-cell')) b.setAttribute('aria-pressed', String(b.dataset.d === d)); for (const p of panels.children) p.hidden = p.dataset.d !== d; };
  grid.addEventListener('click', e => { const b = e.target.closest('button.sv-cell'); if (b) sel(b.dataset.d); });
  v.append(h('div', {class: 'sv-cal'}, head, grid));
  v.append(h('p', {class: 'lkey sv-ckey'}, h('span', {text: '든 = 들어온 곳'}), h('span', {text: '뺌 = 나간 곳(빠지거나 다른 칸으로 옮긴 곳)'}), seen.none ? h('span', {text: '없음 = 바뀐 곳 없음'}) : null, seen.off ? h('span', {text: '쉼 = 장이 쉰 날'}) : null, seen.pre ? h('span', {text: '— = 기록 전'}) : null));
  v.append(panels); sel(pick);
}
// 관심 없음 — 보는 기계에만(사장님 16:40) · 기억 못 하는 기계(사생활 창 등)는 이 화면 동안만
const SV_HIDE = 'atlas:surge-hide';
let svHideMem = new Set();
function hideGet() { try { const x = JSON.parse(localStorage.getItem(SV_HIDE) || '[]'); return new Set(Array.isArray(x) ? x.filter(c => typeof c === 'string' && /^[0-9A-Z]{6}$/.test(c)).slice(0, 5000) : []); } catch { return new Set(svHideMem); } }
function hidePut(s) { svHideMem = new Set(s); try { localStorage.setItem(SV_HIDE, JSON.stringify([...s].sort())); return true; } catch { return false; } }
/** 줄 선 — 처음 찾은 날 종가 = 0 · 날마다 · 값이 빈 날은 끊음(앞뒤가 빈 날 하나는 점 — 새 눈 점검 11) · 마지막 값이 오르면 빨강 · 내리면 파랑 */
function svSpark(t, P) {
  const vals = [0, ...P.map(p => p[1])], n = vals.length, nn = vals.filter(x => x != null), lo = Math.min(0, ...nn), hi = Math.max(0, ...nn), span = hi - lo || 1;
  const X = i => 2 + i * 96 / Math.max(1, n - 1), Y = x => 3 + (hi - x) / span * 24, T = tok(), lastV = [...vals].reverse().find(x => x != null);
  const s = sv('svg', {viewBox: '0 0 100 30', preserveAspectRatio: 'none', class: 'spk', role: 'img', 'aria-label': `${t.n} — 처음 찾은 날 종가부터 날마다: ` + (P.length ? P.map(p => `${md(p[0])} ${pct(p[1])}`).join(', ') : '아직 없음')});
  s.append(sv('line', {x1: 0, x2: 100, y1: Y(0).toFixed(1), y2: Y(0).toFixed(1), stroke: T.mute, 'stroke-width': 1, 'stroke-dasharray': '2 3', 'vector-effect': 'non-scaling-stroke'}));
  let d = '', pen = false; vals.forEach((x, i) => { if (x == null) { pen = false; return; } d += (pen ? 'L' : 'M') + X(i).toFixed(1) + ' ' + Y(x).toFixed(1); pen = true; });
  vals.forEach((x, i) => { if (x != null && vals[i - 1] == null && vals[i + 1] == null) d += `M${(X(i) - 1.4).toFixed(1)} ${Y(x).toFixed(1)}L${(X(i) + 1.4).toFixed(1)} ${Y(x).toFixed(1)}`; });
  s.append(sv('path', {d, class: 'ln ' + cls(lastV), fill: 'none', stroke: lastV > 0 ? T.up : lastV < 0 ? T.down : T.mute, 'stroke-width': 2.4, 'stroke-linejoin': 'round', 'stroke-linecap': 'round', 'vector-effect': 'non-scaling-stroke'}));
  return s;
}
/** 줄 하나 — 이름 | 관심 없음 · 처음 찾은 칸 / 지금 든 칸(두 줄) · 작은 선 | n일 뒤 ±x% */
function svTrRow(t) {
  const P = t.path ?? []; let li = -1; for (let i = P.length - 1; i >= 0; i--) if (P[i][1] != null) { li = i; break; }
  const nowT = (t.now ?? []).map(x => SV_NAME[x]).filter(Boolean);
  return h('div', {class: 'sv-tr', 'data-c': t.c},
    h('div', {class: 'sv-trt'}, h('a', {class: 'nm', href: cHref(t.c), text: t.n}), h('button', {type: 'button', class: 'sv-hide', 'data-c': t.c, text: '관심 없음'})), // 이름이 길면 단추가 밑 줄로(이름은 가르지 않음)
    h('p', {class: 'sub'}, h('span', {text: `처음 찾은 칸: ${SV_NAME[t.t] ?? '?'}`}), h('span', {text: nowT.length ? `지금 든 칸: ${nowT.join(', ')}` : '지금은 다섯 칸 밖'})),
    svSpark(t, P),
    h('span', {class: 'v'}, li >= 0 ? h('span', {class: 'dd', text: `${li + 1}일 뒤 `}) : null, li >= 0 ? pctEl(P[li][1]) : h('b', {class: 'num q', text: '?'})));
}
/** 며칠 뒤 어떻게 됐나(확인할 것) — 이 칸에 한 번이라도 든 곳(지난 25거래일) · 다섯 칸 어디든 처음 찾은 날마다 한 묶음(새 날이 위 · 맨 위만 펼침) · 처음 찾은 날 종가부터 날마다
 *   「관심 없음」 = 그 자리에 「숨겼어요 · 되돌리기」(줄이 위로 밀려 다른 곳을 잘못 누르지 않게 — 새 눈 점검 2) · 숨긴 곳은 맨 밑 「숨긴 곳 n곳 보기」 · 다섯 칸 모두 같음 · 이 휴대폰에서만 */
function svTrack(v, tab, ok) {
  v.append(h('h2', {class: 'sec', id: 'svTrkH', text: '며칠 뒤 어떻게 됐나'}));
  const K = D.surgeCal;
  if (!ok || !svCalOk(K)) { v.append(h('p', {class: 'q', text: '? 따라간 기록을 못 받았어요. 잠시 뒤 다시 열어 주세요.'})); return; }
  const ever = new Set(K.track.filter(t => (t.now ?? []).includes(tab)).map(t => t.c));
  for (const x of K.days) for (const e of x.ev) if (e[5] === tab || e[6] === tab) ever.add(e[2]);
  const all = K.track.filter(t => ever.has(t.c)), went = all.filter(t => t.path?.length), fresh = all.filter(t => !t.path?.length && t.d === K.asOf).length, nobase = all.filter(t => !t.path?.length && t.d !== K.asOf).length;
  v.append(h('p', {class: 'note', text: `${SV_KAN[tab]} 한 번이라도 든 곳이에요. 다섯 칸 어디든 처음 찾은 날 종가부터 날마다 몇 %인지 적어요. 날은 장이 열린 날로 세고, 처음 찾은 날부터 ${K.keep}거래일까지 적어요.`}));
  if (went.length) v.append(h('p', {class: 'small', text: '「관심 없음」을 누르면 이 목록에서 빠져요. 다섯 칸 모두 같아요. 이 휴대폰에서만 그래요. 위 칸 목록은 그대로예요.'}));
  if (K.provisional && isDay(K.asOf) && went.length) v.append(h('p', {class: 'sv-prov', text: `${md(K.asOf)} 값은 장 중 값이에요. 저녁 8시까지 바뀌어요.`}));
  const days = [...new Set(went.map(t => t.d))].sort().reverse(), byName = (a, b) => a.n.localeCompare(b.n, 'ko') || (a.c < b.c ? -1 : 1);
  const box = h('div', {class: 'sv-trs'}), live = h('p', {class: 'sr', role: 'status', 'aria-live': 'polite'});
  const goneEl = () => { const hid = hideGet(), gone = went.filter(t => hid.has(t.c)).sort(byName); if (!gone.length) return null;
    return h('details', {class: 'more sv-gone'}, h('summary', {text: `숨긴 곳 ${gone.length}곳 보기`}), h('div', {class: 'in'}, ...gone.map(t => h('p', {class: 'sv-g'}, h('a', {class: 'inl', href: cHref(t.c), text: t.n}), h('button', {type: 'button', class: 'sv-show', 'data-c': t.c, text: '되돌리기'}))))); };
  const tail = h('div', {class: 'sv-tail'});
  const drawTail = () => { const open = tail.querySelector('details.sv-gone')?.open; tail.textContent = '';
    if (fresh) tail.append(h('p', {class: 'small', text: `${isDay(K.asOf) ? md(K.asOf) + '에' : '마지막 날'} 처음 찾은 ${fresh}곳은 다음 장날부터 적혀요.`}));
    if (nobase) tail.append(h('p', {class: 'q', text: `? 처음 찾은 날 종가가 없어 못 적은 곳 ${nobase}곳`}));
    const g = goneEl(); if (g) { if (open) g.open = true; tail.append(g); } };
  const draw = () => {
    const open = new Set([...box.querySelectorAll('details.sv-grp[open]')].map(x => x.dataset.d)), first = !box.childElementCount;
    box.textContent = '';
    const hid = hideGet(); let shownAny = false;
    if (!went.length) box.append(h('p', {class: 'q', text: '? 아직 따라간 날이 없어요.'}));
    for (const d of days) {
      const rows = went.filter(t => t.d === d && !hid.has(t.c)).sort(byName); if (!rows.length) continue;
      const k = Math.max(...rows.map(t => t.path.length)), g = h('details', {class: 'more sv-grp', 'data-d': d}, h('summary', {text: `${md(d)}에 처음 찾은 곳 ${rows.length}곳 — ${k}일 뒤`}), h('div', {class: 'in'}, ...rows.map(svTrRow)));
      if (first ? !shownAny : open.has(d)) g.open = true;
      box.append(g); shownAny = true;
    }
    if (went.length && !shownAny) box.append(h('p', {class: 'small', text: '보이는 곳이 없어요. 모두 숨겼어요.'}));
    drawTail();
  };
  const say = msg => { live.textContent = msg; };
  v.addEventListener('click', e => {
    const b = e.target.closest('button[data-c]'); if (!b || !(box.contains(b) || tail.contains(b))) return;
    const c = b.dataset.c, t = all.find(x => x.c === c); if (!t) return;
    const hid = hideGet();
    if (b.classList.contains('sv-hide')) { // 그 자리에 「숨겼어요 · 되돌리기」 — 줄 높이 그대로(아래 줄이 손가락 밑으로 올라오지 않게)
      hid.add(c); const kept = hidePut(hid), row = b.closest('.sv-tr'), hh = row.offsetHeight;
      const undo = h('button', {type: 'button', class: 'sv-undo', 'data-c': c, text: '되돌리기'}), ph = h('div', {class: 'sv-ph', 'data-c': c}, h('span', {class: 'sv-phn', text: `${t.n} 숨겼어요`}), undo);
      st(ph, {minHeight: hh + 'px'}); row.replaceWith(ph); drawTail(); try { undo.focus({preventScroll: true}); } catch { /* 초점 못 옮김 */ }
      say(`${t.n} 숨겼어요.${kept ? '' : ' 이 기계는 기억을 못 해 다시 열면 돌아와요.'}`);
    } else if (b.classList.contains('sv-undo')) { hid.delete(c); hidePut(hid); b.closest('.sv-ph').replaceWith(svTrRow(t)); drawTail(); say(`${t.n} 다시 보여요.`); }
    else if (b.classList.contains('sv-show')) { hid.delete(c); hidePut(hid); draw(); say(`${t.n} 다시 보여요.`); }
  });
  draw();
  v.append(box, tail, live, h('p', {class: 'hon sv-hon', text: '지난 값일 뿐 앞날을 말하지 않아요.'}));
}
/** 칸 머리 — 제목 · 때 한 줄 */
function svHead(v, title, S) { v.append(h('h1', {class: 'head', text: title}), h('p', {class: 'count', text: svTime(S)})); }
/** 「며칠 뒤 어떻게 됐나 ↓」 — 그림 바로 밑(맨 밑 따라가기로 바로 — 새 눈 점검 3 · 그림은 첫 화면 안 그대로) */
function svJump(v) {
  const go = h('button', {type: 'button', class: 'sv-go', text: '며칠 뒤 어떻게 됐나 ↓'});
  go.addEventListener('click', () => { const x = document.getElementById('svTrkH'); if (x) x.scrollIntoView({block: 'start', behavior: RM.matches ? 'auto' : 'smooth'}); });
  v.append(h('p', {class: 'sv-jump'}, go));
}
// 회사를 보고 뒤로 오면 그 칸 그 자리 · 고른 날 · 펼친 묶음 그대로(새 눈 점검 3 — 회사를 하나씩 볼 때 맨 위로 튀지 않게) · 이 열린 창 안에서만(저장 안 함)
const svMem = new Map();
function svLeave(from) { if (!/^#\/surge/.test(from || '')) return; const q = s2 => document.querySelector('#view ' + s2);
  svMem.set(from, {y: window.scrollY, day: q('.sv-wk button.sv-cell[aria-pressed="true"]')?.dataset.d ?? null, open: [...document.querySelectorAll('#view details.sv-grp')].filter(x => x.open).map(x => x.dataset.d), gone: !!q('details.sv-gone')?.open}); }
function svBack(to, from) { const m = svMem.get(to); if (!m || !/^#\/surge/.test(to) || !/^#\/c\//.test(from || '')) return;
  if (m.day) document.querySelector(`#view .sv-wk button.sv-cell[data-d="${m.day}"]`)?.click();
  for (const x of document.querySelectorAll('#view details.sv-grp')) x.open = m.open.includes(x.dataset.d);
  const g = document.querySelector('#view details.sv-gone'); if (g) g.open = m.gone;
  requestAnimationFrame(() => window.scrollTo(0, m.y)); }
async function viewSurge(v, tab = 'sv') {
  await needSurge();
  const ok = await needSurgeCal().then(() => true, () => false); // 달력 · 따라가기는 못 받아도 목록은 보임(그 칸만 「?」)
  v.append(svChips(tab));
  if (tab === 'sv') svMain(v, D.surge, ok); else svBand(v, D.surge, tab, ok);
}
function svMain(v, S, ok) {
  const M = S.members ?? [], n = M.length, F = S.facts ?? {}, cap = S.cap ?? n, FU = S.funnel ?? {}, CUT = S.cut ?? {};
  // ① 무엇이 변했나 — 때 한 줄 · 판단 한 문장 → 바로 그림(어떤 글씨 크기에서도 첫 화면 안 · 새 눈 점검 1) → 정직 한 문장 · 「?」
  svHead(v, `급등 ${n}곳`, S);
  v.append(h('p', {class: 'sv-lead', text: n ? `지난 5일 동안 ${n}곳이 ${pct(S.stats.lo)} ~ ${pct(S.stats.hi)} 올랐어요.` : '지난 5일 동안 문턱을 넘은 곳이 없어요.'}));
  const host = h('div', {class: 'svc'}); v.append(host); svChart(host, S); chartDraw = () => svChart(host, S);
  v.append(h('p', {class: 'lkey'}, h('span', {}, h('i', {class: 'l-dot'}), `급등 ${n}곳`), S.kind === 'pick' && S.in?.length ? h('span', {}, h('i', {class: 'l-dot new'}), '이번에 새로') : null, h('span', {}, h('i', {class: 'l-mt'}), `셀 수 있는 회사 ${(S.market?.n ?? 0).toLocaleString('ko-KR')}곳`)));
  svJump(v);
  if (S.provisional) v.append(h('p', {class: 'sv-prov', text: '장 중 값이에요. 저녁 8시까지 바뀌어요.'})); // 장 중 = 회색 한 줄(금빛 아님 · 브리핑 눈)
  v.append(h('p', {class: 'hon sv-hon', text: '사고팔 곳을 고른 목록이 아니에요.'}));
  v.append(h('p', {class: 'q', text: '? 오른 까닭은 몰라요.'}));
  if (D.core?.asOf && isDay(S.asOf) && S.asOf < D.core.asOf) v.append(h('p', {class: 'q', text: `? 이 목록은 ${md(S.asOf)} 값이에요. 그 뒤 값은 다음 업데이트에 들어가요.`})); // 목록이 사이트 값보다 늦음(새 눈 점검 7)
  if (S.carry?.why) v.append(h('p', {class: 'q', text: '? ' + S.carry.why}));
  if (S.strict) v.append(h('p', {class: 'q', text: '? 장 중에 든 곳이 장 마감 값으로 자주 빠져, 지금은 두 번 넘어야 들어와요.'}));
  if (n < cap) v.append(h('p', {class: 'note', text: `오늘은 문턱을 넘은 곳이 ${n}곳뿐이에요. 억지로 채우지 않아요.`}));
  // 들고 남 — 바뀐 수 한 문장 → 새로 든 곳 이름(회사 고리) → 나간 곳(접음) → 앞 날 장 중에 든 곳 다시 보기
  v.append(h('p', {class: 'sv-chg', text: svChange(S)}));
  if (S.out?.length) v.append(h('details', {class: 'more sv-outs'}, h('summary', {text: `나간 곳 ${S.out.length}곳 — 까닭 보기`}), h('div', {class: 'in'}, ...S.out.map(o => svRow(o, true)))));
  if (S.confirm?.n) v.append(h('p', {class: 'small', text: S.confirm.miss ? `${md(S.confirm.day)} 장 중에 든 ${S.confirm.n}곳 가운데 ${S.confirm.miss}곳은 그날 장 마감 값으로는 문턱 밑이었어요.` : `${md(S.confirm.day)} 장 중에 든 ${S.confirm.n}곳은 모두 그날 장 마감 값으로도 문턱을 넘었어요.`}));
  svCal(v, 'sv', ok); // 날마다 달력(16:34 「매일 매일 선택됐다 탈락 됐다」)
  // ② 견줌
  v.append(h('h2', {class: 'sec', text: '다른 곳과 견주면?'}));
  const trio = h('div', {class: 'trio'}, h('div', {}, h('span', {text: `급등 ${n}곳 가운데값`}), n ? pctEl(S.stats.med) : h('b', {class: 'num q', text: '?'})), h('div', {}, h('span', {text: '셀 수 있는 회사 가운데값'}), pctEl(S.market?.med)), h('div', {}, h('span', {text: '가장 적게 오른 곳'}), n ? pctEl(S.stats.lo) : h('b', {class: 'num q', text: '?'})));
  v.append(trio); fitNums(trio);
  // ③ 어떤 곳들인가요?
  v.append(h('h2', {class: 'sec', text: '어떤 곳들인가요?'}));
  if (n) {
    v.append(h('p', {class: 'alt', text: `${n}곳 가운데 ${F.half ?? '?'}곳은 1년 사이 꼭대기의 반값 아래로 떨어진 적이 있어요.`}));
    const mk = [['KOSDAQ', '코스닥'], ['KOSPI', '코스피']].map(([k, nm]) => [nm, M.filter(m => m.mk === k).length]).filter(x => x[1]), same = (S.sameInd ?? []).map(x => `${x[0]} ${x[1]}곳`);
    v.append(h('p', {class: 'small', text: mk.map(([nm, c]) => `${nm} ${c}곳`).join(' · ') + (same.length ? ` · 같은 업종 3곳 이상: ${same.join(' · ')}` : '')}));
    const W3 = S.why ?? {};
    v.append(h('p', {class: 'small', text: `업종 전체가 함께 오른 곳 ${W3.ind ?? '?'}곳 · 업종과 따로 오른 곳 ${W3.co ?? '?'}곳${W3.mkt ? ` · 시장 전체와 함께 ${W3.mkt}곳` : ''}이에요. 오른 까닭은 몰라요.`}));
    const box = h('div', {class: 'sv-board'}); v.append(box);
    race(box, {items: M.map(m => ({key: m.c, name: m.n, href: cHref(m.c), v: m.v, cw: m.v, badge: S.kind === 'pick' && m.tag === 'new' ? '새로' : null, gold: S.provisional && m.prov ? '? 장 중' : null})), parent: S.market?.avg6 ? {v: S.market.avg6, cw: S.market.avg6} : null, wide: true, label: `급등 ${n}곳 — 5일 동안 많이 오른 차례`, n: 6, win: false});
    v.append(h('p', {class: 'key'}, h('span', {}, h('i', {class: 'k-up'}), '오름'), h('span', {}, h('i', {class: 'k-dn'}), '내림'), h('span', {}, h('i', {class: 'k-avg'}), '셀 수 있는 회사 가운데값'), h('span', {}, h('i', {class: 'k-b0'}), `5일 전(${md(S.window?.[0] ?? S.asOf)}) 값`)));
  }
  // ④ 조심할 것과 모르는 것 — 「!」마다 바로 밑에 그 이름(새 눈 점검 10) · 「?」
  v.append(h('h2', {class: 'sec', text: '조심할 것과 모르는 것'}));
  const chk = h('ul', {class: 'chk sv-chk'});
  const warnN = M.filter(m => m.warn), liveN = M.filter(m => m.warnLive), downN = M.filter(m => m.d1 != null && m.d1 < 0);
  if (warnN.length || liveN.length) chk.append(svLi('!', `거래소 경고 기준만큼 오른 곳 ${warnN.length}곳`, '— 5일 60% 또는 15일 100%로만 셌어요. 거래소가 실제로 경고했는지는 몰라요.', warnN.map(m => m.n), liveN.length ? [`장 중 값으로만 닿은 곳 ${liveN.length}곳`, liveN.map(m => m.n)] : null)); // 수와 이름이 맞게(새 눈 점검 12)
  if (downN.length) chk.append(svLi('!', `마지막 날 내린 곳 ${downN.length}곳`, '— 5일로는 올랐지만 마지막 날은 내렸어요.', downN.map(m => m.n)));
  if (F.one) chk.append(svLi('!', `하루에 몰려 오른 곳 ${F.one}곳`, '— 5일 오름의 대부분이 하루에 났어요.'));
  if (F.quiet) chk.append(svLi('!', `거래가 덜 붙은 곳 ${F.quiet}곳`, '— 5일 거래가 평소의 2배도 안 됐어요.'));
  if (F.reb) chk.append(svLi('!', `되오른 곳 ${F.reb}곳`, '— 5일 전에 이미 크게 빠져 있었어요.'));
  chk.append(svLi('?', '오른 까닭', '— 몰라요. 뉴스와 공시를 못 봐요.'), svLi('?', '거래소 경고 · 거래정지', '— 여기서는 확인 못 해요.'), svLi('?', '공매도 · 빚내서 산 돈 · 주식 수 바뀜', '— 못 봐요.'));
  if (FU.q) chk.append(svLi('?', `셀 수 없는 곳 ${FU.q.toLocaleString('ko-KR')}곳`, '— 새로 상장했거나 값이 빈 날 · 거래가 멈춘 날이 있어요.'));
  v.append(chk);
  if (S.cutList?.length) v.append(h('details', {class: 'more sv-outs'}, h('summary', {text: `+15%를 넘었지만 값이나 거래 때문에 뺀 곳 ${S.cutList.length}곳 — 까닭 보기`}), h('div', {class: 'in'}, ...S.cutList.map(o => svRow(o, false)))));
  if (CUT.seat) v.append(h('p', {class: 'small', text: `+15%를 넘었지만 아직 못 든 곳도 ${CUT.seat}곳 있어요. 자리가 찼거나 다음 업데이트에서 한 번 더 봐요. 이름은 싣지 않아요.`}));
  // ⑤ 더 확인할 곳 → 며칠 뒤 어떻게 됐나(16:34 「몇일후 어떻게 됐는지」 · 16:40 「매일매일」 「관심 없음」)
  svSee(v, S);
  svTrack(v, 'sv', ok);
  // 어떻게 골랐나요?
  v.append(h('details', {class: 'more sv-how'}, h('summary', {text: '어떻게 골랐나요?'}), h('div', {class: 'in'}, ...(S.rules?.lines ?? []).map(t => h('p', {text: t})))));
  v.append(foot({src: isDay(S.window?.[0]) && isDay(S.asOf) ? `급등 목록은 ${md(S.window[0])} 종가와 ${md(S.asOf)} 값을 견줘 셌어요` : null})); // 이 탭 자료 줄(새 눈 점검 4 — 멍거 · 린치 줄은 이 탭과 상관없음)
}
const svLi = (mark, b, t, names, more = null) => h('li', {}, h('span', {class: 'm' + (mark === '?' ? ' q' : ' w'), text: mark}), h('span', {}, h('b', {text: b + ' '}), t, names?.length ? h('span', {class: 'sv-nms', text: names.join(' · ')}) : null, more ? h('span', {class: 'sv-nms', text: `${more[0]}: ${more[1].join(' · ')}`}) : null));
function svSee(v, S) {
  v.append(h('h2', {class: 'sec', text: '더 확인할 곳'}));
  v.append(h('ul', {class: 'chk sv-see'},
    h('li', {}, h('span', {class: 'm', text: '·'}), h('span', {}, '거래소 경고 · 거래정지: ', h('a', {class: 'inl', href: 'https://kind.krx.co.kr/', target: '_blank', rel: 'noopener noreferrer', text: '한국거래소 공시'}))),
    h('li', {}, h('span', {class: 'm', text: '·'}), h('span', {}, '주식 수 바뀜 · 큰 계약: ', h('a', {class: 'inl', href: 'https://dart.fss.or.kr/', target: '_blank', rel: 'noopener noreferrer', text: '금융감독원 공시'}))),
    h('li', {}, h('span', {class: 'm', text: '·'}), h('span', {text: `다음 업데이트: ${svNext()}(서울) — 그때 넣고 빼요.`})),
    S.provisional ? h('li', {}, h('span', {class: 'm', text: '·'}), h('span', {text: '오늘 값이 굳는 때: 저녁 8시 뒤예요. 다음 장날 첫 업데이트에 들어가요.'})) : null));
}
/** 네 칸(10%대 · 20%대 · 30%대 · 40% 넘게 — sb-v1) 한 장 — 급등 칸과 같은 차례(다섯 질문) · 숫자는 surge.json bands 그대로 */
function svBand(v, S, b, ok) {
  const BS = S.bands, B = BS?.[b], name = SV_NAME[b];
  if (!B || BS.version !== 'sb-v1') { v.append(h('h1', {class: 'head', text: name}), h('p', {class: 'q', text: '? 이 칸 자료가 아직 없어요. 다음 업데이트에 들어가요.'})); svCal(v, b, ok); svTrack(v, b, ok); v.append(foot()); return; }
  const M = B.members ?? [], n = M.length, cut = (BS.cuts ?? []).find(x => x[0] === b) ?? [b, null, null], lo = cut[1], hi = cut[2], range = hi == null ? `${lo}%${NB}이상` : `${lo}%에서 ${hi}% 사이`;
  const BD = {M, lo, hi, kind: BS.kind, name};
  svHead(v, `${name} ${n}곳`, S);
  v.append(h('p', {class: 'sv-lead', text: n ? `지난 5일 동안 ${range} 올랐어요.` : `지난 5일 동안 ${range} 오른 곳이 없어요.`}));
  const host = h('div', {class: 'svc'}); v.append(host); svChart(host, S, BD); chartDraw = () => svChart(host, S, BD);
  v.append(h('p', {class: 'lkey'}, h('span', {}, h('i', {class: 'l-dot'}), `${name} ${n}곳`), BS.kind === 'pick' && M.some(m => m.tag === 'new') ? h('span', {}, h('i', {class: 'l-dot new'}), '이번에 새로') : null, h('span', {}, h('i', {class: 'l-mt'}), `셀 수 있는 회사 ${(S.market?.n ?? 0).toLocaleString('ko-KR')}곳`)));
  svJump(v);
  if (S.provisional) v.append(h('p', {class: 'sv-prov', text: '장 중 값이에요. 저녁 8시까지 바뀌어요.'}));
  v.append(h('p', {class: 'hon sv-hon', text: '사고팔 곳을 고른 목록이 아니에요.'}));
  v.append(h('p', {class: 'q', text: '? 오른 까닭은 몰라요.'}));
  if (D.core?.asOf && isDay(S.asOf) && S.asOf < D.core.asOf) v.append(h('p', {class: 'q', text: `? 이 목록은 ${md(S.asOf)} 값이에요. 그 뒤 값은 다음 업데이트에 들어가요.`}));
  if (S.carry?.why) v.append(h('p', {class: 'q', text: '? ' + S.carry.why}));
  if (B.over) v.append(h('p', {class: 'note', text: `이 칸에 든 곳이 많아 많이 오른 차례로 ${BS.cap}곳만 실었어요. 나머지 ${B.over}곳은 싣지 않아요.`}));
  // 들고 남 — 새로 든 곳 · 옮겨 온 곳(다른 칸에서) · 빠진 곳(까닭) · 옮겨 간 곳(다른 칸으로)
  const ins = B.in ?? [], outs = B.out ?? [], mIn = (B.move ?? []).filter(x => x.to === b), mOut = (B.move ?? []).filter(x => x.from === b);
  const said = [ins.length ? `${ins.length}곳이 새로 들었어요.` : null, mIn.length ? `${mIn.length}곳이 다른 칸에서 옮겨 왔어요.` : null, outs.length ? `${outs.length}곳이 빠졌어요.` : null, mOut.length ? `${mOut.length}곳이 다른 칸으로 옮겨 갔어요.` : null].filter(Boolean);
  v.append(h('p', {class: 'sv-chg', text: S.carry ? `목록은 ${kstLabel(S.carry.fromKst)}에 고른 그대로예요.` : BS.kind !== 'pick' ? '처음 고른 목록이에요.' : said.length ? said.join(' ') : '이번에 바뀐 곳은 없어요.'}));
  if (BS.kind === 'pick' && !S.carry) { // 든 곳 · 옮겨 온 곳 이름은 바로 밑 달력(오늘) 판에 — 두 번 싣지 않음(새 눈 점검 7) · 빠진 까닭은 여기만
    if (outs.length) v.append(h('details', {class: 'more sv-outs'}, h('summary', {text: `빠진 곳 ${outs.length}곳 — 까닭 보기`}), h('div', {class: 'in'}, ...outs.map(o => svRow(o, true)))));
    if (mOut.length) v.append(h('details', {class: 'more sv-outs'}, h('summary', {text: `다른 칸으로 옮겨 간 곳 ${mOut.length}곳 — 어디로 갔나 보기`}), h('div', {class: 'in'}, ...mOut.map(o => svRow({c: o.c, n: o.n, r5: o.r5, why: `${SV_TO[o.to]} 옮겼어요`}, true)))));
  }
  svCal(v, b, ok);
  // ② 견줌 — 칸 안 가장 많이 · 가장 적게 오른 곳(줄 값 그대로) · 셀 수 있는 회사 가운데값
  v.append(h('h2', {class: 'sec', text: '다른 곳과 견주면?'}));
  const q = () => h('b', {class: 'num q', text: '?'});
  const trio = h('div', {class: 'trio'}, h('div', {}, h('span', {text: '이 칸에서 가장 많이 오른 곳'}), n ? pctEl(M[0].r5) : q()), h('div', {}, h('span', {text: '이 칸에서 가장 적게 오른 곳'}), n ? pctEl(M.at(-1).r5) : q()), h('div', {}, h('span', {text: '셀 수 있는 회사 가운데값'}), pctEl(S.market?.med)));
  v.append(trio); fitNums(trio);
  // ③ 어떤 곳들인가요?
  v.append(h('h2', {class: 'sec', text: '어떤 곳들인가요?'}));
  if (n) {
    const mk = [['KOSDAQ', '코스닥'], ['KOSPI', '코스피']].map(([k, nm]) => [nm, M.filter(m => m.mk === k).length]).filter(x => x[1]);
    if (mk.length) v.append(h('p', {class: 'small', text: mk.map(([nm, c]) => `${nm} ${c}곳`).join(' · ')}));
    const box = h('div', {class: 'sv-board'}); v.append(box);
    race(box, {items: M.map(m => ({key: m.c, name: m.n, href: cHref(m.c), v: m.v, cw: m.v, badge: BS.kind === 'pick' && m.tag === 'new' ? '새로' : null, gold: S.provisional && m.prov ? '? 장 중' : null})), parent: S.market?.avg6 ? {v: S.market.avg6, cw: S.market.avg6} : null, wide: true, label: `${name} ${n}곳 — 5일 동안 많이 오른 차례`, n: 6, win: false});
    v.append(h('p', {class: 'key'}, h('span', {}, h('i', {class: 'k-up'}), '오름'), h('span', {}, h('i', {class: 'k-dn'}), '내림'), h('span', {}, h('i', {class: 'k-avg'}), '셀 수 있는 회사 가운데값'), h('span', {}, h('i', {class: 'k-b0'}), `5일 전(${md(S.window?.[0] ?? S.asOf)}) 값`)));
  } else v.append(h('p', {class: 'small', text: '이 칸에 든 곳이 없어요.'}));
  // ④ 조심할 것과 모르는 것
  v.append(h('h2', {class: 'sec', text: '조심할 것과 모르는 것'}));
  const downN = M.filter(m => m.d1 != null && m.d1 < 0), chk = h('ul', {class: 'chk sv-chk'});
  if (downN.length) chk.append(svLi('!', `마지막 날 내린 곳 ${downN.length}곳`, '— 5일로는 올랐지만 마지막 날은 내렸어요.', downN.map(m => m.n)));
  chk.append(svLi('?', '오른 까닭', '— 몰라요. 뉴스와 공시를 못 봐요.'), svLi('?', '거래소 경고 · 거래정지', '— 여기서는 확인 못 해요.'), svLi('?', '공매도 · 빚내서 산 돈 · 주식 수 바뀜', '— 못 봐요.'));
  v.append(chk);
  svSee(v, S);
  svTrack(v, b, ok);
  v.append(h('details', {class: 'more sv-how'}, h('summary', {text: '어떻게 골랐나요?'}), h('div', {class: 'in'}, ...[
    '5일 오름 = 마지막 값 ÷ 5일 전 종가예요. 5일은 장이 열린 날로 세요.',
    '칸은 10%대 · 20%대 · 30%대 · 40% 이상 넷이에요. 칸끼리 겹치지 않아요. 10%대는 10% 이상 20% 밑이에요.',
    '값이 빈 날 · 거래가 없던 날 · 하루 35% 넘게 바뀐 날이 있거나, 새로 상장했거나, 석 달 안에 오래 멈췄던 곳은 빼요. 평소 하루 거래가 1억 원이 안 되는 곳도 빼요.',
    `칸마다 많이 오른 차례로 ${BS.cap}곳까지 실어요. 채우려고 문턱을 낮추지 않아요.`,
    '하루 4번 업데이트 때 다시 세요. 다른 칸으로 간 곳은 「옮김」으로 적어요. 다른 셈으로 한 번 더 세어 같을 때만 올려요.',
    '급등 칸과 따로 세요. 급등 칸은 들어오는 문 · 나가는 문이 따로 있어서, 한 회사가 급등 칸과 이 칸에서 다르게 보일 수 있어요.',
    '센 것일 뿐 다음 날을 말하지 않아요.'].map(t => h('p', {text: t})))));
  v.append(foot({src: isDay(S.window?.[0]) && isDay(S.asOf) ? `${name} 목록은 ${md(S.window[0])} 종가와 ${md(S.asOf)} 값을 견줘 셌어요` : null}));
}
/** 업데이트 탭 한 줄 — 그 회차의 급등 고르기(규칙 69) */
const surgeRecLine = s => (s.kind === 'fail' ? `? 급등 탭 — 셈이 멈춰 앞에 고른 그대로 둠${s.why ? ` · ${s.why}` : ''}`
  : `급등 탭 — ${s.kind === 'first' ? `처음 고름 ${s.n ?? '?'}곳` : `새로 든 곳 ${s.in?.length ?? 0} · 빠진 곳 ${s.out?.length ?? 0} · 모두 ${s.n ?? '?'}곳`}${s.bands ? ` · 네 칸 ${s.bands.kind === 'first' ? '처음 고름' : `든 ${s.bands.in ?? 0} · 빠짐 ${s.bands.out ?? 0} · 옮김 ${s.bands.move ?? 0}`}` : ''}${s.published === false ? ' · ? 점검에 걸려 올라가지 않음' : ''}`); // 네 칸(16:28 · 16:34 「선택됐다 탈락 됐다 이동 했다」)
async function viewUpdates(v) {
  await needUpd();
  const U = D.upd, R = U.records, last = R[0];
  const tell = tellRow(`하루 ${U.slots.length}번 · ${U.slots.join(' · ')}(서울)`, null);
  v.append(tell.el, h('h1', {class: 'head', text: `업데이트 기록 — 하루 ${U.slots.length}번`}),
    h('p', {class: 'count', text: last ? `마지막 ${kstLabel(last.kst)} · ${RES_WORD[last.result] ?? last.result}` + (last.asOf ? ` · 고른 날 ${md(last.asOf)}` : '') : '아직 기록이 없습니다.'}));
  if (EN) v.append(h('p', {class: 'note', text: 'Each update keeps its original note in Korean, as it was written at the time.'})); // 영어 화면에서만(규칙 71)
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
    if (!r.slot && r.reason) li.append(h('p', {class: 'small', lang: 'ko', text: r.reason})); // 올린 까닭 = 원문 기록(사장님 말씀 · 그때 적은 글) — 영어 화면에서도 한국어 그대로(lang="ko" · 규칙 71)
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
    if (r.surge && r.surge.kind !== 'carry') li.append(h('p', {class: r.surge.kind === 'fail' || r.surge.published === false ? 'q' : 'small', text: surgeRecLine(r.surge)})); // 급등 탭(규칙 69) — 업데이트 때 넣고 뺀 것 · 그 밖 올림은 앞 판 그대로라 적지 않음
    if (r.inspect) li.append(h('p', {class: r.inspect.fail ? 'q' : 'small', text: (r.inspect.fail ? '? ' : '') + inspectLine(r.inspect, false)}));
    if (r.result === '실패' || (r.result === '그대로' && !r.asOf)) li.append(h('p', {class: r.result === '실패' ? 'q' : 'small', lang: 'ko', text: (r.result === '실패' ? '? ' : '') + (r.why ?? '')})); // 까닭 글 = 그때 적은 원문(영어 화면에서도 그대로)
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
    else if (!a && !b) svg.append(sv('circle', {cx: (x + w / 2).toFixed(1), cy: Y0, r: 2.5, fill: T.mute}));
    if (a) svg.append(sv('rect', {x: x.toFixed(1), y: (Y0 - a).toFixed(1), width: w.toFixed(1), height: a.toFixed(1), rx: 1, fill: T.ink})); // 새로 든 곳 = 꽉 찬 진주 · 빠진 곳 = 테만(먹빛에서 옛 두 보라가 같은 진주색이 되어 못 가르던 것 — 2026-10-15 먹빛 예술 · 데이터 눈 · 믿음 눈)
    if (b) svg.append(sv('rect', {x: (x + 0.75).toFixed(1), y: (Y0 + 0.75).toFixed(1), width: Math.max(1, w - 1.5).toFixed(1), height: Math.max(1, b - 1.5).toFixed(1), rx: 1, fill: 'none', stroke: T.sub, 'stroke-width': 1.5})); // 빠진 곳 = 테만(새로 든 곳 꽉 찬 진주와 꼴로 가름 — 믿음 눈)
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
  const W = Math.max(260, Math.round(wrap.getBoundingClientRect().width || 320)), H = 232, Pd = 10, PT = 34, padR = AXR(); // 위 띠(PT) = 「앞날은 비워 둡니다」 글 자리(글이 선에 닿지 않게)
  const day = d => Date.UTC(+d.slice(0, 4), +d.slice(5, 7) - 1, +d.slice(8, 10)) / 864e5;
  const x0 = day(P.from), x1 = day(open3), X = d => 4 + (day(d) - x0) / (x1 - x0) * (W - 4 - padR);
  const last365 = P.v365.at(-1), lastPool = P.vpool.at(-1); // 봉인 날 = 100 으로 맞춤
  const p365 = P.v365.map(v => (v == null ? null : v / last365 * 100)), ppool = P.vpool.map(v => (v == null ? null : v / lastPool * 100));
  const vals = [...p365, ...ppool, ...S.v365, ...S.vpool, 100].filter(v => v != null);
  let lo = Math.min(...vals), hi = Math.max(...vals); const pad = (hi - lo) * 0.08 || 4; lo -= pad; hi += pad;
  const Y = v => PT + (hi - v) * (H - PT - Pd) / (hi - lo);
  const svg = sv('svg', {viewBox: `0 0 ${W} ${H}`, width: W, height: H, role: 'img', 'aria-label': `봉인 ${K.id}호 — 3년 전 ${ymd(P.from)}부터 봉인 날 ${ymd(K.seal)}까지 실제 선(봉인 날 = 100) · 그 뒤 3년 뒤 ${ymd(open3)}까지는 비워 둠(앞날 값을 그리지 않음)`});
  const xs = X(S.dates.at(-1));
  svg.append(sv('rect', {x: xs.toFixed(1), y: PT, width: Math.max(0, W - padR - xs).toFixed(1), height: H - PT - Pd, fill: T.ink, 'fill-opacity': 0.04, rx: 1})); // 아직 오지 않은 날 — 비워 둠
  gutterAxis(svg, wrap, {ticks: niceTicks(lo, hi), Y, x0: 4, x1: W - padR, base: 100, fmt: String}); // 눈금 = 봉인 날 100 과 같은 단위 · 100 은 점선
  const path = (ds, arr) => { let d = '', on = false; arr.forEach((v, i) => { if (v == null) { on = false; return; } d += (on ? 'L' : 'M') + X(ds[i]).toFixed(1) + ' ' + Y(v).toFixed(1); on = true; }); return d; };
  svg.append(sv('path', {d: path(P.dates, ppool), fill: 'none', stroke: T['m4-neu'], 'stroke-width': 1.5, 'stroke-linejoin': 'round'})); // 후보 모두 = 회색 실선(첫 화면 둘째 지수와 같은 꼴)
  svg.append(sv('path', {d: path(P.dates, p365), fill: 'none', stroke: T.ink, 'stroke-width': 2, 'stroke-linejoin': 'round', 'stroke-linecap': 'round'})); // 봉인 365곳 = 진주 선
  if (S.days) {
    svg.append(sv('path', {d: path(S.dates, S.vpool), fill: 'none', stroke: T['m4-neu'], 'stroke-width': 1.5}));
    svg.append(sv('path', {d: path(S.dates, S.v365), fill: 'none', stroke: T.ink, 'stroke-width': 2, 'stroke-linecap': 'round'}));
  }
  svg.append(sv('line', {x1: X(K.seal), x2: X(K.seal), y1: PT - 4, y2: H - Pd + 4, stroke: T.gold, 'stroke-width': 2})); // 봉인 날
  svg.append(sv('line', {x1: X(open3), x2: X(open3), y1: PT - 4, y2: H - Pd + 4, stroke: T.sub, 'stroke-width': 1.5, 'stroke-dasharray': '6 4'})); // 3년 뒤 여는 날
  const lk = S.dates.length - 1;
  svg.append(sv('circle', {cx: X(S.dates[lk]), cy: Y(S.v365[lk]), r: 4.5, fill: T.ink, stroke: T.night, 'stroke-width': 2}));
  const cx = sv('line', {y1: PT, y2: H - Pd, stroke: T.ink, 'stroke-opacity': 0.6, 'stroke-width': 1}); cx.setAttribute('visibility', 'hidden'); svg.append(cx);
  wrap.prepend(svg);
  const fut = h('span', {class: 'fut', text: '앞날은 비워 둡니다'}); fut.style.left = (xs + 8) + 'px'; fut.style.right = (padR + 8) + 'px'; fut.style.top = '2px'; wrap.append(fut);
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
  for (const r of D.names.rows) { const a = norm(r.n), b = norm(sound(r.n)), e = EN ? norm(nameEn(r.n) ?? '') : ''; r._k = e ? [a, b, e] : [a, b]; r._c = [cho(a), cho(b)]; } // 영어로 볼 때는 영어 이름으로도 찾음
}
function search(q) {
  const k = norm(q); if (!k) return [];
  const onlyCho = /^[ㄱ-ㅎ]+$/.test(k), digits = /^\d+$/.test(k), codeK = !digits && /^\d[0-9a-z]{0,5}$/.test(k); // 번호 — 새로 상장한 곳은 숫자 · 영문이 섞임(0126Z0 · 2026-10-14 틀림 장부 26번)
  const hits = [];
  for (const g of D.core.groups) if (norm(g.name).includes(k) || norm(g.short).includes(k) || (EN && norm(L(g.name)).includes(k))) hits.push({kind: 'g', score: norm(g.name).startsWith(k) ? 0 : 1, g});
  for (const i of D.core.industries) if (norm(i.name).includes(k) || (onlyCho && cho(norm(i.name)).includes(k)) || (EN && norm(L(i.name)).includes(k))) hits.push({kind: 'i', score: norm(i.name).startsWith(k) ? 0 : 1, i});
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
  body.append(h('p', {}, h('a', {class: 'inl', href: '#/up', text: '업데이트 기록 보기 ›'}), ' — 하루 4번 다시 센 기록 · 시장 판독 · 네 눈 점검'));
  body.append(h('h2', {class: 'sec', text: '모르는 것 ?'}), h('ul', {class: 'note'},
    h('li', {text: '? 거래정지 · 관리종목 · 투자경고 표시 — 아직 거르지 못합니다.'}),
    h('li', {text: C.sincePick ? `? 고른 뒤 기록 — ${md(C.pickAsOf)} 뒤 ${C.sincePick}거래일뿐이라 아직 짧습니다.` : `? 고른 뒤 기록 — ${md(C.pickAsOf)} 종가로 골라 고른 뒤 기록은 아직 없습니다. 지금 보이는 선은 모두 고른 기간 안입니다.`}),
    h('li', {text: '? 증권사 짐작 — 자주 바뀝니다. 6단 그림의 올해 매출 한 칸(점선 · 「남의 짐작」)에 쓰고, 세 팀 이야기 글 속에 증권사 짐작을 옮긴 곳도 있습니다 — 그대로 믿을 값이 아닙니다. 고를 때는 쓰지 않습니다.'}),
    C.funnel.q ? h('li', {text: `? 두 조건 모두 셀 자료가 없는 ${C.funnel.q}곳은 넣지 않았습니다.`}) : null,
    h('li', {text: `? 다시 고르기 — ${RU.next}.`})));
  body.append(foot());
}

// ════ 달력 탭(사장님 2026-10-15(싱가포르) 19:28 「달력 턉을 만들어서 그곳에서 10에서 40프로에 종목들을 한눈에 보고 관리하고 판단할수 있는 지혜로운 구조에 달력이 필요해」 ·
//   19:36 「가 로 해라」(아래 탭 다섯째) · 20:00 「어떤 종목이 어떻게 됐는지 알수 있어야 해」 · 20:04 「달력에 종목이름 등락률 나와야 해」 · 20:51 「추적하는 시스탬 … cia처런 끈질기게」 ·
//   20:57 「구글이면 어떻게 만들겠어 … 전셰계 똑똑한 집단 100군데」 · 21:24 「가 로 해」(지난 한 달도 되짚어 추적 파일을 엶) · 규칙 70) ════
//   첫 화면 = 답 한 줄(10곳 중 n곳이 뽑힌 날보다 올라 있어요 + 같은 날들 모든 회사) → 새로 생긴 금빛 → 칸 고르기 → 날짜별 목록(달력 날 판 · 선택 · 이동 · 탈락 · 줄마다 이름과 뽑힌 날부터 %)
//   종목 파일 `#/cal/<번호>` = 택배 조회처럼(상태 낱말 · 큰 % · 선 · 칸 길 · 단계) · 관심 · 관심 없음은 보는 기계에만 · 자료 surgetr.json · surgetr-case.json(tr-v1 · 결정표 docs/design/surge-2026-10-15/cal-merge-v3.md)
let trP = null, trcP = null;
const trOk = T => !!(T && T.version === 'tr-v1' && isDay(T.asOf) && Array.isArray(T.days) && Array.isArray(T.cases) && Array.isArray(T.dates) && T.days.every(x => isDay(x.d)));
function needTr() { if (!trP) trP = getJson('surgetr.json').then(x => { if (!trOk(x)) throw Error('surgetr.json'); D.tr = x; }).catch(e => { trP = null; throw e; }); return trP; }
function needTrCase() { if (!trcP) trcP = getJson('surgetr-case.json').then(x => { if (!x || typeof x.cases !== 'object') throw Error('surgetr-case.json'); D.trc = x.cases; }).catch(e => { trcP = null; throw e; }); return trcP; }
const TR_B = {'1': SV_NAME.b10, '2': SV_NAME.b20, '3': SV_NAME.b30, '4': SV_NAME.b40};
const TR_F = [['all', '전체'], ['1', '10%'], ['2', '20%'], ['3', '30%'], ['4', '40%']];
const trRow = r => ({c: r[0], n: r[1], d0: r[2], b: r[3], r5: r[4], v: r[5], st: r[6], h: r[7], f: r[8], x: r[9], re: r[10], kst: r[11]});
const trTo = b => josa(TR_B[b] ?? '?', '으로', '로'); // 「20%대로」 · 「40% 이상으로」
const trFlag = r => (r.h ? '? 거래 멈춤' : r.f === 2 ? '? 반 토막' : r.f === 1 ? '! 반 토막' : null);
const CAL_WORD = {u: '올라 있음', d: '내려 있음', z: '제자리', q: '? 값 없음', n: '새로 뽑힘'};
// 관심(★) — 보는 기계에만 · 기억 못 하는 기계(사생활 창 등)는 이 화면 동안만 · 관심 없음은 급등 탭과 같은 목록(atlas:surge-hide)
const TR_STAR = 'atlas:cal-star';
let trStarMem = new Set();
function starGet() { try { const x = JSON.parse(localStorage.getItem(TR_STAR) || '[]'); return new Set(Array.isArray(x) ? x.filter(c => typeof c === 'string' && /^[0-9A-Z]{6}$/.test(c)).slice(0, 5000) : []); } catch { return new Set(trStarMem); } }
function starPut(s) { trStarMem = new Set(s); try { localStorage.setItem(TR_STAR, JSON.stringify([...s].sort())); return true; } catch { return false; } }
let trF = 'all'; // 칸 고르기(이 열린 창 안에서만 기억 · 종목 파일에서 돌아올 때만)
function trTime(T) {
  if (!T.provisional) return `${md(T.asOf)} 종가예요.`;
  return `${md(T.asOf)} ${isTime(T.kst) && T.kst.slice(0, 10) === T.asOf ? ampm(T.kst) + ' ' : ''}값이에요. 장 중이라 바뀌어요.`;
}
/** 답 한 줄 — 「10곳 중 n곳이 뽑힌 날보다 올라 있어요.」 + 점 열 개 두 줄(지켜보는 곳 · 같은 날들 모든 회사 — 같은 단위 · 빨간 점 = 오른 몫 · 하딩 센터 그림 열 칸)
 *  점은 svg 안(바둑판 셈 밖 · 규칙 51) · 빨강은 오름에만 */
function trDots(n10, label) {
  const R = 9, G = 8, W = 10 * (2 * R) + 9 * G, T = tok();
  const s = sv('svg', {viewBox: `0 0 ${W} ${2 * R + 4}`, width: W, height: 2 * R + 4, role: 'img', 'aria-label': `${label} 10곳 중 ${n10}곳`, class: 'cal-dots'});
  for (let i = 0; i < 10; i++) s.append(sv('circle', {cx: R + 2 + i * (2 * R + G) - 2, cy: R + 2, r: R - 1, fill: i < n10 ? T.up : T['m4-neu'], 'fill-opacity': i < n10 ? 1 : 0.55})); // 빈 점은 회색으로 칠함(테만 그리면 누르는 단추처럼 보임 — 3초 시험 2026-10-15)
  return s;
}
function trAnswer(T, R) {
  const box = h('section', {class: 'cal-ans', 'aria-label': '지켜보는 곳 지금'});
  if (!T.N) { box.append(h('p', {class: 'cal-big', text: T.k ? `${md(T.asOf)}에 처음 ${T.k}곳이 뽑혔어요.` : '아직 지켜보는 곳이 없어요.'}), T.k ? h('p', {class: 'small', text: '등락률은 다음 장날부터 쌓여요.'}) : null); return box; }
  const z = R.filter(r => r.st === 'z').length, q = R.filter(r => r.st === 'q').length;
  box.append(h('p', {class: 'cal-cap', text: '뽑힌 날보다 올라 있는 곳'}), h('div', {class: 'cal-cmp'},
    h('p', {class: 'cal-cl'}, h('span', {text: `지켜보는 ${T.N}곳`}), h('b', {class: 'num', text: `10곳 중 ${T.n10}곳꼴`})), trDots(T.n10, '지켜보는 곳'),
    T.m10 != null ? h('p', {class: 'cal-cl'}, h('span', {text: '같은 기간 모든 회사'}), h('b', {class: 'num', text: `10곳 중 ${T.m10}곳꼴`})) : null,
    T.m10 != null ? trDots(T.m10, '같은 기간 모든 회사') : null));
  box.setAttribute('aria-label', `지켜보는 곳 ${T.N}곳 가운데 뽑힌 날보다 위 ${T.a}곳 · 아래 ${T.b}곳${z ? ` · 그대로 ${z}곳` : ''}`);
  if (q) box.append(h('p', {class: 'q', text: `? 값이 없는 곳 ${q}곳`}));
  return box;
}
/** 줄 하나 — 이름 | 뽑힌 날부터 % (빨강 · 파랑) · 둘째 줄은 「! 반 토막」 「? 거래 멈춤」만(금빛) · 새로 뽑힌 곳 = % 대신 「새로」 + 칸 */
function trRowEl(r, star) {
  const right = r.st === 'n' ? h('span', {class: 'cal-nw num', text: `5일간 ${pct(r.r5)}`}) : r.v == null ? h('b', {class: 'num q', text: '?'}) : pctEl(r.v); // 새로 뽑힌 곳 = 뽑힌 까닭(5일 오름 · 회색) — 뽑힌 날부터 %는 다음 장날부터
  const fl = trFlag(r);
  return h('a', {class: 'cal-row', href: '#/cal/' + r.c, 'data-c': r.c}, h('span', {class: 'nm'}, star.has(r.c) ? h('span', {class: 'cal-st', text: '★ '}) : null, r.n), right, fl ? h('span', {class: 'cal-fl', text: fl}) : null);
}
/** 날 하나 — 달력 날 판(달 · 날 · 요일) + 「선택 k · 이동 m · 탈락 x」 + 그날 뽑힌 줄 넷 + 「나머지 n곳 보기」 + 「이날 이동 · 탈락 보기」 */
function trDay(x, byC, vis, star, reNote = false) {
  const ok = c => { const r = byC.get(c); return r && vis(r); };
  const sel = x.sel.filter(ok).map(c => byC.get(c)), mv = x.mv.filter(e => ok(e[0])), out = x.out.filter(ok), re = x.re.filter(e => ok(e[0]));
  const dd = +x.d.slice(8, 10), dw = DOW[dDow(x.d)];
  const cnt = [`이동${NB}${mv.length}`, `탈락${NB}${out.length}`, re.length ? `다시${NB}선택${NB}${re.length}` : null].filter(Boolean).join(' · '); // 낱말 안은 붙임 띄어쓰기(「다시 / 선택 12」로 갈리지 않게 — 3초 시험)
  const sec = h('section', {class: 'cal-day' + (x.seed ? ' re' : ''), 'data-d': x.d},
    h('div', {class: 'cal-dh'}, h('h2', {class: 'cal-tile', 'aria-label': `${mdw(x.d)}${x.seed ? ' 되짚음' : ''}`}, h('span', {class: 'm', text: `${+x.d.slice(5, 7)}월`}), h('b', {class: 'dn num', text: String(dd)}), h('span', {class: 'w', text: dw})),
      h('div', {class: 'cal-dhx'}, h('p', {class: 'cal-ds'}, h('b', {text: `선택 ${sel.length}`}), x.seed ? h('span', {class: 'cal-re', text: ' · 되짚음'}) : null), h('p', {class: 'cal-dc', text: tx(cnt)}))));
  const rows = h('div', {class: 'cal-rows'});
  if (!sel.length) rows.append(h('p', {class: 'cal-none', text: '이날 새로 뽑힌 곳은 없어요.'}));
  const K = sel.length && sel.every(r => r.st === 'n') ? 2 : 4; // 새로 뽑혀 아직 등락이 없는 날은 두 줄만 펼침 — 그 앞 날의 빨강 · 파랑(뽑힌 날부터 %)이 첫 화면에 들게(3초 시험 2026-10-15: 「빨강 · 파랑 첫 줄은 한 화면 가까이 밀어야 나옴」)
  sel.slice(0, K).forEach(r => rows.append(trRowEl(r, star)));
  sec.append(rows);
  if (reNote) sec.append(h('p', {class: 'cal-ren', text: '되짚음 = 업데이트 기록이 없던 날이라 그날 종가로 다시 센 날이에요.'}));
  if (sel.length > K) sec.append(h('details', {class: 'more cal-rest', 'data-k': 'rest-' + x.d}, h('summary', {text: `나머지 ${sel.length - K}곳 보기`}), h('div', {class: 'in cal-rows'}, ...sel.slice(K).map(r => trRowEl(r, star))))); // 접은 칸(줄은 처음부터 있음 — 길 지도 · 3번이면 회사)
  const items = [...mv.map(([c, b]) => [c, `${trTo(b)} 이동`, 0]), ...out.map(c => [c, '탈락', 1]), ...re.map(([c, b]) => [c, `다시 선택 · ${TR_B[b] ?? '?'}`, 2])]
    .sort((a, b) => a[2] - b[2] || byC.get(a[0]).n.localeCompare(byC.get(b[0]).n, 'ko') || (a[0] < b[0] ? -1 : 1));
  if (items.length) sec.append(h('details', {class: 'more cal-ev', 'data-k': 'ev-' + x.d}, h('summary', {text: tx(`${re.length ? '이동 · 탈락 · 다시 선택' : '이동 · 탈락'} ${items.length}곳 보기`)}),
    h('div', {class: 'in'}, ...items.map(([c, t]) => { const r = byC.get(c); return h('a', {class: 'cal-erow', href: '#/cal/' + c}, h('span', {class: 'nm', text: r.n}), h('span', {class: 'cal-et', text: tx(t)}), r.st === 'n' ? h('span', {class: 'cal-nw num', text: `5일간 ${pct(r.r5)}`}) : r.v == null ? h('b', {class: 'num q', text: '?'}) : pctEl(r.v)); }))));
  return sec;
}
async function viewCal(v) {
  if (!/^#\/cal\//.test(calPrev)) { trF = 'all'; calMem.open = []; }
  let ok = true; try { await needTr(); } catch { ok = false; }
  v.append(h('h1', {class: 'head', text: '달력'}));
  if (!ok) { v.append(h('p', {class: 'q', text: '? 달력 자료를 못 받았어요. 잠시 뒤 다시 열어 주세요.'}), foot()); return; }
  const T = D.tr, R = T.cases.map(trRow), byC = new Map(R.map(r => [r.c, r]));
  v.append(h('p', {class: 'count cal-time', text: tx(`5일간 10% 넘게 오르면 뽑혀요. ${trTime(T)}`)})); // 무엇을 왜 뽑았나 — 첫 줄(3초 시험 2026-10-15 · 다섯 가운데 셋이 몰랐음)
  v.append(trAnswer(T, R));
  const AL = (T.alerts ?? []).filter(A => A.n > 0); // 새로 생긴 일만(마지막 장날 종가로) — 금빛 한 줄 · 누르면 그 종목들(종목 파일)
  if (AL.length) {
    const lab = AL.map(A => (A.kind === 'halt' ? `? 거래 멈춤 ${A.n}곳` : `${A.f === 2 ? '?' : '!'} 반 토막 ${A.n}곳`)).join(' · ');
    const items = AL.flatMap(A => (A.cs ?? (A.top?.c ? [A.top.c] : [])).map(c => [c, A.kind])).filter(([c]) => byC.has(c));
    v.append(h('details', {class: 'more cal-al', 'data-k': 'alerts'}, h('summary', {text: tx(lab)}), h('div', {class: 'in'}, h('p', {class: 'small', text: '마지막 장날 종가로 새로 생긴 일이에요.'}),
      ...items.map(([c, k]) => { const r = byC.get(c); return h('a', {class: 'cal-erow', href: '#/cal/' + c}, h('span', {class: 'nm', text: r.n}), h('span', {class: 'cal-et q', text: k === 'halt' ? '? 거래 멈춤' : r.f === 2 ? '? 반 토막' : '! 반 토막'}), r.v == null ? h('b', {class: 'num q', text: '?'}) : pctEl(r.v)); }))));
  }
  const chips = h('div', {class: 'cal-chips', role: 'group', 'aria-label': '뽑힌 칸 고르기'}, ...TR_F.map(([k, t]) => h('button', {type: 'button', 'data-f': k, 'aria-pressed': String(trF === k), text: t})));
  v.append(chips);
  const list = h('div', {class: 'cal-list'}), live = h('p', {class: 'sr', role: 'status', 'aria-live': 'polite'});
  v.append(list, live);
  const draw = () => {
    const hid = hideGet(), star = starGet(), vis = r => !hid.has(r.c) && (trF === 'all' || r.b === trF);
    list.textContent = '';
    const stars = R.filter(r => star.has(r.c) && vis(r));
    if (stars.length) list.append(h('section', {class: 'cal-day cal-stars'}, h('h2', {class: 'cal-sh', text: `★ 관심 ${stars.length}곳`}), h('div', {class: 'cal-rows'}, ...stars.map(r => trRowEl(r, star)))));
    const re1 = T.days.find(x => x.seed)?.d; // 「되짚음」 풀이는 처음 나오는 되짚은 날 한 곳에만
    for (const x of T.days.slice(0, 5)) list.append(trDay(x, byC, vis, star, x.d === re1)); // 새 다섯 날은 펼쳐 둠 · 그 앞은 다섯 날씩 접은 칸(누르면 펼침 — 줄은 처음부터 있음)
    const older = T.days.slice(5);
    for (let i = 0; i < older.length; i += 5) { const ch = older.slice(i, i + 5); list.append(h('details', {class: 'more cal-older', 'data-k': 'older-' + ch[0].d}, h('summary', {text: tx(`${md(ch.at(-1).d)} ~ ${md(ch[0].d)} 보기`)}), h('div', {class: 'in'}, ...ch.map(x => trDay(x, byC, vis, star, x.d === re1))))); }
    list.append(h('p', {class: 'small', text: tx(`${md(T.days.at(-1)?.d ?? T.asOf)}부터 적었어요.`)}));
    const gone = R.filter(r => hid.has(r.c)).sort((a, b) => a.n.localeCompare(b.n, 'ko'));
    if (gone.length) list.append(h('details', {class: 'more cal-gone'}, h('summary', {text: `숨긴 곳 ${gone.length}곳 보기`}),
      h('div', {class: 'in'}, ...gone.map(r => h('p', {class: 'sv-g'}, h('a', {class: 'inl', href: '#/cal/' + r.c, text: r.n}), h('button', {type: 'button', class: 'sv-show cal-show', 'data-c': r.c, text: '되돌리기'}))))));
  };
  chips.addEventListener('click', e => { const b = e.target.closest('button[data-f]'); if (!b) return; trF = b.dataset.f; for (const x of chips.children) x.setAttribute('aria-pressed', String(x.dataset.f === trF)); draw(); live.textContent = trF === 'all' ? '모든 칸을 보여요.' : `${TR_B[trF]}로 뽑힌 곳만 보여요.`; });
  list.addEventListener('click', e => { const b = e.target.closest('button.cal-show'); if (!b) return; const hid = hideGet(); hid.delete(b.dataset.c); hidePut(hid); draw(); live.textContent = `${byC.get(b.dataset.c)?.n ?? ''} 다시 보여요.`; });
  draw();
  v.append(h('details', {class: 'more cal-how'}, h('summary', {text: '어떻게 골랐나요?'}), h('div', {class: 'in'}, ...[
    '5일 동안 10% 넘게 오른 회사의 네 칸(10%대 · 20%대 · 30%대 · 40% 이상)에 새로 든 날을 「선택」으로 적어요. 칸은 하루 4번 업데이트 때 정해요.',
    '뽑힌 날부터 60거래일 동안 날마다 따라가요. 칸에서 빠져도 끝까지 따라가요.',
    '%는 뽑힌 날 종가를 0으로 두고 센 값이에요.',
    '「이동」은 그 회사 5일 오름이 다른 칸으로 옮긴 날이에요. 「탈락」은 10% 밑으로 내려가거나 거래가 적어진 날이에요. 자리가 차서 밀린 것은 탈락이 아니에요.',
    '이동과 탈락은 장이 끝난 값으로만 세요.',
    T.seed ? `${md(T.seed.from)} ~ ${md(T.seed.to)}은 업데이트 기록이 없던 날이라 그날 종가로 다시 셌어요. 그날에는 「되짚음」이라고 적어요.` : null,
    '「! 반 토막」은 뽑힌 뒤 가장 높던 종가의 반 밑으로 내려온 곳이에요. 「? 거래 멈춤」은 그날 거래가 없던 곳이에요. 맨 위에는 새로 생긴 날에만 적어요.',
    '「같은 기간 모든 회사」는 종목마다 뽑힌 날 종가부터 같은 날까지 모든 회사를 센 값이에요. 「10곳 중 n곳꼴」은 올라 있는 몫을 10곳으로 줄여 센 거예요.',
    '「관심」과 「관심 없음」은 이 기계에만 남아요. 셈에는 그대로 들어가요.',
  ].filter(Boolean).map(t => h('p', {text: tx(t)})))));
  v.append(h('p', {class: 'hon', text: '사고팔 곳을 고른 목록이 아니에요.'}), h('p', {class: 'small', text: '지난 값일 뿐 앞날을 말하지 않아요.'}));
  v.append(foot({src: `달력은 네 칸 기록과 일봉으로 ${md(T.asOf)}까지 셌어요`}));
}
/** 종목 파일 그림 ① — 뽑힌 날 종가 = 0 · 날마다 % · 거래가 없던 날은 빈 점 · 마지막 값 점 */
function trLine(host, P, dates, z, name) {
  host.textContent = '';
  const wrap = h('div', {class: 'lc'}); host.append(wrap);
  const vals = P.filter(x => x != null);
  if (vals.length < 2) { wrap.append(h('p', {class: 'small', text: '선은 다음 장날부터 그려요.'})); return; }
  const n = P.length, W = Math.max(260, Math.round(wrap.getBoundingClientRect().width || 320)), H = 200, PT = 12, PB = 10, padR = AXR();
  let lo = Math.min(0, ...vals), hi = Math.max(0, ...vals); const pad = (hi - lo) * 0.08 || 2; lo -= pad; hi += pad;
  const X = i => 4 + i * (W - 4 - padR) / Math.max(1, n - 1), Y = y => PT + (hi - y) * (H - PT - PB) / (hi - lo), T = tok(), id = 'lc' + (++lcN);
  const svg = sv('svg', {viewBox: `0 0 ${W} ${H}`, width: W, height: H, role: 'img', 'aria-label': `${name} — 뽑힌 날 종가부터 날마다: ` + P.map((x, i) => `${md(dates[i])} ${pct(x)}`).join(', ')});
  const defs = sv('defs'), cu = sv('clipPath', {id: id + 'u'}), cd = sv('clipPath', {id: id + 'd'});
  cu.append(sv('rect', {x: 0, y: 0, width: W, height: Y(0)})); cd.append(sv('rect', {x: 0, y: Y(0), width: W, height: H - Y(0)}));
  defs.append(cu, cd); fadeDefs(defs, id, T, PT, H, Y(0)); svg.append(defs);
  gutterAxis(svg, wrap, {ticks: niceTicks(lo, hi), Y, x0: 4, x1: W - padR, base: 0, fmt: t => (t > 0 ? '+' : t < 0 ? '−' : '') + Math.abs(t) + '%'});
  const ad = areaPath(P, X, Y, Y(0));
  svg.append(sv('path', {d: ad, fill: `url(#${id}gu)`, 'clip-path': `url(#${id}u)`}), sv('path', {d: ad, fill: `url(#${id}gd)`, 'clip-path': `url(#${id}d)`}));
  let d = '', on = false; P.forEach((y, i) => { if (y == null) { on = false; return; } d += (on ? 'L' : 'M') + X(i).toFixed(1) + ' ' + Y(y).toFixed(1); on = true; });
  for (const [c, cl] of [[T.up, 'u'], [T.down, 'd']]) svg.append(sv('path', {d, fill: 'none', stroke: c, 'stroke-width': 2, 'stroke-linejoin': 'round', 'stroke-linecap': 'round', 'clip-path': `url(#${id}${cl})`}));
  for (const i of z) if (P[i] != null) svg.append(sv('circle', {cx: X(i), cy: Y(P[i]), r: 4.5, fill: T.night, stroke: T.ink, 'stroke-width': 1.5})); // 거래가 없던 날 = 빈 점
  const lk = P.map((x, i) => (x == null ? -1 : i)).filter(i => i >= 0).pop();
  svg.append(sv('circle', {cx: X(lk), cy: Y(P[lk]), r: 4.5, fill: P[lk] > 0 ? T.up : P[lk] < 0 ? T.down : T.mute, stroke: T.night, 'stroke-width': 2}));
  wrap.prepend(svg);
  wrap.append(h('div', {class: 'ax'}, h('span', {text: md(dates[0]) + ' = 0'}), h('span', {text: md(dates[n - 1])})));
}
/** 종목 파일 그림 ② — 칸 길(그 회사 제 5일 오름이 든 칸 · 끝난 날마다) · 다섯 줄(40% · 30% · 20% · 10% · 밖) · 계단 선 · 선택 ● · 다시 선택 ◉ · 탈락 ○ */
function trLane(host, q, n, ev, d0, dates) {
  host.textContent = '';
  if (!q.length) { host.append(h('p', {class: 'small', text: '칸 길은 장이 끝난 날부터 그려요.'})); return; }
  const wrap = h('div', {class: 'lc cal-lane'}); host.append(wrap);
  const W = Math.max(260, Math.round(wrap.getBoundingClientRect().width || 320)), LH = 34, PT = 14, H = PT + LH * 4 + 16, padR = AXR(), T = tok();
  const X = i => 4 + i * (W - 4 - padR) / Math.max(1, n - 1), lane = c => ({'4': 0, '3': 1, '2': 2, '1': 3, x: 4}[c]), Y = k => PT + k * LH;
  const svg = sv('svg', {viewBox: `0 0 ${W} ${H}`, width: W, height: H, role: 'img', 'aria-label': '칸 길 — ' + [...q].map((c, i) => `${md(dates[i])} ${c === '?' ? '?' : c === 'x' ? '밖' : TR_B[c]}`).join(', ')});
  const lab = h('div', {class: 'yr', 'aria-hidden': 'true'});
  ['40%', '30%', '20%', '10%', '밖'].forEach((t, k) => { svg.append(sv('line', {x1: 4, x2: W - padR + 6, y1: Y(k), y2: Y(k), stroke: k === 4 ? T.mute : T['m4-soft'], 'stroke-width': 1, 'stroke-dasharray': k === 4 ? '2 4' : null})); lab.append(st(h('span', {class: 'num', text: t}), {top: (Y(k) - 11).toFixed(1) + 'px'})); });
  wrap.append(lab);
  let d = '', last = null;
  [...q].forEach((c, i) => { if (c === '?') { last = null; return; } const y = Y(lane(c)); d += last == null ? `M${X(i).toFixed(1)} ${y}` : `H${X(i).toFixed(1)}V${y}`; last = y; });
  svg.append(sv('path', {d, fill: 'none', stroke: T.ink, 'stroke-width': 2, 'stroke-linejoin': 'round'}));
  const at = dd => dates.indexOf(dd);
  if (q[0] !== '?') svg.append(sv('circle', {cx: X(0), cy: Y(lane(q[0])), r: 6, fill: T.ink, stroke: T.night, 'stroke-width': 2})); // 선택
  for (const e of ev) { const i = at(e[0]); if (i < 0 || q[i] == null || q[i] === '?') continue;
    if (e[1] === 'out' && i > 0) svg.append(sv('circle', {cx: X(i), cy: Y(4), r: 6, fill: T.night, stroke: T.ink, 'stroke-width': 2})); // 탈락
    if (e[1] === 're') { svg.append(sv('circle', {cx: X(i), cy: Y(lane(q[i])), r: 7, fill: 'none', stroke: T.ink, 'stroke-width': 2}), sv('circle', {cx: X(i), cy: Y(lane(q[i])), r: 3, fill: T.ink})); } }
  wrap.prepend(svg);
}
async function viewCalCase(v, code) {
  let ok = true; try { await Promise.all([needTr(), needTrCase()]); } catch { ok = false; }
  v.append(h('p', {class: 'cal-back'}, h('a', {class: 'inl', href: '#/cal', text: '‹ 달력'})));
  if (!ok) { v.append(h('h1', {class: 'head', text: '종목 파일'}), h('p', {class: 'q', text: '? 종목 파일을 못 받았어요. 잠시 뒤 다시 열어 주세요.'}), foot()); return; }
  const T = D.tr, r0 = T.cases.find(x => x[0] === code), K = D.trc[code];
  if (!r0 || !K) { await needMkt().catch(() => {}); v.append(h('h1', {class: 'head', text: D.mkt?.[code]?.n ?? code}), h('p', {class: 'note', text: '이 종목은 지금 달력에서 지켜보는 곳이 아니에요. 뽑힌 뒤 60거래일이 지나면 목록에서 내려요.'}), h('p', {}, h('a', {class: 'inl', href: cHref(code), text: '회사 보기 ›'})), foot()); return; }
  const r = trRow(r0), i0 = T.dates.indexOf(r.d0), dates = T.dates.slice(i0, i0 + K.p.length);
  v.append(h('h1', {class: 'head', text: r.n}));
  v.append(h('p', {class: 'count', text: tx(`${mdw(r.d0)}에 ${trTo(r.b)} 뽑혔어요. 그때 5일간 ${pct(r.r5)}${r.re ? ' · 되짚음(그날 종가로 다시 셈)' : ''}`)}));
  const now = h('div', {class: 'cal-now'}, h('p', {class: 'cal-w ' + (r.st === 'u' ? 'up' : r.st === 'd' ? 'down' : r.st === 'q' ? 'q' : 'flat'), text: CAL_WORD[r.st] ?? '?'}));
  if (r.st === 'n') now.append(h('p', {class: 'small', text: '등락률은 다음 장날부터 쌓여요.'}));
  else now.append(h('p', {class: 'cal-p'}, h('span', {text: '뽑힌 날부터 '}), r.v == null ? h('b', {class: 'num q', text: '?'}) : pctEl(r.v)));
  v.append(now);
  if (r.h) v.append(h('p', {class: 'q', text: '? 거래 멈춤 — 마지막 장날에 거래가 없었어요. 거래정지일 수 있어요.'}));
  if (r.f) v.append(h('p', {class: 'q', text: r.f === 2 ? '? 반 토막 — 뽑힌 뒤 가장 높던 종가의 반 밑이에요. 하루 35% 넘게 바뀐 날이 있어 값이 고쳐졌을 수 있어요.' : '! 반 토막 — 뽑힌 뒤 가장 높던 종가의 반 밑이에요.'}));
  if (K.mk != null) v.append(h('p', {class: 'cal-mk', text: tx(`같은 기간 모든 회사의 가운데 값은 ${pct(K.mk)}였어요.`)}));
  if (T.provisional && r.st !== 'n') v.append(h('p', {class: 'small', text: tx(`${md(T.asOf)} 값은 장 중 값이에요. 저녁 8시까지 바뀌어요.`)}));
  const g1 = h('div', {class: 'cal-g'}), g2 = h('div', {class: 'cal-g'});
  v.append(h('h2', {class: 'sec', text: '뽑힌 날부터 날마다'}), g1, h('h2', {class: 'sec', text: '그 회사 5일 오름이 든 칸'}), g2,
    h('p', {class: 'lkey'}, h('span', {text: '● 선택'}), h('span', {text: '○ 탈락'}), h('span', {text: '◉ 다시 선택'}), K.z.length ? h('span', {text: '빈 점 = 거래가 없던 날'}) : null));
  const drawG = () => { trLine(g1, K.p, dates, K.z, r.n); trLane(g2, K.q, K.p.length, K.ev, r.d0, dates); };
  drawG(); chartDraw = drawG;
  // 단계(택배 조회처럼 — 새 것이 위 · 넷 + 「더 보기」)
  const at = d => { const i = dates.indexOf(d); return i >= 0 ? K.p[i] : null; };
  const S = [{d: r.d0, t: `선택 · ${TR_B[r.b] ?? '?'}`, s: `5일간 ${pct(r.r5)}${r.re ? ' · 되짚음' : ''}`}];
  for (const e of K.ev) S.push({d: e[0], t: e[1] === 'mv' ? `${trTo(e[2])} 이동` : e[1] === 'out' ? '탈락 · 10% 밑이거나 거래가 적어짐' : e[1] === 're' ? `다시 선택 · ${TR_B[e[2]] ?? '?'}` : '조심 · 투자경고 오름 기준에 닿음', s: e[1] === 'warn' ? '? 실제로 지정됐는지는 몰라요' : `뽑힌 날부터 ${pct(at(e[0]))}`, g: e[1] === 'warn'});
  if (r.st !== 'n') S.push({d: T.asOf, t: `지금 ${pct(r.v)}`, s: CAL_WORD[r.st] ?? '', now: true});
  const ol = h('ol', {class: 'cal-steps'}), lis = S.slice().reverse().map(s => h('li', {class: (s.now ? 'now' : '') + (s.g ? ' g' : '')}, h('span', {class: 'd', text: md(s.d)}), h('b', {text: tx(s.t)}), s.s ? h('span', {class: 's' + (/^\?/.test(s.s) ? ' q' : ''), text: tx(s.s)}) : null));
  lis.slice(0, 4).forEach(x => ol.append(x));
  v.append(h('h2', {class: 'sec', text: '지나온 일'}), ol);
  if (lis.length > 4) { const mb = h('button', {type: 'button', class: 'cal-btn', text: `더 보기 ${lis.length - 4}개`}); mb.addEventListener('click', () => { lis.slice(4).forEach(x => ol.append(x)); mb.remove(); }); v.append(mb); }
  // 관리 — 관심(★ 달력 맨 위) · 관심 없음(달력에서 숨김 · 셈은 그대로) · 이 기계에만
  const live = h('p', {class: 'sr', role: 'status', 'aria-live': 'polite'});
  const sb = h('button', {type: 'button', class: 'cal-btn cal-star'}), hb = h('button', {type: 'button', class: 'cal-btn cal-hide'});
  const paint = () => { const s = starGet().has(code), x = hideGet().has(code); sb.setAttribute('aria-pressed', String(s)); sb.textContent = s ? '★ 관심 풀기' : '☆ 관심'; hb.setAttribute('aria-pressed', String(x)); hb.textContent = x ? '숨김 풀기' : '관심 없음'; };
  sb.addEventListener('click', () => { const s = starGet(), on = !s.has(code); if (on) s.add(code); else s.delete(code); const kept = starPut(s); paint(); live.textContent = (on ? `${r.n} 관심에 넣었어요. 달력 맨 위에 보여요.` : `${r.n} 관심에서 뺐어요.`) + (kept ? '' : ' 이 기계는 기억을 못 해 다시 열면 돌아와요.'); });
  hb.addEventListener('click', () => { const x = hideGet(), on = !x.has(code); if (on) x.add(code); else x.delete(code); const kept = hidePut(x); paint(); live.textContent = (on ? `${r.n} 달력에서 숨겼어요. 따라가기는 그대로예요.` : `${r.n} 다시 보여요.`) + (kept ? '' : ' 이 기계는 기억을 못 해 다시 열면 돌아와요.'); });
  paint();
  v.append(h('div', {class: 'cal-acts'}, sb, hb, h('a', {class: 'cal-btn cal-co', href: cHref(code), text: '회사 보기 ›'})), live);
  v.append(h('p', {class: 'hon', text: '사고팔 곳을 고른 목록이 아니에요.'}), h('p', {class: 'small', text: '지난 값일 뿐 앞날을 말하지 않아요.'}));
  v.append(foot({src: `달력은 네 칸 기록과 일봉으로 ${md(T.asOf)}까지 셌어요`}));
}
// 종목 파일을 보고 뒤로 오면 그 자리(이 열린 창 안에서만)
const calMem = {y: 0, open: []};
let calPrev = ''; // 앞 화면 — 종목 파일에서 돌아오면 칸 고르기 · 보이는 날을 그대로(다른 곳에서 오면 처음 꼴)
function calLeave(from) { calPrev = from || ''; if (calPrev === '#/cal') { calMem.y = window.scrollY; calMem.open = [...document.querySelectorAll('#view details[data-k]')].filter(d => d.open).map(d => d.dataset.k); } }
function calBack(to, from) { if (to !== '#/cal' || !/^#\/cal\//.test(from || '')) return; for (const d of document.querySelectorAll('#view details[data-k]')) d.open = calMem.open.includes(d.dataset.k); requestAnimationFrame(() => window.scrollTo(0, calMem.y)); }

// ════ 조건 찾기 탭(사장님 2026-10-15(싱가포르) 23:53 「엘셀처럼 찾는 조건을 3가지 걸수 하자 예를 즐어 ㅜ업종중에 올라가는 업종 그업종중에 대장주 그리고 급등제외 뭐 이런거 …
//   업데이트 탭 빼고 정말 담순하면서도 정말 사람들이 필요한게 무엇인지 토롬햐서 만들어봐 속은 정밀하나 사용은 정말 감편하게」 · 23:54 「가」(업데이트 탭 자리) · 규칙 72) ════
//   여섯 팀(엑셀 · 스크리너 · 애플 · 구글 · CIA · 토스) 따로 → 결정표(docs/design/cond-2026-10-16) — 칸 셋(① 어느 업종 · ② 어떤 회사 · ③ 무엇을 빼나) · 미리 정한 큰 단추 · 「그리고」만
//   조건 = 회사 하나의 성질(cond.json cd-v1 · scripts/atlas11/t365/cond.py) — 화면은 거르기 · 세기 · 줄 세우기만 · 값을 모르면 「?」로 따로(넘음 · 빠짐으로 치지 않음)
let cdP = null;
const cdOk = X => !!(X && X.version === 'cd-v1' && isDay(X.asOf) && Array.isArray(X.ind) && X.co && Array.isArray(X.co.c) && X.co.c.length === X.n);
function needCond() { if (!cdP) cdP = getJson('cond.json').then(x => { if (!cdOk(x)) throw Error('cond.json'); D.cond = x; }).catch(e => { cdP = null; throw e; }); return cdP; }
const CD_SLOTS = [
  {k: 'a', name: '업종', ops: [['big', '큰 회사가 오른 업종', '지난 1주 · 몸값 큰 회사일수록 크게 셈'], ['rise', '요즘 오르는 업종', '지난 1주 · 회사마다 한 표 — 첫 화면 목록'], ['up', '한 달 오른 업종', '20거래일 ▲ 오름 — 업종 탭과 같음'], ['dn', '한 달 내린 업종', '20거래일 ▼ 내림'], ['all', '업종 가리지 않음', '77개 업종 모두']]},
  {k: 'b', name: '회사', ops: [['lead', '대장주', '업종 안 몸값 1등'], ['top3', '업종 몸값 3등까지', '업종마다 큰 회사 셋'], ['f3', '3년 모두 돈 번 곳', '확정 결산 3해 순이익이 모두 0보다 큼'], ['pick', '고른 곳', '멍거 · 린치 조건'], ['all', '회사 가리지 않음', '모든 회사']]},
  {k: 'c', name: '빼기', ops: [['nos', '5일 10% 넘게 오른 곳 빼기', '급등 탭에 드는 자격과 같은 자'], ['spike', '확 뛴 곳 모두 빼기', '5일 10% · 하루 15% · 한 달 30% 넘게 오른 곳'], ['loss', '지난해 손해 본 곳 빼기', '마지막 해 순이익이 0 밑'], ['all', '빼지 않음', '아무것도 빼지 않아요']]},
];
const CD_DEF = {a: 'big', b: 'lead', c: 'nos'}, CD_KEY = 'atlas:cond'; // 결정표 v2 #4 — 기본 업종은 「큰 회사가 오른 업종」(반대 토론: 한 회사 한 표 목록이면 대장주 7곳 중 5곳이 같은 5일 내림)
const cdValid = st => st && CD_SLOTS.every(S => S.ops.some(o => o[0] === st[S.k]));
function cdLoad(arg) {
  const m = /^([a-z0-9]+)-([a-z0-9]+)-([a-z0-9]+)$/.exec(arg || ''); if (m) { const st = {a: m[1], b: m[2], c: m[3]}; if (cdValid(st)) return st; }
  try { const st = JSON.parse(localStorage.getItem(CD_KEY) || 'null'); if (cdValid(st)) return st; } catch { /* 기억 못 함 */ }
  return {...CD_DEF};
}
function cdSave(st) { try { localStorage.setItem(CD_KEY, JSON.stringify(st)); } catch { /* 기억 못 함 — 이 화면 동안만 */ } }
/** 조건 하나의 판정 — true 넘음 · false 빠짐 · null 모름(?) */
function cdTest(X, k, op, j) {
  const C = X.co, I = X.ind[C.i[j]];
  if (op === 'all') return true;
  if (k === 'a') return op === 'big' ? (I.rc == null ? null : I.rc === 1) : op === 'rise' ? I.rise === 1 : op === 'up' ? I.up === 1 : op === 'dn' ? I.dn === 1 : null;
  if (k === 'b') { if (op === 'pick') return C.p[j] === 1; if (op === 'f3') return C.f3[j] == null ? null : C.f3[j] === 1; const rk = C.rk[j]; if (rk == null) return null; return op === 'lead' ? rk === 1 : op === 'top3' ? rk <= 3 : null; }
  if (k === 'c') {
    if (op === 'nos') return C.x5[j] == null ? null : C.x5[j] === 0;
    if (op === 'spike') { const f = [C.x5[j], C.d15[j], C.m30[j]]; if (f.includes(1)) return false; return f.includes(null) ? null : true; }
    if (op === 'loss') return C.ls[j] == null ? null : C.ls[j] === 0;
  }
  return null;
}
/** 거르기 — 단계마다 남은 곳(? 는 따로 · 앞 단계에서 빠진 곳은 다시 안 셈) */
function cdRun(X, st) {
  let S = X.co.c.map((_, j) => j); const steps = [S.length], q = new Map();
  for (const sl of CD_SLOTS) {
    const op = st[sl.k], nxt = [];
    for (const j of S) { const v = cdTest(X, sl.k, op, j); if (v === true) nxt.push(j); else if (v == null) q.set(j, sl.k); }
    S = nxt; steps.push(S.length);
  }
  const C = X.co; S.sort((x, y) => (C.cap[y] ?? -1) - (C.cap[x] ?? -1) || (C.c[x] < C.c[y] ? -1 : 1));
  return {steps, res: S, q: [...q].map(([j, k]) => [j, k]).sort((x, y) => (C.c[x[0]] < C.c[y[0]] ? -1 : 1))};
}
const CD_QWHY = {a: '업종 값 모름', b: '몸값 · 성적표 모름', c: '종가가 비었거나 하루에 30% 넘게 바뀐 날(주식 수 바뀜일 수 있음)'};
const cdOp = (k, op) => CD_SLOTS.find(S => S.k === k).ops.find(o => o[0] === op);
const cdLine = (C, j) => { const v = C.l5?.[j]; return Array.isArray(v) && v.every(x => x != null) ? v : null; };
let cdMore = 20;
async function viewCond(v, arg) {
  let ok = true; try { await Promise.all([needCond(), needMkt()]); } catch { ok = false; }
  v.append(h('h1', {class: 'head', text: '조건 찾기'}));
  if (!ok) { v.append(h('p', {class: 'q', text: '? 조건 자료를 못 받았어요. 잠시 뒤 다시 열어 주세요.'}), h('p', {class: 'hon', text: '사고팔 곳을 고른 목록이 아니에요.'}), foot()); return; }
  const X = D.cond, C = X.co, st = cdLoad(arg);
  if (X.asOf !== D.core.asOf) { v.append(h('p', {class: 'q', text: tx(`? 조건 자료(${md(X.asOf)})가 다른 자료(${md(D.core.asOf)})와 날이 달라요. 다음 업데이트에 맞춰져요.`)}), h('p', {class: 'hon', text: '사고팔 곳을 고른 목록이 아니에요.'}), foot()); return; } // 옛 날 값을 지금 것처럼 보이지 않음(CIA 팀)
  v.append(h('p', {class: 'count cd-time', text: tx(`${md(X.asOf)} ${X.provisional ? '장 중 값' : '장 마감 값'}이에요.`)}));
  if (X.provisional) v.append(h('p', {class: 'small', text: '저녁 8시까지 바뀌어요.'})); // 바로 위 줄이 「… 장 중 값이에요.」라 같은 말을 두 번 하지 않음(2026-10-16 탐침 사진)
  const box = h('div', {class: 'cd-box'}); v.append(box);
  const draw = () => {
    box.textContent = '';
    const R = cdRun(X, st), isDef = CD_SLOTS.every(S => st[S.k] === CD_DEF[S.k]);
    const slots = h('div', {class: 'cd-slots', role: 'group', 'aria-label': '조건 셋'});
    CD_SLOTS.forEach((S, k) => { const o = cdOp(S.k, st[S.k]);
      slots.append(h('button', {type: 'button', class: 'cd-slot' + (R.steps[k + 1] === 0 && R.steps[k] > 0 ? ' zero' : ''), 'data-k': S.k, 'aria-haspopup': 'dialog', 'aria-label': `${'①②③'[k]} ${S.name}: ${o[1]} — 남은 곳 ${R.steps[k + 1]}곳 · 바꾸기`},
        h('span', {class: 'cd-n', 'aria-hidden': 'true', text: '①②③'[k]}), h('b', {class: 'cd-o', text: o[1]}), h('span', {class: 'cd-c num', text: R.steps[k + 1].toLocaleString('ko-KR') + '곳'}), h('i', {class: 'cd-chev', 'aria-hidden': 'true', text: '›'}))); }); // 칸 이름(업종 · 회사 · 빼기)은 고른 말이 말함 — 한 줄로(첫 화면에 결과 줄이 보이게)
    box.append(slots);
    if (!isDef) { const re = h('button', {type: 'button', class: 'cd-btn cd-reset', text: '처음대로'}); re.addEventListener('click', () => { Object.assign(st, CD_DEF); cdSave(st); cdMore = 20; draw(); }); box.append(re); }
    const n = R.res.length, up = R.res.filter(j => C.r5[j] != null && C.r5[j] > 0).length, dn = R.res.filter(j => C.r5[j] != null && C.r5[j] < 0).length;
    box.append(h('p', {class: 'cd-big', role: 'status', 'aria-live': 'polite'}, h('span', {text: '남은 곳 '}), h('b', {class: 'num', text: n.toLocaleString('ko-KR')}), h('span', {text: '곳'}),
      n ? h('span', {class: 'cd-ud'}, h('span', {class: 'up num', text: ` ▲${up}`}), h('span', {class: 'down num', text: ` ▼${dn}`})) : null));
    box.append(h('p', {class: 'small cd-flow num', 'aria-hidden': 'true', text: R.steps.map(x => x.toLocaleString('ko-KR')).join(' → ')}));
    box.append(h('p', {class: 'small cd-how', text: isDef ? '예로 걸어 둔 조건 · 몸값 큰 차례' : '몸값 큰 차례'}));
    if (!n) {
      box.append(h('p', {class: 'cd-none', text: '셋을 모두 넘은 곳이 없어요.'}));
      const alt = h('div', {class: 'cd-alt'}); box.append(alt);
      for (const S of CD_SLOTS) { if (st[S.k] === 'all') continue; const t = {...st, [S.k]: 'all'}, m = cdRun(X, t).res.length;
        const b = h('button', {type: 'button', class: 'cd-btn', text: `${'①②③'[CD_SLOTS.indexOf(S)]} 풀면 ${m.toLocaleString('ko-KR')}곳`}); b.addEventListener('click', () => { st[S.k] = 'all'; cdSave(st); cdMore = 20; draw(); }); alt.append(b); }
    }
    const list = h('div', {class: 'cd-rows'});
    for (const j of R.res.slice(0, cdMore)) {
      const name = D.mkt?.[C.c[j]]?.n ?? C.c[j], ind = X.ind[C.i[j]].n;
      list.append(h('a', {class: 'cd-row', href: cHref(C.c[j], C.p[j] === 1), 'data-c': C.c[j]},
        h('span', {class: 'nm' + (C.p[j] === 1 ? ' gold' : '')}, name), h('span', {class: 'cd-v'}, h('span', {class: 'cd-5', text: '5일간 '}), C.r5[j] == null ? h('b', {class: 'num q', text: '?'}) : pctEl(C.r5[j])),
        h('span', {class: 'cd-sub'}, tx(ind + (C.rk[j] ? ` · 몸값 ${C.rk[j]}등` : '')), C.p[j] === 1 ? h('span', {class: 'cd-pk', text: ' · 고른 곳'}) : null)));
    }
    box.append(list);
    if (n > cdMore) { const mb = h('button', {type: 'button', class: 'cd-btn cd-more', text: `${Math.min(20, n - cdMore)}곳 더 보기 · 남은 ${(n - cdMore).toLocaleString('ko-KR')}곳`}); mb.addEventListener('click', () => { cdMore += 20; draw(); }); box.append(mb); }
    if (R.q.length) box.append(h('details', {class: 'more cd-q'}, h('summary', {text: `? 값을 몰라 넣지 않은 곳 ${R.q.length.toLocaleString('ko-KR')}곳`}), h('div', {class: 'in'}, ...R.q.map(([j, k]) => h('p', {class: 'cd-qr'}, h('a', {class: 'inl', href: cHref(C.c[j], C.p[j] === 1), text: D.mkt?.[C.c[j]]?.n ?? C.c[j]}), tx(` — ${'①②③'[CD_SLOTS.findIndex(S => S.k === k)]} ${CD_QWHY[k]}`))))));
    // 업데이트 뒤 — 같은 조건 · 다른 날이면 지난번과 견줌(보는 기계에만)
    try { const key = 'atlas:cond-seen', sig = CD_SLOTS.map(S => st[S.k]).join('-'), prev = JSON.parse(localStorage.getItem(key) || 'null'), now = R.res.map(j => C.c[j]);
      if (prev && prev.sig === sig && prev.asOf !== X.asOf && Array.isArray(prev.codes)) { const a = now.filter(c => !prev.codes.includes(c)).length, b = prev.codes.filter(c => !now.includes(c)).length; box.prepend(h('p', {class: 'note cd-diff', text: tx(`${md(prev.asOf)}보다 새로 ${a}곳 · 빠진 ${b}곳`)})); }
      localStorage.setItem(key, JSON.stringify({sig, asOf: X.asOf, codes: now}));
    } catch { /* 기억 못 함 */ }
  };
  box.addEventListener('click', e => { const b = e.target.closest('button.cd-slot'); if (b) cdPick(X, st, b.dataset.k, () => { cdSave(st); cdMore = 20; draw(); }); });
  draw();
  v.append(h('details', {class: 'more cd-howto'}, h('summary', {text: '어떻게 셌나요?'}), h('div', {class: 'in'}, ...[
    '조건 하나는 회사 하나의 성질이에요. 셋을 모두 넘은 곳만 남아요. 칸 차례를 바꿔도 끝은 같아요.',
    '「큰 회사가 오른 업종」은 몸값이 큰 회사일수록 크게 쳐서 센 업종 지수가 지난 5거래일 0.05% 넘게 오른 업종이에요. 많이 오른 순으로 11개까지 셌어요.',
    '「요즘 오르는 업종」은 첫 화면과 같은 목록이에요. 회사마다 한 표로 센 업종 지수로 같은 셈을 했어요.',
    '「한 달 오른 업종」 · 「한 달 내린 업종」은 업종 탭의 ▲ · ▼ 와 같은 셈이에요.',
    '「대장주」는 업종 안에서 몸값이 가장 큰 회사예요. 몸값이 같으면 종목 번호가 작은 곳이에요. 다른 조건으로 빠져도 2등이 대장주가 되지 않아요.',
    '「5일 10% 넘게 오른 곳 빼기」는 마지막 종가가 5거래일 전 종가보다 10% 넘게 높은 곳을 빼요. 급등 탭에 드는 자격과 같은 자예요.',
    '「확 뛴 곳 모두 빼기」는 거기에 지난 20거래일 동안 하루 15% 넘게 오른 날이 있거나 20거래일 30% 넘게 오른 곳도 빼요.',
    '「3년 모두 돈 번 곳」 · 「지난해 손해 본 곳」은 확정 결산(예상치 아님)만 써요.',
    '몸값은 자료를 모은 날 받은 값이라 종가 날과 하루쯤 다를 수 있어요.',
    '값을 모르는 곳은 넘음으로도 빠짐으로도 치지 않고 「?」로 따로 보여요.',
    '고른 조건은 이 기계에만 남아요.',
  ].map(t => h('p', {text: t})))));
  v.append(h('p', {class: 'hon', text: '사고팔 곳을 고른 목록이 아니에요.'}), h('p', {class: 'small', text: '지난 값일 뿐 앞날을 말하지 않아요.'}));
  v.append(foot({src: `조건 찾기는 ${md(X.asOf)} 종가 · 몸값 · 확정 결산으로 셌어요`}));
}
/** 고르는 판 — 칸 하나의 고르기(줄마다 이걸 고르면 남는 곳) · 누르면 바로 걸리고 닫힘 */
function cdPick(X, st, k, done) {
  const S = CD_SLOTS.find(x => x.k === k), sh = openSheet('cdSheet'), body = $('#cdBody');
  $('#cdTitle').textContent = `${'①②③'[CD_SLOTS.indexOf(S)]} ${S.name} 고르기`;
  body.textContent = '';
  for (const [op, t, d] of S.ops) {
    const m = cdRun(X, {...st, [k]: op}).res.length;
    const b = h('button', {type: 'button', class: 'cd-op', 'data-op': op, 'aria-current': st[k] === op ? 'true' : null},
      h('span', {class: 'cd-ot'}, h('b', {text: t}), h('span', {class: 'cd-od', text: d})), h('span', {class: 'cd-oc num', text: `→ ${m.toLocaleString('ko-KR')}곳`}));
    b.addEventListener('click', () => { st[k] = op; closeSheet('cdSheet'); done(); });
    body.append(b);
  }
  setTimeout(() => (body.querySelector('[aria-current]') ?? body.querySelector('button'))?.focus(), 30);
}

// ── 소리 · 글씨 ──
function speak() {
  try { if (!('speechSynthesis' in window)) return; speechSynthesis.cancel();
    const v = $('#view'), say = t => (EN ? t : t?.replace(/−/g, '마이너스 ').replace(/\+/g, '플러스 ')), m4 = [...v.querySelectorAll('.m4-sec')].slice(0, 3); // 첫 화면 = 먹빛 판의 앞 세 칸(제목 · 첫 줄)
    const parts = [...(m4.length ? m4.flatMap(x => [x.querySelector('.m4-t')?.textContent, x.querySelector('.m4-lead')?.textContent]).map(say) : [v.querySelector('h1')?.textContent]), v.querySelector('.count')?.textContent, ...[...v.querySelectorAll('.board .row')].sort((a, b) => a.getBoundingClientRect().top - b.getBoundingClientRect().top).slice(0, 3).map(r => r.querySelector('.nm').textContent + ' ' + (EN ? r.querySelector('.val').textContent : r.querySelector('.val').textContent.replace('−', '마이너스 ').replace('+', '플러스 ')) + (r.querySelector('.trd') ? ', ' + r.querySelector('.trd').textContent.replace(/[▲▼▶] /, '') : ''))].filter(Boolean);
    const u = new SpeechSynthesisUtterance(parts.join('. ')); u.lang = EN ? 'en-US' : 'ko-KR'; u.rate = 0.9; speechSynthesis.speak(u); } catch { /* 소리 없음 */ }
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
  for (const id of ['findSheet', 'infoSheet', 'langSheet', 'cdSheet']) { const s = $('#' + id); if (s && !s.hidden) { s.hidden = true; delete document.body.dataset.sheet; } }
  if (hsh === lastMain && $('#view').childElementCount) return;
  const from = lastMain; if (typeof svLeave === 'function') svLeave(from); if (typeof calLeave === 'function') calLeave(from); // 급등 칸 · 달력 자리 기억(뒤로 오면 그 자리)
  lastMain = hsh;
  const my = ++routeSeq, root = $('#view'); root.textContent = ''; chartDraw = null;
  const v = h('div', {class: 'vw'}); root.append(v); // 길마다 새 칸 — 늦게 끝난 앞 화면은 떨어진 칸에 그려져 보이지 않음(구글팀: 두 화면이 겹치던 것)
  const opening = h('p', {class: 'boot'}, MO.cat('white', 34), ' 여는 중입니다…'); v.append(opening); // 느린 망에서 빈 화면 대신(애플팀) — 다 그리면 지움
  for (const t of ['#tabHome', '#tabList', '#tabSurge', '#tabCond', '#tabCal']) $(t)?.toggleAttribute('aria-current', false);
  try {
    const [, kind, raw] = hsh.match(/^#\/(\w*)\/?(.*)$/) || [], arg = dec(raw ?? '');
    document.documentElement?.classList?.toggle('m4', !kind); document.querySelector?.('meta[name="theme-color"]')?.setAttribute('content', '#0C0E12'); // 첫 화면 꾸밈(html.m4)은 첫 화면에만 · 색(먹빛)과 휴대폰 위 띠 색은 모든 화면(2026-10-15 12:43 「모든 화면을 바꿔」) · 네 눈 CIA 눈의 길 흔들기(브라우저 없이 route 를 돌림)에서도 멈추지 않게 ?.
    if (!kind) { $('#tabHome').setAttribute('aria-current', 'page'); await viewHome(v); }
    else if (arg == null && /^[gic]$/.test(kind)) viewMissing(v); // 깨진 주소 = 없는 주소
    else if (kind === 'list') { $('#tabList').setAttribute('aria-current', 'page'); viewList(v); }
    else if (kind === '36') { location.replace('#/'); return; } // 지운 화면(사장님 2026-10-13 06:45 「영구 삭제」) — 옛 주소는 첫 화면으로
    else if (kind === 'up') await viewUpdates(v); // 업데이트 기록 — 아래 탭은 2026-10-15 23:54 「가」로 조건 찾기에 자리를 내줌 · 기록은 도움말(?)에서 엶
    else if (kind === 'cond') { $('#tabCond').setAttribute('aria-current', 'page'); await viewCond(v, arg); } // 조건 찾기(사장님 2026-10-15 23:53 「엘셀처럼 찾는 조건을 3가지」 · 23:54 「가」 · 규칙 72)
    else if (kind === 'surge') { $('#tabSurge').setAttribute('aria-current', 'page'); const t = !arg ? 'sv' : /^(10|20|30|40)$/.test(arg) ? 'b' + arg : null; if (t) await viewSurge(v, t); else viewMissing(v); } // 급등 탭(사장님 2026-10-15 14:27 「탭을 하나 더 만들어라 … 최근 5일에 급등한 종목을 36개」 · 규칙 69)
    else if (kind === 'cal') { $('#tabCal').setAttribute('aria-current', 'page'); if (!arg) await viewCal(v); else if (/^[0-9A-Z]{6}$/.test(arg)) await viewCalCase(v, arg); else viewMissing(v); } // 달력 탭(사장님 2026-10-15 19:28 · 20:51 「추적하는 시스탬」 · 규칙 70) — 종목 파일 #/cal/<번호>
    else if (kind === 'time') await viewTime(v);
    else if (kind === 'g') viewGroup(v, arg);
    else if (kind === 'i') await viewIndustry(v, arg);
    else if (kind === 'c') { const [code, sub] = arg.split('/'); if (sub === 'past') await viewPast(v, code); else if (sub === 'rivals') await viewRivals(v, code); else if (sub === 'grow') await viewGrow(v, code); else if (sub === 'range') await viewRange(v, code); else if (!sub) await viewCompany(v, code); else viewMissing(v, code); }
    else { location.replace('#/'); return; } // 옛 ATLAS 주소(#/stocks · #/road …) — 옛 판은 2026-10-15 23:35 사장님 「알틀란스는 영구 삭제한다」로 지움 · 첫 화면으로
  } catch (e) {
    console.error(e);
    if (my !== routeSeq) return;
    v.textContent = ''; v.append(MO.catSleep(72), h('h1', {class: 'head', text: '자료를 못 읽었습니다'}), h('p', {class: 'count', text: '? 잠시 뒤 다시 열어 주세요.'}));
    const again = h('button', {class: 'play', type: 'button', text: '다시 열기'}); again.addEventListener('click', () => { lastMain = ''; route(); }); v.append(again);
  }
  if (my !== routeSeq) return; // 그 사이 다른 화면으로 갔음 — 제목 · 자리 · 초점을 건드리지 않음
  opening.remove();
  window.scrollTo(0, 0);
  if (typeof svBack === 'function') svBack(hsh, from); // 회사에서 급등 칸으로 돌아오면 그 자리(새 눈 점검 3)
  if (typeof calBack === 'function') calBack(hsh, from); // 종목 파일에서 달력으로 돌아오면 그 자리
  document.title = L(v.querySelector('.m4-letter') ? '한눈에 · ATLAS' : (v.querySelector('h1')?.textContent || 'ATLAS') + ' · ATLAS'); // 첫 화면은 아래 탭 이름 그대로(머리 「시장」은 칸 이름)
  try { root.focus({preventScroll: true}); } catch { /* 초점 못 옮김 */ } // 화면 읽기가 새 화면 제목부터
}

/** 탭 이름 뒤 수 — 「업종」 + 「 77」(수는 따로 칸 · 320 폭에서는 숨김 · 글은 「업종 77」 그대로) */
function tabNum(sel, name, n) { const a = $(sel); if (!a) return; if (EN && a.querySelector('.tl')) { a.querySelector('.tabn')?.remove(); a.append(h('span', {class: 'tabn', text: ' ' + n})); return; } a.textContent = name; a.append(h('span', {class: 'tabn', text: ' ' + n})); }
/** 영어 탭 이름 — 긴 말 · 짧은 말 둘(360 밑은 짧은 말 · 431 밑은 수를 뺌 — 2026-10-16 영어 탭이 360 폭에서 겹치던 것) */
const TAB_EN = [['#tabHome', 'Home', 'Home'], ['#tabList', 'Sectors', 'Sector'], ['#tabCond', 'Filter', 'Filter'], ['#tabSurge', 'Surge', 'Surge'], ['#tabCal', 'Calendar', 'Dates']];
async function boot() {
  for (const b of document.querySelectorAll('#langSheet button[data-lang]')) if ((b.dataset.lang === 'en') === EN) b.setAttribute('aria-current', 'true'); // 지금 말
  if (EN) for (const [s, l, sh] of TAB_EN) { const a = $(s); if (a) { a.textContent = ''; a.append(h('span', {class: 'tl', text: l}), h('span', {class: 'ts', text: sh})); } }
  await startI18n(); // 영어면 사전 · 이름을 먼저 읽고 그려지는 글을 모두 영어로(옛 판으로 넘기던 ?lang= 은 옛 판 영구 삭제로 여기서 엶)
  if (EN_READY && $('#langBtn')) { $('#langBtn').hidden = false; document.documentElement.classList.add('has-lang'); } // 영어 판을 보일 때만 지구 단추(규칙 71 ③)
  $('#langBtn')?.addEventListener('click', () => { openSheet('langSheet'); $('#langSheet [aria-current]')?.focus(); });
  $('#langSheet')?.addEventListener('click', e => { const b = e.target.closest('button[data-lang]'); if (!b) return; if ((b.dataset.lang === 'en') === EN) { closeSheet('langSheet'); return; } switchLang(b.dataset.lang); });
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
  document.querySelector('.tabbar')?.addEventListener('click', e => { const a = e.target.closest('a[href^="#/"]'); if (!a) return; if (a.getAttribute('href') === (location.hash || '#/')) { e.preventDefault(); window.scrollTo({top: 0, behavior: RM.matches ? 'auto' : 'smooth'}); } });
  try { D.core = await getJson('core.json'); tabNum('#tabList', '업종', D.core.industries.length); needSurge().then(() => { if (D.surge?.n != null) tabNum('#tabSurge', '급등', D.surge.n); }).catch(() => {}); } // 급등 탭 이름 = 고른 수(못 받으면 「급등」 그대로)
  catch (e) { console.error(e); const v = $('#view'); v.textContent = ''; const again = h('button', {class: 'play', type: 'button', text: '다시 열기'}); again.addEventListener('click', () => location.reload()); v.append(MO.catSleep(72), h('h1', {class: 'head', text: '자료를 못 읽었습니다'}), h('p', {class: 'count', text: '? 잠시 뒤 다시 열어 주세요.'}), again); return; }
  await route();
  setTimeout(() => { needComp().catch(() => {}); }, 400);
}
boot();
