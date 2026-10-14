#!/usr/bin/env python3
"""7단 「범위 · 확인」 — 회사마다 한 달(20거래일) 범위 · 몬테카를로 4방향(range-v1)
사장님 2026-10-13 06:45 「매수 검토 36곳 영구 삭제 하라」 — 옛 pick36(36곳 고르기 · 소거 · 지난 기록 시험)을 지우고
회사마다 4방향 범위(번 길 · 크게 잃는 길)만 셈 · 고르기 · 차례 · 목록 없음 · 「모형 가정 아래 추정 · 검증 전」(규칙 49)
숫자는 옛 셈과 같은 씨앗을 써서 같은 자료면 7단 막대 숫자가 한 자리도 안 바뀜(바꾸지 않았다는 증거 · range_verify.mjs)

━━ 돌리기 전에 정한 것(결과를 보고 바꾸지 않음 · 바꾸면 새 판 이름) ━━
자료  모음 bundle.json.gz 일봉 + 이어 받은 일봉(환경 변수 ATLAS_T365_CLOSES · daese.merge 와 같은 규칙) · 회사 = 회차마다 고른 365곳(2026-10-13 부터 힘 붙은 365곳 h365-v1 · ATLAS_D365_DIR 또는 universe.json 폴더)
하루 수익  로그(오늘 종가 ÷ 앞 거래일 종가) · 한국 하루 가격 제한(±30%) 밖이면(|단순 수익| > 30.5%) 주식 수 바뀜으로 보고 그날 그 회사 값 없음
거래일  365곳 가운데 절반 넘게 종가가 있는 날
시장  365곳 하루 단순 수익의 같은 무게 평균(그날 값 있는 회사만)
방향(날마다 · 그날로 끝나는 20거래일 시장으로 가름 · 기준일까지 자료로만)
  ① 크게 출렁이는 장  20거래일 시장 하루 수익 표준편차가 역사 창 안 모든 날 가운데 위 25%
  ② 오르는 장        ①이 아니고 20거래일 시장 누적 수익 +3% 초과
  ③ 내리는 장        ①이 아니고 −3% 미만
  ④ 옆으로 가는 장    나머지
역사 창  기준일까지 마지막 500거래일(모자라면 있는 만큼 · 250거래일 밑이면 셈 안 함)
경로  한 경로 = 그 방향 날들에서 20일을 돌려 뽑기(같은 20일을 365곳 모두에 — 함께 움직임을 지킴) · 회사 20거래일 로그 수익 = 뽑힌 20일 합
      그 방향 날 가운데 그 회사 값이 없는 날은 그 회사 값 있는 같은 방향 날 하나로 바꿔 넣음(씨앗 고정) · 값 있는 날이 20일 밑이면 「? 셈 못 함」
1억 번  방향마다 「회사 × 경로」 1억(경로 273,973개 × 365곳 = 1억 0,000,145)
번 길  20거래일 뒤 단순 수익 > +0.3%(사고팔 때 드는 돈 어림) 인 경로 몫(씨앗 A)
크게 잃는 길  20거래일 뒤 단순 수익 < −15% 인 경로 몫(다른 씨앗 B로 다시 돌린 값)
난수  numpy PCG64 · 씨앗 = sha256('<씨앗 이름>|기준일|방향|찾기 또는 소거') 앞 16자리(16진) · 씨앗 이름은 옛 셈 그대로(숫자를 바꾸지 않으려고 · 화면에 안 나옴)

고른 곳 밖(2026-10-14 17:25 「전부다 나오게 해」 — 모든 회사 7단)  같은 거래일 · 시장 · 방향 날 · 문턱 · 1억 · 번 길 · 크게 잃는 길 · 경로는 따로(씨앗 이름 뒤 「·밖」)
      · 회사 = 같은 자료 폴더 mkt.json 의 고른 곳 밖 · 결과 range.json others(고른 곳 companies 숫자는 그대로)
쓰는 법(저장소 맨 위에서): python3 scripts/atlas11/t365/range_mc.py [--quick] [--out <폴더>] [--no-record] [--reuse <앞 range.json>]
만드는 것: <폴더>/range.json(화면) · reports/atlas11/verify/range-<기준일>-<만든 때>.json(기록 · 새 파일만 · --no-record 면 안 씀)
"""
import gzip, hashlib, json, math, os, subprocess, sys, time
from datetime import datetime, timezone
import numpy as np

