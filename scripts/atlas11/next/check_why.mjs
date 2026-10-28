// 고도리 매매일지(「친구야, 왜 사?」) 맞대기 — 사장님 2026-10-17(싱가포르) 21:10 「하나로 묶은 명령문」 [3] 1 · 3 ~ 7 · 9 · [6] 1 · 앞 판 17:54 「한 장 명령문」 명령 2 ~ 6 · 13
//   + 2026-10-18 「72개와 카톡 두 번 가입」(order-0015.txt) [5] 1 ~ 9 · [9] 8 · [2] 7 · [10](글씨 · 간격) — 잣대 docs/design/godori-2026-10-18/accept/S1c.md(일꾼 S1c)
//   + 2026-10-28 그림 그대로 판 — 사장님 09:46 「360가지 분석해 먼저」 · 10:11 「어 그렇게 해」(docs/design/why-mock-2026-10-28/order-1011.txt · 잣대 brief.md)
//     일곱 갈래를 그림대로 바꿈: 그림자 · 옅은 빛 · 「매수」(칸 안에서만) · 「다음으로 ›」 단추 · 앞 답 한마디 칸 없음 · 판단 단정 · 종목 찾기 · 두 줄 없음 · 누르는 칸 옅은 테 — 아래 잣대는 그 꼴로 고쳐 잼
//   쓰는 법: node scripts/atlas11/next/check_why.mjs --base http://127.0.0.1:8826 [--pw /opt/node-tools/] [--path /next/?dev=1] [--out 결과.json] [--all | --quick] [--ws <켜 둔 브라우저 주소>]
//     --all = 길 열하나를 모든 판에서 · 기본 = 첫 판은 열한 길 · 나머지 판은 다섯 길(시작 화면 · #/why/<번호> · 망가진 줄 · 첫 화면 칸까지)
//     --quick = 가장 작은 범위(고칠 때 · 일꾼 끝 검사): 첫 판 다섯 길(쉬어 가자 두 길 포함) · 한 달 뒤 판 · whyCard 판 · 기억 못 하는 기계 한 판 · 걸린 때
//   기준 = 사장님 글 — 질문 · 답 · 색 · 격언 · 점수 · 묶음 · 판정은 brief.md 코드 칸 · 매매일지는 order-2110.txt [3] · 2026-10-18 은 order-0015.txt [5] · [9] 8 · [2] 7 · 2026-10-28 꼴 · 글은 why-mock brief.md(글자 그대로 있는지 먼저 봄)
//          화면 모듈(site/next/p-why.js)의 셈은 쓰지 않음 — 점수 · 준비 · 판정 · 유형 · 성향 넷(tendOf) · 한 달 뒤 값(시작 날 · 스무 번째 장 날 · 종가 · 코스피 · 모든 회사 가운데 값)은 이 검사가 따로 셈
//          (가운데 값은 회사 파일 2,5xx개를 모두 받아 다시 셈 → /next/data/median20.json 과 맞댐) · 이름 = rename.mjs(brand.js 한 곳) · 쓰지 않을 말 = site/next/words.js screenHits(「매수」는 section.wy 안에서만 WHY_OK)
//          그림 말투 질문 · 안내 · 풀이(why-look.js LOOK)는 사장님 글이 아니라 화면 글 — 화면이 그 글을 제자리에 그렸는지만 맞댐
//   ⓪ 시작 화면(그림 1) — 매매일지 쪽 꼴(제목 h1 은 눈에 안 보이게 남김 · 질문 칸 · 아래 기록 · 안전 문장) · 큰 제목 두 줄 · 풀이 · 장면 · 세 줄 · 「시작하기 ›」 · 「약 2분 소요 …」 · 종목 찾기 칸 없음
//      #/why/<번호>(회사 화면 「이 회사로 왜 사?」 · 작은 글자 번호) = 시작 화면 · 종목은 화면에 안 보이고 기록에만(code · name · 그날 값 · 날짜) · 없는 번호 · 틀린 번호 · 펀드 · 우선주 = 알림 없이 기록에 종목 없음
//   ① 질문 화면(그림 2 · 3) — 한 화면에 하나 · 사장님 차례 · 답 글 그대로 · 큰 질문 = 그림 말투(LOOK.lead) · 회색 안내(있을 때만) · 괄호 풀이 · 오른쪽 동그라미(색 점 없음)
//      답 누름 = 고르기만(aria-pressed) · 「다음으로 ›」 = 다음 · 답 없이 누르면 막고 「답을 하나 골라 줘.」 · 11번 「‹ 이전」 + 「결과 보기 ›」 · 맨 위 ← = 앞 질문(1번은 시작 화면) · 고른 답은 남음
//      한마디 = 읽어 주는 칸(「둘이: …」) · 격언 = 노란 칸 맨 아래 · 다음 질문의 답 셋이 위 막대와 아래 줄 사이에 다 보임(360 × 640) · 질문 · 상세 분석 장은 아래 칸을 숨김
//   ② 3번 「클 일이 있다」 — 같은 장에 날짜 칸(바로 씀 · 화면 안) · 날짜 없이 다음 → 막고 알림 · 지난 날 → 막고 알림 · 날짜를 넣어야 다음 · 다른 답으로 바꾸면 기록에 날짜 없음
//   ③ 결과(그림 4 · 7) — 「당신은 / ○○ 투자자예요」(data-v = go · wait · rest · 유형 이름 + 따옴표 한 줄 = brief) · 유형 글이 화면에서 가장 큰 글씨 · 공유하기(보내기 창 · 없으면 글 복사)
//      투자 성향 요약 넷(따로 셈한 0 ~ 100) · 현재 심리 상태(10번 답) · 「내 분석 자세히 보기 ›」 · 인사 줄 · 감정 상태 체크 · 투자 일지(아래 기록) · 나의 성장 리포트(#/why/later) · 기록 알림 · 다시 하기
//      종목 이름 · 두 줄 요약 · 준비 점수 · 빨간 수 · 쉬어 가는 까닭 줄 · 큰 막대는 없음 · [5] 6 4번 「거의 다·빌린 돈」 · 9번 「곧」 = 점수와 상관없이 쉬어 감(유형 · 한 줄)
//      [2] 7 결과가 처음 보인 뒤 NX.kakao.offer('journal') 한 번(다시 하기 · 목록 다시 그림 · 다른 화면 갔다 옴 · 두 번째로 끝냄에도 더 안 부름) · NX.kakao 가 없거나 offer 가 없어도 화면 오류 0
//      [5] 7 todayResult() = {at, code, verdict: go · wait · rest, ready, of: 22}(오늘 서울 날짜 가장 새 기록) · 오늘 기록 없으면 null · doneOnce() 그대로
//   ④ 상세 분석(그림 5 · 6) — ← 「결과로」 · 탭 넷 한 줄(켜진 탭 하나) · 종합 분석(카드 둘 · 강점 = 초록 답 · 주의할 점 = 빨간 답 · 단정) · 심리 분석(7 · 8 · 10번) · 매매 습관(나머지 여덟)
//      (색 점 = 고른 답 색 + 읽어 주는 글 · 한마디) · 맞춤 가이드(머리 글 「맞춤 가이드」 · 셋 · 「나만의 투자 체크리스트 받기」 = 글 복사)
//   ⑤ 기록 — 끝낼 때 한 번 · 꼴 그대로(why · promise 는 null) · 목록 「준비 n / 22」 · 판정 글은 원래 글(물음표 없음) · 지우는 단추 없음
//      [5] 8 한 달(장 스무 번) 지난 기록 = 「그날 정한 대로 했어?」 + 단추 둘(했어 · 안 했어) 먼저 · 값 0 → 누르면 값 · 답은 그 기록에 kept 로 남음(기록 수 그대로 · 다시 열어도 값)
//      [5] 9 값 = 시작 날 종가 → 스무 번째 장 날 종가(날짜 박음) · 같은 때 코스피 · 같은 때 모든 회사 가운데 값 · 못 찾으면 「?」(회사 파일 · 지수 줄 · 가운데 값 파일 못 받음)
//   ⑥ whyCard(G, {code, onDone}) — 처음부터 정한 종목(기록에만) · 결과를 그린 뒤 onDone 한 번 · 매매일지 고리 · 투자 일지(아래 기록이 없으면 #/why/later) · meRecords() · doneOnce() · todayResult()
//   ⑦ 기억 못 하는 기계(localStorage 막힘 · 쓰기만 막힘) · 고도리 칸 자료 못 받음 · 망가진 줄 · 첫 화면 칸(있을 때만) — 끝까지 되고 화면 오류 0
//   ⑧ 모양 — 옆으로 넘침 0 · 칸 밖 0 · 누르는 자리 44px 넘게 · 글 17px 넘게 · [10] 한 화면 글씨 크기 여섯 가지까지 · [10] 7 매매일지 화면 글 시작 왼쪽 줄 셋까지(measure_type 잣대) · 캔버스 0 · 쓰지 않을 말 0 · 옛 이름 0
//      [9] 8 칠한 색 점마다 읽어 주는 글(좋음 · 주의 · 위험) · 누르는 모양(손가락 커서)은 모두 button · a · 입력 칸 · [10] p-why.css 글씨 크기 = var(--fs-n) 만 · 간격 = 0 · var(--sp-n) 만
//   ⑨ 걸린 때 · 누름 — 시작하기 → 열한 질문(답 + 다음으로) → 결과 · 누름 = 시작 1 + 답 11 + 다음 11 · 1분 안
//   ⑩ 2026-10-22 총정리 가운데 남은 것: B8 날짜 칸 화면 안 · B15 방금 끝낸 첫 줄 접기 · B17 + B18 맨 위 「한 달 전 약속」(모든 기록 · 가장 오래된 것부터 · 같은 keep) · B20 달력 서른 날이면 물음(값은 자료가 오면)
//      (B5 고르기 장 첫 줄 · B6 「‹ 종목 바꾸기」 · B7 앞 답 이름표 · B9 부제 · B12 · B13 · B14 는 order-1011 로 그 칸이 없어져 뺌 — 사장님 2026-10-28 10:11 「어 그렇게 해」)
//   실패가 하나라도 있으면 끝 코드 1(결과 파일은 --out 을 줄 때만)
import fs from 'node:fs/promises';
import path from 'node:path';
import {createRequire} from 'node:module';
import {fileURLToPath} from 'node:url';
import {NEW_NAME, SAFE_LINE, TITLE_TAIL, OLD_NAME_RE} from './rename.mjs'; // 이름 = site/next/brand.js 한 곳(규칙 76) — 글자를 박지 않음
import {screenHits, WHY_OK} from '../../../site/next/words.js'; // 쓰지 않을 말 — 화면 글 셈(「사라지다」 같은 보통 말은 빼고 봄) · WHY_OK = 「왜 사?」 칸(section.wy) 안에서만 허락한 말(사장님 2026-10-28 10:11 「어 그렇게 해」 order-1011.txt 2)
import {fetchJSON} from './net.mjs'; // 회사 파일 2,557개 — 망 탈 · 실제 사이트 403(넷리파이가 잠깐 막음)은 기다렸다 다시 · 막힘이 5분 넘게 이어지면 그만(2026-10-20 실제 사이트 큰 시험 why 「못 받은 회사 파일 6개」)
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
/** 보이는 판정 글 — 사장님 2026-10-28 10:11 「어 그렇게 해」(docs/design/why-mock-2026-10-28/order-1011.txt 5 「~예요」 단정)로 사장님 판정 글 그대로
 *  (옛 2026-10-19 02:03 [화면] 4 물음 꼴 「… 할까?」는 이 칸에서 풂) · 기록 값(V_OK · V_HALF · V_REST) · V_CODE · todayResult · stop_rest 셈은 그대로 맞댐 */
const vShow = v => String(v ?? '?');
const TONE = {g: '좋음', y: '주의', r: '위험'}; // [9] 8 색 점의 읽어 주는 글(사장님 예 「위험」 · 잣대 accept/S1c.md)
/* 기준 ④ — 2026-10-28 그림 그대로 판(사장님 09:46 「360가지 분석해 먼저」 · 10:11 「어 그렇게 해」 — docs/design/why-mock-2026-10-28/order-1011.txt · brief.md) — 이 검사가 맞대는 새 꼴의 글 · 셈(brief 에 글자 그대로 있는지 먼저 봄)
   바뀌면 이 검사의 셈도 고칠 것 · 그림 말투 질문 · 안내 · 풀이(why-look.js LOOK)는 화면 글이라 쪽에서 읽어 제자리만 맞댐 */
const TYPE = {go: {name: '신중한 준비형 투자자', q: '내 이유로 따져 보고, 정해 둔 대로 움직이는 편이에요.'}, wait: {name: '반쯤 준비된 투자자', q: '이유는 있지만, 가끔 마음이 앞설 때가 있어요.'},
  rest: {name: '오늘은 쉬어 갈 투자자', q: '준비가 덜 된 곳이 많아요. 오늘은 하루 쉬어 가요.', stopQ: '빌린 돈이나 곧 쓸 돈이라면, 오늘은 쉬어 가는 게 좋아요.'}}; // 판정 → 유형 이름 · 따옴표 한 줄(쉬어 가는 답이면 stopQ)
