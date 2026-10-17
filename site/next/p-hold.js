/* 보유종목 점검 — 사장님 2026-10-17(싱가포르) 21:10 「고도리 · 하나로 묶은 명령문」 [5] 1 ~ 3 · 5 ~ 10(일 나누기 docs/design/godori-2026-10-17/brief2.md · 일꾼 D)
   render() = 「보유종목」 탭(#/me) 맨 위 칸 · 종목 · 산 값 · 수량 · 산 날은 이 기기에만(atlas:godori-hold · try/catch · 막히면 이 화면에만)
   판 것은 지우지 않고 판 날 · 판 값을 적어 「지난 보유」로([5] 2) · 잘못 적은 것도 지우지 않고 「잘못 적음」으로 옮김
   첫 질문 「오늘 처음 봤다면 살 거야?」 — 답한 뒤에만 산 값 · 수익률 · 색 · 다섯 가지(본전 생각을 끊으려고 · [5] 3) · 서울 날짜가 바뀌면 다시 물음
   다섯 가지(중요한 차례 · [5] 5 · 6): ① 산 이유가 살아 있나 — 매매일지(atlas:godori-why)에서 그 회사 마지막 기록의 3번 답: 「돈을 잘 번다」→ 오늘 문 1 · 「클 일이 있다」→ 적은 날 지났나 · 「그냥」→ 🟡
     ② 다섯 문 오늘 색(/next/data/gates.json · 처음 적은 날 색과 견줘 닫힌 문이 생기면 🟡) ③ 망할 이유(매매일지 ① 줄 · 나타났는지 스스로 고름)
     ④ 팔 약속까지 남은 거리(내 약속과 견줌만 — 개인별 관리는 정식 투자자문업자만 · [5] 8) ⑤ 한 종목 · 한 업종 몫(셋에 하나 넘음 — 질문 11 「세 곳 이상」)
   색([5] 7): 🔴 팔 선 3% 안 · 지남 · 산 이유 없어짐 > 🟡 하나라도 흔들림 > 🟢 그대로 · 🔴 동안 넘긴 날 = 참은 날([5] 10 · 이 기기에서 본 날로 셈)
   펀드 · 우선주 등은 점검 못 하는 까닭(#/x 와 같은 까닭 — 회사 주식이 아님 · [5] 9) · 이름은 brand.js 한 곳(규칙 76) · 글은 textContent 로만(보안 규칙) */
import {NAME, josa} from './brand.js';
import * as WHY from './p-why.js'; // 매매일지(일꾼 B) — records() · QS 가 없거나 못 읽어도 이 칸은 돎(기록을 직접 읽음)
const NX = globalThis.NX;
const {h} = NX;
const KEY = 'atlas:godori-hold', WHY_KEY = 'atlas:godori-why';
const NEAR = 3; // 팔 선까지 3% 안이면 🔴 — 사장님 예 「네가 정한 팔 선까지 3% 남았어」의 3(정한 숫자)
const SHARE3 = 3; // 한 종목 · 한 업종 몫이 셋에 하나를 넘으면 🟡 — 질문 11 「나눠 넣어? 🟢 세 곳 이상」
const sellOf = b => Math.floor(b * 9 / 10), halfOf = b => Math.floor(b * 12 / 10); // 팔 약속을 안 적었을 때 기본 약속 = 산 값 × 0.9 · × 1.2(원 아래 버림 · 매매일지 · gdr.json 과 같은 셈 · [3] 5)
const GATES = ['이익 늘었나', '아직 조용한가', '석 달 천천히 올랐나', '두 배 넘게 안 올랐나', '돈 들어오는 업종인가']; // 다섯 문(한 장 명령문 명령 7 원문)
const Q3 = {g: '돈을 잘 번다', y: '클 일이 있다', r: '그냥 오를 것 같다'}; // 질문 3 「뭐가 좋아?」 답(원문)
const ASK = ['살 거야', '잘 모르겠어', '안 살 거야'];
const COLOR_NAME = {g: '🟢 그대로', y: '🟡 하나 흔들림', r: '🔴 조심', q: '? 점검 못 함'};

/* 꼴 */
const today = () => (typeof NX.kstNow === 'function' ? NX.kstNow() : new Date(Date.now() + 9 * 36e5).toISOString()).slice(0, 10); // 서울 날짜
const dayOf = d => (typeof d === 'string' && /^\d{4}-\d{2}-\d{2}/.test(d) ? d.slice(0, 10) : null);
const daysBetween = (a, b) => Math.round((Date.parse(b + 'T00:00:00Z') - Date.parse(a + 'T00:00:00Z')) / 864e5);
const md = d => (typeof d === 'string' && /^\d{4}-\d{2}-\d{2}/.test(d) ? `${+d.slice(5, 7)}월 ${+d.slice(8, 10)}일` : '?');
const won = n => Math.round(n).toLocaleString('ko-KR') + '원';
const sWon = n => (Math.round(n) > 0 ? '+' : Math.round(n) < 0 ? '−' : '') + Math.abs(Math.round(n)).toLocaleString('ko-KR') + '원';
const one = x => (Math.floor(Math.abs(x) * 10 + 0.5 + 1e-7) / 10).toFixed(1); // 부호 없는 한 자리(크기로 반올림)
const numIn = s => { const t = String(s ?? '').replace(/[,\s원주]/g, ''); return /^\d+(\.\d+)?$/.test(t) ? Number(t) : NaN; };
const qtyTxt = q => (Number.isInteger(q) ? q.toLocaleString('ko-KR') : String(q)) + '주';