ROOT = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', '..'))
ACT = json.load(open(os.path.join(ROOT, 'scripts/atlas11/t365/universe.json'), encoding='utf-8'))  # 지금 쓰는 365곳
VERSION = 'range-v1'
SEED = {'t365-v1': 'pick36-v1', 'd365-v1': 'pick36-v2', 'd365-v2': 'pick36-v3', 'h365-v1': 'pick36-v3', 'mg-v1': 'pick36-v3', 'ml-v1': 'pick36-v3'}[ACT['version']]  # 옛 셈과 같은 씨앗 이름(같은 자료면 같은 숫자 · 화면에 안 나옴 · 힘 붙은 365곳도 같은 씨앗 — 같은 회사면 같은 범위)
if ACT.get('range') != VERSION:
    sys.exit('range: universe.json 의 range(%s) 이 이 셈 이름(%s)과 다름' % (ACT.get('range'), VERSION))
QUICK = '--quick' in sys.argv
NO_RECORD = '--no-record' in sys.argv
OUTDIR = sys.argv[sys.argv.index('--out') + 1] if '--out' in sys.argv else os.path.join(ROOT, 'site/atlas/data')
UNI = os.environ.get('ATLAS_D365_DIR') or os.path.join(ROOT, ACT['dir'])  # 회차마다 새로 고른 폴더(roll.mjs)
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import daese  # noqa: E402  이어 받은 일봉을 합치는 규칙을 고르기와 하나로
H, LIMIT, WIN, WMIN, VOLQ, UPTH, DNTH = 20, 0.305, 500, 250, 0.75, 0.03, -0.03
PROFIT, BIGLOSS = 0.003, -0.15
PAIRS = 100_000_000 // (100 if QUICK else 1)
DIRS = [('up', '오르는 장'), ('down', '내리는 장'), ('flat', '옆으로 가는 장'), ('wild', '크게 출렁이는 장')]
CHUNK = 6000

t0 = time.time()
def say(m):
    print(f'[{time.time() - t0:7.1f}s] {m}', file=sys.stderr, flush=True)

byi = json.load(open(os.path.join(UNI, 'by-industry.json'), encoding='utf-8'))
pro = json.load(open(os.path.join(UNI, 'proposal.json'), encoding='utf-8'))
SEL8 = pro.get('asOf', ACT['asOf']).replace('-', '')  # 고르는 날 — 그날까지 일봉만 씀
if pro['rules']['version'] != ACT['version']:
    sys.exit('range: proposal.json 판이 universe.json 과 다름')
SPEC_FILES = ['scripts/atlas11/t365/range_mc.py', 'scripts/atlas11/t365/universe.json']
git = lambda *a: subprocess.run(['git', *a], cwd=ROOT, capture_output=True, text=True).stdout.strip()
SPEC_COMMIT = git('log', '-1', '--format=%h', '--', *SPEC_FILES)
if not QUICK and (not SPEC_COMMIT or git('status', '--porcelain', '--', *SPEC_FILES)):
    sys.exit('range: 돌리기 전에 정한 것(이 파일 · universe.json)을 먼저 커밋하세요 — 기준을 먼저 적어 둔 커밋이 있어야 전부 돌림')
companies = [(c['code'], c['name'], g['id'], i['name']) for g in byi['groups'] for i in g['industries'] for c in i['companies']]
codes = [c[0] for c in companies]
NC = len(codes)
bundle = json.load(gzip.open(os.path.join(ROOT, ACT['bundle']), 'rt', encoding='utf-8'))
merged, mst = daese.merge(bundle, codes, daese.read_closes(os.environ.get('ATLAS_T365_CLOSES')))
rows = {c: {r[0]: r[4] for r in merged['stocks'][c]['fchart']['rows'] if r[4] and r[4] > 0 and r[0] <= SEL8} for c in codes}
cnt = {}
for c in codes:
    for d in rows[c]:
        cnt[d] = cnt.get(d, 0) + 1
DATES = sorted(d for d, n in cnt.items() if n > NC / 2)
ND = len(DATES)
P = np.full((ND, NC), np.nan)
for j, c in enumerate(codes):
    for k, d in enumerate(DATES):
        v = rows[c].get(d)
        if v:
            P[k, j] = v
with np.errstate(invalid='ignore', divide='ignore'):
    simple = P[1:] / P[:-1] - 1
simple[np.abs(simple) > LIMIT] = np.nan
R = np.vstack([np.full((1, NC), np.nan), np.log1p(simple)])   # R[k] = k-1 → k 로그 수익
M = np.concatenate([[np.nan], np.nanmean(simple, axis=1)])     # 시장 하루 수익(같은 무게)
iso = lambda d: f'{d[:4]}-{d[4:6]}-{d[6:]}'
say(f'회사 {NC}곳 · 거래일 {ND}일({iso(DATES[0])} ~ {iso(DATES[-1])})')

