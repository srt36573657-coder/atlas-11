// 돈 흐름 칸 · 까닭 열한 가지 셈 시험(scripts/atlas11/next/build/flow_why.mjs · 결정표 docs/design/why11-2026-10-30/decision.md)
//   사장님 2026-10-30 04:27 「왜 몰리는지 이유를 11 가지를 거기다 적어놔야 돼 … 돈 · 상황 · 정치 여러 가지 각도」 · 05:03 「응」
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {pickUp, moneyOf, goodOf, memberChanges, newsOf, itemsOf, whyOf, headOf, hasWord, jo, POLICY, ABROAD, NAMES, GROUPS, ORDER, daysKo, pct1, WHY_SCHEMA} from '../../scripts/atlas11/next/build/flow_why.mjs';
import {FLOW_N, flowRows} from '../../site/next/home-new.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const W = {from: '2026-09-30', to: '2026-10-29'};
const rep = (o = {}) => ({code: '000001', name: '가나', en: 'Gana', flows: null, news: null, disclosures: null, closeOn: () => 1000, ...o});

test('열한 가지 · 무리 넷 · 결론 차례가 결정표대로', () => {
  assert.deepEqual(Object.keys(NAMES).map(Number), [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]);
  assert.deepEqual(GROUPS.map(g => [g.ko, g.ks]), [['돈', [1, 2, 3]], ['회사', [4, 5, 6]], ['상황', [7, 8, 9]], ['정치', [10, 11]]]);
  assert.deepEqual(GROUPS.map(g => g.q.ko), ['누가 샀나', '무엇이 달라졌나', '세상 날씨', '나라 일']); // 그림 시안(04:4x) 무리 머리
  for (const g of GROUPS) assert.ok(g.en.length <= 8, `영어 무리 이름이 김 ${g.en}`); // 불빛 줄 한 줄(390 폭)
  assert.deepEqual([...ORDER], [1, 2, 3, 4, 5, 6, 10, 11]); // 7 은 다른 까닭이 없을 때만(줄마다 같은 말 — 큰 검사 1/11 진짜 자료)
  assert.equal(WHY_SCHEMA, 'dori-flow-why-1');
});

test('몰린 곳 셋 = 첫 화면 flowRows 와 같은 잣대', () => {
  const inds = [{n: '가', x: 3}, {n: '나', x: 8}, {n: '다', x: -2}, {n: '라', x: 8}, {n: '마', x: 1}, {n: '바', x: NaN}, {n: 7, x: 9}];
  const mine = pickUp(inds).map(i => i.n), screen = flowRows({inds}).up.map(i => i.n);
  assert.deepEqual(mine, ['나', '라', '가']);
  assert.deepEqual(mine, screen);
  assert.equal(FLOW_N, 3);
  assert.deepEqual(pickUp([{n: '가', x: -1}]), []);
});

test('1 · 2 · 3 돈 — 그날 주식 수 × 그날 종가 · 창 안 마지막 다섯 날 · 억 원 반올림 · 가장 많이 산 곳', () => {
  const px = {'2026-10-23': 1000, '2026-10-24': 2000};
  const a = rep({name: '가나', flows: [{date: '2026-10-23', foreignNet: 5e6}, {date: '2026-10-24', foreignNet: 1e6}, {date: '2026-09-01', foreignNet: 9e9}, {date: '2026-10-30', foreignNet: 9e9}], closeOn: d => px[d]});
  const b = rep({code: '000002', name: '다라', en: 'Dara', flows: [{date: '2026-10-24', foreignNet: -2e6}], closeOn: d => px[d]});
  const v = moneyOf([a, b], 'foreignNet', W); // 5e6×1000 + 1e6×2000 − 2e6×2000 = 5e9 + 2e9 − 4e9 = 3e9 원 = 30억
  assert.equal(v.eok, 30); assert.equal(v.days, 2); assert.equal(v.from, '2026-10-23'); assert.equal(v.to, '2026-10-24');
  assert.deepEqual(v.top, {name: '가나', en: 'Gana', eok: 70});
  const many = rep({flows: Array.from({length: 8}, (_, k) => ({date: `2026-10-${String(20 + k).padStart(2, '0')}`, foreignNet: 1e6}))});
  assert.equal(moneyOf([many], 'foreignNet', W).days, 5, '마지막 다섯 날만');
  assert.equal(moneyOf([rep({flows: []})], 'foreignNet', W), null, '날이 없으면 모름');
  assert.equal(moneyOf([], 'foreignNet', W), null);
  assert.equal(moneyOf([rep({flows: [{date: '2026-10-24', foreignNet: null}]})], 'foreignNet', W), null, '값 없는 날은 뺌');
});

