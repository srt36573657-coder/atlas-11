#!/usr/bin/env node
// 새 ATLAS(aaa7377.com/atlas/) 화면 빠짐없이 돌기 — 첫 화면 · 갈래 · 업종(1곳뿐인 업종은 회사로 넘어감) · 회사 365 · 업종 탭 · 36곳 · 도움말 · 찾기 · 365곳 밖
//   2026-10-11 11:43 대세 365곳(d365-v1): 회사 화면 「왜 365곳에 들었나요?」 층 · 대세 순서 · 업종 · 회사 30거래일 · 일부만 든 업종 글 · 도움말 층마다 가운데값 · 깔때기 숫자 · 36곳 시험 글(자료대로)도 맞댐
//   쓰는 법: node scripts/atlas11/t365/site_check.mjs --base http://127.0.0.1:8899 [--pw /opt/node-tools/] [--out reports/atlas11/verify/atlas-new-check-latest.json]
//   폭 셋(360×640 · 390×844 · 900×900) × 글씨 셋(보통 · 크게 · 아주 크게 — 360 에서만 셋, 나머지는 보통)마다 화면마다 본다:
//     오류 0(보안 규칙 CSP 걸림 포함) · 옆 넘침 0 · 보이는 글씨 21px 이상 · 누르는 자리 44px 이상 · 금지 말 0 · 캔버스 · 3D 0 · 작은 네모 20개 이상(바둑판) 0
//     글자 대비(2026-10-11 13:29 「고급스럽게 … 구글팀이라면」) — 보이는 글마다 글자색 ÷ 뒤 바탕(조상 바탕색 · 번짐 색 마디를 겹쳐 셈 · 경주판 줄은 막대 색까지)이
//       보통 글 4.5 · 큰 글(24px 이상 · 굵은 18.66px 이상) 3 넘게(WCAG 2.2 1.4.3) · 못 가는 단(흐린 칸)은 빼고 셈
//     숫자 = 자료(머리 % · 오름/내림 수 · 줄마다 % · 회사 세 숫자 · 1주 값 — 3단 회사 · 4단 처음과 끝) · 3번 누르면 회사 · n단은 n번 안(4 지나온 길 · 5 누구와 다투나 · 6 앞으로 클까? · 7 범위 · 확인 — 첫 화면에서 링크를 따라 가장 짧은 누름 수)
//   7단(사장님 2026-10-12 00:50 「지금 5단계 클릭이잖아 7단계로 한다」 · 네 팀): 「7단 중 n단」 · 옛 5단 글(「5단 중」 · 「사기 전에 볼 것」 · 3단 36곳 줄 · 3단 「4단 앞으로 클까?」)이 어느 화면에도 없음 · 접은 글(「자세히」)도 금지 말 · 기대 글을 봄(textContent)
//   맨 위 슬라이드 7장(사장님 2026-10-12 18:31 · 19:59 「이게 맨위에 있어서 슬라이드로」 · 20:11 「응」): 판 · 글씨마다 바 칸 일곱을 차례로 눌러 장마다 + 「자세히」 다섯도 열어 화면 판정을 다시 돎(숨은 장도 21px · 대비 · 잘림 · 44px) ·
//     보이는 장 꼭 하나 = 고른 칸 · 누름 차례 하나 · 잠긴 장 여섯 · 장이 칸에 꼭 맞음 · 바 한 줄 · 「n / 7 · 이름」 · 칸 표시(「!」「?」) = 자료 · 장마다 기대 글 · 「자세히 — 이름」 +
//     뒷장 조심(앞 회차 값 · 못 받은 값 · 문턱)이 첫 화면에서 금빛으로 보이나 · home.json 을 못 읽어도 멈추지 않나 · 다음 날 아침에 어제 값을 「오늘」이라 하지 않나 · 손가락 밀기(소개 장 · 세로 · 끝 장) · 저절로 넘김 · 손대면 멈춤
//   오늘의 눈금(2026-10-12 23:10 다섯 팀 · 10-13 00:18 핵심 위주): 2장 결론 줄 · 읽는 법 줄 · 「자세히」 두 지수 줄을 종가에서 따로 셈한 글(gaugeX · gaugeTextX)과 맞댐 · 「자세히」 여섯(2장 오늘 더함)
//   틀린 것이 하나라도 있으면 끝 코드 1
import fs from 'node:fs';
import path from 'node:path';
import {createRequire} from 'node:module';
const arg = (k, d) => { const i = process.argv.indexOf(k); return i < 0 ? d : process.argv[i + 1]; };
const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '../../..');
const base = arg('--base', 'http://127.0.0.1:8899'), out = path.resolve(ROOT, arg('--out', 'reports/atlas11/verify/atlas-new-check-latest.json'));
const require = createRequire(arg('--pw', '/opt/node-tools/'));
const {chromium} = require('playwright');
const exe = ['/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell'].find(f => fs.existsSync(f));
const core = JSON.parse(fs.readFileSync(path.join(ROOT, 'site/atlas/data/core.json'), 'utf8'));
const comp = JSON.parse(fs.readFileSync(path.join(ROOT, 'site/atlas/data/comp.json'), 'utf8')).companies;
const pick = JSON.parse(fs.readFileSync(path.join(ROOT, 'site/atlas/data/pick36.json'), 'utf8'));
const days = JSON.parse(fs.readFileSync(path.join(ROOT, 'site/atlas/data/days.json'), 'utf8'));
const upd = JSON.parse(fs.readFileSync(path.join(ROOT, 'site/atlas/data/updates.json'), 'utf8')); // 업데이트 탭(사장님 12:41)
const tdata = fs.existsSync(path.join(ROOT, 'site/atlas/data/time.json')) ? JSON.parse(fs.readFileSync(path.join(ROOT, 'site/atlas/data/time.json'), 'utf8')) : null; // 봉인 시간(14:37 · 14:39 「3년후 5년후 10년후 이야기」)
const coOf = c => JSON.parse(fs.readFileSync(path.join(ROOT, 'site/atlas/data/co', c + '.json'), 'utf8'));
const lines = JSON.parse(fs.readFileSync(path.join(ROOT, 'site/atlas/data/lines.json'), 'utf8')).lines; // 3단 100만 원 줄(기준일 = 100 · 2026-10-12 클로드팀)
const home = fs.existsSync(path.join(ROOT, 'site/atlas/data/home.json')) ? JSON.parse(fs.readFileSync(path.join(ROOT, 'site/atlas/data/home.json'), 'utf8')) : null; // 첫 화면 종합 정보(2026-10-12 14:54)
const DOW = ['일', '월', '화', '수', '목', '금', '토'], mdw = d => `${+d.slice(5, 7)}월 ${+d.slice(8, 10)}일(${DOW[new Date(d + 'T00:00:00Z').getUTCDay()]})`;
const BANNED = ['예측', '예외 없이', '절대', '상승 신호', '폭락 경보기', '팔 때', '들어갈 때', '시작을 맞힌다', '곧 오른다', '오를 것', '내릴 것', '사라', '팔라', '추천', '목표가', '확실', '보장', '무조건', '확률'];
const r1 = x => Math.floor(x * 10 + 0.5 + 1e-7) / 10;
const md = d => `${+d.slice(5, 7)}월 ${+d.slice(8, 10)}일`;
const ymd = d => d.slice(0, 4) + '년 ' + md(d);
const won100 = m => (m == null ? '?' : Math.round(m * 100).toLocaleString('ko-KR') + '만 원');
const ddayText = d => { const k = new Date(Date.now() + 9 * 36e5), t = Date.UTC(k.getUTCFullYear(), k.getUTCMonth(), k.getUTCDate()); const [y, m, x] = d.split('-').map(Number), n = Math.round((Date.UTC(y, m - 1, x) - t) / 864e5); return n > 0 ? 'D-' + n.toLocaleString('ko-KR') : n === 0 ? '오늘 엶' : '엶 날 지남 — 다시 셀 차례'; }; // 화면과 같은 꼴(서울 오늘부터)
// 사장님 2026-10-11 09:37 「기준일을 항상 현재 날짜에서 지난 20일 거래로」 — 화면 어디에도 옛 3개월 창(「3개월」 · 옛 기준일 7월 6일)이 남지 않았는지 · 기준일 = 마지막 종가 날의 20거래일 전인지
const cal = JSON.parse(fs.readFileSync(path.join(ROOT, 'public/data/input.json'), 'utf8')).calendar.sessions;
const W20 = cal.filter(d => d <= core.asOf).slice(-21);
if (core.base !== W20[0] || core.days !== 20 || JSON.stringify(core.dates) !== JSON.stringify(W20)) { console.error('기준일이 마지막 종가 날의 20거래일 전이 아님', core.base, W20[0], core.days); process.exit(1); }
// 방향 · 세기 · 힘 글(11:04 · 11:10 「이 화면에서 나와야 해」) — 화면 trText 와 같은 꼴
const trText = t => (t.d === 'up' ? '▲ ' : t.d === 'down' ? '▼ ' : '▶ ') + (t.s === 'strong' ? '강하게 ' : '') + {up: '오름', down: '내림', flat: '옆걸음'}[t.d] + (t.t === 'gain' ? ' · 힘 붙음' : t.t === 'fade' ? ' · 힘 빠짐' : '');
const pct = x => { if (x == null) return '?'; const v = r1(x), a = Math.abs(v); return (v > 0 ? '+' : v < 0 ? '−' : '') + (a >= 100 ? Math.floor(a + 0.5 + 1e-7).toLocaleString('ko-KR') : a.toFixed(1)) + '%'; };
// 맨 위 슬라이드 7장(2026-10-12 18:31 · 19:59 · 20:11) — 「오늘」은 보는 사람의 서울 날짜와 같을 때만 · 장마다 보일 글(자료에서 따로 만듦)
const todayK = () => new Date(Date.now() + 9 * 36e5).toISOString().slice(0, 10);
const dayWord = d => (!d ? '?' : d === todayK() ? '오늘' : mdw(d));
const eokW = v => { if (v == null) return '?'; const a = Math.abs(Math.round(v)), jo = Math.floor(a / 10000), r = a % 10000; return (jo ? jo.toLocaleString('ko-KR') + '조' + (r ? ' ' : '') : '') + (r || !jo ? r.toLocaleString('ko-KR') + '억' : '') + ' 원'; };
const iga = x => { const c = x.charCodeAt(x.length - 1); return c >= 0xAC00 && c <= 0xD7A3 && (c - 0xAC00) % 28 ? x + '이' : x + '가'; };
const numK = v => (v == null ? '?' : Number(v).toLocaleString('ko-KR', {minimumFractionDigits: 2, maximumFractionDigits: 2}));
const HUBID = ['hello', 'today', 'idx', 'sec', 'flow', 'us', 's365'], HUBNM = ['소개', '오늘', '지수', '업종', '사고팔기', '미국', '365곳'], DETAIL = ['today', 'idx', 'sec', 'flow', 'us', 's365']; // 맨 위 슬라이드 7장(사장님 19:59 · 20:11)
// 오늘의 눈금(다섯 팀 합침 2026-10-12 23:10) — 화면(atlas.js gauge · gaugeLine)과 따로 셈: 종가 쌍마다 하루 % · 평소 = 오늘 앞 20거래일 하루 움직임 크기 평균 ·
//   「n월 n일 뒤 가장 큼」 = 같은 쪽으로 오늘만큼 움직인 마지막 날이 5거래일 넘게 앞일 때만 · 3개월 안에 없으면 「3개월 중 가장 크게」
function gaugeX(x) {
  const c = (x?.rows ?? []).map(r => r[1]), dt = (x?.rows ?? []).map(r => r[0]); if (c.length < 22) return null;
  const mv = []; for (let i = c.length - 1; i >= 1; i--) if (c[i] > 0 && c[i - 1] > 0) mv.unshift({d: dt[i], v: (c[i] / c[i - 1] - 1) * 100});
  if (mv.length < 21) return null; const t = mv.at(-1).v, past = mv.slice(0, -1);
  const hit = past.map((m, i) => ({...m, back: past.length - i})).filter(m => (t < 0 ? m.v <= t : m.v >= t)).at(-1);
  const avg = past.slice(-20).map(m => Math.abs(m.v)).reduce((a, b) => a + b, 0) / 20;
  let run = 0, prod = 1; for (const m of [...mv].reverse()) { if (t === 0 || Math.sign(m.v) !== Math.sign(t)) break; run++; prod *= 1 + m.v / 100; }
  return {t, hit, ratio: avg > 0 ? Math.abs(t) / avg : null, run, runChg: (prod - 1) * 100};
}
function gaugeTextX(name, g) {
  if (!g) return `${name} — ? 3개월 값이 모자라 견주지 못함`; if (!g.t) return `${name} — 그대로(움직임 0)`;
  const way = g.t < 0 ? '내림' : '오름', R = g.ratio, u = R == null ? '평소 ?' : R >= 1.25 ? `평소의 ${(R >= 10 ? Math.round(R) : Math.round(R * 10) / 10).toLocaleString('ko-KR')}배로` : R >= 0.8 ? '평소만큼' : '평소보다 작게';
  return `${name} — ${u} ${way}${!g.hit ? ` · 3개월 중 가장 크게 ${way}` : g.hit.back >= 5 ? ` · ${md(g.hit.d)} 뒤 가장 큼` : ''}`;
}
function hubExpect(H) {
  const K = H.idx?.KOSPI, Q = H.idx?.KOSDAQ, S = H.sectors, F = H.flows, U = H.us, T = H.s365, st = H.stale ?? {}, A = H.alerts ?? [];
  const marks = HUBID.map(id => { if (id === 'hello' || id === 'today') return ''; const bang = (id === 'idx' && A.some(a => a.kind === 'idx')) || (id === 'flow' && A.some(a => a.kind === 'flow'));
    const q = (id === 'idx' && (!H.idx || st.idx)) || (id === 'sec' && (!S || st.sectors)) || (id === 'flow' && (!F || st.flows)) || (id === 'us' && (!U || st.us)) || (id === 's365' && !T?.list?.length); return (bang ? '!' : '') + (q ? '?' : ''); });
  const d0 = H.kst.slice(0, 10), gK = gaugeX(K), gQ = gaugeX(Q), mainX = gK ? ['코스피', gK, K] : gQ ? ['코스닥', gQ, Q] : null;
  const s1 = [K || Q ? `${dayWord((K ?? Q).date)} 코스피 ${pct(K?.day)} · 코스닥 ${pct(Q?.day)}` : '오늘 시장 — ?', `${dayWord(d0) === '오늘' || d0 === (K ?? Q)?.date ? '' : mdw(d0) + ' '}${H.kst.slice(11, 16)} 받음`];
  // 2장은 핵심 하나(2026-10-13 00:18 「핵심위주로」) — 결론 한 줄(코스피 · 없으면 코스닥) · 눈금 그림 · 읽는 법 한 줄 · 「자세히」(코스닥 · 시장 넓이 · 「!」)
  if (mainX) s1.push(gaugeTextX(mainX[0], mainX[1]), `진한 막대 = ${mainX[0] === '코스피' ? '' : '코스닥이 '}${dayWord(mainX[2].date) === '오늘' ? '오늘' : '이날'}만큼 ${mainX[1].t < 0 ? '내린' : '오른'} 날`, '자세히 ›');
  const BB = S?.breadth, dnB = BB && BB.down >= BB.up, A2 = H.alerts ?? [], ixA = A2.filter(a => a.kind === 'idx'), wayA = xs => (xs.every(a => a.v < 0) ? '내림' : xs.every(a => a.v > 0) ? '오름' : '움직임');
  const today = [`${(K ?? Q)?.date ? dayWord((K ?? Q).date) + ' ' : ''}시장 — 평소와 견줌`, ...(K ? [gaugeTextX('코스피', gK)] : []), ...(Q ? [gaugeTextX('코스닥', gQ)] : []),
    ...(BB && BB.up + BB.down ? [`시장 ${BB.n.toLocaleString('ko-KR')}곳 중 ${BB.up.toLocaleString('ko-KR')}곳 오름 · ${BB.down.toLocaleString('ko-KR')}곳 내림 — 10곳 중 ${Math.round((dnB ? BB.down : BB.up) / (BB.up + BB.flat + BB.down) * 10)}곳 ${dnB ? '내림' : '오름'}`] : []),
    ...['big', 'usual'].flatMap(why => { const xs = ixA.filter(a => (a.why ?? 'usual') === why); return xs.length ? [`! ${xs.length > 1 ? '두 지수 모두' : xs[0].name} ${why === 'big' ? '하루 5% 넘게' : '평소의 2.5배 넘게'} ${wayA(xs)} — 미리 정한 문턱`] : []; }), // home-v3
    ...A2.filter(a => a.kind === 'flow').map(a => `! 외국 투자자가 ${a.name}에서 ${eokW(a.v)} 더 ${a.v < 0 ? '팖' : '삼'} — 하루 1조 원 문턱`)];
  const sd = S?.date ?? K?.date, fd = F?.KOSPI?.date ?? F?.KOSDAQ?.date;
  const all = F ? ['KOSPI', 'KOSDAQ'].flatMap(m => [['personal', '개인'], ['foreign', '외국 투자자'], ['institutional', '기관']].map(([k, kn]) => ({mn: m === 'KOSPI' ? '코스피' : '코스닥', kn, val: F[m]?.[k] ?? null}))).filter(x => x.val != null) : [];
  const big = all.sort((a, b) => Math.abs(b.val) - Math.abs(a.val))[0], bigT = big ? `${iga(big.kn)} ${big.mn}에서 ${eokW(big.val)} 더 ${big.val < 0 ? '팖' : '삼'}` : null;
  const more = '자세히 ›';
  const slides = [
    ['주식해서', '돈 버신 분 몇분일까요?', '10명중에 몇명 전 1명입니다', '왜? 그럴까요! 생각해보세요', '아틀란스 올림!', '친구에게 소개하기', '막비 24초 영상 · 보내기'],
    s1,
    K || Q ? ['코스피 · 코스닥 — 3개월', ...[K, Q].filter(Boolean).flatMap(x => [x.name, numK(x.close), pct(x.day)]), more] : ['? 지수 값을 못 받았습니다.', more],
    S ? [`${sd ? dayWord(sd) + ' ' : ''}업종 — ${S.label.replace('7', '3')} · 약한 3`, S.strong[0].name, pct(S.strong[0].chg), S.weak[0].name, pct(S.weak[0].chg), more] : ['? 업종 값을 못 받았습니다.', more],
    F ? [`${fd ? dayWord(fd) + ' ' : ''}누가 사고팔았나`, ...(bigT ? [bigT] : []), more] : ['? 사고판 돈을 못 받았습니다.', more],
    U ? ['미국 — 마지막 장', `미국 ${U.date ? mdw(U.date) : '?'} 장 끝 — ${U.n}개 가운데 ${U.up}개 오름`, ...U.rows.map(r => r.name), more] : ['? 미국 값을 못 받았습니다.', more],
    T?.list?.length ? [`365곳 — ${dayWord(T.date)}`, `${T.up}곳 오름 · ${T.down}곳 내림`, ...(T.top ? [T.top.n, T.bot.n] : []), more] : ['? 365곳 값이 없습니다.', more],
  ];
  const details = { // 「자세히」 = 14:54 종합 정보 칸 그대로(+ 2장 오늘 — 2026-10-13 00:18)
    today,
    idx: K || Q ? ['코스피 · 코스닥 — 3개월', ...(K ? [`코스피 ${numK(K.close)}`] : []), ...(Q ? [`코스닥 ${numK(Q.close)}`] : [])] : ['? 지수 값을 못 받았습니다.'],
    sec: S ? [`${sd ? dayWord(sd) + ' ' : ''}업종 — ${S.label} · 약한 7`, `가장 강한 ${S.strong[0].name} ${pct(S.strong[0].chg)}`, `가장 약한 ${S.weak[0].name} ${pct(S.weak[0].chg)}`, ...S.strong.map(g => g.name), ...S.weak.map(g => g.name),
      ...(S.breadth ? [`시장 ${S.breadth.n.toLocaleString('ko-KR')}곳 중 ${S.breadth.up.toLocaleString('ko-KR')}곳 오름 · ${S.breadth.down.toLocaleString('ko-KR')}곳 내림`] : []), // 2장에서 옮김(다섯 팀 합침)
      `다르게 보면 — ${S.label}업종도 회사로 세면 ${S.strong.reduce((a, g) => a + (g.up ?? 0), 0).toLocaleString('ko-KR')}곳 오름 · ${S.strong.reduce((a, g) => a + (g.down ?? 0), 0).toLocaleString('ko-KR')}곳 내림`] : ['? 업종 값을 못 받았습니다.'],
    flow: F ? [`${fd ? dayWord(fd) + ' ' : ''}누가 사고팔았나`, ...(bigT ? [bigT] : []), '코스피', '코스닥'] : ['? 사고판 돈을 못 받았습니다.'],
    us: U ? ['미국 — 마지막 장', `미국 ${U.date ? mdw(U.date) : '?'} 장 끝 — ${U.n}개 가운데 ${U.up}개 오름`] : ['? 미국 값을 못 받았습니다.'],
    s365: T?.list?.length ? [`365곳 — ${dayWord(T.date)}`, `${T.up}곳 오름 · ${T.down}곳 내림`, '가장 많이 오른', ...(T.top ? [T.top.n, T.bot.n] : [])] : ['? 365곳 값이 없습니다.'],
  };
  return {marks, slides, details};
}
const routes = ['#/', '#/list', '#/36', '#/up', ...(tdata ? ['#/time'] : []), ...core.groups.map(g => '#/g/' + g.id), ...core.industries.filter(i => i.n > 1).map(i => '#/i/' + encodeURIComponent(i.name)), ...Object.keys(comp).map(c => '#/c/' + c), ...Object.keys(comp).map(c => `#/c/${c}/past`), ...Object.keys(comp).map(c => `#/c/${c}/rivals`), ...Object.keys(comp).map(c => `#/c/${c}/grow`), ...Object.keys(comp).map(c => `#/c/${c}/range`), '#/info']; // 7단 — 5 누구와 다투나(rivals) · 6 앞으로 클까?(grow · 사장님 16:51 회사 성장 이야기) · 7 범위 · 확인(range)
if (arg('--only')) routes.splice(0, routes.length, ...arg('--only').split(',')); // 고치는 동안 빨리(그 길만) — 3번 누름 셈 · 문은 못 지남(전부를 돌린 결과만 커밋)
const fails = []; let screens = 0, numbers = 0;
const fail = (where, what) => fails.push({where, what});

