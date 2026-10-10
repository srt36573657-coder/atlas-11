#!/usr/bin/env node
// 월요일 36곳(pick36-v1) 따로 세기 — pick36.py(파이썬 · numpy)와 다른 길(노드 · 다른 난수)로 다시 세어 맞댐
//   쓰는 법(저장소 맨 위에서): node scripts/atlas11/t365/pick36_verify.mjs [화면 자료 = site/atlas/data/pick36.json] [결과 = reports/atlas11/verify/pick36-verify-latest.json]
//   ① 거래일 · 하루 수익 · 시장 · 방향 날 수 · 출렁 문턱(역사 창 500거래일)을 처음부터 다시 셈 — 같아야 함
//   ② 회사 12곳 × 4방향을 회사마다 따로 뽑기(경로 200만 · 다른 난수)로 번 길 몫 · 크게 잃는 길 몫을 다시 셈 — 몬테카를로 흔들림 4배 안이어야 함
//      (그 방향 날에 값이 빈 회사는 파이썬이 빈칸을 한 번 고정해 채우므로 맞대지 않고 건너뜀 — 건너뛴 수를 적음)
//   ③ 회사마다 값(번 길 평균 · 가장 나쁜 방향 크게 잃는 길)으로 지우기 · 36곳 고르기를 다시 함 — 같은 36곳 · 같은 차례
//   ④ 지난 기록 시험의 「365곳 평균」 줄을 종가로 다시 셈 · 36곳 1주씩 합계를 종가로 다시 셈
import fs from 'node:fs';
import zlib from 'node:zlib';
import path from 'node:path';
const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '../../..');
const file = path.resolve(ROOT, process.argv[2] ?? 'site/atlas/data/pick36.json');
const outFile = path.resolve(ROOT, process.argv[3] ?? 'reports/atlas11/verify/pick36-verify-latest.json');
const J = f => JSON.parse(fs.readFileSync(f, 'utf8'));
const pk = J(file), S = pk.spec;
const byi = J(path.join(ROOT, 'reports/atlas11/universe/2026-10-10-t365/by-industry.json'));
const pro = J(path.join(ROOT, 'reports/atlas11/universe/2026-10-10-t365/proposal.json'));
const capSel = new Map(pro.picked.map(p => [p.code, p.capEok]));
const bundle = JSON.parse(zlib.gunzipSync(fs.readFileSync(path.join(ROOT, 'reports/atlas11/universe/2026-10-10/bundle.json.gz'))).toString('utf8'));
const cos = byi.groups.flatMap(g => g.industries.flatMap(i => i.companies.map(c => ({code: c.code, name: c.name, g: g.id, i: i.name}))));
const NC = cos.length, H = S.horizon;
const bad = []; let checks = 0, skipped = 0;
const same = (a, b, what) => { checks++; if (a !== b) bad.push({what, got: a, want: b}); };
const near = (a, b, tol, what) => { checks++; if (!(Math.abs(a - b) <= tol)) bad.push({what, got: a, want: b, tol}); };

