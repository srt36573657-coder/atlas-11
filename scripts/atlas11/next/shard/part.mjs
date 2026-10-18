// 쪽 검사 몫 나누기(--shard k/n) — 고도리 길 1(2026-10-18 · C1 · 사장님 10:09 「속도를 지금보다 10배 빠르게」) · check_co · check_range · check_past · check_grow 가 함께 씀
//   한 번 다 돌 때의 일감(회사 · 빈 날 길 · 세 폭 …)을 도는 차례 그대로 마디마다 넘겨받아(part) n 몫으로 가름
//   몫마다 같은 마디 · 같은 목록 · 같은 정수 셈 → 일감 하나는 꼭 한 몫(빠짐 · 겹침 0) · 가름 = 무게 합이 가장 가벼운 몫에(같으면 앞 몫 — 무게가 같으면 차례로 돌아가며)
//   결과 파일에 shard · units{total, mine, hash, kinds} — 모으기(shard/merge.mjs)가 몫 1 ~ n 한 번씩 · 같은 hash · total · 몫 일감 합 = total 을 맞대 봄
//   --shard 가 없으면 모두 내 몫(지금과 같게 돎 · units 만 더 적힘)
import {createHash} from 'node:crypto';

/** --shard k/n 을 읽어 몫 셈을 만듦 — 꼴이 틀리면 끝 코드 2 */
export function shardOf(argv = process.argv.slice(2)) {
  const i = argv.indexOf('--shard');
  let k = 1, n = 1, s = null;
  if (i >= 0) {
    const m = /^(\d+)\/(\d+)$/.exec(argv[i + 1] ?? '');
    if (!m || +m[1] < 1 || +m[1] > +m[2]) { console.error('--shard 는 k/n 꼴(1 ≤ k ≤ n) — 받은 값 ' + (argv[i + 1] ?? '')); process.exit(2); }
    k = +m[1]; n = +m[2]; s = k + '/' + n;
  }
  const load = new Array(n).fill(0), h = createHash('sha1'), kinds = {};
  let total = 0, mine = 0;
  return {
    s, k, n,
    /**
     * 마디 하나 — items 를 도는 차례 그대로 받아 내 몫만 돌려줌(차례 그대로)
     * @param {string} kind 마디 이름(예: 'c' 회사 · 'e' 빈 날 길 · 'w' 세 폭)
     * @param {any[]} items 한 번 다 돌 때 이 마디에서 돌 것 모두
     * @param {number} w 일감 하나의 무게(정수 · 어림 초 비)
     * @param {(x: any) => string} key 일감 이름(마디 안에서 그 일감을 가리킴)
     */
    part(kind, items, w = 1, key = x => String(x)) {
      const out = [], K = kinds[kind] ??= {total: 0, mine: 0};
      for (const x of items) {
        h.update(kind + ':' + key(x) + '\n');
        let b = 0; for (let j = 1; j < n; j++) if (load[j] < load[b]) b = j;
        load[b] += w; total++; K.total++;
        if (b === k - 1) { out.push(x); mine++; K.mine++; }
      }
      return out;
    },
    /** 결과 파일에 더할 것 — shard(없으면 null) · units */
    info() { return {shard: s, units: {total, mine, hash: h.copy().digest('hex').slice(0, 16), kinds: structuredClone(kinds)}}; },
  };
}
