// 365곳 · 업종을 더 잘게(한국거래소 업종 = 한국표준산업분류) — 2026-10-05 05:07 사장님 「지금 180개를 365개로 한다 업종도 늘리고 더 세분화 한다」
// 고르기 규칙(s365-v1)은 가짜 후보로 따로 보고, KIND 목록 풀기·네이버 업종 이름 찾기는 작은 원문 조각으로 본다(실제 응답이 오면 그 원문으로 다시 본다).
import test from 'node:test';
import assert from 'node:assert/strict';
import {S365, selectSub365, failsOf, ksicLabel, ksicTrendOf, parseKindCorpList, industryNameFrom, parseIndustryList, TREND_GROUPS} from '../../lib/atlas11/universe.mjs';

const GOOD = {op: 10, net: 8, opPrev: 9, netPrev: 7, roe: 12, debt: 50, fiscalYear: '2025.12'}, BAD = {...GOOD, roe: 1, op: -1, net: -1};
/** KRX 업종 80개(5곳이 안 차는 업종 6개) + KRX 업종을 모르는 회사(네이버 업종만 앎) 12곳 */
function fakeCandidates() {
  const out = []; let rank = 1;
  for (let k = 0; k < 80; k++) {
    const ksic = k === 0 ? '반도체 제조업' : k === 1 ? '의약품 제조업' : `업종${String(k).padStart(2, '0')} 제조업`, n = k >= 74 ? 3 : 7;
    for (let j = 0; j < n; j++) { const code = String(100000 + k * 100 + j * 10); out.push({code, name: `회사${code}`, market: 'KOSPI', endType: 'stock', sector: k % 9 === 0 && k > 0 ? '기계' : null, ksic, capRank: rank++, marketCapEok: 200000 - k * 1000 - j * 10, history: {ok: true}, metrics: j < 4 ? GOOD : BAD}); }
  }
  for (let j = 0; j < 12; j++) { const code = String(900000 + j * 10); out.push({code, name: `회사${code}`, market: 'KOSDAQ', endType: 'stock', sector: '건설', ksic: null, capRank: rank++, marketCapEok: 1000 - j, history: {ok: true}, metrics: GOOD}); }
  out.push({code: '100005', name: '회사우', market: 'KOSPI', endType: 'stock', sector: null, ksic: '반도체 제조업', capRank: 1, marketCapEok: 999999, history: {ok: true}, metrics: GOOD}); // 우선주 — 빠져야 함
  return out;
}

test('고르기 s365-v1: KRX 업종마다 5곳 · 5곳 시가총액 합이 큰 73개 업종 · 모두 365곳 · KRX 업종을 모르는 회사는 네이버 업종으로 한 번 더 묶음', () => {
  const cands = fakeCandidates(), sel = selectSub365(cands, S365);
  assert.equal(sel.ok, true); assert.equal(sel.picked.length, 365); assert.equal(new Set(sel.picked.map(c => c.code)).size, 365);
  const by = new Map(); for (const c of sel.picked) by.set(c.industry, [...(by.get(c.industry) ?? []), c]);
  assert.equal(by.size, 73); assert.ok([...by.values()].every(cs => cs.length === 5), '업종마다 5곳');
  assert.ok(!sel.picked.some(c => c.code === '100005'), '우선주는 빠짐');
  assert.ok(by.has('반도체') && by.has('의약품'), 'KRX 업종 짧은 이름(「제조업」을 뗌)');
  assert.ok(sel.picked.filter(c => c.groupBy === 'naver').every(c => c.industry === '건설'), 'KRX 업종을 모르는 회사는 네이버 업종 이름으로');
  const caps = sel.counts.chosen.map(x => x.capEok); assert.deepEqual(caps, [...caps].sort((a, b) => b - a), '업종 차례 = 5곳 시가총액 합 큰 순');
  // 업종 안 고르는 차례: 우량(또는 트렌드) → 흑자 → 큰 회사
  for (const cs of by.values()) { const kinds = cs.map(c => c.kind), order = {quality: 0, trend: 0, profit: 1, size: 2}; assert.deepEqual(kinds, [...kinds].sort((a, b) => order[a] - order[b])); }
  assert.equal(sel.picked.find(c => c.industry === '반도체').trend?.id, 'ai-chip', 'KRX 업종 낱말로도 시대 트렌드');
});

