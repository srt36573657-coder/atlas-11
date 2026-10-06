// ATLAS 11 · 논평(site/app/comment.js) — 사장님 2026-10-07 03:17 「아틀람스를 섹시하게 논평이 있는 구조로 만든다」
//   화면마다 한 줄 · 결론 먼저 · 숫자는 판에서 그대로 · 앞날 말 · 사고팔라는 말 없음 · 부정형으로 열지 않음
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import {homeComment, mapComment, landComment, industryComment, companyComment, roadComment, agendaComment, startComment, plain} from '../../site/app/comment.js';
import {root} from './helpers.mjs';

const G = (id, label, change20, extra = {}) => ({id, label, change20, codes: [], ...extra});
const C = (code, name, change20, gid) => ({code, name, change20, group: {id: gid}});
const say = c => `${plain(c.head)} / ${plain(c.sub)}`;
const BAD = /예측|전망|예상|확률|추천|목표주가|기대감|매수|매도|사라|팔아|오를 것|내릴 것|곧|반드시|절대/;

test('불장 — 한 갈래가 불장 업종의 40% 넘으면 「판을 이끄는 건」 · 혼자 15%p 앞서면 「맨 앞은」 · 아니면 「번졌다」 · 불장 없으면 쉬어 간 판', () => {
  const lead = homeComment({groups: [G('a', '반도체 장비', .4, {hot: true}), G('b', '반도체 소재', .3, {hot: true}), G('c', '은행', .2, {hot: true}), G('d', '조선', .1, {hot: true}), G('e', '음식료', -.1)]});
  assert.equal(say(lead), '판을 이끄는 건 반도체 / 불장 4개 중 2개 · 갈래 평균 +35.0%'); assert.equal(lead.kind, 'lead');
  const solo = homeComment({groups: [G('a', '반도체 장비', .5, {hot: true}), G('c', '은행', .2, {hot: true}), G('d', '조선', .1, {hot: true})]});
  assert.equal(say(solo), '맨 앞은 반도체 장비 / +50.0% · 2위와 차이 30%p');
  const spread = homeComment({groups: [G('a', '반도체 장비', .3, {hot: true}), G('c', '은행', .25, {hot: true}), G('d', '조선', .2, {hot: true})]});
  assert.equal(say(spread), '불은 3갈래로 번졌다 / 불장 3개 · 1위 반도체 장비 +30.0%');
  assert.equal(plain(homeComment({groups: [G('a', '은행', -.1), G('b', '조선', -.2)]}).head), '업종 2개가 쉬어 간 판');
});

test('지도 · 갈래 — 가장 붉은 땅(갈래 평균) · 붉은 땅 수 · 가장 푸른 땅 / 갈래를 이끄는 업종', () => {
  const b = {groups: [G('a', '반도체 장비', .4), G('b', '은행·카드', -.05), G('c', '보험', -.01), G('d', '조선', .1)]};
  assert.equal(say(mapComment(b)), '가장 붉은 땅, 반도체 / +40.0% · 땅 3개 중 2개 붉음 · 가장 푸른 땅 금융·지주 −3.0%');
  assert.equal(say(mapComment({groups: [G('b', '은행·카드', -.05), G('d', '조선', -.1)]})), '땅 2개 모두 푸르다 / 가장 덜 내린 땅 금융·지주 −5.0%');
  const fin = landComment(b, 'fin');
  assert.equal(say(fin), '가장 덜 내린 건 보험 / −1.0% · 2위 은행·카드 −5.0%');
  assert.equal(say(landComment({groups: [G('a', '반도체 장비', .4), G('a2', '반도체 소재', .1)]}, 'semi')), '갈래를 이끄는 건 반도체 장비 / +40.0% · 2위 반도체 소재 +10.0%');
  assert.equal(landComment(b, 'nope'), null);
});

