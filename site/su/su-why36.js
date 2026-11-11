/* 수르 — 「왜?」 쪽(주문 0123 · 사장님 2026-11-09 01:23 「왜? 불장이고 왜? 불장이 될것 같고 왜? 돈이 몰리는지 왜? 돈이 몰릴 듯 한지 그리고 왜? 싹인지 왜? 싹이 될것 같은지
   그 이유를 종목을 클릭하면 36가지로 중요순으로 기승전결로 풀이를 해야 한다 그리고 이렇개 선정한 기준 7가지도 제시하라」
   · 01:44 「몇일째 그 항목에 있는지 … 첫 발견」 · 02:01 「포모지수값 … 그이유도 11가지」 · 02:02 「몬트리올(몬테카를로) 방식 … 소거법 … 기준 … 그 이유 7가지」 · 02:04 「어」)
   길 #/c/<번호>/y/<묶음> — 첫 페이지 42칸을 누르면 옴(묶음 = hot · bloom · money · hotNext · moneyNext · bloomNext)
   한 쪽(위 → 아래): 이름 · 물음(「왜 불장이에요?」) → 첫 발견 · 며칠째 · 포모지수 → 이렇게 고른 기준 일곱(이 회사 숫자) → 서른여섯 가지(중요한 차례 · 기 9 · 승 9 · 전 9 · 결 9)
     → 포모지수 — 소거법 기준 일곱 · 까닭 열하나 → 회사 쪽 · 「왜 사?」 고리 → 출처(안전 문장)
   기승전결 = 사장님 기승전결(원칙 29): 기 = 지금 모습과 가장 중요한 결론 먼저 · 승 = 왜 그렇게 됐나 · 전 = 더 넓게 · 견줌 · 바뀌는 조건 · 결 = 바로 이해하고 행동할 결론과 볼 것
   숫자는 모두 받은 자료 그대로(su21.json · su21-next.json · su21-why.json · su21-map.json · 회사 자료 co/<번호>.json) — 지어낸 숫자 0 · 자료가 없는 까닭은 빼고 다음 까닭으로 채움
   새 문장에 「%」 없음(오른 만큼은 「100원이 ○원」 · 견줌은 「○만큼」) · 쓰지 않을 말 0(words.js) */
import {h} from '/su/su-fig.js';
import {NEED, num, ymd} from '/su/su-six.js';
import {dateKo, jo} from '/su/su-data.js';
import {KIND, load21, why21} from '/su/su-21.js';
import {josa as josaH} from '/next/brand.js';

