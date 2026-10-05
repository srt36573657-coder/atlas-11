#!/usr/bin/env node
/**
 * ATLAS 11 · 「aaa7377.com 올리기」 결과 한 줄 — 깃허브 실행 화면 맨 위 요약 칸에 쉬운 말로 적는다
 *   2026-10-05 10:24 사장님 「https://github.com/srt36573657-coder/atlas-11/actions/workflows/atlas11-site.yml 나 여기서 클릭하면 업로드되게 만들어 줘」
 *   node scripts/atlas11/site_summary.mjs --since <ISO> --deploy <success|failure|skipped|''> --token <yes|no>
 * 읽는 것: reports/atlas11/operations/deploy-latest.json(이번 실행에서 쓴 것만 믿는다 — 「at」이 --since 보다 늦어야) · netlify-status.json · 화면 판 manifest
 * 요약을 못 써도 실행 결과는 바꾸지 않는다(종료 코드 0)
 */
import fs from 'node:fs/promises';

const arg = n => { const i = process.argv.indexOf(n); return i < 0 ? null : process.argv[i + 1]; };
const since = Date.parse(arg('--since') ?? '') || 0, deployOutcome = arg('--deploy') || 'skipped', token = arg('--token') === 'yes';
const read = async f => { try { return JSON.parse(await fs.readFile(f, 'utf8')); } catch { return null; } };
/** 「2026년 10월 5일 10:31」(한국 시각) */
export const kstText = iso => { const t = Date.parse(iso); if (!Number.isFinite(t)) return '시각 모름'; const d = new Date(t + 9 * 3600e3); return `${d.getUTCFullYear()}년 ${d.getUTCMonth() + 1}월 ${d.getUTCDate()}일 ${String(d.getUTCHours()).padStart(2, '0')}:${String(d.getUTCMinutes()).padStart(2, '0')}`; };

export function summaryLines({dep, st, man, since, deployOutcome, token}) {
  const fresh = Boolean(dep) && Date.parse(dep.at) >= since;
  if (!token) return ['## 못 올렸습니다', '', '- 까닭: 넷리파이 열쇠(NETLIFY_AUTH_TOKEN)가 이 저장소 비밀 칸에 없습니다', '- 화면은 그대로입니다(aaa7377.com 은 앞에 올린 것)'];
  if (fresh && dep.state === 'ready' && dep.exitCode === 0 && deployOutcome === 'success') {
    const out = ['## 올라갔습니다', '', `- 주소: ${dep.url}`, `- 올린 때: ${kstText(dep.at)} (한국 시각)`, `- 올린 파일: ${dep.files}개`];
    if (man) out.push(`- 화면 판: ${man.universeSet?.label ?? `${man.companies}곳`} · ${man.asOf} 종가`);
    if (st?.api?.published) out.push(`- 넷리파이: ${st.api.published === 'ready' ? '열림' : st.api.published}${st.api.customDomain ? ` · ${st.api.customDomain}` : ''}`);
    out.push('', '휴대폰에서 aaa7377.com 을 새로 고침하면 바로 보입니다.');
    return out;
  }
  const why = fresh ? (dep.error ?? `넷리파이 상태 「${dep.state}」`) : '올리기 단계가 끝나지 못했습니다(아래 「aaa7377.com 에 올리기」 단계를 눌러 보면 까닭이 있습니다)';
  return ['## 못 올렸습니다', '', `- 까닭: ${why}`, '- 화면은 그대로입니다(aaa7377.com 은 앞에 올린 것)', '- 다시 하려면: 앞 화면에서 「Run workflow」를 한 번 더 누릅니다'];
}

if (process.argv[1] && new URL(import.meta.url).pathname === (await fs.realpath(process.argv[1]).catch(() => process.argv[1]))) {
  const [dep, st, man] = await Promise.all(['reports/atlas11/operations/deploy-latest.json', 'reports/atlas11/operations/netlify-status.json', 'public/data/atlas11/view/manifest.json'].map(read));
  const text = summaryLines({dep, st, man, since, deployOutcome, token}).join('\n') + '\n';
  try { if (process.env.GITHUB_STEP_SUMMARY) await fs.appendFile(process.env.GITHUB_STEP_SUMMARY, text); } catch {}
  console.log(text);
}