const START_H = '나의 투자 성향,지금은 어떤 상태일까?', START_SUB = '투자 심리와 실제 매매 습관을 함께 분석해나에게 맞는 투자 가이드를 드려요.'; // 줄바꿈(<br>)은 글이 없어 붙어 읽힘
const START_HL = ['11개의 질문으로 간단하게', '투자 심리 + 실제 매매 습관 분석', '나에게 맞는 행동 가이드 제공'], START_TIME = '약 2분 소요 · 기록은 이 기기에만 남아요';
const MIND = ['안정', '초조', '불안']; // 10번 「마음은?」 답 차례(차분 · 놓칠까 급함 · 본전 생각) → 현재 심리 상태
const MOODS = [['calm', '안정'], ['soso', '보통'], ['worry', '불안'], ['rush', '초조']]; // 감정 상태 체크 얼굴 넷(그림 7)
const DET_TABS = [['all', '종합 분석'], ['mind', '심리 분석'], ['habit', '매매 습관'], ['guide', '맞춤 가이드']]; // 상세 분석 탭 넷(그림 5 · 6)
/** 성향 넷(brief ③ tendOf) — 답 점수 g = 2 · y = 1 · r = 0 · 뒤집음 = 2 − 점수 · 평균 = 합 ÷ (2 × 수) × 100 반올림 · 질문 자리(0부터) */
const TEND = [['신중함', [1, 2, 6, 7], false], ['감정적 매매', [0, 4, 9], true], ['위험 선호도', [3, 5, 10], true], ['장기 투자 성향', [8, 2], false]];
{
  const B4 = await fs.readFile(path.join(ROOT, 'docs/design/why-mock-2026-10-28/brief.md'), 'utf8').catch(() => '');
  const O4 = await fs.readFile(path.join(ROOT, 'docs/design/why-mock-2026-10-28/order-1011.txt'), 'utf8').catch(() => '');
  if (!B4.trim() || !O4.trim()) fail('기준 파일을 못 읽음', 'docs/design/why-mock-2026-10-28/brief.md · order-1011.txt(사장님 원문) — 저장소에 함께 올릴 것');
  else {
    if (!O4.includes('「어 그렇게 해」')) fail('기준 글이 바뀜(order-1011.txt — 이 검사의 셈을 고칠 것)', '「어 그렇게 해」');
    for (const t of [`go(「${V_OK}」) → 「${TYPE.go.name}」 · 「“${TYPE.go.q}”」`, `wait(「${V_HALF}」) → 「${TYPE.wait.name}」 · 「“${TYPE.wait.q}”」`,
      `rest(「${V_REST}」) → 「${TYPE.rest.name}」 · 쉬어 가는 답을 골랐으면 「“${TYPE.rest.stopQ}”」 · 아니면 「“${TYPE.rest.q}”」`,
      '「나의 투자 성향,」<br><em>지금은</em>「 어떤 상태일까?」', '「투자 심리와 실제 매매 습관을 함께 분석해」<br>「나에게 맞는 투자 가이드를 드려요.」', START_HL.map(x => `「${x}」`).join(' · '), '「시작하기 ›」', `「${START_TIME}」`,
      '「다음으로 ›」', '「‹ 이전」 + 「결과 보기 ›」', '「답을 하나 골라 줘.」', '「그 일이 언제인지 날짜를 적어 줘.」', '「오늘이나 그 뒤 날짜를 적어 줘.」', '「왜 이런 질문을 하나요?」(11번은 「이런 점을 확인해요」)',
      '「투자 성향 요약」', '「현재 심리 상태」', `p.wy-mv(${MIND.join(' · ')})`, '「내 분석 자세히 보기 ›」', '「오늘도 좋은 투자 하세요!」', '「감정 상태 체크」 · 「지금 내 투자 심리는 어떤가요?」', `(${MOODS.map(x => x[1]).join(' · ')})`,
      '「투자 일지」 · 「오늘의 매매를 기록해보세요.」', '「나의 성장 리포트」 · 「한 달 후 다시 점검해보세요.」', DET_TABS.map(([, t]) => `「${t}」`).join(' · '), '「1. 나의 투자 심리」', '「2. 나의 매매 습관」', '「지금 나에게 필요한 3가지」', '「나만의 투자 체크리스트 받기」',
      '신중함 = 평균([1, 2, 6, 7]) · 감정적 매매 = 평균([0, 4, 9] 뒤집음) · 위험 선호도 = 평균([3, 5, 10] 뒤집음) · 장기 투자 성향 = 평균([8, 2])'])
      if (!B4.includes(t)) fail('기준 글이 바뀜(why-mock brief.md — 이 검사의 셈을 고칠 것)', t);
  }
}
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
// 길 열하나 — [이름, 색 열한 글자, 기대 점수, 기대 판정, 할 일](사장님 2026-10-28 10:11 「어 그렇게 해」 order-1011 — 종목 고르는 법 · 두 줄 쓰는 법은 그 칸이 없어져 뺌)
//   empty = 1번에서 답 없이 「다음으로 ›」(막고 알림 · 누름 셈 밖) · first = 1번을 고르고 ← 로 시작 화면 → 「시작하기 ›」(고른 답 남음) · date = 'bad'(날짜 없이 · 지난 날 먼저)
//   big3 = 'switch'(3번을 「클 일」 + 날짜로 골랐다가 바꿈) · back = ← 단추 시험(2번을 이 답으로 먼저 고름 · 4번에서 두 번 뒤로) · last = 11번 「‹ 이전」 · stock = 'cx'(#/why/<그날 값 파일을 못 받는 회사>)
const PATHS = [
  ['모두 초록', 'ggggggggggg', 0, V_OK, {empty: true}],
  ['빨강 넷 · 합 12 밑', 'rrrrggggggg', 8, V_REST],
  ['노랑 여섯 · 합 6', 'yyyyyyggggg', 6, V_HALF, {date: 'bad', stock: 'cx'}],
  ['빨강 셋 · 합 6', 'ggggrgrggRg', 6, V_HALF],
  ['합 5', 'gygygygyygg', 5, V_OK, {last: true}],
  ['9번 곧 · 빨강 셋 노랑 다섯 · 합 11', 'yyryyyggrRg', 11, V_REST],
  ['빨강 셋 노랑 여섯 · 합 12', 'ryyyyryyggr', 12, V_REST],
  ['섞음 · 뒤로 단추', 'rygyrgyrgRy', 12, V_REST, {back: 'g', big3: 'switch', first: true, last: true}],
  ['모두 빨강', 'rrrrrrrrrrr', 22, V_REST, {empty: true}],
  ['쉬어 가자 4번 · 합 2', 'gggrggggggg', 2, V_REST],
  ['쉬어 가자 9번 · 합 2', 'ggggggggrgg', 2, V_REST],
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
ST.cx = {...ST.cx, price: null, day: null}; // 판 A 에서 이 회사 파일을 못 받게 함(#/why/<번호>로 엶) → 기록 그날 값 · 날짜 null · 한 달 뒤 회사 값 「?」
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
  const out = []; let i = 0, miss = 0; const missWhy = []; // 못 받은 회사 · 까닭(실패 글에 앞 여섯)
  // 실제 사이트에서는 4개씩 · 못 받으면 쉬었다 두 번 더(2026-10-18 — 24개씩 2,557개를 한꺼번에 받으면 실제 사이트가 이 기계를 한동안 막아 뒤 판의 쪽 열기가 33초 넘게 멈추고 · 못 받은 회사 때문에 가운데 값이 다르게 셈됨)
  const CONC = LIVE_SITE ? 4 : 24, getCo = async c => { try { return await fetchJSON(base + '/atlas/data/co/' + c + '.json', 'co/' + c + '.json'); } catch (e) { missWhy.push(c + ' ' + String(e?.message ?? e).replace(/^co\/\S+ /, '').slice(0, 40)); return null; } }; // net.mjs — 끊김 · 429 · 5xx · 실제 사이트 403 은 1 · 2 · 4 … 30초 기다렸다 다시(2분 30초 안) · 404 는 바로
  await Promise.all(Array.from({length: CONC}, async () => { while (i < codes.length) { const c = codes[i++], j = await getCo(c); if (Array.isArray(j?.close)) out.push({close: j.close, k0: Number.isInteger(j.k0) ? j.k0 : 0}); else { miss++; if (j) missWhy.push(c + ' close 없음'); } } }));
  ALLCO = {series: out.filter(s => s.k0 >= 0 && s.k0 + s.close.length <= DD.length), codes: codes.length, miss, missWhy}; return ALLCO;
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
  if (!row || row[1] !== DD[k + LATER] || Math.abs(row[2] - mine.m) > 0.0051 || row[3] !== mine.n) fail('[5] 9 가운데 값 파일이 따로 셈과 다름(median20.mjs)', `${DD[k]} → ${DD[k + LATER]} 파일 ${JSON.stringify(row)} · 따로 셈 ${mine.m.toFixed(3)} · ${mine.n}곳 · 못 받은 회사 파일 ${A.miss}개${A.missWhy?.length ? ' (' + A.missWhy.slice(0, 6).join(' · ') + ')' : ''}`);
  else { bump('[5] 9 가운데 값 따로 셈 맞댄 줄'); accept.median = {coFiles: A.codes, coMissing: A.miss, rowsChecked: MEDV.size, fileRows: MEDF.M.rows.length}; }
}
/** 기록 하나 → 한 달 칸 기대(없으면 null = 아직) · home = 그 화면이 받는 지수 줄 · medOk = 가운데 값 파일을 받는 판 · coOk = 회사 파일을 받는 판(막은 파일 빼고) */
async function laterWant(x, {home, medOk = true, blocked = []} = {}) {
  const W = winOf(x);
  if (!W) { // B20(2026-10-22 총정리) — 장 스무 번은 아직이어도 달력으로 서른 날이 지났으면 물음 · 값은 「? 값은 자료가 오면 붙여요(지금 <날짜 줄 끝>까지 받음)」
    const cal = Number.isFinite(Date.parse(x.at)) && (Date.now() - Date.parse(x.at)) / 864e5 >= 30;
    return cal ? {W: null, lines: [], q: 1, wait: `? 값은 자료가 오면 붙여요(지금 ${mdTxt(DD[DD.length - 1])}까지 받음)`} : null;
  }
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
const modCall = (p, fn) => p.evaluate(async f => { const W = await import('/next/p-why.js'); return f === 'done' ? W.doneOnce() : f === 'today' ? W.todayResult() : f === 'me' ? (() => { const e = W.meRecords(); return {h: e.querySelector('h2')?.textContent ?? '', rows: e.querySelectorAll('.wy-rec').length, btn: e.querySelectorAll('button:not(.wy-kb):not([data-kk]), input, select, textarea, [role="button"]').length}; })() : null; }, fn);

/* 화면에서 읽기(화면 안에서 돎 — 바깥 것을 쓰지 않음) · 색 = 칠한 배경(투명이 아니면 칠함) · sr = 점 안 읽어 주는 글 — 꼴은 docs/design/why-mock-2026-10-28/brief.md 「화면 꼴」 */
const READS = sel => { // ⓪ 시작 화면(그림 1)
  const s = document.querySelector(sel); if (!s) return null;
  const hero = s.querySelector(':scope > .wy-hero'), up = hero?.querySelector('.wy-up'), sc = hero?.querySelector('.wy-scene');
  return {step: s.dataset.step ?? null, label: s.getAttribute('aria-label'), up: up ? {tag: up.tagName, href: up.getAttribute('href'), label: up.getAttribute('aria-label')} : null,
    h: hero?.querySelector('h2.wy-h')?.textContent ?? null, em: hero?.querySelector('h2.wy-h em')?.textContent ?? null, sub: hero?.querySelector('.wy-sub')?.textContent ?? null,
    scene: !!sc && sc.getAttribute('aria-hidden') === 'true', sceneImg: sc?.querySelector('img')?.getAttribute('src') ?? null, hl: [...(hero?.querySelectorAll('.wy-hl > li') ?? [])].map(li => li.textContent),
    go: s.querySelector(':scope > button.wy-go')?.textContent ?? null, time: s.querySelector(':scope > .wy-time')?.textContent ?? null,
    find: !!s.querySelector('.wy-find, input[type="search"]'), stk: !!s.querySelector('.wy-stk'), err: s.querySelector('.wy-err')?.textContent ?? null, opts: s.querySelectorAll('.wy-opt').length, text: s.textContent};
};
const READQ = sel => { // ① 질문 한 화면(그림 2 · 3)
  const s = document.querySelector(sel); if (!s) return null;
  const painted = e => { if (!e) return false; const c = getComputedStyle(e).backgroundColor; return !(c === 'transparent' || /^rgba\(.*,\s*0\)$/.test(c)); };
  const opts = [...s.querySelectorAll('.wy-opts .wy-opt')].map(b => ({t: b.querySelector('.wy-ot')?.textContent ?? '', sub: b.querySelector('.wy-os')?.textContent ?? null, radio: b.querySelector('.wy-radio')?.getAttribute('aria-hidden') === 'true',
    dots: b.querySelectorAll('.wy-dot').length, painted: [...b.querySelectorAll('.wy-dot')].some(painted), pressed: b.getAttribute('aria-pressed'), on: b.classList.contains('on'), tag: b.tagName}));
  const pg = s.querySelector(':scope > .wy-pg'), up = pg?.querySelector('.wy-up'), why = s.querySelector(':scope > .wy-whyq'), d = s.querySelector('.wy-date'), a = document.activeElement;
  const nv = s.querySelector(':scope > .wy-nav'), first = s.querySelector('.wy-opts > :first-child')?.getBoundingClientRect(), last = s.querySelector('.wy-opts > :last-child')?.getBoundingClientRect();
  const bar = document.querySelector('nav.tabs')?.getBoundingClientRect(), top = document.querySelector('header.top')?.getBoundingClientRect(), pos = nv ? getComputedStyle(nv).position : '';
  const barTop = Math.min(bar ? bar.top : innerHeight, innerHeight, nv && (pos === 'fixed' || pos === 'sticky') ? nv.getBoundingClientRect().top : Infinity); // 붙어 있는 「다음으로」 줄도 아래 막대로 봄
  const dr = d?.getBoundingClientRect();
  return {step: s.dataset.step ?? null, n: pg?.querySelector('.wy-step')?.textContent ?? null, up: up ? {tag: up.tagName, label: up.getAttribute('aria-label')} : null, prog: pg?.querySelector('.wy-prog > i')?.style.width ?? null,
    q: s.querySelector(':scope > h3.wy-q')?.textContent ?? null, hint: s.querySelector(':scope > .wy-hint')?.textContent ?? null, group: s.querySelector('.wy-opts')?.getAttribute('aria-label') ?? null, opts,
    whyK: why?.querySelector('.wy-whyk b')?.textContent ?? null, whyT: why?.querySelector('.wy-whyt')?.textContent ?? null, sayK: why?.querySelector('.wy-sayk')?.textContent ?? null, say: why?.querySelector('.wy-say q[data-proper]')?.textContent ?? null,
    nav: nv ? [...nv.children].map(b => [b.tagName, String(b.className).split(' ')[0], b.textContent]) : null,
    date: d ? {v: d.value, min: d.min, type: d.type, label: d.closest('label')?.textContent ?? '', top: Math.round(dr.top), bottom: Math.round(dr.bottom)} : null,
    err: s.querySelector('.wy-err')?.textContent ?? null, errRole: s.querySelector('.wy-err')?.getAttribute('role') ?? null, live: s.querySelector('.wy-live')?.textContent ?? '', focus: a && s.contains(a) ? String(a.className) : '',
    prev: !!s.querySelector('.wy-prev'), one: !!s.querySelector('.wy-one'), stk: !!s.querySelector('.wy-stk'), find: !!s.querySelector('.wy-find'), sub: !!s.querySelector('.wy-sub'), res: !!s.querySelector('.wy-res'),
    seen: first && last ? {top: Math.round(first.top), bottom: Math.round(last.bottom), barTop: Math.round(barTop), topBottom: Math.round(top ? Math.max(0, top.bottom) : 0)} : null};
};
const READR = sel => { // ③ 결과(그림 4 · 7)
  const s = document.querySelector(sel), r = s?.querySelector(':scope > .wy-res'); if (!r) return null;
  const head = r.querySelector(':scope > .wy-rhead'), sheet = r.querySelector(':scope > .wy-sheet'), vp = head?.querySelector('p.wy-verdict'), vb = vp?.querySelector('b');
  const own = e => [...e.childNodes].some(n => n.nodeType === 3 && n.textContent.trim());
  const shown = e => { const b = e.getBoundingClientRect(), cs = getComputedStyle(e); return b.width >= 2 && b.height >= 2 && cs.visibility !== 'hidden' && cs.display !== 'none'; };
  const texts = root => [...root.querySelectorAll('*')].filter(e => own(e) && shown(e) && !e.closest('.wy-live, .wy-sr')).map(e => ({fs: parseFloat(getComputedStyle(e).fontSize), v: !!vb && (e === vb || vb.contains(e)), t: e.textContent.trim().slice(0, 20)}));
  const inCard = texts(s), inView = texts(s.classList.contains('page') ? document.querySelector('#view') ?? s : s); // 매매일지 화면은 화면 전체 · 다른 화면에 붙인 칸(첫 화면 · 보내기 쪽)은 그 칸 안
  const big = xs => xs.filter(x => !x.v).sort((a, b) => b.fs - a.fs)[0] ?? null;
  const rowOf = e => (e ? {tag: e.tagName, href: e.getAttribute('href'), t: e.querySelector('.wy-rowt b')?.textContent ?? null, s: e.querySelector('.wy-rowt small')?.textContent ?? null} : null);
  const order = ['.wy-tend', '.wy-mind', 'button.wy-detb', '.wy-hi', '.wy-moodc', '.wy-row[data-go="log"]', 'a.wy-row[href="#/why/later"]', ':scope > p.wy-note', ':scope > .wy-nav'].map(q => sheet?.querySelector(q) ?? null);
  const inOrder = order.every(Boolean) && order.every((e, i) => i === 0 || !!(order[i - 1].compareDocumentPosition(e) & Node.DOCUMENT_POSITION_FOLLOWING));
  const m = sheet?.querySelector('.wy-mind'), hi = sheet?.querySelector('.wy-hi'), mc = sheet?.querySelector('.wy-moodc'), lk = sheet?.querySelector(':scope > .wy-nav a.wy-link');
  return {step: s.dataset.step ?? null, kids: [...r.children].map(e => String(e.className).split(' ')[0]), share: head?.querySelector('button.wy-share')?.textContent.trim() ?? null,
    v: vp?.dataset.v ?? null, vk: vp?.querySelector('.wy-vk')?.textContent ?? null, vt: vb?.querySelector('.wy-vt')?.textContent ?? null, ve: vb?.querySelector('.wy-ve')?.textContent ?? null, vb: vb?.textContent ?? null,
    type: head?.querySelector('p.wy-type')?.textContent ?? null, scene: head?.querySelector('.wy-scene.res')?.getAttribute('aria-hidden') === 'true',
    vfs: vb ? parseFloat(getComputedStyle(vb).fontSize) : 0, bigCard: big(inCard), bigView: big(inView), sizes: [...new Set(inView.map(x => x.fs))].sort((a, b) => a - b),
    tendK: sheet?.querySelector('.wy-tend .wy-ck')?.textContent ?? null,
    tend: [...(sheet?.querySelectorAll('.wy-tend .wy-trow') ?? [])].map(row => { const f = row.querySelector('.wy-tt2 > i.wy-tf'), t = row.querySelector('.wy-tt2'); return {n: row.querySelector('.wy-tn')?.textContent ?? '', v: row.querySelector('b.num')?.textContent ?? '', w: f?.style.width ?? '', fw: f ? f.getBoundingClientRect().width : -1, tw: t ? t.getBoundingClientRect().width : -1, hid: t?.getAttribute('aria-hidden') ?? null}; }),
    mind: m ? {k: m.querySelector('.wy-ck')?.textContent ?? null, v: m.querySelector('.wy-mv')?.textContent ?? null, t: m.querySelector('.wy-mt')?.textContent ?? null, face: !!m.querySelector('.wy-mi svg')} : null,
    detb: sheet?.querySelector('button.wy-detb')?.textContent ?? null, hi: hi ? {src: hi.querySelector('img')?.getAttribute('src') ?? null, t: hi.querySelector('p')?.textContent ?? null} : null,
    moodK: mc?.querySelector('.wy-ck')?.textContent ?? null, moodQ: mc?.querySelector('.wy-mq')?.textContent ?? null, moods: [...(mc?.querySelectorAll('button.wy-mood') ?? [])].map(b => [b.dataset.m ?? null, b.textContent.trim(), b.getAttribute('aria-pressed')]), said: !!mc?.querySelector('.wy-said'),
    log: rowOf(sheet?.querySelector('.wy-row[data-go="log"]')), rep: rowOf(sheet?.querySelector('a.wy-row[href]')), inOrder,
    notes: [...(sheet?.querySelectorAll(':scope > p.wy-note') ?? [])].map(x => x.textContent), btns: [...(sheet?.querySelectorAll(':scope > .wy-nav button') ?? [])].map(x => [String(x.className).split(' ')[0], x.textContent]),
    link: lk?.getAttribute('href') ?? null, linkT: lk?.textContent ?? null,
    gone: Object.fromEntries([['준비 점수', '.wy-score'], ['빨간 수', '.wy-reds'], ['쉬어 가는 까닭 줄', '.wy-stop'], ['한 번 더 볼 답', '.wy-look'], ['준비 큰 막대', '.wy-tt, .wy-ttw'], ['준비 묶음 막대', '.wy-bars'], ['두 줄 요약', '.wy-lines'], ['종목 줄', '.wy-stk']].map(([k, q]) => [k, !!s.querySelector(q)])),
    q: s.querySelectorAll('.wy-q, .wy-opt, .wy-find, .wy-why').length, live: s.querySelector('.wy-live')?.textContent ?? '', text: s.textContent};
};
const READD = sel => { // ④ 상세 분석(그림 5 · 6)
  const s = document.querySelector(sel); if (!s) return null;
  const tone = e => (/\bwy-([gyr])\b/.exec(typeof e?.className === 'string' ? e.className : '') || [])[1] ?? null;
  const painted = e => { if (!e) return false; const c = getComputedStyle(e).backgroundColor; return !(c === 'transparent' || /^rgba\(.*,\s*0\)$/.test(c)); };
  const top = s.querySelector(':scope > .wy-dtop'), tabs = s.querySelector(':scope > .wy-tabs'), body = s.querySelector(':scope > .wy-dbody'), up = top?.querySelector('.wy-up');
  const pc = c => { const x = body?.querySelector('.wy-pc.' + c); return x ? {k: x.querySelector('.wy-pk b')?.textContent ?? null, items: [...x.querySelectorAll('ul > li')].map(li => li.textContent), empty: x.querySelector('.wy-pe')?.textContent ?? null} : null; };
  return {step: s.dataset.step ?? null, up: up ? {tag: up.tagName, label: up.getAttribute('aria-label')} : null, title: top?.querySelector('h3.wy-dtitle')?.textContent ?? null,
    tabsRole: tabs?.getAttribute('role') ?? null, tabs: [...(tabs?.querySelectorAll('button.wy-tab') ?? [])].map(b => [b.dataset.k ?? null, b.textContent, b.getAttribute('role'), b.getAttribute('aria-selected')]),
    panel: body?.getAttribute('role') ?? null, dcards: [...(body?.querySelectorAll('.wy-dcard') ?? [])].map(c => ({ic: String(c.querySelector('.wy-dci')?.className ?? ''), h: c.querySelector('h4.wy-dh')?.textContent ?? null, p: c.querySelector('.wy-dp')?.textContent ?? null})),
    good: pc('good'), warn: pc('warn'),
    rows: [...(body?.querySelectorAll('ul.wy-dl2 > li.wy-dr') ?? [])].map(li => { const d = li.querySelector('.wy-dot'); return {c: tone(d), paint: painted(d), sr: d?.querySelector('.wy-sr')?.textContent ?? null, q: li.querySelector('.wy-drq')?.textContent ?? null, one: li.querySelector('.wy-dro')?.textContent ?? null}; }),
    gh: body?.querySelector('h4.wy-gh')?.textContent ?? null, gl: [...(body?.querySelectorAll('ol.wy-gl > li') ?? [])].map(li => ({n: li.querySelector('.wy-gn')?.textContent ?? null, t: li.querySelector('.wy-gt')?.textContent ?? null, d: li.querySelector('.wy-gd')?.textContent ?? null})),
    copy: body?.querySelector('button.wy-copy')?.textContent.trim() ?? null, text: s.textContent};
};
/** 매매일지 쪽 꼴(brief 「쪽 꼴」 · ② 끝) — h1 은 눈에 안 보이게 남김 · 질문 · 상세 분석 장은 아래 칸 숨김 · 시작 · 결과 장은 보임 */
const READPG = () => {
  const v = document.querySelector('#view'), h1 = v?.querySelector(':scope > h1'), s = v?.querySelector(':scope > section.wy.page');
  const shown = e => { const cs = getComputedStyle(e), r = e.getBoundingClientRect(); return cs.display !== 'none' && cs.visibility !== 'hidden' && r.width > 1 && r.height > 1; };
  const hr = h1?.getBoundingClientRect(), hcs = h1 ? getComputedStyle(h1) : null;
  return {step: s?.dataset.step ?? null, h1: h1 ? {t: h1.textContent, none: hcs.display === 'none' || hcs.visibility === 'hidden', w: Math.round(hr.width), h: Math.round(hr.height)} : null,
    sib: [...(v?.children ?? [])].filter(e => e !== h1 && e !== s && !e.hidden).map(e => [String(e.className).split(' ')[0] || e.tagName.toLowerCase(), shown(e)])};
};
const READLIST = () => {
  const s = document.querySelector('#view section.wy-me'); if (!s) return null;
  return {h: s.querySelector('h2')?.textContent ?? '', rows: [...s.querySelectorAll('.wy-rec')].map(r => {
    const L = r.querySelector('.wy-later');
    return {day: r.querySelector('.wy-rh b')?.textContent ?? '', rest: [...r.querySelectorAll('.wy-rh span')].map(x => x.textContent).join(''),
      stk: r.querySelector('.wy-rs')?.textContent ?? null, stkName: r.querySelector('.wy-rs .wy-stn[data-proper]')?.textContent ?? null,
      bars: [...r.querySelectorAll('.wy-bar b.num')].map(x => x.textContent), lines: [...r.querySelectorAll('.wy-lines p')].map(x => x.textContent), mine: r.querySelector('.wy-lines q.wy-mine[data-proper]')?.textContent ?? null,
      later: L ? {note: [...L.querySelectorAll(':scope > p.note')].map(x => x.textContent).join(' | '), kq: L.querySelector('.wy-kq')?.textContent ?? null, kb: [...L.querySelectorAll('button')].map(b => b.tagName + ':' + b.textContent),
        kd: L.querySelector('.wy-kd')?.textContent ?? null, lv: [...L.querySelectorAll('.wy-lv')].map(x => x.textContent), busy: /셈하는 중/.test(L.textContent), lvNote: [...L.querySelectorAll('.wy-lvs > p.note')].map(x => x.textContent).join(' | '),
        cls: [...L.querySelectorAll('.wy-lv b')].map(b => b.className)} : null};
  }), fold: (d => (d ? {sum: d.querySelector(':scope > summary')?.textContent ?? '', open: d.open, rec: !!d.querySelector('.wy-rec'), first: s.querySelector('.wy-rec')?.closest('details') === d} : null))(s.querySelector('details.wy-fold')),
  btn: [...s.querySelectorAll('button, [role="button"], input, select, textarea')].filter(x => !x.classList.contains('wy-kb') && !x.hasAttribute('data-kk')).map(x => x.textContent.trim() || x.getAttribute('aria-label') || x.tagName)}; // 카톡 단추(data-kk · 기록 줄 종목 보내기 — 명령문 [6] 1 · KB2)는 지우는 단추가 아니라 셈 밖(일꾼 KI)
};
/** 지우는 단추 — 화면 어디에도(누르는 것 가운데 「지우 · 지움 · 삭제」) */
const DELS = root => [...document.querySelectorAll(root + ' a, ' + root + ' button, ' + root + ' [role="button"]')].filter(e => /지우|지움|삭제/.test(e.textContent + ' ' + (e.getAttribute('aria-label') ?? ''))).map(e => e.textContent.trim());
/** 모양 — 옆으로 넘침 · 칸 밖 · 누르는 자리 · 글 크기(17px · 가짓수) · 캔버스 · [9] 8 칠한 점의 읽어 주는 글 · 손가락 커서는 button · a · 입력 칸만 · 쓰지 않을 말 · 옛 이름 */
const LAYOUT = sel => {
  const vw = document.documentElement.clientWidth, root = document.querySelector(sel);
  const out = {sw: document.documentElement.scrollWidth, vw, wide: [], small: [], tiny: [], sizes: [], canvas: 0, text: '', attrs: [], whyText: '', whyAttrs: [], missing: !root, dotNoSr: [], fakeBtn: []};
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
      if (el.closest('.wy-opt, .wy-hero, .wy-whyq, .wy-card, .wy-det, .wy-pg, .wy-dbody')) continue; // 그림 판(사장님 2026-10-27 22:09 · 22:16 「이시안 화법으로만들어줘」) — 그림이 글 왼쪽에 오는 상자(답 칸 · 시작 화면 · 풀이 칸 · 결과 칸 · 상세 분석 · 진행 줄)는 상자 하나로 봄(왼쪽 줄은 상자 테두리) · 상세 분석은 2026-10-28 order-1011 로 한 장(.wy-dbody)이 됨
      const b = blockOf(el); if (seenB.has(b)) continue; seenB.add(b);
      if (/center|right|end/.test(getComputedStyle(b).textAlign)) continue; const x = Math.round(rs[0].left); if (x >= 0 && x < vw && !xs.has(x)) xs.set(x, desc(b));
    }
    out.lefts = [...xs.keys()].sort((a, b) => a - b); out.leftEx = [...xs.values()]; out.journal = location.hash.startsWith('#/why');
  }
  for (const e of root.querySelectorAll('a[href], button, input, select, textarea, summary, [role="button"]')) { const r = e.getBoundingClientRect(); if (!r.width || !r.height) continue; if (r.height < 43.5 || r.width < 43.5) out.small.push(desc(e) + ' ' + Math.round(r.width) + '×' + Math.round(r.height)); }
  for (const e of root.querySelectorAll('section.wy [role="button"], section.wy [onclick], section.wy-me [role="button"], section.wy-me [onclick]')) out.fakeBtn.push(desc(e));
  out.canvas = root.querySelectorAll('canvas').length;
  // 쓰지 않을 말 셈 글 — 「왜 사?」 칸(section.wy) 안 글은 따로 모음(「매수」는 그 칸에서만 허락 · 사장님 2026-10-28 10:11 「어 그렇게 해」 order-1011.txt 2)
  const c = root.cloneNode(true); c.querySelectorAll('[data-proper]').forEach(x => x.remove());
  const attrsOf = el => { const xs = []; for (const e of [el, ...el.querySelectorAll('*')]) for (const a of ['aria-label', 'title', 'alt', 'placeholder']) { const v = e.getAttribute?.(a); if (v) xs.push(v); } return xs; };
  const whys = c.matches('section.wy') ? [c] : [...c.querySelectorAll('section.wy')];
  out.whyText = whys.map(e => e.textContent).join('\n'); out.whyAttrs = whys.flatMap(attrsOf);
  if (c.matches('section.wy')) { out.text = ''; out.attrs = []; } else { whys.forEach(e => e.remove()); out.text = c.textContent; out.attrs = attrsOf(c); }
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
  const T = s.text + '\n' + s.attrs.join('\n'), TW = (s.whyText ?? '') + '\n' + (s.whyAttrs ?? []).join('\n');
  for (const b of screenHits(T)) fail('쓰지 않을 말', `${tag} 「${b}」`);
  const hw = screenHits(TW); // 「왜 사?」 칸 — WHY_OK(「매수」)만 허락 · 다른 쓰지 않을 말은 그대로 막음(사장님 2026-10-28 10:11 「어 그렇게 해」 order-1011.txt 2)
  for (const b of hw.filter(w => !WHY_OK.includes(w))) fail('쓰지 않을 말(「왜 사?」 칸)', `${tag} 「${b}」`);
  if (hw.some(w => WHY_OK.includes(w))) bump('「왜 사?」 칸 「매수」(order-1011 2 허락)');
  const TA = T + '\n' + TW;
  if (/‹ 앞으로/.test(TA)) fail('[5] 4 「‹ 앞으로」 단추 글이 남음', tag);
  if (OLD_NAME_RE.test(TA)) fail('옛 이름 남음', `${tag} 「${(OLD_NAME_RE.exec(TA) || [])[0]}」`);
}

