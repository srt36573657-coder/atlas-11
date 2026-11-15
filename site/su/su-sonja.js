/* 손자병법 첫 쪽(#/) — 빈 파일에서 새로 씀(주문 1115-1706)
   사장님 2026-11-15(마카오) 16:06 「이걸로 해서 기준을 잡고 만들어  정밀하게 순서가 맞게」 · 16:09 「응」 · 16:10 「이름도 손자 병법으로 변경해」
   · 16:32 「기존에 있던것 단 한나도 디자임 사용하지말고 완전 새로게 만들어」(원문 docs/design/sonja-ink-2026-11-15/order-1706.txt)
   기준 = 샘플 사 「화제와 도장」(docs/design/ink36-2026-11-15/sample-3a.html · 기준 한 장 docs/design/sonja-ink-2026-11-15/standard.md)
   차례 = 옛 첫 쪽 그대로: 머리 → 형세 보고 → 덜 잃은 꾀 차례 → 오늘 이름이 오른 회사 → 오늘의 1 · 2 · 3등 → 칸 하나 읽는 법
          → 불장 · 꽃이 될 · 돈이 몰리는(지금 일곱 → 될 듯 일곱) → 조용한데 힘이 모이는 → 지금 · 될 듯 두 단추 → 자세히 → 끝 줄 → 이야기 막대(1 / 8) → 탭 여섯
   글 · 숫자 · 고리는 옛 첫 쪽과 같은 자료(su21.json · su21-next.json · su21-s36.json · home-summary.json)에서 같은 말로 — 그림 · 칸 · 색 · 글씨 · 짜임은 옛것을 하나도 쓰지 않음(꾸밈 = su-sonja.css)
   한눈 판별 = 도장: 한 달 내림 = 짙은 남빛 찬 도장 + 흰 글 「한 달 내림」 · 오름 = 옅은 먹 테 도장 + 먹 글 「오름」 · 같음 = 먹 테 「같음」(빨강 없음 — 한국에서 빨강은 오름)
   보안 규칙: innerHTML 없음 · 글 속 style 없음 · 다른 주소 스크립트 없음 */
import {h, s} from '/su/su-fig.js';
import {NEED, num, ymd} from '/su/su-six.js';
import {won100, more100} from '/su/su-data.js';
import {NAME, josa} from '/next/brand.js';
import {essenceData, essenceLines, kstText} from '/next/essence.js';
import {load21, n36of, why21, six21, ruleRows} from '/su/su-21.js';
import {hardLeft} from '/su/su-word.js'; // 풀이 없이 남은 어려운 낱말 셈(검사 · 보고가 main data-hard 를 셈 — 화면에는 안 붙임)
import {topBar, cover, stepDay} from '/su/su-sonja-top.js'; // 머리 줄 · 표지 = 자료 없이 먼저 칠하는 판(su.js 가 먼저 붙임 — 느린 휴대폰 첫 화면)

export const CSS = '/su/su-sonja.css';
const D36 = '/su/data/su21-s36.json', DNX = '/su/data/su21-next.json';
const SAFE = '지난 기록만 보여 줘요. 앞날을 맞히지 않고 사고팔기를 권하지 않아요.';
const FOOT = [['/su/privacy.html', '개인정보 처리방침'], ['/next/?su=back#/help', '고객센터']];
const KEY = ['hot', 'bloom', 'money'], NXK = {hot: 'hotNext', bloom: 'bloomNext', money: 'moneyNext'};
const KIND = {hot: '불장', bloom: '꽃이 될', money: '돈이 몰리는', quiet: '조용한데 힘이 모이는'};
const KINDN = {hot: '불장이 될 듯', bloom: '꽃이 될 듯', money: '돈이 몰릴 듯'};
const MEAN = {hot: '한 달 동안 값이 크게 오른 곳이에요.', bloom: '업종이 오를 때 막 오르기 시작한 곳이에요.', money: '한 달 동안 회사 크기가 크게 늘어난 곳이에요.', quiet: '값은 조용한데 외국인과 기관이 모은 곳'};
const VLAB = {hot: '한 달 ', hotNext: '한 달 ', bloomNext: '닷새 동안 시장보다 '};
const VCAP = {bloomNext: '닷새 동안 시장보다'};
const BLOOMW = {꽃: '꽃 · 핌', 싹: '싹 · 피기 전'};
const LANDK = ['fall', 'shake', 'rise', 'narrow', 'calm'];
const KN = ['', '한', '두', '세', '네', '다섯', '여섯', '일곱', '여덟', '아홉', '열'];
const SXT = '손자병법 계산법';
const EASYHOW = {'긴 오름세 · 덜 흔들림': '1년 꾸준히 오름', '1년 오른 날 몫': '1년 오른 날이 많음', '업종 따라잡기': '업종보다 덜 오름', '닷새 눌림': '최근 5일 쉼'};
const UPHOW = ['긴 오름세 · 덜 흔들림', '1년 오른 날 몫', '업종 따라잡기', '닷새 눌림'];
const STEP8 = ['오늘', '땅 지도', '업종', '회사', '회사 자세히', '「왜 사?」', '내 매매일지', '친구에게'];

const fin = x => typeof x === 'number' && Number.isFinite(x);
const NF = new Intl.NumberFormat('ko-KR');
const won = v => NF.format(Math.round(v)) + '원';
const mday = d => { const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(d ?? '')); return m ? +m[2] + '월 ' + +m[3] + '일' : null; };
const ym = t => { const m = /^(\d{4})-(\d{2})-\d{2}$/.exec(String(t ?? '')); return m ? m[1] + '년 ' + +m[2] + '월' : null; };
const day = d => ymd(d) ?? NEED;
const w100 = r => (fin(r) ? (100 * (1 + r)).toFixed(1).replace(/\.0$/, '') + '원' : NEED);
const one = v => (Math.round(v * 10) / 10).toLocaleString('ko-KR');
const hm = t => { const m = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/.exec(String(t ?? '')); if (!m) return null; const H = +m[4]; return +m[2] + '월 ' + +m[3] + '일 ' + (H < 12 ? '오전 ' : '오후 ') + (H % 12 || 12) + '시' + (+m[5] ? ' ' + +m[5] + '분' : ''); };
/** 억 · 조(돈이 몰리는 값) — 옛 첫 쪽과 같은 셈 */
const eok = g => {
  const a = Math.abs(Math.round(g)), sg = g >= 0 ? '+' : '−';
  if (a < 10000) return sg + NF.format(a) + '억';
  let j = Math.floor(a / 10000), c = Math.round((a % 10000) / 1000);
  if (c === 10) { j++; c = 0; }
  return sg + NF.format(j) + '조' + (c ? ' ' + c + '천억' : '');
};
/** 칸 값 — 옛 첫 쪽과 같은 말(불장 = 한 달 100원이 ○원 · 돈 = 회사 크기 늘어난 억 · 꽃 = 꽃/싹 · 될 듯은 그 묶음 셈) */
function valText(c, k, nx = false) {
  if (nx) {
    const w = c?.why ?? {};
    if (k === 'hot') return fin(w.r20) ? won100(w.r20) : NEED;
    if (k === 'money') return fin(w.gain) ? eok(w.gain) : NEED;
    return fin(w.x5) ? more100(w.x5) : NEED;
  }
  if (k === 'hot') return fin(c?.ch20) ? won100(c.ch20) : NEED;
  if (k === 'money') { const g = c?.why?.gain; return fin(g) ? eok(g) : NEED; }
  return c?.why?.full === true ? '꽃' : '싹';
}
const valLab = (v, key) => (v === NEED ? v : BLOOMW[v] ?? (VLAB[key] ? VLAB[key] + v : v));
/** 한 달 꺾은선 값 21 — 끝 = 그날 마지막 값일 때만 */
const pxOf = (c, dayB) => (fin(c?.close) && c.close > 0 && (!c.date || !dayB || c.date === dayB) ? c.close : null);
const spOf = (c, dayB) => (Array.isArray(c?.c) && c.c.length === 21 && c.c.every(v => fin(v) && v > 0) && pxOf(c, dayB) === c.c[20] ? c.c : null);
/** 한 달 판별 — 꺾은선 처음(한 달 전)과 끝(그날)으로 · 값이 없으면 null */
const monOf = sp => (!sp ? null : sp[sp.length - 1] < sp[0] ? 'dn' : sp[sp.length - 1] > sp[0] ? 'up' : 'eq');
const MONW = {dn: '한 달 내림', up: '오름', eq: '같음'};

