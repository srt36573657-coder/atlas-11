#!/usr/bin/env node
// 7단 범위(range-v1) 따로 세기 — range_mc.py(파이썬 · numpy)와 다른 길(노드 · 다른 난수)로 다시 세어 맞댐
//   사장님 2026-10-13 06:45 「매수 검토 36곳 영구 삭제 하라」 — 옛 36곳 고르기 · 지우기 · 지난 기록 시험 검사는 지움 · 대신 「고른 목록 · 차례가 자료에 없음」을 셈
//   회사 = 환경 변수 ATLAS_D365_DIR 폴더(회차마다 새로 고른 365곳) 또는 universe.json 폴더 · 일봉 = 모음 + ATLAS_T365_CLOSES(같은 합치기 규칙)
//   쓰는 법(저장소 맨 위에서): node scripts/atlas11/t365/range_verify.mjs [화면 자료 = site/atlas/data/range.json] [결과 = reports/atlas11/verify/range-verify-latest.json]
//   ① 거래일 · 하루 수익 · 시장 · 방향 날 수 · 출렁 문턱(역사 창 500거래일)을 처음부터 다시 셈 — 같아야 함
//   ② 회사 12곳 × 4방향을 회사마다 따로 뽑기(경로 200만 · 다른 난수)로 번 길 몫 · 크게 잃는 길 몫을 다시 셈 — 몬테카를로 흔들림 4배 안이어야 함
//      (그 방향 날에 값이 빈 회사는 파이썬이 빈칸을 한 번 고정해 채우므로 맞대지 않고 건너뜀 — 건너뛴 수를 적음)
//   ③ 회사마다 평균 · 가장 나쁜 방향 값이 네 방향 값과 맞음 · 셈한 회사 수 · 고른 목록 · 차례 · 지움 표시 · 지난 기록 시험이 자료에 없음
import fs from 'node:fs';
import zlib from 'node:zlib';
import path from 'node:path';
const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '../../..');
const file = path.resolve(ROOT, process.argv[2] ?? 'site/atlas/data/range.json');
const outFile = path.resolve(ROOT, process.argv[3] ?? 'reports/atlas11/verify/range-verify-latest.json');
const J = f => JSON.parse(fs.readFileSync(f, 'utf8'));
const pk = J(file), S = pk.spec;
const ACT = J(path.join(ROOT, 'scripts/atlas11/t365/universe.json'));
const UNI = process.env.ATLAS_D365_DIR || path.join(ROOT, ACT.dir);
const byi = J(path.join(UNI, 'by-industry.json'));
const pro = J(path.join(UNI, 'proposal.json'));
const bundle = JSON.parse(zlib.gunzipSync(fs.readFileSync(path.join(ROOT, ACT.bundle))).toString('utf8'));
const cos = byi.groups.flatMap(g => g.industries.flatMap(i => i.companies.map(c => ({code: c.code, name: c.name, g: g.id, i: i.name}))));
const NC = cos.length, H = S.horizon;
const bad = []; let checks = 0, skipped = 0;
const same = (a, b, what) => { checks++; if (a !== b) bad.push({what, got: a, want: b}); };
const near = (a, b, tol, what) => { checks++; if (!(Math.abs(a - b) <= tol)) bad.push({what, got: a, want: b, tol}); };

// ① 거래일 · 수익 · 시장 · 방향
const rows = cos.map(c => new Map((bundle.stocks[c.code]?.fchart?.rows ?? []).filter(r => r[4] > 0).map(r => [r[0], r[4]])));
{ // 이어 받은 일봉 — 파일 이름 차례 · 모음 마지막 날 뒤만 · 같은 날은 나중 파일 · 모음 안 날 값이 0.5% 넘게 다르면 그 파일에서 그 회사는 안 받음 · 고르는 날까지
  const blast = rows.flatMap(m => [...m.keys()]).sort().at(-1), sel8 = String(pro.asOf ?? ACT.asOf).replaceAll('-', ''), CL = process.env.ATLAS_T365_CLOSES, ix = new Map(cos.map((c, j) => [c.code, j]));
  const base = rows.map(m => new Map(m));
  if (CL && fs.existsSync(CL)) for (const fn of fs.readdirSync(CL).filter(f => f.endsWith('.json.gz')).sort()) {
    const snap = JSON.parse(zlib.gunzipSync(fs.readFileSync(path.join(CL, fn))).toString('utf8'));
    if (!['atlas-t365-closes-1', 'atlas-t365-closes-2'].includes(snap.schema)) continue;
    for (const [code, rs] of Object.entries(snap.rows ?? {})) { const j = ix.get(code); if (j == null) continue;
      if (rs.some(x => x[0] <= blast && base[j].has(x[0]) && x[1] && Math.abs(x[1] / base[j].get(x[0]) - 1) > 0.005)) continue;
      for (const x of rs) if (x[0] > blast && x[1] > 0) rows[j].set(x[0], x[1]); }
  }
  for (const m of rows) for (const d of [...m.keys()]) if (d > sel8) m.delete(d);
}
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
same(S.version, ACT.range, '판 이름 = universe.json'); same(pk.schema, 'atlas-new-range-1', '자료 틀'); same(S.universe ?? 't365-v1', ACT.version, '365곳 판 = universe.json'); if (!process.argv.includes('--allow-quick')) same(S.quick, false, '빠른 셈이 아님'); // 시험(t365-roll.test)만 빠른 셈을 받음
same(Object.keys(pk.companies).sort().join(), cos.map(c => c.code).sort().join(), '회사 365곳 = universe.json 365곳');
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
const okCodes = Object.entries(pk.companies).filter(([, v]) => v.ok).map(([c]) => c).sort();
const sample = okCodes.length <= 12 ? okCodes : Array.from({length: 12}, (_, k) => okCodes[Math.floor(k * (okCodes.length - 1) / 11)]); // 고르지 않고 고르게 퍼뜨린 12곳
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

