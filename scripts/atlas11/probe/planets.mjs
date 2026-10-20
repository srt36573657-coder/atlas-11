#!/usr/bin/env node
// 진짜 행성 사진 받기(사장님 2026-10-20(서울) 22:17 「우주에 주황색으로만 여러 개 있는데 태양계 그리고 몰라 진짜 실사 행성으로 해 / 학습해서 해」 · 22:22 행성 사진 보기)
//   깃허브 실행기(probe which=planets)에서만 돎 — 이 방은 바깥 사진 주소에 못 닿음
//   사진은 미국 항공우주국(NASA) 것만 — NASA 사진은 대개 미국 저작권이 없음(nasa.gov/nasa-brand-center/images-and-media · 출처 「NASA」를 적음 · 로고 없음 · 보증처럼 보이게 쓰지 않음)
//   하는 일: 받기 → (왼쪽 반 같은) 미리 자르기 → 밝은 몸 둘레로 자르기 → 바깥 검은 하늘만 투명(가장자리에서 어두운 곳을 따라 채움 · 몸 안 어두운 무늬는 그대로) → 네모 96px · 192px webp
//   씀: reports/atlas11/probe/planets/<이름>-96.webp · <이름>-192.webp · sheet.png(밤하늘 바탕에 한 장 — 눈으로 고르기) · sources.json(주소 · 출처 · sha256 · 바이트 · 원래 크기)
//   쓰는 법: SHARP_DIR=/tmp/sh/node_modules node scripts/atlas11/probe/planets.mjs
import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import {createRequire} from 'node:module';

const require = createRequire(process.env.SHARP_DIR ? process.env.SHARP_DIR.replace(/\/?$/, '/') : import.meta.url);
const sharp = require('sharp');
const OUT = 'reports/atlas11/probe/planets';
const A = 'https://assets.science.nasa.gov/content/dam/science/psd/photojournal/pia/';
/** [이름, 주소, 출처, 미리 자르기(비율 l · t · w · h) | null, 덩이(남길 밝은 덩이 — 'largest' = 가장 큰 하나 · 기본 = 가장 큰 것의 5% 넘는 덩이 모두(토성 고리))] */
export const LIST = [
  ['sun', 'https://sdo.gsfc.nasa.gov/assets/img/latest/latest_1024_HMIIC.jpg', 'NASA/SDO/HMI', null, 'largest'], // 사진 아래 글씨(날짜 줄)는 덩이 걸름으로 뺌
  ['mercury', A + 'pia11/pia11406/PIA11406.jpg', 'NASA/Johns Hopkins University Applied Physics Laboratory/Carnegie Institution of Washington', null, 'largest'], // 두 둥근 판 가운데 큰 하나
  ['venus', A + 'pia00/pia00104/PIA00104.jpg', 'NASA/JPL', null],
  ['earth', 'https://assets.science.nasa.gov/content/dam/science/esd/eo/images/imagerecords/84000/84214/bluemarble_2014089_lrg.jpg', 'NASA Earth Observatory/NOAA (Suomi NPP VIIRS)', null],
  ['moon', 'https://assets.science.nasa.gov/content/dam/science/psd/earths-moon/outreach-materials/NASA-LRO-Moon-mosaic.png', "NASA's Scientific Visualization Studio (LRO)", null],
  ['mars', A + 'pia00/pia00407/PIA00407.jpg', 'NASA/JPL/USGS', null],
  ['jupiter', A + 'pia02/pia02873/PIA02873.jpg', 'NASA/JPL/University of Arizona', null, 'largest'], // 첫 판(PIA04866)은 오른쪽이 잘려 바꿈
  ['saturn', A + 'pia06/pia06193/PIA06193.jpg', 'NASA/JPL/Space Science Institute', null],
  ['uranus', A + 'pia00/pia00032/PIA00032.jpg', 'NASA/JPL', [0, 0, 0.5, 1], 'largest'], // 왼쪽 = 참 빛깔
  ['neptune', A + 'pia01/pia01492/PIA01492.jpg', 'NASA/JPL', null],
  ['pluto', A + 'pia19/pia19857/PIA19857.jpg', 'NASA/Johns Hopkins University Applied Physics Laboratory/Southwest Research Institute', null],
];

