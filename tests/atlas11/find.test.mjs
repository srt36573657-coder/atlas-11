// 「찾기」 셈(site/app/find.js) — 2026-10-05 20:24 사장님 「아틀란스에서 종목을 찾는 기능을 넣어라」
// 한글 이름 일부 · 종목 기호 · 초성 · 미국 회사 영문 이름으로 한국 판 · 미국 판을 함께 찾는다 · 꼭 맞는 것 먼저 · 같으면 지난 20거래일 많이 오른 순
import test from 'node:test';
import assert from 'node:assert/strict';
import {norm, chosung, onlyChosung, matchScore, findIn, stockHref} from '../../site/app/find.js';
import {readJSON} from './helpers.mjs';

test('글자 다듬기 · 초성', () => {
  assert.equal(norm(' 삼성 전자 '), '삼성전자'); assert.equal(norm('BRK.B'), 'brkb'); assert.equal(norm('P&G(프록터 & 갬블)'), 'pg프록터갬블');
  assert.equal(chosung('삼성전자'), 'ㅅㅅㅈㅈ'); assert.equal(chosung('SK하이닉스'), 'SKㅎㅇㄴㅅ');
  assert.equal(onlyChosung('ㅅㅅㅈㅈ'), true); assert.equal(onlyChosung('삼ㅅ'), false);
});

test('맞는 정도 — 기호 그대로 > 이름 그대로 > 이름 시작 > 기호 시작 > 이름 안 > 영문 > 초성', () => {
  const c = {code: '005930', name: '삼성전자'}, n = {code: 'NVDA', name: '엔비디아', nameEn: 'NVIDIA Corporation'};
  assert.equal(matchScore(c, '005930'), 100); assert.equal(matchScore(c, '삼성전자'), 95); assert.equal(matchScore(c, '삼성'), 80);
  assert.equal(matchScore(c, '0059'), 70); assert.equal(matchScore(c, '전자'), 60); assert.equal(matchScore(c, 'ㅅㅅㅈㅈ'), 45); assert.equal(matchScore(c, 'ㅈㅈ'), 35);
  assert.equal(matchScore(n, 'nvda'), 100, '기호는 작은 글자로 넣어도'); assert.equal(matchScore(n, 'nvidia'), 50); assert.equal(matchScore(n, 'corp'), 40);
  assert.equal(matchScore(c, ''), 0); assert.equal(matchScore(c, '애플'), 0); assert.equal(matchScore(n, 'n'), 70, '한 글자 영문은 기호 시작으로만');
});

test('두 판을 함께 — 꼭 맞는 것 먼저 · 같은 칸은 20거래일 많이 오른 순 · 판마다 오른 순 자리', () => {
  const kr = {place: {id: 'kr', label: '한국', href: '/'}, here: true, companies: [
    {code: '005930', name: '삼성전자', change20: 0.10}, {code: '028260', name: '삼성물산', change20: 0.20}, {code: '000660', name: 'SK하이닉스', change20: 0.05}]};
  const us = {place: {id: 'us', label: '미국', href: '/us/'}, here: false, companies: [
    {code: 'NVDA', name: '엔비디아', nameEn: 'NVIDIA Corporation', change20: 0.024}, {code: 'AAPL', name: '애플', nameEn: 'Apple Inc', change20: 0.03}, {code: 'BRK.B', name: '버크셔 해서웨이 Class B', change20: -0.01}]};
  const r = findIn([kr, us], '삼성');
  assert.deepEqual(r.map(x => x.c.code), ['028260', '005930'], '둘 다 「삼성」으로 시작 → 더 오른 삼성물산 먼저');
  assert.deepEqual(r.map(x => x.rank), [1, 2], '판 안 오른 순 자리');
  assert.equal(findIn([kr, us], 'apple')[0].c.code, 'AAPL', '영문 이름');
  assert.equal(findIn([kr, us], 'ㅇㅂㄷㅇ')[0].c.code, 'NVDA', '초성');
  assert.deepEqual(findIn([kr, us], '없는회사'), []);
  const brk = findIn([kr, us], 'brk.b')[0];
  assert.equal(brk.c.code, 'BRK.B'); assert.equal(stockHref(brk), '/us/#/stock/BRK.B', '다른 시장은 그 판 주소로 · 점은 그대로');
  assert.equal(stockHref(findIn([kr, us], '005930')[0]), '#/stock/005930', '같은 판은 「#/stock/기호」');
});

test('실제 판: 삼성전자 · 엔비디아 · ㅅㅅㅈㅈ · 005930 · NVDA 가 찾아지고 맨 위에 옴', async () => {
  const kr = await readJSON('public/data/atlas11/view/board.json'), us = await readJSON('public/data/atlas11/us/view/board.json');
  const boards = [{place: {id: 'kr', label: '한국', href: '/'}, here: true, companies: kr.companies}, {place: {id: 'us', label: '미국', href: '/us/'}, here: false, companies: us.companies}];
  const top = q => findIn(boards, q)[0]?.c.code;
  assert.equal(top('삼성전자'), '005930'); assert.equal(top('005930'), '005930'); assert.equal(top('엔비디아'), 'NVDA'); assert.equal(top('NVDA'), 'NVDA');
  assert.ok(findIn(boards, 'ㅅㅅㅈㅈ').some(x => x.c.code === '005930'), '초성으로 삼성전자');
  assert.equal(new Set(findIn(boards, '반도').map(x => x.place.id)).size >= 1, true);
  assert.ok(boards.every(b => b.companies.length === 365));
});
