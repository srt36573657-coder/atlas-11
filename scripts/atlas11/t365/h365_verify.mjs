#!/usr/bin/env node
// 힘 붙은 365곳(h365-v1) 따로 세기 — h365.py(파이썬)와 다른 길(노드 · 모음 원본 + 이어 받은 일봉 + 앞 회차 기록에서 처음부터)로 다시 골라 proposal.json 과 맞댐
//   사장님 2026-10-13 13:04 「매번 업데이트 할때 365개 종목기준을 힘이 붙는 종목으로 기준을 변경한다 … cia팀이 중심이 되서 나머지팀은 협력하여 기횓한후 알트라스에 적용시킨다」
//   쓰는 법(저장소 맨 위에서): node scripts/atlas11/t365/h365_verify.mjs <후보 표 now.json(dump.mjs)> <proposal.json> [결과 = reports/atlas11/verify/h365-verify-latest.json]
//   이어 받은 일봉 폴더 = 환경 변수 ATLAS_T365_CLOSES · 앞 회차 기록 = 환경 변수 ATLAS_H365_PREV(roll.mjs 가 h365.py 에 넘긴 것과 같은 파일)
//   맞대는 것: ① 고르는 날 · 달력 · 원문(이어 받은 파일 수 · 붙인 값 수 · 지난 값이 다른 회사 · 앞 회차 지문) ② 기본 문(따로 짠 문 · 문마다 빠진 수)
//             ③ 회사마다 21점 · 「?」 까닭(gap · break · vol0) · h1 · h2 · d · 20거래일 ④ 「힘 붙음」 수 · 다 들어갔는지 · 남김 · 채움 · 365 · 안 + 밖 = 후보
//             ⑤ 차례(채운 곳의 d ≥ 자리가 차 빠진 곳의 d · 남김은 앞 회차 365곳 안 · 오늘 450번째 안) ⑥ 업종(group365Of)이 큰 갈래 표에 모두 있음 ⑦ 밖 회사마다 멈춘 곳 · 까닭 글
//   틀린 것이 하나라도 있으면 끝 코드 1
import fs from 'node:fs';
import zlib from 'node:zlib';
import path from 'node:path';
import crypto from 'node:crypto';
import {group365Of} from '../../../lib/atlas11/universe.mjs';
const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '../../..');
const [candsPath, propArg, outArg] = process.argv.slice(2);
if (!candsPath || !propArg) { console.error('쓰는 법: node scripts/atlas11/t365/h365_verify.mjs <now.json> <proposal.json> [결과]'); process.exit(2); }
const J = f => JSON.parse(fs.readFileSync(f, 'utf8'));
const N = J(path.resolve(candsPath)), pro = J(path.resolve(propArg));
const outFile = path.resolve(ROOT, outArg ?? 'reports/atlas11/verify/h365-verify-latest.json');
const bundle = JSON.parse(zlib.gunzipSync(fs.readFileSync(path.join(ROOT, 'reports/atlas11/universe/2026-10-10/bundle.json.gz'))).toString('utf8'));
const calBase = [...new Set([...J(path.join(ROOT, 'public/data/input.json')).calendar.sessions, ...(fs.existsSync(path.join(ROOT, 'public/data/rolling-calendar.json')) ? J(path.join(ROOT, 'public/data/rolling-calendar.json')).sessions ?? [] : [])])].sort();
const bad = []; let checks = 0;
const same = (a, b, what) => { checks++; if (JSON.stringify(a) !== JSON.stringify(b)) bad.push({what, got: a, want: b}); };
const near = (a, b, what) => { checks++; if (a == null || b == null ? a !== b : Math.abs(a - b) > 1e-12 * Math.max(1, Math.abs(b))) bad.push({what, got: a, want: b}); };
const truth = (ok, what, got) => { checks++; if (!ok) bad.push({what, got}); };
const cmp = (a, b) => (a < b ? -1 : a > b ? 1 : 0);
const VERSION = 'h365-v1', WIN = 20, MID = 10, TURN = 0.03, LIMIT = 0.305, BUF = 450, PICK = 365;

