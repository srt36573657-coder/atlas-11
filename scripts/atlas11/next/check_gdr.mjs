// 고도리 칸 맞대기 — 조건으로 거른 곳 · 나눠 두는 비중(사장님 2026-10-17(싱가포르) 17:54 「고도리 만들기 · 한 장 명령문」 명령 7 ~ 12 · 14)
//   + 21:10 「하나로 묶은 명령문」 [6] 고도리 칸 안전(brief2.md · 일꾼 D): 열한 질문을 마친 사람에게만 · 곳마다 「틀린다면 이유」 · 같은 때 코스피와 견줌 · 나빠도 숨기지 않음
//   + 2026-10-18 「72개와 카톡 두 번 가입」(order-0015 · brief5 길 15 · accept/S9.md · S9t.md): 금액 · 팔 선 · 절반 팔 선 · 「담겠어 · 팔겠어」 문장을 화면에서 뺌([9] 1) · 내 돈 칸 숨김([9] 4) ·
//     잠금 한 줄([6] 10) · 오늘 점수 한 줄 · 쉬어 가는 날 한 줄([5] 7) · 고른 날 값 → 오늘 값([8] 1) · PER · PBR · 회사 크기 · 1년 꼭대기 대비 한 줄([8] 9) · 「고도리 칸 n곳」([10] 3) · 목록 역할([9] 8) · 글씨 · 간격([10] 5 ~ 10)
//   쓰는 법: node scripts/atlas11/next/check_gdr.mjs --base http://127.0.0.1:8826 [--pw /opt/node-tools/] [--path /next/?dev=1] [--out 결과.json] [--all] [--only 낱말,낱말]
//     --all  = 네 판 모두에서 모든 칸을 눌러 카드를 맞댐(기본 = 앞 두 판만 · 뒤 두 판은 처음 · 가운데 · 끝 칸) — 다른 쪽 검사처럼 --limit N 도 받음(기본과 같음)
//     --only = 고치는 동안 일부만: main(열린 칸 네 판) · today(오늘 점수 · 쉬어 가는 날) · lock(잠금) · stale(못 돌린 날) · val(회사 값 한 줄) · data(서른여섯 곳 · 못 받음 · 새 자료꼴) · perf(고른 날 뒤 성적) · src(소스 검사)
//     브라우저는 한 번에 하나 · 판마다 새 칸(저장소가 따로) · 끝 코드 1 = 실패 있음(결과 파일은 --out 을 줄 때만)
//   기준 = 시험 서버의 /next/data/gdr.json + 결정표(docs/design/godori-2026-10-17/brief.md 「고르는 셈 결정표 gdr-v1」 — gdr-v1 일 때만 · gdr-v2 는 꼴 · 합 · 이름만) + brief2.md wrong-v1(따로 셈) ·
//          회사 값 = /atlas/data/co/<번호>.json(per · pbr · c.cap · close × days.json dates) 에서 이 파일이 따로 셈 · 코스피 = home.json · 이름은 rename.mjs(brand.js 한 곳) · 쓰지 않을 말은 words.js screenHits(한 곳)
//   ① 자료 — 번호 차례 · 비중 · 현금으로 둠 = 100 − 비중 합 · 이름 · 업종(mkt.json) · 종가(co 파일) · 이유 · wrong · (v1: 기준 숫자 · 격언 · 팔 선 · 절반 팔 선 칸이 남아 있음 — 화면에만 안 보임)
//   ② 두 폭(360×640 · 390×844) × 두 곳(첫 화면 #/ · #/gdr) — 칸 수 = 고도리 칸 + 현금으로 둠 · 칸마다 「n번」 · 이름 · 비중 · 높이 48px 넘고 서로 같음 · 처음엔 닫힘 ·
//      누르면 그 카드(이름 고리 · 「n번 · 업종」 · 이유 한 줄 · 틀린다면 이유 1 · 성적 · 회사 값 한 줄 · 비중 · 격언) · 다시 누르면 닫힘 · 키보드 Enter · 모든 카드 열어 봄
//   ③ #/gdr/<번호> — 그 카드가 열리고 화면 안에 보임 · 없는 번호 · 글자는 닫힌 채 · 첫 화면 「어떻게 골랐나 보기 ›」 → #/gdr
//   ④ 어떻게 골랐나 — 깔때기 수 = gdr.json counts · 기준 숫자 글 · 「조건 다섯」 · 「고도리 칸」 · 「현금으로 둠」 · 팔 선 · 절반 팔 선 줄 없음
//   ⑤ 이름 — 「고도리 칸 n곳」 있음 · 「고른 곳」 0([10] 3) · 옛 낱말(갈래 · 몸값 · 한 회사 한 표 · 큰 회사는 크게 · 20거래일 · 다섯 문 · 쉬는 돈) 0([10] 1)
//   ⑥ 자료를 바꾼 길 — gdr.json 못 받음 · 서른여섯 곳(긴 이름) · 새 자료꼴(gdr-v2 필드로 바꾼 사본)
//   ⑦ 모양 — 옆으로 넘침 0 · 칸 밖 0 · 누르는 자리 44px 넘게 · 글 17px 넘게 · 캔버스 0 · 쓰지 않을 말 0 · 화면 오류 0 · 글씨 가짓수 ≤ 6 · 글 시작 왼쪽 줄 ≤ 3(measure.mjs 와 같은 자) · 간격 0 · 8 · 16 · 24 · 음수 0 · 확인 못 한 것(?) 두 줄까지
//   ⑧ 잠금 — 기록 없음 · 덜 끝낸 기록 · 기억 못 하는 기계: 칸 높이 ≤ 64px · #/why 고리 하나 · 고른 회사 이름 0 · 칸 · 카드 · 깔때기 없음 · 같은 화면에서 질문을 마치면 그 자리에서 열림
//   ⑨ 고른 날 뒤 성적 · 못 돌린 날(⑨-2: gdr.json asOf < 사이트 자료 날 → 열린 카드마다 「고른 날 값 → 오늘 값」 두 날짜 · 두 종가를 close × dates 로 따로 셈 · 같은 날이면 0) · 회사 값 한 줄(⑨-3: PER · PBR · 회사 크기 · 1년 꼭대기 대비 · 빠지면 「?」 · 「업종 돈」 0)
//   ⑩ 오늘 판정 — 오늘 기록이 있으면 열린 칸 맨 위 「오늘 점수 준비 n / 22 · 다시 하기」 한 줄(→ #/why · n = todayResult().ready · 독립 셈과 맞댐) · 없으면 0 · 쉬어 가자면 #/ · #/gdr · #/gdr/1 에 「오늘은 담는 칸을 닫아 둘게」 한 줄만 · 기록이 바뀌면 그 자리에서 바뀜
//   ⑪ 법과 안전 — 화면 글에 「금액」「팔 선」「절반 팔 선」「담겠어」「팔겠어」 0 · 내 돈에서 셈한 원 금액 0 · 설명 못 하는 원 금액 0 · 내 돈 칸(input.gdr-in) 0 · 미리 심은 atlas:godori-money 그대로(쓰기 · 지우기 0) ·
//      어떤 요청 주소 · 본문에도 godori-money · 심은 금액 0 · 매매일지 기록(atlas:godori-why)을 이 화면이 바꾸지 않음 · 소스에 금지 글 0
//   ⑫ 새 자료꼴(gdr-v2 · G1c) — 곳마다 near(「가까스로 넘음」 문 이름) · mc(「한 달 뒤 고른 날 값보다 위 10번 중 lo~hi번」 + 「모형 가정 아래 추정 · 검증 전」 + 접은 「무엇을 넣어 셈했나」) · 격언 줄 없음 · 큰 업종 비중 합(위 끝) · 「세 곳이 함께 내린 날 n일」(못 세면 「?」)
//   ⑬ 어떻게 골랐나(gdr-v2) — 수 줄(목록 문 · 업종 자리 · 큰 업종 위 끝) · 기준 숫자(문턱 값 · 왜 이 값인가 · 긴 원 숫자 없음) · 「조금 움직이면 남는 곳 수」 접음 · 지난 성적 한 줄(gdr-back.json line.ko · 더 보기 = line.more · line.side 는 안 보임 · 파일 없으면 0) · 한 달 전 채점(score — 「다시 셈한 것」 · 곳마다 보기)
//   ⑭ 고른 곳 0 — 목록 · 분기 숫자 못 받음이면 「? … 아직 안 와서 지금은 담을 곳이 없어요」 + 접은 까닭 · 현금으로 둠 100 · 지어낸 곳 0
//   ⑯ 글씨 · 간격 · 높이([10] 5 ~ 10) — 17px 밑 글 0 · 글씨 가짓수 ≤ 6 · 글 시작 왼쪽 줄 ≤ 3 · 간격 0 · 8 · 16 · 24 · 음수 0 · 같은 칸 · 같은 카드는 같은 높이 · 금빛 「?」 두 줄 안(길면 「?」 한 줄 + 누르면 펼침)
//   ⑮ 목록 역할 — 바깥 칸 role=list · 줄마다 role=listitem 은 감싼 칸 · button.gdr-cell 에 role 0 · 누르는 것은 button 또는 a
//   실패가 하나라도 있으면 끝 코드 1(결과 파일은 --out 을 줄 때만)
import fs from 'node:fs/promises';
import path from 'node:path';
import {createRequire} from 'node:module';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {mkV2 as mkV2f} from './fixtures/gdr-v2-sample.mjs';
import {NEW_NAME, jsStrings} from './rename.mjs'; // 이름 = site/next/brand.js 한 곳(규칙 76) — 글자를 박지 않음
import {screenHits} from '../../../site/next/words.js'; // 쓰지 않을 말 한 곳(명령문 [4] 4 · 일꾼 C) — 「사라져」 같은 보통 말은 빼고 셈
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');
const argv = process.argv.slice(2);
const arg = (k, d) => { const i = argv.indexOf(k); return i >= 0 && argv[i + 1] != null && !argv[i + 1].startsWith('--') ? argv[i + 1] : d; };
/* 자료 판 — 기본은 세 판을 차례로(부모가 같은 검사를 판마다 따로 돌림 · 브라우저는 한 번에 하나): live = 시험 서버의 지금 gdr.json · v1sample = 저장소의 v1 표본(fixtures/gdr-v1-sample.json — 결정표대로 한 줄씩) · v2sample = 새 자료꼴 표본(이 파일이 만듦).
   하나만: --data live | v1sample | v2sample | 파일경로 — 고른 곳이 있는 자료로 모든 길을 돌아야 카드 · 성적 · 못 돌린 날이 진짜로 맞대지므로 live 가 고른 곳 0(gdr-v2 첫 파일)이어도 앞 두 판이 그 길을 돔 */
const DATA_ARG = arg('--data', null);
if (!DATA_ARG) {
  const strip = (a, ks) => { const o = []; for (let i = 0; i < a.length; i++) { if (ks.includes(a[i])) { i++; continue; } o.push(a[i]); } return o; };
  const sets = String(arg('--sets', 'live,v1sample,v2sample')).split(','), OUT0 = arg('--out', null), rest = strip(argv, ['--sets', '--out']), res = [];
  for (const set of sets) {
    console.log(`\n===== 자료 판: ${set} =====`);
    const o = OUT0 ? OUT0.replace(/\.json$/, '') + '.' + set + '.json' : null;
    const r = spawnSync(process.execPath, [process.argv[1], ...rest, '--data', set, ...(o ? ['--out', o] : [])], {stdio: 'inherit'});
    res.push([set, r.status]);
  }
  console.log('\n자료 판별 결과: ' + res.map(([k, v]) => `${k} ${v === 0 ? '실패 0' : '실패 있음(끝 코드 ' + v + ')'}`).join(' · '));
  process.exit(res.every(([, v]) => v === 0) ? 0 : 1);
}
const require = createRequire(String(arg('--pw', process.env.PW_DIR || '/opt/node-tools/')).replace(/\/?$/, '/')); // run_all.mjs 는 PW_DIR 로도 넘김
const {chromium} = require('playwright');
const base = arg('--base', 'http://127.0.0.1:8826').replace(/\/$/, ''), NEXT = arg('--path', '/next/?dev=1'), OUT = arg('--out', null), ALL = argv.includes('--all');
const ONLY = arg('--only', null) ? new Set(String(arg('--only')).split(',')) : null, want = k => !ONLY || ONLY.has(k);
const SITE_DATE = /^\d{4}-\d{2}-\d{2}$/.test(arg('--site-date', '') ?? '') ? arg('--site-date') : null; // 올리기 검사처럼 사이트 자료 날이 고른 날보다 새인 때를 따라 해 봄(사이트 날만 바꿔치기 — mkt.json · days.json 의 asOf · 회사 파일은 그대로)
const fails = [], counts = {}, t0 = Date.now();
const fail = (k, x) => { counts.fail = (counts.fail || 0) + 1; if (fails.length < 500) fails.push([k, String(x).slice(0, 400)]); };
const bump = (k, n = 1) => { counts[k] = (counts[k] || 0) + n; };
const mx = (k, v) => { if (v > (counts[k] ?? -1)) counts[k] = v; }; // 화면들 가운데 가장 큰 값(글씨 가짓수 · 왼쪽 줄 …) — 결과 문서에 숫자로 남김
const eq = (a, b) => JSON.stringify(a) === JSON.stringify(b);
const clone = x => JSON.parse(JSON.stringify(x));
const w10 = w => Math.round(w * 10); // 비중 × 10(정수 — 2.5 → 25)

const KEY = 'atlas:godori-money', WHY_KEY = 'atlas:godori-why';
const MONEY = 8765432; // 미리 심는 내 돈(화면이 읽어도 쓰지 않아야 하는 값 — 비중으로 셈한 금액이 화면에 나오면 바로 드러나게 낯선 수)
const MONEY_SECRETS = ['godori-money', '8765432', '8,765,432', '8%2C765%2C432', '8 765 432'];
const FORBID = ['금액', '팔 선', '절반 팔 선', '담겠어', '팔겠어', '담겠', '팔겠']; // [9] 1 — 앞 다섯은 명령문 글자 그대로 · 뒤 둘은 같은 말의 줄기
const OLD_WORDS = [['갈래', /갈래/], ['몸값', /몸값/], ['한 회사 한 표', /한 회사 한 표/], ['큰 회사는 크게', /큰 회사는 크게/], ['20거래일', /(?<![0-9])20거래일/], ['다섯 문', /다섯 문/], ['쉬는 돈', /쉬는 돈/]]; // [10] 1 — 만든 낱말(새 글에는 처음부터 새 낱말)
const OLD_MARKS = ['업종 돈', '고른 곳', '내 돈']; // [8] 9 · [10] 3 · [9] 4 — 이 화면 글에는 없어야 하는 말
const compact = t => String(t ?? '').normalize('NFKC').replace(/[\s​-‍﻿]+/g, '');
const BAD_RE = FORBID.map(w => [w, compact(w)]);
const DONE = (daysAgo = 1, answers = [2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]) => ({at: new Date(Date.now() - daysAgo * 864e5).toISOString(), answers, score: 0, reds: 0, verdict: '좋아, 정해 둔 대로만', groups: {}, picks: []}); // 열한 질문을 끝낸 기록 하나(어제 — 오늘 기록 아님)
const VERD = {go: '좋아, 정해 둔 대로만', wait: '반만 준비됐어', rest: '오늘은 쉬어 가자'};
const ANS = {go22: [2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], go20: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], wait16: [1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0], rest: [2, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0]}; // p-why.js judge() 와 맞는 답(점수 0 · 2 · 6 · 2(쉬어 가는 답))
const SCORE = {go22: 0, go20: 2, wait16: 6, rest: 2};
// 오늘(서울) 기록의 때 — 서울 자정 바로 뒤(예: 00:10)에 「20분 전」이 어제로 넘어가 검사가 멈추던 일(2026-10-19 00:20 서울 모든 쪽 검사 · gdr 셋) → 자정 뒤 지난 시간 안으로 줄여 순서는 그대로
const backMs = minAgo => { const now = Date.now(), lim = (now + 9 * 36e5) % 864e5 - 1000; return minAgo * 6e4 * Math.min(1, Math.max(0, lim) / (121 * 6e4)); }; // 가장 긴 「120분 전」이 자정 뒤에 들어가게 모두 같은 비로 줄임
const todayRec = (kind, minAgo = 5) => { const v = kind.startsWith('go') ? 'go' : kind.startsWith('wait') ? 'wait' : 'rest'; return {at: new Date(Date.now() - backMs(minAgo)).toISOString(), answers: ANS[kind], score: SCORE[kind], reds: 0, verdict: VERD[v], groups: {}, picks: []}; };
const seoulDay = ms => new Date(ms + 9 * 36e5).toISOString().slice(0, 10);
/** 오늘 판정 — 이 파일이 따로 셈(p-why.js 를 열지 않음): 오늘(서울) 끝낸 가장 새 기록 · 열한 답이 모두 있어야 · 준비 = 22 − 점수 */
function expToday(recs) {
  const day = seoulDay(Date.now()), inv = {[VERD.go]: 'go', [VERD.wait]: 'wait', [VERD.rest]: 'rest'}; let best = null;
  for (const r of recs ?? []) {
    const full = Array.isArray(r?.answers) && r.answers.length === 11 && r.answers.every(k => Number.isInteger(k) && k >= 0 && k <= 2), t = Date.parse(r?.at);
    if (!full || !(t > 0) || seoulDay(t) !== day || !inv[r.verdict]) continue;
    if (!best || t > Date.parse(best.at)) best = r;
  }
  return best ? {verdict: inv[best.verdict], ready: 22 - best.score} : null;
}

/* 소스 — 고도리 칸 쪽 파일 */
const SRC_JS = await fs.readFile(path.join(ROOT, 'site/next/p-gdr.js'), 'utf8').catch(() => ''), SRC_CSS = await fs.readFile(path.join(ROOT, 'site/next/p-gdr.css'), 'utf8').catch(() => '');

