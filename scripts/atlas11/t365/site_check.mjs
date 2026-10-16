#!/usr/bin/env node
// 새 ATLAS(aaa7377.com/atlas/) 화면 빠짐없이 돌기 — 첫 화면 · 갈래 · 업종(1곳뿐인 업종은 회사로 넘어감) · 회사 365 · 업종 탭 · 도움말 · 찾기 · 365곳 밖
//   2026-10-13 06:45 사장님 「매수 검토 36곳 영구 삭제 하라」: 36곳 화면 · 탭 · 7단 차례 줄 · 봉인 36곳을 지움 — 모든 화면에 「36곳 · 매수 검토」 글 · #/36 길 0 · #/36 은 첫 화면으로(「36곳 없음」 검사)
//   2026-10-14 06:05 멍거 · 린치 조건(ml-v1 · 「가」): 회사 화면 「왜 멍거 · 린치 조건 N곳에 들었나요?」 넘은 갈래마다 값(멍거 세 조건 · 린치 두 조건) · 이름 밑 갈래마다 수 · 깔때기 두 갈래 ·
//   2026-10-14 00:03 멍거 조건(mg-v1 · 「가 로 하자」): 회사 화면 「왜 멍거 조건 N곳에 들었나요?」 세 조건 해마다 값 · 이름 밑 세 조건 · 옛 「힘 붙은 365곳」 글 0 ·
//   (옛) 2026-10-13 13:04 힘 붙은 365곳(h365-v1 · 「힘이 붙는 종목으로」): 회사 화면 「왜 365곳에 들었나요?」 든 까닭 · 앞 10거래일 → 뒤 10거래일 · 뒤 − 앞 · 문턱 · 이름 밑 한 줄 ·
//     도움말 고른 곳 · 안 고른 곳 가운데값 · 회차 시각 = slots · 깔때기 숫자도 맞댐 · 옛 기준 말(대세 · 층 · 두 팀) 0(지난 회차 「옛 규칙(대세 업종)」 꼬리표 · 봉인 화면 빼고) · 순위 글 0 · 좁은 금지 말 9개 0
//   쓰는 법: node scripts/atlas11/t365/site_check.mjs --base http://127.0.0.1:8899 [--pw /opt/node-tools/] [--out reports/atlas11/verify/atlas-new-check-latest.json]
//   폭 셋(360×640 · 390×844 · 900×900) × 글씨 셋(보통 · 크게 · 아주 크게 — 360 에서만 셋, 나머지는 보통)마다 화면마다 본다:
//     오류 0(보안 규칙 CSP 걸림 포함) · 옆 넘침 0 · 보이는 글씨 21px 이상 · 누르는 자리 44px 이상 · 금지 말 0 · 캔버스 · 3D 0 · 작은 네모 20개 이상(바둑판) 0
//     글자 대비(2026-10-11 13:29 「고급스럽게 … 구글팀이라면」) — 보이는 글마다 글자색 ÷ 뒤 바탕(조상 바탕색 · 번짐 색 마디를 겹쳐 셈 · 경주판 줄은 막대 색까지)이
//       보통 글 4.5 · 큰 글(24px 이상 · 굵은 18.66px 이상) 3 넘게(WCAG 2.2 1.4.3) · 못 가는 단(흐린 칸)은 빼고 셈
//     숫자 = 자료(머리 % · 오름/내림 수 · 줄마다 % · 회사 세 숫자 · 1주 값 — 3단 회사 · 4단 처음과 끝) · 3번 누르면 회사 · n단은 n번 안(4 지나온 길 · 5 누구와 다투나 · 6 앞으로 클까? · 7 범위 · 확인 — 첫 화면에서 링크를 따라 가장 짧은 누름 수)
//   7단(사장님 2026-10-12 00:50 「지금 5단계 클릭이잖아 7단계로 한다」 · 네 팀): 「7단 중 n단」 · 옛 5단 글(「5단 중」 · 「사기 전에 볼 것」 · 3단 36곳 줄 · 3단 「4단 앞으로 클까?」)이 어느 화면에도 없음 · 접은 글(「자세히」)도 금지 말 · 기대 글을 봄(textContent)
//   먹빛 첫 화면(사장님 2026-10-15(싱가포르) 09:41 「(나)는 아니야 너가 제일 스마트하게 만들어 … 만배는 더 스마트 한게 만들어」 · 규칙 67 — 맨 위 슬라이드 7장을 바꿈):
//     판 · 글씨마다 사장님 글 글자 그대로 · 지운 글 0 · 칸 차례 · 칸마다 첫 줄(오늘 한 줄 = 평소와 견줌 · 10곳 중 n곳 · 1주 1등 업종 · 가장 많이 사고판 쪽 · 미국 · 고른 곳 · 큰 갈래)을 자료에서 따로 셈해 맞댐 ·
//     금빛 알림 = 문턱(home-v3)을 넘은 것만 · 금빛 21px · 요즘 오르는 업종 줄(차례 · 값 · 선 색 = 숫자 색 · 고리 · 금빛 「고른 n곳」) · 강한 · 약한 업종 셋씩 고리 · 고른 곳 고리(제 평소의 2.5배) · 큰 갈래 고리 ·
//     「어떻게 셌나요?」를 다 열어 다시 잼 · 둘레: 큰 날 · 모르는 값 · 자료 없음 · 장 중 · 다음 날 아침 · 고른 단추 기억 · 여는 홍표(5초 · 다시 안 함) · 움직임 줄이기
//   평소와 견줌(오늘의 눈금 셈 — 2026-10-12 23:10 다섯 팀): 종가에서 따로 셈한 글(gaugeX · todayX)과 화면 첫 줄을 맞댐
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
// 모든 회사(사장님 2026-10-14 12:01(싱가포르) 「나」) — 갈래 · 업종 · 회사 흐름 = 모든 회사 · 고른 곳은 금빛(줄 왼쪽 띠 · 이름표) · 업종 화면 회사 줄 = 모든 회사 자료(mkt.json)
const MKT = core.mkt ? JSON.parse(fs.readFileSync(path.join(ROOT, 'site/atlas/data/mkt.json'), 'utf8')).companies : null;
const MA = core.mkt ?? core.all, loc = n => Number(n).toLocaleString('ko-KR');
const rng = JSON.parse(fs.readFileSync(path.join(ROOT, 'site/atlas/data/range.json'), 'utf8')); // 7단 범위(range-v1)
const days = JSON.parse(fs.readFileSync(path.join(ROOT, 'site/atlas/data/days.json'), 'utf8'));
const upd = JSON.parse(fs.readFileSync(path.join(ROOT, 'site/atlas/data/updates.json'), 'utf8')); // 업데이트 탭(사장님 12:41)
const tdata = fs.existsSync(path.join(ROOT, 'site/atlas/data/time.json')) ? JSON.parse(fs.readFileSync(path.join(ROOT, 'site/atlas/data/time.json'), 'utf8')) : null; // 봉인 시간(14:37 · 14:39 「3년후 5년후 10년후 이야기」)
const NAMES = JSON.parse(fs.readFileSync(path.join(ROOT, 'site/atlas/data/names.json'), 'utf8')), OUT1 = NAMES.rows.find(r => r.s !== 'in'), OUTL = NAMES.rows.findLast(r => r.s !== 'in'); // 찾기 · 365곳 밖 보기 — 365곳 밖 첫 회사(번호를 박지 않음 · 회차마다 바뀜 · 애플팀 2026-10-13)
const coOf = c => JSON.parse(fs.readFileSync(path.join(ROOT, 'site/atlas/data/co', c + '.json'), 'utf8'));
// 모든 회사 7단(사장님 2026-10-14 17:21(싱가포르) 「그리고 7단 클릭구조 부활 시켜」 · 17:25 「전부다 나오게 해」) — core.co7 이면 모든 회사가 3 ~ 7단 · 고른 곳 밖은 회사 파일의 3단 자료(c) · 선(line)
const CO7 = !!(core.co7 && MKT), OTH = CO7 ? Object.keys(MKT).filter(c => !comp[c]) : [];
const CO = c => comp[c] ?? coOf(c).c, LINE = c => (comp[c] ? lines[c] : coOf(c).line);
const lines0 = JSON.parse(fs.readFileSync(path.join(ROOT, 'site/atlas/data/lines.json'), 'utf8')), lines = lines0.lines; // 3단 100만 원 줄(기준일 = 100 · 2026-10-12 클로드팀) · 첫 화면 고른 곳 「크게 움직인 곳」(asOf)
const home = fs.existsSync(path.join(ROOT, 'site/atlas/data/home.json')) ? JSON.parse(fs.readFileSync(path.join(ROOT, 'site/atlas/data/home.json'), 'utf8')) : null; // 첫 화면 종합 정보(2026-10-12 14:54)
const surgecal = fs.existsSync(path.join(ROOT, 'site/atlas/data/surgecal.json')) ? JSON.parse(fs.readFileSync(path.join(ROOT, 'site/atlas/data/surgecal.json'), 'utf8')) : null; // 급등 달력 · 따라가기(사장님 2026-10-15 16:34 · 16:40 · sk-v1)
const surge = fs.existsSync(path.join(ROOT, 'site/atlas/data/surge.json')) ? JSON.parse(fs.readFileSync(path.join(ROOT, 'site/atlas/data/surge.json'), 'utf8')) : null; // 급등 탭(사장님 2026-10-15 14:27 「탭을 하나 더 만들어라」 · 규칙 69)
// 달력 탭(사장님 2026-10-15 19:28 · 20:04 「달력에 종목이름 등락률」 · 20:51 「추적하는 시스탬」 · 21:24 「가 로 해」 · 규칙 70) — 첫 화면 몫 · 종목 파일 몫
const condX = fs.existsSync(path.join(ROOT, 'site/atlas/data/cond.json')) ? JSON.parse(fs.readFileSync(path.join(ROOT, 'site/atlas/data/cond.json'), 'utf8')) : null; // 조건 찾기 탭(사장님 2026-10-15(싱가포르) 23:53 · 23:54 「가」 · 규칙 72 · cd-v1)
const trData = fs.existsSync(path.join(ROOT, 'site/atlas/data/surgetr.json')) ? JSON.parse(fs.readFileSync(path.join(ROOT, 'site/atlas/data/surgetr.json'), 'utf8')) : null;
const trCase = fs.existsSync(path.join(ROOT, 'site/atlas/data/surgetr-case.json')) ? JSON.parse(fs.readFileSync(path.join(ROOT, 'site/atlas/data/surgetr-case.json'), 'utf8')).cases : null;
// 바탕 회사 이름 · 밑 한 줄(사장님 2026-10-14 00:03 「가 로 하자」 · mg-v1 멍거 조건 — 수는 자료에서) · 억 원 글(atlas.js eok 과 같은 셈을 따로 적음)
const PN = `${core.rules.name} ${core.funnel.picked}곳`, NPK = core.funnel.picked, PLINE = core.rules.line ?? core.rules.conds.map(x => x.t).join(' · ');
const eokS = v => { if (v == null) return '?'; const s = v < 0 ? '−' : '', a = Math.abs(v); if (a >= 10000) return s + (Math.floor(a / 10000 * 10 + 0.5 + 1e-7) / 10).toLocaleString('ko-KR', {maximumFractionDigits: 1}) + '조 원'; return s + Math.round(a).toLocaleString('ko-KR') + '억 원'; };
const DOW = ['일', '월', '화', '수', '목', '금', '토'], mdw = d => `${+d.slice(5, 7)}월 ${+d.slice(8, 10)}일(${DOW[new Date(d + 'T00:00:00Z').getUTCDay()]})`;
const BANNED = ['예측', '예외 없이', '절대', '상승 신호', '폭락 경보기', '팔 때', '들어갈 때', '시작을 맞힌다', '곧 오른다', '오를 것', '내릴 것', '사라', '팔라', '추천', '목표가', '확실', '보장', '무조건', '확률'];
// 좁은 금지 말 · 옛 기준 말(힘 붙은 365곳 · 사장님 2026-10-13 13:04 「힘이 붙는 종목으로」 · 클로드팀) — inspect4.mjs NARROW · OLD_RULE_WORDS 와 같은 목록(시험이 맞대 봄)
// 지운 36곳 화면의 글 — inspect4.mjs OLD36_TEXT 와 같은 목록(시험이 맞대 봄) · 「36곳 내림」 같은 셈 글은 아님(2026-10-13 14:2x 바이오 갈래를 잘못 잡던 것)
const OLD36 = ['매수 검토', '셈 차례', '봉인 36곳', '365곳 · 36곳', '36곳이 365곳 평균보다', '한 달 평균: 36곳', '36곳은 셈으로 추린', '36곳 밖 —', '36곳 고리', '36곳 탭'];
const has36 = t => OLD36.some(w => String(t).includes(w));
const NARROW = ['유망', '주목', '강세', '놓치', '매수 신호', '살 만한', '모멘텀', '힘이 붙는', '급등주'];
const OLD_RULE_WORDS = ['대세', '1층 —', '2층 —', '3층 —', '두 팀 모두', '구글팀 잣대', 'CIA팀 잣대', '힘 붙은 365곳', '그중 「힘 붙음」', '빈자리에 들었습니다', '번째 안이라 남겼습니다']; // 뒤 넷: 2026-10-14 00:03 멍거 조건 뒤 옛 「힘 붙은 365곳」 글
const r1 = x => Math.sign(x) * Math.floor(Math.abs(x) * 10 + 0.5 + 1e-7) / 10; // 크기로 반올림(−7.25 → −7.3 · 화면 atlas.js r1 과 같은 뜻 · 다른 눈 점검 2026-10-15)
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
// 첫 화면 = 먹빛 판(사장님 2026-10-15(싱가포르) 09:41 「(나)는 아니야 너가 제일 스마트하게 만들어 … 만배는 더 스마트 한게 만들어」 · 규칙 67)
//   「오늘」은 보는 사람의 서울 날짜와 같을 때만 · 칸마다 보일 글은 자료에서 따로 만듦(atlas.js todayWords · idxAlerts · m4breadth · m4rise · m4flows · m4us · m4picks · m4groups 와 다른 길로 셈)
const todayK = () => new Date(Date.now() + 9 * 36e5).toISOString().slice(0, 10);
const kstNowX = () => new Date(Date.now() + 9 * 36e5).toISOString();
const eokW = v => { if (v == null) return '?'; const a = Math.abs(Math.round(v)), jo = Math.floor(a / 10000), r = a % 10000; return (jo ? jo.toLocaleString('ko-KR') + '조' + (r ? ' ' : '') : '') + (r || !jo ? r.toLocaleString('ko-KR') + '억' : '') + ' 원'; };
const numK = v => (v == null ? '?' : Number(v).toLocaleString('ko-KR', {minimumFractionDigits: 2, maximumFractionDigits: 2}));
// 평소와 견줌(오늘의 눈금 셈 그대로 — 2026-10-12 23:10 다섯 팀) — 화면(atlas.js gauge)과 따로 셈: 종가 쌍마다 하루 % · 평소 = 오늘 앞 20거래일 하루 움직임 크기 평균 ·
//   「n월 n일 뒤 가장 크게」 = 같은 쪽으로 오늘만큼 움직인 마지막 날이 5거래일 넘게 앞일 때만 · 3개월 안에 없으면 「3달 동안 가장 크게」 · 잇달아 = 같은 쪽으로 이어진 날 수와 그동안 비율
function gaugeX(x) {
  const c = (x?.rows ?? []).map(r => r[1]), dt = (x?.rows ?? []).map(r => r[0]); if (c.length < 22) return null;
  const mv = []; for (let i = c.length - 1; i >= 1; i--) if (c[i] > 0 && c[i - 1] > 0) mv.unshift({d: dt[i], v: (c[i] / c[i - 1] - 1) * 100});
  if (mv.length < 21) return null; const t = mv.at(-1).v, past = mv.slice(0, -1);
  const hit = past.map((m, i) => ({...m, back: past.length - i})).filter(m => (t < 0 ? m.v <= t : m.v >= t)).at(-1);
  const avg = past.slice(-20).map(m => Math.abs(m.v)).reduce((a, b) => a + b, 0) / 20;
  let run = 0, prod = 1; for (const m of [...mv].reverse()) { if (t === 0 || Math.sign(m.v) !== Math.sign(t)) break; run++; prod *= 1 + m.v / 100; }
  return {t, hit, ratio: avg > 0 ? Math.abs(t) / avg : null, run, runChg: (prod - 1) * 100};
}
const hasB = w => { const c = String(w).trim().slice(-1), k = c.charCodeAt(0) - 0xAC00; return k >= 0 && k <= 11171 ? k % 28 !== 0 : '013678'.includes(c); }; // 받침(숫자 끝은 소리로)
const jo = (w, a, b) => w + (hasB(w) ? a : b);
const a1 = x => pct(x).replace(/^[+−]/, '');
const p2 = v => (v == null ? '?' : (v > 0 ? '+' : v < 0 ? '−' : '') + Math.abs(v).toFixed(2) + '%');
const ampm = t => { if (!/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}/.test(String(t ?? ''))) return '?'; const hh = +t.slice(11, 13); return `${hh < 12 ? '오전' : '오후'} ${hh % 12 || 12}:${t.slice(14, 16)}`; };
const dayK = d => (!/^\d{4}-\d{2}-\d{2}/.test(String(d ?? '')) ? '?' : d.slice(0, 10) === todayK() ? '오늘' : md(d));
const onDayX = d => (!/^\d{4}-\d{2}-\d{2}/.test(String(d ?? '')) ? '' : d.slice(0, 10) === todayK() ? '오늘은' : `${md(d)}에는`);
/** 평소의 몇 배 — 2.40 ~ 2.49 는 둘째 자리에서 버림(문턱 2.5배 바로 밑이 「2.5배」로 보이지 않게) · 10 넘으면 자연수 */
const timesX = R => (R >= 2.4 && R < 2.5 ? (Math.floor(R * 100 + 1e-9) / 100).toString() : (R >= 10 ? Math.round(R) : Math.round(R * 10) / 10).toLocaleString('ko-KR'));
/** 오늘 한 줄(고른 지수 하나 — 처음은 코스피) · w = 그 조각을 받은 때(장 중에 받았으면 「… 오전 10:06까지」) */
function todayX(nm, X, w) {
  if (!X) return [`? ${nm} 값을 못 받았어요.`];
  const when = w?.intra && /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}/.test(w.t) && (!/^\d{4}-\d{2}-\d{2}/.test(String(X.date ?? '')) || w.t.slice(0, 10) === String(X.date).slice(0, 10)) ? `${dayK(w.t.slice(0, 10))} ${ampm(w.t)}까지` : dayK(X.date), g = gaugeX(X);
  if (!g) return [`${when} ${jo(nm, '은', '는')} ${pct(X.day)}예요.`, '? 3달 값이 모자라 평소와 견주지 못했어요.'];
  const t = g.t, did = t < 0 ? '내렸어요' : '올랐어요', R = g.ratio;
  if (pct(t) === '0.0%') return [`${when} ${jo(nm, '은', '는')} 거의 그대로였어요.`];
  const out = [`${when} ${jo(nm, '은', '는')} ${a1(t)} ${did}.`];
  if (R != null) out.push(R >= 1.25 ? `평소의 ${timesX(R)}배예요.` : R >= 0.8 ? '평소만큼 움직였어요.' : '평소보다 작게 움직였어요.');
  if (R != null && R >= 1.25) { if (!g.hit) out.push(`3달 동안 가장 크게 ${did}.`); else if (g.hit.back >= 5) out.push(`${md(g.hit.d)} 이후 가장 크게 ${did}.`); }
  if (g.run >= 3) out.push(`${g.run}거래일 잇달아 ${t < 0 ? '내렸고' : '올랐고'}, 그동안 ${a1(g.runChg)} ${t < 0 ? '빠졌어요' : '뛰었어요'}.`);
  return out;
}
/** 고른 곳마다 마지막 하루 ÷ 평소(앞 거래일 하루 움직임 크기 평균) — 선(lines.json) 날이 하루 값 날과 같을 때만 */
function bigPicksX(T) {
  if (!T?.list?.length || lines0.asOf !== T.date) return [];
  return T.list.map(([c]) => { const l = lines[c]; if (!l || l.length < 6 || l.at(-1) == null || l.at(-2) == null) return null; const ch = []; for (let k = 1; k < l.length; k++) if (l[k - 1] > 0 && l[k] > 0) ch.push((l[k] / l[k - 1] - 1) * 100);
    if (ch.length < 5) return null; const last = (l.at(-1) / l.at(-2) - 1) * 100, base = ch.slice(0, -1), m = base.reduce((a, x) => a + Math.abs(x), 0) / base.length; return {c, r: m > 0 ? Math.abs(last) / m : null}; }).filter(Boolean);
}
/** 「10곳 중 n곳」(오른 곳과 내린 곳) — 그대로가 오르내린 곳보다 많으면 「대부분 그대로」 · 모두면 「모두」 · 그 밖은 1 ~ 9 */
const brdX = (B, pre) => { const n = B.up + B.flat + B.down, dn = B.down >= B.up, c = dn ? B.down : B.up, did = dn ? '내렸어요' : '올랐어요', p0 = pre ? pre + ' ' : '';
  return B.flat > B.up + B.down ? `${p0}대부분 그대로였어요.` : c === n ? `${p0}모두 ${did}.` : `${p0}10곳 중 ${Math.min(9, Math.max(1, Math.round(c / n * 10)))}곳이 ${did}.`; };
