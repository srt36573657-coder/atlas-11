// 옛 쪽 기준값 — 옛 화면(/atlas/)에서 읽은 값을 한 번 찍어 두고, 그 화면이 쓴 파일이 하나도 안 바뀌었으면 다시 씀(2026-10-17 21:10 고도리 명령문 [1] 9 · 일꾼 G)
//   까닭: 옛 화면은 더 고치지 않음(규칙 75) — 같은 파일(자료 · 옛 화면 코드)이면 같은 값이 나옴 · 쪽 검사에서 옛 쪽 여는 때가 절반 넘는 검사(chx 86%)
//   맞대기는 그대로: 새 쪽 값은 늘 새로 읽고 옛 값과 같은 셈으로 맞댐 — 옛 값만 기준값 파일에서 꺼냄
//   다시 쓰는 조건(하나라도 아니면 새로 찍음): ① 꼴 · 쪽 이름 ② key(검사 파일 sha256 · 브라우저 판 · 폭 · 볼 목록) 같음
//     ③ 찍을 때 옛 화면이 받은 이 사이트 파일(쪽 · 코드 · 꾸밈 · 자료 — 글꼴 · 그림 빼고) 모두를 지금 다시 받아 sha256 이 하나도 안 다름
//   새로 찍을 때 옛 쪽에 실패가 하나라도 있으면 파일을 쓰지 않음(깨진 기준값을 남기지 않음) · --old-refresh = 있어도 새로 찍음
import fs from 'node:fs/promises';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {fetchJSON, pool} from './net.mjs';

const sha = b => createHash('sha256').update(b).digest('hex');
const SKIP = /\.(woff2?|ttf|otf|svg|png|jpe?g|webp|gif|ico|mp4|webm)(\?|$)/i; // 글꼴 · 그림 · 영상 — 읽는 글 · 값에 들지 않음
export const fileSha = async f => sha(await fs.readFile(f));

/**
 * @param {{file: string|null, page: string, base: string, key: object, refresh?: boolean, remote?: boolean}} o
 * @returns {Promise<{use: boolean, why: string, made?: string, get: (k: string) => any, put: (k: string, v: any) => void, watch: (p: any) => void, save: (ok: boolean) => Promise<string>, info: () => object}>}
 */
export async function oldSnap({file, page, base, key, refresh = false, remote = false}) {
  const origin = new URL(base).origin, reads = new Map(), inputs = new Map();
  let use = false, why = '', made = null, n = 0, bodyFail = 0;
  if (!file) why = '기준값 파일을 쓰지 않음';
  else if (refresh) why = '새로 찍기(--old-refresh)';
  else {
    let j = null; try { j = JSON.parse(await fs.readFile(file, 'utf8')); } catch { why = '기준값 파일 없음'; }
    if (j) {
      if (j.schema !== 'atlas11-oldsnap-1' || j.page !== page) why = '꼴이 다름';
      else if (JSON.stringify(j.key) !== JSON.stringify(key)) why = '검사 · 브라우저 · 목록이 바뀜';
      else {
        const urls = Object.keys(j.inputs || {});
        const now = await pool(urls, remote ? 4 : 16, async u => { try { const r = await fetchJSON(base + u, u, {as: 'response'}); return sha(Buffer.from(await r.arrayBuffer())); } catch { return null; } });
        const diff = urls.filter((u, i) => now[i] !== j.inputs[u]);
        if (!urls.length) why = '받은 파일 목록이 빔';
        else if (diff.length) why = '바뀐 파일 ' + diff.length + '개(' + diff.slice(0, 3).join(' · ') + ')';
        else { use = true; made = j.made; n = urls.length; for (const [k, v] of Object.entries(j.reads || {})) reads.set(k, v); }
      }
    }
  }
  return {
    use, why, made,
    get: k => reads.get(k),
    /** 새로 찍을 때 — 옛 쪽에서 읽은 값 하나 */
    put: (k, v) => { if (!use) reads.set(k, v); },
    /** 새로 찍을 때 — 옛 화면이 받은 이 사이트 파일(첫 200 답)을 sha256 으로 적음 */
    watch: p => {
      if (use) return;
      p.on('response', async rs => {
        try {
          const u = rs.url(); if (!u.startsWith(origin) || rs.status() !== 200 || rs.request().method() !== 'GET') return;
          const rel = u.slice(origin.length); if (SKIP.test(rel) || inputs.has(rel)) return;
          inputs.set(rel, null);
          try { inputs.set(rel, sha(await rs.body())); } catch { bodyFail++; } // 몸을 못 읽은 파일이 있으면 기준값을 쓰지 않음(그 파일이 바뀌어도 모르게 되므로)
        } catch { /* 답을 못 읽음 */ }
      });
    },
    /** 새로 찍은 것을 씀 — ok(옛 쪽 실패 0)일 때만 · 돌려주는 것 = 결과 한 줄 */
    async save(ok) {
      if (use || !file) return use ? '기준값 다시 씀' : why;
      const inp = Object.fromEntries([...inputs].filter(([, v]) => v));
      if (!ok) return '옛 쪽 실패가 있어 기준값을 쓰지 않음';
      if (bodyFail || [...inputs.values()].some(v => !v)) return '옛 화면 파일 몸을 다 못 읽어 기준값을 쓰지 않음';
      if (!Object.keys(inp).length || !reads.size) return '받은 파일 · 읽은 값이 없어 기준값을 쓰지 않음';
      await fs.mkdir(path.dirname(path.resolve(file)), {recursive: true});
      await fs.writeFile(file, JSON.stringify({schema: 'atlas11-oldsnap-1', page, made: new Date().toISOString(), key, inputs: inp, reads: Object.fromEntries(reads)}) + '\n');
      n = Object.keys(inp).length;
      return '기준값 새로 씀(파일 ' + n + '개 · 값 ' + reads.size + '개)';
    },
    info: () => ({use, why, made, inputs: use ? n : [...inputs.values()].filter(Boolean).length, reads: reads.size}),
  };
}
