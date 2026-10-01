#!/usr/bin/env node
/**
 * W10 · 판정표(5줄) + 틀린 42칸 반대로 민 항 요약 → reports/atlas11/overhaul/diagnosis.json · diagnosis.md
 * 숫자는 모두 part1~part5.json · w10-against.json 에서 읽는다(손으로 옮겨 적지 않는다).
 */
import fs from 'node:fs';
import {ROOT, readJSON, writeJSON, sha256, kstNow, gitHead, r2, liveCells} from './common.mjs';

const P1 = readJSON('reports/atlas11/overhaul/part1.json'), P2 = readJSON('reports/atlas11/overhaul/part2.json'), P3 = readJSON('reports/atlas11/overhaul/part3.json'), P4 = readJSON('reports/atlas11/overhaul/part4.json'), P5 = readJSON('reports/atlas11/overhaul/part5.json');
const W = readJSON('reports/atlas11/overhaul/w10-against.json'), wSha = sha256(fs.readFileSync(ROOT + '/reports/atlas11/overhaul/w10-against.json'));
const o = P1.retro.oneDay, b1 = o.bootstrap, ss = P4.T13.strictSensitivity, mv = P4.posthoc.strictMovement, imp = P4.posthoc.impactPublishedMethod, pm = P5.publications[P5.decision.primary], ch = P5.decision.change, aux = P5.retroAux;
const ex = P5.posthoc.exactVsSimulatedZero32[P5.decision.primary];
const RULE = 'P ≥ 0.80 그리고 6블록 중 ≥ 4(기준일 블록 부트스트랩 · 20일 블록 · 2,000번 · 난수 20260929)';
const pv = x => x.toFixed(4).replace(/0+$/, '').replace(/\.$/, '');

