#!/usr/bin/env node
// 이름 바꾸기 기계(규칙 76 — 사장님 2026-10-17 17:57 「빨리하는 방식 … 정밀하게 하는 방법 찾아내 그런후 시스템에 세팅후 작업해」)
//   site/next/brand.js 의 이름(ko · en)으로 지금 사이트 글 속 옛 이름(brand.js was[0] · 또는 --from)을 모두 바꿈 — 한 번 돌리면 끝
//   글만 바꿈(속 이름 · 풀이 글은 그대로 — 지난 기록 · 사장님 말씀 따옴은 그때 글자 그대로):
//     .js · .mjs = 따옴표 · 틀 글(rename.mjs jsStrings — 풀이 글 · 정규식 밖) · .html = 풀이 글(<!-- -->) 밖 · .css = 풀이 글 밖 따옴표 글 · .json = 문자열(머리 note 줄 빼고)
//   토씨: 옛 이름 바로 뒤 토씨(은 · 는 · 이 · 가 · 을 · 를 · 과 · 와 · 으로 · 로 · 이에요 · 예요 · 아 · 야)를 새 이름 받침에 맞춤(brand.js josa)
//   대상 = 지금 사이트만(아래 FILES) — 예전 아틀란스(site/atlas · app · us · new · site/index.html · scripts/atlas11/t365)는 손대지 않음(사장님 15:54)
//   쓰는 법: node scripts/atlas11/next/brand_apply.mjs [--from 보드리 --from-en Bodri] [--dry]
//            → 파일마다 바꾼 수 · 끝나고 대상 글에 옛 이름이 남았으면 끝 코드 1(남은 자리 목록)
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {BRAND, josa} from '../../../site/next/brand.js';
import {jsStrings} from './rename.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');
const arg = (k, d) => (process.argv.includes(k) ? process.argv[process.argv.indexOf(k) + 1] : d);
const DRY = process.argv.includes('--dry');
const FROM = arg('--from', BRAND.was[0]?.ko), FROM_EN = arg('--from-en', BRAND.was[0]?.en), TO = BRAND.ko, TO_EN = BRAND.en;
if (!FROM || FROM === TO) { console.log('바꿀 옛 이름 없음 — brand.js was[0] 이 지금 이름과 같거나 없음'); process.exit(0); }

/** 지금 사이트 글이 든 파일(사람이 보는 글 · 영어 사전 원본 · 영상 · 그림 만들기 · 검사의 기대 글) — 예전 아틀란스 파일은 넣지 않음 */
export const FILES = [
  ...fs.readdirSync(path.join(ROOT, 'site/next')).filter(f => /\.(js|css|html)$/.test(f) && !['brand.js', 'i18n.js'].includes(f)).map(f => 'site/next/' + f),
  'site/hello.html', 'site/hello-send.js', 'site/letter.html', 'site/letter.js', 'site/invite.html', 'site/privacy.html',
  'scripts/atlas11/next/i18n/en-src.json',
  'scripts/atlas11/makbi/build.mjs', 'scripts/atlas11/makbi/video.mjs',
  ...fs.readdirSync(path.join(ROOT, 'scripts/atlas11/next')).filter(f => /^(check_.*|next_check|next_en_check|run_all)\.mjs$/.test(f)).map(f => 'scripts/atlas11/next/' + f),
].filter(f => fs.existsSync(path.join(ROOT, f)));

const esc = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
/* 2026-10-31 23:20(+04) 「둘리 이름름 경수르로 변경해」 · 23:46 「경수르가 아니라 수르! 수르!」(docs/design/mansour-2026-11-01/order-0420.txt) — 옛 이름 「둘이」는 보통 말이기도 함
   → 낱말 하나로 선 이름만 바꿈(앞이 한글이 아니고 · 뒤가 한글이 아니거나 토씨 하나 뒤 한글이 아님 — 일흔둘이 · 둘이서 · 둘이나 · 앞뒤 둘이에요는 그대로)
   · 토씨 더함(의 · 에 · 에서 · 에게 · 한테 · 도 · 만 · 처럼 · 까지 · 부터 · 보다) · --keep 「글」 = 이름처럼 보이는 보통 말(예: 「트와이스 멤버 둘이」)은 그대로 */
