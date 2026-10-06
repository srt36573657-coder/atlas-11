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
 *   이슈(2026-10-06 18:37 「이날 어떤 이슈들이 있었는지도 이슈칸을 만들어서 기록해 좋은방법으로」): 새 종가 날마다 한 줄(issue-<판>-<종가 날짜>)
 *     지수 · 원/달러 · 하루 오른/내린 회사 · 업종 하루 평균 · 그 날 기사가 몰린 회사와 대표 기사 · 회사 일 공시 — 모은 자료로만 · 남의 글에 앞날 말이 있으면 싣지 않음
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import {hidesPrediction} from './board.mjs';

export const CHANGELOG = Object.freeze({
  schema: 'atlas11-changelog-1', entrySchema: 'atlas11-change-1',
  dirs: Object.freeze({updates: 'reports/atlas11/changelog/updates', kr: 'reports/atlas11/changelog/data-kr', us: 'reports/atlas11/us/changelog'}),
  deployLog: 'reports/atlas11/operations/deploy-log.jsonl',
  maxWhat: 8,
});
/** 기록에 쓰지 않는 말 — 앞날 · 사고팔기 말(사장님 금지 말 · 2026-10-04 「예측 … 표현하지 마라」) */
export const BANNED = Object.freeze(['예측', '예외 없이', '절대', '상승 신호', '폭락 경보기', '팔 때', '들어갈 때', '시작을 맞힌다', '곧 오른다', '오를 것', '내릴 것']);
const KINDS = new Set(['update', 'data', 'issue']), PLACES = new Set(['all', 'kr', 'us']); const FIX_FIELDS = new Set(['title', 'what', 'removed']);
const KIND_RANK = {issue: 0, data: 1, update: 2}; // 같은 때 만든 줄은 이슈 → 자료 변경 → 업데이트 차례
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
    moves: board?.moves ? {records: board.moves.records ?? 0, to: board.moves.to ?? null, first: !!board.moves.first} : null,
    start: board?.start?.ready && Array.isArray(board.start.picks) ? board.start.picks.map(x => ({code: x.code, name: x.name})) : null}; // 아래 탭 「처음」 다섯(2026-10-07 00:49 「이대로 사이트에 올려줘」 — 바뀌면 한 줄)
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
    if (prev.start && s.start && prev.start.map(x => x.code).join() !== s.start.map(x => x.code).join()) reasons.push('start');
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
  // ⑦ 아래 탭 「처음」 다섯이 바뀜(같은 기준 · 지난 3년 가장 덜 떨어진 우량 큰 회사)
  if (reasons.includes('start')) {
    const was = new Set(prev.start.map(x => x.code)), now = new Set(s.start.map(x => x.code));
    const inn = s.start.filter(x => !was.has(x.code)).map(x => x.name), out = prev.start.filter(x => !now.has(x.code)).map(x => x.name);
    what.push(inn.length || out.length ? `「처음」 다섯` + (inn.length ? ` · 들어옴: ${listNames(inn)}` : '') + (out.length ? ` · 나감: ${listNames(out)}` : '') : `「처음」 다섯의 차례가 바뀜: ${s.start.map(x => x.name).join(' · ')}`);
  }
  const title = !prev ? `${us ? '미국 판 — ' : ''}${kd(s.asOf)} ${close}로 판을 만듦`
    : prev.asOf !== s.asOf ? `${us ? '미국 판 — ' : ''}${kd(s.asOf)} ${close}로 판을 새로 만듦`
    : reasons.includes('codes') ? `${us ? '미국 판 — ' : ''}회사 목록이 바뀜`
    : reasons.includes('moves') ? '저녁 7시 들고 남 기록'
    : reasons.includes('start') ? '「처음」 다섯이 바뀜'
    : `${us ? '미국 판 — 기사' : '수급 · 기사 · 공시'}를 새로 모음`;
  const at = toKst(made);
  return {schema: CHANGELOG.entrySchema, id: `${place}-${stampOf(made)}`, kind: 'data', place, made: at, asOf: s.asOf, title, what: what.slice(0, CHANGELOG.maxWhat), auto: true, reasons, snap: s};
}

