/**
 * ATLAS 11 · 종목 묶음을 지금 바로 바꾼다(매일 실행을 기다리지 않음) — 사장님 지시가 있을 때만 사람이 돌린다
 *   2026-10-04 20:52 사장님 「대표 52개념도 삭제해 총 180개에서 섹타를 구분해」 → 10월 6일(화) 바꾸기를 기다리지 않고 「업종 대표 52종목」을 바로 180곳으로
 *   2026-10-04 21:04 「업종 36개에서 180개 회사를 찾아…」 → 새 제안 폴더(--proposal-dir)를 바로 next 로 올리고 바꾼다(옛 next 는 history 로)
 *   node scripts/atlas11/switch_now.mjs --now <ISO> --at "<KST 시각>" --order "<말씀 그대로>" [--order …] [--decided …] [--proposal-dir reports/atlas11/universe/<폴더>]
 * 하는 일: (--proposal-dir 이면 그 제안을 next 로) → 설정 next 의 새 입력(해시·곳 수 확인) → public/data/input.json
 *         · 지금 입력은 reports/atlas11/universe/retired/<id>.json 으로 보관(같은 이름이 있으면 덮어쓰지 않음)
 *         · 설정: current = 새 묶음 · next = 없음 · 옛 order/next 는 history 로(지우지 않음)
 *         · 장부: operation/universe_switch 한 줄(옛 기록은 고치지 않음)
 * 하지 않는 일: 새 종가 받기 — 새 입력은 고를 때 받은 종가(10월 2일(금)까지)를 그대로 쓰고, 다음 거래일 16:00 매일 실행이 180곳 정규장 종가를 받는다.
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {pathToFileURL} from 'node:url';
import {loadUniverseConfig, loadNextInput, applySwitch, universeIdOf, UNIVERSE_CONFIG} from '../../lib/atlas11/universe-switch.mjs';
import {appendRecord} from '../../lib/atlas11/records.mjs';

const sha = s => createHash('sha256').update(s).digest('hex');
const koreaDay = at => new Date(Date.parse(at) + 9 * 3600000).toISOString().slice(0, 10);

export async function switchNow({rootDir = process.cwd(), now = new Date().toISOString(), order, proposalDir = null}) {
  if (!order?.at || !Array.isArray(order.text) || !order.text.length) throw Error('SWITCH_NOW_ORDER_REQUIRED');
  const cfg = await loadUniverseConfig(rootDir), day = koreaDay(now);
  if (proposalDir) {
    // 새 제안 폴더를 next 로 — 옛 next 는 바꾸기 전에 대신했다고 history 에 남긴다(지우지 않음)
    const proposal = JSON.parse(await fs.readFile(path.join(rootDir, proposalDir, 'proposal.json'), 'utf8')), text = await fs.readFile(path.join(rootDir, proposalDir, 'next-input.json'), 'utf8'), ni = JSON.parse(text);
    if (!proposal.ok || ni.universe?.id !== proposal.id) throw Error('SWITCH_NOW_PROPOSAL_NOT_OK');
    if (cfg.next?.id && cfg.next.id !== proposal.id) cfg.history = [...(cfg.history ?? []), {order: cfg.order ?? null, next: cfg.next, status: `바꾸기 전에 ${proposal.id} 로 대신함(${order.at} 사장님 지시) · 제안 파일은 그대로 보관`}];
    cfg.next = {id: proposal.id, label: ni.universe.label, rules: ni.universe.rules, count: ni.assets.length, proposal: path.join(proposalDir, 'proposal.json'), input: path.join(proposalDir, 'next-input.json'), inputSHA256: sha(text), switchOn: day, note: `${order.at} 사장님 지시로 바로 바꿈(switch_now)`};
    cfg.selectRules = ni.universe.rules ?? cfg.selectRules ?? null;
  }
  const inputPath = path.join(rootDir, 'public/data/input.json'), raw = await fs.readFile(inputPath, 'utf8'), current = JSON.parse(raw);
  if (!cfg.next?.id) return {switched: false, reason: '설정에 바꿀 묶음(next)이 없음'};
  if (universeIdOf(current) === cfg.next.id) return {switched: false, reason: '이미 바뀜'};
  const nx = await loadNextInput(rootDir, cfg.next), next = nx.input;
  const sw = await applySwitch(rootDir, {current, next, now, day});
  const u = next.universe ?? {};
  const config = {
    schema: cfg.schema ?? 'atlas11-universe-config-1',
    order,
    current: {id: sw.to, label: u.label ?? cfg.next.label ?? sw.to, rules: u.rules ?? cfg.next.rules ?? null, count: next.assets.length, since: day, switchedAt: now, switchedBy: `사장님 지시(${order.at}) · 매일 실행 밖에서 바로`, proposal: cfg.next.proposal ?? null, input: cfg.next.input ?? null, inputSHA256: cfg.next.inputSHA256 ?? null, closesThrough: next.actualAsOf ?? null},
    next: null,
    selectRules: cfg.selectRules ?? null,
    history: [...(cfg.history ?? []), {order: proposalDir ? null : cfg.order ?? null, current: cfg.current ?? null, next: cfg.next, status: `${proposalDir ? '' : `${cfg.next.switchOn ?? ''} 매일 실행을 기다리지 않고 `}${order.at} 사장님 지시로 바로 바꿈 · 옛 묶음(${sw.from}) 입력은 ${sw.retiredFile} 에 보관`}],
    note: cfg.note ?? null
  };
  await fs.writeFile(path.join(rootDir, UNIVERSE_CONFIG), JSON.stringify(config, null, 1) + '\n');
  const r = await appendRecord(rootDir, {type: 'operation', at: now, body: {kind: 'universe_switch', day, from: sw.from, to: sw.to, proposal: cfg.next.proposal ?? null, order, how: '사장님 지시로 바로(매일 실행 밖 · 거래일 아님 · 새 종가 받지 않음)', closesThrough: next.actualAsOf ?? null,
    codesFrom: sw.codesFrom, codesTo: sw.codesTo, kept: sw.codesTo.filter(c => sw.codesFrom.includes(c)).length, added: sw.codesTo.filter(c => !sw.codesFrom.includes(c)).length, dropped: sw.codesFrom.filter(c => !sw.codesTo.includes(c)).length,
    retiredFile: sw.retiredFile, inputSHA256: sw.inputSHA256, inputSnapshotBeforeSwitch: sha(raw), status: '종목 바꿈'}});
  return {switched: true, from: sw.from, to: sw.to, day, retiredFile: sw.retiredFile, inputSHA256: sw.inputSHA256, record: r.record.id, kept: r.record.body.kept, added: r.record.body.added, dropped: r.record.body.dropped, closesThrough: next.actualAsOf ?? null};
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) {
  const arg = name => { const i = process.argv.indexOf(name); return i < 0 ? null : process.argv[i + 1]; };
  const all = name => process.argv.flatMap((x, i) => x === name ? [process.argv[i + 1]] : []);
  const order = {at: arg('--at'), by: '사장님', text: all('--order'), decided: all('--decided')};
  console.log(JSON.stringify(await switchNow({now: arg('--now') ?? new Date().toISOString(), order, proposalDir: arg('--proposal-dir')})));
}
