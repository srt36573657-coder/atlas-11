/* 잡스 차례(사장님 2026-10-27 11:08 「잡스라면 돌이를 직관적이면서도 중요한것을 전면에 … 각각 1개당 180번을 직관 중요순으로 배치해서 36개를 … 목업형태로 먼저」 · 11:39 「어 고쳐 빨리」)
   쪽마다 칸 차례 = docs/design/jobs36-2026-10-27/pick.json(쪽마다 백팔십 번까지 놓아 점수로 고른 판 · 목업 j36) — 칸 이름(첫 class) 차례로 옮김
   o = 위에서 아래 차례 · f = 「더 보기」에 접는 덜 중요한 글 · t = 맨 아래로 내리는 작은 줄(날짜 · 안내 · 카톡 줄)
   칸 열쇠 = 「첫 class:보이는 같은 이름 칸 가운데 몇째」(같은 이름 설명 글이 여럿이어도 목업 차례 그대로)
   그리기 바로 뒤 · 카톡 단추를 달기 전에 한 번(jobsOrder) — 늦게 붙는 줄(다음 한 줄 · 쿠폰 칸) 뒤로 작은 줄만 한 번 더(jobsTail)
   칸마다 카톡 단추(kk-box)는 옮기지 않음 — 2026-10-25 06:06 「모든 쪽과 칸에 카톡」대로 그 칸 밑에 그대로 */
