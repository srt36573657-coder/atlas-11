// 영어 팩 · 옛 판 영구 삭제(사장님 2026-10-15(싱가포르) 23:30 「영어 팩도 올려」 · 23:35 「예 알틀란스는 영구 삭제한다 그리고 언어팩을 선태기하면 아틀란스가 영어로 나오게 하라」)
//   ① 엔진(site/atlas/i18n.js) — 틀 · 날짜 · 달 · 시각 · 만 · 억 · 조 · 목록 나눔 · 이름 · 한국어면 아무것도 안 함
//   ② 사전(site/atlas/i18n/en.json · en-names.json) = 원본(scripts/atlas11/t365/i18n/en-src.json) + 회사 영어 이름으로 다시 만든 것 · 자리표 맞음 · 번역에 한글 없음
//   ③ 화면 — 맨 위 언어 단추 · 언어 판 · 옛 판으로 넘기던 길 없음 · 맨 아래 「옛 ATLAS」 고리 없음
//   ④ 묶기 — /old/ 를 싣지 않음 · /old/* → 첫 화면
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '../..');
const R = f => fs.readFileSync(path.join(ROOT, f), 'utf8');

async function engine(lang) {
  globalThis.location = {search: '?lang=' + lang, href: 'http://x/?lang=' + lang, pathname: '/', hash: ''};
  globalThis.localStorage = {getItem: () => null, setItem: () => {}};
  return import(path.join(ROOT, 'site/atlas/i18n.js') + '?' + lang + Math.random());
}

test('① 엔진 — 틀 · 날짜 · 달 · 시각 · 큰 수 · 목록 · 이름', async () => {
  const m = await engine('en');
  assert.equal(m.ON, true);
  m.useDict({templates: {'{d} {n}% 이상': '{d} {n}%+', '{d} 밖': '{d} out', '{n}곳': '{n} {pl:company|companies}', '{n} 원': '{n} won', '{m}부터': 'from {m}', '{d} 오후 {t}': '{d} {t} PM', '{n}년 {n}분기': 'Q{n2} {n1}'}, entities: {'반도체': 'Semiconductors'}}, {'삼성전자': 'Samsung Electronics'});
  assert.equal(m.t('10월 15일(목)'), 'Oct 15 (Thu)');
  assert.equal(m.t('9월 22일 40% 이상, 9월 24일 밖'), 'Sep 22 40%+, Sep 24 out', '날짜 목록은 「, 」로 나눔');
  assert.equal(m.t('삼성전자 · 반도체 · 1곳'), 'Samsung Electronics · Semiconductors · 1 company');
  assert.equal(m.t('12곳'), '12 companies');
  assert.equal(m.t('3,456억 원'), '345.6 billion won'); assert.equal(m.t('약 1조 2,000억 원').includes('1.2 trillion won'), false, '「약」은 사전에 없음 — 한국어 그대로');
  assert.equal(m.t('1.2조 원'), '1.2 trillion won'); assert.equal(m.t('12만 원'), '120,000 won');
  assert.equal(m.t('2025년 8월부터'), 'from Aug 2025'); assert.equal(m.t('8월부터'), 'from Aug');
  assert.equal(m.t('10월 12일 오후 2:59'), 'Oct 12 2:59 PM');
  assert.equal(m.t('2025년 3분기'), 'Q3 2025', '번호 자리표로 차례를 바꿈');
  assert.equal(m.t('없는 말'), '없는 말', '사전에 없으면 한국어 그대로');
  assert.ok(m.missing().some(x => x.key === '없는 말'), '남은 틀을 셈');
  assert.equal(m.nameEn('삼성전자'), 'Samsung Electronics');
  assert.equal(m.romanize('미래에셋'), 'Miraeeset');
});

test('② 사전 = 원본 + 회사 영어 이름 · 자리표 · 한글 없음', () => {
  const r = spawnSync('node', ['scripts/atlas11/t365/i18n_build.mjs', '--check'], {cwd: ROOT, encoding: 'utf8'});
  assert.equal(r.status, 0, r.stderr || r.stdout);
  const src = JSON.parse(R('scripts/atlas11/t365/i18n/en-src.json')), dict = JSON.parse(R('site/atlas/i18n/en.json')), nm = JSON.parse(R('site/atlas/i18n/en-names.json'));
  assert.deepEqual(dict.templates, src.templates, '사이트 사전 = 원본 틀(손으로 고치지 않음)'); assert.deepEqual(dict.entities, src.entities);
  for (const [k, v] of Object.entries(nm.names)) { assert.ok(/[가-힣]/.test(k)); assert.ok(!/[가-힣]/.test(v), `${k} → ${v}`); }
  assert.ok(nm.fromYahoo > nm.fromRoman * 10, '회사 이름은 거의 모두 영어 정식 이름');
});

test('③ 화면 — 언어 단추 · 언어 판 · 옛 판 길 없음', () => {
  const html = R('site/atlas/index.html'), js = R('site/atlas/atlas.js');
  assert.match(html, /<button class="ibtn lang" type="button" id="langBtn"/);
  assert.match(html, /<div class="sheet" id="langSheet"[^>]*>[\s\S]*data-lang="ko"[\s\S]*data-lang="en"/);
  assert.match(js, /^import \{ON as EN, startI18n, t as L, switchLang, nameEn\} from '\.\/i18n\.js';$/m);
  assert.match(js, /await startI18n\(\);/);
  assert.ok(!js.includes('/old/'), '옛 판(/old/)으로 가는 길 · 고리 없음(2026-10-15 23:35 영구 삭제)');
  assert.match(js, /const msg = h\('span', \{class: 'hmsg m4-msg', lang: 'ko'\}/, '사장님 글은 영어로 볼 때도 한국어 그대로(원문)');
});

test('④ 묶기 — /old/ 안 실음 · 옛 주소는 첫 화면', () => {
  const p = R('scripts/atlas11/package.mjs');
  assert.ok(!/path\.join\(dist, 'old'\)/.test(p), '/old/ 로 복사하지 않음');
  assert.match(p, /\/old\/\*  \/  302\\n\/old  \/  302\\n/);
  assert.ok(!/\/old\/index\.html/.test(p), '_headers 에 /old/ 없음');
});
