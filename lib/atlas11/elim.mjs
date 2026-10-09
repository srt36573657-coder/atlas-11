/**
 * ATLAS 11 · 소거 1판(elim-rules-1) — 회사마다 통과 · 보류 · 제외와 다시 보는 때(순수 함수 · 화면 없음)
 *   사장님 2026-10-10 05:14(마카오) 승인 「… 6은 너가 가장 현명하게 해라 …」 · 계획 docs/superpowers/plans/2026-10-10-atlas-phase1-engine.md Task 2
 *   판 읽기(scripts/atlas11/lens/build.mjs)가 lens.elim 으로 붙임 · 시험 tests/atlas11/elim.test.mjs · 따로 다시 세기 scripts/atlas11/verify/elim_verify.py
 *   검사(차례 고정 · ELIM_ORDER)
 *     1단 close 마감 가격 · stale 오래된 가격 · ca 기업행사(한국만 셈) · history 분석 입력 · liquidity 거래 가능성(자료 없음 → 늘 na) · profit 흑자 · risk 위험 공시
 *     2단 paths 경로 수 · converge 수렴 · tail 하락 위험(calibrated=false 면 표시만 → na · flags 에 'tail')
 *   판정 pass · hold · out · na — 모으기: out 하나라도 → out · 아니면 hold 하나라도 → hold · 아니면 pass(na 는 넣지 않음)
 *   first = 차례상 처음 hold · out 인 검사(없으면 null) · 자료가 없으면 지어내지 않고 보류
 *   마감 가격 · 오래된 가격은 판 읽기 상태(status)를 나눠 맡음 — late → 마감 가격 보류 · stale → 오래된 가격 보류(마감 가격은 na · first 가 거래 재개 조건을 가리키게)
 *   위험 공시 = 매수 검토 후보(cand.mjs)와 같은 셈(judgeOf · EXCLUDE_RE) — 30일 안 · 그날 장 마감 전 · 우선주 공시는 이 회사 것 아님
 */
import {EXCLUDE_RE, cutoffOf, judgeOf, RISK_UNKNOWN} from './cand.mjs';

export const ELIM_SCHEMA = 'atlas11-elim-1';
export const ELIM_RULES = Object.freeze({
  id: 'elim-rules-1',
  label: '소거 1판 — 회사마다 통과 · 보류 · 제외와 다시 보는 때(하락 위험은 모형 시험 전까지 표시만)',
  approvedAt: '2026-10-10T05:14:00+08:00', // 사장님 승인(마카오 시각 05:14 = 서울 06:14) — 기준을 바꾸면 새 판(elim-rules-2)으로 따로 평가
  approvedBy: '사장님 「6은 너가 가장 현명하게 해라」(위험 기준 −50% 는 모형 시험 통과 뒤에만 보류에 씀)',
  thresholds: Object.freeze({minPaths: 20000, maxSe: 0.005, tail: -0.5, historyDays: 272, windowDays: 30}), // 경로 2만 개 · 오차 0.5%p · 나쁜 5% 평균 −50% · 1년 252 + 20거래일 · 공시 30일
});
/** 검사 차례(고정) — 앞 일곱 = 1단 · 뒤 셋 = 2단 */
export const ELIM_ORDER = Object.freeze(['close', 'stale', 'ca', 'history', 'liquidity', 'profit', 'risk', 'paths', 'converge', 'tail']);
const LABEL = Object.freeze({close: '마감 가격', stale: '오래된 가격', ca: '기업행사', history: '분석 입력', liquidity: '거래 가능성', profit: '흑자', risk: '위험 공시', paths: '경로 수', converge: '수렴', tail: '하락 위험'});