/* 그림 말투 글(why-look.js LOOK — 화면 글) — 화면이 제자리에 그렸는지 맞대려고 쪽에서 한 번 읽음(사장님 글이 아니라 셈 맞대기 아님 · brief ② 「LOOK[i].lead」) */
let LOOKC = null;
async function look(p) {
  if (LOOKC) return LOOKC;
  const L = await p.evaluate(async () => { const m = await import('/next/why-look.js'); return Array.isArray(m.LOOK) ? m.LOOK.map(x => ({lead: x.lead ?? null, hint: x.hint ?? null, why: x.why ?? null, sub: Array.isArray(x.sub) ? [...x.sub] : []})) : null; }).catch(() => null);
  if (!Array.isArray(L) || L.length !== QS.length || L.some(x => !x.lead || !x.why || x.sub.length !== 3)) { fail('그림 말투 글(why-look.js LOOK) 열한 칸을 못 읽음', JSON.stringify(L).slice(0, 160)); return null; }
  if (L[QS.length - 1].sub[0] !== '(서로 다른 업종에 분산 투자)') fail('11번 첫 답 괄호 풀이(brief ② 예 「(서로 다른 업종에 분산 투자)」)', `「${L[QS.length - 1].sub[0]}」`);
  LOOKC = L; return L;
}
const stepIs = (p, sel, st) => p.waitForFunction(([s, x]) => document.querySelector(s)?.dataset.step === x, [sel, st], {timeout: 15000});
const waitQ = (p, sel, n) => p.waitForFunction(([s, t]) => { const e = document.querySelector(s); return e?.dataset.step === 'q' && e.querySelector('.wy-pg .wy-step')?.textContent === t; }, [sel, `${n} / ${QS.length}`], {timeout: 15000});
/** 재지 않고 끝까지(시작하기 → 답 · 다음으로 열한 번 · 3번 「클 일」이면 날짜) — 정한 종목을 조용히 기억했는지 기록으로 볼 때 */
async function fastRun(p, sel, ks) {
  await p.locator(sel + ' .wy-go').click({timeout: 8000}); await waitQ(p, sel, 1);
  for (let qi = 0; qi < QS.length; qi++) {
    await p.locator(sel + ' .wy-opt').nth(ks[qi]).click({timeout: 8000});
    if (qi === BIG_Q && ks[qi] === BIG_A) await p.fill(sel + ' .wy-date', FUTURE);
    await p.locator(sel + ' .wy-nav .wy-next').click({timeout: 8000});
    if (qi < QS.length - 1) await waitQ(p, sel, qi + 2);
  }
  await stepIs(p, sel, 'res');
}
/** 매매일지 쪽 꼴(brief 「쪽 꼴」 · ② 끝) — h1 「매매일지」 눈에 안 보이게 남김 · 질문 · 상세 분석 장은 아래 칸 숨김 · 시작 · 결과 장은 기록 · 안전 문장이 보임 */
async function checkPage(p, tag) {
  const g = await p.evaluate(READPG), hide = g.step === 'q' || g.step === 'det';
  if (!g.h1 || g.h1.t !== '매매일지' || g.h1.none || g.h1.w > 2 || g.h1.h > 2) fail('h1 「매매일지」 — 눈에 안 보이게 · 읽기 프로그램용으로 남김(brief 쪽 꼴)', `${tag} ${JSON.stringify(g.h1)}`);
  const bad = g.sib.filter(([n, shown]) => (hide ? shown : ['wy-me', 'safe'].includes(n) && !shown));
  if (bad.length) fail(hide ? '질문 · 상세 분석 장에서 아래 칸을 숨김(brief ②)' : '시작 · 결과 장에서 아래 칸(기록 · 안전 문장)이 보임(brief ②)', `${tag} ${g.step} ${JSON.stringify(bad)}`); else bump('아래 칸 숨김 · 보임 맞음');
}

