/* 테마 시계(#/ 맨 위 칸 · #/t/… 열아홉 쪽) — 사장님 2026-10-19(싱가포르) 16:06 「테마가 된 게 아니라 될 듯한 걸 찾아 주는 거야 … 이 본질이 중심이자 시작」 ·
   16:46 「클릭을 하면 물 흐르듯 … 다음다음다음이 제대로 이어지게 … 총 36장」 · 16:54 「이제 aaa7377.com에 올려 … 큰 구조는 건들이지 말고 더 스마트한 내부 시스템」
   견본 = docs/design/theme-2026-10-19/flow36/(서른여섯 장 · 사장님 승인) · 셈 = 결정표 docs/design/theme-2026-10-19/theme-engine.md(site/next/theme-engine.js · 올릴 때 /next/data/theme.json)
   이 파일은 그리기만 — 숫자는 theme.json · theme-more.json 그대로(화면에서 다시 세지 않음) · 글은 textContent 로만(보안 규칙) · 앞날 말 없음 · 사고팔기 권하지 않음
   길: #/t/hello 1 · (#/ 2 = 첫 화면 homeBlock) · how 3 · sprout 4 · bloom 5 · wilt 6 · i/<업종>[/path|spread|big|co|near] 7 ~ 12 · c/<번호>[/lead|why|rank|unknown|keep] 13 ~ 18 · today 36
   19 ~ 35 는 있는 쪽(#/why/<번호> · #/sub · #/why · #/me · #/game · #/shorts · #/jinhwa)이 맡음 — 그 쪽 맨 아래 「다음」 한 줄은 app.js flowFoot */
import {ZONES, DOT_TEXT, RULE, pp, zoneOf} from './theme-rule.js';
import {clock, dots, bar, row, simpleRow, recordLine, yearsOf, nextBtn, footBtn, indOf, homeBlock, SEASON} from './theme-home.js';
import {watchBtn, alertSwitch, ALERTS, watchList, toggleWatch, SAVE_FAIL} from './theme-watch.js'; // 관심 업종 · 사이트 안 알림(2026-10-19 「다해」) // 그림 조각 · 첫 화면 칸은 theme-home.js 한 곳
import {NAME, josa} from './brand.js'; // 이름 한 곳(규칙 76) — 새로 쓰는 글은 이름을 박지 않음
export {nextBtn, footBtn, homeBlock}; // app.js flowFoot(mod('theme').footBtn) · 옛 길

const nx = () => globalThis.NX;
const h = (...a) => nx().h(...a);
const sv = (...a) => nx().sv(...a);
const enc = s => encodeURIComponent(s);
const num = n => Number(n).toLocaleString('ko-KR');
const md = d => (typeof d === 'string' && /^\d{4}-\d{2}-\d{2}/.test(d) ? `${+d.slice(5, 7)}월 ${+d.slice(8, 10)}일` : '?');
const ymd = d => (typeof d === 'string' && /^\d{4}-\d{2}-\d{2}/.test(d) ? `${+d.slice(0, 4)}년 ${md(d)}` : '?'); // 해까지(여러 해에 걸친 기록 — 「6월 29일부터 9월 9일까지」가 두 달처럼 읽히던 것 · 감사 A12)
const cls = v => (!Number.isFinite(v) ? '' : Math.round(v * 10) === 0 ? 'fl' : v > 0 ? 'up' : 'dn');

/* ── 자료(한 번 받고 기억 · 못 받으면 15초 뒤 다시) ── */
const C = {};
function load(name) {
  const c = C[name]; if (c && (c.v || Date.now() - c.t < 15000)) return c.p;
  const p = fetch('/next/data/' + name, {cache: 'no-cache'}).then(r => (r.ok ? r.json() : null)).catch(() => null)
    .then(j => { const ok = j && typeof j.schema === 'string' && j.schema.startsWith('dori-theme-1'); C[name].v = ok ? j : null; return ok ? j : null; });
  C[name] = {p, v: null, t: Date.now()}; return p;
}
const okTheme = j => !!j && j.schema === 'dori-theme-1' && Array.isArray(j.inds) && j.order && j.count;
/** 첫 화면 자료 — app.js 공용 받기(need('theme') · 모듈과 같이 받음 · 15초 뒤 다시) */
export const themeData = () => (nx()?.need ? nx().need('theme').then(j => (okTheme(j) ? j : null)).catch(() => null) : load('theme.json'));
const moreData = () => load('theme-more.json');
const zw = z => ZONES[z] ?? '?';

/* ── 흐름(서른여섯 장 · 견본 flow36 차례) ── */
const CH = ['', '테마 시계', '업종 한 곳', '회사 한 곳', '왜 사? 열한 질문', '내 것', '돌이와 나'];
const IND_SUB = [['', null, 7], ['path', '지나온 길', 8], ['spread', '번지는 중일까', 9], ['big', '큰 회사도 움직였을까', 10], ['co', '함께 움직인 회사', 11], ['near', '이웃 업종', 12]];
const CO_SUB = [['', null, 13], ['lead', '먼저일까 뒤따름일까', 14], ['why', '왜 그럴까?', 15], ['rank', '업종 안 자리', 16], ['unknown', '아직 모르는 것', 17], ['keep', '관심 담기', 18]];
const ALERT_NO = 26; // 견본 flow36 26 쪽 「알림」(내 것 마당 · 관심 #/sub 다음 · 매매일지 #/why 앞)
const chOf = no => (no <= 6 ? 1 : no <= 12 ? 2 : no <= 18 ? 3 : no <= 24 ? 4 : no <= 30 ? 5 : 6);
/** 쪽 위 한 줄(‹ 앞 쪽 · 마당 n / 36) */
function pgBar(no, prev) {
  return h('div', {class: 'th-pg'},
    prev ? h('a', {class: 'th-back', href: prev[1], text: '‹ ' + prev[0]}) : h('span'), // 글 한 덩이 — 「‹」 를 따로 칸에 두면 글 시작 왼쪽 줄이 하나 더 생김([10] 7)
    h('p', {class: 'th-no'}, h('span', {class: 'th-ch', text: CH[chOf(no)]}), h('b', {text: String(no)}), h('span', {text: '/ 36'})));
}
const safe = () => h('p', {class: 'th-safe', text: '돌이는 지난 기록만 보여 줘요. 사고팔기를 권하지 않아요.'});
const say = t => h('p', {class: 'th-say'}, h('span', {class: 'th-who', text: '돌이'}), h('span', {text: t}));
const hd = (t, art) => h('div', {class: 'th-hd'}, h('h1', {class: 'th-h1', text: t}), h('img', {class: 'th-art', src: '/media/stone/' + art + '.svg', alt: '', width: 96, height: 77, decoding: 'async'}));
const asOf = TH => h('p', {class: 'th-asof', text: md(TH.asOf) + ' 장 마감 기준' + (TH.provisional ? ' · 장중 값이 섞여 있어요' : '')});
const none = (title, what = '테마 시계') => ({title, nodes: [h('div', {class: 'tc', 'data-page': 'theme'}, hd(title, 'home'), h('p', {class: 'empty', text: '? ' + what + ' 자료를 받지 못했어요. 잠시 뒤 다시 열어 주세요.'}), nextBtn('테마 시계', '#/', '처음으로'))]});
/** 자료는 왔는데 이 업종이 없음(이름이 바뀌었거나 빠짐 · 담아 둔 옛 관심 업종) — 「잠시 뒤 다시」가 아님(새 눈 검사 2026-10-19 22시) */
const gone = title => ({title, nodes: [h('div', {class: 'tc', 'data-page': 'theme'}, hd(title, 'home'), h('p', {class: 'empty', text: '? 이 업종은 지금 테마 시계 자료에 없어요.'}), nextBtn('테마 시계', '#/', '처음으로'))]});

