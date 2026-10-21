#!/usr/bin/env node
// 잘못 36가지 찾기 — 사장님 2026-10-22 「잘못한것 무조건 36가지 찾아내 개선하고 … 증거와 결과를 카톡으로 제출하라」 · 되물음에 「응」
//   증거가 있는 잘못만 적는다. 36가지에 못 미치면 못 미친 만큼 「증거를 못 찾음」으로 적는다(지어내지 않음).
//   기계가 재는 것(아래 검사) + 사람(회차)이 직접 적은 것(audit-manual.json) 을 합쳐 reports/atlas11/jinhwa/audit/<때>.md 에 새 파일로 남긴다.
//   쓰는 법: node scripts/atlas11/jinhwa/audit36.mjs   (끝 코드 0 · 결과 JSON 한 줄)
import fs from 'node:fs'; import path from 'node:path';
const R = 'reports/atlas11', J = f => JSON.parse(fs.readFileSync(f, 'utf8'));
const ls = d => fs.existsSync(d) ? fs.readdirSync(d).filter(f => f.endsWith('.json')).sort() : [];
const found = [];
const add = (id, what, proof, fix) => found.push({id, what, proof, fix});

// 1 화면 자료 날짜 — 저장소 사본이 묵었어도 실제 올리기 기록이 최신이면 잘못 아님(2026-10-22 헛경보 교훈)
const ups = ls(`${R}/t365/updates`), upLast = ups.length ? J(`${R}/t365/updates/${ups.at(-1)}`) : null;
try {
  const th = J('site/next/data/theme.json'); const today = new Date(Date.now() + 9 * 36e5).toISOString().slice(0, 10);
  const gap = (Date.parse(today) - Date.parse(upLast?.asOf)) / 864e5;
  if (!upLast) add('data-date', '올리기 기록을 못 읽음', R + '/t365/updates 비어 있음', '기록 읽는 길 확인');
  else if (gap > 4) add('data-date', `실제 올리기 기록의 기준일이 ${gap}일 묵음`, `${ups.at(-1)} asOf ${upLast.asOf} · 오늘 ${today}`, '가격 받기 길 확인(주말·휴일이면 잘못 아님)');
} catch (e) { add('data-date', '테마 자료를 못 읽음', String(e.message), '자료 확인'); }

// 2 비워 둔 회사 이름이 기록에 없음
if (upLast?.roll?.mismatch > 0 && !('mismatchCodes' in upLast.roll)) add('mismatch-names', `새 가격을 못 붙인 회사 ${upLast.roll.mismatch}곳의 이름이 기록에 없음`, `${ups.at(-1)} roll=${JSON.stringify(upLast.roll)}`, '올리기 기록에 회사 번호를 함께 남기기(진화 대안으로)');

// 3 진화 회차 기록: 바꾼 것 없음인데 네 가지 따지기 글이 없음
const rr = ls(`${R}/jinhwa`).filter(f => /^\d{8}-\d{4}\.json$/.test(f)).slice(-6);
for (const f of rr) { const d = J(`${R}/jinhwa/${f}`);
  if (d.plan?.next === 'make' && !(d.made || []).length && !d.think) add('no-think-' + f.slice(0, 13), '바꾼 것 없음으로 끝냈는데 마음·상황·숫자·한국 주식 따지기 글이 기록에 없음', `${f}: made=[] 이고 think 칸 없음`, '회차 기록에 따지기 네 줄(think)을 남기기'); }

// 4 회차 사이가 너무 가까움(30분 안)
for (let i = 1; i < rr.length; i++) { const a = J(`${R}/jinhwa/${rr[i - 1]}`).start, b = J(`${R}/jinhwa/${rr[i]}`).start;
  if (a && b && (Date.parse(b) - Date.parse(a)) / 6e4 < 30) add('rounds-close-' + rr[i].slice(0, 13), '진화 회차가 30분 안에 연달아 돎', `${rr[i - 1]} ${a} → ${rr[i]} ${b}`, '회차 간격 확인(수동 실행이면 잘못 아님)'); }

// 5 사람이 직접 적은 잘못(증거 필수)
const man = fs.existsSync('scripts/atlas11/jinhwa/audit-manual.json') ? J('scripts/atlas11/jinhwa/audit-manual.json') : [];
for (const m of man) if (m.proof) found.push(m);

// 같은 잘못이 여러 번이면 한 가지로 묶고 증거만 늘어놓는다(숫자 부풀리기 금지)
const grp = new Map(); for (const x of found) { const k = x.id.replace(/-\d{8}-\d{4}$/, ''); if (grp.has(k)) grp.get(k).proof += ' · ' + x.proof; else grp.set(k, {...x, id: k}); }
found.length = 0; found.push(...grp.values());
const kst = new Date(Date.now() + 9 * 36e5).toISOString().slice(0, 16).replace(/[-:T]/g, '').replace(/^(\d{8})(\d{4})$/, '$1-$2');
const out = `${R}/jinhwa/audit/${kst}.md`;
let md = `# 잘못 찾기 ${kst}\n\n목표 36가지 · 증거 있는 것 ${found.length}가지 · 나머지 ${Math.max(0, 36 - found.length)}칸은 증거를 못 찾음(지어내지 않음)\n\n`;
found.forEach((x, i) => { md += `${i + 1}. **${x.what}**\n   - 증거: ${x.proof}\n   - 고침: ${x.fix}\n`; });
fs.writeFileSync(out, md);
console.log(JSON.stringify({ok: true, file: out, found: found.length, ids: found.map(x => x.id)}));
