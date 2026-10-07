// 오늘의 돈 이야기(lib/atlas11/story.mjs) — 사장님 2026-10-07 16:34 「한국·미국·일본·중국·베트남을 자동 분석해 가장 근거가 뚜렷한 돈 이야기 하나를 골라라 …
//   기업 지출·주식 투자금·기대감은 구분해라 · 실제 돈을 받는지 미확인이면 '수혜 기대' · 근거와 날짜 · 모르는 연결은 그리지 마라」
import test from 'node:test';
import assert from 'node:assert/strict';
import {classify, amountOf, newsPool, buildStory, checkStory, CHAINS, ROLES, EVENTS, roleMoves} from '../../lib/atlas11/story.mjs';
import {storyFrom} from '../../scripts/atlas11/story/build.mjs';

test('기사 제목 → 돈의 갈래(기대감이 앞섬 · 앞날 말이 든 제목은 쓰지 않음)', () => {
  assert.equal(classify('마이크론 매출 74조원 사상 최대…데이터센터 매출 1년 새 11배'), 'real');
  assert.equal(classify('일진전기, 英 해상풍력 전력망 1871억 수주'), 'real');
  assert.equal(classify('중대형 변압기 수출 55% 급증⋯美 전력망 수요에 K전력기기 출하 확대'), 'real');
  assert.equal(classify('AI 속도조절은 없다…앤스로픽 "AI 인프라에 5180억弗 투자"'), 'capex');
  assert.equal(classify('[특징주] 광통신株, 美 빅테크 투자 확대 소식에 일제히 강세'), 'stock');
  assert.equal(classify('AB운용 CIO “AI 투자 1~2년 더 간다”…메모리·전력 인프라 주목'), 'hype');
  assert.equal(classify("삼성전자 '꿈의 영업이익' 눈앞 … 100조 훌쩍 넘나"), 'hype', '실적 낱말이 있어도 「눈앞 · 넘나」면 기대감');
  assert.equal(classify('반도체 업황 전망 밝아'), null, '앞날 말(전망)이 든 제목은 쓰지 않음');
  assert.equal(classify('과천주암대토리츠, 주암지구 데이터센터 주민설명회 개최'), 'report');
  assert.equal(amountOf('AI 인프라에 5180억弗 투자'), 518e9); assert.equal(amountOf('18억 달러 투자 계획'), 1.8e9); assert.equal(amountOf('이름만'), 0);
});

test('기사 모음 — 기간(판 날짜 앞 21일 ~ 뒤 2일) · 같은 제목 하나 · 주소는 https 만', () => {
  const items = [{publishedAt: '2026-10-06T10:00:00+09:00', office: 'A', title: '변압기 수출 55% 급증', url: 'https://n.news.naver.com/x/1'},
    {publishedAt: '2026-10-06T11:00:00+09:00', office: 'B', title: '변압기 수출 55% 급증', url: 'https://n.news.naver.com/x/2'},
    {publishedAt: '2026-08-01T10:00:00+09:00', office: 'C', title: '오래된 수주', url: 'https://n.news.naver.com/x/3'},
    {publishedAt: '2026-10-05T10:00:00+09:00', office: 'D', title: '전선 공급 계약 체결', url: 'http://bad'}];
  const p = newsPool(items, '2026-10-06');
  assert.equal(p.length, 2); assert.equal(p.filter(x => x.title.startsWith('변압기')).length, 1); assert.equal(p.find(x => x.office === 'D').url, null);
});

const boardOf = (place, groups) => ({place, label: place, asOf: '2026-10-06', groups: groups.map(([label, change20, hot]) => ({label, change20, hot}))});
const N = (d, title) => ({publishedAt: `2026-10-0${d}T09:00:00+09:00`, office: '연합뉴스', title, url: `https://n.news.naver.com/a/${d}${title.length}`});

test('고르기 — 일 근거 + 실제 돈 근거가 있는 이야기 가운데 함께 오른 시장이 많은 것 · 다음 장면은 늘 「예상」', () => {
  const boards = [boardOf('kr', [['반도체 장비', .4, true], ['전력기기', .1, false], ['조선', .2, true]]), boardOf('us', [['반도체', .1, true], ['조선', .0, false]]), boardOf('jp', [['반도체 장비 및 테스트', .27, true]])];
  const items = [N(2, '앤스로픽 AI 인프라에 5180억弗 투자'), N(3, '마이크론 매출 사상 최대…데이터센터 매출 11배'), N(4, '반도체 장비 수주 1000억'), N(5, '조선 3척 수주 2조원')];
  const st = buildStory({boards, items, made: '2026-10-07T00:00:00Z'});
  assert.equal(st.none, false); assert.equal(st.chain, 'aidc-chip-power'); assert.deepEqual(checkStory(st), []);
  assert.equal(st.now.stock.markets.length, 3, '반도체가 세 시장에서 불장');
  assert.equal(st.now.real.evidence[0].title, '마이크론 매출 사상 최대…데이터센터 매출 11배', '굳은 근거(사상 최대 · 몇 배)가 먼저');
  assert.equal(st.next.label, '예상'); assert.equal(st.next.state, 'expected', '변압기 · 전선 실제 돈 기사가 없으면 수혜 기대');
  assert.equal(st.confirm, '변압기 · 전선의 주문과 수출이 11월에도 늘어난 것', '확인할 달 = 판 날짜 다음 달');
  const st2 = buildStory({boards, items: [...items, N(6, '중대형 변압기 수출 55% 급증')], made: '2026-10-07T00:00:00Z'});
  assert.equal(st2.next.state, 'started'); assert.equal(st2.next.evidence[0].kind, 'real');
});

test('근거가 모자라면 고르지 않는다 — 「없는 날」(지어내지 않음)', () => {
  const boards = [boardOf('kr', [['반도체 장비', .4, true]])];
  const st = buildStory({boards, items: [N(3, '반도체 장비주 급등')], made: '2026-10-07T00:00:00Z'});
  assert.equal(st.none, true); assert.deepEqual(checkStory(st), []); assert.equal(st.stockOnly[0].label, '반도체 장비');
});

test('이어짐 표 — 모든 연결이 역할 · 일 표에 있음 · 우리 글에 앞날 말 없음 · 확인할 달 자리 하나', () => {
  for (const c of CHAINS) {
    assert.ok(EVENTS[c.event] && ROLES[c.now] && ROLES[c.next], c.id);
    for (const k of ['why1', 'changed', 'why2', 'check', 'confirm', 'rethink']) assert.ok(String(c[k] ?? '').trim(), `${c.id} ${k}`);
    assert.ok(!/전망|예측|예상|확률|추천|목표\s?주?가|기대감/.test([c.why1, c.changed, c.why2, c.check, c.confirm, c.rethink].join(' ')), c.id);
  }
  assert.equal(roleMoves(ROLES.chip, [boardOf('kr', [['반도체', .1, true], ['반도체 장비', .3, false]])])[0].label, '반도체 장비', '그 시장에서 가장 많이 오른 그 역할 업종');
});

test('저장소 자료로 셈 — 검사 통과(고른 날이든 없는 날이든)', async () => {
  const st = await storyFrom(process.cwd(), {made: '2026-10-07T08:00:00Z'});
  assert.equal(st.schema, 'atlas11-story-1'); assert.deepEqual(st.problems ?? [], []); assert.deepEqual(checkStory(st), []);
});
