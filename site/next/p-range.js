/* 새 아틀란스 7단 「범위 · 확인」(#/w/<번호>/range) — 지금 아틀란스 site/atlas/atlas.js viewRange 를 새 화면으로 옮김
   (사장님 2026-10-17 04:04(싱가포르) 「첫화면 부터 마지막 페이지 까지 모두 바꿔」 · 04:23 「에이전트 총 동원해」 · 규칙 74)
   셈은 옛 쪽 그대로 — 끝은 「사기」가 아니라 「확인」 · 「모형 가정 아래 추정 · 검증 전」은 숫자 바로 위 ·
   모형 막대는 오름 · 내림 색(빨강 · 파랑)을 쓰지 않음(규칙 53 — 번 길 = 진주 빗금 · 크게 잃는 길 = 금빛 빗금 · 조심) · 고른 목록 · 차례 없음(규칙 55)
   2026-10-18 사장님 명령문 72개 [7] 6 · [8] 10 · [10] 4 ~ 8 (일꾼 S4r):
   ① 맨 위 요약 두 줄 「10번 중 n~m번」(번 길 · 크게 잃는 길 — 방향 넷의 가장 작은 값 ~ 가장 큰 값) · 막대 글도 「10번 중 n번」 — 퍼센트 · 소수점은 접은 칸(전문가용)으로
   ② 「몬테카를로」 · 「가운데값」 · 흰 눈금 · 소수점 숫자는 접은 칸(details.prange-pro)에만 — 옛 그림(막대 길이 = range.json 값 · 흰 눈금 = 가운데값)은 거기 그대로
   ③ 「셈에 넣은 것」 한 줄(range.json window · dirs · paths) · 채점 칸 하나(정한 날 = core.mcEnd · 안 지났으면 「?」 + D-n · 지났으면 그날 실제 값으로 번 길 · 크게 잃는 길 · 모형 범위 안인지)
   ④ 확인표의 돈 · 배 · % 도 소수점 없이(조 원은 「32조 7,000억 원」 · 100조 넘으면 정수 조) — 같은 반올림으로 옛 글과 맞댐(check_range.mjs)
   ⑤ 글씨 --fs-1 ~ --fs-4 · 간격 --sp-1 ~ --sp-3 · 음수 여백 · 겹침 없음 · 글 시작 왼쪽 줄 16 · 32 · 48 · 낱말은 새 낱말(갈래 → 큰 업종 · 몸값 → 회사 크기 · 20거래일 → 한 달)
   옛 쪽과 일부러 다르게 한 것(전에 한 것):
   ① 고른 곳 밖 회사의 「… 20일을 뽑아 n번」 = range.json spec.others.paths — 옛 쪽은 고른 곳 경로 수(spec.paths)를 모든 회사에 보였음(고른 곳 밖은 range_mc.py 가 따로 · 적게 뽑음)
   ② 「업데이트 기록」(도움말 ?) → 「업데이트 기록」 고리(#/up) — 새 화면에는 도움말 ? 단추가 없음
   ③ 맨 아래 안내의 「매수 · 매도 · 보유」 → 「사고팔기 · 계속 갖고 있기」(쓰지 않을 말 · 뜻 같음)
   ④ 옛 「3단 회사로 · 처음 화면으로」 줄 → 다음 챕터 고리(회사로 돌아가기) · 아래 홈 단추 / 옛 맨 아래 꽃밭 · 친구 소개 · 미국 판 고리 → 새 화면 아래 단추
   ⑤ 자료를 못 받은 날: 회사 파일 → 「? 회사 자료를 받지 못했어요」(옛 쪽은 「없는 주소입니다」) · 범위 파일 → 이름 · 챕터 + 「? 범위 자료를 받지 못했어요」 ·
      바탕 · 고른 곳 파일 → 「? 자료를 받지 못했어요」(옛 쪽은 둘 다 「자료를 못 읽었습니다」 한 화면)
   ⑥ 정직 표지(옛 「모형 가정 아래 추정 · 검증 전 — …」)는 쉬운 말로 쪽 맨 위(제목 바로 밑 · 사장님 2026-10-22 04:09 총정리 C17) · 7단 끝에 「사기 전에 · 이 회사로 왜 사? ›」(C18)
   검사 scripts/atlas11/next/check_range.mjs — 옛 쪽과 같은 회사로 글 · 숫자 · 막대 길이 · 가운데값 맞대기 · 세 폭 */
const NX = globalThis.NX;
const {h, r1} = NX;
const NBSP = ' ';

