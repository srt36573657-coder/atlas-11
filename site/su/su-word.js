/* 수르 — 낱말 엔진(빈 파일에서 새로 씀 · 주문 1807)
   사장님 2026-11-04 13:07(+04) [쉬운 말과 전문가 정보] 「1. 주식 모르는 여고생 눈높이로 써라 2. 그 학생이 혼자 읽고 알게 해라
   3. 주식 낱말은 쉬운 말로 바꿔라 4. 못 바꾸면 옆에 한 줄 풀이를 붙여라」(원문 docs/design/su-easy-2026-11-04/order-1807.txt)
   ① EASY — 바꿀 수 있는 낱말은 쉬운 말로 바꿈(자료에서 온 글에도 · 화면을 그리기 전에)
   ② GLOSS — 못 바꾸는 낱말은 그 쪽에서 처음 나온 줄 바로 밑에 「풀이」 한 줄(쪽마다 한 번 · 누르지 않아도 보임 · 누를 자리 크기 걱정 없음)
   ③ HARD — 학생이 모를 주식 낱말 목록 · 풀이 없이 남은 수를 셈(검사와 보고가 씀)
   풀이 글은 사이트가 실제로 세는 셈 그대로(theme-engine.js · bloom-labels.js · sprout365.py) — 지어낸 뜻 없음 */

/** 바꿀 수 있는 낱말 → 쉬운 말(긴 것부터) */
export const EASY = Object.freeze([ // 이름씨로만 쓰이는 낱말(움직씨 꼴은 바꾸면 말이 깨짐 — 그런 낱말은 HARD 로 셈만)
  ['시가총액', '회사 크기'], ['시총', '회사 크기'], ['몸값', '회사 크기'], ['수익률', '오른 만큼'], ['상승률', '오른 만큼'], ['하락률', '내린 만큼'],
  ['종가', '그날 마지막 값'], ['주가', '주식 값'], ['변동성', '흔들림'], ['초과 수익', '시장보다 더 오른 만큼'], ['벤치마크', '견주는 잣대'],
]);
/** 못 바꾸는 낱말 → 한 줄 풀이(학생 말 · 사이트가 실제로 세는 셈 그대로) */
export const GLOSS = Object.freeze([
  ['코스피', '우리나라 큰 회사들의 주식을 사고파는 시장이에요.'],
  ['코스닥', '작고 새로운 회사가 많은 주식 시장이에요.'],
  ['주식', '회사를 아주 작은 조각으로 나눈 것이에요. 사고팔 수 있어요.'],
  ['업종', '하는 일이 비슷한 회사들의 묶음이에요. 은행, 보험, 반도체 같은 거예요.'],
  ['꽃', '꽃은 한 달 동안 시장보다 100원에 5원 넘게 더 오른 회사예요.'], // data.bloomMeaning 의 셈 그대로 · 「%」 대신 100원 말(점검 W1 — 업종이 넘어야 할 선 15 와는 다른 선)
  ['싹', '시장보다 앞선 만큼이 아직 꽃의 선에 못 미치고, 닷새 동안은 시장에 뒤지지 않은 회사예요.'],
  ['대장', '업종 안에서 한 달 동안 회사 크기가 원으로 가장 많이 늘어난 회사예요.'],
  ['아무 회사', '같은 날 셀 수 있었던 모든 회사예요. 견주는 잣대예요.'],
  ['거래일', '주식 시장이 열린 날이에요. 주말과 쉬는 날은 빼요.'],
  ['회사 크기', '주식 한 조각 값에 조각 수를 곱한 거예요. 회사 전체 값이에요.'],
  ['외국인', '다른 나라 사람이나 회사예요.'], // 사람 풀이(칸은 사고판 주식 수 — 점검 W2)
  ['급등', '닷새 동안 값이 크게 오른 것이에요.'], // 주문 0054 — 21칸 밑 「불장 곁 · 급등 다섯 칸」 · 셋의 길 불장 쪽(풀이 없이 남던 낱말 1)
  ['기관', '연금, 보험, 은행 같은 큰 곳이에요.'],
  ['매매일지', '사기 전에 왜 사는지 적어 두는 내 공책이에요. 이 휴대폰에만 남아요.'],
  ['가운데 값', '모든 회사를 줄 세웠을 때 한가운데 회사의 값이에요.'],
  ['시장 전체 값', '코스피나 코스닥에 있는 회사들 값을 한데 묶은 값이에요.'],
  // 풀이 없이 남던 낱말(점검 W3)
  ['지수', '시장 전체 값을 숫자 하나로 모은 거예요.'],
  ['테마', '같은 이야기로 묶인 회사들이에요.'],
  ['배당', '회사가 번 돈 일부를 주주에게 나눠 주는 돈이에요.'],
  ['공매도', '빌린 주식을 먼저 팔고, 나중에 다시 사서 갚는 거래예요.'],
  ['레버리지', '오르내림을 두 배, 세 배로 키운 상품이에요.'],
  // 쉬운 판(주문 1112-0253 · 사장님 2026-11-12 02:53 「용어도 명확하게 하고 쉽게 해」) — 사장님이 정하신 말(우량주 · 포모지수)과 셈 이름은 바꾸지 않고 처음 한 번 뜻을 붙임
  ['우량주', '업종마다 큰 회사를 골라 모은 365곳이에요. 큐피트는 그 안에서만 찾아요.'], // 사장님 2026-11-04 15:39 「한국 365개 개념은 우량주 개념이다」 · 고른 법 = 업종마다 큰 회사(「왜?」 쪽 한눈 그림 글 그대로)
  ['포모지수', '요즘 열흘 값이 얼마나 뜨거운지예요. 50이 이 회사의 보통 때이고, 100에 가까울수록 뜨거워요.'], // 「왜?」 쪽 포모 풀이(su-why36.js) 그대로
  ['몬테카를로', '지난 값을 수만 번 섞어 길을 그려 보고, 지금 모습이 얼마나 드문지 세는 방법이에요.'],
  ['소거', '기준에 맞지 않는 곳을 하나씩 빼 나가는 거예요.'],
]);
/** 학생이 모를 주식 낱말(풀이 없이 남으면 「어려운 낱말」로 셈) — GLOSS 낱말 + 바꿨어야 할 낱말 */
export const HARD = Object.freeze([...GLOSS.map(g => g[0]).filter(w => !['아무 회사', '회사 크기', '가운데 값', '시장 전체 값', '매매일지'].includes(w)),
  ...EASY.map(e => e[0]), '상승', '하락', '급등', '급락', '표본', '대장주', '테마', '거래량', '거래 대금', '배당', '공매도', '레버리지', '호가', '지수']);

