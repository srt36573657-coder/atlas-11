#!/usr/bin/env node
// 대세 365곳(d365-v2) 따로 세기 — daese.py(파이썬)와 다른 길(노드 · 모음 원본 + 이어 받은 일봉에서 처음부터)로 다시 골라 proposal.json 과 맞댐
//   사장님 2026-10-11 11:43 「두 팀이 함께 고른 8업종(178곳)을 「대세였던 곳」으로 삼고, 나머지는 한 팀만 고른 업종부터 대세에 가까운 순서로 채워 365곳을 만들까요? 어 그렇게 해」
//   12:41 「아니 내일이면 내일 다시 그다음날도 다시 기준은 항상 오늘날짜로 해야 하고 업데이트는 하루에 4번 해야 하고 업데이트 탭 만들어서 기록해놓아라」 — 회차마다 다시 고름 · 고르는 날 종가 없는 곳 뺌
//   쓰는 법(저장소 맨 위에서): node scripts/atlas11/t365/daese_verify.mjs <후보 표 now.json(dump.mjs)> [proposal.json] [결과 = reports/atlas11/verify/d365-verify-latest.json]
//   이어 받은 일봉 폴더는 환경 변수 ATLAS_T365_CLOSES(closes_fetch.mjs 파일 · 파이썬과 같은 규칙을 따로 짬)
//   맞대는 것: 기본 문(따로 짠 blue · 보통주) · 업종 51 숫자(30거래일 변화 · 곧은 선 · 곧음 · 흔들림 · S2 · 오른 회사 · 돈 몫 · 이익 늘어난 회사) ·
//             구글팀 위 20% · CIA팀 · 층 · 채우기(층 → S2 순 → 넘치는 업종은 회사 30거래일 순) · 365곳 차례 · 밖 회사마다 멈춘 곳과 까닭 글 ·
//             승인 숫자(1층 8업종 178곳 · 2층 5업종 51곳 — 11:43 말씀의 업종 이름 그대로)
//   틀린 것이 하나라도 있으면 끝 코드 1
import fs from 'node:fs';
import zlib from 'node:zlib';
import path from 'node:path';
const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '../../..');
const [candsPath, propArg, outArg] = process.argv.slice(2);
if (!candsPath) { console.error('쓰는 법: node scripts/atlas11/t365/daese_verify.mjs <now.json> [proposal.json] [결과]'); process.exit(2); }
const J = f => JSON.parse(fs.readFileSync(f, 'utf8'));
const N = J(path.resolve(candsPath));
const pro = J(path.resolve(ROOT, propArg ?? 'reports/atlas11/universe/2026-10-11-d365/proposal.json'));
const outFile = path.resolve(ROOT, outArg ?? 'reports/atlas11/verify/d365-verify-latest.json');
const bundle = JSON.parse(zlib.gunzipSync(fs.readFileSync(path.join(ROOT, 'reports/atlas11/universe/2026-10-10/bundle.json.gz'))).toString('utf8'));
// 거래소 달력 = input.json + rolling-calendar.json(11월까지 늘린 판)
const calBase = [...new Set([...J(path.join(ROOT, 'public/data/input.json')).calendar.sessions, ...(fs.existsSync(path.join(ROOT, 'public/data/rolling-calendar.json')) ? J(path.join(ROOT, 'public/data/rolling-calendar.json')).sessions ?? [] : [])])].sort();
const bad = []; let checks = 0;
const same = (a, b, what) => { checks++; if (JSON.stringify(a) !== JSON.stringify(b)) bad.push({what, got: a, want: b}); };
const near = (a, b, what) => { checks++; if (a == null || b == null ? a !== b : Math.abs(a - b) > 1e-9 * Math.max(1, Math.abs(b))) bad.push({what, got: a, want: b}); };

