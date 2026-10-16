// 새 ATLAS 시장 판독 · 네 눈 점검(사장님 2026-10-12 12:41 「10시 12시 14시 18시 업데이틀 하라 시장을 판독해서 말이다 그라고 업데이트 할때마다 아틀란스 점검을 애플 구글 클로드 cia방식으로 각각 1000만번씩 하라」)
//   시험은 번 수를 줄여 돔 — 걸려야 할 것(깨진 길 · 틀린 숫자 · 금지 말 · 끼운 코드 · 비밀 · 깨진 주소)을 일부러 넣어 네 눈이 각각 잡는지 봄
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {inspect4, routeRunner, siteGraph, BANNED, NARROW, OLD_RULE_WORDS, oldRuleHits} from '../../scripts/atlas11/t365/inspect4.mjs';
import {readMarket, breadthWord, sizeWord, pctText, MR_RULE, whenWord, mdText} from '../../scripts/atlas11/t365/market_read.mjs';
import {HEADER_TOP} from '../../scripts/atlas11/site_headers.mjs';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '../..');
const SITE = path.join(ROOT, 'site');
const DATA = path.join(SITE, 'atlas/data');
const N = 200000; // 눈마다 대상(가장 많은 클로드 눈 약 8만)을 모두 한 번씩 보고도 남는 수 — 남은 번 수로 사람처럼 누르기 · 주소 흔들기도 돎
const NOW = new Date(JSON.parse(fs.readFileSync(path.join(DATA, 'core.json'), 'utf8')).asOf + 'T09:00:00Z'); // 「오늘」 = 자료의 고른 날 저녁(시험이 날짜가 지나도 「묵은 자료」로 걸리지 않게)

function copySite() { // 화면 코드 + 자료를 임시 폴더로(고쳐 넣기 시험)
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'i4-'));
  fs.cpSync(path.join(SITE, 'atlas'), path.join(tmp, 'atlas'), {recursive: true});
  return {tmp, data: path.join(tmp, 'atlas/data'), J: f => JSON.parse(fs.readFileSync(path.join(tmp, 'atlas/data', f), 'utf8')), W: (f, x) => fs.writeFileSync(path.join(tmp, 'atlas/data', f), JSON.stringify(x))};
}
const lens = (r, k) => r.lenses.find(l => l.key === k);
const kind = (r, l, k) => lens(r, l).kinds.find(x => x.k === k);

