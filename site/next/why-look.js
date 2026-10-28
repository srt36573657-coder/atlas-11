/* 「왜 사?」 그림 판 글 · 그림 — 사장님 2026-10-27(서울) 22:09 「지금까지 너가 만든거 이 시안을 토대로 만들어줘」 · 22:16 「이시안 화법으로만들어줘」
   그림 일곱 화면(시작 · 질문 · 구체 질문 · 결과 요약 · 상세 분석 · 맞춤 길잡이 · 마음 체크)의 말투 — 질문 · 답 · 격언(사장님 글)은 p-why.js QS 그대로 두고 풀이 글만 여기
   lead = 질문을 한 문장으로 · why = 「왜 이런 질문을 하나요?」 · sub = 답마다 작은 풀이 · ic = 답 그림 · act = 이 답이면 길잡이에 올릴 일(빨강 · 노랑)
   막는 말(words.js SCREEN · 매수 · 매도 · 추천 · 기회 …)을 쓰지 않음 · 사고팔기를 권하지 않음 · 앞날을 맞히지 않음 */
import {NAME, josa} from './brand.js'; // 이름 한 곳(규칙 76)
export const LOOK = Object.freeze([ // 2026-10-28 10:11 「어 그렇게 해」(docs/design/why-mock-2026-10-28/order-1011.txt) — 그림 말투 그대로(큰 질문 · 회색 안내 · 괄호 풀이 · 「매수」는 이 칸에서만)
  {lead: '이번에 매수하려는 이유는 무엇인가요?', why: '남의 말로 산 주식은 남의 말에 흔들리기 쉬워요. 내 이유가 있는지 확인해요.',
    sub: ['(주변에서 좋다고 들음)', '(뉴스나 영상을 봄)', '(실적을 직접 살펴봄)'], ic: ['chat', 'news', 'search'],
    act: ['매수 이유를 한 줄로 적어 보기', '이유를 적어 두면 흔들릴 때 다시 볼 수 있어요.']},
  {lead: '매수하려는 회사를 얼마나 공부했나요?', why: '아는 만큼 덜 무서워요. 떨어질 때 버틸 힘이 돼요.',
    sub: ['(버는 법까지 앎)', '(이름과 하는 일만 앎)', '(아직 잘 모름)'], ic: ['book', 'book', 'ask'],
    act: ['무엇으로 돈을 버는지 알아보기', '파는 것 하나만 알아도 떨어질 때 덜 무서워요.']},
  {lead: '이 회사의 어떤 점이 좋아 보이나요?', hint: '큰 일이 기다려진다면 그 날짜도 함께 적어요.', why: '느낌과 이유를 나눠 봐요. 이유가 있어야 오래 볼 수 있어요.',
    sub: ['(버는 돈이 해마다 늚)', '(곧 큰 일이 있음)', '(이유 없이 느낌이 옴)'], ic: ['coin', 'cal', 'cloud'],
    act: ['느낌 말고 이유 하나 찾기', '실적이나 하는 일에서 이유 하나를 찾아봐요.']},
  {lead: '이번 매수에 내 돈을 얼마나 넣을 생각인가요?', hint: '모은 돈 가운데 얼마인지 떠올려 보세요.', why: '틀려도 다시 일어설 수 있는 만큼만 넣어야 마음이 편해요.',
    sub: ['(모은 돈의 작은 몫)', '(모은 돈의 절반쯤)', '(거의 다 또는 빌린 돈)'], ic: ['pie', 'pie', 'warn'],
    act: ['투자 비중 줄이기', '틀려도 괜찮은 만큼만 넣으면 밤에 잠이 와요.']},
  {lead: '요즘 이 종목의 값은 어떻게 움직이나요?', why: '모두가 떠들 때 사면 비싸게 살 수 있어요. 지금 흐름을 봐요.',
    sub: ['(천천히 꾸준히 오름)', '(요즘 내려가는 중)', '(모두 떠들며 크게 오름)'], ic: ['up', 'down', 'fire'],
    act: ['흐름이 멈추는지 지켜보기', '크게 움직일 때는 하루 이틀 지켜본 뒤에 정해요.']},
  {lead: '매수하려는 지금, 값이 이미 얼마나 올랐나요?', why: '많이 오른 뒤에는 내려갈 길도 길어요.',
    sub: ['(아직 덜 오름)', '(조금 오름)', '(벌써 두 배 가까이)'], ic: ['flat', 'up', 'up'],
    act: ['어디까지 볼지 정하기', '이미 오른 만큼 어디까지 지켜볼지 숫자로 정해요.']},
  {lead: '값이 떨어지면 어디서 팔지 정했나요?', why: '사기 전에 팔 곳을 정해 두면 흔들릴 때 덜 무서워요.',
    sub: ['(숫자로 정해 둠)', '(머릿속으로만 생각)', '(아직 안 정함)'], ic: ['flag', 'think', 'ask'],
    act: ['팔 곳을 숫자로 적기', '떨어질 때 팔 값을 숫자로 적어 두면 덜 흔들려요.']},
  {lead: '값이 오르면 어디서 나눠 팔지 정했나요?', why: '오를 때 욕심이 커져요. 미리 정한 숫자가 마음을 잡아 줘요.',
    sub: ['(나눠 팔 값을 정함)', '(아직 생각 안 해 봄)', '(끝까지 들고 감)'], ic: ['flag', 'ask', 'go'],
    act: ['나눠 팔 값 정하기', '오를 때 절반을 나눌 값을 미리 정해 둬요.']},
  {lead: '이번에 넣을 돈은 언제 쓸 돈인가요?', hint: '쓸 날이 가까운 돈인지 생각해 보세요.', why: '곧 쓸 돈은 값이 내려도 기다릴 수 없어요.',
    sub: ['(1년 넘게 둬도 됨)', '(몇 달 안에 쓸 수도)', '(곧 써야 하는 돈)'], ic: ['clock', 'clock', 'warn'],
    act: ['곧 쓸 돈은 빼 두기', '곧 쓸 돈은 주식 밖에 두면 마음이 편해요.']},
  {lead: '지금 매수하려는 마음은 어떤가요?', why: '급한 마음이 가장 비싼 값을 치르게 해요. 지금 마음은 충동 매매를 알아보는 데 중요한 요소예요.',
    sub: ['(서두르지 않고 차분)', '(놓칠까 봐 급함)', '(잃은 돈을 되찾고 싶음)'], ic: ['calm', 'bolt', 'loop'],
    act: ['하루 쉬고 다시 보기', '급한 마음이 가라앉은 뒤에 다시 정해요.']},
  {lead: '투자금을 여러 종목으로 나눠 넣고 있나요?', hint: '종목 수뿐 아니라 업종 분산까지 고려해서 답해 주세요.', why: '분산 투자는 위험을 줄이는 중요한 방법이에요. 하나가 넘어져도 다른 곳이 버텨 줘요.',
    sub: ['(서로 다른 업종에 분산 투자)', '(업종이 다르거나 비슷할 수 있음)', '(거의 한 종목에 집중 투자)'], ic: ['b3', 'b2', 'b1'],
    act: ['분산 투자 비율 늘리기', '한 업종에 집중된 비중을 줄여보세요.']},
]);
/** 길잡이가 셋이 안 될 때 채우는 일(그림 6 「지금 나에게 필요한 3가지」 — 그림 글 그대로) */
export const ACT_MORE = Object.freeze([
  ['매수 전 체크리스트 사용하기', '감정이 아닌 기준으로 매수할 수 있어요.'],
  ['분산 투자 비율 늘리기', '한 업종에 집중된 비중을 줄여보세요.'],
  ['투자 일지 작성하기', '매매 이유와 감정을 기록하면 패턴을 파악할 수 있어요.'],
]);
/** 마음 상태 넷(그림 7 「감정 상태 체크」) — 이 기기에만 남김 */
export const MOODS = Object.freeze([['calm', '안정'], ['soso', '보통'], ['worry', '불안'], ['rush', '초조']]);
/** 결과 요약(그림 4 「당신은 / ○○ 투자자예요」 · 따옴표 한 줄) — 판정(go · wait · rest)마다 · 단정(order-1011 5) */
export const TYPE_OF = Object.freeze({
  go: Object.freeze({name: '신중한 준비형 투자자', q: '내 이유로 따져 보고, 정해 둔 대로 움직이는 편이에요.'}),
  wait: Object.freeze({name: '반쯤 준비된 투자자', q: '이유는 있지만, 가끔 마음이 앞설 때가 있어요.'}),
  rest: Object.freeze({name: '오늘은 쉬어 갈 투자자', q: '준비가 덜 된 곳이 많아요. 오늘은 하루 쉬어 가요.', stopQ: '빌린 돈이나 곧 쓸 돈이라면, 오늘은 쉬어 가는 게 좋아요.'}),
});
/** 10번 「마음은?」 답 → 현재 심리 상태(그림 4) */
export const MIND_OF = Object.freeze([['안정', '서두르지 않아 좋은 값을 기다릴 수 있어요.'], ['초조', '놓칠까 급한 마음이 커요. 숨을 고르고 봐요.'], ['불안', '잃은 돈 생각이 판단을 흐릴 수 있어요.']]);