/* 기억(이 기기에만) — 읽다 막히면 null(기억 못 하는 기계) · 깨진 글은 지우지 않고 옆 열쇠에 남긴 뒤 새로 씀 */
function load() {
  let raw;
  try { raw = localStorage.getItem(KEY); } catch { return {all: null, broken: null}; }
  if (raw == null) return {all: [], broken: null};
  try { const x = JSON.parse(raw); if (Array.isArray(x)) return {all: x, broken: null}; } catch { /* 깨진 글 */ }
  return {all: [], broken: raw};
}
function save(S) {
  if (S.mem) return false;
  try {
    if (S.broken != null) { localStorage.setItem(KEY + ':broken:' + Date.now(), S.broken); S.broken = null; }
    localStorage.setItem(KEY, JSON.stringify(S.all)); return true;
  } catch { S.mem = true; return false; }
}
const valid = o => !!o && typeof o === 'object' && typeof o.code === 'string' && !!o.code && Number(o.buy) > 0 && Number(o.qty) > 0 && !!dayOf(o.day);
const isActive = o => valid(o) && !o.sold && !o.wrong;
const isPast = o => valid(o) && !!(o.sold || o.wrong);
const newId = () => 'h' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);

/* 매매일지 — 일꾼 B 의 records() 먼저 · 없으면 열쇠를 직접 읽음 · 그 회사 기록 가운데 가장 새것 */
function journal() {
  try { if (typeof WHY.records === 'function') { const r = WHY.records(); if (Array.isArray(r)) return r; } } catch { /* 아래 길 */ }
  try { const x = JSON.parse(localStorage.getItem(WHY_KEY) || '[]'); return Array.isArray(x) ? x : []; } catch { return []; }
}
function recOf(code, recs) {
  let best = null, bt = -Infinity;
  for (const r of recs) if (r && typeof r === 'object' && String(r.code ?? '') === code) { const t = Date.parse(r.at); const v = Number.isFinite(t) ? t : -1; if (!best || v > bt) { best = r; bt = v; } }
  return best;
}
/** 질문 3 답의 색(g 돈을 잘 번다 · y 클 일이 있다 · r 그냥) — 매매일지 QS 에서 읽고 없으면 원문 차례 */
function q3Of(r) {
  const k = Array.isArray(r?.answers) ? r.answers[2] : null;
  if (!(k === 0 || k === 1 || k === 2)) return null;
  const c = WHY.QS?.[2]?.a?.[k]?.[0] ?? ['g', 'y', 'r'][k];
  return Q3[c] ? c : null;
}
const promiseOf = r => { const P = r?.promise; if (!P || typeof P !== 'object') return null; const s = Number(P.sell), u = Number(P.half); return {sell: s > 0 ? s : null, half: u > 0 ? u : null, text: typeof P.text === 'string' && P.text.trim() ? P.text.trim() : null}; };

/* 다섯 문 오늘 결과(일꾼 E · {schema: 'godori-gates-1', asOf, co: {번호: [x, g1 … g5]}}) — 못 받으면 null(15초 뒤 다시) */
let GATE = null, gateFail = 0, gateP = null;
function gatesJson() {
  if (GATE) return Promise.resolve(GATE);
  if (gateFail && Date.now() - gateFail < 15000) return Promise.resolve(null);
  if (!gateP) gateP = fetch('/next/data/gates.json', {cache: 'no-cache'}).then(r => (r.ok ? r.json() : null)).catch(() => null)
    .then(j => { gateP = null; if (j && j.co && typeof j.co === 'object') GATE = j; else gateFail = Date.now(); return GATE; });
  return gateP;
}
const gateRow = (G, code) => { const v = G?.co?.[code]; return Array.isArray(v) && v.length >= 6 ? v : null; };

/* 찾기 — 일꾼 A 의 NX.findMatch(찾기와 같은 잣대) · 아직 없으면 이름표(names.json)로 이름 · 번호 앞부분만 */
const nrm = s => String(s ?? '').toLowerCase().replace(/[\s·.\-()&]/g, '');
async function findStock(q) {
  q = String(q ?? '').trim(); if (!nrm(q)) return [];
  if (typeof NX.findMatch === 'function') {
    try { if (typeof NX.findReady === 'function') await NX.findReady(); const r = await NX.findMatch(q); if (Array.isArray(r)) return r.filter(x => x && x.c && x.k !== 'g' && x.k !== 'i').slice(0, 8).map(x => ({c: String(x.c), n: String(x.n ?? x.c)})); } catch { /* 아래 길 */ }
  }
  const N = await NX.getJson('names.json'), M = NX.D?.mkt?.companies ?? {}, k = nrm(q);
  const rows = Array.isArray(N?.rows) ? N.rows : Object.entries(M).map(([c, o]) => ({c, n: o.n}));
  const out = [];
  for (const r of rows) {
    const n = nrm(r.n); let s = -1;
    if (r.c.toLowerCase().startsWith(k)) s = 0; else if (n === k) s = 0; else if (n.startsWith(k)) s = 1; else if (n.includes(k)) s = 2;
    if (s >= 0) out.push({c: r.c, n: r.n, s: s + (M[r.c] ? 0 : 0.5)});
  }
  return out.sort((a, b) => a.s - b.s).slice(0, 8).map(({c, n}) => ({c, n}));
}

/** 회사 주식이 아닌 것의 종류 · 까닭(#/x 와 같은 이름표 글 — 「우선주 — 회사 주식이 아니라 …」의 앞 말) */
function kindOf(code, names) {
  const r = Array.isArray(names?.rows) ? names.rows.find(x => x.c === code) : null;
  if (!r) return {label: '?', text: '? 이 종목을 이름표에서 못 찾았어요.'};
  if (!r.k) return {label: '회사 주식', text: '사이트 자료에 아직 없는 회사여서 다섯 가지를 셀 수 없어요.'};
  const label = String(r.w ?? '').split(' — ')[0] || '회사 주식 밖';
  return {label, text: `${label} — 회사 주식이 아니라 다섯 문을 셀 수 없어요.`};
}

