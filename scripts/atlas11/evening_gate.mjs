/**
 * ATLAS 11 · 저녁 기록 문지기(atlas11-evening 첫 단계) — GITHUB_OUTPUT 꼴로 skip=true|false · reason=… 를 찍는다
 *   2026-10-05 05:03 사장님 「매일 … 저녁 7시에 … 여러 주건들에 이동이 내영되게 하라」 · 05:07 「해」
 *   예약(19:00) · 매일 실행이 끝난 뒤(workflow_run)에는: 지금 판 종가 날짜의 저녁 기록이 이미 있거나, 그 날짜의 저녁 7시 전이면 아무것도 하지 않는다
 *   손으로 누른 실행(workflow_dispatch)은 늘 돈다(기록은 같은 규칙으로만 — 이미 있으면 그대로 · 저녁 7시 전이면 남기지 않음)
 *   node scripts/atlas11/evening_gate.mjs --event schedule|workflow_run|workflow_dispatch [--now ISO]
 */
import {buildViewFiles, eveningState} from './build_view.mjs';

const arg = name => { const i = process.argv.indexOf(name); return i < 0 ? null : process.argv[i + 1]; };
const now = arg('--now') ?? new Date().toISOString(), event = arg('--event') ?? 'workflow_dispatch';
let skip = false, reason;
try {
  const st = await eveningState(await buildViewFiles({now}), now);
  if (event === 'workflow_dispatch') reason = `손으로 시작한 실행 · 종가 ${st.asOf} · 기록 ${st.exists ? '있음(그대로 둠)' : st.ready ? '없음(남김)' : '저녁 7시 전(남기지 않음)'}`;
  else if (st.exists) { skip = true; reason = `${st.asOf} 저녁 기록이 이미 있음(${st.file})`; }
  else if (!st.ready) { skip = true; reason = `${st.asOf} 저녁 7시 전 · 기록은 저녁 7시 뒤 실행이 남김`; }
  else reason = `${st.asOf} 저녁 기록 없음 · 남김`;
} catch (e) { reason = `판을 읽지 못함(${e.message}) · 실행은 계속`; }
console.log(`skip=${skip}`);
console.log(`reason=${String(reason).replace(/\n/g, ' ')}`);
