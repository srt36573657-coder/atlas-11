/* 오늘 시장(#/today · 쪽 모듈) — 옛 먹빛 첫 화면(site/atlas/atlas.js m4market · m4breadth · m4flows · m4us · m4picks · m4groups · 규칙 67)을 새 화면으로 옮김
   사장님 2026-10-17 04:04(싱가포르) 「첫화면 부터 마지막 페이지 까지 모두 바꿔」 · 04:23 「에이전트 총 동원해」 · 규칙 74
   2026-10-18 명령문 [6] 4 — 첫 화면에는 이 쪽을 그리지 않음(첫 화면은 세 줄 요약 + #/today 고리만 · 일꾼 S2x) → render('home') 은 그릴 것 0
   render('') = #/today 한 화면 — 큰 제목 「오늘 시장」 · 큰 날 「!」 · 오늘 한 줄(고른 지수) · 같은 칸 여섯(시장 · 오른 곳과 내린 곳 · 사고팔기 · 미국 · 고른 곳 · 큰 업종) · 봉인 줄
   [6] 8 — 큰 숫자 = 고른 지수의 마지막 날 하루 바뀜 %(선이 그려지는 동안 · 선을 눌러 끌어도 그대로) · 지수 값 · 기간 %는 작게(지수 값만 선을 따라 움직임)
   [10] 5 ~ 10 — 글씨는 app.css 의 --fs-1 ~ 6 만(17px 아래 없음 · 이 쪽은 다섯 가지) · 간격은 --sp-1 ~ 3 만(음수 없음) · 왼쪽 줄 셋(16 · 32 · 48) · 같은 줄은 같은 높이 · 금빛 경고는 두 줄까지(길면 「?」 한 줄로 접힘 — warn.js)
   [10] 1 — 갈래 → 큰 업종 · 20거래일 → 한 달 · 고른 곳은 멍거 · 린치 조건 뜻으로만
   숫자 · 셈 · 「?」 줄 · 금빛 뜻은 옛 쪽 그대로(scripts/atlas11/next/check_today.mjs 가 옛 첫 화면과 맞대 봄) · 고른 지수 · 기간은 옛 기억 열쇠 그대로(atlas:m4idx · atlas:m4per — 옛 글 꼴 '0' · '60')
   주소: 업종 → #/ch/i/<이름> · 큰 업종 → #/ch/g/<번호> · 회사 → #/w/<번호> · 봉인 → #/time(새 화면이 없으면 /atlas/#/time)
   보안 규칙(CSP): 글은 textContent · 꾸밈은 p-today.css 와 CSSOM(style.setProperty) · 입체 · 그림자 · 바둑판 없음 · 움직임 줄이기면 움직임 없음 */
import {warn} from '/next/warn.js'; // 노란 경고 글은 두 줄까지 — 길면 「?」 한 줄로 접고 누르면 펼침([10] 10)
const NX = globalThis.NX;
const {h, sv, pct, p2} = NX;
const cls = x => NX.cls(x); // up · dn · fl · q(모름 = 금빛)
const NB = ' ';
const RM = NX.RM ?? matchMedia('(prefers-reduced-motion: reduce)');
const enc = encodeURIComponent;

/* ── 말 — 옛 쪽(atlas.js) 그대로 ── */
const md = d => { const p = String(d).split('-'); return (+p[1]) + '월 ' + (+p[2]) + '일'; }; // 붙임 띄어쓰기(「10월 / 8일」로 안 갈라짐)
const hasB = w => { const c = String(w).trim().slice(-1), k = c.charCodeAt(0) - 0xAC00; return k >= 0 && k <= 11171 ? k % 28 !== 0 : '013678'.includes(c); };
const jo = (w, a, b) => w + (hasB(w) ? a : b);
const a1 = x => pct(x).replace(/^[+−]/, '');
const isDay = d => /^\d{4}-\d{2}-\d{2}/.test(String(d ?? ''));
const isTime = t => /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}/.test(String(t ?? ''));
const kstNow = () => new Date(Date.now() + 9 * 36e5).toISOString();
const ampm = t => { if (!isTime(t)) return '?'; const hh = +t.slice(11, 13), mm = t.slice(14, 16); return `${hh < 12 ? '오전' : '오후'}${NB}${hh % 12 || 12}:${mm}`; };
const dayK = d => (!isDay(d) ? '?' : String(d).slice(0, 10) === kstNow().slice(0, 10) ? '오늘' : md(String(d).slice(0, 10)));
const onDay = d => (!isDay(d) ? '' : dayK(d) === '오늘' ? '오늘은' : `${md(String(d).slice(0, 10))}에는`);
const tillT = t => `${dayK(t.slice(0, 10))} ${ampm(t)}까지`;
const tillOk = (w, d) => w.intra && isTime(w.t) && (!isDay(d) || w.t.slice(0, 10) === String(d).slice(0, 10));
const timesW = r => (r >= 2.4 && r < 2.5 ? String(Math.floor(r * 100 + 1e-9) / 100) : (r >= 10 ? Math.round(r) : Math.round(r * 10) / 10).toLocaleString('ko-KR'));
const usualW = r => (r == null ? '' : r >= 1.25 ? `평소의${NB}${timesW(r)}배` : r >= 0.8 ? '평소만큼' : '평소보다 작게');
const numK = (v, k = 2) => (v == null ? '?' : Number(v).toLocaleString('ko-KR', {minimumFractionDigits: k, maximumFractionDigits: k}));
const eokW = v => { if (v == null) return '?'; const a = Math.abs(Math.round(v)), j = Math.floor(a / 10000), r = a % 10000; return (j ? j.toLocaleString('ko-KR') + '조' + (r ? ' ' : '') : '') + (r || !j ? r.toLocaleString('ko-KR') + '억' : '') + ' 원'; };
/** 글 속 「·」 — 줄 첫머리가 「·」가 되지 않게(띄운 「 · 」는 앞 칸 붙임 · 붙은 「X·Y」는 U+2060) · 「…」 · % 뒤 토씨도 붙임 */
const tx = s => String(s).replace(/ · /g, NB + '· ').replace(/([^\s])·(?=[^\s])/g, '$1⁠·').replace(/([」%])(?=[가-힣])/g, '$1⁠');
/** 이름 — 「·」 · 「및」 · 「와」 · 「과」 · 「,」 뒤에서만 줄이 바뀜(<wbr>) · 낱말 가운데서 안 끊김 */
function nameEl(t, c = 'ptoday-nm') {
  if (document.documentElement.lang === 'en') return h('span', {class: c, text: String(t)}); // 영어 — 이름은 한 글 마디(엔진이 이름 통째로 바꿈 · 규칙 71)
  const e = h('span', {class: c}), parts = String(t).replace(/·/g, '⁠·').split(/(?<=[·,]|및|와|과)/);
  parts.forEach((p, i) => { e.append(p); if (i < parts.length - 1) e.append(h('wbr')); });
  return e;
}
const pctEl = (x, tag = 'b') => h(tag, {class: 'num ' + cls(x), text: pct(x)});
const NP = C => C?.funnel?.picked ?? '?';
const pickLine = C => C?.rules?.line ?? (C?.rules?.conds?.length ? C.rules.conds.map(x => x.t).join(' · ') : '? 고른 기준을 못 읽었습니다');
const lyDay = C => (C?.rules?.lyDay ? md(C.rules.lyDay) : '모음 날');
const dday = d => { const k = new Date(Date.now() + 9 * 36e5), t = Date.UTC(k.getUTCFullYear(), k.getUTCMonth(), k.getUTCDate()); const [y, m, x] = d.split('-').map(Number); return Math.round((Date.UTC(y, m - 1, x) - t) / 864e5); };
const ddayText = d => { const n = dday(d); return n > 0 ? 'D-' + n.toLocaleString('ko-KR') : n === 0 ? '오늘 엶' : '엶 날 지남 — 다시 셀 차례'; };
/** 기간 이름([10] 1 — 20거래일은 「한 달」) · 19 ~ 23거래일은 한 달 · 그 밖은 실제 거래일 수 */
const spanW = n => (n >= 19 && n <= 23 ? '한 달' : `${n}거래일`);