/* 자료(시험 서버에서) — gdr.json 은 --data 로 고른 판(live 면 서버의 지금 파일 · 아니면 이 판을 쪽마다 길 바꿔 끼움) */
const getJ = async f => { const r = await fetch(base + f, {cache: 'no-store'}); if (!r.ok) throw Error(f + ' ' + r.status); return r.json(); };
const V1S = JSON.parse(await fs.readFile(path.join(ROOT, 'scripts/atlas11/next/fixtures/gdr-v1-sample.json'), 'utf8')); // v1 표본(2026-10-13 · 3곳 · 결정표대로) — 저장소 HEAD 의 gdr.json 에서 옮김
const mkV2 = (n = 3) => mkV2f(V1S, n); // 새 자료꼴 표본(fixtures/gdr-v2-sample.mjs)
const loadG = async () => DATA_ARG === 'live' ? getJ('/next/data/gdr.json') : DATA_ARG === 'v1sample' ? clone(V1S) : DATA_ARG === 'v2sample' ? mkV2(3) : JSON.parse(await fs.readFile(path.resolve(DATA_ARG), 'utf8'));
const ROUTE_G = DATA_ARG === 'live' ? null : await loadG(); // 쪽이 받는 gdr.json 을 이 판으로 길 바꿈(live 는 서버 그대로)
const [G, MKT, HOME, DAYS] = await Promise.all([ROUTE_G ?? loadG(), ...['/atlas/data/mkt.json', '/atlas/data/home.json', '/atlas/data/days.json'].map(f => getJ(f).catch(e => { fail('자료', e.message); return null; }))].map(x => Promise.resolve(x).catch(e => { fail('자료', e.message); return null; })));
if (!G || !Array.isArray(G.picks) || !MKT || !DAYS) { console.log(JSON.stringify({counts, fails}, null, 1)); process.exit(1); }
const BACK = await getJ('/next/data/gdr-back.json').catch(() => null), BACK_KO = typeof BACK?.line?.ko === 'string' && BACK.line.ko.trim() ? BACK.line.ko.trim() : null; // G2b 지난 성적 한 줄(없으면 화면에도 없어야 함)
/** 지난 성적 파일(gdr-back.json)은 gdr-v2 꼴 자료일 때만 받고 보임(2026-10-18 13:20 — 처음 올림은 v1 + 이 파일 없음 → 받으면 콘솔에 404). v1 이면 줄 · 접은 칸 · 요청 모두 0 */
const backOn = D => !!D && typeof D === 'object' && D.version !== 'gdr-v1' && (Array.isArray(D.rules) || D.version === 'gdr-v2');
if (SITE_DATE) { MKT.asOf = SITE_DATE; DAYS.asOf = SITE_DATE; }
console.log(`자료 판 ${DATA_ARG} · ${G.version} · ${G.picks.length}곳 · 고른 날 ${G.asOf} · 사이트 ${MKT.asOf}`);
const V1 = G.version === 'gdr-v1', V2 = !!G.version && G.version !== 'gdr-v1'; // v1 = 결정표대로 한 줄씩 맞댐 · 그 밖 = 꼴 · 합 · 이름 · 화면만
const v1 = D => D.version === 'gdr-v1'; // 맞대는 자료마다(바꿔 끼운 새 자료꼴 판은 v1 파일 위에서도 v2 로 맞댐)

/* 기준 — gdr-v1 결정표(brief.md): 사장님 원문 격언 열한 개 · 다섯 문 이름 · gdr.json 꼴의 기준 숫자(rules) · brief2.md 「틀린다면 이유」 wrong-v1 */
const BRIEF = await fs.readFile(path.join(ROOT, 'docs/design/godori-2026-10-17/brief.md'), 'utf8').catch(() => '');
const BRIEF2 = await fs.readFile(path.join(ROOT, 'docs/design/godori-2026-10-17/brief2.md'), 'utf8').catch(() => '');
const SAYINGS = [];
for (const line of ((BRIEF.split('[질문 열한 개')[1] ?? '').split('[명령]')[0] ?? '').split('\n')) { const m = /^(\d{1,2}) .+? -(.+)$/u.exec(line.trim()); if (m) SAYINGS.push(m[2].trim()); }
const GATES = ((/다섯 문으로 걸러라: ([^\n]+?)\n/.exec(BRIEF) || [])[1] ?? '').split(' · ').map(s => s.trim()).filter(Boolean);
const RULES = (() => { try { return JSON.parse((/"rules": (\{[^}]*\})/.exec(BRIEF) || [])[1]); } catch { return null; } })();
const WR = (() => { // wrong-v1 — 줄마다 [조건 숫자, 글 틀] (위에서부터 처음 맞는 하나)
  const t = (BRIEF2.split('wrong-v1')[1] ?? '').split('\n## ')[0], g = re => re.exec(t) || [];
  const [, r60, s1] = g(/1\. r60 ≥ ([\d.]+) → 「(.+?)」/), [, low, s2] = g(/2\. low250x ≥ ([\d.]+) → 「(.+?)」/), [, ind, s3] = g(/3\. indX < ([\d.]+) → 「(.+?)」/), [, op, s4] = g(/4\. opGrow .*?< ([\d.]+) → 「(.+?)」/), [, s5] = g(/5\. 그 밖 → 「(.+?)」/);
  return r60 && low && ind && op && s5 ? {r60: +r60, low: +low, ind: +ind, op: +op, s: [s1, s2, s3, s4, s5]} : null;
})();
if (V1 && (SAYINGS.length !== 11 || GATES.length !== 5 || !RULES || !WR)) { console.error('결정표(brief.md · brief2.md)에서 격언 · 다섯 문 · 기준 숫자 · wrong-v1 을 못 읽음', SAYINGS.length, GATES.length, RULES, WR); process.exit(1); }

/* 글 꼴(화면과 같은 꼴 — 셈은 정수로 따로) */
const comma = n => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
const wonT = n => comma(Math.round(n)) + '원';
const wTxt = w => (Number.isInteger(w) ? String(w) : (+w).toFixed(1)) + '%';
const amt = (money, w) => Number(BigInt(money) * BigInt(w10(w)) / 1000n); // floor(내 돈 × 비중 ÷ 100) — 이 값이 화면에 있으면 안 됨
const nTxt = x => (x == null ? '?' : comma(x));
const mdTxt = d => { const p = String(d ?? '').split('-'); return p.length === 3 ? `${+p[1]}월 ${+p[2]}일` : '?'; };
const r1 = x => Math.sign(x) * Math.floor(Math.abs(x) * 10 + 0.5 + 1e-7) / 10;
const pct = x => { const v = r1(x), a = Math.abs(v); return (v > 0 ? '+' : v < 0 ? '−' : '') + (a >= 100 ? comma(Math.floor(a + 0.5 + 1e-7)) : a.toFixed(1)) + '%'; };
const one = x => (Math.floor(Math.abs(x) * 10 + 0.5 + 1e-7) / 10).toFixed(1);
/** 파이썬 format(.Nf)과 같은 반올림 — 딱 가운데면 짝수 쪽(두 꼴을 함께 받아 둠) */
const pyF = (x, d) => { const a = x.toFixed(d), m = x * 10 ** d, f = Math.floor(m); if (Math.abs(m - f - 0.5) > 1e-9) return [a]; const ev = (f % 2 === 0 ? f : f + 1) / 10 ** d; return [...new Set([a, ev.toFixed(d)])]; };
/** wrong-v1 — 고른 곳의 g 값으로(반올림 전 값 · 경계는 정확히) → 받을 수 있는 글들 */
function wrongOf(g) {
  if (!g || !WR) return [];
  if (g.r60 >= WR.r60) return pyF(g.r60, 0).map(v => WR.s[0].replace('{r60:.0f}', v));
  if (g.low250x >= WR.low) return pyF(g.low250x, 1).map(v => WR.s[1].replace('{low250x:.1f}', v));
  if (g.indX < WR.ind) return [WR.s[2]];
  if (g.opGrow == null || g.opGrow < WR.op) return [WR.s[3]];
  return [WR.s[4]];
}
const reasonExp = s => String(s ?? '').replace(/업종 돈(\s*[\d.]+배)/g, '업종 거래$1'); // [8] 9 — 이유의 n배는 「업종 거래 n배」
const maxOfD = D => D.limits?.max ?? D.max ?? 36, maxPicks = maxOfD(G);

/* 회사 값 — co/<번호>.json 에서 따로 셈(화면 코드를 열지 않음): PER · PBR · 회사 크기(억 원) · 지난 1년 가장 높은 종가 대비 · 종가 줄 × days.json 날짜 */
const dates = Array.isArray(DAYS.dates) ? DAYS.dates : [];
const COF = new Map(); // 번호 → co 파일 통째(못 받으면 null)
const coGet = async code => { if (!COF.has(code)) COF.set(code, await getJ('/atlas/data/co/' + code + '.json').catch(() => null)); return COF.get(code); };
const oneYearBefore = d => { const [y, m, dd] = d.split('-').map(Number), t = new Date(Date.UTC(y - 1, m - 1, dd)); return t.toISOString().slice(0, 10); };
function infoExp(co) {
  if (!co || typeof co !== 'object') return null;
  const cl = Array.isArray(co.close) ? co.close : [], k0 = Number.isInteger(co.k0) ? co.k0 : null, fin = x => (typeof x === 'number' && Number.isFinite(x) ? x : null);
  const series = k0 == null ? [] : cl.map((c, i) => [dates[k0 + i], c]).filter(([d, c]) => d && c > 0);
  const last = series.at(-1) ?? null; let hiPct = null;
  if (last) { const y0 = oneYearBefore(last[0]), hi = Math.max(...series.filter(([d]) => d > y0 && d <= last[0]).map(([, c]) => c)); if (hi > 0) hiPct = (last[1] / hi - 1) * 100; }
  return {per: fin(co.per) ?? fin(co.c?.per), pbr: fin(co.pbr), cap: fin(co.c?.cap), last: last?.[1] ?? null, lastD: last?.[0] ?? null, hiPct, closeOn: d => series.find(([x]) => x === d)?.[1] ?? null};
}
/** 화면 「PER … · PBR … · 회사 크기 … · 1년 꼭대기 대비 …」 한 줄 읽기 → 네 값(없으면 null · 「?」면 '?') */
function parseVal(t) {
  const s = String(t ?? '').replace(/\s+/g, ' '), g = re => (re.exec(s) || [])[1] ?? null;
  const cap = (re => { const m = re.exec(s); if (!m) return null; const x = m[1].trim(); if (x === '?') return '?'; const j = /([\d,]+)조/.exec(x), e = /([\d,]+)억/.exec(x); return (j ? +j[1].replace(/,/g, '') * 10000 : 0) + (e ? +e[1].replace(/,/g, '') : 0); })(/회사 크기 (\?|[^·]*?원)(?= ·|$)/);
  return {per: g(/PER (\?|[\d,]+\.?\d*)/), pbr: g(/PBR (\?|[\d,]+\.?\d*)/), cap, hi: g(/1년 꼭대기 대비 (\?|[+−-]?[\d,]+\.?\d*%)/)};
}
/** 화면에 적힌 수가 참값을 그 자리(소수 자리)에서 맞게 반올림한 값인가 — 자리가 모자라거나 남아도(PER 소수 한 자리 · PBR 두 자리가 아니면) 틀림 */
function roundOk(txt, truth, minDec) {
  if (truth == null) return txt === '?';
  if (txt == null || txt === '?') return false;
  const dec = (String(txt).split('.')[1] ?? '').length, v = Number(String(txt).replace(/,/g, ''));
  return dec === minDec && Math.abs(v - truth) <= 0.5 * 10 ** -dec + 1e-9; // 소수 자리는 딱 맞게(PER 한 자리 · PBR 두 자리 — 끝 0 도 적음)
}
function checkVal(line, I, at) {
  const v = parseVal(line);
  if (!v.per && !v.pbr && v.cap == null && !v.hi) { fail('회사 값 한 줄(PER · PBR · 회사 크기 · 1년 꼭대기 대비)', `${at} 「${line}」`); return; }
  if (!roundOk(v.per, I?.per ?? null, 1)) fail('PER(co 파일 per · 소수 한 자리)', `${at} 화면 「${v.per}」 · 파일 ${I?.per ?? '없음'}`);
  if (!roundOk(v.pbr, I?.pbr ?? null, 2)) fail('PBR(co 파일 pbr · 소수 두 자리)', `${at} 화면 「${v.pbr}」 · 파일 ${I?.pbr ?? '없음'}`);
  if (I?.cap == null ? v.cap !== '?' : v.cap !== Math.round(I.cap)) fail('회사 크기(co 파일 c.cap 억 원)', `${at} 화면 「${v.cap}」 · 파일 ${I?.cap ?? '없음'}`);
  const hiWant = I?.hiPct == null ? '?' : pct(I.hiPct).replace('+', '');
  if (v.hi !== hiWant && !(I?.hiPct != null && Math.abs(I.hiPct) < 0.05 && /^[+−-]?0\.0%$/.test(v.hi ?? ''))) fail('1년 꼭대기 대비(close 지난 1년 가장 높은 종가 · 따로 셈)', `${at} 화면 「${v.hi}」 ≠ 「${hiWant}」`);
  bump('맞댄 회사 값 한 줄');
}
/** 못 돌린 날 줄 — 「고른 날 M월 D일 N원 → M월 D일 N원」 · 두 값 = 회사 파일 close × days.json 날짜(그 날이 없을 때만 gdr.json 값) */
function staleWant(D, p, I) {
  const p0 = I?.closeOn(D.asOf) ?? (p.price > 0 ? p.price : null), p1 = I?.last ?? null, d1 = I?.lastD ?? null;
  return `고른 날 ${mdTxt(D.asOf)} ${p0 ? wonT(p0) : '?'} → ${d1 ? mdTxt(d1) : '?'} ${p1 ? wonT(p1) : '?'}`;
}
const isStale = D => !!(D.asOf && MKT.asOf && D.asOf < MKT.asOf);

/* ① 자료 — 결정표대로인지(만든 일꾼과 따로) */
const STALE = isStale(G); // 고른 날(거래량이 있는 모음 날)이 사이트 자료 날보다 앞섬 — 화면이 밝혀야 함
const COS = new Map(); // 번호 → co 파일 c(오늘 값 · 날) — 성적 따로 셈
{
  const P = G.picks, C = G.counts ?? {};
  if (V1 ? G.schema !== 'godori-gdr-1' : !/^godori-gdr-/.test(G.schema ?? '')) fail('자료 꼴', G.schema);
  if (G.asOf > MKT.asOf) fail('자료 날짜', `gdr ${G.asOf} 가 사이트 ${MKT.asOf} 보다 새것`); // 고른 날이 사이트 자료보다 앞서면 화면이 「? 고른 날은 … 종가예요」로 밝혀야 함 — 아래 STALE
  if (P.length > maxPicks) fail(`${NEW_NAME} 칸 곳 수 > 위 끝`, `${P.length} > ${maxPicks}`);
  if (C.picked !== P.length) fail(`${NEW_NAME} 칸 곳 수(counts.picked)`, `${C.picked} ≠ ${P.length}`);
  const sum10 = P.reduce((s, p) => s + w10(p.w), 0);
  if (w10(C.cash) !== 1000 - sum10) fail('현금으로 둠 = 100 − 비중 합', `${C.cash} · 비중 합 ${sum10 / 10}`);
  if (V1) {
    if (G.base !== 10000000) fail('기본 돈(v1 칸이 남아 있음)', G.base);
    const keySorted = o => (o && typeof o === 'object' && !Array.isArray(o) ? Object.fromEntries(Object.entries(o).sort(([a], [b]) => (a < b ? -1 : 1))) : o);
    if (!eq(keySorted(G.rules), keySorted(RULES))) fail('기준 숫자(rules ≠ 결정표)', JSON.stringify(G.rules));
    if (!eq(G.sayings, SAYINGS)) fail('격언 열한 개(원문 차례 · 글자)', JSON.stringify(G.sayings).slice(0, 200));
    if (!(C.picked <= C.passAll && C.passAll <= Math.min(C.g1, C.g2, C.g3, C.g4, C.g5))) fail('다섯 문 수', JSON.stringify(C));
    if ([C.g1, C.g2, C.g3, C.g4, C.g5].some(g => !(g <= C.afterOut))) fail('문마다 수 > 남은 곳', JSON.stringify(C));
    if (C.companies !== C.outThin + C.outHalt + (C.managed ?? 0) + C.afterOut) fail('먼저 뺀 수 + 남은 곳 ≠ 회사 주식', JSON.stringify(C));
    if (!(C.companies <= C.listed)) fail('회사 주식 > 상장 종목', JSON.stringify(C));
    if (P.length === 36 && C.cash !== 10) fail('36곳이면 현금 10', C.cash);
  }
  const byInd = {};
  const sellK = V1 ? w10(RULES.sell) : 0, halfK = V1 ? w10(RULES.half) : 0;
  const cos = await Promise.all(P.map(p => coGet(p.code)));
  P.forEach((p, i) => {
    const at = `${p.no}번 ${p.name}`;
    if (cos[i]?.c) COS.set(p.code, cos[i].c);
    if (p.no !== i + 1) fail('번호 차례', `${i + 1}째 = ${p.no}`);
    if (V1) { const wantW = p.no <= 12 ? 3 : p.no <= 24 ? 2.5 : 2; if (p.w !== wantW) fail('비중(1 ~ 12번 3 · 13 ~ 24번 2.5 · 25 ~ 36번 2)', `${at} ${p.w} ≠ ${wantW}`); } else if (!(p.w > 0)) fail('비중', `${at} ${p.w}`);
    const o = MKT.companies[p.code];
    if (!o) fail('회사 주식 밖 번호', at); else { if (o.n !== p.name) fail('이름(mkt.json)', `${at} ≠ ${o.n}`); if (o.i !== p.ind) fail('업종(mkt.json)', `${at} ${p.ind} ≠ ${o.i}`); }
    if (!(Number.isInteger(p.price) && p.price > 0)) fail('종가', `${at} ${p.price}`);
    else if (V1) { // v1 은 팔 선 · 절반 팔 선 칸이 남아 있음(화면에만 안 보임 — [9] 1 「기록은 지우지 마라」)
      if (!(Number.isInteger(p.sell) && Number.isInteger(p.half))) fail('자료에 sell · half 칸이 남아 있음([9] 1)', `${at} sell ${p.sell} half ${p.half}`);
      else {
        if (p.sell !== Math.floor(p.price * sellK / 10)) fail('팔 선 = 종가 × 0.9(원 아래 버림)', `${at} ${p.sell} ≠ ${Math.floor(p.price * sellK / 10)}`);
        if (p.half !== Math.floor(p.price * halfK / 10)) fail('절반 팔 선 = 종가 × 1.2(원 아래 버림)', `${at} ${p.half} ≠ ${Math.floor(p.price * halfK / 10)}`);
      }
    }
    if (p.price > 0) { const c = cos[i]?.c; if (c?.priceDate === G.asOf) { if (c.price !== p.price) fail('종가(co 파일 같은 날)', `${at} ${p.price} ≠ ${c.price}`); else bump('맞댄 종가'); } else bump('종가 날이 달라 안 맞댐'); }
    if (V1) {
      if (p.saying !== (p.no - 1) % 11) fail('격언 차례((번호 − 1) % 11)', `${at} ${p.saying}`);
      if (!String(p.reason ?? '').startsWith(`영업이익 ${p.g?.opPrev}억 → ${p.g?.opLast}억 · 석 달 `) || !/ · 석 달 [+-]\d+\.\d% · 업종 돈 \d+\.\d배$/.test(p.reason ?? '')) fail('이유 한 줄 꼴', `${at} 「${p.reason}」`);
      if (!wrongOf(p.g).includes(p.wrong)) fail('틀린다면 이유(wrong-v1 따로 셈 · brief2.md)', `${at} 「${p.wrong}」 ∉ ${JSON.stringify(wrongOf(p.g))}`); else bump('맞댄 틀린다면 이유');
    } else if (/업종 돈/.test(p.reason ?? '')) fail('새 자료 이유에 「업종 돈」', `${at} 「${p.reason}」`);
    (byInd[p.ind] ??= []).push(p);
  });
  if (V1) for (const [ind, xs] of Object.entries(byInd)) {
    if (xs.length > 3) fail('한 업종 세 곳까지', `${ind} ${xs.length}곳`);
    const s = xs.reduce((a, p) => a + w10(p.w), 0); if (s > 90) fail('한 업종 비중 합 9 이하', `${ind} ${s / 10}`);
    if (G.inds && w10(G.inds[ind] ?? -1) !== s) fail('inds(업종마다 비중 합)', `${ind} ${G.inds[ind]} ≠ ${s / 10}`);
  }
  bump('맞댄 자료 곳', P.length);
}

