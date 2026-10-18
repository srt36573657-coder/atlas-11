// 거르는 말 빈틈(사장님 2026-10-18 00:15(싱가포르) 「72개와 카톡 두 번 가입」 [9] 6)
// 「거르는 말 빈틈을 막아라. 점과 줄표를 지운 뒤 거르고, 넓은 숫자와 「공일공」 같은 한글 숫자는 보통 숫자로 바꿔 걸러라.
//  「사야, 담아, 추천, 무조건, 확실, 보장, 수익, t.me, 텔레」를 words.js에 더하라.」
// 빈틈마다 시험 하나 + 예외(보통 말은 그대로 지남). 사람이 쓴 글(편지 · 별명 · 보내는 말)만 — 화면 셈(screenHits)은 그대로.
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {BLOCK, OKW, hits, badWord, sendHits, gainHits, screenHits, filterForms} from '../../site/next/words.js';

const word = s => badWord(s)?.[1] ?? null;

test('새 낱말 아홉이 사람이 쓴 글 목록(BLOCK)에 있음', () => {
  const all = BLOCK.flatMap(([, ws]) => ws);
  for (const w of ['사야', '담아', '추천', '무조건', '확실', '보장', '수익', 't.me', '텔레']) assert.ok(all.includes(w), w);
});

test('새 낱말 아홉이 실제로 걸림', () => {
  for (const [s, w] of [['이건 사야 해', '사야'], ['오늘 담아', '담아'], ['추천해 줄게', '추천'], ['무조건 올라', '무조건'], ['확실한 종목', '확실'],
    ['원금 보장', '보장'], ['수익 났어', '수익'], ['t.me/abcd 로 와', 't.me'], ['텔레 방으로', '텔레']]) assert.equal(word(s), w, s);
});

test('빈틈 ① 점 — 「사.야」 「추.천」', () => {
  assert.equal(word('사.야'), '사야'); assert.equal(word('추.천.해'), '추천'); assert.equal(word('사…라'), '사라');
});

test('빈틈 ② 줄표 — 「사-야」 「무-조-건」 · 긴 줄표 · 「ㅡ」', () => {
  assert.equal(word('사-야'), '사야'); assert.equal(word('무—조—건'), '무조건'); assert.equal(word('확–실'), '확실'); assert.equal(word('사ㅡ라'), '사라');
});

test('빈틈 ③ 밑줄 — 「보_장」', () => { assert.equal(word('보_장'), '보장'); assert.equal(word('수_익'), '수익'); });

test('빈틈 ④ 가운뎃점 — 「사·야」 「담ㆍ아」 「텔・레」', () => {
  assert.equal(word('사·야'), '사야'); assert.equal(word('담ㆍ아'), '담아'); assert.equal(word('텔・레'), '텔레');
});

test('빈틈 ⑤ 띄어쓰기로 끊기 — 「사 야」 「무 조 건」(옛 그대로)', () => { assert.equal(word('사 야'), '사야'); assert.equal(word('무 조 건'), '무조건'); });

test('빈틈 ⑥ 넓은 숫자 — 「０１０」 · 동그라미 숫자 「⓪①⓪」', () => {
  assert.equal(word('０１０-1234-5678'), '010'); assert.equal(word('⓪①⓪ 1234'), '010'); assert.equal(word('ｗｗｗ'), 'www');
});

test('빈틈 ⑦ 한글 숫자 — 「공일공」 「영일영」 「빵일빵」 · 숫자와 섞어도 「0일0」 「공1공」', () => {
  for (const s of ['공일공 구공일일', '영일영 1234', '빵일빵', '0일0-1234', '공1공', '공.일.공']) assert.equal(word(s), '010', s);
});

test('빈틈 ⑧ 「t.me」 — 띄어 쓰거나 점 대신 줄표 · 넓은 글자', () => {
  for (const s of ['t . me/abc', 't-me/abc', 'ｔ．ｍｅ/abc', 'https://t.me/x']) assert.ok(['t.me', 'http'].includes(word(s)), s);
});

test('빈틈 ⑨ 보내는 말(sendHits)도 같은 꼴로 거름 · 「수익」 「수익률」 은 하나로', () => {
  assert.ok(sendHits('공일공으로 연락').some(x => x.word === '010'));
  assert.deepEqual(sendHits('수익률 좋아').map(x => x.word), ['수익']);
  assert.ok(gainHits('３０％ 벌었어').some(x => x.word === '30%'));
});

test('세 꼴(filterForms) — 띄어쓰기만 · 점과 줄표도 · 한글 숫자도', () => {
  assert.deepEqual(filterForms('공-일-공 사.야'), ['공-일-공사.야', '공일공사야', '0104야']);
});

test('예외 — 「사라지다」 꼴 · 「사라져요」는 지남(옛 그대로)', () => {
  for (const s of ['거래가 사라졌어요', '사라져요', '사라지는 것', '사라질까 봐', '사.라.졌.어']) assert.equal(badWord(s), null, s);
});

