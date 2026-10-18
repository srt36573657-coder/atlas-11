/* 새 아틀란스 「달력」(#/cal · 종목 파일 #/cal/<번호>) — 지금 아틀란스 달력 탭(site/atlas/atlas.js viewCal · viewCalCase · calLeave · calBack)을 새 화면(/next/)으로 옮김
   사장님 2026-10-15(싱가포르) 19:28 「달력 턉 … 10에서 40프로에 종목들을 한눈에 보고 관리하고 판단할수 있는 지혜로운 구조」 · 20:04 「달력에 종목이름 등락률」 ·
   20:51 「추적하는 시스탬 … cia처런 끈질기게」 · 21:24 「가 로 해」(규칙 70) → 2026-10-17 04:04 「첫화면 부터 마지막 페이지 까지 모두 바꿔」 · 04:23 「에이전트 총 동원해」
   셈 · 글 · 금빛 뜻은 옛 쪽 그대로 — 자료 surgetr.json · surgetr-case.json(tr-v1 · 결정표 docs/design/surge-2026-10-15/cal-merge-v3.md)
     첫 화면 = 답(10곳 중 n곳꼴 + 같은 기간 모든 회사 · 점 열 개 두 줄) → 새로 생긴 금빛(! 반 토막 · ? 거래 멈춤) → 칸 고르기 → 날짜별 목록(선택 · 이동 · 탈락 · 다시 선택)
     종목 파일 = 뽑힌 때 → 상태 낱말 · 큰 % → 선(뽑힌 날 종가 = 0 · 60거래일) → 칸 길 → 지나온 일 → 관심 · 관심 없음
   관심 · 관심 없음은 이 기기에만 — 옛 열쇠 그대로(atlas:cal-star · atlas:surge-hide = 급등 탭과 같은 목록) · 셈에는 그대로 들어감
   종목 파일에서 달력으로 돌아오면 칸 고르기 · 펼친 칸 그대로(옛 calLeave · calBack — 자리는 새 화면 길이 기억) · 다른 곳에서 오면 처음 꼴
   모양만 새 아틀란스 말투(큰 제목 → 그림 → 숫자 · 설명 → 접은 칸 · 칩) · 회사 고리는 새 보는 화면 #/w/<번호> · 종목 파일 고리는 #/cal/<번호> 그대로
   보안 규칙: 글은 textContent · 자리는 CSSOM · 그림은 svg(캔버스 · 입체 · 그림자 없음 · 점은 svg 안 — 바둑판 셈 밖 · 규칙 50 · 51) */
import {warn} from '/next/warn.js'; // 노란 경고 글은 두 줄까지 — 길면 「?」 한 줄로 접고 누르면 펼침(사장님 2026-10-18 [10] 10)
const NX = globalThis.NX;
const {h, sv} = NX;

/* ── 숫자 · 말 — 옛 atlas.js 그대로(같은 반올림 · 붙임 띄어쓰기 · 조사) ── */
const NB = '\u00a0';
const r1 = x => Math.sign(x) * Math.floor(Math.abs(x) * 10 + 0.5 + 1e-7) / 10;
function pct(x) { if (x == null || !isFinite(x)) return '?'; const v = r1(x), a = Math.abs(v); return (v > 0 ? '+' : v < 0 ? '−' : '') + (a >= 100 ? Math.floor(a + 0.5 + 1e-7).toLocaleString('ko-KR') : a.toFixed(1)) + '%'; }
const cl = x => (x == null ? 'fl' : r1(x) > 0 ? 'up' : r1(x) < 0 ? 'dn' : 'fl'); // 새 화면 색 이름(up · dn · fl) — 옛 up · down · flat
const pctEl = (x, tag = 'b') => h(tag, {class: 'num ' + cl(x), text: pct(x)});
function md(d) { const p = String(d).split('-'); return (+p[1]) + '월\u00a0' + (+p[2]) + '일'; }
const DOW = ['일', '월', '화', '수', '목', '금', '토'];
const dDow = d => new Date(d + 'T00:00:00Z').getUTCDay();
const mdw = d => { const x = new Date(d + 'T00:00:00Z'); return `${md(d)}(${DOW[x.getUTCDay()]})`; };
function josa(w, a, b) { const ch = String(w).trim().slice(-1), k = ch.charCodeAt(0) - 0xAC00; if (k < 0 || k > 11171) return w + a + '(' + b + ')'; return w + (k % 28 ? a : b); }
const isDay = d => /^\d{4}-\d{2}-\d{2}/.test(String(d ?? ''));
const isTime = t => /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}/.test(String(t ?? ''));
const ampm = t => { if (!isTime(t)) return '?'; const hh = +t.slice(11, 13), mm = t.slice(14, 16); return `${hh < 12 ? '오전' : '오후'}${NB}${hh % 12 || 12}:${mm}`; };
/** 글 속 「·」 — 줄 첫머리가 「·」가 되지 않게 · 「%」 「」」 뒤 토씨는 붙임(옛 tx 그대로) */
const tx = s => String(s).replace(/ · /g, NB + '· ').replace(/([^\s])·(?=[^\s])/g, '$1\u2060·').replace(/([」%])(?=[가-힣])/g, '$1\u2060');
// 바탕 회사 이름 · 고른 법(일반 자료 줄 — 없는 주소 · 못 받음 · 지켜보지 않는 종목에서)
const NP = C => C?.funnel?.picked ?? '?';
const pickName = C => `${C?.rules?.name ?? '고른'} ${NP(C)}곳`;
const lyDay = C => (C?.rules?.lyDay ? md(C.rules.lyDay) : '모음 날');
const pickHow = C => `멍거 갈래는 3년 성적표만, 린치 갈래는 3년 성적표와 ${lyDay(C)} 값으로 골랐습니다`;