/** 작은 선(1000 = 열흘 전) */
function spark(l, w = 96, ht = 36) {
  const s = sv('svg', {class: 'th-sp', viewBox: `0 0 ${w} ${ht}`, width: w, height: ht, 'aria-hidden': 'true'});
  if (!Array.isArray(l) || l.length < 2) return s;
  const lo = Math.min(...l), hi = Math.max(...l), y = v => ht - 4 - (v - lo) / (hi - lo || 1) * (ht - 8), x = k => 4 + k * (w - 8) / (l.length - 1); // 끝 점(반지름 3.5)이 잘리지 않게
  s.append(sv('polyline', {points: l.map((v, k) => x(k).toFixed(1) + ',' + y(v).toFixed(1)).join(' '), class: 'th-spl ' + (l[l.length - 1] >= l[0] ? 'up' : 'dn')}));
  s.append(sv('circle', {cx: x(l.length - 1).toFixed(1), cy: y(l[l.length - 1]).toFixed(1), r: 3.5, class: 'th-spd ' + (l[l.length - 1] >= l[0] ? 'up' : 'dn')}));
  return s;
}
/** 큰 선(회사 열하나 날 · 앞 닷새 회색 · 뒤 닷새 주황) */
function bigLine(l, w = 358, ht = 110) {
  const s = sv('svg', {class: 'th-line', viewBox: `0 0 ${w} ${ht}`, width: '100%', height: ht, 'aria-hidden': 'true'});
  if (!Array.isArray(l) || l.length < 3) return s;
  const lo = Math.min(...l), hi = Math.max(...l), y = v => ht - 6 - (v - lo) / (hi - lo || 1) * (ht - 12), x = k => 6 + k * (w - 12) / (l.length - 1), m = Math.floor(l.length / 2); // 끝 점(반지름 5)이 잘리지 않게
  const pts = a => a.map(([k, v]) => x(k).toFixed(1) + ',' + y(v).toFixed(1)).join(' '), P = l.map((v, k) => [k, v]);
  s.append(sv('line', {x1: x(m), y1: 0, x2: x(m), y2: ht, class: 'th-mid'}), sv('polyline', {points: pts(P.slice(0, m + 1)), class: 'th-l0'}), sv('polyline', {points: pts(P.slice(m)), class: 'th-l1'}), sv('circle', {cx: x(l.length - 1), cy: y(l[l.length - 1]), r: 5, class: 'th-l1d'}));
  return s;
}
/* ── 쪽들 ── */
function shell(no, title, art, sayT, prev, next, body, {pageKey = 'theme'} = {}) {
  return h('div', {class: 'tc', 'data-page': pageKey}, pgBar(no, prev), hd(title, art), sayT ? say(sayT) : null, ...body, next ? nextBtn(next[0], next[1], next[2]) : null, safe());
}
async function pHello() {
  // 2026-10-22 총정리(사장님 04:09 「결과부터 나오는 구조」 · 감사 A10): 맨 위 = 오늘 찾은 곳(싹 맨 앞 업종 · 점 수 · 누르면 그 업종 쪽) · 세 걸음 글은 첫 화면에 실제로 있는 것으로(「시계」 대신 줄 셋)
  const TH = await themeData(), top = TH ? indOf(TH, TH.order?.S?.[0]) : null;
  const found = !TH ? null : top ? h('a', {class: 'th-found', href: '#/t/i/' + enc(top.n)}, h('span', {class: 'th-fk', text: `오늘 ${josa(NAME, '가')} 찾은 곳`}), h('b', {class: 'th-fn', text: top.n}),
    h('span', {class: 'th-fd'}, h('span', {text: `점 넷 가운데 ${num(top.sc)}개`}), dots(top)), h('i', {class: 'th-go', 'aria-hidden': 'true', text: '›'})) // 글 먼저 · 점 그림은 뒤(글 시작 = 카드 글 시작 · [10] 7)
    : h('p', {class: 'th-sub th-key', text: '오늘은 싹 자리가 비었어요.'});
  const steps = [['첫 화면 줄 셋을 봐요', '시장보다 힘이 붙은 업종이에요'], ['업종 하나를 눌러요', '점 넷이 다 차면 진짜 싹이에요'], ['회사를 눌러요', '먼저 움직였는지, 뒤따랐는지']];
  return {title: '돌이 인사', nodes: [shell(1, '돌이', 'home', '테마가 될 듯한 곳을 찾아 줘요.', null, ['테마 시계', '#/'],
    [found, h('h2', {class: 'th-h2', text: '세 번만 누르면 돼요'}), h('ol', {class: 'th-steps'}, steps.map(([a, b], k) => h('li', {}, h('span', {class: 'th-sn', text: String(k + 1)}), h('span', {class: 'th-st'}, h('b', {text: a}), h('span', {text: b}))))),
      TH ? asOf(TH) : null])]};
}
async function pHow() {
  const TH = await themeData(); if (!TH) return none('시계 읽는 법');
  const R = TH.record, y = yearsOf(TH);
  const zones = [['Q', '아직 꽃 선 전이고, 지난 닷새는 시장보다 덜 올랐어요.'], ['S', '아직 꽃 선 전이지만, 지난 닷새는 시장보다 더 올랐어요.'], ['B', '꽃 선을 넘었고, 지난 닷새도 시장보다 더 올랐어요.'], ['W', '꽃 선을 넘었지만, 지난 닷새는 시장보다 덜 올랐어요.']]; // 결정표 2 그대로
  const byDots = (R?.byDots ?? []).map((b, k) => h('div', {class: 'th-rb'}, h('span', {class: 'th-rbk', text: '점 ' + k + '개'}), h('span', {class: 'th-rbb'}, rb(b.p)), h('b', {text: b.p == null ? '?' : Math.round(b.p) + '번'})));
  // 2026-10-22 총정리(사장님 04:09 「결과부터 나오는 구조」 · 감사 A11 · A12): 그림 위에 「무엇을 보라」 한 줄 · 성적표 머리 밑에 센 숫자 그대로의 결론 한 줄(판단 말 없음 · 「확률」 낱말 없음)
  const p4 = R?.byDots?.[4]?.p, pAll = R?.all?.p;
  const recKey = Number.isFinite(p4) && Number.isFinite(pAll) ? `점 넷이 다 찬 날은 100번 가운데 ${Math.round(p4)}번, 아무 업종은 ${Math.round(pAll)}번 한 달 뒤 꽃 선을 넘었어요.` : '? 아직 못 셌어요.';
  return {title: '시계 읽는 법', nodes: [shell(3, '시계 읽는 법', 'today', '네 자리만 알면 돼요.', ['테마 시계', '#/'], ['싹 자리 전부', '#/t/sprout'], [
    h('p', {class: 'th-sub th-key', text: `왼쪽 위 「싹」 칸을 ${josa(NAME, '가')} 먼저 봐요. 아직 덜 올랐지만 지난 닷새는 시장보다 더 오른 곳이에요.`}),
    h('div', {class: 'th-map'}, clock(TH), h('p', {class: 'th-cap'}, h('span', {text: '가로는 한 달 동안 시장보다 더 오른 만큼이에요.'}), h('span', {text: '세로는 지난 닷새 동안 시장보다 더 오른 만큼이에요.'}), h('span', {text: '한 달 동안 시장보다 5% 넘게 더 오르면 꽃 선을 넘어요.'}))),
    h('ol', {class: 'th-steps'}, zones.map(([z, t], k) => h('li', {}, h('span', {class: 'th-sn', text: String(k + 1)}), h('span', {class: 'th-st'}, h('b', {class: 'th-z ' + z, text: `${ZONES[z]} · ${SEASON[z]}`}), h('span', {text: t}))))), // 자리 이름 + 첫 화면 계절 말(봄 = 싹 — 두 이름을 잇는 곳 · 감사 A6)
    // 행성 열은 2026-10-21 18:22 「그랴」(17:51 「이렇기 행성 나오는것 지우고 … 장난스러워」)로 지움 — 시계의 업종은 작은 점
    h('h2', {class: 'th-h2', text: '점 넷'}),
    h('ol', {class: 'th-steps'}, [['시장보다 힘이 붙어요', '지난 닷새 시장보다 2% 넘게 더 올랐어요.'], [DOT_TEXT[1], '열흘 동안 2% 넘게 오른 회사가 절반 이상이에요.'], ['큰 회사도 움직여요', '가장 큰 회사 셋의 평균이 열흘 동안 1% 이상 올랐어요.'], ['값이 진짜로 올라요', '업종 값이 열흘 전보다 올랐어요.']]
      .map(([a, b], k) => h('li', {}, h('span', {class: 'th-sn', text: String(k + 1)}), h('span', {class: 'th-st'}, h('b', {text: a}), h('span', {text: b}))))),
    h('h2', {class: 'th-h2', text: '돌이 성적표'}),
    h('p', {class: 'th-sub th-key', text: recKey}),
    h('p', {class: 'th-sub', text: `지난 ${y ?? '?'}년 기록이에요. 싹 자리였던 날, 100번 가운데 몇 번이 한 달 뒤 꽃 선을 넘었을까?`}),
    h('div', {class: 'th-rbs'}, byDots, h('div', {class: 'th-rb all'}, h('span', {class: 'th-rbk', text: '아무 업종'}), h('span', {class: 'th-rbb'}, rb(R?.all?.p)), h('b', {text: R?.all?.p == null ? '?' : Math.round(R.all.p) + '번'}))),
    h('details', {class: 'th-fold'}, h('summary', {text: '돌이는 이렇게 셉니다'}),
      h('p', {text: `${ymd(TH.recFrom)}부터 ${ymd(TH.recTo)}까지, 업종마다 날마다 셌어요. 같은 업종의 이어진 날도 하루씩 셌어요.`}),
      h('p', {text: '지금 상장된 회사로만 셌어요. 큰 회사 셋은 오늘 몸값 차례로 지난날도 셌어요.'}),
      h('p', {text: '시장이 크게 내린 날 뒤에는 덜 내린 업종도 싹 자리에 많이 들어와요.'}),
      h('p', {text: '앞날을 맞히는 숫자가 아니에요. 지난 기록에서 센 횟수예요.'})),
  ])]};
}
function rb(p) { const s = sv('svg', {class: 'th-rbar', viewBox: '0 0 100 12', width: '100%', height: 12, preserveAspectRatio: 'none', 'aria-hidden': 'true'}); s.append(sv('rect', {x: 0, y: 0, width: 100, height: 12, rx: 6, class: 'th-bar0'}), sv('rect', {x: 0, y: 0, width: Number.isFinite(p) ? Math.max(0, Math.min(100, p)) : 0, height: 12, rx: 6, class: 'th-bar1'})); return s; }
/** 싹 목록 거르기(첫 화면 주황 숫자 — 2026-10-20 09:46) — real = 점 넷이 다 참(결정표 진짜 싹 · count.real) · new = 오늘 새로 들어옴(d 1 · count.fresh) */
const SPROUT_F = {real: ['진짜 싹', i => i.sc === 4, '점 넷이 다 찬 곳이에요.', '오늘은 진짜 싹이 없어요.'], new: ['새로 들어온 싹', i => i.d === 1, '오늘 싹 자리에 새로 들어왔어요.', '오늘 새로 들어온 싹은 없어요.']};
const DOT_WORD = ['없음', '하나', '둘', '셋', '넷'];
/** 싹 자리 전부 — 점 수 묶음(진짜 싹 · 점 셋 · 둘 · 하나 · 점 없음은 접음) · 줄 차례 = order.S 그대로(이어진 같은 점 수끼리 묶음) · 번호는 전체 차례
 *  2026-10-22 총정리(사장님 04:09 · 감사 A13): 37곳이 한 줄로 여섯 화면 · 점 0개도 같은 「봄」이던 것 → 결론(진짜 싹)이 맨 위 · 점 없는 곳은 접어 둠(지우지 않음) */