export const CSS = '/su/su-why36.css';
export const KEY6 = Object.freeze(['hot', 'bloom', 'money', 'hotNext', 'moneyNext', 'bloomNext']);
export const ASK = Object.freeze({hot: '불장이에요', hotNext: '불장이 될 듯해요', money: '돈이 몰려요', moneyNext: '돈이 몰릴 듯해요', bloom: '싹이에요', bloomNext: '싹에서 꽃이 될 듯해요'});
export const whyHref = (code, k) => '#/c/' + code + '/y/' + k;
const fin = v => typeof v === 'number' && Number.isFinite(v);
const JP = {은: ['은', '는'], 는: ['은', '는'], 이: ['이', '가'], 가: ['이', '가'], 을: ['을', '를'], 를: ['을', '를'], 과: ['과', '와'], 와: ['과', '와']};
const josa = (w, p) => { const t = String(w ?? ''); if (!/[A-Za-z0-9]$/.test(t) || !JP[p]) return josaH(t, p); return t + JP[p][/[LMNR]$/i.test(t) || /[013678]$/.test(t) ? 0 : 1]; };
const r1 = x => Math.round(x * 10) / 10;
const n1 = x => num(r1(x));
const sgn = x => (fin(x) ? (x > 0 ? '+' : x < 0 ? '−' : '') + n1(Math.abs(x)) : NEED);
/** 오른 만큼(퍼센트 수 x) → 「100원이 ○원」 */
const won = x => '100원이 ' + n1(100 + x) + '원';
const day = d => (typeof d === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(d) ? dateKo(d) : NEED);
const eok = v => (fin(v) ? num(Math.round(v)) + '억 원' : NEED);
const eokS = v => (fin(v) ? (v < 0 ? num(Math.round(-v)) + '억 원 적자' : num(Math.round(v)) + '억 원') : NEED); // 이익이 0 아래면 「적자」(「-」 표시 대신)
const share = v => '100주에 ' + num(Math.round(v * 100) / 100) + '주';
/** 받침 — 숫자는 읽는 소리 끝(일 · 삼 · 육 · 칠 · 팔 · 십 · 백 = 받침) · 한글은 끝 글자 */
const jong = t => { t = String(t); const d = /(\d+)$/.exec(t); if (d) { const v = +d[1]; return v % 10 === 0 || [1, 3, 6, 7, 8].includes(v % 10); } const ch = t.charCodeAt(t.length - 1); return ch >= 0xAC00 && ch <= 0xD7A3 && (ch - 0xAC00) % 28 !== 0; };
/** 「이에요 · 예요」 붙임 — 끝이 따옴표면 그 안 글자로 셈 */
export const cop = w => { const t = String(w), core = t.replace(/[」』"')\]]+$/, ''); return t + (jong(core) ? '이에요' : '예요'); };
const ord = n => (n === 1 ? '첫 번째' : n + '번째');
const KIND_ROUTE = {quality: '우량 네 조건(두 해 잇달아 이익 · 자기자본이익 5 넘게 · 빚 150 아래 · 업종마다 다섯 곳)을 모두 넘어', trend: '우량 조건을 다 넘지는 못했지만 시대 흐름 업종이어서',
  profit: '최근 결산이 흑자여서', size: '업종 다섯 자리를 채우는 그 업종의 큰 회사여서'}; // 「회사라」는 쓰지 않을 말 「사라」를 품음 — 「회사여서」

/* ── 21 마지막 값에서 셈(자료 그대로 · 나눗셈만) ── */
function closeStats(c) {
  const a = Array.isArray(c?.c) && c.c.length === 21 && c.c.every(v => fin(v) && v > 0) ? c.c : null;
  if (!a) return null;
  const d = a.slice(1).map((v, i) => (v / a[i] - 1) * 100);
  const up = d.filter(x => x > 0).length, down = d.filter(x => x < 0).length, mean = a.reduce((p, q) => p + q, 0) / a.length;
  return {r20: (a[20] / a[0] - 1) * 100, r5: (a[20] / a[15] - 1) * 100, up, down, flat: 20 - up - down, best: Math.max(...d), worst: Math.min(...d),
    swing: d.reduce((p, q) => p + Math.abs(q), 0) / d.length, gap: (a[20] / mean - 1) * 100, hi: Math.max(...a), lo: Math.min(...a)};
}
const finLast = co => { const f = co?.fin; if (!f || !Array.isArray(f.years) || !f.years.length) return null; const i = f.years.length - 1; return {f, i, y: String(f.years[i]).slice(0, 4)}; };

/* ═══ 이렇게 고른 기준 일곱(묶음마다 · su21.py 고르는 셈 그대로 · 이 회사 숫자) ═══ */
export function crit7(T, c, k) {
  if (MCR(T)) return crit7mc(T, c, k);
  const L = T?.lists?.[k] ?? [], i = L.findIndex(x => x.code === c.code), w = c.why ?? {}, a = T?.asOf ?? {};
  const sameInd = L.filter(x => x.ind === c.ind).length;
  const base = {t: '우량주 365곳 안', s: '상장 회사 ' + (num(T?.counts?.listed) ?? NEED) + '곳 가운데 고른 우량주 365곳에 들어 있어요. ' + (KIND_ROUTE[c.kind] ? KIND_ROUTE[c.kind] + ' 들었어요.' : ''), ok: true};
  const opens = {t: '회사 자료가 다 있음', s: '이름 · 시장 · 지난 값 자료가 모두 있어 누르면 회사 쪽이 열리는 회사만 골라요.', ok: true};
  const fresh = {t: '그날 값이 있음', s: day(c.date) + ' 마지막 값이 있어요. 값이 늦은 회사는 빼요.', ok: c.date === a.board};
  const calm = {t: '하루 35 넘게 튄 날 없음', s: '지난 20거래일 동안 하루에 35만큼 넘게 움직인 날이 없어요. 그런 날은 주식을 나누거나 합친 흔적이라 빼요.', ok: true};
  if (k === 'hot') return [base,
    {t: '업종이 불장 업종', s: c.ind + ' 업종 365곳 평균이 지난 20거래일 동안 ' + (fin(w.ind20) ? won(w.ind20) + '이 됐어요' : NEED) + '. 평균이 오른 업종 가운데 큰 차례로 열한 업종까지가 불장 업종이에요.', ok: fin(w.ind20) && w.ind20 > 0},
    {t: '20거래일 동안 오름', s: day(c.date) + '까지 20거래일 동안 ' + (fin(c.ch20) ? won(c.ch20) + '이 됐어요.' : NEED), ok: fin(c.ch20) && c.ch20 > 0},
    {t: '오른 차례 일곱 안', s: '불장 업종 회사 ' + (num(T?.counts?.hotPool) ?? NEED) + '곳을 20거래일 동안 오른 차례로 줄 세워 ' + ord(i + 1) + '예요.', ok: i >= 0 && i < 7},
    {t: '업종마다 둘까지', s: '한 업종에서 둘까지만 골라요. ' + c.ind + ' 업종은 일곱 가운데 ' + sameInd + '곳이에요.', ok: sameInd <= 2},
    fresh, opens];
  if (k === 'bloom') return [base,
    {t: '싹 ① 아직 덜 감', s: '한 달 동안 시장보다 앞선 만큼이 5 아래예요. 지금 ' + sgn(c.x) + '만큼이에요.', ok: fin(c.x) && c.x < 5},
    {t: '싹 ② 닷새 동안 뒤지지 않음', s: '닷새 동안 시장보다 ' + sgn(c.y) + '만큼으로 뒤지지 않았어요.', ok: fin(c.y) && c.y >= 0},
    {t: '회사 크기 위 20 안', s: '회사 크기(시가총액)가 ' + eok(c.cap) + '으로, 모든 회사를 크기 차례로 세운 위 20 안이에요(선 ' + eok(w.capTop20) + ').', ok: fin(c.cap) && fin(w.capTop20) && c.cap >= w.capTop20},
    {t: '업종이 시장보다 앞선 차례', s: c.ind + ' 업종이 한 달 동안 시장보다 ' + sgn(w.indX) + '만큼 더 갔어요. 업종이 많이 앞선 차례로 골라 ' + ord(i + 1) + '예요.', ok: fin(w.indX)},
    {t: '꽃 선 15', s: w.full ? '업종이 시장보다 15 넘게 앞서 꽃 선을 넘었어요.' : '업종이 꽃 선 15를 아직 넘지 못해, 꽃 선에 가장 가까운 차례로 골랐어요.', ok: !!w.full},
    opens];
  if (k === 'money') return [base,
    {t: '업종이 시장보다 더 오름', s: c.ind + ' 업종이 한 달 동안 시장보다 ' + sgn(w.indX) + '만큼 더 갔어요.', ok: fin(w.indX) && w.indX > 0},
    {t: '업종 차례 일곱 안', s: '시장보다 더 오른 업종을 큰 차례로 세워 ' + ord(i + 1) + ' 업종이에요.', ok: i >= 0 && i < 7},
    {t: '업종마다 하나', s: c.ind + ' 업종 365곳 가운데 회사 크기가 가장 많이 는 한 곳만 골라요.', ok: true},
    {t: '회사 크기가 원으로 늚', s: '20거래일 동안 회사 크기가 ' + eok(w.gain) + ' 늘었어요.', ok: fin(w.gain) && w.gain > 0},
    calm, opens];
  if (k === 'hotNext') return [base,
    w.how === 'rank' ? {t: '업종이 불장 업종', s: c.ind + ' 업종은 불장 업종이에요.', ok: true} : {t: '업종도 닷새 오름', s: c.ind + ' 업종이 닷새 동안 ' + (fin(w.ind5) ? won(w.ind5) + '이 됐어요.' : NEED), ok: fin(w.ind5) && w.ind5 > 0},
    w.how === 'rank' ? {t: '불장 일곱 바로 아래', s: '불장 업종 안에서 20거래일 동안 오른 차례가 ' + ord(w.rank) + '예요(8 ~ 14째).', ok: fin(w.rank) && w.rank >= 8 && w.rank <= 14}
      : {t: '닷새 동안 막 오름', s: '닷새 동안 ' + (fin(w.r5) ? won(w.r5) + '이 됐어요.' : NEED) + ' 일곱 바로 아래가 모자라 닷새 차례로 채웠어요.', ok: fin(w.r5) && w.r5 > 0},
    {t: '20거래일 동안 오름', s: '20거래일 동안 ' + (fin(w.r20) ? won(w.r20) + '이 됐어요.' : NEED), ok: fin(w.r20) && w.r20 > 0},
    {t: '업종마다 둘까지', s: '한 업종에서 둘까지만 골라요. ' + c.ind + ' 업종은 일곱 가운데 ' + sameInd + '곳이에요.', ok: sameInd <= 2},
    calm, opens];
  if (k === 'moneyNext') return [base,
    {t: '업종이 시장보다 더 오름', s: c.ind + ' 업종이 한 달 동안 시장보다 ' + sgn(w.indX) + '만큼 더 갔어요.', ok: fin(w.indX)},
    w.how === 'rank' ? {t: '돈이 몰리는 일곱 바로 아래 업종', s: '시장보다 더 오른 업종 차례로 ' + ord(w.rank) + ' 업종이에요(8 ~ 14째).', ok: fin(w.rank) && w.rank >= 8}
      : {t: '일곱 밖 업종에서 닷새 차례', s: '일곱 바로 아래 업종이 모자라, 일곱 밖 업종마다 닷새 동안 회사 크기가 가장 많이 는 곳으로 채웠어요.', ok: true},
    {t: '업종마다 하나', s: c.ind + ' 업종 365곳 가운데 회사 크기가 가장 많이 는 한 곳만 골라요.', ok: true},
    {t: '회사 크기가 원으로 늚', s: (w.how === 'rank' ? '20거래일' : '닷새') + ' 동안 회사 크기가 ' + eok(w.gain) + ' 늘었어요.', ok: fin(w.gain) && w.gain > 0},
    calm, opens];
  return [base, // bloomNext
    {t: '싹 ① 아직 덜 감', s: '한 달 동안 시장보다 앞선 만큼이 5 아래예요. 지금 ' + sgn(w.x20) + '만큼이에요.', ok: fin(w.x20) && w.x20 < 5},
    {t: '싹 ② 닷새 동안 뒤지지 않음', s: '닷새 동안 시장보다 ' + sgn(w.x5) + '만큼이에요.', ok: fin(w.x5) && w.x5 >= 0},
    w.how === 'main' ? {t: '닷새 동안 시장보다 2 넘게 앞섬', s: '닷새 동안 시장보다 ' + sgn(w.x5) + '만큼 앞섰어요. 기준은 2 넘게예요.', ok: fin(w.x5) && w.x5 >= 2}
      : {t: '회사 크기 위 20 안', s: '닷새 앞섬이 2 넘는 싹이 모자라, 회사 크기가 위 20 안인 싹을 닷새 차례로 채웠어요. 이 회사 크기는 ' + eok(c.cap) + '이에요.', ok: true},
    {t: '20거래일 동안 오름', s: '20거래일 동안 ' + (fin(w.r20) ? won(w.r20) + '이 됐어요.' : NEED), ok: w.how !== 'main' || (fin(w.r20) && w.r20 > 0)},
    {t: '업종마다 둘까지', s: '한 업종에서 둘까지만 골라요. ' + c.ind + ' 업종은 일곱 가운데 ' + sameInd + '곳이에요.', ok: sameInd <= 2},
    {t: '꽃이 될 일곱에는 아직 없음', s: '이미 꽃이 될 일곱에 든 회사는 빼고 골라요.', ok: true}];
}

/* ═══ 주문 1422(사장님 2026-11-09 14:22 「돈 · 꽃 · 불장 찾는 조건을 처음에 365 전 종목을 몬테카를로 계산법으로 찾은 다음 소거법으로 1번만 돌려서 42개를 찾고 …
       1억 번 계산하고 소거법도 1억 번 해서 1등 2등 3등을 찾아내서 표기」) — 몬테카를로 차례 판(su21.json listRule mc365-v1)의 기준 일곱 · 1억 번 셈 상자 ═══ */
export const MCR = T => T?.listRule === 'mc365-v1' || T?.listRule === 'culture7-v1';
/** 주문 1912(사장님 2026-11-09 19:12 「한국에 주식하는 사람들에 특징 11가지를 … 7가지에 정의를 내린 다음 42개에 종목을 찾아내는데 문화에 중심으로 세팅한 다음 … 몬테카를로 방식 소급법(소거법)을 더 진화시켜서」) — 문화 셈 판 */
export const CUR = T => T?.listRule === 'culture7-v1';
const CUN = {herd: '테마 몰림', near: '고점 앞 팔기', hi52: '신고가', rev: '본전 버티기', casc: '빚투 쏠림', big: '국민주 쏠림', lot: '한방 쫓기', attn: '눈길 따라 사기'};
/** 까닭 한 줄 끝에 붙이는 문화 흔적(세우는 쪽만 · 신고가가 있으면 고점 앞 팔기는 빼고) */
const cuNote = c => { const on = c?.cu?.on ?? [], x = ['herd', 'hi52', 'near', 'big'].filter(k => on.includes(k) && !(k === 'near' && on.includes('hi52'))).map(k => CUN[k]); return x.length ? ' 한국 투자자 문화로는 ' + x.join(' · ') + ' 흔적이 보여요.' : ''; };
/** 큰 수를 우리말 자리로 — 100000000 → 1억 · 100000 → 10만 · 26787094 → 2,678만 7,094(숫자 그대로 · 읽기 쉽게) */
export const korN = n => { if (!fin(n)) return NEED; n = Math.round(n); if (n >= 1e8) { const e = Math.floor(n / 1e8), r = n % 1e8; return num(e) + '억' + (r ? ' ' + korN(r) : ''); }
  if (n >= 1e4) { const m = Math.floor(n / 1e4), r = n % 1e4; return num(m) + '만' + (r ? ' ' + num(r) : ''); } return num(n); };
const PATHS = T => korN(T?.mc?.paths ?? 100000);
const pTimes = (T, p) => (fin(p) ? korN(Math.round(p * (T?.mc?.paths ?? 100000))) + '번' : NEED);
const STATW = {hot: '20거래일 동안 오른 만큼', hotNext: '닷새 동안 오른 만큼', bloom: '업종이 20거래일 동안 시장보다 앞선 만큼', bloomNext: '닷새 동안 시장보다 앞선 만큼',
  money: '업종이 20거래일 동안 시장보다 앞선 만큼', moneyNext: '업종이 닷새 동안 시장보다 앞선 만큼'};
function mcLine(T, c, k) { // 몬테카를로 한 줄 — 지금 값 · 10만 번 가운데 몇 번 · 드문 차례(문화 셈 판 = 요즘 흔들림에 맞춘 길 · 될 듯 둘은 365곳 모두의 길)
  const m = c.mc ?? {};
  if (CUR(T)) return STATW[k] + '이 지금 ' + sgn(m.stat) + '이에요. 지난 250거래일 하루 값을 요즘 흔들림에 맞춰 ' + PATHS(T) + '번 섞어 그린 길 가운데 이만큼 이상은 ' + pTimes(T, m.p) + '이었어요.'
    + (fin(m.pm) ? ' 365곳 모두의 길과 견주면 ' + pTimes(T, m.pm) + '이었어요.' : '');
  return STATW[k] + '이 지금 ' + sgn(m.stat) + '이에요. 지난 250거래일 하루 값을 ' + PATHS(T) + '번 섞어 그린 길 가운데 이만큼 이상은 ' + pTimes(T, m.p) + '이었어요.';
}
/** 이 칸의 문화 흔적 — 세우는 흔적 · 빼는 흔적(su21.json culture.pos · neg 와 칸 cu.on) */
function cuItem(T, c, k) {
  const on = c.cu?.on ?? [], P0 = T?.culture?.pos?.[k] ?? [], N0 = T?.culture?.neg?.[k] ?? [];
  const pk = x => x === 'hi52' ? 'hi52' : x === 'herd20' || x === 'herd5' ? 'herd' : x;
  const pos = [...new Set(P0.map(pk))].filter(x => on.includes(x)).map(x => CUN[x]), neg = N0.filter(x => on.includes(x)).map(x => CUN[x]);
  if (k === 'money' || k === 'moneyNext') return {t: '한국 투자자 문화 — 국민주 쏠림', s: on.includes('big') ? josa(c.name, '은') + ' 365곳 가운데 몸집이 큰 열에 하나라, 이 업종 대장으로 먼저 골랐어요.' : '이 업종에는 크기가 는 국민주가 없어, 회사 크기가 가장 많이 는 곳을 골랐어요.', ok: true};
  return {t: '한국 투자자 문화', s: (pos.length ? pos.join(' · ') + ' 흔적이 보여 앞에 세웠어요.' : P0.length ? '세우는 흔적은 없어요.' : '이 묶음은 세우는 흔적 없이 크게 움직인 차례로 세워요.')
    + (neg.length ? ' ' + neg.join(' · ') + ' 흔적이 있어 뒤로 밀렸어요.' : N0.length ? ' 빼는 흔적(' + N0.map(x => CUN[x]).join(' · ') + ')은 없어요.' : ''), ok: !neg.length};
}
/** 문화 일곱 상자 — 일곱 흔적마다 이 칸에 보였나 · 이 칸 값 · 쓰는 곳(주문 1912) */
export function cultureBox(T, c) {
  const C = T?.culture, v = c.cu?.v ?? {}, on = c.cu?.on ?? [];
  if (!CUR(T) || !Array.isArray(C?.traits) || !c.cu) return null;
  const said = {herd: fin(v.br20) || fin(v.br5) ? '같은 업종 회사 10곳이면 ' + Math.round(Math.max(v.br20 ?? 0, v.br5 ?? 0) / 10) + '곳꼴이 시장보다 앞섰어요.' : null,
    near: fin(v.dd) ? '지난 1년 가장 높은 값을 100으로 보면 지금은 ' + Math.round(v.dd) + '이에요.' : null, rev: fin(v.x20) ? '한 달 동안 시장보다 ' + sgn(v.x20) + '만큼 갔어요.' : null,
    casc: fin(v.casc) ? (v.casc > 0 ? '열흘 안에 크게 내린 날이 가장 길게 ' + v.casc + '일 잇달았어요.' : '열흘 안에 크게 내린 날이 없어요.') : null, big: fin(v.rank) ? '365곳 가운데 몸집 ' + ord(v.rank) + '예요.' : null,
    lot: fin(v.mx5) ? '닷새 안에 가장 크게 뛴 하루는 ' + sgn(v.mx5) + '만큼이에요.' : null, attn: fin(v.nbig) ? '닷새 안에 평소보다 크게 움직인 날이 ' + v.nbig + '일이에요.' : null};
  const nOn = C.traits.filter(t => on.includes(t.k)).length;
  return fold('yw-cu', '한국 투자자 문화 일곱 — 이 칸', '일곱 가운데 ' + nOn + '가지가 보여요', [
    h('p', {class: 'yw-s', text: '도우미 열하나가 한국 투자자의 특징 열하나를 따로 찾았어요. 그 가운데 마지막 값으로 잴 수 있는 일곱을 이렇게 정했어요.'}),
    h('ol', {class: 'yw-ol'}, C.traits.map((t, j) => li(j + 1, t.name + ' — ' + t.use, t.say + (said[t.k] ? ' 이 칸은 ' + said[t.k] : ''), h('span', {class: 'yw-ok ' + (on.includes(t.k) ? 'yw-pass' : 'yw-no'), text: on.includes(t.k) ? '보임' : '없음'})))),
    h('a', {class: 'su-ask', href: '#/r/i'}, h('b', {text: '특징 열하나 보기'}), h('span', {text: '도우미 열하나가 찾은 근거를 기록창에서 봐요.'}))]); // 주문 2235
}
export function crit7mc(T, c, k) {
  const L = T?.lists?.[k] ?? [], w = c.why ?? {}, m = c.mc ?? {}, a = T?.asOf ?? {}, ind = k === 'money' || k === 'moneyNext';
  const sameInd = L.filter(x => x.ind === c.ind).length;
  const base = {t: '우량주 365곳 안', s: '상장 회사 ' + (num(T?.counts?.listed) ?? NEED) + '곳 가운데 고른 우량주 365곳에 들어 있어요. ' + (KIND_ROUTE[c.kind] ? KIND_ROUTE[c.kind] + ' 들었어요.' : ''), ok: true};
  const mc = {t: '몬테카를로 — 365곳 모두', s: mcLine(T, c, k), ok: fin(m.p)};
  const rank = {t: CUR(T) ? '문화 · 드문 차례 일곱 안' : '드문 차례 일곱 안', s: '소거를 지난 ' + (ind ? '업종 ' : '') + (num(m.pool) ?? NEED) + (ind ? '곳' : '곳') + '을 ' + (CUR(T) ? '문화 흔적과 드문 차례로' : '드문 차례로') + ' 세워 ' + (fin(m.ord) ? ord(m.ord) : NEED) + (ind ? ' 업종이에요.' : '예요.'), ok: fin(m.ord)};
  const per2 = {t: '업종마다 둘까지', s: '한 업종에서 둘까지만 골라요. ' + c.ind + ' 업종은 일곱 가운데 ' + sameInd + '곳이에요.', ok: sameInd <= 2};
  const per1 = {t: '업종마다 하나', s: c.ind + ' 업종 365곳 가운데 회사 크기가 가장 많이 는 한 곳만 골라요.', ok: true};
  const opens = CUR(T) ? cuItem(T, c, k) : {t: '회사 자료가 다 있음', s: '이름 · 시장 · 지난 값 자료가 모두 있어 누르면 회사 쪽이 열리는 회사만 골라요.', ok: true};
  const fresh = {t: '그날 값이 있음', s: day(c.date) + ' 마지막 값이 있어요. 값이 늦은 회사는 빼요.', ok: c.date === a.board};
  if (k === 'hot') return [base, mc,
    {t: '소거 한 번 — 불장 업종 · 오름', s: c.ind + ' 업종은 365곳 평균이 지난 20거래일 동안 ' + (fin(w.ind20) ? won(w.ind20) + '이 된 불장 업종이고, 이 회사는 ' : NEED + ' · ') + (fin(c.ch20) ? won(c.ch20) + '이 됐어요.' : NEED), ok: fin(c.ch20) && c.ch20 > 0},
    rank, per2, fresh, opens];
  if (k === 'bloom') return [base, mc,
    {t: '소거 한 번 — 싹', s: '한 달 동안 시장보다 앞선 만큼이 ' + sgn(c.x) + '로 5 아래이고, 닷새 동안 ' + sgn(c.y) + '로 뒤지지 않았어요.', ok: fin(c.x) && c.x < 5 && fin(c.y) && c.y >= 0},
    {t: '회사 크기 위 20 안', s: '회사 크기(시가총액)가 ' + eok(c.cap) + '으로, 모든 회사를 크기 차례로 세운 위 20 안이에요(선 ' + eok(w.capTop20) + ').', ok: fin(c.cap) && fin(w.capTop20) && c.cap >= w.capTop20},
    rank,
    {t: '꽃 선 15', s: w.full ? '업종이 시장보다 15 넘게 앞서 꽃 선을 넘었어요.' : '업종이 꽃 선 15를 아직 넘지 못했어요. 지금 ' + sgn(w.indX) + '만큼이에요.', ok: !!w.full},
    opens];
  if (k === 'money') return [base, mc,
    {t: '소거 한 번 — 업종이 시장보다 더 오름', s: c.ind + ' 업종이 한 달 동안 시장보다 ' + sgn(w.indX) + '만큼 더 갔어요.', ok: fin(w.indX) && w.indX > 0},
    rank, per1,
    {t: '회사 크기가 원으로 늚', s: '20거래일 동안 회사 크기가 ' + eok(w.gain) + ' 늘었어요.', ok: fin(w.gain) && w.gain > 0},
    opens];
  if (k === 'hotNext') return [base, mc,
    {t: '소거 한 번 — 불장 일곱 밖 · 닷새 오름', s: '불장 일곱에는 없고, 닷새 동안 ' + (fin(w.r5) ? won(w.r5) + '이 됐어요.' : NEED) + (w.how === 'rank' ? ' ' + c.ind + ' 업종은 불장 업종이에요.' : ''), ok: fin(w.r5) && w.r5 > 0},
    rank,
    {t: '20거래일 동안', s: '20거래일 동안 ' + (fin(w.r20) ? won(w.r20) + '이 됐어요.' : NEED), ok: fin(w.r20)},
    per2, opens];
  if (k === 'moneyNext') return [base, mc,
    {t: '소거 한 번 — 돈 일곱 밖 업종', s: c.ind + ' 업종은 돈이 몰리는 일곱에 든 업종이 아니에요.', ok: true},
    rank, per1,
    {t: '회사 크기가 원으로 늚', s: '닷새 동안 회사 크기가 ' + eok(w.gain) + ' 늘었어요.', ok: fin(w.gain) && w.gain > 0},
    opens];
  return [base, mc, // bloomNext
    {t: '소거 한 번 — 싹 · 꽃 일곱 밖', s: '한 달 동안 시장보다 앞선 만큼이 ' + sgn(w.x20) + '로 5 아래이고, 닷새 동안 ' + sgn(w.x5) + '로 뒤지지 않았어요. 꽃이 될 일곱에는 없어요.', ok: fin(w.x20) && w.x20 < 5 && fin(w.x5) && w.x5 >= 0},
    rank,
    {t: '20거래일 동안', s: '20거래일 동안 ' + (fin(w.r20) ? won(w.r20) + '이 됐어요.' : NEED), ok: fin(w.r20)},
    per2, opens];
}
/** 1억 번 셈 상자 — 42칸끼리 판을 1억 번 벌여 1등 · 2등 · 3등(su21.json top3) */
export function top3Box(T, c, k) {
  if (T?.top3?.v === 'up3-v1') return up3Box(T, c);
  const t3 = T?.top3, me = t3?.cells?.[k + ':' + c.code];
  if (!t3 || !Array.isArray(me)) return null;
  const tot = t3.total ?? 100000000, place = [1, 2, 3].includes(c.r3) ? c.r3 : null;
  const best = {}; // 회사마다 가장 많이 남은 칸(같은 회사가 두 묶음에 들면 1 · 2 · 3등은 그 칸 하나만 · 주문 1912)
  for (const [key, x] of Object.entries(t3.cells)) if (Array.isArray(x)) { const cd = key.split(':')[1]; if (!(cd in best) || x[0] > best[cd]) best[cd] = x[0]; }
  const rk = 1 + Object.entries(best).filter(([cd, v]) => cd !== c.code && v > me[0]).length, dup = !place && best[c.code] > me[0];
  const nm = r => r ? r.name + '(' + KIND[r.k] + ')' : NEED;
  const R = n => (t3.rank ?? []).find(r => r.place === n);
  const v2 = t3.v === 'top3-v2';
  return fold('yw-top3', place ? '큐피트 계산법 ' + place + '등 — 1억 번 셈' : '큐피트 계산법 — 1억 번 셈', '42칸 가운데 ' + ord(rk) + '예요', [
    h('p', {class: 'yw-s', text: '42칸마다 지난 250거래일 하루 값으로 ' + (v2 ? '요즘 흔들림에 맞춘 ' : '') + '우연 길 ' + korN(t3.null ?? 100000) + ' 개를 그렸어요. 그리고 판을 ' + korN(tot) + ' 번 벌였어요.'}),
    v2 ? h('p', {class: 'yw-s', text: '잣대는 셋이에요. 오른 만큼, 가장 크게 뛴 하루를 뺀 만큼, 눈길 몰린 날이 적은 만큼이에요. 판마다 세 잣대의 무게를 ' + (t3.gn ?? 12) + '가지 가운데 하나로 바꿔 섞었어요.'}) : null,
    h('p', {class: 'yw-s', text: '판마다 칸마다 우연 길 하나를 뽑아 지금 값과 견주고, 우연보다 약한 칸부터 하나씩 떨어뜨렸어요. 이것도 ' + korN(tot) + ' 번이에요.'}),
    h('p', {class: 'yw-s yw-verdict', text: '이 칸은 ' + korN(tot) + ' 번 가운데 ' + korN(me[0]) + '번 끝까지 남았어요. 42칸 가운데 ' + ord(rk) + '예요.' + (place ? ' 그래서 ' + place + '등이에요.' : dup ? ' 같은 회사의 다른 칸이 더 많이 남아 등수는 그 칸에 달았어요.' : '')}),
    h('p', {class: 'yw-s', text: '1등 ' + nm(R(1)) + ' · 2등 ' + nm(R(2)) + ' · 3등 ' + nm(R(3)) + '이에요.'})]);
}

/** 새 잣대 상자(주문 1111-1857 · 사장님 2026-11-11 18:57 「… 선정 기준을 상승할것 같은 종목 으로 해야 해!」) — 우량주 365곳에서 넷을 고르게 섞은 차례
 *  이 칸 회사가 1 · 2 · 3등이면 그 등수와 잣대 넷 값 · 아니면 오늘 1 · 2 · 3등 이름만 · 앞날을 맞히지 않음(지난 기록만) */
const ym = d => (/^\d{4}-\d{2}/.test(d ?? '') ? d.slice(0, 4) + '년 ' + +d.slice(5, 7) + '월' : NEED);
export function up3Box(T, c) {
  const t3 = T?.top3, rank = Array.isArray(t3?.rank) ? t3.rank : [];
  if (!rank.length) return null;
  const me = rank.find(r => r.code === c.code), R = n => rank.find(r => r.place === n), P = t3.past ?? {};
  const EASY = {'긴 오름세 · 덜 흔들림': '1년 꾸준히 오름', '1년 오른 날 몫': '1년 오른 날이 많음', '업종 따라잡기': '업종보다 덜 오름', '닷새 눌림': '최근 5일 쉼'}; // 쉬운 판(주문 1112-0253) — 첫 페이지 · 1 · 2 · 3등 쪽과 같은 말
  const how = (Array.isArray(t3.how) && t3.how.length === 4 ? t3.how : ['긴 오름세 · 덜 흔들림', '1년 오른 날 몫', '업종 따라잡기', '닷새 눌림']).map(t => EASY[t] ?? t);
  const sz = v => (fin(v) ? (v >= 0.5 ? '높아요' : v <= -0.5 ? '낮아요' : '보통이에요') : NEED);
  return fold('yw-top3', me ? '오늘의 ' + me.place + '등' : '오늘의 1 · 2 · 3등', me ? '우량주 ' + (t3.pool ?? NEED) + '곳 가운데 ' + ord(me.place) + '예요' : '이 칸은 1 · 2 · 3등이 아니에요', [
    h('p', {class: 'yw-s', text: '고른 기준은 넷이에요. ' + how.join(', ') + '이에요. 날마다 우량주끼리 견줘 고르게 더했어요.'}),
    me ? h('ol', {class: 'yw-ol'}, how.map((t, j) => li(j + 1, t, '이 회사는 ' + sz(me.parts?.[j]) + '.'))) : null,
    h('p', {class: 'yw-s yw-verdict', text: me ? '넷을 더한 값이 ' + ord(me.place) + '로 커서 ' + me.place + '등이에요.' : '1등 ' + (R(1)?.name ?? NEED) + ' · 2등 ' + (R(2)?.name ?? NEED) + ' · 3등 ' + jo(R(3)?.name ?? NEED, '이에요') + '.'}),
    P.design && P.hold ? h('p', {class: 'yw-s', text: '지난 기록이에요. ' + ym(P.design.from) + ' ~ ' + ym(P.design.to) + '에는 열흘 뒤 오른 때가 100번에 ' + Math.round(P.design.up10) + '번이었어요. ' + ym(P.hold.from) + ' ~ ' + ym(P.hold.to) + '에는 ' + Math.round(P.hold.up10) + '번이었어요.'}) : null,
    h('p', {class: 'yw-s', text: '앞날을 맞히지 않아요. 지난 값으로 센 기록이에요.'})]);
}

/* ═══ 서른여섯 가지 — 까닭 꾸러미(기 · 승 · 전 · 결) · 묶음마다 중요한 차례 ═══ */
function facts(X) {
  const {T, c, k, co, peers, st, fo} = X, w = c.why ?? {}, a = T?.asOf ?? {}, L = T?.lists?.[k] ?? [], i = L.findIndex(x => x.code === c.code);
  const kn = KIND[k], fl = c.flows ?? null, fm = finLast(co), cc = co?.c ?? {};
  const net = (v, who) => (fin(v) ? '닷새 동안 ' + who + '은 ' + num(Math.abs(v)) + '주를 ' + (v > 0 ? '더 샀어요.' : v < 0 ? '더 팔았어요.' : '사고판 만큼이 같았어요.') : null);
  const peersUp = peers ? peers.filter(p => fin(p.ch20) && p.ch20 > 0).length : null;
  const peerRank = peers && fin(c.ch20) ? peers.filter(p => fin(p.ch20) && p.ch20 > c.ch20).length + 1 : null;
  const gain20 = fin(c.cap) && st ? c.cap * (1 - 100 / (100 + st.r20)) : null; // 회사 크기 × (1 − 20거래일 앞 값 ÷ 오늘 값)
  const hot7 = k === 'hot' ? L[L.length - 1]?.ch20 : k === 'hotNext' ? w.hot7 : null;
  const out = {
    /* 기 */
    core: {t: '가장 큰 이유', s: why21(c, k, T) + cuNote(c)},
    rank: i >= 0 ? {t: '일곱 가운데 자리', s: kn + ' 일곱 가운데 ' + ord(i + 1) + '로 이름이 올라 있어요.'} : null,
    days: fin(c.days) ? {t: '며칠째', s: day(c.found) + '에 이 묶음에서 처음 발견됐고, 오늘(' + day(a.board) + ')로 장이 열린 날 ' + c.days + '일째예요.' + (c.since ? ' 기록 첫날부터 이어져 그 앞은 셀 수 없어요.' : '')} : null,
    r20: fin(c.ch20) ? {t: '20거래일 움직임', s: day(c.date) + '까지 20거래일 동안 ' + won(c.ch20) + '이 됐어요.'} : st ? {t: '20거래일 움직임', s: '20거래일 동안 ' + won(st.r20) + '이 됐어요.'} : null,
    ind: k === 'hot' && fin(w.ind20) ? {t: '업종 평균', s: c.ind + ' 업종 365곳 평균은 20거래일 동안 ' + won(w.ind20) + '이 됐어요.'} : X.indCh20 != null ? {t: '업종 평균', s: c.ind + ' 업종 365곳 다섯 회사의 평균은 20거래일 동안 ' + won(X.indCh20) + '이 됐어요.'} : null,
    mkt: fin(c.x) ? {t: '시장과 견줌', s: '한 달 동안 시장보다 ' + sgn(c.x) + '만큼 ' + (c.x >= 0 ? '더 갔어요.' : '덜 갔어요.')} : null,
    r5: st ? {t: '닷새 움직임', s: '닷새 동안은 ' + won(st.r5) + '이 됐어요.'} : null,
    fomo: fin(c.fomo) ? {t: '포모지수', s: '포모지수는 ' + cop(c.fomo) + '. 50이 이 회사의 보통 때이고, 100에 가까울수록 요즘 열흘 값이 뜨거워요.'} : null,
    price: fin(c.close) ? {t: '마지막 값', s: day(c.date) + ' 마지막 값은 ' + num(c.close) + '원이에요.'} : null,
    both: (c.in ?? []).length > 1 ? {t: '두 목록', s: (c.in ?? []).filter(x => x !== k).map(x => KIND[x]).join(' · ') + ' 목록에도 함께 들었어요.'} : null,
    /* 승 */
    lead: k === 'hot' && fin(w.up) && fin(w.measured) ? {t: '업종이 함께 오름', s: c.ind + ' 업종 회사 ' + w.measured + '곳 가운데 ' + w.up + '곳이 20거래일 동안 올라 업종 평균을 끌어올렸어요.'}
      : (k === 'money' || k === 'moneyNext' || k === 'bloom') && fin(w.indX) ? {t: '업종이 앞섬', s: c.ind + ' 업종이 한 달 동안 시장보다 ' + sgn(w.indX) + '만큼 더 갔어요.'}
      : k === 'hotNext' && fin(w.ind5) ? {t: '업종이 닷새 오름', s: c.ind + ' 업종이 닷새 동안 ' + won(w.ind5) + '이 됐어요.'}
      : k === 'bloomNext' && fin(w.x5) ? {t: '닷새 앞섬', s: '닷새 동안 시장보다 ' + sgn(w.x5) + '만큼 앞섰어요.'} : null,
    gain: (k === 'money' || k === 'moneyNext') && fin(w.gain) ? {t: '회사 크기가 늚', s: (w.how === 'five' ? '닷새' : '20거래일') + ' 동안 회사 크기가 ' + eok(w.gain) + ' 늘어 ' + c.ind + ' 업종 365곳 가운데 가장 많았어요.'}
      : fin(gain20) ? {t: '회사 크기', s: '시가총액(회사 크기)은 ' + eok(c.cap) + '이고, 20거래일 동안 ' + eok(Math.abs(gain20)) + (gain20 >= 0 ? ' 늘었어요.' : ' 줄었어요.')} : null,
    inst: fl ? (net(fl.institution, '기관') ? {t: '기관', s: net(fl.institution, '기관')} : null) : null,
    frgn: fl ? (net(fl.foreign, '외국인') ? {t: '외국인', s: net(fl.foreign, '외국인')} : null) : null,
    indiv: fl ? (net(fl.individual, '개인') ? {t: '개인', s: net(fl.individual, '개인')} : null) : null,
    hold: fl?.holdPct && fin(fl.holdPct.first) && fin(fl.holdPct.last) ? {t: '외국인이 가진 몫', s: '외국인이 가진 몫이 ' + share(fl.holdPct.first) + '에서 ' + share(fl.holdPct.last) + '로 ' + (fl.holdPct.last > fl.holdPct.first ? '늘었어요.' : fl.holdPct.last < fl.holdPct.first ? '줄었어요.' : '그대로예요.')} : null,
    updays: st ? {t: '오른 날 수', s: '20거래일 가운데 ' + st.up + '일 오르고 ' + st.down + '일 내렸어요.'} : null,
    best: st ? {t: '가장 크게 오른 날', s: '20거래일 가운데 가장 크게 오른 날은 하루에 ' + won(st.best) + '이 됐어요.'} : null,
    news: c.news && fin(c.news.newsCount) ? {t: '뉴스', s: '닷새 동안 뉴스 ' + c.news.newsCount + '건, 이 회사 이름이 나온 뉴스 ' + (fin(c.news.newsNamed) ? c.news.newsNamed : 0) + '건이 있었어요.'} : null,
    peers: peers && peersUp != null ? {t: '같은 업종 회사', s: '같은 업종 365곳 다섯 회사 가운데 ' + (peersUp ? peersUp + '곳이 20거래일 동안 올랐어요.' : '20거래일 동안 오른 곳이 한 곳도 없어요.')} : null,
    peerRank: peerRank ? {t: '업종 안 차례', s: '같은 업종 다섯 회사 가운데 20거래일 동안 오른 차례로 ' + ord(peerRank) + '예요.'} : null,
    /* 전 */
    edge: MCR(T) ? (fin(c.mc?.p) && fin(L[L.length - 1]?.mc?.p) ? {t: '일곱째와 견줌', s: '이 묶음 일곱째는 ' + PATHS(T) + '번 가운데 ' + pTimes(T, L[L.length - 1].mc.p) + ', 이 칸은 ' + pTimes(T, c.mc.p) + '이었어요. 적을수록 드물어요.'} : null)
      : k === 'hot' || k === 'hotNext' ? (fin(hot7) && fin(c.ch20) ? {t: '일곱째와 견줌', s: '불장 일곱의 일곱째는 20거래일 동안 ' + won(hot7) + '이 됐어요. 이 회사는 ' + won(c.ch20) + '이에요.'} : null)
      : k === 'bloom' ? (fin(w.indX) ? {t: '꽃 선까지', s: '업종이 시장보다 15 넘게 앞서면 꽃 선이에요. 지금 ' + sgn(w.indX) + '만큼이라 ' + (w.indX >= 15 ? '넘었어요.' : n1(15 - w.indX) + '만큼 남았어요.')} : null)
      : k === 'bloomNext' ? (fin(w.x20) ? {t: '싹 선까지', s: '한 달 동안 시장보다 5 넘게 앞서면 싹이 아니라 꽃 자리로 가요. 지금 ' + sgn(w.x20) + '만큼이에요.'} : null)
      : (fin(w.indX) ? {t: '업종 앞섬의 크기', s: '업종이 시장보다 ' + sgn(w.indX) + '만큼 앞서 있어요. 0 아래로 내려가면 이 묶음에서 빠져요.'} : null),
    leave: MCR(T) ? {t: '빠지는 조건', s: {hot: '업종 평균이 20거래일 동안 내려가 불장 업종이 아니게 되거나, 20거래일 오른 만큼이 더 드문 회사가 일곱 넘게 생기면 빠져요.',
      hotNext: '불장 일곱에 들면 이 묶음 대신 불장에 들고, 닷새 오른 만큼이 더 드문 회사가 일곱 넘게 생기면 빠져요.',
      money: '업종이 시장보다 뒤지거나, 같은 업종에서 회사 크기가 더 많이 는 회사가 나오거나, 앞선 만큼이 더 드문 업종이 일곱 넘게 생기면 빠져요.',
      moneyNext: '업종이 돈이 몰리는 일곱에 들면 그쪽으로 가고, 닷새 앞선 만큼이 더 드문 업종이 일곱 넘게 생기면 빠져요.',
      bloom: '한 달 동안 시장보다 앞선 만큼이 5를 넘으면 싹이 아니라 꽃 자리로 가고, 닷새 동안 시장에 뒤지면 빠져요.',
      bloomNext: '닷새 동안 시장에 뒤지거나, 한 달 앞선 만큼이 5를 넘거나, 닷새 앞선 만큼이 더 드문 싹이 일곱 넘게 생기면 빠져요.'}[k]}
      : {t: '빠지는 조건', s: {hot: '업종 평균이 20거래일 동안 내려가 불장 업종이 아니게 되거나, 같은 업종에서 더 많이 오른 회사 둘이 생기면 빠져요.',
      hotNext: '불장 일곱 안으로 올라가면 이 묶음 대신 불장에 들고, 차례가 14째 밖으로 밀리면 빠져요.',
      money: '업종이 시장보다 뒤지거나, 같은 업종에서 회사 크기가 더 많이 는 회사가 나오면 빠져요.',
      moneyNext: '업종이 일곱 안으로 올라가면 돈이 몰리는 묶음에 들고, 14째 밖으로 밀리면 빠져요.',
      bloom: '한 달 동안 시장보다 앞선 만큼이 5를 넘으면 싹이 아니라 꽃 자리로 가고, 닷새 동안 시장에 뒤지면 빠져요.',
      bloomNext: '닷새 동안 시장에 뒤지거나, 한 달 앞선 만큼이 5를 넘으면 빠져요.'}[k]},
    pos52: fin(c.pos52) ? {t: '1년 값 가운데 자리', s: '지난 1년 값의 맨 아래를 0, 맨 위를 100으로 치면 지금은 ' + Math.round(c.pos52 * 100) + '에 있어요.'} : null,
    gap20: st ? {t: '20거래일 평균과 거리', s: '지금 값은 20거래일 평균 값보다 ' + n1(Math.abs(st.gap)) + '만큼 ' + (st.gap >= 0 ? '높아요.' : '낮아요.') + ' (100원 평균에 ' + n1(100 + st.gap) + '원)'} : null,
    swing: st ? {t: '하루 흔들림', s: '20거래일 동안 하루에 보통 100원에 ' + n1(st.swing) + '원꼴씩 오르내렸어요.'} : null,
    y1: fin(cc.r1y) ? {t: '1년 움직임', s: '1년 동안 ' + won(cc.r1y) + '이 됐어요(' + day(cc.priceDate) + ' 회사 자료).'} : null,
    mdd: fin(cc.mdd1y) ? {t: '1년 안 가장 큰 내림', s: '지난 1년에 가장 크게 내렸을 때는 100원이 ' + n1(100 + cc.mdd1y) + '원까지 내려갔어요.'} : null,
    past: T?.past?.[k] ? {t: '지난 1년 기록', s: '지난 1년 날마다 이렇게 고른 일곱을 모두 세면 100번에 ' + T.past[k].per100 + '번이 한 달 안에 ' + ({hotNext: '불장 일곱에 들었어요.', moneyNext: '돈이 몰리는 일곱에 들었어요.', bloomNext: (T.past.bloomFrom === 'pick' ? '고른 날부터 ' : '') + '시장보다 15 넘게 앞섰어요.'}[k] ?? '그렇게 됐어요.') + ' 아무 회사는 100번에 ' + T.past[k].base100 + '번이었어요.'}
      : {hot: fin(T?.counts?.hotPool) ? {t: '고른 바탕', s: '불장 업종 ' + T.counts.hotInds + '곳의 회사 ' + T.counts.hotPool + '곳 가운데에서 골랐어요.'} : null,
        bloom: fin(T?.counts?.bloomPool) ? {t: '고른 바탕', s: '크기 위 20 안인 싹 ' + T.counts.bloomPool + '곳 가운데에서 골랐어요. 꽃 선을 넘은 곳은 ' + (T.counts.bloomFull ?? 0) + '곳이에요.'} : null,
        money: {t: '고른 바탕', s: '시장보다 더 오른 업종을 차례로 보며 업종마다 한 곳씩 골랐어요.'}}[k] ?? null,
    sales: co?.grow?.ind && fin(co.grow.ind.rank) && fin(co.grow.ind.n) ? {t: '업종 안 매출 크기', s: co.grow.ind.name + ' 업종 ' + co.grow.ind.n + '곳 가운데 매출 크기는 ' + ord(co.grow.ind.rank) + '예요.'} : null,
    pbr: fin(co?.pbr) ? {t: '값과 장부', s: '주식 값이 회사 장부 값의 ' + num(Math.round(co.pbr * 100) / 100) + '배예요.'} : null,
    /* 결 */
    sum: {t: '한 줄 정리', s: josa(c.name, '은') + ' ' + {hot: '업종이 불장이고 그 안에서 많이 올라', hotNext: '불장 업종 안에서 일곱 바로 아래까지 올라와', money: '업종이 시장보다 앞서고 그 안에서 회사 크기가 가장 많이 늘어',
      moneyNext: '돈이 몰리는 일곱 바로 아래 업종에서 회사 크기가 가장 많이 늘어', bloom: '업종은 앞서는데 회사는 아직 덜 간 싹이라', bloomNext: '아직 싹인데 닷새 동안 시장보다 앞서기 시작해'}[k] + ' ' + kn + ' 일곱에 들었어요.'},
    watch: {t: '볼 것 하나', s: {hot: '다음 장에도 업종 평균이 오르는지 보세요.', hotNext: '불장 일곱 안으로 들어오는지 보세요.', money: '회사 크기가 계속 느는지 보세요.',
      moneyNext: '업종이 돈이 몰리는 일곱 안으로 들어오는지 보세요.', bloom: '업종이 시장보다 15 넘게 앞서 꽃 선을 넘는지 보세요.', bloomNext: '닷새 앞섬이 이어져 한 달 앞섬이 5에 가까워지는지 보세요.'}[k]},
    route: KIND_ROUTE[c.kind] ? {t: '우량주에 든 길', s: KIND_ROUTE[c.kind] + ' 우량주 365곳에 들었어요.'} : null,
    op: fm && fin(fm.f.op?.[fm.i]) ? {t: '영업이익', s: fm.y + '년 영업이익은 ' + (fin(fm.f.net?.[fm.i]) ? eokS(fm.f.op[fm.i]) + ', 순이익은 ' + cop(eokS(fm.f.net[fm.i])) : cop(eokS(fm.f.op[fm.i]))) + '.'} : null,
    opTrend: fm && fm.i >= 1 && fin(fm.f.op?.[fm.i - 1]) && fin(fm.f.op?.[fm.i]) ? {t: '이익 흐름', s: (() => {
      const a = fm.f.op[fm.i - 1], b = fm.f.op[fm.i], ya = String(fm.f.years[fm.i - 1]).slice(0, 4) + '년 ', yb = fm.y + '년 ';
      if (a < 0 && b < 0) return '영업이익 적자가 ' + ya + eok(-a) + '에서 ' + yb + eok(-b) + '으로 ' + (-b > -a ? '커졌어요.' : '줄었어요.');
      if (a >= 0 && b >= 0) return '영업이익이 ' + ya + eok(a) + '에서 ' + yb + eok(b) + '으로 ' + (b >= a ? '늘었어요.' : '줄었어요.');
      return '영업이익이 ' + ya + eokS(a) + '에서 ' + yb + eokS(b) + '로 바뀌었어요.'; })()} : null,
    rev: fm && fin(fm.f.rev?.[fm.i]) ? {t: '매출', s: fm.y + '년 매출은 ' + cop(eok(fm.f.rev[fm.i])) + '.'} : null,
    roe: fm && fin(fm.f.roe?.[fm.i]) ? {t: '자기자본이익', s: '자기 돈 100원으로 ' + fm.y + '년에 ' + (fm.f.roe[fm.i] >= 0 ? n1(fm.f.roe[fm.i]) + '원의 이익을 냈어요(자기자본이익).' : n1(-fm.f.roe[fm.i]) + '원을 잃었어요(자기자본이익이 0 아래).')} : null,
    debt: fm && fin(fm.f.debt?.[fm.i]) ? {t: '빚', s: '빚은 자기 돈 100원에 ' + cop(n1(fm.f.debt[fm.i]) + '원') + '.'} : null,
    biz: typeof cc.products === 'string' && cc.products ? {t: '하는 일', s: cc.products + ' 일을 하는 회사예요.'} : null,
    market: cc.market === 'KOSPI' || cc.market === 'KOSDAQ' ? {t: '시장', s: (cc.market === 'KOSPI' ? '코스피' : '코스닥') + '에 올라 있는 회사예요.'} : null,
    stop: {t: '사기 전에', s: '사기 전에 「왜 사?」 열한 질문으로 내 이유부터 확인해요.'},
    asof: {t: '자료 날짜', s: '숫자는 ' + day(a.board) + ' 판 자료예요. 장이 끝나면 다시 세요.'},
  };
  return out;
}
/** 묶음마다 중요한 차례 — 칸마다 아홉(모자라면 그 칸의 다음 까닭으로 · 그래도 모자라면 남은 까닭 꾸러미에서) */
const ORDER = {
  hot: {기: ['core', 'r20', 'ind', 'rank', 'days', 'mkt', 'r5', 'fomo', 'price', 'both'], 승: ['lead', 'updays', 'best', 'gain', 'inst', 'frgn', 'indiv', 'hold', 'news', 'peers', 'peerRank'],
    전: ['edge', 'leave', 'pos52', 'gap20', 'swing', 'y1', 'mdd', 'past', 'sales', 'pbr'], 결: ['sum', 'watch', 'route', 'op', 'opTrend', 'rev', 'roe', 'debt', 'biz', 'market', 'stop', 'asof']},
  hotNext: {기: ['core', 'rank', 'r20', 'r5', 'days', 'mkt', 'ind', 'fomo', 'price', 'both'], 승: ['lead', 'updays', 'best', 'inst', 'frgn', 'indiv', 'hold', 'gain', 'news', 'peers', 'peerRank'],
    전: ['edge', 'past', 'leave', 'pos52', 'gap20', 'swing', 'y1', 'mdd', 'sales', 'pbr'], 결: ['sum', 'watch', 'route', 'op', 'opTrend', 'rev', 'roe', 'debt', 'biz', 'market', 'stop', 'asof']},
  money: {기: ['core', 'mkt', 'r20', 'rank', 'days', 'ind', 'r5', 'fomo', 'price', 'both'], 승: ['gain', 'lead', 'inst', 'frgn', 'hold', 'indiv', 'news', 'updays', 'best', 'peers', 'peerRank'],
    전: ['edge', 'leave', 'pos52', 'gap20', 'swing', 'y1', 'mdd', 'past', 'sales', 'pbr'], 결: ['sum', 'watch', 'route', 'op', 'opTrend', 'rev', 'roe', 'debt', 'biz', 'market', 'stop', 'asof']},
  moneyNext: {기: ['core', 'rank', 'mkt', 'r20', 'days', 'r5', 'ind', 'fomo', 'price', 'both'], 승: ['gain', 'lead', 'inst', 'frgn', 'hold', 'indiv', 'news', 'updays', 'best', 'peers', 'peerRank'],
    전: ['edge', 'past', 'leave', 'pos52', 'gap20', 'swing', 'y1', 'mdd', 'sales', 'pbr'], 결: ['sum', 'watch', 'route', 'op', 'opTrend', 'rev', 'roe', 'debt', 'biz', 'market', 'stop', 'asof']},
  bloom: {기: ['core', 'mkt', 'r5', 'rank', 'days', 'r20', 'ind', 'fomo', 'price', 'both'], 승: ['lead', 'peers', 'peerRank', 'updays', 'inst', 'frgn', 'hold', 'indiv', 'gain', 'news', 'best'],
    전: ['edge', 'leave', 'past', 'pos52', 'gap20', 'swing', 'y1', 'mdd', 'sales', 'pbr'], 결: ['sum', 'watch', 'route', 'op', 'opTrend', 'rev', 'roe', 'debt', 'biz', 'market', 'stop', 'asof']},
  bloomNext: {기: ['core', 'r5', 'mkt', 'rank', 'days', 'r20', 'ind', 'fomo', 'price', 'both'], 승: ['lead', 'updays', 'best', 'inst', 'frgn', 'hold', 'indiv', 'peers', 'peerRank', 'gain', 'news'],
    전: ['edge', 'past', 'leave', 'pos52', 'gap20', 'swing', 'y1', 'mdd', 'sales', 'pbr'], 결: ['sum', 'watch', 'route', 'op', 'opTrend', 'rev', 'roe', 'debt', 'biz', 'market', 'stop', 'asof']},
};
export const PARTS = Object.freeze([
  {id: '기', name: '기 — 지금 모습과 가장 큰 이유'}, {id: '승', name: '승 — 왜 그렇게 됐나'},
  {id: '전', name: '전 — 넓게 보면 · 바뀌는 조건'}, {id: '결', name: '결 — 그래서 · 볼 것'}]);
/** 첫 까닭(묶음마다 su-21.js why21 글)이 이미 말한 것은 다시 쓰지 않음 — 같은 숫자를 두 번 세지 않게 */
const SAID = (k, w) => ({hot: ['ind', 'r20'], money: ['lead', 'gain'], bloom: ['lead'], hotNext: w.how === 'rank' ? ['past'] : ['past', 'lead', 'r5'],
  moneyNext: ['lead', 'gain', 'past'], bloomNext: ['past', 'lead']}[k] ?? []);
export function why36(X) {
  const F = facts(X), O = ORDER[X.k], used = new Set(SAID(X.k, X.c.why ?? {})), parts = PARTS.map(p => ({...p, items: []}));
  parts.forEach(p => { for (const id of O[p.id]) { if (p.items.length >= 9) break; if (F[id] && !used.has(id)) { p.items.push({id, ...F[id]}); used.add(id); } } });
  const spare = Object.keys(F).filter(id => F[id] && !used.has(id)); // 칸이 모자라면 남은 까닭으로(자료가 빈 회사)
  parts.forEach(p => { while (p.items.length < 9 && spare.length) { const id = spare.shift(); p.items.push({id, ...F[id]}); used.add(id); } });
  let n = 0; for (const p of parts) for (const it of p.items) it.n = ++n;
  return parts;
}

/* ═══ 포모지수 — 소거 기준 일곱 · 까닭 열하나(su21-why.json 그대로) ═══ */
const FEAT_SAY = {
  return10: (v, s) => '열흘 동안 ' + won(100 * (Math.exp(v) - 1)) + '이 됐어요. 10만 길 가운데 이보다 덜 오른 길이 100번에 ' + Math.round(s) + '번꼴이에요.',
  acceleration: (v, s) => '뒤 닷새가 앞 닷새보다 ' + (v >= 0 ? '더 올랐어요' : '덜 올랐어요') + '(차이 ' + n1(Math.abs(100 * v)) + '만큼). 10만 길 가운데 자리는 ' + cop(Math.round(s)) + '.',
  upDays: (v, s) => '열흘 가운데 ' + Math.round(v * 10) + '일 올랐어요. 10만 길 가운데 자리는 ' + cop(Math.round(s)) + '.',
  maGap: (v, s) => '지금 값이 20일 평균보다 ' + n1(Math.abs(100 * v)) + '만큼 ' + (v >= 0 ? '높아요' : '낮아요') + '. 10만 길 가운데 자리는 ' + cop(Math.round(s)) + '.',
  breakout: (v, s) => '직전 60일 가장 높은 값보다 ' + (v >= 0 ? n1(100 * v) + '만큼 위예요' : n1(Math.abs(100 * v)) + '만큼 아래예요') + '. 10만 길 가운데 자리는 ' + cop(Math.round(s)) + '.',
  upVariation: (v, s) => '열흘 움직임 가운데 오른 날 몫이 100에 ' + cop(Math.round(100 * v)) + '. 10만 길 가운데 자리는 ' + cop(Math.round(s)) + '.'};
export function fomo11(F, why) {
  if (!F || F.verdict !== 'pass' || !fin(F.v)) return null;
  const G = Object.fromEntries((F.groups ?? []).map(g => [g.id, g])), FL = Object.fromEntries((why?.feats ?? []).map(f => [f.id, f.label]));
  const top = [...(F.f ?? [])].sort((p, q) => q.score * q.w - p.score * p.w)[0];
  const rows = [
    {t: '포모지수 ' + F.v, s: '지난 1년 이 회사의 하루 움직임을 섞어 만든 열흘 길 ' + num(F.paths) + '개 가운데, 오늘까지 열흘이 얼마나 뜨거운지예요. 50이면 보통, 100에 가까울수록 뜨거워요.'},
    {t: '추세 묶음 ' + Math.round(G.trend?.score ?? NaN), s: '오르는 힘(열흘 상승 · 가속 · 오른 날 비중)을 무게대로 합친 점수예요.'},
    {t: '가격 위치 묶음 ' + Math.round(G.place?.score ?? NaN), s: '값의 자리(20일 평균 이격 · 60일 고점 돌파 · 오른 날 움직임 몫)를 무게대로 합친 점수예요.'},
    ...(F.f ?? []).map(f => ({t: (FL[f.id] ?? f.id) + ' ' + Math.round(f.score), s: FEAT_SAY[f.id] ? FEAT_SAY[f.id](f.act, f.score) : ''})),
    {t: '무게', s: '같은 묶음에서 서로 많이 닮은 잣대는 무게를 줄였어요. 가장 크게 끌어당긴 잣대는 ' + cop('「' + (FL[top?.id] ?? NEED) + '」') + '.'},
    {t: '바탕', s: (ymd(F.base?.from) ?? NEED) + '부터 ' + (ymd(F.base?.to) ?? NEED) + '까지 하루 움직임 ' + F.base?.n + '날에서 마구 뽑았어요(' + day(F.asOf) + ' 종가까지). '
      + (fin(F.se) && F.se < 0.1 ? '다시 세어도 값이 0.1보다 적게 흔들려요.' : '다시 세어도 값이 ' + n1(F.se) + ' 안에서 흔들려요.')}];
  return rows.slice(0, 11);
}

/* ═══ 한눈 그림(주문 0510 · 사장님 2026-11-10 05:10 「이곳에 글이 너무 어렵고 많아 핵심을 도식화로 만들어서 한눈에 알수있도록 해 11개 에이전트 활용하고
       잡스라면 어떻게 했을지 공부 한다음 혁신적으로 개선해」) — 맨 위 한 장: ① 한 줄 답 ② 고른 길(상장 → 우량주 → 기준을 지난 곳 → 일곱 → 이 회사)
   ③ 드묾 한 줄 ④ 지난 1년(될 듯 셋 — 100번에 몇 번 · 아무 회사) · 글씨는 모두 HTML(그림 속 글자 0) · 숫자는 받은 자료 그대로 ═══ */
const PASTW = (T, k) => ({hotNext: '한 달 안에 불장 일곱에 든 횟수예요.', moneyNext: '한 달 안에 돈이 몰리는 일곱에 든 횟수예요.',
  bloomNext: (T?.past?.bloomFrom === 'pick' ? '고른 날부터 ' : '') + '한 달 안에 시장보다 15 넘게 앞서 꽃이 된 횟수예요.'}[k] ?? '');
/** 한 줄 답 — 묶음마다 가장 큰 까닭 하나(su-21.js why21 의 첫 마디와 같은 숫자) */
export function answer1(T, c, k) {
  const w = c.why ?? {}, st = c.mc?.stat;
  const vs = x => (fin(x) ? '시장보다 ' + n1(Math.abs(x)) + '만큼 ' + (x >= 0 ? '앞섰어요.' : '뒤졌어요.') : '시장과 견준 값은 ' + NEED + '예요.'); // 「+10만큼」은 「10만」으로 읽힘 — 표 없이 앞섬 · 뒤짐
  if (!MCR(T)) return String(why21(c, k, T)).split(/(?<=[요다]\.)\s/)[0];
  return {hot: c.ind + ' 업종이 불장이에요. 한 달 새 ' + (fin(c.ch20) ? won(c.ch20) + '이 됐어요.' : NEED),
    hotNext: '불장 일곱 밖에서 닷새 새 ' + (fin(w.r5) ? won(w.r5) + '이 됐어요.' : NEED),
    money: c.ind + ' 업종이 한 달 동안 ' + vs(st),
    moneyNext: c.ind + ' 업종이 닷새 동안 ' + vs(st),
    bloom: '아직 싹이에요. ' + c.ind + ' 업종은 한 달 동안 ' + vs(st),
    bloomNext: '아직 싹인데, 닷새 동안 ' + vs(st)}[k] ?? NEED;
}
/** 고른 길 다섯 칸 — 큰 수 · 이름(넓이는 좁아지는 뜻만 · 실제 수는 글로) · 칸마다 그 칸의 기준(기준 일곱을 칸에 나눔) */
const stepOf = x => (/우량주/.test(x.t) ? 1 : /^몬테카를로|^소거/.test(x.t) ? 2 : /차례|업종마다/.test(x.t) ? 3 : 4);
export function path5(T, c, k, pos, C7 = []) {
  const ind = k === 'money' || k === 'moneyNext', pool = fin(c.mc?.pool) ? c.mc.pool : T?.counts?.pools?.[k] ?? null;
  const cut = String(C7.find(x => /^소거 한 번 — /.test(x.t))?.t ?? '').replace(/^소거 한 번 — /, ''); // 거른 기준 이름(기준 일곱의 소거 줄 그대로)
  const S = [{v: T?.counts?.listed, n: num(T?.counts?.listed) + '곳', t: '상장 회사 모두', say: (T?.counts?.listedWhat ? T.counts.listedWhat.replace(' · ', '와 ') + ' ' : '') + num(T?.counts?.listed) + '곳에서 시작해요.'},
    {v: T?.counts?.b365, n: num(T?.counts?.b365) + '곳', t: '우량주만'},
    {v: pool, n: (fin(pool) ? num(pool) : NEED) + '곳', t: cut || (ind ? '기준을 지난 업종' : '기준을 지난 회사')},
    {v: 7, n: '일곱', t: KIND[k] + ' · 드문 차례로'}, {v: 1, n: '한 곳', t: c.name + ' · 일곱 가운데 ' + (pos > 0 ? ord(pos) : NEED), me: true}];
  C7.forEach((x, j) => { const st = S[stepOf(x)]; (st.items ??= []).push({...x, n: j + 1}); });
  return S;
}
/** 드묾 — 왜 쪽 첫 까닭(why21)과 같은 셈(문화 셈 판의 될 듯 둘은 365곳 모두의 길) · {n: 이만큼 간 길 수, all: 그린 길 수} */
const rareOf = (T, c) => { const m = c.mc ?? {}; if (!MCR(T) || !fin(m.p)) return null; const p = CUR(T) && fin(m.pm) ? m.pm : m.p, all = T?.mc?.paths ?? 100000;
  return {n: Math.round(p * all), all}; };
/** 100개에 몇 개 — 잡스처럼 큰 수를 떠올릴 수 있는 크기로(일꾼 04 「하루 2만 대」) */
const per100 = (n, all) => { const v = 100 * n / all; return v < 1 ? '100개에 1개가 안 돼요.' : Number.isInteger(Math.round(v * 10) / 10) ? '100개에 ' + Math.round(v) + '개꼴이에요.' : '100개에 ' + Math.ceil(v) + '개가 안 돼요.'; };
/** 네모 백 칸 — 칠한 만큼(소수 됨 · 마지막 칸은 그만큼만) */
/** 꾸밈 값은 CSSOM 으로(사이트 보안 규칙 style-src 'self' — 글로 쓴 style 속성은 막힘 · 전체 검사 1/11 「화면 오류」) */
const cssv = (e, k, v) => { e.style.setProperty(k, v); return e; };
const grid100 = (fill, cls, label) => h('span', {class: 'yw-g100 ' + cls, role: 'img', 'aria-label': label},
  Array.from({length: 100}, (_, i) => { const c = h('i', {class: 'yw-c'}); return i < Math.floor(fill) ? cssv(c, '--f', '100%') : i === Math.floor(fill) && fill % 1 ? cssv(c, '--f', Math.round((fill % 1) * 100) + '%') : c; }));
export function glance(T, c, k, pos, C7 = []) {
  const P = path5(T, c, k, pos, C7), past = T?.past?.[k], A = answer1(T, c, k), R = rareOf(T, c), nOk = C7.filter(x => x.ok).length;
  const step = (r, i) => cssv(h('li', {class: 'yw-st' + (r.me ? ' yw-sme' : '')},
    h('details', {class: 'yw-sd'}, h('summary', {class: 'yw-ss'}, h('b', {class: 'yw-sn', text: r.n}), ' ', h('span', {class: 'yw-sl', text: r.t}), r.items || r.say ? h('i', {class: 'yw-chev', 'aria-hidden': 'true'}) : null), ' ',
      r.say ? h('p', {class: 'yw-s', text: r.say}) : null,
      r.items ? h('ol', {class: 'yw-ol yw-sx'}, r.items.map(x => li(x.n, x.t, x.s, okMark(x.ok)))) : null)), '--i', String(i));
  const top = h('section', {class: 'yw-glance yw-crit', 'aria-label': '한눈에 — 왜 여기 있나', 'data-listed': String(P[0].v ?? ''), 'data-b365': String(P[1].v ?? ''), 'data-pool': String(P[2].v ?? ''), 'data-pos': String(pos), 'data-ok': String(nOk)},
    h('p', {class: 'yw-a1', text: A}),
    h('div', {class: 'yw-fun'}, h('h2', {class: 'yw-gh', text: num(T?.counts?.listed) + '곳을 세 번 걸러 남은 일곱 가운데 하나예요'}),
      h('ol', {class: 'yw-steps', 'aria-label': P.map(r => r.n + ' ' + r.t).join(' → ')}, P.map(step)),
      h('p', {class: 'yw-dots', 'aria-label': '고른 기준 일곱 가운데 ' + nOk + '가지 맞음'}, C7.map(x => h('i', {class: 'yw-dot ' + (x.ok ? 'yw-dok' : 'yw-dno'), 'aria-hidden': 'true'})), ' ',
        h('b', {text: nOk === C7.length ? '기준 일곱 모두 맞아요' : '기준 일곱 가운데 ' + nOk + '가지 맞아요'}), ' ', h('span', {text: '칸을 누르면 그 칸의 기준이 열려요.'}))));
  const more = h('section', {class: 'yw-glance yw-g2', 'aria-label': '드묾과 지난 1년'}, // 세 칸(첫 발견 · 며칠째 · 포모지수) 뒤 — 우연이었나 · 지난 1년 · 셈한 날
    R ? h('div', {class: 'yw-rare'}, h('h2', {class: 'yw-gh', text: '우연이었을까요?'}),
      h('div', {class: 'yw-pic'}, grid100(100 * R.n / R.all, 'yw-ga', korN(R.all) + '개 가운데 ' + num(R.n) + '개'),
        h('p', {class: 'yw-cap'}, h('span', {text: '지난 1년 하루 값을 섞어 길 ' + korN(R.all) + '개를 그렸어요.'}), ' ', h('b', {text: '이만큼 간 길은 ' + num(R.n) + '개뿐이에요.'}), ' ', h('span', {text: per100(R.n, R.all)}), ' ', h('span', {class: 'yw-small', text: '네모 하나가 길 ' + korN(R.all / 100) + '개예요.'})))) : null,
    past && fin(past.per100) && fin(past.base100) ? h('div', {class: 'yw-past'}, h('h2', {class: 'yw-gh', text: '지난 1년, 이렇게 고른 회사는?'}),
      h('div', {class: 'yw-pics2'},
        h('figure', {class: 'yw-pic2'}, grid100(past.per100, 'yw-ga', '이렇게 고른 회사 100번에 ' + past.per100 + '번'), h('figcaption', null, h('span', {text: '이렇게 고른 회사'}), ' ', h('b', {text: '100번에 ' + past.per100 + '번'}))),
        h('figure', {class: 'yw-pic2'}, grid100(past.base100, 'yw-gg', '아무 회사 100번에 ' + past.base100 + '번'), h('figcaption', null, h('span', {text: '아무 회사'}), ' ', h('b', {text: '100번에 ' + past.base100 + '번'})))),
      h('p', {class: 'yw-cap'}, h('span', {text: PASTW(T, k)}), ' ', fin(past.h1) && fin(past.h2) ? h('span', {class: 'yw-small', text: '앞 반년 ' + past.h1 + '번, 뒤 반년 ' + past.h2 + '번이에요.'}) : null)) : null,
    h('p', {class: 'yw-stamp', text: day(T?.asOf?.board) + ' 마지막 값으로 셌어요. 지난 기록이고, 앞날은 맞히지 않아요.'}));
  return {top, more};
}
/** 포모 온도계 — 0 차분 · 50 보통 · 100 뜨거움(주문 0510 일꾼 10 「멈춤」 — 뜨거움이 경보처럼 혼자 서지 않게) · 바로 아래 「사기 전에 한 번 멈춰요」 */
const thermo = c => (fin(c.fomo) ? h('div', {class: 'yw-th'},
  h('p', {class: 'yw-tt'}, h('b', {text: '포모지수 ' + c.fomo}), ' ', h('span', {text: '보통은 50이에요'})),
  h('span', {class: 'yw-tbar', role: 'img', 'aria-label': '온도계 — 0은 차분 · 50은 보통 · 100은 뜨거움 · 지금 ' + c.fomo}, cssv(h('i', {class: 'yw-tmark'}), '--v', Math.max(0, Math.min(100, c.fomo)) + '%')),
  h('span', {class: 'yw-tsc', 'aria-hidden': 'true'}, h('span', {text: '0 차분'}), h('span', {text: '50 보통'}), h('span', {text: '100 뜨거움'})),
  h('p', {class: 'yw-s', text: '뜨거움은 앞날을 말하지 않아요. 사기 전에 한 번 멈춰요.'})) : null);

/* ═══ 쪽 ═══ */
const box = (cls, title, kids) => h('section', {class: 'yw-box ' + cls, 'aria-label': title}, h('h2', {class: 'yw-h', text: title}), ...kids);
// 제목 · 문장 · 표 사이에 띄어쓰기 글(화면에는 안 보임 — 칸이 grid) — 글을 이어 읽을 때 「크기」+「회사」가 「기회」처럼 붙지 않게(쓰지 않을 말 셈)
const li = (n, t, s, extra = null) => h('li', {class: 'yw-li'}, h('span', {class: 'yw-n', 'aria-hidden': 'true', text: String(n)}), ' ', h('div', {class: 'yw-tx'}, h('b', {class: 'yw-t', text: t}), ' ', h('p', {class: 'yw-s', text: s}), ' ', extra));
const okMark = ok => h('span', {class: 'yw-ok ' + (ok ? 'yw-pass' : 'yw-no'), text: ok ? '맞음' : '아직'});
/* ── 접는 상자(주문 0510 · 사장님 2026-11-10 05:10 「이곳에 글이 너무 어렵고 많아 핵심을 도식화로 만들어서 한눈에 알 수 있도록」) — 긴 글은 눌러야 열림 · 닫힌 줄에 무엇이 들었는지 한 줄 ── */
const fold = (cls, title, hint, kids, shut = false) => {
  const d = h('details', {class: 'yw-box yw-fold ' + cls},
    h('summary', {class: 'yw-fs'}, h('span', {class: 'yw-fst'}, h('h2', {class: 'yw-h', text: title}), ' ', hint ? h('span', {class: 'yw-hint', text: hint}) : null), h('i', {class: 'yw-chev', 'aria-hidden': 'true'})), ' ', ...kids);
  if (shut) { // 긴 상자 끝 「접기」(일꾼 06 「손가락」 — 위로 다시 밀지 않고 닫음)
    const b = h('button', {type: 'button', class: 'yw-shut', text: '접기'});
    b.addEventListener('click', () => { d.open = false; d.querySelector('summary')?.scrollIntoView({block: 'nearest'}); });
    d.append(b);
  }
  return d;
};

/* ── 더 엄격하게(주문 0854 · 사장님 2026-11-09 08:54 「몬테카를로 방식으로 먼저 찾아낸 다음 소거법을 31번 더 돌려서 지금보다 엄격한 기준으로」 · 09:02 「어」)
   su21-strict.json 그대로 — 몬테카를로(10만 길 · 스무 번에 한 번 아래) · 후보 → 몬테카를로 → 기준 31가지 → 남은 곳 · 기준마다 이 회사 값과 통과(가 ~ 마 다섯 묶음) */
const PASS = ok => h('span', {class: 'yw-ok ' + (ok ? 'yw-pass' : 'yw-no'), text: ok ? '통과' : '걸림'});
export function strict31(SX, T, k, code) {
  const g = SX && SX.rule && T?.strict?.rule === SX.rule && SX.asOf?.board === T?.asOf?.board ? SX.groups?.[k] : null, me = g?.co?.[code];
  const mark = T?.strict?.mode === 'mark', hasOk = !!me && Array.isArray(me.ok) && me.ok.length === (SX?.crit ?? []).length; // 주문 1209 — 42칸 모두: 몬테카를로에서 걸린 곳도 그 값까지 보여 줌
  if (!g || !me || (!hasOk && !(mark && me.mc))) return null;
  const a = me.mc?.stat, w = g.win, rel = g.rel, p = me.mc?.p;
  const say = !Number.isFinite(a) ? NEED : rel ? (w === 20 ? '20거래일' : '닷새') + ' 동안 ' + (g.ind ? '이 회사 업종이 ' : '') + '시장보다 ' + n1(Math.abs((Math.exp(a / 100) - 1) * 100)) + '만큼 ' + (a >= 0 ? '앞섬' : '뒤짐')
    : (w === 20 ? '20거래일' : '닷새') + ' 동안 100원이 ' + num(Math.round(100 * Math.exp(a / 100))) + '원';
  const cut = Math.round((SX.mc?.p ?? 0.05) * (SX.mc?.paths ?? 100000));
  const fams = [...new Set(SX.crit.map(c => c.fam))];
  const nOk = hasOk ? me.ok.filter(Boolean).length : 0, passed = hasOk && nOk === me.ok.length;
  const verdict = !mark ? null : passed ? '이 회사는 몬테카를로와 기준 31가지를 모두 지나 첫 페이지 칸에 「큐피트 계산법」 표가 붙었어요.'
    : hasOk ? '이 회사는 기준 31가지 가운데 ' + nOk + '가지를 지나 표가 붙지 않았어요. 걸린 기준은 아래에 「걸림」으로 보여요.'
    : '이 회사는 몬테카를로에서 걸려 기준 31가지는 세지 않았어요. 그래서 표가 붙지 않았어요.';
  let n = 0;
  return fold('yw-strict', mark ? (passed ? '큐피트 계산법으로 찾은 종목 — 몬테카를로와 기준 31가지' : '큐피트 계산법 — 몬테카를로와 기준 31가지') : '더 엄격하게 — 몬테카를로와 기준 31가지', hasOk ? '31가지 가운데 ' + nOk + '가지를 지났어요' : '몬테카를로에서 걸렸어요', [
    h('p', {class: 'yw-s', text: '지난 ' + num(SX.mc?.hist ?? 250) + '거래일 하루 값을 ' + num(SX.mc?.paths ?? 100000) + '번 섞어 그린 길 가운데, 지금 모습(' + say + ')보다 크거나 같은 길은 '
      + num(Math.round((p ?? 0) * (SX.mc?.paths ?? 100000))) + '번이었어요. ' + num(cut) + '번 아래(스무 번에 한 번 아래)만 남겨요.'}),
    h('p', {class: 'yw-s', text: '이 묶음 후보 ' + g.pool + '곳 → 몬테카를로를 지난 곳 ' + g.mc + '곳 → 기준 31가지를 모두 지난 곳 ' + g.final + '곳이에요.'}),
    verdict ? h('p', {class: 'yw-s yw-verdict', text: verdict}) : null,
    ...(hasOk ? fams.flatMap(f => [h('h3', {class: 'yw-h3', text: f + ' · ' + (SX.fams?.[f] ?? '')}),
      h('ol', {class: 'yw-ol', start: String(n + 1)}, SX.crit.map((c, j) => [c, j]).filter(([c]) => c.fam === f).map(([c, j]) => { n++; return li(n, c.label + ' — ' + c.rule, c.why + ' · 이 회사: ' + (me.v?.[j] ?? NEED), PASS(me.ok[j])); }))]) : [])]);
}
function ensureCss() { if (typeof document !== 'undefined' && !document.querySelector(`link[href="${CSS}"]`)) document.head.append(Object.assign(document.createElement('link'), {rel: 'stylesheet', href: CSS})); }

export async function vWhy(X, code, k) {
  ensureCss();
  const get = X.get;
  const T0 = load21(get); // 엄격 셈 자세히(su21-strict.json)는 엄격 셈 판(su21.json strict)일 때만 받음 — 몬테카를로 차례 판(주문 1422)에는 그 파일이 없음(없는 파일을 물으면 화면 오류)
  const [T, Tn, W, co, M, b, SX, CU] = await Promise.all([T0, get('/su/data/su21-next.json').catch(() => null), get('/su/data/su21-why.json').catch(() => null),
    get('/atlas/data/co/' + code + '.json').catch(() => null), get('/su/data/su21-map.json').catch(() => null), X.base().catch(() => ({})), T0.then(T => (T?.strict ? get('/su/data/su21-strict.json').catch(() => null) : null)).catch(() => null),
    T0.then(T => (CUR(T) ? get('/su/data/su21-cu.json').catch(() => null) : null)).catch(() => null)]); // 주문 1912 — 문화 일곱 · 칸마다 흔적(문화 셈 판일 때만)
  if (CU && T && CU.rule === T.listRule && CU.asOf?.board === T.asOf?.board) T.culture = {...(T.culture ?? {}), ...(CU.culture ?? {})}; // 같은 판 날 · 같은 규칙만
  const nx = k.endsWith('Next'), src = nx ? (Tn?.lists?.[k] ?? T?.lists?.[k]) : T?.lists?.[k];
  const c = (src ?? []).find(x => x.code === code);
  if (!c) return X.notFound('이 회사는 오늘 그 묶음에 없어요. 첫 페이지에서 다시 골라 주세요.');
  if (!c.cu && CU && CU.rule === T?.listRule && CU.asOf?.board === T?.asOf?.board) c.cu = CU.cu?.[k + ':' + code] ?? null;
  if (X.setCur) X.setCur({code, name: c.name, ind: c.ind});
  const indRow = (M?.lands ?? []).flatMap(l => l.inds ?? []).find(i => i.name === c.ind);
  const peers = indRow?.cos ?? null, st = closeStats(c);
  const fo = W && W.board === T?.asOf?.board ? W.fomo?.[code] ?? null : null; // 같은 판 날의 포모 자료만
  const X2 = {T, c, k, co, peers, st, fo, indCh20: fin(indRow?.ch20) ? indRow.ch20 : null};
  const C7 = crit7(T, c, k), P = why36(X2), F11 = fomo11(fo, W);
  const head = h('section', {class: 'yw-sum', 'aria-label': '첫 발견 · 며칠째 · 포모지수'},
    h('p', {class: 'yw-chip'}, h('span', {text: '첫 발견'}), h('b', {text: fin(c.days) ? day(c.found) : NEED})),
    h('p', {class: 'yw-chip'}, h('span', {text: '며칠째'}), h('b', {text: fin(c.days) ? c.days + '일째' : NEED})),
    h('p', {class: 'yw-chip'}, h('span', {text: '포모지수'}), h('b', {text: fin(c.fomo) ? String(c.fomo) : '보류'}), fin(c.fomo) ? h('small', {class: 'yw-c50', text: '보통 50'}) : null));
  const parts = P.map(p => box('yw-part', p.name, [h('ol', {class: 'yw-ol', start: String(p.items[0]?.n ?? 1)}, p.items.map(it => li(it.n, it.t, it.s)))]));
  const why36box = fold('yw-36', '이유 서른여섯 가지', '중요한 차례로 기승전결 아홉씩', parts, true);
  const fomoBox = fold('yw-fomo', fin(c.fomo) ? '포모지수 ' + c.fomo + ' — 왜 이 값이 나왔나요?' : '포모지수 — 보류', fin(c.fomo) ? '50이 이 회사의 보통 때예요' : '오늘은 값을 보여 드리지 않아요',
    [h('h3', {class: 'yw-h3', text: '기준 일곱 가지(소거법)'}),
      h('ol', {class: 'yw-ol'}, (W?.checks ?? []).map((x, j) => { const r = fo?.checks?.find(y => y.id === x.id); return li(j + 1, x.label + ' — ' + x.rule, x.why + '.', okMark(r?.verdict === 'pass')); })),
      F11 ? h('h3', {class: 'yw-h3', text: '이 값이 나온 이유 열한 가지'}) : null,
      F11 ? h('ol', {class: 'yw-ol'}, F11.map((x, j) => li(j + 1, x.t, x.s))) : h('p', {class: 'yw-s', text: fo ? '기준 「' + ((W?.checks ?? []).find(x => x.id === fo.first)?.label ?? NEED) + '」에서 걸려 값을 보여 드리지 않아요.' : '포모 자료가 오늘 판과 날이 달라 값을 보여 드리지 않아요.'})]);
  const strictBox = MCR(T) ? top3Box(T, c, k) : strict31(SX, T, k, code); // 주문 1422 — 몬테카를로 차례 판은 1억 번 셈 상자 · 옛 판은 엄격 셈 상자
  const cuBox = cultureBox(T, c); // 주문 1912 — 문화 셈 판은 한국 투자자 문화 일곱 상자(1억 번 셈 상자 앞)
  const go = h('nav', {class: 'yw-go', 'aria-label': '다음에 볼 곳'},
    h('a', {class: 'su-ask', href: '#/c/' + code}, h('b', {text: '이 회사 쪽 보기'}), h('span', {text: '한 달 꺾은선과 업종을 봐요.'})),
    h('a', {class: 'su-ask', href: '#/q/' + code}, h('b', {text: '사기 전에 한 번 멈춰요'}), h('span', {text: '「왜 사?」 열한 질문으로 내 이유부터 확인해요.'})));
  const G = glance(T, c, k, (src ?? []).findIndex(x => x.code === code) + 1, C7); // 주문 0510 — 한눈 그림(답 한 줄 · 고른 길 · 기준 일곱) → 세 칸 → 우연이었나 · 지난 1년 → 접은 상자
  const hero = h('div', {class: 'su-hero yw', 'data-g': 'su-why36', 'data-k': k, 'data-code': code, 'data-n': String(P.reduce((a, p) => a + p.items.length, 0)), 'data-fomo': fin(c.fomo) ? String(c.fomo) : ''},
    G.top, head, G.more, cuBox, strictBox, why36box, fomoBox, thermo(c), go); // 주문 0510 — 한눈 그림 먼저 · 긴 글은 접음 · 온도계 뒤에 멈춤
  const pro = fo && F11 ? [h('section', {class: 'su-why', 'aria-label': '포모 셈 자세히'}, h('h2', {class: 'su-ft', text: '포모 셈 자세히'}),
    h('p', {class: 'su-lead', text: '옛 아틀라스 포모 열여덟 가지 가운데 종가로 셀 수 있는 「가격 열기」 여섯 가지로 셈해요. 길 ' + num(fo.paths) + '개 · 흔들림 ' + n1(fo.se) + ' · 바탕 ' + fo.base?.n + '날 · 같은 날 같은 회사는 늘 같은 값이에요.'}))] : [];
  return {title: c.name + ' · 왜?', tab: 0, h1: c.name + ', 왜 ' + ASK[k] + '?', proper: false, hero, body: pro,
    next: {href: '#/c/' + code, label: '이 회사 한 달 값은?'}, asOf: T?.asOf?.board, S: b?.S ?? null};
}
