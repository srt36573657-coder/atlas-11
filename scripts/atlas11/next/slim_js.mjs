// 큐피트 쪽 js 를 가볍게 — 설명(// · /* */)만 빼서 묶음에 담음(주문 1114-1306 · 사장님 2026-11-14 13:46 「속도를 3배 빠르게 해」 · 느린 휴대폰 첫 화면 2.5초)
//   저장소의 원본(site/su/*.js)은 그대로 · 묶을 때(package.mjs) dist 쪽 사본만 줄임 — 글 · 셈 · 고리는 한 글자도 안 바뀜
//   따옴표 글 · 여러 줄 `…` 글(${…} 안 포함) 안은 건드리지 않음 · 나눗셈인지 /정규식/ 인지 헷갈리는 줄은 그 줄 설명을 남김
//   뺀 뒤 문법 검사(node --check)가 실패하면 그 파일은 원본 그대로(닫힌 쪽으로 실패)
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {execFileSync} from 'node:child_process';

const RE_BEFORE = new Set(['(', ',', '=', ':', '[', '!', '&', '|', '?', '{', '}', ';', '+', '-', '*', '%', '<', '>', '~', '^']);
const RE_WORDS = new Set(['return', 'typeof', 'instanceof', 'in', 'of', 'new', 'delete', 'void', 'throw', 'case', 'do', 'else', 'yield', 'await']);
const isId = c => /[A-Za-z0-9_$\u0080-￿]/.test(c);

