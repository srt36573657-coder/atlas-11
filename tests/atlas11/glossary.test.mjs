// 낱말표(사장님 2026-10-18 00:15(싱가포르) 명령문 [10] 1 · 2 · 일꾼 S12x)
// 「만든 낱말은 흔한 말로 바꿔라. 낱말표 한 곳에서 바꾼다. 갈래 → 큰 업종, 몸값 → 회사 크기, 한 회사 한 표 → 평균, 큰 회사는 크게 → 큰 회사 기준,
//  20거래일 → 한 달, 다섯 문 → 조건 다섯, 쉬는 돈 → 현금으로 둠. 영어 사전도 같이.」 · 「「챕터」 낱말은 빼라. 7단 구조와 이름은 그대로 둬라.」
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {gloss, glossEn, GLOSSARY} from '../../site/next/glossary.js';

const OLD = /갈래|몸값|한 회사 한 표|큰 회사는 크게|(?<![\d.,])20\s?거래일|다섯 문(?![장제서])|쉬는 돈|챕터/;

test('낱말 여덟 — 기본', () => {
  const cases = [
    ['갈래', '큰 업종'], ['큰 갈래', '큰 업종'], ['반도체 갈래', '반도체 큰 업종'], ['큰 갈래 10개', '큰 업종 10개'],
    ['몸값', '회사 크기'], ['② 몸값', '② 회사 크기'], ['업종 몸값 3등까지', '업종 회사 크기 3등까지'],
    ['한 회사 한 표', '평균'], ['한 회사 한 표 3.2%', '평균 3.2%'],
    ['큰 회사는 크게', '큰 회사 기준'], ['큰 회사는 크게 1.5%', '큰 회사 기준 1.5%'],
    ['20거래일', '한 달'], ['지난 20거래일 동안', '지난 한 달 동안'], ['20거래일 · 9월 18일부터', '한 달 · 9월 18일부터'],
    ['다섯 문을 다 지난 곳', '조건 다섯을 다 지난 곳'], ['② 다섯 문의 오늘 색', '② 조건 다섯의 오늘 색'],
    ['쉬는 돈', '현금으로 둠'], ['쉬는 돈 1,000원', '현금으로 둠 1,000원'], ['남는 몫은 쉬는 돈이에요.', '남는 몫은 현금으로 둬요.'],
    ['챕터 일곱', '7단'], ['다음 챕터 · 5 누구와 다투나 ›', '다음 단 · 5 누구와 다투나 ›'], ['챕터를 누르면 그 단이 열려요.', '단을 누르면 그 단이 열려요.']
  ];
  for (const [a, b] of cases) assert.equal(gloss(a), b, a);
});

test('토씨가 받침에 맞음(받침 없음 → 있음 · 있음 → 없음)', () => {
  const cases = [
    ['갈래가', '큰 업종이'], ['갈래는', '큰 업종은'], ['갈래를', '큰 업종을'], ['갈래와', '큰 업종과'], ['갈래로', '큰 업종으로'], ['갈래로는', '큰 업종으로는'],
    ['갈래예요', '큰 업종이에요'], ['갈래의', '큰 업종의'], ['갈래에서', '큰 업종에서'], ['갈래마다', '큰 업종마다'], ['큰 갈래부터 담아 보세요', '큰 업종부터 담아 보세요'],
    ['이 갈래가 가장 낮던 날', '이 큰 업종이 가장 낮던 날'], ['업종 · 갈래가 없어요', '업종 · 큰 업종이 없어요'],
    ['몸값이 같으면', '회사 크기가 같으면'], ['몸값은 자료를', '회사 크기는 자료를'], ['몸값을', '회사 크기를'], ['몸값과', '회사 크기와'], ['몸값으로', '회사 크기로'], ['몸값이에요', '회사 크기예요'],
    ['한 회사 한 표로 많이 오른 차례', '평균으로 많이 오른 차례'], ['한 회사 한 표를', '평균을'], ['한 회사 한 표가', '평균이'],
    ['챕터가', '단이']
  ];
  for (const [a, b] of cases) assert.equal(gloss(a), b, a);
});

