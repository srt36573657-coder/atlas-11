/* 큐피트(옛 이름 수르) — 21곳 길(빈 파일에서 새로 씀 · 주문 2044 · 사장님 2026-11-04 15:44(+04) 「전면 개편 명령서」)
   [한 문장] 「주식을 전혀 모르는 사람도 7번 눌러 지금 볼 21곳을 알게 하는 곳이다.」
   ① 21곳 한눈에 #/ → ② 땅 지도 #/m → ③ 업종 #/m/<땅> → ④ 회사 #/c/<번호>(su.js) → ⑤ 회사 자세히 #/c/<번호>/more(오른 날 · 내린 날 표 · 그래프 · 뉴스 · 수급)
   → ⑥ 「왜 사?」 #/q/<번호>(su-why.js) → ⑦ 매매일지 · 내 종목 점검 #/j → ⑧ 친구에게 #/f(카톡 보내기 · 소개 영상 · 내 종목 · 진화 · 찾기 · 영어 · 천사)
   2026-11-14 고침(사장님 08:22 「앞뒤가 맞게」 · 08:27 「과거 찌꺼기 버릴 것은 버리고」) — 보상 칸(상품권 · 커피 쿠폰) · 「사장님」 속말 · 「출목표」 이름 · 「곧 그렇게 될」 말투를 뺌
   자료 /su/data/su21.json(scripts/atlas11/next/su21.py — 상장 2,557곳 → 우량주 365곳(n365-v1) → 불장 7 · 꽃이 될 7 · 돈이 몰리는 7 · 겹침) · 숫자는 자료 그대로 */
import {h, s} from '/su/su-fig.js';
import {NEED, val, num, ymd, joEok} from '/su/su-six.js';
import {won100, more100} from '/su/su-data.js'; // 「%」 대신 100원 말 — 쪽마다 같은 값 글(주문 1114-1306 · 사장님 2026-11-14 13:06 「「몇 %」를 「100원이 ○원」으로 바꾸는 일이 가장 커요 다 해」)
import {NAME, josa as josaH} from '/next/brand.js';
/** 토씨 — 이름 끝이 영어 · 숫자면 읽는 소리로 받침을 봄(CJ ENM 「엠」→ 은 · KT&G 「지」→ 는 · 받침 소리 L M N R 과 0 1 3 6 7 8) · 한글 끝은 brand.js 그대로 */
const JPAIR = {은: ['은', '는'], 는: ['은', '는'], 이: ['이', '가'], 가: ['이', '가'], 을: ['을', '를'], 를: ['을', '를'], 과: ['과', '와'], 와: ['과', '와']};
const josa = (w, p) => { const t = String(w ?? ''); if (!/[A-Za-z0-9]$/.test(t) || !JPAIR[p]) return josaH(t, p); return t + JPAIR[p][/[LMNR]$/i.test(t) || /[013678]$/.test(t) ? 0 : 1]; };

export const D21 = '/su/data/su21.json';
/** 서른여섯 꾀 수(주문 1114-0004 · su21.py 가 su21.json s36n 에 꾀마다 고른 수를 적음) — 꾀마다 일곱까지 더함 · 없으면(옛 판 · 꾀를 못 센 날) null */
export const n36of = T => { const m = T?.s36n; if (!m || typeof m !== 'object') return null; const v = Object.values(m); return v.length === 36 && v.every(x => Number.isInteger(x) && x >= 0) ? v.reduce((a, x) => a + Math.min(7, x), 0) : null; };
export const KIND = {hot: '불장', bloom: '꽃이 될', money: '돈이 몰리는', hotNext: '불장이 될 듯', bloomNext: '꽃이 될 듯', moneyNext: '돈이 몰릴 듯'};
const KEY = ['hot', 'bloom', 'money'], KEYN = ['hotNext', 'bloomNext', 'moneyNext'], KEY6 = [...KEY, ...KEYN], BEAT = ['b1', 'b2', 'b3', 'b4']; // 될 듯 셋(주문 1103 · 사장님 2026-11-08 11:03 · 11:08 「응」)
const fin = x => typeof x === 'number' && Number.isFinite(x);
/** 오른 만큼(퍼센트 수)은 「100원이 150.5원」(su-data.js won100) · 시장보다 앞선 만큼은 「시장보다 100원에 18원 더 올랐어요」(more100) — 부호만 붙은 수(「+18」 · 「15」)를 화면에 남기지 않음(주문 1114-1306) */
const wonN = x => (fin(x) ? won100(x) : NEED);
const mkt = x => (fin(x) ? '시장보다 ' + more100(x) + ' 올랐어요' : '시장보다 앞선 만큼은 ' + NEED + '예요');
const miss100 = p => (fin(p) ? num(Math.round((100 - p) * 10) / 10) : NEED); // 100번 가운데 그렇게 되지 않은 번 수(자료 per100 · old100 의 나머지 — 손실 쪽을 먼저 보임 · 새 셈 아님)
const SRC = '네이버 증권 그날 마지막 값 · 큐피트가 셈';
const day = d => ymd(d) ?? NEED;

/** 21곳 자료 — 한 번만 받음 */
let CACHE = null;
export async function load21(get) { if (!CACHE) CACHE = await get(D21); return CACHE; }
export const D21M = '/su/data/su21-map.json'; // 땅 지도(365곳 모두)는 따로 받음 — 첫 화면이 가볍게
let MAP = null;
async function loadMap(get) { const [T, M] = await Promise.all([load21(get), MAP ?? get(D21M)]); MAP = M; return {...T, lands: M.lands ?? []}; }
export function find21(T, code) { for (const k of KEY6) for (const c of T?.lists?.[k] ?? []) if (c.code === code) return c; return null; }

/** 될 듯 셋의 지난 1년 기록 한 줄(su_next_past.py — 날마다 고른 일곱을 모두 셈 · 아무 회사와 견줌) */
const PASTW0 = {hotNext: '불장 일곱에 들었어요', moneyNext: '돈이 몰리는 일곱에 들었어요', bloomNext: '시장보다 100원에 15원 넘게 앞섰어요'}; // 「(꽃)」은 뺌 — 회사 꽃의 선은 100원에 5원이라 이 15원 선과 다름(점검 W1)
const PASTWP = {...PASTW0, bloomNext: '고른 날부터 시장보다 100원에 15원 넘게 앞섰어요'}; // 주문 0103 — 꽃이 될 듯 맞음을 고른 날 값부터 셈(past.bloomFrom = 'pick')
const PW = T => (T?.past?.bloomFrom === 'pick' ? PASTWP : PASTW0);
/** 자료(su_next_past.py past.what)의 「시장보다 15 넘게 앞섬(꽃)」도 화면에 내기 직전에 같은 100원 말로(위 PASTW 글과 같게 · 자료 파일은 그대로) */
const whatSay = t => (typeof t === 'string' && t ? t.replace(/시장보다 (\d+(?:\.\d+)?) 넘게 앞섬(?:\(꽃\))?/, '시장보다 100원에 $1원 넘게 앞섬') : NEED);
/** 엄격 셈 판 둘 — FILT = 거른 곳만 칸에(주문 0854 첫 판 · 옛 자료) · MARK = 42칸 그대로 · 모두 지난 칸에 「수르 계산법」 표(주문 1209 · 사장님 2026-11-09 12:09) */
const FILT = T => !!T?.strict && T.strict.mode !== 'mark', MARK = T => T?.strict?.mode === 'mark';
/** 몬테카를로 차례 판(주문 1422 · 사장님 2026-11-09 14:22 「365 전 종목을 몬테카를로 계산법으로 찾은 다음 소거법으로 1번만 돌려서 42개를 찾고 … 1억 번 … 1등 2등 3등」) */
const MCR = T => T?.listRule === 'mc365-v1' || T?.listRule === 'culture7-v1';
const CUR = T => T?.listRule === 'culture7-v1';
const korN = n => { if (!fin(n)) return NEED; n = Math.round(n); if (n >= 1e8) { const e = Math.floor(n / 1e8), r = n % 1e8; return num(e) + '억' + (r ? ' ' + korN(r) : ''); } if (n >= 1e4) { const m = Math.floor(n / 1e4), r = n % 1e4; return num(m) + '만' + (r ? ' ' + num(r) : ''); } return num(n); }; // 1억 · 10만(읽기 쉽게)
const mcN = (T, c) => (fin(c?.mc?.p) ? korN(Math.round(c.mc.p * (T?.mc?.paths ?? 100000))) + '번' : NEED);
const TEN = T => korN(T?.mc?.paths ?? 100000);
const HOW_CUR = T => '365곳을 한국 투자자 문화 일곱으로 먼저 거르고, 요즘 값 움직임에 맞춰 ' + TEN(T) + '번 섞어 본 길로 7곳씩 골랐어요'; // 지금 · 될 듯 두 쪽이 같은 말(2026-11-14 — 쪽마다 셈 설명이 달랐음)
const nSx = (T, ks) => ks.reduce((a, k) => a + (T?.lists?.[k] ?? []).filter(c => c.sx === true).length, 0);
const pastLine0 = (k, T) => { const p = T?.past?.[k]; return !p ? '' : T.past.cultureRank && Number.isFinite(p.mc100)
  ? '지난 1년 날마다 이렇게 고른 일곱을 모두 세면 100번에 ' + p.per100 + '번이 한 달 안에 ' + PW(T)[k] + '. 나머지 ' + miss100(p.per100) + '번은 그러지 못했어요. 바로 앞 셈은 ' + p.mc100 + '번, 예전 셈은 ' + p.old100 + '번, 아무 회사는 ' + p.base100 + '번이었어요.'
  : T.past.mcRank && Number.isFinite(p.old100) // 주문 1422 — 몬테카를로 차례로 고른 일곱 · 예전 셈 · 아무 회사
  ? '지난 1년 날마다 이렇게 고른 일곱을 모두 세면 100번에 ' + p.per100 + '번이 한 달 안에 ' + PW(T)[k] + '. 나머지 ' + miss100(p.per100) + '번은 그러지 못했어요. 예전 셈은 ' + p.old100 + '번, 아무 회사는 ' + p.base100 + '번이었어요.'
  : MARK(T) && T.past.strict && Number.isFinite(p.old100) // 주문 1209 — 일곱(칸) · 그 가운데 큐피트 계산법 표 · 아무 회사
  ? '지난 1년 날마다 이렇게 고른 일곱을 모두 세면 100번에 ' + p.old100 + '번이 한 달 안에 ' + PW(T)[k] + '. 그 가운데 큐피트 계산법으로 찾은 곳은 ' + p.per100 + '번, 아무 회사는 ' + p.base100 + '번이었어요. 일곱이 그러지 못한 때는 100번에 ' + miss100(p.old100) + '번이에요.'
  : T.past.strict && Number.isFinite(p.old100) // 엄격 셈(주문 0854) — 옛 일곱을 거른 곳 · 옛 셈 · 아무 회사를 함께
  ? '지난 1년 날마다 이렇게 엄격하게 거른 곳을 모두 세면 100번에 ' + p.per100 + '번이 한 달 안에 ' + PW(T)[k] + '. 나머지 ' + miss100(p.per100) + '번은 그러지 못했어요. 거르기 전 일곱은 100번에 ' + p.old100 + '번, 아무 회사는 ' + p.base100 + '번이었어요.'
  : '지난 1년 날마다 이렇게 고른 일곱을 모두 세면 100번에 ' + p.per100 + '번이 한 달 안에 ' + PW(T)[k] + '. 나머지 ' + miss100(p.per100) + '번은 그러지 못했어요. 아무 회사는 100번에 ' + p.base100 + '번이었어요.'; };