const fin = x => typeof x === 'number' && Number.isFinite(x);
const day = s => String(s ?? '').slice(0, 10);
const plusDays = (d, n) => { const t = Date.parse(d + 'T00:00:00Z'); return Number.isFinite(t) ? new Date(t + n * 86400e3).toISOString().slice(0, 10) : null; };
/** 날짜 글 — 「10월 8일」 · 기준일과 해가 다르면 「2025년 12월 1일」 */
const kd = (d, asOf) => { const m = String(d ?? '').match(/^(\d{4})-(\d{2})-(\d{2})/); return m ? `${asOf && !String(asOf).startsWith(m[1]) ? `${m[1]}년 ` : ''}${Number(m[2])}월 ${Number(m[3])}일` : '날짜 없음'; };
const num = v => (fin(v) ? v.toLocaleString('ko-KR', {maximumFractionDigits: 2}) : '값 없음');
const pc = (v, k = 1) => (fin(v) ? `${v > 0 ? '+' : v < 0 ? '−' : ''}${Math.abs(v * 100).toFixed(k)}%` : '값 없음'); // 비율 → %
const pp = v => (fin(v) ? `${(v * 100).toFixed(2)}%p` : '값 없음'); // 비율 → %p
const fyK = fy => { const m = String(fy ?? '').match(/^(\d{4})\.(\d{1,2})$/); return m ? `${m[1]}년 ${Number(m[2])}월 결산` : '결산 달 모름'; };
const mk = (id, verdict, data, value, recheck) => ({id, stage: ELIM_ORDER.indexOf(id) < 7 ? 1 : 2, label: LABEL[id], data, value, verdict, recheck});
const AGAIN = '회차마다 다시 봄';
/** 그날 종가가 있나 — 판 읽기 상태 ok · ca(가격 제한폭을 넘은 날이 있어도 그날 종가는 있음) · 날짜 = 기준일 */
const dayClose = (s, asOf) => (s.status === 'ok' || s.status === 'ca') && s.date === asOf && fin(s.close);
/** 그날 종가가 없을 때 다시 보는 때 — 오래된 가격 · 늦음 · 자료 없음 */
const closeAgain = s => (s.status === 'stale' ? '거래 재개 뒤 5거래일' : s.date ? '다음 회차에 확정 가격이 오면' : '가격 자료가 들어오면 다시 봄');

/* ── 1단 ── */
function closeCheck(s, asOf) {
  const data = '날마다 마감 가격(종가) 기록';
  if (s.status === 'stale') return mk('close', 'na', data, `마지막 종가 ${kd(s.date, asOf)} — 「오래된 가격」 칸에서 봄`, closeAgain(s));
  if (dayClose(s, asOf)) return mk('close', 'pass', data, `${kd(asOf, asOf)} 종가 ${num(s.close)}`, AGAIN);
  if (!s.date) return mk('close', 'hold', data, '종가 자료 없음', closeAgain(s));
  const value = s.date === asOf ? `${kd(asOf, asOf)} 종가 값 없음` : `${kd(asOf, asOf)} 종가 아직 없음 — 마지막 종가 ${kd(s.date, asOf)}${fin(s.lag) && s.lag > 0 ? `(${s.lag}거래일 늦음)` : ''}`;
  return mk('close', 'hold', data, value, closeAgain(s));
}
function staleCheck(s, asOf) {
  const data = '마지막 종가 날짜와 거래일 달력';
  if (s.status === 'stale') return mk('stale', 'hold', data, `마지막 종가 ${kd(s.date, asOf)}${fin(s.lag) ? ` — ${s.lag}거래일 늦음` : ''}(거래가 멈췄을 수 있음)`, '거래 재개 뒤 5거래일');
  if (!s.date || s.status === 'missing') return mk('stale', 'na', data, '종가 자료 없음 — 「마감 가격」 칸에서 봄', '가격 자료가 들어오면 다시 봄');
  return mk('stale', 'pass', data, fin(s.lag) && s.lag > 0 ? `${s.lag}거래일 늦음 — 오래된 가격은 아님` : '늦음 없음', AGAIN);
}
function caCheck(s, asOf, place) {
  const data = '최근 20거래일 하루 가격 변화';
  if (place !== 'kr') return mk('ca', 'na', data, place === 'us' ? '미국 판은 하루 가격 제한이 없어 ±30% 셈을 하지 않음' : '이 판은 ±30% 셈을 하지 않음', '기업행사 자료를 모으면 다시 봄');
  const days = (Array.isArray(s.jumps) ? s.jumps : []).filter(Boolean), cas = (Array.isArray(s.cas) ? s.cas : []).filter(Boolean);
  const words = cas.length ? ` · 기업행사 공시: ${cas.join(' · ')}` : '';
  if (days.length || s.status === 'ca') return mk('ca', 'hold', data, `하루 ±30% 넘게 변한 날: ${days.length ? days.map(d => kd(d, asOf)).join(' · ') : '있음'}${words}`, '그날에서 20거래일이 지나거나 기업행사로 확인되면');
  return mk('ca', 'pass', data, `하루 ±30% 넘게 변한 날 없음${words}`, AGAIN);
}
/** 분석 입력 = 1년 추세 두 개(오늘 · 20거래일 전)를 모두 셀 수 있나 — 오늘 · 20 · 40 · 252 · 272거래일 전 종가(후보 셈 trendOf 와 같은 기준 날)
 *   오늘 것 = flags 넷째 글자 · 20거래일 전 것 = cand.grow.m[code][1](없으면 「새로 든 초입」을 잘못 셀 수 있어 보류 — 2026-10-10 계획 검토 4번) */
