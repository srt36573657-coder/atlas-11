/* 첫 화면 본질 세 줄(사장님 2026-10-18(싱가포르) 16:39 「진화가 본질인 명령문」 [5] 1 ~ 8 · 원문 docs/design/kkolttori-2026-10-18/order-1639.txt · 일꾼 KC · 이름은 이 파일에 없음 — 부르는 쪽이 brand.js 에서)
   [5] 2 세 줄은 사장님 글자 그대로(ESSENCE) · [5] 3 「n과 받은 때는 자료에서 셈하라. 손으로 박지 마라. 바뀌면 거짓이 된다.」
   다른 파일을 부르지 않음 · 화면(DOM)을 만지지 않음 — 첫 화면(app.js essenceBox) · 올릴 때 셈(scripts/atlas11/next/build_data.mjs) ·
   본질 문(scripts/atlas11/next/essence_check.mjs ② · 일꾼 KA) · 검사(next_check.mjs)가 같이 부름

   쓰는 법
     import {ESSENCE, essenceData, essenceLines} from '/next/essence.js';        (노드: '../../../site/next/essence.js')
     const d = essenceData({mkt, summary, now});   // {n, at, old} — mkt 는 있으면 씀(첫 화면은 mkt 를 받지 않아 요약만 — [9] 7)
     essenceLines(d)                                // [줄1, 줄2, 줄3] = 첫 화면 #view > section.ess 의 [data-ess="1"] · [data-ess="2"] · [data-ess="3"] 글(textContent) 그대로
     essenceProblems({mkt, summary})                // 요약의 회사 수 · 받은 때 꼴이 자료와 맞나(빈 줄 = 맞음)
     fourADay(summary)                              // 「하루 4번」 글을 써도 되나([5] 4 — 요약의 fourADay 가 true 일 때만)

   셈(바꾸면 화면 · 요약 · 본질 문이 함께 바뀜)
     n  = /atlas/data/mkt.json 의 companies 칸 수 — 코스피 · 코스닥 보통주(규칙 61 · 우선주 · 스팩 · 리츠 · 펀드 뺌) · 회사마다 쪽(co/<번호>.json)과 지난 종가가 있음
          (지난 한 달 선이 빈 새 상장 회사도 셈 — 그 회사 쪽에 상장 뒤 종가가 있음) · mkt.n 이 있는데 칸 수와 다르면 모름(null → 「?」)
          mkt 없이 부르면 요약(/next/data/home-summary.json)의 coN — 올릴 때 build_data.mjs 가 같은 coCount 로 넣음
     at = 요약의 fetchedAt(ISO · UTC) — 올릴 때 build_data.mjs 가 「이 자료를 만든 업데이트 기록」의 받은 때를 넣음
          (reports/atlas11/t365/updates/<받은 때>.json 가운데 served rolled · 네이버 일봉을 받음(fetch.ok > 0) · 실패 아님 · at = 자료 home.json 의 made)
          못 찾으면 null → 「?」 · 보일 때는 서울 시각 「10월 18일 16시」 · now 보다 OLD_HOURS(72시간) 넘게 지났으면 앞에 「? 」([2] 5 ⑦ 오래된 날짜에 「?」)
     fourADay = 요약의 fourADay === true(지난 7일 업데이트 기록의 평일마다 받은 수 = 4 · 그 넷이 정해진 업데이트 — build_data.mjs) — 아니면 「업데이트 때마다」 같은 참인 말 */

