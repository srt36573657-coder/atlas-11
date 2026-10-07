"""Extract daily KRX rows for the monopoly-type stocks from the FinanceData/marcap yearly parquet files
(mirror of KRX 전종목시세, https://github.com/FinanceData/marcap, raw files
https://raw.githubusercontent.com/FinanceData/marcap/master/data/marcap-YYYY.parquet).
Same method as longterm/scripts/extract_marcap.py, but reads only the columns the adjustment needs
and one year file at a time. Codes are zero-padded (early years store e.g. 15760 for 015760).

Usage: nice -n 19 python3 -I extract_marcap2.py <dir_with_parquet_files> <out.csv>   (needs pandas + pyarrow)"""
import sys, glob, os
import pandas as pd

src, out = sys.argv[1], sys.argv[2]
CODES = {'015760': 'KEPCO', '035250': 'Kangwon Land', '036460': 'KOGAS', '033780': 'KT&G'}
COLS = ['Code', 'Name', 'Date', 'Close', 'Changes', 'Volume', 'Stocks', 'Marcap', 'Market']
frames = []
for f in sorted(glob.glob(os.path.join(src, 'marcap-*.parquet'))):
    df = pd.read_parquet(f, columns=COLS)
    df['Code'] = df['Code'].astype(str).str.strip().str.zfill(6)
    sub = df[df['Code'].isin(CODES)].copy()
    frames.append(sub)
    print(os.path.basename(f), len(df), len(sub), flush=True)
    del df
all_ = pd.concat(frames)
all_['Date'] = pd.to_datetime(all_['Date'])
all_ = all_.sort_values(['Code', 'Date']).reset_index(drop=True)
all_.to_csv(out, index=False)
print(all_.groupby('Code').agg(first=('Date', 'min'), last=('Date', 'max'), n=('Date', 'count'), name=('Name', 'last')))
