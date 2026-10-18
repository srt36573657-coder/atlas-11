// 소개 영상 「(이름)의 고민」(60초 · 720×1280 · 30fps · 소리 있음) — 사장님 2026-10-18(싱가포르) 16:39 「진화가 본질인 명령문」 [4] 1 ~ 10 · [3] 3
//   [4] 1 「지금 영상(장면 열셋)을 새로 짜라. 길이는 60초 그대로다. 햄릿 독백을 흉내 낸 웃긴 고민극이다.」 · [4] 2 「막 넷, 장면 열이다.」
//   이름은 17:18 「골똘이!」 = site/next/brand.js 한 곳(NAME · VIDEO.title) — 이 파일에 이름 글자를 박지 않음(옛 이름 목록도 brand.js was 에서)
//   옛 1분 판(장면 열셋 · 첨단 차림)은 git f8cfcb1ed 의 이 파일 · 옛 35초 판은 git d4b4bed3
//
//   장면 때와 줄 = 명령문 원문 docs/design/kkolttori-2026-10-18/order-1639.txt [4] 2 를 그대로 읽음(줄바꿈만 빈칸 · 옛 이름은 brand.js 이름으로)
//     ① 0~6 밤 · 높은 가지 끝 · 흰 주름 깃 · 날개를 가슴에 · 글상자 제목 ② 6~14 「날 것이냐 …」 날개를 폈다 접음 ③ 14~22 새 떼가 「…!」 하며 날아오름 · 독백
//     ④ 22~28 몸을 내밀다 미끄러져 꼬리로 매달림 ⑤ 28~32 「잠깐. …」 ⑥ 32~42 질문 카드 열한 장(p-why.js QS) ⑦ 42~48 기록장 · 새 떼가 깃털이 흐트러진 채 돌아옴 · 반값 줄
//     ⑧ 48~54 본질 세 줄을 한 줄씩 ⑨ 54~57 노란 대화 카드가 친구 폰으로 · 「친구야, 왜 사?」 · 상품권 한 줄 ⑩ 57~60 이름 세 번 · 이름 쾅 · 사이트 주소
//     막 넷 = 1막 ①② · 2막 ③④⑤ · 3막 ⑥⑦ · 4막 ⑧⑨⑩ (막이 바뀔 때 막이 반쯤 닫혔다 열림)
//   숫자 · 이름 · 질문은 파일에서([4] 7): 이름 brand.js · 질문 열한 개 p-why.js QS · 「친구야, 왜 사?」 p-why.js · ⑦ n · 36 = site/next/data/half36.json(n · of)
//     · 친구 수 = site/next/app.js HELLO_PROMO · 주소 = site/hello.html og:url — 없거나 꼴이 다르면 멈춤(지어내지 않음)
//   같은 때([4] 4): 독백 한 줄 = 글자마다 앵무새 마디 하나 — 때 표(cues)를 여기서 한 번 만들어 화면(글상자 글자 불 · 부리)과 소리(sound.py)가 같이 씀
//   소리([4] 5): 사람 · 기계 목소리 없음 — 앵무새 마디 · 효과음 · 배경 음악(sound.py 가 계산으로 만듦 · 녹음 없음)
//   굽기 문(스스로 멈춤): 명령문 장면 열 · 때 · 줄 수가 다름 · 사실 파일 없음 · 그린 글에 옛 이름(brand.js was · 홍표 · 막비) · words.js screenHits · ruinHits · gainHits 걸림
//     · 장면 줄이 그린 글에 없음 · 글상자 48px 아래 · 글이 화면 밖으로 넘침 · 다 만든 뒤 길이 60초(±0.05) 아님
//   사람 얼굴 · 해골 · 남의 캐릭터 모양 · 카카오 표시 없음(노란 대화 카드만) · 폭죽 없음 · 앞날 맞히기 · 사고팔기 권함 없음
//   node scripts/atlas11/makbi/video.mjs → site/media/makbi-intro.mp4 · makbi-intro.webm · makbi-poster.jpg(「(이름)의 고민 1분」 = VIDEO.title)
//     HP_T=1.2,2.4 HP_OUT=폴더 → 그 때 그림만 PNG(미리 보기) · HP_POSTER_ONLY=1 → 표지만 · HP_STILLS=폴더 → 다 구운 mp4 에서 장면 사진 열 장(scene-01.png …) + cues.json
import fs from 'node:fs/promises';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import {createRequire} from 'node:module';
import {NAME, BRAND, VIDEO} from '../../../site/next/brand.js';
import {screenHits, ruinHits, gainHits} from '../../../site/next/words.js';

const HERE = path.dirname(new URL(import.meta.url).pathname), ROOT = path.resolve(HERE, '../../..');
const OUT = process.env.HP_OUT ?? path.join(ROOT, 'site/media');
const TMP = process.env.HP_TMP ?? '/tmp/makbi-video';
const ONLY = process.env.HP_T ? process.env.HP_T.split(',').map(Number) : null;
const STILLS = process.env.HP_STILLS ? path.resolve(process.env.HP_STILLS) : null;
const require = createRequire('/opt/node-tools/');
const {chromium} = require('playwright');
const exe = '/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell';
const drawSrc = (await fs.readFile(path.join(HERE, 'draw.mjs'), 'utf8')).replace(/^export /gm, '');
const W = 720, H = 1280, FPS = 30, DUR = 60;
await fs.mkdir(OUT, {recursive: true}); await fs.mkdir(TMP, {recursive: true});

// ── 사실 읽기(박지 않음) ──
const stop = m => { console.error('멈춤: ' + m); process.exit(1); };
const rd = p => fs.readFile(path.join(ROOT, p), 'utf8');
const ORDER_FILE = 'docs/design/kkolttori-2026-10-18/order-1639.txt';
const ORD = await rd(ORDER_FILE);
const OLD = BRAND.was.map(w => w.ko).filter(Boolean);
const renamed = s => OLD.reduce((x, w) => x.split(w).join(NAME), s);
const s4 = ORD.slice(ORD.indexOf('[4 ·'), ORD.indexOf('[5 ·'));
const it2 = s4.slice(s4.indexOf('\n2. '), s4.indexOf('\n3. '));
if (!s4 || !it2) stop('명령문 [4] 2 를 못 찾음 — ' + ORDER_FILE);
const flat = renamed(it2.split('\n').map(l => l.trim()).filter(Boolean).join(' ')); // 줄바꿈 = 빈칸(명령문은 빈칸에서만 줄을 바꿈)
const MARK = '①②③④⑤⑥⑦⑧⑨⑩';
const SC = [...flat.matchAll(new RegExp(`([${MARK}])\\s*(\\d+)~(\\d+)초:\\s*(.*?)(?=\\s*[${MARK}]\\s*\\d+~\\d+초:|$)`, 'g'))]
  .map(m => ({n: MARK.indexOf(m[1]) + 1, a: +m[2], b: +m[3], body: m[4], q: [...m[4].matchAll(/「([^」]+)」/g)].map(x => x[1])}));
if (SC.length !== 10 || SC.some((s, i) => s.n !== i + 1 || s.a !== (i ? SC[i - 1].b : 0)) || SC[9].b !== DUR) stop('명령문 장면이 열 · 0~60초 잇달음이 아님: ' + SC.map(s => s.n + ':' + s.a + '~' + s.b).join(' '));
const QN = [1, 1, 2, 1, 1, 1, 2, 3, 2, 1];
SC.forEach((s, i) => { if (s.q.length !== QN[i]) stop(`장면 ${i + 1} 따옴 줄 수 ${s.q.length} — 명령문은 ${QN[i]}`); });

const WHY = await rd('site/next/p-why.js');
const QS = [...(WHY.match(/export const QS = \[([\s\S]*?)\n\];/)?.[1] ?? '').matchAll(/\{q: '([^']+)'/g)].map(m => m[1]);
if (QS.length !== 11) stop('p-why.js QS 질문이 열한 개가 아님: ' + QS.length + '개 — ⑥ 「열한 번 묻자」가 거짓이 됨');
if (!SC[5].q[0].includes('열한')) stop('⑥ 줄에 「열한」이 없음');
if (!WHY.includes(`'${SC[8].q[0]}'`)) stop(`⑨ 「${SC[8].q[0]}」 가 p-why.js 에 없음`);
let H36;
try { H36 = JSON.parse(await rd('site/next/data/half36.json')); } catch { stop('site/next/data/half36.json 없음 · 깨짐 — ⑦ 숫자를 지어내지 않음'); }
if (!(Number.isInteger(H36.n) && Number.isInteger(H36.of) && H36.of > 0 && H36.n >= 0 && H36.n <= H36.of)) stop('half36.json n · of 꼴: ' + H36.n + ' · ' + H36.of);
const FACT0 = SC[6].q[1];
if (!/36곳/.test(FACT0) || !/ n곳/.test(FACT0)) stop('⑦ 반값 줄 꼴이 다름: ' + FACT0);
const FACT = FACT0.replace('36곳', H36.of + '곳').replace(' n곳', ' ' + H36.n + '곳');
const NJS = await rd('site/next/app.js');
const PROMO_SRC = NJS.match(/const HELLO_PROMO = '([^']+)'/)?.[1] ?? stop('HELLO_PROMO(site/next/app.js) 못 찾음');
const FR = Number(PROMO_SRC.match(/^(\d+)명만/)?.[1] ?? stop('친구 수 못 찾음: ' + PROMO_SRC));
if (!/스타벅스/.test(PROMO_SRC) || !/1만원/.test(PROMO_SRC)) stop('상품권 줄이 다름: ' + PROMO_SRC);
if (!/^친구 \d+명마다 /.test(SC[8].q[1])) stop('⑨ 상품권 줄 꼴이 다름: ' + SC[8].q[1]);
const PROMO = SC[8].q[1].replace(/^친구 \d+명마다 /, `친구 ${FR}명마다 `);
const HELLO = await rd('site/hello.html');
const SITE = new URL(HELLO.match(/<meta property="og:url" content="([^"]+)"/)?.[1] ?? stop('hello.html og:url 못 찾음')).host;
const TITLE = SC[0].q[0];
if (VIDEO.title !== TITLE + ' 1분') stop(`brand.js VIDEO.title 「${VIDEO.title}」 ≠ ① 글상자 「${TITLE}」 + 「 1분」`);
if (SC[9].q[0] !== NAME + '!') stop('⑩ 줄이 이름이 아님: ' + SC[9].q[0]);