/* ── 작은 부품(새로 그림) ── */
/** 도장 — 한 달 내림 = 짙은 남빛 찬 네모 · 오름 · 같음 = 먹 테 네모(글은 늘 함께 — 색만으로 가르지 않음) */
const seal = (m, extra = '') => (m ? h('span', {class: 'sj-seal sj-seal-' + m + extra, 'data-mon': m, text: MONW[m]}) : h('span', {class: 'sj-seal sj-seal-na' + extra, 'data-mon': 'na', text: '값 없음'}));
/** 한 달 꺾은선(먹 선 · 한 달 전 값 점선 · 끝 점 = 내림 남빛 · 오름 먹) */
function spark(sp, w = 96, hh = 34, cls = '') {
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
const head = (bw, pno, title, flip = false, more = []) => h('div', {class: 'sj-sh' + (flip ? ' sj-flip' : '')},
  h('p', {class: 'sj-bw', 'aria-hidden': 'true', text: bw}), h('i', {class: 'sj-axis', 'aria-hidden': 'true'}),
  h('div', {class: 'sj-sht'}, h('p', {class: 'sj-pno', text: pno}), title, ...more));
const endSeal = t => h('span', {class: 'sj-endseal', 'aria-hidden': 'true', text: t});

/* ── 자료 ── */
/** 될 듯 셋의 그날 값 · 21 마지막 값은 따로 받은 파일(su21-next.json)에서 — 첫 칠함을 기다리게 하지 않고 칠한 뒤 받아 될 듯 줄만 다시 그림(느린 휴대폰 첫 화면 2.5초) */
function withNext(T, n) {
  const lists = {...(T.lists ?? {})};
  for (const k of Object.values(NXK)) {
    const by = new Map((n?.lists?.[k] ?? []).map(c => [String(c.code), c]));
    lists[k] = (T.lists?.[k] ?? []).map(c => { const f = by.get(String(c.code)); return f ? {...c, ...Object.fromEntries(['close', 'date', 'c'].filter(x => f[x] != null).map(x => [x, f[x]]))} : c; });
  }
  return {...T, lists};
}
const ok36 = (g, T) => !!g && g.schema === 'su21-s36-1' && Array.isArray(g.kinds) && g.kinds.length === 36 && !!g.lists && typeof g.lists === 'object' && g.asOf?.board === T?.asOf?.board
  && g.kinds.every(k => (g.lists[k] ?? []).length === T?.s36n?.[k]);
const okSun = x => !!x && x.rule === 'sun-v1' && LANDK.includes(x.land) && Number.isInteger(x.m?.n) && x.m.n > 0 && Number.isInteger(x.m?.up) && x.m.up >= 0 && x.m.up <= x.m.n
  && typeof x.name === 'string' && typeof x.quote === 'string' && Array.isArray(x.rank) && x.rank.length === 36 && x.rank.every(r => typeof r?.k === 'string' && Number.isInteger(r.n));
const okOv = g => !!g?.ovl && typeof g.ovl.rule === 'string' && Number.isInteger(g.ovl.need) && g.ovl.need >= 2 && Array.isArray(g.ovl.list)
  && g.ovl.list.every(x => x && /^[0-9A-Z]{6}$/.test(String(x.code ?? '')) && Number.isInteger(x.n) && x.n >= g.ovl.need);
const sp36 = (g, code) => { const v = g?.line?.[code]; return v && Array.isArray(v.c) && v.c.length === 21 && v.c.every(x => fin(x) && x > 0) && fin(v.close) && v.close === v.c[20] && typeof v.date === 'string' && v.date === g?.asOf?.board ? v.c : null; };
const coN = groups => new Set(groups.flatMap(g => (Array.isArray(g) ? g : []).slice(0, 7).map(c => c?.code).filter(Boolean))).size;
const shakeSay = v => (!fin(v) ? null : v < 0.6 ? '평소의 절반쯤으로 잔잔해요' : v < 0.85 ? '평소보다 작아요' : v < 1.15 ? '평소와 비슷해요' : v < 1.5 ? '평소보다 커요' : '평소보다 훨씬 커요');
const lose10 = r => { if (!r?.n) return null; if (!r.lose) return '한 번도 잃지 않았어요.'; const k = Math.round(r.lose / r.n * 10); return k ? '열 번에 ' + KN[k] + ' 번 잃었어요.' : '열 번에 한 번이 안 되게 잃었어요.'; };
const none36 = w => (/거래량|사고판/.test(w ?? '') ? '그날 사고판 양을 받지 못해 고르지 못했어요.' : '지난 값이 모자라 고르지 못했어요.');
const topWhy = (r, how = UPHOW) => { const ps = Array.isArray(r?.parts) ? r.parts : []; let j = -1; ps.forEach((v, i) => { if (fin(v) && (j < 0 || v > ps[j])) j = i; }); return j < 0 ? null : (EASYHOW[how[j] ?? UPHOW[j]] ?? how[j] ?? UPHOW[j]); };
const ch20Of = r => (fin(r?.ch20) ? r.ch20 : Array.isArray(r?.c) && r.c.length === 21 && fin(r.c[0]) && r.c[0] > 0 && fin(r.c[20]) ? Math.round((r.c[20] / r.c[0] - 1) * 1000) / 10 : null);
const up3Why = (c20, why) => '이유 — ' + (fin(c20) && c20 < 0 ? '한 달은 내림 · ' : '') + (why ?? NEED);

/* ── 1 머리 ── */
/* ── 2 표지 · 형세 보고 ── */
function sunSec(T) {
  const x = okSun(T.sun) ? T.sun : null;
  if (!x) return h('section', {class: 'sj-sec sj-sun sj-nosun', 'aria-label': '요즘 눈에 띄는 회사'},
    h('h1', {class: 'sj-h1'}, h('span', {class: 'sj-h1a', text: '요즘 눈에 띄는 회사'})),
    h('p', {class: 'sj-lead', text: day(T.asOf?.board) + ' 자료 · 우량주 ' + (T.counts?.b365 ?? 365) + '곳 안이에요.'}));
  const m = x.m, P = (x.path ?? []).filter(k => LANDK.includes(k)).slice(-20), same = P.filter(k => k === x.land).length, upPart = m.up / m.n;
  const sh = shakeSay(m.shake), dd = mday(x.day);
  const BW = 340, BH = 30, upW = Math.round((BW - 6) * upPart);
  return h('section', {class: 'sj-sec sj-sun', 'data-land': x.land, 'aria-label': '오늘의 형세 · ' + x.name},
    h('p', {class: 'sj-k', text: '형세 보고' + (dd ? ' · ' + dd + ' 마지막 값' : '')}),
    h('div', {class: 'sj-today'},
      h('h1', {class: 'sj-h1'}, h('span', {class: 'sj-h1a', text: '지금은 '}), h('b', {class: 'sj-land', text: x.name}), h('span', {class: 'sj-h1c', text: '이에요.'})),
      h('span', {class: 'sj-seal sj-seal-big ' + (x.land === 'fall' ? 'sj-seal-dn' : 'sj-seal-up'), 'aria-hidden': 'true', text: x.name})),
    h('blockquote', {class: 'sj-q'}, h('p', {text: '「' + x.quote + '」'}), h('cite', {text: '손자병법 ' + (x.pian ?? '')})),
    h('ul', {class: 'sj-m'},
      h('li', {}, h('p', {class: 'sj-m1', text: m.n + '곳 가운데 ' + m.up + '곳이 한 달 전보다 올랐어요.'}),
        s('svg', {class: 'sj-bar', viewBox: `0 0 ${BW} ${BH}`, 'aria-hidden': 'true', focusable: 'false'},
          s('rect', {x: 1, y: 1, width: Math.max(upW, 2), height: BH - 2, class: 'sj-bar-up'}),
          s('rect', {x: upW + 5, y: 1, width: Math.max(BW - upW - 6, 2), height: BH - 2, class: 'sj-bar-dn'})),
        h('p', {class: 'sj-bl'}, h('span', {class: 'sj-blu'}, h('i', {class: 'sj-ms sj-ms-up', 'aria-hidden': 'true'}), '오른 곳 ' + m.up), h('span', {class: 'sj-bld'}, h('i', {class: 'sj-ms sj-ms-dn', 'aria-hidden': 'true'}), '나머지 ' + (m.n - m.up)))),
      h('li', {}, h('p', {class: 'sj-m2', text: '한가운데 회사는 한 달 동안 100원이 ' + w100(m.mid) + '이 됐어요.'})),
      sh ? h('li', {}, h('p', {class: 'sj-m3', text: '요즘 스무 날 하루 오르내림은 ' + sh + '.'})) : null),
    P.length ? h('div', {class: 'sj-path'},
      s('svg', {class: 'sj-strip', viewBox: `0 0 ${BW} 34`, 'aria-hidden': 'true', focusable: 'false'},
        ...P.map((k, i) => s('rect', {x: 1 + i * 17, y: 4, width: 13, height: 26, class: 'sj-day' + (k === x.land ? ' sj-same' : '') + (i === P.length - 1 ? ' sj-now' : '')}))),
      h('p', {class: 'sj-pc', text: '지난 ' + P.length + '거래일 가운데 ' + same + '날이 ' + x.name + '이었어요. 오른쪽 끝이 오늘이에요.'})) : null,
    h('p', {class: 'sj-do', text: (x.do ?? '') + ' 그래서 서른여섯 꾀를 덜 잃은 차례로 놓았어요.'}),
    x.lands && LANDK.every(k => typeof x.lands[k]?.rule === 'string') ? h('details', {class: 'sj-drawer sj-lands'},
      h('summary', {}, h('span', {class: 'sj-s1', text: '다섯 땅은 이렇게 나눠요'}), chev()),
      h('ol', {class: 'sj-ldl'}, ...LANDK.map(k => { const L = x.lands[k]; return h('li', {'data-land': k, class: 'sj-ld' + (k === x.land ? ' sj-ldnow' : '')},
        h('b', {text: L.name + (k === x.land ? ' · 지금' : '')}), h('p', {text: L.rule + (Number.isInteger(L.n) && x.hist?.days ? ' 지난 ' + x.hist.days + '거래일 가운데 ' + L.n + '날이었어요.' : '')}),
        h('p', {class: 'sj-ldq', text: '「' + L.quote + '」 손자병법 ' + L.pian})); })),
      h('p', {class: 'sj-ldp', text: '땅은 그날 마지막 값으로 가려요. 내일 땅을 맞히는 셈이 아니에요.'})) : null,
    h('p', {class: 'sj-safe', text: '지난 기록으로 본 모습이에요. 앞날을 맞히지 않고, 사고팔기를 권하지 않아요.'}),
    endSeal('형세'));
}
const chev = () => s('svg', {class: 'sj-chev', viewBox: '0 0 24 24', 'aria-hidden': 'true', focusable: 'false'}, s('path', {d: 'M5 9l7 7 7-7'}));

/* ── 3 덜 잃은 꾀 차례(꾀 칸 자료는 첫 칠함 뒤에 받음 — 느린 휴대폰 첫 화면) ── */
function trickWait(T) {
  return n36of(T) != null ? h('section', {class: 'sj-sec sj-s36 sj-wait', 'aria-hidden': 'true', 'data-wait': ''}) : null;
}
function rec36(r) {
  if (!r) return [];
  if (!r.n) return [h('p', {class: 'sj-tl sj-tnorec', text: '지난 기록을 세지 못했어요. 그날 사고판 양 자료가 있어야 세요.'})];
  const k = r.lose ? Math.max(1, Math.round(r.lose / r.n * 10)) : 0;
  return [h('p', {class: 'sj-dots', role: 'img', 'aria-label': '열 칸 가운데 잃은 몫 ' + k + '칸'}, ...Array.from({length: 10}, (_, i) => h('i', {class: i < k ? 'sj-dl' : 'sj-dk'}))),
    h('p', {class: 'sj-tl'}, h('b', {text: lose10(r)}), h('span', {text: ' ' + r.n + '번 가운데 ' + r.lose + '번'})),
    r.lose ? h('p', {class: 'sj-tl2', text: '잃은 주는 평균 100원이 ' + w100(r.avgLoss) + '이 됐어요. 가장 크게 잃은 주는 ' + w100(r.worst) + '이었어요.'}) : null,
    h('p', {class: 'sj-tl3', text: '모든 주를 고르면 평균 100원이 ' + w100(r.avg) + '이에요.'})];
}
function chip(g, c, bd, ov) {
  const code = String(c.code ?? ''), name = String(c.name ?? NEED), dz = Number.isInteger(c.days) && c.days >= 1 ? c.days : null, sp = sp36(g, code), n = ov && Number.isInteger(c.n) ? c.n : null, m = monOf(sp);
  return h('li', {}, h('a', {class: 'sj-chip' + (ov ? ' sj-chip-ov' : ''), href: '#/c/' + encodeURIComponent(code), 'data-code': code, 'data-days': dz ? String(dz) : null, 'data-n': n ? String(n) : null, 'data-mon': m ?? 'na',
    'aria-label': name + (n ? ' · ' + n + '묶음' : '') + (dz ? ' · ' + dz + '일째' : '') + (sp ? ' · 한 달 전 ' + won(sp[0]) + ' · ' + (bd ? bd + ' ' : '') + '마지막 값 ' + won(sp[20]) + ' · ' + MONW[m] : '')},
    h('b', {text: name}), h('span', {class: 'sj-chipi'}, n ? h('span', {class: 'sj-chipn', text: n + '묶음'}) : null, h('span', {class: 'sj-chipd', text: dz ? dz + '일째' : ''})), sp ? spark(sp, 64, 26, 'sj-sps') : null, m ? h('i', {class: 'sj-chipm sj-chipm-' + m, 'aria-hidden': 'true', text: m === 'dn' ? '내림' : m === 'up' ? '오름' : '같음'}) : null));
}
function trickSec(g, T) {
  const sun = okSun(T.sun) ? T.sun : null, N = g.kinds.reduce((a, k) => a + Math.min(7, (g.lists[k] ?? []).length), 0), dd = mday(g?.asOf?.data) ?? mday(T.asOf?.board), bd = mday(g?.asOf?.board);
  const OV = okOv(g) ? g.ovl.list : [];
  const anySp = g.kinds.some(k => (g.lists[k] ?? []).slice(0, 7).some(c => sp36(g, String(c?.code ?? '')))) || OV.some(c => sp36(g, String(c?.code ?? '')));
  const S = sun && sun.rank.every(r => g.kinds.includes(r.k)) && new Set(sun.rank.map(r => r.k)).size === 36 ? sun : null;
  const order = S ? S.rank.map(r => r.k) : g.kinds, RB = S ? Object.fromEntries(S.rank.map((r, i) => [r.k, {...r, i: i + 1}])) : {};
  const one36 = k => { const L = (g.lists[k] ?? []).slice(0, 7), r = RB[k];
    return h('li', {class: 'sj-tk', 'data-k': k, 'data-n': String(L.length), 'data-rank': r ? String(r.i) : null},
      h('div', {class: 'sj-tkh'}, r ? h('span', {class: 'sj-rk', text: String(r.i)}) : null,
        h('p', {class: 'sj-tn'}, h('b', {text: g.name?.[k] ?? k}), h('span', {text: ' ' + (g.han?.[k] ?? '') + ' · ' + L.length + '곳'}))),
      ...rec36(r),
      h('p', {class: 'sj-say', text: g.say?.[k] ?? ''}),
      L.length ? h('ul', {class: 'sj-chips'}, ...L.map(c => chip(g, c, bd, false))) : h('p', {class: 'sj-tnone', text: none36(g.why?.[k])})); };
  const H = S ? S.hist : null, TOP = 7;
  return h('section', {class: 'sj-sec sj-s36', 'aria-label': (S ? '덜 잃은 꾀 차례 · ' : '') + '서른여섯 꾀 ' + N + '칸', 'data-n': String(N), 'data-order': S ? 'sun' : 'kind'},
    head('꾀', '제2장', h('h2', {class: 'sj-h2'}, h('span', {class: 'sj-brush', text: S ? '덜 잃은 꾀 차례' : '서른여섯 꾀'}), h('span', {class: 'sj-h2n', text: ' ' + N + '칸'})), true),
    S?.rankQ ? h('blockquote', {class: 'sj-q'}, h('p', {text: '「' + S.rankQ.quote + '」'}), h('cite', {text: '손자병법 ' + S.rankQ.pian})) : null,
    h('p', {class: 'sj-lead', text: '삼십육계(옛 병법에 전하는 서른여섯 가지 꾀)마다, 그날 그 꾀를 가장 닮은 일곱 곳이에요.'}),
    S && H ? h('p', {class: 'sj-rule', text: (H.all ? '지난 ' + H.days + '거래일을 모두 보고, ' : '지난 ' + H.days + '거래일 가운데 오늘처럼 ' + S.name + '이었던 ' + H.same + '날을 골라, ')
      + '꾀마다 고른 일곱 곳을 닷새 뒤 값과 견줬어요. 잃은 번이 적은 꾀가 위예요.' + (ym(H.from) && ym(H.to) ? ' 센 때는 ' + ym(H.from) + '부터 ' + ym(H.to) + '까지예요.' : '')}) : null,
    h('p', {class: 'sj-dayl', text: (dd ? dd + ' 마지막 값으로 골랐어요. ' : '') + (anySp ? '이름 옆 꺾은선은 한 달, 점선은 한 달 전 값이에요. ' : '') + '같은 회사가 여러 꾀에 들 수 있어요.' + (mday(g.daysFrom) ? ' 며칠째는 ' + mday(g.daysFrom) + ' 기록부터 셌어요.' : '')}),
    h('ol', {class: 'sj-tricks'}, ...order.slice(0, TOP).map(one36)),
    order.length > TOP ? h('details', {class: 'sj-drawer sj-tmore'}, h('summary', {}, h('span', {class: 'sj-s1', text: (S ? (TOP + 1) + '위부터 ' + order.length + '위까지 ' : '나머지 ') + '꾀 ' + (order.length - TOP) + '가지 더 보기'}), chev()),
      h('ol', {class: 'sj-tricks'}, ...order.slice(TOP).map(one36))) : null,
    OV.length ? h('div', {class: 'sj-ov', 'data-k': 'ovl', 'data-n': String(OV.length)},
      h('h3', {class: 'sj-h3 sj-brush', text: '겹친 곳'}),
      h('p', {class: 'sj-ovh'}, h('b', {text: '세 묶음 이상에 든 곳'}), h('span', {text: ' · ' + OV.length + '곳'})),
      h('p', {class: 'sj-say', text: '위 네 창 · 될 듯 세 창 · 서른여섯 꾀, 모두 마흔세 묶음 가운데 세 묶음 이상에 든 회사예요. 많이 겹친 차례예요. 칸마다 든 묶음 수를 적었어요. 겹쳤다고 더 좋은 곳은 아니에요. 같은 흐름이라 함께 내릴 수도 있어요.' + (mday(g.ovl.daysFrom) ? ' 며칠째는 ' + mday(g.ovl.daysFrom) + ' 기록부터 셌어요.' : '')}),
      h('ul', {class: 'sj-chips'}, ...OV.map(c => chip(g, c, bd, true)))) : null,
    h('p', {class: 'sj-safe', text: '지난 기록을 센 차례예요. 앞날을 맞히지 않고, 사고팔기를 권하지 않아요.'}),
    h('a', {class: 'sj-go', href: '#/r/t'}, h('span', {text: '서른여섯 꾀 정산 보기'}), h('i', {'aria-hidden': 'true', text: '›'})),
    endSeal('꾀'));
}

/* ── 4 오늘 이름이 오른 회사 ── */
function countSec(T, c) {
  const MARK = T?.strict?.mode === 'mark', RANK = !!T?.top3 && Array.isArray(T.top3.rank), UP3 = RANK && T.top3.v === 'up3-v1', CULT = T?.listRule === 'culture7-v1';
  const dd = mday(T.asOf?.board);
  return h('section', {class: 'sj-sec sj-count', 'aria-label': '오늘 이름이 오른 회사'},
    head('이름', '제3장', h('h2', {class: 'sj-h2', text: '오늘 이름이 오른 회사'})),
    h('p', {class: 'sj-big'}, h('b', {class: 'sj-huge', 'data-co': c.pre != null ? String(c.pre) : null, text: c.pre != null ? num(c.pre) : '…'}), h('span', {class: 'sj-unit', text: c.pre != null ? '곳' : ''})),
    h('p', {class: 'sj-bl0', text: c.LAB}),
    h('p', {class: 'sj-mean'}, h('i', {text: '그래서'}), h('span', {text: c.MEAN})),
    h('div', {class: 'sj-pair'},
      h('p', {class: 'sj-pa'}, h('span', {class: 'sj-pk', text: '지금'}), h('b', {text: String(c.n28)}), h('span', {class: 'sj-pu', text: '칸'}), h('span', {class: 'sj-pd', text: '지금 눈에 띄는 곳'})),
      h('i', {class: 'sj-axis', 'aria-hidden': 'true'}),
      h('p', {class: 'sj-pa'}, h('span', {class: 'sj-pk', text: '될 듯'}), h('b', {text: String(c.n21)}), h('span', {class: 'sj-pu', text: '칸'}), h('span', {class: 'sj-pd', text: '그 앞 모습을 닮은 곳'}))),
    h('ul', {class: 'sj-notes'},
      h('li', {text: '지난 기록이에요. 사고팔기를 권하지 않아요.'}),
      h('li', {class: 'sj-pxnote', text: '현재가는 ' + (dd ? dd + ' ' : '') + '마지막 값이에요.'}),
      h('li', {text: '꺾은선은 한 달, 점선은 한 달 전 값이에요.'}),
      UP3 ? h('li', {text: '될 듯은 지난 기록의 앞 모습이에요.'}) : null,
      !UP3 && RANK ? h('li', {class: 'sj-r3leg'}, h('span', {class: 'sj-tag sj-tag-r3', text: '1등'}), ' ', h('span', {class: 'sj-tag sj-tag-r3', text: '2등'}), ' ', h('span', {class: 'sj-tag sj-tag-r3', text: '3등'}), ' ', h('span', {text: SXT + ' 차례'}), ' ', h('span', {text: CULT ? '문화 일곱으로 고르고 1억 번 섞었어요.' : '1억 번 섞어 끝까지 남은 차례예요.'})) : null,
      MARK && !RANK ? h('li', {class: 'sj-sxleg'}, h('span', {class: 'sj-tag', text: SXT}), ' ', h('span', {text: SXT + '으로 찾은 종목'}), ' ', h('span', {text: '31가지 기준을 모두 지난 곳이에요.'})) : null));
}

/* ── 5 오늘의 1 · 2 · 3등 ── */
function up3Sec(T) {
  const RANK = !!T?.top3 && Array.isArray(T.top3.rank), UP3 = RANK && T.top3.v === 'up3-v1';
  if (!UP3) return null;
  const dayB = T.asOf?.board, how = T.top3.how, R = n => (T.top3.rank ?? []).find(r => r?.place === n);
  const row = n => {
    const r = R(n), px = fin(r?.close) && r.close > 0 && (!r.date || !dayB || r.date === dayB) ? r.close : null;
    const sp = Array.isArray(r?.c) && r.c.length === 21 && r.c.every(v => fin(v) && v > 0) && px === r.c[20] ? r.c : null;
    const nm = String(r?.name ?? NEED), price = px != null ? won(px) : NEED, c20 = sp ? ch20Of(r) : null, mon = '한 달 ' + (c20 != null ? won100(c20) : NEED);
    const ind = String(r?.ind ?? NEED), why = topWhy(r, how), wl = up3Why(c20, why), say = ' · 현재가 ' + price + ' · ' + mon + (sp ? ' · 한 달 전 ' + won(sp[0]) : ''), m = monOf(sp);
    return h('li', {}, h('a', {class: 'sj-up3a', href: '#/c/' + encodeURIComponent(String(r?.code ?? '')) + '/t', 'data-place': String(n), 'data-code': String(r?.code ?? ''), 'data-px': px ?? '', 'data-name': nm, 'data-mon': m ?? 'na',
      'aria-label': '오늘의 ' + n + '등 · ' + nm + say + ' · ' + ind + ' · ' + wl + ' · 누르면 이유 쪽'},
      h('span', {class: 'sj-place', text: n + '등'}),
      h('b', {class: 'sj-nm', text: nm}),
      h('span', {class: 'sj-v'}, h('span', {class: 'sj-v1 sj-px' + (px != null ? '' : ' sj-need'), text: price}), h('span', {class: 'sj-v2 sj-mon' + (c20 != null ? '' : ' sj-need'), text: mon})),
      seal(m, ' sj-rseal'),
      h('span', {class: 'sj-d'}, h('span', {class: 'sj-ind', text: ind}), h('span', {class: 'sj-why' + (why ? '' : ' sj-need'), text: wl})),
      spark(sp, 104, 40, 'sj-spu'), h('i', {class: 'sj-go1', 'aria-hidden': 'true', text: '›'})));
  };
  return h('section', {class: 'sj-sec sj-up3', 'aria-label': '오늘의 1 · 2 · 3등'},
    head('셋', '제4장', h('h2', {class: 'sj-h2'}, h('span', {class: 'sj-brush', text: '오늘의 1 · 2 · 3등'})), true, [h('p', {class: 'sj-hint', text: '누르면 이유 ›'})]),
    h('p', {class: 'sj-lead', 'data-mean': 'up3', text: '1년 오르다 요즘 쉬거나 내린 곳이에요.'}),
    h('p', {class: 'sj-lead sj-loss', 'data-mean': 'up3x', text: '더 내릴 수도 있어요.'}),
    h('ol', {class: 'sj-rows sj-up3rows'}, ...[1, 2, 3].map(row)),
    h('p', {class: 'sj-note', text: '지난 기록 차례예요. 앞날은 몰라요.'}),
    h('a', {class: 'sj-go sj-cal', href: '#/r/c', 'aria-label': '1 · 2 · 3등 달력 보기 — 날마다 뽑힌 셋'}, h('span', {text: '1 · 2 · 3등 달력 — 날마다 뽑힌 셋'}), h('i', {'aria-hidden': 'true', text: '›'})),
    endSeal('셋'));
}

/* ── 6 칸 하나 읽는 법 ── */
function howSec(anyF) {
  const L = (a, b) => h('li', {}, h('span', {class: 'sj-hv', text: a}), h('span', {class: 'sj-hl', text: '← ' + b}));
  return h('section', {class: 'sj-sec sj-how', 'data-how': '1', 'data-fomo': anyF ? '1' : '0', 'aria-label': '칸 하나 읽는 법'},
    head('읽기', '제5장', h('h2', {class: 'sj-h2', text: '칸 하나 읽는 법'})),
    h('ol', {class: 'sj-howl'},
      L('회사 이름', '누르면 이유 쪽'), L('100원이 ○○원', '한 달 동안'), L('○○,○○○원', '현재가'), L('첫 발견 ○월 ○일', '처음 찾은 날'), L(anyF ? '○일째 · 포모지수 ○○' : '○일째', anyF ? '며칠째 · 포모지수' : '며칠째')),
    h('ul', {class: 'sj-legend'},
      h('li', {}, seal('dn'), h('span', {class: 'sj-lt', text: '짙은 남빛 도장은 한 달 전보다 내린 곳이에요.'})),
      h('li', {}, seal('up'), h('span', {class: 'sj-lt', text: '옅은 테 도장은 한 달 전보다 오른 곳이에요.'}))),
    h('p', {class: 'sj-note', text: '둘째 줄은 한 달 전 100원이 지금 얼마인지예요.'}),
    anyF ? h('p', {class: 'sj-note', text: '포모지수 — 요즘 열흘 값이 얼마나 뜨거운지예요. 50이 보통이에요.'}) : null);
}

/* ── 7 셋 묶음(지금 일곱 → 될 듯 일곱) ── */
function rowItem(it) {
  const st = it.star ? '✦ ' : '', price = it.px != null ? won(it.px) : NEED;
  const found = fin(it.days) && mday(it.found) ? '첫 발견 ' + mday(it.found) : '첫 발견 ' + NEED;
  const hasF = fin(it.fomo), dl = fin(it.days) ? it.days + '일째' : NEED, dw = hasF ? dl + ' · 포모지수 ' + it.fomo : dl;
  const tl = it.r3 ? SXT + ' ' + it.r3 + '등' : it.sx ? SXT + '으로 찾은 종목' : '';
  const say = (it.px != null ? ' · 현재가 ' + price : '') + (it.sp ? ' · 한 달 전 ' + won(it.sp[0]) : ''), m = monOf(it.sp);
  return h('li', {}, h('a', {class: 'sj-row sj-side-' + it.side + (it.sx || it.r3 ? ' sj-x' : ''), href: '#/c/' + encodeURIComponent(it.code) + '/y/' + it.k, 'data-k': it.k, 'data-name': it.name, 'data-px': it.px ?? '', 'data-code': it.code,
    'data-days': fin(it.days) ? it.days : '', 'data-found': it.found ?? '', 'data-fomo': hasF ? it.fomo : '', 'data-sx': it.sx ? '1' : '', 'data-r3': it.r3 ? String(it.r3) : '', 'data-mon': m ?? 'na',
    'aria-label': (tl ? tl + ' · ' : '') + (it.side === 'now' ? '지금 ' : '될 듯 ') + it.kind + ' · ' + it.name + ' · ' + (it.lab ?? it.val) + say + (it.star ? ' · 두 목록에 함께' : '') + ' · ' + found + ' · ' + dw + (m ? ' · ' + MONW[m] : '')},
    it.r3 ? h('span', {class: 'sj-tag sj-tag-r3', text: it.r3 + '등'}) : it.sx ? h('span', {class: 'sj-tag', text: SXT}) : null,
    h('b', {class: 'sj-nm', text: st + it.name}),
    h('span', {class: 'sj-v'}, h('span', {class: 'sj-v2 sj-val' + (it.val === NEED ? ' sj-need' : ''), text: it.vis}), h('span', {class: 'sj-v1 sj-px' + (it.px != null ? '' : ' sj-need'), text: price})),
    seal(m, ' sj-rseal'),
    h('span', {class: 'sj-d'}, h('span', {class: 'sj-found' + (fin(it.days) ? '' : ' sj-need'), text: found}), h('span', {class: 'sj-days' + (fin(it.days) ? '' : ' sj-need'), text: dw})),
    spark(it.sp, 96, 34)));
}
function grpItems(T, k, nx) {
  const dayB = T.asOf?.board, L = T.lists ?? {}, ovs = new Set((T.overlap ?? []).map(o => o.name));
  const MARK = T?.strict?.mode === 'mark', RANK = !!T?.top3 && Array.isArray(T.top3.rank);
  return (L[nx ? NXK[k] : k] ?? []).slice(0, 7).map(c => { const key = nx ? NXK[k] : k, v = valText(c, k, nx);
    return {k: key, side: nx ? 'next' : 'now', kind: nx ? KINDN[k] : KIND[k], code: String(c.code ?? ''), name: String(c.name ?? NEED), val: v, vis: BLOOMW[v] ?? v, lab: valLab(v, key), star: !nx && ovs.has(String(c.name)),
      px: pxOf(c, dayB), sp: spOf(c, dayB), days: c.days, found: c.found, fomo: c.fomo, sx: MARK && c.sx === true, r3: RANK && [1, 2, 3].includes(c.r3) ? c.r3 : null}; });
}
function grpSec(T, k, i) {
  const now = grpItems(T, k, false), nx = grpItems(T, k, true), BW = {hot: '불', bloom: '꽃', money: '돈'}[k];
  return h('section', {class: 'sj-sec sj-grp', 'data-k': k, 'aria-label': KIND[k] + ' · ' + KINDN[k]},
    head(BW, '제' + (6 + i) + '장', h('h2', {class: 'sj-h2'}, h('span', {class: 'sj-brush', text: KIND[k]})), i % 2 === 1, [h('p', {class: 'sj-what', 'data-mean': k, text: MEAN[k]})]),
    h('h3', {class: 'sj-sub'}, h('i', {class: 'sj-mk sj-mk-now', 'aria-hidden': 'true'}), h('span', {text: '지금 ' + KIND[k] + ' · ' + now.length + '곳'})),
    now.length ? h('ol', {class: 'sj-rows', 'data-side': 'now'}, ...now.map(rowItem)) : h('p', {class: 'sj-note', text: NEED}),
    h('h3', {class: 'sj-sub sj-sub-nx'}, h('i', {class: 'sj-mk sj-mk-nx', 'aria-hidden': 'true'}), h('span', {text: KINDN[k] + ' · ' + nx.length + '곳'}), h('span', {class: 'sj-mtag', text: '예언 아님'})),
    VCAP[NXK[k]] && nx.length ? h('p', {class: 'sj-vcap', 'data-cap': NXK[k], text: '둘째 줄은 ' + VCAP[NXK[k]] + ' 100원에 몇 원 더인지예요.'}) : null,
    nx.length ? h('ol', {class: 'sj-rows', 'data-side': 'next'}, ...nx.map(rowItem)) : h('p', {class: 'sj-note', text: NEED}),
    endSeal(BW));
}

/* ── 8 조용한데 힘이 모이는 ── */
function quietSec(T) {
  const dayB = T.asOf?.board, QL = (T.lists?.quiet ?? []).slice(0, 7).map(c => ({code: String(c.code ?? ''), name: String(c.name ?? NEED), px: pxOf(c, dayB), sp: spOf(c, dayB), w: c.why ?? {}, r3q: [1, 2, 3].includes(c.r3q) ? c.r3q : null, qd: Number.isInteger(c.days) && c.days >= 1 ? c.days : null}));
  if (!QL.length) return null;
  const row = it => {
    const q = it.w, price = it.px != null ? won(it.px) : NEED;
    const span = fin(q.span20) ? '한 달 흔들림: 100원에 ' + one(q.span20) + '원' : '한 달 흔들림: ' + NEED;
    const rare = fin(q.p) ? (q.p * 100 < 0.1 ? '100번에 0.1번 아래' : '100번에 ' + (Math.round(q.p * 1000) / 10) + '번') : NEED;
    const fl = fin(q.f) && fin(q.i) ? (q.f + q.i > 0 ? '외국인·기관 들어옴' : q.f + q.i < 0 ? '외국인·기관 나감' : '외국인·기관 같음') : '외국인·기관 ' + NEED;
    const say = (it.px != null ? ' · 현재가 ' + price : '') + (it.sp ? ' · 한 달 전 ' + won(it.sp[0]) : ''), m = monOf(it.sp);
    return h('li', {}, h('a', {class: 'sj-row sj-qrow' + (it.r3q ? ' sj-x' : ''), href: '#/c/' + encodeURIComponent(it.code), 'data-k': 'quiet', 'data-name': it.name, 'data-px': it.px ?? '', 'data-code': it.code, 'data-r3q': it.r3q ? String(it.r3q) : '', 'data-mon': m ?? 'na',
      'aria-label': (it.r3q ? '조용한 힘 ' + it.r3q + '등 · ' : '') + '지금 ' + KIND.quiet + ' · ' + it.name + (it.qd ? ' · ' + it.qd + '일째' : '') + ' · ' + span + say + ' · 이만큼 조용하기 ' + rare + ' · ' + fl + (m ? ' · ' + MONW[m] : '')},
      it.r3q ? h('span', {class: 'sj-tag sj-tag-r3', text: it.r3q + '등'}) : null,
      h('b', {class: 'sj-nm', text: it.name}),
      h('span', {class: 'sj-v'}, h('span', {class: 'sj-v2 sj-val' + (fin(q.span20) ? '' : ' sj-need'), text: span}), h('span', {class: 'sj-v1 sj-px' + (it.px != null ? '' : ' sj-need'), text: price})),
      seal(m, ' sj-rseal'),
      h('span', {class: 'sj-d'}, h('span', {class: 'sj-found' + (fin(q.p) ? '' : ' sj-need'), text: '이만큼 조용하기 ' + rare}), h('span', {class: 'sj-days', text: fl}), h('span', {class: 'sj-qd', text: it.qd ? it.qd + '일째' : ''})),
      spark(it.sp, 96, 34)));
  };
  return h('section', {class: 'sj-sec sj-quiet', 'data-sec': 'quiet', 'aria-label': KIND.quiet + ' ' + QL.length + '곳'},
    head('고요', '제9장', h('h2', {class: 'sj-h2'}, h('span', {class: 'sj-brush', text: KIND.quiet + ' ' + QL.length})), true,
      [h('a', {class: 'sj-qhead', href: '#/s', 'aria-label': '넷째 창 · 조용한데 힘이 모이는 ' + QL.length + '곳 · 걸러 온 길 보기', 'data-mean': 'quiet', text: MEAN.quiet + ' ›'})]),
    h('ol', {class: 'sj-rows', 'data-side': 'quiet'}, ...QL.map(row)),
    endSeal('고요'));
}

/* ── 9 지금 · 될 듯 두 단추 ── */
const modeNav = (n28, n21) => h('nav', {class: 'sj-mode', 'aria-label': '지금 ' + n28 + '칸 · 될 듯 ' + n21 + '칸'},
  h('a', {class: 'sj-modea sj-cur', href: '#/', 'aria-current': 'page'}, h('b', {text: '지금 ' + n28 + '칸'}), h('span', {text: '지금 그런 회사'})),
  h('a', {class: 'sj-modea', href: '#/n'}, h('b', {text: '될 듯 ' + n21 + '칸'}), h('span', {text: '그렇게 되기 전 모습을 닮은 회사'})));

/* ── 10 자세히(눌러야 열림 — 옛 첫 쪽 서랍 속 값을 하나도 빼지 않음) ── */
const SIXK = ['누가', '언제', '어디서', '무엇을', '어떻게', '왜'];
const sixDl = six => h('dl', {class: 'sj-six'}, ...SIXK.map(k => [h('dt', {text: k}), h('dd', {class: six?.[k] == null ? 'sj-need' : null, text: six?.[k] ?? NEED})]));
function moreBox(T, S, c) {
  const b365 = T.counts?.b365 ?? 365, nq = Math.min(7, (T.lists?.quiet ?? []).length);
  const bigSix = {누가: NAME, 언제: day(T.asOf?.board) + ' 자료', 어디서: '우량주 365곳 안',
    무엇을: '불장 · 꽃이 될 · 돈이 몰리는 회사를 7곳씩 찾았어요' + (nq ? '. 넷째 창 조용한데 힘이 모이는 곳 ' + nq + '칸을 더했어요' : ''), 어떻게: c.HOW, 왜: '앞날을 맞히지 않고 지난 기록에서 눈에 띄는 곳만 보여 주려고요'};
  const mids = [
    {v: num(T.counts?.listed), u: '곳', lab: '한국 상장 회사', mean: '한국에서 주식을 사고팔 수 있는 회사 수예요.', six: {누가: '코스피 · 코스닥', 언제: day(T.asOf?.mkt), 어디서: '한국 주식 시장', 무엇을: T.counts?.listedWhat ?? null, 어떻게: '그날 값이 있는 보통주를 셌어요', 왜: '모두에서 시작해야 빠진 곳이 없어요'}},
    {v: String(b365), u: '곳', lab: '우량주', mean: '이익을 내고 꾸준한 큰 회사만 먼저 골랐어요.', six: {누가: '상장 회사 가운데 튼튼한 곳', 언제: '2026년 10월 5일에 정함', 어디서: '73개 업종 · 업종마다 5곳', 무엇을: '우량주를 골랐어요', 어떻게: T.rules?.b365 ?? null, 왜: '튼튼한 회사 안에서만 찾으려고요'}},
    {v: String((T.overlap ?? []).length), u: '곳', lab: '두 목록에 함께 든 곳', mean: '같은 회사가 두 목록에 들면 한 번만 세요.', six: {누가: (T.overlap ?? []).map(o => o.name).join(' · ') || null, 언제: day(T.asOf?.board), 어디서: '21곳 안', 무엇을: '불장과 돈이 몰리는 목록에 함께 들었어요', 어떻게: '두 목록에서 같은 회사 번호를 찾았어요', 왜: '겹친 곳을 두 번 세지 않으려고요'}}];
  const pro = [...ruleRows(T), ...KEY.flatMap(k => (T.lists?.[k] ?? []).map(cc => ({k: KIND[k] + ' · ' + cc.name, v: fin(cc.ch20) ? won100(cc.ch20) : NEED, how: why21(cc, k, T) + ' · ' + Object.entries(six21(cc, k, T)).map(([a, b]) => a + ' ' + (b ?? NEED)).join(' · ')})))];
  const lines = essenceLines(essenceData({summary: S}));
  return h('details', {class: 'sj-drawer sj-more'},
    h('summary', {}, h('span', {class: 'sj-s1', text: '자세히'}), h('span', {class: 'sj-s2', text: '값 · 그림 · 목록 · 셈 모두'}), chev()),
    h('div', {class: 'sj-morein'},
      h('p', {class: 'sj-kick'}, h('b', {text: '이 쪽 '}), day(T.asOf?.board) + ' · 우량주 365곳 안'),
      h('section', {class: 'sj-mbox', 'aria-label': '큰 값을 센 길'}, h('h3', {class: 'sj-h3', text: '큰 값을 센 길'}), h('p', {class: 'sj-lead', text: c.LAB + ' · ' + (c.pre != null ? num(c.pre) + '곳' : NEED)}), sixDl(bigSix)),
      h('section', {class: 'sj-mbox', 'aria-label': '상장 회사 → 우량주 → 21칸'}, h('h3', {class: 'sj-h3', text: '상장 회사 → 우량주 → 21칸'}),
        h('ol', {class: 'sj-funnel'}, h('li', {text: '한국 상장 회사 ' + num(T.counts?.listed) + '곳을 셌어요.'}), h('li', {text: '그 가운데 우량주 ' + b365 + '곳을 먼저 골랐어요.'}),
          h('li', {text: '불장 · 꽃이 될 · 돈이 몰리는 7곳씩 21칸이에요. 겹침을 빼면 ' + (T.distinct ?? NEED) + '곳이에요.'}))),
      h('section', {class: 'sj-mbox', 'aria-label': '중간 값'}, h('h3', {class: 'sj-h3', text: '중간 값'}),
        ...mids.map(m => h('div', {class: 'sj-mid'}, h('p', {class: 'sj-midv'}, h('b', {text: m.v ?? NEED}), h('span', {text: m.u}), h('span', {class: 'sj-midl', text: ' ' + m.lab})), h('p', {class: 'sj-mean'}, h('i', {text: '그래서'}), h('span', {text: m.mean})), sixDl(m.six)))),
      h('section', {class: 'sj-mbox', 'aria-label': '전문가용 자세히'}, h('h3', {class: 'sj-h3', text: '전문가용 자세히'}),
        h('ol', {class: 'sj-pro'}, ...pro.map(r => h('li', {}, h('b', {text: r.k}), h('span', {class: 'sj-prov', text: ' ' + r.v}), h('p', {text: r.how}))))),
      h('section', {class: 'sj-mbox sj-ess', 'aria-label': NAME + ' 본질'}, h('h3', {class: 'sj-h3', text: josa(NAME, '는') + ' 이런 곳이에요'}), h('ol', {}, lines.map((t, i) => h('li', {'data-ess': String(i + 1), text: t})))),
      h('p', {class: 'sj-note', text: '이 쪽 목록은 ' + day(T.asOf?.board) + ' 자료로 골랐어요. 앞날을 맞히는 목록이 아니에요.'})));
}

/* ── 11 끝 줄 ── */
function endSec(T, S) {
  const got = S?.fetchedAt ? kstText(S.fetchedAt) : null;
  return h('footer', {class: 'sj-end'},
    h('p', {class: 'sj-enough', text: '사기 전에 한 번 멈춰요.'}),
    h('p', {}, h('b', {text: '출처 '}), '네이버 증권 그날 마지막 값 · ' + josa(NAME, '가') + ' 센 지난 기록'),
    h('p', {}, h('b', {text: '조사 날짜 '}), '자료 ' + day(T.asOf?.board) + (got ? ' · 받은 때 ' + got : '')),
    h('p', {class: 'sj-links'}, ...FOOT.map(([href, t]) => h('a', {href}, h('span', {text: t}), h('i', {'aria-hidden': 'true', text: '›'})))),
    h('p', {class: 'sj-safe sj-safe-end', text: SAFE}));
}

/* ── 12 이야기 막대 · 13 탭 ── */
function dockNav(X) {
  const say = h('button', {class: 'sj-listen', type: 'button', 'aria-label': '읽어 주기', text: '듣기'});
  say.addEventListener('click', () => {
    try {
      const sy = window.speechSynthesis; if (!sy) return;
      if (sy.speaking) { sy.cancel(); return; }
      const t = [...document.querySelectorAll('#su .sj-h1, #su .sj-count .sj-big, #su .sj-count .sj-bl0, #su .sj-count .sj-mean span')].map(e => e.innerText.replace(/\s+/g, ' ')).join('. ');
      const u = new SpeechSynthesisUtterance(t); u.lang = 'ko-KR'; u.rate = 0.9; sy.speak(u);
    } catch { /* 읽어 주기가 없는 기기 */ }
  });
  return h('nav', {class: 'sj-dock', 'aria-label': '다음 화면'},
    h('ol', {class: 'sj-prog', 'aria-label': '여덟 화면 가운데 1번째'}, ...STEP8.slice(1).map((t, i) => h('li', {class: i === 0 ? 'sj-pcur' : '', 'aria-hidden': 'true'}))),
    h('div', {class: 'sj-dk'}, say, h('a', {class: 'sj-next', href: '#/m'}, h('span', {class: 'sj-nk', text: '2 / 8'}), h('b', {text: '21곳은 어느 땅에 있나?'}), h('i', {'aria-hidden': 'true', text: '›'}))));
}
function tabNav(X) {
  const lc = X.cur?.()?.code;
  const T = [['오늘', '#/'], ['지도', '#/m'], ['기록', '#/r'], ['멈춤', lc ? '#/q/' + lc : '#/q'], ['달력', '#/r/c'], ['정산', '#/r/t']], ORD = [0, 1, 3, 2, 4, 5];
  return h('nav', {class: 'sj-tabs', 'aria-label': '탭 — 오늘 · 지도 · 멈춤 · 기록 · 달력 · 정산'}, ORD.map((i, k) => { const [t, href] = T[i];
    return h('a', {class: 'sj-tab' + (i === 0 ? ' sj-cur' : ''), href, 'aria-current': i === 0 ? 'page' : null, 'aria-label': (k + 1) + '번째 · ' + t, text: t}); }));
}

/* ── 장 중 현재가(옛 첫 쪽과 같은 함수 /api/price · 받은 값이 있는 칸만 바꿈 · 장이 열려 있으면 1분마다 · 쪽이 바뀌면 멈춤) ── */
function live(main, dayB) {
  const rows = () => [...main.querySelectorAll('a.sj-row[data-code], a.sj-up3a[data-code]')];
  const codes = [...new Set(rows().map(a => a.getAttribute('data-code')))].filter(c => /^[0-9A-Z]{6}$/.test(c)).sort();
  if (!codes.length || typeof fetch !== 'function') return;
  const base = new WeakMap(); // 칸마다 처음 꺾은선 값(다시 그릴 때 씀)
  for (const a of rows()) { const v = a.getAttribute('data-sp'); if (v) base.set(a, v.split(',').map(Number)); }
  const ask = async () => {
    if (!main.isConnected) return;
    try {
      if (document.visibilityState === 'visible') {
        const r = await fetch('/api/price?codes=' + codes.join(','));
        const j = r.ok ? await r.json() : null;
        if (!j || !j.items || typeof j.day !== 'string') return;
        apply(j);
        if (j.status !== 'open') return;
      }
    } catch { return; }
    setTimeout(ask, 60000);
  };
  const apply = j => {
    let last = null, n = 0;
    for (const a of rows()) {
      const v = j.items?.[a.getAttribute('data-code')], sp0 = base.get(a);
      if (!v || !fin(v.p) || v.p <= 0 || typeof v.t !== 'string' || !sp0 || !(j.day >= (dayB ?? ''))) continue;
      const sp = j.day > dayB ? [...sp0.slice(1), v.p] : [...sp0.slice(0, 20), v.p], price = won(v.p), m = monOf(sp);
      const px = a.querySelector('.sj-px'); if (px) { px.textContent = price; px.classList.remove('sj-need'); }
      const old = a.querySelector('svg.sj-sp'); if (old) old.replaceWith(spark(sp, +old.getAttribute('width'), +old.getAttribute('height'), [...old.classList].filter(x => x !== 'sj-sp').join(' ')));
      const sl = a.querySelector('.sj-rseal'); if (sl) { sl.className = 'sj-seal sj-seal-' + m + ' sj-rseal'; sl.textContent = MONW[m]; sl.setAttribute('data-mon', m); }
      a.setAttribute('data-mon', m);
      let lab = a.getAttribute('aria-label') ?? '';
      lab = lab.replace(/ · 현재가 [^·]+원/, ' · 현재가 ' + price).replace(/ · 한 달 전 [^·]+원/, ' · 한 달 전 ' + won(sp[0])).replace(/ · (한 달 내림|오름|같음)$/, ' · ' + MONW[m]);
      if (a.classList.contains('sj-up3a')) {
        const ch = Math.round((v.p / sp[0] - 1) * 1000) / 10, mon = '한 달 ' + won100(ch), mt = a.querySelector('.sj-mon');
        if (mt) { const was = mt.textContent; mt.textContent = mon; mt.classList.remove('sj-need'); lab = lab.replace(was, mon); }
        const wt = a.querySelector('.sj-why'); if (wt) { const was = wt.textContent, wl = '이유 — ' + (ch < 0 ? '한 달은 내림 · ' : '') + was.replace(/^이유 — (한 달은 내림 · )?/, ''); wt.textContent = wl; lab = lab.replace(was, wl); }
      }
      a.setAttribute('aria-label', lab);
      a.setAttribute('data-px', String(v.p)); a.setAttribute('data-live', v.t);
      if (!last || v.t > last) last = v.t; n++;
    }
    if (!n) return;
    const note = main.querySelector('.sj-pxnote'); if (note) note.textContent = '현재가는 ' + (j.status === 'open' ? hm(last) + ' 값이에요.' : (mday(j.day) ?? '') + ' 마지막 값이에요.');
    main.setAttribute('data-live', j.status + ' ' + last);
  };
  ask();
}

/* ── 쪽 ── */
/** 첫 쪽 — {title, dom: [머리, 본문, 이야기 막대, 탭], after()} · su.js route 가 이것만 붙임(옛 page() · afterPaint() 를 거치지 않음) */
/** 첫 쪽 본문 — shell(su-sonja-top.js sonjaShell 이 먼저 칠한 머리 줄 · 표지)이 붙어 있으면 그 main 뒤에 본문을 이어 붙임(표지를 다시 그리지 않음) */
export async function vSonja(X, shell = null) {
  const [{S}, T] = await Promise.all([X.base(), load21(X.get)]);
  if (!T) return null;
  const nk = k => (T.lists?.[k] ?? []).length, nq = Math.min(7, nk('quiet'));
  const FILT = !!T?.strict && T.strict.mode !== 'mark';
  const nNow = KEY.reduce((a, k) => a + Math.min(7, nk(k)), 0);
  const G = n36of(T), n28 = (FILT ? nNow : 21) + nq, n21 = Object.values(NXK).reduce((a, k) => a + Math.min(7, nk(k)), 0), N36 = G ?? 0;
  const g7 = [...KEY, 'quiet', ...Object.values(NXK)].map(k => T.lists?.[k] ?? []), coNow = coN(g7), b365 = T.counts?.b365 ?? 365;
  const LAB = '우량주 ' + b365 + '곳 가운데 오늘 이름이 오른 회사', MEAN0 = '같은 회사가 여러 칸에 들어요. 칸으로 세면 지금 ' + n28 + '칸 · 될 듯 ' + n21 + '칸' + (G ? ' · 서른여섯 꾀 ' + N36 + '칸' : '') + '이에요.';
  const pre = G ? (Number.isInteger(T.co36) && T.co36 > 0 ? T.co36 : null) : coNow;
  const HOW = T?.listRule === 'culture7-v1' ? '365곳을 한국 투자자 문화 일곱으로 먼저 거르고, 요즘 값 움직임에 맞춰 섞어 본 길로 7곳씩 골랐어요' : '우량주 365곳에서 묶음마다 조건으로 7곳씩 골랐어요';
  const c = {pre, LAB, MEAN: MEAN0, n28, n21, HOW};
  const anyF = KEY.some(k => [...(T.lists?.[k] ?? []), ...(T.lists?.[NXK[k]] ?? [])].slice(0, 14).some(x => fin(x.fomo)));
  X.setFirst?.((T.lists?.hot?.[0] ?? T.lists?.money?.[0])?.code);
  const wait = trickWait(T);
  const nSx = T?.strict?.mode === 'mark' ? [...KEY, ...Object.values(NXK)].reduce((a, k) => a + (T.lists?.[k] ?? []).slice(0, 7).filter(x => x.sx === true).length, 0) : null;
  const dd = mday((okSun(T.sun) ? T.sun.day : null) ?? T.asOf?.board), body = [sunSec(T), wait, countSec(T, c), up3Sec(T), howSec(anyF), ...KEY.map((k, i) => grpSec(T, k, i)), quietSec(T), modeNav(n28, n21), moreBox(T, S, c), endSec(T, S)];
  const keep = !!shell?.main?.isConnected, main = keep ? shell.main : h('main', {class: 'sj-page', 'data-page': 'sonja', 'data-wait': ''}, cover(null)); // data-wait — 칠한 뒤 채우는 것(될 듯 값 · 꾀 칸)이 끝나면 뗌(검사가 기다림)
  main.setAttribute('data-board', T.asOf?.board ?? ''); if (nSx != null) main.setAttribute('data-sx', String(nSx)); main.setAttribute('data-wait', '');
  const step = main.querySelector(':scope > .sj-cover .sj-step'); if (step && dd && !step.querySelector('.sj-stepd')) step.append(stepDay(dd));
  main.append(...body);
  // 꺾은선 처음 값(장 중 현재가가 다시 그릴 때)
  const markSp = TT => {
    const spMap = new Map();
    for (const k of [...KEY, 'quiet', ...Object.values(NXK)]) for (const x of (TT.lists?.[k] ?? []).slice(0, 7)) { const sp = spOf(x, TT.asOf?.board); if (sp) spMap.set(String(x.code), sp); }
    for (const r of TT.top3?.rank ?? []) { const sp = Array.isArray(r?.c) && r.c.length === 21 ? r.c : null; if (sp) spMap.set(String(r.code), sp); }
    for (const a of main.querySelectorAll('a.sj-row[data-code], a.sj-up3a[data-code]')) { const sp = spMap.get(a.getAttribute('data-code')); if (sp && a.querySelector('svg.sj-sp path')) a.setAttribute('data-sp', sp.join(',')); }
  };
  markSp(T);
  const hardOf = () => { const c = main.cloneNode(true); for (const e of c.querySelectorAll('svg, [aria-hidden="true"], [data-proper]')) e.remove(); const left = hardLeft(c.textContent ?? '', []); main.dataset.hard = String(left.length); main.dataset.hardWords = left.join(','); main.dataset.glossed = ''; };
  hardOf();
  const after = async () => {
    // 될 듯 셋의 그날 값(su21-next.json) — 받으면 될 듯 줄만 다시 그림(같은 셈 · 못 받으면 「확인 필요」 그대로)
    const pN = X.get(DNX).catch(() => null), pG = wait ? X.get(D36).catch(() => null) : null; // 둘을 함께 받음
    const nxt = await pN;
    if (!main.isConnected) return;
    if (nxt) { const T2 = withNext(T, nxt); for (const k of KEY) { const ol = main.querySelector(`section.sj-grp[data-k="${k}"] ol[data-side="next"]`); if (ol) ol.replaceChildren(...grpItems(T2, k, true).map(rowItem)); } markSp(T2); }
    live(main, T.asOf?.board ?? null);
    if (!wait) { hardOf(); main.removeAttribute('data-wait'); return; }
    const g = await pG;
    if (!wait.isConnected) return;
    const ok = ok36(g, T);
    if (ok) wait.replaceWith(trickSec(g, T)); else wait.remove();
    hardOf();
    const bv = main.querySelector('.sj-count .sj-huge'), u = main.querySelector('.sj-count .sj-unit'), bl = main.querySelector('.sj-count .sj-bl0'), mn = main.querySelector('.sj-count .sj-mean span');
    if (bv) {
      const n = ok ? coN([...g7, ...g.kinds.map(k => g.lists[k])]) : coNow;
      if (bv.textContent !== num(n)) bv.textContent = num(n);
      if (u && u.textContent !== '곳') u.textContent = '곳';
      bv.setAttribute('data-co', String(n));
      if (bl && !ok) bl.textContent = '우량주 ' + b365 + '곳 가운데 지금 · 될 듯 칸에 이름이 오른 회사';
      if (mn && !ok) mn.textContent = MEAN0 + ' 서른여섯 꾀 회사는 받지 못해 빼고 셌어요.';
    }
    main.removeAttribute('data-wait');
  };
  const dock = dockNav(X), tabs = tabNav(X);
  return {title: '오늘', keep, dom: [keep ? shell.top : topBar(), main, dock, tabs], rest: [dock, tabs], after}; // keep = 먼저 칠한 판에 이어 붙임(su.js 는 rest 만 붙임)
}