# ── 고른 곳 밖 회사(모든 회사 7단 · 사장님 2026-10-14 17:21(싱가포르) 「그리고 7단 클릭구조 부활 시켜」 · 17:25 「전부다 나오게 해」) ──
#   회사 = 같은 자료 폴더의 mkt.json(site_build.py 가 먼저 씀) 가운데 고른 곳 밖 · 거래일 · 시장 · 방향 날은 위(고른 곳) 그대로
#   경로는 따로 뽑음(씨앗 이름에 「밖」) — 고른 곳 숫자는 한 자리도 안 바뀜 · 경로 수 = 1억 ÷ 밖 회사 수(올림) · 한 번에 뽑는 경로는 적게(메모리)
MKTF = os.path.join(OUTDIR, 'mkt.json')
OTH = [c for c, m in sorted(json.load(open(MKTF, encoding='utf-8'))['companies'].items()) if not m.get('p')] if os.path.exists(MKTF) else []
NO = len(OTH)
if NO:
    omerged, _ = daese.merge(bundle, OTH, daese.read_closes(os.environ.get('ATLAS_T365_CLOSES')))
    orows = {c: {r[0]: r[4] for r in ((omerged['stocks'].get(c) or {}).get('fchart') or {}).get('rows') or [] if r[4] and r[4] > 0 and r[0] <= SEL8} for c in OTH}
    PO = np.full((ND, NO), np.nan)
    for j, c in enumerate(OTH):
        for k, d in enumerate(DATES):
            v = orows[c].get(d)
            if v:
                PO[k, j] = v
    with np.errstate(invalid='ignore', divide='ignore'):
        osimple = PO[1:] / PO[:-1] - 1
    osimple[np.abs(osimple) > LIMIT] = np.nan
    RO = np.vstack([np.full((1, NO), np.nan), np.log1p(osimple)])
    say(f'고른 곳 밖 {NO}곳 — 같은 거래일 · 방향 날로 따로 셈')
CHUNK_O = 300


def seed_of(asof, d, part):
    return int(hashlib.sha256(f'{SEED}|{asof}|{d}|{part}'.encode()).hexdigest()[:16], 16)


def regimes(T):
    """기준일 T(색인)까지 자료로만 — 역사 창 날마다 방향 · 쓰는 문턱"""
    lo = max(H, T - WIN + 1)
    days = np.arange(lo, T + 1)
    if len(days) < WMIN:
        return None
    lm = np.log1p(M)
    cum = np.array([np.nansum(lm[k - H + 1:k + 1]) for k in days])
    sd = np.array([np.nanstd(M[k - H + 1:k + 1], ddof=1) for k in days])
    vth = float(np.quantile(sd, VOLQ))
    lab = np.where(sd > vth, 'wild', np.where(cum > math.log1p(UPTH), 'up', np.where(cum < math.log1p(DNTH), 'down', 'flat')))
    return {'days': days, 'lab': lab, 'volTh': vth, 'n': {d: int((lab == d).sum()) for d, _ in DIRS}}


def pool_matrix(pool, cols, rng, RR=None):
    """그 방향 날들 × 회사 · 값 없는 칸은 그 회사 값 있는 같은 방향 날 하나로(씨앗 고정) · 값 있는 날 20일 밑이면 그 회사 셈 못 함 · RR = 고른 곳 밖 수익(없으면 고른 곳 R)"""
    X = (R if RR is None else RR)[np.ix_(pool, cols)].astype(np.float64)
    ok = np.ones(len(cols), bool)
    for j in range(len(cols)):
        col = X[:, j]
        bad = np.isnan(col)
        good = np.flatnonzero(~bad)
        if len(good) < H:
            ok[j] = False
            col[:] = 0.0
            continue
        if bad.any():
            col[bad] = col[rng.choice(good, size=int(bad.sum()))]
    return X.astype(np.float32), ok