function historyCheck(s, asOf, cand, th) {
  const data = '1년 가격 기록(오늘 · 20 · 40 · 252 · 272거래일 전 종가)', f = cand?.flags?.[s.code], m = cand?.grow?.m?.[s.code]; // FLAGS5 여섯 글자 — 넷째 = 1년 추세 셈(모양이 다르면 읽지 않고 보류)
  const now = typeof f === 'string' && f.length === 6 && f[3] === '1', prev = Array.isArray(m) && fin(m[1]);
  if (now && prev) return mk('history', 'pass', data, '1년 추세 두 개(오늘 · 20거래일 전) 셈 가능', AGAIN);
  if (!dayClose(s, asOf)) return mk('history', 'hold', data, '그날 종가가 없어 1년 추세를 셀 수 없음', closeAgain(s)); // 까닭은 기록 길이가 아니라 그날 종가
  const value = now ? '20거래일 전 1년 추세를 셀 수 없음 — 종가 기록이 272거래일보다 짧거나 그 기준 날이 빔'
    : typeof f === 'string' && f.length === 6 ? '1년 추세를 셀 수 없음 — 1년 종가 기록이 모자라거나 빈 날이 있음' : cand?.ready === false ? '1년 추세 셈 전 — 판 전체 가격 기록이 모자람' : '1년 추세 셈 결과 없음';
  return mk('history', 'hold', data, value, `종가 기록이 ${th.historyDays}거래일(1년 252 + 20) 차면 다시 봄`);
}
const liquidityCheck = () => mk('liquidity', 'na', '20거래일 거래대금', '20거래일 거래대금 자료 없음 — 수집 먼저', '거래대금 자료를 모으면 다시 봄');
function profitCheck(s) {
  const f = s.fund ?? {}, data = '마지막 결산(영업이익 · 순이익)';
  if (fin(f.op) && fin(f.net)) {
    const w = v => (v > 0 ? '흑자' : v < 0 ? '적자' : '0');
    const value = `영업이익 ${w(f.op)} · 순이익 ${w(f.net)}(${fyK(f.fy)})`;
    return f.op > 0 && f.net > 0 ? mk('profit', 'pass', data, value, '새 결산이 나오면 다시 봄') : mk('profit', 'out', data, value, '새 결산에서 둘 다 흑자가 되면 다시 봄');
  }
  const miss = [!fin(f.op) && '영업이익', !fin(f.net) && '순이익'].filter(Boolean).join(' · ');
  return mk('profit', 'hold', data, `결산 자료 모자람 — ${miss} 없음`, '결산 자료가 들어오면 다시 봄');
}
function riskCheck(s, {place, asOf, agendaByCode, windowFrom, cutoff, th}) {
  if (place !== 'kr') return mk('risk', 'hold', `회사 공시(${place === 'us' ? '미국' : '이'} 판은 아직 모으지 않음)`, place === 'us' ? RISK_UNKNOWN : '확인 못 함 — 이 판은 회사 공시 원문 자료가 없음',
    place === 'us' ? 'SEC 공시(8-K) 자료를 모으면 다시 봄' : '회사 공시 자료를 모으면 다시 봄');
  const data = `지난 ${th.windowDays}일 회사 공시(그날 장 마감 전까지)`, a = agendaByCode?.[s.code] ?? null;
  if (!asOf || !a || !Array.isArray(a.disclosures) || (a.missing ?? []).includes('공시')) return mk('risk', 'hold', data, '이 회사 공시 목록을 못 읽음', '공시 목록이 들어오면 다시 봄');
  const j = judgeOf({s, a, asOf, windowFrom, cutoff, place: 'kr'}); // 후보 셈과 같은 판단(30일 · 마감 전 · 우선주 공시는 이 회사 것 아님)
  if (j.excl) return mk('risk', 'out', data, `${kd(day(j.excl.publishedAt), asOf)} 「${j.excl.title}」`, '해제 공시 확인');
  const notes = [j.afterBad && EXCLUDE_RE.test(j.afterBad.title) ? `장 마감 뒤 공시 「${j.afterBad.title}」 — 다음 판에서 셈` : null, j.pref ? `우선주 공시 「${j.pref.title}」 — 이 회사 것으로 보지 않음` : null].filter(Boolean);
  return mk('risk', 'pass', data, ['위험 공시 없음', ...notes].join(' · '), AGAIN);
}

