/**
 * ATLAS 11 · 아래 탭 「기록」 — 업데이트(화면을 바꾼 날)와 자료 변경(자료가 바뀐 날)을 날짜별로 · 무엇을 어떻게 바꿨나
 *   사장님 2026-10-06 16:10 「업데이트한 날짜랑 자료 변경한 날짜를 업데이트한 내용을 별도의 탭에다가 해가지고
 *     뭘 어떻게 변화 시켰는지에 대해서 기록 하는 탭을 만들어 줘」
 *   기록 한 줄 = 파일 하나 — 새로 만들기만 하고 고치지 않는다(규칙 8 · 2026-09-29 「기록은 덮어쓰지 않고 영구 보존」)
 *     reports/atlas11/changelog/updates/  업데이트 — 화면을 바꿀 때마다 Claude 가 한 파일(무엇 · 뺀 것 · 까닭 · 커밋)
 *     reports/atlas11/changelog/data-kr/  한국 판 자료 변경 — build_view.mjs 가 판을 만들 때 앞 기록과 견줘 바뀐 것이 있으면 저절로
 *     reports/atlas11/us/changelog/       미국 판 자료 변경 — scripts/atlas11/us/build.mjs 가 저절로(미국 단추가 reports/atlas11/us 를 기록에 남김)
 *     reports/ 아래라 매일 실행 · 저녁 실행 · 올리기 단추가 모두 기록에 남긴다(public/data 는 올리기 단추가 남기지 않음)
 *   사이트 묶음(package.mjs)이 셋을 모아 dist/changelog.json 한 파일로 — 올라간 때(live) = 올리기 기록(deploy-log.jsonl)에서 만든 때 뒤 첫 올림
 *     · 아직 안 올라간 것은 이번 묶음을 만든 때(그 묶음이 올라가야 화면에 보이므로)
 *   앞날 값 · 예측 말은 적지 않는다(2026-10-04 15:37 「표현하지 마라」) — 검사(validateEntry)가 막는다
 */
import fs from 'node:fs/promises';
import path from 'node:path';

export const CHANGELOG = Object.freeze({
  schema: 'atlas11-changelog-1', entrySchema: 'atlas11-change-1',
  dirs: Object.freeze({updates: 'reports/atlas11/changelog/updates', kr: 'reports/atlas11/changelog/data-kr', us: 'reports/atlas11/us/changelog'}),
  deployLog: 'reports/atlas11/operations/deploy-log.jsonl',
  maxWhat: 8,
});
/** 기록에 쓰지 않는 말 — 앞날 · 사고팔기 말(사장님 금지 말 · 2026-10-04 「예측 … 표현하지 마라」) */
export const BANNED = Object.freeze(['예측', '예외 없이', '절대', '상승 신호', '폭락 경보기', '팔 때', '들어갈 때', '시작을 맞힌다', '곧 오른다', '오를 것', '내릴 것']);
const KINDS = new Set(['update', 'data']), PLACES = new Set(['all', 'kr', 'us']);
const ISO_DT = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?(Z|[+-]\d{2}:\d{2})$/, ISO_D = /^\d{4}-\d{2}-\d{2}$/;
const WD = '일월화수목금토';

/** 2026-10-02 → 「10월 2일(금)」 */
export const kd = d => { const [y, m, dd] = String(d).slice(0, 10).split('-').map(Number); return `${m}월 ${dd}일(${WD[new Date(Date.UTC(y, m - 1, dd)).getUTCDay()]})`; };
/** 어느 ISO 시각이든 → 한국 시각 ISO(+09:00) 「2026-10-06T00:38:26+09:00」 */
export const toKst = iso => { const t = Date.parse(iso); if (!Number.isFinite(t)) return null; return new Date(t + 9 * 3600000).toISOString().slice(0, 19) + '+09:00'; };
/** 파일 이름에 쓰는 시각 「20261006T003826」 */
export const stampOf = iso => toKst(iso).slice(0, 19).replace(/[-:]/g, '');
const listNames = (xs, n = 3, unit = '곳') => xs.slice(0, n).join(' · ') + (xs.length > n ? ` 외 ${xs.length - n}${unit}` : '');