/** 까닭 한 줄(학생 말) — 왜 이 회사가 21곳에 들었나 · past = false 면 지난 1년 기록 줄을 붙이지 않음(될 듯 쪽은 묶음마다 위에 한 번만 — 회사마다 같은 문장 되풀이 뺌 2026-11-14) */
export function why21(c, k, T, past = true) {
  const w = c.why ?? {}, pastLine = past ? pastLine0 : () => '';
  if (MCR(T)) { // 주문 1422 — 소거 한 번 조건 · 몬테카를로 드묾 · 드문 차례
    const pm = CUR(T) && fin(c?.mc?.pm), mc = (pm ? '365곳 모두의 길과 견주면 ' + TEN(T) + '번 가운데 이만큼은 ' + korN(Math.round(c.mc.pm * (T?.mc?.paths ?? 100000))) + '번' : (CUR(T) ? '요즘 흔들림에 맞춰 ' : '') + TEN(T) + '번 섞어 보니 이만큼은 ' + mcN(T, c))
      + '뿐이에요.'; // 「차례로 ○번째」는 뺌(번 수와 차례가 거꾸로 섞이고 업종마다 둘까지라 번호가 건너뜀 · 2026-11-14)
    if (k === 'hot') return c.ind + ' 업종은 불장 업종이에요. ' + josa(c.name, '은') + ' 20거래일 동안 ' + (fin(c.ch20) ? won100(c.ch20) + '이 될 만큼 올랐어요. ' : '오른 만큼은 ' + NEED + '예요. ') + mc;
    if (k === 'bloom') return josa(c.name, '은') + ' 아직 「싹」이에요. ' + c.ind + ' 업종이 20거래일 동안 ' + mkt(c.mc?.stat) + '. ' + mc;
    if (k === 'money') return c.ind + ' 업종이 20거래일 동안 ' + mkt(c.mc?.stat) + '. ' + mc + ' 그 업종에서 ' + c.name + '의 회사 크기가 20거래일 동안 ' + joEok(w.gain) + ' 늘어 가장 많았어요.';
    if (k === 'hotNext') return josa(c.name, '은') + ' 불장 일곱 밖에서 닷새 동안 ' + (fin(w.r5) ? won100(w.r5) + '이 될 만큼 올랐어요. ' : '오른 만큼은 ' + NEED + '예요. ') + mc + ' ' + pastLine(k, T);
    if (k === 'moneyNext') return c.ind + ' 업종이 닷새 동안 ' + mkt(c.mc?.stat) + '. ' + mc + ' 그 업종에서 ' + c.name + '의 회사 크기가 닷새 동안 ' + joEok(w.gain) + ' 늘어 가장 많았어요. ' + pastLine(k, T);
    return josa(c.name, '은') + ' 아직 「싹」이에요. 닷새 동안 ' + mkt(c.mc?.stat) + '. ' + mc + ' ' + pastLine(k, T);
  }
  if (k === 'hotNext') return (w.how === 'rank' ? c.ind + ' 업종은 불장 업종이에요. ' + josa(c.name, '은') + ' 그 안에서 20거래일 동안 오른 차례가 ' + w.rank + '번째라 불장 일곱 바로 아래예요.'
    : josa(c.name, '은') + ' 닷새 동안 ' + (fin(w.r5) ? won100(w.r5) + '이 될 만큼' : '') + ' 막 오르기 시작했어요. ' + c.ind + ' 업종도 닷새 동안 올랐어요.') + ' ' + pastLine(k, T);
  if (k === 'moneyNext') return (w.how === 'rank' ? c.ind + ' 업종은 한 달 동안 ' + mkt(w.indX) + '. 돈이 몰리는 일곱 바로 아래 업종(' + w.rank + '번째)이에요. 그 업종 우량주 가운데 ' + c.name + '의 회사 크기가 20거래일 동안 ' + joEok(w.gain) + ' 늘어 가장 많았어요.'
    : c.ind + ' 업종 우량주 가운데 ' + c.name + '의 회사 크기가 닷새 동안 ' + joEok(w.gain) + ' 늘어 가장 많았어요.') + ' ' + pastLine(k, T);
  if (k === 'bloomNext') return josa(c.name, '은') + ' 아직 「싹」이에요. 한 달 동안 시장보다 앞선 만큼이 100원에 5원 아래예요. ' + (w.how === 'main' ? '닷새 동안은 ' + mkt(w.x5) + '. 20거래일 동안도 올랐어요.' : '회사 크기가 위에서 다섯에 하나 안이고, 닷새 동안 ' + mkt(w.x5) + '.') + ' ' + pastLine(k, T);
  if (k === 'hot') return c.ind + ' 업종 우량주 평균이 지난 20거래일 동안 ' + (fin(w.ind20) ? won100(w.ind20) + '이 될 만큼 움직였어요.' : '얼마나 움직였는지는 ' + NEED + '예요.') + ' 그 가운데 ' + josa(c.name, '은') + ' ' + day(c.date) + '까지 20거래일 동안 ' + (fin(c.ch20) ? won100(c.ch20) + '이 될 만큼 올라' : '오른 만큼은 ' + NEED + '이지만') + ' 불장 7곳에 들었어요.';
  if (k === 'bloom') return c.ind + ' 업종이 한 달 동안 ' + mkt(w.indX) + '. ' + josa(c.name, '은') + ' 아직 「싹」이에요. ' + (w.full ? '꽃 조건을 모두 채웠어요.' : '꽃 조건을 다 채우지는 못한, 가장 가까운 곳이에요.');
  return c.ind + ' 업종이 한 달 동안 ' + mkt(w.indX) + '. 그 업종 우량주 가운데 ' + c.name + '의 회사 크기가 20거래일 동안 ' + joEok(w.gain) + ' 늘어 가장 많았어요.';
}
const six21 = (c, k, T) => ({누가: c.name + ' · ' + c.ind + ' 업종', 언제: day(T?.asOf?.board) + ' 자료', 어디서: '우량주 365곳 안(' + (c.land ?? NEED) + ')', 무엇을: KIND[k] + ' 7곳에 들었어요', 어떻게: T?.rules?.[k] ?? null, 왜: why21(c, k, T)});