/* ── 받은 때 · 「?」 줄 — 옛 쪽 whenOf · whenMeta · planNotes 그대로 ── */
const inSession = H => { if (!H?.live) return false; const n = kstNow(), t = n.slice(11, 16); return n.slice(0, 10) === String(H.kst ?? '').slice(0, 10) && t >= '09:00' && t < '15:30'; };
function whenOf(H, k, live) {
  const s0 = H?.stale?.[k], ok = isTime(s0), t = (ok ? s0 : H?.kst ?? '').slice(0, 16);
  const intra = ok ? (live ?? (t.slice(11, 16) >= '09:00' && t.slice(11, 16) < '15:30')) : !!(live ?? H?.live);
  return {t, stale: !!s0, intra, now: !s0 && intra && inSession(H)};
}
const whenMeta = (w, date) => (w.now ? `${dayK(w.t)} ${ampm(w.t)}${NB}· 장${NB}중` : w.intra ? (isTime(w.t) ? `${dayK(w.t)} ${ampm(w.t)}` : isDay(date) ? dayK(date) : '?') : isDay(date) ? `${dayK(date)} 장${NB}마감` : '?');
const STALE_NM = {idx: '지수', sectors: '업종', flows: '사고판 돈', us: '미국 지수'}, NOTE_ORDER = ['idx', 'sectors', 'flows', 'us'];
/** 선을 그릴 수 있는 지수 조각(종가 둘 이상 · 모두 0 보다 큼) */
const idxOk = x => (x && Array.isArray(x.rows) && x.rows.length >= 2 && x.rows.every(r => Array.isArray(r) && r[1] > 0) ? x : null);
const US3 = ['INX', 'IXIC', 'DJI'], usRows = U => (Array.isArray(U?.rows) ? U.rows.filter(r => US3.includes(r?.key)) : []);
const hasPiece = (H, k) => (k === 'idx' ? !!(idxOk(H?.idx?.KOSPI) || idxOk(H?.idx?.KOSDAQ)) : k === 'sectors' ? !!H?.sectors : k === 'flows' ? !!(H?.flows?.KOSPI || H?.flows?.KOSDAQ) : usRows(H?.us).length > 0);
/** 받은 때마다 「?」 한 줄(그때 못 받은 조각을 모두 적어 그중 첫 칸에) · 제때 받았지만 장 중 값이면 「장 중에 받은 값 …」 한 줄을 첫 칸에 */
function planNotes(H) {
  const out = {}, by = new Map(), live = {idx: (H?.idx?.KOSPI ?? H?.idx?.KOSDAQ)?.live, sectors: undefined, flows: H?.flows?.live, us: false};
  for (const k of NOTE_ORDER) { const t = H?.stale?.[k]; if (!t || !hasPiece(H, k)) continue; const key = isTime(t) ? t.slice(0, 16) : '?'; if (!by.has(key)) by.set(key, []); by.get(key).push(k); }
  for (const [t, ks] of by) { const nm = ks.map(k => STALE_NM[k]), intra = t !== '?' && ks.some(k => k !== 'us' && whenOf(H, k, live[k]).intra);
    out[ks[0]] = qLine(tx(`? 이번에 ${nm.slice(0, -1).map(x => x + ' · ').join('')}${jo(nm.at(-1), '을', '를')} 못 받아 ${t === '?' ? '앞 값을 그대로 보여요.' : `${md(t.slice(0, 10))} ${ampm(t)}에 받은 값이에요.`}${intra ? ` ${ks.includes('us') ? '한국 값은 ' : ''}장 중 값이라 마감 값과 다를 수 있어요.` : ''}`)); }
  const fk = NOTE_ORDER.find(k => k !== 'us' && !H?.stale?.[k] && hasPiece(H, k) && !out[k] && (() => { const w = whenOf(H, k, live[k]); return w.intra && !w.now; })());
  if (fk) out[fk] = h('p', {class: 'ptoday-cap', text: '장 중에 받은 값이라 마감 값과 다를 수 있어요.'});
  return out;
}

/* ── 오늘 한 줄(#/today 에서만 — 새 첫 화면은 「오늘 한 줄」 칸이 이미 보임) · 큰 날 금빛 「!」 — 옛 쪽 gauge · todayWords · idxAlerts 그대로 ── */
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
    out.push(alertBox(`! ${xs.length > 1 ? '코스피와 코스닥 모두' : jo(xs[0].name, '이', '가')} ${why === 'big' ? '하루 5% 넘게' : '평소의 2.5배 넘게'} ${way(xs)}.`)); }
  return out;
}

/* ── 고른 지수 · 기간 — 이 기기에 기억(옛 열쇠 · 옛 글 꼴 그대로 — 옛 화면과 같은 기억이 이어짐) ── */
const M4 = {idx: 0, per: 60}; // 0 코스피 · 1 코스닥 · 점 수 6 · 21 · 60 = 1주 · 1달 · 3달
const M4PER = [[6, '1주'], [21, '1달'], [60, '3달']];
function m4load() { try { const k = localStorage.getItem('atlas:m4idx'), p = +localStorage.getItem('atlas:m4per'); if (k === '0' || k === '1') M4.idx = +k; if (M4PER.some(x => x[0] === p)) M4.per = p; } catch { /* 기억 못 함 — 처음 값 */ } }
function m4save() { try { localStorage.setItem('atlas:m4idx', String(M4.idx)); localStorage.setItem('atlas:m4per', String(M4.per)); } catch { /* 기억 못 함 */ } }

