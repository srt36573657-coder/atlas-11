/* 손자병법 첫 쪽(#/) — 빈 파일에서 새로 씀(주문 1115-1706) · 병법 서른여섯 가지만(주문 1115-1843)
   사장님 2026-11-15(마카오) 16:06 「이걸로 해서 기준을 잡고 만들어  정밀하게 순서가 맞게」 · 16:09 「응」 · 16:10 「이름도 손자 병법으로 변경해」
   · 16:32 「기존에 있던것 단 한나도 디자임 사용하지말고 완전 새로게 만들어」(원문 docs/design/sonja-ink-2026-11-15/order-1706.txt)
   · 17:43 「… 병법으로 주식해서 손실보지 않고 요즘 상황애 어떤 병벙으로 거래 해야 투자자들이 손실을 보지 않을 방법을 병법으로 풀어 내는 곳이다 … 기존애 돈모리는곳 불장 꽃은 다 삭제 하고 병법 36가지 만 표현 되개 해야 한다」 · 17:46 「응」(원문 docs/design/sonja-ink-2026-11-15/order-1843.txt)
   기준 = 샘플 사 「화제와 도장」(기준 한 장 docs/design/sonja-ink-2026-11-15/standard.md)
   차례: 머리 줄 · 표지(su-sonja-top.js — index.html 이 처음부터 듦) → 형세 보고(요즘 장을 병법의 땅으로) → 덜 잃은 꾀 차례(서른여섯 꾀 · 그 땅의 지난 기록으로 줄 세움) → 자세히(본질) → 끝 줄 → 이야기 막대 · 탭
   옛 불장 · 꽃이 될 · 돈이 몰리는 곳(지금 일곱 · 될 듯 일곱) · 조용한 힘 · 1 · 2 · 3등 · 오늘 이름이 오른 회사 · 칸 읽는 법 · 겹친 곳은 지움(17:43)
   한눈 판별 = 도장: 한 달 내림 = 짙은 남빛 찬 도장 + 흰 글 · 오름 = 옅은 먹 테 도장(빨강 없음 — 한국에서 빨강은 오름)
   보안 규칙: innerHTML 없음 · 글 속 style 없음 · 다른 주소 스크립트 없음 */
import {h, s} from '/su/su-fig.js';
import {NEED, ymd} from '/su/su-six.js';
import {NAME, josa} from '/next/brand.js';
import {essenceData, essenceLines, kstText} from '/next/essence.js';
import {hardLeft} from '/su/su-word.js'; // 풀이 없이 남은 어려운 낱말 셈(검사 · 보고가 main data-hard 를 셈 — 화면에는 안 붙임)
import {topBar, cover, stepDay, endSec as endLine, dockNav, tabNav, meanCap} from '/su/su-sonja-top.js';
import {PIC, PM} from '/su/su-sonja-mean.js'; // 그림 뜻 한 줄(주문 1116-1313 — 그림마다 맨 위)
import {landPic, kkoePic, arrowsPic, sonmuPic, brushBar} from '/su/su-sonja-ink.js'; // 먹그림(주문 1116-0118 — 글로 풀던 것을 옛 그림으로 · 한 사람 손무의 이야기) // 머리 줄 · 표지 = 자료 없이 먼저 칠하는 판(su.js 가 먼저 붙임 — 느린 휴대폰 첫 화면) · 끝 줄 · 이야기 막대 · 탭은 모든 쪽이 같은 판(주문 1115-2328)

export const CSS = '/su/su-sonja.css';
export const D21 = '/su/data/su21.json', D36 = '/su/data/su21-s36.json', DST = '/su/data/su21-settle.json'; // 첫 화면 자료 · 꾀 칸 자료(첫 칠함 뒤) · 정산 장부
export const LANDK = ['fall', 'shake', 'rise', 'narrow', 'calm'];
export const KN = ['', '한', '두', '세', '네', '다섯', '여섯', '일곱', '여덟', '아홉', '열']; // 잃은 몫 「열 번에 ○ 번」(lose10)
/** 첫 화면 자료(su21.json) — X.get 이 주소마다 한 번만 받음(옛 su-21.js load21 을 옮김 · 주문 1115-2328 옛 21곳 파일은 지움) */
export const load21 = get => get(D21);
/** 서른여섯 꾀 칸 수(꾀마다 앞 일곱까지) — 꾀 칸 자료가 없으면 null */
export const n36of = T => { const m = T?.s36n; if (!m || typeof m !== 'object') return null; const v = Object.values(m); return v.length === 36 && v.every(x => Number.isInteger(x) && x >= 0) ? v.reduce((a, x) => a + Math.min(7, x), 0) : null; };