/* ⓪ 시작 화면 맞대기(그림 1 · 사장님 2026-10-28 10:11 「어 그렇게 해」 order-1011 6 — 종목 고르기 칸 없음) */
function checkStart(s, T, {page = true, st = null} = {}) {
  if (!s) { fail('시작 칸 없음', T); return; }
  if (s.step !== 'start') fail('맨 앞 = 시작 화면(그림 1 · order-1011 6 — 종목 고르기 없음)', `${T} 「${s.step}」`);
  if (s.label !== '친구야, 왜 사?') fail('칸 이름(aria-label 「친구야, 왜 사?」)', `${T} 「${s.label}」`);
  const sp = t => String(t ?? '').replace(/\s+/g, ''); // 줄바꿈 자리(<br> · 빈칸)는 모양 — 글만 맞댐
  if (sp(s.h) !== sp(START_H) || s.em !== '지금은') fail('시작 큰 제목 두 줄(「지금은」만 강조)', `${T} 「${s.h}」 「${s.em}」`);
  if (sp(s.sub) !== sp(START_SUB)) fail('시작 풀이 두 줄', `${T} 「${s.sub}」`);
  if (!eq(s.hl, START_HL)) fail('시작 세 줄', `${T} ${JSON.stringify(s.hl)}`);
  if (!s.scene || s.sceneImg !== '/media/makbi-hello.svg') fail('시작 장면 그림(aria-hidden · 둘이 그림)', `${T} ${s.scene} ${s.sceneImg}`);
  if (s.go !== '시작하기 ›' || s.time !== START_TIME) fail('「시작하기 ›」 · 「' + START_TIME + '」', `${T} 「${s.go}」 「${s.time}」`);
  if (page ? !(s.up?.tag === 'A' && s.up.href === '#/' && s.up.label === '첫 화면으로') : !!s.up) fail('시작 ← 「첫 화면으로」(매매일지 쪽만)', `${T} ${JSON.stringify(s.up)}`);
  if (s.find || s.stk || s.opts) fail('시작 화면에 종목 찾기 칸 · 종목 줄 · 답이 남음(order-1011 6)', `${T} 찾기 ${s.find} · 종목 줄 ${s.stk} · 답 ${s.opts}`);
  if (s.err) fail('시작 화면에 알림 글(없는 번호도 조용히 · order-1011 6)', `${T} 「${s.err}」`);
  if (st && s.text.includes(st.name)) fail('정한 종목 이름이 화면에 보임(order-1011 6 — 기록에만)', `${T} 「${st.name}」`);
  bump('맞댄 시작 화면');
}

/* ① 질문 한 화면 맞대기 — picked = 이 장에서 고른 답(아직이면 null) · err = 기대 알림 */
const ONE = QS.map(() => [new Map(), new Map(), new Map()]); // 질문마다 답마다 본 한마디(판마다 같은지)
const seeOne = (qi, k, t) => { const m = ONE[qi][k]; m.set(t, (m.get(t) || 0) + 1); };
function checkQ(s, qi, picked, T, LK, err = null) {
  const Q = QS[qi], L = LK?.[qi], at = `${T} ${qi + 1}번`;
  if (!s) { fail('질문 칸 없음', at); return; }
  if (s.step !== 'q' || s.res) fail('질문 장(data-step=q)', `${at} 「${s.step}」`);
  if (s.n !== `${qi + 1} / ${QS.length}`) fail('질문 차례 글 「n / 11」', `${at} 「${s.n}」`);
  if (s.prog !== Math.round((qi + 1) / QS.length * 100) + '%') fail('진행 막대 = n ÷ 11', `${at} ${s.prog}`);
  if (s.up?.tag !== 'BUTTON' || s.up.label !== (qi === 0 ? '처음으로' : '앞 질문')) fail('맨 위 ← 단추(1번 「처음으로」 · 그 뒤 「앞 질문」)', `${at} ${JSON.stringify(s.up)}`);
  if (L) {
    if (s.q !== L.lead) fail('큰 질문 = 그림 말투 질문(LOOK.lead · brief ②)', `${at} 「${s.q}」 ≠ 「${L.lead}」`);
    if ((s.hint ?? null) !== (L.hint ?? null)) fail('회색 안내 한 줄(있을 때만 · LOOK.hint)', `${at} 「${s.hint}」 ≠ 「${L.hint}」`);
    if (s.whyT !== L.why) fail('노란 칸 풀이(LOOK.why)', `${at} 「${s.whyT}」`);
  }
  if (s.group !== Q.q) fail('답 묶음 이름표 = 사장님 질문 글 그대로', `${at} 「${s.group}」 ≠ 「${Q.q}」`);
  if (s.opts.length !== 3) { fail('답 수', `${at} ${s.opts.length}`); return; }
  s.opts.forEach((o, k) => {
    if (o.t !== Q.a[k][1]) fail('답 글자(사장님 글 · 차례 그대로)', `${at} ${k + 1}째 「${o.t}」 ≠ 「${Q.a[k][1]}」`);
    if (o.tag !== 'BUTTON') fail('[9] 8 답은 단추', `${at} ${o.tag}`);
    if (L && o.sub !== L.sub[k]) fail('답 괄호 풀이(LOOK.sub)', `${at} 「${o.sub}」 ≠ 「${L.sub[k]}」`);
    if (o.sub != null && !/^\(.+\)$/.test(o.sub)) fail('답 풀이는 괄호 꼴(그림 3)', `${at} 「${o.sub}」`);
    if (!o.radio) fail('답 오른쪽 동그라미(span.wy-radio · 읽지 않음)', `${at} 「${o.t}」`);
    if (o.dots || o.painted) fail('질문 장에 초록 · 노랑 · 빨강 점(brief ② — 분홍 겹동그라미만 · order-1011 7)', `${at} 「${o.t}」 점 ${o.dots}`); else bump('질문 장 색 점 0');
    const want = picked === k;
    if (o.pressed !== String(want) || o.on !== want) fail('고른 답 표시(aria-pressed · .on — 답 누름 = 고르기만)', `${at} 「${o.t}」 aria-pressed=${o.pressed} on=${o.on} · 기대 ${want}`);
  });
  if (s.whyK !== (qi === QS.length - 1 ? '이런 점을 확인해요' : '왜 이런 질문을 하나요?')) fail('노란 칸 머리(11번은 「이런 점을 확인해요」)', `${at} 「${s.whyK}」`);
  if (s.sayK !== '격언 ' || s.say !== Q.say) fail('격언 — 노란 칸 맨 아래(사장님 글 · data-proper · order-1011 4)', `${at} 「${s.sayK}」「${s.say}」 ≠ 「${Q.say}」`);
  const wantNav = qi === QS.length - 1 ? [['BUTTON', 'wy-back', '‹ 이전'], ['BUTTON', 'wy-next', '결과 보기 ›']] : [['BUTTON', 'wy-next', '다음으로 ›']];
  if (!eq(s.nav, wantNav)) fail('아래 단추(1 ~ 10번 「다음으로 ›」 · 11번 「‹ 이전」 + 「결과 보기 ›」 · order-1011 3)', `${at} ${JSON.stringify(s.nav)}`);
  const big = qi === BIG_Q && picked === BIG_A;
  if (!!s.date !== big) fail('3번 「클 일이 있다」 날짜 칸([3] 3)', `${at} 날짜 칸 ${s.date ? '있음' : '없음'} · 답 ${picked}`);
  if (big && (s.date.type !== 'date' || !/언제/.test(s.date.label) || s.date.min !== isoIn(Date.now()))) fail('날짜 칸 꼴(가장 이른 날 = 오늘)', `${at} ${JSON.stringify(s.date)}`);
  if ((s.err ?? null) !== err || (err && s.errRole !== 'alert')) fail('알림 글(role=alert)', `${at} 「${s.err}」 ≠ 「${err}」`);
  if (s.prev || s.one) fail('앞 답 한마디 칸이 남음(order-1011 4 — 한마디는 읽어 주는 칸 · 상세 분석)', at);
  if (s.stk || s.find) fail('질문 장에 종목 줄 · 찾기 칸(order-1011 6)', at);
  if (s.sub) fail('질문 장에 칸 부제(시작 장에만)', at);
  bump('맞댄 질문 화면');
}
/** 답을 누른 뒤 — 같은 장(고르기만) · 읽어 주는 칸 「둘이: 한마디」 · 3번 「클 일」은 날짜 칸에 바로 씀 · 화면 안(B8) */
function checkPicked(s, qi, k, T) {
  const at = `${T} ${qi + 1}번 고른 뒤`, pre = NEW_NAME + ': ';
  if (s?.n !== `${qi + 1} / ${QS.length}`) fail('답 누름 = 고르기만(넘어가지 않음 · order-1011 3)', `${at} 「${s?.n}」`);
  const one = s?.live?.startsWith(pre) ? s.live.slice(pre.length) : null;
  if (!one || /[\n\r]/.test(one) || one.length > 60) fail('읽어 주는 칸(aria-live) 「' + NEW_NAME + ': 한마디」 한 줄(order-1011 4)', `${at} 「${s?.live}」`); else seeOne(qi, k, one);
  if (qi === BIG_Q && k === BIG_A) {
    if (!/날짜/.test(one ?? '')) fail('「클 일이 있다」 한마디가 날짜를 말함([3] 3)', `${at} 「${one}」`);
    if (!s.date?.v && !/wy-date/.test(s.focus)) fail('날짜 칸에 바로 씀', `${at} 지금 「${s.focus}」`);
    if (s.date && s.seen && (s.date.bottom > s.seen.barTop || s.date.top < s.seen.topBottom)) fail('B8 「클 일이 있다」 날짜 칸이 위 막대와 아래 줄 사이에 보임', `${at} 날짜 칸 ${s.date.top} ~ ${s.date.bottom} · 막대 ${s.seen.topBottom} ~ ${s.seen.barTop}`); else bump('B8 날짜 칸 화면 안');
  }
}
/** 다음 질문으로 온 뒤 — 답 셋이 위 막대와 아래 줄(아래 단추 · 붙어 있는 「다음으로」) 사이에 다 보임(옛 [5] 3 · B9 — 한 화면에 한 가지) */
function checkSeen(s, qi, T) {
  if (s?.seen && (s.seen.bottom > s.seen.barTop || s.seen.top < s.seen.topBottom)) fail('다음 질문의 답 셋이 위 막대와 아래 줄 사이에 다 보임(한 화면에 한 가지)', `${T} ${qi + 1}번 · 답 ${s.seen.top} ~ ${s.seen.bottom} · 막대 ${s.seen.topBottom} ~ ${s.seen.barTop}`); else bump('답 셋 화면 안');
}

