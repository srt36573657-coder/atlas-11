/* 진화 칸(#/jinhwa) — 사장님 2026-10-18(싱가포르) 16:39 「[꼴똘이 · 진화가 본질인 명령문]」 [9] 1 ~ 10 · [10] 1 ~ 6 · 일꾼 KD · 잣대 docs/design/kkolttori-2026-10-18/accept/KD.md
   사장님 열쇠 기기에서만 열림([9] 1): 이 기기에 사장님 열쇠(localStorage atlas11:invite:owner — 편지 여는 밤 · 초대장 쪽과 같은 자리)가 있고 서버(GET /api/jinhwa/me)가 맞다고 할 때만.
     아니면 아무것도 그리지 않고 첫 화면(#/)으로 바꿔 씀(주소 기록에도 안 남음) · 보유종목 바로 가기 「진화 칸」 줄(ownerRow — p-hold shortcuts 가 부름)도 같은 문
   차례: ① 맨 위 = 본질 한 줄 + 「진화 n번째」([9] 2) ② 기다리는 진화 — 대안 카드(옆으로 넘김 · 이름 · 전과 후 그림 · 「확인」 → 섬기는 본질 · 세 사람 한마디 · 예측 · 되돌릴 조건 · 사전 부검 · 큰 것 위험)([9] 3 · 4 · 5)
         ③ 진화한 것(날짜 · 무엇이 바뀌었나 · 전과 후 그림 · 10거래일 뒤 채점 · 「되돌리기」)([9] 6) ④ 고친 고장([9] 7) ⑤ 잣대 셋(합계 칸 · [10] — 참고 숫자는 접음)
   자료: /next/data/jinhwa.json(진화 회차 KE · kkolttori-jinhwa-1) · 그림 /next/data/jinhwa/<번호>-before.png · -after.png · 상태 GET /api/jinhwa/status · 합계 GET /api/tally/sum?days=14
   단추: 「확인」 → POST /api/jinhwa/confirm · 들어가기 전 다시 누름 → withdraw([9] 5) · 「되돌리기」 → revert · 다시 누름 → withdraw(되돌리기를 거둠) — 모두 사장님 열쇠 머리글(x-atlas-owner)
   「○시」 = 업데이트(평일 10 · 12 · 14 · 18시 서울)의 진화 회차(30분 전)가 그 확인을 처음 보는 때 · 확인이 여럿이면 하나씩(업데이트마다 한 가지 · [1] 5) — slotPlan
   회차가 쓴 글(이름 · 섬기는 본질 · 세 사람 · 예측 · 고장)은 한국어 그대로(lang="ko") · 글은 textContent 로만(보안 규칙) · 노드에서도 불러 시험(맨 위에서 NX 를 안 읽음) */
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
  }).catch(() => {});
}
/** 문 밖 — 아무것도 그리지 않고 첫 화면으로(주소 기록을 바꿔 씀) · 길(route)이 새 화면을 그리면 이 결과는 버려짐 */
function away() {
  return new Promise(res => {
    const done = () => res({title: '', nodes: []});
    addEventListener('hashchange', done, {once: true}); setTimeout(done, 3000);
    location.replace('#/');
  });
}