// 기본 문 — rules.py 를 읽지 않고 따로 짬(같은 뜻 · 같은 글)
const FIN = new Set(['은행', '증권', '생명보험', '손해보험', '카드', '기타금융', '창업투자']), ORDER = new Set(['조선', '우주항공과국방']);
const nz = s => String(s ?? '').replaceAll(' ', '');
function gateFail(r) {
  const m = r.metrics ?? {}, fin = FIN.has(nz(r.sector));
  if ((r.capEok ?? 0) < 1000) return '시가총액 1,000억 원 미만';
  if ((r.px?.n ?? 0) < 260) return '주가 기록 1년 미만';
  if ((r.px?.atvEok ?? 0) < 3) return '하루 거래대금 3억 원 미만';
  if (!((m.net ?? 0) > 0)) return '마지막 결산 순이익 적자';
  if (!fin && !((m.op ?? 0) > 0)) return '마지막 결산 영업이익 적자';
  if (!fin && !ORDER.has(nz(r.sector)) && !(m.debt != null && m.debt <= 200)) return '부채비율 200% 초과';
  if (r.notCommon) return '보통주 아님(우선주 · 스팩 · 리츠 등)';
  return null;
}
const kd = d => `${+d.slice(5, 7)}월 ${+d.slice(8, 10)}일`;
const iso = d => `${d.slice(0, 4)}-${d.slice(4, 6)}-${d.slice(6, 8)}`;
const rows0 = N.rows;
// ① 모음 일봉 + 이어 받은 일봉(파일 이름 차례 · 모음 마지막 날 뒤만 · 같은 날은 나중 파일 · 모음 안 날 값이 0.5% 넘게 다르면 그 파일에서 그 회사는 안 받음)
const px = new Map(), vol = new Map(), tv = new Map(), baseMap = new Map();
for (const r of rows0) {
  const a = new Map(), v = new Map(), t = new Map();
  for (const x of bundle.stocks[r.code]?.fchart?.rows ?? []) if (x[4] > 0) { a.set(iso(x[0]), x[4]); v.set(iso(x[0]), x.length > 5 ? x[5] : null); t.set(iso(x[0]), x[4] * (x[5] || 0)); }
  px.set(r.code, a); vol.set(r.code, v); tv.set(r.code, t); baseMap.set(r.code, new Map(a));
}
const BLAST = [...baseMap.values()].flatMap(m => [...m.keys()]).sort().at(-1);
let files = 0, added = 0; const mismatch = [];
const CL = process.env.ATLAS_T365_CLOSES;
if (CL && fs.existsSync(CL)) for (const fn of fs.readdirSync(CL).filter(f => f.endsWith('.json.gz')).sort()) {
  const snap = JSON.parse(zlib.gunzipSync(fs.readFileSync(path.join(CL, fn))).toString('utf8'));
  if (!['atlas-t365-closes-1', 'atlas-t365-closes-2'].includes(snap.schema)) continue;
  files++;
  for (const [c, rs] of Object.entries(snap.rows ?? {})) {
    const b0 = baseMap.get(c); if (!b0) continue;
    if (rs.some(x => iso(x[0]) <= BLAST && b0.has(iso(x[0])) && x[1] && Math.abs(x[1] / b0.get(iso(x[0])) - 1) > 0.005)) { mismatch.push([fn, c]); continue; }
    for (const x of rs) if (iso(x[0]) > BLAST && x[1] > 0) { if (!px.get(c).has(iso(x[0]))) added++; px.get(c).set(iso(x[0]), x[1]); vol.get(c).set(iso(x[0]), x.length > 2 ? x[2] : null); tv.get(c).set(iso(x[0]), x[1] * (x[2] || 0)); }
  }
}
const dayCnt = new Map(); for (const m of px.values()) for (const d of m.keys()) dayCnt.set(d, (dayCnt.get(d) ?? 0) + 1);
const goodDays = [...dayCnt].filter(([, n]) => n > rows0.length / 2).map(([d]) => d).sort();
const cal = [...new Set([...calBase, ...goodDays.filter(d => d > calBase.at(-1))])].sort();
const asOf = goodDays.filter(d => cal.includes(d)).at(-1);
const rows = rows0.map(r => {
  const ds = [...px.get(r.code).keys()].filter(d => d <= asOf).sort(), last60 = ds.slice(-60);
  const atv = last60.length ? last60.reduce((t, d) => t + tv.get(r.code).get(d), 0) / last60.length / 1e8 : null;
  const capOk = asOf !== N.asOf && r.capEok && px.get(r.code).get(asOf) && px.get(r.code).get(N.asOf);
  return {...r, capEok: capOk ? Math.round(r.capEok * px.get(r.code).get(asOf) / px.get(r.code).get(N.asOf)) : r.capEok, px: {...r.px, n: ds.length, atvEok: atv}};
});
const byc = new Map(rows.map(r => [r.code, r]));
const D = cal.filter(d => d <= asOf), K = D.length - 1, win = D.slice(K - WIN, K + 1);
same(pro.asOf, asOf, '고르는 날 = 후보 절반 넘게 종가가 있는 마지막 날');
same(D[K], asOf, '고르는 날 = 거래일');
same(win.length, WIN + 1, '창 21점');
same(pro.window, {from: win[0], mid: win[MID], to: asOf, days: WIN}, '창 날짜(K−20 · K−10 · K)');
for (const d of win) { const n = rows.filter(r => px.get(r.code).has(d)).length; truth(n > rows.length / 2, `창 안 날 ${d} 종가 있는 회사 절반 넘음`, n); }
if (pro.from?.closes) { same(pro.from.closes.files, files, '이어 받은 파일 수'); same(pro.from.closes.added, added, '이어 붙인 값 수'); const srt = a => JSON.stringify([...a].map(x => x.join(' ')).sort()); same(srt(pro.from.closes.mismatch), srt(mismatch), '지난 값이 다른 회사(파일 · 번호)'); }
// 앞 회차 기록 — 판이 h365-v1 일 때만 완충
const PV = process.env.ATLAS_H365_PREV && fs.existsSync(process.env.ATLAS_H365_PREV) ? J(process.env.ATLAS_H365_PREV) : null;
const pmem = PV?.members ?? [], puse = PV?.version === VERSION && pmem.length > 0;
same(pro.from?.prev, {used: puse, version: PV?.version ?? null, at: PV?.at ?? null, n: pmem.length, digest: pmem.length ? crypto.createHash('sha256').update(pmem.join(',')).digest('hex').slice(0, 16) : null}, '앞 회차 기록(쓰는지 · 판 · 때 · 수 · 지문)');
const P = puse ? new Set(pmem) : null;

