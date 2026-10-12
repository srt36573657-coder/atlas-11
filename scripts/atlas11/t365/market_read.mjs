// 새 ATLAS 시장 판독 — 사장님 2026-10-12 12:41 「10시 12시 14시 18시 업데이틀 하라 시장을 판독해서 말이다」
//   업데이트(회차)마다 그 회차가 올리는 자료(core · lines)만 읽어 「지금 시장은 이렇다」를 쉬운 말 몇 줄로 적음
//   지난 사실만 — 앞날 맞히기 · 사고팔기 말 없음(규칙 49 · 안전 문장) · 말은 미리 정한 문턱(판독 규칙 mr-v1)으로만 고름
//   판독 규칙 mr-v1:
//     하루 = 마지막 거래일 하루(lines 의 마지막 두 칸) · 오른 곳 ÷ (오른 곳 + 내린 곳) 이 65% 이상 「넓게 오른 날」 · 35% 이하 「넓게 내린 날」 · 그 사이 「오른 곳 · 내린 곳이 섞인 날」
//     20거래일 = 기준일 → 고른 날(core.all) · 같은 문턱으로 「넓게 오름 · 넓게 내림 · 섞임」
//     크기 = 「한 회사 한 표」 − 「큰 회사는 크게」 가 3%p 이상이면 작은 · 중간 회사 쪽, −3%p 이하면 큰 회사 쪽(더 오름 · 덜 내림) · 그 사이 「크기와 상관없이 비슷」
//     갈래 = 20거래일 가장 센 · 가장 약한 큰 갈래(9) · 방향 · 세기 · 힘 말은 화면과 같은 셈(site_build.py trend())
//     앞 회차와 견줌 = 앞 회차 판독이 있으면 하루 오른 곳 수 · 1등 갈래가 바뀌었나
//   숫자는 따로 세기 — inspect4.mjs 구글 눈 「시장 판독 다시 세기」가 다른 길로 다시 셈
import fs from 'node:fs';
import path from 'node:path';

export const MR_RULE = {id: 'mr-v1', wide: 0.65, narrow: 0.35, size: 3};
const TR_WORD = {up: '오름', down: '내림', flat: '옆걸음'};
/** 화면(atlas.js trText)과 같은 말 */
export const trText = t => (!t ? '' : (t.d === 'up' ? '▲ ' : t.d === 'down' ? '▼ ' : '▶ ') + (t.s === 'strong' ? '강하게 ' : '') + TR_WORD[t.d] + (t.t === 'gain' ? ' · 힘 붙음' : t.t === 'fade' ? ' · 힘 빠짐' : ''));
/** 화면(atlas.js pct)과 같은 꼴 — +1.2% · −3.4% · 값 없음은 ? */
export const pctText = x => { if (x == null || !isFinite(x)) return '?'; const v = Math.round(x * 10) / 10, a = Math.abs(v); return (v > 0 ? '+' : v < 0 ? '−' : '') + (a >= 100 ? Math.floor(a + 0.5 + 1e-7).toLocaleString('ko-KR') : a.toFixed(1)) + '%'; };
const DOW = ['일', '월', '화', '수', '목', '금', '토'];
export const mdText = d => { const x = new Date(d + 'T00:00:00Z'); return `${+d.slice(5, 7)}월 ${+d.slice(8, 10)}일(${DOW[x.getUTCDay()]})`; };
export const breadthWord = (up, down, kind = 'day') => { const n = up + down; if (!n) return '?'; const s = up / n;
  return s >= MR_RULE.wide ? (kind === 'day' ? '넓게 오른 날' : '넓게 오름') : s <= MR_RULE.narrow ? (kind === 'day' ? '넓게 내린 날' : '넓게 내림') : (kind === 'day' ? '오른 곳 · 내린 곳이 섞인 날' : '오른 곳 · 내린 곳이 섞임'); };
export const sizeWord = (eq, cw) => { if (eq == null || cw == null) return '?'; const gap = eq - cw;
  if (gap >= MR_RULE.size) return eq >= 0 ? '작은 · 중간 회사 쪽이 더 오름' : '작은 · 중간 회사 쪽이 덜 내림';
  if (gap <= -MR_RULE.size) return cw >= 0 ? '큰 회사 쪽이 더 오름' : '큰 회사 쪽이 덜 내림';
  return '회사 크기와 상관없이 비슷'; };

/** 하루 오르내림 — 회사마다 마지막 두 칸(lines · 기준일 = 10000)으로 셈 · 두 칸 중 하나라도 없으면 셈에서 뺌 */
export function dayCount(lines) {
  let up = 0, down = 0, flat = 0, none = 0;
  for (const L of Object.values(lines)) { const a = L.at(-2), b = L.at(-1); if (a == null || b == null || !a) { none++; continue; } if (b > a) up++; else if (b < a) down++; else flat++; }
  return {up, down, flat, none};
}

