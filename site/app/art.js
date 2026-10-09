/* ATLAS 11 · 그림 한 장 공통 틀(규칙 33 · 2026-10-09 규칙 42 로 고침)
   2026-10-09 「ATLAS 업데이트 실행 프롬프트」(사장님 01:41 마카오 시각 첨부) 0-F · 7 — 애니메이션은 이해를 돕는 데만:
   · 처음에는 최신 결과가 멈춘 채로 보인다(저절로 재생 없음 · 무대 · 배우 · 끝없는 장식 움직임 없음 — 옛 규칙 35 를 내림)
   · 기승전결 = 현재 관측 → 기여 요인 → 반대 근거 → 다음 확인 — 차례 단추 넷(누르면 그 차례로) · 처음으로 · 이전 · 재생/정지 · 다음 · 최신 결과 · 빠르기
   · 움직임은 사람이 고를 때만 · 한 번에 하나 · 상태 바뀜은 바로(차례 단추 · 흐림) · 구성 움직임 0.3~0.6초(--dur) · 움직임 줄이기 설정이면 움직임 없이 바뀜
   · 새 자료가 와도 사람이 보던 차례를 처음으로 돌리지 않는다(이 틀은 화면을 새로 그릴 때만 만들어짐 · 저절로 다시 돌지 않음)
   · 그림 속 이름 · 숫자는 HTML(또렷함 · 번역 · 화면 읽기) — 차트 부품은 charts.js
   옛 틀(2026-10-08 01:27 「다 한다」 · 06:40 무대 · 10:34 배우)에서 뺀 것: 처음 그릴 때 저절로 한 번 · 무대 · 배우 둘 · 그림마다 「소리로 듣기」(위 막대 소리 단추가 화면 요약을 읽음) */
import {h, pct, finite} from './util.js';
import {hold, release} from './motion.js';

/** 변화 한 개(소수 한 자리 · 아주 작으면 둘째 자리) — 판(board) 값(소수 · 0.123 = +12.3%) */
export const p1 = v => pct(v, finite(v) && Math.abs(v) < 0.0005 ? 2 : 1);
/** 오름 · 내림 숫자(빨강 · 파랑 · 부호) — 판 값(소수) */
export const chgEl = (v, cls = '') => h('b', {class: `rt-n ak-c${v > 0 ? ' up' : v < 0 ? ' down' : ''}${cls ? ' ' + cls : ''}`}, finite(v) ? p1(v) : '없음');
/** 회사 이름 — 이름 그대로(이름 속 숫자를 단위 없는 숫자로 세지 않음) */
export const coName = (name, cls = 'ra-n') => h('p', {class: cls}, h('span', {'data-ident': ''}, name));
/** 업종 · 갈래 이름 */
export const grName = (label, cls = 'ra-n') => h('p', {class: cls}, label);
export const f1 = v => (Number.isFinite(v) ? (Math.round(v * 10) / 10).toFixed(1) : '0');

/** 차례 넷의 이름(지시서 7 「현재 관측 → 기여 요인 → 반대 근거 → 다음 확인」) */
export const BEATS = ['관측과 비교', '구성과 기여', '반대 근거', '확인할 것']; // 2026-10-09 셋째 개정본 0-F 기승전결(기 = 현재 관측과 비교 · 승 = 구성과 기여 · 전 = 반대 근거와 제외 비교 · 결 = 다음 확인과 기록) — 옛 「현재 관측 · 기여 요인」 // 넷째 = 지시서의 「다음 확인」(화면 글은 흐릿한 말 「다음」 없이 · 또렷함 2번)
/** 검사기만 쓰는 빠르기(atlas11:speed · 1~10) — 움직임 검사를 빠르게 돌 때 걸음 시간만 나눔 */
const TEST_SPEED = (() => { try { const v = Number(JSON.parse(localStorage.getItem('atlas11:speed') ?? '1')); return v >= 1 && v <= 10 ? v : 1; } catch { return 1; } })();
let speed = 1; // 사람이 고른 빠르기(1배 · 2배) — 이 창에서 그림끼리 같이 씀
const durOf = ms => Math.max(300, Math.min(600, ms - 150)); // 구성 움직임 0.3~0.6초(다음 걸음과 겹치지 않게 머무는 시간보다 짧게)

/**
 * 그림 한 장 — 차트(art · 요소 또는 HTML 글) + 이름 · 숫자(labels) + 차례 단추 넷 + 처음으로 · 이전 · 재생 · 다음 · 최신 결과 · 빠르기
 * spec = {key(그림 이름), art | svg(차트), labels(HTML 요소), steps([{c: 차례 0~3, at: 켜지는 부품 번호, ms: 머무는 시간}]), cls, labFirst(요약을 차트 위에 — 기본), tail(차트 · 요약 다음 줄들)}
 *   2026-10-09 모든 그림이 요약(이름 · 숫자) 먼저 → 차트(Apple 날씨 · 주식처럼 답 먼저 · 근거 그림 다음) — 긴 말 · 큰 글씨에서도 이름 · 숫자가 첫 화면에(규칙 30) · 펼치기 · 업종 순환 · 회사 그림이 먼저 쓰던 차례
 * 부품(data-at = 번호)은 처음부터 모두 켜짐(최신 결과) — 차례를 고르면 그 차례까지 켜지고 나머지는 흐려짐 · 지금 부품 하나만 움직임
 */
