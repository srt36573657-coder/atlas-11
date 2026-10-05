// 심부름꾼들이 화면에 적은 「읽은 것」 숫자를 내가 따로 셈해서 맞춰 봄
import fs from 'node:fs';
const window = {}; eval(fs.readFileSync('./maps/data.js', 'utf8'));
const A = window.ATLAS, K = A.kr, U = A.us;
const sum = a => a.reduce((s, x) => s + x, 0), mean = a => sum(a) / a.length;
const p = v => (v * 100).toFixed(1) + '%';
const famL = (S, id) => S.families.find(f => f.id === id).label;
const out = [];
// 1 땅 지도
const tot = sum(K.companies.map(c => c.cap));
const famCap = K.families.map(f => [f.label, sum(K.companies.filter(c => c.fam === f.id).map(c => c.cap))]).sort((a, b) => b[1] - a[1]);
const red = sum(K.companies.filter(c => c.change20 > 0).map(c => c.cap)) / tot;
const ups = K.companies.filter(c => c.change20 > 0).sort((a, b) => b.cap - a.cap)[0], dns = K.companies.filter(c => c.change20 < 0).sort((a, b) => b.cap - a.cap)[0];
out.push(`1) 가장 넓은 ${famCap[0][0]} ${p(famCap[0][1] / tot)} · 붉은 땅 ${p(red)} · 큰 붉은 ${ups.name} ${p(ups.change20)} · 큰 푸른 ${dns.name} ${p(dns.change20)} · 회사 수 붉은 ${K.companies.filter(c => c.change20 > 0).length} 푸른 ${K.companies.filter(c => c.change20 < 0).length}`);
// 2 1년 전
const past = c => c.cap / (1 + c.ret252);
const totP = sum(K.companies.map(past));
const sh = K.families.map(f => { const cs = K.companies.filter(c => c.fam === f.id); return {l: f.label, a: sum(cs.map(past)) / totP, b: sum(cs.map(c => c.cap)) / tot}; }).map(x => ({...x, d: x.b - x.a})).sort((x, y) => y.d - x.d);
out.push(`2) ${(tot / 10000).toFixed(0)}조 / 1년 전 ${(totP / 10000).toFixed(0)}조 = ${(tot / totP).toFixed(4)}배 · 넓어짐 ${sh[0].l} ${p(sh[0].a)}→${p(sh[0].b)} · 좁아짐 ${sh.at(-1).l} ${p(sh.at(-1).a)}→${p(sh.at(-1).b)}`);
// 3 산맥
const gs = [...K.groups].sort((a, b) => b.change20 - a.change20);
const fm = K.families.map(f => ({l: f.label, m: mean(K.groups.filter(g => g.fam === f.id).map(g => g.change20))})).sort((a, b) => b.m - a.m);
out.push(`3) 최고 ${gs[0].label} ${p(gs[0].change20)} · 산맥 ${fm[0].l} ${p(fm[0].m)} · 바다 아래 ${K.groups.filter(g => g.change20 < 0).length} · 가장 깊은 ${gs.at(-1).label} ${p(gs.at(-1).change20)} · 갈래 평균 끝 ${fm.at(-1).l} ${(fm.at(-1).m * 100).toFixed(2)}%`);
// 4 노선
const lines = K.themes.map(t => { const st = [...new Set(K.companies.filter(c => c.theme === t.id).map(c => c.group))]; return {l: t.label, n: st.length, m: mean(st.map(id => K.groups.find(g => g.id === id).change20))}; }).sort((a, b) => b.m - a.m);
out.push(`4) ${lines.map(x => `${x.l}(${x.n}) ${p(x.m)}`).join(' · ')}`);
// 5 나침반
const med = a => { const v = [...a].sort((x, y) => x - y), m = v.length >> 1; return v.length % 2 ? v[m] : (v[m - 1] + v[m]) / 2; };
const q = {NE: 0, NW: 0, SE: 0, SW: 0, edge: 0};
for (const g of K.groups) { const x = med(K.companies.filter(c => c.group === g.id).map(c => c.ret252)), y = g.change20; if (x === 0 || y === 0) q.edge++; else q[(y > 0 ? 'N' : 'S') + (x > 0 ? 'E' : 'W')]++; }
out.push(`5) 북동 ${q.NE} 북서 ${q.NW} 남동 ${q.SE} 남서 ${q.SW} (경계 ${q.edge})`);
// 6 등산로
const alt = K.groups.map(g => ({l: g.label, f: g.fam, a: mean(K.companies.filter(c => c.group === g.id && Number.isFinite(c.pos52)).map(c => c.pos52))})).sort((a, b) => b.a - a.a);
const falt = K.families.map(f => ({l: f.label, a: mean(alt.filter(x => x.f === f.id).map(x => x.a))})).sort((a, b) => b.a - a.a);
out.push(`6) ≥90% ${alt.filter(x => x.a >= 0.9).length} · 최고 ${alt[0].l} ${p(alt[0].a)} ${alt[1].l} ${p(alt[1].a)} · <30% ${alt.filter(x => x.a < 0.3).length} · 최저 ${alt.at(-1).l} ${p(alt.at(-1).a)} · 갈래 ${falt[0].l} ${p(falt[0].a)} / ${falt.at(-1).l} ${p(falt.at(-1).a)}`);
// 7 별자리: 가장 큰 60곳에서 가장 높은 짝
const big = [...K.companies].sort((a, b) => b.cap - a.cap).slice(0, 60);
const dates = K.dates60;
const ret = c => { const last = c.c60last, shift = dates.indexOf(last) - 59; const m = new Map(); c.c60.forEach((v, i) => { const di = i + shift; if (di >= 1 && i >= 1) m.set(dates[di], v / c.c60[i - 1] - 1); }); return m; };
const R = new Map(big.map(c => [c.code, ret(c)]));
const corr = (a, b) => { const ks = [...a.keys()].filter(k => b.has(k)); const x = ks.map(k => a.get(k)), y = ks.map(k => b.get(k)); const mx = mean(x), my = mean(y); let s = 0, sx = 0, sy = 0; for (let i = 0; i < x.length; i++) { s += (x[i] - mx) * (y[i] - my); sx += (x[i] - mx) ** 2; sy += (y[i] - my) ** 2; } return s / Math.sqrt(sx * sy); };
let best = [-2];
for (let i = 0; i < big.length; i++) for (let j = i + 1; j < big.length; j++) { const r = corr(R.get(big[i].code), R.get(big[j].code)); if (r > best[0]) best = [r, big[i].name, big[j].name]; }
out.push(`7) 가장 높은 짝 ${best[1]}–${best[2]} ${best[0].toFixed(3)}`);
// 8 돈의 강
const fl = K.companies.filter(c => c.flows);
const amt = (c, k) => c.flows[k] * c.close / 1e8;
const byF = k => K.families.map(f => ({l: f.label, v: sum(fl.filter(c => c.fam === f.id).map(c => amt(c, k)))})).sort((a, b) => b.v - a.v);
const fo = byF('foreign'), ins = byF('institution');
out.push(`8) 수급 ${fl.length}곳 · 외국인 산 ${fo[0].l} ${fo[0].v.toFixed(0)}억 판 ${fo.at(-1).l} ${fo.at(-1).v.toFixed(0)}억 · 기관 산 ${ins[0].l} ${ins[0].v.toFixed(0)}억 판 ${ins.at(-1).l} ${ins.at(-1).v.toFixed(0)}억 · 개인 ${sum(fl.map(c => amt(c, 'individual'))).toFixed(0)}억 · 외+기 ${sum(fl.map(c => amt(c, 'foreign') + amt(c, 'institution'))).toFixed(0)}억 · 기간 ${[...new Set(fl.map(c => c.flows.from + '~' + c.flows.to))].join(',')}`);
// 9 도시
const t9 = K.families.map(f => { const cs = K.companies.filter(c => c.fam === f.id); const w = sum(cs.map(c => c.cap)); return {l: f.label, cap: w, wm: sum(cs.map(c => c.cap * c.change20)) / w}; }).sort((a, b) => b.wm - a.wm);
out.push(`9) 삼성전자 ${(K.companies.find(c => c.code === '005930').cap / 10000).toFixed(1)}조 · 가장 큰 동네 ${famCap[0][0]} ${(famCap[0][1] / 10000).toFixed(0)}조 · 가중 평균 1위 ${t9[0].l} ${p(t9[0].wm)} · 반도체 ${p(t9.find(x => x.l === '반도체').wm)}`);
// 10 세계
const fmean = (S, id) => mean(S.groups.filter(g => g.fam === id).map(g => g.change20));
const rows = K.families.map(f => ({l: f.label, k: fmean(K, f.id), u: fmean(U, f.id)}));
const both = rows.filter(r => r.k > 0 && r.u > 0).map(r => r.l), bothD = rows.filter(r => r.k < 0 && r.u < 0).map(r => r.l);
const gap = [...rows].sort((a, b) => Math.abs(b.k - b.u) - Math.abs(a.k - a.u))[0];
out.push(`10) 둘 다 오름 ${both.join('/')} · 둘 다 내림 ${bothD.join('/')} · 차이 ${gap.l} ${p(gap.k)} vs ${p(gap.u)} · 평균 한국 ${p(mean(K.groups.map(g => g.change20)))} 미국 ${p(mean(U.groups.map(g => g.change20)))} · 미국 그 밖 ${U.groups.filter(g => g.fam === 'etc').length}업종`);
// 11 번짐
const day = (g, i) => mean(K.companies.filter(c => c.group === g.id).map(c => c.c[i] / c.c[0] - 1));
let first = null; for (let i = 0; i <= 20 && !first; i++) { const hit = K.groups.filter(g => day(g, i) >= 0.10); if (hit.length) first = [K.dates20[i], hit.map(g => g.label)]; }
out.push(`11) 처음 +10% ${first[0]} ${first[1].join('/')} · 붉은 칸 idx2 ${K.groups.filter(g => day(g, 2) > 0).length} → idx20 ${K.groups.filter(g => day(g, 20) > 0).length} · +10% 넘은 칸 끝 ${K.groups.filter(g => day(g, 20) > 0.10).length}`);
console.log(out.join('\n'));