// ── 때 표(cues) — 화면과 소리가 같이 씀(곧은 시계 하나) ──
const HANGUL = /[가-힣]/;
const PAUSE = {',': 1.3, '.': 2.0, '?': 2.0, '!': 1.6, '…': 2.4, ' ': .35, '"': 0};
const nH = s => [...s].filter(c => HANGUL.test(c)).length;
/** 줄 하나를 [t0, t1] 안에 글자마다 마디로 — 쉼표 · 마침표에서 쉼 · 끝 문장부호는 셈하지 않음 */
function speak(text, t0, t1, who = 'gt', extra = {}) {
  const ch = [...text], last = ch.reduce((k, c, i) => HANGUL.test(c) ? i : k, -1), at = [];
  let u = 0;
  ch.forEach((c, i) => { if (HANGUL.test(c)) { at.push([i, u]); u += 1; } else if (i < last) u += PAUSE[c] ?? .5; });
  const k = (t1 - t0) / u;
  const syl = at.map(([i, uu], j) => {
    let end = '';
    for (let m = i + 1; m < ch.length && !HANGUL.test(ch[m]); m++) if ('?!.,…'.includes(ch[m])) { end = ch[m]; break; }
    return {t: +(t0 + uu * k).toFixed(3), d: +Math.min(.2, Math.max(.06, .8 * k)).toFixed(3), i, j, end};
  });
  return {text, t0, t1, who, syl, ...extra};
}
const S = SC.map(s => s.q);
const cardT = k => +(33.75 + k * .735).toFixed(3);
const LINES = [
  speak(S[1][0], 6.40, 11.40),                    // 0 ② 날 것이냐 …
  speak(S[2][0], 14.45, 15.95, 'flock'),          // 1 ③ 새 떼 외침
  speak(S[2][1], 16.45, 21.70),                   // 2 ③ 독백
  speak(S[3][0], 22.15, 24.75),                   // 3 ④
  speak(S[4][0], 28.12, 31.50),                   // 4 ⑤
  speak(S[5][0], 32.10, 33.55),                   // 5 ⑥
  ...QS.map((q, k) => speak(q, cardT(k) + .12, cardT(k) + .12 + Math.min(.52, nH(q) * .095), 'card', {k})), // 6 ~ 16 질문 카드
  speak(S[6][0], 42.10, 43.25, 'gt', {write: true}), // 17 ⑦ 오늘은 쉬어 가자(깃펜이 마디마다 씀)
  speak(S[7][0], 48.10, 49.55), speak(S[7][1], 50.05, 51.45), speak(S[7][2], 52.05, 53.75), // 18 19 20 ⑧
  ...[57.05, 57.45, 57.85].map(a => speak(S[9][0], a, a + .3, 'name')), // 21 22 23 ⑩
];
const LI = {s2: 0, shout: 1, s3: 2, s4: 3, s5: 4, s6: 5, card0: 6, s7: 17, v0: 18, v1: 19, v2: 20, name0: 21};
const firstOf = (li, ch, from = 0) => { const L = LINES[li], idx = [...L.text].indexOf(ch, from); const s = L.syl.find(x => x.i === idx); if (!s) stop('줄 ' + li + ' 에 「' + ch + '」 없음'); return s.t; };
const phrases = li => { const L = LINES[li], p = [L.syl[0].t]; L.syl.forEach((s, j) => { if (j && /[,.?!…]/.test(L.syl[j - 1].end)) p.push(s.t); }); return p; };
const P2 = phrases(LI.s2), P3 = phrases(LI.s3), P4 = phrases(LI.s4), P5 = phrases(LI.s5);
if (P2.length !== 3 || P3.length !== 2 || P4.length !== 2 || P5.length !== 3) stop('독백 마디 나눔이 바뀜: ' + [P2, P3, P4, P5].map(p => p.length).join(','));
const CAPS = [
  {a: 1.70, b: 5.85, text: TITLE, kind: 'title'},
  {a: 6.25, b: 13.85, line: LI.s2}, {a: 16.30, b: 21.92, line: LI.s3}, {a: 22.02, b: 27.88, line: LI.s4}, {a: 28.04, b: 31.92, line: LI.s5}, {a: 32.02, b: 41.92, line: LI.s6},
  {a: 42.02, b: 43.36, line: LI.s7}, {a: 43.42, b: 47.92, text: FACT, kind: 'fact', hi: [H36.of + '곳', H36.n + '곳']},
  {a: 48.02, b: 49.94, line: LI.v0}, {a: 50.00, b: 51.94, line: LI.v1}, {a: 52.00, b: 53.94, line: LI.v2},
  {a: 54.85, b: 56.94, text: PROMO, kind: 'promo'},
].map(c => ({kind: 'mono', ...c, text: c.text ?? LINES[c.line].text}));
CAPS.forEach(c => { const s = SC.find(x => c.a >= x.a && c.a < x.b); if (!s || c.b > s.b) stop('글상자가 장면 밖: ' + c.text); });
const EV = [
  {t: 0, k: 'roll', d: 1.6}, {t: .15, k: 'curtain'}, {t: 1.70, k: 'hit'}, {t: 2.30, k: 'ruff'}, {t: 2.95, k: 'chest'},
  {t: P2[0] - .05, k: 'wing'}, {t: P2[1] - .05, k: 'wing2'}, {t: P2[2] - .05, k: 'chest'}, {t: 11.90, k: 'tip'}, {t: 12.50, k: 'tip'}, {t: 13.10, k: 'tip'},
  {t: 14.0, k: 'act'}, {t: 14.05, k: 'flock_up', d: 2.2}, {t: 14.70, k: 'gust'}, {t: firstOf(LI.s3, '날'), k: 'tip'},
  {t: 22.15, k: 'lean'}, {t: P4[1], k: 'lean'}, {t: 25.0, k: 'slip'}, {t: 25.42, k: 'catch'}, {t: 26.1, k: 'creak'}, {t: 27.15, k: 'creak'},
  {t: 28.04, k: 'freeze'}, {t: 28.50, k: 'idea'}, {t: 31.55, k: 'flipup'}, {t: 31.95, k: 'land'},
  {t: 32.0, k: 'act'}, ...QS.map((q, k) => ({t: cardT(k), k: 'card', i: k})),
  {t: 42.02, k: 'book'}, {t: 43.55, k: 'flock_back', d: 2.2}, {t: 44.40, k: 'droop'},
  {t: 48.0, k: 'act'}, {t: 48.02, k: 'vow', i: 0}, {t: 50.0, k: 'vow', i: 1}, {t: 52.0, k: 'vow', i: 2},
  {t: 54.05, k: 'send'}, {t: 54.55, k: 'msg'}, {t: 54.85, k: 'promo'},
  {t: 57.92, k: 'roll', d: .38}, {t: 58.30, k: 'slam'}, {t: 58.65, k: 'site'},
].map(e => ({...e, t: +e.t.toFixed(3)}));
// 새 떼 36마리 가운데 반값 아래로 간 곳 n마리 = 흐트러진 새(⑦) — 고르는 차례는 고정 섞기(자리만 · 숫자는 n 그대로)
const ORDER36 = Array.from({length: H36.of}, (_, i) => i).sort((a, b) => ((a * 37 + 11) % 97) - ((b * 37 + 11) % 97));
const MESSY = ORDER36.slice(0, H36.n);
const CU = {scenes: SC.map(s => ({n: s.n, a: s.a, b: s.b})), lines: LINES, caps: CAPS, ev: EV, flock: H36.of, messy: MESSY, nm: [...NAME].length};
const D = {CU, NAME, TITLE, VTITLE: VIDEO.title, QS, FACT, PROMO, SITE, MSG: S[8][0], SHOUT: S[2][0], VOWS: S[7], FR, n: H36.n, of: H36.of};
await fs.writeFile(path.join(TMP, 'cues.json'), JSON.stringify(CU));
console.log('사실', JSON.stringify({NAME, TITLE: VIDEO.title, QS: QS.length, n: H36.n, of: H36.of, half36check: H36.check?.ok ?? null, FR, SITE, syl: LINES.filter(l => l.who !== 'flock').reduce((a, l) => a + l.syl.length, 0)}));