/* ── 그림 색 — app.css :root 색 이름(먹빛)에서 읽음 · 못 읽으면 같은 값 ── */
const TOK0 = {up: '#FF5A65', down: '#5B96FF', gold: '#E9B949', ink: '#F2EFE8', night: '#0C0E12', mute: '#8E959F', sub: '#B0B5BD', 'm4-soft': '#1C1F26', 'm4-line': '#272B34', 'm4-neu': '#6F7782'};
function tok() { const s = getComputedStyle(document.documentElement), o = {}; for (const k of Object.keys(TOK0)) o[k] = s.getPropertyValue('--' + k).trim() || TOK0[k]; return o; }
const TSTEP = [0.1, 0.2, 0.5, 1, 2, 5, 10, 20, 25, 50, 100, 200, 500, 1000, 2000, 5000, 1e4, 2e4, 5e4, 1e5, 2e5, 5e5, 1e6];
function niceTicks(lo, hi, max = 4) { let s = TSTEP.at(-1); for (const x of TSTEP) if ((hi - lo) / x <= max) { s = x; break; } const t = []; for (let a = Math.ceil(lo / s - 1e-9) * s; a <= hi + 1e-9; a += s) t.push(Math.round(a * 1000) / 1000); return t; }
const remPx = () => parseFloat(getComputedStyle(document.documentElement).fontSize) || 21;
const AXR = () => Math.round(remPx() * 3.05); // 오른쪽 눈금 칸 넓이(옛 그림과 같음)
const top = (el, y) => { el.style.setProperty('top', y.toFixed(1) + 'px'); return el; }; // 자리는 CSSOM(보안 규칙)
/** 눈금 — 글은 그림 오른쪽 칸 · 가는 가로선 · 기준선은 점선 · 겹치는 글(24px 안)은 하나만(옛 gutterAxis 그대로) */
function gutterAxis(svg, wrap, {ticks, Y, x0, x1, base, fmt}) {
  const T = tok(), lab = h('div', {class: 'pcal-yr', 'aria-hidden': 'true'}), seen = new Set();
  const one = (t, b) => { const y = Y(t); svg.append(sv('line', {x1: x0, x2: x1 + 6, y1: y.toFixed(1), y2: y.toFixed(1), stroke: b ? T.mute : T['m4-soft'], 'stroke-width': 1, 'stroke-dasharray': b ? '2 4' : null}));
    const key = Math.round(y); if ([...seen].some(k => Math.abs(k - key) < 24)) return; seen.add(key); lab.append(top(h('span', {class: 'num', text: fmt(t)}), y)); };
  if (base != null) one(base, true);
  for (const t of ticks) if (base == null || Math.abs(t - base) > 1e-9) one(t, false);
  wrap.append(lab);
}
function areaPath(arr, X, Y, by) { let d = '', seg = []; const flush = () => { if (seg.length) d += 'M' + X(seg[0]).toFixed(1) + ' ' + by.toFixed(1) + seg.map(i => 'L' + X(i).toFixed(1) + ' ' + Y(arr[i]).toFixed(1)).join('') + 'L' + X(seg[seg.length - 1]).toFixed(1) + ' ' + by.toFixed(1) + 'Z'; seg = []; }; arr.forEach((y, i) => { if (y == null) flush(); else seg.push(i); }); flush(); return d; }
function fadeDefs(defs, id, T, P, H, by) { // 기준선 위 빨강 · 아래 파랑 옅은 면(판판한 번짐 — 입체 아님)
  const gu = sv('linearGradient', {id: id + 'gu', gradientUnits: 'userSpaceOnUse', x1: 0, y1: P, x2: 0, y2: by}); gu.append(sv('stop', {offset: 0, 'stop-color': T.up, 'stop-opacity': 0.14}), sv('stop', {offset: 1, 'stop-color': T.up, 'stop-opacity': 0}));
  const gd = sv('linearGradient', {id: id + 'gd', gradientUnits: 'userSpaceOnUse', x1: 0, y1: by, x2: 0, y2: H - P}); gd.append(sv('stop', {offset: 0, 'stop-color': T.down, 'stop-opacity': 0}), sv('stop', {offset: 1, 'stop-color': T.down, 'stop-opacity': 0.14}));
  defs.append(gu, gd);
}

/* ── 자료 — 옛 needTr · needTrCase 와 같은 문(못 받으면 「?」 · NX.getJson 이 15초 뒤 다시 받아 봄) ── */
const trOk = T => !!(T && T.version === 'tr-v1' && isDay(T.asOf) && Array.isArray(T.days) && Array.isArray(T.cases) && Array.isArray(T.dates) && T.days.every(x => isDay(x.d)));
async function getTr() { const x = await NX.getJson('surgetr.json'); return trOk(x) ? x : null; }
async function getTrc() { const x = await NX.getJson('surgetr-case.json'); return x && x.cases && typeof x.cases === 'object' ? x.cases : null; }
const SV_NAME = {b10: '10%\u2060대', b20: '20%\u2060대', b30: '30%\u2060대', b40: '40%\u00a0이상'}; // 급등 칸 이름(옛 그대로 — 40% 칸 = 1.40 이상 · 붙임표)
const TR_B = {'1': SV_NAME.b10, '2': SV_NAME.b20, '3': SV_NAME.b30, '4': SV_NAME.b40};
const TR_F = [['all', '전체'], ['1', '10%'], ['2', '20%'], ['3', '30%'], ['4', '40%']];
const trRow = r => ({c: r[0], n: r[1], d0: r[2], b: r[3], r5: r[4], v: r[5], st: r[6], h: r[7], f: r[8], x: r[9], re: r[10], kst: r[11]});
const trTo = b => josa(TR_B[b] ?? '?', '으로', '로'); // 「20%대로」 · 「40% 이상으로」
const trFlag = r => (r.h ? '? 거래 멈춤' : r.f === 2 ? '? 반 토막' : r.f === 1 ? '! 반 토막' : null);
const CAL_WORD = {u: '올라 있음', d: '내려 있음', z: '제자리', q: '? 값 없음', n: '새로 뽑힘'};