/* 숫자 · 말 — 옛 atlas.js 그대로(날짜는 붙임 띄어쓰기 · 「10월 / 13일」로 갈라지지 않게) · 소수점은 접은 칸 밖에 없음(2026-10-18 [10] 4) */
const md = d => { const p = String(d).split('-'); return (+p[1]) + '월' + NBSP + (+p[2]) + '일'; };
const ymd = d => String(d).slice(0, 4) + '년 ' + md(d);
const rd = x => Math.sign(x) * Math.floor(Math.abs(x) + 0.5 + 1e-7); // 크기로 반올림(−12.5 → −13) — 옛 r1 와 같은 뜻
const fmt = n => n.toLocaleString('ko-KR');
/** 소수점 없는 % — 옛 pct 는 100% 밑에서 한 자리 · 여기서는 한 자리를 먼저 맞춘 뒤(옛 글과 같은 값) 정수로 */
const p0 = x => { if (x == null || !isFinite(x)) return '?'; const v = rd(r1(x)); return (v > 0 ? '+' : v < 0 ? '−' : '') + fmt(Math.abs(v)) + '%'; };
const x0 = v => fmt(rd(r1(v))); // 몇 배(정수)
/** 회사 글(파는 것) 속 소수점 %도 정수로(「65.2%」 → 「65%」 · 「30.05%」 → 「30%」) — 접은 칸 밖에는 소수점이 없음([10] 4 · 쿠콘 294570 처럼 회사 글에 소수점이 든 곳) */
const prodDec = s => String(s).replace(/(\d[\d,]*)\.(\d+)%/g, (_, a, b) => fmt(rd(Number(a.replace(/,/g, '') + '.' + b))) + '%');
/** 억 원 · 조 원 — 100조 밑은 「32조 7,000억 원」(옛 한 자리 소수와 같은 값 · 영어 엔진이 아는 꼴) · 100조 넘으면 정수 조 */
function eok(v) {
  if (v == null) return '?';
  const s = v < 0 ? '−' : '', a = Math.abs(v);
  if (a >= 1e4) { const t = r1(a / 1e4); if (t >= 100) return s + fmt(Math.floor(t + 0.5 + 1e-7)) + '조 원'; const k = Math.round(t * 10), cho = Math.floor(k / 10), ch = k % 10; return s + cho + '조' + (ch ? ' ' + fmt(ch * 1000) + '억' : '') + ' 원'; }
  return s + fmt(Math.round(a)) + '억 원';
}
const won = v => (v == null ? '?' : fmt(Math.round(v)) + '원');
function fy(p) { if (!p) return '?'; const [y, m] = p.replace('E', '').split('.'); return y + '년' + (m && m !== '12' ? '(' + (+m) + '월 결산)' : ''); }
function josa(w, a, b) { const ch = String(w).trim().slice(-1), k = ch.charCodeAt(0) - 0xAC00; if (k < 0 || k > 11171) return w + a + '(' + b + ')'; return w + (k % 28 ? a : b); }
const NP = C => C?.funnel?.picked ?? '?';
const pickName = C => `${C?.rules?.name ?? '고른'} ${NP(C)}곳`;
const lyDay = C => (C?.rules?.lyDay ? md(C.rules.lyDay) : '모음 날');
const pickHow = C => `멍거 갈래는 3년 성적표만, 린치 갈래는 3년 성적표와 ${lyDay(C)} 값으로 골랐습니다`; // 「갈래」 = 고르는 잣대 · 화면에서는 낱말표(glossary.js)가 「멍거 조건은 …」으로 바꿈
const pctEl = (x, tag = 'b') => h(tag, {class: 'prange-n ' + NX.cls(x), text: p0(x)});
/** 다음 회차(서울 시계) — 옛 nextSlot 그대로 */
const nextSlot = slots => { const k = new Date(Date.now() + 9 * 36e5), m = k.getUTCHours() * 60 + k.getUTCMinutes(), mm = x => +x.slice(0, 2) * 60 + +x.slice(3, 5), nx = slots.find(x => mm(x) > m); return nx ? nx : slots[0] + ' · 내일'; };
function dday(d) { const k = new Date(Date.now() + 9 * 36e5), t = Date.UTC(k.getUTCFullYear(), k.getUTCMonth(), k.getUTCDate()); const [y, m, x] = d.split('-').map(Number); return Math.round((Date.UTC(y, m - 1, x) - t) / 864e5); }
const ddayText = d => { const n = dday(d); return n > 0 ? 'D-' + fmt(n) : n === 0 ? '오늘 엶' : '엶 날 지남 — 다시 셀 차례'; };
const stopSay = (C, r) => (C.funnel?.groups ?? []).map(g => `${g.name}은 「${g.stopName[g.k === 'mg' ? r.sm : r.sl] ?? '고르기'}」에서`).join(', ') + ' 멈췄습니다';
const coFile = code => 'co/' + encodeURIComponent(code) + '.json';

