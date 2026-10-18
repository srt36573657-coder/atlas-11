/* 보유종목 점검 — 사장님 2026-10-17(싱가포르) 21:10 「고도리 · 하나로 묶은 명령문」 [5] 1 ~ 3 · 5 ~ 10(일 나누기 docs/design/godori-2026-10-17/brief2.md · 일꾼 D)
   render() = 「보유종목」 탭(#/me) 맨 위 칸 · 종목 · 산 값 · 수량 · 산 날은 이 기기에만(atlas:godori-hold · try/catch · 막히면 이 화면에만)
   판 것은 지우지 않고 판 날 · 판 값을 적어 「지난 보유」로([5] 2) · 잘못 적은 것도 지우지 않고 「잘못 적음」으로 옮김
   첫 질문 「오늘 처음 봤다면 살 거야?」 — 답한 뒤에만 산 값 · 수익률 · 색 · 다섯 가지(본전 생각을 끊으려고 · [5] 3) · 서울 날짜가 바뀌면 다시 물음
   다섯 가지(중요한 차례 · [5] 5 · 6): ① 산 이유가 살아 있나 — 매매일지(atlas:godori-why)에서 그 회사 마지막 기록의 3번 답: 「돈을 잘 번다」→ 오늘 문 1 · 「클 일이 있다」→ 적은 날 지났나 · 「그냥」→ 🟡
     ② 다섯 문 오늘 색(/next/data/gates.json · 처음 적은 날 색과 견줘 닫힌 문이 생기면 🟡) ③ 망할 이유(매매일지 ① 줄 · 나타났는지 스스로 고름)
     ④ 팔 약속까지 남은 거리(내 약속과 견줌만 — 개인별 관리는 정식 투자자문업자만 · [5] 8) ⑤ 한 종목 · 한 업종 몫(셋에 하나 넘음 — 질문 11 「세 곳 이상」)
   색([5] 7): 🔴 팔 선 3% 안 · 지남 · 산 이유 없어짐 > 🟡 하나라도 흔들림 > 🟢 그대로 · 🔴 동안 넘긴 날 = 참은 날([5] 10 · 이 기기에서 본 날로 셈)
   펀드 · 우선주 등은 점검 못 하는 까닭(#/x 와 같은 까닭 — 회사 주식이 아님 · [5] 9) · 이름은 brand.js 한 곳(규칙 76) · 글은 textContent 로만(보안 규칙) */