// ① 거래일 · 수익 · 시장 · 방향
const rows = cos.map(c => new Map((bundle.stocks[c.code]?.fchart?.rows ?? []).filter(r => r[4] > 0).map(r => [r[0], r[4]])));
const cnt = new Map(); for (const m of rows) for (const d of m.keys()) cnt.set(d, (cnt.get(d) ?? 0) + 1);
const DATES = [...cnt].filter(([, n]) => n > NC / 2).map(([d]) => d).sort();
const ND = DATES.length;
const P = DATES.map(d => rows.map(m => m.get(d) ?? NaN));
const R = [new Array(NC).fill(NaN)], Mk = [NaN];
for (let k = 1; k < ND; k++) {
  const r = new Array(NC); let s = 0, n = 0;
  for (let j = 0; j < NC; j++) { const a = P[k - 1][j], b = P[k][j]; let x = b / a - 1; if (!(Math.abs(x) <= 0.305)) x = NaN; if (!Number.isNaN(x)) { s += x; n++; } r[j] = Number.isNaN(x) ? NaN : Math.log1p(x); }
  R.push(r); Mk.push(n ? s / n : NaN);
}
const iso = d => `${d.slice(0, 4)}-${d.slice(4, 6)}-${d.slice(6)}`;
same(iso(DATES[ND - 1]), pk.asOf, '기준일');
const T = ND - 1, lo = Math.max(H, T - S.window + 1), days = []; for (let k = lo; k <= T; k++) days.push(k);
const cum = days.map(k => { let s = 0; for (let q = k - H + 1; q <= k; q++) if (!Number.isNaN(Mk[q])) s += Math.log1p(Mk[q]); return s; });
const sd = days.map(k => { const v = []; for (let q = k - H + 1; q <= k; q++) if (!Number.isNaN(Mk[q])) v.push(Mk[q]); const m = v.reduce((a, b) => a + b, 0) / v.length; return Math.sqrt(v.reduce((a, b) => a + (b - m) ** 2, 0) / (v.length - 1)); });
const sorted = [...sd].sort((a, b) => a - b), pos = (sorted.length - 1) * S.volQ, fl = Math.floor(pos);
const vth = sorted[fl] + (sorted[Math.min(fl + 1, sorted.length - 1)] - sorted[fl]) * (pos - fl); // numpy quantile(linear)
near(vth, pk.volTh, 1e-12, '출렁 문턱');
const lab = days.map((k, i) => (sd[i] > vth ? 'wild' : cum[i] > Math.log1p(S.upTh) ? 'up' : cum[i] < Math.log1p(S.downTh) ? 'down' : 'flat'));
for (const d of pk.dirs) same(lab.filter(x => x === d.id).length, d.days, `방향 날 수 ${d.name}`);

// ② 회사 12곳 × 4방향 — 회사마다 따로 뽑기(다른 난수 · xoshiro128**)
function rng(seed) { let a = seed >>> 0, b = 0x9E3779B9, c = 0x243F6A88, d = 0xB7E15162; const rotl = (x, k) => (x << k) | (x >>> (32 - k)); const next = () => { const r = Math.imul(rotl(Math.imul(b, 5), 7), 9) >>> 0; const t = b << 9; c ^= a; d ^= b; b ^= c; a ^= d; c ^= t; d = rotl(d, 11); return r; }; for (let i = 0; i < 20; i++) next(); return () => next() / 4294967296; }
const NJS = 2_000_000;
const pickCodes = pk.picks.map(p => p.code);
const sample = [...pickCodes.slice(0, 4), ...pickCodes.slice(-2), ...Object.entries(pk.companies).filter(([, v]) => v.cut).slice(0, 3).map(([c]) => c), ...Object.entries(pk.companies).filter(([c, v]) => !v.cut && !pickCodes.includes(c) && v.ok).slice(0, 3).map(([c]) => c)];
const npy = S.paths;
let mcChecks = 0;
for (const code of sample) {
  const j = cos.findIndex(c => c.code === code);
  pk.dirs.forEach((d, di) => {
    const pool = days.filter((k, i) => lab[i] === d.id);
    const vals = pool.map(k => R[k][j]);
    if (vals.some(x => Number.isNaN(x))) { skipped++; return; }
    const r = rng(0xC0FFEE ^ (j * 131 + di * 7));
    let win = 0, big = 0;
    const thW = Math.log1p(S.profit), thB = Math.log1p(S.bigLoss);
    for (let n = 0; n < NJS; n++) { let s = 0; for (let q = 0; q < H; q++) s += vals[(r() * vals.length) | 0]; if (s > thW) win++; if (s < thB) big++; }
    const pw = win / NJS, pb = big / NJS, c = pk.companies[code];
    const tw = 4 * Math.sqrt(pw * (1 - pw) / NJS + pw * (1 - pw) / npy) * 100, tb = 4 * Math.sqrt(pb * (1 - pb) / NJS + pb * (1 - pb) / npy) * 100;
    near(pw * 100, c.win[di], Math.max(tw, 0.01), `번 길 몫 ${code} ${d.name}`);
    near(pb * 100, c.big[di], Math.max(tb, 0.01), `크게 잃는 길 몫 ${code} ${d.name}`);
    mcChecks += 2;
  });
}

