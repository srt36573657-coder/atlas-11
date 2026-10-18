// 고도리 매매일지(「친구야, 왜 사?」) 맞대기 — 사장님 2026-10-17(싱가포르) 21:10 「하나로 묶은 명령문」 [3] 1 · 3 ~ 7 · 9 · [6] 1 · 앞 판 17:54 「한 장 명령문」 명령 2 ~ 6 · 13
//   + 2026-10-18 「72개와 카톡 두 번 가입」(order-0015.txt) [5] 1 ~ 9 · [9] 8 · [2] 7 · [10](글씨 · 간격) — 잣대 docs/design/godori-2026-10-18/accept/S1c.md(일꾼 S1c)
//   쓰는 법: node scripts/atlas11/next/check_why.mjs --base http://127.0.0.1:8826 [--pw /opt/node-tools/] [--path /next/?dev=1] [--out 결과.json] [--all | --quick] [--ws <켜 둔 브라우저 주소>]
//     --all = 길 열하나를 모든 판에서 · 기본 = 첫 판은 열한 길 · 나머지 판은 다섯 길(종목 고르기 · 망가진 줄 · 첫 화면 칸까지)
//     --quick = 가장 작은 범위(고칠 때 · 일꾼 끝 검사): 2026-10-18 잣대 판만 — 첫 판 다섯 길(쉬어 가자 두 길 포함) · 한 달 뒤 판 · whyCard 판 · 기억 못 하는 기계 한 판 · 걸린 때
//   기준 = 사장님 글 — 질문 · 답 · 색 · 격언 · 점수 · 묶음 · 판정은 brief.md 코드 칸 · 매매일지는 order-2110.txt [3] · 2026-10-18 바뀐 것은 order-0015.txt [5] · [9] 8 · [2] 7(글자 그대로 있는지 먼저 봄)
//          화면 모듈(site/next/p-why.js)의 셈은 쓰지 않음 — 점수 · 준비 · 판정 · 팔 선 기본값 · 한 달 뒤 값(시작 날 · 스무 번째 장 날 · 종가 · 코스피 · 모든 회사 가운데 값)은 이 검사가 따로 셈
//          (가운데 값은 회사 파일 2,5xx개를 모두 받아 다시 셈 → /next/data/median20.json 과 맞댐) · 이름 = rename.mjs(brand.js 한 곳) · 쓰지 않을 말 = site/next/words.js screenHits
//   ⓪ 종목 고르기 — 찾기(#/find)와 같은 잣대(같은 말로 찾은 종목 차례 = 찾기 화면 앞 여섯) · 엔터 = 맨 위 회사 주식 · 최근 본 회사 · 못 찾음 글 · #/why/<번호> 처음부터 고름 ·
//      회사 화면 「이 회사로 왜 사?」 → #/why/<번호> · 없는 번호 · 틀린 번호 · 펀드 · 우선주 …는 누르지 않고 까닭 한 줄
//   ① 질문 화면 — 한 화면에 하나 · 사장님 차례 · 글자 그대로 · [5] 1 고르기 전 답 점은 빈 테두리(칠한 색 0 · 읽어 주는 글 0) · 고른 답(뒤로 왔을 때)만 색 + 읽어 주는 글
//      [5] 3 답 한 번 = 다음 질문(「다음 ›」은 3번 날짜 칸에만) · 앞 답의 한마디 + 격언 = 다음 장 맨 위(머리 바로 밑) · 색 = 고른 답 색 · [5] 4 뒤로 = 「‹ 앞 질문」(「‹ 앞으로」 0)
//      [5] 3 누른 뒤 다음 질문의 답 셋이 위 막대와 아래 단추 줄 사이에 다 보임(360 × 640)
//   ② 3번 「클 일이 있다」 — 같은 장에 한마디 + 날짜 칸(바로 씀) · 날짜 없이 다음 → 막고 알림 · 지난 날 → 막고 알림 · 날짜를 넣어야 다음 · 다른 답으로 바꾸면 기록에 날짜 없음
//   ③ 두 줄 — 맨 위 = 11번 답 한마디 · ① 칸에 바로 씀 · 빠른 말 · 빈 칸 막음 · ② 팔 선 기본값 = 그날 값 × 0.9 · × 1.2(원 아래 버림) · 고치면 고친 값 · 앞 숫자 ≥ 뒤 숫자 막음 · 엔터 = 결과
//   ④ 결과 — [5] 2 판정 글 = 화면 글 가운데 가장 큰 글씨(px 1등) · 「준비 n / 22」는 판정 밑 · 더 작음 · [5] 5 n = 22 − 점수 · 막대 = 준비 ÷ 최대(그린 길이까지)
//      [5] 6 4번 「거의 다·빌린 돈」 · 9번 「곧」 = 점수와 상관없이 「오늘은 쉬어 가자」 + 까닭 한 줄 · 빨강 수 · 두 줄 요약 · 기록 알림 · 다시 하기
//      [2] 7 결과가 처음 보인 뒤 NX.kakao.offer('journal') 한 번(다시 하기 · 목록 다시 그림 · 다른 화면 갔다 옴 · 두 번째로 끝냄에도 더 안 부름) · NX.kakao 가 없거나 offer 가 없어도 화면 오류 0
//      [5] 7 todayResult() = {at, code, verdict: go · wait · rest, ready, of: 22}(오늘 서울 날짜 가장 새 기록) · 오늘 기록 없으면 null · doneOnce() 그대로
//   ⑤ 기록 — 끝낼 때 한 번 · 꼴 그대로 · 목록 「준비 n / 22」(옛 기록도 보일 때만 바꿈 · 저장 값 그대로) · 지우는 단추 없음
//      [5] 8 한 달(장 스무 번) 지난 기록 = 「그날 정한 대로 했어?」 + 단추 둘(했어 · 안 했어) 먼저 · 값 0 → 누르면 값 · 답은 그 기록에 kept 로 남음(기록 수 그대로 · 다시 열어도 값)
//      [5] 9 값 = 시작 날 종가 → 스무 번째 장 날 종가(날짜 박음) · 같은 때 코스피 · 같은 때 모든 회사 가운데 값 · 못 찾으면 「?」(회사 파일 · 지수 줄 · 가운데 값 파일 못 받음)
//   ⑥ whyCard(G, {code, onDone}) — 처음부터 고른 종목 · 결과를 그린 뒤 onDone 한 번 · 매매일지 고리 · meRecords() · doneOnce() · todayResult()
//   ⑦ 기억 못 하는 기계(localStorage 막힘 · 쓰기만 막힘) · 고도리 칸 자료 못 받음 · 망가진 줄 · 첫 화면 칸(있을 때만) — 끝까지 되고 화면 오류 0
//   ⑧ 모양 — 옆으로 넘침 0 · 칸 밖 0 · 누르는 자리 44px 넘게 · 글 17px 넘게 · [10] 한 화면 글씨 크기 여섯 가지까지 · [10] 7 매매일지 화면 글 시작 왼쪽 줄 셋까지(measure_type 잣대) · 캔버스 0 · 쓰지 않을 말 0 · 옛 이름 0
//      [9] 8 칠한 색 점마다 읽어 주는 글(좋음 · 주의 · 위험) · 누르는 모양(손가락 커서)은 모두 button · a · 입력 칸 · [10] p-why.css 글씨 크기 = var(--fs-n) 만 · 간격 = 0 · var(--sp-n) 만
//   ⑨ 걸린 때 · 누름 — 종목 이름 → 엔터 → 열한 질문 → 빠른 말 → 결과 · 첫 질문에서 「마지막 두 줄」까지 누름 수(전: 답 + 다음 = 22)
//   실패가 하나라도 있으면 끝 코드 1(결과 파일은 --out 을 줄 때만)
import fs from 'node:fs/promises';
import path from 'node:path';
import {createRequire} from 'node:module';
import {fileURLToPath} from 'node:url';
import {NEW_NAME, SAFE_LINE, TITLE_TAIL, OLD_NAME_RE} from './rename.mjs'; // 이름 = site/next/brand.js 한 곳(규칙 76) — 글자를 박지 않음
import {screenHits} from '../../../site/next/words.js'; // 쓰지 않을 말 — 화면 글 셈(「사라지다」 같은 보통 말은 빼고 봄)
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');
const argv = process.argv.slice(2);
const arg = (k, d) => { const i = argv.indexOf(k); return i >= 0 && argv[i + 1] != null && !argv[i + 1].startsWith('--') ? argv[i + 1] : d; };
const require = createRequire(String(arg('--pw', process.env.PW_DIR || '/opt/node-tools/')).replace(/\/?$/, '/')); // run_all.mjs 는 PW_DIR 로도 넘김
const {chromium} = require('playwright');
const base = arg('--base', 'http://127.0.0.1:8826').replace(/\/$/, ''), NEXT = arg('--path', '/next/?dev=1'), OUT = arg('--out', null), ALL = argv.includes('--all'), QUICK = !ALL && argv.includes('--quick');
const fails = [], counts = {}, t0 = Date.now(), timing = {}, accept = {};
const fail = (k, x) => { counts.fail = (counts.fail || 0) + 1; if (fails.length < 500) fails.push([k, String(x).slice(0, 400)]); };
const bump = (k, n = 1) => { counts[k] = (counts[k] || 0) + n; };
const eq = (a, b) => JSON.stringify(a) === JSON.stringify(b);

/* 기준 ① — 사장님 명령 원문(brief.md 코드 칸)의 질문 · 답 · 색 · 격언 */
const BRIEF = await fs.readFile(path.join(ROOT, 'docs/design/godori-2026-10-17/brief.md'), 'utf8').catch(() => '');
const COLOR = {'🟢': 'g', '🟡': 'y', '🔴': 'r'};
const QS = [];
for (const line of ((BRIEF.split('[질문 열한 개')[1] ?? '').split('[명령]')[0] ?? '').split('\n')) {
  const m = /^(\d{1,2}) (.+?\?) (.+?) -(.+)$/u.exec(line.trim()); if (!m) continue;
  QS.push({n: +m[1], q: m[2], a: [...m[3].matchAll(/([🟢🟡🔴])([^🟢🟡🔴]+)/gu)].map(x => [COLOR[x[1]], x[2].trim()]), say: m[4].trim()});
}
if (QS.length !== 11 || QS.some((Q, i) => Q.n !== i + 1 || Q.a.length !== 3)) { console.error('사장님 명령 원문(질문 열한 개)을 brief.md 에서 못 읽음', QS.length); process.exit(1); }
for (const t of ['색: 🟢0점 🟡1점 🔴2점', '묶음: 이유1~3 · 돈4,9,11 · 때5~6 · 마음7,8,10', '판정: 0~5 「좋아, 정해 둔 대로만」 6~11 「반만 준비됐어」 12 이상·🔴넷 이상 「오늘은 쉬어 가자」'])
  if (!BRIEF.includes(t)) fail('기준 글이 바뀜(brief.md — 이 검사의 셈을 고칠 것)', t);
/* 기준 ② — 매매일지 [3](order-2110.txt · 줄바꿈 · 빈칸을 하나로 보고 맞댐) — 바뀌면 이 검사의 셈도 고쳐야 함 */
const ORDER = (await fs.readFile(path.join(ROOT, 'docs/design/godori-2026-10-17/order-2110.txt'), 'utf8').catch(() => '')).replace(/\s+/g, ' ');
if (!ORDER.trim()) fail('기준 파일을 못 읽음', 'docs/design/godori-2026-10-17/order-2110.txt(사장님 원문) — 저장소에 함께 올릴 것');
else for (const t of ['왜 사? 맨 앞에 종목 고르기를 둬라. 찾기와 같은 잣대를 써라.', '3번 답이 「클 일이 있다」면 그 일이 언제인지 날짜를 받아라.', '① 1년 뒤 반토막 났다면 왜?', '② 만약 ~이면 ~한다 (팔 약속)',
  '팔 약속 기본값: 산 값 × 0.9, 절반 × 1.2 (gdr.json과 같게)', '기록마다 종목, 날짜, 그날 값, 두 줄을 쌓아라. 지우는 단추는 두지 마라', '왜 사? 기록은 매매일지 화면 아래로 옮겨라.', '전체가 1분 안에 끝나게 하라.'])
  if (!ORDER.includes(t)) fail('기준 글이 바뀜(order-2110.txt [3] — 이 검사의 셈을 고칠 것)', t);
/* 기준 ③ — 2026-10-18 명령문 0015 [5] 매매일지 문 · [9] 8 · [2] 7(바뀌면 이 검사의 셈도 고칠 것) */
const ORDER3 = (await fs.readFile(path.join(ROOT, 'docs/design/godori-2026-10-18/order-0015.txt'), 'utf8').catch(() => '')).replace(/\s+/g, ' ');
if (!ORDER3.trim()) fail('기준 파일을 못 읽음', 'docs/design/godori-2026-10-18/order-0015.txt(사장님 원문)');
else for (const t of ['1. 고르기 전에는 답 색을 숨겨라. 고른 뒤에만 색과 한마디를 보여라.', '2. 결과 화면은 판정 글을 가장 크게 둬라. 점수는 그 밑에 작게. 답 차례는 사장님 글 그대로 둔다.',
  '3. 답을 누르면 바로 다음 질문으로 넘겨라. 앞 답의 한마디는 다음 장 맨 위에 둬라. 누름 22번 → 11번.', '4. 뒤로 가는 단추 글은 「‹ 앞 질문」 으로 바꿔라.',
  '5. 점수는 높을수록 좋게 뒤집어라. 「준비 n / 22」. 막대도 준비된 만큼 차게 하라.', '6. 4번 「거의 다 · 빌린 돈」이나 9번 「곧」을 고르면 점수와 상관없이 「오늘은 쉬어 가자」로 정하라.',
  '8. 한 달 뒤에는 「그날 정한 대로 했어?」부터 물어라. 값은 그 뒤에.', '9. 한 달 뒤 값은 기록한 날 종가와 20거래일 뒤 종가를 날짜로 박아 셈하라. 같은 때 코스피와 모든 회사 가운데 값을 함께. 못 찾으면 「?」.',
  '7. 가입 권유는 매매일지를 끝낸 순간에 한 번만 띄워라.', '점수 점마다 「위험」 같은 글을 붙여라.'])
  if (!ORDER3.includes(t)) fail('기준 글이 바뀜(order-0015.txt [5] · [9] 8 · [2] 7 — 이 검사의 셈을 고칠 것)', t);
