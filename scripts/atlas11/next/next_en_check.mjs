#!/usr/bin/env node
/**
 * 새 아틀란스(/next/ · 규칙 74) 영어 돌기 — 사장님 2026-10-15(싱가포르) 23:35 「언어팩을 선태기하면 아틀란스가 영어로 나오게 하라」(규칙 71)
 *   · 2026-10-17 04:04 「첫화면 부터 마지막 페이지 까지 모두 바꿔」 — 새 화면도 영어 사전으로 영어가 되는지 봄
 *   · 2026-10-17 15:54 「예전 아트란스는 앞으로 어떠한 작업도 하지 말아라」 — 새 화면은 제 엔진 · 사전만 씀: 엔진 /next/i18n.js · 사전 /next/i18n/en.json · en-names.json
 *     (원본 scripts/atlas11/next/i18n/en-src.json → 빌드 scripts/atlas11/next/i18n_build.mjs) — 옛 사전(/atlas/i18n/)을 받으면 실패 「옛 영어 사전」
 *   · 2026-10-17 15:48 「이름을 변경하자 아틀란스에서 보드리로 모두 변경해」 · 17:34 「보드리를 고도리로 변경하자」 — 영어 이름은 site/next/brand.js 한 곳(지금 Godori):
 *     화면에 옛 영어 이름(brand.js was — 지금 Bodri · ATLAS · 대소문자 그대로 낱말)이 보이면 실패 「옛 이름 <그 이름> 남음」
 *     (회사 이름 Atlas Link 같은 보통 글자는 안 셈 · lang="ko" 원문 빼고 · 글 · 속성 · 창 제목 · 꾸밈 글 · 확인 창)
 *   여는 곳: /next/?dev=1&lang=en (app.js EN_NEXT 가 false 인 동안 새 화면 영어는 ?dev=1 로만 열림 · --dev 0 이면 ?lang=en 만)
 *   길: 홈 · 칩 일곱(#/f/rise|surge|lead|pick|group|ind|us) · 쇼츠(+ #/shorts/<n> 한 장씩) · 구독 · 나 · 찾기(+ #/find/<말>) · 지수 둘(#/w/KOSPI · KOSDAQ)
 *       · 보는 화면(회사 표본 — 지수 둘과 합쳐 --limit 60 · --all 이면 모든 회사) · 업종 채널 모두 · 갈래 채널 모두 · 없는 회사 · 없는 채널
 *       · --modules 면 옮긴 쪽(#/w/<번호>/past|rivals|grow|range · #/surge(+ /10 ~ /40) · #/cal(+ 종목 파일) · #/cond(+ 고르기) · #/talk · #/up · #/time · #/info · #/x/<번호>
 *         · 고도리(규칙 77) #/why — 질문 열한 개의 답 단추를 모두 눌러 보고(고도리 한마디 · 격언) 다음 › 으로 결과까지 · #/gdr · #/gdr/1 — 내 돈을 바꾸고 칸 하나를 엶)
 *         · 「나」 칸(#/me)에 들기 전 왜 사? 기록 둘을 심음(오늘 · 40일 전 — 한 달 뒤 결과까지) · 새 창 하나는 고도리 칸 자료(/next/data/gdr.json)도 못 받게 함
 *         · --mods why,gdr = 그 쪽만(고치는 동안 빨리 — full 이 아님)
 *   화면마다 본다(영어 · 360 × 640): ① 사전에 없는 틀 0(엔진 __atlasI18n.missing) ② 보이는 한글 0(lang="ko" 원문 빼고 · 글 · aria-label · title · placeholder · alt · ::before/::after)
 *       ③ 창 제목 한글 0(사전에는 있는데 app.js 가 L() 로 안 감싼 것은 따로 셈) · html lang = en ④ 가로 넘침 0 — 세 폭(320 · 360 · 390)에서 쪽 넘침 · 화면 밖으로 나간 칸 · 칸 안에서 넘친 글
 *       ⑤ 화면 오류 0(쪽 모듈 파일 못 받음은 따로 셈) ⑥ 동그라미 글자(.av)는 로마자 한 글자 — 한글 한 글자를 사전이 낱말로 바꾸면(「금」 → Fri) 실패
 *   누르기(새 글이 생기는 곳): 구독 · 구독 풀기 · 나중에 볼 것 담기 · 빼기 · 보내기(알림) · 선 끌기 이름표(회사 · 지수) · 짧게 누름 · 다음 볼 것 더 보기 · 채널 업종 탭 · 더 보기
 *       · 찾기 쓰기(회사 이름 · 번호 · 업종 · 갈래 · 영어 · 없는 말) · 구독한 채널 칸 · 나 칸(본 기록 · 담은 것) · 지우기(확인 창 글 · 알림) · 쇼츠 보내기
 *       · 글씨 크기 단추 세 번(알림 · 단추 이름) + 아주 큰 글씨로 주요 화면 열하나를 세 폭에서
 *   결과: own(새 화면 자기 쪽) · mod(쪽 모듈 칸 · 길)로 나눠 셈 · --dump 면 사전에 없는 틀 목록(틀 · 보기 글 · 처음 본 곳)
 *   바꿔치기(--no-edge 면 뺌): 받은 자료를 화면 안에서 바꿔 다시 그림(NX.D) — 오늘 한 줄(오름 · 내림 · 거의 그대로 · 평소 견줌 셋 · 3달 동안 가장 크게 · 날짜 이후 가장 크게 · 잇달아 ·
 *       장 중 · 오전 · 오후 · 오늘 · 짧은 선 · 못 받음) · 큰 날 「!」 · 봉인 줄(오늘 엶 · 엶 날 지남) · 1주 오른 업종 없음 · 미국 · 고른 곳 · 지수 없음 + 새 창 둘(자료 파일 못 받음)
 *       + 오늘 한 줄 문장 모두(때 일곱 꼴 × 코스피 · 코스닥 × 오름 · 내림 × 평소 견줌 × 잇달아)를 엔진에 넣어 봄
 *   쓰는 법: node scripts/atlas11/next/next_en_check.mjs --base http://127.0.0.1:8826 [--all | --limit 60] [--modules] [--no-edge] [--only home,chips,shorts,sub,me,find,watch,chan,act,edge,grammar,mod]
 *            [--dev 1] [--pw /opt/node-tools/] [--out reports/atlas11/verify/next-en-latest.json] [--dump 사전에-없는-틀.json] [--app-file 고친-app.js(시험 · 서버의 /next/app.js 대신)]
 *   틀린 것이 하나라도 있으면 끝 코드 1(--only · --limit 은 「full: false」 — 마지막엔 --all --modules 로 전부)
 *   나눠 돌리기(2026-10-17 고도리 · 규칙 76 「무거운 화면 검사는 깃허브 여러 대」 — atlas11-next-full 이 en1 ~ en6 로 함께 돌리고 gather 가 합침):
 *     --shard k/n  한 번 다 돌 때의 일감(길 하나씩 · @tail = 누르기 → 바꿔치기 → 오늘 한 줄 문장 · @newwin = 새 창)을 같은 차례로 세워 n 몫으로 가르고 k 번째 몫만 돎
 *                  (몫마다 같은 목록 · 같은 셈 → 일감 하나는 꼭 한 몫 · 결과 꼴은 그대로 + shard · units{total · mine · hash} · secs · counts · fails 는 제 몫만)
 *     --list-only  브라우저 없이 이 몫의 일감 목록만 찍음(나눔 확인 — 몫 n 개를 모으면 --shard 없이 찍은 목록과 같아야 함)
 *     --merge 몫1.json 몫2.json … [--shards n] --out 합친.json  몫 결과를 하나로(빠진 몫 · 겹친 몫 · 몫마다 다른 일감 목록이면 problems · ok: false · seconds = 가장 긴 몫)
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {createRequire} from 'node:module';
import {fileURLToPath} from 'node:url';
import {BRAND} from '../../../site/next/brand.js'; // 이름 한 곳(규칙 76) — 옛 영어 이름(was)이 화면에 남았는지 봄
import {fetchJSON, watch, settle as reopen, netSummary} from './net.mjs'; // 망 탈에만 다시 받기 · 화면 다시 열기(2026-10-17 고도리 명령문 [1] 8 — 지금 사이트 검사 en3 · en4 「자료를 못 받음」)
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');
const ARGV = process.argv.slice(2);
const arg = (k, d) => { const i = ARGV.indexOf(k); return i >= 0 && ARGV[i + 1] != null && !ARGV[i + 1].startsWith('--') ? ARGV[i + 1] : d; };
const flag = k => ARGV.includes(k);
const OUT = path.resolve(ROOT, arg('--out', 'reports/atlas11/verify/next-en-latest.json')), DUMP = arg('--dump', null);
const isMod = f => /^\[모듈\]/.test(f.at[0]) || /모듈/.test(f.kind); // 쪽 모듈 칸 · 길에서 난 실패(결과 mod) — 나머지는 새 화면 자기 쪽(own)
if (flag('--merge')) process.exit(await mergeShards()); // 몫 결과 합치기 — 브라우저 · 자료 없이(맨 아래 mergeShards)
const SHARD = (() => {
  const s = arg('--shard', null); if (s == null) return null;
  const m = /^(\d+)\/(\d+)$/.exec(s); if (!m || +m[1] < 1 || +m[1] > +m[2]) { console.error('--shard 는 k/n 꼴(1 ≤ k ≤ n) — 받은 값 ' + s); process.exit(2); }
  return {k: +m[1], n: +m[2], s: m[1] + '/' + m[2]};
})();
const LIST_ONLY = flag('--list-only');
const base = arg('--base', 'http://127.0.0.1:8826').replace(/\/$/, '');
const ALL = flag('--all'), LIMIT = Math.max(2, Number(arg('--limit', 60)) || 60), MODULES = flag('--modules'), EDGE = !flag('--no-edge');
const APP_FILE = arg('--app-file', null) ? path.resolve(arg('--app-file')) : null; // 시험 전용 — 결과 파일에 적히고 full 이 아님
const DEV = arg('--dev', '1') !== '0', ONLY = arg('--only', null)?.split(',').map(s => s.trim()).filter(Boolean) ?? null;
const on = k => !ONLY || ONLY.includes(k);
const WIDTHS = [320, 360, 390], MAIN_W = 360, H = 640;
const OLD_EN = BRAND.was.map(w => w.en).filter(Boolean); // 옛 영어 이름(지금 Bodri · ATLAS) — 화면 안 재기에 넘김
const reEsc = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const OLD_RE = OLD_EN.length ? new RegExp('\\b(?:' + OLD_EN.map(reEsc).join('|') + ')\\b') : /(?!)/;
const PAGE = base + '/next/?' + (DEV ? 'dev=1&' : '') + 'lang=en';
const t0 = Date.now(), secs = {}, mark = (k, s) => { secs[k] = Math.round((Date.now() - s) / 100) / 10; }; // 묶음마다 걸린 초(몫 무게를 맞추는 데 씀)

/* ── 자료(시험 서버에서 · 앱과 같은 파일) ── */
// 받기 — 잠깐 막힘(연결 끊김 · 시간 넘음 · 5xx)은 기다렸다 다시(나눠 돌리면 몫마다 따로 받으므로 한 번 막힘에 한 몫이 통째로 빠지지 않게 · 2026-10-17 12:24 en3 · en4 가 처음 받기에서 멈춤) · 없는 파일(4xx)은 바로 null
//   net.mjs fetchJSON = 끊김 · 시간 넘음 · 몸 끊김 · 429 · 5xx 를 1 · 2 · 4 · 8 · 16 · 30초(흔들기 · Retry-After) 뒤 다시 · 2분 30초 안 — 앞 판은 429 · 몸 끊김을 다시 받지 않았음
const fetchRetry = (url, opt = {}) => fetchJSON(url, url, {as: 'response', init: opt}).catch(e => { if (e.http) return {ok: false, status: e.http}; throw e; });
const getJ = f => fetchJSON(base + '/atlas/data/' + f, f).catch(() => null);
const [core, mkt, home, surge, cond, surgetr, names] = await Promise.all(['core.json', 'mkt.json', 'home.json', 'surge.json', 'cond.json', 'surgetr.json', 'names.json'].map(getJ));
if (!core || !mkt || !home) { console.error('자료(core · mkt · home)를 못 받음 — 시험 서버 ' + base); process.exit(1); }
const CO = mkt.companies, codes = Object.keys(CO).sort();
const HAN = /[가-힣ㄱ-ㅎㅏ-ㅣ]/;

