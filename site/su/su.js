/* 수르 — 첫 장부터 끝 장까지 새 판(빈 파일에서 새로 씀)
   주문 1616 — 사장님 2026-11-04 11:16(+04) [목적] 「1. 수르(aaa7377.com)를 전면 개편해라 2. 첫 장부터 끝 장까지 전부 새로 짜라 3. 잡스가 직접 만든다는 기준으로 정해라」
   (원문 · 시안 열하나 · 장점표 docs/design/su-full-2026-11-04/ · 앞 기준 주문 1238 · 1506 · 1519 · 2049)
   [화면 짜임] 쪽마다 맨 위 큰 값 하나 → 움직이는 큰 그림(화면 대부분 · 네 박자 기승전결) → 중간 값 → 자세한 값(여섯 칸) → 맨 아래 출처와 조사 날짜
   [흐름] 큰 「다음」 단추 일곱 번(시안 열하나 가운데 아홉이 고른 길) —
          기 1 오늘 #/ → 승 2 회사 #/c/<번호> → 승 3 업종 #/i/<업종> → 전 4 기록 #/r → 전 5 달마다 #/r/m → 전 6 못 된 까닭 #/r/w → 결 7 「왜 사?」 #/q/<번호> → 결 8 내 매매일지 #/j(끝)
          탭은 유튜브 앱처럼 아래 넷 · 기승전결 차례(기 오늘 · 승 회사 · 전 기록 · 결 멈춤) · 다음 단추와 진행 막대는 탭 위에 늘 떠 있음(시안 6)
   [안쪽 엔진] 값마다 여섯 칸(su-six.js) — 빈 칸은 「확인 필요」 · [기록] 꽃 지난 기록(모두 · 달 · 날 · 해 · 가까운 회사 · 못 된 까닭) + 내 매매일지 = 기록 탭 한곳(시안 8)
   숫자를 고르는 셈(su-data.js)은 검사받은 그대로 씀 — 화면 · 엔진 · 그림은 새로 씀 · 보안 규칙: innerHTML 없음 · 글 속 style 없음
   옛 길(#/b · #/k/<번호> · #/r/<번호> · #/p/<번호>)은 새 쪽으로 이어 줌(보낸 고리가 끊기지 않게) */
import {NAME, josa} from '/next/brand.js';
import {glossTree} from '/next/glossary.js';
import {CODE, pct, moreLess, dateKo, bloomList, moneyList, reasonsFor, whyOf, idxLine, coLine, indRows, forwardTo} from '/su/su-data.js';
import {NEED, brand, holes, kn, num, ymd, ym, eHome, eCo, eCond, eInd, eHub, eMonths, eDays, eYears, eNear, ePause} from '/su/su-six.js';
import {essenceData, essenceLines, kstText} from '/next/essence.js';
import {h, s, matrix, bars, cols, waffle, line, cal, split, sixTiles, thumb, funnel, honest3, dots6} from '/su/su-fig.js';
import {vQuiz, vJournal, readWhy, fullWhy, seoulDay} from '/su/su-why.js';