function sproutGroups(list) {
  const runs = [];
  list.forEach((i, k) => { const r = runs.at(-1); if (r && r.sc === i.sc) r.xs.push([i, k]); else runs.push({sc: i.sc, xs: [[i, k]]}); });
  return runs.map(({sc, xs}) => {
    const name = sc === 4 ? '진짜 싹 · 점 넷' : sc > 0 ? '점 ' + (DOT_WORD[sc] ?? sc) : '점 없음', label = `${name} · ${num(xs.length)}곳`, rows = h('div', {class: 'th-rows'}, xs.map(([i, k]) => row(i, k)));
    return sc > 0 ? h('section', {class: 'th-grp'}, h('h2', {class: 'th-gh', 'data-tr': '업종', text: label}), rows) : h('details', {class: 'th-grp th-gfold'}, h('summary', {'data-tr': '업종', text: label}), rows);
  });
}
async function pZone(z, f = '') {
  const F = z === 'S' && f ? SPROUT_F[f] : null;
  const TH = await themeData(); const T = F ? [F[0], 4, 'surge', F[2]] : {S: ['싹 자리 전부', 4, 'surge', '봄이 온 곳이 싹 자리예요. 점이 많이 찬 순서예요.'], B: ['꽃 자리', 5, 'cond', '이미 테마가 된 곳이에요.'], W: ['시듦 자리', 6, 'sub', '꽃이 지고 있는 곳이에요.']}[z]; // 싹 말풍선 = 첫 화면 「봄」과 이어 줌(감사 A6)
  if (!TH) return none(T[0]);
  const list = TH.order[z].map(n => indOf(TH, n)).filter(Boolean).filter(i => !F || F[1](i));
  const prev = F ? ['테마 시계', '#/'] : {S: ['시계 읽는 법', '#/t/how'], B: ['싹 자리 전부', '#/t/sprout'], W: ['꽃 자리', '#/t/bloom']}[z];
  const top = TH.order.S[0];
  const next = F ? ['싹 자리 전부', '#/t/sprout'] : {S: ['꽃 자리', '#/t/bloom'], B: ['시듦 자리', '#/t/wilt'], W: top ? [top, '#/t/i/' + enc(top)] : ['테마 시계', '#/']}[z];
  const body = [h('h2', {class: 'th-ans'}, h('span', {text: (F ? F[0] : zw(z) + ' 자리') + ' '}), h('em', {'data-tr': '업종', text: num(list.length) + '곳'}))]; // data-tr = 영어에서 업종 수(i18n.js 자리 표)
  if (z === 'B') body.push(h('p', {class: 'th-sub', text: '돌이는 꽃보다 싹을 먼저 봐요. 꽃은 이미 오른 곳이라 늦을 수 있어요.'}));
  if (z === 'W') body.push(h('p', {class: 'th-sub', text: '지난 닷새는 시장보다 덜 올랐어요. 다시 잠잠으로 갈까?'})); // 시듦의 까닭(닷새)을 머리 밑에(감사 A15)
  if (!list.length) body.push(h('p', {class: 'empty', text: F ? F[3] : '지금 이 자리에는 업종이 없어요.'}));
  else if (z === 'S' && !F) body.push(...sproutGroups(list)); // 싹 자리 전부 = 점 수 묶음(감사 A13 · 차례 order.S 그대로)
  else body.push(h('div', {class: 'th-rows'}, list.map((i, k) => (z === 'S' ? row(i, k) : simpleRow(i, {mode: z})))));
  if (z === 'B' && list.length) body.push(h('p', {class: 'th-cap2', text: '숫자는 한 달 동안 시장보다 더 오른 만큼이에요.'}));
  if (z === 'W' && list.length) body.push(h('p', {class: 'th-cap2', text: '큰 숫자는 닷새, 작은 숫자는 한 달이에요.'}));
  if (z === 'S' && !F) { const R = TH.record, y = yearsOf(TH); if (y && Number.isFinite(R?.sprout?.p) && Number.isFinite(R?.all?.p)) body.push(h('p', {class: 'th-sub', text: `싹 자리 전체는 지난 ${y}년 100번 가운데 ${Math.round(R.sprout.p)}번, 아무 업종은 ${Math.round(R.all.p)}번 한 달 뒤 꽃 선을 넘었어요.`})); } // 센 숫자 그대로(판단 말 없음)
  if (z === 'W') body.push(h('p', {class: 'th-sub', text: `잠잠 자리는 ${num(TH.count.Q)}곳이에요.`}));
  body.push(asOf(TH));
  return {title: T[0], nodes: [shell(T[1], T[0], T[2], T[3], prev, next, body)]};
}
/** 점 하나 줄 — href 가 있으면 그 근거 쪽 고리(줄 끝 ›) · 2026-10-22 총정리(감사 A17): ✓ 를 눌러도 근거로 안 가 「다음」을 두세 번 눌러야 했던 것 */
const ckRow = (ok, t, d, href = null) => h(href ? 'a' : 'div', {class: 'th-ck', href}, h('b', {class: ok ? 'y' : 'n', 'aria-label': ok ? '참' : '아님', text: ok ? '✓' : '✗'}), h('span', {class: 'th-st'}, h('span', {class: 'th-ckt', text: t}), d ? h('span', {class: 'th-ckd', text: d}) : null), href ? h('i', {class: 'th-go', 'aria-hidden': 'true', text: '›'}) : null);
/** 싹 자리 업종의 「한 달 뒤 꽃 선을 넘을까?」 바로 밑 — 같은 점 수였던 날의 지난 기록(결정표 6 · 앞날을 맞히는 숫자 아님 · 없으면 줄 없음)
 *  2026-10-22 총정리(사장님 04:09 · 감사 A18): 물음 옆에 지난 기록이 없어 앞날 맞히기 놀이처럼 읽히던 것 */
