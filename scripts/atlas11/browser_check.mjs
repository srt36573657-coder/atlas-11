/**
 * ATLAS 11 · 실제 브라우저 조작 검사 — 36칸 판(예측 없음 · 업종 36개 × 5곳 = 180곳)
 *   2026-10-04 15:37 사장님 「이제 예측을 하지 않는다 예측에 관련된 모든 기능과 화면을 삭제하고. 표현하지 마라」
 *   2026-10-04 21:55 「자 이제 학습한것 이상으로 만들어」 — 처음 화면(36칸 판) → 업종 화면(#/i/<업종>) → 회사 화면 · 두 번이면 어디든
 *   node scripts/atlas11/browser_check.mjs --base http://localhost:8823 --pw <playwright 폴더>
 * 보는 것(PC 1280×800 · 휴대폰 390×844 터치 흉내 — 실제 아이폰 기기 검증 아님)
 *   2026-10-05 02:44 「잡스였다면」 개혁(보고서 「잡스였다면 ATLAS 개혁 공부」)에 맞춰 고침 — 첫 줄 결론 · 칸 하나에 넷 · 앞날 말 걷어 냄 · 연속 글 대신 오른 날 수 · 화면 잇기
 *   처음 화면(탭 「불장」): 제목 「불장 N개」 = 판의 불장 수 · 결론 한 줄(업종 몇 개가 올랐나 · 기간) · 업종 칸 = 판의 업종 차례 그대로(「불장 n위」 또는 n위 · 이름 · 20거래일 평균 · 몇 곳 올랐나 · 오름/내림 선) ·
 *         칸 바탕은 한 색 · 색 보기표 없음 · 칸을 누르면 그 업종 화면 · 22곳 목록은 처음 화면에 없음(자기 탭)
 *   2026-10-05 05:07 「해」 — 아래 탭 다섯(불장 · 예비 · 22곳 · 출목표 · 일정):
 *     「예비」(#/similar) 불장 닮은 7곳 = 판 · 판의 셈을 이 검사기가 따로 다시 셈(공통점 후보 아홉 · 절반 넘게 · 10%p · 한 업종 2곳) · 줄마다 공통점 ✓ · 같은 눈금 선 그래프 · 공통점 막대 · 저녁 7시 들고 남 칸 = 판 ·
 *        줄 → 회사 → 「‹ 불장 닮은 N곳」 → 보던 자리 · 회사 화면에서도 「예비」 탭 눌림
 *     「오름 상위」(#/rise) 불장 밖에서 많이 오른 22곳 = 판(이름 · 업종 · 작은 선 그래프 같은 눈금 · 변화) · 줄 → 회사 → 「‹ 불장 밖에서 많이 오른 N곳」
 *   업종 화면 36장 모두: 머리(업종 n개 가운데 n위 · 불장 · 평균 · 몇 곳 올랐나) · 「누가 끌었나」 막대(차례 · 값 · 방향 · 길이) · 카드(합쳐서 180장 = 판 · 겹침 없음 · 넷만: 이름·변화 · 선 그래프 · 수급 · 기사) ·
 *         앞날 말 없음 · 옆으로 넘치지 않음 · 회사 화면 「‹ 업종」 → 그 업종 · 없는 업종 주소 → 알림
 *   출목표 한 판(#/road · 2026-10-04 22:12): 업종별(처음) = 36칸 판 차례 · 흐름별 = 아홉 칸 표 흐름마다 · 칸 180개 모두(이름 · 변화 · 선 그래프 · 출목표 동그라미 · 오른 날 수 · 업종 · 수급 · 기사) = 따로 센 값 ·
 *         흐름 줄 → 그 묶음 · 칸 → 회사 → 「‹ 출목표」 → 보던 자리·고른 묶음 그대로 · 탭을 다시 누르면 맨 위
 *   회사: 이름 · 종가 · 지난 20거래일 변화(앞 화면과 같은 숫자) · 지난 60거래일 그래프 마지막 날짜 · 그 안의 20거래일 띠 · 지난 1년 숫자 · 일정·공시 모두 · 수급·기사·공시 기록(눌러 열기) · 같은 업종 4곳
 *   일정: 시장 일정 수 · 회사·업종 일정(같은 일정은 한 줄) 수 · 예고 공시 수 · ★★★ 공시 수
 *   지운 화면의 옛 주소(#/forecast · #/up · #/down · #/scores · #/race · #/evolution · #/status · #/records · #/game) → 처음 화면
 *   앞날 말 없음: 화면 글(공식 이름 data-ident 는 따로)에 전망·예측·확률·오를 쪽·내릴 쪽·목표가·추천 … 이 없어야 · 예측 표시(data-forecast-date) 0
 *   콘솔 오류 0 · 요청 실패 0 · 무결성(판 목록 SHA-256) · 어두운 화면
 *   또렷함(화면 6 × 보기 5): 1 내일·오늘·어제 · 2 흐릿한 말 · 3 단위·기준 빠진 숫자 · 5 대비 · 7 잘린 글자 — 0 이 아니면 실패 · 검사기 자체 시험
 *   2026-10-05 10:24 「잡스라면 … 36가지」 → 「나 여기서 클릭하면 업로드되게 만들어 줘」 1차: 아래 탭 넷(불장 · 업종 · 출목표 · 일정)
 *     탭 「불장」(#/): 제목 「불장 업종 N개」 · 큰 흐름 한 줄 · 큰 흐름 장 = 판의 불장을 큰 갈래(site/app/family.js)로 묶은 것 · 맨 위 스위치 셋 [불장 | 예비 | 오름 상위]
 *     탭 「업종」(#/map): 옛 처음 화면의 73칸 판 그대로 + 큰 갈래 단추 · 업종 화면 「‹ 업종」 · 예비 · 오름 상위은 스위치로 가고 탭 「불장」이 눌린 채로
 *   2026-10-05 11:36 「모든 배치가 가장 많이 상승한순으로 배치해줘」: 큰 흐름 장 · 갈래 단추 = 갈래 평균이 큰 순 · 예비 줄 · 업종 화면 다섯 곳 · 같은 업종 넷 = 지난 20거래일 많이 오른 순
 *     출목표: 처음 = 「오른 순」(365곳 · 20곳씩 「1위~20위」) · 업종별 안도 오른 순 · 흐름별 묶음은 묶음 평균이 큰 순
 * 결과: reports/atlas11/browser/<시각>/report.json + 화면 사진
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import {createRequire} from 'node:module';
import {createHash} from 'node:crypto';
import {measureClarity} from './clarity/measure.mjs';
import {familiesByRise, familyOf, riseDesc, FAMILIES, OTHER} from '../../site/app/family.js';
import {SCREENS, VIEWS, renderAll, screenHash} from './clarity_check.mjs';
import {roadOf, STORY} from '../../site/app/road.js';
import {PREDICTION_WORDS} from '../../lib/atlas11/board.mjs';
import {expectOf, compare, pctText, flowExpect} from './art_expect.mjs'; // 그림 숫자 기대값(규칙 33 · 34 — 빠짐없이 도는 검사기와 같은 셈)

const arg = name => { const i = process.argv.indexOf(name); return i < 0 ? null : process.argv[i + 1]; };
const base = arg('--base') ?? 'http://localhost:8823', pwDir = arg('--pw') ?? process.cwd();
const {chromium} = createRequire(path.join(pwDir, 'package.json'))('playwright');
const stamp = new Date().toISOString().replace(/[:.]/g, '-');
const dir = path.join(process.cwd(), 'reports/atlas11/browser', stamp); await fs.mkdir(dir, {recursive: true});
const checks = [];
const check = (name, ok, detail = null) => { checks.push({name, ok: Boolean(ok), detail}); console.log((ok ? 'ok   ' : 'FAIL ') + name + (detail ? ' · ' + JSON.stringify(detail).slice(0, 260) : '')); };
const get = async p => (await fetch(base + '/' + p)).json();
/* 요청 실패 — 2026-10-08 「괜찮다며 넘긴 것」 다시: 미국 판 글꼴 요청이 가끔 실패로 잡히던 까닭 = 화면을 옮길 때(page.goto) 브라우저가 받던 글꼴을 끊음(net::ERR_ABORTED) · 같은 글꼴은 다음 화면에서 받아짐
   → 끊긴 것(ERR_ABORTED)이면서 같은 주소를 끝내 받은 것은 사이트 잘못이 아니라 셈하지 않음 · 그 밖의 실패(404 · 연결 실패 · 끝내 못 받은 글꼴)는 그대로 실패 */
const gotOk = new Set(), pendingAbort = [];
const abortedOk = r => { const t = r.failure()?.errorText ?? ''; if (/ERR_ABORTED/.test(t)) { pendingAbort.push(r.url()); return {abort: r.url()}; } return r.url() + ' ' + t; };
const realFails = xs => xs.filter(x => !(x && typeof x === 'object' && x.abort && gotOk.has(x.abort))).map(x => (typeof x === 'object' ? 'ERR_ABORTED ' + x.abort : x));
/** 끊긴 요청(ERR_ABORTED)은 그 주소를 검사기가 다시 받아 봄 — 200 · 내용 있음이면 사이트 잘못이 아니라 화면을 옮길 때 브라우저가 끊은 것(2026-10-08 미국 판 글꼴 「가끔 실패」의 원인) · 못 받으면 그대로 실패 */
const realFailsChecked = async xs => { const out = []; for (const x of realFails(xs)) { const m = /^ERR_ABORTED (.+)$/.exec(x); if (!m) { out.push(x); continue; }
  try { const r = await fetch(m[1]); const n = (await r.arrayBuffer()).byteLength; if (!(r.ok && n > 0)) out.push(`${x} (다시 받기 ${r.status} · ${n}바이트)`); } catch (e) { out.push(`${x} (다시 받기 못 함 ${e.message})`); } } return out; };
const manifest = await get('data/atlas11/view/manifest.json'), board = await get('data/atlas11/view/board.json'), agenda = await get('data/atlas11/view/agenda.json');
{ const l0 = await get('data/atlas11/view/lens.json').catch(() => null); if (l0?.cand?.items?.[0]) board._cand = l0.cand.items[0].code; } // 또렷함 재기 「회사(후보 판단)」 화면 = 첫 후보(clarity_check.mjs SCREENS)
const won = v => Math.round(v).toLocaleString('ko-KR') + '원';
const kd = d => `${Number(d.slice(5, 7))}월 ${Number(d.slice(8, 10))}일(${['일', '월', '화', '수', '목', '금', '토'][new Date(d + 'T00:00:00Z').getUTCDay()]})`;
const p1 = v => (v > 0 ? '+' : v < 0 ? '−' : '') + (Math.abs(v) * 100).toFixed(1) + '%';
/** 가장 많은 값(같으면 늦은 날) — 화면의 기간 글과 따로 셈 */
const mode = xs => { const n = new Map(); for (const x of xs) if (x) n.set(x, (n.get(x) ?? 0) + 1); return [...n].sort((a, b) => b[1] - a[1] || (a[0] < b[0] ? 1 : -1))[0]?.[0] ?? null; };
/** 아래 탭 「처음」 다섯 — 화면 · 판 셈(lib/atlas11/start.mjs)과 따로: 종가 원본(public/data/input.json)에서 우량 · 시가총액 100위 안 회사의
 *  지난 756거래일 가장 깊은 하락(하루 31% 넘게 움직인 날이 있으면 뺌)이 작은 순 다섯(같으면 시가총액 순위) — 2026-10-07 00:49 「이대로 사이트에 올려줘」 */
const startWant = async () => {
  const inp = JSON.parse(await fs.readFile(path.join(process.cwd(), 'public/data/input.json'), 'utf8')), out = [];
  for (const a of inp.assets ?? []) {
    if (a.quality?.kind !== 'quality' || !(a.quality?.capRank <= 100)) continue;
    const rows = (a.prices ?? []).filter(p => p.close > 0 && p.finalClose !== false && p.date <= board.asOf).sort((x, y) => x.date.localeCompare(y.date)).slice(-757);
    if (rows.length < 757) continue;
    let peak = rows[0].close, mdd = 0, bad = false;
    for (let i = 1; i < rows.length && !bad; i++) { if (Math.abs(rows[i].close / rows[i - 1].close - 1) > 0.31) bad = true; peak = Math.max(peak, rows[i].close); mdd = Math.min(mdd, rows[i].close / peak - 1); }
    if (!bad) out.push({code: a.code, cap: a.quality.capRank, mdd});
  }
  return out.sort((x, y) => y.mdd - x.mdd || x.cap - y.cap).slice(0, 5);
};
const pct0 = v => (v > 0 ? '+' : v < 0 ? '−' : '') + (Math.abs(v) * 100).toFixed(0) + '%';
/** 칸 위 가는 선 = 오름(up) · 내림(down) · 같음(flat) — 화면 코드와 따로 적어 맞대 봄(2026-10-05 잡스 개혁: 칸 바탕 세기 색은 덜어 냄) */
const signW = v => Number.isFinite(v) ? (v > 0 ? 'up' : v < 0 ? 'down' : 'flat') : 'flat';
const upWant = g => g.measured ? (g.up === g.measured ? `${g.measured}곳 모두 오름` : g.up === 0 ? '오른 곳 없음' : `${g.measured}곳 중 ${g.up}곳 오름`) : '변화 없음';
/** 출목표 한 판 — 화면 코드와 따로 적은 흐름 규칙(road.js 아홉 칸 표 · 둘 다 잠잠하면 「거의 안 움직임」) · 지금 몇 일째 */
const calmW = x => x === 'still' ? 'flat' : x;
const flowWant = r => r.before.side === 'still' && r.now.side === 'still' ? 'still' : `${calmW(r.before.side)}-${calmW(r.now.side)}`;
const FLOW_ORDER_W = ['up-up', 'flat-up', 'down-up', 'up-flat', 'flat-flat', 'still', 'down-flat', 'up-down', 'flat-down', 'down-down'];
const flowTextW = k => k === 'still' ? `${roadOf(board.companies[0].c).days}거래일 내내 거의 안 움직임` : STORY[k.split('-')[0]][k.split('-')[1]];
/** 연속 글(「오름 n일째」) 대신 20거래일 가운데 오른 날 수(±0.1% 안쪽은 보합) — 화면 코드와 따로 셈 */
const upDaysW = c => { const cs = c.c, rets = cs.slice(1).map((v, i) => v / cs[i] - 1); return `${rets.length}거래일 중 오른 날 ${rets.filter(r => r > 0.001).length}일`; };
/** 선 그래프 · 수급 · 기사(2026-10-04 22:51 「출목표만 있으면 않돼 그래프로 있어야 해 그리고 그 회사들 뉴스와 수급도」) — 화면 코드와 따로 적은 규칙 */
const pW = (v, d) => (v > 0 ? '+' : v < 0 ? '−' : '') + (Math.abs(v) * 100).toFixed(d) + '%';
const retsW = c => c.c.map(v => v / c.c[0] - 1);
const scaleW = cs => { const all = cs.flatMap(retsW); return {lo: Math.min(-0.03, ...all), hi: Math.max(0.03, ...all)}; };
const scaleTextW = sc => `선 그래프 눈금은 이 묶음이 함께 씀(${pW(sc.lo, 0)} ~ ${pW(sc.hi, 0)} · 점선이 첫날 종가)`;
const sharesW = v => { const a = Math.abs(v), sg = v > 0 ? '+' : v < 0 ? '−' : ''; return a >= 1e8 ? `${sg}${(a / 1e8).toFixed(1)}억주` : a >= 1e4 ? `${sg}${Math.round(a / 1e4).toLocaleString('ko-KR')}만주` : `${sg}${a.toLocaleString('ko-KR')}주`; };
const stampW = iso => { const d = new Date(Date.parse(iso) + 9 * 3600e3).toISOString(); return `${kd(d.slice(0, 10))} ${d.slice(11, 16)} KST`; };
/** 칸·카드 하나의 그래프·수급·기사가 판과 같은가(같지 않은 곳의 이름을 돌려줌) */
const briefMisW = (x, c, sc) => {
  const bad = [], b = c.brief, side = c.c.at(-1) > c.c[0] ? 'up' : c.c.at(-1) < c.c[0] ? 'down' : 'flat';
  if (!x.sp || x.sp.n !== c.c.length || x.sp.pts !== c.c.length || x.sp.lo !== sc.lo.toFixed(4) || x.sp.hi !== sc.hi.toFixed(4) || x.sp.side !== side) bad.push('그래프');
  if (b?.flows ? x.fl.join('|') !== `${sharesW(b.flows.foreign)}|${sharesW(b.flows.institution)}` || x.flMiss !== null : x.fl.length || x.flMiss !== (b && !b.missing.includes('수급') ? '수급 자료 없음' : '아직 모으지 않음')) bad.push('수급');
  if (b?.news ? x.nwT !== b.news.title || x.nwH !== `기사 · ${stampW(b.news.publishedAt)} · ${b.news.office ?? '언론사 이름 없음'}` || x.nwMiss !== null
    : x.nwT !== null || x.nwMiss !== (!b || b.missing.includes('기사') ? '아직 모으지 않음' : b.newsCount ? `회사 이름이 든 기사 없음 · 모은 기사 ${b.newsCount}건은 회사 화면에` : '모은 기사 없음')) bad.push('기사');
  return bad;
};
/** 태양(2026-10-05 13:53 · 14:30 · 14:40) — 화면 코드(shapes.js)와 따로 센다: 후보 여덟 · 오른 순 위 20% · 50% 넘게 · 10%p 넘게 · 공통 모양을 모두 가짐
   15:24 「잡스가 이 아틀란스를 혁신 한다면 큰틀에서 36가지를 찾아 개선하라」 B: 불장 · 업종 · 업종 화면 · 회사 · 예비 · 오름 상위의 태양 표시를 모두 이 값과 맞댄다 */
const SUNW = (() => {
  const runs = rd => rd.cells.reduce((o, c) => { const l = o.at(-1); if (l && l.s === c.side) l.n++; else o.push({s: c.side, n: 1}); return o; }, []);
  const day = (rd, side) => Object.values(rd.cells.filter(c => c.side === side).reduce((m, c) => (m[c.day] = (m[c.day] ?? 0) + 1, m), {}));
  const rec = (rd, side) => rd.cells.filter(c => c.side === side && c.day >= rd.days - rd.recentDays).length;
  const SH = [['longRed', '긴 빨강 줄', rd => runs(rd).some(x => x.s === 'up' && x.n >= 6)], ['redTwice', '빨강이 파랑의 2배', rd => { const u = rd.cells.filter(c => c.side === 'up').length, d = rd.cells.length - u; return u > 0 && u >= 2 * d; }],
    ['bigRedDay', '하루 빨강 5개', rd => day(rd, 'up').some(n => n >= 5)], ['recentRed', '끝 5일 빨강', rd => rec(rd, 'up') >= rec(rd, 'down') + 2], ['lastRed', '끝 줄 빨강', rd => rd.cells.at(-1)?.side === 'up'],
    ['shortBlue', '짧은 파랑 줄', rd => { const rs = runs(rd); return rs.some(x => x.s === 'up') && rs.every(x => x.s !== 'down' || x.n <= 2); }], ['noBigBlue', '큰 파랑 날 없음', rd => rd.cells.length > 0 && day(rd, 'down').every(n => n < 3)],
    ['redCols', '빨강 줄이 더 많음', rd => { const rs = runs(rd); return rs.filter(x => x.s === 'up').length > rs.filter(x => x.s === 'down').length; }]];
  const ranked = [...board.companies].sort(riseDesc), topN = Math.round(ranked.length * 0.2), top = ranked.slice(0, topN), rest = ranked.slice(topN), roads = new Map(board.companies.map(c => [c.code, roadOf(c.c)]));
  const sh = SH.map(([id, name, f]) => { const a = top.filter(c => f(roads.get(c.code))).length, b = rest.filter(c => f(roads.get(c.code))).length; return {id, name, f, sa: a / top.length, gap: a / top.length - b / rest.length}; });
  let pick = sh.filter(t => t.sa > 0.5 && t.gap > 0.10); if (pick.length < 3) pick = [...pick, ...sh.filter(t => !pick.includes(t) && t.gap > 0).sort((x, y) => y.gap - x.gap).slice(0, 3 - pick.length)];
  const common = sh.filter(t => pick.includes(t)), has = new Map(board.companies.map(c => [c.code, common.filter(t => t.f(roads.get(c.code))).map(t => t.id)]));
  return {common, has, topN, set: new Set(common.length ? board.companies.filter(c => has.get(c.code).length === common.length).map(c => c.code) : [])};
})();
const sunN = codes => codes.filter(code => SUNW.set.has(code)).length;
const sunNT = codes => sunN(codes) ? `${sunN(codes)}곳` : null;
// 우리 글에서 쓰지 않는 말(사장님 명령들) — 공식 이름(data-ident: 일정 이름·공시 제목·기사 제목)은 따로 본다
const OUR_FORBIDDEN = /사라[!.\s]|팔라[!.\s]|추천|목표가|확실|보장|무조건/;
const browser = await chromium.launch({executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE ?? undefined});

/** 화면 글 두 갈래: 우리 글(식별자 뺌) · 공식 이름(식별자) — 열린 칸만(닫힌 접힘 안은 innerText 에 없음) */
const textsOf = page => page.evaluate(() => {
  const main = document.getElementById('main'), clone = main.cloneNode(true);
  const idents = [...main.querySelectorAll('[data-ident]')].map(e => e.innerText);
  for (const e of clone.querySelectorAll('[data-ident], [data-pred-ok]')) e.remove(); // data-pred-ok: 사장님이 정하신 낱말 셋(예상 · 기대감 · 수혜 기대 — 2026-10-07 16:34 오늘의 돈 이야기)만 · 아래 「오늘의 돈 이야기」 검사가 그 셋뿐인지 봄
  clone.removeAttribute('id'); document.body.append(clone); const ours = clone.innerText; clone.remove();
  return {ours: ours + '\n' + document.getElementById('top').innerText + '\n' + document.getElementById('bottom').innerText, idents, marks: document.querySelectorAll('[data-forecast-date]').length};
});
async function wordsCheck(page, label) {
  const t = await textsOf(page), bad = (t.ours.match(new RegExp(PREDICTION_WORDS.source, 'g')) ?? []).concat(t.ours.match(new RegExp(OUR_FORBIDDEN.source, 'g')) ?? []);
  const badIdent = t.idents.filter(x => PREDICTION_WORDS.test(x));
  check(`${label}: 앞날 말·쓰지 않는 말 없음(우리 글 ${bad.length} · 공식 이름 ${badIdent.length}) · 예측 표시 ${t.marks}`, !bad.length && !badIdent.length && t.marks === 0, bad.length || badIdent.length ? {bad: bad.slice(0, 5), badIdent: badIdent.slice(0, 3)} : null);
}
/** 「보던 자리」를 재기 전에 누를 줄을 화면 가운데로 — 2026-10-06 00:50 고침: 줄이 아래 탭 막대 밑에 걸리면(10/6 00:41 「저녁 7시 들고 남」 첫 기록이 생겨 그 칸이 길어지자 「오름 상위」 6번째 줄이 그 자리)
 *  Playwright 가 누르기 직전에 화면을 다시 내려(28px → 416px) 잰 자리와 누른 자리가 달라짐 · 사이트는 누른 자리(416px)로 정확히 돌아왔음 — 사람은 가려진 줄을 누르지 않는다 */
/** 탐색 안 칸(시장 · 업종 · 종목 · 일정) — 2026-10-09 아래 탭 넷(후보 7 · 관심 · 검증 · 탐색) · 탐색 화면이 아니면 아래 탭 「탐색」 먼저 */
async function pressArea(page, press, area) { if (!await page.$('#main .ex-nav')) { await press(page.locator('.bottom-link[data-route="market"]')); await page.waitForSelector('#main .ex-nav'); } await press(page.locator(`#main .ex-nav .ex-b[data-area="${area}"]`)); }
async function toMid(loc) { await loc.scrollIntoViewIfNeeded(); await loc.evaluate(el => el.scrollIntoView({block: 'center', behavior: 'instant'})); }

/* 개편(2026-10-08 20:19 마카오 시각 사장님 첨부 「ATLAS 개편 실행 지시서」) — 아래 탭 다섯 · 위 막대 · 시장 첫 화면 ① ~ ⑤ · 투자자 매매 · 종목 묶음 · 검증 · 사건 카드 · 종목 상세 ① ~ ⑥ · 관심 저장 · 옛 주소
   기대값은 판 읽기(lens.json)와 판 자료로 이 검사기가 따로 셈(화면 코드를 부르지 않음) */
const wonW = v => { if (!Number.isFinite(v)) return '계산 불가'; const sg = v > 0 ? '+' : v < 0 ? '−' : '', a = Math.abs(v); return a >= 1e12 ? `${sg}${(a / 1e12).toFixed(2)}조 원` : a >= 1e8 ? `${sg}${Math.round(a / 1e8).toLocaleString('ko-KR')}억 원` : `${sg}${Math.round(a / 1e4).toLocaleString('ko-KR')}만 원`; };
/** 판 읽기 % 값의 보이는 글(소수 한 자리 · 부호 · 반올림해 0 이면 부호 없음) — 화면 코드(calc.js fmtPct)를 부르지 않고 따로 적음 */
const fpW = v => { if (!Number.isFinite(v)) return '계산 불가'; const a = Math.abs(v).toFixed(1); return `${Number(a) === 0 ? '' : v > 0 ? '+' : '−'}${a}%`; };
const fppW = v => { if (!Number.isFinite(v)) return '계산 불가'; const a = Math.abs(v).toFixed(1); return `${Number(a) === 0 ? '' : v > 0 ? '+' : '−'}${a}%p`; };
/** 판 읽기로 따로 셈 — 업종마다 값이 있는 종목(수익률 큰 차례 · 같으면 기호) · 합 · 평균 */
const sectorsW = lens => (lens.sectors ?? []).map(sc => { const ms = sc.codes.map(c => lens.stocks.find(x => x.code === c)).filter(Boolean), ok = ms.filter(x => Number.isFinite(x.r20)).sort((a, b) => b.r20 - a.r20 || a.code.localeCompare(b.code));
  return {sc, ms, ok, bad: ms.filter(x => !Number.isFinite(x.r20)), sum: ok.reduce((t, x) => t + x.r20, 0), n: ok.length, mean: ok.length ? ok.reduce((t, x) => t + x.r20, 0) / ok.length : null}; });
/* 재설계(사장님 2026-10-09 03:09 「ATLAS 제품 재설계 명령」 · 03:53 「돈에 흐름이 강한 업종내에서」 · 03:59 「잡스라면 … 애플의 방식」) — 첫 화면 「후보 7」
   기대값은 판 읽기(lens.json)와 /story.json(돈 흐름)으로 이 검사기가 따로 셈 · 사람처럼 눌러 봄: 후보 → 「왜 선정됐나요?」 → 후보 판단 칸 → 「‹ 후보 7」(자리 · 초점) → 「다른 후보와 비교」 → 고르기 → 「진입 조건 확인」 */
const eokW = v => { if (!Number.isFinite(v)) return '계산 불가'; const sg = v > 0 ? '+' : v < 0 ? '−' : '', a = Math.abs(v); return a >= 1e4 ? `${sg}${(a / 1e4).toFixed(1)}조` : `${sg}${Math.round(a).toLocaleString('ko-KR')}억`; };
async function candCheck(page, label, mobile, press) {
  // 2026-10-09 08:26 사장님 「넘 글이 많다 잡스였다면 … 입체적으로 보여야하는 중심으로」 — 첫 화면 = ① 기준 한 줄 → ② 탑 한 줄 + 고른 한 곳 카드 + 짧은 줄 → ③ 자세히(접힘 · 맨 위 돈 유입 1~365등)
  // 규칙 4판(2026-10-09 11:35 「전종목 365개 … 돈에 유입이 강력한 7개 … 비율계산 … 포모지수 … 1등부터 365등까지 … 20만번」 · 11:57 「현명하게 해봐」) — 업종 조건 없음 · 업종 돈 흐름은 받침 색(곁 정보)
  const lens = await get('data/atlas11/view/lens.json'), C = lens.cand, st = await get('story.json'), rot = st.rotation;
  await page.goto(base + '/#/', {waitUntil: 'networkidle'}); await page.waitForSelector('.cd-page section[data-art] .isl canvas'); await page.waitForTimeout(400);
  const readCard = () => page.evaluate(() => { const c = document.querySelector('.cd-card'); return {code: c?.dataset.code, rank: c?.querySelector('.cd-rk')?.textContent.trim(), name: c?.querySelector('.cd-name')?.textContent.trim(),
    why: c?.querySelector('.cd-why')?.innerText.replace(/\s+/g, ' ').trim(), risk: c?.querySelector('.cd-risk')?.innerText.replace(/\s+/g, ' ').trim(), btns: [...(c?.querySelectorAll('.cd-btn') ?? [])].map(b => b.textContent.trim()),
    pressed: [...document.querySelectorAll('.cd-row .cd-pick[aria-pressed="true"]')].map(b => b.closest('.cd-row').dataset.code), sel: [...document.querySelectorAll('.isl-pin.sel')].map(g => g.dataset.code), picked: !!document.querySelector('.isl.picked')}; });
  const cd = await page.evaluate(() => ({firsts: [...document.querySelectorAll('.cd-page [data-first]')].map(x => { const r = x.getBoundingClientRect(); return [x.dataset.first, Math.round(r.top), Math.round(r.bottom), x.matches('section[data-art]')]; }),
    tab: Math.round(document.getElementById('bottom').getBoundingClientRect().top), active: document.querySelector('.bottom-link.active')?.dataset.route, tabs: [...document.querySelectorAll('.bottom-link')].map(a => a.dataset.route).join(),
    rows: [...document.querySelectorAll('.cd-row')].map(li => ({code: li.dataset.code, rank: li.dataset.rank, status: li.dataset.status, name: li.querySelector('.cd-name')?.textContent.trim(), rk: li.querySelector('.cd-rk')?.textContent.trim(), pw: li.querySelector('.cd-pwv')?.textContent.trim(), m12: li.dataset.m12})),
    isl: (() => { const e = document.querySelector('.cd-page .isl'); if (!e) return null; let chk = null; try { chk = JSON.parse(e.dataset.check); } catch {} const cv = e.querySelector('canvas'), hd = e.querySelector('.isl-hud');
      return {chk, cvw: cv?.width ?? 0, cvh: cv?.height ?? 0, at: e.dataset.at, inArt: !!e.closest('section[data-art] .ra-art'), pins: [...e.querySelectorAll('.isl-pin')].map(b => ({code: b.dataset.code, rank: Number(b.dataset.rank), at: b.dataset.at, sel: b.classList.contains('sel'), text: b.textContent, r: b.getBoundingClientRect().toJSON()})),
        hud: hd?.innerText.replace(/\s+/g, ' ').trim() ?? '', hudR: hd?.getBoundingClientRect().toJSON() ?? null, stR: e.querySelector('.isl-stage')?.getBoundingClientRect().toJSON() ?? null, svgs: e.querySelectorAll('svg text').length, st: e.__isl?.state() ?? null}; })(),
    rest: !!document.querySelector('.cd-page .ra.ra-rest'), shownBtns: [...document.querySelectorAll('.cd-page .ra-btns .ra-b')].filter(b => b.offsetParent).map(b => b.textContent.trim()),
    rule: document.querySelector('.cd-rule')?.innerText.replace(/\s+/g, ' ').trim() ?? '', done: !!document.querySelector('.cd-page section[data-art] .ra.ra-done'), all: document.querySelector('.cd-all-a')?.textContent.trim() ?? null, sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth}));
  const fiOf = code => { const s = lens.stocks.find(x => x.code === code), fl = s?.fl ?? {}; return Number.isFinite(fl.f10e) && Number.isFinite(fl.i10e) ? (fl.f10e + fl.i10e) / 1e8 : null; };
  const powOf = code => { const s = lens.stocks.find(x => x.code === code), fi = fiOf(code), cap = s?.fund?.cap; return Number.isFinite(fi) && cap > 0 ? (fi / cap) * 100 : null; };
  // 돈 유입 1~365등 · 포모지수 — 이 검사기가 판 읽기 종목 값으로 따로 셈: 비율 = 외국인+기관 10거래일(억) ÷ 시가총액(억) × 100 · 큰 순(같으면 금액 · 종목 기호) · 포모지수 = 비율을 셀 수 있는 곳 안 자리(1등 100점)
  const ranked = lens.stocks.map(s => ({code: s.code, pw: powOf(s.code), fi: fiOf(s.code)})).filter(x => x.pw !== null).sort((p, q) => (q.pw - p.pw) || (q.fi - p.fi) || p.code.localeCompare(q.code));
  const rkW = new Map(ranked.map((x, i) => [x.code, i + 1])), pws = ranked.map(x => x.pw);
  const fomoW = code => { const v = powOf(code); if (v === null || !pws.length) return null; if (pws.length === 1) return 100; let lo = 0, eq = 0; for (const x of pws) { if (x < v) lo++; else if (x === v) eq++; } return Math.round(100 * (lo + 0.5 * (eq - 1)) / (pws.length - 1)); };
  // 5판(기르기판 · 2026-10-09 15:21 「만들어 줘」) — 1년 추세 값은 판 읽기 cand.grow.m(파이썬 따로 세기 scripts/atlas11/verify/cand_grow_verify.py 가 입력 종가로 맞댐)
  //   차례는 여기서 따로: 조건 여섯(flags — 그날 종가 · 흑자 · 위험 공시 없음 · 1년 추세 셈 · 그물 안 · 새로 듦)을 모두 넘은 곳 → 1년 추세 큰 순(같으면 종목 기호) · 같은 업종 3곳 · 7곳 · 담는 날이 지난 판은 판 읽기 7곳(담는 날 기록)
  const G = C.grow ?? {}, M = G.m ?? {}, mOf = code => (Number.isFinite(M[code]?.[0]) ? M[code][0] : null), cmpC = (a, b) => (a < b ? -1 : a > b ? 1 : 0);
  const gOf = code => lens.stocks.find(x => x.code === code)?.g;
  const fresh = Object.entries(C.flags ?? {}).filter(([code, f]) => f === '111111' && mOf(code) !== null).map(([code]) => ({code, m: mOf(code)})).sort((p, q) => (q.m - p.m) || cmpC(p.code, q.code));
  const per = new Map(), want = []; for (const e of fresh) { const k = per.get(gOf(e.code)) ?? 0; if (k >= 3 || want.length >= 7) continue; per.set(gOf(e.code), k + 1); want.push(e.code); }
  const wantRows = G.planted?.at && G.planted.at !== C.asOf ? C.items.map(x => x.code) : want;
  const m1W = code => Number((mOf(code) * 100).toFixed(1)), m12W = code => fpW(m1W(code)); // 보이는 글(소수 첫째 자리) — 판이 먼저 첫째 자리로 셈한 값과 같게
  const rowsOk = C.ready && C.rules === 'cand-rules-5' && cd.rows.length === C.items.length && cd.rows.length <= 7 && cd.rows.map(r => r.code).join() === wantRows.join() && cd.rows.every((r, i) => { const x = C.items[i]; return r.code === x.code && r.rank === String(i + 1) && r.rk === `${i + 1}위` && r.status === x.status && r.name === x.name && r.pw === m12W(x.code) && r.m12 === String(m1W(x.code)); });
  // 섬(2026-10-09 17:36 「아주 색시한 전달력 있게 … 반영해」 — 옛 탑 일곱 줄을 바꿈 · site/app/island.js) — 이 검사기가 판 읽기 1년 추세(grow.m)로 따로 셈:
  //   그물 기준선 = 1년 추세를 셀 수 있는 곳의 80번째 백분위(직선 보간) · 물 위 = 기준선 이상 곳 수 · 초록 = 그 가운데 기준 셋(그날 종가 · 흑자 · 위험 공시 없음 — flags 앞 셋)을 넘은 곳 수
  //   핀 = 후보 7곳(순위 차례 · 걸음 1~7 · 글자 없이 번호는 그림 표시) · 처음 고른 한 곳 = 1위(금빛 핀 하나 · 위 이름표 = 순위 · 이름 · 1년 추세) · 움직임 없음(정적인 상태)
  const qOf = xs => { const a = xs.filter(Number.isFinite).sort((x, y) => x - y), k = a.length; if (!k) return null; const pos = 0.8 * (k - 1), lo = Math.floor(pos), hi = Math.min(k - 1, lo + 1); return a[lo] + (a[hi] - a[lo]) * (pos - lo); };
  const qI = qOf(lens.stocks.map(s => mOf(s.code))), aboveW = lens.stocks.filter(s => mOf(s.code) !== null && mOf(s.code) >= qI).length;
  const greenW = lens.stocks.filter(s => mOf(s.code) !== null && mOf(s.code) >= qI && String(C.flags?.[s.code] ?? '').slice(0, 3) === '111').length;
  const I = cd.isl, x0 = C.items[0], pinR = (I?.pins ?? []).map(p => p.r), overlap = pinR.some((a, i) => pinR.some((b, j) => j > i && Math.hypot((a.x + a.width / 2) - (b.x + b.width / 2), (a.y + a.height / 2) - (b.y + b.height / 2)) < (a.width + b.width) / 2 - 1));
  const islOk = !!I && I.inArt && I.at === '0' && I.cvw > 0 && I.cvh > 0 && I.svgs === 0 && I.chk?.above === aboveW && I.chk?.green === greenW && I.pins.length === C.items.length
    && I.pins.every((p, i) => p.code === C.items[i].code && p.rank === C.items[i].rank && p.at === String(i + 1) && p.text === '' && p.sel === (i === 0)) && !overlap
    && (!x0 || (I.hud.includes(`${x0.rank}위`) && I.hud.includes(x0.name) && I.hud.includes(m12W(x0.code)))) && I.st?.busy === false && I.st?.hero === (x0?.code ?? null) && I.st?.picked === false
    && C.items.every((x, i) => x.status !== 'met' || (I.st?.seven?.[i]?.[1] ?? 0) > I.st.w);
  check(`${label} 첫 화면 「후보 7」 섬(규칙 5판 기르기판 · 2026-10-09 17:36 「아주 색시한 전달력」): ① 기준 → ② 그림 칸(섬 ${lens.stocks.length}곳 · 물 위 ${I?.chk?.above}곳 = 따로 센 그물 ${aboveW}곳 · 초록 ${I?.chk?.green}곳 = 따로 셈 ${greenW}곳 · 핀 ${I?.pins.length}개 = 후보 차례 · 겹침 ${overlap ? '있음' : '없음'} · 위 이름표 「${I?.hud}」 · 정적인 상태) · 짧은 줄 ${cd.rows.length}개(순위 · 이름 · 1년 추세 · 상태 = 판 읽기 · 그물 · 초입 차례 따로 셈 ${wantRows.length}곳) · 「${cd.all}」 → ③ 자세히 · 「후보 7」 눌림 · 처음에는 「재생」 하나만(${cd.shownBtns.join()})`,
    cd.firsts.map(x => x[0]).join() === '1,2,3' && cd.firsts.find(x => x[0] === '2')?.[3] === true && cd.firsts[0][2] <= cd.tab && cd.active === 'cand' && cd.tabs === 'cand,watch,check,market' && rowsOk && islOk
      && cd.all === `돈 유입 1등~${lens.stocks.length}등 모두 보기 ›` && cd.done && cd.rest && cd.shownBtns.join() === '재생' && cd.sw <= cd.cw && cd.rule.includes('예상 수익률 순위 아님') && cd.rule.includes('연구용 · 성능 검증 전') && cd.rule.includes('포트폴리오 아님'),
    {firsts: cd.firsts, rows: cd.rows.slice(0, 2), want: wantRows, isl: I && {chk: I.chk, pins: I.pins.map(p => [p.code, p.rank, p.at, p.sel, p.text]), hud: I.hud, st: I.st, cv: [I.cvw, I.cvh]}, aboveW, greenW, overlap, shown: cd.shownBtns, all: cd.all});
  // 섬 손 — 후보가 아닌 탑(가장 높은 탑 · 꼭대기는 앞의 낮은 탑에 가리지 않음)을 누르면 이름표(이름 · 1년 추세 · 그물 안팎) · 같은 탑을 다시 누르면 풀림 · 옆으로 끌면 섬이 돌고 놓은 뒤 멈춤(정적인 상태로) · 가로로 넘치지 않음
  const tallest = await page.evaluate(() => { const I2 = document.querySelector('.cd-page .isl').__isl, i = I2.tallest(), c = I2.codeAt(i), q = I2.tapPoint(c) ?? I2.pointOf(c), r = document.querySelector('.cd-page .isl-stage').getBoundingClientRect(); return {c, x: r.left + q[0], y: r.top + q[1], vis: r.top + q[1] > 60 && r.top + q[1] < innerHeight - 80}; });
  if (!tallest.vis) { await page.evaluate(() => document.querySelector('.cd-page .isl-stage').scrollIntoView({block: 'center'})); await page.waitForTimeout(200); Object.assign(tallest, await page.evaluate(c => { const I2 = document.querySelector('.cd-page .isl').__isl, q = I2.tapPoint(c) ?? I2.pointOf(c), r = document.querySelector('.cd-page .isl-stage').getBoundingClientRect(); return {x: r.left + q[0], y: r.top + q[1]}; }, tallest.c)); }
  await page.mouse.click(tallest.x, tallest.y); await page.waitForTimeout(250);
  const tg = await page.evaluate(() => { const t = document.querySelector('.cd-page .isl-tag'), hd = document.querySelector('.cd-page .isl-hud'), R = e => e.getBoundingClientRect().toJSON(); return {tag: t && !t.hidden ? t.innerText.replace(/\s+/g, ' ').trim() : null, st: document.querySelector('.cd-page .isl').__isl.state(), tr: t && !t.hidden ? R(t) : null, hr: hd && getComputedStyle(hd).position === 'absolute' ? R(hd) : null, sr: R(document.querySelector('.cd-page .isl-stage'))}; });
  const cross = (a, b) => !!a && !!b && a.left < b.right && b.left < a.right && a.top < b.bottom && b.top < a.bottom, tagFree = !!tg.tr && !cross(tg.tr, tg.hr) && tg.tr.left >= tg.sr.left - 1 && tg.tr.right <= tg.sr.right + 1 && tg.tr.top >= tg.sr.top - 1 && tg.tr.bottom <= tg.sr.bottom + 1; // 누른 탑 이름표가 위 이름표(고른 한 곳)와 겹치지 않음 · 섬 안 — 글 위에 글 없음(2026-10-09 시험 서버 사진에서 겹친 것을 고침)
  const tS = lens.stocks.find(s => s.code === tallest.c), tM = mOf(tallest.c), tagW = tS ? `${tS.name} ${fpW(m1W(tallest.c))} · ${tM !== null && tM >= qI ? (String(C.flags?.[tallest.c] ?? '').slice(0, 3) === '111' ? '그물 안' : '그물 안 · 기준 못 넘음') : tM === null ? '1년 추세 셀 수 없음' : '그물 밖'}` : null;
  await page.mouse.click(tallest.x, tallest.y); await page.waitForTimeout(250);
  const tg2 = await page.evaluate(() => { const t = document.querySelector('.cd-page .isl-tag'); return {hidden: !t || t.hidden, focus: document.querySelector('.cd-page .isl').__isl.state().focus}; });
  const sr = await page.evaluate(() => document.querySelector('.cd-page .isl-stage').getBoundingClientRect().toJSON()), th0 = (await page.evaluate(() => document.querySelector('.cd-page .isl').__isl.state())).th;
  await page.mouse.move(sr.x + sr.width * 0.3, sr.y + sr.height * 0.75); await page.mouse.down();
  for (let k = 1; k <= 8; k++) { await page.mouse.move(sr.x + sr.width * 0.3 + k * 18, sr.y + sr.height * 0.75); await page.waitForTimeout(16); }
  await page.mouse.up(); const th1 = (await page.evaluate(() => document.querySelector('.cd-page .isl').__isl.state())).th;
  await page.waitForFunction(() => !document.querySelector('.cd-page .isl').__isl.state().busy, null, {timeout: 6000}).catch(() => {});
  const dr = await page.evaluate(() => ({st: document.querySelector('.cd-page .isl').__isl.state(), sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth, card: document.querySelector('.cd-card')?.dataset.code}));
  check(`${label} 섬 손: 가장 높은 탑(${tS?.name}) 누르면 이름표 「${tg.tag}」(위 이름표와 겹치지 않음 · 섬 안 · 카드는 그대로 ${dr.card}) · 다시 누르면 풀림 · 옆으로 끌면 섬이 돎(${th0.toFixed(2)} → ${th1.toFixed(2)}) · 놓은 뒤 멈춤 · 가로로 넘치지 않음`,
    !!tagW && tg.tag === tagW && tagFree && tg.st.focus === tallest.c && tg2.hidden && tg2.focus === null && Math.abs(th1 - th0) > 0.5 && dr.st.busy === false && dr.sw <= dr.cw && dr.card === (x0?.code ?? undefined), {tallest, tagW, tg, tg2, th0, th1, dr});
  await page.goto(base + '/#/', {waitUntil: 'networkidle'}); await page.reload({waitUntil: 'networkidle'}); await page.waitForSelector('.cd-page section[data-art] .isl canvas'); await page.waitForTimeout(300);
  // 날씨(경고만 · 2026-10-09 15:00 기르기판 「날씨로 쉬기는 버림 → 흐린 날엔 경고만」) — 판 읽기 값(파이썬 따로 세기 cand_grow_verify.py 가 입력 종가로 맞댐)과 같게:
  //   흐림이면 첫 화면 ① 아래 경고 한 줄(평균보다 x% 아래 · 경고만) · 맑음이면 없음 · 흐린 날 길 = lens.json 날씨만 바꿔(목록 지문도 맞춰) 다시 열어 봄 — 빈 날 길과 같은 바꿔치기
  const W = G.weather ?? null, wxSay = w => `날씨 흐림 · 365곳 평균 지수가 ${w.days ?? 200}거래일 평균보다 ${Math.abs(w.pD).toFixed(1)}% 아래`;
  const wxRead = () => page.evaluate(() => { const e = document.querySelector('.cd-page .cd-wx'); return e ? {t: e.innerText.replace(/\s+/g, ' ').trim(), role: e.getAttribute('role'), first: e.closest('[data-first]')?.dataset.first ?? null, sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth} : null; });
  const wxNow = await wxRead(), vdir = new URL(base).pathname.replace(/\/$/, '') + '/data/atlas11/view/';
  const man = await get('data/atlas11/view/manifest.json'), ln = await get('data/atlas11/view/lens.json'), sim = {days: 200, ratio: 0.9512, pD: -4.9, state: 'cloudy'};
  ln.cand.grow.weather = sim; const lt = JSON.stringify(ln); if (man.files?.['lens.json']) man.files['lens.json'] = {...man.files['lens.json'], sha256: createHash('sha256').update(lt).digest('hex'), bytes: Buffer.byteLength(lt)};
  const mt = JSON.stringify(man), wxRoute = u => u.pathname === vdir + 'lens.json' || u.pathname === vdir + 'manifest.json';
  await page.route(wxRoute, r => r.fulfill({status: 200, contentType: 'application/json', body: new URL(r.request().url()).pathname.endsWith('/manifest.json') ? mt : lt}));
  await page.goto(base + '/#/', {waitUntil: 'networkidle'}); await page.reload({waitUntil: 'networkidle'}); await page.waitForSelector('.cd-page section[data-art] .isl canvas'); await page.waitForTimeout(200);
  const wxSim = await wxRead();
  await page.unroute(wxRoute); await page.goto(base + '/#/', {waitUntil: 'networkidle'}); await page.reload({waitUntil: 'networkidle'}); await page.waitForSelector('.cd-page section[data-art] .isl canvas'); await page.waitForTimeout(200);
  const wxBack = await wxRead();
  check(`${label} 날씨(경고만): 판 읽기 ${W ? `${W.state === 'cloudy' ? '흐림' : '맑음'} ${fpW(W.pD)}(${W.days}거래일 평균 대비)` : '셀 수 없음'} → 첫 화면 경고 ${wxNow ? '한 줄' : '없음'} · 흐린 날 길(자료만 바꿔 −4.9%) → ① 아래 「${wxSim?.t.slice(0, 44) ?? '없음'}…」 · 되돌리면 ${wxBack ? '있음' : '없음'}`,
    (W?.state === 'cloudy' ? !!wxNow?.t.startsWith(wxSay(W)) : wxNow === null) && !!wxSim?.t.startsWith(wxSay(sim)) && wxSim.t.includes('경고만(고르는 셈은 그대로)') && wxSim.role === 'note' && wxSim.first === '1' && wxSim.sw <= wxSim.cw
      && JSON.stringify(wxBack) === JSON.stringify(wxNow), {W, wxNow, wxSim, wxBack});
  // 카드 — 처음엔 1위 · 줄을 누르면 그 한 곳(고른 까닭 = 20만 번 중 횟수 + 돈 유입 비율 · 365곳 중 등수 · 포모지수 + 외국인+기관 금액 — 모두 따로 셈 · 가장 큰 위험 = 판 읽기) · 탑을 누르면 같은 카드 · 다른 탑은 흐려짐
  const cardWant = x => ({code: x.code, rank: `${x.rank}위`, name: x.name});
  const qW = fpW(G.qD), mdW = d => `${Number(String(d).slice(5, 7))}월 ${Number(String(d).slice(8, 10))}일`;
  const cardOk = (c, x) => c.code === x.code && c.rank === `${x.rank}위` && c.name === x.name && c.why.includes(`1년 추세 ${m12W(x.code)}(마지막 20거래일 뺌)`) && c.why.includes(`상위 20% 그물(기준선 ${qW})`) && c.why.includes(`${mdW(G.planted?.at)} 새로 든 초입`)
    && c.risk === `가장 큰 위험 ${x.risk.text}` && c.btns.join() === (C.items.length > 1 ? '왜 선정됐나요?,다른 후보와 비교' : '왜 선정됐나요?') && c.pressed.join() === x.code && c.sel.join() === x.code;
  const k0 = await readCard(), bads = [];
  if (C.items.length && !(cardOk(k0, C.items[0]) && !k0.picked)) bads.push({first: k0});
  for (const [i, x] of C.items.entries()) { await press(page.locator('.cd-row .cd-pick').nth(i)); await page.waitForTimeout(120); const c = await readCard(); if (!cardOk(c, x) || !c.picked) bads.push({i, c, want: cardWant(x)}); }
  if (C.items.length > 1) { const x = C.items.at(-1); await page.locator(`.isl-pin[data-code="${x.code}"]`).evaluate(g => g.click()); await page.waitForTimeout(150); const c = await readCard(); const hd = await page.evaluate(() => document.querySelector('.cd-page .isl-hud')?.innerText.replace(/\s+/g, ' ').trim() ?? ''); if (!cardOk(c, x) || !hd.includes(`${x.rank}위`) || !hd.includes(x.name) || !hd.includes(m12W(x.code))) bads.push({pin: x.code, c, hd}); }
  check(`${label} 첫 화면 카드: 처음 1위(금빛 핀 · 위 이름표) · 줄 ${C.items.length}개를 차례로 누르면 그 한 곳만(고른 까닭 · 가장 큰 위험 · 단추 둘 = 판 읽기 · 따로 셈 · 금빛이 그 핀으로) · 섬의 핀을 눌러도 같은 카드 · 위 이름표도 그 곳`, C.items.length > 0 && !bads.length, bads.slice(0, 2));
  // 「돈 유입 1~365등 모두 보기 ›」(11:35 「1등부터 365등까지 그것도 나열하는 곳을 만들어」) → ③ 자세히 맨 위 접힘이 열림(초점 · 화면 안) · 365줄 = 이 검사기가 따로 셈(등수 · 비율 · 포모지수 · 상태) · ★ = 후보 7곳 · 가로로 넘치지 않음
  const rankCheck = async () => {
    await page.goto(base + '/#/', {waitUntil: 'networkidle'}); await page.waitForSelector('.cd-page .cd-all-a'); await page.waitForTimeout(200);
    await press(page.locator('.cd-all-a')); await page.waitForSelector('details.cd-rank-d[open] li.rk-row');
    await page.waitForFunction(() => { const t = document.querySelector('details.cd-rank-d > summary')?.getBoundingClientRect().top; return t >= 56 && t <= 120; }, null, {timeout: 4000}).catch(() => {}); await page.waitForTimeout(200); // 부드럽게 옮겨 가는 동안 기다림(못 오면 아래에서 실패)
    const rk = await page.evaluate(() => { const d = document.querySelector('details.cd-rank-d'), r = d?.querySelector('summary')?.getBoundingClientRect(); return {open: !!d?.open, top: r ? Math.round(r.top) : null, h: innerHeight, focus: !!document.activeElement?.matches?.('details.cd-rank-d > summary'), sum: d?.querySelector('summary')?.textContent.trim(),
      rows: [...(d?.querySelectorAll('li.rk-row') ?? [])].map(li => ({c: li.dataset.code, r: li.dataset.r, n: li.querySelector('.rk-n')?.textContent.trim(), nm: li.querySelector('.rk-a')?.textContent.trim(), pick: li.classList.contains('rk-pick'), star: !!li.querySelector('.rk-star'), v: li.querySelector('.rk-v')?.firstChild?.textContent.trim() ?? null, x: li.querySelector('.rk-x')?.textContent.trim() ?? null, st: li.querySelector('.rk-st')?.textContent.trim()})),
      sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth}; });
    const stW = code => { const f = C.flags?.[code] ?? ''; return f[4] === '1' ? '그물 안' : f[3] === '1' ? '그물 밖' : '추세 셀 수 없음'; }; // 5판 — 돈 유입 줄의 상태 = 그물 안팎(flags 넷째 · 다섯째)
    const nameOf = code => lens.stocks.find(x => x.code === code)?.name, picked = new Set(C.items.map(x => x.code)), bad = [];
    const ratioW = v => { const a = Math.abs(v).toFixed(2); return `${Number(a) === 0 ? '' : v < 0 ? '−' : ''}${a}%`; }; // 사이트 숫자 꼴(calc.js shown) — 온 값으로 소수 둘째 자리 · 0.00 이면 부호 없음 · 빠진 돈은 「−」
    ranked.forEach((x, i) => { const r = rk.rows[i]; if (!r || r.c !== x.code || r.r !== String(i + 1) || r.n !== `${i + 1}위` || r.v !== ratioW(x.pw) || r.x !== `포모 ${fomoW(x.code)}점` || r.st !== stW(x.code) || r.nm !== nameOf(x.code) || r.pick !== picked.has(x.code) || r.star !== r.pick) bad.push({i, r, want: {c: x.code, pw: ratioW(x.pw), fomo: fomoW(x.code), st: stW(x.code)}}); });
    const rest = rk.rows.slice(ranked.length), restW = lens.stocks.map(s => s.code).filter(c => !rkW.has(c));
    const restOk = rest.length === restW.length && rest.every(r => r.r === '' && r.n === '등수 없음' && r.v === '자료 모자람' && r.x === null && r.st === stW(r.c) && !r.pick) && rest.map(r => r.c).sort().join() === [...restW].sort().join();
    check(`${label} 「돈 유입 1등~${lens.stocks.length}등 모두 보기 ›」 → ③ 자세히 맨 위 「${rk.sum}」이 열림(초점 · 위 막대 바로 아래 ${rk.top}px) · ${rk.rows.length}줄(등수 · 비율 · 포모지수 · 상태 = 이 검사기가 따로 셈 ${ranked.length}곳 + 등수 없음 ${restW.length}곳) · ★ ${rk.rows.filter(r => r.pick).length}곳 = 후보 ${C.items.length}곳 · 가로로 넘치지 않음`,
      rk.open && rk.focus && rk.top !== null && rk.top >= 56 && rk.top <= 120 && rk.sum === `돈 유입 1등~${lens.stocks.length}등 · 포모지수(곁 정보)` && rk.rows.length === lens.stocks.length && !bad.length && restOk
        && rk.rows.filter(r => r.pick).map(r => r.c).sort().join() === [...picked].sort().join() && rk.sw <= rk.cw,
      {bad: bad.slice(0, 3), n: rk.rows.length, top: rk.top, focus: rk.focus, restN: rest.length, sw: rk.sw, cw: rk.cw});
  };
  if (C.items.length < 2) return rankCheck();
  // 후보 둘째 줄 「왜 선정됐나요?」 → 종목 화면 「후보 판단」 칸(초점 · 화면 안) → 「‹ 후보 7곳」 → 보던 자리 · 누른 곳에 초점
  const x2 = C.items[1]; await press(page.locator('.cd-row .cd-pick').nth(1)); await page.waitForTimeout(150);
  const btn = page.locator('.cd-card .cd-btn').first(); await toMid(btn);
  const y0 = await page.evaluate(() => Math.round(scrollY));
  await press(btn); await page.waitForSelector('.cj-box .cj-h'); await page.waitForTimeout(400);
  const cj = await page.evaluate(() => { const b = document.querySelector('.cj-box'), r = b?.getBoundingClientRect(); return {hash: location.hash, focus: document.activeElement?.classList.contains('cj-h') ?? false, top: r ? Math.round(r.top) : null, h: innerHeight,
    head: b?.querySelector('.cj-hn')?.textContent.trim(), qs: [...(b?.querySelectorAll('.cj-qh') ?? [])].map(x => x.textContent.trim()), acts: [...(b?.querySelectorAll('.cj-acts .cd-btn') ?? [])].map(x => x.textContent.trim()), back: document.querySelector('.c-back')?.textContent.trim(), active: document.querySelector('.bottom-link.active')?.dataset.route}; });
  check(`${label} 재설계 · 「왜 선정됐나요?」(${x2.name}) → 종목 화면 「후보 판단 · 검토 순위 2위」 칸이 화면 안 · 초점 · 단추 다섯(이름 = 누르면 보는 것) · 질문 일곱(왜 이 종목 · 왜 그날 · 값의 뜻 · 진입 조건 · 판단이 바뀌는 조건 · 이어서 확인 · 선정 이후 결과) · 「후보 7」 눌린 채로`,
    cj.hash === '#/stock/' + x2.code && cj.focus && cj.top >= 0 && cj.top < cj.h && cj.head === '후보 판단 · 검토 순위 2위' && cj.acts.join() === '왜 선정됐나요?,다른 후보와 비교,진입 조건 확인,판단이 바뀌는 조건,선정 이후 결과' && cj.qs.length === 7 && cj.qs[0] === '왜 이 종목인가?' && cj.qs[4] === '무엇이 달라지면 판단을 거두는가?' && cj.back === '‹ 후보 7곳' && cj.active === 'cand', cj);
  await press(page.locator('.cj-acts .cd-btn', {hasText: '진입 조건 확인'})); await page.waitForTimeout(500);
  const en = await page.evaluate(() => ({focus: document.activeElement?.id ?? null, rows: [...document.querySelectorAll('#cj-entry .cj-t tbody tr')].map(tr => tr.querySelector('th')?.textContent.trim())}));
  check(`${label} 재설계 · 「진입 조건 확인」 → 그 칸으로(초점 #${en.focus}) · 조건 ${en.rows.length}줄(${en.rows.join(' · ')})`, en.focus === 'cj-entry' && en.rows.join() === '1년 추세,흑자,위험 공시(30일),희석 공시(30일 · 위험 줄)', en);
  await press(page.locator('.c-back')); await page.waitForSelector('.cd-page section[data-art]'); await page.waitForTimeout(500);
  const bk = await page.evaluate(() => ({hash: location.hash, y: Math.round(scrollY), focus: document.activeElement?.getAttribute('href') ?? null, card: document.querySelector('.cd-card')?.dataset.code ?? null, sel: [...document.querySelectorAll('.isl-pin.sel')].map(g => g.dataset.code).join()}));
  check(`${label} 재설계 · 「‹ 후보 7곳」 → 보던 자리(${y0}px → ${bk.y}px) · 고른 카드 그대로(${bk.card}) · 누른 곳에 초점(${bk.focus})`, bk.hash === '#/' && Math.abs(bk.y - y0) <= 2 && bk.focus === '#/stock/' + x2.code && bk.card === x2.code && bk.sel === x2.code, {y0, bk});
  // 「다른 후보와 비교」(첫 줄) → 같은 기준 표 · 같은 축 막대 · 앞선 까닭 → 「나」를 바꾸면 그 자리에서(주소만 바뀜 · 화면을 새로 그리지 않음)
  const c0 = C.items[0], c1 = C.items[1];
  await press(page.locator('.cd-row .cd-pick').first()); await page.waitForTimeout(150);
  await press(page.locator('.cd-card .cd-btn', {hasText: '다른 후보와 비교'})); await page.waitForSelector('.cmp-page section[data-art]'); await page.waitForTimeout(300);
  const cm = await page.evaluate(() => ({hash: location.hash, a: document.querySelector('#cmp-a')?.value, b: document.querySelector('#cmp-b')?.value, say: document.querySelector('.cmp-say')?.textContent.trim(), rows: document.querySelectorAll('.cmp-t tbody tr').length, chk: JSON.parse(document.querySelector('.cmp-page [data-check]')?.dataset.check ?? '{}'), back: document.querySelector('.c-back')?.textContent.trim(), firsts: [...document.querySelectorAll('.cmp-page [data-first]')].map(x => x.dataset.first).join()}));
  const ST5W = {met: '그물 안', wait: '그물 밖', recheck: '재검토'};
  const sayW = c0.status === 'met' && c1.status !== 'met' ? `앞선 쪽은 1위 ${c0.name} — 그물 안(상대 쪽은 ${ST5W[c1.status]})` : `앞선 쪽은 1위 ${c0.name} — 담는 날 1년 추세가 더 큼(지금 ${m12W(c0.code)} 대 ${m12W(c1.code)})`;
  check(`${label} 재설계 · 「다른 후보와 비교」 → #/compare/${c0.code}/${c1.code} · 「${cm.say}」(따로 셈) · 같은 기준 표 ${cm.rows}줄 · 같은 축 막대 값 = 판 읽기 · 「‹ 후보 7」`,
    cm.hash === `#/compare/${c0.code}/${c1.code}` && cm.a === c0.code && cm.b === c1.code && cm.say === sayW && cm.rows === 14 && cm.chk.am12 === m1W(c0.code) && cm.chk.bm12 === m1W(c1.code) && cm.back === '‹ 후보 7곳' && cm.firsts === '1,2,3,4,5', {cm, sayW});
  if (C.items.length >= 3) {
    const c2 = C.items[2], nodes0 = await page.evaluate(() => { window.__cmpRow = document.querySelector('.cmp-row[data-who="b"]'); return true; });
    await page.selectOption('#cmp-b', c2.code); await page.waitForTimeout(600);
    const cm2 = await page.evaluate(() => ({hash: location.hash, same: window.__cmpRow === document.querySelector('.cmp-row[data-who="b"]'), name: document.querySelector('.cmp-row[data-who="b"] .bc-name')?.textContent.trim(), chk: JSON.parse(document.querySelector('.cmp-page [data-check]')?.dataset.check ?? '{}')}));
    check(`${label} 재설계 · 비교 「나」를 ${c2.name}(으)로 → 주소 #/compare/${c0.code}/${c2.code} · 같은 막대가 그 자리에서 옮겨 감(화면을 새로 그리지 않음) · 값 = 판 읽기`, nodes0 && cm2.hash === `#/compare/${c0.code}/${c2.code}` && cm2.same && cm2.name === c2.name && cm2.chk.b === c2.code && cm2.chk.bm12 === m1W(c2.code), cm2);
  }
  await rankCheck();
}
/** 미국 판 「후보 7」 섬(2026-10-09 19:29 「미국장 까지 다 대입」) — 같은 규칙 · 위험 공시는 「확인 못 함」(공시 원문 자료 없음 — 없다고 쓰지 않음) · 돈 유입 1~365등 없음(투자자 매매 자료 없음)
 *   이 검사기가 미국 판 읽기(us/data/atlas11/view/lens.json)의 1년 추세(grow.m)로 기준선 · 물 위 · 초록 · 7곳 차례를 따로 셈해 섬 그림 값 · 핀 · 위 이름표와 맞댐 */
async function usCandCheck(page, label) {
  const lens = await get('us/data/atlas11/view/lens.json'), C = lens.cand;
  if (!C?.ready) { check(`${label} 미국 판 「후보 7」 섬: 판 읽기에 미국 판 후보가 없음(${C?.why ?? '판 읽기 없음'})`, false, {why: C?.why}); return; }
  await page.goto(base + '/us/#/', {waitUntil: 'networkidle'}); await page.waitForSelector('.cd-page section[data-art] .isl canvas', {timeout: 20000}); await page.waitForTimeout(400);
  const G = C.grow ?? {}, M = G.m ?? {}, mOf = code => (Number.isFinite(M[code]?.[0]) ? M[code][0] : null), cmpC = (a, b) => (a < b ? -1 : a > b ? 1 : 0), gOf = code => lens.stocks.find(x => x.code === code)?.g;
  const qOf = xs => { const a = xs.filter(Number.isFinite).sort((x, y) => x - y), k = a.length; if (!k) return null; const pos = 0.8 * (k - 1), lo = Math.floor(pos), hi = Math.min(k - 1, lo + 1); return a[lo] + (a[hi] - a[lo]) * (pos - lo); };
  const qI = qOf(lens.stocks.map(s => mOf(s.code))), aboveW = lens.stocks.filter(s => mOf(s.code) !== null && mOf(s.code) >= qI).length;
  const greenW = lens.stocks.filter(s => mOf(s.code) !== null && mOf(s.code) >= qI && String(C.flags?.[s.code] ?? '').slice(0, 3) === '111').length;
  const fresh = Object.entries(C.flags ?? {}).filter(([code, f]) => f === '111111' && mOf(code) !== null).map(([code]) => ({code, m: mOf(code)})).sort((p, q) => (q.m - p.m) || cmpC(p.code, q.code));
  const per = new Map(), want = []; for (const e of fresh) { const k = per.get(gOf(e.code)) ?? 0; if (k >= 3 || want.length >= 7) continue; per.set(gOf(e.code), k + 1); want.push(e.code); }
  const wantRows = G.planted?.at && G.planted.at !== C.asOf ? C.items.map(x => x.code) : want, x0 = C.items[0];
  const m12W = code => fpW(Number((mOf(code) * 100).toFixed(1)));
  const u = await page.evaluate(() => { const e = document.querySelector('.cd-page .isl'); let chk = null; try { chk = JSON.parse(e.dataset.check); } catch {}
    return {chk, pins: [...e.querySelectorAll('.isl-pin')].map(b => ({code: b.dataset.code, rank: Number(b.dataset.rank), sel: b.classList.contains('sel'), r: b.getBoundingClientRect().toJSON()})), hud: e.querySelector('.isl-hud')?.innerText.replace(/\s+/g, ' ').trim() ?? '',
      rows: [...document.querySelectorAll('.cd-row')].map(li => li.dataset.code), all: document.querySelector('.cd-all-a')?.textContent.trim() ?? null, rank: !!document.querySelector('details.cd-rank-d'), st: e.__isl?.state() ?? null,
      text: document.querySelector('.cd-page')?.innerText ?? '', place: document.querySelector('.place-btn[aria-pressed="true"], [data-place].on')?.textContent?.trim() ?? null, sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth}; });
  const pinR = u.pins.map(p => p.r), overlap = pinR.some((a, i) => pinR.some((b, j) => j > i && Math.hypot((a.x + a.width / 2) - (b.x + b.width / 2), (a.y + a.height / 2) - (b.y + b.height / 2)) < (a.width + b.width) / 2 - 1));
  // 상세 접힘 글(어떻게 골랐나 · 고르는 법)에 「확인 못 함」이 있고 「위험 공시 없음」은 없어야(미국 판은 공시 자료가 없음 — 없다고 쓰지 않음)
  const folds = await page.evaluate(() => { document.querySelectorAll('.cd-page details').forEach(d => { d.open = true; }); return document.querySelector('.cd-page')?.innerText ?? ''; });
  const honest = folds.includes('확인 못 함') && !folds.includes('위험 공시 없음') && !folds.includes('100번 중 60번') && !folds.includes('외국인+기관');
  const ok = u.chk?.above === aboveW && u.chk?.green === greenW && u.chk?.n === C.items.length && u.rows.join() === wantRows.join() && u.pins.length === C.items.length
    && u.pins.every((p, i) => p.code === C.items[i].code && p.rank === i + 1 && p.sel === (i === 0)) && !overlap && (!x0 || (u.hud.includes(`${x0.rank}위`) && u.hud.includes(x0.name) && u.hud.includes(m12W(x0.code))))
    && u.st?.busy === false && u.all === null && !u.rank && honest && u.sw <= u.cw;
  check(`${label} 미국 판 「후보 7」 섬(2026-10-09 19:29 「미국장 까지 다 대입」): 물 위 ${u.chk?.above}곳 = 따로 센 ${aboveW}곳 · 그물 ${u.chk?.green}곳 = 따로 셈 ${greenW}곳 · 핀 ${u.pins.length}개 · 줄 차례 = 따로 센 차례(${wantRows.join(' · ')}) · 위 이름표 「${u.hud}」 · 돈 유입 1~365등 없음 · 위험 공시 「확인 못 함」(「없음」이라 쓰지 않음) · 옆 넘침 없음`,
    ok, {chk: u.chk, aboveW, greenW, rows: u.rows, want: wantRows, hud: u.hud, all: u.all, rank: u.rank, honest, overlap, sw: u.sw, cw: u.cw});
}
async function restructCheck(page, label, mobile, press) {
  const lens = await get('data/atlas11/view/lens.json');
  await candCheck(page, label, mobile, press);
  await usCandCheck(page, label); // 미국 판 「후보 7」 섬(2026-10-09 19:29) // 2026-10-09 03:09 「ATLAS 제품 재설계 명령」 — 첫 화면 「후보 7」 · 비교 · 종목 화면 후보 판단 · 뒤로 오면 자리 · 초점
  await page.goto(base + '/#/market', {waitUntil: 'networkidle'}); await page.waitForSelector('.mk-page [data-first="5"]'); await page.waitForTimeout(300);
  const firstsOf = sel => page.evaluate(sel => ({firsts: [...document.querySelectorAll(sel + ' [data-first]')].map(x => { const r = x.getBoundingClientRect(); return {n: x.dataset.first, art: x.matches('section[data-art]'), top: Math.round(r.top), bottom: Math.round(r.bottom), t: x.innerText.replace(/\s+/g, ' ').trim()}; }),
    tab: Math.round(document.getElementById('bottom').getBoundingClientRect().top), tabs: [...document.querySelectorAll('.bottom-link')].map(a => [a.dataset.route, a.innerText.replace(/\s+/g, '')]), active: document.querySelector('.bottom-link.active')?.dataset.route,
    links: [...document.querySelectorAll(sel + ' [data-first="5"] a')].map(a => a.getAttribute('href')), go: document.querySelector(sel + ' [data-first="5"] .ob-go')?.getAttribute('href') ?? null, done: !!document.querySelector(sel + ' section[data-art] .ra.ra-done'),
    top: [...document.querySelectorAll('.top .tb-b')].map(a => a.dataset.view ?? 'more'), menu: !!document.querySelector('.top .tb-more .tb-menu .lang') && !!document.querySelector('.top .tb-more #font-btn') && !!document.querySelector('.top .tb-more #voice-btn'),
    sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth}), sel);
  const order5 = f => f.firsts.map(x => x.n).join() === '1,2,3,4,5' && f.firsts.every((x, i) => !i || x.top >= f.firsts[i - 1].bottom - 1) && f.firsts.find(x => x.n === '4')?.art === true && f.firsts[0].bottom <= f.tab && f.sw <= f.cw && f.done;
  const mk = await firstsOf('.mk-page');
  check(`${label} 재설계 · 아래 탭 넷 ${mk.tabs.map(x => x[1]).join(' · ')}(시장은 「탐색」 안 — 「탐색」 눌림) · 위 막대 찾기 · 안내 · 보기(말 · 글씨 · 소리) — 2026-10-09 03:09 세 가지 작업(후보 7 · 관심 · 검증) + 탐색`, mk.tabs.map(x => x[0]).join() === 'cand,watch,check,market' && mk.tabs.map(x => x[1]).join() === '후보7,관심,검증,탐색' && mk.active === 'market' && mk.top.join() === 'stocks,guide,more' && mk.menu, {tabs: mk.tabs, top: mk.top, menu: mk.menu});
  const t = (f, n) => f.firsts.find(x => x.n === String(n))?.t ?? '';
  check(`${label} 개편 · 시장 첫 화면(지시서 5): ① 기준 → ② 관측 → ③ 핵심 수치 → ④ 핵심 차트(그림 칸) → ⑤ 이어서 보기 차례 · ① 이 첫 화면 안 · 그림은 처음에 최신 결과(멈춤) · 옆으로 넘치지 않음`, order5(mk), mk.firsts.map(x => [x.n, x.art, x.top, x.bottom]));
  const rs = lens.stocks.map(x => x.r20).filter(Number.isFinite), N = rs.length, UP = rs.filter(x => x > 0).length, srt = [...rs].sort((a, b) => a - b), MED = N % 2 ? srt[(N - 1) / 2] : (srt[N / 2 - 1] + srt[N / 2]) / 2, R = lens.market.ref;
  check(`${label} 개편 · 시장 첫 화면 숫자 = 판 읽기에서 따로 셈: 값이 있는 ${N}곳 · ${R.name} 20거래일 ${fpW(R.r20)} · 중앙값 ${fpW(MED)} · 오른 곳 ${UP}/${N}곳 · 「시장 전체 아님」 · ④ 반대 근거 · ⑤ 「변화의 근거 보기」 → 업종 탭`,
    t(mk, 1).includes(`${kd(lens.asOf)} 종가`) && t(mk, 1).includes('시장 전체 아님') && t(mk, 1).includes(`값이 있는 ${N}곳`) && t(mk, 2).includes(`선정 ${N}곳`) && t(mk, 2).includes(fpW(R.r20))
      && t(mk, 3).includes(fpW(R.r20)) && t(mk, 3).includes(fpW(MED)) && t(mk, 3).includes(`${UP}/${N}곳`) && t(mk, 4).includes('반대 근거') && t(mk, 4).includes('기여 1위 업종')
      && mk.go === '#/sectors' && ['#/flow', '#/agenda', '#/stocks', '#/check'].every(hh => mk.links.includes(hh)), {t1: t(mk, 1).slice(0, 160), t2: t(mk, 2), t3: t(mk, 3), links: mk.links, go: mk.go});
  // 투자자 매매(#/flow) — 시장 안 보기(2026-10-09) · 추정액 = 판 읽기 · 20거래일 계산 불가 · 공식 값 = 주식 수
  await press(page.locator('.mk-page .hs-b[data-seg="who"]')); await page.waitForSelector('.fw-page [data-first="1"]'); await page.waitForTimeout(250);
  const fw = await page.evaluate(() => ({rows: [...document.querySelectorAll('.fw-t tbody tr')].map(tr => [...tr.children].map(c => c.innerText.replace(/\s+/g, ' ').trim())), lead: document.querySelector('.fw-page [data-first="1"]')?.innerText.replace(/\s+/g, ' ') ?? '', art: document.querySelector('.fw-page section[data-art]')?.dataset.art ?? null, active: document.querySelector('.bottom-link.active')?.dataset.route, sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth}));
  const F = lens.flows, cellW = v => wonW(v?.est) + (v?.estMissing ? ` · ${v.estMissing}곳 뺌` : '');
  const fwWant = F.available ? [['외국인', 'foreign'], ['기관', 'institution'], ['개인', 'individual']].map(([nm, k]) => [nm, cellW(F.market[k].d1), cellW(F.market[k].d5), cellW(F.market[k].d10), '계산 불가']) : [];
  check(`${label} 개편 · 시장 안 투자자 매매: 표 ${fw.rows.length}줄(외국인 · 기관 · 개인 × 1 · 5 · 10거래일 추정액 · 20거래일 계산 불가) = 판 읽기 · 「공식 값 = 순매수 주식 수」 · 그림 ${fw.art} · 탭 「시장」 눌림`, (F.available ? JSON.stringify(fw.rows) === JSON.stringify(fwWant) && fw.lead.includes('공식 값 = 순매수 주식 수') && fw.art === 'flowwho' && fw.sw <= fw.cw : fw.art === 'flowwho') && fw.active === 'market', {rows: fw.rows, want: fwWant, active: fw.active});
  // 업종 탭(#/sectors · 2026-10-09 지시서 4 · 6) — ① ~ ⑤ · 평균 펼치기(대표 조작): 「기여 1위 업종 제외」 → 앞뒤 평균 · 분모 · 그 줄 제자리 표시 → 「원래대로」
  await pressArea(page, press, 'sectors'); await page.waitForSelector('.sx-page [data-first="5"] .ob-go, .sx-page [data-first="5"]'); await page.waitForTimeout(300);
  const sx = await firstsOf('.sx-page'), SW = sectorsW(lens), live = SW.filter(x => x.n), G = SW.length, upG = live.filter(x => x.mean > 0).length, broadG = lens.sectors.filter(x => x.level === 'broad').length;
  let TOP = null; for (const x of SW) if (x.n && (!TOP || x.sum > TOP.sum)) TOP = x;
  const MEAN = rs.reduce((a, b) => a + b, 0) / N, EXM = TOP ? (rs.reduce((a, b) => a + b, 0) - TOP.sum) / (N - TOP.n) : null;
  check(`${label} 개편 · 업종 탭: ① ~ ⑤(④ = 평균 펼치기 그림) · 탭 「업종」 눌림 · ② 「업종 ${G}개 · 평균이 오른 업종 ${upG}개 · 동반 강세 ${broadG}개」 · ⑤ 「${TOP?.sc.label} 구성 종목 보기」 = 기여 1위(따로 셈)`,
    order5(sx) && sx.active === 'market' && t(sx, 2).includes(`업종 ${G}개`) && t(sx, 2).includes(`오른 업종은 ${upG}개`) && t(sx, 2).includes(`(동반 강세)은 ${broadG}개`) && t(sx, 3).includes(fppW(TOP.sum / N)) && sx.go === '#/i/' + TOP.sc.id, {firsts: sx.firsts.map(x => [x.n, x.art, x.t.slice(0, 80)]), go: sx.go});
  const cellsOf = sel => page.evaluate(sel => [...document.querySelectorAll(sel + ' .dc-cell')].map(c => c.innerText.replace(/\s+/g, ' ').trim()), sel);
  const cellAt = (cs, k) => cs.find(x => x.startsWith(k + ' ')) ?? null; // 요약 칸을 이름으로 찾음(평균(단순) · 지수 대비 · 오른 곳 · 중앙값 · 분모 · 시가총액 가중)
  const rowsOf = sel => page.evaluate(sel => ({ids: [...document.querySelectorAll(sel + ' .dc-row')].map(r => r.dataset.id), ex: [...document.querySelectorAll(sel + ' .dc-row.is-ex')].map(r => r.dataset.id), pressed: document.querySelector(sel + ' .dc-top')?.getAttribute('aria-pressed'), reset: !!document.querySelector(sel + ' .dc-reset')?.disabled, live: document.querySelector(sel + ' .dc-live')?.textContent.trim()}), sel);
  const s0 = await cellsOf('.sx-page'), r0 = await rowsOf('.sx-page');
  await press(page.locator('.sx-page .dc-top')); await page.waitForTimeout(150);
  const s1 = await cellsOf('.sx-page'), r1 = await rowsOf('.sx-page');
  await press(page.locator('.sx-page .dc-reset')); await page.waitForTimeout(150);
  const s2 = await cellsOf('.sx-page'), r2 = await rowsOf('.sx-page');
  check(`${label} 대표 조작(업종 탭): 「기여 1위 업종 제외」 → 평균 ${fpW(MEAN)} → ${fpW(EXM)} · ${R.name} 대비 ${fppW(MEAN - R.r20)} → ${fppW(EXM - R.r20)} · 분모 ${N}곳 → ${N - TOP.n}곳(따로 셈) · 「${TOP.sc.label}」 줄은 제자리 「제외」 · 「원래대로」 → 처음 값`,
    cellAt(s0, '평균(단순)') === `평균(단순) ${fpW(MEAN)}` && cellAt(s0, '분모(값이 있는 곳)') === `분모(값이 있는 곳) ${N}곳` && cellAt(s0, `${R.name} 대비`) === `${R.name} 대비 ${fppW(MEAN - R.r20)}` && s0[1] === cellAt(s0, `${R.name} 대비`)
      && cellAt(s1, '평균(단순)') === `평균(단순) ${fpW(MEAN)} → ${fpW(EXM)}` && cellAt(s1, '분모(값이 있는 곳)') === `분모(값이 있는 곳) ${N}곳 → ${N - TOP.n}곳` && cellAt(s1, '오른 곳') === `오른 곳 ${UP}/${N}곳 → ${UP - TOP.ok.filter(x => x.r20 > 0).length}/${N - TOP.n}곳` && cellAt(s1, `${R.name} 대비`) === `${R.name} 대비 ${fppW(MEAN - R.r20)} → ${fppW(EXM - R.r20)}`
      && r1.ex.join() === TOP.sc.id && r1.ids.join() === r0.ids.join() && r1.pressed === 'true' && !r1.reset && r0.reset && JSON.stringify(s2) === JSON.stringify(s0) && r2.ex.length === 0 && r2.pressed === 'false', {s0, s1, s2, r0: {...r0, ids: r0.ids.slice(0, 4)}, r1: {...r1, ids: r1.ids.slice(0, 4)}});
  // 업종 탭 ⑤ → 업종 화면(같은 부품 · 업종 → 종목) — 「상승 1위 제외」 · 되돌아가기 「‹ 업종 진단」
  await press(page.locator('.sx-page .ob-go')); await page.waitForSelector(`article.i-page[data-group="${TOP.sc.id}"] .dc-row`); await page.waitForTimeout(250);
  const ib0 = await page.evaluate(() => ({back: [document.querySelector('.c-back')?.getAttribute('href'), document.querySelector('.c-back')?.textContent.trim()], active: document.querySelector('.bottom-link.active')?.dataset.route,
    rows: [...document.querySelectorAll('article.i-page .dc-row')].map(r => [r.dataset.id, r.querySelector('.bc-val')?.textContent.trim(), r.classList.contains('is-ex')]), counter: document.querySelector('article.i-page .ob-counter')?.textContent.trim() ?? null, go: document.querySelector('article.i-page .dc-go')?.getAttribute('href') ?? null}));
  const i0 = await cellsOf('article.i-page');
  await press(page.locator('article.i-page .dc-top')); await page.waitForTimeout(150);
  const i1 = await cellsOf('article.i-page'), ir1 = await rowsOf('article.i-page');
  const rowsWantI = [...TOP.ok.map(x => [x.code, fpW(x.r20), false]), ...TOP.bad.map(x => [x.code, '값 없음', true])], exTopI = TOP.n > 1 ? TOP.ok.slice(1).reduce((a, x) => a + x.r20, 0) / (TOP.n - 1) : null;
  check(`${label} 대표 조작(업종 화면 「${TOP.sc.label}」): 되돌아가기 「${ib0.back[1]}」 · 탭 「업종」 · 줄 ${ib0.rows.length}개 = 판 읽기(수익률 큰 차례 · 값 없는 곳 맨 뒤) · 「상승 1위 제외」 → 평균 ${fpW(TOP.mean)} → ${fpW(exTopI)} · 분모 ${TOP.n}곳 → ${TOP.n - 1}곳`,
    ib0.back[0] === '#/sectors' && ib0.back[1] === '‹ 업종 진단' && ib0.active === 'market' && JSON.stringify(ib0.rows) === JSON.stringify(rowsWantI) && cellAt(i0, '평균(단순)') === `평균(단순) ${fpW(TOP.mean)}` && cellAt(i0, `${R.name} 대비`) === `${R.name} 대비 ${fppW(TOP.mean - R.r20)}`
      && (TOP.n > 1 ? cellAt(i1, '평균(단순)') === `평균(단순) ${fpW(TOP.mean)} → ${fpW(exTopI)}` && cellAt(i1, '분모(값이 있는 곳)') === `분모(값이 있는 곳) ${TOP.n}곳 → ${TOP.n - 1}곳` && cellAt(i1, `${R.name} 대비`) === `${R.name} 대비 ${fppW(TOP.mean - R.r20)} → ${fppW(exTopI - R.r20)}` && ir1.ex.join() === TOP.ok[0].code : true)
      && ib0.counter === `상승 1위 ${TOP.ok[0].name} 제외 평균 ${fpW(exTopI)}` && ib0.go === `#/stock/${TOP.ok[0].code}`, {ib0, i0, i1, want: rowsWantI});
  await press(page.locator('article.i-page .dc-reset')); await page.waitForTimeout(100);
  // 회사로 갔다 오면 업종 화면의 보던 자리(지시서 0-E)
  const coRow = page.locator(`article.i-page .dc-row a.bc-name`).last(); await toMid(coRow);
  const yI = await page.evaluate(() => Math.round(scrollY)), coHref = await coRow.getAttribute('href');
  await press(coRow); await page.waitForSelector('.c-chart svg.lc'); await page.waitForTimeout(250);
  const cbk = await page.evaluate(() => ({hash: location.hash, back: document.querySelector('.c-back')?.getAttribute('href')}));
  await press(page.locator('.c-back')); await page.waitForSelector(`article.i-page[data-group="${TOP.sc.id}"] .dc-row`); await page.waitForTimeout(400);
  const yB = await page.evaluate(() => Math.round(scrollY));
  check(`${label} 업종 화면 → 회사(${coHref}) → 「‹ ${TOP.sc.label}」 → 업종 화면 보던 자리(${yI}px → ${yB}px)`, cbk.hash === coHref && cbk.back === '#/i/' + TOP.sc.id && Math.abs(yB - yI) <= 2, {cbk, yI, yB});
  // 종목(#/stocks) — 묶음 넷의 곳 수 = 판 읽기 · 「근거 강화」를 누르면 그 묶음만
  await pressArea(page, press, 'stocks'); await page.waitForSelector('.sk-page .sk-row'); await page.waitForTimeout(250);
  const B = lens.buckets, segN = () => page.evaluate(() => [...document.querySelectorAll('.sk-seg .sk-b')].map(b => [b.dataset.b, b.querySelector('small')?.textContent.trim(), b.getAttribute('aria-pressed')]));
  const sg0 = await segN();
  check(`${label} 개편 · 종목 묶음 넷: ${sg0.map(x => x.join(':')).join(' · ')} = 판 읽기(새로 발견 ${B.new}곳 · 근거 강화 ${B.up}곳 · 근거 약화 ${B.down}곳 · 전체 ${B.all}곳)`, sg0.map(x => `${x[0]}${x[1]}`).join() === [`new${B.new}곳`, `up${B.up}곳`, `down${B.down}곳`, `all${B.all}곳`].join(), sg0);
  if (B.up) { await press(page.locator('.sk-seg .sk-b[data-b="up"]')); await page.waitForTimeout(200);
    const ups = await page.evaluate(() => [...document.querySelectorAll('.sk-list .sk-row')].map(li => li.dataset.bucket));
    check(`${label} 개편 · 「근거 강화」 누름 → ${ups.length}줄 모두 근거 강화(판 읽기 ${B.up}곳 · 한 번에 30줄까지)`, ups.length === Math.min(30, B.up) && ups.every(x => x === 'up'), {n: ups.length}); }
  // 찾기 0곳 → 다른 길(「글자 지우기」 · 지시서 0-E)
  await page.locator('.sk-page .fd-in').fill('없는회사이름'); await page.waitForTimeout(200);
  const z0 = await page.evaluate(() => ({clear: !!document.querySelector('.sk-page .sk-clear'), msg: document.querySelector('.sk-page .fd-msg')?.textContent.trim()}));
  if (z0.clear) { await press(page.locator('.sk-page .sk-clear')); await page.waitForTimeout(200); }
  const z1 = await page.evaluate(() => ({v: document.querySelector('.sk-page .fd-in')?.value, rows: document.querySelectorAll('.sk-list .sk-row').length}));
  check(`${label} 찾기 0곳 → 「글자 지우기」 단추(${z0.clear ? '있음' : '없음'}) → 글 칸 비움 · 목록 ${z1.rows}줄`, z0.clear && z1.v === '' && z1.rows > 0, {z0, z1});
  // 검증(#/check) — 고정 기록 수 · 평가 대기 칸 = 판 읽기(기록마다 목록 셋 + 비교 기준 × 5 · 10 · 20거래일)
  await press(page.locator('.bottom-link[data-route="check"]')); await page.waitForSelector('.ck-page [data-first="1"]'); await page.waitForTimeout(250);
  const ck = await page.evaluate(() => ({lead: document.querySelector('.ck-page [data-first="1"]')?.innerText.replace(/\s+/g, ' ') ?? '', wait: document.querySelectorAll('.ck-wait').length, done: document.querySelectorAll('.ck-done').length, recs: document.querySelectorAll('.ck-rec').length}));
  const evs = lens.verify.records.flatMap(r => [...Object.values(r.evals).flat(), ...Object.values(r.baseline ?? {}).flat()]), pendW = evs.filter(e => e.status === 'pending').length, doneW = evs.filter(e => e.status === 'done').length; // 비교 기준 줄 — 출목표 · 매수 검토 후보(2026-10-09) 둘
  check(`${label} 개편 · 검증: 고정 기록 ${ck.recs}장 · 평가 대기 칸 ${ck.wait}개 · 평가 끝 칸 ${ck.done}개 = 판 읽기(대기 ${pendW} · 끝 ${doneW}) · ${doneW ? '결과 있음' : '「검증 전」'}`, ck.recs === lens.verify.records.length && ck.wait === pendW && ck.done === doneW && (doneW || ck.lead.includes('검증 전')), ck);
  // 일정 사건 카드 — 다가오는 것 12장까지 · 지난 것 8장까지(판 읽기 일정표)
  await pressArea(page, press, 'agenda'); await page.waitForSelector('.a-page'); await page.waitForTimeout(250);
  const ev = await page.evaluate(() => document.querySelectorAll('.ev-card').length), upW = (lens.events ?? []).filter(e => e.date >= lens.asOf).length, pastW = (lens.events ?? []).filter(e => e.date < lens.asOf).length;
  check(`${label} 개편 · 일정 사건 카드 ${ev}장 = 다가오는 것 ${Math.min(12, upW)} + 지난 것 ${Math.min(8, pastW)}`, ev === Math.min(12, upW) + Math.min(8, pastW), {ev, upW, pastW});
  // 종목 상세 ① ~ ⑦ 차례(지시서 11 — ⑥ 실적 · 재무 · 가치평가) · 관심 등록(이 기기) → 바로 「저장했습니다」 → 관심종목 화면 · 다시 열어도 남음 · 빼기
  const code = lens.stocks.find(x => x.bucket === 'new' && x.status === 'ok')?.code ?? board.companies[0].code;
  await page.goto(base + '/#/stock/' + code, {waitUntil: 'networkidle'}); await page.waitForSelector('.c-chart svg.lc'); await page.waitForTimeout(250);
  const cd = await page.evaluate(() => ({order: [...document.querySelectorAll('.c-page [data-order]')].map(x => x.dataset.order).join(), status: document.querySelector('.c-status')?.textContent.trim() ?? '', head: !!document.querySelector('.c-page .b-head .b-price'), fund: document.querySelector('.c-page [data-order="6"]')?.innerText.replace(/\s+/g, ' ') ?? ''}));
  check(`${label} 개편 · 종목 상세(${code}): ① 지금 종가 · 자료 상태(「${cd.status.slice(0, 40)}」) → ② ~ ⑦ 차례 ${cd.order} · ⑥ 실적 · 재무 · 가치평가(ROE · 가치평가 자료 없음 — 지어내지 않음)`, cd.head && cd.status.startsWith('자료 상태:') && cd.order === '2,3,4,5,6,7' && cd.fund.includes('실적 · 재무 · 가치평가') && cd.fund.includes('ROE') && cd.fund.includes('조건부 가치(주가 = EPS × PER)를 계산하지 않음'), cd);
  await page.evaluate(() => { try { for (const k of Object.keys(localStorage)) if (/watch$/.test(k)) localStorage.removeItem(k); } catch {} });
  await page.goto(base + '/#/stock/' + code, {waitUntil: 'networkidle'}); await page.waitForSelector('.wl-d'); await page.waitForTimeout(200);
  await page.locator('.wl-d > summary').click(); await page.locator('#wl-r').fill('검사 등록 이유'); await page.locator('#wl-c').fill('검사 반대 근거'); await page.locator('.wl-form button[type="submit"]').click(); await page.waitForTimeout(200);
  const wb = await page.evaluate(() => ({h: document.querySelector('.wl-box h2')?.textContent.trim() ?? '', say: document.querySelector('.wl-box .wl-say')?.textContent.trim() ?? null}));
  await press(page.locator('.bottom-link[data-route="watch"]')); await page.waitForSelector('.wl-page'); await page.waitForTimeout(200);
  const w1 = await page.evaluate(() => [...document.querySelectorAll('.wl-row')].map(li => [li.dataset.code, li.querySelector('dd')?.textContent.trim()]));
  await page.reload({waitUntil: 'networkidle'}); await page.waitForSelector('.wl-page'); await page.waitForTimeout(200);
  const w2 = await page.evaluate(() => ({rows: [...document.querySelectorAll('.wl-row')].map(li => li.dataset.code), art: document.querySelector('.wl-page section[data-art]')?.dataset.art, lead: document.querySelector('.wl-page [data-first="1"]')?.innerText ?? ''}));
  await page.locator('.wl-row .b-link').first().click(); await page.waitForTimeout(200);
  const w3 = await page.evaluate(() => document.querySelectorAll('.wl-row').length);
  check(`${label} 개편 · 관심 등록(${code}) → 바로 「${wb.say}」 · 「${wb.h}」 · 관심종목 화면 줄 ${w1.length}개(이유 「${w1[0]?.[1]}」) · 다시 열어도 ${w2.rows.length}개 · 「이 기기에만 저장」 · 빼면 ${w3}개`, wb.h.startsWith('★ 관심 종목') && wb.say === '저장했습니다 · 이 기기에만' && w1.length === 1 && w1[0][0] === code && w1[0][1] === '검사 등록 이유' && w2.rows.join() === code && w2.lead.includes('이 기기에만 저장') && w2.art === 'watch' && w3 === 0, {wb, w1, w2, w3});
  // 옛 주소 #/find → #/stocks · 옛 아래 탭 화면은 그 탭 안(지도 → 업종 · 출목표 → 종목 · 기록 → 검증 · 처음 → 위 막대 안내)
  await page.goto(base + '/#/find', {waitUntil: 'networkidle'}); await page.waitForSelector('.sk-page .fd-in'); await page.waitForTimeout(200);
  const of = await page.evaluate(() => ({hash: location.hash, active: document.querySelector('.bottom-link.active')?.dataset.route}));
  const tabOf = async hh => { await page.goto(base + '/' + hh, {waitUntil: 'networkidle'}); await page.waitForTimeout(300); return page.evaluate(() => document.querySelector('.bottom-link.active')?.dataset.route ?? null); };
  const old = {map: await tabOf('#/map'), road: await tabOf('#/road'), log: await tabOf('#/log'), start: await tabOf('#/start'), flow: await tabOf('#/flow'), rot: await tabOf('#/flow/rotation'), hot: await tabOf('#/hot')};
  check(`${label} 개편 · 옛 주소 그대로: #/find → ${of.hash}(종목) · #/map → ${old.map} · #/hot → ${old.hot} · #/flow/rotation → ${old.rot}(업종) · #/flow → ${old.flow}(시장) · #/road → ${old.road} · #/log → ${old.log} · #/start → 위 막대 안내(아래 탭 ${old.start ?? '없음'})`, of.hash === '#/stocks' && of.active === 'market' && old.map === 'market' && old.hot === 'market' && old.rot === 'market' && old.flow === 'market' && old.road === 'market' && old.log === 'check' && old.start === null, {of, old});
  await wordsCheck(page, `${label} 개편 화면`);
}

async function scenario(label, viewport, {mobile = false} = {}) {
  const context = await browser.newContext({viewport, deviceScaleFactor: 1, isMobile: mobile, hasTouch: mobile, locale: 'ko-KR', timezoneId: 'Asia/Seoul'});
  const page = await context.newPage();
  const consoleErrors = [], failedRequests = [];
  page.on('console', m => { if (m.type() === 'error') consoleErrors.push(m.text()); });
  page.on('pageerror', e => consoleErrors.push('pageerror: ' + e.message));
  page.on('requestfailed', r => failedRequests.push(abortedOk(r)));
  page.on('response', r => { if (r.status() >= 400) failedRequests.push(r.status() + ' ' + r.url()); else gotOk.add(r.url()); });
  const shot = name => page.screenshot({path: path.join(dir, `${label}-${name}.png`), fullPage: false});
  await restructCheck(page, label, mobile, loc => (mobile ? loc.tap() : loc.click())); // 개편(2026-10-08 20:19 지시서) — 아래 탭 다섯 · 첫 화면 ① ~ ⑤ · 관심 저장 · 옛 주소

  // ① 처음 화면 = 36칸 판(2026-10-04 21:55 「자 이제 학습한것 이상으로 만들어」) — 업종 칸 · 「불장」 · 색 보기표 · 다음 불장 후보 · 칸을 누르면 업종 화면
  const N = board.companies.length, G = board.groups.length, HOT = board.hot?.items ?? [], NEXT = board.next?.items ?? [], H = `탭 「지도」(업종 ${G}칸)`, byCodeB0 = new Map(board.companies.map(c => [c.code, c]));
  // ①-0a 업종 순환(#/flow/rotation) — 2026-10-09 아래 탭 「업종」 안(「ATLAS 업데이트 실행 프롬프트」 4 · 옛 아래 탭 「돈 흐름」 · 2026-10-08 17:41 마카오 시각 「돈에 흐름과 불장을 분리한다 그리고 돈에 흐름에 관련된 종목들을 표기하라」)
  //   아래 탭 「업종」 → 「업종 순환」 · 그 탭 눌림 · 첫 칸 업종 순환 그림(section.rt[data-place]) · 불장 것(큰 흐름 장)은 없음
  //   늘어난 곳 · 줄어든 곳 1위~3위 업종마다 그 업종 회사 — 이름 · 지난 20거래일 변화 · 오른 순 · 누르면 회사 화면 · 업종 이름을 누르면 업종 화면(판 자료 · /story.json 으로 따로 셈)
  //   「불장」(#/hot)에는 업종 순환(그림 · 기사로 본 돈 이야기 · 결 · 업종 회사)이 없음
  {
    const st = await (await fetch(base + '/story.json')).json(), rot = st.rotation && !st.rotation.none && st.rotation.pair ? st.rotation : null;
    await page.goto(base + '/#/hot', {waitUntil: 'networkidle'}); await page.waitForSelector('.h-page .hs-seg'); await page.waitForTimeout(200);
    await pressArea(page, loc => (mobile ? loc.tap() : loc.click()), 'sectors'); await page.waitForSelector('.sx-page [data-first="5"]'); await page.waitForTimeout(200);
    const tR = page.locator('.sx-page .hs-b[data-seg="rotation"]'); if (mobile) await tR.tap(); else await tR.click(); await page.waitForSelector('.fl-page section.rt, .fl-page section[data-art]'); await page.waitForTimeout(300);
    const fl = await page.evaluate(() => ({hash: location.hash, active: document.querySelector('.bottom-link.active')?.dataset.route, label: document.querySelector('.ex-nav .ex-b[aria-current="page"]')?.textContent.trim() ?? null, exnav: !!document.querySelector('#main .ex-nav'), seg: document.querySelector('.fl-page .hs-b[aria-current="page"]')?.dataset.seg ?? null,
      order: [...document.querySelectorAll('.bottom-link')].map(a => a.dataset.route).join(), rot: !!document.querySelector('.fl-page > section.rt[data-place]'), first: document.querySelector('.fl-page > section')?.matches('section.rt') ?? false,
      hot: document.querySelectorAll('.fl-page .hf-card').length,
      groups: [...document.querySelectorAll('.fl-page .rc-g')].map(g => ({side: g.closest('.rc-side')?.dataset.side, rank: g.dataset.rank, id: g.dataset.group, href: g.querySelector('.rc-gl')?.getAttribute('href') ?? null, name: g.querySelector('.rc-gl')?.textContent.trim(), medal: g.querySelector('.rc-md')?.dataset.n,
        cos: [...g.querySelectorAll('.rc-a')].map(a => ({code: a.dataset.code, href: a.getAttribute('href'), name: a.querySelector('.rc-n')?.textContent.trim(), v: a.querySelector('.rc-v')?.textContent.trim()}))})),
      heads: [...document.querySelectorAll('.fl-page .rc-h')].map(x => x.textContent.trim()), key: document.querySelector('.fl-page .rc-k')?.textContent.trim() ?? null, honest: document.querySelector('.fl-page .rs-dates')?.textContent.includes('실제 투자금 유입액 아님') ?? false, sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth}));
    const byCodeF = new Map(board.companies.map(c => [c.code, c])), riseF = (a, b) => (Number.isFinite(b.change20) ? b.change20 : -Infinity) - (Number.isFinite(a.change20) ? a.change20 : -Infinity) || a.code.localeCompare(b.code);
    const wantF = rot ? ['in', 'out'].flatMap(side => rot[side].slice(0, 3).map((x, i) => ({side, rank: String(i + 1), x, cs: (board.groups.find(g => g.id === x.id)?.codes ?? []).map(c => byCodeF.get(c)).filter(Boolean).sort(riseF)}))) : [];
    const misF = wantF.map((w, k) => { const g = fl.groups[k]; return g && g.side === w.side && g.rank === w.rank && g.id === w.x.id && g.name === w.x.label && g.href === '#/i/' + w.x.id && g.medal === w.rank && g.cos.length === w.cs.length
      && w.cs.every((c, j) => g.cos[j].code === c.code && g.cos[j].href === '#/stock/' + c.code && g.cos[j].name === c.name && g.cos[j].v === (Number.isFinite(c.change20) ? pctText(c.change20) : '없음')) ? null : {k, want: [w.side, w.rank, w.x.label, w.cs.map(c => c.name)], got: g}; }).filter(Boolean);
    check(`${label} 업종 → 「업종 순환」(#/flow/rotation · 아래 탭 「${fl.active}」 눌림 · 들어간 보기라 위 줄(시장 · 업종 · 종목 · 일정) 없음 · 보기 「${fl.seg}」 · 탭 차례 ${fl.order}): 첫 칸 업종 순환 그림 · 불장 것 없음 · 늘어난 곳 · 줄어든 곳(시장 대비 시가총액 비중) 1위~3위 업종 ${fl.groups.length}칸 — 칸마다 그 업종 회사(${fl.groups.map(g => `${g.name} ${g.cos.length}곳`).join(' · ')}) = 판 자료 · 「실제 투자금 유입액 아님」 · 옆으로 넘치지 않음`,
      fl.hash === '#/flow/rotation' && fl.active === 'market' && !fl.exnav && fl.label === null && fl.seg === 'rotation' && fl.order === 'cand,watch,check,market' && (rot ? fl.rot && fl.first : true) && fl.hot === 0 && fl.groups.length === wantF.length && wantF.length === (rot ? Math.min(3, rot.in.length) + Math.min(3, rot.out.length) : 0) && !misF.length
        && (rot ? fl.heads.join() === '늘어난 곳,줄어든 곳' && fl.key === '회사 = 지난 20거래일 종가 변화 · 차례 = 20거래일 변화 순' : true) && fl.honest && fl.sw <= fl.cw, {...fl, groups: fl.groups.map(g => `${g.side}${g.rank} ${g.name}: ${g.cos.map(c => c.name + ' ' + c.v).join(', ')}`), mis: misF.slice(0, 2)});
    await wordsCheck(page, `${label} 업종 순환`);
    if (rot && fl.groups[0]?.cos[0]) { // 회사 이름을 누르면 그 회사 화면
      const a0 = page.locator('.fl-page .rc-a').first(); await a0.scrollIntoViewIfNeeded(); if (mobile) await a0.tap(); else await a0.click(); await page.waitForTimeout(400);
      const h0 = await page.evaluate(() => location.hash); check(`${label} 「업종 순환」: 첫 회사 「${fl.groups[0].cos[0].name}」을 누르면 회사 화면(${h0})`, h0 === fl.groups[0].cos[0].href, {h0});
    }
    await page.goto(base + '/#/hot', {waitUntil: 'networkidle'}); await page.waitForSelector('.h-page .hs-seg'); await page.waitForTimeout(200);
    const hs = await page.evaluate(() => ({rot: document.querySelectorAll('.h-page section.rt[data-place], .h-page .sy-news, .h-page .rt-end, .h-page .rc').length, art: document.querySelector('.h-page')?.firstElementChild?.dataset.art ?? null}));
    check(`${label} 업종 안 「불장」(#/hot): 업종 순환(그림 · 기사로 본 돈 이야기 · 결 · 업종 회사)은 없음 — 「업종 순환」으로 나눔 · 맨 위 그림 「${hs.art}」(불장 업종 막대)`, hs.rot === 0 && hs.art === 'home', hs);
  }
  // ①-0 탭 「불장」(#/ · 2026-10-05 10:24 「잡스라면 36가지」 13~15 · 20번) — 불장 업종만 · 같은 큰 갈래끼리 한 장 · 맨 위 스위치 셋
  {
    await page.goto(base + '/#/hot', {waitUntil: 'networkidle'}); await page.waitForSelector('.hf-row, .h-page .b-note'); await page.waitForTimeout(300);
    await shot('01-hot');
    const hr = await page.evaluate(() => ({title: document.querySelector('.b-title')?.innerText.replace(/\s+/g, ' ').trim(), sum: document.querySelector('.hf-sum')?.innerText.trim() ?? null,
      segs: [...document.querySelectorAll('.hs-seg .hs-b')].map(a => ({seg: a.dataset.seg, href: a.getAttribute('href'), cur: a.getAttribute('aria-current'), label: a.querySelector('.hs-l')?.textContent.trim(), n: a.querySelector('.hs-n')?.textContent.trim()})),
      cards: [...document.querySelectorAll('.hf-card')].map(c => ({fam: c.dataset.family, name: c.querySelector('.hf-name')?.textContent.trim(), n: c.querySelector('.hf-n')?.textContent.trim(), avg: c.querySelector('.hf-avg b')?.textContent.trim(), avgLab: c.querySelector('.hf-avg')?.textContent.replace(/\s+/g, ' ').trim(), rows: [...c.querySelectorAll('.hf-row')].map(a => ({id: a.dataset.group, href: a.getAttribute('href'), rank: a.querySelector('.hf-rank')?.textContent.trim(), name: a.querySelector('.hf-gname')?.textContent.trim(), chg: a.querySelector('.hf-chg')?.textContent.trim(), up: a.querySelector('.hf-up')?.textContent.trim(), sun: a.querySelector('.hf-sun .sun-n-t')?.textContent.trim() ?? null}))})),
      tiles: document.querySelectorAll('.t-tile').length, active: document.querySelector('.bottom-link.active')?.dataset.route, tabs: [...document.querySelectorAll('.bottom-link')].map(a => a.innerText.replace(/\s+/g, '').trim()),
      promise: document.querySelector('.b-promise-box summary')?.innerText.trim(), footPromise: document.querySelector('.b-foot .b-promise')?.innerText.trim(), mvx: document.querySelector('.hs-seg + .mvx')?.dataset.state ?? null, sw: document.documentElement.scrollWidth, iw: innerWidth}));
    check(`${label} 탭 「불장」: 저녁 7시 들고 남 칸이 스위치 바로 아래(${hr.mvx}) = 판`, hr.mvx === (!board.moves ? 'none' : board.moves.first ? 'first' : 'moves'), {mvx: hr.mvx});
    // 2026-10-05 15:24 「잡스가 … 36가지」 A6 — 기록이 없으면 한 줄(제목 · 설명) · 휴대폰 첫 화면을 두 줄 차지하지 않게
    if (!board.moves) { const mq = await page.evaluate(() => { const p = document.querySelector('.hs-seg + .mvx .mvx-h'); const lh = parseFloat(getComputedStyle(p).lineHeight) || parseFloat(getComputedStyle(p).fontSize) * 1.5; return {t: p?.innerText.replace(/\s+/g, ' ').trim(), h: p.getBoundingClientRect().height, lh}; });
      check(`${label} 탭 「불장」: 저녁 7시 들고 남(기록 없음) 「${mq.t}」 한 줄(${Math.round(mq.h)}px)`, mq.t === '저녁 7시 들고 남 아직 기록 없음 · 거래일 19:00마다 적음' && (viewport.width < 600 ? mq.h < mq.lh * 1.9 : true), mq); }
    const flowsW = familiesByRise(board.groups.filter(g => g.hot)), SIMN = board.similar?.items?.length ?? 0;
    check(`${label} 탭 「불장」: 제목 「${hr.title}」 · 옛 큰 흐름 한 줄 없음(논평이 대신 · 2026-10-07) · 아래 탭 다섯 ${hr.tabs.join('·')}(「업종」 눌림 — 2026-10-09 불장은 업종 탭 안) · 73칸 판은 여기 없음`, hr.title === `불장 업종 ${HOT.length}개` && hr.sum === null && hr.tabs.join() === '후보7,관심,검증,탐색' && hr.active === 'market' && hr.tiles === 0, {...hr, cards: undefined, segs: undefined});
    check(`${label} 업종 보기 바꾸기 넷(업종 진단 · 업종 순환 · 불장 · 지도) · 「불장」 고름(2026-10-09 업종 탭 안 · 예비 · 오름 상위는 「종목」으로)`, hr.segs.map(x => `${x.seg}|${x.href}|${x.label}|${x.n ?? ''}|${x.cur ?? ''}`).join() === ['sectors|#/sectors|업종 진단||', 'rotation|#/flow/rotation|업종 순환||', 'hot|#/hot|불장||page', 'map|#/map|지도||'].join(), hr.segs);
    const cardMisH = flowsW.map((f, k) => { const c = hr.cards[k]; return c && c.fam === f.fam.id && c.name === f.fam.label && c.n === `불장 업종 ${f.groups.length}개` && c.avg === (Number.isFinite(f.avg) ? p1(f.avg) : '없음') && c.avgLab === `평균 ${c.avg}` && c.rows.length === f.groups.length && f.groups.every((g, j) => { const r = c.rows[j], i = board.groups.indexOf(g); return r && r.id === g.id && r.href === '#/i/' + g.id && r.rank === `불장 ${i + 1}위` && r.name === g.label && r.chg === (Number.isFinite(g.change20) ? p1(g.change20) : '없음') && r.up === upWant(g) && r.sun === sunNT(g.codes); }) ? null : {k, f: f.fam.label, c}; }).filter(Boolean);
    check(`${label} 탭 「불장」: 큰 흐름 ${hr.cards.length}장 = 판의 불장 ${HOT.length}개를 큰 갈래로 묶은 것(갈래 차례 = 갈래 평균이 큰 순 · 장 머리에 「평균」 한 번 · 장 안은 오른 순) · 줄마다 「불장 n위」 · 이름 · 20거래일 평균 · 몇 곳 올랐나 · 태양 몇 곳(따로 센 값) · 누르면 그 업종 · 옆으로 넘치지 않음`, hr.cards.length === flowsW.length && hr.cards.reduce((t, c) => t + c.rows.length, 0) === HOT.length && !cardMisH.length && hr.sw <= hr.iw, {cardMisH: cardMisH.slice(0, 2), sw: hr.sw});
    check(`${label} 탭 「불장」: 접힌 칸 「ATLAS가 하지 않는 일」은 아래 탭 「처음」으로 옮김(${hr.promise ?? '없음'}) · 맨 아래 약속 한 줄 「${hr.footPromise}」`, hr.promise === undefined && hr.footPromise === '지난 기록과 근거만 씁니다 · 값의 앞날은 맞히지 않습니다 · 광고 · 유료 결제 없음', {promise: hr.promise, footPromise: hr.footPromise});
    await wordsCheck(page, `${label} 탭 「불장」`);
    if (HOT.length) {
      const g0 = flowsW[0].groups[0], rl = page.locator(`.hf-row[data-group="${g0.id}"]`); await rl.scrollIntoViewIfNeeded();
      if (mobile) await rl.tap(); else await rl.click();
      await page.waitForSelector(`article.i-page[data-group="${g0.id}"] .b-card`); await page.waitForTimeout(200);
      const ib = await page.evaluate(() => ({hash: location.hash, back: [document.querySelector('.c-back')?.getAttribute('href'), document.querySelector('.c-back')?.textContent.trim()], active: document.querySelector('.bottom-link.active')?.dataset.route}));
      check(`${label} 탭 「불장」 줄 「${g0.label}」 ${mobile ? '터치' : '누름'} → 업종 화면 · 되돌아가기 「${ib.back[1]}」 · 탭 「업종」 눌린 채로`, ib.hash === '#/i/' + g0.id && ib.back[0] === '#/hot' && ib.back[1] === '‹ 불장' && ib.active === 'market', ib);
    }
    // 2026-10-05 15:24 「잡스가 … 36가지」 B5 — 맨 아래 태양 보기표 한 줄 · 「출목표에서 태양 n곳 모아 보기 ›」 → 출목표 묶는 법 「태양」 맨 위
    if (SUNW.set.size) {
      await page.goto(base + '/#/hot', {waitUntil: 'networkidle'}); await page.waitForSelector('.h-page .hs-seg'); await page.waitForTimeout(200);
      const sk = await page.evaluate(() => { const k = document.querySelector('.h-page .sun-key'); return k ? {t: k.textContent.replace(/\s+/g, ' ').trim(), href: k.querySelector('a.sun-go')?.getAttribute('href'), sun: !!k.querySelector('svg.sun')} : null; });
      check(`${label} 탭 「불장」: 태양 보기표 「${sk?.t}」`, sk?.sun && sk.href === '#/road/sun' && sk.t === `= 태양(지난 20거래일 오른 회사 출목표의 공통 모양 ${SUNW.common.length}가지를 모두 가진 회사) 수 · 출목표에서 태양 ${SUNW.set.size}곳 모아 보기 ›`, sk);
      const lk = page.locator('.h-page .sun-key a.sun-go'); await lk.scrollIntoViewIfNeeded(); if (mobile) await lk.tap(); else await lk.click();
      await page.waitForSelector('.f-body[data-mode="sun"][data-ready] .f-tile'); await page.waitForTimeout(400);
      const sv = await page.evaluate(() => ({hash: location.hash, y: Math.round(scrollY), mode: document.querySelector('.f-body')?.dataset.mode, pressed: document.querySelector('.f-seg-b[aria-pressed="true"]')?.dataset.mode, n: document.querySelectorAll('.f-tile').length, active: document.querySelector('.bottom-link.active')?.dataset.route}));
      check(`${label} 「태양 모아 보기 ›」 ${mobile ? '터치' : '누름'} → 출목표 「태양」 맨 위(주소 #/road · 칸 ${sv.n}개 = 태양 ${SUNW.set.size}곳 · 아래 탭 「종목」 눌림)`, sv.hash === '#/road' && sv.y === 0 && sv.mode === 'sun' && sv.pressed === 'sun' && sv.n === SUNW.set.size && sv.active === 'market', sv);
      await page.evaluate(() => { for (const k of Object.keys(localStorage)) if (k.startsWith('atlas11:road')) localStorage.removeItem(k); }); // 아래 출목표 검사는 처음 들어온 사람처럼(고른 묶는 법 기억을 지움)
    }
  }
  // ① 탭 「업종」(#/map) = 옛 처음 화면의 73칸 판 — 업종 칸 · 「불장」 · 큰 갈래 단추 · 칸을 누르면 업종 화면
  await page.goto(base + '/#/map', {waitUntil: 'networkidle'}); await page.waitForSelector('.t-tile'); await page.waitForTimeout(400);
  await shot('01-map');
  const top = await page.evaluate(() => ({title: document.querySelector('.b-title')?.innerText.trim(), when: document.querySelector('.b-when')?.innerText.trim(), kinds: document.querySelector('.b-kinds')?.textContent.trim() ?? null, ncRows: document.querySelectorAll('.nc-row').length, promise: document.querySelector('.b-promise-box summary')?.innerText.trim(), footPromise: document.querySelector('.b-foot .b-promise')?.innerText.trim(), late: [...document.querySelectorAll('.b-late')].map(e => e.innerText.trim()), strip: document.querySelector('.mstrip')?.innerText.replace(/\s+/g, ' ').trim(),
    active: document.querySelector('.bottom-link.active')?.dataset.route, tabs: [...document.querySelectorAll('.bottom-link')].map(a => a.innerText.replace(/\s+/g, '').trim()),
    tiles: [...document.querySelectorAll('.t-grid > .t-tile')].map(a => ({id: a.dataset.group, href: a.getAttribute('href'), sign: [...a.classList].find(c => c.startsWith('s-'))?.slice(2) ?? null, bg: getComputedStyle(a).backgroundColor, rank: a.querySelector('.t-rank')?.textContent.trim() ?? null, fire: a.querySelector('.t-fire')?.textContent.trim() ?? null, name: a.querySelector('.t-name')?.textContent.trim(), chg: a.querySelector('.t-chg')?.textContent.trim(), dsign: a.querySelector('.t-chg')?.dataset.sign ?? 'flat', up: a.querySelector('.t-up')?.textContent.trim(), kids: a.children.length, sun: a.querySelector('.t-sun .sun-n-t')?.textContent.trim() ?? null})),
    legend: document.querySelectorAll('.t-legend, .t-sw').length,
    cards: document.querySelectorAll('.b-card').length, text52: /(?<!\d)52\s?(종목|곳)|업종 대표/.test(document.body.textContent)}));
  const kindsWant = board.kinds ? [`업종 ${G}개`, `우량주 ${board.kinds.quality ?? 0}곳`, `시대 트렌드 ${board.kinds.trend ?? 0}곳`, board.kinds.profit ? `흑자 ${board.kinds.profit}곳` : null, board.kinds.size ? `채움 ${board.kinds.size}곳` : null].filter(Boolean).join(' · ') : null;
  const fromM = mode(board.companies.map(c => c.cFrom)), toM = mode(board.companies.map(c => c.date));
  const upsG = board.groups.filter(g => Number.isFinite(g.change20) && g.change20 > 0).length;
  check(`${label} ${H}: 제목 「${top.title}」 = 판의 불장 ${HOT.length}개 · 결론 한 줄 「${top.when}」(업종 ${upsG}개 오름 · 가장 많은 회사의 기간) · 아래 탭 다섯 ${top.tabs.join('·')}(「업종」 눌림) · 회사 카드·22곳 줄 없음 · 옛 「52」 글 없음${board.kinds ? ` · 접힌 칸 「${top.kinds}」` : ''}`,
    top.title === `지도 업종 ${G}개` && top.when === `업종 ${G}개 가운데 ${upsG}개 오름 · ${N}곳 · 지난 20거래일 · ${kd(fromM)}부터 ${kd(toM)}까지` && top.tabs.join() === '후보7,관심,검증,탐색' && top.active === 'market' && top.cards === 0 && top.ncRows === 0 && !top.text52 && (!board.kinds || top.kinds === kindsWant), {...top, tiles: undefined, legend: undefined});
  const tileMis = board.groups.map((g, i) => { const t = top.tiles[i]; return t && t.id === g.id && t.href === '#/i/' + g.id && t.name === g.label && (g.hot ? t.fire === `불장 ${i + 1}위` && t.rank === null : t.rank === `${i + 1}위` && t.fire === null) && t.chg === (Number.isFinite(g.change20) ? p1(g.change20) : '없음') && t.up === upWant(g) && t.sign === signW(g.change20) && t.dsign === signW(g.change20) && t.kids === 4 && t.sun === sunNT(g.codes) ? null : {i, g: g.label, t}; }).filter(Boolean);
  check(`${label} ${H}: 업종 칸 ${top.tiles.length}개 = 판의 업종 ${G}개 · 칸마다 넷(「불장 n위」 또는 n위 · 이름 · 20거래일 평균 ▲▼ · 몇 곳 올랐나) · 첫 줄 태양 수(따로 센 값 · 없으면 비움) · 차례 · 오름/내림 선 · 누르면 갈 주소가 판과 같음`, top.tiles.length === G && !tileMis.length, {tileMis: tileMis.slice(0, 3)});
  const fires = top.tiles.map((t, i) => t.fire ? i : -1).filter(i => i >= 0);
  check(`${label} ${H}: 「불장」 칸 ${fires.length}개 = 판의 불장 ${HOT.length}개 · 1위부터 빈틈없이 · 판의 불장 목록과 같은 업종 · 모두 오른 업종 · 큰 순`, fires.length === HOT.length && fires.every((x, i) => x === i) && HOT.every((x, i) => top.tiles[i]?.id === x.id && x.change20 > 0 && (!i || HOT[i - 1].change20 >= x.change20)), {fires});
  // 칸 바탕은 한 색(세기 색 없음) · 색 보기표 없음(2026-10-05 잡스 개혁 — 설명표가 따로 필요하면 그림이 스스로 말하지 못한다는 신호 · 애플 WWDC17)
  const bgs = new Set(top.tiles.map(t => t.bg));
  check(`${label} ${H}: 칸 바탕 ${bgs.size}색(한 색) · 색 보기표 없음 · 오름 칸 ${top.tiles.filter(t => t.sign === 'up').length}개 · 내림 칸 ${top.tiles.filter(t => t.sign === 'down').length}개`, bgs.size === 1 && top.legend === 0, {bgs: [...bgs], legend: top.legend});
  check(`${label} ${H}: 맨 아래 약속 한 줄 「${top.footPromise}」`, top.footPromise === '지난 기록과 근거만 씁니다 · 값의 앞날은 맞히지 않습니다 · 광고 · 유료 결제 없음', {footPromise: top.footPromise});
  // (옛 · 2026-10-06 00:21 까지) 큰 갈래 단추 12개(.fm-b) — 지금은 지도 한 장 · 땅을 누르면 그 갈래 화면
  // 지도 한 장(2026-10-06 00:21 「잡스라면 … 개선하라」 · site/app/landmap.js) — 땅 = 큰 갈래(family.js 차례 · 넓이 = 업종 수) · 칸 = 업종(땅 안은 오른 순 · 오름/내림 색)
  //   · 이름이 잘리지 않음 · 땅끼리 겹치지 않음 · 누르는 자리 44px 넘음
  //   · 2026-10-06 07:03 「왜 3단 클릭 구조가 아니지?」 — 땅 = 그 갈래 화면 링크(#/map/f/<갈래>) · 세 번이면 회사(땅 → 업종 → 회사) · 되돌아가기는 거꾸로(회사 → 업종 → 갈래 → 지도)
  //     (옛 00:21 판: 땅을 누르면 73칸 거르기 · 「모두 보기」 — 뺌)
  {
    const ORDERW = [...FAMILIES, OTHER].map(f => f.id), byF = new Map();
    for (const g of board.groups) { const f = familyOf(g.label); if (!byF.has(f.id)) byF.set(f.id, {fam: f, groups: []}); byF.get(f.id).groups.push(g); }
    const landsW = [...byF.values()].sort((a, b) => ORDERW.indexOf(a.fam.id) - ORDERW.indexOf(b.fam.id)).map(x => { const gs = [...x.groups].sort(riseDesc), v = gs.map(g => g.change20).filter(Number.isFinite); return {id: x.fam.id, label: x.fam.label, gs, avg: v.length ? v.reduce((t, y) => t + y, 0) / v.length : null}; });
    const avgT = a => Number.isFinite(a) ? (a > 0 ? '+' : a < 0 ? '−' : '') + (Math.abs(a) * 100).toFixed(Math.abs(a) < 0.0005 ? 2 : 1) + '%' : '없음';
    const lm = await page.evaluate(() => { window.scrollTo(0, 0); const el = document.querySelector('.lm'), r0 = el.getBoundingClientRect();
      return {w: Math.round(r0.width), h: Math.round(r0.height), sw: document.documentElement.scrollWidth, iw: innerWidth, lands: [...el.querySelectorAll('.lm-n')].map(b => { const l = b.querySelector('.lm-lab'), r = b.getBoundingClientRect();
        return {id: b.dataset.family, n: +b.dataset.n, tag: b.tagName, href: b.getAttribute('href'), name: b.querySelector('.lm-name')?.textContent.replace(/​/g, ''), avg: b.querySelector('.lm-avg')?.textContent.trim(),
          cells: [...b.querySelectorAll('.lm-c')].map(c => c.dataset.group + '|' + ([...c.classList].find(k => k.startsWith('s-'))?.slice(2) ?? '')), x: r.left - r0.left, y: r.top - r0.top, w: r.width, h: r.height,
          clip: l.scrollWidth > l.clientWidth + 1 || [...l.children].some(c => c.offsetWidth > l.clientWidth), cellsH: b.querySelector('.lm-cells').getBoundingClientRect().height}; })}; });
    const landMis = landsW.map((L, k) => { const x = lm.lands[k]; return x && x.id === L.id && x.n === L.gs.length && x.name === L.label && x.avg === avgT(L.avg) && x.cells.join() === L.gs.map(g => g.id + '|' + signW(g.change20)).join() && x.tag === 'A' && x.href === '#/map/f/' + L.id && !x.clip && x.cellsH >= 16 ? null : {k, L: L.label, x: {...x, cells: x?.cells.slice(0, 3)}}; }).filter(Boolean);
    const nCells = lm.lands.reduce((t, x) => t + x.cells.length, 0);
    check(`${label} ${H}: 지도 한 장 — 땅 ${lm.lands.length}개 = 판의 큰 갈래 ${landsW.length}개(family.js 차례) · 땅마다 이름 · 갈래 평균 · 칸 = 그 갈래 업종(오른 순 · 오름/내림 색) · 칸 ${nCells}개 = 업종 ${G}개 · 이름 잘림 없음 · 땅마다 그 갈래 화면 링크`, lm.lands.length === landsW.length && !landMis.length && nCells === G, {landMis: landMis.slice(0, 3)});
    const area = lm.lands.reduce((t, x) => t + x.w * x.h, 0), ratioMis = lm.lands.filter(x => Math.abs((x.w * x.h) / area - x.n / G) > 0.05).map(x => `${x.id} ${((x.w * x.h) / area * 100).toFixed(1)}% · 업종 ${(x.n / G * 100).toFixed(1)}%`);
    const overlap = lm.lands.some((a, i) => lm.lands.some((b, j) => j > i && a.x < b.x + b.w - 1 && b.x < a.x + a.w - 1 && a.y < b.y + b.h - 1 && b.y < a.y + a.h - 1));
    check(`${label} ${H}: 지도 ${lm.w}×${lm.h}px · 땅 넓이 = 업종 수 비율(어긋남 ${ratioMis.length}개) · 땅끼리 겹침 없음 · 가장 좁은 땅 ${Math.round(Math.min(...lm.lands.map(x => Math.min(x.w, x.h))))}px(누르는 자리 44px 넘음) · 옆으로 넘치지 않음`, !ratioMis.length && !overlap && lm.lands.every(x => x.w >= 44 && x.h >= 44) && lm.sw <= lm.iw && lm.w > 0 && lm.h > 0, {ratioMis, overlap});
    // 세 번이면 회사: ① 땅 → 그 갈래 화면 ② 업종 칸 → 업종 화면 ③ 회사 → 회사 화면 · 되돌아가기 셋으로 다시 지도
    const press1 = async loc => { if (mobile) await loc.tap(); else await loc.click(); };
    const L1 = landsW[0];
    await press1(page.locator(`.lm-n[data-family="${L1.id}"]`)); await page.waitForSelector('.l-page .l-grid .t-tile'); await page.waitForTimeout(300);
    await shot('01b-land');
    const lp = await page.evaluate(() => { const tiles = [...document.querySelectorAll('.l-grid > .t-tile')];
      return {hash: location.hash, y: Math.round(scrollY), title: document.querySelector('.b-title')?.innerText.replace(/\s+/g, ' ').trim(), when: document.querySelector('.b-when')?.innerText.trim(), back: [document.querySelector('.c-back')?.getAttribute('href'), document.querySelector('.c-back')?.textContent.trim()], active: document.querySelector('.bottom-link.active')?.dataset.route,
        tiles: tiles.map(t => ({id: t.dataset.group, href: t.getAttribute('href'), name: t.querySelector('.t-name')?.textContent.trim(), band: !!t.querySelector('.t-band'), over: [...t.querySelectorAll('.t-top > *')].some(k => k.getBoundingClientRect().right > t.getBoundingClientRect().right - 1)})), sw: document.documentElement.scrollWidth, iw: innerWidth}; });
    const upN = L1.gs.filter(g => Number.isFinite(g.change20) && g.change20 > 0).length;
    check(`${label} 지도 땅 「${L1.label}」 ${mobile ? '터치' : '누름'}(한 번) → 갈래 화면 #/map/f/${L1.id} · 맨 위부터 · 제목 「${lp.title}」 · 「${lp.back[1]}」 · 탭 「지도」 눌린 채로 · 칸 ${lp.tiles.length}개 = 그 갈래 업종(오른 순 · 칸마다 지도 색 띠 · 누르면 그 업종) · 옆으로 넘치지 않음`,
      lp.hash === '#/map/f/' + L1.id && lp.y === 0 && lp.title === `${L1.label} 업종 ${L1.gs.length}개` && lp.when?.startsWith(`업종 ${L1.gs.length}개 가운데 ${upN}개 오름 · 갈래 평균 ${avgT(L1.avg)} · 지난 20거래일`) && lp.back[0] === '#/map' && lp.back[1] === '‹ 지도' && lp.active === 'market'
      && lp.tiles.map(t => t.id).join() === L1.gs.map(g => g.id).join() && lp.tiles.every((t, k) => t.href === '#/i/' + L1.gs[k].id && t.name === L1.gs[k].label && t.band && !t.over) && lp.sw <= lp.iw, {...lp, tiles: lp.tiles.slice(0, 3)});
    await wordsCheck(page, `${label} 갈래 화면 「${L1.label}」`);
    const g1 = L1.gs[0];
    await press1(page.locator(`.l-grid .t-tile[data-group="${g1.id}"]`)); await page.waitForSelector(`article.i-page[data-group="${g1.id}"] .b-card`); await page.waitForTimeout(300);
    const ip = await page.evaluate(() => ({hash: location.hash, title: document.querySelector('.b-title')?.innerText.trim(), back: [document.querySelector('.c-back')?.getAttribute('href'), document.querySelector('.c-back')?.textContent.trim()], active: document.querySelector('.bottom-link.active')?.dataset.route, co: document.querySelector('article.i-page a[href^="#/stock/"]')?.getAttribute('href')}));
    check(`${label} 갈래 화면 칸 「${g1.label}」 ${mobile ? '터치' : '누름'}(두 번) → 업종 화면 #/i/${g1.id} · 되돌아가기 「${ip.back[1]}」 = 그 갈래 · 탭 「지도」 눌린 채로`, ip.hash === '#/i/' + g1.id && ip.title === g1.label && ip.back[0] === '#/map/f/' + L1.id && ip.back[1] === '‹ ' + L1.label && ip.active === 'market' && !!ip.co, ip);
    await press1(page.locator(`article.i-page a[href="${ip.co}"]`).first()); await page.waitForSelector('.c-chart svg.lc'); await page.waitForTimeout(300);
    const cp = await page.evaluate(() => ({hash: location.hash, back: [document.querySelector('.c-back')?.getAttribute('href'), document.querySelector('.c-back')?.textContent.trim()], active: document.querySelector('.bottom-link.active')?.dataset.route}));
    check(`${label} 업종 화면 회사 ${mobile ? '터치' : '누름'}(세 번) → 회사 화면 ${cp.hash} · 되돌아가기 「${cp.back[1]}」 · 탭 「지도」 눌린 채로 — 지도에서 세 번이면 회사`, cp.hash === ip.co && cp.back[0] === '#/i/' + g1.id && cp.back[1] === '‹ ' + g1.label && cp.active === 'market', cp);
    const hashes = [];
    for (const want of [`article.i-page[data-group="${g1.id}"] .b-card`, '.l-page .l-grid .t-tile', '.lm-n']) { await press1(page.locator('.c-back').first()); await page.waitForSelector(want); await page.waitForTimeout(250); hashes.push(await page.evaluate(() => location.hash)); }
    check(`${label} 되돌아가기 세 번 → ${hashes.join(' → ')}(업종 → 갈래 → 지도)`, hashes.join() === ['#/i/' + g1.id, '#/map/f/' + L1.id, '#/map'].join(), hashes);
    // 2026-10-08 05:05 빈 날 막기 — 없는 갈래 주소도 그림 한 장(빈 하늘 · 알림 줄은 그림 이름표로)
    const unk = await page.evaluate(async () => { location.hash = '#/map/f/zzz'; await new Promise(r => setTimeout(r, 400)); const a = document.querySelector('.l-page section[data-art="land"]'); return {note: a?.querySelector('.ra-tag')?.textContent.trim(), quiet: JSON.parse(a?.querySelector('[data-check]')?.dataset.check ?? '{}').quiet, back: document.querySelector('.c-back')?.getAttribute('href')}; });
    check(`${label} 없는 갈래 주소 #/map/f/zzz → 빈 하늘 그림 「${unk.note}」 · 지도로 가는 길`, unk.note === '이 갈래는 지금 판에 없습니다' && unk.quiet === 'land' && unk.back === '#/map', unk);
    await page.evaluate(() => { location.hash = '#/map'; }); await page.waitForSelector('.lm-n'); await page.waitForTimeout(300);
  }
  check(`${label} ${H}: 늦은 종가 표시 ${top.late.length}줄 = 판의 늦은 회사 ${board.late.length}곳`, top.late.length === board.late.length && board.late.every((c, i) => top.late[i]?.startsWith(c.name + ': ' + kd(c.date))), top.late);
  check(`${label} ${H}: 시장 띠(코스피·코스닥 · 기준 날짜)`, manifest.market ? manifest.market.items.every(i => top.strip.includes(i.name)) && top.strip.includes(kd(manifest.market.items[0].date) + ' 15:30 KST 종가') : /시장 지수 없음/.test(top.strip), {strip: top.strip});
  // 맨 아래 접힌 상자 「지난 6개월 앞서 달린 곳」(2026-10-06 14:55 「해」 · lib/atlas11/lead6.mjs) — 처음엔 접힘 · 펼치면 판의 120거래일 위 20% 표시와 같음(검사기가 판에서 따로 고르고 줄 세움) · 지수 자리 한 줄 · 73칸 설명 줄(t-key)은 뺌(규칙 1)
  {
    const L = board.lead6, byC = new Map(board.companies.map(c => [c.code, c])), d120 = (a, b) => b.change120 - a.change120;
    const rowsW = board.groups.filter(g => g.lead6).sort(d120).map(g => ({g, cs: g.codes.map(c => byC.get(c)).filter(c => c?.lead6).sort(d120)})).filter(r => r.cs.length), nW = rowsW.reduce((t, r) => t + r.cs.length, 0);
    const before = await page.evaluate(() => ({open: document.querySelector('details.m6')?.open ?? null, tkey: [...document.querySelectorAll('.t-page > .t-key')].filter(p => !p.classList.contains('sun-key')).length}));
    const sumLoc = page.locator('details.m6 > summary'); await sumLoc.scrollIntoViewIfNeeded(); if (mobile) await sumLoc.tap(); else await sumLoc.click(); await page.waitForTimeout(250);
    const m6 = await page.evaluate(() => { const d = document.querySelector('details.m6'); return d ? {open: d.open, n: d.querySelector('.m6-n')?.textContent.trim(), ix: d.querySelector('.m6-ix')?.textContent.trim(), sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth,
      rows: [...d.querySelectorAll('.m6-list > li')].map(li => ({href: li.querySelector('.m6-g')?.getAttribute('href'), g: li.querySelector('.m6-g span')?.textContent.trim(), gchg: li.querySelector('.m6-g b')?.textContent.trim(), cs: [...li.querySelectorAll('.m6-cs a')].map(a => ({href: a.getAttribute('href'), t: a.textContent.trim()}))}))} : null; });
    const n2 = v => v.toLocaleString('ko-KR', {minimumFractionDigits: 2, maximumFractionDigits: 2}), ix = L?.index;
    const ixW = ix ? `${ix.name}: ${kd(ix.date)} 종가 ${n2(ix.close)}포인트 — 지난 ${ix.days}거래일 가운데 가장 높던 ${kd(ix.highDate)} ${n2(ix.high)}포인트${ix.gap < 0 ? `보다 ${(Math.abs(ix.gap) * 100).toFixed(1)}% 아래` : '와 같음'}` : null;
    const mis = rowsW.map((r, i) => { const x = m6?.rows[i]; return x && x.href === '#/i/' + r.g.id && x.g === r.g.label && x.gchg === p1(r.g.change120) && x.cs.length === r.cs.length && r.cs.every((c, k) => x.cs[k].href === '#/stock/' + c.code && x.cs[k].t === `${c.name} ${p1(c.change120)}`) ? null : {i, g: r.g.label, x}; }).filter(Boolean);
    check(`${label} ${H}: 맨 아래 접힌 상자 「지난 6개월 앞서 달린 곳」 — 처음엔 접힘 · 펼치면 업종 ${rowsW.length}개 · 회사 ${nW}곳(판의 120거래일 위 20% 표시에서 따로 고른 값 · 120거래일 변화 순 · 누르면 그 업종 · 그 회사) · 지수 자리 「${m6?.ix}」 · 옆으로 넘치지 않음 · 73칸 설명 줄 뺌`,
      Boolean(L) && before.open === false && before.tkey === 0 && m6?.open === true && m6.n === `업종 ${rowsW.length}개 · 회사 ${nW}곳` && m6.rows.length === rowsW.length && !mis.length && (ixW ? m6.ix === ixW : Boolean(m6.ix?.startsWith('지수 자리:'))) && m6.sw <= m6.cw, {before, n: m6?.n, ixW, mis: mis.slice(0, 2)});
    if (mobile) await sumLoc.tap(); else await sumLoc.click(); await page.waitForTimeout(150); // 접어 둔 채로 다음 검사(처음 들어온 사람과 같게)
  }
  await wordsCheck(page, `${label} ${H}`);
  // 칸 누르기(휴대폰은 터치) — 셋째 불장 칸 → 그 업종 화면
  const hg = HOT[2] ?? board.groups[0];
  const tileLoc = page.locator(`.t-tile[data-group="${hg.id}"]`); await tileLoc.scrollIntoViewIfNeeded();
  if (mobile) await tileLoc.tap(); else await tileLoc.click();
  await page.waitForSelector(`article.i-page[data-group="${hg.id}"] .b-card`); await page.waitForTimeout(300);
  await shot('02-industry');
  const ij = await page.evaluate(() => ({hash: location.hash, title: document.querySelector('.b-title')?.innerText.trim()}));
  check(`${label} ${H}: 「${hg.label}」 칸 ${mobile ? '터치' : '누름'} → 업종 화면 #/i/${hg.id}(제목 「${ij.title}」)`, ij.hash === '#/i/' + hg.id && ij.title === hg.label, ij);

  // ①-2 업종 화면 모두(업종 ${G}장) — 머리(판 읽기 20거래일 평균 · 값이 있는 곳 · 오른 곳) · 평균 펼치기 줄(2026-10-09 「ATLAS 업데이트 실행 프롬프트」 6 — 옛 「누가 끌었나」 막대를 대신) · 카드(합쳐서 판 곳 수) · 앞날 말 · 화면 폭
  //   펼치기 줄 = 판 읽기(lens.json) 그 업종 종목 — 값이 있는 곳은 수익률 큰 차례(같으면 기호) · 값이 없는 곳(지연 · 오래된 종가 · 기업행사 확인)은 맨 뒤 빗금 · 줄마다 회사 화면 링크
  //   판 읽기에 값이 있는 종목이 0곳인 업종은 빈 축(판 값으로 채우지 않음) · 머리는 판 값
  const lensI = await get('data/atlas11/view/lens.json');
  const byCodeB = new Map(board.companies.map(c => [c.code, c])), KIND = {quality: '우량', trend: '트렌드', profit: '흑자', size: '채움'};
  const seen = new Map(), headMis = [], barMis = [], cardMis = [], agMis = [], wordsBad = [], overflow = [], briefMis = [], namesMis = []; let cardsTotal = 0, lensN = 0, quietN = 0;
  for (const [k, g] of board.groups.entries()) {
    await page.evaluate(id => { location.hash = '#/i/' + id; }, g.id);
    await page.waitForSelector(`article.i-page[data-group="${g.id}"] .b-card`); await page.waitForTimeout(40);
    const r = await page.evaluate(() => {
      const art = document.querySelector('article.i-page'), back = art.querySelector('.c-back'), fig = art.querySelector('section[data-art]');
      return {rank: art.querySelector('.i-rank')?.firstChild?.textContent.trim(), fire: art.querySelector('.i-rank .t-fire')?.textContent.trim() ?? null, title: art.querySelector('.b-title')?.textContent.trim(), chg: art.querySelector('.b-when .chg20')?.textContent.trim(), when: art.querySelector('.b-when')?.textContent.trim(), back: [back?.getAttribute('href'), back?.textContent.trim()],
        rows: [...art.querySelectorAll('.dc-row')].map(li => ({id: li.dataset.id, val: li.querySelector('.bc-val')?.textContent.trim(), ex: li.classList.contains('is-ex'), href: li.querySelector('a.bc-name')?.getAttribute('href') ?? null})),
        figKey: fig?.dataset.art ?? null, quiet: (() => { try { return JSON.parse(fig?.querySelector('[data-check]')?.dataset.check ?? '{}').quiet ?? null; } catch { return null; } })(),
        /* 화면 밖 카드는 그리기를 미루므로(content-visibility) innerText 대신 textContent */
        isun: art.querySelector('.i-rank .i-sun .sun-n-t')?.textContent.trim() ?? null,
        cards: [...art.querySelectorAll('.b-card')].map(c => ({code: c.dataset.code, sunTag: !!c.querySelector('.b-name-row svg.sun-tag'), name: c.querySelector('.b-name')?.textContent.trim(), c20: c.querySelector('.b-c20')?.textContent.trim(), moved: c.querySelectorAll('.road, .ag-box, .b-price, .b-kind').length, kids: c.children.length, href: c.querySelector('.b-name-row')?.getAttribute('href'), sp: (() => { const sp = c.querySelector('.spark'); return sp ? {n: +sp.dataset.points, lo: sp.dataset.lo, hi: sp.dataset.hi, side: ['up', 'down', 'flat'].find(k => sp.classList.contains(k)) ?? null, pts: sp.querySelector('.sp-line')?.getAttribute('points')?.trim().split(/\s+/).length ?? 0} : null; })(), fl: [...c.querySelectorAll('.fl .fl-val')].map(e => e.textContent.trim()), flMiss: c.querySelector('.fl-miss')?.textContent.trim() ?? null, nwT: c.querySelector('.nw-t')?.textContent.trim() ?? null, nwH: c.querySelector('.nw-h')?.textContent.trim() ?? null, nwMiss: c.querySelector('.nw-miss')?.textContent.trim() ?? null})),
        names: (() => { const d = art.querySelector('details.i-names'); return d ? {open: d.open, sum: d.querySelector('summary')?.textContent.trim(), src: art.querySelector('.i-src')?.textContent.trim() ?? null} : null; })(),
        scaleNote: [...art.querySelectorAll('.t-sub')].map(p => p.textContent.trim()).find(t => t.startsWith('선 그래프 눈금')) ?? null, orderNote: [...art.querySelectorAll('.t-h2 small')].map(x => x.textContent.trim()).find(t => t.includes("순 ·")) ?? null, how: art.querySelectorAll('.b-how').length,
        sw: document.documentElement.scrollWidth, iw: innerWidth};
    });
    // 판 읽기로 따로 셈(화면 코드를 부르지 않음)
    const scL = (lensI.sectors ?? []).find(x => x.id === g.id) ?? null, byL = new Map(lensI.stocks.map(x => [x.code, x])), mine = lensI.stocks.filter(x => x.g === g.id), inSc = scL ? scL.codes.map(c => byL.get(c)).filter(Boolean) : [];
    const okL = mine.filter(x => Number.isFinite(x.r20)).sort((a, b) => b.r20 - a.r20 || a.code.localeCompare(b.code)), badL = inSc.filter(x => !Number.isFinite(x.r20)); // 값 없는 줄은 그 업종 종목 차례(판 읽기 sectors.codes)
    const inLens = !!scL, useLens = inLens && okL.length > 0, meanL = okL.length ? okL.reduce((t, x) => t + x.r20, 0) / okL.length : null;
    if (inLens && inSc.map(x => x.code).sort().join() !== mine.map(x => x.code).sort().join()) headMis.push({g: g.label, lensSet: '판 읽기 업종 종목(sectors.codes)과 종목의 업종(stocks.g)이 다름'});
    if (useLens) lensN++; else if (inLens) quietN++;
    const chgW = useLens ? fpW(meanL) : (Number.isFinite(g.change20) ? p1(g.change20) : '없음');
    const whenOk = useLens ? r.when === `최근 20거래일 평균 ${fpW(meanL)} · 값이 있는 ${okL.length}곳 / 선정 ${mine.length}곳 · 오른 곳 ${okL.filter(x => x.r20 > 0).length}곳` : r.when.endsWith(` · ${upWant(g)}`);
    if (!(r.title === g.label && r.rank === `업종 ${G}개 가운데 ${k + 1}위` && (r.fire === '불장') === Boolean(g.hot) && r.chg === chgW && whenOk && r.back[0] === '#/map' && r.back[1] === '‹ 지도' && r.orderNote?.startsWith('· 지난 20거래일 많이 오른 순 ·') && r.isun === sunNT(g.codes))) headMis.push({g: g.label, useLens, r: {...r, rows: undefined, cards: undefined}});
    const rowsW = useLens ? [...okL.map(x => ({id: x.code, val: fpW(x.r20), ex: false, href: '#/stock/' + encodeURIComponent(x.code)})), ...badL.map(x => ({id: x.code, val: '값 없음', ex: true, href: '#/stock/' + encodeURIComponent(x.code)}))] : [];
    if (JSON.stringify(r.rows) !== JSON.stringify(rowsW) || (useLens ? r.figKey !== 'industry' : inLens ? r.quiet !== 'industry' : false)) barMis.push({g: g.label, useLens, rows: r.rows.slice(0, 3), want: rowsW.slice(0, 3), figKey: r.figKey, quiet: r.quiet});
    const cs = g.codes.map(code => byCodeB.get(code)).sort(riseDesc), csCodes = cs.map(c => c.code).join(); // 카드 = 판(오른 순 · 2026-10-05 11:36)
    if (r.cards.map(c => c.code).join() !== csCodes) cardMis.push({g: g.label, order: r.cards.map(c => c.code)});
    for (const hc of r.cards) {
      cardsTotal++; seen.set(hc.code, (seen.get(hc.code) ?? 0) + 1);
      const c = byCodeB.get(hc.code);
      // 카드 하나에 넷(이름·변화 줄 · 선 그래프 · 수급·기사 칸) — 값 줄 · 출목표 · 일정·공시 · 종류 표시는 회사 화면으로 옮김(2026-10-05 잡스 개혁)
      if (!c || hc.name !== c.name || hc.c20 !== (Number.isFinite(c.change20) ? p1(c.change20) : '없음') || hc.moved !== 0 || hc.kids !== 3 || hc.href !== '#/stock/' + c.code || hc.sunTag !== SUNW.set.has(c.code)) cardMis.push({g: g.label, code: hc.code, hc: {c20: hc.c20, moved: hc.moved, kids: hc.kids}});
      if (c) { const bm = briefMisW(hc, c, scaleW(cs)); if (bm.length) briefMis.push({g: g.label, code: hc.code, bad: bm}); }
    }
    if (r.how) agMis.push(g.label);
    if (!(r.names && !r.names.open && r.names.sum === '업종 이름 출처' && (g.from && g.to ? r.names.src === `${kd(g.from)}부터 ${kd(g.to)} 15:30 종가까지 · 업종 차례는 판 값(종목마다 자기 마지막 21개 종가)` : r.names.src === null))) namesMis.push({g: g.label, names: r.names}); // A4 업종 이름 출처는 접힘 · 기간 한 줄만
    if (!r.scaleNote?.startsWith(scaleTextW(scaleW(cs)))) briefMis.push({g: g.label, scaleNote: r.scaleNote});
    if (r.sw > r.iw) overflow.push({g: g.label, sw: r.sw, iw: r.iw});
    const t = await textsOf(page), bad = (t.ours.match(new RegExp(PREDICTION_WORDS.source, 'g')) ?? []).concat(t.ours.match(new RegExp(OUR_FORBIDDEN.source, 'g')) ?? [], t.idents.filter(x => PREDICTION_WORDS.test(x)));
    if (bad.length || t.marks) wordsBad.push({g: g.label, bad: bad.slice(0, 3), marks: t.marks});
  }
  check(`${label} 업종 화면 ${G}장 모두: 제목·「업종 ${G}개 가운데 n위」·「불장」 표시·태양 수·최근 20거래일 평균(판 읽기 ${lensN}장 · 판 값 ${G - lensN}장)·값이 있는 곳 · 오른 곳·「‹ 지도」(들어온 보기) = 따로 셈 · 카드 머리 「지난 20거래일 많이 오른 순」`, !headMis.length, {headMis: headMis.slice(0, 2)});
  check(`${label} 업종 화면 ${G}장 모두: 평균 펼치기 줄 = 판 읽기 그 업종 종목(수익률 큰 차례 · 값 없는 곳 맨 뒤 빗금 · 줄마다 회사 화면 링크) · 값이 있는 종목 0곳 업종 ${quietN}장은 빈 축(판 값으로 채우지 않음)`, !barMis.length, {barMis: barMis.slice(0, 2)});
  check(`${label} 업종 화면 ${G}장 모두: 카드 합 ${cardsTotal}장 · 서로 다른 회사 ${seen.size}곳 = 판 ${N}곳(겹침 없음) · 업종마다 판의 차례 · 카드 하나에 넷(이름·20거래일 변화 · 선 그래프 · 수급 · 기사 — 값 줄·출목표·일정은 회사 화면) · 태양 회사만 이름 곁 해 · 회사 화면 링크가 판과 같음`, cardsTotal === N && seen.size === N && [...seen.values()].every(v => v === 1) && !cardMis.length, {cardMis: cardMis.slice(0, 5)});
  check(`${label} 업종 화면 ${G}장 모두: 읽는 법 접힌 칸 없음(카드에 출목표·별이 없으므로)`, !agMis.length, {agMis: agMis.slice(0, 5)});
  check(`${label} 업종 화면 ${G}장 모두: 업종 이름 출처(한국거래소 · 네이버 증권)는 접힘 「업종 이름 출처」 · 머리에는 기간 한 줄만(「잡스가 … 36가지」 A4)`, !namesMis.length, {namesMis: namesMis.slice(0, 3)});
  check(`${label} 업종 화면 ${G}장 모두: 카드마다 선 그래프(종가 ${board.companies[0].c.length}개 · 5곳 같은 눈금 · 오름/내림 색) · 수급(외국인·기관 5거래일 합) · 회사 이름이 든 최근 기사(시각·언론사·제목) = 판(없으면 「아직 모으지 않음」)`, !briefMis.length, {briefMis: briefMis.slice(0, 4)});
  check(`${label} 업종 화면 ${G}장 모두: 앞날 말·쓰지 않는 말 없음 · 예측 표시 0`, !wordsBad.length, {wordsBad: wordsBad.slice(0, 3)});
  check(`${label} 업종 화면 ${G}장 모두: 화면이 옆으로 넘치지 않음(폭 ${viewport.width}px)`, !overflow.length, {overflow: overflow.slice(0, 3)});
  // 업종 화면에서 회사 이름 → 회사 화면 → 「‹ 업종」 → 그 업종 화면
  await page.evaluate(id => { location.hash = '#/i/' + id; }, hg.id); await page.waitForSelector(`article.i-page[data-group="${hg.id}"] .b-card`); await page.waitForTimeout(200);
  const pickCode = hg.codes?.[1] ?? board.groups.find(g => g.id === hg.id).codes[1], pick = byCodeB.get(pickCode);
  const link = page.locator(`.b-card[data-code="${pickCode}"] .b-name-row`); await link.scrollIntoViewIfNeeded();
  if (mobile) await link.tap(); else await link.click();
  await page.waitForSelector('.c-chart svg.lc'); await page.waitForTimeout(300);
  const cb = await page.evaluate(() => ({hash: location.hash, title: document.querySelector('.b-title')?.innerText.trim(), back: [document.querySelector('.c-back')?.getAttribute('href'), document.querySelector('.c-back')?.textContent.trim()]}));
  check(`${label} 업종 「${hg.label}」 → ${mobile ? '터치' : '누름'} → 회사 화면 #/stock/${pickCode}(「${cb.title}」) · 되돌아가기 「${cb.back[1]}」 = 그 업종`, cb.hash === '#/stock/' + pickCode && cb.title === pick.name && cb.back[0] === '#/i/' + hg.id && cb.back[1] === '‹ ' + hg.label, cb);
  const backLoc = page.locator('.c-back'); if (mobile) await backLoc.tap(); else await backLoc.click();
  await page.waitForSelector(`article.i-page[data-group="${hg.id}"]`); await page.waitForTimeout(150);
  check(`${label} 회사 화면 「‹ ${hg.label}」 ${mobile ? '터치' : '누름'} → 그 업종 화면으로 돌아옴`, (await page.evaluate(() => location.hash)) === '#/i/' + hg.id);
  // ①-3 탭 「오름 상위」(#/rise · 2026-10-05 05:07 「해」 — 처음 화면 아래에 있던 목록을 자기 탭으로) — 판과 같은 22곳 · 줄 → 회사 → 「‹ 불장 밖에서 많이 오른 N곳」 → 보던 자리
  {
    await pressArea(page, loc => (mobile ? loc.tap() : loc.click()), 'stocks'); await page.waitForSelector('.sk-page .hs-seg'); await page.waitForTimeout(150); // 2026-10-08 20:19 지시서 — 오름 상위 · 예비는 「종목」 안
    const t22 = page.locator('.hs-b[data-seg="rise"]'); if (mobile) await t22.tap(); else await t22.click();
    await page.waitForSelector('.r-page'); await page.waitForTimeout(300);
    await shot('02b-rise');
    const rr = await page.evaluate(() => ({hash: location.hash, title: document.querySelector('.b-title')?.innerText.trim(), when: document.querySelector('.b-head .ak-more .b-when')?.textContent.trim(), /* 2026-10-08 설명 줄은 「어떻게 셌나」에 접힘(규칙 33) — 접힌 글은 textContent */ active: document.querySelector('.bottom-link.active')?.dataset.route, seg: document.querySelector('.hs-b[aria-current="page"]')?.dataset.seg ?? null, moves: document.querySelector('.r-moves')?.innerText.trim() ?? null, mvx: document.querySelector('.hs-seg + section[data-art] + .mvx')?.dataset.state ?? null, /* 스위치 → 그림 한 장(규칙 33) → 저녁 7시 들고 남 */
      next: [...document.querySelectorAll('.nc-list .nc-row')].map(a => { const sp = a.querySelector('.spark'); return {href: a.getAttribute('href'), sun: !!a.querySelector('.nc-name svg.sun-tag'), name: a.querySelector('.nc-name')?.textContent.trim(), ind: a.querySelector('.nc-ind')?.textContent.trim(), chg: a.querySelector('.chg20')?.textContent.trim(), sp: sp ? {n: +sp.dataset.points, lo: sp.dataset.lo, hi: sp.dataset.hi} : null}; }),
      sw: document.documentElement.scrollWidth, iw: innerWidth}));
    const scN = scaleW(NEXT.map(x => byCodeB0.get(x.code)));
    check(`${label} 스위치 「오름 상위」 ${mobile ? '터치' : '누름'} → #/rise · 제목 「${rr.title}」 · 「${rr.when}」 · 탭 「불장」 눌림 · 스위치 「오름 상위」 고름`, rr.hash === '#/rise' && rr.title === `오름 상위 ${NEXT.length}곳` && rr.when === `불장 ${HOT.length}개 업종 밖 회사 ${NEXT.length}곳 — 지난 20거래일 동안 많이 오른 차례 · 한 업종 ${board.next?.perIndustry ?? 2}곳까지 · ${kd(fromM)}부터 ${kd(toM)} 15:30 종가까지` && rr.active === 'market' && rr.seg === 'rise', {...rr, next: undefined});
    check(`${label} 「오름 상위」: 줄 ${rr.next.length}개 = 판(${NEXT.length}곳) · 줄마다 이름·업종·작은 선 그래프(종가 ${board.companies[0].c.length}개 · ${NEXT.length}곳 같은 눈금)·20거래일 변화·회사 화면 링크 · 불장 업종 회사 없음 · 한 업종 ${board.next?.perIndustry ?? 2}곳까지 · 옆으로 넘치지 않음`, board.next && rr.next.length === NEXT.length && NEXT.every((x, i) => rr.next[i]?.href === '#/stock/' + x.code && rr.next[i]?.name === x.name && rr.next[i]?.ind === x.groupLabel && rr.next[i]?.chg === p1(x.change20) && rr.next[i]?.sp?.n === byCodeB0.get(x.code).c.length && rr.next[i]?.sp?.lo === scN.lo.toFixed(4) && rr.next[i]?.sp?.hi === scN.hi.toFixed(4) && rr.next[i]?.sun === SUNW.set.has(x.code)) && !NEXT.some(x => HOT.some(hh => hh.id === x.groupId)) && Object.values(NEXT.reduce((m, x) => (m[x.groupId] = (m[x.groupId] ?? 0) + 1, m), {})).every(v => v <= (board.next.perIndustry ?? 2)) && rr.sw <= rr.iw, {next: rr.next.slice(0, 3), sw: rr.sw});
    const mvState = !board.moves ? 'none' : board.moves.first ? 'first' : 'moves';
    check(`${label} 「오름 상위」: 저녁 7시 들고 남 칸이 스위치 · 그림 바로 아래(${rr.mvx}) = 판(${mvState}) · 옛 한 줄 없음`, rr.mvx === mvState && rr.moves === null, {mvx: rr.mvx, moves: rr.moves});
    await wordsCheck(page, `${label} 「오름 상위」`);
    if (NEXT.length) {
      const n0 = NEXT[Math.min(5, NEXT.length - 1)], row = page.locator(`.nc-row[href="#/stock/${n0.code}"]`); await toMid(row);
      const y0 = await page.evaluate(() => Math.round(scrollY));
      if (mobile) await row.tap(); else await row.click();
      await page.waitForSelector('.c-chart svg.lc'); await page.waitForTimeout(300);
      const nr = await page.evaluate(() => ({hash: location.hash, title: document.querySelector('.b-title')?.innerText.trim(), back: [document.querySelector('.c-back')?.getAttribute('href'), document.querySelector('.c-back')?.textContent.trim()], active: document.querySelector('.bottom-link.active')?.dataset.route}));
      check(`${label} 「오름 상위」 줄 「${n0.name}」 ${mobile ? '터치' : '누름'} → 회사 화면 · 되돌아가기 「${nr.back[1]}」 · 탭 「불장」 눌린 채로`, nr.hash === '#/stock/' + n0.code && nr.title === n0.name && nr.back[0] === '#/rise' && nr.back[1] === '‹ 오름 상위' && nr.active === 'market', nr);
      const bk = page.locator('.c-back'); if (mobile) await bk.tap(); else await bk.click();
      await page.waitForSelector('.r-page .nc-row'); await page.waitForTimeout(400);
      const rb = await page.evaluate(() => ({hash: location.hash, y: Math.round(scrollY)}));
      check(`${label} 회사 화면 「‹ 오름 상위」 → 오름 상위 · 보던 자리(${y0}px → ${rb.y}px)`, rb.hash === '#/rise' && Math.abs(rb.y - y0) <= 2, {y0, rb});
    }
  }
  // ①-4 탭 「예비」(#/similar · 2026-10-05 05:03 「불장에 공통된점을 찾아 아직 불징이 아닌 종목 7개를」 · 05:07 「해」) — 이 검사기가 판의 셈을 따로 다시 센다
  {
    const SIM = board.similar, ts = page.locator('.hs-b[data-seg="similar"]'); if (mobile) await ts.tap(); else await ts.click();
    await page.waitForSelector('.s-page'); await page.waitForTimeout(300);
    await shot('02c-similar');
    // 따로 센 공통점 후보 아홉(화면·판 코드와 따로 적음) — true / false / null(모름)
    const fin = v => typeof v === 'number' && Number.isFinite(v);
    const TW = {ups: c => c.c?.length >= 21 ? c.c.slice(1).filter((v, i) => v / c.c[i] - 1 > 0.001).length >= 10 : null, r5: c => c.c?.length >= 6 ? c.c.at(-1) > c.c.at(-6) : null, r20: c => fin(c.change20) ? c.change20 > 0 : null,
      fgn: c => fin(c.brief?.flows?.foreign) ? c.brief.flows.foreign > 0 : null, ins: c => fin(c.brief?.flows?.institution) ? c.brief.flows.institution > 0 : null, hold: c => c.brief?.flows?.holdPct ? c.brief.flows.holdPct.last > c.brief.flows.holdPct.first : null,
      y1: c => fin(c.info?.ret252) ? c.info.ret252 > 0 : null, top: c => fin(c.info?.pos52) ? c.info.pos52 >= 0.8 : null, news: c => c.brief && !c.brief.missing.includes('기사') && fin(c.brief.newsNamed) ? c.brief.newsNamed > 0 : null};
    const hotIds = new Set(HOT.map(x => x.id)), hotCs = board.companies.filter(c => hotIds.has(c.group?.id)), restCs = board.companies.filter(c => !hotIds.has(c.group?.id));
    const tal = (cs, f) => { const v = cs.map(f).filter(x => x !== null); return {yes: v.filter(Boolean).length, known: v.length}; }, rt = x => x.known ? x.yes / x.known : 0;
    const tw = Object.entries(TW).map(([id, f]) => { const h = tal(hotCs, f), r = tal(restCs, f); return {id, h, r, gap: rt(h) - rt(r)}; });
    let commonW = tw.filter(t => t.h.known && rt(t.h) > 0.5 && t.gap > 0.10); if (hotCs.length && commonW.length < 3) commonW = [...commonW, ...tw.filter(t => t.h.known && t.gap > 0 && !commonW.includes(t)).sort((a, b) => b.gap - a.gap).slice(0, 3 - commonW.length)];
    const cIds = Object.keys(TW).filter(id => commonW.some(t => t.id === id)), needW = Math.floor(cIds.length / 2) + 1;
    const scored = restCs.map(c => ({c, has: cIds.filter(id => TW[id](c) === true)})).filter(x => cIds.length && x.has.length >= needW).sort((a, b) => b.has.length - a.has.length || (fin(b.c.change20) ? b.c.change20 : -Infinity) - (fin(a.c.change20) ? a.c.change20 : -Infinity) || a.c.code.localeCompare(b.c.code));
    const per = new Map(), simW = []; for (const x of scored) { const g = x.c.group?.id ?? 'none'; if ((per.get(g) ?? 0) >= 2) continue; per.set(g, (per.get(g) ?? 0) + 1); simW.push(x); if (simW.length === 7) break; }
    check(`${label} 「예비」: 판의 닮은 ${SIM.items.length}곳 = 이 검사기가 따로 센 ${simW.length}곳(공통점 ${cIds.join('·')} · ${needW}가지 이상 · 한 업종 2곳 · 같으면 20거래일 많이 오른 차례)`, SIM.common.join() === cIds.join() && SIM.items.map(x => x.code).join() === simW.map(x => x.c.code).join() && SIM.items.every((x, i) => x.has.join() === simW[i].has.join()), {board: SIM.items.map(x => x.name), mine: simW.map(x => x.c.name), common: SIM.common, cIds});
    const sr = await page.evaluate(() => ({hash: location.hash, title: document.querySelector('.b-title')?.innerText.trim(), when: document.querySelector('.b-head .ak-more .b-when')?.textContent.trim(), /* 「어떻게 셌나」에 접힘(규칙 33) */ active: document.querySelector('.bottom-link.active')?.dataset.route, seg: document.querySelector('.hs-b[aria-current="page"]')?.dataset.seg ?? null,
      mvx: (() => { const b = document.querySelector('.hs-seg + section[data-art] + .mvx'); return b ? {state: b.dataset.state, head: b.querySelector('.mvx-h')?.innerText.replace(/\s+/g, ' ').trim(), rows: [...b.querySelectorAll('.mvx-row')].map(r => ({kind: r.dataset.kind, n: +r.dataset.n, who: r.querySelector('.mvx-who')?.textContent.trim()})), n22: b.querySelector('.mvx-22')?.textContent.trim() ?? null} : null; })(),
      rows: [...document.querySelectorAll('.sm-row')].map(a => { const sp = a.querySelector('.spark'); return {href: a.getAttribute('href'), sun: !!a.querySelector('.nc-name svg.sun-tag'), all: a.querySelector('.sm-all')?.textContent.trim() ?? null, name: a.querySelector('.nc-name')?.textContent.trim(), ind: a.querySelector('.nc-ind')?.textContent.trim(), chg: a.querySelector('.chg20')?.textContent.trim(), cnt: a.querySelector('.sm-cnt > b')?.textContent.trim(), chips: [...a.querySelectorAll('.sm-chip')].map(c => `${c.dataset.trait}:${c.classList.contains('on') ? 'on' : c.classList.contains('unk') ? 'unk' : 'off'}:${c.querySelector('.sm-ck')?.textContent}`), sp: sp ? {n: +sp.dataset.points, lo: sp.dataset.lo, hi: sp.dataset.hi} : null}; }),
      bars: [...document.querySelectorAll('.tr-row')].map(r => ({id: r.dataset.trait, w: [...r.querySelectorAll('.tr-fill')].map(f => parseFloat(f.style.width)), vals: [...r.querySelectorAll('.tr-val')].map(v => v.textContent.trim()), ns: [...r.querySelectorAll('.tr-n')].map(v => v.textContent.trim())})),
      sw: document.documentElement.scrollWidth, iw: innerWidth}));
    const commonT = SIM.common.map(id => SIM.traits.find(t => t.id === id));
    check(`${label} 스위치 「예비」 ${mobile ? '터치' : '누름'} → #/similar · 제목 「${sr.title}」 · 「${sr.when}」 · 탭 「불장」 눌림 · 스위치 「예비」 고름`, sr.hash === '#/similar' && sr.title === `예비 ${SIM.items.length}곳` && sr.when === `불장 닮은 ${SIM.items.length}곳 — 불장 ${HOT.length}개 업종 ${SIM.hotCompanies}곳의 공통점 ${SIM.common.length}가지를 많이 가진, 불장 밖 회사 · ${kd(toM)} 종가` && sr.active === 'market' && sr.seg === 'similar', {...sr, rows: undefined, bars: undefined, mvx: undefined});
    const scS = scaleW(SIM.items.map(x => byCodeB0.get(x.code)));
    const SIMS = [...SIM.items].sort(riseDesc); // 보이는 차례 = 지난 20거래일 많이 오른 순(2026-10-05 11:36 「모든 배치가 가장 많이 상승한순으로」) · 고르는 셈은 위에서 판 차례로 따로 맞댐
    const rowMis = SIMS.map((x, i) => { const r = sr.rows[i], full = x.matched === commonT.length && commonT.length; const chipsWant = full ? [] : commonT.map(t => `${t.id}:${x.has.includes(t.id) ? 'on:✓' : x.unknown.includes(t.id) ? 'unk:?' : 'off:·'}`); // 모두 가지면 「✓ 모두」 한마디(「잡스가 … 36가지」 D3)
      return r && r.href === '#/stock/' + x.code && r.name === x.name && r.ind === x.groupLabel && r.chg === p1(x.change20) && r.cnt === `공통점 ${commonT.length}가지 중 ${x.matched}가지` && r.chips.join() === chipsWant.join() && r.all === (full ? '✓ 모두' : null) && r.sun === SUNW.set.has(x.code) && r.sp?.n === byCodeB0.get(x.code).c.length && r.sp?.lo === scS.lo.toFixed(4) && r.sp?.hi === scS.hi.toFixed(4) ? null : {i, x: x.name, r}; }).filter(Boolean);
    check(`${label} 「예비」: 줄 ${sr.rows.length}개 = 판 · 지난 20거래일 많이 오른 차례 · 줄마다 이름 · 업종 · 20거래일 변화 · 「공통점 n가지 중 m가지」 · 공통점 표시(모두 가지면 「✓ 모두」 · 아니면 ✓ 가짐 · 「·」 안 가짐 · 「?」 모름 — 색만이 아님) · 태양 회사만 이름 곁 해 · 선 그래프(${SIM.items.length}곳 같은 눈금) · 옆으로 넘치지 않음`, sr.rows.length === SIM.items.length && !rowMis.length && sr.sw <= sr.iw, {rowMis: rowMis.slice(0, 2), sw: sr.sw});
    const pc = x => `${Math.round((x.known ? x.yes / x.known : 0) * 100)}%`;
    const barMisS = commonT.map((t, i) => { const b = sr.bars[i], w = x => Math.max(1, (x.known ? x.yes / x.known : 0) * 100); return b && b.id === t.id && Math.abs(b.w[0] - w(t.hot)) < 0.01 && Math.abs(b.w[1] - w(t.rest)) < 0.01 && b.vals.join() === `${pc(t.hot)},${pc(t.rest)}` && b.ns.join() === `${t.hot.yes}/${t.hot.known}곳,${t.rest.yes}/${t.rest.known}곳` ? null : {t: t.id, b}; }).filter(Boolean);
    check(`${label} 「예비」: 공통점 막대 ${sr.bars.length}줄 = 판의 공통점 ${commonT.length}가지 · 줄마다 불장 · 나머지 몇 %(막대 길이 = %)`, sr.bars.length === commonT.length && !barMisS.length, {barMisS: barMisS.slice(0, 2)});
    const mv = board.moves, names = xs => xs.length ? xs.map(x => x.label ?? (x.groupLabel ? `${x.name}(${x.groupLabel})` : x.name)).join(' · ') : '없음';
    const mvOk = !mv ? sr.mvx?.state === 'none' : mv.first ? sr.mvx?.state === 'first' && sr.mvx.head.includes(`${kd(mv.to)} 종가 · 처음 기록`)
      : sr.mvx?.state === 'moves' && sr.mvx.head.startsWith(`저녁 7시 들고 남 ${kd(mv.from)} 종가 → ${kd(mv.to)} 종가 · `) && [['hot-in', mv.hotIn], ['hot-out', mv.hotOut], ['became', mv.becameHot], ['sim-in', mv.similarIn], ['sim-out', mv.similarOut]].every(([k, xs], i) => sr.mvx.rows[i]?.kind === k && sr.mvx.rows[i]?.n === xs.length && sr.mvx.rows[i]?.who === names(xs)) && sr.mvx.n22 === `오름 상위: 새로 든 곳 ${mv.nextIn.length}곳 · 빠진 곳 ${mv.nextOut.length}곳`;
    check(`${label} 「예비」: 스위치 · 그림 아래 「저녁 7시 들고 남」 칸 = 판(${!mv ? '기록 없음' : mv.first ? '처음 기록' : `${mv.from} → ${mv.to}`})`, mvOk, sr.mvx);
    await wordsCheck(page, `${label} 「예비」`);
    if (SIM.items.length) {
      const s0 = SIM.items.at(-1), row = page.locator(`.sm-row[href="#/stock/${s0.code}"]`); await toMid(row);
      const y0 = await page.evaluate(() => Math.round(scrollY));
      if (mobile) await row.tap(); else await row.click();
      await page.waitForSelector('.c-chart svg.lc'); await page.waitForTimeout(300);
      const cr = await page.evaluate(() => ({hash: location.hash, title: document.querySelector('.b-title')?.innerText.trim(), back: [document.querySelector('.c-back')?.getAttribute('href'), document.querySelector('.c-back')?.textContent.trim()], active: document.querySelector('.bottom-link.active')?.dataset.route}));
      check(`${label} 「예비」 줄 「${s0.name}」 ${mobile ? '터치' : '누름'} → 회사 화면 · 되돌아가기 「${cr.back[1]}」 · 탭 「불장」 눌린 채로`, cr.hash === '#/stock/' + s0.code && cr.title === s0.name && cr.back[0] === '#/similar' && cr.back[1] === '‹ 예비' && cr.active === 'market', cr);
      const bk = page.locator('.c-back'); if (mobile) await bk.tap(); else await bk.click();
      await page.waitForSelector('.s-page .sm-row'); await page.waitForTimeout(400);
      const sb = await page.evaluate(() => ({hash: location.hash, y: Math.round(scrollY)}));
      check(`${label} 회사 화면 「‹ 예비」 → 예비 · 보던 자리(${y0}px → ${sb.y}px)`, sb.hash === '#/similar' && Math.abs(sb.y - y0) <= 2, {y0, sb});
    }
  }
  // 없는 업종 주소 → 알림 + 처음 화면으로 가는 길
  // 2026-10-08 05:05 빈 날 막기 — 없는 업종 주소도 그림 한 장(빈 하늘 · 알림 줄은 그림 이름표로)
  const prevHash = await page.evaluate(() => location.hash); // 들어온 화면(탭 화면) — 업종 화면 「‹ 되돌아가기」는 그리로(2026-10-08 20:19 지시서 · 탭 안 화면마다)
  await page.evaluate(() => { location.hash = '#/i/zzzzzzzz'; }); await page.waitForSelector('section[data-art="industry"] .ra-tag'); await page.waitForTimeout(100);
  const unk = await page.evaluate(() => ({note: document.querySelector('section[data-art="industry"] .ra-tag')?.textContent.trim(), quiet: JSON.parse(document.querySelector('section[data-art="industry"] [data-check]')?.dataset.check ?? '{}').quiet, back: document.querySelector('.c-back')?.getAttribute('href')}));
  check(`${label} 없는 업종 주소 #/i/zzzzzzzz → 빈 하늘 그림 「${unk.note}」 · 들어온 탭으로 가는 길(${unk.back})`, unk.note === '이 업종은 지금 판에 없습니다' && unk.quiet === 'industry' && unk.back === (['#/market', '#/sectors', '#/hot', '#/map', '#/road', '#/stocks', '#/flow/rotation', '#/flow', '#/similar', '#/rise', '#/agenda', '#/check', '#/log', '#/watch'].includes(prevHash) ? prevHash : '#/'), {...unk, prevHash});

  // ② 회사 화면 세 곳(처음 · 늦은 종가 회사가 있으면 그 회사 · 마지막)
  // 태양 회사 한 곳도 넣는다(2026-10-05 15:24 「잡스가 … 36가지」 B2 — 태양 점검 칸이 태양 · 태양 아님 둘 다 맞는지)
  const picks = [...new Set([board.companies[0], ...board.late.map(l => board.companies.find(c => c.code === l.code)), [...board.companies].sort(riseDesc).find(c => SUNW.set.has(c.code)), board.companies.at(-1)].filter(Boolean))];
  const lensC = await get('data/atlas11/view/lens.json'), WHY_C = {late: '지연(그날 종가 없음)', stale: '오래된 종가', ca: '기업행사 확인(가격 기준 바뀜)', missing: '값 없음'};
  for (const c of picks) {
    const s = await get('data/atlas11/view/stocks/' + c.code + '.json'), e = agenda.byCode[c.code];
    await page.goto(base + '/#/stock/' + c.code, {waitUntil: 'networkidle'}); await page.waitForSelector('.c-chart svg.lc'); await page.waitForTimeout(300);
    if (c === picks[0]) await shot('02-company');
    const r = await page.evaluate(() => ({title: document.querySelector('.b-title')?.innerText.trim(), fig: (() => { const a = document.querySelector('section[data-art="company"]'); return a ? {k: a.querySelector('.sy-k span')?.textContent.trim(), kw: a.querySelector('.sy-kw')?.textContent.trim(), lab: a.querySelector('.ra-lab')?.innerText.replace(/\s+/g, ' ').trim(), rows: [...a.querySelectorAll('.bc-row')].map(x => x.dataset.id)} : null; })(), band: document.querySelector('.c-chart .lc-band')?.dataset.from ?? null, near: [...document.querySelectorAll('.c-near .nc-row')].map(a => a.getAttribute('href').slice(8)), price: document.querySelector('.b-price.big .b-close')?.innerText.trim(), date: document.querySelector('.b-price.big .b-date')?.innerText.trim(), ticks: [...document.querySelectorAll('.c-chart .lc-tick')].map(t => t.textContent), path: document.querySelector('.c-chart .lc-line')?.getAttribute('d')?.split(/[ML]/).filter(Boolean).length ?? 0,
      info: [...document.querySelectorAll('.c-info dd')].map(d => d.textContent.trim()) /* 1년 숫자는 접힌 칸 안(2026-10-05 「잡스라면」 22·25번) — 접힌 칸 글은 innerText 가 빈 글이라 textContent 로 */, ev: document.querySelectorAll('.ag-ev .ag-li').length, ds: document.querySelectorAll('.ag-ds .ag-li').length, beads: document.querySelectorAll('.road .bead').length}));
    const wantTick = `${s.closes60.at(-1).date.slice(5, 7)}/${s.closes60.at(-1).date.slice(8, 10)}`;
    check(`${label} 회사 ${c.name}: 이름 · 종가 ${r.price} · 「${r.date}」 · 지난 ${s.closes60.length}거래일 선(점 ${r.path}) · 마지막 눈금 ${wantTick} · 1년 최고·최저 · 출목표 ${r.beads}개 · 일정 ${r.ev}·공시 ${r.ds}줄 = 일정표`,
      r.title === c.name && r.price === won(c.close) && r.date === `${kd(c.date)} 15:30 종가` && r.path === s.closes60.length && r.ticks.includes(wantTick) && r.info[0] === won(c.info.high52) && r.info[1] === won(c.info.low52) && r.beads === roadOf(c.c).cells.length && r.ev === e.upcoming.length && r.ds === e.disclosures.length, r);
    // 앞 화면과 이어 보이기(2026-10-05 잡스 개혁): 20거래일 변화 = 판 · 60거래일 그래프 안 20거래일 띠의 첫날 = 판의 첫날 · 같은 업종 4곳 = 판의 업종 차례
    const gq = board.groups.find(g => g.id === c.group?.id), nearWant = gq ? gq.codes.filter(x => x !== c.code).map(x => byCodeB.get(x)).sort(riseDesc).map(x => x.code) : [];
    // 그림 한 장 = 같은 업종 안 자리(2026-10-09 판 읽기 — 같은 20거래일 창 · 업종 평균은 값이 있는 곳만) · 이 검사기가 판 읽기로 따로 셈
    const meC = lensC.stocks.find(x => x.code === c.code), scC = meC?.g ? lensC.sectors.find(x => x.id === meC.g) : null, byLC = new Map(lensC.stocks.map(x => [x.code, x]));
    const msC = scC ? scC.codes.map(x => byLC.get(x)).filter(Boolean) : [], okC = msC.filter(x => Number.isFinite(x.r20)).sort((a, b) => b.r20 - a.r20 || a.code.localeCompare(b.code)), badC = msC.filter(x => !Number.isFinite(x.r20));
    const avgC = scC?.d20?.mean ?? null, meanC = okC.length ? okC.reduce((t, x) => t + x.r20, 0) / okC.length : null, rankC = meC && Number.isFinite(meC.r20) ? okC.findIndex(x => x.code === c.code) + 1 : 0;
    const figOk = meC && scC ? r.fig?.k === '업종 · 시장과 같은 기간 비교' && r.fig.kw === `${scC.label} ${msC.length}곳 · 최근 20거래일 · ${kd(lensC.asOf)} 종가` && r.fig.lab === `이 회사 ${Number.isFinite(meC.r20) ? fpW(meC.r20) : WHY_C[meC.status] ?? '값 없음'} · 업종 평균 ${fpW(avgC)}${rankC ? ` · 업종 ${okC.length}곳 중 ${rankC}위` : ''}`
        && r.fig.rows.join() === [...okC, ...badC].map(x => x.code).join() && Number.isFinite(avgC) === Number.isFinite(meanC) && (!Number.isFinite(avgC) || Math.abs(avgC - meanC) < 1e-3) /* 판 읽기 업종 평균은 소수 넷째 자리까지 적음 */
      : r.fig?.k === '지난 20거래일';
    check(`${label} 회사 ${c.name}: 그림 「${r.fig?.k}」 「${r.fig?.lab}」 = 판 읽기로 따로 센 값(업종 평균 = 값이 있는 ${okC.length}곳 평균 · 차례 = 수익률 큰 순 · 값 없는 곳 맨 뒤) · 그래프 띠 첫날 ${r.band} = ${c.cFrom} · 같은 업종 ${r.near.length}곳 = 판`, figOk && r.band === c.cFrom && r.near.join() === nearWant.join(), {fig: r.fig, want: meC ? {r20: meC.r20, status: meC.status, avgC, meanC, rankC, rows: [...okC, ...badC].map(x => x.code)} : null, band: r.band, near: r.near, nearWant});
    { const cs = await page.evaluate(() => { const x = document.querySelector('.c-sun'); return {title: !!document.querySelector('.b-title svg.sun-tag'), near: [...document.querySelectorAll('.c-near .nc-row')].map(a => `${a.getAttribute('href').slice(8)}:${!!a.querySelector('.nc-name svg.sun-tag')}`), box: x ? {on: x.dataset.sun, has: x.dataset.has, h: x.querySelector('.c-sun-h')?.textContent.trim(), sun: !!x.querySelector('.c-sun-h svg.sun'), li: [...x.querySelectorAll('.c-sun-list li')].map(li => `${li.dataset.shape}:${li.dataset.has}`), go: x.querySelector('.sun-go')?.getAttribute('href'), in: !!x.closest('.b-box')?.querySelector('.rd-box')} : null}; });
      const on = SUNW.set.has(c.code), hs = SUNW.has.get(c.code) ?? [], k = SUNW.common.length;
      check(`${label} 회사 ${c.name}: 태양 점검(출목표 칸 안) 「${cs.box?.h}」 · 모양 ${k}가지마다 ✓/· · 이름 곁 해 ${cs.title ? '있음' : '없음'} · 같은 업종 줄 해 = 따로 센 값`, !!cs.box && cs.box.in && cs.box.on === String(on) && cs.box.has === String(hs.length) && cs.box.sun === on
        && cs.box.h === (on ? `태양 — 오른 회사들의 공통 모양 ${k}가지를 모두 가짐` : `태양 아님 — 오른 회사들의 공통 모양 ${k}가지 가운데 ${hs.length}가지`) && cs.box.li.join() === SUNW.common.map(t => `${t.id}:${hs.includes(t.id)}`).join() && cs.box.go === '#/road/sun'
        && cs.title === on && cs.near.every(x => { const [code, v] = x.split(':'); return v === String(SUNW.set.has(code)); }), cs); }
    await page.locator('.c-ctx summary').click(); await page.waitForTimeout(150);
    const ctx = await page.evaluate(() => ({news: document.querySelectorAll('.c-ctx .c-news')[0]?.querySelectorAll('li').length ?? 0, flows: document.querySelectorAll('.c-ctx tbody tr').length}));
    check(`${label} 회사 ${c.name}: 수급·기사·공시 기록 열림 · 기사 ${ctx.news}건 = ${s.context?.news.length ?? 0} · 수급 ${ctx.flows}거래일 = ${s.context?.flows.length ?? 0}`, ctx.news === (s.context?.news.length ?? 0) && ctx.flows === (s.context?.flows.length ?? 0), ctx);
    await wordsCheck(page, `${label} 회사 ${c.name}(기록 열림)`);
    { const b = c.brief, nm = await page.evaluate(() => document.querySelector('.c-brief .nw-miss')?.textContent.trim() ?? null); // C1 회사 화면 안에서는 「회사 화면에」 대신 「아래 「수급·기사·공시 기록」에」
      const want = !b ? null : b.news ? null : b.missing.includes('기사') ? '아직 모으지 않음' : b.newsCount ? `회사 이름이 든 기사 없음 · 모은 기사 ${b.newsCount}건은 아래 「수급·기사·공시 기록」에` : '모은 기사 없음';
      check(`${label} 회사 ${c.name}: 수급·기사 칸 기사 줄 「${nm ?? '기사 있음'}」 — 회사 화면이 저를 가리키지 않음`, nm === want, {nm, want}); }
  }

  // ②-2 이어 보기(2026-10-05 15:24 「잡스가 이 아틀란스를 혁신 한다면 큰틀에서 36가지를 찾아 개선하라」 E2~E6)
  {
    const RK = [...board.companies].sort(riseDesc), press2 = async loc => { await loc.scrollIntoViewIfNeeded(); if (mobile) await loc.tap(); else await loc.click(); };
    const rankRead = () => page.evaluate(() => { const n = document.querySelector('.c-rank'); return n ? {prev: n.querySelector('.c-rk-prev')?.getAttribute('href') ?? null, prevT: n.querySelector('.c-rk-prev')?.textContent.trim() ?? null, next: n.querySelector('.c-rk-next')?.getAttribute('href') ?? null, nextT: n.querySelector('.c-rk-next')?.textContent.trim() ?? null, mid: n.querySelector('.c-rk-mid')?.textContent.trim(), midHref: n.querySelector('.c-rk-mid')?.getAttribute('href')} : null; });
    const rkMis = [];
    for (const i of [0, 12, RK.length - 1]) { const c = RK[i]; await page.goto(base + '/#/stock/' + c.code, {waitUntil: 'networkidle'}); await page.waitForSelector('.c-chart svg.lc'); await page.waitForTimeout(150);
      const r = await rankRead(), want = {prev: i ? '#/stock/' + RK[i - 1].code : null, prevT: i ? `‹ ${i}위` : null, next: RK[i + 1] ? '#/stock/' + RK[i + 1].code : null, nextT: RK[i + 1] ? `${i + 2}위 ›` : null, mid: `오른 순 ${RK.length}곳 가운데 ${i + 1}위 · 출목표 자리 ›`, midHref: '#/road/at/' + c.code};
      if (JSON.stringify(r) !== JSON.stringify(want)) rkMis.push({i, r, want}); }
    check(`${label} 회사 화면 오른 순 자리 「‹ n위 · 오른 순 ${RK.length}곳 가운데 n위 · n위 ›」 = 따로 센 차례(1위 · 13위 · ${RK.length}위)`, !rkMis.length, {rkMis: rkMis.slice(0, 2)});
    // 13위 회사에서 「14위 ›」 → 14위 회사 · 가운데 → 출목표 오른 순 그 칸(테)
    await page.goto(base + '/#/stock/' + RK[12].code, {waitUntil: 'networkidle'}); await page.waitForSelector('.c-chart svg.lc'); await page.waitForTimeout(150);
    await press2(page.locator('.c-rk-next')); await page.waitForFunction(code => location.hash === '#/stock/' + code && document.querySelector('.c-chart svg.lc'), RK[13].code); await page.waitForTimeout(200);
    const t14 = await page.evaluate(() => document.querySelector('.b-title')?.innerText.trim());
    check(`${label} 회사 화면 「14위 ›」 ${mobile ? '터치' : '누름'} → 오른 순 14위 「${t14}」 회사 화면`, t14 === RK[13].name, {t14});
    await press2(page.locator('.c-rk-mid')); await page.waitForSelector('.f-body[data-mode="rise"][data-ready] .f-tile.f-hit'); await page.waitForTimeout(300);
    const at = await page.evaluate(() => { const t = document.querySelector('.f-tile.f-hit'), b = t?.getBoundingClientRect(); return {hash: location.hash, tab: document.querySelector('.f-body')?.dataset.tab, code: t?.dataset.code, focus: document.activeElement === t, inView: b ? b.top >= 0 && b.bottom <= innerHeight + 1 || (b.top < innerHeight / 2 && b.bottom > innerHeight / 2) : false, active: document.querySelector('.bottom-link.active')?.dataset.route}; });
    check(`${label} 회사 화면 「오른 순 … 14위 · 출목표 자리 ›」 → 출목표 「오른 순」 「1위~20위」 탭의 그 칸(금빛 테 · 화면 가운데 · 초점)`, at.hash === '#/road' && at.tab === 'r1' && at.code === RK[13].code && at.focus && at.inView && at.active === 'market', at);
    // 그 칸 → 회사 → 같은 업종 칸 「… 업종 화면 ›」 → 업종 화면 「‹ 출목표」(아래 탭 「출목표」 눌린 채로)
    await press2(page.locator(`.f-tile[data-code="${RK[13].code}"]`)); await page.waitForSelector('.c-chart svg.lc'); await page.waitForTimeout(200);
    const g13 = board.groups.find(g => g.id === RK[13].group?.id), ng = await page.evaluate(() => ({href: document.querySelector('.c-near-go a')?.getAttribute('href') ?? null, t: document.querySelector('.c-near-go a')?.textContent.trim() ?? null}));
    check(`${label} 회사 화면 같은 업종 칸 「${ng.t}」 → #/i/${g13?.id}`, ng.href === '#/i/' + g13?.id && ng.t === `${g13?.label} 업종 평균 · 구성 종목 확인 ›`, ng);
    await press2(page.locator('.c-near-go a')); await page.waitForSelector(`article.i-page[data-group="${g13.id}"] .b-card`); await page.waitForTimeout(200);
    const ib = await page.evaluate(() => ({back: [document.querySelector('.c-back')?.getAttribute('href'), document.querySelector('.c-back')?.textContent.trim()], active: document.querySelector('.bottom-link.active')?.dataset.route, road: document.querySelector('.i-road a')?.getAttribute('href') ?? null, roadT: document.querySelector('.i-road a')?.textContent.trim() ?? null}));
    const fam13 = familyOf(g13.label);
    check(`${label} 출목표 → 회사 → 업종 화면: 되돌아가기 「${ib.back[1]}」 · 아래 탭 「출목표」 눌림 · 「${ib.roadT}」`, ib.back[0] === '#/road' && ib.back[1] === '‹ 출목표' && ib.active === 'market' && ib.road === '#/road/g/' + g13.id && ib.roadT === `출목표에서 「${fam13.label}」 갈래와 함께 보기 ›`, ib);
    // 업종 화면 「출목표에서 … 함께 보기 ›」 → 출목표 「업종별」 그 갈래 탭 · 그 업종 묶음(금빛 테 · 화면 위)
    await press2(page.locator('.i-road a')); await page.waitForSelector(`.f-body[data-mode="ind"][data-ready] #f-${g13.id}.f-hit`); await page.waitForTimeout(300);
    const ig = await page.evaluate(id => { const sct = document.getElementById('f-' + id), b = sct?.getBoundingClientRect(); return {hash: location.hash, tab: document.querySelector('.f-body')?.dataset.tab, top: b ? Math.round(b.top) : null, codes: [...(sct?.querySelectorAll('.f-tile') ?? [])].length}; }, g13.id);
    check(`${label} 업종 화면 「출목표에서 … 함께 보기 ›」 → 출목표 「업종별」 「${fam13.label}」 탭 · 「${g13.label}」 묶음 칸 ${ig.codes}개(화면 위 ${ig.top}px)`, ig.hash === '#/road' && ig.tab === fam13.id && ig.codes === g13.codes.length && ig.top !== null && ig.top >= -2 && ig.top < 200, ig);
    await page.evaluate(() => { for (const k of Object.keys(localStorage)) if (k.startsWith('atlas11:road')) localStorage.removeItem(k); }); // 아래 출목표 검사는 처음 들어온 사람처럼
  }

  // ③ 일정
  await page.goto(base + '/#/agenda', {waitUntil: 'networkidle'}); await page.waitForSelector('.b-box'); await page.waitForTimeout(300);
  await shot('03-agenda');
  const ev = new Set(Object.values(agenda.byCode).flatMap(x => x.upcoming.map(u => u.id))), notices = Object.values(agenda.byCode).flatMap(x => x.disclosures.filter(d => d.notice)).length, big = Object.values(agenda.byCode).flatMap(x => x.disclosures.filter(d => !d.notice && d.level === 3)).length;
  const a = await page.evaluate(() => { const box = [...document.querySelectorAll('.b-box')]; const byLabel = l => box.find(b => b.getAttribute('aria-label') === l); return {market: byLabel('시장 전체 일정')?.querySelectorAll('.ag-li').length, company: byLabel('회사·업종 일정')?.querySelectorAll('.ag-li').length, notices: byLabel('예고 공시')?.querySelectorAll('.ag-li').length, big: byLabel('아주 중요한 공시')?.querySelectorAll('.ag-li').length, days: document.querySelectorAll('.a-day').length, active: document.querySelector('.bottom-link.active')?.dataset.route}; });
  check(`${label} 일정: 시장 ${a.market}건 · 회사·업종 ${a.company}건(${a.days}날) · 예고 공시 ${a.notices}건 · ★★★ 공시 ${a.big}건 = 일정표 · 아래 탭 「일정」 눌림`, a.market === agenda.market.length && a.company === ev.size && a.notices === notices && a.big === big && a.active === 'market', {a, want: {market: agenda.market.length, company: ev.size, notices, big}});
  await wordsCheck(page, `${label} 일정`);
  // 2026-10-05 15:24 「잡스가 … 36가지」 D1 · D2 — 긴 공시 목록은 앞 10건만 펼침(접힌 줄도 목록 안에 그대로 · 위 수 검사가 모두 셈)
  { const af = await page.evaluate(() => ['예고 공시', '아주 중요한 공시'].map(l => { const b = [...document.querySelectorAll('.b-box')].find(x => x.getAttribute('aria-label') === l), d = b?.querySelector('details.ag-fold'); return {l, all: b?.querySelectorAll('.ag-li').length ?? 0, shown: [...(b?.querySelectorAll('.ag-li') ?? [])].filter(li => !li.closest('details.ag-fold')).length, sum: d?.querySelector('summary')?.textContent.trim() ?? null, open: d?.open ?? null}; }));
    const word = {'예고 공시': '예고·알림 공시', '아주 중요한 공시': '아주 중요 공시'};
    check(`${label} 일정: 긴 공시 목록 접기 — ${af.map(x => `${x.l} ${x.shown}건 펼침 · ${x.all - x.shown}건 접힘`).join(' · ')}`, af.every(x => x.all <= 12 ? x.shown === x.all && x.sum === null : x.shown === 10 && x.open === false && x.sum === `${word[x.l]} ${x.all - 10}건 더 보기 · 모두 ${x.all}건`), af); }

  // ③-2 출목표(#/road) — 묶는 법 셋 × 그 안의 탭
  //   2026-10-04 22:12 「에볼루션에 바카라 출몰표 한곳에 모여 있는것도 … 추가로 더 만들어」 · 22:51 「그래프로 있어야 해 그리고 그 회사들 뉴스와 수급도」
  //   2026-10-05 11:36 「모든 배치가 가장 많이 상승한순으로」 · 12:28 「출목표를 클릭하면 지금 365개 다 나오잖아 불편해 … 그 안에 탭을 더 만들어서 편하면서도 직관적으로」
  //   탭을 하나씩 모두 눌러 365곳이 빠짐·겹침 없이 이 검사기가 따로 줄 세운 차례대로 나오는지 센다(오른 순 19개 · 업종별 12개 · 흐름별 10가지)
  await page.goto(base + '/#/road', {waitUntil: 'networkidle'}); await page.waitForSelector('.f-body[data-ready] .f-tile'); await page.waitForTimeout(300);
  await shot('04-road');
  const roadRead = () => page.evaluate(() => ({title: document.querySelector('.b-title')?.innerText.trim(), when: document.querySelector('.b-when')?.innerText.trim(), active: document.querySelector('.bottom-link.active')?.dataset.route, mode: document.querySelector('.f-body')?.dataset.mode, tab: document.querySelector('.f-body')?.dataset.tab ?? null,
    segs: [...document.querySelectorAll('.f-seg-b[data-mode]')].map(b => `${b.dataset.mode}:${b.getAttribute('aria-pressed')}:${b.textContent.trim()}`),
    hint: document.querySelector('.f-tabs-h')?.textContent.trim() ?? null,
    strip: (() => { const s = document.querySelector('.f-tabs'); return s ? {role: s.getAttribute('role'), scroll: s.dataset.scroll ?? null} : null; })(),
    tabs: [...document.querySelectorAll('.f-tabs .f-tab')].map(b => `${b.dataset.tab}|${b.getAttribute('aria-selected')}|${b.querySelector('.f-tab-l')?.textContent.trim()}|${b.querySelector('.f-tab-n')?.textContent.trim() ?? ''}|${b.querySelector('.f-tab-s svg.sun .sun-rays line') ? '☀' : ''}${b.querySelector('.f-tab-s')?.textContent.trim() ?? ''}`),
    spkBox: (() => { const x = document.querySelector('.f-spk-box'); return x ? {h: (x.querySelector('.f-spk-h svg.sun .sun-rays line') ? '☀' : '') + x.querySelector('.f-spk-h')?.textContent.trim(), t: x.querySelector('.f-spk-t')?.textContent.trim(), list: [...x.querySelectorAll('.f-spk-li')].map(li => `${li.dataset.shape}|${li.querySelector('.f-spk-n')?.textContent.trim()}|${li.querySelectorAll('.spk-pic .bead').length}`), all: [...x.querySelectorAll('.f-spk-all li')].map(li => ({id: li.dataset.shape, common: li.dataset.common, text: li.textContent.replace(/\s+/g, ' ').trim()}))} : null; })(),
    lead: document.querySelector('.f-body > .f-lead')?.textContent.trim() ?? null,
    more: document.querySelector('.f-body > .f-more')?.textContent.replace(/\s+/g, ' ').trim() ?? null,
    pager: (() => { const g = document.querySelector('.f-body > .f-pager'); return g ? {next: g.querySelector('.f-pg-next')?.textContent.trim() ?? null, prev: g.querySelector('.f-pg-prev')?.textContent.trim() ?? null, pos: g.querySelector('.f-pg-pos')?.textContent.trim() ?? null} : null; })(),
    mean: (() => { const m = document.querySelector('.f-body .f-mean .spark.mini'); return m ? {n: +m.dataset.points, lo: m.dataset.lo, hi: m.dataset.hi, side: ['up', 'down', 'flat'].find(k => m.classList.contains(k)) ?? null} : null; })(),
    meanNone: !!document.querySelector('.f-body .f-mean .sp-none'),
    secs: [...document.querySelectorAll('.f-body > .f-sec')].map(s => ({domId: s.id, id: s.dataset.group ?? s.dataset.flow, rank: s.querySelector('.f-h-rank')?.textContent.trim() ?? null, name: (s.querySelector('.f-h-name') ?? s.querySelector('.t-h2'))?.firstChild?.textContent.trim(), fire: !!s.querySelector('.f-h .t-fire'), chg: s.querySelector('.f-h-chg')?.textContent.trim() ?? null, codes: [...s.querySelectorAll('.f-tile')].map(t => t.dataset.code)})),
    tiles: [...document.querySelectorAll('.f-tile')].map(t => ({code: t.dataset.code, href: t.getAttribute('href'), name: t.querySelector('.f-name')?.textContent.trim(), chg: t.querySelector('.f-chg')?.textContent.trim(), ind: t.querySelector('.f-ind')?.textContent.trim() ?? null, beads: t.querySelectorAll('.road .bead').length, up: t.querySelectorAll('.road .bead.up').length, st: t.querySelector('.f-st')?.textContent.trim(), unit: t.querySelector('.f-unit')?.textContent.trim() ?? null, sec: t.closest('.f-sec')?.id ?? null, sp: (() => { const sp = t.querySelector('.spark'); return sp ? {n: +sp.dataset.points, lo: sp.dataset.lo, hi: sp.dataset.hi, side: ['up', 'down', 'flat'].find(k => sp.classList.contains(k)) ?? null, pts: sp.querySelector('.sp-line')?.getAttribute('points')?.trim().split(/\s+/).length ?? 0} : null; })(), fl: [...t.querySelectorAll('.fl .fl-val')].map(e => e.textContent.trim()), flMiss: t.querySelector('.fl-miss')?.textContent.trim() ?? null, nwT: t.querySelector('.nw-t')?.textContent.trim() ?? null, nwH: t.querySelector('.nw-h')?.textContent.trim() ?? null, nwMiss: t.querySelector('.nw-miss')?.textContent.trim() ?? null, spk: t.dataset.sparkle ?? null, spkT: t.querySelector('.f-spk')?.textContent.trim() ?? null, late: t.querySelector('.f-late')?.textContent.trim() ?? null, sun: !!t.querySelector('.f-spk svg.sun .sun-rays line')})),
    notes: [...document.querySelectorAll('.f-body > .f-sec')].map(sct => ({id: sct.id, note: [...sct.querySelectorAll(':scope > .t-sub')].map(p => p.textContent.trim()).join(' ')})), ctx: document.querySelector('.f-ctx')?.textContent.trim() ?? null,
    stripHidden: document.querySelector('.f-tabs')?.hidden ?? null, pagerN: document.querySelectorAll('.f-body > .f-pager').length, lead2: document.querySelector('.f-body > .f-lead')?.textContent.trim() ?? null,
    go: (() => { const g = document.querySelector('.f-spk-go'); return g ? {t: g.textContent.trim(), sun: !!g.querySelector('svg.sun .sun-rays line')} : null; })(),
    first: (() => { const t = document.querySelector('.f-tile'); return t ? Math.round(t.getBoundingClientRect().top + scrollY) : null; })(), ih: innerHeight, keyIn: !!document.querySelector('.f-spk-box details.f-spk-how .f-key'), keyHead: document.querySelectorAll('.b-head .f-key').length, spkS: document.querySelector('.f-spk-box .f-spk-s')?.textContent.trim() ?? null,
    sw: document.documentElement.scrollWidth, iw: innerWidth}));
  const secScale = r => new Map(r.secs.map(x => [x.domId, scaleW(x.codes.map(code => byCodeB.get(code)))]));
  const briefTileMis = r => { const sc = secScale(r); return r.tiles.map(t => ({code: t.code, bad: briefMisW(t, byCodeB.get(t.code), sc.get(t.sec))})).filter(x => x.bad.length).concat(r.notes.filter(n => !n.note.includes(scaleTextW(sc.get(n.id)))).map(n => ({sec: n.id, note: n.note.slice(-60)}))); };
  const ctxGot = board.companies.filter(c => c.brief && !c.brief.missing.includes('수급') && !c.brief.missing.includes('기사')).length, ctxDay = board.companies.map(c => c.brief?.day).filter(Boolean).sort().at(-1);
  const ctxWant = ctxGot === N ? `수급·기사: ${N}곳 모두${ctxDay ? ` · ${kd(ctxDay)} 기준` : ''}` : `수급·기사: ${N}곳 가운데 ${ctxGot}곳만 모았음${ctxDay ? `(${kd(ctxDay)} 기준)` : ''} · 나머지 ${N - ctxGot}곳은 다음 관측 수집 때 채움`;
  const tileMisOf = (tiles, withInd) => tiles.filter(t => { const c = byCodeB.get(t.code), road = c && roadOf(c.c); return !c || t.href !== '#/stock/' + c.code || t.name !== c.name || t.chg !== (Number.isFinite(c.change20) ? p1(c.change20) : '없음') || t.beads !== road.cells.length || t.up !== road.all.up || t.st !== upDaysW(c) || t.unit !== (road.unit > 0.01 ? `동그라미 하나 = ${Math.round(road.unit * 100)}%` : null) || (withInd ? t.ind !== board.groups.find(g => g.id === c.group?.id)?.label : t.ind !== null) || t.late !== (c.date && c.date < toM ? `${kd(c.date)} 종가까지` : null); }).map(t => t.code); // 늦은 종가 칸 표시(「잡스가 … 36가지」 F1)
  const press = async loc => { if (mobile) await loc.tap(); else await loc.click(); };
  const waitTab = id => page.waitForSelector(`.f-body[data-tab="${id}"][data-ready] .f-tile`);
  /** 「더 보기」를 다 눌러 그 탭을 모두 펼친다(누른 수를 돌려줌) */
  const expandAll = async () => { let k = 0; for (; k < 40; k++) { const m = page.locator('.f-body > .f-more'); if (!(await m.count())) break; await press(m); await page.waitForTimeout(60); } return k; };
  // 이 검사기가 따로 세운 차례 — 오른 순(20곳씩) · 큰 갈래(갈래 평균이 큰 순) · 흐름(묶음 평균이 큰 순 · 같으면 아홉 칸 표 차례)
  const rankedW = [...board.companies].sort(riseDesc), CH = 20, chunksW = Array.from({length: Math.ceil(N / CH)}, (_, i) => rankedW.slice(i * CH, i * CH + CH));
  const famW = familiesByRise(board.groups), rd0 = roadOf(board.companies[0].c);
  // 출목표 반짝(2026-10-05 13:53 「출목표를 보면 상승할 때에 묘한 공통점 … 반짝반짝 해가지고 바보도 알 수 있게끔」) — 화면 코드(shapes.js)와 따로 센다
  //   후보 여덟(표에 보이는 동그라미·줄) · 오른 순 위 20% 와 나머지 · 위 20%의 50% 넘게 · 나머지보다 10%p 넘게 = 공통 · 반짝 = 공통을 모두 가짐
  const runsW = rd => rd.cells.reduce((o, c) => { const l = o.at(-1); if (l && l.s === c.side) l.n++; else o.push({s: c.side, n: 1}); return o; }, []);
  const dayW = (rd, side) => Object.values(rd.cells.filter(c => c.side === side).reduce((m, c) => (m[c.day] = (m[c.day] ?? 0) + 1, m), {}));
  const recW = (rd, side) => rd.cells.filter(c => c.side === side && c.day >= rd.days - rd.recentDays).length;
  const SHAPE_W = [['longRed', '긴 빨강 줄', '긴 빨강 줄', rd => runsW(rd).some(x => x.s === 'up' && x.n >= 6)],
    ['redTwice', '빨강이 파랑의 2배', '빨강 2배', rd => { const u = rd.cells.filter(c => c.side === 'up').length, d = rd.cells.length - u; return u > 0 && u >= 2 * d; }],
    ['bigRedDay', '하루 빨강 5개', '하루 빨강 5개', rd => dayW(rd, 'up').some(n => n >= 5)],
    ['recentRed', '끝 5일 빨강', '끝 5일 빨강', rd => recW(rd, 'up') >= recW(rd, 'down') + 2],
    ['lastRed', '끝 줄 빨강', '끝 줄 빨강', rd => rd.cells.at(-1)?.side === 'up'],
    ['shortBlue', '짧은 파랑 줄', '짧은 파랑', rd => { const rs = runsW(rd); return rs.some(x => x.s === 'up') && rs.every(x => x.s !== 'down' || x.n <= 2); }],
    ['noBigBlue', '큰 파랑 날 없음', '큰 파랑 없음', rd => rd.cells.length > 0 && dayW(rd, 'down').every(n => n < 3)],
    ['redCols', '빨강 줄이 더 많음', '빨강 줄 많음', rd => { const rs = runsW(rd); return rs.filter(x => x.s === 'up').length > rs.filter(x => x.s === 'down').length; }]];
  const roadW = new Map(board.companies.map(c => [c.code, roadOf(c.c)])), topNW = Math.round(N * 0.2), topW = rankedW.slice(0, topNW), restW = rankedW.slice(topNW);
  const shapeW = SHAPE_W.map(([id, name, short, f]) => { const a = topW.filter(c => f(roadW.get(c.code))).length, b = restW.filter(c => f(roadW.get(c.code))).length; return {id, name, short, f, a, b, sa: a / topW.length, gap: a / topW.length - b / restW.length}; });
  let pickW = shapeW.filter(t => t.sa > 0.5 && t.gap > 0.10); if (pickW.length < 3) pickW = [...pickW, ...shapeW.filter(t => !pickW.includes(t) && t.gap > 0).sort((x, y) => y.gap - x.gap).slice(0, 3 - pickW.length)];
  const commonW = shapeW.filter(t => pickW.includes(t)), kW = commonW.length;
  const spkW = new Set(kW ? board.companies.filter(c => commonW.every(t => t.f(roadW.get(c.code)))).map(c => c.code) : []);
  const pcW = (y, n) => `${n ? Math.round(y / n * 100) : 0}%`;
  /** 칸마다 반짝 표시 = 따로 센 값(반짝이면 뜨거운 태양 그림 + 「오른 모양 n가지」 · 아니면 표시 없음 — 2026-10-05 14:30 「모양을 뜨거운 태양으로 하셔」) */
  const spkMisOf = tiles => tiles.filter(t => spkW.has(t.code) ? !(t.spk === String(kW) && t.spkT === `태양 · 오른 모양 ${kW}가지` && t.sun) : !(t.spk === null && t.spkT === null && !t.sun)).map(t => ({code: t.code, spk: t.spk, spkT: t.spkT, sun: t.sun}));
  const spkCount = codes => codes.filter(code => spkW.has(code)).length;
  const avgW = xs => { const v = xs.map(c => c.change20).filter(Number.isFinite); return v.length ? v.reduce((s, x) => s + x, 0) / v.length : -Infinity; };
  const flowsWant = FLOW_ORDER_W.map(k => ({k, items: board.companies.filter(c => flowWant(roadOf(c.c)) === k).sort(riseDesc)})).filter(f => f.items.length)
    .map(f => ({...f, avg: avgW(f.items)})).sort((a, b) => b.avg - a.avg);
  const chipW = k => k === 'still' ? '거의 안 움직임' : flowTextW(k);
  const segsWant = on => [`rise:${on === 'rise'}:오른 순 ${N}곳`, ...(spkW.size ? [`sun:${on === 'sun'}:태양 ${spkW.size}곳`] : []), `ind:${on === 'ind'}:업종별 ${G}개`, `flow:${on === 'flow'}:흐름별 ${flowsWant.length}가지`].join('|'); // 태양 = 2026-10-05 14:40 「한 곳으로 모아줘」
  const riseLabels = chunksW.map((xs, k) => `${k * CH + 1}위~${k * CH + xs.length}위`);
  const starW = codes => { const n = spkCount(codes); return n ? `☀${n}곳` : ''; };
  const tabsWant = {rise: sel => chunksW.map((xs, k) => `r${k * CH + 1}|${k === sel}|${riseLabels[k]}||${starW(xs.map(c => c.code))}`),
    ind: sel => famW.map((f, k) => `${f.fam.id}|${k === sel}|${f.fam.label}|${Number.isFinite(f.avg) ? p1(f.avg) : '없음'}|${starW(f.groups.flatMap(g => g.codes))}`),
    flow: sel => flowsWant.map((f, k) => `${f.k}|${k === sel}|${chipW(f.k)}|${f.items.length}곳|${starW(f.items.map(c => c.code))}`)};
  const pagerWant = (labels, i) => ({next: i + 1 < labels.length ? `${i + 2}번째 탭 · ${labels[i + 1]} 보기 ›` : null, prev: i > 0 ? `‹ ${i}번째 탭 · ${labels[i - 1]}` : null, pos: `탭 ${labels.length}개 가운데 ${i + 1}번째`});
  const pagerOk = (r, labels, i) => { const w = pagerWant(labels, i); return r.pager?.next === w.next && r.pager?.prev === w.prev && r.pager?.pos === w.pos; };

  // ⓪ 처음 = 「오른 순」 첫 탭(1위~20위)
  const r0 = await roadRead();
  check(`${label} 출목표: 제목 「${r0.title}」 = 판 ${N}곳 · 「${r0.when}」 · 아래 탭 「출목표」 눌림 · 처음 = 오른 순 첫 탭(단추 ${r0.segs.join(' | ')})`, r0.title === `출목표 ${N}곳` && r0.when === `지난 20거래일 · ${kd(fromM)}부터 ${kd(toM)} 15:30 종가까지` && r0.active === 'market' && r0.mode === 'rise' && r0.tab === 'r1' && r0.segs.join('|') === segsWant('rise'), {...r0, secs: undefined, tiles: undefined, notes: undefined});
  check(`${label} 출목표 오른 순: 탭 ${r0.tabs.length}개 = 20곳씩 ${chunksW.length}개(「${riseLabels[0]}」 … 「${riseLabels.at(-1)}」) · 첫 탭 고름 · 탭 줄 = 옆으로 밀어 보는 tablist · 「${r0.hint}」 · 한 번에 칸 ${r0.tiles.length}개`, r0.tabs.join() === tabsWant.rise(0).join() && r0.strip?.role === 'tablist' && r0.strip?.scroll === 'x' && r0.hint === `탭 ${chunksW.length}개 · 20곳씩 · 지난 20거래일 많이 오른 차례` && r0.tiles.length === CH, {tabs: r0.tabs.slice(0, 3), strip: r0.strip, hint: r0.hint, tiles: r0.tiles.length});
  check(`${label} 출목표 맨 위 반짝 상자(태양 그림): 「${r0.spkBox?.h}」 = 따로 센 ${spkW.size}곳 · 공통 모양 ${kW}가지(${commonW.map(t => t.short).join(' · ')}) · 모양마다 작은 출목표 그림 · 펼치면 후보 ${SHAPE_W.length}가지(오른 ${topNW}곳 · 나머지 ${restW.length}곳에서 몇 곳)`,
    !!r0.spkBox && r0.spkBox.h === `☀태양 ${spkW.size}곳` && r0.spkBox.t === `지난 20거래일 많이 오른 ${topNW}곳(오른 순 1위~${topNW}위)의 출목표에 많이 보이는 모양 ${kW}가지를 모두 가진 곳`
      && r0.spkBox.list.length === kW && r0.spkBox.list.every((x, i) => { const [id, short, nb] = x.split('|'); return id === commonW[i].id && short === commonW[i].short && +nb > 0; })
      && r0.spkBox.all.length === SHAPE_W.length && shapeW.every((t, i) => { const x = r0.spkBox.all[i], on = commonW.includes(t); return x && x.id === t.id && x.common === String(on) && x.text.startsWith(`${on ? '✓' : '·'} ${t.name} — `) && x.text.endsWith(`오른 ${topNW}곳 가운데 ${t.a}곳(${pcW(t.a, topNW)}) · 나머지 ${restW.length}곳 가운데 ${t.b}곳(${pcW(t.b, restW.length)})`); }),
    {spkBox: r0.spkBox, want: {n: spkW.size, common: commonW.map(t => `${t.id} ${t.a}/${topNW} ${t.b}/${restW.length}`)}});
  check(`${label} 출목표 맨 위 태양 상자: 단추 「${r0.go?.t}」(태양 그림) — 2026-10-05 14:40 「태양이 있는 곳을 한 곳으로 모아줘」`, !spkW.size ? r0.go === null : r0.go?.t === `태양 ${spkW.size}곳 한곳에 모아 보기 ›` && r0.go.sun, r0.go);
  // 2026-10-05 15:24 「잡스가 … 36가지」 A1 · A2 — 태양 상자는 제목 · 뜻 한 줄 · 모양 그림 · 단추 · 읽는 법(접힘) · 칸 읽는 법도 그 접힘 안 · 휴대폰 첫 화면에 첫 칸
  check(`${label} 출목표 첫 화면: 태양 상자 뜻 한 줄 「${r0.spkS}」 · 칸 읽는 법은 접힘 안 · 첫 칸 ${r0.first}px(${mobile ? `휴대폰 두 화면 ${r0.ih * 2}px 안 — 2026-10-07 04:01 「과감하게」 논평 무대 · 04:27 「더 과감하게」 표지가 첫 화면을 차지` : 'PC'})`, (!spkW.size || (r0.spkS === `오른 회사들의 공통 모양 ${kW}가지를 모두 가진 곳` && r0.keyIn && r0.keyHead === 0)) && (!mobile || r0.first < r0.ih * 2), {spkS: r0.spkS, keyIn: r0.keyIn, keyHead: r0.keyHead, first: r0.first, ih: r0.ih});
  await wordsCheck(page, `${label} 출목표 오른 순(첫 탭)`);
  // (옛 E1 출목표 제목 줄 「찾기」는 2026-10-05 20:24 아래 탭 「찾기」로 옮김 — 아래 ⑥에서 본다)
  {
    const seen = [], mis = [], tileMis = [], briefMis = [], over = [], spkMis = []; let spkSeen = 0;
    for (let k = 0; k < chunksW.length; k++) {
      if (k) { await press(page.locator('.f-body .f-pg-next')); await waitTab('r' + (k * CH + 1)); await page.waitForTimeout(k === 1 ? 800 : 60); }
      const r = k ? await roadRead() : r0, xs = chunksW[k], a = k * CH + 1, b = a + xs.length - 1, s = r.secs[0], note = r.notes[0]?.note ?? '';
      if (k === 1) { const y = await page.evaluate(() => Math.round(document.querySelector('.f-seg[role="group"]').getBoundingClientRect().top)); check(`${label} 출목표 맨 아래 「${pagerWant(riseLabels, 0).next}」 ${mobile ? '터치' : '누름'} → 그 탭 · 화면은 묶는 법 단추 자리로 올라감(위에서 ${y}px)`, r.tab === 'r21' && y >= 40 && y <= 100, {y, tab: r.tab}); }
      if (!(r.tab === 'r' + a && r.tabs.join() === tabsWant.rise(k).join() && r.secs.length === 1 && s?.domId === `f-r${a}` && s?.name === `${a}위~${b}위` && s?.codes.join() === xs.map(c => c.code).join() && note.startsWith(`${a}위 ${p1(xs[0].change20)} ~ ${b}위 ${p1(xs.at(-1).change20)} · `) && !note.includes('많이 오른 차례') /* 「많이 오른 차례」는 탭 줄 위 한 줄에 한 번만(「잡스가 … 36가지」 A1) */ && r.more === null && pagerOk(r, riseLabels, k))) mis.push({k, tab: r.tab, sec: s && {...s, codes: s.codes.length}, pager: r.pager, more: r.more});
      seen.push(...r.tiles.map(t => t.code));
      const tm = tileMisOf(r.tiles, true); if (tm.length) tileMis.push({k, tm: tm.slice(0, 3)});
      const sm = spkMisOf(r.tiles); if (sm.length) spkMis.push({k, sm: sm.slice(0, 3)}); spkSeen += r.tiles.filter(t => t.spk).length;
      const bt = briefTileMis(r); if (bt.length) briefMis.push({k, bt: bt.slice(0, 2)});
      if (r.sw > r.iw) over.push({k, sw: r.sw, iw: r.iw});
    }
    check(`${label} 출목표 오른 순: 탭 ${chunksW.length}개를 맨 아래 넘김 단추로 하나씩 — 탭마다 20곳 = 이 검사기가 따로 줄 세운 지난 20거래일 많이 오른 차례(1위 ${rankedW[0].name} ${p1(rankedW[0].change20)} … ${N}위 ${rankedW.at(-1).name} ${p1(rankedW.at(-1).change20)}) · 머리 「a위~b위」 · 첫·끝 값 · 넘김 단추 글 · 「탭 n개 가운데 m번째」`, !mis.length, {mis: mis.slice(0, 2)});
    check(`${label} 출목표 오른 순: 탭 ${chunksW.length}개 칸 합 ${seen.length}개 = 판 ${N}곳(겹침·빠짐 없음) · 칸마다 이름·업종 이름·20거래일 변화·출목표 동그라미·「오른 날 n일」·「동그라미 하나 = n%」·회사 화면 링크 = 판`, seen.length === N && new Set(seen).size === N && !tileMis.length, {tileMis: tileMis.slice(0, 2)});
    check(`${label} 출목표 오른 순: 칸마다 선 그래프(20곳 탭마다 같은 눈금 · 눈금 글) · 수급 · 기사 = 판 · 「${r0.ctx}」 · 탭 ${chunksW.length}개 모두 옆으로 넘치지 않음`, !briefMis.length && r0.ctx === ctxWant && !over.length, {briefMis: briefMis.slice(0, 2), ctx: r0.ctx, ctxWant, over});
    check(`${label} 출목표 오른 순: 반짝 칸 ${spkSeen}곳 = 따로 센 ${spkW.size}곳(공통 모양 ${kW}가지를 모두 가진 곳) · 칸마다 뜨거운 태양 + 「오른 모양 ${kW}가지」 · 탭마다 태양 + 반짝 수 「n곳」(탭 줄 맞댐)`, !spkMis.length && spkSeen === spkW.size, {spkMis: spkMis.slice(0, 2), spkSeen});
    await wordsCheck(page, `${label} 출목표 오른 순(마지막 탭)`);
    const t1 = page.locator('.f-tabs .f-tab[data-tab="r1"]'); await press(t1); await waitTab('r1'); await page.waitForTimeout(200);
    const rb = await page.evaluate(() => { const s = document.querySelector('.f-tabs'), b = s.querySelector('[aria-selected="true"]'), sr = s.getBoundingClientRect(), br = b.getBoundingClientRect(); return {tab: document.querySelector('.f-body').dataset.tab, sel: b.dataset.tab, inView: br.left >= sr.left - 1 && br.right <= sr.right + 1, first: document.querySelector('.f-tile')?.dataset.code}; });
    check(`${label} 출목표 탭 줄 「${riseLabels[0]}」 ${mobile ? '터치' : '누름'} → 첫 탭으로 · 고른 탭이 탭 줄 안에 보임`, rb.tab === 'r1' && rb.sel === 'r1' && rb.inView && rb.first === rankedW[0].code, rb);
    if (!mobile) {
      await page.locator('.f-tabs .f-tab[data-tab="r1"]').focus(); await page.keyboard.press('ArrowRight'); await waitTab('r21');
      const kb = await page.evaluate(() => ({tab: document.querySelector('.f-body').dataset.tab, focus: document.activeElement?.dataset?.tab ?? null}));
      await page.keyboard.press('Home'); await waitTab('r1');
      check(`${label} 출목표 탭 줄: 오른쪽 화살표 글쇠 → 둘째 탭(${kb.tab} · 초점도 그 탭) · Home → 첫 탭`, kb.tab === 'r21' && kb.focus === 'r21' && (await page.evaluate(() => document.querySelector('.f-body').dataset.tab)) === 'r1', kb);
    }
  }
  // ① 업종별 — 큰 갈래 12개가 탭
  await press(page.locator('.f-seg-b[data-mode="ind"]')); await page.waitForSelector('.f-body[data-mode="ind"][data-ready] .f-tile'); await page.waitForTimeout(250);
  {
    const i0 = await roadRead(), famLabels = famW.map(f => f.fam.label);
    check(`${label} 출목표 「업종별」 ${mobile ? '터치' : '누름'} → 단추 ${i0.segs.join(' | ')} · 탭 ${i0.tabs.length}개 = 큰 갈래 ${famW.length}개(갈래 평균이 큰 순 · 탭마다 갈래 평균) · 첫 탭 「${famLabels[0]}」 · 「${i0.hint}」`, i0.mode === 'ind' && i0.segs.join('|') === segsWant('ind') && i0.tab === famW[0].fam.id && i0.tabs.join() === tabsWant.ind(0).join() && i0.hint === `큰 갈래 탭 ${famW.length}개 · 갈래 평균이 큰 순 · 갈래 이름은 ATLAS가 업종 이름을 보고 묶은 것`, {tabs: i0.tabs.slice(0, 3), hint: i0.hint, tab: i0.tab});
    const seen = [], mis = [], tileMis = [], briefMis = [], over = [], spkMis = []; let maxShown = 0, spkSeen = 0;
    for (const [k, f] of famW.entries()) {
      if (k) { await press(page.locator(`.f-tabs .f-tab[data-tab="${f.fam.id}"]`)); await waitTab(f.fam.id); await page.waitForTimeout(60); }
      const first = await page.evaluate(() => document.querySelectorAll('.f-body .f-tile').length); maxShown = Math.max(maxShown, first);
      await expandAll();
      const r = await roadRead(), gs = board.groups.filter(g => familyOf(g.label).id === f.fam.id), cnt = gs.reduce((t, g) => t + g.codes.length, 0);
      const secOk = r.secs.length === gs.length && gs.every((g, j) => { const s = r.secs[j], gi = board.groups.indexOf(g), want = g.codes.map(code => byCodeB.get(code)).sort(riseDesc).map(c => c.code); return s && s.id === g.id && s.rank === `${gi + 1}위` && s.name === g.label && s.fire === Boolean(g.hot) && s.chg === (Number.isFinite(g.change20) ? p1(g.change20) : '없음') && s.codes.join() === want.join(); });
      if (!(r.tab === f.fam.id && r.tabs.join() === tabsWant.ind(k).join() && secOk && r.lead === `${f.fam.label} · 업종 ${gs.length}개 · ${cnt}곳 · 갈래 평균 ${Number.isFinite(f.avg) ? p1(f.avg) : '없음'}` && pagerOk(r, famLabels, k) && first === Math.min(cnt, cnt <= 45 ? cnt : 20))) mis.push({k, fam: f.fam.label, tab: r.tab, lead: r.lead, secs: r.secs.map(s => s.id), pager: r.pager, first});
      seen.push(...r.tiles.map(t => t.code));
      const tm = tileMisOf(r.tiles, false); if (tm.length) tileMis.push({k, tm: tm.slice(0, 3)});
      const sm = spkMisOf(r.tiles); if (sm.length) spkMis.push({k, sm: sm.slice(0, 3)}); spkSeen += r.tiles.filter(t => t.spk).length;
      const bt = briefTileMis(r); if (bt.length) briefMis.push({k, bt: bt.slice(0, 2)});
      if (r.sw > r.iw) over.push({k, sw: r.sw, iw: r.iw});
    }
    check(`${label} 출목표 업종별: 탭 ${famW.length}개를 하나씩 — 탭마다 그 갈래 업종 묶음만(판 차례 · n위·이름·「불장」·평균) · 업종 안은 많이 오른 순 · 맨 위 「갈래 · 업종 n개 · m곳 · 갈래 평균」 · 넘김 단추 · 처음 보이는 칸 많아야 ${maxShown}개`, !mis.length && maxShown <= 45, {mis: mis.slice(0, 2), maxShown});
    check(`${label} 출목표 업종별: 탭 ${famW.length}개 칸 합 ${seen.length}개 = 판 ${N}곳(겹침·빠짐 없음) · 칸마다 이름·변화·출목표·「오른 날 n일」·링크 = 판(업종 이름은 묶음 머리에)`, seen.length === N && new Set(seen).size === N && !tileMis.length, {tileMis: tileMis.slice(0, 2)});
    check(`${label} 출목표 업종별: 칸마다 선 그래프(업종 5곳 같은 눈금 · 눈금 글) · 수급 · 기사 = 판 · 탭 ${famW.length}개 모두 옆으로 넘치지 않음`, !briefMis.length && !over.length, {briefMis: briefMis.slice(0, 2), over});
    check(`${label} 출목표 업종별: 반짝 칸 ${spkSeen}곳 = 따로 센 ${spkW.size}곳 · 칸마다 뜨거운 태양 + 「오른 모양 ${kW}가지」 · 탭마다 반짝 수`, !spkMis.length && spkSeen === spkW.size, {spkMis: spkMis.slice(0, 2), spkSeen});
    await wordsCheck(page, `${label} 출목표 업종별(마지막 탭)`);
  }
  // ② 흐름별 — 흐름 10가지가 탭 · 탭 머리에 묶음 평균 선(모든 흐름 같은 눈금) · 45곳이 넘으면 20곳씩 「더 보기」
  await press(page.locator('.f-seg-b[data-mode="flow"]')); await page.waitForSelector('.f-body[data-mode="flow"][data-ready] .f-tile'); await page.waitForTimeout(250);
  const meanW = cs => { const ok = cs.filter(c => c.date === toM); const n = Math.min(...ok.map(c => c.c.length)); return ok.length ? Array.from({length: n}, (_, i) => ok.reduce((t, c) => t + c.c[i] / c.c[0] - 1, 0) / ok.length) : []; };
  const meansW = new Map(flowsWant.map(f => [f.k, meanW(f.items)])), allM = [...meansW.values()].flat(), mlo = Math.min(-0.03, ...allM), mhi = Math.max(0.03, ...allM);
  {
    const q0 = await roadRead(), f0 = flowsWant[0], flowLabels = flowsWant.map(f => chipW(f.k));
    check(`${label} 출목표 「흐름별」 ${mobile ? '터치' : '누름'} → 탭 ${q0.tabs.length}가지 = 따로 나눈 흐름 ${flowsWant.length}가지(묶음 평균 지난 20거래일 변화가 큰 순: ${flowsWant.map(f => p1(f.avg)).join(' · ')}) · 탭마다 곳 수 · 첫 탭 「${flowLabels[0]}」`, q0.mode === 'flow' && q0.segs.join('|') === segsWant('flow') && q0.tab === f0.k && q0.tabs.join() === tabsWant.flow(0).join() && q0.hint === `흐름 탭 ${flowsWant.length}가지 · 묶음 평균(지난 20거래일 변화)이 큰 순 · 앞 ${rd0.beforeDays}거래일 → 끝 ${rd0.recentDays}거래일의 오른 날·내린 날 동그라미 수로 나눔`, {tabs: q0.tabs.slice(0, 3), hint: q0.hint});
    // 「더 보기」 — 첫 탭(가장 큰 흐름일 때가 많음)
    const total0 = f0.items.length, big0 = total0 > 45;
    const moreSteps = [];
    if (big0) {
      let shownN = 20, r = q0;
      for (let guard = 0; guard < 40 && r.more; guard++) {
        moreSteps.push({shown: r.tiles.length, more: r.more, okOrder: r.tiles.map(t => t.code).join() === f0.items.slice(0, shownN).map(c => c.code).join(), okLabel: r.more === `이 탭 ${shownN + 1}위~${Math.min(total0, shownN + 20)}위 더 보기 · 남은 ${total0 - shownN}곳`});
        const mb = page.locator('.f-body > .f-more'); await mb.scrollIntoViewIfNeeded(); await page.waitForTimeout(60); const y0 = await page.evaluate(() => Math.round(scrollY)); await press(mb); await page.waitForTimeout(80); shownN = Math.min(total0, shownN + 20); r = await roadRead();
        const y1 = await page.evaluate(() => Math.round(scrollY)); moreSteps.at(-1).still = Math.abs(y1 - y0) <= 2; moreSteps.at(-1).dy = y1 - y0;
      }
      moreSteps.push({shown: r.tiles.length, more: r.more, okOrder: r.tiles.map(t => t.code).join() === f0.items.map(c => c.code).join(), okLabel: r.more === null, still: true});
    }
    check(`${label} 출목표 흐름별 첫 탭 「${flowLabels[0]}」 ${total0}곳: ${big0 ? `처음 20곳 · 「더 보기」 ${moreSteps.length - 1}번에 ${total0}곳 모두(차례 그대로 · 글에 다음 등수와 남은 곳 수 · 누르는 동안 화면은 그 자리)` : '45곳 이하라 한 번에 모두'}`, big0 ? q0.tiles.length === 20 && moreSteps.every(s => s.okOrder && s.okLabel && s.still) && moreSteps.at(-1).shown === total0 : q0.tiles.length === total0 && q0.more === null, {moreSteps});
    const seen = [], mis = [], tileMis = [], briefMis = [], over = [], spkMis = []; let spkSeen = 0;
    for (const [k, f] of flowsWant.entries()) {
      if (k) { await press(page.locator(`.f-tabs .f-tab[data-tab="${f.k}"]`)); await waitTab(f.k); await page.waitForTimeout(60); }
      const first = await page.evaluate(() => document.querySelectorAll('.f-body .f-tile').length);
      await expandAll();
      const r = await roadRead(), s = r.secs[0], m = meansW.get(f.k);
      // 그 흐름 회사가 모두 판 날짜 종가가 없으면(거래 정지 같은 늦은 종가) 평균 선 대신 「선 없음」(2026-10-06 판 · 「거의 안 움직임」 3곳 모두 10월 2일 종가)
      const meanOk = m.length < 2 ? !r.mean && r.meanNone : r.mean && r.mean.n === m.length && r.mean.lo === mlo.toFixed(4) && r.mean.hi === mhi.toFixed(4) && r.mean.side === (m.at(-1) > 0 ? 'up' : m.at(-1) < 0 ? 'down' : 'flat');
      if (!(r.tab === f.k && r.tabs.join() === tabsWant.flow(k).join() && r.secs.length === 1 && s?.id === f.k && s?.name === flowTextW(f.k) && s?.codes.join() === f.items.map(c => c.code).join() && meanOk && pagerOk(r, flowLabels, k) && (k === 0 || first === (f.items.length > 45 ? 20 : f.items.length)))) mis.push({k, flow: f.k, tab: r.tab, sec: s && {...s, codes: s.codes.length}, mean: r.mean, pager: r.pager, first});
      seen.push(...r.tiles.map(t => t.code));
      const tm = tileMisOf(r.tiles, true); if (tm.length) tileMis.push({k, tm: tm.slice(0, 3)});
      const sm = spkMisOf(r.tiles); if (sm.length) spkMis.push({k, sm: sm.slice(0, 3)}); spkSeen += r.tiles.filter(t => t.spk).length;
      const bt = briefTileMis(r); if (bt.length) briefMis.push({k, bt: bt.slice(0, 2)});
      if (r.sw > r.iw) over.push({k, sw: r.sw, iw: r.iw});
    }
    check(`${label} 출목표 흐름별: 탭 ${flowsWant.length}가지를 하나씩 — 탭마다 그 흐름 회사만(많이 오른 순) · 머리 이름 · 묶음 평균 선(종가 ${meansW.get(f0.k).length}개 · 흐름 ${flowsWant.length}가지 같은 눈금 ${pW(mlo, 0)} ~ ${pW(mhi, 0)} · 오름/내림 색) · 45곳이 넘는 탭은 처음 20곳 · 넘김 단추`, !mis.length, {mis: mis.slice(0, 2)});
    check(`${label} 출목표 흐름별: 탭 ${flowsWant.length}가지 칸 합 ${seen.length}개 = 판 ${N}곳(겹침·빠짐 없음) · 칸마다 업종 이름까지 판과 같음`, seen.length === N && new Set(seen).size === N && !tileMis.length, {tileMis: tileMis.slice(0, 2)});
    check(`${label} 출목표 흐름별: 칸마다 선 그래프(흐름마다 같은 눈금) · 수급 · 기사 = 판 · 탭 ${flowsWant.length}가지 모두 옆으로 넘치지 않음`, !briefMis.length && !over.length, {briefMis: briefMis.slice(0, 2), over});
    check(`${label} 출목표 흐름별: 반짝 칸 ${spkSeen}곳 = 따로 센 ${spkW.size}곳 · 칸마다 뜨거운 태양 + 「오른 모양 ${kW}가지」 · 탭마다 반짝 수`, !spkMis.length && spkSeen === spkW.size, {spkMis: spkMis.slice(0, 2), spkSeen});
    await wordsCheck(page, `${label} 출목표 흐름별(마지막 탭)`);
    // 셋째 탭 칸 → 회사 화면(「‹ 출목표」) → 되돌아오면 같은 묶는 법 · 같은 탭 · 보던 자리
    const f3 = flowsWant[2] ?? flowsWant[0];
    await press(page.locator(`.f-tabs .f-tab[data-tab="${f3.k}"]`)); await waitTab(f3.k); await page.waitForTimeout(150);
    const pk = f3.items[Math.min(5, f3.items.length - 1)], tl = page.locator(`.f-tile[data-code="${pk.code}"]`); await toMid(tl); await page.waitForTimeout(150);
    const yBefore = await page.evaluate(() => Math.round(scrollY));
    await press(tl); await page.waitForSelector('.c-chart svg.lc'); await page.waitForTimeout(300);
    const rc = await page.evaluate(() => ({hash: location.hash, title: document.querySelector('.b-title')?.innerText.trim(), back: [document.querySelector('.c-back')?.getAttribute('href'), document.querySelector('.c-back')?.textContent.trim()]}));
    check(`${label} 출목표 흐름별 「${chipW(f3.k)}」 칸 ${mobile ? '터치' : '누름'} → 회사 화면 #/stock/${pk.code}(「${rc.title}」) · 되돌아가기 「${rc.back[1]}」`, rc.hash === '#/stock/' + pk.code && rc.title === pk.name && rc.back[0] === '#/road' && rc.back[1] === '‹ 출목표', rc);
    await press(page.locator('.c-back')); await page.waitForSelector('.f-body[data-ready] .f-tile'); await page.waitForTimeout(400);
    const back = await page.evaluate(() => ({hash: location.hash, y: Math.round(scrollY), mode: document.querySelector('.f-body')?.dataset.mode, tab: document.querySelector('.f-body')?.dataset.tab}));
    check(`${label} 회사 화면 「‹ 출목표」 → 출목표 · 같은 묶는 법(흐름별) · 같은 탭(${back.tab}) · 보던 자리(${yBefore}px → ${back.y}px)`, back.hash === '#/road' && back.mode === 'flow' && back.tab === f3.k && Math.abs(back.y - yBefore) <= 2, {yBefore, back});
    // 출목표는 아래 탭 「종목」 안 보기(2026-10-08 20:19 지시서) — 출목표를 보다 「종목」 탭을 누르면 그 탭 첫 화면(목록) 맨 위
    await pressArea(page, press, 'stocks'); await page.waitForSelector('.sk-page .sk-row'); await page.waitForTimeout(300);
    const tt = await page.evaluate(() => ({hash: location.hash, y: Math.round(scrollY), active: document.querySelector('.bottom-link.active')?.dataset.route}));
    check(`${label} 출목표를 보다 아래 탭 「종목」 ${mobile ? '터치' : '누름'} → 종목 목록 맨 위(${tt.hash} · ${tt.y}px)`, tt.hash === '#/stocks' && tt.y === 0 && tt.active === 'market', tt);
    await page.evaluate(() => { location.hash = '#/road'; }); await page.waitForSelector('.f-body[data-ready] .f-tile'); await page.waitForTimeout(300); // 다음(③ 태양)은 출목표에서
  }
  // ③ 태양 — 한곳에 모아 보기(2026-10-05 14:40 「태양이 있는 곳을 한 곳으로 모아줘 그래야 저기 이용하는 사람들이 쉬울 거 아냐」)
  //   맨 위 상자 단추 → 묶는 법 「태양」 · 태양 칸만 오른 순 그대로 모두(「더 보기」 없이) · 오른 순 자리 20칸마다 묶음 머리 · 탭 줄·넘김 단추 없음
  if (spkW.size) {
    const goBtn = page.locator('.f-spk-go'); await goBtn.scrollIntoViewIfNeeded(); await press(goBtn);
    await page.waitForSelector('.f-body[data-mode="sun"][data-ready] .f-tile'); await page.waitForTimeout(900);
    const sr = await roadRead(), segY = await page.evaluate(() => Math.round(document.querySelector('.f-seg[role="group"]').getBoundingClientRect().top));
    const sunsW = rankedW.filter(c => spkW.has(c.code)), inTopW = rankedW.slice(0, topNW).filter(c => spkW.has(c.code)).length;
    const bandsW = chunksW.map((xs, k) => ({a: k * CH + 1, b: k * CH + xs.length, xs: xs.filter(c => spkW.has(c.code))})).filter(x => x.xs.length);
    const secOk = sr.secs.length === bandsW.length && bandsW.every((w, j) => { const s = sr.secs[j]; return s && s.domId === `f-s${w.a}` && s.name === `오른 순 ${w.a}위~${w.b}위` && s.codes.join() === w.xs.map(c => c.code).join() && (sr.notes[j]?.note ?? '').startsWith(`${w.b - w.a + 1}곳 가운데 ${w.xs.length}곳 · 지난 20거래일 많이 오른 차례 · `); });
    check(`${label} 출목표 태양 상자 단추 ${mobile ? '터치' : '누름'} → 묶는 법 「태양」(단추 ${sr.segs.join(' | ')}) · 화면은 묶는 법 자리로(위에서 ${segY}px) · 탭 줄·넘김 단추 없음`, sr.mode === 'sun' && sr.segs.join('|') === segsWant('sun') && sr.stripHidden === true && sr.pagerN === 0 && segY >= 40 && segY <= 100 && sr.hint === `태양 ${spkW.size}곳만 한곳에 · 지난 20거래일 많이 오른 차례`, {mode: sr.mode, segs: sr.segs, stripHidden: sr.stripHidden, pagerN: sr.pagerN, segY, hint: sr.hint});
    check(`${label} 출목표 태양 한곳: 칸 ${sr.tiles.length}개 = 따로 센 태양 ${spkW.size}곳 모두 · 오른 순 그대로(${sunsW.slice(0, 3).map(c => c.name).join(' · ')} …) · 묶음 ${sr.secs.length}개(「오른 순 1위~20위 · 태양 n곳」) · 맨 위 「1위~${topNW}위 안 ${inTopW}곳 · 밖 ${spkW.size - inTopW}곳」`,
      sr.tiles.length === spkW.size && sr.tiles.map(t => t.code).join() === sunsW.map(c => c.code).join() && secOk && sr.lead2 === `태양 ${spkW.size}곳 = 오른 회사 출목표의 공통 모양 ${kW}가지를 모두 가진 곳 · 오른 순 1위~${topNW}위 안 ${inTopW}곳 · 밖 ${spkW.size - inTopW}곳`,
      {tiles: sr.tiles.length, secs: sr.secs.map(x => `${x.domId}:${x.name}:${x.codes.length}`), lead: sr.lead2});
    const tmS = tileMisOf(sr.tiles, true), smS = spkMisOf(sr.tiles), btS = briefTileMis(sr);
    check(`${label} 출목표 태양 한곳: 칸마다 태양 표 · 이름·업종·20거래일 변화·출목표·링크 = 판 · 선 그래프(묶음마다 같은 눈금) · 수급 · 기사 · 옆으로 넘치지 않음`, !tmS.length && !smS.length && !btS.length && sr.sw <= sr.iw, {tmS: tmS.slice(0, 3), smS: smS.slice(0, 3), btS: btS.slice(0, 2), sw: sr.sw});
    await wordsCheck(page, `${label} 출목표 태양 한곳`);
  }
  // 다른 아래 탭에서 출목표 탭을 누르면 늘 「오른 순」 첫 탭(1위~20위) 맨 위 — 흐름별 셋째 탭을 보다 떠났어도
  {
    await pressArea(page, press, 'agenda');
    await page.waitForFunction(() => location.hash === '#/agenda' && !document.querySelector('.f-body') && document.querySelector('.bottom-link.active')?.dataset.route === 'market'); await page.waitForTimeout(200);
    await pressArea(page, press, 'stocks'); await page.waitForSelector('.sk-page .hs-seg'); await page.waitForTimeout(150);
    await press(page.locator('.sk-page .hs-b[data-seg="road"]')); await page.waitForSelector('.f-body[data-ready] .f-tile'); await page.waitForTimeout(300); // 종목 → 출목표 보기
    const rr = await page.evaluate(() => ({hash: location.hash, y: Math.round(scrollY), mode: document.querySelector('.f-body')?.dataset.mode, tab: document.querySelector('.f-body')?.dataset.tab, pressed: document.querySelector('.f-seg-b[aria-pressed="true"]')?.dataset.mode, sel: document.querySelector('.f-tab[aria-selected="true"]')?.dataset.tab, first: [...document.querySelectorAll('.f-tile')].slice(0, 3).map(t => t.dataset.code), n: document.querySelectorAll('.f-tile').length}));
    check(`${label} 흐름별을 보다 일정 탭 → 종목 탭 → 출목표 보기 ${mobile ? '터치' : '누름'} → 「오른 순」 첫 탭 「${riseLabels[0]}」 맨 위(${rr.y}px) · 칸 ${rr.n}개 · 첫 칸 ${rankedW.slice(0, 3).map(c => c.name).join(' · ')}`, rr.hash === '#/road' && rr.mode === 'rise' && rr.pressed === 'rise' && rr.tab === 'r1' && rr.sel === 'r1' && rr.y === 0 && rr.n === CH && rr.first.join() === rankedW.slice(0, 3).map(c => c.code).join(), rr);
    // 업종별 · 흐름별도 첫 탭부터(들어올 때 모든 탭을 처음으로)
    await press(page.locator('.f-seg-b[data-mode="flow"]')); await page.waitForSelector('.f-body[data-mode="flow"][data-ready] .f-tile'); await page.waitForTimeout(150);
    const ft = await page.evaluate(() => ({tab: document.querySelector('.f-body')?.dataset.tab, n: document.querySelectorAll('.f-tile').length}));
    check(`${label} 그때 「흐름별」을 누르면 첫 탭 「${chipW(flowsWant[0].k)}」부터(펼친 「더 보기」도 처음으로 · 칸 ${ft.n}개)`, ft.tab === flowsWant[0].k && ft.n === (flowsWant[0].items.length > 45 ? 20 : flowsWant[0].items.length), ft);
    await press(page.locator('.f-seg-b[data-mode="rise"]')); await page.waitForSelector('.f-body[data-mode="rise"][data-ready] .f-tile'); await page.waitForTimeout(100);
  }

  // ⑥ 아래 탭 「찾기」(2026-10-05 20:24 사장님 「아틀란스에서 종목을 찾는 기능을 넣어라」) — 판 목록의 모든 판을 함께(한국 · 미국 · 2026-10-07 중국 · 일본 · 베트남) · 셈은 site/app/find.js 그대로(단위 시험 tests/atlas11/find.test.mjs)
  {
    let places = null; try { places = await (await fetch(base + '/places.json')).json(); } catch {}
    const us = places?.places?.find(p => p.id === 'us'), usBoard = us ? await (await fetch(base + us.href.replace(/\/$/, '') + '/data/atlas11/view/board.json')).json() : null;
    // 판 목록의 모든 판(2026-10-07 중국 · 일본 · 베트남 — 한국 · 미국 · 중국 · 일본 · 베트남 차례 = 화면 차례)
    const boardsW = [{place: {id: 'kr', label: '한국', href: '/'}, here: true, companies: board.companies}];
    for (const p of (places?.places ?? []).filter(p => p.id !== 'kr')) boardsW.push({place: {id: p.id, label: p.label, href: p.href}, here: false, companies: p.id === 'us' && usBoard ? usBoard.companies : (await (await fetch(base + p.href.replace(/\/$/, '') + '/data/atlas11/view/board.json')).json()).companies});
    const NW = boardsW.reduce((t, b) => t + b.companies.length, 0), scopeW = boardsW.map(b => `${b.place.label} ${b.companies.length}곳`).join(' · ');
    // 2026-10-08 20:19 「ATLAS 개편 실행 지시서」 7 — 옛 아래 탭 「찾기」는 아래 탭 「종목」의 찾기 칸(위 막대 돋보기 · 옛 주소 #/find 도 여기로)
    await press(page.locator('.top .tb-b[data-view="stocks"]')); await page.waitForSelector('.sk-page .fd-in'); await page.waitForTimeout(250);
    const f0 = await page.evaluate(() => ({hash: location.hash, focus: document.activeElement?.classList.contains('fd-in') ?? false, active: document.querySelector('.bottom-link.active')?.dataset.route, top: document.querySelector('.top .tb-b[data-view="stocks"]')?.getAttribute('aria-current'), sw: document.documentElement.scrollWidth, iw: innerWidth}));
    check(`${label} 위 막대 돋보기 ${mobile ? '터치' : '누름'} → #/stocks · 글 칸에 바로 커서 · 아래 탭 「종목」 눌림`, f0.hash === '#/stocks' && f0.focus && f0.active === 'market' && f0.sw <= f0.iw, f0);
    const {findIn: findW, stockHref: hrefW, chosung: choW} = await import(new URL('../../site/app/find.js', import.meta.url));
    const read = () => page.evaluate(() => ({msg: document.querySelector('.sk-page .fd-msg')?.textContent.trim() ?? '', hits: [...document.querySelectorAll('.sk-list .sk-row')].map(li => ({code: li.dataset.code, href: li.querySelector('a.sk-a')?.getAttribute('href'), name: li.querySelector('.sk-name')?.textContent.trim(), mkt: li.querySelector('[data-place]')?.dataset.place ?? null}))}));
    const fi = page.locator('.sk-page .fd-in');
    const kr0 = [...board.companies].sort((a, b) => (b.change20 ?? -9) - (a.change20 ?? -9))[3], qs = [kr0.name.slice(0, 1), choW(kr0.name), kr0.code, ...(usBoard ? [usBoard.companies[0].name, usBoard.companies[0].code.toLowerCase()] : [])];
    for (const q of qs) {
      await fi.fill(q); await page.waitForTimeout(250);
      const got = await read(), all = findW(boardsW, q), want = all.slice(0, 30);
      const ok = got.hits.length === want.length && want.every((w, k) => { const x = got.hits[k]; return x && x.code === w.c.code && x.href === hrefW(w) && x.name === w.c.name && x.mkt === w.place.id; }) && got.msg === (all.length > 30 ? `「${q}」 ${all.length}곳 가운데 30곳 · 글자를 더 넣으면 좁혀짐` : `「${q}」 ${all.length}곳`);
      check(`${label} 종목 찾기 「${q}」 → ${got.hits.length}곳(「${got.msg}」) = find.js 로 센 앞 ${want.length}곳 · 차례 · 시장 · 주소 같음 · 첫 줄 ${got.hits[0]?.name ?? '없음'}`, want.length > 0 && ok, {got: {...got, hits: got.hits.slice(0, 3)}, want: want.slice(0, 3).map(w => `${w.place.id}:${w.c.code}`)});
    }
    await fi.fill('없는회사이름'); await page.waitForTimeout(150);
    const nf = await read();
    check(`${label} 종목 찾기: 없는 이름 → 「${nf.msg}」 · 줄 0개 · 끝에 「글자 지우기」 단추(조건을 몰래 풀지 않고 사람이 바꿈 — 2026-10-09 통합본 0-I)`, nf.msg === '「없는회사이름」 맞는 회사 없음 · ATLAS 는 고른 회사만 봅니다 · 초성 · 영어 이름 · 기호로도 찾습니다 · 글자 지우기' && nf.hits.length === 0 && (await page.evaluate(() => document.querySelector('.fd-msg button.sk-clear')?.textContent.trim())) === '글자 지우기', nf);
    await fi.fill(kr0.name); await page.waitForTimeout(150); await fi.press('Enter');
    await page.waitForFunction(code => location.hash === '#/stock/' + code && document.querySelector('.c-chart svg.lc'), kr0.code); await page.waitForTimeout(200);
    const fc = await page.evaluate(() => ({title: document.querySelector('.b-title')?.innerText.trim(), back: document.querySelector('.c-back')?.textContent.trim()}));
    check(`${label} 종목 찾기: 「${kr0.name}」 넣고 Enter → 그 회사 화면 · 되돌아가기 「${fc.back}」`, fc.title === kr0.name && fc.back === '‹ 종목', fc);
    await press(page.locator('.c-back')); await page.waitForSelector('.sk-page .fd-in'); await page.waitForTimeout(250);
    const fb = await page.evaluate(() => ({hash: location.hash, value: document.querySelector('.sk-page .fd-in')?.value, n: document.querySelectorAll('.sk-list .sk-row').length}));
    check(`${label} 회사 화면 「‹ 종목」 → 종목 그대로(넣은 글자 「${fb.value}」 · 줄 ${fb.n}개)`, fb.hash === '#/stocks' && fb.value === kr0.name && fb.n >= 1, fb);
    if (usBoard) {
      const u0 = usBoard.companies[0];
      await fi.fill(u0.name); await page.waitForTimeout(250);
      await press(page.locator(`.sk-list .sk-row[data-code="${u0.code}"] a.sk-a`).first());
      await page.waitForFunction(code => location.pathname === '/us/' && location.hash === '#/stock/' + code && document.querySelector('.c-chart svg.lc'), u0.code, {timeout: 20000}); await page.waitForTimeout(200);
      const uc = await page.evaluate(() => ({path: location.pathname + location.hash, title: document.querySelector('.b-title')?.innerText.trim(), close: document.querySelector('.b-price .b-close')?.textContent.trim()}));
      check(`${label} 종목 찾기: 미국 「${u0.name}」 줄 ${mobile ? '터치' : '누름'} → 미국 판 회사 화면 ${uc.path} · 「${uc.title}」 · 값 「${uc.close}」`, uc.path === '/us/#/stock/' + u0.code && uc.title === u0.name && /달러$/.test(uc.close ?? ''), uc);
      await page.goto(base + '/#/stocks', {waitUntil: 'networkidle'}); await page.waitForSelector('.sk-page .fd-in');
      await page.locator('.sk-page .fd-in').fill(''); await page.waitForTimeout(150);
    }
  }

  // ④ 지운 화면의 옛 주소 → 처음 화면
  for (const old of ['#/forecast', '#/up', '#/down', '#/scores', '#/race', '#/evolution', '#/status', '#/records', '#/game']) {
    await page.goto(base + '/' + old, {waitUntil: 'networkidle'}); await page.waitForSelector('.cd-page section[data-art]'); await page.waitForTimeout(150);
    const r = await page.evaluate(() => ({hash: location.hash, firsts: [...document.querySelectorAll('.cd-page [data-first]')].map(x => x.dataset.first).join(), active: document.querySelector('.bottom-link.active')?.dataset.route}));
    check(`${label} 옛 주소 ${old} → 첫 화면 「후보 7」(#/ · 정보 칸 ${r.firsts})`, r.hash === '#/' && r.firsts === '1,2,3' && r.active === 'cand', r); // 2026-10-09 08:26 첫 화면 ① 기준 → ② 입체 땅 → ③ 자세히
  }
  // ⑤ 아래 탭 「기록」(#/log · 2026-10-06 16:10 「업데이트한 날짜랑 자료 변경한 날짜를 … 기록 하는 탭」) — 검사기가 /changelog.json 을 따로 읽어 화면과 줄마다 맞댐
  //   무결성은 이 탭 맨 아래 「기술 정보」(옛 모든 화면 맨 아래 접힘을 옮김 — 규칙 1)
  //   이슈(2026-10-06 18:37 「이슈칸을 만들어서 기록해」) — 칩 「이슈」 · 출처 줄 · 거르기 넷 · 이슈가 한 줄은 있어야(판을 만들 때 저절로 쌓임)
  {
    const CHIP = {update: '업데이트', data: '자료 변경', issue: '이슈'};
    const log = await (await fetch(base + '/changelog.json')).json(), want = log.entries, byKind = k => want.filter(e => k === 'all' || e.kind === k);
    await page.goto(base + '/#/hot', {waitUntil: 'networkidle'}); await page.waitForSelector('.h-page .hs-seg'); await page.waitForTimeout(200);
    const footTech = await page.evaluate(() => document.querySelectorAll('.b-foot .b-tech, .b-foot .integrity-text').length);
    const tChk = page.locator('.bottom-link[data-route="check"]'); if (mobile) await tChk.tap(); else await tChk.click(); await page.waitForSelector('.ck-page .hs-seg'); await page.waitForTimeout(150); // 2026-10-08 20:19 지시서 — 옛 「기록」은 「검증」 안 「운영 기록」
    const tLog = page.locator('.ck-page .hs-b[data-seg="ops"]'); if (mobile) await tLog.tap(); else await tLog.click(); await page.waitForSelector('.lg-page .lg-item'); await page.waitForTimeout(250);
    const read = () => page.evaluate(() => ({hash: location.hash, title: document.querySelector('.b-title')?.innerText.replace(/\s+/g, ' ').trim(), active: document.querySelector('.bottom-link.active')?.dataset.route,
      items: [...document.querySelectorAll('.lg-item')].map(li => ({id: li.dataset.id, kind: li.dataset.kind, chip: li.querySelector('.lg-kind')?.textContent.trim(), time: li.querySelector('.lg-time')?.textContent.trim(), dt: li.querySelector('.lg-time')?.getAttribute('datetime'),
        title: li.querySelector('.lg-title')?.textContent.trim(), what: [...li.querySelectorAll('.lg-what li')].map(x => x.textContent.trim()), removed: li.querySelector('.lg-removed')?.textContent.trim() ?? null, src: li.querySelector('.lg-src')?.textContent.trim() ?? null, day: li.closest('.lg-day')?.dataset.date, fixed: [...li.querySelectorAll('.lg-fixed')].map(x => x.textContent.trim())})),
      days: [...document.querySelectorAll('.lg-day')].map(d => d.dataset.date), pressed: document.querySelector('.lg-seg [aria-pressed="true"]')?.dataset.show,
      integ: document.querySelector('.lg-tech .integrity-text')?.textContent ?? null, sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth}));
    const r0 = await read();
    const mis = want.map((e, i) => { const x = r0.items[i]; return x && x.id === e.id && x.kind === e.kind && x.chip === CHIP[e.kind] && x.dt === e.live && x.time === e.live.slice(11, 16) && x.title === e.title && x.what.join('|') === e.what.join('|') && x.day === e.live.slice(0, 10)
      && (e.removed?.length ? x.removed === '뺀 것 ' + e.removed.join(' · ') : x.removed === null) && (e.source ? x.src === '출처 · ' + e.source : x.src === null)
      && x.fixed.join('|') === (e.fixed ?? []).map(f => `${kd(f.made.slice(0, 10))} ${f.made.slice(11, 16)} 업데이트가 이 기록의 글 한 줄을 고침 — 옛 글은 기록 파일에 그대로`).join('|') ? null : {i, id: e.id, x}; }).filter(Boolean); // 고침(2026-10-07): 고친 줄 아래 「고침」 한 줄 · 화면 글 = /changelog.json(고친 글)
    const daysW = [...new Set(want.map(e => e.live.slice(0, 10)))], newestFirst = want.every((e, i) => !i || want[i - 1].live >= e.live);
    check(`${label} 아래 탭 「기록」(#/log): 줄 ${r0.items.length}개 = 기록 파일 ${want.length}개(이슈 ${log.count.issue} · 업데이트 ${log.count.update} · 자료 변경 ${log.count.data} · 검사에 걸려 빠진 줄 ${log.problems.length}) · 같은 차례(새것이 위) · 날짜 묶음 ${r0.days.length}개 · 줄마다 종류 · 올라간 때 · 제목 · 무엇 · 뺀 것 · 출처 · 「기록」 눌림 · 옆으로 넘치지 않음`,
      r0.hash === '#/log' && r0.title === `기록 ${want.length}개` && r0.active === 'check' && want.length > 0 && r0.items.length === want.length && !mis.length && r0.days.join() === daysW.join() && newestFirst && log.problems.length === 0 && log.count.issue >= 1 && r0.sw <= r0.cw && r0.pressed === 'all', {mis: mis.slice(0, 2), days: r0.days, problems: log.problems.slice(0, 3), issue: log.count.issue});
    for (const k of ['issue', 'update', 'data', 'all']) {
      const b = page.locator(`.lg-seg [data-show="${k}"]`); if (mobile) await b.tap(); else await b.click(); await page.waitForTimeout(150);
      const r = await read(), w = byKind(k);
      check(`${label} 기록 「${k === 'all' ? '모두' : CHIP[k]}」 누름 → ${r.items.length}줄 = 기록 파일 ${w.length}줄(같은 차례) · 옆으로 넘치지 않음`, r.pressed === k && r.items.length === w.length && r.items.every((x, i) => x.id === w[i].id) && r.sw <= r.cw, {pressed: r.pressed, n: r.items.length, sw: r.sw, cw: r.cw});
    }
    check(`${label} 무결성(기록 탭 맨 아래 「기술 정보」): 「${r0.integ}」 · 다른 화면 맨 아래 「기술 정보」 ${footTech}개(옮김 · 규칙 1)`, /모두 판 목록의 SHA-256 과 같음/.test(r0.integ ?? '') && footTech === 0, {integ: r0.integ, footTech});
  }
  // ⑤-2 아래 탭 「처음」(#/start · 2026-10-07 00:40 「틀리더라도 일단 찍어」 · 00:49 「이대로 사이트에 올려줘」) — 검사기가 종가 원본에서 따로 센 다섯과 화면을 맞댐
  {
    const S = board.start, want5 = await startWant(), codesW = want5.map(x => x.code);
    await page.goto(base + '/#/hot', {waitUntil: 'networkidle'}); await page.waitForSelector('.h-page .hs-seg'); await page.waitForTimeout(150);
    const tS = page.locator('.top .tb-b[data-view="guide"]'); if (mobile) await tS.tap(); else await tS.click(); await page.waitForSelector('.st-page .st-row'); await page.waitForTimeout(250); // 2026-10-08 20:19 지시서 — 「처음 · 투자 안내」는 위 막대 「안내」
    const r = await page.evaluate(() => ({hash: location.hash, title: document.querySelector('.b-title')?.innerText.replace(/\s+/g, ' ').trim(), active: document.querySelector('.bottom-link.active')?.dataset.route,
      rows: [...document.querySelectorAll('.st-row')].map(a => ({code: a.dataset.code, rk: a.querySelector('.st-rk')?.textContent.trim(), name: a.querySelector('.st-name')?.textContent.trim(), v: a.querySelector('.st-v')?.textContent.trim(), w: a.querySelector('.st-fill')?.getBoundingClientRect().width ?? 0, href: a.getAttribute('href')})),
      base: document.querySelector('.st-base .st-v')?.textContent.trim(), why: document.querySelectorAll('.st-warn li').length, promise: document.querySelector('.b-promise-box summary')?.innerText.trim(),
      third: document.querySelectorAll('.b-promise-box li')[2]?.textContent.trim(), sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth}));
    check(`${label} 아래 탭 「처음」(#/start): 다섯 ${r.rows.map(x => x.name).join(' · ')} = 검사기가 종가 원본에서 따로 센 다섯(우량 · 시가총액 100위 안 · 지난 3년 가장 덜 떨어진 순 · 막대 길이도 그 차례) · 견줄 값 ${r.base} · 까닭 ${r.why}가지 · 「ATLAS가 하지 않는 일 8가지」가 여기로(셋째 줄 「처음」 · 여덟째 줄 광고 · 유료 결제 없음 — 2026-10-07 05:30) · 옆으로 넘치지 않음`,
      S?.ready && r.hash === '#/start' && r.title === `처음 ${codesW.length}곳` && r.active === undefined && r.rows.map(x => x.code).join() === codesW.join() && r.rows.every((x, i) => x.rk === `${i + 1}위` && x.href === '#/stock/' + x.code && x.v === pct0(want5[i].mdd))
        && r.rows.every((x, i) => !i || x.w >= r.rows[i - 1].w - 0.5) && r.base === pct0(S.typical.mdd) && r.why >= 1 && r.promise === 'ATLAS가 하지 않는 일 8가지' && /^사거나 팔라고 하지 않습니다 — 「매수 검토 후보」는 미리 정한 규칙으로 고른 검토 차례\(연구용 · 성능 검증 전\)이고 결정은 보는 사람이 합니다 · 「처음」 화면의 \d곳도/.test(r.third ?? '') && r.sw <= r.cw, {r: {...r, rows: r.rows.map(x => x.name + ' ' + x.v)}, codesW});
    await wordsCheck(page, `${label} 아래 탭 「처음」`);
  }
  // ⑤-4 한국 주식시장 안내 · ATLAS가 되고 싶은 것 · 하규 응원 · 광고 없음(2026-10-07 05:30 · 05:31 · 05:38 · 05:39 — 규칙 23 · 응원 글은 2026-10-08 17:44 「하규 화이팅! 비서실장 화이팅」)
  {
    await page.goto(base + '/#/start', {waitUntil: 'networkidle'}); await page.waitForSelector('.st-page'); await page.waitForTimeout(200);
    const st = await page.evaluate(() => ({card: document.querySelector('.st-page a.gd-card')?.getAttribute('href') ?? null, ms: document.querySelector('.ms-box .ms-h')?.textContent.trim() ?? null, msLi: document.querySelectorAll('.ms-box .ms-list > li').length,
      msSrc: document.querySelector('.ms-box a.ms-src')?.getAttribute('href') ?? null, msCheer: document.querySelector('.ms-box .ms-cheer')?.textContent.trim() ?? null,
      promise8: [...document.querySelectorAll('.b-promise-box li')].at(-1)?.textContent.trim() ?? null}));
    check(`${label} 「처음」 탭: 「한국 주식시장 안내 ›」 카드 · 「${st.ms}」 ${st.msLi}줄(두 축 · 뇌동매매 연구 출처 · 광고 없음 · 만든 사람의 태도) · 「${st.msCheer}」 · 하지 않는 일 여덟째 「${st.promise8}」`,
      st.card === '#/guide' && st.ms === 'ATLAS가 되고 싶은 것' && st.msLi === 4 && st.msSrc === 'https://doi.org/10.1111/0022-1082.00226' && st.msCheer === '하규 화이팅! 비서실장 화이팅' && st.promise8 === '광고를 싣지 않고 유료 결제를 받지 않습니다 — 영원히, 상업적 이익을 좇지 않습니다', st);
    const tG = page.locator('.st-page a.gd-card[href="#/guide"]'); if (mobile) await tG.tap(); else await tG.click(); await page.waitForSelector('.gd-page .gd-row', {state: 'attached'}); await page.waitForTimeout(200); /* 갈래마다 접힘(2026-10-08 · 규칙 33) */ // 카드 셋(2026-10-07 안내 · 500만 원 · 몇 위) 가운데 안내
    const gd = await page.evaluate(() => ({hash: location.hash, title: document.querySelector('.gd-page .b-title')?.textContent.trim(), active: document.querySelector('.bottom-link.active')?.dataset.route,
      secs: [...document.querySelectorAll('.gd-sec')].map(x => x.querySelector('.gd-h')?.textContent.replace(/^\d+/, '').trim()), rows: document.querySelectorAll('.gd-row').length,
      noSrc: [...document.querySelectorAll('.gd-row')].filter(r => ![...r.querySelectorAll('.gd-src a')].some(a => /^https:\/\//.test(a.getAttribute('href') ?? ''))).length,
      back: document.querySelector('.gd-page .c-back')?.getAttribute('href'), units: [...document.querySelectorAll('.gd-t b[lang="ko"]')].map(b => b.textContent).join(''),
      foot: {guide: document.querySelector('.b-foot .b-guide a')?.getAttribute('href') ?? null, promise: document.querySelector('.b-foot .b-promise')?.textContent.trim() ?? null,
        dup: !!document.querySelector('.b-foot .b-cheer, .b-foot .b-contact, .b-foot a[href^="sms:"]')}, // 하규 응원 · 건의 줄은 맨 위로 옮김(2026-10-08 14:42 마카오 시각 「하규야 힘내라하고 연락처가 아래 있다 위로 올려」)
      note: (() => { const t = document.getElementById('topnote'), tp = document.getElementById('top'), a = t?.querySelector('.tn-contact a'), r = t?.getBoundingClientRect(), mr = document.getElementById('main')?.getBoundingClientRect();
        return {cheer: t?.querySelector('.tn-cheer')?.textContent.trim() ?? null, contact: t?.querySelector('.tn-contact')?.textContent.replace(/\s+/g, ' ').trim() ?? null, sms: a?.getAttribute('href') ?? null,
          order: tp?.nextElementSibling === t && t?.nextElementSibling?.id === 'main', top: Math.round(r?.top ?? -1), bottom: Math.round(r?.bottom ?? -1), barBottom: Math.round(tp?.getBoundingClientRect().bottom ?? -1), mainTop: Math.round(mr?.top ?? -1)}; })(),
      sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth}));
    check(`${label} 「한국 주식시장 안내」(#/guide): 갈래 ${gd.secs.length}개(${gd.secs.join(' · ')}) · 줄 ${gd.rows}개 · 줄마다 출처 주소(없는 줄 ${gd.noSrc}) · 단위 글자 「${gd.units}」 · 아래 탭 「처음」 눌림 · 「‹ 처음」 · 맨 아래 안내 고리 · 「광고 · 유료 결제 없음」 · 맨 위(위 막대 ${gd.note.barBottom}px 바로 아래 ${gd.note.top}~${gd.note.bottom}px) 「${gd.note.cheer}」 · 「${gd.note.contact}」(${gd.note.sms}) · 맨 아래에는 두 줄이 없음 · 옆으로 넘치지 않음`,
      gd.hash === '#/guide' && gd.title === '한국 주식시장 안내' && gd.active === undefined && gd.secs.join() === '시장,시간(한국 시각),규칙,계좌,세금(2026년),읽는 법' && gd.rows === 22 && gd.noSrc === 0 && gd.back === '#/start' && gd.units === '만억조'
        && gd.foot.guide === '#/guide' && !gd.foot.dup && /광고 · 유료 결제 없음$/.test(gd.foot.promise ?? '') && gd.sw <= gd.cw
        && gd.note.cheer === '하규 화이팅! 비서실장 화이팅' && gd.note.contact === '건의는 카톡이나 문자로 010-9011-7377' && gd.note.sms === 'sms:+821090117377' && gd.note.order && gd.note.top >= gd.note.barBottom - 1 && gd.note.bottom <= gd.note.mainTop + 1, gd);
    await wordsCheck(page, `${label} 「한국 주식시장 안내」`);
  }
  // ⑤-5 500만 원을 오래 들고 있었다면(#/long · 2026-10-07 05:27) · 한국 주식시장은 몇 위인가(#/korea · 05:29) — 규칙 24 · 숫자는 view-long.js LONG · view-korea.js RANKS 와 맞댐
  {
    await page.goto(base + '/#/start', {waitUntil: 'networkidle'}); await page.waitForSelector('.st-page'); await page.waitForTimeout(200);
    const cards = await page.evaluate(() => [...document.querySelectorAll('.st-page a.gd-card')].map(a => a.getAttribute('href')));
    const promise6 = await page.evaluate(() => [...document.querySelectorAll('.b-promise-box li')].map(x => x.textContent.trim()).find(x => x.includes('그때 샀다면 얼마')) ?? null);
    check(`${label} 「처음」 탭 카드 ${cards.length}개(${cards.join(' · ')}) · 하지 않는 일 「${promise6}」`, cards.join() === '#/guide,#/long,#/korea,#/learn'
      && promise6 === '「그때 샀다면 얼마」 같은 가정 수익은 「500만 원을 오래 들고 있었다면」 한 화면에서만 셈합니다 — 지난 기록에서 가장 나빴던 때로', {cards, promise6});
    const tL = page.locator('.st-page a.gd-card[href="#/long"]'); if (mobile) await tL.tap(); else await tL.click(); await page.waitForSelector('.lt-page .lt-row'); await page.waitForTimeout(1300);
    const readL = () => page.evaluate(() => ({hash: location.hash, title: document.querySelector('.lt-page .b-title')?.textContent.trim(), active: document.querySelector('.bottom-link.active')?.dataset.route,
      when: document.querySelector('.lt-page .b-when')?.textContent.trim(), hero: [...document.querySelectorAll('section[data-art="long"] .bc-row')].map(r => [r.querySelector('.bc-name')?.textContent.trim(), ...(r.querySelector('.bc-val')?.textContent.split(' · ').map(x => x.trim()) ?? [])]), // 2026-10-09 항아리 그림 → 같은 축 막대(규칙 42) — 같은 여섯 숫자(해마다 주식 · 서울 아파트)
      pressed: document.querySelector('.lt-seg button[aria-pressed="true"]')?.textContent.trim(), secs: [...document.querySelectorAll('.lt-sec .lt-h')].map(x => x.textContent.trim()), warn: document.querySelectorAll('.lt-sec .lt-warn').length,
      rows: document.querySelectorAll('.lt-row').length, bars: document.querySelectorAll('.lt-row .lt-fill').length, none: document.querySelectorAll('.lt-row .lt-none').length,
      price: document.querySelector('.lt-price')?.textContent.trim(), src: [...document.querySelectorAll('.lt-src a')].filter(a => /^https:\/\//.test(a.getAttribute('href') ?? '')).length,
      sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth}));
    const l10 = await readL();
    check(`${label} 「500만 원을 오래 들고 있었다면」(#/long): 맨 위 그림(같은 축 막대 여섯) ${l10.hero.map(x => x.join(' ')).join(' / ')} · 「${l10.pressed}」 눌림 · 갈래 ${l10.secs.length}개 · 줄 ${l10.rows}개(막대 ${l10.bars} · 셈하지 않음 ${l10.none}) · 경고 ${l10.warn}곳 · 출처 ${l10.src}곳 · 앞날 값 아님 · 기준 종가 · 넘침 없음`,
      l10.hash === '#/long' && l10.title === '500만 원을 오래 들고 있었다면' && l10.active === undefined && /앞날 값이 아닙니다/.test(l10.when ?? '') && /2025년 12월 30일\(화\) 종가까지/.test(l10.when ?? '')
        && JSON.stringify(l10.hero) === JSON.stringify([['10년 뒤', '349만 원', '493만 원'], ['20년 뒤', '785만 원', '1,098만 원'], ['30년 뒤', '1,604만 원', '1,760만 원']])
        && l10.pressed === '10년 뒤' && l10.secs.join() === '시장 전체,아파트,성장 기업,이름난 회사,독점 기업,고배당' && l10.warn === 2 && l10.rows === 14 && l10.bars === 14 && l10.none === 0 && l10.src >= 11 && l10.sw <= l10.cw, l10);
    for (const [y, bars, none, price] of [['30', 6, 8, '물가: 처음 500만 원의 값을 지키려면 1,106만 원(1995년~2025년)'], ['20', 13, 1, '물가: 처음 500만 원의 값을 지키려면 783만 원(2005년~2025년)']]) {
      const b = page.locator(`.lt-seg button[data-y="${y}"]`); if (mobile) await b.tap(); else await b.click(); await page.waitForTimeout(250);
      const r = await readL();
      check(`${label} 「${y}년 뒤」 누름: 막대 ${r.bars}개 · 「기록이 짧아 셈하지 않음」 ${r.none}줄 · 「${r.price}」`, r.pressed === `${y}년 뒤` && r.bars === bars && r.none === none && r.rows === 14 && r.price === price && r.sw <= r.cw, r);
    }
    await wordsCheck(page, `${label} 「500만 원을 오래 들고 있었다면」`);
    await page.goto(base + '/#/start', {waitUntil: 'networkidle'}); await page.waitForSelector('.st-page'); await page.waitForTimeout(200);
    const tK = page.locator('.st-page a.gd-card[href="#/korea"]'); if (mobile) await tK.tap(); else await tK.click(); await page.waitForSelector('.kr-page .kr-row'); await page.waitForTimeout(400);
    const kr = await page.evaluate(() => ({hash: location.hash, title: document.querySelector('.kr-page .b-title')?.textContent.trim(), active: document.querySelector('.bottom-link.active')?.dataset.route,
      when: document.querySelector('.kr-page .b-when')?.textContent.trim(),
      rows: [...document.querySelectorAll('.kr-row')].map(r => ({w: r.querySelector('.kr-w')?.textContent.trim(), v: r.querySelector('.kr-v')?.textContent.trim(), rank: r.querySelector('.kr-rank b')?.textContent.trim(),
        cells: r.querySelectorAll('.kr-strip .kr-c').length, me: [...r.querySelectorAll('.kr-strip .kr-c')].findIndex(c => c.classList.contains('kr-me')), meN: r.querySelectorAll('.kr-strip .kr-me').length})),
      logic: document.querySelectorAll('.kr-logic li').length, src: [...document.querySelectorAll('.kr-src a')].filter(a => /^https:\/\//.test(a.getAttribute('href') ?? '')).length,
      sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth}));
    const want = [['15.74%', 2, 25], ['151.66%', 1, 25], ['13.70%', 1, 13], ['10.25배', 3, 25], ['2.29배', 15, 25], ['0.81%', 25, 25], ['32.71%', 1, 25], ['0.53배', 8, 25], ['4.04조 달러', 8, 22], ['57.1%', 8, 12]];
    const stripOk = kr.rows.length === want.length && kr.rows.every((r, i) => r.v === want[i][0] && r.rank === `${want[i][2]}곳 중 ${want[i][1]}위` && r.cells === want[i][2] && r.me === want[i][1] - 1 && r.meN === 1);
    check(`${label} 「한국 주식시장은 몇 위인가」(#/korea): 순위 ${kr.rows.length}가지(${kr.rows.map(r => `${r.w} ${r.rank}`).join(' · ')}) · 순위 띠의 한국 칸 자리 · 숫자를 함께 보면 ${kr.logic}줄 · 출처 ${kr.src}곳 · 기준 종가 · 넘침 없음`,
      kr.hash === '#/korea' && kr.title === '한국 주식시장은 몇 위인가' && kr.active === undefined && /2026년 9월 30일\(수\) 종가 기준/.test(kr.when ?? '') && stripOk && kr.logic === 6 && kr.src >= 6 && kr.sw <= kr.cw, kr);
    await wordsCheck(page, `${label} 「한국 주식시장은 몇 위인가」`);
  }
  // ⑤-7 읽는 법 연습 「같은 평균, 다른 구조」(#/learn · 2026-10-09 셋째 개정본 0-E · 18-A) — 연습용 세 묶음(검사기가 따로 셈) · 같은 축 · 묶음마다 다른 요약 · 1위 제외해 비교
  {
    const SETS = {A: [6, 5, 4, 3, 2], B: [24, 1, 0, -2, -3], C: [32, -2, -3, -3, -4]}, MK = 5;
    const statW = v => { const s = [...v].sort((a, b) => a - b), sum = v.reduce((t, x) => t + x, 0), m = sum / v.length, top = Math.max(...v), ex = (sum - top) / (v.length - 1); return {m, md: s[2], up: v.filter(x => x > 0).length, ex, gap: m - MK, c0: top / v.length, rest: m - top / v.length}; };
    await page.goto(base + '/#/learn', {waitUntil: 'networkidle'}); await page.waitForSelector('.lr-page .dc-row'); await page.waitForTimeout(250);
    const readLr = () => page.evaluate(() => ({pressed: document.querySelector('.lr-b[aria-pressed="true"]')?.dataset.set, title: document.querySelector('.lr-page section[data-art] .ra-t')?.textContent.trim(), cells: [...document.querySelectorAll('.lr-page .dc-cell')].map(c => c.innerText.replace(/\s+/g, ' ').trim()),
      vals: [...document.querySelectorAll('.lr-page .dc-row .bc-val')].map(x => x.textContent.trim()), idx: [...document.querySelectorAll('.lr-page .dc-row .bc-ref.idx')].map(x => x.style.getPropertyValue('--l')).join(), struct: document.querySelector('.lr-page .dc-struct')?.innerText.replace(/\s+/g, ' ').trim(),
      rows: [...document.querySelectorAll('.lr-tbl tbody tr')].map(tr => [...tr.children].map(c => c.textContent.trim())), back: document.querySelector('.lr-page .c-back')?.getAttribute('href'), active: document.querySelector('.top .tb-b[aria-current="page"]')?.dataset.view ?? null}));
    const got = {}; for (const id of ['A', 'B', 'C']) { await page.locator(`.lr-b[data-set="${id}"]`).click(); await page.waitForTimeout(120); got[id] = await readLr(); }
    const P1 = v => fpW(v), sameAxis = new Set(Object.values(got).map(g => g.idx)).size === 1;
    const lrMis = Object.entries(SETS).map(([id, v]) => { const w = statW(v), g = got[id]; return g.pressed === id && g.vals.join() === v.map(x => fpW(x)).join() && g.cells[0] === `평균(단순) ${P1(w.m)}` && g.cells[1] === `시장(가정) 대비 ${fppW(w.gap)}` && g.cells[2] === `오른 곳 ${w.up}/5곳` && g.cells[3] === `중앙값 ${P1(w.md)}` && g.cells.length === 5
      && g.struct === `구성과 기여 상승 1위 1번 종목 ${fppW(w.c0)} · 나머지 4곳 합 ${fppW(w.rest)} = 평균 ${P1(w.m)}` ? null : {id, g: {...g, rows: undefined}}; }).filter(Boolean);
    const titles = new Set(Object.values(got).map(g => g.title)), rowsW = Object.entries(SETS).map(([id, v]) => { const w = statW(v); return [`연습 ${id}`, v.map(x => fpW(x)).join(' · '), P1(w.m), P1(w.md), `${w.up}/5곳`, `${fppW(w.c0)} · ${fppW(w.rest)}`, P1(w.ex), fppW(w.gap)]; });
    check(`${label} 읽는 법 연습(#/learn): 묶음 A · B · C 모두 평균 ${fpW(4)} · 같은 축(시장(가정) 점선 자리 같음) · 요약 문장 ${titles.size}가지(같은 「좋은 업종」 문장 없음) · 오른 곳 5/2/1곳 · 중앙값 · 1위 기여와 나머지 합 = 검사기가 따로 셈 · 견주기 표 ${got.C.rows.length}줄 · 「‹ 처음」`,
      !lrMis.length && sameAxis && titles.size === 3 && JSON.stringify(got.C.rows) === JSON.stringify(rowsW) && got.C.back === '#/start' && got.C.active === 'guide', {lrMis: lrMis.slice(0, 2), sameAxis, titles: [...titles], rows: got.C.rows, rowsW});
    await page.locator('.lr-b[data-set="B"]').click(); await page.waitForTimeout(120); await page.locator('.lr-page .dc-top').click(); await page.waitForTimeout(150);
    const ex = await readLr(), wB = statW(SETS.B);
    check(`${label} 읽는 법 연습 B — 「상승 1위 제외해 비교」 → 평균 ${fpW(wB.m)} → ${fpW(wB.ex)} · 시장(가정) 대비 ${fppW(wB.gap)} → ${fppW(wB.ex - MK)} · 분모 5곳 → 4곳 · 1번 종목 줄은 제자리 「제외」`,
      ex.cells[0] === `평균(단순) ${fpW(wB.m)} → ${fpW(wB.ex)}` && ex.cells[1] === `시장(가정) 대비 ${fppW(wB.gap)} → ${fppW(wB.ex - MK)}` && ex.cells[4] === '분모(값이 있는 곳) 5곳 → 4곳' && ex.vals.length === 5, ex.cells);
    await wordsCheck(page, `${label} 읽는 법 연습`);
  }
  // ⑤-3 그림 한 장(규칙 33 · 2026-10-08 01:27 「자 이런식으로 모두 첫페이지부터 마지막까지 다해 전나라 · 다 한다」) — 옛 논평 무대(⑤-3 · 03:17)를 그림이 대신
  //   화면마다 그림 하나(section[data-art] · 회사는 값 다음) · 그림 숫자(data-check) = 검사기가 판에서 따로 센 값(art_expect.mjs · 빠짐없이 도는 검사기와 같은 셈)
  //   그림엔 글자 없음(svg text 0) · 이름 · 숫자 칸이 첫 화면 아래 탭 위 · 옆으로 넘치지 않음 · 옛 논평 무대 없음 · 기승전결 걸음 넷 이상
  {
    // 주소 # 만 바뀌면 같은 문서 — 앞 화면 그림에 표를 해 두고 새 그림이 뜰 때까지 기다림(찾기는 다른 판 넷을 함께 받아 늦게 그려짐)
    const artRead = async hash => { await page.evaluate(() => document.querySelectorAll('section[data-art]').forEach(x => x.setAttribute('data-old', ''))).catch(() => {}); await page.goto(base + '/' + hash, {waitUntil: 'networkidle'}); await page.waitForSelector('section[data-art]:not([data-old])', {timeout: 15000}).catch(() => {}); await page.waitForTimeout(400);
      return page.evaluate(() => { const s = document.querySelector('section[data-art]:not([data-old])'), labs = [...(s?.querySelectorAll('.ra-lab') ?? [])], chk = s?.querySelector('[data-check]');
        return {n: document.querySelectorAll('section[data-art]:not([data-old])').length, cm: document.querySelectorAll('.cm').length, key: s?.dataset.art ?? null, check: chk ? JSON.parse(chk.dataset.check) : null,
          svgText: s ? s.querySelectorAll('svg text').length : -1, done: !!s?.querySelector('.ra.ra-done'), // 2026-10-09 처음에는 최신 결과가 멈춘 채로(「ATLAS 업데이트 실행 프롬프트」 7)
          top: s ? Math.round(s.getBoundingClientRect().top + scrollY) : null, labBottom: labs.length ? Math.round(Math.max(...labs.map(x => x.getBoundingClientRect().bottom)) + scrollY) : null,
          tab: Math.round(document.getElementById('bottom')?.getBoundingClientRect().top ?? innerHeight), ih: innerHeight, sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth,
          steps: Number(s?.querySelector('.ra')?.dataset.steps ?? 0), beats: [...(s?.querySelectorAll('.ra-beat') ?? [])].map(b => b.textContent.trim()).join(), btns: [...(s?.querySelectorAll('.ra-btns button') ?? [])].map(b => b.textContent.trim())}; }); };
    const others = [];
    for (const p of (await get('places.json')).places) { const bd = await get((p.href === '/' ? '' : p.href.replace(/^\//, '')) + 'data/atlas11/view/board.json'); others.push({id: p.id, label: p.label, n: bd.companies.length}); }
    const manK = await get('data/atlas11/view/manifest.json'), lensK = await get('data/atlas11/view/lens.json').catch(() => null); // 판 읽기(2026-10-08 20:19 지시서) — 그림 숫자 기대값(빠짐없이 도는 검사기와 같은 셈)
    const stockFilesK = await Promise.all(board.companies.map(c => fs.readFile(path.join(process.cwd(), 'dist/data/atlas11/view/stocks', c.code + '.json'), 'utf8').then(JSON.parse).catch(() => null)));
    const evDirK = path.join(process.cwd(), 'public/data/atlas11/evening', String(manK.universeSet?.id ?? 'none').replace(/[^A-Za-z0-9._-]/g, '_')), recordsK = new Set([...(await fs.readdir(evDirK).catch(() => [])), ...(await fs.readdir(path.join(process.cwd(), 'public/data/atlas11/cand', String(manK.universeSet?.id ?? 'none').replace(/[^A-Za-z0-9._-]/g, '_'))).catch(() => []))].filter(n => /^\d{4}-\d{2}-\d{2}\.json$/.test(n))).size; // 저녁 기록 + 후보 발행본(날짜마다 한 장)
    const E = expectOf('kr', board, agenda, await get('story.json'), await get('changelog.json'), others, lensK, {market: manK.market, flow5: flowExpect(stockFilesK), records: recordsK}), fam0 = familiesByRise(board.groups).filter(f => Number.isFinite(f.avg))[0].fam.id, g0 = board.groups[0];
    const C0 = lensK?.cand?.ready ? lensK.cand.items : [];
    const rows = [['후보 7', '#/', E.cand, true], ['다른 후보와 비교', C0.length >= 2 ? `#/compare/${C0[0].code}/${C0[1].code}` : '#/compare', E.compare, true], ['시장', '#/market', E.market, true], ['업종 탭', '#/sectors', E.sectors, true], ['불장', '#/hot', E.home], ['투자자 매매', '#/flow', E.flowwho, true], ['종목', '#/stocks', E.stocks, true], ['검증', '#/check', E.check, true], ['관심종목', '#/watch', E.watch, true], ['지도', '#/map', E.map], ['지도 갈래', '#/map/f/' + fam0, E.land[fam0]], ['업종', '#/i/' + g0.id, E.ind[g0.id]], ['회사', '#/stock/005930', E.co['005930']], ['예비', '#/similar', E.similar], ['오름 상위', '#/rise', E.rise],
      ['출목표', '#/road', E.road], ['일정', '#/agenda', E.agenda], ['읽는 법 연습', '#/learn', E.learn, true], ['기록', '#/log', E.log], ['처음', '#/start', E.start], ['안내', '#/guide', null], ['500만 원', '#/long', null], ['몇 위', '#/korea', null]];
    const got = [];
    for (const [nm, hs, want, info] of rows) { const r = await artRead(hs); const miss = []; const nums = want ? compare(r.check, want, w => miss.push(w)) : (r.check ? 0 : (miss.push('그림 값 없음'), 0)); got.push({nm, hs, ...r, miss, nums, info: !!info}); }
    const BEATS_W = '관측과 비교,구성과 기여,반대 근거,확인할 것', BTNS_W = '처음으로,‹,재생,›,최신 결과,빠르기 1배'; // 차례 넷(기승전결) · 조작 여섯(처음 · 이전 · 재생/정지 · 다음 · 최신 결과 · 빠르기)
    const badArt = got.filter(r => r.n !== 1 || r.cm !== 0 || r.svgText !== 0 || !r.done || r.steps < 4 || r.beats !== BEATS_W || r.btns.join() !== BTNS_W || r.sw > r.cw || r.labBottom == null || (mobile && !r.info && r.labBottom > r.tab + 0.5) || r.miss.length); // 한 화면 = 휴대폰(규칙 30) · 판단 정보가 먼저인 화면(시장 · 투자자 매매 · 종목 · 검증 · 관심종목)은 그림이 정보 아래(지시서 4)
    check(`${label} 그림 한 장(규칙 33 · 42): 화면 ${got.length}곳 — ${got.map(r => `${r.nm} ${r.key}`).join(' · ')} · 화면마다 자료 차트 하나 · 옛 논평 무대 없음 · 처음에는 최신 결과(멈춤) · 걸음 넷 · 차례 단추 넷(현재 관측 · 기여 요인 · 반대 근거 · 확인할 것) · 조작 여섯(처음으로 · ‹ · 재생 · › · 최신 결과 · 빠르기) · 이름 · 숫자가 첫 화면 아래 탭 위 · 그림 숫자 ${got.reduce((t, r) => t + r.nums, 0)}개 = 검사기가 판에서 따로 센 값`,
      badArt.length === 0, badArt.length ? badArt.map(r => ({nm: r.nm, n: r.n, cm: r.cm, svgText: r.svgText, done: r.done, steps: r.steps, beats: r.beats, btns: r.btns, lab: r.labBottom, tab: r.tab, sw: r.sw, miss: r.miss.slice(0, 3)})) : undefined);
  }
  // ⑤-6 업종 순환(#/flow/rotation · 2026-10-09 아래 탭 「업종」 안) — 그림 = 같은 축 막대(늘어난 곳 · 줄어든 곳 1~3위 — 「ATLAS 업데이트 실행 프롬프트」 7 「금빛 자금 이동 → 정확히 이름 붙인 상대 시가총액 비교」)
  //   처음에는 최신 결과가 멈춘 채로 · 「재생」을 누르면 차례 넷(현재 관측 → 기여 요인 → 반대 근거 → 확인할 것)이 한 걸음씩(한 번에 한 걸음만 움직임) · 처음으로 · ‹ · › · 최신 결과 · 빠르기
  //   동작 줄이기 설정이면 움직임 없이 같은 정보 · 아래 「기사로 본 돈 이야기」(접힘 · 2026-10-07 16:34 「[이 일이 생겼다] → [그래서 여기가 돈을 받는다] ⇢ [다음은 여기가 필요하다]」) · 맨 아래 결 — 모두 /story.json 과 같음
  {
    const st = await (await fetch(base + '/story.json')).json(), rot = st.rotation && !st.rotation.none && st.rotation.pair ? st.rotation : null;
    const korD = d => { const x = new Date(d + 'T00:00:00Z'); return `${x.getUTCMonth() + 1}월 ${x.getUTCDate()}일(${'일월화수목금토'[x.getUTCDay()]})`; };
    const amtTxt = v => `${v > 0 ? '+' : v < 0 ? '−' : ''}${(Math.abs(v) / 1e4).toFixed(Math.abs(v) >= 1e4 ? 1 : 2)}조 원`;
    const BEATS_R = '관측과 비교,구성과 기여,반대 근거,확인할 것', BTNS_R = '처음으로,‹,재생,›,최신 결과,빠르기 1배';
    await page.goto(base + '/#/flow/rotation', {waitUntil: 'networkidle'}); await page.waitForSelector('.fl-page section.rt, .fl-page section[data-art]', {timeout: 15000}).catch(() => {}); await page.waitForTimeout(300);
    const sy = await page.evaluate(() => { for (const d of document.querySelectorAll('.sy-news details, .sy-more details')) d.open = true; // 기사 이야기 · 근거 모음은 접혀 있음 → 펼쳐서 잼
      const ps = document.querySelector('.fl-page section.rt'), s = document.querySelector('.sy.sy-news'), first = document.querySelector('.fl-page > section'), q = sel => s?.querySelector(sel);
      return {first: !!ps && first === ps, newsAfter: !!(ps && s && (ps.compareDocumentPosition(s) & Node.DOCUMENT_POSITION_FOLLOWING)), news: !!s, cm: document.querySelectorAll('.fl-page .cm').length, newsPlay: s?.querySelectorAll('.sy-play').length ?? -1,
        rt: ps ? {from: ps.dataset.from, to: ps.dataset.to, k: ps.querySelector('.sy-k > span')?.textContent.trim(), kw: ps.querySelector('.sy-kw')?.textContent.trim(), period: ps.querySelector('.ra-t')?.textContent.replace(/\s+/g, ' ').trim(),
          lab: ps.querySelector('.ra-lab')?.innerText.replace(/\s+/g, ' ').trim(), subs: [...ps.querySelectorAll('.ra .bc-sub')].map(x => x.textContent.trim()).join(),
          rows: [...ps.querySelectorAll('.ra .bc-row')].map(r => [r.closest('[data-at]')?.dataset.at ?? null, r.dataset.id, r.querySelector('.bc-rk')?.textContent.trim() ?? null, r.querySelector('.bc-name')?.textContent.trim(), r.querySelector('.bc-val')?.textContent.replace(/\s+/g, ' ').trim(), r.querySelector('a.bc-name')?.getAttribute('href') ?? null]),
          tail: [...ps.querySelectorAll('.ra-tail .ra-li')].map(x => [x.dataset.at, x.innerText.replace(/\s+/g, ' ').trim()]), waves: [...ps.querySelectorAll('.rw li')].map(x => [x.dataset.n, x.querySelector('.rw-l')?.textContent.trim()]),
          cols: [...ps.querySelectorAll('.rt-col')].map(c => [c.dataset.side, c.querySelectorAll('.rt-li').length].join(':')).join(), how: !!ps.querySelector('details.rt-how:not([open])'), svgText: ps.querySelectorAll('svg text').length,
          done: !!ps.querySelector('.ra.ra-done'), step: ps.querySelector('.ra')?.dataset.step ?? null, steps: ps.querySelector('.ra')?.dataset.steps ?? null,
          beats: [...ps.querySelectorAll('.ra-beat')].map(x => x.textContent.trim()).join(), btns: [...ps.querySelectorAll('.ra-btns button')].map(x => x.textContent.trim()).join()} : null,
        scenes: [...(s?.querySelectorAll('.sy-s') ?? [])].map(x => x.classList[1]), titles: [...(s?.querySelectorAll('.sy-t') ?? [])].map(x => x.textContent.replace(/\s+/g, ' ').trim()),
        role: q('.sy-role')?.textContent.trim() ?? null, role3: q('.sy-role3')?.textContent.trim() ?? null,
        dashed: q('.sy-s3 .sy-c') && q('.sy-s3 .sy-node') ? [getComputedStyle(q('.sy-s3 .sy-c')).borderTopStyle, getComputedStyle(q('.sy-s3 .sy-node')).borderTopStyle].join() : null,
        lineDash: q('.sy-dash .sy-rl') ? getComputedStyle(q('.sy-dash .sy-rl')).borderInlineStartStyle : null,
        end: (() => { const e = document.querySelector('.fl-page > .sy-end'); return e ? {last: e.nextElementSibling?.matches('.b-foot, footer, [class*="foot"]') ?? false, rt: e.classList.contains('rt-end'), m: e.querySelector('.sy-end-m')?.textContent.trim(), s: [...e.querySelectorAll('.sy-end-s')].map(x => x.textContent.replace(/\s+/g, ' ').trim())} : null; })(),
        rail: [...(s?.querySelectorAll('.sy-s') ?? [])].map(x => { const n = x.querySelector(':scope > .sy-rail .sy-node'); return n ? {svg: !!n.querySelector('svg'), hidden: n.closest('[aria-hidden="true"]') ? 'true' : null, w: n.offsetWidth} : null; }),
        railCoins: s?.querySelectorAll('.sy-s .sy-coin, .sy-line .sy-coin').length ?? -1, picText: [...(s?.querySelectorAll('.sy-rail, .sy-ifi, .sy-ok') ?? [])].reduce((t, x) => t + x.textContent.trim().length, 0),
        ifs: [...(s?.querySelectorAll('.sy-if p') ?? [])].map(p => p.textContent.replace(/\s+/g, ' ').trim()), lastIsIf: !!(s?.querySelector(':scope > details.sy-fd') ?? s)?.lastElementChild?.classList.contains('sy-if'),
        roleFs: q('.sy-role') ? parseFloat(getComputedStyle(q('.sy-role')).fontSize) : 0, role3Fs: q('.sy-role3') ? parseFloat(getComputedStyle(q('.sy-role3')).fontSize) : 0, mainFs: q('.sy-main') ? parseFloat(getComputedStyle(q('.sy-main')).fontSize) : 0,
        predOk: [...document.querySelectorAll('[data-pred-ok]')].map(x => x.textContent.trim()),
        ev: [...document.querySelectorAll('.sy .sy-e, .sy-more .sy-e')].map(li => ({date: li.querySelector('.sy-ed')?.textContent.trim() ?? null, href: li.querySelector('a.sy-et')?.getAttribute('href') ?? null, kind: li.dataset.kind})),
        sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth}; });
    if (!rot) check(`${label} 업종 순환: 판정할 순환이 없는 날 — 빈 축 그림(지어내지 않음)`, !sy.rt && (await page.evaluate(() => JSON.parse(document.querySelector('.fl-page section[data-art] [data-check]')?.dataset.check ?? '{}').quiet)) === 'flow', sy);
    else {
      const rpr = rot.pair, since = `${korD(rpr.start)}부터 · ${rpr.days}거래일${rpr.atLeast ? ' 넘게' : '째'}`, fomoTxt = Number.isFinite(rot.fomo.to) ? `${Math.round(rot.fomo.to)}점` : '없음';
      const ACT = {foreign: '외국인', institution: '기관', individual: '개인'}, wa = rot.out[0]?.who, wb = rot.in[0]?.who;
      const sell = wa ? Object.entries(wa).sort((x, y) => x[1] - y[1])[0] : null, buy = wb ? Object.entries(wb).sort((x, y) => y[1] - x[1])[0] : null;
      const sellT = sell && sell[1] < 0 ? ACT[sell[0]] : '없음', buyT = buy && buy[1] > 0 ? ACT[buy[0]] : '없음';
      const ins = rot.in.slice(0, 3), outs = rot.out.slice(0, 3), R = sy.rt;
      const rowsW = [...ins.map((x, i) => ['0', x.id, `${i + 1}위`, x.label, amtTxt(x.amount), '#/i/' + x.id]), ...outs.map((x, i) => ['1', x.id, `${i + 1}위`, x.label, amtTxt(x.amount), '#/i/' + x.id])];
      const tailW = [['2', `반대 근거 시장 대비 값 — 실제 투자금 유입액 아님 · 추정 시작일은 나중에 확인한 날 · 포모값 ${fomoTxt}(${rot.fomo.toWord ?? '없음'} · 실험 · 검증 전)`], ['3', `확인할 것 ${rot.flows ? `판 쪽 ${sellT} · 산 쪽 ${buyT} · ` : ''}업종을 누르면 구성 종목`]];
      const figOk = !!R && sy.first && R.from === rpr.from.id && R.to === rpr.to.id && R.k === '업종 순환' && R.kw === `지난 ${rot.window.days}거래일 · ${korD(rot.asOf)} 종가까지` && R.period === `${korD(rpr.start)}부터 ${rpr.days}거래일${rpr.atLeast ? ' 넘게' : '째'}`
        && R.lab === `늘어난 곳 1위 ${rot.in[0].label} ${amtTxt(rot.in[0].amount)} · 줄어든 곳 1위 ${rot.out[0].label} ${amtTxt(rot.out[0].amount)}` && R.subs === '늘어난 곳,줄어든 곳' && JSON.stringify(R.rows) === JSON.stringify(rowsW)
        && rot.out.every((x, k) => k === 0 || rot.out[k - 1].amount <= x.amount) && rot.in.every((x, k) => k === 0 || rot.in[k - 1].amount >= x.amount)
        && JSON.stringify(R.tail) === JSON.stringify(tailW) && JSON.stringify(R.waves) === JSON.stringify((rot.waves ?? []).map(x => [String(x.n), x.to.label]))
        && R.cols === `out:${rot.out.length},in:${rot.in.length}` && R.how && R.svgText === 0 && R.done && R.step === '3' && R.steps === '4' && R.beats === BEATS_R && R.btns === BTNS_R && sy.cm === 0 && sy.sw <= sy.cw;
      check(`${label} 업종 순환 그림: 같은 축 막대 — 늘어난 곳 ${ins.map(x => x.label).join(' · ')} · 줄어든 곳 ${outs.map(x => x.label).join(' · ')}(시장 대비 시가총액 변화 · 금액 · 1~3위 = /story.json) · 「${R?.lab ?? ''}」 · 반대 근거 「실제 투자금 유입액 아님 · 포모값 ${fomoTxt}(실험 · 검증 전)」 · 강세 파장 ${R?.waves?.length ?? 0} · 처음에는 최신 결과(멈춤) · 차례 넷 · 조작 여섯`,
        figOk, figOk ? undefined : {R, rowsW, tailW});
      check(`${label} 기사로 본 돈 이야기(접힘 · 업종 순환 그림 아래): ${sy.scenes.join(' → ')} · 「${sy.role}」 ⇢ 「${sy.role3}」 = /story.json(${st.chain}) · 가운데 장면 글씨가 가장 큼(${sy.roleFs}px) · 다음 장면 · 그리로 가는 선 점선 · 「예상」 · 맨 끝 두 줄 · 짚어 주기 없음 · 돈길 동전 ${sy.railCoins}`,
        sy.news && sy.newsAfter && sy.newsPlay === 0 && sy.scenes.join() === 'sy-s1,sy-s2,sy-s3' && sy.titles[0] === '이 일이 생겼다' && sy.titles[1] === '그래서 여기가 돈을 받는다' && sy.titles[2] === '다음은 여기가 필요하다 예상'
          && sy.role === st.now.role && sy.role3 === st.next.role && sy.roleFs > sy.role3Fs && sy.roleFs > sy.mainFs && sy.dashed === 'dashed,dashed' && sy.lineDash === 'dashed'
          && sy.lastIsIf && sy.ifs.length === 2 && sy.ifs[0] === `이것이 확인되면 이어집니다: ${st.confirm}` && sy.ifs[1] === `이것이 나타나면 다시 판단합니다: ${st.rethink}`
          && sy.rail.length === 3 && sy.rail.every(r => r && r.svg && r.hidden === 'true') && sy.picText === 0 && sy.railCoins === 0, {scenes: sy.scenes, titles: sy.titles, role: sy.role, role3: sy.role3, fs: [sy.roleFs, sy.role3Fs, sy.mainFs], ifs: sy.ifs, rail: sy.rail, railCoins: sy.railCoins});
      const en = sy.end;
      check(`${label} 업종 순환 — 맨 아래 결: 「${en?.m ?? ''}」 · ${en?.s?.join(' · ') ?? ''}`, !!en && en.last && en.rt && en.m === `${rpr.from.label} → ${rpr.to.label}` && en.s[0] === since && en.s[1] === `포모값 ${fomoTxt} · ${rot.fomo.toWord ?? '없음'}`, en);
      const evOk = sy.ev.length > 0 && sy.ev.every(e => /^\d{1,2}월 \d{1,2}일\(.\)$/.test(e.date ?? '') && e.href && /^https:\/\//.test(e.href) && ['real', 'capex', 'stock', 'hype', 'report'].includes(e.kind));
      check(`${label} 기사로 본 돈 이야기 근거 ${sy.ev.length}줄: 줄마다 날짜 · 갈래 · 기사 주소(https) · 앞날 말 검사에서 빼는 낱말은 「예상 · 기대감 · 수혜 기대」뿐(${[...new Set(sy.predOk)].join(' · ')})`,
        evOk && sy.predOk.length > 0 && sy.predOk.every(x => ['예상', '기대감', '수혜 기대'].includes(x)), {ev: sy.ev.slice(0, 4), predOk: sy.predOk});
      // 처음 연 새 문서 — 1.5초 동안 그림 안에서 움직이는 것 0 · 최신 결과(걸음 3) · 「재생」 → 걸음 0 · 1 · 2 · 3 차례로 · 한 번에 한 걸음만 움직임 · 끝나면 다시 최신 결과 · 단추 「정지」 → 「재생」
      await page.goto(base + '/?r=' + Date.now() + '#/flow/rotation', {waitUntil: 'networkidle'}); await page.waitForSelector('.fl-page section.rt .ra', {timeout: 15000}).catch(() => {});
      const pl = await page.evaluate(async () => {
        const ra = document.querySelector('.fl-page section.rt .ra'); if (!ra) return null;
        const runIn = () => document.getAnimations().filter(a => a.playState === 'running' && a.effect?.target?.closest?.('.ra') === ra && !a.effect.target.closest('[aria-pressed], #bottom'));
        let idle = 0; const t0 = performance.now(); while (performance.now() - t0 < 1500) { idle = Math.max(idle, runIn().length); await new Promise(r => setTimeout(r, 50)); }
        const start = {done: ra.classList.contains('ra-done'), step: ra.dataset.step, idle};
        const play = ra.querySelector('.ra-play'); play.click(); const btn0 = play.textContent; let most = 0; const steps = [], pairs = new Set(); const t1 = performance.now();
        await new Promise(res => { const f = () => { const as = new Set(runIn().map(a => a.effect.target.closest('[data-at]')?.dataset.at ?? '?')); most = Math.max(most, as.size);
          if (steps.at(-1) !== ra.dataset.step) steps.push(ra.dataset.step); pairs.add(`${ra.dataset.step}:${[...ra.querySelectorAll('.ra-beat')].findIndex(x => x.getAttribute('aria-pressed') === 'true')}`);
          if (ra.classList.contains('ra-done') || performance.now() - t1 > 15000) res(); else requestAnimationFrame(f); }; requestAnimationFrame(f); });
        return {start, btn0, most, steps: steps.join(), pairs: [...pairs], end: {done: ra.classList.contains('ra-done'), step: ra.dataset.step, btn: play.textContent}, ms: Math.round(performance.now() - t1)};
      });
      check(`${label} 업종 순환 — 처음 1.5초 움직임 ${pl?.start.idle ?? '없음'}개 · 최신 결과(걸음 ${pl?.start.step}) · 「재생」 → 걸음 ${pl?.steps} · 한 번에 움직인 걸음 가장 많을 때 ${pl?.most}개 · 차례 단추가 걸음을 따라 눌림 · ${pl?.ms}ms 뒤 다시 최신 결과 · 단추 「${pl?.btn0}」 → 「${pl?.end.btn}」`,
        !!pl && pl.start.done && pl.start.step === '3' && pl.start.idle === 0 && pl.btn0 === '정지' && pl.steps === '0,1,2,3' && pl.most <= 1 && ['0:0', '1:1', '2:2', '3:3'].every(x => pl.pairs.includes(x)) && pl.end.done && pl.end.step === '3' && pl.end.btn === '재생', pl);
      // 조작 — 처음으로 · › · ‹ · 차례 단추(반대 근거) · 최신 결과 · 빠르기 · 재생 → 정지(멈춘 자리 그대로)
      const ctl = await page.evaluate(() => { const ra = document.querySelector('.fl-page section.rt .ra'), q = c => ra.querySelector(c), now = () => [ra.dataset.step, ra.classList.contains('ra-done'), [...ra.querySelectorAll('.ra-beat')].findIndex(x => x.getAttribute('aria-pressed') === 'true')].join(':'); const out = {};
        q('.ra-first').click(); out.first = now(); q('.ra-next').click(); out.next = now(); q('.ra-prev').click(); out.prev = now();
        ra.querySelectorAll('.ra-beat')[2].click(); out.beat2 = now(); q('.ra-last').click(); out.last = now();
        q('.ra-speed').click(); out.speed = [q('.ra-speed').textContent, q('.ra-speed').getAttribute('aria-pressed')].join(':'); q('.ra-speed').click(); out.speed1 = q('.ra-speed').textContent;
        q('.ra-play').click(); out.play = [now(), q('.ra-play').textContent].join(':'); q('.ra-play').click(); out.pause = [now(), q('.ra-play').textContent].join(':'); q('.ra-last').click(); out.back = now(); return out; });
      check(`${label} 업종 순환 — 조작: 처음으로 ${ctl.first} · › ${ctl.next} · ‹ ${ctl.prev} · 「반대 근거」 ${ctl.beat2} · 최신 결과 ${ctl.last} · 빠르기 ${ctl.speed} · 재생 ${ctl.play} · 정지 ${ctl.pause}`,
        ctl.first === '0:false:0' && ctl.next === '1:false:1' && ctl.prev === '0:false:0' && ctl.beat2 === '2:false:2' && ctl.last === '3:true:-1' && ctl.speed === '빠르기 2배:true' && ctl.speed1 === '빠르기 1배' && ctl.play === '0:false:0:정지' && ctl.pause === '0:false:0:재생' && ctl.back === '3:true:-1', ctl);
      // 한 화면 — 키가 낮은 휴대폰(390×640 · 360×640 · 430×700)에서 요약 한 줄(늘어난 곳 1위 · 줄어든 곳 1위)이 위 막대와 아래 탭 사이 첫 화면 안에
      const fits = [];
      for (const [w, hh] of [[390, 640], [360, 640], [430, 700]]) {
        const fc = await browser.newContext({viewport: {width: w, height: hh}, isMobile: true, hasTouch: true, locale: 'ko-KR', timezoneId: 'Asia/Seoul', reducedMotion: 'reduce'}); const fp = await fc.newPage();
        await fp.goto(base + '/#/flow/rotation', {waitUntil: 'networkidle'}); await fp.waitForSelector('.fl-page section.rt .ra-lab', {timeout: 15000}).catch(() => {}); await fp.waitForTimeout(150);
        fits.push(await fp.evaluate(([w, hh]) => { const lab = document.querySelector('.fl-page section.rt .ra-lab'), top = document.getElementById('top')?.getBoundingClientRect().bottom ?? 0, tab = document.getElementById('bottom')?.getBoundingClientRect().top ?? innerHeight;
          return {w, hh, labTop: Math.round(lab?.getBoundingClientRect().top ?? -1), labBottom: Math.round(lab?.getBoundingClientRect().bottom ?? 9999), top: Math.round(top), tab: Math.round(tab), sw: document.documentElement.scrollWidth}; }, [w, hh]));
        await fc.close();
      }
      check(`${label} 업종 순환 — 한 화면에 요약: ${fits.map(f => `${f.w}×${f.hh} 요약 끝 ${f.labBottom}px ≤ 아래 탭 ${f.tab}px`).join(' · ')}`, fits.every(f => f.labTop >= f.top && f.labBottom <= f.tab && f.sw <= f.w), fits);
      // 동작 줄이기 설정(아이폰 「동작 줄이기」) — 처음부터 최신 결과 · 움직이는 것 0 · 차례 넷의 칸이 모두 보임
      const rctx = await browser.newContext({viewport, isMobile: mobile, hasTouch: mobile, locale: 'ko-KR', timezoneId: 'Asia/Seoul', reducedMotion: 'reduce'}); const rp = await rctx.newPage();
      await rp.goto(base + '/#/flow/rotation', {waitUntil: 'networkidle'}); await rp.waitForSelector('.fl-page section.rt .ra', {timeout: 15000}).catch(() => {}); await rp.waitForTimeout(200);
      const rm = await rp.evaluate(() => { const ra = document.querySelector('.fl-page section.rt .ra'); if (!ra) return null; const parts = [...ra.querySelectorAll('[data-at]')];
        return {running: document.getAnimations().filter(a => a.playState === 'running').length, done: ra.classList.contains('ra-done'), step: ra.dataset.step, ats: [...new Set(parts.map(x => x.dataset.at))].sort().join(), shown: parts.filter(x => getComputedStyle(x).opacity === '1').length, all: parts.length}; });
      await rctx.close();
      check(`${label} 업종 순환 — 동작 줄이기 설정: 처음부터 최신 결과(걸음 ${rm?.step}) · 차례 ${rm?.ats} 칸 ${rm?.shown}/${rm?.all} 모두 보임 · 움직이는 것 ${rm?.running}`, !!rm && rm.done && rm.step === '3' && rm.ats === '0,1,2,3' && rm.shown === rm.all && rm.running === 0, rm);
    }
  }
  // ⑥ 글씨 단추
  await page.goto(base + '/#/hot', {waitUntil: 'networkidle'}); await page.waitForSelector('.h-page .hs-seg'); await page.waitForTimeout(300);
  await page.locator('.top .tb-more > summary').click(); await page.waitForTimeout(150); await page.locator('#font-btn').click(); await page.waitForTimeout(200); // 글씨 단추는 위 막대 「보기」(점 셋) 안(2026-10-08 20:19 지시서 — 보조 기능을 묶음)
  const fs1 = await page.evaluate(() => [document.documentElement.style.fontSize, document.documentElement.dataset.fontStep]);
  check(`${label} 글씨 단추: 125% 로 커짐`, fs1[0] === '125%' && fs1[1] === '1', {fs1});
  { const fr = await realFailsChecked(failedRequests); check(`${label} 콘솔 오류 0 · 요청 실패 0(화면을 옮길 때 브라우저가 끊은 요청은 다시 받아 200이면 셈하지 않음)`, consoleErrors.length === 0 && fr.length === 0, {consoleErrors: consoleErrors.slice(0, 3), failedRequests: fr.slice(0, 3)}); }
  await context.close();
}

async function darkCheck() {
  // 밤 화면 바탕 = style.css 첫 어두운 덩어리의 --bg — 2026-10-05 16:29 사장님 「청자가 낫다」: 옛 밤 판 검정(#000) → 밤 청자(docs/design/celadon)
  //   검사기는 색 값을 따로 적지 않고 화면 옷(style.css)에서 읽는다 · 그 값의 글자 대비는 tests/atlas11/palette.test.mjs 가 잰다(기준 그대로)
  const css = await (await fetch(base + '/app/style.css')).text(), dm = css.indexOf('@media (prefers-color-scheme: dark)'), ra = css.indexOf(':root {', dm);
  const darkHex = css.slice(ra, css.indexOf('}', ra)).match(/--bg:\s*(#[0-9A-Fa-f]{6})/)?.[1] ?? '#000000';
  const darkBg = `rgb(${[1, 3, 5].map(i => parseInt(darkHex.slice(i, i + 2), 16)).join(', ')})`;
  const context = await browser.newContext({viewport: {width: 390, height: 844}, isMobile: true, hasTouch: true, colorScheme: 'dark', locale: 'ko-KR'});
  const page = await context.newPage();
  for (const [hash, wait, name] of [['#/', '.cd-page section[data-art]', 'cand'], ['#/compare', '.cmp-page section[data-art]', 'compare'], ['#/market', '.mk-page [data-first="5"]', 'market'], ['#/hot', '.h-page .hs-seg', 'home'], ['#/flow', '.fw-page [data-first="1"]', 'flowwho'], ['#/sectors', '.sx-page [data-first="5"]', 'sectors'], ['#/flow/rotation', '.fl-page section.rt', 'flow'], ['#/stocks', '.sk-page .sk-row', 'stocks'], ['#/check', '.ck-page [data-first="1"]', 'check'], ['#/map', '.t-tile', 'map'], ['#/i/' + (board.hot?.items?.[0]?.id ?? board.groups[0].id), '.b-card .spark', 'industry'], ['#/similar', '.s-page', 'similar'], ['#/rise', '.r-page', 'rise'], ['#/road', '.f-body[data-ready] .f-tile', 'road'], ['#/stock/' + board.companies[0].code, '.c-chart svg.lc', 'company'], ['#/agenda', '.b-box', 'agenda']]) {
    await page.goto(base + '/' + hash, {waitUntil: 'networkidle'}); await page.waitForSelector(wait); await page.waitForTimeout(300);
    const bg = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
    await page.screenshot({path: path.join(dir, `mobile-dark-${name}.png`)});
    check(`어두운 화면 ${name}: 바탕이 밤 바탕색 ${darkHex}(${bg})`, bg === darkBg, {bg, darkBg});
  }
  await context.close();
}

/* 미국 판(2026-10-05 18:02 사장님 「이제는 미국 주식도 같은 개념으로 365개를 만들어라」) — 사이트 판 목록(places.json)에 미국이 있을 때만
   같은 화면 코드가 /us/ 에서 미국 판 묶음을 읽는다: 위 막대 「한국 · 미국」 · 보던 탭 그대로 건너감 · 달러(소수 둘째 자리) · 뉴욕 16:00 종가 · 수급 · 공시 없음을 그렇다고 적음 · 무결성 */
/** 시장 고르기 — 시장이 둘이면 단추가 막대에 바로 · 셋 이상(2026-10-07 중국 · 일본 · 베트남)이면 지금 시장 단추(.mkt-cur)를 눌러 목록을 펼친 뒤 누름 */
async function pickMarket(page, id) {
  if (await page.$('.mkt-cur')) { await page.click('.mkt-cur'); await page.waitForSelector(`.mkt-menu .mkt-b[data-place="${id}"]`, {state: 'visible', timeout: 5000}); }
  await page.click(`.mkt-b[data-place="${id}"]`);
}
async function usCheck() {
  let places = null; try { places = await (await fetch(base + '/places.json')).json(); } catch {}
  const us = places?.places?.find(p => p.id === 'us');
  if (!us) { check(`미국 판: 판 목록(places.json)에 없음 → 한국 판만 · 위 막대 시장 단추 없음`, Array.isArray(places?.places) && places.places.length === 1 && places.places[0].id === 'kr', {places: places?.places ?? null}); return; }
  const ub = base + us.href.replace(/\/$/, ''), ug = async p => (await fetch(ub + '/' + p)).json();
  const um = await ug('data/atlas11/view/manifest.json'), ubd = await ug('data/atlas11/view/board.json');
  check(`미국 판 묶음: 예측 끔 · 시장 미국 · ${ubd.companies.length}곳 · 업종 ${ubd.groups.length}개`, um.prediction === 'off' && um.place?.id === 'us' && ubd.companies.length === um.companies, {companies: ubd.companies.length, groups: ubd.groups.length, asOf: um.asOf});
  const context = await browser.newContext({viewport: {width: 390, height: 844}, isMobile: true, hasTouch: true, locale: 'ko-KR', timezoneId: 'Asia/Seoul'});
  const page = await context.newPage(), errs = [], failed = [];
  page.on('console', m => { if (m.type() === 'error') errs.push(m.text()); }); page.on('pageerror', e => errs.push('pageerror: ' + e.message));
  page.on('requestfailed', r => failed.push(abortedOk(r))); page.on('response', r => { if (r.status() >= 400) failed.push(r.status() + ' ' + r.url()); else gotOk.add(r.url()); });
  const mkt = () => page.evaluate(() => [...document.querySelectorAll('.mkt-b')].map(a => ({id: a.dataset.place, t: a.textContent.trim(), cur: a.getAttribute('aria-current')})));
  await page.goto(base + '/#/road', {waitUntil: 'networkidle'}); await page.waitForSelector('.f-titlerow');
  const k1 = await mkt(), np = places.places.length;
  check(`시장 단추: 한국 판 위 막대 「${k1.map(x => x.t).join(' · ')}」 = 판 목록 ${np}개 차례 · 한국이 눌린 채`, k1.length === np && k1.map(x => x.id).join() === places.places.map(p => p.id).join() && k1[0].id === 'kr' && k1[0].cur === 'page' && k1.slice(1).every(x => !x.cur), k1);
  await pickMarket(page, 'us'); await page.waitForURL(/\/us\/#\/road$/, {timeout: 15000}).catch(() => {}); await page.waitForSelector('.f-titlerow', {timeout: 15000}).catch(() => {}); await page.waitForTimeout(400);
  const r1 = await page.evaluate(() => ({url: location.pathname + location.hash, n: document.querySelector('.f-titlerow .b-count')?.textContent.trim() ?? null}));
  const k2 = await mkt();
  check(`「미국」 누름 → 미국 판 출목표 그대로(${r1.url}) · 「${r1.n}」 = 미국 판 ${ubd.companies.length}곳 · 미국이 눌린 채`, r1.url === '/us/#/road' && r1.n === `${ubd.companies.length}곳` && k2.find(x => x.id === 'us')?.cur === 'page', {r1, k2});
  await page.screenshot({path: path.join(dir, 'us-road.png')});
  await page.goto(ub + '/#/hot', {waitUntil: 'networkidle'}); await page.waitForSelector('.mstrip'); await page.waitForTimeout(300); // 불장 = 시장 안 보기(2026-10-08 20:19 지시서 — 「#/」는 시장 요약)
  const st = await page.evaluate(() => ({time: document.querySelector('.mstrip .m-time')?.textContent.trim() ?? null, names: [...document.querySelectorAll('.mstrip .m-name')].map(x => x.textContent.trim()), title: document.querySelector('.b-title')?.innerText.replace(/\s+/g, ' ').trim()}));
  const wantStrip = um.market?.items?.length ? `${kd(um.market.items[0].date)} 16:00 뉴욕 시각 종가` : null;
  check(`미국 판 불장: 시장 띠 「${st.time}」 · ${st.names.join(' · ')} = 판(뉴욕 지수)`, um.market ? st.time === wantStrip && JSON.stringify(st.names) === JSON.stringify(um.market.items.map(i => i.name)) : /^시장 지수 없음/.test(st.time ?? ''), {st, wantStrip});
  await page.screenshot({path: path.join(dir, 'us-home.png')});
  const c0 = [...ubd.companies].sort((a, b) => (b.change20 ?? -9) - (a.change20 ?? -9))[0];
  await page.goto(ub + '/#/stock/' + encodeURIComponent(c0.code), {waitUntil: 'networkidle'}); await page.waitForSelector('.b-price'); await page.waitForTimeout(400);
  const cp = await page.evaluate(() => ({name: document.querySelector('h1')?.textContent.trim(), close: document.querySelector('.b-price .b-close')?.textContent.trim(), date: document.querySelector('.b-price .b-date')?.textContent.trim(), flow: document.querySelector('.c-brief .fl')?.textContent.replace(/\s+/g, ' ').trim() ?? null, integ: document.querySelector('.integrity-text')?.textContent.trim() ?? null}));
  const wantClose = c0.close.toLocaleString('ko-KR', {minimumFractionDigits: 2, maximumFractionDigits: 2}) + '달러';
  check(`미국 회사 화면 ${c0.code}: 「${cp.name}」 · 값 「${cp.close}」 = 판 종가(달러 · 소수 둘째 자리) · 「${cp.date}」`, cp.name === c0.name && cp.close === wantClose && cp.date === `${kd(c0.date)} 16:00(뉴욕) 종가`, {cp, wantClose});
  check(`미국 회사 화면: 수급 줄 「${cp.flow}」 — 미국은 투자자별 매매 공개 자료가 없다고 적음(0 으로 채우지 않음)`, cp.flow === `수급 · ${um.place.flowsNone}`, {flow: cp.flow});
  await page.screenshot({path: path.join(dir, 'us-company.png')});
  await page.goto(ub + '/#/agenda', {waitUntil: 'networkidle'}); await page.waitForSelector('.a-page'); await page.waitForTimeout(300);
  const ag = await page.evaluate(() => ({disc: document.querySelector('[aria-label="공시"] p')?.textContent.trim() ?? null, krDisc: document.querySelectorAll('[aria-label="예고 공시"], [aria-label="아주 중요한 공시"]').length}));
  check(`미국 판 일정: 공시 칸 「${ag.disc}」 한 칸 · 한국 공시 칸 둘(예고 · ★★★) 없음`, ag.disc === um.place.disclosuresNone && ag.krDisc === 0, ag);
  await pickMarket(page, 'kr'); await page.waitForURL(u => /\/#\/agenda$/.test(String(u)) && !/\/us\//.test(String(u)), {timeout: 15000}).catch(() => {}); await page.waitForSelector('.a-page', {timeout: 15000}).catch(() => {});
  const back = await page.evaluate(() => ({url: location.pathname + location.hash, strip: document.querySelector('.mstrip .m-time')?.textContent.trim() ?? null}));
  check(`「한국」 누름 → 한국 판 일정 그대로(${back.url}) · 시장 띠 「${back.strip}」`, back.url === '/#/agenda' && /15:30 KST/.test(back.strip ?? ''), back);
  // 미국 판 「기록」 탭 — 한국 판과 같은 /changelog.json · 무결성(미국 판 묶음)은 이 탭 맨 아래(옛 맨 아래 「기술 정보」를 옮김)
  const usLog = await (await fetch(base + '/changelog.json')).json();
  await page.goto(ub + '/#/log', {waitUntil: 'networkidle'}); await page.waitForSelector('.lg-page .lg-item'); await page.waitForTimeout(300);
  const ul = await page.evaluate(() => ({n: document.querySelectorAll('.lg-item').length, first: document.querySelector('.lg-item')?.dataset.id, tabs: document.querySelectorAll('.bottom-link').length, here: document.querySelector('.mkt-b[aria-current="page"]')?.dataset.place, integ: document.querySelector('.lg-tech .integrity-text')?.textContent.trim() ?? null}));
  check(`미국 판 「기록」 탭: 줄 ${ul.n}개 = /changelog.json ${usLog.entries.length}개 · 아래 탭 ${ul.tabs}개 · 미국 눌림 · 무결성 「${ul.integ}」`, ul.n === usLog.entries.length && ul.first === usLog.entries[0]?.id && ul.tabs === 4 && ul.here === 'us' && /모두 판 목록의 SHA-256 과 같음/.test(ul.integ ?? ''), ul);
  // 미국 판 「처음」 탭(2026-10-07 00:49 「이대로 사이트에 올려줘」) — 3년 종가가 모자라 다섯을 찍지 않고 「언제부터」만 · 약속 셋째 줄은 옛 문장 그대로
  await page.goto(ub + '/#/start', {waitUntil: 'networkidle'}); await page.waitForSelector('.st-page'); await page.waitForTimeout(300);
  const us5 = await page.evaluate(() => ({rows: document.querySelectorAll('.st-row').length, wait: document.querySelector('.st-wait')?.textContent.trim() ?? null, when: document.querySelector('.st-page .b-when')?.textContent.trim() ?? null,
    promise: document.querySelector('.st-page .b-promise-box summary')?.innerText.trim(), third: document.querySelectorAll('.st-page .b-promise-box li')[2]?.textContent.trim() ?? null, active: document.querySelector('.bottom-link.active')?.dataset.route ?? null}));
  const usReady = ubd.start?.readyMonth ? `${Number(ubd.start.readyMonth.slice(0, 4))}년 ${Number(ubd.start.readyMonth.slice(5, 7))}월` : null;
  check(`미국 판 「처음」 탭: 3년 종가가 모자라 찍지 않음(다섯 줄 ${us5.rows}개) · 「${us5.wait}」 · 약속 셋째 줄 「${us5.third}」`,
    ubd.start?.ready === false && us5.rows === 0 && usReady && (us5.wait ?? '').includes(`${usReady}부터`) && /뉴욕 종가/.test(us5.when ?? '') && us5.promise === 'ATLAS가 하지 않는 일 8가지' && us5.third === '사거나 팔라고 하지 않습니다 — 「매수 검토 후보」는 미리 정한 규칙으로 고른 검토 차례(연구용 · 성능 검증 전)이고 결정은 보는 사람이 합니다' && us5.active === null, {us5, usReady, start: ubd.start});
  { const fr = await realFailsChecked(failed); check(`미국 판 화면들: 콘솔 오류 0 · 요청 실패 0`, errs.length === 0 && fr.length === 0, {errs: errs.slice(0, 3), failed: fr.slice(0, 3)}); }
  await context.close();
}

/* 내린 판 — 중국 · 일본 · 베트남(2026-10-07 05:25 「미국 장 처럼」으로 넣었다가 2026-10-08 18:33 마카오 시각 사장님 「한국 미국장만 두고 남머지 장은 삭제해」로 내림 · lib/atlas11/places.mjs)
   사이트 판 목록(places.json) = 한국 · 미국 둘 · 묶음에 /cn/ · /jp/ · /vn/ 화면 없음 · 옛 주소는 한국 판 첫 화면으로(_redirects) · 위 막대 시장 단추 둘(한국 · 미국 — 펼치는 목록 없음)
   받아 둔 자료(public/data/atlas11/<시장>)는 지우지 않고 보관(규칙 8) — 사이트에 싣지 않을 뿐 */
async function retiredCheck() {
  let places = null; try { places = await (await fetch(base + '/places.json')).json(); } catch {}
  const ids = (places?.places ?? []).map(p => p.id).join(), gone = [];
  for (const id of ['cn', 'jp', 'vn']) { const r = await fetch(`${base}/${id}/data/atlas11/view/manifest.json`).catch(() => null); if (r?.ok) gone.push(id); }
  const red = await fetch(base + '/_redirects').then(r => (r.ok ? r.text() : '')).catch(() => '');
  const redOk = ['cn', 'jp', 'vn'].every(id => red.includes(`/${id}/*  /  302`) && red.includes(`/${id}  /  302`));
  const story = await fetch(base + '/story.json').then(r => r.json()).catch(() => null), rotIds = Object.keys(story?.rotations ?? {}).join();
  check(`내린 판(중국 · 일본 · 베트남 — 2026-10-08 18:33): 판 목록 「${ids}」 = 한국 · 미국 · 묶음에 세 판 화면 없음(남은 판 ${gone.join(' · ') || '0'}) · 옛 주소는 한국 판 첫 화면으로(_redirects) · 돈 흐름 바깥 판 「${rotIds}」`, ids === 'kr,us' && gone.length === 0 && redOk && rotIds === 'us', {ids, gone, redOk, rotIds});
  const context = await browser.newContext({viewport: {width: 390, height: 844}, isMobile: true, hasTouch: true, locale: 'ko-KR', timezoneId: 'Asia/Seoul'});
  const page = await context.newPage(), errs = [];
  page.on('console', m => { if (m.type() === 'error') errs.push(m.text()); }); page.on('pageerror', e => errs.push('pageerror: ' + e.message));
  await page.goto(base + '/#/flow/rotation', {waitUntil: 'networkidle'}); await page.waitForSelector('.fl-page section.rt'); await page.waitForTimeout(300);
  const mk = await page.evaluate(() => ({links: [...document.querySelectorAll('.top .mkt-b')].map(a => [a.dataset.place, a.textContent.trim(), a.getAttribute('aria-current')]), pick: !!document.querySelector('.top .mkt-pick'), sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth}));
  check(`위 막대 시장 단추 둘(${mk.links.map(x => x[1]).join(' · ')}) · 펼치는 목록 없음 · 한국 눌림 · 옆으로 넘치지 않음`, mk.links.map(x => x[0]).join() === 'kr,us' && mk.links[0][2] === 'page' && !mk.pick && mk.sw <= mk.cw, mk);
  await page.locator('.top .mkt-b[data-place="us"]').tap(); await page.waitForURL(/\/us\/#\/flow\/rotation$/, {timeout: 15000}).catch(() => {}); await page.waitForSelector('.fl-page section.rt', {timeout: 15000}).catch(() => {}); await page.waitForTimeout(400);
  const us = await page.evaluate(() => ({url: location.pathname + location.hash, place: document.querySelector('.fl-page section.rt[data-place]')?.dataset.place ?? null, cos: document.querySelectorAll('.fl-page .rc-g').length}));
  check(`「미국」 단추 → 미국 판 업종 순환 그대로(${us.url}) · 미국 업종 순환 그림 · 업종 회사 칸 ${us.cos}개`, us.url === '/us/#/flow/rotation' && us.place === 'us' && us.cos === 6, us);
  check(`내린 판 · 시장 단추 화면들: 콘솔 오류 0`, errs.length === 0, {errs: errs.slice(0, 3)});
  await context.close();
}

async function clarityCheck() {
  const table = {};
  const plist = (await fetch(base + '/places.json').then(r => r.json()).catch(() => null))?.places ?? [{id: 'kr', label: '한국', href: '/'}, {id: 'us', label: '미국', href: '/us/'}];
  const placeHrefs = plist.map(p => p.href), placeLabel = Object.fromEntries(plist.map(p => [p.href, p.label]));
  for (const v of VIEWS) {
    const ctx = await browser.newContext({viewport: v.viewport, isMobile: !!v.mobile, hasTouch: !!v.mobile, colorScheme: v.dark ? 'dark' : 'light', locale: 'ko-KR', timezoneId: 'Asia/Seoul'});
    if (v.font) await ctx.addInitScript(step => { try { localStorage.setItem('atlas11:font', String(step)); } catch {} }, v.font);
    const page = await ctx.newPage(); table[v.id] = {};
    for (const s of SCREENS) {
      await page.goto(base + '/' + screenHash(s, board), {waitUntil: 'networkidle'}); await page.waitForSelector(s.wait, {timeout: 15000}).catch(() => {}); if (s.settle) await s.settle(page); await page.waitForTimeout(500); await renderAll(page);
      const m = await page.evaluate(measureClarity);
      table[v.id][s.id] = {relDays: m.relDays, vague: m.vague, bareNumbers: m.bareNumbers, graphable: m.graphable, lowContrast: m.lowContrast, decoColors: m.decoColors, truncated: m.truncated, formatDates: m.formatDates};
      // 휴대폰 흉내에서는 글이 넘치면 화면(레이아웃) 폭 자체가 넓어져 「잘린 글자」 재기가 못 본다 — 화면 폭이 기기 폭 그대로인지 따로 본다
      const vw = await page.evaluate(() => ({inner: innerWidth, visual: Math.round(visualViewport.width), scroll: document.documentElement.scrollWidth}));
      check(`화면 폭 ${v.id} ${s.id}: ${vw.inner}px = 기기 폭 ${v.viewport.width}px(넘친 칸이 화면을 넓히지 않음)`, vw.inner === v.viewport.width && vw.scroll <= v.viewport.width, vw);
      check(`잘린 글자 ${v.id} ${s.id}: ${m.truncated}`, m.truncated === 0, m.truncated ? {truncated: m.samples.truncated, pageOverflowX: m.pageOverflowX} : undefined);
      check(`또렷함 ${v.id} ${s.id}: 1 내일·오늘·어제 ${m.relDays} · 2 흐릿한 말 ${m.vague} · 3 단위·기준 빠진 숫자 ${m.bareNumbers} · 5 대비 모자람 ${m.lowContrast} · (참고) 날짜 모양 ${m.formatDates}`, m.relDays + m.vague + m.bareNumbers + m.lowContrast === 0, m.relDays + m.vague + m.bareNumbers + m.lowContrast ? {rel: m.samples.relDays, vague: m.samples.vague, bare: m.samples.bareNumbers, contrast: m.samples.lowContrast} : null);
    }
    // 아래 탭 이름 여덟이 제 칸 안에 드는가(2026-10-07 「처음」 탭을 더하며 · 2026-10-08 17:41 「돈 흐름」 — 여덟) — 아래 막대는 화면에 붙어 있어 위 화면 폭 재기로는 잡히지 않는다
    const tabFit = await page.evaluate(() => [...document.querySelectorAll('.bottom-link')].map(a => { const el = a.querySelector('.label'), l = el.getBoundingClientRect(), b = a.getBoundingClientRect(); return {t: el.textContent, in: l.left >= b.left - 0.5 && l.right <= b.right + 0.5, cut: el.scrollWidth > el.clientWidth + 0.5, gap: Math.round(b.width - l.width)}; })); // cut = 「…」로 잘림(2026-10-08 「돈 흐…」)
    check(`아래 탭 이름 ${v.id}: ${tabFit.length}개 모두 제 칸 안 · 잘린 이름 없음(가장 좁은 남는 폭 ${Math.min(...tabFit.map(x => x.gap))}px)`, tabFit.length === 4 && tabFit.every(x => x.in && !x.cut), tabFit.filter(x => !x.in || x.cut));
    // 지도 탭 맨 아래 「지난 6개월 앞서 달린 곳」은 닫힌 접힘이라 위 재기에서 빠진다 — 펼친 뒤 상자 안만 따로 잰다(한국 · 미국 판 · 보기 5가지)
    //   2026-10-06 15시: 펼친 상자를 따로 재어 보니 좁은 휴대폰 어두운 화면 글씨 200%에서 긴 회사 이름이 화면을 넓힘(한국 +6px · 미국 +303px) · 지수 값에 단위 없음 → 고친 뒤 이 검사를 붙임
    for (const where of placeHrefs) { // 판 목록의 모든 판(2026-10-07 중국 · 일본 · 베트남)
      await page.goto(base + where + '#/map', {waitUntil: 'networkidle'}); await page.waitForSelector('.lm-c', {timeout: 15000}).catch(() => {}); await page.waitForTimeout(400);
      const opened = await page.evaluate(() => { const d = document.querySelector('details.m6'); if (!d) return false; d.open = true; d.scrollIntoView(); return true; }); await page.waitForTimeout(300);
      const m6 = await page.evaluate(measureClarity, {roots: ['details.m6'], refTime: false});
      const vw6 = await page.evaluate(() => ({inner: innerWidth, scroll: document.documentElement.scrollWidth, rows: document.querySelectorAll('details.m6 .m6-list > li').length}));
      check(`펼친 「지난 6개월」 상자 ${placeLabel[where] ?? where} 판 ${v.id}: 줄 ${vw6.rows}개 · 화면 폭 ${vw6.inner}px = 기기 폭 ${v.viewport.width}px · 잘린 글자 ${m6.truncated} · 또렷함 1 ${m6.relDays} · 2 ${m6.vague} · 3 ${m6.bareNumbers} · 5 ${m6.lowContrast}`,
        opened && vw6.rows > 0 && vw6.inner === v.viewport.width && vw6.scroll <= v.viewport.width && m6.truncated === 0 && m6.relDays + m6.vague + m6.bareNumbers + m6.lowContrast === 0,
        {opened, vw6, bare: m6.samples.bareNumbers, trunc: m6.samples.truncated, vague: m6.samples.vague, contrast: m6.samples.lowContrast});
    }
    await ctx.close();
  }
  // 검사기 자체 시험: 흐릿한 말 하나 · 단위 없는 숫자 하나 · 잘린 이름 하나 · 앞날 말 하나를 일부러 넣으면 늘어야 한다
  const ctx = await browser.newContext({viewport: {width: 1280, height: 800}, locale: 'ko-KR'}); const page = await ctx.newPage();
  await page.goto(base + '/#/map', {waitUntil: 'networkidle'}); await page.waitForSelector('.t-tile'); await page.waitForTimeout(500); await renderAll(page);
  const before = await page.evaluate(measureClarity);
  await page.evaluate(() => { const box = document.createElement('section'); box.className = 'b-box'; box.innerHTML = '<p>내일 42 정도.</p><p>곧 많이 오릅니다.</p>'; document.getElementById('main').prepend(box); });
  const plant = await page.evaluate(measureClarity);
  const delta = {relDays: plant.relDays - before.relDays, vague: plant.vague - before.vague, bareNumbers: plant.bareNumbers - before.bareNumbers};
  check('검사기 자체 시험: 「내일 42 정도.」「곧 많이 오릅니다.」를 넣으면 1·2·3번이 모두 1 이상 늘어난다', delta.relDays >= 1 && delta.vague >= 1 && delta.bareNumbers >= 1, delta);
  await page.evaluate(() => { const name = document.createElement('div'); name.textContent = '한화에어로스페이스'; Object.assign(name.style, {width: '60px', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis'}); document.getElementById('main').prepend(name); });
  const cut = await page.evaluate(measureClarity);
  check('검사기 자체 시험(7번): 「…」로 잘린 회사 이름 하나를 넣으면 잘린 글자가 1 늘어난다', cut.truncated - plant.truncated === 1, {before: plant.truncated, after: cut.truncated});
  await page.evaluate(() => { const p = document.createElement('p'); p.textContent = '10월 6일(화) 전망 · 오를 쪽'; document.getElementById('main').prepend(p); });
  const t = await textsOf(page);
  check('검사기 자체 시험(앞날 말): 화면에 「전망 · 오를 쪽」을 넣으면 잡는다', PREDICTION_WORDS.test(t.ours));
  await ctx.close();
  return table;
}

let clarity = null;
try {
  await scenario('pc', {width: 1280, height: 800});
  await scenario('mobile', {width: 390, height: 844}, {mobile: true});
  await darkCheck();
  await usCheck();
  await retiredCheck(); // 2026-10-08 18:33 중국 · 일본 · 베트남 내림(옛 worldCheck)
  clarity = await clarityCheck();
} finally { await browser.close(); }
// 배포 묶음: 게임 쪽은 없고 옛 주소는 처음 화면으로 돌린다(넷리파이 _redirects)
try { const red = await fs.readFile(path.join(process.cwd(), 'dist/_redirects'), 'utf8'); let game = true; try { await fs.access(path.join(process.cwd(), 'dist/game')); } catch { game = false; } check(`배포 묶음: game/ 폴더 없음 · _redirects 에 /game/* → / (${red.trim().split('\n').length}줄)`, !game && /^\/game\/\*\s+\/\s+302$/m.test(red)); } catch (e) { check('배포 묶음 dist/ 를 읽지 못함', false, {e: e.message}); }
const summary = {schema: 'atlas11-browser-check-4', at: new Date().toISOString(), base, prediction: 'off', boardId: manifest.boardId, asOf: manifest.asOf, chromium: 'playwright chromium (headless)', viewports: {pc: '1280x800', mobile: '390x844 (터치 흉내 — 실제 아이폰 기기 검증 아님)', 'mobile-dark': '390x844 어두운 화면'}, passed: checks.filter(c => c.ok).length, failed: checks.filter(c => !c.ok).length, clarity, checks};
await fs.writeFile(path.join(dir, 'report.json'), JSON.stringify(summary, null, 2));
await fs.writeFile(path.join(process.cwd(), 'reports/atlas11/browser/latest.json'), JSON.stringify({...summary, dir: path.relative(process.cwd(), dir)}, null, 2));
console.log(JSON.stringify({passed: summary.passed, failed: summary.failed, dir}));
process.exitCode = summary.failed ? 1 : 0;