const PTS = {g: 0, y: 1, r: 2}, MAX = QS.length * 2;
const GROUPS = [['이유', [1, 2, 3]], ['돈', [4, 9, 11]], ['때', [5, 6]], ['마음', [7, 8, 10]]];
const V_OK = '좋아, 정해 둔 대로만', V_HALF = '반만 준비됐어', V_REST = '오늘은 쉬어 가자', V_CODE = {[V_OK]: 'go', [V_HALF]: 'wait', [V_REST]: 'rest'};
const TONE = {g: '좋음', y: '주의', r: '위험'}; // [9] 8 색 점의 읽어 주는 글(사장님 예 「위험」 · 잣대 accept/S1c.md)
const BIG_Q = 2, BIG_A = QS[BIG_Q].a.findIndex(a => a[1] === '클 일이 있다');
if (BIG_A < 0) { console.error('3번 답에 「클 일이 있다」가 없음(brief.md)'); process.exit(1); }
/** [5] 6 쉬어 가는 답 — 4번 「거의 다·빌린 돈」 · 9번 「곧」(답 글은 brief.md 원문 · 명령문은 「거의 다 · 빌린 돈」으로 띄어 씀) */
const REST_AT = [[3, '거의 다·빌린 돈'], [8, '곧']].map(([q, t]) => [q, QS[q].a.findIndex(a => a[1] === t)]);
if (REST_AT.some(([, k]) => k < 0)) { console.error('4번 「거의 다·빌린 돈」 · 9번 「곧」 답을 brief.md 에서 못 찾음'); process.exit(1); }
/** 답 자리(0 ~ 2) 열한 개 → 점수 · 준비 · 빨강 수 · 묶음 · 판정(원문 명령 5 · 6 + 0015 [5] 5 · 6) */
function judge(ks) {
  const p = ks.map((k, i) => PTS[QS[i].a[k][0]]), score = p.reduce((s, x) => s + x, 0), reds = p.filter(x => x === 2).length, stop = REST_AT.some(([q, k]) => ks[q] === k);
  const groups = Object.fromEntries(GROUPS.map(([n, qs]) => [n, qs.reduce((s, q) => s + p[q - 1], 0)]));
  return {score, ready: MAX - score, reds, groups, stop, verdict: stop || score >= 12 || reds >= 4 ? V_REST : score >= 6 ? V_HALF : V_OK};
}
/** 팔 약속 기본값([3] 5 · 원 아래 버림) · 약속 글(「만약 ~이면 ~한다」 꼴) */
const SELL = p => Math.floor(p * 9 / 10), HALF = p => Math.floor(p * 12 / 10);
const won = n => Math.floor(n).toLocaleString('ko-KR') + '원';
const promiseTxt = (s, h) => `만약 ${won(s)} 아래로 가면 다 판다. 만약 ${won(h)} 위로 가면 절반 판다.`;
const idxOf = (qi, c) => { const want = c === 'R' ? 'r' : c, hit = QS[qi].a.map((a, k) => (a[0] === want ? k : -1)).filter(k => k >= 0), k = c === 'R' ? hit[1] : hit[0]; if (k == null) throw Error(`길 틀림: ${qi + 1}번 질문에 ${c} 답이 없음`); return k; };
// 길 열하나 — [이름, 색 열한 글자, 기대 점수, 기대 판정, 할 일] · pick = 종목 고르는 법(enter · click · recent) · why = 두 줄 쓰는 법(enter · chip · edit · check) · date = 'bad'(날짜 없이 · 지난 날 먼저)
//   big3 = 'switch'(3번을 「클 일」 + 날짜로 골랐다가 바꿈) · back = 뒤로 단추 시험(2번을 이 답으로 먼저 고름) · stock = 'cx'(그날 값 파일을 못 받는 회사)
const PATHS = [
  ['모두 초록', 'ggggggggggg', 0, V_OK, {pick: 'enter', why: 'chip'}],
  ['빨강 넷 · 합 12 밑', 'rrrrggggggg', 8, V_REST, {pick: 'recent', why: 'enter'}],
  ['노랑 여섯 · 합 6', 'yyyyyyggggg', 6, V_HALF, {pick: 'enter', why: 'check', date: 'bad', stock: 'cx'}],
  ['빨강 셋 · 합 6', 'ggggrgrggRg', 6, V_HALF, {pick: 'click', why: 'edit'}],
  ['합 5', 'gygygygyygg', 5, V_OK, {pick: 'click', why: 'enter'}],
  ['9번 곧 · 빨강 셋 노랑 다섯 · 합 11', 'yyryyyggrRg', 11, V_REST, {pick: 'click', why: 'chip'}],
  ['빨강 셋 노랑 여섯 · 합 12', 'ryyyyryyggr', 12, V_REST, {pick: 'click', why: 'edit'}],
  ['섞음 · 뒤로 단추', 'rygyrgyrgRy', 12, V_REST, {pick: 'enter', back: 'g', big3: 'switch', why: 'chip'}],
  ['모두 빨강', 'rrrrrrrrrrr', 22, V_REST, {pick: 'enter', why: 'enter'}],
  ['쉬어 가자 4번 · 합 2', 'gggrggggggg', 2, V_REST, {pick: 'enter', why: 'chip'}],
  ['쉬어 가자 9번 · 합 2', 'ggggggggrgg', 2, V_REST, {pick: 'click', why: 'enter'}],
].map(([name, spec, score, verdict, o]) => ({name, spec, ks: [...spec].map((c, i) => idxOf(i, c)), score, verdict, ...(o || {})}));
for (const P of PATHS) { const J = judge(P.ks); if (J.score !== P.score || J.verdict !== P.verdict) { console.error('길 자체가 틀림', P.name, J); process.exit(1); } }
for (const n of ['쉬어 가자 4번 · 합 2', '쉬어 가자 9번 · 합 2']) { const J = judge(PATHS.find(P => P.name === n).ks); if (!(J.stop && J.score < 6 && J.reds < 4)) { console.error('쉬어 가자 길이 점수로도 쉬어 감 — 길을 바꿀 것', n, J); process.exit(1); } }
const SHORT = ['모두 초록', '섞음 · 뒤로 단추', '모두 빨강', '쉬어 가자 4번 · 합 2', '쉬어 가자 9번 · 합 2'];
if (!PATHS.some(P => P.ks[BIG_Q] === BIG_A)) { console.error('길에 3번 「클 일이 있다」가 없음'); process.exit(1); }

const KEY = 'atlas:godori-why', REC_KEYS = ['answers', 'asOf', 'at', 'bigDay', 'code', 'day', 'groups', 'name', 'picks', 'price', 'promise', 'reds', 'score', 'verdict', 'why'];

/* [10] p-why.css — 글씨 크기는 var(--fs-n) 만 · 간격(margin · padding · gap)은 0 · var(--sp-n) 만 · 음수 0(글자로 셈 — 브라우저 없이) */
{
  const css = (await fs.readFile(path.join(ROOT, 'site/next/p-why.css'), 'utf8').catch(() => '')).replace(/\/\*[\s\S]*?\*\//g, '');
  if (!css.trim()) fail('p-why.css 를 못 읽음', 'site/next/p-why.css');
  const fsBad = [...css.matchAll(/font-size\s*:\s*([^;}]+)/g)].map(m => m[1].trim()).filter(v => !/^var\(--fs-[1-6]\)$/.test(v));
  const spBad = [...css.matchAll(/(?:^|[;{\s])((?:margin|padding)(?:-(?:top|right|bottom|left|inline|block)(?:-(?:start|end))?)?|(?:row-|column-)?gap)\s*:\s*([^;}]+)/g)]
    .filter(m => m[2].trim().split(/\s+/).some(v => !/^(0|var\(--sp-[123]\))$/.test(v))).map(m => `${m[1]}: ${m[2].trim()}`);
  for (const v of fsBad.slice(0, 5)) fail('[10] p-why.css 글씨 크기가 --fs 이름이 아님', v);
  for (const v of spBad.slice(0, 5)) fail('[10] p-why.css 간격이 0 · 8 · 16 · 24(--sp) 가 아님', v);
  accept.css = {fontSizeNotToken: fsBad.length, spacingNotToken: spBad.length};
}

/* 자료(시험 서버에서) — 고도리 칸 · 종목 셋의 그날 값 · 지수 줄 · 날짜 줄 */
const getJ = async f => { const r = await fetch(base + f, {cache: 'no-store'}); if (!r.ok) throw Error(f + ' ' + r.status); return r.json(); };
const LIVE_SITE = !/^https?:\/\/(127\.0\.0\.1|localhost)(:\d+)?$/.test(base); // 실제 사이트 — 한꺼번에 많이 받지 않음(allCo)
const G = await getJ('/next/data/gdr.json').catch(e => { bump(NEW_NAME + ' 칸 자료 못 받음(기록 기대 = 빈 목록)'); console.error(e.message); return null; });
const pickRec = g => (Array.isArray(g?.picks) ? g.picks.map(p => ({code: p.code, name: p.name, price: p.price, w: p.w})) : []);
const recAsOf = g => (Array.isArray(g?.picks) ? g.asOf ?? null : null);
/* [3] 5 「팔 약속 기본값 … gdr.json과 같게」 — gdr-v1 만 맞댐 · gdr-v2(일꾼 G1c · 0015 [9] 1)는 공개 gdr.json 에서 팔 선 · 절반 팔 선을 일부러 뺌(변호사 서면 의견 전까지) → 맞댈 줄이 없어 건너뜀(매매일지 기본값 셈은 아래에서 그대로 봄) */
const GDR_V2 = G?.version === 'gdr-v2' || G?.schema === 'godori-gdr-2';
if (GDR_V2) bump('gdr-v2 — 공개 파일에 팔 선 없음([9] 1) · gdr.json 팔 선 맞대기 건너뜀');
else for (const p of G?.picks ?? []) if (p.sell !== SELL(p.price) || p.half !== HALF(p.price)) fail('gdr.json 팔 선이 매매일지 기본값 셈과 다름([3] 5 「gdr.json과 같게」)', `${p.code} ${p.price} → ${p.sell} · ${p.half}`);
const HOME = await getJ('/atlas/data/home.json').catch(() => null);
const NAMES = await getJ('/atlas/data/names.json').catch(() => null);
const DAYS = await getJ('/atlas/data/days.json').catch(() => null), DD = Array.isArray(DAYS?.dates) ? DAYS.dates : [];
if (DD.length < 60) { console.error('날짜 줄(days.json)을 못 받음 — 한 달 뒤 값 시험을 할 수 없음'); process.exit(1); }
async function stockOf(code) {
  const j = await getJ('/atlas/data/co/' + code + '.json').catch(() => null), c = j?.c;
  if (c && c.price > 0) return {code, name: c.name, price: c.price, day: c.priceDate ?? null, co: true};
  const r = NAMES?.rows?.find(x => x.c === code);
  return r ? {code, name: r.n, price: null, day: null, co: false} : null;
}
const ST = {co1: await stockOf('005930'), co2: await stockOf(G?.picks?.[0]?.code ?? '000660'), x1: await stockOf('005935'), cx: await stockOf('035720')};
for (const [k, v] of Object.entries(ST)) if (!v) { console.error('시험 종목 자료를 못 받음', k); process.exit(1); }
{ const c = NAMES?.rows?.find(r => /[A-Z]/.test(r.c) && !r.k)?.c, s = c ? await stockOf(c) : null; if (s?.co) ST.coL = s; else bump('글자 섞인 번호 회사 없음(그 시험 건너뜀)'); } // 글자 섞인 번호 회사(작은 글자 주소 시험)
if (ST.x1.co || ST.x1.price != null) { console.error('005935 가 회사 주식 파일을 가짐 — 펀드 · 우선주 시험을 바꿀 것'); process.exit(1); }
if (!ST.cx.co || [ST.co1, ST.co2].some(s => s.code === ST.cx.code) || (G?.picks ?? []).some(p => p.code === ST.cx.code)) { console.error('그날 값 못 받는 회사 시험 종목을 바꿀 것', ST.cx.code); process.exit(1); }
ST.x1.w = NAMES?.rows?.find(r => r.c === ST.x1.code)?.w ?? null; // 찾기와 같은 까닭 글
ST.cx = {...ST.cx, price: null, day: null}; // 판 A 에서 이 회사 파일을 못 받게 함 → 「? 그날 값 없음」 · 팔 선은 직접 · 한 달 뒤 회사 값 「?」
const CX_FILE = '/atlas/data/co/' + ST.cx.code + '.json', MED_FILE = '/next/data/median20.json';

/* 날짜 · 글(화면과 같은 꼴 · 보는 기계 시간대 = 서울로 엶) */
const TZ = 'Asia/Seoul';
const isoIn = ms => new Intl.DateTimeFormat('en-CA', {timeZone: TZ, year: 'numeric', month: '2-digit', day: '2-digit'}).format(new Date(ms));
const dayTxt = ms => { const [y, m, d] = isoIn(ms).split('-'); return `${+y}년 ${+m}월 ${+d}일`; };
const ymdTxt = s => `${+s.slice(0, 4)}년 ${+s.slice(5, 7)}월 ${+s.slice(8, 10)}일`;
const mdTxt = s => (typeof s === 'string' && /^\d{4}-\d{2}-\d{2}/.test(s) ? `${+s.slice(5, 7)}월 ${+s.slice(8, 10)}일` : '?');
const FUTURE = isoIn(Date.now() + 40 * 864e5), PAST = isoIn(Date.now() - 864e5); // 3번 날짜 — 40일 뒤 · 어제
function pctTxt(x) { if (x == null || !Number.isFinite(x)) return '?'; const r = Math.floor(Math.abs(x) * 10 + 0.5 + 1e-7) / 10; if (r === 0) return '0.0%'; return (x > 0 ? '+' : '−') + (r >= 100 ? Math.floor(r + 0.5 + 1e-7).toLocaleString('ko-KR') : r.toFixed(1)) + '%'; }
const clsOf = x => (pctTxt(x) === '0.0%' ? 'fl' : x > 0 ? 'up' : 'dn');

/* [5] 9 한 달 뒤 값 — 따로 셈(화면 모듈을 쓰지 않음) · 시작 날 = 기록의 그날 값 날짜(day) · 없으면 고도리 칸 날짜(asOf) · 없으면 기록한 서울 날짜 → 그날이나 그 앞 마지막 장 날 · 끝 날 = 스무 번째 뒤 장 날 */
const LATER = 20;
function winOf(x) {
  const ok = s => typeof s === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(s);
  const t = ok(x.day) ? x.day : ok(x.asOf) ? x.asOf : Number.isFinite(Date.parse(x.at)) ? isoIn(Date.parse(x.at)) : null;
  if (!t || t > DD[DD.length - 1]) return null;
  let k = -1; DD.forEach((d, j) => { if (d <= t) k = j; });
  return k < 0 || k + LATER >= DD.length ? null : {k, s: DD[k], e: DD[k + LATER]};
}
const coCache = new Map();
const coOf = code => { if (!coCache.has(code)) coCache.set(code, getJ('/atlas/data/co/' + code + '.json').catch(() => null)); return coCache.get(code); };
const kospiOf = home => { const K = home?.idx?.KOSPI, m = new Map((Array.isArray(K?.rows) ? K.rows : []).filter(Array.isArray).map(r => [r[0], r[1]])); if (typeof K?.date === 'string' && K.close > 0 && !m.has(K.date)) m.set(K.date, K.close); return m; };
/** 모든 회사 가운데 값 — 회사 파일을 모두 받아 다시 셈(창 여럿을 한 번에) · median20.json 줄과 맞대기용 */
let ALLCO = null;
async function allCo() {
  if (ALLCO) return ALLCO;
  const mkt = await getJ('/atlas/data/mkt.json').catch(() => null), codes = Object.keys(mkt?.companies ?? {}).filter(c => /^[0-9][0-9A-Z]{5}$/.test(c)).sort();
  const out = []; let i = 0, miss = 0;
  // 실제 사이트에서는 4개씩 · 못 받으면 쉬었다 두 번 더(2026-10-18 — 24개씩 2,557개를 한꺼번에 받으면 실제 사이트가 이 기계를 한동안 막아 뒤 판의 쪽 열기가 33초 넘게 멈추고 · 못 받은 회사 때문에 가운데 값이 다르게 셈됨)
  const CONC = LIVE_SITE ? 4 : 24, getCo = async c => { for (let t = 0; t < 3; t++) { const j = await getJ('/atlas/data/co/' + c + '.json').catch(() => null); if (j) return j; await new Promise(r => setTimeout(r, 800 * (t + 1))); } return null; };
  await Promise.all(Array.from({length: CONC}, async () => { while (i < codes.length) { const c = codes[i++], j = await getCo(c); if (Array.isArray(j?.close)) out.push({close: j.close, k0: Number.isInteger(j.k0) ? j.k0 : 0}); else miss++; } }));
  ALLCO = {series: out.filter(s => s.k0 >= 0 && s.k0 + s.close.length <= DD.length), codes: codes.length, miss}; return ALLCO;
}
function medianAt(k, series) {
  const xs = []; for (const {close, k0} of series) { const a = close[k - k0], b = close[k + LATER - k0]; if (a > 0 && b > 0) xs.push((b / a - 1) * 100); }
  if (!xs.length) return null; xs.sort((a, b) => a - b); const m = xs.length >> 1; return {m: xs.length % 2 ? xs[m] : (xs[m - 1] + xs[m]) / 2, n: xs.length};
}
let MEDF = null; const MEDV = new Set(); // 받은 가운데 값 파일 · 따로 셈해 맞댄 시작 날
/** 가운데 값 파일 줄 하나(시작 날 장 자리 k) — 처음 부를 때 파일 꼴 · 뽑은 줄 다섯을 따로 셈과 맞댐 · 부를 때마다 그 줄도 맞댐 */
async function medRow(k) {
  if (!MEDF) {
    const M = await getJ(MED_FILE).catch(() => null);
    MEDF = {M: Array.isArray(M?.rows) ? M : null, byS: new Map(Array.isArray(M?.rows) ? M.rows.filter(Array.isArray).map(r => [r[0], r]) : [])};
    if (!MEDF.M) fail('[5] 9 모든 회사 가운데 값 파일 못 받음', MED_FILE);
    else {
      if (M.days !== LATER || M.rows.some(r => !Array.isArray(r) || DD[DD.indexOf(r[0]) + LATER] !== r[1])) fail('[5] 9 가운데 값 파일 — 시작 날 · 스무 번째 장 날이 날짜 줄과 다름', `${MED_FILE} days ${M.days}`);
      for (const f of [0.1, 0.3, 0.5, 0.7, 0.95]) await medVerify(Math.floor((DD.length - LATER - 1) * f));
    }
  }
  if (MEDF.M) await medVerify(k);
  return MEDF.byS.get(DD[k]) ?? null;
}
async function medVerify(k) {
  if (MEDV.has(k)) return; MEDV.add(k);
  const A = await allCo(), mine = medianAt(k, A.series), row = MEDF.byS.get(DD[k]);
  if (!mine) { if (row) fail('[5] 9 가운데 값 파일에 줄이 있는데 따로 셈은 값 없음', DD[k]); return; }
  if (!row || row[1] !== DD[k + LATER] || Math.abs(row[2] - mine.m) > 0.0051 || row[3] !== mine.n) fail('[5] 9 가운데 값 파일이 따로 셈과 다름(median20.mjs)', `${DD[k]} → ${DD[k + LATER]} 파일 ${JSON.stringify(row)} · 따로 셈 ${mine.m.toFixed(3)} · ${mine.n}곳 · 못 받은 회사 파일 ${A.miss}개`);
  else { bump('[5] 9 가운데 값 따로 셈 맞댄 줄'); accept.median = {coFiles: A.codes, coMissing: A.miss, rowsChecked: MEDV.size, fileRows: MEDF.M.rows.length}; }
}
/** 기록 하나 → 한 달 칸 기대(없으면 null = 아직) · home = 그 화면이 받는 지수 줄 · medOk = 가운데 값 파일을 받는 판 · coOk = 회사 파일을 받는 판(막은 파일 빼고) */
async function laterWant(x, {home, medOk = true, blocked = []} = {}) {
  const W = winOf(x); if (!W) return null;
  const lines = [];
  if (x.code) {
    const j = blocked.some(b => b.endsWith('/co/' + x.code + '.json')) ? null : await coOf(x.code), cl = Array.isArray(j?.close) ? j.close : null, k0 = Number.isInteger(j?.k0) ? j.k0 : 0;
    const A = cl?.[W.k - k0] > 0 ? cl[W.k - k0] : null, B = cl?.[W.k + LATER - k0] > 0 ? cl[W.k + LATER - k0] : null;
    lines.push(`${x.name || x.code} ${mdTxt(W.s)} 종가 ${A ? won(A) : '?'} → ${mdTxt(W.e)} 종가 ${B ? won(B) : '?'} · ${A && B ? pctTxt((B / A - 1) * 100) : '?'}`);
  }
  const km = kospiOf(home), ka = km.get(W.s), kb = km.get(W.e);
  lines.push(`같은 때 코스피 ${ka > 0 && kb > 0 ? pctTxt((kb / ka - 1) * 100) : '?'}`);
  const row = medOk ? await medRow(W.k) : null, mr = row && row[1] === W.e ? row : null;
  lines.push(`같은 때 모든 회사 가운데 값 ${mr ? pctTxt(mr[2]) : '?'}${mr && mr[3] > 0 ? ` · ${mr[3].toLocaleString('ko-KR')}곳` : ''}`);
  return {W, lines, q: lines.join('\n').split('?').length - 1};
}

