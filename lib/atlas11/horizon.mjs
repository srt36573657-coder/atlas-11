/**
 * ATLAS 11 · 「내일 하루만」 스위치 읽기 — config/atlas11/horizon.json
 *   사장님 명령(2026-10-02 00:08 KST): 「ATLAS는 단 하루, 내일만 예측한다 · 멈춘 것은 지우지 말고 꺼 두어라」
 *   futureDays = 1  → 내일(다음 장날) 하루만 계산·화면·그래프
 *   futureDays = 20 → 옛 20거래일 동작(코드는 지우지 않고 이 값으로만 끈다 · 파일이 없을 때도 20)
 * 계산·채점·화면이 모두 이 한 곳만 읽는다(따로 숫자를 적지 않는다).
 */
import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';

export const HORIZON_CONFIG = 'config/atlas11/horizon.json';
export const LEGACY_FUTURE_DAYS = 20;
/** 옛 20거래일 모드에서 채점·화면에 쓰던 거리(거래일) */
export const LEGACY_HORIZONS = Object.freeze([1, 5, 10, 20]);

export function loadHorizon(rootDir = process.cwd()) {
  let text = null;
  try { text = fs.readFileSync(path.join(rootDir, HORIZON_CONFIG), 'utf8'); } catch (e) { if (e.code !== 'ENOENT') throw e; }
  if (text == null) return {futureDays: LEGACY_FUTURE_DAYS, tomorrowOnly: false, since: null, config: null, configSHA256: null, file: null};
  const config = JSON.parse(text);
  if (![1, LEGACY_FUTURE_DAYS].includes(config.futureDays)) throw Error('HORIZON_CONFIG_FUTURE_DAYS');
  return {futureDays: config.futureDays, tomorrowOnly: config.futureDays === 1, since: config.since ?? null, config, configSHA256: createHash('sha256').update(text).digest('hex'), file: HORIZON_CONFIG};
}

/** 채점·화면에 남기는 거리 — 내일만이면 [1] */
export function activeHorizons(h) { return h?.tomorrowOnly ? [1] : [...LEGACY_HORIZONS]; }

/** 화면·기록에 보일 「꺼 둠」 한 줄 */
export function offNote(h) { return h?.tomorrowOnly ? `내일 말고의 전망은 꺼 둠(${h.since ?? '2026-10-02'} 사장님 명령 · 지난 기록은 그대로)` : null; }