/* ── 칸 조각 ── */
let uid = 0;
/** 칸 — 머리(제목 + 오른쪽 받은 때 · 못 받은 값이면 때 앞 금빛 「?」) + 카드 몸 */
function section(k, title, meta, q = false) {
  const id = 'ptoday-h-' + k + '-' + (++uid);
  const head = h('div', {class: 'ptoday-sh'}, h('h2', {class: 'sec ptoday-t', id, text: title}), meta ? h('span', {class: 'ptoday-meta'}, q ? h('b', {class: 'ptoday-mq', text: '?' + NB}) : null, meta) : null);
  const body = h('div', {class: 'ptoday-card'});
  return {el: h('section', {class: 'ptoday-sec', 'data-k': k, 'aria-labelledby': id}, head, body), head, body, id};
}
const add = (el, ...xs) => el.append(...xs.filter(Boolean));
const lead = t => h('p', {class: 'ptoday-lead'}, typeof t === 'string' ? tx(t) : t);
/** 금빛 「?」 줄 — 두 줄 안이면 그대로 · 넘으면 「? 조심할 것 — 누르면 펼쳐요」 한 줄로 접힘(warn.js · 카드 안이라 옆 여백 0) */
const qLine = t => warn(t, {cls: 'in'});
/** 큰 날 금빛 「!」 상자 — 같은 접힘 · 카드 안(inner)이면 옆 여백 0 */
const alertBox = (t, inner = false) => warn(t, {cls: inner ? 'ptoday-al in' : 'ptoday-al'});
const chev = (on = true) => h('i', {class: 'ptoday-chev', 'aria-hidden': 'true', text: on ? '›' : ''});
/** 「어떻게 셌나요?」 — 칸 이름을 화면 읽기에 함께(여섯 칸이 같은 글이라 구분되게) */
const how = (what, ...ps) => h('details', {class: 'ptoday-how'}, h('summary', {'aria-label': `${what} — 어떻게 셌나요?`, text: '어떻게 셌나요?'}), h('div', {class: 'ptoday-in'}, ...ps.map(t => h('p', {text: tx(t)}))));
/** 화면에 들어오면 한 번 — 막대가 자라고 숫자가 세어 오름(움직임 줄이기면 바로 끝 모양) */
function io(el, f) {
  if (RM.matches || !('IntersectionObserver' in window)) { el.classList.add('ptoday-in-v'); f?.(true); return; }
  el.classList.add('ptoday-io'); const ob = new IntersectionObserver(es => { for (const x of es) if (x.isIntersecting) { ob.disconnect(); el.classList.add('ptoday-in-v'); f?.(false); } }, {threshold: 0.25}); ob.observe(el);
}
function countUp(el, to, still) { const end = to.toLocaleString('ko-KR'); if (still) { el.textContent = end; return; } const t0 = performance.now(), T = 1200; const fr = t => { if (!el.isConnected) return; const u = Math.min(1, (t - t0) / T), e = 1 - (1 - u) ** 3; el.textContent = Math.round(to * e).toLocaleString('ko-KR'); if (u < 1) requestAnimationFrame(fr); else el.textContent = end; }; el.textContent = '0'; requestAnimationFrame(fr); }
const W_ = (el, w) => { el.style.setProperty('width', w); return el; };