/* ── 그림 ── */
/** 깔때기 띠 — 상장 2,557 → 우량주 365 → 21 */
function funnel3(T) {
  const W = 390, n = [T.counts.listed, T.counts.b365, T.distinct], H = 150;
  const lab = ['상장 회사 ' + num(n[0]) + '곳', '우량주 ' + n[1] + '곳', '21칸 · 겹침 빼면 ' + n[2] + '곳']; // 21 은 칸 수 — 같은 회사가 두 칸에 들면 두 번 셈(주문 1114-1306 ⑤)
  const w = v => 40 + 310 * Math.sqrt(v / n[0]); // 넓이 = 회사 수의 제곱근(작은 수도 보이게)
  return s('svg', {class: 'su-svg su-f3', viewBox: `0 0 ${W} ${H}`, role: 'img', 'aria-label': '상장 ' + num(n[0]) + '곳 → 우량주 ' + n[1] + '곳 → 21칸(겹침 빼면 ' + n[2] + '곳)'},
    n.map((v, i) => { const ww = w(v), inside = ww >= 250; // 막대 안에 글이 안 들어가면 막대 오른쪽에(글이 잘리지 않게)
      return [s('rect', {x: 12, y: 8 + i * 46, width: ww, height: 36, rx: 18, class: ['g-basefill', 'g-ok', 'g-bad'][i] + ' ' + BEAT[i] + ' a-gx'}),
        s('text', {x: inside ? 12 + ww / 2 : 12 + ww + 10, y: 33 + i * 46, 'text-anchor': inside ? 'middle' : 'start', class: 'g-tl ' + (inside ? 'g-tw' : 'g-tland') + ' ' + BEAT[i] + ' a-up', text: lab[i]})]; }));
}
/** 21곳 한눈에 — 셋 줄 × 일곱 · 겹친 곳은 ✦ */
function grid21(T, keys = KEY) {
  const col = k => h('ol', {class: 'su-21c su-21-' + k, 'aria-label': KIND[k] + ' 7곳'}, h('li', {class: 'su-21h', text: KIND[k]}), // 이름표와 색으로 셋이 갈림(주문 0054 [2] 3) · 셋의 길은 아래 칩(#/g)
    (T.lists[k] ?? []).map((c, i) => { const x2 = c.in.filter(q => keys.includes(q)).length > 1; return h('li', {class: 'su-21t' + (x2 ? ' su-21x' : '')},
      h('a', {href: '#/c/' + c.code, 'data-proper': ''}, x2 ? h('i', {'aria-label': '겹침', text: '✦'}) : null, h('span', {text: c.name}))); }));
  return h('div', {class: 'su-21w'}, h('div', {class: 'su-g su-21g'}, keys.map(col))); // 옛 급등 두 칩은 뺌(본질 「급등 자랑」 · DISCARD 6) · 옛 기능 칸(#/g 셋의 길) 고리도 뺌 — 그 쪽을 버림(주문 1114-1306 ⑧)
}
/** 땅마다 ✦(21곳에 든 회사) 수 · ✦ 가 가장 많은 땅(같으면 자료 차례 앞) — 그림 칸 차례 · 다음 단추가 같은 잣대 */
const starN = L => L.inds.flatMap(g => g.cos).filter(c => c.in.length).length;
const byStar = T => [...T.lands].sort((a, b) => starN(b) - starN(a));
const topLand = T => { const L = byStar(T)[0]; return L && starN(L) ? L : null; };
/** 땅 지도 — 열 땅 · 칸 크기 = 365곳 가운데 회사 수 · 별 = 21곳 · ✦ 많은 차례(위쪽 열 칸 · 다음 단추와 같게) */
function landMap(T) {
  const W = 390, cols = 2, cw = (W - 24 - 10) / cols, rows = Math.ceil(T.lands.length / cols), rh = 74, H = rows * (rh + 8) + 8;
  return s('svg', {class: 'su-svg su-land', viewBox: `0 0 ${W} ${H}`, role: 'img', 'aria-label': '땅 지도 · 열 땅 · 별은 21곳'},
    byStar(T).map((L, i) => { const x = 12 + (i % cols) * (cw + 10), y = 8 + Math.floor(i / cols) * (rh + 8), cos = L.inds.flatMap(g => g.cos), star = starN(L);
      return s('a', {href: '#/m/' + L.id}, s('rect', {x, y, width: cw, height: rh, rx: 16, class: (star ? 'g-landon' : 'g-land') + ' ' + BEAT[i % 4] + ' a-pop'}),
        s('text', {x: x + 12, y: y + 30, class: 'g-tl g-tland', text: L.name.length > 9 ? L.name.slice(0, 9) + '…' : L.name}),
        s('text', {x: x + 12, y: y + 58, class: 'g-tl g-tsub', text: cos.length + '곳' + (star ? ' · ✦ ' + star : '')})); }));
}
/** 업종 막대 — 이 땅의 업종 · 업종마다 우량주 회사들의 20거래일 평균 */
function indBars(L) {
  const W = 390, rh = 60, H = L.inds.length * rh + 10, max = Math.max(1, ...L.inds.map(g => Math.abs(g.ch20 ?? 0))), mid = 200, span = 125; // 이름은 막대 위 줄에 — 막대와 겹치지 않게
  const em = t => [...String(t)].reduce((a, ch) => a + (/[가-힣]/.test(ch) ? 1 : /[0-9]/.test(ch) ? 0.62 : 0.34), 0); // 글 폭 어림(19px 한 글자 = 1)
  return s('svg', {class: 'su-svg su-ib', viewBox: `0 0 ${W} ${H}`, role: 'img', 'aria-label': L.name + ' 업종 · 20거래일 동안 100원이 몇 원이 됐나'},
    s('line', {x1: mid, y1: 4, x2: mid, y2: H - 4, class: 'g-axis'}),
    L.inds.map((g, i) => { const v = g.ch20 ?? 0, w = span * Math.abs(v) / max, y = 6 + i * rh, vt = wonN(g.ch20), room = Math.max(5, Math.floor((W - 60 - em(vt) * 19) / 19)); // 값 글은 이름 줄 오른쪽 끝(이름은 남는 자리만큼 · 양옆 24 안쪽 — 그림 틀 테에 가리지 않게)
      return [s('text', {x: 24, y: y + 20, class: 'g-tl g-tsub', text: g.name.length > room ? g.name.slice(0, room - 1) + '…' : g.name}),
        s('text', {x: W - 24, y: y + 20, 'text-anchor': 'end', class: 'g-tl g-tsub', text: vt}),
        s('rect', {x: v >= 0 ? mid : mid - w, y: y + 28, width: Math.max(2, w), height: 24, rx: 8, class: (v >= 0 ? 'g-ok' : 'g-bad') + ' ' + BEAT[i % 4] + ' a-gx'})]; }));
}
/** 오른 날 · 내린 날 표 — 날마다 오른 날 ● · 내린 날 ○ · 같은 쪽이 이어지면 아래로 쌓음 */
function road(c) {
  const l = c?.c ?? [], d = l.slice(1).map((v, i) => (v > l[i] ? 1 : v < l[i] ? -1 : 0)), cols = [];
  for (const x of d) { const lc = cols[cols.length - 1]; if (lc && lc.v === x && lc.n.length < 6) lc.n.push(x); else cols.push({v: x, n: [x]}); }
  const W = 390, cs = 30, H = 6 * cs + 20, x0 = (W - cols.length * cs) / 2;
  return s('svg', {class: 'su-svg su-road', viewBox: `0 0 ${W} ${H}`, role: 'img', 'aria-label': '오른 날 · 내린 날 표 · 내린 날 ' + d.filter(x => x < 0).length + ' · 오른 날 ' + d.filter(x => x > 0).length},
    cols.map((cl, i) => cl.n.map((x, j) => s('circle', {cx: x0 + i * cs + cs / 2, cy: 10 + j * cs + cs / 2, r: 11, class: (x > 0 ? 'g-up' : x < 0 ? 'g-dn' : 'g-eq') + ' ' + BEAT[Math.min(3, Math.floor(4 * i / Math.max(1, cols.length)))] + ' a-pop'}))));
}
/** 21일 줄 — 그날 마지막 값 */
function line21(c) {
  const l = (c?.c ?? []).filter(fin); if (l.length < 2) return null;
  const W = 390, H = 220, lo = Math.min(...l), hi = Math.max(...l), y = v => 20 + (H - 40) * (1 - (v - lo) / Math.max(1, hi - lo)), x = i => 20 + (W - 40) * i / (l.length - 1);
  return s('svg', {class: 'su-svg su-l21', viewBox: `0 0 ${W} ${H}`, role: 'img', 'aria-label': c.name + ' 21거래일 그날 마지막 값'},
    s('polyline', {points: l.map((v, i) => x(i).toFixed(1) + ',' + y(v).toFixed(1)).join(' '), class: 'g-co b2 a-draw', pathLength: 1}),
    s('circle', {cx: x(l.length - 1), cy: y(l[l.length - 1]), r: 6, class: 'g-ok b4 a-pop'}));
}
/** 뜨거운 태양 — 1년 가장 낮은 값과 가장 높은 값 사이 어디쯤(pos52 · 0~1) · 가장 높은 값 가까이(0.95 넘게)면 해살 */
function sun52(c) {
  const p = c?.pos52; if (!fin(p)) return null;
  const W = 390, H = 150, x0 = 36, x1 = 354, x = x0 + (x1 - x0) * Math.max(0, Math.min(1, p)), y = 84, hot = p >= 0.95;
  return s('svg', {class: 'su-svg su-sun', viewBox: `0 0 ${W} ${H}`, role: 'img', 'aria-label': '1년 사이 값 자리 · 100칸 가운데 ' + Math.round(p * 100) + '번째'},
    s('line', {x1: x0, y1: y, x2: x1, y2: y, class: 'g-axis'}),
    s('rect', {x: x0, y: y - 8, width: Math.max(2, x - x0), height: 16, rx: 8, class: 'g-ok b1 a-gx'}),
    hot ? Array.from({length: 8}, (_, i) => s('line', {x1: x + 22 * Math.cos(i * Math.PI / 4), y1: y + 22 * Math.sin(i * Math.PI / 4), x2: x + 32 * Math.cos(i * Math.PI / 4), y2: y + 32 * Math.sin(i * Math.PI / 4), class: 'g-ray b3 a-up'})) : null,
    s('circle', {cx: x, cy: y, r: 16, class: (hot ? 'g-bad' : 'g-up') + ' b2 a-pop'}),
    s('text', {x: x0, y: 136, class: 'g-tl g-tsub', text: '1년 가장 낮은 값'}),
    s('text', {x: x1, y: 136, 'text-anchor': 'end', class: 'g-tl g-tsub', text: '가장 높은 값'}),
    s('text', {x: Math.min(Math.max(x, 120), 270), y: 40, 'text-anchor': 'middle', class: 'g-tl g-tland', text: hot ? '☀ 1년 가장 높은 값 가까이' : '100칸 가운데 ' + Math.round(p * 100) + '번째'}));
}
/** 친구에게 — 꽃잎 여섯(카톡 보내기 · 소개 영상 · 내 종목 · 진화 · 종목 찾기 · 영어 — 아래 칸과 같은 이름 · 보상 칸은 뺌 2026-11-14) */
function petals6() {
  const W = 390, H = 440, cx = W / 2, cy = 220;
  return s('svg', {class: 'su-svg su-p6', viewBox: `0 0 ${W} ${H}`, role: 'img', 'aria-label': '친구에게 건네는 여섯 가지'},
    Array.from({length: 6}, (_, i) => s('g', {transform: `rotate(${i * 60} ${cx} ${cy})`}, s('ellipse', {cx, cy: cy - 106, rx: 48, ry: 102, class: 'o-pet ' + BEAT[i % 4] + ' a-pop'}))),
    ['카톡 보내기', '소개 영상', '내 종목', '진화', '종목 찾기', '영어'].map((t, i) => s('text', {x: cx + 150 * Math.sin(i * Math.PI / 3), y: cy - 150 * Math.cos(i * Math.PI / 3) + 8, 'text-anchor': 'middle', class: 'g-tl g-tland ' + BEAT[i % 4] + ' a-up', text: t})), // 꽃잎마다 친구에게 건네는 것
    s('circle', {cx, cy, r: 34, class: 'o-core b4 a-pop'}), s('text', {x: cx, y: cy + 8, 'text-anchor': 'middle', class: 'g-tl g-tw', text: '21곳'}));
}