export const fin = x => typeof x === 'number' && Number.isFinite(x);
export const NF = new Intl.NumberFormat('ko-KR');
export const won = v => NF.format(Math.round(v)) + '원';
export const mday = d => { const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(d ?? '')); return m ? +m[2] + '월 ' + +m[3] + '일' : null; };
export const ym = t => { const m = /^(\d{4})-(\d{2})-\d{2}$/.exec(String(t ?? '')); return m ? m[1] + '년 ' + +m[2] + '월' : null; };
export const day = d => ymd(d) ?? NEED;
export const w100 = r => (fin(r) ? (100 * (1 + r)).toFixed(1).replace(/\.0$/, '') + '원' : NEED);
/** 한 달 판별 — 꺾은선 처음(한 달 전)과 끝(그날)으로 · 값이 없으면 null */
export const monOf = sp => (!sp ? null : sp[sp.length - 1] < sp[0] ? 'dn' : sp[sp.length - 1] > sp[0] ? 'up' : 'eq');
export const MONW = {dn: '한 달 내림', up: '오름', eq: '같음'};

/* ── 작은 부품(새로 그림) ── */
/** 한 달 꺾은선(먹 선 · 한 달 전 값 점선 · 끝 점 = 내림 남빛 · 오름 먹) */
export function spark(sp, w = 96, hh = 34, cls = '') {
  const g = s('svg', {class: 'sj-sp' + (cls ? ' ' + cls : ''), viewBox: `0 0 ${w} ${hh}`, width: w, height: hh, 'aria-hidden': 'true', focusable: 'false'});
  if (!sp) return g;
  const P = 4, n = sp.length, lo = Math.min(...sp), hi = Math.max(...sp);
  const x = i => P + ((w - 2 * P) * i) / (n - 1), y = v => (hi === lo ? hh / 2 : P + (hh - 2 * P) * (1 - (v - lo) / (hi - lo)));
  const f = v => Math.round(v * 10) / 10, m = monOf(sp);
  g.append(s('path', {d: `M${P} ${f(y(sp[0]))}H${w - P}`, class: 'sj-sp0'}),
    s('path', {d: 'M' + sp.map((v, i) => f(x(i)) + ' ' + f(y(v))).join('L'), class: 'sj-sp1'}),
    s('circle', {cx: f(x(n - 1)), cy: f(y(sp[n - 1])), r: 3.6, class: 'sj-spe sj-spe-' + m}));
  return g;
}
/** 장 머리 — 위 여백의 붓 글씨 한 낱말 · 가는 세로 먹선 · 장 번호 · 제목(장마다 좌우 뒤집음) */
export const head = (bw, pno, title, flip = false, more = []) => h('div', {class: 'sj-sh' + (flip ? ' sj-flip' : '')},
  h('p', {class: 'sj-bw', 'aria-hidden': 'true', text: bw}), h('i', {class: 'sj-axis', 'aria-hidden': 'true'}),
  h('div', {class: 'sj-sht'}, h('p', {class: 'sj-pno', text: pno}), title, ...more));
export const endSeal = t => h('span', {class: 'sj-endseal', 'aria-hidden': 'true', text: t});

/* ── 자료 ── */
export const ok36 = (g, T) => !!g && g.schema === 'su21-s36-1' && Array.isArray(g.kinds) && g.kinds.length === 36 && !!g.lists && typeof g.lists === 'object' && g.asOf?.board === T?.asOf?.board
  && g.kinds.every(k => (g.lists[k] ?? []).length === T?.s36n?.[k]);
export const okSun = x => !!x && x.rule === 'sun-v1' && LANDK.includes(x.land) && Number.isInteger(x.m?.n) && x.m.n > 0 && Number.isInteger(x.m?.up) && x.m.up >= 0 && x.m.up <= x.m.n
  && typeof x.name === 'string' && typeof x.quote === 'string' && Array.isArray(x.rank) && x.rank.length === 36 && x.rank.every(r => typeof r?.k === 'string' && Number.isInteger(r.n));
export const sp36 = (g, code) => { const v = g?.line?.[code]; return v && Array.isArray(v.c) && v.c.length === 21 && v.c.every(x => fin(x) && x > 0) && fin(v.close) && v.close === v.c[20] && typeof v.date === 'string' && v.date === g?.asOf?.board ? v.c : null; };
const shakeSay = v => (!fin(v) ? null : v < 0.6 ? '평소의 절반쯤으로 잔잔해요' : v < 0.85 ? '평소보다 작아요' : v < 1.15 ? '평소와 비슷해요' : v < 1.5 ? '평소보다 커요' : '평소보다 훨씬 커요');
export const lose10 = r => { if (!r?.n) return null; if (!r.lose) return '한 번도 잃지 않았어요.'; const k = Math.round(r.lose / r.n * 10); return k ? '열 번에 ' + KN[k] + ' 번 잃었어요.' : '열 번에 한 번이 안 되게 잃었어요.'; };
export const none36 = w => (/거래량|사고판/.test(w ?? '') ? '그날 사고판 양을 받지 못해 고르지 못했어요.' : /꾀 뜻/.test(w ?? '') ? NONE36 : '지난 값이 모자라 고르지 못했어요.');
/** 세 거름을 다 지난 곳이 없는 꾀(주문 1116-1539 — 모자라면 모자란 대로 · 다른 곳으로 채우지 않음) */
export const NONE36 = '오늘은 꾀 뜻에 맞는 곳이 없어요. 다른 곳으로 채우지 않았어요.';
/* ── 세 거름(주문 1116-1539 · 사장님 2026-11-16(마카오) 14:39 「몬테카를로 … 10번 돌리고 코로 10번 돌리고 … 일곱 가지를 필터링 … 말이 같아야 될 거 아니야」) ──
   꾀마다 소거 열 가지 · 꾀 뜻 · 흉내 내 보기(값을 섞어 200번씩 10번)를 모두 지난 곳만 · 걸러진 수 = 자료 funnel(su21_s36.py lists36 full) */
