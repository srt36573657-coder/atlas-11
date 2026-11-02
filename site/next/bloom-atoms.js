/* 낱 조건 156 — 꽃 될 회사 고르는 낱 조건(회사 · 날마다 참거짓)을 연구 셈과 칸 하나까지 같게 셈
   연구 셈 = scripts/atlas11/research/sprout365.py(바탕 · 낱 조건 134 · 이름 공간 F) + bloom_evolve.py(새 낱 조건 22 · 이름 공간 G · ATOM_FULL)
   차례 · 이름 = docs/design/bloom-evolve-2026-11-02/candidates.json atoms · 맞대기 = tests/atlas11/bloom-atoms.test.mjs
   (파이썬 `bloom_evolve.py --atoms-fixture` 이 남긴 낱 조건마다 수 · 지문 reports/atlas11/research/bloom-atoms-fixture.json)
   다른 파일을 부르지 않음(가져오기 · 노드 · 화면 없음 — 브라우저에서도 돎) · 칸 = t * C + j(날 t · 회사 j · 회사는 글자 차례)
   numpy 와 같게 셈:
   - Float64 · 빈 값(NaN)은 셈에 퍼지고 견주면 거짓 · 창(roll) 안에 빈 값이 하나라도 있으면 빈 값
   - 합은 앞에서부터 차례로 — 연구 셈의 numpy 합은 여기서 모두 차례 합이다(RV[:, cols] 같은 골라 뽑기는 열 차례(F) 배열이라
     axis=1 합이 칸마다 차례로 더해지고, sliding_window_view 창 합도 창 축을 차례로 더함 · 짝 합(pairwise)이 아님 — 실제 자료로 확인)
     그래서 창 합은 이어 더하기(더하고 빼기)가 아니라 창마다 처음부터 다시 더함(반올림까지 같게)
   - 가운데 값 = 빈 값 뺀 값을 늘어놓아 가운데 하나 · 짝수면 (아래 + 위) / 2
   - 몸값 차례(SZP) · 업종 큰 회사 셋(TOP3H)의 같은 값 = 앞 회사(글자 차례)가 먼저 — numpy argsort(AVX-512 quicksort)는 같은 값 차례를
     정하지 않음 · 지금 자료(2026-10-13)에선 같은 값이 0.2 · 0.5 · 0.8 선이나 셋째 · 넷째 자리에 걸친 날이 없어 결과가 같음
   - 업종 = 회원 5곳 이상 · 업종 밖 회사는 파이썬 처음 값(ISZ = 0 · IRB = 0 · IREAL 거짓 · IX 등 빈 값 · IRANK 1e6) */

const FAM_TABLE = [
  ['cx', 'cx1 cx2 cx3 cx4 cx5 cx6 cx7 cx8'],
  ['cy', 'cy1 cy2 cy3 cy4 cy5 cy6 cy7 cy8 cy9 cy10'],
  ['c10', 'c10a c10b c10c c10d c10e'],
  ['c60', 'c60a c60b c60c c60d c60e c60f'],
  ['c120', 'c120a c120b c120c c120d'],
  ['hi', 'hi1 hi2 hi3 hi4 hi5 hi6'],
  ['lo', 'lo1 lo2 lo3 lo4'],
  ['vol', 'vol1 vol2 vol3 vol4'],
  ['vr', 'vr1 vr2 vr3 vr4'],
  ['up', 'up1 up2 up3 up4'],
  ['run', 'run1 run2 run3 run4 run5'],
  ['big', 'big1 big2 big3 big4'],
  ['px', 'px1 px2 px3 px4'],
  ['mr', 'mr1 mr2 mr3 mr4'],
  ['ma', 'ma1 ma2 ma3 ma4 ma5 ma6'],
  ['h20', 'h20a h20b h20c'],
  ['iz', 'iz1 iz2 iz3 iz4 iz5 iz6 iz7'],
  ['ix', 'ix1 ix2 ix3 ix4 ix5 ix6 ix7'],
  ['iy', 'iy1 iy2 iy3 iy4 iy5 iy6'],
  ['ib', 'ib1 ib2 ib3 ib4'],
  ['ibr', 'ibr1 ibr2 ibr3 ibr4'],
  ['i60', 'i60a i60b i60c i60d'],
  ['ibig', 'ibig1 ibig2'],
  ['rel', 'rel1 rel2 rel3 rel4 rel5'],
  ['isz', 'isz1 isz2'],
  ['m20', 'm20a m20b m20c m20d'],
  ['m5', 'm5a m5b'],
  ['m60', 'm60a m60b'],
  ['mb', 'mb1 mb2'],
  ['nb', 'nb1 nb2'],
  ['fin', 'fin1 fin2 fin3 fin4 fin5 fin6 fin7 fin8 fin9 fin10 fin11 fin12'],
  ['trd', 'trd1 trd2 trd3 trd4 trd5'],
  ['rk', 'rk1 rk2 rk3 rk4 rk5'],
];
/** 낱 조건 156 이름(candidates.json atoms 차례) */
export const ATOM_IDS = Object.freeze(FAM_TABLE.flatMap(([, s]) => s.split(' ')));
/** 낱 조건 이름 → 갈래 */
export const ATOM_FAM = Object.freeze(Object.fromEntries(FAM_TABLE.flatMap(([f, s]) => s.split(' ').map(id => [id, f]))));

const cmpStr = (a, b) => (a < b ? -1 : a > b ? 1 : 0); // 파이썬 sorted(글자) 와 같은 차례(낱자 번호)
const getOf = (m, k) => (m == null ? undefined : typeof m.get === 'function' ? m.get(k) : m[k]);
const FIN_KEYS = ['rev', 'op', 'net', 'roe', 'debt'];