/* 브라우저 — 한 번에 하나 · 판마다 새 칸(기억이 따로) */
const exe = '/opt/pw-browsers/chromium', WS = arg('--ws', process.env.PW_WS || null); // --ws = 켜 둔 브라우저에 붙음(quick.mjs 의 브라우저 — 이 기계에서 브라우저를 하나만 켬)
const browser = WS ? await chromium.connect(WS, {timeout: 15000}) : await chromium.launch((await fs.stat(exe).catch(() => null)) ? {executablePath: exe} : {});
/** store: 'ok' · 'throw'(localStorage 자체가 막힘) · 'nowrite'(쓰기만 막힘) · gdr404 = 고도리 칸 자료 못 받음 · home = 지수 줄을 바꿔 줌 · allow = 일부러 못 받게 한 파일 · block = 404 로 막을 파일 · kakao = NX.kakao 바꿔치기('stub' 부른 수 셈 · 'off' offer 없음 · null 그대로) */
async function newPage(width, height, {store = 'ok', gdr404 = false, home = null, allow = [], block = [], kakao = 'stub'} = {}) {
  const ctx = await browser.newContext({viewport: {width, height}, deviceScaleFactor: 1, hasTouch: true, locale: 'ko-KR', timezoneId: TZ});
  if (store === 'throw') await ctx.addInitScript(() => { Object.defineProperty(window, 'localStorage', {configurable: true, get() { throw new DOMException('막힘', 'SecurityError'); }}); });
  if (store === 'nowrite') await ctx.addInitScript(() => { Storage.prototype.setItem = function () { throw new DOMException('가득', 'QuotaExceededError'); }; });
  if (gdr404) await ctx.route('**/next/data/gdr.json', r => r.fulfill({status: 404, contentType: 'text/plain', body: 'no'}));
  for (const f of block) await ctx.route('**' + f, r => r.fulfill({status: 404, contentType: 'text/plain', body: 'no'})); // 일부러 못 받게 한 파일(allow 에도 넣음)
  if (home) await ctx.route('**/atlas/data/home.json', r => r.fulfill({status: 200, contentType: 'application/json', body: JSON.stringify(home)}));
  const p = await ctx.newPage(); p._errs = []; p._home = home ?? HOME; p._kakao = kakao; p._block = block;
  p._pend = new Map(); p.on('request', r => p._pend.set(r.url(), Date.now())); p.on('requestfinished', r => p._pend.delete(r.url())); p.on('requestfailed', r => p._pend.delete(r.url())); // 멈춘 때 안 끝난 요청(open 실패 글)
  const allowed = u => allow.some(a => String(u || '').includes(a));
  p.on('pageerror', e => p._errs.push('pageerror ' + e.message));
  p.on('console', m => { if (m.type() !== 'error') return; const u = m.location()?.url; if (/Failed to load resource/.test(m.text()) && allowed(u)) return; p._errs.push(m.text() + (u ? ' @ ' + u : '')); });
  p.on('response', r => { if (r.status() >= 400 && r.url().startsWith(base) && !allowed(r.url())) p._errs.push(r.status() + ' ' + r.url()); });
  return p;
}
const errsOf = (p, tag) => { if (p._errs.length) { fail('화면 오류', tag + ' · ' + p._errs.slice(0, 3).join(' | ')); p._errs.length = 0; } };
/** [2] 7 카톡 권유 — NX.kakao.offer 를 바꿔치기해 부른 수를 셈(일꾼 K2c 의 kakao.js 가 있든 없든) · 'off' = offer 없는 NX.kakao(꺼진 카톡) */
const kakaoStub = p => (p._kakao ? p.evaluate(mode => {
  const NX = globalThis.NX; if (!NX) return;
  window.__offer ??= [];
  const K = NX.kakao && typeof NX.kakao === 'object' ? NX.kakao : {};
  if (mode === 'off') { if (K.__stub !== 'off') { try { NX.kakao = {...K, on: false, offer: undefined, __stub: 'off'}; } catch { /* 바꿀 수 없음 */ } } return; }
  if (typeof K.offer === 'function' && K.offer.__stub) return;
  const f = w => { window.__offer.push(w); }; f.__stub = true;
  try { NX.kakao = {...K, offer: f}; } catch { try { K.offer = f; } catch { /* 바꿀 수 없음 — 부른 수 0 으로 걸림 */ } }
}, p._kakao) : null); // 카톡 모듈이 늦게 와 NX.kakao 를 새로 써도 끝내기 바로 전에 다시 붙임
const offers = p => p.evaluate(() => window.__offer ?? null);
async function open(p, hash, sel) { // 같은 주소면 다시 불러옴(같은 # 로 가면 화면이 안 바뀜 — 기억에 넣은 기록을 다시 읽게)
  const was = p.url(), how = was === base + NEXT + hash ? 'reload' : 'goto';
  try { if (how === 'reload') await p.reload({waitUntil: 'domcontentloaded'}); else await p.goto(base + NEXT + hash, {waitUntil: 'domcontentloaded'}); }
  catch (e) { // 실제 사이트에서만 멈춘 까닭 찾기(2026-10-18) — 멈춘 때 주소 · 문서 상태 · 안 끝난 요청을 실패 글에 붙임(검사 판정은 그대로)
    const st = await Promise.race([p.evaluate(() => [document.readyState, location.href, !!document.querySelector('#view .boot'), document.querySelectorAll('dialog[open]').length]).catch(x => 'eval ' + String(x.message).slice(0, 60)), new Promise(r => setTimeout(() => r('eval 3초 넘음'), 3000))]);
    const pend = [...(p._pend ?? new Map()).entries()].map(([u, t]) => u.replace(base, '') + ' ' + Math.round((Date.now() - t) / 1000) + '초').slice(0, 5);
    throw new Error(`${e.message.split('\n')[0]} · ${how} 앞 ${was.replace(base, '')} → ${hash} · 뒤 ${p.url().replace(base, '')} · 문서 ${JSON.stringify(st)} · 안 끝난 요청 ${JSON.stringify(pend)}`);
  }
  await p.waitForFunction(s => !!document.querySelector(s) && !document.querySelector('#view .boot'), sel, {timeout: 30000});
  await kakaoStub(p);
}
const getRecs = p => p.evaluate(k => { try { return JSON.parse(localStorage.getItem(k) || '[]'); } catch { return null; } }, KEY);
const setRecs = (p, a) => p.evaluate(([k, x]) => localStorage.setItem(k, JSON.stringify(x)), [KEY, a]);
const waitStk = (p, sel) => p.waitForFunction(s => { const e = document.querySelector(s + ' .wy-stk:not([hidden])'); return !!e && !/받는 중/.test(e.textContent); }, sel, {timeout: 20000});
const modCall = (p, fn) => p.evaluate(async f => { const W = await import('/next/p-why.js'); return f === 'done' ? W.doneOnce() : f === 'today' ? W.todayResult() : f === 'me' ? (() => { const e = W.meRecords(); return {h: e.querySelector('h2')?.textContent ?? '', rows: e.querySelectorAll('.wy-rec').length, btn: e.querySelectorAll('button:not(.wy-kb), input, select, textarea, [role="button"]').length}; })() : null; }, fn);

