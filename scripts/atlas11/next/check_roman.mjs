// 로마 신 72 쪽 검사(#/roman · site/next/p-roman.js · p-roman.css · 자료 site/next/roman72.js)
//   사장님 2026-10-30(+03) 22:23 「그냥재미삼아 적절한곳에 배치해봐 둘리에」(docs/design/roman72-site-2026-10-31/order-0423.txt)
//   앞 일 2026-10-31 02:49(+08) 「이제는 로마신화에 72명 먼저 선정해」 — 고른 목록 docs/design/roman72-2026-10-31/roman72.json(다른 일꾼 맞대기 check.md)
//   쓰는 법: node scripts/atlas11/next/check_roman.mjs --base http://127.0.0.1:8826 [--pw /opt/node-tools/] [--out 결과.json] [--all]
//     다른 쪽 검사와 같은 꼴(--all · --limit · --shard 를 받음 — 이 검사는 늘 일흔두 자리를 모두 돎)
//   ① 자료(브라우저 없이) — 자리 일흔둘 · 무리 여덟(10 · 11 · 11 · 11 · 6 · 7 · 5 · 11) · 신 일흔둘이 한 번씩(겹침 0 · 빠짐 0)
//      · 신 이름 · 라틴 이름 · 한 줄 소개 · 무리 = 고른 목록 그대로(ONE_FIX 에 까닭을 적은 번호만 한 줄 소개를 뺌) · 빈 칸 0 · 영어 칸 한글 0
//      · 쓰지 않을 말 0(words.js screenHits) · 망치는 길 낱말 0(RUIN · 한국어 · 영어) · 옛 이름 0 · 이름을 글에 박지 않음({N}) · 낱말표가 바꾸는 말 0
//      · 고리 꼴(#/… 또는 고리 없음) · 모양 규칙(p-roman.css 글씨 var(--fs-n) · 여백 var(--sp-n))
//   ② 쪽 세 폭(320 · 360 · 390) + 320 「아주 크게」 — 제목 · 무리 여덟 · 단추 여덟 · 카드 일흔둘(자료 차례 · 자리 · 신 · 라틴 · 한 줄 · 왜 여기 · 무리 · 고리)
//      · 가로 넘침 0 · 누르는 것 48 넘게 · 글 19px 넘게 · 신 이름 24px 넘게 · 모든 글 대비 7 넘게 · 누르는 것 테 대비 3 넘게 · 밝은 종이 바탕 · 쓰지 않을 말 0
//      · 무리 단추를 누르면 그 무리가 화면 위에 옴 · 초점 테 대비 3 넘게
//   ③ 고리 — 카드가 가는 길마다 열어 봄(쪽이 그려짐 · 주소가 바뀌지 않음 · 화면 오류 0 · 종이 판 꺼짐) · 카드를 누르면 그 자리로 감
//   ④ 영어(?lang=en) — 제목 · html lang · 창 제목 영어 · 카드 영어 글 = 자료 · 남은 한글 0 · 같은 재기
//   ⑤ 길 — 둘이 단추 안 「로마 신 72」(서른아홉 스승 다음 줄) → 쪽 · 아래 단추 「둘이」가 지금 쪽 · 종이 판 켜짐 · 다른 쪽이면 꺼짐 · 영어 둘이 단추 안 이름 · 모르는 꼬리 주소도 같은 쪽
//   ⑥ 방 지킴이 이름표(사장님 2026-10-31 05:51(+03) 「응」 — 물음 「방마다 그 신 이름표도 달아 볼까요?」 · site/next/roman-tag.js · roman72.js ROOMS)
//      — 방마다 하나 · 그 방 지킴이 신 이름 · #/roman/<번호> · 쪽 맨 아래 카톡 줄 위 · 48px · 17px · 화면 안 · 이름표 없는 쪽(로마 신 72 · 시황 · 칩) 0
//      · 이름표 누름 → 로마 신 72 쪽 그 신 카드가 화면 안 · 테 · 영어 이름표 · 아주 크게 320 · 자료 짝(지킴이 신의 자리 고리가 그 방)
//   ⑦ 신 캐릭터 그림 · 불빛 지킴이(사장님 2026-10-31 07:32(+03) 「어 달면서 신들에 / 이미지도 캐릭터화해서 해」 · order-1332.txt · 그림 기계 scripts/atlas11/next/roman_art.mjs)
//      — ① 그림 일흔둘 = 기계가 그린 것 그대로 · 글자 · 글 속 style · 스크립트 · 바깥 고리 0 · 한 장 12KB 안 · 서로 다름 · 무리 테 빛 · 불빛 지킴이 표(LIGHTS) = SEATS 「talk」 차례
//      · ② 카드마다 얼굴(그 신 그림 · 이름 비움) · 서버가 일흔둘을 그림 꼴로 줌 · 내려 보면 일흔둘 모두 그려짐 · ⑥ 이름표 얼굴 = 그 방 신 그림(그려짐)
//      · 첫 화면 말하는 불빛 열하나 — 누를 때마다 말풍선 맨 위 「(얼굴) 지킴이 · 신 이름 ›」 = 그 불빛 자리 신 · 48px · 17px · 화면 안 · 누름 → 로마 신 72 그 신 카드 · 영어 · 아주 크게 320
//   ⑧ 얼굴 듣기(사장님 2026-10-31 10:58(+04) 「응」 — 물음 「신 얼굴을 누르면 그 신 이야기를 소리로 들려 드릴까요?」 · order-1558.txt · site/next/roman-say.js)
//      — 가짜 소리(speechSynthesis 바꿔 끼움)로 읽은 글을 맞댐: 이야기 = 「이름. 누구. 왜 여기」(카드 글 그대로 · 따로 셈) · ko-KR / en-US · 빠르기 0.9 · 높이 1 · 크기 0.96
//      · 로마 신 카드 얼굴 — 눌림 · 카드 테 · 다시 누르면 멈춤 · 다른 얼굴로 바꿈 · 끝나면 풂 · 주소 그대로 · 방 이름표 얼굴 — 글상자 = 듣는 말 · 쪽을 옮기면 멈춤
//      · 불빛 지킴이 얼굴 — 글상자 = 듣는 말 · 영어 · 소리 없는 휴대폰 = 글상자만(화면 오류 0) · 아주 크게 320 글상자 넘침 0
//   실패가 하나라도 있으면 끝 코드 1(결과 파일은 --out 을 줄 때만)
import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createRequire} from 'node:module';
import {screenHits, RUIN, RUIN_OK} from '../../../site/next/words.js';
import {OLD_NAME_RE, NEW_NAME} from './rename.mjs';
import {cssRules} from './page_rules.mjs';
import {BRAND, josa} from '../../../site/next/brand.js';
import {GROUPS, GODS, ZONES, SEATS, ONE_FIX, ROOMS, roomOf, LIGHTS, artOf} from '../../../site/next/roman72.js';
import {svgOf, ART, GROUP_BG} from './roman_art.mjs';

const argv = process.argv.slice(2);
const arg = (k, d) => { const i = argv.indexOf(k); return i >= 0 && argv[i + 1] != null && !argv[i + 1].startsWith('--') ? argv[i + 1] : d; };
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');
const require = createRequire(String(arg('--pw', process.env.PW_DIR || '/opt/node-tools/')).replace(/\/?$/, '/'));
const base = String(arg('--base', 'http://127.0.0.1:8826')).replace(/\/$/, ''), OUT = arg('--out', null);
const R = {schema: 'duri-check-roman-1', at: new Date().toISOString(), base, counts: {pass: 0, fail: 0}, fails: [], m: {}};
const check = (ok, name, why = '') => { if (ok) R.counts.pass++; else { R.counts.fail++; R.fails.push([name, String(why).slice(0, 300)]); console.log('실패', name, why ? '— ' + String(why).slice(0, 300) : ''); } };
const URL_OF = (hash, q = '') => `${base}/next/?v=${Date.now()}${q}${hash}`;
const HAN = /[가-힣ㄱ-ㅎㅏ-ㅣ]/;
const GLOSS = /갈래|몸값|한 회사 한 표|큰 회사는 크게|거래일|다섯 문|쉬는 돈|챕터/; // 낱말표(site/next/glossary.js)가 화면에서 바꾸는 말
const ZCOUNT = {home: 10, talk: 11, why: 11, dock: 11, top: 6, theme: 7, co: 5, more: 11};
const fillKo = s => String(s).split('{N}').join(NEW_NAME), fillEn = s => String(s).split('{N}').join(BRAND.en);
const SAFE = josa(NEW_NAME, '는') + ' 지난 기록만 보여 줘요. 사고팔기를 권하지 않아요.'; // 둘이 안전 문장(둘이 단추 안과 같은 글)
const WHY = {ko: '왜 여기?', en: 'Why here?'};

