import test from 'node:test';
import assert from 'node:assert/strict';
import { buildSourceRegistry52, collectSources52, canonicalSourceURL, isPublicAddress, fairSourceOrder, discoverCandidateLinks } from '../lib/news-collection52.mjs';

const lookup = async () => [{ address: '93.184.216.34', family: 4 }];
const input = () => ({ assets: Array.from({ length: 52 }, (_, i) => ({ code: String(i + 1).padStart(6, '0'), name: 'Company' + i, sector: 'sector' + i % 3 })),
  events: [], newsResearch: { eventIds: [], assets: [] } });
function registry(urls = ['https://issuer.org/ir']) {
  const data = input(); data.newsResearch.assets = data.assets.map(a => ({ ...a, sources: [{ url: urls[(Number(a.code) - 1) % urls.length] }] }));
  return buildSourceRegistry52(data);
}
const options = { lookup, timeoutMs: 100, deadlineMs: 2000, maxAttempts: 1 };
const response = (body = '<h1>IR public information</h1>', init = {}) => new Response(body, { status: 200, headers: { 'content-type': 'text/html', ...init.headers }, ...init });

test('registry preserves exact 52, cumulative references and user configuration without treating routes as event proof', () => {
  const data = input();
  data.newsResearch.assets = data.assets.map(a => ({ ...a, sources: [{ url: 'https://issuer.org/ir#top' }] }));
  let r = buildSourceRegistry52(data, { userSources: [{ url: 'https://issuer.org/ir', codes: ['000001'], config: { enabled: false, custom: 'keep' } }] });
  assert.equal(r.sources.length, 1); assert.equal(r.sources[0].codes.length, 52);
  assert.equal(r.sources[0].references[0].bodyPreviouslyReviewed, false);
  r = buildSourceRegistry52(data, { previousRegistry: r });
  assert.equal(r.sources[0].config.enabled, false); assert.equal(r.sources[0].config.custom, 'keep');
  assert.throws(() => buildSourceRegistry52({ ...data, assets: data.assets.slice(1) }), /EXACT_52/);
  assert.throws(() => buildSourceRegistry52(data, { userSources: [{ url: 'https://issuer.org/a', codes: ['999999'] }] }), /UNKNOWN_SOURCE/);
  const before = JSON.stringify(data); assert.ok(fairSourceOrder(r).length); assert.equal(JSON.stringify(data), before);
});

test('URL and socket address policy rejects credential, localhost, private, mapped and documentation addresses', () => {
  for (const url of ['file:///etc/passwd', 'https://u:p@issuer.org', 'https://localhost/a', 'http://127.0.0.1', 'https://issuer.org:3000', 'http://169.254.169.254/latest'])
    assert.throws(() => canonicalSourceURL(url));
  assert.equal(canonicalSourceURL('https://Issuer.ORG/a?z=1&b=2#x'), 'https://issuer.org/a?z=1&b=2');
  for (const address of ['127.0.0.1', '10.0.0.1', '172.16.0.1', '169.254.169.254', '100.64.0.1', '::1', '::ffff:127.0.0.1', 'fe80::1', 'fc00::1', '2001:db8::1']) assert.equal(isPublicAddress(address), false, address);
  assert.equal(isPublicAddress('93.184.216.34'), true); assert.equal(isPublicAddress('2606:4700::1111'), true);
});

test('conditional request retains first observation and never substitutes Last-Modified for publication', async () => {
  const r = registry(), snapshots = [];
  const first = await collectSources52(r, { ...options, now: () => new Date('2026-09-26T00:00:00Z'), onSnapshot: s => snapshots.push(s),
    fetcher: async () => response('IR body', { headers: { etag: '"one"', 'last-modified': 'Fri, 25 Sep 2026 01:00:00 GMT' } }) });
  assert.equal(first.exitCode, 0); assert.equal(snapshots.length, 1); assert.equal(first.report.perAsset.length, 52);
  const good = first.state.sources[r.sources[0].id].lastGood; assert.equal(good.publishedAt, null);
  const second = await collectSources52(r, { ...options, previousState: first.state, now: () => new Date('2026-09-26T01:00:00Z'),
    fetcher: async (url, opt) => { assert.equal(opt.headers['if-none-match'], '"one"'); assert.ok(opt.headers['if-modified-since']); return new Response(null, { status: 304 }); } });
  assert.equal(second.report.results[0].status, 'NOT_MODIFIED'); assert.equal(second.state.sources[r.sources[0].id].lastGood.firstObservedAt, good.firstObservedAt);
  assert.equal(second.state.runs.length, 2); assert.equal(first.state.runs.length, 1); assert.equal(second.report.newVerifiedEvents, 0);
});