brand(NAME);
const cache = new Map();
export const get = url => { if (!cache.has(url)) cache.set(url, fetch(url).then(r => (r.ok ? r.json() : null)).catch(() => null)); return cache.get(url); };
export const D = {B: '/next/data/theme-bloom.json', TH: '/next/data/theme.json', W: '/next/data/flow-why.json', S: '/next/data/home-summary.json', H: '/atlas/data/home.json', M: '/atlas/data/mkt.json', co: c => '/atlas/data/co/' + c + '.json'};
export async function base() {
  const [B, TH, W, S] = await Promise.all([get(D.B), get(D.TH), get(D.W), get(D.S)]);
  return {B, TH, W, S, bl: bloomList(B), mo: moneyList(TH, W), asOf: B?.asOf ?? TH?.asOf ?? null};
}
export const SAFE = '지난 기록만 보여 줘요. 앞날을 맞히지 않고 사고팔기를 권하지 않아요.';
const PHASE = ['기', '승', '전', '결'];
/** 일곱 번 누름 길 — 화면 여덟 [이름, 기승전결] */
export const STEPS = [null, ['오늘', 0], ['회사', 1], ['업종', 1], ['기록', 2], ['달마다', 2], ['못 된 까닭', 2], ['「왜 사?」', 3], ['내 매매일지', 3]];
let lastCo = null;
export const cur = () => lastCo;
export const setCur = c => { lastCo = c; };
export const coHref = c => '#/c/' + c, indHref = n => '#/i/' + encodeURIComponent(n);
const firstCode = (bl, mo) => bl.rows[0]?.code ?? mo[0]?.code ?? null;
const TABS = () => [['오늘', '#/', 'M4 11l8-7 8 7v9h-5v-6h-6v6H4z'], ['회사', lastCo?.code ? coHref(lastCo.code) : FIRST ? coHref(FIRST) : '#/', 'M4 20V9l8-5 8 5v11M9 20v-6h6v6'],
  ['기록', '#/r', 'M4 20V11M10 20V5M16 20v-8M21 20H3'], ['멈춤', lastCo?.code ? '#/q/' + lastCo.code : '#/q', 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM10 9v6M14 9v6']];
let FIRST = null;

/* ── 틀 ── */
function tools() {
  const big = h('button', {class: 'su-tool', type: 'button', 'aria-label': '글씨 크게', 'aria-pressed': String(document.documentElement.classList.contains('su-lg')), text: '글씨 크게'});
  big.addEventListener('click', () => { const on = document.documentElement.classList.toggle('su-lg'); big.setAttribute('aria-pressed', String(on)); try { localStorage.setItem('su-big-text', on ? '1' : '0'); } catch { /* 저장 못 해도 됨 */ } });
  return h('div', {class: 'su-tools'}, big);
}
/** 읽어 주기(시안 10 — 엄지 자리 · 다음 단추 옆) */
function sayBtn() {
  const say = h('button', {class: 'su-say', type: 'button', 'aria-label': '읽어 주기'}, s('svg', {class: 'su-ti', viewBox: '0 0 24 24', 'aria-hidden': 'true'}, s('path', {d: 'M4 9v6h4l5 4V5L8 9zM16 9a4 4 0 0 1 0 6M18.5 6.5a8 8 0 0 1 0 11'})), h('span', {text: '듣기'}));
  say.addEventListener('click', () => {
    try {
      const sy = window.speechSynthesis; if (!sy) return;
      if (sy.speaking) { sy.cancel(); return; }
      const t = [...document.querySelectorAll('#su h1, #su .su-big, #su .su-cap p')].map(e => e.innerText.replace(/\s+/g, ' ')).join('. ');
      const u = new SpeechSynthesisUtterance(t); u.lang = 'ko-KR'; u.rate = 0.9; sy.speak(u);
    } catch { /* 읽어 주기가 없는 기기 */ }
  });
  return say;
}
const valText = (v, B = 'b', U = 'span') => (v.v == null ? h(B, {class: 'su-needv', text: NEED}) : [h(B, {text: v.v}), v.unit ? h(U, {text: v.unit}) : null,
  v.v2 != null ? [h('em', {text: '대'}), h(B, {text: v.v2}), v.unit ? h(U, {text: v.unit}) : null] : null]);
/** 큰 값 — 기준 값 v2 는 같은 크기 · 값이 없으면 「확인 필요」 */
const bigVal = v => { const n = holes(v.six).length; return h('div', {class: 'su-big'}, h('p', {class: 'su-bv'}, valText(v)), h('p', {class: 'su-bl', text: v.label}),
  h('p', {class: 'su-bsix'}, dots6(v.six), h('span', {text: '여섯 칸 '}), h('b', {class: n ? 'su-needt' : 'su-fullt', text: n ? NEED + ' ' + n + '칸' : '다 채움'}))); }; // 시안 7 — 큰 값 옆 여섯 꽃잎
/** 값의 여섯 칸 — 닫혀 있어도 점 여섯(채움 = 있음 · 빈 테 = 확인 필요)과 빈 칸 수가 보임 · 누르면 여섯 칸 판(시안 1 · 11) */
export function sixBox(v) {
  const n = holes(v.six).length;
  return h('details', {class: 'su-sixd'}, h('summary', {class: 'su-sixs'}, dots6(v.six), h('span', {text: '여섯 칸'}), h('b', {class: n ? 'su-needt' : 'su-fullt', text: n ? NEED + ' ' + n + '칸' : '다 채움'})),
    sixTiles(v.six, {title: null, small: true, label: v.label + ' — 여섯 칸'}));
}
export const midCard = v => h('div', {class: 'su-mid'}, h('p', {class: 'su-ml', text: v.label}), h('p', {class: 'su-mv'}, valText(v)), sixBox(v));
function valRow(v) {
  const head = h('div', {class: 'su-vh'}, h('span', {class: 'su-vl', text: v.label}), h('span', {class: 'su-vv'}, valText(v, 'b', 'small')));
  return h('li', {class: 'su-vr' + (v.up === false && !v.open ? ' su-worse' : '') + (v.open ? ' su-openm' : '')}, v.href ? h('a', {class: 'su-vlink', href: v.href}, head) : head, sixBox(v));
}
export function source(asOf, S, note = null) {
  const got = S?.fetchedAt ? kstText(S.fetchedAt) : null;
  return h('footer', {class: 'su-src'},
    h('p', {}, h('b', {text: '출처 '}), '네이버 증권 시세 · ' + josa(NAME, '가') + ' 센 지난 기록'),
    h('p', {}, h('b', {text: '조사 날짜 '}), '자료 ' + (ymd(asOf) ?? NEED) + (got ? ' · 받은 때 ' + got : '')),
    note ? h('p', {text: note}) : null);
}
/** 다음 단추 + 진행 막대(여덟 칸) — 탭 위에 늘 떠 있음 */
function dock(nx, step) {
  if (!nx) return null;
  return h('nav', {class: 'su-dock', 'aria-label': '다음 화면'},
    step ? h('ol', {class: 'su-prog', 'aria-label': '여덟 화면 가운데 ' + step + '번째'}, STEPS.slice(1).map((x, i) => h('li', {class: i + 1 < step ? 'su-pd' : i + 1 === step ? 'su-pc' : ''}))) : null,
    h('div', {class: 'su-dk'}, sayBtn(), h('a', {class: 'su-next', href: nx.href}, h('span', {class: 'su-nk', text: nx.k ?? (nx.step ? nx.step + ' / 8' : '다음')}), h('b', {text: nx.label}), h('i', {'aria-hidden': 'true', text: '›'}))));
}
function tabs(active) {
  return h('nav', {class: 'su-tabs', 'aria-label': '탭 — 기 오늘 · 승 회사 · 전 기록 · 결 멈춤'}, TABS().map(([t, href, d], i) => h('a', {class: 'su-tab' + (i === active ? ' su-on' : ''), href, 'aria-current': i === active ? 'page' : null, 'aria-label': PHASE[i] + ' · ' + t},
    s('svg', {class: 'su-ti', viewBox: '0 0 24 24', 'aria-hidden': 'true'}, s('path', {d})), h('span', {text: t}))));
}
/** 쪽 하나 — 위에서 아래로: 안전 문장 · 이름 · 큰 값 · 큰 그림(+ 네 박자 글) · 중간 값 · 큰 값의 여섯 칸 · 정직한 세 칸 · 더 많은 그림 · 자세한 값 · 출처 */
export function page(m) {
  document.title = (m.title ? m.title + ' · ' : '') + NAME;
  const st = m.step ? STEPS[m.step] : null;
  const head = h('header', {class: 'su-top'}, h('a', {class: 'su-brand', href: '#/', text: NAME}),
    st ? h('span', {class: 'su-step'}, h('i', {text: PHASE[st[1]]}), h('span', {text: m.step + ' / 8 · ' + st[0]})) : null, tools());
  const h1 = h('h1', {class: 'su-h1', text: m.h1 ?? m.title});
  if (m.proper) h1.setAttribute('data-proper', '');
  const main = h('main', {class: 'su-page'},
    h('p', {class: 'su-safe', text: SAFE}),
    h('section', {class: 'su-head', 'aria-label': '큰 값'}, m.kick ? h('p', {class: 'su-kick', text: m.kick}) : null, h1, m.big ? bigVal(m.big) : null),
    m.hero ?? null,
    m.mids?.length ? h('section', {class: 'su-mids n' + m.mids.length, 'aria-label': '중간 값'}, m.mids.map(midCard)) : null,
    m.big ? sixTiles(m.big.six, {label: '큰 값의 여섯 칸'}) : null,
    m.honest ?? null,
    ...(m.figs ?? []),
    ...(m.body ?? []),
    m.rows?.length ? h('section', {class: 'su-rows', 'aria-label': m.rowsTitle ?? '자세한 값'}, h('h2', {class: 'su-ft', text: m.rowsTitle ?? '자세한 값'}), h('ol', {class: 'su-vlist'}, m.rows.map(valRow))) : null,
    ...(m.after ?? []),
    source(m.asOf, m.S, m.note ?? null));
  return [head, main, dock(m.next, m.step), tabs(m.tab ?? 0)];
}
export function notFound(t) { return {title: '찾지 못했어요', h1: '찾지 못했어요', tab: 0, body: [h('p', {class: 'su-lead', text: '? ' + t}), h('a', {class: 'su-ask', href: '#/'}, h('b', {text: '처음으로'}))]}; }
const condsOf = bl => bl.say.map(t => ({t, short: t.replace(/(이에요|예요|어요)$/, '')}));
/** 정직한 세 칸(시안 9) — 아무 회사 · 못했던 달 · 못 된 횟수 · 같은 크기 · 누르면 그 기록 */
const honestOf = B => honest3({base: B?.honest?.base, rate: B?.honest?.rate, down: B?.honest?.down, scored: B?.honest?.scored, miss: B?.why?.all?.miss, n: B?.honest?.n});

/** 본질 세 줄 — essence.js 그대로(자료로 셈한 세 줄 · 회사 수 · 받은 때 = home-summary · 본질 문이 이 칸을 봄) */
function essBox(S) {
  const lines = essenceLines(essenceData({summary: S}));
  return h('section', {class: 'su-ess', 'aria-label': NAME + ' 본질'}, h('h2', {class: 'su-ft', text: josa(NAME, '는') + ' 이런 곳이에요'}), h('ol', {}, lines.map((t, i) => h('li', {'data-ess': String(i + 1), text: t}))));
}

/* ── 1 오늘(기) — 2,557곳을 거르는 깔때기 · 오늘 볼 회사(유튜브 카드) ── */
async function vHome() {
  const {B, S, bl, mo, asOf} = await base();
  const e = eHome({S, B, bl, mo, asOf}), pick = bl.mode === 'pick', near = bl.mode === 'near';
  const all = [...bl.rows.map(r => ({...r, sec: 'bl'})), ...mo.filter(m => !bl.rows.some(r => r.code === m.code)).map(r => ({...r, sec: 'mo'}))];
  const fill = []; // 카드의 작은 한 달 줄은 첫 그림 뒤에 채움(첫 화면을 늦추지 않게)
  const card = r => {
    const th = h('span', {class: 'su-thw'}, thumb(null, null, r.name + ' 한 달 줄')), sub = h('span', {class: 'su-csub', text: (r.ind ? r.ind + ' · ' : '') + '한 달 …'});
    fill.push([th, sub, r]);
    return h('a', {class: 'su-row su-card', href: coHref(r.code)}, th,
      h('span', {class: 'su-cbody'}, h('b', {class: 'su-cname', 'data-proper': '', text: r.name}), sub,
        h('span', {class: 'su-chip su-chip-' + r.sec, text: r.sec === 'bl' ? (pick ? '꽃 조건 모두' : '가까운 곳') : '돈이 몰린 곳'})));
  };
  const later = async () => {
    const H = await get(D.H);
    await Promise.all(fill.map(async ([th, sub, r]) => {
      const co = await get(D.co(r.code)), cl = coLine(co), il = idxLine(H, co?.c?.market, H?.base, H?.asOf), last = cl ? cl[cl.length - 1] - 100 : null;
      th.replaceChildren(thumb(cl, il ? il.line : null, r.name + ' 한 달 줄'));
      sub.textContent = (r.ind ? r.ind + ' · ' : '') + '한 달 ' + (last != null ? pct(last) : NEED);
    }));
  };
  const blI = all.filter(r => r.sec === 'bl'), moI = all.filter(r => r.sec === 'mo');
  const sec = (label, title, list, note) => (list.length ? h('section', {class: 'su-list', 'aria-label': label}, h('h2', {class: 'su-ft', text: title}), note ? h('p', {class: 'su-note', text: note}) : null, list.map(card)) : null);
  FIRST = firstCode(bl, mo);
  const first = all[0] ?? null;
  return {title: '오늘', tab: 0, step: 1, kick: (dateKo(asOf) === '?' ? '' : dateKo(asOf) + ' · ') + '코스피 · 코스닥', h1: '오늘 꽃 조건', big: e.big,
    hero: funnel({total: S?.coN, conds: bl.say, near: near ? bl.rows.map(r => r.name) : [], pick: pick ? bl.rows.map(r => r.name) : [], miss: bl.miss, cap: e.say}),
    mids: e.mids, honest: honestOf(B),
    body: [sec('꽃이 될 회사', pick ? '꽃 조건에 모두 맞은 회사' : near ? '조건에 가장 가까운 회사' : '꽃이 될 회사', blI, near ? '조건에 다 맞지는 않아요. ' + josa(NAME, '가') + ' 고른 회사가 아니에요.' : null),
      sec('돈이 몰린 회사', '돈이 몰린 회사', moI, '업종이 한 달 동안 시장보다 더 오른 곳의 대장이에요.')],
    rows: e.rows, rowsTitle: '이달 꽃 조건',
    after: [essBox(S)],
    next: first ? {href: coHref(first.code), label: first.name + '의 한 달은?', step: 2} : {href: '#/r', label: '지난날 몇 번 꽃이 됐나?', step: 4}, asOf, S, later};
}

/* ── 2 회사(승) — 한 달 줄 · 조건 맞대기 · 왜 여기 있나 ── */
function reasonCard(r) {
  const li = (t, ok) => h('li', {class: ok ? 'su-ok' : 'su-no'}, h('i', {'aria-hidden': 'true', text: ok ? '●' : '■'}), h('span', {text: t}));
  if (r.kind === 'pick') return h('section', {class: 'su-why', 'aria-label': '꽃이 될 회사예요'}, h('h2', {class: 'su-ft', text: '꽃이 될 회사예요'}), h('p', {class: 'su-lead', text: '이달 꽃 조건 ' + kn(r.ok.length) + '에 모두 맞았어요.'}), h('ul', {class: 'su-cond'}, r.ok.map(t => li(t, true))));
  if (r.kind === 'near') return h('section', {class: 'su-why', 'aria-label': '조건에 가장 가까운 회사예요'}, h('h2', {class: 'su-ft', text: '조건에 가장 가까운 회사예요'}),
    h('p', {class: 'su-note', text: '조건에 다 맞지는 않아요. ' + josa(NAME, '가') + ' 고른 회사가 아니에요.'}),
    h('h3', {class: 'su-h3', text: '맞은 조건'}), h('ul', {class: 'su-cond'}, r.ok.map(t => li(t, true))), h('h3', {class: 'su-h3', text: '안 맞은 조건'}), h('ul', {class: 'su-cond'}, r.no.map(t => li(t, false))));
  if (r.kind === 'money') return h('section', {class: 'su-why', 'aria-label': '돈이 몰린 회사예요'}, h('h2', {class: 'su-ft', text: '돈이 몰린 회사예요'}), h('p', {class: 'su-lead', text: r.ind + ' 업종이 한 달 동안 시장보다 ' + moreLess(r.x) + ' 올랐어요.'}), r.why?.line ? h('p', {class: 'su-lead', text: r.why.line}) : null);
  return null;
}
async function vCo(code) {
  if (!CODE.test(code ?? '')) return notFound('이 회사를 찾지 못했어요.');
  const [{B, TH, S, bl, mo, asOf}, H, co] = await Promise.all([base(), get(D.H), get(D.co(code))]);
  const c = co?.c; if (!c || typeof c.name !== 'string') return notFound('이 회사를 찾지 못했어요.');
  const ind = typeof c.i === 'string' ? c.i : null; lastCo = {code, name: c.name, ind}; FIRST = firstCode(bl, mo);
  const rs = reasonsFor(code, bl, mo), r0 = rs[0] ?? null, cl = coLine(co), il = idxLine(H, c.market, H?.base, H?.asOf);
  const last = cl ? cl[cl.length - 1] - 100 : null, ilast = il ? il.line[il.line.length - 1] - 100 : null;
  const e = eCo({co: {code, name: c.name, ind, market: c.market}, rs, cl, il, asOf: H?.asOf ?? asOf, rec: bl.rec});
  const ec = eCond({co: {code, name: c.name, ind}, bl, rs, asOf, B});
  const hero = line(cl, il ? il.line : null, {label: c.name + ' 한 달 줄과 ' + (il?.name ?? '지수'), name: c.name, iname: il?.name ?? '지수', hero: true, cap: e.say, pctText: last != null ? pct(last) : null});
  hero.append(h('p', {class: 'su-lg'}, h('span', {class: 'su-lg-c'}, h('b', {text: last != null ? pct(last) : '?'}), ' ' + c.name), h('span', {class: 'su-lg-i'}, h('b', {text: ilast != null ? pct(ilast) : '?'}), ' ' + (il?.name ?? '지수'))));
  const indX = n => (TH?.inds ?? []).find(i => i?.n === n)?.x;
  const inds = [...bl.rows.map(r => ({n: r.ind, x: indX(r.ind)})), ...mo.map(r => ({n: r.ind, x: r.x}))].filter((x, i, a) => x.n && Number.isFinite(x.x) && a.findIndex(y => y.n === x.n) === i).sort((a, b) => b.x - a.x);
  return {title: c.name, tab: 1, step: 2, proper: true, kick: [c.market === 'KOSDAQ' ? '코스닥' : c.market === 'KOSPI' ? '코스피' : null, ind ? ind + ' 업종' : null].filter(Boolean).join(' · '), h1: c.name, big: e.big,
    hero, mids: e.mids, honest: honestOf(B),
    figs: [(r0?.kind === 'pick' || r0?.kind === 'near') ? matrix([{name: c.name, ok: bl.say.map(t => (r0.kind === 'pick' ? true : !r0.no.includes(t)))}], condsOf(bl), {label: c.name + '와 꽃 조건', title: '꽃 조건 셋과 이 회사'}) : null,
      inds.length && ind ? bars(inds.map(x => ({name: x.n, v: x.x, key: x.n})), {label: '업종 · 한 달 동안 시장보다', title: '업종이 시장보다 더 오른 만큼' + (Number.isFinite(bl.min) ? ' · 넘어야 할 선 ' + bl.min : ''), base: Number.isFinite(bl.min) ? bl.min : null, cur: ind}) : null].filter(Boolean),
    body: [...rs.map(reasonCard), ind ? h('a', {class: 'su-ind', href: indHref(ind)}, h('span', {text: ind + ' 업종'}), h('i', {'aria-hidden': 'true', text: '›'})) : null,
      h('a', {class: 'su-ask', href: '#/q/' + code}, h('b', {text: '사기 전에 한 번 멈춰요'}), h('span', {text: '「왜 사?」 열한 질문으로 내 이유부터 확인해요.'}))],
    rows: ec.rows, rowsTitle: '이달 꽃 조건 하나씩',
    next: ind ? {href: indHref(ind), label: '업종은 얼마나 올랐나?', step: 3} : {href: '#/r', label: '지난날 몇 번 꽃이 됐나?', step: 4}, asOf: H?.asOf ?? asOf, S,
    note: rs.length ? null : '이 회사는 오늘 두 목록에 없어요. 지난 한 달만 보여 드려요.'};
}

/* ── 3 업종(승) ── */
async function vInd(name) {
  const [{B, TH, W, S, bl, mo, asOf: a0}, M] = await Promise.all([base(), get(D.M)]);
  const rows = indRows(M, name); if (!rows.length) return notFound('이 업종을 찾지 못했어요.');
  FIRST = firstCode(bl, mo);
  const t = (Array.isArray(TH?.inds) ? TH.inds : []).find(i => i?.n === name), wy = whyOf(W, name), x = Number.isFinite(t?.x) ? t.x : null;
  const c0 = lastCo?.ind === name ? rows.find(r => r.code === lastCo.code) ?? null : null;
  const e = eInd({name, x, wy, rows, asOf: M?.asOf, cur: c0});
  const known = rows.filter(r => Number.isFinite(r.c)), up = known.filter(r => r.c > 0).length;
  const top = rows.slice(0, 12), extra = c0 && !top.some(r => r.code === c0.code) ? [c0] : [];
  const list = h('section', {class: 'su-list', 'aria-label': name + ' 업종 회사'}, h('h2', {class: 'su-ft', text: '회사를 누르면 그 회사로 가요'}),
    [...top, ...extra].map(r => h('a', {class: 'su-row su-irow' + (c0?.code === r.code ? ' su-cur' : ''), href: coHref(r.code)}, h('b', {'data-proper': '', text: r.name}), h('span', {class: 'su-csub', text: '한 달 ' + (Number.isFinite(r.c) ? pct(r.c) : NEED)}))));
  const indX = n => (TH?.inds ?? []).find(i => i?.n === n)?.x;
  const inds = [...bl.rows.map(r => ({n: r.ind, x: indX(r.ind)})), ...mo.map(r => ({n: r.ind, x: r.x})), {n: name, x}].filter((v, i, a) => v.n && Number.isFinite(v.x) && a.findIndex(y => y.n === v.n) === i).sort((a, b) => b.x - a.x);
  return {title: name + ' 업종', tab: 1, step: 3, kick: '돈의 흐름 · ' + dateKo(M?.asOf) + '까지 한 달', h1: name + ' 업종', big: e.big,
    hero: bars([...top, ...extra].map(r => ({name: r.name, v: r.c, key: r.code})), {label: name + ' 업종 회사 한 달 움직임', hero: true, signed: true, cur: c0?.code ?? null, cap: e.say}),
    mids: e.mids, honest: honestOf(B),
    figs: [known.length ? waffle(100 * up / known.length, 100 * (known.length - up) / known.length, {label: '오른 회사와 오르지 못한 회사', title: '100곳으로 치면 · 오른 곳과 못 오른 곳', la: '오른 곳', lb: '못 오른 곳'}) : null,
      inds.length > 1 ? bars(inds.map(v => ({name: v.n, v: v.x, key: v.n})), {label: '업종 · 한 달 동안 시장보다', title: '다른 업종과 견주면' + (Number.isFinite(bl.min) ? ' · 넘어야 할 선 ' + bl.min : ''), base: Number.isFinite(bl.min) ? bl.min : null, cur: name}) : null].filter(Boolean),
    body: [list, wy?.items?.length ? h('section', {class: 'su-why', 'aria-label': '돈이 몰린 까닭'}, h('h2', {class: 'su-ft', text: '돈이 몰린 까닭'}), wy.line ? h('p', {class: 'su-lead', text: wy.line}) : null,
      h('ol', {class: 'su-items'}, wy.items.slice(0, 4).map(it => h('li', {}, h('b', {text: it.t}), it.sub ? h('span', {text: it.sub}) : null)))) : null],
    next: {href: '#/r', label: '지난날 몇 번 꽃이 됐나?', step: 4}, asOf: M?.asOf ?? a0, S};
}

/* ── 4 기록 한곳(전) — 꽃 지난 기록 모두 + 내 매매일지 · 서랍 여섯(시안 8) ── */
async function vHub() {
  const {B, S, bl, mo, asOf} = await base();
  FIRST = firstCode(bl, mo);
  const mine = (readWhy() ?? []).filter(fullWhy), t0 = mine.length ? Date.parse(mine[0].at) : NaN, lastDay = Number.isFinite(t0) ? seoulDay(t0) : null; // 새 기록이 맨 앞
  const e = eHub({B, mine, lastDay}), hon = B?.honest, ms = eMonths({B}), dd = eDays({B}), yy = eYears({B}), nn = eNear({B});
  const drawer = (href, t, v, sub) => h('a', {class: 'su-drawer', href}, h('b', {text: t}), h('span', {class: 'su-dv', text: v}), h('span', {class: 'su-ds', text: sub}), h('i', {'aria-hidden': 'true', text: '›'}));
  return {title: '기록', tab: 2, step: 4, kick: ymd(hon?.from) && ymd(hon?.to) ? ymd(hon.from) + '부터 ' + ymd(hon.to) + '까지' : '지난 기록', h1: '지난 기록 한곳', big: e.big,
    hero: waffle(hon?.rate, hon?.base, {label: '100번에 몇 번 꽃이 됐나 · 조건에 맞은 회사와 아무 회사', hero: true, la: '조건에 맞은 회사', lb: '아무 회사', cap: e.say}),
    mids: e.mids,
    figs: [cols(ms.ms.map(m => ({v: m.rec.rate, v2: m.rec.base, open: m.rec.complete !== true, key: m.month, tick: /-(01|07)$/.test(m.month) ? ym(m.month).replace(/^\d{2}/, '').replace('년 ', '.').replace('월', '') : null})), {label: '달마다 꽃이 된 횟수', title: '달마다 · 못했던 달은 ■'}),
      split(hon?.n, hon?.hits, (B?.why?.names ?? []).map((n, k) => ({name: n, v: B?.why?.all?.why?.[k]})), {label: '꽃이 된 것과 못 된 것', title: '꽃이 된 것과 못 된 것'})],
    body: [h('section', {class: 'su-drawers', 'aria-label': '기록 서랍 여섯'}, h('h2', {class: 'su-ft', text: '기록 서랍 여섯'}),
      drawer('#/r/m', '달마다', ms.big.v ?? NEED, ms.big.label),
      drawer('#/r/w', '못 된 까닭', num(B?.why?.all?.miss) ? num(B.why.all.miss) + '번' : NEED, '조건에 맞고도 꽃이 못 된 횟수'),
      drawer('#/r/d', '날마다', dd.big.v != null ? dd.big.v + '날' : NEED, '지난 60거래일 달력'),
      drawer('#/r/y', '해마다', yy.big.v != null ? yy.big.v + ' 대 ' + yy.big.v2 : NEED, '모든 해 · 100번에 몇 번'),
      drawer('#/r/n', '가까운 회사', nn.big.v != null ? nn.big.v + ' 대 ' + nn.big.v2 : NEED, '조건에 가까웠던 회사 · 100번에 몇 번'),
      drawer('#/j', '내 매매일지', mine.length + '번', '「왜 사?」에 답한 기록 · 이 휴대폰에만'))],
    next: {href: '#/r/m', label: '몇 달이 나았나?', step: 5}, asOf, S, note: '지난 기록은 같은 조건을 지난날에 대어 센 것이에요. 앞날을 정해 주지 않아요.'};
}

/* ── 5 달마다(전) ── */
async function vMonths() {
  const {B, S, asOf} = await base();
  const e = eMonths({B});
  return {title: '달마다', tab: 2, step: 5, kick: '그달 꽃 조건으로 고른 회사', h1: '달마다 지난 기록', big: e.big,
    hero: cols(e.ms.map(m => ({v: m.rec.rate, v2: m.rec.base, open: m.rec.complete !== true, key: m.month, tick: /-(01|04|07|10)$/.test(m.month) ? (+m.month.slice(5, 7)) + '월' : null})), {label: '달마다 꽃이 된 횟수와 아무 회사', hero: true, cap: e.say}),
    mids: e.mids, honest: honestOf(B),
    figs: [bars(e.ms.filter(m => m.rec.complete === true).map(m => ({name: ym(m.month), v: m.rec.rate - m.rec.base, key: m.month, t: (m.rec.rate - m.rec.base >= 0 ? '+' : '−') + Math.abs(Math.round(m.rec.rate - m.rec.base)) + '번'})).reverse(),
      {label: '달마다 아무 회사보다 더 · 덜', title: '아무 회사보다 더(오른쪽) · 덜(왼쪽)', signed: true})],
    rows: e.rows, rowsTitle: '달마다 · 그달 조건은 여섯 칸의 「왜」',
    next: {href: '#/r/w', label: '왜 꽃이 못 됐나?', step: 6}, asOf, S};
}

/* ── 6 못 된 까닭(전) — 1,580번 가운데 못 된 것 · 까닭 셋 · 지난 60거래일 ── */
async function vMiss() {
  const {B, S, asOf} = await base();
  const e = ePause({B}), dd = eDays({B}), hon = B?.honest, code = lastCo?.code ?? null;
  return {title: '못 된 까닭', tab: 2, step: 6, kick: '조건에 맞고도 꽃이 못 된 것', h1: '꽃이 못 된 까닭', big: e.big,
    hero: split(hon?.n, hon?.hits, (B?.why?.names ?? []).map((n, k) => ({name: n, v: B?.why?.all?.why?.[k]})), {label: '꽃이 된 것과 못 된 것 · 까닭 셋', hero: true, cap: e.say}),
    mids: e.mids, honest: honestOf(B),
    figs: [cal(dd.ds, {label: '지난 60거래일 달력', title: '날마다 · ● 꽃이 됨 · ■ 못 됨 · ▲ 기다림'}), B?.near?.rec ? waffle(B.near.rec.rate, B.near.rec.base, {label: '가까운 회사 · 100번에 몇 번', title: '조건에 가까웠던 회사는', la: '가까운 회사', lb: '아무 회사'}) : null].filter(Boolean),
    rows: dd.mids, rowsTitle: '지난 60거래일',
    next: {href: code ? '#/q/' + code : '#/q', label: '내 이유는 무엇인가?', step: 7}, asOf, S};
}

/* ── 기록 서랍 — 날마다 · 해마다 · 가까운 회사(일곱 번 길 밖 · 기록 탭) ── */
async function vDays() {
  const {B, S, asOf} = await base();
  const e = eDays({B});
  return {title: '날마다', tab: 2, kick: ymd(B?.cal?.from) && ymd(B?.cal?.to) ? ymd(B.cal.from) + '부터 ' + ymd(B.cal.to) + '까지' : '지난 60거래일', h1: '날마다 지난 기록', big: e.big,
    hero: cal(e.ds, {label: '지난 60거래일 달력', hero: true, cap: e.say}), mids: e.mids, honest: honestOf(B),
    figs: [bars([{name: '꽃이 됨', v: e.hit, key: 'h', cls: 'g-ok'}, {name: '못 됨', v: e.miss, key: 'm', cls: 'g-no'}, {name: '기다림', v: e.wait, key: 'w', cls: 'g-wait'}], {label: '날마다 고른 회사 · 셋으로', title: '고른 회사를 셋으로 나누면', unit: '번'})],
    next: {href: '#/r/y', label: '해마다 보기'}, asOf, S};
}
async function vYears() {
  const {B, S, asOf} = await base();
  const e = eYears({B});
  return {title: '해마다', tab: 2, kick: '모든 해', h1: '해마다 지난 기록', big: e.big,
    hero: cols(e.ys.map(([y, v]) => ({v: Number.isFinite(v?.rate) ? v.rate : null, v2: Number.isFinite(v?.base) ? v.base : null, key: y, tick: y + '년', label: Number.isFinite(v?.rate) ? Math.round(v.rate) + '번' : '고른 적 없음'})), {label: '해마다 100번에 몇 번 · 짧은 금 = 아무 회사', hero: true, cap: e.say}),
    mids: [], honest: honestOf(B), rows: e.rows, rowsTitle: '해마다',
    next: {href: '#/r/n', label: '가까운 회사 보기'}, asOf, S};
}
async function vNear() {
  const {B, S, asOf} = await base();
  const e = eNear({B}), rec = B?.near?.rec;
  return {title: '가까운 회사', tab: 2, kick: ymd(rec?.from) && ymd(rec?.to) ? ymd(rec.from) + '부터 ' + ymd(rec.to) + '까지' : '지난 기록', h1: '가까운 회사의 지난 기록', big: e.big,
    hero: waffle(rec?.rate, rec?.base, {label: '가까운 회사와 아무 회사 · 100번에 몇 번', hero: true, la: '가까운 회사', lb: '아무 회사', cap: e.say}), mids: [], honest: honestOf(B),
    next: {href: '#/j', label: '내 매매일지 보기'}, asOf, S};
}

/* ── 길 ── */
const ctx = {base, get, D, page, notFound, source, midCard, sixBox, cur, setCur, honestOf, STEPS};
async function route() {
  const hh = location.hash || '#/';
  const fw = forwardTo(location.search, hh);
  if (fw) { location.replace(fw); return; }
  const root = document.getElementById('su');
  const m = /^#\/(c|i|k|r|p|q)\/(.+)$/.exec(hh), t = /^#\/(b|k|r|p|q|j)$/.exec(hh);
  let v;
  try {
    if (!FIRST) { const b0 = await base(); FIRST = firstCode(b0.bl, b0.mo); } // 회사 탭 — 아직 본 회사가 없으면 오늘 첫 회사
    if (!m && !t) v = await vHome();
    else if (t) v = t[1] === 'r' ? await vHub() : t[1] === 'q' || t[1] === 'p' ? await vQuiz(lastCo?.code ?? null, ctx) : t[1] === 'j' ? await vJournal(ctx) : t[1] === 'k' && lastCo?.code ? await vCo(lastCo.code) : await vHome();
    else {
      const [, k, raw] = m; let a = raw; try { a = decodeURIComponent(raw); } catch { /* 그대로 */ }
      if (k === 'c' || k === 'k') v = await vCo(a);
      else if (k === 'i') v = await vInd(a);
      else if (k === 'r') v = a === 'm' ? await vMonths() : a === 'w' ? await vMiss() : a === 'd' ? await vDays() : a === 'y' ? await vYears() : a === 'n' ? await vNear() : CODE.test(a) ? (lastCo = lastCo?.code === a ? lastCo : {code: a, name: null, ind: null}, await vHub()) : notFound('이 기록을 찾지 못했어요.');
      else v = CODE.test(a) ? await vQuiz(a, ctx) : notFound('이 회사를 찾지 못했어요.');
    }
  } catch (e) { console.error(e); v = notFound('화면을 그리다 멈췄어요. 다시 열어 주세요.'); }
  if (hh !== (location.hash || '#/')) return; // 그리는 사이 길이 바뀜
  root.replaceChildren(...page(v).filter(Boolean));
  glossTree(root);
  window.scrollTo(0, 0);
  if (typeof v.later === 'function') v.later().catch(e => console.error(e));
}
try { if (localStorage.getItem('su-big-text') === '1') document.documentElement.classList.add('su-lg'); } catch { /* 저장소 없음 */ }
window.addEventListener('hashchange', route);
route();
