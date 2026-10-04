/* ATLAS 11 · 자료 읽기 — 모든 화면은 같은 판(manifest.boardId)에 연결된다. 가짜 진행률 없음.
   무결성: manifest 에 적힌 파일별 SHA-256 을 화면이 스스로 다시 계산해 대조한다(보안 연결·localhost 에서만 가능). */
const base = location.pathname.replace(/[^/]*$/, '');
const cache = new Map();
export const state = {manifest: null, summary: '', integrity: {available: typeof crypto !== 'undefined' && !!crypto.subtle, verified: 0, failed: [], checked: []}};
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
  const r = await fetch(url('data/atlas11/view/' + name), {cache: 'no-cache'});
  if (!r.ok) throw Error(`${name} 을(를) 읽지 못했습니다 (HTTP ${r.status})`);
  const text = await r.text(), value = JSON.parse(text);
  if (state.manifest && value.boardId && value.boardId !== state.manifest.boardId) throw Error(`${name} 의 판(${value.boardId})이 지금 판(${state.manifest.boardId})과 다릅니다. 새 자료가 올라오는 중일 수 있습니다.`);
  const ok = await verify(name, text);
  if (ok === false) throw Error(`${name} 의 내용이 판 목록의 해시와 다릅니다(변조 또는 전송 오류). 화면에 쓰지 않습니다.`);
  cache.set(name, value); return value;
}
export async function loadManifest() { const m = await loadJSON('manifest.json'); state.manifest = m; return m; }
export const loadBoard = () => loadJSON('board.json');
export const loadAgenda = () => loadJSON('agenda.json');
export const loadStock = code => loadJSON('stocks/' + code + '.json');

/* 기기 저장(이 기기에만) — 글씨 크기 */
export const prefs = {
  get(key, fallback) { try { const v = localStorage.getItem('atlas11:' + key); return v == null ? fallback : JSON.parse(v); } catch { return fallback; } },
  set(key, value) { try { localStorage.setItem('atlas11:' + key, JSON.stringify(value)); } catch {} },
};
