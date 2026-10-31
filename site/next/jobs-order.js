/* 잡스 차례(사장님 2026-10-27 11:08 「잡스라면 돌이를 직관적이면서도 중요한것을 전면에 … 각각 1개당 180번을 직관 중요순으로 배치해서 36개를 … 목업형태로 먼저」 · 11:39 「어 고쳐 빨리」)
   쪽마다 칸 차례 = docs/design/jobs36-2026-10-27/pick.json(쪽마다 백팔십 번까지 놓아 점수로 고른 판 · 목업 j36) — 칸 이름(첫 class) 차례로 옮김
   o = 위에서 아래 차례 · f = 「더 보기」에 접는 덜 중요한 글 · t = 맨 아래로 내리는 작은 줄(날짜 · 안내 · 카톡 줄)
   칸 열쇠 = 「첫 class:보이는 같은 이름 칸 가운데 몇째」(같은 이름 설명 글이 여럿이어도 목업 차례 그대로)
   그리기 바로 뒤 · 카톡 단추를 달기 전에 한 번(jobsOrder) — 늦게 붙는 줄(다음 한 줄 · 쿠폰 칸) 뒤로 작은 줄만 한 번 더(jobsTail)
   칸마다 카톡 단추(kk-box)는 옮기지 않음 — 2026-10-25 06:06 「모든 쪽과 칸에 카톡」대로 그 칸 밑에 그대로 */
export const SPEC = { // 진화 쪽은 뺌 — 본질 줄(jh-ess)은 첫 화면에 늘 있어야 함(진화 쪽 검사 · 전체 검사 1/11)
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
  'me': {o: ["h:0", "hd:0", "hd-fold:0", "sec:0", "lst:0", "sec:1", "note:0", "note:1", "th-foot:0"], f: [], t: ["kk-box:0", "safe:0", "kk-pgrow:0"]}, // 보유종목 — 돌이 편지(hd-fold)는 점검 칸 바로 밑 그대로(펼치기 검사 · 2026-10-27 전체 검사 1/11)
  'sub': {o: ["h:0", "note:0", "sec:1", "c-lead:0", "more:0", "chan:0", "chan:1", "chan:2", "sec:0", "note:1", "th-foot:0"], f: [], t: ["hm-more:0", "kk-pgrow:0"]}, // 관심 — 머리 글(「이 기기에만 남아요」 · 가입하면 「카카오로 지켜요」)은 제목 밑 그대로 · 접지 않음
  't/alert': {o: ["th-pg:0", "th-hd:0", "th-say:0", "th-als:0", "th-wl:0", "th-next:0"], f: ["th-box:0"], t: ["th-asof:0", "th-safe:0"]}, // 알림
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
const VIS = new WeakMap(); // 한 번 잰 칸은 다시 재지 않음 — 대범한 판이 두 번째 배치를 부르지 않게(누른 뒤 0.2초 안 그리기)
const vis = el => { if (VIS.has(el)) return VIS.get(el); const q = el.getBoundingClientRect(); let v = q.height >= 2; if (v) { const st = getComputedStyle(el); v = st.position !== 'fixed' && st.display !== 'none'; } VIS.set(el, v); return v; }; // 보이는 칸만 셈(목업 칸 목록과 같은 셈)
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
  if (fold.length) { det = document.createElement('details'); det.className = 'th-fold jb-more'; VIS.set(det, true); const sm = document.createElement('summary'); sm.textContent = '더 보기 '; det.append(sm, ...fold); out.push(det); } // 「더 보기 」 끝 빈칸 하나 — 접은 글 「회사 …」와 붙어 「보기회사」 같은 엉뚱한 낱말이 생기지 않게(kk-all.js 와 같음)
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
  const isSmall = el => small.has(tok(el)) || el.classList.contains('jb-more') || el.classList.contains('rmt'); // 「더 보기」도 늦게 붙는 「다음」 한 줄 뒤로 · 방 지킴이 이름표(roman-tag.js · 2026-10-31)도 작은 줄 — 이름표 때문에 다른 칸이 옮겨지지 않음
  const kids = [...r.children], last = kids.findLastIndex(el => !isSmall(el));
  const move = kids.filter((el, i) => i < last && isSmall(el));
  if (!move.length) return false;
  r.append(...move);
  return true;
}

/* 대범한 잡스 판(사장님 2026-10-27 14:33 「조금 조금 소심하게 만하지 말고 대범하게 하라고」 · 14:49 「고쳐라 대담하게」)
   쪽마다 주인공 하나 크게(글 칸은 1.2~1.8배 · 그림 · 긴 목록은 그대로 크기) · 그림 하나 · 누를 단추 하나 · 나머지는 「자세히 보기」
   차례 표 = docs/design/jobs36-2026-10-27/bold.json(쪽마다 백팔십 판 · 목업 j36b) — 칸 열쇠는 위 잡스 차례(jobsOrder)를 한 뒤의 칸 차례로 셈
   첫 화면은 뺌(00:17 네 단추 한 화면 · 01:50 기승전결 차례) · 진화 본질 줄 · 안내 줄 · 관심 머리 글 · 보유종목 편지는 접지 않음 */
