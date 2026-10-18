// aaa7377.com 보안 머리말 맨 윗부분(모든 주소) — 올리기 묶음(package.mjs)이 _headers 맨 앞에 씀 · 새 ATLAS 네 눈 점검(t365/inspect4.mjs CIA 눈)이 이 값을 봄
//   (2026-10-12 12:41 「업데이트 할때마다 … cia방식으로」 — 점검은 회차 안(올리기 묶음이 _headers 를 쓰기 전)에 돌아 같은 값을 한 곳에 둠 · 값은 그 전과 같음)
export const HEADER_TOP = "/*\n  X-Content-Type-Options: nosniff\n  Referrer-Policy: strict-origin-when-cross-origin\n  Content-Security-Policy: default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; font-src 'self'; connect-src 'self'; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'\n  Permissions-Policy: camera=(), microphone=(), geolocation=()\n  X-Frame-Options: DENY\n";
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
/** 카카오 주소가 하나도 없는 바탕 머리말 = HEADER_TOP(늘 같음 · 한 바이트도 안 다름) */
export const BASE_TOP = HEADER_TOP;

// 고도리 카톡(사장님 2026-10-18 order-0015 [12] 2 「카카오 공유와 가입에 꼭 필요한 카카오 주소만, 열쇠가 들어온 뒤에만 더해라」) — 열쇠가 없으면 HEADER_TOP 그대로(한 바이트도 안 바뀜)
//   가입(카카오 로그인)은 서버(/api/kakao/start)가 302 로 카카오 동의 화면에 보내고 카카오가 302 로 돌려보내는 길이라 더할 주소 0
//   공유 카드(카카오 도구)는 열쇠 셋(config/atlas11/invite.json kakao: key · version · integrity)이 다 있을 때만 script-src 에 도구 주소 하나(package.mjs addInvite 가 더하는 값과 같음)
//   그 밖 카카오 주소(connect-src · form-action 등)는 켤 때 시험 서버 · 실제 폰에서 보안 규칙 위반 줄을 보고 꼭 필요한 것만 여기에 더한다(따져 보지 않고 미리 열지 않음)
export const KAKAO_CSP = Object.freeze({share: Object.freeze({'script-src': Object.freeze(['https://t1.kakaocdn.net'])}), login: Object.freeze({})});
/** 열쇠가 들어온 것만 카카오 주소를 더한 머리말 → {head, added: ['script-src https://…']} · share · login 이 모두 true 가 아니면 head === top(한 바이트도 안 다름) */
export function kakaoHeaderTop({share = false, login = false} = {}, top = HEADER_TOP) {
  let head = top;
  const added = [];
  for (const [on, rules] of [[share, KAKAO_CSP.share], [login, KAKAO_CSP.login]]) {
    if (on !== true) continue;
    for (const [dir, hosts] of Object.entries(rules)) for (const h of hosts) head = head.replace(new RegExp(`(\\b${dir} [^;\\n]*)`), m => (m.split(' ').includes(h) ? m : (added.push(`${dir} ${h}`), `${m} ${h}`)));
  }
  return {head, added};
}

// 카톡 공유 스위치(사장님 2026-10-18 16:39 「진화가 본질인 명령문」 [7] 1 · 2 · 6 · 일꾼 KB1) — 공유 열쇠가 들어온 뒤에만 올라가는 머리말에 카카오 도구 주소 하나(script-src)를 더함 = SHARE_TOP
//   공유 값 한 곳 = config/atlas11/invite.json "kakao"(config/atlas11/kakao.json share.from) — 세 칸이 다 찼나는 package.mjs addInvite 와 같은 셈 · 같은 줄 바꿈(올리는 _headers 에서 더하는 곳은 그쪽 한 번 · 두 번 더하지 않음)
//   HEADER_TOP 은 늘 바탕 그대로 둠 — 옛 새 ATLAS 네 눈 점검(t365/inspect4.mjs CIA 눈)이 이 값에서 「script-src 'self';」를 찾음(여기에 주소를 더하면 열쇠가 들어온 날 옛 쪽 회차가 막힘 · 옛 쪽 코드는 손대지 않음)
//   열쇠가 없는 오늘 = SHARE_TOP 도 HEADER_TOP 그대로(한 바이트도 안 다름 · 시험 tests/atlas11/kakao-client.test.mjs ⑳ 두 상태 · tests/atlas11/kakao.test.mjs · verify-kakao VK3)
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
export const SHARE_CONFIG_FILE = 'config/atlas11/invite.json';
/** 공유 열쇠가 들어왔나 — kakao.key · kakao.version · kakao.integrity 셋 다 있음(package.mjs addInvite 와 같은 셈) */
export const shareKeyIn = cfg => { const k = cfg?.kakao; return !!(k && k.key && k.version && k.integrity); };
/** 공유 값 파일 읽기 — 없거나 깨졌으면 null(카카오 주소를 더하지 않는 쪽으로) */
export function readShareConfig(root = ROOT) {
  try { return JSON.parse(fs.readFileSync(path.join(root, SHARE_CONFIG_FILE), 'utf8')); } catch { return null; }
}
/** 공유 값에 맞춘 올라가는 머리말 맨 윗부분(시험이 두 상태를 맞대 봄) */
export const headerTopFor = cfg => kakaoHeaderTop({share: shareKeyIn(cfg)}, HEADER_TOP).head;
export const SHARE_KEY = shareKeyIn(readShareConfig());
/** 지금 저장소 값으로 올라가는 머리말 맨 윗부분 — 열쇠가 없는 오늘은 HEADER_TOP 과 한 바이트도 같음 */
export const SHARE_TOP = headerTopFor(readShareConfig());