// ② 기본 문
const status = new Map(), fails = new Map(), ok = [];
for (const r of rows) { const f = gateFail(r) ?? (px.get(r.code).has(asOf) ? null : `고르는 날(${kd(asOf)}) 종가 없음 — 거래정지 등`); if (f) { status.set(r.code, {s: 'gate', why: f}); fails.set(f, (fails.get(f) ?? 0) + 1); } else ok.push(r.code); }
// ③ 힘
const QWHY = {gap: '? 셈 못 함 — 종가 빈 날', break: '? 끊긴 값(쪼개기 등)', vol0: '? 거래량 0인 날(거래정지 흔적)'};
const M = new Map(), qn = {gap: 0, break: 0, vol0: 0};
for (const c of ok) {
  const v = win.map(d => px.get(c).get(d) ?? null);
  let why = null;
  if (v.some(x => x == null)) why = 'gap';
  else if (v.some((x, i) => i > 0 && Math.abs(x / v[i - 1] - 1) > LIMIT)) why = 'break';
  else if (win.slice(0, -1).some(d => vol.get(c).get(d) === 0)) why = 'vol0';
  if (why) { qn[why]++; status.set(c, {s: 'q', why: QWHY[why]}); continue; }
  const h1 = v[MID] / v[0] - 1, h2 = v[WIN] / v[MID] - 1;
  M.set(c, {h1, h2, d: h2 - h1, r20: v[WIN] / v[0] - 1});
}
const order = [...M.keys()].sort((a, b) => M.get(b).d - M.get(a).d || (byc.get(b).capEok ?? 0) - (byc.get(a).capEok ?? 0) || cmp(a, b));
const F = order.filter(c => M.get(c).d > TURN), room = Math.min(PICK, order.length);
const gain = F.slice(0, room), fs0 = new Set(F);
const keep = gain.length < room && P ? order.slice(0, BUF).filter(c => P.has(c) && !fs0.has(c)).slice(0, room - gain.length) : [];
const taken = new Set([...gain, ...keep]), fill = order.filter(c => !taken.has(c)).slice(0, room - gain.length - keep.length);
const kind = new Map([...gain.map(c => [c, 'gain']), ...keep.map(c => [c, 'keep']), ...fill.map(c => [c, 'fill'])]);
const picked = [...gain, ...keep, ...fill];
for (const c of picked) status.set(c, {s: 'in'});
for (const c of order) if (!kind.has(c)) status.set(c, {s: 'cut', why: M.get(c).d > TURN ? '힘 붙음이지만 365곳이 이미 참' : '문턱 3%p 못 넘음 · 자리가 참'});