/* ③ 결과 · ④ 상세 분석 맞대기 */
const tendOf = ks => TEND.map(([n, qs, inv]) => { let a = 0, m = 0; for (const q of qs) { const v = {g: 2, y: 1, r: 0}[QS[q].a[ks[q]][0]]; a += inv ? 2 - v : v; m += 2; } return [n, Math.round(a / m * 100)]; });
function checkRes(r, ks, T, {page = true, store = 'ok', st = null} = {}) {
  const J = judge(ks), v = V_CODE[J.verdict], ty = TYPE[v], quote = v === 'rest' && J.stop ? ty.stopQ : ty.q;
  if (!r) { fail('결과 칸 없음', T); return; }
  if (r.step !== 'res' || r.q) fail('결과 장(data-step=res · 질문 칸 없음)', `${T} 「${r.step}」 ${r.q}`);
  if (!eq(r.kids, ['wy-rhead', 'wy-sheet'])) fail('결과 = 짙은 머리 + 크림 판(brief ③)', `${T} ${JSON.stringify(r.kids)}`);
  if (r.v !== v) fail('판정(data-v = go · wait · rest)', `${T} ${r.v} ≠ ${v} (기록 값 ${J.verdict} · 점수 ${J.score} · 빨강 ${J.reds} · 쉬어 가는 답 ${J.stop})`);
  else if (J.stop && J.score < 12 && J.reds < 4) bump('[5] 6 쉬어 가자(점수와 상관없이)');
  if (r.vk !== '당신은' || r.vt !== ty.name || r.ve !== '예요' || r.vb !== ty.name + '예요') fail('「당신은 / ○○ 투자자예요」(유형 · 단정 · order-1011 5)', `${T} 「${r.vk}」「${r.vb}」 ≠ 「${ty.name}예요」`);
  if (r.type !== `“${quote}”`) fail('따옴표 한 줄(단정 · 쉬어 가는 답이면 그 까닭)', `${T} 「${r.type}」 ≠ 「“${quote}”」`);
  if (!r.scene) fail('결과 장면 그림(aria-hidden)', T);
  if (r.share !== '공유하기') fail('공유하기 단추', `${T} 「${r.share}」`);
  if (!(r.vfs > (r.bigCard?.fs ?? 0) && r.vfs > (r.bigView?.fs ?? 0))) fail('[5] 2 판정(유형) 글이 가장 큰 글씨', `${T} 판정 ${r.vfs}px · 칸 안 ${JSON.stringify(r.bigCard)} · 화면 ${JSON.stringify(r.bigView)}`);
  else { accept.verdictPx = r.vfs; accept.nextPx = Math.max(r.bigCard?.fs ?? 0, r.bigView?.fs ?? 0); }
  for (const [k, x] of Object.entries(r.gone)) if (x) fail('결과에 없어진 칸이 남음(order-1011 6)', `${T} ${k}`);
  if (st && r.text.includes(st.name)) fail('결과에 정한 종목 이름(order-1011 6 — 기록에만)', `${T} 「${st.name}」`);
  const tw = tendOf(ks);
  if (r.tendK !== '투자 성향 요약' || r.tend.length !== 4) fail('투자 성향 요약 넷', `${T} 「${r.tendK}」 ${r.tend.length}`);
  tw.forEach(([n, x], i) => {
    const b = r.tend[i]; if (!b) return;
    if (b.n !== n || b.v !== String(x)) fail('성향 이름 · 0 ~ 100(따로 셈 — brief ③ tendOf)', `${T} ${i + 1}째 「${b.n}」 ${b.v} ≠ 「${n}」 ${x}`);
    if (b.w !== x + '%' || b.hid !== 'true' || (b.tw > 0 && Math.abs(b.fw - b.tw * x / 100) > 1.5)) fail('성향 막대 길이 = 숫자(그린 것까지 · 읽지 않음)', `${T} ${n} ${b.w} · ${b.fw.toFixed(1)} / ${b.tw.toFixed(1)} · ${x}`);
  });
  bump('맞댄 성향 넷');
  if (!r.mind || r.mind.k !== '현재 심리 상태' || r.mind.v !== MIND[ks[9]] || !r.mind.t?.trim() || !r.mind.face) fail('현재 심리 상태(10번 답 → 안정 · 초조 · 불안 · 채운 얼굴)', `${T} ${JSON.stringify(r.mind)} · 기대 ${MIND[ks[9]]}`);
  if (r.detb !== '내 분석 자세히 보기 ›') fail('「내 분석 자세히 보기 ›」', `${T} 「${r.detb}」`);
  if (r.hi?.src !== '/media/makbi-icon.svg' || r.hi?.t !== '오늘도 좋은 투자 하세요!') fail('인사 줄(그림 7)', `${T} ${JSON.stringify(r.hi)}`);
  if (r.moodK !== '감정 상태 체크' || r.moodQ !== '지금 내 투자 심리는 어떤가요?' || !eq(r.moods, MOODS.map(([k, t]) => [k, t, 'false'])) || !r.said) fail('감정 상태 체크(얼굴 넷 · 안정 · 보통 · 불안 · 초조)', `${T} 「${r.moodK}」「${r.moodQ}」 ${JSON.stringify(r.moods)}`);
  if (r.log?.tag !== 'BUTTON' || r.log.t !== '투자 일지' || r.log.s !== '오늘의 매매를 기록해보세요.') fail('「투자 일지」 줄', `${T} ${JSON.stringify(r.log)}`);
  if (r.rep?.tag !== 'A' || r.rep.href !== '#/why/later' || r.rep.t !== '나의 성장 리포트' || r.rep.s !== '한 달 후 다시 점검해보세요.') fail('「나의 성장 리포트」 줄 → #/why/later', `${T} ${JSON.stringify(r.rep)}`);
  if (!r.inOrder) fail('크림 판 차례(성향 → 심리 → 자세히 → 인사 → 감정 → 일지 → 리포트 → 알림 → 다시 하기)', T);
  const saved = store === 'ok', savedNote = page ? '오늘 답을 아래 매매일지에 날짜와 함께 쌓았어요.' : '오늘 답을 매매일지에 날짜와 함께 쌓았어요.';
  if (saved ? !r.notes.includes(savedNote) : !r.notes.some(t => /남길 수 없/.test(t)) || r.notes.some(t => /쌓았/.test(t))) fail('기록 알림 글', `${T} ${JSON.stringify(r.notes)}`);
  if (!eq(r.btns, [['wy-again', '다시 하기']])) fail('다시 하기 단추', `${T} ${JSON.stringify(r.btns)}`);
  if (page ? r.link != null : r.link !== '#/why' || r.linkT !== '매매일지 보기 ›') fail('매매일지 고리(보내기 쪽 칸만)', `${T} ${r.link} 「${r.linkT}」`);
  if (!r.live.trim() || !(r.live.includes(J.verdict) || r.live.includes(ty.name))) fail('읽어 주는 칸(aria-live)에 판정', `${T} 「${r.live}」`);
  bump('맞댄 결과'); bump('판정 ' + J.verdict);
}
function checkDet(d, tab, ks, T) {
  const at = `${T} 상세 분석 ${tab}`;
  if (!d || d.step !== 'det') { fail('상세 분석 장(data-step=det)', `${at} 「${d?.step}」`); return; }
  if (d.up?.tag !== 'BUTTON' || d.up.label !== '결과로') fail('상세 분석 ← 「결과로」', `${at} ${JSON.stringify(d.up)}`);
  if (d.title !== (tab === 'guide' ? '맞춤 가이드' : '상세 분석 결과')) fail('상세 분석 머리 글(맞춤 가이드 탭이면 「맞춤 가이드」)', `${at} 「${d.title}」`);
  if (d.tabsRole !== 'tablist' || !eq(d.tabs, DET_TABS.map(([k, t]) => [k, t, 'tab', String(k === tab)]))) fail('탭 넷 한 줄(종합 분석 · 심리 분석 · 매매 습관 · 맞춤 가이드 · 켜진 탭 하나)', `${at} ${JSON.stringify(d.tabs)}`);
  if (d.panel !== 'tabpanel') fail('탭 칸(role=tabpanel)', at);
  const of = c => ks.map((k, q) => [q, k]).filter(([q, k]) => QS[q].a[k][0] === c).map(([q, k]) => `${q + 1}. ${QS[q].a[k][1]}`);
  if (tab === 'all') {
    if (d.dcards.length !== 2 || !/\bbrain\b/.test(d.dcards[0]?.ic) || d.dcards[0]?.h !== '1. 나의 투자 심리' || !/\bbars\b/.test(d.dcards[1]?.ic) || d.dcards[1]?.h !== '2. 나의 매매 습관') fail('종합 분석 카드 둘(뇌 · 「1. 나의 투자 심리」 · 막대 · 「2. 나의 매매 습관」)', `${at} ${JSON.stringify(d.dcards)}`);
    for (const c of d.dcards) if (!c.p?.trim() || /[?？]\s*$/.test(c.p)) fail('종합 분석 글 — 단정(order-1011 5)', `${at} 「${c.p}」`);
    for (const [x, k, c, nm] of [[d.good, '강점', 'g', '초록'], [d.warn, '주의할 점', 'r', '빨간']]) {
      const want = of(c);
      if (!x || x.k !== k) { fail(`「${k}」 칸`, `${at} ${JSON.stringify(x)}`); continue; }
      if (want.length ? !(x.items.length >= 1 && eq(x.items, want.slice(0, x.items.length))) : x.items.length || !x.empty?.trim()) fail(`「${k}」 = ${nm} 답(차례대로 · 없으면 한 줄)`, `${at} ${JSON.stringify(x)} · 기대 ${JSON.stringify(want)}`);
    }
  } else if (tab === 'mind' || tab === 'habit') {
    const qs = tab === 'mind' ? [6, 7, 9] : [0, 1, 2, 3, 4, 5, 8, 10];
    if (d.rows.length !== qs.length) fail(`${tab === 'mind' ? '심리 분석(7 · 8 · 10번)' : '매매 습관(나머지 여덟)'} 줄 수`, `${at} ${d.rows.length} ≠ ${qs.length}`);
    qs.forEach((q, j) => {
      const row = d.rows[j], A = QS[q].a[ks[q]]; if (!row) return;
      if (row.q !== `${q + 1}. ${QS[q].q} ${A[1]}`) fail('「n. 질문 답」(사장님 글)', `${at} 「${row.q}」`);
      if (row.c !== A[0] || !row.paint || row.sr !== TONE[A[0]]) fail('[9] 8 색 점 = 고른 답 색 + 읽어 주는 글(좋음 · 주의 · 위험)', `${at} ${q + 1}번 ${row.c} 「${row.sr}」 ≠ ${A[0]}`);
      if (!row.one || /[\n\r]/.test(row.one) || row.one.length > 60) fail(NEW_NAME + ' 한마디 한 줄(상세 분석 · order-1011 4)', `${at} ${q + 1}번 「${row.one}」`); else seeOne(q, ks[q], row.one);
    });
  } else {
    if (d.gh !== '지금 나에게 필요한 3가지' || d.gl.length !== 3 || !eq(d.gl.map(x => x.n), ['1', '2', '3']) || d.gl.some(x => !x.t?.trim() || !x.d?.trim()) || new Set(d.gl.map(x => x.t)).size !== 3) fail('맞춤 가이드 셋(번호 · 제목 · 풀이 · 겹침 없음)', `${at} 「${d.gh}」 ${JSON.stringify(d.gl)}`);
    if (d.copy !== '나만의 투자 체크리스트 받기') fail('「나만의 투자 체크리스트 받기」', `${at} 「${d.copy}」`);
  }
  bump('맞댄 상세 분석 ' + tab);
}
/** 클립보드 · 보내기 창 바꿔치기(공유하기 · 체크리스트 복사 시험 — 쓴 글을 셈) */
const clipStub = p => p.evaluate(() => { window.__copied = []; const w = t => { window.__copied.push(String(t)); return Promise.resolve(); }; try { Object.defineProperty(navigator, 'share', {configurable: true, value: undefined}); } catch { /* 그대로 */ } try { Object.defineProperty(navigator, 'clipboard', {configurable: true, value: {writeText: w}}); } catch { /* 그대로 */ } });