/* ── 쪽 ── */
const ruleRows = T => [{k: '상장 회사', v: num(T.counts.listed) + '곳', how: (T.counts.listedWhat ?? '') + ' · /atlas/data/mkt.json · 자료 ' + day(T.asOf.mkt)},
  {k: '우량주', v: T.counts.b365 + '곳', how: T.rules.b365 + ' · 고른 갈래 ' + Object.entries(T.counts.kinds ?? {}).map(([k, v]) => k + ' ' + v).join(' · ')},
  {k: '불장 업종', v: T.counts.hotInds + '곳', how: T.rules.hot + ' · 후보 ' + T.counts.hotPool + '곳'},
  {k: '꽃이 될 후보', v: T.counts.bloomPool + '곳', how: T.rules.bloom + ' · 꽃 조건을 모두 채운 곳 ' + T.counts.bloomFull + '곳'},
  {k: '돈이 몰리는', v: (T.lists.money ?? []).length + '곳', how: T.rules.money},
  {k: '겹침', v: T.overlap.length + '곳', how: T.overlap.map(o => o.name + '(' + o.in.map(k => KIND[k]).join(' · ') + ')').join(' · ') || '없음'},
  {k: '값이 늦어 뺀 회사', v: T.counts.late + '곳', how: '그날 값이 아직 없어 오르내림을 재지 못했어요 · 불장 셈에서 뺐어요'}];

/** 지금 · 될 듯 두 칸(주문 1103 이해 보고 7 「세 여인마다 「지금 일곱」과 「될 듯 일곱」 두 칸」) — 같은 세 여인 그림에서 #/ ↔ #/n
 *  28 · 21 은 칸 수(같은 회사가 두 칸에 들면 두 번 셈) — 「곳」(회사 수)이라 부르지 않음(주문 1114-1306 ⑤ · 첫 쪽 그림 「칸으로 세면 지금 28칸 · 될 듯 21칸」과 같은 말) */
const modeBar = nx => h('nav', {class: 'su-mode', 'aria-label': '지금 28칸 · 될 듯 21칸'}, // 지금 28칸 = 셋 창 21칸 + 넷째 창 7칸(주문 1111-1334)
  h('a', {class: 'su-modea' + (nx ? '' : ' on'), href: '#/', 'aria-current': nx ? null : 'page'}, h('b', {text: '지금 28칸'}), h('span', {text: '지금 그런 회사'})),
  h('a', {class: 'su-modea' + (nx ? ' on' : ''), href: '#/n', 'aria-current': nx ? 'page' : null}, h('b', {text: '될 듯 21칸'}), h('span', {text: '그렇게 되기 전 모습을 닮은 회사'})));
/** 오늘 이름이 오른 회사 — 묶음마다 앞 일곱 · 같은 회사는 한 번(칸마다 센 301칸을 회사 수처럼 부르지 않음 — 주문 1114-1306 ⑤ · 점검 A3) */
const coN = groups => new Set(groups.flatMap(g => (Array.isArray(g) ? g : []).slice(0, 7).map(c => c?.code).filter(Boolean))).size;
/** 서른여섯 꾀 칸 자료 — 첫 쪽 그림(su-apple.js D36 · ok36)과 같은 파일 · 21곳 판과 같은 날 · 꾀마다 같은 수일 때만 씀 */
const D36 = '/su/data/su21-s36.json';
const ok36 = (g, T) => !!g && g.schema === 'su21-s36-1' && Array.isArray(g.kinds) && g.kinds.length === 36 && !!g.lists && typeof g.lists === 'object' && g.asOf?.board === T?.asOf?.board
  && g.kinds.every(k => Array.isArray(g.lists[k]) && g.lists[k].length === T?.s36n?.[k]);
