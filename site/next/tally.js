/* 합계 칸 신호 한 곳(사장님 2026-10-18(싱가포르) 16:39 「진화가 본질인 명령문」 [10] 1 ~ 3 · 일꾼 KD) — 서버 /api/tally(lib/atlas11/tally.mjs)
   tally(k) = 날마다 합계에 하나 더해 달라는 신호 한 번 · 보내고 기다리지 않음(화면을 막지 않음 · 실패해도 아무 일 없음)
   k = stop(매매일지 끝냄) · stop_rest(끝냄 + 「오늘은 쉬어 가자」) · promise(한 달 답) · promise_yes(한 달 답 + 「했어」) · 참고만: visit(쪽 열기 · 쪽마다 한 번) · share(보내기 마침) · signup(가입 마침)
   보내는 몸 = {k} 하나 — 이름 · 기기 번호 · 종목 · 답 · 화면 주소 없음 · 쿠키 안 보냄(credentials omit) · 주소 안 넘김(no-referrer)
   자동으로 움직이는 브라우저(navigator.webdriver — 검사 · 봇)는 보내지 않음 — 실제 사이트를 도는 검사가 잣대를 부풀리지 않게
   (검사가 신호를 볼 때만 쪽을 열기 전에 globalThis.__kkTally = 'test' — 그때도 /api/tally 를 검사 안에서 받아 버림 · check_jinhwa.mjs) */
const OK = new Set(['stop', 'stop_rest', 'promise', 'promise_yes', 'visit', 'share', 'signup']);
let visited = false;
/** 신호 한 번 — 보냈으면 true(받았는지는 모름) · 안 보냈으면 false */
export function tally(k) {
  try {
    if (!OK.has(k)) return false;
    if (navigator.webdriver && globalThis.__kkTally !== 'test') return false;
    if (k === 'visit') { if (visited) return false; visited = true; }
    const body = JSON.stringify({k});
    if (typeof fetch === 'function') {
      fetch('/api/tally', {method: 'POST', body, headers: {'content-type': 'application/json'}, keepalive: true, credentials: 'omit', cache: 'no-store', referrerPolicy: 'no-referrer'}).catch(() => {});
      return true;
    }
    return typeof navigator.sendBeacon === 'function' ? navigator.sendBeacon('/api/tally', body) : false;
  } catch { return false; }
}