export const PICK36 = 's36-v2';
export const fun36 = (g, k) => { const f = g?.funnel?.[k], L = g?.lists?.[k];
  return g?.pick?.rule === PICK36 && f && ['n', 'cut', 'mean', 'mc', 'all', 'k'].every(x => Number.isInteger(f[x]) && f[x] >= 0) && f.all <= Math.min(f.cut, f.mean, f.mc)
    && Math.max(f.cut, f.mean, f.mc) <= f.n && f.k === Math.min(7, f.all) && Array.isArray(L) && L.length === f.k ? f : null; };
export const LEAD36 = g => '삼십육계(옛 병법에 전하는 서른여섯 가지 꾀)마다, ' + (g?.pick?.rule === PICK36 ? '세 가지 거름을 모두 지난 곳 가운데 그 꾀를 가장 닮은 일곱 곳까지예요.' : '그날 그 꾀를 가장 닮은 일곱 곳이에요.');
export const funW = f => [['열 가지로 빼고 남은 곳', f.cut], ['꾀 뜻에 맞는 곳', f.mean], ['흉내 내 보기를 지난 곳', f.mc], ['셋 다 지난 곳', f.all]];
export const funK = f => (!f.all ? '셋 다 지난 곳이 없어 오늘은 고르지 않았어요.' : f.all > 7 ? '그 가운데 꾀를 가장 닮은 7곳을 골랐어요.' : '셋 다 지난 ' + f.all + '곳을 모두 골랐어요.');
/** 꾀 하나의 걸러진 수(고르는 법 칸 · 꾀 쪽) — 자료가 맞지 않으면 그리지 않음 */
export function funnel36(g, k) {
  const f = fun36(g, k); if (!f) return null;
  return h('div', {class: 'sj-fun', 'data-k': k},
    h('p', {class: 'sj-funl', text: '우량주 ' + f.n + '곳을 세 가지로 걸렀어요.'}),
    h('ol', {class: 'sj-funs'}, ...funW(f).map(([t, n], i) => h('li', {class: i === 3 ? 'sj-funall' : null}, h('span', {text: t}), h('b', {text: n + '곳'})))),
    h('p', {class: 'sj-funk', text: funK(f)}));
}
/** 세 거름 풀이(꾀 차례 센 법 칸) — 소거 열 가지 이름 · 꾀 뜻 · 흉내 내 보기 · 채우지 않음 */
export function pickHow(g) {
  const P = g?.pick; if (P?.rule !== PICK36 || !Array.isArray(P.cut) || !P.cut.length || !Number.isInteger(P.runs) || !Number.isInteger(P.paths)) return [];
  return [h('p', {class: 'sj-pick'}, h('b', {text: '하나, 빼기 ' + (KN[P.cut.length] ? KN[P.cut.length] + ' 가지' : P.cut.length + '가지')}), h('span', {text: ' — 이런 곳만 남겨요.'})),
    h('ul', {class: 'sj-pickcut'}, ...P.cut.map(t => h('li', {text: t}))),
    h('p', {class: 'sj-pick'}, h('b', {text: '둘, 꾀 뜻'}), h('span', {text: ' — 「고르는 법」에 적힌 값 모습과 맞아야 해요.'})),
    h('p', {class: 'sj-pick'}, h('b', {text: '셋, 흉내 내 보기'}), h('span', {text: ' — 지난 값을 섞어 ' + P.paths + '번씩 ' + P.runs + '번 다시 놓아 봐요. 우연으로 보기 어려울 때만 남겨요.'})),
    h('p', {class: 'sj-pick sj-picknone', text: '셋 다 지난 곳이 일곱 곳보다 적으면 적은 대로 둬요. 다른 곳으로 채우지 않아요.'})];
}
/* ── 1 머리 ── */
/* ── 2 표지 · 형세 보고 ── */
function sunSec(T) {
  const x = okSun(T.sun) ? T.sun : null;
  if (!x) return h('section', {class: 'sj-sec sj-sun sj-nosun', 'aria-label': '서른여섯 꾀'},
    h('h1', {class: 'sj-h1'}, h('span', {class: 'sj-h1a', text: '서른여섯 꾀'})),
    h('p', {class: 'sj-lead', text: day(T.asOf?.board) + ' 자료예요. 오늘 형세는 아직 세지 못해 꾀를 정한 차례로 놓았어요.'}));
  const m = x.m, P = (x.path ?? []).filter(k => LANDK.includes(k)).slice(-20), same = P.filter(k => k === x.land).length, upPart = m.up / m.n;
  const sh = shakeSay(m.shake), dd = mday(x.day);
  const up10 = Math.round(10 * upPart); // 깃발 열 가운데 선 깃발 = 오른 몫(열에 몇)
  return h('section', {class: 'sj-sec sj-sun', 'data-land': x.land, 'aria-label': '오늘의 형세 · ' + x.name},
    h('p', {class: 'sj-k', text: '제1장 땅을 살피다' + (dd ? ' · ' + dd + ' 마지막 값' : '')}),
    h('div', {class: 'sj-today'},
      h('h1', {class: 'sj-h1'}, h('span', {class: 'sj-h1a', text: '지금은 '}), h('b', {class: 'sj-land', text: x.name}), h('span', {class: 'sj-h1c', text: '이에요.'})),
      h('span', {class: 'sj-seal sj-seal-big ' + (x.land === 'fall' ? 'sj-seal-dn' : 'sj-seal-up'), 'aria-hidden': 'true', text: x.name})),
    h('figure', {class: 'sj-ink sj-landfig'}, meanCap(PM.land, 'figcaption'), landPic({land: x.land, name: x.name, up: up10, path: P, sameName: x.name, title: false})), // 손무가 언덕에서 오늘 땅을 내려다봄 · 깃발 열 · 디딤돌 스물
    h('blockquote', {class: 'sj-q'}, h('p', {text: '「' + x.quote + '」'}), h('cite', {text: '손자병법 ' + (x.pian ?? '')})),
    h('div', {class: 'sj-says'}, meanCap(PM.sonmu), h('span', {class: 'sj-saysp', 'aria-hidden': 'true'}, sonmuPic({w: 84, h: 100})), // 손무가 들려주는 한 줄
      h('p', {class: 'sj-do', 'data-say': '', text: (x.do ?? '') + ' 그래서 서른여섯 꾀를 덜 잃은 차례로 놓았어요.'})),
    h('details', {class: 'sj-drawer sj-nums'}, h('summary', {}, h('span', {class: 'sj-s1', text: '그림 속 숫자 자세히'}), chev()),
      h('ul', {class: 'sj-m'},
        h('li', {}, h('p', {class: 'sj-m1', text: m.n + '곳 가운데 ' + m.up + '곳이 한 달 전보다 올랐어요.'})),
        h('li', {}, h('p', {class: 'sj-m2', text: '한가운데 회사는 한 달 동안 100원이 ' + w100(m.mid) + '이 됐어요.'})),
        sh ? h('li', {}, h('p', {class: 'sj-m3', text: '요즘 스무 날 하루 오르내림은 ' + sh + '.'})) : null),
      P.length ? h('p', {class: 'sj-pc', text: '지난 ' + P.length + '거래일 가운데 ' + same + '날이 ' + x.name + '이었어요. 오른쪽 끝이 오늘이에요.'}) : null),
    x.lands && LANDK.every(k => typeof x.lands[k]?.rule === 'string') ? h('details', {class: 'sj-drawer sj-lands'},
      h('summary', {}, h('span', {class: 'sj-s1', text: '다섯 땅은 이렇게 나눠요'}), chev()),
      h('ol', {class: 'sj-ldl'}, ...LANDK.map(k => { const L = x.lands[k]; return h('li', {'data-land': k, class: 'sj-ld' + (k === x.land ? ' sj-ldnow' : '')},
        h('b', {text: L.name + (k === x.land ? ' · 지금' : '')}), h('p', {text: L.rule + (Number.isInteger(L.n) && x.hist?.days ? ' 지난 ' + x.hist.days + '거래일 가운데 ' + L.n + '날이었어요.' : '')}),
        h('p', {class: 'sj-ldq', text: '「' + L.quote + '」 손자병법 ' + L.pian})); })),
      h('p', {class: 'sj-ldp', text: '땅은 그날 마지막 값으로 가려요. 내일 땅을 맞히는 셈이 아니에요.'})) : null,
    h('p', {class: 'sj-safe', text: '지난 기록으로 본 모습이에요. 앞날을 맞히지 않고, 사고팔기를 권하지 않아요.'}),
    endSeal('형세'));
}
export const chev = () => s('svg', {class: 'sj-chev', viewBox: '0 0 24 24', 'aria-hidden': 'true', focusable: 'false'}, s('path', {d: 'M5 9l7 7 7-7'}));

