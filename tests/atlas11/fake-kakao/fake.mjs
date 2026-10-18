/**
 * 가짜 카카오 — 시험(tests/atlas11/kakao.test.mjs)과 시험 서버(scripts/atlas11/invite_dev.mjs --fake-kakao)만 씀 · 진짜 카카오로 가는 요청 0
 *   카카오 로그인 REST 길을 흉내(2026-10-18 order-0015 [3] 9 「가짜 카카오 서버로 여섯 길을 시험하라」 · [11] 2 · 5)
 *   GET  <prefix>/oauth/authorize   동의 화면 한 장(누름 한 번 「동의하고 계속하기」 · 「취소」) — prompt=none 이면 화면 없이 바로 돌려보냄
 *                                   (카카오 계정 로그인 + 이 앱 동의가 있으면 code · 로그인 없음 login_required · 동의 없음 consent_required)
 *   GET  <prefix>/oauth/agree?k=    「동의하고 계속하기」 — 새 카카오 사람이면 회원 번호를 만들고 동의 표시 · code 와 함께 돌아올 주소로
 *   GET  <prefix>/oauth/deny?k=     「취소」 — error=access_denied
 *   POST <prefix>/oauth/token       code → 증표(앱 열쇠 · 클라이언트 시크릿 · 돌아올 주소 맞대기 · code 한 번만)
 *   GET  <prefix>/v1/user/access_token_info  증표 → {id, expires_in, app_id}
 *   POST <prefix>/v1/user/logout    증표 무효 · POST <prefix>/v1/user/unlink  어드민 열쇠(KakaoAK) + target_id 또는 증표 → 동의 지움
 *   GET  <prefix>/v2/user/me        프로필(우리 서버는 부르면 안 됨 — 부르면 calls 에 남아 시험이 잡음)
 *   카카오 계정 로그인 상태 = 쿠키 fk_user(가짜 쪽에만) 또는 시험이 넘기는 머리글 x-fake-user
 *   화면에 「가짜 카카오 · 시험용」을 늘 적음(60초 시연 영상 [11] 5 「가짜 카카오로 찍었다고 화면에 적어라」)
 */
import {randomBytes} from 'node:crypto';