/** 조각을 받은 때(atlas.js whenOf 와 따로 셈) — t = 받은 때(못 받았으면 앞 값의 때) · intra = 장 중(서울 9:00 ~ 15:30)에 받은 값 · now = 지금도 그 장 안 */
function wOfX(H, k, live) {
  const ST = H?.stale ?? {}, s0 = ST[k], ok = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}/.test(String(s0 ?? '')), t = (ok ? s0 : H?.kst ?? '').slice(0, 16), hm = t.slice(11, 16);
  const inS = () => { if (!H?.live) return false; const n = kstNowX(), x = n.slice(11, 16); return n.slice(0, 10) === String(H.kst ?? '').slice(0, 10) && x >= '09:00' && x < '15:30'; };
  const intra = ok ? (live ?? (hm >= '09:00' && hm < '15:30')) : !!(live ?? H?.live); return {t, stale: !!s0, intra, now: !s0 && intra && inS()};
}
function m4Expect(H) {
  const okI = x => (x && Array.isArray(x.rows) && x.rows.length >= 2 && x.rows.every(r => Array.isArray(r) && r[1] > 0) ? x : null);
  const K = okI(H?.idx?.KOSPI), Q = okI(H?.idx?.KOSDAQ), S = H?.sectors, B = S?.breadth, F = H?.flows, U = H?.us, T = H?.s365, ST = H?.stale ?? {}, RI = core.rise, A = H?.alerts ?? [];
  const isT = t => /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}/.test(String(t ?? ''));
  const wOf = (k, live) => wOfX(H, k, live);
  const tillX = (w, d) => (w.intra && isT(w.t) && (!/^\d{4}-\d{2}-\d{2}/.test(String(d ?? '')) || w.t.slice(0, 10) === String(d).slice(0, 10)) ? `${dayK(w.t.slice(0, 10))} ${ampm(w.t)}까지` : null); // 받은 날 = 값의 날일 때만
  const G1 = core.groups.slice().sort((a, b) => b.chg - a.chg)[0], heads = H ? ['시장', '오른 곳과 내린 곳', '요즘 오르는 업종', '사고팔기', '미국', `고른 ${NPK}곳`, `큰 갈래 ${core.groups.length}개`] : ['시장 — ?', '요즘 오르는 업종', `큰 갈래 ${core.groups.length}개`];
  const leads = [];
  if (H && (K || Q)) leads.push(todayX(K ? '코스피' : '코스닥', K ?? Q, wOf('idx', (K ?? Q).live)).join(' '));
  if (H && S && B && B.up + B.flat + B.down) { const w = wOf('sectors', undefined), d = /^\d{4}-\d{2}-\d{2}/.test(String(S.date ?? '')) ? S.date : H?.idx?.KOSPI?.date; leads.push(brdX(B, tillX(w, d) ?? onDayX(d))); }
  if (RI) leads.push(RI.list.length ? `1주 동안 가장 많이 오른 업종은 ${RI.list[0].name}${hasB(RI.list[0].name) ? '이에요' : '예요'}.` : '지난 1주 동안 오른 업종이 없어요.');
  if (H && F && (F.KOSPI || F.KOSDAQ)) { const m = F.KOSPI ? 'KOSPI' : 'KOSDAQ', mn = m === 'KOSPI' ? '코스피' : '코스닥', x0 = F[m], w = wOf('flows', F.live);
    const who = [['개인', x0.personal], ['외국인', x0.foreign], ['기관', x0.institutional]].filter(x => x[1] != null).sort((a, b) => Math.abs(b[1]) - Math.abs(a[1]))[0];
    const till = tillX(w, x0.date) ?? onDayX(x0.date);
    if (who) leads.push(`${till ? till + ' ' : ''}${mn}에서 ${jo(who[0], '이', '가')} 가장 많이 ${who[1] < 0 ? '팔았어요' : '샀어요'}.`); }
  const urows = Array.isArray(U?.rows) ? U.rows : [], uby = Object.fromEntries(urows.map(r => [r.key, r])), three = ['INX', 'IXIC', 'DJI'].map(k => uby[k]).filter(Boolean);
  if (H && U && three.length) { const up = three.filter(r => r.chg > 0).length, dl = onDayX(U.date);
    leads.push(`${dl ? dl + ' ' : ''}${three.length < 3 ? `${three.length}개 지수 가운데 ${up}개가 올랐어요.` : up === 3 ? '세 지수 모두 올랐어요.' : up === 0 ? '세 지수 모두 내렸어요.' : `세 지수 가운데 ${up}개가 올랐어요.`}`); }
  if (H && T?.list?.length) { const dl = onDayX(T.date); leads.push(`${dl ? dl + ' ' : ''}${T.up}곳이 오르고 ${T.down}곳이 내렸어요.${T.flat ? ` ${T.flat}곳은 그대로였어요.` : ''}${T.none ? ` 값이 없는 곳은 ${T.none}곳이에요.` : ''}`); }
  leads.push(`${md(core.base)}부터 ${core.days}거래일 동안 ${G1.chg < 0 ? '가장 덜 내린' : '가장 많이 오른'} 갈래는 ${jo(G1.short, '이에요', '예요')}.`);
  const alerts = [];
  { const ix = A.filter(a => a.kind === 'idx'), way = xs => (xs.every(a => a.v < 0) ? '내렸어요' : xs.every(a => a.v > 0) ? '올랐어요' : '움직였어요');
    if (H && (K || Q)) for (const why of ['big', 'usual']) { const xs = ix.filter(a => (a.why ?? 'usual') === why); if (xs.length) alerts.push(`! ${xs.length > 1 ? '코스피와 코스닥 모두' : jo(xs[0].name, '이', '가')} ${why === 'big' ? '하루 5% 넘게' : '평소의 2.5배 넘게'} ${way(xs)}.`); }
    if (H) for (const a of A.filter(a => a.kind === 'flow')) alerts.push(`! ${a.key === 'KOSDAQ' ? '코스닥' : '코스피'}에서 외국인이 하루 1조 원 넘게 ${a.v < 0 ? '팔았어요' : '샀어요'}.`); } // 두 시장 모두(다른 눈 M7)
  // 못 받은 값 — 받은 때마다 한 줄(그때 못 받은 칸에 보이는 조각을 지수 → 업종 → 사고판 돈 → 미국 지수 차례로 모두) · 그 칸 머리 때 앞에 「?」
  const NM = {idx: '지수', sectors: '업종', flows: '사고판 돈', us: '미국 지수'}, HID = {idx: 'm4-h-mk', sectors: 'm4-h-br', flows: 'm4-h-fl', us: 'm4-h-us'};
  const shown = {idx: !!(K || Q), sectors: !!S, flows: !!(F?.KOSPI || F?.KOSDAQ), us: three.length > 0}; // 칸에 보이는 조각(선을 그릴 수 있는 지수 · 세 지수 가운데 하나라도)
  const lv = {idx: (H?.idx?.KOSPI ?? H?.idx?.KOSDAQ)?.live, sectors: undefined, flows: F?.live, us: false};
  const byT = new Map(); for (const k of ['idx', 'sectors', 'flows', 'us']) if (H && ST[k] && shown[k]) { const t = isT(ST[k]) ? ST[k].slice(0, 16) : '?'; byT.set(t, [...(byT.get(t) ?? []), k]); }
  const notes = [...byT].map(([t, ks]) => { const nm = ks.map(k => NM[k]), intra = t !== '?' && ks.some(k => k !== 'us' && wOf(k, lv[k]).intra);
    return `? 이번에 ${nm.slice(0, -1).map(x => x + ' · ').join('')}${jo(nm.at(-1), '을', '를')} 못 받아 ${t === '?' ? '앞 값을 그대로 보여요.' : `${md(t)} ${ampm(t)}에 받은 값이에요.`}${intra ? ` ${ks.includes('us') ? '한국 값은 ' : ''}장 중 값이라 마감 값과 다를 수 있어요.` : ''}`; });
  const qHeads = Object.keys(HID).filter(k => H && ST[k] && shown[k]).map(k => HID[k]);
  // 고리 — 강한 · 약한 업종 셋씩 · 요즘 오르는 업종 줄 · 고른 곳(가장 많이 오른 · 내린 곳 + 제 평소의 2.5배 이상 움직인 곳 셋까지) · 큰 갈래 · 봉인
  const iOf = n => core.industries.find(x => x.name === n), hrefI = i => (i.n === 1 ? (CO7 || i.pk ? '#/c/' : '#/x/') + i.members[0] : '#/i/' + encodeURIComponent(i.name));
  const secH = g => { const n = core.secInd?.[String(g.name ?? '').replace(/\s+/g, '')], i = n ? iOf(n) : null; return i ? hrefI(i) : null; };
  const sec = H && S ? [...(S.strong ?? []).slice(0, 3), ...(S.weak ?? []).slice(0, 3)].map(g => [g.name, pct(g.chg), secH(g)]) : [];
  const movers = [], top2 = []; if (H && T?.list?.length) { const add = c => { if (c && !movers.includes('#/c/' + c)) movers.push('#/c/' + c); }; add(T.top?.c); add(T.bot?.c); top2.push(...movers);
    for (const x of bigPicksX(T).filter(x => x.r != null && x.r >= 2.5 && !movers.includes('#/c/' + x.c)).sort((a, b) => b.r - a.r)) add(x.c); } // 큰 차례로 셋 + 나머지(접은 칸)
  // 고른 곳 칸 소제목 — 「가장 많이 오른 곳과 내린 곳」 · (선 날이 같으면) 「제 평소의 2.5배 이상 움직인 곳 N곳 — …」
  let pickLabels = null; if (H && T?.list?.length) { const bp = bigPicksX(T), big = bp.filter(x => x.r != null && x.r >= 2.5), rest = big.filter(x => !top2.includes('#/c/' + x.c)), inTop = big.length - rest.length, k = Math.min(3, rest.length);
    pickLabels = top2.length ? ['가장 많이 오른 곳과 내린 곳'] : []; if (bp.length) pickLabels.push(!big.length ? '제 평소의 2.5배 이상 움직인 곳은 없어요' : `제 평소의 2.5배 이상 움직인 곳 ${big.length}곳` + (inTop && !rest.length ? ' — 모두 위에 있어요' : inTop ? ` — 위 ${inTop}곳 말고 ${rest.length > 3 ? '큰 차례로 ' : ''}${k}곳` : rest.length > 3 ? ` — 큰 차례로 ${k}곳` : '')); }
  const RN = core.rules?.name, sayPk = H && T?.list?.length && RN ? [`${RN}: ${PLINE}`, `${jo(RN, '으로', '로')} 센 것이고, ${jo(RN.replace(/ 조건$/, ''), '이', '가')} 고른 목록이 아니에요.`] : [];
  return {heads, leads, alerts, sec, movers, pickLabels, notes, qHeads, sayPk,
    rows: (RI?.list ?? []).map(r => [r.name, pct(r.chg)]), rowHref: (RI?.list ?? []).map(r => { const i = iOf(r.name); return i ? hrefI(i) : '#/list'; }), rowGold: (RI?.list ?? []).map(r => (core.mkt && iOf(r.name)?.pk ? `고른 ${iOf(r.name).pk}곳` : '')),
    groups: core.groups.slice().sort((a, b) => b.chg - a.chg).map(g => ['#/g/' + g.id, g.short, pct(g.chg)]), stale: notes.length > 0,
    letter: ['친구에게 소개하기', '홍표 35초 영상 · 보내기', '10명 소개하면 스타벅스 상품권 1만원!']};
}
const SV_BANDS = surge?.bands?.version === 'sb-v1' ? ['#/surge/10', '#/surge/20', '#/surge/30', '#/surge/40'] : []; // 급등 다섯 칸(16:28 「총 5개」 · 16:34 (가))
// 달력 탭 — 첫 화면 + 종목 파일 몇 곳(오늘 새로 · 사건이 가장 많은 곳 · 금빛 · 조심 · 가장 오른 · 가장 내린 · 가장 긴 이름)은 모든 판 · 글씨에서, 나머지 종목 파일은 390 · 보통 글씨 한 판에서(길 지도 · 3번 누름도)
const CAL_SAMPLE = (() => { if (!trData || !trCase) return []; const R = trData.cases.filter(r => trCase[r[0]]), out = new Set(), add = r => { if (r) out.add('#/cal/' + r[0]); };
  add(R.find(r => r[6] === 'n')); add([...R].sort((a, b) => trCase[b[0]].ev.length - trCase[a[0]].ev.length)[0]); add(R.find(r => r[7] || r[8])); add(R.find(r => trCase[r[0]].ev.some(e => e[1] === 'warn')));
  const vv = R.filter(r => r[5] != null).sort((a, b) => a[5] - b[5]); add(vv[0]); add(vv.at(-1)); add([...R].sort((a, b) => b[1].length - a[1].length)[0]); return [...out]; })();
const CROUTES = trData && trCase && !arg('--only') ? trData.cases.filter(r => trCase[r[0]]).map(r => '#/cal/' + r[0]).filter(r => !CAL_SAMPLE.includes(r)) : [];
const routes = ['#/', '#/list', ...(surge ? ['#/surge', ...SV_BANDS] : []), '#/up', ...(condX ? ['#/cond'] : []), ...(trData ? ['#/cal', ...CAL_SAMPLE] : []), ...(tdata ? ['#/time'] : []), ...core.groups.map(g => '#/g/' + g.id), ...core.industries.filter(i => i.n > 1).map(i => '#/i/' + encodeURIComponent(i.name)), ...Object.keys(comp).map(c => '#/c/' + c), ...Object.keys(comp).map(c => `#/c/${c}/past`), ...Object.keys(comp).map(c => `#/c/${c}/rivals`), ...Object.keys(comp).map(c => `#/c/${c}/grow`), ...Object.keys(comp).map(c => `#/c/${c}/range`), '#/info']; // 7단 — 5 누구와 다투나(rivals) · 6 앞으로 클까?(grow · 사장님 16:51 회사 성장 이야기) · 7 범위 · 확인(range)
const OLIM = arg('--others-limit') != null ? +arg('--others-limit') : null; // 고치는 동안 빨리(앞 n곳만) — 결과 others.full = false · 문은 못 지남
const OSEL = arg('--others-codes')?.split(','); // 고치는 동안 그 회사만(문은 못 지남)
const OROUTES = (arg('--only') && OLIM == null && !OSEL) ? [] : (OSEL ?? OTH.slice(0, OLIM ?? OTH.length)).flatMap(c => ['#/c/' + c, `#/c/${c}/past`, `#/c/${c}/rivals`, `#/c/${c}/grow`, `#/c/${c}/range`]);
if (arg('--only')) routes.splice(0, routes.length, ...arg('--only').split(',')); // 고치는 동안 빨리(그 길만) — 3번 누름 셈 · 문은 못 지남(전부를 돌린 결과만 커밋)
const fails = []; let screens = 0, numbers = 0;
const HELLO_LINES = ['주식해서', '돈 버신 분 몇분일까요?', '왜? 그럴까요!', '하규는 아틀란스 해서 부자 될겁니다', '아틀란스가 답이다', '안상미 전무님 주식해서 돈 많이 버세요', '아틀란스 올림!']; // 1장 사장님 글(atlas.js HELLO_MSG — 여는 홍표 뒤 이 글이 그대로)
const fail = (where, what) => fails.push({where, what});

// 급등 다섯 칸 · 달력 · 며칠 뒤(사장님 2026-10-15 16:28 · 16:34 · 16:40) — surgecal.json 에서 따로 셈(atlas.js svDayOf · svCal · svTrack 과 같은 뜻을 따로 적음)
const SVN = {sv: '급등', b10: '10%대', b20: '20%대', b30: '30%대', b40: '40% 이상'}, SVK = {sv: '급등 칸에', b10: '10%대 칸에', b20: '20%대 칸에', b30: '30%대 칸에', b40: '40% 이상 칸에'};
const SV_NOT = ['1등', '들어온 뒤', '20거래일 뒤', '많이 오른 뒤에는', '사 볼', `${PN} —`, '거래소 투자경고', '센 기록', 'NaN', 'undefined', 'Invalid', '40% 넘게', '다시 보기'];
function svCalExp(K, tab) {
  const dates = K.dates, set = new Set(dates), last = dates.at(-1), evOf = d => (K.days.find(x => x.d === d)?.ev ?? []).filter(e => e[5] === tab || e[6] === tab);
  const tabDays = dates.filter(d => evOf(d).length), f0 = dates.find(d => evOf(d).some(e => e[4] === 'first' && e[5] === tab)), start = f0 && tabDays[0] === f0 ? f0 : dates[0];
  const cnt = d => { const ev = evOf(d), I = new Set(), O = new Set(); for (const e of ev) { if (e[4] === 'move') { if (e[6] === tab) I.add(e[2]); if (e[5] === tab) O.add(e[2]); } else if (e[5] === tab) (e[4] === 'out' ? O : I).add(e[2]); } return [I.size, O.size, ev.length]; };
  const days = dates.filter(d => d >= start).map(d => [d, ...cnt(d)]), pick = [...days].reverse().find(x => x[3])?.[0] ?? last;
  const ever = new Set(K.track.filter(t => (t.now ?? []).includes(tab)).map(t => t.c)); for (const x of K.days) for (const e of x.ev) if (e[5] === tab || e[6] === tab) ever.add(e[2]);
  const all = K.track.filter(t => ever.has(t.c)), went = all.filter(t => t.path?.length), groups = [...new Set(went.map(t => t.d))].sort().reverse().map(d => { const r = went.filter(t => t.d === d); return [d, r.length, Math.max(...r.map(t => t.path.length))]; });
  return {start, days, pick, went: went.length, fresh: all.filter(t => !t.path?.length && t.d === K.asOf).length, nobase: all.filter(t => !t.path?.length && t.d !== K.asOf).length, groups, set, last};
}
function svCalWhy(tab) {
  if (!surgecal) return ['? 달력 자료를 못 받았어요.'];
  const X = svCalExp(surgecal, tab), pk = X.days.find(x => x[0] === X.pick);
  return ['날마다 달력', `날짜를 누르면 그날 ${SVK[tab]} 들어온 곳과 나간 곳이 나와요.`, ...(X.start > surgecal.dates[0] ? [`${md(X.start)}부터 적었어요.`] : []), '든 = 들어온 곳', '뺌 = 나간 곳',
    pk && pk[3] ? `${mdw(X.pick)} — ${[pk[1] ? `들어온 곳 ${pk[1]}` : null, pk[2] ? `나간 곳 ${pk[2]}` : null].filter(Boolean).join(' · ')}` : '이날 이 칸은 바뀐 곳이 없어요.',
    '며칠 뒤 어떻게 됐나', '며칠 뒤 어떻게 됐나 ↓', `${SVK[tab]} 한 번이라도 든 곳이에요.`, '다섯 칸 어디든 처음 찾은 날 종가부터 날마다 몇 %인지 적어요.', `처음 찾은 날부터 ${surgecal.keep}거래일까지 적어요.`, '지난 값일 뿐 앞날을 말하지 않아요.',
    ...(X.went ? ['「관심 없음」을 누르면 이 목록에서 빠져요.', '이 휴대폰에서만 그래요.', ...X.groups.map(([d, n, k]) => `${md(d)}에 처음 찾은 곳 ${n}곳 — ${k}일 뒤`)] : ['? 아직 따라간 날이 없어요.']),
    ...(X.fresh ? [`${md(surgecal.asOf)}에 처음 찾은 ${X.fresh}곳은 다음 장날부터 적혀요.`] : []), ...(X.nobase ? [`? 처음 찾은 날 종가가 없어 못 적은 곳 ${X.nobase}곳`] : [])];
}
// 달력 탭 기대 글(atlas.js viewCal · trDay · viewCalCase 와 같은 뜻을 자료에서 따로 적음)
const TRB = {'1': '10%대', '2': '20%대', '3': '30%대', '4': '40% 이상'}, CALW = {u: '올라 있음', d: '내려 있음', z: '제자리', q: '? 값 없음', n: '새로 뽑힘'};
const ampmS = t => { const hh = +t.slice(11, 13); return `${hh < 12 ? '오전' : '오후'} ${hh % 12 || 12}:${t.slice(14, 16)}`; };
const CAL_NOT = ['급등', '더 오름', '덜 오름', '사라', '팔라', 'NaN', 'undefined', 'Invalid', '이 뽑힌 날보다 올라 있어요만'];
function calSteps(r, K, dates) { // 단계(새 것이 위) — [날, 글]
  const at = d => { const i = dates.indexOf(d); return i >= 0 ? K.p[i] : null; };
  const S = [[r[2], `선택 · ${TRB[r[3]]}`]];
  for (const e of K.ev) S.push([e[0], e[1] === 'mv' ? `${jo(TRB[e[2]], '으로', '로')} 이동` : e[1] === 'out' ? '탈락 · 10% 밑이거나 거래가 적어짐' : e[1] === 're' ? `다시 선택 · ${TRB[e[2]]}` : '조심 · 투자경고 오름 기준에 닿음', e[1] === 'warn' ? '? 실제로 지정됐는지는 몰라요' : `뽑힌 날부터 ${pct(at(e[0]))}`]);
  if (r[6] !== 'n') S.push([trData.asOf, `지금 ${pct(r[5])}`]);
  return S.reverse(); }
