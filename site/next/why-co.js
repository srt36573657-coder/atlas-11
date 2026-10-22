/* 테마 시계 회사 15쪽 「왜 그럴까?」 열한 걸음의 글 — 사장님 2026-10-22(서울) 08:53 「… 원숭이 엉덩이는 빨개 빨가면 사과 사과는 맛있어 맛있으면 바나나 바나나는 길어
   이런 식으로 11단계는 논리적으로 사방팔방으로 이야기 해야지 그 이야기를 움직이는 도식화로 해야 하고」(명령문 docs/design/total-2026-10-22/order-0853.txt · 그림은 why-chain.js · 첫 화면 꼴은 why-steps.js)
   앞 걸음의 끝말이 다음 물음이 됨(「앞 닷새에 몰렸어요」 → 「앞 닷새에 몰렸으면 업종보다 먼저였을까?」)
   사방팔방 = 회사 → 지난날(언제 몰렸나) → 업종(먼저였나 · 안에서 몇 번째 · 업종 전체) → 테마 시계 자리 → 큰 회사 → 오른 회사 수 → 이웃 업종 → 뉴스 → 나(왜 사?)
   모든 걸음은 그 쪽이 이미 받은 자료(theme.json · theme-more.json)로 센 지난 사실만 — 못 받은 값은 「? …」 · 앞날 · 사고팔기 권함 · 「1등」 없음
   화면(DOM)을 만지지 않음 · 브라우저 모듈을 부르지 않음(노드 시험 tests/atlas11/theme.test.mjs 「15쪽 열한 걸음」) */
import {ZONES, pp} from './theme-rule.js';
import {josa} from './brand.js';

export const CO_TAGS = Object.freeze(['회사', '지난날', '업종', '테마 시계', '큰 회사', '이웃 업종', '뉴스', '나']);
const fin = Number.isFinite;
const num = n => (fin(n) ? Math.round(n).toLocaleString('ko-KR') : '?');
const enc = s => encodeURIComponent(s);