/* ── 3 덜 잃은 꾀 차례(꾀 칸 자료는 첫 칠함 뒤에 받음 — 느린 휴대폰 첫 화면) ── */
function trickWait(T) {
  return n36of(T) != null ? h('section', {class: 'sj-sec sj-s36 sj-wait', 'aria-hidden': 'true', 'data-wait': ''}) : null;
}
export function rec36(r, more = false) {
  if (!r) return [];
  if (!r.n) return [h('p', {class: 'sj-tl sj-tnorec', text: '지난 기록을 세지 못했어요. 그날 사고판 양 자료가 있어야 세요.'})];
  const k = r.lose ? Math.max(1, Math.round(r.lose / r.n * 10)) : 0;
  return [h('figure', {class: 'sj-ink sj-arw'}, meanCap(PM.arrows, 'figcaption'), arrowsPic(k)), // 화살 열 가운데 꺾인 화살 = 잃은 몫(옛 점 열 칸 대신) · 맨 위 그림 뜻(주문 1116-1313)
    h('p', {class: 'sj-tl'}, h('b', {text: lose10(r)}), h('span', {text: ' ' + r.n + '번 가운데 ' + r.lose + '번'})),
    more ? h('details', {class: 'sj-drawer sj-recmore'}, h('summary', {}, h('span', {class: 'sj-s1', text: '잃은 주 · 모든 주 자세히'}), chev()),
      r.lose ? h('p', {class: 'sj-tl2', text: '잃은 주는 평균 100원이 ' + w100(r.avgLoss) + '이 됐어요. 가장 크게 잃은 주는 ' + w100(r.worst) + '이었어요.'}) : null,
      h('p', {class: 'sj-tl3', text: '모든 주를 고르면 평균 100원이 ' + w100(r.avg) + '이에요.'})) : null];
}
/** 꾀 그림 단추(누르면 그 꾀 쪽 · 소리 읽기는 꾀 이름 줄이 맡음 — 그림 단추는 건너뜀) */
export const kkoeTile = (k, name, cls = 'sj-tkpic', w = 200, hh = 150) => h('a', {class: cls, href: '#/k/' + k, tabindex: '-1', 'aria-hidden': 'true'}, kkoePic(k, {w, h: hh, label: name + ' 그림'}));
export function chip(g, c, bd, ov) {
  const code = String(c.code ?? ''), name = String(c.name ?? NEED), dz = Number.isInteger(c.days) && c.days >= 1 ? c.days : null, sp = sp36(g, code), n = ov && Number.isInteger(c.n) ? c.n : null, m = monOf(sp);
  return h('li', {}, h('a', {class: 'sj-chip' + (ov ? ' sj-chip-ov' : ''), href: '#/c/' + encodeURIComponent(code), 'data-code': code, 'data-days': dz ? String(dz) : null, 'data-n': n ? String(n) : null, 'data-mon': m ?? 'na',
    'aria-label': name + (n ? ' · ' + n + '묶음' : '') + (dz ? ' · ' + dz + '일째' : '') + (sp ? ' · 한 달 전 ' + won(sp[0]) + ' · ' + (bd ? bd + ' ' : '') + '마지막 값 ' + won(sp[20]) + ' · ' + MONW[m] : '')},
    h('b', {text: name}), h('span', {class: 'sj-chipi'}, n ? h('span', {class: 'sj-chipn', text: n + '묶음'}) : null, h('span', {class: 'sj-chipd', text: dz ? dz + '일째' : ''})), sp ? spark(sp, 64, 26, 'sj-sps') : null, m ? h('i', {class: 'sj-chipm sj-chipm-' + m, 'aria-hidden': 'true', text: m === 'dn' ? '내림' : m === 'up' ? '오름' : '같음'}) : null));
}
/* ── 큰 갈래 차례(주문 1116-1601 · 사장님 2026-11-16(마카오) 15:01 어떤 분 의견 「서른 여섯가지의 답에 나오는 회사들이 큰 테마로 보면 … 1~5위 … 등수 별로 오르고 내린 주식의 평균 퍼센트」 · 「이작업도 같이해」) ──
   서른여섯 꾀 답에 나온 회사를 같은 일 하는 회사끼리(판 업종 묶음) 모음 · 회사가 많이 나온 차례(같으면 꾀 답에 나온 번 · 많이 오른 차례가 아님) · 갈래마다 한 달 동안 100원이 평균 ○원(「%」 대신) · 오른 곳 · 내린 곳 · 회사들 */
