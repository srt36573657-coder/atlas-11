/**
 * ATLAS 11 · 아틀라스 게임 자료(화면 묶음 game.json)
 *   2026-10-02 05:58 사장님 「aaa7377에 연결해야 한다」 — 게임을 사이트(aaa7377.com/game/)에 붙인다.
 *   2026-10-02 06:13 사장님 「더 논리적으로 더 고급스럽게 더 예술적으로 승격하라」 — 판(atlas-game-2): 카드마다 지난 21거래일 종가(출목표·종가 선)를 더했다.
 *   live      지금 발행본의 다음 거래일 하루 — 카드 52장(지난 21거래일 실제 종가 · ATLAS 방향과 확률)
 *   practice  목표일 종가가 이미 나온 바로 앞 발행본 — 연습 판(걸면 그날 실제 종가로 바로 정산)
 *   settled   게임 시작일(GAME_START) 뒤 목표일 종가가 나온 판들 — ATLAS 52억 자동 베팅과 사장님 실전 판 정산에 쓴다
 *   hist      지난 120거래일 후향 판(atlas4h/baselines/atlas11-v1-retro.json 이 있으면 · 읽기만) — ATLAS 베팅법 기록 그래프 · 종목별 맞힌 비율
 * 숫자는 발행본과 입력 종가에서만 가져온다(지어낸 값 없음). 예측 숫자는 고치지 않는다. 같은 입력이면 같은 결과(시각을 쓰지 않음).
 */
export const GAME_START = '2026-10-02';

const r6 = x => Math.round(x * 1e6) / 1e6, r5 = x => Math.round(x * 1e5) / 1e5, r2 = x => Math.round(x * 100) / 100;
const isA11 = p => Boolean(p?.assets?.[0]?.rows?.[1]?.direction?.daily);

/** 통계적 동률: 1·2위 확률 차이가 두 확률의 몬테카를로 표준오차 합(2σ)보다 작으면 「모형 안에서도 못 가른다」(view.mjs 와 같은 식) */
function statisticalTie(d, paths) {
  const p1 = d.probabilities[d.selected], ru = d.runnerUp ?? ['flat', 'up', 'down'].filter(k => k !== d.selected).sort((a, b) => d.probabilities[b] - d.probabilities[a])[0];
  const p2 = d.probabilities[ru], se = Math.sqrt(p1 * (1 - p1) / paths + p2 * (1 - p2) / paths);
  return (p1 - p2) < 2 * se;
}

const DAYS = 21; // 카드에 싣는 지난 종가 수(20거래일의 오르내림 = 바카라 출목표 한 판 · 종가 선)
function card(a, paths) {
  const act = a.actual60, last6 = act.slice(-6), r1 = a.rows[1], d = r1.direction.daily;
  if (act.at(-1).date !== a.anchor.date) throw Error('GAME_ANCHOR ' + a.code);
  return {
    code: a.code, name: a.name, sector: a.sector, close: a.anchor.close,
    c: act.slice(-DAYS).map(x => x.close),
    week: last6.slice(1).map((x, i) => ({date: x.date, close: x.close, ret: r6(x.close / last6[i].close - 1)})),
    weekRet: r6(last6.at(-1).close / last6[0].close - 1),
    f: {sel: d.selected, up: r5(d.probabilities.up), flat: r5(d.probabilities.flat), down: r5(d.probabilities.down), close: Boolean(d.closeCall) || statisticalTie(d, paths), p50: r2(r1.p50), ret: r6(r1.return)},
  };
}
function roundOf(p) {
  const days = p.assets[0].actual60.slice(-DAYS).map(x => x.date);
  // 종목마다 같은 거래일이어야 한 줄로 그릴 수 있다(한 종목이라도 다르면 멈춘다 — 지어 맞추지 않음)
  for (const a of p.assets) if (a.actual60.slice(-DAYS).map(x => x.date).join() !== days.join()) throw Error('GAME_DAYS ' + a.code);
  return {forecastId: p.forecastId, issuedAt: p.issuedAt, actualAsOf: p.actualAsOf, target: p.futureDates[0], days, stocks: p.assets.map(a => card(a, p.paths ?? 20000))};
}

