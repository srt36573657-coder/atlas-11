/* 수르 — 쉬운 말 · 전문가 정보 판(빈 파일에서 새로 씀 · 주문 1807)
   사장님 2026-11-04 13:07(+04) 「그래서 만든 명령문」 — 주문 1616 의 기준 그대로 + [쉬운 말과 전문가 정보]
   「1. 주식 모르는 여고생 눈높이로 써라 … 7. 숫자마다 「그래서 무슨 뜻」을 붙여라 8. 쉽게 하려고 정보를 빼지 마라 9. 전문가용 자세한 값은 눌러야 열리게 해라」
   (원문 · 시안 열하나 · 장점표 docs/design/su-easy-2026-11-04/ · 앞 기준 주문 1616 · 1238 · 1506 · 1519 · 2049)
   쪽 틀(위 → 아래): 안전 문장 → 이름 → 큰 값 하나 + 「그래서」 뜻 줄 + 여섯 꽃잎 → 움직이는 큰 그림(기승전결 네 칸 · 네 줄) → 중간 값(값마다 뜻 줄)
     → 큰 값의 여섯 칸 → 정직한 세 칸 → 더 많은 그림 → 자세한 값(값마다 뜻 줄) → 「전문가용 자세히」(눌러야 열림 · 자료 숫자 모두 · 셈과 출처) → 출처와 조사 날짜
   쪽을 그린 뒤 낱말 엔진(su-word.js)이 못 바꾼 주식 낱말 밑에 「풀이」 한 줄을 붙이고 · 풀이 없이 남은 어려운 낱말 수를 main 에 적음(검사와 보고가 셈)
   길(일곱 번): 기 1 오늘 #/ → 승 2 회사 #/c/<번호> → 승 3 업종 #/i/<업종> → 전 4 기록 #/r → 전 5 달마다 #/r/m → 전 6 못 된 까닭 #/r/w → 결 7 「왜 사?」 #/q/<번호> → 결 8 내 매매일지 #/j
   탭 넷(유튜브처럼 · 기승전결): 오늘 · 회사 · 기록 · 멈춤 · 그림 부품(su-fig.js)과 「왜 사?」 셈(su-why.js)은 주문 1616 에서 새로 쓴 것을 씀 · 보안 규칙: innerHTML 없음 · 글 속 style 없음 */
import {NAME, josa} from '/next/brand.js';
import {glossTree} from '/next/glossary.js';
import {CODE, pct, moreLess, dateKo, bloomList, moneyList, reasonsFor, whyOf, idxLine, coLine, indRows, forwardTo} from '/su/su-data.js';
import {NEED, brand, holes, kn, num, ymd, ym, eHome, eCo, eCondRows, eInd, eHub, eMonths, eMiss, eDays, eYears, eNear} from '/su/su-six.js';
import {easy, glossPage, hardLeft} from '/su/su-word.js';
import {halo, dress} from '/su/su-art.js';
import {essenceData, essenceLines, kstText} from '/next/essence.js';
import {h, s, fig, matrix, bars, cols, waffle, line, cal, split, sixTiles, sixMap, thumb, funnel, honest3, dots6} from '/su/su-fig.js';
import {load21, v21Home, vLand, vLandOne, vMore, vFriend, reasonBox21, find21} from '/su/su-21.js';
let WHYM = null; const whyM = async () => (WHYM ??= await import('/su/su-why.js')); // 「왜 사?」 · 매매일지는 그 쪽에서 받음(첫 화면이 가볍게 — 주문 2044 느린 휴대폰)

