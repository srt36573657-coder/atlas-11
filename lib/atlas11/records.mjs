/**
 * ATLAS 11 · 기록 장부(영구 · 덮어쓰기 없음)
 * 8종류: collection 수집 · forecast 예측 · score 채점 · analysis 원인 분석 · factor 요인 · experiment 실험 · model 모델 · operation 운영
 * 파일: reports/atlas11/ledger/<type>/<YYYY-MM-DD(KST)>.jsonl — 한 줄이 기록 하나. 같은 내용(같은 id)은 다시 쓰지 않는다(중복 실행 안전).
 * 정정: 새 기록에 supersedes(이전 id)·correctionReason 을 붙인다. 이전 기록은 남는다.
 * 연결: links {inputSnapshotId, forecastId, observationIds, scoreIds, analysisId, candidateId, modelVersionId, operationId}
 * 화면용 색인: public/data/atlas11/ledger/index.json + <type>/<date>.json · 내려받기 CSV: public/downloads/atlas11/ledger/<type>-<date>.csv
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import {createHash} from 'node:crypto';

export const LEDGER_TYPES = Object.freeze(['collection', 'forecast', 'score', 'analysis', 'factor', 'experiment', 'model', 'operation']);
export const LEDGER_LABELS = Object.freeze({collection: '수집', forecast: '예측', score: '채점', analysis: '원인 분석', factor: '요인', experiment: '실험', model: '모델', operation: '운영'});
export const LEDGER_DIR = 'reports/atlas11/ledger';
export const canonical = x => Array.isArray(x) ? x.map(canonical) : x && typeof x === 'object' ? Object.fromEntries(Object.keys(x).sort().filter(k => x[k] !== undefined).map(k => [k, canonical(x[k])])) : x;
export const sha = x => createHash('sha256').update(typeof x === 'string' ? x : JSON.stringify(canonical(x))).digest('hex');
export const koreaDay = at => new Date(Date.parse(at) + 9 * 3600000).toISOString().slice(0, 10);
const validDate = d => /^\d{4}-\d{2}-\d{2}$/.test(d ?? '');

export function recordId(type, body) { if (!LEDGER_TYPES.includes(type)) throw Error('LEDGER_TYPE ' + type); return type + '-' + sha({type, body}).slice(0, 16); }

async function readLines(file) { try { return (await fs.readFile(file, 'utf8')).split('\n').filter(Boolean).map(l => JSON.parse(l)); } catch (e) { if (e.code === 'ENOENT') return []; throw e; } }

/** 기록 추가 — 같은 id 가 이미 있으면 다시 쓰지 않는다 */
export async function appendRecord(rootDir, {type, dateKST = null, at = new Date().toISOString(), body, links = {}, supersedes = null, correctionReason = null, configSHA256 = null, codeSHA256 = null}) {
  if (!body || typeof body !== 'object') throw Error('LEDGER_BODY');
  if (supersedes && !correctionReason) throw Error('LEDGER_CORRECTION_REASON_REQUIRED');
  const date = dateKST ?? koreaDay(at); if (!validDate(date)) throw Error('LEDGER_DATE');
  const id = recordId(type, body), dir = path.join(rootDir, LEDGER_DIR, type), file = path.join(dir, date + '.jsonl');
  await fs.mkdir(dir, {recursive: true});
  const existing = (await readLines(file)).find(r => r.id === id);
  if (existing) return {record: existing, duplicate: true, file: path.relative(rootDir, file)};
  const record = {id, type, dateKST: date, at, tz: 'Asia/Seoul', links, supersedes, correctionReason, configSHA256, codeSHA256, body};
  await fs.appendFile(file, JSON.stringify(record) + '\n');
  return {record, duplicate: false, file: path.relative(rootDir, file)};
}

export async function listDates(rootDir, type) { try { return (await fs.readdir(path.join(rootDir, LEDGER_DIR, type))).filter(f => f.endsWith('.jsonl')).map(f => f.slice(0, 10)).sort(); } catch (e) { if (e.code === 'ENOENT') return []; throw e; } }
export async function readRecords(rootDir, type, {dates = null, from = null, to = null} = {}) {
  const all = dates ?? (await listDates(rootDir, type)).filter(d => (!from || d >= from) && (!to || d <= to));
  const out = []; for (const d of all) out.push(...await readLines(path.join(rootDir, LEDGER_DIR, type, d + '.jsonl')));
  return out;
}
/** 현재 유효한 기록만(정정으로 대체된 것 제외) */
export function currentRecords(records) { const superseded = new Set(records.map(r => r.supersedes).filter(Boolean)); return records.filter(r => !superseded.has(r.id)); }

