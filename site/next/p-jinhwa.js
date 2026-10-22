/* 진화(#/jinhwa) — 사장님 2026-10-18(싱가포르) 16:39 「[꼴똘이 · 진화가 본질인 명령문]」 [9] · [10] · 일꾼 KD · 22:45 「진화 탭을 상단에 만들어 구글과 잡스라면 어떻게 만들까?」 · 22:46 「모든 사람들」 · 일꾼 KM(accept/KM.md)
   모든 사람이 봄(읽기만): 위 막대 「진화」 단추(app.js) → 이 쪽 · 자료 /next/data/jinhwa.json 한 곳
   잡스 = 겉: 맨 위 「골똘이 진화」 + 본질 첫 줄 + 「진화 n번째」 → 카드 한 장씩(옆으로 밀거나 「‹」 「›」) — 들어간 것(새 날짜부터) → 확인을 기다리는 것
     카드 = 상태 한 줄(「n월 n일 들어감」 · 「확인을 기다려요」 · 「되돌렸어요」) · 이름 · 전과 후 그림(세로 화면 그림이라 나란히 · 없으면 「그림 없음」) · 섬기는 본질 · 세 사람 한마디 · 어림 · 10거래일 채점 · 접은 「자세히」
   구글 = 맨 아래 접은 「숫자로 보기」(진화한 수 · 들어간 것 · 되돌린 것 · 확인을 기다리는 것 · 10거래일 어림 맞음 · 틀림 — 수만 · 몫 · 순위 없음) · 고친 고장 줄
   단추(확인 · 다시 눌러 거두기 · 되돌리기)와 잣대 셋 · 위험 · 검사 줄은 사장님 열쇠 기기(localStorage atlas11:invite:owner + 서버 GET /api/jinhwa/me 가 맞다고 함)에서만 — 다른 기기는 단추 0 · 서버 물음 0
     (2026-10-18 리드 말씀: 저절로 넣기는 아직 만들지 않음 — 사장님 확인 길 그대로)
   「예측」(사장님 말)은 화면에서 「어림」 — site/next/words.js SCREEN 이 화면 글 「예측」을 막음
   「○시」 = 진화 회차(업데이트 30분 전)가 회차마다 하나만 넣는 차례(되돌리기 먼저 · 그다음 확인 · 이른 때부터 — scripts/atlas11/jinhwa/lib.mjs planRound)를 흉내 낸 셈 — slotPlan
   회차가 쓴 글(이름 · 섬기는 본질 · 세 사람 · 어림 · 고장 · 채점 까닭)은 한국어 그대로(lang="ko") · 글은 textContent 로만(보안 규칙) · 노드에서도 불러 시험(맨 위에서 NX 를 안 읽음) · 이름은 brand.js 한 곳 */
import {NAME, BRAND, josa} from './brand.js';
import {ON as EN} from './i18n.js'; // 영어 화면이면 본질 줄 위에 영어 한 줄(총정리 D24 · 노드에서 부르면 한국어 = false)
const OWNER = 'atlas11:invite:owner', DAYS = 14, MIN_SAMPLE = 30; // MIN_SAMPLE = config/atlas11/jinhwa-metrics.v1.json judge.minSample
const nx = () => globalThis.NX;
const h = (...a) => nx().h(...a);
const KST = 9 * 36e5;
const kstDay = iso => { const t = Date.parse(iso); return Number.isFinite(t) ? new Date(t + KST).toISOString().slice(0, 10) : null; };
const mdOf = iso => { const d = kstDay(iso); return d ? `${+d.slice(5, 7)}월 ${+d.slice(8, 10)}일` : '?'; };
const toast = t => { try { nx().toast(t); } catch { /* 알림 못 띄움 */ } };

