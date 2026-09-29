/**
 * ATLAS 11 · 대표 시나리오(근사 medoid) 안정성 진단
 *   같은 분포에서 후보·기준 표본 수를 바꿔(256/512 vs 512/1000) 고른 대표 경로가 얼마나 비슷한지 잰다.
 *   결과: reports/atlas11/scenario-stability.json — 종목별 두 경로의 평균 절대 차이(%), 중앙 전망(p50)과의 거리.
 *   운영 발행본은 건드리지 않는다(진단 전용 · 경로 2,000개).
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import {pricePanel, examplesFor, fitFactorModel, validateFactorRecords} from '../../lib/factor36.mjs';
import {externalDesign} from '../../lib/factor36-input.mjs';
import {rollingInput} from '../../lib/rolling-forecast.mjs';
import {simulateAtlas11, SIMULATION_POLICY} from '../../lib/atlas11/simulate.mjs';

const root = process.cwd(), read = async f => JSON.parse(await fs.readFile(path.join(root, f), 'utf8'));
const source = await read('public/data/input.json'), calendar = await read('public/data/rolling-calendar.json');
const issuedAt = new Date().toISOString();
const {input, futureDates} = rollingInput({input: source}, {calendar, issuedAt});
const records = validateFactorRecords({schema: 'atlas-factor36-records-1', records: []}, {codes: input.assets.map(a => a.code), cutoff: issuedAt});
const panel = pricePanel(input), models = [], external = [];
for (let i = 0; i < input.assets.length; i++) { const design = externalDesign(records, input.assets[i], panel, examplesFor(panel, i), issuedAt); const m = fitFactorModel(design.rows, {featureFactors: design.featureFactors}); if (m.status !== 'research_estimate') throw Error('MODEL ' + input.assets[i].code); external.push(design); models.push(m); }
const paths = Number(process.env.ATLAS_STAB_PATHS ?? 2000);
const settings = [{candidatePaths: 256, referencePaths: 512}, {candidatePaths: 512, referencePaths: 1000}];
const runs = settings.map(sc => simulateAtlas11(models, panel, input.assets, futureDates, {paths, seed: 20260917, external, policy: {...SIMULATION_POLICY, scenario: {...SIMULATION_POLICY.scenario, ...sc}}}));
const stocks = input.assets.map((a, i) => {
  const A = runs[0].scenarios[i].prices, B = runs[1].scenarios[i].prices, p50 = runs[0].rows[i].map(r => r.p50), anchor = a.prices.find(p => p.date === input.actualAsOf).close;
  const mad = (x, y) => x.reduce((s, v, k) => s + Math.abs(v - y[k]) / y[k], 0) / x.length * 100;
  const bandWidth = runs[0].rows[i].reduce((s, r) => s + (r.p90 - r.p10) / r.p50, 0) / 20 * 100;
  return {code: a.code, name: a.name, samePath: runs[0].scenarios[i].pathIndex === runs[1].scenarios[i].pathIndex, meanAbsDiffPct: Number(mad(A, B).toFixed(3)), distToMedianA: Number(mad(A, p50).toFixed(3)), distToMedianB: Number(mad(B, p50).toFixed(3)), meanBandWidthPct: Number(bandWidth.toFixed(2)), endReturnA: Number(((A.at(-1) / anchor - 1) * 100).toFixed(2)), endReturnB: Number(((B.at(-1) / anchor - 1) * 100).toFixed(2)), endReturnMedian: Number(((p50.at(-1) / anchor - 1) * 100).toFixed(2))};
});
const mean = k => stocks.reduce((s, x) => s + x[k], 0) / stocks.length;
const result = {schema: 'atlas11-scenario-stability-1', at: issuedAt, paths, settings, note: '진단 전용(경로 2,000) · 운영 발행본 2만 경로와 다름 · 두 설정이 같은 경로를 고른 종목 수와, 다른 경로를 골랐을 때 두 경로의 평균 절대 차이(%)를 띠 폭과 견준다',
  summary: {stocks: 52, samePath: stocks.filter(s => s.samePath).length, meanAbsDiffPct: Number(mean('meanAbsDiffPct').toFixed(3)), meanDistToMedianA: Number(mean('distToMedianA').toFixed(3)), meanDistToMedianB: Number(mean('distToMedianB').toFixed(3)), meanBandWidthPct: Number(mean('meanBandWidthPct').toFixed(2)), diffToBandRatio: Number((mean('meanAbsDiffPct') / mean('meanBandWidthPct')).toFixed(3))}, stocks};
await fs.mkdir(path.join(root, 'reports/atlas11'), {recursive: true});
await fs.writeFile(path.join(root, 'reports/atlas11/scenario-stability.json'), JSON.stringify(result, null, 2));
console.log(JSON.stringify(result.summary));
