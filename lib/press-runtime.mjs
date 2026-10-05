import { buildPressHistoryReport } from './press-history.mjs';
import { sha256 } from './cycle-math.mjs';

// Press evidence is an immutable, separately versioned calculation layer.
// It never overwrites prices, historical forecasts or the operating store name.
const stamp = () => new Date().toISOString();
const activeVersion = state => state.versions.find(v => v.id === state.active);

export function appendPressReport(previous, input, version, { cutoff = stamp() } = {}) {
  if (!previous?.data || !version) return previous ?? null;
  if (!Number.isFinite(Date.parse(cutoff))) throw Error('신문 자료 기준 시각 오류');
  const available=(previous.releaseHistory??[]).filter(r=>Date.parse(r.acceptedAt)<=Date.parse(cutoff))
    .sort((a,b)=>Date.parse(a.acceptedAt)-Date.parse(b.acceptedAt));
  const historical=available.at(-1)?.data;
  // An import/correction is never backdated just because its submitted source
  // metadata repeats an older publication or collection time.
  const data=historical??{...previous.data,sources:[],observations:[]};
  const report = buildPressHistoryReport(input, version, data, { cutoff });
  if (previous.report?.id === report.id) return previous;
  const archived=(previous.reports??[]).find(r=>r.id===report.id);
  return {
    ...previous,
    report: archived??report,
    reports: archived ? previous.reports : [...(previous.reports ?? []), report],
  };
}

export function createPressResearch(input, version, data, { cutoff = stamp() } = {}) {
  // Build before accepting any replacement: malformed input cannot destroy the
  // last valid release, and caller-owned objects never become writable state.
  const snapshot = structuredClone(data);
  const report = buildPressHistoryReport(input, version, snapshot, { cutoff });
  const dataHash = sha256(snapshot);
  return {
    schema: 'atlas-press-state-1',
    dataHash,
    releaseId: 'press-' + dataHash.slice(0, 16),
    data: snapshot,
    report,
    reports: [report],
    releaseHistory: [{ dataHash, data: structuredClone(snapshot), acceptedAt: cutoff }],
    installedBundleHash: dataHash,
    priceAdjustmentApplied: false,
  };
}

export function replacePressResearch(previous, input, version, data, { cutoff = stamp(), expectedDataHash } = {}) {
  if (previous && expectedDataHash !== previous.dataHash)
    throw Error('신문 자료가 변경되었습니다. 현재 자료를 보존하고 다시 확인하세요.');
  const incoming = createPressResearch(input, version, data, { cutoff });
  if(previous?.releaseHistory?.some(r=>Date.parse(r.acceptedAt)>Date.parse(cutoff)))
    throw Error('과거 시각으로 기사 수정 이력을 덮어쓸 수 없습니다.');
  if (incoming.dataHash === previous?.dataHash)
    return appendPressReport(previous, input, version, { cutoff });
  return {
    ...incoming,
    installedBundleHash: previous?.installedBundleHash ?? incoming.dataHash,
    releaseHistory: [...(previous?.releaseHistory ?? []), ...incoming.releaseHistory],
    reports: [...(previous?.reports ?? []), ...incoming.reports],
  };
}

export function upgradePressState(state, bundle, { cutoff = stamp() } = {}) {
  const incoming = bundle.pressResearch;
  if (!incoming?.data) return state;
  const hash = sha256(incoming.data), current = state.pressResearch;
  if (current?.dataHash === hash || current?.installedBundleHash === hash) return state;
  const next = structuredClone(state);
  if (current && current.dataHash !== current.installedBundleHash) {
    // Keep a local user edit and retain the offered release for review.
    const offered = current.unappliedReleases ?? [];
    next.pressResearch = { ...next.pressResearch, installedBundleHash: hash,
      unappliedReleases: offered.some(r => r.dataHash === hash) ? offered : [...offered,
        { dataHash: hash, reason: '사용자 수정 보존', data: structuredClone(incoming.data), observedAt: cutoff }] };
  } else {
    next.pressResearch = replacePressResearch(current, next.input, activeVersion(next), incoming.data,
      { cutoff, expectedDataHash: current?.dataHash });
    next.pressResearch.installedBundleHash = hash;
  }
  next.revision++;
  (next.updates ??= []).push({ type: 'press-evidence-release', at: cutoff, dataHash: hash,
    originalUnchanged: true, priceAdjustmentApplied: false });
  return next;
}

export function mergePressResearch(current, update, input, version, { cutoff = stamp() } = {}) {
  // A background price refresh does not own the article input. Keep the latest
  // foreground data and recompute its comparisons against the merged prices.
  if (!current && !update) return null;
  const previous = structuredClone(current ?? update);
  if (current && update && current.dataHash !== update.dataHash) {
    const offered = previous.unappliedReleases ?? [];
    if (!offered.some(r => r.dataHash === update.dataHash))
      previous.unappliedReleases = [...offered, { dataHash: update.dataHash,
        reason: '동시 사용자 수정 보존', data: structuredClone(update.data), observedAt: cutoff }];
  }
  return appendPressReport(previous, input, version, { cutoff });
}
