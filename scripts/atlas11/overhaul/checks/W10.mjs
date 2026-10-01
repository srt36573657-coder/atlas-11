/**
 * W10 · 판정표·틀린 42칸 검사 — diagnosis.json 이 다섯 줄을 모두 갖췄는가, 42칸 셈이 w10-against.json 과 같은가(명령서 6판 R6·R7·T15)
 *   node scripts/atlas11/overhaul/check.mjs --step W10
 */
import fs from 'node:fs';

const VERDICTS = ['원인이다', '아니다', '모른다'];
export function tableProblems(table, exists) {
  const out = [];
  if (!Array.isArray(table) || table.length !== 5) out.push(`줄 수 ${table?.length}`);
  ['①', '②', '③', '④', '⑤'].forEach((n, i) => { const t = table?.[i]; if (!t) return; if (!String(t.부품 ?? '').startsWith(n)) out.push(`${n} 부품`); if (!VERDICTS.includes(t.판정)) out.push(`${n} 판정`); for (const f of ['숫자', '문턱']) if (typeof t[f] !== 'string' || t[f].trim().length < 10) out.push(`${n} ${f}`); const cl = t['코드 줄']; if (!Array.isArray(cl) || !cl.length) out.push(`${n} 코드 줄`); else for (const c of cl) { const m = /^([\w./-]+\.mjs):(\d+)$/.exec(c); if (!m || !exists(m[1], Number(m[2]))) out.push(`${n} 코드 줄 ${c}`); } });
  return out;
}

export default async function W10({report, sha, rel}) {
  const d = JSON.parse(fs.readFileSync(rel('reports/atlas11/overhaul/diagnosis.json'), 'utf8'));
  const exists = (file, line) => { try { return fs.readFileSync(rel(file), 'utf8').split('\n').length >= line && line >= 1; } catch { return false; } };
  const probs = tableProblems(d.verdictTable, exists);
  // 판정이 part 파일의 판정과 같은가
  const parts = [1, 2, 3, 4, 5].map(k => JSON.parse(fs.readFileSync(rel(`reports/atlas11/overhaul/part${k}.json`), 'utf8')).decision.verdict);
  const same = d.verdictTable.every((t, i) => t.판정 === parts[i]);
  report('W10:판정표', probs.length === 0 && same, {rows: d.verdictTable.length, verdicts: d.verdictTable.map(t => t.판정), problems: probs, sameAsPartFiles: same});
  // 틀린 42칸: w10-against.json 과 셈·줄이 같은가
  const wbuf = fs.readFileSync(rel('reports/atlas11/overhaul/w10-against.json')), w = JSON.parse(wbuf.toString('utf8'));
  const recount = {}; for (const r of w.rows) { const k = r.against.join(' + '); recount[k] = (recount[k] ?? 0) + 1; } // 두 항이면 「A + B」 한 묶음
  const countsSame = JSON.stringify(Object.entries(d.wrongCells.counts).sort()) === JSON.stringify(Object.entries(w.counts).sort()) && Object.entries(w.counts).every(([k, v]) => recount[k] === v);
  const rowsSame = d.wrongCells.rows.length === 42 && w.rows.length === 42 && d.wrongCells.rows.every((r, i) => r.code === w.rows[i].code && r.date === w.rows[i].date && JSON.stringify(r.against) === JSON.stringify(w.rows[i].against));
  report('W10:틀린42칸', countsSame && rowsSame && d.wrongCells.sha256 === sha(wbuf) && Object.values(w.counts).reduce((s, v) => s + v, 0) === 42, {counts: d.wrongCells.counts, total: d.wrongCells.total});
  // G2 상태와 판단을 기다리는 일
  report('W10:G2·eco03', /글자대로 미통과: T13·T14/.test(d.gateG2.status) && fs.existsSync(rel('reports/atlas11/overhaul/eco/03.md')) && fs.existsSync(rel('reports/atlas11/overhaul/data-correction-01.md')) && fs.existsSync(rel('reports/atlas11/overhaul/diagnosis.md')), {gateG2: d.gateG2.status});
  // 결함 심기(10절): 판정 하나를 지운 사본 · 코드 줄을 없는 줄로 바꾼 사본 → 막혀야 한다
  const bad1 = structuredClone(d.verdictTable); bad1[2].판정 = ''; const bad2 = structuredClone(d.verdictTable); bad2[0]['코드 줄'] = ['lib/factor36.mjs:99999']; const bad3 = d.verdictTable.slice(0, 4);
  report('inject:W10', tableProblems(bad1, exists).length > 0 && tableProblems(bad2, exists).length > 0 && tableProblems(bad3, exists).length > 0, {planted: ['판정 빈칸', '없는 코드 줄', '4줄']});
}
