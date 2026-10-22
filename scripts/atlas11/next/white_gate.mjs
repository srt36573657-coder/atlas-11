#!/usr/bin/env node
/* 흰 첫 화면 문 — 올리기 직전 문(scripts/atlas11/deploy_netlify.mjs 본질 문 바로 뒤)에서 늘 도는 정적 검사(브라우저 없이 · 1초)
   사장님 2026-10-19 02:03(싱가포르) 「골똘이 대공사 · 구글과 잡스 판」 [하는 법 ②] 6 「검사를 올리기 직전 문(본질 문 곁)에 붙여라. 업데이트와 진화가 다 지난다.」
   잣대 한 장 = docs/골똘이_화면잣대.md(사장님 말씀으로만 고침) · 브라우저 검사 = scripts/atlas11/next/check_white.mjs(모든 쪽 검사의 쪽 「white」)

   두 겹
     ① 모든 쪽 검사(atlas11-next-full.yml · run_all.mjs · shard/plan.mjs pageNames)가 check_white.mjs 를 쪽 「white」로 저절로 돎
        → 올리기 전 검사 기다리기(wait_preview.mjs expectedPages)와 진화 회차(gh.mjs previewResult)가 「white」 실패 0 을 요구
     ② 이 파일 = 올리기 직전 마지막 문 — 올리는 폴더(dist)를 정적으로 봄(올리기를 부르는 모든 길: 매시 업데이트 · 매일 · 저녁 · 손 올리기 · 진화 뒤 올리기)

   켜는 스위치(공사 순서 때문 · 2026-10-19 03시 짓기 일꾼 C)
     지금 사이트는 흰 첫 화면 검사에 38곳 걸림 — 새 첫 화면(일꾼 B)이 들어오기 전에는 걸릴 수밖에 없음
     → 저장소에 site/next/home.css(새 첫 화면 파일)가 있을 때만 막음. 없으면 「꺼짐」 한 줄만 찍고 지나감(앞서 있던 문은 하나도 무르게 하지 않음)
     → home.css 가 저장소에 들어온 뒤로는 늘 켜짐: 올리는 폴더에 next/home.css 가 빠져도 막음(새 첫 화면이 묶음에서 빠진 것)
     whiteOn(root) 한 곳 — check_white.mjs 끝 코드도 같은 스위치를 씀

   보는 것(켜졌을 때 · 정적)
     ㉠ 새 첫 화면 파일 next/home.css 가 있고 next/index.html 이 그것을 부름
     ㉡ 색 출발값 다섯(#FFFFFF · #16181D · #8A6516 · #D0202E · #1E5BD8)이 next/app.css 또는 next/home.css 에 있음 · app.css 에 html.white 묶음
     ㉢ 망치는 길 0 — home.css 전부와 app.css 의 html.white 규칙에 그림자 · 글 그림자 · 그림자 거름 · 그러데이션 · 입체(perspective · preserve-3d · rotateX/Y · matrix3d)
     ㉣ 그대로 — 아래 단추 다섯(오늘 장 · 시황 · 매매일지 · 관심 · 보유종목 · 매매일지 = #/why) · 진화 단추(jhBtn) · 본질 세 줄(data-ess)
     ㉤ 첫 화면 표시 — app.js 에 data-w(칸) · data-say(골똘이 말) · data-fact(시황 사실) · 흰 판 붙이기(white)
     ㉥ 폰에 옛 화면이 안 남게 — 묶은 폴더 _headers 의 /next/* 가 no-cache · app.js 에 서비스 워커 없음
   쓰는 법: node scripts/atlas11/next/white_gate.mjs [--dist <폴더 · 기본 site>] [--json]   끝 코드 0 = 지나감(꺼짐 포함) · 1 = 막음
            import {whiteGate, whiteOn, HOME_CSS} from './white_gate.mjs' */
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');
/** 새 첫 화면 파일 — 이것이 저장소에 있으면 흰 첫 화면 문이 켜짐 */
export const HOME_CSS = 'site/next/home.css';
export const COLORS = Object.freeze(['#E6F5EB', '#102218', '#7A5843', '#00702A', '#1E5BD8']); // 맑은 연초록 판(사장님 2026-10-23 00:01 「맑은 은은한 녹색」) — 바탕 · 글 · 금빛 · 오름 · 내림 // 우주 밤하늘(사장님 2026-10-20 20:27 「올려  우주」 · 잣대 색 4) · // 돌 판(사장님 2026-10-19 10:31 「이제 실제로 만들어 이기준으로」) — 바탕 · 글 · 금빛 · 오름 · 내림
export const TABS = Object.freeze(['오늘 장', '시황', '매매일지', '관심', '보유종목']);
/** 스위치 한 곳 — 저장소에 site/next/home.css 가 있으면 켜짐 */
export const whiteOn = (root = ROOT) => fs.existsSync(path.join(root, HOME_CSS));

