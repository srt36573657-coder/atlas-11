#!/usr/bin/env node
/**
 * 넷리파이 옛 판 지우기(사장님 2026-10-13 03:38 「모든 흔적 다 지워」)
 *   소개 그림 · 영상이 처음 들어간 때(2026-10-09 21:15 서울 = 12:15Z) 뒤에 올린 옛 판(deploy)은 그 파일을 품고 있어
 *   판마다 붙는 옛 주소로 아직 열림 → 지금 올라가 있는 판(published) 하나만 남기고 그 뒤 옛 판을 지움
 *   그 전 판은 그 파일이 없어 그대로 둠 · 열쇠 · 사이트 번호 · 판 번호 · 주소는 어디에도 적지 않음(셈만 적음)
 *   node scripts/atlas11/probe/netlify_purge.mjs → reports/atlas11/probe/netlify-purge/summary.json
 */
import fs from 'node:fs/promises';

const token = process.env.NETLIFY_AUTH_TOKEN ?? '', site = (process.env.NETLIFY_SITE_ID ?? '').trim();
const FROM = '2026-10-09T12:15:00Z';
const dir = 'reports/atlas11/probe/netlify-purge'; await fs.mkdir(dir, {recursive: true});
const out = {made: new Date().toISOString(), from: FROM, listed: 0, candidates: 0, deleted: 0, failed: 0, remaining: null, publishedKept: false, publishedAfterFrom: null, error: null};
const H = {headers: {Authorization: 'Bearer ' + token, 'User-Agent': 'atlas11-purge'}, signal: AbortSignal.timeout(30000)};
async function list() {
  const all = [];
  for (let page = 1; page <= 50; page++) {
    const r = await fetch(`https://api.netlify.com/api/v1/sites/${site}/deploys?per_page=100&page=${page}`, H);
    if (!r.ok) throw new Error(`판 목록 요청 ${r.status}`);
    const xs = await r.json(); if (!Array.isArray(xs) || !xs.length) break;
    all.push(...xs); if (xs.length < 100) break;
  }
  return all;
}
if (!token || !site) out.error = '열쇠 또는 사이트 번호 없음';
else {
  try {
    const s = await (await fetch(`https://api.netlify.com/api/v1/sites/${site}`, H)).json();
    const pub = s?.published_deploy?.id ?? null;
    out.publishedAfterFrom = s?.published_deploy?.created_at ? s.published_deploy.created_at >= FROM : null;
    const all = await list(); out.listed = all.length;
    const cand = all.filter(d => d.id !== pub && (d.created_at ?? '') >= FROM); out.candidates = cand.length;
    for (const d of cand) {
      try { const r = await fetch(`https://api.netlify.com/api/v1/deploys/${d.id}`, {...H, method: 'DELETE'}); if (r.ok || r.status === 204) out.deleted++; else out.failed++; }
      catch { out.failed++; }
    }
    const again = await list(); out.remaining = again.filter(d => d.id !== pub && (d.created_at ?? '') >= FROM).length;
    out.publishedKept = !!pub && again.some(d => d.id === pub);
  } catch (e) { out.error = String(e.message).slice(0, 160); }
}
await fs.writeFile(`${dir}/summary.json`, JSON.stringify(out, null, 1));
console.log(JSON.stringify(out));
