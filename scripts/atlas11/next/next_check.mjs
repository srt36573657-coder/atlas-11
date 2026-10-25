// 새 아틀란스 시험판(/next/ · 규칙 74) 빠짐없이 도는 검사 — 사장님 2026-10-17 02:38 「정교하게 만들어라」
//   쓰는 법: node scripts/atlas11/next/next_check.mjs --base http://127.0.0.1:8826 [--pw /opt/node-tools/] [--out reports/atlas11/verify/next-check-latest.json] [--limit N]
//   ① 세 폭(320 · 360 · 390)에서 화면 열여섯 — 오류 0 · 가로 넘침 0 · 「여는 중」 남음 0 · 누르는 자리 44px 넘게 · 쓰지 않을 말 0
//   ② 모든 회사 보는 화면 — 이름 · 한 달 % · 하루 % 를 이 검사가 자료에서 따로 셈한 값과 맞댐 · 길 표시(큰 업종 › 업종) · 탭 넷(4 ~ 7단) · 든 목록 꼬리표(고도리 칸 n번 · 급등 칸 · 급등 n%대 칸 · 고른 곳 — gdr.json · surge.json · mkt p 로 따로 셈) ·
//      큰 선 ▶ 없음 · 옛 일곱 칸 없음 · 「챕터」 0(2026-10-18 [7] 1 ~ 4 · [10] 2 · 일꾼 S3p) · 다음 볼 것
//   ③ 모든 업종 · 갈래 채널 — 회사 수 · 한 회사 한 표 · 큰 회사는 크게 · 처음 칸 수
//   ④ 쇼츠 사실 — 오른 곳 · 내린 곳 수 · 1주 1등 업종 · 가장 센 · 약한 갈래 · 가장 많이 오른 회사(하루 30% 튐 · 빈 날 · 사흘 그대로 뺌) · 급등 1등 · 고른 곳 오름 수 · 미국 · 지수
//   ⑤ 찾기 — 모든 회사 이름이 첫 줄에 나옴 · 번호 찾기 · 없는 말
//   ⑥ 누르기 — 구독 → 구독 칸 · 담기 → 나 칸 · 선 끌기 → 그날 값 · 짧게 누르면 처음으로 · 지우기
//   ⑦ 고리 — 모든 화면의 href 가 아는 길(#/… · /#/g · /#/i · /#/c/<번호>/… · /letter.html · /)이고 가리키는 것이 자료에 있음
//   ⑧ 옛 이름 없음(2026-10-17 15:48 「아틀란스에서 보드리로 모두 변경해」) — 모든 길(세 폭 길 · 모든 회사 · 업종 · 갈래 · 달력 종목 · 쇼츠 · 구독 · 나)의 보이는 글 · 창 제목 ·
//      aria-label · alt · title 에 아틀란스 · ATLAS · 아틀라스 가 없음(남의 글 [data-proper] · 원문 [lang="ko"] · 자료의 회사 이름 빼고) → 「옛 이름 남음」 · 창 제목 끝 「 · 보드리」
//   ⑨ 고도리 한 장 명령문(2026-10-17 17:54 명령 1 · 2) — 첫 화면 앞쪽(이야기 입구 · 큰 날 「!」 바로 뒤) = 질문 칸(section.wy) → 고도리 칸(section.gdr) · 첫 화면에 편지 없음 ·
//      사장님 편지 · 열면 고도리 · 친구 소개 · 상품권은 「나」 칸(#/me — 편지를 처음 그릴 때 한 번) · 「나」 칸 왜 사? 기록(section.wy-me) · 새 길 #/why · #/gdr · #/gdr/<번호>
//      (질문 · 고도리 칸의 글 · 숫자 맞대기는 check_why.mjs · check_gdr.mjs) · 이름은 rename.mjs(brand.js 한 곳 — 글자를 박지 않음)
//   ⑩ 첫 화면 한 화면 · 칩 쪽(2026-10-18 명령문 0015 [6] 1 ~ 7 · 9 · [7] 5 · [9] 7 · 일꾼 S2x) — 차례(칩 → 이야기 입구 → 띠 → 질문 칸 → 고도리 칸 → 더 보기 → 안전 한 줄) · 띠 #/today · 날짜 하나 · 「!」 띠 안 ·
//      오늘 시장 칸 · 급등 카드 0 · 「더 보기」 세 줄(큰 숫자 하나 + 까닭 한 줄) · 띠 숫자 되풀이 0 · mkt · cond 안 받음 · 요약 없이도 그림 · 칩 큰 카드 하나 · 한 줄 10줄 · 「나머지 n곳 보기」 · 급등 「1등」 0 · 반값 한 줄 N · n
//   실패가 하나라도 있으면 끝 코드 1 · 결과 파일에 실패 목록
import fs from 'node:fs/promises';
import path from 'node:path';
import {createRequire} from 'node:module';
import {fileURLToPath} from 'node:url';
import {nameScan, oldNamesIn, allowFromData, selfTest as renameSelfTest, LETTER_TITLE, TITLE_TAIL, OLD_NAME_FAIL, OLD_NAME_RE, NEW_NAME} from './rename.mjs';
import {gloss} from '../../../site/next/glossary.js'; // 낱말표(2026-10-18 [10] 1) — 화면 글은 새 낱말(갈래 → 큰 업종 …)
import {screenHits, SCREEN} from '../../../site/next/words.js'; // 쓰지 않을 말 한 곳(명령문 [4] 4 · [7] 6 · 「사라」 · 「팔아라」 포함 · 「공매도」 · 「사라지다」 꼴은 셈 밖 — words.js screenHits)
import {fetchJSON, watch, settle, stylesReady, timer, netSummary} from './net.mjs'; // 망 탈에만 다시 받기 · 다시 열기 · 모양 파일 기다림(2026-10-17 고도리 명령문 [1] 8 — 지금 사이트 검사 #/info 누르는 자리 23px)
import {essenceData, essenceLines} from '../../../site/next/essence.js'; // 첫 화면 본질 세 줄(사장님 2026-10-18 16:39 [5] · 일꾼 KC) — 화면과 같은 셈으로 맞댐
import {VIDEO} from '../../../site/next/brand.js'; // 「… 1분 보기 ›」 줄은 새 영상이 오른 뒤(ready)에만([5] 5)
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');
const arg = (k, d) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : d; };
const require = createRequire(arg('--pw', '/opt/node-tools/'));
const {chromium} = require('playwright');
const base = arg('--base', 'http://127.0.0.1:8826').replace(/\/$/, ''), out = path.resolve(ROOT, arg('--out', 'reports/atlas11/verify/next-check-latest.json'));
const LIMIT = Number(arg('--limit', '0')) || 0;
const fails = [], counts = {}, t0 = Date.now(), tm = timer(t0);
const fail = (k, x) => { if (fails.length < 400) fails.push([k, x]); counts.fail = (counts.fail || 0) + 1; };
const bump = k => { counts[k] = (counts[k] || 0) + 1; };

/* 따로 셈 — 앱 코드를 쓰지 않음(같은 규칙: 반올림은 크기로 · 100% 넘으면 소수 없음) */
function P(x) {
  if (x == null || !Number.isFinite(x)) return '?';
  const r = Math.floor(Math.abs(x) * 10 + 0.5 + 1e-7) / 10;
  if (r === 0) return '0.0%';
  return (x > 0 ? '+' : '−') + (r >= 100 ? Math.floor(r + 0.5 + 1e-7).toLocaleString('ko-KR') : r.toFixed(1)) + '%';
}
const P2 = v => (v == null || !Number.isFinite(v) ? '?' : (v > 0 ? '+' : v < 0 ? '−' : '') + Math.abs(v).toFixed(2) + '%'); // 지수 · 미국 하루 = 둘째 자리 그대로(두 번 반올림 막기)
const MD = d => (+d.slice(5, 7)) + '월 ' + (+d.slice(8, 10)) + '일';
const N = n => Number(n).toLocaleString('ko-KR');
const getJ = f => fetchJSON(base + '/atlas/data/' + f, f); // 망 탈(끊김 · 429 · 5xx)에만 기다렸다 다시 · 404 는 바로 실패(net.mjs)
const [core, mkt, home, surge, cond] = await Promise.all(['core.json', 'mkt.json', 'home.json', 'surge.json', 'cond.json'].map(f => getJ(f).catch(e => { fail('자료', e.message); return null; })));
if (!core || !mkt) { console.error('자료를 못 받음'); process.exit(1); }
const CO = mkt.companies, codes = Object.keys(CO);
const ind = new Map(core.industries.map(i => [i.name, i])), grp = new Map(core.groups.map(g => [g.id, g]));
// 끝 값이 없거나 0 이면(거래 멈춤 · 빈 날) 모름 = 「?」 — 2026-10-17 실제 사이트 탐침에서 005110 · 033340 을 −100% 로 잘못 기대한 것을 고침
const lineChg = l => (l?.[0] > 0 && l[l.length - 1] > 0) ? (l[l.length - 1] / l[0] - 1) * 100 : null, lineDay = l => (l?.length > 1 && l[l.length - 2] > 0 && l[l.length - 1] > 0) ? (l[l.length - 1] / l[l.length - 2] - 1) * 100 : null;
const c20 = o => Number.isFinite(o.c) ? o.c : lineChg(o.l);
const weird = l => { if (!Array.isArray(l) || l.length < 3) return true; for (const v of l) if (!(v > 0)) return true; for (let i = 1; i < l.length; i++) if (Math.abs(l[i] / l[i - 1] - 1) >= 0.3) return true; const n = l.length; return l[n - 1] === l[n - 2] && l[n - 2] === l[n - 3]; };
// 쓰지 않을 말(규칙 72 ⑥) + 지운 36곳 화면 글(inspect4.mjs OLD36_TEXT 를 읽어 그대로 — 「36곳 내림」 같은 셈 글은 아님)
const OLD36 = JSON.parse((/export const OLD36_TEXT = (\[[^\]]*\]);/.exec(await fs.readFile(path.join(ROOT, 'scripts/atlas11/t365/inspect4.mjs'), 'utf8')) || [, '[]'])[1].replace(/'/g, '"'));
if (!OLD36.length) { console.error('OLD36_TEXT 를 못 읽음'); process.exit(1); }
if (SCREEN.length < 16) { console.error('words.js SCREEN 이 모자람', SCREEN.length); process.exit(1); }
/** 화면 글의 쓰지 않을 말 — words.js screenHits(낱말 열여섯) + 지운 36곳 화면 글(글자 그대로) */
const banned = t => [...screenHits(t), ...OLD36.filter(w => t.includes(w))];
// 새 화면으로 옮긴 쪽(app.js READY) — 옮긴 쪽은 새 주소(#/…), 아직이면 지금 아틀란스(/atlas/#/…)를 기대함(2026-10-17 04:23 「에이전트 총 동원해」)
const READY = new Set(((/const READY = new Set\(\[([^\]]*)\]\);/.exec(await fs.readFile(path.join(ROOT, 'site/next/app.js'), 'utf8')) || [, ''])[1].match(/'([a-z]+)'/g) || []).map(x => x.slice(1, -1)));
const oldOr = (k, h) => (READY.has(k) ? h : '/atlas/' + h);
// 고도리 칸 자료(/next/data/gdr.json — 2026-10-17 17:54 「고도리 만들기 · 한 장 명령문」) — #/gdr/<번호> 고리 · 첫 화면 칸 수에 씀(못 받으면 첫 화면은 「?」 줄)
const GDR = await fetchJSON(base + '/next/data/gdr.json', 'gdr.json').catch(() => null);
if (READY.has('gdr') && !Array.isArray(GDR?.picks)) fail('자료', '/next/data/gdr.json 을 못 받음');
/** 매매일지 기록 한 줄(p-why 꼴 — 답 열한 개가 다 있으면 「질문을 끝낸」 기록 · 고도리 칸이 열림) — daysAgo = 며칠 전 */
const WHY_KEY = 'atlas:godori-why';
const whyRec = (daysAgo = 0, code = '005930', verdict = 0) => ({at: new Date(Date.now() - daysAgo * 864e5).toISOString(), asOf: mkt.asOf, code, name: CO[code]?.n ?? code, price: 70000, day: mkt.asOf, // verdict 0 = 판정 글이 없는 옛 꼴(오늘 점수 없음) · 진짜 기록은 '좋아, 정해 둔 대로만' · '반만 준비됐어' · '오늘은 쉬어 가자'
  answers: [0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0], score: 5, reds: 0, verdict, groups: [0, 0, 0, 0], bigDay: null, why: '다 같이 내리면', promise: {sell: 63000, half: 84000, text: '63,000원 아래면 판다'}, picks: []});
