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
const say = c => `${plain(c.head)} / ${c.big?.t ?? ''} / ${plain(c.cap)}`;
const BAD = /예측|전망|예상|확률|추천|목표주가|기대감|매수|매도|사라|팔아|오를 것|내릴 것|곧|반드시|절대/;

test('불장 — 한 갈래가 불장 업종의 40% 넘으면 「판을 이끄는 건」 · 혼자 15%p 앞서면 「맨 앞은」 · 아니면 「번졌다」 · 불장 없으면 쉬어 간 판', () => {
  const lead = homeComment({groups: [G('a', '반도체 장비', .4, {hot: true}), G('b', '반도체 소재', .3, {hot: true}), G('c', '은행', .2, {hot: true}), G('d', '조선', .1, {hot: true}), G('e', '음식료', -.1)]});
  assert.equal(say(lead), '판을 이끄는 건 반도체 / +35.0% / 갈래 평균 · 불장 4개 중 2개'); assert.equal(lead.kind, 'lead'); assert.equal(lead.big.s, 1);
  const solo = homeComment({groups: [G('a', '반도체 장비', .5, {hot: true}), G('c', '은행', .2, {hot: true}), G('d', '조선', .1, {hot: true})]});
  assert.equal(say(solo), '맨 앞은 반도체 장비 / +50.0% / 지난 20거래일 · 2위와 차이 30%p');
  const spread = homeComment({groups: [G('a', '반도체 장비', .3, {hot: true}), G('c', '은행', .25, {hot: true}), G('d', '조선', .2, {hot: true})]});
  assert.equal(say(spread), '불은 3갈래로 번졌다 / 3갈래 / 불장 3개 · 1위 반도체 장비 +30.0%');
  assert.equal(plain(homeComment({groups: [G('a', '은행', -.1), G('b', '조선', -.2)]}).head), '업종 2개가 쉬어 간 판');
});

test('지도 · 갈래 — 가장 붉은 땅(갈래 평균) · 붉은 땅 수 · 가장 푸른 땅 / 갈래를 이끄는 업종', () => {
  const b = {groups: [G('a', '반도체 장비', .4), G('b', '은행·카드', -.05), G('c', '보험', -.01), G('d', '조선', .1)]};
  assert.equal(say(mapComment(b)), '가장 붉은 땅, 반도체 / +40.0% / 갈래 평균 · 땅 3개 중 2개 붉음 · 가장 푸른 땅 금융·지주 −3.0%');
  assert.equal(say(mapComment({groups: [G('b', '은행·카드', -.05), G('d', '조선', -.1)]})), '땅 2개 모두 푸르다 / −5.0% / 가장 덜 내린 땅 금융·지주');
  const fin = landComment(b, 'fin');
  assert.equal(say(fin), '가장 덜 내린 건 보험 / −1.0% / 지난 20거래일 · 2위 은행·카드 −5.0%'); assert.equal(fin.big.s, -1);
  assert.equal(say(landComment({groups: [G('a', '반도체 장비', .4), G('a2', '반도체 소재', .1)]}, 'semi')), '갈래를 이끄는 건 반도체 장비 / +40.0% / 지난 20거래일 · 2위 반도체 소재 +10.0%');
  assert.equal(landComment(b, 'nope'), null);
});

test('업종 · 회사 — 모두 오름 · 모두 내림 · 이끄는 회사 / 업종 안 자리 · 업종과 거꾸로(둘 다 2% 넘게 움직였을 때만)', () => {
  const g = G('g', '반도체 장비', .1, {codes: ['1', '2', '3']});
  const up = {groups: [g], companies: [C('1', '가', .3, 'g'), C('2', '나', .05, 'g'), C('3', '다', .01, 'g')]};
  assert.equal(say(industryComment(up, g)), '3곳 모두 올랐다 / +30.0% / 업종 평균 +10.0% · 맨 앞 가');
  const mix = {groups: [g], companies: [C('1', '가', .3, 'g'), C('2', '나', -.05, 'g'), C('3', '다', .01, 'g')]};
  assert.equal(say(industryComment(mix, g)), '업종을 이끄는 건 가 / +30.0% / 업종 평균 +10.0% · 3곳 중 2곳 오름');
  const dn = {groups: [g], companies: [C('1', '가', -.3, 'g'), C('2', '나', -.05, 'g'), C('3', '다', -.01, 'g')]};
  assert.equal(say(industryComment(dn, g)), '3곳 모두 내렸다 / −1.0% / 업종 평균 +10.0% · 가장 덜 내린 다');
  assert.equal(say(companyComment(mix, mix.companies[0])), '업종 3곳 중 맨 앞 / 1위 / 지난 20거래일 +30.0% · 업종 평균 +10.0%');
  assert.equal(plain(companyComment(mix, mix.companies[2]).head), '업종 3곳 중 2위');
  assert.equal(say(companyComment(mix, mix.companies[1])), '업종과 거꾸로 갔다 / −5.0% / 지난 20거래일 · 업종 평균 +10.0%');
  const tiny = {groups: [g], companies: [C('1', '가', .3, 'g'), C('2', '나', -.01, 'g'), C('3', '다', .01, 'g')]};
  assert.equal(plain(companyComment(tiny, tiny.companies[1]).head), '업종 3곳 중 맨 뒤', '1% 내림은 거꾸로라 하지 않음');
  assert.equal(companyComment(mix, {code: 'x', change20: .1, group: {id: 'none'}}), null);
});

