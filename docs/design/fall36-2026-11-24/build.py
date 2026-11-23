# 분석 창 자료(주문 1124-0354) — run.py 가 낸 fall36.json · fall36-raw.json 을 꾀 서른여섯 줄로 묶음
# 몬테카를로 2만 번(그날 아무렇게나 일곱으로 바꿔 평균 날수) · 덩어리 첫날만 다시 2만 번(이웃 날 겹침 덜기) · 소거 단계
# 지난 기록을 센 것 — 앞날을 맞히지 않고, 사고팔기를 권하지 않음
import json, subprocess, sys, os
import numpy as np
HERE = os.path.dirname(os.path.abspath(__file__))
REPO = '/home/claude/atlas-11'
LIVE = '/tmp/claude-0/-home-claude/e38c6e2a-a659-5015-b86a-265061dd2612/scratchpad/wc36/dist-live'
OUT = sys.argv[1]
S = json.load(open(HERE + '/fall36.json', encoding='utf-8'))
RAW = json.load(open(HERE + '/fall36-raw.json', encoding='utf-8'))
DEFS = json.loads(subprocess.run(['python3', REPO + '/scripts/atlas11/next/su21_s36.py', '--defs'], capture_output=True, text=True, check=True).stdout)
DATES = json.load(open(LIVE + '/atlas/data/days.json', encoding='utf-8'))['dates']
TI = {d: i for i, d in enumerate(DATES)}
HMAX = RAW['hmax']; SIMS = 20000; rng = np.random.default_rng(20261124)
POOL = {d: np.array(v) for d, v in RAW['pool'].items()}
BINS = [(1, 1, '1'), (2, 2, '2'), (3, 3, '3'), (4, 4, '4'), (5, 9, '5~9'), (10, 19, '10~19'), (21, 21, '내내')]
def binc(r):
    r = np.asarray(r)
    return [int(((r >= a) & (r <= b)).sum()) for a, b, _ in BINS]
def mc(days, runs):   # 그날 아무렇게나 일곱(오른 것)으로 바꾼 평균 날수를 SIMS 번
    keep = [i for i, d in enumerate(days) if d in POOL]
    if not keep: return None
    P = np.stack([POOL[days[i]] for i in keep]); rk = np.asarray(runs, float)[keep]
    pick = rng.integers(0, P.shape[1], (SIMS, len(keep)))
    sim = P[np.arange(len(keep))[None, :], pick].mean(axis=1)
    return {'n': len(keep), 'mean': float(rk.mean()), 'lo': float(np.percentile(sim, 5)), 'mid': float(np.percentile(sim, 50)), 'hi': float(np.percentile(sim, 95)),
            'beat': float((rk.mean() > sim).mean() + 0.5 * (rk.mean() == sim).mean())}
def first_of_episodes(days):   # 이어진 장날 덩어리마다 첫날만
    out = []; prev = None
    for i, d in enumerate(days):
        t = TI[d]
        if prev is None or t - prev > 1: out.append(i)
        prev = t
    return out
CLS_ORDER = {'long': 0, 'like': 1, 'short': 2, 'few': 3, 'none': 4}
CLS_TEXT = {'long': '아무렇게나 고른 것보다 길었어요', 'like': '아무렇게나 고른 것과 비슷했어요', 'short': '아무렇게나 고른 것보다 짧았어요',
            'few': '오른 날이 적어 가르지 못했어요', 'none': '거래량 자료가 없어 셀 수 없어요'}
CLS_SHORT = {'long': '더 길었어요', 'like': '비슷했어요', 'short': '더 짧았어요', 'few': '너무 적어요', 'none': '셀 수 없어요'}
MIN_ROSE = 30
rows = []
for k in DEFS['kinds']:
    s = S['kinds'][k]; rr = RAW['runs'][k]
    days = [d for d, _ in rr]; runs = [x for _, x in rr]
    r = np.asarray(runs)
    row = {'id': k, 'no': int(k[1:]), 'name': DEFS['name'][k], 'tried': s['tried'], 'picked': s['picked'], 'rose': len(runs)}
    if len(runs) != s['rose']: raise SystemExit('rose mismatch ' + k)
    cnt = binc(r) if len(r) else [0] * len(BINS)
    for i, c in enumerate(cnt):
        row['b%d' % (i + 1)] = c
        row['s%d' % (i + 1)] = round(10 * c / len(r), 1) if len(r) else None
    if len(r):
        m_all = mc(days, runs)
        fe = first_of_episodes(days)
        m_ep = mc([days[i] for i in fe], [runs[i] for i in fe])
        row.update(median=float(np.median(r)), mean=round(float(r.mean()), 1), p5_10=int(round(10 * float((r >= 5).mean()))), p21_10=int(round(10 * float((r == HMAX + 1).mean()))),
                   longest=int(r.max()), episodes=len(fe),
                   mc_n=m_all['n'], mc_lo=round(m_all['lo'], 1), mc_mid=round(m_all['mid'], 1), mc_hi=round(m_all['hi'], 1), beat=round(m_all['beat'], 4),
                   ep_n=m_ep['n'], ep_mean=round(m_ep['mean'], 1), ep_lo=round(m_ep['lo'], 1), ep_hi=round(m_ep['hi'], 1), beat_ep=round(m_ep['beat'], 4))
        if len(r) < MIN_ROSE: cls = 'few'
        elif m_all['beat'] >= 0.95: cls = 'long'
        elif m_all['beat'] <= 0.05: cls = 'short'
        else: cls = 'like'
        sure = (cls == 'long' and m_ep['beat'] >= 0.95) or (cls == 'short' and m_ep['beat'] <= 0.05)
    else:
        cls = 'none'; sure = False
        row.update(median=None, mean=None, p5_10=None, p21_10=None, longest=None, episodes=0, mc_n=0, mc_lo=None, mc_mid=None, mc_hi=None, beat=None,
                   ep_n=0, ep_mean=None, ep_lo=None, ep_hi=None, beat_ep=None)
    row['cls'] = cls; row['cls_text'] = CLS_TEXT[cls]; row['cls_short'] = CLS_SHORT[cls]
    row['sure'] = bool(sure)
    row['sure_text'] = ('덩어리 첫날만 다시 세어도 같았어요' if sure else ('덩어리 첫날만 다시 세면 흐려져요' if cls in ('long', 'short') else ''))
    rows.append(row)
