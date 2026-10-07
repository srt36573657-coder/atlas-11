/**
 * 오늘의 돈 이야기 — 판 다섯 · 모은 기사를 읽어 셈(lib/atlas11/story.mjs)에 넘김 · 사이트 묶음(package.mjs)이 /story.json 으로 싣는다
 *   사장님 2026-10-07 16:34 「한국·미국·일본·중국·베트남을 자동 분석해 가장 근거가 뚜렷한 돈 이야기 하나를 골라라 … 입력·검색·선택은 필요 없다」
 *   node scripts/atlas11/story/build.mjs [--out file]   (따로 돌려 볼 때 — 결과를 찍음)
 * 읽는 곳(저장소 안 · 새로 받지 않음): 한국 판 public/data/atlas11/view(board · stocks/*.json 의 기사) · 바깥 판 public/data/atlas11/<시장>/view/board.json · <시장>/context.json 의 기사
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import {buildStory, checkStory} from '../../../lib/atlas11/story.mjs';
import {buildRotation, checkRotation, ROT} from '../../../lib/atlas11/rotation.mjs';

const readJson = async f => JSON.parse(await fs.readFile(f, 'utf8'));
const PLACES = [['kr', '한국', 'public/data/atlas11/view'], ['us', '미국', 'public/data/atlas11/us/view'], ['cn', '중국', 'public/data/atlas11/cn/view'], ['jp', '일본', 'public/data/atlas11/jp/view'], ['vn', '베트남', 'public/data/atlas11/vn/view']];

/** 돈의 이동(2026-10-07 22:06 「어떤 업종에서 어떤 업종으로 돈에 이동이 되고 있냐 그리고 그 기간과 포모값은 어찌 되냐」) — 한국 판 365곳 · 업종 73개
   읽는 곳: public/data/input.json(종가 · 선정 때 시가총액) · 한국 판 board.json(업종) · reports/atlas11/context/latest.json 이 가리키는 관측 묶음(외국인 · 기관 · 개인 순매매)
   2026-10-08 01:27 「다해 전나라」 — 미국 · 중국 · 일본 · 베트남도 같은 셈(rotationsFrom):
     그 판 input.json(종가 · quality.capUsd/cap = 천 단위 그 나라 돈 → 억으로 ÷ 100,000) · 그 판 board.json(업종) · 순매매 자료는 없음(지어내지 않음 · 화면 결 낙관이 빠지는 곳 포모값) */
export const ROT_PLACES = [['kr', 'public/data/input.json', 'public/data/atlas11/view/board.json'], ['us', 'public/data/atlas11/us/input.json', 'public/data/atlas11/us/view/board.json'],
  ['cn', 'public/data/atlas11/cn/input.json', 'public/data/atlas11/cn/view/board.json'], ['jp', 'public/data/atlas11/jp/input.json', 'public/data/atlas11/jp/view/board.json'], ['vn', 'public/data/atlas11/vn/input.json', 'public/data/atlas11/vn/view/board.json']];
/** 시가총액(억 · 그 나라 돈) — 한국 marketCapEok · 바깥 판 capUsd(미국) · cap(중국 · 일본 · 베트남) = 천 단위 → ÷ 100,000 */
export const capEokOf = (place, q) => place === 'kr' ? q?.marketCapEok : (Number.isFinite(q?.capUsd ?? q?.cap) ? (q.capUsd ?? q.cap) / 1e5 : null);
export async function rotationOf(root, place) {
  const [, inFile, boardFile] = ROT_PLACES.find(x => x[0] === place) ?? [];
  if (!inFile) return {schema: ROT.schema, none: true, reason: '판 없음'};
  try {
    const input = await readJson(path.join(root, inFile)), board = await readJson(path.join(root, boardFile));
    let flows = [];
    if (place === 'kr') { try { const latest = await readJson(path.join(root, 'reports/atlas11/context/latest.json')); if (/^reports\/atlas11\/context\/[\w./-]+\.json$/.test(latest?.file ?? '')) flows = (await readJson(path.join(root, latest.file))).flows ?? []; } catch {} }
    const assets = (input.assets ?? []).map(a => ({...a, quality: {...(a.quality ?? {}), marketCapEok: capEokOf(place, a.quality)}}));
    const r = buildRotation({assets, groups: board.groups ?? [], sessions: input.calendar?.sessions ?? [], asOf: board.asOf, capDay: String(input.universe?.selectedAt ?? board.asOf).slice(0, 10), flows, place});
    const bad = checkRotation(r);
    return bad.length ? {schema: ROT.schema, none: true, reason: bad.join(', ')} : r;
  } catch (e) { return {schema: ROT.schema, none: true, reason: '셈 멈춤: ' + e.message}; }
}
export const rotationFrom = root => rotationOf(root, 'kr');
/** 바깥 판 넷 — {us, cn, jp, vn} */
export async function rotationsFrom(root) {
  const out = {};
  for (const [place] of ROT_PLACES) if (place !== 'kr') out[place] = await rotationOf(root, place);
  return out;
}

export async function storyFrom(root, {made = new Date().toISOString()} = {}) {
  const boards = [], items = [];
  for (const [place, label, dir] of PLACES) {
    let b; try { b = await readJson(path.join(root, dir, 'board.json')); } catch { continue; }
    boards.push({place, label, asOf: b.asOf, groups: b.groups ?? []});
    if (place === 'kr') {
      const sd = path.join(root, dir, 'stocks');
      for (const f of await fs.readdir(sd).catch(() => [])) { if (!f.endsWith('.json')) continue; try { const s = await readJson(path.join(sd, f)); for (const n of s.context?.news ?? []) items.push({...n, place}); } catch {} }
    } else {
      try { const c = await readJson(path.join(root, path.dirname(dir), 'context.json')); for (const x of c.news ?? []) for (const n of x.items ?? []) if (!n.duplicateOf) items.push({...n, place}); } catch {}
    }
  }
  const story = buildStory({boards, items, made}), bad = checkStory(story), rotation = await rotationFrom(root), rotations = await rotationsFrom(root);
  return bad.length ? {schema: story.schema, made, none: true, stockOnly: [], others: [], problems: bad, rotation, rotations} : {...story, rotation, rotations};
}

if (process.argv[1] && path.resolve(process.argv[1]) === new URL(import.meta.url).pathname) {
  const st = await storyFrom(process.cwd()), i = process.argv.indexOf('--out');
  if (i > 0) await fs.writeFile(process.argv[i + 1], JSON.stringify(st, null, 1) + '\n');
  console.log(JSON.stringify(st, null, 1));
}
