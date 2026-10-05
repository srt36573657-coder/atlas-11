/* ATLAS 11 · 찾기 셈(화면 없음 · 시험: tests/atlas11/find.test.mjs) — 2026-10-05 20:24 사장님 「아틀란스에서 종목을 찾는 기능을 넣어라」
   한 칸에 넣은 글자로 한국 판 · 미국 판 회사를 함께 찾는다:
     · 한글 이름 일부(띄어쓰기 · 점 · 줄표 무시)  · 종목 기호(005930 · NVDA · BRK.B)  · 영문 이름(미국 판)  · 초성(ㅅㅅㅈㅈ → 삼성전자)
   차례: 얼마나 꼭 맞나(기호 그대로 → 이름 그대로 → 이름이 그 글자로 시작 → 기호가 그 글자로 시작 → 이름 안 → 영문 이름 → 초성)
         같은 칸 안은 지난 20거래일 많이 오른 순(규칙 9) */

const CHO = 'ㄱㄲㄴㄷㄸㄹㅁㅂㅃㅅㅆㅇㅈㅉㅊㅋㅌㅍㅎ';
/** 견줄 꼴 — 띄어쓰기 · 점 · 가운뎃점 · 줄표 · 괄호 · & · 쉼표를 빼고 작은 글자로 */
export const norm = t => String(t ?? '').normalize('NFC').replace(/[\s·.\-_()&,'’]/g, '').toLowerCase();
/** 한글 글자 → 첫소리(삼성전자 → ㅅㅅㅈㅈ) · 한글이 아닌 글자는 그대로 */
export const chosung = t => [...String(t ?? '')].map(ch => { const k = ch.charCodeAt(0) - 0xAC00; return k >= 0 && k < 11172 ? CHO[Math.floor(k / 588)] : ch; }).join('');
/** 넣은 글자가 모두 첫소리(ㄱ~ㅎ)인가 */
export const onlyChosung = q => /^[ㄱ-ㅎ]+$/.test(q);

/** 한 회사가 넣은 글자에 맞는 정도 — 0 = 안 맞음 · 클수록 위 */
export function matchScore(c, query) {
  const q = norm(query); if (!q) return 0;
  const code = norm(c.code), name = norm(c.name), en = norm(c.nameEn);
  if (code === q) return 100;
  if (name === q) return 95;
  if (name.startsWith(q)) return 80;
  if (code.startsWith(q)) return 70;
  if (name.includes(q)) return 60;
  if (en && en.startsWith(q)) return 50;
  if (en && q.length >= 2 && en.includes(q)) return 40;
  if (onlyChosung(q)) { const ch = norm(chosung(c.name)); if (ch.startsWith(q)) return 45; if (q.length >= 2 && ch.includes(q)) return 35; }
  return 0;
}

/**
 * 여러 판에서 찾기 — boards: [{place:{id,label,href}, companies:[…], here:bool}] → [{c, place, here, score, rank}]
 *   rank = 그 판 안의 「오른 순」 자리(1부터 · 지난 20거래일 많이 오른 차례 · 값이 없으면 맨 뒤)
 */
export function findIn(boards, query) {
  const out = [];
  for (const b of boards) {
    const ranked = [...(b.companies ?? [])].sort((x, y) => (Number.isFinite(y.change20) ? y.change20 : -Infinity) - (Number.isFinite(x.change20) ? x.change20 : -Infinity) || String(x.code).localeCompare(String(y.code)));
    ranked.forEach((c, i) => { const score = matchScore(c, query); if (score) out.push({c, place: b.place, here: !!b.here, score, rank: i + 1}); });
  }
  return out.sort((a, b) => b.score - a.score
    || (Number.isFinite(b.c.change20) ? b.c.change20 : -Infinity) - (Number.isFinite(a.c.change20) ? a.c.change20 : -Infinity)
    || (b.here - a.here) || String(a.c.code).localeCompare(String(b.c.code)));
}

/** 회사 화면 주소 — 같은 판이면 「#/stock/기호」, 다른 판이면 그 판 주소(/us/ · /) 앞에 붙여 */
export const stockHref = (hit) => (hit.here ? '' : hit.place.href) + '#/stock/' + encodeURIComponent(hit.c.code).replace(/%2E/gi, '.');