/* ---- 이슈 — 새 종가 날마다 그날 일(2026-10-06 18:37 「이날 어떤 이슈들이 있었는지도 이슈칸을 만들어서 기록해 좋은방법으로」) ---- */
const fin = x => typeof x === 'number' && Number.isFinite(x);
const num = (x, d = 2) => x.toLocaleString('ko-KR', {minimumFractionDigits: d, maximumFractionDigits: d});
const sgn = (x, d = 2) => (x > 0 ? '+' : x < 0 ? '−' : '') + num(Math.abs(x), d) + '%'; // 퍼센트 값(0.46 = 0.46%)
const sgnF = (x, d = 1) => sgn(x * 100, d); // 비율 값(0.0123 = 1.2%)
const TZ = {kr: 'Asia/Seoul', us: 'America/New_York'};
const DAY_FMT = new Map();
/** 그 곳 시간대의 날짜(YYYY-MM-DD) — 미국 판은 뉴욕 날짜(서머타임 저절로) */
const dayIn = (iso, tz = TZ.kr) => { const t = Date.parse(iso); if (!Number.isFinite(t)) return null; if (!DAY_FMT.has(tz)) DAY_FMT.set(tz, new Intl.DateTimeFormat('en-CA', {timeZone: tz, year: 'numeric', month: '2-digit', day: '2-digit'})); return DAY_FMT.get(tz).format(new Date(t)); };
const hmOf = iso => toKst(iso)?.slice(11, 16) ?? '';
const clean = t => typeof t === 'string' && t.trim() && !hidesPrediction(t) && !BANNED.some(w => t.includes(w));
const cut = (t, n) => (t.length > n ? t.slice(0, n - 1) + '…' : t);
const HAN = /[가-힣]/, WORD = /[A-Za-z0-9가-힣]/, PARTICLE = /^[은는이가의을를도와과에로만]/;
/** 제목에 회사 이름이 나오나 — 짧은 이름(4자 안 · 영문)은 낱말 경계로(「LS전선」의 LS · 「SK하이닉스」의 SK 는 아님 · 「LS는」은 맞음) */
export function mentions(t, name) {
  if (typeof t !== 'string' || !name) return false;
  for (let i = t.indexOf(name); i >= 0; i = t.indexOf(name, i + 1)) {
    const prev = t[i - 1] ?? '', next = t.slice(i + name.length), long = name.length >= 4 && HAN.test(name);
    if (prev && WORD.test(prev) && (!long || !HAN.test(name[0]) || !HAN.test(prev))) continue;
    if (long || !next || !WORD.test(next[0]) || PARTICLE.test(next)) return true;
  }
  return false;
}
export const ISSUE = Object.freeze({minShare: 0.9, minCompanies: 10, feedPage: 20});
/**
 * 그 종가 날짜(board.asOf)의 이슈 한 줄 — 모은 자료로만(지난 일 · 앞날 말 없음)
 *   그 날 종가가 있는 회사가 90%(그리고 10곳) 안 되면 null — 덜 모인 판으로 이슈를 쓰지 않음(한 번 쓰면 고치지 않으므로)
 *   board · manifest = 그 판 · snap = 관측 묶음(한국 reports/atlas11/context · 미국 public/data/atlas11/us/context.json) — 없으면 그 줄만 뺌
 *   기사 = 그 곳 날짜(한국 · 뉴욕)로 셈 · 대표 기사는 제목에 회사 이름이 나온 것만(네이버 종목 기사 목록에는 업종 · 시장 기사가 섞여 있음)
 */