/** 몫 — 지금 값(없으면 산 값) × 수량 · 종목은 번호로 묶고 업종은 mkt.json 업종(회사 주식 밖은 종류) */
function sharesOf(S, mkt) {
  const by = new Map(), ind = new Map(); let tot = 0, cost = 0;
  for (const o of S.all) {
    if (!isActive(o)) continue;
    const M = mkt?.companies?.[o.code], p = M ? S.px.get(o.code)?.p : null, v = (p ?? Number(o.buy)) * Number(o.qty);
    if (!p) cost++;
    const iname = M?.i ?? (M ? '?' : kindOf(o.code, S.names).label);
    const b = by.get(o.code) ?? {code: o.code, name: M?.n ?? o.name ?? o.code, ind: iname, v: 0}; b.v += v; by.set(o.code, b);
    ind.set(iname, (ind.get(iname) ?? 0) + v); tot += v;
  }
  return {by, ind, tot, cost};
}
const big = (v, tot) => tot > 0 && v * SHARE3 > tot * (1 + 1e-12); // 셋에 하나 넘음
const pctOf = (v, tot) => (tot > 0 ? one(v / tot * 100) + '%' : '?');

/** 한 곳 점검 — 화면에 그리기 전에 셈(답하기 전에도 셈 · 그리는 것만 답 뒤) */
function assess(o, S, mkt, G) {
  const code = o.code, M = mkt?.companies?.[code], px = M ? S.px.get(code) : null, p = px?.p ?? null, buy = Number(o.buy), qty = Number(o.qty);
  const A = {co: !!M, name: M?.n ?? o.name ?? code, ind: M?.i ?? null, p, pd: px?.d ?? null, ret: p ? (p / buy - 1) * 100 : null, amt: p ? (p - buy) * qty : null, items: [], color: 'q', sure: false};
  if (!M) { A.kind = kindOf(code, S.names); return A; }
  const rec = recOf(code, S.recs), gv = gateRow(G, code), day = S.day;
  // ① 산 이유가 살아 있나
  const r1 = {n: '① 산 이유가 살아 있나', k: '산 이유', c: 'u', lines: [], link: null, gatesNeeded: false}; // u = 셀 수 없음(🟡 · 흔들림이라 부르지 않음)
  if (!rec) { r1.lines.push('? 이 회사로 적은 매매일지가 없어. 산 이유를 적어 두면 여기서 맞대 볼게.'); r1.link = ['#/why/' + NX.enc(code), '이 회사로 왜 사? 적기 ›']; }
  else {
    const t = Date.parse(rec.at), c = q3Of(rec), from = Number.isFinite(t) ? new Date(t + 9 * 36e5).toISOString().slice(0, 10) : dayOf(rec.day); // 매매일지를 쓴 날(서울) — day 는 그날 값의 날
    if (from) r1.lines.push(`${md(from)} 매매일지에서 읽었어.`);
    if (c === 'g') {
      r1.gatesNeeded = true;
      if (!gv || gv[0] !== 0 || gv[1] == null) { r1.lines.push(`「${Q3.g}」 — ? 오늘 문 1(이익 늘었나)을 셀 수 없어.`); }
      else if (gv[1] === 1) { r1.c = 'g'; r1.lines.push(`「${Q3.g}」 — 오늘도 문 1(이익 늘었나)을 지나.`); }
      else { r1.c = 'r'; r1.gone = true; r1.lines.push(`「${Q3.g}」 — 오늘 문 1(이익 늘었나)을 못 지나. 산 이유가 없어졌어.`); }
    } else if (c === 'y') {
      const bd = dayOf(rec.bigDay);
      if (!bd) r1.lines.push(`「${Q3.y}」 — ? 그 일이 언제인지 날짜를 안 적었어.`);
      else if (day > bd) { r1.c = 'r'; r1.gone = true; r1.lines.push(`「${Q3.y}」 — 네가 적은 날(${md(bd)})이 지났어. 그 일이 정말 일어났는지 직접 봐.`); }
      else if (day === bd) { r1.c = 'g'; r1.lines.push(`「${Q3.y}」 — 네가 적은 날이 오늘이야.`); }
      else { r1.c = 'g'; r1.lines.push(`「${Q3.y}」 — 네가 적은 날(${md(bd)})까지 ${daysBetween(day, bd)}일 남았어.`); }
    } else if (c === 'r') { r1.c = 'y'; r1.lines.push(`「${Q3.r}」 — 느낌으로 샀어. 느낌은 이유가 아니야.`); }
    else r1.lines.push('? 매매일지 답을 읽지 못했어.');
  }
  // ② 다섯 문 오늘 색 — 처음 적은 날 색(o.g0)과 견줌
  const r2 = {n: '② 다섯 문의 오늘 색', k: '문 색', c: 'u', lines: [], gates: gv ? gv.slice(1, 6) : null, x: gv ? gv[0] : null};
  if (!gv) r2.lines.push(G ? '? 오늘 이 회사 문 색이 자료에 없어.' : '? 오늘 문 색을 아직 못 받았어.');
  else {
    if (gv[0] === 1) r2.lines.push('거래가 너무 적어 오늘 문을 안 셌어.');
    else if (gv[0] === 2) r2.lines.push('거래가 멈춘 것 같아 오늘 문을 안 셌어.');
    const b = o.g0 && Array.isArray(o.g0.v) && o.g0.ver === (G?.version ?? null) ? o.g0 : null;
    const shut = b ? GATES.filter((_, i) => b.v[i + 1] === 1 && gv[i + 1] === 0) : [];
    const outNow = b ? b.v[0] === 0 && gv[0] > 0 : false, nul = gv[0] === 0 ? GATES.filter((_, i) => gv[i + 1] == null) : [];
    if (nul.length) r2.lines.push(`? 오늘 셀 수 없는 문: ${nul.join(' · ')}.`); // 그 문에 쓸 값이 없음 — 「?」(빨강 아님 · 흔들림 아님)
    if (b && b.d !== G?.asOf && (shut.length || outNow)) { r2.c = 'y'; r2.lines.push(`처음 적은 날(${md(b.d)})보다 닫힌 문: ${[...shut, ...(outNow ? ['거래'] : [])].join(' · ')}.`); }
    else { r2.c = gv[0] !== 0 || nul.length ? 'u' : 'g'; r2.lines.push(!b || b.d === G?.asOf ? '처음 적은 날 색이에요. 다음 자료부터 견줘 볼게.' : `처음 적은 날(${md(b.d)})보다 닫힌 문이 없어.`); }
  }
  // ③ 망할 이유가 나타났나 — 매매일지 ① 줄(내 글) · 스스로 고름
  const why = typeof rec?.why === 'string' && rec.why.trim() ? rec.why.trim() : null, P = promiseOf(rec);
  const r3 = {n: '③ 「망할 이유」가 나타났나', k: '망할 이유', c: 'q', lines: [], why, on: !!o.doom};
  if (!why) r3.lines.push('? 매매일지에 「1년 뒤 반토막 났다면 왜?」를 안 적었어.');
  else if (o.doom) { r3.c = 'y'; r3.lines.push('네가 적은 망할 이유가 나타났다고 골랐어.'); }
  else { r3.c = 'g'; r3.lines.push('아직 안 나타났다고 봤어. 나타나면 눌러 줘.'); }
  // ④ 팔 약속까지 — 내 약속(매매일지) · 없으면 기본 약속(산 값 × 0.9 · × 1.2)
  const own = !!P?.sell, sell = own ? P.sell : sellOf(buy), half = P?.half ?? halfOf(buy), who = own ? '네가 정한' : '기본', whoH = P?.half ? '네가 정한' : '기본';
  const r4 = {n: '④ 팔 약속까지 남은 거리', k: '팔 약속', c: 'q', lines: [], promise: P?.text ?? null};
  if (!own) r4.lines.push(`아직 팔 약속을 안 적어서 기본 약속으로 셌어: 산 값의 90%는 ${won(sell)}, 120%는 ${won(half)}.`);
  else if (!P?.half) r4.lines.push(`절반 팔 선은 안 적어서 기본 약속으로 셌어: 산 값의 120%는 ${won(half)}.`);
  if (!p) { r4.c = 'u'; r4.lines.push('? 오늘 값을 못 받아 거리를 못 셌어.'); }
  else {
    if (p <= sell) { r4.c = 'r'; r4.past = true; r4.lines.push(p === sell ? `${who} 팔 선(${won(sell)})에 닿았어.` : `${who} 팔 선(${won(sell)})을 지났어. 오늘 값이 팔 선보다 ${one((sell - p) / sell * 100)}% 아래야.`); }
    else { const d = (p - sell) / p * 100; r4.c = d <= NEAR + 1e-9 ? 'r' : 'g'; r4.lines.push(`${who} 팔 선까지 ${one(d)}% 남았어. 한 주에 ${won(p - sell)}이야.`); }
    if (half > 0) r4.lines.push(p >= half ? `${whoH} 절반 팔 선(${won(half)})에 닿았어.` : `${whoH} 절반 팔 선(${won(half)})까지 ${one((half - p) / p * 100)}% 남았어.`);
  }
  // ⑤ 한 곳에 몰렸나
  const SH = S.shares, me = SH.by.get(code), mi = SH.ind.get(A.ind ?? '?') ?? 0;
  const r5 = {n: '⑤ 한 종목, 한 업종 몫이 큰가', k: '몫', c: 'q', lines: []};
  if (me && SH.tot > 0) {
    const b1 = big(me.v, SH.tot), b2 = big(mi, SH.tot);
    r5.c = b1 || b2 ? 'y' : 'g';
    r5.lines.push(`이 종목 몫 ${pctOf(me.v, SH.tot)} · ${A.ind ?? '?'} 업종 몫 ${pctOf(mi, SH.tot)}.` + (b1 || b2 ? ' 셋에 하나보다 커.' : ''));
  } else r5.lines.push('? 몫을 셀 수 없어.');
  A.items = [r1, r2, r3, r4, r5];
  A.red = r1.c === 'r' || r4.c === 'r';
  const ys = A.items.filter(x => x.c === 'y').map(x => x.k), us = A.items.filter(x => x.c === 'u').map(x => x.k);
  A.color = A.red ? 'r' : ys.length || us.length ? 'y' : 'g';
  A.badge = A.red ? null : ys.length || us.length ? '🟡 ' + [...(ys.length ? [ys.length > 1 ? `${ys.length}가지 흔들림` : '하나 흔들림', ...ys] : []), ...(us.length ? ['셀 수 없음', ...us] : [])].join(' · ') : COLOR_NAME.g;
  A.redWhy = [...(r4.c === 'r' ? [r4.past ? '팔 선 지남' : '팔 선 가까움'] : []), ...(r1.c === 'r' ? ['산 이유 없어짐'] : [])];
  A.sure = A.red || (!!p && !(r1.gatesNeeded && r1.c === 'u')); // 🔴 아님이 확실할 때만 참은 날을 풂(값 · 문을 못 받은 날은 그대로 둠)
  return A;
}