test('changed bodies preserve prior metadata and access challenges preserve last good data', async () => {
  const r = registry();
  const first = await collectSources52(r, { ...options, fetcher: async () => response('original') });
  const changed = await collectSources52(r, { ...options, previousState: first.state, fetcher: async () => response('changed') });
  const entry = changed.state.sources[r.sources[0].id]; assert.equal(entry.revisions.length, 1);
  assert.notEqual(entry.revisions[0].contentSha256, entry.lastGood.contentSha256);
  const failed = await collectSources52(r, { ...options, previousState: changed.state, fetcher: async () => response('<html>Verify you are human captcha</html>') });
  assert.equal(failed.exitCode, 2); assert.equal(failed.report.results[0].reason, 'ACCESS_CHALLENGE');
  assert.deepEqual(failed.state.sources[r.sources[0].id].lastGood, entry.lastGood); assert.equal(failed.report.results[0].attempts, 1);
});

test('redirects and DNS cannot reach private or cross-origin locations and are not retried', async () => {
  for (const location of ['http://127.0.0.1/secret', 'https://elsewhere.org/ir']) {
    let calls = 0;
    const result = await collectSources52(registry(), { ...options, maxAttempts: 3, fetcher: async () => { calls++; return new Response(null, { status: 302, headers: { location } }); } });
    assert.equal(calls, 1); assert.equal(result.exitCode, 2);
  }
  let calls = 0;
  const result = await collectSources52(registry(), { ...options, lookup: async () => [{ address: '10.0.0.1', family: 4 }], fetcher: async () => { calls++; return response(); } });
  assert.equal(calls, 0); assert.equal(result.report.results[0].reason, 'NON_PUBLIC_DNS');
});

test('publisher Retry-After is honored within cap and excessive wait defers instead of early retry', async () => {
  let calls = 0;
  const retried = await collectSources52(registry(), { ...options, maxAttempts: 2, fetcher: async () => ++calls === 1 ? new Response(null, { status: 429, headers: { 'retry-after': '0' } }) : response() });
  assert.equal(calls, 2); assert.equal(retried.exitCode, 0);
  calls = 0;
  const deferred = await collectSources52(registry(), { ...options, maxAttempts: 3, fetcher: async () => { calls++; return new Response(null, { status: 429, headers: { 'retry-after': '3600' } }); } });
  assert.equal(calls, 1); assert.equal(deferred.report.results[0].reason, 'RETRY_AFTER_DEFERRED');
});

test('declared or streamed oversize bodies cannot replace cached evidence', async () => {
  const r = registry(), first = await collectSources52(r, { ...options, fetcher: async () => response('original') });
  for (const headers of [{}, { 'content-length': '1000' }]) {
    const result = await collectSources52(r, { ...options, previousState: first.state, maxBytes: 10, fetcher: async () => response('x'.repeat(100), { headers }) });
    assert.equal(result.report.results[0].reason, 'BODY_TOO_LARGE');
    assert.deepEqual(result.state.sources[r.sources[0].id].lastGood, first.state.sources[r.sources[0].id].lastGood);
  }
});

