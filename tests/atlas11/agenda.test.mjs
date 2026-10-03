// 일정·공시 표(agenda.json) — 2026-10-04 08:19 사장님 「그 회사들 예정된 뉴스나 공시 나타나게 해주고 얼마나 중요한지 표기해줘」
// 바뀌지 않는 실제 파일로 본다: 10/1 발행본(reports/atlas11/versions) · 10/2 관측 묶음(reports/atlas11/context) · 10/4 새 52종목 입력(reports/atlas11/universe)
import test from 'node:test';
import assert from 'node:assert/strict';
import {buildAgenda, eventLevel, disclosureLevel, noticeOf, shortTitle, LEVELS} from '../../lib/atlas11/agenda.mjs';
import {buildViewBundle, validateViewBundle} from '../../lib/atlas11/view.mjs';
import {readAllPublications} from '../../lib/atlas11/forecast.mjs';
import {realInputs, readJSON, root} from './helpers.mjs';

const PUB = 'reports/atlas11/versions/2026-10-01-atlas11-ddcd76430dec96dc.json', SNAP = 'reports/atlas11/context/2026-10-02/2026-10-02T13-38-11Z.json';
const NOW = '2026-10-03T23:30:00.000Z'; // 10/4(일) 08:30 KST
const inputOf = p => ({assets: p.assets.map(a => ({code: a.code, name: a.name, sector: a.sector}))});

test('중요도 규칙: 일정은 종류로(금리 결정 ★★★ · 물가·고용 ★★ · 업종 전시 ★) · 공시는 제목 낱말로(늘 나오는 안내 ★ · 자회사 일은 한 칸 낮춤)', () => {
  assert.equal(eventLevel({kind: 'FOMC'}), 3); assert.equal(eventLevel({kind: 'BOK'}), 3); assert.equal(eventLevel({kind: 'CPI'}), 2); assert.equal(eventLevel({kind: 'PPI'}), 1);
  assert.equal(eventLevel({kind: 'CAPITAL_INCREASE'}), 3); assert.equal(eventLevel({kind: 'COMPANY_IR'}), 2); assert.equal(eventLevel({kind: 'INDUSTRY_SEDEX-2026'}), 1); assert.equal(eventLevel({kind: '모르는 종류'}), 1);
  assert.equal(disclosureLevel('현대자동차(주) 영업(잠정)실적(공정공시)'), 3);
  assert.equal(disclosureLevel('엘지디스플레이(주) 결산실적공시 예고(안내공시)'), 3); assert.equal(noticeOf('엘지디스플레이(주) 결산실적공시 예고(안내공시)'), '예고 · 실적 발표');
  assert.equal(disclosureLevel('유상증자결정(종속회사의 주요경영사항)'), 2, '자회사 일은 한 칸 낮춤');
  assert.equal(disclosureLevel('기업설명회(IR) 개최(안내공시)'), 2); assert.equal(noticeOf('기업설명회(IR) 개최(안내공시)'), '예고 · 설명회'); assert.equal(noticeOf('삼성전자(주) 주식선물ㆍ주식옵션 2단계 가격제한폭 확대요건 도달(상승)'), null);
  assert.equal(disclosureLevel('삼성전자(주) 주식선물ㆍ주식옵션 2단계 가격제한폭 확대요건 도달(상승)'), 1);
  assert.equal(disclosureLevel('주식선물 거래정지및거래재개(제일기획)'), 1, '파생상품 시장 안내는 거래정지 낱말이 있어도 ★');
  assert.equal(disclosureLevel('중간(분기)배당락 기준가격 안내'), 1); assert.equal(disclosureLevel('정기주주총회결과'), 1);
  assert.equal(shortTitle('현대자동차(주) 영업(잠정)실적(공정공시)', '현대차'), '영업(잠정)실적(공정공시)');
  assert.equal(shortTitle('(주)KB금융지주 주주총회소집결의', 'KB금융'), '주주총회소집결의');
  assert.equal(shortTitle('주식회사 크래프톤 주식 소각 결정', '크래프톤'), '주식 소각 결정');
  assert.equal(shortTitle('실리콘투 기업설명회(IR) 개최', '실리콘투'), '기업설명회(IR) 개최');
  assert.deepEqual(Object.keys(LEVELS), ['1', '2', '3']);
});

