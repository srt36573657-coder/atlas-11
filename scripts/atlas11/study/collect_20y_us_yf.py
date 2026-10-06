#!/usr/bin/env python3
"""ATLAS 11 공부 · 미국 20년 기록 — 야후(yfinance) 길 시험 + 받기(사장님 2026-10-06 13:01 「20년 기록을 봐봐 그리고 미국 도 보고」)
  13:52 셋째 판에서 알게 된 것: 깃허브 자동 작업에서 stooq 403 · WSJ 401 · 미 연준(FRED) 응답 없음 · 네이버 해외 일봉은 2010-07 부터
  → 야후(yfinance + curl_cffi 브라우저 흉내)로 S&P 500(^GSPC) · 나스닥 종합(^IXIC) · 다우(^DJI) · 미국 판 365곳을 2004-01-01 부터 받아 봄
     종가는 「Close」(액면 분할만 고친 값 · 배당은 안 고침 — 네이버와 같은 꼴)
     FRED 나스닥 종합도 curl_cffi 로 한 번 더 시험(되는지만 probe 에 적고, 야후 지수가 안 될 때만 씀)
  결과: <out>/us.json.gz(collect_20y.mjs 와 같은 꼴) · <out>/probe.json — 사이트 · main · 매일 작업은 건드리지 않는다
  쓰는 법: python scripts/atlas11/study/collect_20y_us_yf.py --out reports/atlas11/study/20y/r3us
"""
import datetime as dt, gzip, json, os, sys, time
import pandas as pd

OUT = sys.argv[sys.argv.index('--out') + 1] if '--out' in sys.argv else 'reports/atlas11/study/20y/r3us'
os.makedirs(OUT, exist_ok=True)
probe = {'startedAt': dt.datetime.now(dt.timezone.utc).isoformat(), 'index': {}, 'errors': []}
def save_probe():
    json.dump(probe, open(os.path.join(OUT, 'probe.json'), 'w'), ensure_ascii=False, indent=1)

def pack(s_close, s_vol=None):
    s = s_close.dropna(); s = s[s > 0]
    if s.empty: return None
    d = [x.strftime('%Y%m%d') for x in s.index]; t = [pd.Timestamp(x) for x in s.index]
    dd = [int((t[i] - t[i - 1]).days) for i in range(1, len(t))]
    v = None if s_vol is None else s_vol.reindex(s.index)
    return {'d0': d[0], 'n': len(d), 'dd': dd, 'c': [round(float(x), 4) for x in s.values],
            'v': [None if (v is None or pd.isna(x)) else int(x) for x in (v.values if v is not None else [None] * len(s))]}
def field(df, name, ticker=None):
    if df is None or df.empty: return None
    if isinstance(df.columns, pd.MultiIndex):
        for lv in range(df.columns.nlevels):
            if name in df.columns.get_level_values(lv):
                sub = df.xs(name, axis=1, level=lv)
                if isinstance(sub, pd.DataFrame):
                    if ticker is not None and ticker in sub.columns: return sub[ticker]
                    if sub.shape[1] == 1: return sub.iloc[:, 0]
                    return None
                return sub
        return None
    return df[name] if name in df.columns else None

import yfinance as yf
probe['yfinance'] = getattr(yf, '__version__', '?')
inp = json.load(open('public/data/atlas11/us/input.json', encoding='utf-8'))
board = json.load(open('public/data/atlas11/us/view/board.json', encoding='utf-8'))
meta = {a['code']: a for a in inp['assets']}
codes = [c['code'] for c in board['companies']]
out = {'market': 'us', 'fetchedAt': dt.datetime.now(dt.timezone.utc).isoformat(), 'indices': {}, 'stocks': {}, 'board': codes,
       'groups': [{'id': g['id'], 'label': g.get('label'), 'codes': g['codes']} for g in board['groups']]}
START = '2004-01-01'
for key, y in (('.INX', '^GSPC'), ('.IXIC', '^IXIC'), ('.DJI', '^DJI')):
    try:
        df = yf.download(y, start=START, auto_adjust=False, progress=False, threads=False)
        p = pack(field(df, 'Close', y), field(df, 'Volume', y))
        out['indices'][key] = p; probe['index'][key] = {'how': 'yahoo-' + y, 'rows': p['n'] if p else 0, 'first': p['d0'] if p else None}
    except Exception as e:
        probe['index'][key] = {'how': 'yahoo-' + y, 'error': str(e)[:300]}
    print('index', key, probe['index'][key], flush=True); save_probe(); time.sleep(1.5)
try:  # FRED 나스닥 종합(되는지만 적음 · 야후 나스닥이 안 됐을 때만 씀)
    from curl_cffi import requests as cr
    r = cr.get('https://fred.stlouisfed.org/graph/fredgraph.csv?id=NASDAQCOM', impersonate='chrome', timeout=60)
    rows = [ln.split(',') for ln in r.text.strip().splitlines()[1:]]
    rows = [(a, float(b)) for a, b in rows if len(a) == 10 and b not in ('.', '') and a >= START]
    probe['fred'] = {'status': r.status_code, 'rows': len(rows), 'first': rows[0][0] if rows else None}
    if rows and not (out['indices'].get('.IXIC') or {}).get('n'):
        s = pd.Series([b for _, b in rows], index=pd.to_datetime([a for a, _ in rows]))
        out['indices']['.IXIC'] = pack(s); probe['index']['.IXIC'] = {'how': 'fred-NASDAQCOM', 'rows': len(rows), 'first': rows[0][0]}
except Exception as e:
    probe['fred'] = {'error': str(e)[:300]}
print('fred', probe['fred'], flush=True); save_probe()

got, miss = 0, []
for i in range(0, len(codes), 40):
    batch = codes[i:i + 40]
    try:
        df = yf.download(batch, start=START, auto_adjust=False, progress=False, threads=True, group_by='column')
    except Exception as e:
        probe['errors'].append({'batch': i, 'error': str(e)[:300]}); df = None
    for c in batch:
        p = pack(field(df, 'Close', c), field(df, 'Volume', c)) if df is not None else None
        if p and p['n'] >= 250:
            a = meta.get(c, {}); out['stocks'][c] = {'name': a.get('name', c), 'reuters': a.get('reuters'), 'industryCode': a.get('industryCode'), 'src': 'yahoo', **p}; got += 1
        else: miss.append(c)
    print('stocks', i + len(batch), '/', len(codes), 'got', got, 'miss', len(miss), flush=True)
    probe['stocks'] = {'asked': len(codes), 'done': i + len(batch), 'got': got, 'miss': miss[:40], 'missCount': len(miss)}; save_probe()
    time.sleep(2)
probe['stocks']['startedBefore2005'] = sum(1 for s in out['stocks'].values() if s['d0'] < '20050101')
probe['finishedAt'] = dt.datetime.now(dt.timezone.utc).isoformat()
if got or any(out['indices'].values()):
    with gzip.open(os.path.join(OUT, 'us.json.gz'), 'wt', encoding='utf-8') as f: json.dump(out, f, ensure_ascii=False, separators=(',', ':'))
save_probe(); print(json.dumps(probe, ensure_ascii=False)[:2000])