function expect(route) {
  // 화면마다 자료에서 따로 만든 기대 글(보기 = 한 회사 한 표)
  const [, kind, arg] = route.match(/^#\/(\w*)\/?(.*)$/) || [];
  if (kind === 'g') { const g = core.groups.find(x => x.id === arg); return {step: 1, head: pct(g.chg), up: g.up, down: g.down, rows: g.inds.map(n => { const i = core.industries.find(x => x.name === n); return [n, pct(i.chg)]; }), trh: trText(g.tr), trd: g.inds.map(n => trText(core.industries.find(x => x.name === n).tr))}; }
  if (kind === 'i') { const i = core.industries.find(x => x.name === decodeURIComponent(arg)); return {step: 2, head: pct(i.chg), up: i.up, down: i.down, rows: i.members.map(c => [comp[c].name, pct(comp[c].chg)]), trh: trText(i.tr)}; }
  if (kind === 'c') {
    const [code, sub] = arg.split('/'), c = comp[code];
    if (!sub) { const q = c.pick, why = [{1: '1층 — 두 팀 모두 「대세」로 본 업종', 2: `2층 — ${q.google ? '구글팀' : 'CIA팀'}만 「대세」로 본 업종`, 3: '3층 — 대세에 가까운 순서로 채운 업종'}[q.tier],
        `「${q.sector}」 · ${core.funnel.sectors}업종 가운데 대세 순서 ${q.srank}번째`, `업종 ${pct(q.schg)} · 이 회사 ${q.r30 == null ? '? 셈 못 함' : pct(q.r30)}`, `많이 오른 순 ${q.srank}번째`];
      if (q.part) why.push(`${q.inN}곳만 넣었습니다 — 이 회사는 ${q.prank}번째`);
      const lv = lines[code].filter(x => x != null).map(x => x / 100), low = Math.min(...lv), last = lv.at(-1), man = x => Math.round(x).toLocaleString('ko-KR') + '만 원';
      why.push(low < 100 ? `${md(core.base)}에 100만 원어치였다면 가장 낮을 때 ${man(low)} · 끝 ${man(last)}` : `${md(core.base)}에 100만 원어치였다면 그보다 낮아진 적 없이 끝 ${man(last)}`, `가장 깊이 빠짐(${core.days}거래일)`);
      return {step: 3, trio: [pct(c.chg), pct(c.r1y), pct(c.mdd)], price: Math.round(c.price).toLocaleString('ko-KR') + '원', axis: md(core.base) + ' = 100', why}; }
    if (sub === 'rivals' || sub === 'grow') { // 5단 누구와 다투나 · 6단 앞으로 클까?(사장님 16:51 · 7단 2026-10-12) — 자료 파일(co/<번호>.json grow)에서 따로 만든 기대 글 · 범위 → 말 등급도 따로 셈
      const G = coOf(code).grow, S = G?.story, xm = m => (Math.round(m * 10 + 1e-9) / 10).toFixed(1) + '배';
      if (sub === 'rivals') {
        const why = [`「${G.ind.name}」 ${G.ind.n}곳 가운데 매출 ${G.ind.rank ?? '?'}번째`];
        if (!S) why.push('? 세 팀 이야기는 아직 없습니다'); else { why.push(S.shape, ...S.rivals.map(r => r.name)); for (const r of S.rivals) if (!r.url && r.chk) why.push(r.chk.v === '기사로 확인' && r.chk.url ? '따로 확인한 글' : `따로 찾아봄 · ${r.chk.v}`); }
        if (!G.top.some(t => t[2] === code) && G.ind.me != null) why.push(`${c.name}(${G.ind.rank ?? '?'}번째)`); // 막대 위 다섯 밖이면 「이 회사」 줄을 더함
        return {step: 5, title: `${c.name} — 누구와 다투나?`, why};
      }
      if (!S) return {step: 6, title: `${c.name} — 앞으로 클까?`, why: ['? 세 팀 이야기는 아직 없습니다']};
      const gr = (lo, hi) => { if (lo == null || hi == null) return null; const f = lo >= 1 ? 1 : hi <= 1 ? 0 : Math.log(hi) / (Math.log(hi) - Math.log(lo)); return f >= 0.9 ? '아주 높다' : f >= 0.65 ? '높다' : f >= 0.35 ? '반반' : f >= 0.1 ? '낮다' : '아주 낮다'; };
      const why = [`근거 기사 ${S.facts.length}개`];
      for (const k of ['1', '3', '5', '10']) { const x = S.h[k]; if (x.mid == null) { why.push('? 자료 모자람'); continue; } why.push(`${xm(x.mid)}쯤`, `(${xm(x.lo)} ~ ${xm(x.hi)})`); const g = gr(x.lo, x.hi); if (g !== x.g) fail(route, `말 등급이 범위와 다름 ${k}년 ${x.g} ≠ ${g}`); why.push(g); }
      const BI = core.grow?.bias; if (BI) why.push(`365곳 10년 뒤 가운데 ${xm(BI.m10)}쯤`, `= ${BI.cons.toFixed(2)}배 · ${BI.consN}곳 가운데값`);
      why.push(`${G.baseYear ?? '?'}년 매출의 몇 배쯤?`); // 기준 해를 숨기지 않음(CIA팀 2026-10-12)
      const ek = G.years.findIndex(y => y.endsWith('E')), er = ek >= 0 && G.rev[ek] && G.baseRev ? G.rev[ek] / G.baseRev : null;
      const below = er == null ? 0 : ['1', '3', '5', '10'].filter(k => S.h[k].mid != null && S.h[k].mid < er).length;
      for (const f of S.facts) if (f.chk) why.push(`따로 다시 확인: ${f.chk}`);
      return {step: 6, title: `${c.name} — 앞으로 클까?`, why, below};
    }
    if (sub === 'past') { // 4단 — 처음 보기 1년(253거래일) · 자료 파일에서 따로 셈
      const co = coOf(code), n = days.dates.length, from = Math.max(co.k0, n - 253), cl = co.close.slice(from - co.k0).filter(x => x != null);
      const base = cl[0], last = cl.at(-1); let peak = 0, m = 0; for (const x of cl) { peak = Math.max(peak, x); m = Math.min(m, x / peak - 1); }
      const wn = x => Math.round(x).toLocaleString('ko-KR') + '원', short = from === co.k0 && n - 253 < co.k0, same1y = !short && c.r1y != null && c.mdd1y != null; // 1년은 3단 · 7단과 같은 회사 자료 값(2026-10-12)
      return {step: 4, trio: [pct(same1y ? c.r1y : (last / base - 1) * 100), pct(same1y ? c.mdd1y : m * 100), pct((last / peak - 1) * 100)], price: [wn(base), wn(last)], why: ['가장 높을 때 ' + wn(Math.max(...cl)), '가장 낮을 때 ' + wn(Math.min(...cl))]}; // 처음 · 끝 1주 값 · 그림 위 · 아래 글 = 실제 값
    }
    const k = pick.companies[code];
    return {step: 7, title: `${c.name} — 범위 · 확인`, dirs: k && k.ok ? k.win.map((w, j) => [`번 길 ${r1(w).toFixed(1)}%`, `크게 잃는 길 ${r1(k.big[j]).toFixed(1)}%`]) : null, status: !k || !k.ok ? '? 셈 못 함' : k.rank ? `36곳 가운데 ${k.rank}번째` : k.cut ? '지움' : '남았지만 36곳 밖',
      why: ['모형 가정 아래 추정 · 검증 전', ...(pick.backtest ? [`지난 ${pick.backtest.n}번 가운데 ${pick.backtest.wins}번만`] : []), '확인표 — 기록 · 조심 · 모름', '지켜볼 날', '3분기 실적', '2027년 결산', '봉인', ...(core.mcEnd ? [`${ymd(core.mcEnd)} 종가`] : []), ...(k && k.ok ? ['흰 눈금 = 365곳 가운데값'] : [])], dm: k && k.ok ? 8 : 0};
  }
  if (!kind) { const T = core.time, H = home, K = H?.idx?.KOSPI, Q = H?.idx?.KOSDAQ, sd = H?.sectors?.date ?? K?.date, fd = H?.flows?.KOSPI?.date ?? H?.flows?.KOSDAQ?.date;
    // 첫 화면 종합 정보(14:54) → 맨 위 슬라이드 7장(19:59 · 20:11) — 머리 = 2장 오늘 지수(「오늘」은 보는 날짜로) · 장 이름 · 업종 1등 · 꼴찌 · 365곳 양 끝 · 봉인 한 줄 · 경주 제목은 그 아래(h2) · 장마다 보이는 글은 아래 hubExpect
    return {up: core.all.up, down: core.all.down, rows: core.groups.map(g => [g.short, pct(g.chg)]), title: K || Q ? `${dayWord((K ?? Q).date)} 코스피 ${pct(K?.day)} · 코스닥 ${pct(Q?.day)}` : '오늘 시장 — ?', trd: core.groups.map(g => trText(g.tr)),
      why: [`지난 ${core.days}거래일 1등은 ${core.groups[0].short}`, ...(H ? ['코스피 · 코스닥 — 3개월', ...(H.flows ? [`${fd ? dayWord(fd) + ' ' : ''}누가 사고팔았나`] : []), '미국 — 마지막 장', ...(H.s365?.list?.length ? [`365곳 — ${dayWord(H.s365.date)}`] : []),
        ...(H.sectors ? [`${sd ? dayWord(sd) + ' ' : ''}업종 — ${H.sectors.label} · 약한 7`, H.sectors.strong[0].name, H.sectors.weak[0].name] : []), ...(H.s365?.top ? [H.s365.top.n, H.s365.bot.n] : [])] : ['? 오늘 시장 자료를 못 읽었습니다']),
        ...(T ? [`봉인 ${T.id}호 — 3 · 5 · 10년 뒤 다시 엶`, ddayText(T.opens[0].date)] : []), '저는 투자 상담사가 아닙니다'], hub: H ? hubExpect(H) : null}; }
  if (kind === 'time') { const K = tdata.capsules[0], P = K.past, S = K.since; return {title: `봉인 ${K.id}호 — ${md(K.seal)} 365곳`,
    why: [ymd(P.from), `${P.n365}곳`, won100(P.mult365), won100(P.med365), won100(P.multPool), `${P.half}곳`, `${P.skip365}곳은 뺐습니다`, ...K.opens.flatMap(o => [ymd(o.date), ddayText(o.date)]), K.digest, K.file, // 잠근 규칙은 접힌 칸이라 글에 안 잡힘 — site_verify ⑫ 가 봉인 파일과 맞댐
      ...(S.days ? [pct(S.chg365), pct(S.chg36), pct(S.chgPool), `봉인 뒤 ${S.days}거래일`] : ['아직 0거래일'])]}; }
  if (kind === '36') { const B = pick.backtest;
    return {p36: pick.picks.map(p => [p.name, '번 길 ' + r1(p.avg).toFixed(1) + '%']), test: B ? `${B.n}번에 대입했더니, 36곳이 365곳 평균보다 나았던 때는 ${B.wins}번` : null, total: Math.round(pick.total).toLocaleString('ko-KR') + '원',
      why: B ? ['모형 가정 아래 추정 · 검증 전', `${B.wins}번(${Math.round(B.rate * 100)}%)${B.rate < 0.5 ? '뿐' : ''}입니다`, B.passes ? '문턱을 넘었습니다' : B.meanPick < B.meanAll ? '아무거나 고른 것보다 못했습니다' : '한 달 평균은 나았지만', ...(B.skipped?.length ? [`셀 수 없어 뺀 때 ${B.skipped.length}번`] : [])] : []}; }
  if (kind === 'up') { const r0 = upd.records[0]; return {title: '업데이트 기록', why: r0 ? [{'바꿈': '바꿈', '그대로': '그대로 — 새 값 없음', '실패': '실패'}[r0.result], ...(r0.asOf ? [`고른 날 ${md(r0.asOf)}`, `기준일 ${md(r0.base)}`] : []), ...(r0.in?.length ? [`새로 든 곳 ${r0.in.length}`, `빠진 곳 ${r0.out.length}`] : [])] : ['아직 기록이 없습니다']}; }
  if (kind === 'info') return {why: [...core.facts.tiers.map(t => `${t.t}층 ${t.n}곳 ${pct(t.med)}`), ...core.funnel.steps.map(x => x.n.toLocaleString('ko-KR') + '곳')]};
  return {};
}

// 화면 하나를 브라우저 안에서 잼(판 · 글씨 · 길마다 · 첫 화면은 슬라이드 칸마다 · 「자세히」마다)
const probe = ({banned}) => {
      const res = {over: document.documentElement.scrollWidth - innerWidth, small: [], taps: [], banned: [], lowc: [], canvas: document.querySelectorAll('canvas').length, d3: 0, squares: 0, links: [], text: ''};
      const sheet = document.querySelector('.sheet:not([hidden])'), scope = sheet || document.body;
      const vis = e => { const s = getComputedStyle(e); if (s.visibility === 'hidden' || s.display === 'none' || e.closest('[hidden]') || e.closest('.sr')) return false; const b = e.getBoundingClientRect(); return b.width > 0 && b.height > 0; };
      // 글자 대비 — 색 읽기 · 겹치기 · 밝기(WCAG 2)
      const P = c => { const m = /rgba?\(([^)]+)\)/.exec(c || ''); if (!m) return null; const v = m[1].split(/[\s,/]+/).filter(Boolean).map(Number); return [v[0], v[1], v[2], v.length > 3 ? v[3] : 1]; };
      const over = (t, b) => { const a = t[3] + b[3] * (1 - t[3]); return a ? [0, 1, 2].map(i => (t[i] * t[3] + b[i] * b[3] * (1 - t[3])) / a).concat(a) : [0, 0, 0, 0]; };
      const lum = c => { const f = v => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; }; return 0.2126 * f(c[0]) + 0.7152 * f(c[1]) + 0.0722 * f(c[2]); };
      const cr = (a, b) => { const x = lum(a), y = lum(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); };
      const stopsOf = s => (s.backgroundImage && s.backgroundImage !== 'none' ? [...s.backgroundImage.matchAll(/rgba?\([^)]*\)/g)].map(m => P(m[0])).filter(Boolean) : []);
      const ROOT_BG = P(getComputedStyle(document.documentElement).backgroundColor) || [17, 20, 51, 1];
      const memo = new Map();
      const bgOf = el => { // 이 칸 뒤에 깔린 바탕 후보(번짐 색은 마디마다 하나씩) — 맨 위 불투명 바탕까지
        if (!el) return [ROOT_BG]; if (memo.has(el)) return memo.get(el);
        const s = getComputedStyle(el), c = P(s.backgroundColor) || [0, 0, 0, 0], g = stopsOf(s);
        let out = c[3] >= 1 ? [c] : bgOf(el.parentElement).map(p => (c[3] > 0 ? over(c, p) : p));
        if (g.length) out = out.flatMap(b => g.map(t => over(t, b)));
        if (out.length > 12) out = out.slice(0, 12);
        memo.set(el, out); return out;
      };
      const opa = el => { let o = 1; for (let x = el; x; x = x.parentElement) o *= +getComputedStyle(x).opacity; return o; };
      // 옆으로 잘림 — 글 칸이 넘침을 숨기는 조상(overflow) 밖으로 나가면 실패(줄임표 … 로 일부러 줄인 칸은 뺌)
      res.clip = [];
      const clipAnc = el => { const out = []; for (let x = el.parentElement; x && x !== document.body && x !== document.documentElement; x = x.parentElement) { const s = getComputedStyle(x); if (s.overflowX !== 'visible' && s.textOverflow !== 'ellipsis') out.push(x); } return out; };
      for (const e of scope.querySelectorAll('*')) {
        if (!vis(e)) continue;
        const s = getComputedStyle(e);
        if (/matrix3d|perspective/.test(s.transform) || s.perspective !== 'none') res.d3++;
        const own = [...e.childNodes].some(n => n.nodeType === 3 && n.textContent.trim());
        if (own && parseFloat(s.fontSize) < 21 && !e.closest('svg')) res.small.push(e.tagName + ':' + e.textContent.trim().slice(0, 16) + ' ' + s.fontSize);
        if (own && !e.closest('svg') && !e.closest('ol.st li.next > .cell')) { // 못 가는 단(흐린 칸)은 WCAG 「쓸 수 없는 칸」이라 뺌
          const fg0 = P(s.color); let bgs = bgOf(e);
          const row = e.closest('.board:not(.wide) .row'); // 경주판 줄 글은 막대(빨강 · 파랑 번짐) 위에도 놓임
          if (row) { const bars = [...row.querySelectorAll('.bar')].flatMap(b => { const bs = getComputedStyle(b); return [P(bs.backgroundColor), ...stopsOf(bs)].filter(x => x && x[3] > 0); }); bgs = bgs.flatMap(b => [b, ...bars.map(t => over(t, b))]); }
          if (fg0) { const fg = [fg0[0], fg0[1], fg0[2], fg0[3] * opa(e)], fs = parseFloat(s.fontSize), big = fs >= 24 || (fs >= 18.66 && +s.fontWeight >= 700), need = big ? 3 : 4.5;
            const worst = Math.min(...bgs.map(b => cr(over(fg, b), b)));
            if (worst < need) res.lowc.push(`${e.tagName}.${(e.className || '').toString().split(' ')[0]}:${e.textContent.trim().slice(0, 12)} ${worst.toFixed(2)}<${need}`); }
          const bb = e.getBoundingClientRect();
          for (const a of clipAnc(e)) { const ab = a.getBoundingClientRect(); if (bb.right > ab.right + 1 || bb.left < ab.left - 1) { res.clip.push(`${e.tagName}:${e.textContent.trim().slice(0, 12)} ${Math.round(bb.right - ab.right)}px`); break; } }
        }
        const bb = e.getBoundingClientRect();
        if (bb.width >= 8 && bb.width <= 44 && Math.abs(bb.width - bb.height) <= 2 && !e.closest('svg')) res.squares++;
      }
      // 영상 친구들(사장님 2026-10-11 16:29 「곳곳에 영상에 있는 고양이 무지개 앵무새 꽃 … 곳곳에 잘어울리게」) — 꾸밈 그림 지킴:
      //  정해 둔 11가지만(사람 그림 없음 — 그림은 막비 소개 그림뿐 · 막비 얼굴은 제목 옆 달 안에만(바탕 그림 · 아래 「달 속 막비」 · 2026-10-13 03:39 「이 앵무새로」)) · 화면 읽기에서 숨김 · 자료 칸 안에 없음 · 글자를 덮지 않음 ·
      //  숫자 · 그림(차트) · ? 와 10px 넘게 떨어짐 · 빨강 · 파랑(오름 · 내림 색)과 색상 25° 안의 진한 색 없음(규칙 53)
      res.mo = []; res.moN = 0;
      // 달 속 막비(2026-10-13 03:39) — 화면 제목(h1) 옆 달(::before 바탕 그림)에 막비 얼굴이 있어야 함 · 제목이 없는 판(도움말 · 찾기)은 셈 밖
      { const hd = document.querySelector('#view h1.head, #view .co-head h1'); res.moonFace = !hd || sheet || !vis(hd) ? null : /makbi-moon\.svg/.test(getComputedStyle(hd, '::before').backgroundImage); /* 슬라이드 7장 가운데 2장(오늘) 밖에서는 제목이 숨음(2026-10-12 19:59 · 20:11) */ }
      const MO_OK = new Set(['heart', 'star', 'moon', 'daisy', 'tulip', 'cat', 'catsleep', 'parrot', 'rainbow', 'whale', 'butterfly']);
      const ZONE = '.board, .row, .trio, .lc, .tc, .upchart, ol.p36, .munger, .test, .bt, ul.dirbars, ol.funnel, .key, .lkey, .track, .num, .q, .chip, .box, .digest, .srank, .tell, .trh, .seg, ol.steps, .co-head, .crumb, .badge';
      for (const im of scope.querySelectorAll('img')) if (vis(im) && !im.closest('a.hello')) res.mo.push('사진 ' + (im.getAttribute('src') || '').slice(-24));
      const okl = hx => { const v = (hx || '').trim().replace('#', ''); if (!/^[0-9a-f]{6}$/i.test(v)) return null; const f = c => { c /= 255; return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; }; const [R, G, B] = [0, 2, 4].map(i => f(parseInt(v.slice(i, i + 2), 16)));
        const l = Math.cbrt(0.4122214708 * R + 0.5363325363 * G + 0.0514459929 * B), m = Math.cbrt(0.2119034982 * R + 0.6806995451 * G + 0.1073969566 * B), q = Math.cbrt(0.0883024619 * R + 0.2817188376 * G + 0.6299787005 * B);
        const A = 1.9779984951 * l - 2.4285922050 * m + 0.4505937099 * q, Bb = 0.0259040371 * l + 0.7827717662 * m - 0.8086757660 * q; return {h: (Math.atan2(Bb, A) * 180 / Math.PI + 360) % 360, c: Math.hypot(A, Bb)}; };
      const rootS = getComputedStyle(document.documentElement), sig = ['--up', '--down', '--up-ink', '--down-ink'].map(k => okl(rootS.getPropertyValue(k))).filter(Boolean);
      if (sig.length < 4) res.mo.push('오름 · 내림 색 이름을 못 읽음');
      const hueGap = (a, b2) => { const d = Math.abs(a - b2) % 360; return d > 180 ? 360 - d : d; };
      const gapOf = (a, b2) => Math.hypot(Math.max(0, b2.left - a.right, a.left - b2.right), Math.max(0, b2.top - a.bottom, a.top - b2.bottom));
      const shut = el => { const d = el.closest('details:not([open])'); return !!d && !el.closest('summary'); }; // 닫힌 「자세히」 속 글은 그려지지 않음(크롬은 자리만 셈)
      const bar = el => !!el.closest('nav.tabbar, header.band'); // 위 · 아래 고정 막대 — 스크롤 따라 덮고 지나감(겹침 아님)
      const mos = [...scope.querySelectorAll('svg.mo')].filter(m => vis(m) && !shut(m));
      if (mos.length) {
        const near = [...scope.querySelectorAll('.num, .q, svg:not(.mo)')].filter(x => !x.closest('svg.mo') && vis(x) && !shut(x) && !bar(x)).map(x => [x, x.getBoundingClientRect()]);
        const texts = []; const tw = document.createTreeWalker(scope, NodeFilter.SHOW_TEXT);
        for (let n = tw.nextNode(); n; n = tw.nextNode()) { const pe = n.parentElement; if (!n.textContent.trim() || !pe || pe.closest('svg') || !vis(pe) || shut(pe) || bar(pe)) continue; const rg = document.createRange(); rg.selectNodeContents(n); for (const q of rg.getClientRects()) if (q.width > 0 && q.height > 0) texts.push([q, n.textContent.trim().slice(0, 10)]); }
        for (const m of mos) {
          res.moN++;
          const nm = [...m.classList].find(c => c.startsWith('mo-'))?.slice(3) ?? '?';
          if (!MO_OK.has(nm)) res.mo.push('정해 둔 친구가 아님 ' + nm);
          if (!m.closest('[aria-hidden="true"]')) res.mo.push(nm + ' 화면 읽기에 보임');
          const z = m.parentElement?.closest(ZONE); if (z) res.mo.push(`${nm} 자료 칸 안 .${String(z.className?.baseVal ?? z.className).split(' ')[0]}`);
          const mb = m.getBoundingClientRect(), ib = {left: mb.left + 1, right: mb.right - 1, top: mb.top + 1, bottom: mb.bottom - 1};
          const hit = texts.find(([q]) => q.left < ib.right && q.right > ib.left && q.top < ib.bottom && q.bottom > ib.top); if (hit) res.mo.push(`${nm} 글자를 덮음 「${hit[1]}」`);
          const nb = near.find(([x, q]) => gapOf(mb, q) < 10); if (nb) res.mo.push(`${nm} 숫자 · 그림 · ? 와 ${gapOf(mb, nb[1]).toFixed(0)}px 「${(nb[0].textContent || nb[0].tagName).trim().slice(0, 10)}」`);
          for (const el of m.querySelectorAll('[fill], [stroke]')) for (const at of ['fill', 'stroke']) { const L = okl(el.getAttribute(at)); if (L && L.c >= 0.05 && sig.some(g => hueGap(L.h, g.h) < 25)) res.mo.push(`${nm} 오름 · 내림 색 근처 ${el.getAttribute(at)}`); }
        }
      }
      for (const a of scope.querySelectorAll('a[href], button')) { if (!vis(a)) continue; const bb = a.getBoundingClientRect(); if (bb.height < 43.5 || bb.width < 43.5) res.taps.push((a.textContent.trim() || a.getAttribute('aria-label') || a.tagName).slice(0, 20) + ` ${Math.round(bb.width)}×${Math.round(bb.height)}`); }
      const text = scope.innerText; res.text = text;
      { const tw = document.createTreeWalker(sheet || document.querySelector('#view'), NodeFilter.SHOW_TEXT), parts = []; for (let n = tw.nextNode(); n; n = tw.nextNode()) parts.push(n.textContent); res.all = parts.join('\n'); } // 접은 「자세히」 속 글까지(7단) — 글 마디마다 끊어 붙임(옆 칸 글이 이어 붙어 없는 말이 생기지 않게 · 예: 「조사」+「라온…」)
      for (const w of banned) if (text.includes(w) || res.all.includes(w)) res.banned.push(w);
      res.links = [...document.querySelectorAll('#view a[href^="#/"], .tabbar a[href^="#/"]')].map(a => a.getAttribute('href'));
      res.head = document.querySelector('#view h1')?.textContent ?? '';
      res.count = document.querySelector('#view .count')?.textContent ?? '';
      res.rows = [...document.querySelectorAll('#view .board .row')].sort((a, b) => a.getBoundingClientRect().top - b.getBoundingClientRect().top).map(x => [x.querySelector('.nm').firstChild.textContent, x.querySelector('.val').textContent]);
      res.trd = [...document.querySelectorAll('#view .board .row')].sort((a, b) => a.getBoundingClientRect().top - b.getBoundingClientRect().top).map(x => x.querySelector('.trd')?.textContent ?? null);
      res.trdCut = [...document.querySelectorAll('#view .board .row .trd')].filter(x => x.scrollWidth > x.clientWidth + 1).map(x => x.textContent);
      res.trh = document.querySelector('#view .trh')?.textContent ?? null;
      res.trio = [...document.querySelectorAll('#view .trio b')].map(x => x.textContent);
      res.p36 = [...document.querySelectorAll('#view ol.p36 li')].map(x => [x.querySelector('.nm').textContent, x.querySelector('.val').textContent]);
      res.hello = document.querySelector('#view a.hello')?.getAttribute('href') ?? null;
      res.step = document.querySelector('#view .st-t b')?.textContent ?? null;
      res.dirs = [...document.querySelectorAll('#view ul.dirbars li')].map(li => [...li.querySelectorAll('.dl .num')].map(x => x.textContent));
      res.foot = [...document.querySelectorAll('#view .foot .links a')].map(a => a.getAttribute('href'));
      res.dm = document.querySelectorAll('#view ul.dirbars .dm').length; res.below = (res.all.match(/올해 증권사 평균치\([^)]*\)보다 작게 봄/g) || []).length;
      return res;
};
const look = async p => { const r = await p.evaluate(probe, {banned: BANNED}); Object.assign(r, JSON.parse(JSON.stringify(r).replace(/\u00a0/g, ' '))); return r; }; // 날짜 붙임 띄어쓰기(10월\u00a08일 · 2026-10-12) → 보통 띄어쓰기로 맞댐
/** 화면 하나 판정(오류 · 넘침 · 21px · 대비 · 잘림 · 44px · 금지 말 · 토씨 · 입체 · 바둑판 · 영상 친구 · 달) */
function judge(tag, r, errs) {
  if (errs.length) fail(tag, '오류: ' + errs.slice(0, 2).join(' | '));
  if (r.over > 0) fail(tag, `옆 넘침 ${r.over}px`);
  if (r.small.length) fail(tag, '21px 미만: ' + r.small.slice(0, 3).join(' · '));
  if (r.lowc.length) fail(tag, '대비 낮음: ' + r.lowc.slice(0, 3).join(' · '));
  if (r.clip.length) fail(tag, '옆으로 잘림: ' + r.clip.slice(0, 3).join(' · '));
  if (r.taps.length) fail(tag, '44px 미만 누름: ' + r.taps.slice(0, 3).join(' · '));
  if (r.banned.length) fail(tag, '금지 말: ' + r.banned.join(' · '));
  { const m = (r.text + '\n' + r.all).match(/(코스닥|개인|기관)가 |(코스피|투자자)이 /); if (m) fail(tag, '토씨(받침 따라 이 · 가): ' + m[0].trim()); } // 2026-10-12 첫 화면 「코스닥가」
  if (r.canvas || r.d3) fail(tag, `입체 · 캔버스 ${r.canvas + r.d3}`);
  if (r.squares >= 20) fail(tag, `작은 네모 ${r.squares}개(바둑판)`);
  if (r.mo.length) fail(tag, '영상 친구 자리: ' + [...new Set(r.mo)].slice(0, 3).join(' · '));
  if (r.moN < 1) fail(tag, '영상 친구가 하나도 없음(맨 아래 꽃밭 · 도움말 무지개가 빠짐)');
  if (r.moonFace === false) fail(tag, '달 속 막비가 없음(제목 옆 달)');
}
const b = await chromium.launch(exe ? {executablePath: exe} : {});
const plans = [[360, 640, 0], [360, 640, 1], [360, 640, 2], [390, 844, 0], [900, 900, 0]];
let moTotal = 0; // 영상 친구 그림 수(화면 × 판 합)
const links = new Map(); // 길 → 그 화면에서 누를 수 있는 길(3번 누름 셈)
for (const [w, hgt, font] of plans) {
  const ctx = await b.newContext({viewport: {width: w, height: hgt}, reducedMotion: 'reduce'});
  await ctx.addInitScript(f => { try { localStorage.setItem('atlas:font', String(f)); } catch {} }, font);
  const p = await ctx.newPage();
  const errs = []; p.on('pageerror', e => errs.push('pageerror ' + e.message)); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  await p.goto(base + '/atlas/', {waitUntil: 'networkidle'});
  await p.waitForFunction(() => document.querySelector('#view h1'));
  for (const route of routes) {
    const tag = `${w}×${hgt}${font ? ' 글씨' + (font + 1) : ''} ${decodeURIComponent(route)}`;
    errs.length = 0;
    await p.evaluate(r => { location.hash = r; }, route);
    try {
      if (route === '#/info') await p.waitForFunction(() => !document.querySelector('#infoSheet').hidden && document.querySelector('#infoBody').childElementCount > 0, null, {timeout: 8000});
      else await p.waitForFunction(r => { const v = document.querySelector('#view'); return v.querySelector('h1') && (location.hash === r || (r === '#/' && location.hash === '')) && !v.querySelector('.boot'); }, route, {timeout: 8000});
    } catch { fail(tag, '그려지지 않음'); continue; }
    await p.waitForTimeout(60);
    const r = await look(p);
    screens++;
    judge(tag, r, errs);
    moTotal += r.moN;
    if (font === 0 && w === 390) links.set(route, r.links);
    const e = expect(route);
    if (e.head) { numbers++; if (!r.head.includes(e.head)) fail(tag, `머리 ${r.head} ≠ ${e.head}`); }
    if (e.title) { numbers++; if (!r.head.includes(e.title)) fail(tag, `머리 ${r.head} ≠ ${e.title}`); }
    if (e.axis) { numbers++; if (!r.text.includes(e.axis)) fail(tag, `그림 아래 「${e.axis}」 없음`); }
    if (!route.endsWith('/grow') && !route.endsWith('/rivals')) for (const old of ['3개월', '7월 6일']) if (r.text.includes(old) && !(old === '3개월' && route === '#/')) fail(tag, `옛 3개월 창 글 「${old}」이 남음`); // 첫 화면은 코스피 · 코스닥 3개월 그림(2026-10-12 14:54)이라 「3개월」을 봐줌 // 5단 · 6단은 지수 창을 쓰지 않고 기사 사실(예: 「딜러 재고가 3개월 수준」)을 그대로 보임
    if (e.up != null) { numbers += 2; if (!r.count.includes(e.up + '곳 오름') || !r.count.includes(e.down + '곳 내림')) fail(tag, `오름 · 내림 ${r.count}`); }
    if (e.rows) { numbers += e.rows.length; const got = JSON.stringify(r.rows), want = JSON.stringify(e.rows); if (got !== want) fail(tag, `줄 ${got.slice(0, 120)} ≠ ${want.slice(0, 120)}`); }
    if (e.step) { numbers++; if (r.step !== `7단 중 ${e.step}단`) fail(tag, `7단 표시 ${r.step} ≠ ${e.step}단`); }
    for (const old of ['5단 중', '5단으로 내려갑니다', '사기 전에 볼 것', '4단 앞으로 클까?', '5단 범위', '앞날 값은 내지 않습니다', '지금의 몇 배쯤', '조사하는 중이라 다음 차례에 채웁니다', '기본 문 여섯']) if (r.all.includes(old) || r.text.includes(old)) fail(tag, `옛 글 「${old}」이 남음`); // 7단 · 2026-10-12 네 팀 점검으로 바꾼 글
    if (e.dm !== undefined) { numbers++; if (r.dm !== e.dm) fail(tag, `7단 365곳 가운데값 눈금 ${r.dm} ≠ ${e.dm}`); }
    if (e.below !== undefined) { numbers++; if (r.below !== e.below) fail(tag, `6단 「올해 짐작보다 작게 봄」 ${r.below} ≠ ${e.below}`); }
    if (e.step === 3 && (r.all.includes('매수 검토 36곳 가운데') || r.all.includes('봉인 1호에 든 회사'))) fail(tag, '3단에 36곳 · 봉인 줄이 남음(7단으로 옮김)');
    if (e.trd) { numbers += e.trd.length; if (JSON.stringify(r.trd) !== JSON.stringify(e.trd)) fail(tag, `방향 · 세기 줄 ${JSON.stringify(r.trd).slice(0, 120)} ≠ ${JSON.stringify(e.trd).slice(0, 120)}`); }
    if (r.trdCut?.length) fail(tag, '방향 · 세기 줄이 잘림: ' + r.trdCut.slice(0, 2).join(' · '));
    if (e.trh) { numbers++; if (r.trh !== e.trh) fail(tag, `머리 밑 방향 ${r.trh} ≠ ${e.trh}`); }
    if (e.dirs !== undefined) { numbers += 9; if (e.dirs && JSON.stringify(r.dirs) !== JSON.stringify(e.dirs)) fail(tag, '4방향 숫자 다름'); if (!e.dirs && !r.text.includes('? 셈 못 함')) fail(tag, '셈 못 함 표시 없음'); if (e.dirs && !r.text.includes(e.status)) fail(tag, '36곳 자리 글 다름 ' + e.status); }
    if (route === '#/') { numbers++; if (r.hello !== '/hello.html') fail(tag, '첫 화면 맨 위 「친구에게 소개하기」 없음(규칙 45)'); }
    if (route === '#/' && e.hub) { // 맨 위 슬라이드 7장(사장님 19:59 · 20:11) — 바 칸을 차례로 눌러 장마다 다시 잼 + 「자세히」 다섯도 열어 잼(숨은 장 · 접힌 자세히도 21px · 대비 · 잘림 · 44px · 글)
      for (let k = 0; k < HUBID.length; k++) {
        await p.evaluate(k => document.querySelectorAll('#view .hbar [role=tab]')[k].click(), k); await p.waitForTimeout(40);
        const hs = await p.evaluate(() => { const tabs = [...document.querySelectorAll('#view .hbar [role=tab]')], ss = [...document.querySelectorAll('#view .hs')], shown = ss.filter(x => getComputedStyle(x).visibility === 'visible'), sel = tabs.filter(t => t.getAttribute('aria-selected') === 'true');
          const vp = document.querySelector('#view .hvp').getBoundingClientRect(), sb = shown[0]?.getBoundingClientRect();
          return {n: tabs.length, ns: ss.length, shown: shown.map(x => x.id), sel: sel.map(t => t.getAttribute('aria-controls')), tabi: tabs.filter(t => t.tabIndex === 0).length, inert: ss.filter(x => x.inert).length, text: (shown[0]?.innerText ?? '').replace(/ /g, ' '),
            marks: tabs.map(t => t.querySelector('.hm')?.textContent ?? ''), rows: new Set(tabs.map(t => Math.round(t.getBoundingClientRect().top))).size, inside: !!sb && Math.abs(sb.left - vp.left) < 2 && Math.abs(sb.right - vp.right) < 2,
            now: document.querySelector('#view .hnow .hn')?.textContent.replace(/ /g, ' ') ?? '', det: !document.querySelector('#view .hdet').hidden}; });
        const tk = `${tag} · ${k + 1}장 ${HUBNM[k]}`; numbers += 4;
        if (hs.n !== 7 || hs.ns !== 7) fail(tk, `바 칸 ${hs.n} · 장 ${hs.ns}(일곱이어야)`);
        if (hs.shown.length !== 1 || hs.sel.length !== 1 || hs.sel[0] !== hs.shown[0] || hs.shown[0] !== 'hs-' + HUBID[k] || hs.tabi !== 1 || hs.inert !== 6) fail(tk, `보이는 장 ${hs.shown.join(',')} · 고른 칸 ${hs.sel.join(',')} · 누름 차례 ${hs.tabi} · 잠긴 장 ${hs.inert}`);
        if (!hs.inside) fail(tk, '보이는 장이 슬라이드 칸에 딱 맞지 않음(옆으로 밀림)');
        if (hs.rows !== 1) fail(tk, `바가 ${hs.rows}줄(한 줄이어야)`);
        if (hs.now !== `${k + 1} / 7 · ${HUBNM[k]}`) fail(tk, `「n / 7」 줄 ${hs.now}`);
        if (hs.det) fail(tk, '「자세히」를 안 눌렀는데 열려 있음');
        if (JSON.stringify(hs.marks) !== JSON.stringify(e.hub.marks)) fail(tk, `바 표시 ${JSON.stringify(hs.marks)} ≠ ${JSON.stringify(e.hub.marks)}`);
        for (const want of e.hub.slides[k]) { numbers++; if (!hs.text.includes(want)) fail(tk, `장 글 「${want}」 없음`); }
        if (k) { errs.length = 0; const r2 = await look(p); screens++; judge(tk, r2, errs); moTotal += r2.moN; }
        const id = HUBID[k]; if (!DETAIL.includes(id)) continue;
        await p.evaluate(id => document.querySelector(`#hs-${id} .hmore`).click(), id); await p.waitForTimeout(40);
        const hd = await p.evaluate(id => { const d = document.querySelector('#view .hdet'), shown = [...d.querySelectorAll('.hd')].filter(x => !x.hidden); return {open: !d.hidden, shown: shown.map(x => x.id), head: d.querySelector('.hdh b')?.textContent ?? '', text: (shown[0]?.innerText ?? '').replace(/ /g, ' ')}; }, id);
        const dk = `${tk} 자세히`; numbers += 2;
        if (!hd.open || hd.shown.length !== 1 || hd.shown[0] !== 'hd-' + id) fail(dk, `열린 자세히 ${hd.shown.join(',')}`);
        if (hd.head !== `자세히 — ${HUBNM[k]}`) fail(dk, `자세히 머리 ${hd.head}`);
        for (const want of e.hub.details[id]) { numbers++; if (!hd.text.includes(want)) fail(dk, `자세히 글 「${want}」 없음`); }
        errs.length = 0; const r3 = await look(p); screens++; judge(dk, r3, errs); moTotal += r3.moN;
        await p.evaluate(() => document.querySelector('#view .hclose').click()); await p.waitForTimeout(20);
      }
      await p.evaluate(() => document.querySelectorAll('#view .hbar [role=tab]')[0].click()); await p.evaluate(() => window.scrollTo(0, 0));
    }
    if (route !== '#/info') { numbers++; if (JSON.stringify(r.foot) !== JSON.stringify(['/hello.html', '/old/', '/us/'])) fail(tag, '맨 아래 길(소개 · 옛 ATLAS · 미국 판) 다름'); }
    if (e.p36) { numbers += e.p36.length + 2; if (JSON.stringify(r.p36) !== JSON.stringify(e.p36)) fail(tag, '36곳 줄 다름'); if (e.test && !r.text.includes(e.test)) fail(tag, '지난 기록 시험 글 다름'); if (!r.text.includes(e.total)) fail(tag, '1주씩 합계 다름'); }
    for (const want of e.why ?? []) { numbers++; if (!r.text.includes(want) && !r.all.includes(want)) fail(tag, `글 「${want}」 없음`); }
    if (e.trio) { numbers += 4; if (JSON.stringify(r.trio) !== JSON.stringify(e.trio)) fail(tag, `세 숫자 ${r.trio} ≠ ${e.trio}`); for (const pz of [].concat(e.price ?? [])) { numbers++; if (!r.text.includes(pz)) fail(tag, `1주 값 ${pz} 없음`); } }
    if (route === '#/' && w === 390 && font === 0) {
      await p.evaluate(() => [...document.querySelectorAll('#view .seg button')][1].click()); await p.waitForTimeout(900);
      const got = await p.evaluate(() => [...document.querySelectorAll('#view .board .row')].sort((a, b) => a.getBoundingClientRect().top - b.getBoundingClientRect().top).map(x => [x.querySelector('.nm').firstChild.textContent, x.querySelector('.trd')?.textContent]));
      const want = core.groups.slice().sort((a, b) => b.cw.at(-1) - a.cw.at(-1)).map(g => [g.short, trText(g.trc)]);
      numbers += want.length; if (JSON.stringify(got) !== JSON.stringify(want)) fail(tag + ' 큰 회사는 크게', `방향 · 세기 줄 ${JSON.stringify(got).slice(0, 120)} ≠ ${JSON.stringify(want).slice(0, 120)}`);
      await p.evaluate(() => [...document.querySelectorAll('#view .seg button')][0].click()); await p.waitForTimeout(600);
    }
    if (route === '#/info') await p.evaluate(() => { location.hash = '#/'; });
  }
  // 찾기 — 한 글자 · 첫 글자 · 영어 이름 소리 · 번호 · 365곳 밖
  if (font === 0) {
    for (const [q, want] of [['삼성', '삼성전자'], ['ㅅㅅㅈㅈ', '삼성전자'], ['에스케이하이', 'SK하이닉스'], ['005930', '삼성전자'], ['반도체 부품', '반도체 부품'], ['카카오', '365곳 밖']]) {
      await p.evaluate(() => { location.hash = '#/find'; });
      await p.waitForFunction(() => !document.querySelector('#findSheet').hidden);
      await p.fill('#q', q); await p.waitForTimeout(250);
      const t = await p.$eval('#hits', x => x.innerText);
      screens++; numbers++;
      if (!t.includes(want)) fail(`${w} 찾기 ${q}`, `결과에 ${want} 없음`);
      const clipF = await p.evaluate(() => { const H = document.querySelector('#hits').getBoundingClientRect(); return [...document.querySelectorAll('#hits li *')].filter(x => { const bx = x.getBoundingClientRect(); return bx.width > 0 && (bx.right > H.right + 1 || bx.left < H.left - 1); }).length; });
      if (clipF) fail(`${w} 찾기 ${q}`, `결과 줄이 옆으로 잘림 ${clipF}칸`);
      const errsF = errs.splice(0); if (errsF.length) fail(`${w} 찾기 ${q}`, '오류: ' + errsF[0]);
      await p.evaluate(() => { document.querySelector('[data-close="findSheet"]').click(); });
    }
    await p.evaluate(() => { location.hash = '#/x/035720'; });
    try { await p.waitForFunction(() => document.querySelector('#infoBody .funnel'), null, {timeout: 5000}); const t = await p.$eval('#infoBody', x => x.innerText); screens++; if (!/멈췄습니다/.test(t)) fail(`${w} 365곳 밖`, '까닭 줄 없음'); } catch { fail(`${w} 365곳 밖`, '깔때기 안 그려짐'); }
  }
  await ctx.close();
}
// 맨 위 슬라이드 둘레(사장님 2026-10-12 18:31 · 19:59 · 20:11 · CIA · 구글 · 애플팀 판정)
if (home) {
  const bars = p => p.evaluate(() => [...document.querySelectorAll('#view .hbar [role=tab]')].map(t => { const x = t.querySelector('.hm'), q = t.getBoundingClientRect(); return {mark: x?.textContent ?? '', inView: q.top >= 0 && q.bottom <= innerHeight, color: x?.textContent ? getComputedStyle(x).color : null, size: x ? parseFloat(getComputedStyle(x).fontSize) : null}; }));
  const curK = p => p.evaluate(() => [...document.querySelectorAll('#view .hbar [role=tab]')].findIndex(t => t.getAttribute('aria-selected') === 'true'));
  // ① 앞 회차 값 · 못 받은 값 · 문턱 넘은 값 → 1장(소개)을 보는 채로 바 칸에 금빛 「!」「?」(뒷장 조심이 숨지 않게 · 390×844 첫 화면 안)
  { const H2 = JSON.parse(JSON.stringify(home)); H2.stale = {flows: '2026-10-12 14:00'}; H2.us = null; H2.alerts = (home.alerts ?? []).filter(a => a.kind === 'idx'); if (!H2.alerts.length) H2.alerts = [{kind: 'idx', key: 'KOSPI', name: '코스피', v: -3.5}];
    const ctx = await b.newContext({viewport: {width: 390, height: 844}, reducedMotion: 'reduce'}); await ctx.route('**/atlas/data/home.json', r => r.fulfill({contentType: 'application/json', body: JSON.stringify(H2)}));
    const p = await ctx.newPage(), errs = []; p.on('pageerror', e => errs.push(e.message));
    await p.goto(base + '/atlas/', {waitUntil: 'networkidle'}); await p.waitForSelector('#view .hbar');
    const m = await bars(p), want = ['', '', '!', '', '?', '?', '']; screens++; numbers += 7;
    m.forEach((x, k) => { if (x.mark !== want[k]) fail('맨 위 슬라이드 조심 표시', `${k + 1}장 칸 「${x.mark}」 ≠ 「${want[k]}」`); if (x.mark && (!x.inView || x.size < 21 || x.color !== 'rgb(233, 196, 106)')) fail('맨 위 슬라이드 조심 표시', `${k + 1}장 칸 「${x.mark}」이 첫 화면에 금빛 21px 로 안 보임`); });
    if (await curK(p) !== 0) fail('맨 위 슬라이드 조심 표시', '처음 보이는 장이 1장(소개)이 아님');
    await p.evaluate(() => document.querySelector('#hs-flow .hmore').click()); const t4 = await p.evaluate(() => document.querySelector('#hd-flow').innerText.replace(/ /g, ' '));
    if (!t4.includes('? 이번에 못 받아 앞 회차(10월 12일(월) 14:00) 값입니다')) fail('맨 위 슬라이드 조심 표시', '5장 자세히에 앞 회차 꼬리표 없음');
    await p.evaluate(() => document.querySelectorAll('#view .hbar [role=tab]')[5].click()); const t5 = await p.evaluate(() => document.querySelector('#hs-us').innerText);
    if (!t5.includes('? 미국 값을 못 받았습니다')) fail('맨 위 슬라이드 조심 표시', '6장에 「?」 없음');
    if (errs.length) fail('맨 위 슬라이드 조심 표시', '오류 ' + errs[0]);
    await ctx.close(); }
  // ② home.json 을 못 읽음 → 슬라이드 없이 옛 소개 띠 + 「?」 한 줄 · 경주는 그대로 · 오류 없음
  { const ctx = await b.newContext({viewport: {width: 360, height: 640}, reducedMotion: 'reduce'}); await ctx.route('**/atlas/data/home.json', r => r.fulfill({status: 404, body: 'no'}));
    const p = await ctx.newPage(), errs = []; p.on('pageerror', e => errs.push(e.message));
    await p.goto(base + '/atlas/', {waitUntil: 'networkidle'}); await p.waitForSelector('#view h1');
    const r = await p.evaluate(() => ({hub: !!document.querySelector('#view .hub'), hello: document.querySelector('#view a.hello')?.getAttribute('href') ?? null, h1: document.querySelector('#view h1').textContent, q: document.querySelector('#view p.q')?.textContent ?? '', rows: document.querySelectorAll('#view .board .row').length}));
    screens++; numbers++; if (r.hub || r.hello !== '/hello.html' || r.h1 !== '오늘 시장 — ?' || !r.q.includes('못 읽었습니다') || r.rows !== core.groups.length) fail('첫 화면 자료 없음', JSON.stringify(r).slice(0, 160));
    if (errs.length) fail('첫 화면 자료 없음', '오류 ' + errs[0]);
    await ctx.close(); }
  // ③ 다음 날 아침 9:30(값은 그대로) → 장 · 자세히 제목에 「오늘」 없음 · 어제 장 중 값을 「장 중」이라 하지 않음(CIA)
  { const ctx = await b.newContext({viewport: {width: 390, height: 844}, reducedMotion: 'reduce'}); const p = await ctx.newPage(), errs = []; p.on('pageerror', e => errs.push(e.message));
    await p.clock.setFixedTime(new Date(Date.parse(home.kst.slice(0, 10) + 'T00:30:00Z') + 864e5));
    await p.goto(base + '/atlas/', {waitUntil: 'networkidle'}); await p.waitForSelector('#view .hbar');
    const r = await p.evaluate(() => ({heads: [...document.querySelectorAll('#view .hub h1, #view .hub h2')].map(x => x.textContent), when: document.querySelector('#hs-today .when')?.textContent ?? ''}));
    screens++; numbers += 2; const bad = r.heads.filter(t => t.includes('오늘')); if (bad.length) fail('다음 날 아침', '어제 값에 「오늘」: ' + bad.join(' · '));
    if (r.when.includes('값이 아직 바뀝니다')) fail('다음 날 아침', '어제 장 중에 받은 값을 「장 중 — 값이 아직 바뀝니다」라 함');
    if (errs.length) fail('다음 날 아침', '오류 ' + errs[0]);
    await ctx.close(); }
  // ④ 손가락 밀기(390 · 손가락 켬 · 움직임 줄이기 — 저절로 안 넘어감) — 왼쪽 = 다음 장 · 오른쪽 = 앞 장 · 세로 = 그대로 · 소개 고리 위 밀기 = 소개로 안 감 · 끝 장 = 제자리 · 주소 그대로
  { const ctx = await b.newContext({viewport: {width: 390, height: 844}, hasTouch: true, isMobile: true, reducedMotion: 'reduce'}); const p = await ctx.newPage(), errs = []; p.on('pageerror', e => errs.push(e.message));
    await p.goto(base + '/atlas/', {waitUntil: 'networkidle'}); await p.waitForSelector('#view .hbar');
    const cdp = await ctx.newCDPSession(p);
    const swipe = async (x0, y0, x1, y1) => { await cdp.send('Input.dispatchTouchEvent', {type: 'touchStart', touchPoints: [{x: x0, y: y0}]}); for (let i = 1; i <= 8; i++) { await cdp.send('Input.dispatchTouchEvent', {type: 'touchMove', touchPoints: [{x: x0 + (x1 - x0) * i / 8, y: y0 + (y1 - y0) * i / 8}]}); await p.waitForTimeout(16); } await cdp.send('Input.dispatchTouchEvent', {type: 'touchEnd', touchPoints: []}); await p.waitForTimeout(600); };
    const vp = await p.evaluate(() => { const q = document.querySelector('#view .hvp').getBoundingClientRect(); return {x: Math.round(q.left + q.width / 2), y: Math.round(q.top + q.height / 2)}; });
    const chk = (ok, what) => { numbers++; if (!ok) fail('손가락 밀기', what); };
    await swipe(vp.x + 90, vp.y, vp.x - 90, vp.y + 6); chk(await curK(p) === 1, '1장(소개 고리 위)에서 왼쪽으로 밀어도 2장이 아님'); chk(await p.evaluate(() => location.pathname.startsWith('/atlas')), '소개 고리 위 밀기로 소개 화면으로 넘어감');
    await swipe(vp.x + 90, vp.y, vp.x - 90, vp.y); chk(await curK(p) === 2, '2장에서 왼쪽으로 밀어도 3장이 아님');
    await swipe(vp.x - 90, vp.y, vp.x + 90, vp.y); chk(await curK(p) === 1, '오른쪽으로 밀어도 앞 장이 아님');
    await swipe(vp.x, vp.y + 120, vp.x + 40, vp.y - 120); chk(await curK(p) === 1, '세로로 끌었는데 장이 바뀜');
    await p.evaluate(() => document.querySelectorAll('#view .hbar [role=tab]')[6].click()); await swipe(vp.x + 90, vp.y, vp.x - 90, vp.y); chk(await curK(p) === 6, '끝 장(7장)에서 왼쪽으로 밀었더니 장이 바뀜');
    chk(await p.evaluate(() => ['', '#/'].includes(location.hash)), '밀기로 주소가 바뀜');
    await p.waitForTimeout(5600); chk(await curK(p) === 6, '움직임 줄이기인데 저절로 넘어감');
    screens++; if (errs.length) fail('손가락 밀기', '오류 ' + errs[0]);
    await ctx.close(); }
  // ⑤ 저절로 넘김(움직임 켬 · 390) — 5초마다 다음 장 · 손대면 멈춤 · 「‖ 멈춤」 단추로 다시 넘김(WCAG 2.2.2)
  { const ctx = await b.newContext({viewport: {width: 390, height: 844}}); const p = await ctx.newPage(), errs = []; p.on('pageerror', e => errs.push(e.message));
    await p.goto(base + '/atlas/', {waitUntil: 'networkidle'}); await p.waitForSelector('#view .hbar');
    const chk = (ok, what) => { numbers++; if (!ok) fail('저절로 넘김', what); };
    chk(await curK(p) === 0, '처음 장이 1장(소개)이 아님');
    await p.waitForTimeout(5600); chk(await curK(p) === 1, '5초 뒤 2장으로 안 넘어감');
    await p.waitForTimeout(5200); chk(await curK(p) === 2, '10초 뒤 3장으로 안 넘어감');
    chk(await p.evaluate(() => document.querySelector('#view .hplay').textContent.includes('멈춤')), '「‖ 멈춤」 단추가 없음');
    await p.dispatchEvent('#view .hvp', 'pointerdown'); const k0 = await curK(p); await p.waitForTimeout(6000); chk(await curK(p) === k0, '손댄 뒤에도 저절로 넘어감');
    chk(await p.evaluate(() => document.querySelector('#view .hplay').textContent.includes('넘기기')), '멈춘 뒤 「▶ 넘기기」 단추가 없음');
    await p.click('#view .hplay'); await p.waitForTimeout(5600); chk(await curK(p) === (k0 + 1) % 7, '「▶ 넘기기」를 눌러도 다시 안 넘어감');
    await p.evaluate(() => document.querySelector('#hs-' + ['hello', 'today', 'idx', 'sec', 'flow', 'us', 's365'][[...document.querySelectorAll('#view .hbar [role=tab]')].findIndex(t => t.getAttribute('aria-selected') === 'true')] + ' .hmore')?.click());
    screens++; if (errs.length) fail('저절로 넘김', '오류 ' + errs[0]);
    await ctx.close(); }
}
// 경주(움직임 켬) — 8초 뒤 맨 위 줄 = 20거래일 1등 갈래 · 금빛 테
{
  const ctx = await b.newContext({viewport: {width: 390, height: 844}});
  const p = await ctx.newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto(base + '/atlas/', {waitUntil: 'networkidle'});
  await p.evaluate(() => document.querySelector('#view .board').scrollIntoView({block: 'center'})); // 경주는 화면에 들어올 때 한 번 저절로(위에 여섯 장 · 애플팀 2026-10-12 18:31)
  const mid = await p.evaluate(() => new Promise(res => setTimeout(() => res(document.querySelector('.tell .t').textContent), 1500)));
  await p.waitForTimeout(6500);
  const top = await p.evaluate(() => { const rows = [...document.querySelectorAll('.board .row')].sort((a, b) => a.getBoundingClientRect().top - b.getBoundingClientRect().top); return {name: rows[0].querySelector('.nm').firstChild.textContent, win: rows[0].classList.contains('win')}; });
  const want = core.groups[0].short; screens++;
  if (top.name !== want || !top.win) fail('경주', `끝 맨 위 ${top.name}(${top.win}) ≠ ${want}`);
  if (!/월/.test(mid)) fail('경주', '날짜 줄이 흐르지 않음: ' + mid);
  if (errs.length) fail('경주', '오류 ' + errs[0]);
  await ctx.close();
}
await b.close();
// 3번 누르면 회사 — 첫 화면에서 화면 안 링크로만 가장 짧은 누름 수(390 · 보통 글씨에서 모은 링크)
const depth = new Map([['#/', 0]]), q = ['#/'];
while (q.length) { const r = q.shift(); for (const l of links.get(r) ?? []) { const n = l === '#/' ? '#/' : l; if (!depth.has(n)) { depth.set(n, depth.get(r) + 1); if (links.has(n)) q.push(n); } } }
let far = 0; for (const c of Object.keys(comp)) { const d = depth.get('#/c/' + c); if (d == null || d > 3) { far++; fail('3번 누름', `${comp[c].name} ${d ?? '닿지 않음'}`); }
  for (const [sub, n, nm] of [['past', 4, '4단 지나온 길'], ['rivals', 5, '5단 누구와 다투나'], ['grow', 6, '6단 앞으로 클까?'], ['range', 7, '7단 범위 · 확인']]) { const dn = depth.get(`#/c/${c}/${sub}`); if (dn == null || dn > n) fail(nm, `${comp[c].name} ${dn ?? '닿지 않음'}`); } }