function calExpect(arg) {
  const T = trData; if (!T) return {why: ['? 달력 자료를 못 받았어요. 잠시 뒤 다시 열어 주세요.']};
  const byC = new Map(T.cases.map(r => [r[0], r]));
  if (!arg) {
    const why = ['달력', '5일간 10% 넘게 오르면 뽑혀요.', T.provisional ? `${md(T.asOf)} ${/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}/.test(T.kst ?? '') && T.kst.slice(0, 10) === T.asOf ? ampmS(T.kst) + ' ' : ''}값이에요. 장 중이라 바뀌어요.` : `${md(T.asOf)} 종가예요.`];
    if (T.N) { why.push('뽑힌 날보다 올라 있는 곳', `지켜보는 ${T.N}곳`, `10곳 중 ${T.n10}곳꼴`); if (T.m10 != null) why.push('같은 기간 모든 회사', `10곳 중 ${T.m10}곳꼴`); }
    else why.push(T.k ? `${md(T.asOf)}에 처음 ${T.k}곳이 뽑혔어요.` : '아직 지켜보는 곳이 없어요.');
    const AL = (T.alerts ?? []).filter(A => A.n > 0); if (AL.length) { why.push(AL.map(A => (A.kind === 'halt' ? `? 거래 멈춤 ${A.n}곳` : `${A.f === 2 ? '?' : '!'} 반 토막 ${A.n}곳`)).join(' · '), '마지막 장날 종가로 새로 생긴 일이에요.'); for (const A of AL) for (const c of A.cs ?? []) why.push(byC.get(c)?.[1] ?? '?'); }
    why.push('전체', '10%', '20%', '30%', '40%');
    for (const x of T.days.slice(0, 5)) {
      why.push(`${+x.d.slice(5, 7)}월`, `선택 ${x.sel.length}`, `이동 ${x.mv.length} · 탈락 ${x.out.length}${x.re.length ? ` · 다시 선택 ${x.re.length}` : ''}`);
      if (x.seed) why.push(' · 되짚음');
      const K = x.sel.length && x.sel.every(c => byC.get(c)?.[6] === 'n') ? 2 : 4; // 새로 뽑혀 등락이 없는 날은 두 줄만 펼침(atlas.js trDay · 2026-10-16)
      for (const c of x.sel.slice(0, K)) { const r = byC.get(c); why.push(r[1], r[6] === 'n' ? `5일간 ${pct(r[4])}` : pct(r[5])); if (r[7] || r[8]) why.push(r[7] ? '? 거래 멈춤' : r[8] === 2 ? '? 반 토막' : '! 반 토막'); }
      if (x.sel.length > K) why.push(`나머지 ${x.sel.length - K}곳 보기`);
      const items = x.mv.length + x.out.length + x.re.length; if (items) why.push(`${x.re.length ? '이동 · 탈락 · 다시 선택' : '이동 · 탈락'} ${items}곳 보기`);
      if (!x.sel.length) why.push('이날 새로 뽑힌 곳은 없어요.'); }
    for (let i = 5; i < T.days.length; i += 5) { const ch = T.days.slice(i, i + 5); why.push(`${md(ch.at(-1).d)} ~ ${md(ch[0].d)} 보기`); }
    why.push(`${md(T.days.at(-1).d)}부터 적었어요.`, '어떻게 골랐나요?', '사고팔 곳을 고른 목록이 아니에요.', '지난 값일 뿐 앞날을 말하지 않아요.');
    if (T.seed) why.push(`${md(T.seed.from)} ~ ${md(T.seed.to)}은 업데이트 기록이 없던 날이라 그날 종가로 다시 셌어요.`);
    if (T.days.some(x => x.seed)) why.push('되짚음 = 업데이트 기록이 없던 날이라 그날 종가로 다시 센 날이에요.');
    return {title: '달력', why, cal: {home: true}}; }
  const r = byC.get(arg), K = trCase?.[arg];
  if (!r || !K) return {why: ['이 종목은 지금 달력에서 지켜보는 곳이 아니에요.'], cal: {}};
  const i0 = T.dates.indexOf(r[2]), dates = T.dates.slice(i0, i0 + K.p.length);
  const why = [`${mdw(r[2])}에 ${jo(TRB[r[3]], '으로', '로')} 뽑혔어요.`, `그때 5일간 ${pct(r[4])}`, CALW[r[6]], '뽑힌 날부터 날마다', '그 회사 5일 오름이 든 칸', '지나온 일', '● 선택', '○ 탈락', '◉ 다시 선택', '☆ 관심', '관심 없음', '회사 보기 ›', '사고팔 곳을 고른 목록이 아니에요.', '지난 값일 뿐 앞날을 말하지 않아요.'];
  if (r[6] !== 'n') why.push('뽑힌 날부터', r[5] == null ? '?' : pct(r[5])); else why.push('등락률은 다음 장날부터 쌓여요.');
  if (K.mk != null) why.push(`같은 기간 모든 회사의 가운데 값은 ${pct(K.mk)}였어요.`);
  if (r[7]) why.push('? 거래 멈춤 — 마지막 장날에 거래가 없었어요.'); if (r[8]) why.push(r[8] === 2 ? '? 반 토막 — 뽑힌 뒤 가장 높던 종가의 반 밑이에요.' : '! 반 토막 — 뽑힌 뒤 가장 높던 종가의 반 밑이에요.');
  const S = calSteps(r, K, dates); for (const [d, t, x] of S.slice(0, 4)) { why.push(md(d), t); if (x) why.push(x); } if (S.length > 4) why.push(`더 보기 ${S.length - 4}개`);
  return {title: r[1], why, cal: {code: arg}}; }