test('금지 말 목록 = 화면 검사(site_check.mjs)의 목록', () => {
  const src = fs.readFileSync(path.join(ROOT, 'scripts/atlas11/t365/site_check.mjs'), 'utf8');
  const m = src.match(/const BANNED = (\[[^\]]+\]);/);
  assert.ok(m); assert.deepEqual(BANNED, JSON.parse(m[1].replace(/'/g, '"')));
  // 힘 붙은 365곳(2026-10-13 13:04) — 좁은 금지 말 9개 · 옛 기준 말도 두 목록이 같음
  for (const [nm, list] of [['NARROW', NARROW], ['OLD_RULE_WORDS', OLD_RULE_WORDS]]) { const x = src.match(new RegExp(`const ${nm} = (\\[[^\\]]+\\]);`)); assert.ok(x, nm); assert.deepEqual(list, JSON.parse(x[1].replace(/'/g, '"')), nm); }
  assert.equal(NARROW.length, 9); assert.deepEqual(oldRuleHits('봉인 1호는 옛 규칙(대세 업종)으로 고른 365곳'), []); assert.deepEqual(oldRuleHits('「대세」였던 업종부터'), ['대세']);
  assert.deepEqual(oldRuleHits('365곳 새 기준 — 옛 규칙(힘 붙음) 365곳'), []); assert.deepEqual(oldRuleHits('힘 붙은 365곳 — 그중'), ['힘 붙은 365곳']); // 2026-10-14 멍거 조건 뒤 옛 이름
});

test('시장 판독 — 지난 사실만 · 문턱(mr-v2 = 모든 회사 · 2026-10-14 「나」) · 줄마다 숫자', () => {
  assert.equal(breadthWord(65, 35), '넓게 오른 날'); assert.equal(breadthWord(64, 36), '오른 곳 · 내린 곳이 섞인 날'); assert.equal(breadthWord(35, 65), '넓게 내린 날'); assert.equal(breadthWord(0, 0), '?');
  assert.equal(breadthWord(70, 30, 'span'), '넓게 오름');
  assert.equal(sizeWord(13.2, -2.5), '작은 · 중간 회사 쪽이 더 오름'); assert.equal(sizeWord(-8, -2), '큰 회사 쪽이 덜 내림'); assert.equal(sizeWord(1, 0), '회사 크기와 상관없이 비슷'); assert.equal(sizeWord(-2, -9), '작은 · 중간 회사 쪽이 덜 내림');
  assert.equal(pctText(-2.49), '−2.5%'); assert.equal(pctText(13.18), '+13.2%'); assert.equal(pctText(null), '?');
  assert.equal(MR_RULE.id, 'mr-v2'); assert.equal(MR_RULE.old, 'mr-v1');
  // 때 말 — 「장 중」은 정규장(9:00 ~ 15:30)에 고른 날 값을 받았을 때만(2026-10-12 16:48 회차: 장 끝 뒤에도 「장 중 값」이던 것)
  assert.equal(whenWord(false, '2026-10-12', new Date('2026-10-12T05:00:00Z')), '마감 값');
  assert.equal(whenWord(true, '2026-10-12', new Date('2026-10-12T05:00:00Z')), '장 중 값(아직 바뀜)');
  assert.equal(whenWord(true, '2026-10-12', new Date('2026-10-12T07:48:00Z')), '저녁 8시 전 값(아직 바뀜)');
  assert.equal(whenWord(true, '2026-10-12', new Date('2026-10-13T01:00:00Z')), '저녁 8시 전 값(아직 바뀜)', '다음 날 장 중이라도 고른 날이 어제면 장 중 아님');
  assert.equal(whenWord(true, '2026-10-12', null), '저녁 8시 전 값(아직 바뀜)');
  const m = readMarket(DATA, null), core = JSON.parse(fs.readFileSync(path.join(DATA, 'core.json'), 'utf8'));
  const pop = core.mkt ? JSON.parse(fs.readFileSync(path.join(DATA, 'mkt.json'), 'utf8')).companies : JSON.parse(fs.readFileSync(path.join(DATA, 'lines.json'), 'utf8')).lines; // mr-v2 = 모든 회사(mkt.json)
  assert.equal(m.rule, core.mkt ? 'mr-v2' : 'mr-v1'); assert.equal(m.n, Object.keys(pop).length);
  assert.equal(m.asOf, core.asOf); assert.equal(m.span.chg, (core.mkt ?? core.all).chg); assert.ok(m.day.up + m.day.down + m.day.flat + m.day.none === Object.keys(pop).length);
  assert.ok(m.lines[0].includes(`${core.mkt ? '모든 회사' : '고른'} ${Object.keys(pop).length.toLocaleString('ko-KR')}곳 가운데`), m.lines[0]); assert.ok(!m.lines[0].includes('365곳'), '옛 「365곳 가운데」 글(틀림 장부 27번)');
  assert.equal(m.lines.length, 3); for (const t of m.lines) { assert.match(t, /\d/); for (const w of BANNED) assert.ok(!t.includes(w), t); }
  const again = readMarket(DATA, m); assert.equal(again.lines.at(-1), `앞 회차(${mdText(m.asOf)})와 같은 값 — 하루 오른 곳 ${m.day.up.toLocaleString('ko-KR')}곳 · 1등 갈래 ${m.groups.top.short} 그대로`);
  assert.equal(readMarket(DATA, {...m, rule: 'mr-v1'}).vsPrev, null, '판독 규칙이 다른 앞 회차(고른 곳)와는 견주지 않음');
  for (const t of again.lines) assert.match(t, /\d/, '앞 회차와 같은 값이어도 줄마다 숫자(클로드 눈 「줄마다 숫자」 — 2026-10-12 21:11 회차가 여기서 걸림)');
  const other = readMarket(DATA, {...m, asOf: '2026-10-07', day: {up: 100}, groups: {top: {id: 'bio', short: '바이오'}}});
  assert.match(other.lines.at(-1), /하루 오른 곳 100곳 → [\d,]+곳 · 1등 갈래 바이오 → /);
});

test('화면 길 지도(점검용) — atlas.js 링크 규칙과 같게 · 첫 화면에서 회사 3번 · n단 n번', () => {
  const J = f => JSON.parse(fs.readFileSync(path.join(DATA, f), 'utf8'));
  const S = {core: J('core.json'), comp: J('comp.json'), range: J('range.json'), home: fs.existsSync(path.join(DATA, 'home.json')) ? J('home.json') : null}; // 첫 화면 365곳 막대 양 끝 길(2026-10-12 14:54)도 함께
  S.codes = Object.keys(S.comp.companies); S.gid = new Map(S.core.groups.map(g => [g.id, g])); S.iby = new Map(S.core.industries.map(i => [i.name, i]));
  S.mkt = S.core.mkt ? J('mkt.json') : null; S.mk = S.mkt?.companies ?? null; // 모든 회사(2026-10-14 「나」) — 업종 화면 회사 줄 · 밖 칸
  S.lines = J('lines.json'); S.surge = fs.existsSync(path.join(DATA, 'surge.json')) ? J('surge.json') : null; S.surgecal = fs.existsSync(path.join(DATA, 'surgecal.json')) ? J('surgecal.json') : null; // 첫 화면 고른 곳 · 급등 칸 길(click_walk ⑤ 와 같은 재료 — 실제 길 지도 맞대기가 통하게)
  S.tr = fs.existsSync(path.join(DATA, 'surgetr.json')) ? J('surgetr.json') : null; S.trc = fs.existsSync(path.join(DATA, 'surgetr-case.json')) ? J('surgetr-case.json') : null; // 달력 탭(규칙 70) — 종목 파일 길
  const nCal = S.tr && S.trc ? S.tr.cases.filter(r => S.trc.cases[r[0]]).length : 0;
  const {nodes, depth} = siteGraph(S), outN = S.mk ? Object.values(S.mk).filter(m => !m.p).length : 0, co7 = !!(S.core.co7 && S.mk);
  // 모든 회사 7단(사장님 2026-10-14 17:25(싱가포르) 「전부다 나오게 해」) — core.co7 이면 고른 곳 밖도 회사 다섯 단(3 ~ 7) · 밖 칸 없음 · 옛 자료면 밖 칸 하나씩
  // 고정 화면 12 = 첫 화면 · 업종 탭 · 업데이트 · 봉인 · 도움말 · 급등 + 급등 네 칸(10% · 20% · 30% · 40% — 2026-10-15 16:28 「총 5개」) + 달력(19:36 · 규칙 70) + 조건(23:54 「가」 · 규칙 72) · 종목 파일(달력에서 지켜보는 곳마다)
  for (const r of S.tr?.cases ?? []) { assert.ok(depth.get('#/cal/' + r[0]) <= 2, `${r[1]} 종목 파일 2번 안`); }
  assert.equal(nodes.size, 12 + nCal + S.core.groups.length + S.core.industries.filter(i => i.n > 1).length + S.codes.length * 5 + (co7 ? outN * 5 : outN));
  if (co7) { assert.equal([...nodes.keys()].filter(r => r.startsWith('#/x/')).length, 0, '모든 회사 7단 — 밖 칸 길 없음'); assert.equal(S.core.co7, Object.keys(S.mk).length, 'core.co7 = 모든 회사'); }
  if (S.mk) for (const [c, m] of Object.entries(S.mk)) { assert.ok(depth.get((co7 || m.p ? '#/c/' : '#/x/') + c) <= 3, `${m.n} 3번 안`); // 모든 회사 — 3번이면 회사(모든 회사 7단이면 모두 3단 회사)
    if (co7) [['past', 4], ['rivals', 5], ['grow', 6], ['range', 7]].forEach(([sub, n]) => assert.ok(depth.get(`#/c/${c}/${sub}`) <= n, `${m.n} ${n}단 ${n}번 안`)); }
  for (const c of S.codes.slice(0, 50)) { assert.ok(depth.get('#/c/' + c) <= 3); assert.ok(depth.get(`#/c/${c}/range`) <= 7); }
  if (S.home?.s365?.top) { const top = '#/c/' + S.home.s365.top.c; assert.ok(nodes.get('#/').links.includes(top)); assert.equal(depth.get(top), 1); } // 오늘 가장 많이 오른 곳은 첫 화면에서 1번
  // 실제 화면에서 모은 길 지도(site_check.mjs --links)가 있으면 길 하나하나 맞대 봄(2026-10-12: 화면 1,878 · 다른 길 0)
  const lf = process.env.ATLAS_LINKS; if (!lf) return;
  const map = JSON.parse(fs.readFileSync(lf, 'utf8'));
  assert.deepEqual(new Set(Object.keys(map)), new Set([...nodes.keys()].filter(r => !r.startsWith('#/x/')))); // 밖 칸은 판(창)이라 실제 지도에 화면으로 없음
  for (const [r, ls] of Object.entries(map)) if (r !== '#/info') assert.deepEqual(new Set(ls.filter(x => x !== '#/info')), new Set(nodes.get(r).links.filter(x => x !== '#/info')), r);
});

test('진짜 길 함수(route) — 깨진 주소에도 멈추지 않고 「없는 주소」 · 옛 주소는 옛 판으로', async () => {
  const R = routeRunner(fs.readFileSync(path.join(SITE, 'atlas/atlas.js'), 'utf8'));
  const go = async h => (await R.run(h));
  let r = await go('#/x/%'); assert.equal(r.err, null); assert.deepEqual(r.calls, [['info', '?']]);
  r = await go('#/g/%ZZ'); assert.equal(r.err, null); assert.deepEqual(r.calls.map(c => c[0]), ['missing']);
  r = await go('#/c/%E0%A4%A/past'); assert.deepEqual(r.calls.map(c => c[0]), ['missing']);
  r = await go('#/c/005930/past'); assert.deepEqual(r.calls, [['past', '005930']]);
  r = await go('#/i/' + encodeURIComponent('반도체 장비')); assert.deepEqual(r.calls, [['i', '반도체 장비']]);
  r = await go('#/stocks'); assert.deepEqual(r.calls, [['replace', '#/']]); // 옛 ATLAS 주소 — 옛 판 영구 삭제(2026-10-15 23:35)로 첫 화면
  r = await go(''); assert.deepEqual(r.calls, [['home']]);
});

test('네 눈 점검 — 지금 자료는 네 눈 모두 실패 0 · 눈마다 정한 번 수', async () => {
  const market = readMarket(DATA, readMarket(DATA, null)); // 앞 회차와 같은 값인 회차(주말 · 바로 이어 올림 — 2026-10-12 21:11 회차가 클로드 눈 「줄마다 숫자」에 걸렸던 것)도 실패 0
  assert.equal(market.lines.length, 4);
  const r = await inspect4({siteDir: SITE, market, n: N, now: NOW});
  const stale = await inspect4({siteDir: SITE, market, n: 3000, now: new Date(Date.parse(NOW) + 20 * 864e5)}); // 20일 묵으면 구글 눈이 잡음
  assert.ok(kind(stale, 'google', 'date').fail > 0);
  for (const l of r.lenses) assert.equal(l.fail, 0, `${l.name}: ${JSON.stringify(l.kinds.flatMap(k => k.first)).slice(0, 300)}`);
  assert.deepEqual(r.lenses.map(l => [l.key, l.n]), [['apple', N], ['google', N], ['claude', N], ['cia', N]]);
  assert.ok(r.ok); assert.ok(lens(r, 'google').things > 5000, '구글 눈이 셀 것 — 회사 수에 따라 늘고 줆(365곳 때 5만 넘음 · 멍거 조건 26곳 때 9,523 · 멍거 · 린치 41곳 때 1만 넘음)'); assert.ok(kind(r, 'apple', 'click').n > 0 && kind(r, 'cia', 'fuzz').n > 0);
  assert.match(HEADER_TOP, /frame-ancestors 'none'/);
});

test('네 눈 점검 — 일부러 망가뜨리면 눈마다 잡음(깨진 길 · 틀린 숫자 · 금지 말 · 끼운 코드 · 비밀 · 바깥 주소)', async () => {
  const T = copySite();
  try {
    const rg = T.J('range.json'); rg.picks = [{rank: 1, code: '005930'}]; T.W('range.json', rg); // 지운 고른 목록이 자료에 다시 들어옴(2026-10-13 06:45 「영구 삭제」) → 구글 range · 클로드 code
    const comp = T.J('comp.json'); const c0 = Object.keys(comp.companies)[0]; comp.companies[c0].price += 1; T.W('comp.json', comp); // 1주 값이 회사 파일과 다름
    const c1 = Object.keys(comp.companies)[1], co1 = JSON.parse(fs.readFileSync(path.join(T.data, 'co', c1 + '.json'), 'utf8'));
    co1.extra = {url: 'javascript:alert(1)', note: '<img src=x onerror=alert(1)> nfp_' + 'A'.repeat(30)}; fs.writeFileSync(path.join(T.data, 'co', c1 + '.json'), JSON.stringify(co1));
    const c2 = Object.keys(comp.companies)[2]; fs.rmSync(path.join(T.data, 'co', c2 + '.json')); // 회사 파일 없음 → 4~7단이 못 열림
    const market = readMarket(T.data, null); market.lines.push('반도체는 곧 오른다 — 지금 사세요'); market.lines[0] = market.lines[0].replace('마감 값', '장 중 값(아직 바뀜)'); // 장이 끝난 자료에 「장 중」
    const r = await inspect4({siteDir: T.tmp, market, n: N, now: NOW});
    assert.equal(r.ok, false);
    assert.ok(kind(r, 'apple', 'company').fail > 0, '애플: 회사 파일 없음');
    assert.ok(kind(r, 'google', 'company').fail > 0 && kind(r, 'google', 'range').fail > 0 && kind(r, 'google', 'market').fail > 0, '구글: 1주 값 · 지운 고른 목록 · 「장 중」 말');
    assert.ok(kind(r, 'claude', 'banned').fail > 0 && kind(r, 'claude', 'market').fail > 0, '클로드: 판독 글 금지 말 · 권하는 말');
    assert.ok(kind(r, 'cia', 'inject').fail > 0 && kind(r, 'cia', 'url').fail > 0 && kind(r, 'cia', 'secret').fail > 0, 'CIA: 끼운 코드 · javascript: 주소 · 넷리파이 열쇠 꼴');
    // 화면 코드 — 바깥 주소 · 안전 문장이 빠지면
    const js = path.join(T.tmp, 'atlas/atlas.js'); fs.writeFileSync(js, fs.readFileSync(js, 'utf8').replace('저는 투자 상담사가 아닙니다', '저는').replace("'https://dart.fss.or.kr'", "'https://evil.example'") + "\nconst x36 = '매수 검토 36곳';\n"); // 지운 글이 다시 들어오면 클로드 눈이 막음
    const r2 = await inspect4({siteDir: T.tmp, market: readMarket(T.data, null), n: 2000, now: NOW});
    assert.ok(kind(r2, 'claude', 'code').fail > 0 && kind(r2, 'cia', 'code').fail > 0);
  } finally { fs.rmSync(T.tmp, {recursive: true, force: true}); }
});

test('네 눈 점검 — 멍거 · 린치 조건(2026-10-14 06:05): 옛 기준 말 · 차례 칸 · 좁은 금지 말 · 조건 밑 값 · 꼬리표가 어긋나면 클로드 눈이 잡음', async () => {
  const T = copySite();
  try {
    const core = T.J('core.json'); core.rules.window = '지난 30거래일 「대세」였던 업종부터'; core.rules.label += ' · 유망한 곳'; T.W('core.json', core); // 옛 기준 말 · 좁은 금지 말
    const comp = T.J('comp.json'), cs = Object.values(comp.companies), cm = cs.find(x => x.pick.mg), cl = cs.find(x => x.pick.ly && !x.pick.mg);
    cs[0].pick.rank = 1; cm.pick.mg.roe[0] = 9.5; cl.pick.ly.score = 1.2; T.W('comp.json', comp); // 회사마다 차례(규칙 55) · 18원 못 넘은 해(멍거 갈래) · 점수 2 밑(린치 갈래)
    const r = await inspect4({siteDir: T.tmp, market: readMarket(T.data, null), n: N, now: NOW}); // 눈마다 대상을 모두 한 번씩 보는 수(N)
    assert.equal(r.ok, false); assert.ok(kind(r, 'claude', 'code').fail > 0, '옛 기준 말 · 차례 칸'); assert.ok(kind(r, 'claude', 'narrow').fail > 0, '좁은 금지 말');
  } finally { fs.rmSync(T.tmp, {recursive: true, force: true}); }
});
