import {collectBenchmark} from './lib/benchmark-collection.mjs';
import {handleAccountRequest} from "./lib/account-service.mjs";
import {createCycleCollector} from './lib/cycle-runtime.mjs';
import http from "node:http";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { timingSafeEqual } from "node:crypto";
import {createCompanyCollector} from './lib/company-collection-runtime.mjs';
import {
  initialState,
  upgradeState,
  transition,
  refreshState,
  clientState,
} from "./lib/service.mjs";
const root = path.dirname(fileURLToPath(import.meta.url));
const site = path.join(root, "publish");
const statePath =
  process.env.ATLAS_STATE_FILE ?? path.join(root, "runtime", "state.json");
const token = process.env.ATLAS_ADMIN_TOKEN ?? "";
const companyCollector=createCompanyCollector({directory:path.join(path.dirname(statePath),'collection52')});
const cycleCollector=createCycleCollector();
const host = process.env.ATLAS_HOST ?? "127.0.0.1";
const port = Number(process.env.ATLAS_PORT ?? 8787);
let queue = Promise.resolve();
let accountQueue=Promise.resolve();
const bundle = JSON.parse(
  await fs.readFile(path.join(root, "public/data/atlas.json"), "utf8"),
);
const load = async () => {
  try {
    return JSON.parse(await fs.readFile(statePath, "utf8"));
  } catch (e) {
    if (e.code !== "ENOENT") throw e;
    return initialState(bundle);
  }
};
async function save(state) {
  await fs.mkdir(path.dirname(statePath), { recursive: true });
  const temp = statePath + ".tmp";
  await fs.writeFile(temp, JSON.stringify(state));
  await fs.rename(temp, statePath);
}
const storedBeforeUpgrade = await load();
const upgradedState = upgradeState(storedBeforeUpgrade,bundle);
if(upgradedState!==storedBeforeUpgrade)await save(upgradedState);
const json = (res, status, data) => {
  res.writeHead(status, {
    "content-type": "application/json; charset=utf-8",
    "cache-control": "no-store",
  });
  res.end(JSON.stringify(data));
};
function authorized(req) {
  if (!token) return false;
  const input = Buffer.from(
      (req.headers.authorization ?? "").replace(/^Bearer /, ""),
    ),
    expected = Buffer.from(token);
  return input.length === expected.length && timingSafeEqual(input, expected);
}
const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, "http://localhost");
    if(url.pathname==='/api/account'){
      let body='';for await(const part of req){body+=part;if(body.length>20000)return json(res,413,{error:'요청이 너무 큽니다.'});}
      const request=new Request(`http://${req.headers.host}${req.url}`,{method:req.method,headers:req.headers,...(req.method==='POST'?{body}:{})});
      const accountDir=path.join(path.dirname(statePath),'accounts');
      const read=async key=>{try{return JSON.parse(await fs.readFile(path.join(accountDir,key+'.json'),'utf8'));}catch(e){if(e.code==='ENOENT')return null;throw e;}};
      const write=(key,value,revision)=>{const work=accountQueue.then(async()=>{
        const current=await read(key);if((current?.revision??0)!==revision)throw Object.assign(Error('conflict'),{code:'CONFLICT'});
        await fs.mkdir(accountDir,{recursive:true});const target=path.join(accountDir,key+'.json');
        await fs.writeFile(target+'.tmp',JSON.stringify(value),{mode:0o600});await fs.rename(target+'.tmp',target);
      });accountQueue=work.catch(()=>{});return work;};
      const response=await handleAccountRequest(request,{read,write,codes:bundle.input.assets.map(a=>a.code)});
      res.writeHead(response.status,{...Object.fromEntries(response.headers),...(response.headers.getSetCookie().length?{'set-cookie':response.headers.getSetCookie()}:{})});
      return res.end(await response.text());
    }
    if (url.pathname === "/api/atlas") {
      if (req.method === "GET") {
        const state = await load(),
          id = url.searchParams.get("version");
        if (id) {
          const version = state.versions.find((v) => v.id === id);
          return json(
            res,
            version ? 200 : 404,
            version
              ? { version: { ...version, detailLoaded: true } }
              : { error: "저장된 버전이 없습니다." },
          );
        }
        return json(res, 200, {
          state: clientState(state),
          storage: "server",
          authConfigured: Boolean(token),
        });
      }
      if (req.method !== "POST")
        return json(res, 405, { error: "허용되지 않는 메서드" });
      if (!authorized(req))
        return json(res, 401, {
          error: token
            ? "관리자 키를 확인하세요."
            : "서버에 ATLAS_ADMIN_TOKEN을 설정하세요.",
        });
      const origin = req.headers.origin;
      if (origin && new URL(origin).host !== req.headers.host)
        return json(res, 403, { error: "외부 사이트 요청 거부" });
      let body = "";
      for await (const chunk of req) {
        body += chunk;
        if (body.length > 8000000)
          return json(res, 413, { error: "입력 파일이 너무 큽니다." });
      }
      const payload = JSON.parse(body);
      const work = queue.then(async () => {
        const old = await load();
        const next =
          payload.action === "refresh"
            ? await refreshState(old, {
              benchmarkCollector:collectBenchmark,
                companyCollector,cycleCollector,
                feedUrl: process.env.ATLAS_NEWS_FEED_URL,
              })
            : transition(old, payload.action, payload);
        await save(next);
        return next;
      });
      queue = work.catch(() => {});
      const next = await work;
      return json(res, 200, {
        state: clientState(next),
        message:
          payload.action === "refresh"
            ? `수집 성공 ${next.collectionLogs.at(-1).success}/52종목`
            : undefined,
      });
    }
    const relative =
      url.pathname === "/"
        ? "index.html"
        : decodeURIComponent(url.pathname).replace(/^\//, "");
    const file = path.resolve(site, relative);
    if (!file.startsWith(site + path.sep))
      return json(res, 403, { error: "경로 오류" });
    try {
      const b = await fs.readFile(file);
      const type =
        {
          ".html": "text/html; charset=utf-8",
          ".js": "text/javascript",
          ".css": "text/css",
          ".json": "application/json",
          ".svg": "image/svg+xml",
          ".md": "text/markdown",
          ".zip": "application/zip",
        }[path.extname(file)] ?? "application/octet-stream";
      res.writeHead(200, { "content-type": type });
      res.end(b);
    } catch {
      res.writeHead(404);
      res.end("Not found");
    }
  } catch (e) {
    json(res, 400, { error: e.message });
  }
});
server.listen(port, host, () =>
  console.log(
    `ATLAS http://${host}:${port} (admin token ${token ? "configured" : "not configured"})`,
  ),
);
// Daily news checks also run on holidays. Only completed KRX sessions supply prices.
if (process.env.ATLAS_SCHEDULE === "1")
  setInterval(() => {
    const run = queue.then(async () => {
      const state = await load();
      const now = new Date();
      const kst = new Date(now.getTime() + 9 * 3600000);
      const today = kst.toISOString().slice(0, 10);
      if (
        kst.getUTCHours() < 16 ||
        today < state.input.origin ||
        today > state.input.end ||
        state.collectionLogs.some(
          (l) =>
            l.day === today &&
            l.fresh === 52 &&
            !l.partial &&
            l.news?.success === l.news?.total,
        ) ||
        state.collectionLogs.some(
          (l) => l.day === today && now - new Date(l.at) < 15 * 60000,
        )
      )
        return;
      await save(
        await refreshState(state, {
          benchmarkCollector:collectBenchmark,
          companyCollector,cycleCollector,
          now,
          feedUrl: process.env.ATLAS_NEWS_FEED_URL,
        }),
      );
    });
    queue = run.catch((e) => console.error("Scheduled collection:", e.message));
  }, 60000);
