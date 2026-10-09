// 「aaa7377.com 올리기」 결과 한 줄(scripts/atlas11/site_summary.mjs) — 2026-10-05 10:24 사장님 「나 여기서 클릭하면 업로드되게 만들어 줘」
// 이번 실행에서 쓴 올리기 기록만 믿는다 — 앞 실행의 「ready」를 이번 성공으로 적으면 안 된다
import test from 'node:test';
import assert from 'node:assert/strict';
import {summaryLines, kstText} from '../../scripts/atlas11/site_summary.mjs';

const dep = {at: '2026-10-05T00:47:33.503Z', state: 'ready', exitCode: 0, url: 'https://aaa7377.com', files: 792, error: null};
const man = {universeSet: {label: '업종 73개 · 365곳'}, asOf: '2026-10-02', companies: 365};

test('올리기 결과 한 줄: 이번 실행 기록이 ready 면 「올라갔습니다」 · 주소 · 한국 시각', () => {
  const t = summaryLines({dep, man, st: {api: {published: 'ready', customDomain: 'aaa7377.com'}}, since: Date.parse('2026-10-05T00:40:00Z'), deployOutcome: 'success', token: true}).join('\n');
  assert.match(t, /^## 올라갔습니다/); assert.match(t, /https:\/\/aaa7377\.com/); assert.match(t, /2026년 10월 5일 09:47/); assert.match(t, /업종 73개 · 365곳/);
});
test('올리기 결과 한 줄: 앞 실행의 기록(시작보다 이른 것)은 이번 성공으로 치지 않는다', () => {
  const t = summaryLines({dep, man, st: null, since: Date.parse('2026-10-05T03:00:00Z'), deployOutcome: 'failure', token: true}).join('\n');
  assert.match(t, /^## 못 올렸습니다/); assert.doesNotMatch(t, /올라갔습니다/);
});
test('올리기 결과 한 줄: 초대장 저장 기능(/api/invite)이 같이 올라갔는지 · 못 올렸으면 화면만 올라갔다고', () => {
  const at = {since: Date.parse('2026-10-05T00:40:00Z'), deployOutcome: 'success', token: true, man, st: null};
  assert.match(summaryLines({...at, dep: {...dep, functions: {state: 'deployed', names: ['invite']}}}).join('\n'), /초대장 저장 기능\(\/api\/invite\): 함께 올라감/);
  const failed = summaryLines({...at, dep: {...dep, functions: {state: 'failed', error: 'bundling\nfailed'}}}).join('\n');
  assert.match(failed, /^## 올라갔습니다/); assert.match(failed, /못 올림 — 화면만 올라감 · 까닭: bundling failed/);
  assert.doesNotMatch(summaryLines({...at, dep: {...dep, functions: {state: 'none'}}}).join('\n'), /초대장/);
  assert.doesNotMatch(summaryLines({...at, dep}).join('\n'), /초대장/); // 옛 기록(함수 칸 없음)
});
test('올리기 결과 한 줄: 단계가 실패면 기록이 ready 여도 「못 올렸습니다」 · 열쇠가 없으면 그 까닭', () => {
  assert.match(summaryLines({dep, man, since: 0, deployOutcome: 'failure', token: true}).join('\n'), /^## 못 올렸습니다/);
  assert.match(summaryLines({dep: null, man, since: 0, deployOutcome: 'skipped', token: false}).join('\n'), /NETLIFY_AUTH_TOKEN/);
  assert.equal(kstText('2026-10-05T15:00:00Z'), '2026년 10월 6일 00:00'); assert.equal(kstText('없음'), '시각 모름');
});
