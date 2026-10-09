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
/** 판 읽기(「ATLAS 개편 실행 지시서」 2026-10-08 — 시장 · 돈 흐름 · 종목 · 검증이 함께 읽음 · 판 이름이 다르면 쓰지 않음) */
export const loadLens = () => loadJSON('lens.json');

/** 다른 시장 판(한국 판에서 미국 판 · 미국 판에서 한국 판) — 「찾기」가 두 판을 함께 찾을 때(2026-10-05 20:24 「종목을 찾는 기능」)
   그 판의 목록(manifest) → 판(board) · 판 목록에 적힌 SHA-256 과 맞대어 다르면 쓰지 않는다(보안 연결 · localhost 에서만 잴 수 있음) */
const placeCache = new Map();
export function loadPlaceBoard(href) {
  if (!placeCache.has(href)) placeCache.set(href, (async () => {
    const get = async name => { const r = await fetch(href + 'data/atlas11/view/' + name, {cache: 'no-cache'}); if (!r.ok) throw Error(`${href} ${name} (HTTP ${r.status})`); return r.text(); };
    const m = JSON.parse(await get('manifest.json')), text = await get('board.json'), b = JSON.parse(text);
    if (b.boardId !== m.boardId) throw Error(`${href} 판 이름이 서로 다름`);
    if (state.integrity.available && m.files?.['board.json']?.sha256 && await sha256Hex(text) !== m.files['board.json'].sha256) throw Error(`${href} 판 해시가 다름`);
    return {manifest: m, board: b};
  })().catch(e => { placeCache.delete(href); throw e; }));
  return placeCache.get(href);
}

/* 기기 저장(이 기기에만) — 글씨 크기 · 탭 자리
   미국 판(/us/)은 같은 주소 안이라 저장 칸을 따로 둔다(「atlas11:us:」 — 한국 판의 출목표 탭 자리와 섞이지 않게) · 글씨 크기는 두 판이 함께(2026-10-05 18:02 「미국 주식도」) */
const scope = base === '/' ? '' : base.replace(/[^A-Za-z0-9]/g, '') + ':', SHARED = new Set(['font', 'findRecent', 'tour']); // 「최근 찾은 회사」도 두 판이 함께 · 첫 화면 저절로 둘러보기 끔(tour.js · 2026-10-10 규칙 49 ④)도
const keyOf = key => 'atlas11:' + (SHARED.has(key) ? '' : scope) + key;
export const prefs = {
  get(key, fallback) { try { const v = localStorage.getItem(keyOf(key)); return v == null ? fallback : JSON.parse(v); } catch { return fallback; } },
  set(key, value) { try { localStorage.setItem(keyOf(key), JSON.stringify(value)); return true; } catch { return false; } }, // 저장했으면 true · 이 브라우저가 막으면 false(관심 등록이 바로 알림 — 2026-10-09 지시서 0-E)
};
