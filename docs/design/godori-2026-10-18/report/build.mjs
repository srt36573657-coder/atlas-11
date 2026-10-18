#!/usr/bin/env node
// R1 보고 자료 만들기 — 고도리 「72개와 카톡 두 번 가입」 명령문 줄마다 확인표.
//   node docs/design/godori-2026-10-18/report/build.mjs            → items.json + items.md 다시 씀(읽기만 함 · 사이트 파일 안 건드림)
//   node docs/design/godori-2026-10-18/report/build.mjs --probe    → 가벼운 시험(kakao · invite · letter · kakao-store · words · next-modules)을 먼저 돌려 probe.json 에 적고 만듦(약 3~4분)
//   --quiet  → 요약 한 줄만 찍음
// 읽는 것: order-0015.txt · accept/*.md · review/*.md · speed/*.md · reports/atlas11/measure/* · kakao-signup.md · gdr-v2.md 와 몇 개의 자료 파일(읽기만).
// 쓰는 것: 이 폴더의 items.json · items.md (· --probe 일 때 probe.json). 이 밖에는 아무 파일도 쓰지 않는다.
// 손으로 쓴 판단은 map.mjs. 늦게 오는 결과(accept 줄 · 검토 글 · 뒤 재기 표 · 시연 영상)는 build 를 다시 돌리면 자동으로 올라간다.
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync, spawnSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '../../../..');
const JOB = path.join(ROOT, 'docs/design/godori-2026-10-18');
const JOBREL = 'docs/design/godori-2026-10-18';
const OUT_JSON = path.join(HERE, 'items.json');
const OUT_MD = path.join(HERE, 'items.md');
const PROBE = path.join(HERE, 'probe.json');
const argv = new Set(process.argv.slice(2));
const MAP = await import(pathToFileURL(path.join(HERE, 'map.mjs')).href);
const { EXPECT, REVIEWS, BLOCK_SEV, ITEMS, CONFLICTS, SPEED } = MAP;