export function artStage(spec) {
  const {key, art = null, svg = null, labels, steps, cls = '', labFirst = true, tail = []} = spec;
  const artEl = art instanceof Node ? h('div', {class: 'ra-art'}, art) : h('div', {class: 'ra-art', html: art ?? svg ?? ''});
  const last = steps.length - 1;
  const beatBtns = BEATS.map((name, c) => h('button', {type: 'button', class: 'ra-beat', 'data-c': String(c), 'aria-pressed': 'false', onclick: () => jump(c)}, name));
  const btn = (k, label, fn, extra = {}) => h('button', {type: 'button', class: 'ra-b ra-' + k, onclick: fn, ...extra}, label);
  const playBtn = btn('play', '재생', () => (playing ? pause() : play()), {'aria-pressed': 'false'});
  const speedBtn = btn('speed', `빠르기 ${speed}배`, () => { speed = speed === 1 ? 2 : 1; speedBtn.textContent = `빠르기 ${speed}배`; speedBtn.setAttribute('aria-pressed', String(speed > 1)); }, {'aria-pressed': String(speed > 1)});
  const ctl = h('div', {class: 'ra-ctl'},
    h('div', {class: 'ra-beats', role: 'group', 'aria-label': '차례'}, ...beatBtns),
    h('div', {class: 'ra-btns', role: 'group', 'aria-label': '다시 보기'},
      btn('first', '처음으로', () => { pause(); paint(0); }), btn('prev', '‹', () => { pause(); paint(Math.max(0, (done ? last : cur) - 1)); }, {'aria-label': '이전 걸음', title: '이전 걸음'}),
      playBtn, btn('next', '›', () => { pause(); if (done) return; if (cur >= last - 1) finish(); else paint(cur + 1); }, {'aria-label': '다음 걸음', title: '다음 걸음'}),
      btn('last', '최신 결과', () => { pause(); finish(); }), speedBtn));
  // ra-rest = 처음(최신 결과)에는 「재생」 하나만 보임 — 누르면 차례 넷 · 단추 여섯이 열림(2026-10-09 08:26 「넘 글이 많다」)
  const box = h('div', {class: `ra ra-done ra-rest${cls ? ' ' + cls : ''}`, 'data-scene': key, 'data-steps': String(steps.length), 'data-plan': steps.map(s => `${s.c}:${s.at}`).join(','), // data-plan = 걸음마다 차례:부품 번호(검사기가 계산으로 봄)
    'data-step': String(last), 'data-c': String(steps[last]?.c ?? 3)}, ...(labFirst ? [labels, artEl] : [artEl, labels]), ...tail, ctl); // labFirst = 요약 숫자를 차트 위에(펼치기 — 첫 화면에 숫자가 먼저)
  const parts = [...box.querySelectorAll('[data-at]')];
  for (const s of steps) for (const el of parts) if (Number(el.dataset.at) === s.at) el.style.setProperty('--dur', `${durOf(s.ms)}ms`);
  let cur = last, done = true, playing = false, timer = 0;
  function mark(c, all = false) { beatBtns.forEach((b, k) => { b.classList.toggle('on', all || k < c); b.setAttribute('aria-pressed', String(!all && k === c)); }); }
  /** 걸음 i 모습 — moving = 재생 중(지금 부품 하나만 움직임) · 아니면 바로 바뀜 */
  function paint(i, moving = false) {
    cur = i; done = false; const x = steps[i];
    box.classList.remove('ra-done'); box.classList.toggle('ra-moving', moving); box.dataset.step = String(i); box.dataset.c = String(x.c);
    for (const el of parts) { const k = Number(el.dataset.at), now = k === x.at; el.classList.toggle('on', k <= x.at); if (now && moving) { el.classList.remove('now'); void el.getBoundingClientRect(); } el.classList.toggle('now', now); }
    mark(x.c);
  }
  function finish() { cur = last; done = true; box.classList.add('ra-done'); box.classList.remove('ra-moving'); box.dataset.step = String(last); box.dataset.c = String(steps[last]?.c ?? 3);
    for (const el of parts) { el.classList.add('on'); el.classList.remove('now'); } mark(3, true); }
  function pause() { clearTimeout(timer); if (playing) { playing = false; playBtn.textContent = '재생'; playBtn.setAttribute('aria-pressed', 'false'); release(box); } box.classList.remove('ra-moving'); }
  function play() {
    box.classList.remove('ra-rest'); pause(); playing = true; playBtn.textContent = '정지'; playBtn.setAttribute('aria-pressed', 'true'); hold(box);
    let i = done || cur >= last ? 0 : cur + 1;
    const next = () => {
      if (!playing) return;
      if (!box.isConnected) { pause(); return; }
      if (i > last) { pause(); finish(); return; }
      const x = steps[i]; paint(i++, true);
      timer = setTimeout(next, x.ms / (speed * TEST_SPEED));
    };
    next();
  }
  /** 차례 단추 — 그 차례의 첫 걸음으로(멈춘 채) */
  function jump(c) { pause(); const i = steps.findIndex(s => s.c === c); if (i >= 0) { if (i === last) finish(); else paint(i); } }
  mark(3, true);
  return box;
}

/** 그림 칸 — 맨 위 작은 이름표(kicker · when) · 큰 줄(title 조각) · 그림 · 그 아래(rest) · first = 판단 정보 칸 번호(시장 · 업종 첫 화면의 ④) */
export function artSection({key, label, kicker, when = null, title = null, stage, rest = [], cls = '', first = null}) {
  return h('section', {class: `fig sy-fig ak${cls ? ' ' + cls : ''}`, 'aria-label': label ?? kicker, 'data-art': key, 'data-first': first == null ? null : String(first)},
    h('p', {class: 'sy-k'}, h('span', null, kicker), when ? h('span', {class: 'sy-kw'}, when) : null),
    title ? h('p', {class: 'ra-t'}, ...[].concat(title)) : null,
    stage, ...rest);
}