/* ── ① 자료 ── */
const LIST = JSON.parse(await fs.readFile(path.join(ROOT, 'docs/design/roman72-2026-10-31/roman72.json'), 'utf8'));
{
  check(SEATS.length === 72, '① 자리 일흔둘', SEATS.length);
  check(ZONES.length === 8 && ZONES.every(z => z.id in ZCOUNT), '① 무리 여덟', ZONES.map(z => z.id).join(','));
  const cnt = ZONES.map(z => SEATS.filter(s => s[0] === z.id).length), want = ZONES.map(z => ZCOUNT[z.id]);
  check(cnt.join() === want.join() && SEATS.every(s => s[0] in ZCOUNT), '① 무리마다 자리 수 10 · 11 · 11 · 11 · 6 · 7 · 5 · 11', cnt.join());
  check(SEATS.every((s, i) => i === 0 || ZONES.findIndex(z => z.id === s[0]) >= ZONES.findIndex(z => z.id === SEATS[i - 1][0])), '① 자리 차례 = 무리 차례');
  const gs = SEATS.map(s => s[4]);
  check(new Set(gs).size === 72 && gs.every(n => Number.isInteger(n) && n >= 1 && n <= 72), '① 신 일흔둘이 한 자리씩(겹침 0 · 빠짐 0)', [...Array(72)].map((_, i) => i + 1).filter(n => !gs.includes(n)).join(','));
  const people = LIST.groups.flatMap((g, k) => g.people.map(p => ({...p, g: k + 1})));
  check(people.length === 72 && LIST.groups.length === 6, '① 고른 목록 여섯 무리 · 일흔두 명', people.length);
  const bad = [];
  for (const p of people) {
    const x = GODS[p.n]; if (!x) { bad.push(`${p.n} 없음`); continue; }
    if (x[0] !== p.name || x[1] !== p.latin) bad.push(`${p.n} 이름 ${x[0]}/${x[1]} ≠ ${p.name}/${p.latin}`);
    if (x[3] !== p.one && !ONE_FIX[p.n]) bad.push(`${p.n} 한 줄 「${x[3]}」 ≠ 「${p.one}」`);
    if (x[5] !== p.g) bad.push(`${p.n} 무리 ${x[5]} ≠ ${p.g}`);
  }
  check(!bad.length && Object.keys(GODS).length === 72, '① 신 이름 · 라틴 · 한 줄 · 무리 = 고른 목록', bad.slice(0, 5).join(' | '));
  check(Object.keys(ONE_FIX).every(n => GODS[n] && String(ONE_FIX[n]).length > 10) && Object.keys(ONE_FIX).length <= 3, '① 한 줄을 바꾼 번호는 까닭과 함께 셋 이하', JSON.stringify(ONE_FIX));
  check(GROUPS.length === 6 && GROUPS.every((g, k) => g[0] === LIST.groups[k].name && g[1] && !HAN.test(g[1])), '① 무리 이름 = 고른 목록', GROUPS.map(g => g[0]).join(','));
  const ko = [], en = [], empty = [];
  for (const s of SEATS) { for (const k of [1, 2, 5, 6]) if (!String(s[k] ?? '').trim()) empty.push(`${s[4]} 칸 ${k}`); ko.push(s[1], s[5]); en.push(s[2], s[6]); }
  for (const [n, g] of Object.entries(GODS)) { for (const k of [0, 1, 2, 3, 4]) if (!String(g[k] ?? '').trim()) empty.push(`신 ${n} 칸 ${k}`); ko.push(g[0], g[3]); en.push(g[2], g[4]); }
  for (const z of ZONES) { ko.push(z.name[0], z.note[0]); en.push(z.name[1], z.note[1]); }
  for (const g of GROUPS) { ko.push(g[0]); en.push(g[1]); }
  check(!empty.length, '① 빈 칸 0', empty.slice(0, 5).join(' | '));
  const K = ko.map(fillKo).join('\n'), E = en.map(fillEn).join('\n');
  check(!en.some(s => HAN.test(s)), '① 영어 칸 한글 0', en.find(s => HAN.test(s)));
  check(!screenHits(K).length, '① 쓰지 않을 말 0', screenHits(K).join(' '));
  let k2 = K; for (const ok of RUIN_OK) k2 = k2.split(ok).join(''); const k3 = k2.replace(/\s+/g, '');
  const ruin = [];
  for (const r of RUIN) {
    for (const w of r.ko) if (k2.includes(w) || k3.includes(w.replace(/\s+/g, ''))) ruin.push(r.key + ' 「' + w + '」');
    for (const w of r.en) if (new RegExp('\\b' + w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\b', 'i').test(E)) ruin.push(r.key + ' 「' + w + '」');
  }
  check(!ruin.length, '① 망치는 길 낱말 0(한국어 · 영어)', ruin.join(' | '));
  check(!OLD_NAME_RE.test(K + '\n' + E), '① 옛 이름 0', (K + E).match(OLD_NAME_RE)?.[0]);
  const nameKo = new RegExp(BRAND.ko + '(?!서)'), nameEn = new RegExp('\\b' + BRAND.en + '\\b'); // 「둘이서」(둘이 함께 — 보통 말)는 이름이 아님
  const own = [...SEATS.flatMap(x => [x[1], x[2], x[5], x[6]]), ...ZONES.flatMap(z => [...z.name, ...z.note])]; // 자리 · 무리 글(고른 목록의 한 줄 소개 「얼굴이 앞뒤 둘이에요」는 보통 말이라 셈 밖)
  check(!own.some(s => nameKo.test(s) || nameEn.test(s)), '① 이름을 글에 박지 않음({N} 으로 · 규칙 76)', own.filter(s => nameKo.test(s) || nameEn.test(s)).slice(0, 3).join(' | '));
  check(!GLOSS.test(K), '① 낱말표가 바꾸는 말 0', K.match(GLOSS)?.[0]);
  check(SEATS.every(s => s[3] === null || /^#\/[a-z0-9/]*$/.test(s[3])), '① 고리 꼴(#/… 또는 고리 없음)', SEATS.filter(s => !(s[3] === null || /^#\/[a-z0-9/]*$/.test(s[3]))).map(s => s[3]).join(','));
  check(SEATS.filter(s => s[3] === null).length <= 6, '① 고리 없는 자리 여섯 이하(제 주소가 없는 단추 · 쪽만)', SEATS.filter(s => s[3] === null).length);
  check(SEATS.every(s => /요\.$/.test(s[5]) && /[.?”]$/.test(s[6])), '① 왜 여기 = 끝난 문장(…요. · 영어 마침표)', SEATS.filter(s => !(/요\.$/.test(s[5]) && /[.?”]$/.test(s[6]))).map(s => s[4]).join(','));
  const css = cssRules('site/next/p-roman.css'); check(!css.length, '① 모양 규칙(글씨 · 여백 잣대)', css.slice(0, 4).join(' | '));
  { // 방 지킴이 표(ROOMS) — 신마다 한 방 · 그 신의 자리 고리가 그 방 · 주소 → 신 셈(roomOf)
    const vals = Object.values(ROOMS), bad = [];
    for (const [key, n] of Object.entries(ROOMS)) {
      const seat = SEATS.find(x => x[4] === n); if (!seat) { bad.push(`${key} 신 ${n} 자리 없음`); continue; }
      const want = key === 's' ? null : key === 'w/*' ? /^#\/w\/[0-9A-Z]{6}$/ : key.startsWith('w/*/') ? new RegExp('^#\\/w\\/[0-9A-Z]{6}\\/' + key.slice(4) + '$') : new RegExp('^#\\/' + key.replace(/\//g, '\\/') + '$');
      if (want === null ? seat[3] !== null : !want.test(seat[3] ?? '')) bad.push(`${key} → ${n} 자리 고리 ${seat[3]}`);
    }
    check(!bad.length && new Set(vals).size === vals.length && vals.every(n => GODS[n]), '① 방 지킴이 표 = 자리 고리 · 신마다 한 방', bad.slice(0, 4).join(' | '));
    const cases = [['', '', 21], ['why', '', 43], ['why', '005930', 43], ['why', 'later', 36], ['t', '', 69], ['t', 'sprout/real', 34], ['t', 'i/x', null], ['w', '005930', 39], ['w', '005930/range', 18], ['f', 'ind', 17], ['f', 'rise', null], ['shorts', '', null], ['roman', '', null], ['s', 'x', 28], ['sage', 'socrates', 6]];
    const miss = cases.filter(([k, a, n]) => roomOf(k, a) !== n);
    check(!miss.length, '① 주소 → 방 지킴이 셈(roomOf)', JSON.stringify(miss));
    const tcss = cssRules('site/next/roman-tag.css'); check(!tcss.length, '① 이름표 모양 규칙(글씨 · 여백 잣대)', tcss.slice(0, 4).join(' | '));
    R.m.rooms = vals.length;
  }
  { // ⑦ 신 캐릭터 그림(site/next/roman-art · roman_art.mjs) · 불빛 지킴이 표(LIGHTS)
    const files = [], bad = [];
    for (let n = 1; n <= 72; n++) {
      let f = null; try { f = await fs.readFile(path.join(ROOT, 'site/next/roman-art', n + '.svg'), 'utf8'); } catch { bad.push(`${n} 파일 없음`); continue; }
      files.push(f);
      if (f !== svgOf(n)) bad.push(`${n} 기계가 그린 것과 다름(node scripts/atlas11/next/roman_art.mjs)`);
      if (/<script|<style|style=|<text|<image|<foreignObject|\son[a-z]+=|href=/i.test(f) || /http/i.test(f.replace('xmlns="http://www.w3.org/2000/svg"', ''))) bad.push(`${n} 글자 · style · 스크립트 · 바깥 고리`);
      if (Buffer.byteLength(f) > 12000) bad.push(`${n} ${Buffer.byteLength(f)}바이트(12KB 넘음)`);
      if (!f.includes(`stroke="${GROUP_BG[GODS[n][5]][1]}"`) || !f.startsWith('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120"')) bad.push(`${n} 무리 테 빛 · 그림 틀`);
      if (artOf(n) !== `/next/roman-art/${n}.svg`) bad.push(`${n} 주소 ${artOf(n)}`);
    }
    check(!bad.length && files.length === 72 && Object.keys(ART).length === 72, '⑦ 그림 일흔둘 = 기계 그림 · 글자 · style · 스크립트 · 바깥 고리 0 · 12KB 안 · 무리 테', bad.slice(0, 5).join(' | '));
    check(new Set(files).size === 72, '⑦ 그림 일흔둘이 서로 다름', 72 - new Set(files).size);
    const talk = SEATS.filter(x => x[0] === 'talk'), lb = [];
    if (Object.keys(LIGHTS).length !== 11) lb.push('불빛 ' + Object.keys(LIGHTS).length);
    talk.forEach((x, i) => { if (LIGHTS[i + 1] !== x[4] || !x[1].startsWith(`${i + 1}번 불빛`) || !GODS[x[4]]) lb.push(`${i + 1} → ${LIGHTS[i + 1]} · 자리 ${x[1]} · 신 ${x[4]}`); });
    check(!lb.length, '⑦ 불빛 지킴이 표 = SEATS 「talk」 차례(n번 불빛 → 그 자리 신)', lb.slice(0, 4).join(' | '));
    R.m.art = {n: files.length, bytes: files.reduce((a, f) => a + Buffer.byteLength(f), 0)};
  }
  R.m.seats = SEATS.length; R.m.zones = cnt; R.m.links = new Set(SEATS.map(s => s[3]).filter(Boolean)).size;
}

/* ── 브라우저 ── */
const {chromium} = require('playwright');
const browser = await chromium.launch(process.env.PW_EXE ? {executablePath: process.env.PW_EXE} : {});
const ctxOf = async (w, {font = 0, en = false} = {}) => {
  const ctx = await browser.newContext({viewport: {width: w, height: 800}, deviceScaleFactor: 1, isMobile: true, hasTouch: true, locale: en ? 'en-US' : 'ko-KR', timezoneId: 'Asia/Seoul', reducedMotion: 'reduce'});
  await ctx.addInitScript(([f]) => { try { localStorage.setItem('atlas:essence-seen', 'true'); localStorage.setItem('atlas:white-seen', 'true'); if (f) localStorage.setItem('atlas:font', String(f)); } catch { /* 기억 못 함 */ } }, [font]);
  return ctx;
};
const errsOf = p => { const e = []; p.on('pageerror', x => e.push(String(x.message).slice(0, 160))); return e; };
const ready = p => p.waitForFunction(() => !document.querySelector('#view .boot') && !!document.querySelector('#view .rm, #view .empty'), null, {timeout: 20000}).then(() => true, () => false);
const go = async (p, hash) => { await p.evaluate(h => { location.hash = h; }, hash); return ready(p); };
/** 화면 재기(화면 안에서 돎 — 바깥 이름을 쓰지 않음) — 넘침 · 작은 글 · 작은 누름 · 칸 밖 · 글씨체 · 대비 · 남은 한글(check_sage 와 같은 셈 · 라틴 이름 lang="la" 은 쓰지 않을 말 셈 밖) */
function measureInPage() {
  const v = document.querySelector('#view'), W = document.documentElement.clientWidth, out = {sw: document.documentElement.scrollWidth, cw: W, small: [], tiny: [], text: [], han: [], over: []};
  const vis = e => { const r = e.getBoundingClientRect(); if (!r.width || !r.height) return false; for (let x = e; x && x !== document.body; x = x.parentElement) { const s = getComputedStyle(x); if (s.display === 'none' || s.visibility === 'hidden') return false; } return true; };
  for (const e of v.querySelectorAll('.rm a[href], .rm button')) { if (!vis(e)) continue; const r = e.getBoundingClientRect(); if (r.width < 47.5 || r.height < 47.5) out.small.push(`${e.className} ${Math.round(r.width)}×${Math.round(r.height)} 「${e.textContent.trim().slice(0, 14)}」`); if (r.right > W + 0.5 || r.left < -0.5) out.over.push(`${e.className} ${Math.round(r.left)}~${Math.round(r.right)}`); }
  const z = parseFloat(getComputedStyle(v).zoom) || 1;
  const rgb = x => { const m = /rgba?\(([^)]+)\)/.exec(x || ''); if (!m) return null; const q = m[1].split(/[ ,/]+/).filter(Boolean).map(Number); return {r: q[0], g: q[1], b: q[2], a: q.length > 3 ? q[3] : 1}; };
  const lin = c => { c /= 255; return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; };
  const lum = c => 0.2126 * lin(c.r) + 0.7152 * lin(c.g) + 0.0722 * lin(c.b);
  const ratio = (a, b) => { const x = lum(a), y = lum(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); };
  const mix = (top, under) => ({r: top.r * top.a + under.r * (1 - top.a), g: top.g * top.a + under.g * (1 - top.a), b: top.b * top.a + under.b * (1 - top.a), a: 1});
  const bgOf = el => { const st = []; for (let e = el; e; e = e.parentElement) { const c = rgb(getComputedStyle(e).backgroundColor); if (c && c.a > 0) { st.push(c); if (c.a >= 1) break; } } let c = {r: 255, g: 255, b: 255, a: 1}; for (const x of st.reverse()) c = mix(x, c); return c; };
  out.ser = []; out.lt19 = []; out.low7 = []; out.ui3 = []; out.big = [];
  out.paper = getComputedStyle(v).backgroundColor; out.pg = document.documentElement.classList.contains('pg-roman');
  for (const e of v.querySelectorAll('.rm a[href], .rm button')) { if (!vis(e)) continue; const cs = getComputedStyle(e), own = rgb(cs.backgroundColor), around = bgOf(e.parentElement), bd = parseFloat(cs.borderTopWidth) > 0 ? rgb(cs.borderTopColor) : null;
    const edge = Math.max(own && own.a > 0 ? ratio(mix(own, around), around) : 0, bd && bd.a > 0 ? ratio(mix(bd, around), around) : 0);
    if (((own && own.a > 0 && ratio(mix(own, around), around) > 1.05) || (bd && bd.a > 0)) && edge < 3) out.ui3.push(`${e.className} ${edge.toFixed(2)} 「${e.textContent.trim().slice(0, 14)}」`); }
  for (const e of v.querySelectorAll('.rm-gn')) { const f = parseFloat(getComputedStyle(e).fontSize) * z; if (f < 23.9) out.big.push(`${e.textContent.trim().slice(0, 12)} ${f}px`); }
  const w = document.createTreeWalker(v, NodeFilter.SHOW_TEXT);
  for (let n = w.nextNode(); n; n = w.nextNode()) {
    const el = n.parentElement, t = n.nodeValue.trim(); if (!t || !el || !el.closest('.rm') || !vis(el)) continue;
    const fs = parseFloat(getComputedStyle(el).fontSize) * z; if (fs < 16.9) out.tiny.push(`${t.slice(0, 16)} ${fs}px`);
    { const cs = getComputedStyle(el), fam = cs.fontFamily, fg = rgb(cs.color), bg = bgOf(el), first = fam.split(',')[0].trim().replace(/["']/g, '');
      if (/gowun|batang|바탕/i.test(fam) || /^serif$/i.test(first)) out.ser.push(`${t.slice(0, 12)} ${first}`);
      if (fs < 18.9) out.lt19.push(`${t.slice(0, 16)} ${fs}px`);
      if (fg) { const c = ratio(mix(fg, bg), bg); if (c < 7) out.low7.push(`${el.className || el.tagName} ${c.toFixed(2)} 「${t.slice(0, 14)}」`); } }
    if (!el.closest('#view [lang="la"]')) out.text.push(t);
    if (/[가-힣ㄱ-ㅎㅏ-ㅣ]/.test(t) && !el.closest('[lang="ko"]')) out.han.push(t.slice(0, 40));
    const cs = getComputedStyle(el); if (el.scrollWidth > el.clientWidth + 1 && cs.overflowX === 'visible' && cs.display !== 'inline') out.over.push(`${el.className || el.tagName} 「${t.slice(0, 16)}」 ${el.scrollWidth}>${el.clientWidth}`);
  }
  return out;
}
const MEASURE = p => p.evaluate(measureInPage).catch(e => ({err: String(e.message)}));
const judge = (tag, m, {en = false} = {}) => {
  if (m.err) return check(false, `${tag} 재기`, m.err);
  check(m.sw <= m.cw, `${tag} 가로 넘침 0`, `${m.sw}>${m.cw}`);
  check(!m.small.length, `${tag} 누르는 것 48 넘게`, m.small.slice(0, 3).join(' | '));
  check(!m.tiny.length, `${tag} 글 17px 넘게`, m.tiny.slice(0, 3).join(' | '));
  check(!m.over.length, `${tag} 칸 밖 · 칸 안 넘친 글 0`, m.over.slice(0, 3).join(' | '));
  check(!m.ser.length, `${tag} 바탕체 0 · 글씨체 하나`, m.ser.slice(0, 3).join(' | '));
  check(!m.lt19.length, `${tag} 글 19px 넘게`, m.lt19.slice(0, 3).join(' | '));
  check(!m.big.length, `${tag} 신 이름 24px 넘게`, m.big.slice(0, 3).join(' | '));
  check(!m.low7.length, `${tag} 글 대비 7 넘게`, m.low7.slice(0, 3).join(' | '));
  check(!m.ui3.length, `${tag} 누르는 것 테 대비 3 넘게`, m.ui3.slice(0, 3).join(' | '));
  check(m.pg && /^rgb\(253, 249, 245\)$/.test(m.paper), `${tag} 밝은 종이 바탕`, `${m.pg} ${m.paper}`);
  if (!en) { const hit = screenHits(m.text.join('\n')); check(!hit.length, `${tag} 쓰지 않을 말 0`, hit.join(' ')); check(m.text.length > 300, `${tag} 잰 글 수`, m.text.length); }
  else check(!m.han.length, `${tag} 남은 한글 0`, m.han.slice(0, 3).join(' | '));
};
/** 카드 일흔둘 읽기(화면 안) */
const readCards = p => p.evaluate(() => [...document.querySelectorAll('#view .rm-card')].map(c => ({
  tag: c.tagName.toLowerCase(), href: c.querySelector('a.rm-goa')?.getAttribute('href') ?? null, goT: c.querySelector('a.rm-goa')?.textContent.replace(/\s+/g, '') ?? null, no: c.querySelector('.rm-no')?.textContent.trim() ?? null, links: c.querySelectorAll('a').length, n: +c.dataset.n, zone: c.closest('section.rm-zone')?.id ?? null,
  spot: c.querySelector('.rm-spot')?.textContent.trim(), name: c.querySelector('.rm-gn')?.textContent.trim(), la: c.querySelector('.rm-la')?.textContent.trim() ?? null,
  laLang: c.querySelector('.rm-la')?.getAttribute('lang') ?? null, one: c.querySelector('.rm-one')?.textContent.trim(), wl: c.querySelector('.rm-wl')?.textContent.trim(),
  why: c.querySelector('.rm-wt')?.textContent.trim(), grp: c.querySelector('.rm-grp')?.textContent.trim(),
  av: c.querySelector('.rm-god > button.rm-av > img')?.getAttribute('src') ?? null, avAlt: c.querySelector('.rm-god > button.rm-av > img')?.getAttribute('alt') ?? null,
  avL: c.querySelector('.rm-god > button.rm-av')?.getAttribute('aria-label') ?? null, avP: c.querySelector('.rm-god > button.rm-av')?.getAttribute('aria-pressed') ?? null, nest: !!c.querySelector('a button, button a')})));
const cardsOk = (cards, en) => {
  const bad = [];
  if (cards.length !== 72) bad.push('카드 ' + cards.length);
  SEATS.forEach((s, i) => {
    const c = cards[i], g = GODS[s[4]]; if (!c) return;
    const want = en
      ? {spot: fillEn(s[2]), name: g[2], la: g[1] !== g[2] ? g[1] : null, one: g[4], why: fillEn(s[6]), grp: GROUPS[g[5] - 1][1], wl: WHY.en}
      : {spot: fillKo(s[1]), name: g[0], la: g[1], one: g[3], why: fillKo(s[5]), grp: GROUPS[g[5] - 1][0], wl: WHY.ko};
    for (const [k, v] of Object.entries(want)) if (c[k] !== v) bad.push(`${i + 1} ${k} 「${c[k]}」 ≠ 「${v}」`);
    if (c.n !== s[4]) bad.push(`${i + 1} 신 번호 ${c.n} ≠ ${s[4]}`);
    if (c.zone !== 'rm-z-' + s[0]) bad.push(`${i + 1} 무리 ${c.zone}`);
    if (c.tag !== 'div' || c.nest || (s[3] ? (c.href !== s[3] || c.links !== 1 || c.goT !== (en ? 'Gothere›' : '가보기›')) : (c.href !== null || c.links !== 0 || c.no !== (en ? 'No page of its own' : '제 쪽이 따로 없어요')))) bad.push(`${i + 1} 고리 ${c.tag} ${c.href} 「${c.goT}」 「${c.no}」 ≠ ${s[3]}`); // 카드 = 칸 · 고리는 「가 보기 ›」 하나(order-1558 — 얼굴 단추와 나눔)
    if (c.la !== null && c.laLang !== 'la') bad.push(`${i + 1} 라틴 이름 말(lang)`);
    if (c.av !== artOf(s[4]) || c.avAlt !== '') bad.push(`${i + 1} 얼굴 ${c.av} · 이름 「${c.avAlt}」`); // 신 캐릭터 그림(order-1332) — 이름이 바로 옆이라 그림 이름은 비움
    if (c.avL !== (en ? `Hear ${g[2]}’s story` : `${g[0]} 이야기 듣기`) || c.avP !== 'false') bad.push(`${i + 1} 얼굴 단추 읽는 이름 「${c.avL}」 · 눌림 ${c.avP}`); // 얼굴 = 듣기 단추(order-1558)
  });
  return bad;
};

try {
  // ② 쪽 세 폭 + 아주 크게
  for (const [w, font] of [[320, 0], [360, 0], [390, 0], [320, 2]]) {
    const tag = `② ${w}${font ? ' 아주 크게' : ''}`, ctx = await ctxOf(w, {font}), p = await ctx.newPage(), errs = errsOf(p);
    await p.goto(URL_OF('#/roman'), {waitUntil: 'load', timeout: 60000});
    if (!await ready(p)) { check(false, `${tag} 쪽`, '안 그려짐'); await ctx.close(); continue; }
    const s = await p.evaluate(() => ({h1: document.querySelector('#view h1')?.textContent.trim(), zones: [...document.querySelectorAll('#view section.rm-zone')].map(e => e.id),
      jumps: [...document.querySelectorAll('#view .rm-jump')].map(b => [b.dataset.z, b.querySelector('b')?.textContent.trim(), b.querySelector('.rm-jc')?.textContent.trim()]),
      safe: document.querySelector('#view .rm .safe')?.textContent.trim(), title: document.title, kk: document.querySelectorAll('#view .rm-zone .kk-box').length}));
    check(s.h1 === '로마 신 72', `${tag} 제목`, s.h1);
    check(s.zones.join() === ZONES.map(z => 'rm-z-' + z.id).join(), `${tag} 무리 여덟(차례)`, s.zones.join());
    check(s.jumps.length === 8 && s.jumps.every((j, k) => j[0] === ZONES[k].id && j[1] === fillKo(ZONES[k].name[0]) && j[2] === `${ZCOUNT[ZONES[k].id]}자리`), `${tag} 무리 단추 여덟(이름 · 자리 수)`, JSON.stringify(s.jumps[0]));
    const bad = cardsOk(await readCards(p), false);
    check(!bad.length, `${tag} 카드 일흔둘 = 자료(차례 · 자리 · 신 · 라틴 · 한 줄 · 왜 여기 · 무리 · 고리)`, bad.slice(0, 4).join(' | '));
    check(s.safe === SAFE, `${tag} 안전 문장`, s.safe);
    check(s.title === '로마 신 72 · ' + NEW_NAME, `${tag} 창 제목`, s.title);
    check(s.kk === 8, `${tag} 무리마다 카톡 단추 하나`, s.kk);
    judge(tag, await MEASURE(p));
    if (w === 390 && !font) { // ⑦ 얼굴 일흔둘 — 서버가 그림 꼴로 줌 · 내려 보면 모두 그려짐(화면 가까이 올 때 받음 · 사진 찍기 전에)
      // 한 번에 여섯 장씩 · 장마다 세 번까지(진짜 사이트 큰 검사 3/11 — 일흔두 장을 한꺼번에 부르니 한 장이 30초 넘게 안 옴 · 2026-10-31 15:17)
      const getArt = async k => { let last = ''; for (let t = 0; t < 3; t++) { try { const r = await p.request.get(base + artOf(k), {timeout: 30000}); if (r.ok() && /image\/svg\+xml/.test(r.headers()['content-type'] ?? '')) return null; last = `${k} ${r.status()} ${r.headers()['content-type']}`; } catch (e) { last = `${k} ${String(e.message).split('\n')[0]}`; } await new Promise(r => setTimeout(r, 1500)); } return last; };
      const srv = []; for (let i = 0; i < 72; i += 6) srv.push(...await Promise.all(Array.from({length: Math.min(6, 72 - i)}, (_, j) => getArt(i + j + 1))));
      check(!srv.filter(Boolean).length, '⑦ 서버가 그림 일흔둘을 그림 꼴(image/svg+xml)로 줌', srv.filter(Boolean).slice(0, 3).join(' | '));
      const im = await p.evaluate(async () => { for (let y = 0, H = document.documentElement.scrollHeight; y < H; y += 500) { scrollTo(0, y); await new Promise(r => setTimeout(r, 80)); }
        const a = [...document.querySelectorAll('#view .rm-av img')]; for (let i = 0; i < 100 && a.some(x => !(x.complete && x.naturalWidth > 0)); i++) await new Promise(r => setTimeout(r, 100));
        scrollTo(0, 0); return {n: a.length, ok: a.filter(x => x.complete && x.naturalWidth > 0).length, w: [...new Set(a.map(x => Math.round(x.getBoundingClientRect().width)))]}; });
      check(im.n === 72 && im.ok === 72 && im.w.join() === '64', '⑦ 내려 보면 얼굴 일흔둘이 모두 그려짐(64px)', JSON.stringify(im));
    }
    if (w === 390 && !font && OUT) { // 결과 폴더에 사진 셋(깃허브 결과와 함께 main 에 남음 — 끝 보고 그림) — 머리 · 말하는 불빛 무리 · 다른 쪽 무리
      const shot = async (name, sel) => { if (sel) await p.evaluate(q => { const e = document.querySelector(q); if (e) window.scrollTo(0, e.getBoundingClientRect().top + window.scrollY - 70); }, sel); await p.waitForTimeout(250); await p.screenshot({path: path.join(path.dirname(OUT), name), type: 'jpeg', quality: 70}).catch(() => {}); };
      await shot('roman-top.jpg', null); await shot('roman-talk.jpg', '#rm-z-talk'); await shot('roman-more.jpg', '#rm-z-more .rm-grid'); await p.evaluate(() => window.scrollTo(0, 0));
    }
    if (w === 390 && !font) {
      for (let i = 0; i < 40; i++) { await p.keyboard.press('Tab'); if (await p.evaluate(() => !!document.activeElement?.closest('#view .rm'))) break; }
      const fr = await p.evaluate(() => {
        const e = document.activeElement; if (!e?.closest('#view .rm')) return {ok: false, why: '글판 안에 초점이 안 감 ' + (e?.tagName ?? '')};
        const rgb = x => { const m = /rgba?\(([^)]+)\)/.exec(x || ''); if (!m) return null; const q = m[1].split(/[ ,/]+/).filter(Boolean).map(Number); return {r: q[0], g: q[1], b: q[2], a: q.length > 3 ? q[3] : 1}; };
        const lin = c => { c /= 255; return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; }, lum = c => 0.2126 * lin(c.r) + 0.7152 * lin(c.g) + 0.0722 * lin(c.b);
        let bg = null; for (let x = e.parentElement; x; x = x.parentElement) { const c = rgb(getComputedStyle(x).backgroundColor); if (c && c.a >= 1) { bg = c; break; } }
        const cs = getComputedStyle(e), oc = rgb(cs.outlineColor), on = cs.outlineStyle !== 'none' && parseFloat(cs.outlineWidth) > 0;
        if (!on || !oc || !bg) return {ok: false, why: `테 없음 ${cs.outlineStyle} ${cs.outlineWidth}`};
        const a = lum(oc), b = lum(bg), r = (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
        return {ok: r >= 3, why: `${e.className} 테 ${cs.outlineColor} · ${r.toFixed(2)}`};
      });
      check(fr.ok, `${tag} 초점 테 대비 3 넘게`, fr.why);
      for (const zid of ['talk', 'co', 'more']) {
        await p.locator(`#view .rm-jump[data-z="${zid}"]`).click(); await p.waitForTimeout(700);
        const top = await p.evaluate(id => document.getElementById('rm-z-' + id)?.getBoundingClientRect().top, zid);
        check(top != null && top >= 0 && top < 200, `${tag} 무리 단추 → ${zid} 가 화면 위`, top);
      }
    }
    check(!errs.length, `${tag} 화면 오류 0`, errs.join(' | ')); await ctx.close();
  }

  // ③ 고리 — 카드가 가는 길마다 열어 봄 · 카드 누름
  {
    const ctx = await ctxOf(390), p = await ctx.newPage(), errs = errsOf(p);
    await p.goto(URL_OF('#/roman'), {waitUntil: 'load', timeout: 60000}); await ready(p);
    const hrefs = [...new Set(SEATS.map(s => s[3]).filter(Boolean))];
    for (const hr of hrefs) {
      await p.evaluate(h => { location.hash = h; }, hr);
      const ok = await p.waitForFunction(() => !document.querySelector('#view .boot') && document.querySelector('#view')?.children.length > 0 && !document.querySelector('#view .rm'), null, {timeout: 20000}).then(() => true, () => false);
      await p.waitForTimeout(150);
      const s = await p.evaluate(() => ({hash: location.hash, h1: document.querySelector('#view h1')?.textContent.trim() ?? '', title: document.title, pg: document.documentElement.classList.contains('pg-roman'), n: document.querySelectorAll('#view *').length}));
      check(ok && s.hash === hr, `③ ${hr} 열림 · 주소 그대로`, `${ok} ${s.hash}`);
      check(s.n > 5 && !/없는 (주소|회사|채널)/.test(s.h1 + s.title), `③ ${hr} 쪽이 그려짐`, `${s.h1} · ${s.title} · ${s.n}`);
      check(!s.pg, `③ ${hr} 종이 판 꺼짐`, s.pg);
      await p.evaluate(() => { location.hash = '#/roman'; }); await ready(p);
    }
    check(!errs.length, '③ 고리 화면 오류 0', errs.join(' | '));
    // 카드 누름 — 서른아홉 스승 카드 → #/sage
    await p.evaluate(() => { location.hash = '#/roman'; }); await ready(p);
    const card = p.locator('#view .rm-card a.rm-goa[href="#/sage"]'); await card.scrollIntoViewIfNeeded(); await card.click(); // 「가 보기 ›」(order-1558 — 카드 전체 고리 대신)
    check(await p.waitForFunction(() => location.hash === '#/sage' && document.querySelectorAll('#view .sg-tile').length > 0, null, {timeout: 10000}).then(() => true, () => false), '③ 서른아홉 스승 카드 「가 보기」 누름 → 그 쪽');
    R.m.linkPages = hrefs.length; await ctx.close();
  }

  // ④ 영어
  {
    const ctx = await ctxOf(390, {en: true}), p = await ctx.newPage(), errs = errsOf(p);
    await p.goto(URL_OF('#/roman', '&lang=en'), {waitUntil: 'load', timeout: 60000});
    if (await ready(p)) {
      await p.waitForTimeout(300);
      const s = await p.evaluate(() => ({h1: document.querySelector('#view h1')?.textContent.trim(), lang: document.documentElement.lang, title: document.title,
        jumps: [...document.querySelectorAll('#view .rm-jump b')].map(e => e.textContent.trim()), why: document.querySelector('#view .rm-wl')?.textContent.trim()}));
      check(s.h1 === '72 Roman Gods' && s.lang === 'en', '④ 제목 · html lang', `${s.h1} · ${s.lang}`);
      check(!HAN.test(s.title) && s.title.startsWith('72 Roman Gods'), '④ 창 제목 영어', s.title);
      check(s.jumps.join('|') === ZONES.map(z => fillEn(z.name[1])).join('|'), '④ 무리 이름 영어', s.jumps.join('|'));
      const bad = cardsOk(await readCards(p), true);
      check(!bad.length, '④ 카드 일흔둘 영어 글 = 자료', bad.slice(0, 4).join(' | '));
      judge('④ 영어', await MEASURE(p), {en: true});
    } else check(false, '④ 영어 쪽', '안 그려짐');
    check(!errs.length, '④ 화면 오류 0', errs.join(' | ')); await ctx.close();
  }

  // ⑤ 길 — 둘이 단추 안 · 아래 단추 · 종이 판 · 영어 이름 · 꼬리 주소
  {
    const ctx = await ctxOf(390), p = await ctx.newPage(), errs = errsOf(p);
    await p.goto(URL_OF('#/dori'), {waitUntil: 'load', timeout: 60000});
    await p.waitForFunction(() => !!document.querySelector('#view .dm a[href="#/roman"]'), null, {timeout: 15000}).catch(() => {});
    const dm = await p.evaluate(() => { const a = [...document.querySelectorAll('#view .dm a')]; const i = a.findIndex(x => x.getAttribute('href') === '#/roman'); return {i, text: a[i]?.textContent.trim(), prev: a[i - 1]?.getAttribute('href'), h: a[i]?.getBoundingClientRect().height}; });
    check(dm.i >= 0 && dm.text?.startsWith('로마 신 72'), '⑤ 둘이 단추 안 「로마 신 72」', JSON.stringify(dm));
    check(dm.prev === '#/sage', '⑤ 서른아홉 스승 다음 줄', dm.prev);
    check(dm.h >= 47.5, '⑤ 줄 높이 48 넘게', dm.h);
    if (dm.i >= 0) { await p.locator('#view .dm a[href="#/roman"]').click(); check(await p.waitForFunction(() => document.querySelectorAll('#view .rm-card').length === 72, null, {timeout: 10000}).then(() => true, () => false), '⑤ 둘이 단추 안 → 로마 신 72'); }
    if (OUT) { await go(p, '#/dori'); await p.waitForTimeout(200); await p.screenshot({path: path.join(path.dirname(OUT), 'roman-dori.jpg'), type: 'jpeg', quality: 70}).catch(() => {}); await go(p, '#/roman'); }
    const tab = await p.evaluate(() => document.querySelector('.tabs a[data-tab="dori"]')?.getAttribute('aria-current'));
    check(tab === 'page', '⑤ 아래 단추 「둘이」가 지금 쪽', tab);
    const paper = () => p.evaluate(() => ({pg: document.documentElement.classList.contains('pg-roman'), sage: document.documentElement.classList.contains('pg-sage'), bg: getComputedStyle(document.querySelector('#view')).backgroundColor}));
    const on = await paper(); check(on.pg && !on.sage && on.bg === 'rgb(253, 249, 245)', '⑤ 로마 신 72에서 종이 판 켜짐', JSON.stringify(on));
    await go(p, '#/dori'); await p.waitForFunction(() => !!document.querySelector('#view .dm'), null, {timeout: 8000}).catch(() => {});
    const off = await paper(); check(!off.pg && off.bg !== 'rgb(253, 249, 245)', '⑤ 다른 쪽(#/dori)으로 가면 종이 판 꺼짐', JSON.stringify(off));
    await go(p, '#/roman/nobody'); await p.waitForTimeout(100);
    check(await p.evaluate(() => document.querySelectorAll('#view .rm-card').length) === 72, '⑤ 모르는 꼬리 주소(#/roman/nobody)도 같은 쪽');
    check(!errs.length, '⑤ 화면 오류 0', errs.join(' | ')); await ctx.close();
    const c2 = await ctxOf(390, {en: true}), q = await c2.newPage(), e2 = errsOf(q);
    await q.goto(URL_OF('#/dori', '&lang=en'), {waitUntil: 'load', timeout: 60000});
    await q.waitForFunction(() => !!document.querySelector('#view .dm a[href="#/roman"]'), null, {timeout: 15000}).catch(() => {}); await q.waitForTimeout(300);
    const en = await q.evaluate(() => document.querySelector('#view .dm a[href="#/roman"]')?.textContent.trim());
    check(en?.startsWith('72 Roman Gods') && !HAN.test(en), '⑤ 영어 둘이 단추 안 「72 Roman Gods」', en);
    check(!e2.length, '⑤ 영어 화면 오류 0', e2.join(' | ')); await c2.close();
  }

  // ⑥ 방 지킴이 이름표 — 방마다(390) · 없는 쪽 · 누름 → 그 신 카드 · 영어 · 아주 크게 320
  {
    const routeOf = key => (key === '' ? '#/' : key === 's' ? '#/s/ZZZZZZ/2026-13-40/0/s' : key === 'w/*' ? '#/w/005930' : key.startsWith('w/*/') ? '#/w/005930/' + key.slice(4) : '#/' + key);
    const readTag = q => q.evaluate(() => {
      const e = document.querySelector('#view > .rmt'); if (!e) return null;
      const pill = e.querySelector('.rmt-p'), k = e.querySelector('a.rmt-k'), f = e.querySelector('button.rms-face'), fr = f?.getBoundingClientRect(), kr = k?.getBoundingClientRect();
      const r = (pill ?? e).getBoundingClientRect(), kk = document.querySelector('#view > .kk-pgrow'), z = parseFloat(getComputedStyle(document.querySelector('#view')).zoom) || 1;
      return {n: document.querySelectorAll('#view .rmt').length, href: k?.getAttribute('href') ?? null, label: e.querySelector('.rmt-l')?.textContent.trim(), name: e.querySelector('.rmt-n')?.textContent.trim(),
        im: f?.querySelector('img')?.getAttribute('src') ?? null, imAlt: f?.querySelector('img')?.getAttribute('alt') ?? null, faceL: f?.getAttribute('aria-label') ?? null, faceH: fr ? Math.round(Math.min(fr.width, fr.height)) : 0, linkH: kr ? Math.round(kr.height) : 0, linkW: kr ? Math.round(kr.width) : 0,
        cap: e.querySelector('.rms-cap')?.hidden ?? null, nest: !!e.querySelector('a button, button a'),
        h: Math.round(r.height), left: Math.round(r.left), right: Math.round(r.right), vw: document.documentElement.clientWidth, sw: document.documentElement.scrollWidth,
        fs: Math.min(...[...e.querySelectorAll('span, b')].map(x => parseFloat(getComputedStyle(x).fontSize) * z)), kkAfter: kk ? !!(e.compareDocumentPosition(kk) & Node.DOCUMENT_POSITION_FOLLOWING) : null};
    });
    const waitTag = (q, n) => q.waitForFunction(n => document.querySelector('#view > .rmt')?.dataset.n === String(n), n, {timeout: 15000}).then(() => true, () => false);
    const tagOk = (tag, s, n, en = false) => {
      check(!!s, `${tag} 이름표 있음`, 'null');
      if (!s) return;
      check(s.n === 1, `${tag} 이름표 하나`, s.n);
      check(s.href === '#/roman/' + n && s.label === (en ? 'Room guardian' : '이 방 지킴이') && s.name === (en ? GODS[n][2] : GODS[n][0]), `${tag} 이름 · 고리 = 자료`, `${s.label} · ${s.name} · ${s.href}`);
      check(s.h >= 47.5 && s.fs >= 16.9 && s.left >= 0 && s.right <= s.vw + 0.5 && s.sw <= s.vw, `${tag} 48px · 17px · 화면 안`, JSON.stringify(s));
      check(s.kkAfter !== false, `${tag} 카톡 쪽 줄 위`, s.kkAfter);
      check(s.im === artOf(n) && s.imAlt === '', `${tag} 얼굴 = 그 방 신 그림(이름 비움 · order-1332)`, `${s.im} 「${s.imAlt}」`);
      check(s.faceL === (en ? `Hear ${GODS[n][2]}’s story` : `${GODS[n][0]} 이야기 듣기`) && s.faceH >= 47.5 && s.linkH >= 47.5 && s.linkW >= 47.5 && s.cap === true && !s.nest, `${tag} 얼굴 = 듣기 단추 · 이름 고리 48px · 글상자 숨김 · 단추와 고리 나눔(order-1558)`, `${s.faceL} ${s.faceH} ${s.linkH}×${s.linkW} 글상자 ${s.cap} 겹침 ${s.nest}`);
    };
    const tagImg = q => q.evaluate(async () => { const e = document.querySelector('#view > .rmt'); e?.scrollIntoView({block: 'center'}); const im = e?.querySelector('button.rms-face img'); for (let i = 0; i < 40 && im && !(im.complete && im.naturalWidth > 0); i++) await new Promise(r => setTimeout(r, 100)); return !!im && im.complete && im.naturalWidth > 0; });
    const ctx = await ctxOf(390), p = await ctx.newPage(), errs = errsOf(p);
    await p.goto(URL_OF('#/dori'), {waitUntil: 'load', timeout: 60000}); await p.waitForTimeout(300);
    for (const [key, n] of Object.entries(ROOMS)) {
      const hr = routeOf(key), tag = `⑥ ${hr}`;
      await p.evaluate(h => { location.hash = h; }, hr);
      const ok = await waitTag(p, n); await p.waitForTimeout(ok ? 1700 : 0); // 늦게 붙는 줄(다음 한 줄 · 카톡 줄 · 쿠폰 칸)이 다 붙은 뒤 자리를 봄
      tagOk(tag, await readTag(p), n);
    }
    for (const hr of ['#/roman', '#/shorts', '#/f/rise']) {
      await p.evaluate(h => { location.hash = h; }, hr); await p.waitForTimeout(2500);
      check(await p.evaluate(() => document.querySelectorAll('#view .rmt').length) === 0, `⑥ ${hr} 이름표 없음(지킴이 없는 쪽)`);
    }
    // 누름 — 서른아홉 스승 이름표 → #/roman/6 · 그 카드가 화면 안 · 테
    await p.evaluate(() => { location.hash = '#/sage'; }); await waitTag(p, ROOMS.sage);
    await p.locator('#view > .rmt a.rmt-k').scrollIntoViewIfNeeded(); await p.locator('#view > .rmt a.rmt-k').click(); // 이름 고리(얼굴은 듣기 단추 — order-1558)
    const ok = await p.waitForFunction(n => { const c = document.querySelector(`#view .rm-card[data-n="${n}"]`); if (!c || !c.classList.contains('rm-on')) return false; const r = c.getBoundingClientRect(); return r.top >= 0 && r.bottom <= innerHeight; }, ROOMS.sage, {timeout: 8000}).then(() => true, () => false);
    check(ok && await p.evaluate(() => location.hash) === '#/roman/' + ROOMS.sage, '⑥ 이름표 누름 → 로마 신 72 그 신 카드(화면 안 · 테)', await p.evaluate(() => location.hash));
    check(!errs.length, '⑥ 화면 오류 0', errs.join(' | ')); await ctx.close();
    // 바로 연 #/roman/<번호> — 첫 화면 문 지킴이(포르투누스) 카드
    const c3 = await ctxOf(390), q3 = await c3.newPage(), e3 = errsOf(q3);
    await q3.goto(URL_OF('#/roman/' + ROOMS['']), {waitUntil: 'load', timeout: 60000}); await ready(q3);
    const ok3 = await q3.waitForFunction(n => { const c = document.querySelector(`#view .rm-card[data-n="${n}"]`); if (!c || !c.classList.contains('rm-on')) return false; const r = c.getBoundingClientRect(); return r.top >= 0 && r.bottom <= innerHeight; }, ROOMS[''], {timeout: 8000}).then(() => true, () => false);
    check(ok3, '⑥ 바로 연 #/roman/<번호> — 그 신 카드가 화면 안 · 테');
    check(!e3.length, '⑥ 바로 연 쪽 화면 오류 0', e3.join(' | ')); await c3.close();
    // 영어 · 아주 크게 320 — 세 쪽
    for (const [w, font, en] of [[390, 0, true], [320, 2, false]]) {
      const c4 = await ctxOf(w, {font, en}), q4 = await c4.newPage(), e4 = errsOf(q4);
      await q4.goto(URL_OF('#/dori', en ? '&lang=en' : ''), {waitUntil: 'load', timeout: 60000}); await q4.waitForTimeout(300);
      for (const key of ['sage', 'w/*/past', 't/picks']) {
        const hr = routeOf(key), n = ROOMS[key];
        await q4.evaluate(h => { location.hash = h; }, hr); const okk = await waitTag(q4, n); await q4.waitForTimeout(okk ? 1200 : 0);
        tagOk(`⑥ ${en ? '영어' : `${w} 아주 크게`} ${hr}`, await readTag(q4), n, en);
        check(await tagImg(q4), `⑥ ${en ? '영어' : `${w} 아주 크게`} ${hr} 얼굴 그림이 그려짐`);
      }
      check(!e4.length, `⑥ ${en ? '영어' : '아주 크게'} 화면 오류 0`, e4.join(' | ')); await c4.close();
    }
  }
  // ⑦ 첫 화면 말하는 불빛 지킴이(order-1332) — 불빛 열하나 · 누름 → 그 신 카드 · 영어 · 아주 크게 320
  {
    const readGod = q => q.evaluate(() => {
      const x = document.querySelector('#view section.nh-hero details.y11-box[open] > .y11-x'), w = x?.querySelector('.y11-bub .y11-gw'), g = w?.querySelector('.y11-god'), k = g?.querySelector('a.y11-gk'), f = g?.querySelector('button.rms-face'); if (!g || !k) return null;
      const r = k.getBoundingClientRect(), fr = f?.getBoundingClientRect(), im = f?.querySelector('img'), z = parseFloat(getComputedStyle(document.querySelector('#view')).zoom) || 1;
      return {href: k.getAttribute('href'), n: w.dataset.n, faceL: f?.getAttribute('aria-label') ?? null, faceH: fr ? Math.round(Math.min(fr.width, fr.height)) : 0, cap: w.querySelector('.rms-cap')?.hidden ?? null, nest: !!w.querySelector('a button, button a'), label: g.querySelector('.y11-gl')?.textContent.trim(), name: g.querySelector('.y11-gn')?.textContent.trim(), src: im?.getAttribute('src') ?? null, alt: im?.getAttribute('alt') ?? null,
        h: Math.round(r.height), w: Math.round(r.width), left: Math.round(r.left), right: Math.round(r.right), vw: document.documentElement.clientWidth, sw: document.documentElement.scrollWidth,
        fs: Math.min(...[...g.querySelectorAll('span, b')].map(e => parseFloat(getComputedStyle(e).fontSize) * z)), first: x.querySelector('.y11-bb')?.firstElementChild === w, pressed: x.querySelector('.y11-lamp[aria-pressed="true"]')?.dataset.k ?? null};
    });
    const godImg = q => q.evaluate(async () => { const im = document.querySelector('#view details.y11-box[open] .y11-god button.rms-face img'); im?.scrollIntoView({block: 'center'}); for (let i = 0; i < 40 && im && !(im.complete && im.naturalWidth > 0); i++) await new Promise(r => setTimeout(r, 100)); return !!im && im.complete && im.naturalWidth > 0; });
    const openTalk = async q => { const s = q.locator('#view section.nh-hero details.y11-box > summary').first(); if (!await s.count()) return false; await s.scrollIntoViewIfNeeded(); await s.click();
      return q.locator('#view section.nh-hero details.y11-box[open] > .y11-x .y11-bd').first().waitFor({state: 'attached', timeout: 15000}).then(() => true, () => false); };
    const press = async (q, k) => { const b = q.locator(`#view section.nh-hero details.y11-box[open] > .y11-x .y11-lamp[data-k="${k}"]`).first(); await b.scrollIntoViewIfNeeded(); await b.click(); await q.waitForTimeout(120); };
    const godOk = (tag, g, k, en = false) => {
      const n = LIGHTS[k];
      check(!!g, `${tag} 지킴이 있음`, 'null'); if (!g) return;
      check(g.pressed === String(k) && g.href === '#/roman/' + n && g.n === String(n) && g.label === (en ? 'Guardian' : '지킴이') && g.name === (en ? GODS[n][2] : GODS[n][0]), `${tag} 지킴이 = 그 불빛 자리 신`, `${g.pressed} · ${g.label} · ${g.name} · ${g.href}`);
      check(g.src === artOf(n) && g.alt === '' && g.first, `${tag} 얼굴 = 그 신 그림 · 말풍선 맨 위`, `${g.src} 「${g.alt}」 ${g.first}`);
      check(g.h >= 47.5 && g.w >= 47.5 && g.fs >= 16.9 && g.left >= 0 && g.right <= g.vw + 0.5 && g.sw <= g.vw, `${tag} 48px · 17px · 화면 안`, JSON.stringify(g));
      if (en) check(!HAN.test(`${g.label}${g.name}`), `${tag} 영어 한글 0`, `${g.label} ${g.name}`);
      check(g.faceL === (en ? `Hear ${GODS[n][2]}’s story` : `${GODS[n][0]} 이야기 듣기`) && g.faceH >= 47.5 && g.cap === true && !g.nest, `${tag} 얼굴 = 듣기 단추 · 글상자 숨김 · 단추와 고리 나눔(order-1558)`, `${g.faceL} ${g.faceH} 글상자 ${g.cap} 겹침 ${g.nest}`);
    };
    const ctx = await ctxOf(390), p = await ctx.newPage(), errs = errsOf(p);
    await p.goto(URL_OF('#/'), {waitUntil: 'load', timeout: 60000}); await p.waitForTimeout(800);
    if (!await openTalk(p)) check(false, '⑦ 첫 화면 말하는 불빛 판', '안 열림');
    else {
      for (let k = 1; k <= 11; k++) { await press(p, k); godOk(`⑦ 불빛 ${k}`, await readGod(p), k); }
      check(await godImg(p), '⑦ 불빛 지킴이 얼굴 그림이 그려짐');
      if (OUT) { await p.waitForTimeout(250); await p.screenshot({path: path.join(path.dirname(OUT), 'roman-light.jpg'), type: 'jpeg', quality: 70}).catch(() => {}); }
      const n = LIGHTS[11]; await p.locator('#view details.y11-box[open] .y11-god a.y11-gk').first().click(); // 마지막에 고른 11번 불빛 지킴이 이름 고리(얼굴은 듣기 단추 — order-1558)
      const ok = await p.waitForFunction(n => { const c = document.querySelector(`#view .rm-card[data-n="${n}"]`); if (!c || !c.classList.contains('rm-on')) return false; const r = c.getBoundingClientRect(); return r.top >= 0 && r.bottom <= innerHeight; }, n, {timeout: 8000}).then(() => true, () => false);
      check(ok && await p.evaluate(() => location.hash) === '#/roman/' + n, '⑦ 지킴이 누름 → 로마 신 72 그 신 카드(화면 안 · 테)', await p.evaluate(() => location.hash));
    }
    check(!errs.length, '⑦ 화면 오류 0', errs.join(' | ')); await ctx.close();
    for (const [w, font, en] of [[390, 0, true], [320, 2, false]]) {
      const c5 = await ctxOf(w, {font, en}), q5 = await c5.newPage(), e5 = errsOf(q5), tag = `⑦ ${en ? '영어' : `${w} 아주 크게`}`;
      await q5.goto(URL_OF('#/', en ? '&lang=en' : ''), {waitUntil: 'load', timeout: 60000}); await q5.waitForTimeout(800);
      if (!await openTalk(q5)) { check(false, `${tag} 말하는 불빛 판`, '안 열림'); await c5.close(); continue; }
      for (const k of [1, 8, 10]) { await press(q5, k); godOk(`${tag} 불빛 ${k}`, await readGod(q5), k, en); }
      check(!e5.length, `${tag} 화면 오류 0`, e5.join(' | ')); await c5.close();
    }
  }
  // ⑧ 얼굴 듣기(order-1558) — 가짜 소리로 읽은 글 · 글상자 · 멈춤 · 영어 · 소리 없는 휴대폰
  {
    const storyKo = n => { const g = GODS[n], s = SEATS.find(x => x[4] === n); return `${g[0]}. ${g[3]} ${fillKo(s[5])}`; }; // 카드 글 그대로(따로 셈 — roman-say.js storyOf 와 맞댐)
    const storyEn = n => { const g = GODS[n], s = SEATS.find(x => x[4] === n); return `${g[2]}. ${g[4]} ${fillEn(s[6])}`; };
    const FAKE = () => { // 가짜 소리 — 읽은 글 · 말 · 빠르기 · 높이 · 크기를 적음 · 2.5초 뒤 끝 · cancel 수
      const said = []; window.__said = said; window.__cancel = 0;
      class U { constructor(t) { this.text = t; this.lang = ''; this.rate = 1; this.pitch = 1; this.volume = 1; this.onend = null; this.onerror = null; } }
      const ss = {c: null, speaking: false, pending: false, paused: false, getVoices() { return []; },
        speak(u) { said.push({text: u.text, lang: u.lang, rate: u.rate, pitch: u.pitch, volume: u.volume}); ss.c = u; setTimeout(() => { if (ss.c === u) { ss.c = null; u.onend?.({}); } }, 2500); },
        cancel() { window.__cancel++; const u = ss.c; ss.c = null; if (u) u.onend?.({}); }};
      Object.defineProperty(window, 'speechSynthesis', {value: ss, configurable: true});
      Object.defineProperty(window, 'SpeechSynthesisUtterance', {value: U, configurable: true, writable: true});
    };
    const NOSAY = () => { Object.defineProperty(window, 'speechSynthesis', {value: undefined, configurable: true}); Object.defineProperty(window, 'SpeechSynthesisUtterance', {value: undefined, configurable: true, writable: true}); };
    const sayCtx = async (w, {font = 0, en = false, fake = true} = {}) => { const c = await ctxOf(w, {font, en}); await c.addInitScript(fake ? FAKE : NOSAY); return c; };
    const last = q => q.evaluate(() => ({s: window.__said?.at(-1) ?? null, n: window.__said?.length ?? 0, cancel: window.__cancel ?? 0, hash: location.hash}));
    const voiceOk = (x, text, lang) => !!x && x.text === text && x.lang === lang && Math.abs(x.rate - 0.9) < 1e-9 && x.pitch === 1 && Math.abs(x.volume - 0.96) < 1e-9;
    const tap = async (q, sel) => { const b = q.locator(sel).first(); await b.scrollIntoViewIfNeeded(); await b.click(); await q.waitForTimeout(150); };
    // 로마 신 카드 얼굴(한국어 390)
    const c1 = await sayCtx(390), p = await c1.newPage(), e1 = errsOf(p);
    await p.goto(URL_OF('#/roman'), {waitUntil: 'load', timeout: 60000});
    if (!await ready(p)) check(false, '⑧ 로마 신 쪽', '안 그려짐');
    else {
      const face = n => `#view .rm-card[data-n="${n}"] button.rm-av`, st = n => p.evaluate(n => { const c = document.querySelector(`#view .rm-card[data-n="${n}"]`); return {p: c?.querySelector('button.rm-av')?.getAttribute('aria-pressed'), say: c?.classList.contains('rm-say')}; }, n);
      await tap(p, face(1)); let L1 = await last(p), S1 = await st(1);
      check(voiceOk(L1.s, storyKo(1), 'ko-KR') && S1.p === 'true' && S1.say && L1.hash === '#/roman', '⑧ 카드 얼굴 누름 → 그 신 이야기(카드 글 그대로 · ko-KR · 0.9 · 1 · 0.96) · 눌림 · 카드 테 · 주소 그대로', JSON.stringify({L1, S1}).slice(0, 300));
      await tap(p, face(1)); const L2 = await last(p), S2 = await st(1);
      check(L2.cancel > L1.cancel && L2.n === L1.n && S2.p === 'false' && !S2.say, '⑧ 같은 얼굴 다시 누름 → 멈춤 · 풂', JSON.stringify({L2, S2}));
      await tap(p, face(6)); await tap(p, face(13)); const L3 = await last(p), A = await st(6), B = await st(13);
      check(voiceOk(L3.s, storyKo(13), 'ko-KR') && A.p === 'false' && !A.say && B.p === 'true' && B.say, '⑧ 다른 얼굴로 바꿈 → 앞 얼굴 풂 · 새 얼굴 이야기', JSON.stringify({L3: L3.s?.text?.slice(0, 30), A, B}));
      await p.waitForTimeout(2800); const B2 = await st(13);
      check(B2.p === 'false' && !B2.say, '⑧ 이야기가 끝나면 눌림 풂', JSON.stringify(B2));
      const all = await p.evaluate(() => [...document.querySelectorAll('#view .rm-card')].filter(c => !c.querySelector('button.rm-av[aria-pressed]')).length);
      check(all === 0, '⑧ 카드 일흔둘 모두 얼굴 듣기 단추', all);
    }
    check(!e1.length, '⑧ 로마 신 쪽 화면 오류 0', e1.join(' | ')); await c1.close();
    // 방 이름표 얼굴(서른아홉 스승 · 한국어 390) — 글상자 · 쪽 옮기면 멈춤
    const c2 = await sayCtx(390), q = await c2.newPage(), e2 = errsOf(q);
    await q.goto(URL_OF('#/sage'), {waitUntil: 'load', timeout: 60000});
    if (!await q.waitForFunction(n => document.querySelector('#view > .rmt')?.dataset.n === String(n), ROOMS.sage, {timeout: 15000}).then(() => true, () => false)) check(false, '⑧ 서른아홉 스승 이름표', '안 붙음');
    else {
      await tap(q, '#view > .rmt button.rms-face'); const T1 = await last(q);
      const cap = await q.evaluate(() => { const c = document.querySelector('#view > .rmt .rms-cap'), f = document.querySelector('#view > .rmt button.rms-face'); return {t: c?.textContent ?? null, hid: c?.hidden ?? null, vis: !!c && c.getBoundingClientRect().height > 0, p: f?.getAttribute('aria-pressed'), fs: c ? parseFloat(getComputedStyle(c).fontSize) : 0}; });
      check(voiceOk(T1.s, storyKo(ROOMS.sage), 'ko-KR') && cap.t === storyKo(ROOMS.sage) && !cap.hid && cap.vis && cap.p === 'true' && cap.fs >= 16.9 && T1.hash === '#/sage', '⑧ 이름표 얼굴 → 그 방 신 이야기 · 글상자 = 듣는 말 · 주소 그대로', JSON.stringify({T1: T1.s?.text?.slice(0, 40), cap}));
      const c0 = (await last(q)).cancel; await q.evaluate(() => { location.hash = '#/dori'; }); await q.waitForTimeout(400);
      check((await last(q)).cancel > c0, '⑧ 쪽을 옮기면 소리 멈춤', `${c0}`);
    }
    check(!e2.length, '⑧ 이름표 화면 오류 0', e2.join(' | ')); await c2.close();
    // 불빛 지킴이 얼굴(첫 화면 · 8번 날씨)
    const c3 = await sayCtx(390), r3 = await c3.newPage(), e3 = errsOf(r3);
    await r3.goto(URL_OF('#/'), {waitUntil: 'load', timeout: 60000}); await r3.waitForTimeout(800);
    const s3 = r3.locator('#view section.nh-hero details.y11-box > summary').first();
    if (!await s3.count()) check(false, '⑧ 첫 화면 말하는 불빛', '칸 없음');
    else {
      await s3.scrollIntoViewIfNeeded(); await s3.click(); await r3.locator('#view section.nh-hero details.y11-box[open] > .y11-x .y11-bd').first().waitFor({state: 'attached', timeout: 15000}).catch(() => {});
      await tap(r3, '#view section.nh-hero details.y11-box[open] > .y11-x .y11-lamp[data-k="8"]'); await tap(r3, '#view details.y11-box[open] .y11-gw button.rms-face'); const G1 = await last(r3);
      const gc = await r3.evaluate(() => { const c = document.querySelector('#view details.y11-box[open] .y11-gw .rms-cap'); return {t: c?.textContent ?? null, hid: c?.hidden ?? null, vis: !!c && c.getBoundingClientRect().height > 0}; });
      check(voiceOk(G1.s, storyKo(LIGHTS[8]), 'ko-KR') && gc.t === storyKo(LIGHTS[8]) && !gc.hid && gc.vis && G1.hash === '#/', '⑧ 불빛 지킴이 얼굴 → 그 신 이야기 · 글상자 = 듣는 말 · 주소 그대로', JSON.stringify({G1: G1.s?.text?.slice(0, 40), gc: {...gc, t: gc.t?.slice(0, 40)}, hash: G1.hash}));
    }
    check(!e3.length, '⑧ 첫 화면 화면 오류 0', e3.join(' | ')); await c3.close();
    // 영어 — 로마 신 카드 얼굴(넵투누스)
    const c4 = await sayCtx(390, {en: true}), r4 = await c4.newPage(), e4 = errsOf(r4);
    await r4.goto(URL_OF('#/roman', '&lang=en'), {waitUntil: 'load', timeout: 60000});
    if (await ready(r4)) { await tap(r4, '#view .rm-card[data-n="9"] button.rm-av'); const E1 = await last(r4); check(voiceOk(E1.s, storyEn(9), 'en-US') && !HAN.test(E1.s?.text ?? ''), '⑧ 영어 — 영어 이야기 · en-US', JSON.stringify(E1.s).slice(0, 200)); }
    else check(false, '⑧ 영어 로마 신 쪽', '안 그려짐');
    check(!e4.length, '⑧ 영어 화면 오류 0', e4.join(' | ')); await c4.close();
    // 소리 없는 휴대폰 · 아주 크게 320 — 글상자만 · 넘침 0
    for (const [w, font, fake, tagT] of [[390, 0, false, '소리 없는 휴대폰'], [320, 2, true, '320 아주 크게']]) {
      const c5 = await sayCtx(w, {font, fake}), r5 = await c5.newPage(), e5 = errsOf(r5);
      await r5.goto(URL_OF('#/sage'), {waitUntil: 'load', timeout: 60000});
      if (!await r5.waitForFunction(() => !!document.querySelector('#view > .rmt'), null, {timeout: 15000}).then(() => true, () => false)) { check(false, `⑧ ${tagT} 이름표`, '안 붙음'); await c5.close(); continue; }
      await tap(r5, '#view > .rmt button.rms-face');
      const m = await r5.evaluate(() => { const c = document.querySelector('#view > .rmt .rms-cap'), f = document.querySelector('#view > .rmt button.rms-face'), r = c?.getBoundingClientRect(); return {t: c?.textContent ?? null, vis: !!r && r.height > 0, l: r ? Math.round(r.left) : -1, rt: r ? Math.round(r.right) : 9999, vw: document.documentElement.clientWidth, sw: document.documentElement.scrollWidth, p: f?.getAttribute('aria-pressed')}; });
      check(m.t === storyKo(ROOMS.sage) && m.vis && m.l >= 0 && m.rt <= m.vw + 0.5 && m.sw <= m.vw && (fake || m.p === 'false'), `⑧ ${tagT} — 글상자 = 이야기 · 화면 안 · 넘침 0${fake ? '' : ' · 눌림 없음'}`, JSON.stringify({...m, t: m.t?.slice(0, 30)}));
      check(!e5.length, `⑧ ${tagT} 화면 오류 0`, e5.join(' | ')); await c5.close();
    }
  }
} catch (e) { check(false, '검사 멈춤', e.stack || e.message); }
await browser.close();
R.brand = BRAND.ko;
if (OUT) await fs.writeFile(OUT, JSON.stringify(R, null, 1));
console.log(`로마 신 72 검사 — 통과 ${R.counts.pass} · 실패 ${R.counts.fail}`);
process.exit(R.counts.fail ? 1 : 0);
