#!/usr/bin/env node
// 새 ATLAS 네 눈 점검 — 사장님 2026-10-12 12:41 「업데이트 할때마다 아틀란스 점검을 애플 구글 클로드 cia방식으로 각각 1000만번씩 하라」
//   업데이트(회차)마다 올리기 바로 앞 묶음(코드 = <site>/atlas · 자료 = 그 회차가 만든 자료 폴더)을 네 눈으로 각각 N번(기본 1,000만 번) 다시 확인
//   🍎 애플 — 쉽게 · 빨리 닿나: 자료로 그린 화면 길 지도(atlas.js 링크 규칙과 같게 · 실제 화면에서 모은 지도와 맞대 봄 — tests) 위에서
//      사람처럼 아무 길이나 누름(깨진 길 · 단 건너뛰기) + 화면마다 깊이(회사 3번 · n단 n번) · 처음으로 가는 길 · 다음 단 길 + 화면에 필요한 자료(회사 파일 · 찾기)
//   🔎 구글 — 숫자가 서로 맞나: 같은 숫자가 파일마다 같은가(선 ↔ 회사 종가 · 1주 값 · 바뀐 비율 · 이름 · 갈래 · 업종 · 날짜) ·
//      「한 회사 한 표」 지수 · 오른 곳 · 내린 곳 수를 다른 길로 다시 셈 · 시장 판독 숫자 다시 셈 · 숫자가 모두 참 숫자인가
//   🤖 클로드 — 말이 정직하고 안전한가: 자료 · 시장 판독 글에 사고팔기 권하는 말 · 앞날 장담(화면 금지 말과 같은 목록) · 깨진 글자 ·
//      모형 표지 「모형 가정 아래 추정 · 검증 전」 · 안전 문장 · 장 중 값 표시 · 모르는 값은 「?」 · 말 등급 · 사람 얼굴 그림 없음(막비는 제목 달 · 1장 · 띠에만 — 2026-10-13 03:38)
//   🕵 CIA — 뚫리거나 새는 곳이 없나: 주소 흔들기(atlas.js 의 진짜 길 함수 route() 를 떼어 이상한 주소를 넣어 봄 — 멈춤 · 거짓 까닭 · 바깥으로 가는 길) ·
//      이름 주소 왕복 · 비밀 · 개인 메일 · 바깥 주소 · 숨은 글자 · 끼워 넣은 코드 · 위험한 코드 · 보안 머리말 · 자료 크기
//   셈: 씨앗 무작위(xorshift32 · 다시 돌리면 같은 결과) · 눈마다 먼저 대상을 모두 한 번씩 본 뒤 남은 번 수를 무작위로 채움 → 「번 수」와 「서로 다른 대상 수」를 함께 적음
//   쓰는 법: node scripts/atlas11/t365/inspect4.mjs --site <atlas 폴더가 든 곳 = site 또는 dist> [--data <자료 폴더 = <site>/atlas/data>] [--market <판독 json>]
//            [--n 10000000] [--seed 20261012] [--now <ISO 때 — 「오늘」 · 고른 날이 오늘보다 뒤 · 12일 넘게 묵음을 봄>] [--out <결과 json>] — 실패가 하나라도 있으면 끝 코드 1 · 마지막 줄 = 요약 json
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import crypto from 'node:crypto';
import {HEADER_TOP} from '../site_headers.mjs';
/** 옛 사람 얼굴 그림 판(2026-10-13 03:38 「모든 흔적 다 지워」로 저장소 기록에서도 지운 블롭 43개)이 site 안에 다시 들어오면 막음
 *  목록 = scripts/atlas11/probe/old-media-blobs.txt(그림이 아니라 번호만) · 목록을 못 읽으면 실패(조용히 넘기지 않음) */
const OLD_FACE_LIST = path.join(path.dirname(new URL(import.meta.url).pathname), '../probe/old-media-blobs.txt');
const noOldFaceMemo = new Map(); // 한 번만 셈(네 눈이 1,000만 번 뽑아 물어도 파일은 한 번만 읽음 — 2026-10-13 04:5x 묶음이 10분 넘게 걸리던 것)
function noOldFace(siteDir) {
  if (noOldFaceMemo.has(siteDir)) return noOldFaceMemo.get(siteDir);
  const r = noOldFaceOnce(siteDir); noOldFaceMemo.set(siteDir, r); return r;
}
function noOldFaceOnce(siteDir) {
  let old; try { old = new Set(fs.readFileSync(OLD_FACE_LIST, 'utf8').split(/\s+/).filter(Boolean)); } catch { return false; }
  if (!old.size) return false;
  const walk = d => fs.readdirSync(d, {withFileTypes: true}).flatMap(e => e.isDirectory() ? (e.name === 'data' || e.name === 'node_modules' ? [] : walk(path.join(d, e.name))) : /\.(jpe?g|png|webp|gif|mp4|webm|svg|avif)$/i.test(e.name) ? [path.join(d, e.name)] : []);
  for (const f of walk(siteDir)) { const b = fs.readFileSync(f); if (old.has(crypto.createHash('sha1').update(Buffer.concat([Buffer.from(`blob ${b.length}\0`), b])).digest('hex'))) return false; }
  return true;
}


export const INSPECT_VERSION = 'i4-v1';
/** 화면 금지 말 — site_check.mjs BANNED 와 같은 목록(시험이 맞대 봄) */
export const BANNED = ['예측', '예외 없이', '절대', '상승 신호', '폭락 경보기', '팔 때', '들어갈 때', '시작을 맞힌다', '곧 오른다', '오를 것', '내릴 것', '사라', '팔라', '추천', '목표가', '확실', '보장', '무조건', '확률'];
/** 좁은 금지 말 — 힘 붙은 365곳(사장님 2026-10-13 13:04 「힘이 붙는 종목으로」 · 클로드팀) · site_check.mjs NARROW 와 같은 목록(시험이 맞대 봄) — 이름 · 설명 글이 「사라는 신호」로 읽히지 않게 */
export const NARROW = ['유망', '주목', '강세', '놓치', '매수 신호', '살 만한', '모멘텀', '힘이 붙는', '급등주'];
/** 옛 기준 말 — 지난 회차 · 봉인 꼬리표 「옛 규칙(대세 업종)」 밖에서는 0(2026-10-13 13:04 · 힘 붙은 365곳) */
export const OLD_RULE_WORDS = ['대세', '1층 —', '2층 —', '3층 —', '두 팀 모두', '구글팀 잣대', 'CIA팀 잣대', '힘 붙은 365곳', '그중 「힘 붙음」', '빈자리에 들었습니다', '번째 안이라 남겼습니다']; // 뒤 넷: 2026-10-14 00:03 멍거 조건 뒤 옛 「힘 붙은 365곳」 글
export const oldRuleHits = t => { const x = String(t).split('옛 규칙(대세 업종)').join('').split('옛 규칙(힘 붙음)').join(''); return OLD_RULE_WORDS.filter(w => x.includes(w)); };
const SAFETY = '저는 투자 상담사가 아닙니다 · 이 자료는 지난 기록을 센 공부이며, 특정 종목의 매수 · 매도 · 보유 또는 시장 전망을 권하지 않습니다.';
const MODEL_TAG = '모형 가정 아래 추정 · 검증 전';
/** 지운 36곳 화면의 글(옛 atlas.js 에 있던 그대로) — 보이는 글 · 자료 글에 다시 나오면 실패 · 「36곳 내림」 같은 셈 글(회차마다 바뀌는 수)은 아님
 *  (2026-10-13 14:2x 힘 붙은 365곳 화면 돌기에서 바이오 갈래 「36곳 내림」을 36곳 글로 잘못 잡은 것 — 자료 글 검사도 같은 까닭으로 넓은 「36곳」 대신 이 목록) · site_check.mjs OLD36 과 같은 목록(시험이 맞대 봄) */