export const SPEC = {
  '': {o: ["th-zones:0", "s-apps:0", "th-pkhome:0", "th-more:0", "s-story:0", "th-map:0", "th-gorow:0", "th-next:0", "th-hi:0"], f: [], t: ["th-hfold:0"]}, // 첫 화면
  't/picks': {o: ["th-pg:0", "th-hd:0", "th-pkrec1:0", "th-pkis:0", "th-next:0"], f: ["th-pkday:0"], t: ["th-safe:0"]}, // 꽃 될 회사
  't/pick': {o: ["th-pg:0", "th-hd:0", "th-ch:0", "th-ch:1", "th-ch:2", "th-ch:3", "th-ch:4", "th-chnav:0", "th-sub:0", "th-sub:1", "th-next:0"], f: [], t: ["th-asof:0", "th-safe:0"]}, // 지난 기록
  'why': {o: ["h:0", "wy:0", "wy-me:0", "cp-card:0", "th-foot:0"], f: [], t: ["safe:0", "kk-pgrow:0"]}, // 왜 사?
  'why/later': {o: ["h:0", "wy-me:0", "th-foot:0"], f: ["empty:0"], t: ["safe:0", "kk-pgrow:0"]}, // 한 달 뒤
  't/sprout': {o: ["th-pg:0", "th-hd:0", "th-say:0", "th-ans:0", "th-grp:0", "th-grp:1", "th-sub:0", "th-sub:1", "th-next:0"], f: [], t: ["th-asof:0", "th-safe:0"]}, // 싹 자리
  't/bloom': {o: ["th-pg:0", "th-hd:0", "th-say:0", "th-ans:0", "th-rows:0", "th-cap2:0", "th-next:0"], f: ["th-sub:0"], t: ["th-asof:0", "th-safe:0", "kk-box:0"]}, // 꽃 자리
  't/wilt': {o: ["th-pg:0", "th-hd:0", "th-say:0", "th-ans:0", "th-rows:0", "th-sub:1", "th-next:0"], f: ["th-sub:0", "th-cap2:0"], t: ["th-asof:0", "th-safe:0", "kk-box:0"]}, // 시듦 자리
  't/cal': {o: ["th-pg:0", "th-hd:0", "th-days:0", "th-next:0"], f: ["th-sub:0", "th-sub:1"], t: ["th-asof:0", "th-safe:0"]}, // 싹 달력
  't/i/*': {o: ["th-pg:0", "th-hd:0", "th-say:0", "th-ans:0", "th-dots:0", "th-ck:0", "th-ck:1", "th-ck:2", "th-ck:3", "th-cap2:0", "chaps:0", "th-keep:0", "th-hi:0", "th-next:0"], f: ["th-sub:0"], t: ["th-asof:0", "th-safe:0", "kk-box:0"]}, // 업종 한 곳
  't/i/*/path': {o: ["th-pg:0", "th-hd:0", "th-say:0", "th-map:0", "th-list:0", "th-next:0"], f: [], t: ["th-asof:0", "th-safe:0"]}, // 지나온 길
  't/i/*/spread': {o: ["th-pg:0", "th-hd:0", "th-say:0", "th-ans:0", "th-bars:0", "th-sub:0", "th-cap2:0", "th-box:0", "th-next:0"], f: [], t: ["th-asof:0", "th-safe:0", "kk-box:0"]}, // 번지는 중일까
  't/i/*/big': {o: ["th-pg:0", "th-hd:0", "th-say:0", "th-ans:0", "th-sub:0", "th-list:0", "th-box:0", "th-next:0"], f: [], t: ["th-asof:0", "th-safe:0", "kk-box:0"]}, // 큰 회사도 움직였을까
  't/i/*/co': {o: ["th-pg:0", "th-hd:0", "th-say:0", "th-list:0", "th-next:0"], f: ["th-cap2:0"], t: ["th-asof:0", "th-safe:0"]}, // 함께 움직인 회사
  't/i/*/near': {o: ["th-pg:0", "th-hd:0", "th-say:0", "th-ans:0", "th-rows:0", "th-next:0"], f: ["th-sub:0", "th-cap2:0"], t: ["th-asof:0", "th-safe:0", "kk-box:0"]}, // 이웃 업종
  't/c/*': {o: ["th-pg:0", "th-hd:0", "th-say:0", "th-ans:0", "th-line:0", "th-h2:0", "th-cap2:2", "chaps:0", "th-cap2:0", "th-cap2:1", "th-sub:0", "th-next:0"], f: [], t: ["kk-box:0", "th-asof:0", "th-safe:0", "kk-box:1"]}, // 회사 한 곳
  't/c/*/lead': {o: ["th-pg:0", "th-hd:0", "th-say:0", "th-line:0", "th-two:0", "th-ans:0", "th-sub:0", "th-next:0"], f: [], t: ["th-asof:0", "th-safe:0", "kk-box:0"]}, // 먼저일까 뒤따름일까
  't/c/*/why': {o: ["th-pg:0", "th-hd:0", "th-say:0", "wc:0", "th-next:0"], f: [], t: ["th-asof:0", "th-safe:0"]}, // 왜 그럴까?
  't/c/*/rank': {o: ["th-pg:0", "th-hd:0", "th-say:0", "th-ans:0", "th-list:0", "th-next:0"], f: [], t: ["th-asof:0", "th-safe:0", "kk-box:0"]}, // 업종 안 자리
  't/c/*/unknown': {o: ["th-pg:0", "th-hd:0", "th-say:0", "th-box:0", "th-box:1", "th-box:2", "th-next:0"], f: [], t: ["th-asof:0", "th-safe:0"]}, // 아직 모르는 것
  't/c/*/keep': {o: ["th-pg:0", "th-hd:0", "th-say:0", "th-ans:0", "th-keep:0", "th-keep:1", "th-why:0", "th-next:0"], f: [], t: ["th-asof:0", "th-safe:0", "kk-box:0"]}, // 관심 담기
  'w/*/past': {o: ["wt:0", "ws:0", "ppast-now:0", "more:0", "ppast-won:0", "ppast-seg:0", "ppast-chart:0", "ppast-key:0", "sec:0", "ppast-fin:0", "ppast-lv:0", "ppast-won:1", "chaps:0", "ppast-trio:0", "ppast-nx:0"], f: [], t: ["ppast-more:0", "ppast-src:0", "ppast-foot:0", "kk-box:0"]}, // 회사 지나온 길
  'me': {o: ["h:0", "hd:0", "sec:0", "lst:0", "sec:1", "note:0", "note:1", "th-foot:0"], f: [], t: ["hd-fold:0", "kk-box:0", "safe:0", "kk-pgrow:0"]}, // 보유종목
  'sub': {o: ["h:0", "sec:1", "c-lead:0", "more:0", "chan:0", "chan:1", "chan:2", "sec:0", "note:1", "th-foot:0"], f: ["note:0"], t: ["hm-more:0", "kk-pgrow:0"]}, // 관심
  't/alert': {o: ["th-pg:0", "th-hd:0", "th-say:0", "th-als:0", "th-wl:0", "th-next:0"], f: ["th-box:0"], t: ["th-asof:0", "th-safe:0"]}, // 알림
  'jinhwa': {o: ["jh-h1:0", "jh-head:0", "jh-what:0", "jh-rail:0", "sec:0", "note:0"], f: ["jh-ess:0"], t: ["jh-g:0"]}, // 진화
  't/today': {o: ["th-pg:0", "th-hd:0", "th-say:0", "th-steps:0", "th-rec:0", "th-next:0"], f: [], t: ["th-asof:0", "th-safe:0"]}, // 오늘 정리
  't/hello': {o: ["th-pg:0", "th-hd:0", "th-say:0", "th-found:0", "th-h2:0", "th-steps:0", "th-next:0"], f: [], t: ["th-asof:0", "th-safe:0", "kk-box:0"]}, // 돌이 인사
  't/how': {o: ["th-pg:0", "th-hd:0", "th-say:0", "th-map:0", "th-steps:0", "th-h2:0", "th-steps:1", "th-h2:1", "th-sub:1", "th-sub:2", "th-rbs:0", "th-next:0"], f: ["th-sub:0"], t: ["kk-box:0", "th-fold:0", "th-safe:0", "kk-box:1"]}, // 시계 읽는 법
};
const ROOTS = ['div.tc', 'section.th-home', 'div.ppast', 'div.ptoday', 'div.jh', 'div.gm', 'div.gf', 'div.hp', 'div.shorts'];
const tok = el => { const c = (el.getAttribute('class') ?? '').trim(); return c ? c.split(/\s+/)[0] : el.tagName.toLowerCase(); }; // 그림(svg)도 class 로
/** 주소 → 표 열쇠(업종 · 회사 이름 자리는 *) */
export function routeKey(k, a) {
  const s = (a ?? '').split('/');
  if (k === 't' && (s[0] === 'i' || s[0] === 'c') && s.length >= 2) return 't/' + s[0] + '/*' + (s[2] ? '/' + s[2] : '');
  if (k === 'w' && s[0]) return 'w/*' + (s[1] ? '/' + s[1] : '');
  return a ? k + '/' + a : k;
}
const vis = el => { const q = el.getBoundingClientRect(); if (q.height < 2) return false; const st = getComputedStyle(el); return st.position !== 'fixed' && st.display !== 'none'; }; // 보이는 칸만 셈(목업 칸 목록과 같은 셈)
const rootOf = view => { for (const sel of ROOTS) { const x = view.querySelector(sel); if (x && x.children.length >= 3) return x; } return view; };
/** 그리기 바로 뒤 — 표 차례로 칸을 옮김 · 표에 없는 칸은 원래 앞 칸 바로 뒤 · 돌려줌 = 옮겼는지 */
export function jobsOrder(k, a, view) {
  const s = SPEC[routeKey(k, a)]; if (!s || !view) return false;
  const r = rootOf(view), kids = [...r.children], cnt = new Map(), id = new Map();
  for (const el of kids) { if (!vis(el)) continue; const t = tok(el), n = cnt.get(t) ?? 0; cnt.set(t, n + 1); id.set(t + ':' + n, el); }
  const take = x => { if (x.startsWith('kk-box:')) return null; const el = id.get(x) ?? null; id.delete(x); return el; };
  const main = s.o.map(take).filter(Boolean), fold = s.f.map(take).filter(Boolean), tail = s.t.map(take).filter(Boolean);
  if (main.length < 2) return false;
  const out = [...main]; let det = null;
  if (fold.length) { det = document.createElement('details'); det.className = 'th-fold jb-more'; const sm = document.createElement('summary'); sm.textContent = '더 보기 '; det.append(sm, ...fold); out.push(det); } // 「더 보기 」 끝 빈칸 하나 — 접은 글 「회사 …」와 붙어 「보기회사」 같은 엉뚱한 낱말이 생기지 않게(kk-all.js 와 같음)
  out.push(...tail);
  const placed = new Set(out), inFold = new Set(fold);
  const at = x => { const p = out.indexOf(x); return p >= 0 ? p : inFold.has(x) ? out.indexOf(det) : -1; };
  kids.forEach((el, i) => {
    if (placed.has(el) || inFold.has(el)) return;
    let j = i - 1; while (j >= 0 && !placed.has(kids[j]) && !inFold.has(kids[j])) j--;
    out.splice(j < 0 ? 0 : at(kids[j]) + 1, 0, el); placed.add(el);
  });
  r.replaceChildren(...out);
  return true;
}
/** 늦게 붙는 줄(다음 한 줄 · 쿠폰 칸 · 카톡 쪽 줄) 뒤로 — 작은 줄(t)이 다른 칸 앞에 있으면 맨 아래로 */
export function jobsTail(k, a, view) {
  const s = SPEC[routeKey(k, a)]; if (!s || !view || !view.isConnected) return false;
  const r = rootOf(view), small = new Set(s.t.map(x => x.split(':')[0]).filter(t => t !== 'kk-box'));
  const isSmall = el => small.has(tok(el)) || el.classList.contains('jb-more'); // 「더 보기」도 늦게 붙는 「다음」 한 줄 뒤로
  const kids = [...r.children], last = kids.findLastIndex(el => !isSmall(el));
  const move = kids.filter((el, i) => i < last && isSmall(el));
  if (!move.length) return false;
  r.append(...move);
  return true;
}