/* ── 실패 · 셈 ── 같은 실패 글은 한 번(처음 화면 + 몇 번) */
const fails = new Map(), counts = {};
const bump = (k, n = 1) => { counts[k] = (counts[k] || 0) + n; };
function fail(kind, where, what, ex = null) { const key = kind + '|' + what; const f = fails.get(key); if (f) { f.n++; if (f.at.length < 5) f.at.push(where); } else fails.set(key, {kind, what, ex, at: [where], n: 1}); }
const miss = new Map(); // 틀 → {ex, at}
const avChars = new Set(); // 동그라미 글자(이름 첫 한글 한 글자) — 엔진은 이것도 「사전에 없는 틀」로 셈 → 사전 일이 아니라 app.js 일이라 따로 셈

/* ── 길 ── */
const CHIPS = ['rise', 'surge', 'lead', 'pick', 'group', 'ind', 'us'];
const FIND_WORDS = ['삼성', '전자', '반도체', '005930', 'SK', '0', 'Samsung', 'zzqq']; // 없는 말은 한글 아닌 것(찾는 말을 「…」로 되돌려 보여 주는 글은 쓴 사람 글 그대로)
function sample() {
  if (ALL) return codes;
  const want = LIMIT - 2, pick = new Set(['005930']);
  for (const c of codes) { if (pick.size >= 6) break; if (!HAN.test(CO[c].n)) pick.add(c); } // 로마자 이름 회사(엔진이 사전에 없는 줄에서만 이름으로 봄)
  for (const c of codes) { if (pick.size >= 8) break; if (!CO[c].i) pick.add(c); } // 업종 모름
  const step = Math.max(1, Math.floor(codes.length / Math.max(1, want)));
  for (let i = 0; pick.size < want && i < codes.length; i += step) pick.add(codes[i]);
  for (let i = 0; pick.size < want && i < codes.length; i++) pick.add(codes[i]);
  return [...pick].slice(0, want);
}
const WATCH = sample();
const enc = encodeURIComponent;
const routes = [];
const add = (kind, r) => { if (on(kind)) routes.push({kind, r}); };
add('home', '#/');
for (const c of CHIPS) add('chips', '#/f/' + c);
add('shorts', '#/shorts'); // 한 장씩(#/shorts/<n>)은 장 수를 센 뒤에 덧붙임
add('sub', '#/sub'); add('me', '#/me'); add('find', '#/find');
for (const w of FIND_WORDS) add('find', '#/find/' + enc(w));
add('watch', '#/w/KOSPI'); add('watch', '#/w/KOSDAQ');
for (const c of WATCH) add('watch', '#/w/' + c);
add('watch', '#/w/999999');
for (const i of core.industries) add('chan', '#/ch/i/' + enc(i.name));
for (const g of core.groups) add('chan', '#/ch/g/' + enc(g.id));
add('chan', '#/ch/i/' + enc('없는업종')); add('chan', '#/ch/g/zz');
/* 옮긴 쪽(--modules) — 모듈 파일(/next/p-<이름>.js)이 없으면 「모듈 없음」 실패
   · 2026-10-17 고도리(규칙 77): why = 「친구야, 왜 사?」 질문 열한 개(#/why — 답 단추를 모두 눌러 보고 다음 › 으로 결과까지) · gdr = 고도리 칸(#/gdr · #/gdr/1 — 내 돈을 바꾸고 칸 하나를 엶)
   · --mods why,gdr = 그 쪽만(고치는 동안 빨리 — full 이 아님) */
const MODS = ['past', 'rivals', 'grow', 'range', 'surge', 'cal', 'cond', 'talk', 'up', 'time', 'info', 'x', 'co', 'chx', 'today', 'why', 'gdr', 'share', 'hold']; // share = 친구가 연 보내기(#/s/…) · hold = 보유종목 점검(#/me 맨 위) — 2026-10-17 21:10 [4] · [5]
const MODS_ONLY = arg('--mods', null)?.split(',').map(s => s.trim()).filter(Boolean) ?? null;
const modHave = {};
if (MODULES || DEV) await Promise.all(MODS.map(async m => { try { const r = await fetchRetry(base + '/next/p-' + m + '.js', {method: 'HEAD'}); modHave[m] = r.ok; } catch { modHave[m] = false; } })); // 잠깐 막힘에 「모듈 없음」이 되면 몫마다 일감 목록이 달라짐 — 다시 받기
if (MODULES && on('mod')) {
  const mc = ALL ? codes : [...new Set(['005930', ...WATCH])].slice(0, 12);
  const R = {past: mc.map(c => `#/w/${c}/past`), rivals: mc.map(c => `#/w/${c}/rivals`), grow: mc.map(c => `#/w/${c}/grow`), range: mc.map(c => `#/w/${c}/range`),
    surge: ['#/surge', '#/surge/10', '#/surge/20', '#/surge/30', '#/surge/40'],
    cal: ['#/cal', ...((surgetr?.cases ?? []).map(r => r[0]).slice(0, ALL ? Infinity : 20).map(c => '#/cal/' + c))],
    cond: ['#/cond', '#/cond/rise-top3-spike', '#/cond/up-f3-loss', '#/cond/dn-pick-all', '#/cond/all-all-all'],
    talk: ['#/talk'], up: ['#/up'], time: ['#/time'], info: ['#/info'],
    x: (names?.rows ?? []).filter(r => r.k).slice(0, ALL ? 40 : 6).map(r => '#/x/' + r.c),
    why: ['#/why', '#/why/005930'], gdr: ['#/gdr', '#/gdr/1'], // 매매일지(처음 = 종목 고르기 · 회사 화면 「이 회사로 왜 사?」 = 그 종목으로 시작 — [3] 1 · 2)
    share: ['#/s/005930/' + mkt.base + '/70000/s', '#/s/005930/' + mkt.base + '/70000/a', '#/s/ZZZZZZ/2026-13-40/0/s']}; // 친구가 연 보내기 · 같이 따져 줘 · 깨진 주소([4] 6 ~ 8)
  for (const [m, rs] of Object.entries(R)) { if (MODS_ONLY && !MODS_ONLY.includes(m)) continue; if (!modHave[m]) { fail('모듈 없음', 'p-' + m + '.js', '옮긴 쪽 파일이 아직 없음 — 길 ' + rs.length + '개를 못 봄'); continue; } for (const r of rs) routes.push({kind: 'mod', r, mod: m}); }
}

/* ── 일감 · 몫(--shard k/n) ── 한 번 다 돌 때와 같은 일감 · 같은 차례 — 몫마다 같은 목록을 세우고 같은 셈으로 가름(일감 하나 = 꼭 한 몫)
   일감 = 길 하나(바로 앞과 같은 길은 한 번 — 다 돌 때도 건너뛰던 것) · @tail = 누르기 → 바꿔치기 → 오늘 한 줄 문장(같은 창 · 이 차례 — 바꿔치기는 누르기가 남긴 구독 · 기록 위에서 돎)
   · @newwin = 새 창 둘(자료 못 받음) · #/shorts 를 맡은 몫이 쇼츠 장 수를 세어 #/shorts/<n> 을 바로 뒤에 덧붙임(장 수는 화면을 열어야 앎)
   가름: 무거운 묶음을 끝 몫부터 먼저 두고(@tail → n 번 · @newwin → n−1 번), 길은 몫마다 남은 무게에 비례해 처음부터 끝까지 고르게 섞어 나눔
   (부드러운 가중 돌림 · 정수 셈 · 같으면 앞 몫 — 어느 기계에서나 같은 가름) · 무게 = 길 하나 1 · 묶음은 아래 UNIT_W(깃허브 실측 secs 로 맞춤) */