/** 목표일마다 그 날 장이 열리기 전에 낸 마지막 발행본 하나(같은 날 여러 번 내면 마지막) */
function byTarget(publications) {
  const m = new Map();
  for (const p of publications.filter(isA11)) {
    const t = p.futureDates?.[0]; if (!t) continue;
    if (Date.parse(p.issuedAt) >= Date.parse(t + 'T00:00:00+09:00')) continue; // 목표일 당일에 낸 판은 쓰지 않는다
    const cur = m.get(t); if (!cur || Date.parse(p.issuedAt) > Date.parse(cur.issuedAt)) m.set(t, p);
  }
  return m;
}

export function buildGame({publication, publications, input, retro = null}) {
  const price = new Map(input.assets.map(a => [a.code, new Map(a.prices.map(x => [x.date, x.close]))]));
  const live = roundOf(publication);
  const targets = byTarget(publications);
  // 연습 판: 목표일이 지금 발행본의 기준일(마지막 종가 날)인 판
  const prev = targets.get(publication.actualAsOf) ?? null;
  let practice = null;
  if (prev) {
    practice = roundOf(prev);
    for (const s of practice.stocks) { const c = price.get(s.code)?.get(practice.target); s.actual = c == null ? null : {date: practice.target, close: c, ret: r6(c / s.close - 1)}; }
  }
  // 정산된 판: 게임 시작일 뒤 · 목표일 종가가 나온 판(지금 발행본의 기준일까지)
  const settled = [...targets.entries()].filter(([t]) => t >= GAME_START && t <= publication.actualAsOf).sort(([a], [b]) => a.localeCompare(b)).map(([t, p]) => ({
    target: t, forecastId: p.forecastId,
    stocks: p.assets.map(a => { const c = price.get(a.code)?.get(t); return {code: a.code, sel: a.rows[1].direction.daily.selected, ret: c == null ? null : r6(c / a.anchor.close - 1)}; }),
  }));
  // 후향 기록(있으면): 날짜마다 ATLAS 1일째 가장 큰 확률 쪽(같으면 보합→오름→내림) · 실제 등락
  let hist = null;
  if (retro?.rows?.length) {
    const dates = [...new Set(retro.rows.map(r => r.target))].sort(), by = new Map(retro.rows.map(r => [r.code + '|' + r.target, r]));
    const pick = r => { const P = {flat: r.flat, up: r.up, down: r.down}, m = Math.max(P.flat, P.up, P.down); return ['flat', 'up', 'down'].find(k => P[k] === m); };
    hist = {label: '후향', source: 'atlas4h/baselines/atlas11-v1-retro.json', method: retro.method?.model ? `ATLAS 11 v1 방법 · ${retro.method.paths}경로 · 후향 다시 만든 판` : '후향 다시 만든 판', dates,
      stocks: live.stocks.map(({code}) => {
        let s = ''; const r = [];
        for (const d of dates) { const x = by.get(code + '|' + d), pm = price.get(code); const a0 = pm?.get(x?.origin), a1 = pm?.get(d); if (!x || a0 == null || a1 == null) { s += '-'; r.push(0); continue; } const k = pick(x); s += k === 'up' ? 'u' : k === 'down' ? 'd' : '-'; r.push(r6(a1 / a0 - 1)); }
        return {code, s, r};
      })};
  }
  return {schema: 'atlas-game-2', gameStart: GAME_START, rule: '맞히면 건 돈의 2배를 돌려받고, 틀리면 잃고, ±0.1% 안이면 돌려받는다(게임 규칙 · 실제 거래와 관계없음)', live, practice, settled, hist};
}
