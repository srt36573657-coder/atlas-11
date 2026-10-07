"""Extract the four stocks' daily KRX rows from the FinanceData/marcap yearly parquet files
(mirror of KRX 전종목시세, https://github.com/FinanceData/marcap, files data/marcap-YYYY.parquet).
Codes are zero-padded (early years store 5930 for 005930).
Usage: python -I extract_marcap.py <dir_with_parquet_files> <out.csv>   (needs pandas + pyarrow)"""
import sys, glob, os
import pandas as pd
src = sys.argv[1]; out = sys.argv[2]
codes = ['005930','000660','035420','083450']
frames = []
for f in sorted(glob.glob(os.path.join(src, 'marcap-*.parquet'))):
    df = pd.read_parquet(f)
    if 'Date' not in df.columns:
        df = df.reset_index()
    df['Code'] = df['Code'].astype(str).str.strip().str.zfill(6)
    sub = df[df['Code'].isin(codes)].copy()
    frames.append(sub)
    print(os.path.basename(f), len(df), len(sub), list(df.columns)[:20] if f.endswith('1995.parquet') else '')
all_ = pd.concat(frames)
all_['Date'] = pd.to_datetime(all_['Date'])
all_ = all_.sort_values(['Code','Date'])
all_.to_csv(out, index=False)
print(all_.groupby('Code')['Date'].agg(['min','max','count']))