const UNIT_W = {'@tail': 80, '@newwin': 15}; // 2026-10-17 깃허브 실측(실행기 안 시험 서버): 길 하나 0.17초 · @tail 12초(누르기 7.2 · 바꿔치기 4.9) · @newwin 2초
const units = [];
{ let lastR = null; for (const x of routes) { if (x.r === lastR) continue; lastR = x.r; units.push({id: x.r, ...x}); } }
if (on('act') || (EDGE && on('edge')) || on('grammar')) units.push({id: '@tail'});
if (EDGE && on('edge')) units.push({id: '@newwin'});
const UHASH = createHash('sha1').update(units.map(u => u.id).join('\n')).digest('hex').slice(0, 16);
/** 몫 가르기 — list 의 일감마다 몫 번호(0 부터) */
function planShards(list, n) {
  const own = list.map(() => -1), pre = new Array(n).fill(0);
  let j = 0;
  list.forEach((u, i) => { const w = UNIT_W[u.id]; if (!w) return; const k = Math.max(0, n - 1 - j++); own[i] = k; pre[k] += w; });
  const R = own.filter(k => k < 0).length, tot = R + pre.reduce((a, b) => a + b, 0);
  const q = pre.map(p => Math.max(0, tot - n * p)); // 몫마다 길 무게(n 배 한 정수) — 묶음을 맡은 몫은 그만큼 길을 덜 맡음
  if (!q.some(Boolean)) q.fill(1);
  const sq = q.reduce((a, b) => a + b, 0), cur = new Array(n).fill(0);
  list.forEach((u, i) => { if (own[i] >= 0) return; let b = 0; for (let k = 0; k < n; k++) { cur[k] += q[k]; if (cur[k] > cur[b]) b = k; } own[i] = b; cur[b] -= sq; });
  return own;
}
const OWN = SHARD ? planShards(units, SHARD.n) : null;
const mine = SHARD ? units.filter((u, i) => OWN[i] === SHARD.k - 1) : units;
const mineIds = new Set(mine.map(u => u.id));
const RUN = mine.filter(u => u.r != null), TAIL_MINE = mineIds.has('@tail'), NEWWIN_MINE = mineIds.has('@newwin');
if (LIST_ONLY) { // 나눔 확인 — 브라우저 없이 · 다 써진 뒤 끝냄(파이프로 받을 때 64KB 에서 잘리지 않게)
  await new Promise(r => process.stdout.write(JSON.stringify({shard: SHARD?.s ?? null, total: units.length, hash: UHASH, mine: mine.length, w: UNIT_W, units: mine.map(u => u.id)}) + '\n', r));
  process.exit(0);
}

/* ── 브라우저 ── 하나만 · 다 쓰면 닫음(기계가 작음) · 이 몫에 일감이 없으면 열지 않음 */
const require = createRequire(arg('--pw', '/opt/node-tools/'));
const {chromium} = require('playwright');
const exe = '/opt/pw-browsers/chromium';
const b = mine.length ? await chromium.launch((await fs.stat(exe).catch(() => null)) ? {executablePath: exe} : {}) : null;
async function newPage(block = []) {
  const ctx = await b.newContext({viewport: {width: MAIN_W, height: H}, deviceScaleFactor: 1, hasTouch: true});
  const p = await ctx.newPage(); p._errs = [];
  p.on('pageerror', e => p._errs.push('pageerror ' + e.message));
  p.on('console', m => { if (m.type() === 'error') p._errs.push(m.text() + (m.location()?.url ? ' @' + m.location().url : '')); });
  watch(p, base); // 망 탈(끊김 · 429 · 5xx · 답 없음)을 셈 — 일부러 못 받게 한 파일(404)은 셈 밖
  for (const f of block) await p.route(f.startsWith('/') ? '**' + f : '**/atlas/data/' + f, r => r.fulfill({status: 404, body: 'blocked'})); // '/' 로 시작하면 그 길 그대로(고도리 칸 자료 /next/data/gdr.json)
  if (APP_FILE) await p.route('**/next/app.js', r => r.fulfill({path: APP_FILE, contentType: 'text/javascript; charset=utf-8'})); // 시험: 고칠 안(app.js 사본)을 미리 돌려 봄
  p._dicts = []; p.on('request', q => { const u = new URL(q.url()); if (/\/i18n(\.js|\/[^/]+\.json)$/.test(u.pathname)) p._dicts.push(u.pathname); }); // 받은 영어 엔진 · 사전(새 화면 것만이어야 함 · 옛 것은 errs 가 셈)
  const up = await reopen(p, async () => { await p.goto(PAGE + '#/'); return p.waitForFunction(() => window.__atlasI18n && window.NX && !document.querySelector('#view .boot'), null, {timeout: 40000}).then(() => true, () => false); }, {what: '처음 열기', fail: (k, x) => fail(k, '처음 열기', x)});
  if (up === false) fail('여는 중 남음', '처음 열기', '40초 안에 안 그려짐');
  if (!p._dicts.includes('/next/i18n/en.json')) fail('옛 영어 사전', '처음 열기', '새 화면 사전 /next/i18n/en.json 을 안 받음');
  return p;
}
/** 길 바꾸기 — 앞 화면이 새 칸으로 바뀌고(「여는 중」도 사라지고) 두 장 그린 뒤까지 기다림 · 같은 길이면 다른 길을 거쳐 다시 그림 */
//   망 탈(이 사이트 요청 끊김 · 429 · 5xx · 15초 넘게 답 없음)이 있었던 열기는 믿지 않고 새로 고쳐 다시(net.mjs settle = reopen — 그 열기의 「Failed to load resource」 줄은 지움) · 망 탈 없이 못 그리면 앞과 같은 실패
async function go(q, hash) {
  const once = async () => {
    if (await q.evaluate(() => location.hash || '#/') === hash) await go(q, hash === '#/me' ? '#/sub' : '#/me');
    await q.evaluate(h => { window.__nxenTok = document.querySelector('#view')?.firstElementChild ?? null; location.hash = h; }, hash);
    return q.waitForFunction(() => { const v = document.querySelector('#view'); return !!v && v.firstElementChild !== window.__nxenTok && !v.querySelector('.boot'); }, null, {timeout: 25000}).then(() => true, () => false);
  };
  const ok = await reopen(q, once, {what: hash, fail: (k, x) => fail(k, hash, x)});
  if (ok === false) fail('여는 중 남음', hash, '25초 안에 안 그려짐');
  await q.evaluate(() => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r))));
}