const PART = ['이에요', '예요', '이라면', '라면', '이랑', '랑', '으로', '에서', '에게', '한테', '처럼', '까지', '부터', '보다', '은', '는', '이', '가', '을', '를', '과', '와', '의', '에', '로', '아', '야', '도', '만']; // 긴 토씨 먼저
const KO_RE = new RegExp('(?<![가-힣])' + esc(FROM) + '(?:(' + PART.join('|') + ')(?![가-힣])|(?![가-힣]))', 'g');
const EN_RE = FROM_EN ? new RegExp('\\b' + esc(FROM_EN) + '\\b', 'g') : null;
const KEEP = process.argv.flatMap((a, i, all) => (a === '--keep' && all[i + 1] ? [all[i + 1]] : []));
const HOLD = '\u0000';
const hold = s => { const held = []; let t = s; for (const k of KEEP) if (t.includes(k)) { t = t.split(k).join(HOLD + held.length + HOLD); held.push(k); } return [t, held]; };
const unhold = (t, held) => t.replace(/\u0000(\d+)\u0000/g, (_, i) => held[+i]);
/** 글 한 조각 바꾸기 — 돌려줌 [새 글, 바꾼 수] */
export function swap(s) {
  let n = 0;
  const [h, held] = hold(s);
  let t = h.replace(KO_RE, (m, p) => { n++; return p ? josa(TO, p) : TO; });
  if (EN_RE) t = t.replace(EN_RE, () => { n++; return TO_EN; });
  return [unhold(t, held), n];
}
/** 범위 목록([시작, 끝]) 안만 바꿈 — 뒤에서부터 */
function swapRanges(src, ranges) {
  let out = src, n = 0;
  for (const [a, b] of [...ranges].sort((x, y) => y[0] - x[0])) { const [t, k] = swap(out.slice(a, b)); if (k) { out = out.slice(0, a) + t + out.slice(b); n += k; } }
  return [out, n];
}
const outside = (src, re) => { const r = [], m = [...src.matchAll(re)]; let at = 0; for (const x of m) { r.push([at, x.index]); at = x.index + x[0].length; } r.push([at, src.length]); return r; };
/** 파일 종류마다 「사람이 보는 글」 자리 */
function textRanges(file, src) {
  if (/\.m?js$/.test(file)) return jsStrings(src).map(x => [x.start, x.end]);
  if (/\.html$/.test(file)) return outside(src, /<!--[\s\S]*?-->/g);
  if (/\.css$/.test(file)) { const r = []; for (const [a, b] of outside(src, /\/\*[\s\S]*?\*\//g)) for (const m of src.slice(a, b).matchAll(/(['"])((?:\\.|(?!\1)[^\\\n])*)\1/g)) r.push([a + m.index + 1, a + m.index + 1 + m[2].length]); return r; }
  if (/\.json$/.test(file)) { const r = []; for (const m of src.matchAll(/"((?:\\.|[^"\\])*)"/g)) r.push([m.index + 1, m.index + 1 + m[1].length]); const note = /^\s*"note"\s*:\s*"(?:\\.|[^"\\])*"/m.exec(src); return note ? r.filter(([a]) => a < note.index || a > note.index + note[0].length) : r; }
  return [];
}
/** 남은 옛 이름(대상 글 안) */
export function leftovers(file, src) {
  const hits = [];
  const ko = new RegExp(KO_RE.source); // 낱말 하나로 선 이름만(보통 말 「일흔둘이」 · 「둘이서」 · --keep 글은 셈 밖 — swap 과 같은 잣대)
  for (const [a, b] of textRanges(file, src)) { const s = hold(src.slice(a, b))[0]; if (ko.test(s) || (EN_RE && new RegExp('\\b' + esc(FROM_EN) + '\\b').test(s))) hits.push(`${file}:${src.slice(0, a).split('\n').length} 「${s.slice(0, 80)}」`); }
  return hits;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  let total = 0; const per = [], left = [];
  for (const f of FILES) {
    const p = path.join(ROOT, f), src = fs.readFileSync(p, 'utf8');
    const [out, n] = swapRanges(src, textRanges(f, src));
    if (n) { per.push(`${f} ${n}`); total += n; if (!DRY) fs.writeFileSync(p, out); }
    left.push(...leftovers(f, DRY ? out : fs.readFileSync(p, 'utf8')));
  }
  console.log(`이름 바꾸기 ${FROM}${FROM_EN ? '/' + FROM_EN : ''} → ${TO}/${TO_EN}${DRY ? ' (해 보기 — 파일은 그대로)' : ''} · 파일 ${per.length}개 · ${total}곳`);
  for (const x of per) console.log('  ' + x);
  if (left.length) { console.log(`남은 옛 이름 ${left.length}곳:`); for (const x of left.slice(0, 40)) console.log('  ' + x); process.exit(1); }
  console.log('남은 옛 이름 0');
}