// 기본 문 — rules.py 를 읽지 않고 따로 짬(같은 뜻)
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
function grows(r) { // 이익이 늘어남 — 다음 해 예상 > 마지막 확정 해 · 예상이 없으면 마지막 확정 해 > 그 앞 해
  const k = FIN.has(nz(r.sector)) ? 'net' : 'op', d = r.fin?.[k] ?? {}, per = r.fin?.periods ?? [];
  const act = per.filter(p => !p.endsWith('E') && d[p] != null); if (!act.length) return false;
  const last = act.at(-1), nxt = per.filter(p => p.endsWith('E') && p.startsWith(String(+last.slice(0, 4) + 1)) && d[p] != null);
  if (nxt.length) return d[nxt[0]] > d[last];
  return act.length >= 2 ? d[last] > d[act.at(-2)] : false;
}
const rows0 = N.rows;
const iso = d => `${d.slice(0, 4)}-${d.slice(4, 6)}-${d.slice(6, 8)}`;
// 모음 일봉 + 이어 받은 일봉(파일 이름 차례 · 모음 마지막 날 뒤만 · 같은 날은 나중 파일 · 모음 안 날 값이 0.5% 넘게 다르면 그 파일에서 그 회사는 안 받음)
const px = new Map(), tv = new Map(), baseMap = new Map();
for (const r of rows0) {
  const a = new Map(), b = new Map();
  for (const x of bundle.stocks[r.code]?.fchart?.rows ?? []) if (x[4] > 0) { a.set(iso(x[0]), x[4]); b.set(iso(x[0]), x[4] * (x[5] || 0)); }
  px.set(r.code, a); tv.set(r.code, b); baseMap.set(r.code, new Map(a));
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
    for (const x of rs) if (iso(x[0]) > BLAST && x[1] > 0) { if (!px.get(c).has(iso(x[0]))) added++; px.get(c).set(iso(x[0]), x[1]); tv.get(c).set(iso(x[0]), x[1] * (x[2] || 0)); }
  }
}
// 고르는 날 = 후보 절반 넘게 종가가 있는 마지막 날(달력이 끝난 뒤 날도 그 조건이면 거래일)
const dayCnt = new Map(); for (const m of px.values()) for (const d of m.keys()) dayCnt.set(d, (dayCnt.get(d) ?? 0) + 1);
const goodDays = [...dayCnt].filter(([, n]) => n > rows0.length / 2).map(([d]) => d).sort();
const cal = [...new Set([...calBase, ...goodDays.filter(d => d > calBase.at(-1))])].sort();
const asOf = goodDays.filter(d => cal.includes(d)).at(-1);
// 고르는 날에 맞춘 후보 표 — 주가 기록 수 · 하루 거래대금(마지막 60거래일 평균) · 시가총액(모음 날 몸값 × 고르는 날 종가 ÷ 모음 날 종가)
const rows = rows0.map(r => {
  const ds = [...px.get(r.code).keys()].filter(d => d <= asOf).sort(), last60 = ds.slice(-60);
  const atv = last60.length ? last60.reduce((t, d) => t + tv.get(r.code).get(d), 0) / last60.length / 1e8 : null;
  const capOk = asOf !== N.asOf && r.capEok && px.get(r.code).get(asOf) && px.get(r.code).get(N.asOf);
  return {...r, capEok: capOk ? Math.round(r.capEok * px.get(r.code).get(asOf) / px.get(r.code).get(N.asOf)) : r.capEok, px: {...r.px, n: ds.length, atvEok: atv}};
});
const byc = new Map(rows.map(r => [r.code, r]));
const D = cal.filter(d => d <= asOf), K = D.length - 1;
same(pro.asOf, asOf, '고르는 날 = 후보 절반 넘게 종가가 있는 마지막 날');
same(D[K], asOf, '고르는 날 = 거래일');
if (pro.from?.closes) { same(pro.from.closes.files, files, '이어 받은 파일 수'); same(pro.from.closes.added, added, '이어 붙인 값 수'); const srt = a => JSON.stringify([...a].map(x => x.join(' ')).sort()); same(srt(pro.from.closes.mismatch), srt(mismatch), '지난 값이 다른 회사(파일 · 번호)'); }
for (const d of D.slice(K - 69)) { const n = rows.filter(r => px.get(r.code).has(d)).length; checks++; if (!(n > rows.length / 2)) bad.push({what: `창 안 날 ${d} 종가 있는 회사 절반 이하`, got: n}); }
same(pro.window, {from: D[K - 30], to: asOf, days: 30, sdFrom: D[K - 60], monRecentFrom: D[K - 9], monPrevFrom: D[K - 69], monPrevTo: D[K - 10]}, '창 날짜');

