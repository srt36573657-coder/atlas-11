import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import {root} from './helpers.mjs';

/* WCAG 2.2 상대 휘도·대비 공식 (SC 1.4.3 / 1.4.11) 으로 style.css 의 색 토큰을 밝은·어두운 모드 모두 검사한다 — 52곳 판(2026-10-04) 토큰 */
const lum = hex => { const c = hex.replace('#', ''); const [r, g, b] = [0, 2, 4].map(i => parseInt(c.slice(i, i + 2), 16) / 255).map(v => v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4); return 0.2126 * r + 0.7152 * g + 0.0722 * b; };
export const contrast = (a, b) => { const [x, y] = [lum(a), lum(b)]; return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); };
function tokens(cssBlock) { const out = {}; for (const m of cssBlock.matchAll(/--([a-z0-9-]+):\s*(#[0-9A-Fa-f]{6})/g)) out[m[1]] = m[2]; return out; }

test('색 토큰 대비: 본문 글자 7:1 · 보조 글자·링크·오름·내림·경고 글자 4.5:1 · 동그라미·막대 색 3:1 이상 — 밝은 모드·어두운 모드, 바탕·판 모두', async () => {
  const css = await fs.readFile(path.join(root, 'site/app/style.css'), 'utf8');
  const lightBlock = css.slice(css.indexOf(':root {'), css.indexOf('}', css.indexOf(':root {')));
  const darkStart = css.indexOf('@media (prefers-color-scheme: dark)'); assert.ok(darkStart > 0, '어두운 모드 토큰이 있어야 한다');
  const darkBlock = css.slice(darkStart, css.indexOf('}', css.indexOf(':root {', darkStart)));
  const light = tokens(lightBlock), report = [];
  for (const [mode, t] of [['light', light], ['dark', {...light, ...tokens(darkBlock)}]]) {
    for (const bg of ['bg', 'card']) {
      for (const [name, min] of [['ink', 7], ['ink2', 7], ['sub', 4.5], ['link', 4.5], ['up-ink', 4.5], ['down-ink', 4.5], ['warn', 4.5], ['up', 3], ['down', 3]]) {
        const r = contrast(t[name], t[bg]); report.push(`${mode} ${name}/${bg} ${r.toFixed(2)}`); assert.ok(r >= min, `${mode} ${name} on ${bg} = ${r.toFixed(2)} < ${min}`);
      }
    }
    // 둥근 단추·알약(바탕 --fill)의 글자는 본문 글자색
    const f = contrast(t.ink, t.fill); report.push(`${mode} ink/fill ${f.toFixed(2)}`); assert.ok(f >= 7, `${mode} 단추 글자 대비 ${f.toFixed(2)}`);
    // 2026-10-05 마이바흐 공부 적용: 위 막대(먹빛 · --band) 안 글자·단추 · 은빛 선 · 금빛(놋쇠빛 하나)이 닿는 모든 바탕 · 「불장」 알약
    for (const [fg, bg, min] of [['band-ink', 'band', 7], ['band-sub', 'band', 4.5], ['band-ink', 'band-fill', 7], ['eun', 'band', 3], ['fire-ink', 'fire-bg', 7],
      ['geum', 'band', 3], ['geum', 'bar', 3], ['geum', 'seg-on', 3], ['geum', 'card', 3], ['geum', 'bg', 3]]) {
      assert.ok(t[fg] && t[bg], `${mode} 토큰 --${fg} · --${bg} 이 있어야 한다`);
      const r = contrast(t[fg], t[bg]); report.push(`${mode} ${fg}/${bg} ${r.toFixed(2)}`); assert.ok(r >= min, `${mode} ${fg} on ${bg} = ${r.toFixed(2)} < ${min}`);
    }
    // 위 막대와 본문은 눈에 띄게 다른 두 바탕(두 색) — 밝은 화면 1.5:1 이상 · 밤 판은 검정 위로 올라온 판(--card)만큼 이상(어두운 쪽 휘도 대비는 공식이 눌러 잼)
    const two = contrast(t.band, t.bg), raised = contrast(t.card, t.bg), need2 = mode === 'light' ? 1.5 : raised;
    report.push(`${mode} band/bg ${two.toFixed(2)} (card/bg ${raised.toFixed(2)})`); assert.ok(two >= need2, `${mode} 두 바탕이 너무 비슷함 ${two.toFixed(2)} < ${need2.toFixed(2)}`);
  }
  // 금빛은 하나 — 밝은·어두운 화면 같은 놋쇠빛 · 샴페인색(옛 핀스트라이프 #c9ad7a · 옛 「불장」 글씨 #e2c98f)은 남지 않음
  const dark = {...light, ...tokens(darkBlock)};
  assert.equal(light.geum, dark.geum, '금빛은 밝은·어두운 화면 같은 하나');
  assert.ok(!/#c9ad7a|#e2c98f|#8c7449|--pin\b/i.test(css), '샴페인색 선·글씨가 남아 있으면 안 된다');
  await fs.mkdir(path.join(root, 'reports/atlas11'), {recursive: true});
  await fs.writeFile(path.join(root, 'reports/atlas11/palette-contrast.txt'), report.join('\n') + '\n');
});
