/**
 * ATLAS 11 · 종목 바꾸기(지금 묶음 → 새 묶음 · 곳 수는 묶음마다 다름: 52곳 → 180곳 등) — 매일 실행기(daily.mjs)가 쓰는 작은 도구들.
 *   2026-10-04 18:10 사장님 「이제 이런식으로 180개 회사를 찾는다 우량주 그리고 시대 트랜드 주식만」 · 18:24 「알아서 해」 → 곳 수를 52로 못 박지 않는다(설정 next.count)
 *   2026-10-04 00:51 사장님 「52개 업종에서 찾는 게 아니라 오를 수 있는 52개 우량 종목을 찾아 첫 화면에 배열하는 구조로 싹 변경하자」 · 01:00 「알아서 해」
 *
 * 순서(같은 실행 안에서): ② 지금 종목과 새 종목의 오늘 종가를 둘 다 받는다 → ③ 각자 검증·보관 → ④ 옛 발행본은 옛 종목 가격으로 채점(새 기록만 덧붙임)
 *   → ⑤½ 새 52종목 오늘 종가가 모두 확정이면 그때 바꾼다(지금 입력은 reports/atlas11/universe/retired/<id>.json 으로 보관) → ⑥ 새 52종목으로 발행
 *   새 종목 종가가 하나라도 빠지면 바꾸지 않고 옛 종목으로 하루 더 간다(다음 실행에서 다시 시도 · 받은 종가는 작업본에 이어 붙여 둔다).
 * 바꾼 뒤에도 옛 발행본·채점 기록은 지우거나 고치지 않는다 — 채점·화면은 「지금 종목 + 물러난 종목」을 합친 입력(scoringInput)으로 옛 숫자 그대로 다시 센다.
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import {createHash} from 'node:crypto';

export const UNIVERSE_CONFIG = 'config/atlas11/universe.json';
export const RETIRED_DIR = 'reports/atlas11/universe/retired';
export const WORKING_NEXT = 'reports/atlas11/universe/next-input-working.json';
export const FIRST_UNIVERSE = 'u1-sector52';
const sha = s => createHash('sha256').update(s).digest('hex');
const read = async (file, otherwise) => { try { return JSON.parse(await fs.readFile(file, 'utf8')); } catch (e) { if (e.code === 'ENOENT' && otherwise !== undefined) return otherwise; throw e; } };
const atomicWrite = async (file, text) => { await fs.mkdir(path.dirname(file), {recursive: true}); await fs.writeFile(file + '.next', text); await fs.rename(file + '.next', file); };

export const universeIdOf = input => input?.universe?.id ?? FIRST_UNIVERSE;
export async function loadUniverseConfig(rootDir) { return read(path.join(rootDir, UNIVERSE_CONFIG), {schema: 'atlas11-universe-config-1', current: {id: FIRST_UNIVERSE}, next: null}); }

/** 물러난 종목 입력들(보관본) — 오래된 것부터 */
export async function loadRetired(rootDir) {
  let names = []; try { names = (await fs.readdir(path.join(rootDir, RETIRED_DIR))).filter(f => f.endsWith('.json')).sort(); } catch (e) { if (e.code !== 'ENOENT') throw e; }
  const out = [];
  for (const f of names) { const input = await read(path.join(rootDir, RETIRED_DIR, f)); out.push({id: f.replace(/\.json$/, ''), file: path.join(RETIRED_DIR, f), retiredAt: input.retiredAt ?? null, input}); }
  return out.sort((a, b) => String(a.retiredAt ?? '').localeCompare(String(b.retiredAt ?? '')) || a.id.localeCompare(b.id));
}

/** 채점·옛 기록 화면용 입력: 지금 종목 + 물러난 종목(지금 없는 코드만 · 가장 최근 보관본 우선). 지금 종목은 바꾸지 않는다. */
export function scoringInput(input, retired = []) {
  const have = new Set(input.assets.map(a => a.code)), extra = [];
  for (const r of [...retired].reverse()) for (const a of r.input.assets) if (!have.has(a.code)) { have.add(a.code); extra.push({...a, retiredFrom: r.id}); }
  return extra.length ? {...input, assets: [...input.assets, ...extra]} : input;
}

/** 날짜 → 그날의 52종목 코드(채점판 줄) — 물러난 묶음은 물러난 날(retiredOn)까지 · 그 뒤는 지금 묶음. 물러난 것이 없으면 null(예전 그대로 모든 종목) */
export function universeCodesOn(input, retired = []) {
  const spans = retired.filter(r => r.input?.retiredOn).sort((a, b) => a.input.retiredOn.localeCompare(b.input.retiredOn)).map(r => ({until: r.input.retiredOn, codes: r.input.assets.map(a => a.code)}));
  if (!spans.length) return null;
  const active = input.assets.map(a => a.code);
  return date => spans.find(s => date <= s.until)?.codes ?? active;
}

/** 오늘 바꿀 차례인가(설정에 next 가 있고 · 오늘이 바꾸는 날 이후이고 · 아직 안 바꿨으면) */
export function switchDue(config, input, day) {
  const n = config?.next;
  return Boolean(n && n.id && day && n.switchOn && day >= n.switchOn && universeIdOf(input) !== n.id);
}

/** 새 입력: 작업본(그동안 받은 종가를 이어 붙인 것)이 있으면 그것 · 없으면 제안 파일(해시 확인) */
export async function loadNextInput(rootDir, next) {
  const working = await read(path.join(rootDir, WORKING_NEXT), null);
  if (working && working.universe?.id === next.id) return {input: working, file: WORKING_NEXT, from: 'working'};
  const text = await fs.readFile(path.join(rootDir, next.input), 'utf8');
  if (next.inputSHA256 && sha(text) !== next.inputSHA256) throw Error('UNIVERSE_NEXT_INPUT_HASH');
  const input = JSON.parse(text);
  const n = input.assets?.length ?? 0, want = Number.isInteger(next.count) ? next.count : n;
  if (input.universe?.id !== next.id || n < 1 || n !== want || new Set(input.assets.map(a => a.code)).size !== n) throw Error('UNIVERSE_NEXT_INPUT_SHAPE');
  return {input, file: next.input, from: 'proposal'};
}
export async function saveWorkingNext(rootDir, input) { const text = JSON.stringify(input); await atomicWrite(path.join(rootDir, WORKING_NEXT), text); return sha(text); }

/**
 * 바꾸기: 지금 입력을 보관본으로 쓰고 → input.json 을 새 입력으로 → 작업본은 지운다. 반환: {from, to, retiredFile, inputSHA256}
 *   보관본은 같은 이름이 이미 있으면 덮어쓰지 않는다(먼저 보관한 것이 옛 기록의 기준).
 */
export async function applySwitch(rootDir, {current, next, now, day}) {
  const from = universeIdOf(current), retiredFile = path.join(RETIRED_DIR, from + '.json');
  const archived = {...current, retiredAt: now, retiredOn: day, retiredBy: next.universe?.id ?? null};
  try { await fs.mkdir(path.join(rootDir, RETIRED_DIR), {recursive: true}); await fs.writeFile(path.join(rootDir, retiredFile), JSON.stringify(archived), {flag: 'wx'}); }
  catch (e) { if (e.code !== 'EEXIST') throw e; }
  const text = JSON.stringify(next);
  await atomicWrite(path.join(rootDir, 'public/data/input.json'), text);
  await fs.rm(path.join(rootDir, WORKING_NEXT), {force: true});
  return {from, to: universeIdOf(next), retiredFile, inputSHA256: sha(text), codesFrom: current.assets.map(a => a.code), codesTo: next.assets.map(a => a.code)};
}