/* ── 사장님 열쇠 문 ── */
const ownerKey = () => { try { const k = localStorage.getItem(OWNER); return typeof k === 'string' && k.length >= 16 && k.length <= 128 ? k : null; } catch { return null; } };
let ME = null; // {k, p, t} — 이 쪽을 연 동안 한 번 물음(아니라고 하면 1분 뒤 다시)
/** 이 기기가 사장님 열쇠 기기인가 — 열쇠가 없거나 · 서버가 아니라고 하거나 · 못 물으면 false */
export function ownerOk() {
  const k = ownerKey();
  if (!k) return Promise.resolve(false);
  if (ME && ME.k === k && (ME.ok !== false || Date.now() - ME.t < 60e3)) return ME.p;
  const me = {k, t: Date.now(), ok: null};
  me.p = fetch('/api/jinhwa/me', {headers: {'x-atlas-owner': k}, cache: 'no-store', credentials: 'omit'}).then(r => r.status === 200).catch(() => false).then(ok => { me.ok = ok; me.t = Date.now(); return ok; });
  ME = me;
  return me.p;
}
/** 보유종목 바로 가기에 「진화 칸」 줄 — 사장님 열쇠 기기에서 서버가 맞다고 한 뒤에만 box 끝에 붙임(이미 있으면 그대로) · 아니면 아무것도 안 함([9] 1) */
export function ownerRow(box) {
  ownerOk().then(ok => {
    if (!ok || !box || box.querySelector('a.jh-row')) return;
    box.append(h('a', {class: 'jh-row', href: '#/jinhwa'}, '진화 칸', h('span', {text: '›'})));
    if (!box.querySelector('a.adm-row')) box.append(h('a', {class: 'adm-row', href: '#/admin'}, '관리자 화면', h('span', {text: '›'})));
    if (!box.querySelector('a.gm-row')) box.append(h('a', {class: 'gm-row', href: '#/game'}, '가짜 돈 연습', h('span', {text: '›'}))); // 시험판(2026-10-19 15:04 「일단해」) — 공개 전에는 사장님 기기만 // 쿠폰 번호 확인 · 쿠폰 목록 · 가입 수(2026-10-19 13:54 「관리자 페이지도 있어야 해」)
  }).catch(() => {});
}
/* ── 업데이트 때(「○시」) — 매시 정각(서울 · 주말 · 공휴일도 · 사장님 2026-10-18 20:59 · 21:00) · 진화 회차는 30분 전 ── */
export const SLOTS = Object.freeze(Array.from({length: 24}, (_, h) => h)), LEAD_MIN = 30;
/** t(ms) 뒤 첫 업데이트 — lead = 회차가 그 업데이트 30분 전에 돌아 그때까지 들어온 확인만 봄(true) · false 면 그냥 다음 업데이트 */
export function slotAfter(t, lead = true) {
  const k = new Date(t + KST);
  for (let i = 0; i < 15; i++) {
    const day = Date.UTC(k.getUTCFullYear(), k.getUTCMonth(), k.getUTCDate() + i);
    for (const hh of SLOTS) { const s = day + hh * 36e5 - KST; if ((lead ? s - LEAD_MIN * 6e4 : s) > t) return s; }
  }
  return null;
}
/** 상태 → 번호마다 들어갈(되돌릴) 업데이트 때(ms) — 진화 회차를 흉내 냄: 다음 업데이트부터 업데이트마다 그 회차 때(30분 전) 앞에 적힌 것 가운데 하나만
 *  (되돌리기 먼저 · 그다음 확인 · 같은 갈래는 이른 때부터 — scripts/atlas11/jinhwa/lib.mjs planRound) · 이미 돈 회차(업데이트 30분 안)는 그때 앞에 적힌 것을 실음
 *  waiting · applied = 지금 자료의 번호(Set) — 주면 확인은 기다리는 것만 · 되돌리기는 들어간 것만(회차가 버리는 것은 셈하지 않음) */
export function slotPlan(items, now = Date.now(), {waiting = null, applied = null} = {}) {
  const out = new Map();
  const at = x => { const t = Date.parse(x.at); return Number.isFinite(t) ? t : now; };
  const order = (a, b) => at(a) - at(b) || (a.id < b.id ? -1 : 1);
  const rv = items.filter(x => x.state === 'revert' && (!applied || applied.has(x.id))).sort(order);
  const cf = items.filter(x => x.state === 'confirmed' && (!waiting || waiting.has(x.id))).sort(order);
  let s = slotAfter(now, false);
  for (let k = 0; s != null && (rv.length || cf.length) && k < 400; k++) {
    const cut = s - LEAD_MIN * 6e4, q = rv[0] && at(rv[0]) < cut ? rv : cf[0] && at(cf[0]) < cut ? cf : null;
    if (q) out.set(q.shift().id, s);
    s = slotAfter(s, false);
  }
  return out;
}
/** 확인함 · 되돌리기 함 글 — 다음 업데이트면 「다음 업데이트 ○시에」 · 오늘 뒤 것이면 「○시 업데이트에」 · 다른 날이면 날짜도 */
export function slotLabel(kind, s, now = Date.now()) {
  const head = kind === 'revert' ? '되돌리기 함' : '확인함', verb = kind === 'revert' ? '되돌려요' : '들어가요';
  if (s == null) return `${head} · 다음 업데이트에 ${verb}`;
  const hh = new Date(s + KST).getUTCHours();
  if (s === slotAfter(now, false)) return `${head} · 다음 업데이트 ${hh}시에 ${verb}`;
  const d = new Date(s + KST).toISOString().slice(0, 10);
  return d === new Date(now + KST).toISOString().slice(0, 10) ? `${head} · ${hh}시 업데이트에 ${verb}` : `${head} · ${+d.slice(5, 7)}월 ${+d.slice(8, 10)}일 ${hh}시 업데이트에 ${verb}`;
}