/** 파이썬 int(글자) — 앞뒤 빈칸 · 부호 · 숫자 사이 밑줄 · 못 읽으면 null */
function pyInt(s) {
  const m = /^\s*([+-]?)(\d+(?:_\d+)*)\s*$/.exec(s);
  if (!m) return null;
  const v = parseInt(m[2].replace(/_/g, ''), 10);
  return m[1] === '-' ? -v : v;
}
/** 그레고리력 날 번호(1970-01-01 = 0) — 파이썬 date.toordinal() 과 차이가 늘 같음 */
function civilDay(y, m, d) {
  y -= m <= 2 ? 1 : 0;
  const era = Math.floor(y / 400), yoe = y - era * 400;
  const doy = Math.floor((153 * (m + (m > 2 ? -3 : 9)) + 2) / 5) + d - 1;
  return era * 146097 + yoe * 365 + Math.floor(yoe / 4) - Math.floor(yoe / 100) + doy - 719468;
}
/** 늘어놓은 앞 n 칸의 가운데 값(np.median · np.ma.median 과 같음) — buf 를 고쳐 씀 */
function medianOf(buf, n) {
  const s = buf.subarray(0, n).sort();
  return n % 2 ? s[(n - 1) >> 1] : (s[n / 2 - 1] + s[n / 2]) / 2;
}

/**
 * 바탕 — 자료를 받아 낱 조건을 셀 수 있는 틀을 만든다(무거운 셈은 처음 쓸 때 함)
 * @param {object} o
 * @param {string[]} o.dates 날('YYYY-MM-DD' · days.json dates)
 * @param {string[]} o.codes 회사 코드(아무 차례 · 안에서 글자 차례로 늘어놓음)
 * @param {Map<string, Array<number|null>>} o.closes 코드 → 날에 맞춘 종가(null · 0 · NaN = 빈 값)
 * @param {object} o.companies mkt.json companies(코드 → {i: 업종 이름, …})
 * @param {Map<string, number>} o.caps 코드 → 몸값(cond.json co.c · co.cap)
 * @param {Map<string, object>} o.fins 코드 → co 파일 fin(없어도 됨)
 */