// ① 기본 문
const status = new Map(), fails = new Map(), ok = [];
for (const r of rows) { const f = gateFail(r) ?? (px.get(r.code).has(asOf) ? null : `고르는 날(${kd(asOf)}) 종가 없음 — 거래정지 등`); if (f) { status.set(r.code, {s: 'gate', why: f}); fails.set(f, (fails.get(f) ?? 0) + 1); } else ok.push(r.code); }
// ② 업종
const members = new Map();
for (const c of ok) { const s = nz(byc.get(c).sector); if (!members.has(s)) members.set(s, []); members.get(s).push(c); }
const cmp = (a, b) => (a < b ? -1 : a > b ? 1 : 0);
const unranked = [], sect = new Map();
for (const s of [...members.keys()].sort(cmp)) {
  const cs = members.get(s);
  if (!s) unranked.push({name: '', n: cs.length, why: '네이버 업종이 비어 있음'});
  else if (cs.length < 3) unranked.push({name: s, n: cs.length, why: `기본 문 지난 회사가 ${cs.length}곳뿐(3곳 미만)`});
  else sect.set(s, [...cs].sort(cmp));
}
const P = (c, k) => px.get(c).get(D[k]);
function idx(cs, k0, k1) { let lv = 100; const out = [100]; for (let k = k0 + 1; k <= k1; k++) { let s = 0, n = 0; for (const c of cs) { const a = P(c, k - 1), b = P(c, k); if (a && b) { const r = b / a - 1; if (Math.abs(r) < 0.5) { s += r; n++; } } } if (n) lv *= 1 + s / n; out.push(lv); } return out; }
const tvs = (cs, k0, k1) => { let t = 0; for (const c of cs) for (let j = k0; j <= k1; j++) t += tv.get(c).get(D[j]) ?? 0; return t; };
function line(v) { // ln 지수를 날에 곧은 선으로
  const n = v.length, ys = v.map(Math.log), mx = (n - 1) / 2, my = ys.reduce((a, b) => a + b, 0) / n;
  let sxx = 0, sxy = 0, ss = 0; ys.forEach((y, x) => { sxx += (x - mx) ** 2; sxy += (x - mx) * (y - my); ss += (y - my) ** 2; });
  const b = sxy / sxx; let res = 0; ys.forEach((y, x) => { res += (y - (my + b * (x - mx))) ** 2; });
  return [Math.exp(b * (n - 1)) - 1, ss > 0 ? 1 - res / ss : 0];
}
const allc = [...sect.values()].flat();
const totRec = tvs(allc, K - 9, K) || 1, totPrev = tvs(allc, K - 69, K - 10) || 1;
const F = new Map();
for (const [s, cs] of sect) {
  const cs2 = cs.filter(c => P(c, K - 30) && P(c, K));
  if (cs2.length < 3) { unranked.push({name: s, n: cs.length, why: `30거래일 처음 · 끝 종가가 다 있는 회사가 ${cs2.length}곳뿐(3곳 미만)`}); continue; }
  const v = idx(cs2, K - 30, K), [fit, r2] = line(v), chg = v[30] / v[0] - 1;
  const vv = idx(cs2, K - 60, K), dr = vv.slice(1).map((x, i) => x / vv[i] - 1), mu = dr.reduce((a, b) => a + b, 0) / dr.length;
  const sd = Math.sqrt(dr.reduce((a, x) => a + (x - mu) ** 2, 0) / dr.length) || 1e-9;
  const br = cs2.filter(c => P(c, K) > P(c, K - 30)).length / cs2.length;
  const mon = (tvs(cs2, K - 9, K) / totRec) / ((tvs(cs2, K - 69, K - 10) / totPrev) || 1e-9) - 1;
  const earn = cs.filter(c => grows(byc.get(c))).length / cs.length;
  const strong = fit > 0.10 && r2 >= 0.6 && chg > 0, hits = [br >= 0.6, mon >= 0.10, earn >= 0.6];
  F.set(s, {name: s, n: cs.length, m: cs2.length, chg, fit, r2, sd, z: chg / (sd * Math.sqrt(30)), br, mon, earn, strong, hits, cia: strong && hits.filter(Boolean).length >= 2});
}
const ranked = [...F.keys()].sort((a, b) => F.get(b).z - F.get(a).z || cmp(a, b));
const top = Math.max(1, Math.round(ranked.length * 0.2));
ranked.forEach((s, k) => { const x = F.get(s); x.rank = k + 1; x.google = k < top; x.tier = x.google && x.cia ? 1 : x.google || x.cia ? 2 : 3; });
// ③ 채우기
const r30 = c => { const a = P(c, K - 30), b = P(c, K); return a && b ? b / a - 1 : null; };
const ck = (a, b) => (r30(a) == null) - (r30(b) == null) || (r30(b) ?? 0) - (r30(a) ?? 0) || (byc.get(b).capEok ?? 0) - (byc.get(a).capEok ?? 0) || cmp(a, b);
const picked = [];
for (const s of [...ranked].sort((a, b) => F.get(a).tier - F.get(b).tier || F.get(a).rank - F.get(b).rank)) {
  const x = F.get(s), cs = [...sect.get(s)].sort(ck), room = 365 - picked.length, take = cs.length <= room ? cs.length : Math.max(0, room);
  x.inN = take; x.part = take > 0 && take < cs.length;
  cs.forEach((c, k) => {
    if (k < take) { status.set(c, {s: 'in'}); picked.push({code: c, name: byc.get(c).name, market: byc.get(c).market, sector: s, capEok: byc.get(c).capEok, r30: r30(c), tier: x.tier, srank: x.rank, prank: k + 1, pn: cs.length, part: x.part}); }
    else if (room <= 0) status.set(c, {s: 'cut', why: `대세 순서 ${x.rank}번째 업종(${s} · ${x.tier}층) — 앞 업종들로 365곳이 이미 참`});
    else status.set(c, {s: 'cut', why: `${s} 업종(${x.tier}층) 안 30거래일 오른 순 ${k + 1}번째 — 이 업종은 ${take}곳까지만 들어감`});
  });
}
for (const u of unranked) for (const c of members.get(u.name)) status.set(c, {s: 'sector', why: (u.name ? `네이버 업종 「${u.name}」 — ` : '') + u.why + ' · 대세 순서를 매기지 않음'});