/** 큰 그림이 칠해진 뒤(꾀 칸 자료는 그 뒤에 받음 — 느린 휴대폰 첫 화면 2.5초 · 그림 부품과 같은 때 같은 파일) · 5초 넘게 안 끝나면 그냥 감 */
const heroDone = () => new Promise(ok => {
  const f = typeof document === 'undefined' ? null : document.querySelector('#su main > .su-hero');
  if (!f || !f.hasAttribute('data-wait')) { ok(); return; }
  const mo = new MutationObserver(() => { if (!f.hasAttribute('data-wait')) { mo.disconnect(); ok(); } });
  mo.observe(f, {attributes: true, attributeFilter: ['data-wait']}); setTimeout(() => { mo.disconnect(); ok(); }, 5000);
});
export async function v21Home(X) {
  const [{S}, T] = await Promise.all([X.base(), load21(X.get)]);
  const nk = k => (T.lists?.[k] ?? []).length, nNow = KEY.reduce((a, k) => a + nk(k), 0); // 엄격 셈(주문 0854)이면 일곱이 안 될 수 있음 — 센 그대로
  const nq = Math.min(7, nk('quiet')), qs = nq ? ' · 조용한 힘 ' + nq : ''; // 짧은 이름(조용한 힘 달력과 같은 말 — 큰 수 아래 한 줄이 길어 첫 화면이 늦게 칠해지지 않게) // 넷째 창(주문 1111-1334 · 사장님 2026-11-11 13:34 「… 하나더 만들어라 그래서 총 28개로」)
  // 주문 1114-0004(사장님 2026-11-14 00:04 「… 기존에 있는 불장 … 그것도 내비두고 또 거기다 36 까지 … 그 총 개수를 정리」 · 00:07 「맞아」) — 큰 값 = 지금 28 + 될 듯 21 + 서른여섯 꾀 252 = 모두(묶음마다 따로 셈)
  //   꾀 수는 su21.json s36n(같은 셈에서 꾀마다 고른 수 — 꾀 칸 자료 su21-s36.json 은 그림 부품이 첫 칠함 뒤에 받음 · 느린 휴대폰 첫 화면 2.5초)
  const G = n36of(T), n28 = (FILT(T) ? nNow : 21) + nq, n21 = KEYN.reduce((a, k) => a + Math.min(7, nk(k)), 0), N36 = G ?? 0, ALL = n28 + n21 + N36;
  // 주문 1114-1306 ⑤(사장님 2026-11-14 13:06 「… 다 해」 · 점검 A3) — 큰 값 = 겹침을 뺀 회사 수(묶음마다 앞 일곱 · 같은 회사는 한 번) · 칸 수(지금 28 · 될 듯 21 · 꾀 252)는 「그래서」 줄에
  //   꾀 칸 회사 번호는 su21-s36.json 에만 있어 첫 칠함은 「…」(세는 중)로 두고, 그림이 칠해진 뒤 그 파일을 받아 회사 수(○곳)로 채움(later — 첫 화면 2.5초를 늦추지 않게 · 그림 구슬 아래 「오늘 이름이 오른 회사는 ○곳이에요.」와 같은 때 같은 셈)
  const g7 = [...KEY, 'quiet', ...KEYN].map(k => T.lists?.[k] ?? []), coNow = coN(g7), b365 = T.counts?.b365 ?? 365;
  const LAB = '우량주 ' + b365 + '곳 가운데 오늘 이름이 오른 회사', MEAN = '같은 회사가 여러 칸에 들어요. 칸으로 세면 지금 ' + n28 + '칸 · 될 듯 ' + n21 + '칸' + (G ? ' · 서른여섯 꾀 ' + N36 + '칸' : '') + '이에요.';
  const coPre = G && Number.isInteger(T.co36) && T.co36 > 0 ? T.co36 : null; // su21.json co36(같은 셈 · su21.py) — 첫 칠함에 바로 그림(느린 휴대폰 가장 큰 칠함 2.5초 · 주문 1114-1306) · 없으면 「…」 뒤 채움
  const big = val(G ? (coPre ?? '…') : coNow, G ? (coPre != null ? '곳' : '') : '곳', LAB, {누가: NAME, 언제: day(T.asOf.board) + ' 자료', 어디서: '우량주 365곳 안',
    무엇을: (FILT(T) ? '불장 · 꽃이 될 · 돈이 몰리는 일곱 가운데 몬테카를로와 기준 31가지를 모두 지난 곳만 남겼어요' : '불장 · 꽃이 될 · 돈이 몰리는 회사를 7곳씩 찾았어요') + (nq ? '. 넷째 창 조용한데 힘이 모이는 곳 ' + nq + '칸을 더했어요' : '') + '. 될 듯 ' + n21 + '칸' + (G ? '과 서른여섯 꾀 ' + N36 + '칸' : '') + '도 더했어요. 같은 회사가 여러 칸에 들면 회사는 한 번만 셌어요', 어떻게: CUR(T) ? HOW_CUR(T) : MCR(T) ? '365곳 모두 ' + TEN(T) + '번 섞어 보고, 소거 한 번을 지난 곳을 드문 차례로 일곱씩 골랐어요' : FILT(T) ? '세 가지 셈을 365곳에 대고, 몬테카를로 10만 번과 기준 31가지로 다시 걸렀어요' : MARK(T) ? '세 가지 셈을 365곳에 똑같이 대고, 몬테카를로와 기준 31가지를 모두 지난 ' + nSx(T, KEY) + '칸에 큐피트 계산법 표를 달았어요' : '세 가지 셈을 365곳에 똑같이 대어 봤어요', 왜: '주식을 몰라도 지금 볼 곳을 한눈에 알게 하려고요'},
    {mean: MEAN});
  /** 꾀 칸 자료를 받은 뒤 — 큰 값을 「오늘 이름이 오른 회사 ○곳」으로(받지 못하면 지금 · 될 듯 칸의 회사 수와 그 까닭) · 다른 쪽으로 넘어갔으면 손대지 않음 */
  const later = G ? async () => {
    const bv = document.querySelector('#su .su-head .su-big .su-bv'), bl = document.querySelector('#su main > .su-two .su-bl'), mn = document.querySelector('#su main > .su-two .su-mean span');
    if (!bv) return;
    await heroDone();
    const g = await X.get(D36).catch(() => null);
    if (!bv.isConnected) return;
    const ok = ok36(g, T), n = ok ? coN([...g7, ...g.kinds.map(k => g.lists[k])]) : coNow;
    const b = bv.querySelector('b'), u = bv.querySelector('span');
    if (b && b.textContent !== num(n)) b.textContent = num(n); // 같은 수면 다시 그리지 않음(가장 큰 칠함이 늦어지지 않게)
    if (u) { if (u.textContent !== '곳') u.textContent = '곳'; } else if (b) b.after(h('span', {text: '곳'}));
    bv.setAttribute('data-co', String(n));
    if (bl) bl.textContent = ok ? LAB : '우량주 ' + b365 + '곳 가운데 지금 · 될 듯 칸에 이름이 오른 회사';
    if (mn && !ok) mn.textContent = MEAN + ' 서른여섯 꾀 회사는 받지 못해 빼고 셌어요.';
  } : null;
  const mids = [
    val(T.counts.listed, '곳', '한국 상장 회사', {누가: '코스피 · 코스닥', 언제: day(T.asOf.mkt), 어디서: '한국 주식 시장', 무엇을: T.counts.listedWhat, 어떻게: '그날 값이 있는 보통주를 셌어요', 왜: '모두에서 시작해야 빠진 곳이 없어요'}, {mean: '한국에서 주식을 사고팔 수 있는 회사가 이만큼이라는 뜻이에요. 펀드와 우선주는 빼고 셌어요.'}),
    val(T.counts.b365, '곳', '우량주', {누가: '상장 회사 가운데 튼튼한 곳', 언제: '2026년 10월 5일에 정함', 어디서: '73개 업종 · 업종마다 5곳', 무엇을: '우량주를 골랐어요', 어떻게: T.rules.b365, 왜: '튼튼한 회사 안에서만 찾으려고요'}, {mean: '이익을 꾸준히 내는 큰 회사 ' + T.counts.b365 + '곳 안에서만 21곳을 찾는다는 뜻이에요.'}),
    val(T.overlap.length, '곳', '두 목록에 함께 든 곳', {누가: T.overlap.map(o => o.name).join(' · ') || null, 언제: day(T.asOf.board), 어디서: '21곳 안', 무엇을: '불장과 돈이 몰리는 목록에 함께 들었어요', 어떻게: '두 목록에서 같은 회사 번호를 찾았어요', 왜: '겹친 곳은 두 셈이 같은 곳을 가리킨다는 뜻이에요'}, {mean: '겹친 곳은 ✦ 로 보여요. 두 셈이 함께 가리킨 곳이라는 뜻이에요.'})];
  const rows = KEY.flatMap(k => (T.lists[k] ?? []).map(c => ({...val(fin(c.ch20) ? won100(c.ch20) : null, '', KIND[k] + ' · ' + c.name + ' · 20거래일', six21(c, k, T), {mean: why21(c, k, T)}), href: '#/c/' + c.code})));
  const first = T.lists.hot?.[0] ?? T.lists.money?.[0];
  X.setFirst?.(first?.code);
  return {title: '오늘', tab: 0, step: 1, compact: true, mansour: true, kick: day(T.asOf.board) + ' · 우량주 365곳 안', h1: '요즘 눈에 띄는 회사', big, later, // 쪽 이름 = 아래 탭 이름 「오늘」(주문 1114-1306 ⑤ — 옛 「301곳」) // 쉬운 판(주문 1112-0253) — 첫 줄만 읽어도 무엇을 보는 곳인지(옛 「지금, 그리고 될 듯.」) // 잡스 판 한 문장(주문 1532 · 옛 「지금 볼 21곳」)
    ...X.artHero('su-apple', null, X.fig('21', [grid21(T), funnel3(T)], {label: '상장 회사 → 우량주 → 21칸', hero: true, cap: ['한국 상장 회사 ' + num(T.counts.listed) + '곳을 셌어요.', '그 가운데 우량주 ' + T.counts.b365 + '곳을 먼저 골랐어요.', '그런데 두 목록에 함께 든 곳이 ' + T.overlap.length + '곳 있어요(✦).', '그래서 세 목록은 칸으로 세면 21칸, 겹침을 빼면 ' + T.distinct + '곳이에요.', ...(nq ? ['넷째 창 조용한 힘 ' + nq + '칸을 더하면 ' + (21 + nq) + '칸이에요.'] : []), '여기에 될 듯 ' + n21 + '칸' + (G ? '과 서른여섯 꾀 ' + N36 + '칸' : '') + '을 더하면 모두 ' + ALL + '칸이에요. 같은 회사가 여러 칸에 들어요.']})),
    mids, pro: [...ruleRows(T), ...KEY.flatMap(k => (T.lists[k] ?? []).map(c => ({k: KIND[k] + ' · ' + c.name, v: wonN(c.ch20), how: why21(c, k, T) + ' · ' + Object.entries(six21(c, k, T)).map(([a, b]) => a + ' ' + (b ?? NEED)).join(' · ')})))], after: [X.essBox(S)], // 21곳 하나씩은 서랍에(첫 화면은 그림 — 주문 2044 [5] 7 · 8)
    act: [modeBar(false)],
    next: {href: '#/m', label: '21곳은 어느 땅에 있나?', step: 2, k: '2 / 8'}, asOf: T.asOf.board, S, note: '이 쪽 목록은 ' + day(T.asOf.board) + ' 자료로 골랐어요. 앞날을 맞히는 목록이 아니에요.'};
}
/** 될 듯 21곳(#/n · 주문 1103) — 불장이 될 듯 7 · 꽃이 될 듯 7 · 돈이 몰릴 듯 7 · 지난 1년 기록(아무 회사와 견줌) · 같은 세 여인 그림 */
export async function v21Next(X) {
  const [{S}, T] = await Promise.all([X.base(), load21(X.get)]);
  const P = T.past ?? {}, have = KEYN.every(k => Array.isArray(T.lists?.[k]) && (FILT(T) || T.lists[k].length)); // 엄격 셈(주문 0854)이면 빈 묶음도 있음 · 표시 판(주문 1209)은 일곱 그대로
  if (!have) return {title: '될 듯 21곳', tab: 0, step: 1, h1: '될 듯 21곳', body: [h('p', {class: 'su-lead', text: '될 듯 21곳 자료는 ' + NEED + '예요.'})], act: [modeBar(true)], asOf: T.asOf?.board, S};
  const n = KEYN.reduce((a, k) => a + T.lists[k].length, 0), nco = coN(KEYN.map(k => T.lists[k])); // 큰 값 = 겹침을 뺀 회사 수 · 칸 수(n)는 「그래서」 줄에(주문 1114-1306 ⑤ — 칸 수를 회사 수처럼 부르지 않음)
  const nk = k => (T.lists?.[k] ?? []).length;
  const big = val(nco, '곳', FILT(T) ? '불장이 될 듯 ' + nk('hotNext') + ' · 꽃이 될 듯 ' + nk('bloomNext') + ' · 돈이 몰릴 듯 ' + nk('moneyNext') : '불장이 될 듯 7 · 꽃이 될 듯 7 · 돈이 몰릴 듯 7', {누가: NAME, 언제: day(T.asOf.board) + ' 자료', 어디서: '우량주 365곳 안',
    무엇을: FILT(T) ? '불장 · 꽃 · 돈이 몰리기 전 모습을 닮은 일곱 가운데 몬테카를로와 기준 31가지를 모두 지난 곳만 남겼어요' : '불장 · 꽃 · 돈이 몰리기 전 모습을 닮은 회사를 7곳씩 골랐어요', 어떻게: CUR(T) ? HOW_CUR(T) : MCR(T) ? '365곳 모두 ' + TEN(T) + '번 섞어 보고, 닷새 모습이 드문 차례로 일곱씩 골랐어요' : '지난 1년 날마다 여러 셈을 똑같이 대어 보고, 한 달 안에 그렇게 된 일이 가장 많은 셈을 골랐어요', 왜: '지금 그런 곳 바로 앞에 자주 보이던 모습을 찾으려고요'},
    {mean: '세 목록을 더하면 ' + n + '칸이에요. ' + (nco < n ? '같은 회사가 여러 칸에 들어, 겹침을 빼면 ' + nco + '곳이에요.' : '겹친 회사는 없어요.')}); // 안전 문장은 그림 설명 · 맨 아래에 한 번씩만(같은 말 되풀이 뺌 2026-11-14)
  const MK = MARK(T) && P.strict && KEYN.every(k => Number.isFinite(P[k]?.old100)), MCK = MCR(T) && P.mcRank && KEYN.every(k => Number.isFinite(P[k]?.old100)); // 주문 1422 — 큰 값 = 몬테카를로 차례 일곱의 기록 · 예전 셈 함께 // 주문 1209 — 칸은 일곱 그대로라 큰 값은 일곱의 기록 · 수르 계산법 표가 붙은 곳의 기록을 함께
  const NOTW = {hotNext: '못 든 때', moneyNext: '못 든 때', bloomNext: '못 앞선 때'}, lab = (k, x) => KIND[k] + ' · 100번 가운데 · ' + NOTW[k] + ' ' + miss100(x) + '번'; // 맞은 수 곁에 못 맞은 수를 같은 줄에(손실 먼저 · 2026-11-14)
  const mids = KEYN.map(k => { const p = P[k]; return MCK ? val(p.per100, '번', lab(k, p.per100), {누가: KIND[k] + ' 셈으로 날마다 고른 일곱', 언제: (P.from ?? NEED) + ' ~ ' + (P.to ?? NEED), 어디서: '지금 우량주 365곳', 무엇을: whatSay(P.what?.[k]), 어떻게: (P.cultureRank ? '날마다 문화 셈으로 고른 일곱을 모두 셌어요(' : '날마다 몬테카를로 차례로 고른 일곱을 모두 셌어요(') + num(p.n) + '번 가운데 ' + num(p.hit) + '번)', 왜: '지난 기록만 보여 줘요'},
      {mean: '100번에 ' + p.per100 + '번이 한 달 안에 ' + PW(T)[k] + '. 나머지 ' + miss100(p.per100) + '번은 그러지 못했어요.' + (P.cultureRank && Number.isFinite(p.mc100) ? ' 바로 앞 셈은 100번에 ' + p.mc100 + '번,' : '') + ' 예전 셈은 100번에 ' + p.old100 + '번, 아무 회사는 ' + p.base100 + '번이었어요.'})
    : MK ? val(p.old100, '번', lab(k, p.old100), {누가: KIND[k] + ' 셈으로 날마다 고른 일곱', 언제: (P.from ?? NEED) + ' ~ ' + (P.to ?? NEED), 어디서: '지금 우량주 365곳', 무엇을: whatSay(P.what?.[k]), 어떻게: '날마다 고른 일곱을 모두 셌어요(' + num(p.oldN) + '번)', 왜: '지난 기록만 보여 줘요'},
      {mean: '100번에 ' + p.old100 + '번이 한 달 안에 ' + PW(T)[k] + '. 그 가운데 큐피트 계산법으로 찾은 곳은 100번에 ' + p.per100 + '번(' + num(p.n) + '번 가운데 ' + num(p.hit) + '번), 아무 회사는 ' + p.base100 + '번이었어요. 일곱이 그러지 못한 때는 100번에 ' + miss100(p.old100) + '번이에요.'})
    : val(p?.per100 ?? null, '번', p ? lab(k, p.per100) : KIND[k] + ' · 100번 가운데', {누가: KIND[k] + ' 셈으로 날마다 고른 일곱', 언제: (P.from ?? NEED) + ' ~ ' + (P.to ?? NEED), 어디서: '지금 우량주 365곳', 무엇을: whatSay(P.what?.[k]), 어떻게: '날마다 고른 일곱을 모두 셌어요(' + num(p?.n) + '번 가운데 ' + num(p?.hit) + '번)', 왜: '지난 기록만 보여 줘요'},
    {mean: p ? '100번에 ' + p.per100 + '번이 한 달 안에 ' + PW(T)[k] + '. 나머지 ' + miss100(p.per100) + '번은 그러지 못했어요.' + (P.strict && Number.isFinite(p.old100) ? ' 거르기 전 일곱은 ' + p.old100 + '번,' : '') + ' 아무 회사는 100번에 ' + p.base100 + '번이었어요.' : '지난 기록은 ' + NEED + '예요.'}); });
  return {title: '될 듯 21곳', tab: 0, step: 1, compact: true, mansour: true, kick: day(T.asOf.board) + ' · 우량주 365곳 안 · 지난 1년 기록으로 고름', h1: '될 듯 21곳', big,
    ...X.artHero('su-apple', null, X.fig('21', [grid21(T, KEYN)], {label: '될 듯 21곳', hero: true, cap: [FILT(T) ? '그렇게 되기 전 모습을 닮은 곳 가운데 기준 31가지를 모두 지난 곳만 남겼어요.' : '불장 · 꽃 · 돈이 몰리기 전 모습을 닮은 곳을 7곳씩 골랐어요.', '지난 1년 기록으로 고른 셈이에요.', '앞날을 맞히는 목록이 아니에요.']}), {mode: 'next'}),
    mids, pro: [...KEYN.map(k => ({k: KIND[k], v: (T.lists[k] ?? []).length + '곳', how: (T.rules?.[k] ?? NEED) + (P[k] ? ' · 지난 1년(' + P.from + ' ~ ' + P.to + ') ' + num(P[k].n) + '번 가운데 ' + num(P[k].hit) + '번 · 아무 회사 100번에 ' + P[k].base100 + '번' : '')})),
      {k: '셈한 기록', v: P.days != null ? num(P.days) + '일' : NEED, how: (P.universe ?? NEED) + ' · ' + (P.src ?? NEED)},
      ...KEYN.flatMap(k => (T.lists[k] ?? []).map(c => ({k: KIND[k] + ' · ' + c.name, v: k === 'moneyNext' ? (fin(c.why?.gain) ? '+' + joEok(c.why.gain) : NEED) : k === 'hotNext' ? wonN(c.why?.r20) : fin(c.why?.x5) ? '닷새 시장보다 ' + more100(c.why.x5) : NEED, how: why21(c, k, T, false).trim()})))], // 지난 1년 기록은 묶음 줄(위)에 한 번만
    after: [X.essBox(S)], act: [modeBar(true)],
    next: {href: '#/m', label: '21곳은 어느 땅에 있나?', step: 2, k: '2 / 8'}, asOf: T.asOf.board, S, note: '될 듯 21곳은 ' + day(T.asOf.board) + ' 자료와 지난 1년 기록으로 고른 곳이에요. 앞날을 맞히는 목록이 아니에요.'};
}
export async function vLand(X) {
  const [{S}, T] = await Promise.all([X.base(), loadMap(X.get)]);
  const nStar = T.lands.reduce((a, L) => a + starN(L), 0), top = topLand(T); // ✦ 합 = 칸에 적힌 ✦ 수를 더한 것(21칸에서 겹친 회사는 한 번)
  const big = val(T.lands.length, '땅', '우량주 365곳을 열 땅으로', {누가: '우량주 365곳', 언제: day(T.asOf.board), 어디서: '73개 업종 → 열 땅', 무엇을: '하는 일이 비슷한 업종을 땅으로 묶었어요', 어떻게: '땅 → 업종 → 회사 세 번 누르면 회사에 닿아요', 왜: '어디서 21곳이 나왔는지 지도로 보려고요'},
    {mean: '365곳이 열 갈래 땅에 나뉘어 있다는 뜻이에요. ' + (nStar === T.distinct ? '21곳에서 겹친 회사를 빼면 ' + nStar + '곳이고, 모두 ✦ 가 있는 땅에 있어요.' : '칸마다 적힌 ✦ 를 더하면 ' + nStar + '곳이에요.')}); // 옛 「✦ 이 있는 땅에 21곳」은 ✦ 합(겹침 뺀 수)과 안 맞았음
  const L0 = top?.id ?? T.lists.hot?.[0]?.landId ?? T.lands[0].id; // 다음 단추 = ✦ 가 가장 많은 땅(그림 설명 「✦ 가 많은 땅부터」와 같게)
  return {title: '땅 지도', tab: 1, step: 2, kick: '우량주 365곳 지도', h1: '땅 지도', big,
    ...X.artHero('su-land-jobs', null, X.fig('land', [landMap(T)], {label: '땅 지도', hero: true, cap: ['우량주 365곳을 열 땅에 나눴어요.', '칸마다 회사 수와 21곳(✦) 수를 적었어요.', '그런데 21곳이 모든 땅에 고르게 있지는 않아요.', '그래서 ✦ 가 많은 땅부터 들어가 봐요.']})),
    mids: [], pro: T.lands.map(L => ({k: L.name, v: L.inds.reduce((a, g) => a + g.cos.length, 0) + '곳', how: L.inds.map(g => g.name).join(' · ')})),
    next: {href: '#/m/' + L0, label: (T.lands.find(L => L.id === L0)?.name ?? '') + ' 땅에는?' + (top ? ' ✦ ' + starN(top) + '곳' : ''), step: 3, k: '3 / 8'}, asOf: T.asOf.board, S};
}
export async function vLandOne(X, id) {
  const [{S}, T] = await Promise.all([X.base(), loadMap(X.get)]);
  const L = T.lands.find(x => x.id === id); if (!L) return X.notFound('이 땅을 찾지 못했어요.');
  const cos = L.inds.flatMap(g => g.cos), star = cos.filter(c => c.in.length);
  const rose = L.inds.some(g => fin(g.ch20) && g.ch20 > 0), best = L.inds.filter(g => fin(g.ch20)).sort((a, b) => b.ch20 - a.ch20)[0]; // 오른 업종이 없으면 「오른 업종부터」라고 하지 않음(2026-11-14 — 업종이 모두 내린 땅에서 말이 거꾸로였음)
  const big = val(cos.length, '곳', L.name + ' 땅의 우량주', {누가: L.name, 언제: day(T.asOf.board), 어디서: L.inds.length + '개 업종', 무엇을: L.say ?? null, 어떻게: '업종마다 우량주 5곳씩이에요', 왜: '땅마다 21곳이 얼마나 있는지 보려고요'}, {mean: star.length ? '이 땅에서 21곳에 든 회사가 ' + star.length + '곳이라는 뜻이에요. ✦ 를 누르면 그 회사로 가요.' : '이 땅에는 이번 21곳이 없다는 뜻이에요.'});
  const top = topLand(T), go = star[0] ?? null; // ✦ 가 없는 땅의 다음 단추는 ✦ 가 가장 많은 땅으로(「왜 21곳에?」라고 묻지 않음)
  const list = h('section', {class: 'su-list', 'aria-label': L.name + ' 업종과 회사'}, h('h2', {class: 'su-ft', text: '업종 → 회사 · ✦ 은 21곳'}),
    L.inds.map(g => h('div', {class: 'su-indc'}, h('p', {class: 'su-indn'}, h('b', {text: g.name}), ' · 20거래일 ' + wonN(g.ch20) + (g.hot ? ' · 불장 업종' : '')),
      h('p', {class: 'su-chips'}, g.cos.map(c => h('a', {class: 'su-chipa' + (c.in.length ? ' su-chip21' : ''), href: '#/c/' + c.code, 'data-proper': ''}, c.in.length ? '✦ ' : '', c.name))))));
  return {title: L.name, tab: 1, step: 3, kick: '땅 지도 · ' + L.name, h1: L.name + ' 땅', proper: false, big,
    ...X.artHero('su-land-jobs', id, X.fig('ib', [indBars(L)], {label: L.name + ' 업종 막대', hero: true, cap: [L.name + ' 땅에는 업종이 ' + L.inds.length + '개 있어요.', '막대는 업종마다 우량주 회사들이 20거래일 동안 평균으로 움직인 만큼이에요.',
      ...(rose || !best ? ['그런데 내린 업종도 숨기지 않아요.', star.length ? '그래서 오른 업종의 ✦ 회사부터 봐요.' : '그래서 오른 업종부터 봐요.']
        : ['그런데 이 땅은 업종이 모두 내렸어요. 가장 덜 내린 ' + best.name + ' 업종도 ' + won100(best.ch20) + '이 됐어요.', '그래서 서두르지 말고 지켜봐요.'])]})), // 네 박자(기 · 승 · 전 · 결) 그대로
    mids: [], body: [list], pro: L.inds.map(g => ({k: g.name, v: wonN(g.ch20), how: '20거래일 · 업종 우량주 평균 · ' + g.cos.map(c => c.name).join(' · ')})),
    next: go ? {href: '#/c/' + go.code, label: josa(go.name, '은') + ' 왜 21곳에?', step: 4, k: '4 / 8'} : top && top.id !== L.id ? {href: '#/m/' + top.id, label: '✦ 가 가장 많은 ' + top.name + ' 땅으로', step: 3, k: '3 / 8'} : {href: '#/m', label: '땅 지도로', step: 2, k: '2 / 8'}, asOf: T.asOf.board, S};
}
export async function vMore(X, code) {
  const [{S}, T] = await Promise.all([X.base(), load21(X.get)]);
  let c = find21(T, code); if (!c) return X.notFound('이 회사의 하루씩 값 자료가 없어요. 목록에 든 회사만 있어요.');
  if (!Array.isArray(c.c)) { // 될 듯 21곳은 첫 화면이 가볍게 21 마지막 값 · 수급 · 뉴스를 따로 둠(su21-next.json · 주문 1103)
    const N = await X.get('/su/data/su21-next.json').catch(() => null), full = KEYN.flatMap(k => N?.lists?.[k] ?? []).find(x => x.code === code);
    if (full) c = {...c, c: full.c, flows: full.flows, news: full.news, pos52: full.pos52, close: full.close}; }
  X.setCur?.({code, name: c.name, ind: c.ind});
  const l = c.c ?? [], d = l.slice(1).map((v, i) => Math.sign(v - l[i])), up = d.filter(x => x > 0).length, dn = d.filter(x => x < 0).length, eq = d.length - up - dn, f = c.flows ?? {};
  const a20 = fin(c.ch20) ? num(Math.abs(Math.round(c.ch20 * 10) / 10)) : null; // 큰 값 = 「20거래일 전 100원이 지금 ○원」(화면에 「%」를 쓰지 않음 · 2026-11-14)
  const big = val(fin(c.ch20) ? Math.round((100 + c.ch20) * 10) / 10 : null, '원', c.name + ' · 20거래일 전 100원이 ' + day(c.date) + '에는', {누가: c.name, 언제: day(c.date) + '까지 20거래일', 어디서: c.ind + ' 업종', 무엇을: '그날 마지막 값으로 셌어요', 어떻게: '첫날 값과 마지막 날 값을 견줬어요', 왜: '이 회사가 목록에 든 까닭을 값으로 보려고요'},
    {mean: a20 == null ? '20거래일 동안 움직인 만큼은 ' + NEED + '예요.' : '20거래일 동안 100원에 ' + a20 + '원 ' + (c.ch20 < 0 ? '내렸다' : '올랐다') + '는 뜻이에요. 지난 값이에요.'});
  const mids = [ // 내린 날을 먼저(손실 먼저 · 2026-11-14 — 옛 제목은 내린 날 수, 큰 숫자는 오른 날 수라 거꾸로 읽혔음)
    val(dn, '일', '내린 날 · 오른 날은 ' + up + '일', {누가: c.name, 언제: day(c.date) + '까지', 어디서: '오른 날 · 내린 날 표', 무엇을: '날마다 오른 날과 내린 날을 셌어요', 어떻게: '● 오른 날 · ○ 내린 날', 왜: '내린 날과 오른 날이 어떻게 이어졌는지 보려고요'}, {mean: d.length + '일 가운데 ' + dn + '일 내렸고 ' + up + '일 올랐다는 뜻이에요.' + (eq ? ' 값이 그대로인 날은 ' + eq + '일이에요.' : '')}),
    val(f.foreign, '주', '외국인 닷새 · 기관 ' + (fin(f.institution) ? num(f.institution) + '주' : NEED) + ' · 개인 ' + (fin(f.individual) ? num(f.individual) + '주' : NEED), {누가: '외국인 · 기관 · 개인', 언제: f.from && f.to ? day(f.from) + '부터 ' + day(f.to) + '까지' : null, 어디서: c.name, 무엇을: '닷새 동안 산 주식 수에서 판 주식 수를 뺀 값', 어떻게: '자료 값 그대로 · 주식 수', 왜: null}, {mean: fin(f.foreign) ? (f.foreign > 0 ? '외국인은 닷새 동안 판 주식보다 산 주식이 많았다는 뜻이에요.' : '외국인은 닷새 동안 산 주식보다 판 주식이 많았다는 뜻이에요.') : null}),
    val(c.news?.newsCount, '건', '뉴스', {누가: c.name, 언제: day(c.date), 어디서: '뉴스', 무엇을: '이 회사 이름이 나온 뉴스 수', 어떻게: '자료 값 그대로', 왜: null}, {mean: fin(c.news?.newsCount) ? '이 회사 이야기가 뉴스에 ' + c.news.newsCount + '번 나왔다는 뜻이에요.' : null})];
  return {title: c.name + ' 자세히', tab: 2, step: 5, kick: c.name + ' · ' + c.ind, h1: c.name + ' 한 달 하루씩', proper: true, big,
    ...X.artHero('su-more-jobs', code, X.fig('road', [road(c), line21(c)].filter(Boolean), {label: '오른 날 · 내린 날 표 · 21거래일 줄', hero: true, cap: ['20거래일을 하루씩 놓았어요.', '오른 날은 ●, 내린 날은 ○예요. 같은 쪽이 이어지면 아래로 쌓여요.', '그런데 오른 날이 많아도 앞날을 알려 주지는 않아요.', '그래서 줄 그림과 함께 봐요.']})),
    mids, figs: sun52(c) ? [X.fig('sun', [sun52(c)], {label: '뜨거운 태양 · 1년 사이 값 자리', title: '1년 사이 값 자리(뜨거운 태양 = 1년 가장 높은 값 가까이)'})] : [],
    pro: [{k: '그날 마지막 값 21개(20거래일 사이)', v: l.map(num).join(' · '), how: SRC + ' · ' + day(c.date) + '까지'}, {k: '닷새 수급(주)', v: [f.foreign, f.institution, f.individual].map(v => (fin(v) ? num(v) : NEED)).join(' · '), how: '외국인 · 기관 · 개인 · 산 주식 수에서 판 주식 수를 뺀 값'}, {k: '52주 자리', v: fin(c.pos52) ? num(Math.round(c.pos52 * 1000) / 10) : NEED, how: '52주 가장 낮은 값 0 · 가장 높은 값 100'}, {k: '회사 크기', v: fin(c.cap) ? num(c.cap) + '억 원' : NEED, how: '/atlas/data/cond.json · ' + day(T.asOf.cond)}],
    next: {href: '#/q/' + code, label: '내 이유는 무엇인가?', step: 6, k: '6 / 8'}, asOf: c.date, S};
}
export async function vFriend(X) {
  const [{S}, T] = await Promise.all([X.base(), load21(X.get)]);
  const big = val(21, '곳', '친구에게 건넬 목록', {누가: '나와 친구', 언제: day(T.asOf.board), 어디서: '카카오톡', 무엇을: '21곳 가운데 한 곳을 골라 건네요', 어떻게: '카톡 보내기 · 소개 영상', 왜: '같은 목록을 함께 보면 서로 까닭을 물어볼 수 있으니까요'}, {mean: '내가 본 21곳을 친구도 같은 잣대로 볼 수 있다는 뜻이에요.'});
  // 2026-11-14 — 보상 칸(상품권 · 커피 쿠폰)은 뺌(본질 「망치는 길: 폭죽과 연속 접속 보상」) · 「옛 기능」 칸 · 「돕는 일 · 셋 모두」 꼬리 · 「사장님」 속말도 뺌
  const card = (href, title, say) => h('a', {class: 'su-fcard', href}, h('b', {text: title}), h('span', {text: say}));
  const cards = h('section', {class: 'su-flist', 'aria-label': '친구에게'}, h('h2', {class: 'su-ft', text: '친구에게 · 함께 쓰는 것'}),
    card('/next/?su=guest#/share', '카톡 보내기', '21곳 가운데 한 곳을 친구에게 보내요.'), card('/hello.html?su=guest', '소개 영상', '큐피트가 무엇을 하는 곳인지 1분 영상.'),
    card('/next/?su=stop#/me', '내 종목 점검', '내가 가진 회사를 같은 잣대로 봐요.'), card('/next/?su=back#/jinhwa', '진화', '큐피트가 스스로 고친 것을 모두 보여요.'),
    card('/next/?su=guide#/find', '종목 찾기', '상장 회사 모두에서 이름으로 찾아요.'), card('/next/?lang=en&su=guide#/', '영어', '영어로 봐요.'),
    card('https://shin-yxy.gino.im/', '천사', '큐피트 밖에서 여는 길이에요. 21곳과는 이어지지 않아요.'));
  return {title: '친구에게', tab: 3, step: 8, kick: '함께 보기', h1: '친구에게', big,
    ...X.artHero('su-road-jobs', 'friend', X.fig('p6', [petals6()], {label: '친구에게 건네는 여섯 가지', hero: true, cap: ['21곳을 친구와 함께 봐요.', '카톡으로 한 곳을 골라 보내요.', '그런데 친구에게도 사고팔기를 권하지 않아요.', '그래서 이유와 함께 건네요.']})),
    mids: [], body: [cards], pro: [{k: '카톡 보내기', v: '켜짐', how: '/next/?su=guest#/share · 한 곳씩'}, {k: '카톡 가입', v: '켜짐', how: 'config/atlas11/kakao.json'}, {k: '천사', v: '바깥 길', how: '큐피트 밖 주소 · 21곳과 이어지지 않음'}],
    next: {href: '#/', label: '처음으로', step: null, k: '끝'}, asOf: T.asOf.board, S};
}
/** 회사 쪽 — 21곳 까닭 상자 */
export function reasonBox21(T, code) {
  const ks = KEY6.filter(k => (T?.lists?.[k] ?? []).some(c => c.code === code)); if (!ks.length) return null;
  const ck = k => T.lists[k].find(c => c.code === code); // 목록마다 그 목록의 까닭(겹친 곳은 두 줄 — 불장 까닭 · 돈 까닭)
  return h('section', {class: 'su-why su-why21', 'aria-label': '이 회사가 든 목록과 까닭'}, h('h2', {class: 'su-ft', text: '이 회사가 든 목록 · ' + ks.map(k => KIND[k] + ' ' + T.lists[k].length + '곳').join(' · ')}), // 옛 「21곳에 든 이유」는 21곳 · 7곳이 한 칸에 섞였음(2026-11-14)
    h('div', {class: 'su-g su-whyg', 'data-g': 'why21'}, whyRoad(ks.map(k => [k, ck(k)]))), // 까닭 길 그림 — 업종 → 회사 → 목록(그림이 화면 대부분 · 주문 0054 [6] 5)
    ks.map(k => h('p', {class: 'su-lead', text: why21(ck(k), k, T)})), h('p', {class: 'su-note', text: '자료 ' + day(T.asOf.board) + ' · ' + SRC}));
}
/** 까닭 길 — 목록마다 세로 길 하나: 업종(값) → 회사(값) → 목록 이름표 · 구슬이 위에서 아래로 차례로 켜짐(그림이 화면 대부분 · 주문 0054 [6] 5)
 *  값 글은 100원 말(「100원이 150.5원」 · 「시장보다 / 100원에 18원 더」) — 길면 두 줄(주문 1114-1306 · 좁은 칸에서 다른 말을 지어내지 않음) */
