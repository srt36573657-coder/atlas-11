/* 조건 찾기(#/cond · #/cond/<①>-<②>-<③>) — 지금 아틀란스(site/atlas/atlas.js viewCond · cdPick · cdRun · cdTest)를 새 아틀란스로 옮김(2026-10-17 「첫화면 부터 마지막 페이지 까지 모두 바꿔」)
   처음 말씀: 사장님 2026-10-15(싱가포르) 23:53 「엘셀처럼 찾는 조건을 3가지 … 속은 정밀하나 사용은 정말 감편하게」 · 23:54 「가」 · 규칙 72
   셈 · 글은 옛 쪽 그대로(cond.json cd-v1 · 거르기 · 세기 · 몸값 큰 차례 · 값을 모르면 「?」로 따로) · 기억 열쇠 그대로(atlas:cond · atlas:cond-seen) ·
   「더 보기」 수는 옛 쪽처럼 이 열린 창 동안 이어지고, 조건을 바꾸면 20곳부터 · 주소는 옛 쪽처럼 고를 때 바꾸지 않음
   그림 = 깔때기(모든 회사 → ① → ② → ③ · 막대 길이 = 모든 회사 가운데 남은 몫 · 칸이 곧 고르는 단추) · 결과 줄마다 5일 작은 선 · 고르는 판은 이 쪽 안의 덮는 판(닫기 · Esc) */
const NX = globalThis.NX;
const {h, sv} = NX;
const NB = ' ';
const isDay = d => /^\d{4}-\d{2}-\d{2}/.test(String(d ?? ''));
const md = d => { const p = String(d).split('-'); return (+p[1]) + '월' + NB + (+p[2]) + '일'; }; // 옛 쪽 md 그대로(붙임 띄어쓰기)
const tx = s => String(s).replace(/ · /g, NB + '· ').replace(/([^\s])·(?=[^\s])/g, '$1⁠·').replace(/([」%])(?=[가-힣])/g, '$1⁠'); // 옛 쪽 tx 그대로
const loc = n => n.toLocaleString('ko-KR');
const CIRC = '①②③';