/** 첫 문 색 기억 · 참은 날 — 그리기 전에(바뀐 것이 있으면 저장) */
function track(S, mkt, G) {
  let ch = false;
  for (const o of S.all) {
    if (!isActive(o) || !mkt?.companies?.[o.code]) continue;
    const gv = gateRow(G, o.code);
    if (gv && (!o.g0 || o.g0.ver !== (G?.version ?? null))) { o.g0 = {d: G.asOf ?? null, ver: G?.version ?? null, v: gv.slice(0, 6)}; ch = true; }
    const A = assess(o, S, mkt, G);
    if (A.red && !o.red?.from) { o.red = {from: S.day}; ch = true; }
    else if (!A.red && A.sure && o.red) { o.red = null; ch = true; }
  }
  if (ch) save(S);
}

/* 그리기 */
const dot = c => h('span', {class: 'hd-dot hd-c' + c, 'aria-hidden': 'true'});
function itemEl(x, o, S, redraw) {
  const el = h('div', {class: 'hd-it hd-i' + x.c}, h('h4', {class: 'hd-in'}, dot(x.c), h('span', {text: x.n})));
  if (x.gates) {
    const ul = h('ul', {class: 'hd-gates'});
    GATES.forEach((n, i) => { const v = x.gates[i]; ul.append(h('li', {class: 'hd-g hd-g' + (v === 1 ? 'g' : v === 0 ? 'r' : 'q')}, dot(v === 1 ? 'g' : v === 0 ? 'r' : 'q'), h('span', {text: n}), h('b', {text: v === 1 ? '지남' : v === 0 ? '못 지남' : '?'}))); });
    el.append(ul);
  }
  if (x.why != null) el.append(h('p', {class: 'hd-mine'}, h('span', {class: 'hd-mk', text: '네가 적은 「1년 뒤 반토막 났다면 왜?」 '}), h('q', {'data-proper': '', lang: /[가-힣]/.test(x.why) ? 'ko' : null, text: x.why})));
  for (const t of x.lines) el.append(h('p', {class: 'hd-line', text: t}));
  if (x.why != null) {
    const b = h('button', {class: 'hd-tog', type: 'button', 'aria-pressed': String(!!o.doom), text: o.doom ? '나타났어 · 다시 누르면 풀림' : '나타났어'});
    b.addEventListener('click', () => { o.doom = o.doom ? null : {at: new Date().toISOString()}; save(S); redraw(); });
    el.append(b);
  }
  if (x.promise) el.append(h('p', {class: 'hd-mine'}, h('span', {class: 'hd-mk', text: '네가 적은 약속 '}), h('q', {'data-proper': '', text: x.promise})));
  if (x.link) el.append(h('a', {class: 'hd-link', href: x.link[0], text: x.link[1]}));
  return el;
}

