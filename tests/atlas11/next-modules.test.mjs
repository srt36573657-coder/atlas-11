// 새 아틀란스 쪽 모듈 지킴(사장님 2026-10-17 04:04 「첫화면 부터 마지막 페이지 까지 모두 바꿔」 · 04:23 「에이전트 총 동원해」 · 규칙 74 ⑧)
//   ① READY 에 든 쪽은 p-<이름>.js(render 내보냄) · p-<이름>.css 가 있고 맞대는 검사 check_<이름>.mjs 가 있음(co · chx · today 처럼 다른 화면 안에 끼는 쪽 포함)
//   ② 보안 규칙(CSP style-src · script-src 'self') — 글 속 HTML 넣기 · 글로 쓴 꾸밈 · eval 없음
//   ③ 입체 없음(규칙 50) — 캔버스 · 원근 · 3D 돌리기 · 그림자 필터 없음
//   ④ 옛 주소를 받는 쪽(OLD_KINDS)은 모두 모듈 파일이 있음 — 켜면 바로 열리게
//   ⑤ 옛 이름 없음(사장님 2026-10-17 15:48 「이름을 변경하자 아틀란스에서 보드리로 모두 변경해」 · 15:52 「가」) — site/next/*.js 의 글(따옴표 · 틀 글 · 풀이 글은 셈 밖) ·
//      index.html(풀이 글 밖) · CSS 글(content) · 영어 사전 값(i18n/en.json)에 아틀란스 · 아틀라스 · ATLAS 가 없음 · 바꾸는 말 표와 글 뽑기 자체 시험(scripts/atlas11/next/rename.mjs)
//   ⑥ 같은 옛 이름 검사를 지금 사이트의 다른 쪽(소개 · 편지 · 초대)에도 — 옛 화면(site/index.html · /atlas/ …)은 셈 밖
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {OLD_NAME_RE, jsStrings, selfTest as renameSelfTest} from '../../scripts/atlas11/next/rename.mjs';
import {BRAND} from '../../site/next/brand.js';
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const NEXT = path.join(ROOT, 'site/next'), CHK = path.join(ROOT, 'scripts/atlas11/next');
const app = fs.readFileSync(path.join(NEXT, 'app.js'), 'utf8');
const listOf = re => ((re.exec(app) || [, ''])[1].match(/'([a-z]+)'/g) || []).map(x => x.slice(1, -1));
const READY = listOf(/const READY = new Set\(\[([^\]]*)\]\);/), OLD = listOf(/const OLD_KINDS = new Set\(\[([^\]]*)\]\);/);
const js = fs.readdirSync(NEXT).filter(f => f.endsWith('.js')), css = fs.readdirSync(NEXT).filter(f => f.endsWith('.css'));
const src = f => fs.readFileSync(path.join(NEXT, f), 'utf8');
const code = s => s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:'"\\])\/\/[^\n]*/g, '$1'); // 풀이 글은 빼고 셈

