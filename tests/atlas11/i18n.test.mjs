// 언어팩(site/app/i18n.js · site/app/i18n/en.json · zh.json) — 2026-10-06 20:33 사장님 「친구가 중국 그리고 미국인이야 언어팩을 만들어 줘야해」
// ① 사전 틀의 자리표({n} {d} {t} {e} {q})가 한국어 틀과 같은 수만큼 쓰였나(값이 빠지거나 엉뚱한 값이 들어가지 않게)
// ② 날짜 · 시각 · 만 단위 · 회사 이름 · 「…」 안 글이 그 말로 바뀌나 ③ 한국어로 볼 때는 아무것도 바꾸지 않나
// 말 고르기: 같은 주소 ?lang=en|zh|ko(위 막대 말 단추 · 2026-10-06 22:00 「한도메인에서 탭을 누르면 영어 중국어가 나오게 해야 돼」) · 기기에 기억
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

// 2026-10-07 05:13 「언어팩을 주식시장이 있는 전세게 나라가 있잖아 다 만들어」 — 사전 파일 하나하나(말 73개 · 한국어 빼고)
const LG_FILES = fs.readdirSync(new URL('../../site/app/i18n/', import.meta.url)).filter(f => f.endsWith('.json')).map(f => f.slice(0, -5)).sort();
const PL = /\{pl:([^}]*)\}/g, CATS = new Set(['zero', 'one', 'two', 'few', 'many', 'other']);
for (const lg of LG_FILES) {
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
      for (const m of tr.matchAll(PL)) { const body = m[1]; if (/^(zero|one|two|few|many|other)=/.test(body)) { const cats = body.split('|').map(x => x.split('=')[0]); if (!cats.every(c => CATS.has(c)) || !cats.includes('other')) bad.push(`{pl:…} 셈 이름: ${tr}`); } else if (!body.includes('|')) bad.push(`{pl:한|여럿} 모양: ${tr}`); }
      if (/[{}]/.test(tr.replace(/\{(d|t|e|n|q)\d*\}|\{pl:[^}]*\}/g, ''))) bad.push(`모르는 {…}: ${tr}`);
    }
    if (j.quotes != null) assert.ok(Array.isArray(j.quotes) && j.quotes.length === 2 && j.quotes.every(q => typeof q === 'string' && q), lg + ' quotes');
    assert.deepEqual(bad, []);
    for (const [ko, x] of Object.entries(j.entities)) { assert.ok(/[가-힣]/.test(ko), ko); assert.ok(x && !/[가-힣]/.test(x), `${ko} → ${x}`); }
    for (const [code, x] of Object.entries(j.companies)) { assert.match(code, /^\d{6}$/); assert.ok(x && !/[가-힣]/.test(x), `${code} → ${x}`); }
  });
}

test('영어판 — 날짜 · 시각 · 만 단위 · 이름 · 「…」 · 단수/복수', async () => {
  globalThis.location = {pathname: '/', search: '?lang=en'};
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
  globalThis.location = {pathname: '/', search: '?lang=en'};
  const m = await import('../../site/app/i18n.js?en2');
  m.useDict({templates: {}, companies: {}, entities: {}});
  const board = {companies: [{code: '207940', name: '가회사'}, {code: '159010', name: '나회사'}, {code: 'MRK', name: '머크', nameEn: 'Merck & Co Inc'}, {code: 'JPM', name: '제이피모건', nameEn: 'JPMorgan Chase & Co.'}, {code: 'GM', name: '지엠', nameEn: 'General Motors Co'}]};
  m.addBoardNames(board, {'207940': {nameEn: 'Samsung Biologics Co.,Ltd.'}, '159010': {nameEn: 'Asflow Co Ltd'}});
  assert.equal(m.t('가회사'), 'Samsung Biologics'); assert.equal(m.t('나회사'), 'Asflow');
  assert.equal(m.t('머크'), 'Merck & Co'); assert.equal(m.t('제이피모건'), 'JPMorgan Chase & Co.'); assert.equal(m.t('지엠'), 'General Motors');
  assert.equal(board.companies[0].nameEn, 'Samsung Biologics', '한국 회사도 영어 이름으로 찾기(언어판에서만)');
});

test('중국어판 — 날짜 · 만 단위는 万 그대로', async () => {
  globalThis.location = {pathname: '/us/', search: '?lang=zh'};
  const m = await import('../../site/app/i18n.js?zh');
  assert.equal(m.LANG, 'zh'); assert.equal(m.LOCALE, 'zh-CN');
  m.useDict(dict('zh'));
  assert.match(m.t('10월 6일(화) 15:30 종가'), /10月6日\(周二\)/);
  assert.match(m.t('외국인 −13만주'), /13万股/);
});