export const BOLD = { // 매매일지(왜 사? · 한 달 뒤) · 보유종목 · 관심 · 짧은 영상 · 오늘 장(옛 칸 차례 맞춤) · 상품권(약속 밑 「지금 할 일」) · 회사 지나온 길(영어 320 「다음 단」 줄 넘침)은 뺌 — 편지 펼치기 · 머리 글 · 소식 길 · 영상 넘기기가 그 자리에 있어야 함(14:5x 이 기계 검사)
  't/picks': {"pre": ["th-pg:0", "th-hd:0"], "hero": "th-pkis:0", "z": 1, "card": 2, "hide": 2, "stick": null, "vis": null, "act": "th-next:0", "sec": ["th-pkrec1:0"], "bottom": ["th-safe:0"]}, // 꽃 될 회사
  't/pick': {"pre": ["th-pg:0", "th-hd:0"], "hero": "th-ch:0", "z": 1.3, "card": 2, "hide": 2, "stick": null, "vis": null, "act": "th-next:0", "sec": ["th-ch:2", "th-ch:3", "th-ch:4"], "bottom": ["th-safe:0"]}, // 지난 기록
  'dori': {"pre": ["h:0"], "hero": "dm:0", "z": 1, "card": 2, "hide": 2, "stick": null, "vis": null, "act": null, "sec": [], "bottom": ["safe:0"]}, // 돌이
  't/sprout': {"pre": ["th-pg:0", "th-hd:0"], "hero": "th-ans:0", "z": 1.6, "card": 2, "hide": 2, "stick": null, "vis": "th-grp:0", "act": "th-next:0", "sec": [], "bottom": ["th-safe:0"]}, // 싹 자리
  't/bloom': {"pre": ["th-pg:0", "th-hd:0"], "hero": "th-ans:0", "z": 1.8, "card": 1, "hide": 2, "stick": null, "vis": null, "act": "th-next:0", "sec": ["th-rows:0"], "bottom": ["th-safe:0"]}, // 꽃 자리
  't/wilt': {"pre": ["th-pg:0", "th-hd:0"], "hero": "th-ans:0", "z": 1.7, "card": 1, "hide": 2, "stick": null, "vis": null, "act": "th-next:0", "sec": ["th-rows:0"], "bottom": ["th-safe:0"]}, // 시듦 자리
  't/cal': {"pre": ["th-pg:0", "th-hd:0"], "hero": null, "z": 1.8, "card": 1, "hide": 2, "stick": null, "vis": null, "act": "th-next:0", "sec": ["th-days:0"], "bottom": ["th-safe:0"]}, // 싹 달력
  't/i/*': {"pre": ["th-pg:0", "th-hd:0", "th-say:0"], "hero": "th-ans:0", "z": 1.8, "card": 2, "hide": 1, "stick": null, "vis": "th-dots:0", "act": "th-ck:0", "sec": [], "bottom": ["th-safe:0"]}, // 업종 한 곳
  't/i/*/path': {"pre": ["th-pg:0", "th-hd:0"], "hero": "th-map:0", "z": 1, "card": 2, "hide": 2, "stick": null, "vis": null, "act": "th-next:0", "sec": ["th-list:0"], "bottom": ["th-safe:0"]}, // 지나온 길
  't/i/*/spread': {"pre": ["th-pg:0", "th-hd:0", "th-say:0"], "hero": "th-ans:0", "z": 1.8, "card": 2, "hide": 1, "stick": null, "vis": "th-bars:0", "act": "th-next:0", "sec": ["th-box:0"], "bottom": ["th-safe:0"]}, // 번지는 중일까
  't/i/*/big': {"pre": ["th-pg:0", "th-hd:0", "th-say:0"], "hero": "th-ans:0", "z": 1.8, "card": 2, "hide": 1, "stick": null, "vis": null, "act": "th-next:0", "sec": ["th-list:0"], "bottom": ["th-safe:0"]}, // 큰 회사도 움직였을까
  't/i/*/co': {"pre": ["th-pg:0", "th-hd:0"], "hero": "th-list:0", "z": 1, "card": 1, "hide": 2, "stick": null, "vis": null, "act": "th-next:0", "sec": [], "bottom": ["th-safe:0"]}, // 함께 움직인 회사
  't/i/*/near': {"pre": ["th-pg:0", "th-hd:0", "th-say:0"], "hero": "th-ans:0", "z": 1.7, "card": 2, "hide": 1, "stick": null, "vis": null, "act": "th-next:0", "sec": ["th-rows:0"], "bottom": ["th-safe:0"]}, // 이웃 업종
  't/c/*': {"pre": ["th-pg:0", "th-hd:0"], "hero": "th-ans:0", "z": 1.7, "card": 1, "hide": 2, "stick": null, "vis": "th-line:0", "act": "th-next:0", "sec": ["chaps:0"], "bottom": ["th-safe:0"]}, // 회사 한 곳
  't/c/*/lead': {"pre": ["th-pg:0", "th-hd:0", "th-say:0"], "hero": "th-ans:0", "z": 1.8, "card": 2, "hide": 1, "stick": null, "vis": "th-line:0", "act": "th-next:0", "sec": ["th-two:0"], "bottom": ["th-safe:0"]}, // 먼저일까 뒤따름일까
  't/c/*/why': {"pre": ["th-pg:0", "th-hd:0"], "hero": null, "z": 1.6, "card": 1, "hide": 2, "stick": null, "vis": null, "act": "th-next:0", "sec": ["wc:0"], "bottom": ["th-safe:0"]}, // 왜 그럴까?
  't/c/*/rank': {"pre": ["th-pg:0", "th-hd:0"], "hero": "th-ans:0", "z": 1.7, "card": 2, "hide": 2, "stick": null, "vis": null, "act": "th-next:0", "sec": ["th-list:0"], "bottom": ["th-safe:0"]}, // 업종 안 자리
  't/c/*/unknown': {"pre": ["th-pg:0", "th-hd:0"], "hero": "th-box:0", "z": 1.8, "card": 2, "hide": 2, "stick": null, "vis": null, "act": "th-next:0", "sec": ["th-box:1"], "bottom": ["th-safe:0"]}, // 아직 모르는 것
  't/c/*/keep': {"pre": ["th-pg:0", "th-hd:0", "th-say:0"], "hero": "th-ans:0", "z": 1.6, "card": 2, "hide": 1, "stick": null, "vis": null, "act": "th-keep:0", "sec": [], "bottom": ["th-safe:0"]}, // 관심 담기
  'find': {"pre": [], "hero": "find:0", "z": 1.6, "card": 1, "hide": 1, "stick": null, "vis": null, "act": null, "sec": ["hits:0"], "bottom": []}, // 회사 찾기
  't/alert': {"pre": ["th-pg:0", "th-hd:0"], "hero": "th-wl:0", "z": 1.7, "card": 2, "hide": 2, "stick": null, "vis": null, "act": "th-next:0", "sec": ["th-als:0"], "bottom": ["th-safe:0"]}, // 알림
  'game': {"pre": ["gm-h1:0"], "hero": "gm-box:0", "z": 1, "card": 2, "hide": 1, "stick": null, "vis": null, "act": null, "sec": [], "bottom": ["safe:0"]}, // 가짜 돈 연습
  'jinhwa': {"pre": ["jh-h1:0", "jh-ess:0", "jh-head:0"], "hero": "jh-rail:0", "z": 1, "card": 2, "hide": 1, "stick": null, "vis": null, "act": "jh-what:0", "sec": [], "bottom": []}, // 진화
  't/today': {"pre": ["th-pg:0", "th-hd:0"], "hero": "th-rec:0", "z": 1.7, "card": 2, "hide": 2, "stick": null, "vis": null, "act": "th-next:0", "sec": ["th-steps:0"], "bottom": ["th-safe:0"]}, // 오늘 정리
  't/hello': {"pre": ["th-pg:0", "th-hd:0"], "hero": "th-steps:0", "z": 1.5, "card": 2, "hide": 2, "stick": null, "vis": null, "act": "th-found:0", "sec": [], "bottom": ["th-safe:0"]}, // 돌이 인사
  't/how': {"pre": ["th-pg:0", "th-hd:0"], "hero": "th-map:0", "z": 1, "card": 2, "hide": 2, "stick": null, "vis": null, "act": "th-next:0", "sec": [], "bottom": ["th-safe:0"]}, // 시계 읽는 법
  'help': {"pre": ["hp-h1:0", "hp-voice:0"], "hero": "hp-note-card:0", "z": 1.5, "card": 2, "hide": 2, "stick": null, "vis": null, "act": "hp-doors:0", "sec": [], "bottom": []}, // 고객센터
};
const LATE_TOK = new Set(['th-foot', 'kk-box', 'kk-pgrow', 'cp-card']);
const KEEP = ['.th-watch', '.th-sw', '.sub-btn', '.wy-next', '.wy-rec', '.wy-opt', 'button.more', 'a.why-go', 'a.jh-row', '.player', '.hp-go', '.hd-fold-b', '.hd-go', '.acts', '.th-keep', '.chaps', 'a.cp'];
/** 그리기 바로 뒤(jobsOrder 다음) — 주인공 · 그림 · 단추 · 남길 칸 · 「자세히 보기」 · 맨 아래 줄 */
export function jobsBold(k, a, view) {
  const s = BOLD[routeKey(k, a)]; if (!s || !view) return false;
  const r = rootOf(view);
  if (r.querySelector(':scope > .empty')) return false; // 빈 쪽(앞선 회사 줄에 없는 회사 등) — 「왜 비었는지」 한 줄이 주인공이라 접지 않음(16:55 진짜 사이트 사진에서 찾음)
  const kids = [...r.children], cnt = new Map(), id = new Map(), used = new Set();
  for (const el of kids) { if (!vis(el)) continue; const t = tok(el), n = cnt.get(t) ?? 0; cnt.set(t, n + 1); id.set(t + ':' + n, el); }
  const get = x => { if (!x) return null; const el = id.get(x) ?? null; if (el) { used.add(el); id.delete(x); } return el; };
  const pre = s.pre.map(get).filter(Boolean), hero = get(s.hero), stick = get(s.stick), pic = get(s.vis);
  const lateAct = s.act && LATE_TOK.has(s.act.split(':')[0]), act = lateAct ? null : get(s.act);
  const sec = s.sec.map(get).filter(Boolean), bottom = s.bottom.map(get).filter(Boolean);
  if (!hero && !pic && !act && !lateAct && !sec.length) return false;
  if (hero) {
    hero.classList.add('jb-hero');
    if (s.z && s.z !== 1 && hero.tagName === 'H2') { hero.style.setProperty('--jbz', String(s.z)); hero.style.setProperty('--jbzs', String(Math.min(s.z, 1.3))); } // 글 한 줄 칸만 키움 — 안쪽 여백이 있는 칸을 키우면 글 시작 왼쪽 줄이 늘어남([10] 7)
    if (s.card === 1) hero.classList.add('jb-card1'); else if (s.card === 2) hero.classList.add('jb-card2');
  }
  if (act) act.classList.add('jb-act');
  const slot = lateAct ? Object.assign(document.createElement('i'), {className: 'jb-slot'}) : null;
  if (slot) { slot.hidden = true; slot.dataset.tok = s.act.split(':')[0]; }
  const rest = [], quiet = [];
  for (const el of kids) {
    if (used.has(el)) continue;
    if (!vis(el)) { quiet.push(el); continue; } // 안 보이는 칸(늦게 차는 칸)은 접지 않고 본문 끝에 그대로
    if (KEEP.some(q => el.matches(q) || el.querySelector(q))) { quiet.push(el); continue; } // 누르는 곳(관심 담기 · 알림 켜기 · 지우기 · 다음 물음 …)은 접지 않음
    if (el.classList.contains('jb-more')) rest.push(...[...el.children].filter(c => c.tagName !== 'SUMMARY')); else rest.push(el); // 앞 판 「더 보기」는 풀어서 한 번에
  }
  let det = null;
  if (rest.length) { det = document.createElement('details'); det.className = 'th-fold jb-more jb-bold'; const sm = document.createElement('summary'); sm.textContent = '자세히 '; det.append(sm, ...rest); } // 끝 빈칸 — 접은 글과 붙어 엉뚱한 낱말이 생기지 않게
  r.replaceChildren(...pre, ...[hero, stick, pic, act ?? slot].filter(Boolean), ...sec, ...quiet, ...(det ? [det] : []), ...bottom);
  if (s.hide >= 1) view.classList.add('jb-hide-no');
  return true;
}
/** 늦게 붙는 칸 — 「다음」 한 줄(th-foot)이 단추 자리면 그 자리로 · 맨 아래 줄(안내 · 카톡 쪽 줄)은 늦게 붙은 칸 뒤로 */
export function jobsBoldLate(k, a, view) {
  const s = BOLD[routeKey(k, a)]; if (!s || !view || !view.isConnected) return false;
  const r = rootOf(view); if (r.querySelector(':scope > .empty')) return false; // 빈 쪽은 그대로(jobsBold 와 같음)
  const slot = r.querySelector(':scope > i.jb-slot');
  if (slot) { const el = [...r.children].find(c => tok(c) === slot.dataset.tok); if (el) { el.classList.add('jb-act'); slot.replaceWith(el); } }
  const small = new Set([...s.bottom.map(x => x.split(':')[0]), 'kk-pgrow']), isSm = el => small.has(tok(el)) || el.classList.contains('rmt'); // 방 지킴이 이름표(roman-tag.js · 2026-10-31)도 맨 아래 작은 줄
  const kids = [...r.children], last = kids.findLastIndex(el => !isSm(el) && !el.classList.contains('jb-slot'));
  const move = kids.filter((el, i) => i < last && isSm(el));
  if (move.length) r.append(...move);
  return true;
}
