import { getStore } from "@netlify/blobs";
import bundle from "../../public/data/atlas.json" with { type: "json" };
import { initialState, upgradeState } from "../../lib/service.mjs";
export function store(context = {}) {
  const suffix =
    (context.deploy?.context ?? process.env.CONTEXT) === "production"
      ? "production"
      : (context.deploy?.id ?? process.env.DEPLOY_ID ?? "local");
  return getStore({ name: "atlas-news-v3-" + suffix, consistency: "strong" });
}
export async function readState(context = {}) {
  for(let attempt=0;attempt<3;attempt++){
    const result=await store(context).getWithMetadata("state",{type:"json"});
    if(!result?.data)return {state:initialState(bundle),etag:result?.etag};
    const state=upgradeState(result.data,bundle);
    if(state===result.data)return {state,etag:result.etag};
    try { await saveState(state,result.etag,context); } catch(e) { if(e.code!=="CONFLICT")throw e; }
  }
  throw Error("모형 이전 중 저장 충돌. 다시 시도하세요.");
}
export async function saveState(state, etag, context = {}) {
  const result = await store(context).setJSON(
    "state",
    state,
    etag ? { onlyIfMatch: etag } : { onlyIfNew: true },
  );
  if (!result.modified) {
    const e = Error(
      "다른 작업이 먼저 저장했습니다. 새로고침 후 다시 시도하세요.",
    );
    e.code = "CONFLICT";
    throw e;
  }
}