/* ── 받기 · 보내기 ── */
async function getJson(url, opt = {}) { try { const r = await fetch(url, {cache: 'no-store', credentials: 'omit', ...opt}); return r.ok ? await r.json() : null; } catch { return null; } }
const getData = async () => { const j = await getJson('/next/data/jinhwa.json'); return j?.schema === 'kkolttori-jinhwa-1' && Array.isArray(j.waiting) && Array.isArray(j.applied) ? j : null; };
async function post(op, id) {
  try {
    const r = await fetch('/api/jinhwa/' + op, {method: 'POST', headers: {'content-type': 'application/json', 'x-atlas-owner': ownerKey() ?? ''}, body: JSON.stringify({id}), cache: 'no-store', credentials: 'omit'});
    let j = null; try { j = await r.json(); } catch { j = null; }
    return {status: r.status, body: j ?? {}};
  } catch { return {status: 0, body: {}}; }
}
const WHY = {owner_only: '? 사장님 열쇠가 맞지 않아요.', applied: '이미 들어간 진화예요. 되돌리기는 그 카드에서 해요.', reverted: '이미 되돌린 진화예요.', unknown_id: '? 이 대안을 찾지 못했어요. 쪽을 다시 열어 주세요.', no_data: '? 진화 자료를 받지 못했어요. 잠시 뒤 다시 눌러 주세요.'};
const whyOf = r => WHY[r.body?.error] ?? '? 적지 못했어요. 잠시 뒤 다시 눌러 주세요.';