export function issueEntry(board, manifest, snap, {place = 'kr', made}) {
  const D = board?.asOf; if (!D || !Array.isArray(board?.companies) || !toKst(made)) return null;
  const us = place === 'us', tz = us ? TZ.us : TZ.kr, all = board.companies, cs = all.filter(c => c.date === D && fin(c.change1));
  if (cs.length < Math.max(ISSUE.minCompanies, Math.ceil(all.length * ISSUE.minShare))) return null;
  const byCode = new Map(all.map(c => [c.code, c])), what = [], idents = new Set();
  const nm = s => { if (/\d/.test(s)) idents.add(s); return s; }; // 이름 속 숫자(필립스 66 · S&P 500)는 식별자
  // ① 지수 + 원/달러(그 날 값만)
  const top = (manifest?.market?.items ?? []).filter(i => i.date === D && fin(i.close) && fin(i.changePct)).map(i => `${nm(i.name)} ${num(i.close)}포인트 ${sgn(i.changePct)}`);
  if (!us) {
    const rows = ((snap?.macro ?? []).find(m => m.id === 'FX_USDKRW')?.rows ?? []).filter(r => fin(r.value)).sort((a, b) => (a.date < b.date ? -1 : 1));
    const i = rows.findIndex(r => r.date === D), pct = i < 0 ? null : fin(rows[i].changePct) ? rows[i].changePct : i > 0 ? (rows[i].value / rows[i - 1].value - 1) * 100 : null;
    if (i >= 0 && pct != null) top.push(`원/달러 ${num(rows[i].value, 1)}원 ${sgn(pct)}`);
  }
  if (top.length) what.push(top.join(' · '));
  // ② 오른 곳 · 내린 곳 수
  const nUp = cs.filter(c => c.change1 > 0).length, nDown = cs.filter(c => c.change1 < 0).length;
  what.push(`오른 회사 ${nUp}곳 · 내린 회사 ${nDown}곳 · 그대로 ${cs.length - nUp - nDown}곳(그 날 종가가 있는 ${cs.length}곳)`);
  // ③ 하루 가장 오른 · 내린 회사
  const ord = (a, b) => (a.code < b.code ? -1 : 1);
  what.push(`하루 가장 오른 회사: ${[...cs].sort((a, b) => b.change1 - a.change1 || ord(a, b)).slice(0, 3).map(c => `${nm(c.name)} ${sgnF(c.change1)}`).join(' · ')}`);
  what.push(`하루 가장 내린 회사: ${[...cs].sort((a, b) => a.change1 - b.change1 || ord(a, b)).slice(0, 3).map(c => `${nm(c.name)} ${sgnF(c.change1)}`).join(' · ')}`);
  // ④ 업종 하루 평균(그 날 종가가 있는 회사 3곳 넘게)
  const gs = (board.groups ?? []).map(g => { const xs = (g.codes ?? []).map(c => byCode.get(c)).filter(c => c && c.date === D && fin(c.change1)).map(c => c.change1); return xs.length >= 3 ? {label: g.label, avg: xs.reduce((t, x) => t + x, 0) / xs.length} : null; }).filter(Boolean).sort((a, b) => b.avg - a.avg || (a.label < b.label ? -1 : 1));
  if (gs.length >= 2) what.push(`업종 하루 평균: 가장 오름 ${nm(gs[0].label)} ${sgnF(gs[0].avg)} · 가장 내림 ${nm(gs.at(-1).label)} ${sgnF(gs.at(-1).avg)}`);
  // ⑤ 기사가 가장 몰린 곳(그 날 · 겹친 기사 뺌) — 회사마다 네이버 종목 기사 한 쪽(20건)까지 봄: 20건이 모두 그 날이면 「20건 넘음」 · 그런 곳끼리는 20건이 짧은 사이에 나온 차례
  //    + 그 차례로 처음 대표 기사가 있는 회사의 대표 기사(제목에 회사 이름이 나온 것 · 같은 기사가 가장 많이 실린 것 · 앞날 말 든 제목은 뺌)
  const tOf = iso => Date.parse(iso) || 0;
  const feeds = (snap?.news ?? []).map(n => {
    const c = byCode.get(n.code), items = (n.items ?? []).filter(x => x.publishedAt);
    const onD = items.filter(x => !x.duplicateOf && dayIn(x.publishedAt, tz) === D);
    const full = items.length >= ISSUE.feedPage && items.every(x => (dayIn(x.publishedAt, tz) ?? '') >= D);
    return {c, onD, full, oldest: Math.min(...items.map(x => tOf(x.publishedAt))), named: c ? onD.filter(x => mentions(x.title, c.name)) : []};
  }).filter(n => n.c && n.onD.length).sort((a, b) => (b.full - a.full) || (a.full ? b.oldest - a.oldest : b.onD.length - a.onD.length) || ord(a.c, b.c));
  if (feeds.length) {
    const t3 = feeds.slice(0, 3), allFull = t3.every(n => n.full);
    what.push(`기사가 가장 몰린 곳: ${t3.map(n => nm(n.c.name) + (allFull ? '' : n.full ? ` ${ISSUE.feedPage}건 넘음` : ` ${n.onD.length}건`)).join(' · ')}${allFull ? `(${t3.length === 1 ? '' : t3.length === 2 ? '두 곳 모두 ' : '세 곳 모두 '}그 날 ${ISSUE.feedPage}건 넘음)` : ''}`);
    const hit = feeds.find(n => n.named.some(x => clean(x.title)));
    const best = hit?.named.filter(x => clean(x.title)).sort((a, b) => (b.clusterSize ?? 1) - (a.clusterSize ?? 1) || tOf(b.publishedAt) - tOf(a.publishedAt))[0];
    if (best) { const kday = toKst(best.publishedAt)?.slice(0, 10); what.push(`${nm(hit.c.name)} 대표 기사: 「${cut(best.title.trim(), 60)}」(${best.office ?? '언론사 이름 없음'} · ${us ? `한국 시각 ${kd(kday)} ` : ''}${hmOf(best.publishedAt)})`); }
  }
  // ⑥ 회사 일 공시(증자 · 합병 · 소각 같은 기업행위 · 그 날 · 한국 판) — 회사마다 몇 건 · 무슨 일(공시 제목 속 낱말 · 늦은 차례)
  if (!us) {
    const ds = (snap?.disclosures ?? []).flatMap(d => (d.items ?? []).filter(x => x.corporateAction && dayIn(x.publishedAt, tz) === D && clean(x.title)).map(x => ({c: byCode.get(d.code), x}))).filter(d => d.c)
      .sort((a, b) => tOf(b.x.publishedAt) - tOf(a.x.publishedAt) || ord(a.c, b.c));
    const per = [];
    for (const d of ds) { let q = per.find(p => p.c.code === d.c.code); if (!q) per.push(q = {c: d.c, n: 0, words: []}); q.n++; const w = d.x.actionWord ?? '기업행위'; if (!q.words.includes(w)) q.words.push(w); }
    if (ds.length) what.push(`회사 일 공시 ${ds.length}건: ${per.slice(0, 3).map(p => `${nm(p.c.name)} ${p.n}건(${p.words.join(', ')})`).join(' · ')}${per.length > 3 ? ` 외 ${per.length - 3}곳` : ''}`);
  }
  const got = toKst(snap?.fetchedAt), at = toKst(made);
  return {schema: CHANGELOG.entrySchema, id: `issue-${place}-${stampOf(made)}`, kind: 'issue', place, made: at, asOf: D,
    title: us ? `${kd(D)} 뉴욕 장 이슈` : `${kd(D)} 한국 장 이슈`, what: what.slice(0, CHANGELOG.maxWhat),
    source: `${us ? '네이버 증권 해외(뉴욕 종가 · 지수 · 한국어 기사)' : '네이버 증권(종가 · 지수 · 환율 · 기사 · 공시)'}${got ? ` · ${us ? '기사는' : '기사 · 공시는'} ${kd(got.slice(0, 10))} ${got.slice(11, 16)}까지 모은 것` : ''} · 기사는 회사마다 ${ISSUE.feedPage}건까지 봄 · 앞날 말이 든 기사 제목은 싣지 않음`,
    ...(idents.size ? {idents: [...idents]} : {}), auto: true};
}

