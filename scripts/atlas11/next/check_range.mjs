// 새 아틀란스 7단 「범위 · 확인」(/next/ p-range.js) ↔ 지금 아틀란스(/atlas/ viewRange) 맞대기 — 사장님 2026-10-17 04:23 「정말 빠르면서도 정밀하게 · 에이전트 총 동원해」
//   쓰는 법: node scripts/atlas11/next/check_range.mjs --base http://127.0.0.1:8826 [--all | --limit N] [--wide N] [--pw /opt/node-tools/] [--out 결과.json] [--shots 사진폴더]
//     --all = 모든 회사(+ 없는 주소 둘) · --limit N = 가장자리(셈 못 함 · 기록 없음 · 튄 날 · 봉인 안팎 · 긴 이름 …) 먼저 N곳(기본 50) · --wide N = 세 폭으로 볼 곳 수(기본 10 · --all 이면 40)
//   ① 회사마다 옛 쪽과 새 쪽을 같은 서버 · 같은 자료로 열어 맞댐
//      · 옛 쪽 글 마디(제목 · 줄 · 칸 머리 · 표 줄 · 접은 칸 · 자료 줄 · 「?」 줄) 하나하나가 새 쪽 글에 그대로 있음(접은 칸 글 포함 · 띄어쓰기만 맞춤)
//      · 숫자 낱말(% · 원 · 곳 · 배 · 일 · 번 · 년 · 월 · 호 · 억 원 · 조 원 …) — 옛 쪽에 n번 나오면 새 쪽에 n번 이상
//      · 막대 길이 · 흰 눈금(가운데값) 자리 · 막대 이름표(가운데값 글) · 표지(기록 · 조심 · 모름) 차례 = 옛 쪽과 같음
//   ② 새 쪽만: 챕터 일곱(7 범위 = 지금 단) · 다음 챕터(회사로 돌아가기) · 정직 표지가 그림 위 · 모형 막대에 빨강 · 파랑 없음 · 고리(아는 길만) ·
//      쓰지 않을 말 0(회사 글 data-proper 빼고) · 화면 오류 0 · 가로 넘침 0 · 누르는 자리 44px · 글 17px 넘게(접은 칸 연 채로도)
//   ③ 세 폭(320 · 360 · 390) — 없는 주소 · 긴 이름 · 긴 「파는 것」 · 셈 못 함 · 튄 날 줄 등 --wide 곳
//   일부러 다른 곳(p-range.js 머리 글 ①~⑤)은 아래 SAME_BUT 로 바꿔 맞댐 — 그 밖에 옛 쪽 글이 하나라도 빠지면 실패 · 끝 코드 1
//   ④ 2026-10-18 고도리 명령문 72개 [7] 6 · [8] 10 · [10] 4 ~ 8 (일꾼 S4r) — 옛 글은 새 낱말 · 소수점 없는 숫자(WORDS · roundDec)로 바꿔 맞댐 · 새 쪽만:
//      · 맨 위 요약 두 줄 「10번 중 n~m번」 · 막대 글 8개 「10번 중 n번」 · 「셈에 넣은 것」 한 줄 · 채점 칸 1개 — range.json 값에서 따로 셈(tenChecks)
//      · 접은 칸 밖 소수점 숫자 · 「몬테카를로」 · 「가운데값」 0 · 접은 칸(전문가용) 안 정확한 값 = 옛 글 그대로 · 옛 낱말(갈래 · 몸값 · 20거래일 …) 0
//      · 모양 규칙(page_rules.mjs): 음수 바깥 여백 0 · 겹친 형제 칸 0 · 글씨 6가지 이하 · 글 시작 왼쪽 줄 3줄 이하 · css 글 규칙
//      · 채점 지난 날 길(⑤): core.mcEnd · range.json asOf 를 거래일 안 날로 바꿔 열고 값(그날 실제 % · 번 길 · 크게 잃는 길 · 들었나)을 회사 파일에서 따로 셈
import fs from 'node:fs/promises';
import fss from 'node:fs';
import path from 'node:path';
import {createRequire} from 'node:module';
import {fileURLToPath} from 'node:url';
import {oldToNewDeep, TITLE_TAIL} from './rename.mjs'; // 이름 바꾸기(2026-10-17 아틀란스 → 보드리)
import {fetchJSON, watch, settle, timer, netSummary} from './net.mjs'; // 망 탈에만 다시 받기 · 다시 열기 · 옛 쪽 · 새 쪽 시간(2026-10-17 고도리 명령문 [1] 8 · 9 — 지금 사이트 검사 「자료 · fetch failed」)
import {shardOf} from './shard/part.mjs'; // --shard k/n = 한 번 다 돌 때의 일감(회사 · 없는 주소 · 빈 날 길 · 세 폭)을 n 몫으로 가른 k 번째만(깃허브 여러 대 · 합치기 shard/merge.mjs · 2026-10-18 고도리 길 1)
import {pageRules, cssRules} from './page_rules.mjs'; // 모양 규칙(음수 여백 · 겹침 · 글씨 6가지 · 왼쪽 줄 3줄 · css 글 규칙 — 채널 검사와 같이 씀 · 2026-10-18 명령문 [7] 6 · [10] 5 ~ 8)
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');
const argv = process.argv.slice(2);
const arg = (k, d) => { const i = argv.indexOf(k); return i >= 0 && argv[i + 1] != null && !argv[i + 1].startsWith('--') ? argv[i + 1] : d; };
const has = k => argv.includes(k);
const require = createRequire(arg('--pw', '/opt/node-tools/'));
const {chromium} = require('playwright');
const base = arg('--base', 'http://127.0.0.1:8826').replace(/\/$/, '');
const ALL = has('--all'), LIMIT = ALL ? 0 : Math.max(1, Number(arg('--limit', '50')) || 50);
const WIDE = Math.max(0, Number(arg('--wide', ALL ? '40' : '10')) || 0);
const OUT = arg('--out', null), SHOTS = arg('--shots', null), SHOW = String(arg('--show', '')).split(',').filter(Boolean); // --show 번호,번호 = 그 회사의 옛 글 마디 · 맞댐 결과를 찍음(살펴보기)
const t0 = Date.now(), fails = [], counts = {}, tm = timer(t0);
const fail = (k, x) => { if (fails.length < 400) fails.push([k, String(x).slice(0, 400)]); counts.fail = (counts.fail || 0) + 1; };
const bump = (k, n = 1) => { counts[k] = (counts[k] || 0) + n; };

/* 자료 — 서버에서(옛 쪽 · 새 쪽이 읽는 것과 같은 파일) */
const getJ = f => fetchJSON(base + '/atlas/data/' + f, f); // 망 탈(끊김 · 429 · 5xx)에만 기다렸다 다시 · 404 는 바로 실패(net.mjs)
const [core, mkt, comp, range, names, upd, time, days] = await Promise.all(['core.json', 'mkt.json', 'comp.json', 'range.json', 'names.json', 'updates.json', 'time.json', 'days.json']
  .map(f => getJ(f).catch(e => { fail('자료', e.message); return null; })));