function recOf(TH, i) {
  if (i?.z !== 'S') return null;
  const y = yearsOf(TH), p = TH?.record?.byDots?.[i.sc]?.p, all = TH?.record?.all?.p;
  if (!y || !Number.isFinite(p) || !Number.isFinite(all)) return null;
  return h('p', {class: 'th-cap2', text: `지난 ${y}년, 싹 자리에서 점이 ${num(i.sc)}개였던 날은 100번 가운데 ${Math.round(p)}번 한 달 뒤 꽃 선을 넘었어요. 아무 업종은 ${Math.round(all)}번이었어요.`});
}
async function pInd(name, sub) {
  const [TH, TM] = await Promise.all([themeData(), moreData()]);
  const i = indOf(TH, name);
  if (!TH) return none(name || '업종');
  if (!i) return gone(name || '업종');
  const k = IND_SUB.findIndex(s => s[0] === sub); if (k < 0) return none(name, '이 쪽');
  const [, , no] = IND_SUB[k], M = TM?.inds?.[name] ?? null, base = '#/t/i/' + enc(name);
  const href = j => base + (IND_SUB[j][0] ? '/' + IND_SUB[j][0] : ''), title = j => IND_SUB[j][1] ?? name;
  const prev = k ? [title(k - 1), href(k - 1)] : ({S: ['싹 자리 전부', '#/t/sprout'], B: ['꽃 자리', '#/t/bloom'], W: ['시듦 자리', '#/t/wilt']}[i.z] ?? ['테마 시계', '#/']); // 들어온 목록으로(새 눈 검사 8)
  const lead = M?.top?.[0];
  const next = k < IND_SUB.length - 1 ? [title(k + 1), href(k + 1)] : lead ? [lead.n, '#/t/c/' + enc(lead.c)] : ['테마 시계', '#/'];
  let body = [], sayT = null, art = 'today';
  if (sub === '') {
    sayT = i.z === 'S' ? (i.d === 1 ? '싹 자리에 새로 들어왔어요.' : `싹 자리 ${num(i.d)}일째예요.`) : `${zw(i.z)} 자리 ${num(i.d)}일째예요.`;
    // 일곱 단 줄(2단 · 3단부터는 앞선 회사로 — 사장님 2026-10-20 12:59 「7단 클릭구조 … 토스증권처럼」) — 2026-10-22 총정리(감사 A22): 결론(점 넷 · ✓ 줄 · 물음) 뒤로(320 에서 결론이 화면 3분의 2 아래로 밀리던 것 · 돌 그림 크기는 그대로)
    const chapRow = lead && nx()?.chaps ? (nx().setTrail?.({code: lead.c, ind: name, name: lead.n}), nx().chaps(lead.c, '2')) : null;
    body = [h('h2', {class: 'th-ans'}, h('span', {text: '점 넷 가운데 '}), h('em', {text: num(i.sc) + '개'})), dots(i),
      ckRow(i.dots[0], DOT_TEXT[0], `지난 닷새 시장보다 ${pp(i.y)}%p`, base + '/path'), ckRow(i.dots[1], DOT_TEXT[1], `${num(i.tot)}곳 가운데 ${num(i.up)}곳이 2% 넘게 올랐어요`, base + '/spread'),
      ckRow(i.dots[2], DOT_TEXT[2], i.bigAvg == null ? '? 큰 회사 값을 못 받았어요' : `가장 큰 회사 셋 평균 ${pp(i.bigAvg)}%`, base + '/big'), ckRow(i.dots[3], DOT_TEXT[3], `열흘 동안 ${pp(i.m10)}%`, base + '/co'), // ✓ 줄 = 근거 쪽 고리(① 지나온 길 ② 번지는 중일까 ③ 큰 회사도 움직였을까 ④ 함께 움직인 회사 · 감사 A17)
      h('p', {class: 'th-sub', text: i.z === 'S' && i.sc === 4 ? '진짜 싹이에요. 한 달 뒤 꽃 선을 넘을까?' : i.z === 'S' ? '싹 자리지만, 점이 덜 찼어요. 꽃 선을 넘을까?' : i.z === 'B' ? '이미 꽃 자리예요. 늦은 건 아닐까?' : i.z === 'W' ? '꽃이 지는 중이에요. 다시 잠잠으로 갈까?' : '아직 잠잠해요. 힘이 붙을까?'}),
      recOf(TH, i), chapRow,
      watchBtn(i), h('a', {class: 'th-hi', href: '#/t/alert', text: '알림 설정 ›'})]; // 관심 업종 담기(자리가 바뀌면 첫 화면에서 알림)
  } else if (sub === 'path') {
    art = 'cal'; sayT = '닷새 동안 어디서 왔을까?';
    body = [h('div', {class: 'th-map'}, clock(TH, {hi: name}), h('p', {class: 'th-cap', text: '닷새 전부터 오늘까지 지나온 길이에요.'})),
      h('div', {class: 'th-list'}, (i.tz ?? []).map((z, j) => h('div', {class: 'th-li'}, h('span', {text: md(TH.days6?.[j])}), h('b', {class: 'th-z ' + z, text: zw(z)}), h('span', {class: 'th-cap2', text: `한 달 ${pp(i.t?.[j]?.[0])}%p`}))))];
  } else if (sub === 'spread') {
    art = 'surge'; sayT = '오른 회사가 늘고 있을까?';
    const mx = Math.max(1, ...i.sp), W = 326, H = 96, bw = W / i.sp.length;
    const s = sv('svg', {class: 'th-bars', viewBox: `0 0 ${W} ${H}`, width: '100%', height: H, 'aria-hidden': 'true'});
    i.sp.forEach((v, j) => { const hh = Math.max(4, Math.round(v / mx * (H - 8))); s.append(sv('rect', {x: (j * bw + 2).toFixed(1), y: H - hh, width: (bw - 4).toFixed(1), height: hh, rx: 2, class: j >= i.sp.length - 6 ? 'th-b1' : 'th-b0'})); });
    body = [h('h2', {class: 'th-ans'}, h('span', {text: `${num(i.tot)}곳 가운데 `}), h('em', {text: num(i.up) + '곳'})),
      h('p', {class: 'th-sub', text: `열흘 전보다 2% 넘게 오른 회사 수예요. 닷새 전에는 ${num(i.sp5)}곳, 가장 많을 때는 ${num(i.peak)}곳이었어요.`}), s,
      h('p', {class: 'th-cap2', text: '날마다 오른 회사 수 · 주황은 최근 엿새'}),
      h('div', {class: 'th-box'}, h('b', {text: i.dots[1] ? '절반 이상 올랐어요 ✓' : '아직 절반이 안 돼요 ✗'}), h('span', {text: '절반 이상이면 넓게 번졌다고 봐요.'}))];
  } else if (sub === 'big') {
    art = 'company'; sayT = '큰 회사가 같이 가야 힘이 세요.';
    body = [h('h2', {class: 'th-ans'}, h('span', {text: '큰 회사 셋 '}), h('em', {class: cls(i.bigAvg), text: i.bigAvg == null ? '?' : pp(i.bigAvg) + '%'})),
      h('p', {class: 'th-sub', text: '업종에서 몸값이 가장 큰 회사 셋의 열흘 평균이에요.'}),
      h('div', {class: 'th-list'}, (M?.big ?? []).map(b => h('a', {class: 'th-li', href: '#/t/c/' + enc(b.c)}, h('span', {text: b.rk + '. ' + b.n}), h('b', {class: cls(b.d10), text: b.d10 == null ? '?' : pp(b.d10) + '%'}), h('span', {class: 'th-cap2', text: '열흘'})))),
      h('div', {class: 'th-box'}, h('b', {text: i.dots[2] ? '큰 회사도 움직였어요 ✓' : '큰 회사는 아직이에요 ✗'}), h('span', {text: '셋 평균이 1% 넘게 올라야 움직였다고 봐요.'}))];
  } else if (sub === 'co') {
    art = 'company'; sayT = '누가 앞장섰을까?';
    body = [h('div', {class: 'th-list'}, (M?.top ?? []).map(c => h('a', {class: 'th-cor', href: '#/t/c/' + enc(c.c)}, h('span', {class: 'th-rn2', text: c.n}), h('b', {class: cls(c.d10), text: pp(c.d10) + '%'}), spark(c.l)))),
      h('p', {class: 'th-cap2', text: `열흘 동안 · ${num(M?.ranked ?? i.k)}곳 가운데 많이 오른 차례`})];
  } else if (sub === 'near') {
    art = 'cond'; sayT = '같은 무리 업종도 움직일까?';
    const same = (TH.inds ?? []).filter(o => o.g && o.g === i.g && o.n !== name).sort((a, b) => b.x - a.x || (a.n < b.n ? -1 : 1)); // 보이는 숫자(한 달) 차례
    const live = same.filter(o => o.z === 'S' || o.z === 'B').length;
    body = [h('h2', {class: 'th-ans'}, h('span', {text: (i.gn ?? '같은 무리') + ' '}), h('em', {'data-tr': '업종', text: num(same.length) + '곳'})),
      h('p', {class: 'th-sub', text: `그 가운데 싹이나 꽃 자리가 ${num(live)}곳이에요.`}), // 앞날 말(「함께 움직이면 테마가 커질 수 있어요」)은 지움 — 지난 사실에서 끝냄(2026-10-22 총정리 · 감사 A18 · 본질 3)
      h('div', {class: 'th-rows'}, same.map(o => simpleRow(o, {zone: true}))), h('p', {class: 'th-cap2', text: '숫자는 한 달 동안 시장보다 더 오른 만큼이에요.'})];
  }
  return {title: IND_SUB[k][1] ?? name, nodes: [shell(no, IND_SUB[k][1] ?? name, art, sayT, prev, next, [...body, asOf(TH)])]};
}
async function pCo(code, sub) {
  const [TH, TM] = await Promise.all([themeData(), moreData()]);
  if (!TH || !TM) return none('회사', '테마 시계');
  let ind = null, c = null;
  for (const [n, o] of Object.entries(TM.inds ?? {})) { const x = (o.top ?? []).find(t => t.c === code); if (x) { ind = n; c = x; break; } }
  if (!c) for (const [n, o] of Object.entries(TM.inds ?? {})) { const x = (o.big ?? []).find(t => t.c === code); if (x) { ind = n; c = {...x}; break; } } // 큰 회사 셋은 8곳 밖이어도 같은 칸(결정표 5 · v1.2)
  if (!c) return {title: '회사', nodes: [h('div', {class: 'tc', 'data-page': 'theme'}, hd('회사', 'company'), h('p', {class: 'empty', text: '이 회사는 테마 시계의 앞선 회사 줄에 없어요.'}), nextBtn('회사 자세히 보기', '#/w/' + enc(code)), safe())]};
  const k = CO_SUB.findIndex(s => s[0] === sub); if (k < 0) return none(c.n, '이 쪽');
  const I = indOf(TH, ind), M = TM.inds[ind], base = '#/t/c/' + enc(code), no = CO_SUB[k][2];
  const href = j => base + (CO_SUB[j][0] ? '/' + CO_SUB[j][0] : ''), title = j => CO_SUB[j][1] ?? c.n;
  const inTop = (M?.top ?? []).some(t => t.c === code);
  const prev = k ? [title(k - 1), href(k - 1)] : inTop ? ['함께 움직인 회사', '#/t/i/' + enc(ind) + '/co'] : ['큰 회사도 움직였을까', '#/t/i/' + enc(ind) + '/big']; // 들어온 줄로(새 눈 검사 8)
  const deep = sub2 => (nx()?.ready?.(sub2) ? '#/w/' + enc(code) + '/' + sub2 : '/atlas/#/c/' + enc(code) + '/' + sub2); // 4 ~ 7단(새 화면에 있으면 #/w/ · 아니면 옛 판 — app.js chapList 와 같음)
  nx()?.setTrail?.({code, ind, name: c.n}); // 이 회사의 4 ~ 7단 줄은 1 · 2 · 3 을 테마 쪽으로(app.js chapList)
  const next = k < CO_SUB.length - 1 ? [title(k + 1), href(k + 1)] : ['지나온 길', deep('past')]; // 회사 다음 = 4단 지나온 길(일곱 단 · 2026-10-20) — 7단 다음이 「사기 전에」(app.js chapNext)
  let body = [], sayT = null, art = 'company';
  const lead = c.a5 != null && I ? (c.a5 - I.A5) > (c.b5 - I.B5) : null;
  if (sub === '') {
    sayT = '먼저 움직였을까, 뒤따랐을까?';
    // 2026-10-22 총정리(사장님 04:09 「결과부터」 · 감사 A20): 말풍선 물음의 답(14쪽과 같은 셈 lead)이 머리 · 선 뜻 한 줄 · 열흘 값과 업종 안 자리는 작은 글로(오른 숫자가 머리이던 것)
    body = [h('h2', {class: 'th-ans', text: lead == null ? '? 아직 못 견줬어요' : lead ? '업종보다 먼저 움직였어요' : '업종을 뒤따라 움직였어요'}), h('p', {class: 'th-cap2', text: `${ind} 업종 회사예요.`}), bigLine(c.l),
      h('p', {class: 'th-cap2', text: '회색은 앞 닷새, 주황은 뒤 닷새예요.'}),
      h('p', {class: 'th-sub', text: `열흘 동안 ${pp(c.d10)}% · ` + (c.rank ? `${num(M.ranked)}곳 가운데 ${num(c.rank)}번째` : '업종에서 몸값이 큰 회사예요')})];
    if (nx()?.chaps) body.push(h('h2', {class: 'th-h2', text: '더 깊이 보기'}), h('p', {class: 'th-cap2', text: '누르면 일곱 단까지 가요.'}), nx().chaps(code, '3')); // 3단 = 일곱 칸 모두(1 테마 시계 · 2 업종 · 3 이 회사 · 4 지나온 길 · 5 누구와 다투나 · 6 앞으로 클까? · 7 범위) — 토스증권처럼 누르기만 하면 더 깊이
  } else if (sub === 'lead') {
    art = 'cal'; sayT = '앞 닷새와 뒤 닷새를 견줘요.';
    body = [bigLine(c.l), h('div', {class: 'th-two'}, h('p', {}, h('span', {text: '앞 닷새'}), h('b', {class: cls(c.a5), text: pp(c.a5) + '%'}), h('small', {text: '업종 ' + pp(I?.A5) + '%'})), h('p', {}, h('span', {text: '뒤 닷새'}), h('b', {class: cls(c.b5), text: pp(c.b5) + '%'}), h('small', {text: '업종 ' + pp(I?.B5) + '%'}))),
      h('h2', {class: 'th-ans', text: lead == null ? '? 아직 못 견줬어요' : lead ? '업종보다 먼저 움직였어요' : '업종을 뒤따라 움직였어요'}),
      h('p', {class: 'th-sub', text: '업종보다 더 오른 때가 앞 닷새면 먼저, 뒤 닷새면 뒤따름이에요.'})];
  } else if (sub === 'why') {
    // 2026-10-22 사장님 08:53 「… 원숭이 엉덩이는 빨개 빨가면 사과 … 11단계는 논리적으로 사방팔방으로 이야기 해야지 그 이야기를 움직이는 도식화로」(order-0853.txt)
    //   — 뻔한 셋 줄 대신 열한 걸음 이어 말하기(앞 걸음 끝말이 다음 물음 · 회사 → 지난날 → 업종 → 테마 시계 → 큰 회사 → 오른 회사 수 → 이웃 업종 → 뉴스 → 나) · 그림 = why-chain.js(별자리 선이 차례로) · 글 = why-co.js
    art = 'why'; sayT = '기록으로 찾은 것만 말해요.';
    const mods = await Promise.all([import('./why-chain.js'), import('./why-co.js')]).catch(() => null); // 15쪽에서만 받음(다른 테마 쪽 첫 그림을 무겁게 하지 않게)
    if (mods) {
      const [{whyChain}, {coSteps}] = mods, wc = whyChain(coSteps({c, ind, I, M, inds: TH.inds ?? [], past: deep('past')}));
      const go = (n = 0) => { if (wc.isConnected) wc.play(); else if (n < 120) requestAnimationFrame(() => go(n + 1)); }; // 쪽에 붙은 뒤 처음부터 움직임(움직임 줄이기 기기는 why-chain.css 가 멈춘 그림)
      requestAnimationFrame(() => go());
      body = [wc];
    } else body = [h('p', {class: 'empty', text: '? 열한 걸음을 받지 못했어요. 잠시 뒤 다시 열어 주세요.'})];
  } else if (sub === 'rank') {
    art = 'surge'; sayT = `${num(M.ranked)}곳 가운데 몇 번째일까?`;
    body = [h('h2', {class: 'th-ans'}, h('span', {text: '열흘 동안 '}), h('em', {text: c.rank ? num(c.rank) + '번째' : '?'})),
      h('div', {class: 'th-list'}, [...(M.top ?? []), ...(c.rank > (M.top ?? []).length ? [c] : [])].map(t => h('a', {class: 'th-li' + (t.c === code ? ' th-me' : ''), href: '#/t/c/' + enc(t.c)}, h('span', {text: t.rank + '. ' + t.n}), h('b', {class: cls(t.d10), text: pp(t.d10) + '%'}))))]; // 8곳 밖 회사(큰 회사 셋)는 제 줄을 맨 아래에
  } else if (sub === 'unknown') {
    art = 'sub'; sayT = '모르는 것도 꼭 말해요.';
    const R = TH.record;
    body = [h('div', {class: 'th-box'}, h('b', {text: '왜 올랐는지'}), h('span', {text: '뉴스를 아직 확인하지 않았어요.'})),
      h('div', {class: 'th-box'}, h('b', {text: '계속 오를지'}), h('span', {text: '많이 오른 곳은 크게 내리기도 해요.'})),
      h('div', {class: 'th-box'}, h('b', {text: '업종이 꽃이 될지'}), h('span', {text: R?.real?.p != null ? `진짜 싹도 100번 가운데 ${100 - Math.round(R.real.p)}번은 한 달 뒤 꽃 선을 넘지 못했어요.` : '싹 자리에서 다시 잠잠으로 가는 일도 많아요.'}))];
  } else if (sub === 'keep') {
    art = 'me'; sayT = '담아 두면 관심 칸에서 다시 봐요.';
    body = [h('h2', {class: 'th-ans', text: c.n}), nx().laterBtn(code, c.n, 'th-keep'), ...(I ? [watchBtn(I, `${ind} 자리가 바뀌면 알림 받기`)] : []), // 견본 18 쪽 — 업종 알림(사이트 안)
      h('a', {class: 'th-why', href: '#/why/' + enc(code)}, h('span', {class: 'th-nx'}, h('small', {text: '사기 전에는 열한 질문을 먼저 해요.'}), h('b', {text: '이 회사로 왜 사?'})), h('i', {'aria-hidden': 'true', text: '›'}))]; // 누를 수 없던 글을 열한 질문 고리로(본질 2 · 감사 A21 · 「다음」 단추는 그대로 하나)
  }
  return {title: CO_SUB[k][1] ?? c.n, nodes: [shell(no, CO_SUB[k][1] ?? c.n, art, sayT, prev, next, [...body, asOf(TH)])]};
}
/** 26 알림(견본 flow36 26 쪽) — 켜짐 넷 · 관심 업종 줄 · 사이트 안 알림이라는 것 그대로 */
async function pAlert() {
  const TH = await themeData(); if (!TH) return none('알림');
  const zOf = new Map((TH.inds ?? []).map(i => [i.n, i.z])), list = h('div', {class: 'th-wl'});
  /** 관심 업종 줄 — 빼면 다시 그림(머리 수 · 빈 줄 · 누름 자리는 다음 줄 빼기 단추 · 다 빼면 머리) · 지금 자료에 없는 업종은 고리 없이 까닭만(새 눈 검사 2026-10-19 22시) */
  const draw = (at = -1) => {
    const w = watchList();
    const rows = w.map((n, j) => {
      const z = zOf.get(n) ?? null, b = h('button', {class: 'th-sw', type: 'button', text: '빼기', 'aria-label': n + ' 빼기'});
      b.addEventListener('click', e => { e.preventDefault(); const r = toggleWatch(n); if (!r.ok) { nx()?.toast?.(SAVE_FAIL); return; } nx()?.toast?.('관심 업종에서 뺐어요.'); draw(j); });
      return h('div', {class: 'th-al'}, z ? h('a', {class: 'th-alt', href: '#/t/i/' + enc(n), text: n}) : h('span', {class: 'th-alt', text: n}), h('b', {class: 'th-z ' + (z ?? 'gone'), text: z ? zw(z) : '지금 자료에 없어요'}), b);
    });
    const head = h('h2', {class: 'th-ans', tabindex: '-1', 'data-tr': '업종', text: `관심 업종 ${num(w.length)}곳`});
    list.replaceChildren(head, w.length ? h('div', {class: 'th-als'}, rows) : h('p', {class: 'th-sub', text: '아직 담은 업종이 없어요. 업종 쪽에서 관심 업종에 담기를 눌러요.'}));
    if (at >= 0) (list.querySelectorAll('.th-al .th-sw')[Math.min(at, w.length - 1)] ?? head).focus();
  };
  draw();
  return {title: '알림', nodes: [shell(ALERT_NO, '알림', 'me', '자리가 바뀌면 알려요.', ['관심', '#/sub'], ['매매일지', '#/why'], [
    h('div', {class: 'th-als'}, ALERTS.map(([k, t]) => alertSwitch(k, t))), // 견본 26 쪽 차례 — 켜기 넷 먼저
    list,
    h('div', {class: 'th-box'}, h('b', {text: '돌이를 열면 첫 화면에서 알려요'}), h('span', {text: '이 기기에만 담겨요. 카톡으로 받기는 아직 준비 중이에요.'})),
    asOf(TH)])]};
}
async function pToday() {
  const [TH, TM] = await Promise.all([themeData(), moreData()]); if (!TH) return none('오늘 정리');
  const top = indOf(TH, TH.order.S[0]), lead = top ? TM?.inds?.[top.n]?.top?.[0] : null;
  return {title: '오늘 정리', nodes: [shell(36, '오늘 정리', 'home', '시계는 날마다 또 돌아요.', ['진화', '#/jinhwa'], ['테마 시계', '#/', '처음으로'], [
    h('ol', {class: 'th-steps'},
      h('li', {}, h('span', {class: 'th-sn', text: '1'}), h('span', {class: 'th-st'}, h('b', {text: `진짜 싹 ${num(TH.count.real)}곳`}), h('span', {text: `싹 자리 ${num(TH.count.S)}곳 가운데`}))),
      h('li', {}, h('span', {class: 'th-sn', text: '2'}), h('span', {class: 'th-st'}, h('b', {text: '맨 앞 싹'}), h('span', {text: top ? top.n : '없어요'}))),
      h('li', {}, h('span', {class: 'th-sn', text: '3'}), h('span', {class: 'th-st'}, h('b', {text: '그 안에서 앞선 회사'}), h('span', {text: lead ? `${lead.n} 열흘 ${pp(lead.d10)}%` : '없어요'})))),
    recordLine(TH), asOf(TH)])]};
}

