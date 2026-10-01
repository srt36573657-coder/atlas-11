/**
 * W6 · T10 — 시험 계획(plan.md)을 결과 파일(part*.json)보다 먼저, 혼자 커밋했는가 (명령서 6판 14절 T10 · 17절 F3)
 *   node scripts/atlas11/overhaul/check.mjs --step W6
 * 통과 = plan.md를 처음 더한 커밋이 있고, 그 커밋에 plan.md만 들어 있고,
 *        part*.json을 처음 더한 커밋이 없거나(아직 결과 없음) 그 커밋보다 시각이 이르고 조상이다.
 * 결함 심기: 결과 커밋 시각을 plan 커밋보다 1초 앞으로 바꾼 가짜 기록을 넣으면 판정이 실패해야 한다.
 */
import {execFileSync} from 'node:child_process';

const PLAN = 'reports/atlas11/overhaul/plan.md';
const PARTS = 'reports/atlas11/overhaul/part*.json';

export function t10Verdict(plan, firstPart, ancestor = true) {
  if (!plan) return {pass: false, why: 'plan.md 커밋이 없다'};
  if (!plan.alone) return {pass: false, why: 'plan.md 커밋에 다른 파일이 같이 있다'};
  if (!firstPart) return {pass: true, why: '결과 파일 커밋이 아직 없다(계획 먼저)'};
  if (!(plan.time < firstPart.time)) return {pass: false, why: 'plan 커밋 시각이 첫 결과 커밋보다 늦거나 같다'};
  if (!ancestor) return {pass: false, why: 'plan 커밋이 첫 결과 커밋의 조상이 아니다'};
  return {pass: true, why: 'plan 커밋 시각 < 첫 결과 커밋 시각 · 조상'};
}

export default async function W6({report, ROOT}) {
  const git = args => execFileSync('git', args, {cwd: ROOT, encoding: 'utf8'}).trim();
  const rows = spec => git(['log', '--reverse', '--diff-filter=A', '--format=%H %ct %cI', '--', spec]).split('\n').filter(Boolean).map(l => { const [hash, ct, iso] = l.split(' '); return {hash, time: Number(ct), iso}; });
  const planRow = rows(PLAN)[0] ?? null;
  const plan = planRow ? {...planRow, files: git(['show', '--format=', '--name-only', planRow.hash]).split('\n').filter(Boolean)} : null;
  if (plan) plan.alone = plan.files.length === 1 && plan.files[0] === PLAN;
  const firstPart = rows(PARTS)[0] ?? null;
  let ancestor = true;
  if (plan && firstPart) { try { execFileSync('git', ['merge-base', '--is-ancestor', plan.hash, firstPart.hash], {cwd: ROOT}); } catch { ancestor = false; } }
  const untracked = git(['ls-files', '--others', '--exclude-standard', '--', PARTS]).split('\n').filter(Boolean);
  const v = t10Verdict(plan, firstPart, ancestor);
  report('T10', v.pass, {why: v.why, plan: plan && {commit: plan.hash.slice(0, 7), at: plan.iso, files: plan.files}, firstPart: firstPart && {commit: firstPart.hash.slice(0, 7), at: firstPart.iso}, uncommittedPartFiles: untracked});
  // 결함 심기(10절): 결과 커밋이 plan보다 1초 앞선 가짜 기록 → 막혀야 한다
  const fakePlan = plan ?? {time: 1000, alone: true};
  const planted = t10Verdict(fakePlan, {time: fakePlan.time - 1}, true);
  const plantedSame = t10Verdict(fakePlan, {time: fakePlan.time}, true);
  const plantedNotAlone = t10Verdict({...fakePlan, alone: false}, null, true);
  report('inject:T10', !planted.pass && !plantedSame.pass && !plantedNotAlone.pass, {planted: ['결과 커밋 시각 = plan − 1초', '결과 커밋 시각 = plan 시각', 'plan 커밋에 다른 파일'], caught: [!planted.pass, !plantedSame.pass, !plantedNotAlone.pass]});
}