// ⑧ 옛 이름 — 자료의 실제 이름(회사 「아틀라스링크」 등)은 옛 이름이 아님 · 검사 자체 시험(바꾸는 말 표 · 찾기가 틀림을 잡는지)
const names = await getJ('names.json').catch(e => { fail('자료', e.message); return null; });
const ALLOW = allowFromData({mkt, names, extra: [...(core.industries || []).map(i => i.name), ...(core.groups || []).map(g => g.name), ...(home?.us?.rows || []).map(r => r.name)]});
for (const x of renameSelfTest()) fail('검사 자체 시험(옛 이름)', x);
const guarded = new Set();
/** 지금 화면에 옛 이름이 남았나 · 창 제목 끝 = 「 · 보드리」(쪽마다 한 번) */
async function guard(p, where) {
  const s = await p.evaluate(nameScan);
  for (const x of oldNamesIn(s, ALLOW).slice(0, 6)) fail(OLD_NAME_FAIL, where + ' ' + x);
  if (!s.title.endsWith(TITLE_TAIL)) fail('창 제목 끝', where + ' 「' + s.title + '」');
  guarded.add(where); bump('옛 이름 본 화면');
}

const exe = '/opt/pw-browsers/chromium', b = await chromium.launch((await fs.stat(exe).catch(() => null)) ? {executablePath: exe} : {}); // 이 방은 미리 깔린 크로미움 · 깃허브 실행기는 playwright 가 깐 것
async function page(width, height = 800) {
  const ctx = await b.newContext({viewport: {width, height}, deviceScaleFactor: 1, hasTouch: true});
  const p = await ctx.newPage(); p._errs = [];
  p.on('pageerror', e => p._errs.push(e.message)); p.on('console', m => { if (m.type() === 'error') p._errs.push(m.text()); });
  return watch(p, base);
}
/** 길 열기 — 망 탈(이 사이트 요청 끊김 · 429 · 5xx · 15초 넘게 답 없음)이 있었던 열기는 믿지 않고 새로 고쳐 다시(net.mjs settle) ·
 *  then(p) 가 있으면 그것까지(보는 화면 이름 등) 한 열기로 봄 · 다 그린 뒤 그 화면 모양 파일(쪽 모듈 .css)이 붙을 때까지 기다림 —
 *  실제 사이트에서 p-info.css 가 늦게 와 「누르는 자리 44px 안 됨 · 친구에게 소개하기 133×23」을 잰 일(2026-10-17 11:56 지금 사이트 검사) · 못 붙으면 실패 「모양 파일 안 붙음」 */
