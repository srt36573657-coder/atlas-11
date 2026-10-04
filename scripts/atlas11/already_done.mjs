#!/usr/bin/env node
/**
 * 예비 예약(16:37 · 17:07 KST)이 같은 날 일을 두 번 하지 않게 거르는 문.
 *   GitHub 예약은 매시 정각 부근에 몰리면 늦거나 빠질 수 있어(공식 문서) 예약을 여러 번 걸어 두었다.
 *   오늘 실행이 이미 끝났으면(52종목 확정 · 정상 종료 또는 휴장 기록) skip=true 를 내보낸다. 손으로 시작한 실행은 거르지 않는다(워크플로에서 schedule 일 때만 부름).
 *   출력: GITHUB_OUTPUT 형식 두 줄(skip=…, reason=…)
 */
import fs from 'node:fs/promises';
import path from 'node:path';

const koreaDay = at => new Date(Date.parse(at) + 9 * 3600000).toISOString().slice(0, 10);

export function alreadyDone(latest, now = new Date().toISOString()) {
  const today = koreaDay(now);
  if (!latest || latest.dayKST !== today) return {skip: false, reason: '오늘 실행 기록 없음'};
  if (latest.session === false && latest.status === 'complete') return {skip: true, reason: '휴장일 기록 이미 있음'};
  // 2026-10-04 예측을 지운 뒤로는 발행본이 없다 — 52곳 종가가 다 모이고 정상 종료면 오늘 일은 끝난 것
  if (latest.status === 'complete' && latest.exitCode === 0 && latest.confirmedTodayStocks === 52) return {skip: true, reason: `오늘 실행 완료(${latest.at} · 52/52)`};
  return {skip: false, reason: `오늘 앞선 실행이 끝나지 않음(${latest.status ?? '상태 없음'} · 종료코드 ${latest.exitCode ?? '—'} · 확정 ${latest.confirmedTodayStocks ?? '—'}/52)`};
}

if (process.argv[1] && path.resolve(process.argv[1]) === new URL(import.meta.url).pathname) {
  let latest = null; try { latest = JSON.parse(await fs.readFile(path.join(process.cwd(), 'reports/atlas11/operations/latest.json'), 'utf8')); } catch {}
  const r = alreadyDone(latest);
  console.log(`skip=${r.skip}`); console.log(`reason=${r.reason.replace(/\n/g, ' ')}`);
}