/* ⑨ 고른 날 뒤 성적 — 따로 셈(회사 = co 파일 오늘 값 ÷ 고른 날 값 · 코스피 = home.json 두 날 값 · 날짜가 안 맞으면 「?」) */
const kRows = H => (Array.isArray(H?.idx?.KOSPI?.rows) ? H.idx.KOSPI.rows.filter(r => Array.isArray(r) && typeof r[0] === 'string' && r[1] > 0) : []);
function perfExp(D, H, cos) {
  const rows = kRows(H), K = new Map(rows.map(r => [r[0].slice(0, 10), r[1]])), at = D.asOf, per = new Map();
  for (const p of D.picks) {
    const c = cos.get(p.code), now = c?.price > 0 ? c.price : null, d = typeof c?.priceDate === 'string' ? c.priceDate.slice(0, 10) : null;
    if (!now || !d || !(p.price > 0) || d < at) { per.set(p.code, {miss: true}); continue; }
    const k0 = K.get(at), k1 = K.get(d), ok = !!(k0 && k1);
    per.set(p.code, {r: (now / p.price - 1) * 100, kr: ok ? (k1 / k0 - 1) * 100 : null, d, n: ok ? rows.filter(x => x[0] > at && x[0] <= d).length : null, zero: d === at});
  }
  return per;
}
const perfCardTxt = (D, x) => (!x || x.miss ? '? 고른 날 뒤 값을 못 받았어요.' : x.zero ? `고른 날(${mdTxt(D.asOf)}) 뒤로 아직 잴 날이 없어요.` : `고른 날(${mdTxt(D.asOf)}) 뒤 이 회사 ${pct(x.r)} · 같은 때 코스피 ${x.kr == null ? '?' : pct(x.kr)}`);
function perfBoxTxt(D, per) {
  const ok = D.picks.filter(p => !per.get(p.code)?.miss), miss = D.picks.length - ok.length, out = [];
  const days = [...new Set(ok.map(p => per.get(p.code).d))];
  if (!ok.length) out.push(`? ${NEW_NAME} 칸 회사의 지금 값을 하나도 못 받았어요.`);
  else if (days.length > 1) out.push('? 날짜가 달라 묶음은 못 셌어요. 카드마다 봐 주세요.');
  else if (days[0] === D.asOf) out.push(`고른 날(${mdTxt(D.asOf)}) 종가가 마지막 자료라 아직 잴 날이 없어요. 자료가 새로 오면 같은 때 코스피와 함께 보여 줄게요.`);
  else {
    const f = per.get(ok[0].code), ws = ok.reduce((s, p) => s + p.w, 0), r = ok.reduce((s, p) => s + p.w * per.get(p.code).r, 0) / ws;
    out.push(`${mdTxt(D.asOf)} → ${mdTxt(days[0])} · ${f.n == null ? '?' : f.n}거래일`, `${NEW_NAME} 칸 ${ok.length}곳 묶음(비중대로) ${pct(r)}`, `같은 때 코스피 ${f.kr == null ? '?' : pct(f.kr)}`);
    if (f.kr == null) out.push('? 같은 날 코스피 값이 자료에 없어 견주지 못했어요.');
    else { const df = r - f.kr; out.push(one(df) === '0.0' ? '코스피와 거의 같아요.' : `코스피보다 ${one(df)}%p ${df > 0 ? '높아요' : '낮아요'}.`); }
    if (ok.length >= 2) {
      const worst = ok.reduce((a, p) => (per.get(p.code).r < per.get(a.code).r ? p : a)), best = ok.reduce((a, p) => (per.get(p.code).r > per.get(a.code).r ? p : a));
      out.push(`가장 나쁜 곳 ${worst.no}번 ${worst.name} ${pct(per.get(worst.code).r)}`, `가장 좋은 곳 ${best.no}번 ${best.name} ${pct(per.get(best.code).r)}`);
    }
    out.push('시장이 오르면 아무 회사나 올라요. 그래서 같은 때 코스피와 같이 봐요. 날이 적을수록 우연이 커요.');
  }
  if (miss) out.push(`? ${miss}곳은 지금 값을 못 받아 묶음에서 뺐어요.`);
  return out;
}
const PE = perfExp(G, HOME, COS); // 자료 그대로의 기대 성적

/* 브라우저 — 한 번에 하나 · 판마다 새 칸(기억이 따로) */
const exe = '/opt/pw-browsers/chromium', browser = await chromium.launch((await fs.stat(exe).catch(() => null)) ? {executablePath: exe} : {});
/** gdr = 바꿔 줄 gdr.json(404 = 못 받게) · store: 'ok' · 'throw'(localStorage 막힘) · why = 미리 심을 매매일지 기록(배열 · 기본 = 어제 끝낸 기록 하나 · [] = 기록 없음) ·
    money = 미리 심을 atlas:godori-money(없으면 안 심음) · routes = 더 바꿔 줄 길 · allow = 일부러 못 받게 한 파일(그 404 는 오류로 안 셈) */
async function newPage(width, height, {gdr: gdr0 = undefined, store = 'ok', why = [DONE()], money = MONEY, routes = [], allow = []} = {}) {
  const gdr = gdr0 === undefined ? ROUTE_G : gdr0;
  const ctx = await browser.newContext({viewport: {width, height}, deviceScaleFactor: 1, hasTouch: true, locale: 'ko-KR', timezoneId: 'Asia/Seoul'});
  if (store === 'throw') await ctx.addInitScript(() => { Object.defineProperty(window, 'localStorage', {configurable: true, get() { throw new DOMException('막힘', 'SecurityError'); }}); });
  else await ctx.addInitScript(([wk, wv, mk, mv]) => { // 저장소를 지켜봄(쓰기 · 지우기 · 읽기 기록) · 미리 심기는 기록 밖(원래 함수로)
    try {
      const P = Storage.prototype, o = {get: P.getItem, set: P.setItem, rm: P.removeItem, clr: P.clear};
      window.__st = []; window.__raw = {get: k => o.get.call(localStorage, k), set: (k, v) => o.set.call(localStorage, k, v), rm: k => o.rm.call(localStorage, k)};
      const log = (op, k) => { try { window.__st.push([op, String(k), String(new Error().stack).split('\n').slice(2, 4).join(' | ').slice(0, 200)]); } catch { /* 기록 못 함 */ } };
      P.getItem = function (k) { if (this === localStorage) log('get', k); return o.get.call(this, k); };
      P.setItem = function (k, v) { if (this === localStorage) log('set', k); return o.set.call(this, k, v); };
      P.removeItem = function (k) { if (this === localStorage) log('rm', k); return o.rm.call(this, k); };
      P.clear = function () { if (this === localStorage) log('clear', ''); return o.clr.call(this); };
      if (wv != null && o.get.call(localStorage, wk) == null) o.set.call(localStorage, wk, wv);
      if (mv != null && o.get.call(localStorage, mk) == null) o.set.call(localStorage, mk, mv);
    } catch { /* 저장소 못 씀 */ }
  }, [WHY_KEY, why ? JSON.stringify(why) : null, KEY, money != null ? String(money) : null]);
  if (gdr === 404) await ctx.route('**/next/data/gdr.json', r => r.fulfill({status: 404, contentType: 'text/plain', body: 'no'}));
  else if (gdr) await ctx.route('**/next/data/gdr.json', r => r.fulfill({status: 200, contentType: 'application/json', body: JSON.stringify(gdr)}));
  if (SITE_DATE) for (const f of ['mkt', 'days']) await ctx.route(`**/atlas/data/${f}.json`, async r => { const resp = await r.fetch(); const j = JSON.parse(await resp.text()); j.asOf = SITE_DATE; await r.fulfill({status: 200, contentType: 'application/json', body: JSON.stringify(j)}); });
  for (const [pat, fn] of routes) await ctx.route(pat, fn);
  const p = await ctx.newPage(); p._errs = []; p._reqs = []; p._st = []; p._money = money; p._why = why ? JSON.stringify(why) : null; p._store = store; p._v2 = backOn(gdr ?? G);
  const allowed = u => allow.some(a => String(u || '').includes(a));
  p.on('pageerror', e => p._errs.push('pageerror ' + e.message));
  p.on('console', m => { if (m.type() !== 'error') return; const u = m.location()?.url; if (/Failed to load resource/.test(m.text()) && allowed(u)) return; p._errs.push(m.text() + (u ? ' @ ' + u : '')); });
  p.on('response', r => { if (r.status() >= 400 && r.url().startsWith(base) && !allowed(r.url())) p._errs.push(r.status() + ' ' + r.url()); });
  p.on('request', r => { let b = null; try { b = r.postData(); } catch { /* 본문 없음 */ } p._reqs.push({u: r.url(), m: r.method(), b, h: r.headers()}); });
  p.on('websocket', ws => ws.on('framesent', f => p._reqs.push({u: ws.url(), m: 'WS', b: String(f.payload), h: {}})));
  return p;
}
const errsOf = (p, tag) => { if (p._errs.length) { fail('화면 오류', tag + ' · ' + p._errs.slice(0, 3).join(' | ')); p._errs.length = 0; } };
const SEL = '#view section.gdr';
/** 다 그려질 때까지 — 칸이 있고 · 「여는 중」 없고 · 성적 · 회사 값을 받는 중이 아님 · aria-busy 가 빠짐(고른 곳 0 은 받는 중 글이 없어 이 표시로 「고른 날 · 사이트 날」 줄까지 기다림 — 2026-10-18 올리기 검사에서 느린 망이면 그 줄보다 먼저 읽어 걸림) (잠금 · 쉬어 가는 날은 바로) */
const settle = p => p.waitForFunction(s => { const b = document.querySelector(s); if (!b || document.querySelector('#view .boot')) return false; if (/\block1\b|\brest1\b/.test(b.className)) return true; if (b.getAttribute('aria-busy') === 'true') return false; return !/셈하는 중|받는 중/.test(b.textContent); }, SEL, {timeout: 30000});
/* 흰 첫 화면(사장님 2026-10-19 02:03 「구글과 잡스 판」 · 일꾼 C 다시 겨눔) — 첫 화면(#/)에는 큰 칸(section.gdr)이 없고 바로 가기 넷 [data-w="gdr"] 의 첫 고리만 있음
   열한 질문을 끝낸 기기 = #/gdr · 그 전 = #/why(본질 문 ④ · 잠금) · 첫 화면 어디에도 칸 번호 길(#/gdr/n) · 큰 칸 없음 → 칸 검사는 그 고리를 따라 #/gdr 에서 그대로 함
   길 목록의 '#/' 판은 이 문을 지난 뒤 #/gdr 에서 옛 검사를 모두 돎(지키던 것은 하나도 빼지 않음 · 첫 화면 몫은 이 문이 맡음) */