export const okTheme = r => !!r && typeof r.name === 'string' && r.name !== '' && Number.isInteger(r.hits) && r.hits > 0 && Number.isInteger(r.n) && r.n > 0 && Array.isArray(r.codes) && r.codes.length === r.n
  && [r.up, r.dn, r.m].every(v => Number.isInteger(v) && v >= 0) && r.up + r.dn <= r.m && r.m <= r.n && (r.avg === null || (fin(r.avg) && r.avg > 0));
export const thRows = g => (g?.themes?.rule === 'themes-v1' && Array.isArray(g.themes.rows) ? g.themes.rows.filter(okTheme).slice(0, 5) : []);
export const thSt = r => (!fin(r.avg) ? 'na' : r.avg > 1 ? 'up' : r.avg < 1 ? 'dn' : 'eq');
export const thUd = r => '오른 곳 ' + r.up + ' · 내린 곳 ' + r.dn + (r.m - r.up - r.dn ? ' · 그대로 ' + (r.m - r.up - r.dn) : '');
export const thV = r => (fin(r.avg) ? '한 달 동안 100원이 평균 ' + w100(r.avg - 1) + '이 됐어요.' : '한 달 값이 모자라 평균을 못 셌어요.');
function themesBox(g) {
  const R = thRows(g); if (!R.length) return null;
  const in7 = code => g.kinds.filter(k => (g.lists[k] ?? []).slice(0, 7).some(c => c?.code === code)).length;
  const nameOf = code => { for (const k of g.kinds) { const c = (g.lists[k] ?? []).find(x => x?.code === code); if (c?.name) return String(c.name); } return NEED; };
  const mx = Math.max(0, ...R.filter(r => fin(r.avg)).map(r => Math.abs(r.avg - 1)));
  return h('div', {class: 'sj-th', 'data-n': String(R.length)},
    h('h3', {class: 'sj-h3 sj-thh3', text: '꾀가 고른 회사, 큰 갈래 차례'}),
    h('p', {class: 'sj-thlead', text: '서른여섯 꾀 답에 회사가 많이 나온 갈래부터 ' + R.length + '가지예요. 같은 일 하는 회사끼리 묶었어요.'}),
    meanCap(PM.themes), // 붓 막대 그림 뜻 — 줄 맨 위 한 번(주문 1116-1313)
    h('ol', {class: 'sj-thl'}, ...R.map((r, i) => h('li', {class: 'sj-thr', 'data-g': r.name, 'data-hits': String(r.hits), 'data-n': String(r.n), 'data-st': thSt(r)},
      h('p', {class: 'sj-thh'}, h('span', {class: 'sj-thn', text: String(i + 1)}), h('b', {class: 'sj-thg', text: r.name}), h('span', {class: 'sj-thc', text: '나온 회사 ' + r.n + '곳 · 꾀 답에 ' + r.hits + '번'})), // 「회사」로 시작하면 「의료기기」 뒤에 붙어 「기회」로 읽힘(쓰지 않을 말)
      brushBar(fin(r.avg) && r.avg !== 1 ? r.avg - 1 : null, mx, {cls: 'sj-thbar'}), // 그대로(100원 → 100원)면 획 없음
      h('p', {class: 'sj-thv', text: thV(r)}),
      h('p', {class: 'sj-thud', text: thUd(r)}),
      h('details', {class: 'sj-drawer sj-thd'}, h('summary', {}, h('span', {class: 'sj-s1', text: '이 갈래 회사 ' + r.n + '곳'}), chev()),
        h('ul', {class: 'sj-thcos'}, ...r.codes.map(code => h('li', {}, h('a', {class: 'sj-thco', href: '#/c/' + encodeURIComponent(String(code)), 'data-code': String(code)},
          h('b', {text: nameOf(code)}), h('span', {text: '꾀 ' + in7(code) + '가지'}))))))))),
    h('p', {class: 'sj-thnote', text: '많이 나온 차례예요. 많이 오른 차례가 아니에요.'}));
}
function trickSec(g, T) {
  const sun = okSun(T.sun) ? T.sun : null, N = g.kinds.reduce((a, k) => a + Math.min(7, (g.lists[k] ?? []).length), 0), dd = mday(g?.asOf?.data) ?? mday(T.asOf?.board), bd = mday(g?.asOf?.board);
  const anySp = g.kinds.some(k => (g.lists[k] ?? []).slice(0, 7).some(c => sp36(g, String(c?.code ?? ''))));
  const S = sun && sun.rank.every(r => g.kinds.includes(r.k)) && new Set(sun.rank.map(r => r.k)).size === 36 ? sun : null;
  const order = S ? S.rank.map(r => r.k) : g.kinds, RB = S ? Object.fromEntries(S.rank.map((r, i) => [r.k, {...r, i: i + 1}])) : {};
  const one36 = k => { const L = (g.lists[k] ?? []).slice(0, 7), r = RB[k];
    return h('li', {class: 'sj-tk', 'data-k': k, 'data-n': String(L.length), 'data-rank': r ? String(r.i) : null},
      meanCap(PIC[k]), kkoeTile(k, g.name?.[k] ?? k), // 그림 뜻 한 줄 → 꾀 그림(주문 1116-1313)
      h('a', {class: 'sj-tkh', href: '#/k/' + k, 'aria-label': (r ? '차례 ' + r.i + ' · ' : '') + (g.name?.[k] ?? k) + ' · 이 꾀 자세히'}, r ? h('span', {class: 'sj-rk', text: String(r.i)}) : null,
        h('p', {class: 'sj-tn'}, h('b', {text: g.name?.[k] ?? k}), h('span', {text: ' ' + (g.han?.[k] ?? '') + ' · ' + L.length + '곳'})), h('i', {class: 'sj-tkgo', 'aria-hidden': 'true', text: '›'})), // 꾀 이름을 누르면 그 꾀 쪽(주문 1115-2328)
      ...rec36(r),
      L.length ? h('ul', {class: 'sj-chips'}, ...L.map(c => chip(g, c, bd, false))) : h('p', {class: 'sj-tnone', text: none36(g.why?.[k])}), // 회사 단추는 바로 보임(사장님 2026-11-16 01:56 「지금 7곳이라고 클릭해야 나오잖아 바로 종목들이 나오개 해」)
      h('details', {class: 'sj-drawer sj-cos'}, h('summary', {}, h('span', {class: 'sj-s1', text: '고르는 법'}), chev()), // 긴 풀이만 접은 칸(주문 1116-0118)
        h('p', {class: 'sj-say', text: g.say?.[k] ?? ''}), funnel36(g, k))); }; // 세 거름을 지난 수(주문 1116-1539)
  const H = S ? S.hist : null, TOP = 7;
  return h('section', {class: 'sj-sec sj-s36', 'aria-label': (S ? '덜 잃은 꾀 차례 · ' : '') + '서른여섯 꾀 ' + N + '칸', 'data-n': String(N), 'data-order': S ? 'sun' : 'kind'},
    head('꾀', '제2장', h('h2', {class: 'sj-h2'}, h('span', {class: 'sj-brush', text: S ? '덜 잃은 꾀 차례' : '서른여섯 꾀'}), h('span', {class: 'sj-h2n', text: ' ' + N + '칸'})), true),
    S?.rankQ ? h('blockquote', {class: 'sj-q'}, h('p', {text: '「' + S.rankQ.quote + '」'}), h('cite', {text: '손자병법 ' + S.rankQ.pian})) : null,
    themesBox(g), // 큰 갈래 차례(주문 1116-1601) — 꾀 서른여섯을 하나하나 보기 전에 한눈에
    h('ol', {class: 'sj-tricks'}, ...order.slice(0, TOP).map(one36)),
    order.length > TOP ? h('details', {class: 'sj-drawer sj-tmore'}, h('summary', {}, h('span', {class: 'sj-s1', text: (S ? (TOP + 1) + '번째부터 ' + order.length + '번째까지 ' : '나머지 ') + '꾀 ' + (order.length - TOP) + '가지 더 보기'}), chev()),
      h('ol', {class: 'sj-tricks'}, ...order.slice(TOP).map(one36))) : null,
    h('details', {class: 'sj-drawer sj-how'}, h('summary', {}, h('span', {class: 'sj-s1', text: '꾀 차례는 이렇게 셌어요'}), chev()), // 센 법 · 고른 날(긴 풀이는 접은 칸 — 주문 1116-0118)
      h('p', {class: 'sj-lead', text: LEAD36(g)}),
      ...pickHow(g), // 세 거름 풀이(주문 1116-1539)
      S && H ? h('p', {class: 'sj-rule', text: (H.all ? '지난 ' + H.days + '거래일을 모두 보고, ' : '지난 ' + H.days + '거래일 가운데 오늘처럼 ' + S.name + '이었던 ' + H.same + '날을 골라, ')
        + '꾀마다 고른 일곱 곳을 닷새 뒤 값과 견줬어요. 잃은 번이 적은 꾀가 위예요.' + (ym(H.from) && ym(H.to) ? ' 센 때는 ' + ym(H.from) + '부터 ' + ym(H.to) + '까지예요.' : '')}) : null,
      h('p', {class: 'sj-dayl', text: (dd ? dd + ' 마지막 값으로 골랐어요. ' : '') + (anySp ? '이름 옆 꺾은선은 한 달, 점선은 한 달 전 값이에요. ' : '') + '같은 회사가 여러 꾀에 들 수 있어요.' + (mday(g.daysFrom) ? ' 며칠째는 ' + mday(g.daysFrom) + ' 기록부터 셌어요.' : '')}),
      h('p', {class: 'sj-note', text: '화살 열은 지난 같은 땅 싸움 열 번이에요. 꺾인 화살이 잃은 몫이에요.'})),
    h('p', {class: 'sj-safe', text: '지난 기록을 센 차례예요. 앞날을 맞히지 않고, 사고팔기를 권하지 않아요.'}),
    h('a', {class: 'sj-go', href: '#/r/t'}, h('span', {text: '서른여섯 꾀 정산 보기'}), h('i', {'aria-hidden': 'true', text: '›'})),
    endSeal('꾀'));
}