/* 화면 안에서 재기 — 글(한글) · 꼴 */
function judgeText(OLD) {
  const HN = /[가-힣ㄱ-ㅎㅏ-ㅣ]/;
  const vis = el => { if (!el) return false; const s = getComputedStyle(el); if (s.visibility === 'hidden' || s.display === 'none') return false; if (!el.getClientRects().length) return false; if (el.closest('details:not([open]) > :not(summary)')) return false; return true; };
  const MODH = /^#\/(w\/[^/]+\/|surge|cal|cond|talk|up|time|info|x\/|why|gdr)/; // 쪽 모듈 길(p-*.js)
  const han = [], attrs = [], pseudo = [], key = s => { try { return window.__atlasI18n.templateOf(s).key; } catch { return s; } };
  // 옛 영어 이름(brand.js was — 지금 Bodri · ATLAS) — 대소문자 그대로 낱말만(회사 이름 Atlas Link 는 안 셈) · w = 남은 이름
  const AT = OLD.length ? new RegExp('\\b(?:' + OLD.map(s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|') + ')\\b') : /(?!)/, atlas = [], ow = s => (String(s).match(AT) || [''])[0];
  const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  for (let n = w.nextNode(); n; n = w.nextNode()) {
    const el = n.parentElement; if (!el || el.closest('[lang="ko"], script, style, noscript, template, [hidden]')) continue;
    const t = n.nodeValue.trim();
    if (t && AT.test(t) && vis(el)) atlas.push({ex: t.slice(0, 90), w: ow(t), mod: !!el.closest('.co-d, .chx-d, .today-d, .wy, .wy-me, .gdr') || MODH.test(location.hash)});
    if (!t || !HN.test(t) || !vis(el)) continue;
    han.push({mod: !!el.closest('.co-d, .chx-d, .today-d, .wy, .wy-me, .gdr') || MODH.test(location.hash), k: key(t), ex: t.slice(0, 90), av: el.matches('.av')});
  }
  for (const a of ['aria-label', 'title', 'placeholder', 'alt']) for (const el of document.querySelectorAll('[' + a + ']')) { if (el.closest('[lang="ko"], [hidden], template')) continue; const v = el.getAttribute(a); if (HN.test(v)) attrs.push({k: '@' + a + ' ' + key(v), ex: v.slice(0, 70), mod: !!el.closest('.co-d, .chx-d, .today-d, .wy, .wy-me, .gdr') || MODH.test(location.hash)}); if (AT.test(v)) atlas.push({ex: '@' + a + ' ' + v.slice(0, 70), w: ow(v), mod: !!el.closest('.co-d, .chx-d, .today-d, .wy, .wy-me, .gdr') || MODH.test(location.hash)}); }
  if (AT.test(document.title)) atlas.push({ex: '창 제목 ' + document.title.slice(0, 70), w: ow(document.title), mod: false});
  // 동그라미 글자(.av — 이름의 첫 글자) — 영어면 로마자 한 글자여야 함(한글 한 글자를 사전이 낱말로 바꾸면 「금」 → Fri · 「소」 → cattle 처럼 엉뚱한 말)
  const avBad = [...document.querySelectorAll('.av')].filter(e => vis(e) && !e.closest('[lang="ko"]')).map(e => e.textContent.trim()).filter(t => t && !/^[A-Za-z0-9?]$/.test(t) && !HN.test(t));
  // 꾸밈 글(::before · ::after content) — 글자 마디가 아니라 위 검사가 못 봄
  const sels = [], walk = rules => { for (const ru of rules) { if (ru.cssRules) walk(ru.cssRules); if (ru.selectorText && /::?(before|after)/.test(ru.selectorText) && (HN.test(ru.style?.content ?? '') || AT.test(ru.style?.content ?? ''))) sels.push(ru.selectorText); } };
  for (const sh of document.styleSheets) { try { walk(sh.cssRules); } catch { /* 다른 곳 글꼴표 */ } }
  for (const sel of sels) for (const part of sel.split(',')) { const m = /^(.*?)::?(before|after)\s*$/.exec(part.trim()); if (!m) continue; let els = []; try { els = document.querySelectorAll(m[1] || '*'); } catch { continue; }
    for (const el of els) { if (el.closest('[lang="ko"]') || !vis(el)) continue; const c = getComputedStyle(el, '::' + m[2]).content; if (c && HN.test(c)) pseudo.push('::' + m[2] + ' ' + c.slice(0, 40)); if (c && AT.test(c)) atlas.push({ex: '::' + m[2] + ' ' + c.slice(0, 40), w: ow(c), mod: false}); } }
  let titleEn = document.title; try { titleEn = window.__atlasI18n.t(document.title); } catch { /* 엔진 없음 */ }
  return {han, attrs, pseudo, avBad, atlas, title: document.title, titleKey: key(document.title), titleEn, lang: document.documentElement.lang, toast: [...document.querySelectorAll('.toast')].map(e => e.textContent)};
}
function judgeBox() {
  const de = document.documentElement, W = de.clientWidth, out = [], box = [];
  const clipped = el => { for (let a = el.parentElement; a && a !== document.body; a = a.parentElement) { const ox = getComputedStyle(a).overflowX; if (ox !== 'visible') return true; } return false; };
  const label = el => (el.className && typeof el.className === 'string' ? '.' + el.className.split(/\s+/)[0] : el.tagName.toLowerCase()) + ' 「' + (el.textContent || el.getAttribute('aria-label') || '').trim().slice(0, 28) + '」';
  for (const el of document.querySelectorAll('body *')) {
    if (el.closest('svg, script, style, noscript, template, [hidden], .hpi')) continue;
    const s = getComputedStyle(el); if (s.display === 'none' || s.visibility === 'hidden') continue;
    const r = el.getBoundingClientRect(); if (!r.width || !r.height) continue;
    if ((r.right > W + 1 || r.left < -1) && !clipped(el)) out.push(label(el) + ' ' + Math.round(r.left) + '~' + Math.round(r.right));
    // 칸 안에서 넘친 글(제 글을 가진 칸 · 넘침을 보이게 둔 칸 · 말줄임 빼고)
    if (s.overflowX === 'visible' && s.display !== 'inline' && s.textOverflow !== 'ellipsis' && el.clientWidth > 0 && el.scrollWidth > el.clientWidth + 1
      && [...el.childNodes].some(n => n.nodeType === 3 && n.nodeValue.trim()) && !clipped(el)) box.push(label(el) + ' ' + el.scrollWidth + '>' + el.clientWidth);
  }
  return {over: de.scrollWidth - W, out: out.slice(0, 6), box: box.slice(0, 6)};
}
async function judge(p, where, {widths = true} = {}) {
  const tx = await p.evaluate(judgeText, OLD_EN);
  for (const t of tx.han) { if (t.av) avChars.add(t.ex); fail(t.mod ? '한글 남음(모듈 칸)' : t.av ? '한글 남음(동그라미 글자 — app.js first() 가 영어 이름 첫 글자를 써야 함)' : '한글 남음', where, t.k, t.ex); }
  for (const t of tx.attrs) fail(t.mod ? '한글 남음(모듈 칸 · 속성)' : '한글 남음(속성)', where, t.k, t.ex);
  for (const t of tx.pseudo) fail('한글 남음(꾸밈 글)', where, t);
  for (const t of tx.avBad) fail('동그라미 글자가 낱말로 바뀜', where, t);
  for (const t of tx.atlas) fail('옛 이름 ' + (t.w || OLD_EN.join('/')) + ' 남음' + (t.mod ? '(모듈 칸)' : ''), where, t.ex);
  // 창 제목 — app.js 가 그린 뒤에 document.title 을 바꿈(엔진은 body 만 봄) → 사전에 틀이 있어도 app.js 가 L() 로 감싸야 영어
  if (HAN.test(tx.title)) fail(HAN.test(tx.titleEn) ? '창 제목 한글(사전에도 없음)' : '창 제목 한글(app.js 가 L() 로 안 감쌈 — 사전에는 있음)', where, tx.titleKey, tx.title);
  if (tx.lang !== 'en') fail('html lang', where, String(tx.lang));
  // 사전에 없는 틀 — 엔진이 처음 본 차례대로 쌓음 · 쪽 모듈 칸(.co-d · .chx-d · .today-d) 안의 글이면 「[모듈]」
  const ms = await p.evaluate(seen => (window.__atlasI18n?.missing() ?? []).filter(m => !seen.includes(m.key)).map(m => ({...m,
    mod: [...document.querySelectorAll('.co-d, .chx-d, .today-d, .wy, .wy-me, .gdr')].some(s => s.textContent.includes(m.ex) || [...s.querySelectorAll('[aria-label]')].some(e => e.getAttribute('aria-label').includes(m.ex)))})), [...miss.keys()]);
  for (const m of ms) if (!miss.has(m.key)) miss.set(m.key, {ex: m.ex, at: (m.mod || /^#\/(w\/[^/]+\/|surge|cal|cond|talk|up|time|info|x\/|why|gdr)/.test(where) ? '[모듈] ' : '') + where});
  if (widths) {
    for (const w of WIDTHS) {
      if (w !== MAIN_W) { await p.setViewportSize({width: w, height: H}); await p.evaluate(() => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)))); }
      const g = await p.evaluate(judgeBox);
      if (g.over > 0) fail('가로 넘침', where + ' @' + w, g.over + 'px');
      for (const x of g.out) fail('화면 밖으로 나간 칸', where + ' @' + w, x.replace(/ -?\d+~\d+$/, '') + ' @' + w);
      for (const x of g.box) fail('칸 안에서 넘친 글', where + ' @' + w, x.replace(/ \d+>\d+$/, '') + ' @' + w);
    }
    await p.setViewportSize({width: MAIN_W, height: H});
  }
  errs(p, where);
  bump('화면');
  return tx;
}
function errs(p, where) {
  for (const e of p._errs) { const mod = /\/next\/p-[a-z]+\.(js|css)|dynamically imported module/.test(e); fail(mod ? '모듈 파일 못 받음' : '화면 오류', where, e.slice(0, 180)); }
  p._errs.length = 0;
  for (const d of p._dicts ?? []) if (!d.startsWith('/next/')) fail('옛 영어 사전', where, '새 화면이 옛 엔진 · 사전을 받음 ' + d + ' — /next/i18n.js · /next/i18n/ 만 써야 함');
  if (p._dicts) p._dicts.length = 0;
}

/* ── 고도리(규칙 77) — 「나」 칸 기록 심기 · 왜 사? 끝까지 누르기 · 고도리 칸 내 돈 바꾸기 · 칸 열기 ──
   누른 뒤 남는 기억(왜 사? 기록 · 내 돈)은 처음대로 돌려놓고, 「나」 칸은 들 때마다 같은 기록 둘로 덮어 씀 → 몫 · 차례와 상관없이 같은 화면(나눠 돌려도 같은 일감) */
const WHY_KEY = 'atlas:godori-why', MONEY_KEY = 'atlas:godori-money';
const settle = q => q.evaluate(() => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r))));
const keepKey = (q, k) => q.evaluate(K => { try { return localStorage.getItem(K); } catch { return null; } }, k);
const putKey = (q, k, v) => q.evaluate(([K, V]) => { try { if (V == null) localStorage.removeItem(K); else localStorage.setItem(K, V); } catch { /* 기억 못 하는 기계 */ } }, [k, v]);
/** 「나」 칸 기록 둘 — 오늘(반만 준비됐어) · 40일 전(좋아, 정해 둔 대로만 · 한 달 뒤 결과를 셈함) · 점수 · 판정은 화면의 셈(p-why.js judge) · 고른 곳 = 고도리 칸 자료 앞 셋 */
async function seedWhy(q, where) {
  if (!modHave.why) return;
  const r = await q.evaluate(async K => {
    try {
      const W = await import('/next/p-why.js'), G = window.NX?.gdr ? await window.NX.gdr() : null;
      const picks = (G?.picks ?? []).slice(0, 3).map(x => ({code: x.code, name: x.name, price: x.price, w: x.w}));
      const mk = (days, answers) => { const J = W.judge(answers); return {at: new Date(Date.now() - days * 864e5).toISOString(), asOf: G?.asOf ?? null, answers, score: J.score, reds: J.reds, verdict: J.verdict, groups: J.groups, picks}; };
      localStorage.setItem(K, JSON.stringify([mk(0, [2, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0]), mk(40, [2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0])]));
      return null;
    } catch (e) { return String(e?.message ?? e); }
  }, WHY_KEY);
  if (r) fail('누르기', where, '「나」 칸 왜 사? 기록을 못 심음 — ' + r.slice(0, 120));
}
/** 매매일지(왜 사?) — ① 종목 고르기(#/why 만 — 없는 말 · 회사 이름 · 엔터) → 질문마다 답 단추를 모두 눌러 봄(답마다 고도리 한마디 · 격언 · 「클 일이 있다」면 날짜) → 다음 › …
 *  → ③ 마지막 두 줄(빈 칸 알림 · 빠른 말 · 팔 선 두 숫자) → 결과 — 2026-10-17 21:10 [3] 1 · 3 · 4 · #/why/<번호> 는 그 종목으로 바로 1번 */