/* ── ① 시장 — 고른 지수 · 큰 숫자 · 두 산줄기(같은 눈금 · 고른 기간 첫날 = 0%) · 기간 ── */
function market(H, notes) {
  const K = idxOk(H?.idx?.KOSPI), Q = idxOk(H?.idx?.KOSDAQ), XS = [K, Q], NM = ['코스피', '코스닥'];
  if (!XS[M4.idx]) M4.idx = XS[0] ? 0 : 1;
  const w = whenOf(H, 'idx', (K ?? Q)?.live);
  const S = section('mk', '시장', K || Q ? whenMeta(w, (K ?? Q).date) : null, w.stale), b = S.body, onIdx = [];
  if (!K && !Q) { b.append(qLine('? 이번에 지수 값을 못 받았어요.')); return {el: S.el, onIdx: f => onIdx.push(f)}; }
  const ld = lead(''); // 오늘 한 줄(고른 지수 · words() 가 채움)
  const seg = h('div', {class: 'ptoday-seg', role: 'group', 'aria-label': '지수 고르기'}), per = h('div', {class: 'ptoday-per', role: 'group', 'aria-label': '기간 고르기'});
  const ib = NM.map((nm, k) => { const bt = h('button', {type: 'button', 'aria-pressed': 'false', disabled: XS[k] ? null : true, text: nm}); bt.addEventListener('click', () => { if (M4.idx === k) return; M4.idx = k; m4save(); sync(true); for (const f of onIdx) f(); }); return bt; });
  const pb = M4PER.map(([p, nm]) => { const bt = h('button', {type: 'button', 'aria-pressed': 'false', text: nm}); bt.addEventListener('click', () => { if (M4.per === p) return; M4.per = p; m4save(); sync(true); }); return bt; });
  seg.append(...ib); per.append(...pb);
  /* 큰 숫자 = 고른 지수의 마지막 날 하루 바뀜 %([6] 8) — draw() 에서만 정함 · 선이 그려지는 동안 · 선을 눌러 끌어도 그대로
     작은 줄 = 지수 값(선을 따라 움직임 · 끌면 그날 날짜가 옆에 뜸) + 고른 기간 %(작게) */
  const big = h('span', {class: 'ptoday-v num'}), lv = h('span', {class: 'ptoday-lv num'}), vt = h('span', {class: 'ptoday-vt'}), perN = h('span', {class: 'ptoday-pn'}), perB = h('b', {class: 'num'});
  const hero = h('div', {class: 'ptoday-hero'}, h('p', {class: 'ptoday-hl', text: '하루'}), h('p', {class: 'ptoday-hv'}, big), h('p', {class: 'ptoday-cg'}, lv, vt, h('span', {class: 'ptoday-pw'}, perN, perB)));
  const ylab = h('div', {class: 'ptoday-yl', 'aria-hidden': 'true'});
  const gid = 'ptoday-ag' + (++uid), svg = sv('svg', {'aria-hidden': 'true', focusable: 'false'}), defs = sv('defs'), gr = sv('linearGradient', {id: gid, x1: 0, y1: 0, x2: 0, y2: 1});
  gr.append(sv('stop', {offset: 0, 'stop-color': '#F2EFE8', 'stop-opacity': 0.18}), sv('stop', {offset: 1, 'stop-color': '#F2EFE8', 'stop-opacity': 0})); defs.append(gr);
  const grid = sv('g', {class: 'ptoday-grid'}), ag2 = sv('path', {class: 'ptoday-ag2'}), lg = sv('path', {class: 'ptoday-lg'}), af = sv('path', {class: 'ptoday-af', fill: `url(#${gid})`}), lf = sv('path', {class: 'ptoday-lf', pathLength: 1}),
    cur = sv('line', {class: 'ptoday-cur'}), now = sv('circle', {class: 'ptoday-now', r: 4.5}), hd = sv('circle', {class: 'ptoday-hd', r: 5}), cd = sv('circle', {class: 'ptoday-cd', r: 5});
  svg.append(defs, grid, ag2, lg, af, lf, cur, now, hd, cd);
  const ch = h('div', {class: 'ptoday-ch', role: 'img'}, svg, ylab), ax0 = h('span'), ax1 = h('span'), axl = h('div', {class: 'ptoday-axl', 'aria-hidden': 'true'}, ax0, ax1);
  const lgF = h('b'), lgG = h('b'), lgd = h('div', {class: 'ptoday-lgd', 'aria-hidden': 'true'}, h('span', {}, lgF, h('i')), h('span', {class: 'ptoday-g2'}, lgG, h('i', {class: 'ptoday-gi'})), h('span', {class: 'ptoday-z', text: '첫날 = 0%'})); // 이름 먼저 · 선 표본은 뒤(글 시작 왼쪽 줄 하나로)
  const capP = h('p', {class: 'ptoday-cap ptoday-pc'}), vh = h('p', {class: 'ptoday-vh'}), hint = h('p', {class: 'ptoday-hint', text: '선을 누른 채 옆으로 끌면 그날 값이 보여요.'});
  add(b, ld, seg, hero, ch, axl, per, lgd, capP, vh, hint, notes.idx,
    how('시장', '네이버 증권에서 받은 지수예요. 고른 기간의 첫날을 0%로 놓고 코스피와 코스닥을 같은 눈금에 그렸어요.',
      '평소 = 그 앞 한 달 동안 하루에 움직인 크기의 평균이에요. 「n월 n일 이후 가장 크게」는 그만큼 움직인 마지막 날이 5거래일 이상 앞일 때만 적어요.',
      '금빛 「!」 = 평소의 2.5배 넘게 움직이고 1.5% 넘을 때, 또는 하루 5% 넘을 때예요. 코스피 1990년 · 코스닥 1996년부터의 날마다 기록으로 미리 정한 문턱이에요. 해마다 18번쯤 떠요.',
      '센 것일 뿐 다음 날을 말하지 않아요.'));
  const same = !!(K && Q && K.rows.length === Q.rows.length && K.rows.every((r, i) => r[0] === Q.rows[i][0]));
  const DATA = XS.map((x, k) => (x ? {n: NM[k], v: x.rows.map(r => r[1]), d: x.rows.map(r => md(r[0])), close: x.close, day: x.day, hi: x.hi, x} : null));
  let F, G, PF, PG, X, Y, W = 0, padR = 52, raf = 0, busy = false, played = false, down = false, offT = 0, vis = false, waitT = 0;
  const Hh = 170, padL = 4, top = 10, bot = 10;
  const sl = o => { const n = o.v.length, s = Math.max(0, n - M4.per); return {v: o.v.slice(s), d: o.d.slice(s), b: o.v[s]}; };
  const pcts = o => o.v.map(a => (a / o.b - 1) * 100);
  /** 기간 이름 — 자료가 모자라면 실제 거래일 수(「3달」이라 하지 않음) */
  const pnOf = o => { const n = Math.min(o.v.length, M4.per); return n < M4.per ? `${n - 1}거래일` : M4PER.find(x => x[0] === M4.per)[1]; };
  const ticks = (lo, hi) => { const stp = [0.5, 1, 2, 5, 10, 20, 50]; let s = stp.at(-1); for (const x of stp) if ((hi - lo) / x <= 4) { s = x; break; } const t = []; for (let a = Math.ceil(lo / s) * s; a <= hi + 1e-9; a += s) t.push(Math.round(a * 100) / 100); return t; };
  const pth = p => p.map((a, i) => (i ? 'L' : 'M') + X(i).toFixed(1) + ' ' + Y(a).toFixed(1)).join(' ');
  const sgn = t => (t > 0 ? '+' : t < 0 ? '−' : '');
  function words() {
    const D0 = DATA[M4.idx];
    ld.replaceChildren(...todayWords(NM[M4.idx], D0?.x, w).flatMap((s, i) => (i ? [' ', s] : [s])));
    const pn = pnOf(D0), ch0 = DATA.map(o => (o ? (o.v.at(-1) / o.v[Math.max(0, o.v.length - M4.per)] - 1) * 100 : null));
    const say = (k, last) => { const c = ch0[k]; const did = pct(c) === '0.0%' ? (last ? '그대로였어요' : '그대로였고') : `${a1(c)}${NB}${c > 0 ? '올랐' : '내렸'}${last ? '어요' : '고'}`; return `${jo(NM[k], '은', '는')}${NB}${did}`; };
    capP.textContent = same ? `${pn} 동안 ${say(0, false)}, ${say(1, true)}.` : `${pn} 동안 ${say(M4.idx, true)}.`; // 두 지수 날이 다르면 한 지수만
  }
  function draw() {
    const o = DATA[M4.idx], g2 = same ? DATA[1 - M4.idx] : null; F = sl(o); G = g2 ? sl(g2) : null; PF = pcts(F); PG = G ? pcts(G) : []; const n = PF.length;
    let lo = Math.min(0, ...PF, ...PG), hi = Math.max(0, ...PF, ...PG); const m = (hi - lo) * 0.08 || 1; lo -= m; hi += m;
    const fs = parseFloat(ylab.isConnected ? getComputedStyle(ylab).fontSize : '') || 17; padR = Math.round(fs * 3.05); // 오른쪽 눈금 글 자리 = 눈금 글 크기를 따라감
    W = Math.max(120, ch.clientWidth || 320); /* 좁은 휴대폰 · 아주 큰 글씨에서도 칸 넓이 그대로(넘치지 않게) */ X = i => padL + i * (W - padL - padR) / Math.max(1, n - 1); Y = p => top + (hi - p) * (Hh - top - bot) / (hi - lo);
    axl.style.setProperty('width', (W - padR) + 'px'); // 날짜 줄은 그림 줄 끝(오른쪽 눈금 글 자리 앞)까지 — 간격 값이 아니라 그림 넓이
    svg.setAttribute('viewBox', `0 0 ${W} ${Hh}`); svg.setAttribute('width', W); svg.setAttribute('height', Hh);
    grid.replaceChildren(); ylab.replaceChildren();
    for (const t of ticks(lo, hi)) { const y = Y(t); grid.append(sv('line', {class: t === 0 ? 'ptoday-g0' : 'ptoday-gl', x1: 0, x2: W - padR + 6, y1: y.toFixed(1), y2: y.toFixed(1)})); const s = h('span', {class: 'num', text: `${sgn(t)}${Math.abs(t)}%`}); s.style.setProperty('top', (y - fs / 2).toFixed(1) + 'px'); ylab.append(s); }
    const base = ` L${X(n - 1).toFixed(1)} ${Hh} L${X(0).toFixed(1)} ${Hh} Z`, df = pth(PF);
    lf.setAttribute('d', df); af.setAttribute('d', df + base);
    if (G) { const dg = pth(PG); lg.setAttribute('d', dg); ag2.setAttribute('d', dg + base); } else { lg.setAttribute('d', ''); ag2.setAttribute('d', ''); }
    now.setAttribute('cx', X(n - 1).toFixed(1)); now.setAttribute('cy', Y(PF[n - 1]).toFixed(1));
    big.textContent = p2(o.day); big.className = 'ptoday-v num ' + cls(o.day); // 큰 숫자 = 마지막 날 하루 바뀜 % — 여기서만 바꿈(그리기 · 끌기와 상관없이 그대로)
    lv.textContent = numK(o.close); perN.textContent = pnOf(o); perB.textContent = pct(PF[n - 1]); perB.className = 'num ' + cls(PF[n - 1]);
    ax0.textContent = F.d[0]; ax1.textContent = F.d[n - 1]; lgF.textContent = o.n; lgG.textContent = G ? DATA[1 - M4.idx].n : ''; lgd.classList.toggle('ptoday-one', !G);
    vh.replaceChildren(...(o.hi && isDay(o.hi.d) ? [`3달 가운데 가장 높던 ${md(o.hi.d)}과 견주면 `, pctEl(o.hi.vs, 'b')] : []));
    ch.setAttribute('aria-label', `${pnOf(o)} 동안 ${o.n} ${pct(PF[n - 1])}${G ? ` · ${DATA[1 - M4.idx].n} ${pct(PG[n - 1])}` : ''} — ${F.d[0]}을 0%로 놓은 같은 눈금`);
    words();
  }
  function sync(go) {
    ib.forEach((x, k) => x.setAttribute('aria-pressed', String(k === M4.idx))); pb.forEach((x, k) => x.setAttribute('aria-pressed', String(M4PER[k][0] === M4.per)));
    off(); draw(); if (go) play();
  }
  /** 앞 산줄기가 그려지는 동안 작은 지수 값과 날짜가 함께 달림(큰 숫자 = 하루 바뀜 %는 그대로) → 끝나면 뒤 산줄기 · 면이 떠오름 */
  function play() {
    if (RM.matches || !lf.getTotalLength || !ch.isConnected) return; cancelAnimationFrame(raf);
    if (ch.clientWidth && Math.max(120, ch.clientWidth) !== W) draw(); // 붙은 뒤 넓이로
    const n = PF.length; if (n < 2) return; const cum = [0]; for (let i = 1; i < n; i++) cum[i] = cum[i - 1] + Math.hypot(X(i) - X(i - 1), Y(PF[i]) - Y(PF[i - 1]));
    const tot = cum[n - 1] || 1, t0 = performance.now(), T = M4.per < 10 ? 1100 : M4.per < 30 ? 1400 : 1800; busy = true;
    lf.style.setProperty('stroke-dasharray', '1'); lf.style.setProperty('stroke-dashoffset', '1'); ch.classList.add('ptoday-play');
    const fr = tn => {
      if (!ch.isConnected) { busy = false; return; }
      const t = Math.min(1, (tn - t0) / T), f = 1 - (1 - t) ** 3, L = f * tot; let j = 0; while (j < n - 2 && cum[j + 1] < L) j++;
      const sg = cum[j + 1] - cum[j]; let u = sg ? (L - cum[j]) / sg : 0; u = Math.max(0, Math.min(1, u)); const ix = u > 0.5 ? j + 1 : j;
      lf.style.setProperty('stroke-dashoffset', String(1 - f)); hd.setAttribute('cx', (X(j) + (X(j + 1) - X(j)) * u).toFixed(1)); hd.setAttribute('cy', (Y(PF[j]) + (Y(PF[j + 1]) - Y(PF[j])) * u).toFixed(1));
      lv.textContent = numK(F.v[ix]); vt.textContent = F.d[ix]; hero.classList.add('ptoday-sc');
      if (t < 1) raf = requestAnimationFrame(fr);
      else { busy = false; lv.textContent = numK(DATA[M4.idx].close); vt.textContent = ''; lf.style.removeProperty('stroke-dasharray'); lf.style.removeProperty('stroke-dashoffset'); ch.classList.remove('ptoday-play'); hero.classList.remove('ptoday-sc'); if (ch.clientWidth && Math.max(120, ch.clientWidth) !== W) draw(); } // 그리는 동안 넓이가 바뀌었으면 다시
    };
    raf = requestAnimationFrame(fr);
  }
  /** 누른 자리의 날 — 그림 넓이의 몫으로 셈(큰 글씨 zoom 에서도 제자리) */
  function at(e) {
    if (busy) return; const n = PF.length, r = ch.getBoundingClientRect(), z = r.width / (ch.clientWidth || r.width || 1) || 1;
    let i = Math.round((e.clientX - r.left - padL * z) / Math.max(1, r.width - (padL + padR) * z) * (n - 1)); i = Math.max(0, Math.min(n - 1, i));
    const px = X(i).toFixed(1); cur.setAttribute('x1', px); cur.setAttribute('x2', px); cur.setAttribute('y1', 0); cur.setAttribute('y2', Hh); cd.setAttribute('cx', px); cd.setAttribute('cy', Y(PF[i]).toFixed(1));
    lv.textContent = numK(F.v[i]); vt.textContent = F.d[i]; hero.classList.add('ptoday-sc'); ch.classList.add('ptoday-on');
  }
  function off() { down = false; clearTimeout(offT); if (!busy) { ch.classList.remove('ptoday-on'); hero.classList.remove('ptoday-sc'); vt.textContent = ''; if (DATA[M4.idx]) lv.textContent = numK(DATA[M4.idx].close); } }
  ch.addEventListener('pointerdown', e => { down = true; try { ch.setPointerCapture(e.pointerId); } catch { /* 못 잡음 */ } at(e); });
  ch.addEventListener('pointermove', e => { if (down || e.pointerType === 'mouse') at(e); });
  ch.addEventListener('pointerup', () => { down = false; clearTimeout(offT); offT = setTimeout(() => { if (!down) off(); }, 1600); });
  ch.addEventListener('pointercancel', off); ch.addEventListener('pointerleave', e => { if (e.pointerType === 'mouse') off(); });
  sync(false);
  // 화면에 붙은 뒤 · 넓이가 바뀔 때마다 다시 그림(옛 쪽 chartDraw · resize 와 같은 뜻)
  if (typeof ResizeObserver === 'function') { let w0 = 0, seen = false; const ro = new ResizeObserver(() => { if (!ch.isConnected) { if (seen) ro.disconnect(); return; } seen = true; const cw = ch.clientWidth; if (!cw || cw === w0) return; w0 = cw; if (!busy) draw(); }); ro.observe(ch); }
  // 그래프가 화면에 꽉 들어오고 여는 보드리가 끝났을 때 한 번 그려짐(편지 위에서 보드리가 나는 동안 숫자가 달리지 않게)
  const introOn = () => !!document.querySelector('#view .m4-letter.intro');
  const tryPlay = () => { if (played || !ch.isConnected || !vis) return; if (introOn()) { clearTimeout(waitT); waitT = setTimeout(tryPlay, 700); return; } played = true; play(); };
  if (!RM.matches && 'IntersectionObserver' in window) { const ob = new IntersectionObserver(es => { for (const x of es) vis = x.isIntersecting; if (vis) tryPlay(); if (played) ob.disconnect(); }, {threshold: 0.75}); ob.observe(ch); }
  return {el: S.el, onIdx: f => onIdx.push(f)};
}

