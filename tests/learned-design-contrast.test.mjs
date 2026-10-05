import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

// Checks the new opaque sRGB token pairs, not complete page accessibility.
const css = readFileSync(new URL('../src/learned-design.css', import.meta.url), 'utf8');
const tokens = new Map([...css.matchAll(/--learned-([a-z-]+):\s*(#[0-9a-f]{6})\s*;/gi)]
  .map(([, name, hex]) => [name, hex]));
function luminance(hex) {
  assert.match(hex ?? '', /^#[0-9a-f]{6}$/i, 'Contrast token must be a literal opaque sRGB color');
  const linear = [1, 3, 5].map(offset => parseInt(hex.slice(offset, offset + 2), 16) / 255)
    .map(value => value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4);
  return linear[0] * 0.2126 + linear[1] * 0.7152 + linear[2] * 0.0722;
}
function contrast(foreground, background) {
  const a = luminance(tokens.get(foreground)), b = luminance(tokens.get(background));
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
}

test('learned main ink has at least 7:1 contrast on both reading surfaces', () => {
  for (const background of ['paper', 'surface']) assert.ok(contrast('ink', background) >= 7, background);
});

test('learned secondary text clears 4.5:1 without threshold rounding', () => {
  for (const background of ['paper', 'surface']) assert.ok(contrast('muted', background) >= 4.5, background);
});

test('learned warm action text clears 4.5:1 on paper and content surfaces', () => {
  for (const background of ['paper', 'surface']) assert.ok(contrast('accent', background) >= 4.5, background);
});

test('learned brass text uses a readable ink rather than the decorative gold', () => {
  for (const background of ['paper', 'surface']) assert.ok(contrast('brass-ink', background) >= 4.5, background);
});