/** 화면 검색용 색인 + 종류·날짜별 JSON 복사본 (원본 장부는 그대로) */
export async function buildLedgerIndex(rootDir, {publicDir = 'public/data/atlas11/ledger', downloadDir = 'public/downloads/atlas11/ledger', now = new Date().toISOString()} = {}) {
  const index = {schema: 'atlas11-ledger-index-1', generatedAt: now, types: LEDGER_TYPES.map(t => ({id: t, label: LEDGER_LABELS[t]})), dates: [], byDate: {}, facets: {codes: {}, groups: {}, factors: {}, classes: {}, causes: {}, modelVersions: {}, statuses: {}, families: {}}, totals: {}, files: {}};
  const pub = path.join(rootDir, publicDir), dl = path.join(rootDir, downloadDir);
  await fs.mkdir(pub, {recursive: true}); await fs.mkdir(dl, {recursive: true});
  const bump = (facet, key) => { if (key == null || key === '') return; index.facets[facet][key] = (index.facets[facet][key] ?? 0) + 1; };
  for (const type of LEDGER_TYPES) {
    const dates = await listDates(rootDir, type); index.totals[type] = 0;
    await fs.mkdir(path.join(pub, type), {recursive: true});
    for (const date of dates) {
      const records = await readRecords(rootDir, type, {dates: [date]});
      index.totals[type] += records.length;
      index.byDate[date] ??= {}; index.byDate[date][type] = records.length;
      for (const r of records) { const b = r.body ?? {}; bump('codes', b.code); bump('groups', b.group ?? b.groupName); bump('factors', b.factorId); bump('classes', b.classLabel ?? b.class); for (const c of b.causes ?? []) bump('causes', typeof c === 'string' ? c : c.category); bump('modelVersions', b.modelVersion); bump('statuses', b.status); bump('families', b.family); }
      const text = JSON.stringify(records);
      await fs.writeFile(path.join(pub, type, date + '.json'), text);
      await fs.writeFile(path.join(dl, `${type}-${date}.csv`), recordsToCSV(records));
      index.files[`${type}/${date}.json`] = {records: records.length, sha256: sha(text)};
    }
  }
  index.dates = Object.keys(index.byDate).sort();
  await fs.writeFile(path.join(pub, 'index.json'), JSON.stringify(index));
  return index;
}

const csvCell = v => { if (v == null) return ''; const s = typeof v === 'object' ? JSON.stringify(v) : String(v); return /[",\r\n]/.test(s) ? '"' + s.replaceAll('"', '""') + '"' : s; };
/** 한 줄 = 기록 하나 · body 는 한 단계 펼침 · 안쪽 객체는 JSON 문자열 */
export function recordsToCSV(records) {
  const cols = ['id', 'type', 'dateKST', 'at', 'supersedes', 'correctionReason'], bodyKeys = [];
  for (const r of records) for (const k of Object.keys(r.body ?? {})) if (!bodyKeys.includes(k)) bodyKeys.push(k);
  const header = [...cols, 'links', ...bodyKeys];
  return '﻿' + header.join(',') + '\r\n' + records.map(r => [...cols.map(c => csvCell(r[c])), csvCell(r.links), ...bodyKeys.map(k => csvCell(r.body?.[k]))].join(',')).join('\r\n') + '\r\n';
}

/** 일일 보고서(여섯 문장 + 절) 저장: reports/atlas11/daily/<date>.json|.md + public/data/atlas11/daily */
export async function writeDailyReport(rootDir, report, {publicDir = 'public/data/atlas11/daily'} = {}) {
  if (!validDate(report.date) || !report.sentences || Object.keys(report.sentences).length !== 6) throw Error('DAILY_REPORT_CONTRACT');
  const dir = path.join(rootDir, 'reports/atlas11/daily'), pub = path.join(rootDir, publicDir);
  await fs.mkdir(dir, {recursive: true}); await fs.mkdir(pub, {recursive: true});
  const md = ['# ATLAS 11 일일 보고 · ' + report.date, '', ...Object.entries(report.sentences).map(([k, v], i) => `${i + 1}. **${SENTENCE_LABELS[k] ?? k}** — ${v}`), '', ...(report.sections ?? []).flatMap(s => ['## ' + s.title, ...(s.lines ?? []).map(l => '- ' + l), ''])].join('\n');
  const json = JSON.stringify(report);
  // 같은 날 다시 실행하면 새 버전 파일을 추가하고(v2, v3 …) 이전 것은 남긴다
  let version = 1; while (true) { try { await fs.writeFile(path.join(dir, `${report.date}${version > 1 ? '.v' + version : ''}.json`), json, {flag: 'wx'}); break; } catch (e) { if (e.code !== 'EEXIST') throw e; const old = await fs.readFile(path.join(dir, `${report.date}${version > 1 ? '.v' + version : ''}.json`), 'utf8'); if (old === json) break; version++; } }
  await fs.writeFile(path.join(dir, `${report.date}${version > 1 ? '.v' + version : ''}.md`), md);
  await fs.writeFile(path.join(pub, report.date + '.json'), JSON.stringify({...report, version}));
  const dates = (await fs.readdir(pub)).filter(f => /^\d{4}-\d{2}-\d{2}\.json$/.test(f)).map(f => f.slice(0, 10)).sort();
  await fs.writeFile(path.join(pub, 'index.json'), JSON.stringify({schema: 'atlas11-daily-index-1', dates, latest: dates.at(-1) ?? null}));
  return {date: report.date, version, md: path.relative(rootDir, path.join(dir, report.date + '.md'))};
}
export const SENTENCE_LABELS = Object.freeze({marketChange: '그날 시장에서 확인된 변화', didWell: '우리가 잘한 판단', didWrong: '우리가 잘못한 판단', unexplained: '아직 설명하지 못한 부분', experiments: '그날 시험하거나 채택·기각한 변경', nextCheck: '확인할 사항'});