test('4 좋은 소식 — 정한 종류 · 해지 · 정정 · 철회 · 취소 뺌 · 창 안 · 같은 회사 같은 종류는 한 건 · 새것 먼저', () => {
  const d = (day, title) => ({publishedAt: `${day}T09:00:00+09:00`, title});
  const r1 = rep({name: '가', disclosures: [d('2026-10-20', '단일판매ㆍ공급계약체결'), d('2026-10-21', '단일판매ㆍ공급계약체결'), d('2026-10-22', '단일판매ㆍ공급계약해지'), d('2026-10-23', '(정정)현금ㆍ현물 배당 결정'), d('2026-09-01', '주식 소각 결정'), d('2026-10-25', '기업설명회(IR) 개최')]});
  const r2 = rep({code: '000002', name: '나', disclosures: [d('2026-10-26', '현금ㆍ현물 배당 결정'), d('2026-10-27', '자기주식 취득 결정'), d('2026-10-28', '현금ㆍ현물배당을 위한 주주명부폐쇄(기준일) 결정')]});
  const g = goodOf([r1, r2], W);
  assert.deepEqual(g.map(x => `${x.name} ${x.kind}`), ['나 자사주 사기', '나 배당', '가 공급계약']);
  assert.equal(goodOf([rep()], W), null, '공시 자료가 없으면 모름');
  assert.deepEqual(goodOf([rep({disclosures: []})], W), []);
});

test('5 · 6 회사 한 달 변화 — 창 안 하루 ±35% 넘는 회사 뺌', () => {
  const N = 25, T = 24, mk = f => Float64Array.from({length: N}, (_, t) => f(t));
  const closes = new Map([['A', mk(t => 100 + t)], ['B', mk(t => (t === 10 ? 200 : 100))], ['C', mk(t => 100 - t)], ['D', mk(t => (t <= 4 ? 0 : 100))]]);
  const r = memberChanges(['A', 'B', 'C', 'D'], closes, T);
  assert.deepEqual(r.map(x => x.c), ['A', 'C'], 'B = 튄 날 · D = 20일 앞 종가 없음');
  assert.ok(Math.abs(r[0].chg - (124 / 104 - 1)) < 1e-12);
});

test('10 · 11 기사 — 정한 말 · 「이란」 「중동」은 홀로일 때만 · 창 안 · 가장 새것', () => {
  assert.ok(hasWord('이란, 사우디 공격', '이란')); assert.ok(!hasWord('가치란 무엇인가', '이란')); assert.ok(!hasWord('부천 중동신도시 분양', '중동')); assert.ok(hasWord('중동 긴장 고조', '중동'));
  for (const w of ['정책', '세제', '전쟁', '종전']) assert.ok(!POLICY.includes(w) && !ABROAD.includes(w), `뺀 말 「${w}」이 남음`);
  const n = (day, title, office = '연합뉴스') => ({publishedAt: `${day}T08:00:00+09:00`, title, office});
  const r = rep({name: '가', news: [n('2026-10-20', '정부, 물류 보조금 늘린다'), n('2026-10-25', '국회 법안 통과'), n('2026-09-01', '정부 발표'), n('2026-10-26', '배당 정책 바꾼다')]});
  const v = newsOf([r], POLICY, W);
  assert.equal(v.hit.title, '국회 법안 통과'); assert.equal(v.hit.day, '2026-10-25'); assert.equal(v.hit.word, '국회');
  assert.deepEqual(newsOf([rep({news: [n('2026-10-26', '배당 정책 바꾼다')]})], POLICY, W), {hit: null}, '「정책」만으로는 안 켜짐');
  assert.equal(newsOf([rep()], POLICY, W), null);
});