/** 때 말 — 「장 중」은 서울 정규장(9:00 ~ 15:30)에 고른 날 값을 받았을 때만 · 그 밖에 아직 바뀌는 값은 「저녁 8시 전 값」(2026-10-12 16:48 회차: 장 끝 뒤에도 「장 중 값」이라 적던 것) */
export const whenWord = (provisional, asOf, now) => { if (!provisional) return '마감 값'; const t = now ? new Date(now.getTime() + 9 * 36e5).toISOString() : '';
  return t.slice(0, 10) === asOf && t.slice(11, 16) >= '09:00' && t.slice(11, 16) < '15:30' ? '장 중 값(아직 바뀜)' : '저녁 8시 전 값(아직 바뀜)'; };

/** dataDir = 그 회차가 올리는 자료 폴더(core.json · lines.json) · prev = 앞 회차 판독(없으면 null) · now = 그 회차 때(때 말) */
export function readMarket(dataDir, prev = null, now = null) {
  const J = f => JSON.parse(fs.readFileSync(path.join(dataDir, f), 'utf8'));
  const core = J('core.json'), lines = J('lines.json').lines;
  const day = dayCount(lines), A = core.all, v = A.v ?? [], cw = A.cw ?? [];
  const dayAvg = v.length > 1 && v.at(-2) ? Math.round((v.at(-1) / v.at(-2) - 1) * 10000) / 100 : null;
  const dayCw = cw.length > 1 && cw.at(-2) ? Math.round((cw.at(-1) / cw.at(-2) - 1) * 10000) / 100 : null;
  const gs = [...core.groups].filter(g => g.chg != null).sort((a, b) => b.chg - a.chg);
  const top = gs[0] ?? null, low = gs.at(-1) ?? null;
  const gUp = core.groups.filter(g => g.chg > 0).length, gDown = core.groups.filter(g => g.chg < 0).length;
  const gain = core.groups.filter(g => g.tr?.t === 'gain').map(g => g.short), fade = core.groups.filter(g => g.tr?.t === 'fade').map(g => g.short);
  const out = {schema: 'atlas-market-read-1', rule: MR_RULE.id, asOf: core.asOf, base: core.base, days: core.days, provisional: !!core.provisional,
    day: {date: core.asOf, prev: core.dates?.at(-2) ?? null, ...day, avg: dayAvg, cw: dayCw, word: breadthWord(day.up, day.down, 'day')},
    span: {up: A.up, down: A.down, flat: A.flat ?? 0, chg: A.chg, cwChg: A.cwChg, word: breadthWord(A.up, A.down, 'span'), size: sizeWord(A.chg, A.cwChg)},
    groups: {n: core.groups.length, up: gUp, down: gDown, gain, fade,
      top: top && {id: top.id, short: top.short, chg: top.chg, tr: trText(top.tr)}, low: low && {id: low.id, short: low.short, chg: low.chg, tr: trText(low.tr)}},
    vsPrev: null, lines: []};
  if (prev?.day && prev.asOf) out.vsPrev = {asOf: prev.asOf, dayUp: prev.day.up, topSame: (prev.groups?.top?.id ?? null) === (top?.id ?? null), prevTop: prev.groups?.top?.short ?? null};
  // 쉬운 말 — 줄마다 숫자 하나 이상 · 지난 사실만
  const when = `${mdText(core.asOf)} ${whenWord(!!core.provisional, core.asOf, now)}`;
  out.lines.push(`${when} — 365곳 가운데 ${day.up}곳 오름 · ${day.down}곳 내림 → ${out.day.word}`);
  out.lines.push(`${core.days}거래일(${mdText(core.base)}부터) — 한 회사 한 표 ${pctText(A.chg)} · 큰 회사는 크게 ${pctText(A.cwChg)} → ${out.span.size}`);
  if (top && low) out.lines.push(`가장 센 갈래 ${top.short} ${pctText(top.chg)}${top.tr ? `(${trText(top.tr)})` : ''} · 가장 약한 갈래 ${low.short} ${pctText(low.chg)}`);
  if (out.vsPrev) out.lines.push(out.vsPrev.asOf === core.asOf && out.vsPrev.dayUp === day.up && out.vsPrev.topSame ? '앞 회차와 같은 값입니다.'
    : `앞 회차(${mdText(out.vsPrev.asOf)})와 견줌 — 하루 오른 곳 ${out.vsPrev.dayUp}곳 → ${day.up}곳 · 1등 갈래 ${out.vsPrev.topSame ? '그대로 ' + (top?.short ?? '?') : (out.vsPrev.prevTop ?? '?') + ' → ' + (top?.short ?? '?')}`);
  return out;
}