/** 설명 빼기 — {code, cut}(cut = 뺀 설명 수) · 판단이 서지 않으면 그 설명은 남김 */
export function slimJs(src) {
  const s = String(src), n = s.length, out = [];
  const stack = []; // 'tpl' 또는 {expr: 깊이}(템플릿 ${ } 안 코드)
  let i = 0, cut = 0, prevSig = '', prevWord = '', lineHadRe = false, lineStart = 0, lineOut = 0, lineStr = false, lineCut = false;
  const inTplExpr = () => stack.length && typeof stack[stack.length - 1] === 'object';
  const endLine = () => { // 줄 끝 — 설명만 있던 줄(빼고 나니 빈 줄 · 글 안이 아님)은 줄째 뺌
    const seg = out.slice(lineOut).join('');
    if (lineCut && !lineStr && !seg.trim()) { out.length = lineOut; return false; }
    if (lineCut && !lineStr) { const t = seg.replace(/[ \t]+$/, ''); if (t !== seg) { out.length = lineOut; out.push(t); } }
    return true;
  };
  while (i < n) {
    const c = s[i], d = s[i + 1];
    const top = stack[stack.length - 1];
    if (top === 'tpl') { // 여러 줄 글 안
      lineStr = true;
      if (c === '\\') { out.push(c, d ?? ''); i += 2; continue; }
      if (c === '`') { stack.pop(); out.push(c); i++; prevSig = '`'; continue; }
      if (c === '$' && d === '{') { stack.push({expr: 0}); out.push('${'); i += 2; prevSig = '{'; continue; }
      if (c === '\n') { out.push(c); i++; lineStart = i; lineOut = out.length; lineHadRe = false; lineCut = false; lineStr = true; continue; }
      out.push(c); i++; continue;
    }
    // 코드(맨 바깥 또는 ${ } 안)
    if (c === '\n') { if (endLine()) out.push(c); i++; lineStart = i; lineOut = out.length; lineHadRe = false; lineCut = false; lineStr = stack.length > 0; continue; }
    if (c === "'" || c === '"') { // 한 줄 따옴표 글
      let j = i + 1; while (j < n && s[j] !== c && s[j] !== '\n') j += s[j] === '\\' ? 2 : 1;
      out.push(s.slice(i, j + 1)); i = j + 1; prevSig = c; lineStr = lineStr || false; continue;
    }
    if (c === '`') { stack.push('tpl'); out.push(c); i++; lineStr = true; continue; }
    if (c === '/' && d === '/') { // 줄 설명
      let j = i; while (j < n && s[j] !== '\n') j++;
      if (lineHadRe || inTplExpr()) { out.push(s.slice(i, j)); i = j; continue; } // 헷갈리는 줄 · ${ } 안 — 남김
      cut++; lineCut = true; i = j; continue;
    }
    if (c === '/' && d === '*') { // 덩이 설명
      const j = s.indexOf('*/', i + 2); if (j < 0) { out.push(s.slice(i)); break; }
      const body = s.slice(i, j + 2);
      if (body.startsWith('/*!') || /@license|@preserve/.test(body) || lineHadRe || inTplExpr()) { out.push(body); i = j + 2; continue; }
      cut++; lineCut = true;
      const nl = (body.match(/\n/g) ?? []).length; // 여러 줄 덩이 — 줄바꿈은 줄 끝 처리로(앞 줄이 빈 줄이면 뺌)
      if (nl) { // 덩이가 끝나는 줄까지 건너뜀 — 앞부분 줄 끝 처리 후, 끝 줄은 덩이 뒤부터 이어 셈
        if (endLine()) out.push('\n');
        lineOut = out.length; lineCut = true; lineStr = stack.length > 0; lineHadRe = false;
      }
      i = j + 2; continue;
    }
    if (c === '/') { // 나눗셈 또는 정규식
      const re = prevSig === '' || RE_BEFORE.has(prevSig) || RE_WORDS.has(prevWord);
      if (re) {
        let j = i + 1, cls = false;
        while (j < n && s[j] !== '\n') { const x = s[j]; if (x === '\\') { j += 2; continue; } if (cls) { if (x === ']') cls = false; } else if (x === '[') cls = true; else if (x === '/') break; j++; }
        if (j >= n || s[j] === '\n') { out.push(c); i++; prevSig = '/'; lineHadRe = true; continue; } // 끝을 못 찾음 — 그대로 한 글자
        j++; while (j < n && /[a-z]/.test(s[j])) j++;
        out.push(s.slice(i, j)); i = j; prevSig = 'a'; prevWord = ''; lineHadRe = true; continue;
      }
      out.push(c); i++; prevSig = '/'; prevWord = ''; continue;
    }
    if (inTplExpr()) { const t = stack[stack.length - 1]; if (c === '{') t.expr++; else if (c === '}') { if (t.expr === 0) { stack.pop(); out.push(c); i++; prevSig = '}'; continue; } t.expr--; } }
    if (isId(c)) { let j = i; while (j < n && isId(s[j])) j++; prevWord = s.slice(i, j); prevSig = 'a'; out.push(prevWord); i = j; continue; }
    if (c !== ' ' && c !== '\t' && c !== '\r') { prevSig = c; prevWord = ''; }
    out.push(c); i++;
  }
  endLine();
  return {code: out.join(''), cut};
}

/** 폴더 안 *.js(맨 위 칸만) 줄이기 — 줄인 파일 수 · 아낀 글자 수 · 원본으로 둔 파일 */
export function slimDir(dir, {check = true} = {}) {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'slim-')), kept = [];
  let files = 0, saved = 0;
  for (const f of fs.readdirSync(dir).filter(f => f.endsWith('.js')).sort()) {
    const p = path.join(dir, f), src = fs.readFileSync(p, 'utf8'), {code, cut} = slimJs(src);
    if (!cut || code.length >= src.length) continue;
    if (check) { const t = path.join(tmp, f.replace(/\.js$/, '.mjs')); fs.writeFileSync(t, code); try { execFileSync(process.execPath, ['--check', t], {stdio: 'pipe'}); } catch { kept.push(f); continue; } }
    fs.writeFileSync(p, code); files++; saved += Buffer.byteLength(src) - Buffer.byteLength(code);
  }
  fs.rmSync(tmp, {recursive: true, force: true});
  return {files, saved, kept};
}

if (process.argv[1] && path.resolve(process.argv[1]) === path.resolve(new URL(import.meta.url).pathname)) {
  const dir = process.argv[2]; if (!dir) { console.error('쓰는 법: node scripts/atlas11/next/slim_js.mjs <폴더>'); process.exit(2); }
  console.log(JSON.stringify(slimDir(dir)));
}
