// 모양 규칙 — 고도리 명령문 72개(2026-10-18) [7] 6 · [10] 5 ~ 8 · 일꾼 S4r (check_range · check_chx 가 함께 씀)
//   pageRules(page, {skip}) = 닫은 채로 화면(main#view)이 지키는지:
//     ① 계산된 음수 바깥 여백 0 · ② 서로 겹친 형제 칸 0(그림(svg) 속 · 절대 자리 · 안 보이는 칸은 뺌 · 글줄 칸은 줄 칸 하나하나) · ③ 글씨 크기 6가지 이하 · ④ 글 시작 왼쪽 줄 3줄 이하
//     (④ 가운데 · 오른쪽 맞춘 글은 왼쪽 줄이 아님 · skip 에 든 칸(기본 없음 — measure_type.mjs 는 챕터 줄 · 탭 줄도 셈 · 지금 범위 · 채널 쪽에서 빼도 같음을 쟀음)은 따로 셈 · 접은 칸 안 글은 접힌 동안 안 셈 ·
//      칸 가르는 잣대는 measure.mjs · measure_type.mjs 와 똑같이 — display 가 inline · contents 아닌 것은 모두 제 칸(inline-flex · inline-block 고리가 글 한가운데 끼면 왼쪽 줄 하나 더 — 2026-10-18 12:12 범위 「봉인 보기」 139px))
//   cssRules(file) = 내 css 글 규칙 — 글씨는 var(--fs-1 ~ 6) · margin · padding · gap 은 0 · auto · var(--sp-1 ~ 3) 만(저장소 안에서 돌릴 때만 · 파일이 없으면 빈 줄)
import fss from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');

/** 화면 칸에서 읽어 어긴 것 글줄(빈 줄 = 모두 지킴) */
export const pageRules = (p, {skip = '', maxFonts = 6, maxLefts = 3} = {}) => p.evaluate(({skip, maxFonts, maxLefts}) => {
  const out = [], v = document.querySelector('main#view');
  const vis = e => { const r = e.getBoundingClientRect(); if (!r.width || !r.height) return false; for (let x = e; x && x !== document.body; x = x.parentElement) { const s = getComputedStyle(x); if (s.display === 'none' || s.visibility === 'hidden' || s.clipPath === 'inset(50%)' || s.clip === 'rect(0px, 0px, 0px, 0px)') return false; } return true; };
  const inClosed = e => { for (let x = e; x; x = x.parentElement) if (x.tagName === 'DETAILS' && !x.open && !(x.firstElementChild && x.firstElementChild.contains(e))) return true; return false; };
  const isSvg = e => e instanceof SVGElement, nm = e => String(e.className?.baseVal ?? e.className ?? '') || e.tagName;
  const all = [...v.querySelectorAll('*')].filter(vis), neg = new Set();
  for (const e of all) { if (isSvg(e)) continue; const s = getComputedStyle(e); for (const k of ['marginTop', 'marginBottom', 'marginLeft', 'marginRight']) if (parseFloat(s[k]) < -0.5 && e.getBoundingClientRect().width > 1) neg.add(nm(e) + ' ' + k + ' ' + s[k]); }
  if (neg.size) out.push('음수 바깥 여백 ' + neg.size + ' · ' + [...neg].slice(0, 3).join(' | '));
  const rectsOf = e => (getComputedStyle(e).display === 'inline' ? [...e.getClientRects()] : [e.getBoundingClientRect()]).filter(r => r.width > 0 && r.height > 0), ov = [];
  for (const par of [v, ...all]) {
    if (isSvg(par)) continue;
    const kids = [...par.children].filter(e => !isSvg(e) && vis(e) && !['absolute', 'fixed'].includes(getComputedStyle(e).position));
    for (let i = 0; i < kids.length; i++) for (let j = i + 1; j < kids.length; j++) {
      let hit = null;
      for (const a of rectsOf(kids[i])) for (const c of rectsOf(kids[j])) { const w = Math.min(a.right, c.right) - Math.max(a.left, c.left), hh = Math.min(a.bottom, c.bottom) - Math.max(a.top, c.top); if (w > 0.5 && hh > 0.5) hit = hit || Math.round(w) + '×' + Math.round(hh); }
      if (hit) ov.push(nm(kids[i]) + ' ↔ ' + nm(kids[j]) + ' ' + hit);
    }
  }
  if (ov.length) out.push('겹친 형제 칸 ' + ov.length + ' · ' + ov.slice(0, 3).join(' | '));
  const fonts = new Set(), lefts = new Map();
  // 칸 가르는 잣대 = measure.mjs · measure_type.mjs 와 똑같이(display 가 inline · contents 만 칸이 아님 — inline-flex · inline-block 고리는 제 칸 → 글 한가운데 낀 고리도 왼쪽 줄로 셈)
  const blockOf = el => { for (let x = el; x && x !== v; x = x.parentElement) { const d = getComputedStyle(x).display; if (d !== 'inline' && d !== 'contents') return x; } return v; };
  const firstText = blk => { const w = document.createTreeWalker(blk, NodeFilter.SHOW_TEXT); for (let n = w.nextNode(); n; n = w.nextNode()) if (n.textContent.trim() && vis(n.parentElement)) return n; return null; };
  const w = document.createTreeWalker(v, NodeFilter.SHOW_TEXT);
  for (let n = w.nextNode(); n; n = w.nextNode()) {
    if (!n.textContent.trim()) continue; const el = n.parentElement; if (!vis(el) || inClosed(el)) continue;
    fonts.add(parseFloat(getComputedStyle(el).fontSize));
    const blk = blockOf(el), ta = getComputedStyle(blk).textAlign;
    if (firstText(blk) === n && !['center', 'right', 'end'].includes(ta) && !(skip && el.closest(skip))) { const r = document.createRange(); r.selectNodeContents(n); const q = r.getClientRects()[0]; if (q) lefts.set(Math.round(q.left), 1); }
  }
  if (fonts.size > maxFonts) out.push('글씨 크기 ' + fonts.size + '가지(' + maxFonts + '가지 이하) ' + [...fonts].sort((a, b) => a - b).join('/'));
  if (lefts.size > maxLefts) out.push('글 시작 왼쪽 줄 ' + lefts.size + '줄(' + maxLefts + '줄 이하) ' + [...lefts.keys()].sort((a, b) => a - b).join('/'));
  return out;
}, {skip, maxFonts, maxLefts});

/** css 파일(저장소 기준 경로)이 글 규칙을 지키는지 — 어긴 줄 글(빈 줄 = 모두 지킴) */
export const cssRules = file => {
  let css; try { css = fss.readFileSync(path.join(ROOT, file), 'utf8'); } catch { return []; }
  css = css.replace(/\/\*[\s\S]*?\*\//g, ''); const bad = [];
  for (const m of css.matchAll(/font-size\s*:\s*([^;}]+)/g)) if (!/^var\(--fs-[1-6]\)\s*(!important)?$/.test(m[1].trim())) bad.push('글씨 ' + m[1].trim());
  for (const m of css.matchAll(/(?:^|[;{\s])((?:margin|padding)(?:-[a-z]+)?|gap|row-gap|column-gap)\s*:\s*([^;}]+)/g)) for (const t of m[2].trim().split(/\s+/)) if (!/^(0|auto|var\(--sp-[1-3]\)|!important)$/.test(t)) bad.push(m[1] + ' ' + m[2].trim());
  return [...new Set(bad)].map(x => file + ' ' + x);
};