/** 길 하나 — 시작 화면부터 질문 · 결과 · 상세 분석 · 기록 · 목록까지 · pre = 처음부터 정한 종목(#/why/<번호> · 화면엔 안 보임) · keep = 결과 화면을 남김 · page = 매매일지 화면(아래 목록이 있음) · extras = 공유 · 감정 · 일지 · 복사 시험 */
async function runPath(p, sel, P, tag, o = {}) {
  const {scan = false, scanSel = sel, store = 'ok', gdrX = G, keep = false, recCheck = true, pre = null, page = true, extras = false} = o;
  const st = pre, T = `${tag} · ${P.name}`, before = store === 'ok' && recCheck ? await getRecs(p) : null, tStart = Date.now(), pg = page && sel === SEL;
  const click = async (css, k = 0) => { await p.locator(sel + ' ' + css).nth(k).click({timeout: 8000}); };
  const readQ = () => p.evaluate(READQ, sel), LK = await look(p);
  // ⓪ 시작
  checkStart(await p.evaluate(READS, sel), T, {page, st});
  if (pg) await checkPage(p, T + ' 시작');
  if (scan) await layout(p, scanSel, `${T} 시작`);
  let taps = 0, extra = false, off0 = null;
  await click('.wy-go'); taps++; await waitQ(p, sel, 1);
  const ks = P.ks, cur = new Array(QS.length).fill(null), k2first = P.back ? idxOf(1, P.back) : null;
  const pick = async (qi, k) => { await click('.wy-opt', k); taps++; cur[qi] = k; const s = await readQ(); checkQ(s, qi, k, T, LK); checkPicked(s, qi, k, T); return s; };
  const next = async qi => { await click('.wy-nav .wy-next'); taps++; if (qi < QS.length - 1) await waitQ(p, sel, qi + 2); };
  const errShown = re => p.waitForFunction(([s0, r]) => new RegExp(r).test(document.querySelector(s0 + ' .wy-err')?.textContent ?? ''), [sel, re], {timeout: 8000}).catch(() => {});
  for (let qi = 0; qi < QS.length; qi++) {
    let s = await readQ();
    checkQ(s, qi, cur[qi], T, LK); checkSeen(s, qi, T);
    if (qi === 0 && pg) await checkPage(p, T + ' 질문');
    if (scan) await layout(p, scanSel, `${T} ${qi + 1}번 고르기 전`);
    if (qi === 0 && P.empty) { // 답 없이 「다음으로 ›」 — 막고 알림(order-1011 3 · 누름 셈 밖)
      await click('.wy-nav .wy-next'); await errShown('골라');
      checkQ(await readQ(), 0, null, T + ' 답 없이 다음', LK, '답을 하나 골라 줘.'); bump('답 없이 다음 막음');
    }
    if (qi === 0 && P.first) { // 1번을 고르고 ← → 시작 화면 → 「시작하기 ›」 → 고른 답 그대로
      extra = true; await pick(0, ks[0]);
      await click('.wy-pg .wy-up'); await stepIs(p, sel, 'start'); checkStart(await p.evaluate(READS, sel), T + ' 1번 ←', {page, st});
      await click('.wy-go'); await waitQ(p, sel, 1); checkQ(await readQ(), 0, ks[0], T + ' 다시 시작', LK); bump('1번 ← = 시작 화면 · 고른 답 남음');
    }
    if (qi === 3 && k2first != null) { // 4번(안 고름)에서 ← 두 번 → 2번(고른 답 남음)을 바꿈 → 다음으로 3번(고른 답 그대로) → 4번
      extra = true;
      await click('.wy-pg .wy-up'); await waitQ(p, sel, 3); checkQ(await readQ(), 2, cur[2], T + ' ← 1', LK);
      await click('.wy-pg .wy-up'); await waitQ(p, sel, 2); checkQ(await readQ(), 1, cur[1], T + ' ← 2', LK);
      if (scan) await layout(p, scanSel, `${T} 뒤로 온 2번`);
      await pick(1, ks[1]); await next(1); checkQ(await readQ(), 2, cur[2], T + ' 앞에서 바꿈', LK); await next(2);
      s = await readQ(); checkQ(s, 3, null, T + ' 다시 4번', LK); bump('← 단추 길');
    }
    if (qi === QS.length - 1 && P.last) { // 11번 「‹ 이전」 → 10번(고른 답 남음) → 다음으로 → 11번
      extra = true;
      await click('.wy-nav .wy-back'); await waitQ(p, sel, QS.length - 1); checkQ(await readQ(), QS.length - 2, cur[QS.length - 2], T + ' ‹ 이전', LK);
      await next(QS.length - 2); checkQ(await readQ(), QS.length - 1, cur[QS.length - 1], T + ' ‹ 이전 뒤', LK); bump('11번 「‹ 이전」');
    }
    if (qi === BIG_Q && P.big3 === 'switch' && ks[qi] !== BIG_A) { // 「클 일이 있다」 + 날짜로 골랐다가 다른 답으로 바꿈 → 날짜 칸 사라짐 · 기록에 날짜 없음
      extra = true; await pick(qi, BIG_A); await p.fill(sel + ' .wy-date', FUTURE);
      checkQ(await readQ(), qi, BIG_A, T + ' 클 일 먼저', LK); bump('3번 날짜 넣고 답 바꿈');
    }
    const k0 = k2first != null && qi === 1 ? k2first : ks[qi];
    if (cur[qi] !== k0) s = await pick(qi, k0);
    if (qi === BIG_Q && k0 === BIG_A) { // [3] 3 — 같은 장에서 날짜를 받아야 다음으로
      if (P.date === 'bad') {
        extra = true;
        await click('.wy-nav .wy-next'); await errShown('날짜를 적어');
        checkQ(await readQ(), qi, k0, T + ' 날짜 없이', LK, '그 일이 언제인지 날짜를 적어 줘.'); bump('날짜 없이 막음');
        await p.fill(sel + ' .wy-date', PAST); await click('.wy-nav .wy-next'); await errShown('오늘이나');
        checkQ(await readQ(), qi, k0, T + ' 지난 날', LK, '오늘이나 그 뒤 날짜를 적어 줘.'); bump('지난 날 막음');
      }
      await p.fill(sel + ' .wy-date', FUTURE);
      if (await p.locator(sel + ' .wy-err').count()) fail('날짜를 넣었는데 알림이 남음', T);
      if (scan) await layout(p, scanSel, `${T} 3번 날짜 칸`);
    }
    if (qi === QS.length - 1) { await kakaoStub(p); off0 = await offers(p); } // 카톡 모듈이 늦게 와 NX.kakao 를 새로 써도 끝내기 바로 전에 다시 붙임
    await next(qi);
  }
  if (!extra) { // 누름 셈 — 시작 1 + 답 11 + 다음 11(order-1011 3 · brief ⑨)
    const want = 1 + QS.length * 2;
    if (taps !== want) fail('시작 → 결과 누름 수(시작 1 + 답 11 + 다음 11)', `${T} ${taps} ≠ ${want}`); else { bump('누름 셈 맞음'); (accept.taps ??= {})[P.name] = taps; }
  }
  // ③ 결과
  await p.waitForFunction(s0 => document.querySelector(s0)?.dataset.step === 'res' && !!document.querySelector(s0 + ' .wy-res'), sel, {timeout: 15000}).catch(() => {});
  const J = judge(ks), r = await p.evaluate(READR, sel);
  if (!r) { fail('결과 칸 없음', T); return null; }
  checkRes(r, ks, T, {page, store, st});
  if (pg) await checkPage(p, T + ' 결과');
  if (scan) await layout(p, scanSel, `${T} 결과`);
  // [2] 7 카톡 권유 — 결과가 처음 보인 뒤 한 번(이 판 첫 끝냄) · 그 뒤 끝냄 · 다시 그림은 더 안 부름
  const off1 = await offers(p);
  if (p._kakao === 'stub' && off0) {
    const want = (o.offerSeen ?? 0) === 0 ? 1 : 0, got = off1.length - off0.length;
    if (got !== want || off1.some(w => w !== 'journal')) fail('[2] 7 결과 뒤 NX.kakao.offer(\'journal\') 한 번', `${T} 이번 ${got}번 · 기대 ${want} · ${JSON.stringify(off1)}`); else bump('[2] 7 권유 부른 수 맞음');
  }
  if (extras) { // 공유하기(보내기 창이 없으면 글 복사) · 감정 상태 체크 · 투자 일지(아래 기록 목록으로) — brief ③
    const ty = TYPE[V_CODE[J.verdict]];
    await clipStub(p); await click('.wy-share');
    await p.waitForFunction(s0 => /복사/.test(document.querySelector(s0 + ' .wy-share')?.textContent ?? ''), sel, {timeout: 5000}).catch(() => {});
    const sh = await p.evaluate(s0 => ({t: document.querySelector(s0 + ' .wy-share')?.textContent.trim() ?? null, c: window.__copied ?? []}), sel);
    if (sh.t !== '복사했어요' || !sh.c.some(x => x.includes(ty.name))) fail('공유하기 — 보내기 창이 없으면 결과 글 복사(brief ③)', `${T} 「${sh.t}」 ${JSON.stringify(sh.c).slice(0, 160)}`); else bump('공유하기 → 글 복사');
    await click('.wy-mood[data-m="soso"]');
    const md = await p.evaluate(s0 => ({on: [...document.querySelectorAll(s0 + ' .wy-mood')].map(b => [b.dataset.m, b.getAttribute('aria-pressed'), b.classList.contains('on')]), said: document.querySelector(s0 + ' .wy-said')?.textContent ?? ''}), sel);
    if (!eq(md.on, MOODS.map(([k]) => [k, String(k === 'soso'), k === 'soso'])) || !md.said.trim()) fail('감정 상태 체크 — 누른 얼굴만 켜짐 · 알림 한 줄', `${T} ${JSON.stringify(md)}`); else bump('감정 상태 체크');
    if (pg) {
      await click('.wy-row[data-go="log"]');
      await p.waitForFunction(() => { const b = document.querySelector('#view section.wy-me')?.getBoundingClientRect(); return !!b && b.top >= -2 && b.top < innerHeight - 40; }, null, {timeout: 6000}).then(() => bump('투자 일지 → 아래 기록 목록'), () => fail('투자 일지 단추 — 아래 기록 목록으로(brief ③)', T));
    }
  }
  // ④ 상세 분석 — 「내 분석 자세히 보기 ›」 → 탭 넷 → ← 「결과로」
  await click('.wy-detb'); await stepIs(p, sel, 'det').catch(() => fail('「내 분석 자세히 보기 ›」 → 상세 분석', T));
  checkDet(await p.evaluate(READD, sel), 'all', ks, T);
  if (pg) await checkPage(p, T + ' 상세 분석');
  if (scan) await layout(p, scanSel, `${T} 상세 분석 종합`);
  for (const k of ['mind', 'habit', 'guide']) {
    await click(`.wy-tab[data-k="${k}"]`);
    await p.waitForFunction(([s0, k0]) => document.querySelector(`${s0} .wy-tab[data-k="${k0}"]`)?.getAttribute('aria-selected') === 'true', [sel, k], {timeout: 8000}).catch(() => {});
    const d = await p.evaluate(READD, sel); checkDet(d, k, ks, T);
    if (scan) await layout(p, scanSel, `${T} 상세 분석 ${k}`);
    if (k === 'guide' && extras) {
      await clipStub(p); await click('.wy-copy');
      await p.waitForFunction(s0 => /복사/.test(document.querySelector(s0 + ' .wy-copy')?.textContent ?? ''), sel, {timeout: 5000}).catch(() => {});
      const cp = await p.evaluate(s0 => ({t: document.querySelector(s0 + ' .wy-copy')?.textContent.trim() ?? null, c: window.__copied ?? []}), sel);
      if (cp.t !== '복사했어요' || !d.gl.every(x => cp.c.some(c => c.includes(x.t)))) fail('「나만의 투자 체크리스트 받기」 = 셋을 글로 복사', `${T} 「${cp.t}」 ${JSON.stringify(cp.c).slice(0, 160)}`); else bump('체크리스트 복사');
    }
  }
  await click('.wy-dtop .wy-up'); await stepIs(p, sel, 'res').catch(() => fail('상세 분석 ← 「결과로」 → 결과', T));
  bump('끝낸 길');
  // ⑤ 기록 — 끝낼 때 딱 한 번 · 맨 앞에 · 꼴 · 값
  const saved = store === 'ok', bigWant = ks[BIG_Q] === BIG_A ? FUTURE : null;
  if (saved && recCheck) {
    const recs = await getRecs(p), x = recs?.[0];
    if (!Array.isArray(recs) || recs.length !== Math.min(200, (before?.length ?? 0) + 1)) fail('기록 수(끝낼 때 한 번)', `${T} ${before?.length} → ${recs?.length}`);
    else {
      const at = Date.parse(x.at);
      if (!eq(Object.keys(x).sort(), REC_KEYS) || x.why !== null || x.promise !== null) fail('기록 꼴(열쇠 그대로 · why · promise 는 null — order-1011 6)', `${T} ${JSON.stringify(Object.keys(x))} · why ${JSON.stringify(x.why)} · promise ${JSON.stringify(x.promise)}`);
      if (!(at >= tStart - 2000 && at <= Date.now() + 2000)) fail('기록 날짜', `${T} ${x.at}`);
      const ws = st ? [st.code, st.name, st.price ?? null, st.day ?? null] : [null, null, null, null];
      if (!eq([x.code, x.name, x.price, x.day], ws)) fail('기록 종목 · 그날 값(정한 종목은 화면엔 안 보이고 기록에만 · 없으면 null)', `${T} ${JSON.stringify([x.code, x.name, x.price, x.day])} · 기대 ${JSON.stringify(ws)}`);
      if (!eq(x.answers, ks)) fail('기록 답', `${T} ${JSON.stringify(x.answers)} ≠ ${JSON.stringify(ks)}`);
      if (x.score !== J.score || x.reds !== J.reds || x.verdict !== J.verdict) fail('기록 점수(옛 꼴 그대로) · 빨강 · 판정', `${T} ${x.score} ${x.reds} ${x.verdict}`);
      if (!eq(GROUPS.map(([n]) => x.groups?.[n]), GROUPS.map(([n]) => J.groups[n]))) fail('기록 묶음', `${T} ${JSON.stringify(x.groups)}`);
      if (x.bigDay !== bigWant) fail('기록 클 일 날짜([3] 3)', `${T} ${x.bigDay} ≠ ${bigWant}`);
      if (x.asOf !== recAsOf(gdrX)) fail('기록 자료 날짜', `${T} ${x.asOf} ≠ ${recAsOf(gdrX)}`);
      if (!eq(x.picks, pickRec(gdrX))) fail('기록 그날 ' + NEW_NAME + ' 칸', `${T} ${JSON.stringify(x.picks).slice(0, 160)}`);
      bump('맞댄 기록');
    }
    if (page) { // 매매일지 화면 아래 목록이 그 자리에서 늘어남([3] 7)
      const m = await p.evaluate(READLIST);
      const n = (recs ?? []).filter(z => z && typeof z === 'object').length;
      if (!m || (/기록 ([\d,]+)번/.exec(m.h) || [])[1] !== n.toLocaleString('ko-KR') || (m.rows[0]?.stkName ?? null) !== (st?.name ?? null) || (m.rows[0]?.mine ?? null) !== null) fail('매매일지 아래 목록이 바로 늘어남', `${T} 「${m?.h}」 ${m?.rows?.[0]?.stkName} 「${m?.rows?.[0]?.mine}」 · 기대 ${n} · ${st?.name ?? '종목 없음'}`);
      else bump('목록 바로 늘어남');
      const wantFold = `방금 적음 · ${mdTxt(isoIn(Date.parse(x?.at)))} · ${vShow(J.verdict)} — 위 결과와 같아요`; // B15(2026-10-22) — 위 결과와 같은 첫 줄은 접음(지우지 않음 · 판정 글은 단정)
      if (!m?.fold || m.fold.sum !== wantFold || m.fold.open || !m.fold.rec || !m.fold.first) fail('B15 방금 끝낸 첫 줄을 한 줄로 접음', `${T} ${JSON.stringify(m?.fold)} · 기대 「${wantFold}」`); else bump('B15 첫 줄 접음');
    }
  }
  // [5] 7 todayResult() — 오늘(서울) 가장 새 기록 · 기억 못 하는 기계는 방금 끝낸 것
  {
    const tr = await modCall(p, 'today'), x = saved && recCheck ? (await getRecs(p))?.[0] : null;
    const ok = tr && eq(Object.keys(tr).sort(), ['at', 'code', 'of', 'ready', 'verdict']) && tr.verdict === V_CODE[J.verdict] && tr.ready === J.ready && tr.of === MAX && tr.code === (st?.code ?? null)
      && Date.parse(tr.at) >= tStart - 2000 && (!x || tr.at === x.at) && isoIn(Date.parse(tr.at)) === isoIn(Date.now());
    if (!ok) fail('[5] 7 todayResult() 꼴 · 값', `${T} ${JSON.stringify(tr)} · 기대 ${V_CODE[J.verdict]} 준비 ${J.ready} ${st?.code ?? null}`); else bump('[5] 7 todayResult 맞음');
  }
  if (store !== 'ok' || !recCheck) { const d = await modCall(p, 'done'); if (d !== true) fail('doneOnce() — 이 화면에서 끝낸 뒤', `${T} ${d}`); }
  if (keep) return {J};
  // 다시 하기 — 시작 화면(정한 종목은 그대로 · 화면엔 안 보임) · 권유는 더 안 부름
  await click('.wy-sheet .wy-nav .wy-again'); await stepIs(p, sel, 'start').catch(() => {});
  checkStart(await p.evaluate(READS, sel), T + ' 다시 하기', {page, st});
  if (page && saved && recCheck && (await p.evaluate(READLIST))?.fold) fail('B15 다시 하기 뒤에는 접은 줄을 풂(위 결과가 사라짐)', T);
  if (p._kakao === 'stub' && off1 && (await offers(p))?.length !== off1.length) fail('[2] 7 다시 하기(다시 그림)에 권유를 또 부름', T);
  return {J};
}