/** {c 회사 줄(theme-more top · big) · ind 업종 이름 · I 업종(theme.json inds) · M 업종 더(theme-more inds[ind]) · inds 모든 업종(이웃 셈)} → 걸음 열하나(why-chain.js 꼴) */
export function coSteps({c, ind, I = null, M = null, inds = []} = {}) {
  const S = [], name = c?.n ?? '?', code = c?.c ?? '';
  // 1 회사 — 열흘
  S.push({a: fin(c?.d10) ? `${josa(name, '는')} 열흘 동안 ${pp(c.d10)}%예요` : `? ${name} 열흘 값을 못 받았어요`, tag: '회사'});
  // 2 지난날 — 앞 닷새 · 뒤 닷새 가운데 어디에 몰렸나(14쪽 · 15쪽 옛 1번과 같은 셈)
  const has5 = fin(c?.a5) && fin(c?.b5), late = has5 && c.b5 >= c.a5, when = late ? '최근 닷새' : '앞 닷새';
  S.push({q: '그 열흘 가운데 언제 몰렸을까?', a: has5 ? `${when}에 몰렸어요 · 앞 닷새 ${pp(c.a5)}% · 뒤 닷새 ${pp(c.b5)}%` : '? 닷새씩 못 견줬어요', tag: '지난날'});
  // 3 업종 — 먼저였나 뒤따랐나(14쪽 lead 셈 그대로 · 업종보다 더 오른 때가 앞 닷새면 먼저)
  const lead = has5 && I && fin(I.A5) && fin(I.B5) ? (c.a5 - I.A5) > (c.b5 - I.B5) : null;
  S.push({q: has5 ? `${when}에 몰렸으면 업종보다 먼저였을까?` : '업종보다 먼저였을까?', a: lead == null ? '? 아직 못 견줬어요' : lead ? '업종보다 먼저 움직였어요' : '업종을 뒤따라 움직였어요', tag: '업종', href: code ? '#/t/c/' + enc(code) + '/lead' : ''});
  // 4 업종 안 자리 — 열흘 값 차례(오른 순위 자랑이 아니라 자리 · 「1등」 말 없음)
  const rank = fin(c?.rank) && c.rank > 0 ? c.rank : null, ranked = fin(M?.ranked) ? M.ranked : null;
  S.push({q: lead == null ? '업종 안에서는 몇 번째일까?' : lead ? '먼저 움직였으면 업종 안에서는 몇 번째일까?' : '뒤따랐으면 업종 안에서는 몇 번째일까?',
    a: rank && ranked ? `열흘 값으로 ${num(ranked)}곳 가운데 ${num(rank)}번째예요` : '업종에서 몸값이 큰 회사예요', tag: '업종', href: code ? '#/t/c/' + enc(code) + '/rank' : ''});
  // 5 업종 전체 — 열흘
  S.push({q: rank && ranked ? `${num(ranked)}곳 가운데 ${num(rank)}번째면 업종 전체는?` : '몸값이 큰 회사면 업종 전체는?', a: fin(I?.m10) ? `${ind} · 업종 열흘 ${pp(I.m10)}%` : '? 업종 값을 못 받았어요', tag: '업종'});
  // 6 테마 시계 자리 — 자리 · 점 수(누르면 그 업종 쪽)
  const zn = I?.z && ZONES[I.z] ? ZONES[I.z] : null;
  S.push({q: fin(I?.m10) ? `업종이 열흘 ${pp(I.m10)}%면 테마 시계 어디일까?` : '그 업종은 테마 시계 어디일까?', a: zn && fin(I?.sc) ? `${zn} 자리 · 점 넷 가운데 ${num(I.sc)}개` : '? 테마 시계 자료를 못 받았어요', tag: '테마 시계', href: ind ? '#/t/i/' + enc(ind) : ''});
  // 7 큰 회사 — 이 회사가 아닌 가장 큰 회사의 열흘(없으면 큰 회사 셋 평균)
  const big = (M?.big ?? []).find(b => b && b.c !== code && fin(b.d10));
  const bigA = big ? `${big.n} · 열흘 동안 ${pp(big.d10)}%` : fin(I?.bigAvg) ? `가장 큰 회사 셋 평균 ${pp(I.bigAvg)}%` : '? 큰 회사 값을 못 받았어요';
  const bigV = big ? big.d10 : fin(I?.bigAvg) ? I.bigAvg : null;
  S.push({q: '그 자리에서 큰 회사도 움직였을까?', a: bigA, tag: '큰 회사', href: ind ? '#/t/i/' + enc(ind) + '/big' : ''});
  // 8 오른 회사 수 — 열흘 전보다 2% 넘게 오른 회사(번지는 중일까 쪽)
  const spread = fin(I?.tot) && fin(I?.up) && I.tot > 0;
  S.push({q: fin(bigV) ? `큰 회사가 ${pp(bigV)}%면 다른 회사들은?` : '다른 회사들도 올랐을까?', a: spread ? `${num(I.tot)}곳 가운데 ${num(I.up)}곳이 2% 넘게 올랐어요` : '? 업종 값을 못 받았어요', tag: '업종', href: ind ? '#/t/i/' + enc(ind) + '/spread' : ''});
  // 9 이웃 업종 — 같은 무리 업종 가운데 싹 · 꽃 자리 수
  const same = I?.g ? (Array.isArray(inds) ? inds : []).filter(o => o && o.g === I.g && o.n !== ind) : [];
  const live = same.filter(o => o.z === 'S' || o.z === 'B').length;
  S.push({q: spread ? `${num(I.up)}곳이 2% 넘게 올랐으면 이웃 업종은?` : '이웃 업종은?', a: same.length ? `같은 무리 업종 ${num(same.length)}곳 가운데 싹이나 꽃 자리가 ${num(live)}곳이에요` : '? 같은 무리 업종이 없어요', tag: '이웃 업종', href: ind && same.length ? '#/t/i/' + enc(ind) + '/near' : ''});
  // 10 뉴스 — 숫자 밖의 까닭은 모름(앵무새는 들은 것만)
  S.push({q: '그럼 왜 움직였는지 뉴스는?', a: '뉴스는 아직 확인 전이에요 · 꼭 확인해요', tag: '뉴스'});
  // 11 나 — 사기 전에 한 번 멈춤(본질 2 ①)
  S.push({q: '뉴스를 아직 모르면 나는?', a: '이 회사로 왜 사? · 열한 질문으로 내 이유부터', tag: '나', href: code ? '#/why/' + enc(code) : '#/why'});
  return S;
}