/* ── ② 오른 곳과 내린 곳 — 시장 넓이(네이버 업종 회사 수) · 오늘 강한 업종 셋 · 약한 업종 셋 → 업종 채널 ── */
/** 「10곳 중 n곳」 — 모두 · 대부분 그대로 · 1 ~ 9 로 묶음 */
function breadthWords(B, when) {
  const n = B.up + B.flat + B.down, dn = B.down >= B.up, c = dn ? B.down : B.up, did = dn ? '내렸어요' : '올랐어요', pre = when ? when + ' ' : '';
  if (B.flat > B.up + B.down) return `${pre}대부분 그대로였어요.`;
  if (c === n) return `${pre}모두 ${did}.`;
  return `${pre}10곳${NB}중${NB}${Math.min(9, Math.max(1, Math.round(c / n * 10)))}곳이 ${did}.`;
}
/** 네이버 업종 이름 → 업종 채널(core.secInd — 그 네이버 업종 회사가 가장 많이 든 업종) · 없으면 고리 없음 */
const secHref = (C, name) => { const n = C?.secInd?.[String(name ?? '').replace(/\s+/g, '')], i = n ? C.industries?.find(x => x.name === n) : null; return i ? '#/ch/i/' + enc(i.name) : null; };
function breadth(H, C, notes) {
  const S = H?.sectors, B = S?.breadth, w = whenOf(H, 'sectors', undefined), d = isDay(S?.date) ? S.date : H?.idx?.KOSPI?.date; // 업종 조각의 장 중은 그 조각의 받은 때로
  const X = section('br', '오른 곳과 내린 곳', S ? whenMeta(w, d) : null, w.stale), b = X.body;
  if (!S) { b.append(qLine('? 이번에 업종 값을 못 받았어요.')); return X.el; }
  const n = B ? B.up + B.flat + B.down : 0;
  if (!B || !n) b.append(qLine(tx('? 이번에 오른 곳 · 내린 곳 수를 못 받았어요.'))); // 업종 줄은 그대로 보임
  else {
    b.append(lead(breadthWords(B, tillOk(w, d) ? tillT(w.t) : onDay(d))));
    const bar = h('div', {class: 'ptoday-bar', role: 'img', 'aria-label': `${(B.n ?? n).toLocaleString('ko-KR')}곳 가운데 ${B.up.toLocaleString('ko-KR')}곳 오름 · ${B.flat.toLocaleString('ko-KR')}곳 그대로 · ${B.down.toLocaleString('ko-KR')}곳 내림`},
      ...[['u', B.up], ['f', B.flat], ['d', B.down]].map(([c, x]) => W_(h('i', {class: 'ptoday-b' + c}), (x / n * 100).toFixed(2) + '%')));
    const nums = [['오름', 'up', B.up], ['그대로', 'fl', B.flat], ['내림', 'dn', B.down]].map(([t, c, x]) => { const e = h('b', {class: 'num ' + c, text: x.toLocaleString('ko-KR')}); return [h('span', {}, t, e), e, x]; });
    const box = h('div', {class: 'ptoday-brd'}, bar, h('div', {class: 'ptoday-bl'}, ...nums.map(x => x[0])));
    b.append(box, h('p', {class: 'ptoday-cap', text: `네이버 증권 업종 회사 ${(B.n ?? n).toLocaleString('ko-KR')}곳의 하루`}));
    io(box, still => { for (const [, e, x] of nums) countUp(e, x, still); });
  }
  // 오늘 강한 · 약한 업종(회사 5곳 이상 업종만 · 네이버 증권 업종 %) — 줄을 누르면 업종 채널
  const row = g => { const href = secHref(C, g.name), kids = [h('span', {class: 'ptoday-top'}, nameEl(g.name), h('b', {class: 'num ' + cls(g.chg), text: pct(g.chg)})), chev(!!href)];
    return href ? h('a', {class: 'ptoday-sr', href}, ...kids) : h('div', {class: 'ptoday-sr'}, ...kids); };
  const SS = (S.strong ?? []).slice(0, 3), SW = (S.weak ?? []).slice(0, 3);
  const two = SS.length || SW.length ? h('div', {class: 'ptoday-two'},
    SS.length ? h('div', {}, h('p', {class: 'ptoday-sl', text: '강한 업종'}), h('div', {class: 'ptoday-rows'}, ...SS.map(row))) : null,
    SW.length ? h('div', {}, h('p', {class: 'ptoday-sl', text: '약한 업종'}), h('div', {class: 'ptoday-rows'}, ...SW.map(row))) : null) : null;
  add(b, two, notes.sectors,
    how('오른 곳과 내린 곳', `${jo(`네이버 증권 업종 회사${B?.n ? ` ${B.n.toLocaleString('ko-KR')}곳` : ''}`, '을', '를')} 그 앞 거래일 종가와 견줬어요. 「10곳 중 n곳」은 오른 곳 · 그대로 · 내린 곳을 모두 넣고 셌어요.`,
      `업종은 회사 5곳 이상인 ${S.ranked ?? '?'}개만 줄 세웠어요. 업종마다 오른 비율은 네이버 증권이 셈한 값이에요. 줄을 누르면 그 회사들이 가장 많이 든 꼴똘이 업종으로 가요.`,
      '이날 강한 업종이 다음 날도 강하다는 뜻은 아니에요.'));
  return X.el;
}

