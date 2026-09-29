import { timingSafeEqual } from "node:crypto";
import { gzipSync } from "node:zlib";
import { transition, clientState } from "../../lib/service.mjs";
import { readState, saveState } from "../lib/state.mjs";
export const config = { path: "/api/atlas" };
export default async (req, context = {}) => {
  const response = (data, status = 200) => {
    const headers = {
      "cache-control": "no-store",
      "content-type": "application/json; charset=utf-8",
      vary: "accept-encoding",
    };
    if (req.headers.get("accept-encoding")?.includes("gzip")) {
      headers["content-encoding"] = "gzip";
      return new Response(gzipSync(JSON.stringify(data)), { status, headers });
    }
    return Response.json(data, { status, headers });
  };
  try {
    if (req.method === "GET") {
      const { state } = await readState(context),
        id = new URL(req.url).searchParams.get("version");
      if (id) {
        const version = state.versions.find((v) => v.id === id);
        return version
          ? response({ version: { ...version, detailLoaded: true } })
          : response({ error: "저장된 버전이 없습니다." }, 404);
      }
      return response({
        state: clientState(state),
        storage: "server",
        authConfigured: Boolean(process.env.ATLAS_ADMIN_TOKEN),
      });
    }
    if (req.method !== "POST")
      return response({ error: "허용되지 않는 메서드" }, 405);
    const expected = Buffer.from(process.env.ATLAS_ADMIN_TOKEN ?? "");
    const provided = Buffer.from(
      (req.headers.get("authorization") ?? "").replace(/^Bearer /, ""),
    );
    if (
      !expected.length ||
      provided.length !== expected.length ||
      !timingSafeEqual(provided, expected)
    )
      return response({ error: "관리자 키를 확인하세요." }, 401);
    if (
      req.headers.get("origin") &&
      req.headers.get("origin") !== new URL(req.url).origin
    )
      return response({ error: "외부 사이트 요청 거부" }, 403);
    const body = await req.text();
    if (body.length > 8000000)
      return response({ error: "입력 파일이 너무 큽니다." }, 413);
    const payload = JSON.parse(body);
    const { state, etag } = await readState(context);
    if (payload.action === "refresh") {
      const token =
        process.env.ATLAS_JOB_TOKEN ?? process.env.ATLAS_ADMIN_TOKEN;
      const res = await fetch(
        new URL("/.netlify/functions/refresh-background", req.url),
        { method: "POST", headers: { Authorization: `Bearer ${token}` } },
      );
      if (!res.ok) throw Error("수집 작업을 시작하지 못했습니다.");
      return response(
        {
          state: clientState(state),
          queued: true,
          message:
            "가격·뉴스 일정 수집을 시작했습니다. 새 전망을 자동 적용하며 이전 전망은 보존합니다.",
        },
        202,
      );
    }
    const next = transition(state, payload.action, payload);
    await saveState(next, etag, context);
    return response({ state: clientState(next) });
  } catch (e) {
    return response({ error: e.message }, 400);
  }
};