// ── 그리는 쪽(브라우저 · 이 함수 글을 그대로 넣음 — 노드 값은 window.__D 로만) ──
function browserMain() {
  const D = window.__D, CU = D.CU;
  let sd = 7; const R = () => ((sd = (sd * 1103515245 + 12345) % 2147483648) / 2147483648);
  const cl = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x)), ease = x => 1 - Math.pow(1 - cl(x), 3), easeIn = x => Math.pow(cl(x), 2.2);
  const eio = x => { x = cl(x); return x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; };
  const back = x => { x = cl(x); const c = 1.7; return 1 + (c + 1) * Math.pow(x - 1, 3) + c * Math.pow(x - 1, 2); };
  const win = (t, a, b) => cl((t - a) / (b - a)), pulse = (t, a, d) => { const x = (t - a) / d; return x < 0 || x > 1 ? 0 : Math.sin(Math.PI * x); };
  const fade = (t, a, b, fi = .3, fo = .3) => Math.max(0, Math.min(win(t, a, a + fi), 1 - win(t, b - fo, b)));
  const lerp = (a, b, x) => a + (b - a) * x, f1 = x => (+x).toFixed(1), f2 = x => (+x).toFixed(2);
  const INK = '#F2EFE8', GOLD = '#E9B949', GOLDT = '#FFD98A', CREAM = '#FBF7EC', DARK = '#1A1420', YEL = '#FFE14D';
  const ev = (k, i) => { const e = CU.ev.find(x => x.k === k && (i == null || x.i === i)); if (!e) throw new Error('ev ' + k); return e.t; };
  const evs = k => CU.ev.filter(x => x.k === k).map(x => x.t);
  const SYL = [], WRITE = []; CU.lines.forEach(L => { if (L.who !== 'flock') L.syl.forEach(s => SYL.push(s)); if (L.write) L.syl.forEach(s => WRITE.push(s)); });
  SYL.sort((a, b) => a.t - b.t);
  const beakAt = t => { let b = 0; for (const s of SYL) { if (s.t > t + .01) break; b = Math.max(b, pulse(t, s.t - .01, s.d * 1.2)); } return b; };
  const L = CU.lines, LI = {s2: 0, shout: 1, s3: 2, s4: 3, s5: 4, s6: 5, s7: 17};
  const X1 = 520, XH = 505, BS = 1.4; // 가지 끝 가까이 선 자리(①~④) · 매달린 뒤 선 자리(⑤ 끝~⑩) · 골똘이 크기
  const phr = li => { const x = L[li], p = [x.syl[0].t]; x.syl.forEach((s, j) => { if (j && /[,.?!…]/.test(x.syl[j - 1].end)) p.push(s.t); }); return p; };
  const P2 = phr(LI.s2), P3 = phr(LI.s3), P4 = phr(LI.s4), P5 = phr(LI.s5);
  const sylTime = (li, ch) => { const x = L[li], idx = [...x.text].indexOf(ch); const s = x.syl.find(y => y.i === idx); return s ? s.t : x.t0; };

  // 별 · 새 떼 자리(고정 씨앗)
  const STARS = Array.from({length: 150}, () => [R() * 920 - 100, R() * 1500 - 520, .6 + R() * 1.8, R() * 6.28]);
  const FLOCK = Array.from({length: CU.flock}, (_, i) => ({i, x0: 60 + R() * 600, y0: 1000 + R() * 220, dx: (R() - .5) * 260, ti: R() * .5, ph: R() * 6.28,
    tx: 84 + (i % 6) * 94 + (R() - .5) * 22, ty: 132 + Math.floor(i / 6) * 60 + (R() - .5) * 16, c: [['#A9C4FF', '#6F8FE0', '#E3ECFF'], ['#B8E3F2', '#73AFC6', '#E6F6FB'], ['#C9B8FF', '#8E76E0', '#EEE8FF']][i % 3]}));
  const MESSY = new Set(CU.messy);

  // 카메라 — 가지 위 점 (fx, fy) 를 화면 (sx, sy) 에 · 크기 s(때마다 이음)
  const CAM = [[0, 1, X1, 691, 430, 700], [1.8, 1, X1, 691, 430, 700], [6.0, 1.12, X1, 691, 410, 735], [6.4, 1.18, X1, 691, 400, 752], [13.8, 1.22, X1, 691, 395, 760],
    [14.35, 1, X1, 691, 430, 700], [16.3, 1, X1, 691, 430, 700], [16.8, 1.15, X1, 691, 405, 745], [21.9, 1.17, X1, 691, 400, 750],
    [22.3, 1.08, X1, 691, 420, 720], [24.95, 1.1, X1, 691, 400, 640], [25.6, 1, XH, 697, 410, 420], [31.5, 1, XH, 697, 410, 420],
    [32.0, .9, XH, 691, 500, 800], [47.8, .9, XH, 691, 500, 800], [48.3, 1, XH, 691, 470, 800], [53.95, 1, XH, 691, 470, 800],
    [54.3, 1, XH, 691, 560, 810], [56.95, 1, XH, 691, 560, 810], [57.25, 1, XH, 691, 470, 845], [60, 1, XH, 691, 470, 845]];
  function cam(t) {
    let i = 0; while (i < CAM.length - 2 && t >= CAM[i + 1][0]) i++;
    const a = CAM[i], b = CAM[i + 1], u = eio(win(t, a[0], b[0])), k = j => lerp(a[j], b[j], u);
    const s = k(1), tx = k(4) - k(2) * s, ty = k(5) - k(3) * s; return {s, tx, ty};
  }
  const layer = (c, k) => `translate(${f1(c.tx * k)} ${f1(c.ty * k)}) scale(${(1 + (c.s - 1) * k).toFixed(4)})`;
  const scr = (c, x, y) => [x * c.s + c.tx, y * c.s + c.ty];

  // 가지(곧은 선 위 두께) — 발을 놓는 높이 btop(x)
  const bu = x => (x - 50) / 618, by = x => { const u = bu(x); return 744 - 46 * u - 18 * Math.sin(Math.PI * u); }, bw = x => 36 - 24 * cl(bu(x)), btop = x => by(x) - bw(x) / 2;
  const DEFS = '<defs><linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#070914"/><stop offset=".45" stop-color="#11162E"/><stop offset=".8" stop-color="#1B1838"/><stop offset="1" stop-color="#0E0C1C"/></linearGradient>'
    + '<radialGradient id="moonglow" cx="50%" cy="50%" r="50%"><stop offset=".45" stop-color="#F4EEDC" stop-opacity=".30"/><stop offset="1" stop-color="#F4EEDC" stop-opacity="0"/></radialGradient>'
    + '<radialGradient id="spot" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#FFF4D6" stop-opacity=".20"/><stop offset=".6" stop-color="#FFF4D6" stop-opacity=".07"/><stop offset="1" stop-color="#FFF4D6" stop-opacity="0"/></radialGradient>'
    + '<linearGradient id="beam" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFF4D6" stop-opacity=".16"/><stop offset="1" stop-color="#FFF4D6" stop-opacity="0"/></linearGradient>'
    + '<linearGradient id="bark" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#4A3428"/><stop offset=".5" stop-color="#2E2019"/><stop offset="1" stop-color="#1C1310"/></linearGradient>'
    + '<linearGradient id="trunk" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#140E0C"/><stop offset=".7" stop-color="#2A1D17"/><stop offset="1" stop-color="#3A2A21"/></linearGradient>'
    + '<linearGradient id="vel" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#3E0F22"/><stop offset=".35" stop-color="#6E1C3A"/><stop offset=".55" stop-color="#4A1329"/><stop offset=".8" stop-color="#7A2244"/><stop offset="1" stop-color="#3E0F22"/></linearGradient>'
    + '<linearGradient id="gold" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#FFE3A0"/><stop offset=".5" stop-color="#E9B949"/><stop offset="1" stop-color="#C4952F"/></linearGradient>'
    + '<radialGradient id="ball" cx="38%" cy="32%" r="70%"><stop offset="0" stop-color="#F3F0FF"/><stop offset=".45" stop-color="#9C92D6"/><stop offset="1" stop-color="#3B3470"/></radialGradient>'
    + '<filter id="gl" x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="5" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>'
    + '<filter id="bk" x="-80%" y="-80%" width="260%" height="260%"><feGaussianBlur stdDeviation="18"/></filter></defs>';

  function sky(t, c) {
    let s = `<rect x="-300" y="-700" width="1320" height="2600" fill="url(#sky)"/>`;
    s += `<g transform="${layer(c, .3)}">` + STARS.map(([x, y, r, p]) => `<circle cx="${f1(x)}" cy="${f1(y)}" r="${f1(r)}" fill="#fff" opacity="${f2(.16 + .5 * (.5 + .5 * Math.sin(t * 1.9 + p)))}"/>`).join('');
    s += `<circle cx="585" cy="185" r="150" fill="url(#moonglow)"/><circle cx="585" cy="185" r="72" fill="#F4EEDC"/><circle cx="566" cy="168" r="11" fill="#E2DAC4"/><circle cx="604" cy="206" r="8" fill="#E2DAC4"/><circle cx="598" cy="160" r="5" fill="#E2DAC4"/>`;
    s += `<g opacity=".22"><ellipse cx="${f1(120 + (t * 9) % 900 - 200)}" cy="330" rx="160" ry="20" fill="#C9C3E6" filter="url(#bk)"/><ellipse cx="${f1(700 - (t * 6) % 1000)}" cy="470" rx="190" ry="22" fill="#C9C3E6" filter="url(#bk)"/></g></g>`;
    // 아래 먼 나무 끝(높은 가지임을 보임)
    s += `<g transform="${layer(c, .7)}">`;
    for (let i = 0; i < 9; i++) { const x = -40 + i * 100, y = 960 + ((i * 37) % 3) * 26; s += `<ellipse cx="${x}" cy="${y}" rx="${70 + (i % 3) * 16}" ry="${54 + (i % 2) * 14}" fill="${i % 2 ? '#101826' : '#0C1420'}"/><rect x="${x - 7}" y="${y}" width="14" height="420" fill="#0A0F18"/>`; }
    s += `<rect x="-300" y="1010" width="1320" height="900" fill="#0A0F18"/><ellipse cx="360" cy="985" rx="520" ry="30" fill="#8A88B8" opacity=".10" filter="url(#bk)"/></g>`;
    return s;
  }
  function tree(t) {
    let s = `<path d="M-120 1500 L-110 -700 L60 -700 C70 -300 50 200 88 520 C98 640 92 1000 110 1500 Z" fill="url(#trunk)"/>`;
    s += `<path d="M30 -600 C40 -200 30 240 60 520" stroke="#3A2A21" stroke-width="3" fill="none" opacity=".6"/><path d="M8 -400 C14 0 10 400 30 900" stroke="#140E0C" stroke-width="4" fill="none" opacity=".7"/>`;
    const N = 16, top = [], bot = [];
    for (let i = 0; i <= N; i++) { const x = 50 + 618 * i / N, y = by(x), w = bw(x); top.push(f1(x) + ' ' + f1(y - w / 2)); bot.unshift(f1(x) + ' ' + f1(y + w / 2)); }
    s += `<path d="M30 ${f1(by(50) - 24)} L${top.join(' L')} Q676 ${f1(by(668))} ${bot[0]} L${bot.join(' L')} L30 ${f1(by(50) + 30)} Z" fill="url(#bark)"/>`;
    s += `<path d="M60 ${f1(btop(60) + 3)} ${Array.from({length: 12}, (_, i) => { const x = 60 + 50 * (i + 1); return 'L' + f1(x) + ' ' + f1(btop(x) + 3); }).join(' ')}" stroke="#6B4C3A" stroke-width="2.4" fill="none" opacity=".55"/>`;
    // 잔가지 · 잎(바람에 조금 흔들림)
    const sw = Math.sin(t * 1.3) * 2.5, lf = (x, y, r, c) => `<path transform="translate(${f1(x)} ${f1(y)}) rotate(${f1(r + sw)})" d="M0 0 C8 -10 24 -10 32 0 C24 10 8 10 0 0 Z" fill="${c}"/>`;
    s += `<path d="M610 ${f1(by(610) - 4)} C626 ${f1(by(610) - 30)} 640 ${f1(by(610) - 58)} 662 ${f1(by(610) - 70)}" stroke="#2E2019" stroke-width="7" fill="none" stroke-linecap="round"/>`;
    s += lf(660, by(610) - 72, -40, '#2C5246') + lf(650, by(610) - 60, 20, '#1F3B33') + lf(640, by(610) - 40, -80, '#2C5246') + lf(664, by(668), -10, '#1F3B33') + lf(668, by(668) + 4, 40, '#2C5246');
    s += `<path d="M250 ${f1(by(250) + 8)} C246 ${f1(by(250) + 40)} 230 ${f1(by(250) + 64)} 214 ${f1(by(250) + 78)}" stroke="#2E2019" stroke-width="6" fill="none" stroke-linecap="round"/>` + lf(212, by(250) + 80, 110, '#1F3B33') + lf(220, by(250) + 70, 160, '#2C5246');
    return s;
  }
  // 막(위 휘장 · 옆 막 · 처음 열림 · 막 바뀜에 반쯤 닫힘)
  function curtains(t) {
    let open = 1 - eio(win(t, .15, 1.75)), side = 34;
    for (const a of evs('act')) side += 160 * pulse(t, a - .3, .6);
    const wL = side + open * 330;
    const panel = (x, w, flip) => { let s = `<g transform="translate(${flip ? 720 : 0} 0) scale(${flip ? -1 : 1} 1)"><path d="M0 0 H${f1(w)} C${f1(w - 10)} 400 ${f1(w + 8)} 800 ${f1(w - 6)} 1280 H0 Z" fill="url(#vel)"/>`;
      for (let k = 1; k < 5; k++) s += `<path d="M${f1(w * k / 5)} 60 C${f1(w * k / 5 - 6)} 500 ${f1(w * k / 5 + 6)} 900 ${f1(w * k / 5)} 1280" stroke="#2A0815" stroke-width="${f1(2 + w / 60)}" opacity=".45" fill="none"/>`;
      return s + `<path d="M${f1(w - 2)} 0 C${f1(w - 12)} 400 ${f1(w + 6)} 800 ${f1(w - 8)} 1280" stroke="${GOLD}" stroke-width="3" opacity=".55" fill="none"/></g>`; };
    let s = panel(0, wL, false) + panel(0, wL, true);
    s += '<path d="M0 0 H720 V46 ' + Array.from({length: 8}, (_, i) => { const x0 = 720 - i * 90; return `Q${x0 - 45} 92 ${x0 - 90} 46`; }).join(' ') + ' Z" fill="url(#vel)"/>';
    s += '<path d="M0 46 ' + Array.from({length: 8}, (_, i) => { const x0 = i * 90; return `Q${x0 + 45} 92 ${x0 + 90} 46`; }).join(' ') + '" stroke="' + GOLD + '" stroke-width="3" fill="none" opacity=".75"/>';
    return s;
  }
  // 골똘이 자세 — A(세상 자리) · P(새 그림 속 받침점) · rot · S · sx · sy · o(makbi 몸짓)
  function pose(t) {
    const o = {ruff: 1, chest: 0, messy: 0, tail: 0, hook: 0, tilt: -7, blink: 0, wingL: 0, wingR: 0, crestUp: .35, beakOpen: 0, lookX: 0, lookY: 0, wince: 0};
    let A = [X1, 691], P = [120, 252], rot = 0, S = BS, sx = 1, sy = 1;
    o.blink = Math.max(...[5.2, 9.0, 12.85, 19.3, 27.3, 35.1, 39.4, 45.2, 50.9, 53.0, 58.95].map(b => pulse(t, b, .2)));
    o.beakOpen = .85 * beakAt(t);
    if (t < 6) { // ① 깃 · 날개를 가슴에 · 달을 봄
      o.ruff = t < 2.3 ? 0 : back(win(t, 2.3, 2.55)); o.chest = eio(win(t, 2.95, 3.3)); o.crestUp = .35 + .55 * pulse(t, 2.3, .7);
      const g = eio(win(t, 3.6, 4.3)); o.lookY = -.6 * g; o.lookX = .45 * g; o.tilt = -7 - 6 * g; sy = 1 + .05 * pulse(t, 2.3, .3);
    } else if (t < 14) { // ② 날 것이냐(폄) · 말 것이냐(접음) · 그것이 문제로다(가슴) · 발끝 들썩
      const open = t < P2[1] - .05 ? .85 * ease(win(t, P2[0] - .05, P2[0] + .3)) : .85 * (1 - ease(win(t, P2[1] - .05, P2[1] + .3)));
      o.chest = t < 6.3 ? 1 - win(t, 6.0, 6.3) : eio(win(t, P2[2] - .05, P2[2] + .3)); o.wingL = t < P2[2] ? open : 0; o.wingR = o.chest > .01 ? 0 : open;
      o.crestUp = .35 + .4 * (t < P2[1] ? win(t, P2[0], P2[0] + .3) : 0);
      if (t >= P2[2] - .05) { const g = eio(win(t, P2[2], P2[2] + .4)); o.tilt = -7 - 8 * g; o.lookY = -.7 * g; }
      for (const a of evs('tip').filter(x => x < 14)) { const h = pulse(t, a, .34); A = [A[0], A[1] - 16 * h]; sy *= 1 + .07 * h; sx *= 1 - .03 * h; o.crestUp = Math.max(o.crestUp, .4 + .5 * h); }
      if (t >= 11.6) { o.lookY = -.2; o.lookX = Math.sin((t - 11.6) * 4.4) > 0 ? .95 : -.95; o.tilt = -7 + 5 * Math.sin((t - 11.6) * 4.4); }
    } else if (t < 22) { // ③ 새 떼 · 바람에 깃이 흐트러짐 · 독백
      const gu = ev('gust'); o.messy = .75 * ease(win(t, gu, gu + .25)) - .3 * win(t, 19, 21.9); o.wince = t >= gu + .03 && t < gu + .6 ? 1 : 0;
      if (t < gu) { o.lookY = .9; } else if (t < 16.4) { o.lookY = -1; o.crestUp = .95; o.tilt = -7 + 4 * Math.sin(t * 9) * (1 - win(t, gu, 16)); A = [A[0] - 8 * pulse(t, gu, .5), A[1]]; }
      else if (t < P3[1]) { o.wingL = o.wingR = .12; o.crestUp = .3; o.lookX = -.3; }
      else { const g = eio(win(t, P3[1], P3[1] + .5)) * (1 - eio(win(t, 21.3, 21.9))); rot = 9 * g; o.wingL = o.wingR = .45 * g; o.lookY = -.5 * g; o.crestUp = .5 + .4 * g; }
      for (const a of evs('tip').filter(x => x >= 14 && x < 22)) { const h = pulse(t, a, .34); A = [A[0], A[1] - 16 * h]; sy *= 1 + .07 * h; }
    } else if (t < 25) { // ④ 몸을 내밀고 · 무서워 움찔 · 다시 내밂 · 발끝
      o.messy = .45 - .15 * win(t, 22, 25); const a1 = ev('lean'), a2 = P4[1];
      if (t < a2) { const g = eio(win(t, a1, a1 + .7)); rot = -14 * g; o.lookY = g; if (t > a2 - .55) { o.wince = 1; rot = lerp(-14, -6, eio(win(t, a2 - .55, a2 - .2))); } }
      else { const g = eio(win(t, a2, a2 + .8)); rot = lerp(-6, -24, g); o.lookY = .6; o.wingL = o.wingR = .3 * g; o.crestUp = .5 + .5 * g; A = [A[0], A[1] - 7 * g]; sy = 1 + .05 * g; }
      if (t >= 24.75) rot += 3.2 * Math.sin((t - 24.75) * 55);
    } else if (t < 31.55) { // ④ 미끄러짐 → 꼬리로 매달림 · ⑤ 「잠깐」
      o.messy = .3 - .2 * win(t, 25, 31); o.tail = ease(win(t, 25.0, 25.3)); o.hook = ease(win(t, 25.25, 25.42));
      const H = [XH, by(XH)];
      if (t < 25.42) { const u = win(t, 25.0, 25.42), e = easeIn(u); A = [lerp(X1 - 24 * ease(win(t, 25, 25.12)), H[0], e), lerp(691, H[1], e) - 40 * Math.sin(Math.PI * u)]; P = [120, lerp(252, 322, e)]; rot = lerp(-27, -180, eio(u)); o.wince = 1; o.wingL = o.wingR = .5 + .4 * Math.sin(t * 40); }
      else { A = H; P = [120, 322]; const dt = t - 25.42; let th = 26 * Math.exp(-dt / 1.4) * Math.sin(2 * Math.PI * dt / 1.05); const fz = ev('freeze'); if (t >= fz) th *= 1 - win(t, fz, fz + .12); rot = -180 + th;
        o.wince = dt < .35 ? 1 : 0; o.lookX = t < fz ? Math.sin(dt * 6) * .6 : 0; o.crestUp = .6;
        if (t >= fz) { o.wingR = .7 * (1 - win(t, fz + .7, fz + 1)); const ya = sylTime(LI.s5, '앵'), yb = sylTime(LI.s5, '새'); o.chest = eio(win(t, ya - .1, ya + .1)) * (1 - eio(win(t, yb + .25, yb + .45))); if (t >= P5[2]) { o.lookX = .9; o.tilt = -12; } } }
    } else if (t < 32) { // ⑤ 끝 — 거꾸로에서 한 바퀴 돌아 가지 위로
      const u = win(t, 31.55, 31.95), e = eio(u), H = [XH, by(XH)]; A = [XH, lerp(H[1], 691, e) - 130 * Math.sin(Math.PI * u)]; P = [120, lerp(322, 252, e)]; rot = lerp(-180, -360, e);
      o.tail = 1 - win(t, 31.75, 31.95); o.hook = 1 - win(t, 31.55, 31.7); o.wingL = o.wingR = .6 * Math.sin(Math.PI * u); o.crestUp = .9;
    } else { // ⑥ ~ ⑩ 가지 위(XH)
      A = [XH, 691]; const ld = ev('land'); { const q = pulse(t, ld, .3); sy = 1 - .1 * q; sx = 1 + .07 * q; }
      if (t < 42) { o.lookY = -.55; o.lookX = -.35; o.wingR = .5 * pulse(t, 32.1, 1.1); let nod = 0; for (const a of evs('card')) nod = Math.max(nod, pulse(t, a, .32)); o.tilt = -7 + 9 * nod; }
      else if (t < 48) { o.wingL = .38; if (t < 43.5) { o.lookY = .55; o.lookX = -.5; o.tilt = -11; } else { o.lookY = -.6; o.lookX = -.7; o.tilt = -4; o.crestUp = .55; } }
      else if (t < 54) { o.chest = eio(win(t, 48.0, 48.35)); o.lookY = -.4; let nod = 0; for (const a of evs('vow')) nod = Math.max(nod, pulse(t, a + .05, .45)); o.tilt = -7 + 9 * nod; o.crestUp = .45; }
      else if (t < 57) { o.wingR = .85 * pulse(t, 54.0, .4); o.lookX = t > 54.3 ? -1 : 0; o.tilt = -12; o.crestUp = .5 + .3 * win(t, 54.9, 55.3); }
      else { for (const a of [57.05, 57.45, 57.85]) { const p = pulse(t, a, .36); A = [A[0], A[1] - 12 * p]; o.wingL = Math.max(o.wingL, .55 * p); o.wingR = Math.max(o.wingR, .55 * p); o.crestUp = Math.max(o.crestUp, .5 + .5 * p); }
        const q = pulse(t, ev('slam'), .3); sy *= 1 - .08 * q; if (t > 58.4) { o.wingL = o.wingR = .3; o.crestUp = .8; o.chest = 0; } }
    }
    return {A, P, rot, S, sx, sy, o};
  }
  function bird(p) { return `<g transform="translate(${f1(p.A[0])} ${f1(p.A[1])}) rotate(${f1(p.rot)}) scale(${(p.S * p.sx).toFixed(3)} ${(p.S * p.sy).toFixed(3)}) translate(${-p.P[0]} ${-p.P[1]})">${makbi({...p.o, id: 'gt'})}</g>`; }
  const T = (x, y, size, txt, cls, op, extra) => op <= .003 ? '' : `<div class="t ${cls || ''}" style="left:${f1(x)}px;top:${f1(y)}px;font-size:${size}px;opacity:${f2(op)};${extra || ''}">${txt}</div>`;
  const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

  // ③ ⑦ 새 떼(화면 자리)
  function flockUp(t) {
    let s = ''; const a = ev('flock_up');
    for (const b of FLOCK) { const u = win(t, a + b.ti, a + b.ti + 1.3); if (u <= 0 || u >= 1) continue; const e = easeIn(u * .8 + .2 * u * u);
      const x = b.x0 + b.dx * e + 18 * Math.sin(t * 7 + b.ph), y = lerp(b.y0, -260, e), fl = .5 + .5 * Math.sin(t * 38 + b.ph);
      s += `<g transform="translate(${f1(x)} ${f1(y)}) rotate(${f1(-58 + 10 * Math.sin(b.ph))}) scale(1.05)">${sparrow({flap: fl, c: b.c})}</g>`; }
    return s;
  }
  function flockBack(t) {
    let s = ''; const a = ev('flock_back'), out = 1 - win(t, 47.75, 48.05);
    if (out <= 0) return '';
    for (const b of FLOCK) { const t0 = a + b.i * .034, u = ease(win(t, t0, t0 + 1.15)); if (u <= 0) continue; const m = MESSY.has(b.i);
      const x = lerp(b.tx - 320, b.tx, u) + (m ? 6 * Math.sin(t * 5 + b.ph) : 0), y = lerp(b.ty - 520, b.ty, u) + 5 * Math.sin(t * 3 + b.ph) + (m ? 9 * win(t, t0 + 1.1, t0 + 2.4) : 0);
      const fl = m ? .3 + .3 * Math.sin(t * 9 + b.ph) : .5 + .5 * Math.sin(t * 24 + b.ph), c = m ? ['#8E93A6', '#61667D', '#BFC2CF'] : b.c;
      s += `<g opacity="${f2(out)}" transform="translate(${f1(x)} ${f1(y)}) rotate(${f1(m ? 16 + 7 * Math.sin(t * 4 + b.ph) : -6)}) scale(1.2)">${sparrow({flap: fl, messy: m ? 1 : 0, c})}</g>`;
      if (m) { const fu = win(t, t0 + .9 + (b.ph % 1), t0 + 3.2 + (b.ph % 1)); if (fu > 0 && fu < 1) s += `<g opacity="${f2(out * (1 - fu * .6))}" transform="translate(${f1(x + 22 * Math.sin(fu * 7 + b.ph))} ${f1(y + 20 + 210 * fu)}) rotate(${f1(fu * 260 + b.ph * 40)}) scale(.75)">${feather('#9AA0B6', '#E3E6EE')}</g>`; } }
    return s;
  }
  // ⑦ 기록장 · 깃펜(마디마다 한 획)
  function book(t, c) {
    const a = ev('book'), op = fade(t, a, 47.9, .25, .3); if (op <= 0) return '';
    const [bx, by0] = scr(c, XH - 150, 598), sc = .95 * c.s * (.85 + .15 * back(win(t, a, a + .3)));
    let s = `<g opacity="${f2(op)}" transform="translate(${f1(bx)} ${f1(by0)}) scale(${f2(sc)}) rotate(-6)"><path d="M-100 -62 Q-50 -74 0 -60 Q50 -74 100 -62 L100 62 Q50 50 0 64 Q-50 50 -100 62 Z" fill="#E8DFC8"/>`
      + `<path d="M-94 -56 Q-48 -66 -4 -54 L-4 56 Q-48 46 -94 56 Z" fill="${CREAM}"/><path d="M4 -54 Q48 -66 94 -56 L94 56 Q48 46 4 56 Z" fill="${CREAM}"/><path d="M0 -60 V64" stroke="#C9BC9C" stroke-width="2"/>`;
    for (let r = 0; r < 4; r++) s += `<path d="M-84 ${-30 + r * 24} H-16 M14 ${-30 + r * 24} H84" stroke="#D9CFB5" stroke-width="1.5"/>`;
    for (let r = 0; r < 3; r++) s += `<path d="M-82 ${-34 + r * 24} q8 -6 14 0 t14 0 t14 0 t14 0 t12 0" stroke="#6C6278" stroke-width="2" fill="none" opacity=".6"/>`;
    const done = WRITE.filter(w => w.t <= t).length, cur = WRITE.find(w => t >= w.t && t < w.t + w.d); let ink = '', tip = [70, 36];
    WRITE.forEach((w, j) => { if (w.t > t) return; const row = j < 4 ? 0 : 1, col = j < 4 ? j : j - 4, x0 = 16 + col * 18, y0 = -32 + row * 24, u = win(t, w.t, w.t + w.d);
      ink += `<path d="M${x0} ${y0} q4 ${-7 * u} ${f1(8 * u)} 0 t${f1(8 * u)} 0" stroke="#2B2350" stroke-width="2.6" fill="none" stroke-linecap="round"/>`; tip = [x0 + 16 * u, y0]; });
    if (done === WRITE.length && t > WRITE[WRITE.length - 1].t + .3) { const u = ease(win(t, 43.3, 43.6)); ink += `<path d="M30 ${f1(18)} l10 10 l${f1(22 * u)} ${f1(-22 * u)}" stroke="${GOLD}" stroke-width="4" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`; tip = [62, 6]; }
    s += ink;
    const qa = fade(t, a + .05, 43.9, .2, .3); if (qa > 0) { const bob = cur ? -4 * Math.sin((t - cur.t) / cur.d * Math.PI) : 0;
      s += `<g opacity="${f2(qa)}" transform="translate(${f1(tip[0])} ${f1(tip[1] + bob)}) rotate(-38)"><path d="M0 0 L4 -8 C10 -40 22 -86 34 -110 C30 -78 22 -40 8 -6 Z" fill="#F4F1E8"/><path d="M2 -4 L30 -104" stroke="#BDB3A0" stroke-width="1.5"/><path d="M0 0 L3 -9" stroke="#2B2350" stroke-width="3"/></g>`; }
    return s + '</g>';
  }
  // ⑥ 질문 카드 열한 장(화면 자리 · 한 장씩 넘어감) — 카드 판과 글이 한 덩이(HTML)라 넘어가는 카드가 다음 카드 글을 가림
  function cards(t, o) {
    const a = ev('card', 0), z = 42.0; if (t < a - .35 || t >= z) return '';
    let s = '', k = -1; for (let i = 0; i < D.QS.length; i++) if (t >= ev('card', i)) k = i;
    const op = fade(t, a - .35, z, .3, .25), cx = 360, cy = 318, w = 560, h = 300, rest = D.QS.length - Math.max(k, 0) - 1;
    for (let j = Math.min(rest, 6); j >= 1; j--) s += `<rect x="${cx - w / 2 + j * 7}" y="${cy - h / 2 + j * 7}" width="${w}" height="${h}" rx="26" fill="${j % 2 ? '#E9E2D0' : '#F1EBDC'}" stroke="#C9BC9C" stroke-width="2" opacity="${f2(op)}"/>`;
    const card = (i, tr, fly) => `<div class="card${fly ? ' fly' : ''}" style="left:${cx - w / 2}px;top:${cy - h / 2}px;width:${w}px;height:${h}px;opacity:${f2(op)};transform:${tr}"><span class="cn">${i + 1} / ${D.QS.length}</span><span class="cq">${esc(D.QS[i])}</span></div>`;
    o.push(card(Math.max(k, 0), k < 0 ? `translateY(${f1((1 - ease(win(t, a - .35, a))) * 60)}px)` : 'none'));
    if (k >= 1) { const fu = win(t, ev('card', k), ev('card', k) + .26); if (fu < 1) { const e = ease(fu); o.push(card(k - 1, `translate(${f1(-780 * e)}px,${f1(-70 * e)}px) rotate(${f1(-24 * e)}deg)`, true)); } }
    return s;
  }
  // ⑧ 본질 세 줄 그림표(글 없음 — 글은 글상자)
  function vows(t) {
    const out = fade(t, 48.0, 54.0, .2, .25); if (out <= 0) return ''; let s = '';
    for (let i = 0; i < 3; i++) { const a = ev('vow', i); if (t < a) continue; const x = 170 + i * 190, y = 300, pop = back(win(t, a, a + .32)), cur = i === 2 ? true : t < ev('vow', i + 1), op = out * (cur ? 1 : .5);
      s += `<g opacity="${f2(op)}" transform="translate(${x} ${y}) scale(${f2(pop)})"><circle r="80" fill="#151A33" stroke="${cur ? GOLD : '#5B5F80'}" stroke-width="${cur ? 5 : 3}"${cur ? ' filter="url(#gl)"' : ''}/>`;
      if (i === 0) s += `<ellipse cx="0" cy="44" rx="40" ry="10" fill="#6E5A3C"/><path d="M-30 44 L-22 30 H22 L30 44 Z" fill="#8C744D"/><circle cx="0" cy="-6" r="38" fill="url(#ball)"/><path d="M-30 -36 L30 24 M30 -36 L-30 24" stroke="#151A33" stroke-width="17" stroke-linecap="round"/><path d="M-30 -36 L30 24 M30 -36 L-30 24" stroke="${INK}" stroke-width="9" stroke-linecap="round"/>`;
      if (i === 1) s += `<rect x="-46" y="-40" width="92" height="80" rx="8" fill="${CREAM}"/><path d="M-36 20 L-22 4 L-10 12 L4 -16 L12 -6" stroke="#5B96FF" stroke-width="5" fill="none" stroke-linecap="round" stroke-linejoin="round"/><path d="M14 -34 V34" stroke="#6C6278" stroke-width="3" stroke-dasharray="6 6"/><circle cx="12" cy="-6" r="5" fill="#5B96FF"/>`;
      if (i === 2) s += `<path d="M-46 -34 H46 Q54 -34 54 -26 V18 Q54 26 46 26 H-6 L-26 44 L-22 26 H-46 Q-54 26 -54 18 V-26 Q-54 -34 -46 -34 Z" fill="${CREAM}"/><path d="M-12 -14 Q-12 -26 0 -26 Q12 -26 12 -14 Q12 -6 2 -2 Q0 0 0 6" stroke="${DARK}" stroke-width="7" fill="none" stroke-linecap="round"/><circle cx="0" cy="16" r="5" fill="${DARK}"/>`;
      s += '</g>'; if (t < a + .5) s += `<circle cx="${x}" cy="${y}" r="${f1(80 + 60 * ease(win(t, a, a + .5)))}" fill="none" stroke="${GOLD}" stroke-width="${f1(5 * (1 - win(t, a, a + .5)))}" opacity="${f2(1 - win(t, a, a + .5))}"/>`; }
    return s;
  }
  // ⑨ 노란 대화 카드 → 친구 폰(카카오 표시 없음)
  function phone(t, o) {
    const a = 54.0, op = fade(t, a, 57.0, .25, .2); if (op <= 0) return ''; const py = (1 - ease(win(t, a, a + .3))) * 700;
    let s = `<g opacity="${f2(op)}" transform="translate(0 ${f1(py)})"><rect x="34" y="250" width="340" height="560" rx="44" fill="#0E1018" stroke="#3E4352" stroke-width="5"/><rect x="50" y="300" width="308" height="470" rx="12" fill="#B9C7D6"/>`
      + `<rect x="50" y="300" width="308" height="64" rx="12" fill="#A7B6C6"/><rect x="164" y="268" width="80" height="12" rx="6" fill="#262A36"/>`
      + `<g transform="translate(70 312) scale(.42)">${makbiHead({id: 'ph'})}</g><rect x="120" y="322" width="96" height="14" rx="7" fill="#6F7F92"/>`;
    const sa = ev('send'), ma = ev('msg'), fu = win(t, sa, ma);
    if (fu > 0 && fu < 1) { const e = eio(fu), x = lerp(560, 205, e), y = lerp(560, 470, e) - 160 * Math.sin(Math.PI * fu), r = lerp(-30, 0, e), sc = lerp(.6, 1, e);
      s += `<g transform="translate(${f1(x)} ${f1(y - py)}) rotate(${f1(r)}) scale(${f2(sc)})"><rect x="-128" y="-60" width="256" height="120" rx="20" fill="${YEL}"/><path d="M-96 60 L-110 82 L-70 60 Z" fill="${YEL}"/></g>`; }
    if (t >= ma) { const pop = back(win(t, ma, ma + .25));
      s += `<g transform="translate(205 470) scale(${f2(pop)})"><rect x="-140" y="-62" width="280" height="124" rx="22" fill="${YEL}"/><path d="M-104 60 L-118 84 L-76 60 Z" fill="${YEL}"/></g>`;
      o.push(T(205, 470 + py, 38, esc(D.MSG), '', op * cl(pop * 1.2), `color:${DARK};font-weight:900;transform:translate(-50%,-50%) scale(${f2(pop)})`));
      s += `<circle cx="${f1(205)}" cy="470" r="${f1(70 + 120 * ease(win(t, ma, ma + .5)))}" fill="none" stroke="${YEL}" stroke-width="${f1(5 * (1 - win(t, ma, ma + .5)))}" opacity="${f2(1 - win(t, ma, ma + .5))}"/>`; }
    return s + '</g>';
  }
  // 막 바뀜 · 이름 쾅의 먼지(폭죽 아님 — 흐린 회색 김)
  const dust = (cx, cy, t0, t, n, dist) => { const u = win(t, t0, t0 + .8); if (u <= 0 || u >= 1) return ''; let s = ''; for (let i = 0; i < n; i++) { const a = i / n * 6.283, d = dist * ease(u) * (.6 + .4 * ((i * 7) % 5) / 5); s += `<circle cx="${f1(cx + Math.cos(a) * d)}" cy="${f1(cy + Math.sin(a) * d * .35)}" r="${f1(16 + 26 * u)}" fill="#8E8AA8" opacity="${f2(.32 * (1 - u))}" filter="url(#bk)"/>`; } return s; };

  // 글상자 — 한 장면 한 줄 · 크게 · 독백은 마디마다 글자에 불(같은 때)
  const capEl = document.getElementById('cap'), capIn = document.getElementById('capin');
  const FIT = {};
  function capHTML(c, t) {
    if (c.kind === 'mono') { const ln = L[c.line], ch = [...ln.text], cur = ln.syl.find(s => t >= s.t && t < s.t + Math.max(s.d, .1)); let k = -1; ln.syl.forEach(s => { if (t >= s.t) k = s.i; });
      let q = false; return ch.map((x, i) => { if (x === '"') q = !q; return x === ' ' ? (q ? '&nbsp;' : ' ') : `<span class="${cur && cur.i === i ? 'kc' : i <= k ? 'ks' : 'ku'}">${esc(x)}</span>`; }).join(''); }
    if (c.kind === 'fact') { let h = esc(c.text); for (const w of c.hi) h = h.replace(w, `<b>${esc(w)}</b>`); return h; }
    return esc(c.text);
  }
  function caption(t) {
    const c = CU.caps.find(x => t >= x.a && t < x.b);
    if (!c) { capEl.style.opacity = '0'; capIn.innerHTML = ''; capEl.className = ''; return; }
    capEl.className = 'k-' + c.kind; capIn.innerHTML = capHTML(c, t);
    if (!FIT[c.text]) { let z = c.kind === 'title' ? 76 : 56; for (; z > 48; z -= 2) { capIn.style.fontSize = z + 'px'; if (capIn.scrollHeight <= 196 && capIn.scrollWidth <= capIn.clientWidth + 1) break; } FIT[c.text] = z; }
    capIn.style.fontSize = FIT[c.text] + 'px';
    const a = Math.min(win(t, c.a, c.a + .16), 1 - win(t, c.b - .16, c.b)); capEl.style.opacity = f2(Math.max(0, a));
    capEl.style.transform = `translateY(${f1((1 - ease(win(t, c.a, c.a + .3))) * 14)}px)`;
  }

  window.render = t => {
    const c = cam(t), p = pose(t), o = []; let s = DEFS + sky(t, c), shake = '';
    s += `<g transform="${layer(c, 1)}">${tree(t)}</g>`;
    // 무대 빛(가지 위 골똘이)
    const bp = scr(c, p.A[0], p.A[1] - 150);
    s += `<path d="M300 0 L420 0 L${f1(bp[0] + 230)} ${f1(bp[1] + 260)} L${f1(bp[0] - 230)} ${f1(bp[1] + 260)} Z" fill="url(#beam)" opacity="${f2(.9 * (1 - fade(t, 32, 48, .4, .4) * .6))}"/><ellipse cx="${f1(bp[0])}" cy="${f1(bp[1] + 60)}" rx="300" ry="280" fill="url(#spot)"/>`;
    if (t >= 14 && t < 16.6) s += flockUp(t);
    if (t >= 43.4 && t < 48.1) s += flockBack(t);
    s += `<g transform="${layer(c, 1)}">${bird(p)}</g>`;
    // ① 깃이 생길 때 작은 김
    if (t >= 2.3 && t < 3.1) { const [nx, ny] = scr(c, p.A[0], p.A[1] - 80); s += dust(nx, ny, 2.3, t, 8, 120); }
    // ③ 새 떼 외침(말 주머니 · 날카로운 테)
    const sh = fade(t, 14.4, 16.15, .12, .2);
    if (sh > 0) { const sc = .7 + .3 * back(win(t, 14.4, 14.65)), jx = Math.sin(t * 60) * 3;
      let pts = ''; for (let i = 0; i < 28; i++) { const a = i / 28 * 6.283, r = i % 2 ? 1 : 1.13; pts += (i ? ' L' : 'M') + f1(330 + Math.cos(a) * 270 * r) + ' ' + f1(850 + Math.sin(a) * 86 * r); }
      s += `<g opacity="${f2(sh)}" transform="translate(${f1(330 + jx)} 850) scale(${f2(sc)}) translate(-330 -850)"><path d="${pts} Z" fill="#fff" stroke="${DARK}" stroke-width="4"/></g>`;
      o.push(T(330 + jx, 850, 42, esc(D.SHOUT), '', sh, `color:${DARK};font-weight:900;transform:translate(-50%,-50%) scale(${f2(sc)})`)); }
    // ③ 바람 줄
    if (t >= 14.6 && t < 15.6) { const u = win(t, 14.6, 15.6); for (let i = 0; i < 6; i++) { const y = 380 + i * 60, x = lerp(-200, 900, u) - i * 60; s += `<path d="M${f1(x)} ${y} q60 -16 120 0 t120 0" stroke="#DCE3F5" stroke-width="3" fill="none" opacity="${f2(.35 * Math.sin(Math.PI * u))}"/>`; } }
    // ④ 미끄러짐 김 · 매달린 줄
    if (t >= 25.0 && t < 25.9) { const [hx, hy] = scr(c, 450, 690); s += dust(hx, hy, 25.0, t, 6, 70); }
    // ⑤ 「잠깐」 번쩍(작은 빛 하나)
    { const ia = ev('idea'), u = fade(t, ia, ia + .9, .08, .4); if (u > 0) { const [qx, qy] = scr(c, p.A[0] + 110, p.A[1] + 40); s += `<g opacity="${f2(u)}" transform="translate(${f1(qx)} ${f1(qy)}) scale(${f2(.6 + .4 * back(win(t, ia, ia + .25)))})"><circle r="34" fill="${GOLDT}" filter="url(#gl)"/><path d="M-9 -16 Q0 -30 9 -16 L5 8 H-5 Z" fill="#fff"/><rect x="-6" y="11" width="12" height="7" rx="2" fill="#fff"/></g>`; } }
    s += cards(t, o);
    s += `<g>${book(t, c)}</g>`;
    s += vows(t) + phone(t, o);
    // ⑩ 이름 세 번(말 주머니) · 이름 쾅 · 주소
    [[57.05, 170, 250], [57.45, 552, 210], [57.85, 360, 128]].forEach(([a, x, y], i) => { const op = fade(t, a, 58.32, .08, .14); if (op > 0) o.push(`<div class="bub" style="left:${x}px;top:${y}px;font-size:${[50, 56, 64][i]}px;opacity:${f2(op)};transform:translate(-50%,-50%) scale(${f2(.55 + .45 * back(win(t, a, a + .22)))})">${esc(D.NAME)}!</div>`); });
    const sl = ev('slam');
    if (t >= sl) { const u = win(t, sl, sl + .22), sc = lerp(2.6, 1, ease(u));
      o.push(T(360, 330, 150, esc(D.NAME), 'nm', cl(u * 3), `transform:translate(-50%,-50%) scale(${f2(sc)})`)); if (t < sl + .3) shake = `translate(${f1(Math.sin(t * 93) * 12 * (1 - win(t, sl, sl + .3)))}px,${f1(Math.cos(t * 79) * 12 * (1 - win(t, sl, sl + .3)))}px)`;
      s += dust(360, 360, sl, t, 10, 300); }
    { const si = ev('site'); o.push(T(360, 468, 44, esc(D.SITE), '', fade(t, si, 60.5, .3, .1), `color:${INK};font-weight:800;letter-spacing:1px`)); }
    s += curtains(t);
    document.getElementById('st').innerHTML = s; document.getElementById('ov').innerHTML = o.join('');
    document.getElementById('cam').style.transform = shake;
    caption(t);
    return document.body.innerText;
  };
  // 표지 「(이름)의 고민 1분」(VIDEO.title)
  window.poster = () => {
    const t = 4.8, c = {s: 1.15, tx: 360 - X1 * 1.15, ty: 800 - 691 * 1.15}, p = pose(t); p.o.lookY = -.5; p.o.lookX = .4; p.o.blink = 0; p.o.beakOpen = 0;
    let s = DEFS + sky(t, c) + `<g transform="${layer(c, 1)}">${tree(t)}</g>`;
    const bp = scr(c, p.A[0], p.A[1] - 150);
    s += `<path d="M300 0 L420 0 L${f1(bp[0] + 230)} ${f1(bp[1] + 260)} L${f1(bp[0] - 230)} ${f1(bp[1] + 260)} Z" fill="url(#beam)"/><ellipse cx="${f1(bp[0])}" cy="${f1(bp[1] + 60)}" rx="300" ry="280" fill="url(#spot)"/>`;
    s += `<g transform="${layer(c, 1)}">${bird(p)}</g>` + curtains(10);
    document.getElementById('st').innerHTML = s; document.getElementById('cam').style.transform = '';
    document.getElementById('ov').innerHTML = `<div class="ptitle">${esc(D.VTITLE)}</div>`;
    capEl.style.opacity = '0'; capIn.innerHTML = '';
    return document.body.innerText;
  };
  // 넘침 검사 — 보이는 글이 화면 밖 · 글상자 넘침 · 글상자 48px 아래
  window.fitCheck = () => {
    const bad = [];
    // 넘어가며 날아가는 카드(.fly)는 일부러 화면 밖으로 감
    for (const el of document.querySelectorAll('#ov .t, #ov .bub, #ov .card:not(.fly), #ov .ptitle')) { if (+getComputedStyle(el).opacity < .05) continue; const r = el.getBoundingClientRect(); if (r.left < 2 || r.right > 718 || r.top < 0 || r.bottom > 1280) bad.push('밖: ' + el.innerText.slice(0, 20) + ` [${Math.round(r.left)},${Math.round(r.right)}]`); }
    if (+capEl.style.opacity > .05 && capIn.innerText.trim()) { const z = parseFloat(capIn.style.fontSize); if (z < 48) bad.push('글상자 ' + z + 'px'); if (capIn.scrollHeight > 200 || capIn.scrollWidth > capIn.clientWidth + 1) bad.push('글상자 넘침: ' + capIn.innerText.slice(0, 20)); }
    return bad;
  };
}