/* ── 2단(몬테카를로 · 그 회사 줄) ── */
function mcChecks(row, {on, why, th, cal, flags}) {
  const data = '이번 회차 몬테카를로 결과';
  if (!row) {
    const value = on ? '이 회사 경로 셈 없음' : `이번 회차 몬테카를로 결과 없음${why ? ` — ${why}` : ''}`;
    return [mk('paths', 'hold', `${data}(경로 수)`, value, '다음 회차 몬테카를로'), mk('converge', 'hold', `${data}(오차)`, value, '다음 회차 몬테카를로'),
      mk('tail', cal ? 'hold' : 'na', `${data}(가장 나쁜 5% 경로 평균)`, value, '다음 회차 몬테카를로')];
  }
  const {n, nonfinite: nf} = row, pathsOk = fin(n) && n >= th.minPaths && nf === 0;
  const short = [fin(n) && n < th.minPaths ? `${num(th.minPaths)}개보다 적음` : null, fin(nf) && nf > 0 ? '숫자가 아닌 경로가 있음' : null, !fin(n) || !fin(nf) ? '경로 수 자료가 모자람' : null].filter(Boolean);
  const paths = mk('paths', pathsOk ? 'pass' : 'hold', `${data}(경로 수)`, `경로 ${fin(n) ? `${num(n)}개` : '수 없음'} · 숫자가 아닌 경로 ${fin(nf) ? `${num(nf)}개` : '수 없음'}${short.length ? ` — ${short.join(' · ')}` : ''}`,
    pathsOk ? '회차마다 다시 셈' : '다음 회차에 다시 셈');
  const sp = row.se?.ploss, sc = row.se?.cvar5, conv = fin(sp) && fin(sc) && sp <= th.maxSe && sc <= th.maxSe;
  const converge = mk('converge', conv ? 'pass' : 'hold', `${data}(오차)`, fin(sp) && fin(sc) ? `손실 비율 오차 ${pp(sp)} · 나쁜 5% 평균 오차 ${pp(sc)}(기준 ${pp(th.maxSe)} 이하)` : '오차 값 없음',
    conv ? '회차마다 다시 셈' : fin(sp) && fin(sc) ? '추가 배분 뒤' : '다음 회차에 다시 셈');
  const cv = row.cvar5, tdata = `${data}(가장 나쁜 5% 경로 평균)`;
  let tail;
  if (!fin(cv)) tail = mk('tail', cal ? 'hold' : 'na', tdata, '가장 나쁜 5% 경로 평균 값 없음', '다음 회차 몬테카를로');
  else {
    const low = cv < th.tail; if (low) flags.push('tail');
    const value = `가장 나쁜 5% 경로 평균 ${pc(cv)}(기준 ${pc(th.tail, 0)})${low ? ' — 기준보다 나쁨' : ''}${cal ? '' : ' · 지금은 표시만'}`;
    tail = cal ? mk('tail', low ? 'hold' : 'pass', tdata, value, low ? '나쁜 5% 평균이 기준 위로 오면 다시 봄' : '회차마다 다시 셈')
      : mk('tail', 'na', tdata, value, '모형이 별도 구간 시험을 통과하면 이 기준으로 보류');
  }
  return [paths, converge, tail];
}

