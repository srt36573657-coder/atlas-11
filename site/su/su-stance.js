/* 세 태세(주문 1120-0728 · 사장님 2026-11-20(마카오) 07:28 「… 제갈공명이 이 손자병법을 통해 공격형 지략 그리고 보편적 지략 그리고 수비형 지략을 전술화하여 …」 · 07:32 「맞아」)
   참모 서른여섯 2차 표 — 샘플 셋 s04 「온전한 한 판」(22표 · 잃는 돈 먼저) · s01 「먼저 지킨 뒤 기다림」(18표 · 수비가 바탕 · 때가 아니면 지붕을 닫음) · d02 「세 깃발 한 장」(17표 · 오늘 한 장 줄을 바꿔 씀 · 세 줄 같은 크기)
   지난 같은 땅 기록(su21.json 의 sun.rank)으로만 고름 — 앞날을 맞히지 않음 · 사고팔기를 권하지 않음 · 수익을 앞세운 순위가 아님(줄 차례는 늘 수비 → 보편 → 공격)
   수비형 = 덜 잃은 차례(본질 8) 맨 위 · win3(아무렇게나 고른 일곱보다 덜 자주 · 덜 깊게 잃은 꾀)가 있으면 그 첫째
   공격형 = 남은 꾀 가운데 평균(닷새 뒤)이 가장 높은 꾀 — 평균이 0 넘고 · 아무렇게나 일곱보다 더 자주 잃지 않은 꾀만 · 없으면 비움(억지로 채우지 않음)
   보편형 = 남은 꾀 가운데 「잃은 몫 차례 + 평균 차례」가 가장 고른 꾀(아무렇게나 일곱보다 더 자주 잃은 꾀는 뺌) · 없으면 비움
   센 날이 minN(같은 땅 날이 모자라면 모든 날로 셈 — su21_sun.py MIN_N) 아래인 꾀는 쓰지 않음 · 한 꾀는 한 태세에만
   이 파일은 다른 파일을 부르지 않음(시험 tests/atlas11/su-stance.test.mjs 가 바로 읽음) */
export const STANCE_RULE = 'stance3-v1';
export const STANCES = Object.freeze([
  Object.freeze({st: 'def', tag: '수비형', say: '덜 잃은 꾀'}),
  Object.freeze({st: 'mid', tag: '보편형', say: '고루 갖춘 꾀'}),
  Object.freeze({st: 'att', tag: '공격형', say: '평균이 높은 꾀'})]);
const fin = v => typeof v === 'number' && Number.isFinite(v);
/** 셀 수 있는 줄 — 센 날 minN 넘게 · 잃은 날 · 가장 나쁜 날 · 평균이 모두 있음 */
export const okRow = (r, minN) => !!r && typeof r.k === 'string' && /^g\d\d$/.test(r.k) && Number.isInteger(r.n) && r.n >= minN
  && Number.isInteger(r.lose) && r.lose >= 0 && r.lose <= r.n && fin(r.avg) && fin(r.worst) && r.worst <= r.avg;
/** 아무렇게나 고른 일곱보다 더 자주 잃지 않음(그 값이 없으면 견주지 않음) */
const notWorse = r => !fin(r.exp) || r.lose <= r.exp;
const minNOf = S => (Number.isInteger(S?.minN) && S.minN > 0 ? S.minN : Number.isInteger(S?.win3?.minN) && S.win3.minN > 0 ? S.win3.minN : 20);
/** 세 태세 — {rule, minN, def, mid, att} · 줄(sun.rank 한 줄) 또는 null */
export function stance3(S) {
  const minN = minNOf(S), rows = (Array.isArray(S?.rank) ? S.rank : []).filter(r => okRow(r, minN)), byK = new Map(rows.map(r => [r.k, r]));
  const w3 = (S?.win3?.rule === 'win3-v1' && Array.isArray(S.win3.ks) ? S.win3.ks : []).map(k => byK.get(k)).filter(Boolean);
  const def = w3[0] ?? rows[0] ?? null, used = new Set(def ? [def.k] : []);
  const pool = rows.filter(r => !used.has(r.k) && notWorse(r)), lr = r => r.lose / r.n, at = i => rows.indexOf(i);
  const att = pool.filter(r => r.avg > 0).sort((a, b) => b.avg - a.avg || lr(a) - lr(b) || at(a) - at(b))[0] ?? null;
  if (att) used.add(att.k);
  const rest = pool.filter(r => !used.has(r.k)), byL = [...rest].sort((a, b) => lr(a) - lr(b) || at(a) - at(b)), byA = [...rest].sort((a, b) => b.avg - a.avg || at(a) - at(b));
  const sc = r => byL.indexOf(r) + byA.indexOf(r), mid = [...rest].sort((a, b) => sc(a) - sc(b) || at(a) - at(b))[0] ?? null;
  return {rule: STANCE_RULE, minN, def, mid, att};
}
/** 100원이 ○원(소수 한 자리 · 「.0」 지움) — su-sonja.js w100 과 같은 꼴 */
export const won100 = r => (fin(r) ? (100 * (1 + r)).toFixed(1).replace(/\.0$/, '') + '원' : null);
/** 가장 나쁜 날 잃은 몫(100원 가운데 · 0~100) — 막대 짙은 곳 */
export const lostOf100 = r => (fin(r?.worst) ? Math.max(0, Math.min(100, Math.round(-r.worst * 1000) / 10)) : null);