function sellForm(o, S, redraw) {
  const f = h('form', {class: 'hd-form', 'aria-label': '판 것 적기', novalidate: true}), err = h('p', {class: 'hd-err', role: 'alert'});
  const d = h('input', {class: 'hd-in-d', type: 'date', value: S.day, min: dayOf(o.day), max: S.day, 'aria-label': '판 날'});
  const pr = h('input', {class: 'hd-in-n num', type: 'text', inputmode: 'decimal', autocomplete: 'off', 'aria-label': '판 값(원)', placeholder: S.px.get(o.code)?.p ? Number(S.px.get(o.code).p).toLocaleString('ko-KR') : '예: 10,000'});
  const q = h('input', {class: 'hd-in-n num', type: 'text', inputmode: 'decimal', autocomplete: 'off', 'aria-label': '판 수량(주)', value: String(o.qty)});
  f.append(h('label', {class: 'hd-lab'}, h('span', {text: '판 날'}), d), h('label', {class: 'hd-lab'}, h('span', {text: '판 값(원)'}), pr), h('label', {class: 'hd-lab'}, h('span', {text: '판 수량(주)'}), q), err,
    h('div', {class: 'hd-btns'}, h('button', {class: 'hd-go', type: 'submit', text: '지난 보유로 옮기기'}), h('button', {class: 'hd-no', type: 'button', text: '닫기', onclick: () => { S.sell = null; redraw(); }})));
  f.addEventListener('submit', e => {
    e.preventDefault();
    const sd = dayOf(d.value), sp = numIn(pr.value), sq = numIn(q.value), qty = Number(o.qty);
    if (!sd || sd < dayOf(o.day) || sd > S.day) { err.textContent = '판 날은 산 날과 오늘 사이여야 해.'; return; }
    if (!(sp > 0)) { err.textContent = '판 값을 숫자로 적어 줘.'; return; }
    if (!(sq > 0) || sq > qty) { err.textContent = `판 수량은 0보다 크고 ${qtyTxt(qty)} 이하여야 해.`; return; }
    const sold = {day: sd, price: sp, at: new Date().toISOString()};
    if (sq < qty) { // 나눠 판 것 — 판 몫은 새 줄로 「지난 보유」에 · 남은 몫은 그대로(어느 것도 지우지 않음)
      S.all.push({id: newId(), code: o.code, name: o.name, buy: o.buy, qty: sq, day: o.day, at: o.at, from: o.id, sold});
      o.qty = Math.round((qty - sq) * 1e6) / 1e6;
    } else o.sold = sold;
    S.sell = null; save(S); NX.toast?.('지난 보유로 옮겼어요. 지우지 않아요.'); redraw();
  });
  return f;
}
function wrongBox(o, S, redraw) {
  return h('div', {class: 'hd-form', role: 'group', 'aria-label': '잘못 적었어'},
    h('p', {class: 'hd-line', text: '잘못 적은 거면 지난 보유에 「잘못 적음」으로 남겨 둘게. 지우지는 않아.'}),
    h('div', {class: 'hd-btns'},
      h('button', {class: 'hd-go', type: 'button', text: '맞아, 옮겨 줘', onclick: () => { o.wrong = {at: new Date().toISOString()}; S.wrong = null; save(S); redraw(); }}),
      h('button', {class: 'hd-no', type: 'button', text: '아니야', onclick: () => { S.wrong = null; redraw(); }})));
}