/* ── 셈(옛 쪽 그대로) ── */
const cdOk = X => !!(X && X.version === 'cd-v1' && isDay(X.asOf) && Array.isArray(X.ind) && X.co && Array.isArray(X.co.c) && X.co.c.length === X.n);
const CD_SLOTS = [
  {k: 'a', name: '업종', ops: [['big', '큰 회사가 오른 업종', '지난 1주 · 몸값 큰 회사일수록 크게 셈'], ['rise', '요즘 오르는 업종', '지난 1주 · 회사마다 한 표 — 첫 화면 목록'], ['up', '한 달 오른 업종', '20거래일 ▲ 오름 — 업종 탭과 같음'], ['dn', '한 달 내린 업종', '20거래일 ▼ 내림'], ['all', '업종 가리지 않음', '77개 업종 모두']]},
  {k: 'b', name: '회사', ops: [['lead', '대장주', '업종 안 몸값 1등'], ['top3', '업종 몸값 3등까지', '업종마다 큰 회사 셋'], ['f3', '3년 모두 돈 번 곳', '확정 결산 3해 순이익이 모두 0보다 큼'], ['pick', '고른 곳', '멍거 · 린치 조건'], ['all', '회사 가리지 않음', '모든 회사']]},
  {k: 'c', name: '빼기', ops: [['nos', '5일 10% 넘게 오른 곳 빼기', '급등 탭에 드는 자격과 같은 자'], ['spike', '확 뛴 곳 모두 빼기', '5일 10% · 하루 15% · 한 달 30% 넘게 오른 곳'], ['loss', '지난해 손해 본 곳 빼기', '마지막 해 순이익이 0 밑'], ['all', '빼지 않음', '아무것도 빼지 않아요']]},
];
const CD_DEF = {a: 'big', b: 'lead', c: 'nos'}, CD_KEY = 'atlas:cond', SEEN_KEY = 'atlas:cond-seen'; // 기본 = 큰 회사가 오른 업종 · 대장주 · 5일 10% 넘게 오른 곳 빼기(결정표 v2 #4)
const cdValid = st => st && CD_SLOTS.every(S => S.ops.some(o => o[0] === st[S.k]));
function cdLoad(arg) {
  const m = /^([a-z0-9]+)-([a-z0-9]+)-([a-z0-9]+)$/.exec(arg || ''); if (m) { const st = {a: m[1], b: m[2], c: m[3]}; if (cdValid(st)) return st; }
  const st = NX.store.get(CD_KEY, null); if (cdValid(st)) return st; // 이 기기에만(옛 쪽과 같은 열쇠)
  return {...CD_DEF};
}
const cdSave = st => NX.store.set(CD_KEY, st);
/** 조건 하나의 판정 — true 넘음 · false 빠짐 · null 모름(?) */
function cdTest(X, k, op, j) {
  const C = X.co, I = X.ind[C.i[j]];
  if (op === 'all') return true;
  if (k === 'a') return op === 'big' ? (I.rc == null ? null : I.rc === 1) : op === 'rise' ? I.rise === 1 : op === 'up' ? I.up === 1 : op === 'dn' ? I.dn === 1 : null;
  if (k === 'b') { if (op === 'pick') return C.p[j] === 1; if (op === 'f3') return C.f3[j] == null ? null : C.f3[j] === 1; const rk = C.rk[j]; if (rk == null) return null; return op === 'lead' ? rk === 1 : op === 'top3' ? rk <= 3 : null; }
  if (k === 'c') {
    if (op === 'nos') return C.x5[j] == null ? null : C.x5[j] === 0;
    if (op === 'spike') { const f = [C.x5[j], C.d15[j], C.m30[j]]; if (f.includes(1)) return false; return f.includes(null) ? null : true; }
    if (op === 'loss') return C.ls[j] == null ? null : C.ls[j] === 0;
  }
  return null;
}
/** 거르기 — 단계마다 남은 곳(? 는 따로 · 앞 단계에서 빠진 곳은 다시 안 셈) · 몸값 큰 차례(같으면 번호 차례) */
function cdRun(X, st) {
  let S = X.co.c.map((_, j) => j); const steps = [S.length], q = new Map();
  for (const sl of CD_SLOTS) {
    const op = st[sl.k], nxt = [];
    for (const j of S) { const v = cdTest(X, sl.k, op, j); if (v === true) nxt.push(j); else if (v == null) q.set(j, sl.k); }
    S = nxt; steps.push(S.length);
  }
  const C = X.co; S.sort((x, y) => (C.cap[y] ?? -1) - (C.cap[x] ?? -1) || (C.c[x] < C.c[y] ? -1 : 1));
  return {steps, res: S, q: [...q].map(([j, k]) => [j, k]).sort((x, y) => (C.c[x[0]] < C.c[y[0]] ? -1 : 1))};
}
const CD_QWHY = {a: '업종 값 모름', b: '몸값 · 성적표 모름', c: '종가가 비었거나 하루에 30% 넘게 바뀐 날(주식 수 바뀜일 수 있음)'};
const cdOp = (k, op) => CD_SLOTS.find(S => S.k === k).ops.find(o => o[0] === op);
const cdLine = (C, j) => { const v = C.l5?.[j]; return Array.isArray(v) && v.length > 1 && v.every(x => Number.isFinite(x)) ? v : null; };
const HOWTO = [
  '조건 하나는 회사 하나의 성질이에요. 셋을 모두 넘은 곳만 남아요. 칸 차례를 바꿔도 끝은 같아요.',
  '「큰 회사가 오른 업종」은 몸값이 큰 회사일수록 크게 쳐서 센 업종 지수가 지난 5거래일 0.05% 넘게 오른 업종이에요. 많이 오른 순으로 11개까지 셌어요.',
  '「요즘 오르는 업종」은 첫 화면과 같은 목록이에요. 회사마다 한 표로 센 업종 지수로 같은 셈을 했어요.',
  '「한 달 오른 업종」 · 「한 달 내린 업종」은 업종 탭의 ▲ · ▼ 와 같은 셈이에요.',
  '「대장주」는 업종 안에서 몸값이 가장 큰 회사예요. 몸값이 같으면 종목 번호가 작은 곳이에요. 다른 조건으로 빠져도 2등이 대장주가 되지 않아요.',
  '「5일 10% 넘게 오른 곳 빼기」는 마지막 종가가 5거래일 전 종가보다 10% 넘게 높은 곳을 빼요. 급등 탭에 드는 자격과 같은 자예요.',
  '「확 뛴 곳 모두 빼기」는 거기에 지난 20거래일 동안 하루 15% 넘게 오른 날이 있거나 20거래일 30% 넘게 오른 곳도 빼요.',
  '「3년 모두 돈 번 곳」 · 「지난해 손해 본 곳」은 확정 결산(예상치 아님)만 써요.',
  '몸값은 자료를 모은 날 받은 값이라 종가 날과 하루쯤 다를 수 있어요.',
  '값을 모르는 곳은 넘음으로도 빠짐으로도 치지 않고 「?」로 따로 보여요.',
  '고른 조건은 이 기계에만 남아요.',
];
const HON = '사고팔 곳을 고른 목록이 아니에요.', PAST = '지난 값일 뿐 앞날을 말하지 않아요.';
const SAFE = '보드리는 지난 기록만 보여 줘요. 사고팔기를 권하지 않아요.'; // 새 화면 안전 문장(첫 화면 · 나 칸과 같은 글)

