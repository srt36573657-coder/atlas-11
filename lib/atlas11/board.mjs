/**
 * ATLAS 11 · 판 화면 묶음(public/data/atlas11/view/) — 예측 없음 · 곳 수는 묶음마다 다름(지금 180곳)
 *   2026-10-04 18:24 「알아서 해」(180곳 · 우량주 그리고 시대 트렌드): 회사마다 우량·트렌드 구분(kind)과 트렌드 갈래(theme · 고른 까닭)를 붙인다
 *   2026-10-04 20:52 사장님 「대표 52개념도 삭제해 총 180개에서 섹타를 구분해」 · 21:04 「업종 36개에서 180개 회사를 찾아서 요즘 불장인 11개를 찾아내고 다음 불장이 예상되는 22개 회사도 찾아내 180개 회사내에서」
 *     → 화면 묶음은 업종(네이버 증권 업종) · 요즘 불장 업종 11개 · 다음 불장 후보 22곳(lib/atlas11/industries.mjs · 지난 20거래일 종가로 센 차례)
 *   2026-10-04 15:37 사장님 「이제 예측을 하지 않는다 예측에 관련된 모든 기능과 화면을 삭제하고. 표현하지 마라」
 *   어디서 오나(지어낸 값 없음)
 *     · 지난 주가 = public/data/input.json 의 확정 종가(한국거래소 정규장 15:30 종가)
 *     · 수급·기사·공시 = 날마다 16:00 실행 때 모으는 관측 묶음(reports/atlas11/context)
 *     · 다가오는 일정 = 확인된 일정표(public/data/atlas11/schedule-events.json · 일정마다 공식 출처 주소)
 *   묶음 어디에도 앞날 값(전망·확률·방향·목표일)이 없어야 한다 — validateBoard 가 열쇠 이름 · 낱말 · 앞날 종가를 막는다.
 *   남의 글(기사 제목 · 공시 제목 · 일정 이름)에 앞날을 말하는 낱말(아래 PREDICTION_WORDS)이 들어 있으면 싣지 않고 몇 건 뺐는지만 적는다.
 */
import {createHash} from 'node:crypto';
import {buildAgenda} from './agenda.mjs';
import {decodeEntities} from './context.mjs';
import {trendGroupOf} from './universe.mjs';
import {industryOf, industryBoard, change20Of} from './industries.mjs';

export const BOARD_SCHEMA = 'atlas11-board-1';
/** 화면에 내지 않는 낱말 — 「송전망」「배전망」「조망」「전망대」는 앞날 말이 아니므로 뺀다 */
export const PREDICTION_WORDS = /(?<![송배조])전망(?!대)|예측|예상|확률|오를 쪽|내릴 쪽|목표\s?주?가|추천|투자의견|상승\s?여력|하락\s?여력|오를까|내릴까|기대감|컨센서스/;
/** 묶음에 있으면 안 되는 열쇠 이름(지난 예측 묶음이 쓰던 이름) */
export const FORBIDDEN_KEYS = Object.freeze(['p05', 'p10', 'p25', 'p50', 'p75', 'p90', 'p95', 'probabilities', 'forecast', 'forecastId', 'futureDates', 'direction', 'selected', 'closeCall', 'statisticalTie', 'scenario', 'day1', 'day5', 'day20', 'tomorrow', 'horizon', 'issuedAt', 'spark']);
export const hidesPrediction = text => PREDICTION_WORDS.test(String(text ?? ''));

const sha = x => createHash('sha256').update(x).digest('hex');
const finite = x => typeof x === 'number' && Number.isFinite(x);
const round = (x, d = 6) => finite(x) ? Number(x.toFixed(d)) : null;
const koreaDay = at => new Date(Date.parse(at) + 9 * 3600000).toISOString().slice(0, 10);
const ISO = /^\d{4}-\d{2}-\d{2}$/;