/* ── 싹 달력(#/t/cal · 사장님 2026-10-22 11:55 「일 이 삼 찾아낸 것들 다 달력으로 … 제시만 해가지고 기록이 없으면 그건 하수야」 · 「구글 잡스라면」)
   결론 먼저(맨 위 = 한 달이 지난 날 가운데 1번이 꽃 선을 넘은 날 수 · 아무 업종과 나란히) → 누른 날의 1, 2, 3번(처음 = 마지막 날) → 달마다 달력(월 ~ 금 · 칸 = 날짜 · 1번 이름 · 셋의 한 달 뒤 표 · 새 달이 위)
   숫자는 /next/data/theme-cal.json 그대로(화면에서 다시 세지 않음 · 셈 = theme-engine.js calOf) · 앞날 말 없음 · 맞은 날도 못 맞은 날도 같은 크기로 ── */
const calData = () => load('theme-cal.json');
const HIT = {true: ['●', 'ok', '한 달 뒤 꽃 선을 넘었어요.'], false: ['○', 'no', '한 달 뒤 꽃 선을 못 넘었어요.'], null: ['·', 'wait', '아직 한 달이 안 지났어요.']};
const hitOf = v => HIT[v === true ? 'true' : v === false ? 'false' : 'null'];
const dowOf = d => new Date(d + 'T00:00:00Z').getUTCDay(); // 1 = 월 ~ 5 = 금(거래일만 있음)
async function pCal() {
  const [CAL, TH] = await Promise.all([calData(), themeData()]);
  const title = '싹 달력';
  const days = Array.isArray(CAL?.days) ? CAL.days.filter(x => typeof x?.d === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(x.d) && Array.isArray(x.top)) : [];
  if (!days.length) return none(title, '싹 달력');
  const done = days.filter(x => x.top.length && typeof x.top[0].hit === 'boolean'), hit1 = done.filter(x => x.top[0].hit).length;
  const all3 = done.flatMap(x => x.top.filter(i => typeof i.hit === 'boolean')), hit3 = all3.filter(i => i.hit).length, base = TH?.record?.all?.p;
  const head = h('div', {class: 'th-calsum'},
    h('p', {class: 'th-key', text: done.length ? `한 달이 지난 ${num(done.length)}일 가운데 1번이 꽃 선을 넘은 날은 ${num(hit1)}일이에요.` : '아직 한 달이 지난 날이 없어요.'}),
    done.length ? h('p', {class: 'th-sub', text: `세 곳 모두 세면 ${num(all3.length)}번 가운데 ${num(hit3)}번이에요.`}) : null,
    Number.isFinite(base) ? h('p', {class: 'th-sub', text: `아무 업종은 100번 가운데 ${Math.round(base)}번이었어요.`}) : null);
  const pick = h('div', {class: 'th-calpick', 'aria-live': 'polite'});
  const btns = [];
  const show = x => {
    btns.forEach(b => { const on = b.dataset.d === x.d; b.classList.toggle('on', on); b.setAttribute('aria-pressed', String(on)); });
    pick.replaceChildren(h('h2', {class: 'th-h2', text: `${md(x.d)} ${josa(NAME, '가')} 찾은 세 곳`}),
      x.top.length ? h('ol', {class: 'th-steps th-calli'}, x.top.map((i, k) => { const [mk, c, t] = hitOf(i.hit); return h('li', {}, h('span', {class: 'th-sn', text: String(k + 1)}),
        h('a', {class: 'th-st', href: '#/t/i/' + enc(i.n)}, h('b', {text: i.n}), h('span', {text: `닷새 동안 시장보다 ${pp(i.y)}%`}), h('span', {class: 'th-calhit ' + c}, h('i', {'aria-hidden': 'true', text: mk + ' '}), h('span', {text: t})))); }))
        : h('p', {class: 'th-sub', text: '이날은 싹 자리가 비었어요.'}));
  };
  const months = [];
  for (const x of days) { const m = x.d.slice(0, 7); if (!months.length || months.at(-1).m !== m) months.push({m, xs: []}); months.at(-1).xs.push(x); }
  const grid = months.map(({m, xs}) => {
    const cells = [];
    const lead = Math.min(4, Math.max(0, dowOf(xs[0].d) - 1)); for (let k = 0; k < lead; k++) cells.push(h('span', {class: 'th-calx', 'aria-hidden': 'true'}));
    let prev = null;
    for (const x of xs) {
      const w = dowOf(x.d);
      if (prev != null && w <= prev) { const pad = 5 - prev; for (let k = 0; k < pad; k++) cells.push(h('span', {class: 'th-calx', 'aria-hidden': 'true'})); for (let k = 1; k < w; k++) cells.push(h('span', {class: 'th-calx', 'aria-hidden': 'true'})); }
      else if (prev != null) for (let k = prev + 1; k < w; k++) cells.push(h('span', {class: 'th-calx', 'aria-hidden': 'true'}));
      prev = w;
      const b = h('button', {type: 'button', class: 'th-calc' + (x.k ? ' kept' : ''), 'data-d': x.d, 'aria-pressed': 'false', 'aria-label': x.top[0] ? `${md(x.d)} 1번 ${x.top[0].n}` : `${md(x.d)} 싹 자리 없음`},
        h('b', {class: 'th-cald', text: String(+x.d.slice(8, 10))}), h('span', {class: 'th-caln', 'data-proper': '', text: x.top[0]?.n ?? '없음'}),
        h('span', {class: 'th-calm', 'aria-hidden': 'true'}, x.top.map(i => { const [mk, c] = hitOf(i.hit); return h('i', {class: c, text: mk}); })));
      b.addEventListener('click', () => show(x));
      btns.push(b); cells.push(b);
    }
    return h('section', {class: 'th-calmo', 'aria-label': `${+m.slice(5, 7)}월`}, h('h2', {class: 'th-h2', text: `${+m.slice(0, 4)}년 ${+m.slice(5, 7)}월`}),
      h('div', {class: 'th-calg', role: 'group'}, ...['월', '화', '수', '목', '금'].map(t => h('span', {class: 'th-calw', 'aria-hidden': 'true', text: t})), ...cells));
  });
  const key = h('p', {class: 'th-calkey'}, h('span', {}, h('i', {class: 'ok', text: '●'}), h('span', {text: ' 넘음'})), h('span', {}, h('i', {class: 'no', text: '○'}), h('span', {text: ' 못 넘음'})), h('span', {}, h('i', {class: 'wait', text: '·'}), h('span', {text: ' 아직'})));
  show(days.at(-1));
  return {title, nodes: [h('div', {class: 'tc', 'data-page': 'theme'},
    h('div', {class: 'th-pg'}, h('a', {class: 'th-back', href: '#/', text: '‹ 테마 시계'}), h('span')), hd(title, 'today'),
    say(`날마다 ${josa(NAME, '가')} 찾은 세 곳을 남겨요.`), head, pick, key, ...grid.reverse(),
    typeof CAL.keepFrom === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(CAL.keepFrom) ? h('p', {class: 'th-sub th-calnote', text: `${md(CAL.keepFrom)}부터는 그날 장 마감 때 나온 세 곳을 바꾸지 않고 남겨요.`}) : null,
    h('p', {class: 'th-sub th-calnote', text: '그 전 날은 그날까지의 값만으로 지금 규칙을 다시 돌린 셋이에요. 한 달 동안 시장보다 5% 넘게 더 오르면 꽃 선을 넘어요.'}),
    TH ? asOf(TH) : null, nextBtn('시계 읽는 법', '#/t/how'), safe())]};
}

export async function render(arg = '') {
  const a = String(arg ?? ''), [k, x, y] = a.split('/');
  if (k === '' || k === 'hello') return pHello();
  if (k === 'how') return pHow();
  if (k === 'sprout') return x == null || x === '' || Object.hasOwn(SPROUT_F, x) ? pZone('S', x ?? '') : none('싹 자리 전부', '이 쪽'); // #/t/sprout/real · /new = 첫 화면 주황 숫자
  if (k === 'bloom') return pZone('B');
  if (k === 'wilt') return pZone('W');
  if (k === 'today') return pToday();
  if (k === 'cal') return pCal(); // 싹 달력(2026-10-22 11:55)
  if (k === 'alert') return pAlert();
  if (k === 'i' && x) return pInd(x, y ?? '');
  if (k === 'c' && /^[0-9A-Z]{6}$/.test(x ?? '')) return pCo(x, y ?? '');
  return none('테마 시계', '이 쪽');
}
export {zoneOf};