/**
 * 판 전체 → lens.elim(atlas11-elim-1)
 *   stocks = 판 읽기 종목(code · name · status · date · close · lag · jumps · cas · fund{op, net, fy}) · cand = 후보 셈(flags[code] 6글자 = FLAGS5 · window.cutoff)
 *   agendaByCode = 일정표 byCode(한국 공시 · 없으면 null → 위험 공시 보류) · mc = 몬테카를로 {asOf, rows:[{code, n, nonfinite, se{ploss, cvar5}, cvar5}]} 또는 null
 *   calibrated = 모형이 별도 구간 시험을 통과했나(true 값 하나만 · 그 전에는 하락 위험을 표시만)
 */
export function elimOf({place, asOf, at, stocks, cand, agendaByCode = null, mc = null, calibrated = false, rules = ELIM_RULES} = {}) {
  const th = rules.thresholds, cal = calibrated === true;
  const windowFrom = asOf ? plusDays(asOf, -th.windowDays) : null;
  const cutoff = cand?.window?.cutoff && cand.window.to === asOf ? cand.window.cutoff : asOf ? cutoffOf(asOf) : null; // 후보 셈과 같은 마감 시각(없으면 한국 15:30)
  // 몬테카를로 — 같은 기준일 결과만(판 읽기가 이미 맞대지만 한 번 더) · 없으면 왜 없는지
  const mcOn = !!mc && !mc.none && Array.isArray(mc.rows) && !(mc.asOf && asOf && mc.asOf !== asOf);
  const why = mcOn || !mc ? null : mc.none ? mc.why ?? null : !Array.isArray(mc.rows) ? '결과 줄 없음' : `몬테카를로 기준일(${kd(mc.asOf, asOf)})이 판 기준일(${kd(asOf, asOf)})과 다름`;
  const byCode = mcOn ? new Map(mc.rows.filter(r => r?.code != null).map(r => [String(r.code), r])) : null;
  const rows = (Array.isArray(stocks) ? stocks : []).filter(s => s?.code != null).map(s => {
    const flags = [];
    const checks = [closeCheck(s, asOf), staleCheck(s, asOf), caCheck(s, asOf, place), historyCheck(s, asOf, cand, th), liquidityCheck(), profitCheck(s),
      riskCheck(s, {place, asOf, agendaByCode, windowFrom, cutoff, th}), ...mcChecks(byCode?.get(String(s.code)) ?? null, {on: mcOn, why, th, cal, flags})];
    const state = checks.some(c => c.verdict === 'out') ? 'out' : checks.some(c => c.verdict === 'hold') ? 'hold' : 'pass';
    return {code: s.code, name: s.name ?? null, state, first: checks.find(c => c.verdict === 'hold' || c.verdict === 'out')?.id ?? null, flags, checks};
  });
  const counts = {pass: 0, hold: 0, out: 0}; for (const r of rows) counts[r.state]++;
  return {schema: ELIM_SCHEMA, rules: rules.id, at: at ?? null, place: place ?? null, asOf: asOf ?? null, calibrated: cal, counts, rows};
}
