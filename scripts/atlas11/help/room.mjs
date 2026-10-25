#!/usr/bin/env node
// 고객센터 새 글을 사장님 카톡으로 — 일하는 방 쪽(사장님 2026-10-22(서울) 07:48 「… 다른 방한나더 별로 만들어 내 카톡으로 오게해라」 · 명령문 docs/design/helpkakao-2026-10-22/order-0748.txt)
//   방(매시)이 하는 일: ① node scripts/atlas11/help/room.mjs --fetch  → 새 열쇠 한 쌍을 만들고 깃허브 작업(atlas11-help-forward.yml mode=fetch)을 부름
//                         → 작업이 끝나면 알림 줄(잠긴 글)을 REST 로 받아 이 방 열쇠로 풂 → 카톡에 보낼 글을 파일 하나로(이 방 임시 폴더 · 방이 끝나면 사라짐)
//                         → 한 줄 JSON {ok, n 글 수, msgs 카톡 통 수, more 남은 글, last, run, file}
//                       ② (n > 0 이면) 방이 file 의 messages 를 차례대로 카톡 「나에게 보내기」로 한 통씩 — 글은 고치지 않음
//                       ③ node scripts/atlas11/help/room.mjs --done --run <번호> --last <글 번호> → 깃허브 작업(mode=ack)으로 「여기까지 보냄」 · 읽은 작업 기록은 지움(잠긴 글이지만 남기지 않음)
//   카톡을 다 못 보냈으면 ③을 하지 않음 → 다음 시간에 같은 글부터 다시(빠뜨리지 않음 · 두 번 갈 수는 있음)
//   보낸 통 수(사장님 2026-10-25 17:28 「확인해봐 오지 않랐어」 — 선물 신청 알림이 카톡에 안 왔는데 보낸 표시만 남음):
//     ①의 결과에 보낼 글(messages)을 그대로 실어 방이 파일을 따로 열지 않아도 됨 · ③은 --sent <카톡 도구가 「성공」이라 답한 통 수>가 있어야 하고
//     꺼낸 글 수와 같아야 보낸 표시를 함(아니면 보낸 표시 없이 끝 → 다음 시간에 다시) · 보낸 표시 작업 이름 끝에 「-s<통 수>」가 남아 깃허브 목록에서 보임
//   처음 켤 때: 사이트에 올린 직후 gh workflow run atlas11-help-forward.yml -f mode=ack -f ack_id=<올린 때 번호> 로 보낸 표시를 한 번 옮김(처리방침 줄 전 글은 안 감 · forward.mjs FWD_START)
//   ①이 막히면(ok false) 결과에 streak(연달아 막힌 수) — 꼭 3 일 때만 방이 카톡 한 통 「넘기기가 세 번 연달아 막혔어요」(조용히 멈추지 않게 · 매시 되풀이 안 함)
//   Claude 예약 방의 길: gh workflow run · gh run list · gh api(REST)만 됨(GraphQL · 묶음 받기 · aaa7377.com 막힘 — scripts/atlas11/jinhwa/gh.mjs 머리)
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {newRoomKey, open, fromAnnotations, FWD_SCHEMA, splitLast} from './forward.mjs';

export const REPO = 'srt36573657-coder/atlas-11', WORKFLOW = 'atlas11-help-forward.yml';
const sleep = ms => new Promise(r => setTimeout(r, ms));
const gh = args => { const r = spawnSync('gh', args, {encoding: 'utf8', timeout: 120e3}); return {ok: r.status === 0, out: String(r.stdout ?? '').trim(), err: String(r.stderr ?? r.error?.message ?? '').trim()}; };
const short = s => String(s ?? '').replace(/\s+/g, ' ').slice(0, 160);