/* ── 그리기 조각 ── */
const IMG_RE = /^(?:\/next\/)?data\/jinhwa\/[A-Za-z0-9._-]+\.(png|jpe?g|webp|svg)$/;
/** 그림 길 — 회차가 준 길(그림 폴더 안 · /next/ 기준 상대 길도) 또는 /next/data/jinhwa/<번호>-before.png · -after.png */
export const picSrc = (x, side) => { const v = x?.[side]; return typeof v === 'string' && IMG_RE.test(v) ? (v.startsWith('/') ? v : '/next/' + v) : `/next/data/jinhwa/${encodeURIComponent(String(x?.id ?? ''))}-${side}.png`; };
/** 바뀐 곳 표시(사장님 2026-10-19 00:5x 「어디를 고쳤는지 글은 있는데 표기가 없어서 한참 찾아야 해」) — 회차(shots.mjs)가 찾은 네모 {x, y, w, h}(360 × 640 그림 안 · 점) · 꼴이 틀리면 null */
const PW = 360, PH = 640;
export function markOf(x) {
  const b = x?.mark?.box, n = v => Number.isFinite(v) && v >= 0;
  if (!b || ![b.x, b.y, b.w, b.h].every(n) || b.w < 1 || b.h < 1 || b.x + b.w > PW || b.y + b.h > PH) return null;
  return {x: b.x, y: b.y, w: b.w, h: b.h, text: typeof x.mark.text === 'string' ? x.mark.text.trim() : '', route: typeof x.mark.route === 'string' ? x.mark.route : ''};
}
/** 찍은 쪽 이름(아래 단추 이름 · 진화) — 모르면 null */
const PAGE = {'': '오늘 장', shorts: '시황', why: '매매일지', sub: '관심', me: '보유종목', jinhwa: '진화'};
export const pageOf = route => { const m = /^#\/([a-z]*)/.exec(String(route ?? '')); return m && m[1] in PAGE ? PAGE[m[1]] : null; };
const pct = (v, of) => `${(v / of * 100).toFixed(3)}%`;
/** 그림 위 네모 — 전 = 점선(여기가 바뀌어요) · 후 = 금빛 굵은 테 · 자리는 스타일 속성이 아니라 CSSOM 으로(보안 규칙 style-src 'self') */
function boxOn(M, side) {
  const b = h('span', {class: 'jh-box ' + side, 'aria-hidden': 'true'});
  b.style.left = pct(M.x, PW); b.style.top = pct(M.y, PH); b.style.width = pct(M.w, PW); b.style.height = pct(M.h, PH);
  return b;
}
/** 전과 후 그림 — 휴대폰 화면 그림(세로)이라 두 장을 나란히(전 → 후) · 바뀐 곳 네모 · 못 받으면 차분한 「그림 없음」 칸 · 누르면 크게(새 칸) */
function pics(x) {
  const M = markOf(x);
  const one = side => {
    const src = picSrc(x, side), cap = side === 'before' ? '전' : '후';
    const img = h('img', {class: 'jh-img', src, alt: side === 'before' ? '고치기 전 화면' : '고친 뒤 화면', loading: 'lazy', decoding: 'async'});
    const frame = h('span', {class: 'jh-frame'}, img, M ? boxOn(M, side) : null);
    const box = h('a', {class: 'jh-pic', href: src, target: '_blank', rel: 'noopener'}, frame);
    img.addEventListener('error', () => box.replaceWith(h('span', {class: 'jh-pic jh-noimg', text: '그림 없음'})), {once: true});
    return h('figure', {class: 'jh-fig'}, box, h('figcaption', {text: cap}));
  };
  return h('div', {class: 'jh-pics'}, one('before'), h('span', {class: 'jh-arrow', 'aria-hidden': 'true', text: '→'}), one('after'));
}
/** 바뀐 곳 크게 — 고친 뒤 그림에서 네모만 오려 제 크기로(카드 폭에 맞춤) · 위에 「바뀐 곳 · 쪽 이름」 · 표시가 없으면 안 그림 */
function zoom(x) {
  const M = markOf(x); if (!M) return null;
  const src = picSrc(x, 'after'), pg = pageOf(M.route);
  const img = h('img', {class: 'jh-zimg', src, alt: '고친 뒤 화면에서 바뀐 곳', loading: 'lazy', decoding: 'async'});
  img.style.width = pct(PW, M.w); img.style.left = `-${pct(M.x, M.w)}`; img.style.top = `-${pct(M.y, M.h)}`;
  const crop = h('span', {class: 'jh-crop'}, img);
  crop.style.aspectRatio = `${M.w} / ${M.h}`;
  const fig = h('figure', {class: 'jh-zoom'}, h('figcaption', {class: 'jh-zk'}, h('b', {text: '바뀐 곳'}), pg ? h('span', {text: ` · ${pg}`}) : null), h('a', {class: 'jh-zpic', href: src, target: '_blank', rel: 'noopener'}, crop));
  img.addEventListener('error', () => fig.remove(), {once: true});
  return fig;
}
/** 이름표 + 회차가 쓴 글 한 줄(없으면 안 그림) */
const line = (k, v, cls = '') => (typeof v === 'string' && v.trim() ? h('p', {class: 'jh-line ' + cls}, h('span', {class: 'jh-k', text: k + ' '}), h('span', {lang: 'ko', text: v.trim()})) : null);
const failN = v => (Number.isInteger(v) ? v : Number.isInteger(v?.fail) ? v.fail : Number.isInteger(v?.fails) ? v.fails : null);
/* 회차 기록은 그때 글자 그대로 두고 화면에만 지금 이름(사장님 2026-10-19 10:21 「돌이야」 — 옛 이름 + 토씨를 새 이름 받침에 맞춤 · 기록 파일은 안 고침) */
const OLD_RE = new RegExp('(' + BRAND.was.map(w => w.ko).join('|') + ')(이에요|예요|으로|은|는|이|가|을|를|과|와|로|의)?', 'g');
const nowName = s => s.replace(OLD_RE, (m, o, p) => (p ? (p === '의' ? NAME + '의' : josa(NAME, p)) : NAME));
const txt = v => (typeof v === 'string' && v.trim() ? nowName(v.trim()) : null);

/** 되돌린 때 — 진화 회차 꼴 reverted {at} · 옛 꼴 revertedAt · reverted 글(때) — 되돌리지 않았으면 null */
export const revertedAt = a => (a?.reverted && typeof a.reverted === 'object' ? a.reverted.at ?? '' : typeof a?.reverted === 'string' ? a.reverted : a?.reverted === true ? '' : a?.revertedAt ?? null);
/** 채점 글([9] 6 · [10] 6) — score.at 이 없으면 아직(회차가 쓴 까닭이 있으면 그 글) · 있으면 맞았어요 · 틀렸어요 · 판단 못 했어요 + 까닭 */
export function scoreLine(a) {
  const sc = a?.score, days = Number.isInteger(a?.predict?.days) ? a.predict.days : 10, why = typeof sc?.text === 'string' ? sc.text.trim() : '';
  if (!sc || !sc.at) return {cls: '', head: why ? null : `${days}거래일 뒤 채점 전이에요`, why};
  return {cls: sc.ok === true ? ' ok' : sc.ok === false ? ' no' : '', head: `${days}거래일 뒤 · ${sc.ok === true ? '맞았어요' : sc.ok === false ? '틀렸어요' : '판단 못 했어요'}`, why};
}

/** 카드 차례(모든 사람 같은 셈) — 들어간 것(새 날짜부터 · 되돌린 것도 그 자리) → 확인을 기다리는 것(자료 차례) · 번호 없는 줄은 버림 */
export function cardsOf(J) {
  if (!J || !Array.isArray(J.waiting) || !Array.isArray(J.applied)) return null;
  const tOf = x => { const t = Date.parse(x?.at); return Number.isFinite(t) ? t : 0; };
  const A = J.applied.filter(a => typeof a?.id === 'string').sort((a, b) => tOf(b) - tOf(a)).map(x => ({kind: revertedAt(x) != null ? 'reverted' : 'applied', x}));
  const W = J.waiting.filter(w => typeof w?.id === 'string').map(x => ({kind: 'waiting', x}));
  return [...A, ...W];
}
/** 숫자로 보기(접은 칸) — 들어간 수 · 확인을 기다리는 수 · 되돌린 수 · 10거래일 어림(맞음 · 틀림 · 판단 못 함 · 아직) — 몫(%)은 셈하지 않음 */
export function numbersOf(J) {
  const C = cardsOf(J); if (!C) return null;
  const ap = C.filter(c => c.kind !== 'waiting'), sc = ap.map(c => c.x.score).filter(s => s && s.at);
  return {applied: ap.length, waiting: C.length - ap.length, reverted: C.filter(c => c.kind === 'reverted').length,
    right: sc.filter(s => s.ok === true).length, wrong: sc.filter(s => s.ok === false).length, unsure: sc.filter(s => s.ok !== true && s.ok !== false).length, notYet: ap.length - sc.length};
}

/** 상태 단추(사장님 열쇠 기기만) — kind = confirm(확인을 기다리는 카드) · revert(들어간 카드) · 누를 때마다 서버에 적고 모든 단추 글을 다시 셈 */
function stateBtn(x, kind, C) {
  const onState = kind === 'revert' ? 'revert' : 'confirmed';
  const b = h('button', {class: kind === 'revert' ? 'jh-rv' : 'jh-ok', type: 'button', 'data-id': x.id});
  const paint = () => {
    const on = C.st.get(x.id)?.state === onState;
    b.classList.toggle('on', on); b.setAttribute('aria-pressed', String(on));
    b.textContent = on ? slotLabel(kind, C.plan.get(x.id) ?? null) : kind === 'revert' ? '되돌리기' : '확인';
    if (!C.stOk) b.disabled = true;
  };
  b.addEventListener('click', async () => {
    if (b.disabled || !C.stOk) return;
    const on = C.st.get(x.id)?.state === onState;
    b.disabled = true; b.setAttribute('aria-busy', 'true');
    const r = await post(on ? 'withdraw' : kind === 'revert' ? 'revert' : 'confirm', x.id);
    b.disabled = false; b.removeAttribute('aria-busy');
    if (r.status === 200 && typeof r.body?.state === 'string') {
      C.st.set(x.id, {id: x.id, state: r.body.state, at: r.body.at}); C.replan();
      toast(kind === 'revert' ? (on ? '되돌리기를 거뒀어요.' : '되돌리기를 적었어요.') : on ? '확인을 거뒀어요.' : '확인했어요.');
    } else toast(whyOf(r));
    b.focus({preventScroll: true});
  });
  C.painters.push(paint); paint();
  return b;
}

/** 카드 한 장 — 위 = 상태 한 줄 · 이름 · 전과 후 그림 / 아래 = 섬기는 본질 · 세 사람 한마디 · 어림 · 10거래일 · 접은 「자세히」 */
function oneCard({kind, x}, i, n, C) {
  const v = x.voices ?? {}, p = x.predict ?? {}, rt = kind === 'reverted' ? revertedAt(x) : null;
  const tag = kind === 'waiting' ? h('b', {class: 'jh-tag wait', text: '확인을 기다려요'})
    : kind === 'reverted' ? h('b', {class: 'jh-tag', text: `되돌렸어요 · ${rt ? mdOf(rt) : '?'}`})
    : h('b', {class: 'jh-tag', text: `${mdOf(x.at)} 들어감`});
  const S = kind === 'waiting' ? null : scoreLine(x);
  const has3 = ['kahneman', 'munger', 'popper'].some(k => txt(v[k]));
  const more = [line('재는 법', p.measure), line('되돌릴 조건', x.revert), line('사전 부검', x.premortem)].filter(Boolean);
  const own = C.owner ? (() => {
    const ch = x.checks ?? {}, cf = failN(ch.changed), pf = failN(ch.preview);
    return [...(x.big ? (Array.isArray(x.risks) ? x.risks : []).slice(0, 2).map(r => line('위험', r, 'jh-risk')) : []),
      cf != null || pf != null ? h('p', {class: 'jh-line jh-k', text: `바뀐 쪽 검사 실패 ${cf ?? '?'} · 전체 미리 검사 실패 ${pf ?? '?'}`}) : null];
  })() : [];
  return h('article', {class: 'jh-card ' + kind, 'data-id': x.id, 'data-kind': kind, role: 'group', 'aria-label': `${i + 1} / ${n}`},
    h('p', {class: 'jh-top'}, tag, kind === 'waiting' && x.pick ? h('span', {class: 'jh-badge', text: '세 사람이 고른 것'}) : null, C.owner && x.big ? h('span', {class: 'jh-bigt', text: '큰 것'}) : null),
    h('h3', {class: 'jh-name', lang: 'ko', text: txt(x.title) ?? '?'}),
    C.owner && kind === 'waiting' ? stateBtn(x, 'confirm', C) : C.owner && kind === 'applied' ? stateBtn(x, 'revert', C) : null, // 단추는 이름 바로 밑(사장님 2026-10-19 「승인 버튼을 못찾겠어 잘 보이개 해야 해」)
    pics(x),
    zoom(x),
    !C.owner && kind === 'waiting' ? h('p', {class: 'jh-line jh-k jh-who-ok', text: '확인 단추는 사장님 휴대폰에만 보여요.'}) : null,
    line('섬기는 본질', x.serves),
    has3 ? h('ul', {class: 'jh-voices', 'aria-label': '세 사람 한마디'}, ...[['카너먼', v.kahneman], ['멍거', v.munger], ['포퍼', v.popper]].map(([who, say]) => h('li', {}, h('span', {class: 'jh-who', text: who}), h('span', {lang: 'ko', text: txt(say) ?? '?'})))) : null,
    line('어림', p.text),
    S ? h('p', {class: 'jh-line jh-score' + S.cls}, S.head ? h('span', {text: S.head}) : null, S.why ? h('span', {lang: 'ko', text: (S.head ? ' — ' : '') + S.why}) : null)
      : h('p', {class: 'jh-line jh-k', text: `들어가면 ${Number.isInteger(p.days) ? p.days : 10}거래일 뒤 채점해요`}),
    more.length ? h('details', {class: 'jh-more'}, h('summary', {text: '자세히'}), ...more) : null,
    ...own);
}

/** 카드 넘기기 — 손가락으로 밀거나 「‹ 앞」 「다음 ›」 · 지금 몇 번째인지 한 줄 */
function carousel(cards, C, start = 0) {
  const n = cards.length, rail = h('div', {class: 'jh-rail', tabindex: '0', 'aria-label': '진화 카드'}, ...cards.map((c, i) => oneCard(c, i, n, C)));
  const cnt = h('span', {class: 'jh-cnt num', 'aria-live': 'polite'});
  const prev = h('button', {class: 'jh-nav', type: 'button', 'aria-label': '앞 카드', text: '‹'}), next = h('button', {class: 'jh-nav', type: 'button', 'aria-label': '다음 카드', text: '›'});
  const at = () => { const w = rail.clientWidth || 1; return Math.max(0, Math.min(n - 1, Math.round(rail.scrollLeft / w))); };
  const paint = (i = at()) => { cnt.textContent = `${i + 1} / ${n}`; prev.disabled = i <= 0; next.disabled = i >= n - 1; };
  const go = i => { const smooth = !(globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches); rail.scrollTo({left: i * rail.clientWidth, behavior: smooth ? 'smooth' : 'auto'}); paint(i); };
  prev.addEventListener('click', () => go(at() - 1)); next.addEventListener('click', () => go(at() + 1));
  let raf = 0; rail.addEventListener('scroll', () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(() => paint()); }, {passive: true});
  rail.addEventListener('keydown', e => { if (e.key === 'ArrowRight') { e.preventDefault(); go(at() + 1); } else if (e.key === 'ArrowLeft') { e.preventDefault(); go(at() - 1); } });
  paint(start);
  if (start > 0) requestAnimationFrame(() => { rail.scrollLeft = start * rail.clientWidth; paint(start); });
  return {rail, nav: h('div', {class: 'jh-navs'}, prev, cnt, next)};
}