def mc(T, asof, cols, pairs, part, RR=None, chunk=None):
    """방향마다 경로 = pairs ÷ 회사 수(올림) · 회사마다 (번 길 수, 크게 잃는 길 수, 경로 수) · RR = 고른 곳 밖 수익(방향 날은 고른 곳 시장 그대로)"""
    rg = regimes(T)
    if rg is None:
        return None
    out = {}
    npath = -(-pairs // len(cols))
    for d, _ in DIRS:
        pool = rg['days'][rg['lab'] == d]
        rng = np.random.Generator(np.random.PCG64(seed_of(asof, d, part)))
        if len(pool) < H:
            out[d] = None
            continue
        X, ok = pool_matrix(pool, cols, rng, RR)
        win = np.zeros(len(cols), np.int64)
        big = np.zeros(len(cols), np.int64)
        left = npath
        while left > 0:
            n = min(chunk or CHUNK, left)
            idx = rng.integers(0, len(pool), size=(n, H))
            s = X[idx].sum(axis=1, dtype=np.float32)          # (n, 회사) 20거래일 로그 수익
            win += (s > math.log1p(PROFIT)).sum(axis=0)
            big += (s < math.log1p(BIGLOSS)).sum(axis=0)
            left -= n
        out[d] = {'win': win, 'big': big, 'paths': npath, 'ok': ok, 'pool': int(len(pool))}
    return {'dirs': out, 'rg': rg, 'npath': npath}


def ranges(T, asof, cols, pairs, RR=None, tag=''):
    """번 길(씨앗 A · 찾기) · 크게 잃는 길(씨앗 B · 소거) — 회사마다 4방향 몫 · 고르기 · 차례 없음 · tag = 고른 곳 밖이면 「·밖」(따로 뽑음)"""
    f = mc(T, asof, cols, pairs, '찾기' + tag, RR, CHUNK_O if RR is not None else None)
    e = mc(T, asof, cols, pairs, '소거' + tag, RR, CHUNK_O if RR is not None else None)
    if f is None or e is None or any(f['dirs'][d] is None or e['dirs'][d] is None for d, _ in DIRS):
        return None
    pw = np.stack([f['dirs'][d]['win'] / f['dirs'][d]['paths'] for d, _ in DIRS])    # (4, 회사)
    pb = np.stack([e['dirs'][d]['big'] / e['dirs'][d]['paths'] for d, _ in DIRS])
    ok = np.all(np.stack([f['dirs'][d]['ok'] & e['dirs'][d]['ok'] for d, _ in DIRS]), axis=0)
    return {'pw': pw, 'pb': pb, 'avg': pw.mean(axis=0), 'worst': pb.max(axis=0), 'ok': ok,
            'rg': f['rg'], 'npath': f['npath'], 'pools': {d: f['dirs'][d]['pool'] for d, _ in DIRS}}


# ── 지문(같은 회사 · 같은 값이면 앞 회차 범위를 그대로 씀 — 사장님 12:41 「하루에 4번」 · 셈 시간 아낌) ──
MEMBERS_DIGEST = hashlib.sha256(','.join(codes).encode()).hexdigest()[:16]
CLOSES_DIGEST = hashlib.sha256(json.dumps([[d for d in DATES]] + [[rows[c].get(d) for d in DATES] for c in codes]).encode()).hexdigest()[:16]
OTHERS_DIGEST = hashlib.sha256(json.dumps([OTH] + ([[orows[c].get(d) for d in DATES] for c in OTH] if NO else [])).encode()).hexdigest()[:16]  # 고른 곳 밖 회사 · 값
if '--reuse' in sys.argv and not QUICK:
    try:
        old = json.load(open(sys.argv[sys.argv.index('--reuse') + 1], encoding='utf-8'))
        o = old.get('spec') or {}
        if old.get('schema') == 'atlas-new-range-1' and (o.get('version'), o.get('specCommit'), o.get('membersDigest'), o.get('closesDigest'), old.get('asOf'), o.get('quick'), o.get('othersDigest')) == (VERSION, SPEC_COMMIT, MEMBERS_DIGEST, CLOSES_DIGEST, iso(DATES[-1]), False, OTHERS_DIGEST if NO else None):
            os.makedirs(OUTDIR, exist_ok=True)
            with open(os.path.join(OUTDIR, 'range.json'), 'w', encoding='utf-8') as f:
                json.dump(old, f, ensure_ascii=False, separators=(',', ':'))
                f.write('\n')
            print(json.dumps({'reused': True, 'asOf': old.get('asOf'), 'membersDigest': MEMBERS_DIGEST, 'closesDigest': CLOSES_DIGEST}, ensure_ascii=False))
            sys.exit(0)
        say('앞 회차 범위와 회사 · 값이 달라 새로 셈')
    except (OSError, ValueError, KeyError) as e:
        say('앞 회차 범위를 못 읽어 새로 셈: %s' % e)

# ── 지금(고르는 날 기준) ──
T = ND - 1
ASOF = iso(DATES[T])
if ASOF != pro.get('asOf', ACT['asOf']):
    sys.exit('range: 마지막 거래일(%s)이 고르는 날(%s)과 다름' % (ASOF, pro.get('asOf')))
say(f'범위 셈 — 기준일 {ASOF} · 방향마다 회사 × 경로 {PAIRS:,}')
now = ranges(T, ASOF, list(range(NC)), PAIRS)
if now is None:
    sys.exit('range: 셈을 못 함(역사 창 · 방향 날 모자람)')
rg = now['rg']
say('방향 날 수 ' + json.dumps(rg['n'], ensure_ascii=False) + f" · 출렁 문턱 {rg['volTh']:.5f}")
oth = ranges(T, ASOF, list(range(NO)), PAIRS, RO, '·밖') if NO else None
if NO and oth is None:
    sys.exit('range: 고른 곳 밖 회사 셈을 못 함')
if NO:
    say(f"고른 곳 밖 {NO}곳 — 경로 {oth['npath']:,} · 셈한 곳 {int(oth['ok'].sum())}곳")

# ── 기록 ──
per_co = {}
for j in range(NC):
    per_co[codes[j]] = {'ok': bool(now['ok'][j]), 'avg': round(float(now['avg'][j]) * 100, 2), 'win': [round(float(x) * 100, 2) for x in now['pw'][:, j]],
                        'big': [round(float(x) * 100, 2) for x in now['pb'][:, j]], 'worst': round(float(now['worst'][j]) * 100, 2)}
per_oth = {}
for j in range(NO):
    per_oth[OTH[j]] = {'ok': bool(oth['ok'][j]), 'avg': round(float(oth['avg'][j]) * 100, 2), 'win': [round(float(x) * 100, 2) for x in oth['pw'][:, j]],
                       'big': [round(float(x) * 100, 2) for x in oth['pb'][:, j]], 'worst': round(float(oth['worst'][j]) * 100, 2)}
made = datetime.now(timezone.utc).strftime('%Y-%m-%dT%H:%M:%SZ')
spec = {'version': VERSION, 'dir': '가 · 시장 방향 넷', 'horizon': H, 'profit': PROFIT, 'bigLoss': BIGLOSS,
        'window': WIN, 'volQ': VOLQ, 'upTh': UPTH, 'downTh': DNTH, 'pairs': PAIRS,
        'paths': now['npath'], 'totalPairs': now['npath'] * NC * len(DIRS) * 2, 'quick': QUICK,
        'universe': ACT['version'], 'specCommit': SPEC_COMMIT, 'selAsOf': pro.get('asOf', ACT['asOf']), 'closes': {k: mst[k] for k in ('files', 'added')},
        'membersDigest': MEMBERS_DIGEST, 'closesDigest': CLOSES_DIGEST,
        'othersDigest': OTHERS_DIGEST if NO else None, 'others': {'n': NO, 'paths': oth['npath'] if NO else None, 'seed': '·밖', 'eligible': int(oth['ok'].sum()) if NO else 0}}
out = {'schema': 'atlas-new-range-1', 'made': made, 'asOf': ASOF, 'spec': spec,
       'dirs': [{'id': d, 'name': nm, 'days': rg['n'][d], 'pool': now['pools'][d]} for d, nm in DIRS],
       'volTh': rg['volTh'], 'window': {'from': iso(DATES[int(rg['days'][0])]), 'to': ASOF, 'days': int(len(rg['days']))},
       'eligible': int(now['ok'].sum()), 'companies': per_co, 'others': per_oth}
os.makedirs(OUTDIR, exist_ok=True)
with open(os.path.join(OUTDIR, 'range.json'), 'w', encoding='utf-8') as f:
    json.dump(out, f, ensure_ascii=False, separators=(',', ':'))
    f.write('\n')
rec = os.path.join(ROOT, 'reports/atlas11/verify', f"range-{ASOF}-{made.replace(':', '').replace('-', '')}.json")
if not QUICK and not NO_RECORD:
    with open(rec, 'x', encoding='utf-8') as f:
        json.dump(out, f, ensure_ascii=False, indent=1)
        f.write('\n')
say(f"범위: 셈한 곳 {out['eligible']}곳 / {NC}곳 · 기록 {os.path.relpath(rec, ROOT) if not (QUICK or NO_RECORD) else '(빠른 셈 · 회차 셈 — 기록 파일 안 씀)'}")
print(json.dumps({'asOf': ASOF, 'paths': now['npath'], 'totalPairs': spec['totalPairs'], 'eligible': out['eligible'], 'companies': NC}, ensure_ascii=False))