/** 회사인가 — 업종 회사 줄 모두(= 회사 파일이 있는 회사 · core.co7) · 없는 번호면 회사 파일을 받으러 가지 않음(404 오류 없게) */
let MEMC = null, MEM = null;
const isCo = (C, code) => { if (MEMC !== C) { MEMC = C; MEM = new Set((C.industries || []).flatMap(i => i.members || [])); } return MEM.has(code); };

/** 기록 · 조심 · 모름 줄(옛 확인표 li 그대로 — 표 · 화면 읽기 글 · 내용 차례) · 동그라미 안 글(· ! ?)은 꾸밈 글(::before)로 — 글 마디가 아님 */
const MARK = {ok: '·', no: '!', q: '?'}, SAY = {ok: '기록: ', no: '조심: ', q: '모름: '};
const mk = m => h('span', {class: 'prange-mk', 'aria-hidden': 'true', 'data-m': MARK[m]});
const li = (m, ...kids) => h('li', {class: 'prange-' + m}, mk(m), h('span', {class: 'prange-tx'}, h('span', {class: 'prange-sr', text: SAY[m]}), ...kids));
/** 지켜볼 날 줄(옛 그대로 — 화면 읽기 글 없음) */
const wli = (m, ...kids) => h('li', {class: 'prange-' + m}, h('span', {class: 'prange-mk', 'aria-hidden': 'true', 'data-m': m === 'ok' ? '·' : '?'}), h('span', {class: 'prange-tx'}, ...kids));
const inl = (href, text) => h('a', {class: 'prange-inl', href, text});
const outA = (href, text) => h('a', {class: 'prange-inl', href, rel: 'noopener', target: '_blank', text});
/** 줄 끝 고리 — 글 한가운데에 끼면 왼쪽 줄이 하나 더 생기므로(글 시작 왼쪽 줄 ≤ 3) 제 줄에서 시작하고, 앞의 「 · 」는 글 마디 그대로 두되 안 보이게(sep) */
const inlEnd = (href, text) => h('a', {class: 'prange-inl prange-end', href, text});
const sep = t => h('span', {class: 'prange-sep', text: t});

/* 10번 중 몇 번 — 퍼센트를 10으로 나눠 반올림(5% 밑 = 0번) · 요약은 방향 넷의 가장 작은 값 ~ 가장 큰 값 */
const T10 = v => rd(v / 10);
const ten = n => `10번 중 ${n}번`;
const tenRange = a => { const lo = Math.min(...a), hi = Math.max(...a); return lo === hi ? ten(lo) : `10번 중 ${lo}~${hi}번`; };
const med = a => { const x = a.slice().sort((p, q) => p - q), m = x.length; return m ? (m % 2 ? x[(m - 1) / 2] : (x[m / 2 - 1] + x[m / 2]) / 2) : null; };

