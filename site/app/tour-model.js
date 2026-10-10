/* ATLAS 11 · 첫 화면 「후보 7」 저절로 둘러보기 — 셈과 글만(화면 없음 · 다른 모듈을 읽지 않음 · node 시험 tests/atlas11/tour.test.mjs)
   규칙 49 ④ — 사장님 2026-10-10 05:14(마카오) 「4너에제안대로 해」 · 설계 보고 ④ 「자동 재생 8단계(지시서 순서)」
   회사마다 8걸음: 기(① 고르기 · ② 핵심 숫자) → 승(③ 가장 큰 근거) → 전(④ 반대 요인 · 함께 움직이는 곳 · ⑤ 시뮬레이션 요약 · ⑥ 소거 까닭) → 결(⑦ 판단과 다음 확인 · ⑧ 다음 회사)
   · 숫자는 모두 판 읽기(lens.cand · lens.mc · lens.elim · lens.stocks)에서 — 값이 없으면 「없음 — 까닭」(지어내지 않음)
   · 몬테카를로 숫자 곁에는 늘 「모형 가정 아래 추정 · 검증 전」(사장님 「1예측한다」 승인의 조건) · 평균은 싣지 않음(기울기 0 모형의 평균 차례는 흔들림 차례와 닮음 0.92 — 설계 보고 ⑤)
   · 앞날 말 · 권유 말 없음(사라 · 팔라 · 추천 · 목표가 …) · 회사 사이 원인(원가 · 환율 · 거래처) 자료는 없어 같은 업종만 보임 */
const fin = v => typeof v === 'number' && Number.isFinite(v);

export const TOUR_STEPS = Object.freeze([['기', '고르기'], ['기', '핵심 숫자'], ['승', '가장 큰 근거'], ['전', '반대 요인 · 함께 움직이는 곳'], ['전', '시뮬레이션 요약'], ['전', '소거 까닭'], ['결', '판단과 다음 확인'], ['결', '다음 회사']]);
export const KSS = Object.freeze([['기', '선택'], ['승', '근거'], ['전', '따져 봄'], ['결', '확인']]); // 2026-10-10 13:51 다섯 팀 검토(클로드팀) — 「승 · 납득」 「결 · 결정」은 사게 하는 차례로 읽힘 → 근거 · 확인(걸음 내용 「판단과 다음 확인」과 같은 뜻) · 「전 · 검증」은 쉬운 말 화면에서 「검증」 조각이 아래 탭 이름 틀(지난 결과)로 바뀌어 뜻이 틀어짐 → 따져 봄
export const MC_TAG = '모형 가정 아래 추정 · 검증 전';
const ST = {met: '그물 안', wait: '그물 밖', recheck: '재검토'};
const ELIM_ST = {pass: '통과', hold: '보류', out: '제외'};
export const MARK = Object.freeze({pass: '✓', hold: '△', out: '✕', na: '·'});

/** 비율 → 「+12.3%」(0 이면 부호 없음 · 사이트 숫자 꼴) */
export const pctR = (v, d = 1) => { if (!fin(v)) return '값 없음'; const a = Math.abs(v * 100).toFixed(d); return `${Number(a) === 0 ? '' : v > 0 ? '+' : '−'}${a}%`; };
/** 이미 % 단위 값 → 「+165.2%」 */
export const pct1 = v => (fin(v) ? `${Number(Math.abs(v).toFixed(1)) === 0 ? '' : v > 0 ? '+' : '−'}${Math.abs(v).toFixed(1)}%` : '셀 수 없음');
/** 비율 → 부호 없는 몫 「52.6%」(손실 경로 몫) */
export const shareR = v => (fin(v) ? `${(v * 100).toFixed(1)}%` : '값 없음');
const md = d => { const m = String(d ?? '').match(/^\d{4}-(\d{2})-(\d{2})/); return m ? `${Number(m[1])}월 ${Number(m[2])}일` : '날짜 없음'; };
const int = n => (fin(n) ? Math.round(n).toLocaleString('ko-KR') : '값 없음');
const m12Of = x => (fin(x?.grow?.m12D) ? x.grow.m12D : fin(x?.grow?.m12) ? x.grow.m12 : null);
/** 글 조각 → 읽는 글(소리 · 시험) — {r: 비율} · {m: 셈 틀 비율} · {p: %} 숫자는 사이트 숫자 꼴로 */
export const plainOf = parts => parts.map(s => (typeof s === 'string' ? s : 'r' in s ? pctR(s.r) : 'm' in s ? pctR(s.m) : 'p' in s ? pct1(s.p) : '')).join('');