/** 쪽 → 맞대는 검사 파일 — 다섯 쪽(up · time · info · x · talk)은 한 파일 check_misc · 고도리 한 장 명령문(2026-10-17 17:54)의 why · gdr 은 제 파일 · 나머지는 check_<이름> */
const CHECK_OF = {up: 'check_misc.mjs', time: 'check_misc.mjs', info: 'check_misc.mjs', x: 'check_misc.mjs', talk: 'check_misc.mjs', why: 'check_why.mjs', gdr: 'check_gdr.mjs'};
const checkOf = k => CHECK_OF[k] ?? `check_${k}.mjs`;
test('① READY 쪽마다 모듈 · 모양 · 맞대는 검사', () => {
  for (const k of READY) {
    assert.ok(fs.existsSync(path.join(NEXT, `p-${k}.js`)), `p-${k}.js 없음`);
    assert.ok(fs.existsSync(path.join(NEXT, `p-${k}.css`)), `p-${k}.css 없음`);
    assert.match(src(`p-${k}.js`), /export (async )?function render\s*\(/, `p-${k}.js 가 render 를 내보내지 않음`);
    assert.ok(fs.existsSync(path.join(CHK, checkOf(k))), `${k} 맞대는 검사 ${checkOf(k)} 없음`);
  }
  // 질문 열한 개(why) · 고도리 칸(gdr) — 제 검사 파일이 그 길을 열고(첫 화면 #/ 도) · 다른 쪽 검사와 같은 꼴(--base · --pw · --out · --all · 실패면 끝 코드 1) ·
  // 이름은 rename.mjs(brand.js 한 곳)에서 읽고 따옴표 글에 이름을 박지 않음(규칙 76) · 질문 · 격언 기준은 사장님 원문(brief.md)
  for (const [k, route] of [['why', '#/why'], ['gdr', '#/gdr']]) {
    assert.ok(READY.includes(k), `READY 에 ${k} 없음`);
    assert.equal(checkOf(k), `check_${k}.mjs`, `${k} 는 제 검사 파일`);
    const f = path.join(CHK, checkOf(k)), s = fs.readFileSync(f, 'utf8'), strs = jsStrings(s).map(x => x.s);
    for (const h of [route, '#/']) assert.ok(strs.includes(h), `${checkOf(k)} 가 ${h} 를 열지 않음`);
    for (const o of ['--base', '--pw', '--out', '--all']) assert.ok(strs.includes(o), `${checkOf(k)} 에 ${o} 없음`);
    assert.match(s, /process\.exit\(1\)/, `${checkOf(k)} 실패 끝 코드 1 없음`);
    assert.match(s, /import \{[^}]*\bNEW_NAME\b[^}]*\} from '\.\/rename\.mjs'/, `${checkOf(k)} 가 이름을 rename.mjs 에서 읽지 않음`);
    assert.ok(strs.some(x => x.includes('docs/design/godori-2026-10-17/brief.md')), `${checkOf(k)} 가 결정표(brief.md)를 읽지 않음`);
    const named = jsStrings(s).filter(x => [BRAND.ko, BRAND.en, ...BRAND.was.flatMap(w => [w.ko, w.en])].some(n => x.s.includes(n)));
    assert.deepEqual(named.map(x => `${x.line} 「${x.s.slice(0, 60)}」`), [], `${checkOf(k)} 따옴표 글에 이름을 박음(rename.mjs NEW_NAME 을 쓸 것)`);
  }
});