export function atomBase({dates, codes, closes, companies, caps, fins}) {
  const N = dates.length;
  const CODES = Object.freeze(Array.from(new Set(codes)).sort(cmpStr));
  const C = CODES.length, NC = N * C;
  const COL = new Map(CODES.map((c, j) => [c, j]));

  // 종가 P(N × C) — 파이썬 `if v: P[t, j] = float(v)`
  const P = new Float64Array(NC).fill(NaN);
  for (let j = 0; j < C; j++) {
    const a = getOf(closes, CODES[j]);
    if (!a) continue;
    for (let t = 0, n = Math.min(N, a.length); t < n; t++) {
      const v = a[t];
      if (typeof v === 'number' && v === v && v !== 0) P[t * C + j] = v;
    }
  }

  // 시장 지수 M = index_of(모든 회사) — 튐(|r| ≥ 0.35) 뺀 하루 오름의 평균(회사 차례대로 더함) · 첫날 0 · 곱해 이음
  // (업종 지수는 industry() 에서 같은 차례로 셈)
  const M = new Float64Array(N);
  if (N) M[0] = 1;
  for (let t = 1; t < N; t++) {
    const o = t * C, o1 = o - C;
    let s = 0, n = 0;
    for (let j = 0; j < C; j++) { const r = P[o + j] / P[o1 + j] - 1; if (r === r && !(Math.abs(r) >= 0.35)) { s += r; n++; } }
    M[t] = M[t - 1] * (1 + (n > 0 ? s / n : 0));
  }

  const big = new Map(); // N × C 크기(drop 이 비움)
  const small = new Map(); // 날 · 업종 크기(남김)
  const atoms = new Map();
  const colBuf = () => new Float64Array(N);

  /** 회사마다(열) 셈 — fn(그 회사 종가 p, 쓸 칸 o(빈 값으로 채움), j) → Float64Array(N × C) */
  function perCol(fn) {
    const out = new Float64Array(NC), p = colBuf(), o = colBuf();
    for (let j = 0; j < C; j++) {
      for (let t = 0, i = j; t < N; t++, i += C) p[t] = P[i];
      o.fill(NaN);
      fn(p, o, j);
      for (let t = 0, i = j; t < N; t++, i += C) out[i] = o[t];
    }
    return out;
  }
  const retOf = (p, r) => { r[0] = NaN; for (let t = 1; t < N; t++) r[t] = p[t] / p[t - 1] - 1; return r; }; // R
  /** 창 합 — t − w + 1 ~ t 를 처음부터 차례로(0 + a + …) · 빈 값이 있으면 빈 값 */
  function rollSum(a, w, out) {
    let last = -w - 1;
    for (let t = 0; t < N; t++) {
      if (a[t] !== a[t]) last = t;
      if (t < w - 1 || t - last < w) { out[t] = NaN; continue; }
      let s = 0;
      for (let k = t - w + 1; k <= t; k++) s += a[k];
      out[t] = s;
    }
    return out;
  }
  const DQ = new Int32Array(Math.max(N, 1));
  /** 창 가장 큰(작은) 값 — 빈 값이 있으면 빈 값 */
  function rollExt(a, w, out, isMin) {
    let h = 0, e = 0, last = -w - 1;
    for (let t = 0; t < N; t++) {
      const v = a[t];
      if (v !== v) { last = t; h = e = 0; out[t] = NaN; continue; }
      if (isMin) { while (e > h && a[DQ[e - 1]] >= v) e--; } else { while (e > h && a[DQ[e - 1]] <= v) e--; }
      DQ[e++] = t;
      while (DQ[h] <= t - w) h++;
      out[t] = t >= w - 1 && t - last >= w ? a[DQ[h]] : NaN;
    }
    return out;
  }
  /** ((P / P_{t−k}) / (M / M_{t−k}) − 1) × 100 — X(20) · Y(5) · R10 · R60 · R120 */
  function lagRel(k) {
    const out = new Float64Array(NC).fill(NaN);
    for (let t = k; t < N; t++) {
      const mm = M[t] / M[t - k], o = t * C, ok = o - k * C;
      for (let j = 0; j < C; j++) out[o + j] = ((P[o + j] / P[ok + j]) / mm - 1) * 100;
    }
    return out;
  }
  /** roll_std — 모집단(나눔 w) · 합과 제곱합으로 */
  function volOf(w) {
    const r = colBuf(), sq = colBuf(), s1 = colBuf(), s2 = colBuf();
    return perCol((p, o) => {
      retOf(p, r);
      for (let t = 0; t < N; t++) sq[t] = r[t] * r[t];
      rollSum(r, w, s1); rollSum(sq, w, s2);
      for (let t = 0; t < N; t++) { const m = s1[t] / w; o[t] = Math.sqrt(Math.max(s2[t] / w - m * m, 0)); }
    });
  }

  let CORE = null;
  /** 셀 수 있음 COUNT · 싹 SPROUT · 결과 있음 DEF · 꽃 FLOWER · 크게 떨어짐 FALL · 바탕 BASEM */
  function core() {
    if (CORE) return CORE;
    const COUNT = new Uint8Array(NC), SPROUT = new Uint8Array(NC), DEF = new Uint8Array(NC);
    const FLOWER = new Uint8Array(NC), FALL = new Uint8Array(NC), BASEM = new Uint8Array(NC);
    const X = S('X'), Y = S('Y');
    const p = colBuf(), jf = new Uint8Array(N), sf = new Uint8Array(N), j20 = new Int32Array(N), s20 = new Int32Array(N);
    for (let j = 0; j < C; j++) {
      for (let t = 0, i = j; t < N; t++, i += C) p[t] = P[i];
      for (let t = 1; t < N; t++) { const r = p[t] / p[t - 1] - 1; jf[t] = r === r && Math.abs(r) >= 0.35 ? 1 : 0; sf[t] = p[t] === p[t - 1] ? 1 : 0; }
      let a = 0, b = 0; // 20날 안 튐 · 같은 값 날 수(정수라 이어 더해도 같음 · t < 20 은 0 ~ t)
      for (let t = 0; t < N; t++) { a += jf[t]; b += sf[t]; if (t >= 20) { a -= jf[t - 20]; b -= sf[t - 20]; } j20[t] = a; s20[t] = b; }
      for (let t = 0, i = j; t < N; t++, i += C) {
        const pt = p[t];
        const cnt = t >= 20 && pt === pt && p[t - 5] === p[t - 5] && p[t - 20] === p[t - 20] && j20[t] === 0 && s20[t] < 20;
        if (cnt) { COUNT[i] = 1; if (X[i] < 5 && Y[i] >= 0) SPROUT[i] = 1; }
        if (pt === pt && t + 20 < N) {
          const pf = p[t + 20];
          if (pf === pf && j20[t + 20] === 0) {
            DEF[i] = 1;
            if (cnt) BASEM[i] = 1;
            const ex = (pf / pt) / (M[t + 20] / M[t]) - 1;
            if (ex >= 0.05) FLOWER[i] = 1;
            if (ex <= -0.05) FALL[i] = 1;
          }
        }
      }
    }
    CORE = {COUNT, SPROUT, DEF, FLOWER, FALL, BASEM};
    return CORE;
  }

  /** 지금 주식 수 어림 = 몸값 ÷ 마지막 종가(파이썬 shares) */
  function shares() {
    let sh = small.get('shares');
    if (sh) return sh;
    sh = new Float64Array(C);
    for (let j = 0; j < C; j++) {
      let last = NaN;
      for (let t = N - 1; t >= 0; t--) { const v = P[t * C + j]; if (v === v) { last = v; break; } }
      const cap = getOf(caps, CODES[j]);
      const cv = typeof cap === 'number' ? cap || NaN : typeof cap === 'string' && cap ? Number(cap) : NaN; // `CAP.get(c, nan) or nan`
      sh[j] = cv / last;
    }
    small.set('shares', sh);
    return sh;
  }
  /** 업종(회원 5곳 이상 · 이름 글자 차례) · 회사 → 업종 번호(밖 = −1) */
  function groups() {
    let g = small.get('groups');
    if (g) return g;
    const ind = CODES.map(c => { const x = getOf(companies, c); return (x && x.i) || ''; });
    const cnt = new Map();
    for (const s of ind) if (s) cnt.set(s, (cnt.get(s) || 0) + 1);
    const names = [...cnt.keys()].filter(s => cnt.get(s) >= 5).sort(cmpStr);
    const pos = new Map(names.map((s, k) => [s, k]));
    const gOf = new Int32Array(C).fill(-1), list = names.map(name => ({name, cols: []}));
    for (let j = 0; j < C; j++) { const k = pos.get(ind[j]); if (k !== undefined) { gOf[j] = k; list[k].cols.push(j); } }
    g = {names, list, gOf, ind};
    small.set('groups', g);
    return g;
  }
  /** 업종 셈 — IX · IY · I60 · IBR · IBIG · IREAL · IRB · ISZ(업종마다 날 길이) · NB(날마다) */
  function industry() {
    let v = small.get('industry');
    if (v) return v;
    const {list} = groups(), NG = list.length, top = S('TOP3H');
    const IX = [], IY = [], I60 = [], IBR = [], IBIG = [], IREAL = [], IRB = [], ISZ = new Int32Array(NG), NB = new Int32Array(N);
    const p = colBuf(), jf = new Uint8Array(N);
    const s = colBuf(), n = new Int32Array(N), nc = new Int32Array(N), nu = new Int32Array(N), bs = colBuf(), bc = new Int32Array(N);
    for (let k = 0; k < NG; k++) {
      const cols = list[k].cols;
      s.fill(0); n.fill(0); nc.fill(0); nu.fill(0); bs.fill(0); bc.fill(0);
      for (const j of cols) { // 회사 차례(오름)대로 더함 — numpy nansum(F 차례 배열 · axis=1) 과 같은 차례
        for (let t = 0, i = j; t < N; t++, i += C) p[t] = P[i];
        jf[0] = 0;
        for (let t = 1; t < N; t++) {
          const r = p[t] / p[t - 1] - 1, jump = r === r && Math.abs(r) >= 0.35;
          jf[t] = jump ? 1 : 0;
          if (r === r && !jump) { s[t] += r; n[t]++; }
        }
        let c10 = 0; // 열흘 안 튐 날 수
        for (let t = 0; t < N; t++) {
          c10 += jf[t];
          if (t < 10) continue;
          c10 -= jf[t - 10];
          const pt = p[t], p10 = p[t - 10];
          if (pt === pt && p10 === p10 && c10 === 0) { // cell10
            nc[t]++;
            if (pt * 100 > p10 * 102) nu[t]++;
            if (top[t * C + j]) { const ch = pt / p10 - 1; if (ch === ch) { bs[t] += ch; bc[t]++; } }
          }
        }
      }
      const I = new Float64Array(N);
      if (N) I[0] = 1;
      for (let t = 1; t < N; t++) I[t] = I[t - 1] * (1 + (n[t] > 0 ? s[t] / n[t] : 0));
      const ix = new Float64Array(N), iy = new Float64Array(N), i60 = new Float64Array(N), br = new Float64Array(N), bm = new Float64Array(N);
      const real = new Uint8Array(N), rb = new Int32Array(N);
      for (let t = 0; t < N; t++) {
        const x = t >= 20 ? ((I[t] / I[t - 20]) / (M[t] / M[t - 20]) - 1) * 100 : NaN;
        const y = t >= 5 ? ((I[t] / I[t - 5]) / (M[t] / M[t - 5]) - 1) * 100 : NaN;
        ix[t] = x; iy[t] = y;
        i60[t] = t >= 60 ? ((I[t] / I[t - 60]) / (M[t] / M[t - 60]) - 1) * 100 : NaN;
        br[t] = nc[t] > 0 ? nu[t] / nc[t] : NaN;
        bm[t] = bc[t] > 0 ? bs[t] / bc[t] : NaN;
        const zb = x >= 5 && y >= 0, zs = x < 5 && y >= 0;
        const p3 = (bm[t] === bm[t] ? bm[t] : -1) >= 0.01, p4 = t >= 10 && I[t] / I[t - 10] > 1;
        real[t] = zs && y >= 2 && nu[t] * 2 >= nc[t] && nc[t] > 0 && p3 && p4 ? 1 : 0;
        rb[t] = zb ? (t ? rb[t - 1] + 1 : 1) : 0;
        if (zb) NB[t]++;
      }
      IX.push(ix); IY.push(iy); I60.push(i60); IBR.push(br); IBIG.push(bm); IREAL.push(real); IRB.push(rb);
      ISZ[k] = cols.length;
    }
    v = {IX, IY, I60, IBR, IBIG, IREAL, IRB, ISZ, NB};
    small.set('industry', v);
    return v;
  }
  /** 업종끼리 한 달 IX 차례(rk3 ~ rk5) — 큰 쪽부터 · 같으면 이름 차례 · 1부터 · 아래 절반 = 차례 > 센 수 ÷ 2 */
  function irank() {
    let v = small.get('irank');
    if (v) return v;
    const {names} = groups(), {IX} = industry(), NG = names.length;
    const RANK = new Int32Array(NG * N).fill(1e6), HALF = new Uint8Array(NG * N), ord = [];
    for (let t = 0; t < N; t++) {
      ord.length = 0;
      for (let k = 0; k < NG; k++) if (IX[k][t] === IX[k][t]) ord.push(k);
      if (!ord.length) continue;
      ord.sort((a, b) => { const va = -IX[a][t], vb = -IX[b][t]; return va < vb ? -1 : va > vb ? 1 : cmpStr(names[a], names[b]); });
      const nv = ord.length;
      for (let r = 1; r <= nv; r++) { const k = ord[r - 1]; RANK[k * N + t] = r; HALF[k * N + t] = r > nv / 2 ? 1 : 0; }
    }
    v = {RANK, HALF};
    small.set('irank', v);
    return v;
  }
  /** 실적 — 날마다 알 수 있던 가장 늦은 결산 해(결산 달 끝 + 90일이 지난 첫 거래일부터 · 넷까지) */
  function finBlock() {
    let v = big.get('fin'); // FY 가 N × C 라 drop 이 비움
    if (v) return v;
    const FY = new Int8Array(NC).fill(-1), FIN = {};
    for (const k of FIN_KEYS) FIN[k] = new Float64Array(C * 4).fill(NaN);
    const dnum = dates.map(d => civilDay(+d.slice(0, 4), +d.slice(5, 7), +d.slice(8, 10)));
    for (let j = 0; j < C; j++) {
      const f0 = getOf(fins, CODES[j]), fin = f0 && typeof f0 === 'object' ? f0 : {};
      const ys = Array.isArray(fin.years) ? fin.years : [], nq = Math.min(ys.length, 4);
      for (const k of FIN_KEYS) {
        const arr = Array.isArray(fin[k]) ? fin[k] : [];
        for (let q = 0; q < nq; q++) {
          const x = q < arr.length ? arr[q] : null;
          FIN[k][j * 4 + q] = typeof x === 'number' ? x : typeof x === 'boolean' ? +x : NaN; // isinstance(v, (int, float))
        }
      }
      for (let q = 0; q < nq; q++) {
        const y = ys[q];
        if (typeof y !== 'string') continue;
        const yy = pyInt(y.slice(0, 4)), mm = pyInt(y.slice(5, 7));
        if (yy === null || mm === null) continue;
        const y2 = yy + (mm === 12 ? 1 : 0), m2 = (((mm % 12) + 12) % 12) + 1;
        if (y2 < 1 || y2 > 9999) continue;
        const end = civilDay(y2, m2, 1) - 1 + 90;
        let lo = 0, hi = N; // searchsorted(left)
        while (lo < hi) { const mid = (lo + hi) >> 1; if (dnum[mid] < end) lo = mid + 1; else hi = mid; }
        for (let t = lo; t < N; t++) FY[t * C + j] = q; // 뒤 결산 해가 앞을 덮음
      }
    }
    v = {FY, FIN};
    big.set('fin', v);
    return v;
  }

  /** 이름 → 바탕 줄(N × C) */
  const SER = {
    X: () => lagRel(20), Y: () => lagRel(5), R10: () => lagRel(10), R60: () => lagRel(60), R120: () => lagRel(120),
    HI: () => { const b = colBuf(); return perCol((p, o) => { rollExt(p, 120, b, false); for (let t = 0; t < N; t++) o[t] = p[t] / b[t]; }); },
    LO: () => { const b = colBuf(); return perCol((p, o) => { rollExt(p, 60, b, true); for (let t = 0; t < N; t++) o[t] = p[t] / b[t]; }); },
    H20: () => { const b = colBuf(); return perCol((p, o) => { rollExt(p, 20, b, false); for (let t = 0; t < N; t++) o[t] = p[t] / b[t]; }); },
    H60: () => { const b = colBuf(); return perCol((p, o) => { rollExt(p, 60, b, false); for (let t = 0; t < N; t++) o[t] = p[t] / b[t]; }); },
    MA20: () => perCol((p, o) => { rollSum(p, 20, o); for (let t = 0; t < N; t++) o[t] /= 20; }),
    MA60: () => perCol((p, o) => { rollSum(p, 60, o); for (let t = 0; t < N; t++) o[t] /= 60; }),
    MA120: () => perCol((p, o) => { rollSum(p, 120, o); for (let t = 0; t < N; t++) o[t] /= 120; }),
    MA60L: () => { const a = S('MA60'), out = new Float64Array(NC).fill(NaN); if (N > 20) out.set(a.subarray(0, NC - 20 * C), 20 * C); return out; },
    VOL: () => volOf(20), VOL60: () => volOf(60),
    VREL: () => { // 흔들림 ÷ 그날 싹 흔들림 가운데 값
      const V = S('VOL'), {SPROUT} = core(), out = new Float64Array(NC), buf = new Float64Array(Math.max(C, 1));
      for (let t = 0; t < N; t++) {
        const o = t * C;
        let n = 0;
        for (let j = 0; j < C; j++) if (SPROUT[o + j]) { const x = V[o + j]; if (x === x) buf[n++] = x; }
        const med = n ? medianOf(buf, n) : NaN;
        for (let j = 0; j < C; j++) out[o + j] = V[o + j] / med;
      }
      return out;
    },
    VR: () => { const a = S('VOL'), b = S('VOL60'), out = new Float64Array(NC); for (let i = 0; i < NC; i++) out[i] = a[i] / b[i]; return out; },
    UP10: () => { const u = new Uint8Array(N); return perCol((p, o) => { // 열흘에 오른 날 수 · t < 10 빈 값
      u[0] = 0;
      for (let t = 1; t < N; t++) u[t] = p[t] / p[t - 1] - 1 > 0 ? 1 : 0;
      let c = 0;
      for (let t = 0; t < N; t++) { c += u[t]; if (t >= 10) { c -= u[t - 10]; o[t] = c; } }
    }); },
    RUN: () => { // 싹 이은 날 수 — 파이썬처럼 t ≥ 1 을 먼저(그때 RUN[0] = 0) 센 뒤 RUN[0] = SPROUT[0]
      const {SPROUT} = core(), out = new Int32Array(NC);
      for (let t = 1; t < N; t++) { const o = t * C, q = o - C; for (let j = 0; j < C; j++) out[o + j] = SPROUT[o + j] ? out[q + j] + 1 : 0; }
      if (N) for (let j = 0; j < C; j++) out[j] = SPROUT[j];
      return out;
    },
    MXR: () => { const r = colBuf(); return perCol((p, o) => rollExt(retOf(p, r), 20, o, false)); },
    MXA: () => { const r = colBuf(); return perCol((p, o) => { retOf(p, r); for (let t = 0; t < N; t++) r[t] = Math.abs(r[t]); rollExt(r, 20, o, false); }); },
    MINR: () => { const r = colBuf(); return perCol((p, o) => rollExt(retOf(p, r), 20, o, true)); },
    SZP: () => { // 그날 셀 수 있는 회사 가운데 몸값 차례(작은 쪽부터 0) (차례 + 1) ÷ 센 수
      const {COUNT} = core(), sh = shares(), out = new Float64Array(NC).fill(NaN);
      const idx = new Int32Array(Math.max(C, 1)), val = new Float64Array(Math.max(C, 1));
      const by = (a, b) => (val[a] < val[b] ? -1 : val[a] > val[b] ? 1 : a - b);
      for (let t = 0; t < N; t++) {
        const o = t * C;
        let nv = 0;
        for (let j = 0; j < C; j++) if (COUNT[o + j]) { const x = P[o + j] * sh[j]; if (x === x) { val[j] = x; idx[nv++] = j; } }
        const s = idx.subarray(0, nv).sort(by);
        for (let r = 0; r < nv; r++) out[o + s[r]] = (r + 1) / Math.max(nv, 1);
      }
      return out;
    },
    TOP3H: () => { // 그날 업종 몸값 큰 회사 셋(몸값 빈 값은 뺌)
      const {list} = groups(), sh = shares(), out = new Uint8Array(NC);
      for (const {cols} of list) {
        for (let t = 0; t < N; t++) {
          const o = t * C;
          let b0 = -1, b1 = -1, b2 = -1, v0 = 0, v1 = 0, v2 = 0;
          for (const j of cols) {
            const x = P[o + j] * sh[j];
            if (x !== x) continue;
            if (b0 < 0 || x > v0) { b2 = b1; v2 = v1; b1 = b0; v1 = v0; b0 = j; v0 = x; }
            else if (b1 < 0 || x > v1) { b2 = b1; v2 = v1; b1 = j; v1 = x; }
            else if (b2 < 0 || x > v2) { b2 = j; v2 = x; }
          }
          if (b0 >= 0) out[o + b0] = 1;
          if (b1 >= 0) out[o + b1] = 1;
          if (b2 >= 0) out[o + b2] = 1;
        }
      }
      return out;
    },
    RK: () => { // 같은 업종 셀 수 있는 회사 가운데 한 달 x 위 · 아래 절반(rk1 · rk2) — 두 마스크를 한 줄에(앞 NC = 위 · 뒤 NC = 아래)
      const {COUNT} = core(), X = S('X'), {list} = groups(), out = new Uint8Array(2 * NC);
      const buf = new Float64Array(Math.max(1, ...list.map(g => g.cols.length)));
      for (const {cols} of list) {
        for (let t = 0; t < N; t++) {
          const o = t * C;
          let n = 0;
          for (const j of cols) if (COUNT[o + j]) { const x = X[o + j]; if (x === x) buf[n++] = x; }
          if (!n) continue;
          const med = medianOf(buf, n);
          for (const j of cols) if (COUNT[o + j]) { const x = X[o + j]; if (x >= med) out[o + j] = 1; else if (x < med) out[NC + o + j] = 1; }
        }
      }
      return out;
    },
  };
  function S(name) {
    if (name === 'P') return P;
    let v = big.get(name);
    if (v === undefined) { v = SER[name](); big.set(name, v); }
    return v;
  }

  // ── 낱 조건 만들기 도구 ──
  const by1 = (name, f) => () => { const a = S(name), out = new Uint8Array(NC); for (let i = 0; i < NC; i++) if (f(a[i])) out[i] = 1; return out; };
  const by2 = (n1, n2, f) => () => { const a = S(n1), b = S(n2), out = new Uint8Array(NC); for (let i = 0; i < NC; i++) if (f(a[i], b[i])) out[i] = 1; return out; };
  /** 날마다 하나(시장) → 모든 회사 */
  const byDay = f => { const out = new Uint8Array(NC); for (let t = 0; t < N; t++) if (f(t)) out.fill(1, t * C, (t + 1) * C); return out; };
  /** 업종 · 날마다 하나 → 그 업종 회사(업종 밖 = k −1) */
  const byInd = f => {
    const {gOf, list} = groups(), NG = list.length, out = new Uint8Array(NC), row = new Uint8Array(NG + 1);
    for (let t = 0; t < N; t++) {
      for (let k = 0; k < NG; k++) row[k] = f(k, t) ? 1 : 0;
      row[NG] = f(-1, t) ? 1 : 0;
      const o = t * C;
      for (let j = 0; j < C; j++) { const k = gOf[j]; out[o + j] = row[k < 0 ? NG : k]; }
    }
    return out;
  };
  const indV = (key, dflt) => { const a = industry()[key]; return (k, t) => (k < 0 ? dflt : a[k][t]); };
  const ind1 = (key, dflt, f) => () => { const g = indV(key, dflt); return byInd((k, t) => f(g(k, t))); };
  const ind2 = f => () => { const x = indV('IX', NaN), y = indV('IY', NaN); return byInd((k, t) => f(x(k, t), y(k, t))); };
  /** 회사 줄 × 업종 줄(rel) */
  const rel = (name, key, f) => () => {
    const a = S(name), g = industry()[key], {gOf} = groups(), out = new Uint8Array(NC);
    for (let t = 0; t < N; t++) { const o = t * C; for (let j = 0; j < C; j++) { const k = gOf[j]; if (f(a[o + j], k < 0 ? NaN : g[k][t])) out[o + j] = 1; } }
    return out;
  };
  const mk = (k, f) => () => byDay(t => f(t >= k ? (M[t] / M[t - k] - 1) * 100 : NaN));
  const mb = f => () => {
    const {COUNT} = core(), X = S('X');
    return byDay(t => { const o = t * C; let a = 0, b = 0; for (let j = 0; j < C; j++) if (COUNT[o + j]) { b++; if (X[o + j] >= 0) a++; } return f(a / Math.max(b, 1)); });
  };
  const nb = f => () => { const {NB} = industry(); return byDay(t => f(NB[t])); };
  /** 실적(q = 그날 결산 해 번호 · 앞 해 = q − 1) */
  const fin = f => () => {
    const {FY, FIN} = finBlock(), out = new Uint8Array(NC);
    let cj = 0, cq = 0;
    const g = (k, d = 0) => { const q = cq - d; return q >= 0 ? FIN[k][cj * 4 + q] : NaN; };
    for (let t = 0; t < N; t++) {
      const o = t * C;
      for (let j = 0; j < C; j++) { const q = FY[o + j]; if (q < 0) continue; cj = j; cq = q; if (f(g, q)) out[o + j] = 1; }
    }
    return out;
  };
  const rk = (half, f) => () => {
    const {RANK, HALF} = irank();
    return byInd((k, t) => (k < 0 ? false : half ? HALF[k * N + t] === 1 : f(RANK[k * N + t])));
  };
  const rkIn = up => () => { const a = S('RK'); return a.slice(up ? 0 : NC, up ? NC : 2 * NC); };

  /** 낱 조건 156 — 셈은 sprout365.py · bloom_evolve.py 의 at(…) 줄 그대로 */
  const BUILD = {
    cx1: by1('X', v => v < -15), cx2: by1('X', v => v < -10), cx3: by1('X', v => v < -5), cx4: by1('X', v => v < 0),
    cx5: by1('X', v => v >= -5), cx6: by1('X', v => v >= 0), cx7: by1('X', v => v >= 2), cx8: by1('X', v => v >= -10 && v < 0),
    cy1: by1('Y', v => v >= 1), cy2: by1('Y', v => v >= 2), cy3: by1('Y', v => v >= 3), cy4: by1('Y', v => v >= 5), cy5: by1('Y', v => v >= 8),
    cy6: by1('Y', v => v < 2), cy7: by1('Y', v => v < 5), cy8: by1('Y', v => v >= 2 && v < 5), cy9: by1('Y', v => v >= 5 && v < 10), cy10: by1('Y', v => v >= 10),
    c10a: by1('R10', v => v > 0), c10b: by1('R10', v => v > 3), c10c: by1('R10', v => v > 6), c10d: by1('R10', v => v < 0), c10e: by1('R10', v => v < -3),
    c60a: by1('R60', v => v > 0), c60b: by1('R60', v => v > 10), c60c: by1('R60', v => v > 20),
    c60d: by1('R60', v => v < 0), c60e: by1('R60', v => v < -10), c60f: by1('R60', v => v < -20),
    c120a: by1('R120', v => v > 0), c120b: by1('R120', v => v > 20), c120c: by1('R120', v => v < 0), c120d: by1('R120', v => v < -20),
    hi1: by1('HI', v => v >= 0.95), hi2: by1('HI', v => v >= 0.90), hi3: by1('HI', v => v >= 0.80),
    hi4: by1('HI', v => v < 0.70), hi5: by1('HI', v => v < 0.60), hi6: by1('HI', v => v < 0.50),
    lo1: by1('LO', v => v <= 1.05), lo2: by1('LO', v => v <= 1.10), lo3: by1('LO', v => v >= 1.30), lo4: by1('LO', v => v >= 1.50),
    vol1: by1('VREL', v => v < 0.75), vol2: by1('VREL', v => v < 1.0), vol3: by1('VREL', v => v >= 1.0), vol4: by1('VREL', v => v >= 1.5),
    vr1: by1('VR', v => v < 0.8), vr2: by1('VR', v => v < 1.0), vr3: by1('VR', v => v >= 1.2), vr4: by1('VR', v => v >= 1.5),
    up1: by1('UP10', v => v >= 6), up2: by1('UP10', v => v >= 7), up3: by1('UP10', v => v <= 4), up4: by1('UP10', v => v <= 3),
    run1: by1('RUN', v => v === 1), run2: by1('RUN', v => v >= 1 && v <= 2), run3: by1('RUN', v => v >= 1 && v <= 5),
    run4: by1('RUN', v => v >= 5), run5: by1('RUN', v => v >= 10),
    big1: by1('TOP3H', v => v === 1), big2: by1('SZP', v => v >= 0.8), big3: by1('SZP', v => v <= 0.2), big4: by1('SZP', v => v >= 0.5),
    px1: by1('P', v => v < 2000), px2: by1('P', v => v < 5000), px3: by1('P', v => v >= 10000), px4: by1('P', v => v >= 50000),
    mr1: by1('MXR', v => v >= 0.10), mr2: by1('MXR', v => v >= 0.15), mr3: by1('MXA', v => v < 0.05), mr4: by1('MXR', v => v < 0.05),
    ma1: by2('P', 'MA20', (p, m) => p >= m), ma2: by2('P', 'MA20', (p, m) => p >= 1.05 * m), ma3: by2('P', 'MA60', (p, m) => p >= m),
    ma4: by2('P', 'MA60', (p, m) => p < m), ma5: by2('MA20', 'MA60', (a, b) => a >= b), ma6: by2('MA20', 'MA60', (a, b) => a < b),
    h20a: by1('H20', v => v >= 0.97), h20b: by1('H20', v => v >= 0.93), h20c: by1('H20', v => v < 0.90),
    iz1: ind2((x, y) => x >= 5 && y >= 0), iz2: ind2((x, y) => x < 5 && y >= 0), iz3: ind1('IREAL', 0, v => v === 1),
    iz4: ind2((x, y) => x < 0 && y >= 2), iz5: ind2((x, y) => x >= 5 && y < 0), iz6: ind2((x, y) => x < 5 && y < 0), iz7: ind1('IY', NaN, v => v >= 0),
    ix1: ind1('IX', NaN, v => v >= 0), ix2: ind1('IX', NaN, v => v >= 5), ix3: ind1('IX', NaN, v => v >= 10), ix4: ind1('IX', NaN, v => v >= 15),
    ix5: ind1('IX', NaN, v => v >= 5 && v < 15), ix6: ind1('IX', NaN, v => v < 0), ix7: ind1('IX', NaN, v => v < -5),
    iy1: ind1('IY', NaN, v => v >= 1), iy2: ind1('IY', NaN, v => v >= 2), iy3: ind1('IY', NaN, v => v >= 3),
    iy4: ind1('IY', NaN, v => v < 0), iy5: ind1('IY', NaN, v => v < -1), iy6: ind1('IY', NaN, v => v >= 0 && v < 2),
    ib1: ind1('IRB', 0, v => v >= 1 && v <= 2), ib2: ind1('IRB', 0, v => v >= 1 && v <= 5), ib3: ind1('IRB', 0, v => v > 5), ib4: ind1('IRB', 0, v => v > 10),
    ibr1: ind1('IBR', NaN, v => v >= 0.5), ibr2: ind1('IBR', NaN, v => v >= 0.6), ibr3: ind1('IBR', NaN, v => v < 0.3), ibr4: ind1('IBR', NaN, v => v < 0.2),
    i60a: ind1('I60', NaN, v => v > 0), i60b: ind1('I60', NaN, v => v > 10), i60c: ind1('I60', NaN, v => v < 0), i60d: ind1('I60', NaN, v => v < -10),
    ibig1: ind1('IBIG', NaN, v => v >= 0.01), ibig2: ind1('IBIG', NaN, v => v < 0),
    rel1: rel('Y', 'IY', (a, b) => a > b), rel2: rel('X', 'IX', (a, b) => a > b), rel3: rel('X', 'IX', (a, b) => a < b - 5),
    rel4: rel('X', 'IX', (a, b) => a < b - 10), rel5: rel('Y', 'IY', (a, b) => a > b + 2),
    isz1: () => { const {ISZ} = industry(); return byInd(k => (k < 0 ? 0 : ISZ[k]) >= 30); },
    isz2: () => { const {ISZ} = industry(); return byInd(k => (k < 0 ? 0 : ISZ[k]) < 15); },
    m20a: mk(20, v => v > 0), m20b: mk(20, v => v > 3), m20c: mk(20, v => v < 0), m20d: mk(20, v => v < -3),
    m5a: mk(5, v => v > 0), m5b: mk(5, v => v < 0), m60a: mk(60, v => v > 0), m60b: mk(60, v => v < 0),
    mb1: mb(v => v >= 0.5), mb2: mb(v => v < 0.4), nb1: nb(v => v >= 15), nb2: nb(v => v < 8),
    // 새 22 — fin(g(이름, 1) = 앞 해) · trd · rk
    fin1: fin((g, q) => q >= 1 && g('rev') > g('rev', 1) && g('rev', 1) > 0),
    fin2: fin((g, q) => q >= 1 && g('rev', 1) > 0 && g('rev') > 1.10 * g('rev', 1)),
    fin3: fin((g, q) => q >= 1 && g('rev', 1) > 0 && g('rev') > 1.20 * g('rev', 1)),
    fin4: fin((g, q) => q >= 1 && g('rev') > 0 && g('rev') < g('rev', 1)),
    fin5: fin(g => g('op') > 0), fin6: fin(g => g('op') < 0),
    fin7: fin((g, q) => q >= 1 && g('op') > g('op', 1)),
    fin8: fin(g => g('rev') > 0 && g('op') >= 0.1 * g('rev')),
    fin9: fin(g => g('net') > 0),
    fin10: fin((g, q) => q >= 1 && g('op', 1) <= 0 && g('op') > 0),
    fin11: fin(g => g('roe') >= 10), fin12: fin(g => g('debt') >= 0 && g('debt') < 100),
    trd1: by2('P', 'MA120', (p, m) => p >= m), trd2: by2('MA60', 'MA60L', (a, b) => a > b), trd3: by1('H60', v => v >= 0.90),
    trd4: by1('MINR', v => v > -0.05), trd5: by1('VOL', v => v < 0.02),
    rk1: rkIn(true), rk2: rkIn(false), rk3: rk(false, r => r <= 5), rk4: rk(false, r => r <= 10), rk5: rk(true),
  };

  /** 낱 조건 하나(N × C · 1 = 참) — 담아 둠 · 고치지 말 것 */
  function atom(id) {
    let m = atoms.get(id);
    if (!m) {
      const b = BUILD[id];
      if (!b) throw new Error(`BLOOM_ATOM_UNKNOWN ${id}`);
      m = b();
      atoms.set(id, m);
    }
    return m;
  }
  /** 후보 이름('a&b' 또는 낱 이름) → 모두 참인 칸(새 배열) */
  function pair(id) {
    const parts = String(id).split('&');
    const out = atom(parts[0]).slice();
    for (let q = 1; q < parts.length; q++) { const m = atom(parts[q]); for (let i = 0; i < NC; i++) out[i] &= m[i]; }
    return out;
  }
  /** 큰 담음(N × C 줄 · 낱 조건)을 비움 — 종가 · 시장 지수 · 바탕 마스크 · 날/업종 크기 셈은 남김 */
  function drop() { big.clear(); atoms.clear(); }

  return {
    N, C, dates, codes: CODES, P, M,
    col: code => { const j = COL.get(code); return j === undefined ? -1 : j; },
    get COUNT() { return core().COUNT; }, get SPROUT() { return core().SPROUT; }, get DEF() { return core().DEF; },
    get FLOWER() { return core().FLOWER; }, get FALL() { return core().FALL; }, get BASEM() { return core().BASEM; },
    atom, pair, drop,
  };
}
