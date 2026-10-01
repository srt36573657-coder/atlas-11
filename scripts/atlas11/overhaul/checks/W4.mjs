/**
 * W4 · R2~R5 시험 T5~T7 — 성적 화면 「종목별 맞고 틀림」(네 칸 + 종목별 표·세 줄 카드)
 *   T5 clarity_check 일곱 숫자 = 0 · 보기 5개 × 화면 7장 (reports/atlas11/clarity/w4.json · clarity_check.mjs --label w4 가 만든 것)
 *   T6 browser_check 실패 0 (reports/atlas11/browser/latest.json · 새 W4 검사 포함) · atlas11:test 모두 통과(여기서 다시 돌림)
 *   T7 모서리(16절): 360px · 360px 어두운 화면 · 360px 어두운 화면 글씨 200% · PC · PC 글씨 200% 에서 채점일마다 줄 수 = score-cells ·
 *      네 칸 합 = 줄 수 · 보류 수 표시 · 가장 긴 이름(LS ELECTRIC · 한화에어로스페이스) 안 잘림 · 실제 보합 칸 「보합」 표시(9/29·9/30 6칸) ·
 *      예측 방향 옆 확률 · 가운데 값 표시 · 360px 카드 4줄 이하 · 줄 앞 「·」 0 · 오차 끝값 표시
 *      + 결함 심기(따지는 이 G6): 카드 하나 지우기 · 긴 이름 자르기 · 「보합」 표시 지우기 — 셋 다 같은 판정이 잡아야 통과
 *   T6 의 atlas11:test 출력은 저장소 밖(운영체제 임시 폴더 atlas11-w4-tests.tap)에 쓴다 — 저장소 파일을 고치지 않음(따지는 이 C6)
 *   --fast 를 주면 T6 의 atlas11:test 는 다시 돌리지 않고 그 임시 파일의 결과를 읽는다(같은 세션에서 돌린 것만)
 */
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {spawnSync} from 'node:child_process';

export const TAP = path.join(os.tmpdir(), 'atlas11-w4-tests.tap');

const KEYS = ['relDays', 'vague', 'bareNumbers', 'graphable', 'lowContrast', 'decoColors', 'truncated'];
const VIEWS = ['pc', 'mobile', 'mobile-dark', 'pc-200', 'mobile-dark-200'];
const SCREENS = ['forecast', 'stock', 'race', 'scores', 'evolution', 'records', 'status'];

export default async function ({report, rel, ROOT}) {
  const read = p => { try { return JSON.parse(fs.readFileSync(rel(p), 'utf8')); } catch { return null; } };
  // T5
  const cl = read('reports/atlas11/clarity/w4.json');
  if (!cl) report('T5', false, {error: 'reports/atlas11/clarity/w4.json 없음 — clarity_check.mjs --label w4 를 아직 안 돌림'});
  else {
    const table = {}, bad = [];
    for (const v of VIEWS) for (const s of SCREENS) { const m = cl.views?.[v]?.[s]; if (!m) { bad.push(`${v}/${s} 없음`); continue; } const vals = KEYS.map(k => m[k]); table[`${v}/${s}`] = vals.join(' '); if (vals.some(x => x !== 0)) bad.push(`${v}/${s}: ${vals.join(' ')}`); }
    report('T5', bad.length === 0, {measuredAt: cl.at, views: VIEWS.length, screens: SCREENS.length, keys: KEYS, nonZero: bad, scores: Object.fromEntries(VIEWS.map(v => [v, table[`${v}/scores`]]))});
  }
  // T6
  const br = read('reports/atlas11/browser/latest.json');
  const w4Checks = (br?.checks ?? []).filter(c => /^W4 /.test(c.name));
  let tests = null;
  if (process.argv.includes('--fast')) { const tap = fs.existsSync(TAP) ? fs.readFileSync(TAP, 'utf8') : ''; tests = {source: TAP, at: fs.existsSync(TAP) ? fs.statSync(TAP).mtime.toISOString() : null, pass: Number(/^# pass (\d+)/m.exec(tap)?.[1] ?? NaN), fail: Number(/^# fail (\d+)/m.exec(tap)?.[1] ?? NaN)}; }
  else { const r = spawnSync(process.execPath, ['--test', '--test-reporter=tap', '--test-concurrency=1', ...fs.readdirSync(rel('tests/atlas11')).filter(f => f.endsWith('.test.mjs')).map(f => 'tests/atlas11/' + f)], {cwd: ROOT, encoding: 'utf8', maxBuffer: 256 << 20}); const tap = r.stdout ?? ''; fs.writeFileSync(TAP, tap); tests = {source: 'atlas11:test 다시 돌림 → ' + TAP, pass: Number(/^# pass (\d+)/m.exec(tap)?.[1] ?? NaN), fail: Number(/^# fail (\d+)/m.exec(tap)?.[1] ?? NaN), exit: r.status}; }
  report('T6', !!br && br.failed === 0 && br.passed > 0 && w4Checks.length > 0 && tests.fail === 0 && tests.pass > 0, {browser: br ? {at: br.at, passed: br.passed, failed: br.failed, w4Checks: w4Checks.length, dir: br.dir} : null, tests});
  // T7
  const corner = w4Checks.filter(c => /^W4 모서리 /.test(c.name));
  const views = [...new Set(corner.map(c => c.detail?.view).filter(Boolean))];
  const flats = corner.filter(c => c.detail?.flat).reduce((acc, c) => { acc[c.detail.view] = (acc[c.detail.view] ?? 0) + c.detail.flat.shown; return acc; }, {});
  const longSeen = corner.flatMap(c => c.detail?.long ?? []).filter(x => x.present);
  const plants = w4Checks.filter(c => /^W4 결함 심기 /.test(c.name));
  const t7 = corner.length > 0 && corner.every(c => c.ok) && views.length === 5 && Object.values(flats).length === 5 && Object.values(flats).every(n => n === 6) && ['LS ELECTRIC', '한화에어로스페이스'].every(n => longSeen.some(x => x.name === n && x.fits)) && plants.length === 3 && plants.every(c => c.ok);
  report('T7', t7, {checks: corner.length, failed: corner.filter(c => !c.ok).map(c => c.name), views, flatShownPerView: flats, longestNames: [...new Set(longSeen.map(x => `${x.name}:${x.fits ? '안 잘림' : '잘림'}`))], maxCardLines360: Math.max(0, ...corner.filter(c => /^360(-dark)?$/.test(c.detail?.view ?? '')).map(c => c.detail.maxLines)), plants: plants.map(c => ({planted: c.detail?.planted, caught: c.ok, fails: c.detail?.fails}))});
}