/** 맨 위 요약 두 줄 — 번 길 · 크게 잃는 길 (모형 숫자 · 방향 넷 모두 합친 범위) */
function summary(k) {
  return h('div', {class: 'prange-sum'},
    h('p', {class: 'prange-s'}, h('span', {class: 'prange-sl', text: '번 길'}), h('b', {class: 'prange-sv', text: tenRange(k.win.map(T10))})),
    h('p', {class: 'prange-s prange-sneg'}, h('span', {class: 'prange-sl', text: '크게 잃는 길'}), h('b', {class: 'prange-sv', text: tenRange(k.big.map(T10))})),
    h('p', {class: 'prange-sc', text: '시장 방향 네 가지마다 달라서 범위로 적었어요 · 0번은 거의 없다는 뜻(5% 밑)이에요'}));
}
/** 그림 — 시장 방향 넷 × (번 길 · 크게 잃는 길) 막대 · 글 = 「10번 중 n번」 · 막대 길이 = range.json 값 % (옛 dirbars 와 같음) */
function chart(K, k) {
  const bar = (t, kind, v) => h('span', {class: 'prange-dl'},
    h('span', {class: 'prange-lb'}, h('span', {text: t}), h('b', {class: 'prange-n', text: ten(T10(v))})),
    h('span', {class: 'prange-tr', 'aria-hidden': 'true'}, h('i', {class: 'prange-b prange-' + kind, css: {width: v + '%'}})));
  const list = h('ul', {class: 'prange-dirs'});
  K.dirs.forEach((d, j) => list.append(h('li', {}, h('b', {class: 'prange-dn', text: d.name}), bar('번 길', 'pos', k.win[j]), bar('크게 잃는 길', 'neg', k.big[j]))));
  return h('div', {class: 'prange-chart'}, list);
}
/** 셈에 넣은 것 — range.json 의 window(지난 날 수 · 처음 · 끝) · dirs(방향 넷 · 날수) · paths(방향마다 뽑은 20일 길 수) 그대로 한 줄 */
function inputs(C, K, pk) {
  const S = K.spec, W = K.window, paths = pk ? S.paths : (S.others?.paths ?? S.paths);
  if (!W?.days || !Array.isArray(K.dirs) || paths == null) return null;
  const dirs = K.dirs.map(d => `${d.name} ${d.days}일`).join(' · ');
  return h('p', {class: 'prange-inp'}, h('b', {text: '셈에 넣은 것'}), ' ', h('span', {text: `지난 ${fmt(W.days)}거래일(${ymd(W.from)} ~ ${ymd(W.to)})을 네 가지 장(${dirs})으로 나눠, 장마다 ${S.horizon}일 길을 ${fmt(paths)}번 뽑았어요`}));
}
/** 채점 칸 하나 — 정한 날(core.mcEnd) · 안 지났으면 「?」 + D-n · 지났으면 그날 실제 값으로 번 길 · 크게 잃는 길 · 모형이 있을 수 있다고 한 일 안인지(들었나) */
export function scoreBox(C, K, k, days, co2) {
  const S = K.spec, d = C.mcEnd, box = h('div', {class: 'prange-score'}, h('b', {class: 'prange-sch', text: '채점'}));
  const q = (...kids) => h('p', {class: 'prange-qp'}, ...kids);
  if (!d) { box.append(q('? 정한 날이 아직 없어요')); return box; }
  box.append(h('p', {}, '정한 날 ', h('b', {text: ymd(d)})));
  const n = dday(d);
  if (n > 0) { box.append(q(h('span', {text: '? 아직 안 지났어요'}), ' · ', h('b', {class: 'prange-n prange-dd', text: 'D-' + fmt(n)})), h('p', {class: 'prange-sc', text: '그날이 되면 실제 값으로 채점해 여기에 적어요'})); return box; }
  const dt = days?.dates, cl = Array.isArray(co2?.close) ? co2.close : null, k0 = Number.isInteger(co2?.k0) ? co2.k0 : 0;
  const at = day => { const i = dt ? dt.indexOf(day) : -1; return i - k0 >= 0 && cl ? cl[i - k0] : null; };
  const a = at(K.asOf), b = at(d);
  if (!(a > 0 && b > 0)) { box.append(q('? 채점 못 함 — 그날 종가를 못 받았어요')); return box; }
  const r = (b / a - 1) * 100, win = r / 100 - S.profit > 0, big = r / 100 < S.bigLoss, wn = k.win.map(T10), bn = k.big.map(T10);
  const held = (win ? Math.max(...wn) >= 1 : Math.min(...wn) <= 9) && (big ? Math.max(...bn) >= 1 : Math.min(...bn) <= 9);
  box.append(h('p', {}, h('span', {text: '그날 실제'}), ' ', pctEl(r)), h('p', {}, h('span', {text: '번 길 ' + (win ? '예' : '아니오')}), ' · ', h('span', {text: '크게 잃는 길 ' + (big ? '예' : '아니오')})),
    h('p', {}, held ? '모형이 있을 수 있다고 한 일이었어요(들었음)' : '모형이 거의 없다고 한 일이 일어났어요(안 들었음)'),
    h('p', {class: 'prange-sc', text: '한 번의 결과라 모형이 맞다는 증거는 아니에요'}));
  return box;
}
/** 전문가용 접은 칸 — 옛 그림 그대로(소수점 % · 흰 눈금 = 고른 곳 가운데값 · 막대 이름표) · 몬테카를로 · 가운데값 글은 여기에만 */
function pro(C, K, k, pk) {
  const S = K.spec, okC = Object.values(K.companies).filter(x => x && x.ok);
  const bar = (t, kind, v, m) => h('span', {class: 'prange-dl'},
    h('span', {class: 'prange-lb'}, h('span', {text: t + ' '}), h('b', {class: 'prange-n', text: `${r1(v).toFixed(1)}%`})),
    h('span', {class: 'prange-tr', role: 'img', 'aria-label': `${t} ${r1(v).toFixed(1)}% · ${NP(C)}곳 가운데값 ${r1(m).toFixed(1)}%`},
      h('i', {class: 'prange-b prange-' + kind, css: {width: v + '%'}}), m == null ? null : h('i', {class: 'prange-m', css: {left: m + '%'}})));
  const list = h('ul', {class: 'prange-dirs'});
  K.dirs.forEach((d, j) => list.append(h('li', {}, h('b', {class: 'prange-dn', text: d.name}),
    bar('번 길', 'pos', k.win[j], med(okC.map(x => x.win[j]))), bar('크게 잃는 길', 'neg', k.big[j], med(okC.map(x => x.big[j]))))));
  const paths = pk ? S.paths : (S.others?.paths ?? S.paths); // ① 고른 곳 밖은 따로 뽑은 수
  return h('details', {class: 'prange-pro'}, h('summary', {text: '전문가용 · 정확한 값 보기'}), h('div', {class: 'prange-in'},
    h('p', {class: 'prange-xt', text: '몬테카를로 셈의 정확한 값이에요 — 소수점까지 · 흰 눈금은 고른 곳의 가운데값이에요'}),
    h('div', {class: 'prange-xchart'}, list),
    h('p', {class: 'prange-key'}, h('span', {}, h('i', {class: 'prange-sw prange-pos'}), '번 길'), h('span', {}, h('i', {class: 'prange-sw prange-neg'}), '크게 잃는 길'), h('span', {}, h('i', {class: 'prange-sw prange-med'}), `흰 눈금 = ${NP(C)}곳 가운데값`)),
    h('p', {class: 'prange-note', text: `방향마다 지난 날들에서 20일을 뽑아 ${fmt(paths)}번 — 번 길 = 사고팔 돈 0.3% 빼고 남음 · 크게 잃는 길 = −15% 밑 · 어느 방향이 올지는 모릅니다`})));
}

