/**
 * ATLAS 11 · 날짜별 설명 — 그 종목의 실제 입력·변화율·기여·뉴스 사용 여부·출처·미확보를 그 종목 숫자로만 쓴다.
 * 문장은 숫자에서 만들어지며 기업마다 다르다. 인과 확정이 아니라 선택 모형 안의 설명이다.
 */
const finite = x => typeof x === 'number' && Number.isFinite(x);
const pct = (x, d = 2) => finite(x) ? (x > 0 ? '+' : x < 0 ? '−' : '') + Math.abs(x * 100).toFixed(d) + '%' : '미산출';
// 글 날짜는 한 모양: 「10월 1일(목)」
const WD = ['일', '월', '화', '수', '목', '금', '토'];
const korDate = d => `${Number(d.slice(5, 7))}월 ${Number(d.slice(8, 10))}일(${WD[new Date(d.slice(0, 10) + 'T00:00:00Z').getUTCDay()]})`;
const won = x => finite(x) ? Math.round(x).toLocaleString('ko-KR') + '원' : '미산출';
const dirWord = {up: '상승', flat: '보합', down: '하락'};
const FEATURE_LABEL = {'자체 1일': '자기 1일 수익률', '자체 2일': '자기 2일 수익률', '자체 5일': '자기 5일 수익률', '자체 20일': '자기 20일 수익률', '자체 60일': '자기 60일 수익률', 'ATLAS52 상승·하락 폭': '52종목 상승·하락 폭', 'ATLAS52 5일 평균': '52종목 5일 평균 수익률'};

export function originInputs(asset) {
  const closes = asset.actual60.map(r => r.close), last = closes.at(-1);
  const ret = n => closes.length > n ? last / closes[closes.length - 1 - n] - 1 : null;
  return {close: last, date: asset.anchor.date, return1: ret(1), return5: ret(5), return20: ret(20), return60: closes.length >= 60 ? last / closes[0] - 1 : null, high60: Math.max(...closes), low60: Math.min(...closes), ma20: closes.slice(-20).reduce((s, x) => s + x, 0) / 20};
}

/** 관측 상태 라벨 · 예측 방향이 아니다 */
export function observedState(asset) {
  const o = originInputs(asset);
  const label = o.close > o.ma20 && o.return20 > 0 ? 'Bull' : o.close < o.ma20 && o.return20 < 0 ? 'Bear' : 'Neutral';
  return {label, basis: '종가와 20일 평균·20일 수익률 비교 · 관측 상태이며 예측 방향이 아님', ma20: o.ma20, return20: o.return20};
}