/* ── 아래 자료 줄(옛 쪽 foot 의 자료 · 장 중 「?」 줄) ── */
const NP = C => C?.funnel?.picked ?? '?';
const pickName = C => `${C?.rules?.name ?? '고른'} ${NP(C)}곳`;
const lyDay = C => (C?.rules?.lyDay ? md(C.rules.lyDay) : '모음 날');
const pickHow = C => `멍거 갈래는 3년 성적표만, 린치 갈래는 3년 성적표와 ${lyDay(C)} 값으로 골랐습니다`;
function foot(C, src = null) {
  const out = [];
  if (C) out.push(h('p', {class: 'pcond-src', text: src ? `자료: ${C.sources?.price ?? '?'} · ${src}.` : `자료: ${C.sources?.price ?? '?'} · 기준일 = 마지막 종가 날(${md(C.asOf)})의 ${C.days}거래일 전(${md(C.base)}) · ${pickName(C)} — ${pickHow(C)}(그 뒤 주가는 안 씀).`}));
  if (C?.provisional) out.push(h('p', {class: 'pcond-provc', text: `? ${md(C.asOf)} 값은 그날 저녁 8시 전에 받아 아직 바뀔 수 있습니다(시간외 · 넥스트레이드) — 다음 받기에서 고쳐집니다.`}));
  out.push(h('p', {class: 'safe pcond-safe', text: SAFE}));
  return h('footer', {class: 'pcond-foot'}, ...out);
}
/** 회사 고리 — 모든 회사에 회사 파일이 있으면(core.co7) 새 보는 화면 · 옛 자료면 고른 곳만 · 나머지는 지금 아틀란스 밖 칸 */
const coHref = (C, c, pk) => (C?.co7 || pk ? '#/w/' + encodeURIComponent(c) : (globalThis.NX?.ready?.('x') ? '#/x/' : '/atlas/#/x/') + encodeURIComponent(c));

/* ── 그림 조각 ── */
/** 깔때기 막대 — 길이 = 모든 회사 가운데 남은 몫(0곳이면 빈 막대 · 1곳이라도 남으면 보이게 4px) */
function bar(n, all) {
  const w = !n || !all ? '0px' : `max(4px, ${Math.min(100, n / all * 100).toFixed(2)}%)`;
  return h('span', {class: 'pcond-bar', 'aria-hidden': 'true'}, h('i', {css: {width: w}}));
}
/** 5일 작은 선(5거래일 전 종가 = 시작 · 점선) — 색은 옆 숫자(5일 %)와 같은 뜻(빨강 오름 · 파랑 내림 · 회색 그대로) */
function spark(l, c) {
  const W = 72, H = 26, s = sv('svg', {class: 'pcond-sp ' + c, viewBox: `0 0 ${W} ${H}`, preserveAspectRatio: 'none', 'aria-hidden': 'true', focusable: 'false'});
  if (!l) return s;
  const lo = Math.min(...l), hi = Math.max(...l), n = l.length, y = v => (hi > lo ? 3 + (hi - v) * (H - 6) / (hi - lo) : H / 2);
  s.append(sv('line', {class: 'b0', x1: 0, x2: W, y1: y(l[0]).toFixed(1), y2: y(l[0]).toFixed(1)}),
    sv('path', {class: 'ln', d: 'M' + l.map((v, i) => (i * W / (n - 1)).toFixed(1) + ' ' + y(v).toFixed(1)).join(' L')}));
  return s;
}