/** 쌓인 기록 목록 맞대기(새 것부터 · 서른 줄까지 · 날짜 · 준비 · 판정 · 종목 · 그날 값 · 두 줄 · 막대 · 한 달 칸) · 지우는 단추 없음 · o.home · o.medOk · o.blocked = 그 판의 자료 */
async function checkList(p, tag, {expectN = null, home = p._home, blocked = p._block ?? [], medOk = !blocked.includes(MED_FILE)} = {}) {
  await p.waitForFunction(() => ![...document.querySelectorAll('#view section.wy-me .wy-later')].some(x => /셈하는 중/.test(x.textContent)), null, {timeout: 30000}).catch(() => fail('한 달 칸이 「셈하는 중」에 멈춤', tag));
  const m = await p.evaluate(READLIST), recs = ((await getRecs(p)) ?? []).filter(z => z && typeof z === 'object');
  if (!m) { fail('매매일지 기록 칸 없음', tag); return; }
  const n = expectN ?? recs.length;
  if ((/기록 ([\d,]+)번/.exec(m.h) || [])[1] !== n.toLocaleString('ko-KR')) fail('기록 수', `${tag} 「${m.h}」 ≠ ${n}`);
  if (m.fold) fail('B15 새로 그린 목록에 접은 줄(방금 끝낸 때만 접음)', `${tag} ${JSON.stringify(m.fold)}`);
  if (m.rows.length !== Math.min(n, 30)) fail('줄 수(서른까지)', `${tag} ${m.rows.length} ≠ ${Math.min(n, 30)}`);
  for (const [i, row] of m.rows.entries()) {
    const x = recs[i]; if (!x) continue;
    const at = Date.parse(x.at), J = Array.isArray(x.answers) && x.answers.length === QS.length ? judge(x.answers) : null, T = `${tag} ${i + 1}줄`;
    if (row.day !== dayTxt(at)) fail('목록 날짜', `${T} 「${row.day}」 ≠ 「${dayTxt(at)}」`);
    if (!row.rest.includes(Number.isFinite(x.score) ? `준비 ${MAX - x.score} / ${MAX}` : '준비 ?') || !row.rest.includes(vShow(x.verdict)) || /점수 \d/.test(row.rest) || /\?\s*$/.test(row.rest.trim())) fail('[5] 5 목록 준비 · 판정(사장님 판정 글 그대로 · 물음표 없음 — order-1011 5)', `${T} 「${row.rest}」 · 점수 ${x.score}`);
    if (J && J.score !== x.score) fail('쌓인 기록의 점수(답으로 다시 셈)', `${T} ${x.score}`);
    if (!eq(row.bars, GROUPS.map(([nm, qs]) => `${qs.length * 2 - (x.groups?.[nm] ?? 0)} / ${qs.length * 2}`))) fail('[5] 5 목록 막대 준비 숫자', `${T} ${JSON.stringify(row.bars)}`);
    if (x.code || x.name) { // 종목 있는 기록(#/why/<번호> · 옛 꼴) — 종목 · 그날 값 · 날짜
      const want = x.price > 0 ? [`그날 값 ${won(x.price)}`, ...(x.day ? [`${mdTxt(x.day)} 종가`] : [])] : ['그날 값 ?'];
      if (row.stkName !== (x.name || x.code) || !want.every(w => row.stk?.includes(w))) fail('목록 종목 · 그날 값([3] 6)', `${T} 「${row.stk}」 · 기대 ${x.name} ${JSON.stringify(want)}`);
    } else if (row.stk != null) fail('종목 없는 기록에 종목 줄', `${T} 「${row.stk}」`);
    if (x.why && row.mine !== x.why) fail('목록 ① 줄(내 글 data-proper)', `${T} 「${row.mine}」 ≠ 「${x.why}」`);
    { const wantL = [...(x.why ? ['반토막 난다면 ' + x.why] : []), ...(typeof x.promise?.text === 'string' ? ['팔 약속 ' + x.promise.text] : []), ...(x.bigDay ? ['클 일 ' + ymdTxt(x.bigDay)] : [])]; // 옛 기록의 두 줄 · 새 기록은 클 일 날짜만(order-1011 6)
      if (!eq(row.lines, wantL)) fail('목록 두 줄 · 클 일 날짜(있는 것만)', `${T} ${JSON.stringify(row.lines)} ≠ ${JSON.stringify(wantL)}`); }
    bump(x.code || x.name ? '맞댄 종목 있는 줄' : '맞댄 종목 없는 줄');
    // [5] 8 · 9 한 달 칸 — 아직 · 묻기 · 값(따로 셈)
    const W = await laterWant(x, {home, medOk, blocked}), L = row.later ?? {};
    if (!W) {
      if (L.note !== '한 달 뒤에 그날 정한 대로 했는지 물어요.' || L.kq || L.kb?.length || L.lv?.length) fail('[5] 8 한 달 안 된 기록 = 한 줄만(묻기 · 값 0)', `${T} ${JSON.stringify(L)}`); else bump('[5] 8 아직 줄');
    } else if (x.kept?.a === 'yes' || x.kept?.a === 'no') {
      if (L.kd !== (x.kept.a === 'yes' ? '그날 정한 대로 했어요.' : '그날 정한 대로 하지 않았어요.') || L.kq || L.kb?.length) fail('[5] 8 답한 기록 = 답 한 줄 + 값(다시 묻지 않음)', `${T} ${JSON.stringify(L)}`);
      if (W.wait) { if (L.lv?.length || L.lvNote !== W.wait) fail('B20 달력으로 한 달 · 날짜 줄은 아직 — 값 대신 「? 값은 자료가 오면 붙여요」', `${T} ${JSON.stringify(L)} ≠ 「${W.wait}」`); else bump('B20 값은 자료가 오면'); }
      else if (!eq(L.lv, W.lines)) fail('[5] 9 한 달 뒤 값(날짜 박음 · 따로 셈)', `${T} ${JSON.stringify(L.lv)} ≠ ${JSON.stringify(W.lines)}`); else { bump('[5] 9 맞댄 한 달 뒤 값'); bump('[5] 9 「?」 값', W.q); }
    } else {
      if (L.kq !== '그날 정한 대로 했어?' || !eq(L.kb, ['BUTTON:했어', 'BUTTON:안 했어']) || L.lv?.length || L.kd) fail('[5] 8 한 달 지난 기록 = 「그날 정한 대로 했어?」 먼저 · 값 0', `${T} ${JSON.stringify(L)}`); else bump('[5] 8 먼저 물음');
    }
  }
  if (m.btn.length) fail('기록에 누르는 것(지우는 단추 없음 — 규칙 77 · 「했어 · 안 했어」 말고)', `${tag} ${JSON.stringify(m.btn)}`);
  const dels = await p.evaluate(DELS, '#view');
  if (dels.length) fail('지우는 단추(규칙 77 · [3] 6)', `${tag} ${JSON.stringify(dels)}`);
  bump('맞댄 기록 목록');
}
/** B17 · B18(2026-10-22 총정리) — 맨 위 「한 달 전 약속」 칸 기대: 모든 기록 가운데 답 열한 개 · 아직 답 안 함 · 한 달 지남(laterWant 와 같은 셈 — 장 스무 번 또는 달력 서른 날) · 가장 오래된 것부터 */
const fullOk = x => !!x && typeof x === 'object' && Array.isArray(x.answers) && x.answers.length === QS.length && x.answers.every((k, i) => Number.isInteger(k) && k >= 0 && k < QS[i].a.length);
async function dueWant(recs) {
  const out = [];
  for (const x of recs ?? []) if (fullOk(x) && !(x.kept?.a === 'yes' || x.kept?.a === 'no') && winOrCal(x)) out.push(x);
  return out.sort((a, b) => (Date.parse(a.at) || 0) - (Date.parse(b.at) || 0));
}
const winOrCal = x => !!winOf(x) || (Number.isFinite(Date.parse(x.at)) && (Date.now() - Date.parse(x.at)) / 864e5 >= 30);
const READDUE = () => {
  const b = document.querySelector('#view section.wy-due'), h1 = document.querySelector('#view h1');
  if (!b) return null;
  return {shown: !b.hidden && b.getBoundingClientRect().height > 0, head: b.querySelector('.wy-dh')?.textContent ?? null, name: b.querySelector('.wy-dh .wy-stn[data-proper]')?.textContent ?? null, kq: b.querySelector('.wy-kq')?.textContent ?? null,
    kb: [...b.querySelectorAll('.wy-kbs button')].map(x => x.textContent), more: b.querySelector('.wy-note')?.textContent ?? null, done: b.querySelector('.wy-kd')?.textContent ?? null, lines: [...b.querySelectorAll('.wy-lines p')].map(x => x.textContent),
    afterH1: h1?.nextElementSibling === b, beforeCard: b.nextElementSibling?.matches?.('section.wy') ?? false, label: b.getAttribute('aria-label')};
};
async function checkDue(p, tag, doneNow = false) {
  const recs = await getRecs(p), want = await dueWant(recs);
  const ok = () => p.evaluate(READDUE).then(d => d);
  await p.waitForFunction(n => { const b = document.querySelector('#view section.wy-due'); if (!b) return false; const m = /([\d,]+)개 더/.exec(b.querySelector('.wy-note')?.textContent ?? ''); const shown = !b.hidden; return n === 0 ? !shown || /적었어요/.test(b.textContent) : shown && (m ? +m[1].replace(/,/g, '') : 0) === n - 1; }, want.length, {timeout: 8000}).catch(() => {});
  const d = await ok();
  if (!d) { fail('B17 「한 달 전 약속」 칸 없음', tag); return; }
  if (!d.afterH1 || !d.beforeCard || d.label !== '한 달 전 약속') fail('B17 칸 자리 — 제목 바로 밑 · 질문 칸 위', `${tag} ${JSON.stringify(d)}`);
  if (!want.length) {
    if (doneNow ? !(d.shown && d.done === '적었어요. 아래 기록에서 한 달 뒤 값을 봐요.' && !d.kb.length) : d.shown) fail(doneNow ? 'B17 다 답하면 「적었어요 …」 한 줄' : 'B17 물을 약속이 없으면 칸 숨김', `${tag} ${JSON.stringify(d)}`);
    bump('B17 맞댄 빈 칸'); return;
  }
  const x = want[0], nm = x.name || x.code, wantHead = `한 달 전 약속 · ${mdTxt(isoIn(Date.parse(x.at)))}${nm ? ' ' + nm : ''}`;
  const wantLines = [...(x.why ? ['반토막 난다면 ' + x.why] : []), ...(typeof x.promise?.text === 'string' ? ['팔 약속 ' + x.promise.text] : []), ...(x.bigDay ? ['클 일 ' + ymdTxt(x.bigDay)] : [])];
  const wantMore = want.length > 1 ? `한 달 지난 약속이 ${want.length - 1}개 더 있어요.` : null;
  if (!d.shown || d.head !== wantHead || (nm && d.name !== String(nm)) || d.kq !== '그날 정한 대로 했어?' || !eq(d.kb, ['했어', '안 했어']) || (d.more ?? null) !== wantMore || !eq(d.lines, wantLines)) fail('B17 맨 위 「한 달 전 약속」(가장 오래된 것 · 두 줄 · 묻기 · 남은 수)', `${tag} ${JSON.stringify(d)} · 기대 「${wantHead}」 ${JSON.stringify(wantLines)} 「${wantMore}」`);
  else bump('B17 맞댄 맨 위 칸');
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

/* ⓪ 시작 화면(그림 1) · #/why/<번호> — 종목은 화면에 안 보이고 기록에만 · 없는 번호 · 틀린 번호 · 펀드 · 우선주는 알림 없이 종목 없음 · 회사 화면 고리(사장님 2026-10-28 10:11 「어 그렇게 해」 order-1011 6) */
if (!QUICK) {
  const T = '시작 화면 360×640', p = await newPage(360, 640);
  try {
    await open(p, '#/why', SEL);
    const top = await p.evaluate(() => ({h1: document.querySelector('#view h1')?.textContent ?? null, title: document.title, page: !!document.querySelector('#view section.wy.page'), list: !!document.querySelector('#view section.wy.page ~ section.wy-me'),
      safe: document.querySelector('#view section.wy-me ~ p.safe')?.textContent ?? null, due: (e => (e ? (e.hidden ? 'hidden' : 'shown') : 'none'))(document.querySelector('#view section.wy-due'))}));
    if (top.h1 !== '매매일지' || top.title !== '매매일지' + TITLE_TAIL || !top.page || !top.list || top.safe !== SAFE_LINE) fail('매매일지 화면 꼴(제목 = 탭 이름 · 질문 칸 · 아래 기록 · 안전 문장)', `${T} ${JSON.stringify(top)}`);
    if (top.due === 'shown') fail('B17 기록 없는 새 기기에 「한 달 전 약속」 칸이 보임', T);
    checkStart(await p.evaluate(READS, SEL), T); await checkPage(p, T);
    await layout(p, PSEL, T + ' 시작');
    for (const [hash, why, st] of [['#/why/999999', '없는 번호', null], ['#/why/abc', '틀린 번호', null], ['#/why/' + ST.co1.code, '회사 번호', ST.co1]]) {
      await open(p, hash, SEL); await p.waitForTimeout(600); // 번호를 찾아보는 동안(조용히 — 알림 글 없음)
      checkStart(await p.evaluate(READS, SEL), `${T} ${hash} ${why}`, {st}); bump('번호로 열어도 시작 화면');
    }
    for (const [hash, st] of [...(ST.coL ? [['#/why/' + ST.coL.code.toLowerCase(), ST.coL]] : []), ['#/why/' + ST.x1.code, null]]) { // 작은 글자 번호 = 그 종목 · 펀드 · 우선주 = 종목 없음(회사 주식만 적음)
      await open(p, hash, SEL); const n0 = ((await getRecs(p)) ?? []).length;
      await fastRun(p, SEL, PATHS[0].ks);
      const recs = (await getRecs(p)) ?? [], x = recs[0], ws = st ? [st.code, st.name, st.price ?? null, st.day ?? null] : [null, null, null, null];
      if (recs.length !== n0 + 1 || !eq([x?.code, x?.name, x?.price, x?.day], ws)) fail(st ? '작은 글자 번호도 그 종목으로 기록(화면엔 안 보임)' : '펀드 · 우선주 번호 → 기록에 종목 없음(알림 없이)', `${T} ${hash} ${JSON.stringify([x?.code, x?.name, x?.price, x?.day])} · 기대 ${JSON.stringify(ws)}`);
      else bump(st ? '작은 글자 번호 → 기록' : '펀드 번호 → 종목 없음');
      const rr = await p.evaluate(READR, SEL);
      if (rr?.text?.includes(ST.x1.name) || (st && rr?.text?.includes(st.name))) fail('결과에 번호의 종목 이름(order-1011 6 — 기록에만)', `${T} ${hash}`);
    }
    { // 회사 화면 「이 회사로 왜 사?」(a.why-go) → #/why/<번호> · 시작 화면(종목은 기록에만)
      await open(p, '#/w/' + ST.co1.code, '#view a.why-go');
      await p.locator('#view a.why-go').first().click({timeout: 8000});
      await p.waitForFunction(([c, s]) => location.hash === '#/why/' + c && !!document.querySelector(s) && !document.querySelector('#view .boot'), [ST.co1.code, SEL], {timeout: 30000});
      checkStart(await p.evaluate(READS, SEL), `${T} 회사 화면 고리`, {st: ST.co1}); bump('회사 화면 → 시작 화면');
    }
    errsOf(p, T);
  } catch (e) { fail('판 멈춤', `${T}: ${e.message.split('\n')[0]}`); }
  await p.context().close();
}

/* ① ~ ⑤ 판 A — 360×640 #/why(길 열하나 · quick 은 다섯) · 옛 기록 스물다섯(한 달 지남 · 물음) · 그날 값 파일 못 받는 회사(#/why/<번호>로 엶) */
{
  const T = '360×640 #/why', p = await newPage(360, 640, {allow: [CX_FILE], block: [CX_FILE]});
  try {
    await open(p, '#/why', SEL);
    if (!QUICK) await setRecs(p, Array.from({length: 25}, (_, i) => oldRec(40 + i))); // 서른 줄 넘음 — 옛 꼴 기록 스물다섯
    await open(p, '#/why', SEL);
    if (!QUICK) await checkList(p, T + ' 처음 목록');
    let first = true, seen = 0;
    for (const P of PATHS.filter(P => !QUICK || SHORT.includes(P.name))) {
      const pre = P.stock ? ST[P.stock] : null;
      try {
        if (pre) await open(p, '#/why/' + pre.code, SEL); // # 만 바뀌는 길(같은 쪽 — 다시 불러오지 않음) · 권유 셈은 이어짐
        await runPath(p, SEL, P, pre ? `${T} → #/why/${pre.code}` : T, {scan: first, scanSel: PSEL, offerSeen: seen, pre, extras: first});
        seen++;
        if (pre) await open(p, '#/why', SEL);
      } catch (e) { fail('길 멈춤', `${T} · ${P.name}: ${e.message.split('\n')[0]}`); await open(p, '#/why', SEL).catch(() => {}); }
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
      {...oldRec(60), asOf: DD[kIn - 2], at: new Date(Date.parse(DD[kIn - 2] + 'T01:00:00Z')).toISOString()}, // 옛 꼴(종목 없음) · 묻기만
      // B20(2026-10-22) — 날짜 줄이 그날 뒤로 스무 장을 못 채움(자료 멈춤)인데 달력으로 서른다섯 날 지남 → 물음 · 답한 기록은 「? 값은 자료가 오면 붙여요」
      {...recAt(DD.length - 2, ST.co1), at: new Date(Date.now() - 35 * 864e5).toISOString()},
      {...recAt(DD.length - 2, ST.co2), at: new Date(Date.now() - 36 * 864e5).toISOString(), kept: {a: 'no', at: '2026-10-20T00:00:00.000Z'}}];
    await setRecs(p, recs);
    await open(p, '#/why', SEL);
    await checkList(p, T + ' 처음');
    await checkDue(p, T + ' 처음');
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
    await checkDue(p, T + ' 기록 줄에서 답한 뒤(맨 위 칸도 바뀜)');
    await checkList(p, T + ' 답한 뒤(그 자리)');
    await open(p, '#/why', SEL); // 다시 열어도 묻지 않고 값
    await checkList(p, T + ' 다시 엶');
    await layout(p, '#view section.wy-me', T + ' 값');
    const q = (await p.evaluate(READLIST)).rows.map(r => r.later?.lv ?? []).flat().join('\n').split('?').length - 1;
    accept.later = {...(accept.later ?? {}), [T]: {qmarks: q, medOk}};
    { // B17(2026-10-22) — 맨 위 칸에서 남은 약속을 차례로 답함(가장 오래된 것부터 · 같은 keep — 기록 수 · 다른 값 그대로) → 다 하면 한 줄 · 아래 목록에 답이 붙음
      const before2 = await getRecs(p), due2 = await dueWant(before2), dueN = due2.length, dueKey = new Set(due2.map(x => x.at + '|' + (x.code ?? '')));
      for (let k = 0; k < dueN; k++) {
        const head0 = await p.evaluate(() => document.querySelector('#view section.wy-due .wy-dh')?.textContent ?? null);
        await p.locator('#view section.wy-due .wy-kbs button', {hasText: /^했어$/}).click({timeout: 8000});
        await p.waitForFunction(h0 => { const b = document.querySelector('#view section.wy-due'); return !!b && (b.querySelector('.wy-dh')?.textContent ?? null) !== h0 || /적었어요/.test(b?.textContent ?? ''); }, head0, {timeout: 15000}).catch(() => fail('B17 맨 위 칸에서 답한 뒤 다음 약속으로 안 바뀜', `${T} ${k + 1}번째`));
        await checkDue(p, `${T} 맨 위 칸 ${k + 1}번째 답 뒤`, k + 1 === dueN);
      }
      const after2 = await getRecs(p);
      if (after2.length !== before2.length) fail('B17 맨 위 칸 답 — 기록 수 그대로', `${T} ${before2.length} → ${after2.length}`);
      after2.forEach((x, i) => { const {kept: k1, ...r1} = x, {kept: k0, ...r0} = before2[i], was = dueKey.has(before2[i].at + '|' + (before2[i].code ?? '')); if (!eq(r1, r0) || (was ? k1?.a !== 'yes' || !(Date.parse(k1?.at) > Date.now() - 120000) : !eq(k1, k0))) fail('B17 맨 위 칸 답은 그 기록에 kept 로만(물은 약속만 「했어」 · 나머지 그대로)', `${T} ${i + 1}째 ${JSON.stringify(k1)} · 물은 약속 ${was}`); });
      await p.waitForTimeout(300); await checkList(p, T + ' 맨 위 칸 답 뒤(아래 목록)');
      bump('B17 맨 위 칸 답 길');
    }
    errsOf(p, T);
  } catch (e) { fail('판 멈춤', `${T}: ${e.message.split('\n')[0]}`); }
  await p.context().close();
}

/* 판 B — 390×844 #/why/<번호>(처음부터 정한 종목 — 시작 화면부터 · 화면엔 안 보이고 기록에만) */
if (!QUICK) {
  const T = `390×844 #/why/${ST.co2.code}`, p = await newPage(390, 844);
  try {
    await open(p, '#/why/' + ST.co2.code, SEL);
    await setRecs(p, [recAt(kIn, ST.co2)]);
    await open(p, '#/why/' + ST.co2.code, SEL);
    await checkList(p, T + ' 처음 목록');
    let first = true, seen = 0;
    for (const P of PATHS.filter(P => ALL || SHORT.includes(P.name))) {
      try { await runPath(p, SEL, P, T, {scan: first, scanSel: PSEL, pre: ST.co2, offerSeen: seen}); seen++; } catch (e) { fail('길 멈춤', `${T} · ${P.name}: ${e.message.split('\n')[0]}`); await open(p, '#/why/' + ST.co2.code, SEL).catch(() => {}); }
      first = false; errsOf(p, T + ' · ' + P.name);
    }
    await checkList(p, T + ' 끝 목록');
    await layout(p, '#view section.wy-me', T + ' 기록 목록');
    errsOf(p, T + ' 목록');
  } catch (e) { fail('판 멈춤', `${T}: ${e.message.split('\n')[0]}`); }
  await p.context().close();
}

/* ⑥ whyCard(G, {code, onDone}) — 친구가 연 보내기 쪽처럼(처음부터 정한 종목 — 기록에만 · 결과 뒤 onDone) · meRecords() · doneOnce() · todayResult() · 권유 한 번(다른 화면 갔다 와도) · 투자 일지(아래 기록 없는 칸 → #/why/later) */
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
    const embed = code => p.evaluate(async c => {
      const W = await globalThis.NX.mod('why'), G0 = globalThis.NX?.gdr ? await globalThis.NX.gdr() : null; // 보내기 쪽(일꾼 C)과 같은 길 — NX.mod 가 p-why.css 도 붙임
      window.__done = [];
      const host = document.createElement('div'); host.id = '__t';
      const card = W.whyCard(G0, {code: c, onDone: (rec, saved) => window.__done.push({rec, saved, res: !!document.querySelector('#__t .wy-res'), page: !!document.querySelector('#__t section.wy.page'), offer: (window.__offer ?? []).length})});
      host.append(card); document.querySelector('#view').replaceChildren(host);
    }, code);
    await embed(ST.co1.code);
    const S2 = '#__t section.wy';
    await p.waitForSelector(S2 + ' .wy-go', {timeout: 15000});
    await p.waitForFunction(() => [...document.querySelectorAll('link[rel="stylesheet"]')].some(l => l.getAttribute('href') === '/next/p-why.css' && !!l.sheet && l.sheet.cssRules.length > 0), null, {timeout: 15000}).catch(() => fail('NX.mod(\'why\') 로 붙인 칸에 p-why.css 가 안 붙음', T));
    const r0 = await runPath(p, S2, PATHS[4], T, {scan: true, pre: ST.co1, page: false, keep: true});
    const d = await p.evaluate(() => window.__done);
    if (d.length !== 1 || !d[0].res || d[0].saved !== true || d[0].page || d[0].rec?.code !== ST.co1.code || d[0].rec?.score !== r0?.J?.score || d[0].rec?.why !== null || d[0].rec?.promise !== null) fail('onDone — 결과를 그린 뒤 한 번 · 기록(종목은 기록에만 · 두 줄 null) · 남겼나', `${T} ${JSON.stringify(d).slice(0, 300)}`); else bump('onDone 한 번');
    if (await modCall(p, 'done') !== true) fail('doneOnce() — 끝낸 뒤', T);
    const me = await modCall(p, 'me'), n = ((await getRecs(p)) ?? []).length;
    if ((/기록 ([\d,]+)번/.exec(me.h) || [])[1] !== String(n) || me.rows !== n || me.btn) fail('meRecords() — 같은 기록 · 누르는 것 없음', `${T} ${JSON.stringify(me)} · 기록 ${n}`); else bump('meRecords 맞음');
    await p.locator(S2 + ' .wy-res a.wy-link').click({timeout: 8000}); // 매매일지 보기 › → #/why(목록에 방금 기록)
    await p.waitForFunction(() => location.hash === '#/why' && !!document.querySelector('#view section.wy-me') && !document.querySelector('#view .boot'), null, {timeout: 30000});
    await checkList(p, T + ' 매매일지로');
    await go(p, '#/find', '#view .find'); await go(p, '#/why', SEL); // 다른 화면 갔다 옴 — 권유 더 없음
    if ((await offers(p))?.length !== 1) fail('[2] 7 권유는 한 번(다른 화면 갔다 와도)', `${T} ${JSON.stringify(await offers(p))}`); else { bump('[2] 7 한 번 그대로'); accept.offer = 1; }
    { // 투자 일지 — 아래 기록 목록이 없는 칸(보내기 쪽처럼)은 #/why/later 로(brief ③ 「없으면 #/why/later」)
      await go(p, '#/find', '#view .find'); await embed(null);
      await p.waitForSelector(S2 + ' .wy-go', {timeout: 15000});
      await fastRun(p, S2, PATHS[0].ks);
      await p.locator(S2 + ' .wy-row[data-go="log"]').click({timeout: 8000});
      await p.waitForFunction(() => location.hash === '#/why/later', null, {timeout: 8000}).then(() => bump('투자 일지 → #/why/later(붙인 칸)'), async () => fail('투자 일지 단추 — 아래 기록 목록이 없는 칸은 #/why/later 로(brief ③)', `${T} 지금 「${await p.evaluate(() => location.hash)}」`));
    }
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
    if (await p.locator(SEL).count()) { await runPath(p, SEL, PATHS[8], T, {page: false}); bump('첫 화면 칸 길'); }
    else bump('첫 화면에 매매일지 칸 없음(가운데 단추로만)');
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
    if (!(recs?.[0] && typeof recs[0] === 'object' && recs[0].score === judge(PATHS[8].ks).score && eq(recs[0].answers, PATHS[8].ks) && recs[0].code === null)) fail('망가진 줄 위에 새 기록(#/why — 종목 없음)', `${T} ${JSON.stringify(recs?.[0]).slice(0, 120)}`);
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

/* ⑨ 걸린 때 · 누름 — 처음 여는 기기 390×844 · 시작하기 → 열한 질문(답 + 다음으로) → 결과 · 읽기 · 재기 없이 누르기만(사장님 2026-10-28 10:11 「어 그렇게 해」 order-1011 3 — 「다음으로」 단추로 누름이 22번이 됨) */
{
  const T = '걸린 때 390×844', p = await newPage(390, 844);
  try {
    await open(p, '#/why', SEL + ' .wy-go');
    let taps = 0, qTaps = 0; const t1 = Date.now();
    await p.locator(SEL + ' .wy-go').click(); taps += 1; await waitQ(p, SEL, 1);
    for (let qi = 0; qi < QS.length; qi++) {
      await p.locator(SEL + ' .wy-opt').nth(PATHS[0].ks[qi]).click(); taps += 1; qTaps += 1;
      await p.locator(SEL + ' .wy-nav .wy-next').click(); taps += 1; qTaps += 1;
      if (qi < QS.length - 1) await waitQ(p, SEL, qi + 2);
    }
    await p.waitForSelector(SEL + ' .wy-res', {timeout: 15000});
    Object.assign(timing, {flowMs: Date.now() - t1, taps, qTaps, qTapsOneTap1018: QS.length});
    accept.tapsQuestions = {oneTap1018: QS.length, now: qTaps}; accept.tapsAll = {now: taps};
    if (qTaps !== QS.length * 2) fail('질문 누름 = 답 11 + 다음 11(order-1011 3 「다음으로」 단추)', `${T} ${qTaps}`);
    if (taps !== 1 + QS.length * 2) fail('시작 → 결과 누름 수(시작 1 + 답 11 + 다음 11)', `${T} ${taps}`);
    if (timing.flowMs > 60000) fail('1분 안에 끝남([3] 9)', `${T} ${timing.flowMs}ms`);
    errsOf(p, T);
  } catch (e) { fail('판 멈춤', `${T}: ${e.message.split('\n')[0]}`); }
  await p.context().close();
}

await browser.close();
const sec = Math.round((Date.now() - t0) / 1000);
accept.fontSizesPerScreenMax = Math.max(0, ...SIZES.values()); accept.leftEdgesPerScreenMax = Math.max(0, ...LEFTS.values()); accept.leftScreens = LEFTS.size;
const res = {schema: 'atlas11-next-why-4', when: new Date().toISOString(), base, path: NEXT, all: ALL, quick: QUICK, gdrAsOf: G?.asOf ?? null, gdrVersion: G?.version ?? null, picks: G?.picks?.length ?? null, stocks: Object.fromEntries(Object.entries(ST).map(([k, v]) => [k, v.code])),
  laterDays: {in: [DD[kIn], DD[kIn + LATER]], out: [DD[kOut], DD[kOut + LATER]]}, accept, timing, sec, counts, fails, ok: !fails.length};
if (OUT) { await fs.mkdir(path.dirname(path.resolve(OUT)), {recursive: true}); await fs.writeFile(path.resolve(OUT), JSON.stringify(res, null, 1) + '\n'); }
console.log(JSON.stringify({sec, quick: QUICK, accept, timing, counts}, null, 1));
if (fails.length) { console.log('실패 ' + (counts.fail || 0) + '건:'); for (const [k, x] of fails.slice(0, 60)) console.log(' -', k, '·', x); process.exit(1); }
console.log('실패 0');