const esc = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
/** 낱말이 글에 있나 — 「꽃잎」은 「꽃」이 아님(다른 낱말) */
const NOT_AFTER = {'꽃': '잎'};
const NOT_IN = {'지수': ['포모지수']}; // 「포모지수」 속 「지수」는 다른 낱말(뒤를 보는 정규식은 옛 휴대폰에서 깨져 쓰지 않음)
export const has = (t, w) => { const x = (NOT_IN[w] ?? []).reduce((a, o) => a.split(o).join(''), t); return NOT_AFTER[w] ? new RegExp(esc(w) + '(?!' + NOT_AFTER[w] + ')').test(x) : x.includes(w); };
const EASY_MAP = new Map(EASY);
const bat = w => { const c = String(w).charCodeAt(String(w).length - 1) - 0xac00; return c >= 0 && c <= 11171 && c % 28 !== 0; };
const JO = [['이', '가'], ['은', '는'], ['을', '를'], ['과', '와'], ['으로', '로'], ['이에요', '예요'], ['이라', '라']];
/** 글 한 줄을 쉬운 말로(자료에서 온 글 · 조건 글 · 까닭 글) — 바꾼 말 뒤 토씨도 받침에 맞춤 */
export function easy(t) {
  if (typeof t !== 'string') return t;
  return t.replace(new RegExp('(' + EASY.map(([a]) => esc(a)).join('|') + ')(이에요|예요|으로|이라|이|가|은|는|을|를|과|와|로|라)?(?![가-힣])?', 'g'), (m, w, j) => {
    const r = EASY_MAP.get(w) ?? w;
    if (!j) return r;
    const pair = JO.find(p => p.includes(j));
    return r + (pair ? (bat(r) ? pair[0] : pair[1]) : j);
  });
}