/** 지금 보는 묶음이 어떤 것인가 */
export function universeSetOf(input) {
  const u = input?.universe;
  if (!u) return {id: 'u1-sector52', label: '업종 대표 52종목', selectedOn: '2026-09-17', how: ['업종마다 대표 1종목씩 52업종']};
  return {id: u.id, label: u.label ?? u.id, rules: u.rules ?? null, selectedOn: Number.isFinite(Date.parse(u.selectedAt)) ? koreaDay(u.selectedAt) : null, how: Array.isArray(u.how) ? u.how : [], previous: u.previous ?? null};
}

/**
 * 바뀔 묶음 미리 보기(첫 화면 맨 위 · 바꾸기 전까지만) — 2026-10-04 07:40 사장님 「aaa7377에 올려」
 *   from = 바꾸는 날(config/atlas11/universe.json next.switchOn) 이후 거래일 가운데 그날 매일 실행(16:00 · 다시 시도는 17시 무렵까지)이 아직 안 끝난 첫날
 *          그날 실행에서 새 묶음 종가가 모두 확인되면 바뀐다 · 못 바꾸면 다음 거래일 실행에서 다시
 *   이미 바꿨으면(input.universe.id === next.id) null — 그때부터는 universeSet 이 새 묶음을 가리킨다.
 */
export function universeNextOf({config, nextInput, input, sessions = [], now = new Date().toISOString()}) {
  const n = config?.next;
  if (!n?.id || !n.switchOn || !nextInput?.assets?.length || !input?.assets?.length) return null;
  if ((input.universe?.id ?? 'u1-sector52') === n.id || nextInput.universe?.id !== n.id) return null;
  const t = Date.parse(now), day = koreaDay(now);
  const from = sessions.find(s => s >= n.switchOn && (s > day || (s === day && t < Date.parse(s + 'T18:00:00+09:00')))) ?? null;
  const have = new Set(input.assets.map(a => a.code)), next = new Set(nextInput.assets.map(a => a.code)), u = nextInput.universe;
  const companies = nextInput.assets.map(a => ({code: a.code, name: a.name, sector: a.sector ?? null, isNew: !have.has(a.code), kind: a.quality?.kind ?? null, group: industryOf(a.industry ?? a.sector).label}));
  return {id: n.id, label: u.label ?? n.label ?? n.id, rules: u.rules ?? n.rules ?? null, switchOn: n.switchOn, from,
    selectedOn: Number.isFinite(Date.parse(u.selectedAt)) ? koreaDay(u.selectedAt) : null,
    how: Array.isArray(u.how) ? u.how : [], now: universeSetOf(input).label, companies,
    kept: companies.filter(c => !c.isNew).length, added: companies.filter(c => c.isNew).length, kinds: companies.some(c => c.kind) ? {quality: companies.filter(c => c.kind === 'quality').length, trend: companies.filter(c => c.kind === 'trend').length, profit: companies.filter(c => c.kind === 'profit').length, size: companies.filter(c => c.kind === 'size').length} : null,
    dropped: input.assets.filter(a => !next.has(a.code)).map(a => ({code: a.code, name: a.name})), proposal: n.proposal ?? null, inputSHA256: n.inputSHA256 ?? null};
}