/** 기록 한 줄 검사 → 문제 목록(비면 통과) */
export function validateEntry(e) {
  const bad = [], txt = [e?.title, ...(e?.what ?? []), ...(e?.removed ?? []), e?.why ?? '', e?.source ?? '', ...(Array.isArray(e?.fixes) ? e.fixes.map(f => f?.to ?? '') : [])].join(' ');
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
  if ((e.kind === 'data' || e.kind === 'issue') && (typeof e.asOf !== 'string' || !ISO_D.test(e.asOf))) bad.push('asOf');
  if (e.kind === 'issue' && e.place !== 'kr' && e.place !== 'us') bad.push('issue 는 place kr · us');
  if (e.source != null && typeof e.source !== 'string') bad.push('source');
  if (e.idents != null && (!Array.isArray(e.idents) || e.idents.some(x => typeof x !== 'string' || !x.trim()))) bad.push('idents');
  if (e.kind === 'update' && e.place !== 'all') bad.push('update 는 place all');
  // 고침(2026-10-07): 지난 기록 파일은 고치지 않고(규칙 8) 새 업데이트 줄이 「그 줄의 화면 글」을 고친다 — {id, field: title|what|removed, index, from(옛 글 그대로), to}
  if (e.fixes != null && (e.kind !== 'update' || !Array.isArray(e.fixes) || !e.fixes.length || e.fixes.some(f => !f || typeof f.id !== 'string' || !FIX_FIELDS.has(f.field) || (f.field !== 'title' && !(Number.isInteger(f.index) && f.index >= 0)) || typeof f.from !== 'string' || typeof f.to !== 'string' || !f.to.trim() || f.to === f.from || f.to.length > 200))) bad.push('fixes');
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
  const ok = [], problems = [], seen = new Set(), issueDays = new Set();
  for (const e of [...entries].sort((a, b) => { const x = String(a?.made), y = String(b?.made); return x < y ? -1 : x > y ? 1 : 0; })) { // 만든 차례 — 같은 날 이슈는 먼저 것
    const bad = validateEntry(e); if (seen.has(e?.id)) bad.push('id 겹침');
    if (!bad.length && e.kind === 'issue' && issueDays.has(e.place + e.asOf)) bad.push('같은 날 이슈가 먼저 있음(먼저 것만 실음)');
    if (bad.length) { problems.push({id: e?.id ?? null, bad}); continue; }
    seen.add(e.id); if (e.kind === 'issue') issueDays.add(e.place + e.asOf);
    const {snap, auto, reasons, ...show} = e;
    ok.push({...show, live: liveOf(e.made, deploys, toKst(now))});
  }
  // 고침 — 뒤에 만든 업데이트 줄의 fixes 를 앞 기록의 화면 글에 입힘(파일은 그대로 · 고친 줄에는 fixed = 누가 · 언제 · 어느 칸) · 옛 글이 맞지 않으면 고치지 않고 problems
  const byId = new Map(ok.map(x => [x.id, x]));
  for (const e of ok) for (const f of e.fixes ?? []) {
    const t = byId.get(f.id), cur = !t ? undefined : f.field === 'title' ? t.title : t[f.field]?.[f.index];
    if (cur !== f.from || t.made >= e.made) { problems.push({id: e.id, bad: [`고칠 줄을 찾지 못함 ${f.id} ${f.field}${f.field === 'title' ? '' : ' ' + f.index}`]}); continue; }
    if (f.field === 'title') t.title = f.to; else { t[f.field] = [...t[f.field]]; t[f.field][f.index] = f.to; }
    t.fixed = [...(t.fixed ?? []), {by: e.id, made: e.made, field: f.field, ...(f.field === 'title' ? {} : {index: f.index})}];
  }
  ok.sort((a, b) => (a.live !== b.live ? (a.live < b.live ? 1 : -1) : a.made !== b.made ? (a.made < b.made ? 1 : -1) : KIND_RANK[a.kind] !== KIND_RANK[b.kind] ? KIND_RANK[a.kind] - KIND_RANK[b.kind] : (a.id < b.id ? 1 : -1)));
  const made = ok.map(e => e.made).sort();
  return {schema: CHANGELOG.schema, generatedAt: toKst(now), from: made[0] ?? null, count: {all: ok.length, update: ok.filter(e => e.kind === 'update').length, data: ok.filter(e => e.kind === 'data').length, issue: ok.filter(e => e.kind === 'issue').length}, entries: ok, problems};
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
/** 판을 만든 뒤 — 그 종가 날짜의 이슈가 아직 없으면 한 파일(issue-<판>-<만든 때> · 같은 날 이슈가 이미 있으면 쓰지 않음 · 그 날 처음 다 모인 판의 자료로) */
export async function recordIssue(root, board, manifest, snap, {place = 'kr', made}) {
  const dir = CHANGELOG.dirs[place]; if (!dir) throw Error('place ' + place);
  if ((await readEntries(root, dir)).some(e => e.kind === 'issue' && e.asOf === board?.asOf)) return {wrote: false, reason: `${board.asOf} 이슈가 이미 있음`};
  const entry = issueEntry(board, manifest, snap, {place, made});
  if (!entry) return {wrote: false, reason: `그 날 종가가 있는 회사가 ${ISSUE.minShare * 100}% 안 됨`};
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
