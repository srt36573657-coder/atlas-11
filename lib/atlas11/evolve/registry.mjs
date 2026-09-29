/**
 * ATLAS 11 · 모델 버전 등록부(append-only) — 후보 생성 / 과거 검증 / 실전 관찰 / 채택 / 기각 / 되돌림 / 변경 없음 / 검증 대기
 * reports/atlas11/evolve/registry.jsonl 에 사건을 한 줄씩 덧붙이고, 현재 상태는 사건을 처음부터 다시 재생해(replay) 만든다(state.json 은 파생 캐시).
 * 운영 교체와 복귀는 「이후 발행본」에만 적용된다(appliesFrom = 다음 발행 시각).
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {normalizeSpec, specId} from './models.mjs';

export const REGISTRY_DIR = 'reports/atlas11/evolve';
export const STATUS = Object.freeze({created: '후보 생성', backtested: '과거 검증', pending: '검증 대기', observing: '실전 관찰', adopted: '채택', rejected: '기각', rolledBack: '되돌림', noChange: '변경 없음'});
const sha = x => createHash('sha256').update(typeof x === 'string' ? x : JSON.stringify(x)).digest('hex');

export function modelVersionFor(spec, sequence) { const id = specId(spec); return id === 'A' ? 'atlas11-A-1' : `atlas11-${id}-${sequence}`; }

export async function readEvents(rootDir) { try { return (await fs.readFile(path.join(rootDir, REGISTRY_DIR, 'registry.jsonl'), 'utf8')).split('\n').filter(Boolean).map(l => JSON.parse(l)); } catch (e) { if (e.code === 'ENOENT') return []; throw e; } }

export async function appendEvent(rootDir, event) {
  if (!event?.type || !event.at) throw Error('REGISTRY_EVENT');
  const dir = path.join(rootDir, REGISTRY_DIR); await fs.mkdir(dir, {recursive: true});
  const id = 'evt-' + sha({...event, id: undefined}).slice(0, 16), events = await readEvents(rootDir);
  if (events.some(e => e.id === id)) return {event: events.find(e => e.id === id), duplicate: true};
  const record = {id, ...event};
  await fs.appendFile(path.join(dir, 'registry.jsonl'), JSON.stringify(record) + '\n');
  return {event: record, duplicate: false};
}

/** 사건 재생 → 현재 상태 */
export function replay(events, config) {
  const base = normalizeSpec(config.operating.spec);
  const state = {schema: 'atlas11-evolve-state-1', operating: {modelVersion: config.operating.initialVersion, specId: 'A', spec: base, since: null, event: null}, previousValidated: null, candidates: {}, adoptions: [], rollbacks: [], lastAdoptionDate: null, cooldownUntilTradingDayIndex: null, sequence: 1, events: events.length, lastEventAt: events.at(-1)?.at ?? null};
  for (const e of events) {
    const c = e.candidateId ? (state.candidates[e.candidateId] ??= {candidateId: e.candidateId, spec: e.spec ?? null, family: e.spec?.family ?? null, label: e.spec?.label ?? null, status: STATUS.created, statusKey: 'created', history: []}) : null;
    if (c) c.history.push({at: e.at, type: e.type, reason: e.reason ?? null});
    switch (e.type) {
      case 'candidate_created': c.status = STATUS.created; c.statusKey = 'created'; c.createdAt = e.at; break;
      case 'backtested': c.status = STATUS.backtested; c.statusKey = 'backtested'; c.backtest = e.evidence ?? null; c.backtestedAt = e.at; break;
      case 'validation_pending': c.status = STATUS.pending; c.statusKey = 'pending'; c.pendingReason = e.reason; break;
      case 'gate_decision': c.gates = e.evidence ?? null; c.gateDecisionAt = e.at; break;
      case 'rejected': c.status = STATUS.rejected; c.statusKey = 'rejected'; c.rejectedAt = e.at; c.rejectReason = e.reason; break;
      case 'observation_started': c.status = STATUS.observing; c.statusKey = 'observing'; c.observation = {startedAt: e.at, startTradingDay: e.tradingDay ?? null, scoredDates: [], lastMetrics: null}; break;
      case 'observation_scored': if (c.observation) { c.observation.scoredDates = e.evidence?.scoredDates ?? c.observation.scoredDates; c.observation.lastMetrics = e.evidence ?? null; c.observation.lastScoredAt = e.at; } break;
      case 'adopted': {
        state.previousValidated = {...state.operating, replacedAt: e.at};
        state.sequence += 1; const version = e.modelVersion ?? modelVersionFor(c.spec, state.sequence);
        state.operating = {modelVersion: version, specId: e.candidateId, spec: c.spec, since: e.at, event: e.id, appliesFrom: e.appliesFrom ?? null};
        c.status = STATUS.adopted; c.statusKey = 'adopted'; c.adoptedAt = e.at; c.modelVersion = version;
        state.adoptions.push({at: e.at, candidateId: e.candidateId, modelVersion: version, evidence: e.evidence ?? null, appliesFrom: e.appliesFrom ?? null}); state.lastAdoptionDate = e.tradingDay ?? e.at.slice(0, 10); state.cooldownUntilTradingDayIndex = e.cooldownUntilTradingDayIndex ?? null; break; }
      case 'rolled_back': {
        const from = state.operating; state.operating = {...(e.to ?? state.previousValidated ?? {modelVersion: config.operating.initialVersion, specId: 'A', spec: base}), since: e.at, event: e.id, appliesFrom: e.appliesFrom ?? null, restored: true};
        state.rollbacks.push({at: e.at, from: from.modelVersion, to: state.operating.modelVersion, reason: e.reason, evidence: e.evidence ?? null, targetForecastId: e.targetForecastId ?? null, appliesFrom: e.appliesFrom ?? null});
        if (c) { c.status = STATUS.rolledBack; c.statusKey = 'rolledBack'; c.rolledBackAt = e.at; c.rollbackReason = e.reason; } break; }
      case 'no_change': state.lastNoChange = {at: e.at, reason: e.reason ?? null}; break;
      default: break;
    }
  }
  return state;
}

export async function loadState(rootDir, config) { const events = await readEvents(rootDir); const state = replay(events, config); await fs.mkdir(path.join(rootDir, REGISTRY_DIR), {recursive: true}); await fs.writeFile(path.join(rootDir, REGISTRY_DIR, 'state.json'), JSON.stringify(state, null, 1)); return state; }