test('일정·공시 표: 시장 공통 일정은 한 번만 · 회사 일정은 그 회사에만 · 업종 일정은 같은 업종에만 · 묶음 만든 날 이전 일정 없음 · 공시는 최근 30일', async () => {
  const pub = await readJSON(PUB), snap = await readJSON(SNAP), input = inputOf(pub);
  const a = buildAgenda({publication: pub, input, snap, now: NOW});
  assert.equal(a.builtDay, '2026-10-04'); assert.equal(Object.keys(a.byCode).length, 52); assert.equal(a.forecastId, pub.forecastId);
  assert.deepEqual(a.market.map(e => [e.date, e.kind, e.level]), [['2026-10-06', 'JOBS', 2], ['2026-10-15', 'CPI', 2], ['2026-10-16', 'PPI', 1], ['2026-10-22', 'BOK', 3], ['2026-10-29', 'FOMC', 3]]);
  assert.ok(a.market.every(e => e.source && /^https:\/\//.test(e.source.url)), '시장 일정마다 공식 출처 주소');
  const all = Object.values(a.byCode).flatMap(b => b.upcoming);
  assert.ok(all.every(e => e.date >= a.builtDay && e.scope !== 'market'), '회사·업종 칸에는 시장 공통 일정이 다시 나오지 않고 지난 일정도 없음');
  const sb = a.byCode['207940'];
  assert.deepEqual(sb.upcoming.filter(e => e.scope === 'company').map(e => [e.date, e.level]), [['2026-10-06', 3], ['2026-10-28', 3]], '삼성바이오로직스 유상증자 두 단계');
  for (const [code, b] of Object.entries(a.byCode)) {
    const sector = pub.assets.find(x => x.code === code).sector;
    for (const e of b.upcoming) { const src = pub.assets.flatMap(x => x.news ?? []).find(n => n.id === e.id); assert.ok(src.scope.type === 'company' ? src.scope.codes.includes(code) : src.scope.sectors.includes(sector), `${code} ${e.name}`); }
    assert.ok(b.disclosures.every(d => d.publishedAt.slice(0, 10) >= '2026-09-04' && d.publishedAt.slice(0, 10) <= '2026-10-04'));
    assert.ok(b.disclosures.every((d, i, arr) => i === 0 || arr[i - 1].level > d.level || (arr[i - 1].level === d.level && arr[i - 1].publishedAt >= d.publishedAt)), '중요한 순 · 같으면 최근 순');
    assert.equal(new Set(b.disclosures.map(d => d.publishedAt.slice(0, 10) + '|' + d.title)).size, b.disclosures.length, '같은 날 같은 제목은 한 줄(몇 건인지 times)');
  }
  // 관측 묶음이 없으면 공시 칸은 비우고 「공시」가 빠졌다고 적는다(0 으로 채우지 않음)
  const none = buildAgenda({publication: pub, input, snap: null, now: NOW});
  assert.ok(Object.values(none.byCode).every(b => b.disclosures.length === 0 && b.missing.includes('공시')));
});

test('종목을 바꾼 뒤(새 52곳): 업종 일정은 새 회사에도 업종 이름으로 붙고 · 빠진 회사의 회사 일정은 나오지 않는다', async () => {
  const pub = await readJSON(PUB), next = await readJSON('reports/atlas11/universe/2026-10-04-v2/next-input.json');
  const a = buildAgenda({publication: pub, input: next, now: NOW});
  assert.equal(Object.keys(a.byCode).length, 52);
  assert.ok(a.byCode['000660'].upcoming.some(e => e.kind === 'INDUSTRY_SEDEX-2026'), 'SK하이닉스(새로 들어옴 · 반도체) ← 반도체대전');
  assert.ok(a.byCode['207940'].upcoming.some(e => e.kind === 'CAPITAL_INCREASE'), '삼성바이오로직스(그대로) 회사 일정 유지');
  const codes = new Set(next.assets.map(x => x.code));
  for (const b of Object.values(a.byCode)) for (const e of b.upcoming.filter(x => x.scope === 'company')) { const src = pub.assets.flatMap(x => x.news ?? []).find(n => n.id === e.id); assert.ok(src.scope.codes.some(c => codes.has(c))); }
});

test('화면 묶음: 일정 표의 내일 뒤 날짜는 일정이라 통과 · 다른 파일에 넣은 내일 뒤 날짜는 여전히 실패 · 카드마다 출목표용 종가 21개', async () => {
  const {input, calendar} = await realInputs();
  const p = await readJSON('reports/atlas11/versions/2026-09-28-atlas11-27e1f65cfc167be9.json'), publications = await readAllPublications(root), snap = await readJSON(SNAP);
  const TOMORROW = {futureDays: 1, tomorrowOnly: true, since: '2026-10-02', file: 'config/atlas11/horizon.json', configSHA256: null, config: null};
  const files = buildViewBundle({publication: p, input, calendar, publications, horizon: TOMORROW, contextSnap: snap, now: NOW});
  const ag = files.get('agenda.json');
  assert.ok(ag.market.length >= 1 && ag.market.every(e => e.date > p.futureDates[0]), '내일(9/29) 뒤 일정이 들어 있다');
  assert.equal(validateViewBundle(files, p), true);
  assert.ok(files.get('manifest.json').files['agenda.json'].sha256, '화면이 다시 계산해 대조할 해시');
  assert.ok(files.get('cards.json').cards.every(c => c.c.length === 21 && c.c.at(-1) === c.close), '종가 21개 · 마지막 = 출발 종가');
  const leak = new Map(files), cj = structuredClone(files.get('cards.json')); cj.cards[0].note = ag.market.at(-1).date + ' 일정'; leak.set('cards.json', cj);
  assert.throws(() => validateViewBundle(leak, p), /VIEW_TOMORROW_DATES_AFTER/);
});