/** 봉인 줄 — 1호에 든 회사면 그날 종가 · 다시 셀 날 · 남은 날 */
function capLi(C, tm, code, pk) {
  const set = (m, ...kids) => wli(m, h('b', {text: '봉인 '}), ...kids);
  if (!C.time) return set('q', '? 봉인 자료가 없습니다');
  try {
    const Kc = tm?.capsules?.[0];
    if (!Kc) return set('q', '? 봉인 자료를 못 읽었습니다');
    const m = Kc.members.find(x => x[0] === code);
    if (m) return set('ok', `${Kc.id}호에 든 회사 — ${md(Kc.seal)} 종가 ${won(m[1])} 그대로 잠금 · 3년 뒤 ${ymd(Kc.opens[0].date)}에 다시 셉니다 `, h('b', {class: 'prange-n prange-dd', text: ddayText(Kc.opens[0].date)}), sep(' · '), inlEnd('#/time', '봉인 보기'));
    return set('ok', pk ? `${Kc.id}호(${md(Kc.seal)} 365곳)에는 없는 회사 — 그 뒤 고르는 기준이 바뀌어 새로 든 곳입니다` : `${Kc.id}호(${md(Kc.seal)} 365곳)에는 없는 회사입니다`, sep(' · '), inlEnd('#/time', '봉인 보기'));
  } catch { return set('q', '? 봉인 자료를 못 읽었습니다'); }
}

function foot(C) {
  return h('footer', {class: 'prange-foot'},
    h('p', {text: `자료: ${C.sources?.price ?? '?'} · 기준일 = 마지막 종가 날(${md(C.asOf)})의 한 달 전(${md(C.base)}) · ${pickName(C)} — ${pickHow(C)}(그 뒤 주가는 안 씀).`}),
    C.provisional ? h('p', {class: 'q', text: `? ${md(C.asOf)} 값은 그날 저녁 8시 전에 받아 아직 바뀔 수 있습니다(시간외 · 넥스트레이드) — 다음 받기에서 고쳐집니다.`}) : null,
    h('p', {text: '저는 투자 상담사가 아닙니다 · 이 자료는 지난 기록을 센 공부이며, 특정 종목의 사고팔기 · 계속 갖고 있기 또는 시장 전망을 권하지 않습니다.'}));
}