const RUIN = [
  [/box-shadow\s*:\s*(?!\s*none\s*(!important)?\s*(;|$))/i, '그림자'], [/text-shadow\s*:\s*(?!\s*none\s*(!important)?\s*(;|$))/i, '글 그림자'],
  [/drop-shadow\(|filter\s*:[^;]*blur\(/i, '그림자 거름'], [/gradient\(/i, '광택(그러데이션)'],
  [/perspective\s*:\s*(?!\s*none\s*(!important)?\s*(;|$))|perspective\(|preserve-3d|rotate[XY]\(|matrix3d\(/i, '입체'],
];
const stripComments = s => String(s).replace(/\/\*[\s\S]*?\*\//g, '');
/** css 글 → [{sel, body}] (중첩 @media 안 규칙도 펼침 — 단순 셈) */
export function cssRules(css) {
  const out = [], s = stripComments(css);
  const re = /([^{}]+)\{([^{}]*)\}/g; let m;
  while ((m = re.exec(s))) out.push({sel: m[1].trim().replace(/^@[^{]*\{\s*/, ''), body: m[2]});
  return out;
}
export function ruinIn(css, {onlyWhite = false} = {}) {
  const hits = [];
  for (const r of cssRules(css)) {
    if (onlyWhite && !/html\.white\b/.test(r.sel)) continue;
    for (const d of r.body.split(';')) for (const [re, name] of RUIN) if (re.test(d.trim() + ';')) hits.push(`${name} 「${r.sel.slice(0, 40)}」`);
  }
  return hits;
}

/** 올리는 폴더(dist) 또는 소스 폴더(site)를 봄 → {on, ok, lines} */
export function whiteGate({dist = path.join(ROOT, 'site'), root = ROOT} = {}) {
  if (!whiteOn(root)) return {on: false, ok: true, lines: [`흰 첫 화면 문 꺼짐 — 저장소에 ${HOME_CSS} 가 아직 없음(새 첫 화면이 들어오면 저절로 켜짐)`]};
  const bad = [], rd = f => { try { return fs.readFileSync(path.join(dist, f), 'utf8'); } catch { return null; } };
  const home = rd('next/home.css'), app = rd('next/app.css'), html = rd('next/index.html'), js = rd('next/app.js');
  if (home == null) bad.push('㉠ 올리는 폴더에 next/home.css 가 없음 — 새 첫 화면이 묶음에서 빠짐');
  if (html == null) bad.push('㉠ next/index.html 이 없음');
  else if (!/home\.css/.test(html)) bad.push('㉠ next/index.html 이 home.css 를 부르지 않음');
  if (app == null) bad.push('㉡ next/app.css 가 없음');
  else if (!/html\.white\b/.test(app)) bad.push('㉡ next/app.css 에 흰 판(html.white) 묶음이 없음');
  const css = `${app ?? ''}\n${home ?? ''}`.toUpperCase();
  for (const c of COLORS) if (!css.includes(c)) bad.push(`㉡ 색 출발값 ${c} 가 app.css · home.css 에 없음`);
  const ruin = [...(home != null ? ruinIn(home) : []), ...(app != null ? ruinIn(app, {onlyWhite: true}) : [])];
  if (ruin.length) bad.push(`㉢ 망치는 길 그림 ${ruin.length}곳 — ${[...new Set(ruin)].slice(0, 3).join(' · ')}`);
  if (html != null) {
    const tabs = [...(/<nav[^>]*class="[^"]*tabs[^"]*"[\s\S]*?<\/nav>/.exec(html)?.[0] ?? '').matchAll(/<a\b[^>]*>([\s\S]*?)<\/a>/g)].map(m => m[1].replace(/<[^>]+>/g, '').trim());
    if (JSON.stringify(tabs) !== JSON.stringify(TABS)) bad.push(`㉣ 아래 단추 다섯이 바뀜 — ${tabs.join(' · ') || '찾지 못함'}`);
    if (!/<a\b[^>]*href="#\/why"/.test(html)) bad.push('㉣ 아래 단추 매매일지(#/why)가 없음');
  }
  if (js == null) bad.push('㉣ next/app.js 가 없음');
  else {
    if (!/jhBtn/.test(js)) bad.push('㉣ 진화 단추(jhBtn)가 없음');
    if (!/data-ess/.test(js)) bad.push('㉣ 본질 세 줄(data-ess)이 없음');
    for (const [k, why] of [['data-w', '첫 화면 칸 표시'], ['data-say', '골똘이 말 표시'], ['data-fact', '시황 사실 표시'], ['white', '흰 판 붙이기']]) if (!js.includes(k)) bad.push(`㉤ app.js 에 ${why}(${k})가 없음`);
    if (/serviceWorker/.test(js)) bad.push('㉥ app.js 가 서비스 워커를 붙임 — 폰에 옛 화면이 남을 수 있음');
  }
  const hdr = rd('_headers'); // 묶은 폴더(dist)에만 있음 — 소스 폴더(site)로 볼 때는 건너뜀
  if (hdr != null && !/^\/next\/\*\r?\n(?:[ \t]+[^\n]*\n)*?[ \t]+Cache-Control:\s*no-cache/m.test(hdr)) bad.push('㉥ _headers 에 /next/* no-cache 가 없음 — 폰에 옛 화면이 남을 수 있음');
  return {on: true, ok: !bad.length, lines: bad.length ? bad : ['흰 첫 화면 문 통과 — 정적 여섯 가지(㉠ ~ ㉥) 실패 0']};
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const i = process.argv.indexOf('--dist'), dist = path.resolve(i > 0 ? process.argv[i + 1] : path.join(ROOT, 'site'));
  const r = whiteGate({dist});
  if (process.argv.includes('--json')) console.log(JSON.stringify(r)); else for (const l of r.lines) console.log((r.ok ? '' : '막음 ') + l);
  process.exit(r.ok ? 0 : 1);
}