if (!core || !mkt || !comp || !range) { console.error(JSON.stringify({ok: false, fails})); process.exit(1); }
const CO = mkt.companies, codes = Object.keys(CO), PK = comp.companies || {};
const N = n => Number(n).toLocaleString('ko-KR');
const enc = encodeURIComponent;
const NP = core.funnel?.picked ?? '?', pickName = `${core.rules?.name ?? '고른'} ${NP}곳`;
const BANNED = ['추천', '매수', '매도', '팔라', '사세요', '파세요', '예측', '확률', '유망', '기회', '신호', '저평가', '1위', 'TOP'];
try { // 지운 36곳 화면 글(inspect4.mjs OLD36_TEXT 그대로)
  const m = /export const OLD36_TEXT = (\[[^\]]*\]);/.exec(await fs.readFile(path.join(ROOT, 'scripts/atlas11/t365/inspect4.mjs'), 'utf8'));
  if (m) BANNED.push(...JSON.parse(m[1].replace(/'/g, '"')));
} catch { /* 저장소 밖에서 돌리면 기본 목록만 */ }
const hasSlots = Array.isArray(upd?.slots) && upd.slots.length > 0;

/* 일부러 다른 곳 — 옛 글을 이렇게 바꿔 맞댐(p-range.js 머리 글과 같은 목록) */
const SAME_BUT = [
  ['특정 종목의 매수 · 매도 · 보유 또는 시장 전망을 권하지 않습니다.', '특정 종목의 사고팔기 · 계속 갖고 있기 또는 시장 전망을 권하지 않습니다.'], // ③ 쓰지 않을 말
  ['「업데이트 기록」(도움말 ?)에 남습니다.', '「업데이트 기록」에 남습니다.'], // ② 새 화면에는 도움말 ? 단추가 없음 — 고리로
];
const pathsFix = pk => (pk || range.spec?.others?.paths == null ? [] : [[`20일을 뽑아 ${N(range.spec.paths)}번`, `20일을 뽑아 ${N(range.spec.others.paths)}번`]]); // ① 고른 곳 밖은 따로 뽑은 수

/* 2026-10-18 고도리 명령문 72개 [10] 1 · 4 · [8] 10 (일꾼 S4r) — 옛 글을 새 말 · 소수점 없는 숫자 · 새 표지(::before 글자)로 바꿔 맞댐
   · 낱말: 20거래일 → 한 달 · 갈래 → 큰 업종 · 몸값 → 회사 크기(낱말표 glossary.js — rename.mjs oldToNewDeep 이 옛 글에 같이 적용) · 가운데값 → 중간 회사 · 「몬테카를로」는 접은 칸 밖 제목에서 뺌
   · 확인표 줄(기록 · 조심 · 모름)의 소수점 % · 배 · 조 원 은 정수로(같은 반올림: 크기로 반올림 · 100조 넘으면 정수 조 · 그 밑은 「32조 7,000억 원」)
   · 접은 칸(전문가용) 안의 정확한 값(방향 줄 · 범례 · 방향마다 … 뽑아 n번)은 옛 글 그대로
   · 옛 「한 달 범위 맞대 볼 날」 줄은 채점 칸으로 옮겨 빠짐(아래 tenChecks 가 채점 칸을 따로 봄) */
const WORDS = [
  ['20거래일(약 한 달)', '한 달'],
  ['몬테카를로 4방향', '4방향'],
  ['같은 갈래 ', '같은 큰 업종 '],
  ['? 갈래 자료 없음', '? 큰 업종 자료 없음'],
  ['· 기록 ! 조심 ? 모름', '기록 조심 모름'], // 범례: 동그라미 안 글자(· ! ?)는 꾸밈 글(::before)이라 글 마디가 아님
];
const rdi = a => Math.floor(Math.abs(a) + 0.5 + 1e-7), numOf = s => Number(String(s).replace(/,/g, '')); // 옛 한 자리 값 → 정수(크기로 반올림)
const roundDec = s => String(s)
  .replace(/(−?)(\d[\d,]*(?:\.\d)?)조 원/g, (_, sg, num) => { const t = numOf(num); if (t >= 100) return sg + N(rdi(t)) + '조 원'; const k = Math.round(t * 10), a = Math.floor(k / 10), r = k % 10; return sg + a + '조' + (r ? ' ' + N(r * 1000) + '억' : '') + ' 원'; })
  .replace(/\((\d+)곳 가운데값 (\d[\d,]*(?:\.\d)?)배\)/g, (_, n, x) => `(${n}곳 중간 회사는 ${N(rdi(numOf(x)))}배)`)
  .replace(/(\d[\d,]*)\.(\d)배/g, (_, a, b) => N(rdi(numOf(a + '.' + b))) + '배')
  .replace(/([+−]?)(\d[\d,]*)\.(\d+)%/g, (_, sg, a, b) => { const v = rdi(numOf(a + '.' + b)); return v === 0 ? '0%' : sg + N(v) + '%'; }); // (\d+) = 회사 글(파는 것)에 든 「30.05%」도 정수로 — 화면 p-range.js prodDec
const isChkSeg = s => /^(기록|조심|모름): /.test(s); // 확인표 한 줄
/** 옛 글 마디 하나 → 새 쪽에 있어야 할 글(빈 글 = 옮기지 않은 줄) */
const fixSeg = (s0, pk) => {
  let s = String(s0).replace(/^[·!?](?=\S)/, ''); // 줄 앞 표지 글자
  if (/^한 달 범위 맞대 볼 날 /.test(s)) return '';
  s = [...SAME_BUT, ...WORDS, ...pathsFix(pk)].reduce((a, [x, y]) => a.split(x).join(y), s).replace(/\d+거래일 (선이|전\()/g, '한 달 $1');
  if (isChkSeg(s)) s = roundDec(s).replace(/^(기록|조심|모름): 몸값 /, '$1: 회사 크기 ');
  return s;
};
/** 옛 쪽 전체(글 마디 · 흐르는 글)를 한꺼번에 — 흐르는 글은 마디마다 바뀐 글로 갈아 끼움(숫자 낱말 맞대기용) */
const fixAll = (o, pk) => {
  let text = o.text; const segs = [];
  for (const s of o.segs) { const t = fixSeg(s, pk); if (t !== s) { const i = text.indexOf(s); if (i >= 0) text = text.slice(0, i) + t + text.slice(i + s.length); } if (t) segs.push(t); }
  return {segs, text};
};
const T10 = v => Math.floor(v / 10 + 0.5 + 1e-7); // 퍼센트 → 10번 중 몇 번(5% 밑 = 0번) — 화면 p-range.js T10 과 따로 쓴 같은 뜻
const tenRng = a => { const lo = Math.min(...a), hi = Math.max(...a); return lo === hi ? `10번 중 ${lo}번` : `10번 중 ${lo}~${hi}번`; };
const ymdK = d => { const [y, m, x] = String(d).split('-').map(Number); return `${y}년 ${m}월 ${x}일`; };
const ddayK = d => { const k = new Date(Date.now() + 9 * 36e5), t = Date.UTC(k.getUTCFullYear(), k.getUTCMonth(), k.getUTCDate()), [y, m, x] = String(d).split('-').map(Number); return Math.round((Date.UTC(y, m - 1, x) - t) / 864e5); };
const EXACT = [/^[가-힣 ]+장번 길 [\d,.]+%크게 잃는 길 [\d,.]+%$/, /^번 길크게 잃는 길흰 눈금 = /, /^방향마다 지난 날들에서 /]; // 접은 칸(전문가용) 안에 옛 글 그대로 있어야 하는 마디

/* 볼 회사 — 가장자리 먼저(셈 못 함 · 기록 없음 · 튄 날 · 봉인 안팎 · 긴 이름 · 회사 글에 쓰지 않을 말 …) */
const missingCodes = ['000000']; // 이름표에도 없는 번호
{ const r = (names?.rows || []).find(x => !CO[x.c] && !PK[x.c]); if (r) missingCodes.push(r.c); } // 이름표에는 있는데 회사가 아닌 것(우선주 · 펀드 …)
const edge = new Map(), longProd = [];
const tag = (c, why) => { if ((CO[c] || PK[c]) && !edge.has(c)) edge.set(c, why); };
const kinds = {};
const tagK = (c, why, max = 2) => { if ((kinds[why] = (kinds[why] || 0) + 1) <= max) tag(c, why); };
for (const [c, x] of Object.entries(range.companies || {})) if (!x?.ok) tagK(c, '고른 곳 셈 못 함');
for (const [c, x] of Object.entries(range.others || {})) if (!x?.ok) tagK(c, '밖 셈 못 함');
for (const c of codes) if (!PK[c] && !range.others?.[c]) tagK(c, '범위 없음');
const capM = new Set((time?.capsules?.[0]?.members || []).map(m => m[0]));
for (const c of Object.keys(PK)) tagK(c, capM.has(c) ? '고른 곳 · 봉인 1호' : '고른 곳 · 봉인 밖', 1);
for (const c of codes) if (!PK[c]) tagK(c, capM.has(c) ? '밖 · 봉인 1호' : '밖 · 봉인 밖', 1);
for (const c of codes) if (/[A-Z]/.test(c)) tagK(c, '글자 섞인 번호', 1);
for (const c of [...codes].sort((a, b) => CO[b].n.length - CO[a].n.length).slice(0, 2)) tag(c, '긴 이름');
const coDir = path.join(ROOT, 'site/atlas/data/co'); // 저장소 회사 파일이 있으면 가장자리를 더 찾음(서버 자료와 다르면 고르기만 달라짐 · 맞대기는 서버 것)
if (fss.existsSync(coDir)) {
  const lim = days?.dates ? days.dates[Math.max(0, days.dates.length - 253)] : null;
  for (const c of codes) {
    let x; try { x = JSON.parse(fss.readFileSync(path.join(coDir, c + '.json'), 'utf8')); } catch { continue; }
    const o = PK[c] || x.c || {};
    if (!o.fin || o.fin.av == null) tagK(c, '번 돈 기록 없음');
    else if (o.fin.key === 'net') tagK(c, '순이익 기준');
    else if (o.fin.bv > o.fin.av) tagK(c, '번 돈 늘었음', 1);
    else tagK(c, '번 돈 줄었음', 1);
    if (o.per == null) tagK(c, '몸값 배수 없음');
    if (o.mdd1y == null) tagK(c, '1년 기록 없음');
    else if (o.mdd1y <= -50) tagK(c, '1년 반 넘게 빠짐');
    if (lim && (x.jumps || []).filter(j => j[0] >= lim).length) tagK(c, (x.jumps || []).filter(j => j[0] >= lim).length > 1 ? '튄 날 여러 번' : (PK[c] ? '고른 곳 튄 날' : '튄 날'));
    if (!o.products) tagK(c, '파는 것 없음');
    else { const two = o.products.split(',').slice(0, 2).join(',').trim(); longProd.push([c, two.length]); if (BANNED.some(w => two.includes(w))) tagK(c, '회사 글에 쓰지 않을 말', 3); }
    if (o.fin?.a && !/\.12$/.test(o.fin.a)) tagK(c, '12월 아닌 결산', 1);
  }
  for (const [c] of longProd.sort((a, b) => b[1] - a[1]).slice(0, 2)) tag(c, '긴 파는 것');
}
for (const g of core.groups || []) if (g.low && g.n && g.low.below / g.n >= 0.8) { const c = codes.find(x => { const I = (core.industries || []).find(i => i.name === CO[x].i); return I?.g === g.id; }); if (c) tagK(c, '쏠림 조심', 1); }
let list;
if (ALL) list = [...codes];
else {
  const pk = Object.keys(PK), oth = codes.filter(c => !PK[c]), step = Math.max(1, Math.floor(oth.length / Math.max(1, LIMIT)));
  const spread = oth.filter((_, i) => i % step === 0), mix = [];
  for (let i = 0; i < Math.max(pk.length, spread.length); i++) { if (pk[i]) mix.push(pk[i]); if (spread[i]) mix.push(spread[i]); }
  list = [...new Set([...edge.keys(), ...mix])].slice(0, LIMIT);
}
list = [...new Set([...SHOW.filter(c => CO[c] || PK[c]), ...list])];
const SH = shardOf(); // 몫(--shard k/n · 없으면 모두 내 몫)
const wideSet = [...new Set([...missingCodes, ...[...edge.entries()].filter(([, w]) => /긴|셈 못 함|튄 날 여러|범위 없음|쓰지 않을 말/.test(w)).map(([c]) => c), ...list])].slice(0, WIDE);

/* 브라우저 하나 · 칸 둘(옛 · 새) */
const exe = '/opt/pw-browsers/chromium', b = await chromium.launch((await fs.stat(exe).catch(() => null)) ? {executablePath: exe} : {});
async function tab(width, height = 640) {
  const ctx = await b.newContext({viewport: {width, height}, deviceScaleFactor: 1, hasTouch: true, reducedMotion: 'reduce'});
  const p = await ctx.newPage(); p._errs = [];
  p.on('pageerror', e => p._errs.push(e.message)); p.on('console', m => { if (m.type() === 'error') p._errs.push(m.text()); });
  return p;
}
const oldUrl = c => base + '/atlas/#/c/' + c + '/range', newUrl = c => base + '/next/?dev=1#/w/' + c + '/range';
const nameOf = c => (PK[c]?.name ?? CO[c]?.n ?? null);
const missHead = c => { const r = (names?.rows || []).find(x => x.c === c); return r ? `${r.n} — 지금 ${pickName} 밖` : '없는 주소입니다'; };
// 여는 둘 — 망 탈(이 사이트 요청 끊김 · 429 · 5xx · 15초 넘게 답 없음)이 있었던 열기는 믿지 않고 새로 고쳐 다시(net.mjs settle · 망 탈 없이 못 그리면 앞과 같은 실패) · 여는 데 쓴 때를 쪽마다 셈(tm)
async function openOld(p, c) {
  const want = nameOf(c) ? nameOf(c) + ' — 범위 · 확인' : missHead(c), url = oldUrl(c);
  const ok = await tm.old(() => settle(p, async () => {
    if (!p.url().startsWith(base + '/atlas/')) await p.goto(url); else await p.evaluate(h => { location.hash = h; }, '#/c/' + c + '/range');
    // 없는 주소: 이름표에 있으면 이름을 받은 뒤에야 제목이 바뀜(want = 바뀐 제목) · 없으면 받아도 글이 그대로
    return p.waitForFunction(([w, slots]) => {
      const v = document.querySelector('#view'); if (!v || v.querySelector('.boot')) return false;
      if ((v.querySelector('h1')?.textContent || '') !== w) return false;
      const t = v.textContent; return !t.includes('여는 중') && !(slots && t.includes('다음 회차 ?'));
    }, [want, hasSlots], {timeout: 20000}).then(() => true, () => false);
  }, {what: '옛 쪽 ' + c, fail}));
  if (ok === false) fail('옛 쪽 덜 열림', c + ' ' + want);
  return !!ok;
}
async function openNew(p, c) {
  const want = nameOf(c) ? nameOf(c) + ' — 범위 · 확인' : missHead(c), url = newUrl(c);
  const ok = await tm.new(() => settle(p, async () => {
    if (!p.url().startsWith(base + '/next/')) await p.goto(url); else await p.evaluate(h => { location.hash = h; }, '#/w/' + c + '/range');
    return p.waitForFunction(w => { const v = document.querySelector('main#view'); return !!v && !v.querySelector('.boot') && (v.querySelector('h1')?.textContent || '') === w; }, want, {timeout: 20000}).then(() => true, () => false);
  }, {what: '새 쪽 ' + c, fail}));
  if (ok === false) fail('새 쪽 덜 열림', c + ' ' + want + ' · 지금 「' + (await p.evaluate(() => document.querySelector('main#view h1')?.textContent ?? document.querySelector('main#view')?.textContent?.slice(0, 80) ?? '')) + '」');
  return !!ok;
}
/** 옛 쪽 — 글 마디 · 숫자 · 막대 · 표지(옮기지 않은 조각은 뺌: 단 숫자 줄 · 3단 회사로 줄 · 꽃밭 · 친구 소개 · 미국 판 고리) */
const readOld = p => p.evaluate(() => {
  const v = document.querySelector('#view .vw') || document.querySelector('#view'), cl = v.cloneNode(true);
  for (const s of ['nav.steps ol', '.links2', 'footer .links', '.foot-mo', '.boot']) cl.querySelectorAll(s).forEach(e => e.remove());
  const norm = s => String(s).replace(/\u00a0/g, ' ').replace(/\s+/g, ' ').trim();
  const segs = [...cl.querySelectorAll('h1, h2, small, p, li, summary, .why')].map(e => norm(e.textContent)).filter(Boolean);
  return {segs, text: norm(cl.textContent),
    aria: [...v.querySelectorAll('ul.dirbars [role="img"]')].map(e => norm(e.getAttribute('aria-label'))),
    bw: [...v.querySelectorAll('ul.dirbars .db')].map(e => e.style.width), mk: [...v.querySelectorAll('ul.dirbars .dm')].map(e => e.style.left),
    marks: [...v.querySelectorAll('ul.chk > li')].map(li => { const m = li.querySelector('.m'); return (m.classList.contains('no') ? 'no' : m.classList.contains('q') ? 'q' : 'ok') + m.textContent; }),
    markTx: [...v.querySelectorAll('ul.chk > li')].map(li => norm(li.textContent)), // 줄 글(채점 칸으로 옮긴 「한 달 범위 맞대 볼 날」 줄의 표지를 빼려고)
    tone: [...v.querySelectorAll('ul.chk span.num:is(.up, .down, .flat)')].map(e => (e.classList.contains('up') ? 'up' : e.classList.contains('down') ? 'dn' : e.textContent === '?' ? 'q' : 'fl') + ' ' + e.textContent)}; // 지나온 1년 % 색(옛 「?」 = 회색 → 새 화면 금빛 ? — 뜻 같음)
});
const readNew = p => p.evaluate(() => {
  const v = document.querySelector('main#view'), norm = s => String(s).replace(/\u00a0/g, ' ').replace(/\s+/g, ' ').trim();
  const cl = v.cloneNode(true); cl.querySelectorAll('[data-proper]').forEach(e => e.remove());
  const model = v.querySelector('.prange-model'), pic = v.querySelector('.prange-sum, .prange-chart, .prange-qline'); // 정직 표지는 맨 위 요약 · 그림보다 앞
  const bars = [...v.querySelectorAll('.prange-b')].map(e => getComputedStyle(e).backgroundImage + ' ' + getComputedStyle(e).backgroundColor + ' ' + getComputedStyle(e).borderTopColor);
  const one = sel => { const e = v.querySelector(sel); return e ? norm(e.textContent) : null; };
  const out = v.cloneNode(true); out.querySelectorAll('[data-proper], details, h1, .chaps').forEach(e => e.remove()); // 접은 칸 · 회사 글 · 이름 · 챕터 줄 밖
  return {text: norm(v.textContent), plain: norm(cl.textContent), outside: norm(out.textContent), fold: one('details.prange-pro'),
    sums: [...v.querySelectorAll('.prange-sum > p.prange-s')].map(e => norm(e.textContent)), labels: [...v.querySelectorAll('.prange-chart .prange-lb b')].map(e => norm(e.textContent)),
    inp: one('.prange-inp'), score: one('.prange-score'), nSum: v.querySelectorAll('.prange-sum').length, nChart: v.querySelectorAll('.prange-chart').length, nInp: v.querySelectorAll('.prange-inp').length, nScore: v.querySelectorAll('.prange-score').length,
    aria: [...v.querySelectorAll('.prange-tr[role="img"]')].map(e => norm(e.getAttribute('aria-label'))),
    bw: [...v.querySelectorAll('.prange-chart .prange-b')].map(e => e.style.width), xbw: [...v.querySelectorAll('.prange-xchart .prange-b')].map(e => e.style.width), mk: [...v.querySelectorAll('.prange-m')].map(e => e.style.left),
    marks: [...v.querySelectorAll('ul.prange-chk > li')].map(li => (li.classList.contains('prange-no') ? 'no' : li.classList.contains('prange-q') ? 'q' : 'ok') + li.querySelector('.prange-mk').getAttribute('data-m')), // 표지 글자는 꾸밈 글(::before data-m)
    tone: [...v.querySelectorAll('ul.prange-chk span.prange-n:is(.up, .dn, .fl, .q)')].map(e => [...e.classList].find(x => ['up', 'dn', 'fl', 'q'].includes(x)) + ' ' + e.textContent),
    chaps: [...v.querySelectorAll('.chaps .cp')].map(e => ({a: e.tagName === 'A', href: e.getAttribute('href'), now: e.classList.contains('now'), t: norm(e.textContent)})),
    next: [...v.querySelectorAll('.chap-next')].map(a => [a.getAttribute('href'), norm(a.textContent)]),
    hrefs: [...v.querySelectorAll('a[href]')].map(a => a.getAttribute('href')),
    modelFirst: !!(model && pic && (model.compareDocumentPosition(pic) & Node.DOCUMENT_POSITION_FOLLOWING)), hasPic: !!pic, bars, title: document.title};
});
/** 모양 — 가로 넘침 · 누르는 자리 · 글 크기(접은 칸 열고 한 번 더) */
const layout = p => p.evaluate(async () => {
  const out = [], v = document.querySelector('main#view'), vw = document.documentElement.clientWidth;
  const one = tag => {
    if (document.documentElement.scrollWidth > vw) out.push(tag + ' 가로 넘침 ' + document.documentElement.scrollWidth + '>' + vw);
    const inScroll = e => { for (let x = e.parentElement; x && x !== v; x = x.parentElement) { const o = getComputedStyle(x).overflowX; if (o === 'auto' || o === 'scroll') return true; } return false; }; // 옆으로 미는 줄(챕터 칩 줄) 안은 칸 밖이 아님
    for (const e of v.querySelectorAll('*')) { const r = e.getBoundingClientRect(); if (r.width && r.right > vw + 0.5 && getComputedStyle(e).position !== 'absolute' && !inScroll(e)) { out.push(tag + ' 칸 밖 ' + (e.className || e.tagName) + ' ' + Math.round(r.right)); break; } }
    for (const e of v.querySelectorAll('a, button, summary')) { const r = e.getBoundingClientRect(); if (!r.width || !r.height) continue; if (r.height < 43.5 || r.width < 43.5) out.push(tag + ' 누르는 자리 ' + (e.textContent || '').trim().slice(0, 20) + ' ' + Math.round(r.width) + '×' + Math.round(r.height)); }
    const w = document.createTreeWalker(v, NodeFilter.SHOW_TEXT);
    for (let n = w.nextNode(); n; n = w.nextNode()) {
      if (!n.textContent.trim()) continue; const el = n.parentElement; if (el.closest('.prange-sr')) continue;
      const r = el.getBoundingClientRect(); if (!r.width || !r.height) continue;
      const fs = parseFloat(getComputedStyle(el).fontSize); if (fs < 16.95) { out.push(tag + ' 글 ' + fs + 'px 「' + n.textContent.trim().slice(0, 16) + '」'); break; }
    }
  };
  one('닫힌'); v.querySelectorAll('details').forEach(d => { d.open = true; }); await new Promise(r => requestAnimationFrame(() => r())); one('연');
  v.querySelectorAll('details').forEach(d => { d.open = false; });
  return out;
});
const knownHref = (h, c) => {
  if (['#/', '#/time', '#/up', '#/find', 'https://kind.krx.co.kr', 'https://dart.fss.or.kr'].includes(h)) return true;
  let m = /^#\/w\/([^/]+)(?:\/(past|rivals|grow|range))?$/.exec(h); if (m) return decodeURIComponent(m[1]) === c && !!(CO[c] || PK[c]);
  if ((m = /^#\/ch\/([ig])\/(.+)$/.exec(h))) { const x = decodeURIComponent(m[2]); return m[1] === 'i' ? (core.industries || []).some(i => i.name === x) : (core.groups || []).some(g => g.id === x); }
  return false;
};
const TOK = /[+−]?\d[\d,]*(?:\.\d+)?(?: ?억 원| ?조 원| ?만 원|%|거래일|원|곳|배|일|번|년|월|호)?/g;
const bag = s => { const m = new Map(); for (const t of s.match(TOK) || []) m.set(t, (m.get(t) || 0) + 1); return m; };
const UPDN = ['rgb(255, 90, 101)', 'rgb(91, 150, 255)', 'rgb(208, 32, 46)', 'rgb(30, 91, 216)', 'rgb(255, 106, 61)', 'rgb(108, 134, 255)']; // 먹빛 판 + 흰 판(2026-10-19) 오름 · 내림

/** 맞대기 하나 — o = 옛 쪽 · n = 새 쪽 · where = 실패 글 앞머리 · chart = 그림 · 챕터 · 다음 챕터까지 볼지(회사 화면) */
function compare(c, o0, n, where, chart) {
  const o = oldToNewDeep(o0); // 옛 쪽 글은 이름만 새 이름으로(아틀란스 · ATLAS → 보드리 · rename.mjs — 「ATLAS 는 아직 …」 → 「보드리는 아직 …」)
  const pk = !!PK[c], F = fixAll(o, pk), fix = s => fixSeg(s, pk); // F = 새 말로 바꾼 옛 글(2026-10-18 S4r)
  if (SHOW.includes(c)) console.log(JSON.stringify({code: c, where, segs: o.segs.map(s => [n.text.includes(fix(s)) ? 'O' : 'X', fix(s)]), aria: [o.aria, n.aria], bw: [o.bw, n.bw, n.xbw], mk: [o.mk, n.mk], marks: [o.marks, n.marks], chaps: n.chaps, next: n.next}, null, 1));
  // ① 옛 글 마디 모두 새 쪽에
  let lost = 0;
  for (const t of F.segs) { if (!n.text.includes(t)) { lost++; if (lost <= 3) fail('옛 글 빠짐', where + ' 「' + t.slice(0, 160) + '」'); } }
  bump('글 마디', F.segs.length);
  // 접은 칸(전문가용) 안의 정확한 값 = 옛 글 그대로(방향 줄 · 범례 · 방향마다 … 뽑아 n번)
  if (chart) for (const t of F.segs) if (EXACT.some(r => r.test(t)) && !(n.fold ?? '').includes(t)) { fail('정확한 값이 접은 칸 안에 없음', where + ' 「' + t.slice(0, 80) + '」'); break; }
  // 숫자 낱말
  const ob = bag(F.text), nb = bag(n.text);
  for (const [t, k] of ob) if ((nb.get(t) || 0) < k) fail('숫자 빠짐', `${where} 「${t}」 옛 ${k} · 새 ${nb.get(t) || 0}`);
  bump('숫자 낱말', [...ob.values()].reduce((a, x) => a + x, 0));
  if (chart) {
    if (JSON.stringify(o.aria) !== JSON.stringify(n.aria)) fail('막대 이름표(가운데값)', where + ' ' + JSON.stringify(n.aria).slice(0, 160) + ' ≠ ' + JSON.stringify(o.aria).slice(0, 160));
    if (JSON.stringify(o.bw) !== JSON.stringify(n.bw)) fail('막대 길이', where + ' ' + n.bw.join(',') + ' ≠ ' + o.bw.join(','));
    if (JSON.stringify(o.bw) !== JSON.stringify(n.xbw)) fail('막대 길이(접은 칸)', where + ' ' + n.xbw.join(',') + ' ≠ ' + o.bw.join(','));
    if (JSON.stringify(o.mk) !== JSON.stringify(n.mk)) fail('흰 눈금 자리', where + ' ' + n.mk.join(',') + ' ≠ ' + o.mk.join(','));
    const omarks = o.marks.filter((_, i) => !/^[·!?]?한 달 범위 맞대 볼 날 /.test(o.markTx?.[i] ?? '')); // 옮긴 줄의 표지는 뺌
    if (JSON.stringify(omarks) !== JSON.stringify(n.marks)) fail('기록 · 조심 · 모름 표지', where + ' ' + n.marks.join(' ') + ' ≠ ' + omarks.join(' '));
    if (JSON.stringify(o.tone.map(roundDec)) !== JSON.stringify(n.tone)) fail('오름 · 내림 색', where + ' ' + n.tone.join(',') + ' ≠ ' + o.tone.map(roundDec).join(','));
    tenChecks(c, n, where);
    // ② 새 쪽만 — 챕터 일곱 · 다음 챕터 · 정직 표지 · 모형 막대 색
    const I = (core.industries || []).find(i => i.name === CO[c]?.i), G = I ? (core.groups || []).find(g => g.id === I.g) : null, e = enc(c);
    const want = [G ? '#/ch/g/' + enc(G.id) : null, I ? '#/ch/i/' + enc(I.name) : null, '#/w/' + e, '#/w/' + e + '/past', '#/w/' + e + '/rivals', '#/w/' + e + '/grow', '#/w/' + e + '/range'];
    const got = n.chaps.map(x => (x.a ? x.href : null)), now = n.chaps.filter(x => x.now);
    if (n.chaps.length !== 7 || JSON.stringify(got) !== JSON.stringify(want)) fail('챕터 일곱', where + ' ' + JSON.stringify(got));
    if (now.length !== 1 || !/^7범위/.test(now[0].t) || now[0].href !== '#/w/' + e + '/range') fail('지금 단(7 범위)', where + ' ' + JSON.stringify(now));
    if (n.next.length !== 1 || n.next[0][0] !== '#/w/' + e || n.next[0][1] !== '회사로 돌아가기 ›') fail('다음 챕터', where + ' ' + JSON.stringify(n.next));
    if (!n.hasPic || !n.modelFirst) fail('정직 표지가 그림 위', where);
    if (!n.text.includes('7단 중 7단 · 범위 · 확인 · 셈')) fail('앎의 종류 줄', where);
    for (const x of n.bars) if (UPDN.some(u => x.includes(u))) { fail('모형 막대에 오름 · 내림 색', where + ' ' + x.slice(0, 120)); break; }
    if (n.title !== nameOf(c) + ' — 범위 · 확인' + TITLE_TAIL) fail('창 제목', where + ' ' + n.title);
  }
  for (const h of n.hrefs) { bump('고리'); if (!knownHref(h, c)) fail('모르는 고리', where + ' ' + h); }
  for (const w of BANNED) if (n.plain.includes(w)) fail('쓰지 않을 말', where + ' 「' + w + '」');
}

/** 새 쪽만(2026-10-18 고도리 명령문 [8] 10 · [10] 4 · 일꾼 S4r) — range.json 값에서 따로 셈해 맞댐
 *   · 맨 위 요약 두 줄 「10번 중 n~m번」(번 길 · 크게 잃는 길 = 방향 넷의 가장 작은 값 ~ 가장 큰 값) · 막대 글 8개 「10번 중 n번」
 *   · 「셈에 넣은 것」 한 줄(window · dirs · paths) · 채점 칸 하나(정한 날 · 안 지났으면 「?」 + D-n)
 *   · 접은 칸 밖: 소수점 숫자 · 「몬테카를로」 · 「가운데값」 · 「흰 눈금」 0 */
function tenChecks(c, n, where) {
  const pk = !!PK[c], k = pk ? range.companies?.[c] : range.others?.[c], S = range.spec, W = range.window;
  const dec = /\d\.\d/.exec(n.outside);
  if (dec) fail('접은 칸 밖 소수점', where + ' …' + n.outside.slice(Math.max(0, dec.index - 24), dec.index + 12) + '…');
  for (const w of ['몬테카를로', '가운데값', '흰 눈금']) if (n.outside.includes(w)) fail('접은 칸 밖 전문 낱말', where + ' 「' + w + '」');
  { const m = /갈래|몸값|한 회사 한 표|큰 회사는 크게|(?<![\d.,])20\s?거래일|다섯 문|쉬는 돈|챕터/.exec(n.plain); if (m) fail('옛 낱말이 화면에 나옴(사장님 [10] 1)', where + ' 「' + m[0] + '」 …' + n.plain.slice(Math.max(0, m.index - 20), m.index + 20) + '…'); }
  if (!(k && k.ok)) { if (n.nSum || n.nChart || n.nInp || n.nScore) fail('셈 못 함인데 숫자 칸이 보임', where + ` 요약 ${n.nSum} 그림 ${n.nChart} 셈에 넣은 것 ${n.nInp} 채점 ${n.nScore}`); return; }
  if (n.nSum !== 1 || n.nChart !== 1 || n.nInp !== 1 || n.nScore !== 1) fail('칸 개수(요약 · 그림 · 셈에 넣은 것 · 채점 각 1)', where + ` ${n.nSum} · ${n.nChart} · ${n.nInp} · ${n.nScore}`);
  if (!n.fold?.includes('몬테카를로')) fail('접은 칸(전문가용)에 몬테카를로 글이 없음', where);
  // ① 요약 두 줄
  const wantSums = ['번 길' + tenRng(k.win.map(T10)), '크게 잃는 길' + tenRng(k.big.map(T10))];
  if (JSON.stringify(n.sums) !== JSON.stringify(wantSums)) fail('요약 두 줄(10번 중 n~m번)', where + ' ' + JSON.stringify(n.sums) + ' ≠ ' + JSON.stringify(wantSums));
  // ② 막대 글 = 방향 넷 × (번 길 · 크게 잃는 길)
  const wantLb = k.win.flatMap((w, j) => [`10번 중 ${T10(w)}번`, `10번 중 ${T10(k.big[j])}번`]);
  if (JSON.stringify(n.labels) !== JSON.stringify(wantLb)) fail('막대 글(10번 중 n번)', where + ' ' + n.labels.join(',') + ' ≠ ' + wantLb.join(','));
  const tens = (n.outside.match(/10번 중/g) || []).length;
  if (tens < 2 * range.dirs.length) fail('「10번 중」 줄 수(방향 × 두 막대 이상)', where + ' ' + tens);
  bump('10번 중 줄', tens);
  // ③ 셈에 넣은 것 — range.json window · dirs · paths 그대로
  const paths = pk ? S.paths : (S.others?.paths ?? S.paths), inp = n.inp ?? '';
  const wantInp = ['셈에 넣은 것', `지난 ${N(W.days)}거래일(${ymdK(W.from)} ~ ${ymdK(W.to)})`, ...range.dirs.map(d => `${d.name} ${d.days}일`), `${S.horizon}일 길을 ${N(paths)}번 뽑았어요`];
  for (const w of wantInp) if (!inp.includes(w)) { fail('셈에 넣은 것', where + ' 「' + w + '」 없음 · ' + inp.slice(0, 120)); break; }
  // ④ 채점 칸 — 정한 날(core.mcEnd) · 안 지났으면 「?」 + D-n(지났으면 아래 채점 지난 날 길이 값을 따로 맞댐)
  const d = core.mcEnd, sc = n.score ?? '';
  if (!sc.startsWith('채점')) fail('채점 칸 머리', where + ' ' + sc.slice(0, 40));
  if (!d) { if (!sc.includes('? 정한 날이 아직 없어요')) fail('채점 칸(정한 날 없음)', where + ' ' + sc.slice(0, 80)); return; }
  if (!sc.includes('정한 날 ' + ymdK(d))) fail('채점 칸 정한 날', where + ' 「' + ymdK(d) + '」 ' + sc.slice(0, 80));
  const nd = ddayK(d);
  if (nd > 0) {
    if (!sc.includes('? 아직 안 지났어요 · D-' + N(nd))) fail('채점 칸 안 지난 날(? + D-n)', where + ' D-' + nd + ' · ' + sc.slice(0, 100));
    if (/그날 실제|번 길 (예|아니오)/.test(sc)) fail('채점 칸이 안 지난 날인데 값을 보임', where + ' ' + sc.slice(0, 100));
  } else if (!/그날 실제|\? 채점 못 함/.test(sc)) fail('채점 칸 지난 날(값 또는 ? 못 함)', where + ' ' + sc.slice(0, 100));
  bump('채점 칸');
}

const po = watch(await tab(390), base), pn = watch(await tab(360), base);
for (const x of cssRules('site/next/p-range.css')) fail('글 규칙(css)', x);
for (const c of SH.part('c', [...list, ...missingCodes])) {
  const miss = !nameOf(c), pk = !!PK[c];
  const okO = await openOld(po, c), okN = await openNew(pn, c);
  if (!okO || !okN) continue;
  compare(c, await tm.old(() => readOld(po)), await tm.new(() => readNew(pn)), c, !miss);
  for (const x of await tm.new(() => layout(pn))) fail('모양 360', c + ' ' + x);
  for (const x of await tm.new(() => pageRules(pn))) fail('모양 규칙', c + ' ' + x);
  if (pn._errs.length) { fail('화면 오류', c + ' ' + pn._errs.join(' | ').slice(0, 200)); pn._errs.length = 0; }
  po._errs.length = 0;
  bump(miss ? '없는 주소' : pk ? '고른 곳' : '고른 곳 밖');
}
await po.context().close(); await pn.context().close();

/* ④ 빈 날 길 — 자료 파일 하나를 못 받는 날(서버가 404) · 옛 쪽과 같은 글이 나와야 하는 곳은 맞대고, 새 쪽만 다른 곳(p-range.js ⑥)은 「?」 줄을 봄 · 화면 오류(그리다 멈춤) 0 */
{
  const pkJ = Object.keys(PK).find(c => edge.get(c) === '고른 곳 튄 날') ?? Object.keys(PK)[0], oth = codes.find(c => !PK[c] && range.others?.[c]?.ok) ?? codes.find(c => !PK[c]);
  const SC = [
    {k: '업데이트 못 받음', f: ['updates.json'], c: pkJ, same: true, slots: false, want: n => n.text.includes('다음 회차 ?')},
    {k: '봉인 못 받음', f: ['time.json'], c: oth, same: true, want: n => n.text.includes('봉인 ? 봉인 자료를 못 읽었습니다')},
    {k: '거래일 못 받음', f: ['days.json'], c: pkJ, same: true, want: n => !n.text.includes('하루에 30% 넘게 바뀐 날')},
    {k: '고른 곳 회사 파일 못 받음', f: ['co/' + pkJ + '.json'], c: pkJ, same: true, want: n => !n.text.includes('하루에 30% 넘게 바뀐 날')},
    {k: '모든 회사 못 받음', f: ['mkt.json'], c: oth, same: true, want: n => n.chaps.filter(x => !x.a).length === 2}, // 챕터 1 · 2 = 「?」
    {k: '이름표 못 받음', f: ['names.json'], c: missingCodes[1] ?? '000000', same: true, head: '없는 주소입니다', want: n => n.text.includes('없는 주소입니다')},
    {k: '범위 못 받음', f: ['range.json'], c: pkJ, same: false, want: n => n.text.includes('? 범위 자료를 받지 못했어요') && n.chaps.length === 7 && n.next.length === 1},
    {k: '고른 곳 자료 못 받음', f: ['comp.json'], c: oth, same: false, head: '범위 · 확인', want: n => n.text.includes('? 자료를 받지 못했어요')},
    {k: '밖 회사 파일 못 받음', f: ['co/' + oth + '.json'], c: oth, same: false, want: n => n.text.includes('? 회사 자료를 받지 못했어요') && n.chaps.length === 7 && n.next.length === 1},
  ];
  for (const s of SH.part('e', SC, 60, s => s.k)) {
    if (!s.c) continue;
    const block = async p => { for (const f of s.f) await p.route('**/atlas/data/' + f, r => r.fulfill({status: 404, contentType: 'text/plain', body: 'no'})); };
    const pn2 = await tab(360); await block(pn2);
    const head = s.head ?? (nameOf(s.c) ? nameOf(s.c) + ' — 범위 · 확인' : missHead(s.c));
    const ok = await tm.new(async () => { await pn2.goto(newUrl(s.c)); return pn2.waitForFunction(w => { const v = document.querySelector('main#view'); return !!v && !v.querySelector('.boot') && (v.querySelector('h1')?.textContent || '') === w; }, head, {timeout: 20000}).then(() => true, () => false); });
    if (!ok) { fail('빈 날 길 새 쪽 덜 열림', s.k + ' ' + s.c + ' 「' + (await pn2.evaluate(() => document.querySelector('main#view')?.textContent?.slice(0, 80) ?? '')) + '」'); await pn2.context().close(); continue; }
    const n = await readNew(pn2);
    if (!s.want(n)) fail('빈 날 길 「?」', s.k + ' ' + s.c);
    for (const x of await layout(pn2)) fail('빈 날 길 모양', s.k + ' ' + x);
    const errs = pn2._errs.filter(e => !/Failed to load resource/.test(e)); // 일부러 막은 파일의 404 줄은 뺌 — 그 밖의 오류(그리다 멈춤)는 실패
    if (errs.length) fail('빈 날 길 화면 오류', s.k + ' ' + errs.join(' | ').slice(0, 200));
    if (s.same) {
      const po2 = await tab(390); await block(po2);
      const want = s.head ?? head;
      const okO = await tm.old(async () => { await po2.goto(oldUrl(s.c)); return po2.waitForFunction(([w, slots]) => { const v = document.querySelector('#view'); if (!v || v.querySelector('.boot')) return false; if ((v.querySelector('h1')?.textContent || '') !== w) return false; const t = v.textContent; return !t.includes('여는 중') && !(slots && t.includes('다음 회차 ?')); }, [want, s.slots ?? hasSlots], {timeout: 20000}).then(() => true, () => false); });
      if (!okO) fail('빈 날 길 옛 쪽 덜 열림', s.k + ' ' + s.c);
      else compare(s.c, await tm.old(() => readOld(po2)), n, '빈 날 길 ' + s.k + ' ' + s.c, !!nameOf(s.c) && s.k !== '모든 회사 못 받음');
      await po2.context().close();
    }
    await pn2.context().close();
    bump('빈 날 길');
  }
}

/* ⑤ 채점 칸 — 정한 날이 지난 날 길(2026-10-18 고도리 명령문 [8] 10 · 일꾼 S4r)
   서버 자료 둘을 일부러 바꿔 열어 봄: core.json 의 정한 날(mcEnd) · range.json 의 기준일(asOf)을 거래일 파일 안의 날로 → 채점 칸의 값(그날 실제 % · 번 길 · 크게 잃는 길 · 들었나)을
   회사 파일(close) · 거래일 파일(dates)에서 따로 셈해 맞댐 · 종가가 없는 날 → 「? 채점 못 함」 · 정한 날이 없음 → 「? 정한 날이 아직 없어요」 */
{
  const dts = days?.dates, lastD = dts?.[dts.length - 1];
  const nextD = lastD ? (() => { const t = new Date(lastD + 'T00:00:00Z'); t.setUTCDate(t.getUTCDate() + 1); return t.toISOString().slice(0, 10); })() : null;
  const pkC = Object.keys(PK).find(c => range.companies?.[c]?.ok), othC = codes.find(c => !PK[c] && range.others?.[c]?.ok);
  const SCN = [
    {k: '채점 지난 날 · 고른 곳', c: pkC, mc: dts?.[dts.length - 6], as: dts?.[dts.length - 26], vals: true},
    {k: '채점 지난 날 · 고른 곳 밖', c: othC, mc: dts?.[dts.length - 6], as: dts?.[dts.length - 26], vals: true},
    {k: '채점 지난 날 · 종가 없음', c: pkC, mc: nextD && ddayK(nextD) <= 0 ? nextD : null, as: lastD, none: true},
    {k: '채점 정한 날 없음', c: pkC, mc: null, as: null, noDate: true},
  ];
  for (const s of SH.part('s', SCN, 30, s => s.k)) {
    if (!s.c || (s.vals && !(s.mc && s.as)) || (s.none && !s.mc)) { bump('채점 길 건너뜀'); continue; }
    const p = await tab(360);
    await p.route('**/atlas/data/core.json', r => r.fulfill({status: 200, contentType: 'application/json', body: JSON.stringify({...core, mcEnd: s.mc})}));
    if (s.as) await p.route('**/atlas/data/range.json', r => r.fulfill({status: 200, contentType: 'application/json', body: JSON.stringify({...range, asOf: s.as})}));
    const head = nameOf(s.c) + ' — 범위 · 확인';
    await p.goto(newUrl(s.c));
    const ok = await p.waitForFunction(w => { const v = document.querySelector('main#view'); return !!v && !v.querySelector('.boot') && (v.querySelector('h1')?.textContent || '') === w; }, head, {timeout: 20000}).then(() => true, () => false);
    if (!ok) { fail('채점 길 덜 열림', s.k + ' ' + s.c); await p.context().close(); continue; }
    const n = await readNew(p), sc = n.score ?? '', w = s.k + ' ' + s.c;
    if (n.nScore !== 1) fail('채점 칸 개수', w + ' ' + n.nScore);
    else if (s.noDate) { if (!sc.includes('? 정한 날이 아직 없어요') || /정한 날 \d|그날 실제/.test(sc)) fail('채점 칸(정한 날 없음)', w + ' ' + sc.slice(0, 100)); }
    else {
      if (!sc.includes('정한 날 ' + ymdK(s.mc))) fail('채점 칸 정한 날', w + ' 「' + ymdK(s.mc) + '」 ' + sc.slice(0, 80));
      const co = await getJ('co/' + s.c + '.json').catch(() => null), k = PK[s.c] ? range.companies[s.c] : range.others[s.c];
      const at = d => { const i = dts.indexOf(d) - (Number.isInteger(co?.k0) ? co.k0 : 0); return i >= 0 && Array.isArray(co?.close) ? co.close[i] : null; };
      const a = at(s.as), b = at(s.mc);
      if (!(a > 0 && b > 0)) { if (!sc.includes('? 채점 못 함 — 그날 종가를 못 받았어요') || /그날 실제/.test(sc)) fail('채점 칸(종가 없음 → ?)', w + ' ' + sc.slice(0, 100)); }
      else {
        const r = (b / a - 1) * 100, win = r > range.spec.profit * 100, big = r < range.spec.bigLoss * 100, wn = k.win.map(T10), bn = k.big.map(T10);
        const held = (win ? Math.max(...wn) >= 1 : Math.min(...wn) <= 9) && (big ? Math.max(...bn) >= 1 : Math.min(...bn) <= 9);
        const m = /그날 실제 ?([+−]?)([\d,]+)%/.exec(sc), shown = m ? (m[1] === '−' ? -1 : 1) * numOf(m[2]) : null;
        if (shown == null || Math.abs(shown - r) > 0.56) fail('채점 칸 그날 실제 %', `${w} 화면 ${shown} · 셈 ${r.toFixed(2)}`);
        if (!sc.includes(`번 길 ${win ? '예' : '아니오'} · 크게 잃는 길 ${big ? '예' : '아니오'}`)) fail('채점 칸 번 길 · 크게 잃는 길', `${w} 셈 ${win ? '예' : '아니오'} · ${big ? '예' : '아니오'} · ${sc.slice(0, 140)}`);
        if (!sc.includes(held ? '(들었음)' : '(안 들었음)') || (held && sc.includes('(안 들었음)'))) fail('채점 칸 들었나', `${w} 셈 ${held ? '들었음' : '안 들었음'} · ${sc.slice(0, 160)}`);
        if (!sc.includes('한 번의 결과라 모형이 맞다는 증거는 아니에요')) fail('채점 칸 조심 글', w);
      }
    }
    for (const x of await layout(p)) fail('채점 길 모양', w + ' ' + x);
    const errs = p._errs.filter(e => !/Failed to load resource/.test(e));
    if (errs.length) fail('채점 길 화면 오류', w + ' ' + errs.join(' | ').slice(0, 200));
    await p.context().close(); bump('채점 길');
  }
}

/* ③ 세 폭 — 320 · 390(360 은 위에서 모든 곳) */
if (SHOTS) await fs.mkdir(SHOTS, {recursive: true});
for (const w of SH.part('w', [320, 360, 390].filter(w => w !== 360 || SHOTS), 4 * wideSet.length)) {
  if (w === 360 && !SHOTS) continue;
  const p = watch(await tab(w), base);
  for (const c of wideSet) {
    if (!(await openNew(p, c))) continue;
    if (w !== 360) for (const x of await tm.new(() => layout(p))) fail('모양 ' + w, c + ' ' + x);
    if (p._errs.length) { fail('화면 오류', w + ' ' + c + ' ' + p._errs.join(' | ').slice(0, 200)); p._errs.length = 0; }
    if (SHOTS) await p.screenshot({path: path.join(SHOTS, `range-${c}-${w}.png`), fullPage: true});
    bump('세 폭 화면');
  }
  await p.context().close();
}
await b.close();
const res = {schema: 'atlas11-next-range-check-1', at: new Date().toISOString(), base, asOf: mkt.asOf, rangeAsOf: range.asOf, companies: codes.length, checked: list.length, missing: missingCodes, full: ALL, wide: wideSet.length, ...SH.info(),
  edges: Object.fromEntries([...edge.entries()].filter(([c]) => list.includes(c)).map(([c, w]) => [c, w])), seconds: Math.round((Date.now() - t0) / 1000), time: tm.get(), net: netSummary(), counts, fails, ok: !fails.length};
if (OUT) { await fs.mkdir(path.dirname(path.resolve(OUT)), {recursive: true}); await fs.writeFile(path.resolve(OUT), JSON.stringify(res, null, 1) + '\n'); }
console.log(JSON.stringify({ok: res.ok, seconds: res.seconds, checked: res.checked, wide: res.wide, time: res.time, net: res.net, counts, fails: fails.slice(0, 15)}, null, 0));
process.exit(res.ok ? 0 : 1);