/** 깔때기(옛 funnel 그대로) — 없는 주소가 이름표에 있으면 두 갈래마다 어디서 멈췄나 */
function funnel(C, r) {
  const F = C.funnel, wrap = h('div', {class: 'prange-fun'});
  for (const g of F.groups ?? []) {
    const stop = r ? (g.k === 'mg' ? r.sm : r.sl) : null, at = stop ? (g.stop[stop] ?? g.steps.length) : g.steps.length;
    const ol = h('ol', {class: 'prange-fl'});
    g.steps.forEach((s, ix) => ol.append(h('li', {class: stop ? (ix < at ? 'prange-past' : ix === at ? 'prange-stop' : 'prange-no') : ''}, h('i', {class: 'prange-ff', css: {width: (s.n / F.universe * 100) + '%'}}),
      h('span', {}, h('b', {class: 'prange-n', text: fmt(s.n) + '곳'}), h('span', {text: s.t})))));
    wrap.append(h('p', {class: 'prange-fname'}, h('b', {text: `${g.name} ${g.n}곳`})), ol);
  }
  return wrap;
}
/** 없는 주소(옛 viewMissing 그대로) — 이름표에 있으면 이름 · 멈춘 자리 · 까닭 · 깔때기 */
async function missing(C, code) {
  const pn = pickName(C), head = h('h1', {class: 'wt prange-wt', text: '없는 주소입니다'});
  const say = h('p', {class: 'prange-say', text: code ? `「${code}」는 지금 ${pn}에 없습니다. 찾기로 이름을 쳐 보세요.` : '주소가 바뀌었거나 잘못 들어왔습니다.'});
  const nodes = [head, say];
  if (code) {
    const NM = await NX.getJson('names.json'), r = NM?.rows?.find?.(x => x.c === code);
    if (r) { head.textContent = `${r.n} — 지금 ${pn} 밖`; say.textContent = `${josa(r.n, '은', '는')} ${stopSay(C, r)} — 새 1년 성적표가 나오면 다시 셉니다.`; nodes.push(h('div', {class: 'prange-why', text: r.w}), funnel(C, r)); }
  }
  nodes.push(h('div', {class: 'prange-go'}, h('a', {href: '#/find', text: '찾기 ›'}), h('a', {href: '#/', text: '처음 화면으로'})), foot(C));
  return {title: head.textContent, nodes};
}

/** 정직 표지 — 쪽 맨 위 결 한 줄(사장님 2026-10-22 04:09 「결과부터 나오는 구조」 · 총정리 C17) · 숫자는 range.json window(지난 날 수) 그대로 · 못 읽으면 「지난 날들」
 *  옛 「모형 가정 아래 추정 · 검증 전 — 지난 날들을 다시 뽑아 본 셈일 뿐, 앞날 값이 아닙니다.」를 쉬운 말로(뜻 같음 · 맞대기 check_range SAME_BUT) · 「10번 중 n~m번」 꼴 · 줄 차례 · 머리 글은 그대로 */
function honest(K) {
  const n = K?.window?.days;
  return h('p', {class: 'prange-model', css: {'margin-top': 'var(--sp-1)'}}, h('b', {text: n ? `지난 ${fmt(n)}거래일을 다시 뽑아 본 셈이에요.` : '지난 날들을 다시 뽑아 본 셈이에요.'}), ' 한 달 뒤를 맞히는 숫자가 아니에요.');
}
/** 끝 칸 — 일곱 단을 다 읽은 사람에게 멈춤(본질 ② 「왜 사?」 열한 질문)을 먼저(총정리 C18) · 다음 챕터(회사로 돌아가기)는 그대로 둘째
 *  테마 길로 온 때는 chapNext 가 이미 「다음 단 · 사기 전에 ›」(#/why/<번호>)라 더하지 않음 · 새 고리는 .chap-next 가 아닌 a.more(다음 챕터 수 그대로) */
function nextBox(code) {
  const nx = NX.chapNext(code, '7'), why = '#/why/' + NX.enc(code);
  return h('div', {class: 'prange-next'}, nx?.getAttribute?.('href') === why ? null : h('a', {class: 'more prange-ask', href: why, text: '사기 전에 · 이 회사로 왜 사? ›', css: {'min-height': '52px', 'font-weight': '700'}}), nx);
}