/* ── 업데이트 때(「○시」) — 평일(서울) 10 · 12 · 14 · 18시 · 진화 회차는 30분 전 ── */
export const SLOTS = Object.freeze([10, 12, 14, 18]), LEAD_MIN = 30;
/** t(ms) 뒤 첫 업데이트 — lead = 회차가 그 업데이트 30분 전에 돌아 그때까지 들어온 확인만 봄(true) · false 면 그냥 다음 업데이트 */
export function slotAfter(t, lead = true) {
  const k = new Date(t + KST);
  for (let i = 0; i < 15; i++) {
    const day = Date.UTC(k.getUTCFullYear(), k.getUTCMonth(), k.getUTCDate() + i), wd = new Date(day).getUTCDay();
    if (wd === 0 || wd === 6) continue;
    for (const hh of SLOTS) { const s = day + hh * 36e5 - KST; if ((lead ? s - LEAD_MIN * 6e4 : s) > t) return s; }
  }
  return null;
}
/** 상태 → 번호마다 들어갈(되돌릴) 업데이트 때(ms) — 확인은 이른 차례로 업데이트마다 하나 · 되돌리기는 저마다 · 지난 때는 지금 뒤로 미룸 */
export function slotPlan(items, now = Date.now()) {
  const out = new Map();
  const at = x => { const t = Date.parse(x.at); return Number.isFinite(t) ? t : now; };
  const first = x => { let s = slotAfter(at(x)); if (s == null || s <= now) s = slotAfter(now); return s; };
  let last = -Infinity;
  for (const x of items.filter(x => x.state === 'confirmed').sort((a, b) => at(a) - at(b))) {
    let s = first(x);
    if (s != null && s <= last) s = slotAfter(last - LEAD_MIN * 6e4);
    out.set(x.id, s); if (s != null) last = s;
  }
  for (const x of items.filter(x => x.state === 'revert')) out.set(x.id, first(x));
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
const WHY = {owner_only: '? 사장님 열쇠가 맞지 않아요.', applied: '이미 들어간 진화예요. 되돌리기는 「진화한 것」에서 해요.', reverted: '이미 되돌린 진화예요.', unknown_id: '? 이 대안을 찾지 못했어요. 쪽을 다시 열어 주세요.', no_data: '? 진화 자료를 받지 못했어요. 잠시 뒤 다시 눌러 주세요.'};
const whyOf = r => WHY[r.body?.error] ?? '? 적지 못했어요. 잠시 뒤 다시 눌러 주세요.';

/* ── 그리기 조각 ── */
const IMG_RE = /^\/next\/data\/jinhwa\/[A-Za-z0-9._-]+\.(png|jpe?g|webp|svg)$/;
/** 전과 후 그림 한 장씩 — 회차가 준 길(그림 폴더 안) 또는 <번호>-before.png · -after.png · 못 받으면 「? 그림 없음」 · 누르면 크게(새 칸) */
function pics(x, small = false) {
  const one = side => {
    const v = x[side], src = typeof v === 'string' && IMG_RE.test(v) ? v : `/next/data/jinhwa/${encodeURIComponent(x.id)}-${side}.png`;
    const img = h('img', {class: 'jh-img', src, alt: side === 'before' ? '고치기 전' : '고친 뒤', loading: 'lazy', decoding: 'async'});
    const box = h('a', {class: 'jh-pic', href: src, target: '_blank', rel: 'noopener'}, img);
    img.addEventListener('error', () => box.replaceWith(h('span', {class: 'jh-pic jh-noimg', text: '? 그림 없음'})), {once: true});
    return h('figure', {class: 'jh-fig'}, box, h('figcaption', {text: side === 'before' ? '전' : '후'}));
  };
  const words = ['before', 'after'].map(s => (typeof x[s] === 'string' && x[s].trim() && !IMG_RE.test(x[s]) ? h('p', {class: 'jh-line'}, h('span', {class: 'jh-k', text: s === 'before' ? '전 ' : '후 '}), h('span', {lang: 'ko', text: x[s].trim()})) : null));
  return [h('div', {class: 'jh-pics' + (small ? ' sm' : '')}, one('before'), one('after')), ...words];
}
/** 이름표 + 회차가 쓴 글 한 줄(없으면 안 그림) */
const line = (k, v, cls = '') => (typeof v === 'string' && v.trim() ? h('p', {class: 'jh-line ' + cls}, h('span', {class: 'jh-k', text: k + ' '}), h('span', {lang: 'ko', text: v.trim()})) : null);
const failN = v => (Number.isInteger(v) ? v : Number.isInteger(v?.fail) ? v.fail : Number.isInteger(v?.fails) ? v.fails : null);

/** 상태 단추 — kind = confirm(기다리는 진화) · revert(진화한 것) · 누를 때마다 서버에 적고 모든 단추 글을 다시 셈 */
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

/** 기다리는 진화 카드 하나([9] 3 · 4) — 첫 화면에 이름 · 그림 · 단추가 들게 차례를 둠 */
function waitCard(w, i, n, C) {
  const v = w.voices ?? {}, p = w.predict ?? {}, ch = w.checks ?? {}, cf = failN(ch.changed), pf = failN(ch.preview);
  return h('article', {class: 'jh-card' + (w.pick ? ' jh-pick' : ''), 'data-id': w.id, 'aria-label': `기다리는 진화 ${i + 1} / ${n}`},
    h('p', {class: 'jh-top'}, h('span', {class: 'num', text: `${i + 1} / ${n}`}), w.pick ? h('b', {class: 'jh-badge', text: '세 사람이 고른 것'}) : null, w.big ? h('b', {class: 'jh-bigt', text: '큰 것'}) : null),
    h('h3', {class: 'jh-name', lang: 'ko', text: typeof w.title === 'string' && w.title.trim() ? w.title.trim() : '?'}),
    ...pics(w),
    stateBtn(w, 'confirm', C),
    line('섬기는 본질', w.serves),
    h('p', {class: 'jh-line jh-k jh-vh', text: '세 사람 한마디'}),
    h('ul', {class: 'jh-voices'}, ...[['카너먼', v.kahneman], ['멍거', v.munger], ['포퍼', v.popper]].map(([who, say]) => h('li', {}, h('span', {class: 'jh-k', text: who + ' '}), h('span', {lang: 'ko', text: typeof say === 'string' && say.trim() ? say.trim() : '?'})))),
    line('예측', p.text), line('재는 법', p.measure),
    h('p', {class: 'jh-line jh-k', text: `${Number.isInteger(p.days) ? p.days : 10}거래일 뒤 채점`}),
    line('되돌릴 조건', w.revert), line('사전 부검', w.premortem),
    ...(w.big ? (Array.isArray(w.risks) ? w.risks : []).slice(0, 2).map(r => line('위험', r, 'jh-risk')) : []),
    cf != null || pf != null ? h('p', {class: 'jh-line jh-k', text: `바뀐 쪽 검사 실패 ${cf ?? '?'} · 전체 미리 검사 실패 ${pf ?? '?'}`}) : null);
}

/** 진화한 것 한 줄([9] 6) — 날짜 · 무엇이 바뀌었나 · 전과 후 그림 · 10거래일 뒤 채점 · 되돌리기 */
function doneRow(a, C) {
  const sc = a.score, gone = !!(a.reverted || a.revertedAt);
  const days = Number.isInteger(a.predict?.days) ? a.predict.days : 10;
  const scoreTxt = !sc ? `${days}거래일 뒤 채점 전이에요` : sc.ok === true ? `${days}거래일 뒤 · 맞았어요` : sc.ok === false ? `${days}거래일 뒤 · 틀렸어요` : `${days}거래일 뒤 · 판단 못 했어요`;
  return h('article', {class: 'jh-done', 'data-id': a.id},
    h('p', {class: 'jh-dd'}, h('span', {text: `${mdOf(a.at)} 들어감`})),
    h('h3', {class: 'jh-name', lang: 'ko', text: typeof a.title === 'string' && a.title.trim() ? a.title.trim() : '?'}),
    ...pics(a, true),
    line('예측', a.predict?.text),
    h('p', {class: 'jh-line jh-score' + (sc?.ok === true ? ' ok' : sc?.ok === false ? ' no' : '')}, h('span', {text: scoreTxt}), typeof sc?.text === 'string' && sc.text.trim() ? h('span', {lang: 'ko', text: ' — ' + sc.text.trim()}) : null),
    gone ? h('p', {class: 'jh-line jh-k', text: `되돌렸어요 · ${mdOf(a.revertedAt ?? a.at)}`}) : stateBtn(a, 'revert', C));
}

/** 잣대 셋([10] 1 · 2 · 5) — 지난 14일 합계 · 30번 안이면 「모으는 중」 · 참고 숫자는 접음 */
function measures(T, J) {
  const sec = h('section', {class: 'jh-ms', 'aria-label': '잣대 셋'}, h('h2', {class: 'sec', text: '잣대 셋'}));
  sec.append(h('p', {class: 'note', text: `지난 ${DAYS}일 합계예요. ${MIN_SAMPLE}번이 안 되면 판단하지 않고 모아요. 하루 숫자는 소음이에요.`}));
  const t = T?.total, few = n => (n < MIN_SAMPLE ? h('span', {class: 'jh-few', text: ' · 모으는 중'}) : null);
  if (!t) sec.append(h('p', {class: 'jh-m jh-q', text: '? 합계를 받지 못했어요.'}));
  else {
    sec.append(h('p', {class: 'jh-m'}, h('b', {text: '① 멈춤'}), h('span', {text: ` 매매일지를 끝낸 수 ${t.stop}번 · 그중 「오늘은 쉬어 가자」 ${t.stop_rest}번`}), few(t.stop)));
    sec.append(h('p', {class: 'jh-m'}, h('b', {text: '② 약속'}), h('span', {text: ` 「그날 정한 대로 했어?」에 답한 수 ${t.promise}번 · 그중 「했어」 ${t.promise_yes}번`}), few(t.promise)));
  }
  const f = J?.facts, mis = Number.isInteger(f?.mismatch) ? f.mismatch : null;
  sec.append(h('p', {class: 'jh-m' + (mis ? ' jh-q' : '')}, h('b', {text: '③ 사실'}), h('span', {text: mis == null ? ' 화면 숫자가 자료와 다른 곳 ?' : ` 화면 숫자가 자료와 다른 곳 ${mis}곳` + (kstDay(f.at) ? ` · ${mdOf(f.at)} 기준` : '')})));
  const r = T?.refTotal;
  if (r) sec.append(h('details', {class: 'jh-ref'}, h('summary', {text: '참고 숫자 · 잣대가 아니에요'}), h('p', {class: 'jh-m', text: `사이트를 연 수 ${r.visit} · 보낸 수 ${r.share} · 가입을 마친 수 ${r.signup}`})));
  return sec;
}

export async function render() {
  if (!(await ownerOk())) return away(); // [9] 1 — 열쇠 기기가 아니면 아무것도 그리지 않음
  const [J, S, T] = await Promise.all([getData(), getJson('/api/jinhwa/status'), getJson('/api/tally/sum?days=' + DAYS, {headers: {'x-atlas-owner': ownerKey() ?? ''}})]);
  const items = Array.isArray(S?.items) ? S.items : [];
  const C = {st: new Map(items.map(x => [x.id, x])), stOk: Array.isArray(S?.items), plan: new Map(), painters: []};
  C.replan = () => { C.plan = slotPlan([...C.st.values()]); for (const p of C.painters) p(); };
  C.plan = slotPlan(items);
  const root = h('div', {class: 'jh', 'data-page': 'jinhwa'});
  const n = Number.isInteger(J?.n) ? J.n : null, W = J ? J.waiting.filter(w => typeof w?.id === 'string') : null;
  root.append(h('h1', {class: 'jh-h1', text: '진화 칸'}),
    h('p', {class: 'jh-ess', lang: 'ko', text: typeof J?.essence === 'string' && J.essence.trim() ? J.essence.trim() : '?'}),
    h('p', {class: 'jh-n', text: `진화 ${n ?? '?'}번째`}));
  // ② 기다리는 진화
  root.append(h('h2', {class: 'sec', text: `기다리는 진화 ${W ? W.length : '?'}`}));
  if (!J) root.append(h('p', {class: 'note jh-q', text: '? 진화 자료를 받지 못했어요. 잠시 뒤 다시 열어 주세요.'}));
  else if (!W.length) root.append(h('p', {class: 'note', text: '기다리는 진화가 없어요. 다음 진화 회차가 대안 셋을 올려요.'}));
  else {
    root.append(h('div', {class: 'jh-rail', role: 'group', 'aria-label': '기다리는 진화'}, ...W.map((w, i) => waitCard(w, i, W.length, C))));
    root.append(h('p', {class: 'note', text: '확인 전에는 아무것도 바뀌지 않아요. 들어가기 전까지는 다시 눌러 확인을 거둘 수 있어요.'}));
  }
  if (!C.stOk) root.append(h('p', {class: 'note jh-q', text: '? 확인 상태를 받지 못했어요. 잠시 뒤 다시 열어 주세요.'}));
  // ③ 진화한 것(새 것부터)
  const A = J ? J.applied.filter(a => typeof a?.id === 'string').sort((a, b) => String(b.at ?? '').localeCompare(String(a.at ?? ''))) : null;
  root.append(h('h2', {class: 'sec', text: `진화한 것 ${A ? A.length : '?'}`}));
  if (A && !A.length) root.append(h('p', {class: 'note', text: '아직 들어간 진화가 없어요.'}));
  if (A) for (const a of A) root.append(doneRow(a, C));
  // ④ 고친 고장
  const F = J && Array.isArray(J.fixed) ? J.fixed.filter(f => typeof f?.what === 'string' && f.what.trim()) : null;
  root.append(h('h2', {class: 'sec', text: `고친 고장 ${F ? F.length : '?'}`}));
  if (F && !F.length) root.append(h('p', {class: 'note', text: '고친 고장이 없어요.'}));
  if (F?.length) root.append(h('ul', {class: 'jh-fix'}, ...F.map(f => h('li', {}, h('span', {class: 'jh-k', text: mdOf(f.at) + ' '}), h('span', {lang: 'ko', text: f.what.trim()})))));
  // ⑤ 잣대 셋
  root.append(measures(T, J));
  return {title: '진화 칸', nodes: [root]};
}