/** 보유 한 곳 카드 — 답하기 전 = 이름 · 오늘 값 · 질문만 / 답한 뒤 = 색 · 참은 날 · 산 값과 수익률 · ① ~ ⑤ · 팔았어 · 잘못 적었어 */
function cardOf(o, S, mkt, G, redraw) {
  const A = assess(o, S, mkt, G), code = o.code;
  const card = h('article', {class: 'hd-card', 'data-code': code, 'data-id': o.id ?? ''});
  const nm = A.co ? h('a', {class: 'hd-name', href: '#/w/' + NX.enc(code), 'data-proper': '', text: A.name}) : h('b', {class: 'hd-name', 'data-proper': '', text: A.name});
  card.append(h('p', {class: 'hd-ch'}, nm, h('span', {class: 'hd-meta', text: ` · ${A.co ? (A.ind ?? '?') : A.kind.label} · ${md(dayOf(o.day))}에 산 ${qtyTxt(Number(o.qty))}`})));
  card.append(h('p', {class: 'hd-px'}, ...(A.p ? [h('span', {text: '오늘 값 '}), h('b', {class: 'num', text: won(A.p)}), h('span', {text: ` · ${md(A.pd)} 종가`})] : [h('span', {text: A.co ? '? 오늘 값을 못 받았어.' : '? 오늘 값을 몰라.'})])));
  const ans = o.ask && o.ask.d === S.day && [0, 1, 2].includes(o.ask.a) ? o.ask.a : null;
  if (ans == null) {
    const opts = h('div', {class: 'hd-opts'});
    ASK.forEach((t, k) => opts.append(h('button', {class: 'hd-opt', type: 'button', text: t, onclick: () => {
      o.ask = {d: S.day, a: k, at: new Date().toISOString()};
      o.asks = [...(Array.isArray(o.asks) ? o.asks : []), [S.day, k]].slice(-90); save(S); S.focus = o.id; redraw();
    }})));
    card.append(h('div', {class: 'hd-ask', role: 'group', 'aria-label': '오늘 처음 봤다면 살 거야?'},
      h('h3', {class: 'hd-qh', tabindex: '-1', text: '오늘 처음 봤다면 살 거야?'}),
      h('p', {class: 'hd-qn', text: '산 값은 잠깐 잊고 답해 봐. 답하면 수익률과 점검을 보여 줄게.'}), opts));
    return card;
  }
  const again = h('button', {class: 'hd-again', type: 'button', text: '다시 답하기', onclick: () => { o.ask = null; save(S); redraw(); }});
  card.append(h('p', {class: 'hd-ans', tabindex: '-1'}, h('span', {text: '오늘 답 '}), h('b', {text: ASK[ans]}), again));
  if (!A.co) { // 펀드 · 우선주 등 — 점검 못 하는 까닭(#/x 와 같은 까닭)
    card.append(h('p', {class: 'hd-badge hd-cq'}, h('span', {text: COLOR_NAME.q})),
      h('p', {class: 'hd-line', text: A.kind.text}),
      h('p', {class: 'hd-line', text: `산 값 ${won(Number(o.buy))} · 오늘 값을 몰라 수익률도 못 셌어.`}),
      h('a', {class: 'hd-link', href: NX.ready?.('x') ? '#/x/' + NX.enc(code) : '/atlas/#/x/' + NX.enc(code), text: '왜 셀 수 없나 보기 ›'}));
  } else {
    const badge = A.color === 'r' ? `🔴 ${A.redWhy.join(' · ')}` : A.badge;
    card.append(h('p', {class: 'hd-badge hd-c' + A.color}, h('span', {text: badge})));
    if (A.color === 'r' && o.red?.from) { const n = Math.max(0, daysBetween(o.red.from, S.day)); card.append(h('p', {class: 'hd-endure'}, h('span', {text: '참은 날 '}), h('b', {class: 'num', text: n + '일'}), h('span', {text: n ? ` · 🔴로 처음 본 날 ${md(o.red.from)}` : ' · 오늘 처음 🔴로 봤어'}))); }
    card.append(A.p ? h('p', {class: 'hd-ret'}, h('span', {text: `산 값 ${won(Number(o.buy))} → 오늘 ${won(A.p)} `}), h('b', {class: 'num ' + NX.cls(A.ret), text: NX.pct(A.ret)}), h('span', {class: 'num ' + NX.cls(A.ret), text: ' ' + sWon(A.amt)}))
      : h('p', {class: 'hd-ret'}, h('span', {text: `산 값 ${won(Number(o.buy))} · ? 오늘 값을 못 받아 수익률을 못 셌어.`})));
    for (const x of A.items) card.append(itemEl(x, o, S, redraw));
  }
  const act = h('div', {class: 'hd-act'},
    h('button', {class: 'hd-sold', type: 'button', 'aria-expanded': String(S.sell === o.id), text: '팔았어', onclick: () => { S.sell = S.sell === o.id ? null : o.id; S.wrong = null; redraw(); }}),
    h('button', {class: 'hd-wrong', type: 'button', 'aria-expanded': String(S.wrong === o.id), text: '잘못 적었어', onclick: () => { S.wrong = S.wrong === o.id ? null : o.id; S.sell = null; redraw(); }}));
  card.append(act);
  if (S.sell === o.id) card.append(sellForm(o, S, redraw));
  if (S.wrong === o.id) card.append(wrongBox(o, S, redraw));
  return card;
}

/** 몫 그림 — 종목 몫 · 업종 몫 막대 · 점선 = 셋에 하나(질문 11) · 금빛 = 넘음 */
function sharePic(S) {
  const SH = S.shares; if (!(SH.tot > 0)) return null;
  const rows = (list, label) => h('div', {class: 'hd-bars', role: 'list', 'aria-label': label}, ...list.map(([n, v]) => {
    const fill = h('i', {class: 'hd-fill' + (big(v, SH.tot) ? ' over' : '')}); fill.style.setProperty('width', Math.max(1, Math.min(100, v / SH.tot * 100)).toFixed(2) + '%');
    return h('div', {class: 'hd-bar', role: 'listitem'}, h('span', {class: 'hd-bn', 'data-proper': '', text: n}), h('span', {class: 'hd-track', 'aria-hidden': 'true'}, fill, h('i', {class: 'hd-third'})), h('b', {class: 'num' + (big(v, SH.tot) ? ' gd' : ''), text: pctOf(v, SH.tot)}));
  }));
  const top = (m, k) => { const a = [...m].sort((x, y) => y[1] - x[1] || (x[0] < y[0] ? -1 : 1)); if (a.length <= k) return a; const rest = a.slice(k - 1).reduce((s, x) => s + x[1], 0); return [...a.slice(0, k - 1), [`그 밖 ${a.length - k + 1}곳`, rest]]; };
  const st = top([...SH.by.values()].map(b => [b.name, b.v]), 6), it = top([...SH.ind], 4);
  return h('figure', {class: 'hd-pic'},
    h('figcaption', {class: 'hd-cap', text: '내 몫 그림 · 점선은 셋에 하나'}),
    h('p', {class: 'hd-pk', text: '종목'}), rows(st, '종목 몫'), h('p', {class: 'hd-pk', text: '업종'}), rows(it, '업종 몫'),
    ...(SH.cost ? [h('p', {class: 'hd-note', text: `오늘 값이 없는 ${SH.cost}곳은 산 값으로 셌어요.`})] : []));
}