/**
 * 판 하나의 자료 요약 — 다음 판과 견줄 때 쓴다(기록 파일에만 · 사이트 묶음에는 싣지 않음)
 *   종가 날짜 · 회사(코드 · 이름) · 업종 수 · 불장 업종 · 늦은 종가 · 수급/기사/공시를 모은 회사 수 · 기사 모은 날 · 저녁 들고 남 기록 수
 */
export function boardSnap(board, {place = 'kr'} = {}) {
  const cs = Array.isArray(board?.companies) ? board.companies : [];
  const has = k => cs.filter(c => c.brief && !(c.brief.missing ?? []).includes(k)).length;
  const days = new Map(); for (const c of cs) { const d = c.brief?.day; if (d) days.set(d, (days.get(d) ?? 0) + 1); }
  const briefDay = [...days].sort((a, b) => b[1] - a[1] || (a[0] < b[0] ? 1 : -1))[0]?.[0] ?? null;
  const sorted = [...cs].sort((a, b) => (a.code < b.code ? -1 : a.code > b.code ? 1 : 0));
  return {place, asOf: board?.asOf ?? null, boardId: board?.boardId ?? null, n: cs.length, groups: Array.isArray(board?.groups) ? board.groups.length : 0,
    codes: sorted.map(c => c.code), names: sorted.map(c => c.name),
    hot: (board?.hot?.items ?? []).map(x => ({id: x.id, label: x.label})),
    late: (board?.late ?? []).map(x => ({code: x.code, name: x.name, date: x.date})),
    collected: {news: has('기사'), flows: has('수급'), disclosures: has('공시')}, briefDay,
    moves: board?.moves ? {records: board.moves.records ?? 0, to: board.moves.to ?? null, first: !!board.moves.first} : null};
}

/**
 * 앞 기록의 요약(prev · 없으면 null)과 새 판을 견줘 자료 변경 한 줄을 만든다 — 바뀐 것이 없으면 null
 *   바뀐 것으로 치는 것: 종가 날짜 · 회사 목록 · 수급/기사/공시를 모은 회사 수 · 기사 모은 날 · 저녁 들고 남 기록 수
 *   (같은 날 같은 종가로 다시 만든 판은 기록하지 않는다 — 화면 코드만 바뀐 판도 마찬가지)
 */
