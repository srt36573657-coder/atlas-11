/**
 * ATLAS 11 · 새 발행본 만들기 (실제 종가 출발 · 20거래일 · 불변 저장)
 *   node scripts/atlas11/build_forecast.mjs [--now ISO] [--paths N]
 * 같은 semantic 입력(가격·달력·뉴스·정책·구현)이면 기존 발행본을 재사용하고 새 파일을 만들지 않는다.
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {buildForecast11, persistForecast11, readAllPublications, compactNews} from '../../lib/atlas11/forecast.mjs';

const root = process.cwd();
const arg = name => { const i = process.argv.indexOf(name); return i < 0 ? null : process.argv[i + 1]; };
const read = async (file, otherwise) => { try { return JSON.parse(await fs.readFile(path.join(root, file), 'utf8')); } catch (e) { if (e.code === 'ENOENT' && otherwise !== undefined) return otherwise; throw e; } };

/** 뉴스 일정은 91MB 원본(atlas.json)에서 한 번만 뽑아 작은 파일로 보관한다 (원본 해시 기록). */
export async function loadNewsEvents() {
  const cached = await read('public/data/atlas11/news-events.json', null);
  if (cached) return cached;
  const raw = await fs.readFile(path.join(root, 'public/data/atlas.json'));
  const bundle = JSON.parse(raw);
  const events = {schema: 'atlas11-news-events-1', extractedAt: new Date().toISOString(), sourceFile: 'public/data/atlas.json', sourceSHA256: createHash('sha256').update(raw).digest('hex'), sourceCandidateId: bundle.candidate?.id ?? null, assets: compactNews(bundle.candidate?.assets ?? [])};
  await fs.mkdir(path.join(root, 'public/data/atlas11'), {recursive: true});
  await fs.writeFile(path.join(root, 'public/data/atlas11/news-events.json'), JSON.stringify(events));
  return events;
}

export async function buildAndPersist({issuedAt = new Date().toISOString(), paths = null, modelSpec = null, modelVersion = null, shadow = null} = {}) {
  const [input, recordsPayload, registry, calendar, priorPublications, latest, fomo, news] = await Promise.all([
    read('public/data/input.json'), read('public/data/factor36-records.json', {schema: 'atlas-factor36-records-1', records: []}), read('public/data/factor36-registry.json'), read('public/data/rolling-calendar.json'), readAllPublications(root), read('public/data/atlas11/forecast.json', null), read('reports/prediction-candidate/fomo52.json', null), loadNewsEvents()]);
  const files = ['lib/factor36.mjs', 'lib/factor36-input.mjs', 'lib/factor36-simulation.mjs', 'lib/rolling-forecast.mjs', 'lib/atlas11/simulate.mjs', 'lib/atlas11/forecast.mjs', 'lib/atlas11/evolve/models.mjs', 'scripts/atlas11/build_forecast.mjs'];
  const implementationSHA256 = createHash('sha256').update((await Promise.all(files.map(f => fs.readFile(path.join(root, f), 'utf8')))).join('\n')).digest('hex');
  const byId = new Map(priorPublications.filter(p => p.schema === 'atlas-forecast-11').map(p => [p.forecastId, p]));
  if (shadow) {
    // 그림자 발행(후보 · 직전 검증 버전): 공개 발행본이 아니다 · reports/atlas11/evolve/shadow/<candidateId>/ 에 불변 저장 · latest 포인터 없음
    const dir = path.join(root, 'reports/atlas11/evolve/shadow', shadow.candidateId); await fs.mkdir(dir, {recursive: true});
    const existingShadow = async id => { try { return JSON.parse(await fs.readFile(path.join(dir, id + '.json'), 'utf8')); } catch (e) { if (e.code === 'ENOENT') return null; throw e; } };
    const cache = new Map(); for (const f of await fs.readdir(dir)) if (f.endsWith('.json')) cache.set(f.slice(0, -5), true);
    const publication = buildForecast11({input, recordsPayload, registry, calendar, issuedAt, paths: paths ? Number(paths) : undefined, implementationSHA256, priorPublications, newsAssets: news.assets, fomo, modelSpec, modelVersion, shadow, existing: id => cache.has(id) ? {forecastId: id, reusedShadow: true} : null});
    if (publication.reusedShadow) { const old = await existingShadow(publication.forecastId); return {forecastId: old.forecastId, issuedAt: old.issuedAt, actualAsOf: old.actualAsOf, reused: true, shadow: true, summary: old.summary}; }
    const file = path.join(dir, publication.forecastId + '.json');
    await fs.writeFile(file, JSON.stringify(publication), {flag: 'wx'});
    return {forecastId: publication.forecastId, issuedAt: publication.issuedAt, actualAsOf: publication.actualAsOf, reused: false, shadow: true, summary: publication.summary, archive: path.relative(root, file)};
  }
  const publication = buildForecast11({input, recordsPayload, registry, calendar, issuedAt, paths: paths ? Number(paths) : undefined, implementationSHA256, priorPublications, newsAssets: news.assets, fomo, modelSpec, modelVersion, existing: id => byId.get(id) ?? null});
  const result = await persistForecast11(publication, {rootDir: root, expectedLatestId: latest?.forecastId ?? null});
  return {...result, publication: undefined, summary: result.publication.summary, dataStatus: result.publication.dataStatus, implementationSHA256};
}

if (process.argv[1] && path.resolve(process.argv[1]) === new URL(import.meta.url).pathname) {
  const started = Date.now();
  const result = await buildAndPersist({issuedAt: arg('--now') ?? new Date().toISOString(), paths: arg('--paths')});
  console.log(JSON.stringify({...result, elapsedMs: Date.now() - started}));
}