async function go(p, hash, then = null) {
  const ok = await settle(p, async () => {
    await p.evaluate(h => { location.hash = h; }, hash);
    if (!await p.waitForFunction(() => !document.querySelector('#view .boot'), null, {timeout: 20000}).then(() => true, () => false)) return false;
    return then ? then(p) : true;
  }, {what: hash, fail});
  if (ok === false && !then) fail('여는 중 남음', hash);
  if (ok) { const miss = await stylesReady(p); if (miss.length) fail('모양 파일 안 붙음', hash + ' ' + miss.join(' ')); }
  return ok;
}
/** 처음 열기(goto) — 망 탈이면 다시 */
async function first(p, url, ready = () => !document.querySelector('#view .boot'), timeout = 20000) {
  return settle(p, async () => { await p.goto(url); return p.waitForFunction(ready, null, {timeout}).then(() => true, () => false); }, {what: url.replace(base, ''), fail});
}
const scan = p => p.evaluate(() => {
  const vw = document.documentElement.clientWidth, view = document.querySelector('#view');
  const small = [];
  for (const e of document.querySelectorAll('#view a, #view button, .tabs a, .top a, .trial a')) {
    const r = e.getBoundingClientRect(); if (!r.width || !r.height) continue;
    if (getComputedStyle(e).visibility === 'hidden' || e.closest('[hidden]')) continue;
    if (r.height < 43.5 || r.width < 43.5) small.push((e.textContent || e.getAttribute('aria-label') || e.className).trim().slice(0, 30) + ' ' + Math.round(r.width) + '×' + Math.round(r.height));
  }
  const cl = view?.cloneNode(true); cl?.querySelectorAll('[data-proper], [lang="ko"]').forEach(e => e.remove()); // 이름 · 남의 글(원문)은 쓰지 않을 말 셈에서 뺌 — 「코스피 양매도 ETN」 같은 상품 이름
  const sw0 = document.documentElement.scrollWidth, wide = sw0 > vw ? [...document.querySelectorAll('#view *')].filter(e => e.getBoundingClientRect().right > vw + 0.5).slice(0, 3).map(e => e.tagName.toLowerCase() + '.' + String(typeof e.className === 'string' ? e.className : e.className?.baseVal ?? '').split(' ')[0] + ' ' + Math.round(e.getBoundingClientRect().right)) : []; // 넘친 칸 이름(실제 사이트에서만 흔들린 #/today 까닭 찾기 · 2026-10-18)
  return {wide, sw: document.documentElement.scrollWidth, vw, text: cl?.textContent ?? '', hrefs: [...document.querySelectorAll('#view a[href]')].map(a => a.getAttribute('href')), small: small.slice(0, 8), title: document.title};
});
const knownHref = h => {
  if (h === '/' || h === '/letter.html' || h === '/hello.html' || h === '/us/') return true; // /us/ = 미국 판(규칙 54 그대로)
  if (h === '/hello.html#hp-vid') return VIDEO.ready; // 첫 화면 세 줄 칸 밑 「골똘이의 고민 1분 보기 ›」 = 소개 쪽 영상 칸(새 영상이 오른 뒤에만 · [5] 5)
  if (/^https:\/\/[a-z0-9.-]+\.[a-z]{2,}(\/|$)/i.test(h)) return true; // 바깥 출처 고리(유튜브 · 기사 · 네이버 증권 · 공시) — 쪽 검사가 자료와 맞대 봄
  let mm = /^#\/(surge(?:\/(?:10|20|30|40))?|cal|cond(?:\/[a-z0-9]+-[a-z0-9]+-[a-z0-9]+)?|talk|up|time|info|today)$/.exec(h); if (mm) return READY.has(mm[1].split('/')[0]);
  if (h === '/privacy.html#en') return true; // 영어 화면의 처리방침 고리 = 그 쪽 영어 칸(총정리 2026-10-22 D23 — app.js enPrivacy · 한국어 화면은 아래 /privacy.html 그대로)
  if (h === '#/gift' || h === '/privacy.html' || h === 'sms:01090117377' || h === 'tel:01090117377') return true; // 상품권 방(사장님 2026-10-22 03:38 · 위 막대 금빛 선물 단추 · p-gift.js) · 그 쪽 맨 밑 개인정보 처리방침 고리 · 다 본 뒤 나오는 문자 · 전화(사장님 번호 — 소개 쪽 상품권 칸과 같음)
  if (h === '#/admin' || h === '#/game') return true; // 가짜 돈 연습(2026-10-19 15:04) // 관리자 화면(사장님 열쇠 기기 보유종목 바로 가기 · 2026-10-19 13:54)
  if ((mm = /^#\/t\/(hello|how|sprout|sprout\/real|sprout\/new|bloom|wilt|today|alert|cal|pick)$/.exec(h))) return true; // pick = 꽃 핀 업종 안의 싹 회사(사장님 2026-10-22 16:56 · p-theme.js pPick) // cal = 싹 달력(사장님 2026-10-22 11:55 「1 · 2 · 3 … 달력으로 · 기록이 없으면 하수」 · p-theme.js pCal) // 테마 시계 쪽(사장님 2026-10-19 16:46 「36장」 · 16:54 「올려」 · p-theme.js — check_theme 이 쪽마다 맞대 봄 · alert = 26 알림(관심 #/sub 다음 · 2026-10-19 20:40 「다해」))
  if ((mm = /^#\/t\/i\/([^/]+)(?:\/(?:path|spread|big|co|near))?$/.exec(h))) { let nm = mm[1]; try { nm = decodeURIComponent(nm); } catch { return false; } return (core.industries ?? []).some(i => i.name === nm); } // 업종 여섯 쪽 — 업종 이름이 자료에 있어야
  if ((mm = /^#\/t\/c\/([0-9A-Z]{6})(?:\/(?:lead|why|rank|unknown|keep))?$/.exec(h))) return !!CO[mm[1]]; // 회사 여섯 쪽
  if (h === '#/jinhwa') return true; // 진화(위 막대 진화 단추와 같은 쪽 · 돌 판 첫 화면 「진화 n번째」 한 줄 — 2026-10-19 규칙 82)
  if (h === '#/why') return READY.has('why'); // 매매일지(왜 사? 열한 질문 — 가운데 단추)
  if ((mm = /^#\/why\/([0-9A-Z]{6})$/.exec(h))) return READY.has('why') && !!CO[mm[1]]; // 「이 회사로 왜 사?」(회사 화면 a.why-go · 보유종목 「이 회사로 왜 사? 적기」 — [3] 2)
  if ((mm = /^#\/gdr(?:\/(\d+))?$/.exec(h))) return READY.has('gdr') && (mm[1] == null || !!GDR?.picks?.some(x => String(x.no) === mm[1])); // 고도리 칸 · 카드 하나(번호는 gdr.json 에 있어야)
  if ((mm = /^#\/cal\/([0-9A-Z]{6})$/.exec(h))) return READY.has('cal'); // 종목 파일 — check_cal 이 자료와 맞대 봄
  if ((mm = /^#\/w\/([0-9A-Z]{6})\/(past|rivals|grow|range)$/.exec(h))) return READY.has(mm[2]) && !!CO[mm[1]];
  if ((mm = /^#\/x\/(.+)$/.exec(h))) return READY.has('x');
  let m = /^#\/(?:f\/(rise|surge|lead|pick|group|ind|us)|shorts(?:\/\d+)?|sub|me|find(?:\/.*)?)?$/.exec(h); if (m) return true;
  if ((m = /^\/atlas\/(#\/.*)$/.exec(h))) h = '/' + m[1]; // 아직 지금 아틀란스에서 여는 쪽(/atlas/#/…) — 아래 같은 잣대로
  if ((m = /^#\/w\/(.+)$/.exec(h))) return m[1] === 'KOSPI' || m[1] === 'KOSDAQ' || !!CO[m[1]];
  if ((m = /^#\/ch\/([ig])\/(.+)$/.exec(h))) { const v = decodeURIComponent(m[2]); return m[1] === 'i' ? ind.has(v) : grp.has(v); }
  if ((m = /^\/#\/g\/(.+)$/.exec(h))) return grp.has(decodeURIComponent(m[1]));
  if ((m = /^\/#\/i\/(.+)$/.exec(h))) return ind.has(decodeURIComponent(m[1]));
  if ((m = /^\/#\/c\/([0-9A-Z]{6})(\/(past|rivals|grow|range))?$/.exec(h))) return !!CO[m[1]];
  if ((m = /^\/#\/x\/([0-9A-Z]{6})$/.exec(h))) return true; // 밖 칸(펀드 · 우선주 …) — 지금 아틀란스
  return /^\/#\/(surge|cal|cond|talk|find|time|up|info|today)$/.test(h);
};
function checkScan(where, s, p) {
  if (s.sw > s.vw) fail('가로 넘침', where + ' ' + s.sw + '>' + s.vw + (s.wide?.length ? ' · ' + s.wide.join(' · ') : ''));
  for (const w of banned(s.text)) fail('쓰지 않을 말', where + ' 「' + w + '」'); // 「공매도」(빌려 판 주식 — 사실 말) · 「사라져」는 words.js 가 셈 밖으로
  for (const x of s.small) fail('누르는 자리 44px 안 됨', where + ' ' + x);
  for (const hr of s.hrefs) { bump('고리'); if (!knownHref(hr)) fail('모르는 고리', where + ' ' + hr); }
  if (p._errs.length) { fail('화면 오류', where + ' ' + p._errs.join(' | ').slice(0, 200)); p._errs.length = 0; }
}

/* ① 세 폭 */
const firstCo = codes[0], g0 = core.groups[0].id, i0 = core.industries[0].name, g0id = () => g0;
const ROUTES = ['#/', '#/f/rise', '#/f/surge', '#/f/lead', '#/f/pick', '#/f/group', '#/f/ind', '#/f/us', '#/shorts', '#/sub', '#/me', '#/find', '#/find/삼성', '#/w/KOSPI', '#/w/KOSDAQ', '#/w/' + firstCo, '#/ch/g/' + g0, '#/ch/i/' + encodeURIComponent(i0)];
const MODR = {surge: ['#/surge', '#/surge/10', '#/surge/20', '#/surge/30', '#/surge/40'], cal: ['#/cal'], cond: ['#/cond'], talk: ['#/talk'], up: ['#/up'], time: ['#/time'], info: ['#/info'], today: ['#/today'], x: ['#/x/005935'], past: ['#/w/005930/past', '#/w/' + firstCo + '/past'], rivals: ['#/w/005930/rivals'], grow: ['#/w/005930/grow', '#/w/' + firstCo + '/grow'], range: ['#/w/005930/range', '#/w/' + firstCo + '/range'],
  why: ['#/why', '#/why/005930', '#/why/' + firstCo], gdr: ['#/gdr', ...(GDR?.picks?.length ? ['#/gdr/' + GDR.picks[0].no] : [])]}; // 고도리 한 장 명령문 — 매매일지(종목을 고르고 연 길 포함) · 고도리 칸 · 카드 하나 열린 길
// 친구가 연 보내기(#/s/<번호>/<보낸 날>/<그날 값>/<s|a> — [4] 6 · 7 · 8 · p-share) · 깨진 주소
ROUTES.push('#/gift'); // 상품권 방(2026-10-22 03:38) — 세 폭 · 쓰지 않을 말 · 44px · 고리
ROUTES.push('#/s/005930/' + mkt.base + '/70000/s', '#/s/005930/' + mkt.base + '/70000/a', '#/s/ZZZZZZ/2026-13-40/0/s');
for (const [k, rs] of Object.entries(MODR)) if (READY.has(k)) ROUTES.push(...rs); // 옮긴 쪽도 세 폭 · 쓰지 않을 말 · 44px · 고리
for (const w of [320, 360, 390]) {
  const p = await page(w); if (await first(p, base + '/next/#/') === false) fail('여는 중 남음', w + ' 처음 열기');
  for (const r of ROUTES) { await go(p, r); await p.waitForTimeout(80); checkScan(w + ' ' + r, await scan(p), p); if (w === 390) await guard(p, r); bump('화면'); }
  if (w === 390) { // ⑧ 옛 이름 — 세 폭 길에 없는 쪽도(달력 종목 파일 · 조건 고른 주소 · 쇼츠 한 장 · 없는 주소)
    const tr = await getJ('surgetr.json').catch(() => null), c0 = tr?.cases?.[0]?.[0];
    for (const r of [...(READY.has('cal') && c0 ? ['#/cal/' + c0] : []), ...(READY.has('cond') ? ['#/cond/all-all-all'] : []), '#/shorts/1', '#/w/ZZZZZZ', '#/ch/i/' + encodeURIComponent('없는 업종')]) { await go(p, r); await p.waitForTimeout(80); await guard(p, r); }
  }
  await p.context().close();
}

/* ①-1 아주 큰 글씨(지금 아틀란스와 같은 세 칸 · 기억 atlas:font 2 · 화면 칸 zoom) — 320 폭에서 넘침 0 */
{
  const ctx = await b.newContext({viewport: {width: 320, height: 700}, deviceScaleFactor: 1, hasTouch: true});
  await ctx.addInitScript(() => { try { localStorage.setItem('atlas:font', '2'); } catch { /* 없음 */ } });
  const p = watch(await ctx.newPage(), base); p._errs = []; p.on('pageerror', e => p._errs.push(e.message));
  if (await first(p, base + '/next/#/') === false) fail('여는 중 남음', '큰 글씨 처음 열기');
  if (!(await p.evaluate(() => document.documentElement.classList.contains('f3')))) fail('큰 글씨 기억', 'atlas:font 2 인데 html.f3 아님');
  for (const r of ROUTES) { await go(p, r); await p.waitForTimeout(80); const sc = await scan(p); if (sc.sw > sc.vw) fail('큰 글씨 넘침', '320 아주 크게 ' + r + ' ' + sc.sw + '>' + sc.vw); bump('큰 글씨 화면'); }
  if (p._errs.length) fail('화면 오류', '큰 글씨 ' + p._errs.join(' | ').slice(0, 200));
  await ctx.close();
}
/* ①-2 첫 화면 붙박이 · 「나」 칸 편지(지금 화면 site/next/app.js 의 HELLO_MSG · HELLO_PROMO 와 글자 그대로 — 2026-10-17 15:54 「예전 아트란스는 … 현재 것만」: 옛 atlas.js 는 더 이상 기준이 아님) · 옛 주소
   2026-10-17 17:54 「고도리 만들기 · 한 장 명령문」 명령 1 · 2 — 편지는 「나」 칸으로 · 첫 화면 앞쪽 = 질문 칸(section.wy) → 고도리 칸(section.gdr)
   열면 고도리 = 편지를 처음 그릴 때 한 번(app.js m4letter · 이제 「나」 칸을 처음 열 때) — 첫 화면을 먼저 열어도 그대로 남아 있어야 함 */
{
  const src = await fs.readFile(path.join(ROOT, 'site/next/app.js'), 'utf8');
  const MSG = JSON.parse((/const HELLO_MSG = (\[[^\]]*\]);/.exec(src) || [, 'null'])[1].replace(/'/g, '"')), PROMO = (/const HELLO_PROMO = '([^']*)';/.exec(src) || [])[1];
  if (!Array.isArray(MSG) || MSG.length < 2 || !PROMO) fail('편지 글을 site/next/app.js 에서 못 읽음', '');
  if (MSG?.[0] !== LETTER_TITLE) fail('편지 첫 줄', `「${MSG?.[0]}」 ≠ 「${LETTER_TITLE}」`);
  for (const t of [...(MSG || []), PROMO]) if (OLD_NAME_RE.test(t ?? '')) fail(OLD_NAME_FAIL, '편지 · 상품권 줄 「' + t + '」');
  const q = await page(390, 844), qReq = []; q.on('request', r => qReq.push(r.url()));
  if (await first(q, base + '/next/#/', () => !!document.querySelector('#view [data-w="find"]') && !document.querySelector('#view .boot')) === false) fail('첫 화면 찾기 칸', '20초 안에 안 나옴');
  /* 첫 화면 한 화면(2026-10-18 명령문 0015 [6] 1 ~ 5 · 9 · [9] 7 · 일꾼 S2x) — 고르기 칩 → 이야기 입구 → 한 줄 띠(#/today · 날짜 한 번 · 코스피 · 코스닥 하루 · 큰 날 「!」 띠 안) → 질문 칸 → 고도리 칸 → 「더 보기」(닫힘) → 안전 한 줄
     닫은 채 보이는 날짜 하나(띠) · 「오늘 한 줄」 · 오늘 시장 칸(.today-d · .ptoday) · 급등 카드 0 · 「더 보기」 안 = 세 줄(큰 숫자 하나 + 까닭 한 줄) + #/today 고리 · 띠 숫자를 되풀이하지 않음 · mkt · cond 를 받지 않음(요약이 새것일 때) */
  const SUMJ = await fetchJSON(base + '/next/data/home-summary.json', 'home-summary.json').catch(() => null), sumFresh = !!(SUMJ?.schema === 'godori-home-summary-1' && home && SUMJ.src?.home === home.kst);
  /* 흰 첫 화면(사장님 2026-10-19 02:03 「골똘이 대공사 · 구글과 잡스 판」 · 고른 시안 w3-b · 일꾼 C 다시 겨눔 — 옛 2026-10-18 [6] 세 덩이 잣대를 새 차례로 옮김 · 지키던 것은 하나도 빼지 않음)
     본질 카드([data-w=ess] · section.ess) → (한 달 된 기록이 있을 때만 금빛 a.w-month) → 앵무새 물음(div.w-say) → 「친구야, 왜 사?」 찾기 칸(form.w-find) → 오늘 장 한 줄(a.hm-band → #/today)
     → 바로 가기 넷(nav.w-go4 · 골똘이 칸은 열한 질문 뒤에만 #/gdr · 그 전 #/why) → 「전부 보기」(details.w-all · 처음 닫힘 · 한 줄에 하나 · 안에 옛 「더 보기」 세 줄 · 봉인 · 약속) → 시황 사실(section.w-news) → 안전 한 줄
     옛 잣대 → 새 자리: 칩 줄 「달력」 「조건 찾기」 → 바로 가기 · 이야기 입구 → 전부 보기 줄 · 질문 칸(section.wy) → 찾기 칸(회사를 치면 #/why/<번호>) · 칸 자리(section.gdr) → 바로 가기 + #/gdr · 칩 줄 끝 흐림(마스크) → 칩 줄이 없어 뺌 */
  /* 돌 판 첫 화면(사장님 2026-10-19 10:31 「이제 실제로 만들어 이기준으로」 · 시안 platform3/home · 규칙 82) — 큰 제목 + 돌 그림 → 돌이 물음 → 읽는 곳 셋(① 본질 카드 ② 오늘 장 한 줄 + 시황 사실 ③ 한 달 된 기록 금빛 줄 또는 「한 달 뒤 물어볼게요」)
     → 엄지 자리(찾기 칸 · 바로 가기 넷 · 전부 보기) → 진화 한 줄 · 차례는 #view 안 칸을 문서 차례로 셈(칸이 읽는 곳 · 엄지 자리 안에 듦) · 안전 글은 본질 세 줄 안 */
  const HOME_ORDER = ['div.s-hd', 'div.w-say', 'section.th-home', 'section.ess', 'a.hm-band', 'section.w-news', 'a.w-month', 'a.s-ghost', 'form.w-find', 'nav.w-go4', 'details.w-all', 'a.s-evo'];
  const ALL_WANT = ['#/f/rise', oldOr('surge', '#/surge'), '#/f/group', '#/f/ind', '#/f/us', '#/f/pick', oldOr('talk', '#/talk'), '#/game']; // 「전부 보기」 줄(app.js ALL_ROWS 와 따로 적음 — 사장님 [화면] 7 · brief-build 7)
  const g = await q.evaluate(ord => {
    const kids = [...document.querySelectorAll('#view *')].filter(e => ord.some(s => e.matches(s)) && !e.closest('.w-allin')), gd = document.querySelector('#view section.gdr');
    const band = document.querySelector('#view a.hm-band.w-today'), more = document.querySelector('#view details.w-all'), go4 = document.querySelector('#view nav.w-go4'), fi = document.querySelector('#view form.w-find input');
    return {order: kids.map(e => ord.find(s => e.matches(s)) ?? e.tagName.toLowerCase() + '.' + e.className), blocks: [...document.querySelectorAll('#view [data-w]')].map(e => e.getAttribute('data-w')),
      today: document.querySelectorAll('#view .today, #view .today-d, #view .ptoday, #view .ptoday-home').length, surgeCards: [...document.querySelectorAll('#view a.card')].filter(a => /급등/.test(a.textContent)).length,
      al: [...document.querySelectorAll('#view .m4-al')].map(e => ({t: e.textContent, inBand: !!e.closest('a.hm-band')})), top: document.querySelectorAll('#view .m4-top').length,
      band: band ? {href: band.getAttribute('href'), t: band.innerText.replace(/ /g, ' ')} : null, moreOpen: !!more?.open,
      dates: (() => { const sp = t => t.replace(/\u00a0/g, ' '), all = sp(document.querySelector('#view')?.innerText ?? '').match(/\d{1,2}월 \d{1,2}일/g) || [], es = sp(document.querySelector('#view section.ess')?.innerText ?? '').match(/\d{1,2}월 \d{1,2}일/g) || []; for (const d of es) { const j = all.indexOf(d); if (j >= 0) all.splice(j, 1); } return all; })(), // 돌 판 — 본질 칸이 읽는 곳 안에 들어 #view 글에서 본질 칸 날짜만 뺌(닫힌 「전부 보기」 안 글은 innerText 에 없음)
      ess: (() => { const s = document.querySelector('#view section.ess'), d = s?.querySelector('details'); return s ? {open: !!d?.open, lines: [...s.querySelectorAll('[data-ess]')].map(e => e.textContent), shown: [...s.querySelectorAll('[data-ess]')].map(e => e.checkVisibility()),
        dates: (d?.innerText ?? s.innerText).match(/\d{1,2}월\s\d{1,2}일/g) || [], v: s.querySelector('a.ess-v')?.textContent ?? null} : null; })(), // 본질 세 줄(2026-10-18 16:39 [5] · 일꾼 KC)
      go4: go4 ? [...go4.querySelectorAll('a')].map(a => a.getAttribute('href')) : [], letter: document.querySelectorAll('#view .m4-letter, #view .hpi').length,
      findTop: fi ? Math.round(fi.getBoundingClientRect().top + scrollY) : null, findPh: fi?.getAttribute('placeholder') ?? null, vh: innerHeight, wy: document.querySelectorAll('#view section.wy').length,
      gdrBox: !!gd, gdrLinks: [...document.querySelectorAll('#view a[href]')].map(a => a.getAttribute('href')).filter(x => /^#\/gdr(\/|$)/.test(x ?? '')),
      tk: document.querySelectorAll('#view > a.tk-entry, #view > .chips').length};
  }, HOME_ORDER);
  const ordWant = HOME_ORDER.filter(s => !['a.w-month', 'a.s-ghost'].includes(s) || g.order.includes(s)); // 한 달 된 기록 줄이나 「한 달 뒤」 줄 가운데 하나
  if (g.order.join(' → ') !== ordWant.join(' → ')) fail('첫 화면 차례(돌 판 — 큰 제목 → 돌이 물음 → 테마 시계 → 본질 카드 → 오늘 장 → 시황 사실 → 한 달 뒤 → 찾기 칸 → 바로 가기 넷 → 전부 보기 → 진화)', g.order.join(' → '));
  for (const k of ['ess', 'find', 'today', 'gdr', 'all', 'news']) if (!g.blocks.includes(k)) fail('첫 화면 칸 [data-w="' + k + '"]', g.blocks.join(' · '));
  if (g.tk) fail('첫 화면에 칩 줄 · 이야기 입구 띠가 남음(흰 첫 화면 — 전부 보기 안으로)', String(g.tk));
  /* 본질 세 줄(사장님 2026-10-18 16:39 [5] 1 ~ 3 · 5 · 8 · 일꾼 KC) — 처음 온 기기(새 칸 q)는 펼침 · 글 = essence.js 셈(요약이 새것일 때만 숫자 · 아니면 「?」) · 칸 안 날짜는 받은 때 하나까지(띠 날짜와 따로 셈)
     · 「… 1분 보기 ›」는 VIDEO.ready 일 때만 · 다시 온 기기(atlas:essence-seen)는 한 줄로 접힘 */
  { const want = essenceLines(essenceData({summary: sumFresh ? SUMJ : null, now: Date.now()}));
    if (!g.ess) fail('본질 세 줄 칸 없음([5] 1)', '#view section.ess');
    else {
      if (!g.ess.open || g.ess.shown.some(x => !x)) fail('본질 세 줄 — 처음 온 기기는 펼침([5] 1)', JSON.stringify({open: g.ess.open, shown: g.ess.shown}));
      if (g.ess.lines.join('\n') !== want.join('\n')) fail('본질 세 줄 글 ≠ essence.js 셈([5] 2 · 3)', JSON.stringify({got: g.ess.lines, want}));
      if (g.ess.dates.length > 1) fail('본질 세 줄 칸 날짜는 받은 때 하나([5] 8)', JSON.stringify(g.ess.dates));
      if (g.ess.v) fail('흰 첫 화면 — 「' + VIDEO.title + ' 보기」는 본질 카드 밖(전부 보기 한 줄)으로', String(g.ess.v)); // 새 영상 여부는 아래 「전부 보기」 줄에서 맞댐([5] 5)
    }
    const z = await page(390, 844); await z.context().addInitScript(() => { try { localStorage.setItem('atlas:essence-seen', 'true'); } catch { /* 기억 못 함 */ } });
    if (await first(z, base + '/next/#/', () => !!document.querySelector('#view section.ess') && !document.querySelector('#view .boot')) === false) fail('본질 세 줄 — 다시 온 기기', '20초 안에 안 나옴');
    else { const r = await z.evaluate(() => { const s = document.querySelector('#view section.ess'), d = s?.querySelector('details'); return {open: !!d?.open, shown: [...(s?.querySelectorAll('[data-ess]') || [])].map(e => e.checkVisibility()), h: Math.round(s?.getBoundingClientRect().height ?? 0)}; });
      if (r.open || r.shown.join() !== 'true,false,false') fail('본질 세 줄 — 다시 온 기기는 한 줄로 접힘([5] 1)', JSON.stringify(r)); }
    await z.context().close(); }
  if (g.today) fail('첫 화면에 오늘 시장 칸이 남음([6] 4 → #/today)', String(g.today));
  if (g.surgeCards) fail('첫 화면에 급등 카드([6] 5)', String(g.surgeCards));
  const hix = [['KOSPI', '코스피'], ['KOSDAQ', '코스닥']].filter(([k]) => home?.idx?.[k]);
  if (!g.band || g.band.href !== '#/today') fail('한 줄 띠([6] 1 — #/today)', JSON.stringify(g.band));
  else for (const [k, nm] of hix) if (!g.band.t.includes(nm) || !g.band.t.includes(P2(home.idx[k].day))) fail('한 줄 띠 숫자([6] 1)', `${nm} ${P2(home.idx[k].day)} 없음 「${g.band.t.replace(/\n/g, ' ')}」`);
  const bandDay = home?.stale?.idx && /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}/.test(home.stale.idx) ? home.stale.idx.slice(0, 10) : (home?.idx?.KOSPI ?? home?.idx?.KOSDAQ)?.date;
  if (g.band && bandDay && !g.band.t.includes(MD(bandDay))) fail('한 줄 띠 날짜', MD(bandDay) + ' 없음');
  if (g.dates.length !== 1) fail('보이는 날짜는 띠에 한 번([6] 2)', JSON.stringify(g.dates));
  if (g.moreOpen) fail('「전부 보기」는 처음 닫힘([화면] 7 — 오르는 것은 한 번 더 눌러야)', '');
  const wantAl = ['big', 'usual'].filter(w => (home?.alerts ?? []).some(a => a.kind === 'idx' && (a.why ?? 'usual') === w)).length;
  // 흰 첫 화면은 큰 날 줄을 하나로 줄여 「! 크게 움직인 날」(읽어 주기 · 자세한 글은 #/today) — 있으면 한 줄 · 없으면 0
  if (g.al.length !== Math.min(wantAl, 1) || g.al.some(a => !a.inBand || !a.t.startsWith('!')) || g.top) fail('큰 날 「!」 = 띠 안([6] 1)', JSON.stringify({n: g.al.length, want: wantAl, out: g.al.filter(a => !a.inBand).length, top: g.top}));
  // 바로 가기 넷(옛 칩 「달력」 「조건 찾기」 자리 · [6] 7) — 골똘이 칸(질문 전 #/why) · 달력 · 조건 찾기 · 대장주
  if (JSON.stringify(g.go4) !== JSON.stringify(['#/why', oldOr('cal', '#/cal'), oldOr('cond', '#/cond'), '#/f/lead'])) fail('바로 가기 넷(질문 전 = #/why · 달력 · 조건 찾기 · 대장주)', g.go4.join(' '));
  // 「전부 보기」 열기 — 한 줄에 하나(오르는 업종 · 급등 · … · 이야기) + 옛 「더 보기」 그대로: 세 줄 · 큰 숫자 하나 + 까닭 한 줄 · #/today 고리 · 띠 숫자 되풀이 없음 · 봉인 줄 · 약속 · 자료 요청(mkt · cond 0 — 요약이 새것일 때)
  await q.click('#view summary[data-w="all"]').catch(e => fail('「전부 보기」 누름', e.message));
  await q.waitForFunction(() => !!document.querySelector('#view .w-allin .m4-seal-box, #view .w-allin .empty'), null, {timeout: 15000}).catch(() => fail('「전부 보기」 안', '15초 안에 안 그려짐'));
  const hmo = await q.evaluate(() => { const r = document.querySelector('#view details.w-all'); if (!r) return null; const W0 = r.getBoundingClientRect().width;
    return {li: [...r.querySelectorAll('.hm-sum > li')].map(x => ({k: x.dataset.k, big: x.querySelectorAll('.hm-big').length, why: x.querySelectorAll('.hm-why').length, tag: x.querySelector('.hm-tag')?.textContent ?? ''})),
      rows: [...r.querySelectorAll('ul.w-rows > li > a')].map(a => ({href: a.getAttribute('href'), w: a.getBoundingClientRect().width, h: a.getBoundingClientRect().height})), W0,
      today: !!r.querySelector('a[href="#/today"]'), t: r.innerText.replace(/ /g, ' '), mr: r.querySelector('a.m4-mr')?.getAttribute('href') ?? null, seal: !!r.querySelector('.m4-seal-box'), cards: r.querySelectorAll('a.card').length}; });
  if (!hmo) fail('「전부 보기」 칸 없음', 'details.w-all');
  else {
    const rh = hmo.rows.map(x => x.href).filter(x => !/^\/hello\.html/.test(x));
    const vid = hmo.rows.filter(x => /^\/hello\.html/.test(x.href));
    if (vid.length !== (VIDEO.ready ? 1 : 0) || (vid[0] && vid[0].href !== '/hello.html#hp-vid')) fail('「' + VIDEO.title + ' 보기」 줄은 새 영상이 오른 뒤에만([5] 5 · 흰 첫 화면 = 전부 보기 안)', JSON.stringify(vid));
    if (VIDEO.ready && !hmo.t.includes(VIDEO.title + ' 보기')) fail('「' + VIDEO.title + ' 보기」 글', '전부 보기 안에 없음');
    if (JSON.stringify(rh) !== JSON.stringify(ALL_WANT)) fail('「전부 보기」 줄(오르는 업종 · 급등 · 큰 업종 · 업종 · 미국 · 고른 곳 · 오늘의 이야기)', rh.join(' '));
    if (hmo.rows.some(x => x.w < 0.85 * hmo.W0 || x.h < 43.5)) fail('「전부 보기」 한 줄에 하나(네모 칸 0 · 44px)', JSON.stringify(hmo.rows.map(x => [Math.round(x.w), Math.round(x.h)])));
    if (hmo.li.length !== 3 || hmo.li.some(x => x.big !== 1 || x.why !== 1)) fail('오늘 시장 세 줄 = 큰 숫자 하나 + 까닭 한 줄([6] 4 · 9)', JSON.stringify(hmo.li));
    if (!hmo.today) fail('「전부 보기」 안 #/today 고리([6] 4)', '');
    for (const [k, nm] of hix) if (hmo.t.includes(P2(home.idx[k].day))) fail('띠 숫자가 「전부 보기」에 또 나옴([6] 3)', nm + ' ' + P2(home.idx[k].day));
    if (home?.us?.date && bandDay && home.us.date !== bandDay && !hmo.li.find(x => x.k === 'us')?.tag) fail('띠 날과 다른 날 꼬리표([6] 2)', '미국 ' + home.us.date + ' ≠ ' + bandDay);
    if (hmo.cards) fail('「전부 보기」 안 큰 카드(한 줄 목록으로)', String(hmo.cards));
    if (core.time?.opens?.[0]?.date && hmo.mr !== oldOr('time', '#/time')) fail('봉인 줄', String(hmo.mr));
    if (!hmo.seal) fail(NEW_NAME + ' 약속', '');
  }
  const heavy = qReq.filter(u => /\/atlas\/data\/(mkt|cond)\.json/.test(u) || /\/atlas\/data\/co\//.test(u));
  if (sumFresh && heavy.length) fail('첫 화면이 mkt · cond 를 받음([9] 7)', heavy.map(u => u.replace(base, '')).join(' '));
  if (!SUMJ) fail('첫 화면 요약 파일 없음([9] 7)', '/next/data/home-summary.json');
  else { const n = Buffer.byteLength(JSON.stringify(SUMJ)); if (n > 8192) fail('첫 화면 요약 8KB 넘음([9] 7)', String(n)); }
  // 요약을 못 받으면 옛 길(home.json) — 빈 첫 화면 없음 · 세 줄 그대로
  { const z = await page(390, 844); await z.route('**/next/data/home-summary.json', r => r.fulfill({status: 404, body: ''}));
    if (await first(z, base + '/next/?nosum=1#/', () => !!document.querySelector('#view a.hm-band') && !document.querySelector('#view .boot')) === false) fail('요약 없이 첫 화면([9] 7)', '20초 안에 안 나옴');
    await z.click('#view summary[data-w="all"]').catch(() => {}); await z.waitForFunction(() => !!document.querySelector('#view .w-allin .m4-seal-box, #view .w-allin .empty'), null, {timeout: 15000}).catch(() => {});
    const zz = await z.evaluate(() => ({li: document.querySelectorAll('#view .hm-sum > li').length, band: !!document.querySelector('#view a.hm-band b')}));
    if (zz.li !== 3 || !zz.band) fail('요약 없이 첫 화면([9] 7 — 옛 길)', JSON.stringify(zz)); z._errs.length = 0; await z.context().close(); }
  // 아주 큰 글씨(atlas:font 2 · html.f3) 320 폭 · 「전부 보기」 연 꼴 — 세 줄 묶음 글이 칸 · 화면 밖으로 안 나감(2026-10-18 깃허브 영어 검사 39095363687 · 영어는 next_en_check)
  { const ctx = await b.newContext({viewport: {width: 320, height: 700}, deviceScaleFactor: 1, hasTouch: true}); await ctx.addInitScript(() => { try { localStorage.setItem('atlas:font', '2'); } catch { /* 없음 */ } });
    const z = watch(await ctx.newPage(), base); z._errs = [];
    if (await first(z, base + '/next/?big=1#/', () => !!document.querySelector('#view summary[data-w="all"]') && !document.querySelector('#view .boot')) === false) fail('아주 큰 글씨 첫 화면', '20초 안에 안 나옴');
    await z.click('#view summary[data-w="all"]').catch(() => {}); await z.waitForFunction(() => !!document.querySelector('#view .w-allin .m4-seal-box, #view .w-allin .empty'), null, {timeout: 15000}).catch(() => {});
    const zb = await z.evaluate(() => ({sw: document.documentElement.scrollWidth, vw: document.documentElement.clientWidth, box: [...document.querySelectorAll('#view .hm-it, #view .hm-it *, #view .w-rows a, #view .w-rows a *')].filter(e => e.clientWidth > 0 && e.scrollWidth > e.clientWidth + 1 && getComputedStyle(e).overflowX === 'visible').map(e => e.className + ' ' + e.scrollWidth + '>' + e.clientWidth)}));
    if (zb.sw > zb.vw || zb.box.length) fail('아주 큰 글씨 320 「전부 보기」 넘침', JSON.stringify(zb).slice(0, 300)); await ctx.close(); }
  bump('첫 화면 한 화면');
  // ⑨ 첫 화면 앞쪽 — 찾기 칸이 첫 화면(390×844) 안 · 편지 없음 · 회사를 치면 열한 질문(#/why/<번호>)
  if (g.letter) fail('첫 화면에 편지가 남음(명령 1 — 「나」 칸으로)', String(g.letter));
  if (g.findTop == null || g.findTop >= g.vh) fail('찾기 칸이 첫 화면 밖', `${g.findTop} ≥ ${g.vh}`);
  if (g.findPh !== '친구야, 왜 사? 회사 이름') fail('찾기 칸 자리 글 「친구야, 왜 사? 회사 이름」', String(g.findPh));
  if (g.wy) fail('첫 화면에 큰 질문 칸(section.wy)이 남음(흰 첫 화면 — 찾기 칸 하나)', String(g.wy));
  { await q.fill('#view form.w-find input', '삼성전자').catch(e => fail('찾기 칸 치기', e.message));
    const hit = await q.waitForFunction(() => document.querySelector('#view form.w-find a[data-path~="q1"]')?.getAttribute('href') ?? false, null, {timeout: 15000}).then(x => x.jsonValue()).catch(() => null);
    if (hit !== '#/why/005930') fail('찾기 칸 「삼성전자」 → 첫 줄 #/why/005930(열한 질문 1번)', String(hit));
    await q.fill('#view form.w-find input', '').catch(() => {}); }
  // [6] 1 · 본질 문 ④ — 열한 질문을 한 번 끝내기 전(새 기계)에는 골똘이 칸이 잠김: 첫 화면 바로 가기 = #/why · #/gdr 고리 · 큰 칸 0 → #/gdr 은 잠금(#/why 로 가는 고리 · 칸 없음)
  if (READY.has('gdr') && (g.gdrBox || g.gdrLinks.length || g.go4[0] !== '#/why')) fail(NEW_NAME + ' 칸 잠김(질문 전 — 첫 화면 바로 가기 #/why · 큰 칸 · #/gdr 고리 0)', JSON.stringify({box: g.gdrBox, links: g.gdrLinks, go: g.go4[0]}));
  const gdrRead = pg => pg.evaluate(() => { const gd = document.querySelector('#view section.gdr'); return {lock: !!(gd?.classList.contains('lock') || gd?.classList.contains('lock1')), one: !!gd?.classList.contains('today1'), rest: !!gd?.classList.contains('rest1'), cells: gd?.querySelectorAll('.gdr-cell').length ?? -1, sum: gd?.querySelector('.gdr-sum')?.textContent ?? '', links: [...(gd?.querySelectorAll('a[href]') ?? [])].map(a => a.getAttribute('href')), text: (gd?.innerText ?? '').replace(/\s+/g, ' ').trim(), h: gd?.getBoundingClientRect().height ?? 0, today: gd?.querySelector('a.gdr-today')?.getAttribute('href') ?? null}; });
  if (READY.has('gdr')) {
    await q.evaluate(() => { location.hash = '#/gdr'; }); await q.waitForFunction(() => !!document.querySelector('#view section.gdr'), null, {timeout: 8000}).catch(() => {}); await q.waitForTimeout(300);
    const g1 = await gdrRead(q); if (!g1.lock || g1.cells !== 0 || !g1.links.includes('#/why')) fail(NEW_NAME + ' 칸 잠김(질문 전 #/gdr — #/why 고리 · 칸 0)', JSON.stringify(g1));
  }
  // 질문을 끝낸 기록 하나(답 열한 개 · 매매일지 기록 꼴)를 이 기기에 두고 다시 열면 — 첫 화면 바로 가기 = #/gdr · 그것을 누르면 열린 칸(칸 수 = 고른 곳 + 쉬는 돈 · 비중 합 100%)
  await q.evaluate(([k, r]) => localStorage.setItem(k, JSON.stringify([r])), [WHY_KEY, whyRec(0)]);
  if (await first(q, base + '/next/?seed=1#/', () => !!document.querySelector('#view nav.w-go4') && !document.querySelector('#view .boot')) === false) fail(NEW_NAME + ' 바로 가기(질문 뒤)', '20초 안에 안 나옴'); // 다른 주소로 새로 엶(같은 주소 goto 는 # 만 같아 새로 열리지 않음)
  const openBox = r => Array.isArray(GDR?.picks) ? !(r.lock || r.one || r.rest) && r.cells === GDR.picks.length + 1 && r.sum.startsWith('비중 합 100%') : true;
  const go2 = await q.evaluate(() => document.querySelector('#view nav.w-go4 a')?.getAttribute('href') ?? null);
  if (READY.has('gdr') && go2 !== '#/gdr') fail(NEW_NAME + ' 바로 가기(질문 뒤 = #/gdr)', String(go2));
  if (READY.has('gdr')) {
    await q.click('#view nav.w-go4 a[href="#/gdr"]').catch(() => q.evaluate(() => { location.hash = '#/gdr'; }));
    await q.waitForFunction(() => location.hash === '#/gdr' && !!document.querySelector('#view section.gdr.page'), null, {timeout: 8000}).catch(() => {}); await q.waitForTimeout(300);
    const g3 = await gdrRead(q);
    if (!openBox(g3)) fail(NEW_NAME + ' 칸(질문 뒤 바로 가기 → #/gdr · 칸 수 = 고른 곳 + 쉬는 돈 · 비중 합 100%)', `${g3.lock ? '잠김 · ' : ''}${g3.rest ? '쉬어 가는 날 · ' : ''}${g3.cells} · 「${g3.sum}」`);
  }
  await q.evaluate(() => { location.hash = '#/'; }); await q.waitForTimeout(300);
  // 오늘 판정이 든 기록마다 새 기계 — 첫 화면 바로 가기 = #/gdr · #/gdr 칸: 오늘 끝냄 = 열린 칸 맨 위 「오늘 점수」 줄(→ #/why) · 쉬어 가는 날 = 닫는 한 줄 · 어제만 = 열린 칸(옛: 첫 화면 칸 자리 한 줄 — 흰 첫 화면에는 칸 자리가 없음)
  for (const [nm, rec, want] of [['오늘 끝냄', whyRec(0, '005930', '좋아, 정해 둔 대로만'), 'one'], ['오늘 쉬어 가자', whyRec(0, '005930', '오늘은 쉬어 가자'), 'rest'], ['어제만 끝냄', whyRec(1, '005930', '반만 준비됐어'), 'open']]) {
    const ctx = await b.newContext({viewport: {width: 390, height: 844}, deviceScaleFactor: 1, hasTouch: true});
    await ctx.addInitScript(([k, r]) => { try { localStorage.setItem(k, JSON.stringify([r])); } catch { /* 기억 못 함 */ } }, [WHY_KEY, rec]);
    const z = watch(await ctx.newPage(), base); z._errs = [];
    z.on('pageerror', e => z._errs.push(e.message)); z.on('console', m => { if (m.type() === 'error') z._errs.push(m.text()); });
    if (await first(z, base + '/next/#/', () => !!document.querySelector('#view nav.w-go4') && !document.querySelector('#view .boot')) === false) fail(NEW_NAME + ' 바로 가기(질문 뒤 · ' + nm + ')', '20초 안에 안 나옴');
    const zg = await z.evaluate(() => ({go: document.querySelector('#view nav.w-go4 a')?.getAttribute('href') ?? null, box: !!document.querySelector('#view section.gdr')}));
    if (READY.has('gdr') && (zg.go !== '#/gdr' || zg.box)) fail(NEW_NAME + ' 바로 가기(질문 뒤 · ' + nm + ' — #/gdr · 첫 화면 큰 칸 0)', JSON.stringify(zg));
    if (READY.has('gdr')) {
      for (const hh of ['#/gdr', '#/me']) { await z.evaluate(x => { location.hash = x; }, hh); await z.waitForTimeout(700); } // 보유종목까지 한 번 더 돌며 콘솔 오류(404 포함) 0
      await z.evaluate(() => { location.hash = '#/gdr'; }); await z.waitForFunction(() => !!document.querySelector('#view section.gdr.page'), null, {timeout: 8000}).catch(() => {}); await z.waitForTimeout(300);
      const r = await gdrRead(z);
      const ok = want === 'one' ? openBox({...r, one: false}) && r.today === '#/why' : want === 'rest' ? r.rest && r.cells === 0 && !r.lock : openBox(r);
      if (!ok) fail(NEW_NAME + ' 칸(질문 뒤 · ' + nm + ' — #/gdr: ' + (want === 'one' ? '열린 칸 + 오늘 점수 줄 → #/why' : want === 'rest' ? '닫는 줄' : '열린 칸') + ')', JSON.stringify(r));
    }
    if (z._errs.length) fail('화면 오류', '질문 뒤 ' + nm + ' ' + z._errs.join(' | ').slice(0, 200));
    await ctx.close(); bump('첫 화면 칸 자리 길');
  }
  bump('첫 화면 앞쪽');
  // 보유종목(옛 「나」 칸 · #/me) — 맨 위 보유종목 점검(section.hd) → 편지(처음 그림 = 열면 고도리 · 글자 그대로 · 친구 소개 · 상품권) → 바로 가기 · 왜 사? 기록은 매매일지 아래로([3] 7)
  await q.evaluate(() => { location.hash = '#/me'; });
  await q.waitForSelector('#view .m4-letter', {timeout: 20000}).catch(() => fail('「나」 칸 편지', '20초 안에 안 나옴'));
  const g0 = await q.evaluate(() => ({intro: document.querySelector('#view .m4-letter')?.classList.contains('intro'), bub: [...document.querySelectorAll('#view .hpi-b')].map(b => b.textContent)}));
  if (!g0.intro || g0.bub.join(',') !== Array(3).fill(NEW_NAME + '!').join(',')) fail('열면 ' + NEW_NAME + '(「나」 칸 처음)', JSON.stringify(g0));
  await q.waitForFunction(() => document.querySelector('#view .m4-letter')?.classList.contains('landed'), null, {timeout: 9000}).catch(() => fail(NEW_NAME + ' 내려앉음', '9초 안에 안 끝남'));
  const m = await q.evaluate(() => {
    const kids = [...document.querySelectorAll('#view > *')], iL = kids.findIndex(e => e.querySelector?.('.m4-letter') || e.matches('.m4-letter')), iH = kids.findIndex(e => e.matches('section.hd'));
    return {lines: [...document.querySelectorAll('#view .m4-msg .hml')].map(e => e.textContent), promo: document.querySelector('#view .m4-gift')?.textContent ?? '', act: document.querySelector('#view .m4-aw')?.textContent ?? '',
      href: document.querySelector('#view a.m4-letter')?.getAttribute('href'), iL, iH, rec: document.querySelectorAll('#view section.wy-me').length, links: [...document.querySelectorAll('#view .lst a')].map(a => a.getAttribute('href')),
      fold: (() => { const w = document.querySelector('#view .hd-fold'), b = w?.querySelector('.hd-fold-b'); return w ? {open: w.getAttribute('data-open'), h: w.getBoundingClientRect().height, third: innerHeight / 3, btn: b?.getBoundingClientRect().height ?? 0, label: b?.textContent.trim() ?? '', wrapsLetter: !!w.querySelector('a.m4-letter')} : null; })()};
  });
  if (JSON.stringify(m.lines) !== JSON.stringify(MSG)) fail('사장님 편지 글자(「나」 칸)', JSON.stringify(m.lines).slice(0, 200));
  if (m.promo !== PROMO) fail('상품권 줄', m.promo + ' ≠ ' + PROMO);
  // 편지 띠 글 = brand.js VIDEO.ready 에 따라 둘 중 하나(app.js m4-aw · 명령문 [3] 9 「새 영상이 늦어지면 옛 영상 단추를 잠시 숨겨라」 · 일꾼 KI) — 새 영상 전 「(이름) 소개 · 보내기」 · 뒤 「(이름)의 고민 1분 영상 · 보내기」
  const ACT = '친구에게 소개하기' + (VIDEO.ready ? VIDEO.title + ' 영상 · 보내기' : NEW_NAME + ' 소개 · 보내기');
  if (m.act !== ACT) fail('친구 소개 줄', m.act + ' ≠ ' + ACT);
  if (m.href !== '/hello.html') fail('편지 고리', String(m.href));
  if (!(m.iH >= 0 && m.iL > m.iH)) fail('보유종목 차례(점검 → 편지)', JSON.stringify({iH: m.iH, iL: m.iL}));
  if (m.rec) fail('보유종목에 왜 사? 기록이 남음([3] 7 — 매매일지 화면 아래로)', String(m.rec));
  // 바로 가기 = 내 것만(2026-10-18 [7] 9 — 편지 여는 밤 · 기록 파일로 받기 · 가입한 사람만 탈퇴) → 고리는 편지 여는 밤 하나뿐(고도리 칸 · 오늘 시장 · 급등 · 달력 … 고리는 첫 화면 칩 · 도움말로 옮겨짐 — 자세한 맞댐은 check_hold ⑬)
  if (JSON.stringify(m.links) !== JSON.stringify(['/letter.html'])) fail('보유종목 바로 가기 = 편지 여는 밤 하나뿐([7] 9 · [2] 9)', JSON.stringify(m.links));
  if (!m.fold || !m.fold.wrapsLetter || m.fold.open !== 'false' || m.fold.h > m.fold.third + 1 || m.fold.btn < 44 || m.fold.label !== '펼치기') fail('보유종목 편지 접기([7] 8 — 첫 화면 ⅓ 안 · 「펼치기」 44px)', JSON.stringify(m.fold));
  if (m.links.includes('#/why')) fail('보유종목 바로 가기에 「왜 사? 열한 질문」이 남음([3] 8 — 가운데 단추와 겹침)', '#/why');
  // 열면 고도리는 한 번만 — 첫 화면에 갔다가 「나」 칸에 다시 와도 바로 글
  await q.evaluate(() => { location.hash = '#/'; }); await q.waitForFunction(() => !!document.querySelector('#view [data-w="find"]') && !document.querySelector('#view .boot'), null, {timeout: 20000}).catch(() => {});
  await q.evaluate(() => { location.hash = '#/me'; }); await q.waitForSelector('#view .m4-letter', {timeout: 20000}).catch(() => {});
  if (await q.evaluate(() => document.querySelector('#view .m4-letter')?.classList.contains('intro') !== false)) fail('열면 ' + NEW_NAME + ' 두 번 나옴', '「나」 칸을 다시 열어도 처음 그림');
  bump('「나」 칸 편지');
  // 옛 주소 — 새 화면으로 · 아직 안 옮긴 쪽은 /atlas/
  for (const [from, want] of [['#/c/005930', '#/w/005930'], ['#/g/' + g0id(), '#/ch/g/' + g0id()], ['#/list', '#/f/ind'], ['#/36', '#/']]) {
    await q.evaluate(hh => { location.hash = hh; }, from); await q.waitForTimeout(250);
    const got = await q.evaluate(() => location.hash); if (got !== want) fail('옛 주소', from + ' → ' + got + ' ≠ ' + want);
  }
  if (READY.has('surge')) { await q.evaluate(() => { location.hash = '#/surge'; }); await q.waitForTimeout(400); if (!/\/next\/(\?[^#]*)?#\/surge$/.test(q.url())) fail('옮긴 쪽 주소', '#/surge → ' + q.url()); } // ?seed=1 = 위에서 질문 뒤 꼴로 새로 연 주소
  else { await q.evaluate(() => { location.hash = '#/surge'; }); await q.waitForURL(/\/atlas\/#\/surge$/, {timeout: 15000}).catch(() => fail('옛 주소', '#/surge → /atlas/#/surge 아님 ' + q.url())); }
  for (const k of ['past', 'rivals', 'grow', 'range'].filter(k => READY.has(k))) { await q.goto(base + '/next/#/c/005930/' + k); await q.waitForTimeout(500); if (!q.url().endsWith('#/w/005930/' + k)) fail('옛 7단 주소', k + ' → ' + q.url()); }
  bump('첫 화면 붙박이');
  await q.context().close();
}
/* ①-2b 칩 쪽(2026-10-18 명령문 0015 [6] 5 · 6 · [7] 5 · [9] 7 · 일꾼 S2x) — 360×640 · 칩마다 큰 카드 하나까지 · 보이는 한 줄 10줄까지 · 나머지는 「나머지 n곳 보기」(누르면 모두)
   급등: 「1등」 0 · 보내기 0 · 「N곳 중 n곳이 지난 1년 안에 반값 아래로 …」 N = 목록 수 · n = 요약 chips.surge.half(요약이 그 급등 판으로 만든 때) · 회사 파일(/atlas/data/co/) 0 · 대장주 · 급등 3 화면 이하 */
{
  const SUMJ = await fetchJSON(base + '/next/data/home-summary.json', 'home-summary.json').catch(() => null);
  // 싹 먼저 차례(사장님 2026-10-22 09:41 「어그래」 — 업종 · 대장주 칩은 「많이 오른 차례」 대신 테마 시계 자리 차례) — 이 검사가 theme.json order 로 따로 셈(app.js sproutRank 를 쓰지 않음)
  const THJ = await fetchJSON(base + '/next/data/theme.json', 'theme.json').catch(() => null);
  const SPR = new Map(); for (const zk of ['S', 'B', 'W', 'Q']) for (const n of THJ?.order?.[zk] ?? []) if (!SPR.has(n)) SPR.set(n, SPR.size);
  const sprAt = n => SPR.get(n) ?? 1e9, zoneOfInd = n => THJ?.inds?.find(i => i.n === n)?.z ?? null;
  const LEADS = (() => { const K = cond?.co; if (!K?.c || cond.asOf !== mkt.asOf) return null; const ls = K.c.map((k, j) => [k, j]).filter(([k, j]) => K.rk?.[j] === 1 && CO[k] && Array.isArray(K.l5?.[j]) && Number.isFinite(K.r5?.[j])), indOf = ([k, j]) => cond.ind?.[K.i?.[j]]?.n || CO[k].i;
    return {indOf, ls: SPR.size ? ls.sort((p, q) => sprAt(indOf(p)) - sprAt(indOf(q)) || p[0].localeCompare(q[0])) : ls.sort((p, q) => K.r5[q[1]] - K.r5[p[1]] || p[0].localeCompare(q[0]))}; })();
  const IND0 = SPR.size ? [...core.industries].sort((p, q) => q.chg - p.chg).sort((p, q) => sprAt(p.name) - sprAt(q.name))[0] : [...core.industries].sort((p, q) => q.chg - p.chg)[0];
  const z = await page(360, 640), zReq = []; z.on('request', r => zReq.push(r.url()));
  if (await first(z, base + '/next/#/f/rise') === false) fail('칩 쪽', '처음 열기');
  for (const id of ['rise', 'surge', 'lead', 'pick', 'group', 'ind', 'us']) {
    zReq.length = 0; await go(z, '#/f/' + id); await z.waitForTimeout(80);
    const c = await z.evaluate(() => { const v = document.querySelector('#view'), li = [...v.querySelectorAll('ul.clist > li')], more = [...v.querySelectorAll('button.more')].map(b => b.textContent);
      return {cards: v.querySelectorAll('a.card, div.card').length, shown: li.filter(e => !e.hidden).length, hid: li.filter(e => e.hidden).length, all: li.length, more, t: v.innerText.replace(/\u00a0/g, ' '), H: Math.max(document.documentElement.scrollHeight, document.body.scrollHeight),
        share: [...v.querySelectorAll('button, a')].filter(e => !e.closest('.kk-btn') && /보내기|공유/.test(e.textContent)).length, // 카톡 단추(.kk-btn · 글자 「카톡 보내기」)는 셈 밖 — order-1639 [6] 8 이 급등 줄 카톡 단추를 되살림 · 2026-10-25 12:00 「진짜모든곳에」 글자로
        big: (v.querySelector('.card .th .big')?.innerText ?? '').replace(/\s+/g, ' '), bk: !!v.querySelector('.card .th .big .bk'), dur: v.querySelector('.card .th .dur')?.innerText ?? '', title: v.querySelector('.card .meta b')?.textContent ?? '', note: [...v.querySelectorAll('p.note')].map(p => p.textContent).join(' | ')}; });
    if (c.cards > 1) fail('칩 큰 카드는 하나([7] 5)', id + ' ' + c.cards);
    // [6] 8 「큰 숫자는 늘 마지막 날 하루 값 · 기간 숫자는 작게」 — 큰 카드 큰 숫자 = 맨 앞 줄의 마지막 날 하루(이 검사가 자료에서 따로 셈) · 기간 %는 아래 작은 칸
    if (id !== 'us') {
      const top = (xs, f) => [...xs].sort(f)[0], gs = id === 'group' ? core.groups : core.industries, miss = new Set(SUMJ?.chips?.surge?.miss || []);
      const want = id === 'rise' ? lineDay(core.rise?.list?.[0]?.v)
        : id === 'ind' ? lineDay(IND0?.v) // 싹 먼저 차례 맨 앞 업종(사장님 2026-10-22 09:41 — 옛 기대: 한 달 많이 오른 맨 앞)
        : id === 'group' ? lineDay(top(gs, (p, q) => q.chg - p.chg)?.v)
        : id === 'surge' ? top((surge?.members || []).filter(m => m && !miss.has(m.c) && Number.isFinite(m.r5)), (p, q) => q.r5 - p.r5)?.d1
        : id === 'pick' ? (home?.s365?.list || []).filter(([k]) => CO[k])[0]?.[1]
        : LEADS?.ls?.length ? lineDay(CO[LEADS.ls[0][0]].l) : null; // 대장주 = 싹 먼저 차례 맨 앞(사장님 2026-10-22 09:41 — 옛 기대: 5일 많이 오른 맨 앞)
      if (!c.bk || !/[+−]?\d/.test(c.dur) || (want != null && !c.big.includes(P(want)))) fail('칩 큰 숫자 = 마지막 날 하루 · 기간은 작게([6] 8)', `${id} 큰 「${c.big}」 기대 ${want == null ? '?' : P(want)} · 작은 칸 「${c.dur}」`);
    }
    // 싹 먼저 차례(사장님 2026-10-22 09:41 「어그래」) — 업종 칩 큰 카드 = theme.json order.S 맨 앞 · 대장주 칩 큰 카드 = 싹 업종에 대장주가 있으면 싹 업종의 대장주 · 쪽 글에 「많이 오른 차례」 없음
    if (id === 'ind' && SPR.size) {
      if (THJ.order?.S?.[0] && c.title !== THJ.order.S[0] + ' 업종') fail('업종 칩 싹 먼저 차례(2026-10-22 09:41)', `큰 카드 「${c.title}」 ≠ 「${THJ.order.S[0]} 업종」`);
      if (!/싹 자리부터/.test(c.note) || /많이 오른 차례/.test(c.note)) fail('업종 칩 차례 글(싹 먼저)', c.note);
      bump('싹 먼저 차례');
    }
    if (id === 'lead' && SPR.size && LEADS?.ls?.length) {
      const [k0] = LEADS.ls[0], i0 = LEADS.indOf(LEADS.ls[0]), anyS = LEADS.ls.some(x => zoneOfInd(LEADS.indOf(x)) === 'S');
      if (!c.title.startsWith(CO[k0].n + ', ')) fail('대장주 칩 싹 먼저 차례(2026-10-22 09:41)', `큰 카드 「${c.title}」 ≠ 「${CO[k0].n}, ${i0} 대장주」`);
      if (anyS && zoneOfInd(i0) !== 'S') fail('대장주 칩 맨 앞 = 싹 업종의 대장주', `${CO[k0].n} · ${i0} 자리 ${zoneOfInd(i0)}`);
      if (!/싹 업종의 대장주부터/.test(c.note) || /많이 오른 차례/.test(c.note)) fail('대장주 칩 차례 글(싹 먼저)', c.note);
      bump('싹 먼저 차례');
    }
    if (c.shown > 10) fail('칩 한 줄 목록 10줄까지([7] 5)', id + ' ' + c.shown);
    if (c.hid && !c.more.some(t => t.includes('나머지 ' + N(c.hid)))) fail('「나머지 n곳 보기」([7] 5)', `${id} 숨김 ${c.hid} · ${c.more.join(' / ')}`);
    if (c.hid) { await z.click('#view button.more'); const k = await z.evaluate(() => [...document.querySelectorAll('#view ul.clist > li')].filter(e => e.hidden).length); if (k) fail('「나머지 보기」 누르면 모두', id + ' 남은 숨김 ' + k); }
    if (id === 'surge') {
      if (c.t.includes('1등')) fail('급등 칩 「1등」 말([6] 5)', '');
      if (c.share) fail('급등 칩 보내기([6] 5)', String(c.share));
      const hm = /(\d[\d,]*)곳 중 (\d[\d,]*)곳이 지난 1년 안에 반값 아래로 떨어진 적 있어요/.exec(c.t), nList = c.cards + c.all;
      if (!hm) fail('급등 반값 한 줄([6] 6)', '없음');
      else { if (+hm[1].replace(/,/g, '') !== nList) fail('급등 반값 N = 목록 수([6] 6)', hm[1] + ' ≠ ' + nList);
        if (SUMJ?.chips?.surge && SUMJ.src?.surge === surge?.kst && +hm[2].replace(/,/g, '') !== SUMJ.chips.surge.half) fail('급등 반값 n = 요약 half([6] 6)', hm[2] + ' ≠ ' + SUMJ.chips.surge.half); }
      const co = zReq.filter(u => /\/atlas\/data\/co\//.test(u)); if (co.length) fail('급등 칩이 회사 파일을 받음([6] 6)', String(co.length));
    }
    if ((id === 'surge' || id === 'lead') && c.H > 3 * 640) fail('칩 쪽 3 화면 이하([7] 5 · 360×640)', `${id} ${c.H}px`);
    bump('칩 쪽');
  }
  if (z._errs.length) fail('화면 오류', '칩 쪽 ' + z._errs.join(' | ').slice(0, 200));
  await z.context().close();
}
/* ①-3 아래 단추 다섯(2026-10-17 21:10 [2] · 규칙 1 · 2) — 차례 · 이름(숫자 없음) · data-tab · 고리 · 창 제목 = 탭 이름 · 지금 탭 표시
   + 질문을 끝낸 기계(매매일지 기록 하나)에서 고도리 칸이 열린 꼴을 세 폭으로(첫 화면 · 고도리 칸 · 카드 하나 · 매매일지 · 보유종목) — [6] 1 두 꼴 모두 */
{
  const TABS = [['오늘 장', 'home', '#/'], ['시황', 'shorts', '#/shorts'], ['매매일지', 'why', '#/why'], ['관심', 'sub', '#/sub'], ['보유종목', 'me', '#/me']];
  const q = await page(390, 844);
  if (await first(q, base + '/next/#/') === false) fail('여는 중 남음', '아래 단추 처음 열기');
  const t = await q.evaluate(() => [...document.querySelectorAll('.tabs a')].map(a => [a.textContent.trim(), a.dataset.tab ?? null, a.getAttribute('href')]));
  if (JSON.stringify(t) !== JSON.stringify(TABS)) fail('아래 단추 다섯', JSON.stringify(t));
  for (const [nm] of t) if (/\d/.test(nm)) fail('탭 이름에 숫자(규칙 2)', nm);
  for (const [hh, nm] of [['#/', '오늘 장'], ['#/shorts', '시황'], ['#/shorts/1', '시황'], ['#/why', '매매일지'], ['#/why/005930', '매매일지'], ['#/sub', '관심'], ['#/me', '보유종목']]) {
    await go(q, hh); await q.waitForTimeout(60);
    const x = await q.evaluate(() => ({title: document.title, cur: document.querySelector('.tabs a[aria-current="page"]')?.textContent.trim() ?? null, h1: document.querySelector('#view h1')?.textContent ?? null}));
    if (x.title !== nm + TITLE_TAIL) fail('창 제목 = 탭 이름', hh + ' 「' + x.title + '」');
    if (x.cur !== nm) fail('지금 탭', hh + ' ' + x.cur);
    if (['#/why', '#/sub', '#/me'].includes(hh) && x.h1 !== nm) fail('화면 제목 = 탭 이름([2] 6)', hh + ' 「' + x.h1 + '」');
    bump('아래 단추 길');
  }
  await q.context().close();
  for (const w of [320, 360, 390]) {
    const ctx = await b.newContext({viewport: {width: w, height: 800}, deviceScaleFactor: 1, hasTouch: true});
    await ctx.addInitScript(([k, r]) => { try { if (!localStorage.getItem(k)) localStorage.setItem(k, JSON.stringify(r)); } catch { /* 기억 못 함 */ } }, [WHY_KEY, [whyRec(0), whyRec(40, codes[1] ?? '005930')]]);
    const z = watch(await ctx.newPage(), base); z._errs = [];
    z.on('pageerror', e => z._errs.push(e.message)); z.on('console', m => { if (m.type() === 'error') z._errs.push(m.text()); });
    if (await first(z, base + '/next/#/') === false) fail('여는 중 남음', w + ' 질문 뒤 처음 열기');
    for (const r of ['#/', '#/gdr', ...(GDR?.picks?.length ? ['#/gdr/' + GDR.picks[0].no] : []), '#/why', '#/me', ...(GDR?.picks?.length ? ['#/w/' + GDR.picks[0].code] : [])]) {
      await go(z, r); await z.waitForTimeout(80);
      if (r.startsWith('#/w/')) { const tg = await z.evaluate(() => [...document.querySelectorAll('#view .wtags > a')].map(a => a.getAttribute('href'))); if (!tg.includes('#/gdr/' + GDR.picks[0].no)) fail(NEW_NAME + ' 칸 꼬리표(질문 뒤 회사 쪽 · 본질 문 ④)', w + ' ' + r + ' ' + JSON.stringify(tg)); } // 끝낸 기기만 칸 번호 꼬리표(app.js wTags open · 일꾼 KI)
      if (r === '#/' || r.startsWith('#/gdr')) { const lock = await z.evaluate(() => !!document.querySelector('#view section.gdr.lock1, #view section.gdr.lock')); if (lock) fail(NEW_NAME + ' 칸이 질문 뒤에도 잠김', w + ' ' + r); }
      checkScan(w + ' 질문 뒤 ' + r, await scan(z), z); bump('질문 뒤 화면');
    }
    await ctx.close();
  }
}
/* ② 모든 회사 보는 화면 · ③ 채널 · ④ 쇼츠 · ⑤ 찾기 · ⑥ 누르기 — 390 폭 */
const p = await page(390, 844);
const WHY_DONE_HERE = false; // 이 쪽(새 칸)은 매매일지 기록이 없음 = 열한 질문 전 기기 — 회사 쪽 칸 번호 꼬리표 0 을 기대(일꾼 KI)
if (await first(p, base + '/next/#/') === false) fail('여는 중 남음', '390 처음 열기');
const list = LIMIT ? codes.slice(0, LIMIT) : codes;
for (const code of list) {
  const o = CO[code];
  if (await go(p, '#/w/' + code, q => q.waitForFunction(n => document.querySelector('#view .wt')?.textContent === n, o.n, {timeout: 8000}).then(() => true, () => false)) === false) fail('보는 화면 이름', code);
  const g = await p.evaluate(() => ({ws: (document.querySelector('#view .ws')?.textContent ?? '').replace(/\s+/g, ' ').trim(), wp: (document.querySelector('#view .wn-p')?.textContent ?? '').trim(), wd: (document.querySelector('#view .wn-d')?.textContent ?? '').trim(),
    path: [...document.querySelectorAll('#view nav.wpath a')].map(a => [a.textContent.trim(), a.getAttribute('href')]), pathN: document.querySelectorAll('#view nav.wpath > a, #view nav.wpath > span:not(.wsep)').length,
    tabs: [...document.querySelectorAll('#view nav.wtabs a')].map(a => [a.textContent.trim(), a.getAttribute('href'), Math.round(a.getBoundingClientRect().top)]), tags: [...document.querySelectorAll('#view .wtags > a')].map(a => [a.textContent.trim(), a.getAttribute('href')]),
    play: document.querySelectorAll('#view .player .play').length, chapsOld: document.querySelectorAll('#view .chaps').length, chap: (document.querySelector('#view')?.textContent.match(/챕터/g) || []).length,
    nx: document.querySelectorAll('#view .nx').length, chan: document.querySelector('#view .chan b')?.textContent ?? '', sw: document.documentElement.scrollWidth, vw: document.documentElement.clientWidth, tip: document.querySelector('#view .player .tip')?.textContent ?? ''}));
  const want20 = P(c20(o)), wantDay = P(lineDay(o.l));
  if (!g.ws.includes('한 달 동안 ' + want20)) fail('한 달 %', code + ' 「' + g.ws + '」 ≠ ' + want20);
  if (g.wd !== wantDay) fail('하루 %(오늘 값 줄)', code + ' 「' + g.wd + '」 ≠ ' + wantDay);
  if (!/^(\d{1,3}(,\d{3})*원|\?)$/.test(g.wp)) fail('오늘 값', code + ' 「' + g.wp + '」');
  if (!g.ws.includes(MD(mkt.asOf) + ' 마감')) fail('마감 날', code);
  const I = ind.get(o.i), G = I ? grp.get(I.g) : null;
  const sub = k => (READY.has(k) ? '#/w/' + code + '/' + k : '/atlas/#/c/' + code + '/' + k);
  // 길 표시(큰 업종 › 업종 · 고리 둘) · 탭 넷(4 ~ 7단 · 한 줄) · 꼬리표 · 큰 선 ▶ 없음 · 옛 일곱 칸 없음 · 「챕터」 0
  const wantPath = [G ? [G.short || G.name, '#/ch/g/' + encodeURIComponent(G.id)] : null, I ? [I.name + ' 업종', '#/ch/i/' + encodeURIComponent(I.name)] : null].filter(Boolean);
  if (JSON.stringify(g.path) !== JSON.stringify(wantPath) || g.pathN !== 2) fail('길 표시', code + ' ' + JSON.stringify(g.path));
  const wantTabs = [sub('past'), sub('rivals'), sub('grow'), sub('range')];
  if (JSON.stringify(g.tabs.map(t => t[1])) !== JSON.stringify(wantTabs) || new Set(g.tabs.map(t => t[2])).size !== 1) fail('탭 넷', code + ' ' + JSON.stringify(g.tabs));
  const wantTags = [];
  // 칸 번호 꼬리표는 열한 질문을 끝낸 기기에서만(본질 문 ④ · app.js wTags open · 일꾼 KI) — 이 390 쪽은 매매일지 기록이 없어 늘 뺌 · 끝낸 기기의 꼬리표는 위 「질문 뒤」 쪽에서 봄
  if (WHY_DONE_HERE) for (const q of GDR?.picks ?? []) if (q.code === code) wantTags.push([NEW_NAME + ' 칸 ' + q.no + '번', '#/gdr/' + q.no]);
  if (surge?.members?.some(m => m.c === code)) wantTags.push(['급등 칸', '#/surge']);
  for (const [k, nm] of [['b10', '10%대'], ['b20', '20%대'], ['b30', '30%대'], ['b40', '40% 이상']]) if (surge?.bands?.[k]?.members?.some(m => m.c === code)) wantTags.push(['급등 ' + nm + ' 칸', '#/surge/' + k.slice(1)]);
  // 대장주 = 업종 안 회사 크기 1등 · 5일 선이 있고 5일 오름이 숫자 · cond 가 시장과 같은 날(#/f/lead 칩과 같은 걸름 — cond.json 칸 줄을 직접 읽음)
  if (cond?.asOf === mkt.asOf && cond?.co?.c) { const k = cond.co.c.indexOf(code); if (k >= 0 && cond.co.rk?.[k] === 1 && Array.isArray(cond.co.l5?.[k]) && Number.isFinite(cond.co.r5?.[k])) wantTags.push(['대장주', '#/f/lead']); }
  if (o.p) wantTags.push(['고른 곳', '#/f/pick']);
  if (JSON.stringify(g.tags) !== JSON.stringify(wantTags)) fail('든 목록 꼬리표', code + ' ' + JSON.stringify(g.tags) + ' ≠ ' + JSON.stringify(wantTags));
  if (g.play) fail('큰 선 ▶ 표시 남음', code);
  if (g.chapsOld) fail('옛 일곱 칸 남음', code);
  if (g.chap) fail('「챕터」 남음', code + ' ' + g.chap + '번');
  if (g.chan !== (o.i || '?') + ' 업종') fail('채널 줄', code + ' ' + g.chan);
  const mem = (I?.members || []).filter(m => m !== code && CO[m]).length;
  if (g.nx !== Math.min(6, mem)) fail('다음 볼 것 수', code + ' ' + g.nx + ' ≠ ' + Math.min(6, mem));
  if (g.sw > g.vw) fail('가로 넘침', 'w ' + code);
  if (!/^한 달 · \d+월 \d+일 → \d+월 \d+일$/.test(g.tip)) fail('선 이름표', code + ' ' + g.tip);
  if (p._errs.length) { fail('화면 오류', code + ' ' + p._errs.join(' | ').slice(0, 200)); p._errs.length = 0; }
  await guard(p, '#/w/' + code);
  bump('회사');
}
for (const I of core.industries) {
  if (await go(p, '#/ch/i/' + encodeURIComponent(I.name), q => q.waitForFunction(n => document.querySelector('#view .chhead h1')?.textContent === n, I.name + ' 업종', {timeout: 8000}).then(() => true, () => false)) === false) fail('업종 채널 이름', I.name);
  const g = await p.evaluate(() => ({small: document.querySelector('#view .chhead small')?.textContent ?? '', st: [...document.querySelectorAll('#view .stats b')].map(b => b.textContent), tiles: document.querySelectorAll('#view .grid > a, #view .grid > [data-kkrow] > a').length})); // 칸 = 고리 · 카톡 단추와 함께 감싼 줄(app.js kkWrap · data-kkrow) 안의 고리도 셈(단추는 button · 줄 구조 그대로 · 일꾼 KI)
  const n = I.members.filter(m => CO[m]).length;
  if (!g.small.startsWith('회사 ' + N(n) + '곳')) fail('업종 회사 수', I.name + ' ' + g.small);
  if (g.st[0] !== P(I.chg) || g.st[1] !== P(I.cwChg)) fail('업종 두 숫자', I.name + ' ' + g.st.join(','));
  if (g.tiles !== Math.min(20, n)) fail('업종 칸 수', I.name + ' ' + g.tiles);
  await guard(p, '#/ch/i/' + I.name);
  bump('업종 채널');
}
for (const G of core.groups) {
  if (await go(p, '#/ch/g/' + encodeURIComponent(G.id), q => q.waitForFunction(n => document.querySelector('#view .chhead h1')?.textContent === n, gloss(G.name + ' 갈래'), {timeout: 8000}).then(() => true, () => false)) === false) fail('갈래 채널 이름', G.id);
  const g = await p.evaluate(() => ({small: document.querySelector('#view .chhead small')?.textContent ?? '', st: [...document.querySelectorAll('#view .stats b')].map(b => b.textContent)}));
  const n = (G.inds || []).reduce((a, nm) => a + (ind.get(nm)?.members || []).filter(m => CO[m]).length, 0);
  if (n !== G.n) fail('갈래 회사 수(자료)', G.id + ' ' + n + ' ≠ ' + G.n);
  if (!g.small.startsWith('회사 ' + N(n) + '곳') || !g.small.includes('업종 ' + (G.inds || []).length + '개')) fail('갈래 회사 수', G.id + ' ' + g.small);
  if (g.st[0] !== P(G.chg) || g.st[1] !== P(G.cwChg)) fail('갈래 두 숫자', G.id + ' ' + g.st.join(','));
  await guard(p, '#/ch/g/' + G.id);
  bump('갈래 채널');
}
/* ④ 쇼츠 */
{
  await go(p, '#/shorts'); await p.waitForTimeout(200);
  const got = await p.evaluate(() => [...document.querySelectorAll('#view .sh')].map(s => ({k: s.querySelector('.k')?.textContent, l1: s.querySelector('.l1')?.textContent, big: s.querySelector('.bg')?.textContent, l2: s.querySelector('.l2')?.textContent})));
  const exp = [];
  const kp = home?.idx?.KOSPI, kq = home?.idx?.KOSDAQ;
  if (kp) exp.push({l1: '코스피는 하루', big: P2(kp.day), l2: '코스닥은 ' + P2(kq.day) + '이에요'});
  let up = 0, dn = 0, fl = 0; for (const o of Object.values(CO)) { const d = lineDay(o.l); if (!Number.isFinite(d)) continue; if (d > 0) up++; else if (d < 0) dn++; else fl++; }
  exp.push({l1: '모든 회사 ' + N(up + dn + fl) + '곳 가운데', big: N(Math.max(up, dn)) + '곳'});
  const r0 = [...core.rise.list].sort((a, b) => b.chg - a.chg)[0]; if (r0) exp.push({l1: r0.name, big: P(r0.chg)});
  const gs = [...core.groups].sort((a, b) => b.chg - a.chg); exp.push({l1: gloss(gs[0].name + ' 갈래'), big: P(gs[0].chg)}, {l1: gloss(gs[gs.length - 1].name + ' 갈래'), big: P(gs[gs.length - 1].chg)});
  // 2026-10-17 21:10 [2] 10 「시황은 왜 움직였나만 · 급등 목록은 넣지 마라」 — 가장 많이 오른 회사 · 급등 칸 1등 · 고른 곳 오름 수 · 편지 장은 뺌(지수 · 오른 곳 수 · 1주 업종 · 갈래 둘 · 미국)
  if (home?.us?.rows?.[0]) exp.push({l1: home.us.rows[0].name, big: P2(home.us.rows[0].chg), l2: home.us.rows.slice(1, 3).map(r => r.name + ' ' + P2(r.chg)).join(' · ')});
  for (const e of exp) {
    const hit = got.find(x => x.l1 === e.l1);
    if (!hit) { fail('쇼츠 사실 없음', e.l1); continue; }
    if (hit.big !== e.big) fail('쇼츠 숫자', e.l1 + ' ' + hit.big + ' ≠ ' + e.big);
    if (e.l2 && hit.l2 !== e.l2) fail('쇼츠 둘째 줄', e.l1 + ' 「' + hit.l2 + '」 ≠ 「' + e.l2 + '」');
    bump('쇼츠 사실');
  }
  if (got.length !== exp.length) fail('시황 장 수', got.length + ' ≠ ' + exp.length);
  if (JSON.stringify(got.map(x => x.l1)) !== JSON.stringify(exp.map(x => x.l1))) fail('시황 차례', JSON.stringify(got.map(x => x.l1)));
  const surgeIn = await p.evaluate(() => ({a: [...document.querySelectorAll('#view a[href*="surge"]')].map(a => a.getAttribute('href')), t: /급등/.test(document.querySelector('#view')?.textContent ?? '')}));
  if (surgeIn.a.length || surgeIn.t) fail('시황에 급등 목록이 남음([2] 10)', JSON.stringify(surgeIn));
}
/* ⑤ 찾기 — 모든 회사 이름 */
{
  await go(p, '#/find'); await p.waitForSelector('#view .find input');
  const miss = await p.evaluate(names => {
    const inp = document.querySelector('#view .find input'), bad = [];
    for (const [code, n] of names) { inp.value = n; inp.dispatchEvent(new Event('input')); const a = document.querySelector('#view .hits a[href^="#/w/"]'); if (!a || a.getAttribute('href') !== '#/w/' + code) { if (a?.textContent?.startsWith(n) && document.querySelectorAll('#view .hits a[href^="#/w/"]').length && [...document.querySelectorAll('#view .hits a[href^="#/w/"]')].some(x => x.getAttribute('href') === '#/w/' + code)) continue; bad.push(code + ' ' + n); } }
    inp.value = '005930'; inp.dispatchEvent(new Event('input')); const s1 = document.querySelector('#view .hits a[href^="#/w/"]')?.getAttribute('href');
    inp.value = 'ㅋㅋㅋ없는말'; inp.dispatchEvent(new Event('input')); const s2 = document.querySelectorAll('#view .hits a[href^="#/w/"]').length;
    return {bad, s1, s2};
  }, codes.map(c => [c, CO[c].n]));
  for (const x of miss.bad.slice(0, 20)) fail('찾기 첫 줄', x);
  if (miss.s1 !== '#/w/005930') fail('번호 찾기', String(miss.s1));
  if (miss.s2 !== 0) fail('없는 말 찾기', String(miss.s2));
  counts['찾기'] = codes.length;
}
/* ⑥ 누르기 */
{
  await p.evaluate(() => { localStorage.clear(); });
  const code = '005930', o = CO[code];
  await go(p, '#/w/' + code); await p.waitForSelector('#view .sub-btn');
  await p.click('#view .chan .sub-btn'); await p.waitForTimeout(100);
  const sub = await p.evaluate(() => JSON.parse(localStorage.getItem('atlas:new:sub') || '[]'));
  if (!sub.includes('i:' + o.i)) fail('구독 누름', JSON.stringify(sub));
  await p.click('#view .acts .act'); await p.waitForTimeout(100);
  const later = await p.evaluate(() => JSON.parse(localStorage.getItem('atlas:new:later') || '[]'));
  if (!later.includes(code)) fail('담기 누름', JSON.stringify(later));
  // 선 끌기 — 왼쪽 끝 → 첫날 · 짧게 누름 → 처음 이름표
  const box = await p.locator('#view .player').boundingBox();
  await p.mouse.move(box.x + box.width * 0.04, box.y + box.height / 2); await p.mouse.down(); await p.mouse.move(box.x + box.width * 0.05, box.y + box.height / 2, {steps: 3});
  const t1 = await p.textContent('#view .player .tip'); await p.mouse.up();
  if (!t1.startsWith(MD(core.dates[0]) + ' · 첫날보다 0.0%')) fail('선 끌기 첫날', t1);
  await p.mouse.move(box.x + box.width * 0.96, box.y + box.height / 2); await p.mouse.down(); await p.mouse.move(box.x + box.width * 0.97, box.y + box.height / 2, {steps: 3});
  const t2 = await p.textContent('#view .player .tip'); await p.mouse.up();
  if (!t2.startsWith(MD(mkt.asOf) + ' · 첫날보다 ' + P(lineChg(o.l)))) fail('선 끌기 끝날', t2 + ' ≠ ' + P(lineChg(o.l)));
  await p.mouse.click(box.x + box.width / 2, box.y + box.height / 2); await p.waitForTimeout(80);
  const t3 = await p.textContent('#view .player .tip'); if (!t3.startsWith('한 달 · ')) fail('짧게 누름', t3);
  // 관심(#/sub — [2] 4 · 8): 담은 업종 · 갈래 + 「관심 담기」 한 회사(옛 「나중에 볼 것」) 한 화면 · 단추 글 「관심 담음」
  await go(p, '#/sub'); const s = await p.evaluate(() => ({ch: [...document.querySelectorAll('#view .avs small')].map(x => x.textContent), wl: [...document.querySelectorAll('#view .wl a[href^="#/w/"]')].map(a => a.getAttribute('href')),
    btn: [...document.querySelectorAll('#view .wl .sub-btn')].map(x => x.textContent.trim()), h1: document.querySelector('#view h1')?.textContent ?? ''}));
  if (!s.ch.includes(o.i)) fail('관심 칸 업종', JSON.stringify(s.ch));
  if (!s.wl.includes('#/w/' + code)) fail('관심 칸 회사(관심 담기)', JSON.stringify(s.wl));
  if (!s.btn.length || s.btn.some(t => !t.startsWith('관심 담음'))) fail('관심 칸 단추 글', JSON.stringify(s.btn));
  if (s.h1 !== '관심') fail('관심 칸 제목 = 탭 이름', s.h1);
  checkScan('390 #/sub(관심 있음)', await scan(p), p); await guard(p, '#/sub(관심 있음)');
  // 보유종목(#/me): 본 기록만 · 관심 회사는 관심 칸으로 옮김 · 지우기 = 본 기록만(「본 기록 지우기」 · 묻는 글 「본 기록을 이 기기에서 지울까요?」 · 관심 회사는 그대로)
  await go(p, '#/me'); const m = await p.evaluate(() => ({hist: document.querySelectorAll('#view .row a').length, later: [...document.querySelectorAll('#view .lst a[href^="#/w/"]')].map(a => a.getAttribute('href')), btn: document.querySelector('#view .lst:not(.hd-sc) button')?.textContent?.replace('›', '').trim() ?? null}));
  if (m.hist < 1) fail('보유종목 본 기록', JSON.stringify(m));
  if (m.later.length) fail('보유종목에 관심 회사가 남음([2] 8 — 관심 칸으로)', JSON.stringify(m.later));
  if (m.btn !== '본 기록 지우기') fail('지우기 단추 글', String(m.btn));
  checkScan('390 #/me(기록 있음)', await scan(p), p); await guard(p, '#/me(기록 있음)');
  let ask = null; p.once('dialog', d => { ask = d.message(); d.accept(); }); await p.click('#view .lst:not(.hd-sc) button'); await p.waitForTimeout(150);
  const cleared = await p.evaluate(() => [JSON.parse(localStorage.getItem('atlas:new:hist') || '[]').length, JSON.parse(localStorage.getItem('atlas:new:later') || '[]').length]);
  if (ask !== '본 기록을 이 기기에서 지울까요?') fail('지우기 묻는 글', String(ask));
  if (cleared[0] || cleared[1] !== 1) fail('지우기(본 기록만 · 관심 회사는 그대로)', JSON.stringify(cleared));
  // 글씨 크기 단추 — 보통 → 크게 → 아주 크게 → 보통 · 기억 atlas:font
  const fs3 = [];
  for (let k = 0; k < 3; k++) { await p.click('#fontBtn'); await p.waitForTimeout(60); fs3.push(await p.evaluate(() => [document.documentElement.classList.contains('f2'), document.documentElement.classList.contains('f3'), localStorage.getItem('atlas:font')].join(','))); }
  if (fs3.join(' ') !== 'true,false,1 false,true,2 false,false,0') fail('글씨 크기 단추', fs3.join(' '));
  bump('누르기');
}
await b.close();
const res = {schema: 'atlas11-next-check-1', at: new Date().toISOString(), base, asOf: mkt.asOf, ready: [...READY], companies: codes.length, limit: LIMIT || null, full: !LIMIT, oldNameScreens: guarded.size, oldNameAllow: ALLOW, seconds: Math.round((Date.now() - t0) / 1000), time: tm.get(), net: netSummary(), counts, fails, ok: !fails.length};
await fs.mkdir(path.dirname(out), {recursive: true});
await fs.writeFile(out, JSON.stringify(res, null, 1) + '\n');
console.log(JSON.stringify({ok: res.ok, seconds: res.seconds, time: res.time, net: res.net, counts, fails: fails.slice(0, 12)}, null, 0));
process.exit(res.ok ? 0 : 1);
