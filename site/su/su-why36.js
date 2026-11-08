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
import {dateKo} from '/su/su-data.js';
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
const share = v => '100주에 ' + n1(v) + '주';
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
  const L = T?.lists?.[k] ?? [], i = L.findIndex(x => x.code === c.code), w = c.why ?? {}, a = T?.asOf ?? {};
  const sameInd = L.filter(x => x.ind === c.ind).length;
  const base = {t: '우량주 365곳 안', s: '상장 회사 ' + (num(T?.counts?.listed) ?? NEED) + '곳 가운데 고른 우량주 365곳에 들어 있어요. ' + (KIND_ROUTE[c.kind] ? KIND_ROUTE[c.kind] + ' 들었어요.' : ''), ok: true};
  const opens = {t: '회사 자료가 다 있음', s: '이름 · 시장 · 지난 값 자료가 모두 있어 누르면 회사 쪽이 열리는 회사만 골라요.', ok: true};
  const fresh = {t: '그날 값이 있음', s: day(c.date) + ' 마지막 값이 있어요. 값이 늦은 회사는 빼요.', ok: c.date === a.board};
  const calm = {t: '하루 35 넘게 튄 날 없음', s: '지난 20거래일 동안 하루에 35만큼 넘게 움직인 날이 없어요. 그런 날은 주식을 나누거나 합친 흔적이라 빼요.', ok: true};
  if (k === 'hot') return [base,
    {t: '업종이 불장 업종', s: c.ind + ' 업종 365곳 평균이 지난 20거래일 동안 ' + (fin(w.ind20) ? won(w.ind20) + '이 됐어요' : NEED) + '. 평균이 오른 업종 가운데 큰 차례로 열한 업종까지가 불장 업종이에요.', ok: fin(w.ind20) && w.ind20 > 0},
    {t: '20거래일 동안 오름', s: day(c.date) + '까지 20거래일 동안 ' + (fin(c.ch20) ? won(c.ch20) + '이 됐어요.' : NEED), ok: fin(c.ch20) && c.ch20 > 0},
    {t: '오른 차례 일곱 안', s: '불장 업종 회사 ' + (num(T?.counts?.hotPool) ?? NEED) + '곳을 20거래일 동안 오른 차례로 줄 세워 ' + (i + 1) + '번째예요.', ok: i >= 0 && i < 7},
    {t: '업종마다 둘까지', s: '한 업종에서 둘까지만 골라요. ' + c.ind + ' 업종은 일곱 가운데 ' + sameInd + '곳이에요.', ok: sameInd <= 2},
    fresh, opens];
  if (k === 'bloom') return [base,
    {t: '싹 ① 아직 덜 감', s: '한 달 동안 시장보다 앞선 만큼이 5 아래예요. 지금 ' + sgn(c.x) + '만큼이에요.', ok: fin(c.x) && c.x < 5},
    {t: '싹 ② 닷새 동안 뒤지지 않음', s: '닷새 동안 시장보다 ' + sgn(c.y) + '만큼으로 뒤지지 않았어요.', ok: fin(c.y) && c.y >= 0},
    {t: '회사 크기 위 20 안', s: '회사 크기(시가총액)가 ' + eok(c.cap) + '으로, 모든 회사를 크기 차례로 세운 위 20 안이에요(선 ' + eok(w.capTop20) + ').', ok: fin(c.cap) && fin(w.capTop20) && c.cap >= w.capTop20},
    {t: '업종이 시장보다 앞선 차례', s: c.ind + ' 업종이 한 달 동안 시장보다 ' + sgn(w.indX) + '만큼 더 갔어요. 업종이 많이 앞선 차례로 골라 ' + (i + 1) + '번째예요.', ok: fin(w.indX)},
    {t: '꽃 선 15', s: w.full ? '업종이 시장보다 15 넘게 앞서 꽃 선을 넘었어요.' : '업종이 꽃 선 15를 아직 넘지 못해, 꽃 선에 가장 가까운 차례로 골랐어요.', ok: !!w.full},
    opens];
  if (k === 'money') return [base,
    {t: '업종이 시장보다 더 오름', s: c.ind + ' 업종이 한 달 동안 시장보다 ' + sgn(w.indX) + '만큼 더 갔어요.', ok: fin(w.indX) && w.indX > 0},
    {t: '업종 차례 일곱 안', s: '시장보다 더 오른 업종을 큰 차례로 세워 ' + (i + 1) + '번째 업종이에요.', ok: i >= 0 && i < 7},
    {t: '업종마다 하나', s: c.ind + ' 업종 365곳 가운데 회사 크기가 가장 많이 는 한 곳만 골라요.', ok: true},
    {t: '회사 크기가 원으로 늚', s: '20거래일 동안 회사 크기가 ' + eok(w.gain) + ' 늘었어요.', ok: fin(w.gain) && w.gain > 0},
    calm, opens];
  if (k === 'hotNext') return [base,
    w.how === 'rank' ? {t: '업종이 불장 업종', s: c.ind + ' 업종은 불장 업종이에요.', ok: true} : {t: '업종도 닷새 오름', s: c.ind + ' 업종이 닷새 동안 ' + (fin(w.ind5) ? won(w.ind5) + '이 됐어요.' : NEED), ok: fin(w.ind5) && w.ind5 > 0},
    w.how === 'rank' ? {t: '불장 일곱 바로 아래', s: '불장 업종 안에서 20거래일 동안 오른 차례가 ' + w.rank + '번째예요(8 ~ 14째).', ok: fin(w.rank) && w.rank >= 8 && w.rank <= 14}
      : {t: '닷새 동안 막 오름', s: '닷새 동안 ' + (fin(w.r5) ? won(w.r5) + '이 됐어요.' : NEED) + ' 일곱 바로 아래가 모자라 닷새 차례로 채웠어요.', ok: fin(w.r5) && w.r5 > 0},
    {t: '20거래일 동안 오름', s: '20거래일 동안 ' + (fin(w.r20) ? won(w.r20) + '이 됐어요.' : NEED), ok: fin(w.r20) && w.r20 > 0},
    {t: '업종마다 둘까지', s: '한 업종에서 둘까지만 골라요. ' + c.ind + ' 업종은 일곱 가운데 ' + sameInd + '곳이에요.', ok: sameInd <= 2},
    calm, opens];
  if (k === 'moneyNext') return [base,
    {t: '업종이 시장보다 더 오름', s: c.ind + ' 업종이 한 달 동안 시장보다 ' + sgn(w.indX) + '만큼 더 갔어요.', ok: fin(w.indX)},
    w.how === 'rank' ? {t: '돈이 몰리는 일곱 바로 아래 업종', s: '시장보다 더 오른 업종 차례로 ' + w.rank + '번째 업종이에요(8 ~ 14째).', ok: fin(w.rank) && w.rank >= 8}
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
    core: {t: '가장 큰 까닭', s: why21(c, k, T)},
    rank: i >= 0 ? {t: '일곱 가운데 자리', s: kn + ' 일곱 가운데 ' + (i + 1) + '번째로 이름이 올라 있어요.'} : null,
    days: fin(c.days) ? {t: '며칠째', s: day(c.found) + '에 이 묶음에서 처음 발견됐고, 오늘(' + day(a.board) + ')로 장이 열린 날 ' + c.days + '일째예요.' + (c.since ? ' 기록 첫날부터 이어져 그 앞은 셀 수 없어요.' : '')} : null,
    r20: fin(c.ch20) ? {t: '20거래일 움직임', s: day(c.date) + '까지 20거래일 동안 ' + won(c.ch20) + '이 됐어요.'} : st ? {t: '20거래일 움직임', s: '20거래일 동안 ' + won(st.r20) + '이 됐어요.'} : null,
    ind: k === 'hot' && fin(w.ind20) ? {t: '업종 평균', s: c.ind + ' 업종 365곳 평균은 20거래일 동안 ' + won(w.ind20) + '이 됐어요.'} : X.indCh20 != null ? {t: '업종 평균', s: c.ind + ' 업종 365곳 다섯 회사의 평균은 20거래일 동안 ' + won(X.indCh20) + '이 됐어요.'} : null,
    mkt: fin(c.x) ? {t: '시장과 견줌', s: '한 달 동안 시장보다 ' + sgn(c.x) + '만큼 ' + (c.x >= 0 ? '더 갔어요.' : '덜 갔어요.')} : null,
    r5: st ? {t: '닷새 움직임', s: '닷새 동안은 ' + won(st.r5) + '이 됐어요.'} : null,
    fomo: fin(c.fomo) ? {t: '포모지수', s: '포모지수는 ' + c.fomo + '예요. 50이 이 회사의 보통 때이고, 100에 가까울수록 요즘 열흘 값이 뜨거워요.'} : null,
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
    peers: peers && peersUp != null ? {t: '같은 업종 회사', s: '같은 업종 365곳 다섯 회사 가운데 ' + peersUp + '곳이 20거래일 동안 올랐어요.'} : null,
    peerRank: peerRank ? {t: '업종 안 차례', s: '같은 업종 다섯 회사 가운데 20거래일 동안 오른 차례로 ' + peerRank + '번째예요.'} : null,
    /* 전 */
    edge: k === 'hot' || k === 'hotNext' ? (fin(hot7) && fin(c.ch20) ? {t: '일곱째와 견줌', s: '불장 일곱의 일곱째는 20거래일 동안 ' + won(hot7) + '이 됐어요. 이 회사는 ' + won(c.ch20) + '이에요.'} : null)
      : k === 'bloom' ? (fin(w.indX) ? {t: '꽃 선까지', s: '업종이 시장보다 15 넘게 앞서면 꽃 선이에요. 지금 ' + sgn(w.indX) + '만큼이라 ' + (w.indX >= 15 ? '넘었어요.' : n1(15 - w.indX) + '만큼 남았어요.')} : null)
      : k === 'bloomNext' ? (fin(w.x20) ? {t: '싹 선까지', s: '한 달 동안 시장보다 5 넘게 앞서면 싹이 아니라 꽃 자리로 가요. 지금 ' + sgn(w.x20) + '만큼이에요.'} : null)
      : (fin(w.indX) ? {t: '업종 앞섬의 크기', s: '업종이 시장보다 ' + sgn(w.indX) + '만큼 앞서 있어요. 0 아래로 내려가면 이 묶음에서 빠져요.'} : null),
    leave: {t: '빠지는 조건', s: {hot: '업종 평균이 20거래일 동안 내려가 불장 업종이 아니게 되거나, 같은 업종에서 더 많이 오른 회사 둘이 생기면 빠져요.',
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
    past: T?.past?.[k] ? {t: '지난 1년 기록', s: '지난 1년 날마다 이렇게 고른 일곱을 모두 세면 100번에 ' + T.past[k].per100 + '번이 한 달 안에 ' + ({hotNext: '불장 일곱에 들었어요.', moneyNext: '돈이 몰리는 일곱에 들었어요.', bloomNext: '시장보다 15 넘게 앞섰어요.'}[k] ?? '그렇게 됐어요.') + ' 아무 회사는 100번에 ' + T.past[k].base100 + '번이었어요.'}
      : {hot: fin(T?.counts?.hotPool) ? {t: '고른 바탕', s: '불장 업종 ' + T.counts.hotInds + '곳의 회사 ' + T.counts.hotPool + '곳 가운데에서 골랐어요.'} : null,
        bloom: fin(T?.counts?.bloomPool) ? {t: '고른 바탕', s: '크기 위 20 안인 싹 ' + T.counts.bloomPool + '곳 가운데에서 골랐어요. 꽃 선을 넘은 곳은 ' + (T.counts.bloomFull ?? 0) + '곳이에요.'} : null,
        money: {t: '고른 바탕', s: '시장보다 더 오른 업종을 차례로 보며 업종마다 한 곳씩 골랐어요.'}}[k] ?? null,
    sales: co?.grow?.ind && fin(co.grow.ind.rank) && fin(co.grow.ind.n) ? {t: '업종 안 매출 크기', s: co.grow.ind.name + ' 업종 ' + co.grow.ind.n + '곳 가운데 매출 크기는 ' + co.grow.ind.rank + '번째예요.'} : null,
    pbr: fin(co?.pbr) ? {t: '값과 장부', s: '주식 값이 회사 장부 값의 ' + n1(co.pbr) + '배예요.'} : null,
    /* 결 */
    sum: {t: '한 줄 정리', s: josa(c.name, '은') + ' ' + {hot: '업종이 불장이고 그 안에서 많이 올라', hotNext: '불장 업종 안에서 일곱 바로 아래까지 올라와', money: '업종이 시장보다 앞서고 그 안에서 회사 크기가 가장 많이 늘어',
      moneyNext: '돈이 몰리는 일곱 바로 아래 업종에서 회사 크기가 가장 많이 늘어', bloom: '업종은 앞서는데 회사는 아직 덜 간 싹이라', bloomNext: '아직 싹인데 닷새 동안 시장보다 앞서기 시작해'}[k] + ' ' + kn + ' 일곱에 들었어요.'},
    watch: {t: '볼 것 하나', s: {hot: '다음 장에도 업종 평균이 오르는지 보세요.', hotNext: '불장 일곱 안으로 들어오는지 보세요.', money: '회사 크기가 계속 느는지 보세요.',
      moneyNext: '업종이 돈이 몰리는 일곱 안으로 들어오는지 보세요.', bloom: '업종이 시장보다 15 넘게 앞서 꽃 선을 넘는지 보세요.', bloomNext: '닷새 앞섬이 이어져 한 달 앞섬이 5에 가까워지는지 보세요.'}[k]},
    route: KIND_ROUTE[c.kind] ? {t: '우량주에 든 길', s: KIND_ROUTE[c.kind] + ' 우량주 365곳에 들었어요.'} : null,
    op: fm && fin(fm.f.op?.[fm.i]) ? {t: '영업이익', s: fm.y + '년 영업이익은 ' + eok(fm.f.op[fm.i]) + (fin(fm.f.net?.[fm.i]) ? ', 순이익은 ' + eok(fm.f.net[fm.i]) : '') + '이에요.'} : null,
    opTrend: fm && fm.i >= 1 && fin(fm.f.op?.[fm.i - 1]) && fin(fm.f.op?.[fm.i]) ? {t: '이익 흐름', s: '영업이익이 ' + String(fm.f.years[fm.i - 1]).slice(0, 4) + '년 ' + eok(fm.f.op[fm.i - 1]) + '에서 ' + fm.y + '년 ' + eok(fm.f.op[fm.i]) + '으로 ' + (fm.f.op[fm.i] >= fm.f.op[fm.i - 1] ? '늘었어요.' : '줄었어요.')} : null,
    rev: fm && fin(fm.f.rev?.[fm.i]) ? {t: '매출', s: fm.y + '년 매출은 ' + eok(fm.f.rev[fm.i]) + '이에요.'} : null,
    roe: fm && fin(fm.f.roe?.[fm.i]) ? {t: '자기자본이익', s: '자기 돈 100원으로 ' + fm.y + '년에 ' + n1(fm.f.roe[fm.i]) + '원의 이익을 냈어요(자기자본이익).'} : null,
    debt: fm && fin(fm.f.debt?.[fm.i]) ? {t: '빚', s: '빚은 자기 돈 100원에 ' + n1(fm.f.debt[fm.i]) + '원이에요.'} : null,
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
  {id: '기', name: '기 — 지금 모습과 가장 큰 까닭'}, {id: '승', name: '승 — 왜 그렇게 됐나'},
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
  acceleration: (v, s) => '뒤 닷새가 앞 닷새보다 ' + (v >= 0 ? '더 올랐어요' : '덜 올랐어요') + '(차이 ' + n1(Math.abs(100 * v)) + '만큼). 10만 길 가운데 자리는 ' + Math.round(s) + '이에요.',
  upDays: (v, s) => '열흘 가운데 ' + Math.round(v * 10) + '일 올랐어요. 10만 길 가운데 자리는 ' + Math.round(s) + '이에요.',
  maGap: (v, s) => '지금 값이 20일 평균보다 ' + n1(Math.abs(100 * v)) + '만큼 ' + (v >= 0 ? '높아요' : '낮아요') + '. 10만 길 가운데 자리는 ' + Math.round(s) + '이에요.',
  breakout: (v, s) => '직전 60일 가장 높은 값보다 ' + (v >= 0 ? n1(100 * v) + '만큼 위예요' : n1(Math.abs(100 * v)) + '만큼 아래예요') + '. 10만 길 가운데 자리는 ' + Math.round(s) + '이에요.',
  upVariation: (v, s) => '열흘 움직임 가운데 오른 날 몫이 100에 ' + Math.round(100 * v) + '이에요. 10만 길 가운데 자리는 ' + Math.round(s) + '이에요.'};
export function fomo11(F, why) {
  if (!F || F.verdict !== 'pass' || !fin(F.v)) return null;
  const G = Object.fromEntries((F.groups ?? []).map(g => [g.id, g])), FL = Object.fromEntries((why?.feats ?? []).map(f => [f.id, f.label]));
  const top = [...(F.f ?? [])].sort((p, q) => q.score * q.w - p.score * p.w)[0];
  const rows = [
    {t: '포모지수 ' + F.v, s: '지난 1년 이 회사의 하루 움직임을 섞어 만든 열흘 길 ' + num(F.paths) + '개 가운데, 오늘까지 열흘이 얼마나 뜨거운지예요. 50이면 보통, 100에 가까울수록 뜨거워요.'},
    {t: '추세 묶음 ' + Math.round(G.trend?.score ?? NaN), s: '오르는 힘(열흘 상승 · 가속 · 오른 날 비중)을 무게대로 합친 점수예요.'},
    {t: '가격 위치 묶음 ' + Math.round(G.place?.score ?? NaN), s: '값의 자리(20일 평균 이격 · 60일 고점 돌파 · 오른 날 움직임 몫)를 무게대로 합친 점수예요.'},
    ...(F.f ?? []).map(f => ({t: (FL[f.id] ?? f.id) + ' ' + Math.round(f.score), s: FEAT_SAY[f.id] ? FEAT_SAY[f.id](f.act, f.score) : ''})),
    {t: '무게', s: '같은 묶음에서 서로 많이 닮은 잣대는 무게를 줄였어요. 가장 크게 끌어당긴 잣대는 「' + (FL[top?.id] ?? NEED) + '」예요.'},
    {t: '바탕', s: (ymd(F.base?.from) ?? NEED) + '부터 ' + (ymd(F.base?.to) ?? NEED) + '까지 하루 움직임 ' + F.base?.n + '날에서 마구 뽑았어요(' + day(F.asOf) + ' 종가까지). '
      + (fin(F.se) && F.se < 0.1 ? '다시 세어도 값이 0.1보다 적게 흔들려요.' : '다시 세어도 값이 ' + n1(F.se) + ' 안에서 흔들려요.')}];
  return rows.slice(0, 11);
}

/* ═══ 쪽 ═══ */
const box = (cls, title, kids) => h('section', {class: 'yw-box ' + cls, 'aria-label': title}, h('h2', {class: 'yw-h', text: title}), ...kids);
// 제목 · 문장 · 표 사이에 띄어쓰기 글(화면에는 안 보임 — 칸이 grid) — 글을 이어 읽을 때 「크기」+「회사」가 「기회」처럼 붙지 않게(쓰지 않을 말 셈)
const li = (n, t, s, extra = null) => h('li', {class: 'yw-li'}, h('span', {class: 'yw-n', 'aria-hidden': 'true', text: String(n)}), ' ', h('div', {class: 'yw-tx'}, h('b', {class: 'yw-t', text: t}), ' ', h('p', {class: 'yw-s', text: s}), ' ', extra));
const okMark = ok => h('span', {class: 'yw-ok ' + (ok ? 'yw-pass' : 'yw-no'), text: ok ? '맞음' : '아직'});
function ensureCss() { if (typeof document !== 'undefined' && !document.querySelector(`link[href="${CSS}"]`)) document.head.append(Object.assign(document.createElement('link'), {rel: 'stylesheet', href: CSS})); }

export async function vWhy(X, code, k) {
  ensureCss();
  const get = X.get;
  const [T, Tn, W, co, M, b] = await Promise.all([load21(get), get('/su/data/su21-next.json').catch(() => null), get('/su/data/su21-why.json').catch(() => null),
    get('/atlas/data/co/' + code + '.json').catch(() => null), get('/su/data/su21-map.json').catch(() => null), X.base().catch(() => ({}))]);
  const nx = k.endsWith('Next'), src = nx ? (Tn?.lists?.[k] ?? T?.lists?.[k]) : T?.lists?.[k];
  const c = (src ?? []).find(x => x.code === code);
  if (!c) return X.notFound('이 회사는 오늘 그 묶음에 없어요. 첫 페이지에서 다시 골라 주세요.');
  if (X.setCur) X.setCur({code, name: c.name, ind: c.ind});
  const indRow = (M?.lands ?? []).flatMap(l => l.inds ?? []).find(i => i.name === c.ind);
  const peers = indRow?.cos ?? null, st = closeStats(c);
  const fo = W && W.board === T?.asOf?.board ? W.fomo?.[code] ?? null : null; // 같은 판 날의 포모 자료만
  const X2 = {T, c, k, co, peers, st, fo, indCh20: fin(indRow?.ch20) ? indRow.ch20 : null};
  const C7 = crit7(T, c, k), P = why36(X2), F11 = fomo11(fo, W);
  const head = h('section', {class: 'yw-sum', 'aria-label': '첫 발견 · 며칠째 · 포모지수'},
    h('p', {class: 'yw-chip'}, h('span', {text: '첫 발견'}), h('b', {text: fin(c.days) ? day(c.found) : NEED})),
    h('p', {class: 'yw-chip'}, h('span', {text: '며칠째'}), h('b', {text: fin(c.days) ? c.days + '일째' : NEED})),
    h('p', {class: 'yw-chip'}, h('span', {text: '포모지수'}), h('b', {text: fin(c.fomo) ? String(c.fomo) : '보류'})));
  const crit = box('yw-crit', '이렇게 고른 기준 일곱 가지', [h('ol', {class: 'yw-ol'}, C7.map((x, j) => li(j + 1, x.t, x.s, okMark(x.ok))))]);
  const parts = P.map(p => box('yw-part', p.name, [h('ol', {class: 'yw-ol', start: String(p.items[0]?.n ?? 1)}, p.items.map(it => li(it.n, it.t, it.s)))]));
  const fomoBox = box('yw-fomo', fin(c.fomo) ? '포모지수 ' + c.fomo + ' — 왜 이 값이 나왔나요?' : '포모지수 — 보류',
    [h('h3', {class: 'yw-h3', text: '기준 일곱 가지(소거법)'}),
      h('ol', {class: 'yw-ol'}, (W?.checks ?? []).map((x, j) => { const r = fo?.checks?.find(y => y.id === x.id); return li(j + 1, x.label + ' — ' + x.rule, x.why + '.', okMark(r?.verdict === 'pass')); })),
      F11 ? h('h3', {class: 'yw-h3', text: '이 값이 나온 까닭 열한 가지'}) : null,
      F11 ? h('ol', {class: 'yw-ol'}, F11.map((x, j) => li(j + 1, x.t, x.s))) : h('p', {class: 'yw-s', text: fo ? '기준 「' + ((W?.checks ?? []).find(x => x.id === fo.first)?.label ?? NEED) + '」에서 걸려 값을 보여 드리지 않아요.' : '포모 자료가 오늘 판과 날이 달라 값을 보여 드리지 않아요.'})]);
  const go = h('nav', {class: 'yw-go', 'aria-label': '다음에 볼 곳'},
    h('a', {class: 'su-ask', href: '#/c/' + code}, h('b', {text: '이 회사 쪽 보기'}), h('span', {text: '한 달 꺾은선과 업종을 봐요.'})),
    h('a', {class: 'su-ask', href: '#/q/' + code}, h('b', {text: '사기 전에 한 번 멈춰요'}), h('span', {text: '「왜 사?」 열한 질문으로 내 이유부터 확인해요.'})));
  const hero = h('div', {class: 'su-hero yw', 'data-g': 'su-why36', 'data-k': k, 'data-code': code, 'data-n': String(P.reduce((a, p) => a + p.items.length, 0)), 'data-fomo': fin(c.fomo) ? String(c.fomo) : ''},
    head, crit, ...parts, fomoBox, go);
  const pro = fo && F11 ? [h('section', {class: 'su-why', 'aria-label': '포모 셈 자세히'}, h('h2', {class: 'su-ft', text: '포모 셈 자세히'}),
    h('p', {class: 'su-lead', text: '옛 아틀라스 포모 열여덟 가지 가운데 종가로 셀 수 있는 「가격 열기」 여섯 가지로 셈해요. 길 ' + num(fo.paths) + '개 · 흔들림 ' + n1(fo.se) + ' · 바탕 ' + fo.base?.n + '날 · 같은 날 같은 회사는 늘 같은 값이에요.'}))] : [];
  return {title: c.name + ' · 왜?', tab: 0, h1: c.name + ', 왜 ' + ASK[k] + '?', proper: false, hero, body: pro,
    next: {href: '#/c/' + code, label: '이 회사 한 달 값은?'}, asOf: T?.asOf?.board, S: b?.S ?? null};
}
