// 고도리 보내기 — 「친구에게 무슨 말을 할래?」 글상자 · 친구가 연 주소(#/s/…) 맞대기 — 사장님 2026-10-17 21:10(싱가포르) 「고도리 · 하나로 묶은 명령문」 [4] 1 ~ 9
//   쓰는 법: node scripts/atlas11/next/check_share.mjs --base http://127.0.0.1:8826 [--pw /opt/node-tools/] [--path /next/?dev=1] [--out 결과.json] [--all] [--limit N]
//     --all = 두 폭(360×640 · 390×844) 모두에서 모든 길 · 기본 = 360 은 모든 길 · 390 은 회사 화면 글상자 · 친구 주소 하나(--limit 은 받기만 — 기본과 같음)
//   기준 = 사장님 원문(docs/design/godori-2026-10-17/order-2110.txt [4] — 글상자 이름 · 빠른 말 셋 · 「보낸 날 값」 · 「오늘 값」 · 「같이 따져 줘」 · 「반토막 난다면 왜일까?」)
//          주소 꼴 = 일 나누기(docs/design/godori-2026-10-17/brief2.md) 「#/s/<번호>/<날>/<값>」 + 말 조각(UTF-8 base64url) — 이 검사가 따로 만들고 따로 풂(화면 모듈 p-share.js 의 셈을 쓰지 않음)
//   ⓪ 글 거르기(브라우저 없이): words.js 한 곳 = 편지 서버 · 편지 화면이 부름 · 편지 시험 글 · 빠른 말은 지남 · 수익 숫자는 걸림 · 화면 쓰지 않을 말 ⊇ next_check 목록
//   ① 보내기 입구마다 글상자(7곳): 회사 화면 「보내기」 · 「같이 따져 줘」 · 시황 「보내기」 · 소개 쪽 「친구에게 보내기」 · 편지 쪽 「봉인 소식 …」 · 초대장 · 사장님 새 초대장
//   ② 글상자: 이름(원문) · 빠른 말 셋(원문 차례) · 누르면 글상자에 · 갇힌 차례(Tab · Shift+Tab) · Esc 닫힘 · 닫으면 연 단추로 · 모양 파일이 앱 없이도 붙음
//   ③ 거르는 말 → 그 말을 짚어 알림 · 보내기 막힘(공유 창 안 열림) → 고치면 풀림 · 수익 숫자(+30% 벌었어 · 30퍼 먹었다 · 2배 올랐어) 막힘
//   ④ 공유 창(가짜) = 글 + 주소 함께 · 주소 꼴 · 말 조각을 풀면 보낸 말 · 같이 따져 줘 = a · 보낸 글 · 제목에 수익 숫자 없음
//   ⑤ 공유 창 없음 → 글 + 주소 함께 복사 · 알림 · 복사도 막힘 → 글을 보여 줌 · 대화창(dialog)을 못 쓰는 옛 기계 → 칸으로 열림(갇힌 차례 · Esc · 보내기)
//   ⑥ 친구 주소: 보낸 날 값 · 오늘 값(자료와 맞댐) · 그림(선 · 보낸 날 금빛 점) · 질문이 먼저 · 다 답하기 전엔 보낸 말이 화면에 없음 → 다 답한 뒤 보낸 말 ·
//      같이 따져 줘 = 「반토막 난다면 왜일까?」 + 내 생각 · 기록과 다른 값 「?」 · 깨진 말 · 거르는 말이 든 주소 · 이상한 주소
//   ⑧ 영어로 본 사람 — 빠른 말 · 기본 말 = 보이는 글(바뀐 글) · 쓴 사람 글(걸린 낱말 · 보낸 말 · 내 생각)은 한글이면 lang="ko"(엔진이 안 바꿈)
//   ⑦ 모양 — 옆 넘침 0 · 칸 밖 0 · 누르는 자리 44px · 글 17px · 쓰지 않을 말 0(남의 글 data-proper 밖) · 캔버스 0 · 화면 오류 0 ·
//      글씨 크기는 이름표(--fs-1 ~ 6) 안 · 한 칸 가짓수 6 이하 · 간격은 0 · 8 · 16 · 24 만 · 음수 간격 0(사장님 2026-10-18 [10] 5 · 6 · 8)
//   ⑥-2 친구 주소 차례([5] 10): 종목 이름 한 줄 → 질문 → 친구 말 칸 → 값 칸(그림 · 두 값) → 안전 문장 — 질문이 값 칸보다 위(두 폭)
//   ⑥-3 친구 쪽 첫 화면(독립 점검 VJ 2026-10-18): 360×640 · 390×844 에서 첫 질문의 답 셋이 아래 탭(고정)보다 위에 다 보임 — 짧은 이름 · 같이 따져 줘 · 이름 9 ~ 10자 · 11 ~ 13자 회사(자료 mkt.json 에서 고름) ·
//      폭 320×568 은 답 둘까지(셋째는 질문 칸 자체가 길어 이 쪽 몫이 아님 — 위 질문 칸 머리 · 종목 줄이 줄면 셋 다 됨)
//   ⑨ 카톡 꺼짐(사장님 2026-10-18 [2] · [12] 2): NX.kakao 없음 · 있어도 on false 둘 다 — 글상자 · 친구 주소 · 매매일지 끝에 「카카오」 글 0 · 카카오 요청 0 · 카카오 도구(script) 0 · 공유 창(글 + 주소) 그대로 · 기록 파일은 요청 0
//   ⑩ 카톡 켜짐(가짜 서버 · 가짜 도구): 글상자에 카드 미리보기 · 보내기 = 카드 한 장(feed · 단추 정확히 둘 「카카오로 시작하기」 · 「그냥 보기」 · 종목 이름 · 보낸 사람 글 · 보낸 날 값 · 수익률 0) ·
//      단추 1 = 우리 주소 → /api/kakao/start?to=<보낸 쪽>(&ref=) · 단추 2 = 보낸 주소 · 보내기만으로는 가입 요청 0 · 「그냥 보기」 쪽 요청 0 · 매매일지 끝에서 권유 칸 한 번(「이 기록 지키기」 + 단추 하나) ·
//      카카오 도구가 없거나 던지면 공유 창으로 · 시황 같은 종목 아닌 보내기는 카드 아님 · 동의 화면에서 돌아옴(?kakao=ok|none) · 조용한 로그인(카톡 안 + 앞서 가입한 기기만) · 영어
//   ⑪ 카톡 단추(사장님 2026-10-18 16:39 「진화가 본질인 명령문」 [6] 2 ~ 5 · 7 · 8 · 9 · [7] 1 ~ 7 · 일꾼 KB1 · 묶음 kk · env):
//      share-btn.js 단추를 줄 고리(<a>) 안에 넣어 그림 → 44 × 44 · 노란 말풍선 · 이름표 · 눌러도 주소 그대로(쪽 이동 0) · 글상자에 이름 · 오늘 값 ·
//      빠른 말 = 바로 보냄 · 공유만 켜짐(가짜 도구 · 가입 꺼짐) → 카톡 단추 1 + 빠른 말 1 = 누름 2 에 카톡 친구 고르기(sendDefault) · 카드 단추 「열어 보기」 하나 ·
//      보낸 뒤 쪽 위치 · 주소 그대로 · 폭죽 0 · 급등(kind surge) = 반값 한 줄(파일 있음 · 없음 · 깨짐) · 친구 쪽 「나도 보내기」는 다 답한 뒤에만 하나
//      env = 네 곳 흉내(카톡 안 · 아이폰 · 안드로이드 · 컴퓨터 — 사용자 에이전트 · 화면 · 누름 · 공유 창 있음/없음) × 열쇠 있음/없음 → 간 길(kakao · share · copy)과 누름 수를 결과 envs 에 적음 ·
//      실제 폰 · 실제 카카오는 잴 수 없어 결과에 「?」(가짜 도구는 sendDefault 가 불렸는지만 앎)
//   검사 자체 시험: --mutate dup-name · no-filter · no-gain · msg-early · no-text · no-lang · card-rate · card-start-skip · vals-first · neg-margin · offer-twice · switch-on · probe-early · silent-anyone · inline-style · intro-first · name-big · kk-nav · quick-wait · again-early · half-made · pick-noval — 받은 p-share.js · p-share.css · kakao.js 를 일부러 망가뜨려 이 검사가 잡는지(잡으면 끝 코드 0)
//   --only co,fb,nd,en,ent,land,off,on(= card,offer,ret,enk),kk,env — 보고 싶은 묶음만(기본 모두 · 검사 자체 시험은 알맞은 묶음만 돎) · --w 360 = 한 폭만(고치는 동안 — 마지막엔 두 폭 모두)
//   실패가 하나라도 있으면 끝 코드 1(결과 파일은 --out 을 줄 때만)
import fs from 'node:fs/promises';
import path from 'node:path';
import {createRequire} from 'node:module';
import {fileURLToPath} from 'node:url';
import {NEW_NAME, SAFE_LINE} from './rename.mjs'; // 이름 = site/next/brand.js 한 곳(규칙 76) — 글자를 박지 않음
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');
const argv = process.argv.slice(2);
const arg = (k, d) => { const i = argv.indexOf(k); return i >= 0 && argv[i + 1] != null && !argv[i + 1].startsWith('--') ? argv[i + 1] : d; };
const require = createRequire(String(arg('--pw', process.env.PW_DIR || '/opt/node-tools/')).replace(/\/?$/, '/'));
const {chromium} = require('playwright');
const base = arg('--base', 'http://127.0.0.1:8826').replace(/\/$/, ''), NEXT = arg('--path', '/next/?dev=1'), OUT = arg('--out', null), ALL = argv.includes('--all');
const LIVE_SITE = !/^https?:\/\/(127\.0\.0\.1|localhost)(:\d+)?$/.test(base); // 실제 사이트 — 카톡 켜짐 길을 흉내 낼 수 없음(아래 on)
const ONLY = new Set(String(arg('--only', '')).split(',').map(x => x.trim()).filter(Boolean)), want = k => !ONLY.size || ONLY.has(k);
const fails = [], counts = {}, t0 = Date.now();
// 검사 자체 시험(--mutate <이름>) — 화면 모듈을 일부러 망가뜨려(받을 때만 바꿈 · 시험 서버 파일은 그대로) 이 검사가 잡는지 봄 · 기대한 실패가 다 나오면 끝 코드 0
const MUTS = {
  'dup-name': [[['.slice(String(name ?? code).length)', '']], ['글상자에 이름이 두 번(이름 + 토씨만 써야 함)'], 'p-share.js', 'co'],
  'no-filter': [[["import {sendHits} from './words.js';", 'const sendHits = () => [];']], ['거르는 말 알림', '걸렸는데 공유 창이 열림'], 'p-share.js', 'co'],
  'no-gain': [[["import {sendHits} from './words.js';", "import {hits as sendHits} from './words.js';"]], ['거르는 말 알림'], 'p-share.js', 'co'],
  'msg-early': [[['after.append(lock);', 'after.append(lock, senderMsg(S));']], ['다 답하기 전에 보낸 말이 화면에 보임'], 'p-share.js', 'land'],
  'no-text': [[['await navigator.share({title, text, url});', 'await navigator.share({title, url});']], ['공유 창에 글이 없음'], 'p-share.js', 'co'],
  'no-lang': [[["lang: /[가-힣]/.test(txt) ? 'ko' : null", 'lang: null']], ['보낸 말(쓴 사람 글)에 lang="ko" 없음', '걸린 낱말(쓴 사람 글)에 lang="ko" 없음 — 엔진이 바꿈'], 'p-share.js', 'co,land'],
  // 카톡(켜짐) — 보낸 카드에 수익 숫자 · 단추 1 이 가입 길이 아님 · 값 칸이 질문보다 위 · 음수 간격 · 권유가 여러 번  ·  [[고칠 자리, 바꿀 글]], [기대하는 실패], 파일(기본 p-share.js), 묶음
  'card-rate': [[["description: [...said, half, value].filter(Boolean).join('\\n')", "description: [...said, half, value, '+12% 올랐어'].filter(Boolean).join('\\n')"]], ['카드에 수익 숫자 · 퍼센트 · 1등 · 급등'], 'p-share.js', 'card'],
  'card-start-skip': [[['const start = K && join ? origin + K.startUrl(see, {ref: K.ref()}) : null;', 'const start = K && join ? see : null;']], ['카드 단추 1 주소(가입 길)'], 'p-share.js', 'card'],
  'vals-first': [[['nodes: [top,\n', 'nodes: [top, valsBox,\n'], ['after, valsBox, SAFE()]', 'after, SAFE()]']], ['질문이 값 칸보다 아래([5] 10 — 질문이 맨 위 · 값 칸은 질문 뒤)'], 'p-share.js', 'land'],
  'neg-margin': [[['.ps-why { margin: 0; }', '.ps-why { margin: 0 -16px; }']], ['음수 간격(겹침)([10] 8 · 음수 간격 0)'], 'p-share.css', 'land'],
  'offer-twice': [[["if (E.ls.get(FLAG_OFFERED) === '1' && !flagged()) return false;", '']], ['권유 칸이 한 번이 아님'], 'kakao.js', 'offer'],
  'inline-style': [[["h('span', {class: 'ps-kick', text: kickText})", "h('span', {class: 'ps-kick', style: 'color:red', text: kickText})"]], ['화면 오류'], 'p-share.js', 'land'],
  // 친구 쪽 첫 화면 — 질문 위에 설명 글이 다시 들어오면 · 이름 글씨가 커져 두 줄이 되면 답 셋이 아래 탭에 가려짐(독립 점검 VJ 2026-10-18)
  'intro-first': [[["h('section', {class: 'ps-step'}, slot, askLine),", "h('section', {class: 'ps-step'}, h('h2', {class: 'ps-h2', text: '먼저 네 생각부터'}), h('p', {class: 'ps-p', text: '친구 말을 보기 전에 왜 사는지 먼저 확인해 봐.'}), askLine, slot),"]], ['첫 질문의 답이 아래 탭에 가려짐([5] 10 · 질문이 맨 위)'], 'p-share.js', 'land'],
  'name-big': [[['.ps-top .ps-name { margin: 0; font-size: var(--fs-2, 19px); }', '.ps-top .ps-name { margin: 0; font-size: var(--fs-5, 30px); }']], ['첫 질문의 답이 아래 탭에 가려짐([5] 10 · 질문이 맨 위)'], 'p-share.css', 'land'],
  'switch-on': [[['export const SWITCH = false;', 'export const SWITCH = true;']], ['카카오 요청이 꺼짐 상태에서 나감([12] 2 — 요청 0 이어야 함)'], 'kakao.js', 'off'],
  'probe-early': [[['if (flagged() || back) ready().catch(() => {});', 'ready().catch(() => {});']], ['처음 온 사람인데 서버 확인이 나감([2] 10)'], 'kakao.js', 'ret'],
  'silent-anyone': [[['if (flagged() && inKakaoTalk())', 'if (inKakaoTalk())'], ['if (flagged() || back) ready().catch(() => {});', 'ready().catch(() => {});']], ['건드리면 안 되는 사람에게 로그인 길이 열림([2] 10)'], 'kakao.js', 'ret'],
  // 카톡 단추 · 빠른 말 · 친구 쪽 · 반값 한 줄(사장님 2026-10-18 16:39 [6] · 일꾼 KB1)
  'kk-nav': [[['ev.preventDefault(); ev.stopPropagation(); openBox(pack(o, kind));', 'openBox(pack(o, kind));']], ['카톡 단추가 줄 고리로 감(쪽이 바뀜 [6] 6)'], 'share-btn.js', 'kk'],
  'quick-wait': [[['ta.value = ev.currentTarget.textContent || L(q); send(); }', 'ta.value = ev.currentTarget.textContent || L(q); }']], ['빠른 말을 눌러도 바로 안 감([6] 4)'], 'p-share.js', 'kk'],
  'again-early': [[['after.append(lock);', 'after.append(lock, againBtn(S, name, null, null, false));']], ['「나도 보내기」가 다 답하기 전에 보임([6] 9)'], 'p-share.js', 'land'],
  'half-made': [[['export const halfLine = j => (j && ', 'export const halfLine = j => ((j = j ?? {n: 3, of: 36}), j && ']], ['반값 파일이 없는데 그 줄이 나감(짓지 않음 [6] 8)'], 'p-share.js', 'kk'],
  'pick-noval': [[["const c = j?.c ?? (await getJson('comp.json'))?.companies?.[code] ?? null", 'const c = j?.c ?? null']], ['고른 곳 — 글상자에 이름 · 오늘 값이 저절로 안 들어감([6] 3 · comp.json)'], 'p-share.js', 'kk'],
};
const MUT = arg('--mutate', null);
// 가입 스위치(사장님 2026-10-19 16:37 「공유 검사 고쳐도 돼」 · 카톡 가입 발행) — 켜진 판에서는 「꺼짐」 장면 대신 켜짐 장면만 보고, /api/kakao/* 요청을 꺼짐 위반으로 보지 않음(시험 서버가 가짜 카카오로 답함) · 꺼진 판은 예전과 똑같이 검사
const SIGNUP_ON = await fs.readFile(path.join(ROOT, 'config/atlas11/kakao.json'), 'utf8').then(t => JSON.parse(t).on === true).catch(() => false);
if (SIGNUP_ON && MUTS['switch-on']) delete MUTS['switch-on']; // 켜진 판에는 「켜면 잡아라」 자기 시험이 맞지 않음
if (MUT && !MUTS[MUT]) { console.error('모르는 --mutate', MUT, Object.keys(MUTS).join(' · ')); process.exit(1); }
if (MUT && MUTS[MUT][3] && !ONLY.size) for (const g of MUTS[MUT][3].split(',')) ONLY.add(g); // 알맞은 묶음만 돎
const fail = (k, x) => { counts.fail = (counts.fail || 0) + 1; if (fails.length < 500) fails.push([k, String(x).slice(0, 400)]); };
const bump = (k, n = 1) => { counts[k] = (counts[k] || 0) + n; };

/* 기준 — 사장님 원문 [4](글자 그대로 · 줄 바꿈은 띄어쓰기로) */
const ORDER = await fs.readFile(path.join(ROOT, 'docs/design/godori-2026-10-17/order-2110.txt'), 'utf8').catch(() => '');
const SEC4 = ((ORDER.split('[4 · 보내기]')[1] ?? '').split('[5 ·')[0] ?? '').replace(/\s+/g, ' ');
const HEAD = /「(친구에게 무슨 말을 할래\?)」/.exec(SEC4)?.[1];
const QUICK = (/빠른 말 셋: (.+?) 3\./.exec(SEC4)?.[1] ?? '').split(' / ').map(s => s.trim()).filter(Boolean);
const SENT_LBL = /「(보낸 날 값)」/.exec(SEC4)?.[1], NOW_LBL = /「(오늘 값)」/.exec(SEC4)?.[1];
const ASK_BTN = /「(같이 따져 줘)」/.exec(SEC4)?.[1], ASK_Q = /「(반토막 난다면 왜일까\?)」/.exec(SEC4)?.[1];
if (!HEAD || QUICK.length !== 3 || !SENT_LBL || !NOW_LBL || !ASK_BTN || !ASK_Q) { console.error('사장님 원문 [4] 를 order-2110.txt 에서 못 읽음', {HEAD, QUICK, SENT_LBL, NOW_LBL, ASK_BTN, ASK_Q}); process.exit(1); }
const BRIEF2 = await fs.readFile(path.join(ROOT, 'docs/design/godori-2026-10-17/brief2.md'), 'utf8').catch(() => '');
if (!BRIEF2.includes('#/s/<번호>/<날>/<값>')) fail('기준 글이 바뀜(brief2.md 주소 꼴 — 이 검사의 주소 셈을 고칠 것)', '#/s/<번호>/<날>/<값>');