test('한국어로 볼 때(말을 안 고름 · 엉뚱한 말 · 옛 /en 주소)는 아무것도 바꾸지 않음', async () => {
  globalThis.location = {pathname: '/us/', search: ''};
  const m = await import('../../site/app/i18n.js?ko');
  assert.equal(m.LANG, 'ko'); assert.equal(m.ON, false);
  m.useDict(dict('en'));
  assert.equal(m.t('10월 6일(화) 15:30 종가'), '10월 6일(화) 15:30 종가');
  const board = {companies: [{code: '005930', name: '삼성전자'}]}; m.addBoardNames(board, null);
  assert.equal(board.companies[0].nameEn, undefined, '한국어 판 찾기는 그대로');
});

test('말 고르기 — ?lang= 만 보고(엉뚱한 값은 한국어) · 옛 /en/ 경로만으로는 바꾸지 않음(올림 묶음이 ?lang= 로 넘김)', async () => {
  globalThis.location = {pathname: '/', search: '?lang=xx'};
  assert.equal((await import('../../site/app/i18n.js?xx')).LANG, 'ko');
  globalThis.location = {pathname: '/en/', search: ''};
  assert.equal((await import('../../site/app/i18n.js?oldpath')).LANG, 'ko');
  globalThis.location = {pathname: '/', search: '?x=1&lang=zh'};
  const z = await import('../../site/app/i18n.js?zh2'); assert.equal(z.LANG, 'zh'); assert.deepEqual(z.LANGS.slice(0, 3), ['ko', 'en', 'zh']);
  assert.equal(z.LANGS.length, 74, '말 74개(한국어 + 73)'); assert.deepEqual([...z.LANGS].filter(c => c !== 'ko').sort(), LG_FILES, '말 목록 = 사전 파일');
  assert.equal(new Set(z.LANGS).size, z.LANGS.length, '겹친 말 없음');
  assert.ok(z.LANG_LIST.every(x => x.name && x.tag && !/[가-힣]/.test(x.code === 'ko' ? '' : x.name)), '말 이름은 그 말 글자로');
  globalThis.location = {pathname: '/', search: '?lang=zh-tw'};
  assert.equal((await import('../../site/app/i18n.js?zhtw')).LANG, 'zh-TW', '대소문자 상관없이');
});


// 새 말의 날짜 · 숫자 모양 · 여럿 말(2026-10-07) — 독일어는 1.234,5 · 러시아어 여럿 말(1 · 3 · 5) · 일본어는 万 그대로 · 아랍어는 숫자를 왼쪽부터 한 덩어리
test('독일어 — 날짜(양력 · 원문 요일) · 숫자 모양 1.234,5 · 만 단위 풀어 씀', async () => {
  globalThis.location = {pathname: '/', search: '?lang=de'};
  const m = await import('../../site/app/i18n.js?de');
  assert.equal(m.LANG, 'de'); m.useDict(dict('de'));
  const d = m.t('10월 6일(화) 15:30 종가'); assert.match(d, /6\. Okt/); assert.match(d, /Di/); assert.match(d, /15:30/);
  assert.equal(m.t('외국인 −13만주'), 'Ausländische Anleger −130.000 Aktien', '만 단위를 풀고 독일어 숫자 모양 · 부호는 원문 그대로');
  assert.equal(m.t('업종 1개'), '1 Branche'); assert.equal(m.t('업종 3개'), '3 Branchen');
});
test('러시아어 — 여럿 말은 그 말 셈 규칙(1 · 3 · 5 · 21)', async () => {
  globalThis.location = {pathname: '/', search: '?lang=ru'};
  const m = await import('../../site/app/i18n.js?ru'); m.useDict(dict('ru'));
  assert.equal(m.t('업종 1개'), '1 отрасль'); assert.equal(m.t('업종 3개'), '3 отрасли'); assert.equal(m.t('업종 5개'), '5 отраслей'); assert.equal(m.t('업종 21개'), '21 отрасль');
});
test('일본어 — 万 그대로 · 날짜 10月6日(火)', async () => {
  globalThis.location = {pathname: '/', search: '?lang=ja'};
  const m = await import('../../site/app/i18n.js?ja'); m.useDict(dict('ja'));
  assert.match(m.t('외국인 −13만주'), /13万株/); assert.match(m.t('10월 6일(화) 15:30 종가'), /10月6日/); assert.match(m.t('10월 6일(화) 15:30 종가'), /火/);
});
test('아랍어 — 오른쪽부터 쓰는 말 · 숫자는 LRI…PDI 로 감싸 부호가 뒤로 가지 않음 · 양력 날짜', async () => {
  globalThis.location = {pathname: '/', search: '?lang=ar'};
  const m = await import('../../site/app/i18n.js?ar'); m.useDict(dict('ar'));
  assert.equal(m.LANG_INFO.rtl, true);
  assert.match(m.t('업종 3개'), /\u2066+3|\u20663\u2069/); assert.ok(!/[가-힣]/.test(m.t('10월 6일(화) 15:30 종가')));
  assert.match(m.t('10월 6일(화) 15:30 종가'), /6/, '아라비아 숫자(라틴) 그대로 — 기기 달력이 이슬람력 · 아랍 숫자로 바꾸지 않음');
});