/** 잣대 셋([10] 1 · 2 · 5 · 사장님 열쇠 기기만) — 지난 14일 합계 · 30번 안이면 「모으는 중」 · 참고 숫자는 접음 */
function measures(T, J) {
  const sec = h('section', {class: 'jh-ms', 'aria-label': '잣대 셋'}, h('h2', {class: 'sec', text: '잣대 셋'}));
  sec.append(h('p', {class: 'note', text: `지난 ${DAYS}일 합계예요. ${MIN_SAMPLE}번이 안 되면 판단하지 않고 모아요. 하루 숫자는 소음이에요.`}));
  const t = ['stop', 'stop_rest', 'promise', 'promise_yes'].every(k => Number.isInteger(T?.total?.[k])) ? T.total : null, few = n => (n < MIN_SAMPLE ? h('span', {class: 'jh-few', text: ' · 모으는 중'}) : null);
  if (!t) sec.append(h('p', {class: 'jh-m jh-q', text: '? 합계를 받지 못했어요.'}));
  else {
    sec.append(h('p', {class: 'jh-m'}, h('b', {text: '① 멈춤'}), h('span', {text: ` 매매일지를 끝낸 수 ${t.stop}번 · 그중 「오늘은 쉬어 가자」 ${t.stop_rest}번`}), few(t.stop)));
    sec.append(h('p', {class: 'jh-m'}, h('b', {text: '② 약속'}), h('span', {text: ` 「그날 정한 대로 했어?」에 답한 수 ${t.promise}번 · 그중 「했어」 ${t.promise_yes}번`}), few(t.promise)));
  }
  const f = J?.facts, mis = Number.isInteger(f?.mismatch) ? f.mismatch : null;
  sec.append(h('p', {class: 'jh-m' + (mis ? ' jh-q' : '')}, h('b', {text: '③ 사실'}), h('span', {text: mis == null ? ' 화면 숫자가 자료와 다른 곳 ?' : ` 화면 숫자가 자료와 다른 곳 ${mis}곳` + (kstDay(f.at) ? ` · ${mdOf(f.at)} 기준` : '')})));
  const r = ['visit', 'share', 'signup'].every(k => Number.isInteger(T?.refTotal?.[k])) ? T.refTotal : null;
  if (r) sec.append(h('details', {class: 'jh-ref'}, h('summary', {text: '참고 숫자 · 잣대가 아니에요'}), h('p', {class: 'jh-m', text: `사이트를 연 수 ${r.visit} · 보낸 수 ${r.share} · 가입을 마친 수 ${r.signup}`})));
  return sec;
}
/** 숫자로 보기(맨 아래 접은 칸) — 수만 · 몫 · 순위 없음 */
function numbers(J) {
  const N = numbersOf(J), q = v => (N ? v : '?');
  return h('details', {class: 'jh-g'}, h('summary', {text: '숫자로 보기'}),
    h('p', {class: 'jh-m', text: `진화한 수 ${J && Number.isInteger(J.n) ? J.n : '?'}`}),
    h('p', {class: 'jh-m', text: `들어간 것 ${q(N?.applied)} · 그중 되돌린 것 ${q(N?.reverted)}`}),
    h('p', {class: 'jh-m', text: `확인을 기다리는 것 ${q(N?.waiting)}`}),
    h('p', {class: 'jh-m', text: `10거래일 어림 · 맞음 ${q(N?.right)} · 틀림 ${q(N?.wrong)} · 판단 못 함 ${q(N?.unsure)} · 아직 ${q(N?.notYet)}`}));
}

