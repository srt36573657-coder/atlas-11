#!/usr/bin/env node
// 손자병법에서 넘어간 옛 쪽(찾기 · 선물 · 고객센터 · 개인정보 처리방침 …)을 손자병법 종이 판으로 — 주문 1116-0300
//   사장님 2026-11-16(마카오) 02:00 「… 예전 디자인은 모두 삭제 하고 손자병법에 맞게 처음부터 끝까지 깔끔하개 작업해 …」
//   옛 쪽 색 파일(su-wrap-jobs.css · su-wrap-app.css · su-wrap-solo.css · su-privacy.css = 흰 판)에서 색이 든 줄만 골라
//   흰 판 색 → 손자병법 종이 판 색으로 바꾸고, 선택자마다 html.su-wrapped(손자병법에서 넘어온 때만)를 붙여 site/su/su-wrap-sj.css 로 씀
//   이 파일은 손자병법에서 넘어온 때만 받음(su-wrap.js 가 붙임 · 짝 쪽 /su/privacy.html 은 머리에) — 옛 주소로 바로 온 손님 첫 그림을 늦추지 않음(check_white ③ 2.5초)
//   옛 주소로 바로 온 손님(수르 틀 없음)은 흰 판 그대로 · 글 · 숫자 · 자리 · 크기는 그대로(색만)
//   쓰는 법: node scripts/atlas11/next/wrap_sj.mjs          → site/su/su-wrap-sj.css 를 새로 씀
//            node scripts/atlas11/next/wrap_sj.mjs --check  → 지금 파일이 새로 지은 것과 같은지만 봄(다르면 끝 코드 1)
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createRequire} from 'node:module';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');
const require = createRequire(path.join(ROOT, 'package.json'));
const postcss = require('postcss');
const SRC = ['su-wrap-jobs.css', 'su-wrap-app.css', 'su-wrap-solo.css', 'su-privacy.css'];
const OUT = path.join(ROOT, 'site/su/su-wrap-sj.css');
const A = '/* 손자병법 종이 판(주문 1116-0300) — scripts/atlas11/next/wrap_sj.mjs 가 옛 쪽 색 파일에서 지음(손으로 고치지 않음 · 손자병법에서 넘어온 때만 받음) */';

/** 흰 판 색 → 종이 판 색(바탕 #F1E3D3 · 먹 #3B1A14 · 밤색 강조 · 글은 종이 위 대비 4.5 넘게) */
export const MAP = Object.freeze({
  '#FFFFFF': '#F1E3D3', '#FAFAFA': '#F1E3D3', '#FDF9F5': '#F1E3D3',
  '#F5F5F7': '#E9D8C5', '#ECEFEE': '#E9D8C5', '#F2F2F7': '#EBDCCB', '#E8E8ED': '#E3CFBA',
  '#E5E5EA': '#D8C2AA', '#D2D2D7': '#CDB49C', '#C7C7CC': '#C2A88F', '#AEAEB2': '#A88B76',
  '#8E8E93': '#8E7466', '#86868B': '#8E7466', '#6E6E73': '#6B4A3C',
  '#48484A': '#4A2C22', '#3A3A3C': '#4A2C22', '#1D1D1F': '#3B1A14',
  '#8A5A00': '#7A4E3A', '#6B4500': '#5E4034', '#B4570A': '#7A4E3A', '#B0550A': '#7A4E3A',
  '#D97706': '#8A5A44', '#FFF4E5': '#EBD9C4', '#F3D9B8': '#D9BFA3',
});
const RGBA = [[/rgba\(\s*217\s*,\s*119\s*,\s*6\s*,/gi, 'rgba(138, 90, 68,'], [/rgba\(\s*142\s*,\s*142\s*,\s*147\s*,/gi, 'rgba(142, 116, 102,'], [/rgba\(\s*255\s*,\s*255\s*,\s*255\s*,/gi, 'rgba(241, 227, 211,']];
const HEX = /#[0-9a-f]{6}\b/gi;
const has = v => { let hit = false; v.replace(HEX, m => { if (MAP[m.toUpperCase()]) hit = true; return m; }); return hit || RGBA.some(([re]) => { re.lastIndex = 0; return re.test(v); }); };
const swap = v => { let o = v.replace(HEX, m => MAP[m.toUpperCase()] ?? m); for (const [re, to] of RGBA) { re.lastIndex = 0; o = o.replace(re, to); } return o; };
/** 선택자 하나 — 맨 앞 html 에 .su-wrapped 를 붙임(옛 규칙보다 한 칸 셈 · 손자병법에서 넘어온 때만) · html 로 시작하지 않으면 앞에 html.su-wrapped */
const sel = s => (/^html(?![\w-])/.test(s) ? s.replace(/^html/, 'html.su-wrapped') : 'html.su-wrapped ' + s);

/** 한 칸 한 줄 — 선택자 , 이어 붙임 · 색 줄만 */
const line = (sels, ds) => sels.join(', ') + ' { ' + ds.map(d => d.prop + ': ' + swap(d.value) + (d.important ? ' !important' : '')).join('; ') + '; }';
export function build() {
  const out = [];
  for (const f of SRC) {
    const root = postcss.parse(fs.readFileSync(path.join(ROOT, 'site/su', f), 'utf8'));
    const walk = node => {
      const o = [];
      for (const n of node.nodes ?? []) {
        if (n.type === 'rule') {
          if (n.parent?.type === 'atrule' && /keyframes/i.test(n.parent.name)) continue;
          const ds = (n.nodes ?? []).filter(d => d.type === 'decl' && has(d.value));
          if (ds.length) o.push(line(n.selectors.map(sel), ds));
        } else if (n.type === 'atrule' && /^(media|supports)$/i.test(n.name)) {
          const inner = walk(n);
          if (inner.length) o.push('@' + n.name + ' ' + n.params + ' {\n' + inner.join('\n') + '\n}');
        }
      }
      return o;
    };
    const o = walk(root);
    if (o.length) out.push('/* ← ' + f + ' */\n' + o.join('\n'));
  }
  return A + '\n' + out.join('\n') + '\n';
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  const next = build();
  const cur = fs.existsSync(OUT) ? fs.readFileSync(OUT, 'utf8') : '';
  if (process.argv.includes('--check')) {
    if (next !== cur) { console.error('su-wrap-sj.css 가 옛 쪽 색 파일에서 새로 지은 것과 달라요 — node scripts/atlas11/next/wrap_sj.mjs 로 다시 지어요'); process.exit(1); }
    console.log('su-wrap-sj.css = 새로 지은 그대로');
  } else {
    fs.writeFileSync(OUT, next);
    console.log('su-wrap-sj.css — ' + (next.match(/\{/g) ?? []).length + '칸 · ' + Buffer.byteLength(next) + '바이트');
  }
}