import {NAME, NAME_EN, josa} from './brand.js';
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
  return {label, text: `${label} — 회사 주식이 아니라 조건 다섯을 셀 수 없어요.`};
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
  const rec = recOf(code, S.recs), gv = gateRow(G, code), day = S.day, gd = md(G?.asOf); // gd = 다섯 문을 센 날(gates.json asOf — 사이트 값 날보다 앞설 수 있음)
  // ① 산 이유가 살아 있나
  const r1 = {n: '① 산 이유가 살아 있나', k: '산 이유', c: 'u', lines: [], link: null, gatesNeeded: false}; // u = 셀 수 없음(🟡 · 흔들림이라 부르지 않음)
  if (!rec) { r1.lines.push('? 이 회사로 적은 매매일지가 없어. 산 이유를 적어 두면 여기서 맞대 볼게.'); r1.link = ['#/why/' + NX.enc(code), '이 회사로 왜 사? 적기 ›']; }
  else {
    const t = Date.parse(rec.at), c = q3Of(rec), from = Number.isFinite(t) ? new Date(t + 9 * 36e5).toISOString().slice(0, 10) : dayOf(rec.day); // 매매일지를 쓴 날(서울) — day 는 그날 값의 날
    if (from) r1.lines.push(`${md(from)} 매매일지에서 읽었어.`);
    if (c === 'g') {
      r1.gatesNeeded = true;
      if (!gv || gv[0] !== 0 || gv[1] == null) r1.lines.push(G?.asOf ? `「${Q3.g}」 — ? ${gd} 자료로 문 1(이익 늘었나)을 셀 수 없어.` : `「${Q3.g}」 — ? 문 1(이익 늘었나)을 셀 수 없어.`);
      else if (gv[1] === 1) { r1.c = 'g'; r1.lines.push(`「${Q3.g}」 — ${gd} 자료로도 문 1(이익 늘었나)을 지나.`); }
      else { r1.c = 'r'; r1.gone = true; r1.lines.push(`「${Q3.g}」 — ${gd} 자료로 문 1(이익 늘었나)을 못 지나. 산 이유가 없어졌어.`); }
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
  const r2 = {n: '② 조건 다섯의 오늘 색', k: '문 색', c: 'u', lines: [], gates: gv ? gv.slice(1, 6) : null, x: gv ? gv[0] : null};
  if (G?.asOf) {
    r2.lines.push(`${gd} 종가로 센 색이에요.`);
    if (NX.D?.mkt?.asOf && G.asOf < NX.D.mkt.asOf) r2.lines.push({q: `사이트 자료는 ${md(NX.D.mkt.asOf)}까지라 지금 색과 다를 수 있어요.`}); // p-gdr .gdr-stale 와 같은 잣대
  }
  if (!gv) r2.lines.push(G ? `? ${gd} 자료에 이 회사 문 색이 없어.` : '? 오늘 문 색을 아직 못 받았어.');
  else {
    if (gv[0] === 1) r2.lines.push('거래가 너무 적어 문을 안 셌어.');
    else if (gv[0] === 2) r2.lines.push('거래가 멈춘 것 같아 문을 안 셌어.');
    const b = o.g0 && Array.isArray(o.g0.v) && o.g0.ver === (G?.version ?? null) ? o.g0 : null;
    const shut = b ? GATES.filter((_, i) => b.v[i + 1] === 1 && gv[i + 1] === 0) : [];
    const outNow = b ? b.v[0] === 0 && gv[0] > 0 : false, nul = gv[0] === 0 ? GATES.filter((_, i) => gv[i + 1] == null) : [];
    if (nul.length) r2.lines.push(`? ${gd} 자료로 셀 수 없는 문: ${nul.join(' · ')}.`); // 그 문에 쓸 값이 없음 — 「?」(빨강 아님 · 흔들림 아님)
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
  for (const t of x.lines) el.append(typeof t === 'string' ? h('p', {class: 'hd-line', text: t}) : h('p', {class: 'hd-line'}, h('b', {class: 'gd', text: '? '}), h('span', {text: t.q})));
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
  card.append(h('p', {class: 'hd-ch'}, nm, h('span', {class: 'hd-meta', text: `${A.co ? (A.ind ?? '?') : A.kind.label} · ${md(dayOf(o.day))}에 산 ${qtyTxt(Number(o.qty))}`})));
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
    save(S); NX.toast?.(S.mem ? '이 기기는 기억을 못 해서 이 화면에만 적었어요.' : memberNow() ? '적었어요. 카카오로 지켜요.' : '적었어요. 이 기기에만 남아요.');
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
      if (o.wrong) return h('div', {class: 'hd-prow'}, h('p', {class: 'hd-ch'}, h('b', {'data-proper': '', text: nm}), h('span', {class: 'hd-meta', text: `잘못 적어 뺐어 · ${md(dayOf(o.wrong.at))}`})));
      const r = (Number(o.sold.price) / Number(o.buy) - 1) * 100;
      return h('div', {class: 'hd-prow'}, h('p', {class: 'hd-ch'}, h('b', {'data-proper': '', text: nm}), h('span', {class: 'hd-meta', text: `${md(dayOf(o.day))}에 산 ${qtyTxt(Number(o.qty))} · ${md(o.sold.day)}에 팖`})),
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
        h('div', {}, h('h2', {class: 'hd-h', text: '보유종목 점검'}), subNote())),
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

/* ═══ 보유종목 쪽 아래쪽 · 관심 소식 — 사장님 2026-10-18(싱가포르) 「72개와 카톡 두 번 가입」 [7] 7 ~ 9 · [4] 4 · 5 · 9 (일 나누기 docs/design/godori-2026-10-18/brief5.md · 일꾼 S5h · 잣대 accept/S5h.md)
   foldLetter(lw) = 편지 칸을 첫 화면 ⅓ 높이로 접고 「펼치기」(눌러야 다 보임) · shortcuts() = 바로 가기 내 것만(편지 여는 밤 · 기록 파일로 받기 · 가입한 사람만 탈퇴 두 번) · keepNote() = 지킴 글 한 줄
   news(X, keys) = 관심 소식 줄(담은 업종 · 큰 업종의 뽑힘 · 옮김 · 빠짐 · 오늘 가장 많이 움직인 곳 — 날짜 새 것 먼저 · 자료 surgetr.json 그대로)
   카카오는 늘 NX.kakao?.… 로만 부름 — 없거나 on === false 면 가입 안 한 꼴 · 기록 파일(exportFile)은 늘 됨 · 글은 textContent 로만 */
const KAKAO_KEEP = '카카오로 지켜요.', DEVICE_ONLY = '이 기기에만 남아요. 이름도 열쇠도 받지 않아요.', IPHONE_LINE = '아이폰은 7일 동안 안 열면 기록이 지워질 수 있어요.';
const KEYS4 = ['atlas:godori-why', 'atlas:new:sub', 'atlas:new:later', 'atlas:godori-hold']; // 이 기기 기록 넷(카카오 서버 맞추기와 같은 넷 · 내 돈 칸 atlas:godori-money 는 넣지 않음 — [9] 4)
const kakao = () => { try { return globalThis.NX?.kakao ?? null; } catch { return null; } };
const say = m => { try { globalThis.NX?.toast?.(m); } catch { /* 알림 못 띄움 */ } };
/** 가입한 사람인가 — NX.kakao 가 없거나 꺼졌으면(on === false) 아니다 */
export function memberNow() { try { const K = kakao(); return !!(K && K.on !== false && typeof K.member === 'function' && K.member()); } catch { return false; } }

/* 가입 여부가 바뀌면 다시 쓰는 글(지킴 글 · 바로 가기) — 쪽을 떠난 것은 저절로 버림 */
const live = new Set();
function watch(node, paint) { const w = {node, paint, seen: false}; live.add(w); if (live.size > 40) for (const x of live) if (!x.seen && x !== w) { live.delete(x); break; } paint(); return node; }
function repaint() { for (const w of [...live]) { if (w.node.isConnected) w.seen = true; else if (w.seen) { live.delete(w); continue; } try { w.paint(); } catch { live.delete(w); } } }
try { addEventListener('nx:kakao', repaint); } catch { /* 창 아님 */ }
/** 점검 칸 머리 글 — 가입 안 함 「이 기기에만 …」 · 가입함 「카카오로 지켜요. …」([4] 4) */
function subNote() { const p = h('p', {class: 'hd-sub'}); return watch(p, () => { p.textContent = memberNow() ? KAKAO_KEEP + ' 판 것도 지우지 않아요.' : '이 기기에만 남아요. 판 것도 지우지 않아요.'; }); }
/** 관심 쪽 머리 글 한 줄 — 끝 말만 가입 여부를 따라감(가입 안 함 「이 기기에만 남아요.」 · 가입함 「카카오로 지켜요.」 · 나중에 가입해도 다시 그림) */
export function liveNote(p, build) { return watch(p, () => { p.textContent = build(memberNow() ? KAKAO_KEEP : '이 기기에만 남아요.'); }); }
/** 본 기록 아래 지킴 글 한 줄([4] 4) — 가입 안 함 = 옛 문장 그대로 · 가입함 = 「카카오로 지켜요.」 */
export function keepNote() { const p = h('p', {class: 'note hd-keep'}); return watch(p, () => { p.textContent = memberNow() ? KAKAO_KEEP : DEVICE_ONLY; }); }

/* [7] 8 편지 접기 — 편지 칸(1,100px 넘음)을 첫 화면 ⅓ 높이로 접고 「펼치기」를 누르면 다 보임 · 편지 글은 손대지 않음(감싸기만) · 접힌 동안 편지를 누르면 펼침(바로 소개 쪽으로 튀지 않음) */
let foldN = 0;
export function foldLetter(lw) {
  if (!lw?.matches) return lw;
  if (!lw.id) lw.id = 'hd-letter-' + ++foldN;
  lw.classList.add('hd-lw'); // 편지 간격 고침(p-hold.css 「이 화면의 편지 간격」) — 접힘 · 펼침 모두 · 감싸기를 풀어도 따라감
  const lab = h('span', {text: '펼치기'}), btn = h('button', {class: 'hd-fold-b', type: 'button', 'aria-expanded': 'false', 'aria-controls': lw.id}, lab, h('i', {class: 'hd-fold-c', 'aria-hidden': 'true'}));
  const wrap = h('div', {class: 'hd-fold', 'data-open': 'false'}, lw, btn);
  const set = on => { wrap.setAttribute('data-open', String(on)); btn.setAttribute('aria-expanded', String(on)); lab.textContent = on ? '접기' : '펼치기'; };
  btn.addEventListener('click', () => { const on = wrap.getAttribute('data-open') !== 'true'; set(on); if (!on) { const r = wrap.getBoundingClientRect(); if (r.top < 0) wrap.scrollIntoView({block: 'start'}); } });
  wrap.addEventListener('click', e => { if (wrap.getAttribute('data-open') === 'true') return; if (e.target?.closest?.('a.m4-letter')) { e.preventDefault(); set(true); } });
  return wrap;
}

/* [4] 5 기록 파일 — 이 기기 기록 넷을 파일 하나로(망 요청 0 · 지우지 않음) · 카카오 쪽 exportFile 이 있으면 그것 · 없거나 못 하면 여기서 만듦 */
function exportLocal() {
  const keys = {}; let blocked = false;
  for (const k of KEYS4) { try { const raw = localStorage.getItem(k); if (raw == null) continue; try { keys[k] = JSON.parse(raw); } catch { keys[k] = raw; } } catch { blocked = true; } }
  const now = new Date(), file = {schema: 'godori-device-records-1', exportedAt: now.toISOString(), keys}; // 꼴 · 파일 이름은 kakao.js exportFile 과 같음(어느 쪽이 만들어도 한 꼴)
  const url = URL.createObjectURL(new Blob([JSON.stringify(file, null, 1)], {type: 'application/json'}));
  const a = document.createElement('a'); a.href = url; a.download = `${NAME_EN.toLowerCase()}-records-${now.toISOString().slice(0, 10)}.json`; a.rel = 'noopener'; a.hidden = true; document.body.append(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 5000);
  return {blocked, n: Object.keys(keys).length};
}
async function saveRecords() {
  const K = kakao();
  try {
    if (K && typeof K.exportFile === 'function') { const r = await K.exportFile(); if (r === false) throw new Error('exportFile 이 false'); say('기록 파일을 받았어요.'); return; }
  } catch { /* 아래에서 여기서 만듦 */ }
  try { const r = exportLocal(); say(r.blocked ? '이 기기는 기억을 못 해서 받을 기록이 없어요.' : '기록 파일을 받았어요.'); } catch { say('기록 파일을 만들지 못했어요. 잠시 뒤 다시 눌러 주세요.'); }
}

/* [7] 9 바로 가기 내 것만 · [4] 5 · [4] 9 — 편지 여는 밤 · 기록 파일로 받기 · (가입한 사람만) 탈퇴(누름 → 묻기 → 누름 = 두 번) */
export function shortcuts() {
  const box = h('div', {class: 'lst hd-sc'});
  let asking = false, busy = false, err = '';
  const draw = (focus = null) => {
    const dl = h('button', {class: 'hd-sc-dl', type: 'button'}, '기록 파일로 받기', h('span', {'aria-hidden': 'true', text: '↓'}));
    dl.addEventListener('click', () => { saveRecords(); });
    const rows = [h('a', {href: '/letter.html'}, '편지 여는 밤', h('span', {text: '›'})), h('p', {class: 'hd-sc-n', text: IPHONE_LINE}), dl];
    let wd = null, q = null;
    if (memberNow()) {
      wd = h('button', {class: 'hd-sc-wd', type: 'button', 'aria-expanded': String(asking)}, '탈퇴', h('span', {text: '›'}));
      wd.addEventListener('click', () => { if (busy) return; asking = !asking; err = ''; draw(asking ? 'q' : 'wd'); });
      rows.push(wd);
      if (asking) {
        q = h('p', {class: 'hd-wd-q', tabindex: '-1', text: '탈퇴하면 서버에 둔 내 기록 사본을 지우고 카카오 연결을 끊어요. 이 기기의 기록은 그대로 남아요.'});
        const go = h('button', {class: 'hd-go', type: 'button', text: '탈퇴하기'}), no = h('button', {class: 'hd-no', type: 'button', text: '그만두기'});
        no.addEventListener('click', () => { if (busy) return; asking = false; err = ''; draw('wd'); });
        go.addEventListener('click', async () => {
          if (busy) return; busy = true; go.disabled = true; no.disabled = true;
          let ok = false; const K = kakao();
          if (K && typeof K.withdraw === 'function') { try { ok = (await K.withdraw()) !== false; } catch { ok = false; } }
          busy = false;
          if (ok) { asking = false; err = ''; say('탈퇴했어요. 서버 사본을 지웠어요.'); repaint(); draw(); }
          else { err = '탈퇴를 마치지 못했어요. 잠시 뒤 다시 눌러 주세요.'; draw('q'); }
        });
        rows.push(h('div', {class: 'hd-wd', role: 'group', 'aria-label': '탈퇴 확인'}, q, ...(err ? [h('p', {class: 'hd-err', role: 'alert', text: err})] : []), h('div', {class: 'hd-btns'}, go, no)));
      }
    }
    box.replaceChildren(...rows);
    if (focus === 'q') q?.focus({preventScroll: true}); else if (focus === 'wd') wd?.focus({preventScroll: true});
  };
  watch(box, () => draw());
  return [h('h2', {class: 'sec', text: '바로 가기'}), box];
}

/* [7] 7 관심 소식 줄 — 담은 업종 · 큰 업종마다: 급등 달력(surgetr.json · tr-v1)의 뽑힘 · 다시 뽑힘 · 옮김 · 빠짐 한 곳 한 줄 + 오늘 가장 많이 움직인 곳 한 줄 · 날짜 새 것 먼저
   같은 곳이 담은 곳 둘에 들면 줄은 한 번(먼저 담은 곳 이름) · 오늘 가장 많이 움직인 곳은 담은 곳마다 한 줄 · 자료를 못 받으면 「?」 한 줄(오늘 줄은 그대로) */
const NEWS_SHOW = 4; // 처음 보이는 줄(나머지는 「나머지 n줄 보기」 안)
const TR_BOX = {'1': '10%대로', '2': '20%대로', '3': '30%대로', '4': '40% 이상으로'};
const KIND = {mov: ['오늘 가장 많이 움직인 곳', 0], sel: ['뽑힘', 1], re: ['다시 뽑힘', 2], mv: ['옮김', 3], out: ['빠짐', 4]};
const trOk = T => !!(T && T.version === 'tr-v1' && dayOf(T.asOf) && Array.isArray(T.days) && Array.isArray(T.cases) && T.days.every(x => x && dayOf(x.d)));
export async function news(X, ks) {
  if (!X || !Array.isArray(ks) || !ks.length) return null;
  const chans = [];
  for (const k of ks) {
    const g = k.startsWith('g:'), ch = g ? X.grp?.get(k.slice(2)) : X.ind?.get(k.slice(2)); if (!ch) continue;
    const mem = g ? (ch.inds || []).flatMap(n => X.ind?.get(n)?.members || []) : ch.members || [];
    chans.push({k, label: g ? '큰 업종 ' + ch.name : ch.name + ' 업종', set: new Set(mem.filter(c => X.co?.[c])), at: chans.length});
  }
  if (!chans.length) return null;
  const T0 = await NX.getJson('surgetr.json'), T = trOk(T0) ? T0 : null;
  const owner = new Map(); for (const c of chans) for (const code of c.set) if (!owner.has(code)) owner.set(code, c);
  const first = new Map(); if (T) for (const r of T.cases) if (Array.isArray(r)) first.set(r[0] + '|' + r[2], r[3]); // 뽑힌 날 칸 = 처음 뽑힌 날과 같을 때만
  const ev = [];
  if (T) for (const day of T.days) {
    const d = dayOf(day.d), push = (code, kind, box) => { const c = owner.get(code); if (c) ev.push({d, code, kind, box: TR_BOX[box] ? box : null, ch: c}); };
    for (const code of day.sel ?? []) push(code, 'sel', first.get(code + '|' + d));
    for (const e of day.re ?? []) push(e?.[0], 're', e?.[1]);
    for (const e of day.mv ?? []) push(e?.[0], 'mv', e?.[1]);
    for (const code of day.out ?? []) push(code, 'out', null);
  }
  const seen = new Set(), uniq = ev.filter(e => { const key = e.d + '|' + e.code + '|' + e.kind; if (seen.has(key)) return false; seen.add(key); return true; });
  for (const c of chans) { // 오늘 가장 많이 움직인 곳(담은 곳마다 한 줄 · 값이 이상한 회사는 뺌)
    let top = null;
    for (const code of c.set) { const o = X.co[code]; if (!o || NX.odd(o.l)) continue; const v = NX.dayOf(o.l); if (v != null && (!top || Math.abs(v) > Math.abs(top.v))) top = {code, v}; }
    if (top && dayOf(X.mkt?.asOf)) uniq.push({d: dayOf(X.mkt.asOf), code: top.code, kind: 'mov', pct: top.v, ch: c});
  }
  uniq.sort((a, b) => (a.d < b.d ? 1 : a.d > b.d ? -1 : 0) || KIND[a.kind][1] - KIND[b.kind][1] || a.ch.at - b.ch.at || String(X.co[a.code].n).localeCompare(String(X.co[b.code].n), 'ko') || (a.code < b.code ? -1 : 1));
  const rowEl = e => {
    const o = X.co[e.code];
    const head = [h('b', {class: 'sb-nm', text: o.n}), e.kind === 'mov' ? h('b', {class: 'num sb-p ' + NX.cls(e.pct), text: NX.pct(e.pct)}) : h('span', {class: 'sb-k sb-' + e.kind, text: KIND[e.kind][0]})];
    const sub = [md(e.d), e.ch.label, ...(e.kind === 'mov' ? [KIND.mov[0]] : []), ...(e.box ? [TR_BOX[e.box]] : [])];
    return h('a', {class: 'sb-n', href: '#/w/' + NX.enc(e.code), 'data-kind': e.kind, 'data-d': e.d}, h('span', {class: 'sb-h'}, ...head), h('small', {class: 'sb-s', text: sub.join(' · ')}));
  };
  const sec = h('section', {class: 'sb', 'aria-labelledby': 'sb-h'}, h('h2', {class: 'sec', id: 'sb-h', text: '소식'}));
  sec.append(h('p', {class: 'note', text: T ? `급등 달력의 뽑힘 · 옮김 · 빠짐이에요. ${md(dayOf(T.asOf))} 기록까지 셌어요.` : '? 소식 자료를 못 받았어요. 오늘 많이 움직인 곳만 보여요.'}));
  if (!uniq.length) { sec.append(h('p', {class: 'note', text: '담은 곳에는 아직 뽑힘 · 옮김 · 빠짐 소식이 없어요.'})); return sec; }
  const list = h('div', {class: 'sb-list'}, ...uniq.slice(0, NEWS_SHOW).map(rowEl));
  sec.append(list);
  if (uniq.length > NEWS_SHOW) { // 나머지는 처음 펼칠 때 그림(큰 업종은 수백 줄이라 열기 전에는 만들지 않음)
    const rest = h('div', {class: 'sb-list'}), det = h('details', {class: 'sb-rest'}, h('summary', {text: `나머지 ${uniq.length - NEWS_SHOW}줄 보기`}), rest);
    det.addEventListener('toggle', () => { if (det.open && !rest.firstChild) rest.append(...uniq.slice(NEWS_SHOW).map(rowEl)); });
    sec.append(det);
  }
  return sec;
}