const max7 = Math.max(...Object.keys(comp).map(c => depth.get(`#/c/${c}/range`) ?? 99));
const res = {schema: 'atlas-new-check-1', made: new Date().toISOString(), base, plans: plans.map(([w, h, f]) => `${w}×${h}${f ? ' 글씨' + (f + 1) : ''}`), routes: routes.length, screens, numbers, click3: {companies: Object.keys(comp).length, over3: far, max: Math.max(...Object.keys(comp).map(c => depth.get('#/c/' + c) ?? 99))}, click7: {deepest: max7, steps: ['갈래', '업종', '회사', '지나온 길', '누구와 다투나', '앞으로 클까?', '범위 · 확인']}, friends: {shown: moTotal, kinds: 11}, fails: fails.length, kinds: Object.entries(fails.reduce((m, f) => { const k = f.what.replace(/[\d.]+px/g, 'n').replace(/:.*$/, '').slice(0, 30); m[k] = (m[k] ?? 0) + 1; return m; }, {})), all: fails};
fs.mkdirSync(path.dirname(out), {recursive: true}); fs.writeFileSync(out, JSON.stringify(res, null, 1) + '\n');
if (arg('--links')) fs.writeFileSync(path.resolve(arg('--links')), JSON.stringify(Object.fromEntries(links)) + '\n'); // 길 지도(390 · 보통 글씨에서 화면마다 누를 수 있는 길) — 1억 번 눌러 보기(click_walk.mjs)가 읽음
console.log(JSON.stringify({screens, numbers, fails: fails.length, click3: res.click3, first: fails.slice(0, 8)}));
process.exit(fails.length ? 1 : 0);
