/* 아틀라스 게임 · 베팅 엔진(브라우저 · 바깥 의존 없음)
   2026-10-02 06:19 사장님 「자동 베팅방식 중에 이정훈 대표의 베팅방법을 가장 중심으로 한다 · 그 외 세계적인 투자방법·베팅방법 총 5개는 보조로 둔다」
     가운데(CENTER) — 이정훈 대표 방식: 원문을 아직 받지 못했다(인터넷에 공개된 글 없음 · 2026-10-02 06:20 검색). 지어 넣지 않고 자리만 둔다(ready: false).
     보조(AUX) 다섯 — 켈리 공식 · 엘더 2% 규칙 · 그레이엄 정액 분할 · 마틴게일 · 파롤리.
   한 판 = 종목 하나의 하루. 신호 'up'(레버리지) · 'down'(인버스) · null(쉼).
   정산(게임 규칙 · 바카라처럼): 맞히면 건 돈의 2배를 돌려받음(= 건 돈만큼 얻음) · 틀리면 잃음 · ±0.1% 안(보합)이면 돌려받음. */

export const FLAT_BAND = 0.001; // ATLAS 방향 판정과 같은 ±0.1%

export function outcome(ret) { return ret > FLAT_BAND ? 'up' : ret < -FLAT_BAND ? 'down' : 'flat'; }

export function settle(side, amount, ret) {
  const o = outcome(ret);
  const result = o === 'flat' ? 'push' : o === side ? 'win' : 'lose';
  return {result, pnl: result === 'push' ? 0 : result === 'win' ? amount : -amount};
}

/* 켈리: 짝수 배당(맞히면 건 돈만큼)일 때 가장 빨리 불어나는 비율 f* = 2p − 1. p = 그날 전까지 ATLAS 신호가 맞은 비율(보합 뺌).
   처음엔 반반(50:50) 100판을 미리 깔아 흔들림을 줄이고, 그 절반(반 켈리)만 건다. */
export const kellyFraction = pooled => { const w = pooled.win + 50, l = pooled.lose + 50, p = w / (w + l); return {p, f: Math.max(0, 2 * p - 1) / 2}; };

export const SYSTEMS = {
  lee: {
    name: '이정훈 대표 방식', who: '비투엔 공동대표 · 바카라 베팅법', ready: false,
    note: '원문을 받으면 이 자리에서 켭니다',
  },
  kelly: {
    name: '켈리 공식', who: '켈리 1956년 · 소프가 블랙잭과 주식에 씀', ready: true,
    note: '맞힌 비율만큼만 앞서 있다고 보고, 가진 돈의 그 절반만큼 겁니다',
    start: () => ({bet: 0}), next: () => ({bet: 0}),
    sizeAtOpen: (bank, pooled) => Math.floor(bank * kellyFraction(pooled).f),
  },
  elder2: {
    name: '2% 규칙', who: '엘더 『나의 트레이딩 룸』 2002년', ready: true,
    note: '한 번에 가진 돈의 2%만 겁니다',
    start: () => ({bet: 0}), next: () => ({bet: 0}),
    sizeAtOpen: bank => Math.floor(bank * 0.02),
  },
  flat: {
    name: '정액 분할', who: '그레이엄 『현명한 투자자』 1949년', ready: true,
    note: '날마다 같은 돈(1천만 원)을 겁니다',
    start: u => ({bet: u}), next: (s, r, u) => ({bet: u}),
  },
  martingale: {
    name: '마틴게일', who: '18세기 프랑스 · 주식의 「물타기」', ready: true,
    note: '지면 두 배로 · 이기면 처음 1천만 원으로',
    start: u => ({bet: u}), next: (s, r, u) => r === 'lose' ? {bet: s.bet * 2} : r === 'win' ? {bet: u} : s,
  },
  paroli: {
    name: '파롤리', who: '이기면 키우기 · 리버모어의 「불리기」와 같은 뜻', ready: true,
    note: '이기면 두 배로 · 세 번 이기거나 지면 처음 1천만 원으로',
    start: u => ({bet: u, streak: 0}),
    next: (s, r, u) => r === 'win' ? (s.streak + 1 >= 3 ? {bet: u, streak: 0} : {bet: s.bet * 2, streak: s.streak + 1}) : r === 'lose' ? {bet: u, streak: 0} : s,
  },
};
export const CENTER = 'lee';
export const AUX = ['kelly', 'elder2', 'flat', 'martingale', 'paroli'];

/** 여러 종목을 같은 날짜로 함께 돌린다.
    plan: {dates:[...], stocks:[{code, name, days: Map(date → {side, ret})}]}
    opt: {system, unit = 1천만, bank = 1억(카드마다), pooled0 = 그 전까지의 맞힘 수} → 날짜별 합계와 종목별 결과 */
export function runSystem(plan, {system, unit = 1e7, bank = 1e8, pooled0 = null}) {
  const sys = SYSTEMS[system];
  if (!sys || !sys.ready) throw Error('켜지지 않은 베팅법: ' + system);
  const st = plan.stocks.map(s => ({code: s.code, name: s.name, bank, state: sys.start(unit), out: false, bets: 0, win: 0, lose: 0, push: 0, maxBet: 0}));
  const pooled = {win: pooled0?.win ?? 0, lose: pooled0?.lose ?? 0};
  const curve = [];
  for (const date of plan.dates) {
    let staked = 0, pnlDay = 0, w = 0, l = 0;
    plan.stocks.forEach((s, i) => {
      const a = st[i], d = s.days.get(date);
      if (!d || !d.side || a.out) return;
      const want = sys.sizeAtOpen ? sys.sizeAtOpen(a.bank, pooled) : a.state.bet;
      const amount = Math.max(0, Math.min(want, a.bank));
      if (amount <= 0) { if (a.bank < 1) a.out = true; return; }
      const {result, pnl} = settle(d.side, amount, d.ret);
      a.bank += pnl; a.bets++; a[result]++; staked += amount; pnlDay += pnl; a.maxBet = Math.max(a.maxBet, amount);
      a.state = sys.next(a.state, result, unit, {bank: a.bank, pnl, pooled});
      if (result === 'win') w++; else if (result === 'lose') l++;
      if (a.bank < 1) a.out = true;
    });
    // 켈리가 쓰는 「ATLAS 신호가 맞은 비율」 — 건 판만이 아니라 그날 신호 전체 · 그날 결과는 다음 거래일부터 쓴다(앞날 엿보기 없음)
    for (const s of plan.stocks) { const d = s.days.get(date); if (!d || !d.side) continue; const o = outcome(d.ret); if (o === 'flat') continue; if (o === d.side) pooled.win++; else pooled.lose++; }
    curve.push({date, total: st.reduce((x, a) => x + a.bank, 0), staked, pnl: pnlDay, win: w, lose: l});
  }
  const total = st.reduce((x, a) => x + a.bank, 0), start = bank * plan.stocks.length;
  return {system, name: sys.name, unit, bankPerStock: bank, start, end: total, ret: total / start - 1,
    busted: st.filter(a => a.bank < 1).length, maxBet: Math.max(0, ...st.map(a => a.maxBet)),
    bets: st.reduce((x, a) => x + a.bets, 0), win: st.reduce((x, a) => x + a.win, 0), lose: st.reduce((x, a) => x + a.lose, 0), push: st.reduce((x, a) => x + a.push, 0),
    pooled: {...pooled}, curve, stocks: st.map(a => ({code: a.code, name: a.name, end: a.bank, state: a.state, out: a.out, bets: a.bets, win: a.win, lose: a.lose, maxBet: a.maxBet}))};
}
