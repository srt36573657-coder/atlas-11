// 급등 다섯 칸(새 아틀란스 /next/ · site/next/p-surge.js) 맞대기 검사 — 사장님 2026-10-17 04:04 「첫화면 부터 마지막 페이지 까지 모두 바꿔」 · 「정말 빠르면서도 정밀하게」
//   쓰는 법: node scripts/atlas11/next/check_surge.mjs --base http://127.0.0.1:8826 [--pw /opt/node-tools/] [--all] [--limit N] [--out 파일.json] [--shots 폴더]
//     --all     모든 자료 판(사이트 자료 · 지난 업데이트 기록 모두 · 일부러 만든 둘레 자료 모두) — 기본도 모두(판이 적어 빠름) · 받아 두는 이름
//     --limit N 앞에서 N 판만(고치는 동안 빨리)
//   ① 같은 자료로 옛 쪽(/atlas/#/surge …)과 새 쪽(/next/?dev=1#/surge …)을 다섯 칸(급등 · 10% · 20% · 30% · 40%) 모두 열어 맞댐 —
//      옛 쪽 #view 의 글 줄(접은 칸 · 숨은 날 판 · 숨은 그림 글 포함)이 새 쪽 main#view 에 빠짐없이 있는지 · 숫자 낱말(% · 곳 · 일 · 월 · 때 …)이 같은 수만큼 있는지 ·
//      회사 이름이 같은 수만큼 있는지 · 금빛 글(「?」 · 「!」 · 「? 장 중」)이 같은지 · 빨강 · 파랑 숫자가 같은지 · 정직 글 · 출처 줄이 있는지 · 회사 고리 = #/w/<번호>
//      자료 판 = 사이트 자료 그대로 · 지난 업데이트 기록(reports/atlas11/t365/surge/*.json + surgecal-latest.json — 들고 남 · 옮김 · 장 중) · 둘레(그대로 둠 · 두 번 넘기 · 장 중 확인 ·
//      목록이 사이트보다 늦음 · 자리 넘침 · 비어 있음 · 네 칸 없음 · 달력 못 받음 · 달력 판이 다름) — 시계는 두 쪽 모두 같은 때로 묶음(「오늘」 · 다음 업데이트 글이 같게)
//   ② 세 폭(320 · 360 · 390) + 새 앱 「가」 큰 글씨 둘(320 아주 크게 · 360 크게) — 가로 넘침 0 · 화면 밖 칸 0 · 누르는 자리 44px 넘게 · 글 17px 넘게 · 화면 오류 0 · 쓰지 않을 말 0
//   ③ 「관심 없음」 — 누르면 그 자리에 「숨겼어요 · 되돌리기」 · 이 기기 기억(atlas:surge-hide · 옛 쪽과 같은 열쇠 · 같은 꼴) · 다시 열어도 빠짐 · 숨긴 곳 칸 · 옛 쪽도 같은 목록 · 되돌리기
//   ④ 회사를 보고 돌아오면 고른 날 · 펼친 묶음 그대로 · 없는 주소(#/surge/abc) · 자료 못 받음(급등 · 바탕) — 새 쪽만
//   실패가 하나라도 있으면 끝 코드 1
import fs from 'node:fs/promises';
import path from 'node:path';
import {createRequire} from 'node:module';
import {fileURLToPath} from 'node:url';
import {oldToNewDeep, SAFE_LINE} from './rename.mjs'; // 이름 바꾸기(2026-10-17 아틀란스 → 보드리)
import {fetchJSON, timer, netSummary} from './net.mjs'; // 망 탈에만 다시 받기 · 옛 쪽 · 새 쪽 시간(2026-10-17 고도리 명령문 [1] 8 · 9)
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');
const argv = process.argv.slice(2), arg = (k, d) => { const i = argv.indexOf(k); return i >= 0 ? argv[i + 1] : d; };
const require = createRequire(arg('--pw', '/opt/node-tools/'));
const {chromium} = require('playwright');
const base = arg('--base', 'http://127.0.0.1:8826').replace(/\/$/, ''), LIMIT = Number(arg('--limit', '0')) || 0, OUT = arg('--out', null), SHOTS = arg('--shots', null);
const t0 = Date.now(), fails = [], counts = {}, tm = timer(t0);
const fail = (k, x) => { counts.fail = (counts.fail || 0) + 1; if (fails.length < 300) fails.push([k, String(x).slice(0, 400)]); };
const bump = (k, n = 1) => { counts[k] = (counts[k] || 0) + n; };
const BOXES = [['', '급등'], ['10', '10%대'], ['20', '20%대'], ['30', '30%대'], ['40', '40% 이상']];
const WIDTHS = [[320, 0], [360, 0], [390, 0], [320, 2], [360, 1]]; // [폭, 글씨 크기(새 앱 「가」 — 0 보통 · 1 크게 · 2 아주 크게 = #view 를 통째로 키움)]

