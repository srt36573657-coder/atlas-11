// 365곳 · 업종 73개(n365-v1) — 2026-10-05 05:07 사장님 「지금 180개를 365개로 한다 업종도 늘리고 더 세분화 한다」 · 09:22 「눌러서 했는데 180야 종목 365개 아니야 문제 찾이내서 해결해」
// 09:11 모음(한국거래소 업종으로만 나눈 s365-v1)은 330곳 · 업종 66개에서 멈췄다 → 네이버 업종 바탕 + 회사가 많은 업종만 한국거래소 업종으로 더 잘게(n365-v1)
// 같은 원자료로 다시 고르면 저장된 제안과 같은가 · 설정과 지금 입력이 그 제안을 가리키는가 · 사람들이 아는 자리에 있는가(삼성전자 = 반도체 · KB금융 = 은행·카드)를 실제 파일로 본다.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import zlib from 'node:zlib';
import {createHash} from 'node:crypto';
import {N365, SPLIT365_ROWS, BASE365, group365Of, selectSplit365} from '../../lib/atlas11/universe.mjs';
import {candidatesFromBundle, lastCompletedSession, proposeFromBundle} from '../../scripts/atlas11/collect_universe.mjs';
import {UNIVERSE_CONFIG, RETIRED_DIR} from '../../lib/atlas11/universe-switch.mjs';
import {root, readJSON} from './helpers.mjs';

const DIR = 'reports/atlas11/universe/2026-10-05-0930', FIRST = 'reports/atlas11/universe/2026-10-05-0911';

test('업종 이름 표: 나누는 짝은 같은 네이버 업종 안에서만 · 이름이 바탕 업종 이름과 섞이지 않음 · 표에 없는 짝은 바탕 업종으로', () => {
  assert.equal(group365Of({sector: '반도체와반도체장비', ksic: '통신 및 방송 장비 제조업'}), '반도체', '삼성전자 짝(표에 없음) → 바탕 업종');
  assert.equal(group365Of({sector: '반도체와반도체장비', ksic: '특수 목적용 기계 제조업'}), '반도체 장비');
  assert.equal(group365Of({sector: '은행', ksic: '기타 금융업'}), '은행·카드', 'KB금융 짝 → 은행·카드(기타 금융과 섞이지 않음)');
  assert.equal(group365Of({sector: '무선통신서비스', ksic: '전기 통신업'}), '통신');
  assert.equal(group365Of({sector: '없는업종', ksic: null}), '없는업종', '표에 없는 네이버 업종은 그 이름 그대로');
  assert.equal(group365Of({sector: null, ksic: '반도체 제조업'}), null, '네이버 업종을 모르면 업종 모름');
  const keys = SPLIT365_ROWS.map(([n, k]) => `${n}|${k}`);
  assert.equal(new Set(keys).size, keys.length, '같은 짝이 두 번 없음');
  assert.ok(SPLIT365_ROWS.every(([n]) => n.replace(/\s+/g, '') in BASE365), '나누는 짝의 네이버 업종은 모두 바탕 표에 있음');
});