/* ── 관심(★) · 관심 없음 — 이 기기에만(옛 열쇠 그대로) · 기억 못 하는 기계(사생활 창 등)는 이 창 동안만 ── */
const TR_STAR = 'atlas:cal-star', SV_HIDE = 'atlas:surge-hide';
let starMem = new Set(), hideMem = new Set();
const codeSet = (k, mem) => { try { const x = JSON.parse(localStorage.getItem(k) || '[]'); return new Set(Array.isArray(x) ? x.filter(c => typeof c === 'string' && /^[0-9A-Z]{6}$/.test(c)).slice(0, 5000) : []); } catch { return new Set(mem); } };
const starGet = () => codeSet(TR_STAR, starMem), hideGet = () => codeSet(SV_HIDE, hideMem);
function starPut(s) { starMem = new Set(s); try { localStorage.setItem(TR_STAR, JSON.stringify([...s].sort())); return true; } catch { return false; } }
function hidePut(s) { hideMem = new Set(s); try { localStorage.setItem(SV_HIDE, JSON.stringify([...s].sort())); return true; } catch { return false; } }

/* ── 앞 화면 기억(옛 calLeave · calBack) — 종목 파일(#/cal/…)에서 돌아올 때만 칸 고르기 · 펼친 칸을 그대로 ──
   새 화면 길(app.js)이 hashchange 를 먼저 받으므로, 이 쪽은 마지막으로 본 주소와 그 앞 주소를 따로 적어 「어디서 왔나」를 셈 */
let trF = 'all', openK = new Set(), overview = null;
const hashOf = u => { try { return new URL(u).hash || '#/'; } catch { return ''; } };
let known = location.hash || '#/', knownFrom = '';
addEventListener('hashchange', e => {
  const fr = hashOf(e.oldURL), to = hashOf(e.newURL);
  if (fr === '#/cal' && overview) openK = new Set([...overview.querySelectorAll('details[data-k]')].filter(d => d.open).map(d => d.dataset.k)); // 달력을 떠날 때 펼친 칸(떨어진 칸도 open 값은 그대로)
  knownFrom = fr; known = to;
});
const fromNow = () => { const cur = location.hash || '#/'; return known === cur ? knownFrom : known; };

/* ── 공통 조각 ── */
/** 자료 줄 — src = 달력만의 줄(없으면 바탕 회사 줄) · 장 중 받은 값이면 「?」 · 끝은 새 화면 안전 문장(옛 「상담사가 아닙니다 …」 줄 자리 — 쓰지 않을 말을 빼고 같은 뜻) */
function foot(C, src = null) {
  const f = h('footer', {class: 'pcal-foot'});
  if (C) {
    const price = C.sources?.price ?? '?';
    f.append(h('p', {text: src ? `자료: ${price} · ${src}.` : `자료: ${price} · 기준일 = 마지막 종가 날(${md(C.asOf)})의 ${C.days}거래일 전(${md(C.base)}) · ${pickName(C)} — ${pickHow(C)}(그 뒤 주가는 안 씀).`}));
    if (C.provisional) f.append(h('p', {class: 'q', text: `? ${md(C.asOf)} 값은 그날 저녁 8시 전에 받아 아직 바뀔 수 있습니다(시간외 · 넥스트레이드) — 다음 받기에서 고쳐집니다.`}));
  } else f.append(h('p', {class: 'q', text: '? 자료 줄을 받지 못했어요.'}));
  f.append(h('p', {class: 'pcal-safe', text: '꼴똘이는 지난 기록만 보여 줘요. 사고팔기를 권하지 않아요.'}));
  return f;
}
const hon = () => [h('p', {class: 'pcal-hon', text: '사고팔 곳을 고른 목록이 아니에요.'}), h('p', {class: 'pcal-small', text: '지난 값일 뿐 앞날을 말하지 않아요.'})];
/** 접은 칸 — k 가 있으면 돌아올 때 펼침을 기억(옛 data-k) */
function det(cls, k, sum, ...body) {
  const d = h('details', {class: 'pcal-more ' + cls, 'data-k': k || null}, h('summary', {text: sum}), ...body);
  if (k && openK.has(k)) d.open = true;
  return d;
}