const FONT_APP = `file://${ROOT}/site/app/fonts.css`, FONT_NEW = `file://${ROOT}/site/atlas/fonts.css`;
const page = `<!doctype html><meta charset="utf-8"><link rel="stylesheet" href="${FONT_NEW}"><link rel="stylesheet" href="${FONT_APP}"><style>
*{box-sizing:border-box;margin:0}
body{width:${W}px;height:${H}px;overflow:hidden;background:#070914;font-family:'Pretendard Variable',Pretendard,'Noto Sans CJK KR',sans-serif;-webkit-font-smoothing:antialiased;color:#F2EFE8;position:relative}
#cam{position:absolute;inset:0}#st{position:absolute;inset:0;width:${W}px;height:${H}px}#ov{position:absolute;inset:0}
.t{position:absolute;white-space:nowrap;font-weight:800;text-align:center;transform:translate(-50%,-50%);line-height:1.15}
.bub{position:absolute;background:#fff;color:#1A1420;font-weight:900;padding:12px 30px;border-radius:34px;white-space:nowrap;border:4px solid #E9B949;box-shadow:0 0 24px rgba(233,185,73,.45)}
.card{position:absolute;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:14px;transform-origin:50% 50%;background:#FBF7EC;border:3px solid #E9B949;border-radius:26px;box-shadow:0 10px 30px rgba(0,0,0,.35)}
.card .cn{font-size:34px;font-weight:800;color:#8A6B1F;letter-spacing:1px}.card .cq{font-size:76px;font-weight:900;color:#1A1420;letter-spacing:-1px;white-space:nowrap}
.nm{font-family:'Gowun Batang','Noto Serif CJK KR',serif;font-weight:700;color:transparent;background:linear-gradient(100deg,#E9B949 0%,#FFF6DA 45%,#FFE3A0 55%,#C4952F 100%);-webkit-background-clip:text;background-clip:text;filter:drop-shadow(0 0 18px rgba(233,185,73,.55));letter-spacing:6px}
.ptitle{position:absolute;left:24px;right:24px;top:296px;text-align:center;font-family:'Gowun Batang','Noto Serif CJK KR',serif;font-weight:700;font-size:66px;line-height:1.2;color:#FFE3A0;text-shadow:0 0 22px rgba(233,185,73,.55),0 3px 0 #07080B}
#cap{position:absolute;left:22px;right:22px;top:976px;height:212px;display:flex;align-items:center;justify-content:center;padding:6px 18px;border-radius:28px;background:rgba(9,10,22,.82);border:2px solid rgba(233,185,73,.55);opacity:0}
#capin{width:100%;max-height:200px;text-align:center;font-weight:800;line-height:1.24;letter-spacing:-.5px;color:#fff;word-break:keep-all;text-wrap:balance}
#cap .ks{color:#FFFFFF}#cap .ku{color:#B4B9C8}#cap .kc{color:#FFD98A;text-shadow:0 0 14px rgba(233,185,73,.8)}
#cap.k-title{background:rgba(9,10,22,.7);border-color:#E9B949}#cap.k-title #capin{font-family:'Gowun Batang','Noto Serif CJK KR',serif;font-weight:700;color:#FFE3A0;text-shadow:0 0 20px rgba(233,185,73,.6)}
#cap.k-fact{border:3px solid #E9B949;background:rgba(14,12,26,.9)}#cap.k-fact b{color:#FFD98A;font-weight:900}
#cap.k-promo{background:linear-gradient(100deg,#E9B949 0%,#FFE3A0 50%,#E9B949 100%);border-color:#FFF2C8}#cap.k-promo #capin{color:#1A1420;font-weight:900}
</style><body><div id="cam"><svg id="st" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg"></svg><div id="ov"></div></div>
<div id="cap"><div id="capin"></div></div>
<script>${drawSrc}
window.__D=${JSON.stringify(D)};
(${browserMain.toString()})();
</script></body>`;