async function homeGate(p, tag = '#/') {
  await p.waitForFunction(() => !!document.querySelector('#view [data-w="gdr"] a[href]') && !document.querySelector('#view .boot'), null, {timeout: 30000}).catch(() => {});
  const r = await p.evaluate(K => {
    let done = false; // 따로 셈 — p-gdr opened() 의 기록 셈(열한 답이 모두 0 · 1 · 2)과 같은 뜻 · 기억 못 하는 기계면 끝내지 않은 것
    try { const x = JSON.parse(localStorage.getItem(K) || '[]'); done = Array.isArray(x) && x.some(r => Array.isArray(r?.answers) && r.answers.length === 11 && r.answers.every(k => k === 0 || k === 1 || k === 2)); } catch { done = false; }
    const a = document.querySelector('#view [data-w="gdr"] a[href]'), hrefs = [...document.querySelectorAll('#view a[href]')].map(x => x.getAttribute('href'));
    return {done, first: a?.getAttribute('href') ?? null, h: a?.getBoundingClientRect().height ?? 0, w: a?.getBoundingClientRect().width ?? 0, box: !!document.querySelector('#view section.gdr'), cells: document.querySelectorAll('#view .gdr-cell, #view .gdr-card').length, nos: hrefs.filter(x => /^#\/gdr\/./.test(x ?? '')), gdr: hrefs.filter(x => x === '#/gdr').length};
  }, WHY_KEY);
  if (!r.first) { fail('첫 화면 바로 가기 [data-w="gdr"] 가 없음(흰 첫 화면)', tag); return r; }
  if (r.first !== (r.done ? '#/gdr' : '#/why')) fail(`첫 화면 ${NEW_NAME} 칸 바로 가기 — 열한 질문 뒤에만 #/gdr · 그 전은 #/why(본질 문 ④)`, `${tag} ${r.first} · 끝낸 기록 ${r.done}`);
  if (!r.done && r.gdr) fail('열한 질문 전인데 첫 화면에 #/gdr 고리가 있음(본질 문 ④)', `${tag} ${r.gdr}개`);
  if (r.box || r.cells) fail(`첫 화면에 큰 ${NEW_NAME} 칸이 남음(흰 첫 화면은 바로 가기만)`, `${tag} 칸 ${r.box} · 칸 조각 ${r.cells}`);
  if (r.nos.length) fail('첫 화면에 칸 번호 길(#/gdr/n)이 보임', `${tag} ${r.nos.slice(0, 3).join(' · ')}`);
  if (r.h < 47.5 || r.w < 47.5) fail('바로 가기 누르는 자리 48 × 48', `${tag} ${Math.round(r.w)}×${Math.round(r.h)}`);
  bump('첫 화면 바로 가기');
  return r;
}
/** '#/' = 첫 화면을 열어 바로 가기를 재고 → 끝낸 기기는 그 고리를 눌러, 아닌 기기는 주소로 #/gdr(잠금 칸)에 감 */
async function viaHome(p, tag) {
  const r = await homeGate(p, tag);
  if (r.done && r.first === '#/gdr') await p.locator('#view [data-w="gdr"] a[href="#/gdr"]').first().click({timeout: 8000}).catch(() => fail('바로 가기를 누를 수 없음', tag));
  else await p.evaluate(() => { location.hash = '#/gdr'; });
  await p.waitForFunction(s => location.hash === '#/gdr' && !!document.querySelector(s), SEL, {timeout: 30000}).catch(() => fail('첫 화면 → #/gdr 칸이 안 열림', tag));
}
async function open(p, hash) {
  if (hash === '#/') { await p.goto(base + NEXT + '#/', {waitUntil: 'domcontentloaded'}); await viaHome(p, '#/ 처음'); await settle(p); return; }
  await p.goto(base + NEXT + hash, {waitUntil: 'domcontentloaded'}); await settle(p);
}
async function go(p, hash) {
  if (hash === '#/') { await p.evaluate(() => { location.hash = '#/'; }); await p.waitForFunction(() => location.hash === '#/' && !!document.querySelector('#view [data-w]'), null, {timeout: 30000}); await viaHome(p, '#/ 다시'); await settle(p); return; }
  await p.evaluate(h => { const s = document.querySelector('#view section.gdr'); if (s) s.__old = true; location.hash = h; }, hash);
  await p.waitForFunction(([h, s]) => { const e = document.querySelector(s); return location.hash === h && !!e && !e.__old && !document.querySelector('#view .boot'); }, [hash, SEL], {timeout: 30000});
  await settle(p);
}
/** 저장소 · 요청 기록을 모아 둠(쪽을 다시 열기 전에 불러야 함 — 새 문서마다 기록이 새로 시작) */
const harvest = async p => { try { const x = await p.evaluate(() => window.__st ?? []); p._st.push(...x); } catch { /* 닫힘 */ } };
/** [9] 4 · [9] 1 — 끝에 한 번: 심은 내 돈 그대로 · 이 화면이 저장소를 안 바꿈 · 요청 어디에도 내 돈이 없음 */
async function finalize(p, tag, {writesOk = false} = {}) {
  await harvest(p);
  if (p._store === 'ok') {
    const now = await p.evaluate(([k, w]) => { try { return [localStorage.getItem(k), localStorage.getItem(w)]; } catch { return ['?', '?']; } }, [KEY, WHY_KEY]);
    if (p._money != null ? now[0] !== String(p._money) : now[0] !== null) fail('내 돈(atlas:godori-money)이 그대로가 아님([9] 4)', `${tag} 심은 ${p._money} → 지금 ${now[0]}`);
    if (!writesOk && now[1] !== p._why) fail('매매일지 기록(atlas:godori-why)이 그대로가 아님([5] 7)', `${tag} ${String(now[1]).slice(0, 80)}`);
    const bad = p._st.filter(([op, k]) => (k === KEY && op !== 'get') || (op === 'clear') || (!writesOk && k === WHY_KEY && op !== 'get'));
    if (bad.length) fail('이 화면이 내 돈 · 매매일지 저장소를 바꿈(쓰기 · 지우기)', `${tag} ${JSON.stringify(bad.slice(0, 3))}`);
    bump('저장소 기록 본 화면'); counts.내돈읽기 = (counts.내돈읽기 || 0) + p._st.filter(([op, k]) => op === 'get' && k === KEY).length; // 읽기는 막지 않음(적어만 둠)
  }
  const secrets = p._money != null ? MONEY_SECRETS : ['godori-money'];
  for (const r of p._reqs) { const s = JSON.stringify([r.u, r.b, Object.values(r.h ?? {})]).toLowerCase(); const hit = secrets.find(x => s.includes(x.toLowerCase())); if (hit) fail('요청에 내 돈이 실려 감([9] 4 — 서버에 올리지 않음)', `${tag} ${r.m} ${r.u.slice(0, 120)} 에 「${hit}」`); }
  bump('본 요청', p._reqs.length); errsOf(p, tag);
}

/* 화면에서 읽기(화면 안에서 돎) */
const READG = sel => {
  const s = document.querySelector(sel); if (!s) return null;
  const T = e => (e ? e.textContent : null), inside = (box, el) => { const a = box.getBoundingClientRect(), b = el.getBoundingClientRect(); return !b.width || (b.left >= a.left - 1 && b.right <= a.right + 1 && b.top >= a.top - 1 && b.bottom <= a.bottom + 1); };
  const lines = e => { const r = document.createRange(); r.selectNodeContents(e); return new Set([...r.getClientRects()].filter(q => q.height > 1).map(q => Math.round(q.top))).size; };
  const items = [...(s.querySelector('.gdr-cells')?.children ?? [])].map(li => { const c = li.firstElementChild, r = c?.getBoundingClientRect(); return {liRole: li.getAttribute('role'), liTag: li.tagName.toLowerCase(), liKids: li.children.length, tag: c?.tagName.toLowerCase(), cash: !!c?.classList.contains('cash'), role: c?.getAttribute('role'), tabindex: c?.getAttribute('tabindex'),
    no: T(c?.querySelector('.gdr-no')), name: T(c?.querySelector('.gdr-cn')), proper: !!c?.querySelector('.gdr-cn[data-proper]'), w: T(c?.querySelector('.gdr-cw')), h: r?.height ?? 0, exp: c?.getAttribute('aria-expanded'), on: !!c?.classList.contains('on'), ctl: c?.getAttribute('aria-controls'),
    in: c ? [...c.querySelectorAll('*')].every(k => inside(c, k)) : false}; });
  const card = s.querySelector('.gdr-card'), cr = card?.getBoundingClientRect(), today = s.querySelector('a.gdr-today'), rest = s.querySelector('.gdr-rest'), l1 = s.querySelector('a.gdr-l1');
  const wd = c => { const e = s.querySelector('details.' + c); return e ? {sum: T(e.querySelector('summary')), body: T(e.querySelector('.gdr-wb')), bodies: [...e.querySelectorAll('.gdr-wb')].map(x => x.textContent), open: e.open} : null; };
  return {state: /\block1\b/.test(s.className) ? 'lock' : /\brest1\b/.test(s.className) ? 'rest' : /\btoday1\b/.test(s.className) ? 'one' : 'open', className: s.className, h: s.getBoundingClientRect().height, text: s.innerText, links: [...s.querySelectorAll('a[href]')].map(a => a.getAttribute('href')),
    listRole: s.querySelector('.gdr-cells')?.getAttribute('role') ?? null, items, h2: T(s.querySelector('.gdr-h')), sub: T(s.querySelector('.gdr-sub')), inputs: s.querySelectorAll('input, textarea, select, [contenteditable]').length, sum: T(s.querySelector('.gdr-sum')), cards: s.querySelectorAll('.gdr-card').length,
    first: s.firstElementChild?.className ?? null, todayN: (s.innerText.match(/오늘 점수 준비/g) ?? []).length, today: today ? {text: today.textContent, href: today.getAttribute('href'), h: today.getBoundingClientRect().height, lines: lines(today), first: s.firstElementChild === today, top: today.getBoundingClientRect().top} : null,
    rest: rest ? {text: rest.textContent, lines: lines(rest), h: rest.getBoundingClientRect().height, kids: s.children.length} : null, l1: l1 ? {text: l1.textContent, href: l1.getAttribute('href'), h: l1.getBoundingClientRect().height, lines: lines(l1), kids: s.children.length} : null,
    one: s.classList.contains('today1') ? {text: s.innerText.replace(/\s+/g, ' ').trim(), kids: s.children.length, h: s.getBoundingClientRect().height, links: [...s.querySelectorAll('a[href]')].map(a => ({href: a.getAttribute('href'), text: a.textContent, h: a.getBoundingClientRect().height}))} : null,
    card: card ? {id: card.id, name: T(card.querySelector('a.gdr-name')), href: card.querySelector('a.gdr-name')?.getAttribute('href') ?? '', proper: !!card.querySelector('a.gdr-name[data-proper]'), nameH: card.querySelector('a.gdr-name')?.getBoundingClientRect().height ?? 0, ind: T(card.querySelector('.gdr-ind')),
      why: T(card.querySelector('.gdr-why')), whys: card.querySelectorAll('.gdr-why').length, wrong: T(card.querySelector('.gdr-wrong')), wrongs: card.querySelectorAll('.gdr-wrong').length, perf: T(card.querySelector('.gdr-perf')), stl: [...card.querySelectorAll('.gdr-stl')].map(x => x.textContent), val: [...card.querySelectorAll('.gdr-val')].map(x => x.textContent),
      w: T(card.querySelector('.gdr-w')), near: T(card.querySelector('.gdr-near')), mc: T(card.querySelector('.gdr-mc')), mcin: (e => (e ? {sum: T(e.querySelector('summary')), body: T(e.querySelector('.gdr-wb')), open: e.open} : null))(card.querySelector('details.gdr-mcin')),
      say: card.querySelector('.gdr-say q[data-proper]')?.textContent ?? null, sayRow: !!card.querySelector('.gdr-say'), old: [...card.querySelectorAll('.gdr-dl, .gdr-me, .gdr-amt, input')].length, paras: card.querySelectorAll('p').length, text: card.innerText, top: cr.top, bottom: cr.bottom, vh: innerHeight} : null,
    pf: s.querySelector('.gdr-pf') ? {h: s.querySelector('.gdr-pf h3')?.textContent ?? '', ps: [...s.querySelectorAll('.gdr-pf p')].map(x => x.textContent)} : null,
    q: wd('gdr-q'), qq: wd('gdr-qq'), none: wd('gdr-none'), bigs: T(s.querySelector('.gdr-bigs')), fall3: T(s.querySelector('.gdr-fall3')), stale: wd('gdr-stale'), notes: [...s.querySelectorAll('.gdr-note')].map(x => x.textContent), more: s.querySelector('a.more')?.getAttribute('href') ?? null, fun: !!document.querySelector('#view section.gdr-fun')};
};
const READF = () => {
  const f = document.querySelector('#view section.gdr-fun'); if (!f) return null;
  const sens = f.querySelector('details.gdr-sens'), dt = c => { const e = f.querySelector('details.' + c); return e ? {sum: e.querySelector('summary')?.textContent ?? '', bodies: [...e.querySelectorAll('.gdr-wb')].map(x => x.textContent), open: e.open} : null; };
  return {back: f.querySelector('.gdr-back')?.textContent ?? null, backFirst: !!f.querySelector('h2.sec')?.nextElementSibling?.classList.contains('gdr-back'), bk: dt('gdr-bk'), score: f.querySelector('.gdr-score')?.textContent ?? null, sc: dt('gdr-sc'),
    rows: [...f.querySelectorAll('ol.gdr-ol > li')].map(li => [li.querySelector('span')?.textContent ?? '', li.querySelector('b')?.textContent ?? '']), rules: f.querySelector('ul.gdr-ul')?.textContent ?? '', uls: [...f.querySelectorAll('ul.gdr-ul > li')].map(x => x.textContent),
    sens: sens ? {sum: sens.querySelector('summary')?.textContent ?? '', ps: [...sens.querySelectorAll('.gdr-wb')].map(x => x.textContent), open: sens.open} : null, text: f.innerText};
};
/** 깔때기 읽기 — 지난 성적 한 줄(gdr-back.json)은 늦게 와서 있어야 하는 판이면 기다림 */
const readF = async p => { if (BACK_KO && p._v2) await p.waitForFunction(() => !!document.querySelector('#view section.gdr-fun .gdr-back'), null, {timeout: 8000}).catch(() => {}); return {...(await p.evaluate(READF)), backReqs: p._reqs.filter(r => r.u.includes('/next/data/gdr-back.json')).length}; };
/** 모양 — 옆으로 넘침 · 칸 밖 · 누르는 자리 · 글 크기 · 캔버스 · 쓰지 않을 말(남의 글 data-proper 밖 · 이름표 글 포함) · 바둑판(규칙 51) */
const LAYOUT = sel => {
  const vw = document.documentElement.clientWidth, root = document.querySelector(sel);
  const out = {sw: document.documentElement.scrollWidth, vw, wide: [], small: [], tiny: [], canvas: 0, text: '', attrs: [], squares: 0, missing: !root};
  if (!root) return out;
  const desc = e => e.tagName.toLowerCase() + (typeof e.className === 'string' && e.className.trim() ? '.' + e.className.trim().split(/\s+/).join('.') : '') + ' 「' + (e.textContent || '').trim().slice(0, 24) + '」';
  for (const e of [root, ...root.querySelectorAll('*')]) {
    if (e.ownerSVGElement) continue;
    const r = e.getBoundingClientRect(); if (r.width < 2 && r.height < 2) continue;
    if (r.right > vw + 1 || r.left < -1) out.wide.push(desc(e) + ' ' + Math.round(r.left) + '~' + Math.round(r.right));
    const cs = getComputedStyle(e);
    if (cs.visibility !== 'hidden' && [...e.childNodes].some(n => n.nodeType === 3 && n.textContent.trim()) && parseFloat(cs.fontSize) < 16.95) out.tiny.push(desc(e) + ' ' + cs.fontSize);
  }
  for (const e of root.querySelectorAll('a[href], button, input, select, textarea, summary, [role="button"]')) { const r = e.getBoundingClientRect(); if (!r.width || !r.height) continue; if (r.height < 43.5 || r.width < 43.5) out.small.push(desc(e) + ' ' + Math.round(r.width) + '×' + Math.round(r.height)); }
  for (const g of root.querySelectorAll('.gdr-cells')) out.squares = Math.max(out.squares, [...g.children].filter(k => { const r = k.getBoundingClientRect(); return r.width && r.width <= 44 && r.height <= 44; }).length);
  out.canvas = root.querySelectorAll('canvas').length;
  const c = root.cloneNode(true); c.querySelectorAll('[data-proper]').forEach(x => x.remove()); out.text = c.textContent;
  for (const e of [c, ...c.querySelectorAll('*')]) for (const a of ['aria-label', 'title', 'alt', 'placeholder']) { const v = e.getAttribute?.(a); if (v) out.attrs.push(v); }
  return out;
};
/** [10] 5 ~ 10 — 글씨 가짓수 · 글 시작 왼쪽 줄(measure.mjs 와 같은 자) · 간격 · 같은 칸 높이 · 확인 못 한 것(?) 줄 수 · 누르는 것이 button · a 인가 */
const MLAY = sel => {
  const root = document.querySelector(sel); if (!root) return null;
  const vw = document.documentElement.clientWidth, SKIP = new Set(['SCRIPT', 'STYLE', 'NOSCRIPT', 'TEMPLATE', 'TITLE']), R = document.createRange(), texts = [];
  const tw = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  for (let n; (n = tw.nextNode());) {
    if (!n.nodeValue.trim()) continue; const el = n.parentElement; if (!el || SKIP.has(el.tagName)) continue;
    R.selectNodeContents(n); const rs = [...R.getClientRects()].filter(q => q.width >= 1 && q.height >= 1); if (!rs.length) continue;
    if (el.checkVisibility && !el.checkVisibility({checkOpacity: true, checkVisibilityCSS: true})) continue;
    texts.push({n, el, rs});
  }
  const own = new Set(), fs = {};
  for (const t of texts) if (!own.has(t.el)) { own.add(t.el); const k = Math.round(parseFloat(getComputedStyle(t.el).fontSize) * 2) / 2; fs[k] = (fs[k] || 0) + 1; }
  const blockOf = el => { for (let a = el; a; a = a.parentElement) { const d = getComputedStyle(a).display; if (d !== 'inline' && d !== 'contents') return a; } return document.body; };
  const blocks = new Map(); for (const t of texts) { const b = blockOf(t.el); if (!blocks.has(b)) blocks.set(b, t); }
  const xs = {};
  for (const [b, t] of blocks) { if (/center|right|end/.test(getComputedStyle(b).textAlign)) continue; const x = Math.round(t.rs[0].left); if (x < 0 || x >= vw) continue; (xs[x] ??= []).push(b.tagName.toLowerCase() + '.' + (b.className || '') + ' 「' + t.n.nodeValue.trim().slice(0, 10) + '」'); }
  const bad = [], neg = [], P = ['marginTop', 'marginRight', 'marginBottom', 'marginLeft', 'paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft', 'rowGap', 'columnGap'];
  for (const e of [root, ...root.querySelectorAll('*')]) {
    if (e.ownerSVGElement) continue; const cs = getComputedStyle(e);
    for (const k of P) { const px = parseFloat(cs[k]); if (!Number.isFinite(px)) continue; const v = Math.round(px * 100) / 100; if (v < 0) neg.push(e.tagName.toLowerCase() + '.' + (e.className || '') + ' ' + k + ' ' + v); else if (![0, 8, 16, 24].includes(v)) bad.push(e.tagName.toLowerCase() + '.' + (e.className || '') + ' ' + k + ' ' + v); }
  }
  const lines = e => { const r = document.createRange(); r.selectNodeContents(e); return new Set([...r.getClientRects()].filter(q => q.height > 1).map(q => Math.round(q.top))).size; };
  const warn = [...root.querySelectorAll('summary, p, div')].filter(e => /^\?\s/.test((e.textContent || '').trim()) && !e.querySelector('p, div, details') && e.getBoundingClientRect().height > 0).map(e => [(e.textContent || '').trim().slice(0, 30), lines(e)]);
  const tap = [];
  for (const e of root.querySelectorAll('*')) {
    const cs = getComputedStyle(e), tag = e.tagName.toLowerCase(), ti = e.getAttribute('tabindex'), role = e.getAttribute('role');
    const act = (ti != null && +ti >= 0) || /^(button|link|tab|menuitem|switch|checkbox)$/.test(role || '') || cs.cursor === 'pointer' || e.hasAttribute('onclick');
    if (act && !/^(a|button|summary|input|select|textarea)$/.test(tag) && !e.closest('a[href], button, summary')) tap.push(tag + '.' + (e.className || ''));
  }
  const cells = [...root.querySelectorAll('.gdr-cell')].map(c => Math.round(c.getBoundingClientRect().height * 10) / 10);
  return {fs, xs, bad, neg, warn, tap, cells, vw};
};
async function layout(p, sel, tag) {
  const s = await p.evaluate(LAYOUT, sel); bump('모양 잰 화면');
  if (s.missing) { fail('칸 없음', tag + ' ' + sel); return; }
  if (s.sw > s.vw) fail('옆으로 넘침', `${tag}: ${s.sw} > ${s.vw}`);
  for (const x of s.wide.slice(0, 3)) fail('칸 밖으로 나감', `${tag}: ${x}`);
  for (const x of s.small.slice(0, 3)) fail('누르는 자리 44px 밑', `${tag}: ${x}`);
  for (const x of s.tiny.slice(0, 3)) fail('글 17px 밑', `${tag}: ${x}`);
  if (s.canvas) fail('캔버스(입체 없음 규칙 50)', tag);
  if (s.squares >= 20) fail('바둑판(규칙 51 — 44px 이하 칸 20개 넘음)', `${tag}: ${s.squares}`);
  for (const b of screenHits(s.text + '\n' + s.attrs.join('\n'))) fail('쓰지 않을 말(words.js screenHits)', `${tag} 「${b}」`);
  const m = await p.evaluate(MLAY, sel); if (!m) return; bump('글씨 · 줄 · 간격 잰 화면');
  const kinds = Object.keys(m.fs).length, lefts = Object.keys(m.xs);
  if (kinds > 6) fail('글씨 크기 가짓수 ≤ 6([10] 6)', `${tag}: ${kinds}가지 ${JSON.stringify(m.fs)}`);
  if (lefts.length > 3) fail('글 시작 왼쪽 줄 ≤ 3([10] 7)', `${tag}: ${lefts.length}줄 ${lefts.map(x => x + ' ' + m.xs[x][0]).join(' · ')}`);
  for (const x of m.bad.slice(0, 3)) fail('간격은 8 · 16 · 24 (와 0)만([10] 8)', `${tag}: ${x}`);
  for (const x of m.neg.slice(0, 3)) fail('음수 간격(겹침) 없음([10] 8)', `${tag}: ${x}`);
  if (m.cells.length && Math.max(...m.cells) - Math.min(...m.cells) > 0.5) fail('같은 칸은 같은 높이([10] 9)', `${tag}: ${JSON.stringify([...new Set(m.cells)])}`);
  for (const [t, n] of m.warn) if (n > 2) fail('확인 못 한 것(?)은 두 줄까지([10] 10)', `${tag}: ${n}줄 「${t}」`);
  for (const x of m.tap.slice(0, 3)) fail('누르는 것은 button 또는 a([9] 8)', `${tag}: ${x}`);
  mx('글씨 가짓수 최대', kinds); mx('왼쪽 줄 최대', lefts.length); mx('글 17px 밑 최대', s.tiny.length); mx('? 줄 수 최대', Math.max(0, ...m.warn.map(w => w[1]))); if (m.cells.length) mx('칸 높이 차 최대(0.1px)', Math.round((Math.max(...m.cells) - Math.min(...m.cells)) * 10));
}

/* ⑪ 법과 안전 — 화면 글(scope = 첫 화면은 고도리 칸 안 · #/gdr 는 화면 전체) */
const SCOPE_TXT = () => '#view'; // 흰 첫 화면 — '#/' 판도 #/gdr 쪽 전체를 봄(옛: 첫 화면이면 칸만)
async function safety(p, hash, tag, {money = p._money, D = G} = {}) {
  const sel = SCOPE_TXT(SEL, hash), t = await p.evaluate(s => { const e = document.querySelector(s); if (!e) return null; const c = e.cloneNode(true); const attrs = []; for (const x of [e, ...e.querySelectorAll('*')]) for (const a of ['aria-label', 'title', 'alt', 'placeholder']) { const v = x.getAttribute?.(a); if (v) attrs.push(v); } return {vis: e.innerText, all: e.textContent + '\n' + attrs.join('\n'), inputs: e.querySelectorAll('input, textarea, select, [contenteditable]').length, gin: e.querySelectorAll('input.gdr-in').length}; }, sel);
  if (!t) { fail('글 없음', tag); return; }
  bump('금지 글 본 화면');
  const flat = compact(t.vis + '\n' + t.all);
  for (const [w, c] of BAD_RE) if (flat.includes(c)) fail(`${NEW_NAME} 칸 화면 글에 금지 글([9] 1)`, `${tag} 「${w}」`);
  for (const w of OLD_MARKS) if ((t.vis + t.all).includes(w)) fail(`화면 글에 「${w}」 있으면 안 됨([8] 9 · [10] 3 · [9] 4)`, tag);
  for (const [w, re] of OLD_WORDS) if (re.test(t.vis)) fail('옛 낱말이 화면에 남음([10] 1)', `${tag} 「${w}」`);
  if (t.gin || t.inputs) fail('내 돈 칸 · 입력 칸이 있음([9] 4 — 입력 칸 0)', `${tag} input.gdr-in ${t.gin} · 입력 ${t.inputs}`);
  // 원 금액 — 내 돈으로 셈한 값(심은 돈 · 비중마다 · 현금 몫)이 숫자로 있으면 안 됨 + 종가로 설명되지 않는 원 금액도 안 됨
  const digits = (t.vis + '\n' + t.all).replace(/,/g, '');
  if (money != null) {
    const base = BigInt(money), derived = new Set([String(money)]);
    let used = 0n; for (const x of D.picks) { const a = base * BigInt(w10(x.w)) / 1000n; used += a; derived.add(String(a)); }
    derived.add(String(base - used));
    for (const d of derived) if (d.length >= 5 && new RegExp('(?<!\\d)' + d + '(?!\\d)').test(digits)) fail('내 돈으로 셈한 금액이 화면에 있음([9] 1 · [9] 4)', `${tag} ${d}`);
  }
  const allowed = new Set(); for (const x of D.picks) { if (x.price > 0) allowed.add(x.price); const I = infoExp(COF.get(x.code)); for (const v of [I?.closeOn(D.asOf), I?.last]) if (v > 0) allowed.add(Math.round(v)); }
  for (const m of t.vis.matchAll(/(?<![\d,조억])([\d,]{3,})\s?원/g)) { const v = +m[1].replace(/,/g, ''); if (!allowed.has(v)) fail('종가로 설명되지 않는 원 금액(내 돈 · 팔 선 · 절반 팔 선 셈 의심)', `${tag} 「${m[0]}」`); }
  if (v1(D)) for (const x of D.picks) for (const v of [x.sell, x.half]) if (v > 0 && !allowed.has(v) && new RegExp('(?<!\\d)' + v + '(?!\\d)').test(digits)) fail('팔 선 · 절반 팔 선 값이 화면에 있음([9] 1)', `${tag} ${x.no}번 ${v}`);
}

/* 맞대기 */
/** 칸 — 고도리 칸 + 현금으로 둠 · 차례 · 「n번」 · 이름 · 비중 · 높이 48px · 칸 안 · 열린 칸(openNo) · 목록 역할([9] 8) */
function checkCells(g, D, tag, openNo = null) {
  const P = D.picks, cash = D.counts?.cash ?? 0;
  if (g.state !== 'open') { fail(`끝낸 기록이 있는데 칸이 열리지 않음(${g.state})`, tag); return; }
  if (g.listRole !== 'list') fail('칸 목록 바깥 칸 role=list([9] 8)', `${tag} 「${g.listRole}」`);
  if (g.items.length !== P.length + 1) fail(`칸 수 = ${NEW_NAME} 칸 + 현금으로 둠`, `${tag} ${g.items.length} ≠ ${P.length} + 1`);
  g.items.forEach((c, i) => {
    if (c.liRole !== 'listitem' || c.liTag !== 'div' || c.liKids !== 1) fail('줄마다 role=listitem 은 감싼 칸에([9] 8)', `${tag} ${i + 1}째 role=${c.liRole} <${c.liTag}> 안 ${c.liKids}개`);
    if (c.role != null) fail('button.gdr-cell 에 role 0([9] 8)', `${tag} ${i + 1}째 role=${c.role}`);
    if (c.tabindex != null && c.cash) fail('현금으로 둠 칸은 누르는 곳이 아님', `${tag} tabindex=${c.tabindex}`);
  });
  P.forEach((p, i) => {
    const c = g.items[i], at = `${tag} ${p.no}번`; if (!c) return;
    if (c.tag !== 'button' || c.cash) fail('칸 꼴(누르는 단추)', `${at} ${c.tag}`);
    if (c.no !== `${p.no}번`) fail('칸 번호(「n번」)', `${at} 「${c.no}」`);
    if (c.name !== p.name || !c.proper) fail('칸 이름(data-proper)', `${at} 「${c.name}」 ${c.proper}`);
    if (c.w !== wTxt(p.w)) fail('칸 비중', `${at} 「${c.w}」 ≠ ${wTxt(p.w)}`);
    if (c.h < 47.5) fail('칸 높이 48px 밑(규칙 51)', `${at} ${c.h.toFixed(1)}`);
    if (!c.in) fail('칸 글이 칸 밖', at);
    const open = openNo === p.no;
    if (c.exp !== String(open) || c.on !== open) fail('칸 열림 표시', `${at} aria-expanded=${c.exp} on=${c.on} · 기대 ${open}`);
    if (c.ctl !== 'gdr-' + p.no) fail('칸 aria-controls', `${at} ${c.ctl}`);
  });
  const last = g.items[P.length];
  if (!last?.cash || last.no !== '현금으로 둠' || last.w !== wTxt(cash)) fail('현금으로 둠 칸', `${tag} ${JSON.stringify(last)}`);
  else if (last.h < 47.5) fail('칸 높이 48px 밑(규칙 51)', `${tag} 현금으로 둠 ${last.h.toFixed(1)}`);
  if (g.items.length > 1 && Math.max(...g.items.map(c => c.h)) - Math.min(...g.items.map(c => c.h)) > 0.5) fail('같은 칸은 같은 높이([10] 9)', `${tag} ${JSON.stringify([...new Set(g.items.map(c => c.h))])}`);
  if ((g.cards > 0) !== (openNo != null && P.some(x => x.no === openNo))) fail('카드 수', `${tag} ${g.cards} · 열 번호 ${openNo}`);
  bump('맞댄 칸', g.items.length);
}
/** 합 줄 — 「비중 합 100%」(금액 없음) */
function checkSum(g, D, tag) {
  const tot = (D.picks.reduce((a, p) => a + w10(p.w), 0) + w10(D.counts?.cash ?? 0)) / 10;
  if (tot !== 100) fail('자료 비중 합 ≠ 100', `${tag} ${tot}`);
  if (g.sum !== '비중 합 100%') fail('합 줄 「비중 합 100%」(금액 없음)', `${tag} 「${g.sum}」`);
  bump('맞댄 합 줄');
}
/** 카드 하나 — 이름 고리 · 「n번 · 업종」 · 이유 한 줄 · 틀린다면 이유 1 · 성적 · (못 돌린 날) 고른 날 → 오늘 · 회사 값 한 줄 · 비중 · 격언(v1) · 금액 · 팔 선 · 「나라면」 없음 */
function checkCard(g, D, p, tag, X) {
  const c = g.card, at = `${tag} ${p.no}번 카드`;
  if (!c) { fail('카드가 안 열림', at); return; }
  if (c.id !== 'gdr-' + p.no) fail('카드 번호(id)', `${at} ${c.id}`);
  if (c.name !== p.name || c.href !== '#/w/' + encodeURIComponent(p.code) || !c.proper) fail('카드 이름 고리', `${at} 「${c.name}」 ${c.href} ${c.proper}`);
  if (c.nameH < 43.5) fail('카드 이름 고리 44px 밑', `${at} ${c.nameH}`);
  if (c.ind !== `${p.no}번 · ${p.ind}`) fail('카드 「n번 · 업종」', `${at} 「${c.ind}」`);
  if (c.whys !== 1 || c.why !== reasonExp(p.reason)) fail('이유 한 줄(「업종 돈」 → 「업종 거래」)', `${at} ${c.whys}개 「${c.why}」 ≠ 「${reasonExp(p.reason)}」`);
  if (!/ · 석 달 [+−-]\d+\.\d% · 업종 거래 \d+\.\d배$/.test(c.why ?? '') && v1(D)) fail('이유의 n배는 「업종 거래 n배」([8] 9)', `${at} 「${c.why}」`);
  const wantW = '틀린다면 이유 ' + (typeof p.wrong === 'string' && p.wrong.trim() ? p.wrong : '? 아직 못 셌어요.');
  if (c.wrongs !== 1 || c.wrong !== wantW) fail('틀린다면 이유 곳마다 1([9] 1 · gdr.json wrong 그대로)', `${at} ${c.wrongs}개 「${c.wrong}」 ≠ 「${wantW}」`);
  if (X.per && c.perf !== perfCardTxt(D, X.per.get(p.code))) fail('카드 성적 줄(같은 때 코스피 · 따로 셈)', `${at} 「${c.perf}」 ≠ 「${perfCardTxt(D, X.per.get(p.code))}」`);
  if (c.w !== `비중 ${wTxt(p.w)}`) fail('카드 비중', `${at} 「${c.w}」 ≠ 「비중 ${wTxt(p.w)}」`);
  if (c.old) fail('카드에 옛 칸(금액 · 팔 선 · 나라면 · 내 돈 칸)이 남음([9] 1 · 4)', `${at} ${c.old}개`);
  if (v1(D) ? c.say !== SAYINGS[(p.no - 1) % 11] || c.say !== D.sayings?.[p.saying] : c.sayRow) fail('격언(원문 · 번호 차례 · data-proper)', `${at} 「${c.say}」`);
  const I = X.info(p.code), stale = isStale(D);
  if (stale) { if (c.stl.length !== 1 || c.stl[0] !== staleWant(D, p, I)) fail('못 돌린 날 「고른 날 값 → 오늘 값」 한 줄([8] 1 — close × days.json dates 따로 셈)', `${at} ${JSON.stringify(c.stl)} ≠ 「${staleWant(D, p, I)}」`); else bump('맞댄 고른 날 → 오늘'); }
  else if (c.stl.length) fail('같은 날인데 「고른 날 값 → 오늘 값」 줄이 있음([8] 1)', `${at} ${JSON.stringify(c.stl)}`);
  if (c.val.length !== 1) fail('회사 값은 한 줄(p 하나)([8] 9)', `${at} ${c.val.length}개`); else checkVal(c.val[0], I, at);
  if (!v1(D)) checkCardV2(g, D, p, tag);
  bump('맞댄 카드');
}
/** 성적 칸 — 따로 셈과 줄마다 맞댐(나빠도 숨기지 않음 — 가장 나쁜 곳 · 못 받은 곳 수) */
function checkPerf(g, D, per, tag) {
  if (!D.picks.length) { if (g.pf) fail('고른 곳 0인데 성적 칸이 있음', tag); return; }
  if (!g.pf) { fail('성적 칸 없음([6] 3)', tag); return; }
  const want = perfBoxTxt(D, per);
  if (g.pf.h !== '고른 날 뒤 성적' || !eq(g.pf.ps, want)) fail('성적 칸(같은 때 코스피 · 따로 셈)', `${tag} ${JSON.stringify(g.pf.ps)} ≠ ${JSON.stringify(want)}`);
  bump('맞댄 성적 칸');
}
/** 첫 칸 · 열기 전 — 머리(「고도리 칸 n곳」) · 날짜 · 입력 칸 0 · 관리 종목 「?」 줄 · 모자란 대로 줄 · 못 돌린 날 밝힘 · 첫 화면 「어떻게 골랐나」 고리 */
function checkHead(g, D, tag, onHome) {
  if (!g) { fail(NEW_NAME + ' 칸 없음', tag); return; }
  if (g.state !== 'open') { fail(`끝낸 기록이 있는데 칸이 열리지 않음(${g.state})`, tag); return; }
  if (g.h2 !== `${NEW_NAME} 칸 ${D.picks.length}곳`) fail(`머리 「${NEW_NAME} 칸 n곳」([10] 3)`, `${tag} 「${g.h2}」`);
  if (!g.sub.startsWith(mdTxt(D.asOf) + ' 종가')) fail('칸 머리 날짜', `${tag} 「${g.sub}」`);
  const st = isStale(D);
  if (st !== !!g.stale || (st && !(g.stale.sum.startsWith('?') && g.stale.sum.includes(mdTxt(D.asOf) + ' 종가') && g.stale.body.includes(mdTxt(MKT.asOf) + '까지')))) fail('고른 날 · 사이트 날 밝힘(고른 날이 앞설 때만)', `${tag} ${JSON.stringify(g.stale)} · 고른 ${D.asOf} · 사이트 ${MKT.asOf}`);
  if (g.inputs) fail('입력 칸이 있음([9] 4)', `${tag} ${g.inputs}`);
  const zero = !D.picks.length, stt = D.status ?? {}, whyS = String(D.counts?.why ?? '');
  const mL = stt.lists === 'missing' || (stt.lists == null && whyS.includes('lists')), mQ = stt.quarters === 'missing' || (stt.quarters == null && whyS.includes('quarters')), none = zero && (mL || mQ);
  if (none) { // 고른 곳 0 + 자료가 아직 안 옴 → 까닭을 쉬운 말로 한 줄(「?」) + 접은 칸(데이터 note 줄 + 마무리) — 다른 「?」 줄 · 모자란 대로 줄 없음
    const what = mL && mQ ? '목록과 분기 숫자가' : mL ? '목록이' : '분기 숫자가', notes = (Array.isArray(D.note) ? D.note : []).filter(x => typeof x === 'string' && x.trim()).map(x => x.trim());
    const wantSum = `? ${what} 아직 안 와서 지금은 담을 곳이 없어요`, wantBodies = [...notes, '못 본 채로 고르면 지어낸 것이 되니까 하나도 담지 않았어요. 전부 현금으로 둬요.'];
    if (!g.none || g.none.sum !== wantSum || !eq(g.none.bodies, wantBodies) || g.none.open) fail('고른 곳 0 — 목록 · 분기 숫자가 아직 안 온 까닭을 쉬운 말로(「?」 한 줄 + 접은 칸)', `${tag} ${JSON.stringify(g.none)} ≠ ${wantSum} / ${JSON.stringify(wantBodies)}`);
    if (g.qq || g.notes.some(t => t.includes('담을 곳이 없어요'))) fail('까닭 줄 말고 같은 뜻의 줄이 또 있음', `${tag} ${JSON.stringify([g.qq, g.notes])}`);
    if (!g.none?.sum.startsWith('?')) fail('까닭 줄은 「?」로 시작', tag);
    bump('맞댄 고른 곳 0 까닭 줄');
  } else {
    if (g.none) fail('자료가 다 왔는데 「아직 안 와서」 줄이 있음', `${tag} ${JSON.stringify(g.none)}`);
    const listQ = D.status ? D.status.lists !== 'ok' : D.counts?.managed == null;
    if (listQ !== !!g.q) fail('관리 종목 「?」 줄(목록을 못 거른 때만)', `${tag} ${JSON.stringify(g.q)}`);
    else if (g.q && !g.q.sum.startsWith('?')) fail('관리 종목 「?」 줄은 「?」로 시작', `${tag} ${JSON.stringify(g.q)}`);
    if (zero ? !g.notes.includes('지금은 담을 곳이 없어요. 전부 현금으로 둬요.') : (D.picks.length < maxOfD(D)) !== g.notes.some(t => t.includes(`${D.picks.length}곳뿐`))) fail(zero ? '고른 곳 0 — 「지금은 담을 곳이 없어요」 줄' : '모자란 대로 줄(위 끝 밑일 때만)', `${tag} ${JSON.stringify(g.notes)}`);
    if ((D.status?.quarters === 'missing') !== !!g.qq) fail('분기 숫자 「?」 줄(status.quarters 가 missing 일 때만)', `${tag} ${JSON.stringify(g.qq)}`);
  }
  if (zero && g.pf) fail('고른 곳 0인데 성적 칸이 있음', tag);
  if (!g.notes.some(t => t.includes(NEW_NAME))) fail(`「${NEW_NAME} 생각」 줄`, tag);
  if (onHome ? g.more !== '#/gdr' : g.more != null) fail('「어떻게 골랐나 보기」 고리', `${tag} ${g.more}`);
}
/** 깔때기 — gdr.json counts · 다섯 문 이름(원문) · 기준 숫자 · 「조건 다섯」 · 「고도리 칸」 · 「현금으로 둠」 · 팔 선 줄 없음(v1 만 한 줄씩 맞댐) */
function checkFunnel(f, D, tag) {
  if (!f) { fail('「어떻게 골랐나」 없음', tag); return; }
  const C = D.counts ?? {}, R = D.rules ?? {};
  if (/팔 선|내린 값|오른 값|10% 내린|20% 오른/.test(f.text)) fail('깔때기에 팔 선 · 절반 팔 선 줄이 남음([9] 1)', `${tag} 「${(/.{0,12}(팔 선|내린 값|오른 값).{0,12}/.exec(f.text) || [])[0]}」`);
  checkBack(f, tag, D);
  if (!v1(D)) { checkFunnelV2(f, D, tag); return; }
  const want = [['상장', nTxt(C.listed) + '개'], ['회사 주식', nTxt(C.companies) + '곳'], ['거래가 너무 적', nTxt(C.outThin) + '곳'], ['거래가 멈춰', nTxt(C.outHalt) + '곳'],
    ['관리 종목', C.managed == null ? '? 아직 못 거름' : nTxt(C.managed) + '곳'], ['남은', nTxt(C.afterOut) + '곳'],
    ...GATES.map((n, i) => [n, nTxt(C['g' + (i + 1)]) + '곳']), ['조건 다섯', nTxt(C.passAll) + '곳'], [`${NEW_NAME} 칸`, nTxt(C.picked) + '곳'], ['현금으로 둠', wTxt(C.cash ?? 0)]];
  if (f.rows.length !== want.length) fail('깔때기 줄 수', `${tag} ${f.rows.length} ≠ ${want.length}`);
  want.forEach(([k, v], i) => { const r = f.rows[i]; if (!r || !r[0].includes(k) || r[1] !== v) fail('깔때기 수(gdr.json counts)', `${tag} ${i + 1}째 ${JSON.stringify(r)} ≠ 「${k}」 ${v}`); });
  for (const t of [`${comma(R.thin / 1e8)}억 원`, `${R.quietX}배`, `${R.hot5}%`, `${R.r60?.[0]} ~ ${R.r60?.[1]}%`, `${R.jump}%`, `${Math.round(R.keep * 100)}%`, `${R.low2x}배`, `${R.indX}배`, '3%', '2.5%', '2%'])
    if (!f.rules.includes(t)) fail('기준 숫자 글', `${tag} 「${t}」 없음`);
  bump('맞댄 깔때기');
}
const gateNm = ['이익 늘었나', '아직 조용한가', '석 달 천천히 올랐나', '두 배 넘게 안 올랐나', '돈 들어오는 업종인가'];
const fmtU = (v, u) => (u === '원' && Math.abs(v) >= 1e8 ? `${comma(v / 1e8)}억 원` : `${comma(v)}${u ?? ''}`); // 큰 원 금액(거래대금)은 「10억 원」 꼴
/** G2b 지난 성적 한 줄 — 「어떻게 골랐나」 맨 위 한 줄(line.ko) + 접은 더 보기(line.more) · line.side 는 안 보임 · 파일이 없으면 아무것도 없음 */
function checkBack(f, tag, D) {
  const on = backOn(D), bl = on ? BACK?.line : null, ko = on ? BACK_KO : null, more = ko ? (Array.isArray(bl.more) ? bl.more : []).filter(x => typeof x === 'string' && x.trim()).map(x => x.trim()) : [];
  if (!on && f.backReqs) fail('gdr-v1 자료에서는 gdr-back.json 을 받지 않음(처음 올림에는 이 파일이 없음 — 받으면 콘솔에 404)', `${tag} 요청 ${f.backReqs}번`);
  if ((f.back ?? null) !== ko) fail(on ? '지난 성적 한 줄(gdr-back.json line.ko — 「어떻게 골랐나」 맨 위)' : 'gdr-v1 자료에는 지난 성적 한 줄이 없음', `${tag} 「${f.back}」 ≠ 「${ko}」`);
  else if (ko && !f.backFirst) fail('지난 성적 한 줄은 제목 바로 밑(맨 위)', tag);
  if (more.length ? !(f.bk && f.bk.sum === '더 보기' && !f.bk.open && eq(f.bk.bodies, more)) : f.bk) fail('지난 성적 더 보기(접음 · line.more)', `${tag} ${JSON.stringify(f.bk)} ≠ ${JSON.stringify(more)}`);
  if (typeof bl?.side === 'string' && bl.side.trim() && f.text.includes(bl.side.trim().slice(0, 24))) fail('line.side(규칙이 다른 참고 줄)는 보이지 않음', tag);
  if (ko) bump('맞댄 지난 성적 한 줄'); else if (!on) bump('맞댄 v1 지난 성적 없음');
}
/** gdr-v2 한 달 전 채점(score) — 한 줄 + 곳마다(접음) · 다시 셈한 것이면 밝힘 */
function checkScore(f, D, tag) {
  const S = D.score, ok = S && Number.isInteger(S.counted) && Number.isInteger(S.up) && typeof S.from === 'string' && typeof S.to === 'string';
  const want = ok ? `한 달 전 채점 ${mdTxt(S.from)} → ${mdTxt(S.to)} · ${S.counted}곳 가운데 ${S.up}곳 올랐어요${S.src === 'recomputed' ? ' · 다시 셈한 것' : ''}` : null;
  if ((f.score ?? null) !== want) fail('한 달 전 채점 한 줄(score)', `${tag} 「${f.score}」 ≠ 「${want}」`);
  const rows = ok ? (S.rows ?? []).filter(r => r && typeof r.name === 'string' && r.from > 0 && r.to > 0 && Number.isInteger(r.lo) && Number.isInteger(r.hi)) : [];
  const wantRows = rows.map(r => `${r.name} ${wonT(r.from)} → ${wonT(r.to)} ${pct((r.to / r.from - 1) * 100)} · 그때 모형 10번 중 ${r.lo}~${r.hi}번`);
  if (ok && rows.length === S.counted) { const up = rows.filter(r => r.to > r.from).length; if (up !== S.up) fail('채점 「n곳 올랐어요」 ≠ 곳마다 값(to > from) — 화면 안에서 서로 어긋남', `${tag} 올랐어요 ${S.up} ≠ 곳마다 ${up}`); }
  if (wantRows.length ? !(f.sc && f.sc.sum === '곳마다 보기' && !f.sc.open && eq(f.sc.bodies, wantRows)) : f.sc) fail('채점 곳마다(접음 · 모형이 한 말과 실제)', `${tag} ${JSON.stringify(f.sc)} ≠ ${JSON.stringify(wantRows)}`);
  if (want) bump('맞댄 채점 줄');
}
/** v2 카드 줄 — 가까스로 넘음 · 몬테카를로 한 줄 · 무엇을 넣어 셈했나(접음) · 격언 줄 없음 */
function checkCardV2(g, D, p, tag) {
  const c = g.card, at = `${tag} ${p.no}번 카드`; if (!c) return;
  const near = Array.isArray(p.near) ? p.near.map(k => gateNm[+String(k)[1] - 1]).filter(Boolean) : [];
  const wantNear = near.length ? '가까스로 넘음 ' + near.join(', ') : null;
  if ((c.near ?? null) !== wantNear) fail('가까스로 넘음 줄(near)', `${at} 「${c.near}」 ≠ 「${wantNear}」`);
  const m = p.mc, ok = m && Number.isInteger(m.lo) && Number.isInteger(m.hi), wantMc = ok ? `${m.h === 20 ? '한 달 뒤 ' : ''}고른 날 값보다 위 ${m.of ?? 10}번 중 ${m.lo}~${m.hi}번 · 모형 가정 아래 추정 · 검증 전` : null;
  if ((c.mc ?? null) !== wantMc) fail('몬테카를로 한 줄(10번 중 lo~hi번 · 모형 가정 아래 추정 · 검증 전)', `${at} 「${c.mc}」 ≠ 「${wantMc}」`);
  const wantIn = ok && typeof m.in === 'string' ? m.in : null;
  if (wantIn ? !(c.mcin && c.mcin.sum === '무엇을 넣어 셈했나' && c.mcin.body === wantIn && c.mcin.open === false) : c.mcin) fail('무엇을 넣어 셈했나(접음)', `${at} ${JSON.stringify(c.mcin)}`);
  if (c.sayRow) fail('v2 에는 격언 줄이 없음', at);
  if (c.mc && /[0-9]\.[0-9]|%/.test(c.mc.replace(/모형 가정.*/, ''))) fail('몬테카를로는 정수 범위만(소수점 · % 없음)', `${at} 「${c.mc}」`);
  bump('맞댄 v2 카드 줄');
}
/** v2 깔때기 — 수 줄 · 채점 · 기준 숫자(값 + 왜 이 값인가) · 조금 움직이면 남는 곳 수(접음 · 세 점) */
function checkFunnelV2(f, D, tag) {
  const C = D.counts ?? {}, cnt = x => (x == null ? '?' : nTxt(x) + '곳'), need = (D.limits?.need ?? D.need ?? D.rules?.need) === 4 ? 4 : 5, stt = D.status ?? {};
  const want = [['상장', C.listed == null ? '?' : nTxt(C.listed) + '개'], ['회사 주식', cnt(C.companies)], ['거래가 너무 적', cnt(C.outThin)], ['거래가 멈춰', cnt(C.outHalt)], ['관리 종목', C.outList == null || stt.lists === 'missing' ? '? 아직 못 거름' : cnt(C.outList)], ['남은', cnt(C.afterOut)],
    ...gateNm.map((n, i) => [n, i === 0 && stt.quarters === 'missing' ? '? 아직 못 셈' : cnt(C['g' + (i + 1)])]), [need === 4 ? '조건 다섯 가운데 넷' : '조건 다섯', cnt(C.passAll)], ['한 업종 자리', cnt(C.cutInd)], ['큰 업종 위 끝', cnt(C.cutBig)], [`${NEW_NAME} 칸`, cnt(C.picked)], ['현금으로 둠', wTxt(C.cash ?? 0)]];
  if (f.rows.length !== want.length) fail('v2 깔때기 줄 수', `${tag} ${f.rows.length} ≠ ${want.length}`);
  want.forEach(([k, v], i) => { const r = f.rows[i]; if (!r || !r[0].includes(k) || r[1] !== v) fail('v2 깔때기 수(gdr.json counts)', `${tag} ${i + 1}째 ${JSON.stringify(r)} ≠ 「${k}」 ${v}`); });
  checkScore(f, D, tag);
  const rules = Array.isArray(D.rules) ? D.rules : [];
  if (f.uls.length !== rules.length) fail('v2 기준 숫자 줄 수(rules)', `${tag} ${f.uls.length} ≠ ${rules.length}`);
  rules.forEach((r, i) => { const t = f.uls[i] ?? ''; if (!t.includes(`${r.name} ${fmtU(r.v, r.unit)}`) || !t.includes(r.why)) fail('v2 기준 숫자(문턱 값 + 왜 이 값인가)', `${tag} 「${t}」 ≠ ${r.name} ${fmtU(r.v, r.unit)} · ${r.why}`); if (/\d{4,}원/.test(t.replace(/,/g, ''))) fail('큰 원 금액은 「10억 원」 꼴로(긴 숫자 없음)', `${tag} 「${t}」`); });
  const sr = rules.filter(r => Array.isArray(r.sens) && r.sens.length);
  if (sr.length ? !(f.sens && f.sens.sum === '조금 움직이면 남는 곳 수' && f.sens.open === false && f.sens.ps.length === sr.length) : f.sens) fail('조금 움직이면 남는 곳 수(접음 · 문턱마다 한 줄)', `${tag} ${JSON.stringify(f.sens)}`);
  else sr.forEach((r, i) => { const w2 = `${r.name} 더 빡빡 ${fmtU(r.sens[0].v, r.unit)} → ${cnt(r.sens[0].n)} · 이 값 ${fmtU(r.sens[1].v, r.unit)} → ${cnt(r.sens[1].n)} · 더 느슨 ${fmtU(r.sens[2].v, r.unit)} → ${cnt(r.sens[2].n)}`; if (f.sens.ps[i] !== w2) fail('조금 움직이면 남는 곳 수 줄(세 점)', `${tag} 「${f.sens.ps[i]}」 ≠ 「${w2}」`); });
  if (/팔 선|내린 값|오른 값/.test(f.text)) fail('v2 깔때기에 팔 선 줄이 남음', tag);
  bump('맞댄 v2 깔때기');
}
/** 잠금 — 칸 높이 ≤ 64px(한 줄) · #/why 고리 하나 · 고른 회사 이름 0 · 칸 · 돈 칸 · 카드 · 깔때기 · 성적 없음([6] 10) */
async function checkLock(p, tag, D = G) {
  const g = await p.evaluate(READG, SEL);
  if (g?.state !== 'lock') { fail('잠금이 아님([6] 1 — 열한 질문 전)', `${tag} ${g?.state} ${g?.items?.length} 칸`); return g; }
  if (g.h > 64.5) fail('잠금 칸 높이 ≤ 64px([6] 10)', `${tag} ${g.h}`);
  if (!eq(g.links, ['#/why']) || !g.l1 || g.l1.href !== '#/why') fail('잠금 #/why 고리 하나([6] 10)', `${tag} ${JSON.stringify(g.links)}`);
  if (g.l1 && (g.l1.lines !== 1 || g.l1.kids !== 1)) fail('잠금은 한 줄([6] 10)', `${tag} ${g.l1.lines}줄 · 칸 안 ${g.l1.kids}개`);
  if (g.l1 && !g.l1.text.includes(`${NEW_NAME} 칸`)) fail(`잠금 글에 「${NEW_NAME} 칸」`, `${tag} 「${g.l1.text}」`);
  if (g.items.length || g.inputs || g.cards || g.pf || g.fun || g.h2) fail('잠금인데 칸 · 입력 칸 · 카드 · 성적 · 깔때기가 보임', `${tag} ${JSON.stringify({cells: g.items.length, inputs: g.inputs, cards: g.cards, pf: !!g.pf, fun: g.fun, h2: g.h2})}`);
  if (D.picks.some(x => g.text.includes(x.name))) fail('잠금인데 고른 회사 이름이 보임([6] 10)', tag);
  bump('맞댄 잠금');
  return g;
}
/** 쉬어 가는 날 — 「오늘은 담는 칸을 닫아 둘게」 한 줄만(칸 · 카드 · 깔때기 · 성적 · 오늘 점수 줄 · 회사 이름 0) */
async function checkRest(p, tag, D = G) {
  const g = await p.evaluate(READG, SEL);
  if (g?.state !== 'rest') { fail('쉬어 가는 날인데 한 줄이 아님([5] 7)', `${tag} ${g?.state}`); return g; }
  if (!g.rest || g.rest.text.trim() !== '오늘은 담는 칸을 닫아 둘게' || g.rest.kids !== 1 || g.rest.lines !== 1) fail('「오늘은 담는 칸을 닫아 둘게」 한 줄만([5] 7)', `${tag} ${JSON.stringify(g.rest)}`);
  if (g.h > 64.5) fail('쉬어 가는 날 칸 높이 ≤ 64px', `${tag} ${g.h}`);
  if (g.items.length || g.inputs || g.cards || g.pf || g.fun || g.today || g.links.length || g.h2) fail('쉬어 가는 날인데 칸 · 카드 · 깔때기 · 성적 · 오늘 점수 · 고리가 보임([5] 7)', `${tag} ${JSON.stringify({cells: g.items.length, cards: g.cards, pf: !!g.pf, fun: g.fun, today: !!g.today, links: g.links})}`);
  if (D.picks.some(x => g.text.includes(x.name))) fail('쉬어 가는 날인데 고른 회사 이름이 보임([5] 7)', tag);
  bump('맞댄 쉬어 가는 날');
  return g;
}
/** 오늘 점수 줄 — 열린 칸 맨 위 한 줄 · 「오늘 점수 준비 n / 22 · 다시 하기」 · #/why · n = todayResult().ready(독립 셈 · 쪽의 todayResult() 와 맞댐) */
async function checkToday(p, g, recs, tag) {
  const E = expToday(recs), real = await p.evaluate(async () => { try { const m = await import('/next/p-why.js'); const r = m.todayResult(); return r ? {verdict: r.verdict, ready: r.ready, of: r.of} : null; } catch (e) { return {err: String(e)}; } });
  if (!eq(real, E ? {verdict: E.verdict, ready: E.ready, of: 22} : null)) fail('p-why.js todayResult() ≠ 독립 셈(매매일지 쪽 몫)', `${tag} 쪽 ${JSON.stringify(real)} · 독립 ${JSON.stringify(E)}`);
  if (!E || E.verdict === 'rest') { if (g.today || g.todayN) fail('오늘 판정이 없는데 「오늘 점수」 줄이 있음([6] 10)', `${tag} 「${g.today?.text ?? '글만'}」 ${g.todayN}번`); return; }
  const t = g.today; if (!t) { fail('오늘 기록이 있는데 「오늘 점수」 줄이 없음([6] 10)', `${tag} 기대 준비 ${E.ready}`); return; }
  if (t.text !== `오늘 점수 준비 ${E.ready} / 22 · 다시 하기 ›`) fail('「오늘 점수 준비 n / 22 · 다시 하기」([6] 10 — n = todayResult().ready)', `${tag} 「${t.text}」 ≠ n ${E.ready}`);
  if (g.todayN !== 1) fail('「오늘 점수」 줄은 딱 하나([6] 10)', `${tag} 글이 ${g.todayN}번 나옴`);
  if (t.href !== '#/why') fail('오늘 점수 줄 → #/why', `${tag} ${t.href}`);
  if (!t.first) fail('오늘 점수 줄은 열린 칸 맨 위', `${tag} 첫 칸 ${g.first}`);
  if (t.lines !== 1 || t.h > 64.5) fail('오늘 점수는 한 줄(높이 ≤ 64px)', `${tag} ${t.lines}줄 ${t.h}px`);
  bump('맞댄 오늘 점수 줄');
}
/** 첫 화면 · 오늘 기록이 끝난 날(쉬어 가자 아님) — 칸 자리에 한 줄만(2026-10-18 [6] 10 글자 그대로): 「오늘 점수 준비 n / 22」→ #/gdr · 「다시 하기」→ #/why · 열린 칸 · 카드 · 깔때기 · 성적 · 회사 이름 0 · 높이 ≤ 64px · n = 독립 셈 */
async function checkTodayOne(p, g, recs, tag, D = G) {
  const E = expToday(recs), real = await p.evaluate(async () => { try { const m = await import('/next/p-why.js'); const r = m.todayResult(); return r ? {verdict: r.verdict, ready: r.ready, of: r.of} : null; } catch (e) { return {err: String(e)}; } });
  if (!eq(real, E ? {verdict: E.verdict, ready: E.ready, of: 22} : null)) fail('p-why.js todayResult() ≠ 독립 셈(매매일지 쪽 몫)', `${tag} 쪽 ${JSON.stringify(real)} · 독립 ${JSON.stringify(E)}`);
  if (!E || E.verdict === 'rest') { fail('한 줄 검사를 오늘 기록이 없는 날에 부름(검사 쪽 실수)', tag); return; }
  if (g?.state !== 'one') { fail('첫 화면 — 오늘 기록이 끝났는데 한 줄이 아님([6] 10)', `${tag} ${g?.state} · 칸 ${g?.items?.length} · ${g?.className}`); return; }
  const o = g.one, want = `오늘 점수 준비 ${E.ready} / 22 · 다시 하기 ›`;
  if (!o || o.text !== want) fail('「오늘 점수 준비 n / 22 · 다시 하기」 한 줄만([6] 10 — n = todayResult().ready)', `${tag} 「${o?.text}」 ≠ 「${want}」`);
  if (!o || o.kids !== 1) fail('한 줄 칸 안에 딴 것이 있음', `${tag} 칸 안 ${o?.kids}개`);
  if (!o || o.links.length !== 2 || o.links[0].href !== '#/gdr' || o.links[0].text !== `오늘 점수 준비 ${E.ready} / 22` || o.links[1].href !== '#/why' || o.links[1].text !== '다시 하기 ›') fail('고리 둘 — 「오늘 점수 준비 n / 22」→ #/gdr · 「다시 하기」→ #/why', `${tag} ${JSON.stringify(o?.links)}`);
  for (const a of o?.links ?? []) if (a.h < 43.5) fail('누르는 자리 44px 이상', `${tag} 「${a.text}」 ${a.h}px`);
  if (g.h > 64.5) fail('오늘 점수 한 줄 칸 높이 ≤ 64px', `${tag} ${g.h}`);
  if (g.items.length || g.inputs || g.cards || g.pf || g.fun || g.h2 || g.sub || g.sum || g.today || g.more || g.notes.length) fail('첫 화면 한 줄인데 칸 · 카드 · 성적 · 깔때기 · 비중 합 · 고리가 더 보임', `${tag} ${JSON.stringify({cells: g.items.length, cards: g.cards, pf: !!g.pf, fun: g.fun, h2: g.h2, sum: g.sum, today: !!g.today, more: g.more, notes: g.notes.length})}`);
  if (g.todayN !== 1) fail('「오늘 점수」 글은 딱 한 번([6] 10)', `${tag} ${g.todayN}번`);
  if (D.picks.some(x => g.text.includes(x.name))) fail('첫 화면 한 줄에 고른 회사 이름이 보임', tag);
  bump('맞댄 첫 화면 오늘 한 줄');
}
/** 칸 하나 누르기(번호) → 맞댐 */
async function press(p, D, no, tag, X, hash) {
  const i = D.picks.findIndex(x => x.no === no), cell = p.locator(SEL + ' button.gdr-cell').nth(i);
  if ((await cell.getAttribute('aria-expanded')) !== 'true') await cell.click({timeout: 8000}); // 이미 열린 칸은 누르지 않음(누르면 닫힘)
  const g = await p.evaluate(READG, SEL);
  checkCells(g, D, tag + ' 누름', g.card ? no : null); checkCard(g, D, D.picks[i], tag, X); checkSum(g, D, tag + ' 누름');
  await safety(p, hash, `${tag} ${no}번 카드`, {D});
  return g;
}
const mkX = async (D, per, cos = null) => { const infos = new Map(); for (const x of D.picks) infos.set(x.code, infoExp(cos ? cos.get(x.code) : await coGet(x.code))); return {per, info: c => infos.get(c) ?? null}; };

/* 소스 — 글 · 모양 파일(S12 잣대: 글씨는 var(--fs-n) · 간격은 var(--sp-n) · 음수 없음) · 금지 글 · CSP · 내 돈 저장소 */
if (want('src')) {
  for (const [k, c] of BAD_RE) if (jsStrings(SRC_JS).some(s => compact(s).includes(c))) fail('p-gdr.js 글에 금지 글([9] 1)', `「${k}」`);
  if (/(get|set|remove)Item\([^)]*money/i.test(SRC_JS) || /godori-money/.test(jsStrings(SRC_JS).join('\n'))) fail('p-gdr.js 가 내 돈 열쇠를 씀([9] 4)', 'atlas:godori-money');
  if (/innerHTML|insertAdjacentHTML|\.style\.|setAttribute\(\s*['"]style|<script|document\.write/.test(SRC_JS)) fail('p-gdr.js 가 CSP 를 어김(innerHTML · 인라인 style · 스크립트)', '');
  if (!/role: 'list'/.test(SRC_JS) || !/role: 'listitem'/.test(SRC_JS)) fail('목록 역할 소스([9] 8)', 'role list · listitem 이 소스에 없음');
  for (const m of SRC_CSS.replace(/\/\*[\s\S]*?\*\//g, '').matchAll(/([a-z-]+)\s*:\s*([^;{}]+);/g)) {
    const [, k, v] = m;
    if (k === 'font-size' && !/^var\(--fs-[1-6]\)$/.test(v.trim())) fail('p-gdr.css 글씨 크기는 var(--fs-n) 만([10] 6)', `${k}: ${v.trim()}`);
    if (/^(margin|padding|gap|row-gap|column-gap)(-(top|right|bottom|left|block|inline)(-(start|end))?)?$/.test(k) && !v.trim().split(/\s+/).every(x => /^(0|auto|var\(--sp-[1-3]\))$/.test(x))) fail('p-gdr.css 간격은 var(--sp-n) 와 0 만([10] 8 · 음수 없음)', `${k}: ${v.trim()}`);
  }
  bump('소스 본 파일', 2);
}

/* ② ~ ⑤ ⑦ ⑨-3 ⑩ ⑪ ⑮ 네 판 — 두 폭 × 두 곳(어제 끝낸 기록 · 심은 내 돈) */
if (want('main')) {
  const COMBOS = [[360, 640, '#/'], [390, 844, '#/gdr'], [360, 640, '#/gdr'], [390, 844, '#/']], X0 = await mkX(G, PE);
  let ci = 0;
  for (const [w, h, hash] of COMBOS) {
    const tag = `${w}×${h} ${hash}`, full = ALL || ci < 2, p = await newPage(w, h), D = G, n = D.picks.length, home = false /* 흰 첫 화면 — '#/' 판도 open() 이 #/gdr 로 옮김 */;
    try {
      await open(p, hash);
      let g = await p.evaluate(READG, SEL);
      checkHead(g, D, tag, home); checkCells(g, D, tag); checkSum(g, D, tag); checkPerf(g, D, PE, tag); await checkToday(p, g, [DONE()], tag);
      await safety(p, hash, tag + ' 처음'); await layout(p, home ? SEL : '#view', tag + ' 처음');
      // 칸 누르기 — 모두(기본은 앞 두 판) 또는 처음 · 가운데 · 끝 · 마지막 칸을 한 번 더 누르면 닫힘
      const nos = full ? D.picks.map(x => x.no) : [...new Set([D.picks[0]?.no, D.picks[n >> 1]?.no, D.picks[n - 1]?.no])].filter(x => x != null);
      for (const no of nos) await press(p, D, no, tag, X0, hash);
      if (nos.length) {
        await layout(p, home ? SEL : '#view', tag + ' 카드 열림');
        await p.locator(SEL + ' button.gdr-cell').nth(D.picks.findIndex(x => x.no === nos[nos.length - 1])).click();
        g = await p.evaluate(READG, SEL); checkCells(g, D, tag + ' 다시 누름(닫힘)');
      }
      if (ci === 0 && nos.length) { // 키보드 — 칸은 진짜 button 이라 Enter 로 열림 · 확인 못 한 것(?) 줄은 누르면 펼쳐짐
        await p.locator(SEL + ' button.gdr-cell').first().focus(); await p.keyboard.press('Enter');
        g = await p.evaluate(READG, SEL); if (g.items[0]?.exp !== 'true' || !g.card) fail('키보드 Enter 로 칸이 안 열림([9] 8 — button)', tag); else bump('키보드로 연 칸');
        await p.keyboard.press('Enter'); g = await p.evaluate(READG, SEL); if (g.items[0]?.exp !== 'false') fail('키보드 Enter 로 칸이 안 닫힘', tag);
        if (g.q) { await p.locator(SEL + ' details.gdr-q > summary').click(); const o = await p.evaluate(s => document.querySelector(s + ' details.gdr-q')?.open, SEL); if (o !== true) fail('「?」 한 줄을 누르면 펼쳐져야 함([10] 10)', tag); else { const b = await p.evaluate(s => document.querySelector(s + ' details.gdr-q .gdr-wb')?.getBoundingClientRect().height ?? 0, SEL); if (b < 10) fail('펼친 「?」 글이 안 보임', tag); else bump('펼친 확인 못 한 것 줄'); } await p.locator(SEL + ' details.gdr-q > summary').click(); }
      }
      if (home) { // 첫 화면 「어떻게 골랐나 보기 ›」 → #/gdr · 깔때기
        await p.locator(SEL + ' a.more').click({timeout: 8000});
        await p.waitForFunction(() => location.hash === '#/gdr' && !!document.querySelector('#view section.gdr-fun'), null, {timeout: 30000}).catch(() => fail('「어떻게 골랐나 보기」 → #/gdr', tag));
      }
      await settle(p); checkFunnel(await readF(p), D, tag);
      await safety(p, '#/gdr', tag + ' #/gdr 깔때기'); await layout(p, '#view', tag + ' #/gdr 깔때기');
      // #/gdr/<번호> — 모든 카드(기본은 가운데 하나) 열림 · 화면 안 · 없는 번호 · 글자
      const visit = full ? D.picks : [D.picks[n >> 1]].filter(Boolean);
      for (const x of visit) {
        await go(p, '#/gdr/' + x.no); await p.waitForTimeout(150);
        g = await p.evaluate(READG, SEL);
        checkCells(g, D, `${tag} #/gdr/${x.no}`, x.no); checkCard(g, D, x, `${tag} #/gdr/${x.no}`, X0); await checkToday(p, g, [DONE()], `${tag} #/gdr/${x.no}`);
        if (g.card && !(g.card.bottom > 0 && g.card.top < g.card.vh)) fail('#/gdr/<번호> 카드가 화면 밖', `${tag} ${Math.round(g.card.top)}~${Math.round(g.card.bottom)} / ${g.card.vh}`);
        await safety(p, '#/gdr', `${tag} #/gdr/${x.no}`);
      }
      if (visit[0]) await layout(p, '#view', `${tag} #/gdr/${visit[0].no}`);
      for (const bad of ['999', 'x1']) { await go(p, '#/gdr/' + bad); g = await p.evaluate(READG, SEL); checkCells(g, D, `${tag} #/gdr/${bad}`, null); bump('없는 번호'); }
      if (ci < 2) { // 다시 열어도 그대로 — 새로 고침 뒤에도 내 돈 · 매매일지 기록이 그대로 · 같은 칸이 다시 그려짐
        await go(p, hash); await harvest(p); await p.reload({waitUntil: 'domcontentloaded'}); await settle(p);
        g = await p.evaluate(READG, SEL); checkHead(g, D, tag + ' 다시 엶', home);
      }
      await finalize(p, tag);
    } catch (e) { fail('판 멈춤', `${tag}: ${e.message.split('\n')[0]}`); }
    await p.context().close(); ci++;
  }
}

/* ⑩ 오늘 판정 — 오늘 기록이 있을 때 · 쉬어 가자 · 기록이 바뀔 때 */
if (want('today')) {
  const X0 = await mkX(G, PE);
  const CASES = [ // [이름, 폭, 높이, 길, 심은 기록]
    ['오늘 점수 20(좋아)', 360, 640, '#/', [DONE(), todayRec('go20')]], ['오늘 점수 16(반만)', 390, 844, '#/gdr', [todayRec('wait16')]], ['오늘 점수 22 · 어제는 쉬어 가자', 360, 640, '#/gdr/1', [{...todayRec('rest'), at: new Date(Date.now() - 864e5).toISOString()}, todayRec('go22')]],
    ['오늘 끝낸 열한 답이 덜 찬 기록', 360, 640, '#/gdr', [DONE(), {...todayRec('go20'), answers: [2, 0, 0, null, null, null, null, null, null, null, null]}]], ['오늘 두 번 — 앞 쉬어 가자 · 뒤 좋아', 390, 844, '#/', [todayRec('rest', 120), todayRec('go22', 30)]],
    ['오늘 두 번 — 앞 좋아 · 뒤 쉬어 가자', 360, 640, '#/gdr', [todayRec('go22', 120), todayRec('rest', 30)]]];
  for (const hash of ['#/', '#/gdr', '#/gdr/1']) CASES.push([`쉬어 가자 ${hash}`, hash === '#/gdr' ? 390 : 360, hash === '#/gdr' ? 844 : 640, hash, [DONE(), todayRec('rest')]]);
  for (const [nm, w, h, hash, recs] of CASES) {
    const T = `오늘 ${nm} ${w}×${h} ${hash}`, p = await newPage(w, h, {why: recs, money: nm.includes('20(') ? null : MONEY}), home = false /* 흰 첫 화면 — '#/' 판도 open() 이 #/gdr 로 옮김 */, E = expToday(recs);
    try {
      await open(p, hash); const g = await p.evaluate(READG, SEL);
      if (E?.verdict === 'rest') { await checkRest(p, T); await safety(p, hash, T); await layout(p, home ? SEL : '#view', T); if (await p.evaluate(() => !!document.querySelector('#view section.gdr-fun'))) fail('쉬어 가는 날 #/gdr 에 깔때기가 있음', T); }
      else if (home && E) { await checkTodayOne(p, g, recs, T); await safety(p, hash, T); await layout(p, SEL, T); } // (옛 첫 화면 한 줄 — 흰 첫 화면에서는 home 이 늘 false · 함수는 남겨 둠)
      else {
        checkHead(g, G, T, home); checkCells(g, G, T, hash === '#/gdr/1' ? 1 : null); await checkToday(p, g, recs, T);
        if (hash === '#/gdr/1' && G.picks[0]) checkCard(g, G, G.picks[0], T, X0);
        await safety(p, hash, T); await layout(p, home ? SEL : '#view', T);
      }
      await finalize(p, T);
    } catch (e) { fail('오늘 판정 길 멈춤', `${T}: ${e.message.split('\n')[0]}`); }
    await p.context().close();
  }
  { // 같은 화면에서 기록이 바뀌면 그 자리에서 — 어제 기록뿐 → 오늘 좋아(줄이 생김) → 오늘 쉬어 가자(한 줄만) → 오늘 좋아가 더 새로(다시 열림)
    const T = '오늘 기록이 바뀜 360×640 #/gdr', p = await newPage(360, 640);
    try {
      await open(p, '#/gdr'); let g = await p.evaluate(READG, SEL); if (g.today) fail('어제 기록뿐인데 오늘 점수 줄이 있음', T);
      const put = recs => p.evaluate(([k, v]) => window.__raw.set(k, v), [WHY_KEY, JSON.stringify(recs)]);
      const steps = [[[DONE(), todayRec('go20', 20)], 'open'], [[DONE(), todayRec('go20', 20), todayRec('rest', 10)], 'rest'], [[DONE(), todayRec('go20', 20), todayRec('rest', 10), todayRec('wait16', 1)], 'open']];
      for (const [recs, st] of steps) {
        await put(recs); p._why = JSON.stringify(recs);
        await p.waitForFunction(([s, ready]) => { const b = document.querySelector(s); if (!b) return false; const rest = /\brest1\b/.test(b.className); const t = b.querySelector('a.gdr-today')?.textContent ?? ''; return ready === 'rest' ? rest : !rest && !/\block1\b/.test(b.className) && t.includes(ready); }, [SEL, st === 'rest' ? 'rest' : '준비 ' + expToday(recs).ready + ' /'], {timeout: 8000}).catch(() => fail('기록이 바뀌면 그 자리에서 바뀜([5] 7)', `${T} → ${st} ${recs.length}번째 기록`));
        await settle(p); g = await p.evaluate(READG, SEL); if (st === 'rest') await checkRest(p, T + ' 바뀐 뒤'); else await checkToday(p, g, recs, T + ' 바뀐 뒤');
      }
      await finalize(p, T, {writesOk: true}); bump('기록이 바뀐 길');
    } catch (e) { fail('오늘 판정 길 멈춤', `${T}: ${e.message.split('\n')[0]}`); }
    await p.context().close();
  }
  { // 첫 화면에서 들어가 같은 자리에서 — 흰 첫 화면(2026-10-19)에는 칸이 없어 바로 가기로 #/gdr 에 들어간 뒤 기록이 바뀌면 그 자리에서(옛: 첫 화면 한 줄) · 끝에 첫 화면 바로 가기를 다시 잼
    const T = '오늘 기록이 바뀜 360×640 #/', p = await newPage(360, 640);
    try {
      await open(p, '#/'); let g = await p.evaluate(READG, SEL); if (g.state !== 'open' || g.today) fail('어제 기록뿐인데 첫 화면에서 들어간 칸이 열린 칸이 아님', `${T} ${g.state}`);
      const put = recs => p.evaluate(([k, v]) => window.__raw.set(k, v), [WHY_KEY, JSON.stringify(recs)]);
      const steps = [[[DONE(), todayRec('go20', 20)], 'open'], [[DONE(), todayRec('go20', 20), todayRec('rest', 10)], 'rest'], [[DONE(), todayRec('go20', 20), todayRec('rest', 10), todayRec('wait16', 1)], 'open']];
      for (const [recs, st] of steps) {
        await put(recs); p._why = JSON.stringify(recs);
        await p.waitForFunction(([s, ready]) => { const b = document.querySelector(s); if (!b) return false; const rest = /\brest1\b/.test(b.className); const t = b.querySelector('a.gdr-today')?.textContent ?? ''; return ready === 'rest' ? rest : !rest && !/\block1\b/.test(b.className) && t.includes(ready); }, [SEL, st === 'rest' ? 'rest' : '준비 ' + expToday(recs).ready + ' /'], {timeout: 8000}).catch(() => fail('첫 화면에서 들어간 칸 — 기록이 바뀌면 그 자리에서 바뀜', `${T} → ${st} ${recs.length}번째 기록`));
        await settle(p); g = await p.evaluate(READG, SEL); if (st === 'rest') await checkRest(p, T + ' 바뀐 뒤'); else await checkToday(p, g, recs, T + ' 바뀐 뒤');
      }
      await p.evaluate(() => { location.hash = '#/'; }); await homeGate(p, T + ' 다시 첫 화면');
      await finalize(p, T, {writesOk: true}); bump('기록이 바뀐 길 첫 화면');
    } catch (e) { fail('오늘 판정 길 멈춤', `${T}: ${e.message.split('\n')[0]}`); }
    await p.context().close();
  }
}

/* ⑧ 잠금 — 기록 없음(첫 화면 · #/gdr · #/gdr/<번호>) · 덜 끝낸 기록 · 기억 못 하는 기계 · 고리 → #/why · 그 자리에서 열림 */
if (want('lock')) {
  const half = [{...DONE(), answers: [2, 0, 0, null, null, null, null, null, null, null, null]}];
  for (const [w, h, hash, o, nm] of [[360, 640, '#/', {why: []}, '기록 없음'], [390, 844, '#/', {why: []}, '기록 없음'], [390, 844, '#/gdr', {why: []}, '기록 없음'], [360, 640, '#/gdr/1', {why: []}, '기록 없음'],
    [390, 844, '#/gdr', {why: half}, '덜 끝낸 기록'], [360, 640, '#/', {why: half}, '덜 끝낸 기록'], [360, 640, '#/gdr', {store: 'throw'}, '기억 못 하는 기계']]) {
    const T = `잠금 ${nm} ${w}×${h} ${hash}`, p = await newPage(w, h, o);
    try {
      await open(p, hash); await p.waitForTimeout(300);
      await checkLock(p, T); await safety(p, hash, T); await layout(p, hash === '#/' ? SEL : '#view', T);
      if (hash === '#/gdr' && nm === '기록 없음') { // 같은 화면에서 질문을 마치면(기록이 생기면) 그 자리에서 열림 → 칸 · 성적
        await p.evaluate(([k, v]) => window.__raw.set(k, v), [WHY_KEY, JSON.stringify([DONE()])]); p._why = JSON.stringify([DONE()]);
        await p.waitForFunction(s => !!document.querySelector(s + ':not(.lock1) .gdr-cell'), SEL, {timeout: 8000}).catch(() => fail('그 자리에서 열림(끝낸 기록이 생긴 뒤)', T));
        await settle(p); const g = await p.evaluate(READG, SEL); checkCells(g, G, T + ' 열린 뒤'); checkPerf(g, G, PE, T + ' 열린 뒤'); await layout(p, '#view', T + ' 열린 뒤');
      }
      if (hash === '#/gdr/1') { // 고리를 누르면 열한 질문(#/why)
        await p.locator(SEL + ' a.gdr-l1').click({timeout: 8000});
        await p.waitForFunction(() => location.hash === '#/why', null, {timeout: 15000}).catch(() => fail('잠금 고리 → #/why', T));
      }
      if (nm === '덜 끝낸 기록') { await p.waitForTimeout(1800); await checkLock(p, T + ' 1.8초 뒤'); }
      await finalize(p, T, {writesOk: nm === '기록 없음' && hash === '#/gdr'}); bump('잠금 길');
    } catch (e) { fail('잠금 길 멈춤', `${T}: ${e.message.split('\n')[0]}`); }
    await p.context().close();
  }
}

/* ⑨-2 못 돌린 날 — gdr.json asOf 를 앞 날로 바꿔(종가도 그 날 값으로) 「고른 날 값 → 오늘 값」 한 줄을 close × dates 로 따로 셈 · 같은 날이면 0 */
if (want('stale')) {
  const rows = kRows(HOME), D0 = G.picks.length ? G : null;
  const mkAt = async back => { const D = clone(G), d = dates[dates.length - 1 - back]; D.asOf = d; for (const x of D.picks) { const I = infoExp(await coGet(x.code)), v = I?.closeOn(d); if (v > 0) x.price = Math.round(v); } return D; };
  const cases = D0 ? [['앞 거래일', 360, 640, '#/gdr', await mkAt(1)], ['엿새 앞', 390, 844, '#/', await mkAt(6)], ['앞 거래일 · 회사 파일 하나 없음', 390, 844, '#/gdr', await mkAt(1), 1]] : [];
  if (!D0) { /* 고른 곳 0 — 카드가 없어 못 돌린 날 줄을 맞댈 데가 없음(고른 곳이 있는 판에서 맞댐) */ }
  else if (dates.length < 8) fail('못 돌린 날 판을 꾸미지 못함', `days.json 날짜 ${dates.length}`);
  else for (const [nm, w, h, hash, D, miss] of cases) {
    const T = `못 돌린 날 ${nm} ${w}×${h} ${hash}`, home = false /* 흰 첫 화면 — '#/' 판도 open() 이 #/gdr 로 옮김 */, code = D.picks[0]?.code;
    const routes = miss ? [[`**/atlas/data/co/${code}.json`, r => r.fulfill({status: 404, contentType: 'text/plain', body: 'no'})]] : [], p = await newPage(w, h, {gdr: D, routes, allow: miss ? [`/atlas/data/co/${code}.json`] : []});
    try {
      const cosD = new Map(COF), per = perfExp(D, HOME, new Map([...COS].filter(([k]) => !(miss && k === code)))); if (miss) cosD.set(code, null);
      const X = await mkX(D, per, cosD);
      await open(p, hash); let g = await p.evaluate(READG, SEL); checkHead(g, D, T, home); checkPerf(g, D, per, T);
      for (const x of D.picks) g = await press(p, D, x.no, T, X, hash);
      await layout(p, home ? SEL : '#view', T); await finalize(p, T); bump('못 돌린 날 판');
    } catch (e) { fail('못 돌린 날 판 멈춤', `${T}: ${e.message.split('\n')[0]}`); }
    await p.context().close();
  }
}

/* ⑨-3 회사 값 한 줄 — 파일에서 빠진 값은 「?」 · 큰 회사 크기(조 · 억) · c.per 로 물러남 */
if (want('val') && G.picks.length) {
  const [a, b, c] = G.picks.map(x => x.code);
  const edits = [[a, j => { delete j.per; delete j.pbr; if (j.c) delete j.c.cap; }, 'PER · PBR · 회사 크기 없음'], [b, j => { j.per = null; if (j.c) { j.c.per = 12.34; j.c.cap = 17507; } j.pbr = 0.5; }, 'c.per 로 물러남 · 1조 7,507억 · PBR 0.50'], [c, j => { j.close = []; }, '종가 줄 없음 → 1년 꼭대기 「?」']];
  const mods = new Map(), routes = [];
  for (const [code, fn] of edits) { if (!code) continue; const j = clone(await coGet(code) ?? {}); fn(j); mods.set(code, j); routes.push([`**/atlas/data/co/${code}.json`, r => r.fulfill({status: 200, contentType: 'application/json', body: JSON.stringify(j)})]); }
  const missCode = G.picks[3]?.code; if (missCode) routes.push([`**/atlas/data/co/${missCode}.json`, r => r.fulfill({status: 404, contentType: 'text/plain', body: 'no'})]);
  for (const [w, h, hash] of [[360, 640, '#/gdr'], [390, 844, '#/']]) {
    const T = `회사 값 빠짐 ${w}×${h} ${hash}`, p = await newPage(w, h, {routes, allow: missCode ? [`/atlas/data/co/${missCode}.json`] : []}), home = false /* 흰 첫 화면 — '#/' 판도 open() 이 #/gdr 로 옮김 */;
    try {
      const cosV = new Map(COF); for (const [k, v] of mods) cosV.set(k, v); if (missCode) cosV.set(missCode, null);
      const per = perfExp(G, HOME, new Map([...COS].filter(([k]) => k !== missCode && !mods.has(k))));
      const X = await mkX(G, null, cosV); X.per = null; // 성적 줄은 이 판에서 안 맞댐(값 줄만)
      await open(p, hash);
      for (const x of G.picks) { const i = G.picks.indexOf(x), cell = p.locator(SEL + ' button.gdr-cell').nth(i); if ((await cell.getAttribute('aria-expanded')) !== 'true') await cell.click(); const g = await p.evaluate(READG, SEL); if (!g.card) { fail('카드가 안 열림', `${T} ${x.no}번`); continue; } if (g.card.val.length !== 1) fail('회사 값은 한 줄(p 하나)', `${T} ${x.no}번 ${g.card.val.length}개`); else checkVal(g.card.val[0], X.info(x.code), `${T} ${x.no}번`); await safety(p, hash, `${T} ${x.no}번`); }
      void per; await layout(p, home ? SEL : '#view', T); await finalize(p, T); bump('회사 값 판');
    } catch (e) { fail('회사 값 판 멈춤', `${T}: ${e.message.split('\n')[0]}`); }
    await p.context().close();
  }
}

/* ⑥ 자료를 바꾼 길 */
if (want('data') && (DATA_ARG === 'v1sample' || ONLY)) { // 자료를 바꾼 길은 v1 표본 위에서 한 번만(live · v2 판은 같은 길을 또 돌 까닭이 없음) — --only data 로 부르면 어느 판이든 돎
  // 서른여섯 곳 — 업종마다 세 곳 · 이름이 긴 회사부터(칸 글 넘침 시험) · 관리 종목 수가 있음 · 틀린다면 이유 없음(「?」)
  const S36 = (() => {
    const D = clone(V1S), per = {}, picks = [];
    const cos = Object.entries(MKT.companies).filter(([, o]) => o?.n && o?.i).sort((a, b) => b[1].n.length - a[1].n.length || (a[0] < b[0] ? -1 : 1));
    for (const [code, o] of cos) {
      if (picks.length >= 36) break; if ((per[o.i] = (per[o.i] || 0) + 1) > 3) continue;
      const no = picks.length + 1, w = no <= 12 ? 3 : no <= 24 ? 2.5 : 2, price = 1000 + no * 12345;
      picks.push({no, code, name: o.n, ind: o.i, w, price, sell: Math.floor(price * 9 / 10), half: Math.floor(price * 12 / 10), reason: `영업이익 ${100 + no}억 → ${300 + no}억 · 석 달 +${5 + no % 30}.0% · 업종 돈 1.${1 + no % 9}배`, saying: (no - 1) % 11, g: {}});
    }
    D.picks = picks; D.inds = {}; for (const x of picks) D.inds[x.ind] = (w10(D.inds[x.ind] ?? 0) + w10(x.w)) / 10;
    Object.assign(D.counts, {managed: 0, passAll: 40, picked: 36, cash: 10, g1: Math.max(40, D.counts.g1 ?? 0), g2: Math.max(40, D.counts.g2 ?? 0), g3: Math.max(40, D.counts.g3 ?? 0), g4: Math.max(40, D.counts.g4 ?? 0), g5: Math.max(40, D.counts.g5 ?? 0)});
    if (D.status) D.status = {...D.status, lists: 'ok'};
    return D;
  })();
  await Promise.all(S36.picks.map(x => coGet(x.code)));
  const perS = perfExp(S36, HOME, new Map(S36.picks.map(x => [x.code, COF.get(x.code)?.c]).filter(([, c]) => c)));
  for (const [tag, w, h, hash, o, D] of [['서른여섯 곳', 360, 640, '#/', {gdr: S36}, S36], ['서른여섯 곳', 390, 844, '#/gdr', {gdr: S36}, S36]]) {
    const T = `${tag} ${w}×${h} ${hash}`, p = await newPage(w, h, o), home = false /* 흰 첫 화면 — '#/' 판도 open() 이 #/gdr 로 옮김 */;
    try {
      const X = await mkX(D, perS);
      await open(p, hash);
      let g = await p.evaluate(READG, SEL); checkHead(g, D, T, home); checkCells(g, D, T); checkSum(g, D, T); await layout(p, home ? SEL : '#view', T);
      const last = D.picks[D.picks.length - 1];
      if (last) { g = await press(p, D, last.no, T, X, hash); await layout(p, home ? SEL : '#view', T + ' 끝 칸 열림'); }
      if (D.picks[0]) await press(p, D, D.picks[0].no, T, X, hash);
      if (!home) { checkFunnel(await readF(p), D, T); await layout(p, '#view', T + ' 깔때기'); }
      await finalize(p, T); bump('자료 바꾼 길');
    } catch (e) { fail('바꾼 길 멈춤', `${T}: ${e.message.split('\n')[0]}`); }
    await p.context().close();
  }
  // gdr.json 못 받음 — 칸은 「?」 줄 하나 · 칸 · 입력 칸 · 깔때기 없음 · 화면 오류 없음(그 파일 404 만)
  for (const [w, h, hash] of [[390, 844, '#/'], [360, 640, '#/gdr']]) {
    const T = `gdr.json 못 받음 ${w}×${h} ${hash}`, p = await newPage(w, h, {gdr: 404, allow: ['/next/data/gdr.json']});
    try {
      await open(p, hash);
      const g = await p.evaluate(() => { const s = document.querySelector('#view section.gdr'); return {q: [...(s?.querySelectorAll('p') ?? [])].map(x => x.textContent), cells: s?.querySelectorAll('.gdr-cell').length ?? -1, input: !!s?.querySelector('input'), fun: !!document.querySelector('#view section.gdr-fun')}; });
      if (!g.q.some(t => t.startsWith('?')) || g.cells !== 0 || g.input || g.fun) fail('못 받음 「?」 줄', `${T} ${JSON.stringify(g)}`);
      await layout(p, hash === '#/' ? SEL : '#view', T); await finalize(p, T); bump('자료 바꾼 길');
    } catch (e) { fail('바꾼 길 멈춤', `${T}: ${e.message.split('\n')[0]}`); }
    await p.context().close();
  }
  // 새 자료꼴(gdr-v2 · mkV2 — 위 맨 앞) — 화면이 깨지지 않고 같은 줄을 그림(없는 칸은 줄이 없음)
  { const D2 = mkV2(3), T = '새 자료꼴 360×640 #/gdr', p = await newPage(360, 640, {gdr: D2});
    try {
      const X = await mkX(D2, perfExp(D2, HOME, COS)); await open(p, '#/gdr'); let g = await p.evaluate(READG, SEL);
      checkHead(g, D2, T, false); checkCells(g, D2, T); checkSum(g, D2, T); checkPerf(g, D2, perfExp(D2, HOME, COS), T);
      if (g.bigs !== '큰 업종 비중 합(위 끝 15%) 반도체 9% · 금융 6%') fail('큰 업종 비중 합 줄(위 끝)', `${T} 「${g.bigs}」`);
      if (g.fall3 !== '세 곳이 함께 내린 날 3일') fail('세 곳이 함께 내린 날 줄', `${T} 「${g.fall3}」`);
      if (g.q) fail('목록은 받았는데 관리 종목 「?」 줄이 있음(status.lists ok)', T);
      for (const x of D2.picks) { g = await press(p, D2, x.no, T, X, '#/gdr'); checkCardV2(g, D2, x, T); if (x.no === D2.picks[0].no) { await layout(p, '#view', T + ' 카드 열림'); await p.locator(SEL + ' details.gdr-mcin > summary').click(); const o = await p.evaluate(s => document.querySelector(s + ' details.gdr-mcin')?.open, SEL); if (o !== true) fail('「무엇을 넣어 셈했나」를 누르면 펼쳐져야 함', T); else { await layout(p, '#view', T + ' 셈한 것 펼침'); await p.locator(SEL + ' details.gdr-mcin > summary').click(); } } }
      const f = await readF(p); checkFunnelV2(f, D2, T); await layout(p, '#view', T + ' 깔때기');
      if (f?.sens) { await p.locator('#view details.gdr-sens > summary').click(); await layout(p, '#view', T + ' 남는 곳 수 펼침'); }
      await finalize(p, T); bump('새 자료꼴 길');
    } catch (e) { fail('새 자료꼴 길 멈춤', `${T}: ${e.message.split('\n')[0]}`); }
    await p.context().close();
  }
  { // 새 자료꼴 첫 파일(고른 곳 0 · 목록 · 분기 숫자 모두 못 받음 → 전부 현금) — 칸은 현금으로 둠 하나 · 「?」 두 줄 · 성적 칸 없음
    const D0 = mkV2(0); D0.status = {lists: 'missing', quarters: 'missing'}; D0.counts = {...D0.counts, outList: 0, passAll: 0, g1: 0, g2: null, picked: 0, cash: 100, cutInd: 0, cutBig: 0, why: 'lists,quarters'}; D0.bigs = {}; D0.fall3 = {n: null, days: 250, of: 250}; D0.inds = {};
    // 고른 날 셋 — ① 샘플 날짜 그대로(올리기 검사처럼 사이트 날이 더 새면 앞섬 · 같으면 같은 날) ② 사이트 마지막 날의 앞 거래일(늘 앞섬 → 「고른 날 · 사이트 날」 줄이 있어야 함) ③ 사이트 마지막 날(같은 날 → 줄 없음)
    const variants = [['', D0], ['고른 날이 앞섬', {...D0, asOf: dates[dates.length - 2]}], ['사이트와 같은 날', {...D0, asOf: MKT.asOf}]];
    for (const [vn, Dv] of variants) for (const [w, h, hash] of [[360, 640, '#/'], [390, 844, '#/gdr']]) {
      const T = `고른 곳 0${vn ? ' · ' + vn : ''} ${w}×${h} ${hash}`, p = await newPage(w, h, {gdr: Dv}), home = false /* 흰 첫 화면 — '#/' 판도 open() 이 #/gdr 로 옮김 */;
      try {
        await open(p, hash); const g = await p.evaluate(READG, SEL); checkHead(g, Dv, T, home); checkCells(g, Dv, T); checkSum(g, Dv, T);
        if (!g.none || g.qq || (g.q && g.q.sum !== g.none.sum)) fail('고른 곳 0 — 「? … 아직 안 와서」 까닭 한 줄이 두 줄(관리 종목 · 분기 숫자 「?」)을 대신함', `${T} ${JSON.stringify([g.none?.sum, g.q?.sum, g.qq?.sum])}`); // g.q 는 같은 접는 칸(class gdr-q)
        if (g.fall3 || g.bigs) fail('고른 곳 0 — 큰 업종 비중 합 · 세 곳이 함께 내린 날 줄이 없음(셀 곳이 없음)', `${T} ${JSON.stringify([g.bigs, g.fall3])}`);
        if (!home) { const f = await readF(p); checkFunnelV2(f, Dv, T); await layout(p, '#view', T + ' 깔때기'); }
        await safety(p, hash, T, {D: Dv}); await layout(p, home ? SEL : '#view', T); await finalize(p, T); bump('고른 곳 0 길');
      } catch (e) { fail('고른 곳 0 길 멈춤', `${T}: ${e.message.split('\n')[0]}`); }
      await p.context().close();
    }
  }
  { // 담은 곳 둘(세 곳 미만) — 세 곳이 함께 내린 날을 못 셈 → 「? 세 곳이 함께 내린 날은 담은 곳이 셋 아래라 못 셌어요.」
    const D2p = mkV2(2); D2p.fall3 = {n: null, days: 250, of: 0};
    const T = '담은 곳 둘 360×640 #/gdr', p = await newPage(360, 640, {gdr: D2p});
    try {
      await open(p, '#/gdr'); const g = await p.evaluate(READG, SEL);
      if (g.fall3 !== '? 세 곳이 함께 내린 날은 담은 곳이 셋 아래라 못 셌어요.') fail('세 곳 미만이면 「? 세 곳이 함께 내린 날은 담은 곳이 셋 아래라 못 셌어요.」', `${T} 「${g.fall3}」`);
      await layout(p, '#view', T); await finalize(p, T); bump('맞댄 세 곳 미만 줄');
    } catch (e) { fail('담은 곳 둘 길 멈춤', `${T}: ${e.message.split('\n')[0]}`); }
    await p.context().close();
  }
}

/* ⑨ 고른 날 뒤 성적 — 자료를 바꿔(고른 날을 앞당김 · 코스피 그날 값 없음 · co 하나 못 받음 · 회사마다 날짜 다름) 따로 셈과 맞댐 */
if (want('perf') && G.picks.length) {
  const last = G.picks[G.picks.length - 1], first = G.picks[0], pd = COS.get(first?.code)?.priceDate?.slice(0, 10) ?? MKT.asOf;
  const rows = kRows(HOME), prevDay = rows.filter(r => r[0] < pd).slice(-3)[0]?.[0]; // 마지막 값 날보다 사흘(거래일) 앞
  const withK = (H, day, v) => { const x = clone(H); if (!kRows(x).some(r => r[0] === day)) { x.idx.KOSPI.rows.push([day, v]); x.idx.KOSPI.rows.sort((a, b) => (a[0] < b[0] ? -1 : 1)); } return x; };
  const H2 = withK(HOME, pd, Math.round((rows.at(-1)?.[1] ?? 1000) * 0.97 * 100) / 100); // 코스피 마지막 값 날(없으면 넣음)
  const D1 = clone(G); D1.asOf = prevDay ?? D1.asOf; if (D1.picks.length) D1.picks[D1.picks.length - 1].price = Math.round(last.price * 1.15); // 한 곳은 비싸게 — 나쁜 숫자도 보임
  const D2 = clone(G); D2.asOf = '2026-10-11'; // 코스피에 없는 날(일요일) — 견줄 수 없음 「?」
  const coRoute = (code, fn) => [`**/atlas/data/co/${code}.json`, async r => { const res = await r.fetch(); const j = await res.json(); fn(j); await r.fulfill({status: 200, contentType: 'application/json', body: JSON.stringify(j)}); }];
  const homeRoute = H => ['**/atlas/data/home.json', r => r.fulfill({status: 200, contentType: 'application/json', body: JSON.stringify(H)})];
  const COS2 = new Map([...COS].map(([k, v]) => [k, {...v}]));
  const mixedDay = rows.filter(r => r[0] < pd).at(-1)?.[0];
  const COS3 = new Map(COS2); if (first && mixedDay) COS3.set(first.code, {...COS2.get(first.code), priceDate: mixedDay});
  const COS4 = new Map(COS2); if (first) COS4.delete(first.code);
  const cases = [
    ['고른 날 앞당김', 360, 640, {gdr: D1, routes: [homeRoute(H2)]}, D1, perfExp(D1, H2, COS2)],
    ['코스피 그날 값 없음', 390, 844, {gdr: D2, routes: [homeRoute(H2)]}, D2, perfExp(D2, H2, COS2)],
    ['co 하나 못 받음', 360, 640, {gdr: D1, routes: [homeRoute(H2), [`**/atlas/data/co/${first?.code}.json`, r => r.fulfill({status: 404, contentType: 'text/plain', body: 'no'})]], allow: [`/atlas/data/co/${first?.code}.json`]}, D1, perfExp(D1, H2, COS4)],
    ...(mixedDay ? [['회사마다 날짜 다름', 390, 844, {gdr: D1, routes: [homeRoute(H2), coRoute(first.code, j => { j.c.priceDate = mixedDay; })]}, D1, perfExp(D1, H2, COS3)]] : []),
  ];
  if (!prevDay) fail('성적 판을 꾸미지 못함', '코스피 줄에 앞 날이 없음');
  for (const [nm, w, h, o, D, per] of cases) {
    const T = `성적 ${nm} ${w}×${h}`, p = await newPage(w, h, o);
    try {
      const X = await mkX(D, per, nm === 'co 하나 못 받음' ? new Map([...COF, [first.code, null]]) : COF); // 값 줄 · 못 돌린 날 줄은 따로 판에서 맞댐 — 여기선 카드가 열리는지 · 성적만
      await open(p, '#/gdr'); let g = await p.evaluate(READG, SEL); checkPerf(g, D, per, T);
      for (const x of D.picks) { const i = D.picks.indexOf(x), cell = p.locator(SEL + ' button.gdr-cell').nth(i); if ((await cell.getAttribute('aria-expanded')) !== 'true') await cell.click(); g = await p.evaluate(READG, SEL); if (!g.card) { fail('카드가 안 열림', `${T} ${x.no}번`); continue; } if (g.card.perf !== perfCardTxt(D, per.get(x.code))) fail('카드 성적 줄(같은 때 코스피 · 따로 셈)', `${T} ${x.no}번 「${g.card.perf}」 ≠ 「${perfCardTxt(D, per.get(x.code))}」`); else bump('맞댄 성적 카드'); void X; }
      if (nm === '고른 날 앞당김') { const bad = per.get(D.picks.at(-1)?.code); if (!(bad?.r < 0) || !g.pf.ps.some(t => t.startsWith('가장 나쁜 곳') && t.includes(pct(bad.r)))) fail('나쁜 숫자를 숨기지 않음([6] 4)', `${T} ${JSON.stringify(g.pf.ps)}`); }
      await layout(p, '#view', T); await finalize(p, T); bump('성적 판');
    } catch (e) { fail('성적 판 멈춤', `${T}: ${e.message.split('\n')[0]}`); }
    await p.context().close();
  }
}

await browser.close();
const sec = Math.round((Date.now() - t0) / 1000);
const res = {schema: 'atlas11-next-gdr-2', when: new Date().toISOString(), base, path: NEXT, all: ALL, only: ONLY ? [...ONLY] : null, version: G.version ?? null, asOf: G.asOf ?? null, picks: G.picks.length, sec, counts, fails, ok: !fails.length};
if (OUT) { await fs.mkdir(path.dirname(path.resolve(OUT)), {recursive: true}); await fs.writeFile(path.resolve(OUT), JSON.stringify(res, null, 1) + '\n'); }
console.log(JSON.stringify({sec, picks: res.picks, version: res.version, counts}, null, 1));
if (fails.length) { console.log('실패 ' + (counts.fail || 0) + '건:'); for (const [k, x] of fails.slice(0, 80)) console.log(' -', k, '·', x); process.exit(1); }
console.log('실패 0');