export const OLD36_TEXT = ['매수 검토', '셈 차례', '봉인 36곳', '365곳 · 36곳', '36곳이 365곳 평균보다', '한 달 평균: 36곳', '36곳은 셈으로 추린', '36곳 밖 —', '36곳 고리', '36곳 탭'];
export const has36Text = t => OLD36_TEXT.some(w => String(t).includes(w));
const NO36 = /(?<![\d,])36곳|pick36|view36|tab36|매수 검토|["']#\/36["']/; // 「136곳」 같은 숫자는 아님 // 사장님 2026-10-13 06:45 「매수 검토 36곳 영구 삭제 하라」 — 다시 들어오면 클로드 눈이 막음
const LEVELS = new Set(['아주 높다', '높다', '반반', '낮다', '아주 낮다']);
const CODE_HOSTS = new Set(['aaa7377.com', 'kind.krx.co.kr', 'dart.fss.or.kr', 'www.w3.org']);
// 사람 이름 · 회사 이름 · 업종 이름 · 기사 제목처럼 밖에서 온 이름은 금지 말을 보지 않음(「사라」 → 「사라진」 같은 이름 · 제목) — 깨진 글자 · 숨은 글자 · 끼운 코드는 봄
const PROPER = new Set(['name', 'n', 'i', 'sector', 'products', 'title', 'src', 'url', 'press', 'who', 'c', 'code', 'members', 'inds', 'short', 'pn', 'source']);

export function rng(seed) { let x = (seed >>> 0) || 1; return () => { x ^= x << 13; x >>>= 0; x ^= x >>> 17; x ^= x << 5; x >>>= 0; return x / 4294967296; }; }

function load(siteDir, dataDir) {
  const A = path.join(siteDir, 'atlas'), D = dataDir ?? path.join(A, 'data');
  const J = f => JSON.parse(fs.readFileSync(path.join(D, f), 'utf8'));
  const opt = f => { try { return J(f); } catch { return null; } };
  const S = {siteDir, dataDir: D, js: fs.readFileSync(path.join(A, 'atlas.js'), 'utf8'), css: fs.readFileSync(path.join(A, 'atlas.css'), 'utf8'), html: fs.readFileSync(path.join(A, 'index.html'), 'utf8'),
    fontsCss: fs.existsSync(path.join(A, 'fonts.css')) ? fs.readFileSync(path.join(A, 'fonts.css'), 'utf8') : '',
    core: J('core.json'), comp: J('comp.json'), lines: J('lines.json'), names: J('names.json'), days: J('days.json'), range: J('range.json'), grow: opt('grow.json'), time: opt('time.json'), home: opt('home.json'), upd: opt('updates.json'), co: {}, coBytes: {}, files: {}};
  // 모든 회사(2026-10-14 「나」) — 갈래 · 업종 · 회사 흐름 = 모든 회사 · core.mkt 가 있으면 mkt.json 은 꼭 있어야 함(없으면 J 가 멈춤 → 점검 실패)
  S.mkt = S.core.mkt ? J('mkt.json') : null; S.mk = S.mkt?.companies ?? null;
  const coDir = path.join(D, 'co');
  for (const f of fs.existsSync(coDir) ? fs.readdirSync(coDir) : []) { if (!f.endsWith('.json')) continue; const t = fs.readFileSync(path.join(coDir, f), 'utf8'); S.coBytes[f.slice(0, -5)] = t.length; try { S.co[f.slice(0, -5)] = JSON.parse(t); } catch { S.co[f.slice(0, -5)] = null; } }
  for (const f of fs.readdirSync(D)) { const p = path.join(D, f); if (fs.statSync(p).isFile()) S.files[f] = fs.statSync(p).size; }
  S.codes = Object.keys(S.comp.companies);
  S.all = S.mk ? Object.keys(S.mk) : S.codes; // 모든 회사(옛 자료면 고른 곳)
  S.gid = new Map(S.core.groups.map(g => [g.id, g]));
  S.iby = new Map(S.core.industries.map(i => [i.name, i]));
  return S;
}
/** 회사 줄이 가는 곳 — 고른 곳(금빛)은 3단 회사 · 모든 회사 가운데 나머지는 밖 칸(#/x/ — atlas.js viewIndustry · hrefInd 와 같은 규칙) */
const isPk = (S, c) => (S.mk ? !!S.mk[c]?.p : !!S.comp.companies[c]);
const coHref = (S, c) => (isPk(S, c) ? '#/c/' : '#/x/') + c;

// ── 모든 글(자료) — [어디, 키, 글] · 고유 이름은 표시 ──
function strings(obj, where, out, key = '') {
  if (typeof obj === 'string') out.push({where, key, s: obj, proper: PROPER.has(key)});
  else if (Array.isArray(obj)) for (const x of obj) strings(x, where, out, key);
  else if (obj && typeof obj === 'object') for (const [k, v] of Object.entries(obj)) strings(v, where, out, k);
  return out;
}
function numbers(obj, where, out, key = '') {
  if (typeof obj === 'number') out.push({where, key, v: obj});
  else if (Array.isArray(obj)) for (const x of obj) numbers(x, where, out, key);
  else if (obj && typeof obj === 'object') for (const [k, v] of Object.entries(obj)) numbers(v, where, out, k);
  return out;
}

// ═════════ 🍎 애플 — 화면 길 지도(atlas.js 와 같은 링크 규칙) ═════════
export function siteGraph(S) {
  const {core} = S, comp = S.comp.companies;
  const TABS = ['#/', '#/list', '#/up', '#/info']; // 아래 탭 셋 + 맨 위 「?」 단추(index.html · 2026-10-13 06:45 탭 하나 지움)
  const hrefInd = i => (i.n === 1 ? coHref(S, i.members[0]) : '#/i/' + encodeURIComponent(i.name));
  const nodes = new Map();
  const add = (r, links, step = null, co = null, allow = null) => nodes.set(r, {links: [...links.filter(Boolean), ...TABS], step, co, allow});
  const H = S.home?.s365, ends = [H?.top?.c, H?.bot?.c].filter(c => c && comp[c]).map(c => '#/c/' + c); // 첫 화면 365곳 막대 양 끝(가장 많이 오른 · 내린 곳 — 2026-10-12 14:54)
  // 「오늘 업종」 줄(4장 강한 3 · 약한 3 + 「자세히」 강한 7 · 약한 7) → 그 업종(사장님 2026-10-14 15:01(싱가포르) 「여기 클릭 하면 7단구조 나오게해」 · atlas.js secHref 와 같은 셈 — core.secInd)
  const SI = core.secInd ?? {}, secL = [...(S.home?.sectors?.strong ?? []), ...(S.home?.sectors?.weak ?? [])].map(g => { const n = SI[String(g.name ?? '').replace(/\s+/g, '')], i = n ? S.iby.get(n) : null; return i ? hrefInd(i) : null; });
  add('#/', [...ends, ...secL, ...core.groups.map(g => '#/g/' + g.id), '#/time'], 0, null, 0);
  add('#/list', core.industries.map(hrefInd), null, null, 1);
  add('#/up', [], null, null, 1); add('#/time', [], null, null, 2); add('#/info', [], null, null, 1);
  for (const g of core.groups) add('#/g/' + g.id, ['#/', ...(g.inds ?? []).map(n => (S.iby.get(n) ? hrefInd(S.iby.get(n)) : '#/i/' + encodeURIComponent(n)))], 1, null, 1);
  for (const i of core.industries) if (i.n > 1) add('#/i/' + encodeURIComponent(i.name), ['#/', '#/g/' + i.g, ...i.members.map(c => coHref(S, c))], 2, null, 2);
  // 밖 칸(모든 회사 가운데 고른 곳이 아닌 회사 · 2026-10-14 「나」) — 판(창)이지만 「3번이면 회사」를 보려고 길 지도에 넣음 · 처음으로 · 그 업종(atlas.js showInfo 업종 고리)
  if (S.mk) for (const [c, m] of Object.entries(S.mk)) if (!m.p) { const i = S.iby.get(m.i); add('#/x/' + c, ['#/', i ? hrefInd(i) : null], null, null, 3); } // 단 없음(회사 단이 아닌 판) · 3번 안
  for (const c of S.codes) {
    const x = comp[c], i = S.iby.get(x.i), C3 = '#/c/' + c;
    const ST = ['#/g/' + x.g, i && i.n > 1 ? hrefInd(i) : null, C3, C3 + '/past', C3 + '/rivals', C3 + '/grow', C3 + '/range']; // 1 갈래 … 7 범위
    const upto = s => ST.slice(0, Math.min(s + 1, 7)).filter((hf, k) => hf && k !== s - 1); // 지나온 단 · 바로 다음 단만(자기는 뺌)
    add(C3, ['#/', ...upto(3)], 3, c, 3);
    add(C3 + '/past', upto(4), 4, c, 4); add(C3 + '/rivals', upto(5), 5, c, 5); add(C3 + '/grow', upto(6), 6, c, 6);
    add(C3 + '/range', [...upto(7), '#/time', C3, '#/'], 7, c, 7);
  }
  // 깊이 — 첫 화면에서 넓게
  const depth = new Map([['#/', 0]]), q = ['#/'];
  for (let k = 0; k < q.length; k++) for (const hf of nodes.get(q[k]).links) if (nodes.has(hf) && !depth.has(hf)) { depth.set(hf, depth.get(q[k]) + 1); q.push(hf); }
  return {nodes, depth};
}
function appleLens(S) {
  const {nodes, depth} = siteGraph(S), routes = [...nodes.keys()], idx = new Map(routes.map((r, k) => [r, k]));
  const comp = S.comp.companies, stepOf = r => nodes.get(r)?.step ?? null, coOf = r => nodes.get(r)?.co ?? null;
  const L = routes.map(r => nodes.get(r).links.map(hf => ({j: idx.get(hf) ?? -1, hf, skip: stepOf(r) >= 3 && stepOf(hf) >= 3 && coOf(hf) === coOf(r) && stepOf(hf) > stepOf(r) + 1})));
  const home = idx.get('#/'); let cur = home;
  const inNames = new Set(S.names.rows.filter(r => r.s === 'in').map(r => r.c)), nameOf = new Map(S.names.rows.map(r => [r.c, r.n]));
  return {key: 'apple', name: '애플', what: '쉽게 · 빨리 닿나 — 자료로 그린 화면 길 지도 위에서 사람처럼 눌러 봄', kinds: [
    {k: 'screen', name: '화면마다 — 깊이(회사 3번 · n단 n번) · 처음으로 · 다음 단 · 깨진 길', items: routes.length, check(i) {
      const r = routes[i], nd = nodes.get(r), d = depth.get(r);
      if (d == null) return `${r} 첫 화면에서 닿지 않음`;
      if (nd.allow != null && d > nd.allow) return `${r} ${d}번 눌러야 닿음(${nd.allow}번 안이어야 함)`;
      if (!nd.links.includes('#/')) return `${r} 처음으로 가는 길 없음`;
      if (nd.step >= 3 && nd.step < 7 && !nd.links.some(hf => coOf(hf) === nd.co && stepOf(hf) === nd.step + 1)) return `${r} 다음 단(${nd.step + 1}단) 길 없음`;
      const br = L[i].find(e => e.j < 0); if (br) return `${r} → ${br.hf} 깨진 길(그런 화면 없음)`;
      return null; }},
    {k: 'click', name: '사람처럼 아무 길이나 누름(2%는 새 사람)', items: Infinity, check(_, rnd) {
      if (rnd() < 0.02) { cur = home; return null; }
      const ls = L[cur], e = ls[(rnd() * ls.length) | 0];
      if (e.j < 0) { const from = routes[cur]; cur = home; return `${from} → ${e.hf} 깨진 길`; }
      if (e.skip) { const from = routes[cur]; cur = e.j; return `${from} → ${e.hf} 단 건너뜀`; }
      cur = e.j; return null; }},
    {k: 'company', name: '회사마다 — 갈래 · 업종 · 선 · 회사 파일(4~7단 자료)', items: S.codes.length, check(i) {
      const c = S.codes[i], x = comp[c], ind = S.iby.get(x.i), g = S.gid.get(x.g);
      if (!g) return `${c} 갈래 ${x.g} 없음`;
      if (!ind) return `${c} 업종 ${x.i} 없음`;
      if (ind.g !== x.g || !ind.members.includes(c)) return `${c} 업종 ${x.i} 명단에 없음`;
      if (!(g.inds ?? []).includes(ind.name)) return `${c} 업종 ${x.i} 가 갈래 ${x.g} 목록에 없음`;
      const ln = S.lines.lines[c]; if (!ln || ln.length !== S.core.dates.length) return `${c} 선 칸 수 ${ln?.length} ≠ ${S.core.dates.length}`;
      if (!S.co[c]) return `${c} 회사 파일(co/${c}.json) 없음 — 4~7단이 「자료를 못 읽었습니다」`;
      if (!inNames.has(c)) return `${c} 찾기 이름표에 「고른 곳 안」으로 없음`;
      return null; }},
    {k: 'list', name: '목록마다 — 업종 명단 · 찾기 이름표', items: S.core.industries.length + 1, check(i) {
      if (i < S.core.industries.length) { const ind = S.core.industries[i]; const bad = ind.members.find(c => !(S.mk ? S.mk[c] : comp[c])); if (bad) return `업종 ${ind.name} 의 ${bad} 가 ${S.mk ? '모든 회사 자료' : '고른 곳'}에 없음`; if (ind.n !== ind.members.length) return `업종 ${ind.name} 곳 수 ${ind.n} ≠ 명단 ${ind.members.length}`; return S.gid.has(ind.g) ? null : `업종 ${ind.name} 갈래 ${ind.g} 없음`; }
      const extra = [...inNames].filter(c => !comp[c]); return extra.length ? `찾기에 고른 곳 안이라는데 없는 회사 ${extra.slice(0, 3).join(' · ')}` : null; }},
    // 모든 회사(2026-10-14 「나」) — 회사마다 업종 명단 · 갈래 · 선 칸 수 · 고른 곳 표시 = 고른 곳 자료 · 이름 = 찾기 이름표 · 밖 칸 닿음
    {k: 'mkt', name: '모든 회사 — 업종 · 갈래 · 선 · 금빛(고른 곳) · 이름', items: S.mk ? S.all.length : 0, check(i) {
      const c = S.all[i], m = S.mk[c], ind = S.iby.get(m.i);
      if (!ind) return `${c} 업종 ${m.i} 없음`;
      if (!ind.members.includes(c)) return `${c} 업종 ${m.i} 명단에 없음`;
      if (!(S.gid.get(ind.g)?.inds ?? []).includes(ind.name)) return `${c} 업종 ${m.i} 가 갈래 ${ind.g} 목록에 없음`;
      if (!Array.isArray(m.l) || m.l.length !== S.core.dates.length) return `${c} 선 칸 수 ${m.l?.length} ≠ ${S.core.dates.length}`;
      if (!!m.p !== !!comp[c]) return `${c} 금빛(고른 곳) 표시 ${!!m.p} ≠ 고른 곳 자료 ${!!comp[c]}`;
      if (nameOf.get(c) !== m.n) return `${c} 이름 「${m.n}」 ≠ 찾기 이름표 「${nameOf.get(c)}」`;
      return null; }},
  ]};
}

// ═════════ 🔎 구글 — 숫자 맞대기 ═════════
function googleLens(S, market, now = new Date()) {
  const {core} = S, comp = S.comp.companies, lines = S.lines.lines, dates = core.dates, W = dates.length;
  // 모든 회사(2026-10-14 「나」) — 갈래 · 업종 · 모든 회사 지수는 mkt.json 선으로 · 고른 곳 전체는 lines.json 선으로(따로 셈)
  const LN = c => (S.mk ? S.mk[c]?.l : lines[c]), CH = c => (S.mk ? S.mk[c]?.c : comp[c]?.chg);
  const gOfC = c => (S.mk ? S.iby.get(S.mk[c].i)?.g : comp[c].g);
  const dIdx = new Map(S.days.dates.map((d, k) => [d, k]));
  const pairs = []; for (let a = 0; a < W; a++) for (let b = a + 1; b < W; b++) pairs.push(a * 64 + b);
  // 「한 회사 한 표」 지수를 선(lines)에서 따로 다시 셈 — 하루 ±50% 넘는 값 뺌 · 이어 곱함
  const eq = (cs, src = LN) => { const out = [100]; let lvl = 100; for (let k = 1; k < W; k++) { let s = 0, n = 0; for (const c of cs) { const a = src(c)?.[k - 1], b = src(c)?.[k]; if (a && b) { const r = b / a - 1; if (Math.abs(r) < 0.5) { s += r; n++; } } } if (n) lvl *= 1 + s / n; out.push(lvl); } return out; };
  const series = [{name: '고른 곳 전체', obj: core.all, cs: S.codes, src: c => lines[c], ch: c => comp[c]?.chg}, ...(core.mkt ? [{name: '모든 회사', obj: core.mkt, cs: S.all}] : []),
    ...core.groups.map(g => ({name: '갈래 ' + g.short, obj: g, cs: S.all.filter(c => gOfC(c) === g.id)})), ...core.industries.map(i => ({name: '업종 ' + i.name, obj: i, cs: i.members}))];
  for (const s of series) s.re = eq(s.cs, s.src ?? LN);
  const nums = [...numbers(core, 'core', []), ...numbers(S.comp, 'comp', []), ...numbers(S.lines, 'lines', []), ...numbers(S.range, 'range', []), ...(S.home ? numbers(S.home, 'home', []) : []), ...(S.mkt ? numbers(S.mkt, 'mkt', []) : [])];
  // 첫 화면 종합 정보(home.json · 2026-10-12 14:54) — 다른 길로 다시 셈
  const HM = S.home, hchk = [];
  if (HM) {
    hchk.push(['고른 날 · 기준일 = 고른 곳 자료', () => HM.asOf === core.asOf && HM.base === core.base]);
    for (const k of ['KOSPI', 'KOSDAQ']) { const x = HM.idx?.[k]; if (!x) continue; const R = x.rows, n = R.length;
      hchk.push([`${k} 날짜 차례 · 값`, () => R.every((r, j) => r[1] > 0 && (!j || r[0] > R[j - 1][0])) && R.at(-1)[0] === x.date && R.at(-1)[1] === x.close]);
      hchk.push([`${k} 하루 비율`, () => n < 2 || Math.abs((R[n - 1][1] / R[n - 2][1] - 1) * 100 - x.day) <= 0.006]);
      hchk.push([`${k} 가장 높던 · 낮던 날`, () => x.hi.v === Math.max(...R.map(r => r[1])) && x.lo.v === Math.min(...R.map(r => r[1])) && Math.abs((x.close / x.hi.v - 1) * 100 - x.hi.vs) <= 0.006 && Math.abs((x.close / x.lo.v - 1) * 100 - x.lo.vs) <= 0.006]);
      hchk.push([`${k} 3개월 안`, () => { const f = new Date(x.date + 'T00:00:00Z'); f.setUTCMonth(f.getUTCMonth() - 3); return R[0][0] >= f.toISOString().slice(0, 10) && n >= 40; }]); }
    const L = HM.s365?.list ?? [];
    hchk.push(['고른 곳 오늘 오름 · 내림 다시 셈', () => { let up = 0, down = 0; for (const c of S.codes) { const a = lines[c][W - 2], b = lines[c][W - 1]; if (a == null || b == null || !a) continue; if (b > a) up++; else if (b < a) down++; } return HM.s365.up === up && HM.s365.down === down; }]);
    hchk.push(['고른 곳 막대 차례 · 양 끝', () => L.every((x, j) => comp[x[0]] && (!j || L[j - 1][1] >= x[1])) && (!L.length || (HM.s365.top.c === L[0][0] && HM.s365.bot.c === L.at(-1)[0]))]);
    hchk.push(['20거래일 견줌 = 고른 곳 지수', () => HM.cmp20.eq === core.all.chg && HM.cmp20.cw === core.all.cwChg && HM.cmp20.base === core.base]);
    if (HM.sectors) { const T = HM.sectors;
      hchk.push(['업종 강 7 · 약 7 차례 · 회사 5곳 이상', () => T.strong.every((g, j) => g.n >= 5 && g.name !== '기타' && (!j || T.strong[j - 1].chg >= g.chg)) && T.weak.every((g, j) => g.n >= 5 && g.name !== '기타' && (!j || T.weak[j - 1].chg <= g.chg)) && T.strong.length <= 7 && T.weak.length <= 7]);
      hchk.push(['업종 이름표(강한 7 · 덜 내린 7)', () => T.label === (T.strong.reduce((t, g) => t + g.chg, 0) / Math.max(1, T.strong.length) < 0 ? '덜 내린 7' : '강한 7')]);
      hchk.push(['업종 고른 곳 수 다시 셈', () => [...T.strong, ...T.weak].every(g => g.in365 === S.codes.filter(c => comp[c].sector === g.name).length)]);
      hchk.push(['업종 날짜 = 같이 받은 지수의 마지막 날', () => T.date == null || HM.stale?.sectors || HM.stale?.idx || T.date === (HM.idx?.KOSPI?.date ?? HM.idx?.KOSDAQ?.date)]); } // 2026-10-12 18:31 「오늘 업종」을 보는 날짜로 셈
    if (HM.us) hchk.push(['미국 지수가 60거래일 낮음 ~ 높음 안', () => HM.us.rows.every(r => r.close == null || (r.close >= r.lo - 1e-9 && r.close <= r.hi + 1e-9))]);
    // 「!」 문턱 home-v3(2026-10-13) — 지수: 평소(앞 20거래일 하루 움직임 크기 평균)의 2.5배 넘고 1.5% 넘음 · 또는 하루 5% 넘음 · 외국 투자자 1조 원 — 따로 셈해 맞는 「!」만 있고 빠진 「!」 없음
    const idxWant = k => { const x = HM.idx?.[k]; if (!x?.rows || x.day == null || HM.stale?.idx) return false; const c = x.rows.map(r => r[1]), ch = c.slice(1).map((v, i) => (v / c[i] - 1) * 100), t = Math.abs(ch[ch.length - 1]);
      const prev = ch.slice(Math.max(0, ch.length - 21), ch.length - 1), u = prev.length === 20 ? prev.reduce((s, v) => s + Math.abs(v), 0) / 20 : null; return t >= 5 || (u != null && t >= 2.5 * u && t >= 1.5); };
    hchk.push(['「!」 문턱(지수 평소의 2.5배 · 1.5% · 늘 5% · 외국 투자자 1조 원)', () => (HM.alerts ?? []).every(a => (a.kind === 'idx' ? idxWant(a.key) : Math.abs(a.v) >= 10000)) && ['KOSPI', 'KOSDAQ'].every(k => idxWant(k) === (HM.alerts ?? []).some(a => a.kind === 'idx' && a.key === k))]);
    hchk.push(['「장 중」 표시 = 서울 정규장(9:00 ~ 15:30)에 받은 값만', () => { const t = String(HM.kst ?? '').slice(11, 16); return !HM.live || (t >= '09:00' && t < '15:30'); }]); // 2026-10-12 16:04 회차: 장 끝 뒤에도 「장 중」이던 것
  }
  const fileAsOf = [['lines.json', S.lines.asOf], ['comp.json', S.comp.asOf], ['days.json', S.days.asOf], ['names.json', S.names.asOf], ['days 마지막 날', S.days.dates.at(-1)], ...(S.mkt ? [['mkt.json', S.mkt.asOf]] : [])];
  // 시장 판독 — 다른 길(회사마다 「바뀐 비율」 부호가 아니라 선의 마지막 두 칸)로 다시 셈
  const mk = []; if (market) {
    // 판독 규칙 mr-v2(2026-10-14 「나」) = 모든 회사(mkt.json 선 · core.mkt) · mr-v1 = 고른 곳(lines.json · core.all)
    const v2 = !!S.mk, P = v2 ? S.all : S.codes, src = v2 ? LN : c => lines[c], A = v2 ? core.mkt : core.all;
    let up = 0, down = 0; for (const c of P) { const L = src(c); const a = L[W - 2], b = L[W - 1]; if (a == null || b == null || !a) continue; if (b > a) up++; else if (b < a) down++; }
    const gs = core.groups.filter(g => g.chg != null), mx = gs.reduce((m, g) => (g.chg > m.chg ? g : m), gs[0]), mn = gs.reduce((m, g) => (g.chg < m.chg ? g : m), gs[0]);
    mk.push(['판독 규칙', market.rule, v2 ? 'mr-v2' : 'mr-v1'], ['판독 곳 수', market.n, P.length], ['첫 줄 곳 수', (market.lines?.[0] ?? '').includes(`${v2 ? '모든 회사' : '고른'} ${P.length.toLocaleString('ko-KR')}곳 가운데`), true]);
    mk.push(['하루 오른 곳', market.day?.up, up], ['하루 내린 곳', market.day?.down, down], ['20거래일 한 회사 한 표', market.span?.chg, A.chg], ['20거래일 큰 회사는 크게', market.span?.cwChg, A.cwChg],
      ['가장 센 갈래', market.groups?.top?.id, mx?.id], ['가장 약한 갈래', market.groups?.low?.id, mn?.id], ['고른 날', market.asOf, core.asOf], ['장 중 값 표시', market.provisional, !!core.provisional]);
    const t = new Date(now.getTime() + 9 * 36e5).toISOString(); // 「장 중」 말 = 정규장(9:00 ~ 15:30)에 고른 날 값을 받았을 때만(2026-10-12 16:48 회차: 장 끝 뒤에도 「장 중 값」)
    mk.push(['「장 중」 말 = 정규장 때만', /장 중/.test(market.lines?.[0] ?? ''), !!core.provisional && t.slice(0, 10) === core.asOf && t.slice(11, 16) >= '09:00' && t.slice(11, 16) < '15:30']);
  }
  return {key: 'google', name: '구글', what: '숫자가 서로 맞나 — 같은 숫자를 다른 파일 · 다른 길로 다시 셈', kinds: [
    {k: 'window', name: '회사 선 ↔ 회사 종가(아무 두 날 사이 비율)', items: S.codes.length * pairs.length, check(i) {
      const c = S.codes[(i / pairs.length) | 0], p = pairs[i % pairs.length], a = (p / 64) | 0, b = p % 64, co = S.co[c];
      if (!co) return `${c} 회사 파일 없음`;
      const ja = dIdx.get(dates[a]) - co.k0, jb = dIdx.get(dates[b]) - co.k0, xa = co.close[ja], xb = co.close[jb], la = lines[c][a], lb = lines[c][b];
      if (!xa || !xb || la == null || lb == null) return (!xa || !xb) === (la == null || lb == null) || (!xa && la == null) || (!xb && lb == null) ? null : `${c} ${dates[a]}~${dates[b]} 값 있음 · 없음이 다름`;
      const d = Math.abs(lb / la - xb / xa); return d <= 2e-4 * (xb / xa) + 1e-9 ? null : `${c} ${dates[a]}~${dates[b]} 선 ${(lb / la).toFixed(5)} ≠ 종가 ${(xb / xa).toFixed(5)}`; }},
    {k: 'company', name: '회사 — 1주 값 · 20거래일 비율 · 이름 · 번호', items: S.codes.length * 4, check(i) {
      const c = S.codes[i >> 2], x = comp[c], co = S.co[c], L = lines[c];
      switch (i & 3) {
        case 0: { const lc = co ? co.close.findLast(v => v != null) ?? null : undefined; return co && x.price === lc ? null : `${c} 1주 값 ${x.price} ≠ 회사 파일 마지막 종가 ${lc}`; } // 마지막 값 있는 날(거래가 멈춘 회사도 남는 멍거 갈래 — 끝 칸이 빈 날일 수 있음 · 2026-10-14)
        case 1: if (L[0] == null || L[W - 1] == null) return x.chg == null ? null : `${c} 선이 비었는데 비율 ${x.chg}`; return Math.abs(x.chg - (L[W - 1] / L[0] * 100 - 100)) <= 0.011 ? null : `${c} 비율 ${x.chg} ≠ 선 ${(L[W - 1] / L[0] * 100 - 100).toFixed(2)}`;
        case 2: { const r = S.names.rows.find(y => y.c === c); return r && r.n === x.name ? null : `${c} 이름 「${x.name}」 ≠ 찾기 이름표 「${r?.n}」`; }
        default: return co && co.code === c ? null : `${c} 회사 파일 번호 ${co?.code}`;
      } }},
    {k: 'mktline', name: '모든 회사 — 20거래일 비율 = 선 · 고른 곳 선 = lines.json(2026-10-14 「나」)', items: S.mk ? S.all.length : 0, check(i) {
      const c = S.all[i], m = S.mk[c], L = m.l;
      if (m.p && (JSON.stringify(L) !== JSON.stringify(lines[c]) || m.c !== comp[c]?.chg)) return `${c} 고른 곳인데 모든 회사 선 · 비율이 고른 곳 자료와 다름`;
      if (L[0] == null || L[W - 1] == null) return m.c == null ? null : `${c} 선이 비었는데 비율 ${m.c}`;
      return Math.abs(m.c - (L[W - 1] / L[0] * 100 - 100)) <= 0.011 ? null : `${c} 비율 ${m.c} ≠ 선 ${(L[W - 1] / L[0] * 100 - 100).toFixed(2)}`; }},
    {k: 'index', name: '「한 회사 한 표」 지수(전체 · 갈래 · 업종) 날마다 다시 셈', items: series.length * W, check(i) {
      const s = series[(i / W) | 0], k = i % W, got = s.obj.v?.[k];
      return got != null && Math.abs(got - s.re[k]) <= 0.12 ? null : `${s.name} ${dates[k]} 지수 ${got} ≠ 다시 셈 ${s.re[k].toFixed(2)}`; }},
    {k: 'count', name: '오른 곳 · 내린 곳 · 곳 수(전체 · 갈래 · 업종)', items: series.length, check(i) {
      const s = series[i], ch = s.ch ?? CH, up = s.cs.filter(c => ch(c) > 0).length, down = s.cs.filter(c => ch(c) < 0).length;
      if (s.obj.n != null && s.obj.n !== s.cs.length) return `${s.name} 곳 수 ${s.obj.n} ≠ ${s.cs.length}`;
      return s.obj.up === up && s.obj.down === down ? null : `${s.name} 오름 ${s.obj.up} · 내림 ${s.obj.down} ≠ 다시 셈 ${up} · ${down}`; }},
    {k: 'range', name: '7단 범위 — 고른 회사 그대로 · 고른 목록 · 차례 없음(2026-10-13 06:45 「영구 삭제」)', items: S.codes.length + 1, check(i) {
      if (i === S.codes.length) return ['picks', 'backtest', 'cutN', 'total'].some(k => k in S.range) ? '범위 자료에 고른 목록 · 시험 칸이 있음' : (S.range.asOf === core.asOf ? null : `범위 날짜 ${S.range.asOf} ≠ 고른 날 ${core.asOf}`);
      const c = S.codes[i], k = S.range.companies?.[c]; if (!k) return `${c} 7단 범위 자료 없음`; if ('rank' in k || 'cut' in k) return `${c} 범위 자료에 차례 · 지움 칸`;
      return !k.ok || (k.win.length === 4 && k.big.length === 4) ? null : `${c} 4방향 칸 수 ${k.win.length} · ${k.big.length}`; }},
    {k: 'date', name: '날짜 — 창 21칸 · 기준일 · 고른 날 · 파일마다 같은 날', items: W + fileAsOf.length + 1, check(i, rnd, ctx) {
      if (i < W) { if (i && !(dates[i] > dates[i - 1])) return `날짜 차례 ${dates[i - 1]} → ${dates[i]}`; if (!dIdx.has(dates[i])) return `${dates[i]} 가 긴 날짜표에 없음`; return null; }
      i -= W; if (i < fileAsOf.length) { const [f, d] = fileAsOf[i]; return d === core.asOf ? null : `${f} 날짜 ${d} ≠ 고른 날 ${core.asOf}`; }
      if (core.base !== dates[0] || core.asOf !== dates[W - 1]) return `기준일 ${core.base} · 고른 날 ${core.asOf} 가 창 끝과 다름`;
      const today = ctx.todayKst; if (core.asOf > today) return `고른 날 ${core.asOf} 이 오늘(${today})보다 뒤`;
      const age = (Date.parse(today) - Date.parse(core.asOf)) / 864e5; return age <= 12 ? null : `고른 날 ${core.asOf} 이 ${age}일 묵음(12일 넘음)`; }},
    {k: 'number', name: '숫자가 모두 참 숫자인가(NaN · 끝없음 없음)', items: nums.length, check(i) { const x = nums[i]; return Number.isFinite(x.v) ? null : `${x.where}.${x.key} = ${x.v}`; }},
    {k: 'market', name: '시장 판독 숫자 다시 셈', items: mk.length, check(i) { const [what, got, want] = mk[i]; return got === want ? null : `판독 ${what} ${got} ≠ 다시 셈 ${want}`; }},
    {k: 'home', name: '첫 화면 종합 정보 다시 셈(지수 · 고른 곳 · 업종 · 미국 · 「!」)', items: hchk.length, check(i) { let ok = false; try { ok = hchk[i][1](); } catch { ok = false; } return ok ? null : `첫 화면: ${hchk[i][0]}`; }},
  ]};
}

// ═════════ 🤖 클로드 — 말 ═════════
function claudeLens(S, market) {
  const comp = S.comp.companies;
  const texts = [...strings(S.core, 'core', []), ...strings(S.comp, 'comp', []), ...strings(S.names, 'names', []), ...strings(S.range, 'range', []), ...(S.grow ? strings(S.grow, 'grow', []) : []), ...(S.time ? strings(S.time, 'time', []) : []), ...(S.home ? strings(S.home, 'home', []) : []), ...(S.mkt ? strings(S.mkt, 'mkt', []) : [])];
  for (const c of S.codes) if (S.co[c]) strings(S.co[c], 'co/' + c, texts);
  const mlines = (market?.lines ?? []).map(s => ({where: '시장 판독', key: 'line', s, proper: false}));
  texts.push(...mlines);
  const BROKEN = /�|Ã.|Â.|ì[\u0080-¿]|ë[\u0080-¿]|ê[\u0080-¿]/;
  const growCos = S.grow ? Object.entries(S.grow.companies ?? {}) : [];
  const unknownKeys = ['per', 'r1y', 'mdd1y', 'chg', 'mdd', 'cap', 'price'];
  // 한 번만 셈(네 눈이 1,000만 번 뽑아 물어도 — 2026-10-13 07:2x 묶음이 4분 넘게 걸리던 것 · 옛 얼굴 문과 같은 까닭)
  const no36 = !NO36.test(S.js + S.css + S.html) && S.files['pick36.json'] == null && !has36Text(JSON.stringify([S.core, S.range, S.time ?? null, S.home ?? null, S.grow ?? null, S.upd ?? null])) /* 업데이트 탭 글도(13:0x 08:22 까닭 칸 「36곳 탭 영구 삭제」를 놓친 것) */;
  // 멍거 · 린치 조건(2026-10-14 06:05 「가」 · ml-v1 — 멍거 갈래는 00:03 「가 로 하자」 그대로) — 화면 자료에 옛 기준 말 · 차례 칸 없음 · 꼬리표마다 갈래 값 · 갈래 조건을 넘음(한 번만 셈)
  const oldWords = oldRuleHits(JSON.stringify([S.core, S.comp, S.names, S.home ?? null, (S.upd?.records ?? []).map(r => [r.reason, r.why])]));
  const noRank = Object.values(comp).every(x => x.pick && Array.isArray(x.pick.tags) && x.pick.tags.length > 0 && !['kind', 'h1', 'h2', 'd', 'tier', 'srank', 'rank', 'prank', 'google', 'cia', 'years', 'net', 'roe', 'debt'].some(k => k in x.pick));
  const RU = S.core.rules ?? {};
  const tagOk = Object.values(comp).every(x => JSON.stringify(x.pick?.tags) === JSON.stringify([x.pick?.mg ? 'mg' : null, x.pick?.ly ? 'ly' : null].filter(Boolean)));
  const mgOk = Object.values(comp).every(x => !x.pick?.mg || (x.pick.mg.years?.length === 3 && x.pick.mg.net.every(v => v > 0) && x.pick.mg.debt.every(v => v <= RU.debtLine) && x.pick.mg.roe.every(v => v >= RU.roeLine)));
  const lyOk = Object.values(comp).every(x => !x.pick?.ly || (x.pick.ly.g >= RU.growLine?.[0] && x.pick.ly.g <= RU.growLine?.[1] && x.pick.ly.score >= RU.scoreLine && x.pick.ly.pxDay === RU.lyDay && x.pick.ly.eps.every(v => v > 0)));
  const code = [
    ['안전 문장(맨 아래)', () => S.js.includes(SAFETY)],
    ['멍거 · 린치 조건 — 자료에 옛 기준 말(OLD_RULE_WORDS 목록) 없음 · 지난 회차 · 봉인은 「옛 규칙(…)」 꼬리표만(걸린 글이 기록에 다시 실려도 걸리지 않게 이름에 그 말을 안 씀)', () => oldWords.length === 0],
    ['멍거 · 린치 조건 — 회사마다 꼬리표와 갈래 값이 맞음 · 차례 · 층 · 옛 든 까닭 칸 없음(규칙 55)', () => noRank && tagOk],
    ['멍거 갈래 — 꼬리표 mg 회사 모두 세 조건(3해 돈 벎 · 빚 ≤ 자기 돈 · 해마다 18원 넘게)을 넘음', () => RU.version === 'ml-v1' && mgOk],
    ['린치 갈래 — 꼬리표 ly 회사 모두 두 조건(한 주 이익 해마다 20 ~ 25% · 점수 2 넘음 · 모음 날 값)을 넘음', () => RU.version === 'ml-v1' && lyOk],
    ['멍거 · 린치 조건 — 이름 밑 갈래마다 수 · 「멍거 · 린치가 고른 목록이 아닙니다」', () => S.js.includes('const pickLine = C =>') && RU.groups?.length === 2 && RU.groups[0]?.conds?.length === 3 && RU.groups[1]?.conds?.length === 2 && String(RU.notMunger ?? '').includes('멍거 · 린치가 고른 목록이 아닙니다') && /^멍거 조건 \d+곳 · 린치 조건 \d+곳 · 둘 다 \d+곳$/.test(RU.line ?? '') && !S.js.includes('그중 「힘 붙음」 ${k.gain}')],
    ['모형 표지 「모형 가정 아래 추정 · 검증 전」 두 곳 이상', () => S.js.split(MODEL_TAG).length - 1 >= 2],
    ['36곳 없음 — 화면 코드 · 자료에 「36곳 · 매수 검토」 · 36곳 화면 · 탭 · 자료 파일 없음(사장님 2026-10-13 06:45 「매수 검토 36곳 영구 삭제 하라」)', () => no36],
    ['장 중 값 표시 「아직 바뀜」', () => S.js.includes('아직 바뀜')],
    ['모르는 값은 「?」(pct)', () => /function pct\(x\) \{ if \(x == null \|\| !isFinite\(x\)\) return '\?';/.test(S.js)],
    ['시장 판독 상자 「지난 값만 · 앞날 맞히기 아님」', () => S.js.includes('지난 값만 · 앞날 맞히기 아님')],
    ['그림 파일은 막비 그림뿐(맨 위 슬라이드 1장 · 자료를 못 읽을 때 옛 띠 — 사람 얼굴 그림 없음 · 2026-10-13 03:38)', () => [...S.js.matchAll(/src:\s*'([^']+)'/g)].every(m => ['/media/makbi-icon.svg', '/media/makbi-hello.svg'].includes(m[1]))], // 2026-10-12 20:11 맨 위 슬라이드 1장 「친구에게 소개하기」
    ['막비 얼굴은 제목 달에만(atlas.css url)', () => [...S.css.matchAll(/url\(\s*['"]?([^'")]+)/g)].every(m => m[1].startsWith('data:') || m[1] === '/media/makbi-moon.svg')],
    ['옛 사람 얼굴 그림 판(지운 블롭 43개)이 사이트 안에 없음(2026-10-13 03:38 「모든 흔적 다 지워」)', () => noOldFace(S.siteDir)],
  ];
  return {key: 'claude', name: '클로드', what: '말이 정직하고 안전한가 — 자료 · 시장 판독 글을 읽음', kinds: [
    {k: 'banned', name: '사고팔기 권하는 말 · 앞날 장담(화면 금지 말 19개) — 우리가 쓴 글', items: texts.length, check(i) {
      const t = texts[i]; if (t.proper) return null; const w = BANNED.find(b => t.s.includes(b)); return w ? `${t.where}.${t.key} 「${w}」: ${t.s.slice(0, 60)}` : null; }},
    {k: 'narrow', name: '좁은 금지 말 9개(힘 붙은 365곳 · 클로드팀) — 우리가 쓴 글', items: texts.length, check(i) {
      const t = texts[i]; if (t.proper) return null; const w = NARROW.find(b => t.s.includes(b)); return w ? `${t.where}.${t.key} 「${w}」: ${t.s.slice(0, 60)}` : null; }},
    {k: 'broken', name: '깨진 글자 · 빈 이름', items: texts.length, check(i) {
      const t = texts[i]; if (BROKEN.test(t.s)) return `${t.where}.${t.key} 깨진 글자: ${t.s.slice(0, 40)}`;
      if ((t.key === 'name' || t.key === 'n') && !t.s.trim()) return `${t.where}.${t.key} 빈 이름`; return null; }},
    {k: 'market', name: '시장 판독 글 — 줄마다 숫자 · 지난 사실(앞날 말 없음)', items: Math.max(1, mlines.length), check(i) {
      if (!mlines.length) return market ? '시장 판독 글이 없음' : null;
      const s = mlines[i].s; if (!/\d/.test(s)) return `숫자 없는 판독 줄: ${s}`;
      if (/(할|될|오를|내릴|갈|올)\s?(것|겁니다|전망)|전망|기대|유망|사세요|파세요|담으세요/.test(s)) return `앞날 · 권하는 말: ${s}`; return null; }},
    {k: 'unknown', name: '모르는 값은 비워 둠(「?」로 보임 — 0 · 빈 글로 채우지 않음)', items: S.codes.length * unknownKeys.length, check(i) {
      const c = S.codes[(i / unknownKeys.length) | 0], k = unknownKeys[i % unknownKeys.length], v = comp[c][k];
      if (v === undefined || v === null) return null; if (typeof v !== 'number' || !Number.isFinite(v)) return `${c}.${k} = ${JSON.stringify(v)}(숫자도 빈칸도 아님)`;
      if ((k === 'price' || k === 'cap') && v <= 0) return `${c}.${k} = ${v}(0 이하 — 모르면 비워야 함)`; return null; }},
    {k: 'grow', name: '앞으로 클까? 말 등급 다섯 · 배수 범위(주가 아님)', items: Math.max(1, growCos.length), check(i) {
      if (!growCos.length) return null; const [c, x] = growCos[i];
      for (const [y, w] of Object.entries(x.g ?? {})) if (w != null && !LEVELS.has(w)) return `${c} ${y}년 말 등급 「${w}」`; // 비어 있으면 화면이 「자료 모자람」
      for (const [y, m] of Object.entries(x.m ?? {})) if (m != null && !(m > 0)) return `${c} ${y}년 배수 ${m}`; return null; }},
    {k: 'code', name: '화면 코드 — 안전 문장 · 모형 표지 · 「?」 · 막비 자리 · 옛 얼굴 그림 없음', items: code.length, check(i) { return code[i][1]() ? null : `없음: ${code[i][0]}`; }},
  ]};
}

// ═════════ 🕵 CIA — 주소 흔들기 · 비밀 · 바깥 · 끼운 코드 ═════════
/** atlas.js 의 진짜 길 함수 route() 를 떼어 가짜 화면 함수와 함께 돌림(브라우저 없이) */
export function routeRunner(js) {
  const a = js.indexOf('async function route() {'), b = js.indexOf('\nasync function boot()', a);
  if (a < 0 || b < 0) throw Error('atlas.js 에서 route() 를 못 찾음');
  const calls = [];
  const el = () => ({hidden: true, dataset: {}, childElementCount: 0, textContent: '', append() {}, remove() {}, focus() {}, setAttribute() {}, toggleAttribute() {}, addEventListener() {}, querySelector() { return null; }});
  const rec = k => (...x) => { calls.push([k, ...x.slice(1)]); };
  const box = {D: {core: {}}, location: {hash: '#/', search: '', replace: u => calls.push(['replace', u])}, freshCheck() {}, showFind: () => calls.push(['find']), showInfo: x => calls.push(['info', x]), needNames: async () => {}, needMkt: async () => {},
    $: () => el(), document: {body: {dataset: {}}, title: ''}, lastMain: '', routeSeq: 0, chartDraw: null, h: () => el(), MO: {cat: () => el(), catSleep: () => { calls.push(['error-screen']); return el(); }}, window: {scrollTo() {}}, console: {error() {}},
    viewHome: rec('home'), viewList: rec('list'), viewUpdates: rec('up'), viewTime: rec('time'), viewGroup: rec('g'), viewIndustry: rec('i'), viewPast: rec('past'), viewRivals: rec('rivals'), viewGrow: rec('grow'), viewRange: rec('range'), viewCompany: rec('c'), viewMissing: rec('missing'),
    decodeURIComponent, encodeURIComponent, Promise, Object, String, Array};
  vm.createContext(box);
  vm.runInContext(js.slice(a, b) + '\n;globalThis.__route = route;', box);
  return {src: js.slice(a, b), run: async hash => { calls.length = 0; box.location.hash = hash; box.lastMain = ''; let err = null; try { await box.__route(); } catch (e) { err = e; } return {calls: calls.slice(), err}; }};
}
const PAY = ['<script>alert(1)</script>', '"><img src=x onerror=alert(1)>', 'javascript:alert(1)', "'", '"', '%', '%%', '%E0%A4%A', '%ZZ', '%u0041', '%C0%AF', '%00', '‮', '\u0000', '\n', '../', '..%2F', '%2e%2e%2f', '//evil.example', 'https://evil.example', '#', '?', '&', '\\', '%F0%9F%98%80', '😀', '가나다', 'ㄱ', ' ', '%20'];
function fuzzHash(rnd, S) {
  const pick = a => a[(rnd() * a.length) | 0];
  const heads = ['#/', '#/c/', '#/g/', '#/i/', '#/x/', '#/find', '#/info', '#/list', '#/36', '#/up', '#/time', '', '#', '#//', '#/C/', '#/c//', '#/stocks', '#/road', '#/x//', '#/i//', '#/g/%'];
  const bodies = [() => pick(S.codes), () => String((rnd() * 1e6) | 0).padStart(6, '0'), () => pick(S.core.groups).id, () => pick(S.core.industries).name, () => encodeURIComponent(pick(S.core.industries).name),
    () => encodeURIComponent(encodeURIComponent(pick(S.core.industries).name)), () => pick(PAY), () => String.fromCharCode((rnd() * 0xffff) | 0), () => 'a'.repeat(1 + ((rnd() * 3000) | 0)), () => pick(['/past', '/rivals', '/grow', '/range', '/x', '/', '//past'])];
  let s = pick(heads); const n = 1 + ((rnd() * 4) | 0); for (let k = 0; k < n; k++) s += pick(bodies)();
  if (rnd() < 0.1) { const cut = (rnd() * s.length) | 0; s = s.slice(0, cut) + pick(PAY) + s.slice(cut); } // 가운데 끼우기
  return s;
}
function ciaLens(S, market) {
  const R = routeRunner(S.js);
  const VIEWS = ['viewGroup', 'viewIndustry', 'viewCompany', 'viewPast', 'viewRange', 'viewRivals', 'viewGrow'];
  const guard = VIEWS.map(f => { const a = S.js.indexOf(`function ${f}(`); const head = a < 0 ? '' : S.js.slice(a, a + 400); return [f, /return viewMissing\(/.test(head)]; });
  // 왕복 — 화면이 만드는 주소(이름은 encodeURIComponent)를 길 함수에 넣으면 같은 대상이 나오나
  const trips = [...S.core.groups.map(g => ['#/g/' + g.id, ['g', g.id]]), ...S.core.industries.filter(i => i.n > 1).map(i => ['#/i/' + encodeURIComponent(i.name), ['i', i.name]]),
    ...S.codes.flatMap(c => [['#/c/' + c, ['c', c]], ['#/c/' + c + '/past', ['past', c]], ['#/c/' + c + '/rivals', ['rivals', c]], ['#/c/' + c + '/grow', ['grow', c]], ['#/c/' + c + '/range', ['range', c]]]),
    ...S.names.rows.filter(r => r.s !== 'in').slice(0, 2000).map(r => ['#/x/' + r.c, ['info', r.c]])];
  // 글 — 자료 모두 + 시장 판독
  const texts = [...strings(S.core, 'core', []), ...strings(S.comp, 'comp', []), ...strings(S.names, 'names', []), ...strings(S.range, 'range', []), ...(S.grow ? strings(S.grow, 'grow', []) : []), ...(S.time ? strings(S.time, 'time', []) : []), ...(S.home ? strings(S.home, 'home', []) : []), ...(S.mkt ? strings(S.mkt, 'mkt', []) : [])];
  for (const c of S.codes) if (S.co[c]) strings(S.co[c], 'co/' + c, texts);
  for (const s of market?.lines ?? []) texts.push({where: '시장 판독', key: 'line', s});
  const INJ = /<\s*\/?\s*(script|iframe|img|svg|object|embed|style|link|meta|form|input|a)\b|javascript:|vbscript:|data:text\/html|\bon[a-z]{3,}\s*=/i;
  const HIDDEN = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F​-‏‪-‮⁠-⁩﻿]/;
  const urls = texts.filter(t => /^https?:\/\//i.test(t.s) || t.key === 'url' || t.key === 'src');
  // 비밀 · 개인 정보 — 코드 · 자료 파일을 2,000자 조각으로
  const SECRET = [[/nfp_[A-Za-z0-9]{20,}/, '넷리파이 열쇠'], [/gh[pousr]_[A-Za-z0-9]{30,}|github_pat_[A-Za-z0-9_]{30,}/, '깃허브 열쇠'], [/AKIA[0-9A-Z]{16}/, 'AWS 열쇠'], [/-----BEGIN [A-Z ]*PRIVATE KEY-----/, '개인 키'],
    [/xox[baprs]-[A-Za-z0-9-]{10,}/, '슬랙 열쇠'], [/sk-(ant-)?[A-Za-z0-9_-]{32,}/, 'API 열쇠'], [/NETLIFY_(AUTH_TOKEN|SITE_ID)\s*[=:]/, '넷리파이 이름 + 값'], [/"(siteId|deployId|site_id|deploy_id|deployUrl)"\s*:/, '넷리파이 번호 칸'],
    [/[A-Za-z0-9._%+-]+@(gmail|naver|daum|hanmail|kakao|outlook|hotmail|yahoo|icloud)\.[a-z.]{2,}/i, '개인 메일 주소']];
  const docs = [['atlas.js', S.js], ['atlas.css', S.css], ['index.html', S.html], ['fonts.css', S.fontsCss], ...['core.json', 'comp.json', 'names.json', 'range.json', 'lines.json', 'days.json', 'grow.json', 'time.json', 'home.json', 'mkt.json'].filter(f => S.files[f] != null).map(f => [f, fs.readFileSync(path.join(S.dataDir, f), 'utf8')]),
    ...S.codes.filter(c => S.co[c]).map(c => ['co/' + c + '.json', JSON.stringify(S.co[c])])];
  const chunks = []; for (const [f, t] of docs) for (let k = 0; k < Math.max(1, t.length); k += 1800) chunks.push([f, k, t.slice(k, k + 2000)]);
  // 화면 코드 규칙
  const jsNoStr = S.js;
  const codeRules = [
    ['eval · new Function · document.write 없음', () => !/\beval\(|new Function\(|document\.write\(/.test(jsNoStr)],
    ['innerHTML 은 h() 한 곳뿐 · outerHTML · insertAdjacentHTML 없음', () => (jsNoStr.match(/innerHTML/g) ?? []).length === 1 && !/outerHTML\s*=|insertAdjacentHTML/.test(jsNoStr)],
    ['h() 에 html 칸을 쓰는 곳 없음(글은 모두 textContent)', () => !/\{[^{}]*\bhtml\s*:/.test(jsNoStr)],
    ['setTimeout · setInterval 에 글 코드 없음', () => !/set(Timeout|Interval)\(\s*['"`]/.test(jsNoStr)],
    ['새 창(_blank) 고리는 모두 rel noopener', () => [...jsNoStr.matchAll(/\{[^{}]*target:\s*'_blank'[^{}]*\}/g)].every(m => /rel:\s*'noopener/.test(m[0]))],
    ['index.html — 안에 박은 script · on… 속성 없음', () => !/<script(?![^>]*\bsrc=)[^>]*>/i.test(S.html) && !/\son[a-z]+\s*=/i.test(S.html)],
    ['index.html — 바깥 script · css 없음', () => ![...S.html.matchAll(/<(script|link)\b[^>]*(src|href)="([^"]+)"/gi)].some(m => /^(https?:)?\/\//i.test(m[3]))],
    ['화면 코드의 바깥 주소는 정한 곳뿐', () => [...(S.js + S.html).matchAll(/https?:\/\/([a-z0-9.-]+)/gi)].every(m => CODE_HOSTS.has(m[1].toLowerCase()))],
    ['글꼴 · 꾸밈 파일도 바깥 주소 없음', () => !/url\(\s*['"]?(https?:)?\/\//i.test(S.css + S.fontsCss) && !/@import/i.test(S.css + S.fontsCss)],
    ...guard.map(([f, ok]) => [`${f} — 없는 대상이면 「없는 주소」(viewMissing)`, () => ok]),
  ];
  const heads = [['default-src \'self\'', /default-src 'self'/], ['script-src \'self\'(안에 박은 코드 · eval 막음)', /script-src 'self'(;|$)/m], ['object-src \'none\'', /object-src 'none'/], ['frame-ancestors \'none\'(남의 화면에 못 끼움)', /frame-ancestors 'none'/],
    ['base-uri · form-action \'self\'', /base-uri 'self'.*form-action 'self'/], ['X-Frame-Options: DENY', /X-Frame-Options: DENY/], ['X-Content-Type-Options: nosniff', /X-Content-Type-Options: nosniff/],
    ['Referrer-Policy', /Referrer-Policy: strict-origin-when-cross-origin/], ['Permissions-Policy(카메라 · 마이크 · 위치 막음)', /Permissions-Policy: camera=\(\), microphone=\(\), geolocation=\(\)/], ['unsafe-inline · unsafe-eval 없음', null]];
  const LIM = {'core.json': 2e6, 'comp.json': 3e6, 'names.json': 3e6, 'range.json': 2e6, 'lines.json': 2e6, 'days.json': 2e6, 'grow.json': 3e6, 'time.json': 2e6, 'updates.json': 2e6, 'home.json': 5e5, 'mkt.json': 2e6}; // 모든 회사 자료(2026-10-14 「나」 · 지금 약 0.47MB)
  const sizes = [...Object.entries(S.files).map(([f, b]) => [f, b, LIM[f] ?? 1e6]), ...Object.entries(S.coBytes).map(([c, b]) => ['co/' + c + '.json', b, 2.5e5]), ['co 파일 수', Object.keys(S.coBytes).length, null]];
  const codeOk = c => /^[0-9A-Z]{6}$/.test(c);
  return {key: 'cia', name: 'CIA', what: '뚫리거나 새는 곳이 없나 — 이상한 주소 넣어 보기 · 비밀 · 바깥 주소 · 끼운 코드', route: R, kinds: [
    {k: 'fuzz', name: '주소 흔들기 — 진짜 길 함수(route)에 이상한 주소를 넣어 봄', items: Infinity, async: true, async check(_, rnd) {
      const hsh = fuzzHash(rnd, S), r = await R.run(hsh), show = JSON.stringify(hsh.slice(0, 60));
      if (r.err) return `${show} 멈춤: ${String(r.err.message ?? r.err).slice(0, 80)}`;
      if (r.calls.some(c => c[0] === 'error-screen')) return `${show} 「자료를 못 읽었습니다」(주소가 잘못됐는데 까닭이 틀림)`;
      const rep = r.calls.find(c => c[0] === 'replace'); if (rep && !(String(rep[1]).startsWith('/old/') || /^#\/c\/[0-9A-Z]{6}$/.test(rep[1]) || rep[1] === '#/') || (rep && String(rep[1]).startsWith('//'))) return `${show} 바깥으로 가는 길 ${rep[1]}`; // #/ = 지운 36곳 옛 주소(2026-10-13)
      if (!r.calls.length) return `${show} 아무 화면도 안 열림`; return null; }},
    {k: 'trip', name: '이름 주소 왕복 — 화면이 만든 주소가 같은 대상을 여나', items: trips.length, async: true, async check(i) {
      const [hsh, want] = trips[i], r = await R.run(hsh); const got = r.calls.find(c => c[0] !== 'replace');
      return !r.err && got && got[0] === want[0] && got[1] === want[1] ? null : `${hsh} → ${JSON.stringify(got)} (바라는 것 ${JSON.stringify(want)})`; }},
    {k: 'inject', name: '자료 글에 끼운 코드 · 숨은 글자(방향 바꿈 · 폭 없는 글자 · 제어 글자) 없음', items: texts.length, check(i) {
      const t = texts[i]; if (INJ.test(t.s)) return `${t.where}.${t.key} 코드 같은 글: ${t.s.slice(0, 60)}`; if (HIDDEN.test(t.s)) return `${t.where}.${t.key} 숨은 글자`; return null; }},
    {k: 'url', name: '자료 속 주소 — https 만 · 이상한 꼴 없음', items: Math.max(1, urls.length), check(i) {
      if (!urls.length) return null; const t = urls[i]; if (t.s === '' || (t.key === 'src' && !/^https?:\/\//i.test(t.s))) return null; // 빈 칸(주소 없음 — 화면이 고리를 안 만듦) · 출처 이름
      let u; try { u = new URL(t.s); } catch { return `${t.where} 주소 꼴이 아님: ${t.s.slice(0, 60)}`; }
      if (u.protocol !== 'https:') return `${t.where} https 아님: ${t.s.slice(0, 60)}`; if (u.username || u.password) return `${t.where} 주소에 아이디 · 비밀번호: ${u.host}`;
      if (!/^[a-z0-9.-]+$/i.test(u.hostname) || !u.hostname.includes('.')) return `${t.where} 이상한 주인 이름: ${u.hostname}`; return null; }},
    {k: 'secret', name: '비밀 열쇠 · 넷리파이 번호 · 개인 메일이 화면 파일에 없음', items: chunks.length, check(i) {
      const [f, k, t] = chunks[i]; for (const [re, what] of SECRET) if (re.test(t)) return `${f} ${k}자 근처 ${what}`; return null; }},
    {k: 'code', name: '화면 코드 — 위험한 코드 · 바깥 주소 · 없는 대상 처리', items: codeRules.length, check(i) { return codeRules[i][1]() ? null : `어김: ${codeRules[i][0]}`; }},
    {k: 'header', name: '보안 머리말(CSP 등 — 올릴 때 _headers)', items: heads.length, check(i) {
      const [what, re] = heads[i]; if (!re) return /unsafe-(inline|eval)/.test(HEADER_TOP) ? `머리말에 ${what.split(' ')[0]}` : null; return re.test(HEADER_TOP) ? null : `머리말 없음: ${what}`; }},
    {k: 'shape', name: '자료 모양 — 회사 번호 꼴(모든 회사) · 파일 크기 · 회사 파일 수', items: S.all.length + sizes.length, check(i) {
      if (i < S.all.length) { const c = S.all[i]; return codeOk(c) ? null : `회사 번호 꼴 「${c}」`; }
      const [f, b, lim] = sizes[i - S.all.length]; if (lim == null) return b === S.codes.length ? null : `회사 파일 ${b}개 ≠ 고른 곳 ${S.codes.length}`; return b <= lim ? null : `${f} ${b}바이트(한도 ${lim})`; }},
  ]};
}

/** 네 눈 — 눈마다 n번 · 대상은 먼저 모두 한 번씩 · 나머지는 무작위 */
export async function inspect4({siteDir, dataDir = null, market = null, n = 1e7, seed = 20261012, now = new Date(), log = () => {}} = {}) {
  const t0 = Date.now(), S = load(siteDir, dataDir), todayKst = new Date(now.getTime() + 9 * 36e5).toISOString().slice(0, 10), ctx = {todayKst};
  const lenses = [appleLens(S), googleLens(S, market, now), claudeLens(S, market), ciaLens(S, market)];
  const out = [];
  for (const [li, L] of lenses.entries()) {
    const t1 = Date.now(), rnd = rng((seed + li * 7919) >>> 0);
    const st = L.kinds.map(k => ({k: k.k, name: k.name, items: k.items, n: 0, fail: 0, failItems: new Set(), first: []}));
    const note = (ki, item, msg) => { const s = st[ki]; s.n++; if (msg) { s.fail++; if (item != null) s.failItems.add(item); if (s.first.length < 5 && !s.first.includes(msg)) s.first.push(msg); } };
    let done = 0;
    // ① 모두 한 번씩 — 대상이 적은 갈래부터(번 수가 모자라도 작은 갈래가 빠지지 않게)
    const order = L.kinds.map((K, ki) => [K.items, ki]).filter(([it]) => Number.isFinite(it)).sort((a, b) => a[0] - b[0]).map(([, ki]) => ki);
    for (const ki of order) { const K = L.kinds[ki]; for (let i = 0; i < K.items && done < n; i++, done++) note(ki, i, K.async ? await K.check(i, rnd, ctx) : K.check(i, rnd, ctx)); }
    // ② 남은 번 수 — 무작위(끝없는 대상이 있으면 그쪽에 절반)
    const inf = L.kinds.map((K, ki) => (Number.isFinite(K.items) ? -1 : ki)).filter(x => x >= 0), fin = L.kinds.map((K, ki) => (Number.isFinite(K.items) && K.items > 0 ? ki : -1)).filter(x => x >= 0);
    while (done < n) {
      const ki = inf.length && (!fin.length || rnd() < 0.5) ? inf[(rnd() * inf.length) | 0] : fin[(rnd() * fin.length) | 0], K = L.kinds[ki];
      const i = Number.isFinite(K.items) ? (rnd() * K.items) | 0 : null;
      note(ki, i, K.async ? await K.check(i, rnd, ctx) : K.check(i, rnd, ctx)); done++;
    }
    const fail = st.reduce((a, s) => a + s.fail, 0);
    out.push({key: L.key, name: L.name, what: L.what, n: done, fail, things: st.reduce((a, s) => a + (Number.isFinite(s.items) ? s.items : 0), 0), ms: Date.now() - t1,
      kinds: st.map(s => ({k: s.k, name: s.name, items: Number.isFinite(s.items) ? s.items : null, n: s.n, fail: s.fail, failItems: s.failItems.size, first: s.first})),
      ...(L.route ? {routeFp: crypto.createHash('sha256').update(L.route.src).digest('hex').slice(0, 12)} : {})});
    log(`${L.name} ${done.toLocaleString('en-US')}번 · 실패 ${fail} · ${Date.now() - t1}ms`);
  }
  const fail = out.reduce((a, l) => a + l.fail, 0);
  return {schema: 'atlas-inspect4-1', version: INSPECT_VERSION, made: new Date().toISOString(), why: '사장님 2026-10-12 12:41 「업데이트 할때마다 아틀란스 점검을 애플 구글 클로드 cia방식으로 각각 1000만번씩 하라」',
    seed, nEach: n, asOf: S.core.asOf, base: S.core.base, provisional: !!S.core.provisional, companies: S.codes.length, ms: Date.now() - t0, fail, ok: fail === 0, lenses: out};
}

/** 업데이트 기록 · 화면에 싣는 짧은 꼴 */
export const inspectBrief = r => (r ? {version: r.version, nEach: r.nEach, fail: r.fail, ok: r.ok, ms: r.ms, lenses: r.lenses.map(l => ({key: l.key, name: l.name, n: l.n, fail: l.fail, things: l.things, first: l.kinds.flatMap(k => k.first).slice(0, 3)}))} : null);

if (import.meta.url === `file://${process.argv[1]}`) {
  const arg = (k, d) => { const i = process.argv.indexOf(k); return i < 0 ? d : process.argv[i + 1]; };
  const site = path.resolve(arg('--site', 'site')), data = arg('--data', null), mf = arg('--market', null), outFile = arg('--out', null);
  const market = mf ? JSON.parse(fs.readFileSync(mf, 'utf8')) : null;
  const res = await inspect4({siteDir: site, dataDir: data && path.resolve(data), market, n: +arg('--n', 1e7), seed: +arg('--seed', 20261012), now: new Date(arg('--now', new Date().toISOString())), log: s => process.stderr.write(s + '\n')});
  if (outFile) { fs.mkdirSync(path.dirname(path.resolve(outFile)), {recursive: true}); fs.writeFileSync(path.resolve(outFile), JSON.stringify(res, null, 1) + '\n'); }
  console.log(JSON.stringify({ok: res.ok, fail: res.fail, ms: res.ms, lenses: res.lenses.map(l => ({k: l.key, n: l.n, fail: l.fail, things: l.things, first: l.kinds.flatMap(k => k.first).slice(0, 2)}))}));
  process.exit(res.ok ? 0 : 1);
}