async function whyWalk(q, where) {
  const keep = await keepKey(q, WHY_KEY);
  try {
    const inp = q.locator('#view .wy .wy-find');
    if (where === '#/why') {
      if (!(await inp.count())) { fail('누르기', where, '매매일지 첫 칸에 종목 찾기(.wy-find)가 없음'); return; }
      await inp.fill('zzqqxx'); // 영어 판에서 사람이 칠 만한 없는 말(한글을 치면 그 말이 알림에 그대로 나옴) await q.waitForTimeout(150); await judge(q, where + ' · 종목 찾기 없는 말', {widths: false});
      await inp.fill(CO['005930']?.n ?? '005930'); await q.waitForTimeout(150); await judge(q, where + ' · 종목 찾기', {widths: true});
      await inp.press('Enter');
    }
    await q.waitForSelector('#view .wy .wy-opt', {timeout: 8000}).catch(() => {});
    const later = new Date(Date.now() + 30 * 864e5).toISOString().slice(0, 10);
    for (let i = 0; i < 11; i++) {
      const opts = q.locator('#view .wy .wy-opt'), n = await opts.count();
      if (!n) { fail('누르기', where, `왜 사? ${i + 1}번째 질문에 답 단추가 없음`); return; }
      for (let k = 0; k < n; k++) { await opts.nth(k).click(); await settle(q); await judge(q, `${where} · ${i + 1}번 답 ${k + 1}`, {widths: i === 0 && k === n - 1}); }
      const d = q.locator('#view .wy .wy-date'); if (await d.count()) { await d.fill(later); await settle(q); } // 「클 일이 있다」 = 그 날짜([3] 3)
      const nx = q.locator('#view .wy .wy-next');
      if (!(await nx.count())) { fail('누르기', where, `왜 사? ${i + 1}번째 질문에 다음 단추가 없음`); return; }
      await nx.first().click(); await settle(q);
    }
    if (!(await q.locator('#view .wy .wy-why').count())) { fail('누르기', where, '왜 사? 열한 번째 뒤에 마지막 두 줄이 안 나옴'); return; }
    await judge(q, where + ' · 마지막 두 줄', {widths: true});
    await q.locator('#view .wy .wy-next').first().click(); await settle(q); await judge(q, where + ' · 두 줄 빈 칸 알림', {widths: false});
    await q.locator('#view .wy .wy-chip').first().click(); await settle(q);
    for (const [sel, v] of [['.wy-sell', '60000'], ['.wy-half', '90000']]) { const x = q.locator('#view .wy ' + sel); if (await x.count() && !(await x.inputValue())) await x.fill(v); }
    await q.locator('#view .wy .wy-next').first().click(); await settle(q);
    if (!(await q.locator('#view .wy .wy-res').count())) { fail('누르기', where, '왜 사? 두 줄 뒤에 결과가 안 나옴'); return; }
    await judge(q, where + ' · 결과', {widths: true}); bump('왜 사? 끝까지');
  } finally { await putKey(q, WHY_KEY, keep); }
}
/** 고도리 칸 잠김(질문 전 · [6] 1) — 새 창(기록 없음 · 이 창에서 질문을 끝낸 적 없음 — p-why 는 끝낸 것을 창이 닫힐 때까지 기억)에서 그 길을 엶 → 잠긴 칸 글 · #/why 고리 · 칸 없음
 *  → 원래 창 q 에는 기록을 심음(열린 꼴은 다음 go) */
async function gdrLocked(q, r) {
  if (!modHave.gdr) return;
  const z = await newPage();
  try {
    await go(z, r);
    const x = await z.evaluate(() => ({lock: !!document.querySelector('#view section.gdr.lock1'), go: document.querySelector('#view section.gdr.lock1 a.gdr-l1')?.getAttribute('href') ?? null, cells: document.querySelectorAll('#view .gdr-cell').length})); // 잠금 한 줄 = section.gdr.lock1 · a.gdr-l1([6] 10 · p-gdr lockBox)
    if (!x.lock || x.go !== '#/why' || x.cells) fail('누르기', r + ' · 잠김', '질문 전인데 고도리 칸이 잠기지 않음 ' + JSON.stringify(x));
    await judge(z, r + ' · 잠김', {widths: r === '#/gdr'}); bump('고도리 칸 잠김');
  } finally { await z.context().close(); }
  await seedWhy(q, r);
}
/** 고도리 칸 — [9] 4 내 돈 칸(.gdr-in) 없음(2026-10-18 S9c · 옛 「내 돈을 바꿈」 걷기는 뺌) → 닫힌 칸 하나를 엶. 고른 곳 0(칸이 현금으로 둠 하나뿐)이면 열 칸이 없는 게 맞음 — 칸 맞대기는 check_gdr.mjs */
async function gdrWalk(q, where) {
  const keep = await keepKey(q, MONEY_KEY);
  try {
    if (await q.locator('#view .gdr .gdr-in').count()) { fail('누르기', where, '고도리 칸에 내 돈 칸(.gdr-in)이 있음 — [9] 4 는 입력 칸 0'); return; }
    const cell = q.locator('#view .gdr .gdr-cell:not(.cash):not(.on)').first();
    if (!(await cell.count())) return; // 고른 곳 0
    await cell.click(); await settle(q); await judge(q, where + ' · 칸 엶', {widths: true}); bump('고도리 칸 누르기');
  } finally { await putKey(q, MONEY_KEY, keep); }
}

/* ── ① 길 돌기 ── 이 몫의 길만(RUN · 한 번 다 돌 때와 같은 차례) · 창 p 는 길이나 @tail 을 맡은 몫만 엶 */
let tS = Date.now();
const p = RUN.length || TAIL_MINE ? await newPage() : null;
if (p) { errs(p, '처음 열기'); mark('open', tS); }
// 쇼츠 장 수 → 한 장씩(#/shorts 를 맡은 몫만)
if (on('shorts') && mineIds.has('#/shorts')) { await go(p, '#/shorts'); const n = await p.evaluate(() => document.querySelectorAll('#view .sh').length); bump('쇼츠 장', n); const at = RUN.findIndex(x => x.r === '#/shorts'); for (let i = 0; i < n; i++) RUN.splice(at + 1 + i, 0, {kind: 'shorts', r: '#/shorts/' + i}); await go(p, '#/me'); }
tS = Date.now();
for (const {kind, r} of RUN) { // 바로 앞과 같은 길은 일감을 세울 때 이미 뺌
  try {
    if (r === '#/me' || r === '#/why') await seedWhy(p, r); // 매매일지 기록(오늘 · 40일 전) — 매매일지 화면 아래 줄([3] 7) · 보유종목 점검이 맞대 봄([5] 6)
    if (r === '#/gdr' || r === '#/gdr/1') await gdrLocked(p, r); // [6] 1 — 질문 전(잠김) 꼴을 먼저 · 그 뒤 기록을 심고 열린 꼴
    await go(p, r); await p.waitForTimeout(r === '#/' ? 300 : 60);
    if (r === '#/why' && modHave.why) await p.waitForSelector('#view .wy-rec p.note b.num', {timeout: 6000}).catch(() => {}); // 40일 전 기록의 「한 달 뒤 결과」(회사 파일을 받아 셈) 까지
    await judge(p, r); bump('길 · ' + kind);
    if (r === '#/why' || r === '#/why/005930') await whyWalk(p, r);
    else if (r === '#/gdr' || r === '#/gdr/1') await gdrWalk(p, r);
  } catch (e) { fail('멈춤', r, String(e.message || e).slice(0, 160)); }
}
if (RUN.length) mark('routes', tS);