/** 방금 부른 작업 번호 — 작업 이름 끝의 방 표시(tag)가 같은 것(두 방이 함께 불러도 섞이지 않음) · 부른 때(t0) 뒤 */
export function pickRun(list, tag, t0) {
  return (Array.isArray(list) ? list : []).filter(o => o?.event === 'workflow_dispatch' && Date.parse(o.createdAt) >= t0 && String(o.displayTitle ?? '').endsWith(' ' + tag))
    .sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt))[0]?.databaseId ?? null;
}
export const newTag = () => crypto.randomBytes(5).toString('hex');
async function findRun(t0, tag, {tries = 20} = {}) {
  for (let i = 0; i < tries; i++) {
    const r = gh(['run', 'list', '-R', REPO, '--workflow', WORKFLOW, '-L', '10', '--json', 'databaseId,createdAt,status,conclusion,event,displayTitle']);
    if (r.ok) { try { const id = pickRun(JSON.parse(r.out), tag, t0); if (id) return id; } catch { /* 다시 */ } }
    await sleep(3000);
  }
  return null;
}
async function waitRun(id, {maxMin = 8} = {}) {
  const end = Date.now() + maxMin * 60e3;
  while (Date.now() < end) {
    const r = gh(['run', 'view', String(id), '-R', REPO, '--json', 'status,conclusion']);
    if (r.ok) { try { const o = JSON.parse(r.out); if (o.status === 'completed') return o.conclusion; } catch { /* 다시 */ } }
    await sleep(6000);
  }
  return 'timeout';
}
async function annotations(id) {
  const j = gh(['api', `repos/${REPO}/actions/runs/${id}/jobs`]);
  if (!j.ok) return {ok: false, why: '작업 목록을 못 읽음 ' + short(j.err)};
  let jobs; try { jobs = JSON.parse(j.out).jobs; } catch { return {ok: false, why: '작업 목록 꼴'}; }
  const job = (jobs ?? []).find(x => x?.name === 'forward') ?? jobs?.[0];
  const cid = /\/check-runs\/(\d+)$/.exec(String(job?.check_run_url ?? ''))?.[1] ?? (Number.isInteger(job?.id) ? String(job.id) : null);
  if (!cid) return {ok: false, why: '작업 번호를 못 찾음'};
  const a = gh(['api', `repos/${REPO}/check-runs/${cid}/annotations?per_page=100`]);
  if (!a.ok) return {ok: false, why: '알림 줄을 못 읽음 ' + short(a.err)};
  try { return fromAnnotations(JSON.parse(a.out)); } catch { return {ok: false, why: '알림 줄 꼴'}; }
}

/** 연달아 막힌 수 — 가장 새 작업부터 거꾸로 세어 처음 잘 된 작업에서 멈춤(돌던 것은 건너뜀) · 방은 이 수가 꼭 3 일 때 한 번만 사장님께 알림(조용히 멈추지 않게 · 매시 되풀이 안 함) */
export function failStreak(runs) {
  let n = 0;
  for (const r of [...(Array.isArray(runs) ? runs : [])].sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt))) {
    if (r?.status !== 'completed') continue;
    if (r.conclusion === 'success') break;
    n++;
  }
  return n;
}
function streakNow() {
  const r = gh(['run', 'list', '-R', REPO, '--workflow', WORKFLOW, '-L', '12', '--json', 'status,conclusion,createdAt']);
  try { return r.ok ? failStreak(JSON.parse(r.out)) : null; } catch { return null; }
}
const failed = o => ({...o, ok: false, streak: streakNow()});