test('② 보안 규칙 — 글 속 HTML · 글로 쓴 꾸밈 · eval 없음', () => {
  for (const f of js) {
    const s = code(src(f));
    for (const bad of [/\.innerHTML\s*=/, /\.outerHTML\s*=/, /insertAdjacentHTML/, /document\.write/, /\beval\s*\(/, /new Function\s*\(/, /setAttribute\(\s*['"]style['"]/, /\.style\.cssText\s*=/, /style="/])
      assert.doesNotMatch(s, bad, `${f}: ${bad}`);
  }
  assert.doesNotMatch(fs.readFileSync(path.join(NEXT, 'index.html'), 'utf8'), /style="|<script(?![^>]*\bsrc=)[^>]*>/, 'index.html 에 글 속 꾸밈 · 스크립트');
});

test('③ 입체 없음 — 캔버스 · 원근 · 3D 돌리기 · 그림자 필터', () => {
  for (const f of js) assert.doesNotMatch(code(src(f)), /getContext\s*\(|createElement\(\s*['"]canvas/, `${f}: 캔버스`);
  for (const f of css) assert.doesNotMatch(src(f), /perspective|preserve-3d|rotate[XY]\(|translateZ|translate3d|drop-shadow/, `${f}: 입체`);
});

test('④ 옛 주소를 받는 쪽은 모두 모듈 파일이 있음', () => {
  assert.ok(OLD.length >= 9, 'OLD_KINDS 를 못 읽음');
  for (const k of OLD) assert.ok(fs.existsSync(path.join(NEXT, `p-${k}.js`)), `p-${k}.js 없음`);
  for (const k of ['co', 'past', 'rivals', 'grow', 'range', 'chx']) assert.ok(fs.existsSync(path.join(NEXT, `p-${k}.js`)), `p-${k}.js 없음`);
});

/** 소스에서 옛 이름 자리 — .js · .mjs = 따옴표 · 틀 글만(풀이 글 · 정규식 밖) · .html = 풀이 글(<!-- -->) 밖 모든 줄 · .css = 풀이 글 밖 따옴표 글(content: '…') */
function oldNamesInSource(file, name = path.relative(ROOT, file)) {
  const s = fs.readFileSync(file, 'utf8'), bad = [];
  if (/\.m?js$/.test(file)) for (const x of jsStrings(s)) { if (OLD_NAME_RE.test(x.s)) bad.push(`${name}:${x.line} 「${x.s.slice(0, 90)}」`); }
  else if (/\.html$/.test(file)) s.replace(/<!--[\s\S]*?-->/g, m => m.replace(/[^\n]/g, '')).split('\n').forEach((l, k) => { if (OLD_NAME_RE.test(l)) bad.push(`${name}:${k + 1} 「${l.trim().slice(0, 90)}」`); }); // 풀이 글은 빼고 줄 번호는 그대로
  else if (/\.css$/.test(file)) for (const m of s.replace(/\/\*[\s\S]*?\*\//g, '').matchAll(/(['"])((?:\\.|(?!\1)[^\\\n])*)\1/g)) { if (OLD_NAME_RE.test(m[2])) bad.push(`${name} 「${m[2].slice(0, 90)}」`); }
  return bad;
}

test('⑤ 옛 이름 없음 — 새 화면 글(따옴표 · 틀 글) · index.html · CSS 글 · 영어 사전 값에 아틀란스 · ATLAS · 아틀라스가 없음(풀이 글은 셈 밖)', () => {
  assert.deepEqual(renameSelfTest(), [], '바꾸는 말 표 · 옛 이름 찾기 · 글 뽑기 자체 시험');
  const bad = [...js.filter(f => f !== 'brand.js'), 'index.html', ...css].flatMap(f => oldNamesInSource(path.join(NEXT, f), f)); // brand.js = 이름 한 곳(옛 이름 목록 was 를 일부러 가짐 · 규칙 76)
  const en = path.join(NEXT, 'i18n/en.json'); // 영어 화면 글 = 사전의 값(열쇠는 옛 한국어 틀이 남아도 됨 · 머리 schema · lang · note 는 셈 밖) · 옛 영어 이름은 「ATLAS」 · 「Bodri」(2026-10-17 17:34 「보드리를 고도리로」 · 회사 「Atlas Link」 같은 실제 이름은 셈 밖)
  if (fs.existsSync(en)) {
    const walk = (x, p) => { if (typeof x === 'string') { if (/ATLAS|아틀란스|보드리|\bBodri\b/.test(x)) bad.push(`i18n/en.json ${p} 「${x.slice(0, 90)}」`); } else if (x && typeof x === 'object') for (const [k, v] of Object.entries(x)) walk(v, p + ' › ' + k.slice(0, 40)); };
    for (const [k, v] of Object.entries(JSON.parse(fs.readFileSync(en, 'utf8')))) if (!['schema', 'lang', 'note'].includes(k)) walk(v, k);
  }
  assert.deepEqual(bad, [], '옛 이름 남음:\n' + bad.join('\n'));
});

test('⑥ 옛 이름 없음 — 지금 사이트의 다른 쪽(소개 /hello.html · 편지 /letter.html · 초대 /invite.html)의 글', () => {
  const SITE = path.join(ROOT, 'site'), files = ['hello.html', 'hello-send.js', 'hello-promo.css', 'letter.html', 'letter.js', 'letter.css', 'invite.html'].filter(f => fs.existsSync(path.join(SITE, f))); // 옛 화면(site/index.html · /atlas/ · /app/ · /us/ · /new/)은 손대지 않으니 셈 밖
  assert.ok(files.includes('hello.html') && files.includes('letter.js'), '소개 · 편지 쪽 파일을 못 찾음');
  const bad = files.flatMap(f => oldNamesInSource(path.join(SITE, f), 'site/' + f));
  assert.deepEqual(bad, [], '옛 이름 남음:\n' + bad.join('\n'));
});
