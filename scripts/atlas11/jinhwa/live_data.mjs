#!/usr/bin/env node
// 진화 회차 — 지금 사이트 자료(사장님 2026-11-03 02:24(서울) 「응」 · 주문 0224 — 물음 「다음으로, 진화 방이 새 자료로 살펴보게 고칠까요?」의 답)
//   까닭: 저장소의 사이트 자료 사본(site/atlas/data)은 10월 14일 뒤 안 바뀜(마지막 날 10월 13일) — 진짜 사이트는 올릴 때마다(package.mjs) 이어 받은 종가로 다시 셈
//         → 진화 회차가 낡은 사본으로 살펴보고(「가격 자료가 멈춤」 · 「오늘이 사실이 아님」) 낡은 사본으로 검사해(check_hold 「센 날이 앞섬」 등) 대안이 못 지나감(주문 2249 · 서울 23:40 · 00:53 회차 글)
//   하는 일: 지금 사이트의 dist-manifest.json 이 적은 atlas/data/ 와 next/data/(진화 칸 빼고) 파일을 sha256 이 맞는 한 판으로 받음(atlas11-next-full.yml 「지금 사이트 자료 받기」와 같은 셈)
//         + jinhwa-data.json(때 · 고른 날 · 파일 수 · 묶은 때 · 목록 지문)
//   깃허브 실행기에서 돎(atlas11-jinhwa-data.yml) — Claude 예약 방의 바깥 길은 aaa7377.com 과 깃허브 묶음 받는 곳을 막아서, 받은 판을 가지 jinhwa-data(한 커밋 · 덮어씀)에 두고 방은 git 으로 받음
//   쓰는 법: node scripts/atlas11/jinhwa/live_data.mjs --out live-data [--site https://aaa7377.com/] [--budget 180]
import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';

export const DATA_SCHEMA = 'atlas11-jinhwa-live-data-1';
export const INFO_FILE = 'jinhwa-data.json';
const sha = b => createHash('sha256').update(b).digest('hex');
/** 받을 파일 — 사이트 자료 atlas/data 모두 · 새 화면 작은 자료 next/data(진화 칸 jinhwa* 는 빼고 — 회차 도구가 쓰는 곳 · 올릴 때 네트워크로 받는 fx-rate 같은 것이 여기 있음) */
export const wantFile = f => !f.includes('..') && (f.startsWith('atlas/data/') || (f.startsWith('next/data/') && !f.startsWith('next/data/jinhwa')) || f === 'changelog.json');
//   changelog.json = 기록 탭(#/up)이 읽는 것 — 올릴 때 package.mjs 가 dist 에만 씀(저장소 site/ 에 없음 → 일 폴더 시험 서버에서 404 · 주문 0224 · next_check 「#/up 404」)
const wait = ms => new Promise(r => setTimeout(r, ms));

/** 지금 사이트 atlas/data 받기 — {ok, out, asOf, builtAt, files, bytes, secs, why, stat}
 *  파일마다 그 판 dist-manifest.json 의 sha256 과 맞아야 받음 · 받는 사이 올림이 끼면 새 목록으로 처음부터(세 번까지) · 404 는 바로 실패 */