/* ── 자료 ── */
const getJ = f => fetchJSON(base + '/atlas/data/' + f, f); // 망 탈(끊김 · 429 · 5xx)에만 기다렸다 다시 · 404 는 바로 실패(net.mjs)
const [SITE_S, SITE_K, CORE] = await Promise.all(['surge.json', 'surgecal.json', 'core.json'].map(f => getJ(f).catch(e => { fail('자료', e.message); return null; })));
if (!SITE_S || !CORE) { console.error('자료를 못 받음'); process.exit(1); }
const readJ = async p => { try { return JSON.parse(await fs.readFile(path.join(ROOT, p), 'utf8')); } catch { return null; } };
const REC_DIR = 'reports/atlas11/t365/surge';
const recFiles = (await fs.readdir(path.join(ROOT, REC_DIR)).catch(() => [])).filter(f => /^\d{8}T\d{6}Z\.json$/.test(f)).sort();
const recs = (await Promise.all(recFiles.map(async f => ({f, j: await readJ(path.join(REC_DIR, f))})))).filter(x => x.j?.payload?.version === 'sv-v1');
const CAL_LATEST = await readJ('reports/atlas11/t365/surgecal-latest.json');
const clone = x => JSON.parse(JSON.stringify(x));
// 쓰지 않을 말(공통 안내 · next_check BANNED) + 지운 36곳 화면 글(inspect4.mjs OLD36_TEXT)
const OLD36 = (() => { try { return JSON.parse((/export const OLD36_TEXT = (\[[^\]]*\]);/.exec(require('node:fs').readFileSync(path.join(ROOT, 'scripts/atlas11/t365/inspect4.mjs'), 'utf8')) || [, '[]'])[1].replace(/'/g, '"')); } catch { return []; } })();
const BANNED = ['추천', '매수', '매도', '사라', '팔라', '사세요', '파세요', '예측', '확률', '유망', '기회', '신호', '저평가', '1위', 'TOP', ...OLD36];

/* ── 자료 판(시나리오) — 같은 자료를 옛 쪽 · 새 쪽에 똑같이 줌(길 가로채기) · 시계도 같은 때 ── */
const kstToUtc = k => new Date(k.slice(0, 10) + 'T' + k.slice(11, 16) + ':00+09:00').getTime();
const SC = [];
SC.push({id: 'site', S: null, K: null, at: Date.now(), widths: true, hide: false});
for (const {f, j} of recs) {
  const S = clone(j.payload), K = CAL_LATEST && CAL_LATEST.asOf >= S.asOf ? clone(CAL_LATEST) : null;
  SC.push({id: 'rec-' + f.replace('.json', ''), S, K, at: kstToUtc(S.kst) + 9 * 60e3, widths: f === recs.at(-1).f, hide: !!K && K.track.some(t => t.path?.length)});
}
const recLast = recs.at(-1)?.j?.payload;
if (recLast) {
  // 둘레 ① — 그대로 둠(carry) · 두 번 넘기(strict) · 장 중 확인(놓친 곳 있음) · 자리 넘침(over) · 장 중에 든 곳 · 장 중 값으로만 경고 기준 · 셀 수 없는 「?」 까닭 줄
  const S = clone(recLast), K = CAL_LATEST ? clone(CAL_LATEST) : null;
  S.carry = {fromKst: '2026-10-16 14:00', why: '이번 셈이 멈춰 앞에 고른 그대로 뒀어요.'}; S.strict = true; S.confirm = {day: '2026-10-15', n: 6, miss: 2};
  if (S.bands?.b10) S.bands.b10.over = 4;
  S.members.forEach((m, i) => { if (i % 3 === 0) m.prov = true; if (i < 2) m.warnLive = true; });
  if (S.out?.[0]) S.out[0].why = '? 값을 못 받아 뺐어요';
  if (S.cutList?.[0]) S.cutList[0].why = '? 거래가 멈춘 날이 있어요';
  SC.push({id: 'edge-carry', S, K, at: kstToUtc(S.kst) + 30 * 60e3, widths: true, hide: false});
  // 둘레 ② — 장 중 확인(모두 넘음) · 목록이 사이트 값보다 늦음 · 달력 판 장 중 · 줄 선 빈 날(끊김 · 점) · 처음 찾은 날 종가 없음
  const S2 = clone(recLast), K2 = CAL_LATEST ? clone(CAL_LATEST) : null;
  S2.confirm = {day: '2026-10-15', n: 4, miss: 0}; S2.asOf = '2026-10-12'; S2.provisional = false; S2.window = ['2026-10-02', '2026-10-06', '2026-10-07', '2026-10-08', '2026-10-09', '2026-10-12'];
  if (K2) {
    K2.provisional = true;
    const w = K2.track.filter(t => t.path?.length);
    if (w[0]) w[0].path = [['2026-10-16', null]];
    if (w[1]) w[1].path = [['2026-10-16', 3.3], ['2026-10-19', null], ['2026-10-20', -1.25]];
    const nob = K2.track.find(t => !t.path?.length); if (nob) nob.d = '2026-10-14';
  }
  SC.push({id: 'edge-late', S: S2, K: K2, at: kstToUtc('2026-10-17 09:30'), widths: false, hide: false});
}
{ // 둘레 ③ — 비어 있음(문턱을 넘은 곳 0 · 네 칸 0) · 산 없음
  const S = clone(SITE_S); S.members = []; S.n = 0; S.in = []; S.out = []; S.cutList = []; S.bins = []; S.stats = {lo: null, hi: null, med: null};
  for (const b of ['b10', 'b20', 'b30', 'b40']) if (S.bands?.[b]) Object.assign(S.bands[b], {n: 0, members: [], in: [], out: [], move: []});
  SC.push({id: 'edge-empty', S, K: null, at: Date.now(), widths: true, hide: false});
}
{ const S = clone(SITE_S); delete S.bands; SC.push({id: 'edge-nobands', S, K: null, at: Date.now(), widths: false, hide: false}); }
SC.push({id: 'edge-nocal', S: null, K: 404, at: Date.now(), widths: false, hide: false});
{ const K = clone(SITE_K ?? {}); K.version = 'sk-v0'; SC.push({id: 'edge-badcal', S: null, K, at: Date.now(), widths: false, hide: false}); }
const NEW_ONLY = [{id: 'edge-nosurge', S: 404, K: null, at: Date.now(), expect: '? 급등 자료를 받지 못했어요'}, {id: 'edge-nocore', S: null, K: null, core: 404, at: Date.now(), expect: '자료: ? · '}];
const RUN = LIMIT ? SC.slice(0, LIMIT) : SC;

/* ── 브라우저 ── */
const exe = '/opt/pw-browsers/chromium', b = await chromium.launch((await fs.stat(exe).catch(() => null)) ? {executablePath: exe} : {});
async function ctxFor(sc, width = 360) {
  const ctx = await b.newContext({viewport: {width, height: 640}, deviceScaleFactor: 1, hasTouch: true, locale: 'ko-KR'});
  await ctx.clock.setFixedTime(new Date(sc.at));
  const body = x => ({status: 200, contentType: 'application/json', body: JSON.stringify(x)});
  const miss = {status: 404, contentType: 'text/plain', body: 'gone'};
  if (sc.S != null) await ctx.route('**/atlas/data/surge.json*', r => r.fulfill(sc.S === 404 ? miss : body(sc.S)));
  if (sc.K != null) await ctx.route('**/atlas/data/surgecal.json*', r => r.fulfill(sc.K === 404 ? miss : body(sc.K)));
  if (sc.core === 404) await ctx.route('**/atlas/data/core.json*', r => r.fulfill(miss));
  return ctx;
}
const MISS404 = sc => sc.S === 404 || sc.K === 404 || sc.core === 404;
async function pageIn(ctx, sc) {
  const p = await ctx.newPage(); p._errs = [];
  p.on('pageerror', e => p._errs.push('pageerror ' + e.message));
  p.on('console', m => { if (m.type() === 'error' && !(MISS404(sc) && /Failed to load resource/.test(m.text()))) p._errs.push('console ' + m.text()); });
  return p;
}
const OLD = h => base + '/atlas/' + h, NEW = h => base + '/next/?dev=1' + h;
/** 화면 열기(처음은 주소로 · 다음은 # 만 바꿈 — 앞 화면 칸에 표를 달아 새로 그려진 칸을 기다림) */
async function open(p, side, hash, first) { return tm[side === 'old' ? 'old' : 'new'](() => open0(p, side, hash, first)); } // 여는 데 쓴 때 — 그 쪽 몫으로
async function open0(p, side, hash, first) {
  const root = side === 'old' ? '#view' : 'main#view';
  if (first) await p.goto(side === 'old' ? OLD(hash) : NEW(hash), {waitUntil: 'domcontentloaded'});
  else { await p.evaluate(r => { for (const e of document.querySelector(r).children) e.dataset.stale = '1'; }, root); await p.evaluate(h => { location.hash = h; }, hash); }
  await p.waitForFunction(r => { const v = document.querySelector(r); if (!v || v.querySelector('.boot')) return false; const kids = [...v.children].filter(e => !e.dataset.stale); return kids.length && kids.some(e => e.querySelector('h1, .empty') || e.matches('.empty')); }, root, {timeout: 20000});
  if (side === 'new') await p.waitForFunction(() => !document.querySelector('main#view .psurge-svc') || document.querySelector('main#view .psurge-svr svg'), null, {timeout: 10000}).catch(() => fail('그림 안 그려짐', hash));
  await p.evaluate(() => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r))));
}
/** 글 모으기 — 접은 칸 열고 숨은 칸(다른 날 판 · 겹쳐 숨긴 그림 글) 보이게 한 뒤 innerText · 금빛 · 빨강 · 파랑 글 · 고리 */
const grab = (p, root) => tm[root === '#view' ? 'old' : 'new'](() => grab0(p, root)); // 읽는 데 쓴 때 — 그 쪽 몫으로(옛 쪽 = #view · 새 쪽 = main#view)
const grab0 = (p, root) => p.evaluate(r => {
  const v = document.querySelector(r);
  for (const d of v.querySelectorAll('details')) d.open = true;
  for (const e of v.querySelectorAll('[hidden]')) e.hidden = false;
  const own = e => [...e.childNodes].filter(n => n.nodeType === 3).map(n => n.textContent).join('').replace(/[\u00a0]/g, ' ').replace(/\u2060/g, '').replace(/\s+/g, ' ').trim();
  const colorOf = e => { const c = getComputedStyle(e).color; return c === 'rgb(233, 185, 73)' ? 'gold' : c === 'rgb(255, 90, 101)' ? 'up' : c === 'rgb(91, 150, 255)' ? 'down' : null; };
  const marks = [];
  for (const e of v.querySelectorAll('*')) { if (e.closest('svg')) continue; const t = own(e); if (!t) continue; const c = colorOf(e); if (c) marks.push(c + '|' + t); }
  return {text: v.innerText, marks, hrefs: [...v.querySelectorAll('a[href]')].map(a => a.getAttribute('href')), h1: v.querySelector('h1')?.textContent ?? '', title: document.title};
}, root);
const norm = s => String(s).replace(/\u00a0/g, ' ').replace(/[\u2060\u200b]/g, '').replace(/[ \t]+/g, ' ');
const flat = s => norm(s).replace(/\s+/g, '');
const TOK = /[+−-]?\d[\d,]*(?:\.\d+)?(?:%|곳|억 ?원|원|배|거래일|일|개|번|월|시|:\d{2})?/g;
const bag = (xs) => { const m = new Map(); for (const x of xs) m.set(x, (m.get(x) || 0) + 1); return m; };
const countIn = (hay, needle) => { let n = 0, i = 0; if (!needle) return 0; while ((i = hay.indexOf(needle, i)) >= 0) { n++; i += needle.length; } return n; };
// 옛 쪽에만 있고 새 쪽은 일부러 바꾼 줄(맨 아래 고리 둘 · 투자 상담 글 → 새 안전 문장 · 옛 「자료를 못 읽었습니다」 꼴)
const SKIP = [/^친구에게 소개하기$/, /^미국 판$/, /^저는 투자 상담사가 아닙니다/];
const ALWAYS = [SAFE_LINE, '자료: ']; // 새 쪽 안전 문장(옛 「투자 상담사 …」 줄 자리 · 보드리는 지난 기록만 …) · 자료 줄은 늘
const MUST = ['사고팔 곳을 고른 목록이 아니에요.', '? 오른 까닭은 몰라요.', '지난 값일 뿐 앞날을 말하지 않아요.', '센 것일 뿐 다음 날을 말하지 않아요.', ...ALWAYS];
function namesOf(S, K) {
  const s = new Set(), add = x => { if (x?.n) s.add(x.n); };
  for (const k of ['members', 'in', 'out', 'cutList']) (S?.[k] ?? []).forEach(add);
  for (const b of ['b10', 'b20', 'b30', 'b40']) for (const k of ['members', 'in', 'out', 'move']) (S?.bands?.[b]?.[k] ?? []).forEach(add);
  for (const t of K?.track ?? []) add(t);
  for (const d of K?.days ?? []) for (const e of d.ev ?? []) if (e[3]) s.add(e[3]);
  return [...s].sort((a, b2) => b2.length - a.length);
}
/** 옛 쪽 · 새 쪽 한 칸 맞대기 */
function compare(sc, box, o, n, names) {
  const at = `${sc.id} #/surge${box ? '/' + box : ''}`;
  const nf = flat(n.text);
  let lines = 0;
  for (const raw of norm(o.text).split('\n')) {
    const L = raw.trim(); if (!L || SKIP.some(r => r.test(L))) continue;
    lines++; if (!nf.includes(flat(L))) fail('옛 줄 없음', `${at} — ${L}`);
  }
  bump('줄', lines);
  const ot = bag((norm(o.text).match(TOK) || []).map(x => x.replace(/\s/g, ''))), nt = bag((norm(n.text).match(TOK) || []).map(x => x.replace(/\s/g, '')));
  let tk = 0; for (const [k, c] of ot) { tk += c; if ((nt.get(k) || 0) < c) fail('숫자 낱말 모자람', `${at} — 「${k}」 옛 ${c} · 새 ${nt.get(k) || 0}`); }
  bump('숫자 낱말', tk);
  const of = flat(o.text);
  for (const nm of names) { const a = countIn(of, flat(nm)), c = countIn(nf, flat(nm)); if (a) bump('이름'); if (c < a) fail('이름 모자람', `${at} — ${nm} 옛 ${a} · 새 ${c}`); }
  const om = bag(o.marks.map(norm)), nm2 = bag(n.marks.map(norm));
  for (const [k, c] of om) if ((nm2.get(k) || 0) !== c) fail('색 글 다름', `${at} — ${k} 옛 ${c} · 새 ${nm2.get(k) || 0}`);
  for (const [k, c] of nm2) if (!om.has(k)) {
    // 옛 쪽 「? … 못 받았어요」 줄이 칸 제목 바로 밑이면 옛 꾸밈(h2.sec + p 회색)에 덮여 회색이었음 — 새 쪽은 「?」 = 금빛(규칙 53) 그대로 · 같은 글이 옛 쪽에 있을 때만 봐줌
    if (/^gold\|\? /.test(k) && norm(o.text).includes(k.slice(5))) { bump('금빛 ? 줄(옛 쪽은 회색에 덮임)', c); continue; }
    fail('새 쪽에만 색 글', `${at} — ${k} ×${c}`);
  }
  bump('색 글', o.marks.length);
  for (const m of MUST) if (ALWAYS.includes(m) || norm(o.text).includes(m)) { if (!norm(n.text).includes(m)) fail('정직 · 출처 글 없음', `${at} — ${m}`); }
  if (flat(o.h1) !== flat(n.h1)) fail('제목 다름', `${at} — 옛 ${o.h1} · 새 ${n.h1}`);
  if (!n.title.startsWith(norm(n.h1).trim())) fail('문서 제목', `${at} — ${n.title}`);
  // 고리 — 회사는 #/w/<번호> · 옛 회사 고리(#/c/ · #/x/)는 없음 · 다섯 칸 · 바깥 공시 둘
  const oc = o.hrefs.filter(x => /^#\/(c|x)\//.test(x)).map(x => x.slice(4)), ncs = n.hrefs.filter(x => /^#\/w\//.test(x)).map(x => decodeURIComponent(x.slice(4)));
  const ob = bag(oc), nb = bag(ncs); for (const [k, c] of ob) if ((nb.get(k) || 0) < c) fail('회사 고리 모자람', `${at} — ${k} 옛 ${c} · 새 ${nb.get(k) || 0}`);
  for (const x of n.hrefs) if (!/^(#\/w\/[0-9A-Z]{6}|#\/surge(\/(10|20|30|40))?|#\/|https:\/\/kind\.krx\.co\.kr\/|https:\/\/dart\.fss\.or\.kr\/)$/.test(x)) fail('모르는 고리', `${at} — ${x}`);
  if (n.hrefs.some(x => /^#\/(c|x)\//.test(x))) fail('옛 회사 고리 남음', at);
  const plain = names.reduce((s, x) => s.split(x).join(' '), norm(n.text)).split('공매도').join(' '); // 「공매도」(옛 「?」 줄 — 못 보는 것)는 「매도」 권함이 아님
  for (const w of BANNED) if (plain.includes(w)) fail('쓰지 않을 말', `${at} — ${w}`);
  bump('맞댄 칸');
}
/** 한 폭 둘러보기 — 넘침 · 화면 밖 칸 · 누르는 자리 · 글 크기 */
const layout = p => p.evaluate(() => {
  const vw = document.documentElement.clientWidth, v = document.querySelector('main#view'), bad = [], small = [], tiny = [];
  for (const d of v.querySelectorAll('details')) d.open = true; // 접은 칸 · 다른 날 판도 펼쳐 잼
  for (const e of v.querySelectorAll('[hidden]')) if (!e.matches('.psurge-tip')) e.hidden = false;
  const clipped = e => { for (let x = e.parentElement; x && x !== v; x = x.parentElement) { const s = getComputedStyle(x); if (/(auto|scroll|hidden|clip)/.test(s.overflowX)) return true; } return false; };
  for (const e of v.querySelectorAll('*')) {
    if (e.closest('.psurge-sr')) continue;
    const r = e.getBoundingClientRect(); if (!r.width && !r.height) continue;
    if ((r.right > vw + 0.5 || r.left < -0.5) && !clipped(e)) bad.push((e.className?.baseVal ?? e.className) + ' ' + Math.round(r.left) + '…' + Math.round(r.right));
    const own = [...e.childNodes].some(n => n.nodeType === 3 && n.textContent.trim());
    if (own && !e.closest('svg')) { const fs = parseFloat(getComputedStyle(e).fontSize); if (fs < 16.95) tiny.push(e.textContent.trim().slice(0, 20) + ' ' + fs + 'px'); }
  }
  for (const e of v.querySelectorAll('a, button, summary')) {
    const r = e.getBoundingClientRect(); if (!r.width || !r.height || e.closest('[hidden]')) continue;
    if (r.width < 43.5 || r.height < 43.5) small.push((e.textContent || e.getAttribute('aria-label') || '').trim().slice(0, 24) + ' ' + Math.round(r.width) + '×' + Math.round(r.height));
  }
  return {sw: document.documentElement.scrollWidth, vw, bad: bad.slice(0, 6), small: small.slice(0, 6), tiny: tiny.slice(0, 6)};
});
const BOX_HASH = box => '#/surge' + (box ? '/' + box : '');

/* ── ① 맞대기 · ② 세 폭 ── */
for (const sc of RUN) {
  const S = sc.S && sc.S !== 404 ? sc.S : SITE_S, K = sc.K && sc.K !== 404 ? sc.K : SITE_K, names = namesOf(S, K);
  const ctx = await ctxFor(sc), po = await pageIn(ctx, sc), pn = await pageIn(ctx, sc);
  try {
    for (const [i, [box]] of BOXES.entries()) {
      const hash = BOX_HASH(box);
      await open(po, 'old', hash, i === 0); await open(pn, 'new', hash, i === 0);
      const [o, n] = [oldToNewDeep(await grab(po, '#view')), await grab(pn, 'main#view')]; // 옛 쪽 글은 이름만 새 이름으로(rename.mjs)
      compare(sc, box, o, n, names);
    }
    for (const p of [po, pn]) for (const e of p._errs) fail('화면 오류', `${sc.id} ${p === po ? '옛' : '새'} — ${e}`);
  } catch (e) { fail('맞대기 멈춤', `${sc.id} — ${e.message}`); }
  await ctx.close();
  if (sc.widths) for (const [w, fk] of WIDTHS) {
    const c2 = await ctxFor(sc, w), p = await pageIn(c2, sc), wl = w + 'px' + (fk ? ' 글씨' + (fk === 2 ? ' 아주 크게' : ' 크게') : '');
    if (fk) await c2.addInitScript(k => { try { localStorage.setItem('atlas:font', String(k)); } catch { /* 기억 못 함 */ } }, fk);
    try {
      for (const [i, [box]] of BOXES.entries()) {
        const hash = BOX_HASH(box); await open(p, 'new', hash, i === 0);
        const L = await layout(p), at = `${sc.id} ${wl} ${hash}`;
        if (L.sw > L.vw) fail('가로 넘침', `${at} — ${L.sw} > ${L.vw}`);
        for (const x of L.bad) fail('화면 밖 칸', `${at} — ${x}`);
        for (const x of L.small) fail('누르는 자리 작음', `${at} — ${x}`);
        for (const x of L.tiny) fail('글 작음', `${at} — ${x}`);
        bump('폭 화면');
        if (SHOTS && w === 360 && !fk && sc.id === 'site') { await fs.mkdir(SHOTS, {recursive: true}); await p.screenshot({path: path.join(SHOTS, `surge-${box || 'sv'}-360.png`), fullPage: true}); }
      }
      for (const e of p._errs) fail('화면 오류', `${sc.id} ${wl} — ${e}`);
    } catch (e) { fail('폭 검사 멈춤', `${sc.id} ${wl} — ${e.message}`); }
    await c2.close();
  }
}

/* ── ③ 관심 없음(이 기기 기억 · 옛 쪽과 같은 열쇠) ── */
const hideSc = [...SC].reverse().find(s => s.hide); // 마지막 업데이트 기록(들고 남 · 옮김 · 따라간 날)
if (!hideSc) fail('관심 없음 검사 못 함', '따라간 날이 있는 달력 자료가 없음(reports/atlas11/t365/surgecal-latest.json)');
else {
  const ctx = await ctxFor(hideSc), p = await pageIn(ctx, hideSc);
  try {
    await open(p, 'new', '#/surge', true);
    const rows0 = await p.locator('main#view .psurge-tr').count();
    if (!rows0) throw Error('따라간 줄이 없음');
    const code = await p.locator('main#view .psurge-tr').first().getAttribute('data-c'), name = await p.locator('main#view .psurge-tr').first().locator('a.psurge-nm').textContent();
    await p.locator('main#view .psurge-tr').first().locator('button.psurge-hide').click();
    const st1 = await p.evaluate(c => ({ph: document.querySelector(`main#view .psurge-ph[data-c="${c}"]`)?.innerText ?? '', mem: localStorage.getItem('atlas:surge-hide'), live: document.querySelector('main#view .psurge-sr')?.textContent ?? '', rows: document.querySelectorAll('main#view .psurge-tr').length, focus: document.activeElement?.className ?? ''}), code);
    if (!st1.ph.includes(`${name} 숨겼어요`) || !st1.ph.includes('되돌리기')) fail('관심 없음 — 자리 글', st1.ph);
    if (st1.mem !== JSON.stringify([code])) fail('관심 없음 — 기억 꼴', `${st1.mem} ≠ ${JSON.stringify([code])}`);
    if (!st1.live.includes(`${name} 숨겼어요.`)) fail('관심 없음 — 소리 글', st1.live);
    if (st1.rows !== rows0 - 1) fail('관심 없음 — 줄 수', `${rows0} → ${st1.rows}`);
    if (!/psurge-undo/.test(st1.focus)) fail('관심 없음 — 초점', st1.focus);
    await p.locator(`main#view .psurge-ph[data-c="${code}"] button.psurge-undo`).click();
    const st2 = await p.evaluate(c => ({row: !!document.querySelector(`main#view .psurge-tr[data-c="${c}"]`), mem: localStorage.getItem('atlas:surge-hide'), live: document.querySelector('main#view .psurge-sr')?.textContent ?? ''}), code);
    if (!st2.row || st2.mem !== '[]' || !st2.live.includes('다시 보여요')) fail('되돌리기', JSON.stringify(st2));
    await p.locator(`main#view .psurge-tr[data-c="${code}"] button.psurge-hide`).click();
    await open(p, 'new', '#/surge', true); // 다시 열기(새로 읽음)
    const st3 = await p.evaluate(c => ({row: !!document.querySelector(`main#view .psurge-tr[data-c="${c}"]`), gone: document.querySelector('main#view details.psurge-gone')?.textContent ?? ''}), code);
    if (st3.row) fail('다시 열어도 빠짐', '숨긴 줄이 다시 보임');
    if (!st3.gone.includes('숨긴 곳 1곳 보기') || !st3.gone.includes(name)) fail('숨긴 곳 칸', st3.gone);
    for (const [box] of BOXES.slice(1)) { // 다섯 칸 모두 같은 목록
      await open(p, 'new', BOX_HASH(box), false);
      const r = await p.evaluate(c => ({row: !!document.querySelector(`main#view .psurge-tr[data-c="${c}"]`), g: !!document.querySelector(`main#view details.psurge-gone button[data-c="${c}"]`), any: document.querySelector('main#view .psurge-trs')?.textContent ?? ''}), code);
      if (r.row) fail('다섯 칸 모두 숨김', `#/surge/${box} 에 숨긴 줄이 보임`);
      bump('관심 없음 칸');
    }
    const po = await pageIn(ctx, hideSc); await open(po, 'old', '#/surge', true);
    const oldSees = await po.evaluate(c => ({row: !!document.querySelector(`#view .sv-tr[data-c="${c}"]`), gone: document.querySelector('#view details.sv-gone')?.textContent ?? ''}), code);
    if (oldSees.row || !oldSees.gone.includes(name)) fail('옛 쪽과 같은 기억', JSON.stringify(oldSees));
    await po.close();
    await open(p, 'new', '#/surge', false);
    await p.locator('main#view details.psurge-gone summary').click();
    await p.locator(`main#view details.psurge-gone button.psurge-show[data-c="${code}"]`).click();
    const st4 = await p.evaluate(c => ({row: !!document.querySelector(`main#view .psurge-tr[data-c="${c}"]`), mem: localStorage.getItem('atlas:surge-hide'), gone: !!document.querySelector('main#view details.psurge-gone')}), code);
    if (!st4.row || st4.mem !== '[]' || st4.gone) fail('숨긴 곳 되돌리기', JSON.stringify(st4));
    // 기억 못 하는 기계(사생활 창 등) — 쓰기가 막히면 그 화면 동안만 숨기고 「다시 열면 돌아와요」
    await p.evaluate(() => { const set = Storage.prototype.setItem; window.__set = set; Storage.prototype.setItem = function () { throw new Error('full'); }; });
    await p.locator(`main#view .psurge-tr[data-c="${code}"] button.psurge-hide`).click();
    const st5 = await p.evaluate(() => document.querySelector('main#view .psurge-sr')?.textContent ?? '');
    if (!st5.includes('이 기계는 기억을 못 해 다시 열면 돌아와요.')) fail('기억 못 하는 기계', st5);
    await p.evaluate(() => { Storage.prototype.setItem = window.__set; });
    bump('관심 없음 검사');
    for (const e of p._errs) fail('화면 오류', `관심 없음 — ${e}`);
  } catch (e) { fail('관심 없음 검사 멈춤', e.message); }
  await ctx.close();
}

/* ── ④ 회사를 보고 돌아오면 그 날 · 묶음 그대로 · 없는 주소 · 자료 못 받음 ── */
if (hideSc) {
  const ctx = await ctxFor(hideSc), p = await pageIn(ctx, hideSc);
  try {
    await open(p, 'new', '#/surge', true);
    const days = await p.$$eval('main#view button.psurge-cell', bs => bs.map(x => [x.dataset.d, x.getAttribute('aria-pressed')]));
    const other = days.find(d => d[1] === 'false')?.[0];
    if (!other) fail('돌아오기 검사 못 함', '고를 다른 날이 없음');
    else {
      await p.locator(`main#view button.psurge-cell[data-d="${other}"]`).click();
      const co = await p.locator('main#view .psurge-board a.psurge-br').first().getAttribute('href');
      await p.evaluate(h => { location.hash = h; }, co);
      await p.waitForFunction(h => location.hash === h && !document.querySelector('main#view .boot'), co, {timeout: 15000});
      await p.evaluate(() => { for (const e of document.querySelector('main#view').children) e.dataset.stale = '1'; history.back(); });
      await p.waitForFunction(() => { const v = document.querySelector('main#view'); return location.hash === '#/surge' && v && !v.querySelector('.boot') && [...v.children].some(e => !e.dataset.stale && e.querySelector('h1')); }, null, {timeout: 15000});
      const now = await p.$eval('main#view button.psurge-cell[aria-pressed="true"]', x => x.dataset.d).catch(() => null);
      if (now !== other) fail('돌아오면 고른 날', `${now} ≠ ${other}`);
      const shown = await p.$eval(`main#view .psurge-day[data-d="${other}"]`, x => !x.hidden).catch(() => false);
      if (!shown) fail('돌아오면 그날 판', other);
      bump('돌아오기 검사');
    }
  } catch (e) { fail('돌아오기 검사 멈춤', e.message); }
  await ctx.close();
}
{ // 없는 주소 — 옛 쪽 「없는 주소입니다」와 같은 두 줄
  const sc = {id: 'missing', S: null, K: null, at: Date.now()}, ctx = await ctxFor(sc), po = await pageIn(ctx, sc), pn = await pageIn(ctx, sc);
  try {
    for (const bad of ['#/surge/abc', '#/surge/50', '#/surge/10/x']) {
      await open(po, 'old', bad, true); await open(pn, 'new', bad, true);
      const [o, n] = [oldToNewDeep(await grab(po, '#view')), await grab(pn, 'main#view')];
      for (const L of ['없는 주소입니다', '주소가 바뀌었거나 잘못 들어왔습니다.', '처음 화면으로']) { if (!o.text.includes(L)) fail('옛 쪽 없는 주소 글', `${bad} — ${L}`); if (!norm(n.text).includes(L)) fail('없는 주소 글', `${bad} — ${L}`); }
      bump('없는 주소');
    }
    for (const p of [po, pn]) for (const e of p._errs) fail('화면 오류', `없는 주소 — ${e}`);
  } catch (e) { fail('없는 주소 검사 멈춤', e.message); }
  await ctx.close();
}
for (const sc of NEW_ONLY) { // 자료 못 받음 — 새 쪽만(옛 쪽은 「자료를 못 읽었습니다」 · 바탕을 못 받으면 옛 쪽은 아예 안 열림)
  const ctx = await ctxFor(sc), p = await pageIn(ctx, sc);
  try {
    for (const [i, [box]] of BOXES.entries()) {
      await open(p, 'new', BOX_HASH(box), i === 0);
      const n = await grab(p, 'main#view');
      if (!norm(n.text).includes(sc.expect)) fail('자료 못 받음 글', `${sc.id} ${BOX_HASH(box)} — ${sc.expect}`);
      if (!/급등\s*10%\s*20%\s*30%\s*40%/.test(norm(n.text))) fail('자료 못 받음 — 다섯 칸', `${sc.id} ${BOX_HASH(box)}`);
      bump('자료 못 받음');
    }
    for (const e of p._errs) fail('화면 오류', `${sc.id} — ${e}`);
  } catch (e) { fail('자료 못 받음 검사 멈춤', `${sc.id} — ${e.message}`); }
  await ctx.close();
}
await b.close();

const res = {at: new Date().toISOString(), base, secs: Math.round((Date.now() - t0) / 1000), scenarios: RUN.map(s => s.id), time: tm.get(), net: netSummary(), counts, fail: counts.fail || 0, fails};
console.log(JSON.stringify({time: res.time, net: res.net})); // 옛 쪽 · 새 쪽 여는 데 쓴 초 · 다시 받은 수(명령문 [1] 9)
if (OUT) { await fs.mkdir(path.dirname(path.resolve(OUT)), {recursive: true}); await fs.writeFile(path.resolve(OUT), JSON.stringify(res, null, 1) + '\n'); }
console.log(`급등 다섯 칸 맞대기 — 자료 판 ${RUN.length}개(${RUN.map(s => s.id).join(' · ')}) · ${res.secs}초`);
console.log(Object.entries(counts).filter(([k]) => k !== 'fail').map(([k, v]) => `${k} ${v.toLocaleString('ko-KR')}`).join(' · '));
if (res.fail) { console.log(`실패 ${res.fail}건`); for (const [k, x] of fails.slice(0, 60)) console.log(' ✗', k, '—', x); process.exit(1); }
console.log('실패 0');
