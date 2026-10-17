// 이름 한 곳(규칙 76 · 사장님 2026-10-17 17:34 「보드리를 고도리로 변경하자」 · 17:52 「아냐 고치는거야」 · 17:57 「빨리하는 방식 … 정밀하게 하는 방법 찾아내 그런후 시스템에 세팅후 작업해」)
//   화면(site/next/*) · 소개 · 편지 쪽 · 영어 사전 · 검사(scripts/atlas11/next/*) · 영상 · 그림(scripts/atlas11/makbi/*)이 모두 이 파일에서 이름을 읽음 — 이름 글자를 새로 박지 않음
//   이름 바꾸기 = ko · en 을 바꾸고 was 맨 앞에 옛 이름을 더함 → node scripts/atlas11/next/brand_apply.mjs(글 속 옛 이름을 모두 새 이름으로 · 토씨 맞춤)
//                → node scripts/atlas11/makbi/build.mjs(영상 · 그림) → 검사(next-modules 시험 ⑤ ⑥ · next_check 「옛 이름 남음」)
export const BRAND = Object.freeze({
  ko: '고도리', en: 'Godori',
  was: Object.freeze([ // 옛 이름(새 것부터) — 검사가 화면에 남았는지 봄 · 옛 쪽(/atlas/)과 맞댈 때 새 이름으로 바꿔 맞댐
    Object.freeze({ko: '보드리', en: 'Bodri', until: '2026-10-17'}),
    Object.freeze({ko: '아틀란스', en: 'ATLAS', until: '2026-10-17'}),
  ]),
});
export const NAME = BRAND.ko, NAME_EN = BRAND.en;

/** 받침 있나(한글 마지막 글자) */
export const hasBatchim = w => { const c = String(w).charCodeAt(String(w).length - 1) - 0xac00; return c >= 0 && c <= 11171 && c % 28 !== 0; };
const PAIR = {은: ['은', '는'], 는: ['은', '는'], 이: ['이', '가'], 가: ['이', '가'], 을: ['을', '를'], 를: ['을', '를'], 과: ['과', '와'], 와: ['과', '와'],
  이에요: ['이에요', '예요'], 예요: ['이에요', '예요'], 아: ['아', '야'], 야: ['아', '야'], 이랑: ['이랑', '랑'], 랑: ['이랑', '랑'], 이야: ['이야', '야']};
/** 이름 + 토씨(받침 따라) — josa('고도리', '는') → '고도리는' · josa('아틀란스', '이') → '아틀란스가' */
export function josa(w, p) {
  w = String(w);
  if (p === '으로' || p === '로') { const c = w.charCodeAt(w.length - 1) - 0xac00; return w + (hasBatchim(w) && c % 28 !== 8 ? '으로' : '로'); } // ㄹ 받침은 「로」
  const pr = PAIR[p];
  return w + (pr ? (hasBatchim(w) ? pr[0] : pr[1]) : p);
}