/* 화면에서 읽기(화면 안에서 돎 — 바깥 것을 쓰지 않음) · 색 = 칠한 배경(투명이 아니면 칠함) · sr = 점 안 읽어 주는 글 */
const READQ = sel => {
  const s = document.querySelector(sel); if (!s) return null;
  const tone = e => (/\bwy-([gyr])\b/.exec(typeof e?.className === 'string' ? e.className : '') || [])[1] ?? null;
  const painted = e => { if (!e) return false; const c = getComputedStyle(e).backgroundColor; return !(c === 'transparent' || /^rgba\(.*,\s*0\)$/.test(c)); };
  const dotOf = d => ({c: tone(d), paint: painted(d), ring: !!d?.classList.contains('wy-n'), sr: d?.querySelector('.wy-sr')?.textContent ?? null, hidden: d?.getAttribute('aria-hidden') === 'true'});
  const opts = [...s.querySelectorAll('.wy-opts .wy-opt')].map(b => ({t: b.querySelector('.wy-ot')?.textContent ?? '', ...dotOf(b.querySelector('.wy-dot')), pressed: b.getAttribute('aria-pressed'), on: b.classList.contains('on'), tag: b.tagName}));
  const kids = [...s.children].map(e => (typeof e.className === 'string' && e.className.trim() ? e.className.trim().split(/\s+/)[0] : e.tagName.toLowerCase()));
  const pv = s.querySelector(':scope > .wy-prev'), d = s.querySelector('.wy-date'), a = document.activeElement, one = s.querySelector(':scope > .wy-one');
  const lastOpt = s.querySelector('.wy-opts > :last-child')?.getBoundingClientRect(), bar = document.querySelector('nav.tabs')?.getBoundingClientRect(), top = document.querySelector('header.top')?.getBoundingClientRect();
  return {step: s.querySelector('.wy-step')?.textContent ?? null, q: s.querySelector('.wy-q')?.textContent ?? null, group: s.querySelector('.wy-opts')?.getAttribute('aria-label') ?? null, opts, kids,
    prev: pv ? {one: pv.querySelector('.wy-onet')?.textContent ?? null, ...dotOf(pv.querySelector('.wy-dot')), say: pv.querySelector('.wy-say q[data-proper]')?.textContent ?? null, at: kids.indexOf('wy-prev'), top: pv.getBoundingClientRect().top} : null,
    one: one?.querySelector('.wy-onet')?.textContent ?? null, oneDot: one ? dotOf(one.querySelector('.wy-dot')) : null, sayAny: !!s.querySelector(':scope > .wy-say'),
    next: s.querySelector('.wy-nav .wy-next')?.textContent ?? null, back: s.querySelector('.wy-nav .wy-back')?.textContent ?? null, res: !!s.querySelector('.wy-res'), live: s.querySelector('.wy-live')?.textContent ?? '',
    stk: s.querySelector('.wy-stk:not([hidden])')?.textContent ?? null, stkName: s.querySelector('.wy-stk:not([hidden]) .wy-stn[data-proper]')?.textContent ?? null,
    date: d ? {v: d.value, min: d.min, type: d.type, label: d.closest('label')?.textContent ?? ''} : null, err: s.querySelector('.wy-err')?.textContent ?? null,
    find: s.querySelector('.wy-find')?.value ?? null, why: !!s.querySelector('.wy-why'), focus: a && s.contains(a) ? a.className : '',
    seen: lastOpt ? {bottom: Math.round(lastOpt.bottom), barTop: Math.round(bar ? bar.top : innerHeight), topBottom: Math.round(top ? Math.max(0, top.bottom) : 0), prevTop: pv ? Math.round(pv.getBoundingClientRect().top) : null} : null};
};
const READL = sel => {
  const s = document.querySelector(sel); if (!s) return null;
  const a = document.activeElement, v = c => s.querySelector(c)?.value ?? null, pv = s.querySelector(':scope > .wy-prev'), pd = pv?.querySelector('.wy-dot');
  const kids = [...s.children].map(e => (typeof e.className === 'string' && e.className.trim() ? e.className.trim().split(/\s+/)[0] : e.tagName.toLowerCase()));
  return {step: s.querySelector('.wy-step')?.textContent ?? null, qs: [...s.querySelectorAll('.wy-q')].map(x => x.textContent), why: v('.wy-why'), sell: v('.wy-sell'), half: v('.wy-half'),
    chips: [...s.querySelectorAll('.wy-quick button')].map(b => b.textContent), rows: [...s.querySelectorAll('.wy-pr')].map(r => r.textContent),
    notes: [...s.querySelectorAll('.wy-note')].map(x => x.textContent), err: s.querySelector('.wy-err')?.textContent ?? null, focus: a && s.contains(a) ? a.className : '', res: !!s.querySelector('.wy-res'),
    stk: s.querySelector('.wy-stk:not([hidden])')?.textContent ?? null, back: s.querySelector('.wy-nav .wy-back')?.textContent ?? null,
    prev: pv ? {one: pv.querySelector('.wy-onet')?.textContent ?? null, c: (/\bwy-([gyr])\b/.exec(pd?.className ?? '') || [])[1] ?? null, sr: pd?.querySelector('.wy-sr')?.textContent ?? null, say: pv.querySelector('.wy-say q[data-proper]')?.textContent ?? null, at: kids.indexOf('wy-prev')} : null};
};
const READR = sel => {
  const s = document.querySelector(sel), r = s?.querySelector('.wy-res'); if (!r) return null;
  const vb = r.querySelector('.wy-verdict b'), sc = r.querySelector('.wy-score');
  const own = e => [...e.childNodes].some(n => n.nodeType === 3 && n.textContent.trim());
  const shown = e => { const b = e.getBoundingClientRect(), cs = getComputedStyle(e); return b.width >= 2 && b.height >= 2 && cs.visibility !== 'hidden' && cs.display !== 'none'; };
  const texts = root => [...root.querySelectorAll('*')].filter(e => own(e) && shown(e) && !e.closest('.wy-live, .wy-sr')).map(e => ({fs: parseFloat(getComputedStyle(e).fontSize), v: !!vb && (e === vb || vb.contains(e)), t: e.textContent.trim().slice(0, 20)}));
  const inCard = texts(s), inView = texts(s.classList.contains('page') ? document.querySelector('#view') ?? s : s); // 매매일지 화면은 화면 전체 · 다른 화면에 붙인 칸(첫 화면 · 보내기 쪽)은 그 칸 안
  const big = xs => xs.filter(x => !x.v).sort((a, b) => b.fs - a.fs)[0] ?? null;
  const bars = [...r.querySelectorAll('.wy-bars .wy-bar')].map(b => { const f = b.querySelector('.wy-fill'), t = b.querySelector('.wy-track'); return {n: b.querySelector('.wy-bn')?.textContent ?? '', v: b.querySelector('b.num')?.textContent ?? '', w: f?.style.width ?? '', fw: f ? f.getBoundingClientRect().width : -1, tw: t ? t.getBoundingClientRect().width : -1, c: (/\bwy-([gyr])\b/.exec(f?.className ?? '') || [])[1] ?? null, sr: b.querySelector(':scope > .wy-sr')?.textContent ?? null}; });
  const tt = r.querySelector('.wy-tt'), ttf = tt?.querySelector('.wy-fill'), rd = r.querySelector('.wy-reds');
  return {verdict: vb?.textContent ?? null, vfs: vb ? parseFloat(getComputedStyle(vb).fontSize) : 0, vBottom: vb ? vb.getBoundingClientRect().bottom : 0, bigCard: big(inCard), bigView: big(inView), sizes: [...new Set(inView.map(x => x.fs))].sort((a, b) => a - b),
    score: sc?.textContent ?? null, sfs: sc ? parseFloat(getComputedStyle(sc).fontSize) : 0, sNumFs: sc?.querySelector('b') ? parseFloat(getComputedStyle(sc.querySelector('b')).fontSize) : 0, sTop: sc ? sc.getBoundingClientRect().top : 0,
    reds: rd?.textContent ?? null, redsSr: rd?.querySelector('.wy-dot .wy-sr')?.textContent ?? null, stop: r.querySelector('.wy-stop')?.textContent ?? null,
    tt: ttf ? {w: ttf.style.width, fw: ttf.getBoundingClientRect().width, tw: tt.getBoundingClientRect().width} : null, oldScore: /점수 \d+ \/ 22/.test(r.textContent),
    bars, notes: [...r.querySelectorAll(':scope > .wy-note')].map(x => x.textContent), btns: [...r.querySelectorAll('.wy-nav button')].map(x => x.textContent),
    link: r.querySelector('a.wy-link')?.getAttribute('href') ?? null, q: s.querySelectorAll('.wy-q, .wy-opt, .wy-find, .wy-why').length, live: s.querySelector('.wy-live')?.textContent ?? '',
    lines: [...r.querySelectorAll('.wy-lines p')].map(x => x.textContent), mine: r.querySelector('.wy-lines q.wy-mine[data-proper]')?.textContent ?? null, stk: s.querySelector('.wy-stk:not([hidden])')?.textContent ?? null};
};
const READLIST = () => {
  const s = document.querySelector('#view section.wy-me'); if (!s) return null;
  return {h: s.querySelector('h2')?.textContent ?? '', rows: [...s.querySelectorAll('.wy-rec')].map(r => {
    const L = r.querySelector('.wy-later');
    return {day: r.querySelector('.wy-rh b')?.textContent ?? '', rest: [...r.querySelectorAll('.wy-rh span')].map(x => x.textContent).join(''),
      stk: r.querySelector('.wy-rs')?.textContent ?? null, stkName: r.querySelector('.wy-rs .wy-stn[data-proper]')?.textContent ?? null,
      bars: [...r.querySelectorAll('.wy-bar b.num')].map(x => x.textContent), lines: [...r.querySelectorAll('.wy-lines p')].map(x => x.textContent), mine: r.querySelector('.wy-lines q.wy-mine[data-proper]')?.textContent ?? null,
      later: L ? {note: [...L.querySelectorAll(':scope > p.note')].map(x => x.textContent).join(' | '), kq: L.querySelector('.wy-kq')?.textContent ?? null, kb: [...L.querySelectorAll('button')].map(b => b.tagName + ':' + b.textContent),
        kd: L.querySelector('.wy-kd')?.textContent ?? null, lv: [...L.querySelectorAll('.wy-lv')].map(x => x.textContent), busy: /셈하는 중/.test(L.textContent),
        cls: [...L.querySelectorAll('.wy-lv b')].map(b => b.className)} : null};
  }), btn: [...s.querySelectorAll('button, [role="button"], input, select, textarea')].filter(x => !x.classList.contains('wy-kb')).map(x => x.textContent.trim() || x.getAttribute('aria-label') || x.tagName)};
};
/** 지우는 단추 — 화면 어디에도(누르는 것 가운데 「지우 · 지움 · 삭제」) */
const DELS = root => [...document.querySelectorAll(root + ' a, ' + root + ' button, ' + root + ' [role="button"]')].filter(e => /지우|지움|삭제/.test(e.textContent + ' ' + (e.getAttribute('aria-label') ?? ''))).map(e => e.textContent.trim());
/** 모양 — 옆으로 넘침 · 칸 밖 · 누르는 자리 · 글 크기(17px · 가짓수) · 캔버스 · [9] 8 칠한 점의 읽어 주는 글 · 손가락 커서는 button · a · 입력 칸만 · 쓰지 않을 말 · 옛 이름 */
const LAYOUT = sel => {
  const vw = document.documentElement.clientWidth, root = document.querySelector(sel);
  const out = {sw: document.documentElement.scrollWidth, vw, wide: [], small: [], tiny: [], sizes: [], canvas: 0, text: '', attrs: [], missing: !root, dotNoSr: [], fakeBtn: []};
  if (!root) return out;
  const desc = e => e.tagName.toLowerCase() + (typeof e.className === 'string' && e.className.trim() ? '.' + e.className.trim().split(/\s+/).join('.') : '') + ' 「' + (e.textContent || e.value || '').trim().slice(0, 24) + '」';
  const sizes = new Set();
  for (const e of [root, ...root.querySelectorAll('*')]) {
    if (e.ownerSVGElement) continue;
    const r = e.getBoundingClientRect(); if (r.width < 2 && r.height < 2) continue; // 눈에 안 보이는 읽기 칸(.wy-live · .wy-sr 1px)
    if (r.right > vw + 1 || r.left < -1) out.wide.push(desc(e) + ' ' + Math.round(r.left) + '~' + Math.round(r.right));
    const cs = getComputedStyle(e);
    const hasText = [...e.childNodes].some(n => n.nodeType === 3 && n.textContent.trim()) || (/^(INPUT|TEXTAREA)$/.test(e.tagName) && (e.value || e.placeholder));
    if (cs.visibility !== 'hidden' && hasText) { if (parseFloat(cs.fontSize) < 16.95) out.tiny.push(desc(e) + ' ' + cs.fontSize); sizes.add(parseFloat(cs.fontSize)); }
    if (cs.cursor === 'pointer' && e.closest('section.wy, section.wy-me') && !e.closest('a[href], button, input, select, textarea, label, summary')) out.fakeBtn.push(desc(e));
    if (e.classList.contains('wy-dot') || e.classList.contains('wy-fill')) {
      const c = cs.backgroundColor, painted = !(c === 'transparent' || /^rgba\(.*,\s*0\)$/.test(c));
      const sr = e.classList.contains('wy-dot') ? e.querySelector('.wy-sr')?.textContent : e.closest('.wy-bar')?.querySelector(':scope > .wy-sr')?.textContent ?? (e.closest('.wy-tt') ? 'tt' : null);
      if (painted && !['좋음', '주의', '위험', 'tt'].includes(sr ?? '')) out.dotNoSr.push(desc(e) + ' 「' + sr + '」');
    }
  }
  out.sizes = [...sizes].sort((a, b) => a - b);
  { // [10] 7 글 시작 왼쪽 줄 — measure_type.mjs 와 같은 잣대(블록마다 첫 글줄 왼쪽 x · 가운데 · 오른쪽 맞춤 블록 뺌 · 1px 로 잘린 칸 안 뺌) · 매매일지 화면(#/why…)에서만 셈
    const blockOf = el => { for (let a = el; a; a = a.parentElement) { const d = getComputedStyle(a).display; if (d !== 'inline' && d !== 'contents') return a; } return document.body; };
    const cut = el => { for (let a = el; a && a !== document.body; a = a.parentElement) { const cs = getComputedStyle(a); if (cs.overflow !== 'visible' || cs.clip !== 'auto' || cs.clipPath !== 'none') { const q = a.getBoundingClientRect(); if (q.width <= 1 || q.height <= 1) return true; } } return false; };
    const R = document.createRange(), seenB = new Set(), xs = new Map(), tw = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    for (let n; (n = tw.nextNode());) {
      if (!n.nodeValue.trim()) continue; const el = n.parentElement; if (!el || /^(SCRIPT|STYLE|NOSCRIPT|TEMPLATE)$/.test(el.tagName)) continue;
      R.selectNodeContents(n); const rs = [...R.getClientRects()].filter(q => q.width >= 1 && q.height >= 1); if (!rs.length) continue;
      if (el.checkVisibility && !el.checkVisibility({checkOpacity: true, checkVisibilityCSS: true})) continue; if (cut(el)) continue;
      const b = blockOf(el); if (seenB.has(b)) continue; seenB.add(b);
      if (/center|right|end/.test(getComputedStyle(b).textAlign)) continue; const x = Math.round(rs[0].left); if (x >= 0 && x < vw && !xs.has(x)) xs.set(x, desc(b));
    }
    out.lefts = [...xs.keys()].sort((a, b) => a - b); out.leftEx = [...xs.values()]; out.journal = location.hash.startsWith('#/why');
  }
  for (const e of root.querySelectorAll('a[href], button, input, select, textarea, summary, [role="button"]')) { const r = e.getBoundingClientRect(); if (!r.width || !r.height) continue; if (r.height < 43.5 || r.width < 43.5) out.small.push(desc(e) + ' ' + Math.round(r.width) + '×' + Math.round(r.height)); }
  for (const e of root.querySelectorAll('section.wy [role="button"], section.wy [onclick], section.wy-me [role="button"], section.wy-me [onclick]')) out.fakeBtn.push(desc(e));
  out.canvas = root.querySelectorAll('canvas').length;
  const c = root.cloneNode(true); c.querySelectorAll('[data-proper]').forEach(x => x.remove()); out.text = c.textContent;
  for (const e of [c, ...c.querySelectorAll('*')]) for (const a of ['aria-label', 'title', 'alt', 'placeholder']) { const v = e.getAttribute?.(a); if (v) out.attrs.push(v); }
  return out;
};
const SIZES = new Map(), LEFTS = new Map(); // 화면마다 본 글씨 크기 가짓수 · 글 시작 왼쪽 줄 수(결과 파일)
async function layout(p, sel, tag) {
  const s = await p.evaluate(LAYOUT, sel); bump('모양 잰 화면');
  if (s.missing) { fail('칸 없음', tag + ' ' + sel); return; }
  if (s.sw > s.vw) fail('옆으로 넘침', `${tag}: ${s.sw} > ${s.vw}`);
  for (const x of s.wide.slice(0, 3)) fail('칸 밖으로 나감', `${tag}: ${x}`);
  for (const x of s.small.slice(0, 3)) fail('누르는 자리 44px 밑', `${tag}: ${x}`);
  for (const x of s.tiny.slice(0, 3)) fail('글 17px 밑', `${tag}: ${x}`);
  if (s.sizes.length > 6) fail('[10] 한 화면 글씨 크기 여섯 가지 넘음', `${tag}: ${s.sizes.join(' · ')}`);
  SIZES.set(tag, s.sizes.length);
  if (s.journal) { LEFTS.set(tag, s.lefts.length); if (s.lefts.length > 3) fail('[10] 7 글 시작 왼쪽 줄 셋까지(매매일지)', `${tag}: ${s.lefts.join(' · ')} · ${s.leftEx.slice(0, 5).join(' | ')}`); }
  for (const x of s.dotNoSr.slice(0, 3)) fail('[9] 8 칠한 색 점에 읽어 주는 글(좋음 · 주의 · 위험) 없음', `${tag}: ${x}`);
  for (const x of s.fakeBtn.slice(0, 3)) fail('[9] 8 누르는 것이 button · a 가 아님', `${tag}: ${x}`);
  if (s.canvas) fail('캔버스(입체 없음 규칙 50)', tag);
  const T = s.text + '\n' + s.attrs.join('\n');
  for (const b of screenHits(T)) fail('쓰지 않을 말', `${tag} 「${b}」`);
  if (/‹ 앞으로/.test(T)) fail('[5] 4 「‹ 앞으로」 단추 글이 남음', tag);
  if (OLD_NAME_RE.test(T)) fail('옛 이름 남음', `${tag} 「${(OLD_NAME_RE.exec(T) || [])[0]}」`);
}

/* ⓪ 종목 고르기 */
const stockLine = st => (st.price != null ? [st.name, won(st.price), `${mdTxt(st.day)} 종가`] : [st.name, '? 그날 값 없음']);
function checkStk(text, name, st, at) {
  if (text == null || name !== st.name || !stockLine(st).every(x => text.includes(x))) fail('고른 종목 한 줄(이름 · 그날 값 · 날짜)', `${at} 「${text}」 이름 「${name}」 · 기대 ${JSON.stringify(stockLine(st))}`);
}
async function pickStock(p, sel, st, how, T) {
  const hit = c => p.locator(`${sel} .wy-hit[data-code="${c}"]`);
  if (how === 'recent') {
    await p.fill(sel + ' .wy-find', '');
    const n = await p.locator(sel + ' .wy-hits .wy-hit').count(), lab = await p.locator(sel + ' .wy-hits .wy-note').first().textContent().catch(() => '');
    if (!n || lab !== '최근 본 회사') fail('최근 본 회사(빈 찾기 칸)', `${T} ${n}개 · 「${lab}」`);
    if (await hit(st.code).count()) { await hit(st.code).first().click({timeout: 8000}); bump('최근 본 회사로 고름'); return; }
    how = 'enter';
  }
  const typed = async q => { await p.fill(sel + ' .wy-find', q); await p.waitForFunction(([s, q0]) => document.querySelector(s + ' .wy-hits')?.dataset.q === q0, [sel, q], {timeout: 15000}); };
  await typed(how === 'click' ? st.name.slice(0, 2) : st.name);
  if (how === 'click') {
    if (!(await hit(st.code).count())) await typed(st.name);
    await hit(st.code).first().click({timeout: 8000}); bump('찾아서 눌러 고름'); return;
  }
  const firstCode = await p.locator(sel + ' .wy-hits .wy-hit').first().getAttribute('data-code');
  if (firstCode !== st.code) fail('이름을 다 쓰면 그 종목이 맨 위', `${T} 「${st.name}」 → ${firstCode}`);
  await p.press(sel + ' .wy-find', 'Enter'); bump('엔터로 고름');
}

