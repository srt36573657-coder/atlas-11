#!/usr/bin/env node
/**
 * 읽기 전용 진단 — 넷리파이 계정에서 aaa7377.com 이 붙은 사이트를 찾아 그 사이트 번호(Project ID)를 적는다.
 *   사이트 번호는 비밀이 아니다(주소처럼 사이트를 가리키는 이름표). 열쇠(NETLIFY_AUTH_TOKEN)는 읽기만 하고 어디에도 쓰지 않는다.
 *   아무것도 올리거나 바꾸지 않는다(GET 요청만).
 *   node scripts/atlas11/probe/netlify_sites.mjs → reports/atlas11/probe/netlify-sites.json
 */
import fs from 'node:fs/promises';
import path from 'node:path';

const token = process.env.NETLIFY_AUTH_TOKEN, want = (process.argv[2] || 'aaa7377').toLowerCase();
const out = {at: new Date().toISOString(), want, total: 0, matches: [], atlas11Sites: [], error: null};
if (!token) out.error = 'NETLIFY_AUTH_TOKEN 없음';
else {
  try {
    const all = [];
    for (let page = 1; page <= 10; page++) {
      const r = await fetch(`https://api.netlify.com/api/v1/sites?filter=all&per_page=100&page=${page}`, {headers: {Authorization: 'Bearer ' + token, 'User-Agent': 'atlas11-probe'}, signal: AbortSignal.timeout(30000)});
      if (!r.ok) { out.error = `목록 요청 ${r.status}`; break; }
      const list = await r.json();
      if (!Array.isArray(list) || !list.length) break;
      all.push(...list);
      if (list.length < 100) break;
    }
    out.total = all.length;
    for (const s of all) {
      const names = [s.name, s.custom_domain, ...(s.domain_aliases ?? []), s.url, s.ssl_url].filter(Boolean).map(x => String(x).toLowerCase());
      if (names.some(x => x.includes(want))) out.matches.push({id: s.id ?? s.site_id, name: s.name, customDomain: s.custom_domain ?? null, domainAliases: s.domain_aliases ?? [], url: s.ssl_url || s.url, account: s.account_slug ?? null, publishedAt: s.published_deploy?.published_at ?? null, ssoLogin: s.sso_login ?? null, hasPassword: s.has_password ?? null});
      if (/^atlas11-/.test(s.name ?? '')) out.atlas11Sites.push({id: s.id ?? s.site_id, name: s.name});
    }
  } catch (e) { out.error = String(e.message).slice(0, 200); }
  // 저장소 비밀 NETLIFY_SITE_ID 가 들어갔는지 — 값은 적지 않고 「있음/맞음」만 적는다
  const envId = process.env.NETLIFY_SITE_ID ?? '';
  out.secretSiteId = {set: envId.length > 0, matchesAaa7377: out.matches.some(m => m.id === envId.trim()), extraSpaces: envId !== envId.trim()};
  // 지금 aaa7377.com 에 올라가 있는 판의 내용 — 자동 배포가 무엇을 덮어쓰게 되는지 미리 본다(읽기만)
  for (const m of out.matches) {
    try {
      const h = {headers: {Authorization: 'Bearer ' + token, 'User-Agent': 'atlas11-probe'}, signal: AbortSignal.timeout(30000)};
      const site = await (await fetch(`https://api.netlify.com/api/v1/sites/${m.id}`, h)).json();
      const d = site.published_deploy ?? {};
      m.published = {deployId: d.id ?? null, title: d.title ?? null, context: d.context ?? null, createdAt: d.created_at ?? null, functions: (d.available_functions ?? []).map(f => f.n ?? f.name ?? String(f)), framework: d.framework ?? null, buildSettingsRepo: site.build_settings?.repo_url ?? null};
      if (d.id) {
        const files = await (await fetch(`https://api.netlify.com/api/v1/deploys/${d.id}/files?per_page=1000`, h)).json();
        const paths = Array.isArray(files) ? files.map(f => f.id ?? f.path) : [];
        const top = {}; for (const x of paths) { const k = String(x).split('/')[1] || '/'; top[k] = (top[k] ?? 0) + 1; }
        m.published.fileCount = paths.length; m.published.topLevel = top; m.published.sample = paths.slice(0, 40);
      }
    } catch (e) { m.publishedError = String(e.message).slice(0, 200); }
  }
}
await fs.mkdir(path.join(process.cwd(), 'reports/atlas11/probe'), {recursive: true});
await fs.writeFile(path.join(process.cwd(), 'reports/atlas11/probe/netlify-sites.json'), JSON.stringify(out, null, 2) + '\n');
console.log(JSON.stringify(out, null, 1).split(token || '\u0000').join('***'));
