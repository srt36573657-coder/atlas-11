/** Source acquisition only. A successful HTTP request never approves an event. */
import { createHash } from 'node:crypto';
import { lookup as dnsLookup } from 'node:dns/promises';
import { isIP } from 'node:net';
import { request as httpsRequest } from 'node:https';
import { request as httpRequest } from 'node:http';
import { Readable } from 'node:stream';
import { appliesTo, scopeOf } from './news-scope.mjs';

export const COLLECTION_VERSION = 'atlas-collection52-1.0.0';
const hash = value => createHash('sha256').update(value).digest('hex');
const clone = value => structuredClone(value);
const unique = list => [...new Set(list)];
const fail = (code, message = code) => Object.assign(new Error(message), { code });
const sortedCodes = assets => assets.map(a => String(a.code)).sort();
function universe(assets) {
  const codes = sortedCodes(assets ?? []);
  if (codes.length !== 52 || new Set(codes).size !== 52 || codes.some(c => !/^\d{6}$/.test(c)))
    throw fail('EXACT_52_REQUIRED');
  return codes;
}
export function canonicalSourceURL(value) {
  let url;
  try { url = new URL(value); } catch { throw fail('INVALID_URL'); }
  if (!['https:', 'http:'].includes(url.protocol) || url.username || url.password)
    throw fail('UNSAFE_URL');
  if (url.port && !['80', '443'].includes(url.port)) throw fail('UNSAFE_PORT');
  const host = url.hostname.toLowerCase().replace(/\.$/, '');
  if (!host.includes('.') || isIP(host.replace(/^\[|\]$/g, '')) || /(^|\.)(localhost|local|internal|test|invalid|example|onion)$/.test(host))
    throw fail('NON_PUBLIC_HOST');
  url.hostname = host;
  url.hash = '';
  // Query order and every parameter are retained: official sites may sign them.
  return url.href;
}
export function isPublicAddress(address) {
  const family = isIP(address);
  if (family === 4) {
    const [a, b, c] = address.split('.').map(Number);
    return !(a === 0 || a === 10 || a === 127 || a >= 224 || (a === 100 && b >= 64 && b <= 127) ||
      (a === 169 && b === 254) || (a === 172 && b >= 16 && b <= 31) || (a === 192 && (b === 168 || (b === 0 && [0, 2].includes(c)))) ||
      (a === 198 && ([18, 19].includes(b) || (b === 51 && c === 100))) || (a === 203 && b === 0 && c === 113));
  }
  if (family === 6) {
    // Only globally routed 2000::/3; no mapped IPv4, loopback, ULA or link-local.
    const [first, second] = address.split(':').map(part => parseInt(part || '0', 16));
    return first >= 0x2000 && first <= 0x3fff && !(first === 0x2001 && (second === 0xdb8 || second < 0x200)) && first !== 0x2002;
  }
  return false;
}
async function publicAnswers(host, lookup) {
  const result = await lookup(host, { all: true, verbatim: true });
  const answers = Array.isArray(result) ? result : [result];
  if (!answers.length || answers.some(a => !isPublicAddress(a.address))) throw fail('NON_PUBLIC_DNS');
  return answers;
}
/** DNS is validated at socket connection, not only before a potentially rebound fetch. */
function nodePublicFetch(url, { signal, headers, lookup }) {
  return new Promise((resolve, reject) => {
    const parsed = new URL(url), request = parsed.protocol === 'https:' ? httpsRequest : httpRequest;
    const req = request(parsed, {
      method: 'GET', headers, signal, agent: false, autoSelectFamily: false,
      lookup(host, options, callback) {
        publicAnswers(host, lookup).then(answers => {
          if (options?.all) callback(null, answers);
          else callback(null, answers[0].address, answers[0].family || isIP(answers[0].address));
        }, callback);
      },
    }, res => resolve({ status: res.statusCode, headers: new Headers(Object.entries(res.headers).flatMap(([k, v]) =>
      v == null ? [] : [[k, Array.isArray(v) ? v.join(', ') : String(v)]])), body: Readable.toWeb(res) }));
    req.on('error', reject); req.end();
  });
}
export function buildSourceRegistry52(input, { previousRegistry = null, userSources = [] } = {}) {
  const codes = universe(input.assets), sources = new Map(), rejected = [];
  if (previousRegistry && JSON.stringify(previousRegistry.codes) !== JSON.stringify(codes)) throw fail('UNIVERSE_CHANGED');
  const add = (record, linkage) => {
    let url;
    try { url = canonicalSourceURL(record.url); } catch (error) {
      rejected.push({ url: record.url ?? null, code: error.code, linkage: clone(linkage) }); return;
    }
    const targets = unique(linkage.codes ?? []);
    if (targets.some(c => !codes.includes(c)) || !targets.length) throw fail('UNKNOWN_SOURCE_TARGET');
    const id = 'source:' + hash(url).slice(0, 24);
    const old = sources.get(url) ?? { id, url, host: new URL(url).hostname, codes: [], references: [], config: { enabled: true } };
    old.codes = unique([...old.codes, ...targets]).sort();
    const reference = { ...clone(linkage), sourceName: record.name ?? null, declaredPublisherRole: record.role ?? record.type ?? 'unverified',
      publishedAt: record.publishedAt ?? null, bodyPreviouslyReviewed: record.bodyRead === true, recordedOnCuratedEvent: linkage.origin === 'curated_event_source' };
    if (!old.references.some(r => JSON.stringify(r) === JSON.stringify(reference))) old.references.push(reference);
    sources.set(url, old);
  };
  // Preserve user additions and configuration; the registry is cumulative, never destructive.
  for (const source of previousRegistry?.sources ?? []) {
    if (!Array.isArray(source.codes) || !source.codes.length || source.codes.some(c => !codes.includes(c))) throw fail('UNKNOWN_SOURCE_TARGET');
    const url = canonicalSourceURL(source.url);
    sources.set(url, { ...clone(source), id: 'source:' + hash(url).slice(0, 24), url, host: new URL(url).hostname });
  }
  for (const research of input.newsResearch?.assets ?? []) {
    if (!codes.includes(research.code)) throw fail('UNKNOWN_RESEARCH_TARGET');
    for (const source of research.sources ?? []) add(source, { origin: 'company_research_route', codes: [research.code], eventId: null });
  }
  const curated = new Set(input.newsResearch?.eventIds ?? []);
  for (const event of input.events ?? []) {
    const targets = input.assets.filter(a => appliesTo(event, a)).map(a => a.code);
    if (!targets.length) continue;
    for (const source of event.sources ?? []) add(source, { origin: curated.has(event.id) ? 'curated_event_source' : 'schedule_source',
      codes: targets, eventId: event.id, scope: scopeOf(event).type, eventAvailableAt: event.availableAt ?? null });
  }
  for (const source of userSources) {
    add(source, { origin: 'user_configured_route', codes: source.codes, eventId: null });
    let url; try { url = canonicalSourceURL(source.url); } catch { continue; }
    sources.get(url).config = { ...sources.get(url).config, ...clone(source.config ?? {}) };
  }
  const list = [...sources.values()].sort((a, b) => a.id.localeCompare(b.id));
  return { schema: 1, version: COLLECTION_VERSION, codes, sources: list, rejected,
    assets: input.assets.map(a => ({ code: a.code, name: a.name, sector: a.sector,
      sourceIds: list.filter(s => s.codes.includes(a.code)).map(s => s.id) })),
    meaning: 'Source observation is not event verification, corporate participation proof, or price-impact evidence.' };
}
function positive(value, name, max = Infinity) {
  if (!Number.isInteger(value) || value < 1 || value > max) throw fail('INVALID_OPTION', name);
  return value;
}
function retryDelay(header, nowMs, fallback, cap) {
  if (!header) return fallback;
  const seconds = Number(header);
  const delay = Number.isFinite(seconds) ? Math.max(0, seconds * 1000) : Math.max(0, Date.parse(header) - nowMs);
  // Do not retry sooner than the publisher permits; defer an excessive wait instead.
  if (!Number.isFinite(delay)) return fallback;
  return delay > cap ? null : delay;
}
async function sleep(ms, signal) {
  if (signal.aborted) throw signal.reason;
  await new Promise((resolve, reject) => {
    const done = () => { clearTimeout(timer); signal.removeEventListener('abort', abort); resolve(); };
    const abort = () => { clearTimeout(timer); signal.removeEventListener('abort', abort); reject(signal.reason); };
    const timer = setTimeout(done, ms); signal.addEventListener('abort', abort, { once: true });
  });
}
async function bounded(promise, signal) {
  if (signal.aborted) throw signal.reason;
  return new Promise((resolve, reject) => {
    const abort = () => reject(signal.reason);
    signal.addEventListener('abort', abort, { once: true });
    Promise.resolve(promise).then(resolve, reject).finally(() => signal.removeEventListener('abort', abort));
  });
}
function cancelBody(body) {
  // Cancellation is best-effort and must never extend the collection deadline.
  try { Promise.resolve(body?.cancel?.()).catch(() => {}); } catch {}
}
async function readBody(response, maxBytes, signal) {
  const length = Number(response.headers.get('content-length'));
  if (length > maxBytes) { cancelBody(response.body); throw fail('BODY_TOO_LARGE'); }
  const reader = response.body?.getReader();
  if (!reader) return Buffer.alloc(0);
  const chunks = []; let bytes = 0;
  try {
    while (true) {
      const { done, value } = await bounded(reader.read(), signal);
      if (done) break;
      bytes += value.byteLength;
      if (bytes > maxBytes) throw fail('BODY_TOO_LARGE');
      chunks.push(Buffer.from(value));
    }
  } catch (error) { cancelBody(reader); throw error; }
  finally { reader.releaseLock(); }
  return Buffer.concat(chunks);
}
function challenge(body, type) {
  if (!/html|text|json|xml/i.test(type) && !body.subarray(0, 64).toString().match(/<!doctype|<html/i)) return false;
  const text = body.subarray(0, 150000).toString('utf8');
  return /(?:cf-chl-|challenge-platform|verify you are human|checking your browser|access denied|captcha|netfunnel|로봇이 아닙니다|접근이 차단|접근 권한이 없습니다)/i.test(text);
}
/** Text and dates are candidates only. These never become input.events automatically. */
export function discoverCandidateLinks(body, contentType, baseURL) {
  if (!/html/i.test(contentType) && !body.subarray(0, 64).toString().match(/<!doctype|<html/i)) return { pageTitle: null, links: [], dateMentions: [], status: 'NON_HTML_REVIEW_REQUIRED' };
  const raw = body.toString('utf8'), strip = value => value.replace(/<[^>]*>/g, ' ').replace(/&(?:nbsp|amp|quot|lt|gt);/g, m => ({ '&nbsp;': ' ', '&amp;': '&', '&quot;': '"', '&lt;': '<', '&gt;': '>' }[m])).replace(/\s+/g, ' ').trim();
  const text = strip(raw.replace(/<(script|style)\b[^>]*>[\s\S]*?<\/\1>/gi, ''));
  const dateMentions = unique([...text.matchAll(/\b(20\d{2})[-./](0?[1-9]|1[0-2])[-./](0?[1-9]|[12]\d|3[01])\b/g)].map(m => m[0])).slice(0, 100);
  const links = new Map();
  for (const match of raw.matchAll(/<a\b[^>]*href\s*=\s*["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi)) {
    let url;
    try { url = canonicalSourceURL(new URL(match[1].replaceAll('&amp;', '&'), baseURL).href); } catch { continue; }
    if (new URL(url).origin !== new URL(baseURL).origin || url === baseURL) continue;
    const title = strip(match[2]).slice(0, 240);
    if (!title) continue;
    links.set(url, { url, title, publishedAt: null, status: 'UNREVIEWED_CANDIDATE', eventCount: 0 });
  }
  return { pageTitle: strip(raw.match(/<title\b[^>]*>([\s\S]*?)<\/title>/i)?.[1] ?? '').slice(0, 240) || null,
    dateMentions, links: [...links.values()].sort((a, b) => Number(/IR|invest|disclos|공시|실적|설명회|일정|공지|보도/i.test(b.title + b.url)) - Number(/IR|invest|disclos|공시|실적|설명회|일정|공지|보도/i.test(a.title + a.url))).slice(0, 80),
    status: 'HUMAN_EVENT_REVIEW_REQUIRED', dateMeaning: 'Text mentions only; date role, company participation and schedule not established.' };
}
function sourcePriority(source) {
  return source.references.some(r => r.scope === 'company' && r.origin === 'curated_event_source') ? 0 :
    source.references.some(r => r.origin === 'company_research_route') ? 1 : 2;
}
/** Round-robin keeps one prolific company from consuming the entire run budget. */
export function fairSourceOrder(registry) {
  const selected = new Set(), output = [], queues = registry.codes.map(code => registry.sources.filter(s => s.codes.includes(code))
    .sort((a, b) => sourcePriority(a) - sourcePriority(b) || a.id.localeCompare(b.id)));
  while (queues.some(q => q.length)) for (const queue of queues) {
    while (queue.length && selected.has(queue[0].id)) queue.shift();
    const source = queue.shift(); if (source) { selected.add(source.id); output.push(source); }
  }
  return output;
}
export async function collectSources52(registry, options = {}) {
  universe(registry.assets);
  const seen = new Set();
  for (const source of registry.sources) {
    const url = canonicalSourceURL(source.url);
    if (source.url !== url || source.host !== new URL(url).hostname || source.id !== 'source:' + hash(url).slice(0, 24) || seen.has(source.id) || !source.codes?.length || source.codes.some(c => !registry.codes.includes(c))) throw fail('INVALID_REGISTRY_SOURCE');
    seen.add(source.id);
  }
  if (JSON.stringify(sortedCodes(registry.assets)) !== JSON.stringify(registry.codes)) throw fail('REGISTRY_UNIVERSE_MISMATCH');
  for (const asset of registry.assets) {
    const actual = registry.sources.filter(s => s.codes.includes(asset.code)).map(s => s.id).sort();
    if (JSON.stringify([...(asset.sourceIds ?? [])].sort()) !== JSON.stringify(actual)) throw fail('REGISTRY_LINKAGE_MISMATCH');
  }
  const { previousState = null, fetcher = nodePublicFetch, lookup = dnsLookup, now = () => new Date(),
    concurrency = 6, perHostConcurrency = 1, maxAttempts = 2, timeoutMs = 12000, deadlineMs = 180000,
    maxBytes = 4 * 1024 * 1024, maxRetryDelayMs = 3000, circuitThreshold = 3, circuitCooldownMs = 300000,
    maxSources = registry.sources.length || 1, signal: externalSignal = null, onSnapshot = null, onAttempt = null } = options;
  for (const [key, value, max] of [['concurrency', concurrency, 32], ['perHostConcurrency', perHostConcurrency, 8],
    ['maxAttempts', maxAttempts, 4], ['timeoutMs', timeoutMs, 60000], ['deadlineMs', deadlineMs, 900000],
    ['maxBytes', maxBytes, 32 * 1024 * 1024], ['maxRetryDelayMs', maxRetryDelayMs, 30000],
    ['circuitThreshold', circuitThreshold, 100], ['circuitCooldownMs', circuitCooldownMs, 86400000], ['maxSources', maxSources, 100000]]) positive(value, key, max);
  if (previousState && JSON.stringify(previousState.codes) !== JSON.stringify(registry.codes)) throw fail('STATE_UNIVERSE_CHANGED');
  const clock = () => { const date = now(); if (!(date instanceof Date) || !Number.isFinite(date.getTime())) throw fail('INVALID_CLOCK'); return date; };
  const start = clock(), run = new AbortController(), timeout = setTimeout(() => run.abort(fail('RUN_DEADLINE')), deadlineMs);
  const forwardAbort = () => run.abort(externalSignal.reason ?? fail('ABORTED'));
  if (externalSignal?.aborted) forwardAbort(); else externalSignal?.addEventListener('abort', forwardAbort, { once: true });
  const state = clone(previousState ?? { schema: 1, codes: registry.codes, sources: {}, hosts: {}, runs: [] });
  const results = [], selected = fairSourceOrder(registry).slice(0, maxSources), activeHosts = new Map();
  const attempt = async source => {
    const old = state.sources[source.id] ?? { url: source.url, lastGood: null, attempts: [] };
    const entry = clone(old); state.sources[source.id] = entry;
    const log = { sourceId: source.id, url: source.url, observedAt: clock().toISOString(), publishedAt: null,
      eventVerification: 'REVIEW_REQUIRED', codes: [...source.codes], attempts: 0, status: null,
      lastGoodRetained: Boolean(entry.lastGood), newEventCount: 0, requests: [] };
    const host = state.hosts[source.host] ?? { consecutiveFailures: 0, openUntil: null };
    state.hosts[source.host] = host;
    const terminal = async (status, detail = {}) => {
      Object.assign(log, { status, ...detail });
      for (const request of log.requests) request.endedAt ??= clock().toISOString();
      entry.attempts.push(clone(log)); entry.lastAttempt = clone(log); results.push(log);
      if (onAttempt) {
        try { await bounded(onAttempt(clone(log)), run.signal); log.checkpointPersisted = true; }
        catch (error) { log.checkpointPersisted = false; log.checkpointError = run.signal.aborted ? run.signal.reason?.code ?? 'ABORTED' : error.code ?? 'CHECKPOINT_FAILED'; }
        entry.attempts[entry.attempts.length - 1] = clone(log); entry.lastAttempt = clone(log);
      }
    };
    if (source.config?.enabled === false) return terminal('DISABLED');
    if (run.signal.aborted) return terminal('DEFERRED', { reason: run.signal.reason?.code ?? 'ABORTED' });
    if (host.openUntil && Date.parse(host.openUntil) > clock().getTime()) return terminal('CIRCUIT_OPEN', { nextCheckAt: host.openUntil });
    let finalError = null;
    for (let n = 1; n <= maxAttempts; n++) {
      const controller = new AbortController(), relay = () => controller.abort(run.signal.reason);
      const attemptTimer = setTimeout(() => controller.abort(fail('REQUEST_TIMEOUT')), timeoutMs);
      run.signal.addEventListener('abort', relay, { once: true });
      if (run.signal.aborted) relay();
      let response, retryMs = null;
      const requestLog = { number: n, startedAt: clock().toISOString(), httpStatus: null, reason: null };
      log.requests.push(requestLog);
      try {
        log.attempts = n;
        let url = canonicalSourceURL(source.url), redirects = 0;
        const headers = { accept: 'text/html,application/pdf,application/json,application/xml,text/plain;q=0.8', 'user-agent': 'ATLAS-Research/1.0 (public-source-observation)' };
        if (entry.lastGood?.etag) headers['if-none-match'] = entry.lastGood.etag;
        if (entry.lastGood?.lastModified) headers['if-modified-since'] = entry.lastGood.lastModified;
        while (true) {
          // Injectable transports receive only hosts whose current DNS answers are public.
          if (fetcher !== nodePublicFetch) await bounded(publicAnswers(new URL(url).hostname, lookup), controller.signal);
          response = await bounded(fetcher(url, { method: 'GET', headers, signal: controller.signal, redirect: 'manual', lookup }), controller.signal);
          if (![301, 302, 303, 307, 308].includes(response.status)) break;
          cancelBody(response.body);
          if (++redirects > 3) throw fail('REDIRECT_LIMIT');
          const location = response.headers.get('location');
          if (!location) throw fail('INVALID_REDIRECT');
          const next = canonicalSourceURL(new URL(location, url).href);
          if (new URL(next).origin !== new URL(source.url).origin) throw fail('CROSS_ORIGIN_REDIRECT_REVIEW_REQUIRED');
          url = next;
        }
        log.httpStatus = response.status; requestLog.httpStatus = response.status;
        if (response.status === 304) {
          cancelBody(response.body);
          if (!entry.lastGood) throw fail('NOT_MODIFIED_WITHOUT_CACHE');
          entry.lastGood.lastCheckedAt = clock().toISOString(); host.consecutiveFailures = 0; host.openUntil = null;
          return await terminal('NOT_MODIFIED', { contentSha256: entry.lastGood.contentSha256, finalUrl: url });
        }
        if (response.status === 429 || response.status >= 500) {
          retryMs = retryDelay(response.headers.get('retry-after'), clock().getTime(), Math.min(250 * 2 ** (n - 1), maxRetryDelayMs), maxRetryDelayMs);
          cancelBody(response.body);
          if (retryMs === null) {
            const retryAfter = response.headers.get('retry-after'), seconds = Number(retryAfter);
            host.openUntil = new Date(Number.isFinite(seconds) ? clock().getTime() + seconds * 1000 : Date.parse(retryAfter)).toISOString();
            throw fail('RETRY_AFTER_DEFERRED');
          }
          throw fail('HTTP_RETRYABLE', 'HTTP ' + response.status);
        }
        if (response.status < 200 || response.status >= 300) {
          cancelBody(response.body); throw fail([401, 403, 451].includes(response.status) ? 'ACCESS_RESTRICTED' : 'HTTP_TERMINAL', 'HTTP ' + response.status);
        }
        const body = await readBody(response, maxBytes, controller.signal), contentType = response.headers.get('content-type') ?? '';
        if (!body.length) throw fail('EMPTY_BODY');
        if (challenge(body, contentType)) throw fail('ACCESS_CHALLENGE');
        const digest = hash(body), observedAt = clock().toISOString(), changed = entry.lastGood?.contentSha256 !== digest;
        const metadata = { url: source.url, finalUrl: url, contentSha256: digest, bytes: body.length, contentType,
          observedAt, firstObservedAt: changed ? observedAt : entry.lastGood.firstObservedAt, lastCheckedAt: observedAt,
          publishedAt: null, etag: response.headers.get('etag'), lastModified: response.headers.get('last-modified'),
          candidates: discoverCandidateLinks(body, contentType, url), rawSnapshotArchived: Boolean(onSnapshot),
          verification: 'UNREVIEWED_BODY', availabilityBasis: 'collection observation only; HTTP Last-Modified is not publication evidence' };
        if (onSnapshot && changed) {
          try { await bounded(onSnapshot({ source: clone(source), metadata: clone(metadata), body }), controller.signal); }
          catch { throw fail('SNAPSHOT_PERSISTENCE_FAILED'); }
        }
        if (entry.lastGood && changed) (entry.revisions ??= []).push(clone(entry.lastGood));
        entry.lastGood = metadata; host.consecutiveFailures = 0; host.openUntil = null;
        return await terminal(changed ? 'FETCHED_CHANGED_REVIEW_REQUIRED' : 'FETCHED_UNCHANGED', { contentSha256: digest, bytes: body.length, finalUrl: url });
      } catch (error) {
        finalError = (controller.signal.aborted ? controller.signal.reason?.code ?? 'ABORTED' : error.code) ?? 'NETWORK_ERROR';
        requestLog.reason = finalError;
        if (!['HTTP_RETRYABLE', 'NETWORK_ERROR', 'ECONNRESET', 'ETIMEDOUT', 'EAI_AGAIN', 'REQUEST_TIMEOUT'].includes(finalError) || n === maxAttempts || run.signal.aborted) break;
        retryMs ??= Math.min(250 * 2 ** (n - 1), maxRetryDelayMs);
      } finally {
        requestLog.endedAt ??= clock().toISOString();
        clearTimeout(attemptTimer); run.signal.removeEventListener('abort', relay);
      }
      try { await sleep(retryMs, run.signal); } catch { finalError = run.signal.reason?.code ?? 'ABORTED'; break; }
    }
    host.consecutiveFailures++;
    if (host.consecutiveFailures >= circuitThreshold) host.openUntil = new Date(Math.max(Date.parse(host.openUntil ?? '') || 0, clock().getTime() + circuitCooldownMs)).toISOString();
    return terminal('FAILED', { reason: finalError, nextCheckAt: host.openUntil });
  };
  const queue = [...selected], jobs = new Set();
  try {
    while (queue.length || jobs.size) {
      let launched = false;
      for (let i = 0; i < queue.length && jobs.size < concurrency; i++) {
        const source = queue[i];
        if ((activeHosts.get(source.host) ?? 0) >= perHostConcurrency) continue;
        queue.splice(i--, 1); activeHosts.set(source.host, (activeHosts.get(source.host) ?? 0) + 1); launched = true;
        const job = attempt(source).finally(() => { activeHosts.set(source.host, activeHosts.get(source.host) - 1); jobs.delete(job); });
        jobs.add(job);
      }
      if (jobs.size) await Promise.race(jobs);
      else if (!launched && queue.length) throw fail('SCHEDULER_STALLED');
    }
  } finally { clearTimeout(timeout); externalSignal?.removeEventListener('abort', forwardAbort); }
  const good = new Set(['NOT_MODIFIED', 'FETCHED_UNCHANGED', 'FETCHED_CHANGED_REVIEW_REQUIRED']);
  const perAsset = registry.assets.map(a => {
    const related = results.filter(r => r.codes.includes(a.code));
    return { code: a.code, name: a.name, registeredSources: a.sourceIds.length, attemptedSources: related.filter(r => r.attempts > 0).length,
      observedSources: related.filter(r => good.has(r.status)).length, failedSources: related.filter(r => r.status === 'FAILED').length,
      unattemptedSources: a.sourceIds.filter(id => !related.some(r => r.sourceId === id)).length,
      freshEventVerification: 'NOT_PERFORMED', verifiedNewEvents: 0, trustProbability: null };
  });
  const runLog = { id: hash(start.toISOString() + JSON.stringify(results)).slice(0, 24), startedAt: start.toISOString(), endedAt: clock().toISOString(),
    sourceCount: registry.sources.length, selectedSources: selected.length, successfulSources: results.filter(r => good.has(r.status)).length,
    failedSources: results.filter(r => r.status === 'FAILED').length, deferredSources: results.filter(r => ['DEFERRED', 'CIRCUIT_OPEN'].includes(r.status)).length,
    disabledSources: results.filter(r => r.status === 'DISABLED').length, unattemptedSources: registry.sources.length - selected.length,
    newVerifiedEvents: 0, missingSourceCodes: perAsset.filter(a => a.registeredSources === 0).map(a => a.code),
    partial: results.some(r => !good.has(r.status) || r.checkpointPersisted === false) || selected.length < registry.sources.length || perAsset.some(a => a.registeredSources === 0), results, perAsset };
  state.version = COLLECTION_VERSION; state.runs.push(runLog);
  return { registry, state, report: runLog, exitCode: runLog.partial ? 2 : 0 };
}