const lines2 = t => { const w = String(t ?? ''); if (w.length <= 5) return [w]; const sp = w.search(/[ ·]/); return sp > 0 && sp < 7 ? [w.slice(0, sp), w.slice(sp + 1).replace(/^[ ·]+/, '').slice(0, 5)] : [w.slice(0, 4), w.slice(4, 8)]; };
function whyRoad(rows) {
  const W = 390, H = 590, one = rows.length === 1, cols = one ? [130] : [98, 292], ys = [76, 290, 504], r = one ? 58 : 50;
  const label = (cx, cy, t, b) => { const L = lines2(t); return L.map((x, i) => s('text', {x: cx, y: cy + 7 + (L.length === 2 ? (i ? 12 : -12) : 0), 'text-anchor': 'middle', class: 'g-tl g-tw ' + b + ' a-up', text: x})); };
  const val = (cx, cy, t, b) => { const L = Array.isArray(t) ? t : [t], y0 = one ? cy + 8 - (L.length - 1) * 12 : cy + r + 30;
    return L.map((x, i) => (one ? s('text', {x: cx + r + 16, y: y0 + i * 24, class: 'g-tl g-tland g-halo ' + b + ' a-up', text: x}) : s('text', {x: cx, y: y0 + i * 24, 'text-anchor': 'middle', class: 'g-tl g-tland g-halo ' + b + ' a-up', text: x}))); };
  return s('svg', {class: 'su-svg su-why21s', viewBox: `0 0 ${W} ${H}`, role: 'img', 'aria-label': '21곳에 든 이유 길 — ' + rows.map(([k, c]) => c.ind + ' 업종 → ' + c.name + ' → ' + KIND[k]).join(' · ')},
    rows.map(([k, c], i) => { const x = cols[i], w = c.why ?? {};
      const iv = k === 'hot' ? ['업종 평균', wonN(w.ind20)] : k === 'hotNext' ? (w.how === 'rank' ? '불장 업종' : ['업종 닷새', wonN(w.ind5)]) : k === 'bloomNext' ? '아직 싹' : ['시장보다', fin(w.indX) ? more100(w.indX) : NEED];
      const cv = k === 'money' || k === 'moneyNext' ? (fin(w.gain) ? '+' + joEok(w.gain) : NEED) : k === 'bloom' ? '아직 싹' : k === 'bloomNext' ? ['닷새 시장보다', fin(w.x5) ? more100(w.x5) : NEED] : k === 'hotNext' ? wonN(w.r20) : wonN(c.ch20);
      return s('g', {}, s('path', {d: `M${x} ${ys[0]} C ${x - 40} ${ys[0] + 60}, ${x + 40} ${ys[1] - 60}, ${x} ${ys[1]} S ${x - 40} ${ys[2] - 60}, ${x} ${ys[2]}`, class: 'g-road b1 a-draw', pathLength: 1}),
        s('circle', {cx: x, cy: ys[0], r, class: 'g-basefill b1 a-pop'}), label(x, ys[0], c.ind, 'b1'), val(x, ys[0], iv, 'b1'),
        s('circle', {cx: x, cy: ys[1], r: r + 4, class: 'g-ok b2 a-pop'}), label(x, ys[1], c.name, 'b2'), val(x, ys[1], cv, 'b2'),
        s('circle', {cx: x, cy: ys[2], r, class: (k === 'hot' || k === 'hotNext' ? 'g-bad' : 'g-ok') + ' b3 a-pop'}), label(x, ys[2], KIND[k], 'b3'), val(x, ys[2], '7곳에 듦', 'b3')); }));
}