// ③ 지우기 · 고르기 다시
const C = Object.entries(pk.companies).map(([code, v]) => ({code, ...v, i: cos.find(c => c.code === code).i}));
const elig = C.filter(c => c.ok);
same(elig.length, pk.eligible, '셈한 회사 수');
const ncut = Math.floor(elig.length / 3 + 1e-9);
same(ncut, pk.cutN, '지운 수');
// 화면 자료는 소수 둘째 자리로 줄인 값 — 차례가 그 반올림에서 갈리면 원값으로만 정해짐 → 같은 값 묶음은 「같음」으로 셈
const cutSet = new Set([...elig].sort((a, b) => b.worst - a.worst || capSel.get(b.code) - capSel.get(a.code)).slice(0, ncut).map(c => c.code));
const flaggedCut = new Set(C.filter(c => c.cut).map(c => c.code));
const borderline = [...cutSet].filter(c => !flaggedCut.has(c)).concat([...flaggedCut].filter(c => !cutSet.has(c)));
const wcut = Math.min(...[...flaggedCut].map(c => pk.companies[c].worst)), wkeep = Math.max(...elig.filter(c => !flaggedCut.has(c.code)).map(c => c.worst));
checks++; if (!(wcut >= wkeep)) bad.push({what: '지운 곳의 가장 나쁜 값 ≥ 남은 곳', got: wcut, want: `≥ ${wkeep}`});
checks++; if (borderline.some(c => Math.abs(pk.companies[c].worst - wkeep) > 0.011 && Math.abs(pk.companies[c].worst - wcut) > 0.011)) bad.push({what: '지운 차례 다름(경계 밖)', got: borderline});
const alive = elig.filter(c => !flaggedCut.has(c.code)).sort((a, b) => b.avg - a.avg || capSel.get(b.code) - capSel.get(a.code));
const per = new Map(), mine = [];
for (const c of alive) { if ((per.get(c.i) ?? 0) >= S.perIndustry) continue; per.set(c.i, (per.get(c.i) ?? 0) + 1); mine.push(c.code); if (mine.length === 36) break; }
const diff = mine.filter((c, k) => c !== pickCodes[k]);
checks++; if (diff.length) { const tie = diff.every(c => { const a = pk.companies[c].avg; return pickCodes.some(p => Math.abs(pk.companies[p].avg - a) <= 0.011); }); if (!tie) bad.push({what: '36곳 다시 고르기 다름', got: mine.slice(0, 8), want: pickCodes.slice(0, 8)}); }
for (const [k, p] of pk.picks.entries()) same(p.rank, k + 1, '차례 ' + p.code);
const counts = new Map(); for (const p of pk.picks) counts.set(p.i, (counts.get(p.i) ?? 0) + 1);
checks++; if ([...counts.values()].some(n => n > S.perIndustry)) bad.push({what: '한 업종 5곳 넘음'});

// ④ 시험 365곳 평균 · 합계
const kOf = new Map(DATES.map((d, k) => [iso(d), k]));
for (const b of pk.backtest?.rows ?? []) {
  const k = kOf.get(b.t); const cols = []; for (let j = 0; j < NC; j++) if (!Number.isNaN(P[k][j])) cols.push(j);
  const ret = j => { for (let q = k + H; q > k; q--) if (!Number.isNaN(P[q][j])) return P[q][j] / P[k][j] - 1; return 0; };
  near(Math.round(cols.reduce((s, j) => s + ret(j), 0) / cols.length * 10000) / 100, b.all, 0.0101, `시험 ${b.t} 365곳 평균`);
  same(cols.length, b.n, `시험 ${b.t} 회사 수`);
}
const total = pk.picks.reduce((s, p) => s + P[T][cos.findIndex(c => c.code === p.code)], 0);
near(total, pk.total, 0.5, '36곳 1주씩 합계');

const res = {schema: 'pick36-verify-1', made: new Date().toISOString(), file: path.relative(ROOT, file), asOf: pk.asOf, version: S.version, checks, mcChecks, skipped, bad: bad.length, first: bad.slice(0, 20)};
fs.mkdirSync(path.dirname(outFile), {recursive: true}); fs.writeFileSync(outFile, JSON.stringify(res, null, 1) + '\n');
console.log(JSON.stringify({checks, mcChecks, skipped, bad: bad.length, first: bad.slice(0, 6)}));
process.exit(bad.length ? 1 : 0);