test('업종 · 회사 — 모두 오름 · 모두 내림 · 이끄는 회사 / 업종 안 자리 · 업종과 거꾸로(둘 다 2% 넘게 움직였을 때만)', () => {
  const g = G('g', '반도체 장비', .1, {codes: ['1', '2', '3']});
  const up = {groups: [g], companies: [C('1', '가', .3, 'g'), C('2', '나', .05, 'g'), C('3', '다', .01, 'g')]};
  assert.equal(say(industryComment(up, g)), '3곳 모두 올랐다 / 맨 앞 가 +30.0% · 업종 평균 +10.0%');
  const mix = {groups: [g], companies: [C('1', '가', .3, 'g'), C('2', '나', -.05, 'g'), C('3', '다', .01, 'g')]};
  assert.equal(say(industryComment(mix, g)), '업종을 이끄는 건 가 / +30.0% · 업종 평균 +10.0% · 3곳 중 2곳 오름');
  const dn = {groups: [g], companies: [C('1', '가', -.3, 'g'), C('2', '나', -.05, 'g'), C('3', '다', -.01, 'g')]};
  assert.equal(say(industryComment(dn, g)), '3곳 모두 내렸다 / 가장 덜 내린 다 −1.0% · 업종 평균 +10.0%');
  assert.equal(plain(companyComment(mix, mix.companies[0]).head), '업종 3곳 중 맨 앞');
  assert.equal(plain(companyComment(mix, mix.companies[2]).head), '업종 3곳 중 2위');
  assert.equal(plain(companyComment(mix, mix.companies[1]).head), '업종과 거꾸로 갔다');
  const tiny = {groups: [g], companies: [C('1', '가', .3, 'g'), C('2', '나', -.01, 'g'), C('3', '다', .01, 'g')]};
  assert.equal(plain(companyComment(tiny, tiny.companies[1]).head), '업종 3곳 중 맨 뒤', '1% 내림은 거꾸로라 하지 않음');
  assert.equal(companyComment(mix, {code: 'x', change20: .1, group: {id: 'none'}}), null);
});

test('출목표 · 일정 · 처음 — 많은 쪽을 말함 / 별이 가장 많은 일정 중 가장 이른 날 / 보통의 절반 · 언제 여나', () => {
  const b = {companies: [C('1', '가', .3), C('2', '나', -.1), C('3', '다', .2), C('4', '라', null)]};
  assert.equal(say(roadComment(b)), '4곳 중 2곳이 올랐다 / ', '근거 줄 없음 — 아래 칸들이 오른 순');
  assert.equal(plain(roadComment({companies: [C('1', '가', -.3), C('2', '나', -.1), C('3', '다', .2)]}).head), '3곳 중 2곳이 내렸다');
  const ev = [{date: '2026-10-29', name: '미국 연준 금리 결정', level: 3, scope: 'market'}, {date: '2026-10-22', name: '한국은행 금리 결정', level: 3, scope: 'market'}, {date: '2026-10-15', name: '미국 소비자물가 발표', level: 2, scope: 'market'}];
  assert.equal(say(agendaComment(ev)), '10월 22일(목), 한국은행 금리 결정 / 별 3개 — 일정 3건 중 별이 가장 많고 가장 이른 날');
  assert.equal(agendaComment([]), null);
  const st = p => ({start: {ready: true, picks: p.map(m => ({mdd: m})), typical: {mdd: -.5}}});
  assert.equal(say(startComment(st([-.2, -.25, -.1, -.15, -.2]))), '다섯 곳, 보통의 절반만 떨어졌다 / 가장 깊어도 −25% · 보통 회사 −50%');
  assert.equal(plain(startComment(st([-.2, -.4, -.1, -.15, -.2])).head), '다섯 곳 모두 보통보다 덜 떨어졌다');
  assert.equal(say(startComment({start: {ready: false, readyMonth: '2028-08', have: {days: 294}}})), '2028년 8월에 문을 연다 / 3년 종가가 쌓이는 때 · 지금은 294거래일');
});

test('저장소의 판 — 화면마다 한 줄이 나오고 · 앞날 · 사고팔기 말 없음 · 부정형으로 열지 않음 · 머리 한 줄은 스물다섯 자 안', async () => {
  for (const at of ['public/data/atlas11/view', 'public/data/atlas11/us/view']) {
    const b = JSON.parse(await fs.readFile(path.join(root, at, 'board.json'), 'utf8'));
    const g = b.groups[0], s = b.companies.find(c => c.group?.id === g.id);
    const all = [homeComment(b), mapComment(b), industryComment(b, g), companyComment(b, s), roadComment(b), startComment(b)];
    for (const c of all) {
      assert.ok(c && plain(c.head).trim() && (c.id === 'road' || plain(c.sub).trim()), at + ' 빈 논평');
      assert.doesNotMatch(say(c), BAD, at + ' ' + say(c));
      assert.doesNotMatch(plain(c.head), /^(없|못|아직|안 )/, '부정형으로 열지 않음 ' + plain(c.head));
      assert.ok(plain(c.head).length <= 25, '머리 25자 안 ' + plain(c.head));
    }
  }
});