test('출목표 · 일정 · 처음 — 많은 쪽을 말함 / 별이 가장 많은 일정 중 가장 이른 날 / 보통의 절반 · 언제 여나', () => {
  const b = {companies: [C('1', '가', .3), C('2', '나', -.1), C('3', '다', .2), C('4', '라', null)]};
  assert.equal(say(roadComment(b)), '4곳 중 2곳이 올랐다 / 2곳 / 지난 20거래일 · 1위 가 +30.0%');
  assert.equal(plain(roadComment({companies: [C('1', '가', -.3), C('2', '나', -.1), C('3', '다', .2)]}).head), '3곳 중 2곳이 내렸다');
  const ev = [{date: '2026-10-29', name: '미국 연준 금리 결정', level: 3, scope: 'market'}, {date: '2026-10-22', name: '한국은행 금리 결정', level: 3, scope: 'market'}, {date: '2026-10-15', name: '미국 소비자물가 발표', level: 2, scope: 'market'}];
  assert.equal(say(agendaComment(ev, '2026-10-07')), '10월 22일(목) 한국은행 금리 결정 / 15일 뒤 / 별 3개 — 일정 3건 중 별이 가장 많고 가장 이른 날');
  assert.equal(agendaComment(ev, '2026-10-07').w, '논평 · 10월 7일(수) 기준');
  assert.equal(agendaComment(ev, '2026-10-23').big.t, '6일 뒤', '지난 일정은 빼고 셈');
  assert.equal(agendaComment([]), null);
  const st = p => ({start: {ready: true, picks: p.map(m => ({mdd: m})), typical: {mdd: -.5}}});
  assert.equal(say(startComment(st([-.2, -.25, -.1, -.15, -.2]))), '다섯 곳, 보통의 절반만 떨어졌다 / −25% / 가장 깊게 떨어진 때 · 보통 회사 −50%');
  assert.equal(plain(startComment(st([-.2, -.4, -.1, -.15, -.2])).head), '다섯 곳 모두 보통보다 덜 떨어졌다');
  assert.equal(say(startComment({start: {ready: false, readyMonth: '2028-08', have: {days: 294}}})), '3년 종가가 쌓이면 문을 연다 / 2028년 8월 / 지금은 294거래일');
});

test('저장소의 판 — 화면마다 무대가 나오고(문장 · 거대 숫자 · 근거 · 날짜) · 앞날 · 사고팔기 말 없음 · 부정형으로 열지 않음 · 머리 한 줄은 스물다섯 자 안', async () => {
  for (const at of ['public/data/atlas11/view', 'public/data/atlas11/us/view']) {
    const b = JSON.parse(await fs.readFile(path.join(root, at, 'board.json'), 'utf8'));
    const g = b.groups[0], s = b.companies.find(c => c.group?.id === g.id);
    const all = [homeComment(b), mapComment(b), industryComment(b, g), companyComment(b, s), roadComment(b), startComment(b)];
    for (const c of all) {
      assert.ok(c && plain(c.head).trim() && c.big?.t && plain(c.cap).trim() && /^논평 · \d{1,2}월 \d{1,2}일\(.\) 종가$/.test(c.w), at + ' 빈 논평 ' + c?.id);
      assert.doesNotMatch(say(c), BAD, at + ' ' + say(c));
      assert.doesNotMatch(plain(c.head), /^(없|못|아직|안 )/, '부정형으로 열지 않음 ' + plain(c.head));
      assert.ok(plain(c.head).length <= 25, '머리 25자 안 ' + plain(c.head));
    }
  }
});