/* ── ③ 사고팔기 — 개인 · 외국인 · 기관(고른 지수를 따라감) · 막대는 돈의 방향이라 한 색 · 금빛 「!」는 두 시장 모두 ── */
function flows(H, notes) {
  const el = h('section', {class: 'ptoday-sec', 'data-k': 'fl'});
  const paint = () => {
    const F = H?.flows, m = M4.idx === 1 && F?.KOSDAQ ? 'KOSDAQ' : F?.KOSPI ? 'KOSPI' : 'KOSDAQ', mn = m === 'KOSPI' ? '코스피' : '코스닥', x0 = F?.[m], w = whenOf(H, 'flows', F?.live);
    const X = section('fl', '사고팔기', x0 ? `${mn}, ${whenMeta(w, x0.date)}` : null, w.stale), b = X.body;
    el.setAttribute('aria-labelledby', X.id); el.replaceChildren(X.head, b);
    const fa = (H?.alerts ?? []).filter(a => a.kind === 'flow').map(a => alertBox(`! ${a.key === 'KOSDAQ' ? '코스닥' : '코스피'}에서 외국인이 하루 1조 원 넘게 ${a.v < 0 ? '팔았어요' : '샀어요'}.`, true));
    if (!x0) { add(b, ...fa, qLine('? 이번에 사고판 돈을 못 받았어요.')); return; }
    const who = [['personal', '개인'], ['foreign', '외국인'], ['institutional', '기관']].map(([k, nm]) => [nm, x0[k] ?? null]), max = Math.max(...who.map(x => Math.abs(x[1] ?? 0)), 1);
    const bigW = who.filter(x => x[1] != null).sort((p, q) => Math.abs(q[1]) - Math.abs(p[1]))[0], till = tillOk(w, x0.date) ? tillT(w.t) : onDay(x0.date);
    add(b, ...fa, bigW ? lead(`${till ? till + ' ' : ''}${mn}에서 ${jo(bigW[0], '이', '가')} 가장${NB}많이 ${bigW[1] < 0 ? '팔았어요' : '샀어요'}.`) : null);
    const rows = h('div', {class: 'ptoday-fl'}, ...who.map(([nm, x]) => h('div', {class: 'ptoday-fr'}, h('span', {class: 'ptoday-fn', text: nm}), h('span', {class: 'ptoday-fb', 'aria-hidden': 'true'}, x == null ? null : W_(h('i'), (Math.abs(x) / max * 100).toFixed(1) + '%')),
      h('b', {class: 'num', text: x == null ? '?' : Math.round(x) === 0 ? '0억' : `${eokW(x).replace(/ 원$/, '')} 더${NB}${x < 0 ? '팖' : '삼'}`}))));
    add(b, rows, notes.flows,
      how('사고팔기', `${mn}에서 ${w.intra || w.stale ? `${isTime(w.t) ? `${md(w.t.slice(0, 10))} ${ampm(w.t)}` : '?'}까지` : `${isDay(x0.date) ? md(x0.date) : '?'} 하루`} 산 돈과 판 돈의 차이예요. 단위는 억 원이에요. 더 삼 = 산 돈이 더 많음, 더 팖 = 판 돈이 더 많음.`,
        '막대는 오름 · 내림이 아니라 돈의 방향이라 한 색이고, 세 줄이 같은 자로 그려져요. 셋을 더해도 0이 아닌 까닭은 다른 회사 같은 그 밖의 투자자가 있어서예요.',
        `위 시장 칸에서 고른 지수를 따라가요. 지금은 ${jo(mn, '이에요', '예요')}. 금빛 「!」 = 외국인이 하루 1조 원 넘게 사거나 판 날이에요. 두 시장 모두 보여요. 네이버 증권 투자자별 매매 동향이에요.`));
    io(rows);
  };
  paint();
  return {el, paint};
}

