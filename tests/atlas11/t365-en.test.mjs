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
  // 엔진은 EN_READY(영어 판을 보일까 — 규칙 71 ③)와 따로 잼: 사본에서만 true 로 켜 봄(사이트 파일은 그대로)
  const src = R('site/atlas/i18n.js'), f = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 't365-en-')), 'i18n.mjs');
  fs.writeFileSync(f, src.replace(/export const EN_READY = (true|false);/, 'export const EN_READY = true;'));
  return import(f + '?' + lang + Math.random());
}

test('①-2 엔진(2026-10-16) — 달 값은 화면 차례대로 · 로마자 이름 회사는 사전에 없는 줄에서만 이름 · 목록 나누기는 틀 길이로', async () => {
  const m = await engine('en');
  m.useDict({templates: {'{m} 뽑았고, {m}에는 들였다. {m} 팔았다.': '{m} hired, {m} added, {m} sold.', '{e} 매출 길': '{e} sales path', '{e} {n} 원': '{e} {n} won', '{e}({n}번째) {n} 원': '{e} (No. {n}) {n} won', 'SOOP {n} 원': 'SOOP {n} won (old key)'}, entities: {}}, {'삼성전자': 'Samsung Electronics', '현대차': 'Hyundai Motor'}, {KCC: 'KCC', SOOP: 'SOOP', 'SM Life Design': 'SM Life Design'});
  assert.equal(m.t('2026년 7월 뽑았고, 8월에는 들였다. 2025년 5월 팔았다.'), 'Jul 2026 hired, Aug added, May 2025 sold.', '해 붙은 달과 해 없는 달이 섞여도 차례 그대로');
  assert.equal(m.t('KCC 매출 길'), 'KCC sales path', '로마자 이름 회사 → {e} 틀');
  assert.equal(m.t('SOOP 1000 원'), 'SOOP 1000 won (old key)', '사전에 그 이름 그대로의 틀이 있으면 그것을 먼저');
  assert.equal(m.t('삼성전자 2300000000000 원, 현대차 1100000000000 원, SM Life Design(5번째) 302700000000 원'), 'Samsung Electronics 2.3 trillion won, Hyundai Motor 1.1 trillion won, SM Life Design (No. 5) 302.7 billion won', '큰 수 · 긴 이름이 든 목록도 나눔');
  m.useDict({templates: {'{n}주 동안 가장 많이 오른 업종은 {e}예요.': 'Top-rising sector over {n} weeks: {e}.', '{n}주 동안 가장 많이 오른 업종은 {e}이에요.': 'Top-rising sector over {n} weeks: {e}.'}, entities: {'2차전지': 'Batteries', '연예 기획사': 'Entertainment Agencies', '반도체 부품': 'Semiconductor Parts'}}, {});
  for (const [ko, en] of [['1주 동안 가장 많이 오른 업종은 2차전지예요.', 'Batteries'], ['1주 동안 가장 많이 오른 업종은 연예 기획사예요.', 'Entertainment Agencies'], ['1주 동안 가장 많이 오른 업종은 반도체 부품이에요.', 'Semiconductor Parts']]) assert.equal(m.t(ko), `Top-rising sector over 1 weeks: ${en}.`, '이름 + 이에요 · 예요(2026-10-16 올린 뒤 탐침)');
});
test('①-3 실제 사전 — 업종 · 갈래 · 네이버 업종 이름이 통째로도 · 문장 속(이에요 · 예요)에서도 영어로(2026-10-16 올린 뒤 탐침)', async () => {
  const m = await engine('en'), J = f => JSON.parse(R(f)), nm = J('site/atlas/i18n/en-names.json'), core = J('site/atlas/data/core.json');
  m.useDict(J('site/atlas/i18n/en.json'), nm.names, nm.latin);
  const hasB = w => { const c = String(w).trim().slice(-1), k = c.charCodeAt(0) - 0xAC00; return k >= 0 && k <= 11171 ? k % 28 !== 0 : '013678'.includes(c); };
  const bad = [], H = /[가-힣]/;
  for (const n of [...core.industries.map(i => i.name), ...core.groups.map(g => g.name), ...core.groups.map(g => g.short).filter(Boolean), ...Object.keys(core.secInd ?? {})]) if (H.test(m.t(n))) bad.push(n);
  for (const i of core.industries) { const s = `1주 동안 가장 많이 오른 업종은 ${i.name}${hasB(i.name) ? '이에요' : '예요'}.`; if (H.test(m.t(s))) bad.push(s); }
  for (const g of core.groups) for (const w of ['가장 많이 오른', '가장 덜 내린']) { const sh = g.short ?? g.name, s = `9월 9일부터 20거래일 동안 ${w} 갈래는 ${sh}${hasB(sh) ? '이에요' : '예요'}.`; if (H.test(m.t(s))) bad.push(s); }
  assert.deepEqual(bad, [], '영어로 안 바뀐 이름 · 문장');
});
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
  assert.match(html, /<button class="ibtn lang" type="button" id="langBtn" hidden /, '지구 단추는 처음엔 숨김 — EN_READY 일 때 보임(규칙 71 ③)');
  assert.match(js, /if \(EN_READY && \$\('#langBtn'\)\) \{ \$\('#langBtn'\)\.hidden = false;/);
  const i18 = R('site/atlas/i18n.js'); assert.match(i18, /export const EN_READY = (true|false);/); assert.match(i18, /if \(!EN_READY\) return 'ko';/, '영어 판을 보이기 전에는 ?lang=en 이어도 한국어');
  assert.match(html, /<div class="sheet" id="langSheet"[^>]*>[\s\S]*data-lang="ko"[\s\S]*data-lang="en"/);
  assert.match(js, /^import \{ON as EN, EN_READY, startI18n, t as L, switchLang, nameEn\} from '\.\/i18n\.js';$/m);
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