// 2026-10-07 04:27 「야 야 더 과감하게 그리고 혁신작으로 섹시하게 해」 — 표지 · 숫자 그림(점 하나 = 하나 · 막대 = 길이로 견줌) · 그림의 수는 문장 · 근거 줄의 수와 같다
const cnt = (c, f) => c.pic.dots.filter(f).length;
test('숫자 그림 — 점 수 · 켜진 점 · 붉은/푸른 점 · 테 · 막대가 문장의 숫자와 같다', () => {
  const lead = homeComment({groups: [G('a', '반도체 장비', .4, {hot: true}), G('b', '반도체 소재', .3, {hot: true}), G('c', '은행', .2, {hot: true}), G('d', '조선', .1, {hot: true}), G('e', '음식료', -.1)]});
  assert.equal(lead.pic.dots.length, 4, '불장 4개 = 점 4개'); assert.equal(cnt(lead, d => d.s > 0 && !d.off), 2, '이끄는 갈래 2개만 켬'); assert.equal(cnt(lead, d => d.off), 2);
  const solo = homeComment({groups: [G('a', '반도체 장비', .5, {hot: true}), G('c', '은행', .2, {hot: true}), G('d', '조선', .1, {hot: true})]});
  assert.deepEqual(solo.pic.bars.map(b => [b.v, !!b.dim]), [[.5, false], [.2, true]], '1위 · 2위 막대');
  const spread = homeComment({groups: [G('a', '반도체 장비', .3, {hot: true}), G('c', '은행', .25, {hot: true}), G('d', '조선', .2, {hot: true}), G('e', '은행·카드', -.1)]});
  assert.equal(cnt(spread, d => !d.off), 3, '불이 번진 갈래 3개 켬'); assert.equal(spread.pic.dots.length, 4, '갈래 4개 = 점 4개');
  const map = mapComment({groups: [G('a', '반도체 장비', .4), G('b', '은행·카드', -.05), G('c', '보험', -.01), G('d', '조선', .1)]});
  assert.equal(map.pic.dots.length, 3); assert.equal(cnt(map, d => d.s > 0), 2, '붉은 땅 2개'); assert.equal(cnt(map, d => d.s < 0), 1); assert.equal(map.pic.dots.findIndex(d => d.me), 0, '테 = 가장 붉은 땅');
  const g = G('g', '반도체 장비', .1, {codes: ['1', '2', '3']}), mix = {groups: [g], companies: [C('1', '가', .3, 'g'), C('2', '나', -.05, 'g'), C('3', '다', .01, 'g')]};
  assert.deepEqual(industryComment(mix, g).pic.dots.map(d => [d.s, d.me]), [[1, true], [1, false], [-1, false]], '업종: 오른 순 · 맨 앞 테');
  assert.equal(companyComment(mix, mix.companies[2]).pic.dots.findIndex(d => d.me), 1, '회사: 업종 안 2위 자리에 테');
  const road = roadComment({companies: [C('1', '가', .3), C('2', '나', -.1), C('3', '다', .2), C('4', '라', null), C('5', '마', 0)]});
  assert.equal(road.pic.dots.length, 5, '판 5곳 = 점 5개'); assert.equal(cnt(road, d => d.s > 0 && !d.off), 2, '붉은 점 = 「2곳」'); assert.equal(cnt(road, d => d.s < 0), 1); assert.equal(cnt(road, d => d.off), 1, '값 없는 곳 = 빈 점');
  const ev = [{date: '2026-10-22', name: '한국은행 금리 결정', level: 3, scope: 'market'}];
  const ag = agendaComment(ev, '2026-10-07');
  assert.equal(ag.pic.dots.length, 16, '15일 뒤 = 날 16개(모은 날 · 그날 포함)'); assert.equal(ag.pic.dots[0].mark, 'now'); assert.equal(ag.pic.dots[15].mark, 'day');
  assert.equal(agendaComment(ev, '2026-10-22').pic.dots.length, 1, '그날 = 별 하나'); assert.equal(agendaComment(ev, '2026-05-01').pic, null, '120일 넘게 남으면 그림 없음');
  const st = startComment({start: {ready: true, picks: [-.2, -.25, -.1, -.15, -.2].map(m => ({mdd: m})), typical: {mdd: -.5}}});
  assert.equal(st.pic.bars.length, 6, '다섯 곳 + 보통 회사'); assert.ok(st.pic.bars.at(-1).dim && st.pic.bars.at(-1).v === -.5);
  const wait = startComment({start: {ready: false, readyMonth: '2028-08', have: {days: 294}, rule: {days: 756}}});
  assert.ok(wait.pic.frac && Math.abs(wait.pic.bars[0].v - 294 / 756) < 1e-9, '쌓인 정도 = 294 ÷ 756');
});

test('거대 숫자 너비 — 글자 너비 합(ems)이 클수록 작게 · 한 줄에 들어가는 크기', async () => {
  const {ems} = await import('../../site/app/comment.js');
  assert.ok(Math.abs(ems('+37.7%') - 3.15) < 0.15, '+37.7% ' + ems('+37.7%'));
  assert.ok(ems('2028년 8월') > ems('205곳') && ems('205곳') > ems('1위'));
  assert.ok(ems('205 companies') > ems('205곳'), '영어로 바뀌면 다시 재어 더 작게');
});