/* ── ② 누르기 ── (② ③ ④ = 일감 @tail — 맡은 몫만 · 같은 창에서 이 차례) */
async function toastOf(q) { return q.evaluate(() => [...document.querySelectorAll('.toast')].map(e => e.textContent).join(' | ')); }
/** 보내기 글상자(p-share open — dialog.ps-dlg) — 연 꼴을 잼 · 빠른 말 · (full 이면) 거르는 말 알림 · 보내기 뒤 글 · 닫기(「닫기」) 뒤 글상자가 남지 않음 */
async function shareDlg(q, where, full) {
  const D = q.locator('dialog.ps-dlg[open], .ps-dlg.ps-fb');
  if (!(await D.first().waitFor({state: 'visible', timeout: 8000}).then(() => true, () => false))) { fail('누르기', where, '보내기 글상자(dialog.ps-dlg)가 안 뜸'); return; }
  await settle(q); await judge(q, where + ' · 글상자', {widths: full}); bump('보내기 글상자');
  const qb = q.locator('.ps-dlg .ps-qb'); if (await qb.count()) { await qb.first().click(); await settle(q); await judge(q, where + ' · 빠른 말', {widths: false}); }
  if (full) {
    await q.locator('.ps-dlg textarea.ps-t').first().fill('top pick, up 30%'); await settle(q); await judge(q, where + ' · 거르는 말', {widths: false}); // 쓰지 않을 말(top) · 수익 숫자 알림 글 — 영어 판에서 칠 만한 말(한글 말은 알림에 그대로 나옴)
    await q.locator('.ps-dlg textarea.ps-t').first().fill(''); await q.locator('.ps-dlg .ps-go').first().click(); await q.waitForTimeout(300); await judge(q, where + ' · 보내기 뒤', {widths: false});
  }
  if (await D.count()) { const x = q.locator('.ps-dlg .ps-x'); if (await x.count()) await x.first().click(); else await q.keyboard.press('Escape'); }
  if (!(await D.first().waitFor({state: 'detached', timeout: 5000}).then(() => true, () => false))) { fail('누르기', where, '닫기 뒤에도 글상자가 남음'); await q.keyboard.press('Escape').catch(() => {}); }
  await settle(q);
}
tS = Date.now();
if (TAIL_MINE && on('act')) {
  const W0 = '005930', o = CO[W0];
  try {
    await p.evaluate(() => { for (const k of ['atlas:new:sub', 'atlas:new:hist', 'atlas:new:later']) localStorage.removeItem(k); });
    await go(p, '#/w/' + W0); await p.waitForSelector('#view .chan .sub-btn');
    await p.click('#view .chan .sub-btn'); await judge(p, '누르기 · 구독', {widths: false});
    await p.click('#view .chan .sub-btn'); await judge(p, '누르기 · 구독 풀기', {widths: false});
    await p.click('#view .acts .act'); await judge(p, '누르기 · 관심 담기', {widths: true});
    await p.click('#view .acts .act'); await judge(p, '누르기 · 관심 빼기', {widths: false});
    // 보내기 · 같이 따져 줘 = 「친구에게 무슨 말을 할래?」 글상자([4] 1 ~ 8 · p-share — 모든 보내기 단추가 NX.shareBox) — 연 꼴 · 빠른 말 · 거르는 말 · 보내기 뒤 · 닫기
    await p.context().grantPermissions(['clipboard-read', 'clipboard-write'], {origin: base}).catch(() => {});
    for (const [nm, btn] of [['보내기', p.locator('#view .acts button.act').nth(1)], ['같이 따져 줘', p.locator('#view .acts button.act').nth(2)]]) { // .acts = [관심 담기] [보내기] [같이 따져 줘]
      if (!(await btn.count())) { fail('누르기', nm, '회사 화면에 「' + nm + '」 단추가 없음'); continue; }
      await btn.first().click(); await shareDlg(p, '누르기 · ' + nm, true);
    }
    { const wg = p.locator('#view a.why-go'); if (!(await wg.count())) fail('누르기', '#/w/' + W0, '「이 회사로 왜 사?」(a.why-go)가 없음([3] 2)'); else if ((await wg.first().getAttribute('href')) !== '#/why/' + W0) fail('누르기', '#/w/' + W0, 'a.why-go 고리 ' + (await wg.first().getAttribute('href'))); }
    const more = p.locator('#view button.more').first();
    if (await more.isVisible().catch(() => false)) { await more.click(); await judge(p, '누르기 · 다음 볼 것 더 보기'); }
    // 선 끌기 — 회사 · 지수
    for (const hh of ['#/w/' + W0, '#/w/KOSPI']) {
      await go(p, hh); const bx = await p.locator('#view .player').boundingBox();
      for (const fx of [0.04, 0.35, 0.6, 0.97]) {
        await p.mouse.move(bx.x + bx.width * fx, bx.y + bx.height / 2); await p.mouse.down(); await p.mouse.move(bx.x + bx.width * (fx + 0.01), bx.y + bx.height / 2, {steps: 2});
        await judge(p, '누르기 · 선 끌기 ' + hh + ' ' + fx, {widths: fx === 0.97}); await p.mouse.up();
      }
      await p.mouse.click(bx.x + bx.width / 2, bx.y + bx.height / 2); await p.waitForTimeout(60); await judge(p, '누르기 · 짧게 누름 ' + hh, {widths: false});
    }
    // 채널 — 업종 탭 · 더 보기
    await go(p, '#/ch/g/' + enc(core.groups[0].id));
    const tabs = p.locator('#view .ctabs button'); if (await tabs.count() > 1) { await tabs.nth(1).click(); await judge(p, '누르기 · 갈래 채널 업종 탭'); await tabs.nth(0).click(); }
    const cm = p.locator('#view button.more'); if (await cm.isVisible().catch(() => false)) { await cm.click(); await judge(p, '누르기 · 채널 더 보기'); }
    // 찾기 쓰기
    await go(p, '#/find');
    const words = [...FIND_WORDS, o.n, CO[WATCH[WATCH.length - 1]].n, core.industries[3].name, core.groups[2].name, '갈래', 'zz'];
    for (const wd of words) { await p.fill('#view .find input', wd); await judge(p, '누르기 · 찾기 「' + wd + '」', {widths: wd === words[0]}); }
    await p.fill('#view .find input', ''); await judge(p, '누르기 · 찾기 지움', {widths: false});
    // 구독한 채널 칸 · 나 칸
    const subKeys = ['g:' + core.groups[0].id, 'g:' + core.groups[1].id, 'i:' + core.industries[0].name, 'i:' + core.industries[30].name];
    const hist = WATCH.slice(0, 14), later = WATCH.slice(2, 7);
    await p.evaluate(([s, hi, la]) => { localStorage.setItem('atlas:new:sub', JSON.stringify(s)); localStorage.setItem('atlas:new:hist', JSON.stringify(hi)); localStorage.setItem('atlas:new:later', JSON.stringify(la)); }, [subKeys, hist, later]);
    await seedWhy(p, '누르기 · 나 칸'); // 「나」 칸 왜 사? 기록 — 길 돌기의 #/me 와 같은 둘
    await go(p, '#/sub'); await judge(p, '누르기 · 관심 칸(채널 넷 · 담은 회사)'); // 「나중에 볼 것」 → 관심([2] 8)
    await go(p, '#/me'); await judge(p, '누르기 · 보유종목(본 기록)');
    let dlg = null; p.once('dialog', d => { dlg = d.message(); d.accept(); });
    await p.click('#view .lst button'); await p.waitForTimeout(150);
    if (dlg == null) fail('누르기', '본 기록 지우기', '확인 창이 안 뜸');
    else if (HAN.test(dlg)) { const en = await p.evaluate(s => window.__atlasI18n.t(s), dlg); fail(HAN.test(en) ? '한글 남음(확인 창 · 사전에도 없음)' : '한글 남음(확인 창 · app.js 가 L() 로 안 감쌈 — 사전에는 있음)', '본 기록 지우기', dlg); }
    if (dlg != null && OLD_RE.test(dlg)) fail('옛 이름 ' + dlg.match(OLD_RE)[0] + ' 남음', '본 기록 지우기', '확인 창 ' + dlg.slice(0, 70));
    await judge(p, '누르기 · 지우기', {widths: false});
    // 쇼츠 보내기
    await go(p, '#/shorts'); const sb = p.locator('#view .sh .side button').first();
    if (await sb.count()) { await sb.click(); await shareDlg(p, '누르기 · 시황 보내기', false); }
    // 글씨 크기 단추(보통 → 크게 → 아주 크게 → 보통 · 알림 글 · 단추 이름) + 아주 크게로 주요 화면 넘침(영어 글이 가장 길어지는 때)
    if (await p.locator('#fontBtn').count()) {
      for (let k = 0; k < 3; k++) { await p.click('#fontBtn'); await p.waitForTimeout(60); await judge(p, '누르기 · 글씨 크기 ' + (k + 1), {widths: false}); }
      await p.click('#fontBtn'); await p.click('#fontBtn'); // 아주 크게
      for (const hh of ['#/', '#/w/005930', '#/w/KOSPI', '#/f/lead', '#/f/us', '#/shorts', '#/sub', '#/me', '#/find/' + enc('반도체'), '#/ch/g/semi', '#/ch/i/' + enc(core.industries[0].name)]) { await go(p, hh); await judge(p, '아주 큰 글씨 · ' + hh); }
      await p.click('#fontBtn'); // 보통으로
    }
    bump('누르기');
  } catch (e) { fail('멈춤', '누르기', String(e.message || e).slice(0, 200)); }
}

/* ── ③ 바꿔치기 — 받은 자료를 화면 안에서 바꿔 다시 그림(NX.D · 같은 창) ── */
const C = x => JSON.parse(JSON.stringify(x));
const kstDay = (ms = Date.now()) => new Date(ms + 9 * 36e5).toISOString().slice(0, 10);
const TODAY = kstDay(), addD = (d, k) => new Date(Date.parse(d + 'T00:00:00Z') + k * 864e5).toISOString().slice(0, 10);
const bizBack = (d, k) => { let x = d, n = 0; while (n < k) { x = addD(x, -1); const w = new Date(x + 'T00:00:00Z').getUTCDay(); if (w && w !== 6) n++; } return x; };
const PAST = bizBack(TODAY, 3);
/** 지수 선 — n 줄 · 끝 날 end · 마지막 하루 t(%) · 앞 날들 평소 크기 avg(번갈아 오르내림 — 잇달아 없음) · 같은 쪽 더 큰 날 gap 거래일 앞 · 잇달아 k */
function idxRows(end, {t, avg = 1, gap = null, k = 1, n = 62}) {
  const ds = []; let d = end; for (let i = 0; i < n; i++) { ds.unshift(d); d = bizBack(d, 1); }
  const mv = []; for (let i = 1; i < n; i++) mv.push((i % 2 ? 1 : -1) * avg * (0.8 + 0.4 * ((i * 7) % 5) / 4));
  const m = mv.length; mv[m - 1] = t; for (let j = 2; j <= k; j++) mv[m - j] = Math.sign(t || 1) * avg * 0.5;
  if (gap != null) mv[m - 1 - gap] = t * 1.3;
  const rows = [[ds[0], 2500]]; for (let i = 1; i < n; i++) rows.push([ds[i], Math.round(rows[i - 1][1] * (1 + mv[i - 1] / 100) * 100) / 100]);
  return rows;
}
function idxOf(name, end, shape, live) {
  const rows = idxRows(end, shape), lastV = rows.at(-1)[1], prev = rows.at(-2)[1];
  const hiI = rows.reduce((a, r, i) => (r[1] > rows[a][1] ? i : a), 0), loI = rows.reduce((a, r, i) => (r[1] < rows[a][1] ? i : a), 0);
  return {name, rows, date: end, close: lastV, day: Math.round((lastV / prev - 1) * 1e4) / 100, live, hi: {d: rows[hiI][0], v: rows[hiI][1]}, lo: {d: rows[loI][0], v: rows[loI][1]}, chg20: 1.2};
}
const SHAPES = [{t: 2.8}, {t: -2.8}, {t: 2.2, gap: 8}, {t: -2.2, gap: 8}, {t: 2.2, gap: 3}, {t: 1.0}, {t: -1.0}, {t: 0.3}, {t: -0.3}, {t: 0.02}, {t: 1.4, k: 4}, {t: -1.4, k: 5}, {t: 3.3, k: 3}, {t: -3.3, k: 3}];
/** 받은 때 — [이름, 끝 날, 장 중?, stale.idx(받은 때 · 없으면 null), kst] */
const WHENS = [['날짜 · 마감', PAST, false, null, PAST + ' 18:00'], ['오늘 · 마감', TODAY, false, null, TODAY + ' 18:00'], ['날짜 오전까지', PAST, true, PAST + ' 10:20', TODAY + ' 08:00'],
  ['날짜 오후까지', PAST, true, PAST + ' 14:59', TODAY + ' 08:00'], ['오늘 오전까지', TODAY, true, TODAY + ' 10:20', TODAY + ' 10:21'], ['오늘 오후까지', TODAY, true, TODAY + ' 13:05', TODAY + ' 13:06']];
const ALERTS = [[{kind: 'idx', key: 'KOSPI', name: '코스피', v: -3.1, why: 'usual'}], [{kind: 'idx', key: 'KOSDAQ', name: '코스닥', v: 5.6, why: 'big'}],
  [{kind: 'idx', key: 'KOSPI', name: '코스피', v: -2.4, why: 'usual'}, {kind: 'idx', key: 'KOSDAQ', name: '코스닥', v: -3.0, why: 'usual'}],
  [{kind: 'idx', key: 'KOSPI', name: '코스피', v: 2.4, why: 'usual'}, {kind: 'idx', key: 'KOSDAQ', name: '코스닥', v: -3.0, why: 'usual'}],
  [{kind: 'idx', key: 'KOSPI', name: '코스피', v: 6.1, why: 'big'}, {kind: 'idx', key: 'KOSDAQ', name: '코스닥', v: 7.2, why: 'big'}],
  [{kind: 'idx', key: 'KOSPI', name: '코스피', v: -5.2, why: 'big'}, {kind: 'idx', key: 'KOSDAQ', name: '코스닥', v: 2.6, why: 'usual'}],
  [{kind: 'idx', key: 'KOSPI', name: '코스피', v: 5.2, why: 'big'}], [{kind: 'idx', key: 'KOSDAQ', name: '코스닥', v: -2.6, why: 'usual'}]];