let more = 20; // 옛 쪽 cdMore — 이 열린 창 동안 이어짐 · 조건을 바꾸면 20곳부터

export async function render(arg) {
  const [core, mkt, cond] = await Promise.all([NX.need('core'), NX.need('mkt'), NX.need('cond')]);
  const root = h('div', {class: 'pcond'});
  root.append(h('h1', {class: 'wt pcond-h', text: '조건 찾기'}));
  const out = {title: '조건 찾기', nodes: [root]};
  if (!core || !mkt || !cdOk(cond)) { root.append(h('p', {class: 'empty pcond-err', text: '? 조건 자료를 못 받았어요. 잠시 뒤 다시 열어 주세요.'}), h('p', {class: 'pcond-hon', text: HON}), foot(core)); return out; }
  const X = cond, C = X.co, st = cdLoad(arg), names = mkt.companies || {};
  if (X.asOf !== core.asOf) { root.append(h('p', {class: 'empty pcond-err', text: tx(`? 조건 자료(${md(X.asOf)})가 다른 자료(${md(core.asOf)})와 날이 달라요. 다음 업데이트에 맞춰져요.`)}), h('p', {class: 'pcond-hon', text: HON}), foot(core)); return out; } // 옛 날 값을 지금 것처럼 보이지 않음
  root.append(h('p', {class: 'ws pcond-time', text: tx(`${md(X.asOf)} ${X.provisional ? '장 중 값' : '장 마감 값'}이에요.`)}));
  if (X.provisional) root.append(h('p', {class: 'note pcond-prov', text: '저녁 8시까지 바뀌어요.'}));
  const box = h('div', {class: 'pcond-box'}); root.append(box);
  const nameOf = j => names[C.c[j]]?.n ?? C.c[j];
  const row = j => {
    const c = C.c[j], pk = C.p[j] === 1, r5 = C.r5[j], k = r5 == null ? 'q' : NX.cls(r5);
    return h('a', {class: 'pcond-row', href: coHref(core, c, pk), 'data-c': c},
      h('span', {class: 'pcond-nm' + (pk ? ' gold' : ''), text: nameOf(j)}),
      h('span', {class: 'pcond-v'}, h('span', {class: 'pcond-5', text: '5일간 '}), r5 == null ? h('b', {class: 'num q', text: '?'}) : h('b', {class: 'num ' + k, text: NX.pct(r5)})),
      h('span', {class: 'pcond-sub'}, tx(X.ind[C.i[j]].n + (C.rk[j] ? ` · 몸값 ${C.rk[j]}등` : '')), pk ? h('span', {class: 'pcond-pk', text: ' · 고른 곳'}) : null),
      spark(cdLine(C, j), k));
  };
  /** 업데이트 뒤 — 같은 조건 · 다른 날이면 지난번과 견줌(보는 기계에만 · 옛 쪽과 같은 열쇠 · 그리기마다 견주고 새로 적음) */
  const seen = R => {
    let note = null;
    try {
      const sig = CD_SLOTS.map(S => st[S.k]).join('-'), prev = JSON.parse(localStorage.getItem(SEEN_KEY) || 'null'), now = R.res.map(j => C.c[j]);
      if (prev && prev.sig === sig && prev.asOf !== X.asOf && Array.isArray(prev.codes)) { const ps = new Set(prev.codes), ns = new Set(now); note = tx(`${md(prev.asOf)}보다 새로 ${now.filter(c => !ps.has(c)).length}곳 · 빠진 ${prev.codes.filter(c => !ns.has(c)).length}곳`); }
      localStorage.setItem(SEEN_KEY, JSON.stringify({sig, asOf: X.asOf, codes: now}));
    } catch { /* 기억 못 함 */ }
    return note;
  };
  const changed = k => { cdSave(st); more = 20; draw(); if (k) box.querySelector(`button.pcond-slot[data-k="${k}"]`)?.focus({preventScroll: true}); };
  const draw = () => {
    box.textContent = '';
    const R = cdRun(X, st), isDef = CD_SLOTS.every(S => st[S.k] === CD_DEF[S.k]), all = R.steps[0];
    root.dataset.st = CD_SLOTS.map(S => st[S.k]).join('-');
    // ① 깔때기 = 고르는 칸 셋(누르면 고르는 판) — 맨 위 줄은 모든 회사
    const fun = h('div', {class: 'pcond-fun', role: 'group', 'aria-label': '조건 셋'},
      h('div', {class: 'pcond-all'}, h('span', {class: 'pcond-at', text: '모든 회사'}), h('b', {class: 'pcond-c num', text: loc(all) + '곳'}), bar(all, all)));
    CD_SLOTS.forEach((S, k) => { const o = cdOp(S.k, st[S.k]), left = R.steps[k + 1];
      const b = h('button', {type: 'button', class: 'pcond-slot' + (left === 0 && R.steps[k] > 0 ? ' zero' : ''), 'data-k': S.k, 'aria-haspopup': 'dialog', 'aria-label': `${CIRC[k]} ${S.name}: ${o[1]} — 남은 곳 ${left}곳 · 바꾸기`},
        h('span', {class: 'pcond-n', 'aria-hidden': 'true', text: CIRC[k]}), h('b', {class: 'pcond-o', text: o[1]}), h('span', {class: 'pcond-c num', text: loc(left) + '곳'}), h('i', {class: 'pcond-chev', 'aria-hidden': 'true', text: '›'}), bar(left, all));
      b.addEventListener('click', () => pick(S.k));
      fun.append(b); });
    box.append(fun);
    if (!isDef) box.append(h('button', {type: 'button', class: 'pcond-btn pcond-reset', text: '처음대로', onclick: () => { Object.assign(st, CD_DEF); changed(null); }}));
    // ② 남은 곳(숫자 하나만 크게) · 깔때기 수 · 차례
    const n = R.res.length, up = R.res.filter(j => C.r5[j] != null && C.r5[j] > 0).length, dn = R.res.filter(j => C.r5[j] != null && C.r5[j] < 0).length;
    box.append(h('p', {class: 'pcond-big', role: 'status', 'aria-live': 'polite'}, h('span', {text: '남은 곳 '}), h('b', {class: 'num', text: loc(n)}), h('span', {text: '곳'}),
      n ? h('span', {class: 'pcond-ud'}, h('span', {class: 'up num', text: ` ▲${up}`}), h('span', {class: 'dn num', text: ` ▼${dn}`})) : null));
    box.append(h('p', {class: 'pcond-flow num', 'aria-hidden': 'true', text: R.steps.map(loc).join(' → ')}));
    box.append(h('p', {class: 'pcond-how', text: isDef ? '예로 걸어 둔 조건 · 몸값 큰 차례' : '몸값 큰 차례'}));
    if (!n) {
      box.append(h('p', {class: 'pcond-none', text: '셋을 모두 넘은 곳이 없어요.'}));
      const alt = h('div', {class: 'pcond-alt'}); box.append(alt);
      for (const S of CD_SLOTS) { if (st[S.k] === 'all') continue; const m = cdRun(X, {...st, [S.k]: 'all'}).res.length;
        alt.append(h('button', {type: 'button', class: 'pcond-btn', text: `${CIRC[CD_SLOTS.indexOf(S)]} 풀면 ${loc(m)}곳`, onclick: () => { st[S.k] = 'all'; changed(null); }})); }
    }
    // ③ 결과 줄(몸값 큰 차례 · 20곳씩) — 이름 | 5일 % · 업종 · 몸값 n등 · 금빛 = 고른 곳
    const list = h('div', {class: 'pcond-rows'}); box.append(list);
    for (const j of R.res.slice(0, more)) list.append(row(j));
    const mb = h('button', {type: 'button', class: 'pcond-more'});
    const moreText = () => { mb.textContent = `${Math.min(20, n - more)}곳 더 보기 · 남은 ${loc(n - more)}곳`; };
    mb.addEventListener('click', () => {
      const from = more; more += 20;
      const add = R.res.slice(from, more).map(row); list.append(...add);
      if (n > more) moreText(); else { mb.remove(); add[0]?.focus({preventScroll: true}); } // 단추가 사라지면 새로 든 첫 줄로
      const d = seen(R), el = box.querySelector('.pcond-diff'); if (el && !d) el.remove(); // 옛 쪽은 「더 보기」도 새로 그려 견줌 — 같은 날이면 견줌 줄이 사라짐
    });
    if (n > more) { moreText(); box.append(mb); }
    // ④ 값을 몰라 넣지 않은 곳(?) — 넘음 · 빠짐으로 치지 않음
    if (R.q.length) box.append(h('details', {class: 'pcond-q'}, h('summary', {text: `? 값을 몰라 넣지 않은 곳 ${loc(R.q.length)}곳`}),
      h('div', {class: 'pcond-in'}, ...R.q.map(([j, k]) => h('a', {class: 'pcond-qr', href: coHref(core, C.c[j], C.p[j] === 1)}, h('b', {text: nameOf(j)}), h('span', {text: tx(` — ${CIRC[CD_SLOTS.findIndex(S => S.k === k)]} ${CD_QWHY[k]}`)}))))));
    const d = seen(R); if (d) box.prepend(h('p', {class: 'note pcond-diff', text: d}));
  };
  /** 고르는 판 — 칸 하나의 고르기(줄마다 이걸 고르면 남는 곳) · 누르면 바로 걸리고 닫힘 · 닫기 · Esc */
  const pick = k => {
    root.querySelector('.pcond-sheet')?.remove();
    const S = CD_SLOTS.find(x => x.k === k), body = h('div', {class: 'pcond-ops'});
    const back = () => box.querySelector(`button.pcond-slot[data-k="${k}"]`)?.focus({preventScroll: true});
    let sheet = null;
    const onKey = e => { if (!sheet?.isConnected) { document.removeEventListener('keydown', onKey); return; } if (e.key === 'Escape') { e.preventDefault(); shut(); back(); } };
    const shut = () => { document.removeEventListener('keydown', onKey); sheet?.remove(); };
    for (const [op, t, ds] of S.ops) {
      const m = cdRun(X, {...st, [k]: op}).res.length;
      body.append(h('button', {type: 'button', class: 'pcond-op', 'data-op': op, 'aria-current': st[k] === op ? 'true' : null, onclick: () => { st[k] = op; shut(); changed(k); }},
        h('span', {class: 'pcond-ot'}, h('b', {text: t}), h('span', {class: 'pcond-od', text: ds})), h('span', {class: 'pcond-oc num', text: `→ ${loc(m)}곳`})));
    }
    sheet = h('div', {class: 'pcond-sheet', role: 'dialog', 'aria-modal': 'true', 'aria-labelledby': 'pcondTitle', tabindex: '-1'},
      h('div', {class: 'pcond-sin'}, h('div', {class: 'pcond-stop'}, h('h2', {id: 'pcondTitle', text: `${CIRC[CD_SLOTS.indexOf(S)]} ${S.name} 고르기`}),
        h('button', {type: 'button', class: 'pcond-close', text: '닫기', onclick: () => { shut(); back(); }})), body));
    root.append(sheet);
    document.addEventListener('keydown', onKey);
    setTimeout(() => (body.querySelector('[aria-current]') ?? body.querySelector('button'))?.focus(), 30);
  };
  draw();
  root.append(h('details', {class: 'pcond-howto'}, h('summary', {text: '어떻게 셌나요?'}), h('div', {class: 'pcond-in'}, ...HOWTO.map(t => h('p', {text: t})))));
  root.append(h('p', {class: 'pcond-hon', text: HON}), h('p', {class: 'pcond-past', text: PAST}));
  root.append(foot(core, `조건 찾기는 ${md(X.asOf)} 종가 · 몸값 · 확정 결산으로 셌어요`));
  return out;
}