/* ── 4 자세히(눌러야 열림 — 이 쪽이 어떤 곳인지 · 본질 세 줄) ── */
function moreBox(S) {
  const lines = essenceLines(essenceData({summary: S}));
  return h('details', {class: 'sj-drawer sj-more'},
    h('summary', {}, h('span', {class: 'sj-s1', text: '자세히'}), h('span', {class: 'sj-s2', text: josa(NAME, '는') + ' 이런 곳이에요'}), chev()),
    h('div', {class: 'sj-morein'},
      h('section', {class: 'sj-mbox sj-ess', 'aria-label': NAME + ' 본질'}, h('h3', {class: 'sj-h3', text: josa(NAME, '는') + ' 이런 곳이에요'}), h('ol', {}, lines.map((t, i) => h('li', {'data-ess': String(i + 1), text: t})))),
      h('p', {class: 'sj-note', text: '꾀 차례는 그날 마지막 값과 지난 기록으로 셌어요. 앞날을 맞히는 차례가 아니에요.'})));
}

/* ── 11 끝 줄 ── */
function endSec(T, S) { return endLine(day(T.asOf?.board), S?.fetchedAt ? kstText(S.fetchedAt) : null); }

/* ── 12 이야기 막대 · 13 탭(모든 쪽이 같은 판 — su-sonja-top.js · 주문 1115-2328) ── */
/** 첫 쪽 다음 단추 — 덜 잃은 차례 맨 위 꾀(형세가 없으면 꾀 모음) */
const firstKkoe = T => (okSun(T?.sun) ? T.sun.rank[0]?.k ?? null : null);
const nextOf = T => { const k = firstKkoe(T); return {href: '#/k/' + (k ?? 'g01'), k: '2 / 5', label: k ? '맨 위 꾀는 어떤 꾀인가?' : '첫째 꾀는 어떤 꾀인가?'}; }; // 형세가 없으면 삼십육계 첫째 꾀(길 다섯 화면은 늘 그대로)

