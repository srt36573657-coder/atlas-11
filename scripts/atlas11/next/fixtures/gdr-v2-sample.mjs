// gdr-v2 표본 만들기(check_gdr.mjs · 영어 훑기가 같이 씀) — V1 표본(gdr-v1-sample.json)을 바탕으로 G1c 가 알려 준 gdr-v2 필드꼴로 바꿈. 표본일 뿐 실제 고른 곳이 아님.
const clone = x => JSON.parse(JSON.stringify(x));
const w10 = w => Math.round(w * 10);
/** 새 자료꼴(gdr-v2 — G1c 가 알려 준 필드): picks {no, code, name, ind, big, w, price, reason, wrong, near, card, mc} · sell · half · saying · g · sayings · base 없음 · rules 줄 · counts {outList, cutInd, cutBig} · limits {max, bigCap, need} · bigs · fall3 · status {lists, quarters} · note · score — 없는 칸은 줄이 없음 */
export const mkV2 = (V1S, picksN = 3) => {
  const D2 = clone(V1S); D2.schema = 'godori-gdr-2'; D2.version = 'gdr-v2'; delete D2.sayings; delete D2.base; delete D2.max;
  D2.status = {lists: 'ok', quarters: 'missing'}; D2.limits = {need: 5, max: 36, bigCap: 15, w: [3, 2.5, 2]}; D2.bigs = {'반도체': 9, '금융': 6}; D2.fall3 = {n: 3, days: 250, of: 250};
  D2.rules = [
    {"gate": "x", "key": "thin", "name": "하루 평균 거래대금", "v": 1000000000, "unit": "원", "why": "하루 10억 원은 오가야 사고팔 때 값이 크게 안 흔들려요.", "sens": [{"v": 1100000000, "n": 2}, {"v": 1000000000, "n": 3}, {"v": 900000000, "n": 4}]},
    {"gate": "g1", "key": "opGrow", "name": "최근 4분기 영업이익이 늘어난 정도", "v": 0, "unit": "%", "why": "0% 넘게 = 한 분기 앞보다 줄지 않고 늘었는지만 봐요.", "sens": [{"v": 5, "n": 1}, {"v": 0, "n": 5}, {"v": -5, "n": 9}]},
    {"gate": "g1", "key": "salesGrow", "name": "최근 4분기 매출이 늘어난 정도", "v": 0, "unit": "%", "why": "이익만 늘고 매출이 줄면 아껴서 남긴 것이라 오래 못 가요.", "sens": [{"v": 5, "n": 2}, {"v": 0, "n": 3}, {"v": -5, "n": 4}]},
    {"gate": "g2", "key": "quietX", "name": "한 달 거래대금 ÷ 그 앞 여섯 달 평균", "v": 2, "unit": "배", "why": "2배를 넘으면 이미 사람들이 몰린 뒤라고 봐요.", "sens": [{"v": 1.8, "n": 1}, {"v": 2, "n": 5}, {"v": 2.2, "n": 9}]},
    {"gate": "g2", "key": "hot5", "name": "5일 오름", "v": 10, "unit": "%", "why": "닷새에 10% 넘게 오르면 들뜬 때라 쉬어요.", "sens": [{"v": 9, "n": 2}, {"v": 10, "n": 3}, {"v": 11, "n": 4}]},
    {"gate": "g2", "key": "r20", "name": "한 달 오름 위 끝", "v": 25, "unit": "%", "why": "2023년 말부터 2025년까지 모든 회사의 한 달 오름 중 위 10%가 이 값쯤이에요. 그보다 더 오른 곳은 이미 많이 오른 곳이에요.", "sens": [{"v": 22.5, "n": 1}, {"v": 25, "n": 5}, {"v": 27.5, "n": 9}]},
    {"gate": "g3", "key": "r60lo", "name": "석 달 오름 아래 끝", "v": 5, "unit": "%", "why": "석 달에 5%는 올라야 오르는 흐름이 있다고 봐요.", "sens": [{"v": 5.5, "n": 2}, {"v": 5, "n": 3}, {"v": 4.5, "n": 4}]},
    {"gate": "g3", "key": "r60hi", "name": "석 달 오름 위 끝", "v": 40, "unit": "%", "why": "석 달에 40% 넘게 오르면 천천히 오른 게 아니에요.", "sens": [{"v": 36, "n": 1}, {"v": 40, "n": 5}, {"v": 44, "n": 9}]},
    {"gate": "g3", "key": "jump", "name": "하루 오름 위 끝", "v": 15, "unit": "%", "why": "하루에 15% 넘게 뛴 날이 있으면 소식 하나로 튄 것일 수 있어요.", "sens": [{"v": 13.5, "n": 2}, {"v": 15, "n": 3}, {"v": 16.5, "n": 4}]},
    {"gate": "g3", "key": "mdd60", "name": "석 달 안 가장 깊은 빠짐", "v": 20, "unit": "%", "why": "2023년 말부터 2025년까지 모든 회사의 석 달 가장 깊은 빠짐 가운데값이 이 값쯤이에요. 보통 회사보다 덜 빠진 곳만 봐요.", "sens": [{"v": 18, "n": 1}, {"v": 20, "n": 5}, {"v": 22, "n": 9}]},
    {"gate": "g3", "key": "dd0", "name": "오늘 값이 석 달 꼭대기보다 아래인 정도", "v": 15, "unit": "%", "why": "꼭대기에서 15% 넘게 내려와 있으면 오르는 흐름이 꺾였다고 봐요.", "sens": [{"v": 13.5, "n": 2}, {"v": 15, "n": 3}, {"v": 16.5, "n": 4}]},
    {"gate": "g4", "key": "low2x", "name": "1년 가장 낮은 값의 몇 배", "v": 2, "unit": "배", "why": "1년 바닥의 2배가 넘으면 이미 크게 오른 뒤예요.", "sens": [{"v": 1.8, "n": 1}, {"v": 2, "n": 5}, {"v": 2.2, "n": 9}]},
    {"gate": "g5", "key": "indX", "name": "업종 거래 한 달 ÷ 그 앞 석 달", "v": 1.1, "unit": "배", "why": "업종에 오가는 돈이 10%는 늘어야 돈이 들어온다고 봐요.", "sens": [{"v": 1.21, "n": 2}, {"v": 1.1, "n": 3}, {"v": 0.99, "n": 4}]},
    {"gate": "g5", "key": "indMed", "name": "업종 회사 한 달 오름 가운데값", "v": 0, "unit": "%", "why": "업종 회사 절반 넘게 올라야 업종이 오르는 중이라고 봐요.", "sens": [{"v": 1, "n": 1}, {"v": 0, "n": 5}, {"v": -1, "n": 9}]}]; // 실제 gdr.json(G1c · 2026-10-18 11:57)의 문턱 열네 줄 그대로 — 글은 실제 것 · 세어 둔 곳 수(sens.n)만 표본
  D2.counts = {...D2.counts, outList: 4, cutInd: 2, cutBig: 1, g1: 7, passAll: 40}; delete D2.counts.managed;
  D2.note = ['거래소(관리 · 투자경고 · 투자위험 · 거래정지) · DART(1년 안 전환사채 · 유상증자) 목록을 못 받아 모든 회사가 「?」 — 지나지 못함', '분기 결산을 못 받아 이익 문(최근 4분기 합)이 모두 「?」 — 지나지 못함', '거래 멈춤은 최근 5거래일 거래량 0 으로 짐작함 · 업종 나눔은 오늘 것']; // 실제 gdr.json(G1c · 2026-10-18 11:57)의 note 글 그대로
  D2.score = {src: 'recomputed', from: '2026-09-09', to: '2026-10-13', n: 2, counted: 2, up: 1, lo: 9, hi: 13, rows: [{code: '004690', name: '삼천리', lo: 5, hi: 7, from: 134500, to: 124500, up: 0}, {code: '004370', name: '농심', lo: 4, hi: 6, from: 413500, to: 449000, up: 1}]};
  D2.picks = D2.picks.slice(0, picksN);
  D2.picks.forEach((x, i) => {
    delete x.sell; delete x.half; delete x.saying; delete x.g; x.big = '반도체'; x.reason = x.reason.replace('업종 돈', '업종 거래');
    if (i === 0) { x.near = ['g1', 'g3']; x.card = {per: 1, pbr: 1, cap: 1, hi: -1, trade: 1}; x.mc = {lo: 1, hi: 7, of: 10, h: 20, in: '지난 1년 하루 출렁임과 코스피 흐름을 넣었어요.'}; }
    else if (i === 1) { x.near = []; x.card = {per: null, pbr: null, cap: null, hi: null, trade: null}; x.mc = {lo: 2, hi: 5, of: 10, h: 20}; }
    else { delete x.near; delete x.card; delete x.mc; }
  });
  D2.counts.picked = D2.picks.length; const sum = D2.picks.reduce((a, x) => a + w10(x.w), 0); D2.counts.cash = (1000 - sum) / 10; D2.inds = {}; for (const x of D2.picks) D2.inds[x.ind] = (w10(D2.inds[x.ind] ?? 0) + w10(x.w)) / 10;
  return D2;
};