/** 세 줄 틀 — 사장님 글자 그대로([5] 2) · {n} = 회사 수 · {at} = 마지막으로 받은 때 */
export const ESSENCE = Object.freeze([
  '주식을 사기 전에 「왜 사?」 열한 질문으로 내 이유부터 확인해요.',
  '앞날을 맞히지 않아요. 코스피와 코스닥 회사 {n}곳의 지난 기록만 보여 줘요.',
  '사고팔기를 권하지 않아요. 숫자는 네이버 증권에서 받아요. 마지막으로 받은 때: {at}.',
]);
/** 숫자 없는 꼴 — 그려지지 않는 글(소개 쪽 site/hello.html · 설명 글 · 미리보기 설명 · site/next/index.html)은 n · 받은 때를 셀 수 없어 숫자 자리를 뺌([5] 6) */
export const ESSENCE_PLAIN = Object.freeze([
  ESSENCE[0],
  '앞날을 맞히지 않아요. 코스피와 코스닥 회사의 지난 기록만 보여 줘요.',
  '사고팔기를 권하지 않아요. 숫자는 네이버 증권에서 받아요.',
]);
/** 받은 때가 이만큼(시간) 넘게 지났으면 「? 」 — 주말(금 18시 → 월 10시 = 64시간)은 넘지 않음 · 쉬는 날이 이어지거나 업데이트가 멈추면 넘음 */
export const OLD_HOURS = 72;

const isIso = s => typeof s === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(s) && Number.isFinite(Date.parse(s));
const comma = n => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ','); // 2557 → 2,557(나라 설정과 상관없이 같게)
/** mkt.json 회사 수(위 셈) — 모르면 null */
export function coCount(mkt) {
  const c = mkt?.companies;
  if (!c || typeof c !== 'object' || Array.isArray(c)) return null;
  const k = Object.keys(c).length;
  return k > 0 && (mkt.n == null || mkt.n === k) ? k : null;
}
/** 서울 시각 글 — '2026-10-18T07:54:33.273Z' → 「10월 18일 16시」 */
export function kstText(iso) {
  if (!isIso(iso)) return '?';
  const d = new Date(Date.parse(iso) + 9 * 36e5);
  return `${d.getUTCMonth() + 1}월 ${d.getUTCDate()}일 ${d.getUTCHours()}시`;
}
/** 세 줄 자료 — {n: 회사 수 | null, at: 받은 때 ISO | null, old: 받은 때가 OLD_HOURS 넘게 지났나} */
export function essenceData({mkt = null, summary = null, now = Date.now()} = {}) {
  const n = mkt ? coCount(mkt) : Number.isInteger(summary?.coN) && summary.coN > 0 ? summary.coN : null;
  const at = isIso(summary?.fetchedAt) ? summary.fetchedAt : null;
  const t = typeof now === 'number' ? now : Date.parse(now);
  const old = at != null && Number.isFinite(t) && t - Date.parse(at) > OLD_HOURS * 36e5;
  return {n, at, old};
}
/** 세 줄 글(화면 그대로) */
export function essenceLines(d = {}) {
  const n = Number.isInteger(d.n) && d.n > 0 ? comma(d.n) : '?';
  const at = isIso(d.at) ? (d.old ? '? ' : '') + kstText(d.at) : '?';
  return [ESSENCE[0], ESSENCE[1].replace('{n}', n), ESSENCE[2].replace('{at}', at)];
}
/** 요약이 자료와 맞나 — 어긋난 것 글 목록(빈 = 맞음 · 본질 문 ② · next_check 가 부름) */
export function essenceProblems({mkt = null, summary = null} = {}) {
  const out = [], a = coCount(mkt);
  if (a == null) out.push('mkt.json 회사 수를 못 셈');
  else if (summary?.coN !== a) out.push(`요약 회사 수 ${summary?.coN ?? '없음'} ≠ mkt.json ${a}`);
  if (summary?.fetchedAt != null && !isIso(summary.fetchedAt)) out.push('요약 받은 때 꼴이 아님 「' + summary.fetchedAt + '」');
  return out;
}
/** 「하루 4번」 글을 써도 되나([5] 4) — 요약이 없거나 false 면 아니오(참인 말 「업데이트 때마다」를 씀) */
export const fourADay = summary => summary?.fourADay === true;