/** 회사 한 곳의 지난 주가 — 확정 종가만(limitDay 뒤 날짜는 없음) */
export function companyOf(a, {limitDay, sessions = null}) {
  const rows = (a.prices ?? []).filter(p => ISO.test(p.date ?? '') && p.date <= limitDay && finite(p.close) && p.close > 0 && p.finalClose !== false).sort((x, y) => x.date.localeCompare(y.date));
  const last = rows.at(-1) ?? null, prev = rows.at(-2) ?? null, back = n => rows.length > n ? rows[rows.length - 1 - n].close : null;
  const win = rows.slice(-252).map(r => r.close), hi = win.length ? Math.max(...win) : null, lo = win.length ? Math.min(...win) : null;
  const road = rows.slice(-21);
  const theme = trendGroupOf(a.sector), kind = ['quality', 'trend', 'profit', 'size'].includes(a.quality?.kind) ? a.quality.kind : null;
  return {code: a.code, name: a.name, sector: a.sector ?? null, group: industryOf(a.industry ?? a.sector), theme: theme ? {id: theme.id, label: theme.label} : null, kind, date: last?.date ?? null, close: last?.close ?? null, prevDate: prev?.date ?? null, prevClose: prev?.close ?? null,
    change1: last && prev ? round(last.close / prev.close - 1) : null,
    // 바로 앞 거래일 종가가 빠져 있으면(받지 못한 날) 견준 날이 「전날」이 아니다 — 화면이 견준 날을 적는다
    prevGap: Boolean(last && prev && Array.isArray(sessions) && sessions.includes(last.date) && sessions[sessions.indexOf(last.date) - 1] !== prev.date),
    // 출목표(바카라 표) — 지난 21거래일 종가(20거래일의 오르내림)
    c: road.map(r => round(r.close, 2)), cFrom: road[0]?.date ?? null, change20: change20Of(road.map(r => r.close)),
    info: {high52: hi, low52: lo, pos52: hi != null && hi > lo ? round((last.close - lo) / (hi - lo), 4) : null, days52: win.length,
      ret21: back(21) ? round(last.close / back(21) - 1) : null, ret252: back(252) ? round(last.close / back(252) - 1) : null},
    rows60: rows.slice(-60).map(r => ({date: r.date, close: r.close})),
    closeSource: last ? {basis: last.closeBasis ?? last.priceBasis ?? null, url: /^https:\/\//.test(last.sourceUrl ?? '') ? last.sourceUrl : null, observedAt: last.observedAt ?? null} : null};
}

/** 관측 묶음 → 회사 한 곳의 수급·기사·공시 (기사·공시 제목에 앞날 말이 있으면 빼고 수만 적는다) */
export function contextOf(snap, code) {
  if (!snap) return null;
  const fl = (snap.flows ?? []).find(x => x.code === code), nw = (snap.news ?? []).find(x => x.code === code), ds = (snap.disclosures ?? []).find(x => x.code === code);
  const news = (nw?.items ?? []).filter(i => !i.duplicateOf && typeof i.publishedAt === 'string').map(i => ({publishedAt: i.publishedAt, office: i.office ?? null, title: decodeEntities(i.title ?? ''), url: /^https:\/\/\S+$/.test(i.url ?? '') ? i.url : null}));
  const disc = (ds?.items ?? []).filter(i => typeof i.publishedAt === 'string').map(i => ({publishedAt: i.publishedAt, title: decodeEntities(i.title ?? ''), corporateAction: i.corporateAction === true, actionWord: i.actionWord ?? null}));
  const keep = x => !hidesPrediction(x.title);
  return {day: snap.day ?? null, fetchedAt: snap.fetchedAt ?? null,
    flows: fl ? fl.rows.slice(-5).map(r => ({date: r.date, foreignNet: r.foreignNet ?? null, institutionNet: r.institutionNet ?? null, individualNet: r.individualNet ?? null, status: r.status ?? null})) : [], flowsSourceUrl: fl?.sourceUrl ?? null,
    news: news.filter(keep).sort((x, y) => y.publishedAt.localeCompare(x.publishedAt)).slice(0, 6), newsHidden: news.filter(x => !keep(x)).length, newsRepublished: nw?.republished ?? 0,
    disclosures: disc.filter(keep).sort((x, y) => y.publishedAt.localeCompare(x.publishedAt)).slice(0, 4), disclosuresHidden: disc.filter(x => !keep(x)).length,
    missing: [!fl && '수급', !nw && '기사', !ds && '공시'].filter(Boolean)};
}

/** 시장 띠(코스피·코스닥) — 관측 묶음의 지수 원문 행 · 값이 비거나 숫자가 아니면 싣지 않는다 */
export function marketOf(snap, file = null) {
  if (!snap?.index?.length) return null;
  const items = snap.index.filter(i => i.rows?.length).map(i => { const r = i.rows.find(x => x.date === snap.day) ?? i.rows.at(-1);
    return {symbol: i.symbol, name: i.symbol === 'KOSPI' ? '코스피' : i.symbol === 'KOSDAQ' ? '코스닥' : i.symbol, date: r.date, close: r.close, changePct: r.changePct, sourceName: '네이버 증권 지수', sourceUrl: i.sourceUrl ?? null}; })
    .filter(x => finite(x.close) && finite(x.changePct) && ISO.test(x.date ?? ''));
  return items.length ? {day: snap.day, fetchedAt: snap.fetchedAt, record: file, items, closeTimeKST: '15:30'} : null;
}

/**
 * input: 지금 묶음(public/data/input.json) · snap: 관측 묶음(없어도 됨) · events: 확인된 일정 · universeNext: 바뀔 묶음(없어도 됨)
 * 반환: Map(이름 → 값) — manifest.json · board.json · agenda.json · stocks/<code>.json
 */
export function buildBoard({input, snap = null, contextFile = null, events = [], eventsSource = null, universeNext = null, now = new Date().toISOString()}) {
  const limitDay = koreaDay(now), files = new Map();
  const all = (input?.assets ?? []).map(a => companyOf(a, {limitDay, sessions: input?.calendar?.sessions ?? null}));
  const asOf = all.map(c => c.date).filter(Boolean).sort().at(-1) ?? null;
  const inputSHA256 = sha(JSON.stringify(input));
  const boardId = `board-${asOf}-${sha(inputSHA256 + '|' + now).slice(0, 8)}`;
  const late = all.filter(c => c.date !== asOf).map(c => ({code: c.code, name: c.name, date: c.date}));
  const set = universeSetOf(input);
  // 업종: 네이버 증권 업종 그대로 · 지난 20거래일 오름이 큰 업종부터 · 업종 안은 시가총액 큰 순(고를 때 순위 · 없으면 들어온 차례)
  //   요즘 불장 업종 11개 · 다음 불장 후보 22곳 — 지난 종가로 센 차례(lib/atlas11/industries.mjs)
  const hasKind = all.some(c => c.kind), capRank = new Map((input?.assets ?? []).map(a => [a.code, Number.isFinite(a.quality?.capRank) ? a.quality.capRank : null]));
  const {groups, hot, next} = industryBoard(all.map(c => ({code: c.code, name: c.name, group: c.group, kind: c.kind, capRank: capRank.get(c.code), change20: c.change20, cFrom: c.cFrom, date: c.date})));
  const ranked = [...capRank.values()].some(v => v != null);
  files.set('board.json', {schema: BOARD_SCHEMA, boardId, asOf, order: `업종은 지난 20거래일 오름이 큰 순 · 업종 안은 ${ranked ? '시가총액 큰 순(고를 때 순위)' : '들어온 차례'}`, late, groups, hot, next,
    kinds: hasKind ? {quality: all.filter(c => c.kind === 'quality').length, trend: all.filter(c => c.kind === 'trend').length, profit: all.filter(c => c.kind === 'profit').length, size: all.filter(c => c.kind === 'size').length} : null,
    companies: all.map(({rows60, closeSource, ...c}) => c)});
  for (const c of all) {
    const {rows60, ...rest} = c;
    files.set('stocks/' + c.code + '.json', {schema: 'atlas11-board-stock-1', boardId, ...rest, closes60: rows60, context: contextOf(snap, c.code)});
  }
  files.set('agenda.json', {...buildAgenda({events, input, snap, now, eventsSource, hide: hidesPrediction}), boardId});
  const manifest = {schema: 'atlas11-board-manifest-1', boardId, generatedAt: now, prediction: 'off', orderFile: 'config/atlas11/no-prediction.json', asOf, companies: all.length, late,
    universeSet: set, ...(universeNext ? {universeNext} : {}), market: marketOf(snap, contextFile), inputSHA256, files: {}};
  for (const [name, value] of files) { const text = JSON.stringify(value); manifest.files[name] = {sha256: sha(text), bytes: Buffer.byteLength(text)}; }
  files.set('manifest.json', manifest);
  validateBoard(files, {input, now});
  return files;
}

/** 묶음 검사 — 입력의 곳 수 그대로 · 같은 boardId · 화면 사이 같은 종가 · 업종 칸이 회사를 한 번씩만(회사의 업종과 같은 칸) · 불장 11·후보 22가 판 숫자와 맞음 · 앞날 종가 없음 · 예측 열쇠·낱말 없음 */
export function validateBoard(files, {input, now = new Date().toISOString()} = {}) {
  const m = files.get('manifest.json'), b = files.get('board.json'), ag = files.get('agenda.json');
  if (!m || !b || !ag) throw Error('BOARD_FILES');
  if (m.prediction !== 'off') throw Error('BOARD_PREDICTION_FLAG');
  const codes = (input?.assets ?? []).map(a => a.code);
  if (b.companies.length !== codes.length || new Set(b.companies.map(c => c.code)).size !== codes.length || b.companies.some((c, i) => c.code !== codes[i])) throw Error('BOARD_COMPANIES');
  const ids = new Set([m.boardId, b.boardId, ag.boardId]), day = koreaDay(now);
  for (const c of b.companies) {
    const s = files.get('stocks/' + c.code + '.json');
    if (!s) throw Error('BOARD_STOCK_MISSING ' + c.code);
    ids.add(s.boardId);
    if (s.close !== c.close || s.date !== c.date || (s.closes60.length && (s.closes60.at(-1).close !== c.close || s.closes60.at(-1).date !== c.date))) throw Error('BOARD_STOCK_MISMATCH ' + c.code);
    if (c.date && c.date > day) throw Error('BOARD_FUTURE_CLOSE ' + c.code);
    if (s.closes60.some(r => r.date > day)) throw Error('BOARD_FUTURE_CLOSE ' + c.code);
    if (!ag.byCode?.[c.code]) throw Error('BOARD_AGENDA ' + c.code);
  }
  if (ids.size !== 1) throw Error('BOARD_ID_MISMATCH');
  if (b.groups) { const inGroups = b.groups.flatMap(g => g.codes), where = new Map(b.groups.flatMap(g => g.codes.map(c => [c, g.id]))); if (inGroups.length !== b.companies.length || new Set(inGroups).size !== b.companies.length || b.groups.some(g => g.count !== g.codes.length) || b.companies.some(c => c.group && where.get(c.code) !== c.group.id)) throw Error('BOARD_GROUPS'); }
  if (b.hot) {
    const g = new Map((b.groups ?? []).map(x => [x.id, x])), hot = b.hot.items ?? [];
    if (hot.length > (b.hot.want ?? 11) || hot.some((h, i) => !g.get(h.id)?.hot || !(h.change20 > 0) || h.change20 !== g.get(h.id).change20 || (i && hot[i - 1].change20 < h.change20))) throw Error('BOARD_HOT');
  }
  if (b.next) {
    const g = new Map((b.groups ?? []).map(x => [x.id, x])), byCode = new Map(b.companies.map(c => [c.code, c]));
    if ((b.next.items ?? []).length > (b.next.want ?? 22) || (b.next.items ?? []).some(n => !byCode.has(n.code) || byCode.get(n.code).group?.id !== n.groupId || g.get(n.groupId)?.hot || n.change20 !== byCode.get(n.code).change20)) throw Error('BOARD_NEXT');
  }
  for (const [name, value] of files) if (name !== 'manifest.json' && m.files[name]?.sha256 !== sha(JSON.stringify(value))) throw Error('BOARD_HASH ' + name);
  const keys = [], words = [];
  const walk = (v, at) => {
    if (typeof v === 'string') { if (hidesPrediction(v)) words.push(at + '=' + v.slice(0, 40)); return; }
    if (Array.isArray(v)) { v.forEach((x, i) => walk(x, at + '[' + i + ']')); return; }
    if (v && typeof v === 'object') for (const [k, x] of Object.entries(v)) { if (FORBIDDEN_KEYS.includes(k)) keys.push(at + '.' + k); walk(x, at + '.' + k); }
  };
  for (const [name, value] of files) walk(value, name);
  if (keys.length) throw Error('BOARD_PREDICTION_KEYS ' + keys.slice(0, 8).join(' | '));
  if (words.length) throw Error('BOARD_PREDICTION_WORDS ' + words.slice(0, 8).join(' | '));
  return true;
}