async function swap(q, patch) { await q.evaluate(pt => { const D = window.NX.D; for (const [k, v] of Object.entries(pt)) D[k] = v; }, patch); }
async function redraw(q, hh, where, opt) { await go(q, hh === '#/me' ? '#/sub' : '#/me'); await go(q, hh); await judge(q, where, opt); }
if (TAIL_MINE) mark('act', tS);
tS = Date.now();
if (TAIL_MINE && EDGE && on('edge')) {
  try {
    const H0 = C(home), core0 = C(core);
    let si = 0;
    for (const [wn, end, live, stale, kst] of WHENS) {
      for (let j = 0; j < 4; j++) {
        const s1 = SHAPES[si % SHAPES.length], s2 = SHAPES[(si + 7) % SHAPES.length]; si++;
        const Hx = C(H0); Hx.kst = kst; Hx.live = live; Hx.stale = stale ? {...(Hx.stale || {}), idx: stale} : null;
        Hx.idx = {KOSPI: idxOf('코스피', end, s1, live), KOSDAQ: idxOf('코스닥', end, s2, live)}; Hx.alerts = ALERTS[si % ALERTS.length];
        await swap(p, {home: Hx}); await redraw(p, '#/', `바꿔치기 · 오늘 한 줄 ${wn} ${j}`, {widths: j === 0});
        if (j === 0) { await redraw(p, '#/shorts', `바꿔치기 · 쇼츠 ${wn}`, {widths: false}); await redraw(p, '#/w/KOSDAQ', `바꿔치기 · 지수 ${wn}`, {widths: false}); }
      }
    }
    // 큰 날 「!」 모두 · 짧은 선 · 하루 모름 · 코스닥 없음 · 미국 · 고른 곳 · 지수 없음
    for (const [k, al] of ALERTS.entries()) { const Hx = C(H0); Hx.alerts = al; await swap(p, {home: Hx}); await redraw(p, '#/', '바꿔치기 · 큰 날 ' + k, {widths: k === 4}); }
    { const Hx = C(H0); Hx.idx.KOSPI = idxOf('코스피', PAST, {t: 1.2, n: 15}, false); Hx.idx.KOSDAQ = {...idxOf('코스닥', PAST, {t: -0.8, n: 12}, false), day: null}; await swap(p, {home: Hx}); await redraw(p, '#/', '바꿔치기 · 짧은 선 · 하루 모름'); await redraw(p, '#/shorts', '바꿔치기 · 쇼츠 하루 모름', {widths: false}); }
    { const Hx = C(H0); delete Hx.idx.KOSDAQ; Hx.idx.KOSPI.live = true; await swap(p, {home: Hx}); await redraw(p, '#/', '바꿔치기 · 코스닥 없음', {widths: false}); await redraw(p, '#/shorts', '바꿔치기 · 쇼츠 코스닥 없음', {widths: false}); await redraw(p, '#/w/KOSPI', '바꿔치기 · 지수 장 중', {widths: false}); }
    { const Hx = C(H0); Hx.idx.KOSPI.date = 'x'; Hx.stale = null; Hx.live = false; Hx.idx.KOSPI.live = false; Hx.idx.KOSDAQ.live = false; await swap(p, {home: Hx}); await redraw(p, '#/', '바꿔치기 · 날짜 모름', {widths: false}); }
    { const Hx = C(H0); Hx.idx = {}; Hx.us = null; Hx.s365 = null; await swap(p, {home: Hx}); for (const hh of ['#/', '#/f/us', '#/f/pick', '#/w/KOSPI', '#/w/KOSDAQ', '#/shorts']) await redraw(p, hh, '바꿔치기 · 지수 · 미국 · 고른 곳 없음 ' + hh, {widths: false}); }
    await swap(p, {home: C(H0)});
    // 봉인 줄 — 오늘 엶 · 엶 날 지남 · 1주 오른 업종 없음(core 는 같은 것을 고쳐 씀 — 찾아보기 칸(IXC)이 같은 것을 봄)
    for (const [nm, d] of [['오늘 엶', TODAY], ['엶 날 지남', bizBack(TODAY, 30)]]) { await p.evaluate(dd => { window.NX.D.core.time.opens[0].date = dd; }, d); await redraw(p, '#/', '바꿔치기 · 봉인 ' + nm, {widths: false}); }
    await p.evaluate(dd => { window.NX.D.core.time.opens[0].date = dd; }, core0.time.opens[0].date);
    await p.evaluate(() => { const c = window.NX.D.core; c.__rise = c.rise.list; c.rise.list = []; });
    await redraw(p, '#/f/rise', '바꿔치기 · 1주 오른 업종 없음'); await redraw(p, '#/shorts', '바꿔치기 · 쇼츠 오른 업종 없음', {widths: false}); await redraw(p, '#/', '바꿔치기 · 첫 화면 오른 업종 없음', {widths: false});
    await p.evaluate(() => { const c = window.NX.D.core; c.rise.list = c.__rise; delete c.__rise; });
    bump('바꿔치기');
  } catch (e) { fail('멈춤', '바꿔치기', String(e.message || e).slice(0, 200)); }
}

/* ── ④ 오늘 한 줄 문장 모두 — 때 일곱 꼴 × 코스피(는) · 코스닥(은) × 오름 · 내림 × 평소 견줌 × 이후 가장 크게 × 잇달아 — 엔진에 바로 넣어 봄
   (app.js todayWords · idxAlerts 와 같은 말 차례 · 숫자는 아무 값 — 틀은 숫자를 {n} 으로 바꿈) */
if (TAIL_MINE) mark('edge', tS);
tS = Date.now();
if (TAIL_MINE && on('grammar')) {
  const out = await p.evaluate(() => {
    const NB = ' ', T = window.__atlasI18n.t, bad = [];
    const whens = ['10월 9일', '오늘', '10월 9일 오전 10:20까지', '10월 9일 오후 2:59까지', '오늘 오전 9:40까지', '오늘 오후 1:05까지'];
    const ss = [];
    for (const [nm, jo] of [['코스피', '코스피는'], ['코스닥', '코스닥은']]) {
      ss.push(`? ${nm} 값을 못 받았어요.`);
      for (const w of [...whens, '?']) {
        const lead = w + ' ' + jo;
        ss.push(`${lead} 거의 그대로였어요.`, `${lead} +0.4%예요. ? 3달 값이 모자라 평소와 견주지 못했어요.`, `${lead} −1.2%예요. ? 3달 값이 모자라 평소와 견주지 못했어요.`, `${lead} ?예요. ? 3달 값이 모자라 평소와 견주지 못했어요.`);
        for (const dn of [false, true]) {
          const did = dn ? '내렸어요' : '올랐어요', s1 = `${lead} 2.3%${NB}${did}.`;
          const s2s = [[], ['평소만큼 움직였어요.'], ['평소보다 작게 움직였어요.'], [`평소의${NB}2.6배예요.`], [`평소의${NB}2.6배예요.`, `3달 동안 가장 크게 ${did}.`], [`평소의${NB}12배예요.`, `9월 2일 이후 가장 크게 ${did}.`]];
          for (const s2 of s2s) for (const s4 of [[], [`4거래일 잇달아 ${dn ? '내렸고' : '올랐고'}, 그동안 5.1%${NB}${dn ? '빠졌어요' : '뛰었어요'}.`]]) ss.push([s1, ...s2, ...s4].join(' '));
        }
      }
    }
    for (const who of ['코스피가', '코스닥이', '코스피와 코스닥 모두']) for (const why of ['하루 5% 넘게', `평소의 2.5배 넘게`]) for (const way of ['내렸어요', '올랐어요', '움직였어요']) ss.push(`! ${who} ${why} ${way}.`);
    for (const s of ss) { const o = T(s); if (/[가-힣ㄱ-ㅎㅏ-ㅣ]/.test(o)) bad.push(s); }
    return {n: ss.length, bad};
  });
  bump('오늘 한 줄 문장', out.n);
  for (const s of out.bad) fail('오늘 한 줄 문장(사전에 없음)', 'grammar', s);
  const ms = await p.evaluate(() => window.__atlasI18n?.missing() ?? []); for (const m of ms) if (!miss.has(m.key)) miss.set(m.key, {ex: m.ex, at: 'grammar'});
}
if (TAIL_MINE) mark('grammar', tS);
if (p) { // 창을 닫기 전에 엔진이 마지막 화면 뒤에 쌓은 틀까지(나눠 돌 때 @tail 이 없는 몫도 같은 것을 봄 — 다 돌 때는 grammar 가 하던 것)
  try { const ms = await p.evaluate(() => window.__atlasI18n?.missing() ?? []); for (const m of ms) if (!miss.has(m.key)) miss.set(m.key, {ex: m.ex, at: TAIL_MINE ? 'grammar' : '길 돌기 끝'}); } catch { /* 창이 멈춤 — 위에서 셈 */ }
  await p.context().close();
}

/* ── ⑤ 새 창 — 자료 파일을 못 받을 때(받은 것을 화면 안에서 바꿀 수 없는 칸: 몸값 · 급등 · 모든 자료) ── 일감 @newwin(맡은 몫만) */
tS = Date.now();
if (NEWWIN_MINE && EDGE && on('edge')) {
  for (const [nm, block, hs] of [['몸값 · 급등 · 첫 화면 · 고도리 칸 자료 못 받음', ['cond.json', 'surge.json', 'home.json', '/next/data/gdr.json'], ['#/', '#/f/surge', '#/f/lead', '#/f/pick', '#/f/us', '#/shorts', '#/w/KOSPI', '#/w/005930', ...(modHave.gdr ? ['#/gdr'] : []), ...(modHave.why ? ['#/why'] : [])]],
    ['모든 자료 못 받음', ['core.json', 'mkt.json'], ['#/', '#/f/rise', '#/f/ind', '#/shorts', '#/w/005930', '#/w/KOSPI', '#/ch/g/semi', '#/ch/i/' + enc('반도체'), '#/sub', '#/me', '#/find']]]) {
    let q = null;
    try {
      q = await newPage(block); q._errs = q._errs.filter(e => !/404|Failed to load resource/.test(e)); // 일부러 못 받게 한 파일(404)은 오류로 안 셈
      for (const hh of hs) { await go(q, hh); q._errs = q._errs.filter(e => !/404|Failed to load resource/.test(e)); await judge(q, `새 창 · ${nm} ${hh}`, {widths: hh === '#/'}); }
      // 안 막은 쪽(--dev 의 co · chx 모듈) 못 받음은 위 「모듈 파일 못 받음」으로 셈
      const ms = await q.evaluate(() => window.__atlasI18n?.missing() ?? []); for (const m of ms) if (!miss.has(m.key)) miss.set(m.key, {ex: m.ex, at: '새 창 · ' + nm});
      bump('새 창');
    } catch (e) { fail('멈춤', '새 창 · ' + nm, String(e.message || e).slice(0, 200)); }
    await q?.context().close();
  }
  mark('newwin', tS);
}
await b?.close();

