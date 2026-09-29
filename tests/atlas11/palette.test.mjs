import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import {root} from './helpers.mjs';

/* WCAG 2.2 상대 휘도·대비 공식 (SC 1.4.3 / 1.4.11) 으로 style.css 의 색 토큰을 밝은·어두운 모드 모두 검사한다 */
const lum = hex => { const c = hex.replace('#', ''); const [r, g, b] = [0, 2, 4].map(i => parseInt(c.slice(i, i + 2), 16) / 255).map(v => v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4); return 0.2126 * r + 0.7152 * g + 0.0722 * b; };
export const contrast = (a, b) => { const [x, y] = [lum(a), lum(b)]; return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); };
function tokens(cssBlock) { const out = {}; for (const m of cssBlock.matchAll(/--([a-z0-9-]+):\s*(#[0-9A-Fa-f]{6})/g)) out[m[1]] = m[2]; return out; }

test('색 토큰 대비: 글자 색은 AA(4.5:1) 이상, 본문은 AAA(7:1), 선·표시색은 3:1 이상 — 밝은 모드·다크 모드 모두', async () => {
  const css = await fs.readFile(path.join(root, 'site/app/style.css'), 'utf8');
  const lightBlock = css.slice(css.indexOf(':root {'), css.indexOf('}', css.indexOf(':root {')));
  const darkStart = css.indexOf('@media (prefers-color-scheme: dark)'); assert.ok(darkStart > 0, '다크 모드 토큰이 있어야 한다');
  const darkBlock = css.slice(darkStart, css.indexOf('}', css.indexOf(':root {', darkStart)));
  const report = [];
  for (const [mode, t] of [['light', tokens(lightBlock)], ['dark', tokens(darkBlock)]]) {
    for (const bg of ['paper', 'bg']) {
      for (const [name, min] of [['ink', 7], ['muted', 4.5], ['primary-ink', 4.5], ['up', 4.5], ['down', 4.5], ['warn', 4.5], ['ok', 4.5]]) { const r = contrast(t[name], t[bg]); report.push(`${mode} ${name}/${bg} ${r.toFixed(2)}`); assert.ok(r >= min, `${mode} ${name} on ${bg} = ${r.toFixed(2)} < ${min}`); }
      for (const name of ['previous', 'today', 'actual']) { const r = contrast(t[name], t[bg]); report.push(`${mode} ${name}/${bg} ${r.toFixed(2)}`); assert.ok(r >= 3, `${mode} ${name} on ${bg} = ${r.toFixed(2)} < 3 (WCAG 1.4.11)`); }
    }
    // 흰/검 글자 on 주동작 단추
    const btnText = mode === 'light' ? '#FFFFFF' : '#111114';
    const r = contrast(btnText, t.primary); report.push(`${mode} button-text/primary ${r.toFixed(2)}`); assert.ok(r >= 4.5, `${mode} 단추 글자 대비 ${r.toFixed(2)}`);
    const w = contrast(t.warn, t['warn-soft'] ?? t.paper); report.push(`${mode} warn/warn-soft ${w.toFixed(2)}`); assert.ok(w >= 4.5, `${mode} 경고 배지 대비 ${w.toFixed(2)}`);
  }
  await fs.mkdir(path.join(root, 'reports/atlas11'), {recursive: true});
  await fs.writeFile(path.join(root, 'reports/atlas11/palette-contrast.txt'), report.join('\n') + '\n');
});
