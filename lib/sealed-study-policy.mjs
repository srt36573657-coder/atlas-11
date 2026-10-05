// A separately registered retrospective experiment. Never changes the operating model.
export const SEALED_STUDY_VERSION = 'atlas-sealed-pair-1.0.0';
export const SEALED_ORIGIN = '2026-09-17';
export const SEALED_END = '2026-10-30';
export const SEALED_CUTOFF = '2026-09-17T16:00:00+09:00';
export const SEALED_CODES = Object.freeze(['005930','009150','373220','005380','207940','105560','028260','032830','012450','034020','329180','034730','012330','066570','035420','010120','000810','005490','010130','138040','015760','011200','051910','017670','033780','196170','018260','086280','000720','278470','030200','003490','047050','003230','259960','021240','352820','009830','029780','028300','034220','002380','036460','004170','012750','111770','035250','257720','226950','010170','214370','030000']);
export const SEALED_SESSIONS = Object.freeze(['2026-09-17','2026-09-18','2026-09-21','2026-09-22','2026-09-23','2026-09-28','2026-09-29','2026-09-30','2026-10-01','2026-10-02','2026-10-06','2026-10-07','2026-10-08','2026-10-12','2026-10-13','2026-10-14','2026-10-15','2026-10-16','2026-10-19','2026-10-20','2026-10-21','2026-10-22','2026-10-23','2026-10-26','2026-10-27','2026-10-28','2026-10-29','2026-10-30']);

export function isCalendarDate(s) {
  return typeof s === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(s) && Number.isFinite(Date.parse(s)) && new Date(s).toISOString().slice(0,10) === s;
}
export function isExactInstant(s) {
  return typeof s === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(?::\d{2}(?:\.\d+)?)?(?:Z|[+-]\d{2}:\d{2})$/.test(s) && Number.isFinite(Date.parse(s));
}
export const knownByCutoff = s => isExactInstant(s) && Date.parse(s) <= Date.parse(SEALED_CUTOFF);
export function sealedCalendarDays() {
  const rows=[];
  for(let t=Date.parse(SEALED_ORIGIN);t<=Date.parse(SEALED_END);t+=86400000) rows.push(new Date(t).toISOString().slice(0,10));
  return rows;
}
export function sealedStudyPolicy(overrides={}) {
  for(const k of Object.keys(overrides)) if(!['scoring','width','fixtureUniverse'].includes(k)) throw Error(`SEALED_POLICY_UNKNOWN_OR_IMMUTABLE_FIELD:${k}`);
  const scoring={alpha:.2,directionFlatThresholdReturn:0,magnitudeToleranceReturn:null,...overrides.scoring};
  if(Object.keys(scoring).some(k=>!['alpha','directionFlatThresholdReturn','magnitudeToleranceReturn'].includes(k)) || scoring.alpha !== .2 || !Number.isFinite(scoring.directionFlatThresholdReturn) || scoring.directionFlatThresholdReturn < 0 || !(scoring.magnitudeToleranceReturn===null || Number.isFinite(scoring.magnitudeToleranceReturn) && scoring.magnitudeToleranceReturn>=0)) throw Error('INVALID_SEALED_SCORING_POLICY');
  const width={lookbackSessions:252,minWindows:20,method:'centered_overlapping_historical_cumulative_blocks',eventMultiplier:1,nominalCoverage:.8,...overrides.width};
  if(Object.keys(width).some(k=>!['lookbackSessions','minWindows','method','eventMultiplier','nominalCoverage'].includes(k)) || !Number.isInteger(width.lookbackSessions) || width.lookbackSessions<40 || width.lookbackSessions>2000 || !Number.isInteger(width.minWindows) || width.minWindows<20 || width.minWindows>width.lookbackSessions || width.method!=='centered_overlapping_historical_cumulative_blocks' || width.eventMultiplier!==1 || width.nominalCoverage!==.8) throw Error('INVALID_SEALED_WIDTH_POLICY');
  const fixture=overrides.fixtureUniverse;
  if(fixture && (!Array.isArray(fixture.codes) || fixture.testOnly!==true || !fixture.codes.length || fixture.codes.length>52 || new Set(fixture.codes).size!==fixture.codes.length || fixture.codes.some(c=>!/^\d{6}$/.test(c)))) throw Error('INVALID_EXPLICIT_FIXTURE_UNIVERSE');
  return {
    version:SEALED_STUDY_VERSION,origin:SEALED_ORIGIN,end:SEALED_END,informationCutoff:SEALED_CUTOFF,
    universeCodes:fixture?[...fixture.codes]:[...SEALED_CODES],fixtureOnly:!!fixture,
    returnAxis:'simple_return_from_origin',scoring,width,
    news:{method:'same_issuer_weighted_additional_response_paths',minBaselineSessions:20,minIndependentDateClusters:20,maxFrequencyHalfWidth:.2,extraRiskMultiplier:1,overlapPolicy:'abstain_without_joint_evidence',aggregation:'single_economic_event_only'},
    evaluation:{dateClusterUnit:true,datesAssumedIndependent:false,longTermTargetSessions:250,firstRecordEnd:SEALED_END,automaticExtension:false,retrospectiveDesign:true},
    uncertainty:{calibrationVerified:false,overlappingWindowsAreNotIndependent:true,withinBlockDependenceRetained:true,trustProbability:null},
    serialization:'stableJSON_sorted_keys_finite_numbers_v1',seed:null,
  };
}
