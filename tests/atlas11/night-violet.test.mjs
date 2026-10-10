// ATLAS 밤하늘 옷 — 사장님 2026-10-10 12:53(마카오) 「1분영상 분석후 그 중심색으로 아틀란스를 다시 색을 변경한다」(규칙 52 · docs/design/night-violet)
//   공주님 1분 영상 120장의 색 무리 → 중심색 293도 남보라 · 위 막대 = 영상 밤하늘 #141738 · 밤 바탕 = 영상 1위 무리 #111433
//   대비 기준은 palette.test.mjs(기준 숫자 그대로) · 이 시험은 옷이 영상 색인지 · 옛 청자 계열 색이 남지 않았는지 · 빨강 오름 · 파랑 내림이 그대로인지
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '../..');
const lin = c => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
/** #RRGGBB → OKLCH [L, C, h°] */
function oklch(hex) {
  const [r, g, b] = [1, 3, 5].map(i => lin(parseInt(hex.slice(i, i + 2), 16) / 255));
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b), m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b), s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
  const L = 0.2104542553 * l + 0.7936177850 * m - 0.0040720468 * s, A = 1.9779984951 * l - 2.4285922050 * m + 0.4505937099 * s, B = 0.0259040371 * l + 0.7827717662 * m - 0.8086757660 * s;
  return [L, Math.hypot(A, B), ((Math.atan2(B, A) * 180) / Math.PI + 360) % 360];
}
const css = fs.readFileSync(path.join(root, 'site/app/style.css'), 'utf8');
const block = (from) => { const a = css.indexOf(':root {', from); return Object.fromEntries([...css.slice(a, css.indexOf('}', a)).matchAll(/--([a-z0-9-]+):\s*(#[0-9A-Fa-f]{6})/g)].map(m => [m[1], m[2].toUpperCase()])); };
const light = block(0), dark = block(css.indexOf('@media (prefers-color-scheme: dark)'));

test('영상 색 그대로 — 위 막대 #141738 · 위 막대 단추 #2F3152 · 밤 바탕 #111433 · 강조 하나 = 293도 둘레 보라(밝은 · 어두운 같은 하나)', () => {
  assert.equal(light.band, '#141738'); assert.equal(light['band-fill'], '#2F3152'); assert.equal(dark.bg, '#111433');
  assert.equal(light.geum, dark.geum ?? light.geum);
  const [, C, h] = oklch(light.geum); assert.ok(C > 0.08 && h >= 280 && h <= 305, `강조 ${light.geum} 색상 ${h.toFixed(1)}`);
  for (const k of ['bg', 'card', 'ink', 'sep', 'fill', 'band-sub']) { const [, c, hh] = oklch(light[k]); assert.ok(c < 0.004 || (hh >= 270 && hh <= 305), `밝은 --${k} ${light[k]} 색상 ${hh.toFixed(1)}`); }
  for (const k of ['bg', 'card', 'ink', 'sep', 'fill', 'band', 'seg-on']) { const [, c, hh] = oklch(dark[k]); assert.ok(c < 0.004 || (hh >= 270 && hh <= 305), `어두운 --${k} ${dark[k]} 색상 ${hh.toFixed(1)}`); }
});

test('빨강 = 오름 · 파랑 = 내림 · 경고색은 그대로(규칙)', () => {
  assert.deepEqual([light.up, light.down, light['up-ink'], light['down-ink'], light.warn], ['#B4232F', '#1F4FB5', '#A41F2A', '#1C47A3', '#7D4C00']);
  assert.deepEqual([dark.up, dark.down, dark['up-ink'], dark['down-ink'], dark.warn], ['#FF5A66', '#5C97FF', '#FF8088', '#86B2FF', '#FFB547']);
});

test('옛 청자 계열 색(OKLCH 색상 120~200도) 0 — ATLAS 화면 코드 · 아이콘 · 위 막대 로고(초대장 사진 가 · 소개 영상 나 파일은 빼고)', () => {
  const KEEP = new Set(['hello.css', 'hello.js', 'hello-page.js', 'hello-share.js', 'invite.css', 'invite.js', 'invite-photo.js']);
  const files = fs.readdirSync(path.join(root, 'site/app')).filter(f => /\.(css|js)$/.test(f) && !KEEP.has(f)).map(f => path.join(root, 'site/app', f))
    .concat(['site/index.html', 'site/favicon.svg', 'site/logo-band-night.svg'].map(f => path.join(root, f)));
  const hits = [];
  for (const f of files) {
    const t = fs.readFileSync(f, 'utf8');
    const cols = [...t.matchAll(/#[0-9A-Fa-f]{6}\b/g)].map(m => m[0]).concat([...t.matchAll(/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/g)].map(m => '#' + m.slice(1, 4).map(x => Number(x).toString(16).padStart(2, '0')).join('')));
    for (const c of cols) { const [, C, h] = oklch(c); if (C >= 0.004 && h >= 120 && h <= 200) hits.push(`${path.basename(f)} ${c}`); }
  }
  assert.deepEqual(hits, []);
  assert.ok(css.includes("url('../logo-band-night.svg')"), '위 막대 로고 = 밤하늘 옷 로고');
  const idx = fs.readFileSync(path.join(root, 'site/index.html'), 'utf8');
  assert.ok(idx.includes(`content="${light.band}" media="(prefers-color-scheme: light)"`) && idx.includes(`content="${dark.band}" media="(prefers-color-scheme: dark)"`), '휴대폰 위 띠 색 = 위 막대 색');
});

test('영상 색 세기 기록(docs/design/night-violet/colors.json) — 120장 · 중심 색상 270~310도 · 가장 넓은 무리 = 밤 바탕', () => {
  const d = JSON.parse(fs.readFileSync(path.join(root, 'docs/design/night-violet/colors.json'), 'utf8'));
  assert.equal(d.frames, 120); assert.ok(d.hue_mean_weighted >= 270 && d.hue_mean_weighted <= 310);
  assert.equal(d.all8[0].hex.toUpperCase(), dark.bg);
  const sum = d.hue_hist10.slice(27, 32).reduce((a, b) => a + b, 0); assert.ok(sum > 50, `270~310도 ${sum}%`);
});
