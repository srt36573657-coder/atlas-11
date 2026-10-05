// 미국 판 화면 묶음 — 2026-10-05 18:02 사장님 「이제는 미국 주식도 같은 개념으로 365개를 만들어라」
// 한국 판과 같은 셈(buildBoard)에 미국 입력을 넣으면: 판 목록에 미국 값(달러 · 뉴욕 16:00 · 수급 없음) · 미국 지수 띠 · 앞날 말이 든 영어 기사 제목은 빠짐
// 여기 회사 · 종가는 시험용으로 만든 가짜다(임시 폴더에만 씀 · 저장소 자료 묶음과 화면에는 쓰지 않음).
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {buildUsFiles, writeUsView, EN_PREDICTION} from '../../scripts/atlas11/us/build.mjs';
import {usPlace, usMarketOf, newYork, usCloseFinal} from '../../lib/atlas11/us/place.mjs';

function fakeInput() {
  const days = []; for (let d = new Date('2025-06-02T00:00:00Z'); days.length < 300; d = new Date(d.getTime() + 864e5)) if (d.getUTCDay() % 6) days.push(d.toISOString().slice(0, 10));
  const inds = ['반도체', '소프트웨어', '은행'], assets = [];
  inds.forEach((ind, i) => { for (let j = 0; j < 5; j++) { const code = `T${i}${j}`, base = 50 + i * 10 + j;
    assets.push({code, reuters: code + '.O', name: `시험${i}${j}`, nameEn: `Test ${i}${j}`, exchange: 'NASDAQ', sector: ind, industry: ind,
      quality: {rules: 'us-n365-v1', rank: assets.length + 1, kind: 'quality', capRank: assets.length + 1, capUsd: 1e9 - assets.length},
      prices: days.map((date, k) => ({date, close: Number((base * (1 + (i - 1) * 0.001 * k + 0.01 * Math.sin(k + j))).toFixed(2))}))}); } });
  return {schema: 'atlas11-us-input-1', place: 'us', sources: {prices: '네이버 증권 해외주식', news: '네이버 증권 해외주식 뉴스'}, calendar: {sessions: days},
    universe: {id: 'us1-test', label: '시험 15곳', rules: 'us-n365-v1', selectedAt: '2026-10-05T09:30:00Z', how: ['시험']}, assets};
}
const fakeCtx = input => ({schema: 'atlas11-us-context-1', day: '2026-10-05', fetchedAt: '2026-10-05T09:31:00Z',
  news: [{code: 'T00', items: [{id: 'a', office: '연합뉴스', publishedAt: '2026-10-04T08:00:00+09:00', title: '시험00, 새 공장 준공', url: 'https://n.news.naver.com/mnews/article/001/1', duplicateOf: null},
    {id: 'b', office: 'X', publishedAt: '2026-10-04T09:00:00+09:00', title: 'Test 00 price target raised by analysts', url: null, duplicateOf: null}]}],
  index: [{symbol: '.INX', sourceUrl: 'https://api.stock.naver.com/index/.INX/price', rows: [{date: input.calendar.sessions.at(-1), close: 6700.12, changePct: 0.31}]}]});

test('미국 입력 → 판 묶음: 미국 값 · 지수 띠 · 회사 수 그대로 · 영어 앞날 말 기사 빠짐 · 한국 판 파일 안 건드림', async () => {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'atlas-us-')), input = fakeInput();
  await fs.mkdir(path.join(dir, 'public/data/atlas11/us'), {recursive: true});
  await fs.writeFile(path.join(dir, 'public/data/atlas11/us/input.json'), JSON.stringify(input));
  await fs.writeFile(path.join(dir, 'public/data/atlas11/us/context.json'), JSON.stringify(fakeCtx(input)));
  const files = await buildUsFiles({root: dir, now: '2026-10-05T10:00:00Z'}), m = files.get('manifest.json'), b = files.get('board.json');
  assert.equal(m.prediction, 'off'); assert.equal(m.place.id, 'us'); assert.equal(m.place.unit, '달러'); assert.equal(m.place.flows, false); assert.equal(m.place.moves, false);
  assert.deepEqual(m.market.items.map(i => i.name), ['S&P 500']);
  assert.equal(b.companies.length, 15); assert.equal(b.groups.length, 3);
  const s = files.get('stocks/T00.json');
  assert.deepEqual(s.context.news.map(n => n.title), ['시험00, 새 공장 준공'], '「price target」 영어 제목은 빠짐');
  assert.equal(b.companies.find(c => c.code === 'T00').brief.news.title, '시험00, 새 공장 준공', '판 요약도 이름 든 한글 기사');
  assert.deepEqual(s.context.missing, ['수급', '공시'], '미국은 수급 · 공시 없음(화면이 그렇다고 적음)');
  const w = await writeUsView(files, {root: dir});
  assert.equal(w.companies, 15);
  const names = (await fs.readdir(path.join(dir, 'public/data/atlas11/us/view'))).sort();
  assert.deepEqual(names, ['agenda.json', 'board.json', 'manifest.json', 'stocks']);
  assert.equal((await fs.readdir(path.join(dir, 'public/data/atlas11/us/view/stocks'))).length, 15);
  await assert.rejects(fs.access(path.join(dir, 'public/data/atlas11/view')), '한국 판 묶음 자리는 그대로(만들지 않음)');
  await fs.rm(dir, {recursive: true, force: true});
});

test('미국 입력이 아니면 만들지 않음', async () => {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'atlas-us-'));
  await fs.mkdir(path.join(dir, 'public/data/atlas11/us'), {recursive: true});
  await fs.writeFile(path.join(dir, 'public/data/atlas11/us/input.json'), JSON.stringify({assets: [{code: '005930'}]}));
  await assert.rejects(buildUsFiles({root: dir}), /US_INPUT/);
  await fs.rm(dir, {recursive: true, force: true});
});

test('뉴욕 시각(서머타임) · 장중 값은 종가 아님 · 지수 띠는 숫자만 · 영어 앞날 말', () => {
  assert.deepEqual(newYork('2026-10-05T09:30:00Z'), {date: '2026-10-05', hm: '05:30', weekday: 1}, '10월은 서머타임(UTC−4)');
  assert.deepEqual(newYork('2026-12-01T21:30:00Z'), {date: '2026-12-01', hm: '16:30', weekday: 2}, '12월은 UTC−5');
  assert.equal(usCloseFinal('2026-10-02', '2026-10-05T09:30:00Z'), true);
  assert.equal(usCloseFinal('2026-10-05', '2026-10-05T18:00:00Z'), false, '뉴욕 14:00 — 장중');
  assert.equal(usCloseFinal('2026-10-05', '2026-10-05T21:30:00Z'), true, '뉴욕 17:30 — 굳음');
  assert.equal(usMarketOf({index: [{symbol: '.IXIC', rows: [{date: '2026-10-02', close: 'x', changePct: 1}]}]}), null);
  assert.equal(usPlace({prices: 'A', news: null}).contextSource, '출처: 기사 없음 · 기사는 제목만 저장(본문 없음)');
  for (const t of ['Analysts raise price target on Apple', 'Nvidia expected to beat', 'Morgan Stanley upgrades Tesla']) assert.ok(EN_PREDICTION.test(t), t);
  for (const t of ['Apple opens new store', 'Nvidia shares close higher']) assert.ok(!EN_PREDICTION.test(t), t);
});