export function dataEntry(prev, board, {place = 'kr', made}) {
  const s = boardSnap(board, {place}), us = place === 'us';
  if (!s.asOf || !s.n) return null;
  const reasons = [];
  if (!prev) reasons.push('first');
  else {
    if (prev.asOf !== s.asOf) reasons.push('asOf');
    if (prev.codes.join() !== s.codes.join()) reasons.push('codes');
    if (JSON.stringify(prev.collected) !== JSON.stringify(s.collected)) reasons.push('collected');
    if (prev.briefDay !== s.briefDay) reasons.push('brief');
    if ((prev.moves?.records ?? 0) !== (s.moves?.records ?? 0)) reasons.push('moves');
  }
  if (!reasons.length) return null;
  const close = us ? '뉴욕 종가' : '종가', what = [];
  // ① 종가
  if (!prev) what.push(`${kd(s.asOf)} ${close} · 회사 ${s.n}곳 · 업종 ${s.groups}개`);
  else if (prev.asOf !== s.asOf) what.push(`${close} 날짜: ${kd(prev.asOf)} → ${kd(s.asOf)}`);
  else what.push(`${close}는 ${kd(s.asOf)} 그대로`);
  // ② 회사 목록
  if (prev && reasons.includes('codes')) {
    const was = new Map(prev.codes.map((c, i) => [c, prev.names[i]])), now = new Map(s.codes.map((c, i) => [c, s.names[i]]));
    const inn = s.codes.filter(c => !was.has(c)).map(c => now.get(c)), out = prev.codes.filter(c => !now.has(c)).map(c => was.get(c));
    what.push(`회사 ${prev.n}곳 → ${s.n}곳` + (inn.length ? ` · 들어옴 ${inn.length}곳(${listNames(inn)})` : '') + (out.length ? ` · 나감 ${out.length}곳(${listNames(out)})` : ''));
  }
  // ③ 불장 업종(새 종가 · 첫 판일 때만 — 같은 종가면 불장도 같다)
  if (!prev) what.push(`불장 업종 ${s.hot.length}개: ${listNames(s.hot.map(x => x.label), 3, '개')}`);
  else if (prev.asOf !== s.asOf) {
    const was = new Set(prev.hot.map(x => x.id)), now = new Set(s.hot.map(x => x.id));
    const inn = s.hot.filter(x => !was.has(x.id)).map(x => x.label), out = prev.hot.filter(x => !now.has(x.id)).map(x => x.label);
    what.push(inn.length || out.length ? `불장 업종 ${prev.hot.length}개 → ${s.hot.length}개` + (inn.length ? ` · 들어옴: ${listNames(inn, 3, '개')}` : '') + (out.length ? ` · 나감: ${listNames(out, 3, '개')}` : '') : `불장 업종 ${s.hot.length}개 그대로`);
  }
  // ④ 수급 · 기사 · 공시를 모은 회사
  const col = c => us ? `기사를 모은 회사 ${c.news}곳` : (c.news === c.flows && c.flows === c.disclosures ? `수급 · 기사 · 공시를 모은 회사 ${c.flows}곳` : `수급 ${c.flows}곳 · 기사 ${c.news}곳 · 공시 ${c.disclosures}곳을 모음`);
  if (!prev) what.push(col(s.collected) + (us ? ' · 수급 · 공시는 미국 판에 없음' : s.collected.flows < s.n ? ` · 나머지 ${s.n - s.collected.flows}곳은 아직` : ''));
  else if (reasons.includes('collected')) {
    const a = prev.collected, b = s.collected;
    what.push(!us && a.news === a.flows && a.flows === a.disclosures && b.news === b.flows && b.flows === b.disclosures ? `수급 · 기사 · 공시를 모은 회사 ${a.flows}곳 → ${b.flows}곳` : us ? `기사를 모은 회사 ${a.news}곳 → ${b.news}곳` : `수급 ${a.flows}→${b.flows}곳 · 기사 ${a.news}→${b.news}곳 · 공시 ${a.disclosures}→${b.disclosures}곳`);
  } else if (reasons.includes('brief') && s.briefDay) what.push(`${us ? '기사' : '수급 · 기사 · 공시'}를 ${kd(s.briefDay)}에 새로 모음`);
  // ⑤ 늦은 종가(첫 판이거나 바뀌었을 때)
  const lateKey = x => x.map(y => y.code + y.date).join();
  if (s.late.length && (!prev || lateKey(prev.late) !== lateKey(s.late))) what.push(`늦은 종가 ${s.late.length}곳: ${s.late.slice(0, 3).map(x => `${x.name}(${kd(x.date)} 종가까지)`).join(' · ')}${s.late.length > 3 ? ` 외 ${s.late.length - 3}곳` : ''}`);
  else if (prev && prev.late.length && !s.late.length) what.push('늦은 종가 없음(앞 판 ' + prev.late.length + '곳)');
  // ⑥ 저녁 7시 들고 남
  if (reasons.includes('moves') && s.moves) what.push(s.moves.first || (prev?.moves?.records ?? 0) === 0 ? `저녁 7시 들고 남 첫 기록(${kd(s.moves.to)} 종가) — 견줄 앞 기록이 없어 다음 거래일부터 들고 난 곳을 적음` : `저녁 7시 들고 남 기록 ${s.moves.records}번째(${kd(s.moves.to)} 종가)`);
  const title = !prev ? `${us ? '미국 판 — ' : ''}${kd(s.asOf)} ${close}로 판을 만듦`
    : prev.asOf !== s.asOf ? `${us ? '미국 판 — ' : ''}${kd(s.asOf)} ${close}로 판을 새로 만듦`
    : reasons.includes('codes') ? `${us ? '미국 판 — ' : ''}회사 목록이 바뀜`
    : reasons.includes('moves') ? '저녁 7시 들고 남 기록'
    : `${us ? '미국 판 — 기사' : '수급 · 기사 · 공시'}를 새로 모음`;
  const at = toKst(made);
  return {schema: CHANGELOG.entrySchema, id: `${place}-${stampOf(made)}`, kind: 'data', place, made: at, asOf: s.asOf, title, what: what.slice(0, CHANGELOG.maxWhat), auto: true, reasons, snap: s};
}