rows.sort(key=lambda x: (CLS_ORDER[x['cls']], -(x['mean'] or 0), x['no']))
for i, x in enumerate(rows): x['order'] = i + 1
# 아무렇게나 일곱(오른 것) — 날마다 1,000개씩 모은 것
allp = np.concatenate([POOL[d] for d in RAW['dates'] if d in POOL])
bc = binc(allp)
base = [{'bin': i + 1, 'label': BINS[i][2], 'rand_share10': round(10 * c / len(allp), 1), 'rand_count': c} for i, c in enumerate(bc)]
def kdate(d):
    y, m, dd = d.split('-'); return '%d년 %d월 %d일' % (int(y), int(m), int(dd))
n_counted = sum(1 for x in rows if x['cls'] in ('long', 'like', 'short'))
facts = [{'fall_days': S['fallDays'], 'fall_from': kdate(S['fallFrom']), 'fall_to': kdate(S['fallTo']), 'data_from': kdate(S['from']), 'data_to': kdate(S['asOf']),
          'sims': SIMS, 'rand_median': float(np.median(allp)), 'rand_mean': round(float(allp.mean()), 1), 'rand_p5_10': int(round(10 * float((allp >= 5).mean()))),
          'rand_p21_10': int(round(10 * float((allp == HMAX + 1).mean()))), 'kinds': len(rows), 'counted': n_counted, 'min_rose': MIN_ROSE,
          'n_none': sum(1 for x in rows if x['cls'] == 'none'), 'n_few': sum(1 for x in rows if x['cls'] == 'few'),
          'n_long': sum(1 for x in rows if x['cls'] == 'long'), 'n_like': sum(1 for x in rows if x['cls'] == 'like'), 'n_short': sum(1 for x in rows if x['cls'] == 'short'),
          'n_sure_long': sum(1 for x in rows if x['cls'] == 'long' and x['sure']), 'n_sure_short': sum(1 for x in rows if x['cls'] == 'short' and x['sure']),
          'chance_tail': round(0.05 * n_counted, 1)}]
facts[0]['after_none'] = facts[0]['kinds'] - facts[0]['n_none']
code_run = open(HERE + '/run.py', encoding='utf-8').read(); code_build = open(os.path.abspath(__file__), encoding='utf-8').read()
meta = [{'label': 'run.py', 'value': code_run, 'type': 'code', 'lang': 'python'}, {'label': 'build.py', 'value': code_build, 'type': 'code', 'lang': 'python'},
        {'label': '입력', 'value': '손자병법 우량주 회사 날마다 끝값(' + kdate(S['from']) + ' ~ ' + kdate(S['asOf']) + ') · 서른여섯 꾀가 날마다 고른 일곱 회사(s36-v3)'},
        {'label': '셈 뜻', 'value': '내리는 장인 날 꾀가 고른 일곱 회사를 같은 돈으로 샀다고 침 → 다음 날 평균이 올랐으면 그날부터 산 값 위에 머문 날수를 셈(스무 날 내내면 21) · 아무렇게나 = 같은 날 판에서 아무렇게나 고른 일곱 가운데 다음 날 오른 것'}]
os.makedirs(OUT, exist_ok=True)
for name, data in (('kkoe36', rows), ('base', base), ('facts', facts)):
    json.dump({'rows': data, 'meta': meta}, open(os.path.join(OUT, name + '.json'), 'w', encoding='utf-8'), ensure_ascii=False, allow_nan=False)
print(json.dumps(facts[0], ensure_ascii=False))
for x in rows: print(x['order'], x['id'], x['name'], x['cls'], x['rose'], x['median'], x['mean'], x['beat'], x['beat_ep'], x['sure'], x['mc_lo'], x['mc_hi'], x['episodes'])
print(base)