export async function downloadLive({site = 'https://aaa7377.com/', out, budgetMs = 180e3, conc = 8, fetchFn = fetch, sleep = wait, now = () => Date.now()} = {}) {
  const B = site.endsWith('/') ? site : site + '/', T0 = now(), st = {req: 0, http: {}, sha: 0, err: {}};
  async function get(f, want = null, tries = 6) {
    let last = '', shaBad = 0;
    for (let i = 0; i < tries; i++) {
      if (now() - T0 > budgetMs) throw Error('시간 넘음 ' + f);
      st.req++;
      try {
        const r = await fetchFn(B + f, {signal: AbortSignal.timeout(20000)});
        if (r.ok) { const b = Buffer.from(await r.arrayBuffer()); if (!want || sha(b) === want) return b; st.sha++; last = 'sha256 다름'; if (++shaBad >= 2) break; }
        else { st.http[r.status] = (st.http[r.status] || 0) + 1; last = 'HTTP ' + r.status; if (r.status === 404) break; if (r.status === 429 || r.status === 503) await sleep(3000); }
      } catch (e) { const k = String(e?.cause?.code || e?.name || e?.message || e).slice(0, 40); st.err[k] = (st.err[k] || 0) + 1; last = k; }
      await sleep(400 * (i + 1));
    }
    throw Error(f + ' ' + last);
  }
  let note = '';
  try {
    for (let round = 1; round <= 3; round++) {
      const man = JSON.parse(String(await get('dist-manifest.json', null, 8)));
      const files = Object.keys(man.hashes ?? {}).filter(wantFile).sort();
      if (!files.includes('atlas/data/mkt.json') || !files.includes('atlas/data/days.json') || !files.includes('atlas/data/core.json')) throw Error('dist-manifest.json 에 atlas/data 가 없음');
      fs.rmSync(out, {recursive: true, force: true});
      let i = 0, bytes = 0; const bad = [];
      await Promise.all(Array.from({length: conc}, async () => {
        while (i < files.length && bad.length < 12) {
          const f = files[i++];
          try { const b = await get(f, man.hashes[f]); fs.mkdirSync(path.dirname(path.join(out, f)), {recursive: true}); fs.writeFileSync(path.join(out, f), b); bytes += b.length; } catch (e) { bad.push(String(e.message)); }
        }
      }));
      if (!bad.length) {
        const mkt = JSON.parse(fs.readFileSync(path.join(out, 'atlas/data/mkt.json'), 'utf8'));
        const days = JSON.parse(fs.readFileSync(path.join(out, 'atlas/data/days.json'), 'utf8'));
        const last = (days.dates ?? days).at?.(-1) ?? null;
        const info = {schema: DATA_SCHEMA, at: new Date(now()).toISOString(), site: B, asOf: mkt.asOf ?? null, lastDay: last, builtAt: man.builtAt ?? null, files: files.length, bytes,
          list: sha(files.map(f => f + ' ' + man.hashes[f]).join('\n'))};
        fs.writeFileSync(path.join(out, INFO_FILE), JSON.stringify(info, null, 1) + '\n');
        return {ok: true, out, asOf: info.asOf, lastDay: last, builtAt: info.builtAt, files: files.length, bytes, secs: Math.round((now() - T0) / 1000), why: '', stat: st};
      }
      note = `${round}번째 ${i}/${files.length}에서 멈춤 — 못 받은 것 ${bad.length}(${bad.slice(0, 2).join(' · ')})`;
    }
  } catch (e) { note = String(e?.message ?? e).slice(0, 200); }
  return {ok: false, out, why: note, secs: Math.round((now() - T0) / 1000), stat: st};
}

/** 받은 판이 쓸 만한가 — {ok, info, why} (가지에서 꺼낸 폴더를 회차 도구가 맞댐) */
export function readInfo(dir) {
  let info = null;
  try { info = JSON.parse(fs.readFileSync(path.join(dir, INFO_FILE), 'utf8')); } catch { return {ok: false, info: null, why: `${INFO_FILE} 가 없음`}; }
  if (info?.schema !== DATA_SCHEMA) return {ok: false, info, why: '자료 꼴이 다름'};
  for (const f of ['atlas/data/mkt.json', 'atlas/data/days.json', 'atlas/data/core.json']) if (!fs.existsSync(path.join(dir, f))) return {ok: false, info, why: f + ' 가 없음'};
  return {ok: true, info, why: ''};
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const argv = process.argv.slice(2), arg = (k, d) => { const i = argv.indexOf(k); return i >= 0 ? argv[i + 1] : d; };
  const out = path.resolve(arg('--out', 'live-data'));
  const r = await downloadLive({site: arg('--site', 'https://aaa7377.com/'), out, budgetMs: Number(arg('--budget', '180')) * 1000});
  console.log(r.ok ? `지금 사이트 자료 ${r.files}개 · ${(r.bytes / 1e6).toFixed(1)}MB · sha256 모두 맞음(한 판) · 고른 날 ${r.asOf} · 마지막 날 ${r.lastDay} · 묶은 때 ${r.builtAt} · ${r.secs}초`
    : `지금 사이트 자료를 못 받음 — ${r.why} · ${r.secs}초 · ${JSON.stringify(r.stat)}`);
  process.exit(r.ok ? 0 : 1);
}