export function explainAsset(asset, {panelBreadth = null, panelBasket5 = null, missingFactors = []} = {}) {
  const o = originInputs(asset), byDate = {};
  const contributionsLabel = (row) => Object.entries(row.factor36?.contributions ?? {}).map(([f, v]) => ({factorId: f, name: f === 'F35' ? '자기 추세(1·2·5·20·60일)' : f === 'F11' ? '52종목 폭·평균' : f, dailyLogReturn: v, share: row.factor36.shares?.[f] ?? null}));
  // 실제 구간 (지난 60거래일)
  for (let j = 0; j < asset.actual60.length; j++) {
    const r = asset.actual60[j], prev = asset.actual60[j - 1];
    byDate[r.date] = {date: r.date, kind: 'actual', close: r.close, dailyChange: prev ? r.close / prev.close - 1 : null,
      text: `${korDate(r.date)} 실제 종가 ${won(r.close)}${prev ? ' · 전 거래일 대비 ' + pct(r.close / prev.close - 1) : ''}. 이 날은 관측값이며 전망이 아닙니다.`,
      sources: [{name: '가격 출처', url: asset.anchor.sourceUrl}]};
  }
  // 출발점
  byDate[asset.anchor.date] = {...byDate[asset.anchor.date], kind: 'anchor', text: `${korDate(asset.anchor.date)} 확정 종가 ${won(asset.anchor.close)}에서 이 발행본의 전망이 출발합니다(첫 점 차이 0원). 최근 1거래일 ${pct(o.return1)}, 5거래일 ${pct(o.return5)}, 20거래일 ${pct(o.return20)}, 60거래일 ${pct(o.return60)}. 20거래일 평균 ${won(o.ma20)} 대비 ${pct(o.close / o.ma20 - 1)}.`, inputs: o, state: observedState(asset)};
  // 전망 구간
  for (let h = 1; h < asset.rows.length; h++) {
    const row = asset.rows[h], prevRow = asset.rows[h - 1], d = row.direction, c = contributionsLabel(row);
    const events = (asset.news ?? []).filter(n => n.date === row.date);
    const bandWidth = (row.p90 - row.p10) / asset.anchor.close;
    const dailyLine = `${korDate(row.date)}(${h}거래일 뒤) 중앙 전망 ${won(row.p50)} · 전날 전망점 대비 ${pct(row.dailyP50Change)} · 출발가 대비 ${pct(row.return)}.`;
    const bandLine = `80% 모형 범위 ${won(row.p10)}~${won(row.p90)}(출발가의 ${pct(bandWidth, 1)} 폭) · 하루 등락 80% 범위 ${pct(row.dailyMovement.returnP10, 1)}~${pct(row.dailyMovement.returnP90, 1)}.`;
    const dirLine = `이 날 하루 방향은 ${dirWord[d.daily.selected]}(모형 비율 상승 ${(d.daily.probabilities.up * 100).toFixed(1)}% · 보합 ${(d.daily.probabilities.flat * 100).toFixed(1)}% · 하락 ${(d.daily.probabilities.down * 100).toFixed(1)}%${d.daily.closeCall ? ' · 확률이 비슷함' : ''}${d.daily.exactTie ? ' · 동률→규칙 선택' : ''}). 출발가 대비 누적 방향은 ${dirWord[d.cumulative.selected]}(상승 ${(d.cumulative.probabilities.up * 100).toFixed(1)}% · 하락 ${(d.cumulative.probabilities.down * 100).toFixed(1)}%${d.cumulative.closeCall ? ' · 확률이 비슷함' : ''}). 모형 비율은 실제 적중률이 아닙니다.`;
    const contribLine = c.length ? `하루 기대 로그수익률 ${(row.factor36.meanLogReturn * 100).toFixed(3)}%p = 절편 ${(row.factor36.intercept * 100).toFixed(3)}%p + ` + c.map(x => `${x.name} ${(x.dailyLogReturn * 100).toFixed(3)}%p(${finite(x.share) ? x.share.toFixed(0) + '%' : '-'})`).join(' + ') + '. 기여도는 선택 모형 안의 설명이며 인과 확정이 아닙니다.' : '기여 분해 없음.';
    const newsLine = events.length ? `이 날 일정 ${events.length}건: ` + events.map(e => `${e.name}(${e.important ? '중요' : '참고'} · 수치 미반영)`).join(', ') + '. 일정은 설명 자료이며 전망 숫자에 넣지 않았습니다.' : '이 날 확인된 일정 없음.';
    byDate[row.date] = {date: row.date, kind: 'forecast', horizon: h, p10: row.p10, p50: row.p50, p90: row.p90, dailyP50Change: row.dailyP50Change, cumulativeReturn: row.return, direction: {daily: {selected: d.daily.selected, probabilities: d.daily.probabilities, closeCall: d.daily.closeCall, exactTie: d.daily.exactTie, monteCarloSE: d.daily.monteCarloSE}, cumulative: {selected: d.cumulative.selected, probabilities: d.cumulative.probabilities, closeCall: d.cumulative.closeCall, monteCarloSE: d.cumulative.monteCarloSE}},
      contributions: c, intercept: row.factor36?.intercept ?? null, meanLogReturn: row.factor36?.meanLogReturn ?? null, dailyRange: {p10: row.dailyMovement.returnP10, p90: row.dailyMovement.returnP90}, scenarioPrice: asset.scenario?.prices?.[h] ?? null,
      events: events.map(e => ({id: e.id, name: e.name, kind: e.kind, important: e.important, used: false, numericImpactAllowed: false, reason: e.reason, sources: e.sources})),
      missing: ['뉴스 수치 영향(미산출)', '전체 FOMO(미확보 · 가격 열기 부분지표만)', ...missingFactors.slice(0, 3).map(f => f + ' 등 외부 요인 ' + missingFactors.length + '개 미확보')].slice(0, 3),
      sources: [{name: '가격 출처(출발 종가)', url: asset.anchor.sourceUrl}, ...events.flatMap(e => e.sources.map(s => ({name: e.name + ' · ' + (s.name ?? '출처'), url: s.url})))],
      text: [dailyLine, bandLine, dirLine, contribLine, newsLine].join(' ')};
  }
  return {code: asset.code, name: asset.name, inputs: o, state: observedState(asset), byDate};
}