// ④ 맞대기 — 수
const pc = pro.counts, med = xs => { const a = [...xs].sort((p, q) => p - q), n = a.length; return n ? (n % 2 ? a[(n - 1) / 2] : (a[n / 2 - 1] + a[n / 2]) / 2) : null; };
const outM = order.filter(c => !kind.has(c)).map(c => M.get(c));
same(pro.rules?.version, VERSION, '판 이름');
same(pc.universe, rows.length, '후보 수'); same(pc.gate, ok.length, '기본 문 지난 수');
same([...pc.gateFails].map(([a, n]) => [a, n]).sort((a, b) => b[1] - a[1] || cmp(a[0], b[0])), [...fails].sort((a, b) => b[1] - a[1] || cmp(a[0], b[0])), '기본 문마다 빠진 수(많은 순)');
same([pc.measured, pc.q, pc.qWhy], [M.size, qn.gap + qn.break + qn.vol0, qn], '셀 수 있음 · 「?」 · 까닭마다 수');
same([pc.gainAll, pc.gain, pc.keep, pc.fill, pc.picked], [F.length, gain.length, keep.length, fill.length, picked.length], '힘 붙음 모두 · 듦(힘 붙음 · 남김 · 채움) · 365');
same([pc.gainDown, pc.pickedDown, pc.out], [gain.filter(c => M.get(c).h2 < 0).length, picked.filter(c => M.get(c).h2 < 0).length, outM.length], '뒤 10거래일에도 내린 수 · 자리가 차 빠진 수');
near(pc.medD, med([...M.values()].map(m => m.d)), 'd 가운데값');
near(pc.medR20In, med(picked.map(c => M.get(c).r20)), '20거래일 가운데값 — 고른 곳');
near(pc.medR20Out, med(outM.map(m => m.r20)), '20거래일 가운데값 — 셀 수 있었지만 안 고른 곳');
truth(picked.length === Math.min(PICK, M.size), '늘 365곳(셀 수 있는 곳이 모자라면 그 수)', picked.length);
truth(F.length >= PICK || gain.length === F.length, '「힘 붙음」은 365곳이 안 넘으면 모두 들어감', [F.length, gain.length]);
truth(gain.length + keep.length + fill.length + (rows.length - ok.length) + (qn.gap + qn.break + qn.vol0) + outM.length === rows.length, '안 + 자리 밖 + 「?」 + 기본 문 밖 = 후보', null);
// ⑤ 차례
if (fill.length && outM.length) truth(Math.min(...fill.map(c => M.get(c).d)) >= Math.max(...order.filter(c => !kind.has(c)).map(c => M.get(c).d)), '채운 곳의 d ≥ 자리가 차 빠진 곳의 d', null);
for (const c of keep) truth(P?.has(c) && order.indexOf(c) < BUF && M.get(c).d <= TURN, `남김 ${c} = 앞 회차 365곳 · 오늘 450번째 안 · 힘 붙음 아님`, order.indexOf(c) + 1);
if (!puse) same(keep.length, 0, '앞 회차가 h365-v1 이 아니면 남김 없음');
// 365곳 차례 · 회사마다 값
same(pro.picked.map(p => p.code), picked, '365곳 차례(힘 붙음 → 남김 → 채움 · 각각 d 큰 순)');
pro.picked.forEach((p, k) => { const c = picked[k]; if (!c) return; const r = byc.get(c), m = M.get(c);
  for (const [f, w] of [['name', r.name], ['market', r.market], ['sector', r.sector], ['capEok', r.capEok], ['kind', kind.get(c)]]) same(p[f], w, `${p.code} ${f}`);
  for (const f of ['h1', 'h2', 'd', 'r20']) near(p[f], m[f], `${p.code} ${f}`); });
// ⑥ 업종 — 큰 갈래 표(groups.json)에 모두 있음(organize.mjs 가 멈추지 않게)
const G = J(new URL('./groups.json', import.meta.url).pathname).groups, inds = new Set(G.flatMap(g => g.industries));
const lost = picked.filter(c => !inds.has(group365Of({sector: byc.get(c).sector, ksic: byc.get(c).ksic})));
same(lost, [], '큰 갈래 표에 없는 업종의 회사');
// ⑦ 밖 회사마다 멈춘 곳 · 까닭
const out = pro.outside;
same(out.length + pro.picked.length, rows.length, '안 + 밖 = 후보 수');
for (const o of out) { const s = status.get(o.code); same([o.s, o.why], s ? [s.s, s.why] : null, `밖 ${o.code}`); truth(String(o.why).length <= 30 || o.s === 'gate', `밖 까닭 30자 안 ${o.code}`, o.why); }
same(new Set([...out.map(o => o.code), ...pro.picked.map(p => p.code)]).size, rows.length, '안 · 밖 겹침 없음');

const res = {schema: 'atlas11-h365-verify-1', made: new Date().toISOString(), version: pro.rules?.version, asOf, prev: pro.from?.prev ?? null, checks, bad: bad.length, first: bad.slice(0, 20)};
fs.mkdirSync(path.dirname(outFile), {recursive: true}); fs.writeFileSync(outFile, JSON.stringify(res, null, 1) + '\n');
console.log(JSON.stringify({checks, bad: bad.length, first: bad.slice(0, 5)}));
process.exit(bad.length ? 1 : 0);
