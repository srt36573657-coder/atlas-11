/**
 * 고리 시험용 가짜 저장소 — 값은 모두 [예시](씨앗 고정 난수로 만든 값 · 실제 시장 값 아님)
 *   makeRepo()  임시 폴더에 public/data/input.json(종목 셋) · public/data/atlas11/forecast.json(선택)을 만든다
 *   snapshot()  atlas4h/ledger/inputs/<한국 시각>.json (atlas4h-inputs-1 꼴 · 수집기와 같은 칸)
 */
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

export const CODES = ['000001', '000002', '000003'];
export const HOLIDAYS = new Set(['2026-10-05', '2026-10-09']);

export function sessionsBetween(from, to) {
  const out = [];
  for (let t = Date.parse(`${from}T00:00:00Z`); t <= Date.parse(`${to}T00:00:00Z`); t += 864e5) {
    const d = new Date(t);
    const day = d.toISOString().slice(0, 10);
    if (d.getUTCDay() === 0 || d.getUTCDay() === 6 || HOLIDAYS.has(day)) continue;
    out.push(day);
  }
  return out;
}

function rng(seed) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 2 ** 32;
  };
}

/** 종가 줄 — lastDate 까지 · 관측(받은) 시각 = 그날 15:40 KST */
export function pricesFor(code, sessions, lastDate) {
  const r = rng(Number(code) * 7919 + 17);
  let p = 10000 * Number(code);
  const rows = [];
  for (const d of sessions) {
    if (d > lastDate) break;
    const z = (r() + r() + r() - 1.5) * 0.02;
    p = Math.max(100, Math.round(p * (1 + z)));
    rows.push({date: d, close: p, observedAt: `${d}T06:40:00Z`, sourceUrl: `https://example.invalid/${code}/${d}`});
  }
  return rows;
}

export function makeInput(lastDate) {
  const sessions = sessionsBetween('2024-01-02', '2026-10-30');
  return {
    calendar: {sessions},
    assets: CODES.map(code => ({code, name: `[예시] 종목 ${code}`, prices: pricesFor(code, sessions, lastDate),
      priceSource: {provider: '[예시] 가짜 출처', url: 'https://example.invalid/prices', retrievedAt: '2026-09-01T00:00:00Z'}})),
  };
}

export function makeRepo({lastDate = '2026-10-01', forecast = null} = {}) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'atlas4h-loop-test-'));
  fs.mkdirSync(path.join(root, 'public/data/atlas11'), {recursive: true});
  const input = makeInput(lastDate);
  fs.writeFileSync(path.join(root, 'public/data/input.json'), JSON.stringify(input));
  if (forecast) fs.writeFileSync(path.join(root, 'public/data/atlas11/forecast.json'), JSON.stringify(forecast));
  return {root, input};
}

const stamp = iso => {
  const k = new Date(Date.parse(iso) + 9 * 3600e3).toISOString();
  return `${k.slice(0, 10)}T${k.slice(11, 13)}-${k.slice(14, 16)}`;
};

/**
 * 지금 값 한 장 — closes: {code: {date, value, status?}} (status 기본 「한 출처」 · 15:30 종가 단일가 봉)
 * 4시간 넘은 값은 수집기처럼 「옛값」 + 「장 닫힘」을 붙인다.
 */
export function snapshot(root, atIso, closes = {}) {
  const atMs = Date.parse(atIso);
  const variables = [
    {id: 'kospi', value: null, observedAt: null, fetchedAt: null, status: '없음', marks: ['없음'], reason: '[예시] 시험 장', sources: []},
    {id: 'sox', value: null, observedAt: null, fetchedAt: null, status: '없음', marks: ['없음'], reason: '[예시] 시험 장', sources: []},
  ];
  for (const code of CODES) {
    const c = closes[code];
    const v = {variableId: 'stock-price', code, id: `stock-price:${code}`, value: null, observedAt: null, fetchedAt: new Date(atMs).toISOString(), status: '없음', marks: ['없음'], reason: '[예시] 없음', sources: []};
    if (c) {
      const obs = new Date(Date.parse(`${c.date}T15:30:00+09:00`)).toISOString();
      const status = c.status ?? '한 출처';
      v.sources = [{name: 'naver-minute', url: `https://example.invalid/minute/${code}/${c.date}`, value: c.value, observedAt: obs, fetchedAt: new Date(atMs).toISOString(), rawSha256: 'a'.repeat(64)}];
      if (status === '확인 중') Object.assign(v, {status, marks: ['확인 중'], value: null});
      else Object.assign(v, {status, value: c.value, observedAt: obs, marks: [status]});
      if (v.value !== null && atMs - Date.parse(obs) > 4 * 3600e3) Object.assign(v, {status: '옛값', marks: ['옛값', ...v.marks, '장 닫힘']});
    }
    variables.push(v);
  }
  const doc = {schema: 'atlas4h-inputs-1', at: new Date(atMs).toISOString(), atKST: '', staleAfterHours: 4, minuteWindow: null, previous: null, variables};
  const dir = path.join(root, 'atlas4h/ledger/inputs');
  fs.mkdirSync(dir, {recursive: true});
  const file = path.join(dir, `${stamp(atIso)}.json`);
  fs.writeFileSync(file, JSON.stringify(doc));
  return file;
}

export const lastClose = (input, code, date) => input.assets.find(a => a.code === code).prices.find(p => p.date === date)?.close ?? null;

export function readLines(root, kind) {
  const dir = path.join(root, 'atlas4h/ledger', kind);
  let names = [];
  try {
    names = fs.readdirSync(dir).filter(n => n.endsWith('.jsonl')).sort();
  } catch {
    return [];
  }
  return names.flatMap(n => fs.readFileSync(path.join(dir, n), 'utf8').split('\n').filter(Boolean).map(l => JSON.parse(l)));
}

export const GIT = {commit: 'abcdef1234567', dirty: false};