test('KRX 업종: 짧은 이름 · 시대 트렌드 낱말 · 업종을 KRX 로만 알아도 「업종 모름」이 아님', () => {
  assert.equal(ksicLabel('반도체 제조업'), '반도체'); assert.equal(ksicLabel('소프트웨어 개발 및 공급업'), '소프트웨어 개발·공급'); assert.equal(ksicLabel('엔지니어링 서비스업'), '엔지니어링 서비스');
  assert.equal(ksicTrendOf('일차전지 및 축전지 제조업')?.id, 'battery'); assert.equal(ksicTrendOf('선박 및 보트 건조업')?.id, 'ship-defense'); assert.equal(ksicTrendOf('기타 금융업'), null);
  assert.ok(TREND_GROUPS.length === 8);
  const c = {code: '100000', name: '가', endType: 'stock', capRank: 1, sector: null, ksic: '반도체 제조업', history: {ok: true}, metrics: GOOD};
  assert.ok(!failsOf(c, S365).includes('업종 모름')); assert.ok(failsOf({...c, ksic: null}, S365).includes('업종 모름'));
});

test('KIND 상장회사 목록 풀기: 머리글로 칸 찾기 · 앞 0 채우기 · 숫자 아닌 코드 빼기', () => {
  const html = '<table><tr><th>회사명</th><th>시장구분</th><th>종목코드</th><th>업종</th><th>주요제품</th></tr>' +
    '<tr><td>삼성전자</td><td>유가</td><td style="mso-number-format:\'@\'">5930</td><td>통신 및 방송 장비 제조업</td><td>휴대폰, 반도체</td></tr>' +
    '<tr><td>새회사</td><td>코스닥</td><td>0004V0</td><td>소프트웨어 개발 및 공급업</td><td>앱</td></tr></table>';
  const m = parseKindCorpList(html);
  assert.equal(m.size, 1); assert.deepEqual(m.get('005930'), {code: '005930', name: '삼성전자', ksic: '통신 및 방송 장비 제조업', products: '휴대폰, 반도체'});
  assert.throws(() => parseKindCorpList('<table><tr><td>x</td></tr></table>'), /KIND_HEADER/);
});

test('네이버 업종 이름 찾기: JSON(번호와 이름) · 옛 링크 · 페이지 속 JSON 조각 · 제목 — 「네이버」 같은 말은 이름으로 안 봄', () => {
  assert.equal(industryNameFrom(JSON.stringify({groupInfo: {no: '278', name: '반도체와반도체장비'}}), '278'), '반도체와반도체장비');
  assert.equal(industryNameFrom(JSON.stringify({result: {items: [{no: '301', name: '은행'}, {no: '278', name: '반도체와반도체장비'}]}}), '278'), '반도체와반도체장비');
  assert.equal(industryNameFrom('<a href="/sise/sise_group_detail.naver?type=upjong&no=301">은행</a>', '301'), '은행');
  assert.equal(industryNameFrom('self.__next_f.push([1,"{\\"no\\":\\"295\\",\\"name\\":\\"에너지장비및서비스\\"}"])', '295'), '에너지장비및서비스');
  assert.equal(industryNameFrom('<title>조선 : 네이버페이 증권</title>', '291'), '조선');
  assert.equal(industryNameFrom('<title>네이버페이 증권</title>', '291'), null);
  assert.deepEqual(parseIndustryList(JSON.stringify({groups: [{no: '278', name: '반도체와반도체장비'}, {no: '301', name: '은행'}]})), [{no: '278', name: '반도체와반도체장비'}, {no: '301', name: '은행'}]);
});