export function createFakeKakao({restKey, clientSecret, adminKey, prefix = '', firstId = 4200000001, appId = 1234567} = {}) {
  const users = new Map(), tickets = new Map(), codes = new Map(), tokens = new Map(), calls = [], unlinked = [];
  let nextId = firstId;
  const rnd = n => randomBytes(n).toString('base64url');
  const json = (status, body) => new Response(JSON.stringify(body), {status, headers: {'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store'}});
  const back = (redirectUri, params, cookies = []) => {
    const u = new URL(redirectUri);
    for (const [k, v] of Object.entries(params)) if (v != null) u.searchParams.set(k, v);
    const h = new Headers({Location: u.href, 'Cache-Control': 'no-store'});
    for (const c of cookies) h.append('Set-Cookie', c);
    return new Response(null, {status: 302, headers: h});
  };
  const esc = s => String(s).replace(/[&<>"']/g, ch => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[ch]));
  const page = (status, title, inner) => new Response(`<!doctype html><html lang="ko"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(title)}</title>
<style>body{margin:0;padding:24px 16px;background:#fee500;color:#191919;font:21px/1.5 system-ui,-apple-system,"Apple SD Gothic Neo","Noto Sans KR",sans-serif}
.tag{display:inline-block;padding:8px 16px;background:#191919;color:#fee500;border-radius:8px;font-size:18px;font-weight:700}
h1{font-size:26px;margin:24px 0 16px}p{margin:0 0 16px}
a.btn{display:flex;align-items:center;justify-content:center;min-height:56px;margin:16px 0;border-radius:12px;font-size:22px;font-weight:700;text-decoration:none}
#agree{background:#191919;color:#fff}#deny{background:#fff;color:#191919;border:2px solid #191919}</style></head>
<body><p class="tag">가짜 카카오 · 시험용 화면(진짜 카카오 아님)</p>${inner}</body></html>`, {status, headers: {'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store'}});
  const userOf = req => { const h = req.headers.get('x-fake-user'); if (h) return h; return /(?:^|;\s*)fk_user=(\d+)/.exec(req.headers.get('cookie') ?? '')?.[1] ?? null; };
  const newUser = () => { const id = String(nextId++); users.set(id, {consented: false}); return id; };
  const issue = (id, redirect_uri) => { const code = rnd(32); codes.set(code, {id, redirect_uri, used: false}); return code; };
  const bearer = auth => (auth.startsWith('Bearer ') ? tokens.get(auth.slice(7)) : null);

  async function handle(req) {
    const url = new URL(req.url);
    let path = url.pathname;
    if (prefix && path.startsWith(prefix)) path = path.slice(prefix.length);
    const q = Object.fromEntries(url.searchParams);
    const f = req.method === 'POST' ? Object.fromEntries(new URLSearchParams(await req.text())) : {};
    const auth = req.headers.get('authorization') ?? '';
    calls.push({method: req.method, path, query: q, form: f, auth: auth.startsWith('Bearer ') ? 'bearer' : auth.startsWith('KakaoAK ') ? 'kakaoak' : null, at: Date.now()});

    if (path === '/oauth/authorize' && req.method === 'GET') {
      if (q.client_id !== restKey) return page(400, '앱 열쇠가 틀림', '<h1>KOE101 앱 열쇠가 틀렸어요</h1>');
      if (q.response_type !== 'code' || !q.redirect_uri) return page(400, '요청이 틀림', '<h1>KOE010 요청이 틀렸어요</h1>');
      const who = userOf(req), u = who ? users.get(who) : null;
      if (q.prompt === 'none') {
        if (!u) return back(q.redirect_uri, {error: 'login_required', error_description: 'user authentication required.', state: q.state});
        if (!u.consented) return back(q.redirect_uri, {error: 'consent_required', error_description: 'user consent required.', state: q.state});
        return back(q.redirect_uri, {code: issue(who, q.redirect_uri), state: q.state});
      }
      const k = rnd(16);
      tickets.set(k, {redirect_uri: q.redirect_uri, state: q.state ?? null});
      return page(200, '가짜 카카오 — 동의 화면', `<h1>이 서비스를 카카오로 시작할까요?</h1><p>받는 정보: 카카오 회원 번호 하나</p>
<a class="btn" id="agree" href="${esc(prefix)}/oauth/agree?k=${k}">동의하고 계속하기</a>
<a class="btn" id="deny" href="${esc(prefix)}/oauth/deny?k=${k}">취소</a>`);
    }
    if ((path === '/oauth/agree' || path === '/oauth/deny') && req.method === 'GET') {
      const tk = tickets.get(q.k);
      if (!tk) return page(400, '시간이 지남', '<h1>다시 시작해 주세요</h1>');
      tickets.delete(q.k);
      if (path === '/oauth/deny') return back(tk.redirect_uri, {error: 'access_denied', error_description: 'User denied access', state: tk.state});
      let who = userOf(req);
      if (!who || !users.has(who)) who = newUser();
      users.get(who).consented = true;
      return back(tk.redirect_uri, {code: issue(who, tk.redirect_uri), state: tk.state}, [`fk_user=${who}; Path=${prefix || '/'}; HttpOnly; SameSite=Lax`]);
    }
    if (path === '/oauth/token' && req.method === 'POST') {
      if (f.grant_type !== 'authorization_code') return json(400, {error: 'unsupported_grant_type', error_code: 'KOE310'});
      if (f.client_id !== restKey) return json(401, {error: 'invalid_client', error_code: 'KOE101'});
      if (clientSecret && f.client_secret !== clientSecret) return json(401, {error: 'invalid_client', error_code: 'KOE010'});
      const c = codes.get(f.code);
      if (!c || c.used) return json(400, {error: 'invalid_grant', error_code: 'KOE320'});
      if (c.redirect_uri !== f.redirect_uri) return json(400, {error: 'invalid_grant', error_code: 'KOE303'});
      c.used = true;
      const access = rnd(40), refresh = rnd(40);
      tokens.set(access, {id: c.id, live: true, refresh});
      return json(200, {token_type: 'bearer', access_token: access, expires_in: 21599, refresh_token: refresh, refresh_token_expires_in: 5183999});
    }
    if (path === '/v1/user/access_token_info' && req.method === 'GET') {
      const tk = bearer(auth);
      if (!tk?.live) return json(401, {msg: 'this access token does not exist', code: -401});
      return json(200, {id: Number(tk.id), expires_in: 21599, app_id: appId});
    }
    if (path === '/v1/user/logout' && req.method === 'POST') {
      const tk = bearer(auth);
      if (!tk?.live) return json(401, {msg: 'this access token does not exist', code: -401});
      tk.live = false;
      return json(200, {id: Number(tk.id)});
    }
    if (path === '/v1/user/unlink' && req.method === 'POST') {
      let id = null;
      if (auth === 'KakaoAK ' + adminKey) { if (f.target_id_type === 'user_id') id = f.target_id; }
      else { const tk = bearer(auth); if (tk?.live) id = tk.id; else return json(401, {msg: 'wrong appKey or token', code: -401}); }
      const u = id ? users.get(id) : null;
      if (!u || !u.consented) return json(400, {msg: 'NotRegisteredUserException', code: -101});
      u.consented = false;
      for (const t of tokens.values()) if (t.id === id) t.live = false;
      unlinked.push(id);
      return json(200, {id: Number(id)});
    }
    if (path === '/v2/user/me') { const tk = bearer(auth); return tk?.live ? json(200, {id: Number(tk.id), properties: {nickname: '가짜'}}) : json(401, {code: -401}); }
    return json(404, {msg: 'fake kakao: no such path', code: -1});
  }

  return {
    handle,
    fetch: (u, init) => handle(new Request(u, init)),
    users, codes, tokens, calls, unlinked,
    /** 시험: 이 사람이 카카오 계정에 로그인해 있고 이 앱에 동의함(다시 온 사람) */
    seed(id, {consented = true} = {}) { users.set(String(id), {consented}); return String(id); },
  };
}