/** 쪽 하나에 풀이를 붙임 — main 안 글에서 GLOSS 낱말이 처음 나온 덩어리 바로 뒤에 「풀이」 한 줄(전문가 서랍 · 풀이 칸 · 그림 안 글은 건너뜀) · 붙인 낱말 목록 */
export function glossPage(main, {skip = '.su-head, .su-pro, .su-gl, svg, nav, button, summary, .su-src'} = {}) { // 머리(큰 값)는 건너뜀 — 첫 화면은 큰 값과 그림
  if (!main) return [];
  const done = new Set(), out = [], BL = 'p, li, h1, h2, h3, .su-ml, .su-vl, .su-bl, .su-cname, .su-csub';
  const mk = (tag, hit, at = null) => {
    const near = at?.nextElementSibling, join = near && near.classList.contains('su-gl') && near.tagName === tag.toUpperCase();
    const box = join ? near : document.createElement(tag); if (!join) box.className = 'su-gl';
    for (const [w, g] of hit) {
      done.add(w); out.push(w);
      const line = document.createElement('span'); line.className = 'su-glr';
      const k = document.createElement('b'); k.textContent = w; line.append(k, document.createTextNode(' — ' + g));
      box.append(line);
    }
    return box;
  };
  // ① 머리(큰 값 · 「그래서」)에 나온 낱말 — 첫 화면은 큰 값과 그림이 차지하므로 풀이는 큰 그림 바로 밑에 한 번(번호 부딪힘: 「그림이 대부분」 ↔ 「옆에 한 줄 풀이」)
  const head = main.querySelector('.su-head');
  if (head) {
    const t = [...head.querySelectorAll(BL)].map(b => b.textContent ?? '').join(' ');
    const hit = GLOSS.filter(([w]) => has(t, w));
    if (hit.length) { const box = mk('p', hit); box.classList.add('su-glh'); (main.querySelector('.su-hero') ?? head).after(box); }
  }
  const blocks = [...main.querySelectorAll(BL)].filter(b => !b.closest(skip));
  for (const b of blocks) {
    const t = b.textContent ?? '';
    const hit = GLOSS.filter(([w]) => !done.has(w) && has(t, w));
    if (!hit.length) continue;
    const fig = b.closest('figcaption, .su-cap') ? b.closest('figure') : null; // 그림 안 글 → 풀이는 그림 바로 밑(네 박자 글을 끊지 않음)
    const anchor = fig ?? (b.closest('li, .su-mid, .su-card, .su-vr') && b.tagName !== 'LI' ? b.closest('li, .su-mid, .su-card, .su-vr') : b);
    const box = mk(anchor.tagName === 'LI' ? 'li' : 'p', hit, anchor);
    if (box.isConnected) continue; // 이미 있던 풀이 칸에 더함
    if (anchor.tagName === 'A' || anchor.closest('a')) (anchor.closest('a') ?? anchor).after(box); else anchor.after(box);
  }
  // ③ 단추 · 칸 이름 · 서랍 이름에만 나온 낱말도 그 덩어리 바로 밑에 풀이(빈틈없이)
  const tw = document.createTreeWalker(main, NodeFilter.SHOW_TEXT);
  for (let n = tw.nextNode(); n; n = tw.nextNode()) {
    const pe = n.parentElement;
    if (!pe || pe.closest(skip)) continue;
    const hit = GLOSS.filter(([w]) => !done.has(w) && has(n.textContent ?? '', w));
    if (!hit.length) continue;
    const blk = pe.closest('p, li, .su-mid, .su-card, .su-vr');
    const at = blk && !blk.closest('a') ? blk : (pe.closest('figure, section, .su-shelf') ?? pe.closest('a') ?? pe);
    at.after(mk(at.tagName === 'LI' ? 'li' : 'p', hit));
  }
  // ④ 전문가 서랍 — 서랍 글에만 나온 낱말은 서랍 맨 아래에 풀이(열면 보임 · 전문가 정보도 학생이 읽게)
  for (const pro of main.querySelectorAll('.su-pro')) {
    const list = pro.querySelector('.su-prol'); if (!list) continue;
    const hit = GLOSS.filter(([w]) => !done.has(w) && has(list.textContent ?? '', w));
    if (hit.length) list.after(mk('p', hit));
  }
  return out;
}

/** 어려운 낱말 셈 — 쪽 글(전문가 서랍 밖)에서 HARD 낱말이 나왔는데 그 쪽에 풀이가 없는 것 */
export function hardLeft(text, glossed = []) {
  const left = [];
  for (const w of HARD) if (has(text, w) && !glossed.includes(w) && !EASY_MAP.has(w)) left.push(w);
  for (const [a] of EASY) if (text.includes(a)) left.push(a); // 바꿨어야 할 낱말이 남음
  return [...new Set(left)];
}