// ④ 맞대기
const pc = pro.counts, cnt = t => picked.filter(p => p.tier === t).length;
same(pc.universe, rows.length, '후보 수'); same(pc.gate, ok.length, '기본 문 지난 수');
same([...pc.gateFails].sort((a, b) => cmp(a[0], b[0])), [...fails].sort((a, b) => cmp(a[0], b[0])), '기본 문마다 빠진 수');
same(pc.sectors, sect.size, '3곳 이상 업종 수'); same(pc.ranked, ranked.length, '순서 매긴 업종 수'); same(pc.top, top, '구글팀 위 20% 업종 수');
same(pc.rankedCompanies, ranked.reduce((t, s) => t + F.get(s).n, 0), '순서 매긴 업종 회사 수');
same(pc.unrankedCompanies, unranked.reduce((t, u) => t + u.n, 0), '순서 없는 회사 수');
same([pc.google, pc.cia, pc.both, pc.one], [ranked.filter(s => F.get(s).google).length, ranked.filter(s => F.get(s).cia).length, ranked.filter(s => F.get(s).tier === 1).length, ranked.filter(s => F.get(s).tier === 2).length], '구글 · CIA · 두 팀 · 한 팀 업종 수');
same([pc.tier1, pc.tier2, pc.tier3, pc.picked], [cnt(1), cnt(2), cnt(3), picked.length], '층마다 회사 수 · 365');
same(pc.part, ranked.filter(s => F.get(s).part).map(s => ({name: s, tier: F.get(s).tier, rank: F.get(s).rank, in: F.get(s).inN, of: F.get(s).n})), '일부만 든 업종');
same(pro.sectors.map(x => x.name), ranked, '업종 차례(S2 큰 순)');
for (const x of pro.sectors) {
  const y = F.get(x.name); if (!y) continue;
  for (const k of ['chg', 'fit', 'r2', 'sd', 'z', 'br', 'mon', 'earn']) near(x[k], y[k], `업종 ${x.name} ${k}`);
  for (const k of ['n', 'm', 'strong', 'hits', 'cia', 'rank', 'google', 'tier', 'inN', 'part']) same(x[k], y[k], `업종 ${x.name} ${k}`);
}
same([...pro.unranked].map(u => [u.name, u.n, u.why]).sort((a, b) => cmp(a[0], b[0])), unranked.map(u => [u.name, u.n, u.why]).sort((a, b) => cmp(a[0], b[0])), '순서 없는 업종');
same(pro.picked.map(p => p.code), picked.map(p => p.code), '365곳 차례');
pro.picked.forEach((p, k) => { const q = picked[k]; if (!q) return; same(p.rank, k + 1, `차례 ${p.code}`);
  for (const f of ['name', 'market', 'sector', 'capEok', 'tier', 'srank', 'prank', 'pn', 'part']) same(p[f], q[f], `${p.code} ${f}`); near(p.r30, q.r30, `${p.code} 30거래일`); });
