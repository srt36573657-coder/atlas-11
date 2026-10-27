/* 밖 칸(#/x/<번호>) — 지금 아틀란스(site/atlas/atlas.js showInfo(code) 판 · funnel · stopSay)를 새 화면의 보통 쪽으로 옮김(2026-10-17 04:23 「에이전트 총 동원해」 · 규칙 74)
   회사 주식이 아닌 것(펀드 · ETF · ETN · 우선주 · 스팩 · 리츠 — 규칙 60 「이거 다 올려」)의 이름 · 까닭 · 깔때기(어디서 멈췄나)
   회사 주식 번호면(모든 회사 7단 · 규칙 63) 보는 화면 #/w/<번호> 로 · 번호가 없으면 도움말 #/info 로(옛 쪽 showInfo('') 와 같음)
   글 · 숫자는 옛 쪽 그대로(scripts/atlas11/next/check_misc.mjs 가 맞대 봄) · 모양만 새 아틀란스(제목 → 까닭 → 그림(깔때기) → 글) */
const NX = globalThis.NX;
const {h} = NX;
const md = d => { const p = String(d).split('-'); return (+p[1]) + '월 ' + (+p[2]) + '일'; }; // 옛 쪽 md 그대로(붙임 띄어쓰기)
/** 조사 — 옛 쪽 josa 그대로(한글이 아니면 둘 다 「은(는)」) */
function josa(w, a, b) { const ch = String(w).trim().slice(-1), k = ch.charCodeAt(0) - 0xAC00; if (k < 0 || k > 11171) return w + a + '(' + b + ')'; return w + (k % 28 ? a : b); }
const pctEl = (x, tag = 'b') => h(tag, {class: 'num ' + NX.cls(x), text: NX.pct(x)});
const NP = C => C?.funnel?.picked ?? '?';
const pickName = C => `${C?.rules?.name ?? '고른'} ${NP(C)}곳`;
const lyDay = C => (C?.rules?.lyDay ? md(C.rules.lyDay) : '모음 날');
const pickHow = C => `멍거 갈래는 3년 성적표만, 린치 갈래는 3년 성적표와 ${lyDay(C)} 값으로 골랐습니다`;
/** 갈래마다 멈춘 자리(옛 쪽 stopSay 그대로) */
const stopSay = (C, r) => (C.funnel?.groups ?? []).map(g => `${g.name}은 「${g.stopName?.[g.k === 'mg' ? r.sm : r.sl] ?? '고르기'}」에서`).join(', ') + ' 멈췄습니다';
/** 깔때기 두 갈래 — 멈춘 줄(stop) · 지난 줄(past) · 닿지 못한 줄(no)(옛 쪽 funnel(r) 그대로) */
function funnel(C, r) {
  const F = C.funnel ?? {}, wrap = h('div', {class: 'px-funnels'});
  for (const g of F.groups ?? []) {
    const stop = r ? (g.k === 'mg' ? r.sm : r.sl) : null, at = stop ? (g.stop?.[stop] ?? g.steps.length) : g.steps.length;
    const ol = h('ol', {class: 'px-funnel'});
    (g.steps ?? []).forEach((s, ix) => { const fill = h('i', {class: 'fill'}); fill.style.setProperty('width', (s.n / F.universe * 100) + '%');
      ol.append(h('li', {class: stop ? (ix < at ? 'past' : ix === at ? 'stop' : 'no') : null, 'aria-current': stop && ix === at ? 'step' : null}, fill, h('span', {}, h('b', {class: 'num', text: s.n.toLocaleString('ko-KR') + '곳'}), h('span', {text: s.t})))); });
    wrap.append(h('p', {class: 'px-fname'}, h('b', {text: `${g.name} ${g.n}곳`})), ol);
  }
  return wrap;
}
const tail = () => [h('a', {class: 'more px-find', href: '#/find', text: '회사 찾기 ›'}), h('p', {class: 'safe', text: '둘이는 지난 기록만 보여 줘요. 사고팔기를 권하지 않아요.'})];

export async function render(arg) {
  const code = String(arg ?? '');
  if (!code) { location.replace('#/info'); return {title: '…', nodes: []}; } // 번호 없는 밖 칸 = 도움말(옛 쪽 showInfo('') 와 같음)
  const [C, mkt, names] = await Promise.all([NX.need('core'), NX.need('mkt'), NX.getJson('names.json')]);
  if (!C) return {title: '밖 칸', nodes: NX.noData()};
  const M = mkt?.companies;
  if (C.co7 && M?.[code]) { location.replace('#/w/' + NX.enc(code)); return {title: '…', nodes: []}; } // 회사 주식 — 모든 회사 7단(규칙 63) · 옛 밖 칸 주소는 보는 화면으로
  const root = h('div', {class: 'px', 'data-page': 'x', 'data-arg': code});
  if (!Array.isArray(names?.rows)) { root.append(h('h1', {class: 'wt', text: `${pickName(C)} 밖`}), ...NX.noData('이름표'), ...tail()); return {title: `${pickName(C)} 밖`, nodes: [root]}; }
  const r = names.rows.find(x => x.c === code), title = r ? `${r.n} — ${pickName(C)} 밖` : `${pickName(C)} 밖`;
  root.append(h('h1', {class: 'wt', text: title}));
  if (!r) { root.append(h('p', {class: 'q px-p', text: '? 이 이름표를 못 찾았습니다.'}), ...tail()); return {title, nodes: [root]}; }
  root.append(h('p', {class: 'px-p', text: `${josa(r.n, '은', '는')} ${stopSay(C, r)}(${r.m === 'KOSPI' ? '코스피' : '코스닥'}).`}), h('div', {class: 'px-why', text: r.w}));
  const mk = M?.[code], mi = mk ? (C.industries ?? []).find(i => i.name === mk.i) : null; // 모든 회사 자료(2026-10-14 「나」) — 회사 주식만 있음
  if (mk && mi) root.append(h('p', {class: 'px-p'}, '업종 ', h('a', {class: 'px-inl', href: '#/ch/i/' + NX.enc(mi.name), text: mi.name}), ` · ${C.days}거래일 `, pctEl(mk.c, 'span')));
  root.append(funnel(C, r));
  root.append(h('p', {class: 'note px-note', text: `${pickHow(C)} — 새 1년 성적표가 나오면 다시 셉니다.`}), ...tail());
  return {title, nodes: [root]};
}
