/**
 * 발행본 두 개(9/28 rolling20 · 9/29 atlas11)의 입력·모델을 운영 코드 그대로 되살린다(읽기만).
 *   9/28 rolling20 = lib/rolling-forecast.mjs buildRollingForecast 의 적합 줄 · 입력 input.json@30dcfb2 + rolling-calendar.json
 *   9/29 atlas11   = lib/atlas11/forecast.mjs buildForecast11 의 적합 줄 · 입력 input.json@940698c + rolling-calendar.json
 * 되살린 입력의 지문(digest)이 발행본 provenance.inputSHA256 과 같아야 하고, 다시 적합한 계수·변동폭이 발행본 model 과 한 자리도 달라선 안 된다.
 */
import fs from 'node:fs';
import path from 'node:path';
import {pricePanel, examplesFor, fitFactorModel, validateFactorRecords, FACTOR36_POLICY} from '../../../../lib/factor36.mjs';
import {externalDesign} from '../../../../lib/factor36-input.mjs';
import {rollingInput} from '../../../../lib/rolling-forecast.mjs';
import {digest} from '../../../../lib/atlas11/forecast.mjs';
import {specDesign, normalizeSpec} from '../../../../lib/atlas11/evolve/models.mjs';
import {ROOT, gitShow, sha256} from './common.mjs';

export const PUBS = Object.freeze({
  '2026-09-28-rolling20-13cd892134e517b4': {kind: 'rolling20', target: '2026-09-29', inputCommit: '30dcfb2', inputSha256: '4b0d7b61d8d36256f481a0db2872b3f145ced764d1afb86da9c48c4c5e554a8e', pubFile: {commit: null, path: 'public/data/rolling-forecast.json'}, recordsCommit: '30dcfb2'},
  '2026-09-29-atlas11-128de9174cfdfa1f': {kind: 'atlas11', target: '2026-09-30', inputCommit: '940698c', inputSha256: 'af2699952675d8dc06830953fc8f18c6d4ffb4f2c002608ccb014ac1f297484c', pubFile: {commit: '940698c', path: 'public/data/atlas11/forecast.json'}, recordsCommit: '940698c'},
});

export function loadPublication(id) {
  const meta = PUBS[id]; if (!meta) throw Error('PUB_UNKNOWN ' + id);
  const pubBytes = meta.pubFile.commit ? gitShow(meta.pubFile.commit, meta.pubFile.path) : fs.readFileSync(path.join(ROOT, meta.pubFile.path));
  const pub = JSON.parse(pubBytes); if ((pub.forecastId ?? pub.id) !== id) throw Error('PUB_ID ' + (pub.forecastId ?? pub.id));
  const inputBytes = gitShow(meta.inputCommit, 'public/data/input.json'); if (sha256(inputBytes) !== meta.inputSha256) throw Error('PUB_INPUT_SHA ' + id);
  const source = JSON.parse(inputBytes), calendarBytes = gitShow(meta.inputCommit, 'public/data/rolling-calendar.json'), calendar = JSON.parse(calendarBytes);
  const recordsPayload = JSON.parse(gitShow(meta.recordsCommit, 'public/data/factor36-records.json'));
  return {id, meta, pub, pubSha256: sha256(pubBytes), source, calendar, calendarSha256: sha256(calendarBytes), recordsPayload};
}

/** 운영 코드의 적합 줄을 그대로 따라 모델을 다시 만든다 */
export function rebuild(id) {
  const L = loadPublication(id), {pub, meta} = L, issuedAt = pub.issuedAt;
  const {input, futureDates} = rollingInput({input: L.source}, {calendar: L.calendar, issuedAt});
  const inputDigest = digest(input);
  const records = validateFactorRecords(L.recordsPayload, {codes: input.assets.map(a => a.code), cutoff: issuedAt});
  const panel = pricePanel(input), models = [], external = [];
  for (let i = 0; i < input.assets.length; i++) {
    if (meta.kind === 'rolling20') { const design = externalDesign(records, input.assets[i], panel, examplesFor(panel, i), issuedAt); models.push(fitFactorModel(design.rows, {featureFactors: design.featureFactors})); external.push(design); }
    else { const base = externalDesign(records, input.assets[i], panel, examplesFor(panel, i), issuedAt), sd = specDesign(normalizeSpec({family: 'baseline'}), panel, i, input.assets, base.rows); const design = {...base, rows: sd.rows, featureFactors: [...base.featureFactors, ...sd.featureFactors.slice(7)], selected: [...base.selected, ...sd.selected]}; models.push(fitFactorModel(design.rows, {featureFactors: design.featureFactors})); external.push(design); }
  }
  // 발행본 계수와 한 자리도 다르지 않은가
  const mismatches = [];
  pub.assets.forEach((a, i) => {
    if (a.code !== input.assets[i].code) mismatches.push({code: a.code, field: 'order'});
    const m = models[i], pm = a.model;
    for (const k of ['intercept', 'lambda', 'n']) if (m.regression[k] !== pm.regression[k] && !(k === 'lambda' && m.regression[k] === 'zero' && pm.regression[k] === 'zero')) mismatches.push({code: a.code, field: 'regression.' + k, mine: m.regression[k], pub: pm.regression[k]});
    for (const k of ['beta', 'center', 'scale']) if (m.regression[k].some((v, j) => v !== pm.regression[k][j])) mismatches.push({code: a.code, field: 'regression.' + k});
    for (const k of ['kind', 'omega', 'a', 'b', 'initial', 'last']) if (m.volatility[k] !== pm.volatility[k]) mismatches.push({code: a.code, field: 'volatility.' + k, mine: m.volatility[k], pub: pm.volatility[k]});
    if (m.selected.id !== pm.selected.id) mismatches.push({code: a.code, field: 'selected.id', mine: m.selected.id, pub: pm.selected.id});
  });
  return {...L, input, futureDates, panel, models, external, inputDigest, inputDigestMatches: inputDigest === (pub.provenance?.inputSHA256), modelMismatches: mismatches, issuedAt, policy: {paths: FACTOR36_POLICY.paths, seed: FACTOR36_POLICY.seed}};
}

/** 발행본 1일째 행(9/28 rolling20 은 wave.daily, 9/29 atlas11 은 direction.daily) */
export function publishedDayOne(pub, i) {
  const row = pub.assets[i].rows.find(r => !r.anchor && r.date === pub.futureDates[0]);
  const d = row.direction?.daily ?? row.wave.daily;
  return {date: row.date, probabilities: d.probabilities, selected: d.selected, p50: row.p50, meanLogReturn: row.dailyMovement?.meanLogReturn ?? null, contributions: row.factor36?.contributions ?? null, factorMeanLogReturn: row.factor36?.meanLogReturn ?? null};
}
