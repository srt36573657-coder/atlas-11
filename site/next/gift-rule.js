/* 상품권 앞 「우주 영상 1분」 셈(화면 없음 · 시험이 그대로 부름) — 사장님 2026-10-22(서울) 01:49 · 01:59 「맞아」
   「상품권 받을따 다봐야 줄거야 … 마오는영상 1붘을 봐야 그게 정당해 그게 고지 해야고 그약솓 지켜야 상품권 받기 그때 나오게 해 … 사람들에 1분 우리에게 투자하는것 서로 존중해야 잖아」
   (명령문 원문 docs/design/gift-2026-10-22/order-0149.txt)
   · 본 초 = 브라우저가 적어 두는 「실제로 틀어진 구간」(video.played)의 길이 합 — 건너뛴 곳은 들어가지 않음 · 느린 휴대폰에서 시간 알림이 늦어도 빠지지 않음
   · 앞으로 건너뛰기는 「처음부터 이어서 본 데」(reachOf)보다 0.5초 넘게 앞이면 그 자리로 되돌림 · 빨리 감기는 1배로 되돌림(hello-gift.js)
   · 「상품권 받기」 = 끝까지 흘러 끝났고(ended) · 본 초가 영상 길이(60초)에서 1.5초 모자란 것까지
   · 끝까지 본 기기는 이 기기 안에만 「봤음」 날짜 한 줄(GIFT.key · 서버로 보내지 않음 · 개인정보 처리방침에 적음) — 다시 와도 또 보지 않게(1분을 두 번 받지 않음) */
export const GIFT = Object.freeze({need: 60, slack: 1.5, key: 'atlas:gift:seen'});

/** 틀어진 구간들(TimeRanges 꼴 — length · start(i) · end(i))의 길이 합(초) · 겹친 곳은 한 번만 */
export function playedOf(tr) {
  const xs = [];
  for (let i = 0; i < (tr?.length ?? 0); i++) { const a = Number(tr.start(i)), b = Number(tr.end(i)); if (Number.isFinite(a) && Number.isFinite(b) && b > a) xs.push([a, b]); }
  xs.sort((p, q) => p[0] - q[0]);
  let s = 0, cur = null;
  for (const [a, b] of xs) { if (!cur || a > cur[1]) { if (cur) s += cur[1] - cur[0]; cur = [a, b]; } else cur[1] = Math.max(cur[1], b); }
  return cur ? s + cur[1] - cur[0] : 0;
}

/** 처음부터 끊김 없이 이어서 본 데(초) — 0.5초 안에서 시작한 구간부터 이어 붙임 */
export function reachOf(tr) {
  const xs = [];
  for (let i = 0; i < (tr?.length ?? 0); i++) xs.push([Number(tr.start(i)), Number(tr.end(i))]);
  xs.sort((p, q) => p[0] - q[0]);
  let r = 0;
  for (const [a, b] of xs) { if (a <= r + 0.5) r = Math.max(r, b); else break; }
  return r;
}

/** 다 봤나 — 본 초 · 영상 길이(초 · 모르면 60) · 끝났나 */
export function done(watched, duration, ended) {
  const len = Number.isFinite(duration) && duration > 0 ? Math.min(duration, GIFT.need) : GIFT.need;
  return ended === true && watched >= len - GIFT.slack;
}

/** 건너뛰기 막음 — 가려는 자리 to 가 이어서 본 데(far)보다 0.5초 넘게 앞이면 본 데로 되돌림 */
export const clampSeek = (to, far) => (Number(to) > Number(far) + 0.5 ? Number(far) : Number(to));

/** 아래 줄 글(쉬운 말) — 본 초 s */
export function sayLeft(s) {
  const n = Math.max(0, Math.min(GIFT.need, Math.floor(Number(s) || 0)));
  return n <= 0 ? '아직 안 봤어요. 60초를 끝까지 봐 주세요.' : n >= GIFT.need ? '끝까지 다 봤어요.' : `${n}초 봤어요. ${GIFT.need - n}초 남았어요.`;
}