const P = {
  chat: 'M4 5h16v11H11l-5 4v-4H4z', news: 'M4 5h13v14H6a2 2 0 0 1-2-2zM17 9h3v8a2 2 0 0 1-2 2M7 9h7M7 12h7M7 15h4', search: 'M10.5 4a6.5 6.5 0 1 1 0 13a6.5 6.5 0 0 1 0-13zM15.5 15.5L20 20',
  book: 'M4 5h7a2 2 0 0 1 2 2v12a2 2 0 0 0-2-2H4zM20 5h-5a2 2 0 0 0-2 2v12a2 2 0 0 1 2-2h5z', ask: 'M12 21a9 9 0 1 1 0-18a9 9 0 0 1 0 18zM9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.6.3-1 .9-1 1.6v.6M12 17h.01',
  coin: 'M12 21a9 9 0 1 1 0-18a9 9 0 0 1 0 18zM12 7v10M9.5 9.5h4a1.5 1.5 0 0 1 0 3h-3a1.5 1.5 0 0 0 0 3h4', cal: 'M4 6h16v14H4zM4 10h16M8 3v4M16 3v4M8 14h3',
  cloud: 'M7 18a4 4 0 0 1-.5-8a6 6 0 0 1 11.5 1.5a3.5 3.5 0 0 1-.5 6.5z', pie: 'M12 3v9h9a9 9 0 1 1-9-9zM15 3.5a9 9 0 0 1 5.5 5.5H15z', warn: 'M12 4l9 16H3zM12 10v4M12 17h.01',
  up: 'M4 17l6-6 4 4 6-7M15 8h5v5', down: 'M4 7l6 6 4-4 6 7M15 16h5v-5', fire: 'M12 21c-4 0-6-3-6-6c0-4 4-6 4-10c3 2 4 4 4 6c1-1 1.5-2 1.5-3c2 2 2.5 4.5 2.5 7c0 3-2 6-6 6z',
  flat: 'M4 14h16M4 10h16', flag: 'M6 21V4M6 4h11l-2 4l2 4H6', think: 'M12 4a6 6 0 0 1 6 6c0 2.5-1.5 4-3 5v2H9v-2c-1.5-1-3-2.5-3-5a6 6 0 0 1 6-6zM10 20h4',
  go: 'M4 12h14M13 6l6 6-6 6', clock: 'M12 21a9 9 0 1 1 0-18a9 9 0 0 1 0 18zM12 7v5l3 2', calm: 'M12 21a9 9 0 1 1 0-18a9 9 0 0 1 0 18zM8.5 14.5c1 1.2 2.2 1.8 3.5 1.8s2.5-.6 3.5-1.8M9 10h.01M15 10h.01',
  bolt: 'M13 3L5 14h6l-1 7 8-11h-6z', loop: 'M5 12a7 7 0 0 1 12-5l2 2M19 4v5h-5M19 12a7 7 0 0 1-12 5l-2-2M5 20v-5h5',
  b3: 'M3 10h18l-2 9H5zM7 10l3-5M17 10l-3-5M8 14h.01M12 14h.01M16 14h.01', b2: 'M3 10h18l-2 9H5zM7 10l3-5M17 10l-3-5M9 14h.01M15 14h.01', b1: 'M3 10h18l-2 9H5zM7 10l3-5M17 10l-3-5M12 14h.01',
  check: 'M5 12l5 5 9-10', heart: 'M12 20s-7-4.5-7-10a4 4 0 0 1 7-2.5A4 4 0 0 1 19 10c0 5.5-7 10-7 10z', note: 'M6 3h9l4 4v14H6zM9 12h7M9 16h5', grow: 'M4 20h16M7 16v-4M12 16V8M17 16v-7',
  soso: 'M12 21a9 9 0 1 1 0-18a9 9 0 0 1 0 18zM8.5 15h7M9 10h.01M15 10h.01', worry: 'M12 21a9 9 0 1 1 0-18a9 9 0 0 1 0 18zM8.5 16c1-1.2 2.2-1.8 3.5-1.8s2.5.6 3.5 1.8M9 10h.01M15 10h.01',
  rush: 'M12 21a9 9 0 1 1 0-18a9 9 0 0 1 0 18zM8.5 16.5c1-1 2.2-1.5 3.5-1.5s2.5.5 3.5 1.5M8 9l2 1M16 9l-2 1',
  // 2026-10-28 그림 일곱 장 360가지 분석 뒤 더한 그림 — 뒤로 · 전구 · 뇌 · 막대 · 엄지 · 체크 판 · 메모 · 보내기
  back: 'M15 5l-7 7 7 7', bulb: 'M9 18h6M10 21h4M12 3a6 6 0 0 1 3.5 10.9c-.6.5-1 1.2-1 2.1h-5c0-.9-.4-1.6-1-2.1A6 6 0 0 1 12 3z',
  brain: 'M9 4a3 3 0 0 0-3 3a3 3 0 0 0-2 5a3 3 0 0 0 2 5a3 3 0 0 0 3 3a3 3 0 0 0 3-3V7a3 3 0 0 0-3-3zM15 4a3 3 0 0 1 3 3a3 3 0 0 1 2 5a3 3 0 0 1-2 5a3 3 0 0 1-3 3a3 3 0 0 1-3-3M9 9h1M14 12h1',
  bars: 'M5 20v-6M10 20V10M15 20v-8M20 20V6', thumb: 'M7 11v9H4v-9zM7 11l4-7a2 2 0 0 1 3 2l-1 4h5a2 2 0 0 1 2 2.3l-1.2 6A2 2 0 0 1 16.8 20H7',
  clip: 'M9 3h6v3H9zM7 5H5v16h14V5h-2M8.5 13.5l2.5 2.5 4.5-5', memo: 'M6 3h12v18H6zM9 8h6M9 12h6M9 16h4', send: 'M4 12l16-8-6 16-2-7z', down2: 'M12 4v11M7 10l5 5 5-5M5 20h14', share: 'M8.5 10.5l7-4M8.5 13.5l7 4M18 5a2 2 0 1 1 0 .01M6 12a2 2 0 1 1 0 .01M18 19a2 2 0 1 1 0 .01',
};
/** 채운 얼굴(그림 7 「감정 상태 체크」) — 동그라미 색 · 눈과 입은 짙은 선 */
const FACE = {calm: ['#A1DEBF', 'M8.5 14.5c1 1.2 2.2 1.8 3.5 1.8s2.5-.6 3.5-1.8'], soso: ['#FBC85D', 'M8.5 15h7'], worry: ['#F8AB7E', 'M8.5 16c1-1.2 2.2-1.8 3.5-1.8s2.5.6 3.5 1.8'], rush: ['#FCA9A8', 'M8.5 16.5c1-1 2.2-1.5 3.5-1.5s2.5.5 3.5 1.5M8 8.5l2 1M16 8.5l-2 1']};
export function faceIcon(k, size = 36) {
  const ns = 'http://www.w3.org/2000/svg', s = document.createElementNS(ns, 'svg'), [fill, mouth] = FACE[k] ?? FACE.soso;
  s.setAttribute('viewBox', '0 0 24 24'); s.setAttribute('width', String(size)); s.setAttribute('height', String(size)); s.setAttribute('aria-hidden', 'true'); s.setAttribute('class', 'wl-face');
  const c = document.createElementNS(ns, 'circle'); c.setAttribute('cx', '12'); c.setAttribute('cy', '12'); c.setAttribute('r', '10'); c.setAttribute('fill', fill); s.append(c);
  const p = document.createElementNS(ns, 'path'); p.setAttribute('d', mouth + 'M9 10.5h.01M15 10.5h.01'); p.setAttribute('fill', 'none'); p.setAttribute('stroke', '#3A2E2A');
  p.setAttribute('stroke-width', '1.8'); p.setAttribute('stroke-linecap', 'round'); p.setAttribute('stroke-linejoin', 'round'); s.append(p); return s;
}
/** 장면 그림(그림 1 시작 · 그림 4 결과) — 뒤 화면 · 차트 · 나무 그림자(평면) + 둘이 + 앞 책상 · 태블릿 · 커피(시작만) · 글 없음 */
const SCENE_BG = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 190" preserveAspectRatio="xMidYMax slice"><g fill="#1A4442"><circle cx="40" cy="150" r="46"/><circle cx="92" cy="166" r="34"/><circle cx="280" cy="146" r="50"/><circle cx="232" cy="170" r="30"/></g><rect x="16" y="54" width="70" height="56" rx="8" fill="#1F4C4A" stroke="#2F6B65" stroke-width="2"/><path d="M28 98V82M40 98V74M52 98V86" stroke="#5FD3B0" stroke-width="5" stroke-linecap="round"/><circle cx="68" cy="70" r="6" fill="#5FD3B0" opacity=".7"/><rect x="236" y="30" width="72" height="58" rx="8" fill="#1F4C4A" stroke="#2F6B65" stroke-width="2"/><path d="M246 76l14-14 10 8 16-20" fill="none" stroke="#5FD3B0" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/><path d="M280 50h7v7" fill="none" stroke="#5FD3B0" stroke-width="3" stroke-linecap="round"/></svg>';
const SCENE_FG = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 70" preserveAspectRatio="xMidYMax meet"><rect x="18" y="38" width="284" height="18" rx="9" fill="#D6AF98"/><rect x="30" y="54" width="260" height="10" rx="5" fill="#B88F78"/><g><rect x="58" y="6" width="34" height="34" rx="6" fill="#F4EDE4"/><rect x="62" y="8" width="26" height="6" rx="3" fill="#6B4A3A"/><path d="M92 14h6a6 6 0 0 1 0 12h-6" fill="none" stroke="#F4EDE4" stroke-width="4"/></g><g transform="rotate(-8 218 22)"><rect x="176" y="-6" width="84" height="56" rx="8" fill="#22302F"/><rect x="182" y="0" width="72" height="44" rx="5" fill="#2B3B3A"/><path d="M190 34l14-12 10 7 18-18" fill="none" stroke="#5FD3B0" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M226 11h7v7" fill="none" stroke="#5FD3B0" stroke-width="3.5" stroke-linecap="round"/></g></svg>';
const svgNode = str => document.importNode(new DOMParser().parseFromString(str, 'image/svg+xml').documentElement, true);
export function sceneNodes(res = false) {
  const bg = svgNode(SCENE_BG); bg.setAttribute('class', 'wy-scbg'); bg.setAttribute('aria-hidden', 'true');
  if (res) return [bg];
  const fg = svgNode(SCENE_FG); fg.setAttribute('class', 'wy-scfg'); fg.setAttribute('aria-hidden', 'true');
  return [bg, fg];
}
/** 그림 하나(선 그림 · 글자 없음 · 읽는 글 없음) */
export function lookIcon(k, size = 24) {
  const ns = 'http://www.w3.org/2000/svg', s = document.createElementNS(ns, 'svg');
  s.setAttribute('viewBox', '0 0 24 24'); s.setAttribute('width', String(size)); s.setAttribute('height', String(size)); s.setAttribute('aria-hidden', 'true'); s.setAttribute('class', 'wl-ic');
  const p = document.createElementNS(ns, 'path'); p.setAttribute('d', P[k] ?? P.ask); p.setAttribute('fill', 'none'); p.setAttribute('stroke', 'currentColor');
  p.setAttribute('stroke-width', '1.8'); p.setAttribute('stroke-linecap', 'round'); p.setAttribute('stroke-linejoin', 'round');
  s.append(p); return s;
}