const rd = (p) => { try { return fs.readFileSync(p, 'utf8'); } catch { return null; } };
const stt = (p) => { try { return fs.statSync(p); } catch { return null; } };
const sh = (cmd, a) => { try { return execFileSync(cmd, a, { cwd: ROOT, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'], timeout: 30000 }); } catch { return null; } };
const cut = (s, n) => { const a = Array.from(String(s ?? '')); return a.length > n ? a.slice(0, n).join('') + '…' : String(s ?? ''); };
const esc = (s) => String(s ?? '').replace(/\|/g, '\\|').replace(/\r?\n/g, '<br>');
const norm = (s) => String(s ?? '').replace(/\s+/g, ' ').trim();
const sgt = (d) => new Date(d.getTime() + 8 * 3600e3).toISOString().replace('T', ' ').slice(0, 19) + ' SGT';
const rel = (p) => path.relative(ROOT, p);

// ───────────── 시험 먼저 돌리기(--probe) ─────────────
//   --probe     = 가벼운 시험 여섯 + 따로 본 사람(VK)의 자기 시험
//   --probe-vk  = VK 자기 시험만(약 10초 · 앞의 probe.json 에 이어 적음)
if (argv.has('--probe') || argv.has('--probe-vk')) {
  const names = ['kakao', 'invite', 'letter', 'kakao-store', 'words', 'next-modules'];
  const out = (() => { try { return JSON.parse(rd(PROBE) ?? 'null') ?? {}; } catch { return {}; } })();
  if (argv.has('--probe')) for (const n of names) {
    const f = `tests/atlas11/${n}.test.mjs`;
    if (!stt(path.join(ROOT, f))) { out[n] = { tests: 0, pass: 0, fail: 0, note: '시험 파일 없음' }; continue; }
    const t0 = Date.now();
    const r = spawnSync('nice', ['-n', '10', 'node', '--test', f], { cwd: ROOT, encoding: 'utf8', timeout: 300000 });
    const txt = (r.stdout || '') + (r.stderr || '');
    const g = (k) => +(txt.match(new RegExp('^# ' + k + ' (\\d+)', 'm'))?.[1] ?? NaN);
    out[n] = { tests: g('tests'), pass: g('pass'), fail: g('fail'), secs: Math.round((Date.now() - t0) / 1000), at: new Date().toISOString(), file: f };
  }
  { // 따로 본 사람(VK)이 쓴 시험을 그대로 돌림(읽기만 · 메모리 저장소 · 가짜 카카오) — 시험마다 ok / not ok. 「# TODO」 표시가 붙은 것은 본 사람이 찾은 것으로 표시해 둔 시험
    const f = 'tests/atlas11/verify-kakao/vk.test.mjs';
    if (stt(path.join(ROOT, f))) {
      const t0 = Date.now();
      const r = spawnSync('nice', ['-n', '10', 'node', '--test', '--test-reporter=tap', f], { cwd: ROOT, encoding: 'utf8', timeout: 300000 });
      const txt = (r.stdout || '') + (r.stderr || '');
      const g = (k) => +(txt.match(new RegExp('^# ' + k + ' (\\d+)', 'm'))?.[1] ?? NaN);
      const byTest = {}; const todoMarked = [];
      for (const m of txt.matchAll(/^(not )?ok \d+ - (VK\d+)\b([^\n]*)/gm)) { byTest[m[2]] = m[1] ? 'not ok' : 'ok'; if (/# TODO/.test(m[3])) todoMarked.push(m[2]); }
      out.vkown = { tests: g('tests'), pass: g('pass'), fail: g('fail'), todo: g('todo'), byTest, todoMarked, red: Object.keys(byTest).filter((k) => byTest[k] === 'not ok'), secs: Math.round((Date.now() - t0) / 1000), at: new Date().toISOString(), file: f, fileMtime: stt(path.join(ROOT, f)).mtime.toISOString() };
    }
  }
  fs.writeFileSync(PROBE, JSON.stringify(out, null, 2) + '\n');
}
const PROBE_DATA = (() => { try { return JSON.parse(rd(PROBE) ?? 'null') ?? {}; } catch { return {}; } })();

// ───────────── 명령문 읽기 ─────────────
function parseOrder() {
  const txt = rd(path.join(JOB, 'order-0015.txt')) ?? '';
  const secs = {}; const report = []; let cur = null; let item = null;
  for (const line of txt.split(/\r?\n/)) {
    let m;
    if ((m = line.match(/^\[(\d+) · (.+)\]\s*$/)) || (m = line.match(/^\[(보고) · (.+)\]\s*$/))) {
      cur = m[1]; item = null; if (cur !== '보고') secs[cur] = { title: m[2], items: [] }; continue;
    }
    if ((m = line.match(/^(\d+)\.\s+(.*)$/)) && cur) {
      item = { n: +m[1], text: m[2] };
      if (cur === '보고') report.push(item); else secs[cur].items.push(item);
      continue;
    }
    if (item && /^\s+\S/.test(line)) { item.text += ' ' + line.trim(); continue; }
    if (!line.trim()) item = null;
  }
  return { secs, report };
}
const ORDER = parseOrder();

// ───────────── accept 읽기 ─────────────
function refsOf(s) {
  const out = new Set();
  const re = /\[(\d{1,2})\]\s*(\d{1,2})(?:-[a-z])?((?:\s*[·,~]\s*\d{1,2}(?:-[a-z])?)*)/g;
  let m;
  while ((m = re.exec(s))) {
    const sec = +m[1]; const nums = [+m[2]]; let prev = +m[2];
    for (const p of (m[3] || '').matchAll(/([·,~])\s*(\d{1,2})/g)) {
      const v = +p[2];
      if (p[1] === '~') { for (let k = prev + 1; k <= v; k++) nums.push(k); } else nums.push(v);
      prev = v;
    }
    for (const k of nums) if (EXPECT[sec] && k >= 1 && k <= EXPECT[sec]) out.add(`${sec}.${k}`);
  }
  return [...out];
}
function classify(res) {
  const t = norm(String(res ?? '').replace(/[*`_]/g, ''));
  if (!t) return 'blank';
  if (/^(반쯤|일부|부분)/.test(t)) return 'partial';
  if (/^(실패|못 함|안 됨|틀림)/.test(t)) return 'fail';
  if (/^(「\?」|\?)/.test(t)) return 'unknown';
  if (/^(셈만|모형)/.test(t)) return 'partial';
  if (/^(통과|됨|됐|확인|OK)/.test(t)) {
    if (/^.{0,40}(내 몫은 됨|남의 몫|아직 안 함|일부)/.test(t)) return 'partial';
    return 'pass';
  }
  return 'info';
}
function splitCells(line) { return line.replace(/^\s*\|/, '').replace(/\|\s*$/, '').split(/(?<!\\)\|/).map((s) => s.trim()); }
function parseAccept(file) {
  const txt = rd(file) ?? '';
  const name = path.basename(file, '.md');
  const rows = []; let hdr = null; let prev = null; let prevIdx = -1;
  const lines = txt.split(/\r?\n/);
  const push = (ln, cells, resIdx) => {
    const label = cells[0] ?? '';
    rows.push({ file: name, ln, label: cut(norm(label), 90), refs: refsOf(label), res: cut(norm(cells[resIdx] ?? ''), 600), cls: classify(cells[resIdx] ?? ''), hdr: false });
  };
  for (let i = 0; i < lines.length; i++) {
    const L = lines[i];
    if (/^\s*\|/.test(L)) {
      const cells = splitCells(L);
      if (cells.length && cells.every((c) => /^:?-{2,}:?$/.test(c))) { // 구분선: 앞 줄이 머리
        hdr = prev; if (prevIdx >= 0 && rows[prevIdx] && rows[prevIdx].ln === prevIdx + 1) rows.pop();
        continue;
      }
      let resIdx = cells.length - 1;
      if (hdr) {
        const j = hdr.findIndex((h) => /^결과/.test(h));
        if (j >= 0) resIdx = j; else { const k = hdr.findIndex((h) => h === '뒤'); if (k >= 0) resIdx = k; }
      }
      prev = cells;
      push(i + 1, cells, resIdx); prevIdx = rows.length - 1; rows[prevIdx].ln = i + 1;
      continue;
    }
    if ((/^- \[/.test(L) || /^\[[^\]]+\]/.test(L)) && L.includes(' | ')) {
      const parts = L.replace(/^- /, '').split(' | ');
      if (parts[0] === '[항목]') continue;
      const cells = parts.length > 4 ? [parts[0], parts[1], parts[2], parts.slice(3).join(' | ')] : parts;
      push(i + 1, cells, cells.length - 1);
      hdr = null; prev = null; prevIdx = -1;
      continue;
    }
    if (!/^\s*$/.test(L)) { hdr = null; prev = null; prevIdx = -1; }
  }
  // 머리 줄이 rows 에 섞였으면(예: 구분선 앞 줄) 걸러냄: 구분선 처리에서 pop 했음
  return rows;
}

const ACCEPT_DIR = path.join(JOB, 'accept');
const ACCEPT_FILES = fs.existsSync(ACCEPT_DIR) ? fs.readdirSync(ACCEPT_DIR).filter((f) => f.endsWith('.md')).sort() : [];
const ACCEPT_ROWS = ACCEPT_FILES.flatMap((f) => parseAccept(path.join(ACCEPT_DIR, f)));
const rowsFor = (prefix, key) => ACCEPT_ROWS.filter((r) => r.file.startsWith(prefix) && (key.startsWith('label:') ? r.label.startsWith(key.slice(6)) : r.refs.includes(key)));

// ───────────── 사실(live) 읽기 — 읽기만 ─────────────
const J = (p) => { try { return JSON.parse(rd(path.join(ROOT, p)) ?? 'null'); } catch { return null; } };
function walk(dir, depth, fn) {
  let ents = []; try { ents = fs.readdirSync(dir, { withFileTypes: true }); } catch { return; }
  for (const e of ents) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) { if (depth > 0 && e.name !== 'node_modules' && e.name !== '.git') walk(p, depth - 1, fn); } else fn(p);
  }
}
const live = {};
{
  const mt = (p) => stt(path.join(ROOT, p))?.mtimeMs ?? null;
  live.claudeBytes = stt(path.join(ROOT, 'CLAUDE.md'))?.size ?? '?';
  live.ruleRawBytes = stt(path.join(ROOT, 'docs/고도리_규칙원문.md'))?.size ?? '?';
  live.mapBytes = stt(path.join(ROOT, 'docs/고도리_지도.md'))?.size ?? '?';
  live.summaryBytes = stt(path.join(ROOT, 'site/next/data/home-summary.json'))?.size ?? '?';
  const ks = rd(path.join(JOB, 'kakao-signup.md')) ?? '';
  live.kakaoLines = ks.split(/\r?\n/).filter((l) => /^\d+\.\s/.test(l)).length;
  live.kakaoHeads = ks.split(/\r?\n/).filter((l) => /^## /.test(l)).length;
  { let curH = null; const secs = {};
    for (const l of ks.split(/\r?\n/)) { const h = l.match(/^## (\S)\./); if (h) { curH = h[1]; secs[curH] = []; continue; } const n = l.match(/^(\d+)\.\s/); if (n && curH) secs[curH].push(+n[1]); }
    for (const [h, arr] of Object.entries(secs)) live['ks_' + h] = arr.length ? `${Math.min(...arr)}~${Math.max(...arr)}번 줄` : '(줄 없음)'; }
  const foot = ks.match(/사장님 몫 (\d+)줄.*?실제 휴대폰으로 셀 것 (\d+)가지[^\d]*(\d+)번 줄/);
  live.kakaoFoot = foot ? `${foot[1]}줄 · 실제 폰 ${foot[2]}가지 · ${foot[3]}번 줄` : '?';
  const g = J('site/next/data/gdr.json') ?? {};
  live.gdrAsOf = g.asOf ?? '?'; live.siteDate = g.dates?.site ?? '?';
  live.listsStatus = g.status?.lists ?? '?';
  live.outThin = g.counts?.outThin ?? '?'; live.outHalt = g.counts?.outHalt ?? '?';
  const back = J('site/next/data/gdr-back.json') ?? {};
  live.backLine = back.line?.ko ?? '?(gdr-back.json 에 line.ko 없음)';
  const v2 = J('reports/atlas11/godori/verify2-latest.json') ?? {};
  live.v2 = v2;
  live.v2_compared = v2.compared ?? '?'; live.v2_diffs = v2.diffN ?? '?';
  live.v2_stress = v2.stress?.cases?.length ?? '?'; live.v2_unit = v2.stress?.unit ? `${v2.stress.unit.n}개 중 틀림 ${(v2.stress.unit.bad ?? []).length}` : '?';
  live.v2_secs = v2.secs?.total ?? '?';
  const spd = (rd(path.join(ROOT, 'reports/atlas11/speed/2026-10-18.jsonl')) ?? '').split(/\r?\n/).filter(Boolean).map((l) => { try { return JSON.parse(l); } catch { return null; } }).filter(Boolean);
  live.speedLines = spd.length;
  live.speedWorkerLines = spd.filter((r) => r.worker || r.secs || r.seconds).length;
  const start = spd.find((r) => r.start)?.start ?? '2026-10-17T16:15:00.000Z';
  let stopSec = 0;
  for (const r of spd) { const m = String(r.note ?? '').match(/멈춘 시간 (\d+)시간\s*(\d+)분/); if (m) stopSec = (+m[1]) * 3600 + (+m[2]) * 60; }
  live.stopSec = stopSec;
  live.elapsedSec = Math.max(0, Math.round((Date.now() - Date.parse(start)) / 1000 - stopSec));
  live.elapsedRatio = (live.elapsedSec / 9206).toFixed(2);
  live.startAt = start;
  live.enSrcTime = mt('scripts/atlas11/next/i18n/en-src.json') ? sgt(new Date(mt('scripts/atlas11/next/i18n/en-src.json'))) : '?';
  live.enTime = mt('site/next/i18n/en.json') ? sgt(new Date(mt('site/next/i18n/en.json'))) : '?';
  live.enStale = (mt('scripts/atlas11/next/i18n/en-src.json') ?? 0) > (mt('site/next/i18n/en.json') ?? 0) + 1000;
  const oldC = sh('git', ['status', '--porcelain', '--', 'site/atlas', 'site/app', 'site/us', 'site/new', 'site/index.html', 'scripts/atlas11/t365']);
  live.oldChanges = oldC === null ? '?(git 못 씀)' : `${oldC.split('\n').filter(Boolean).length}줄`;
  live.oldChangesN = oldC === null ? null : oldC.split('\n').filter(Boolean).length;
  const resC = sh('git', ['status', '--porcelain', '--', '.github/workflows/atlas11-daily.yml', '.github/workflows/atlas11-evening.yml']);
  live.reservedChanges = resC === null ? '?(git 못 씀)' : `${resC.split('\n').filter(Boolean).length}줄`;
  live.reservedChangesN = resC === null ? null : resC.split('\n').filter(Boolean).length;
  let hits = 0; for (const d of ['site/next', 'lib/atlas11']) walk(path.join(ROOT, d), 3, (p) => { if (/[\\/]i18n[\\/]/.test(p) || !/\.(js|mjs|css|html)$/.test(p)) return; if (/confetti|폭죽/i.test(rd(p) ?? '')) hits++; });
  live.confettiHits = hits;
  const rule = (rd(path.join(ROOT, 'docs/ATLAS_원칙.md')) ?? '').split(/\r?\n/);
  const li = rule.findIndex((l) => /^79\.\s/.test(l)); live.rule79Line = li >= 0 ? li + 1 : '?';
  let sendCalls = 0; for (const f of ['lib/atlas11/kakao.mjs', 'lib/atlas11/kakao-store.mjs', 'functions/atlas11/kakao.mjs']) sendCalls += ((rd(path.join(ROOT, f)) ?? '').match(/talk\/(friends|memo)|memo\/send|message\/send|sendDefault|sendScrap/g) ?? []).length;
  live.kakaoSendCalls = sendCalls;
  const afterMd = path.join(ROOT, 'reports/atlas11/measure/after-2026-10-18.md');
  live.afterExists = fs.existsSync(afterMd);
  live.afterMeasureText = live.afterExists ? '있음(reports/atlas11/measure/after-2026-10-18.md)' : '아직 없음 ?';
  const vids = []; for (const d of ['reports/atlas11', 'docs/design/godori-2026-10-18', 'scripts/atlas11/next/demo', 'site/media']) walk(path.join(ROOT, d), 4, (p) => { if (/\.(mp4|webm|mov)$/i.test(p) && /(demo|시연|60)/i.test(path.basename(p)) && (stt(p)?.mtimeMs ?? 0) > Date.parse('2026-10-17T15:00:00Z')) vids.push(rel(p)); });
  live.demoVideos = vids;
  for (const [k, v] of Object.entries(PROBE_DATA)) live['probe_' + k] = v.tests ? `${v.pass}/${v.tests} 통과${v.fail ? ' · 실패 ' + v.fail : ''}(${(v.at ? sgt(new Date(v.at)).slice(11, 16) : '?')})` : '?(안 돌림)';
  for (const n of ['kakao', 'invite', 'letter', 'kakao-store', 'words', 'next-modules']) if (!live['probe_' + n]) live['probe_' + n] = '?(--probe 안 돌림)';
}

const CHK = {
  afterMeasure: () => ({ ok: live.afterExists, text: live.afterExists ? 'after-2026-10-18.md 있음' : 'reports/atlas11/measure/after-2026-10-18.md 아직 없음(main 의 뒤 재기가 만듦)' }),
  claudeSmall: () => ({ ok: typeof live.claudeBytes === 'number' && live.claudeBytes < 8192, text: `CLAUDE.md ${live.claudeBytes}B` }),
  summaryBytes: () => ({ ok: typeof live.summaryBytes === 'number' && live.summaryBytes > 0 && live.summaryBytes <= 8192, text: `home-summary.json ${live.summaryBytes}B` }),
  verify2: () => ({ ok: live.v2.ok === true && live.v2.diffN === 0 && (live.v2.compared ?? 0) > 0, text: `verify2-latest.json ok=${live.v2.ok} 맞댄 ${live.v2.compared} 틀림 ${live.v2.diffN}` }),
  oldUntouched: () => ({ ok: live.oldChangesN === 0, text: `옛 화면 바뀐 줄 ${live.oldChanges}` }),
  reservedUntouched: () => ({ ok: live.reservedChangesN === 0, text: `예약 작업 파일 바뀐 줄 ${live.reservedChanges}` }),
  noConfetti: () => ({ ok: live.confettiHits === 0, text: `폭죽 낱말 ${live.confettiHits}곳` }),
  enFresh: () => ({ ok: !live.enStale, text: `en.json ${live.enTime} · en-src.json ${live.enSrcTime}` }),
  rule79: () => ({ ok: live.rule79Line !== '?', text: `규칙 79 ${live.rule79Line}줄` }),
  demoVideo: () => ({ ok: live.demoVideos.length > 0, text: live.demoVideos.length ? live.demoVideos.join(', ') : '시연 영상 파일 아직 없음' }),
};
for (const n of ['kakao', 'invite', 'letter', 'kakao-store', 'words', 'next-modules']) {
  CHK['probe:' + n] = () => { const p = PROBE_DATA[n]; return { ok: !!p && p.tests > 0 && p.fail === 0, text: p ? `${n} ${p.pass}/${p.tests} 통과 실패 ${p.fail}` : `${n} 시험을 R1 이 안 돌림(--probe)` }; };
}

// ───────────── 검토(review) 상태 풀기 ─────────────
const hhmm = (iso) => (iso ? sgt(new Date(iso)).slice(11, 16) : '?');
const REV = {};
for (const [id, r] of Object.entries(REVIEWS)) {
  let state = r.state; let fix = r.fix ?? ''; let r1 = '';
  if (state === 'live:enStale') state = live.enStale ? 'open' : 'closed';
  const V = PROBE_DATA.vkown;
  if (state === 'fixed-claimed' && r.vkTests?.length && V?.byTest) {
    // 본 사람(VK)이 쓴 시험을 R1 이 그대로 다시 돌린 결과: 모두 초록이면 R1 확인 · 하나라도 빨강이면 고침 주장 그대로(본 사람이 다시 봐야 닫힘)
    const vkS = r.vkTests.map((t) => V.byTest[t] ?? null);
    if (vkS.every((s) => s === 'ok')) state = 'confirmed-r1';
    r1 = `R1 ${hhmm(V.at)} 싱가포르에 VK 자체 시험을 다시 돌림: ` + r.vkTests.map((t, i) => `${t} ${vkS[i] === 'ok' ? '초록' : vkS[i] === 'not ok' ? '빨강' : '?'}`).join(' · ');
    fix = [fix, `R1 ${hhmm(V.at)} 싱가포르에 VK 자체 시험을 다시 돌림(시험 파일은 ${hhmm(V.fileMtime)} 에 쓴 것): ` + r.vkTests.map((t, i) => `${t} ${vkS[i] === 'ok' ? '초록' : vkS[i] === 'not ok' ? '빨강' : '?'}`).join(' · ') + r.vkTests.filter((t, i) => vkS[i] === 'not ok').map((t) => (r.redWhy?.[t] ? ` — ${t} 빨강 까닭(R1 읽기): ${r.redWhy[t]}` : '')).join('')].filter(Boolean).join(' · ');
  } else if (state === 'fixed-claimed' && r.probe) { const p = PROBE_DATA[r.probe]; if (p && p.tests > 0 && p.fail === 0) state = 'confirmed-r1'; else if (p && p.fail > 0) state = 'open'; }
  REV[id] = { id, ...r, fix, r1, state, blocks: BLOCK_SEV.has(r.sev) && (state === 'open' || state === 'fixed-claimed') };
}

// ───────────── 줄마다 상태 ─────────────
const STATUS_ORDER = ['done', 'partial', 'not done', 'unknown', 'owner-action', 'not applicable'];
const fill = (s, extra = {}) => String(s ?? '').replace(/\{\{([\w:가-힣-]+)\}\}/g, (_, k) => { const v = extra[k] ?? live[k]; return v === undefined || v === null ? '?' : String(v); });
const expandEv = (s) => String(s ?? '').split(/\s+/).filter(Boolean).map((t) => t.startsWith('A:') ? `${JOBREL}/accept/${t.slice(2)}.md` : t.startsWith('R:') ? `${JOBREL}/review/${t.slice(2)}.md` : t.startsWith('S:') ? `${JOBREL}/speed/${t.slice(2)}` : t.startsWith('D:') ? `${JOBREL}/${t.slice(2)}` : t.startsWith('M:') ? `reports/atlas11/measure/${t.slice(2)}` : t);

const items = [];
const missingMap = [];
for (const sec of Object.keys(EXPECT).map(Number)) {
  const S = ORDER.secs[sec]; const list = S?.items ?? [];
  for (let n = 1; n <= EXPECT[sec]; n++) {
    const key = `${sec}.${n}`; const o = list.find((x) => x.n === n);
    const it = ITEMS[key];
    const base = { id: `[${sec}] ${n}`, key, sec, n, words: o ? cut(norm(o.text), 90) : '(명령문에서 못 찾음)' };
    if (!it) { missingMap.push(key); items.push({ ...base, status: 'unknown', proof: 'R1 지도(map.mjs)에 이 줄이 없음', evidence: [], worker: '?', open: '', reviews: [], flags: ['no-map'], conds: [], accept: [] }); continue; }
    const conds = [];
    for (const [pref, k] of it.pend ?? []) {
      const rs = rowsFor(pref, k); const pass = rs.some((r) => r.cls === 'pass') && !rs.some((r) => r.cls === 'fail');
      conds.push({ kind: 'accept', file: pref + '*', key: k, ok: pass, text: rs.length ? rs.map((r) => `${r.file}:${r.cls}`).join(' ') : '그 줄 없음' });
    }
    for (const name of it.chk ?? []) { const r = CHK[name]?.() ?? { ok: false, text: `검사 ${name} 없음` }; conds.push({ kind: 'chk', file: name, ok: r.ok, text: r.text }); }
    let status = it.st; const target = it.st;
    if (conds.length) { const sat = conds.filter((c) => c.ok).length; status = sat === conds.length ? target : sat > 0 ? 'partial' : (it.none ?? 'partial'); }
    const flags = []; const revs = (it.rv ?? []).map((id) => REV[id]).filter(Boolean);
    if (revs.some((r) => r.blocks)) { if (status === 'done') status = 'partial'; flags.push(revs.some((r) => r.blocks && r.state === 'open') ? 'verifier-open' : 'recheck-pending'); }
    if (revs.some((r) => r.state === 'confirmed-r1')) flags.push('confirmed-by-R1-rerun');
    if (it.cap === 'partial' && status === 'done') status = 'partial';
    if (it.note) flags.push(it.note);
    const acc = ACCEPT_ROWS.filter((r) => r.refs.includes(key)).map((r) => ({ file: `accept/${r.file}.md`, line: r.ln, class: r.cls, text: cut(r.res, 160) }));
    items.push({
      ...base, status, proof: norm(fill(it.pr)), evidence: expandEv(it.ev), worker: it.w, open: norm(fill(it.op)),
      reviews: revs.map((r) => ({ id: r.id, file: `review/${r.file}.md`, severity: r.sev, state: r.state, blocks: r.blocks, finding: r.txt, fix: r.fix, r1: r.r1 || undefined })),
      flags, conds, accept: acc,
    });
  }
}

// ───────────── 세기 ─────────────
const tally = (arr) => { const c = Object.fromEntries(STATUS_ORDER.map((s) => [s, 0])); for (const i of arr) c[i.status] = (c[i.status] ?? 0) + 1; return c; };
const counts = tally(items);
const subset72 = items.filter((i) => [1, 5, 6, 7, 8, 9, 10, 11].includes(i.sec));
const counts72 = tally(subset72);
const bySec = {}; for (const s of Object.keys(EXPECT)) bySec[s] = tally(items.filter((i) => i.sec === +s));
const pending = items.filter((i) => i.status !== 'done' && i.status !== 'not applicable');
live.conflictCount = CONFLICTS.length;
live.notDoneList = items.filter((i) => i.status === 'not done' || i.status === 'unknown').map((i) => i.id).join(' · ') || '(없음)';

// ───────────── 경고 · 근거 파일 ─────────────
const warnings = [];
const orderCount = Object.keys(EXPECT).reduce((a, s) => a + (ORDER.secs[s]?.items.length ?? 0), 0);
const expectCount = Object.values(EXPECT).reduce((a, b) => a + b, 0);
if (orderCount !== expectCount) warnings.push(`명령문에서 읽은 줄 ${orderCount} ≠ 기대 ${expectCount}`);
if (ORDER.report.length !== MAP.EXPECT_REPORT) warnings.push(`[보고] 줄 ${ORDER.report.length} ≠ 기대 ${MAP.EXPECT_REPORT}`);
for (const s of Object.keys(EXPECT)) if ((ORDER.secs[s]?.items.length ?? 0) !== EXPECT[s]) warnings.push(`[${s}] 줄 수 ${ORDER.secs[s]?.items.length ?? 0} ≠ ${EXPECT[s]}`);
if (missingMap.length) warnings.push(`지도에 없는 줄: ${missingMap.join(', ')}`);
warnings.push(`말씀 「72개」 ≠ 번호 줄 ${orderCount}개: 72 = [1]+[5]~[11] (${[1, 5, 6, 7, 8, 9, 10, 11].map((s) => EXPECT[s]).join('+')}) · 카톡 [2]~[4] = ${EXPECT[2] + EXPECT[3] + EXPECT[4]} · 늘 지킬 것 [12] = ${EXPECT[12]}`);

// 증거 경로가 실제로 있는지(없는 이름을 적지 않았는지)
const missingEv = new Set();
const evCheck = (e) => { if (!/[\/.]/.test(e)) return; if (!fs.existsSync(path.join(ROOT, e))) missingEv.add(e); };
for (const i of items) i.evidence.forEach(evCheck);
SPEED.forEach((r) => expandEv(r[4]).forEach(evCheck));
if (missingEv.size) warnings.push(`증거 경로가 없는 것 ${missingEv.size}개: ${[...missingEv].join(', ')}`);

const sources = [];
for (const f of ACCEPT_FILES) {
  const p = path.join(ACCEPT_DIR, f); const name = f.replace(/\.md$/, ''); const rows = ACCEPT_ROWS.filter((r) => r.file === name);
  const withRefs = rows.filter((r) => r.refs.length);
  sources.push({ file: `accept/${f}`, name, bytes: stt(p)?.size, mtime: sgt(stt(p).mtime), rows: rows.length, rowsWithItemRefs: withRefs.length, blankResultRows: rows.filter((r) => r.cls === 'blank').length, superseded: MAP.SUPERSEDED[name] ?? null, known: MAP.KNOWN_ACCEPT.includes(name) });
}
const REVIEW_DIR = path.join(JOB, 'review');
const REVIEW_FILES = fs.existsSync(REVIEW_DIR) ? fs.readdirSync(REVIEW_DIR).filter((f) => f.endsWith('.md')).sort() : [];
const newReviews = [];
for (const f of REVIEW_FILES) {
  const p = path.join(REVIEW_DIR, f); const name = f.replace(/\.md$/, ''); const known = MAP.KNOWN_REVIEW.includes(name);
  sources.push({ file: `review/${f}`, bytes: stt(p)?.size, mtime: sgt(stt(p).mtime), known });
  if (!known) {
    const txt = rd(p) ?? ''; const hits = txt.split(/\r?\n/).filter((l) => /(FAIL|실패|막음|BLOCK|막는|통과 못)/i.test(l)).slice(0, 6).map((l) => cut(norm(l), 200));
    newReviews.push({ file: `review/${f}`, firstLine: cut(norm(txt.split(/\r?\n/)[0] ?? ''), 160), heuristicHits: hits });
  }
}
if (newReviews.length) warnings.push(`R1 이 아직 지도에 못 옮긴 새 검토 글 ${newReviews.length}개: ${newReviews.map((n) => n.file).join(', ')} — 아래 「새 검토 글」 참고(상태에는 아직 반영 안 됨)`);
for (const s of sources) if (s.file.startsWith('accept/') && !s.known) warnings.push(`R1 이 읽지 못한 새 받아들임 글: ${s.file} (줄 ${s.rows}) — 번호가 맞으면 pend 로 걸린 줄은 자동 반영됨`);
const blankFiles = sources.filter((s) => s.file.startsWith('accept/') && s.blankResultRows > 0 && !s.superseded);
const blankOld = sources.filter((s) => s.file.startsWith('accept/') && s.blankResultRows > 0 && s.superseded);
for (const f of ['speed', 'measure']) { /* 목록만 */ }
const speedFiles = fs.existsSync(path.join(JOB, 'speed')) ? fs.readdirSync(path.join(JOB, 'speed')).map((f) => `speed/${f}`) : [];
const measureDir = path.join(ROOT, 'reports/atlas11/measure');
const measureFiles = fs.existsSync(measureDir) ? fs.readdirSync(measureDir).map((f) => `reports/atlas11/measure/${f}`) : [];

// ───────────── [보고] ─────────────
const reportRows = MAP.reportItems(live).map((r) => {
  const o = ORDER.report.find((x) => x.n === r.n);
  return { n: r.n, words: o ? cut(norm(o.text), 90) : '?', value: norm(fill(r.v)), toFill: r.fill, hasUnknown: /\?/.test(fill(r.v)) };
});

// ───────────── 써내기 ─────────────
const now = new Date();
const speedRows = SPEED.map((r) => ({ what: r[0], value: norm(fill(r[1])), worker: r[2], note: norm(fill(r[3])), evidence: expandEv(r[4]) }));
const json = {
  schema: 'godori-0015-report-items-1',
  builtAt: now.toISOString(), builtAtSGT: sgt(now), by: 'R1 (report data) — build.mjs',
  note: '읽기만 하고 만든 자료. 줄 뜻: 상태는 done / partial / not done / owner-action / not applicable / unknown. 검토자의 막는 찾은 것(열림 · 고침 주장만)이 있으면 done 을 partial 로 내림.',
  orderLineCount: orderCount, reportLineCount: ORDER.report.length,
  counts, counts72subset: counts72, countsBySection: bySec,
  idsByStatus: Object.fromEntries(STATUS_ORDER.map((s) => [s, items.filter((i) => i.status === s).map((i) => i.id)])),
  warnings,
  nextSteps: MAP.NEXT_STEPS.map(([who, keys, what]) => ({ who, items: keys.map((k) => ({ id: '[' + k.replace('.', '] '), status: items.find((i) => i.key === k)?.status })), what })),
  items, report: reportRows, conflicts: CONFLICTS.map((c) => ({ conflict: c[0], resolution: c[1] })), speed: speedRows,
  reviews: Object.values(REV).map((r) => ({ id: r.id, file: `review/${r.file}.md`, severity: r.sev, state: r.state, blocks: r.blocks, items: r.items, finding: r.txt, fix: r.fix })),
  newReviewFiles: newReviews,
  sources: { accept: sources.filter((s) => s.file.startsWith('accept/')), review: sources.filter((s) => s.file.startsWith('review/')), speed: speedFiles, measure: measureFiles },
  acceptFilesWithBlankResults: blankFiles.map((s) => ({ file: s.file, blankResultRows: s.blankResultRows, rows: s.rows })),
  oldBlankAcceptFilesSupersededByOthers: blankOld.map((s) => ({ file: s.file, blankResultRows: s.blankResultRows, supersededBy: s.superseded })),
  probe: PROBE_DATA, live: { ...live, v2: undefined, demoVideos: live.demoVideos },
};
fs.writeFileSync(OUT_JSON, JSON.stringify(json, null, 2) + '\n');

// ── md
const L = [];
const P = (s = '') => L.push(s);
P('# 고도리 「72개와 카톡 두 번 가입」 — 줄마다 확인표 (R1)');
P();
P(`만든 때 ${sgt(now)} · 만든 것 \`build.mjs\`(읽기만) · 손으로 쓴 판단 \`map.mjs\` · 다시 만들기 \`node ${JOBREL}/report/build.mjs\` (시험까지 다시: \`--probe\`)`);
P('경로 줄임: accept/ · review/ · speed/ 는 `docs/design/godori-2026-10-18/` 아래.');
P();
P('## 1. 한눈에');
P();
P(`- 명령문 번호 줄 **${orderCount}개**(기대 72가 아님): 72 = [1]+[5]~[11] (${[1, 5, 6, 7, 8, 9, 10, 11].map((s) => EXPECT[s]).join('+')}) · 카톡 [2]~[4] = ${EXPECT[2] + EXPECT[3] + EXPECT[4]} · 늘 지킬 것 [12] = ${EXPECT[12]} · [보고] ${ORDER.report.length}줄.`);
P('- 상태 말: done = 이 기계에서 잰 값이 있음 · partial = 일부만 잼 / 따로 본 사람이 막음 / 고침 주장만 있음 · not done = 증명하는 파일 없음 · unknown = 코드는 있는데 결과 기록 없음 · owner-action = 사장님이 할 일 · not applicable = 늘 지킬 규칙(잴 결과 없음).');
P();
P('| 상태 | 전체 110 | 72개 묶음 ([1]+[5]~[11]) | ' + Object.keys(EXPECT).map((s) => `[${s}]`).join(' | ') + ' |');
P('|---|---|---|' + Object.keys(EXPECT).map(() => '---').join('|') + '|');
for (const s of STATUS_ORDER) P(`| ${s} | ${counts[s]} | ${counts72[s]} | ` + Object.keys(EXPECT).map((k) => bySec[k][s] || 0).join(' | ') + ' |');
P(`| 합 | ${items.length} | ${subset72.length} | ` + Object.keys(EXPECT).map((k) => EXPECT[k]).join(' | ') + ' |');
P();
const recheck = items.filter((i) => i.flags.includes('recheck-pending')).length; const vopen = items.filter((i) => i.flags.includes('verifier-open')).length;
P(`- 따로 본 사람이 막아서 done 에서 partial 로 내려간 줄: 열려 있음 ${vopen} · 고침 주장만 있음(본 사람이 다시 안 봄) ${recheck}.`);
P(`- 결과 칸이 비어 있는 받아들임 글(지금 일하는 파일): ${blankFiles.length ? blankFiles.map((s) => `${s.name} ${s.blankResultRows}/${s.rows}줄`).join(' · ') : '없음'}`);
P(`- 멈춘 일꾼의 옛 빈 글(이어받은 일꾼 파일로 대체됨 · 상태에 안 씀): ${blankOld.length ? blankOld.map((s) => `${s.name}→${s.superseded}`).join(' · ') : '없음'}`);
P();
if (warnings.length) { P('**알아 둘 것**'); for (const w of warnings) P(`- ${esc(w)}`); P(); }

P('## 2. 아직 done 이 아닌 줄');
P();
P('| 번호 | 상태 | 말씀(짧게) | 까닭 · 남은 것 | 한 사람 |');
P('|---|---|---|---|---|');
for (const s of ['not done', 'unknown', 'partial', 'owner-action']) for (const i of items.filter((x) => x.status === s)) {
  const why = [i.open, ...i.reviews.filter((r) => r.blocks).map((r) => `${r.id} ${r.state === 'open' ? '열림' : '고침 주장'}: ${cut(r.finding, 110)}${r.r1 ? ' ← ' + r.r1 : ''}`), ...i.conds.filter((c) => !c.ok).map((c) => `기다림: ${c.file} ${cut(c.text, 80)}`)].filter(Boolean).join(' / ');
  P(`| ${i.id} | ${i.status}${i.flags.includes('recheck-pending') ? ' (재확인 대기)' : i.flags.includes('verifier-open') ? ' (검토자 열림)' : ''} | ${esc(cut(i.words, 50))} | ${esc(cut(why, 420))} | ${esc(i.worker)} |`);
}
P();

P('## 2b. 다음 단계마다 (R1 손글 · 상태는 items.json 이 따로 셈)');
P();
P('| 누가 · 언제 | 줄 | 지금 상태 | 무엇 |'); P('|---|---|---|---|');
for (const [who, keys, what] of MAP.NEXT_STEPS) P(`| ${esc(who)} | ${keys.map((k) => '[' + k.replace('.', '] ')).join(' · ')} | ${keys.map((k) => items.find((i) => i.key === k)?.status ?? '?').join(' / ')} | ${esc(what)} |`);
P();
P('## 3. 줄마다');
for (const sec of Object.keys(EXPECT)) {
  P();
  P(`### [${sec}] ${ORDER.secs[sec]?.title ?? ''}`);
  P();
  P('| 번호 | 말씀(짧게) | 상태 | 잰 것(전 → 뒤) | 증거 | 한 사람 | 남은 것 |');
  P('|---|---|---|---|---|---|---|');
  for (const i of items.filter((x) => x.sec === +sec)) {
    const ev = i.evidence.map((e) => e.replace(JOBREL + '/', '')).join('<br>');
    const rv = i.reviews.length ? '<br>검토: ' + i.reviews.map((r) => `${r.id}(${r.state})`).join(' ') : '';
    P(`| ${i.id} | ${esc(cut(i.words, 60))} | ${i.status}${i.flags.includes('confirmed-by-R1-rerun') ? ' *' : ''} | ${esc(i.proof)} | ${esc(ev)} | ${esc(i.worker)} | ${esc(i.open)}${rv} |`);
  }
}
P();
P('`*` = 따로 본 사람이 찾은 시험 빨강을 R1 이 같은 시험으로 다시 돌려 초록을 봄(본 사람의 닫음은 아님).');
P();

P('## 4. [보고] 15줄 — 지금 있는 숫자');
P();
P('| 번호 | 사장님 말씀(짧게) | 지금 있는 값 | 빈칸(?)을 채울 단계 |');
P('|---|---|---|---|');
for (const r of reportRows) P(`| ${r.n} | ${esc(cut(r.words, 50))} | ${esc(r.value)} | ${esc(r.toFill || '—')} |`);
P();

P('## 5. 부딪힌 곳 (보고 13)');
P();
P('| 부딪힌 말 | 어떻게 풀었나 |'); P('|---|---|');
for (const c of CONFLICTS) P(`| ${esc(c[0])} | ${esc(c[1])} |`);
P();

P('## 6. 따로 본 사람이 찾은 것');
P();
P('| 번호 | 파일 | 등급 | 상태 | 줄 | 찾은 것 | 고침 |');
P('|---|---|---|---|---|---|---|');
for (const r of Object.values(REV)) P(`| ${r.id} | review/${r.file}.md | ${r.sev} | ${r.state} | ${r.items.join(', ')} | ${esc(cut(r.txt, 220))} | ${esc(cut(r.fix, 160))} |`);
P();
if (newReviews.length) {
  P('**새 검토 글(R1 이 아직 지도에 못 옮김 — 어림으로만 훑음)**'); P();
  for (const n of newReviews) { P(`- ${n.file}: ${esc(n.firstLine)}`); for (const h of n.heuristicHits) P(`  - ${esc(h)}`); }
  P();
}

P('## 7. 빠르기 숫자');
P();
P('| 무엇 | 숫자 | 한 사람 | 메모 |'); P('|---|---|---|---|');
for (const r of speedRows) P(`| ${esc(r.what)} | ${esc(r.value)} | ${esc(r.worker)} | ${esc(r.note)} |`);
P();

P('## 8. 근거 파일');
P();
P('| 파일 | 크기 | 마지막 고침 | 줄 | 번호 붙은 줄 | 결과 칸 빈 줄 | 대체 |'); P('|---|---|---|---|---|---|---|');
for (const s of sources.filter((x) => x.file.startsWith('accept/'))) P(`| ${s.file} | ${s.bytes} | ${s.mtime} | ${s.rows} | ${s.rowsWithItemRefs} | ${s.blankResultRows} | ${s.superseded ?? ''} |`);
for (const s of sources.filter((x) => x.file.startsWith('review/'))) P(`| ${s.file} | ${s.bytes} | ${s.mtime} | — | — | — | |`);
P();
P(`speed: ${speedFiles.join(', ') || '없음'} · measure: ${measureFiles.join(', ') || '없음'} · 그 밖: ${JOBREL}/kakao-signup.md · ${JOBREL}/gdr-v2.md · reports/atlas11/godori/verify2-latest.json · reports/atlas11/speed/2026-10-18.jsonl`);
P();
if (Object.keys(PROBE_DATA).length) {
  P('R1 가벼운 시험(`--probe`): ' + Object.entries(PROBE_DATA).filter(([k]) => k !== 'vkown').map(([k, v]) => `${k} ${v.pass}/${v.tests}${v.fail ? ' 실패 ' + v.fail : ''}`).join(' · ') + ` (${Object.values(PROBE_DATA)[0]?.at ? sgt(new Date(Object.values(PROBE_DATA)[0].at)) : '?'})`);
  if (PROBE_DATA.vkown) { const V = PROBE_DATA.vkown; P(); P(`R1 가 다시 돌린 VK 자기 시험(\`--probe-vk\`, ${hhmm(V.at)} 싱가포르 · 시험 파일 ${hhmm(V.fileMtime)} 에 씀): ${V.tests}개 중 초록 ${V.pass} · 「# TODO」 표시 ${V.todo} · 빨강 ${V.red?.length ?? 0}${V.red?.length ? '(' + V.red.join(', ') + ')' : ''}`); }
  P();
}
fs.writeFileSync(OUT_MD, L.join('\n') + '\n');

const line = `R1 build ${sgt(now)} · 줄 ${items.length} · ` + STATUS_ORDER.map((s) => `${s} ${counts[s]}`).join(' · ') + ` · 경고 ${warnings.length}`;
console.log(argv.has('--quiet') ? line : line + `\n→ ${rel(OUT_JSON)}\n→ ${rel(OUT_MD)}`);