// ── 굽기 문 — 그린 글 맞대기 ──
const BAD = [...new Set([...BRAND.was.flatMap(w => [w.ko, w.en]).filter(Boolean)])].map(w => new RegExp(w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i'));
BAD.push(/홍표/, /막비/, /커피 1잔/, /상품권 1장/);
const seen = new Set(), probs = new Set();
const look = txt => { for (const l of String(txt).replace(/\u00a0/g, ' ').split('\n')) if (l.trim()) seen.add(l.trim()); };
const NEED = [TITLE, ...LINES.filter(l => l.who === 'gt' || l.who === 'flock').map(l => l.text), FACT, PROMO, D.MSG, NAME + '!', NAME, SITE, ...QS, `1 / ${QS.length}`, `${QS.length} / ${QS.length}`];
const judge = () => {
  const all = [...seen].join('\n');
  for (const re of BAD) if (re.test(all)) stop('그린 글에 ' + re + ' 이(가) 나옴');
  const hitsAll = [...seen].flatMap(l => [...screenHits(l).map(w => '쓰지 않을 말 ' + w), ...ruinHits(l).map(x => '망치는 길 ' + x.word), ...gainHits(l).map(x => '수익 말 ' + (x.word ?? x))]);
  if (hitsAll.length) stop('그린 글에 걸림: ' + hitsAll.join(' · '));
  for (const need of NEED) if (!all.includes(need)) stop('그린 글에 「' + need + '」 이(가) 없음');
  if (probs.size) stop('넘침 · 글씨: ' + [...probs].slice(0, 8).join(' | '));
  return {lines: seen.size, need: NEED.length, words: 0};
};
const b = await chromium.launch({executablePath: exe});
const pg = await b.newPage({viewport: {width: W, height: H}});
pg.on('pageerror', e => stop('그림 쪽 오류: ' + e.message));
await pg.setContent(page, {waitUntil: 'load'});
await pg.evaluate(() => document.fonts.ready); await pg.waitForTimeout(400);
const shot = async (t, file, type = 'png') => { look(await pg.evaluate(x => window.render(x), t)); for (const p of await pg.evaluate(() => window.fitCheck())) probs.add(`${t.toFixed(2)}초 ${p}`); await pg.screenshot({path: file, type, ...(type === 'jpeg' ? {quality: 92} : {})}); };
const posterShot = async file => { const txt = await pg.evaluate(() => window.poster()); if (!txt.includes(VIDEO.title)) stop('표지에 「' + VIDEO.title + '」 없음'); for (const p of await pg.evaluate(() => window.fitCheck())) probs.add('표지 ' + p); await pg.screenshot({path: file, type: 'jpeg', quality: 88}); };
if (process.env.HP_POSTER_ONLY === '1') {
  await posterShot(path.join(OUT, 'makbi-poster.jpg')); console.log('poster', [...probs].join(' | ') || '넘침 0');
} else if (ONLY) {
  for (const t of ONLY) await shot(t, path.join(OUT, `t${String(t).replace('.', '_')}.png`));
  console.log('frames', ONLY.length, [...probs].join(' | ') || '넘침 0');
} else {
  const t0 = Date.now();
  const fdir = path.join(TMP, 'frames'); await fs.rm(fdir, {recursive: true, force: true}); await fs.mkdir(fdir, {recursive: true});
  const N = FPS * DUR;
  for (let i = 0; i < N; i++) {
    const t = i / FPS, txt = await pg.evaluate(x => window.render(x), t);
    if (i % 3 === 0) { look(txt); for (const p of await pg.evaluate(() => window.fitCheck())) probs.add(`${t.toFixed(2)}초 ${p}`); }
    await pg.screenshot({path: path.join(fdir, `f${String(i).padStart(4, '0')}.jpg`), type: 'jpeg', quality: 92});
  }
  await posterShot(path.join(TMP, 'poster.jpg'));
  const J = judge();
  const tFrames = (Date.now() - t0) / 1000;
  const wav = path.join(TMP, 'sound.wav');
  execFileSync('python3', [path.join(HERE, 'sound.py'), wav, path.join(TMP, 'cues.json')], {stdio: 'inherit'});
  const ff = (...a) => execFileSync('ffmpeg', ['-v', 'error', '-y', ...a], {stdio: 'inherit'});
  ff('-framerate', String(FPS), '-i', path.join(fdir, 'f%04d.jpg'), '-i', wav, '-c:v', 'libx264', '-preset', 'slow', '-crf', '22', '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-b:a', '128k', '-shortest', '-movflags', '+faststart', path.join(OUT, 'makbi-intro.mp4'));
  ff('-i', path.join(OUT, 'makbi-intro.mp4'), '-c:v', 'libvpx-vp9', '-b:v', '0', '-crf', '34', '-row-mt', '1', '-deadline', 'good', '-cpu-used', '4', '-c:a', 'libopus', '-b:a', '96k', path.join(OUT, 'makbi-intro.webm'));
  for (const f of ['makbi-intro.mp4', 'makbi-intro.webm']) {
    const d = Number(execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', path.join(OUT, f)]).toString());
    if (Math.abs(d - DUR) > 0.05) stop(f + ' 길이 ' + d + '초 — 60초가 아님');
  }
  await fs.copyFile(path.join(TMP, 'poster.jpg'), path.join(OUT, 'makbi-poster.jpg'));
  if (STILLS) { // 장면 사진 열 장 — 다 구운 mp4 에서 뽑음(장면마다 글상자가 다 보이는 때)
    await fs.mkdir(STILLS, {recursive: true});
    const AT = [4.6, 11.2, 20.6, 26.2, 31.0, 38.2, 46.4, 53.4, 56.4, 59.4];
    AT.forEach((t, i) => ff('-ss', String(t), '-i', path.join(OUT, 'makbi-intro.mp4'), '-frames:v', '1', path.join(STILLS, `scene-${String(i + 1).padStart(2, '0')}.png`)));
    await fs.writeFile(path.join(STILLS, 'cues.json'), JSON.stringify(CU, null, 1));
  }
  console.log('video', N, 'frames', DUR, 's · 그린 글', J.lines, '줄 · 맞댄 줄', J.need, '· 걸린 말 0 · 넘침 0 · 그리기', tFrames.toFixed(0), '초 · 모두', ((Date.now() - t0) / 1000).toFixed(0), '초');
}
await b.close();