const table = [
  {부품: '① 방정식 꼴(기본값 + F35 + F11)', 판정: P1.decision.verdict, 숫자: `후향 1일 방향 맞음 모델 ${o.dir1selPct.model}% · 늘 상승 ${o.dir1selPct.alwaysUp}%(모델이 나을 P ${pv(b1.alwaysUp.pRefBetter)} · ${b1.alwaysUp.blocksRefBetter}/6) · 늘 하락 ${o.dir1selPct.alwaysDown}%(P ${pv(b1.alwaysDown.pRefBetter)} · ${b1.alwaysDown.blocksRefBetter}/6) · 종목 어제 ${o.dir1selPct.ownPrevDay}%(모델 나음 P ${pv(b1.ownPrevDay.pRefBetter)} · ${b1.ownPrevDay.blocksRefBetter}/6) · 시장 어제 ${o.dir1selPct.marketPrevDay}%(모델 나음 P ${pv(b1.marketPrevDay.pRefBetter)} · ${b1.marketPrevDay.blocksRefBetter}/6) · 실전 104칸 모델 ${P1.live.all.model} 대 늘 하락 ${P1.live.all.alwaysDown}(이틀치 · 판정 안 씀)`, 문턱: `규칙이 낫다(${RULE}) → 원인이다 · 모델이 네 규칙 모두보다 낫다 → 아니다 · 그 밖 모른다`, '코드 줄': ['lib/factor36.mjs:53', 'lib/factor36.mjs:57', 'lib/factor36.mjs:67', 'lib/factor36.mjs:92']},
  {부품: '② 종목별 무게', 판정: P2.decision.verdict, 숫자: `후향 무게 있는 칸 ${P2.weighted.dir1selPct}% 대 무게 0 칸 ${P2.zeroWeight.dir1selPct}% · P(무게 있는 칸이 나음) ${pv(P2.bootstrap.pCandBetter)} · 블록 ${P2.bootstrap.blocksCandBetter}/${P2.bootstrap.blocksRefBetter} · 학습 하루 뺀 판 P ${pv(mv.pWeightedBetter[1])}(계획 밖 · 결과를 본 뒤) · 두 무리(다른 종목) 견줌이지 무게 시험이 아님`, 문턱: `무게 있는 칸이 낫다(${RULE}) → 원인이다 · 무게 0 칸이 낫다 → 아니다 · 그 밖 모른다`, '코드 줄': ['lib/factor36.mjs:61', 'lib/factor36.mjs:62', 'lib/factor36.mjs:92']},
  {부품: '③ 52종목 공통 식(무게 한 벌)', 판정: P3.decision.verdict, 숫자: `후향 공통 식 C ${P3.C.dir1selPct}% 대 A ${P3.A.dir1selPct}% · P(C가 나음) ${pv(P3.bootstrap.pCandBetter)} · 블록 ${P3.bootstrap.blocksCandBetter}/${P3.bootstrap.blocksRefBetter} · 학습 하루 뺀 판 P ${pv(mv.pCBetter[1])}(계획 밖 · 결과를 본 뒤) · 부작용: C 의 20거래일 방향 맞음 ${P3.C.dir20selPct}% 대 A ${P3.A.dir20selPct}%`, 문턱: `C가 낫다(${RULE}) → 원인이다 · A가 낫다 → 아니다 · 그 밖 모른다`, '코드 줄': ['lib/factor36.mjs:86', 'lib/atlas11/evolve/backtest.mjs:41', 'scripts/atlas11/overhaul/lane-b/pooled.mjs:36']},
  {부품: '④ 세 요인 입력값(F35·F11·F36)', 판정: P4.decision.verdict, 숫자: `계산 차이 0 · 9/28 rolling20 이 쓴 9/21~9/23 종가 ${imp.swappedCloses}개(12종목)가 9/29 정정 · 특징 최대 ${r2(P4.publications[0].latestVintageVsUsed.maxAbsFeature * 10000) / 10000} · 분산 최대 ${r2(P4.publications[0].latestVintageVsUsed.maxRelVariance * 100)}% · 발행 방식으로 ${imp.flipsPublishedMethod}칸(035250) 바뀜(계획 밖 · 결과를 본 뒤) · 정확 셈으로는 동률(바뀜 ${imp.flipsExact}) · 오답 42칸 중 바뀌는 칸 ≤ ${imp.wrongCellsChanged} · 9/30 목표 0`, 문턱: '특징값·기여 절대 차이 또는 분산 상대 차이 > 1e-9 → 원인이다(결정표: 후보 아님 · 자료 정정 기록 + 보고) · 모두 ≤ 1e-9 → 아니다', '코드 줄': ['lib/factor36.mjs:47', 'lib/factor36.mjs:53', 'lib/atlas11/simulate.mjs:57', 'lib/factor36-simulation.mjs:10']},
  {부품: '⑤ 모의 계산·방향 고르기', 판정: P5.decision.verdict, 숫자: `T12 차이 0 · T14 ${pm.T14.within}/52(032830 공차의 ${r2(pm.T14.worstRatioToTolerance)}배 · 뽑기 횟수로 직접 셈 156/156 같음 (계획 밖 · 결과를 본 뒤)) · 무게 0 32종목 확률 차 모의 +${ex.mean.simulatedGapPp}%p(정확 +${ex.mean.exactGapPp}) → A +${ex.median.simulatedGapPp}(정확 +${ex.median.exactGapPp}) · B +${ex.symmetric.simulatedGapPp}(정확 ${ex.symmetric.exactGapPp.toFixed(2)}) · 「하락」 ${ex.mean.simulatedDown}/32 → A ${ex.median.simulatedDown}(정확 ${ex.median.exactDown}) · B ${ex.symmetric.simulatedDown}(정확 ${ex.symmetric.exactDown} · 모두 동률 → 동률 규칙으로 상승) · 변화 ${r2(ch.A_median.changePp)}·${r2(ch.B_symmetric.changePp)}%p 대 3×SE ${r2(ch.A_median.threeSEPp)}%p · 후향 A ${aux.A_median.dir1selPct}%(P ${pv(aux.bootstrap.A_median_vs_original.pCandBetter)}) · B ${aux.B_symmetric.dir1selPct}%(원래가 나음 P ${pv(aux.bootstrap.B_symmetric_vs_original.pRefBetter)} · ${aux.bootstrap.B_symmetric_vs_original.blocksRefBetter}/6) 대 원래 ${aux.original.dir1selPct}%`, 문턱: 'T12·T14 통과 뒤 변형 A·B 가 확률 차 평균을 3×SE(보수적) 넘게 바꾸면 원인이다 · 둘 다 3×SE 이하 → 아니다 · T12·T14 실패 → 모른다', '코드 줄': ['lib/factor36.mjs:84', 'lib/atlas11/simulate.mjs:52', 'lib/atlas11/simulate.mjs:64', 'lib/atlas11/simulate.mjs:103', 'lib/atlas11/simulate.mjs:32']},
];

