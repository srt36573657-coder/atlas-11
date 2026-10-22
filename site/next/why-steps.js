/* 첫 화면 「왜 그럴까?」 열한 걸음의 글(사장님 2026-10-22(서울) 08:53 「… 원숭이 엉덩이는 빨개 빨가면 사과 … 이런 식으로 11단계는 논리적으로 사방팔방으로 이야기 해야지
   그 이야기를 움직이는 도식화로 해야 하고」 · 그림은 why-chain.js) — 앞 걸음의 끝말이 다음 물음이 됨(외국인이 샀어요 → 외국인이 사면 판 쪽은?)
   사방팔방 = 시장 → 돈(산 쪽 · 판 쪽) → 업종(센 곳 · 약한 곳) → 미국(큰 지수 · 반도체) → 지난날 → 싹(테마 시계) → 나(매매일지)
   모든 걸음은 받은 자료로 센 지난 사실만(home.json idx · flows · sectors · us · theme-home.json order) — 못 받은 값은 「? …」 · 앞날 · 사고팔기 권함 없음
   다른 파일을 부르지 않음(노드 시험에서도 읽힘 · tests/atlas11/why-chain.test.mjs) */
export const STEP_TAGS = Object.freeze(['시작', '시장', '돈', '업종', '미국', '지난날', '싹', '나']);
const num = n => (Number.isFinite(n) ? Math.round(n).toLocaleString('ko-KR') : '?');
const pct = (x, d = 1) => (Number.isFinite(x) ? (x > 0 ? '+' : x < 0 ? '−' : '') + Math.abs(x).toFixed(d) + '%' : '?');
const md = d => (typeof d === 'string' && /^\d{4}-\d{2}-\d{2}/.test(d) ? `${+d.slice(5, 7)}월 ${+d.slice(8, 10)}일` : '');
/** 억 원 → 「1조 7,507억 원」(home.json flows 단위 = 억 원) */
export const eokH = v => { const a = Math.abs(Math.round(v)), j = Math.floor(a / 10000), r = a % 10000; return (j ? j.toLocaleString('ko-KR') + '조' + (r ? ' ' : '') : '') + (r || !j ? r.toLocaleString('ko-KR') + '억' : '') + ' 원'; };
/** 받침 — 「2차전지예요」 · 「콘텐츠 제작이에요」 */
export function ieyo(w) { const s = String(w ?? ''), c = s.charCodeAt(s.length - 1) - 0xAC00; return s + (c >= 0 && c < 11172 && c % 28 ? '이에요' : '예요'); }
const WHO = [['foreign', '외국인'], ['institutional', '기관'], ['personal', '개인']]; // 셋 다 받침 있음 — 「이」 · 「은」

