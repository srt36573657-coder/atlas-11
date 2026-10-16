/* 도움말(#/info) — 지금 아틀란스(site/atlas/atlas.js showInfo(null) 판 · funnel)를 새 화면의 보통 쪽으로 옮김(2026-10-17 04:23 「에이전트 총 동원해」 · 규칙 74)
   「ATLAS 는 어떻게 셌나요」 — 고른 기준(멍거 · 린치 조건 · 규칙 59) · 깔때기 두 갈래 · 셈 · 자료 · 때 · 업데이트 기록 고리(#/up · 규칙 72) · 모르는 것 ?
   글 · 숫자는 옛 쪽 그대로(scripts/atlas11/next/check_misc.mjs 가 맞대 봄) · 모양만 새 아틀란스(제목 → 그림(깔때기) → 글 → 접은 칸) */
const NX = globalThis.NX;
const {h} = NX;
const md = d => { const p = String(d).split('-'); return (+p[1]) + '월 ' + (+p[2]) + '일'; }; // 옛 쪽 md 그대로(붙임 띄어쓰기)
const NP = C => C?.funnel?.picked ?? '?';
const pickName = C => `${C?.rules?.name ?? '고른'} ${NP(C)}곳`;
const pickLine = C => C?.rules?.line ?? (C?.rules?.conds?.length ? C.rules.conds.map(x => x.t).join(' · ') : '? 고른 기준을 못 읽었습니다');
const lyDay = C => (C?.rules?.lyDay ? md(C.rules.lyDay) : '모음 날');
const pickHow = C => `멍거 갈래는 3년 성적표만, 린치 갈래는 3년 성적표와 ${lyDay(C)} 값으로 골랐습니다`;
const MN = C => (C?.mkt?.n ?? NP(C)); // 모든 회사 수
function foot(C) {
  return h('footer', {class: 'pinfo-foot'},
    h('p', {class: 'pinfo-links'}, h('a', {href: '/hello.html', text: '친구에게 소개하기'}), h('a', {href: '/us/', text: '미국 판'})),
    h('p', {text: `자료: ${C.sources?.price ?? '?'} · 기준일 = 마지막 종가 날(${md(C.asOf)})의 ${C.days}거래일 전(${md(C.base)}) · ${pickName(C)} — ${pickHow(C)}(그 뒤 주가는 안 씀).`}),
    C.provisional ? h('p', {class: 'q', text: `? ${md(C.asOf)} 값은 그날 저녁 8시 전에 받아 아직 바뀔 수 있습니다(시간외 · 넥스트레이드) — 다음 받기에서 고쳐집니다.`}) : null,
    h('p', {class: 'safe', text: '아틀란스는 지난 기록만 보여 줘요. 사고팔기를 권하지 않아요.'}),
    h('p', {class: 'safe pinfo-safe2', text: '투자 상담이 아니에요. 지난 기록을 센 공부예요.'}));
}
/** 깔때기 두 갈래(멍거 · 린치 — 2026-10-14 06:05 「가」) — 막대 길이 = 목록 모두 가운데 남은 몫(옛 쪽 funnel 그대로 · r 없이) */
function funnel(C) {
  const F = C.funnel ?? {}, wrap = h('div', {class: 'pinfo-funnels'});
  for (const g of F.groups ?? []) {
    const ol = h('ol', {class: 'pinfo-funnel'});
    for (const s of g.steps ?? []) { const fill = h('i', {class: 'fill'}); fill.style.setProperty('width', (s.n / F.universe * 100) + '%');
      ol.append(h('li', {}, fill, h('span', {}, h('b', {class: 'num', text: s.n.toLocaleString('ko-KR') + '곳'}), h('span', {text: s.t})))); }
    wrap.append(h('p', {class: 'pinfo-fname'}, h('b', {text: `${g.name} ${g.n}곳`})), ol);
  }
  return wrap;
}
const ul = (...xs) => h('ul', {class: 'pinfo-ul'}, ...xs.filter(Boolean).map(t => (t instanceof Node ? t : h('li', {text: t}))));