/** 적기 — 종목 고르기(찾기와 같은 잣대) · 산 값 · 수량 · 산 날 */
function addForm(S, mkt, redraw) {
  const f = h('form', {class: 'hd-form hd-add', 'aria-label': '보유종목 적기', novalidate: true}), err = h('p', {class: 'hd-err', role: 'alert'});
  const qi = h('input', {class: 'hd-in-s', type: 'search', placeholder: '회사 이름이나 번호', 'aria-label': '종목 찾기', autocomplete: 'off', enterkeyhint: 'search'});
  const hits = h('div', {class: 'hd-hits', role: 'list'}), chosen = h('p', {class: 'hd-chosen'});
  const pr = h('input', {class: 'hd-in-n num', type: 'text', inputmode: 'decimal', autocomplete: 'off', 'aria-label': '산 값(원)', placeholder: '예: 10,000'});
  const q = h('input', {class: 'hd-in-n num', type: 'text', inputmode: 'decimal', autocomplete: 'off', 'aria-label': '수량(주)', placeholder: '예: 10'});
  const d = h('input', {class: 'hd-in-d', type: 'date', value: S.day, max: S.day, 'aria-label': '산 날'});
  const showPick = () => {
    if (!S.pick) { chosen.replaceChildren(); qi.hidden = false; return; }
    qi.hidden = true; hits.replaceChildren();
    const M = mkt?.companies?.[S.pick.c];
    chosen.replaceChildren(h('b', {'data-proper': '', text: S.pick.n}), h('span', {text: ' · ' + (M ? (M.i ?? '회사 주식') : '회사 주식 밖')}),
      h('button', {class: 'hd-again', type: 'button', text: '다시 고르기', onclick: () => { S.pick = null; showPick(); qi.focus(); }}));
    if (M) NX.getJson('co/' + S.pick.c + '.json').then(j => { if (j?.c?.price > 0 && !pr.value) pr.placeholder = '오늘 종가 ' + Number(j.c.price).toLocaleString('ko-KR'); });
  };
  let seq = 0;
  qi.addEventListener('input', async () => {
    const my = ++seq, r = await findStock(qi.value); if (my !== seq) return;
    hits.replaceChildren(...r.map(x => h('button', {class: 'hd-hit', type: 'button', role: 'listitem', onclick: () => { S.pick = x; showPick(); pr.focus(); }},
      h('span', {'data-proper': '', text: x.n}), h('small', {text: (mkt?.companies?.[x.c] ? '회사 주식 · ' : '회사 주식 밖 · ') + x.c}))));
    if (!r.length && qi.value.trim()) hits.append(h('p', {class: 'hd-note', text: '찾는 이름이 없어요. 띄어쓰기를 빼거나 번호로도 찾아봐.'}));
  });
  f.append(h('h3', {class: 'hd-fh', text: '보유종목 적기'}), h('label', {class: 'hd-lab'}, h('span', {text: '종목'}), qi), hits, chosen,
    h('label', {class: 'hd-lab'}, h('span', {text: '산 값(원)'}), pr), h('label', {class: 'hd-lab'}, h('span', {text: '수량(주)'}), q), h('label', {class: 'hd-lab'}, h('span', {text: '산 날'}), d), err,
    h('div', {class: 'hd-btns'}, h('button', {class: 'hd-go', type: 'submit', text: '적기'}), h('button', {class: 'hd-no', type: 'button', text: '닫기', onclick: () => { S.add = false; S.pick = null; redraw(); }})));
  f.addEventListener('submit', e => {
    e.preventDefault();
    const bp = numIn(pr.value), bq = numIn(q.value), bd = dayOf(d.value);
    if (!S.pick) { err.textContent = '종목을 먼저 골라 줘.'; return; }
    if (!(bp > 0)) { err.textContent = '산 값을 숫자로 적어 줘.'; return; }
    if (!(bq > 0)) { err.textContent = '수량을 숫자로 적어 줘.'; return; }
    if (!bd) { err.textContent = '산 날을 골라 줘.'; return; }
    if (bd > S.day) { err.textContent = '산 날은 오늘이나 그 전이어야 해.'; return; }
    const o = {id: newId(), code: S.pick.c, name: S.pick.n, buy: bp, qty: bq, day: bd, at: new Date().toISOString()};
    S.all.unshift(o); S.add = false; S.pick = null; S.focus = o.id;
    save(S); NX.toast?.(S.mem ? '이 기기는 기억을 못 해서 이 화면에만 적었어요.' : '적었어요. 이 기기에만 남아요.');
    redraw(true);
  });
  setTimeout(() => { showPick(); if (!S.pick) qi.focus({preventScroll: true}); }, 0);
  return f;
}