/** {side: 'up' | 'dn', n 곳 수, date, H home.json, TH theme-home.json, mine: {count} | null} → 걸음 열하나(why-chain.js 꼴) */
export function homeSteps({side = 'up', n, date, H, TH, mine = null} = {}) {
  const up = side !== 'dn', S = [];
  S.push({a: `${md(date) ? md(date) + ' ' : ''}${up ? '오른' : '내린'} 곳이 ${num(n)}곳이에요`, tag: '시작'});
  // 시장 — 코스피 마지막 날 하루
  const rows = (H?.idx?.KOSPI?.rows ?? []).filter(r => Array.isArray(r) && Number.isFinite(r[1]));
  const day = rows.length >= 2 ? (rows.at(-1)[1] / rows.at(-2)[1] - 1) * 100 : NaN;
  S.push({q: `${up ? '오른' : '내린'} 곳이 ${num(n)}곳이면 코스피는?`, a: Number.isFinite(day) ? `코스피는 하루 ${pct(day)}예요` : '? 코스피 값을 못 받았어요', tag: '시장'});
  // 돈 — 산 쪽 · 판 쪽(코스피)
  const F = H?.flows?.KOSPI, who = WHO.filter(([k]) => Number.isFinite(F?.[k])).map(([k, w]) => [w, F[k]]);
  const buy = [...who].sort((a, b) => b[1] - a[1])[0], sell = [...who].sort((a, b) => a[1] - b[1])[0];
  const first = up ? buy : sell, second = up ? sell : buy;
  const said = ([w, v]) => `${w} ${eokH(v)} ${v < 0 ? '팔았어요' : '샀어요'}`; // 지금 첫 화면 「누가 팔았을까?」 답과 같은 꼴(영어 사전 틀 그대로)
  S.push({q: `코스피가 그만큼 움직일 때 누가 ${up ? '샀을까' : '팔았을까'}?`, a: first ? said(first) : '? 사고판 돈을 못 받았어요', tag: '돈'});
  S.push({q: first ? `${first[0]}이 ${first[1] < 0 ? '팔면' : '사면'} 반대쪽은?` : '반대쪽은?', a: second && second !== first ? said(second) : '? 반대쪽 돈을 못 받았어요', tag: '돈'});
  // 업종 — 센 곳 · 약한 곳(네이버 업종 · 이름은 「 · 」로 따로 — 영어 엔진이 이름 칸을 따로 바꿈)
  const st = H?.sectors?.strong?.[0], wk = H?.sectors?.weak?.[0];
  S.push({q: '돈이 오간 날 가장 센 업종은?', a: st?.name ? `가장 센 업종 · ${st.name} · ${pct(st.chg, 2)}` : '? 업종 값을 못 받았어요', tag: '업종'});
  S.push({q: '센 업종이 있으면 가장 약한 업종은?', a: wk?.name ? `가장 약한 업종 · ${wk.name} · ${pct(wk.chg, 2)}` : '? 업종 값을 못 받았어요', tag: '업종'});
  // 미국 — 큰 지수 · 반도체(마지막 장)
  const U = H?.us?.rows ?? [], sp = U.find(r => r?.key === 'INX'), sox = U.find(r => r?.key === 'SOX');
  S.push({q: '우리 시장이 이럴 때 미국은?', a: sp && Number.isFinite(sp.chg) ? `미국 큰 회사 500곳은 ${md(sp.date) ? md(sp.date) + ' ' : ''}${pct(sp.chg, 2)}였어요` : '? 미국 값을 못 받았어요', tag: '미국'});
  S.push({q: '미국 반도체는?', a: sox && Number.isFinite(sox.chg) ? `미국 반도체는 ${pct(sox.chg, 2)}였어요` : '? 미국 반도체 값을 못 받았어요', tag: '미국'});
  // 지난날 — 코스피 지난 20거래일
  const last = rows.slice(-21), d = last.slice(1).map((r, j) => Math.sign(r[1] - last[j][1])), ups = d.filter(x => x > 0).length, dns = d.filter(x => x < 0).length;
  S.push({q: '이런 날이 자주 있었을까?', a: d.length >= 2 ? `코스피는 지난 ${num(d.length)}거래일 가운데 ${num(up ? ups : dns)}일 ${up ? '올랐어요' : '내렸어요'}` : '? 지난 날 값을 못 받았어요', tag: '지난날'});
  // 싹 — 테마 시계(물음은 본질 1)
  const s1 = TH?.order?.S?.[0];
  S.push({q: '그럼 꽃이 될 듯한 싹은?', a: s1 ? `싹 맨 앞은 ${ieyo(s1)}` : '? 테마 시계 자료를 못 받았어요', tag: '싹', href: '#/t/sprout'});
  // 나 — 매매일지
  S.push({q: '그래서 나는?', a: mine?.count > 0 ? `내가 적은 이유 ${num(mine.count)}개 · 사기 전에 왜 사?` : '사기 전에 왜 사? 열한 질문으로 내 이유부터', tag: '나', href: '#/why'});
  return S;
}