/* ⓪ 글 거르기 — 브라우저 없이 */
const W = await import(path.join(ROOT, 'site/next/words.js'));
const L = await import(path.join(ROOT, 'lib/atlas11/letter.mjs'));
if (L.BAD !== W.BLOCK || L.OKW !== W.OKW || L.badWord !== W.badWord) fail('한 곳 아님', '편지 서버(lib/atlas11/letter.mjs)의 막는 말이 words.js 의 것이 아님');
const LJS = await fs.readFile(path.join(ROOT, 'site/letter.js'), 'utf8');
if (!/import \{[^}]*\bbadWord\b[^}]*\} from '\/next\/words\.js'/.test(LJS) || /const (BAD|OKW) = \[/.test(LJS)) fail('한 곳 아님', '편지 화면(site/letter.js)이 /next/words.js 를 부르지 않거나 제 목록을 가짐');
for (const f of ['site/letter.js', 'site/hello-send.js']) if (!/from '\/next\/p-share\.js'/.test(await fs.readFile(path.join(ROOT, f), 'utf8'))) fail('글상자 안 씀', f + ' 가 /next/p-share.js 를 부르지 않음');
const NC = await fs.readFile(path.join(ROOT, 'scripts/atlas11/next/next_check.mjs'), 'utf8');
const ncList = /const BANNED = \[([^\]]*)\]/.exec(NC)?.[1];
if (ncList) for (const w of (ncList.match(/'([^']+)'/g) || []).map(x => x.slice(1, -1))) if (!W.SCREEN.includes(w)) fail('화면 쓰지 않을 말이 words.js 에 없음', w);
for (const w of ['추천', '매수', '매도', '예측', '확률', '유망', '기회', '신호', '저평가', '1위', 'TOP', '사세요', '사라', '파세요', '팔아라']) if (!W.SCREEN.includes(w)) fail('명령문의 쓰지 않을 말이 words.js 에 없음', w);
const T = (s, want, tag) => { const got = W.badWord(s); if (JSON.stringify(got) !== JSON.stringify(want)) fail('거르기 틀림', `${tag} 「${s}」 ${JSON.stringify(got)} ≠ ${JSON.stringify(want)}`); bump('거르기 맞댐'); };
T('내일 사 세 요', ['사고팔기 말', '사세요'], '편지 시험'); T('지금 사라', ['사고팔기 말', '사라'], '편지 시험');
for (const s of ['이번 주는 뉴스를 덜 보기로 했어요', '급등 탭에서 봤어요', '거래가 사라졌어요', '사라져요', ...QUICK, ASK_Q, '같이 따져 줘', 'stop', '돈을 잘 번대']) { if (W.sendHits(s).length) fail('보통 말이 걸림', `「${s}」 ${JSON.stringify(W.sendHits(s))}`); bump('거르기 맞댐'); }
for (const s of ['오픈채팅 오세요', '연락은 010-1234', 'WWW.example', '좋은 기회야', 'TOP 10', '시총 1위', '지금 팔아라', '추천해']) { if (!W.badWord(s)) fail('걸러야 할 말이 지남', `「${s}」`); bump('거르기 맞댐'); }
const GAIN = ['+30% 벌었어', '30퍼 먹었다', '2배 올랐어', '두 배 올랐네', '수익률 좋아', '20 % 났어', '▲12 찍음', '3프로 올랐어'];
for (const s of GAIN) { if (!W.sendHits(s).length) fail('수익 숫자가 지남', `「${s}」`); bump('거르기 맞댐'); }
for (const [s, want] of [['사라져요 공매도 STOP', []], ['TOP 10 · 1위', ['1위', 'TOP']], ['사라지는 것', []], ['지금 사라', ['사라']]]) { const got = W.screenHits(s); if (JSON.stringify(got) !== JSON.stringify(want)) fail('화면 셈 틀림', `「${s}」 ${JSON.stringify(got)}`); bump('거르기 맞댐'); }

/* ⓪-2 사장님 2026-10-18 원문([2] 카톡 · [10] 낱말 · 숫자 · 자리) 맞대기 — 모양 파일 · 화면 코드 글(브라우저 없이) */
const O15 = (await fs.readFile(path.join(ROOT, 'docs/design/godori-2026-10-18/order-0015.txt'), 'utf8').catch(() => '')).replace(/\s+/g, ' ');
const SEC2 = ((O15.split('[2 · 카톡 두 번')[1] ?? '').split('[3 ·')[0] ?? '');
const CARD_B = /단추는 둘이다\. 「([^」]+)」, 「([^」]+)」/.exec(SEC2), OFFER_T = /글은 「([^」]+)」, 단추는 「([^」]+)」 하나/.exec(SEC2);
if (!CARD_B || !OFFER_T) { console.error('사장님 원문 [2] 를 order-0015.txt 에서 못 읽음', {CARD_B, OFFER_T}); process.exit(1); }
const [BTN_START, BTN_SEE] = [CARD_B[1], CARD_B[2]], [OFFER_H, OFFER_BTN] = [OFFER_T[1], OFFER_T[2]];
if (BTN_START !== OFFER_BTN) fail('원문 — 카드 단추 1 과 권유 단추가 같은 글이어야 함', `${BTN_START} ≠ ${OFFER_BTN}`);
// 사장님 2026-10-18 16:39 원문 [6] · [7](docs/design/kkolttori-2026-10-18/order-1639.txt · 일꾼 KB1) — 친구 쪽 「나도 보내기」 · 가입이 꺼졌을 때 카드 단추 「열어 보기」
const O16 = (await fs.readFile(path.join(ROOT, 'docs/design/kkolttori-2026-10-18/order-1639.txt'), 'utf8').catch(() => '')).replace(/\s+/g, ' ');
const S6 = (O16.split('[6 ·')[1] ?? '').split('[7 ·')[0] ?? '', S7 = (O16.split('[7 ·')[1] ?? '').split('[8 ·')[0] ?? '';
const AG_W = /「(나도 보내기)」/.exec(S6)?.[1], OPEN_W = /단추 「([^」]+)」\. 가입이 켜지면/.exec(S7)?.[1], OPEN_BTN = OPEN_W ?? '열어 보기';
// 급등 카드 한 줄([6] 8) — 글은 리드가 정함(docs/design/kkolttori-2026-10-18/cards.md 「KB1」 · 사장님 17:25 「현명하게 해」) · n · 36 = half36.json · 없거나 깨졌거나 못 센 곳이 있으면 줄 없음 — 이 검사가 따로 셈
const halfWant = j => (j && Number.isInteger(j.n) && Number.isInteger(j.of) && j.of > 0 && j.n >= 0 && j.n <= j.of && !(Number(j.unknown) > 0) ? `1년 전 날아오른 ${j.of}곳 중 ${j.n}곳이 그 뒤 1년 안에 반값 아래로 떨어진 적 있어요` : '');
const NOASK = /회원\s*가입|비밀번호|별명|닉네임|사진|전화|생일|광고|채널\s*추가|password|nickname|birthday|phone number|advertis|add channel/i; // 가입 길 글에 없어야 하는 말([2] 8 · 9)
const KK_RE = /\/api\/kakao|kakao\.com|kakaocdn|daumcdn|developers\.kakao/i; // 카카오 길 · 도구 주소
if (want('static')) {
  const cssRaw = await fs.readFile(path.join(ROOT, 'site/next/p-share.css'), 'utf8'), css = cssRaw.replace(/\/\*[\s\S]*?\*\//g, '');
  const FSX = {1: 17, 2: 19, 3: 21, 4: 24, 5: 30, 6: 48}, SPX = {1: 8, 2: 16, 3: 24}, used = new Set();
  for (const m of css.matchAll(/(?:^|[;{\s])font-size\s*:\s*([^;}]+)/g)) {
    const v = m[1].trim(), t = /^var\(--fs-([1-6]),\s*(\d+)px\)$/.exec(v);
    if (!t || FSX[t[1]] !== +t[2]) fail('p-share.css 글씨 크기는 var(--fs-n, 뒤 값)만([10] 6)', 'font-size: ' + v); else used.add(t[1]);
    bump('모양 파일 글씨 크기 줄');
  }
  for (const m of css.matchAll(/(?:^|[;{\s])font\s*:\s*([^;}]+)/g)) { const v = m[1].trim(); if (v !== 'inherit' && !/^var\(--fs-[1-6],\s*\d+px\)\/1\.5 /.test(v)) fail('p-share.css font 줄 — 크기가 이름표가 아님', v.slice(0, 60)); }
  if (used.size > 6) fail('p-share.css 글씨 크기 6가지 넘음([10] 6)', [...used].join(' '));
  for (const m of css.matchAll(/(?:^|[;{\s])((?:margin|padding)(?:-(?:top|right|bottom|left|inline|block)[a-z-]*)?|gap|row-gap|column-gap)\s*:\s*([^;}]+)/g)) {
    let v = m[2].trim(), ok = true;
    v = v.replace(/var\(--sp-([1-3]),\s*(\d+)px\)/g, (_, n, px) => { if (SPX[n] !== +px) ok = false; return '8px'; });
    for (const tok of v.split(/\s+/)) if (!(tok === '0' || tok === 'auto' || /^(8|16|24)px$/.test(tok))) ok = false;
    if (!ok) fail('p-share.css 간격이 0 · 8 · 16 · 24 가 아니거나 음수([10] 8)', m[1] + ': ' + m[2].trim());
    bump('모양 파일 간격 줄');
  }
  if (/@import|url\(\s*['"]?https?:/i.test(css)) fail('p-share.css 바깥 주소', '');
  const PJ = await fs.readFile(path.join(ROOT, 'site/next/p-share.js'), 'utf8');
  const pj = PJ.replace(/\/\*[\s\S]*?\*\//g, '').split('\n').map(l => l.replace(/(^|[^:'"`])\/\/.*$/, '$1')).join('\n');
  if (/createElement\(\s*['"]script['"]|h\(\s*['"]script['"]|document\.write|innerHTML|insertAdjacentHTML|\beval\(/.test(pj)) fail('p-share.js 가 바깥 스크립트를 받거나 글을 그대로 끼움([12] 2)', '');
  if (/kakao\.com|kakaocdn|daumcdn|developers\.kakao|sdk\.js/i.test(pj)) fail('p-share.js 에 카카오 도구 주소([12] 2)', '');
  if (NOASK.test(pj.replace(/'[^'\n]*(?:사진|전화)[^'\n]*'/g, m => (/lang|data-proper|주소 /.test(m) ? '' : m)).replace(/\/\*[\s\S]*?\*\//g, ''))) fail('p-share.js 에 가입 길에 없어야 할 말([2] 8 · 9)', (NOASK.exec(pj) ?? [])[0]);
  const CB = /CARD_BTN = Object\.freeze\(\['([^']+)', '([^']+)'\]\)/.exec(PJ);
  if (!CB || CB[1] !== BTN_START || CB[2] !== BTN_SEE) fail('카드 단추 이름 · 차례(원문 [2] 2)', `${CB?.slice(1, 3)} ≠ ${BTN_START} · ${BTN_SEE}`);
  const OH = /OFFER_H = '([^']+)'/.exec(PJ)?.[1];
  if (OH !== OFFER_H) fail('권유 글(원문 [2] 7)', `「${OH}」 ≠ 「${OFFER_H}」`);
  // 사장님 2026-10-18 16:39 원문([6] 9 「나도 보내기」 · [7] 5 「열어 보기」) — 화면 코드 글과 맞댐(일꾼 KB1)
  if (!AG_W || !OPEN_W) fail('사장님 원문 [6] 9 · [7] 5 를 order-1639.txt 에서 못 읽음', `${AG_W} · ${OPEN_W}`);
  else {
    if (/export const AGAIN = '([^']+)'/.exec(PJ)?.[1] !== AG_W) fail('친구 쪽 단추 글(원문 [6] 9 「나도 보내기」)', /export const AGAIN = '([^']+)'/.exec(PJ)?.[1]);
    if (/export const CARD_OPEN = '([^']+)'/.exec(PJ)?.[1] !== OPEN_W) fail('가입이 꺼졌을 때 카드 단추 글(원문 [7] 5 「열어 보기」)', /export const CARD_OPEN = '([^']+)'/.exec(PJ)?.[1]);
  }
  bump('모양 · 화면 코드 글 맞댐');
}

/* 실제 사이트와 같은 보안 규칙(CSP)으로 시험 — 쪽 문서마다 올리는 묶음의 머리말(scripts/atlas11/site_headers.mjs 한 곳)을 붙임 → 속 스타일 · 바깥 스크립트 · 바깥 연결이 있으면 콘솔 오류로 걸림 */
const SH = await import(path.join(ROOT, 'scripts/atlas11/site_headers.mjs')).catch(() => ({})); // 올라가는 머리말 = SHARE_TOP(공유 열쇠가 들어오면 카카오 도구 주소 하나 · 오늘은 HEADER_TOP 과 같음)
const CSP = /Content-Security-Policy:\s*([^\n]+)/.exec(SH.SHARE_TOP ?? SH.HEADER_TOP ?? '')?.[1]?.trim() ?? null;
if (!CSP) fail('보안 머리말(CSP)을 site_headers.mjs 에서 못 읽음', 'HEADER_TOP');

/* 주소 · 말 조각 — 이 검사가 따로 만들고 풂(UTF-8 base64url) */
const b64 = s => Buffer.from(s, 'utf8').toString('base64url'), unb64 = s => Buffer.from(s, 'base64url').toString('utf8');
const URL_RE = new RegExp('^' + (base + NEXT).replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '#/s/([0-9A-Z]{6})/(\\d{4}-\\d{2}-\\d{2})/([1-9]\\d*)/([sa])(?:/([A-Za-z0-9_-]+))?$');
const num = n => Number(n).toLocaleString('ko-KR');
const md = d => `${+d.slice(5, 7)}월 ${+d.slice(8, 10)}일`;
const noGainPayload = (d, tag) => { const t = (d?.title ?? '') + '\n' + (d?.text ?? ''); if (/\d\s*(%|％|퍼센트|프로)/.test(t) || W.gainHits(t).length) fail('보낸 글에 수익 숫자', `${tag} 「${t.slice(0, 80)}」`); bump('보낸 글 수익 숫자 0'); };

/* 자료 — 회사 하나(고도리 칸 첫 곳 · 없으면 삼성전자) · 그 회사 값 · 날짜 */
const getJ = async f => { const r = await fetch(base + f, {cache: 'no-store'}); if (!r.ok) throw Error(f + ' ' + r.status); return r.json(); };
const G = await getJ('/next/data/gdr.json').catch(() => null);
const CODE = [G?.picks?.[0]?.code, '005930'].find(c => /^[0-9A-Z]{6}$/.test(c ?? ''));
const CO = await getJ('/atlas/data/co/' + CODE + '.json').catch(e => { fail('자료', e.message); return null; });
const DAYS = await getJ('/atlas/data/days.json').catch(e => { fail('자료', e.message); return null; });
if (!CO?.c?.price || !Array.isArray(CO?.close) || !Array.isArray(DAYS?.dates)) { console.error('자료를 못 받음', CODE); process.exit(1); }
const K0 = Number.isInteger(CO.k0) ? CO.k0 : 0, closeAt = d => { const i = DAYS.dates.indexOf(d) - K0; return i >= 0 && i < CO.close.length ? CO.close[i] : null; };
const SENT_DAY = DAYS.dates[DAYS.dates.length - 6], SENT_PRICE = Math.round(closeAt(SENT_DAY));
if (!(SENT_PRICE > 0)) { console.error('보낸 날 값을 자료에서 못 셈', SENT_DAY); process.exit(1); }

/* 브라우저 — 한 번에 하나 · 길마다 새 칸 */
const exe = '/opt/pw-browsers/chromium', browser = await chromium.launch((await fs.stat(exe).catch(() => null)) ? {executablePath: exe} : {});
/** mode: 'share'(가짜 공유 창) · 'copy'(공유 창 없음 · 복사 됨) · 'show'(둘 다 막힘) · letter = 편지 서버 가짜(회원 · 봉인 · 초대장 · 사장님) */
/** kakao: 'none'(그대로 — 앱이 NX.kakao 를 붙였으면 있고 아니면 없음) · 'off'(카카오 코드를 불러 둠 · 스위치는 저장소 그대로 = 꺼짐) · 'on'(가입 · 공유 둘 다 켬 — 가짜 서버 + 가짜 카카오 도구 · 시험 표시를 심음) ·
 *  'share'(공유 스위치만 켬 — 가짜 카카오 도구 · 가입 서버 없음 = 카카오 길 요청이 하나라도 나가면 걸림 · 사장님 2026-10-18 16:39 [7] 1 스위치 둘)
 *  kk = {member, ref, sdk(기본 있음), throws, flag(앞서 가입한 기기), meStatus} · ua = 사용자 에이전트 · en = 영어 사전을 원본(en-src.json)에서 바로(통합 전에도 새 틀이 보임) · touch · mobile = 손가락 · 휴대폰 화면 흉내(네 곳 시험) */
async function newPage(width, height, {mode = 'share', letter = false, noDialog = false, kakao = 'none', kk = {}, ua = null, en = false, touch = true, mobile = false} = {}) {
  const ctx = await browser.newContext({viewport: {width, height}, deviceScaleFactor: 1, hasTouch: touch, isMobile: mobile, locale: 'ko-KR', timezoneId: 'Asia/Seoul', ...(ua ? {userAgent: ua} : {})});
  if (CSP) await ctx.route('**/*', async r => { // 가장 먼저 걸어 둠(맨 나중에 불림) — 쪽 문서에만 머리말을 붙임
    if (r.request().resourceType() !== 'document') return r.fallback();
    try { const res = await r.fetch(); await r.fulfill({response: res, headers: {...res.headers(), 'content-security-policy': CSP}}); } catch { await r.fallback(); }
  });
  if (en) {
    const SRC = JSON.parse(await fs.readFile(path.join(ROOT, 'scripts/atlas11/next/i18n/en-src.json'), 'utf8'));
    await ctx.route('**/next/i18n/en.json', r => r.fulfill({status: 200, contentType: 'application/json', body: JSON.stringify({schema: 'atlas-new-i18n-1', lang: 'en', note: 'check_share', entities: SRC.entities, templates: SRC.templates})}));
  }
  if (kakao === 'on' || kakao === 'share') {
    await ctx.addInitScript(o => {
      if (o.signup) globalThis.__GODORI_KAKAO_TEST__ = true; // 가입 스위치(시험 서버에서만 읽힘)
      globalThis.__KAKAO_SHARE_TEST__ = true; window.__kcards = []; // 공유 스위치(시험 서버에서만 읽힘 · 가입과 따로)
      if (o.sdk) globalThis.Kakao = {isInitialized: () => true, init() {}, Share: {sendDefault(c) { if (o.throws) throw new Error('막힘'); window.__kcards.push(JSON.parse(JSON.stringify(c))); }}};
      if (o.flag) { try { localStorage.setItem('atlas:kakao:member', '1'); } catch {} }
    }, {sdk: kk.sdk !== false, throws: !!kk.throws, flag: !!kk.flag, signup: kakao === 'on'});
  }
  if (kakao === 'on') {
    await ctx.route('**/api/kakao/**', async r => {
      const u = new URL(r.request().url()), m = r.request().method(), j = o => r.fulfill({status: 200, contentType: 'application/json', body: JSON.stringify(o)});
      if (u.pathname === '/api/kakao/me') return kk.meStatus && kk.meStatus !== 200 ? r.fulfill({status: kk.meStatus, body: ''}) : j(kk.member ? {on: true, member: true, ref: kk.ref ?? 'ABCDEFGHIJKL', friends: 1, next: 3, code: null} : {on: true, member: false});
      if (u.pathname === '/api/kakao/data') return m === 'PUT' ? j({ok: true, data: JSON.parse(r.request().postData() || '{}').data ?? {}}) : j({data: {}});
      if (u.pathname === '/api/kakao/withdraw') return j({ok: true});
      if (u.pathname === '/api/kakao/start') return r.fulfill({status: 200, contentType: 'text/html', body: '<!doctype html><meta charset="utf-8"><title>가짜 카카오 동의 화면</title><p>가짜 카카오 동의 화면</p>'});
      return r.fulfill({status: 404, body: ''});
    });
  }
  if (noDialog) await ctx.addInitScript(() => { delete HTMLDialogElement.prototype.showModal; }); // 대화창(dialog)을 못 쓰는 옛 기계
  await ctx.addInitScript(m => {
    window.__shared = []; window.__copied = [];
    Object.defineProperty(Navigator.prototype, 'share', {configurable: true, value: m === 'share' ? async function (d) { window.__shared.push({title: d?.title ?? null, text: d?.text ?? null, url: d?.url ?? null}); } : undefined});
    Object.defineProperty(Navigator.prototype, 'clipboard', {configurable: true, get() { return {writeText: m === 'show' ? () => Promise.reject(new DOMException('막힘', 'NotAllowedError')) : async t => { window.__copied.push(String(t)); }}; }});
  }, mode);
  if (letter) {
    const now = Date.now(), opens = new Date(now + 3 * 864e5).toISOString();
    const me = {nick: '시험이', weeks: ['2026-10-16'], invites: [{code: 'AbCdEfGhIjKlMn01', used: false}, {code: 'AbCdEfGhIjKlMn02', used: true}, {code: 'AbCdEfGhIjKlMn03', used: false}]};
    await ctx.route('**/api/letter**', r => {
      const u = new URL(r.request().url()), post = r.request().method() === 'POST';
      if (post) return r.fulfill({status: 201, contentType: 'application/json', body: JSON.stringify({codes: ['NewCode000000001', 'NewCode000000002']})});
      const body = u.searchParams.get('week') ? {letters: [], me} : {now: new Date(now).toISOString(), opensAt: opens, count: 3, subjects: [], member: true, owner: letter !== 'plain', prev: '2026-10-16', me,
        mine: {what: {kind: 'idx', code: 'KOSPI', name: '코스피'}, at: new Date(now - 864e5).toISOString(), text: '이번 주는 뉴스를 덜 보기로 했어요'}};
      return r.fulfill({status: 200, contentType: 'application/json', body: JSON.stringify(body)});
    });
  }
  if (MUT) await ctx.route('**/next/' + (MUTS[MUT][2] ?? 'p-share.js'), async r => {
    const res = await r.fetch(); let body = await res.text();
    for (const [x, y] of MUTS[MUT][0]) { if (!body.includes(x)) { console.error('망가뜨릴 자리를 못 찾음(검사 자체 시험을 고칠 것)', x); process.exit(1); } body = body.replace(x, y); }
    await r.fulfill({response: res, body});
  });
  const p = await ctx.newPage(); p._errs = []; p._kk = []; p._kkOk = kakao === 'on' || SIGNUP_ON; p._reqs = 0;
  p._ownerMe = letter === true; // 편지 쪽 사장님 열쇠 기기 — letter.js 가 카카오가 켜졌나 /api/kakao/me 를 한 번 물음(꺼짐이면 404 한 줄) · 다른 사람 기기(letter: 'plain')는 0
  p._kkExt = [];
  p.on('request', r => { const url = r.url(); if (/^https?:/.test(url)) p._reqs++; if (KK_RE.test(url)) { const u = new URL(url); if (u.origin !== base) p._kkExt.push(url); else p._kk.push(r.method() + ' ' + u.pathname + u.search); } });
  p.on('pageerror', e => p._errs.push('pageerror ' + e.message));
  p.on('console', m => { if (m.type() === 'error') p._errs.push(m.text() + (m.location()?.url ? ' @ ' + m.location().url : '')); });
  p.on('response', r => { if (r.status() >= 400 && r.url().startsWith(base)) p._errs.push(r.status() + ' ' + r.url()); });
  return p;
}
const errsOf = (p, tag) => {
  if (p._ownerMe) { p._errs = p._errs.filter(e => !/\/api\/kakao\/me\b/.test(e)); p._kk = p._kk.filter(x => x !== 'GET /api/kakao/me'); } // 사장님 기기만의 한 줄(위) — 이것만 봐줌
  if (p._errs.length) { fail('화면 오류', tag + ' · ' + p._errs.slice(0, 3).join(' | ')); p._errs.length = 0; }
  if (p._kkExt.length) { fail('카카오 쪽 바깥 주소로 요청이 나감([12] 2 — 카카오 도구 · 주소는 열쇠가 들어온 뒤에만)', tag + ' · ' + p._kkExt.slice(0, 3).join(' | ')); p._kkExt.length = 0; }
  if (!p._kkOk && p._kk.length) { fail('카카오 요청이 꺼짐 상태에서 나감([12] 2 — 요청 0 이어야 함)', tag + ' · ' + p._kk.slice(0, 3).join(' | ')); p._kk.length = 0; }
  bump('화면 오류 · 카카오 요청 맞댐');
};
const done = async p => { try { await p.context().close(); } catch {} };

/** 모양 — 옆 넘침 · 칸 밖 · 누르는 자리 · 글 크기 · 캔버스 · 쓰지 않을 말(남의 글 data-proper 밖 · 이름표 글 포함) */
const LAYOUT = arg => {
  const sel = typeof arg === 'string' ? arg : arg.sel, skip = typeof arg === 'string' ? null : arg.skip; // skip = 다른 일꾼 칸(질문 칸 .wy)은 글씨 · 간격 이름표 셈에서 뺌
  const vw = document.documentElement.clientWidth, root = document.querySelector(sel);
  const out = {sw: document.documentElement.scrollWidth, vw, wide: [], small: [], tiny: [], canvas: 0, text: '', attrs: [], missing: !root, fs: {}, fsAll: {}, neg: [], sp: []};
  if (!root) return out;
  const desc = e => e.tagName.toLowerCase() + (typeof e.className === 'string' && e.className.trim() ? '.' + e.className.trim().split(/\s+/).join('.') : '') + ' 「' + (e.textContent || '').trim().slice(0, 24) + '」';
  for (const e of [root, ...root.querySelectorAll('*')]) {
    if (e.ownerSVGElement || e.closest('[hidden]')) continue;
    const r = e.getBoundingClientRect(); if (r.width < 2 && r.height < 2) continue;
    if (r.right > vw + 1 || r.left < -1) out.wide.push(desc(e) + ' ' + Math.round(r.left) + '~' + Math.round(r.right));
    const cs = getComputedStyle(e), hasText = cs.visibility !== 'hidden' && [...e.childNodes].some(n => n.nodeType === 3 && n.textContent.trim());
    if (hasText && parseFloat(cs.fontSize) < 16.95) out.tiny.push(desc(e) + ' ' + cs.fontSize);
    if (hasText) { const f = String(Math.round(parseFloat(cs.fontSize) * 10) / 10); out.fsAll[f] = (out.fsAll[f] || 0) + 1; if (!(skip && e.closest(skip))) out.fs[f] = (out.fs[f] || 0) + 1; }
    if (skip && e.closest(skip)) continue;
    for (const k of ['marginTop', 'marginRight', 'marginBottom', 'marginLeft']) if (parseFloat(cs[k]) < -0.5) out.neg.push(desc(e) + ' ' + k + ' ' + cs[k]);
    const cn = typeof e.className === 'string' ? e.className : '';
    if (/(^|\s)ps-/.test(cn) && !e.classList.contains('ps-toast')) {
      for (const k of ['marginTop', 'marginRight', 'marginBottom', 'marginLeft', 'paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft', 'rowGap', 'columnGap']) {
        if (k.startsWith('margin') && e.classList.contains('ps-dlg')) continue; // 가운데 놓기(auto)
        const v = cs[k]; if (v === 'normal' || v === 'auto') continue;
        const n = parseFloat(v); if (![0, 8, 16, 24].some(x => Math.abs(x - n) < 0.6)) out.sp.push(desc(e) + ' ' + k + ' ' + v);
      }
    }
  }
  for (const e of root.querySelectorAll('a[href], button, input, select, textarea, summary, [role="button"]')) { if (e.closest('[hidden]')) continue; const r = e.getBoundingClientRect(); if (!r.width || !r.height) continue; if (r.height < 43.5 || r.width < 43.5) out.small.push(desc(e) + ' ' + Math.round(r.width) + '×' + Math.round(r.height)); }
  out.canvas = root.querySelectorAll('canvas').length;
  const c = root.cloneNode(true); c.querySelectorAll('[data-proper]').forEach(x => x.remove()); out.text = c.textContent;
  for (const e of [c, ...c.querySelectorAll('*')]) for (const a of ['aria-label', 'title', 'alt', 'placeholder']) { const v = e.getAttribute?.(a); if (v) out.attrs.push(v); }
  return out;
};
const FS_TOKENS = [17, 19, 21, 24, 30, 48]; // app.css --fs-1 ~ 6(글씨 크기 보통 칸)
const FS_SEEN = new Map(); // 쪽 전체 글씨 크기 가짓수(질문 칸 포함 · 알림용)
async function layout(p, sel, tag, skip = null) {
  const s = await p.evaluate(LAYOUT, {sel, skip}); bump('모양 잰 화면');
  if (s.missing) { fail('칸 없음', tag + ' ' + sel); return; }
  if (s.sw > s.vw) fail('옆으로 넘침', `${tag}: ${s.sw} > ${s.vw}`);
  for (const x of s.wide.slice(0, 3)) fail('칸 밖으로 나감', `${tag}: ${x}`);
  for (const x of s.small.slice(0, 3)) fail('누르는 자리 44px 밑', `${tag}: ${x}`);
  for (const x of s.tiny.slice(0, 3)) fail('글 17px 밑', `${tag}: ${x}`);
  if (s.canvas) fail('캔버스(입체 없음 규칙 50)', tag);
  for (const w of W.screenHits(s.text + '\n' + s.attrs.join('\n'))) fail('쓰지 않을 말', `${tag} 「${w}」`);
  const sizes = Object.keys(s.fs).map(Number).sort((a, b) => a - b);
  for (const f of sizes) if (!FS_TOKENS.some(t => Math.abs(t - f) < 0.2)) fail('글씨 크기가 이름표(--fs-1 ~ 6)에 없음([10] 6)', `${tag}: ${f}px`);
  if (sizes.length > 6) fail('한 칸 글씨 크기 6가지 넘음([10] 6)', `${tag}: ${sizes.join(' · ')}`);
  for (const x of s.neg.slice(0, 3)) fail('음수 간격(겹침)([10] 8 · 음수 간격 0)', `${tag}: ${x}`);
  for (const x of s.sp.slice(0, 3)) fail('간격이 0 · 8 · 16 · 24 가 아님([10] 8)', `${tag}: ${x}`);
  const all = Object.keys(s.fsAll).length; FS_SEEN.set(sel, Math.max(FS_SEEN.get(sel) ?? 0, all));
}

/* 글상자 */
const DLG = '.ps-dlg';
const READD = () => {
  const d = document.querySelector('.ps-dlg'); if (!d) return null;
  const go = d.querySelector('.ps-go');
  return {open: d.tagName === 'DIALOG' ? d.open : true, h: d.querySelector('.ps-h')?.textContent ?? null, desc: d.querySelector('.ps-d')?.textContent ?? '', labelled: d.getAttribute('aria-labelledby'),
    quick: [...d.querySelectorAll('.ps-q button')].map(b => b.textContent), ta: d.querySelector('textarea.ps-t:not(.ps-show)')?.value ?? null, say: d.querySelector('.ps-m')?.textContent ?? '',
    sayNo: !!d.querySelector('.ps-m.no'), dis: go?.getAttribute('aria-disabled') ?? null, show: (() => { const s = d.querySelector('.ps-show'); return s && !s.hidden ? s.value : null; })(),
    inFocus: !!document.activeElement?.closest('.ps-dlg'), radius: getComputedStyle(d).borderTopLeftRadius, all: (() => { const c = d.cloneNode(true); c.querySelectorAll('.ps-url, textarea').forEach(x => x.remove()); return c.textContent; })(), name: d.querySelector('.ps-d b')?.textContent ?? null};
};
async function openBox(p, click, tag) {
  await click();
  try { await p.waitForSelector(DLG, {state: 'visible', timeout: 10000}); } catch { fail('글상자가 안 열림', tag); return null; }
  const s = await p.evaluate(READD); bump('연 글상자');
  if (!s?.open) fail('글상자가 안 열림', tag);
  if (s.h !== HEAD) fail('글상자 이름(원문)', `${tag} 「${s.h}」 ≠ 「${HEAD}」`);
  if (JSON.stringify(s.quick) !== JSON.stringify(QUICK)) fail('빠른 말 셋(원문 차례)', `${tag} ${JSON.stringify(s.quick)}`);
  if (!s.inFocus) fail('연 뒤 초점이 글상자 밖', tag);
  if (s.radius !== '18px') fail('글상자 모양 파일(p-share.css)이 안 붙음', `${tag} ${s.radius}`);
  if (/undefined|null|NaN|\?원|값 원|·\s*·/.test(s.all)) fail('글상자에 빈 칸 · 깨진 값', `${tag} 「${s.all.slice(0, 120)}」`);
  if (s.name && s.desc.split(s.name).length - 1 !== 1) fail('글상자에 이름이 두 번(이름 + 토씨만 써야 함)', `${tag} 「${s.desc}」`);
  return s;
}
/** 빠른 말 = 누르는 즉시 보냄(사장님 2026-10-18 16:39 [6] 4 — 「보내기」를 또 누르지 않음) → 가짜 공유 창 / 복사 / 보여 줌 / 카톡 카드 중 하나가 4초 안에 · 단추에 보이는 글을 돌려줌
    tap = 손가락으로 누름(네 곳 시험 · 손가락 칸만) — 걸리면 「빠른 말을 눌러도 바로 안 감」 */
const SENT_N = () => ({s: window.__shared.length, c: window.__copied.length, k: (window.__kcards ?? []).length});
const SENT_ANY = b => window.__shared.length > b.s || window.__copied.length > b.c || (window.__kcards ?? []).length > b.k || !!document.querySelector('.ps-dlg .ps-show:not([hidden])');
async function sendQuick(p, k, tag, {tap = false} = {}) {
  const b = p.locator(DLG + ' .ps-q button').nth(k), shown = await b.textContent();
  if (!EN_PAGE.has(p) && shown !== QUICK[k]) fail('빠른 말 원문 · 차례', `${tag} 「${shown}」 ≠ 「${QUICK[k]}」`);
  const before = await p.evaluate(SENT_N);
  if (tap) await b.tap(); else await b.click();
  try { await p.waitForFunction(SENT_ANY, before, {timeout: 4000}); } catch { fail('빠른 말을 눌러도 바로 안 감([6] 4)', tag); return shown; }
  const ta = await p.evaluate(() => { const t = document.querySelector('.ps-dlg textarea.ps-t:not(.ps-show)'); return t ? t.value : null; }); // 글상자가 닫혔으면(보냄) null
  if (ta != null && ta !== shown) fail('빠른 말 — 글상자 = 단추에 보이는 글(영어면 바뀐 글)', `${tag} 「${ta}」 ≠ 「${shown}」`);
  return shown;
}
/** 회사 주식 보낸 글 — 첫 줄 = 「이름 · 그날 값」(저절로 · [6] 3) · 둘째 줄 = 말 · 그 뒤 = 같이 가는 글 · 반값 한 줄 / 회사 주식이 아니면 첫 줄이 말 */
const HEADLINE = () => `${CO.c.name} · ${md(CO.c.priceDate)} 값 ${num(CO.c.price)}원`;
const lines = d => String((typeof d === 'string' ? d : d?.text) ?? '').split('\n');
const EN_PAGE = new WeakSet(); // 영어(?lang=en)로 연 쪽 — 빠른 말 · 기본 말은 보이는 글(바뀐 글)과 맞댐
const shared = p => p.evaluate(() => window.__shared), copied = p => p.evaluate(() => window.__copied);
async function waitShared(p, n, tag) { try { await p.waitForFunction(k => window.__shared.length >= k, n, {timeout: 8000}); return (await shared(p))[n - 1]; } catch { fail('공유 창이 안 열림', tag); return null; } }

/** ① ② ③ ④ — 회사 화면 「보내기」: 차례 · Esc · 거르기 · 수익 숫자 · 보내기 */
async function companyBox(W_, H_, deep) {
  const tag = `${W_}×${H_} 회사 #/w/${CODE}`, p = await newPage(W_, H_);
  try {
    await p.goto(base + NEXT + '#/w/' + CODE, {waitUntil: 'domcontentloaded'});
    const shareB = p.locator('#view .acts button', {hasText: /^보내기$/}), askB = p.locator('#view .acts button', {hasText: new RegExp('^' + ASK_BTN + '$')});
    await shareB.first().waitFor({timeout: 30000});
    if (!(await askB.count())) fail('「같이 따져 줘」 단추 없음', tag);
    let s = await openBox(p, () => shareB.first().click(), tag + ' 보내기'); if (!s) return;
    if (!s.desc.includes(num(CO.c.price) + '원')) fail('글상자에 그날 값이 없음', `${tag} 「${s.desc}」`);
    await layout(p, DLG, tag + ' 글상자');
    // 갇힌 차례
    for (let i = 0; i < 14; i++) { await p.keyboard.press('Tab'); if (!(await p.evaluate(() => !!document.activeElement?.closest('.ps-dlg')))) { fail('Tab 이 글상자 밖으로', `${tag} ${i + 1}번째`); break; } }
    for (let i = 0; i < 4; i++) { await p.keyboard.press('Shift+Tab'); if (!(await p.evaluate(() => !!document.activeElement?.closest('.ps-dlg')))) { fail('Shift+Tab 이 글상자 밖으로', `${tag} ${i + 1}번째`); break; } }
    bump('갇힌 차례');
    await p.keyboard.press('Escape');
    try { await p.waitForSelector(DLG, {state: 'detached', timeout: 4000}); } catch { fail('Esc 로 안 닫힘', tag); }
    if ((await p.evaluate(() => document.activeElement?.textContent)) !== '보내기') fail('닫은 뒤 초점이 연 단추로 안 돌아옴', tag);
    // 거르는 말 · 수익 숫자
    s = await openBox(p, () => shareB.first().click(), tag + ' 다시'); if (!s) return;
    const ta = p.locator(DLG + ' textarea.ps-t').first();
    for (const [txt, word] of [['지금 사세요', '사세요'], ['+30% 벌었어', '30%'], ['30퍼 먹었다', '30퍼'], ['2배 올랐어', '2배 올'], ['카톡 주세요', '카톡']].slice(0, deep ? 5 : 3)) {
      await ta.fill(txt); s = await p.evaluate(READD);
      if (!s.sayNo || !s.say.includes(word)) fail('거르는 말 알림', `${tag} 「${txt}」 → 「${s.say}」`);
      if (s.dis !== 'true') fail('걸렸는데 보내기가 안 막힘', `${tag} 「${txt}」`);
      if (txt === '지금 사세요') {
        await layout(p, DLG, tag + ' 걸린 말 알림'); // 알림 속 걸린 낱말은 쓴 사람 글(data-proper) — 화면 쓰지 않을 말 셈 밖이어야 함
        const lg = await p.evaluate(() => document.querySelector('.ps-dlg .ps-m [data-proper]')?.getAttribute('lang') ?? null);
        if (lg !== 'ko') fail('걸린 낱말(쓴 사람 글)에 lang="ko" 없음 — 엔진이 바꿈', `${tag} ${lg}`);
      }
      await p.locator(DLG + ' .ps-go').click({force: true}); await p.waitForTimeout(250); // aria-disabled 단추도 누름 — 막는 것은 화면 셈이어야 함
      if ((await shared(p)).length) fail('걸렸는데 공유 창이 열림', `${tag} 「${txt}」`);
      const sel = await p.evaluate(() => { const t = document.querySelector('.ps-dlg textarea.ps-t'); return t ? t.value.slice(t.selectionStart, t.selectionEnd) : ''; });
      if (!sel) fail('걸린 낱말을 짚지 않음', `${tag} 「${txt}」`);
      bump('막은 말');
    }
    await ta.fill('나는 이렇게 봤어'); s = await p.evaluate(READD);
    if (s.sayNo || s.dis !== 'false') fail('고친 뒤에도 막힘', `${tag} 「${s.say}」 ${s.dis}`);
    // 보내기 — 빠른 말
    await sendQuick(p, 2, tag);
    const d = await waitShared(p, 1, tag);
    if (d) {
      const m = URL_RE.exec(d.url ?? '');
      if (!m) fail('보낸 주소 꼴', `${tag} 「${d.url}」`);
      else {
        if (m[1] !== CODE || m[2] !== CO.c.priceDate || +m[3] !== Math.round(CO.c.price) || m[4] !== 's') fail('주소의 종목 · 날 · 값 · 갈래', `${tag} ${m.slice(1, 5).join(' ')}`);
        if (!m[5] || unb64(m[5]) !== QUICK[2]) fail('주소의 말 조각', `${tag} 「${m[5] ? unb64(m[5]) : ''}」`);
        if (m[5] && m[5].length > 200) fail('말 조각이 200자 넘음', tag);
      }
      const ln = lines(d);
      if (ln[0] !== HEADLINE()) fail('보낸 글 첫 줄 = 종목 이름 · 그날 값(저절로 · [6] 3)', `${tag} 「${ln[0]}」 ≠ 「${HEADLINE()}」`);
      if (ln[1] !== QUICK[2]) fail('공유 창에 글이 없음', `${tag} 「${d.text}」`);
      noGainPayload(d, tag);
      bump('보낸 것');
    }
    try { await p.waitForSelector(DLG, {state: 'detached', timeout: 4000}); } catch { fail('보낸 뒤 글상자가 안 닫힘', tag); }
    // 같이 따져 줘 — 빈 글상자로 보내면 기본 말
    s = await openBox(p, () => askB.first().click(), tag + ' 같이 따져 줘'); if (!s) return;
    if (!s.desc.includes(ASK_Q)) fail('같이 따져 줘 글상자에 「반토막 난다면 왜일까?」 없음', `${tag} 「${s.desc}」`);
    if (!s.desc.startsWith(CO.c.name + '를 ') && !s.desc.startsWith(CO.c.name + '을 ')) fail('같이 따져 줘 — 이름 한 번 + 토씨', `${tag} 「${s.desc.slice(0, 40)}」`);
    await p.locator(DLG + ' .ps-go').click();
    const a = await waitShared(p, 2, tag + ' 같이 따져 줘');
    if (a) {
      const m = URL_RE.exec(a.url ?? '');
      if (!m || m[4] !== 'a') fail('같이 따져 줘 주소 갈래(a)', `${tag} 「${a.url}」`);
      else if (!m[5] || !unb64(m[5]).includes(ASK_Q)) fail('같이 따져 줘 말 조각', `${tag} 「${m[5] ? unb64(m[5]) : ''}」`);
      if (!String(a.text ?? '').includes(ASK_Q)) fail('같이 따져 줘 글', `${tag} 「${a.text}」`);
      noGainPayload(a, tag + ' 같이 따져 줘');
      bump('보낸 것');
    }
    errsOf(p, tag);
  } finally { await done(p); }
}
/** ⑤ 공유 창 없음 → 복사 · 복사도 막힘 → 보여 줌 */
async function fallbacks(W_, H_) {
  for (const mode of ['copy', 'show']) {
    const tag = `${W_}×${H_} ${mode === 'copy' ? '공유 창 없음 → 복사' : '복사도 막힘 → 보여 줌'}`, p = await newPage(W_, H_, {mode});
    try {
      await p.goto(base + NEXT + '#/w/' + CODE, {waitUntil: 'domcontentloaded'});
      const b = p.locator('#view .acts button', {hasText: /^보내기$/}); await b.first().waitFor({timeout: 30000});
      if (!(await openBox(p, () => b.first().click(), tag))) continue;
      await sendQuick(p, 0, tag);
      if (mode === 'copy') {
        try { await p.waitForFunction(() => window.__copied.length > 0, null, {timeout: 6000}); } catch { fail('복사 안 됨', tag); }
        const c = (await copied(p))[0] ?? '', cl = lines(c);
        if (cl[0] !== HEADLINE() || cl[1] !== QUICK[0] || !URL_RE.test(cl.at(-1))) fail('복사한 글 = 이름 · 그날 값 + 글 + 주소', `${tag} 「${c.slice(0, 120)}」`);
        const s = await p.evaluate(READD); if (!/함께 담았어요/.test(s?.say ?? '')) fail('복사했다는 알림', `${tag} 「${s?.say}」`);
      } else {
        try { await p.waitForFunction(() => { const s = document.querySelector('.ps-dlg .ps-show'); return s && !s.hidden; }, null, {timeout: 6000}); } catch { fail('글을 보여 주지 않음', tag); }
        const s = await p.evaluate(READD); if (!s?.show || lines(s.show)[0] !== HEADLINE() || lines(s.show)[1] !== QUICK[0] || !URL_RE.test(s.show.split('\n').pop())) fail('보여 준 글 = 이름 · 그날 값 + 글 + 주소', `${tag} 「${s?.show}」`);
        await layout(p, DLG, tag);
      }
      bump('보낸 것');
      errsOf(p, tag);
    } finally { await done(p); }
  }
}
/** 영어로 본 사람 — 빠른 말 · 기본 말이 보이는 글(바뀐 글)로 감(한국어 글자를 박아 보내지 않음) · 소개 쪽(앱 없음)과 회사 화면(앱) */
async function englishBox(W_, H_) {
  for (const [where, url, click, stock] of [['소개 쪽', '/hello.html?lang=en', p => p.locator('#hp-send').click(), false], ['회사 화면', NEXT + '&lang=en#/w/' + CODE, p => p.locator('#view .acts button').nth(1).click(), true]]) {
    const tag = `${W_}×${H_} 영어 ${where}`, p = await newPage(W_, H_); EN_PAGE.add(p);
    try {
      await p.goto(base + url, {waitUntil: 'domcontentloaded'});
      await p.waitForFunction(() => document.documentElement.lang === 'en' && (!!document.querySelector('#hp-send') || document.querySelectorAll('#view .acts button').length >= 2), null, {timeout: 30000});
      await p.waitForTimeout(300); // 엔진이 그려진 글을 바꾸는 사이
      await click(p);
      try { await p.waitForSelector(DLG, {state: 'visible', timeout: 10000}); } catch { fail('글상자가 안 열림', tag); continue; }
      await p.waitForTimeout(200);
      const first = await sendQuick(p, 0, tag);
      const d = await waitShared(p, 1, tag);
      if (d && lines(d)[stock ? 1 : 0] !== first) fail('보낸 말 줄 = 단추에 보이는 글', `${tag} 「${d.text}」 ≠ 「${first}」`);
      if (d && stock && /[가-힣]/.test(lines(d)[0].replace(/^[^·]*·/, ''))) fail('영어로 본 사람 — 보낸 글 첫 줄(그날 값)에 한글', `${tag} 「${lines(d)[0]}」`); // 이름(회사 고유 이름)은 한글일 수 있음 · 값 줄은 지금 말로
      // 빈 글상자로 보내면 기본 말 = 첫 빠른 말(보이는 글)
      await click(p); await p.waitForSelector(DLG, {state: 'visible', timeout: 10000}); await p.waitForTimeout(200);
      const shown0 = await p.locator(DLG + ' .ps-q button').first().textContent();
      await p.locator(DLG + ' .ps-go').click();
      const e = await waitShared(p, 2, tag + ' 기본 말');
      if (e && lines(e)[stock ? 1 : 0] !== shown0) fail('기본 말 = 지금 말의 첫 빠른 말', `${tag} 「${e.text}」 ≠ 「${shown0}」`);
      bump('보낸 것', 2);
      errsOf(p, tag);
    } finally { await done(p); }
  }
}
/** 영어 소개 쪽 · 사전이 늦게 옴 — 사전(en.json)을 3초 늦추고 lang 이 en 이 되자마자 「친구에게 보내기」를 누름 → 사전이 온 뒤 글상자가 열려야 함(누름이 사라지면 안 됨)
 *  2026-10-20 실제 사이트 큰 시험 「글상자가 안 열림 — 390×844 영어 소개 쪽」: hello-send.js 가 단추를 사전을 다 받은 뒤에 붙여서, 느린 망에서 그 전에 누르면 아무 일이 없던 것(옛 hello-send.js 로 되돌리면 이 길이 걸림) */
async function slowDictBox(W_, H_) {
  const tag = `${W_}×${H_} 영어 소개 쪽 · 사전 늦음`, p = await newPage(W_, H_); EN_PAGE.add(p);
  try {
    await p.route('**/next/i18n/en.json', async r => { await new Promise(res => setTimeout(res, 3000)); await r.continue().catch(() => null); });
    await p.goto(base + '/hello.html?lang=en', {waitUntil: 'domcontentloaded'});
    await p.waitForFunction(() => document.documentElement.lang === 'en' && !!document.querySelector('#hp-send'), null, {timeout: 30000});
    if (await p.evaluate(() => !!window.__helloShare)) fail('느린 사전 판을 꾸미지 못함(누르기 전에 사전이 벌써 옴)', tag);
    await p.locator('#hp-send').click();
    try { await p.waitForSelector(DLG, {state: 'visible', timeout: 20000}); } catch { fail('글상자가 안 열림', `${tag} — 사전이 오기 전에 누른 것이 사라짐`); return; }
    await p.waitForTimeout(300); // 엔진이 그려진 글을 바꾸는 사이
    const q = await p.evaluate(() => [...document.querySelectorAll('.ps-dlg .ps-q button')].map(b => b.textContent));
    if (!q.length || q.some(x => /[가-힣]/.test(x))) fail('늦은 사전 — 빠른 말이 영어로 안 바뀜', `${tag} ${JSON.stringify(q)}`);
    bump('늦은 사전 누름');
    errsOf(p, tag);
  } finally { await done(p); }
}
/** 대화창을 못 쓰는 옛 기계 — 칸(div role=dialog)으로 열림 · 갇힌 차례 · Esc · 보내기 */
async function noDialogBox(W_, H_) {
  const tag = `${W_}×${H_} 대화창 없는 기계`, p = await newPage(W_, H_, {noDialog: true});
  try {
    await p.goto(base + NEXT + '#/w/' + CODE, {waitUntil: 'domcontentloaded'});
    const b = p.locator('#view .acts button', {hasText: /^보내기$/}); await b.first().waitFor({timeout: 30000});
    if (!(await openBox(p, () => b.first().click(), tag))) return;
    const kind = await p.evaluate(() => { const d = document.querySelector('.ps-dlg'); return d.tagName + ' ' + d.getAttribute('role') + ' ' + d.getAttribute('aria-modal'); });
    if (kind !== 'DIV dialog true') fail('옛 기계 글상자 꼴(div role=dialog aria-modal)', `${tag} ${kind}`);
    for (let i = 0; i < 12; i++) { await p.keyboard.press('Tab'); if (!(await p.evaluate(() => !!document.activeElement?.closest('.ps-dlg')))) { fail('Tab 이 글상자 밖으로(옛 기계)', `${tag} ${i + 1}번째`); break; } }
    await layout(p, DLG, tag);
    await p.keyboard.press('Escape');
    try { await p.waitForSelector(DLG, {state: 'detached', timeout: 4000}); } catch { fail('Esc 로 안 닫힘(옛 기계)', tag); }
    if (!(await openBox(p, () => b.first().click(), tag + ' 다시'))) return;
    await sendQuick(p, 1, tag);
    const d = await waitShared(p, 1, tag);
    if (d && (!URL_RE.test(d.url ?? '') || lines(d)[1] !== QUICK[1])) fail('옛 기계 보낸 글 · 주소', `${tag} 「${d?.text}」 「${d?.url}」`);
    bump('보낸 것');
    errsOf(p, tag);
  } finally { await done(p); }
}
/** ① 다른 입구 — 시황 · 소개 쪽 · 편지 쪽 셋 */
async function otherEntries(W_, H_) {
  // 시황(쇼츠)
  let tag = `${W_}×${H_} 시황 #/shorts`, p = await newPage(W_, H_);
  try {
    await p.goto(base + NEXT + '#/shorts', {waitUntil: 'domcontentloaded'});
    const b = p.locator('#view button', {hasText: /^보내기$/});
    try { await b.first().waitFor({timeout: 30000}); } catch { fail('시황 보내기 단추 없음', tag); }
    if (await b.count()) {
      const sb = await openBox(p, () => b.first().click(), tag);
      if (sb && (/값|원을 같이/.test(sb.desc) || !sb.desc.trim())) fail('시황 글상자 — 종목 값 칸이 없어야 하고 이름표는 있어야 함', `${tag} 「${sb.desc}」`);
      if (sb) {
        await sendQuick(p, 0, tag);
        const d = await waitShared(p, 1, tag);
        if (d) { if (!String(d.url ?? '').startsWith(base + '/#/shorts/') && !URL_RE.test(d.url ?? '')) fail('시황 보낸 주소', `${tag} 「${d.url}」`); if (!String(d.text ?? '').startsWith(QUICK[0])) fail('시황 보낸 글', `${tag} 「${d.text}」`); noGainPayload(d, tag); bump('보낸 것'); }
      }
    }
    errsOf(p, tag);
  } finally { await done(p); }
  // 소개 쪽(앱 없음)
  tag = `${W_}×${H_} 소개 /hello.html`; p = await newPage(W_, H_);
  try {
    await p.goto(base + '/hello.html', {waitUntil: 'domcontentloaded'});
    await p.locator('#hp-send').waitFor({timeout: 20000});
    const lead = await p.evaluate(() => window.__helloShare?.text ?? null);
    if (await openBox(p, () => p.locator('#hp-send').click(), tag)) {
      if (await p.evaluate(() => !!globalThis.NX)) fail('소개 쪽에 앱이 있음(앱 없이 시험해야 함)', tag);
      await layout(p, DLG, tag + ' 글상자');
      await sendQuick(p, 1, tag);
      const d = await waitShared(p, 1, tag);
      if (d) {
        if (d.url !== base + '/hello.html') fail('소개 쪽 보낸 주소', `${tag} 「${d.url}」`);
        if (!String(d.text ?? '').startsWith(QUICK[1]) || (lead && !d.text.includes(lead))) fail('소개 쪽 보낸 글 = 내 말 + 소개 글', `${tag} 「${d.text}」`);
        noGainPayload(d, tag); bump('보낸 것');
      }
    }
    errsOf(p, tag);
  } finally { await done(p); }
  // 편지 쪽 — 봉인 소식 · 초대장 · 사장님 새 초대장(편지 서버는 가짜 — 시험 서버 기록을 건드리지 않음)
  tag = `${W_}×${H_} 편지 /letter.html`; p = await newPage(W_, H_, {letter: true});
  try {
    await p.goto(base + '/letter.html', {waitUntil: 'domcontentloaded'});
    const entries = [
      ['봉인 소식', () => p.locator('button', {hasText: '봉인 소식'}).first(), base + '/letter.html', '편지를 봉인했어요'],
      ['초대장', () => p.locator('.tickets button.tk').first(), base + '/letter.html#join=AbCdEfGhIjKlMn01', '초대해요'],
      ['사장님 새 초대장', async () => { await p.locator('button', {hasText: '초대장 5장 만들기'}).click(); return p.locator('.codes button.tk').first(); }, base + '/letter.html#join=NewCode000000001', '초대해요']];
    let n = 0;
    for (const [nm, get, url, leadPart] of entries) {
      const t2 = tag + ' ' + nm;
      let b; try { b = await get(); await b.waitFor({timeout: 15000}); } catch { fail('편지 쪽 보내기 단추 없음', t2); continue; }
      if (!(await openBox(p, () => b.click(), t2))) continue;
      await sendQuick(p, 0, t2); n++;
      const d = await waitShared(p, n, t2);
      if (d) { if (d.url !== url) fail('편지 쪽 보낸 주소', `${t2} 「${d.url}」`); if (!String(d.text ?? '').startsWith(QUICK[0]) || !d.text.includes(leadPart)) fail('편지 쪽 보낸 글 = 내 말 + 편지 글', `${t2} 「${d.text}」`); noGainPayload(d, t2); bump('보낸 것'); }
      try { await p.waitForSelector(DLG, {state: 'detached', timeout: 4000}); } catch { fail('보낸 뒤 글상자가 안 닫힘', t2); }
    }
    errsOf(p, tag);
  } finally { await done(p); }
  // 편지 쪽 — 사장님 열쇠가 없는 사람 기기: 카카오 길을 한 번도 안 부름(요청 0)
  tag = `${W_}×${H_} 편지 /letter.html (사장님 열쇠 없는 기기)`; p = await newPage(W_, H_, {letter: 'plain'});
  try {
    await p.goto(base + '/letter.html', {waitUntil: 'domcontentloaded'});
    await p.locator('button', {hasText: '봉인 소식'}).first().waitFor({timeout: 15000}).catch(() => fail('편지 쪽 보내기 단추 없음', tag));
    await p.waitForTimeout(700);
    errsOf(p, tag);
  } finally { await done(p); }
}

/* ⑥ 친구가 연 주소 */
const READL = () => {
  const v = document.querySelector('#view'), land = v?.querySelector('.ps-top'), vals = v?.querySelector('.ps-vals'); if (!land) return {land: false, head: v?.querySelector('h1')?.textContent ?? null};
  const vs = [...(vals?.querySelectorAll('.ps-v') ?? [])].map(x => ({k: x.querySelector('.ps-vk')?.textContent ?? '', n: x.querySelector('.ps-vn')?.textContent ?? '', q: x.querySelector('.ps-q')?.textContent ?? null, cls: x.querySelector('.ps-vn')?.className ?? ''}));
  const why = v.querySelector('.ps-why .wy'), after = v.querySelector('.ps-after');
  const y = e => (e ? Math.round(e.getBoundingClientRect().top + scrollY) : null);
  return {land: true, kick: land.querySelector('.ps-kick')?.textContent ?? '', name: land.querySelector('.ps-name')?.textContent ?? '', vs, cmp: vals?.querySelector('.ps-cmp')?.textContent ?? '',
    pos: {top: y(land), step: y(v.querySelector('.ps-step')), why: y(why), after: y(after), lock: y(v.querySelector('.ps-lock')), vals: y(vals), safe: y(v.querySelector('.ps-safe')), valsH: vals ? Math.round(vals.getBoundingClientRect().height) : null},
    line: !!vals?.querySelector('svg .ps-ln'), dot: !!vals?.querySelector('svg .ps-sent'), why: !!why, whyFirst: !!(why && after && (why.compareDocumentPosition(after) & Node.DOCUMENT_POSITION_FOLLOWING)),
    lock: !!v.querySelector('.ps-lock'), said: v.querySelector('.ps-said')?.textContent ?? null, askq: v.querySelector('.ps-askq')?.textContent ?? null, mine: v.querySelector('.ps-mine')?.textContent ?? null,
    askline: v.querySelector('.ps-askline')?.textContent ?? null, afterText: after?.textContent ?? '', safe: v.querySelector('.ps-safe')?.textContent ?? null, body: document.body.innerText,
    saidLang: v.querySelector('.ps-said [data-proper]')?.getAttribute('lang') ?? null, mineLang: v.querySelector('.ps-mine [data-proper]')?.getAttribute('lang') ?? null};
};
/** 친구 쪽 「나도 보내기」 단추(넓은 카톡 단추 · share-btn.js) — 수 · 종목 번호 · 말풍선 그림 · 글 · 높이 */
const AGAINS = () => {
  const bs = [...document.querySelectorAll('#view .kk-btn.kk-wide')], b = bs[0], r = b?.getBoundingClientRect();
  return {n: bs.length, code: b?.dataset.kk ?? null, kk: !!b?.querySelector('svg.kk-ic'), text: b?.textContent?.trim() ?? null, h: r ? Math.round(r.height) : 0};
};
/** 왜 사? 칸을 끝까지(첫 답 · 다음 · 두 줄 · 결과 보기) — 모양은 그 칸 검사(check_why)가 봄 */
async function finishWhy(p, why, tag) {
  // 실제 사이트(2026-10-19 · 10-18): 자료(core · mkt)가 늦으면 칸이 마지막 질문에서 기다림(aria-busy · 누름은 버림) → 끝나면 저절로 「마지막 두 줄」로 감.
  //   그 사이 누른 답 단추가 사라져 click 이 30초 기다리다 멈췄음 → 기다리는 동안은 누르지 않고(기다림은 40번 셈 밖 · 모두 30초 안) · 누르기는 5초까지 — 못 누르면 상태를 다시 읽음(끝내 못 열면 아래 「안 열림」 실패)
  const until = Date.now() + 30000, tap = l => l.click({timeout: 5000}).catch(e => { if (!/Timeout \d+ms exceeded/.test(String(e?.message))) throw e; });
  for (let k = 0; k < 40 && Date.now() < until; k++) {
    const st = await p.evaluate(() => {
      const c = document.querySelector('#view .ps-why .wy'); if (!c) return 'none';
      if (!document.querySelector('#view .ps-lock')) return 'open';
      if (c.getAttribute('aria-busy') === 'true') return 'busy';
      if (c.querySelector('.wy-res')) return 'res';
      if (c.querySelector('.wy-why')) return 'lines';
      if (c.querySelector('.wy-opt')) return c.querySelector('.wy-opt[aria-pressed="true"]') ? 'next' : 'pick';
      return 'wait';
    });
    if (st === 'open') return true;
    if (st === 'none' || st === 'res') break;
    if (st === 'wait' || st === 'busy') { await p.waitForTimeout(150); if (st === 'busy') k--; continue; }
    if (st === 'pick') await tap(p.locator('#view .ps-why .wy-opt').first());
    else if (st === 'next') await tap(p.locator('#view .ps-why .wy-next').first());
    else {
      await p.locator('#view .ps-why .wy-why').fill(why);
      for (const [c, v] of [['.wy-sell', '1000'], ['.wy-half', '2000']]) { const x = p.locator('#view .ps-why ' + c); if ((await x.count()) && !(await x.inputValue())) await x.fill(v); }
      await tap(p.locator('#view .ps-why .wy-next').last());
    }
    await p.waitForTimeout(60);
  }
  try { await p.waitForFunction(() => !document.querySelector('#view .ps-lock'), null, {timeout: 4000}); return true; } catch { fail('질문을 다 답했는데 보낸 말이 안 열림', tag); return false; }
}
async function landing(W_, H_, cases) {
  for (const C of cases) {
    const tag = `${W_}×${H_} 친구 주소 ${C.name}`, p = await newPage(W_, H_);
    try {
      const hash = '#/s/' + C.code + '/' + C.day + '/' + C.price + (C.kind ? '/' + C.kind : '') + (C.msg != null ? '/' + C.msg : '');
      await p.goto(base + NEXT + hash, {waitUntil: 'domcontentloaded'});
      try { await p.waitForFunction(() => !!document.querySelector('#view .ps-land, #view .ps-name') && !document.querySelector('#view .boot'), null, {timeout: 30000}); } catch { fail('친구 주소가 안 열림(#/s/ 길)', tag); continue; }
      let s = await p.evaluate(READL);
      if (C.bad) { if (!/주소가 이상해요/.test(s.head ?? s.name ?? '')) fail('이상한 주소 알림', `${tag} 「${s.head ?? s.name}」`); bump('친구 주소'); errsOf(p, tag); continue; }
      if (!s.land) { fail('친구 주소 칸 없음', tag); continue; }
      const sent = s.vs.find(x => x.k === SENT_LBL), now = s.vs.find(x => x.k === NOW_LBL);
      if (!sent || !now) fail('「보낸 날 값」 · 「오늘 값」 이름(원문)', `${tag} ${JSON.stringify(s.vs.map(x => x.k))}`);
      if (sent && sent.n !== num(C.price) + '원') fail('보낸 날 값', `${tag} 「${sent.n}」 ≠ ${num(C.price)}원`);
      if (now && now.n !== num(CO.c.price) + '원') fail('오늘 값(자료 co.c.price)', `${tag} 「${now.n}」 ≠ ${num(CO.c.price)}원`);
      const dir = CO.c.price > C.price ? 'up' : CO.c.price < C.price ? 'dn' : 'fl';
      if (now && !now.cls.split(/\s+/).includes(dir)) fail('오늘 값 색(빨강 오름 · 파랑 내림)', `${tag} ${now.cls} · 기대 ${dir}`);
      if ((C.price !== Math.round(closeAt(C.day))) !== !!sent?.q) fail('기록과 다른 값 「?」', `${tag} ${sent?.q}`);
      if (!s.line || !s.dot) fail('그림(선 · 보낸 날 금빛 점)', `${tag} 선 ${s.line} 점 ${s.dot}`);
      if (!s.why || !s.whyFirst || !s.lock) fail('질문이 먼저가 아님', `${tag} 질문 ${s.why} 먼저 ${s.whyFirst} 잠김 ${s.lock}`);
      // [5] 10 — 종목 이름 한 줄 → 질문 → 친구 말 칸 → 값 칸 → 안전 문장(위에서 아래)
      const P = s.pos;
      if (!(P.top < P.why && P.why < P.lock && P.lock < P.vals && P.vals < P.safe)) fail('질문이 값 칸보다 아래([5] 10 — 질문이 맨 위 · 값 칸은 질문 뒤)', `${tag} ${JSON.stringify(P)}`);
      if (P.step - P.top > 140) fail('질문 앞에 이름 한 줄 말고 다른 칸이 있음([5] 10)', `${tag} 이름 ${P.top} → 질문 ${P.step}`);
      bump('친구 주소 차례 맞댐');
      if (s.safe !== SAFE_LINE) fail('안전 문장', `${tag} 「${s.safe}」`);
      if (C.kind === 'a' && !(s.askline ?? '').includes(ASK_Q)) fail('같이 따져 줘 물음이 처음에 없음', `${tag} 「${s.askline}」`);
      if (C.text && s.body.includes(C.text)) fail('다 답하기 전에 보낸 말이 화면에 보임', tag);
      // 「나도 보내기」([6] 9 · 일꾼 KB1) — 질문에 다 답하기 전엔 0개 · 다 답한 뒤 하나(카톡 단추 · 넓은 꼴) · 누르면 글상자 · 쪽 그대로
      const ag0 = await p.evaluate(AGAINS);
      if (ag0.n) fail('「나도 보내기」가 다 답하기 전에 보임([6] 9)', `${tag} ${ag0.n}개`);
      await layout(p, '#view', tag + ' 처음', '.wy');
      if (!(await finishWhy(p, C.why ?? '이익이 줄어서', tag))) continue;
      s = await p.evaluate(READL);
      const ag = await p.evaluate(AGAINS);
      if (ag.n !== 1) fail('다 답한 뒤 「나도 보내기」가 하나가 아님([6] 9)', `${tag} ${ag.n}개`);
      else if (ag.code !== C.code || !ag.kk || ag.h < 43.5 || ag.text !== '나도 보내기') fail('「나도 보내기」 = 같은 종목 카톡 단추(넓은 꼴 · 44px)', `${tag} ${JSON.stringify(ag)}`);
      if (ag.n === 1 && C === cases[0]) { // 첫 경우만 눌러 봄 — 글상자가 열리고 쪽(주소)은 그대로 · 이름이 저절로
        const h0 = await p.evaluate(() => location.hash);
        const sb = await openBox(p, () => p.locator('#view .kk-btn.kk-wide').first().click(), tag + ' 나도 보내기');
        if (sb && !String(sb.desc).includes(String(CO.c.name))) fail('「나도 보내기」 글상자에 종목 이름이 없음([6] 3)', `${tag} 「${sb.desc}」`);
        if ((await p.evaluate(() => location.hash)) !== h0) fail('「나도 보내기」를 누르자 쪽이 바뀜([6] 6)', tag);
        if (sb) { await p.keyboard.press('Escape'); await p.waitForSelector(DLG, {state: 'detached', timeout: 4000}).catch(() => fail('Esc 로 안 닫힘(나도 보내기)', tag)); }
        bump('나도 보내기 누름');
      }
      bump('나도 보내기 맞댐');
      if (!(s.pos.why < s.pos.after && s.pos.after < s.pos.vals && s.pos.vals < s.pos.safe)) fail('다 답한 뒤에도 값 칸이 질문 · 친구 말보다 아래여야 함([5] 10)', `${tag} ${JSON.stringify(s.pos)}`);
      if (C.text != null && !C.hide) { if (s.said !== '「' + C.text + '」') fail('다 답한 뒤 보낸 말', `${tag} 「${s.said}」 ≠ 「${C.text}」`); if (/[가-힣]/.test(C.text) && s.saidLang !== 'ko') fail('보낸 말(쓴 사람 글)에 lang="ko" 없음', `${tag} ${s.saidLang}`); }
      if (C.hide) { if (s.said != null || (C.text && s.body.includes(C.text))) fail('거르는 말 · 깨진 말을 보여 줌', `${tag} 「${s.said}」`); if (!new RegExp(C.hide).test(s.afterText)) fail('못 보여 주는 까닭', `${tag} 「${s.afterText.slice(0, 80)}」`); }
      if (C.kind === 'a') {
        if (s.askq !== ASK_Q) fail('같이 따져 줘 「반토막 난다면 왜일까?」', `${tag} 「${s.askq}」`);
        if (!(s.mine ?? '').includes(C.why ?? '이익이 줄어서')) fail('같이 따져 줘 — 내 생각(두 줄 ① 답)', `${tag} 「${s.mine}」`);
        if (s.mineLang !== 'ko') fail('내 생각(쓴 사람 글)에 lang="ko" 없음', `${tag} ${s.mineLang}`);
      }
      await layout(p, '#view', tag + ' 다 답한 뒤', '.wy');
      bump('친구 주소');
      errsOf(p, tag);
    } finally { await done(p); }
  }
}


/* ⑥-3 친구 쪽 첫 화면 — 첫 질문의 답 셋이 아래 탭(고정)보다 위에 다 보임([5] 10 · 독립 점검 VJ 2026-10-18 「답 셋이 481~665px 인데 아래 탭이 572px 부터 덮음」)
   이름이 긴 회사까지 — 이름 줄이 두 줄이 돼도 답 셋이 탭 위에 있어야 함(자료 mkt.json 에서 9 ~ 10자 · 11 ~ 13자 이름을 하나씩 고름) */
const MK = await getJ('/atlas/data/mkt.json').then(j => j?.companies ?? {}).catch(() => ({}));
const longOf = (lo, hi) => Object.entries(MK).find(([k, v]) => /^[0-9A-Z]{6}$/.test(k) && !/[()]/.test(String(v?.n ?? '')) && [...String(v?.n ?? '')].length >= lo && [...String(v?.n ?? '')].length <= hi);
async function firstView(W_, H_, {min = 3, only = 0} = {}) {
  const cases = [[CODE, 's', '짧은 이름']];
  if (!only) {
    cases.push([CODE, 'a', '같이 따져 줘']);
    for (const [lo, hi, label] of [[9, 10, '이름 9 ~ 10자'], [11, 13, '이름 11 ~ 13자']]) { const f = longOf(lo, hi); if (f) cases.push([f[0], 's', label + ' ' + f[1].n]); }
  }
  for (const [code, kind, label] of cases) {
    const tag = `${W_}×${H_} 첫 화면 ${label}`, p = await newPage(W_, H_);
    try {
      await p.goto(base + NEXT + `#/s/${code}/${SENT_DAY}/${SENT_PRICE}/${kind}/` + b64(kind === 'a' ? '같이 따져 줘' : '이거 어때?'), {waitUntil: 'domcontentloaded'});
      try { await p.waitForFunction(() => document.querySelectorAll('#view .ps-why .wy-opt').length >= 3 && !document.querySelector('#view .boot'), null, {timeout: 30000}); } catch { fail('첫 화면에 질문 답이 안 뜸', tag); continue; }
      await p.waitForTimeout(500);
      const fv = await p.evaluate(() => {
        const tab = document.querySelector('nav.tabs'), t = tab && getComputedStyle(tab).position === 'fixed' ? tab.getBoundingClientRect().top : innerHeight;
        return {tab: Math.round(t), scrolled: Math.round(scrollY), bottoms: [...document.querySelectorAll('#view .ps-why .wy-opt')].map(e => Math.round(e.getBoundingClientRect().bottom))};
      });
      const seen = fv.bottoms.filter(b => b <= fv.tab).length;
      if (fv.scrolled !== 0 || seen < Math.min(min, fv.bottoms.length)) fail('첫 질문의 답이 아래 탭에 가려짐([5] 10 · 질문이 맨 위)', `${tag} 탭 ${fv.tab}px · 답 아래끝 ${fv.bottoms.join('/')} · 보이는 답 ${seen}/${fv.bottoms.length}`);
      bump('첫 질문 답 보임');
      errsOf(p, tag);
    } finally { await done(p); }
  }
}

/* ⑨ ⑩ 카톡 — 꺼짐(NX.kakao 없음 · 있어도 on false)은 카카오 글 · 요청 · 도구 0 / 켜짐(가짜 서버 · 가짜 도구)은 카드 한 장 · 단추 둘 · 가입은 친구가 직접(사장님 2026-10-18 [2] · [12] 2) */
/** 기다림이 시간을 넘기면 그때 쪽 모습(주소 · 보이는 글)을 함께 알림 — 어디서 멈췄는지 바로 보이게 */
async function waitUp(p, fn, tag, what, arg = null, timeout = 30000) {
  try { await p.waitForFunction(fn, arg, {timeout}); return true; }
  catch { const st = await p.evaluate(() => ({url: location.href, top: !!document.querySelector('#view .ps-top'), boot: !!document.querySelector('#view .boot'), nx: typeof globalThis.NX, view: (document.querySelector('#view')?.innerText ?? '').replace(/\s+/g, ' ').slice(0, 100)})).catch(() => null); fail(what + ' — 시간 안에 안 뜸', `${tag} ${JSON.stringify(st)}`); return false; }
}
const kkLoad = async p => { await p.waitForFunction(() => !!globalThis.NX && typeof globalThis.NX.shareBox === 'function', null, {timeout: 30000}); await p.evaluate(() => import('/next/kakao.js')); }; // 앱이 kakao.js 를 안 불렀어도(index.html 에 줄이 없어도) 같은 모듈을 불러 붙임
const KKUI = () => ({kk: !!document.querySelector('.ps-kk:not([hidden])'), offer: !!document.querySelector('.ps-offer'), link: !!document.querySelector('a[href*="/api/kakao"]'),
  btn: [...document.querySelectorAll('button, a, .ps-card-b span')].some(e => /^(카카오로 시작하기|그냥 보기|Start with Kakao|Just look)$/.test((e.textContent || '').trim())), scripts: document.scripts.length});
const READK = () => {
  const k = document.querySelector('.ps-dlg .ps-kk'); if (!k || k.hidden) return null;
  const q = x => k.querySelector(x);
  return {head: q('.ps-pk')?.textContent ?? '', title: q('.ps-card-t')?.textContent ?? '', said: [...k.querySelectorAll('.ps-card-d')].map(e => e.textContent), value: q('.ps-card-v')?.textContent ?? '',
    btns: [...k.querySelectorAll('.ps-card-b span')].map(e => e.textContent), note: [...k.querySelectorAll('.ps-n')].map(e => e.textContent).join(' '), inter: k.querySelectorAll('button, a, input, textarea, select, [tabindex]').length, text: k.textContent};
};
const READO = () => {
  const e = document.querySelector('.ps-offer'); if (!e) return null;
  return {n: document.querySelectorAll('.ps-offer').length, h: e.querySelector('h2')?.textContent ?? '', btns: [...e.querySelectorAll('button')].map(b => b.textContent), inputs: e.querySelectorAll('input, textarea, select').length, links: e.querySelectorAll('a').length,
    afterJournal: !!e.previousElementSibling?.classList.contains('wy'), text: e.textContent, calls: (window.__offerCalls ?? []).slice()};
};
const spyOffer = p => p.evaluate(() => { window.__offerCalls = []; const K = NX.kakao, o = K.offer.bind(K); K.offer = (...a) => { window.__offerCalls.push(a[0]); return o(...a); }; });
/** 글상자를 열고 켜짐이면 카드 미리보기가 나올 때까지 기다림 */
async function openKk(p, click, tag) {
  const s = await openBox(p, click, tag); if (!s) return null;
  try { await p.waitForSelector('.ps-dlg .ps-kk:not([hidden])', {timeout: 8000}); } catch { fail('켜짐인데 카드 미리보기가 안 나옴', tag); return null; }
  return s;
}
/** 보낸 카드 하나(window.__kcards[n]) 맞대기 — {msg: 보낸 말 · kind: 's'|'a' · ref: 보낸 사람 표 | null} */
async function checkCard(p, n, {msg, kind = 's', ref = null}, tag) {
  try { await p.waitForFunction(k => window.__kcards.length >= k, n + 1, {timeout: 8000}); } catch { fail('카드가 안 나감(카카오 도구에 안 불림)', tag); return null; }
  const c = (await p.evaluate(() => window.__kcards))[n], blob = JSON.stringify(c);
  if (c.objectType !== 'feed') fail('카드 꼴(feed)', `${tag} ${c.objectType}`);
  const see = c.content?.link?.webUrl, m = URL_RE.exec(see ?? '');
  if (!m) fail('카드 누르기 주소 꼴(#/s/…)', `${tag} 「${see}」`);
  else {
    if (m[1] !== CODE || m[2] !== CO.c.priceDate || +m[3] !== Math.round(CO.c.price) || m[4] !== kind) fail('카드 주소의 종목 · 날 · 값 · 갈래', `${tag} ${m.slice(1, 5).join(' ')}`);
    if (!m[5] || unb64(m[5]) !== msg) fail('카드 주소의 말 조각', `${tag} 「${m[5] ? unb64(m[5]) : ''}」 ≠ 「${msg}」`);
  }
  if (c.content?.link?.mobileWebUrl !== see) fail('카드 누르기 주소(웹 · 모바일)가 다름', tag);
  if (c.content?.title !== CO.c.name) fail('카드 제목 = 종목 이름', `${tag} 「${c.content?.title}」 ≠ 「${CO.c.name}」`);
  const wantDesc = msg + '\n' + md(CO.c.priceDate) + ' 값 ' + num(Math.round(CO.c.price)) + '원';
  if (c.content?.description !== wantDesc) fail('카드 글 = 보낸 사람 글 + 보낸 날 값', `${tag} 「${c.content?.description}」 ≠ 「${wantDesc}」`);
  if (/[%％]|퍼센트|프로|1등|1위|급등/.test(blob.replace(/%2F|%3F|%23|%3D|%26|%[0-9A-F]{2}/g, '')) || W.gainHits(c.content?.title + '\n' + c.content?.description).length) fail('카드에 수익 숫자 · 퍼센트 · 1등 · 급등', `${tag} 「${c.content?.description}」`);
  if (!String(c.content?.imageUrl ?? '').startsWith(base + '/')) fail('카드 그림 주소(우리 사이트 것)', `${tag} 「${c.content?.imageUrl}」`);
  else { const r = await fetch(c.content.imageUrl).catch(() => null); if (!r?.ok) fail('카드 그림 파일을 못 받음', `${tag} ${c.content.imageUrl}`); }
  const bs = c.buttons ?? []; // 가입이 켜진 판(SIGNUP_ON)의 카드 단추는 「카톡 켜짐 · 카드」 장면(kakaoCard)이 따로 맞댐
  if (bs.length !== 2) fail('카드 단추는 정확히 둘', `${tag} ${bs.length}개`);
  if (JSON.stringify(bs.map(b => b.title)) !== JSON.stringify([BTN_START, BTN_SEE])) fail('카드 단추 이름 · 차례(원문 [2] 2)', `${tag} ${JSON.stringify(bs.map(b => b.title))}`);
  const w0 = bs[0]?.link?.webUrl ?? '', u0 = (() => { try { return new URL(w0); } catch { return null; } })();
  if (!u0 || u0.origin + u0.pathname !== base + '/api/kakao/start' || bs[0].link.mobileWebUrl !== w0) fail('카드 단추 1 주소(가입 길)', `${tag} 「${w0}」`);
  else {
    const seeU = see ? new URL(see) : null, want = seeU ? seeU.pathname + seeU.search + seeU.hash : null;
    if (u0.searchParams.get('to') !== want) fail('단추 1 이 동의 뒤 돌아올 쪽 = 보낸 쪽(#/s/…)이 아님', `${tag} 「${u0.searchParams.get('to')}」 ≠ 「${want}」`);
    if (u0.searchParams.get('ref') !== ref) fail('단추 1 의 보낸 사람 표', `${tag} 「${u0.searchParams.get('ref')}」 ≠ 「${ref}」`);
    if ([...u0.searchParams.keys()].some(k => !['to', 'ref'].includes(k))) fail('단추 1 주소에 다른 물음이 끼어 있음', `${tag} ${u0.search}`);
  }
  if (bs[1]?.link?.webUrl !== see || bs[1]?.link?.mobileWebUrl !== see || /\/api\//.test(bs[1]?.link?.webUrl ?? '')) fail('카드 단추 2 주소 = 보낸 주소 그대로(가입 길 아님)', `${tag} 「${bs[1]?.link?.webUrl}」`);
  noGainPayload({title: c.content?.title, text: c.content?.description}, tag);
  bump('보낸 카드');
  return c;
}
/** 켜짐 — 카드 미리보기 · 카드 한 장 · 단추 둘 · 보내기만으로는 가입 요청 0 */
async function kakaoCard(W_, H_, deep) {
  // ① 처음 온 사람(회원 아님) — 보내기 · 같이 따져 줘
  let tag = `${W_}×${H_} 켜짐 · 카드 보내기`, p = await newPage(W_, H_, {kakao: 'on'});
  try {
    await p.goto(base + NEXT + '#/w/' + CODE, {waitUntil: 'domcontentloaded'});
    const shareB = p.locator('#view .acts button', {hasText: /^보내기$/}), askB = p.locator('#view .acts button', {hasText: new RegExp('^' + ASK_BTN + '$')});
    await shareB.first().waitFor({timeout: 30000}); await kkLoad(p); await p.waitForTimeout(400);
    if (p._kk.length) fail('처음 온 사람인데 쪽을 열자마자 카카오 요청이 나감([2] 10 — 건드리지 않음)', `${tag} ${p._kk.join(' | ')}`);
    const s = await openKk(p, () => shareB.first().click(), tag);
    if (s) {
      let k = await p.evaluate(READK);
      if (k.title !== CO.c.name || k.said[0] !== '이거 어때?' || k.value !== md(CO.c.priceDate) + ' 값 ' + num(Math.round(CO.c.price)) + '원') fail('카드 미리보기 = 보낼 카드(이름 · 글 · 보낸 날 값)', `${tag} ${JSON.stringify([k.title, k.said, k.value])}`);
      if (JSON.stringify(k.btns) !== JSON.stringify([BTN_START, BTN_SEE])) fail('카드 미리보기 단추 이름 · 차례', `${tag} ${JSON.stringify(k.btns)}`);
      if (k.inter) fail('카드 미리보기에 누르는 것이 있음(눌러 가입하는 길은 친구 쪽 카드뿐)', `${tag} ${k.inter}개`);
      if (!k.note.includes(BTN_START) || !/직접/.test(k.note)) fail('가입은 친구가 직접 누른다는 안내', `${tag} 「${k.note}」`);
      if (NOASK.test(k.text)) fail('카드 안내에 가입 길에 없어야 할 말([2] 8 · 9)', `${tag} 「${(NOASK.exec(k.text) ?? [])[0]}」`);
      await layout(p, DLG, tag + ' 글상자(카드 미리보기)');
      await p.locator(DLG + ' textarea.ps-t').first().fill('나는 이렇게 봤어');
      k = await p.evaluate(READK); if (k.said[0] !== '나는 이렇게 봤어') fail('카드 미리보기가 쓴 말을 따라가지 않음', `${tag} ${JSON.stringify(k.said)}`);
      await p.locator(DLG + ' textarea.ps-t').first().fill('지금 사세요'); await p.locator(DLG + ' .ps-go').click({force: true}); await p.waitForTimeout(300);
      if ((await p.evaluate(() => window.__kcards.length)) || (await shared(p)).length) fail('걸렸는데 카드가 나감', tag);
      await sendQuick(p, 2, tag);
      const c = await checkCard(p, 0, {msg: QUICK[2]}, tag);
      if ((await shared(p)).length) fail('카드를 보냈는데 휴대폰 공유 창도 열림', tag);
      const extra = p._kk.filter(x => x !== 'GET /api/kakao/me');
      if (extra.length) fail('보내기만으로 가입 길 요청이 나감([2] 1 — 보내기만으로는 가입 0)', `${tag} ${extra.join(' | ')}`);
      if (p._kk.filter(x => x === 'GET /api/kakao/me').length > 1) fail('서버 확인(/me)이 한 번보다 많음', `${tag} ${p._kk.join(' | ')}`);
      try { await p.waitForSelector(DLG, {state: 'detached', timeout: 4000}); } catch { fail('카드를 보낸 뒤 글상자가 안 닫힘', tag); }
      if (c) bump('카드 맞댐');
    }
    if (deep && (await askB.count())) {
      const s2 = await openKk(p, () => askB.first().click(), tag + ' 같이 따져 줘');
      if (s2) { await p.locator(DLG + ' .ps-go').click(); await checkCard(p, 1, {msg: '같이 따져 줘. ' + ASK_Q, kind: 'a'}, tag + ' 같이 따져 줘'); }
    }
    errsOf(p, tag);
  } finally { await done(p); }
  // ② 보낸 사람이 회원 — 단추 1 에 보낸 사람 표(ref)
  if (deep) {
    tag = `${W_}×${H_} 켜짐 · 회원이 보냄(ref)`; p = await newPage(W_, H_, {kakao: 'on', kk: {member: true}});
    try {
      await p.goto(base + NEXT + '#/w/' + CODE, {waitUntil: 'domcontentloaded'});
      const b = p.locator('#view .acts button', {hasText: /^보내기$/}); await b.first().waitFor({timeout: 30000}); await kkLoad(p);
      if (await openKk(p, () => b.first().click(), tag)) { await sendQuick(p, 0, tag); await checkCard(p, 0, {msg: QUICK[0], ref: 'ABCDEFGHIJKL'}, tag); }
      const bad = p._kk.filter(x => !/^(GET|PUT) \/api\/kakao\/(me|data)$/.test(x));
      if (bad.length) fail('회원이 보내는데 기록 맞추기 밖의 가입 길 요청이 나감', `${tag} ${bad.join(' | ')}`);
      errsOf(p, tag);
    } finally { await done(p); }
    // ③ 카카오 도구가 없음 · 카드가 던짐 → 휴대폰 공유 창 · 종목 아닌 보내기는 카드 아님
    for (const [nm, kk] of [['도구 없음', {sdk: false}], ['카드가 막힘', {throws: true}]]) {
      tag = `${W_}×${H_} 켜짐 · ${nm} → 공유 창`; p = await newPage(W_, H_, {kakao: 'on', kk});
      try {
        await p.goto(base + NEXT + '#/w/' + CODE, {waitUntil: 'domcontentloaded'});
        const b = p.locator('#view .acts button', {hasText: /^보내기$/}); await b.first().waitFor({timeout: 30000}); await kkLoad(p);
        if (!(await openBox(p, () => b.first().click(), tag))) continue;
        await p.waitForTimeout(900);
        if (kk.sdk === false && (await p.evaluate(KKUI)).kk) fail('카카오 도구가 없는데 카드 미리보기가 보임', tag);
        await sendQuick(p, 0, tag);
        const d = await waitShared(p, 1, tag);
        if (d && (!URL_RE.test(d.url ?? '') || lines(d)[1] !== QUICK[0])) fail('카드가 안 가면 공유 창으로(글 + 주소)', `${tag} 「${d.text}」 「${d.url}」`);
        errsOf(p, tag);
      } finally { await done(p); }
    }
    tag = `${W_}×${H_} 켜짐 · 종목 아닌 보내기(시황)는 카드 아님`; p = await newPage(W_, H_, {kakao: 'on'});
    try {
      await p.goto(base + NEXT + '#/shorts', {waitUntil: 'domcontentloaded'});
      const b = p.locator('#view button', {hasText: /^보내기$/}); await b.first().waitFor({timeout: 30000}); await kkLoad(p);
      if (await openBox(p, () => b.first().click(), tag)) {
        await p.waitForTimeout(700);
        if ((await p.evaluate(KKUI)).kk) fail('종목이 아닌데 카드 미리보기가 보임', tag);
        await sendQuick(p, 0, tag); await waitShared(p, 1, tag);
        if (await p.evaluate(() => window.__kcards.length)) fail('종목이 아닌 보내기가 카드로 나감', tag);
        if (p._kk.length) fail('종목이 아닌 보내기에서 카카오 요청이 나감', `${tag} ${p._kk.join(' | ')}`);
      }
      errsOf(p, tag);
    } finally { await done(p); }
  }
}
const CASE0 = () => { const C = CASES[0]; return '#/s/' + C.code + '/' + C.day + '/' + C.price + '/' + C.kind + '/' + C.msg; };
/** 켜짐 — 친구가 「그냥 보기」로 연 쪽 · 매매일지를 끝낸 순간 한 번 뜨는 「이 기록 지키기」 */
async function kakaoOffer(W_, H_, {en = false} = {}) {
  const tag = `${W_}×${H_} 켜짐 · ${en ? '영어 ' : ''}친구 주소 → 매매일지 끝 → 권유`, p = await newPage(W_, H_, {kakao: 'on', en});
  try {
    await p.goto(base + NEXT + (en ? '&lang=en' : '') + CASE0(), {waitUntil: 'domcontentloaded'});
    await p.waitForFunction(() => !!document.querySelector('#view .ps-top') && !document.querySelector('#view .boot'), null, {timeout: 30000});
    await kkLoad(p); await spyOffer(p); await p.waitForTimeout(600);
    if (p._kk.length) fail('「그냥 보기」로 연 쪽에서 카카오 요청이 나감(요청 0이어야 함)', `${tag} ${p._kk.join(' | ')}`);
    const pre = await p.evaluate(() => ({links: document.querySelectorAll('a[href*="/api/kakao"]').length, offer: document.querySelectorAll('.ps-offer').length, signup: [...document.querySelectorAll('button')].filter(b => /카카오로 시작하기|Start with Kakao/.test(b.textContent)).length, calls: window.__offerCalls.length}));
    if (pre.links || pre.offer || pre.signup) fail('「그냥 보기」 쪽에 가입 고리 · 단추 · 권유 칸이 있음([2] 6)', `${tag} ${JSON.stringify(pre)}`);
    if (pre.calls) fail('매매일지를 끝내기 전에 offer 가 불림([2] 7)', tag);
    if (!(await finishWhy(p, '이익이 줄어서', tag))) return;
    try { await p.waitForSelector('.ps-offer', {timeout: 8000}); } catch { fail('매매일지를 끝냈는데 권유 칸이 안 뜸([2] 7)', tag); return; }
    const o = await p.evaluate(READO);
    if (o.n !== 1) fail('권유 칸이 한 장이 아님', `${tag} ${o.n}`);
    if (o.h !== (en ? 'Keep this record safe' : OFFER_H)) fail('권유 글(원문 「이 기록 지키기」)', `${tag} 「${o.h}」`);
    if (JSON.stringify(o.btns) !== JSON.stringify([en ? 'Start with Kakao' : OFFER_BTN])) fail('권유 단추는 「카카오로 시작하기」 하나', `${tag} ${JSON.stringify(o.btns)}`);
    if (o.inputs || o.links) fail('권유 칸에 입력칸 · 고리가 있음([2] 8)', `${tag} 입력 ${o.inputs} 고리 ${o.links}`);
    if (!o.afterJournal) fail('권유 칸이 매매일지 결과 바로 밑이 아님', tag);
    if (JSON.stringify(o.calls) !== JSON.stringify(['journal'])) fail('offer(\'journal\') 는 끝낸 뒤 정확히 한 번', `${tag} ${JSON.stringify(o.calls)}`);
    if (NOASK.test(o.text)) fail('권유 칸에 가입 길에 없어야 할 말([2] 8 · 9)', `${tag} 「${(NOASK.exec(o.text) ?? [])[0]}」`);
    if (en && /[가-힣]/.test(o.text)) fail('영어 권유 칸에 한글이 남음', `${tag} 「${o.text}」`);
    await layout(p, '.ps-offer', tag + ' 권유 칸');
    if (en) { const miss = await p.evaluate(() => window.__atlasI18n?.missing?.() ?? []); if (miss.length) fail('영어 사전에 없는 틀', `${tag} ${JSON.stringify(miss).slice(0, 200)}`); }
    // 한 번만 — 칸을 치우고 다시 불러도 안 뜸
    const again = await p.evaluate(async () => { document.querySelector('.ps-offer')?.remove(); const r = await NX.kakao.offer('journal'); return {r, n: document.querySelectorAll('.ps-offer').length, flag: localStorage.getItem('atlas:kakao:offered')}; });
    if (again.r !== false || again.n !== 0 || again.flag !== '1') fail('권유 칸이 한 번이 아님', `${tag} ${JSON.stringify(again)}`);
    const mes = p._kk.filter(x => x === 'GET /api/kakao/me').length, others = p._kk.filter(x => x !== 'GET /api/kakao/me');
    if (mes !== 1 || others.length) fail('권유를 띄우는 동안 서버 요청은 확인(/me) 한 번뿐이어야 함', `${tag} ${p._kk.join(' | ')}`);
    // 단추 → 우리 주소 한 번 → (가짜) 카카오 동의 화면. 돌아올 쪽 = 지금 쪽
    const box = await p.evaluate(async () => { const m = await import('/next/p-share.js'); document.querySelector('#view').append(m.offerBox({start: () => NX.kakao.start(null)})); return true; }); // 앱이 그리는 것과 같은 꼴(kakao.js 의 browserOffer)
    const here = await p.evaluate(() => location.pathname + location.search + location.hash);
    const [req] = await Promise.all([p.waitForRequest(r => /\/api\/kakao\/start/.test(r.url()), {timeout: 8000}), p.locator('.ps-offer button').last().click()]);
    const u = new URL(req.url());
    if (u.pathname !== '/api/kakao/start' || u.searchParams.get('to') !== here || u.searchParams.has('prompt') || u.searchParams.has('ref')) fail('권유 단추 주소(가입 길 · 돌아올 쪽 = 지금 쪽)', `${tag} 「${req.url()}」 ≠ to=${here}`);
    if (!box) fail('권유 칸을 못 만듦', tag);
    bump('권유 맞댐');
    errsOf(p, tag);
  } finally { await done(p); }
}
/** 켜짐 — 동의 화면에서 돌아옴(?kakao=ok|none) · 조용한 로그인(카톡 안 + 앞서 가입한 기기만) */
async function kakaoReturn(W_, H_) {
  for (const back of ['ok', 'none']) {
    const tag = `${W_}×${H_} 켜짐 · 동의 화면에서 돌아옴(kakao=${back})`, p = await newPage(W_, H_, {kakao: 'on', kk: {member: back === 'ok'}});
    try {
      await p.goto(base + NEXT + '&kakao=' + back + CASE0(), {waitUntil: 'domcontentloaded'});
      if (!(await waitUp(p, () => !!document.querySelector('#view .ps-top') && !document.querySelector('#view .boot'), tag, '돌아온 친구 쪽'))) continue;
      await kkLoad(p);
      try { await p.waitForFunction(() => !/[?&]kakao=/.test(location.search), null, {timeout: 6000}); } catch { fail('돌아온 뒤 주소에 kakao 표가 남음', `${tag} ${await p.evaluate(() => location.href)}`); }
      await p.waitForTimeout(600);
      const href = await p.evaluate(() => location.pathname + location.search + location.hash);
      if (href !== NEXT + CASE0()) fail('돌아온 쪽 = 보낸 쪽(#/s/…) 그대로', `${tag} ${href} ≠ ${NEXT + CASE0()}`);
      const mes = p._kk.filter(x => x === 'GET /api/kakao/me').length, starts = p._kk.filter(x => /\/start/.test(x));
      if (mes !== 1) fail('돌아온 쪽에서 서버 확인(/me)이 한 번이 아님', `${tag} ${p._kk.join(' | ')}`);
      if (starts.length) fail('돌아온 쪽에서 다시 가입 길로 감(되풀이)', `${tag} ${starts.join(' | ')}`);
      if (back === 'ok') { const m = await p.evaluate(() => NX.kakao.member()); if (!m) fail('동의하고 돌아왔는데 회원으로 안 보임', tag); }
      errsOf(p, tag);
    } finally { await done(p); }
  }
  const KUA = 'Mozilla/5.0 (Linux; Android 13; SM-S918N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Mobile Safari/537.36 KAKAOTALK 10.4.1';
  for (const [nm, ua, kk, wantStart] of [['카톡 안 · 앞서 가입한 기기 → 조용한 로그인 한 번', KUA, {flag: true}, 1], ['카톡 안 · 처음 온 사람 → 건드리지 않음', KUA, {}, 0], ['카톡 밖 · 앞서 가입한 기기 → 안 함', null, {flag: true}, 0]]) {
    const tag = `${W_}×${H_} 켜짐 · ${nm}`, p = await newPage(W_, H_, {kakao: 'on', kk: {...kk, member: false}, ua});
    try {
      const nav = p.waitForRequest(r => /\/api\/kakao\/start/.test(r.url()), {timeout: 30000}).then(r => r, () => null);
      await p.goto(base + NEXT + CASE0(), {waitUntil: 'domcontentloaded'});
      // 앱이 떠서 kakao.js 가 붙을 때까지 — 또는 가입 길로 떠날 때까지(떠나는 쪽은 열자마자 떠나므로 앱을 기다리지 않음 · kakao.js 는 index.html 에서 앱 바로 다음에 불림 · 없으면 여기서 불러 붙임)
      const app = (async () => { try { await p.waitForFunction(() => !!globalThis.NX && typeof globalThis.NX.shareBox === 'function', null, {timeout: 30000}); await p.evaluate(() => import('/next/kakao.js')); await p.waitForFunction(() => !!globalThis.NX?.kakao, null, {timeout: 10000}); return 'app'; } catch { return null; } })();
      await Promise.race([nav, app]);
      if (wantStart) {
        const req = await nav;
        if (!req) fail('조용한 로그인이 안 감', tag);
        else { const u = new URL(req.url()); if (u.searchParams.get('prompt') !== 'none' || u.searchParams.get('to') !== NEXT + CASE0()) fail('조용한 로그인 주소(prompt=none · 돌아올 쪽)', `${tag} 「${req.url()}」`); }
      } else {
        await p.waitForTimeout(1500);
        const st = p._kk.filter(x => /\/start/.test(x));
        if (st.length) fail('건드리면 안 되는 사람에게 로그인 길이 열림([2] 10)', `${tag} ${st.join(' | ')}`);
        if (nm.includes('처음') && p._kk.length) fail('처음 온 사람인데 서버 확인이 나감([2] 10)', `${tag} ${p._kk.join(' | ')}`);
      }
      bump('조용한 로그인 맞댐');
    } finally { await done(p); }
  }
}
/** 켜짐 — 영어(?lang=en) · 글상자 카드 미리보기와 카드 글 */
async function kakaoEnglish(W_, H_) {
  const tag = `${W_}×${H_} 켜짐 · 영어 카드`, p = await newPage(W_, H_, {kakao: 'on', en: true}); EN_PAGE.add(p);
  try {
    await p.goto(base + NEXT + '&lang=en#/w/' + CODE, {waitUntil: 'domcontentloaded'});
    await p.waitForFunction(() => document.documentElement.lang === 'en' && document.querySelectorAll('#view .acts button').length >= 2, null, {timeout: 30000});
    await kkLoad(p); await p.waitForTimeout(300);
    await p.locator('#view .acts button').nth(1).click();
    try { await p.waitForSelector(DLG, {state: 'visible', timeout: 10000}); await p.waitForSelector('.ps-dlg .ps-kk:not([hidden])', {timeout: 8000}); } catch { fail('영어로 켜짐인데 글상자 · 카드 미리보기가 안 나옴', tag); return; }
    await p.waitForTimeout(300); // 엔진이 그려진 글을 바꾸는 사이
    const k = await p.evaluate(READK);
    if (/[가-힣]/.test(k.text)) fail('영어 카드 미리보기에 한글이 남음', `${tag} 「${k.text.replace(/\s+/g, ' ').slice(0, 120)}」`);
    if (JSON.stringify(k.btns) !== JSON.stringify(['Start with Kakao', 'Just look'])) fail('영어 카드 단추 이름', `${tag} ${JSON.stringify(k.btns)}`);
    const miss = await p.evaluate(() => window.__atlasI18n?.missing?.() ?? []); if (miss.length) fail('영어 사전에 없는 틀', `${tag} ${JSON.stringify(miss).slice(0, 200)}`);
    await layout(p, DLG, tag);
    await p.locator(DLG + ' .ps-go').click();
    await p.waitForFunction(() => window.__kcards.length >= 1, null, {timeout: 8000}).catch(() => fail('카드가 안 나감', tag));
    const c = (await p.evaluate(() => window.__kcards))[0];
    if (c) {
      if (JSON.stringify(c.buttons.map(b => b.title)) !== JSON.stringify(['Start with Kakao', 'Just look'])) fail('영어 카드 단추 글', `${tag} ${JSON.stringify(c.buttons.map(b => b.title))}`);
      const first = String(c.content.description).split('\n')[0];
      if (/[가-힣]/.test(first)) fail('영어 카드 글(첫 줄)에 한글', `${tag} 「${first}」`);
      if (!/Price on/.test(c.content.description)) fail('영어 카드 글에 보낸 날 값', `${tag} 「${c.content.description}」`);
      if (/[가-힣]/.test(c.content.title) && !/^[가-힣]/.test(c.content.title)) fail('영어 카드 제목', `${tag} 「${c.content.title}」`);
      bump('보낸 카드');
    }
    errsOf(p, tag);
  } finally { await done(p); }
}
/** 꺼짐 — NX.kakao 그대로 · 카카오 코드를 불러 둠(스위치 꺼짐) 둘 다: 카카오 글 0 · 요청 0 · script 0 · 공유 창 · 기록 파일 */
async function kakaoOff(W_, H_, deep) {
  for (const variant of ['none', 'off']) {
    const tag = `${W_}×${H_} 카톡 꺼짐(${variant === 'none' ? 'NX.kakao 그대로' : '카카오 코드를 불러 둠'})`, p = await newPage(W_, H_, {kakao: variant === 'off' ? 'off' : 'none'});
    try {
      await p.goto(base + NEXT + '#/w/' + CODE, {waitUntil: 'domcontentloaded'});
      const b = p.locator('#view .acts button', {hasText: /^보내기$/}); await b.first().waitFor({timeout: 30000});
      if (variant === 'off') {
        await kkLoad(p);
        const st = await p.evaluate(async () => { const K = NX.kakao; await K.ready(); return {on: K.on, member: K.member(), can: K.canSend(), sdk: await K.sdkReady(), start: K.start('#/s/x'), offer: await K.offer('journal'), wd: await K.withdraw()}; });
        if (st.on || st.member || st.can || st.sdk || st.start || st.offer || st.wd) fail('꺼져 있어야 하는데 켜짐', `${tag} ${JSON.stringify(st)}`);
      }
      const scripts0 = await p.evaluate(() => document.scripts.length), ui0 = await p.evaluate(KKUI);
      if (ui0.kk || ui0.offer || ui0.link || ui0.btn) fail('꺼짐인데 화면에 카카오 칸 · 단추 · 고리', `${tag} ${JSON.stringify(ui0)}`);
      if (!(await openBox(p, () => b.first().click(), tag))) continue;
      await p.waitForTimeout(900); // 켜졌다면 카드 미리보기가 나올 만한 시간
      const ui = await p.evaluate(KKUI);
      if (ui.kk || ui.offer || ui.link || ui.btn) fail('꺼짐인데 글상자에 카카오 칸 · 단추 · 고리', `${tag} ${JSON.stringify(ui)}`);
      if (ui.scripts !== scripts0) fail('꺼짐인데 script 가 늘어남([12] 2 — 카카오 도구 0)', `${tag} ${scripts0} → ${ui.scripts}`);
      if (await p.evaluate(() => typeof globalThis.Kakao !== 'undefined')) fail('꺼짐인데 카카오 도구가 올라와 있음', tag);
      await sendQuick(p, 0, tag);
      const d = await waitShared(p, 1, tag);
      if (d && (!URL_RE.test(d.url ?? '') || lines(d)[0] !== HEADLINE() || lines(d)[1] !== QUICK[0])) fail('꺼짐 — 공유 창에 이름 · 그날 값 + 글 + 주소', `${tag} 「${d.text}」 「${d.url}」`);
      if (variant === 'off' && deep) {
        // 기록 파일 — 요청 0 · 넷만 · 내 돈 칸 없음
        await p.evaluate(() => { localStorage.setItem('atlas:godori-money', JSON.stringify({total: 987654321, mark: 'MONEYMARK'})); localStorage.setItem('atlas:new:sub', JSON.stringify(['005930'])); localStorage.setItem('atlas:new:hist', JSON.stringify(['HISTMARK'])); localStorage.setItem('atlas:godori-why', JSON.stringify([{at: '2026-10-01T00:00:00.000Z', code: '005930', name: '가'}])); });
        const r0 = p._reqs;
        const [dl, r] = await Promise.all([p.waitForEvent('download', {timeout: 8000}).catch(() => null), p.evaluate(() => NX.kakao.exportFile())]);
        if (!dl || !r?.ok) fail('기록 파일이 안 받아짐(꺼져 있어도 늘 됨)', `${tag} ${JSON.stringify(r)}`);
        else {
          const txt = await fs.readFile(await dl.path(), 'utf8'); let j = null; try { j = JSON.parse(txt); } catch {}
          if (!/^[a-z]+-records-\d{4}-\d{2}-\d{2}\.json$/.test(dl.suggestedFilename())) fail('기록 파일 이름', `${tag} ${dl.suggestedFilename()}`);
          if (!j || j.schema !== 'godori-device-records-1' || JSON.stringify(Object.keys(j.keys).sort()) !== JSON.stringify(['atlas:godori-why', 'atlas:new:sub'])) fail('기록 파일 속 열쇠(넷 가운데 있는 것만)', `${tag} ${j ? Object.keys(j.keys) : txt.slice(0, 80)}`);
          if (/MONEYMARK|HISTMARK|godori-money|new:hist/.test(txt)) fail('기록 파일에 내 돈 칸 · 본 기록이 들어감([9])', tag);
        }
        if (p._reqs !== r0) fail('기록 파일을 받는데 망 요청이 나감(요청 0)', `${tag} ${r0} → ${p._reqs}`);
        bump('기록 파일 맞댐');
      }
      errsOf(p, tag);
    } finally { await done(p); }
  }
  // 친구 주소 + 매매일지 끝 — 꺼짐이면 권유 칸 없음 · 요청 0
  const tag = `${W_}×${H_} 카톡 꺼짐 · 친구 주소 → 매매일지 끝`, p = await newPage(W_, H_, {kakao: 'off'});
  try {
    await p.goto(base + NEXT + CASE0(), {waitUntil: 'domcontentloaded'});
    await p.waitForFunction(() => !!document.querySelector('#view .ps-top') && !document.querySelector('#view .boot'), null, {timeout: 30000});
    await kkLoad(p); await spyOffer(p);
    if (!(await finishWhy(p, '이익이 줄어서', tag))) return;
    await p.waitForTimeout(900);
    const ui = await p.evaluate(KKUI), calls = await p.evaluate(() => window.__offerCalls);
    if (ui.kk || ui.offer || ui.link || ui.btn) fail('꺼짐인데 매매일지 끝에 카카오 칸', `${tag} ${JSON.stringify(ui)}`);
    if (JSON.stringify(calls) !== JSON.stringify(['journal'])) fail('offer(\'journal\') 는 끝낸 뒤 정확히 한 번(꺼져도 부름 · 아무 일 없음)', `${tag} ${JSON.stringify(calls)}`);
    errsOf(p, tag);
  } finally { await done(p); }
}

/* ⑪ 카톡 단추(사장님 2026-10-18 16:39 「진화가 본질인 명령문」 [6] 1 ~ 8 · [7] 1 ~ 5 · 7 · 일꾼 KB1)
   share-btn.js 단추를 줄 고리(<a>) 안에 넣어 그림(줄 = 회사 · 단추 = 보내기가 가장 엉키기 쉬운 자리) → 모양 · 누름 · 글상자 · 빠른 말 → 카톡 친구 고르기(가짜 도구 sendDefault) · 누름 수 · 보던 자리 · 폭죽 0 · 급등 반값 한 줄 */
const KK_NAV = '#/kk-test-row'; // 시험 줄 고리 주소 — 단추 누름이 고리로 새면 주소가 이리로 바뀜
const KK_OUT = {}; // 결과 파일 kk(누름 수 · 간 길)
const kkOf = kind => ({code: CODE, name: CO.c.name, price: CO.c.price, day: CO.c.priceDate, kind});
/** 시험 줄 하나를 #view 끝에 그림 — <ul.clist#id><li><a.crow href=KK_NAV><b>이름</b><button.kk-btn></a> · 단추 모양을 재어 돌려줌(못 만들면 null) */
async function kkRow(p, o, id) {
  return p.evaluate(async ([o, id, nav]) => {
    const m = await import('/next/share-btn.js');
    const b = m.shareButtons(o, {kakao: true}); if (!b) return null;
    const ul = document.createElement('ul'), li = document.createElement('li'), a = document.createElement('a'), nm = document.createElement('b');
    ul.className = 'clist'; ul.id = id; a.className = 'crow'; a.href = nav; nm.className = 'cn'; nm.textContent = o.name ?? o.code;
    a.append(nm, b); li.append(a); ul.append(li); document.querySelector('#view').append(ul);
    b.scrollIntoView({block: 'center'});
    const r = b.getBoundingClientRect(), path = b.querySelector('svg.kk-ic .kk-b');
    return {w: r.width, h: r.height, fill: path ? getComputedStyle(path).fill : null, label: b.getAttribute('aria-label'), kk: b.dataset.kk, kind: b.dataset.kind, text: b.textContent.trim(), tag: b.tagName, type: b.type, inLink: !!b.closest('a')};
  }, [o, id, KK_NAV]);
}
/** 보던 자리 — 보던 줄(#kk-a)이 화면 어디에 있나 + 주소 · scrollY 는 참고만(2026-10-19 22시 전체 검사 share 걸림: 360×640 2911 → 2881)
 *  scrollY 만 재면 글꼴이 늦게 와 위쪽 높이가 바뀔 때 브라우저가 보던 줄을 제자리에 두려고 scrollY 를 옮긴 것(눈에는 그대로)까지 걸림 —
 *  390×844 에서 글꼴을 1.5초 늦추면 scrollY 2744 → 2639 · 보던 줄은 화면 613 그대로(scratchpad shift/probe.mjs) · 그래서 눈에 보이는 자리(줄의 화면 위치)로 잼 */
const AT = () => ({y: Math.round(scrollY), hash: location.hash, top: Math.round(document.querySelector('#kk-a')?.getBoundingClientRect().top ?? NaN)});
/** 글꼴이 다 올 때까지 — 늦게 온 글꼴이 줄을 바꿔 맨 아래에서 보던 자리가 밀리는 것은 보내기와 상관없는 일(지도 못 한 것 · 원칙 87) · 보내기 앞에 기다림 */
const FONTS_DONE = async p => { await p.evaluate(async () => { await document.fonts.ready; await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r))); await document.fonts.ready; }); await p.waitForTimeout(120); };
/** 보낸 카드(가입 꺼짐 · 공유만 켜짐) — feed · 제목 = 이름 · 글 = 말 (+ 반값 한 줄) + 보낸 날 값 · 단추 「열어 보기」 하나 = 보낸 주소 · 수익 숫자 0 */
function kkCard(c, msg, half, tag) {
  if (!c) return;
  const see = c.content?.link?.webUrl, m = URL_RE.exec(see ?? '');
  if (c.objectType !== 'feed') fail('카드 꼴(feed)', `${tag} ${c.objectType}`);
  if (!m || m[1] !== CODE || m[2] !== CO.c.priceDate || +m[3] !== Math.round(CO.c.price) || m[4] !== 's' || !m[5] || unb64(m[5]) !== msg) fail('카드 누르기 주소(#/s/ 종목 · 날 · 값 · 말)', `${tag} 「${see}」`);
  if (c.content?.title !== CO.c.name) fail('카드 제목 = 종목 이름([7] 5)', `${tag} 「${c.content?.title}」`);
  const want = [msg, half, md(CO.c.priceDate) + ' 값 ' + num(Math.round(CO.c.price)) + '원'].filter(Boolean).join('\n');
  if (c.content?.description !== want) fail('카드 글 = 보낸 사람 말 + (반값 한 줄) + 보낸 날 값([7] 5 · [6] 8)', `${tag} 「${c.content?.description}」 ≠ 「${want}」`);
  const bs = c.buttons ?? [];
  if (!SIGNUP_ON && (bs.length !== 1 || bs[0]?.title !== OPEN_BTN || bs[0]?.link?.webUrl !== see || bs[0]?.link?.mobileWebUrl !== see)) fail('가입이 꺼졌을 때 카드 단추 = 「열어 보기」 하나 · 보낸 주소([7] 5)', `${tag} ${JSON.stringify(bs).slice(0, 200)}`);
  if (/[%％]|퍼센트|1등|1위|급등/.test(JSON.stringify(c).replace(/%[0-9A-F]{2}/g, '')) || W.gainHits(c.content?.title + '\n' + c.content?.description).length) fail('카드에 수익 숫자 · 퍼센트 · 1등 · 급등', `${tag} 「${c.content?.description}」`);
  bump('보낸 카드');
}
async function kkButton(W_, H_) {
  const tag = `${W_}×${H_} 카톡 단추 · 공유만 켜짐(가짜 도구 · 가입 꺼짐)`, p = await newPage(W_, H_, {kakao: 'share'});
  try {
    await p.goto(base + NEXT + '#/w/' + CODE, {waitUntil: 'domcontentloaded'});
    await p.locator('#view .acts button').first().waitFor({timeout: 30000}); await kkLoad(p);
    const sw = await p.evaluate(() => ({share: NX.kakao.share, on: NX.kakao.on}));
    if (sw.share !== true || sw.on !== false) fail('시험 준비 — 공유만 켜진 상태가 아님([7] 1 스위치 둘)', `${tag} ${JSON.stringify(sw)}`);
    const m = await kkRow(p, kkOf('share'), 'kk-a');
    if (!m) { fail('카톡 단추를 못 만듦(shareButtons → null)', tag); return; }
    const kkSide = await p.evaluate(() => document.documentElement.classList.contains('white')) ? 48 : 44; // 흰 판은 새 단추 48(사장님 2026-10-19 02:03 [검사] 5 「새 단추는 48px」 — [6] 1 의 44 보다 뒤 말씀)
    if (Math.round(m.w) !== kkSide || Math.round(m.h) !== kkSide) fail(`카톡 단추 ${kkSide} × ${kkSide} 아님([6] 1 · 흰 판 48)`, `${tag} ${m.w}×${m.h}`);
    if (m.fill !== 'rgb(254, 229, 0)') fail('노란 말풍선 아님([6] 1)', `${tag} ${m.fill}`);
    if (m.label !== CO.c.name + ' 카톡으로 보내기' || m.kk !== CODE || m.kind !== 'share' || m.text || m.tag !== 'BUTTON' || m.type !== 'button' || !m.inLink) fail('카톡 단추 꼴(이름표 · 번호 · 글 없음 · button · 고리 안에 둠)', `${tag} ${JSON.stringify(m)}`);
    await FONTS_DONE(p);
    const at0 = await p.evaluate(AT);
    // 누름 1 — 카톡 단추(손가락) → 글상자 · 쪽 그대로 · 아직 안 보냄 · 이름 · 오늘 값이 저절로
    let taps = 0;
    await p.locator('#kk-a .kk-btn').tap(); taps++;
    try { await p.waitForSelector(DLG, {state: 'visible', timeout: 10000}); } catch { fail('카톡 단추를 눌러도 글상자가 안 열림([6] 3)', tag); return; }
    const at1 = await p.evaluate(AT), s = await p.evaluate(READD);
    if (at1.hash !== at0.hash) fail('카톡 단추가 줄 고리로 감(쪽이 바뀜 [6] 6)', `${tag} ${at0.hash} → ${at1.hash}`);
    if (await p.evaluate(SENT_ANY, {s: 0, c: 0, k: 0})) fail('카톡 단추 한 번에 벌써 보냄(글상자를 건너뜀)', tag);
    if (s.h !== HEAD) fail('글상자 이름(원문)', `${tag} 「${s.h}」`);
    if (!s.desc.includes(CO.c.name) || !s.desc.includes(num(CO.c.price) + '원') || !s.desc.includes(md(CO.c.priceDate))) fail('글상자에 종목 이름 · 오늘 값이 저절로 안 들어감([6] 3)', `${tag} 「${s.desc}」`);
    if (s.ta !== '') fail('글상자 글칸이 처음부터 차 있음(칠 것 0 — 빠른 말 · 기본 말로 감)', `${tag} 「${s.ta}」`);
    try { await p.waitForSelector('.ps-dlg .ps-kk:not([hidden])', {timeout: 8000}); } catch { fail('공유가 켜졌는데 카드 미리보기가 안 나옴', tag); }
    const k = await p.evaluate(READK);
    if (k && !SIGNUP_ON && JSON.stringify(k.btns) !== JSON.stringify([OPEN_BTN])) fail('가입이 꺼졌을 때 카드 미리보기 단추 = 「열어 보기」 하나([7] 5)', `${tag} ${JSON.stringify(k.btns)}`);
    if (k && !SIGNUP_ON && new RegExp(BTN_START + '|' + BTN_SEE).test(k.text)) fail('가입이 꺼졌는데 가입 단추 · 안내가 보임([7] 5)', tag);
    await layout(p, DLG, tag + ' 글상자');
    // 누름 2 — 빠른 말(손가락) = 바로 카톡 친구 고르기(가짜 도구 sendDefault)
    await sendQuick(p, 0, tag, {tap: true}); taps++;
    const c = await p.evaluate(() => (window.__kcards ?? [])[0] ?? null);
    if (!c) fail('누름 두 번에 카톡 친구 고르기가 안 뜸([6] 4)', `${tag} 누름 ${taps}`);
    kkCard(c, QUICK[0], '', tag);
    if ((await shared(p)).length || (await copied(p)).length) fail('카드를 보냈는데 휴대폰 공유 창 · 복사도 함', tag);
    KK_OUT.taps = taps; KK_OUT.picker = !!c;
    // 보낸 뒤 — 글상자 닫힘 · 보던 자리 · 주소 그대로 · 폭죽 0([6] 7)
    try { await p.waitForSelector(DLG, {state: 'detached', timeout: 4000}); } catch { fail('카드를 보낸 뒤 글상자가 안 닫힘', tag); }
    await p.waitForTimeout(250);
    const at2 = await p.evaluate(() => ({y: Math.round(scrollY), hash: location.hash, top: Math.round(document.querySelector('#kk-a')?.getBoundingClientRect().top ?? NaN), fx: document.querySelectorAll('canvas, [class*="confetti"], [class*="firework"], [class*="fx-"]').length, open: document.documentElement.classList.contains('ps-open'), toast: [...document.querySelectorAll('.ps-toast')].map(e => e.textContent).join(' ')}));
    if (at2.hash !== at0.hash || !Number.isFinite(at0.top) || Math.abs(at2.top - at0.top) > 1) fail('보낸 뒤 보던 자리가 바뀜([6] 7)', `${tag} ${at0.hash} 보던 줄 화면 ${at0.top} → ${at2.hash} ${at2.top} · scrollY ${at0.y} → ${at2.y}`);
    if (at2.fx || at2.open) fail('보낸 뒤 폭죽 · 그림판 · 잠긴 화면이 남음([6] 7)', `${tag} ${JSON.stringify(at2)}`);
    const fw = (typeof W.ruinHits === 'function' ? W.ruinHits(at2.toast) : []).filter(x => x.key === 'reward');
    if (fw.length || /[🎉🎊🎆🎇]|축하/u.test(at2.toast)) fail('보낸 뒤 축하 · 폭죽 글([6] 7 — 없어야 함)', `${tag} 「${at2.toast}」`);
    KK_OUT.after = {y: at0.y, top: at0.top, sameSpot: at2.hash === at0.hash && Math.abs(at2.top - at0.top) <= 1, fireworks: at2.fx + fw.length};
    if (!(at0.y > 0)) fail('검사 준비 — 시험 줄이 화면 맨 위라 「보던 자리」를 못 잼', `${tag} y ${at0.y}`);
    bump('카톡 단추 맞댐');
    // 급등([6] 8) — 반값 파일 없음 · 깨짐 · 있음(사이트 자료 그대로)
    const real = await getJ('/next/data/half36.json').catch(() => null);
    let variant = 'missing';
    await p.route('**/next/data/half36.json', r => (variant === 'missing' ? r.fulfill({status: 404, body: ''}) : variant === 'broken' ? r.fulfill({status: 200, contentType: 'application/json', body: '{"n": 18, "of": 3'}) : r.fallback()));
    if (!(await kkRow(p, kkOf('surge'), 'kk-s'))) { fail('급등 카톡 단추를 못 만듦', tag); return; }
    KK_OUT.surge = {};
    for (const v of ['missing', 'broken', 'real']) {
      variant = v; const t2 = `${tag} · 급등 · 반값 파일 ${v === 'missing' ? '없음' : v === 'broken' ? '깨짐' : '있음'}`;
      const n0 = await p.evaluate(() => window.__kcards.length);
      await p.locator('#kk-s .kk-btn').tap();
      try { await p.waitForSelector(DLG, {state: 'visible', timeout: 10000}); await p.waitForSelector('.ps-dlg .ps-kk:not([hidden])', {timeout: 8000}); } catch { fail('급등 카톡 단추 — 글상자 · 카드 미리보기가 안 열림', t2); continue; }
      const want = v === 'real' ? halfWant(real) : '';
      const pv = await p.evaluate(() => ({box: document.querySelector('.ps-dlg .ps-half')?.textContent ?? '', card: document.querySelector('.ps-dlg .ps-card-h')?.textContent ?? ''}));
      await sendQuick(p, 0, t2, {tap: true});
      const c2 = await p.evaluate(n => window.__kcards[n] ?? null, n0);
      const desc = String(c2?.content?.description ?? '');
      if (!c2) fail('급등 카드가 안 나감', t2);
      else if (want) { if (!pv.box.includes(want) || pv.card !== want) fail('급등 글상자 · 카드 미리보기에 반값 한 줄이 없음([6] 8)', `${t2} ${JSON.stringify(pv)}`); kkCard(c2, QUICK[0], want, t2); }
      else if (/반값/.test(desc + pv.box + pv.card)) fail('반값 파일이 없는데 그 줄이 나감(짓지 않음 [6] 8)', `${t2} 「${desc}」`);
      else kkCard(c2, QUICK[0], '', t2);
      KK_OUT.surge[v] = {line: c2 ? desc.split('\n').find(x => /반값/.test(x)) ?? null : '?', want: want || null};
      await p.waitForSelector(DLG, {state: 'detached', timeout: 4000}).catch(() => fail('급등 카드를 보낸 뒤 글상자가 안 닫힘', t2));
      bump('급등 반값 맞댐');
    }
    p._errs = p._errs.filter(e => !/half36\.json/.test(e)); // 일부러 404 로 바꿔치기한 반값 파일 한 줄만 봐줌
    // 고른 곳(회사 파일에 c 가 없고 값이 comp.json 에만 있는 곳 — #/f/pick · #/today 첫 줄들 · 일꾼 KB2 알림) — 번호만 넘겨도 글상자에 이름 · 오늘 값이 저절로([6] 3) · 친구가 연 쪽 오늘 값도
    const CP = await getJ('/atlas/data/comp.json').catch(() => null);
    const pick = Object.entries(CP?.companies ?? {}).find(([k, v]) => /^[0-9A-Z]{6}$/.test(k) && Number(v?.price) > 0 && /^\d{4}-\d{2}-\d{2}/.test(String(v?.priceDate ?? '')) && v?.name);
    if (!pick) fail('검사 준비 — 고른 곳 파일(comp.json)에서 값이 있는 곳을 못 찾음', tag);
    else {
      const [pc, pv] = pick, pDay = String(pv.priceDate).slice(0, 10), t3 = `${tag} · 고른 곳 ${pc}`;
      const noC = await getJ('/atlas/data/co/' + pc + '.json').then(j => !j?.c).catch(() => true);
      if (!(await kkRow(p, {code: pc, kind: 'share'}, 'kk-p'))) fail('고른 곳 카톡 단추를 못 만듦', t3); // 이름 · 값 · 날 없이 번호만(가장 적게 넘기는 줄)
      else {
        await p.locator('#kk-p .kk-btn').tap();
        let s3 = null;
        try { await p.waitForSelector(DLG, {state: 'visible', timeout: 10000}); s3 = await p.evaluate(READD); } catch { fail('고른 곳 — 카톡 단추를 눌러도 글상자가 안 열림', t3); }
        if (s3 && (!s3.desc.includes(pv.name) || !s3.desc.includes(num(pv.price) + '원') || !s3.desc.includes(md(pDay)))) fail('고른 곳 — 글상자에 이름 · 오늘 값이 저절로 안 들어감([6] 3 · comp.json)', `${t3} 「${s3.desc}」`);
        if (s3) { await p.keyboard.press('Escape'); await p.waitForSelector(DLG, {state: 'detached', timeout: 4000}).catch(() => fail('Esc 로 안 닫힘(고른 곳)', t3)); }
        // 친구가 연 쪽 — 오늘 값이 「?」가 아니고 comp.json 값(보낸 날 = 그날이면 「보낸 날과 같아요」)
        await p.goto(base + NEXT + `#/s/${pc}/${pDay}/${Math.round(pv.price)}/s/` + b64(QUICK[0]), {waitUntil: 'domcontentloaded'});
        let L3 = null;
        try { await p.waitForFunction(() => !!document.querySelector('#view .ps-vals') && !document.querySelector('#view .boot'), null, {timeout: 30000}); L3 = await p.evaluate(READL); } catch { fail('고른 곳 — 친구가 연 쪽이 안 열림', t3); }
        const nowV = L3?.vs?.find(x => x.k === NOW_LBL);
        if (L3 && (!nowV || nowV.n !== num(pv.price) + '원' || !String(L3.name).includes(pv.name))) fail('고른 곳 — 친구가 연 쪽 이름 · 오늘 값(comp.json)', `${t3} ${JSON.stringify({name: L3.name, now: nowV})}`);
        KK_OUT.pick = {code: pc, noC, box: s3?.desc ?? null, now: nowV?.n ?? null};
        bump('고른 곳 맞댐');
      }
    }
    errsOf(p, tag);
  } finally { await done(p); }
}
/* 네 곳 흉내([7] 7) — 카톡 안 화면 · 아이폰 · 안드로이드 · 컴퓨터(사용자 에이전트 · 화면 · 손가락 · 휴대폰 공유 창 있음/없음) × 공유 열쇠 있음(가짜 카카오 도구)/없음
   곳마다 카톡 단추부터 누름 수 · 간 길(kakao = 카톡 친구 고르기 · share = 휴대폰 공유 창 · copy = 글 + 주소 복사)을 결과 envs 에 적음 · 진짜 폰 · 진짜 카카오는 잴 수 없어 real = 「?」 */
const ENVS = [
  {id: 'kakaotalk', name: '카톡 안에서 연 화면(안드로이드 카톡 속 창 · 휴대폰 공유 창 없음)', w: 360, h: 640, touch: true, mobile: true, share: false,
    ua: 'Mozilla/5.0 (Linux; Android 14; SM-S921N Build/UP1A.231005.007; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/129.0.6668.100 Mobile Safari/537.36;KAKAOTALK 2410520'},
  {id: 'iphone', name: '아이폰(사파리 · 휴대폰 공유 창 있음)', w: 390, h: 844, touch: true, mobile: true, share: true,
    ua: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.6 Mobile/15E148 Safari/604.1'},
  {id: 'android', name: '안드로이드(크롬 · 휴대폰 공유 창 있음)', w: 360, h: 780, touch: true, mobile: true, share: true,
    ua: 'Mozilla/5.0 (Linux; Android 14; SM-S921N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Mobile Safari/537.36'},
  {id: 'desktop', name: '컴퓨터(크롬 · 공유 창 없음)', w: 1280, h: 800, touch: false, mobile: false, share: false,
    ua: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36'},
];
const ENV_OUT = [];
async function envCheck() {
  for (const E of ENVS) for (const key of [true, false]) {
    const tag = `네 곳 · ${E.name} · 공유 열쇠 ${key ? '있음(가짜 카카오 도구)' : '없음'}`;
    const want = key ? 'kakao' : E.share ? 'share' : 'copy';
    const row = {env: E.id, name: E.name, key, want, path: null, taps: 0, picker: false, real: '?'};
    const p = await newPage(E.w, E.h, {mode: E.share ? 'share' : 'copy', kakao: key ? 'share' : 'none', ua: E.ua, touch: E.touch, mobile: E.mobile});
    try {
      await p.goto(base + NEXT + '#/w/' + CODE, {waitUntil: 'domcontentloaded'});
      await p.locator('#view .acts button').first().waitFor({timeout: 30000});
      if (key) await kkLoad(p);
      if (!(await kkRow(p, kkOf('share'), 'kk-e'))) { fail('카톡 단추를 못 만듦', tag); continue; }
      const h0 = await p.evaluate(() => location.hash), btn = p.locator('#kk-e .kk-btn');
      if (E.touch) await btn.tap(); else await btn.click();
      row.taps++;
      try { await p.waitForSelector(DLG, {state: 'visible', timeout: 10000}); } catch { fail('카톡 단추를 눌러도 글상자가 안 열림', tag); continue; }
      if (key) { try { await p.waitForFunction(() => globalThis.NX?.kakao?.canSend?.() === true, null, {timeout: 8000}); } catch { fail('공유 열쇠가 있는데 카카오 도구가 안 켜짐', tag); } }
      await sendQuick(p, 0, tag, {tap: E.touch}); row.taps++;
      const got = await p.evaluate(() => ({k: (window.__kcards ?? []).length, s: window.__shared.length, c: window.__copied.length, show: !!document.querySelector('.ps-dlg .ps-show:not([hidden])')}));
      row.path = got.k ? 'kakao' : got.s ? 'share' : got.c ? 'copy' : got.show ? 'show' : null;
      row.picker = row.path === 'kakao';
      if (row.path !== want) fail('네 곳 흉내 — 간 길이 다름([7] 3 · 4 — 열쇠 있음 = 카톡 친구 고르기 · 없음 = 휴대폰 공유 창 → 글 + 주소 복사)', `${tag} ${row.path} ≠ ${want}`);
      if (row.path === 'kakao') kkCard(await p.evaluate(() => window.__kcards[0]), QUICK[0], '', tag);
      if (row.path === 'share' || row.path === 'copy') {
        const t = row.path === 'share' ? (await shared(p))[0]?.text : (await copied(p))[0];
        if (lines(t)[0] !== HEADLINE() || lines(t)[1] !== QUICK[0]) fail('보낸 글 = 이름 · 오늘 값(저절로) + 빠른 말([6] 3 · 4)', `${tag} 「${t}」`);
      }
      if ((await p.evaluate(() => location.hash)) !== h0) fail('카톡 단추가 줄 고리로 감(쪽이 바뀜 [6] 6)', tag);
      bump('네 곳 흉내');
      errsOf(p, tag);
    } finally { ENV_OUT.push(row); await done(p); }
  }
}

const MSG = '이거 어때? 같이 보자';
const CASES = [
  {name: '보내기', code: CODE, day: SENT_DAY, price: SENT_PRICE, kind: 's', msg: b64(MSG), text: MSG},
  {name: '같이 따져 줘', code: CODE, day: SENT_DAY, price: SENT_PRICE, kind: 'a', msg: b64('같이 따져 줘'), text: '같이 따져 줘', why: '파는 물건이 덜 팔려서'},
  {name: '기록과 다른 값', code: CODE, day: SENT_DAY, price: SENT_PRICE + 1000, kind: 's', msg: b64('나는 이렇게 봤어'), text: '나는 이렇게 봤어'},
  {name: '거르는 말이 든 주소', code: CODE, day: SENT_DAY, price: SENT_PRICE, kind: 's', msg: b64('지금 사세요'), text: '지금 사세요', hide: '거르는 말'},
  {name: '깨진 말', code: CODE, day: SENT_DAY, price: SENT_PRICE, kind: 's', msg: 'A', hide: '깨져서'},
  {name: '이상한 주소', code: 'ABC', day: SENT_DAY, price: SENT_PRICE, bad: true},
];
const SIZES = [[360, 640], [390, 844]].filter(([w]) => !arg('--w', null) || String(w) === String(arg('--w', null))); // --w 360 = 한 폭만(고치는 동안)
const step = async (tag, f) => { try { await f(); } catch (e) { fail('검사 길이 멈춤', tag + ' · ' + String(e?.message ?? e).split('\n')[0]); } };
for (const [w, h] of SIZES) {
  const full = ALL || w === 360;
  if (want('co')) await step(`${w}×${h} 회사 글상자`, () => companyBox(w, h, full));
  if (full) {
    if (want('fb')) await step(`${w}×${h} 복사 · 보여 줌`, () => fallbacks(w, h));
    if (want('nd')) await step(`${w}×${h} 대화창 없는 기계`, () => noDialogBox(w, h));
    if (want('en')) await step(`${w}×${h} 영어`, () => englishBox(w, h));
    if (want('en') && w === 360) await step(`${w}×${h} 영어 소개 쪽 · 사전 늦음`, () => slowDictBox(w, h));
    if (want('ent')) await step(`${w}×${h} 다른 입구`, () => otherEntries(w, h));
  }
  if (want('land')) await step(`${w}×${h} 친구 주소`, () => landing(w, h, full ? CASES : CASES.slice(0, 1)));
  if (want('land')) await step(`${w}×${h} 친구 쪽 첫 화면`, () => firstView(w, h, {only: full ? 0 : 1}));
  if (want('land') && w === 360) await step('320×568 친구 쪽 첫 화면', () => firstView(320, 568, {min: 2, only: 1}));
  if (want('off') && !SIGNUP_ON) await step(`${w}×${h} 카톡 꺼짐`, () => kakaoOff(w, h, full));
  if (want('off') && SIGNUP_ON) bump('카톡 꺼짐 길 건너뜀(가입 스위치 켜짐 · 켜짐 길은 아래에서 그대로 검사)');
  // 켜짐 길은 시험 서버(127.0.0.1 · localhost)에서만 — kakao.js 는 실제 사이트에서 시험 표시(__GODORI_KAKAO_TEST__)를 보지 않고 스위치만 봄(카톡 꺼짐 · 보안)
  //   그래서 실제 사이트(https://aaa7377.com)에서는 켤 수 없어 늘 걸렸음(2026-10-18 실제 사이트 검사) → 건너뛰고 수만 적음 · 올리기 전 검사(local)는 그대로 모두 봄
  const on = k => !LIVE_SITE && (want('on') || want(k));
  if (LIVE_SITE) bump('켜짐 길 건너뜀(실제 사이트 — 시험 서버에서만 켤 수 있음)');
  if (!LIVE_SITE && want('kk') && full) await step(`${w}×${h} 카톡 단추 · 공유만 켜짐`, () => kkButton(w, h)); // [6] · [7] — 일꾼 KB1 · 공유 시험 표시는 시험 서버에서만 읽힘
  if (!LIVE_SITE && want('env') && w === 360) await step('네 곳 흉내(카톡 안 · 아이폰 · 안드로이드 · 컴퓨터)', () => envCheck()); // [7] 7 — 한 번만(곳마다 제 화면 크기)
  if (on('card')) await step(`${w}×${h} 카톡 켜짐 · 카드`, () => kakaoCard(w, h, full));
  if (on('offer')) await step(`${w}×${h} 카톡 켜짐 · 권유`, () => kakaoOffer(w, h));
  if (full && on('ret')) await step(`${w}×${h} 카톡 켜짐 · 돌아옴 · 조용한 로그인`, () => kakaoReturn(w, h));
  if (full && on('enk')) await step(`${w}×${h} 카톡 켜짐 · 영어`, async () => { await kakaoEnglish(w, h); await kakaoOffer(w, h, {en: true}); });
}
counts['글씨 크기 가짓수(쪽 전체 · 질문 칸 포함 · 알림용)'] = JSON.stringify(Object.fromEntries(FS_SEEN));
await browser.close();
const secs = Math.round((Date.now() - t0) / 1000);
const out = {schema: 'godori-check-share-1', at: new Date().toISOString(), base, path: NEXT, all: ALL, code: CODE, secs, counts, fails, ok: !fails.length,
  kk: KK_OUT, envs: ENV_OUT, envNote: '네 곳은 브라우저 흉내 + 가짜 카카오 도구(sendDefault 가 불렸는지만 앎) — 진짜 폰 · 진짜 카카오는 잴 수 없어 real = 「?」',
  entries: ['회사 보내기', '회사 ' + ASK_BTN, '시황 보내기', '소개 쪽 친구에게 보내기', '편지 봉인 소식', '편지 초대장', '편지 사장님 새 초대장'], name: NEW_NAME};
if (OUT) { await fs.mkdir(path.dirname(path.resolve(OUT)), {recursive: true}); await fs.writeFile(OUT, JSON.stringify(out, null, 1)); }
console.log(`보내기 검사 · ${secs}초 · ${JSON.stringify(counts)}`);
if (KK_OUT.taps != null) console.log(`카톡 단추 · 누름 ${KK_OUT.taps} 에 카톡 친구 고르기 ${KK_OUT.picker ? '열림(가짜 도구)' : '안 열림'} · 보낸 뒤 ${JSON.stringify(KK_OUT.after ?? {})} · 급등 ${JSON.stringify(KK_OUT.surge ?? {})}`);
if (ENV_OUT.length) console.log('네 곳 흉내 · ' + ENV_OUT.map(r => `${r.env} 열쇠${r.key ? '있음' : '없음'} = ${r.path ?? '?'}(누름 ${r.taps})`).join(' · ') + ' · 진짜 폰 · 진짜 카카오 = ?');
for (const [k, x] of fails.slice(0, 40)) console.log('✗ ' + k + ' — ' + x);
if (MUT) { const miss = MUTS[MUT][1].filter(k => !fails.some(f => f[0] === k)); if (miss.length) { console.log('✗ 검사 자체 시험 — 망가뜨렸는데 못 잡음: ' + miss.join(' · ')); process.exit(1); } console.log(`검사 자체 시험 「${MUT}」 — 잡음(실패 ${fails.length}개 · 기대한 것 모두)`); process.exit(0); }
if (fails.length) process.exit(1);
console.log('실패 0');