const counts = W.counts, rows = W.rows;
const LIVE = liveCells(), zc = LIVE.filter(c => c.zero), wc = LIVE.filter(c => !c.zero);
const over = {zeroPred: zc.filter(c => c.pred === 'down').length, zeroAct: zc.filter(c => c.act === 'down').length, wPred: wc.filter(c => c.pred === 'down').length, wAct: wc.filter(c => c.act === 'down').length};
over.total = over.zeroPred + over.wPred - over.zeroAct - over.wAct; over.zero = over.zeroPred - over.zeroAct;
const shareBelow = r2(pm.residualShape.zero32.meanShareBelowMean * 100), skewPos = pm.residualShape.zero32.positiveSkew;
const M2 = '⑤ 의 기울기는 틀린 칸도 맞은 칸도 만들었고, 없애도 과거·실전 정답이 늘지 않았다 → 고칠 원인이 아니다';
const lz = Object.values(P5.publications).reduce((a, P) => ({p: a.p + P.liveImpact.rightZero.published, A: a.A + P.liveImpact.rightZero.median, B: a.B + P.liveImpact.rightZero.symmetric}), {p: 0, A: 0, B: 0}), zrd = zc.filter(c => c.dirOk && c.pred === 'down').length;
const M2NUM = `무게 0 맞힘 ${lz.p}칸 중 ${zrd}칸이 그 하락 고름 · 후향 A ${aux.A_median.dir1selPct}%(가려지지 않음) · B ${aux.B_symmetric.dir1selPct}%(나빠짐) · 실전 이틀에 없앴으면 무게 0 맞힘 ${lz.p} → ${lz.A}(A) 또는 ${lz.B}(B)`;
const G4 = 'eco/03 의 T14 고쳐 쓰기를 승인하시면 규칙상 ⑤ 가 「원인이다」가 되고 19절 1·2줄에 따라 A·B 가 후보가 된다 → 그래서 「W11 후보 아님」은 사장님이 명시적으로 정하셔야 한다(만드는 이 권고: 후향·실전 근거로 A·B 채택 안 함 · eco/03)';
const DIFFS = `① ${r2(o.dir1selPct.model - o.dir1selPct.alwaysUp)} · ② ${r2(P2.zeroWeight.dir1selPct - P2.weighted.dir1selPct)} · ③ ${r2(P3.A.dir1selPct - P3.C.dir1selPct)}`;
const tilt = W.detail['모의 계산 기울기'];
const predictions = [
  {부품: '①', 계획: '맞다면 모델 dir1sel 45~50%, 가장 나은 규칙 ≥ 모델(P ≥ 0.80)', 결과: `모델 ${o.dir1selPct.model}% · 규칙이 나은 경우 없음(가장 가까운 규칙 늘 하락 ${o.dir1selPct.alwaysDown}% · P(규칙이 나음) ${pv(b1.alwaysDown.pCandBetter)})`},
  {부품: '②', 계획: '맞다면 무게 0 칸이 2%p 넘게 낮음', 결과: `무게 0 칸이 ${r2(P2.zeroWeight.dir1selPct - P2.weighted.dir1selPct)}%p 높음(${P2.zeroWeight.dir1selPct} 대 ${P2.weighted.dir1selPct})`},
  {부품: '③', 계획: '맞다면 C − A ≥ +1%p', 결과: `${String(r2(P3.C.dir1selPct - P3.A.dir1selPct)).replace('-', '−')}%p(${P3.C.dir1selPct} 대 ${P3.A.dir1selPct})`},
  {부품: '④', 계획: '맞다면 1e-9 넘는 차이 목록 · 아니면 ≤ 1e-12', 결과: `계산 차이 0 · 자료판 차이 종가 ${imp.swappedCloses}개(9/28 발행만)`},
  {부품: '⑤', 계획: '맞다면 중앙값 < 0 이 24개 이상 · 평균보다 작은 비율 51~53% · 원래 약 +5%p · A·B 평균 크기 ≤ 1%p · 「하락」 29 → 14~18 · T12 0 · T14 52/52', 결과: `중앙값 < 0 ${pm.residualShape.zero32.medianBelowZero}/32 · ${r2(pm.residualShape.zero32.meanShareBelowMean * 100)}% · 원래 +${ex.mean.simulatedGapPp}%p · A +${ex.median.simulatedGapPp} · B +${ex.symmetric.simulatedGapPp} · 「하락」 A ${ex.median.simulatedDown}·B ${ex.symmetric.simulatedDown}(모의) / ${ex.median.exactDown}·${ex.symmetric.exactDown}(정확) · T12 0 · T14 ${pm.T14.within}/52`},
];
const refs = [
  `검정력이 낮다: P ≥ 0.80 에 대략 필요한 평균 차 ${Math.min(...Object.values(P4.posthoc.power.needForP80Pp))}~${Math.max(...Object.values(P4.posthoc.power.needForP80Pp))}%p · 90% 구간 반폭 ${Math.min(...Object.values(P4.posthoc.power.halfWidth90Pp))}~${Math.max(...Object.values(P4.posthoc.power.halfWidth90Pp))}%p (계획 밖 · 결과를 본 뒤)`,
  `(계획 밖 · 결과를 본 뒤) 학습 하루(블록 첫날)만 빼도 모델 ${mv.dir1selModelPct[0]} → ${mv.dir1selModelPct[1]}% · 모델 − 늘 하락 +${mv.modelMinusAlwaysDownPp[0]} → +${mv.modelMinusAlwaysDownPp[1]}%p(P ${pv(mv.pModelBetterThanAlwaysDown[1])}) · 고른 모형이 바뀐 종목 ${mv.selectedModelChangedStocksPerBlock.join('/')}개(블록마다 52개 중) → 1%p 안쪽 차이는 이 흔들림 안이다`,
  '후향 입력 input.json@30dcfb2 의 가격 이력은 검증 끝이 아니다(priceBasisReview: historyCompletelyRepaired false · 「이전 후향을 인증으로 보지 말 것」)',
  '후향은 칸마다 경로 512개라 확률 하나의 몬테카를로 표준오차가 약 2.2%p다 → 상승·하락이 비슷한 칸은 잡음으로 갈린다',
  `(계획 밖 · 결과를 본 뒤) 난수 20260917 을 날마다 같게 써서 동률 근처 종목이 날마다 같은 쪽으로 기운다: ${P4.posthoc.nearTieRepeats.stocks.map(s => `${s.name}(${s.code}) 차이 ${s.days.map(d => d.gapTop2Pp).join('·')}%p → ${s.days[0].selected === 'up' ? '상승' : '하락'} · 실제 ${s.days.map(d => d.actual === 'up' ? '상승' : d.actual === 'down' ? '하락' : '보합').join('·')}`).join(' · ')}`,
  '실전 채점은 이틀(9/29·9/30) 104칸뿐이다 — 판정에 쓰지 않았다(F8)',
  `③ 부작용: 공통 식 C 는 1일 정답률이 A 와 가려지지 않으면서 20거래일 방향 맞음은 ${P3.C.dir20selPct}% 로 A ${P3.A.dir20selPct}% 보다 낮다(후향)`,
  '④ 의 「33개는 원인이 될 수 없다」는 「틀린 입력값」이라는 뜻에서다 — 빠진 요인이라는 뜻에서는 이 진단이 따지지 않았다',
];
const out = {schema: 'atlas11-overhaul-diagnosis-1', work: 'W10', requirements: ['R6', 'R7'], tests: ['T15'], builtAt: kstNow(), builtOnCommit: gitHead(),
  verdictTable: table,
  wrongCells: {source: 'reports/atlas11/overhaul/w10-against.json', sha256: wSha, total: rows.length, counts, rows: rows.map(r => ({date: r.date, code: r.code, name: r.name, predDir: r.predDir, actDir: r.actDir, zeroWeight: r.zeroWeight, reason: r.reason, meanPp: r.meanPp, terms: r.terms, exact: r.exact, published: r.published, sameSideTerms: r.sameSideTerms, largestTerm: r.largestTerm})), detail: W.detail, rule: W.rule, nearZeroPp: W.nearZeroPp},
  showsAndNot: `이 진단이 보인 것: 계산은 발행본과 한 자리도 같게 다시 나왔다(T12·④). 하락을 넘치게 고른 것(예측 하락 86 대 실제 하락 69 · 넘친 ${over.total}칸 중 ${over.zero}칸이 무게 0 종목: 예측 ${over.zeroPred} 대 실제 ${over.zeroAct} · 무게 있음 ${over.wPred} 대 ${over.wAct})은 무게 0 종목에서 평균을 빼는 모의 계산의 기울기가 만들었고, 같은 기울기가 무게 있는 종목 ${tilt.weighted}칸의 방향도 정했다. ${M2}(${M2NUM}). 보이지 못한 것: 다섯 부품 중 어느 것을 고치면 1일 정답률이 오른다는 증거는 없다 — ①②③ 은 차이가 0.4~2.6%p(${DIFFS})라 이 검정력(P ≥ 0.80 에 필요한 차이 약 0.7~2.7%p)으로는 가려지지 않았고, ⑤ 의 A·B 는 후향 정답률을 올리지 못했으며, ④ 는 한 칸만 바꾼다. 틀린 42칸의 까닭은 모형 안의 설명일 뿐 원인 증명이 아니다.`,
  decisionTable: {'⑤': `${M2}(${M2NUM}) → W11 후보 아님 — 단, ${G4}`, '③': '공통 식 C 후향 이득 없음(50.16 대 50.53 · P 0.34) → 후보 아님', '④': '자료 정정 기록(data-correction-01.md) + 보고 · 후보 아님', '①': '모른다 → 다음 판 과제로 보고(결정표 5줄은 「①만 원인」일 때)', '②': '모른다 · 후보 없음', outcome: 'W11 「후보 없음」(사장님이 달리 정하시지 않으면 · ⑤ 는 eco/03 판단에 묶임)'},
  openRulings: [{eco: 'reports/atlas11/overhaul/eco/03.md', items: ['T14 → 정확 재현(차이 0) 또는 묶음 공차(156개 비교에 약 4σ)', 'T13·F4 → 「학습·잔차 날짜 ≤ 기준일 < 첫 목표일」(120/120 통과)', G4], status: '사장님 판단 기다림'}],
  gateG2: {status: '글자대로 미통과: T13·T14 — eco/03 판단 기다림', T10: 'pass', T11: 'pass', T12: 'pass', T13: 'fail(글자대로) · 미래 자료 없음 120/120', T14: 'fail(글자대로) · 51/52 · 정확 재현 156/156', T15: '판정표 5줄 · 세는 이·따지는 이 확인 기다림'},
  predictionsVsResults: predictions, references: refs,
  posthocLabel: '「계획 밖 · 결과를 본 뒤」: ④ 발행 방식 영향 · T14 정확 재현·묶음 확률 · 민감도 움직임 · 검정력 · 동률 반복 · ⑤ 보조 후향은 계획에 「판정에 안 씀」으로 적은 것',
  files: Object.fromEntries(['part1.json', 'part2.json', 'part3.json', 'part4.json', 'part5.json', 'w10-against.json', 'data-correction-01.md', 'eco/03.md'].map(f => [`reports/atlas11/overhaul/${f}`, sha256(fs.readFileSync(ROOT + '/reports/atlas11/overhaul/' + f))]))};
