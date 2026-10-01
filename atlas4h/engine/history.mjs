/**
 * ATLAS 4시간 엔진 · 지난 자료 파일 읽기 (atlas4h/data/history/<id>.json · schema atlas4h-history-1 · collect.mjs 가 씀)
 *
 * 파일 한 줄(series[]) = {date, value, sources: {출처 이름: 값}, status: 'ok' | '한 출처' | '확인 중'(value null)}
 * 날짜만 있는 값의 관측 시각 = 그 시장 마감(약속 10): 코스피 15:30 KST · 반도체지수 뉴욕 16:00(서머타임 셈 · clock.mjs)
 * 파일이 없거나 꼴이 다르면 null — 짐작해 채우지 않는다.
 */
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {usCloseUtcMs, isoKst} from './clock.mjs';

export const HISTORY_SCHEMA = 'atlas4h-history-1';
export const HISTORY_DIR = 'atlas4h/data/history';

export const fileSha256 = buf => crypto.createHash('sha256').update(buf).digest('hex');

/** 파일 하나 → {id, file(저장소 기준 경로), sha256, doc, rows(값 있는 줄만, 날짜순)} 또는 {id, none, why} */
export function loadHistory(dir, id, root = null) {
  const abs = path.join(dir, `${id}.json`);
  let buf;
  try {
    buf = fs.readFileSync(abs);
  } catch {
    return {id, none: true, why: `${id} 지난 자료 파일 없음 (${root ? path.relative(root, abs) : abs})`};
  }
  let doc;
  try {
    doc = JSON.parse(buf.toString('utf8'));
  } catch (e) {
    return {id, none: true, why: `${id} 지난 자료 파일을 못 읽음 (${e.message})`};
  }
  if (doc?.schema !== HISTORY_SCHEMA || doc?.id !== id || !Array.isArray(doc.series)) {
    return {id, none: true, why: `${id} 지난 자료 파일 꼴이 ${HISTORY_SCHEMA} 아님`};
  }
  const series = [...doc.series].filter(r => typeof r?.date === 'string').sort((a, b) => a.date.localeCompare(b.date));
  return {id, file: root ? path.relative(root, abs).split(path.sep).join('/') : abs, sha256: fileSha256(buf), doc, series};
}

/** 폴더의 여러 파일 → {id: 읽은 것} (없는 것도 {none, why} 로 둔다) */
export function loadHistories(dir, ids = ['kospi', 'sox'], root = null) {
  return Object.fromEntries(ids.map(id => [id, loadHistory(dir, id, root)]));
}

/** 그 시장 마감 시각(ISO KST) — 날짜만 있는 값의 관측 시각 */
export function closeObservedAt(id, date) {
  if (id === 'kospi') return `${date}T15:30:00+09:00`;
  return isoKst(usCloseUtcMs(date));
}

const ok = v => typeof v === 'number' && Number.isFinite(v) && v > 0;

/**
 * 날짜 date 까지의 하루 등락(%) — 이웃한 두 줄이 모두 값이 있을 때만 센다.
 * [판단] 값이 없는 줄(「확인 중」 null)을 끼고는 등락을 「없음」으로 빼고, 이틀 치를 하루로 이어 붙이지 않는다.
 * 셈은 종목과 같다: (오늘 ÷ 어제 − 1) × 100
 */
export function changesUpTo(series, date) {
  const out = [];
  for (let i = 1; i < series.length; i++) {
    const r = series[i];
    if (r.date > date) break;
    const p = series[i - 1];
    if (ok(r.value) && ok(p.value)) out.push({date: r.date, changePct: (r.value / p.value - 1) * 100, prev: p.value, value: r.value});
  }
  return out;
}

/** 그날 줄 (없으면 null) */
export function rowOf(series, date) {
  return series.find(r => r.date === date) ?? null;
}