/** 지난 보유 — 판 것 · 잘못 적은 것(지우지 않음 · 접힌 칸) */
function pastEl(S, mkt) {
  const list = S.all.filter(isPast);
  if (!list.length) return null;
  list.sort((a, b) => String(b.sold?.day ?? b.wrong?.at ?? '').localeCompare(String(a.sold?.day ?? a.wrong?.at ?? '')));
  return h('details', {class: 'hd-past'}, h('summary', {}, h('span', {text: '지난 보유 '}), h('b', {class: 'num', text: list.length + '곳'})),
    ...list.map(o => {
      const nm = mkt?.companies?.[o.code]?.n ?? o.name ?? o.code;
      if (o.wrong) return h('div', {class: 'hd-prow'}, h('p', {class: 'hd-ch'}, h('b', {'data-proper': '', text: nm}), h('span', {class: 'hd-meta', text: ` · 잘못 적어 뺐어 · ${md(dayOf(o.wrong.at))}`})));
      const r = (Number(o.sold.price) / Number(o.buy) - 1) * 100;
      return h('div', {class: 'hd-prow'}, h('p', {class: 'hd-ch'}, h('b', {'data-proper': '', text: nm}), h('span', {class: 'hd-meta', text: ` · ${md(dayOf(o.day))}에 산 ${qtyTxt(Number(o.qty))} · ${md(o.sold.day)}에 팖`})),
        h('p', {class: 'hd-ret'}, h('span', {text: `산 값 ${won(Number(o.buy))} → 판 값 ${won(Number(o.sold.price))} `}), h('b', {class: 'num ' + NX.cls(r), text: NX.pct(r)})));
    }));
}

/** 색 풀이 · 정한 숫자(접힌 칸) */
const legend = () => h('details', {class: 'hd-leg'}, h('summary', {text: '색은 이렇게 정해요'}),
  h('p', {class: 'hd-line', text: '🟢 그대로: 다섯 가지 모두 흔들린 것이 없어요.'}),
  h('p', {class: 'hd-line', text: '🟡 하나 흔들림: 산 이유가 「그냥」이거나, 처음 적은 날보다 닫힌 문이 있거나, 망할 이유가 나타났다고 골랐거나, 한 종목이나 한 업종이 셋에 하나보다 커요.'}),
  h('p', {class: 'hd-line', text: '🟡 셀 수 없음: 매매일지나 그날 자료가 없어 확인하지 못한 것이 있어요. 「?」로 보여요.'}),
  h('p', {class: 'hd-line', text: `🔴 조심: 팔 선까지 ${NEAR}% 안으로 가깝거나 팔 선을 지났거나, 산 이유가 없어졌어요.`}),
  h('p', {class: 'hd-line', text: '참은 날: 🔴로 처음 본 날부터 센 날이에요. 이 기기에서 연 날로 셌어요.'}),
  h('p', {class: 'hd-line', text: '팔 약속을 안 적었으면 기본 약속으로 셌어요. 산 값의 90%에서 팔고, 120%에서 절반 판다는 약속이에요.'}));

export async function holdSection() {
  const [mkt, G] = await Promise.all([NX.need('mkt'), gatesJson()]);
  const L = load(), S = {all: L.all ?? [], mem: L.all === null, broken: L.broken, day: today(), px: new Map(), names: null, recs: journal(), add: false, sell: null, wrong: null, pick: null, focus: null, shares: null};
  const box = h('section', {class: 'hd', 'aria-label': '보유종목 점검'});
  const prep = async () => { // 회사 주식 오늘 값(co/<번호>.json) · 회사 주식 밖이 있으면 이름표
    const codes = [...new Set(S.all.filter(isActive).map(o => o.code))];
    await Promise.all(codes.filter(c => mkt?.companies?.[c] && !S.px.get(c)).map(c => NX.getJson('co/' + c + '.json').then(j => { S.px.set(c, j?.c?.price > 0 ? {p: Number(j.c.price), d: dayOf(j.c.priceDate)} : null); })));
    if (!S.names && S.all.some(o => valid(o) && !mkt?.companies?.[o.code])) S.names = await NX.getJson('names.json');
  };
  const draw = async (fresh = false) => {
    if (fresh) await prep();
    S.day = today(); S.recs = journal(); S.shares = sharesOf(S, mkt); track(S, mkt, G);
    const act = S.all.filter(isActive);
    const add = h('button', {class: 'hd-add-b', type: 'button', 'aria-expanded': String(S.add), text: S.add ? '보유종목 적기 닫기' : '+ 보유종목 적기', onclick: () => { S.add = !S.add; S.pick = null; draw(); }});
    box.replaceChildren(
      h('div', {class: 'hd-head'}, h('img', {src: '/media/makbi-icon.svg', alt: '', width: 40, height: 40}),
        h('div', {}, h('h2', {class: 'hd-h', text: '보유종목 점검'}), h('p', {class: 'hd-sub', text: '이 기기에만 남아요. 판 것도 지우지 않아요.'}))),
      ...(S.mem ? [h('p', {class: 'hd-q-note'}, h('b', {class: 'gd', text: '? '}), h('span', {text: '이 기기는 기억을 못 해요. 적은 것은 이 화면을 떠나면 없어져요.'}))] : []),
      ...(act.length ? [sharePic(S)].filter(Boolean) : [h('p', {class: 'hd-note', text: '아직 적은 보유종목이 없어요.'})]), // 빈 칸은 짧게(제목 · 한 줄 · 적기) — 아래 사장님 편지가 첫 화면 가까이 오게
      ...act.map(o => cardOf(o, S, mkt, G, () => draw())),
      add, ...(S.add ? [addForm(S, mkt, f => draw(f))] : []),
      ...[pastEl(S, mkt)].filter(Boolean),
      ...(act.length ? [legend(), h('p', {class: 'hd-note', text: `${josa(NAME, '는')} 네가 적은 약속과 오늘 값을 견줄 뿐이에요. 사람마다 맞춰 관리해 주는 일은 정식 투자자문업자만 할 수 있어요.`})] : []));
    if (S.focus) { const id = S.focus; S.focus = null; requestAnimationFrame(() => box.querySelector(`.hd-card[data-id="${CSS.escape(id)}"] .hd-ans, .hd-card[data-id="${CSS.escape(id)}"] .hd-qh`)?.focus?.({preventScroll: false})); }
  };
  await draw(true);
  return box;
}

export async function render() {
  return {title: '보유종목', nodes: [await holdSection()]};
}
