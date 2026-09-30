#!/usr/bin/env node
/**
 * 넷리파이 사이트 상태 진단 — 올린 화면이 실제로 열리는지(응답 코드)와 사이트 설정(보호·잠금)을 적는다.
 *   node scripts/atlas11/netlify_status.mjs → reports/atlas11/operations/netlify-status.json
 *   열쇠(NETLIFY_AUTH_TOKEN)는 읽기만 하고 어디에도 쓰지 않는다. 비밀번호 값 같은 민감한 칸은 「있음/없음」만 남긴다.
 */
import fs from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd(), token = process.env.NETLIFY_AUTH_TOKEN;
const site = JSON.parse(await fs.readFile(path.join(root, 'deploy/netlify-site.json'), 'utf8'));
const out = {at: new Date().toISOString(), siteId: site.siteId, name: site.name, url: site.url};
if (token) {
  try {
    const r = await fetch(`https://api.netlify.com/api/v1/sites/${site.siteId}`, {headers: {Authorization: 'Bearer ' + token}, signal: AbortSignal.timeout(20000)});
    const s = await r.json();
    const has = v => v == null || v === '' || v === false ? false : true;
    out.api = {status: r.status, state: s.state ?? null, published: s.published_deploy?.state ?? null, publishedAt: s.published_deploy?.published_at ?? null, ssl: s.ssl ?? null, passwordSet: has(s.password), hasPassword: s.has_password ?? null, ssoLogin: s.sso_login ?? null, ssoLoginContext: s.sso_login_context ?? null, visitorAccess: Object.fromEntries(Object.entries(s).filter(([k]) => /protect|visitor|password_context|access|sso|rbac|login/i.test(k)).map(([k, v]) => [k, typeof v === 'string' && /password/i.test(k) ? has(v) : v])), accountSlug: s.account_slug ?? null, accountType: s.account_type ?? null, plan: s.plan ?? null};
  } catch (e) { out.apiError = String(e.message).slice(0, 200); }
}
for (const u of [site.url, site.url + '/data/atlas11/view/manifest.json']) {
  try {
    const r = await fetch(u, {redirect: 'manual', signal: AbortSignal.timeout(20000)});
    const text = await r.text();
    (out.fetch ??= []).push({url: u, status: r.status, wwwAuthenticate: r.headers.get('www-authenticate'), robots: r.headers.get('x-robots-tag'), server: r.headers.get('server'), location: r.headers.get('location'), bodyStart: text.replace(/\s+/g, ' ').slice(0, 300)});
  } catch (e) { (out.fetch ??= []).push({url: u, error: String(e.message).slice(0, 200)}); }
}
await fs.mkdir(path.join(root, 'reports/atlas11/operations'), {recursive: true});
await fs.writeFile(path.join(root, 'reports/atlas11/operations/netlify-status.json'), JSON.stringify(out, null, 2));
console.log(JSON.stringify(out, null, 1).split(token || '\u0000').join('***'));
