// 회사 한 곳의 짧은 요약(lib/atlas11/board.mjs briefOf) — 출목표 한 판 칸 · 업종 카드에 선 그래프와 함께 싣는 수급·기사
// 2026-10-04 22:51 사장님 「출목표만 있으면 않돼 그래프로 있어야 해 그리고 그 회사들 뉴스와 수급도」
// 실제 파일로 본다: 9/28 입력 사본 · 10/2 관측 묶음(52종목을 모은 것)
import test from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {buildBoard, validateBoard, briefOf, namesCompany} from '../../lib/atlas11/board.mjs';
import {readJSON, INPUT_928} from './helpers.mjs';

const SNAP = 'reports/atlas11/context/2026-10-02/2026-10-02T13-38-11Z.json', EVENTS = 'public/data/atlas11/schedule-events.json';
const NOW = '2026-09-28T13:00:00.000Z';
const sha = x => createHash('sha256').update(x).digest('hex');
const rehash = files => { const m = structuredClone(files.get('manifest.json')); for (const [n, v] of files) if (n !== 'manifest.json') m.files[n] = {sha256: sha(JSON.stringify(v)), bytes: 0}; files.set('manifest.json', m); return files; };

test('요약: 수급은 최근 5거래일 합(값이 빈 날은 빼고 날 수를 적음 · 0 으로 채우지 않음) · 잠정 날을 적음', () => {
  assert.equal(briefOf(null), null);
  const ctx = {day: '2026-10-02', missing: [], news: [], flows: [
    {date: '2026-09-28', foreignNet: 100, institutionNet: -50, individualNet: -50, status: 'reported'},
    {date: '2026-09-29', foreignNet: null, institutionNet: 10, individualNet: 0, status: 'reported'},
    {date: '2026-09-30', foreignNet: -30, institutionNet: 20, individualNet: 10, status: 'reported'},
    {date: '2026-10-01', foreignNet: 5, institutionNet: 5, individualNet: null, status: 'reported'},
    {date: '2026-10-02', foreignNet: 7, institutionNet: -1, individualNet: -6, status: 'provisional_same_day'}]};
  const b = briefOf(ctx, '삼성전자');
  assert.deepEqual(b.flows, {from: '2026-09-28', to: '2026-10-02', days: 4, foreign: 82, institution: -26, individual: null, provisional: ['2026-10-02']});
  assert.equal(b.news, null); assert.equal(b.newsCount, 0);
  assert.equal(briefOf({...ctx, flows: []}, 'x').flows, null, '수급이 없으면 비움');
});

test('요약: 기사는 가장 최근 것 가운데 회사 이름이 든 1건 · 없으면 비우고 몇 건 있었는지만', () => {
  const news = [
    {publishedAt: '2026-10-02T21:59:00+09:00', office: '뉴스1', title: '시장 전체 이야기'},
    {publishedAt: '2026-10-02T21:42:00+09:00', office: '문화일보', title: '“삼성 전자 주가 …” 증권사'},
    {publishedAt: '2026-10-02T20:00:00+09:00', office: '연합뉴스', title: '삼성전자, 새 공장'}];
  const b = briefOf({day: '2026-10-02', flows: [], news, missing: []}, '삼성전자');
  assert.deepEqual(b.news, {publishedAt: '2026-10-02T21:42:00+09:00', office: '문화일보', title: '“삼성 전자 주가 …” 증권사'}, '띄어쓰기를 무시하고 가장 최근 1건');
  assert.equal(b.newsCount, 3); assert.equal(b.newsNamed, 2);
  const none = briefOf({day: '2026-10-02', flows: [], news, missing: []}, 'SK하이닉스');
  assert.equal(none.news, null, '이름이 든 기사가 없으면 상관없는 기사를 싣지 않는다'); assert.equal(none.newsCount, 3); assert.equal(none.newsNamed, 0);
  assert.ok(namesCompany('LS ELECTRIC 수주', 'LS ELECTRIC') && namesCompany('naver 웹툰', 'NAVER') && !namesCompany('아무 말', ''));
});

test('판 묶음: 회사마다 요약 = 회사 파일 context 에서 다시 만든 값 · 바꿔 넣으면 BOARD_BRIEF', async () => {
  const input = await readJSON(INPUT_928), snap = await readJSON(SNAP), ev = await readJSON(EVENTS);
  const files = buildBoard({input, snap, contextFile: SNAP, events: ev.events, now: NOW}), b = files.get('board.json');
  let flows = 0, named = 0;
  for (const c of b.companies) {
    const s = files.get('stocks/' + c.code + '.json');
    assert.deepEqual(c.brief, briefOf(s.context, s.name), c.code);
    if (c.brief.flows) { flows++; const rows = s.context.flows; assert.equal(c.brief.flows.foreign, rows.reduce((t, r) => t + r.foreignNet, 0), c.code); }
    if (c.brief.news) { named++; assert.ok(namesCompany(c.brief.news.title, c.name), c.code); }
  }
  assert.equal(flows, 52, '10/2 관측 묶음은 52종목 모두 수급이 있다'); assert.ok(named >= 20 && named < 52, `이름이 든 기사가 있는 곳 ${named}`);
  assert.equal(validateBoard(files, {input, now: NOW}), true);
  const bad = new Map(files); const bb = structuredClone(b); bb.companies[0].brief.flows.foreign += 1; bad.set('board.json', bb);
  assert.throws(() => validateBoard(rehash(bad), {input, now: NOW}), /BOARD_BRIEF/);
  const none = buildBoard({input, snap: null, events: ev.events, now: NOW});
  assert.ok(none.get('board.json').companies.every(c => c.brief === null), '관측 묶음이 없으면 요약도 없음');
});
