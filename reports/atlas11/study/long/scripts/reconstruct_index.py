"""Rebuild full-market-cap-weighted, chain-linked KOSPI and KOSDAQ composite indices
from KRX daily all-stock data (FinanceData/marcap mirror of KRX 전종목시세).
Daily stock return = Close / (Close - Changes) - 1, i.e. versus KRX's own base price
(기준가), which KRX resets on ex-rights / bonus / split / re-listing days.
Weights = previous-day market cap. Excludes preferred shares (code not ending in '0')
and SPACs (name contains '스팩'). Output: daily index (unanchored, start=1.0)."""
import sys, glob, os
import numpy as np, pandas as pd
src, out = sys.argv[1], sys.argv[2]
cols = ['Date','Code','Name','Market','Close','Changes','Marcap','Volume']
mk = {'KOSPI':'KOSPI', 'KOSDAQ':'KOSDAQ', 'KOSDAQ GLOBAL':'KOSDAQ'}
levels = {'KOSPI':1.0, 'KOSDAQ':1.0}
prev = {'KOSPI':None, 'KOSDAQ':None}
rows = []
flags = []
for f in sorted(glob.glob(os.path.join(src, 'marcap-*.parquet'))):
    df = pd.read_parquet(f, columns=cols)
    df['Code'] = df['Code'].astype(str).str.strip().str.zfill(6)
    df['Date'] = pd.to_datetime(df['Date'])
    df = df[df['Market'].isin(mk.keys())].copy()
    df['M'] = df['Market'].map(mk)
    df = df[df['Code'].str[-1].eq('0') & ~df['Name'].astype(str).str.contains('스팩')]
    for d, day in df.groupby('Date', sort=True):
        for m in ('KOSPI','KOSDAQ'):
            t = day[day['M']==m].drop_duplicates('Code').set_index('Code')
            if t.empty:
                continue
            p = prev[m]
            n_used = 0; R = np.nan
            if p is not None:
                common = t.index.intersection(p.index)
                c = t.loc[common]; w = p.loc[common, 'Marcap']
                base = c['Close'] - c['Changes']
                r = c['Close'] / base - 1
                ok = base.gt(0) & r.notna() & w.gt(0) & r.abs().le(0.35)
                bad = common[~ok & base.gt(0) & r.notna()]
                for code in bad[:5]:
                    flags.append((d.date(), m, code, t.loc[code,'Name'], float(r[code])))
                R = float((w[ok] * r[ok]).sum() / w[ok].sum())
                levels[m] *= (1 + R)
                n_used = int(ok.sum())
            rows.append((d, m, levels[m], R, n_used, float(t['Marcap'].sum())))
            prev[m] = t[['Marcap']].copy()
    print(os.path.basename(f), 'done', {k: round(v,4) for k,v in levels.items()}, flush=True)
res = pd.DataFrame(rows, columns=['Date','Market','level_unanchored','daily_return','n_stocks','total_marcap'])
res.to_csv(out, index=False)
pd.DataFrame(flags, columns=['Date','Market','Code','Name','r']).to_csv(out.replace('.csv','_excluded_moves.csv'), index=False)
print('flags', len(flags))