/** 기록 한 줄 검사 → 문제 목록(비면 통과) */
export function validateEntry(e) {
  const bad = [], txt = [e?.title, ...(e?.what ?? []), ...(e?.removed ?? []), e?.why ?? ''].join(' ');
  if (!e || typeof e !== 'object') return ['모양이 아님'];
  if (e.schema !== CHANGELOG.entrySchema) bad.push('schema');
  if (typeof e.id !== 'string' || !/^[a-z0-9][a-z0-9-]{2,80}$/i.test(e.id)) bad.push('id');
  if (!KINDS.has(e.kind)) bad.push('kind');
  if (!PLACES.has(e.place)) bad.push('place');
  if (typeof e.made !== 'string' || !ISO_DT.test(e.made) || !Number.isFinite(Date.parse(e.made))) bad.push('made');
  if (typeof e.title !== 'string' || !e.title.trim() || e.title.length > 80) bad.push('title');
  if (!Array.isArray(e.what) || !e.what.length || e.what.length > CHANGELOG.maxWhat || e.what.some(x => typeof x !== 'string' || !x.trim() || x.length > 200)) bad.push('what');
  if (e.removed != null && (!Array.isArray(e.removed) || e.removed.some(x => typeof x !== 'string' || !x.trim()))) bad.push('removed');
  if (e.why != null && typeof e.why !== 'string') bad.push('why');
  if (e.commits != null && (!Array.isArray(e.commits) || e.commits.some(x => !/^[0-9a-f]{7,40}$/.test(x)))) bad.push('commits');
  if (e.kind === 'data' && (typeof e.asOf !== 'string' || !ISO_D.test(e.asOf))) bad.push('asOf');
  if (e.kind === 'update' && e.place !== 'all') bad.push('update 는 place all');
  for (const w of BANNED) if (txt.includes(w)) bad.push('금지 말 「' + w + '」');
  return bad;
}

/** 첫 올림(만든 때 뒤 · 성공한 올림만) — 없으면 fallback(이번 묶음을 만든 때) */
export function liveOf(made, deploys, fallback) {
  const t = Date.parse(made);
  const hit = deploys.map(d => Date.parse(d.at)).filter(x => Number.isFinite(x) && x >= t).sort((a, b) => a - b)[0];
  return hit !== undefined ? toKst(new Date(hit).toISOString()) : fallback;
}

/**
 * 사이트에 싣는 기록 한 파일 — 새것이 위(올라간 때 → 만든 때 차례) · 요약(snap)은 빼고 · 검사에 걸린 줄은 빼고 problems 에 적음
 *   deploys: deploy-log.jsonl 의 성공한 올림(state ready · exitCode 0) · now: 이 묶음을 만든 때
 */
