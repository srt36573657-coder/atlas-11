// 「왜 예비인가」 · 「왜 태양인가」(site/app/reason.js) — 사장님 2026-10-08 06:48 「그리고 왜 예비 후보인지 그 근거와 이유가 분명히 기승전결로 있어야 한다」
//   06:49 「태양도 왜 태양인지 마찮가지로 그 근거가 있러야 한다」
// 저장소의 다섯 나라 판(한국 · 미국 · 중국 · 일본 · 베트남)으로: 예비 모든 곳 · 태양 모든 곳이 기승전결 넷(차례대로) · 글이 비지 않음
//   · 글의 숫자 = 판의 숫자(이 시험이 판에서 따로 다시 셈) · 글이 말하는 것이 참인지(업종이 정말 불장 밖인가 · 정말 다 가졌나 · 오른 회사 안/밖)
//   · 쓰지 않는 말(사장님 금지 말 · 앞날 말) 없음 · 흐릿한 말에는 숫자 · 사전에 없는 틀은 정해 둔 새 틀(NEW_TEMPLATES — 말 73개로 옮길 목록)뿐 · 글씨 15px 넘게 · 움직임 없음
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
import {similarReason, sunReason, BEATS} from '../../site/app/reason.js';
import {sunOf, SHAPES, SHAPE_MIN, SHAPE_GAP} from '../../site/app/shapes.js';
import {riseDesc} from '../../site/app/family.js';
import {pct, korDate} from '../../site/app/util.js';
import {TRAITS} from '../../lib/atlas11/similar.mjs';
import {PREDICTION_WORDS} from '../../lib/atlas11/board.mjs';
import {readJSON, root} from './helpers.mjs';