test('열한 가지 글 — 켜짐 · 꺼짐 · 모름 글과 영어 · 한 줄 결론 · 머리 글', () => {
  const money = {1: {eok: 130, days: 5, top: {name: '현대글로비스', en: 'Hyundai Glovis', eok: 117}}, 2: {eok: -38, days: 5, top: {name: 'CJ대한통운', en: 'CJ Logistics', eok: -20}}, 3: {eok: 0, days: 5, top: {name: '세방', en: 'Sebang', eok: 0}}};
  const good = [{name: 'CJ대한통운', en: 'CJ Logistics', kind: '공급계약', kindEn: 'supply contract', date: '2026-10-28'}];
  const it = itemsOf({money, good, lead: {name: '서호전기', en: 'Seoho Electric', chg: -0.003}, breadth: {up: 0, tot: 17}, mi: {m: -0.099, i: -0.037}, pol: {hit: null}, abr: null});
  const by = Object.fromEntries(it.map(x => [x.k, x]));
  assert.equal(it.length, 11);
  assert.deepEqual(it.map(x => x.s), ['on', 'off', 'off', 'on', 'off', 'off', 'on', 'q', 'q', 'off', 'q']);
  assert.equal(by[1].ko.t, '외국인이 닷새 동안 130억 원 더 샀어요.'); assert.equal(by[1].ko.sub, '가장 많이 산 곳은 현대글로비스, 117억 원이에요.');
  assert.equal(by[1].en.t, 'Foreign investors bought a net ₩13.0 billion over 5 days.');
  assert.equal(by[2].ko.t, '기관은 닷새 동안 38억 원 더 팔았어요.'); assert.equal(by[2].ko.sub, '가장 많이 판 곳은 CJ대한통운, 20억 원이에요.');
  assert.equal(by[3].ko.t, '개인은 닷새 동안 거의 사고팔지 않았어요.');
  assert.equal(by[4].ko.t, '좋은 소식 공시가 1건 있었어요.'); assert.equal(by[4].ko.sub, 'CJ대한통운 공급계약');
  assert.equal(by[5].ko.t, '끌어 올린 회사는 없어요. 서호전기가 0.3%로 가장 덜 내렸어요.');
  assert.equal(by[6].ko.t, '17곳 가운데 0곳이 올랐어요.');
  assert.equal(by[7].ko.t, '시장이 9.9% 내릴 때 3.7%만 내렸어요.'); assert.equal(by[7].en.t, 'The market fell 9.9%; this fell only 3.7%.');
  assert.equal(by[10].ko.t, '정부 정책 기사는 없었어요.'); assert.equal(by[11].ko.t, '기사 기록이 없어요.');
  for (const x of it) assert.doesNotMatch(x.en.t + (x.en.sub ?? ''), /[가-힣]/, `영어 글에 한글 ${x.k}`);
  assert.deepEqual(whyOf(it, {m: -0.099, i: -0.037}, null), {ko: ['외국인이 샀고,', '좋은 소식이 있었어요.'], en: ['Foreigners bought,', 'and good news came out.']}); // 시장 날씨(7)는 줄마다 같은 말이라 뺌
  const set = (ks, on) => it.map(x => ({...x, s: on.includes(x.k) ? 'on' : x.k === 7 ? 'on' : 'off'}));
  assert.deepEqual(whyOf(set([], [1, 2]), {m: -0.099, i: -0.037}, null).ko, ['외국인과 기관이 샀어요.']);
  assert.deepEqual(whyOf(set([], [1, 2, 3, 6]), {m: -0.099, i: -0.037}, null), {ko: ['외국인, 기관, 개인이 모두 샀고,', '여러 곳이 같이 올랐어요.'], en: ['All three groups bought,', 'and many rose together.']});
  assert.deepEqual(whyOf(set([], [2, 3]), {m: 0.02, i: 0.05}, null).en, ['Funds and retail bought.']);
  assert.deepEqual(whyOf(set([], [10, 11, 4]), {m: 0.02, i: 0.05}, null).ko, ['좋은 소식이 있었고,', '정부 정책 기사가 있었어요.']);
  assert.deepEqual(whyOf(it.map(x => (x.k === 7 || x.k === 1 ? x : {...x, s: 'off'})).map(x => (x.k === 1 ? {...x, s: 'off'} : x)), {m: 0.02, i: 0.05}, null), {ko: ['시장보다 더 올랐어요.'], en: ['Beat the market.']});
  assert.equal(whyOf(it.map(x => ({...x, s: 'off'})), {m: -0.1, i: -0.05}, null), null);
  // 기사 · 대장 켜짐 글
  const it2 = itemsOf({money: {1: null, 2: null, 3: null}, good: null, lead: {name: 'HMM', en: 'HMM', chg: 0.25}, breadth: {up: 11, tot: 17}, mi: {m: -0.1, i: 0.02}, pol: {hit: {name: '가', en: 'Ga', title: '정부, 물류 보조금 늘린다', office: '연합뉴스', day: '2026-10-27'}}, abr: {hit: null}});
  const b2 = Object.fromEntries(it2.map(x => [x.k, x]));
  assert.equal(b2[1].s, 'q'); assert.equal(b2[1].ko.t, '외국인 사고판 기록이 없어요.'); assert.equal(b2[4].s, 'q');
  assert.equal(b2[5].ko.t, 'HMM이 한 달 동안 25.0% 올라 끌었어요.'); assert.equal(b2[6].s, 'on');
  assert.equal(b2[7].ko.t, '시장이 10.0% 내릴 때 2.0% 올랐어요.');
  assert.equal(b2[10].ko.sub, '「정부, 물류 보조금 늘린다」 연합뉴스, 10월 27일'); assert.equal(b2[10].en.sub, 'Ga news, Oct 27');
  assert.deepEqual(whyOf(it2, {m: -0.1, i: 0.02}, {name: 'HMM', en: 'HMM'}), {ko: ['HMM이 끌었고,', '여러 곳이 같이 올랐어요.'], en: ['HMM led,', 'and many rose together.']});
  assert.deepEqual(whyOf(it2.map(x => (x.k === 7 ? x : {...x, s: 'off'})), {m: -0.1, i: 0.02}, null).ko, ['시장이 내릴 때 올랐어요.']); // 다른 까닭이 없을 때만 시장 날씨
  assert.deepEqual(whyOf(it2, {m: -0.1, i: 0.02}, {name: '한국항공우주산업주식회사', en: 'KAI'}).ko, ['대장 회사가 끌었고,', '여러 곳이 같이 올랐어요.']); // 긴 이름은 「대장 회사」(마디 한 줄)
  // 머리 글 — 한 곳이라도 실제로 내렸을 때만
  assert.equal(headOf(-0.099, [{i: 5}, {i: 1}, {i: 2}]), null);
  assert.deepEqual(headOf(-0.099, [{i: -3.7}, {i: -0.4}, {i: 1}]).ko, ['시장이 10% 내릴 때', '여기는 버텼어요']);
  assert.deepEqual(headOf(-0.004, [{i: -0.1}]).ko, ['시장이 0.4% 내릴 때', '여기는 버텼어요']);
  assert.deepEqual(headOf(-0.099, [{i: -3.7}]).keys.ko, ['덜 내린 곳', '더 내린 곳']);
  assert.equal(headOf(-0.01, [{i: -0.1}]).ko[0], '시장이 1% 내릴 때'); // 결정표 4 「1% 이상이면 정수」
  assert.equal(headOf(-0.0096, [{i: -0.1}]).ko[0], '시장이 1.0% 내릴 때');
  assert.deepEqual(headOf(-0.099, [{i: -3.7}]).en, ['Market fell 10%,', 'these held up']);
  assert.equal(headOf(0.02, [{i: -1}]), null);
  assert.equal(jo('HMM', '이'), 'HMM이'); assert.equal(jo('SK하이닉스', '이'), 'SK하이닉스가'); assert.equal(jo('LG', '이'), 'LG가'); assert.equal(jo('KT&G', '은'), 'KT&G는'); assert.equal(jo('S-Oil', '이'), 'S-Oil이'); assert.equal(jo('외국인', '은'), '외국인은');
  assert.equal(daysKo(5), '닷새'); assert.equal(daysKo(1), '하루'); assert.equal(pct1(-0.0994), '9.9');
});

