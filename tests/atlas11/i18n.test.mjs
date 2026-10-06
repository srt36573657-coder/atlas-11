// 언어팩(site/app/i18n.js · site/app/i18n/en.json · zh.json) — 2026-10-06 20:33 사장님 「친구가 중국 그리고 미국인이야 언어팩을 만들어 줘야해」
// ① 사전 틀의 자리표({n} {d} {t} {e} {q})가 한국어 틀과 같은 수만큼 쓰였나(값이 빠지거나 엉뚱한 값이 들어가지 않게)
// ② 날짜 · 시각 · 만 단위 · 회사 이름 · 「…」 안 글이 그 말로 바뀌나 ③ 한국어 판(/ · /us/)에서는 아무것도 바꾸지 않나
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const dict = lg => JSON.parse(fs.readFileSync(new URL(`../../site/app/i18n/${lg}.json`, import.meta.url), 'utf8'));
const KINDS = ['d', 't', 'e', 'n', 'q'];
const count = (s, k) => (s.match(new RegExp(`\\{${k}\\}`, 'g')) ?? []).length;
/** 번역 틀이 쓰는 자리(fill 과 같은 셈: 번호 없는 것은 나온 차례대로 · {n2} 는 두 번째) */
function used(tr, k) {
  const out = new Set(); let at = 0;
  for (const m of tr.matchAll(new RegExp(`\\{${k}(\\d*)\\}`, 'g'))) out.add(m[1] ? Number(m[1]) - 1 : at++);
  return out;
}

for (const lg of ['en', 'zh']) {
  test(`${lg} 사전 — 틀마다 자리표가 한국어 틀과 같은 수(빠짐 · 남음 없음)`, () => {
    const j = dict(lg); assert.equal(j.schema, 'atlas11-i18n-1'); assert.equal(j.lang, lg);
    const bad = [];
    for (const [ko, tr] of Object.entries(j.templates)) {
      assert.equal(typeof tr, 'string', ko);
      for (const k of KINDS) {
        const want = count(ko, k), got = used(tr, k);
        const ok = got.size === want && [...got].every(i => i >= 0 && i < want);
        if (!ok) bad.push(`${k}: ${ko} → ${tr}`);
      }
      if (/[가-힣]/.test(tr)) bad.push(`한국어가 남음: ${ko} → ${tr}`);
    }
    assert.deepEqual(bad, []);
    for (const [ko, x] of Object.entries(j.entities)) { assert.ok(/[가-힣]/.test(ko), ko); assert.ok(x && !/[가-힣]/.test(x), `${ko} → ${x}`); }
    for (const [code, x] of Object.entries(j.companies)) { assert.match(code, /^\d{6}$/); assert.ok(x && !/[가-힣]/.test(x), `${code} → ${x}`); }
  });
}

test('영어판 — 날짜 · 시각 · 만 단위 · 이름 · 「…」 · 단수/복수', async () => {
  globalThis.location = {pathname: '/en/'};
  const m = await import('../../site/app/i18n.js?en');
  assert.equal(m.LANG, 'en'); assert.equal(m.ON, true); assert.equal(m.LOCALE, 'en-US');
  m.useDict(dict('en'));
  m.addBoardNames({companies: [{code: '005930', name: '삼성전자'}, {code: '999999', name: '미래에셋'}]}, {'999999': {nameEn: 'KOSPI'}});
  assert.equal(m.t('삼성전자'), 'Samsung Electronics', '손으로 고른 영어 이름');
  assert.equal(m.t('미래에셋'), 'Miraeeset', '시장 이름(KOSPI)은 회사 이름으로 쓰지 않고 로마자');
  assert.match(m.t('외국인 −13만 주'), /130,000/);
  const d = m.t('10월 6일(화) 15:30 종가');
  assert.match(d, /Oct 6 \(Tue\)/); assert.match(d, /15:30/); assert.ok(!/[가-힣]/.test(d), d);
  assert.equal(m.t('업종 1개'), '1 industry'); assert.equal(m.t('업종 3개'), '3 industries');
  assert.ok(!/[가-힣]/.test(m.t('업종 73개 전체는 아래 탭 「지도」')), m.t('업종 73개 전체는 아래 탭 「지도」'));
  assert.equal(m.t('Samsung'), 'Samsung', '한국어가 없는 글은 그대로');
});

test('영어 이름 다듬기 — 법인 꼬리(Co., Ltd. · Inc · Corp)는 떼고 「& Co」 는 이름으로 둠 · 찾기용 nameEn', async () => {
  globalThis.location = {pathname: '/en/'};
  const m = await import('../../site/app/i18n.js?en2');
  m.useDict({templates: {}, companies: {}, entities: {}});
  const board = {companies: [{code: '207940', name: '가회사'}, {code: '159010', name: '나회사'}, {code: 'MRK', name: '머크', nameEn: 'Merck & Co Inc'}, {code: 'JPM', name: '제이피모건', nameEn: 'JPMorgan Chase & Co.'}, {code: 'GM', name: '지엠', nameEn: 'General Motors Co'}]};
  m.addBoardNames(board, {'207940': {nameEn: 'Samsung Biologics Co.,Ltd.'}, '159010': {nameEn: 'Asflow Co Ltd'}});
  assert.equal(m.t('가회사'), 'Samsung Biologics'); assert.equal(m.t('나회사'), 'Asflow');
  assert.equal(m.t('머크'), 'Merck & Co'); assert.equal(m.t('제이피모건'), 'JPMorgan Chase & Co.'); assert.equal(m.t('지엠'), 'General Motors');
  assert.equal(board.companies[0].nameEn, 'Samsung Biologics', '한국 회사도 영어 이름으로 찾기(언어판에서만)');
});

test('중국어판 — 날짜 · 만 단위는 万 그대로', async () => {
  globalThis.location = {pathname: '/zh/us/'};
  const m = await import('../../site/app/i18n.js?zh');
  assert.equal(m.LANG, 'zh'); assert.equal(m.LOCALE, 'zh-CN');
  m.useDict(dict('zh'));
  assert.match(m.t('10월 6일(화) 15:30 종가'), /10月6日\(周二\)/);
  assert.match(m.t('외국인 −13만주'), /13万股/);
});

test('한국어 판(/ · /us/)에서는 아무것도 바꾸지 않음', async () => {
  globalThis.location = {pathname: '/us/'};
  const m = await import('../../site/app/i18n.js?ko');
  assert.equal(m.LANG, 'ko'); assert.equal(m.ON, false);
  m.useDict(dict('en'));
  assert.equal(m.t('10월 6일(화) 15:30 종가'), '10월 6일(화) 15:30 종가');
  const board = {companies: [{code: '005930', name: '삼성전자'}]}; m.addBoardNames(board, null);
  assert.equal(board.companies[0].nameEn, undefined, '한국어 판 찾기는 그대로');
});
