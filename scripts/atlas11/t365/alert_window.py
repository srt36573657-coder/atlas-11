# 「평소」 기간을 바꿔 견줌(사장님 2026-10-13 02:21 「너 안하거 다해」) — 고른 문턱(2.5배 · 바닥 1.5% · 늘 5%)의 평소 = 앞 n거래일 하루 움직임 크기 평균 · n = 10 · 20 · 40 · 60 · 120
#   쓰는 법: python3 -I alert_window.py <index-long 폴더> <결과.json>
import json, sys
import numpy as np
src, out = sys.argv[1], sys.argv[2]; res = {}
for idx in ('kospi', 'kosdaq'):
    rows = json.load(open(f'{src}/{idx}.json')); c = np.array([r[1] for r in rows], float); r = (c[1:] / c[:-1] - 1) * 100; a = np.abs(r)
    cs = np.concatenate([[0.0], np.cumsum(a)]); cs1 = np.concatenate([[0.0], np.cumsum(r)]); cs2 = np.concatenate([[0.0], np.cumsum(r * r)])
    s60 = np.full(len(r), np.nan); s60[60:] = np.sqrt(np.maximum((cs2[60:-1] - cs2[:-61]) / 60 - ((cs1[60:-1] - cs1[:-61]) / 60) ** 2, 0))
    valid = np.zeros(len(r), bool); valid[250:] = True  # 모든 기간이 셀 수 있는 날만(공정하게)
    q = np.digitize(s60, np.nanquantile(s60[valid], [0.2, 0.4, 0.6, 0.8]))
    res[idx] = {}
    for w in (10, 20, 40, 60, 120):
        m = np.full(len(r), np.nan); m[w:] = (cs[w:-1] - cs[:-w - 1]) / w
        al = ((a >= 2.5 * m) & (a >= 1.5)) | (a >= 5); x = al[valid]; av = a[valid]; qq = q[valid]
        rq = [float(x[qq == j].mean()) for j in range(5)]
        res[idx][w] = {'perYear': float(x.mean() * 250), 'calm': rq[0], 'wild': rq[4], 'ratio': rq[4] / rq[0] if rq[0] else None, 'catch5': float(x[av >= 5].mean()), 'catch4': float(x[av >= 4].mean()), 'small': float((av[x] < 1.5).mean()) if x.any() else 0.0, 'last59': int(al[-59:].sum())}
json.dump(res, open(out, 'w'), ensure_ascii=False, indent=1)
for idx in res:
    for w, m in res[idx].items(): print(f"{idx} 평소 {w:3d}일 | 해마다 {m['perYear']:5.1f} | 조용 {m['calm']*100:4.1f}% 거친 {m['wild']*100:5.1f}% ×{m['ratio']:4.1f} | 5%잡음 {m['catch5']*100:5.1f}% 4% {m['catch4']*100:4.0f}% | 1.5%밑 {m['small']*100:3.0f}% | 최근59 {m['last59']}")