test('저장소의 flow-why.json — 꼴 · 기준 날이 첫 화면 자료와 같음 · 열한 가지 · 앞날 말 없음', () => {
  const W2 = JSON.parse(fs.readFileSync(path.join(ROOT, 'site/next/data/flow-why.json'), 'utf8'));
  const TH = JSON.parse(fs.readFileSync(path.join(ROOT, 'site/next/data/theme-home.json'), 'utf8'));
  assert.equal(W2.schema, WHY_SCHEMA); assert.equal(W2.asOf, TH.asOf);
  assert.deepEqual(W2.inds.map(i => i.n), flowRows(TH).up.map(i => i.n));
  for (const u of W2.inds) {
    assert.equal(u.items.length, 11); assert.deepEqual(u.items.map(x => x.k), [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]);
    assert.deepEqual(u.lights, u.items.map(x => x.s)); assert.equal(u.items[6].s, 'on', '몰린 곳은 시장 날씨가 늘 켜짐');
    // 한 줄 결론 = 마디 한두 개 · 마디마다 한 줄(390 폭 · 17px — 첫 화면 가장 큰 그림 「권하지 않습니다」 줄보다 작은 글 덩이)
    assert.ok(Array.isArray(u.why.ko) && u.why.ko.length >= 1 && u.why.ko.length <= 2 && u.why.en.length === u.why.ko.length);
    for (const c of u.why.ko) assert.ok([...c].length <= 18, `한 줄 결론 마디가 김 「${c}」`);
    for (const c of u.why.en) assert.ok(c.length <= 30, `영어 한 줄 결론 마디가 김 「${c}」`);
    assert.doesNotMatch(JSON.stringify(u.items.map(x => x.en)) + JSON.stringify(u.why.en), /[가-힣]/, '영어 글에 한글이 남음(영어 판 화면)');
    const txt = (JSON.stringify(u.items) + JSON.stringify(u.why)).replace(/「[^」]*」/g, '「」'); // 기사 제목은 원문 그대로 — 우리 글만 잼
    assert.doesNotMatch(txt, /오를 것|내릴 것|사세요|파세요|추천|매수하|매도하|예측/);
  }
});