test('bounded concurrency, per-host limits and circuit breaker leave every target visible', async () => {
  const r = registry(['https://one.org/a', 'https://one.org/b', 'https://two.org/a', 'https://two.org/b']);
  const active = new Map(); let total = 0, maximum = 0;
  const result = await collectSources52(r, { ...options, concurrency: 3, perHostConcurrency: 1, fetcher: async url => {
    const host = new URL(url).host; active.set(host, (active.get(host) ?? 0) + 1); assert.equal(active.get(host), 1);
    total++; maximum = Math.max(maximum, total); await new Promise(resolve => setTimeout(resolve, 10)); total--; active.set(host, active.get(host) - 1); return response();
  } });
  assert.ok(maximum <= 3 && maximum >= 2); assert.equal(result.report.perAsset.length, 52);
  const failed = await collectSources52(r, { ...options, concurrency: 1, circuitThreshold: 1, fetcher: async () => new Response(null, { status: 403 }) });
  assert.equal(failed.report.failedSources, 2); assert.equal(failed.report.deferredSources, 2); assert.equal(failed.exitCode, 2);
});

test('request timeout and run deadline finish even if injected fetch ignores abort', async () => {
  const started = Date.now();
  const result = await collectSources52(registry(['https://one.org/a', 'https://two.org/a']), { ...options,
    timeoutMs: 20, deadlineMs: 30, concurrency: 1, fetcher: () => new Promise(() => {}) });
  assert.ok(Date.now() - started < 1000); assert.equal(result.exitCode, 2); assert.equal(result.report.perAsset.length, 52);
});

test('304 without cache and disabled or budget-skipped sources cannot count as successful observations', async () => {
  const r = registry(['https://one.org/a', 'https://two.org/a']);
  const noCache = await collectSources52(r, { ...options, maxSources: 1, fetcher: async () => new Response(null, { status: 304 }) });
  assert.equal(noCache.report.results[0].reason, 'NOT_MODIFIED_WITHOUT_CACHE'); assert.equal(noCache.report.unattemptedSources, 1); assert.equal(noCache.exitCode, 2);
  r.sources[0].config.enabled = false;
  const result = await collectSources52(r, { ...options, fetcher: async () => response() });
  assert.equal(result.report.disabledSources, 1); assert.equal(result.report.successfulSources, 1); assert.equal(result.report.newVerifiedEvents, 0);
});


test('candidate link discovery retains uncertain date roles and cannot create dated events', () => {
  const body = Buffer.from('<html><title>Investor notice</title><a href="/ir/a?x=1&amp;y=2">2026-10-15 earnings notice</a><a href="https://unrelated.org/date">other company</a><script>2026-10-31</script></html>');
  const c = discoverCandidateLinks(body, 'text/html', 'https://issuer.org/ir');
  assert.equal(c.pageTitle, 'Investor notice'); assert.deepEqual(c.dateMentions, ['2026-10-15']);
  assert.equal(c.links.length, 1); assert.equal(c.links[0].url, 'https://issuer.org/ir/a?x=1&y=2');
  assert.equal(c.links[0].publishedAt, null); assert.equal(c.links[0].eventCount, 0); assert.equal(c.status, 'HUMAN_EVENT_REVIEW_REQUIRED');
});


test('empty registry is missing coverage, never a successful all-52 collection', async () => {
  const r = buildSourceRegistry52(input());
  const result = await collectSources52(r, { ...options, fetcher: async () => { throw Error('should not fetch'); } });
  assert.equal(result.exitCode, 2); assert.equal(result.report.partial, true); assert.equal(result.report.missingSourceCodes.length, 52);
});

test('hanging snapshot and checkpoint hooks cannot defeat the run deadline', async () => {
  for (const hook of ['onSnapshot', 'onAttempt']) {
    const started = Date.now();
    const result = await collectSources52(registry(), { ...options, timeoutMs: 20, deadlineMs: 30,
      fetcher: async () => response(), [hook]: () => new Promise(() => {}) });
    assert.ok(Date.now() - started < 1000); assert.equal(result.exitCode, 2);
    if (hook === 'onSnapshot') assert.equal(result.state.sources[registry().sources[0].id].lastGood, null);
    else assert.equal(result.report.results[0].checkpointPersisted, false);
  }
});
