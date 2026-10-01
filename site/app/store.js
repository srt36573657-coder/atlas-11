/* ATLAS 11 · 자료 읽기 — 모든 화면은 같은 발행본(manifest.forecastId)에 연결된다. 가짜 진행률 없음.
   무결성: manifest 에 적힌 파일별 SHA-256 을 화면이 스스로 다시 계산해 대조한다(보안 연결·localhost 에서만 가능). */
const base = location.pathname.replace(/[^/]*$/, '');
const cache = new Map();
export const state = {manifest: null, lastGood: null, loading: new Set(), errors: [], summary: '', integrity: {available: typeof crypto !== 'undefined' && !!crypto.subtle, verified: 0, failed: [], checked: []}};
export const setSummary = text => { state.summary = text; };
export const url = p => base + p.replace(/^\//, '');

async function sha256Hex(text) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, '0')).join('');
}
async function verify(name, text) {
  const expected = state.manifest?.files?.[name]?.sha256;
  if (!expected || !state.integrity.available) return null;
  try { const got = await sha256Hex(text); const ok = got === expected; state.integrity.checked.push(name); if (ok) state.integrity.verified++; else state.integrity.failed.push(name); document.dispatchEvent(new CustomEvent('atlas:integrity')); return ok; } catch { return null; }
}

export async function loadJSON(name) {
  if (cache.has(name)) return cache.get(name);
  const target = url('data/atlas11/view/' + name);
  state.loading.add(name); document.dispatchEvent(new CustomEvent('atlas:loading'));
  try {
    const r = await fetch(target, {cache: 'no-cache'});
    if (!r.ok) throw Error(`${name} 을(를) 읽지 못했습니다 (HTTP ${r.status})`);
    const text = await r.text();
    const value = JSON.parse(text);
    if (state.manifest && value.forecastId && value.forecastId !== state.manifest.forecastId) throw Error(`${name} 의 발행본(${value.forecastId})이 현재 발행본(${state.manifest.forecastId})과 다릅니다. 새 자료가 올라오는 중일 수 있습니다.`);
    const ok = await verify(name, text);
    if (ok === false) throw Error(`${name} 의 내용이 발행본 목록의 해시와 다릅니다(변조 또는 전송 오류). 화면에 쓰지 않습니다.`);
    cache.set(name, value); return value;
  } finally { state.loading.delete(name); document.dispatchEvent(new CustomEvent('atlas:loading')); }
}
export async function loadManifest() {
  const m = await loadJSON('manifest.json');
  state.manifest = m; state.lastGood = {forecastId: m.forecastId, issuedAt: m.issuedAt, actualAsOf: m.actualAsOf};
  return m;
}
/** 화면 묶음 밖의 자료(기록 장부 복사본·일일 보고): 색인에 적힌 SHA-256 으로 대조한다 */
export async function loadData(relPath, {sha256 = null} = {}) {
  const key = 'data:' + relPath; if (cache.has(key)) return cache.get(key);
  const r = await fetch(url('data/atlas11/' + relPath), {cache: 'no-cache'});
  if (!r.ok) throw Error(`${relPath} 을(를) 읽지 못했습니다 (HTTP ${r.status})`);
  const text = await r.text(), value = JSON.parse(text);
  if (sha256 && state.integrity.available) { const got = await sha256Hex(text); if (got !== sha256) throw Error(`${relPath} 의 해시가 색인과 다릅니다`); state.integrity.verified++; state.integrity.checked.push(relPath); document.dispatchEvent(new CustomEvent('atlas:integrity')); }
  cache.set(key, value); return value;
}
export const loadLedger = () => loadJSON('ledger.json');
export const loadCards = () => loadJSON('cards.json');
export const loadStock = code => loadJSON('stocks/' + code + '.json');
export const loadRace = () => loadJSON('race.json');
export const loadScores = () => loadJSON('scores.json');
export const loadEvolution = () => loadJSON('evolution.json');
export const loadStatus = () => loadJSON('status.json');
export const loadMisses = () => loadJSON('misses.json');
export const loadScoreCells = () => loadJSON('score-cells.json');

/* 기기 저장(이 기기에만) — 글씨 크기·정렬·재생 속도 */
export const prefs = {
  get(key, fallback) { try { const v = localStorage.getItem('atlas11:' + key); return v == null ? fallback : JSON.parse(v); } catch { return fallback; } },
  set(key, value) { try { localStorage.setItem('atlas11:' + key, JSON.stringify(value)); } catch {} },
};