test('뜻이 다른 갈래 · 겹말 · 어색한 짝', () => {
  const cases = [
    ['멍거 갈래는 3년 성적표만, 린치 갈래는 3년 성적표와', '멍거 조건은 3년 성적표만, 린치 조건은 3년 성적표와'],
    ['멍거 갈래에서 값이', '멍거 조건에서 값이'],
    ['깔때기 두 갈래', '깔때기 두 가지'], ['여러 갈래로 나뉜 사업 구조', '여러 가지로 나뉜 사업 구조'],
    ['유행을 타는 옷 브랜드라 몇 해 뒤 갈래가 넓은 쪽에 가깝습니다.', '유행을 타는 옷 브랜드라 몇 해 뒤 범위가 넓은 쪽에 가깝습니다.'],
    ['장 따라 크게 오르내려 3년 갈래가 아주 넓은 쪽에 가깝습니다.', '장 따라 크게 오르내려 3년 범위가 아주 넓은 쪽에 가깝습니다.'],
    ['한 갈래는 함께 움직이기 쉽습니다.', '같은 큰 업종은 함께 움직이기 쉽습니다.'],
    ['몸값 큰 차례예요.', '회사 크기가 큰 차례예요.'],
    ['TIGER은 몸값이 큰 회사일수록 크게 쳐서 센 업종 지수가', 'TIGER은 큰 회사일수록 크게 쳐서 센 업종 지수가'],
    ['업종마다 그 업종 회사들이 오른 비율을 한 회사 한 표로 평균했어요.', '업종마다 그 업종 회사들이 오른 비율을 평균했어요.'],
    ['큰 회사는 크게 치면', '큰 회사 기준으로 치면'],
    ['20거래일(약 한 달) 뒤', '한 달 뒤']
  ];
  for (const [a, b] of cases) assert.equal(gloss(a), b, a);
});

test('바꾸지 않는 것 — 다른 수 · 다른 낱말', () => {
  for (const s of ['120거래일', '60거래일 동안', '지난 5거래일', '다섯 문장', '다섯 문제를 풀어요', '쉬는 날', '큰 회사', '평균', '한 달', '조건 다섯', '7단 중 3단', '돈을 쉬게']) assert.equal(gloss(s), s, s);
  assert.equal(gloss(null), null); assert.equal(gloss(''), '');
});

test('두 번 바꿔도 같음(이미 바뀐 글은 그대로)', () => {
  for (const [o] of GLOSSARY) {
    const s = o.replace(/\(\?<?[=!][^)]*\)/g, '').replace(/\\s\?/g, ' ').replace(/\\\(|\\\)/g, '').replace(/\(([^|)]*)\|[^)]*\)/g, '$1').replace(/\\d|\[[^\]]*\]|\?|\\/g, '');
    const once = gloss(s); assert.equal(gloss(once), once, s);
  }
});

test('영어 사전 틀 한국어를 낱말표로 바꾸면 옛 낱말이 남지 않음(숫자 20 · 이름 반도체로 채움)', async () => {
  const S = JSON.parse(await readFile(new URL('../../scripts/atlas11/next/i18n/en-src.json', import.meta.url), 'utf8'));
  let n = 0;
  for (const k of Object.keys(S.templates)) {
    if (!OLD.test(k.replace(/\{n\d?\}/g, '20'))) continue;
    const s = k.replace(/\{n\d?\}/g, '20').replace(/\{e\d?\}/g, '반도체').replace(/\{d\d?\}/g, '10월 16일').replace(/\{q\d?\}/g, '「보기」').replace(/\{m\d?\}/g, '9월').replace(/\{t\d?\}/g, '15:30');
    const o = gloss(s); n++;
    assert.ok(!OLD.test(o), `옛 낱말 남음: ${s} → ${o}`);
  }
  assert.ok(n > 100, '틀 수 ' + n);
});

test('영어 사전 값 — 옛 뜻 영어 없음(갈래 · 몸값 · 한 회사 한 표 · 큰 회사는 크게 · 다섯 문 · 쉬는 돈 · 챕터 열쇠)', async () => {
  const S = JSON.parse(await readFile(new URL('../../scripts/atlas11/next/i18n/en-src.json', import.meta.url), 'utf8'));
  const BAD = [[/갈래/, /(?<![Ss]ector )\b[Gg]roups?\b|\bpicks\b/], [/몸값/, /market cap|[Vv]aluation/], [/한 회사 한 표/, /equal weight|one vote/i], [/큰 회사는 크게/, /^By size$|count more:/], [/다섯 문/, /five (gates|checks)/], [/쉬는 돈/, /^Cash\b|stays as cash/], [/챕터/, /chapter/i]];
  for (const [k, v] of Object.entries(S.templates)) for (const [kre, vre] of BAD) if (kre.test(k)) assert.ok(!vre.test(v), `「${k}」 → ${v}`);
});

test('영어 화면 — 20 trading days → one month(다른 수는 그대로)', () => {
  const cases = [
    ['Over the past 20 trading days', 'Over the past month'], ['Over the 20 trading days from Sep 18, the sector group that rose most was Semiconductors.', 'Over the month from Sep 18, the sector group that rose most was Semiconductors.'],
    ['DGI: 20-trading-day line', 'DGI: one-month line'], ['3.2% over 20 trading days (average)', '3.2% over one month (average)'], ['20 trading days (about a month) later', 'one month later'],
    ['biggest 20-trading-day gain first (average)', 'biggest one-month gain first (average)'], ['the last 20 trading days', 'the last month']
  ];
  for (const [a, b] of cases) assert.equal(glossEn(a), b, a);
  for (const s of ['120 trading days', 'Over the past 5 trading days', '20 days', 'one month']) assert.equal(glossEn(s), s, s);
});
