const deepFreeze = o => { Object.values(o).forEach(v => { if (v && typeof v === 'object') deepFreeze(v); }); return Object.freeze(o); };
export const CYCLE_PROTOCOL = deepFreeze({
 id:'atlas-cycle-1.0.2', plan:'atlas-cycle-plan-1', mode:'research_only',
 universeSize:52, forecastStart:'2026-09-17', forecastEnd:'2026-10-30',
 researchStart:'2016-09-17', parameterSelectionCutoff:'2026-09-16',
 trendWindows:[21,63,126,252], volatilityWindow:63, accelerationLag:21,
 exposureWindow:252, minimumExposureRows:126, leadLags:[-20,-10,-5,0,5,10,20],
 ridgeCandidates:[0.1,1,10], residualRidge:1, exposureRidge:1, exposurePenaltyBasis:'unit_variance_predictors',
 minimumInitialYears:3, primaryHorizon:20, minimumNonoverlapTrainOrigins:36, minimumNonoverlapTestOrigins:12,
 minimumInnerTrainOrigins:18, minimumInnerTestOrigins:6,
 stateThreshold:.6, epsilon:1e-12, seed:20260917, bootstrapDraws:1000, blockLength:20,
 defaultEnabled:false, trustProbability:null
});
export const CYCLE_LABELS = ['시장 추세','시장 가속','업종 고유 추세','업종 고유 가속'];
export function assertCycleUniverse(input) {
 if(input.origin!==CYCLE_PROTOCOL.forecastStart||input.end!==CYCLE_PROTOCOL.forecastEnd||
 input.assets.length!==52||new Set(input.assets.map(a=>a.code)).size!==52)throw Error('주기 분석은 기존 52종목·9/17~10/30에만 연결합니다.');
}