/* ── 달력 첫 화면 ── */
function trTime(T) {
  if (!T.provisional) return `${md(T.asOf)} 종가예요.`;
  return `${md(T.asOf)} ${isTime(T.kst) && T.kst.slice(0, 10) === T.asOf ? ampm(T.kst) + ' ' : ''}값이에요. 장 중이라 바뀌어요.`;
}
/** 점 열 개 — 빨간 점 = 올라 있는 몫(10곳으로 줄여 셈) · 빈 점은 회색으로 칠함(누르는 단추로 보이지 않게) · svg 안(바둑판 셈 밖) */
function trDots(n10, label) {
  const R = 9, G = 8, W = 10 * (2 * R) + 9 * G, T = tok();
  const s = sv('svg', {viewBox: `0 0 ${W} ${2 * R + 4}`, width: W, height: 2 * R + 4, role: 'img', 'aria-label': `${label} 10곳 중 ${n10}곳`, class: 'pcal-dots'});
  for (let i = 0; i < 10; i++) s.append(sv('circle', {cx: R + 2 + i * (2 * R + G) - 2, cy: R + 2, r: R - 1, fill: i < n10 ? T.up : T['m4-neu'], 'fill-opacity': i < n10 ? 1 : 0.55}));
  return s;
}
/** 답 한 줄 — 「뽑힌 날보다 올라 있는 곳」 지켜보는 곳 · 같은 기간 모든 회사(같은 단위 · 10곳 중 n곳꼴) — 이 화면의 그림 */
function trAnswer(T, R) {
  const box = h('section', {class: 'pcal-ans', 'aria-label': '지켜보는 곳 지금'});
  if (!T.N) { box.append(...[h('p', {class: 'pcal-big', text: T.k ? `${md(T.asOf)}에 처음 ${T.k}곳이 뽑혔어요.` : '아직 지켜보는 곳이 없어요.'}), T.k ? h('p', {class: 'pcal-small', text: '등락률은 다음 장날부터 쌓여요.'}) : null].filter(Boolean)); return box; } // 옛 쪽은 지켜보는 곳 · 처음 뽑힌 곳이 모두 없을 때 글 「null」이 붙었음(DOM append) — 새 쪽은 걸러 냄
  const z = R.filter(r => r.st === 'z').length, q = R.filter(r => r.st === 'q').length;
  box.append(h('p', {class: 'pcal-cap', text: '뽑힌 날보다 올라 있는 곳'}), h('div', {class: 'pcal-cmp'},
    h('p', {class: 'pcal-cl'}, h('span', {text: `지켜보는 ${T.N}곳`}), h('b', {class: 'num', text: `10곳 중 ${T.n10}곳꼴`})), trDots(T.n10, '지켜보는 곳'),
    T.m10 != null ? h('p', {class: 'pcal-cl'}, h('span', {text: '같은 기간 모든 회사'}), h('b', {class: 'num', text: `10곳 중 ${T.m10}곳꼴`})) : null,
    T.m10 != null ? trDots(T.m10, '같은 기간 모든 회사') : null));
  box.setAttribute('aria-label', `지켜보는 곳 ${T.N}곳 가운데 뽑힌 날보다 위 ${T.a}곳 · 아래 ${T.b}곳${z ? ` · 그대로 ${z}곳` : ''}`);
  if (q) box.append(h('p', {class: 'q pcal-qn', text: `? 값이 없는 곳 ${q}곳`}));
  return box;
}
/** 줄 하나 — 이름 | 뽑힌 날부터 %(빨강 · 파랑) · 둘째 줄은 「! 반 토막」 「? 거래 멈춤」만(금빛) · 새로 뽑힌 곳 = 뽑힌 까닭(5일 오름 · 회색) */
function trRowEl(r, star) {
  const right = r.st === 'n' ? h('span', {class: 'pcal-nw num', text: `5일간 ${pct(r.r5)}`}) : r.v == null ? h('b', {class: 'num q', text: '?'}) : pctEl(r.v);
  const fl = trFlag(r);
  return h('a', {class: 'pcal-row', href: '#/cal/' + r.c, 'data-c': r.c}, h('span', {class: 'nm', 'data-proper': '1'}, star.has(r.c) ? h('span', {class: 'pcal-st', text: '★ '}) : null, r.n), right, fl ? h('span', {class: 'pcal-fl', text: fl}) : null);
}
/** 날 하나 — 달력 날 판(달 · 날 · 요일) + 「선택 k · 이동 m · 탈락 x」 + 그날 뽑힌 줄 넷 + 「나머지 n곳 보기」 + 「이날 이동 · 탈락 보기」 */
function trDay(x, byC, vis, star, reNote = false) {
  const ok = c => { const r = byC.get(c); return r && vis(r); };
  const sel = x.sel.filter(ok).map(c => byC.get(c)), mv = x.mv.filter(e => ok(e[0])), out = x.out.filter(ok), re = x.re.filter(e => ok(e[0]));
  const dd = +x.d.slice(8, 10), dw = DOW[dDow(x.d)];
  const cnt = [`이동${NB}${mv.length}`, `탈락${NB}${out.length}`, re.length ? `다시${NB}선택${NB}${re.length}` : null].filter(Boolean).join(' · ');
  const sec = h('section', {class: 'pcal-day' + (x.seed ? ' re' : ''), 'data-d': x.d},
    h('div', {class: 'pcal-dh'}, h('h2', {class: 'pcal-tile', 'aria-label': `${mdw(x.d)}${x.seed ? ' 되짚음' : ''}`}, h('span', {class: 'm', text: `${+x.d.slice(5, 7)}월`}), h('b', {class: 'pcal-dd num', text: String(dd)}), h('span', {class: 'w', text: dw})),
      h('div', {class: 'pcal-dhx'}, h('p', {class: 'pcal-ds'}, h('b', {text: `선택 ${sel.length}`}), x.seed ? h('span', {class: 'pcal-re', text: ' · 되짚음'}) : null), h('p', {class: 'pcal-dc', text: tx(cnt)}))));
  const rows = h('div', {class: 'pcal-rows'});
  if (!sel.length) rows.append(h('p', {class: 'pcal-none', text: '이날 새로 뽑힌 곳은 없어요.'}));
  const K = sel.length && sel.every(r => r.st === 'n') ? 2 : 4; // 새로 뽑혀 아직 등락이 없는 날은 두 줄만 펼침 — 그 앞 날의 빨강 · 파랑이 첫 화면에 들게(옛 3초 시험)
  sel.slice(0, K).forEach(r => rows.append(trRowEl(r, star)));
  sec.append(rows);
  if (reNote) sec.append(h('p', {class: 'pcal-ren', text: '되짚음 = 업데이트 기록이 없던 날이라 그날 종가로 다시 센 날이에요.'}));
  if (sel.length > K) sec.append(det('pcal-rest', 'rest-' + x.d, `나머지 ${sel.length - K}곳 보기`, h('div', {class: 'pcal-in pcal-rows'}, ...sel.slice(K).map(r => trRowEl(r, star)))));
  const items = [...mv.map(([c, b]) => [c, `${trTo(b)} 이동`, 0]), ...out.map(c => [c, '탈락', 1]), ...re.map(([c, b]) => [c, `다시 선택 · ${TR_B[b] ?? '?'}`, 2])]
    .sort((a, b) => a[2] - b[2] || byC.get(a[0]).n.localeCompare(byC.get(b[0]).n, 'ko') || (a[0] < b[0] ? -1 : 1));
  if (items.length) sec.append(det('pcal-ev', 'ev-' + x.d, tx(`${re.length ? '이동 · 탈락 · 다시 선택' : '이동 · 탈락'} ${items.length}곳 보기`),
    h('div', {class: 'pcal-in'}, ...items.map(([c, t]) => { const r = byC.get(c); return h('a', {class: 'pcal-erow', href: '#/cal/' + c}, h('span', {class: 'nm', 'data-proper': '1', text: r.n}), h('span', {class: 'pcal-et', text: tx(t)}), r.st === 'n' ? h('span', {class: 'pcal-nw num', text: `5일간 ${pct(r.r5)}`}) : r.v == null ? h('b', {class: 'num q', text: '?'}) : pctEl(r.v)); }))));
  return sec;
}
async function vCal() {
  if (!/^#\/cal\//.test(fromNow())) { trF = 'all'; openK = new Set(); } // 다른 곳에서 오면 처음 꼴
  const [T, C] = await Promise.all([getTr(), NX.need('core')]);
  const v = h('div', {class: 'pcal'}, h('h1', {class: 'pcal-h1', text: '달력'}));
  if (!T) { v.append(h('p', {class: 'q pcal-qline', text: '? 달력 자료를 못 받았어요. 잠시 뒤 다시 열어 주세요.'}), foot(C)); return {title: '달력', nodes: [v]}; }
  overview = v;
  const R = T.cases.map(trRow), byC = new Map(R.map(r => [r.c, r]));
  v.append(h('p', {class: 'pcal-lead', text: tx(`5일간 10% 넘게 오르면 뽑혀요. ${trTime(T)}`)})); // 무엇을 왜 뽑았나 — 첫 줄(옛 3초 시험)
  v.append(trAnswer(T, R));
  const AL = (T.alerts ?? []).filter(A => A.n > 0); // 새로 생긴 일만(마지막 장날 종가로) — 금빛 한 줄 · 누르면 그 종목들(종목 파일)
  if (AL.length) {
    const lab = AL.map(A => (A.kind === 'halt' ? `? 거래 멈춤 ${A.n}곳` : `${A.f === 2 ? '?' : '!'} 반 토막 ${A.n}곳`)).join(' · ');
    const items = AL.flatMap(A => (A.cs ?? (A.top?.c ? [A.top.c] : [])).map(c => [c, A.kind])).filter(([c]) => byC.has(c));
    v.append(det('pcal-al', 'alerts', tx(lab), h('div', {class: 'pcal-in'}, h('p', {class: 'pcal-small', text: '마지막 장날 종가로 새로 생긴 일이에요.'}),
      ...items.map(([c, k]) => { const r = byC.get(c); return h('a', {class: 'pcal-erow', href: '#/cal/' + c}, h('span', {class: 'nm', 'data-proper': '1', text: r.n}), h('span', {class: 'pcal-et q', text: k === 'halt' ? '? 거래 멈춤' : r.f === 2 ? '? 반 토막' : '! 반 토막'}), r.v == null ? h('b', {class: 'num q', text: '?'}) : pctEl(r.v)); }))));
  }
  const chips = h('div', {class: 'pcal-chips', role: 'group', 'aria-label': '뽑힌 칸 고르기'}, ...TR_F.map(([k, t]) => h('button', {type: 'button', class: 'pcal-chip', 'data-f': k, 'aria-pressed': String(trF === k), text: t})));
  const list = h('div', {class: 'pcal-list'}), live = h('p', {class: 'pcal-sr', role: 'status', 'aria-live': 'polite'});
  v.append(chips, list, live);
  let first = true;
  const draw = () => {
    const hid = hideGet(), star = starGet(), vis = r => !hid.has(r.c) && (trF === 'all' || r.b === trF);
    if (!first) for (const k of [...openK]) if (k !== 'alerts') openK.delete(k); // 칸을 다시 그리면 목록의 접은 칸은 처음 꼴(옛 쪽과 같음)
    first = false;
    list.textContent = '';
    const stars = R.filter(r => star.has(r.c) && vis(r));
    if (stars.length) list.append(h('section', {class: 'pcal-day pcal-stars'}, h('h2', {class: 'pcal-sh', text: `★ 관심 ${stars.length}곳`}), h('div', {class: 'pcal-rows'}, ...stars.map(r => trRowEl(r, star)))));
    const re1 = T.days.find(x => x.seed)?.d; // 「되짚음」 풀이는 처음 나오는 되짚은 날 한 곳에만
    for (const x of T.days.slice(0, 5)) list.append(trDay(x, byC, vis, star, x.d === re1)); // 새 다섯 날은 펼쳐 둠 · 그 앞은 다섯 날씩 접은 칸(줄은 처음부터 있음)
    const older = T.days.slice(5);
    for (let i = 0; i < older.length; i += 5) { const ch = older.slice(i, i + 5); list.append(det('pcal-older', 'older-' + ch[0].d, tx(`${md(ch.at(-1).d)} ~ ${md(ch[0].d)} 보기`), h('div', {class: 'pcal-in'}, ...ch.map(x => trDay(x, byC, vis, star, x.d === re1))))); }
    list.append(h('p', {class: 'pcal-small pcal-since', text: tx(`${md(T.days.at(-1)?.d ?? T.asOf)}부터 적었어요.`)}));
    const gone = R.filter(r => hid.has(r.c)).sort((a, b) => a.n.localeCompare(b.n, 'ko'));
    if (gone.length) list.append(det('pcal-gone', null, `숨긴 곳 ${gone.length}곳 보기`,
      h('div', {class: 'pcal-in'}, ...gone.map(r => h('p', {class: 'pcal-grow'}, h('a', {class: 'pcal-link', href: '#/cal/' + r.c, 'data-proper': '1', text: r.n}), h('button', {type: 'button', class: 'pcal-show', 'data-c': r.c, text: '되돌리기'}))))));
  };
  chips.addEventListener('click', e => { const b = e.target.closest('button[data-f]'); if (!b) return; trF = b.dataset.f; for (const x of chips.children) x.setAttribute('aria-pressed', String(x.dataset.f === trF)); draw(); live.textContent = trF === 'all' ? '모든 칸을 보여요.' : `${TR_B[trF]}로 뽑힌 곳만 보여요.`; });
  list.addEventListener('click', e => { const b = e.target.closest('button.pcal-show'); if (!b) return; const hid = hideGet(); hid.delete(b.dataset.c); hidePut(hid); draw(); live.textContent = `${byC.get(b.dataset.c)?.n ?? ''} 다시 보여요.`; });
  draw();
  v.append(det('pcal-how', null, '어떻게 골랐나요?', h('div', {class: 'pcal-in'}, ...[
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
  v.append(...hon(), foot(C, `달력은 네 칸 기록과 일봉으로 ${md(T.asOf)}까지 셌어요`));
  return {title: '달력', nodes: [v]};
}

/* ── 종목 파일 그림 ① — 뽑힌 날 종가 = 0 · 날마다 % · 거래가 없던 날은 빈 점 · 마지막 값 점(옛 trLine 그대로 · 넓이는 화면에 붙은 뒤 잼) ── */
let lcN = 0;
function trLine(host, P, dates, z, name, width) {
  host.textContent = '';
  const wrap = h('div', {class: 'pcal-lc'}); host.append(wrap);
  const vals = P.filter(x => x != null);
  if (vals.length < 2) { wrap.append(h('p', {class: 'pcal-small', text: '선은 다음 장날부터 그려요.'})); return; }
  const n = P.length, W = Math.max(260, Math.round(width || 320)), H = 200, PT = 12, PB = 10, padR = AXR();
  let lo = Math.min(0, ...vals), hi = Math.max(0, ...vals); const pad = (hi - lo) * 0.08 || 2; lo -= pad; hi += pad;
  const X = i => 4 + i * (W - 4 - padR) / Math.max(1, n - 1), Y = y => PT + (hi - y) * (H - PT - PB) / (hi - lo), T = tok(), id = 'pcal' + (++lcN);
  const svg = sv('svg', {viewBox: `0 0 ${W} ${H}`, width: W, height: H, role: 'img', 'aria-label': `${name} — 뽑힌 날 종가부터 날마다: ` + P.map((x, i) => `${md(dates[i])} ${pct(x)}`).join(', ')});
  const defs = sv('defs'), cu = sv('clipPath', {id: id + 'u'}), cd = sv('clipPath', {id: id + 'd'});
  cu.append(sv('rect', {x: 0, y: 0, width: W, height: Y(0)})); cd.append(sv('rect', {x: 0, y: Y(0), width: W, height: H - Y(0)}));
  defs.append(cu, cd); fadeDefs(defs, id, T, PT, H, Y(0)); svg.append(defs);
  gutterAxis(svg, wrap, {ticks: niceTicks(lo, hi), Y, x0: 4, x1: W - padR, base: 0, fmt: t => (t > 0 ? '+' : t < 0 ? '−' : '') + Math.abs(t) + '%'});
  const ad = areaPath(P, X, Y, Y(0));
  svg.append(sv('path', {d: ad, fill: `url(#${id}gu)`, 'clip-path': `url(#${id}u)`}), sv('path', {d: ad, fill: `url(#${id}gd)`, 'clip-path': `url(#${id}d)`}));
  let d = '', on = false; P.forEach((y, i) => { if (y == null) { on = false; return; } d += (on ? 'L' : 'M') + X(i).toFixed(1) + ' ' + Y(y).toFixed(1); on = true; });
  for (const [c, k] of [[T.up, 'u'], [T.down, 'd']]) svg.append(sv('path', {d, fill: 'none', stroke: c, 'stroke-width': 2, 'stroke-linejoin': 'round', 'stroke-linecap': 'round', 'clip-path': `url(#${id}${k})`}));
  for (const i of z) if (P[i] != null) svg.append(sv('circle', {cx: X(i), cy: Y(P[i]), r: 4.5, fill: T.night, stroke: T.ink, 'stroke-width': 1.5})); // 거래가 없던 날 = 빈 점
  const lk = P.map((x, i) => (x == null ? -1 : i)).filter(i => i >= 0).pop();
  svg.append(sv('circle', {cx: X(lk), cy: Y(P[lk]), r: 4.5, fill: P[lk] > 0 ? T.up : P[lk] < 0 ? T.down : T.mute, stroke: T.night, 'stroke-width': 2}));
  wrap.prepend(svg);
  wrap.append(h('div', {class: 'pcal-ax'}, h('span', {text: md(dates[0]) + ' = 0'}), h('span', {text: md(dates[n - 1])})));
}
/* ── 종목 파일 그림 ② — 칸 길(그 회사 제 5일 오름이 든 칸 · 끝난 날마다) · 다섯 줄(40% · 30% · 20% · 10% · 밖) · 계단 선 · 선택 ● · 다시 선택 ◉ · 탈락 ○ ── */
function trLane(host, q, n, ev, dates, width) {
  host.textContent = '';
  if (!q.length) { host.append(h('p', {class: 'pcal-small', text: '칸 길은 장이 끝난 날부터 그려요.'})); return; }
  const wrap = h('div', {class: 'pcal-lc pcal-lane'}); host.append(wrap);
  const W = Math.max(260, Math.round(width || 320)), LH = 34, PT = 14, H = PT + LH * 4 + 16, padR = AXR(), T = tok();
  const X = i => 4 + i * (W - 4 - padR) / Math.max(1, n - 1), lane = c => ({'4': 0, '3': 1, '2': 2, '1': 3, x: 4}[c]), Y = k => PT + k * LH;
  const svg = sv('svg', {viewBox: `0 0 ${W} ${H}`, width: W, height: H, role: 'img', 'aria-label': '칸 길 — ' + [...q].map((c, i) => `${md(dates[i])} ${c === '?' ? '?' : c === 'x' ? '밖' : TR_B[c]}`).join(', ')});
  const lab = h('div', {class: 'pcal-yr', 'aria-hidden': 'true'});
  ['40%', '30%', '20%', '10%', '밖'].forEach((t, k) => { svg.append(sv('line', {x1: 4, x2: W - padR + 6, y1: Y(k), y2: Y(k), stroke: k === 4 ? T.mute : T['m4-soft'], 'stroke-width': 1, 'stroke-dasharray': k === 4 ? '2 4' : null})); lab.append(top(h('span', {class: 'num', text: t}), Y(k))); });
  wrap.append(lab);
  let d = '', last = null;
  [...q].forEach((c, i) => { if (c === '?') { last = null; return; } const y = Y(lane(c)); d += last == null ? `M${X(i).toFixed(1)} ${y}` : `H${X(i).toFixed(1)}V${y}`; last = y; });
  svg.append(sv('path', {d, fill: 'none', stroke: T.ink, 'stroke-width': 2, 'stroke-linejoin': 'round'}));
  const at = dd => dates.indexOf(dd);
  if (q[0] !== '?') svg.append(sv('circle', {cx: X(0), cy: Y(lane(q[0])), r: 6, fill: T.ink, stroke: T.night, 'stroke-width': 2})); // 선택
  for (const e of ev) { const i = at(e[0]); if (i < 0 || q[i] == null || q[i] === '?') continue;
    if (e[1] === 'out' && i > 0) svg.append(sv('circle', {cx: X(i), cy: Y(4), r: 6, fill: T.night, stroke: T.ink, 'stroke-width': 2})); // 탈락
    if (e[1] === 're') svg.append(sv('circle', {cx: X(i), cy: Y(lane(q[i])), r: 7, fill: 'none', stroke: T.ink, 'stroke-width': 2}), sv('circle', {cx: X(i), cy: Y(lane(q[i])), r: 3, fill: T.ink})); } // 다시 선택
  wrap.prepend(svg);
}
/** 그림은 화면에 붙어 넓이가 정해진 뒤 그 넓이로 다시 그림(옛 쪽은 그릴 때 잼 · 새 화면은 다 그린 뒤 붙임) · 돌려 세운 폰 · 창 넓이가 바뀌어도 */
function sized(host, draw) {
  draw(0);
  if (!('ResizeObserver' in globalThis)) return;
  let lastW = 0;
  const ro = new ResizeObserver(() => { if (!host.isConnected) { ro.disconnect(); return; } const w = Math.round(host.getBoundingClientRect().width); if (w && w !== lastW) { lastW = w; draw(w); } });
  ro.observe(host);
}

/* ── 종목 파일 #/cal/<번호> — 택배 조회처럼(상태 낱말 · 큰 % · 선 · 칸 길 · 단계) ── */
async function vCase(code) {
  const [T, KC, C] = await Promise.all([getTr(), getTrc(), NX.need('core')]);
  const v = h('div', {class: 'pcal pcal-case'}, h('p', {class: 'pcal-backp'}, h('a', {class: 'pcal-back', href: '#/cal', text: '‹ 달력'})));
  if (!T || !KC) { v.append(h('h1', {class: 'pcal-h1', text: '종목 파일'}), h('p', {class: 'q pcal-qline', text: '? 종목 파일을 못 받았어요. 잠시 뒤 다시 열어 주세요.'}), foot(C)); return {title: '종목 파일', nodes: [v]}; }
  const r0 = T.cases.find(x => x[0] === code), K = KC[code];
  if (!r0 || !K) {
    const M = await NX.need('mkt'), nm = M?.companies?.[code]?.n ?? code;
    v.append(h('h1', {class: 'pcal-h1', 'data-proper': '1', text: nm}), h('p', {class: 'pcal-note', text: '이 종목은 지금 달력에서 지켜보는 곳이 아니에요. 뽑힌 뒤 60거래일이 지나면 목록에서 내려요.'}),
      h('p', {class: 'pcal-acts'}, h('a', {class: 'pcal-btn', href: '#/w/' + code, text: '회사 보기 ›'})), foot(C));
    return {title: nm, nodes: [v]};
  }
  const r = trRow(r0), i0 = T.dates.indexOf(r.d0), dates = T.dates.slice(i0, i0 + K.p.length);
  v.append(h('h1', {class: 'pcal-h1', 'data-proper': '1', text: r.n})); // 회사 이름(고유 이름 — 쓰지 않을 말 셈 밖)
  v.append(h('p', {class: 'pcal-lead', text: tx(`${mdw(r.d0)}에 ${trTo(r.b)} 뽑혔어요. 그때 5일간 ${pct(r.r5)}${r.re ? ' · 되짚음(그날 종가로 다시 셈)' : ''}`)}));
  // 그림을 위로(새 화면 말투 — 제목 → 그림 → 숫자 · 설명): 뽑힌 날 종가 = 0 선 → 지금 상태 · 큰 % → 금빛 · 견줌 → 칸 길 → 지나온 일
  const g1 = h('div', {class: 'pcal-g'}), g2 = h('div', {class: 'pcal-g'});
  v.append(...[h('h2', {class: 'pcal-h2 pcal-h2top', text: '뽑힌 날부터 날마다'}), g1, K.z.length ? h('p', {class: 'pcal-lkey'}, h('span', {text: '빈 점 = 거래가 없던 날'})) : null].filter(Boolean)); // DOM append 는 null 을 글 「null」로 붙임 — 걸러 냄
  const now = h('div', {class: 'pcal-now'}, h('p', {class: 'pcal-w ' + (r.st === 'u' ? 'up' : r.st === 'd' ? 'dn' : r.st === 'q' ? 'q' : 'zero'), text: CAL_WORD[r.st] ?? '?'}));
  if (r.st === 'n') now.append(h('p', {class: 'pcal-small', text: '등락률은 다음 장날부터 쌓여요.'}));
  else now.append(h('p', {class: 'pcal-p'}, h('span', {text: '뽑힌 날부터 '}), r.v == null ? h('b', {class: 'num q', text: '?'}) : pctEl(r.v)));
  v.append(now);
  if (r.h) v.append(warn('? 거래 멈춤 — 마지막 장날에 거래가 없었어요. 거래정지일 수 있어요.', {cls: 'pcal-qline'}));
  if (r.f) v.append(warn(r.f === 2 ? '? 반 토막 — 뽑힌 뒤 가장 높던 종가의 반 밑이에요. 하루 35% 넘게 바뀐 날이 있어 값이 고쳐졌을 수 있어요.' : '! 반 토막 — 뽑힌 뒤 가장 높던 종가의 반 밑이에요.', {cls: 'pcal-qline'}));
  if (K.mk != null) v.append(h('p', {class: 'pcal-mk', text: tx(`같은 기간 모든 회사의 가운데 값은 ${pct(K.mk)}였어요.`)}));
  if (T.provisional && r.st !== 'n') v.append(h('p', {class: 'pcal-small pcal-prov', text: tx(`${md(T.asOf)} 값은 장 중 값이에요. 저녁 8시까지 바뀌어요.`)}));
  v.append(h('h2', {class: 'pcal-h2', text: '그 회사 5일 오름이 든 칸'}), g2,
    h('p', {class: 'pcal-lkey'}, h('span', {text: '● 선택'}), h('span', {text: '○ 탈락'}), h('span', {text: '◉ 다시 선택'})));
  sized(g1, w => trLine(g1, K.p, dates, K.z, r.n, w));
  sized(g2, w => trLane(g2, K.q, K.p.length, K.ev, dates, w));
  // 지나온 일(택배 조회처럼 — 새 것이 위 · 넷 + 「더 보기」)
  const at = d => { const i = dates.indexOf(d); return i >= 0 ? K.p[i] : null; };
  const S = [{d: r.d0, t: `선택 · ${TR_B[r.b] ?? '?'}`, s: `5일간 ${pct(r.r5)}${r.re ? ' · 되짚음' : ''}`}];
  for (const e of K.ev) S.push({d: e[0], t: e[1] === 'mv' ? `${trTo(e[2])} 이동` : e[1] === 'out' ? '탈락 · 10% 밑이거나 거래가 적어짐' : e[1] === 're' ? `다시 선택 · ${TR_B[e[2]] ?? '?'}` : '조심 · 투자경고 오름 기준에 닿음', s: e[1] === 'warn' ? '? 실제로 지정됐는지는 몰라요' : `뽑힌 날부터 ${pct(at(e[0]))}`, g: e[1] === 'warn'});
  if (r.st !== 'n') S.push({d: T.asOf, t: `지금 ${pct(r.v)}`, s: CAL_WORD[r.st] ?? '', now: true});
  const ol = h('ol', {class: 'pcal-steps'}), lis = S.slice().reverse().map(s => h('li', {class: [s.now ? 'now' : '', s.g ? 'g' : ''].filter(Boolean).join(' ') || null}, h('span', {class: 'd', text: md(s.d)}), h('b', {text: tx(s.t)}), s.s ? h('span', {class: 's' + (/^\?/.test(s.s) ? ' q' : ''), text: tx(s.s)}) : null));
  lis.slice(0, 4).forEach(x => ol.append(x));
  v.append(h('h2', {class: 'pcal-h2', text: '지나온 일'}), ol);
  if (lis.length > 4) { const mb = h('button', {type: 'button', class: 'pcal-btn pcal-more-steps', text: `더 보기 ${lis.length - 4}개`}); mb.addEventListener('click', () => { lis.slice(4).forEach(x => ol.append(x)); mb.remove(); }); v.append(mb); }
  // 관리 — 관심(★ 달력 맨 위) · 관심 없음(달력에서 숨김 · 셈은 그대로) · 이 기계에만
  const live = h('p', {class: 'pcal-sr', role: 'status', 'aria-live': 'polite'});
  const sb = h('button', {type: 'button', class: 'pcal-btn pcal-star'}), hb = h('button', {type: 'button', class: 'pcal-btn pcal-hide'});
  const paint = () => { const s = starGet().has(code), x = hideGet().has(code); sb.setAttribute('aria-pressed', String(s)); sb.textContent = s ? '★ 관심 풀기' : '☆ 관심'; hb.setAttribute('aria-pressed', String(x)); hb.textContent = x ? '숨김 풀기' : '관심 없음'; };
  sb.addEventListener('click', () => { const s = starGet(), on = !s.has(code); if (on) s.add(code); else s.delete(code); const kept = starPut(s); paint(); live.textContent = (on ? `${r.n} 관심에 넣었어요. 달력 맨 위에 보여요.` : `${r.n} 관심에서 뺐어요.`) + (kept ? '' : ' 이 기계는 기억을 못 해 다시 열면 돌아와요.'); });
  hb.addEventListener('click', () => { const x = hideGet(), on = !x.has(code); if (on) x.add(code); else x.delete(code); const kept = hidePut(x); paint(); live.textContent = (on ? `${r.n} 달력에서 숨겼어요. 따라가기는 그대로예요.` : `${r.n} 다시 보여요.`) + (kept ? '' : ' 이 기계는 기억을 못 해 다시 열면 돌아와요.'); });
  paint();
  v.append(h('div', {class: 'pcal-acts'}, sb, hb, h('a', {class: 'pcal-btn pcal-co', href: '#/w/' + code, text: '회사 보기 ›'})), live);
  v.append(...hon(), foot(C, `달력은 네 칸 기록과 일봉으로 ${md(T.asOf)}까지 셌어요`));
  return {title: r.n, nodes: [v]};
}

/** 없는 주소(#/cal/<번호 꼴이 아닌 것>) — 옛 viewMissing 과 같은 글 */
async function vMissing() {
  const C = await NX.need('core');
  return {title: '없는 주소입니다', nodes: [h('div', {class: 'pcal'}, h('h1', {class: 'pcal-h1', text: '없는 주소입니다'}), h('p', {class: 'pcal-lead', text: '주소가 바뀌었거나 잘못 들어왔습니다.'}),
    h('p', {class: 'pcal-acts'}, h('a', {class: 'pcal-btn', href: '#/', text: '처음 화면으로'})), foot(C))]};
}

/** #/cal → 달력 · #/cal/<번호 여섯 자> → 종목 파일 · 그 밖 → 없는 주소(옛 길과 같음) */
export async function render(arg) {
  const a = String(arg ?? '');
  if (!a) return vCal();
  if (/^[0-9A-Z]{6}$/.test(a)) return vCase(a);
  return vMissing();
}
