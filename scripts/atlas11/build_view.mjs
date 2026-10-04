/**
 * ATLAS 11 · 판 화면 묶음 만들기 — public/data/atlas11/view/ (예측 없음 · 2026-10-04 21:04 업종 36개 · 180곳 · 요즘 불장 업종 · 다음 불장 후보)
 *   2026-10-04 15:37 사장님 「이제 예측을 하지 않는다 예측에 관련된 모든 기능과 화면을 삭제하고. 표현하지 마라」
 *   node scripts/atlas11/build_view.mjs [--now ISO]
 *   읽는 것: public/data/input.json(지난 주가) · reports/atlas11/context/latest.json 이 가리키는 관측 묶음(수급·기사·공시·지수)
 *           · public/data/atlas11/schedule-events.json(확인된 일정) · config/atlas11/universe.json(바뀔 묶음 미리 보기)
 *   지난 예측 묶음은 git 기록(1958247 까지)에 남아 있다 — 이 묶음은 그 파일들을 지우고 새로 쓴다(화면 묶음은 매일 다시 만드는 사본).
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import {buildBoard, universeNextOf} from '../../lib/atlas11/board.mjs';
import {loadUniverseConfig, loadNextInput, universeIdOf} from '../../lib/atlas11/universe-switch.mjs';

const root = process.cwd();
const arg = name => { const i = process.argv.indexOf(name); return i < 0 ? null : process.argv[i + 1]; };
const read = async (file, otherwise) => { try { return JSON.parse(await fs.readFile(path.join(root, file), 'utf8')); } catch (e) { if (e.code === 'ENOENT' && otherwise !== undefined) return otherwise; throw e; } };

/** 화면 묶음을 메모리에서만 만든다(파일에 쓰지 않음) */
export async function buildViewFiles({now = new Date().toISOString()} = {}) {
  const [input, calendar, contextLatest, schedule] = await Promise.all([read('public/data/input.json'), read('public/data/rolling-calendar.json', null), read('reports/atlas11/context/latest.json', null), read('public/data/atlas11/schedule-events.json', null)]);
  const snap = contextLatest?.file ? await read(contextLatest.file, null) : null;
  // 바뀔 묶음 미리 보기 — 설정에 next 가 있고 아직 안 바꿨을 때만 · 새 입력은 매일 실행기와 같은 방법(작업본 또는 해시 확인한 제안 파일)으로 읽는다
  //   읽지 못하면 미리 보기만 빼고 화면은 그대로 만든다(바꾸기는 매일 실행기가 따로 판단)
  let universeNext = null;
  const uniConfig = await loadUniverseConfig(root);
  if (uniConfig?.next?.id && universeIdOf(input) !== uniConfig.next.id) {
    try { universeNext = universeNextOf({config: uniConfig, nextInput: (await loadNextInput(root, uniConfig.next)).input, input, sessions: calendar?.sessions ?? input.calendar?.sessions ?? [], now}); }
    catch (e) { console.warn('universe next preview: ' + e.message); }
  }
  return buildBoard({input, snap, contextFile: contextLatest?.file ?? null, events: schedule?.events ?? [], eventsSource: '확인된 일정표(public/data/atlas11/schedule-events.json · 일정마다 공식 출처 주소)', universeNext, now});
}

export async function buildAndWriteView({now = new Date().toISOString()} = {}) {
  const files = await buildViewFiles({now});
  const dir = path.join(root, 'public/data/atlas11/view');
  await fs.rm(dir + '.next', {recursive: true, force: true});
  await fs.mkdir(path.join(dir + '.next', 'stocks'), {recursive: true});
  for (const [name, value] of files) await fs.writeFile(path.join(dir + '.next', name), JSON.stringify(value));
  await fs.rm(dir, {recursive: true, force: true}); await fs.rename(dir + '.next', dir);
  const manifest = files.get('manifest.json');
  return {boardId: manifest.boardId, asOf: manifest.asOf, companies: manifest.companies, files: files.size, dir: path.relative(root, dir), universeNext: manifest.universeNext?.id ?? null, bytes: [...files.values()].reduce((s, v) => s + Buffer.byteLength(JSON.stringify(v)), 0)};
}

if (process.argv[1] && path.resolve(process.argv[1]) === new URL(import.meta.url).pathname) {
  console.log(JSON.stringify(await buildAndWriteView({now: arg('--now') ?? new Date().toISOString()})));
}