/* ① 질문 한 화면 맞대기 — picked = 이 장에서 고른 답(아직이면 null · 뒤로 왔을 때 고른 답) · prevK = 앞 장에서 고른 답(1번이면 null) · fresh = 방금 누르고 넘어옴(읽어 주는 칸에 앞 답 한마디) */
const ONE = QS.map(() => [new Map(), new Map(), new Map()]); // 질문마다 답마다 본 한마디(판마다 같은지)
const seeOne = (qi, k, t) => { const m = ONE[qi][k]; m.set(t, (m.get(t) || 0) + 1); };
function checkPrev(pv, qi, prevK, at, live, fresh) { // 앞 답의 한마디 + 격언 — 다음 장 맨 위(머리 바로 밑)
  const P = QS[qi - 1], A = P.a[prevK];
  if (!pv) { fail('[5] 3 앞 답 한마디가 다음 장 맨 위에 없음', at); return; }
  if (pv.at !== 1) fail('[5] 3 앞 답 한마디 = 머리 바로 밑(맨 위)', `${at} 차례 ${pv.at}`);
  if (!pv.one || /[\n\r]/.test(pv.one) || pv.one.length > 60) fail(NEW_NAME + ' 한마디 한 줄', `${at} 「${pv.one}」`); else seeOne(qi - 1, prevK, pv.one);
  if (pv.c !== A[0] || pv.paint === false) fail('[5] 1 앞 답 한마디 점 = 고른 답 색(고른 뒤에만 색)', `${at} ${pv.c} ≠ ${A[0]}`);
  if (pv.sr !== TONE[A[0]]) fail('[9] 8 앞 답 점의 읽어 주는 글', `${at} 「${pv.sr}」 ≠ 「${TONE[A[0]]}」`);
  if (pv.say !== P.say) fail('격언(원문 · data-proper)', `${at} 「${pv.say}」 ≠ 「${P.say}」`);
  if (fresh && !live.includes(pv.one ?? '\u0000')) fail('읽어 주는 칸(aria-live)에 앞 답 한마디 없음', at);
  bump('[5] 3 맞댄 앞 답 한마디');
}
function checkQ(s, qi, picked, T, st, prevK = null, fresh = false) {
  const Q = QS[qi], at = `${T} ${qi + 1}번`;
  if (!s) { fail('질문 칸 없음', at); return; }
  if (s.res) fail('결과가 일찍 나옴', at);
  if (s.step !== `${qi + 1} / ${QS.length}`) fail('질문 차례 글', `${at} 「${s.step}」`);
  if (s.q !== `${qi + 1}. ${Q.q}`) fail('질문 글자(원문)', `${at} 「${s.q}」 ≠ 「${qi + 1}. ${Q.q}」`);
  if (s.group !== Q.q) fail('답 묶음 이름표', `${at} 「${s.group}」`);
  if (st) checkStk(s.stk, s.stkName, st, at);
  if (s.opts.length !== 3) { fail('답 수', `${at} ${s.opts.length}`); return; }
  s.opts.forEach((o, k) => {
    if (o.t !== Q.a[k][1]) fail('답 글자(원문 차례 · [5] 2)', `${at} ${k + 1}째 「${o.t}」 ≠ 「${Q.a[k][1]}」`);
    if (o.tag !== 'BUTTON') fail('[9] 8 답은 단추', `${at} ${o.tag}`);
    const want = picked === k;
    if (o.pressed !== String(want) || o.on !== want) fail('고른 답 표시', `${at} 「${o.t}」 aria-pressed=${o.pressed} on=${o.on} · 기대 ${want}`);
    if (want) { // 고른 답(뒤로 왔을 때 · 3번 「클 일」) — 색 + 읽어 주는 글
      if (o.c !== Q.a[k][0] || !o.paint || o.ring) fail('고른 답 색(🟢 0 · 🟡 1 · 🔴 2)', `${at} 「${Q.a[k][1]}」 ${o.c} ≠ ${Q.a[k][0]}`);
      if (o.sr !== TONE[Q.a[k][0]]) fail('[9] 8 고른 답 점의 읽어 주는 글', `${at} 「${o.sr}」`);
    } else {
      if (!o.ring || o.paint || o.c) fail('[5] 1 고르기 전 답 색을 숨김(빈 테두리 · 칠한 색 0)', `${at} 「${o.t}」 칠함 ${o.paint} · ${o.c}`); else bump('[5] 1 숨긴 색 점');
      if (o.sr) fail('[5] 1 고르기 전 점이 색 이름을 읽어 줌', `${at} 「${o.t}」 「${o.sr}」`);
    }
  });
  if (s.back !== '‹ 앞 질문') fail('[5] 4 뒤로 단추 글 「‹ 앞 질문」', `${at} 「${s.back}」`);
  const big = qi === BIG_Q && picked === BIG_A;
  if (!!s.date !== big) fail('3번 「클 일이 있다」 날짜 칸', `${at} 날짜 칸 ${s.date ? '있음' : '없음'} · 답 ${picked}`);
  if (big && (s.date.type !== 'date' || !/언제/.test(s.date.label))) fail('날짜 칸 꼴', `${at} ${JSON.stringify(s.date)}`);
  if ((s.next != null) !== big) fail('[5] 3 「다음 ›」 단추는 3번 「클 일이 있다」 날짜 칸에만', `${at} 「${s.next}」`);
  if (big) { // 같은 장 한마디(날짜를 말함) + 색
    if (!s.one || /[\n\r]/.test(s.one) || s.one.length > 60 || !/날짜/.test(s.one)) fail('「클 일이 있다」 한마디가 날짜를 말함([3] 3)', `${at} 「${s.one}」`); else seeOne(qi, picked, s.one);
    if (s.oneDot?.c !== Q.a[picked][0] || s.oneDot?.sr !== TONE[Q.a[picked][0]]) fail('[9] 8 한마디 점 색 · 읽어 주는 글', `${at} ${JSON.stringify(s.oneDot)}`);
  } else if (s.one != null || s.sayAny) fail('[5] 3 한마디 · 격언이 같은 장에 남음(다음 장 맨 위로)', `${at} 「${s.one}」`);
  if (qi === 0 || prevK == null) { if (s.prev) fail('[5] 3 1번(앞 답 없음)에 앞 답 칸', at); }
  else checkPrev(s.prev, qi, prevK, at, s.live, fresh);
  bump('맞댄 질문 화면');
}

/** 길 하나 — 종목 고르기(pre = 처음부터 고름)부터 결과 · 기록 · 목록까지 · keep = 결과 화면을 남김 · page = 매매일지 화면(아래 목록이 있음) */
async function runPath(p, sel, P, tag, o = {}) {
  const {scan = false, scanSel = sel, store = 'ok', gdrX = G, keep = false, recCheck = true, pre = null, page = true, why0 = null} = o;
  const st = pre ?? ST[P.stock ?? 'co1'], T = `${tag} · ${P.name}`, before = store === 'ok' && recCheck ? await getRecs(p) : null, tStart = Date.now();
  const click = async (css, k = 0) => { await p.locator(sel + ' ' + css).nth(k).click({timeout: 8000}); };
  const read = () => p.evaluate(READQ, sel);
  let s = await read();
  if (pre) { if (s?.step !== `1 / ${QS.length}` || s.find != null) fail('처음부터 고른 종목 — 1번 질문부터', `${T} 「${s?.step}」`); }
  else {
    if (s?.find == null || s.step !== '종목 고르기' || !/종목/.test(s.q ?? '')) { fail('맨 앞 = 종목 고르기([3] 1)', `${T} 「${s?.step}」 「${s?.q}」`); return null; }
    if (s.find !== '') fail('종목 고르기 칸이 비어 있지 않음', `${T} 「${s.find}」`);
    if (scan) await layout(p, scanSel, `${T} 종목 고르기`);
    await pickStock(p, sel, st, P.pick ?? 'enter', T);
  }
  await waitStk(p, sel).catch(() => fail('그날 값을 받지 못함(받는 중에 멈춤)', T));
  const ks = P.ks, cur = new Array(QS.length).fill(null), k2first = P.back ? idxOf(1, P.back) : null; // 뒤로 단추 시험 — 2번은 처음에 다른 답(k2first)을 골랐다가 4번에서 돌아가 바꿈
  let qTaps = 0, extra = false; // [5] 3 첫 질문에서 「마지막 두 줄」까지 누름(답 + 3번 날짜 칸 「다음」) · extra = 시험으로 더 누른 길(셈 맞대기 빼고)
  const tap = async k => { await click('.wy-opt', k); qTaps++; };
  for (let qi = 0; qi < QS.length; qi++) {
    s = await read();
    checkQ(s, qi, cur[qi], T, st, qi ? cur[qi - 1] : null, qi > 0);
    if ((qi > 0 || !pre) && s?.seen && s.seen.bottom > s.seen.barTop) fail('[5] 3 누른 뒤 다음 질문의 답 셋이 아래 단추 줄 위에 다 보임', `${T} ${qi + 1}번 · 답 끝 ${s.seen.bottom} > 단추 줄 ${s.seen.barTop}`);
    if (s?.seen?.prevTop != null && s.seen.prevTop < s.seen.topBottom) fail('[5] 3 앞 답 한마디가 위 막대에 가림', `${T} ${qi + 1}번 · ${s.seen.prevTop} < ${s.seen.topBottom}`);
    if (scan) await layout(p, scanSel, `${T} ${qi + 1}번 고르기 전`);
    if (qi === BIG_Q && P.big3 === 'switch' && ks[qi] !== BIG_A) { // 「클 일이 있다」 + 날짜로 골랐다가 다른 답으로 바꿈 → 기록에 날짜 없음
      await tap(BIG_A); cur[qi] = BIG_A; extra = true; await p.fill(sel + ' .wy-date', FUTURE);
      checkQ(await read(), qi, BIG_A, T + ' 클 일 먼저', st, cur[qi - 1]); bump('3번 날짜 넣고 답 바꿈');
    }
    const k0 = k2first != null && qi === 1 ? k2first : ks[qi];
    await tap(k0); cur[qi] = k0;
    if (qi === BIG_Q && k0 === BIG_A) { // [3] 3 — 같은 장에 남아 날짜를 받아야 다음으로(누름 +1)
      s = await read(); checkQ(s, qi, k0, T, st, cur[qi - 1]);
      if (!/wy-date/.test(s.focus)) fail('날짜 칸에 바로 씀(누름 줄이기)', `${T} 3번 · 지금 「${s.focus}」`);
      if (s.date?.min !== isoIn(Date.now())) fail('날짜 칸 가장 이른 날 = 오늘', `${T} ${s.date?.min}`);
      if (P.date === 'bad') {
        extra = true;
        await click('.wy-next'); let x = await read();
        if (x.step !== '3 / 11' || x.err !== '그 일이 언제인지 날짜를 적어 줘.') fail('날짜 없이 다음 → 막고 알림', `${T} 「${x.step}」 「${x.err}」`); else bump('날짜 없이 막음');
        await p.fill(sel + ' .wy-date', PAST); await click('.wy-next'); x = await read();
        if (x.step !== '3 / 11' || x.err !== '오늘이나 그 뒤 날짜를 적어 줘.') fail('지난 날 → 막고 알림', `${T} 「${x.step}」 「${x.err}」`); else bump('지난 날 막음');
      }
      await p.fill(sel + ' .wy-date', FUTURE);
      if (await p.locator(sel + ' .wy-err').count()) fail('날짜를 넣었는데 알림이 남음', T);
      if (scan) await layout(p, scanSel, `${T} 3번 날짜 칸`);
      await click('.wy-next'); qTaps++;
    }
    if (k2first != null && qi === 2) { // 4번 화면(안 고름)에서 뒤로 두 번 → 2번(고른 답 색)을 바꿈 → 3번(고른 답 그대로 · 맨 위 = 바꾼 2번 한마디) → 4번
      extra = true;
      checkQ(await read(), 3, null, T + ' 뒤로 전', st, cur[2], true);
      await click('.wy-back'); checkQ(await read(), 2, cur[2], T + ' 뒤로 1', st, cur[1]);
      await click('.wy-back'); checkQ(await read(), 1, cur[1], T + ' 뒤로 2', st, cur[0]);
      if (scan) await layout(p, scanSel, `${T} 뒤로 온 2번`);
      await tap(ks[1]); cur[1] = ks[1]; checkQ(await read(), 2, cur[2], T + ' 앞에서 바꿈', st, cur[1], true);
      await tap(cur[2]); bump('뒤로 단추 길');
    }
  }
  if (!extra) { // [5] 3 누름 셈 — 답마다 한 번(+ 3번 「클 일」 날짜 칸 「다음」)
    const want = QS.length + (ks[BIG_Q] === BIG_A ? 1 : 0);
    if (qTaps !== want) fail('[5] 3 질문 누름 수', `${T} ${qTaps} ≠ ${want}`); else { bump('[5] 3 누름 셈 맞음'); (accept.taps ??= {})[P.name] = qTaps; }
  }
  // ③ 두 줄
  await p.waitForFunction(s0 => !!document.querySelector(s0 + ' .wy-why'), sel, {timeout: 15000}).catch(() => {});
  let L = await p.evaluate(READL, sel);
  if (!L || L.why == null) { fail('두 줄 화면 없음 — 11번 답 뒤 바로', T); return null; }
  if (L.step !== '마지막 두 줄' || L.qs[0] !== '① 1년 뒤 반토막 났다면 왜?' || !/^② /.test(L.qs[1] ?? '')) fail('두 줄 글([3] 4)', `${T} ${JSON.stringify([L.step, ...L.qs])}`);
  if (L.back !== '‹ 앞 질문') fail('[5] 4 두 줄 화면 뒤로 단추 글', `${T} 「${L.back}」`);
  { const pk = cur[QS.length - 1], A = QS[QS.length - 1].a[pk];
    if (!L.prev || L.prev.at !== 1 || L.prev.c !== A[0] || L.prev.sr !== TONE[A[0]] || L.prev.say !== QS[QS.length - 1].say || !L.prev.one) fail('[5] 3 두 줄 화면 맨 위 = 11번 답 한마디', `${T} ${JSON.stringify(L.prev)}`);
    else seeOne(QS.length - 1, pk, L.prev.one); }
  if (!/wy-why/.test(L.focus)) fail('① 칸에 바로 씀(누름 줄이기)', `${T} 지금 「${L.focus}」`);
  if (L.why !== '' || L.err) fail('두 줄 처음 상태', `${T} 「${L.why}」 「${L.err}」`);
  checkStk(L.stk, st.name, st, T + ' 두 줄');
  const dS = st.price != null ? SELL(st.price) : null, dH = st.price != null ? HALF(st.price) : null;
  if (st.price != null ? (L.sell !== dS.toLocaleString('ko-KR') || L.half !== dH.toLocaleString('ko-KR')) : (L.sell !== '' || L.half !== '')) fail('팔 약속 기본값(그날 값 × 0.9 · × 1.2 · 원 아래 버림)', `${T} 「${L.sell}」 「${L.half}」 · 기대 ${dS} · ${dH}`); else bump('맞댄 팔 약속 기본값');
  if (!(L.rows.length === 2 && /^만약.*원.*아래로 가면 다 판다\.$/.test(L.rows[0]) && /^만약.*원.*위로 가면 절반 판다\.$/.test(L.rows[1]))) fail('② 「만약 ~이면 ~한다」 두 줄', `${T} ${JSON.stringify(L.rows)}`);
  if (st.price != null ? !L.notes.some(t => t.includes(`그날 값 ${won(st.price)}`)) : !L.notes.some(t => /^\? 그날 값이 없어요/.test(t))) fail('팔 약속 밑 알림', `${T} ${JSON.stringify(L.notes)}`);
  if (L.chips.length < 2 || L.chips.some(c => !c.trim())) fail('빠른 말', `${T} ${JSON.stringify(L.chips)}`);
  if (scan) await layout(p, scanSel, `${T} 두 줄`);
  let whyT = why0 ?? `이익이 반으로 줄어서 ${P.name.length}`, sell = dS, half = dH;
  const how = st.price == null && P.why !== 'check' ? 'check' : P.why;
  await kakaoStub(p); const off0 = await offers(p);
  if (how === 'chip') {
    const k = Math.min(1, L.chips.length - 1); await click('.wy-quick button', k); whyT = L.chips[k];
    const v = await p.inputValue(sel + ' .wy-why'); if (v !== whyT) fail('빠른 말 → ① 칸', `${T} 「${v}」 ≠ 「${whyT}」`); else bump('빠른 말로 씀');
    await click('.wy-nav .wy-next');
  } else if (how === 'enter') {
    await p.fill(sel + ' .wy-why', whyT); await p.press(sel + ' .wy-why', 'Enter'); bump('엔터로 결과');
  } else if (how === 'edit') {
    sell = Math.floor(st.price * 8 / 10); half = Math.floor(st.price * 15 / 10);
    await p.fill(sel + ' .wy-why', '  ' + whyT + '  ');
    await p.fill(sel + ' .wy-sell', String(sell)); await p.fill(sel + ' .wy-half', String(half)); await p.locator(sel + ' .wy-why').focus(); // 칸을 떠나면 쉼표
    const v = [await p.inputValue(sel + ' .wy-sell'), await p.inputValue(sel + ' .wy-half')];
    if (!eq(v, [sell.toLocaleString('ko-KR'), half.toLocaleString('ko-KR')])) fail('고친 팔 선 쉼표', `${T} ${JSON.stringify(v)}`);
    await click('.wy-nav .wy-next'); bump('팔 선 고쳐 씀');
  } else { // check — 빈 칸 · 빈 숫자 · 앞 ≥ 뒤를 막고 알림 · 그다음 바르게
    const tryRes = async (want, what) => { await click('.wy-nav .wy-next'); const x = await p.evaluate(READL, sel); if (!x || x.res || x.err !== want) fail('두 줄 막기 · ' + what, `${T} 「${x?.err}」 ≠ 「${want}」`); else bump('두 줄 막음'); };
    await p.fill(sel + ' .wy-why', '   '); await tryRes('① 한 줄만 적어 줘. 아래 말을 눌러도 돼.', '빈 칸');
    if (!/wy-why/.test((await p.evaluate(READL, sel)).focus)) fail('막은 뒤 ① 칸으로', T);
    await p.fill(sel + ' .wy-why', whyT); await p.fill(sel + ' .wy-sell', ''); await tryRes('② 팔 선 두 숫자를 적어 줘.', '빈 숫자');
    await p.fill(sel + ' .wy-sell', '90000'); await p.fill(sel + ' .wy-half', '50000'); await tryRes('② 앞 숫자가 뒤 숫자보다 작아야 해.', '앞 ≥ 뒤');
    sell = 50000; half = 90000; await p.fill(sel + ' .wy-sell', '50,000원'); await p.fill(sel + ' .wy-half', '9만'); // 쉼표 · 「원」은 빼고 · 「만」은 만 원으로
    await click('.wy-nav .wy-next');
  }
  whyT = whyT.trim();
  // ④ 결과
  await p.waitForFunction(s0 => !!document.querySelector(s0 + ' .wy-res'), sel, {timeout: 15000}).catch(() => {});
  const J = judge(ks), r = await p.evaluate(READR, sel);
  if (!r) { fail('결과 칸 없음', T); return null; }
  if (r.q) fail('결과 화면에 질문 · 칸이 남음', T);
  if (r.verdict !== `「${J.verdict}」`) fail('판정', `${T} 「${r.verdict}」 ≠ 「${J.verdict}」 (점수 ${J.score} · 빨강 ${J.reds} · 쉬어 가는 답 ${J.stop})`);
  if (J.stop && J.score < 12 && J.reds < 4) { if (r.verdict === `「${V_REST}」`) bump('[5] 6 쉬어 가자(점수와 상관없이)'); }
  if (!!r.stop !== J.stop || (J.stop && !/빌린 돈|곧 쓸 돈/.test(r.stop ?? ''))) fail('[5] 6 쉬어 가는 까닭 한 줄(4번 · 9번 답일 때만)', `${T} 「${r.stop}」 · ${J.stop}`);
  // [5] 2 판정 글이 가장 큼 — 칸 안 · 화면 안 다른 글 모두보다 큼 · 준비는 판정 밑 · 더 작음
  if (!(r.vfs > (r.bigCard?.fs ?? 0) && r.vfs > (r.bigView?.fs ?? 0))) fail('[5] 2 판정 글이 가장 큰 글씨', `${T} 판정 ${r.vfs}px · 칸 안 ${JSON.stringify(r.bigCard)} · 화면 ${JSON.stringify(r.bigView)}`);
  else { accept.verdictPx = r.vfs; accept.nextPx = Math.max(r.bigCard?.fs ?? 0, r.bigView?.fs ?? 0); }
  if (!(r.sTop >= r.vBottom - 1 && r.sfs < r.vfs && r.sNumFs < r.vfs)) fail('[5] 2 「준비 n / 22」는 판정 밑 · 더 작게', `${T} 판정 밑 ${r.vBottom} · 준비 위 ${r.sTop} · ${r.sfs}px / ${r.sNumFs}px`);
  // [5] 5 준비 n / 22(n = 22 − 점수) · 막대 = 준비 ÷ 최대
  if (!(r.score ?? '').startsWith(`준비 ${J.ready} / ${MAX}`) || r.oldScore) fail('[5] 5 「준비 n / 22」(n = 22 − 점수)', `${T} 「${r.score}」 ≠ 준비 ${J.ready} / ${MAX}`);
  if (!(r.reds ?? '').includes(`${J.reds}개`) || r.redsSr !== '위험') fail('빨강 수 · 읽어 주는 글 「위험」([9] 8)', `${T} 「${r.reds}」 「${r.redsSr}」 ≠ ${J.reds}`);
  if (!r.tt || r.tt.w !== Math.round(J.ready / MAX * 100) + '%' || (r.tt.tw > 0 && Math.abs(r.tt.fw - r.tt.tw * J.ready / MAX) > 1.5)) fail('[5] 5 준비 막대 = 준비 ÷ 22', `${T} ${JSON.stringify(r.tt)} · ${J.ready}`);
  if (r.bars.length !== 4) fail('묶음 막대 수', `${T} ${r.bars.length}`);
  GROUPS.forEach(([n, qs], i) => {
    const b = r.bars[i], v = J.groups[n], mx = qs.length * 2; if (!b) return;
    if (b.n !== n) fail('묶음 이름 · 차례', `${T} ${i + 1}째 「${b.n}」 ≠ 「${n}」`);
    if (b.v !== `${mx - v} / ${mx}`) fail('[5] 5 묶음 준비 숫자', `${T} ${n} 「${b.v}」 ≠ ${mx - v} / ${mx}`);
    if (b.w !== Math.round((mx - v) / mx * 100) + '%') fail('[5] 5 묶음 막대 길이(준비 ÷ 최대 · 글)', `${T} ${n} ${b.w} ≠ ${Math.round((mx - v) / mx * 100)}%`);
    if (b.tw > 0 && Math.abs(b.fw - b.tw * (mx - v) / mx) > 1.5) fail('[5] 5 묶음 막대 길이(그린 것)', `${T} ${n} ${b.fw.toFixed(1)} / ${b.tw.toFixed(1)} ≠ ${mx - v} / ${mx}`);
    if (!b.c || b.sr !== TONE[b.c]) fail('[9] 8 묶음 막대 색의 읽어 주는 글', `${T} ${n} ${b.c} 「${b.sr}」`);
  });
  const bigWant = ks[BIG_Q] === BIG_A ? FUTURE : null;
  checkStk(r.stk, st.name, st, T + ' 결과');
  if (r.mine !== whyT || !r.lines.some(t => t === '팔 약속 ' + promiseTxt(sell, half)) || (bigWant ? !r.lines.includes('클 일 ' + ymdTxt(bigWant)) : r.lines.some(t => /^클 일/.test(t)))) fail('결과의 두 줄 요약', `${T} ${JSON.stringify(r.lines)} · 「${r.mine}」`);
  if (page ? r.link != null : r.link !== '#/why') fail('매매일지 고리', `${T} ${r.link}`);
  if (!r.live.includes(`준비 ${J.ready} / ${MAX}`) || !r.live.includes(J.verdict)) fail('읽어 주는 칸(aria-live)에 판정 · 준비 없음', `${T} 「${r.live}」`);
  const saved = store === 'ok';
  const savedNote = page ? '오늘 답을 아래 매매일지에 날짜와 함께 쌓았어요.' : '오늘 답을 매매일지에 날짜와 함께 쌓았어요.';
  if (saved ? !r.notes.includes(savedNote) : !r.notes.some(t => /남길 수 없/.test(t)) || r.notes.some(t => /쌓았/.test(t))) fail('기록 알림 글', `${T} ${JSON.stringify(r.notes)}`);
  if (r.btns[0] !== '다시 하기') fail('다시 하기 단추', `${T} ${JSON.stringify(r.btns)}`);
  if (scan) await layout(p, scanSel, `${T} 결과`);
  // [2] 7 카톡 권유 — 결과가 처음 보인 뒤 한 번(이 판 첫 끝냄) · 그 뒤 끝냄 · 다시 그림은 더 안 부름
  const off1 = await offers(p);
  if (p._kakao === 'stub' && off0) {
    const want = (o.offerSeen ?? 0) === 0 ? 1 : 0, got = off1.length - off0.length;
    if (got !== want || off1.some(w => w !== 'journal')) fail('[2] 7 결과 뒤 NX.kakao.offer(\'journal\') 한 번', `${T} 이번 ${got}번 · 기대 ${want} · ${JSON.stringify(off1)}`); else bump('[2] 7 권유 부른 수 맞음');
  }
  bump('끝낸 길'); bump('판정 ' + J.verdict);
  // ⑤ 기록 — 끝낼 때 딱 한 번 · 맨 앞에 · 꼴 · 값
  if (saved && recCheck) {
    const recs = await getRecs(p), x = recs?.[0];
    if (!Array.isArray(recs) || recs.length !== Math.min(200, (before?.length ?? 0) + 1)) fail('기록 수(끝낼 때 한 번)', `${T} ${before?.length} → ${recs?.length}`);
    else {
      const at = Date.parse(x.at);
      if (!eq(Object.keys(x).sort(), REC_KEYS) || !eq(Object.keys(x.promise ?? {}).sort(), ['half', 'sell', 'text'])) fail('기록 꼴(열쇠)', `${T} ${JSON.stringify(Object.keys(x))} · ${JSON.stringify(Object.keys(x.promise ?? {}))}`);
      if (!(at >= tStart - 2000 && at <= Date.now() + 2000)) fail('기록 날짜', `${T} ${x.at}`);
      if (x.code !== st.code || x.name !== st.name || x.price !== (st.price ?? null) || x.day !== (st.day ?? null)) fail('기록 종목 · 그날 값([3] 6)', `${T} ${x.code} ${x.name} ${x.price} ${x.day} · 기대 ${st.code} ${st.name} ${st.price} ${st.day}`);
      if (!eq(x.answers, ks)) fail('기록 답', `${T} ${JSON.stringify(x.answers)} ≠ ${JSON.stringify(ks)}`);
      if (x.score !== J.score || x.reds !== J.reds || x.verdict !== J.verdict) fail('기록 점수(옛 꼴 그대로) · 빨강 · 판정', `${T} ${x.score} ${x.reds} ${x.verdict}`);
      if (!eq(GROUPS.map(([n]) => x.groups?.[n]), GROUPS.map(([n]) => J.groups[n]))) fail('기록 묶음', `${T} ${JSON.stringify(x.groups)}`);
      if (x.bigDay !== bigWant) fail('기록 클 일 날짜([3] 3)', `${T} ${x.bigDay} ≠ ${bigWant}`);
      if (x.why !== whyT || x.promise?.sell !== sell || x.promise?.half !== half || x.promise?.text !== promiseTxt(sell, half)) fail('기록 두 줄([3] 4 · 5)', `${T} 「${x.why}」 ${JSON.stringify(x.promise)} · 기대 「${whyT}」 ${sell} ${half}`);
      if (x.asOf !== recAsOf(gdrX)) fail('기록 자료 날짜', `${T} ${x.asOf} ≠ ${recAsOf(gdrX)}`);
      if (!eq(x.picks, pickRec(gdrX))) fail('기록 그날 ' + NEW_NAME + ' 칸', `${T} ${JSON.stringify(x.picks).slice(0, 160)}`);
      bump('맞댄 기록');
    }
    if (page) { // 매매일지 화면 아래 목록이 그 자리에서 늘어남([3] 7)
      const m = await p.evaluate(READLIST);
      const n = (recs ?? []).filter(z => z && typeof z === 'object').length;
      if (!m || (/기록 ([\d,]+)번/.exec(m.h) || [])[1] !== n.toLocaleString('ko-KR') || m.rows[0]?.stkName !== st.name || m.rows[0]?.mine !== whyT) fail('매매일지 아래 목록이 바로 늘어남', `${T} 「${m?.h}」 ${m?.rows?.[0]?.stkName} 「${m?.rows?.[0]?.mine}」 · 기대 ${n} · ${st.name}`);
      else bump('목록 바로 늘어남');
    }
  }
  // [5] 7 todayResult() — 오늘(서울) 가장 새 기록 · 기억 못 하는 기계는 방금 끝낸 것
  {
    const tr = await modCall(p, 'today'), x = saved && recCheck ? (await getRecs(p))?.[0] : null;
    const ok = tr && eq(Object.keys(tr).sort(), ['at', 'code', 'of', 'ready', 'verdict']) && tr.verdict === V_CODE[J.verdict] && tr.ready === J.ready && tr.of === MAX && tr.code === st.code
      && Date.parse(tr.at) >= tStart - 2000 && (!x || tr.at === x.at) && isoIn(Date.parse(tr.at)) === isoIn(Date.now());
    if (!ok) fail('[5] 7 todayResult() 꼴 · 값', `${T} ${JSON.stringify(tr)} · 기대 ${V_CODE[J.verdict]} 준비 ${J.ready} ${st.code}`); else bump('[5] 7 todayResult 맞음');
  }
  if (store !== 'ok' || !recCheck) { const d = await modCall(p, 'done'); if (d !== true) fail('doneOnce() — 이 화면에서 끝낸 뒤', `${T} ${d}`); }
  if (keep) return {J, whyT, sell, half};
  // 다시 하기 — 처음(종목 고르기 · 처음부터 고른 종목이면 1번 · 아무것도 안 고름) · 권유는 더 안 부름
  await p.locator(sel + ' .wy-res .wy-nav button').first().click({timeout: 8000});
  s = await read();
  if (pre) { await waitStk(p, sel).catch(() => {}); checkQ(await read(), 0, null, T + ' 다시 하기', st); }
  else if (s?.find !== '' || s.step !== '종목 고르기') fail('다시 하기 = 종목 고르기부터', `${T} 「${s?.step}」 「${s?.find}」`);
  if (p._kakao === 'stub' && off1 && (await offers(p))?.length !== off1.length) fail('[2] 7 다시 하기(다시 그림)에 권유를 또 부름', T);
  return {J, whyT, sell, half};
}