test('예외 — 「공매도」는 화면 셈(screenHits)에서 그대로 지남 · 화면 셈은 새 낱말을 안 셈(수익률 · 확실 · 보장)', () => {
  assert.deepEqual(screenHits('공매도 늘었어요'), []);
  assert.deepEqual(screenHits('수익률 · 확실 · 보장 · 담아 · 텔레'), []);
  assert.deepEqual(screenHits('사라져요 공매도 STOP'), []);
});

test('예외 — 편지 맺음말 「마음을 담아」 · 회사 이름(SK텔레콤 · 텔레칩스) · 텔레비전 · 「2010년」', () => {
  for (const s of ['마음을 담아 씁니다', '진심을 담아', 'SK텔레콤', '기산텔레콤', '세종텔레콤', '텔레칩스', '텔레비전 뉴스', '2010년에 처음 샀어요']) assert.equal(badWord(s), null, s);
  assert.equal(word('마음을 담아 이 종목 담아'), '담아'); // 맺음말 밖의 「담아」 는 그대로 걸림
  assert.ok(OKW.includes('사라지') && OKW.includes('텔레콤'));
});

test('예외 — 보통 말은 지남(한글 숫자 바꾸기가 보통 말을 거르지 않음)', () => {
  for (const s of ['이 사람', '친구 이사', '이번 주는 뉴스를 덜 보기로 했어요', '같이 공부하자', '반토막 난다면 왜일까?', 'stop', 'desktop', 'investment',
    "don't meet", '1월 10일', '돈을 잘 번대', '삼일절에 쉬었어요', '육이오']) assert.deepEqual(sendHits(s), [], s);
});

test('빈틈 ⑩ 보이지 않는 글자 — 한글 채움 · 점자 빈칸 · 숨은 하이픈 · 결합 글자 · 변형 선택자로 끊어도 걸림(2026-10-18 S7l)', () => {
  const F = String.fromCodePoint;
  const gaps = [0x3164, 0x115F, 0x1160, 0xFFA0, 0x2800, 0x180E, 0x200B, 0x00AD, 0x2060, 0x0338, 0x034F, 0xFE0F].map(c => F(c));
  for (const g of gaps) {
    const id = 'U+' + g.codePointAt(0).toString(16);
    assert.equal(word('사' + g + '야'), '사야', id); assert.equal(word('무조' + g + '건'), '무조건', id); assert.equal(word('수' + g + '익 났어'), '수익', id);
    assert.equal(word('공' + g + '일' + g + '공'), '010', id); assert.equal(word('t' + g + '.' + g + 'me/ab'), 't.me', id);
  }
  assert.ok(sendHits('30' + F(0x3164) + '%').length > 0); // 수익 숫자도 같은 꼴
  assert.equal(badWord('이번 주는' + F(0x3164) + '뉴스를 덜' + F(0x2800) + '보기로 했어요'), null); // 보통 말에 채움 글자가 끼어도 걸리지 않음
});

test('예외 — 「불확실」(모른다고 말하는 정직한 말) · 업종 이름 「호텔·레저」는 지남 · 「확실한 종목」은 걸림', () => {
  for (const s of ['시장이 불확실해서 지켜보려고 해요', '불확실성이 커요', '호텔·레저 업종', '호텔 레저가 올랐어요', '호텔.레저']) assert.equal(badWord(s), null, s);
  assert.equal(word('확실한 종목이에요'), '확실'); assert.equal(word('이건 확실 해요'), '확실');
  assert.equal(word('불확실하지만 확실한 종목'), '확실'); // 「불확실」을 지워도 뒤의 「확실」은 남아 걸림
  assert.ok(OKW.includes('불확실') && OKW.includes('호텔레저'));
});

test('옛 거르기 그대로 — 편지 시험 글', () => {
  assert.deepEqual(badWord('내일 사 세 요'), ['사고팔기 말', '사세요']);
  assert.deepEqual(badWord('지금 사라'), ['사고팔기 말', '사라']);
  assert.equal(badWord('연락은 010-1234')[0], '연락처');
  assert.equal(badWord('WWW.example')[0], '연락처');
  assert.equal(badWord('naver.com')[1], '.com');
  assert.equal(badWord('종목추천 드려요')[1], '종목추천');
  assert.equal(badWord('수익인증 방')[1], '수익인증');
  assert.equal(badWord('텔레그램 와')[1], '텔레그램');
  assert.deepEqual(hits('TOP 10').map(x => x.word), ['top']);
});

test('words.js 는 다른 파일을 부르지 않음(넷리파이 함수 묶음 · 소개 쪽 · 편지 쪽이 그대로 부름)', async () => {
  const src = await readFile(new URL('../../site/next/words.js', import.meta.url), 'utf8');
  assert.doesNotMatch(src, /^\s*import\s/m);
});