function expect(route) {
  // 화면마다 자료에서 따로 만든 기대 글(보기 = 한 회사 한 표)
  const [, kind, arg] = route.match(/^#\/(\w*)\/?(.*)$/) || [];
  if (kind === 'g') { const g = core.groups.find(x => x.id === arg); return {step: 1, head: pct(g.chg), up: loc(g.up), down: loc(g.down), rows: g.inds.map(n => { const i = core.industries.find(x => x.name === n); return [n, pct(i.chg)]; }), trh: trText(g.tr), trd: g.inds.map(n => trText(core.industries.find(x => x.name === n).tr)),
    ...(MKT ? {pkN: g.inds.filter(n => core.industries.find(x => x.name === n).pk > 0).length, why: g.pk ? [`고른 곳 ${g.pk}곳`, '금빛 = 고른 곳'] : []} : {})}; }
  if (kind === 'i') { const i = core.industries.find(x => x.name === decodeURIComponent(arg)); return {step: 2, head: pct(i.chg), up: loc(i.up), down: loc(i.down), rows: i.members.filter(c => !MKT || MKT[c].l.some(x => x != null)).map(c => (MKT ? [MKT[c].n, pct(MKT[c].c)] : [comp[c].name, pct(comp[c].chg)])), trh: trText(i.tr),
    // 기준일 종가가 없어 선을 못 그린 회사 = 줄 대신 「?」 한 줄에 이름 고리(2026-10-14 「나」 · 규칙 56 줄마다 선)
    ...(MKT ? {pkN: i.members.filter(c => MKT[c].p && MKT[c].l.some(x => x != null)).length, pkHref: i.members.filter(c => MKT[c].p && MKT[c].l.some(x => x != null)).map(c => '#/c/' + c),
      why: [...(i.pk ? [`금빛 = 고른 곳 ${i.pk}곳`] : []), `금빛이 아닌 회사는 ${PN} 밖입니다`, ...(() => { const no = i.members.filter(c => !MKT[c].l.some(x => x != null)); return no.length ? [`기준일(${md(core.base)}) 종가가 없어 선을 못 그린 회사 ${no.length}곳`, ...no.map(c => MKT[c].n)] : []; })()]} : {})}; }
  if (kind === 'c') {
    const [code, sub] = arg.split('/'), pk = !!comp[code], c = CO(code);
    if (!sub && !pk) { // 고른 곳 밖(모든 회사 7단) — 「멍거 · 린치 조건 N곳 밖」 · 「왜 … 밖인가요?」 까닭(이름표) · 100만 원 줄 · 세 숫자 · 1주 값
      const nr = NAMES.rows.find(x => x.c === code), lv = LINE(code).filter(x => x != null).map(x => x / 100), man = x => Math.round(x).toLocaleString('ko-KR') + '만 원';
      const why = [`${PN} 밖`, '이 회사도 7단까지 볼 수 있습니다', `왜 ${PN} 밖인가요?`, ...(nr ? ['멈췄습니다', nr.w] : ['? 까닭을 못 읽었습니다']), `가장 깊이 빠짐(${core.days}거래일)`];
      if (!lv.length) why.push(`? 이 회사 ${core.days}거래일 값을 못 읽었습니다`, '? 값을 못 읽었습니다');
      else { const low = Math.min(...lv), last = lv.at(-1); why.push(low < 100 ? `${md(core.base)}에 100만 원어치였다면 가장 낮을 때 ${man(low)} · 끝 ${man(last)}` : `${md(core.base)}에 100만 원어치였다면 그보다 낮아진 적 없이 끝 ${man(last)}`); }
      return {step: 3, trio: [pct(c.chg), pct(c.r1y), pct(c.mdd)], price: c.price == null ? [] : Math.round(c.price).toLocaleString('ko-KR') + '원', ...(lv.length ? {axis: md(core.base) + ' = 100'} : {}), why, notWhy: [`왜 ${PN}에 들었나요?`]}; }
    if (!sub) { // 왜 멍거 · 린치 조건 N곳에 들었나요?(2026-10-14 06:05 「가」 · ml-v1) — 넘은 갈래마다 값(comp.json 에서 따로 만든 글 · 차례 없음)
      const q = c.pick, why = [`왜 ${PN}에 들었나요?`], won = x => `${Math.round(x).toLocaleString('ko-KR')}원`;
      if (!q?.mg && !q?.ly) fail(route, '든 까닭 값이 없음(멍거 · 린치 모두 없음)');
      if (JSON.stringify(q.tags) !== JSON.stringify([q.mg ? 'mg' : null, q.ly ? 'ly' : null].filter(Boolean))) fail(route, `꼬리표 ${q.tags}가 값과 다름`);
      if (q.mg) { const m = q.mg, Y = m.years.map(y => String(y).slice(0, 4) + '년');
        why.push('멍거 조건 — 세 조건을 모두 넘었습니다', '① 해마다 남긴 돈 — ' + m.net.map((x, k) => `${Y[k]} ${eokS(x)}`).join(' · '),
          '② 자기 돈 100원에 빚 — ' + m.debt.map((x, k) => `${Y[k]} ${Math.round(x)}원`).join(' · '), '③ 자기 돈 100원으로 번 돈 — ' + m.roe.map((x, k) => `${Y[k]} ${r1(x).toFixed(1)}원`).join(' · '));
        for (const [x, ok] of [[m.net.every(v => v > 0), '① 해마다 남긴 돈이 0 보다 큼'], [m.debt.every(v => v <= core.rules.debtLine), '② 빚 ≤ 자기 돈'], [m.roe.every(v => v >= core.rules.roeLine), '③ 해마다 18원 넘게']]) if (!x) fail(route, `멍거 든 까닭 값이 조건을 못 넘음 — ${ok}`); }
      if (q.ly) { const l = q.ly;
        why.push('린치 조건 — 두 조건을 모두 넘었습니다', '① 한 주가 번 돈 — ' + [`${l.years[0]}년 ${won(l.eps[0])}`, `${l.years[1]}년 ${won(l.eps[1])}`, `해마다 ${r1(l.g).toFixed(1)}% 큼`].join(' · '),
          '② 크는 빠르기에 견줘 값 — ' + [`배당 ${r1(l.yld).toFixed(1)}%`, `이익의 ${r1(l.per).toFixed(1)}배 값`, `점수 ${l.score.toFixed(2)}`, '2 넘음', `${md(l.pxDay)} 값`].join(' · '), '점수 = (한 주 이익이 해마다 큰 % + 배당 %) ÷ 1년 이익의 몇 배 값');
        for (const [x, ok] of [[l.g >= core.rules.growLine[0] && l.g <= core.rules.growLine[1], '① 해마다 20 ~ 25%'], [l.score >= core.rules.scoreLine, '② 점수 2 넘음']]) if (!x) fail(route, `린치 든 까닭 값이 조건을 못 넘음 — ${ok}`); }
      why.push('멍거 · 린치가 고른 목록이 아닙니다', '좋은 회사 순서가 아닙니다');
      const lv = lines[code].filter(x => x != null).map(x => x / 100), low = Math.min(...lv), last = lv.at(-1), man = x => Math.round(x).toLocaleString('ko-KR') + '만 원';
      why.push(low < 100 ? `${md(core.base)}에 100만 원어치였다면 가장 낮을 때 ${man(low)} · 끝 ${man(last)}` : `${md(core.base)}에 100만 원어치였다면 그보다 낮아진 적 없이 끝 ${man(last)}`, `가장 깊이 빠짐(${core.days}거래일)`);
      return {step: 3, trio: [pct(c.chg), pct(c.r1y), pct(c.mdd)], price: Math.round(c.price).toLocaleString('ko-KR') + '원', axis: md(core.base) + ' = 100', why}; }
    if (sub === 'rivals' || sub === 'grow') { // 5단 누구와 다투나 · 6단 앞으로 클까?(사장님 16:51 · 7단 2026-10-12) — 자료 파일(co/<번호>.json grow)에서 따로 만든 기대 글 · 범위 → 말 등급도 따로 셈
      const G = coOf(code).grow, S = G?.story, xm = m => (Math.round(m * 10 + 1e-9) / 10).toFixed(1) + '배';
      if (sub === 'rivals') {
        const why = [`「${G.ind.name}」 ${G.ind.n}곳 가운데 매출 ${G.ind.rank ?? '?'}번째`];
        if (!S) why.push(pk ? '? 세 팀 이야기는 아직 없습니다' : '? 세 팀 이야기는 조사 전입니다'); else { why.push(S.shape, ...S.rivals.map(r => r.name)); for (const r of S.rivals) if (!r.url && r.chk) why.push(r.chk.v === '기사로 확인' && r.chk.url ? '따로 확인한 글' : `따로 찾아봄 · ${r.chk.v}`); }
        if (!G.top.some(t => t[2] === code) && G.ind.me != null) why.push(`${c.name}(${G.ind.rank ?? '?'}번째)`); // 막대 위 다섯 밖이면 「이 회사」 줄을 더함
        return {step: 5, title: `${c.name} — 누구와 다투나?`, why};
      }
      if (!S) return {step: 6, title: `${c.name} — 앞으로 클까?`, why: [pk ? '? 세 팀 이야기는 아직 없습니다' : '? 세 팀 이야기는 조사 전입니다']};
      const gr = (lo, hi) => { if (lo == null || hi == null) return null; const f = lo >= 1 ? 1 : hi <= 1 ? 0 : Math.log(hi) / (Math.log(hi) - Math.log(lo)); return f >= 0.9 ? '아주 높다' : f >= 0.65 ? '높다' : f >= 0.35 ? '반반' : f >= 0.1 ? '낮다' : '아주 낮다'; };
      const why = [`근거 기사 ${S.facts.length}개`];
      for (const k of ['1', '3', '5', '10']) { const x = S.h[k]; if (x.mid == null) { why.push('? 자료 모자람'); continue; } why.push(`${xm(x.mid)}쯤`, `(${xm(x.lo)} ~ ${xm(x.hi)})`); const g = gr(x.lo, x.hi); if (g !== x.g) fail(route, `말 등급이 범위와 다름 ${k}년 ${x.g} ≠ ${g}`); why.push(g); }
      const BI = core.grow?.bias; if (BI) why.push(`${NPK}곳 10년 뒤 가운데 ${xm(BI.m10)}쯤`, `= ${BI.cons.toFixed(2)}배 · ${BI.consN}곳 가운데값`);
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
    const k = pk ? rng.companies[code] : rng.others?.[code];
    return {step: 7, title: `${c.name} — 범위 · 확인`, dirs: k && k.ok ? k.win.map((w, j) => [`번 길 ${r1(w).toFixed(1)}%`, `크게 잃는 길 ${r1(k.big[j]).toFixed(1)}%`]) : null,
      why: ['모형 가정 아래 추정 · 검증 전', '앞날 값이 아닙니다', '확인표 — 기록 · 조심 · 모름', '지켜볼 날', '3분기 실적', '2027년 결산', '봉인', ...(core.mcEnd ? [`${ymd(core.mcEnd)} 종가`] : []), ...(k && k.ok ? [`흰 눈금 = ${NPK}곳 가운데값`] : [])], dm: k && k.ok ? 8 : 0};
  }
  if (!kind) { const T = core.time;
    // 첫 화면 = 먹빛 판(2026-10-15 09:41 · 규칙 67) — 머리(h1) = 시장 · 칸 차례 · 칸마다 첫 줄 · 금빛 알림 · 고리는 아래 먹빛 판정(m4Expect) · 봉인 줄 · 맨 아래 안전 문장
    return {title: home ? '시장' : '시장 — ?', m4: m4Expect(home),
      why: [...(T ? [`봉인 ${T.id}호 — 3 · 5 · 10년 뒤 다시 엶`, ddayText(T.opens[0].date)] : []), '저는 투자 상담사가 아닙니다', ...(home ? [] : ['? 시장 자료를 못 읽었어요'])],
      notWhy: ['지난 20거래일 1등은', '자세히 ›', '1 / 7', '‖ 멈춤']}; } // 옛 슬라이드 7장 글이 남지 않게
  if (kind === 'time') { const K = tdata.capsules[0], P = K.past, S = K.since; return {title: `봉인 ${K.id}호 — ${md(K.seal)} 365곳`,
    why: [ymd(P.from), `${P.n365}곳`, won100(P.mult365), won100(P.med365), won100(P.multPool), `${P.half}곳`, `${P.skip365}곳은 뺐습니다`, ...K.opens.flatMap(o => [ymd(o.date), ddayText(o.date)]), K.digest, K.file, // 잠근 규칙은 접힌 칸이라 글에 안 잡힘 — site_verify ⑫ 가 봉인 파일과 맞댐
      ...(S.days ? [pct(S.chg365), pct(S.chgPool), `봉인 뒤 ${S.days}거래일`] : ['아직 0거래일'])]}; }
  if (kind === 'up') { const r0 = upd.records[0]; return {title: '업데이트 기록', why: r0 ? [{'바꿈': '바꿈', '그대로': '그대로 — 새 값 없음', '실패': '실패'}[r0.result], ...(r0.asOf ? [`고른 날 ${md(r0.asOf)}`, `기준일 ${md(r0.base)}`] : []), ...(r0.in?.length ? [`새로 든 곳 ${r0.in.length}`, `빠진 곳 ${r0.out.length}`, ...(r0.stay != null ? [`그대로 ${r0.stay}`] : [])] : []), ...(r0.ruleChanged ? ['이 회차에 고르는 기준이 바뀌었습니다'] : [])] : ['아직 기록이 없습니다']}; }
  if (kind === 'surge' && !arg) { // 급등 탭(사장님 2026-10-15 14:27 「탭을 하나 더 만들어라 … 최근 5일에 급등한 종목을 36개 …」 · 규칙 69) — surge.json 에서 따로 만든 글 · 줄 · 세 숫자
    const S = surge, M = S.members ?? [], n = M.length, F = S.facts ?? {}, W3 = S.why ?? {}, FU = S.funnel ?? {}, CUT = S.cut ?? {}, loc0 = x => Number(x).toLocaleString('ko-KR');
    const chg = S.carry ? null : S.kind !== 'pick' ? '처음 고른 목록이에요.' : (S.in.length || S.out.length) ? `${S.in.length}곳이 새로 들고 ${S.out.length}곳이 나갔어요.` : '이번에 바뀐 곳은 없어요.';
    const warn = M.filter(m => m.warn), live = M.filter(m => m.warnLive), down = M.filter(m => m.d1 != null && m.d1 < 0);
    return {title: `급등 ${n}곳`, rows: M.map(m => [m.n, pct(m.v[5] - 100)]), trio: n ? [pct(S.stats.med), pct(S.market.med), pct(S.stats.lo)] : null,
      why: [n ? `지난 5일 동안 ${n}곳이 ${pct(S.stats.lo)} ~ ${pct(S.stats.hi)} 올랐어요.` : '지난 5일 동안 문턱을 넘은 곳이 없어요.', '사고팔 곳을 고른 목록이 아니에요.', '? 오른 까닭은 몰라요.', ...(chg ? [chg] : ['목록은 ']),
        ...(S.provisional ? ['장 중 값이에요. 저녁 8시까지 바뀌어요.'] : [`${md(S.asOf)} 장 마감`]), ...(n < S.cap ? [`오늘은 문턱을 넘은 곳이 ${n}곳뿐이에요. 억지로 채우지 않아요.`] : []),
        `셀 수 있는 회사 ${loc0(S.market.n)}곳`, '셀 수 있는 회사 가운데값', ...(FU.q ? [`셀 수 없는 곳 ${loc0(FU.q)}곳`] : []),
        ...(S.kind === 'pick' ? S.in.map(x => x.n) : []), ...(S.out.length ? [`나간 곳 ${S.out.length}곳 — 까닭 보기`, ...S.out.flatMap(o => [o.n, o.why])] : []),
        ...(n ? [`${n}곳 가운데 ${F.half}곳은 1년 사이 꼭대기의 반값 아래로 떨어진 적이 있어요.`, `업종 전체가 함께 오른 곳 ${W3.ind}곳 · 업종과 따로 오른 곳 ${W3.co}곳`, ...((S.sameInd ?? []).length ? ['같은 업종 3곳 이상: ' + S.sameInd.map(x => `${x[0]} ${x[1]}곳`).join(' · ')] : [])] : []),
        ...(warn.length || live.length ? [`거래소 경고 기준만큼 오른 곳 ${warn.length}곳`, '5일 60% 또는 15일 100%로만 셌어요.', ...(warn.length ? [warn.map(m => m.n).join(' · ')] : []), ...(live.length ? [`장 중 값으로만 닿은 곳 ${live.length}곳: ${live.map(m => m.n).join(' · ')}`] : [])] : []), // 수와 이름이 맞게(새 눈 점검 12)
        ...(down.length ? [`마지막 날 내린 곳 ${down.length}곳`, down.map(m => m.n).join(' · ')] : []),
        ...(F.one ? [`하루에 몰려 오른 곳 ${F.one}곳`] : []), ...(F.quiet ? [`거래가 덜 붙은 곳 ${F.quiet}곳`] : []), ...(F.reb ? [`되오른 곳 ${F.reb}곳`] : []),
        ...(S.cutList?.length ? [`+15%를 넘었지만 값이나 거래 때문에 뺀 곳 ${S.cutList.length}곳 — 까닭 보기`, ...S.cutList.flatMap(o => [o.n, o.why])] : []),
        ...(CUT.seat ? [`+15%를 넘었지만 아직 못 든 곳도 ${CUT.seat}곳 있어요.`] : []),
        ...(S.confirm?.n ? [`${md(S.confirm.day)} 장 중에 든 ${S.confirm.n}곳`] : []), ...(S.strict ? ['지금은 두 번 넘어야 들어와요.'] : []),
        '조심할 것과 모르는 것', '더 확인할 곳', '어떻게 골랐나요?', ...(S.rules?.lines ?? []), ...svCalWhy('sv'),
        `급등 목록은 ${md(S.window[0])} 종가와 ${md(S.asOf)} 값을 견줘 셌어요.`],
      notWhy: [...SV_NOT, '지난 업데이트 — 들고 난 곳'], surge: {gold: M.filter(m => S.provisional && m.prov).length, tab: 'sv'}}; }
  if (kind === 'surge' && /^(10|20|30|40)$/.test(arg)) { // 네 칸(16:28 · 16:34 (가) — sb-v1 · 칸끼리 안 겹침 · 칸마다 36곳까지) — surge.json bands 에서 따로 만든 글 · 줄 · 세 숫자
    const S = surge, b = 'b' + arg, BS = S.bands, B = BS[b], M = B.members, n = M.length, cut = BS.cuts.find(x => x[0] === b), lo = cut[1], hi = cut[2], NAME = SVN[b], range = hi == null ? `${lo}% 이상` : `${lo}%에서 ${hi}% 사이`;
    const ins = B.in, outs = B.out, mIn = B.move.filter(x => x.to === b), mOut = B.move.filter(x => x.from === b), down = M.filter(m => m.d1 != null && m.d1 < 0);
    const said = [ins.length ? `${ins.length}곳이 새로 들었어요.` : null, mIn.length ? `${mIn.length}곳이 다른 칸에서 옮겨 왔어요.` : null, outs.length ? `${outs.length}곳이 빠졌어요.` : null, mOut.length ? `${mOut.length}곳이 다른 칸으로 옮겨 갔어요.` : null].filter(Boolean);
    const chg = S.carry ? null : BS.kind !== 'pick' ? '처음 고른 목록이에요.' : said.length ? said.join(' ') : '이번에 바뀐 곳은 없어요.';
    return {title: `${NAME} ${n}곳`, rows: M.map(m => [m.n, pct(m.v[5] - 100)]), trio: n ? [pct(M[0].r5), pct(M.at(-1).r5), pct(S.market.med)] : null,
      why: [n ? `지난 5일 동안 ${range} 올랐어요.` : `지난 5일 동안 ${range} 오른 곳이 없어요.`, '사고팔 곳을 고른 목록이 아니에요.', '? 오른 까닭은 몰라요.', ...(chg ? [chg] : ['목록은 ']),
        ...(S.provisional ? ['장 중 값이에요. 저녁 8시까지 바뀌어요.'] : [`${md(S.asOf)} 장 마감`]), ...(B.over ? [`나머지 ${B.over}곳은 싣지 않아요.`] : []),
        ...(BS.kind === 'pick' && !S.carry ? [...ins.map(x => x.n), ...mIn.map(x => x.n), ...(outs.length ? [`빠진 곳 ${outs.length}곳 — 까닭 보기`, ...outs.flatMap(o => [o.n, o.why])] : []), ...(mOut.length ? [`다른 칸으로 옮겨 간 곳 ${mOut.length}곳 — 어디로 갔나 보기`, ...mOut.map(o => o.n)] : [])] : []),
        '다른 곳과 견주면?', '이 칸에서 가장 많이 오른 곳', '이 칸에서 가장 적게 오른 곳', '셀 수 있는 회사 가운데값', `셀 수 있는 회사 ${Number(S.market.n).toLocaleString('ko-KR')}곳`,
        ...(down.length ? [`마지막 날 내린 곳 ${down.length}곳`, down.map(m => m.n).join(' · ')] : []), '조심할 것과 모르는 것', '더 확인할 곳', '어떻게 골랐나요?', '칸끼리 겹치지 않아요.', `칸마다 많이 오른 차례로 ${BS.cap}곳까지 실어요.`,
        ...svCalWhy(b), `${NAME} 목록은 ${md(S.window[0])} 종가와 ${md(S.asOf)} 값을 견줘 셌어요.`],
      notWhy: SV_NOT, surge: {gold: M.filter(m => S.provisional && m.prov).length, tab: b}}; }
  if (kind === 'cond') return {title: '조건 찾기'}; // 칸 · 줄 · 고르기 · 둘레는 아래 「조건 찾기 탭」 묶음에서 자료로 따로 잼
  if (kind === 'cal') return calExpect(arg);
  if (kind === 'info') { // 도움말 — 이름 밑 한 줄 · 멍거가 고른 목록 아님 · 깔때기 · 값 · 기다림 · 회차 시각(= universe.json slots · 틀림 장부 21번)
    return {why: [`${PN} — ${PLINE}`, core.rules.notMunger, `${PN}은 이렇게 골랐습니다`, ...core.funnel.groups.flatMap(g => [`${g.name} ${g.n}곳`, ...g.steps.map(x => x.n.toLocaleString('ko-KR') + '곳')]), core.rules.price, core.rules.wait, core.rules.notCounted,
      `? 다시 고르기 — 하루 ${core.rules.slots.length}번(${core.rules.slots.join(' · ')} 서울)`]}; }
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
      const ZONE = '.board, .row, .trio, .lc, .tc, .upchart, .munger, ul.dirbars, ol.funnel, .key, .lkey, .track, .num, .q, .chip, .box, .digest, .srank, .tell, .trh, .seg, ol.steps, .co-head, .crumb, .badge';
      for (const im of scope.querySelectorAll('img')) if (vis(im) && !im.closest('a.hello')) res.mo.push('사진 ' + (im.getAttribute('src') || '').slice(-24));
      const okl = hx => { const v = (hx || '').trim().replace('#', ''); if (!/^[0-9a-f]{6}$/i.test(v)) return null; const f = c => { c /= 255; return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; }; const [R, G, B] = [0, 2, 4].map(i => f(parseInt(v.slice(i, i + 2), 16)));
        const l = Math.cbrt(0.4122214708 * R + 0.5363325363 * G + 0.0514459929 * B), m = Math.cbrt(0.2119034982 * R + 0.6806995451 * G + 0.1073969566 * B), q = Math.cbrt(0.0883024619 * R + 0.2817188376 * G + 0.6299787005 * B);
        const A = 1.9779984951 * l - 2.4285922050 * m + 0.4505937099 * q, Bb = 0.0259040371 * l + 0.7827717662 * m - 0.8086757660 * q; return {h: (Math.atan2(Bb, A) * 180 / Math.PI + 360) % 360, c: Math.hypot(A, Bb)}; };
      const rootS = getComputedStyle(document.documentElement), sig = ['--up', '--down', '--up-ink', '--down-ink'].map(k => okl(rootS.getPropertyValue(k))).filter(Boolean);
      if (sig.length < 4) res.mo.push('오름 · 내림 색 이름을 못 읽음');
      const hueGap = (a, b2) => { const d = Math.abs(a - b2) % 360; return d > 180 ? 360 - d : d; };
      const gapOf = (a, b2) => Math.hypot(Math.max(0, b2.left - a.right, a.left - b2.right), Math.max(0, b2.top - a.bottom, a.top - b2.bottom));
      const shut = el => { for (let d = el.closest('details:not([open])'); d; d = d.parentElement?.closest('details:not([open])') ?? null) { const sm = el.closest('summary'); if (!(sm && sm.parentElement === d)) return true; } return false; }; // 닫힌 「자세히」 속 글은 그려지지 않음(크롬은 자리만 셈) — 닫힌 칸 안의 닫힌 칸 머리(summary)도 숨음(2026-10-15 달력 지난 날 접은 칸 · 칸 안 「이동 · 탈락 n곳 보기」)
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
      // 남의 글(회사가 파는 것 — data-proper)은 금지 말 셈 밖(네 눈 클로드 PROPER 와 같은 뜻 · 모든 회사 7단 2026-10-14 「… 이상탐지 및 예측 솔루션」) — 그 글만 빼고 셈
      res.props = [...scope.querySelectorAll('[data-proper]')].map(e => e.textContent).filter(Boolean);
      const unprop = t => res.props.reduce((a, p) => a.split(p).join(' '), t);
      for (const w of banned) if (unprop(text).includes(w) || unprop(res.all).includes(w)) res.banned.push(w);
      // 길 지도 — 판(#/info 도움말 · 창 하나 덮음)이 열린 화면은 그 판 고리 + 아래 탭(밑 화면 고리는 판에 덮여 못 누름 · 2026-10-16 업데이트 기록 #/up 이 아래 탭에서 도움말 판 고리로 옮겨 감 — 판 고리를 안 모으면 1억 번 눌러 보기가 「못 가는 화면」으로 셈)
      const openSheet = document.querySelector('.sheet:not([hidden])');
      res.links = [...(openSheet ? openSheet.querySelectorAll('a[href^="#/"]') : document.querySelectorAll('#view a[href^="#/"]')), ...document.querySelectorAll('.tabbar a[href^="#/"]')].map(a => a.getAttribute('href'));
      res.head = document.querySelector('#view h1')?.textContent ?? '';
      res.count = document.querySelector('#view .count')?.textContent ?? '';
      res.pkN = document.querySelectorAll('#view .board .row.pk').length; res.pkHref = [...document.querySelectorAll('#view .board .row.pk')].map(a => a.getAttribute('href')); // 금빛 줄(2026-10-14 「나」)
      res.spk = [...document.querySelectorAll('#view .board .row')].map(x => { const ln = x.querySelector('.track .spk .ln'), v = x.querySelector('.val'), b = x.querySelector('.track')?.getBoundingClientRect(); return {d: (ln?.getAttribute('d') ?? '').length, ln: ln?.getAttribute('class') ?? '', val: v?.className ?? '', w: b ? Math.round(b.width) : 0, h: b ? Math.round(b.height) : 0, n: x.querySelector('.nm')?.textContent ?? ''}; }); // 줄마다 선 그래프(2026-10-13 12:30)
      res.rows = [...document.querySelectorAll('#view .board .row')].sort((a, b) => a.getBoundingClientRect().top - b.getBoundingClientRect().top).map(x => [x.querySelector('.nm').firstChild.textContent, x.querySelector('.val').textContent]);
      res.trd = [...document.querySelectorAll('#view .board .row')].sort((a, b) => a.getBoundingClientRect().top - b.getBoundingClientRect().top).map(x => x.querySelector('.trd')?.textContent ?? null);
      res.trdCut = [...document.querySelectorAll('#view .board .row .trd')].filter(x => x.scrollWidth > x.clientWidth + 1).map(x => x.textContent);
      res.trh = document.querySelector('#view .trh')?.textContent ?? null;
      res.trio = [...document.querySelectorAll('#view .trio b')].map(x => x.textContent);
      res.l36 = document.querySelectorAll('a[href="#/36"]').length; // 지운 화면으로 가는 길(2026-10-13 06:45)
      res.hello = document.querySelector('#view a.hello')?.getAttribute('href') ?? null;
      res.step = document.querySelector('#view .st-t b')?.textContent ?? null;
      res.dirs = [...document.querySelectorAll('#view ul.dirbars li')].map(li => [...li.querySelectorAll('.dl .num')].map(x => x.textContent));
      res.foot = [...document.querySelectorAll('#view .foot .links a')].map(a => a.getAttribute('href'));
      // 먹빛 첫 화면(2026-10-15 · 규칙 67) — 판정은 바깥(m4Expect · 자료에서 따로 셈)
      { const L = document.querySelector('#view .m4-letter'), T2 = e => (e?.textContent ?? '').replace(/\u2060/g, '').replace(/\u00a0/g, ' ').trim(), all = q => [...document.querySelectorAll('#view ' + q)];
        res.m4 = !L ? null : {msg: [...L.querySelectorAll('.hml')].map(T2), letter: T2(L), heads: all('.m4-t').map(T2), leads: all('.m4-lead').map(T2), alerts: all('.m4-al').map(T2),
          alertBad: all('.m4-al').filter(x => { const cs = getComputedStyle(x); return vis(x) && (parseFloat(cs.fontSize) < 21 || cs.color !== 'rgb(233, 185, 73)'); }).map(T2),
          rows: all('.m4-tr').map(x => [T2(x.querySelector('.nm')), T2(x.querySelector('.v'))]), rowHref: all('.m4-tr').map(x => x.getAttribute('href')), rowGold: all('.m4-tr').map(x => T2(x.querySelector('.m4-pk'))),
          spkBad: all('.m4-tr').filter(x => { const ln = x.querySelector('.m4-spk .ln'), v = x.querySelector('.v'), k = e => /\b(up|down|flat)\b/.exec(e?.getAttribute('class') ?? '')?.[1]; return !ln || (ln.getAttribute('d') ?? '').length < 10 || k(ln) !== k(v); }).map(x => T2(x.querySelector('.nm'))),
          sec: all('.m4-sr').map(x => [T2(x.querySelector('.nm')), T2(x.querySelector('b')), x.getAttribute('href')]), movers: all('.m4-mv').map(x => x.getAttribute('href')),
          groups: all('.m4-g').map(x => [x.getAttribute('href'), T2(x.querySelector('.nm')), T2(x.querySelector('b'))]), qs: all('.m4-q').map(T2),
          pickLabels: [...(document.querySelector('#m4-h-pk')?.closest('.m4-sec')?.querySelectorAll('.m4-sl') ?? [])].map(T2), pkText: T2(document.querySelector('#m4-h-pk')?.closest('.m4-sec')),
          metaQ: all('.m4-sh').filter(sh => sh.querySelector('.m4-mq')).map(sh => sh.querySelector('.m4-t')?.id ?? '?'), metaQBad: all('.m4-mq').filter(x => getComputedStyle(x).color !== 'rgb(233, 185, 73)').length}; }
      res.dm = document.querySelectorAll('#view ul.dirbars .dm').length; res.below = (res.all.match(/올해 증권사 평균치\([^)]*\)보다 작게 봄/g) || []).length;
      return res;
};
const look = async p => { const r = await p.evaluate(probe, {banned: BANNED}); Object.assign(r, JSON.parse(JSON.stringify(r).replace(/\u00a0/g, ' ').replace(/\u2060/g, ''))); return r; }; // 날짜 붙임 띄어쓰기(10월\u00a08일 · 2026-10-12) → 보통 띄어쓰기로 맞댐
/** 화면 하나 판정(오류 · 넘침 · 21px · 대비 · 잘림 · 44px · 금지 말 · 토씨 · 입체 · 바둑판 · 영상 친구 · 달) */
function judge(tag, r, errs) {
  if (errs.length) fail(tag, '오류: ' + errs.slice(0, 2).join(' | '));
  if (r.over > 0) fail(tag, `옆 넘침 ${r.over}px`);
  if (r.small.length) fail(tag, '21px 미만: ' + r.small.slice(0, 3).join(' · '));
  if (r.lowc.length) fail(tag, '대비 낮음: ' + r.lowc.slice(0, 3).join(' · '));
  if (r.clip.length) fail(tag, '옆으로 잘림: ' + r.clip.slice(0, 3).join(' · '));
  if (r.taps.length) fail(tag, '44px 미만 누름: ' + r.taps.slice(0, 3).join(' · '));
  if (r.banned.length) fail(tag, '금지 말: ' + r.banned.join(' · '));
  { const m = (r.text + '\n' + r.all).match(/null|undefined|NaN|\[object /); if (m) fail(tag, `빈 값이 글로 보임 「${m[0]}」`); } // 2026-10-14 「나」 — 첫 화면 「85곳 그대로null」(replaceChildren 에 null) · 틀림 장부 28번
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
/** 길 하나를 열어 잼(판 · 글씨마다) — 모든 회사 7단(사장님 2026-10-14 17:25(싱가포르) 「전부다 나오게 해」)은 고른 곳 밖 회사 길을 여러 칸(페이지)에서 나눠 돌아서 함수로 뺌 */
async function visit(p, errs, route, w, hgt, font) {
    const tag = `${w}×${hgt}${font ? ' 글씨' + (font + 1) : ''} ${decodeURIComponent(route)}`;
    errs.length = 0;
    await p.evaluate(r => { location.hash = r; }, route);
    try {
      if (route === '#/info') await p.waitForFunction(() => !document.querySelector('#infoSheet').hidden && document.querySelector('#infoBody').childElementCount > 0, null, {timeout: 8000});
      else await p.waitForFunction(r => { const v = document.querySelector('#view'); return v.querySelector('h1') && (location.hash === r || (r === '#/' && location.hash === '')) && !v.querySelector('.boot'); }, route, {timeout: 8000});
    } catch { fail(tag, '그려지지 않음'); return; }
    if (/^#\/c\/[^/]+$/.test(route) && !comp[route.slice(4)]) await p.waitForFunction(() => !document.querySelector('#view').innerText.includes('까닭을 받는 중'), null, {timeout: 8000}).catch(() => {}); // 3단 고른 곳 밖 — 「왜 밖인가요?」 까닭(이름표)을 받을 때까지
    if (route.endsWith('/range')) await p.waitForFunction(() => !document.querySelector('#view').innerText.includes('여는 중…'), null, {timeout: 8000}).catch(() => {}); // 7단 봉인 줄(「봉인 보기」 고리)은 봉인 자료를 받은 뒤 채워짐 — 길 지도가 그 고리를 놓치지 않게(2026-10-14 · 100130 #/time 한 번 놓침)
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
    // 4단 지나온 길 — 그 회사 자료의 날(1년 창 첫날 · 상장 뒤 첫 종가 날 · 하루 30% 넘게 바뀐 날)이 7월 6일이면 옛 창 글이 아니라 그 회사 날짜(모든 회사 7단 2026-10-14 · 365660 레몬헬스케어 7월 6일 상장 뒤 첫 종가)
    const legit = route.endsWith('/past') ? (() => { const co = coOf(decodeURIComponent(route.split('/')[2])), n = days.dates.length, from = Math.max(co.k0, n - 253), f = co.close.slice(from - co.k0).findIndex(x => x != null); return [days.dates[from], days.dates[from + Math.max(0, f)], ...co.jumps.map(j => j[0])].filter(Boolean); })() : [];
    if (!route.endsWith('/grow') && !route.endsWith('/rivals')) for (const old of ['3개월', '7월 6일']) if (r.text.includes(old) && !(old === '3개월' && route === '#/') && !(old === '7월 6일' && legit.some(d => d.endsWith('-07-06')))) fail(tag, `옛 3개월 창 글 「${old}」이 남음`); // 첫 화면은 코스피 · 코스닥 3개월 그림(2026-10-12 14:54)이라 「3개월」을 봐줌 // 5단 · 6단은 지수 창을 쓰지 않고 기사 사실(예: 「딜러 재고가 3개월 수준」)을 그대로 보임
    if (e.up != null) { numbers += 2; if (!r.count.includes(e.up + '곳 오름') || !r.count.includes(e.down + '곳 내림')) fail(tag, `오름 · 내림 ${r.count}`); }
    if (r.spk?.length) { numbers += r.spk.length; const bad = r.spk.filter(x => !x.d || x.h < 16 || (/\b(up|down)\b/.exec(x.ln)?.[1] ?? 'flat') !== (/\b(up|down)\b/.exec(x.val)?.[1] ?? 'flat')); if (bad.length) fail(tag, `줄 선 그래프 — 선 없음 · 낮음 · 색이 숫자와 다름: ${bad.slice(0, 3).map(x => x.n + ' ' + x.ln + ' / ' + x.val + ' ' + x.h + 'px').join(' · ')}`); } // 사장님 2026-10-13 12:30 「이 사진처럼 … 그래프가 표현되게해」
    if (e.rows) { numbers += e.rows.length; const got = JSON.stringify(r.rows), want = JSON.stringify(e.rows); if (got !== want) fail(tag, `줄 ${got.slice(0, 120)} ≠ ${want.slice(0, 120)}`); }
    if (e.pkN != null) { numbers++; if (r.pkN !== e.pkN) fail(tag, `금빛 줄 ${r.pkN} ≠ ${e.pkN}`); } // 금빛 = 고른 곳(2026-10-14 「나」)
    if (e.pkHref) { numbers++; if (JSON.stringify([...r.pkHref].sort()) !== JSON.stringify([...e.pkHref].sort())) fail(tag, `금빛 줄 길 ${r.pkHref.join(',')} ≠ ${e.pkHref.join(',')}`); }
    if (e.step) { numbers++; if (r.step !== `7단 중 ${e.step}단`) fail(tag, `7단 표시 ${r.step} ≠ ${e.step}단`); }
    for (const old of ['5단 중', '5단으로 내려갑니다', '사기 전에 볼 것', '4단 앞으로 클까?', '5단 범위', '앞날 값은 내지 않습니다', '지금의 몇 배쯤', '조사하는 중이라 다음 차례에 채웁니다', '기본 문 여섯']) if (r.all.includes(old) || r.text.includes(old)) fail(tag, `옛 글 「${old}」이 남음`); // 7단 · 2026-10-12 네 팀 점검으로 바꾼 글
    if (e.dm !== undefined) { numbers++; if (r.dm !== e.dm) fail(tag, `7단 365곳 가운데값 눈금 ${r.dm} ≠ ${e.dm}`); }
    if (e.below !== undefined) { numbers++; if (r.below !== e.below) fail(tag, `6단 「올해 짐작보다 작게 봄」 ${r.below} ≠ ${e.below}`); }
    if (e.step === 3 && r.all.includes('봉인 1호에 든 회사')) fail(tag, '3단에 봉인 줄이 남음(7단으로 옮김)');
    if (has36(r.all) || has36(r.text) || r.l36) fail(tag, '36곳 글 · 길이 남음(사장님 2026-10-13 06:45 「매수 검토 36곳 영구 삭제 하라」)');
    { const t = (r.props ?? []).reduce((a, p) => a.split(p).join(' '), (r.all + '\n' + r.text).split('옛 규칙(대세 업종)').join('').split('옛 규칙(힘 붙음)').join('')); // 남의 글(data-proper)은 뺌 // 힘 붙은 365곳(2026-10-13 13:04) — 옛 기준 말 0(지난 회차 · 봉인 꼬리표만) · 좁은 금지 말 0 · 순위 글 0(규칙 55)
      const ow = OLD_RULE_WORDS.filter(x => t.includes(x)); if (ow.length) fail(tag, `옛 기준 말 「${ow.join(' · ')}」이 남음`);
      const nw = NARROW.filter(x => t.includes(x)); if (nw.length) fail(tag, `좁은 금지 말 「${nw.join(' · ')}」(클로드팀)`);
      if (/힘 (차례|순서) \d+번째|힘 붙은 365곳 가운데 \d+번째/.test(t)) fail(tag, '순위 글이 보임(규칙 55)'); } // 회사 이야기 글의 「국내 상위 3곳」 같은 남의 사실은 아님(14:2x)
    if (e.trd) { numbers += e.trd.length; if (JSON.stringify(r.trd) !== JSON.stringify(e.trd)) fail(tag, `방향 · 세기 줄 ${JSON.stringify(r.trd).slice(0, 120)} ≠ ${JSON.stringify(e.trd).slice(0, 120)}`); }
    if (r.trdCut?.length) fail(tag, '방향 · 세기 줄이 잘림: ' + r.trdCut.slice(0, 2).join(' · '));
    if (e.trh) { numbers++; if (r.trh !== e.trh) fail(tag, `머리 밑 방향 ${r.trh} ≠ ${e.trh}`); }
    if (e.dirs !== undefined) { numbers += 9; if (e.dirs && JSON.stringify(r.dirs) !== JSON.stringify(e.dirs)) fail(tag, '4방향 숫자 다름'); if (!e.dirs && !r.text.includes('? 셈 못 함')) fail(tag, '셈 못 함 표시 없음'); }
    if (route === '#/') { numbers++; if (r.hello !== '/hello.html') fail(tag, '첫 화면 맨 위 「친구에게 소개하기」 없음(규칙 45)'); }
    if (route === '#/' && e.m4) { // 첫 화면 = 먹빛 판(2026-10-15 09:41 · 규칙 67) — 사장님 글 글자 그대로 · 칸 차례 · 칸마다 첫 줄(자료에서 따로 셈) · 금빛 알림 · 고리 · 「?」 · 「어떻게 셌나요?」를 다 열어 다시 잼
      const X = e.m4, m = r.m4, tk = `${tag} · 먹빛 첫 화면`;
      numbers += 2;
      if (!m) fail(tk, '먹빛 첫 화면이 아님(.m4-letter 없음)');
      else {
        if (JSON.stringify(m.msg) !== JSON.stringify(HELLO_LINES)) fail(tk, `사장님 글 ${JSON.stringify(m.msg)} ≠ 글자 그대로`);
        for (const want of X.letter) { numbers++; if (!m.letter.includes(want)) fail(tk, `편지 칸 글 「${want}」 없음`); }
        for (const gone of ['10명중에 몇명', '못버는건', '실력 없는 사람들', '생각해보세요', '커피 1잔', '상품권 1장', '막비', '24초']) { numbers++; if (m.letter.includes(gone)) fail(tk, `편지 칸에 지운 글 「${gone}」이 남음`); } // 2026-10-14 17:16 · 17:17 · 18:19 · 21:50
        numbers++; if (m.letter.includes('급등')) fail(tk, '편지 칸(친구 소개)에 「급등」 — 소개 쪽에 급등 목록을 띄우지 않음(레드 셀 반대 2 · 규칙 69)');
        numbers++; if (JSON.stringify(m.heads) !== JSON.stringify(X.heads)) fail(tk, `칸 차례 ${JSON.stringify(m.heads)} ≠ ${JSON.stringify(X.heads)}`);
        numbers += X.leads.length; if (JSON.stringify(m.leads) !== JSON.stringify(X.leads)) fail(tk, `칸 첫 줄 ${JSON.stringify(m.leads).slice(0, 400)} ≠ ${JSON.stringify(X.leads).slice(0, 400)}`);
        numbers += X.alerts.length + 1; if (JSON.stringify(m.alerts) !== JSON.stringify(X.alerts)) fail(tk, `금빛 알림 ${JSON.stringify(m.alerts)} ≠ ${JSON.stringify(X.alerts)}`);
        if (m.alertBad.length) fail(tk, '금빛 알림이 금빛 21px 이 아님: ' + m.alertBad.join(' · '));
        numbers += X.rows.length * 3; if (JSON.stringify(m.rows) !== JSON.stringify(X.rows)) fail(tk, `요즘 오르는 업종 줄 ${JSON.stringify(m.rows).slice(0, 200)} ≠ ${JSON.stringify(X.rows).slice(0, 200)}`);
        if (JSON.stringify(m.rowHref) !== JSON.stringify(X.rowHref)) fail(tk, `요즘 오르는 업종 고리 ${m.rowHref.join(',')} ≠ ${X.rowHref.join(',')}`);
        if (JSON.stringify(m.rowGold) !== JSON.stringify(X.rowGold)) fail(tk, `금빛 「고른 n곳」 ${JSON.stringify(m.rowGold)} ≠ ${JSON.stringify(X.rowGold)}`);
        if (m.spkBad.length) fail(tk, '줄 선 — 선 없음 · 선 색이 숫자 색과 다름: ' + m.spkBad.slice(0, 3).join(' · ')); // 규칙 56
        numbers += X.sec.length; if (JSON.stringify(m.sec) !== JSON.stringify(X.sec)) fail(tk, `강한 · 약한 업종 ${JSON.stringify(m.sec).slice(0, 200)} ≠ ${JSON.stringify(X.sec).slice(0, 200)}`);
        numbers += X.movers.length; if (JSON.stringify(m.movers) !== JSON.stringify(X.movers)) fail(tk, `고른 곳 고리 ${m.movers.join(',')} ≠ ${X.movers.join(',')}`);
        numbers += X.groups.length; if (JSON.stringify(m.groups) !== JSON.stringify(X.groups)) fail(tk, `큰 갈래 ${JSON.stringify(m.groups).slice(0, 200)} ≠ ${JSON.stringify(X.groups).slice(0, 200)}`);
        // 못 받은 값(다른 눈 점검 H1 · 2026-10-15) — 받은 때마다 한 줄이 그 글 그대로 · 못 받은 칸 머리 때 앞 금빛 「?」(그 칸에만)
        numbers += X.notes.length; for (const q of X.notes) if (!m.qs.includes(q)) fail(tk, `못 받은 값 줄 「${q}」 없음 — 보인 줄 ${JSON.stringify(m.qs).slice(0, 300)}`);
        if (m.qs.filter(q => q.startsWith('? 이번에') && q.includes('못 받아')).length !== X.notes.length) fail(tk, `못 받은 값 줄 수 ${m.qs.filter(q => q.startsWith('? 이번에') && q.includes('못 받아')).length} ≠ ${X.notes.length}`);
        numbers++; if (JSON.stringify(m.metaQ) !== JSON.stringify(X.qHeads)) fail(tk, `머리 때 앞 「?」 칸 ${m.metaQ.join(',')} ≠ ${X.qHeads.join(',')}`);
        if (m.metaQBad) fail(tk, `머리 때 앞 「?」가 금빛이 아님 ${m.metaQBad}개`);
        if (X.pickLabels) { numbers += X.pickLabels.length; if (JSON.stringify(m.pickLabels) !== JSON.stringify(X.pickLabels)) fail(tk, `고른 곳 소제목 ${JSON.stringify(m.pickLabels)} ≠ ${JSON.stringify(X.pickLabels)}`); }
        for (const t of X.sayPk) { numbers++; if (!m.pkText.includes(t)) fail(tk, `고른 곳 칸 글 「${t}」 없음`); }
      }
      // 「어떻게 셌나요?」를 모두 열어 다시 잼(접힌 글도 21px · 대비 · 잘림 · 44px · 금지 말)
      await p.evaluate(() => document.querySelectorAll('#view details.m4-how, #view details.m4-more').forEach(d => { d.open = true; })); await p.waitForTimeout(40);
      { errs.length = 0; const r2 = await look(p); screens++; judge(`${tag} · 어떻게 셌나요 열림`, r2, errs); moTotal += r2.moN; }
      await p.evaluate(() => { document.querySelectorAll('#view details.m4-how, #view details.m4-more').forEach(d => { d.open = false; }); window.scrollTo(0, 0); });
    }
    if (route !== '#/info') { numbers++; if (JSON.stringify(r.foot) !== JSON.stringify(['/hello.html', '/us/'])) fail(tag, '맨 아래 길(소개 · 미국 판 — 옛 ATLAS 는 2026-10-15 영구 삭제) 다름'); }
    for (const want of e.why ?? []) { numbers++; if (!r.text.includes(want) && !r.all.includes(want)) fail(tag, `글 「${want}」 없음`); }
    for (const no of e.notWhy ?? []) { numbers++; if (r.text.includes(no) || r.all.includes(no)) fail(tag, `있으면 안 되는 글 「${no}」`); } // 고른 곳 밖 3단에 「왜 … 들었나요?」(모든 회사 7단)
    if (e.trio) { numbers += 4; if (JSON.stringify(r.trio) !== JSON.stringify(e.trio)) fail(tag, `세 숫자 ${r.trio} ≠ ${e.trio}`); for (const pz of [].concat(e.price ?? [])) { numbers++; if (!r.text.includes(pz)) fail(tag, `1주 값 ${pz} 없음`); } }
    if (e.cal) { // 달력 탭(규칙 70) — 화면 안 글에 「급등」 · 판정 말 0 · 금빛은 「!」 「?」 줄 · 조심 단계에만 · 첫 화면(360 × 640 보통 글씨)에 종목 줄 하나 이상 · 줄마다 이름 · 값
      const g = await p.evaluate(() => { const v = document.querySelector('#view');
        const rgb = (() => { const i = document.createElement('i'); i.style.color = 'var(--gold)'; v.append(i); const c = getComputedStyle(i).color; i.remove(); return c; })();
        const golds = [...v.querySelectorAll('*')].filter(x => [...x.childNodes].some(n => n.nodeType === 3 && n.textContent.trim()) && getComputedStyle(x).color === rgb && x.getBoundingClientRect().width).map(x => x.textContent.trim());
        const rows = [...v.querySelectorAll('a.cal-row')], tabTop = document.querySelector('nav.tabbar')?.getBoundingClientRect().top ?? innerHeight;
        return {t: v.innerText, golds, first: rows.filter(x => x.getBoundingClientRect().bottom <= tabTop + 1 && x.getBoundingClientRect().top >= 0).length, bad: rows.filter(x => !x.querySelector('.nm')?.textContent.trim() || !x.querySelector('b.num, .cal-nw')).length}; });
      numbers += 3;
      for (const w0 of CAL_NOT) if (g.t.includes(w0)) fail(tag, `달력 화면에 「${w0}」`);
      const okGold = s0 => /^[!?]/.test(s0) || /^조심/.test(s0) || /^\?/.test(s0) || s0 === '?';
      const badGold = g.golds.filter(x => !okGold(x)); if (badGold.length) fail(tag, '금빛 글이 「!」 「?」 「조심」 밖: ' + badGold.slice(0, 3).join(' · '));
      if (g.bad) fail(tag, `이름이나 값이 빈 줄 ${g.bad}개`);
      if (e.cal.home && w === 360 && font === 0 && trData.days.some(x => x.sel.length) && trData.days[0].sel.length && g.first < 1) fail(tag, '첫 화면(360 × 640)에 종목 줄이 하나도 없음(결정표 v3 11절)');
    }
    if (route === '#/' && w === 390 && font === 0) { numbers++; if (await p.evaluate(() => document.querySelectorAll('#view .seg button').length)) fail(tag, '첫 화면에 「큰 회사는 크게」 단추가 남음(요즘 오르는 업종은 한 회사 한 표 1주만 · 규칙 64)'); }
    if (e.surge) { // 급등 탭(규칙 69) — 1등 빛 없음 · 금빛 줄 = 장 중에 든 곳만 · 기관 이름 없음(접은 글까지) · 그림이 첫 화면(360 × 640) 안 · 접은 칸을 모두 열어 다시 잼
      const tk = `${tag} · 급등`, g = await p.evaluate(() => { const s = document.querySelector('#view .svr svg')?.getBoundingClientRect(), t = document.querySelector('.tabbar')?.getBoundingClientRect();
        return {win: document.querySelectorAll('#view .row.win').length, gold: document.querySelectorAll('#view .board .row .badge.gold').length, svgB: s ? s.bottom + scrollY : null, tabT: t ? t.top : null, svgN: document.querySelectorAll('#view .svr svg').length}; });
      numbers += 4;
      if (g.win) fail(tk, `1등 빛 줄 ${g.win}개(없어야 함)`);
      if (g.gold !== e.surge.gold) fail(tk, `금빛 줄 ${g.gold} ≠ 장 중에 든 곳 ${e.surge.gold}`);
      if (g.svgN !== 1) fail(tk, `그림 「5일 오름 자」 ${g.svgN}개`);
      if (w === 360 && hgt === 640 && !(g.svgB != null && g.tabT != null && g.svgB <= g.tabT)) fail(tk, `그림이 첫 화면 밖(그림 끝 ${g.svgB} · 아래 탭 ${g.tabT})`); // 글씨 셋 모두(새 눈 점검 1 — 사장님은 큰 글씨를 쓰심)
      // 다섯 칸(16:28 「총 5개」) — 고리 차례 · 지금 칸 하나 · 늘 한 줄(어떤 글씨 · 넓이에서도)
      const ch = await p.evaluate(() => { const A = [...document.querySelectorAll('#view nav.sv-chips a')]; return {l: A.map(a => [a.getAttribute('href'), a.textContent.trim()]), cur: A.filter(a => a.getAttribute('aria-current') === 'page').map(a => a.getAttribute('href')), rows: new Set(A.map(a => Math.round(a.getBoundingClientRect().top))).size}; });
      numbers += 3;
      if (JSON.stringify(ch.l) !== JSON.stringify([['#/surge', '급등'], ['#/surge/10', '10%'], ['#/surge/20', '20%'], ['#/surge/30', '30%'], ['#/surge/40', '40%']])) fail(tk, '다섯 칸 고리 ' + JSON.stringify(ch.l));
      if (ch.cur.join() !== route) fail(tk, `지금 칸 ${ch.cur} ≠ ${route}`);
      if (ch.rows !== 1) fail(tk, `다섯 칸이 ${ch.rows}줄(한 줄이어야 함)`);
      // 달력(16:34 「매일 매일 선택됐다 탈락 됐다 이동 했다」) — 칸마다 든 · 뺌 수 = surgecal.json 에서 따로 셈 · 고른 날 = 이 칸이 바뀐 마지막 날 · 그날 판만 보임
      if (surgecal) { const X = svCalExp(surgecal, e.surge.tab);
        const cal = await p.evaluate(() => ({btn: [...document.querySelectorAll('#view .sv-wk button.sv-cell')].map(c => [c.dataset.d, c.innerText.replace(/\s+/g, ' ').trim(), c.getAttribute('aria-pressed'), Math.round(c.getBoundingClientRect().width), Math.round(c.getBoundingClientRect().height)]),
          shown: [...document.querySelectorAll('#view .sv-day')].filter(x => !x.hidden).map(x => x.dataset.d), panels: document.querySelectorAll('#view .sv-day').length}));
        numbers += X.days.length * 2 + 2;
        if (JSON.stringify(cal.btn.map(x => x[0])) !== JSON.stringify(X.days.map(x => x[0]))) fail(tk, `달력 날 ${cal.btn.map(x => x[0]).join(',')} ≠ ${X.days.map(x => x[0]).join(',')}`);
        for (const [d, nI, nO, nE] of X.days) { const c = cal.btn.find(x => x[0] === d); if (!c) continue; const gi = +(/든 (\d+)/.exec(c[1])?.[1] ?? 0), go = +(/뺌 (\d+)/.exec(c[1])?.[1] ?? 0);
          if (gi !== nI || go !== nO || (!nE && !/없음/.test(c[1]))) fail(tk, `달력 ${d} 「${c[1]}」 ≠ 든 ${nI} · 뺌 ${nO}`); if (c[3] < 44 || c[4] < 44) fail(tk, `달력 칸 ${d} ${c[3]}×${c[4]}(44px 밑)`); }
        if (cal.btn.filter(x => x[2] === 'true').map(x => x[0]).join() !== X.pick || cal.shown.join() !== X.pick) fail(tk, `고른 날 ${cal.btn.filter(x => x[2] === 'true').map(x => x[0])} · 보인 판 ${cal.shown} ≠ ${X.pick}`);
        if (cal.panels !== X.days.length) fail(tk, `날 판 ${cal.panels} ≠ ${X.days.length}`); }
      await p.evaluate(() => document.querySelectorAll('#view details').forEach(d => { d.open = true; })); await p.waitForTimeout(40);
      { errs.length = 0; const r2 = await look(p); screens++; judge(`${tk} · 접은 칸 열림`, r2, errs); moTotal += r2.moN; if (/CIA|씨아이에이|정보기관|중앙정보국/i.test(r2.all + '\n' + r2.text)) fail(tk, '기관 이름이 보임(레드 셀 반대 2 — 권위 이름을 빌리지 않음)'); }
      await p.evaluate(() => { document.querySelectorAll('#view details').forEach(d => { d.open = false; }); window.scrollTo(0, 0); });
    }
    if (route === '#/info') await p.evaluate(() => { location.hash = '#/'; });
}
/** 고른 곳 밖 회사 길(모든 회사 7단) — 한 판 안에서 칸(페이지) 여럿이 나눠 돎 · 칸마다 오류 모음 따로 · 500길마다 진행 줄(표준 오류) */
async function sweepOthers(ctx, w, hgt, font, LIST = OROUTES) {
  const K = Math.max(1, +arg('--pages', 3)); let next = 0, done = 0; const t0 = Date.now();
  await Promise.all(Array.from({length: K}, async () => {
    const p = await ctx.newPage(), errs = []; p.on('pageerror', e => errs.push('pageerror ' + e.message)); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
    await p.goto(base + '/atlas/', {waitUntil: 'networkidle'}); await p.waitForFunction(() => document.querySelector('#view h1'));
    while (next < LIST.length) { const r = LIST[next++]; await visit(p, errs, r, w, hgt, font); if (++done % 500 === 0) console.error(`고른 곳 밖 ${done.toLocaleString('ko-KR')} / ${LIST.length.toLocaleString('ko-KR')}길 · ${Math.round((Date.now() - t0) / 1000)}초 · 실패 ${fails.length}`); }
    await p.close();
  }));
}
for (const [w, hgt, font] of plans) {
  const ctx = await b.newContext({viewport: {width: w, height: hgt}, reducedMotion: 'reduce'});
  await ctx.addInitScript(f => { try { localStorage.setItem('atlas:font', String(f)); } catch {} }, font);
  const p = await ctx.newPage();
  const errs = []; p.on('pageerror', e => errs.push('pageerror ' + e.message)); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  await p.goto(base + '/atlas/', {waitUntil: 'networkidle'});
  await p.waitForFunction(() => document.querySelector('#view h1'));
  for (const route of routes) await visit(p, errs, route, w, hgt, font);
  if (w === 390 && font === 0 && CROUTES.length) await sweepOthers(ctx, w, hgt, font, CROUTES); // 달력 종목 파일 나머지(규칙 70) — 390 · 보통 글씨 한 판
  if (w === 390 && font === 0 && OROUTES.length) await sweepOthers(ctx, w, hgt, font); // 고른 곳 밖 회사 3 ~ 7단 — 390 · 보통 글씨 한 판(길 지도 · 3번 누름도 여기서)
  // 찾기 — 한 글자 · 첫 글자 · 영어 이름 소리 · 번호 · 365곳 밖
  if (font === 0) {
    for (const [q, want] of [['삼성', '삼성전자'], ['ㅅㅅㅈㅈ', '삼성전자'], ['에스케이하이', 'SK하이닉스'], ['005930', '삼성전자'], [core.industries[0].name, core.industries[0].name], [OUT1.n, `${core.rules.name} 밖`],
      [OUTL.n, OUTL.n], [OUTL.c, OUTL.n]]) { // 전 종목(사장님 2026-10-14 08:38 「전 종목을 전부 등록 시켜」 · 08:41 「가」) — 몸값이 가장 작은 회사도 이름 · 번호로 찾힘
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
    // 모든 회사 7단(2026-10-14 17:25) — 밖 칸은 회사 주식이 아닌 것(펀드 · 우선주 …)만 · 회사 주식의 옛 밖 칸 주소는 아래에서 3단 회사로 넘어가는지 봄
    const SHEET = CO7 ? (NAMES.rows.find(r => r.s !== 'in' && r.k) ?? OUT1) : OUT1;
    await p.evaluate(c => { location.hash = '#/x/' + c; }, SHEET.c);
    try { await p.waitForFunction(() => document.querySelector('#infoBody .funnel'), null, {timeout: 5000}); const t = await p.$eval('#infoBody', x => x.innerText); screens++; if (!/멈췄습니다/.test(t)) fail(`${w} 365곳 밖`, '까닭 줄 없음');
      if (MKT?.[SHEET.c]) { numbers++; if (!t.includes(`업종 ${MKT[SHEET.c].i}`) || !t.includes(pct(MKT[SHEET.c].c))) fail(`${w} 365곳 밖`, `업종 · 20거래일 줄 없음(업종 ${MKT[SHEET.c].i} · ${pct(MKT[SHEET.c].c)})`); } } catch { fail(`${w} 365곳 밖`, '깔때기 안 그려짐'); }
    if (CO7 && MKT[OUT1.c]) { // 옛 밖 칸 주소(회사 주식) → 3단 회사(사장님 17:25 「전부다 나오게 해」)
      await p.evaluate(() => { for (const x of document.querySelectorAll('[data-close]')) if (!x.closest('[hidden]')) x.click(); });
      await p.evaluate(c => { location.hash = '#/x/' + c; }, OUT1.c);
      try { await p.waitForFunction(c => location.hash === '#/c/' + c && document.querySelector('#view .co-head h1'), OUT1.c, {timeout: 8000}); screens++; numbers++; }
      catch { fail(`${w} 옛 밖 칸 주소`, `#/x/${OUT1.c} 가 3단 회사(#/c/${OUT1.c})로 넘어가지 않음`); }
      const eF = errs.splice(0); if (eF.length) fail(`${w} 옛 밖 칸 주소`, '오류: ' + eF[0]);
    }
  }
  await ctx.close();
}
// 먹빛 첫 화면 둘레(사장님 2026-10-15(싱가포르) 09:41 · 규칙 67 — 큰 날 · 모르는 값 · 자료 없음 · 다음 날 아침 · 장 중 · 고른 단추 기억 · 여는 홍표)
if (home) {
  const GOLD = 'rgb(233, 185, 73)';
  const seeHome = p => p.evaluate(() => { const T2 = e => (e?.textContent ?? '').replace(/⁠/g, '').replace(/ /g, ' ').trim();
    return {alerts: [...document.querySelectorAll('#view .m4-al')].map(x => { const q = x.getBoundingClientRect(), s = getComputedStyle(x); return {t: T2(x), inView: q.top >= 0 && q.bottom <= innerHeight, size: parseFloat(s.fontSize), color: s.color}; }),
      qs: [...document.querySelectorAll('#view .m4-q')].map(T2), metas: [...document.querySelectorAll('#view .m4-meta')].map(T2), leads: [...document.querySelectorAll('#view .m4-lead')].map(T2),
      pressed: [...document.querySelectorAll('#view .m4-seg button, #view .m4-per button')].map(b => b.getAttribute('aria-pressed')), cap: T2(document.querySelector('#view .m4-pc')), sw: document.documentElement.scrollWidth, cw: innerWidth}; });
  const withHome = async (H2, opt = {}) => { const ctx = await b.newContext({viewport: {width: 390, height: 844}, reducedMotion: 'reduce', ...opt}); if (H2 !== undefined) await ctx.route('**/atlas/data/home.json', r => (H2 === 404 ? r.fulfill({status: 404, body: 'no'}) : r.fulfill({contentType: 'application/json', body: JSON.stringify(H2)}))); const p = await ctx.newPage(), errs = []; p.on('pageerror', e => errs.push(e.message)); p.on('console', m => { if (m.type() === 'error' && !/404/.test(m.text())) errs.push(m.text()); }); return {ctx, p, errs}; };
  // ① 큰 날 · 못 받은 값 · 모르는 값 — 문턱 넘은 지수 「!」 = 금빛 21px · 첫 화면(390×844) 안 · 사고판 돈 앞 값 「?」(그 값을 받은 때와 함께) · 미국 「?」
  { const H2 = JSON.parse(JSON.stringify(home)); H2.stale = {flows: '2026-10-12 14:00'}; H2.us = null; H2.alerts = (home.alerts ?? []).filter(a => a.kind === 'idx'); if (!H2.alerts.length) H2.alerts = [{kind: 'idx', key: 'KOSPI', name: '코스피', v: -3.5, why: 'usual'}];
    const {ctx, p, errs} = await withHome(H2); await p.goto(base + '/atlas/', {waitUntil: 'networkidle'}); await p.waitForSelector('#view .m4-sec');
    const f = await seeHome(p), X = m4Expect(H2); screens++; numbers += 4 + f.alerts.length;
    if (JSON.stringify(f.alerts.map(a => a.t)) !== JSON.stringify(X.alerts) || !f.alerts.length) fail('큰 날 · 모르는 값', `금빛 알림 ${JSON.stringify(f.alerts.map(a => a.t))} ≠ ${JSON.stringify(X.alerts)}`);
    for (const a of f.alerts) if (!a.inView || a.size < 21 || a.color !== GOLD) fail('큰 날 · 모르는 값', `금빛 알림 「${a.t}」이 첫 화면에 금빛 21px 로 안 보임(${a.inView} · ${a.size} · ${a.color})`);
    if (!f.qs.some(q => q.startsWith('? 이번에 사고판 돈을 못 받아 10월 12일 오후 2:00에 받은 값이에요.'))) fail('큰 날 · 모르는 값', '사고팔기에 앞 값 「?」(받은 때) 없음: ' + JSON.stringify(f.qs));
    if (!f.qs.includes('? 이번에 미국 값을 못 받았어요.')) fail('큰 날 · 모르는 값', '미국에 「?」 없음');
    for (const q of X.notes) { numbers++; if (!f.qs.includes(q)) fail('큰 날 · 모르는 값', `못 받은 값 줄 「${q}」 없음`); }
    if (errs.length) fail('큰 날 · 모르는 값', '오류 ' + errs[0]);
    await ctx.close(); }
  // ② home.json 을 못 읽음 → 사장님 편지 · 「시장 — ?」 · 요즘 오르는 업종 · 큰 갈래는 그대로 · 오류 없음
  { const {ctx, p, errs} = await withHome(404); await p.goto(base + '/atlas/', {waitUntil: 'networkidle'}); await p.waitForSelector('#view h1');
    const r = await p.evaluate(() => ({hello: document.querySelector('#view a.hello')?.getAttribute('href') ?? null, msg: document.querySelectorAll('#view .m4-letter .hml').length, h1: document.querySelector('#view h1').textContent, q: document.querySelector('#view p.q')?.textContent ?? '',
      rows: document.querySelectorAll('#view .m4-tr').length, groups: document.querySelectorAll('#view .m4-g').length, sw: document.documentElement.scrollWidth, cw: innerWidth}));
    screens++; numbers += 5; if (r.hello !== '/hello.html' || r.msg !== 7 || r.h1 !== '시장 — ?' || !r.q.includes('못 읽었어요') || r.rows !== core.rise.list.length || r.groups !== core.groups.length || r.sw > r.cw) fail('첫 화면 자료 없음', JSON.stringify(r).slice(0, 200));
    if (errs.length) fail('첫 화면 자료 없음', '오류 ' + errs[0]);
    await ctx.close(); }
  // ③ 장 중(같은 날 10:30) · 다음 날 아침(9:30) — 제때 받은 장 중 값: 같은 날은 「오늘 … · 장 중」 · 「오늘 오전 10:06까지」(받은 때까지 — 「지금까지」라 하지 않음 · 다른 눈 L5) / 다음 날은 「오늘」 · 「장 중」 말 없음(CIA)
  { const d0 = home.kst.slice(0, 10), H3 = JSON.parse(JSON.stringify(home)); H3.stale = {}; H3.live = true; H3.kst = d0 + ' 10:06';
    for (const k of ['KOSPI', 'KOSDAQ']) if (H3.idx?.[k]) { H3.idx[k].live = true; H3.idx[k].date = d0; } if (H3.flows) { H3.flows.live = true; for (const k of ['KOSPI', 'KOSDAQ']) if (H3.flows[k]) H3.flows[k].date = d0; } if (H3.sectors) H3.sectors.date = d0;
    for (const [when, name] of [[Date.parse(d0 + 'T01:30:00Z'), '장 중'], [Date.parse(d0 + 'T00:30:00Z') + 864e5, '다음 날 아침']]) {
      const {ctx, p, errs} = await withHome(H3); await p.clock.setFixedTime(new Date(when)); await p.goto(base + '/atlas/', {waitUntil: 'networkidle'}); await p.waitForSelector('#view .m4-sec');
      const f = await seeHome(p); screens++; numbers += 3;
      if (name === '장 중') { if (!f.metas[0]?.startsWith('오늘 오전 10:06 · 장 중')) fail(name, `시장 머리 때 「${f.metas[0]}」`); if (!f.leads[0]?.startsWith('오늘 오전 10:06까지 코스피는')) fail(name, `오늘 한 줄 「${f.leads[0]}」`); if (!f.leads[1]?.startsWith('오늘 오전 10:06까지 ')) fail(name, `오른 곳 첫 줄 「${f.leads[1]}」`); }
      else { const bad = [...f.metas, ...f.leads].filter(t => t.includes('오늘')); if (bad.length) fail(name, '어제 값에 「오늘」: ' + bad.join(' · ')); if (f.metas.some(t => t.includes('장 중'))) fail(name, '어제 장 중에 받은 값을 「장 중」이라 함'); if (!f.qs.length && !f.leads.length) fail(name, '글 없음'); }
      if (errs.length) fail(name, '오류 ' + errs[0]);
      await ctx.close(); } }
  // ④ 고른 단추 기억(이 기기) — 코스닥 · 1달을 누르고 다시 열면 그대로 · 오늘 한 줄 · 사고팔기가 코스닥 · 1달 동안 줄
  { const {ctx, p, errs} = await withHome(); await p.goto(base + '/atlas/', {waitUntil: 'networkidle'}); await p.waitForSelector('#view .m4-seg');
    await p.click('#view .m4-seg button:nth-child(2)'); await p.click('#view .m4-per button:nth-child(2)'); await p.waitForTimeout(100);
    await p.reload({waitUntil: 'networkidle'}); await p.waitForSelector('#view .m4-seg');
    const f = await seeHome(p), fl = await p.evaluate(() => document.querySelector('#m4-h-fl')?.closest('.m4-sec')?.querySelector('.m4-meta')?.textContent ?? '');
    const Q = home.idx?.KOSDAQ, want = Q ? todayX('코스닥', Q, wOfX(home, 'idx', (home.idx?.KOSPI ?? Q)?.live)).join(' ') : null; screens++; numbers += 4;
    if (JSON.stringify(f.pressed) !== JSON.stringify(['false', 'true', 'false', 'true', 'false'])) fail('고른 단추 기억', `다시 연 뒤 단추 ${f.pressed.join(',')}`);
    if (want && f.leads[0] !== want) fail('고른 단추 기억', `오늘 한 줄 「${f.leads[0]}」 ≠ 「${want}」`);
    if (home.flows?.KOSDAQ && !fl.replace(/^\?\s*/, '').startsWith('코스닥')) fail('고른 단추 기억', `사고팔기가 고른 지수를 안 따라감 「${fl}」`);
    if (!f.cap.startsWith('1달 동안')) fail('고른 단추 기억', `기간 줄 「${f.cap}」`);
    if (errs.length) fail('고른 단추 기억', '오류 ' + errs[0]);
    await ctx.close(); }
  // ⑤ 여는 홍표(움직임 켬 · 390 · 규칙 66) — 열면 홍표 그림 + 「홍표!」 세 번 · 글은 안 보임 → 4.2초에 제자리로 날아감 → 5초에 사장님 글 · 다시 첫 화면에 와도 다시 안 함
  { const ctx = await b.newContext({viewport: {width: 390, height: 844}}); const p = await ctx.newPage(), errs = []; p.on('pageerror', e => errs.push(e.message));
    await p.goto(base + '/atlas/', {waitUntil: 'commit'}); await p.waitForSelector('#view .m4-letter .hpi', {timeout: 30000}); const t0 = Date.now(), at = ms => p.waitForTimeout(Math.max(0, ms - (Date.now() - t0)));
    const chk = (ok, what) => { numbers++; if (!ok) fail('여는 홍표', what); };
    const see = () => p.evaluate(() => { const a = document.querySelector('#view a.m4-letter'), pi = a?.querySelector('.hpi'), img = pi?.querySelector('img.hpi-bird'), bs = [...(pi?.querySelectorAll('.hpi-b') ?? [])], r = a?.getBoundingClientRect(), ls = [...(a?.querySelectorAll('.hml') ?? [])];
      return {intro: !!a?.classList.contains('intro'), pi: !!pi, img: img?.getAttribute('src') ?? null, ok: img ? img.complete && img.naturalWidth > 0 : false, bub: bs.map(x => x.textContent), op: bs.map(x => +getComputedStyle(x).opacity),
        inside: bs.every(x => { const q = x.getBoundingClientRect(); return q.left >= r.left - 1 && q.right <= r.right + 1 && q.top >= r.top - 1; }), shown: ls.some(x => getComputedStyle(x).visibility === 'visible'), mlo: Math.min(...ls.map(x => +getComputedStyle(x).opacity)),
        msg: ls.map(x => x.textContent), sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth}; });
    const i0 = await see();
    chk(i0.intro && i0.pi && i0.img === '/media/makbi-hello.svg' && JSON.stringify(i0.bub) === JSON.stringify(['홍표!', '홍표!', '홍표!']), '열 때 홍표(그림 · 「홍표!」 세 번)가 없음: ' + JSON.stringify(i0).slice(0, 160));
    chk(!i0.shown, '여는 홍표 동안 사장님 글이 보임');
    await at(2700); const i1 = await see();
    chk(i1.ok && i1.op.length === 3 && i1.op.every(x => x > 0.9) && i1.inside && i1.sw <= i1.cw, '「홍표!」 세 번이 다 안 보이거나 편지 밖으로 넘침: ' + JSON.stringify(i1).slice(0, 160));
    await at(4000); const i4 = await see();
    chk(i4.intro && i4.pi && !i4.shown, '홍표가 5초를 다 못 채우고 사장님 글로 바뀜(06:01 「가」 — 홍표 5초): ' + JSON.stringify(i4).slice(0, 160));
    await at(8200); const i2 = await see();
    chk(!i2.intro && !i2.pi && i2.shown && i2.mlo > 0.95 && JSON.stringify(i2.msg) === JSON.stringify(HELLO_LINES), '여는 홍표 뒤 사장님 글이 글자 그대로 다 안 보임: ' + JSON.stringify(i2).slice(0, 160));
    await p.evaluate(() => { location.hash = '#/list'; }); await p.waitForTimeout(700); await p.evaluate(() => { location.hash = '#/'; }); await p.waitForSelector('#view .m4-letter'); await p.waitForTimeout(300);
    chk(await p.evaluate(() => !document.querySelector('#view .m4-letter .hpi')), '다시 첫 화면에 왔는데 여는 홍표를 다시 함(새로 열 때만)');
    screens++; if (errs.length) fail('여는 홍표', '오류 ' + errs[0]);
    await ctx.close(); }
  // ⑥ 움직임 줄이기 — 여는 홍표 없이 바로 사장님 글 · 그래프 · 막대는 끝 모양
  { const {ctx, p, errs} = await withHome(); await p.goto(base + '/atlas/', {waitUntil: 'networkidle'}); await p.waitForSelector('#view .m4-sec');
    const r = await p.evaluate(() => ({pi: !!document.querySelector('#view .hpi'), intro: !!document.querySelector('#view .m4-letter.intro'), shown: [...document.querySelectorAll('#view .m4-letter .hml')].every(x => getComputedStyle(x).visibility === 'visible' && +getComputedStyle(x).opacity > 0.95)}));
    screens++; numbers++; if (r.pi || r.intro || !r.shown) fail('움직임 줄이기', '여는 홍표가 나오거나 사장님 글이 바로 안 보임: ' + JSON.stringify(r));
    if (errs.length) fail('움직임 줄이기', '오류 ' + errs[0]);
    await ctx.close(); }
  // ⑦ 못 받은 때가 둘(다른 눈 점검 H1 · M1 · 2026-10-15) — 받은 때마다 한 줄 · 못 받은 칸 머리 때 앞 금빛 「?」 · 코스닥을 눌러 사고팔기를 다시 그려도 「?」 줄이 그대로
  { const H2 = JSON.parse(JSON.stringify(home)); H2.stale = {idx: '2026-10-12 14:59', sectors: '2026-10-12 14:59', flows: '2026-10-12 13:00', us: '2026-10-11 07:00'};
    const {ctx, p, errs} = await withHome(H2); await p.goto(base + '/atlas/', {waitUntil: 'networkidle'}); await p.waitForSelector('#view .m4-sec');
    const X = m4Expect(H2), see = () => p.evaluate(() => ({qs: [...document.querySelectorAll('#view .m4-q')].map(x => x.textContent.replace(/\u00a0/g, ' ').replace(/\u2060/g, '').trim()), mq: [...document.querySelectorAll('#view .m4-sh')].filter(x => x.querySelector('.m4-mq')).map(x => x.querySelector('.m4-t').id)}));
    const f0 = await see(); screens++; numbers += X.notes.length + 1;
    for (const q of X.notes) if (!f0.qs.includes(q)) fail('못 받은 때 둘', `줄 「${q}」 없음 — ${JSON.stringify(f0.qs).slice(0, 300)}`);
    if (X.notes.length !== 3) fail('못 받은 때 둘', `기대 줄 수 ${X.notes.length} ≠ 3(14:59 · 13:00 · 11일 07:00)`);
    if (JSON.stringify(f0.mq) !== JSON.stringify(X.qHeads)) fail('못 받은 때 둘', `머리 「?」 ${f0.mq.join(',')} ≠ ${X.qHeads.join(',')}`);
    if (H2.idx?.KOSDAQ) { await p.click('#view .m4-seg button:nth-child(2)'); await p.waitForTimeout(150); const f1 = await see(); numbers++;
      for (const q of X.notes) if (!f1.qs.includes(q)) fail('못 받은 때 둘', `코스닥을 누른 뒤 줄 「${q}」이 사라짐(다른 눈 M1)`); await p.click('#view .m4-seg button:nth-child(1)'); }
    if (errs.length) fail('못 받은 때 둘', '오류 ' + errs[0]);
    await ctx.close(); }
  // ⑧ 한 조각이 깨져도 첫 화면은 섬(다른 눈 점검 M3) — 코스닥 줄 없음 · 미국 줄 없음 · 받은 때 없음(장 중) · 날 없음 → 「자료를 못 읽었습니다」 · NaN · undefined · null 글 0 · 옆으로 안 넘침
  for (const [nm, mut] of [['코스닥 줄 없음', H => { if (H.idx?.KOSDAQ) delete H.idx.KOSDAQ.rows; }], ['미국 줄 없음', H => { if (H.us) delete H.us.rows; }], ['받은 때 없음', H => { H.live = true; delete H.kst; }],
    ['날 없음', H => { if (H.us) delete H.us.date; if (H.sectors) delete H.sectors.date; if (H.idx?.KOSPI) H.idx.KOSPI.date = null; for (const k of ['KOSPI', 'KOSDAQ']) if (H.flows?.[k]) delete H.flows[k].date; }],
    ['업종 수 없음', H => { if (H.sectors) { delete H.sectors.breadth; delete H.sectors.ranked; } }], ['미국 한 지수', H => { if (H.us?.rows) H.us.rows = H.us.rows.filter(r => r.key === 'INX' || r.key === 'VIX'); }]]) {
    const H2 = JSON.parse(JSON.stringify(home)); mut(H2);
    const {ctx, p, errs} = await withHome(H2); await p.goto(base + '/atlas/', {waitUntil: 'networkidle'}); await p.waitForSelector('#view h1'); await p.waitForTimeout(150);
    const r = await p.evaluate(() => ({t: document.querySelector('#view').innerText, secs: document.querySelectorAll('#view .m4-sec').length, sw: document.documentElement.scrollWidth, cw: innerWidth}));
    screens++; numbers += 3;
    if (r.t.includes('자료를 못 읽었습니다') || r.secs < 7) fail('한 조각 깨짐 · ' + nm, `첫 화면이 서지 않음(칸 ${r.secs})`);
    const bad = ['NaN', 'undefined', 'null', 'Invalid'].filter(w => r.t.includes(w)); if (bad.length) fail('한 조각 깨짐 · ' + nm, `글에 ${bad.join(' · ')}`);
    if (r.sw > r.cw) fail('한 조각 깨짐 · ' + nm, `옆으로 넘침 ${r.sw} > ${r.cw}`);
    if (errs.length) fail('한 조각 깨짐 · ' + nm, '오류 ' + errs[0]);
    await ctx.close(); }
}
// 달력 탭 둘레(규칙 70 · 사장님 2026-10-15 16:40 「관심 없음 버트을 클릭하면 없어지는구조」 · 19:28 「관리하고 판단」) —
//   ① 종목 파일 「관심 없음」 → 달력에서 그 줄이 빠짐 · 「숨긴 곳 1곳 보기」 · 되돌리기 → 돌아옴 ② 「☆ 관심」 → 달력 맨 위 「★ 관심 1곳」 묶음 ③ 칸 고르기(20%) → 줄이 모두 그 칸 ④ 「나머지 n곳 보기」 → 그날 줄 모두
//   ⑤ 기억 못 하는 기계(사생활 창) — 이 화면 동안만 · 오류 0 ⑥ 달력 자료 못 받음 → 「?」 한 줄 · 오류 0 · 종목 파일도 「?」 ⑦ 종목 파일에서 뒤로 → 그 자리
if (trData && trCase) {
  const withTr = async (body, init) => { const ctx = await b.newContext({viewport: {width: 390, height: 844}, reducedMotion: 'reduce'}); if (init) await ctx.addInitScript(init);
    if (body !== undefined) await ctx.route('**/atlas/data/surgetr.json', r => (body === 404 ? r.fulfill({status: 404, body: 'no'}) : r.fulfill({contentType: 'application/json', body: JSON.stringify(body)})));
    const p = await ctx.newPage(), errs = []; p.on('pageerror', e => errs.push(e.message)); p.on('console', m => { if (m.type() === 'error' && !/404/.test(m.text())) errs.push(m.text()); }); return {ctx, p, errs}; };
  const calSt = p => p.evaluate(() => ({rows: [...document.querySelectorAll('#view a.cal-row')].map(a => a.dataset.c), star: document.querySelector('#view .cal-stars .cal-sh')?.textContent ?? null, starRows: [...document.querySelectorAll('#view .cal-stars a.cal-row')].map(a => a.dataset.c),
    gone: document.querySelector('#view details.cal-gone summary')?.textContent ?? null, live: document.querySelector('#view p.sr[aria-live]')?.textContent ?? '', t: document.querySelector('#view').innerText, sw: document.documentElement.scrollWidth, cw: innerWidth}));
  const D0 = trData.days.slice(0, 5), firstC = D0.flatMap(x => x.sel.slice(0, 4))[0], firstN = trData.cases.find(r => r[0] === firstC)?.[1];
  if (firstC) {
    const {ctx, p, errs} = await withTr(); await p.goto(base + '/atlas/#/cal', {waitUntil: 'networkidle'}); await p.waitForSelector('#view a.cal-row'); await p.waitForTimeout(120);
    const s0 = await calSt(p); screens++; numbers += 8;
    // ① 관심 없음
    await p.evaluate(c => { location.hash = '#/cal/' + c; }, firstC); await p.waitForSelector('#view button.cal-hide'); await p.click('#view button.cal-hide'); await p.waitForTimeout(80);
    const live1 = await p.$eval('#view p.sr[aria-live]', x => x.textContent);
    if (!live1.includes('숨겼어요')) fail('달력 관심 없음', `알림 글 「${live1}」`);
    await p.evaluate(() => { location.hash = '#/cal'; }); await p.waitForSelector('#view a.cal-row'); await p.waitForTimeout(100);
    const s1 = await calSt(p);
    if (s1.rows.includes(firstC)) fail('달력 관심 없음', `${firstN} 줄이 그대로 보임`);
    if (s1.gone !== '숨긴 곳 1곳 보기') fail('달력 관심 없음', `숨긴 곳 줄 「${s1.gone}」`);
    await p.evaluate(() => { const d = document.querySelector('#view details.cal-gone'); if (d) d.open = true; }); await p.click('#view button.cal-show'); await p.waitForTimeout(80);
    const s2 = await calSt(p); if (!s2.rows.includes(firstC) || s2.gone) fail('달력 관심 없음', '되돌리기 뒤 줄이 돌아오지 않음');
    // ② 관심
    await p.evaluate(c => { location.hash = '#/cal/' + c; }, firstC); await p.waitForSelector('#view button.cal-star'); await p.click('#view button.cal-star'); await p.waitForTimeout(60);
    const pressed = await p.$eval('#view button.cal-star', x => [x.getAttribute('aria-pressed'), x.textContent]);
    if (pressed[0] !== 'true' || pressed[1] !== '★ 관심 풀기') fail('달력 관심', `단추 ${pressed.join(' · ')}`);
    await p.evaluate(() => { location.hash = '#/cal'; }); await p.waitForSelector('#view a.cal-row'); await p.waitForTimeout(100);
    const s3 = await calSt(p); if (s3.star !== '★ 관심 1곳' || s3.starRows[0] !== firstC) fail('달력 관심', `맨 위 묶음 ${s3.star} · ${s3.starRows.join(',')}`);
    await p.evaluate(() => { try { localStorage.removeItem('atlas:cal-star'); } catch {} });
    // ③ 칸 고르기 20%
    await p.evaluate(() => { location.hash = '#/up'; }); await p.waitForSelector('#view h1'); await p.evaluate(() => { location.hash = '#/cal'; }); await p.waitForSelector('#view .cal-chips');
    await p.click('#view .cal-chips button[data-f="2"]'); await p.waitForTimeout(80);
    const s4 = await calSt(p), b0 = new Map(trData.cases.map(r => [r[0], r[3]]));
    const wrong = s4.rows.filter(c => b0.get(c) !== '2'); if (wrong.length) fail('달력 칸 고르기', `20% 칸이 아닌 줄 ${wrong.length}개`);
    const want4 = trData.cases.filter(r => r[3] === '2').length; if (s4.rows.length !== want4) fail('달력 칸 고르기', `20% 줄 ${s4.rows.length} ≠ ${want4}`); // 모든 날 줄(접은 칸 안도)
    await p.click('#view .cal-chips button[data-f="all"]'); await p.waitForTimeout(60);
    // ④ 나머지 n곳 보기
    const big = D0.find(x => x.sel.length > (x.sel.every(c => trData.cases.find(r => r[0] === c)?.[6] === 'n') ? 2 : 4));
    if (big) { await p.click(`#view section.cal-day[data-d="${big.d}"] details.cal-rest > summary`); await p.waitForTimeout(60);
      const n = await p.$$eval(`#view section.cal-day[data-d="${big.d}"] a.cal-row`, xs => xs.filter(x => x.getBoundingClientRect().height > 0).length); if (n !== big.sel.length) fail('달력 나머지 보기', `${big.d} 보이는 줄 ${n} ≠ ${big.sel.length}`); }
    // 지난 날 접은 칸 — 열면 그 다섯 날이 보임 · 종목 파일에서 돌아오면 연 칸 그대로
    const old5 = trData.days.slice(5, 10);
    if (old5.length) { await p.click(`#view details.cal-older[data-k="older-${old5[0].d}"] > summary`); await p.waitForTimeout(60);
      const vis = await p.$$eval('#view details.cal-older[open] section.cal-day', xs => xs.map(x => x.dataset.d)); if (JSON.stringify(vis) !== JSON.stringify(old5.map(x => x.d))) fail('달력 지난 날 보기', `${vis.join(',')} ≠ ${old5.map(x => x.d).join(',')}`); }
    // ⑦ 종목 파일에서 뒤로 → 그 자리
    await p.evaluate(() => window.scrollTo(0, 900)); await p.waitForTimeout(60); const y0 = await p.evaluate(() => window.scrollY);
    await p.evaluate(c => { location.hash = '#/cal/' + c; }, firstC); await p.waitForSelector('#view button.cal-hide'); await p.goBack(); await p.waitForSelector('#view a.cal-row'); await p.waitForTimeout(200);
    const y1 = await p.evaluate(() => window.scrollY); if (Math.abs(y1 - y0) > 80) fail('달력 뒤로 오면 그 자리', `${y1} ≠ ${y0}`);
    if (old5.length && !(await p.$(`#view details.cal-older[data-k="older-${old5[0].d}"][open]`))) fail('달력 뒤로 오면 그 자리', '연 지난 날 칸이 닫힘');
    if (s0.sw > s0.cw) fail('달력 둘레', `옆 넘침 ${s0.sw} > ${s0.cw}`);
    if (errs.length) fail('달력 둘레', '오류 ' + errs[0]);
    await ctx.close();
  }
  // ⑤ 기억 못 하는 기계
  if (firstC) { const {ctx, p, errs} = await withTr(undefined, () => { Object.defineProperty(window, 'localStorage', {get() { throw new Error('막힘'); }}); });
    await p.goto(base + '/atlas/#/cal/' + firstC, {waitUntil: 'networkidle'}); await p.waitForSelector('#view button.cal-hide'); await p.click('#view button.cal-hide'); await p.waitForTimeout(60);
    const live = await p.$eval('#view p.sr[aria-live]', x => x.textContent); screens++; numbers += 2;
    if (!live.includes('기억을 못 해')) fail('달력 기억 못 하는 기계', `알림 「${live}」`);
    await p.evaluate(() => { location.hash = '#/cal'; }); await p.waitForSelector('#view .cal-chips'); await p.waitForTimeout(80);
    const s = await calSt(p); if (s.rows.includes(firstC)) fail('달력 기억 못 하는 기계', '이 화면 동안 숨김이 안 됨');
    if (errs.length) fail('달력 기억 못 하는 기계', '오류 ' + errs[0]); await ctx.close(); }
  // ⑥ 자료 못 받음
  { const {ctx, p, errs} = await withTr(404); await p.goto(base + '/atlas/#/cal', {waitUntil: 'networkidle'}); await p.waitForSelector('#view h1'); await p.waitForTimeout(120);
    const t = await p.$eval('#view', x => x.innerText); screens++; numbers++;
    if (!t.includes('? 달력 자료를 못 받았어요.')) fail('달력 못 받음', '「?」 줄이 없음');
    await p.evaluate(c => { location.hash = '#/cal/' + c; }, trData.cases[0][0]); await p.waitForTimeout(400);
    const t2 = await p.$eval('#view', x => x.innerText); if (!t2.includes('? 종목 파일을 못 받았어요.')) fail('달력 못 받음', '종목 파일 「?」 줄이 없음');
    if (errs.length) fail('달력 못 받음', '오류 ' + errs[0]); await ctx.close(); }
}
// 조건 찾기 탭(사장님 2026-10-15(싱가포르) 23:53 「엘셀처럼 찾는 조건을 3가지 걸수 하자 … 속은 정밀하나 사용은 정말 감편하게」 · 23:54 「가」 · 규칙 72) —
//   cond.json 으로 결정표(docs/design/cond-2026-10-16 v1 · v2)대로 따로 센 기대와 화면을 맞댐:
//   ① 처음(보는 기계에 기억 없음) = 큰 회사가 오른 업종 · 대장주 · 5일 10% 넘게 오른 곳 빼기 — 칸 셋 글 · 칸마다 남은 수 · 남은 곳 · ▲▼ · 깔때기 · 줄(이름 · 5일간 % · 업종 · 몸값 n등 · 고리)
//   ② 칸마다 고르기 판 — 고르기 이름 · 「→ n곳」 ③ 고르면 바뀜 · 「처음대로」 ④ 기억(다시 열면 그대로) ⑤ 많을 때 20곳 · 「더 보기」 ⑥ 0곳 「풀면 n곳」 ⑦ ? 접은 칸
//   ⑧ 자료 못 받음 · 날이 다름 → 「?」 한 줄 ⑨ 기억 못 하는 기계 ⑩ 320 폭 옆 넘침 0 · 쓰지 않을 말 0 · 오류 0
if (condX) {
  const OPS = {a: [['big', '큰 회사가 오른 업종'], ['rise', '요즘 오르는 업종'], ['up', '한 달 오른 업종'], ['dn', '한 달 내린 업종'], ['all', '업종 가리지 않음']], b: [['lead', '대장주'], ['top3', '업종 몸값 3등까지'], ['f3', '3년 모두 돈 번 곳'], ['pick', '고른 곳'], ['all', '회사 가리지 않음']], c: [['nos', '5일 10% 넘게 오른 곳 빼기'], ['spike', '확 뛴 곳 모두 빼기'], ['loss', '지난해 손해 본 곳 빼기'], ['all', '빼지 않음']]};
  const X = condX, C = X.co;
  const tst = (k, op, j) => { if (op === 'all') return true; const I = X.ind[C.i[j]];
    if (k === 'a') return op === 'big' ? (I.rc == null ? null : I.rc === 1) : op === 'rise' ? I.rise === 1 : op === 'up' ? I.up === 1 : I.dn === 1;
    if (k === 'b') return op === 'pick' ? C.p[j] === 1 : op === 'f3' ? (C.f3[j] == null ? null : C.f3[j] === 1) : C.rk[j] == null ? null : op === 'lead' ? C.rk[j] === 1 : C.rk[j] <= 3;
    if (op === 'nos') return C.x5[j] == null ? null : C.x5[j] === 0;
    if (op === 'spike') { const f = [C.x5[j], C.d15[j], C.m30[j]]; return f.includes(1) ? false : f.includes(null) ? null : true; }
    return C.ls[j] == null ? null : C.ls[j] === 0; };
  const cnt = st => { let cur = C.c.map((_, j) => j); const steps = [cur.length]; let q = 0; for (const k of ['a', 'b', 'c']) { const nx = []; for (const j of cur) { const v = tst(k, st[k], j); if (v === true) nx.push(j); else if (v == null) q++; } cur = nx; steps.push(cur.length); }
    cur.sort((x, y) => (C.cap[y] ?? -1) - (C.cap[x] ?? -1) || (C.c[x] < C.c[y] ? -1 : 1)); return {steps, res: cur, q}; };
  const nm = j => MKT?.[C.c[j]]?.n ?? C.c[j], loc = n => n.toLocaleString('ko-KR');
  const rowsOf = R => R.res.slice(0, 20).map(j => [nm(j), C.r5[j] == null ? '?' : pct(C.r5[j]), `${X.ind[C.i[j]].n}${C.rk[j] ? ` · 몸값 ${C.rk[j]}등` : ''}`, (comp[C.c[j]] || C.p[j] === 1 ? '#/c/' : (MKT?.[C.c[j]] ? '#/c/' : '#/x/')) + C.c[j]]);
  const DEF = {a: 'big', b: 'lead', c: 'nos'}, NOT = ['추천', '매수', '매도', '사라', '팔라', '예측', '확률', '유망', '기회', '신호', '저평가', '1위', 'TOP', 'NaN', 'undefined', 'Invalid'];
  const withCd = async (body, init, W = 390) => { const ctx = await b.newContext({viewport: {width: W, height: 844}, reducedMotion: 'reduce'}); if (init) await ctx.addInitScript(init);
    if (body !== undefined) await ctx.route('**/atlas/data/cond.json', r => (body === 404 ? r.fulfill({status: 404, body: 'no'}) : r.fulfill({contentType: 'application/json', body: JSON.stringify(body)})));
    const p = await ctx.newPage(), errs = []; p.on('pageerror', e => errs.push(e.message)); p.on('console', m => { if (m.type() === 'error' && !/404/.test(m.text())) errs.push(m.text()); }); return {ctx, p, errs}; };
  const cdSt = p => p.evaluate(() => { const v = document.querySelector('#view'), N = x => (x == null ? x : String(x).replace(/\u2060/g, '').replace(/\u00a0/g, ' '));
    return {slots: [...v.querySelectorAll('button.cd-slot')].map(x => [N(x.querySelector('.cd-o')?.textContent ?? ''), N(x.querySelector('.cd-c')?.textContent ?? ''), x.getBoundingClientRect().height, x.classList.contains('zero')]),
      big: v.querySelector('.cd-big b')?.textContent ?? null, up: v.querySelector('.cd-big .up')?.textContent?.trim() ?? null, dn: v.querySelector('.cd-big .down')?.textContent?.trim() ?? null,
      flow: N(v.querySelector('.cd-flow')?.textContent ?? null), how: N(v.querySelector('.cd-how')?.textContent ?? null), reset: !!v.querySelector('.cd-reset'), none: v.querySelector('.cd-none')?.textContent ?? null,
      alt: [...v.querySelectorAll('.cd-alt button')].map(x => N(x.textContent)), more: N(v.querySelector('.cd-more')?.textContent ?? null), q: N(v.querySelector('details.cd-q summary')?.textContent ?? null),
      rows: [...v.querySelectorAll('a.cd-row')].map(a => [N(a.querySelector('.nm')?.textContent ?? ''), N(a.querySelector('.cd-v b, .cd-v .num')?.textContent?.trim() ?? ''), N(a.querySelector('.cd-sub')?.textContent ?? '').replace(' · 고른 곳', ''), a.getAttribute('href')]),
      gold: [...v.querySelectorAll('a.cd-row .nm.gold')].length, t: N(v.innerText), foot: N(v.querySelector('footer.foot')?.innerText ?? ''), sw: document.documentElement.scrollWidth, cw: innerWidth}; });
  const want = (st, s, tag) => { const R = cnt(st); numbers += 12 + Math.min(20, R.res.length) * 3;
    const wantSlots = ['a', 'b', 'c'].map((k, i) => [OPS[k].find(o => o[0] === st[k])[1], loc(R.steps[i + 1]) + '곳']);
    if (JSON.stringify(s.slots.map(x => x.slice(0, 2))) !== JSON.stringify(wantSlots)) fail(tag, `칸 셋 ${JSON.stringify(s.slots.map(x => x.slice(0, 2)))} ≠ ${JSON.stringify(wantSlots)}`);
    if (s.slots.some(x => x[2] < 44)) fail(tag, '칸 누르는 자리 44px 밑');
    if (s.big !== loc(R.res.length)) fail(tag, `남은 곳 ${s.big} ≠ ${R.res.length}`);
    if (R.res.length) { const up = R.res.filter(j => C.r5[j] != null && C.r5[j] > 0).length, dn = R.res.filter(j => C.r5[j] != null && C.r5[j] < 0).length; if (s.up !== `▲${up}` || s.dn !== `▼${dn}`) fail(tag, `▲▼ ${s.up} ${s.dn} ≠ ▲${up} ▼${dn}`); }
    if (s.flow !== R.steps.map(loc).join(' → ')) fail(tag, `깔때기 ${s.flow} ≠ ${R.steps.map(loc).join(' → ')}`);
    const isDef = st.a === DEF.a && st.b === DEF.b && st.c === DEF.c; if (s.how !== (isDef ? '예로 걸어 둔 조건 · 몸값 큰 차례' : '몸값 큰 차례')) fail(tag, `차례 글 ${s.how}`); if (s.reset === isDef) fail(tag, `「처음대로」 ${s.reset ? '있음(처음 조건인데)' : '없음(바꿨는데)'}`);
    const wr = rowsOf(R); if (JSON.stringify(s.rows.slice(0, 20)) !== JSON.stringify(wr)) fail(tag, `줄 ${JSON.stringify(s.rows.slice(0, 2))} ≠ ${JSON.stringify(wr.slice(0, 2))}`);
    if (s.gold !== R.res.slice(0, 20).filter(j => C.p[j] === 1).length) fail(tag, `금빛 이름 ${s.gold}`);
    if (R.res.length > 20 && s.more !== `${Math.min(20, R.res.length - 20)}곳 더 보기 · 남은 ${loc(R.res.length - 20)}곳`) fail(tag, `더 보기 ${s.more}`); if (R.res.length <= 20 && s.more) fail(tag, '더 보기가 남음');
    if (R.q && s.q !== `? 값을 몰라 넣지 않은 곳 ${loc(R.q)}곳`) fail(tag, `? 접은 칸 ${s.q} ≠ ${R.q}`); if (!R.q && s.q) fail(tag, '? 접은 칸이 남음');
    if (!R.res.length) { if (s.none !== '셋을 모두 넘은 곳이 없어요.') fail(tag, '0곳 글 없음'); const alt = ['a', 'b', 'c'].filter(k => st[k] !== 'all').map((k, i) => `${'①②③'[['a', 'b', 'c'].indexOf(k)]} 풀면 ${loc(cnt({...st, [k]: 'all'}).res.length)}곳`); if (JSON.stringify(s.alt) !== JSON.stringify(alt)) fail(tag, `풀면 ${JSON.stringify(s.alt)} ≠ ${JSON.stringify(alt)}`); }
    const body = s.t.split(s.foot).join(' ').split('급등 탭').join(' '); const bad = NOT.filter(x => body.includes(x)); if (bad.length) fail(tag, `쓰지 않을 말 「${bad.join(' · ')}」`); if (/급등/.test(body.replace(/급등 \d+/g, ''))) fail(tag, '「급등」 — 탭 이름 밖');
    for (const l of ['사고팔 곳을 고른 목록이 아니에요.', '지난 값일 뿐 앞날을 말하지 않아요.', `${md(X.asOf)} ${X.provisional ? '장 중 값' : '장 마감 값'}이에요.`]) if (!s.t.includes(l)) fail(tag, `「${l}」 없음`);
    if (s.sw > s.cw) fail(tag, `옆으로 넘침 ${s.sw} > ${s.cw}`); return R; };
  // ① 처음 · ② 고르기 판 · ③ 바꾸기 · 처음대로 · ④ 기억
  { const {ctx, p, errs} = await withCd(); await p.goto(base + '/atlas/#/cond', {waitUntil: 'networkidle'}); await p.waitForSelector('#view button.cd-slot'); await p.waitForTimeout(100);
    screens++; want(DEF, await cdSt(p), '조건 처음');
    for (const [k, i] of [['a', 0], ['b', 1], ['c', 2]]) { await p.click(`#view button.cd-slot[data-k="${k}"]`); await p.waitForSelector('#cdSheet:not([hidden]) button.cd-op'); await p.waitForTimeout(60);
      const o = await p.evaluate(() => ({t: document.querySelector('#cdTitle').textContent, ops: [...document.querySelectorAll('#cdBody button.cd-op')].map(x => [x.querySelector('b')?.textContent, x.querySelector('.cd-oc')?.textContent, x.getAttribute('aria-current'), x.getBoundingClientRect().height]), sw: document.documentElement.scrollWidth, cw: innerWidth}));
      screens++; numbers += o.ops.length * 2; const wo = OPS[k].map(([op, t]) => [t, `→ ${loc(cnt({...DEF, [k]: op}).res.length)}곳`, op === DEF[k] ? 'true' : null]);
      if (o.t !== `${'①②③'[i]} ${['업종', '회사', '빼기'][i]} 고르기`) fail('조건 고르기 판', `제목 ${o.t}`);
      if (JSON.stringify(o.ops.map(x => x.slice(0, 3))) !== JSON.stringify(wo)) fail('조건 고르기 판', `${'①②③'[i]} ${JSON.stringify(o.ops.map(x => x.slice(0, 2)))} ≠ ${JSON.stringify(wo.map(x => x.slice(0, 2)))}`);
      if (o.ops.some(x => x[3] < 44)) fail('조건 고르기 판', '누르는 자리 44px 밑'); if (o.sw > o.cw) fail('조건 고르기 판', '옆으로 넘침');
      await p.keyboard.press('Escape'); await p.waitForTimeout(80); }
    await p.click('#view button.cd-slot[data-k="c"]'); await p.waitForSelector('#cdSheet:not([hidden]) button.cd-op'); await p.click('#cdBody button.cd-op[data-op="all"]'); await p.waitForTimeout(100);
    screens++; want({...DEF, c: 'all'}, await cdSt(p), '조건 바꿈(③ 빼지 않음)');
    await p.reload({waitUntil: 'networkidle'}); await p.waitForSelector('#view button.cd-slot'); await p.waitForTimeout(100);
    screens++; want({...DEF, c: 'all'}, await cdSt(p), '조건 기억(다시 엶)');
    await p.click('#view .cd-reset'); await p.waitForTimeout(100); screens++; want(DEF, await cdSt(p), '조건 처음대로');
    if (errs.length) fail('조건 찾기', '오류 ' + errs[0]); await ctx.close(); }
  // ⑤ 많을 때 · ⑥ 0곳 · ⑦ ? — 주소로 엶(#/cond/<①>-<②>-<③>)
  { const all = [], keys = []; for (const [a] of OPS.a) for (const [bb] of OPS.b) for (const [c] of OPS.c) { const st = {a, b: bb, c}; all.push([st, cnt(st)]); keys.push(`${a}-${bb}-${c}`); }
    const pickSt = f => { const i = all.findIndex(([, R]) => f(R)); return i < 0 ? null : [all[i][0], keys[i]]; };
    const cases = [['많을 때', pickSt(R => R.res.length > 40)], ['0곳', pickSt(R => R.res.length === 0)], ['? 접은 칸', pickSt(R => R.q > 0 && R.res.length > 0)]];
    for (const [nmC, x] of cases) { if (!x) { numbers++; continue; } // 그런 짝이 지금 자료에 없으면 건너뜀(0곳이 없는 날도 있음)
      const {ctx, p, errs} = await withCd(); await p.goto(base + '/atlas/#/cond/' + x[1], {waitUntil: 'networkidle'}); await p.waitForSelector('#view .cd-big'); await p.waitForTimeout(100);
      screens++; const R = want(x[0], await cdSt(p), `조건 ${nmC} ${x[1]}`);
      if (nmC === '많을 때') { await p.click('#view .cd-more'); await p.waitForTimeout(100); const n2 = await p.$$eval('#view a.cd-row', a => a.length); numbers++; if (n2 !== Math.min(40, R.res.length)) fail(`조건 많을 때 ${x[1]}`, `더 보기 뒤 줄 ${n2}`); }
      if (errs.length) fail('조건 ' + nmC, '오류 ' + errs[0]); await ctx.close(); } }
  // ⑧ 자료 못 받음 · 날이 다름
  for (const [nmE, body, line] of [['못 받음', 404, '? 조건 자료를 못 받았어요.'], ['날이 다름', {...X, asOf: '2026-01-02'}, `? 조건 자료(1월 2일)가 다른 자료(${md(core.asOf)})와 날이 달라요.`]]) {
    const {ctx, p, errs} = await withCd(body); await p.goto(base + '/atlas/#/cond', {waitUntil: 'networkidle'}); await p.waitForSelector('#view h1'); await p.waitForTimeout(150);
    const t = await p.$eval('#view', v => v.innerText.replace(/\u2060/g, '').replace(/\u00a0/g, ' ')); screens++; numbers++;
    if (!t.includes(line)) fail('조건 ' + nmE, `「${line}」 없음`); if (await p.$('#view a.cd-row')) fail('조건 ' + nmE, '옛 줄이 보임');
    if (errs.length) fail('조건 ' + nmE, '오류 ' + errs[0]); await ctx.close(); }
  // ⑨ 기억 못 하는 기계 · ⑩ 320 폭
  { const {ctx, p, errs} = await withCd(undefined, () => { Object.defineProperty(window, 'localStorage', {get() { throw new Error('no storage'); }}); }, 320); await p.goto(base + '/atlas/#/cond', {waitUntil: 'networkidle'}); await p.waitForSelector('#view button.cd-slot'); await p.waitForTimeout(100);
    screens++; want(DEF, await cdSt(p), '조건 기억 못 하는 기계 · 320');
    await p.click('#view button.cd-slot[data-k="a"]'); await p.waitForSelector('#cdSheet:not([hidden]) button.cd-op'); await p.click('#cdBody button.cd-op[data-op="all"]'); await p.waitForTimeout(100);
    screens++; want({...DEF, a: 'all'}, await cdSt(p), '조건 기억 못 하는 기계 · 바꿈');
    if (errs.length) fail('조건 기억 못 하는 기계', '오류 ' + errs[0]); await ctx.close(); }
}
// 36곳 없음(사장님 2026-10-13 06:45 「매수 검토 36곳 영구 삭제 하라」) — 옛 주소 #/36 은 첫 화면으로 · 아래 탭 셋 · 「36곳 · 매수 검토」 글 0 · range.json 만 받음(pick36.json 안 받음)
{
  const ctx = await b.newContext({viewport: {width: 390, height: 844}, reducedMotion: 'reduce'});
  const p = await ctx.newPage(); const errs = [], asked = []; p.on('pageerror', e => errs.push(e.message)); p.on('request', q => asked.push(q.url()));
  await p.goto(base + '/atlas/#/36', {waitUntil: 'networkidle'}); await p.waitForSelector('#view .m4-sec'); await p.waitForTimeout(900); // 먹빛 첫 화면(2026-10-15)
  const r = await p.evaluate(() => ({hash: location.hash, tabs: [...document.querySelectorAll('nav.tabbar a')].map(a => a.textContent.trim()), all: document.body.innerText}));
  await p.goto(base + '/atlas/#/c/' + Object.keys(comp)[0] + '/range', {waitUntil: 'networkidle'}); await p.waitForTimeout(900);
  const r7 = await p.evaluate(() => document.body.innerText);
  screens += 2; numbers += 4;
  if (r.hash !== '#/' && r.hash !== '') fail('36곳 없음', `옛 주소 #/36 이 첫 화면으로 가지 않음(${r.hash})`);
  if (!(r.tabs.length === 5 && r.tabs[0] === '한눈에' && /^업종 \d+$/.test(r.tabs[1]) && r.tabs[2] === '조건' && r.tabs[3] === (surge?.n != null ? '급등 ' + surge.n : '급등') && r.tabs[4] === '달력')) fail('36곳 없음', '아래 탭 ' + r.tabs.join(' · ')); // 탭 다섯(2026-10-15 14:27 급등 탭 · 규칙 69 · 19:36 「가 로 해라」 달력 탭 · 규칙 70 · 23:54 「가」 업데이트 자리에 조건 · 규칙 72 — 옛 「매수 검토 36곳」 탭은 그대로 없음)
  if (has36(r.all + r7)) fail('36곳 없음', '지운 36곳 화면 글이 보임'); // 「136곳」(07:4x) · 「36곳 내림」(14:2x) 같은 셈 글은 아님 — 옛 화면 글 목록으로 봄
  if (asked.some(u => /pick36/.test(u)) || !asked.some(u => /\/range\.json/.test(u))) fail('36곳 없음', '자료 받기 — pick36.json 을 받거나 range.json 을 안 받음');
  if (errs.length) fail('36곳 없음', '오류 ' + errs[0]);
  await ctx.close();
}
// 친구 소개 쪽(레드 셀 반대 2 · 규칙 69) — 소개 쪽 글 · 링크 미리보기 글 · 제목에 「급등」 0(급등 목록을 소개 · 상품권 길에 띄우지 않음)
{
  const ctx = await b.newContext({viewport: {width: 390, height: 844}, reducedMotion: 'reduce'}), p = await ctx.newPage();
  await p.goto(base + '/hello.html', {waitUntil: 'networkidle'});
  const t = await p.evaluate(() => [document.title, document.body.innerText, ...[...document.querySelectorAll('meta[content]')].map(m => m.getAttribute('content'))].join('\n'));
  screens++; numbers++;
  if (t.includes('급등')) fail('친구 소개 쪽', '「급등」 — 소개 쪽에 급등 목록을 띄우지 않음(레드 셀 반대 2 · 규칙 69)');
  await ctx.close();
}
// 급등 다섯 칸 둘레(사장님 2026-10-15 16:34 「몇일후 어떻게 됐는지」 · 16:40 「매일매일 … 관심 없음 버트을 클릭하면 없어지는구조」) — 지금 자료는 처음 고른 날이라 따라간 날이 없음 → 다음 장날 하루를 붙인 사본으로 누름을 봄
//   ① 관심 없음 → 그 줄만 빠짐 · 「숨긴 곳 1곳」 · 이 기계 기억(localStorage) · 다시 열어도 숨김 · 다섯 칸 줄은 그대로 · 다시 보기 → 돌아옴
//   ② 달력 다른 날을 누르면 그날 판만 · ③ 옮김(10%대 → 20%대)이 두 칸 달력에 · ④ 기억 못 하는 기계(사생활 창) — 이 화면 동안만 · 오류 0 · ⑤ 달력 자료 못 받음 → 그 칸만 「?」
if (surge && surgecal && SV_BANDS.length) {
  const nx = d => { let x = Date.parse(d + 'T00:00:00Z'); do x += 864e5; while ([0, 6].includes(new Date(x).getUTCDay())); return new Date(x).toISOString().slice(0, 10); };
  const K2 = JSON.parse(JSON.stringify(surgecal)), d2 = nx(K2.asOf), b10 = surge.bands.b10.members, svM = surge.members;
  K2.dates = [...K2.dates, d2].slice(-K2.keep); K2.asOf = d2; K2.provisional = false; K2.kst = d2 + ' 10:05';
  K2.track = K2.track.map((t, i) => ({...t, path: [[d2, ((i * 37) % 41) - 20 + 0.5]]}));
  const out1 = svM[0], mv = b10.find(m => !svM.some(x => x.c === m.c)) ?? b10[0];
  K2.days = [{d: d2, ev: [[K2.kst, '10:00', out1.c, out1.n, 'out', 'sv', null], [K2.kst, '10:00', mv.c, mv.n, 'move', 'b10', 'b20']]}, ...K2.days];
  const withCal = async (body, init) => { const ctx = await b.newContext({viewport: {width: 390, height: 844}, reducedMotion: 'reduce'}); if (init) await ctx.addInitScript(init);
    await ctx.route('**/atlas/data/surgecal.json', r => (body === 404 ? r.fulfill({status: 404, body: 'no'}) : r.fulfill({contentType: 'application/json', body: JSON.stringify(body)})));
    const p = await ctx.newPage(), errs = []; p.on('pageerror', e => errs.push(e.message)); p.on('console', m => { if (m.type() === 'error' && !/404/.test(m.text())) errs.push(m.text()); }); return {ctx, p, errs}; };
  const st = p => p.evaluate(() => ({rows: [...document.querySelectorAll('#view details.sv-grp[open] .sv-tr')].map(x => x.querySelector('button.sv-hide')?.dataset.c), board: document.querySelectorAll('#view .board .row').length,
    gone: document.querySelector('#view details.sv-gone summary')?.textContent ?? null, mem: (() => { try { return localStorage.getItem('atlas:surge-hide'); } catch { return 'X'; } })(), live: document.querySelector('#view p.sr[aria-live]')?.textContent ?? '',
    t: document.querySelector('#view').innerText, sw: document.documentElement.scrollWidth, cw: innerWidth}));
  { const {ctx, p, errs} = await withCal(K2); await p.goto(base + '/atlas/#/surge', {waitUntil: 'networkidle'}); await p.waitForSelector('#view .sv-tr'); await p.waitForTimeout(150);
    const a0 = await st(p), c = a0.rows[0]; screens++; numbers += 9;
    if (!c) fail('관심 없음', '따라가기 줄이 없음(다음 장날 하루를 붙인 사본)');
    else {
      const h0 = await p.evaluate(cc => Math.round(document.querySelector(`#view .sv-tr[data-c="${cc}"]`).getBoundingClientRect().height), c);
      await p.click(`#view button.sv-hide[data-c="${c}"]`); await p.waitForTimeout(120); const a1 = await st(p);
      if (a1.rows.length !== a0.rows.length - 1 || a1.rows.includes(c)) fail('관심 없음', `누른 뒤 줄 ${a0.rows.length} → ${a1.rows.length}(한 줄만 빠져야 함)`);
      if (a1.gone !== '숨긴 곳 1곳 보기') fail('관심 없음', `숨긴 곳 줄 「${a1.gone}」`);
      // 그 자리 「숨겼어요 · 되돌리기」 — 높이 그대로(아래 줄이 손가락 밑으로 올라오지 않음 · 새 눈 점검 2) · 되돌리기 → 그 자리에 다시
      const ph = await p.evaluate(cc => { const x = document.querySelector(`#view .sv-ph[data-c="${cc}"]`); return x ? {h: Math.round(x.getBoundingClientRect().height), t: x.innerText, undo: !!x.querySelector('button.sv-undo'), focus: document.activeElement?.classList?.contains('sv-undo') ?? false} : null; }, c);
      if (!ph || !ph.undo || Math.abs(ph.h - h0) > 2 || !/숨겼어요/.test(ph.t) || !ph.focus) fail('관심 없음', `그 자리 되돌리기 ${JSON.stringify(ph)} · 줄 높이 ${h0}`);
      await p.click(`#view .sv-ph[data-c="${c}"] button.sv-undo`); await p.waitForTimeout(120); const a1b = await st(p);
      if (!a1b.rows.includes(c) || a1b.rows.length !== a0.rows.length || a1b.mem !== '[]' || a1b.gone !== null) fail('관심 없음', `되돌리기 뒤 ${a1b.rows.length} · ${a1b.mem} · ${a1b.gone}`);
      await p.click(`#view button.sv-hide[data-c="${c}"]`); await p.waitForTimeout(120);
      if (a1.mem !== JSON.stringify([c])) fail('관심 없음', `이 기계 기억 ${a1.mem} ≠ [${c}]`);
      if (a1.board !== a0.board) fail('관심 없음', `다섯 칸 줄이 바뀜 ${a0.board} → ${a1.board}`);
      if (!/숨겼어요/.test(a1.live)) fail('관심 없음', '화면 읽기 알림 없음');
      await p.reload({waitUntil: 'networkidle'}); await p.waitForSelector('#view .sv-tr'); await p.waitForTimeout(150); const a2 = await st(p);
      if (a2.rows.includes(c) || a2.gone !== '숨긴 곳 1곳 보기') fail('관심 없음', '다시 열면 숨긴 곳이 돌아옴(기억 안 됨)');
      await p.evaluate(() => { document.querySelector('#view details.sv-gone').open = true; }); await p.click(`#view button.sv-show[data-c="${c}"]`); await p.waitForTimeout(120); const a3 = await st(p);
      if (!a3.rows.includes(c) || a3.gone !== null || a3.mem !== '[]') fail('관심 없음', `다시 보기 뒤 ${a3.rows.includes(c)} · ${a3.gone} · ${a3.mem}`);
    }
    // ② 달력 — 처음 고른 날을 누르면 그날 판만 · 고른 날 = 붙인 날
    const cal0 = await p.evaluate(() => [...document.querySelectorAll('#view .sv-wk button.sv-cell')].filter(b => b.getAttribute('aria-pressed') === 'true').map(b => b.dataset.d).join());
    if (cal0 !== d2) fail('달력 누름', `처음 고른 날 ${cal0} ≠ ${d2}`);
    await p.click(`#view .sv-wk button.sv-cell[data-d="${surgecal.asOf}"]`); await p.waitForTimeout(80);
    const cal1 = await p.evaluate(() => ({on: [...document.querySelectorAll('#view .sv-wk button.sv-cell')].filter(b => b.getAttribute('aria-pressed') === 'true').map(b => b.dataset.d), shown: [...document.querySelectorAll('#view .sv-day')].filter(x => !x.hidden).map(x => x.dataset.d)}));
    if (cal1.on.join() !== surgecal.asOf || cal1.shown.join() !== surgecal.asOf) fail('달력 누름', `누른 날 ${surgecal.asOf} · 켜짐 ${cal1.on} · 보인 판 ${cal1.shown}`);
    const bad = ['NaN', 'undefined', 'null', 'Invalid'].filter(w => a0.t.includes(w)); if (bad.length) fail('관심 없음', '글에 ' + bad.join(' · '));
    if (a0.sw > a0.cw) fail('관심 없음', `옆으로 넘침 ${a0.sw} > ${a0.cw}`);
    // 「며칠 뒤 ↓」 — 맨 밑 따라가기 제목이 화면 위쪽으로 · 회사를 보고 뒤로 오면 그 자리 · 고른 날 · 펼친 묶음 그대로(새 눈 점검 3)
    await p.evaluate(() => window.scrollTo(0, 0)); await p.click('#view button.sv-go'); await p.waitForTimeout(500);
    const jt = await p.evaluate(() => Math.round(document.getElementById('svTrkH').getBoundingClientRect().top)); numbers += 2;
    if (!(jt >= 0 && jt <= 200)) fail('며칠 뒤 ↓', `누른 뒤 따라가기 제목 자리 ${jt}px`);
    const sel0 = await p.evaluate(() => [...document.querySelectorAll('#view .sv-wk button.sv-cell')].filter(b => b.getAttribute('aria-pressed') === 'true').map(b => b.dataset.d).join());
    const lk = await p.evaluate(() => { const a = document.querySelector('#view details.sv-grp[open] .sv-tr a.nm'); a.scrollIntoView({block: 'center'}); return {href: a.getAttribute('href'), y: Math.round(window.scrollY)}; });
    await p.click(`#view details.sv-grp[open] .sv-tr a.nm[href="${lk.href}"]`); await p.waitForTimeout(700); await p.goBack(); await p.waitForSelector('#view .sv-wk'); await p.waitForTimeout(500);
    const bk = await p.evaluate(() => ({hash: location.hash, y: Math.round(window.scrollY), sel: [...document.querySelectorAll('#view .sv-wk button.sv-cell')].filter(b => b.getAttribute('aria-pressed') === 'true').map(b => b.dataset.d).join()}));
    if (bk.hash !== '#/surge' || Math.abs(bk.y - lk.y) > 80 || bk.sel !== sel0) fail('뒤로 오면 그 자리', `${bk.hash} · 자리 ${bk.y} ≠ ${lk.y} · 고른 날 ${bk.sel} ≠ ${sel0}`);
    // ③ 옮김 — 10%대 달력은 뺌 · 20%대 달력은 든 · 그날 판에 「옮겨 간 곳」 「옮겨 온 곳」
    for (const [r, word, lab] of [['#/surge/10', '뺌 1', '옮겨 간 곳 1곳'], ['#/surge/20', '든 1', '옮겨 온 곳 1곳']]) {
      await p.goto(base + '/atlas/' + r, {waitUntil: 'networkidle'}); await p.waitForSelector('#view .sv-wk'); await p.waitForTimeout(120);
      const m = await p.evaluate(d => ({cell: document.querySelector(`#view .sv-wk button.sv-cell[data-d="${d}"]`)?.innerText.replace(/\s+/g, ' ') ?? '', panel: [...document.querySelectorAll('#view .sv-day')].find(x => x.dataset.d === d)?.innerText.replace(/\s+/g, ' ') ?? ''}), d2);
      screens++; numbers += 2;
      if (!m.cell.includes(word)) fail('옮김 달력', `${r} ${d2} 칸 「${m.cell}」에 「${word}」 없음`);
      if (!m.panel.includes(lab) || !m.panel.includes(mv.n)) fail('옮김 달력', `${r} ${d2} 판에 「${lab}」 ${mv.n} 없음`);
    }
    if (errs.length) fail('관심 없음', '오류 ' + errs[0]);
    await ctx.close(); }
  // ④ 기억 못 하는 기계 — 이 화면 동안만 숨김 · 알림 · 오류 0
  { const {ctx, p, errs} = await withCal(K2, () => { const no = () => { throw new Error('막힘'); }; try { Object.defineProperty(window, 'localStorage', {get: no}); } catch {} });
    await p.goto(base + '/atlas/#/surge', {waitUntil: 'networkidle'}); await p.waitForSelector('#view .sv-tr'); await p.waitForTimeout(120);
    const a0 = await st(p), c = a0.rows[0]; screens++; numbers += 2;
    if (c) { await p.click(`#view button.sv-hide[data-c="${c}"]`); await p.waitForTimeout(120); const a1 = await st(p);
      if (a1.rows.includes(c) || !/기억을 못 해/.test(a1.live)) fail('기억 못 하는 기계', `숨김 ${!a1.rows.includes(c)} · 알림 「${a1.live}」`); }
    if (errs.length) fail('기억 못 하는 기계', '오류 ' + errs[0]);
    await ctx.close(); }
  // ⑤ 달력 자료를 못 받음 — 목록은 그대로 · 달력 · 따라가기만 「?」
  for (const r of ['#/surge', '#/surge/30']) { const {ctx, p, errs} = await withCal(404); await p.goto(base + '/atlas/' + r, {waitUntil: 'networkidle'}); await p.waitForSelector('#view h1'); await p.waitForTimeout(120);
    const t = await p.evaluate(() => document.querySelector('#view').innerText.replace(/\u2060/g, '')); screens++; numbers += 3;
    if (!t.includes('? 달력 자료를 못 받았어요.') || !t.includes('? 따라간 기록을 못 받았어요.')) fail('달력 못 받음', `${r} 「?」 줄 없음`);
    if (!t.includes(r === '#/surge' ? `급등 ${surge.n}곳` : `30%대 ${surge.bands.b30.n}곳`)) fail('달력 못 받음', `${r} 목록 머리가 없음`);
    if (errs.length) fail('달력 못 받음', '오류 ' + errs[0]);
    await ctx.close(); }
}
// (옛) 첫 화면 경주(움직임 켬) 검사는 2026-10-15 먹빛 첫 화면으로 지움 — 요즘 오르는 업종 줄은 위 먹빛 판정(차례 · 값 · 선 색 · 고리 · 금빛)이 봄 · 갈래 · 업종 화면 경주는 화면마다 판정
await b.close();
// 3번 누르면 회사 — 첫 화면에서 화면 안 링크로만 가장 짧은 누름 수(390 · 보통 글씨에서 모은 링크)
const depth = new Map([['#/', 0]]), q = ['#/'];
while (q.length) { const r = q.shift(); for (const l of links.get(r) ?? []) { const n = l === '#/' ? '#/' : l; if (!depth.has(n)) { depth.set(n, depth.get(r) + 1); if (links.has(n)) q.push(n); } } }
let far = 0; for (const c of Object.keys(comp)) { const d = depth.get('#/c/' + c); if (d == null || d > 3) { far++; fail('3번 누름', `${comp[c].name} ${d ?? '닿지 않음'}`); }
  for (const [sub, n, nm] of [['past', 4, '4단 지나온 길'], ['rivals', 5, '5단 누구와 다투나'], ['grow', 6, '6단 앞으로 클까?'], ['range', 7, '7단 범위 · 확인']]) { const dn = depth.get(`#/c/${c}/${sub}`); if (dn == null || dn > n) fail(nm, `${comp[c].name} ${dn ?? '닿지 않음'}`); } }
const max7 = Math.max(...Object.keys(comp).map(c => depth.get(`#/c/${c}/range`) ?? 99));
// 모든 회사(2026-10-14 「나」) — 회사마다 3번이면 닿음(고른 곳 = 3단 회사 #/c/ · 나머지 = 밖 칸 #/x/)
//   모든 회사 7단(17:25 「전부다 나오게 해」)이면 모든 회사가 3단 회사 #/c/ · n단은 n번 안(4 지나온 길 … 7 범위 · 확인)
let farAll = 0, maxAll = 0, far7 = 0, max7All = 0; if (MKT) for (const [c, m] of Object.entries(MKT)) { const d = depth.get((CO7 || m.p ? '#/c/' : '#/x/') + c); maxAll = Math.max(maxAll, d ?? 99); if (d == null || d > 3) { farAll++; if (farAll <= 20) fail('3번 누름(모든 회사)', `${m.n} ${d ?? '닿지 않음'}`); }
  if (CO7 && !m.p) for (const [sub, n, nm] of [['past', 4, '4단 지나온 길'], ['rivals', 5, '5단 누구와 다투나'], ['grow', 6, '6단 앞으로 클까?'], ['range', 7, '7단 범위 · 확인']]) { const dn = depth.get(`#/c/${c}/${sub}`); if (sub === 'range') max7All = Math.max(max7All, dn ?? 99); if (dn == null || dn > n) { far7++; if (far7 <= 20) fail(nm + '(고른 곳 밖)', `${m.n} ${dn ?? '닿지 않음'}`); } } }
const res = {schema: 'atlas-new-check-1', made: new Date().toISOString(), base, plans: plans.map(([w, h, f]) => `${w}×${h}${f ? ' 글씨' + (f + 1) : ''}`), routes: routes.length, screens, numbers, click3: {companies: Object.keys(comp).length, over3: far, max: Math.max(...Object.keys(comp).map(c => depth.get('#/c/' + c) ?? 99)), ...(MKT ? {all: Object.keys(MKT).length, over3All: farAll, maxAll} : {})}, others: {co7: CO7, companies: OTH.length, routes: OROUTES.length, full: CO7 && OLIM == null && !OSEL && !arg('--only') && OROUTES.length === OTH.length * 5, overStep: far7, deepest: CO7 ? max7All : null}, click7: {deepest: max7, steps: ['갈래', '업종', '회사', '지나온 길', '누구와 다투나', '앞으로 클까?', '범위 · 확인']}, friends: {shown: moTotal, kinds: 11}, fails: fails.length, kinds: Object.entries(fails.reduce((m, f) => { const k = f.what.replace(/[\d.]+px/g, 'n').replace(/:.*$/, '').slice(0, 30); m[k] = (m[k] ?? 0) + 1; return m; }, {})), all: fails};
fs.mkdirSync(path.dirname(out), {recursive: true}); fs.writeFileSync(out, JSON.stringify(res, null, 1) + '\n');
if (arg('--links')) fs.writeFileSync(path.resolve(arg('--links')), JSON.stringify(Object.fromEntries(links)) + '\n'); // 길 지도(390 · 보통 글씨에서 화면마다 누를 수 있는 길) — 1억 번 눌러 보기(click_walk.mjs)가 읽음
console.log(JSON.stringify({screens, numbers, fails: fails.length, click3: res.click3, first: fails.slice(0, 8)}));
process.exit(fails.length ? 1 : 0);
