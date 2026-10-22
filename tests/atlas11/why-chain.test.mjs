// 「왜 그럴까?」 열한 걸음 시험(site/next/why-chain.js · why-steps.js · why-chain.css)
//   사장님 2026-10-22(서울) 08:53 「… 원숭이 엉덩이는 빨개 빨가면 사과 … 이런 식으로 11단계는 논리적으로 사방팔방으로 이야기 해야지 그 이야기를 움직이는 도식화로 해야 하고」
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {homeSteps, STEP_TAGS, ieyo, eokH} from '../../site/next/why-steps.js';
import {SCREEN} from '../../site/next/words.js';

const read = p => fs.readFileSync(new URL('../../' + p, import.meta.url), 'utf8');
const H = JSON.parse(read('site/atlas/data/home.json')), TH = JSON.parse(read('site/next/data/theme-home.json'));

test('첫 화면 걸음 — 오른 곳 · 내린 곳 모두 열하나 · 첫 걸음만 물음 없음 · 갈래 · 고리는 사이트 안', () => {
  for (const side of ['up', 'dn']) {
    const S = homeSteps({side, n: 766, date: '2026-10-13', H, TH, mine: {count: 3}});
    assert.equal(S.length, 11, side);
    assert.equal(S[0].q, undefined, '첫 걸음은 사실만');
    for (const [i, s] of S.entries()) {
      assert.ok(typeof s.a === 'string' && s.a.length > 0, side + ' ' + i);
      if (i) assert.ok(/[?]$/.test(s.q), side + ' ' + i + ' 물음은 「?」로 끝남');
      assert.ok(STEP_TAGS.includes(s.tag), s.tag);
      if (s.href) assert.match(s.href, /^#\//);
    }
    assert.deepEqual([...new Set(S.map(s => s.tag))].length >= 7, true, '사방팔방 — 갈래 일곱 넘게');
    assert.equal(S.at(-1).href, '#/why', '끝은 사기 전에 왜 사?');
    const all = S.map(s => (s.q ?? '') + ' ' + s.a).join(' ');
    for (const w of SCREEN) assert.ok(!all.includes(w), '쓰지 않을 말 ' + w);
    assert.doesNotMatch(all, /1등|오를 거|내릴 거|될 거예요|사세요|파세요/, '앞날 · 권함 없음');
  }
});

test('못 받은 값은 「?」 — 그래도 열한 걸음', () => {
  const S = homeSteps({side: 'up', n: NaN, date: '', H: {}, TH: null});
  assert.equal(S.length, 11);
  assert.ok(S.slice(1, 10).every(s => s.a.startsWith('?')), S.map(s => s.a).join(' | '));
  assert.match(S[0].a, /^오른 곳이 \?곳이에요$/);
});

test('글 꼴 — 받침 · 돈 단위', () => {
  assert.equal(ieyo('2차전지'), '2차전지예요');
  assert.equal(ieyo('콘텐츠 제작'), '콘텐츠 제작이에요');
  assert.equal(eokH(-17507), '1조 7,507억 원');
  assert.equal(eokH(2457), '2,457억 원');
});

test('그림 — 보안 규칙 · 별자리 자리 · 모양 규칙', async () => {
  const js = read('site/next/why-chain.js');
  assert.doesNotMatch(js, /innerHTML|insertAdjacentHTML|document\.write|setAttribute\('style'/);
  // 이름이 다른 곳 모양과 겹치면 안 됨(2026-10-22 P1 — 「play」가 app.css 영상 단추 .play 와 겹쳐 사슬 전체가 56px 동그라미 · 누름 막힘)
  const names = [...js.matchAll(/class: '([^']+)'|classList\.(?:add|remove|toggle)\('([^']+)'/g)].map(m => m[1] ?? m[2]);
  assert.ok(names.length >= 10, names.join(' '));
  for (const n of names) assert.match(n, /^wc(-[a-z]+)?$/, '모양 이름은 wc 로 시작 — ' + n);
  const app = read('site/next/app.css') + read('site/next/stone.css');
  for (const n of new Set(names)) assert.doesNotMatch(app, new RegExp('\\.' + n + '(?![\\w-])'), '공용 모양에 같은 이름 — ' + n);
  const {PTS, STEPS} = await import('../../site/next/why-chain.js').catch(() => ({})) ?? {};
  // why-chain.js 는 i18n.js(브라우저 모듈)를 불러 노드에서 못 읽힐 수 있음 — 자리는 글에서 읽음
  const pts = PTS ?? JSON.parse(/PTS = Object\.freeze\((\[\[[\d, \[\]]+\]\])\)/.exec(js)[1]);
  assert.equal(pts.length, STEPS ?? 11);
  for (const [x, y] of pts) assert.ok(x >= 20 && x <= 320 && y >= 20 && y <= 216, `자리 ${x},${y}`);
  for (let i = 0; i < pts.length; i++) for (let j = i + 1; j < pts.length; j++) assert.ok(Math.hypot(pts[i][0] - pts[j][0], pts[i][1] - pts[j][1]) > 55, `${i + 1}-${j + 1} 너무 가까움`);
  const {cssRules} = await import('../../scripts/atlas11/next/page_rules.mjs');
  assert.deepEqual(cssRules('site/next/why-chain.css'), []);
  assert.match(read('site/next/why-chain.css'), /prefers-reduced-motion: no-preference/, '움직임 줄이기 기기는 움직이지 않음');
});