/**
 * 둘러보기 한 판 — C = lens.cand · mc = lens.mc(없으면 {none, why}) · elim = lens.elim · stocks = lens.stocks · us = 미국 판(위험 공시 자료 없음)
 * 반환 null(후보 없음) 또는 {items: [{code, rank, name, steps: [8걸음]}]}
 *   걸음 = {k(기승전결), name, title, lines: [[글 조각 …]], note, act(그림 손잡이 'to' 고름 | 'rise' 막대가 20거래일 전 길이 → 오늘 길이 | 'wave' 같은 업종 후보 줄에 테 | null), peers(같은 업종 기호), fan(범위 띠), checks(소거 검사), ms(머무는 시간)}
 */
export function tourOf({C, mc = null, elim = null, stocks = [], us = false} = {}) {
  const xs = C?.ready ? (C.items ?? []) : [];
  if (!xs.length) return null;
  const mcOk = !!mc && !mc.none, rowOf = new Map(mcOk ? (mc.rows ?? []).map(r => [String(r.code), r]) : []), bands = mcOk && mc.bands ? mc.bands : {};
  const elOk = !!elim && !elim.none, elOf = new Map(elOk ? (elim.rows ?? []).map(r => [String(r.code), r]) : []);
  const days = mcOk && Array.isArray(mc.track?.days) ? mc.track.days : null, H = days?.at(-1) ?? 60;
  const uni = C.pool?.universe ?? stocks.length, net = C.netPct ?? 20, hold = C.hold ?? 60, q = C.grow?.qD ?? null, next = C.grow?.planted?.next ?? null, planted = C.grow?.planted?.at ?? null;
  const items = xs.map((x, k) => {
    const code = String(x.code), R = rowOf.get(code) ?? null, B = bands[code] ?? null, E = elOf.get(code) ?? null, m12 = m12Of(x);
    const peerS = x.g == null ? [] : stocks.filter(s => String(s.g) === String(x.g) && String(s.code) !== code);
    const peerTxt = peerS.length ? `${peerS.slice(0, 4).map(s => s.name).join(' · ')}${peerS.length > 4 ? ` 외 ${peerS.length - 4}곳` : ''}` : '';
    const nx = xs[k + 1] ?? null, last = !nx;
    const steps = [
      {title: `${x.rank}위 · ${x.name}`, lines: [[`미리 정한 규칙 차례 ${x.rank}번째 · 1년 추세 `, {p: m12}, ` · ${x.sector ?? '업종 없음'}`]], act: 'to'},
      R ? {title: `60거래일 뒤 범위 · ${MC_TAG}`, lines: [['경로 100번 중 80번이 ', {m: R.q10}, ' ~ ', {m: R.q90}, ' 사이 · 가운데 값 ', {m: R.median}], [`손실로 끝난 경로 100번 중 ${fin(R.ploss) ? Math.round(R.ploss * 100) : '?'}번 · 가장 나쁜 5% 경로 평균 `, {m: R.cvar5}]], // 셈 틀 숫자는 ▲▼ · 빨강 · 파랑 없이(2026-10-10 18:22 다섯 팀 전체 검토)
        note: `경로 ${int(R.n)}개 · 평균 기울기 0 · 지난 500거래일 하루 움직임을 다시 뽑아 이은 경로 · 평균은 싣지 않음`}
        : {title: `60거래일 뒤 범위 · ${MC_TAG}`, lines: [[`이번 회차 범위 없음 — ${mcOk ? '이 회사 행이 없음' : mc?.why ?? '몬테카를로 결과 없음'}`]]},
      {title: '가장 큰 근거 하나', lines: [['1년 추세 ', {p: m12}, ` — ${uni}곳 가운데 상위 ${net}% 그물(기준선 `, {p: q}, ')'], [`${md(x.grow?.plantedAt)} 담을 때 새로 든 초입(그 20거래일 전에는 그물 밖)`]], act: 'rise'},
      {title: '반대 요인과 함께 움직이는 곳', lines: [[`가장 큰 위험: ${x.risk?.text ?? '자료 없음'}`], [peerS.length ? `같은 업종 ${peerS.length}곳(${peerTxt}) — 같은 사건에 함께 흔들릴 수 있음` : '같은 업종 회사 없음']],
        note: '회사 사이 원인(원가 · 환율 · 거래처) 자료는 아직 없음 — 지금은 같은 업종만 보임(지어내지 않음)', act: 'wave', peers: peerS.map(s => String(s.code))},
      B && days ? {title: `시뮬레이션 요약 · ${MC_TAG}`, lines: [], fan: {days, q: B.q, rep: B.rep, n: B.n, H},
        note: `옅은 띠 = 가운데 80% · 진한 띠 = 가운데 50% · 굵은 선 = 가운데 값 · 점선 3개 = 대표 경로(끝값이 아래 10% · 가운데 · 위 10% 자리에 가장 가까운 실제 경로 하나씩 — 전체 결과 아님) · 경로 ${int(B.n)}개`}
        : {title: `시뮬레이션 요약 · ${MC_TAG}`, lines: [[mcOk ? '이 회사 범위 띠 없음 — 이번 회차에 띠를 세지 않음' : `범위 띠 없음 — ${mc?.why ?? '몬테카를로 결과 없음'}`]]},
      E ? {title: E.state === 'pass' ? '소거 기준을 모두 넘음' : `${ELIM_ST[E.state] ?? '판정'} — ${E.state === 'hold' ? '자료가 없어 확인 못 한 것' : '처음 걸린 것'}: ${E.checks?.find(c => c.id === E.first)?.label ?? E.first ?? '없음'}`, // 보류 = 나쁜 것이 있었다가 아니라 확인 못 함(2026-10-10 18:22 다섯 팀 전체 검토)
        lines: E.state === 'pass' ? [] : [[E.checks?.find(c => c.id === E.first)?.value ?? '까닭 없음']],
        checks: (E.checks ?? []).map(c => ({id: c.id, label: c.label, verdict: c.verdict, mark: MARK[c.verdict] ?? '·', value: c.value})),
        note: (E.flags ?? []).includes('tail') ? '하락 위험(가장 나쁜 5% 평균이 −50%보다 나쁨)은 모형 시험 통과 전이라 표시만 — 판정에 넣지 않음' : '· = 자료가 없어 판정에 넣지 않은 검사'}
        : {title: '소거 판정 없음', lines: [[`소거 판정 없음 — ${elim?.why ?? '판 읽기에 소거 결과가 없음'}`]]},
      {title: '지금 판단과 다음 확인', lines: [[`상태: ${ST[x.status] ?? '후보 아님'} · 소거 ${ELIM_ST[E?.state] ?? '판정 없음'}`],
        ['유지 조건: 그물 안(1년 추세가 기준선 ', {p: q}, us ? ' 위) · 흑자 · 위험 공시는 확인 못 함(미국 판 공시 자료 없음)' : ' 위) · 흑자 · 위험 공시 없음'],
        [`바뀌는 조건: 그물 밖 · 적자 · 위험 공시 — 석 달(${hold}거래일)은 담아 두고 다음 담는 날 정리`],
        [`다음 확인: 다음 담는 날(${next ? md(next) : `${md(planted)}부터 ${hold}거래일 뒤`}) · 범위와 판정은 회차마다 다시 셈`]]},
      {title: last ? '한 바퀴 끝' : '다음 회사', lines: [[last ? `${xs.length}곳을 다 봤어요 — 처음(1위 ${xs[0].name})으로 돌아가 멈춤` : `다음은 ${nx.rank}위 · ${nx.name} — 같은 8걸음으로 봅니다`]]},
    ].map((s, i) => ({k: TOUR_STEPS[i][0], name: TOUR_STEPS[i][1], note: null, act: null, ...s}));
    for (const s of steps) s.ms = dwellOf(s);
    return {code, rank: x.rank, name: x.name, steps};
  });
  return {items, H};
}