/* ── ④ 미국 — 마지막 장 끝(한국 장이 끝난 뒤 열림) ── */
function us(H, notes) {
  const U = H?.us, w = whenOf(H, 'us', false), rows = Array.isArray(U?.rows) ? U.rows.filter(r => r && r.key) : [], by = Object.fromEntries(rows.map(r => [r.key, r])), three = US3.map(k => by[k]).filter(Boolean); // 늘 S&P 500 · 나스닥 · 다우 차례
  const X = section('us', '미국', three.length ? (isDay(U.date) ? `${dayK(U.date)} 장${NB}끝` : '?') : null, !!three.length && w.stale), b = X.body;
  if (!U || !three.length) { add(b, qLine('? 이번에 미국 값을 못 받았어요.'), notes.us); return X.el; }
  const up = three.filter(r => r.chg > 0).length, dl = onDay(U.date);
  b.append(lead(`${dl ? dl + ' ' : ''}${three.length < 3 ? `${three.length}개 지수 가운데 ${up}개가 올랐어요.` : up === 3 ? '세 지수 모두 올랐어요.' : up === 0 ? '세 지수 모두 내렸어요.' : `세 지수 가운데 ${up}개가 올랐어요.`}`));
  b.append(h('div', {class: 'ptoday-us'}, ...three.map(r => h('div', {}, h('span', {text: r.name}), h('b', {class: 'num ' + cls(r.chg), text: p2(r.chg)})))));
  const vix = by.VIX; if (vix) b.append(h('p', {class: 'ptoday-vh'}, `미국 불안 지수 ${numK(vix.close)}, 하루 `, h('b', {class: 'num ' + cls(vix.chg), text: p2(vix.chg)})));
  add(b, notes.us, how('미국', '네이버 증권 해외 지수예요. 미국 장은 한국 장이 끝난 뒤 열려 한국 같은 날 값과 같은 날이 아니에요.', '미국 불안 지수는 VIX라고도 해요. 오르면 미국 투자자들이 더 불안해한다는 뜻이에요.'));
  return X.el;
}

/* ── ⑤ 고른 곳 — 오른 곳 · 내린 곳 · 가장 많이 오른 · 내린 곳 · 제 평소의 2.5배 이상 움직인 곳(lines.json) → 회사 ── */
/** 고른 곳마다 마지막 하루 바뀜과 평소(그 앞 거래일 하루 움직임 크기의 평균) — lines.json 21개 값 · 선과 하루 값이 같은 날일 때만 */
function pickMoves(S, P) {
  const out = []; if (!P.lines || !S?.list || P.linesAsOf !== S.date) return out;
  for (const [c, chg] of S.list) { const l = P.lines[c]; if (!l || l.length < 6 || l.at(-1) == null || l.at(-2) == null) continue; const d = []; for (let k = 1; k < l.length; k++) if (l[k - 1] > 0 && l[k] > 0) d.push((l[k] / l[k - 1] - 1) * 100);
    if (d.length < 5) continue; const t = (l.at(-1) / l.at(-2) - 1) * 100, prev = d.slice(0, -1), avg = prev.reduce((a, x) => a + Math.abs(x), 0) / prev.length; out.push({c, chg, t, avg, ratio: avg > 0 ? Math.abs(t) / avg : null}); }
  return out;
}
const BIGX = 2.5; // 「크게 움직인 곳」 문턱 = 지수 「!」와 같은 평소의 2.5배 · 이상
function picks(H, C, P) {
  const S = H?.s365, name = `고른 ${NP(C)}곳`;
  const segs = String(pickLine(C)).split(' · '), say = h('p', {class: 'ptoday-say'}, h('span', {class: 'nb', text: `${C.rules?.name ?? '?'}:`}), ' ');
  segs.forEach((t, i) => { say.append(h('span', {class: 'nb', text: t + (i < segs.length - 1 ? ' ·' : '')})); if (i < segs.length - 1) say.append(' '); });
  const X = section('pk', name, isDay(S?.date) ? dayK(S.date) : null), b = X.body;
  b.append(say);
  if (!S || !S.list?.length) { b.append(qLine(`? ${NP(C)}곳 하루 값이 없어요.`)); return X.el; }
  const dl = onDay(S.date);
  b.append(lead(`${dl ? dl + ' ' : ''}${S.up}곳이 오르고 ${S.down}곳이 내렸어요.${S.flat ? ` ${S.flat}곳은 그대로였어요.` : ''}${S.none ? ` 값이 없는 곳은 ${S.none}곳이에요.` : ''}`));
  const mv = pickMoves(S, P), byC = new Map(mv.map(x => [x.c, x])), nm = c => P.comp?.[c]?.name ?? (S.top?.c === c ? S.top.n : S.bot?.c === c ? S.bot.n : c);
  const chgOf = c => byC.get(c)?.chg ?? S.list.find(y => y[0] === c)?.[1] ?? (S.top?.c === c ? S.top.chg : S.bot?.c === c ? S.bot.chg : null); // 목록에 없으면 양 끝 값
  const row = (c, tag) => { const x = byC.get(c), chg = chgOf(c);
    return h('a', {class: 'ptoday-mv', href: '#/w/' + enc(c)}, h('span', {class: 'ptoday-top'}, h('span', {class: 'ptoday-nm', 'data-proper': '', text: nm(c)}), h('b', {class: 'num ' + cls(chg), text: pct(chg)})),
      h('span', {class: 'ptoday-tg', text: [tag, usualW(x?.ratio)].filter(Boolean).join(', ')}), chev()); };
  // 두 묶음: 가장 많이 오른 곳 · 내린 곳 / 제 평소의 2.5배 이상 움직인 곳(그 밖에서 큰 차례 셋 + 나머지 접은 칸)
  const ends = [[S.top?.c, '가장 많이 오름'], [S.bot?.c, '가장 많이 내림']].filter(([c], i, a) => c && a.findIndex(y => y[0] === c) === i);
  if (ends.length) b.append(h('p', {class: 'ptoday-sl', text: '가장 많이 오른 곳과 내린 곳'}), h('div', {class: 'ptoday-mvs'}, ...ends.map(([c, t]) => row(c, t))));
  if (mv.length) {
    const bigAll = mv.filter(x => x.ratio != null && x.ratio >= BIGX), seen = new Set(ends.map(x => x[0])), more = bigAll.filter(x => !seen.has(x.c)).sort((p, q) => q.ratio - p.ratio), show = more.slice(0, 3), inTop = bigAll.length - more.length;
    const tail = !bigAll.length ? '' : inTop && !more.length ? ' — 모두 위에 있어요' : inTop ? ` — 위 ${inTop}곳 말고 ${more.length > 3 ? '큰 차례로 ' : ''}${show.length}곳` : more.length > 3 ? ` — 큰 차례로 ${show.length}곳` : '';
    const rest = more.slice(3);
    add(b, h('p', {class: 'ptoday-sl', text: bigAll.length ? `제 평소의 2.5배 이상 움직인 곳 ${bigAll.length}곳${tail}` : '제 평소의 2.5배 이상 움직인 곳은 없어요'}),
      show.length ? h('div', {class: 'ptoday-mvs'}, ...show.map(x => row(x.c, ''))) : null,
      rest.length ? h('details', {class: 'ptoday-more'}, h('summary', {'aria-label': `제 평소의 2.5배 이상 움직인 나머지 ${rest.length}곳 보기`, text: `나머지 ${rest.length}곳 보기`}), h('div', {class: 'ptoday-mvs'}, ...rest.map(x => row(x.c, '')))) : null);
  }
  const F = C.facts; if (F?.n1y && F.dd50 > 0) b.append(h('p', {class: 'ptoday-vh', text: `${F.dd50 >= F.n1y ? '고른 곳 모두' : `고른 곳도 10곳 중 ${Math.min(9, Math.max(1, Math.round(F.dd50 / F.n1y * 10)))}곳은`} 1년 사이 꼭대기의 반값 아래로 떨어진 적이 있어요. 반값을 견딜 수 있나요?`}));
  { const rn = C.rules?.name; b.append(h('p', {class: 'ptoday-cap', text: rn ? tx(`${jo(rn, '으로', '로')} 센 것이고, ${jo(rn.replace(/ 조건$/, ''), '이', '가')} 고른 목록이 아니에요.`) : '? 고른 기준을 못 읽었어요.'})); }
  b.append(how('고른 곳', `평소 = 그 회사가 앞 ${spanW(C.days - 1)} 동안 하루에 움직인 크기의 평균이에요. 「평소의 n배」는 마지막 하루 움직임을 그 평균으로 나눈 값이에요.`,
    `멍거 조건은 3년 성적표만, 린치 조건은 3년 성적표와 ${lyDay(C)} 값으로 골랐어요. 반값 = ${md(C.asOf)}까지 1년 종가에서 꼭대기의 반 아래로 떨어진 적이 있는 곳이에요. ${F?.n1y ?? '?'}곳 가운데 ${F?.dd50 ?? '?'}곳이에요.`,
    '줄을 누르면 그 회사 화면으로 가요. 7단 중 3단이에요.'));
  return X.el;
}

