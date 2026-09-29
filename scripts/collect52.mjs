/** Reporting-only collector: never mutates input, accepted events, equations or forecasts. */
import fs from 'node:fs/promises';
import path from 'node:path';
import { buildSourceRegistry52, collectSources52 } from '../lib/news-collection52.mjs';
const args = process.argv.slice(2), value = (flag, fallback) => {
  const i = args.indexOf(flag); return i < 0 ? fallback : args[i + 1];
};
const inputPath = path.resolve(value('--input', 'public/data/input.json'));
const output = path.resolve(value('--output', 'reports/collection52'));
const read = async (file, fallback) => { try { return JSON.parse(await fs.readFile(file, 'utf8')); } catch (error) { if (error.code === 'ENOENT') return fallback; throw error; } };
const write = async (file, content) => {
  await fs.mkdir(path.dirname(file), { recursive: true });
  const tmp = file + '.tmp-' + process.pid;
  await fs.writeFile(tmp, typeof content === 'string' ? content : JSON.stringify(content, null, 2) + '\n');
  await fs.rename(tmp, file);
};
const source = await read(inputPath), input = source.input ?? source;
const registryPath = path.join(output, 'registry.json'), statePath = path.join(output, 'state.json');
const previousRegistry = await read(registryPath, null), previousState = await read(statePath, null);
const registry = buildSourceRegistry52(input, { previousRegistry });
await write(registryPath, registry);
if (args.includes('--dry-run')) {
  console.log(JSON.stringify({ mode: 'registry_only', assets: registry.assets.length, sources: registry.sources.length,
    rejectedURLs: registry.rejected.length, unregisteredCodes: registry.assets.filter(a => !a.sourceIds.length).map(a => a.code) }));
} else {
  // --env-proxy requires starting Node with --use-env-proxy. It is an explicit normal proxy transport,
  // not an access-control bypass. Injected transport uses preflight public DNS checks.
  const result = await collectSources52(registry, { previousState,
    ...(args.includes('--env-proxy') ? { fetcher: globalThis.fetch } : {}),
    deadlineMs: Number(value('--deadline-ms', 180000)), timeoutMs: Number(value('--timeout-ms', 12000)),
    maxSources: Number(value('--max-sources', registry.sources.length)),
    concurrency: Number(value('--concurrency', 6)), perHostConcurrency: 1,
    onSnapshot: async ({ metadata, body }) => {
      const stem = path.join(output, 'snapshots', metadata.contentSha256);
      const extension = /pdf/i.test(metadata.contentType) ? '.pdf' : /html/i.test(metadata.contentType) ? '.html' : '.bin';
      try { await fs.mkdir(path.dirname(stem), { recursive: true }); await fs.writeFile(stem + extension, body, { flag: 'wx' }); }
      catch (error) { if (error.code !== 'EEXIST') throw error; }
      await write(stem + '.' + metadata.observedAt.replace(/[:.]/g, '-') + '.json', metadata);
    },
    onAttempt: async result => {
      await fs.mkdir(output, { recursive: true });
      await fs.appendFile(path.join(output, 'attempts.jsonl'), JSON.stringify(result) + '\n');
    },
  });
  await write(statePath, result.state);
  await write(path.join(output, 'latest.json'), result.report);
  await write(path.join(output, 'runs', result.report.id + '.json'), result.report);
  console.log(JSON.stringify({ assets: result.report.perAsset.length, sources: result.report.sourceCount,
    observed: result.report.successfulSources, failed: result.report.failedSources, deferred: result.report.deferredSources,
    unattempted: result.report.unattemptedSources, verifiedNewEvents: 0, partial: result.report.partial, exitCode: result.exitCode,
    note: 'HTTP collection and date mentions are candidates; original-body event verification and price-impact evidence remain separate.' }));
  process.exitCode = result.exitCode;
}