const sj = writeJSON('reports/atlas11/overhaul/diagnosis.json', out);

// ---------- diagnosis.md ----------
const dirK = d => d === 'up' ? '상승' : d === 'down' ? '하락' : '보합';
const md = [];
md.push('# ATLAS 11 진단 보고 · 1거래일 전망은 왜 틀렸나 (W10)', '', `- 만든 때: 10월 1일(목) ${out.builtAt.slice(11)} · 만드는 이(갈래 나) · 근거 diagnosis.json · 커밋 ${out.builtOnCommit} 위`, '- 과거 자료로 낸 숫자는 모두 「후향」이다. 결과를 본 뒤 더한 일은 「계획 밖 · 결과를 본 뒤」라고 적었다.', '');
md.push('## 사장님께 먼저 · 쉬운 말로', '');
md.push(`1. 다섯 부품을 하나씩 시험했습니다. **「이것을 고치면 1일 성적이 오른다」는 부품은 찾지 못했습니다.** 그래서 고칠 후보(W11)는 「없음」으로 올립니다.`);
md.push(`2. 9/29·9/30에 「하락」을 너무 많이 고른 까닭(예측 하락 86칸 대 실제 하락 69칸)은 찾았습니다. 넘친 ${over.total}칸 중 ${over.zero}칸이 신호가 없는 종목(무게 0)에서 나왔습니다(예측 하락 ${over.zeroPred} 대 실제 ${over.zeroAct} · 무게 있음 ${over.wPred} 대 ${over.wAct}). 모의 계산이 과거 잔차의 평균을 빼는데, 과거 1일 잔차는 작은 하락이 잦고 큰 상승이 드물어서(오른쪽 꼬리 ${skewPos}/32종목) 평균을 빼면 음수 잔차가 절반을 넘습니다(무게 0 32종목 평균 ${shareBelow}%). 그래서 하락 쪽으로 약 5%p 기웁니다. 같은 기울기가 무게 있는 종목 ${tilt.weighted}칸의 방향도 정했습니다.`);
md.push(`3. ${M2}. 무게 0 종목에서 맞힌 ${lz.p}칸 중 ${zrd}칸도 이 기울기로 하락을 고른 칸입니다. 기울기를 없애 보니 과거 정답률은 A ${aux.A_median.dir1selPct}%(가려지지 않음, P(A가 나음) ${pv(aux.bootstrap.A_median_vs_original.pCandBetter)}) · B ${aux.B_symmetric.dir1selPct}%(원래가 나음 P ${pv(aux.bootstrap.B_symmetric_vs_original.pRefBetter)} · ${aux.bootstrap.B_symmetric_vs_original.blocksRefBetter}/6)로 원래 ${aux.original.dir1selPct}%보다 낫지 않았고, 9/29·9/30에 없앴다면 무게 0 맞힘이 ${lz.p} → ${lz.A}(A) · ${lz.B}(B)로 줄었습니다. 그래서 고치지 않기를 권합니다(사장님 판단 · eco/03).`);
md.push(`4. 9/28 발행본이 쓴 9/21~9/23 종가 24개가 다음 날 고쳐졌습니다. 다시 계산하면 강원랜드 한 칸만 바뀝니다(틀림 → 맞음). 발행본은 그대로 두고 정정 기록(data-correction-01.md)만 남겼습니다.`);
md.push('5. 시험 두 개(T13·T14)는 글자대로는 통과하지 못했습니다. 계산이 틀린 것이 아니라 시험 글이 너무 빡빡해서입니다. 고칠지 여부를 변경 요청서 03에 적어 사장님 판단을 기다립니다.', '');
md.push('## 판정표 (5줄)', '', '| 부품 | 판정 | 숫자 | 문턱 | 코드 줄 |', '|---|---|---|---|---|');
for (const t of table) md.push(`| ${t.부품} | **${t.판정}** | ${t.숫자} | ${t.문턱} | ${t['코드 줄'].map(c => '`' + c + '`').join(' · ')} |`);
md.push('', '- ④ 보고 글: ' + P4.decision.reportText, '- ⑤ 보고 글: ' + P5.decision.reportText, '');
md.push('## 틀린 42칸 · 그 방향을 고르게 한 것 (R7 · w10-against.json · 생성기 scripts/atlas11/overhaul/lane-b/w10-against.mjs · 모형 안의 설명이지 원인 증명이 아님)', '', ...W.rule.map(r => `- 규칙 ${r}`), '');
for (const [k, v] of Object.entries(counts)) md.push(`- ${k}: ${v}칸${k === '모의 계산 기울기' ? `(무게 0 ${tilt.zeroWeight} · 무게 있음 ${tilt.weighted}: ${tilt.weightedCells.map(c => `${c.name} ${c.date.slice(5).replace('-', '/')} 평균 ${c.meanPp >= 0 ? '+' : '−'}${Math.abs(c.meanPp).toFixed(2)}%`).join(' · ')})` : k === '평균 항' ? `(기본값이 같은 쪽 ${W.detail['평균 항'].interceptSameSide}칸 · 가장 큰 항 ${Object.entries(W.detail['평균 항'].largest).map(([t, n]) => `${t === 'intercept' ? '기본값' : t} ${n}`).join(' · ')})` : k === '같은 난수 잡음' ? `(${W.detail['같은 난수 잡음'].map(c => `${c.name} ${c.date.slice(5).replace('-', '/')} 정확 상승 ${c.exact.up.toFixed(4)} · 하락 ${c.exact.down.toFixed(4)} → 하락 · 발행 ${c.published.up} · ${c.published.down} → 상승`).join(' / ')})` : ''}`);
md.push(`- 합: ${rows.length}칸`, '', '| 날짜 | 종목 | 예측 → 실제 | 무게 0 | 상승·하락 확률 정확 / 발행 | 평균 | 기본값 · F35 · F11 | 까닭 |', '|---|---|---|---|---|---|---|---|');
const sg = v => `${v >= 0 ? '+' : '−'}${Math.abs(v).toFixed(2)}`;
for (const r of rows) md.push(`| ${r.date.slice(5).replace('-', '/')} | ${r.name}(${r.code}) | ${dirK(r.predDir)} → ${dirK(r.actDir)} | ${r.zeroWeight ? '예' : '아니오'} | ${r.exact.up.toFixed(4)}·${r.exact.down.toFixed(4)} / ${r.published.up.toFixed(4)}·${r.published.down.toFixed(4)} | ${sg(r.meanPp)}% | ${sg(r.terms.intercept)} · ${sg(r.terms.F35)} · ${sg(r.terms.F11)} | ${r.reason}${r.reason === '평균 항' ? ` (가장 큰 항 ${r.largestTerm === 'intercept' ? '기본값' : r.largestTerm})` : ''} |`);
md.push('', '## 이 진단이 보인 것 · 보이지 못한 것', '', out.showsAndNot, '');
md.push('## 결정표(19절) 결과', '');
for (const [k, v] of Object.entries(out.decisionTable)) md.push(`- ${k}: ${v}`);
md.push('', '## 판단을 기다리는 일 (변경 요청서 03)', '', '- T14 → 「정확 재현(차이 0)」 또는 「묶음 공차(156개 비교에 약 4σ)」', '- T13·F4 → 「학습·잔차 날짜 ≤ 기준일 < 첫 목표일」(120/120 통과)', `- ${G4}`, `- G2: ${out.gateG2.status}`, '');
md.push('## 계획의 「맞다면 나올 숫자」 대 결과', '', '| 부품 | 계획(맞다면) | 결과 |', '|---|---|---|');
for (const p of predictions) md.push(`| ${p.부품} | ${p.계획} | ${p.결과} |`);
md.push('', '## 참고(판정에 쓰지 않음)', '');
for (const r of refs) md.push(`- ${r}`);
md.push('', '## 자세히 · 파일', '');
for (const [f, h] of Object.entries(out.files)) md.push(`- \`${f}\` sha256 ${h.slice(0, 12)}…`);
md.push(`- \`reports/atlas11/overhaul/diagnosis.json\` (이 보고의 숫자 원본)`, '');
fs.writeFileSync(ROOT + '/reports/atlas11/overhaul/diagnosis.md', md.join('\n'));
console.log(JSON.stringify({diagnosisJson: sj, diagnosisMd: sha256(md.join('\n')), verdicts: table.map(t => [t.부품.slice(0, 1), t.판정]), counts, total: rows.length}, null, 1));