/** 쌓인 기록 목록 맞대기(새 것부터 · 서른 줄까지 · 날짜 · 준비 · 판정 · 종목 · 그날 값 · 두 줄 · 막대 · 한 달 칸) · 지우는 단추 없음 · o.home · o.medOk · o.blocked = 그 판의 자료 */
async function checkList(p, tag, {expectN = null, home = p._home, blocked = p._block ?? [], medOk = !blocked.includes(MED_FILE)} = {}) {
  await p.waitForFunction(() => ![...document.querySelectorAll('#view section.wy-me .wy-later')].some(x => /셈하는 중/.test(x.textContent)), null, {timeout: 30000}).catch(() => fail('한 달 칸이 「셈하는 중」에 멈춤', tag));
  const m = await p.evaluate(READLIST), recs = ((await getRecs(p)) ?? []).filter(z => z && typeof z === 'object');
  if (!m) { fail('매매일지 기록 칸 없음', tag); return; }
  const n = expectN ?? recs.length;
  if ((/기록 ([\d,]+)번/.exec(m.h) || [])[1] !== n.toLocaleString('ko-KR')) fail('기록 수', `${tag} 「${m.h}」 ≠ ${n}`);
  if (m.rows.length !== Math.min(n, 30)) fail('줄 수(서른까지)', `${tag} ${m.rows.length} ≠ ${Math.min(n, 30)}`);
  for (const [i, row] of m.rows.entries()) {
    const x = recs[i]; if (!x) continue;
    const at = Date.parse(x.at), J = Array.isArray(x.answers) && x.answers.length === QS.length ? judge(x.answers) : null, T = `${tag} ${i + 1}줄`;
    if (row.day !== dayTxt(at)) fail('목록 날짜', `${T} 「${row.day}」 ≠ 「${dayTxt(at)}」`);
    if (!row.rest.includes(Number.isFinite(x.score) ? `준비 ${MAX - x.score} / ${MAX}` : '준비 ?') || !row.rest.includes(x.verdict) || /점수 \d/.test(row.rest)) fail('[5] 5 목록 준비 · 판정(옛 기록도 보일 때 바꿈)', `${T} 「${row.rest}」 · 점수 ${x.score}`);
    if (J && J.score !== x.score) fail('쌓인 기록의 점수(답으로 다시 셈)', `${T} ${x.score}`);
    if (!eq(row.bars, GROUPS.map(([nm, qs]) => `${qs.length * 2 - (x.groups?.[nm] ?? 0)} / ${qs.length * 2}`))) fail('[5] 5 목록 막대 준비 숫자', `${T} ${JSON.stringify(row.bars)}`);
    if (x.code || x.name) { // 새 꼴 — 종목 · 그날 값 · 날짜 · 두 줄
      const want = x.price > 0 ? [`그날 값 ${won(x.price)}`, ...(x.day ? [`${mdTxt(x.day)} 종가`] : [])] : ['그날 값 ?'];
      if (row.stkName !== (x.name || x.code) || !want.every(w => row.stk?.includes(w))) fail('목록 종목 · 그날 값([3] 6)', `${T} 「${row.stk}」 · 기대 ${x.name} ${JSON.stringify(want)}`);
      if (x.why && row.mine !== x.why) fail('목록 ① 줄(내 글 data-proper)', `${T} 「${row.mine}」 ≠ 「${x.why}」`);
      if (x.promise?.text && !row.lines.includes('팔 약속 ' + x.promise.text)) fail('목록 ② 팔 약속', `${T} ${JSON.stringify(row.lines)}`);
      if (x.bigDay ? !row.lines.includes('클 일 ' + ymdTxt(x.bigDay)) : row.lines.some(t => /^클 일/.test(t))) fail('목록 클 일 날짜', `${T} ${JSON.stringify(row.lines)} · ${x.bigDay}`);
      bump('맞댄 새 꼴 줄');
    } else {
      if (row.stk != null || row.lines.length) fail('옛 기록(종목 없음)에 종목 · 두 줄', `${T} 「${row.stk}」 ${JSON.stringify(row.lines)}`);
      bump('맞댄 옛 꼴 줄');
    }
    // [5] 8 · 9 한 달 칸 — 아직 · 묻기 · 값(따로 셈)
    const W = await laterWant(x, {home, medOk, blocked}), L = row.later ?? {};
    if (!W) {
      if (L.note !== '한 달 뒤에 그날 정한 대로 했는지 물어요.' || L.kq || L.kb?.length || L.lv?.length) fail('[5] 8 한 달 안 된 기록 = 한 줄만(묻기 · 값 0)', `${T} ${JSON.stringify(L)}`); else bump('[5] 8 아직 줄');
    } else if (x.kept?.a === 'yes' || x.kept?.a === 'no') {
      if (L.kd !== (x.kept.a === 'yes' ? '그날 정한 대로 했어요.' : '그날 정한 대로 하지 않았어요.') || L.kq || L.kb?.length) fail('[5] 8 답한 기록 = 답 한 줄 + 값(다시 묻지 않음)', `${T} ${JSON.stringify(L)}`);
      if (!eq(L.lv, W.lines)) fail('[5] 9 한 달 뒤 값(날짜 박음 · 따로 셈)', `${T} ${JSON.stringify(L.lv)} ≠ ${JSON.stringify(W.lines)}`); else { bump('[5] 9 맞댄 한 달 뒤 값'); bump('[5] 9 「?」 값', W.q); }
    } else {
      if (L.kq !== '그날 정한 대로 했어?' || !eq(L.kb, ['BUTTON:했어', 'BUTTON:안 했어']) || L.lv?.length || L.kd) fail('[5] 8 한 달 지난 기록 = 「그날 정한 대로 했어?」 먼저 · 값 0', `${T} ${JSON.stringify(L)}`); else bump('[5] 8 먼저 물음');
    }
  }
  if (m.btn.length) fail('기록에 누르는 것(지우는 단추 없음 — 규칙 77 · 「했어 · 안 했어」 말고)', `${tag} ${JSON.stringify(m.btn)}`);
  const dels = await p.evaluate(DELS, '#view');
  if (dels.length) fail('지우는 단추(규칙 77 · [3] 6)', `${tag} ${JSON.stringify(dels)}`);
  bump('맞댄 기록 목록');
}
const oldRec = (daysAgo, picks = []) => ({at: new Date(Date.now() - daysAgo * 864e5).toISOString(), asOf: '2026-09-01', answers: PATHS[0].ks, score: 0, reds: 0, verdict: V_OK, groups: {이유: 0, 돈: 0, 때: 0, 마음: 0}, picks}); // 옛 꼴(종목 · 두 줄 없음)
/** 한 달 뒤 시험 기록 — 장 날 k 의 오전 10시(서울)에 쓴 기록(day = 그날 값 날짜) · o = 덧붙일 열쇠 */
const recAt = (k, st, o = {}) => ({at: new Date(Date.parse(DD[k] + 'T01:00:00Z')).toISOString(), asOf: DD[k], code: st?.code ?? null, name: st?.name ?? null, price: st?.price ?? null, day: st ? DD[k] : null,
  answers: PATHS[4].ks, score: 5, reds: 0, verdict: V_OK, groups: judge(PATHS[4].ks).groups, bigDay: null, why: '한 달 뒤 시험', promise: {sell: 1000, half: 2000, text: promiseTxt(1000, 2000)}, picks: [], ...o});