/* ── ⑥ 큰 업종(7단 중 1단) · 봉인 줄 ── */
function groups(C) {
  const gs = C.groups.slice().sort((p, q) => q.chg - p.chg);
  const X = section('gr', `큰 업종 ${C.groups.length}개`, spanW(C.days)), b = X.body;
  if (gs.length) b.append(lead(`${md(C.base)}부터 ${spanW(C.days)} 동안 ${gs[0].chg < 0 ? '가장 덜 내린' : '가장 많이 오른'} 큰 업종은 ${jo(gs[0].short, '이에요', '예요')}.`)); // 모두 내린 날은 「가장 덜 내린」
  b.append(h('div', {class: 'ptoday-gs'}, ...gs.map(g => h('a', {class: 'ptoday-g', href: '#/ch/g/' + enc(g.id)}, nameEl(g.short), h('b', {class: 'num ' + cls(g.chg), text: pct(g.chg)})))));
  b.append(h('p', {class: 'ptoday-cap', text: '큰 업종을 누르면 그 안의 업종, 회사 차례로 내려가요. 7단 중 1단이에요.'}));
  const T = C.time;
  if (T?.opens?.[0]?.date) b.append(h('a', {class: 'ptoday-mr', href: NX.ready?.('time') ? '#/time' : '/atlas/#/time'}, h('span', {class: 'ptoday-ml', text: `봉인 ${T.id}호 — 3 · 5 · 10년 뒤 다시 엶`}), h('span', {class: 'ptoday-mk'}, '3년 뒤까지 ', h('b', {class: 'num', text: ddayText(T.opens[0].date)})), chev()));
  return X.el;
}

/* ── 그리기 ── */
let compP = null;
/** 고른 곳 이름(comp.json) · 선(lines.json) — 둘 다 받아야 씀(옛 쪽 needComp 와 같음 · 못 받으면 고른 곳 칸만 줄여 그림) */
async function needComp() {
  if (!compP) compP = Promise.all([NX.getJson('comp.json'), NX.getJson('lines.json')]).then(([c, l]) => (c?.companies && l?.lines ? {comp: c.companies, lines: l.lines, linesAsOf: l.asOf} : null));
  const r = await compP; if (!r) compP = null;
  return r ?? {comp: null, lines: null, linesAsOf: null};
}
export async function render(arg) {
  if (arg === 'home') return {title: '오늘 시장', nodes: []}; // [6] 4 — 첫 화면에는 그리지 않음(세 줄 요약 + #/today 고리는 첫 화면 몫)
  await Promise.all([NX.need('core'), NX.need('home')]);
  const C = NX.D.core, H = NX.D.home ?? null;
  const wrap = h('div', {class: 'ptoday ptoday-page'});
  wrap.append(h('h1', {class: 'wt', text: '오늘 시장'}), h('p', {class: 'ws', text: '숫자는 네이버 증권에서 하루 4번 새로 받아요.'}));
  if (!C?.groups) { wrap.append(...NX.noData()); return {title: '오늘 시장', nodes: [wrap]}; }
  const P = await needComp();
  m4load();
  const notes = H ? planNotes(H) : {};
  /** 칸 하나가 자료 탓에 멈춰도 다른 칸은 그대로 — 그 칸 자리에 「?」 한 줄(옛 쪽 safe 와 같음) */
  const safe = (name, f) => { try { return f(); } catch (e) { console.warn('오늘 시장 칸', name, e); wrap.append(h('section', {class: 'ptoday-sec'}, h('div', {class: 'ptoday-card'}, qLine(`? ${name} 칸을 그리지 못했어요.`)))); return null; } };
  if (H && (idxOk(H.idx?.KOSPI) || idxOk(H.idx?.KOSDAQ))) { const top = idxAlerts(H); if (top.length) wrap.append(h('div', {class: 'ptoday-alerts'}, ...top)); }
  if (!H) wrap.append(h('div', {class: 'ptoday-sh'}, h('h2', {class: 'sec ptoday-t', text: '시장 — ?'})), h('div', {class: 'ptoday-card'}, qLine('? 시장 자료를 못 읽었어요. 아래 요즘 오르는 업종은 그대로예요.')));
  else {
    const mk = safe('시장', () => { const r = market(H, notes); wrap.append(r.el); return r; });
    safe('오른 곳과 내린 곳', () => wrap.append(breadth(H, C, notes)));
    const fl = safe('사고팔기', () => { const r = flows(H, notes); wrap.append(r.el); return r; });
    if (fl && mk) mk.onIdx(fl.paint); // 사고팔기는 위에서 고른 지수를 따라감
    safe('미국', () => wrap.append(us(H, notes)));
    safe('고른 곳', () => wrap.append(picks(H, C, P)));
  }
  safe('큰 업종', () => wrap.append(groups(C)));
  if (!H) wrap.append(h('a', {class: 'more', href: '#/f/rise', text: '요즘 오르는 업종 보기 ›'}));
  wrap.append(h('p', {class: 'safe', text: '꼴똘이는 지난 기록만 보여 줘요. 사고팔기를 권하지 않아요.'}));
  return {title: '오늘 시장', nodes: [wrap]};
}