export async function render() {
  const C = await NX.need('core');
  if (!C) return {title: 'ATLAS 는 어떻게 셌나요', nodes: NX.noData()};
  const F = C.facts ?? {}, RU = C.rules ?? {}, root = h('div', {class: 'pinfo', 'data-page': 'info'});
  root.append(h('h1', {class: 'wt', text: 'ATLAS 는 어떻게 셌나요'}),
    h('p', {class: 'pinfo-lead'}, h('b', {text: pickName(C)}), ` — ${pickLine(C)}.`),
    h('p', {class: 'pinfo-p', text: `${RU.notMunger} ${pickHow(C)} · 앞날 값은 쓰지 않았습니다 · 순서가 아닙니다.`}));
  // 그림 한 장 — 깔때기 두 갈래(목록 모두 → 고른 곳)
  root.append(h('h2', {class: 'sec', text: `${pickName(C)}은 이렇게 골랐습니다`}), funnel(C));
  for (const g of RU.groups ?? []) root.append(h('p', {class: 'pinfo-p'}, h('b', {text: `${g.name} ${g.n}곳`}), ` — ${g.conds.map(x => x.t).join(' · ')} · ${g.who}`));
  root.append(h('p', {class: 'pinfo-p', text: C.mkt ? `모든 회사 ${MN(C).toLocaleString('ko-KR')}곳이 지난 ${C.days}거래일(기준일 ${md(C.base)} → ${md(C.asOf)} · 장이 열린 날 ${C.days}번, 약 한 달) 어떻게 움직였는지, 큰 갈래 → 업종 → 회사로 눌러 봅니다. 금빛 = ${pickName(C)} — 이 회사들만 7단까지 봅니다. 앞날 값은 6단 회사 크기 범위(세 팀의 따짐)와 7단 몬테카를로 범위(모형 셈)로만 보이며, 맞힘이 아닙니다.`
    : `이 ${NP(C)}곳이 지난 ${C.days}거래일(기준일 ${md(C.base)} → ${md(C.asOf)} · 장이 열린 날 ${C.days}번, 약 한 달) 어떻게 움직였는지, 큰 갈래 → 업종 → 회사 → 7단까지 눌러 봅니다. 앞날 값은 6단 회사 크기 범위(세 팀의 따짐)와 7단 몬테카를로 범위(모형 셈)로만 보이며, 맞힘이 아닙니다.`}));
  root.append(h('p', {class: 'pinfo-p', text: `줄 아래 「▲ 강하게 오름 · 힘 붙음」 = 이 기간의 방향 · 세기 · 힘입니다. 방향 = 기간 동안 그은 곧은 선이 3% 넘게 기울고 처음보다 끝도 같은 쪽(아니면 「옆걸음」) · 강하게 = 그 선이 10% 넘고 들쭉날쭉하지 않음 · 힘 붙음 = 뒤 ${Math.floor(C.days / 2)}거래일이 앞 ${Math.floor(C.days / 2)}거래일보다 3%p 넘게 더 오름(「힘 빠짐」은 그 반대). 지난 기록이고 앞날 값이 아닙니다. ${pickHow(C)}.`}));
  root.append(h('details', {class: 'pinfo-more'}, h('summary', {text: '두 사람의 말 · 원문'}), h('div', {class: 'pinfo-in'}, ul(...(RU.conds ?? []).map(x => `${x.t} — 「${x.q}」 · ${x.who}`), RU.data, RU.q))));
  root.append(ul(RU.price, RU.wait, RU.notCounted, RU.limits,
    F.mg?.per30 ? `멍거 갈래에서 값이 1년 이익의 30배 넘는 곳 ${F.mg.per30}곳도 그대로 둡니다 — 회사마다 몇 배인지 보여 드립니다.` : null,
    C.provisional ? h('li', {class: 'q', text: '? 장 중 값 — 오후 3시 30분 종가 전이라 오늘 값은 바뀔 수 있습니다. 고른 곳은 그대로입니다.'}) : null));
  root.append(h('h2', {class: 'sec', text: '셈'}), ul(
    `${md(C.base)} 종가 = 100. 「한 회사 한 표」 = 날마다 회사들의 오르내림을 같은 무게로 평균 내어 이어 곱함(하루 ±50% 넘는 값은 자료 오류로 뺌).`,
    `「큰 회사는 크게」 = ${md(C.base)}에 시가총액만큼 사 두었다고 보고 그대로 둔 값.`,
    '배당은 넣지 않은 주가만 셉니다. 「가장 깊이 빠짐」 = 꼭대기에서 가장 많이 내려간 비율.'));
  root.append(h('h2', {class: 'sec', text: '자료 · 때'}), ul(C.sources?.price, C.sources?.pick));
  root.append(h('a', {class: 'pinfo-go', href: '#/up'}, h('span', {}, h('b', {text: '업데이트 기록 보기 ›'}), h('span', {text: ' — 하루 4번 다시 센 기록 · 시장 판독 · 네 눈 점검'})))); // 업데이트 기록은 도움말의 고리로(규칙 72)
  root.append(h('h2', {class: 'sec', text: '모르는 것 ?'}), h('ul', {class: 'pinfo-ul pinfo-qs'},
    h('li', {text: '? 거래정지 · 관리종목 · 투자경고 표시 — 아직 거르지 못합니다.'}),
    h('li', {text: C.sincePick ? `? 고른 뒤 기록 — ${md(C.pickAsOf)} 뒤 ${C.sincePick}거래일뿐이라 아직 짧습니다.` : `? 고른 뒤 기록 — ${md(C.pickAsOf)} 종가로 골라 고른 뒤 기록은 아직 없습니다. 지금 보이는 선은 모두 고른 기간 안입니다.`}),
    h('li', {text: '? 증권사 짐작 — 자주 바뀝니다. 6단 그림의 올해 매출 한 칸(점선 · 「남의 짐작」)에 쓰고, 세 팀 이야기 글 속에 증권사 짐작을 옮긴 곳도 있습니다 — 그대로 믿을 값이 아닙니다. 고를 때는 쓰지 않습니다.'}),
    C.funnel?.q ? h('li', {text: `? 두 조건 모두 셀 자료가 없는 ${C.funnel.q}곳은 넣지 않았습니다.`}) : null,
    h('li', {text: `? 다시 고르기 — ${RU.next}.`})));
  root.append(foot(C));
  return {title: 'ATLAS 는 어떻게 셌나요', nodes: [root]};
}