brand(NAME);
const cache = new Map();
export const get = url => { if (!cache.has(url)) cache.set(url, fetch(url).then(r => (r.ok ? r.json() : null)).catch(() => null)); return cache.get(url); };
export const D = {B: '/next/data/theme-bloom.json', TH: '/next/data/theme.json', W: '/next/data/flow-why.json', S: '/next/data/home-summary.json', H: '/atlas/data/home.json', M: '/atlas/data/mkt.json', co: c => '/atlas/data/co/' + c + '.json'};
export async function base() {
  const [B, TH, W, S] = await Promise.all([get(D.B), get(D.TH), get(D.W), get(D.S)]);
  const bl = bloomList(B), mo = moneyList(TH, W).map(r => ({...r, why: r.why ? {...r.why, line: easy(r.why.line)} : r.why}));
  return {B, TH, W, S, bl: {...bl, say: bl.say.map(easy), miss: easy(bl.miss)}, mo, asOf: B?.asOf ?? TH?.asOf ?? null};
}
export const SAFE = '지난 기록만 보여 줘요. 앞날을 맞히지 않고 사고팔기를 권하지 않아요.';
const PHASE = ['기', '승', '전', '결'];
export const STEPS = [null, ['21곳', 0], ['땅 지도', 1], ['업종', 1], ['회사', 2], ['회사 자세히', 2], ['「왜 사?」', 3], ['내 매매일지', 3], ['친구에게', 3]]; // 주문 2044 — 21곳 → 땅 → 업종 → 회사 → 자세히 → 왜 사? → 일지 → 친구에게
let lastCo = null, FIRST = null;
export const cur = () => lastCo;
export const setCur = c => { lastCo = c; };
export const coHref = c => '#/c/' + c, indHref = n => '#/i/' + encodeURIComponent(n);
const firstCode = (bl, mo) => bl.rows[0]?.code ?? mo[0]?.code ?? null;
const TABS = () => [['21곳', '#/', 'M4 11l8-7 8 7v9h-5v-6h-6v6H4z'], ['지도', '#/m', 'M3 6l6-2 6 2 6-2v14l-6 2-6-2-6 2zM9 4v14M15 6v14'],
  ['기록', '#/r', 'M4 20V11M10 20V5M16 20v-8M21 20H3'], ['멈춤', lastCo?.code ? '#/q/' + lastCo.code : '#/q', 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM10 9v6M14 9v6']];

/* ── 틀 ── */
function tools() {
  const big = h('button', {class: 'su-tool', type: 'button', 'aria-pressed': String(document.documentElement.classList.contains('su-lg')), text: '글씨 크게'});
  big.addEventListener('click', () => { const on = document.documentElement.classList.toggle('su-lg'); big.setAttribute('aria-pressed', String(on)); try { localStorage.setItem('su-big-text', on ? '1' : '0'); } catch { /* 저장 못 해도 됨 */ } });
  const gift = h('a', {id: 'giftBtn', class: 'su-tool su-gift', href: '#/gift', 'aria-label': '선물 받기 · 상품권', text: '선물'}); // 옛 기능 상품권 · 커피 쿠폰(주문 2044 — 옛 기능 하나도 빼지 않음)
  return h('div', {class: 'su-tools'}, gift, big);
}
/** 듣기 — 큰 값 · 뜻 줄 · 네 줄 글(엄지 자리 · 다음 단추 옆) */
function sayBtn() {
  const b = h('button', {class: 'su-say', type: 'button', 'aria-label': '읽어 주기'}, s('svg', {class: 'su-ti', viewBox: '0 0 24 24', 'aria-hidden': 'true'}, s('path', {d: 'M4 9v6h4l5 4V5L8 9zM16 9a4 4 0 0 1 0 6M18.5 6.5a8 8 0 0 1 0 11'})), h('span', {text: '듣기'}));
  b.addEventListener('click', () => {
    try {
      const sy = window.speechSynthesis; if (!sy) return;
      if (sy.speaking) { sy.cancel(); return; }
      const t = [...document.querySelectorAll('#su h1, #su .su-head .su-big, #su .su-head .su-mean, #su .su-hero .su-cap p')].map(e => e.innerText.replace(/\s+/g, ' ')).join('. ');
      const u = new SpeechSynthesisUtterance(t); u.lang = 'ko-KR'; u.rate = 0.9; sy.speak(u);
    } catch { /* 읽어 주기가 없는 기기 */ }
  });
  return b;
}
const valText = (v, B = 'b', U = 'span') => (v.v == null ? h(B, {class: 'su-needv', text: NEED}) : [h(B, {text: v.v}), v.unit ? h(U, {text: v.unit}) : null,
  v.v2 != null ? [h('em', {text: '대'}), h(B, {text: v.v2}), v.unit ? h(U, {text: v.unit}) : null] : null]);
/** 그래서 무슨 뜻 — 숫자마다 한 줄(학생 말) · 뜻이 없으면 「확인 필요」 */
const meanLine = (v, big = false) => h('p', {class: 'su-mean' + (big ? ' su-mean-big' : ''), 'aria-label': '그래서 무슨 뜻'}, h('i', {text: '그래서'}), h('span', {class: v.mean ? null : 'su-needt', text: v.mean ?? NEED}));
const bigVal = v => h('div', {class: 'su-big'}, h('p', {class: 'su-bv'}, valText(v), halo(v.six)), h('p', {class: 'su-bl', text: v.label}), meanLine(v, true)); // 여섯 꽃잎은 큰 값 옆(빈 칸 수는 아래 여섯 칸 판 제목)
/** 값의 여섯 칸 — 닫혀 있어도 꽃잎 여섯과 빈 칸 수가 보임 · 누르면 여섯 칸 판 */
export function sixBox(v) {
  const n = holes(v.six).length;
  return h('details', {class: 'su-sixd'}, h('summary', {class: 'su-sixs'}, dots6(v.six), h('span', {class: 'su-sixw', text: '여섯 칸'}), h('b', {class: n ? 'su-needt' : 'su-fullt', text: n ? NEED + ' ' + n + '칸' : '다 채움'})),
    sixTiles(v.six, {title: null, small: true, label: v.label + ' — 여섯 칸'}));
}
export const midCard = v => h('div', {class: 'su-mid'}, h('p', {class: 'su-ml', text: v.label}), h('p', {class: 'su-mv'}, valText(v)), meanLine(v), sixBox(v));
function valRow(v) {
  const head = h('div', {class: 'su-vh'}, h('span', {class: 'su-vl', text: v.label}), h('span', {class: 'su-vv'}, valText(v, 'b', 'small')));
  return h('li', {class: 'su-vr' + (v.up === false && !v.open ? ' su-worse' : '') + (v.open ? ' su-openm' : '')}, v.href ? h('a', {class: 'su-vlink', href: v.href}, head) : head, meanLine(v), sixBox(v));
}
/** 전문가용 자세히 — 자료 숫자 모두 · 셈과 출처 · 눌러야 열림 */
export function proBox(pro, title = '전문가용 자세히') {
  if (!pro?.length) return null;
  const need = pro.filter(p => p.v === NEED).length; // 빠진 칸 수(시안 4 장점)
  return h('details', {class: 'su-pro'}, h('summary', {class: 'su-pros'}, h('b', {text: title}), h('span', {text: '숫자 ' + pro.length + '개 · ' + (need ? '확인 필요 ' + need + '칸' : '빠진 칸 0') + ' · 셈과 출처'})),
    h('ul', {class: 'su-prol'}, pro.map(p => h('li', {}, h('span', {class: 'su-prok', text: p.k}), h('b', {class: 'su-prov' + (p.v === NEED ? ' su-needt' : ''), text: p.v}), p.how ? h('span', {class: 'su-proh', text: p.how}) : null))));
}
export function source(asOf, S, note = null, kick = null) {
  const got = S?.fetchedAt ? kstText(S.fetchedAt) : null;
  return h('footer', {class: 'su-src'}, kick ? h('p', {}, h('b', {text: '이 쪽 '}), kick) : null,
    h('p', {}, h('b', {text: '출처 '}), '네이버 증권 그날 마지막 값 · ' + josa(NAME, '가') + ' 센 지난 기록'),
    h('p', {}, h('b', {text: '조사 날짜 '}), '자료 ' + (ymd(asOf) ?? NEED) + (got ? ' · 받은 때 ' + got : '')),
    note ? h('p', {text: note}) : null);
}
function dock(nx, step) {
  if (!nx) return null;
  return h('nav', {class: 'su-dock', 'aria-label': '다음 화면'},
    step ? h('ol', {class: 'su-prog', 'aria-label': '여덟 화면 가운데 ' + step + '번째'}, STEPS.slice(1).map((x, i) => h('li', {class: i + 1 < step ? 'su-pd' : i + 1 === step ? 'su-pc' : ''}))) : null,
    h('div', {class: 'su-dk'}, sayBtn(), h('a', {class: 'su-next', href: nx.href}, h('img', {class: 'su-parrot', src: '/media/makbi-icon.svg', alt: '', 'aria-hidden': 'true', width: '34', height: '34'}), h('span', {class: 'su-nk', text: nx.k ?? (nx.step ? nx.step + ' / 8' : '다음')}), h('b', {text: nx.label}), h('i', {'aria-hidden': 'true', text: '›'}))));
}
function tabs(active) {
  return h('nav', {class: 'su-tabs', 'aria-label': '탭 — 기 21곳 · 승 지도 · 전 기록 · 결 멈춤'}, TABS().map(([t, href, d], i) => h('a', {class: 'su-tab' + (i === active ? ' su-on' : ''), href, 'aria-current': i === active ? 'page' : null, 'aria-label': PHASE[i] + ' · ' + t},
    s('svg', {class: 'su-ti', viewBox: '0 0 24 24', 'aria-hidden': 'true'}, s('path', {d})), h('span', {text: t}))));
}
/** 쪽 하나 */
export function page(m) {
  document.title = (m.title ? m.title + ' · ' : '') + NAME;
  const st = m.step ? STEPS[m.step] : null;
  const head = h('header', {class: 'su-top top'}, h('a', {class: 'su-brand', href: '#/', text: NAME}),
    st ? h('span', {class: 'su-step'}, h('i', {text: PHASE[st[1]]}), h('span', {text: m.step + ' / 8 · ' + st[0]})) : null, tools());
  const h1 = h('h1', {class: 'su-h1', text: m.h1 ?? m.title});
  if (m.proper) h1.setAttribute('data-proper', '');
  const main = h('main', {class: 'su-page'},
    h('p', {class: 'su-safe', text: SAFE}),
    h('section', {class: 'su-head', 'aria-label': '큰 값'}, h1, m.big ? bigVal(m.big) : null), // 머리 줄(때 · 시장)은 맨 아래 출처 칸으로 — 첫 화면은 큰 값과 그림이 차지
    m.hero ?? null,
    m.mids?.length ? h('section', {class: 'su-mids n' + m.mids.length, 'aria-label': '중간 값'}, m.mids.map(midCard)) : null,
    m.big ? sixTiles(m.big.six, {label: '큰 값의 여섯 칸'}) : null,
    m.honest ?? null,
    ...(m.figs ?? []),
    ...(m.body ?? []),
    m.rows?.length ? h('section', {class: 'su-rows', 'aria-label': m.rowsTitle ?? '자세한 값'}, h('h2', {class: 'su-ft', text: m.rowsTitle ?? '자세한 값'}), h('ol', {class: 'su-vlist'}, m.rows.map(valRow))) : null,
    m.big ? sixMap([m.big, ...(m.mids ?? []), ...(m.rows ?? [])]) : null,
    proBox(m.pro),
    ...(m.after ?? []),
    source(m.asOf, m.S, m.note ?? null, m.kick ?? null));
  return [head, main, dock(m.next, m.step), tabs(m.tab ?? 0)];
}
/** 그린 뒤 — 낱말 풀이를 붙이고 풀이 없이 남은 어려운 낱말을 셈(main data-hard · data-hard-words · data-glossed) */
export function afterPaint(root) {
  const main = root.querySelector('main'); if (!main) return;
  glossTree(main);
  const glossed = glossPage(main);
  const c = main.cloneNode(true); for (const e of c.querySelectorAll('.su-pro, .su-gl, .su-wc, svg, [data-proper]')) e.remove();
  const left = hardLeft(c.textContent ?? '', glossed);
  main.dataset.glossed = glossed.join(',');
  main.dataset.hard = String(left.length);
  main.dataset.hardWords = left.join(',');
  const f = main.querySelector('.su-src'); // 쉬운 말 셈을 맨 아래에(시안 2 장점) — 기계가 센 값
  if (f) { f.querySelector('.su-wc')?.remove(); f.append(h('p', {class: 'su-wc'}, h('b', {text: '쉬운 말 '}), '풀이 붙인 낱말 ' + glossed.length + '개 · 풀이 없이 남은 어려운 낱말 ' + left.length + '개' + (left.length ? ' (' + left.join(', ') + ')' : ''))); }
  requestAnimationFrame(() => setTimeout(() => dress(root), 0)); // 무하처럼 — 어깨 덩굴 · 꽃 띠 · 네 모서리 꽃 · 글과 겹치면 숨김(주문 1833) · 첫 그림이 뜬 뒤에(느린 휴대폰에서 첫 화면을 늦추지 않게)
}
export function notFound(t) { return {title: '찾지 못했어요', h1: '찾지 못했어요', tab: 0, body: [h('p', {class: 'su-lead', text: '? ' + t}), h('a', {class: 'su-ask', href: '#/'}, h('b', {text: '처음으로'}))]}; }
const condsOf = bl => bl.say.map(t => ({t, short: t.replace(/(이에요|예요|어요)$/, '')}));
const honestOf = B => honest3({base: B?.honest?.base, rate: B?.honest?.rate, down: B?.honest?.down, scored: B?.honest?.scored, miss: B?.why?.all?.miss, n: B?.honest?.n, fall: B?.record?.all?.fall, fallBase: B?.record?.all?.fallBase});
function essBox(S) {
  const lines = essenceLines(essenceData({summary: S}));
  return h('section', {class: 'su-ess', 'aria-label': NAME + ' 본질'}, h('h2', {class: 'su-ft', text: josa(NAME, '는') + ' 이런 곳이에요'}), h('ol', {}, lines.map((t, i) => h('li', {'data-ess': String(i + 1), text: t}))));
}

/* ── 1 오늘(기) ── */
async function vHome() {
  const {B, S, bl, mo, asOf} = await base();
  const e = eHome({S, B, bl, mo, asOf}), pick = bl.mode === 'pick', near = bl.mode === 'near';
  const all = [...bl.rows.map(r => ({...r, sec: 'bl'})), ...mo.filter(m => !bl.rows.some(r => r.code === m.code)).map(r => ({...r, sec: 'mo'}))];
  const fill = [];
  const card = r => {
    const th = h('span', {class: 'su-thw'}, thumb(null, null, r.name + ' 한 달 줄')), sub = h('span', {class: 'su-csub', text: (r.ind ? r.ind + ' · ' : '') + '한 달 …'}), mean = h('span', {class: 'su-cmean', text: ''});
    fill.push([th, sub, mean, r]);
    return h('a', {class: 'su-row su-card', href: coHref(r.code)}, th,
      h('span', {class: 'su-cbody'}, h('b', {class: 'su-cname', 'data-proper': '', text: r.name}), sub, mean,
        h('span', {class: 'su-chip su-chip-' + r.sec, text: r.sec === 'bl' ? (pick ? '꽃 조건 모두' : '가까운 곳') : '돈이 몰린 곳'})));
  };
  const later = async () => {
    const H = await get(D.H);
    await Promise.all(fill.map(async ([th, sub, mean, r]) => {
      const co = await get(D.co(r.code)), cl = coLine(co), il = idxLine(H, co?.c?.market, H?.base, H?.asOf), last = cl ? cl[cl.length - 1] - 100 : null, il0 = il ? il.line[il.line.length - 1] - 100 : null;
      th.replaceChildren(thumb(cl, il ? il.line : null, r.name + ' 한 달 줄'));
      sub.textContent = (r.ind ? r.ind + ' · ' : '') + '한 달 ' + (last != null ? pct(last) : NEED);
      mean.textContent = last != null && il0 != null ? (last > il0 ? '그래서 시장보다 더 올랐어요' : '그래서 시장보다 덜 올랐어요') : '';
    }));
  };
  const blI = all.filter(r => r.sec === 'bl'), moI = all.filter(r => r.sec === 'mo');
  const sec = (label, title, list, note) => (list.length ? h('section', {class: 'su-list', 'aria-label': label}, h('h2', {class: 'su-ft', text: title}), note ? h('p', {class: 'su-note', text: note}) : null, h('div', {class: 'su-shelf', role: 'list'}, list.map(card))) : null); // 유튜브 앱 선반처럼 옆으로 넘김(쪽은 옆으로 안 움직임)
  FIRST = firstCode(bl, mo);
  const first = all[0] ?? null;
  return {title: '오늘 꽃 조건', tab: 0, step: null, kick: (dateKo(asOf) === '?' ? '' : dateKo(asOf) + ' · ') + '코스피 · 코스닥', h1: '오늘 꽃 조건', big: e.big,
    hero: funnel({total: S?.coN, conds: bl.say, near: near ? bl.rows.map(r => r.name) : [], pick: pick ? bl.rows.map(r => r.name) : [], miss: bl.miss, cap: e.say}),
    mids: e.mids, honest: honestOf(B),
    body: [sec('꽃이 될 회사', pick ? '꽃 조건에 모두 맞은 회사' : near ? '조건에 가장 가까운 회사' : '꽃이 될 회사', blI, near ? '조건에 다 맞지는 않아요. ' + josa(NAME, '가') + ' 고른 회사가 아니에요.' : null),
      sec('돈이 몰린 회사', '돈이 몰린 회사', moI, '업종이 한 달 동안 시장보다 더 오른 곳의 대장이에요.')],
    rows: e.rows, rowsTitle: '이달 꽃 조건', pro: e.pro, after: [essBox(S)],
    next: first ? {href: coHref(first.code), label: first.name + '의 한 달은?', step: null} : {href: '#/r', label: '지난날 몇 번 꽃이 됐나?', step: 4}, asOf, S, later};
}

/* ── 2 회사(승) ── */
function reasonCard(r) {
  const li = (t, ok) => h('li', {class: ok ? 'su-ok' : 'su-no'}, h('i', {'aria-hidden': 'true', text: ok ? '●' : '■'}), h('span', {text: t}));
  if (r.kind === 'pick') return h('section', {class: 'su-why', 'aria-label': '꽃이 될 회사예요'}, h('h2', {class: 'su-ft', text: '꽃이 될 회사예요'}), h('p', {class: 'su-lead', text: '이달 꽃 조건 ' + kn(r.ok.length) + '에 모두 맞았어요.'}), h('ul', {class: 'su-cond'}, r.ok.map(t => li(easy(t), true))));
  if (r.kind === 'near') return h('section', {class: 'su-why', 'aria-label': '조건에 가장 가까운 회사예요'}, h('h2', {class: 'su-ft', text: '조건에 가장 가까운 회사예요'}),
    h('p', {class: 'su-note', text: '조건에 다 맞지는 않아요. ' + josa(NAME, '가') + ' 고른 회사가 아니에요.'}),
    h('h3', {class: 'su-h3', text: '맞은 조건'}), h('ul', {class: 'su-cond'}, r.ok.map(t => li(easy(t), true))), h('h3', {class: 'su-h3', text: '안 맞은 조건'}), h('ul', {class: 'su-cond'}, r.no.map(t => li(easy(t), false))));
  if (r.kind === 'money') return h('section', {class: 'su-why', 'aria-label': '돈이 몰린 회사예요'}, h('h2', {class: 'su-ft', text: '돈이 몰린 회사예요'}), h('p', {class: 'su-lead', text: r.ind + ' 업종이 한 달 동안 시장보다 ' + moreLess(r.x) + ' 올랐어요.'}), r.why?.line ? h('p', {class: 'su-lead', text: easy(r.why.line)}) : null);
  return null;
}
async function vCo(code) {
  if (!CODE.test(code ?? '')) return notFound('이 회사를 찾지 못했어요.');
  const [{B, TH, S, bl, mo, asOf}, H, co] = await Promise.all([base(), get(D.H), get(D.co(code))]);
  const c = co?.c; if (!c || typeof c.name !== 'string') return notFound('이 회사를 찾지 못했어요.');
  const ind = typeof c.i === 'string' ? c.i : null; lastCo = {code, name: c.name, ind}; FIRST = firstCode(bl, mo);
  const rs = reasonsFor(code, bl, mo), r0 = rs[0] ?? null, cl = coLine(co), il = idxLine(H, c.market, H?.base, H?.asOf);
  const last = cl ? cl[cl.length - 1] - 100 : null, ilast = il ? il.line[il.line.length - 1] - 100 : null;
  const e = eCo({co: {code, name: c.name, ind, market: c.market}, rs, cl, il, asOf: H?.asOf ?? asOf, rec: bl.rec, bl});
  const hero = line(cl, il ? il.line : null, {label: c.name + ' 한 달 줄과 ' + (il?.name ?? '시장 전체 값'), name: c.name, iname: il?.name ?? '시장', hero: true, cap: e.say, pctText: last != null ? pct(last) : null});
  hero.append(h('p', {class: 'su-lg'}, h('span', {class: 'su-lg-c'}, h('b', {text: last != null ? pct(last) : '?'}), ' ' + c.name), h('span', {class: 'su-lg-i'}, h('b', {text: ilast != null ? pct(ilast) : '?'}), ' ' + (il?.name ?? '시장'))));
  const indX = n => (TH?.inds ?? []).find(i => i?.n === n)?.x;
  const inds = [...bl.rows.map(r => ({n: r.ind, x: indX(r.ind)})), ...mo.map(r => ({n: r.ind, x: r.x}))].filter((x, i, a) => x.n && Number.isFinite(x.x) && a.findIndex(y => y.n === x.n) === i).sort((a, b) => b.x - a.x);
  return {title: c.name, tab: 1, step: 2, proper: true, kick: [c.market === 'KOSDAQ' ? '코스닥' : c.market === 'KOSPI' ? '코스피' : null, ind ? ind + ' 업종' : null].filter(Boolean).join(' · '), h1: c.name, big: e.big,
    hero, mids: e.mids, honest: honestOf(B),
    figs: [(r0?.kind === 'pick' || r0?.kind === 'near') ? matrix([{name: c.name, ok: bl.say.map(t => (r0.kind === 'pick' ? true : !r0.no.map(easy).includes(t)))}], condsOf(bl), {label: c.name + '와 꽃 조건', title: '꽃 조건 셋과 이 회사'}) : null,
      inds.length && ind ? bars(inds.map(x => ({name: x.n, v: x.x, key: x.n})), {label: '업종 · 한 달 동안 시장보다', title: '업종이 시장보다 더 오른 만큼' + (Number.isFinite(bl.min) ? ' · 넘어야 할 선 ' + bl.min : ''), base: Number.isFinite(bl.min) ? bl.min : null, cur: ind}) : null].filter(Boolean),
    body: [...rs.map(reasonCard), ind ? h('a', {class: 'su-ind', href: indHref(ind)}, h('span', {text: ind + ' 업종'}), h('i', {'aria-hidden': 'true', text: '›'})) : null,
      h('a', {class: 'su-ask', href: '#/q/' + code}, h('b', {text: '사기 전에 한 번 멈춰요'}), h('span', {text: '「왜 사?」 열한 질문으로 내 이유부터 확인해요.'}))],
    rows: eCondRows({co: {code, name: c.name, ind}, bl, rs: rs.map(x => ({...x, ok: (x.ok ?? []).map(easy), no: (x.no ?? []).map(easy)})), asOf, B}), rowsTitle: '이달 꽃 조건 하나씩', pro: e.pro,
    next: ind ? {href: indHref(ind), label: '업종은 얼마나 올랐나?', step: 3} : {href: '#/r', label: '지난날 몇 번 꽃이 됐나?', step: 4}, asOf: H?.asOf ?? asOf, S,
    note: rs.length ? null : '이 회사는 오늘 두 목록에 없어요. 지난 한 달만 보여 드려요.'};
}

/* ── 3 업종(승) ── */
async function vInd(name) {
  const [{B, TH, W, S, bl, mo, asOf: a0}, M] = await Promise.all([base(), get(D.M)]);
  const rows = indRows(M, name); if (!rows.length) return notFound('이 업종을 찾지 못했어요.');
  FIRST = firstCode(bl, mo);
  const t = (Array.isArray(TH?.inds) ? TH.inds : []).find(i => i?.n === name), wy0 = whyOf(W, name), wy = wy0 ? {...wy0, line: easy(wy0.line)} : null, x = Number.isFinite(t?.x) ? t.x : null;
  const c0 = lastCo?.ind === name ? rows.find(r => r.code === lastCo.code) ?? null : null;
  const e = eInd({name, x, wy, rows, asOf: M?.asOf, cur: c0, min: Number.isFinite(bl.min) ? bl.min : null});
  const known = rows.filter(r => Number.isFinite(r.c)), up = known.filter(r => r.c > 0).length;
  const top = rows.slice(0, 12), extra = c0 && !top.some(r => r.code === c0.code) ? [c0] : [];
  const list = h('section', {class: 'su-list', 'aria-label': name + ' 업종 회사'}, h('h2', {class: 'su-ft', text: '회사를 누르면 그 회사로 가요'}),
    [...top, ...extra].map(r => h('a', {class: 'su-row su-irow' + (c0?.code === r.code ? ' su-cur' : ''), href: coHref(r.code)}, h('b', {'data-proper': '', text: r.name}), h('span', {class: 'su-csub', text: '한 달 ' + (Number.isFinite(r.c) ? pct(r.c) : NEED)}))));
  const indX = n => (TH?.inds ?? []).find(i => i?.n === n)?.x;
  const inds = [...bl.rows.map(r => ({n: r.ind, x: indX(r.ind)})), ...mo.map(r => ({n: r.ind, x: r.x})), {n: name, x}].filter((v, i, a) => v.n && Number.isFinite(v.x) && a.findIndex(y => y.n === v.n) === i).sort((a, b) => b.x - a.x);
  return {title: name + ' 업종', tab: 1, step: null, kick: '돈의 흐름 · ' + dateKo(M?.asOf) + '까지 한 달', h1: name + ' 업종', big: e.big,
    hero: bars([...top, ...extra].map(r => ({name: r.name, v: r.c, key: r.code})), {label: name + ' 업종 회사 한 달 움직임', hero: true, signed: true, cur: c0?.code ?? null, cap: e.say}),
    mids: e.mids, honest: honestOf(B),
    figs: [known.length ? waffle(100 * up / known.length, 100 * (known.length - up) / known.length, {label: '오른 회사와 오르지 못한 회사', title: '100곳으로 치면 · 오른 곳과 못 오른 곳', la: '오른 곳', lb: '못 오른 곳'}) : null,
      inds.length > 1 ? bars(inds.map(v => ({name: v.n, v: v.x, key: v.n})), {label: '업종 · 한 달 동안 시장보다', title: '다른 업종과 견주면' + (Number.isFinite(bl.min) ? ' · 넘어야 할 선 ' + bl.min : ''), base: Number.isFinite(bl.min) ? bl.min : null, cur: name}) : null].filter(Boolean),
    body: [list, wy?.items?.length ? h('section', {class: 'su-why', 'aria-label': '돈이 몰린 까닭'}, h('h2', {class: 'su-ft', text: '돈이 몰린 까닭'}), wy.line ? h('p', {class: 'su-lead', text: wy.line}) : null,
      h('ol', {class: 'su-items'}, wy.items.slice(0, 4).map(it => h('li', {}, h('b', {text: easy(it.t)}), it.sub ? h('span', {text: easy(it.sub)}) : null)))) : null],
    rows: e.rows, rowsTitle: '회사마다 한 달', pro: e.pro,
    next: {href: '#/r', label: '지난날 몇 번 꽃이 됐나?', step: null}, asOf: M?.asOf ?? a0, S};
}

/* ── 4 기록 한곳(전) ── */
async function vHub() {
  const {B, S, bl, mo, asOf} = await base();
  FIRST = firstCode(bl, mo);
  const {readWhy, fullWhy, seoulDay} = await whyM();
  const mine = (readWhy() ?? []).filter(fullWhy), t0 = mine.length ? Date.parse(mine[0].at) : NaN, lastDay = Number.isFinite(t0) ? seoulDay(t0) : null;
  const e = eHub({B, mine, lastDay}), hon = B?.honest, ms = eMonths({B}), dd = eDays({B}), yy = eYears({B}), nn = eNear({B});
  const drawer = (href, t, v, sub) => h('a', {class: 'su-drawer', href}, h('b', {text: t}), h('span', {class: 'su-dv', text: v}), h('span', {class: 'su-ds', text: sub}), h('i', {'aria-hidden': 'true', text: '›'}));
  return {title: '기록', tab: 2, step: null, kick: ymd(hon?.from) && ymd(hon?.to) ? ymd(hon.from) + '부터 ' + ymd(hon.to) + '까지' : '지난 기록', h1: '지난 기록 한곳', big: e.big,
    hero: waffle(hon?.rate, hon?.base, {label: '100번에 몇 번 꽃이 됐나 · 조건에 맞은 회사와 아무 회사', hero: true, la: '조건에 맞은 회사', lb: '아무 회사', cap: e.say}),
    mids: e.mids,
    figs: [cols(ms.ms.map(m => ({v: m.rec.rate, v2: m.rec.base, open: m.rec.complete !== true, key: m.month, tick: /-(01|07)$/.test(m.month) ? (+m.month.slice(5, 7)) + '월' : null})), {label: '달마다 꽃이 된 횟수', title: '달마다 · 못했던 달은 ■'}),
      split(hon?.n, hon?.hits, (B?.why?.names ?? []).map((n, k) => ({name: n, v: B?.why?.all?.why?.[k]})), {label: '꽃이 된 것과 못 된 것', title: '꽃이 된 것과 못 된 것'})],
    body: [h('section', {class: 'su-drawers', 'aria-label': '기록 서랍 여섯'}, h('h2', {class: 'su-ft', text: '기록 서랍 여섯'}),
      drawer('#/r/m', '달마다', ms.big.v ?? NEED, ms.big.label),
      drawer('#/r/w', '못 된 까닭', num(B?.why?.all?.miss) ? num(B.why.all.miss) + '번' : NEED, '조건에 맞고도 꽃이 못 된 횟수'),
      drawer('#/r/d', '날마다', dd.big.v != null ? dd.big.v + '날' : NEED, '지난 60거래일 달력'),
      drawer('#/r/y', '해마다', yy.big.v != null ? yy.big.v + ' 대 ' + yy.big.v2 : NEED, '모든 해 · 100번에 몇 번'),
      drawer('#/r/n', '가까운 회사', nn.big.v != null ? nn.big.v + ' 대 ' + nn.big.v2 : NEED, '조건에 가까웠던 회사 · 100번에 몇 번'),
      drawer('#/j', '내 매매일지', mine.length + '번', '「왜 사?」에 답한 기록 · 이 휴대폰에만'))],
    pro: e.pro,
    next: {href: '#/r/m', label: '몇 달이 나았나?', step: null}, asOf, S, note: '지난 기록은 같은 조건을 지난날에 대어 센 것이에요. 앞날을 정해 주지 않아요.'};
}

/* ── 5 달마다(전) ── */
async function vMonths() {
  const {B, S, asOf} = await base();
  const e = eMonths({B});
  return {title: '달마다', tab: 2, step: null, kick: '그달 꽃 조건으로 고른 회사', h1: '달마다 지난 기록', big: e.big,
    hero: cols(e.ms.map(m => ({v: m.rec.rate, v2: m.rec.base, open: m.rec.complete !== true, key: m.month, tick: /-(01|04|07|10)$/.test(m.month) ? (+m.month.slice(5, 7)) + '월' : null})), {label: '달마다 꽃이 된 횟수와 아무 회사', hero: true, cap: e.say}),
    mids: e.mids, honest: honestOf(B),
    figs: [bars(e.ms.filter(m => m.rec.complete === true).map(m => ({name: ym(m.month), v: m.rec.rate - m.rec.base, key: m.month, t: (m.rec.rate - m.rec.base >= 0 ? '+' : '−') + Math.abs(Math.round(m.rec.rate - m.rec.base)) + '번'})).reverse(),
      {label: '달마다 아무 회사보다 더 · 덜', title: '아무 회사보다 더(오른쪽) · 덜(왼쪽)', signed: true})],
    rows: e.rows.map(r => ({...r, label: r.label})), rowsTitle: '달마다 · 그달 조건은 여섯 칸의 「왜」', pro: e.pro,
    next: {href: '#/r/w', label: '왜 꽃이 못 됐나?', step: null}, asOf, S};
}

/* ── 6 못 된 까닭(전) ── */
async function vMiss() {
  const {B, S, asOf} = await base();
  const e = eMiss({B}), dd = eDays({B}), hon = B?.honest, code = lastCo?.code ?? null;
  return {title: '못 된 까닭', tab: 2, step: null, kick: '조건에 맞고도 꽃이 못 된 것', h1: '꽃이 못 된 까닭', big: e.big,
    hero: split(hon?.n, hon?.hits, (B?.why?.names ?? []).map((n, k) => ({name: n, v: B?.why?.all?.why?.[k]})), {label: '꽃이 된 것과 못 된 것 · 까닭 셋', hero: true, cap: e.say}),
    mids: e.mids, honest: honestOf(B),
    figs: [cal(dd.ds, {label: '지난 60거래일 달력', title: '날마다 · ● 꽃이 됨 · ■ 못 됨 · ▲ 기다림'}), B?.near?.rec ? waffle(B.near.rec.rate, B.near.rec.base, {label: '가까운 회사 · 100번에 몇 번', title: '조건에 가까웠던 회사는', la: '가까운 회사', lb: '아무 회사'}) : null].filter(Boolean),
    rows: dd.mids, rowsTitle: '지난 60거래일', pro: [...e.pro, ...dd.pro],
    next: {href: code ? '#/q/' + code : '#/q', label: '내 이유는 무엇인가?', step: null}, asOf, S};
}

/* ── 기록 서랍 — 날마다 · 해마다 · 가까운 회사 ── */
async function vDays() {
  const {B, S, asOf} = await base();
  const e = eDays({B});
  return {title: '날마다', tab: 2, kick: ymd(B?.cal?.from) && ymd(B?.cal?.to) ? ymd(B.cal.from) + '부터 ' + ymd(B.cal.to) + '까지' : '지난 60거래일', h1: '날마다 지난 기록', big: e.big,
    hero: cal(e.ds, {label: '지난 60거래일 달력', hero: true, cap: e.say}), mids: e.mids, honest: honestOf(B),
    figs: [bars([{name: '꽃이 됨', v: e.hit, key: 'h', cls: 'g-ok'}, {name: '못 됨', v: e.miss, key: 'm', cls: 'g-no'}, {name: '기다림', v: e.wait, key: 'w', cls: 'g-wait'}], {label: '날마다 고른 회사 · 셋으로', title: '고른 회사를 셋으로 나누면', unit: '번'})],
    pro: e.pro, next: {href: '#/r/y', label: '해마다 보기'}, asOf, S};
}
async function vYears() {
  const {B, S, asOf} = await base();
  const e = eYears({B});
  return {title: '해마다', tab: 2, kick: '모든 해', h1: '해마다 지난 기록', big: e.big,
    hero: cols(e.ys.map(([y, v]) => ({v: Number.isFinite(v?.rate) ? v.rate : null, v2: Number.isFinite(v?.base) ? v.base : null, key: y, tick: y + '년', label: Number.isFinite(v?.rate) ? Math.round(v.rate) + '번' : '고른 적 없음'})), {label: '해마다 100번에 몇 번 · 짧은 금 = 아무 회사', hero: true, cap: e.say}),
    mids: [], honest: honestOf(B), rows: e.rows, rowsTitle: '해마다', pro: e.pro,
    next: {href: '#/r/n', label: '가까운 회사 보기'}, asOf, S};
}
async function vNear() {
  const {B, S, asOf} = await base();
  const e = eNear({B}), rec = B?.near?.rec;
  return {title: '가까운 회사', tab: 2, kick: ymd(rec?.from) && ymd(rec?.to) ? ymd(rec.from) + '부터 ' + ymd(rec.to) + '까지' : '지난 기록', h1: '가까운 회사의 지난 기록', big: e.big,
    hero: waffle(rec?.rate, rec?.base, {label: '가까운 회사와 아무 회사 · 100번에 몇 번', hero: true, la: '가까운 회사', lb: '아무 회사', cap: e.say}), mids: [], honest: honestOf(B), pro: e.pro,
    next: {href: '#/j', label: '내 매매일지 보기'}, asOf, S};
}

/* ── 길 ── */
const ctx = {base, get, D, page, notFound, source, midCard, sixBox, proBox, cur, setCur, honestOf, STEPS, afterPaint};
const X21 = {base: async () => ({S: await get(D.S)}), get, // 21곳 쪽은 home-summary 만(느린 4G 첫 화면 — 꽃 · 돈 · 왜 자료는 회사 쪽에서)
   notFound, essBox, setCur, setFirst: c => { if (c) FIRST = c; }, fig: (kind, body, o = {}) => fig(kind, o.label ?? '', body, o)};
/** 길 위 회사(④) — 21곳 까닭 상자 · 다음은 출목표(⑤) */
async function coOnPath(code) {
  const v = await vCo(code); if (!v || !v.big) return v;
  const T = await load21(get).catch(() => null), c = T ? find21(T, code) : null;
  v.step = 4;
  if (c) { v.body = [reasonBox21(T, code), ...(v.body ?? [])]; v.next = {href: '#/c/' + code + '/more', label: '출목표와 수급은?', step: 5, k: '5 / 8'}; }
  else v.next = {href: '#/q/' + code, label: '내 이유는 무엇인가?', step: 6, k: '6 / 8'};
  return v;
}
async function route() {
  const hh = location.hash || '#/';
  const fw = forwardTo(location.search, hh);
  if (fw) { location.replace(fw); return; }
  const root = document.getElementById('su');
  const m = /^#\/(c|i|k|r|p|q|m)\/(.+)$/.exec(hh), t = /^#\/(b|k|r|p|q|j|m|f)$/.exec(hh);
  let v;
  try {
    const on21 = (!m && !t) || (t && (t[1] === 'm' || t[1] === 'f')) || (m && m[1] === 'm'); // 21곳 쪽은 꽃 · 돈 · 왜 자료를 기다리지 않음(주문 2044 느린 휴대폰 첫 화면)
    if (!FIRST && !on21) { const b0 = await base(); FIRST = firstCode(b0.bl, b0.mo); }
    if (on21) setTimeout(() => { base().catch(() => null); }, 2500); // 넷째 쪽(회사) 자료는 첫 화면 뒤에 미리 받아 둠
    if (!m && !t) v = await v21Home(X21);
    else if (t) v = t[1] === 'm' ? await vLand(X21) : t[1] === 'f' ? await vFriend(X21) : t[1] === 'r' ? await vHub() : t[1] === 'q' || t[1] === 'p' ? await (await whyM()).vQuiz(lastCo?.code ?? null, ctx) : t[1] === 'j' ? await (await whyM()).vJournal(ctx) : t[1] === 'k' && lastCo?.code ? await vCo(lastCo.code) : await vHome();
    else {
      const [, k, raw] = m; let a = raw; try { a = decodeURIComponent(raw); } catch { /* 그대로 */ }
      if (k === 'c' && /^[0-9A-Z]{6}\/more$/.test(a)) v = await vMore(X21, a.slice(0, 6));
      else if (k === 'm') v = await vLandOne(X21, a);
      else if (k === 'c' || k === 'k') v = await coOnPath(a);
      else if (k === 'i') v = await vInd(a);
      else if (k === 'r') v = a === 'm' ? await vMonths() : a === 'w' ? await vMiss() : a === 'd' ? await vDays() : a === 'y' ? await vYears() : a === 'n' ? await vNear() : CODE.test(a) ? (lastCo = lastCo?.code === a ? lastCo : {code: a, name: null, ind: null}, await vHub()) : notFound('이 기록을 찾지 못했어요.');
      else v = CODE.test(a) ? await (await whyM()).vQuiz(a, ctx) : notFound('이 회사를 찾지 못했어요.');
    }
  } catch (e) { console.error(e); v = notFound('화면을 그리다 멈췄어요. 다시 열어 주세요.'); }
  if (hh !== (location.hash || '#/')) return;
  root.replaceChildren(...page(v).filter(Boolean));
  afterPaint(root);
  window.scrollTo(0, 0);
  if (typeof v.later === 'function') v.later().catch(e => console.error(e));
}
try { if (localStorage.getItem('su-big-text') === '1') document.documentElement.classList.add('su-lg'); } catch { /* 저장소 없음 */ }
window.addEventListener('hashchange', route);
route();