test('실제 묶음: 10/5 09:11 원자료로 n365-v1 을 다시 고르면 저장된 제안과 같다 · 73개 업종 × 5곳 = 365곳 · 나누는 표의 짝마다 실제 회사가 있음', async () => {
  const proposal = await readJSON(DIR + '/proposal.json'), first = await readJSON(FIRST + '/proposal.json');
  assert.equal(first.ok, false); assert.equal(first.counts.picked, 330, '한국거래소 업종으로만 나눈 첫 제안은 330곳에서 멈춤(그래서 n365-v1)');
  assert.equal(proposal.ok, true); assert.equal(proposal.id, 'u2-n365-v1-2026-10-05'); assert.equal(proposal.bundle.file, FIRST + '/bundle.json.gz');
  const gz = await fs.readFile(path.join(root, proposal.bundle.file));
  assert.equal(createHash('sha256').update(gz).digest('hex'), proposal.bundle.sha256, '원자료가 그때 그대로');
  const bundle = JSON.parse(zlib.gunzipSync(gz).toString('utf8')), old = await readJSON(RETIRED_DIR + '/u2-i36-v1-2026-10-04.json');
  const again = proposeFromBundle(bundle, {input: old, now: proposal.createdAt, rules: N365});
  assert.equal(again.proposal.ok, true);
  assert.deepEqual(again.proposal.picked.map(p => `${p.code}:${p.industry}`), proposal.picked.map(p => `${p.code}:${p.industry}`));
  const by = new Map(); for (const p of proposal.picked) by.set(p.industry, [...(by.get(p.industry) ?? []), p]);
  assert.equal(by.size, 73); assert.ok([...by.values()].every(ps => ps.length === 5), '업종마다 5곳');
  assert.equal(new Set(proposal.picked.map(p => p.code)).size, 365);
  const sessions = old.calendar.sessions, cands = candidatesFromBundle(bundle, {sessions, asOf: lastCompletedSession(sessions, bundle.now), input: old});
  const nz = s => String(s ?? '').replace(/\s+/g, '');
  const empty = SPLIT365_ROWS.filter(([n, k]) => !cands.some(c => nz(c.sector) === nz(n) && nz(c.ksic) === nz(k)));
  assert.deepEqual(empty, [], '표의 짝은 모두 실제 회사에 맞음(이름이 틀린 짝 없음)');
  const sel = selectSplit365(cands, N365);
  const caps = sel.counts.chosen.map(x => x.capEok); assert.deepEqual(caps, [...caps].sort((a, b) => b - a), '업종 차례 = 5곳 시가총액 합 큰 순');
  for (const [code, want] of [['005930', '반도체'], ['000660', '반도체'], ['105560', '은행·카드'], ['055550', '은행·카드'], ['005380', '자동차'], ['373220', '2차전지'], ['035420', '인터넷 플랫폼']]) {
    const p = proposal.picked.find(x => x.code === code); assert.ok(p, code + ' 이 365곳에 있음'); assert.equal(p.industry, want, `${p.name} = ${want}`);
  }
  // 고른 날(10/2) 뒤 일봉은 넣지 않음(월요일 아침 장중에 모음)
  const ni = await readJSON(DIR + '/next-input.json');
  assert.ok(ni.assets.every(a => a.prices.every(r => r.date <= '2026-10-02')));
});

test('지금 묶음: 설정·입력 = 365곳 제안 · 180곳 입력은 보관 · 업종마다 5곳 · 회사마다 한국거래소 업종 · 장부에 바꾼 기록', async () => {
  const cfg = await readJSON(UNIVERSE_CONFIG), text = await fs.readFile(path.join(root, 'public/data/input.json'), 'utf8'), input = JSON.parse(text);
  assert.equal(cfg.current.id, 'u2-n365-v1-2026-10-05'); assert.equal(cfg.next, null); assert.equal(cfg.selectRules, 'n365-v1');
  assert.equal(input.universe.id, cfg.current.id); assert.equal(input.assets.length, 365);
  const ni = await readJSON(DIR + '/next-input.json');
  assert.deepEqual(input.assets.map(a => a.code), ni.assets.map(a => a.code), '지금 입력의 회사 = 제안의 365곳(같은 차례)');
  assert.equal(createHash('sha256').update(await fs.readFile(path.join(root, DIR + '/next-input.json'), 'utf8')).digest('hex'), cfg.current.inputSHA256, '설정이 가리키는 제안 입력 그대로');
  const by = {}; for (const a of input.assets) by[a.industry] = (by[a.industry] ?? 0) + 1;
  assert.equal(Object.keys(by).length, 73); assert.ok(Object.values(by).every(v => v === 5));
  assert.ok(input.assets.every(a => a.ksic && a.sector), '회사마다 네이버 업종 · 한국거래소 업종');
  const retired = await readJSON(RETIRED_DIR + '/u2-i36-v1-2026-10-04.json'); assert.equal(retired.assets.length, 180);
  const ops = (await fs.readFile(path.join(root, 'reports/atlas11/ledger/operation/2026-10-05.jsonl'), 'utf8')).trim().split('\n').map(l => JSON.parse(l));
  const sw = ops.find(r => r.body?.kind === 'universe_switch' && r.body.to === 'u2-n365-v1-2026-10-05');
  assert.ok(sw, '장부에 바꾼 기록'); assert.equal(sw.body.from, 'u2-i36-v1-2026-10-04'); assert.equal(sw.body.kept + sw.body.added, 365);
});