export async function render(arg) {
  const code = String(arg ?? '').split('/')[0];
  const [C, , comp, K] = await Promise.all([NX.need('core'), NX.need('mkt'), NX.getJson('comp.json'), NX.getJson('range.json')]); // mkt = 챕터 일곱의 큰 업종 · 업종 고리(NX.ix)
  if (!C || !comp?.companies) return {title: '범위 · 확인', nodes: [h('h1', {class: 'wt prange-wt', text: '범위 · 확인'}), ...NX.noData()]};
  /** 회사인데 자료 한 조각을 못 받음 = 이름 · 챕터 · 「?」 줄(옛 쪽은 「없는 주소」 · 「자료를 못 읽었습니다」 한 화면) */
  const qPage = (nm, what) => ({title: nm + ' — 범위 · 확인', nodes: [h('h1', {class: 'wt prange-wt', text: nm + ' — 범위 · 확인'}), NX.chaps(code, '7'), ...NX.noData(what), nextBox(code)]});
  // 회사 하나 — 고른 곳 = comp.json · 고른 곳 밖 = co/<번호>.json 의 c(옛 coEntry 그대로 · c 와 line 이 있어야 회사)
  let E = null, co = null;
  if (comp.companies[code]) E = {c: comp.companies[code], pk: true};
  else if (C.co7 && isCo(C, code)) {
    co = await NX.getJson(coFile(code));
    if (!co) return qPage(NX.ix()?.co?.[code]?.n || code, '회사 자료');
    if (co.c && co.line) E = {c: co.c, pk: false};
  }
  if (!E) return missing(C, code);
  if (!K?.spec || !Array.isArray(K.dirs) || !K.companies) return qPage(E.c.name, '범위 자료');
  const [co2, days, upd, tm] = await Promise.all([E.pk ? NX.getJson(coFile(code)) : co, NX.getJson('days.json'), NX.getJson('updates.json'), C.time ? NX.getJson('time.json') : null]);
  const c = E.c, S = K.spec, k = E.pk ? K.companies?.[code] : K.others?.[code], g = (C.groups || []).find(x => x.id === c.g), ok = !!(k && k.ok);

  const nodes = [
    h('h1', {class: 'wt prange-wt', text: c.name + ' — 범위 · 확인'}),
    h('p', {class: 'ws prange-ws', text: `여기부터 다시 주가 · ${md(K.asOf)} 종가 · 한 달 뒤`}),
    honest(K), // 정직 표지 = 이 쪽의 결 — 제목 바로 밑(총정리 C17 · 「한 달 뒤」 머리 글 바로 다음에 맞히는 숫자가 아님을 먼저)
    NX.chaps(code, '7'),
    h('p', {class: 'prange-lv'}, h('b', {text: '7단 중 7단'}), ' · 범위 · 확인 ', h('span', {text: '· 셈'})), // 앎의 종류 — 7단은 셈
    h('h2', {class: 'sec prange-sec', text: '시장이 이렇게 가면 — ' + K.dirs.length + '방향'}),
  ];
  if (!ok) nodes.push(h('p', {class: 'prange-qline q', text: '? 셈 못 함 — 어느 한 방향에서 이 회사 값이 있는 날이 20일이 안 됩니다.'}));
  else nodes.push(summary(k), chart(K, k), inputs(C, K, E.pk), scoreBox(C, K, k, days, co2), pro(C, K, k, E.pk));

  // 확인표(옛 「사기 전에 볼 것」) — 기록으로 채울 수 있는 것만 · 「·」 기록 · 「!」 조심 · 「?」 모름
  const f = c.fin, fk = f ? (f.key === 'net' ? '순이익' : '영업이익') : '이익';
  const rec = f && f.av != null ? (f.bv > f.av ? 'ok' : 'no') : 'q';
  const dd = days?.dates, j1 = dd ? (co2?.jumps || []).filter(j => j[0] >= dd[Math.max(0, dd.length - 253)]) : [];
  const pm = C.facts?.perMedian;
  const chk = h('ul', {class: 'prange-chk'},
    li(rec, h('b', {text: '번 돈(기록) '}), f && f.av != null ? `${fk} ${fy(f.a)} ${eok(f.av)} → ${fy(f.b)} ${eok(f.bv)} · ${f.bv > f.av ? '늘었음' : '줄었음'}` : h('span', {class: 'q', text: '? 두 해 기록이 없음'})),
    li(c.mdd1y != null && c.mdd1y <= -50 ? 'no' : 'ok', h('b', {text: '지나온 1년 '}), '1년 ', pctEl(c.r1y, 'span'), ' · 1년 안 가장 깊이 빠짐 ', pctEl(c.mdd1y, 'span'),
      j1.length ? h('span', {class: 'q', text: ` · ? 하루에 30% 넘게 바뀐 날 ${j1.length}번(4단) — 주식 수가 바뀐 날이면 이 숫자는 틀릴 수 있음`}) : null),
    li(c.per != null ? 'ok' : 'q', h('b', {text: '회사 크기 '}), `시가총액 ${eok(c.cap)}`, c.per != null ? ` · 1년 순이익의 ${x0(c.per)}배${pm != null ? `(${NP(C)}곳 중간 회사는 ${x0(pm)}배)` : ''}` : h('span', {class: 'q', text: ' · 순이익 몇 배인지 ? 자료 없음'})),
    li('ok', h('b', {text: '1주 값 '}), `${won(c.price)}(${md(c.priceDate || C.asOf)} 종가) — 한 주의 값일 뿐, 싸고 비쌈이 아닙니다`),
    g ? li(g.low.below / g.n >= 0.8 ? 'no' : 'ok', h('b', {text: '쏠림 '}), `같은 큰 업종 ${g.n}곳 중 ${g.low.below}곳이 ${md(C.dates[g.low.k])}에 함께 ${md(C.base)}보다 아래`)
      : li('q', h('b', {text: '쏠림 '}), h('span', {class: 'q', text: '? 큰 업종 자료 없음'})),
    li('q', h('b', {text: '파는 것 '}), c.products ? h('span', {'data-proper': '1', text: prodDec(c.products.split(',').slice(0, 2).join(',').trim())}) : h('span', {class: 'q', text: '? 자료 없음 — 한 줄로 말할 수 있나요?'}), c.products ? ' — 한 줄로 말할 수 있나요?' : null), // 파는 것 = 회사 글(남의 글 · data-proper — 쓰지 않을 말 셈 밖)
    li('q', h('b', {text: '거래정지 · 관리종목 '}), h('span', {class: 'q', text: '? 확인 못 함'}), ' — 아래 「확인할 것」'));
  nodes.push(h('h2', {class: 'sec prange-sec', text: '확인표 — 기록 · 조심 · 모름'}),
    h('p', {class: 'prange-legend'}, h('span', {class: 'prange-ok'}, mk('ok'), '기록'), ' ', h('span', {class: 'prange-no'}, mk('no'), '조심'), ' ', h('span', {class: 'prange-q'}, mk('q'), '모름')),
    chk);

  // 지켜볼 날 — 무엇이 나오면 생각을 바꾸나 · 봉인 줄 (한 달 뒤 맞대 볼 날은 위 채점 칸으로 옮김)
  const slots = upd?.slots;
  nodes.push(h('h2', {class: 'sec prange-sec', text: '지켜볼 날 — 무엇이 나오면 생각이 바뀌나요?'}), h('ul', {class: 'prange-chk'},
    wli('ok', h('b', {text: '다음 회차 '}), ...(Array.isArray(slots) && slots.length ? [h('span', {class: 'prange-n', text: nextSlot(slots)}), '(서울) — 새 종가가 있으면 값 · 범위를 다시 셉니다'] : ['?'])),
    wli('ok', h('b', {text: '3분기 실적 '}), '11월 중순까지(DART) — 올해 매출이 6단 점선(증권사 평균치 · 남의 짐작) 쪽으로 가는지'),
    wli('ok', h('b', {text: '2027년 결산 '}), '결산 뒤 90일 안 사업보고서 — 6단 「1년 뒤」 범위가 맞았는지 처음 맞대 볼 때'),
    capLi(C, tm, code, E.pk)));

  // 확인할 것 — 어디서 · 언제(접은 칸)
  const jn = C.facts?.jumpN, pn = pickName(C);
  nodes.push(h('details', {class: 'prange-more'}, h('summary', {text: '확인할 것 — 어디서 · 언제'}), h('div', {class: 'prange-in'}, h('ol', {},
    h('li', {}, '거래정지 · 관리종목 · 투자경고: ', outA('https://kind.krx.co.kr', 'KIND(한국거래소)'), ' — 둘이는 아직 이 표시를 거르지 못합니다(?).'),
    h('li', {}, '3분기 실제 이익: ', outA('https://dart.fss.or.kr', 'DART(전자공시)'), ' 분기보고서 — 11월 중순까지. 증권사 짐작과 견줘 보세요.'),
    h('li', {}, '주식 수 바뀜(쪼개기 · 증자): DART 주요사항보고서 — ', jn ? `한 달 선이 하루 30% 넘게 튄 곳 ${jn}곳(? 확인 못 함).` : '한 달 선이 하루 30% 넘게 튄 곳은 없었습니다.'),
    h('li', {}, E.pk ? `이 회사가 조건을 이어 지키는지: 새 1년 성적표가 나오면 다시 셉니다 — 3단 「왜 ${pn}에 들었나요?」를 보세요 · 들고 난 곳은 ` : `이 회사가 조건에 드는지: 새 1년 성적표가 나오면 다시 셉니다 — 3단 「왜 ${pn} 밖인가요?」를 보세요 · 들고 난 곳은 `,
      inl('#/up', '「업데이트 기록」'), '에 남습니다.')))));

  nodes.push(nextBox(code), foot(C)); // 7단이 끝 단 — 「사기 전에 · 이 회사로 왜 사? ›」 + 「회사로 돌아가기 ›」
  return {title: c.name + ' — 범위 · 확인', nodes};
}