/** 읽을 시간(ms) — 글 길이 · 그림 손잡이(고르기 0.9초 · 막대 자람 1.1초 · 같은 업종 테 1.2초) · 범위 그림 1.5초 · 3.8 ~ 10초(설계 보고 ④ 시안과 같은 셈) */
export function dwellOf(s) {
  const n = [s.title, ...s.lines.map(plainOf), s.note ?? ''].join(' ').length + (s.checks ? 40 : 0);
  const move = s.act === 'to' ? 900 : s.act === 'rise' ? 1100 : s.act === 'wave' ? 1200 : s.fan ? 1500 : 0;
  return Math.min(10000, Math.max(3800, 1400 + n * 70)) + move;
}
/** 읽는 글(소리로 듣기 · 화면 읽기) — 제목 · 줄 · 소거 검사 · 덧말 */
export const speakOf = s => [s.title, ...s.lines.map(plainOf), ...(s.checks ?? []).map(c => `${c.label} ${c.verdict === 'pass' ? '통과' : c.verdict === 'hold' ? '보류' : c.verdict === 'out' ? '제외' : '판정 안 함'}`), s.fan ? '범위 그림' : '', s.note ?? ''].filter(Boolean).join('. ');

/** 범위 띠 그림 자리(SVG 좌표 · 글자 없음 — 이름은 HTML) — 폭 W · 높이 Hh · 위아래 여유 · y 는 10% 눈금으로 넓힘(0% 늘 포함) */
export function fanOf(F, {W = 320, Hh = 150, pad = 8} = {}) {
  const days = F?.days, q = F?.q, rep = Array.isArray(F?.rep) ? F.rep : [];
  if (!Array.isArray(days) || !Array.isArray(q) || q.length !== days.length || !days.length) return null;
  const vals = [0];
  for (const r of q) for (const v of r) if (fin(v)) vals.push(v);
  for (const p of rep) for (const v of p.path ?? []) if (fin(v)) vals.push(v);
  let lo = Math.floor(Math.min(...vals) * 10) / 10, hi = Math.ceil(Math.max(...vals) * 10) / 10;
  if (hi - lo < 0.2) { hi += 0.1; lo -= 0.1; }
  const Hd = days.at(-1) || 1, X = d => pad + (d / Hd) * (W - 2 * pad), Y = v => pad + ((hi - v) / (hi - lo)) * (Hh - 2 * pad), f = v => Math.round(v * 10) / 10;
  const band = (a, b) => [...days.map((d, i) => `${f(X(d))},${f(Y(q[i][a]))}`), ...[...days.keys()].reverse().map(i => `${f(X(days[i]))},${f(Y(q[i][b]))}`)].join(' ');
  return {W, Hh, lo, hi, zero: f(Y(0)), b80: band(0, 4), b50: band(1, 3), mid: days.map((d, i) => `${f(X(d))},${f(Y(q[i][2]))}`).join(' '),
    reps: rep.map(p => ({f: p.f, end: p.end, pts: (p.path ?? []).map((v, d) => `${f(X(d))},${f(Y(v))}`).join(' ')})),
    ticks: [hi, 0, lo].filter((v, i, a) => a.indexOf(v) === i).map(v => ({v, y: f(Y(v)) / Hh}))};
}