/* ── 쪽 ── */
/** 첫 쪽 — {title, dom: [머리, 본문, 이야기 막대, 탭], after()} · su.js route 가 이것만 붙임(옛 page() · afterPaint() 를 거치지 않음) */
/** 첫 쪽 본문 — shell(su-sonja-top.js sonjaShell 이 먼저 칠한 머리 줄 · 표지)이 붙어 있으면 그 main 뒤에 본문을 이어 붙임(표지를 다시 그리지 않음) */
export async function vSonja(X, shell = null) {
  const [{S}, T] = await Promise.all([X.base(), load21(X.get)]);
  if (!T) return null;
  const wait = trickWait(T);
  const dd = mday((okSun(T.sun) ? T.sun.day : null) ?? T.asOf?.board), body = [sunSec(T), wait, moreBox(S), endSec(T, S)];
  const keep = !!shell?.main?.isConnected, main = keep ? shell.main : h('main', {class: 'sj-page', 'data-page': 'sonja', 'data-wait': ''}, cover(null)); // data-wait — 꾀 칸을 채우면 뗌(검사가 기다림)
  main.setAttribute('data-board', T.asOf?.board ?? ''); main.setAttribute('data-wait', '');
  const step = main.querySelector(':scope > .sj-cover .sj-step'); if (step && dd && !step.querySelector('.sj-stepd')) step.append(stepDay(dd));
  main.append(...body);
  const hardOf = () => { const c = main.cloneNode(true); for (const e of c.querySelectorAll('svg, [aria-hidden="true"], [data-proper]')) e.remove(); const left = hardLeft(c.textContent ?? '', []); main.dataset.hard = String(left.length); main.dataset.hardWords = left.join(','); main.dataset.glossed = ''; };
  hardOf();
  const after = async () => { // 꾀 칸(su21-s36.json) — 첫 칠함 뒤에 받아 채움
    if (!wait) { main.removeAttribute('data-wait'); return; }
    const g = await X.get(D36).catch(() => null);
    if (!wait.isConnected) return;
    if (ok36(g, T)) wait.replaceWith(trickSec(g, T)); else wait.remove();
    hardOf(); main.removeAttribute('data-wait');
  };
  const dock = dockNav(1, nextOf(T)), tabs = tabNav(0, X.cur?.()?.code ?? null);
  return {title: '오늘', keep, dom: [keep ? shell.top : topBar(), main, dock, tabs], rest: [dock, tabs], after}; // keep = 먼저 칠한 판에 이어 붙임(su.js 는 rest 만 붙임)
}