const out = pro.outside;
same(out.length + pro.picked.length, rows.length, '안 + 밖 = 후보 수');
for (const o of out) { const s = status.get(o.code); same([o.s, o.why], s ? [s.s, s.why] : null, `밖 ${o.code}`); }
same(new Set([...out.map(o => o.code), ...pro.picked.map(p => p.code)]).size, rows.length, '안 · 밖 겹침 없음');
// 승인 숫자(11:43 · 10월 8일 값으로 고를 때만) — 1층 8업종 178곳 · 2층 5업종 51곳
if (asOf === '2026-10-08') {
same(ranked.filter(s => F.get(s).tier === 1).sort(cmp), ['건강관리기술', '디스플레이장비및부품', '반도체와반도체장비', '생명과학도구및서비스', '소프트웨어', '전기제품', '전자장비와기기', '핸드셋'].sort(cmp), '1층 = 말씀의 8업종');
same(ranked.filter(s => F.get(s).tier === 2).sort(cmp), ['석유와가스', '교육서비스', '우주항공과국방', '전기장비', '통신장비'].sort(cmp), '2층 = 말씀의 5업종');
same([cnt(1), cnt(2)], [178, 51], '1층 178곳 · 2층 51곳');
}

const res = {schema: 'atlas11-d365-verify-1', made: new Date().toISOString(), version: pro.rules?.version, asOf, checks, bad: bad.length, first: bad.slice(0, 20)};
fs.mkdirSync(path.dirname(outFile), {recursive: true}); fs.writeFileSync(outFile, JSON.stringify(res, null, 1) + '\n');
console.log(JSON.stringify({checks, bad: bad.length, first: bad.slice(0, 5)}));
process.exit(bad.length ? 1 : 0);