const AT = ['public/data/atlas11/view', 'public/data/atlas11/us/view', 'public/data/atlas11/cn/view', 'public/data/atlas11/jp/view', 'public/data/atlas11/vn/view'];
const boards = await Promise.all(AT.map(async at => ({at, b: await readJSON(path.join(at, 'board.json'))})));
/** 사장님 금지 말(2026-10-08 지시) · 앞날 말 */
const FORBIDDEN = /예외 없이|절대|상승 신호|폭락 경보기|팔 때|들어갈 때|시작을 맞힌다|사라|팔라|추천|목표가|확실|보장|무조건|오를 것|오를 수 있|내릴 것|내릴 수 있|전망|기대|예측|예상|확률|곧 오른/;
const VAGUE = /최근|곧|지금|다음|많이|조금|대부분|크게/; // 또렷함 검사 2번 — 이 말이 든 줄에는 숫자가 있어야 함(규칙 6)
const WEIRD = /\b(NaN|undefined|Infinity|null)\b|\[object /; // 빠짐없이 도는 검사 ⓕ
const p1 = v => pct(v, Number.isFinite(v) && Math.abs(v) < 0.0005 ? 2 : 1);
const linesOf = beats => beats.flatMap(b => [b.head, ...b.why, b.note, ...(b.chips ?? []).map(c => c.name)].filter(Boolean));
/** 말 73개로 옮길 새 틀(번역 사전 키 · i18n.js templateOf 모양) — 나머지 조각은 이미 사전에 있는 틀을 그대로 씀 */
const NEW_TEMPLATES = Object.freeze([
  '왜 예비인가', '왜 태양인가',
  '불장 {n}개 업종 {n}곳의 공통점 {n}가지',
  '불장 회사의 {n}% 넘게 가졌고 나머지 {n}곳보다 {n}%p 넘게 많이 가진 점',
  '이 회사는 {n}가지를 모두 가졌다',
  '이 회사는 {n}가지 가운데 {n}가지를 가졌다',
  '그런데 이 회사의 업종은 불장(업종 {n}위~{n}위) 밖이다',
  '이 회사 {n}%',
  '그래서 예비 {n}곳에 들었다',
  '{d} 종가까지 지난 기록을 견준 것일 뿐 앞날을 맞히지 않습니다',
  '오른 회사 {n}곳의 출목표 공통 모양 {n}가지',
  '오른 회사의 {n}% 넘게 가졌고 나머지 {n}곳보다 {n}%p 넘게 많이 가진 모양',
  '이 회사도 오른 회사 {n}곳 안에 든다',
  '그런데 이 회사는 오른 회사 {n}곳 밖이다',
  '그래서 태양 {n}곳에 들었다',
  // 그때만 쓰는 것 — 값을 모르는 공통점(「?」 · 화면 읽기 말) · 지금 판들에는 공통 모양이 아닌 두 모양(그 모양이 공통 모양이 되는 날)
  '모름', '짧은 파랑 줄', '큰 파랑 날 없음',
]);
function shapeOk(beats, label) {
  assert.equal(beats.length, 4, label + ' 넷');
  beats.forEach((b, i) => {
    assert.equal(b.c, i, label); assert.equal(b.k, BEATS[i], label); assert.equal(b.k, '기승전결'[i], label);
    assert.ok(b.head.trim() && b.text.trim() && b.text.includes(b.head), `${label} ${b.k} 빈 글`);
  });
}
function wordsOk(beats, label) {
  for (const l of linesOf(beats)) {
    assert.doesNotMatch(l, FORBIDDEN, `${label}: ${l}`);
    assert.doesNotMatch(l, PREDICTION_WORDS, `${label}: ${l}`);
    assert.doesNotMatch(l, WEIRD, `${label}: ${l}`);
    if (VAGUE.test(l)) assert.match(l, /\d/, `${label} 흐릿한 말에 숫자 없음: ${l}`);
  }
}

const moveLine = (...xs) => { const v = xs.filter(Boolean); return v.length ? ['지난 20거래일', ...v].join(' · ') : undefined; };
const fin = v => typeof v === 'number' && Number.isFinite(v);

test('예비 — 다섯 나라 판의 예비 모든 곳: 기승전결 넷 · 숫자 = 판 · 업종이 정말 불장 밖 · 고른 법 그대로', () => {
  let n = 0;
  for (const {at, b} of boards) {
    const sim = b.similar, items = sim?.items ?? [], hotN = b.hot.items.length, hot = new Set(b.hot.items.map(x => x.id));
    if (!items.length) continue; // 예비가 없는 날(불장이 없거나 닮은 곳이 없음) — 근거도 없음
    const common = sim.common.map(id => sim.traits.find(t => t.id === id)), k = common.length, shown = [...items].sort(riseDesc);
    assert.ok(k > 0, at);
    // 「불장 회사의 50% 넘게 가졌고 나머지보다 10%p 넘게」 — 채우지 않은 판은 공통점마다 참 · 채운 판은 참이 아닌 것이 있음(그래서 「채움」이라 적음)
    const rate = x => (x.known ? x.yes / x.known : 0), strict = t => t.hot.known && rate(t.hot) > sim.rules.minShare && t.gap > sim.rules.minGap;
    assert.equal(common.some(t => !strict(t)), sim.filled, at + ' 채움 표시 = 판');
    for (const x of items) {
      const beats = similarReason(b, x), label = `${at} ${x.name}`, [ki, seung, jeon, gyeol] = beats; n++;
      shapeOk(beats, label); wordsOk(beats, label);
      assert.deepEqual(similarReason(b, x.code), beats, '종목 번호로도 같은 넷');
      // 기
      assert.equal(ki.head, `불장 ${hotN}개 업종 ${sim.hotCompanies}곳의 공통점 ${k}가지`, label);
      assert.deepEqual(ki.chips.map(c => c.name), common.map(t => t.chip), label + ' 공통점 이름');
      assert.equal(ki.why[0].startsWith(`불장 회사의 ${Math.round(sim.rules.minShare * 100)}% 넘게 가졌고 나머지 ${sim.restCompanies}곳보다 ${Math.round(sim.rules.minGap * 100)}%p 넘게 많이 가진 점`), true, label);
      assert.equal(ki.why[0].includes(`그런 것이 ${sim.rules.minCommon}가지보다 적어 차이가 큰 차례로 채움`), sim.filled, label + ' 채움');
      // 승 — ✓ = 판의 has · ? = 판의 unknown · 나머지 「·」
      assert.equal(x.matched, x.has.length);
      assert.equal(seung.head, x.matched === k ? `이 회사는 ${k}가지를 모두 가졌다` : `이 회사는 ${k}가지 가운데 ${x.matched}가지를 가졌다`, label);
      assert.deepEqual(seung.chips.map(c => `${c.id}:${c.mark}`), common.map(t => `${t.id}:${x.has.includes(t.id) ? '✓' : x.unknown.includes(t.id) ? '?' : '·'}`), label);
      assert.equal(seung.chips.filter(c => c.mark === '✓').length, x.matched, label + ' ✓ 수 = 가진 수');
      // 전 — 업종 자리가 불장(1위~hotN위) 밖인 것이 참 · 업종 평균 · 이 회사 변화
      const g = b.groups.find(gr => gr.id === x.groupId);
      assert.ok(g && !g.hot && !hot.has(g.id) && g.rank > hotN, `${label} 업종 ${g?.label} ${g?.rank}위는 불장 밖`);
      assert.equal(jeon.head, `그런데 이 회사의 업종은 불장(업종 1위~${hotN}위) 밖이다`, label);
      assert.equal(jeon.why[0], `${g.label} · 업종 ${b.groups.length}개 가운데 ${g.rank}위`, label);
      assert.equal(g.rank, b.groups.indexOf(g) + 1, '업종 자리 = 판 차례');
      assert.equal(jeon.why[1], moveLine(fin(g.change20) && `업종 평균 ${p1(g.change20)}`, fin(x.change20) && `이 회사 ${p1(x.change20)}`), label);
      // 결 — 예비 수 · 보이는 차례(예비 화면 줄 번호 = 지난 20거래일 많이 오른 순) · 고른 법(공통점 need 가지 이상 · 한 업종 2곳까지)
      assert.ok(x.matched >= sim.need, label + ' 공통점 need 가지 이상');
      assert.ok(items.filter(i => i.groupId === x.groupId).length <= sim.perIndustry, label + ' 한 업종 perIndustry 곳까지');
      assert.equal(gyeol.head, `그래서 예비 ${items.length}곳에 들었다`, label);
      assert.equal(gyeol.why[0], `오른 순 ${items.length}곳 가운데 ${shown.indexOf(x) + 1}위`, label);
      assert.equal(gyeol.why[1], `닮은 ${sim.want}곳 = 불장 업종 밖 회사 가운데 공통점을 많이 가진 차례(${sim.need}가지 이상만) · 같으면 지난 20거래일 많이 오른 차례 · 한 업종 ${sim.perIndustry}곳까지`, label);
      assert.equal(gyeol.note, `${korDate(b.asOf)} 종가까지 지난 기록을 견준 것일 뿐 앞날을 맞히지 않습니다`, label);
    }
    // 예비가 아닌 회사 · 판이 없으면 없음
    const other = b.companies.find(c => !items.some(i => i.code === c.code));
    assert.equal(similarReason(b, other.code), null, at); assert.equal(similarReason(b, other), null, at);
  }
  assert.equal(similarReason(null, '005930'), null); assert.equal(similarReason({}, '005930'), null);
  assert.ok(n > 0, `예비 ${n}곳`);
});

test('태양 — 다섯 나라 판의 태양 모든 곳: 기승전결 넷 · 숫자 = 판 · 정말 모양을 다 가짐 · 오른 회사 안/밖이 오른 순 자리와 맞음', () => {
  let n = 0;
  for (const {at, b} of boards) {
    const shp = sunOf(b), k = shp.common.length, N = b.companies.length, S = shp.sparkle.size, ranked = [...b.companies].sort(riseDesc);
    const T = shp.common.map(id => shp.traits.find(t => t.id === id)), filled = T.some(t => !(t.topShare > SHAPE_MIN && t.gap > SHAPE_GAP));
    assert.equal(shp.topN, Math.round(N * 0.2), at + ' 오른 회사 = 위 20%');
    for (const c of b.companies) {
      const beats = sunReason(shp, b, c.code);
      if (!shp.sparkle.has(c.code)) { assert.equal(beats, null, `${at} ${c.name} 태양 아님`); continue; }
      const label = `${at} ${c.name}`, [ki, seung, jeon, gyeol] = beats, rank = ranked.indexOf(c) + 1; n++;
      shapeOk(beats, label); wordsOk(beats, label);
      // 기
      assert.equal(ki.head, `오른 회사 ${shp.topN}곳의 출목표 공통 모양 ${k}가지`, label);
      assert.deepEqual(ki.chips.map(x => x.name), T.map(t => t.name), label);
      assert.equal(ki.why[0], `오른 회사 = 지난 20거래일 오른 순 1위~${shp.topN}위`, label);
      assert.equal(ki.why[1], `오른 회사의 ${Math.round(SHAPE_MIN * 100)}% 넘게 가졌고 나머지 ${shp.restN}곳보다 ${Math.round(SHAPE_GAP * 100)}%p 넘게 많이 가진 모양${filled ? ' · 그런 것이 3가지보다 적어 차이가 큰 차례로 채움' : ''}`, label);
      // 승 — 이 회사가 정말 모양을 모두 가짐(출목표에서 따로 셈한 shapes.js hits)
      assert.deepEqual([...shp.hits.get(c.code)].sort(), [...shp.common].sort(), label);
      assert.equal(seung.head, `이 회사는 ${k}가지를 모두 가졌다`, label);
      assert.deepEqual(seung.chips.map(x => `${x.id}:${x.mark}`), shp.common.map(id => `${id}:✓`), label);
      // 전 — 오른 순 자리 · 20거래일 변화 · 오른 회사(위 20%) 안/밖
      assert.equal(jeon.head, rank <= shp.topN ? `이 회사도 오른 회사 ${shp.topN}곳 안에 든다` : `그런데 이 회사는 오른 회사 ${shp.topN}곳 밖이다`, label);
      assert.equal(jeon.why[0], `오른 순 ${N}곳 가운데 ${rank}위` + (fin(c.change20) ? ` · 지난 20거래일 ${p1(c.change20)}` : ''), label);
      // 결
      assert.equal(gyeol.head, `그래서 태양 ${S}곳에 들었다`, label);
      assert.equal(gyeol.why[0], `태양 ${S}곳 = 오른 회사 출목표의 공통 모양 ${k}가지를 모두 가진 곳`, label);
      assert.equal(gyeol.note, `${korDate(b.asOf)} 종가까지 지난 20거래일 출목표 모양을 견준 것일 뿐 앞날을 맞히지 않습니다`, label);
    }
  }
  assert.ok(n > 0, `태양 ${n}곳`);
  assert.equal(sunReason(sunOf(null), boards[0].b, boards[0].b.companies[0].code), null, '빈 판');
  assert.equal(sunReason(null, boards[0].b, '005930'), null);
});

/* 가짜 판 — 날마다 바뀌는 저장소 판에 어느 갈래가 나오든 모든 갈래(일부만 가짐 · 값 모름 · 채운 판 · 변화 모름 · 오른 회사 안/밖)를 늘 본다 */
const fakeSun = (() => {
  const C = (code, change20) => ({code, name: '회사' + code, change20});
  const b = {asOf: '2026-10-07', companies: [C('A', 0.3), C('X', 0.1), C('B', 0.05), C('Y', null)]};
  const shp = {topN: 1, restN: 3, common: ['longRed', 'lastRed'], sparkle: new Set(['X', 'Y']), hits: new Map(),
    traits: [{id: 'longRed', name: '긴 빨강 줄', topShare: 0.9, gap: 0.5}, {id: 'lastRed', name: '끝 줄 빨강', topShare: 0.4, gap: 0.2}]};
  return {b, shp, top: {...shp, sparkle: new Set(['A'])}};
})();
const fakeSim = (() => {
  const G = (id, label, rank, change20, hot = false) => ({id, label, rank, change20, hot, codes: []});
  const trait = (id, chip) => ({id, chip, common: true, hot: {yes: 6, known: 10}, rest: {yes: 2, known: 20}, gap: 0.5});
  const it = (code, groupId, change20, has, unknown = []) => ({code, name: '회사' + code, groupId, groupLabel: '업종' + groupId, change20, matched: has.length, has, unknown});
  return {asOf: '2026-10-07', hot: {items: [{id: 'g1'}, {id: 'g2'}]}, groups: [G('g1', '반도체', 1, 0.2, true), G('g2', '조선', 2, 0.1, true), G('g3', '은행', 3, -0.01), G('g4', '보험', 4, null)],
    similar: {want: 7, perIndustry: 2, need: 2, hotCompanies: 10, restCompanies: 20, filled: true, rules: {minShare: 0.5, minGap: 0.1, minCommon: 3},
      traits: [trait('ups', '오른 날 많음'), trait('r5', '최근 5거래일 오름'), trait('fgn', '외국인 순매수')], common: ['ups', 'r5', 'fgn'],
      items: [it('A', 'g3', 0.05, ['ups', 'r5'], ['fgn']), it('B', 'g3', 0.08, ['ups', 'fgn']), it('C', 'g4', null, ['r5', 'fgn'], ['ups'])]}, companies: []};
})();

test('태양 — 오른 회사 밖의 태양 · 채운 판 · 변화를 모르는 곳(가짜 셈)', () => {
  const {b, shp} = fakeSun;
  const x = sunReason(shp, b, 'X');
  assert.equal(x[0].head, '오른 회사 1곳의 출목표 공통 모양 2가지');
  assert.equal(x[0].why[1], '오른 회사의 50% 넘게 가졌고 나머지 3곳보다 10%p 넘게 많이 가진 모양 · 그런 것이 3가지보다 적어 차이가 큰 차례로 채움', '50% 를 못 넘는 모양이 있으면 채움');
  assert.equal(x[2].head, '그런데 이 회사는 오른 회사 1곳 밖이다');
  assert.equal(x[2].why[0], '오른 순 4곳 가운데 2위 · 지난 20거래일 +10.0%');
  assert.equal(x[3].head, '그래서 태양 2곳에 들었다');
  const y = sunReason(shp, b, 'Y');
  assert.equal(y[2].why[0], '오른 순 4곳 가운데 4위', '변화를 모르면 맨 뒤 · 변화 조각은 뺌');
  assert.equal(sunReason(shp, b, 'A'), null, '태양이 아님');
  for (const z of [x, y]) wordsOk(z, 'sun');
  const inTop = sunReason(fakeSun.top, b, 'A');
  assert.equal(inTop[2].head, '이 회사도 오른 회사 1곳 안에 든다');
});

test('예비 — 값 모름(?) · 일부만 가짐(·) · 채운 판 · 업종 변화를 모르는 곳(가짜 판)', () => {
  const b = fakeSim;
  const a = similarReason(b, 'A');
  assert.equal(a[0].why[0], '불장 회사의 50% 넘게 가졌고 나머지 20곳보다 10%p 넘게 많이 가진 점 · 그런 것이 3가지보다 적어 차이가 큰 차례로 채움');
  assert.equal(a[1].head, '이 회사는 3가지 가운데 2가지를 가졌다');
  assert.deepEqual(a[1].chips.map(c => c.mark), ['✓', '✓', '?']);
  assert.deepEqual(similarReason(b, 'B')[1].chips.map(c => c.mark), ['✓', '·', '✓']);
  assert.deepEqual(a[2].why, ['은행 · 업종 4개 가운데 3위', '지난 20거래일 · 업종 평균 −1.0% · 이 회사 +5.0%']);
  assert.equal(a[2].head, '그런데 이 회사의 업종은 불장(업종 1위~2위) 밖이다');
  assert.deepEqual(a[3].why[0], '오른 순 3곳 가운데 2위', 'B(+8%) 다음');
  const c = similarReason(b, 'C');
  assert.deepEqual(c[2].why, ['보험 · 업종 4개 가운데 4위'], '변화를 모르면 그 줄은 뺌(「없음」 · 「null」 글 없음)');
  assert.equal(c[3].why[0], '오른 순 3곳 가운데 3위', '변화를 모르면 맨 뒤');
  assert.match(c[1].text, /\? 오른 날 많음/);
  for (const x of ['A', 'B', 'C']) wordsOk(similarReason(b, x), x);
  assert.equal(similarReason({...b, hot: {items: []}}, 'A'), null, '불장이 없으면 근거도 없음');
});

test('말 73개 — 화면에 그리는 글을 사이트 번역 함수(영어 사전 · 다섯 판 이름)로 바꾸면 사전에 없는 틀은 NEW_TEMPLATES 뿐', async () => {
  globalThis.location = {pathname: '/', search: '?lang=en'};
  const m = await import(pathToFileURL(path.join(root, 'site/app/i18n.js')).href + '?lang=en&reason');
  delete globalThis.location;
  assert.equal(m.LANG, 'en');
  m.useDict(await readJSON('site/app/i18n/en.json'));
  const namesKr = (await readJSON('public/data/atlas11/names-kr.json')).names;
  for (const {b} of boards) m.addBoardNames(structuredClone(b), namesKr);
  // 화면 글 — 상자 이름 · 접힌 칸 이름(화면 읽기 이름 포함) · 줄마다 머리 · 이름표 · 근거 · 끝 줄 · 화면 읽기 말(가짐 · 안 가짐 · 모름) · 대신 쓰는 말
  const texts = new Set(['왜 예비인가', '왜 태양인가', ' 가짐', ' 안 가짐', ' 모름', '업종 모름', '앞날을 맞히지 않습니다', ...TRAITS.map(t => t.chip), ...SHAPES.map(s => s.name)]);
  for (const {b} of boards) {
    const shp = sunOf(b);
    for (const x of b.similar?.items ?? []) { texts.add(`${x.name} · 왜 예비인가`); for (const l of linesOf(similarReason(b, x))) texts.add(l); }
    for (const code of shp.sparkle) for (const l of linesOf(sunReason(shp, b, code))) texts.add(l);
  }
  // 가짜 판(업종 이름은 사전에 있는 이름) — 날마다 판에 나오지 않을 수 있는 갈래의 틀도 늘 맞댐
  for (const x of fakeSim.similar.items) for (const l of linesOf(similarReason(fakeSim, x))) texts.add(l);
  for (const [s, code] of [[fakeSun.shp, 'X'], [fakeSun.shp, 'Y'], [fakeSun.top, 'A']]) for (const l of linesOf(sunReason(s, fakeSun.b, code))) texts.add(l);
  for (const s of texts) m.t(s);
  const extra = m.missing().filter(k => !NEW_TEMPLATES.includes(k));
  assert.deepEqual(extra, [], '사전에 없고 새 틀 목록에도 없는 틀');
  // 새 틀은 모두 실제로 쓰는 틀(목록이 낡지 않게) — 지금 사전에 이미 있으면 빠져 있어도 됨
  const used = new Set([...texts].flatMap(s => { const parts = [s, ...s.split(' · ')]; return parts.map(p => m.templateOf(p.trim()).key); }));
  for (const k of NEW_TEMPLATES) assert.ok(used.has(k), '쓰지 않는 새 틀: ' + k);
});

test('옷(style.css) — 근거 칸 글씨는 15px 넘게 · 움직임 없음 · 끝에 붙인 덩어리 하나', async () => {
  const css = await fs.readFile(path.join(root, 'site/app/style.css'), 'utf8');
  const at = css.indexOf('/* 2026-10-08 예비 · 태양 근거 기승전결 (reason.js) */');
  assert.ok(at > 0 && css.indexOf('/* 2026-10-08 예비 · 태양 근거 기승전결 (reason.js) */', at + 1) < 0, '덩어리 하나');
  const plain = css.replace(/\/\*[\s\S]*?\*\//g, c => ' '.repeat(c.length)); // 풀이 글(주석)은 같은 길이 빈칸으로 — 자리(index)는 그대로
  const rules = [...plain.matchAll(/([^{}]+)\{([^{}]*)\}/g)].filter(r => /\.rs-/.test(r[1]));
  assert.ok(rules.length >= 15, `.rs- 규칙 ${rules.length}개`);
  for (const r of rules) {
    const [, sel, body] = r;
    assert.ok(r.index + sel.search(/\S/) > at, '덩어리 밖에 있는 규칙: ' + sel.trim());
    assert.doesNotMatch(body, /animation|transition/, '움직임: ' + sel.trim());
    for (const fsz of body.matchAll(/font-size:\s*([\d.]+)(rem|px|em)/g)) {
      const px = fsz[2] === 'px' ? Number(fsz[1]) : Number(fsz[1]) * 16;
      assert.ok(px >= 15, `${sel.trim()} 글씨 ${fsz[1]}${fsz[2]}`);
    }
  }
});