/** #/jinhwa — 모든 사람이 봄(사장님 2026-10-18 22:46 「모든 사람들」) · 단추(확인 · 거두기 · 되돌리기)는 사장님 열쇠 기기에서 서버가 맞다고 할 때만 · arg = 카드 번호면 그 카드부터 */
export async function render(arg) {
  const owner = await ownerOk(); // 열쇠가 없는 기기는 서버에 묻지 않음(false)
  const [J, S, T] = await Promise.all([getData(), owner ? getJson('/api/jinhwa/status') : null, owner ? getJson('/api/tally/sum?days=' + DAYS, {headers: {'x-atlas-owner': ownerKey() ?? ''}}) : null]);
  const items = Array.isArray(S?.items) ? S.items.filter(x => typeof x?.id === 'string' && typeof x.state === 'string') : [];
  const cards = cardsOf(J), n = Number.isInteger(J?.n) ? J.n : null;
  const sets = {waiting: new Set((cards ?? []).filter(c => c.kind === 'waiting').map(c => c.x.id)), applied: new Set((cards ?? []).filter(c => c.kind === 'applied').map(c => c.x.id))}; // 「○시」 셈 — 회차가 실제로 다룰 번호만
  const C = {owner, st: new Map(items.map(x => [x.id, x])), stOk: Array.isArray(S?.items), plan: new Map(), painters: []};
  C.replan = () => { C.plan = slotPlan([...C.st.values()], Date.now(), sets); for (const p of C.painters) p(); };
  C.plan = slotPlan(items, Date.now(), sets);
  const root = h('div', {class: 'jh', 'data-page': 'jinhwa'});
  const ess = txt(J?.essence) ?? '?';
  root.append(h('h1', {class: 'jh-h1', text: `${NAME} 진화`}),
    ...(EN ? [h('p', {class: 'jh-ess-en', text: '테마가 될 듯한 곳을 찾아 줘요.'})] : []), // 영어 화면 — 본질 1을 사전에 이미 있는 영어 한 줄로(아래 한국어 본질 줄은 글자 그대로 · 총정리 D24)
    h('p', {class: 'jh-ess', lang: 'ko', text: ess}));
  const head = h('div', {class: 'jh-head'}, h('p', {class: 'jh-n', text: `진화 ${n ?? '?'}번째`}));
  root.append(head);
  /* 결 — 이 쪽이 무엇을 세는지 한 줄 고리(총정리 2026-10-22 D21) · 그 밖 바뀐 것은 업데이트 기록 · 사장님 열쇠 기기는 확인 · 되돌리기 단추가 첫 화면에 들어야 해서 안 그림(check_jinhwa 360 × 640) */
  if (!owner) root.append(h('a', {class: 'jh-what', href: '#/up', text: `${josa(NAME, '를')} 만든 사람이 확인한 나아짐만 세요 · 다른 바뀐 것은 업데이트 기록 ›`}));
  if (!J) root.append(h('p', {class: 'note jh-q', text: '? 진화 자료를 받지 못했어요. 잠시 뒤 다시 열어 주세요.'}));
  else if (!cards.length) root.append(h('p', {class: 'note jh-empty', text: '아직 진화한 것이 없어요. 위 한 줄을 잣대로 천천히 고쳐 가요.'}));
  else {
    const i0 = Math.max(0, cards.findIndex(c => c.x.id === arg));
    const {rail, nav} = carousel(cards, C, i0);
    head.append(nav); root.append(rail);
    if (owner && !C.stOk) root.append(h('p', {class: 'note jh-q', text: '? 확인 상태를 받지 못했어요. 잠시 뒤 다시 열어 주세요.'}));
  }
  // 고친 고장(새 날짜부터)
  const tOf = x => { const t = Date.parse(x?.at); return Number.isFinite(t) ? t : 0; };
  const F = J && Array.isArray(J.fixed) ? J.fixed.filter(f => typeof f?.what === 'string' && f.what.trim()).sort((a, b) => tOf(b) - tOf(a)) : null;
  root.append(h('h2', {class: 'sec', text: `고친 고장 ${F ? F.length : '?'}`}));
  if (F && !F.length) root.append(h('p', {class: 'note', text: '고친 고장이 없어요.'}));
  if (F?.length) root.append(h('ul', {class: 'jh-fix'}, ...F.map(f => h('li', {}, h('span', {class: 'jh-k', text: mdOf(f.at) + ' '}), h('span', {lang: 'ko', text: f.what.trim()})))));
  root.append(numbers(J));
  if (owner) root.append(measures(T, J));
  return {title: '진화', nodes: [root]};
}