async function get(url) {
  for (let k = 0; k < 4; k++) {
    try {
      const r = await fetch(url, {headers: {'user-agent': 'aaa7377-planets/1 (+https://aaa7377.com)'}, redirect: 'follow'});
      if (!r.ok) throw Error('HTTP ' + r.status);
      return Buffer.from(await r.arrayBuffer());
    } catch (e) { if (k === 3) throw e; await new Promise(z => setTimeout(z, 1500 * (k + 1))); }
  }
}
/** 바깥 검은 하늘만 투명 — 가장자리에서 어두운(L < T) 곳을 따라 채운 곳 = 하늘 · 그 밖 = 몸(불투명) · 하늘 쪽 가장자리는 밝기로 부드럽게 */
function keyOut({data, info}, keep = 'some', T = 26, lo = 10, hi = 44) {
  const {width: W, height: H} = info, n = W * H, L = new Float32Array(n), sky = new Uint8Array(n), q = new Int32Array(n);
  for (let i = 0; i < n; i++) { const r = data[i * 4], g = data[i * 4 + 1], b = data[i * 4 + 2]; L[i] = 0.2126 * r + 0.7152 * g + 0.0722 * b; }
  let qh = 0, qt = 0;
  const push = i => { if (!sky[i] && L[i] < T) { sky[i] = 1; q[qt++] = i; } };
  for (let x = 0; x < W; x++) { push(x); push((H - 1) * W + x); }
  for (let y = 0; y < H; y++) { push(y * W); push(y * W + W - 1); }
  while (qh < qt) { const i = q[qh++], x = i % W, y = (i / W) | 0; if (x > 0) push(i - 1); if (x < W - 1) push(i + 1); if (y > 0) push(i - W); if (y < H - 1) push(i + W); }
  const al = new Float32Array(n);
  for (let i = 0; i < n; i++) al[i] = sky[i] ? Math.max(0, Math.min(1, (L[i] - lo) / (hi - lo))) : 1;
  // 밝은 덩이 나누기(알파 0.1 넘게 · 네 이웃) — 글씨 · 둘째 판 · 떠도는 별을 뺌
  const lab = new Int32Array(n).fill(-1), sizes = [];
  for (let i = 0; i < n; i++) {
    if (al[i] <= 0.1 || lab[i] >= 0) continue;
    const id = sizes.length; let cnt = 0; qh = 0; qt = 0; q[qt++] = i; lab[i] = id;
    while (qh < qt) { const j = q[qh++]; cnt++; const x = j % W, y = (j / W) | 0; for (const k of [x > 0 ? j - 1 : -1, x < W - 1 ? j + 1 : -1, y > 0 ? j - W : -1, y < H - 1 ? j + W : -1]) if (k >= 0 && lab[k] < 0 && al[k] > 0.1) { lab[k] = id; q[qt++] = k; } }
    sizes.push(cnt);
  }
  const big = sizes.length ? Math.max(...sizes) : 0, keepId = new Set(sizes.map((c, id) => [c, id]).filter(([c]) => (keep === 'largest' ? c === big : c >= big * 0.05)).map(([, id]) => keep === 'largest' ? id : id));
  if (keep === 'largest') { const first = sizes.indexOf(big); keepId.clear(); keepId.add(first); }
  let x0 = W, y0 = H, x1 = -1, y1 = -1;
  for (let i = 0; i < n; i++) {
    const a = lab[i] >= 0 && keepId.has(lab[i]) ? al[i] : 0;
    data[i * 4 + 3] = Math.round(a * 255);
    if (a > 0.5) { const x = i % W, y = (i / W) | 0; if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
  }
  return {box: x1 < 0 ? null : {left: x0, top: y0, width: x1 - x0 + 1, height: y1 - y0 + 1}, skyPct: Math.round(sky.reduce((p, v) => p + v, 0) / n * 1000) / 10};
}

await fs.mkdir(OUT, {recursive: true});
const rows = [], tiles = [];
for (const [name, url, credit, pre, keep = 'some'] of LIST) {
  const row = {name, url, credit};
  try {
    const buf = await get(url);
    row.bytes = buf.length; row.sha256 = crypto.createHash('sha256').update(buf).digest('hex');
    let img = sharp(buf, {limitInputPixels: false}).rotate();
    const meta = await img.metadata(); row.orig = [meta.width, meta.height];
    if (pre) { const [l, t, w, h] = pre; img = img.extract({left: Math.round(l * meta.width), top: Math.round(t * meta.height), width: Math.round(w * meta.width), height: Math.round(h * meta.height)}); }
    // 큰 사진은 먼저 줄여서 셈(긴 변 1600) — 자르기 · 투명은 줄인 판에서
    const small = await img.resize({width: 1600, height: 1600, fit: 'inside', withoutEnlargement: true}).ensureAlpha().raw().toBuffer({resolveWithObject: true});
    const k = keyOut(small, keep); row.skyPct = k.skyPct; row.keep = keep;
    if (!k.box) throw Error('몸을 못 찾음');
    const side = Math.max(k.box.width, k.box.height), pad = Math.round(side * 0.02);
    const cx = k.box.left + k.box.width / 2, cy = k.box.top + k.box.height / 2, S = side + pad * 2;
    const base = sharp(small.data, {raw: small.info});
    // 정사각 바탕(투명)에 몸 가운데를 맞춰 얹음
    const crop = await base.extract({left: k.box.left, top: k.box.top, width: k.box.width, height: k.box.height}).png().toBuffer();
    const sq = sharp({create: {width: S, height: S, channels: 4, background: {r: 0, g: 0, b: 0, alpha: 0}}}).composite([{input: crop, left: Math.round(S / 2 - k.box.width / 2), top: Math.round(S / 2 - k.box.height / 2)}]).png();
    const sqBuf = await sq.toBuffer();
    for (const px of [96, 192]) {
      const f = path.join(OUT, `${name}-${px}.webp`);
      await sharp(sqBuf).resize(px, px, {fit: 'contain', background: {r: 0, g: 0, b: 0, alpha: 0}}).webp({quality: 86, alphaQuality: 92, effort: 6}).toFile(f);
      row['w' + px] = (await fs.stat(f)).size;
    }
    row.box = k.box; row.center = [Math.round(cx), Math.round(cy)];
    tiles.push({name, buf: await sharp(sqBuf).resize(192, 192, {fit: 'contain', background: {r: 0, g: 0, b: 0, alpha: 0}}).png().toBuffer()});
    row.ok = true;
  } catch (e) { row.ok = false; row.error = String(e.message || e).slice(0, 200); }
  rows.push(row); console.log(JSON.stringify({name, ok: row.ok, bytes: row.bytes, orig: row.orig, sky: row.skyPct, w96: row.w96, err: row.error}));
}
// 한 장 사진(밤하늘 바탕 #070B17 · 네 줄 셋 칸) — 눈으로 고르기
const cols = 4, cell = 220, rowsN = Math.ceil(tiles.length / cols);
const sheet = sharp({create: {width: cols * cell, height: rowsN * cell, channels: 4, background: {r: 7, g: 11, b: 23, alpha: 1}}})
  .composite(tiles.map((t, i) => ({input: t.buf, left: (i % cols) * cell + 14, top: Math.floor(i / cols) * cell + 14})));
await sheet.png().toFile(path.join(OUT, 'sheet.png'));
await fs.writeFile(path.join(OUT, 'sources.json'), JSON.stringify({made: new Date().toISOString(), policy: 'https://www.nasa.gov/nasa-brand-center/images-and-media/', order: tiles.map(t => t.name), rows}, null, 1) + '\n');
console.log('planets', rows.filter(r => r.ok).length + '/' + rows.length);