export const OUT = path.join(os.tmpdir(), 'help-forward.json');
/** 보낸 통 수 맞대기 — sent = 방이 카톡 도구로 보내 「성공」 답을 받은 통 수 · want = 꺼낸 글 수(파일을 못 읽으면 null) */
export function checkSent(sent, want) {
  const s = String(sent ?? '').trim();
  if (!/^\d{1,2}$/.test(s) || Number(s) < 1) return {ok: false, why: '보낸 통 수(--sent)가 없음 — 카톡을 보낸 뒤 「성공」 답을 받은 통 수를 넘김'};
  if (Number.isInteger(want) && Number(s) !== want) return {ok: false, why: `보낸 통 수가 꺼낸 글 수와 다름(${s}/${want}) — 보낸 표시 없이 끝 · 다음 시간에 다시`};
  return {ok: true, sent: Number(s)};
}
const wantOf = file => { try { const j = JSON.parse(fs.readFileSync(file, 'utf8')); return Array.isArray(j?.messages) ? j.messages.length : null; } catch { return null; } };

export async function fetchRoom({out = OUT} = {}) {
  const key = newRoomKey(), t0 = Date.now() - 15e3, tag = newTag();
  const w = gh(['workflow', 'run', WORKFLOW, '-R', REPO, '--ref', 'main', '-f', 'mode=fetch', '-f', `pub=${key.pub}`, '-f', `tag=${tag}`]);
  if (!w.ok) return failed({why: '작업을 못 부름 ' + short(w.err)});
  const run = await findRun(t0, tag);
  if (!run) return failed({why: '작업 번호를 못 찾음'});
  const c = await waitRun(run);
  if (c !== 'success') return failed({run, why: '작업이 ' + c});
  const an = await annotations(run);
  if (!an.ok) return failed({run, why: an.why});
  let r; try { r = open(an.box, key.priv); } catch (e) { return failed({run, why: '잠긴 글을 못 풂 ' + short(e?.message)}); }
  if (r?.schema !== FWD_SCHEMA || !Array.isArray(r.messages)) return failed({run, why: '꼴이 틀림'});
  fs.writeFileSync(out, JSON.stringify({messages: r.messages, last: r.last, n: r.n, more: r.more}) + '\n', {mode: 0o600});
  return {ok: true, n: r.n, msgs: r.messages.length, more: r.more, last: r.last, run, file: out, messages: r.messages};
}
export async function doneRoom({run, last, sent, file = OUT}) {
  if (!splitLast(last)) return {ok: false, why: '글 번호 꼴이 틀림'}; // 고객센터 글 번호 · 또는 「고객센터 번호+선물 신청 번호」(선물 신청 알림 · 2026-10-25 15:37)
  const s = checkSent(sent, wantOf(file));
  if (!s.ok) return s;
  const t0 = Date.now() - 15e3, tag = `${newTag()}-s${s.sent}`;
  const w = gh(['workflow', 'run', WORKFLOW, '-R', REPO, '--ref', 'main', '-f', 'mode=ack', '-f', `ack_id=${last}`, '-f', `tag=${tag}`]);
  if (!w.ok) return {ok: false, why: '보낸 표시 작업을 못 부름 ' + short(w.err)};
  const ackRun = await findRun(t0, tag), c = ackRun ? await waitRun(ackRun) : 'none';
  const del = run && /^\d+$/.test(String(run)) ? gh(['api', '-X', 'DELETE', `repos/${REPO}/actions/runs/${run}`]) : {ok: false};
  return {ok: c === 'success', ackRun, ack: c, deleted: del.ok, sent: s.sent};
}

if (process.argv[1] && fs.realpathSync(process.argv[1]) === fs.realpathSync(fileURLToPath(import.meta.url))) {
  const a = process.argv.slice(2), arg = (k, d) => { const i = a.indexOf(k); return i >= 0 && i + 1 < a.length ? a[i + 1] : d; };
  const r = a.includes('--done') ? await doneRoom({run: arg('--run', ''), last: arg('--last', ''), sent: arg('--sent', ''), file: arg('--file', OUT)}) : a.includes('--fetch') ? await fetchRoom({out: arg('--out', undefined)}) : {ok: false, why: '쓰는 법: room.mjs --fetch | --done --run <번호> --last <글 번호> --sent <보낸 통 수>'};
  console.log(JSON.stringify(r));
  process.exit(r.ok ? 0 : 1);
}