/* ── 결과 ── */
let avMiss = 0;
for (const [key, m] of miss) { if (avChars.has(key)) { avMiss++; continue; } fail('사전에 없는 틀', m.at, key + '  ← 「' + String(m.ex).slice(0, 80) + '」'); }
const list = [...fails.values()];
const kinds = list.reduce((a, f) => { a[f.kind] = (a[f.kind] || 0) + 1; return a; }, {});
const fullRun = !ONLY && !MODS_ONLY && ALL && MODULES && EDGE && DEV && !APP_FILE, full = fullRun && !SHARD; // 몫 하나는 full 이 아님 — 몫을 모두 합친 결과(--merge)가 fullIfMerged 를 이어받음
const own = list.filter(f => !isMod(f)), modF = list.filter(isMod);
const res = {schema: 'atlas11-next-en-check-1', at: new Date().toISOString(), base, page: PAGE, lang: 'en', widths: WIDTHS, routes: RUN.length, companies: WATCH.length, allCompanies: ALL, modules: MODULES,
  modFiles: modHave, edge: EDGE, only: ONLY, appFile: APP_FILE, shard: SHARD?.s ?? null, ...(SHARD ? {fullIfMerged: fullRun} : {}), full,
  units: {total: units.length, mine: mine.length, hash: UHASH, w: UNIT_W}, seconds: Math.round((Date.now() - t0) / 1000), secs, net: netSummary(), counts, missing: miss.size - avMiss, avatarLetters: avMiss, kinds, fails: list.length,
  own: {fails: own.length, missing: own.filter(f => f.kind === '사전에 없는 틀').length, leftover: own.filter(f => f.kind.startsWith('한글 남음')).length},
  mod: {fails: modF.length, missing: modF.filter(f => f.kind === '사전에 없는 틀').length, leftover: modF.filter(f => f.kind.startsWith('한글 남음')).length},
  missingList: [...miss].filter(([key]) => !avChars.has(key)).map(([key, m]) => ({key, ex: m.ex, at: m.at})),
  avChars: [...avChars], avatarList: [...miss.keys()].filter(key => avChars.has(key)), // 합칠 때 동그라미 글자 틀을 몫 사이에서도 빼려고(보통 빈 목록)
  all: list.slice(0, 800), ok: list.length === 0};
await fs.mkdir(path.dirname(OUT), {recursive: true});
await fs.writeFile(OUT, JSON.stringify(res, null, 1) + '\n');
if (DUMP) await fs.writeFile(path.resolve(DUMP), JSON.stringify(res.missingList, null, 1) + '\n');
console.log(JSON.stringify({ok: res.ok, shard: res.shard, routes: res.routes, screens: counts['화면'] || 0, missing: res.missing, fails: res.fails, own: res.own, mod: res.mod, kinds, full, seconds: res.seconds, secs, net: res.net}));
process.exit(res.ok ? 0 : 1);

/** 몫 결과 합치기(--merge) — node scripts/atlas11/next/next_en_check.mjs --merge out/en1.json … [--shards n] --out out/en.json · 끝 코드 0 = 몫이 모두 · 같은 목록 · 실패 0
 *   맞대 봄: 몫 1 ~ n 이 한 번씩 · 같은 일감 목록(units.hash · total) · 몫 일감 수 합 = 전체 · 같은 곳 · 같은 다짐(--all · --modules …) — 아니면 problems · ok: false
 *   합침: counts 더함 · 같은 실패 글은 하나(번 수 더함 · 본 곳 다섯까지) · 사전에 없는 틀은 틀마다 하나(먼저 몫 것) · 동그라미 글자 틀은 몫 사이에서도 뺌
 *         seconds = 가장 긴 몫(함께 도니까 걸린 때) · secondsSum = 모두 더한 것 · shards = 몫마다 한 줄 */
async function mergeShards() {
  const files = []; for (let i = ARGV.indexOf('--merge') + 1; i < ARGV.length && !ARGV[i].startsWith('--'); i++) files.push(ARGV[i]);
  const want = Number(arg('--shards', 0)) || null, problems = [], P = [];
  for (const f of files) {
    let j = null; try { j = JSON.parse(await fs.readFile(f, 'utf8')); } catch (e) { problems.push(`${path.basename(f)} 못 읽음 — ${String(e.message).slice(0, 120)}`); continue; }
    const m = /^(\d+)\/(\d+)$/.exec(j?.shard ?? '');
    if (j?.schema !== 'atlas11-next-en-check-1' || !m) { problems.push(`${path.basename(f)} 은 몫 결과가 아님(shard 없음)`); continue; }
    P.push({k: +m[1], n: +m[2], j, f: path.basename(f)});
  }
  P.sort((a, b) => a.k - b.k);
  const n = want ?? P[0]?.n ?? 0;
  if (!P.length) problems.push('몫 결과가 하나도 없음');
  for (const x of P) if (x.n !== n) problems.push(`${x.f} 몫 수 ${x.n} ≠ ${n}`);
  for (let k = 1; k <= n; k++) { const c = P.filter(x => x.k === k).length; if (c !== 1) problems.push(c ? `${k}/${n} 몫이 ${c}번` : `${k}/${n} 몫 결과 없음`); }
  const lists = new Set(P.map(x => `${x.j.units?.hash}·${x.j.units?.total}`));
  if (lists.size > 1) problems.push('몫마다 일감 목록이 다름(도는 사이 자료가 바뀜?) ' + [...lists].join(' | '));
  const total = P[0]?.j.units?.total ?? 0, sumMine = P.reduce((a, x) => a + (x.j.units?.mine ?? 0), 0);
  if (P.length && lists.size === 1 && sumMine !== total) problems.push(`몫 일감 합 ${sumMine} ≠ 전체 ${total}`);
  for (const key of ['base', 'page', 'allCompanies', 'modules', 'edge', 'only', 'appFile', 'companies', 'fullIfMerged']) if (new Set(P.map(x => JSON.stringify(x.j[key] ?? null))).size > 1) problems.push(`몫마다 ${key} 가 다름`);
  const counts = {}, failsM = new Map(), avAll = new Set(), keysAll = new Set(), missingList = [], seenK = new Set();
  let truncated = false;
  for (const {j} of P) for (const c of j.avChars ?? []) avAll.add(c);
  for (const {j} of P) {
    for (const [k, v] of Object.entries(j.counts ?? {})) counts[k] = (counts[k] || 0) + v;
    for (const k of j.avatarList ?? []) keysAll.add(k);
    for (const m of j.missingList ?? []) { keysAll.add(m.key); if (!avAll.has(m.key) && !seenK.has(m.key)) { seenK.add(m.key); missingList.push(m); } }
    if ((j.all?.length ?? 0) < (j.fails ?? 0)) truncated = true;
    for (const f of j.all ?? []) {
      const tk = f.kind === '사전에 없는 틀' ? String(f.what).split('  ← ')[0] : null; // 사전에 없는 틀은 틀(key)마다 하나 — 보기 글(ex)은 몫마다 다를 수 있음
      if (tk != null && avAll.has(tk)) continue;
      const key = f.kind + '|' + (tk ?? f.what), g = failsM.get(key);
      if (!g) failsM.set(key, {...f, at: [...(f.at ?? [])]});
      else if (tk == null) { g.n += f.n ?? 1; for (const a of f.at ?? []) if (g.at.length < 5) g.at.push(a); }
    }
  }
  const list = [...failsM.values()], own = list.filter(f => !isMod(f)), modF = list.filter(isMod);
  const kinds = list.reduce((a, f) => { a[f.kind] = (a[f.kind] || 0) + 1; return a; }, {});
  const J0 = P[0]?.j ?? {}, sec = P.map(x => x.j.seconds ?? 0);
  const ok = !problems.length && !truncated && list.length === 0;
  const res = {schema: 'atlas11-next-en-check-1', at: new Date().toISOString(), base: J0.base ?? null, page: J0.page ?? null, lang: 'en', widths: J0.widths ?? null,
    routes: P.reduce((a, x) => a + (x.j.routes ?? 0), 0), companies: J0.companies ?? null, allCompanies: J0.allCompanies ?? null, modules: J0.modules ?? null, modFiles: J0.modFiles ?? null,
    edge: J0.edge ?? null, only: J0.only ?? null, appFile: J0.appFile ?? null, shard: `all/${n}`, full: !problems.length && J0.fullIfMerged === true,
    units: {total, hash: J0.units?.hash ?? null, w: J0.units?.w ?? null}, seconds: Math.max(0, ...sec), secondsSum: sec.reduce((a, b) => a + b, 0),
    shards: P.map(x => ({shard: x.j.shard, ok: x.j.ok, fails: x.j.fails, routes: x.j.routes, screens: x.j.counts?.['화면'] ?? 0, mine: x.j.units?.mine ?? null, seconds: x.j.seconds, secs: x.j.secs ?? null})),
    counts, missing: missingList.length, avatarLetters: [...keysAll].filter(k => avAll.has(k)).length, kinds, fails: list.length,
    own: {fails: own.length, missing: own.filter(f => f.kind === '사전에 없는 틀').length, leftover: own.filter(f => f.kind.startsWith('한글 남음')).length},
    mod: {fails: modF.length, missing: modF.filter(f => f.kind === '사전에 없는 틀').length, leftover: modF.filter(f => f.kind.startsWith('한글 남음')).length},
    missingList, all: list.slice(0, 800), truncated, problems, ok};
  await fs.mkdir(path.dirname(OUT), {recursive: true});
  await fs.writeFile(OUT, JSON.stringify(res, null, 1) + '\n');
  console.log(JSON.stringify({ok, shards: n, got: P.length, routes: res.routes, screens: counts['화면'] || 0, missing: res.missing, fails: res.fails, own: res.own, mod: res.mod, kinds, full: res.full, seconds: res.seconds, secondsSum: res.secondsSum, problems}));
  return ok ? 0 : 1;
}