/** 지수 줄에 두 날이 다 있는 가장 늦은 시작 날(장 날 자리) · 그보다 앞서 지수 줄 밖인 시작 날 */
const KM = kospiOf(HOME), kIn = (() => { for (let k = DD.length - 1 - LATER; k >= 0; k--) if (KM.has(DD[k]) && KM.has(DD[k + LATER])) return k; return -1; })();
const kOut = (() => { for (let k = Math.max(0, kIn - 1); k >= 0; k--) if (!KM.has(DD[k])) return k; return -1; })();
if (kIn < 2 || kOut < 0) { console.error('한 달 뒤 시험 날을 못 고름(지수 줄 · 날짜 줄)', kIn, kOut); process.exit(1); }

const SEL = '#view section.wy', PSEL = '#view';

/* ⓪ 찾기와 같은 잣대 · 처음 화면 · 없는 번호 · 틀린 번호 */
if (!QUICK) {
  const T = '종목 고르기 360×640', p = await newPage(360, 640);
  try {
    await open(p, '#/why', SEL + ' .wy-find');
    const top = await p.evaluate(() => ({h1: document.querySelector('#view h1')?.textContent ?? null, title: document.title, page: !!document.querySelector('#view section.wy.page'), list: !!document.querySelector('#view section.wy.page ~ section.wy-me'),
      safe: document.querySelector('#view section.wy-me ~ p.safe')?.textContent ?? null}));
    if (top.h1 !== '매매일지' || top.title !== '매매일지' + TITLE_TAIL || !top.page || !top.list || top.safe !== SAFE_LINE) fail('매매일지 화면 꼴(제목 = 탭 이름 · 질문 칸 · 아래 기록 · 안전 문장)', `${T} ${JSON.stringify(top)}`);
    await p.waitForFunction(() => document.activeElement?.classList?.contains('wy-find'), null, {timeout: 5000}).catch(() => fail('매매일지를 열면 찾기 칸에 바로 씀', T));
    for (const q of ['삼성전자', 'ㅅㅅㅈㅈ', '0059', '하이닉스', 'kodex', '0001a', '현대']) {
      await p.fill(SEL + ' .wy-find', q);
      await p.waitForFunction(([s, q0]) => document.querySelector(s + ' .wy-hits')?.dataset.q === q0, [SEL, q], {timeout: 15000});
      const rows = await p.$$eval(SEL + ' .wy-hits [data-code]', bs => bs.map(b => ({c: b.dataset.code, btn: b.tagName === 'BUTTON', n: b.querySelector('.nm[data-proper]')?.textContent ?? '', s: b.querySelector('small')?.textContent ?? ''})));
      const note = await p.$$eval(SEL + ' .wy-hits > p.wy-note', ps => ps.map(x => x.textContent));
      const f = await p.context().newPage();
      await f.goto(base + NEXT + '#/find/' + encodeURIComponent(q), {waitUntil: 'domcontentloaded'});
      await f.waitForFunction(() => !!document.querySelector('#view .hits a, #view .hits .note') && !document.querySelector('#view .boot'), null, {timeout: 30000});
      const find = await f.$$eval('#view .hits a', as => as.map(a => { const m = /#\/(w|x)\/([0-9A-Z]{6})$/.exec(a.getAttribute('href') ?? ''); return m ? {c: m[2], co: m[1] === 'w', s: a.querySelector('small')?.textContent ?? ''} : null; }).filter(Boolean));
      await f.close();
      const want = find.slice(0, 6);
      if (!rows.length || !eq(rows.map(r => r.c), want.map(x => x.c))) fail('찾기와 같은 잣대([3] 1 — 같은 말 · 같은 차례)', `${T} 「${q}」 ${JSON.stringify(rows.map(r => r.c))} ≠ 찾기 ${JSON.stringify(want.map(x => x.c))}`); else bump('찾기와 같은 차례');
      rows.forEach((r, k) => { // 회사 주식 = 누르는 단추 · 펀드 · 우선주 … = 누르지 않는 줄 + 찾기와 같은 까닭 한 줄
        const x = want[k]; if (!x) return;
        if (r.btn !== x.co) fail('회사 주식만 고름(펀드 · 우선주 … 는 누르지 않음)', `${T} 「${q}」 ${r.c} 단추 ${r.btn}`);
        if (!x.co && r.s !== x.s) fail('펀드 · 우선주 … 까닭 줄(찾기와 같은 글)', `${T} ${r.c} 「${r.s}」 ≠ 「${x.s}」`);
      });
      if (rows.some(r => !r.btn) !== note.includes('회사 주식만 매매일지에 적어요.')) fail('펀드 · 우선주 섞일 때 알림 한 줄', `${T} 「${q}」 ${JSON.stringify(note)}`);
      if (rows.some(r => !r.btn)) bump('펀드 · 우선주 까닭 줄');
    }
    await layout(p, PSEL, T + ' 찾은 종목');
    for (const q of ['kodex', ST.x1.name]) { // 맨 위가 회사 주식이 아니면 엔터를 눌러도 질문으로 가지 않음
      await p.fill(SEL + ' .wy-find', q);
      await p.waitForFunction(([s, q0]) => document.querySelector(s + ' .wy-hits')?.dataset.q === q0, [SEL, q], {timeout: 15000});
      const topBtn = await p.evaluate(s => document.querySelector(s + ' .wy-hits [data-code]')?.tagName ?? null, SEL);
      await p.press(SEL + ' .wy-find', 'Enter'); await p.waitForTimeout(400);
      const s = await p.evaluate(READQ, SEL);
      if (topBtn !== 'DIV' || s?.find == null) fail('맨 위가 펀드 · 우선주면 엔터로 고르지 않음', `${T} 「${q}」 맨 위 ${topBtn} · 「${s?.step}」`); else bump('펀드 엔터 막음');
    }
    await p.fill(SEL + ' .wy-find', 'ㅋㅋㅋㅋㅋㅋㅋ');
    await p.waitForFunction(s => /찾는 종목이 없어요/.test(document.querySelector(s + ' .wy-hits')?.textContent ?? ''), SEL, {timeout: 10000}).catch(() => fail('못 찾음 글', T));
    for (const [hash, why] of [['#/why/999999', '없는 번호'], ['#/why/abc', '틀린 번호']]) {
      await open(p, hash, SEL);
      await p.waitForFunction(s => !!document.querySelector(s + ' .wy-find') && !!document.querySelector(s + ' .wy-err'), SEL, {timeout: 15000}).catch(() => {});
      const s = await p.evaluate(READQ, SEL);
      if (s?.find == null || s.err !== '? 이 번호의 종목을 찾지 못했어요. 이름으로 찾아 줘.') fail(why + ' → 종목 고르기 + 알림', `${T} ${hash} 「${s?.step}」 「${s?.err}」`); else bump('없는 · 틀린 번호');
    }
    for (const [hash, st] of [['#/why/' + ST.co1.code, ST.co1], ...(ST.coL ? [['#/why/' + ST.coL.code.toLowerCase(), ST.coL]] : [])]) { // 글자 섞인 번호는 작은 글자로 써도 그 종목
      await open(p, hash, SEL + ' .wy-opt'); await waitStk(p, SEL).catch(() => {});
      checkQ(await p.evaluate(READQ, SEL), 0, null, `${T} ${hash}`, st);
      await p.locator(SEL + ' .wy-back').click(); // 1번의 「‹ 앞 질문」 = 종목 고르기
      const s = await p.evaluate(READQ, SEL); if (s?.find == null) fail('1번 뒤로 → 종목 고르기', `${T} ${hash} 「${s?.step}」`); else bump('1번 뒤로 → 종목 고르기');
    }
    { // #/why/<펀드 · 우선주> — 질문 대신 종목 고르기 + 「? 이름 — 회사 주식만 매매일지에 적어요.」 + 찾기와 같은 까닭 한 줄
      await open(p, '#/why/' + ST.x1.code, SEL);
      await p.waitForFunction(s => !!document.querySelector(s + ' .wy-find') && !!document.querySelector(s + ' .wy-err'), SEL, {timeout: 15000}).catch(() => {});
      const s = await p.evaluate(sel => { const e = document.querySelector(sel + ' .wy-err'); return {find: !!document.querySelector(sel + ' .wy-find'), q: document.querySelectorAll(sel + ' .wy-opt').length, err: e?.textContent ?? null, nm: e?.querySelector('.nm[data-proper]')?.textContent ?? null, w: document.querySelector(sel + ' .wy-xw')?.textContent ?? null}; }, SEL);
      if (!s.find || s.q || s.err !== `? ${ST.x1.name} — 회사 주식만 매매일지에 적어요.` || s.nm !== ST.x1.name || s.w !== ST.x1.w) fail('펀드 · 우선주 번호 → 질문 대신 까닭', `${T} ${JSON.stringify(s)} · 기대 w 「${ST.x1.w}」`); else bump('펀드 번호 → 까닭');
      await layout(p, PSEL, T + ' 펀드 번호');
    }
    { // 회사 화면 「이 회사로 왜 사?」(일꾼 A · a.why-go) → #/why/<번호> · 그 종목으로 1번부터
      await open(p, '#/w/' + ST.co1.code, '#view a.why-go');
      await p.locator('#view a.why-go').first().click({timeout: 8000});
      await p.waitForFunction(([c, s]) => location.hash === '#/why/' + c && !!document.querySelector(s + ' .wy-opt') && !document.querySelector('#view .boot'), [ST.co1.code, SEL], {timeout: 30000});
      await waitStk(p, SEL).catch(() => {});
      checkQ(await p.evaluate(READQ, SEL), 0, null, `${T} 회사 화면 고리`, ST.co1); bump('회사 화면 → 그 종목으로');
    }
    errsOf(p, T);
  } catch (e) { fail('판 멈춤', `${T}: ${e.message.split('\n')[0]}`); }
  await p.context().close();
}

/* ① ~ ⑤ 판 A — 360×640 #/why(길 열하나 · quick 은 다섯) · 옛 기록 스물다섯(한 달 지남 · 물음) · 최근 본 회사 · 그날 값 파일 못 받는 회사 */
{
  const T = '360×640 #/why', p = await newPage(360, 640, {allow: [CX_FILE], block: [CX_FILE]});
  try {
    await open(p, '#/why', SEL);
    if (!QUICK) await setRecs(p, Array.from({length: 25}, (_, i) => oldRec(40 + i))); // 서른 줄 넘음 — 옛 꼴 기록 스물다섯
    await p.evaluate(c => localStorage.setItem('atlas:new:hist', JSON.stringify([c, '000660'])), ST.co1.code); // 최근 본 회사
    await open(p, '#/why', SEL);
    if (!QUICK) await checkList(p, T + ' 처음 목록');
    let first = true, seen = 0;
    for (const P of PATHS.filter(P => !QUICK || SHORT.includes(P.name))) {
      try { await runPath(p, SEL, P, T, {scan: first, scanSel: PSEL, offerSeen: seen}); seen++; } catch (e) { fail('길 멈춤', `${T} · ${P.name}: ${e.message.split('\n')[0]}`); await open(p, '#/why', SEL).catch(() => {}); }
      first = false; errsOf(p, T + ' · ' + P.name);
    }
    await open(p, '#/why', SEL); await checkList(p, T + ' 끝 목록');
    await layout(p, '#view section.wy-me', T + ' 기록 목록');
    errsOf(p, T + ' 목록');
  } catch (e) { fail('판 멈춤', `${T}: ${e.message.split('\n')[0]}`); }
  await p.context().close();
}

/* [5] 8 · 9 판 L — 한 달 뒤: 묻기 먼저 → 값(날짜 박음 · 따로 셈) · 답은 그 기록에 · 다시 열어도 값 · 「?」 길 셋(회사 파일 · 지수 줄 · 가운데 값 파일) */
for (const [tag, w, h, o] of [['한 달 뒤 360×640', 360, 640, {allow: [CX_FILE], block: [CX_FILE]}], ['한 달 뒤 · 가운데 값 못 받음 390×844', 390, 844, {allow: [MED_FILE], block: [MED_FILE]}]]) {
  const T = tag, p = await newPage(w, h, o), medOk = !o.block.includes(MED_FILE);
  try {
    await open(p, '#/why', SEL);
    const recs = [recAt(DD.length - 1, ST.co1, {at: new Date().toISOString()}), // 오늘 기록 — 한 달 안 됨
      recAt(kIn, ST.co1), // 묻기 → 했어 → 값(숫자)
      recAt(kIn - 1, ST.cx, {score: judge(PATHS[2].ks).score, reds: judge(PATHS[2].ks).reds, verdict: V_HALF, answers: PATHS[2].ks, groups: judge(PATHS[2].ks).groups}), // 묻기 → 안 했어 → 회사 값 「?」(판 1) · 숫자(판 2)
      recAt(kOut, ST.co2, {kept: {a: 'yes', at: '2026-09-30T00:00:00.000Z'}}), // 이미 답함 → 묻지 않고 값 · 지수 줄 밖 → 코스피 「?」
      {...oldRec(60), asOf: DD[kIn - 2], at: new Date(Date.parse(DD[kIn - 2] + 'T01:00:00Z')).toISOString()}]; // 옛 꼴(종목 없음) · 묻기만
    await setRecs(p, recs);
    await open(p, '#/why', SEL);
    await checkList(p, T + ' 처음');
    await layout(p, '#view section.wy-me', T + ' 묻기');
    const before = await getRecs(p);
    for (const [row, yes] of [[1, true], [2, false]]) { // 줄 차례 = 기록 차례(새 것부터)
      const btn = p.locator('#view section.wy-me .wy-rec').nth(row).locator('.wy-later button', {hasText: yes ? /^했어$/ : /^안 했어$/});
      await btn.click({timeout: 8000});
      await p.waitForFunction(i => { const r = document.querySelectorAll('#view section.wy-me .wy-rec')[i]; return r && r.querySelectorAll('.wy-lv').length >= 2 && !/셈하는 중/.test(r.textContent); }, row, {timeout: 20000}).catch(() => fail('[5] 9 답한 뒤 값이 안 붙음', `${T} ${row + 1}줄`));
      const foc = await p.evaluate(() => document.activeElement?.className ?? '');
      if (!/wy-kd/.test(foc)) fail('답한 뒤 읽는 자리가 답 한 줄로(누른 단추가 사라짐)', `${T} 「${foc}」`);
    }
    const after = await getRecs(p);
    if (after.length !== before.length) fail('[5] 8 답해도 기록 수 그대로', `${T} ${before.length} → ${after.length}`);
    after.forEach((x, i) => {
      const want = i === 1 ? 'yes' : i === 2 ? 'no' : (before[i].kept?.a ?? null);
      const {kept: k1, ...rest1} = x, {kept: k0, ...rest0} = before[i];
      if ((k1?.a ?? null) !== want || !eq(rest1, rest0) || ((i === 1 || i === 2) && !(Date.parse(k1?.at) > Date.now() - 120000))) fail('[5] 8 답은 그 기록에 kept 로만(다른 값 그대로)', `${T} ${i + 1}째 ${JSON.stringify(k1)} · 기대 ${want}`);
    });
    bump('[5] 8 답 남김');
    await checkList(p, T + ' 답한 뒤(그 자리)');
    await open(p, '#/why', SEL); // 다시 열어도 묻지 않고 값
    await checkList(p, T + ' 다시 엶');
    await layout(p, '#view section.wy-me', T + ' 값');
    const q = (await p.evaluate(READLIST)).rows.map(r => r.later?.lv ?? []).flat().join('\n').split('?').length - 1;
    accept.later = {...(accept.later ?? {}), [T]: {qmarks: q, medOk}};
    errsOf(p, T);
  } catch (e) { fail('판 멈춤', `${T}: ${e.message.split('\n')[0]}`); }
  await p.context().close();
}

/* 판 B — 390×844 #/why/<번호>(처음부터 고름) */
if (!QUICK) {
  const T = `390×844 #/why/${ST.co2.code}`, p = await newPage(390, 844);
  try {
    await open(p, '#/why/' + ST.co2.code, SEL + ' .wy-opt');
    await setRecs(p, [recAt(kIn, ST.co2)]);
    await open(p, '#/why/' + ST.co2.code, SEL + ' .wy-opt');
    await checkList(p, T + ' 처음 목록');
    let first = true, seen = 0;
    for (const P of PATHS.filter(P => ALL || SHORT.includes(P.name))) {
      try { await runPath(p, SEL, P, T, {scan: first, scanSel: PSEL, pre: ST.co2, offerSeen: seen}); seen++; } catch (e) { fail('길 멈춤', `${T} · ${P.name}: ${e.message.split('\n')[0]}`); await open(p, '#/why/' + ST.co2.code, SEL + ' .wy-opt').catch(() => {}); }
      first = false; errsOf(p, T + ' · ' + P.name);
    }
    await checkList(p, T + ' 끝 목록');
    await layout(p, '#view section.wy-me', T + ' 기록 목록');
    errsOf(p, T + ' 목록');
  } catch (e) { fail('판 멈춤', `${T}: ${e.message.split('\n')[0]}`); }
  await p.context().close();
}

/* ⑥ whyCard(G, {code, onDone}) — 친구가 연 보내기 쪽처럼(처음부터 고른 종목 · 결과 뒤 onDone) · meRecords() · doneOnce() · todayResult() · 권유 한 번(다른 화면 갔다 와도) */
{
  const T = '360×640 whyCard 옵션', p = await newPage(360, 640);
  try {
    await open(p, '#/find', '#view .find'); // 다른 화면 위에 칸을 붙임(보내기 쪽처럼) — 끝에 「매매일지 보기 ›」가 실제로 #/why 로 감
    if (await modCall(p, 'done') !== false) fail('doneOnce() — 기록 없는 새 기기', T);
    if (await modCall(p, 'today') !== null) fail('[5] 7 todayResult() — 기록 없는 새 기기 = null', T);
    await setRecs(p, [null, 7, 'x']); if (await modCall(p, 'done') !== false) fail('doneOnce() — 망가진 줄만', T);
    await setRecs(p, [oldRec(3)]); if (await modCall(p, 'done') !== true) fail('doneOnce() — 옛 꼴 기록 하나', T);
    if (await modCall(p, 'today') !== null) fail('[5] 7 todayResult() — 오늘 기록 없음(사흘 전만) = null', T); else bump('[5] 7 todayResult null');
    await setRecs(p, []);
    await p.evaluate(async c => {
      const W = await globalThis.NX.mod('why'), G0 = globalThis.NX?.gdr ? await globalThis.NX.gdr() : null; // 보내기 쪽(일꾼 C)과 같은 길 — NX.mod 가 p-why.css 도 붙임
      window.__done = [];
      const host = document.createElement('div'); host.id = '__t';
      const card = W.whyCard(G0, {code: c, onDone: (rec, saved) => window.__done.push({rec, saved, res: !!document.querySelector('#__t .wy-res'), page: !!document.querySelector('#__t section.wy.page'), offer: (window.__offer ?? []).length})});
      host.append(card); document.querySelector('#view').replaceChildren(host);
    }, ST.co1.code);
    const S2 = '#__t section.wy';
    await p.waitForSelector(S2 + ' .wy-opt', {timeout: 15000});
    await p.waitForFunction(s => getComputedStyle(document.querySelector(s + ' .wy-opt')).minHeight === '56px', S2, {timeout: 15000}).catch(() => fail('NX.mod(\'why\') 로 붙인 칸에 p-why.css 가 안 붙음', T));
    const r0 = await runPath(p, S2, PATHS[4], T, {scan: true, pre: ST.co1, page: false, keep: true});
    const d = await p.evaluate(() => window.__done);
    if (d.length !== 1 || !d[0].res || d[0].saved !== true || d[0].page || d[0].rec?.code !== ST.co1.code || d[0].rec?.score !== r0?.J?.score || d[0].rec?.why !== r0?.whyT) fail('onDone — 결과를 그린 뒤 한 번 · 기록 · 남겼나', `${T} ${JSON.stringify(d).slice(0, 300)}`); else bump('onDone 한 번');
    if (await modCall(p, 'done') !== true) fail('doneOnce() — 끝낸 뒤', T);
    const me = await modCall(p, 'me'), n = ((await getRecs(p)) ?? []).length;
    if ((/기록 ([\d,]+)번/.exec(me.h) || [])[1] !== String(n) || me.rows !== n || me.btn) fail('meRecords() — 같은 기록 · 누르는 것 없음', `${T} ${JSON.stringify(me)} · 기록 ${n}`); else bump('meRecords 맞음');
    await p.locator(S2 + ' .wy-res a.wy-link').click({timeout: 8000}); // 매매일지 보기 › → #/why(목록에 방금 기록)
    await p.waitForFunction(() => location.hash === '#/why' && !!document.querySelector('#view section.wy-me') && !document.querySelector('#view .boot'), null, {timeout: 30000});
    await checkList(p, T + ' 매매일지로');
    await go(p, '#/find', '#view .find'); await go(p, '#/why', SEL); // 다른 화면 갔다 옴 — 권유 더 없음
    if ((await offers(p))?.length !== 1) fail('[2] 7 권유는 한 번(다른 화면 갔다 와도)', `${T} ${JSON.stringify(await offers(p))}`); else { bump('[2] 7 한 번 그대로'); accept.offer = 1; }
    errsOf(p, T);
  } catch (e) { fail('판 멈춤', `${T}: ${e.message.split('\n')[0]}`); }
  await p.context().close();
}
async function go(p, hash, sel) {
  await p.evaluate(h => { location.hash = h; }, hash);
  await p.waitForFunction(([h, s]) => location.hash === h && !!document.querySelector(s) && !document.querySelector('#view .boot'), [hash, sel], {timeout: 30000});
}

/* ⑦ 첫 화면 칸(있을 때만 — 일꾼 S2x 가 정함) · 기억 못 하는 기계 · 고도리 칸 자료 못 받음 · 카톡 꺼짐(offer 없음) · 카톡 모듈 그대로(바꿔치기 없음) · 망가진 줄 */
if (!QUICK) {
  const T = '390×844 #/ 첫 화면', p = await newPage(390, 844);
  try {
    await open(p, '#/', '#view > *');
    await p.waitForFunction(() => !document.querySelector('#view .boot'), null, {timeout: 30000});
    if (await p.locator(SEL).count()) {
      if (await p.evaluate(() => document.activeElement?.classList?.contains('wy-find'))) fail('첫 화면에서 찾기 칸에 저절로 들어감(자판이 뜸)', T);
      await runPath(p, SEL, PATHS[8], T, {page: false}); bump('첫 화면 칸 길');
    } else bump('첫 화면에 매매일지 칸 없음(가운데 단추로만)');
    errsOf(p, T);
  } catch (e) { fail('판 멈춤', `${T}: ${e.message.split('\n')[0]}`); }
  await p.context().close();
}
for (const [tag, w, h, hash, o, P, pre] of [
  ['localStorage 막힘', 390, 844, '#/why', {store: 'throw'}, PATHS[9], null],
  ...(QUICK ? [] : [
    ['localStorage 막힘', 360, 640, '#/why/' + ST.co1.code, {store: 'throw', kakao: 'off'}, PATHS[8], ST.co1],
    ['쓰기만 막힘', 390, 844, '#/why', {store: 'nowrite', kakao: null}, PATHS[4], null],
    [NEW_NAME + ' 칸 자료 못 받음', 360, 640, '#/why', {gdr404: true, allow: ['/next/data/gdr.json']}, PATHS[10], null]]),
]) {
  const T = `${tag} ${w}×${h} ${hash}${o.kakao === 'off' ? ' · 카톡 꺼짐' : o.kakao === null ? ' · 카톡 그대로' : ''}`, p = await newPage(w, h, o);
  try {
    await open(p, hash, SEL);
    if (o.store) { const t = await p.evaluate(() => document.querySelector('#view section.wy-me')?.textContent ?? ''); if (!/기록 0번/.test(t)) fail('기억 못 하는 기계 기록 칸', `${T} 「${t.slice(0, 80)}」`); }
    await runPath(p, SEL, P, T, {scan: true, scanSel: PSEL, store: o.store ?? 'ok', gdrX: o.gdr404 ? null : G, pre});
    await open(p, '#/why', SEL);
    await checkList(p, T + ' 목록', {expectN: o.store ? 0 : 1});
    if (o.gdr404) { const t = await p.evaluate(() => document.querySelector('#view section.wy-me .wy-rec')?.textContent ?? ''); if (t.includes(NEW_NAME + ' 칸')) fail('자료 없이 ' + NEW_NAME + ' 칸 줄', T); }
    await layout(p, '#view section.wy-me', T + ' 목록');
    errsOf(p, T); bump('기억 · 자료 바꾼 길');
  } catch (e) { fail('바꾼 길 멈춤', `${T}: ${e.message.split('\n')[0]}`); }
  await p.context().close();
}
if (!QUICK) { // 기억에 망가진 줄(null · 글 · 숫자)이 섞임 — 목록은 성한 기록만(기록 수 = 성한 줄) · 새로 끝낸 답은 맨 앞에 · 화면 오류 0
  const T = '망가진 줄 섞임 390×844', p = await newPage(390, 844);
  try {
    await open(p, '#/why', SEL);
    const good = {...oldRec(3), answers: PATHS[4].ks, score: 5, reds: 0, verdict: V_OK, groups: judge(PATHS[4].ks).groups, asOf: G?.asOf ?? null};
    await setRecs(p, [null, '망가짐', 42, good]);
    await open(p, '#/why', SEL);
    await checkList(p, T + ' 처음', {expectN: 1});
    await runPath(p, SEL, PATHS[8], T, {recCheck: false}); // 기록 수 · 맨 앞 맞대기는 아래에서(망가진 줄은 셈 밖)
    const recs = await getRecs(p);
    if (!(recs?.[0] && typeof recs[0] === 'object' && recs[0].score === judge(PATHS[8].ks).score && eq(recs[0].answers, PATHS[8].ks) && recs[0].code === ST.co1.code)) fail('망가진 줄 위에 새 기록', `${T} ${JSON.stringify(recs?.[0]).slice(0, 120)}`);
    await open(p, '#/why', SEL);
    await checkList(p, T + ' 새 기록 뒤', {expectN: 2});
    errsOf(p, T); bump('기억 · 자료 바꾼 길');
  } catch (e) { fail('바꾼 길 멈춤', `${T}: ${e.message.split('\n')[0]}`); }
  await p.context().close();
}

/* 고도리 한마디 — 판마다 같은 답은 같은 한마디 · 한 질문 안 답마다 다름 · 모든 답을 한 번은 봄(quick 은 길이 적어 「모두 봄」은 뺌) */
QS.forEach((Q, qi) => {
  const seen = ONE[qi].map(m => [...m.keys()]);
  seen.forEach((xs, k) => { if (!xs.length && !QUICK) fail('한마디를 못 본 답(길을 늘릴 것)', `${qi + 1}번 「${Q.a[k][1]}」`); if (xs.length > 1) fail('같은 답에 한마디가 여럿', `${qi + 1}번 「${Q.a[k][1]}」 ${JSON.stringify(xs)}`); });
  const one = seen.map(xs => xs[0]).filter(Boolean); if (new Set(one).size !== one.length) fail('한 질문 안에 같은 한마디(답마다 한마디)', `${qi + 1}번 ${JSON.stringify(one)}`);
});

/* ⑨ 걸린 때 · 누름 — 처음 여는 기기 390×844 · 종목 이름 → 엔터 → 열한 질문(답만) → 빠른 말 → 결과 · 읽기 · 재기 없이 누르기만 */
{
  const T = '걸린 때 390×844', p = await newPage(390, 844);
  try {
    await open(p, '#/why', SEL + ' .wy-find');
    let taps = 0, qTaps = 0; const t1 = Date.now();
    await p.fill(SEL + ' .wy-find', ST.co1.name); await p.locator(SEL + ' .wy-hit').first().waitFor({timeout: 15000}); await p.press(SEL + ' .wy-find', 'Enter'); taps += 1;
    await p.locator(SEL + ' .wy-opt').first().waitFor({timeout: 15000});
    for (let qi = 0; qi < QS.length; qi++) { await p.locator(SEL + ' .wy-opt').nth(PATHS[0].ks[qi]).click(); taps += 1; qTaps += 1; }
    await p.locator(SEL + ' .wy-quick button').first().click(); await p.locator(SEL + ' .wy-nav .wy-next').click(); taps += 2;
    await p.waitForSelector(SEL + ' .wy-res', {timeout: 15000});
    Object.assign(timing, {flowMs: Date.now() - t1, taps, qTaps, qTapsBefore: QS.length * 2, typed: ST.co1.name.length});
    accept.tapsQuestions = {before: QS.length * 2, after: qTaps}; accept.tapsAll = {before: QS.length * 2 + 3, after: taps};
    if (qTaps !== QS.length) fail('[5] 3 질문 누름 22 → 11', `${T} ${qTaps}`);
    if (timing.flowMs > 60000) fail('1분 안에 끝남([3] 9)', `${T} ${timing.flowMs}ms`);
    errsOf(p, T);
  } catch (e) { fail('판 멈춤', `${T}: ${e.message.split('\n')[0]}`); }
  await p.context().close();
}

await browser.close();
const sec = Math.round((Date.now() - t0) / 1000);
accept.fontSizesPerScreenMax = Math.max(0, ...SIZES.values()); accept.leftEdgesPerScreenMax = Math.max(0, ...LEFTS.values()); accept.leftScreens = LEFTS.size;
const res = {schema: 'atlas11-next-why-3', when: new Date().toISOString(), base, path: NEXT, all: ALL, quick: QUICK, gdrAsOf: G?.asOf ?? null, gdrVersion: G?.version ?? null, picks: G?.picks?.length ?? null, stocks: Object.fromEntries(Object.entries(ST).map(([k, v]) => [k, v.code])),
  laterDays: {in: [DD[kIn], DD[kIn + LATER]], out: [DD[kOut], DD[kOut + LATER]]}, accept, timing, sec, counts, fails, ok: !fails.length};
if (OUT) { await fs.mkdir(path.dirname(path.resolve(OUT)), {recursive: true}); await fs.writeFile(path.resolve(OUT), JSON.stringify(res, null, 1) + '\n'); }
console.log(JSON.stringify({sec, quick: QUICK, accept, timing, counts}, null, 1));
if (fails.length) { console.log('실패 ' + (counts.fail || 0) + '건:'); for (const [k, x] of fails.slice(0, 60)) console.log(' -', k, '·', x); process.exit(1); }
console.log('실패 0');