// ③ 평균 · 가장 나쁜 방향 · 셈한 수 · 고른 목록 없음(36곳 영구 삭제)
const C = Object.entries(pk.companies);
same(C.filter(([, v]) => v.ok).length, pk.eligible, '셈한 회사 수');
for (const [code, v] of C) {
  if (!v.ok) continue;
  near(v.avg, Math.round(v.win.reduce((a, b) => a + b, 0) / v.win.length * 100) / 100, 0.0101, '평균 ' + code);
  near(v.worst, Math.max(...v.big), 0.0101, '가장 나쁜 방향 ' + code);
  for (const k of ['rank', 'cut']) { checks++; if (k in v) bad.push({what: `회사 ${code} 에 「${k}」(고르기 흔적)`}); }
}
for (const k of ['picks', 'backtest', 'cutN', 'alive', 'total']) { checks++; if (k in pk) bad.push({what: `자료에 「${k}」(36곳 흔적)`}); }
checks++; if (/매수 검토|셈 차례|봉인 36곳|365곳 · 36곳|36곳이 365곳 평균보다/.test(JSON.stringify(pk))) bad.push({what: '자료 글에 지운 36곳 화면 글'}); // 「36곳 내림」 같은 셈 글은 아님(2026-10-13 14:2x)

// ④ 고른 곳 밖 회사(모든 회사 7단 · 사장님 2026-10-14 17:21(싱가포르) 「그리고 7단 클릭구조 부활 시켜」 · 17:25 「전부다 나오게 해」) — 같은 자료 폴더 mkt.json 의 고른 곳 밖 모두:
//   회사 목록 = 자료의 others · 적은 수(spec.others) · 셈 가능(ok) = 방향마다 그 회사 값 있는 날이 20일 넘음(모든 회사 다시 셈) · 평균 · 가장 나쁜 방향 · 차례 없음 ·
//   12곳 × 4방향은 따로 뽑기(경로 200만 · 다른 난수)로 번 길 · 크게 잃는 길 몫을 다시 셈(방향 날은 위 ① 고른 곳 시장 그대로 · 파이썬 경로 수 = spec.others.paths)
let othChecks = 0;
{
  const MKF = path.join(path.dirname(file), 'mkt.json');
  const OTH = fs.existsSync(MKF) ? Object.entries(J(MKF).companies).filter(([, m]) => !m.p).map(([c]) => c).sort() : [];
  const PO = pk.others ?? null;
  if (!OTH.length) same(PO == null || Object.keys(PO).length === 0, true, '고른 곳 밖 회사가 없으면 밖 범위도 없음');
  else if (!PO) bad.push({what: '고른 곳 밖 범위(others) 없음'});
  else {
    same(Object.keys(PO).sort().join(), OTH.join(), '밖 범위 회사 = mkt.json 고른 곳 밖');
    same(S.others?.n, OTH.length, '밖 범위 적은 수(spec.others.n)'); same(S.others?.seed, '·밖', '밖 범위 씨앗 이름(고른 곳과 따로)');
    // 값 — 모음 + 이어 받은 일봉(같은 합치기 규칙 · 모음 마지막 날은 밖 회사 무리 안에서) · 고르는 날까지
    const orows = OTH.map(c => new Map((bundle.stocks[c]?.fchart?.rows ?? []).filter(r => r[4] > 0).map(r => [r[0], r[4]])));
    { const blast = orows.flatMap(m => [...m.keys()]).sort().at(-1), sel8 = String(pro.asOf ?? ACT.asOf).replaceAll('-', ''), CL = process.env.ATLAS_T365_CLOSES, ix = new Map(OTH.map((c, j) => [c, j]));
      const base = orows.map(m => new Map(m));
      if (CL && fs.existsSync(CL)) for (const fn of fs.readdirSync(CL).filter(f => f.endsWith('.json.gz')).sort()) {
        const snap = JSON.parse(zlib.gunzipSync(fs.readFileSync(path.join(CL, fn))).toString('utf8'));
        if (!['atlas-t365-closes-1', 'atlas-t365-closes-2'].includes(snap.schema)) continue;
        for (const [code, rs] of Object.entries(snap.rows ?? {})) { const j = ix.get(code); if (j == null) continue;
          if (rs.some(x => x[0] <= blast && base[j].has(x[0]) && x[1] && Math.abs(x[1] / base[j].get(x[0]) - 1) > 0.005)) continue;
          for (const x of rs) if (x[0] > blast && x[1] > 0) orows[j].set(x[0], x[1]); }
      }
      for (const m of orows) for (const d of [...m.keys()]) if (d > sel8) m.delete(d); }
    const RO = [OTH.map(() => NaN)]; // RO[k][j] = k-1 → k 로그 수익(하루 ±30.5% 넘으면 뺌)
    for (let k = 1; k < ND; k++) RO.push(orows.map(m => { const a = m.get(DATES[k - 1]), b2 = m.get(DATES[k]); let x = b2 / a - 1; if (!(Math.abs(x) <= 0.305)) return NaN; return Math.log1p(x); }));
    const pools = pk.dirs.map(d => days.filter((k, i) => lab[i] === d.id));
    let okN = 0;
    OTH.forEach((c, j) => { const v = PO[c]; if (!v) return;
      const okWant = pools.every(pl => pl.filter(k => !Number.isNaN(RO[k][j])).length >= H); same(v.ok, okWant, `밖 셈 가능(방향마다 값 있는 날 ${H}일 넘음) ${c}`); if (v.ok) okN++;
      for (const k of ['rank', 'cut']) { checks++; if (k in v) bad.push({what: `밖 회사 ${c} 에 「${k}」(고르기 흔적)`}); }
      if (!v.ok) return;
      checks++; if (v.win.length !== 4 || v.big.length !== 4) bad.push({what: `밖 4방향 칸 수 ${c}`});
      near(v.avg, Math.round(v.win.reduce((a, b) => a + b, 0) / v.win.length * 100) / 100, 0.0101, '밖 평균 ' + c); near(v.worst, Math.max(...v.big), 0.0101, '밖 가장 나쁜 방향 ' + c); othChecks++; });
    same(okN, S.others?.eligible, '밖 셈한 회사 수(spec.others.eligible)');
    const okO = OTH.filter(c => PO[c]?.ok), smp = okO.length <= 12 ? okO : Array.from({length: 12}, (_, k) => okO[Math.floor(k * (okO.length - 1) / 11)]);
    const npo = S.others?.paths ?? 0, thW = Math.log1p(S.profit), thB = Math.log1p(S.bigLoss);
    for (const code of smp) { const j = OTH.indexOf(code);
      pk.dirs.forEach((d, di) => {
        const vals = pools[di].map(k => RO[k][j]); if (vals.some(x => Number.isNaN(x))) { skipped++; return; }
        const r = rng(0xBADA55 ^ (j * 131 + di * 7)); let win = 0, big = 0;
        for (let n = 0; n < NJS; n++) { let s2 = 0; for (let q = 0; q < H; q++) s2 += vals[(r() * vals.length) | 0]; if (s2 > thW) win++; if (s2 < thB) big++; }
        const pw = win / NJS, pb = big / NJS, c = PO[code];
        const tw = 4 * Math.sqrt(pw * (1 - pw) / NJS + pw * (1 - pw) / npo) * 100, tb = 4 * Math.sqrt(pb * (1 - pb) / NJS + pb * (1 - pb) / npo) * 100;
        near(pw * 100, c.win[di], Math.max(tw, 0.01), `밖 번 길 몫 ${code} ${d.name}`); near(pb * 100, c.big[di], Math.max(tb, 0.01), `밖 크게 잃는 길 몫 ${code} ${d.name}`); mcChecks += 2; }); }
  }
}

const res = {schema: 'range-verify-1', made: new Date().toISOString(), file: path.relative(ROOT, file), asOf: pk.asOf, version: S.version, checks, mcChecks, skipped, others: {n: Object.keys(pk.others ?? {}).length, checked: othChecks}, bad: bad.length, first: bad.slice(0, 20)};
fs.mkdirSync(path.dirname(outFile), {recursive: true}); fs.writeFileSync(outFile, JSON.stringify(res, null, 1) + '\n');
console.log(JSON.stringify({checks, mcChecks, skipped, bad: bad.length, first: bad.slice(0, 6)}));
process.exit(bad.length ? 1 : 0);