export function siteLog(entries, {deploys = [], now}) {
  const ok = [], problems = [], seen = new Set();
  for (const e of entries) {
    const bad = validateEntry(e); if (seen.has(e?.id)) bad.push('id 겹침');
    if (bad.length) { problems.push({id: e?.id ?? null, bad}); continue; }
    seen.add(e.id);
    const {snap, auto, reasons, ...show} = e;
    ok.push({...show, live: liveOf(e.made, deploys, toKst(now))});
  }
  ok.sort((a, b) => (a.live === b.live ? (a.made < b.made ? 1 : a.made > b.made ? -1 : (a.id < b.id ? 1 : -1)) : a.live < b.live ? 1 : -1));
  const made = ok.map(e => e.made).sort();
  return {schema: CHANGELOG.schema, generatedAt: toKst(now), from: made[0] ?? null, count: {all: ok.length, update: ok.filter(e => e.kind === 'update').length, data: ok.filter(e => e.kind === 'data').length}, entries: ok, problems};
}

/* ---- 파일 읽기 · 쓰기 ---- */
/** 폴더 안 기록 파일 모두(만든 때 차례) — 폴더가 없으면 빈 목록 */
export async function readEntries(root, dir) {
  let names = []; try { names = (await fs.readdir(path.join(root, dir))).filter(n => n.endsWith('.json')).sort(); } catch (e) { if (e.code !== 'ENOENT') throw e; }
  const out = []; for (const n of names) out.push(JSON.parse(await fs.readFile(path.join(root, dir, n), 'utf8')));
  return out.sort((a, b) => (a.made < b.made ? -1 : a.made > b.made ? 1 : 0));
}
/** 새 기록 한 파일 — 이미 있으면 쓰지 않음('wx') · 검사에 걸리면 쓰지 않고 오류 */
export async function writeEntry(root, dir, entry) {
  const bad = validateEntry(entry); if (bad.length) throw Error('CHANGE_INVALID ' + entry?.id + ': ' + bad.join(', '));
  await fs.mkdir(path.join(root, dir), {recursive: true});
  const file = path.join(dir, entry.id + '.json');
  try { await fs.writeFile(path.join(root, file), JSON.stringify(entry, null, 1) + '\n', {flag: 'wx'}); return {file, wrote: true}; }
  catch (e) { if (e.code === 'EEXIST') return {file, wrote: false, reason: '이미 있음'}; throw e; }
}
/** 판을 만든 뒤 — 그 판 자리(kr · us)의 마지막 기록과 견줘 바뀐 것이 있으면 한 파일 → {wrote, file, title} | {wrote:false, reason} */
export async function recordBoardChange(root, board, {place = 'kr', made}) {
  const dir = CHANGELOG.dirs[place]; if (!dir) throw Error('place ' + place);
  const last = (await readEntries(root, dir)).filter(e => e.kind === 'data' && e.snap).at(-1) ?? null;
  const entry = dataEntry(last?.snap ?? null, board, {place, made});
  if (!entry) return {wrote: false, reason: '앞 기록과 같음(종가 · 회사 · 모은 자료 · 들고 남)'};
  const w = await writeEntry(root, dir, entry);
  return {...w, title: entry.title};
}
/** 사이트 묶음용: 세 폴더를 모아 siteLog — 올리기 기록이 없으면 모두 이번 묶음 때 */
export async function readSiteLog(root, {now}) {
  const all = [];
  for (const dir of Object.values(CHANGELOG.dirs)) all.push(...await readEntries(root, dir));
  let deploys = [];
  try { deploys = (await fs.readFile(path.join(root, CHANGELOG.deployLog), 'utf8')).split('\n').filter(Boolean).map(l => { try { return JSON.parse(l); } catch { return null; } }).filter(d => d && d.state === 'ready' && (d.exitCode ?? 0) === 0 && d.at); }
  catch (e) { if (e.code !== 'ENOENT') throw e; }
  return siteLog(all, {deploys, now});
}
