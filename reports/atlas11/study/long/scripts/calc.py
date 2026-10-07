#!/usr/bin/env python3
"""
Past-based assumption calculation: what would KRW 5,000,000 have become over
10 / 20 / 30 years, using ONLY historical data (no forecasts).

Run:  python3 calc.py            (needs pandas + numpy; reads ./raw, writes ./result.json, ./result.md
                                 and a few derived CSVs in ./derived)

Method (all numbers come from files in ./raw; see raw/sources.csv):
  * Every series is turned into calendar year-end values.
  * For N in (10, 20, 30) every window [y, y+N] whose two year-ends both exist is used.
    CAGR = (V[y+N] / V[y]) ** (1/N) - 1.  Statistics: minimum (with years), 10th percentile
    (numpy linear interpolation), median, maximum, latest window, number of windows.
  * 'Very conservative' = 5,000,000 * (1 + worst CAGR) ** N.  10th-percentile and median versions
    are shown and labelled.  No extrapolation: a series too short for N says so.
  * Real (inflation-adjusted) values use a CPI index built from World Bank annual-average
    inflation; year-end CPI is approximated as the geometric mean of two adjacent annual averages.
  * Stock prices are price-only (cash dividends excluded) unless stated; KOSPI 'with dividends'
    adds the 1990-2019 average dividend contribution derived from KCMI (2020) [ASSUMPTION].
"""
import json, math, os, sys
from datetime import date
import numpy as np
import pandas as pd

HERE = os.path.dirname(os.path.abspath(__file__))
RAW = os.path.join(HERE, 'raw')
DER = os.path.join(HERE, 'derived')
os.makedirs(DER, exist_ok=True)
PRINCIPAL = 5_000_000
HORIZONS = (10, 20, 30)
AS_OF = '2026-10-07'


def rd(name, **kw):
    return pd.read_csv(os.path.join(RAW, name), **kw)

# ----------------------------------------------------------------------------------------------
# 1. CPI (World Bank annual-average inflation) -> annual-average index and year-end estimate
# ----------------------------------------------------------------------------------------------
cpi = rd('korea_cpi_inflation_annual_worldbank.csv')
cpi_avg = {}
lvl = 100.0
for y, p in zip(cpi['year'], cpi['cpi_inflation_pct']):
    if y == cpi['year'].min():
        cpi_avg[int(y)] = lvl
    else:
        lvl *= (1 + p / 100)
        cpi_avg[int(y)] = lvl
last_cpi_year = max(cpi_avg)
cpi_ye = {}
for y in cpi_avg:
    if y + 1 in cpi_avg:
        cpi_ye[y] = math.sqrt(cpi_avg[y] * cpi_avg[y + 1])
# ASSUMPTION: year-end 2025 CPI = 2025 average * sqrt(1 + 2025 inflation) (2026 average not yet published)
p_last = float(cpi.loc[cpi['year'] == last_cpi_year, 'cpi_inflation_pct'].iloc[0])
cpi_ye[last_cpi_year] = cpi_avg[last_cpi_year] * math.sqrt(1 + p_last / 100)

# ----------------------------------------------------------------------------------------------
# 2. KOSPI (official year-ends; 1980-01-04 base used as start-of-1980 point '1979*')
# ----------------------------------------------------------------------------------------------
kospi = rd('kospi_yearend_official.csv')
kospi_ye = {int(y): float(v) for y, v in zip(kospi['year'], kospi['close'])}
kospi_latest = rd('kospi_latest.csv')
div = rd('kospi_dividend_evidence.csv')
pr_end, tr_end = 242.0, 345.0   # KCMI 2020: start-1990=100 -> end-2019
DIV_ADDON = (tr_end / pr_end) ** (1 / 30) - 1   # ~1.189 %/yr  [ASSUMPTION when applied to other years]

# ----------------------------------------------------------------------------------------------
# 3. Four stocks: KRX daily data -> corporate-action adjusted year-end prices (price only)
# ----------------------------------------------------------------------------------------------
STOCKS = {'005930': 'Samsung Electronics', '000660': 'SK hynix', '035420': 'NAVER', '083450': 'GST (Global Standard Technology)'}
daily = rd('krx_marcap_4stocks_daily_raw.csv', dtype={'Code': str}, parse_dates=['Date'])

# Overrides where KRX's base price is not a pure corporate-action ratio (documented in result.md)
NHN_ENT_FIRST_CLOSE = 127_500.0        # NHN Entertainment (181710) close on 2013-08-29, KRX data
NAVER_FIRST_CLOSE = 480_000.0          # NAVER close on 2013-08-29, KRX data
NAVER_RATIO, NHNENT_RATIO = 0.6849, 0.3151   # split-off ratio = share counts 32,962,679 / 48,127,704
OVERRIDES = {
    ('000660', '2003-04-14'): (21.0, '1:21 reverse split (share count 5,239,972,289 -> 249,522,490); pure ratio used instead of KRX re-listing base (factor 19.63)'),
    ('005930', '2018-05-04'): (0.02, '50:1 stock split (KRX base gives the same 0.02)'),
    ('035420', '2008-11-28'): (1.0, 'move from KOSDAQ to KOSPI: no corporate action, holder value continuous (KRX listing base would give 1.0163)'),
    ('035420', '2013-08-29'): (NAVER_FIRST_CLOSE / (NAVER_RATIO * NAVER_FIRST_CLOSE + NHNENT_RATIO * NHN_ENT_FIRST_CLOSE),
                               'split-off of NHN Entertainment: holder kept 0.6849 NAVER + 0.3151 NHN Ent per old share; NHN Ent valued at its first close and assumed reinvested in NAVER (KRX re-listing base would give 1.5673)'),
    ('035420', '2018-10-12'): (0.2, '5:1 stock split (KRX base gives 0.200284 due to tick rounding)'),
}
SERIES_START = {'000660': '1997-01-03'}   # 1996-12-26/27 rows are zero-volume placeholders before first trade

def adjust(code, overrides, log=None):
    """Back-adjusted daily prices: adj_t = close_t * prod_{s>t} factor_s, factor_s = KRX base_s / close_{s-1}
    (ex-date adjustments) unless overridden."""
    g = daily[daily['Code'] == code].sort_values('Date').reset_index(drop=True)
    if code in SERIES_START:
        g = g[g['Date'] >= SERIES_START[code]].reset_index(drop=True)
    base = g['Close'] - g['Changes']
    factor = (base / g['Close'].shift(1)).fillna(1.0)
    factor[(factor - 1).abs() <= 0.001] = 1.0
    factor.iloc[0] = 1.0
    for i in range(1, len(g)):
        key = (code, g.loc[i, 'Date'].strftime('%Y-%m-%d'))
        if key in overrides:
            factor.iloc[i] = overrides[key][0]
        if log is not None and (factor.iloc[i] != 1.0 or key in overrides):
            log.append({'code': code, 'name': STOCKS[code], 'date': key[1], 'prev_close': float(g.loc[i - 1, 'Close']),
                        'close': float(g.loc[i, 'Close']), 'krx_base': float(base.iloc[i]),
                        'krx_base_factor': float(base.iloc[i] / g.loc[i - 1, 'Close']), 'factor_used': float(factor.iloc[i]),
                        'rule': overrides.get(key, (None, 'KRX base price (rights / bonus issue / stock dividend ex-date)'))[1]})
    cum = np.cumprod(factor.values[::-1])[::-1]          # cum[t] = prod_{s>=t}
    later = np.append(cum[1:], 1.0)                        # prod_{s>t}
    g['adj_close'] = g['Close'].values * later
    return g[['Date', 'Close', 'adj_close', 'Volume', 'Stocks']].copy()

adj_events = []
stock_daily_adj = {code: adjust(code, OVERRIDES, adj_events) for code in STOCKS}
pd.DataFrame(adj_events).to_csv(os.path.join(DER, 'stock_adjustment_events.csv'), index=False)

# Sensitivity: use KRX's own base price everywhere (no overrides except the pure 50:1 / 5:1 splits,
# where KRX gives the same ratio up to tick rounding)
ALT_OVERRIDES = {k: v for k, v in OVERRIDES.items() if k in (('005930', '2018-05-04'),)}
stock_daily_alt = {code: adjust(code, ALT_OVERRIDES) for code in ('000660', '035420')}

stock_ye, stock_meta = {}, {}
rows = []
for code, g in stock_daily_adj.items():
    g = g.copy(); g['Y'] = g['Date'].dt.year
    last_by_year = g.groupby('Y').tail(1)
    ye = {int(r.Y): float(r.adj_close) for r in last_by_year.itertuples() if r.Y <= 2025}
    stock_ye[code] = ye
    first, last = g.iloc[0], g.iloc[-1]
    stock_meta[code] = {'first_date': first['Date'].strftime('%Y-%m-%d'), 'first_adj_price': float(first['adj_close']),
                        'first_raw_price': float(first['Close']),
                        'latest_date': last['Date'].strftime('%Y-%m-%d'), 'latest_price': float(last['Close'])}
    for r in last_by_year.itertuples():
        rows.append({'code': code, 'name': STOCKS[code], 'year': int(r.Y), 'last_trading_day': r.Date.strftime('%Y-%m-%d'),
                     'raw_close': float(r.Close), 'adjusted_close_latest_share_basis': round(float(r.adj_close), 4)})
pd.DataFrame(rows).to_csv(os.path.join(DER, 'stocks_yearend_adjusted.csv'), index=False)
stock_ye_alt = {}
for code, g in stock_daily_alt.items():
    g = g.copy(); g['Y'] = g['Date'].dt.year
    stock_ye_alt[code] = {int(r.Y): float(r.adj_close) for r in g.groupby('Y').tail(1).itertuples() if r.Y <= 2025}

# ----------------------------------------------------------------------------------------------
# 4. KOSDAQ: official points + drift-corrected reconstruction from KRX stock-level data
# ----------------------------------------------------------------------------------------------
rec = rd('krx_reconstructed_index_daily_unanchored.csv', parse_dates=['Date'])
kq_off = rd('kosdaq_official_points.csv', parse_dates=['date'])
kq_rec = rec[rec['Market'] == 'KOSDAQ'].set_index('Date')['level_unanchored']
kp_rec = rec[rec['Market'] == 'KOSPI'].set_index('Date')['level_unanchored']
off = {d.strftime('%Y-%m-%d'): float(v) for d, v in zip(kq_off['date'], kq_off['level'])}
t0, t1 = pd.Timestamp('2000-12-26'), pd.Timestamp('2025-12-30')
c0 = off['2000-12-26'] / kq_rec.loc[t0]
c1 = off['2025-12-30'] / kq_rec.loc[t1]
def kq_corr(ts):
    w = (ts - t0).days / (t1 - t0).days
    return kq_rec.loc[ts] * math.exp(math.log(c0) + (math.log(c1) - math.log(c0)) * w)
kq_ye_dates = kq_rec.groupby(kq_rec.index.year).apply(lambda s: s.index.max())
kosdaq_ye = {1999: off['1999-12-28'], 2000: off['2000-12-26'], 2025: off['2025-12-30']}
kosdaq_ye_kind = {1999: 'official', 2000: 'official', 2025: 'official'}
for y in range(2001, 2025):
    kosdaq_ye[y] = float(kq_corr(kq_ye_dates.loc[y]))
    kosdaq_ye_kind[y] = 'estimate (KRX-data reconstruction, drift-corrected)'
# validation table: reconstruction anchored only at 2026-10-02 official value
anchor = off['2026-10-02'] / kq_rec.loc[pd.Timestamp('2026-10-02')]
kq_validation = []
for d, v in off.items():
    ts = pd.Timestamp(d)
    if ts in kq_rec.index:
        kq_validation.append({'date': d, 'official': v, 'reconstructed_anchored_2026_10_02': round(float(kq_rec.loc[ts] * anchor), 2),
                              'ratio': round(float(kq_rec.loc[ts] * anchor / v), 4)})
drift_total = (kq_rec.loc[t1] / kq_rec.loc[t0]) / (off['2025-12-30'] / off['2000-12-26']) - 1

# KOSPI reconstruction validation (anchored at official end-1995)
kp_ye_dates = kp_rec.groupby(kp_rec.index.year).apply(lambda s: s.index.max())
kscale = kospi_ye[1995] / kp_rec.loc[kp_ye_dates.loc[1995]]
kospi_validation = []
for y in range(1995, 2026):
    rv = float(kp_rec.loc[kp_ye_dates.loc[y]] * kscale)
    kospi_validation.append({'year': y, 'official': kospi_ye[y], 'reconstructed': round(rv, 2), 'ratio': round(rv / kospi_ye[y], 4)})

# ----------------------------------------------------------------------------------------------
# 5. Apartments (KB monthly) and all dwellings (BIS quarterly)
# ----------------------------------------------------------------------------------------------
kb = rd('kb_apartment_sale_price_index_monthly.csv')
kb['Y'] = kb['month'].str[:4].astype(int); kb['M'] = kb['month'].str[5:7].astype(int)
def kb_ye(col):
    d = {int(r.Y): float(getattr(r, col)) for r in kb[kb['M'] == 12].itertuples()}
    jan86 = float(kb.loc[kb['month'] == '1986-01', col].iloc[0])
    d[1985] = jan86          # '1985*' = January-1986 value used as start-of-1986 point
    return dict(sorted(d.items()))
kb_nat_ye, kb_seoul_ye = kb_ye('kb_apt_nationwide'), kb_ye('kb_apt_seoul')
bis = rd('bis_korea_residential_property_prices_QKRN628BIS.csv')
bis_ye = {int(d[:4]): float(v) for d, v in zip(bis['date'], bis['index_2010_100']) if d[5:7] == '10'}

# ----------------------------------------------------------------------------------------------
# 6. Rolling-window engine
# ----------------------------------------------------------------------------------------------
def label(y, starmap):
    return f"{y}*" if y in starmap else str(y)

def windows(ye, N, real=False, addon=0.0, starmap=()):
    out = []
    for y0 in sorted(ye):
        y1 = y0 + N
        if y1 not in ye:
            continue
        m = ye[y1] / ye[y0] * (1 + addon) ** N
        if real:
            if y0 not in cpi_ye or y1 not in cpi_ye:
                continue
            m /= cpi_ye[y1] / cpi_ye[y0]
        out.append((y0, y1, m ** (1 / N) - 1))
    return out

def stats(ws, N, starmap=()):
    if not ws:
        return {'n_windows': 0, 'note': f'series too short for a {N}-year window - not extrapolated'}
    c = np.array([w[2] for w in ws])
    i_min, i_max = int(c.argmin()), int(c.argmax())
    res = {'n_windows': len(ws),
           'worst_cagr': float(c[i_min]), 'worst_window': f"{label(ws[i_min][0], starmap)}-{ws[i_min][1]}",
           'p10_cagr': float(np.percentile(c, 10)), 'median_cagr': float(np.median(c)),
           'best_cagr': float(c[i_max]), 'best_window': f"{label(ws[i_max][0], starmap)}-{ws[i_max][1]}",
           'latest_cagr': float(ws[-1][2]), 'latest_window': f"{label(ws[-1][0], starmap)}-{ws[-1][1]}"}
    for k in ('worst', 'p10', 'median'):
        res[f'{k}_value_krw'] = round(PRINCIPAL * (1 + res[f'{k}_cagr']) ** N)
    if len(ws) < 5:
        res['caution'] = f'only {len(ws)} window(s): percentiles are not meaningful'
    return res

SERIES = [
    # key, label, year-end dict, addon, star-years, group, note
    ('kospi_price', 'KOSPI (price only, official)', kospi_ye, 0.0, (1979,), 'stocks-index', 'year-ends 1981-2025 + 1980-01-04 base (=1979*); 1980 year-end not found'),
    ('kospi_with_div', 'KOSPI + dividends [ASSUMPTION: +1.19%/yr, KCMI 1990-2019 average]', kospi_ye, DIV_ADDON, (1979,), 'stocks-index', 'price windows compounded with a constant 1.189%/yr dividend add-on'),
    ('kosdaq_price', 'KOSDAQ (price only; growth-company proxy)', kosdaq_ye, 0.0, (), 'stocks-index', '1999, 2000, 2025 official; 2001-2024 estimated from KRX stock data'),
    ('samsung', 'Samsung Electronics 005930 (price, adj.)', stock_ye['005930'], 0.0, (), 'single-stock', 'KRX daily data from 1995-05-02'),
    ('skhynix', 'SK hynix 000660 (price, adj.)', stock_ye['000660'], 0.0, (), 'single-stock', 'first trade 1997-01-03 (Hyundai Electronics)'),
    ('naver', 'NAVER 035420 (price, adj.)', stock_ye['035420'], 0.0, (), 'single-stock', 'listed 2002-10-29 (as NHN, KOSDAQ)'),
    ('gst', 'GST 083450 (price, adj.)', stock_ye['083450'], 0.0, (), 'single-stock', 'listed 2006-02-01 (KOSDAQ)'),
    ('kb_apt_nationwide', 'KB apartment price index - nationwide (price only)', kb_nat_ye, 0.0, (1985,), 'real-estate', 'December values 1986-2025 + Jan-1986 (=1985*)'),
    ('kb_apt_seoul', 'KB apartment price index - Seoul (price only)', kb_seoul_ye, 0.0, (1985,), 'real-estate', 'December values 1986-2025 + Jan-1986 (=1985*)'),
    ('bis_all_dwellings', 'BIS residential property prices - all dwellings, nationwide (price only)', bis_ye, 0.0, (), 'real-estate', 'Q4 values 1975-2025; pre-1986 part from unverified national source'),
]

results = {}
all_windows = []
for key, lab, ye, addon, star, grp, note in SERIES:
    results[key] = {'label': lab, 'group': grp, 'note': note,
                    'first_year_end': label(min(ye), star), 'last_year_end': max(ye)}
    for N in HORIZONS:
        wn = windows(ye, N, addon=addon, starmap=star)
        wr = windows(ye, N, real=True, addon=addon, starmap=star)
        results[key][f'{N}y_nominal'] = stats(wn, N, star)
        results[key][f'{N}y_real'] = stats(wr, N, star)
        for (a, b, c) in wn:
            all_windows.append({'series': key, 'N': N, 'start': label(a, star), 'end': b, 'cagr_nominal': round(c, 6)})
pd.DataFrame(all_windows).to_csv(os.path.join(DER, 'rolling_windows_all.csv'), index=False)
ye_rows = []
for key, lab, ye, addon, star, grp, note in SERIES:
    if addon:
        continue
    for y, v in sorted(ye.items()):
        kind = kosdaq_ye_kind.get(y, '') if key == 'kosdaq_price' else ''
        ye_rows.append({'series': key, 'year_end': label(y, star), 'value': round(v, 4), 'cpi_yearend_est': round(cpi_ye.get(y, float('nan')), 4), 'kind': kind})
pd.DataFrame(ye_rows).to_csv(os.path.join(DER, 'series_yearend_used.csv'), index=False)

# Adjustment-method sensitivity (KRX re-listing base prices instead of holder-value overrides)
adj_sens = {}
for code, key in (('000660', 'skhynix'), ('035420', 'naver')):
    alt = stock_ye_alt[code]
    g = stock_daily_alt[code]
    T = (g['Date'].iloc[-1] - g['Date'].iloc[0]).days / 365.25
    mult = g['Close'].iloc[-1] / g['adj_close'].iloc[0]
    adj_sens[key] = {'method': 'KRX base price on every event (SK hynix 2003 factor 19.63; NAVER 2008 1.0163, 2013 1.5673, 2018 0.2003)',
                     'full_history_multiple': round(float(mult), 3), 'full_history_cagr': float(mult ** (1 / T) - 1)}
    for N in HORIZONS:
        adj_sens[key][f'{N}y_nominal'] = stats(windows(alt, N), N)

# CPI itself (what 5M must grow to just to keep purchasing power)
cpi_res = {}
for N in HORIZONS:
    ws = [(y, y + N, (cpi_ye[y + N] / cpi_ye[y]) ** (1 / N) - 1) for y in sorted(cpi_ye) if y + N in cpi_ye and y >= 1979]
    c = np.array([w[2] for w in ws])
    cpi_res[f'{N}y'] = {'n_windows': len(ws), 'min_inflation': float(c.min()), 'median_inflation': float(np.median(c)),
                        'max_inflation': float(c.max()), 'latest_window': f"{ws[-1][0]}-{ws[-1][1]}", 'latest_inflation': float(ws[-1][2]),
                        'krw_needed_to_keep_value_latest_window': round(PRINCIPAL * (1 + ws[-1][2]) ** N)}

# ----------------------------------------------------------------------------------------------
# 7. Monthly-rolling sensitivity (month-end windows) for KB apartments and the four stocks
# ----------------------------------------------------------------------------------------------
def monthly_worst(series, N):
    s = series.dropna()
    idx = list(s.index)
    best = None
    for i, t in enumerate(idx):
        t1 = (pd.Period(t, 'M') + 12 * N).strftime('%Y-%m')
        if t1 in s.index:
            c = (s[t1] / s[t]) ** (1 / N) - 1
            if best is None or c < best[0]:
                best = (c, t, t1)
    return None if best is None else {'worst_cagr': float(best[0]), 'window': f"{best[1]}..{best[2]}",
                                      'worst_value_krw': round(PRINCIPAL * (1 + best[0]) ** N)}
monthly_sens = {}
kbm = kb.set_index('month')
for col, key in (('kb_apt_nationwide', 'kb_apt_nationwide'), ('kb_apt_seoul', 'kb_apt_seoul')):
    monthly_sens[key] = {f'{N}y': monthly_worst(kbm[col], N) for N in HORIZONS}
for code, key in (('005930', 'samsung'), ('000660', 'skhynix'), ('035420', 'naver'), ('083450', 'gst')):
    g = stock_daily_adj[code].copy(); g['m'] = g['Date'].dt.strftime('%Y-%m')
    me = g.groupby('m')['adj_close'].last()
    monthly_sens[key] = {f'{N}y': monthly_worst(me, N) for N in HORIZONS}

# ----------------------------------------------------------------------------------------------
# 8. Full available history (single path, nominal) - survivorship-biased for single stocks
# ----------------------------------------------------------------------------------------------
def yrs(a, b):
    return (pd.Timestamp(b) - pd.Timestamp(a)).days / 365.25
yrs_between = yrs
full = {}
for code, key in (('005930', 'samsung'), ('000660', 'skhynix'), ('035420', 'naver'), ('083450', 'gst')):
    m = stock_meta[code]
    T = yrs(m['first_date'], m['latest_date'])
    mult = m['latest_price'] / m['first_adj_price']
    full[key] = {'from': m['first_date'], 'to': m['latest_date'], 'years': round(T, 2), 'multiple': round(mult, 3),
                 'cagr': mult ** (1 / T) - 1, 'value_krw': round(PRINCIPAL * mult),
                 'first_price_adjusted': round(m['first_adj_price'], 2), 'first_price_raw': m['first_raw_price'], 'latest_price': m['latest_price'],
                 'warning': 'SURVIVORSHIP / HINDSIGHT BIAS: picked today because it succeeded; price only, dividends excluded'}
kl = kospi_latest.set_index('date')['close']
T = yrs('1980-01-04', '2026-10-06')
full['kospi_price'] = {'from': '1980-01-04', 'to': '2026-10-06', 'years': round(T, 2), 'multiple': round(kl['2026-10-06'] / 100, 3),
                       'cagr': (kl['2026-10-06'] / 100) ** (1 / T) - 1, 'value_krw': round(PRINCIPAL * kl['2026-10-06'] / 100)}
T = yrs('1996-07-01', '2026-10-02')
full['kosdaq_price'] = {'from': '1996-07-01', 'to': '2026-10-02', 'years': round(T, 2), 'multiple': round(off['2026-10-02'] / 1000, 4),
                        'cagr': (off['2026-10-02'] / 1000) ** (1 / T) - 1, 'value_krw': round(PRINCIPAL * off['2026-10-02'] / 1000),
                        'note': 'both end points official; this is the only ~30-year KOSDAQ observation'}
for col, key in (('kb_apt_nationwide', 'kb_apt_nationwide'), ('kb_apt_seoul', 'kb_apt_seoul')):
    a, b = float(kbm.loc['1986-01', col]), float(kbm.loc['2026-08', col])
    T = yrs('1986-01-15', '2026-08-15')
    full[key] = {'from': '1986-01', 'to': '2026-08', 'years': round(T, 2), 'multiple': round(b / a, 3), 'cagr': (b / a) ** (1 / T) - 1,
                 'value_krw': round(PRINCIPAL * b / a)}
# KOSPI 2026 year-to-date (not used in windows)
kospi_ytd_2026 = kl['2026-10-06'] / kospi_ye[2025] - 1

# ----------------------------------------------------------------------------------------------
# 9. Cross-checks
# ----------------------------------------------------------------------------------------------
def dec_change(col, y):
    return float(kbm.loc[f'{y}-12', col] / kbm.loc[f'{y-1}-12', col] - 1)
kb_checks = [{'item': f'Seoul apartments {y} (Dec/Dec)', 'kb_file': round(dec_change('kb_apt_seoul', y) * 100, 2), 'news': v}
             for y, v in ((1998, -14.6), (2001, 19.3), (2002, 30.7), (2003, 10.1), (2006, 24.1), (2020, 13.0), (2021, 16.4), (2022, -2.9))]
kb_checks.append({'item': 'Seoul apartments Oct-2023 / Jan-1986', 'kb_file': round(float(kbm.loc['2023-10', 'kb_apt_seoul'] / kbm.loc['1986-01', 'kb_apt_seoul']), 3),
                  'news': '6.1배 (rise => x7.1 if read as +610%)'})
kb_checks.append({'item': 'Nationwide apartments Oct-2023 / Jan-1986', 'kb_file': round(float(kbm.loc['2023-10', 'kb_apt_nationwide'] / kbm.loc['1986-01', 'kb_apt_nationwide']), 3),
                  'news': '4.6배 (rise => x5.6 if read as +460%)'})
samsung_check = {'krx_2026_10_02': stock_meta['005930']['latest_price'], 'stockanalysis_2026_10_02': 276000.0}

# ----------------------------------------------------------------------------------------------
# 10. Write result.json
# ----------------------------------------------------------------------------------------------
out = {
    'title': 'Past-based assumption calculation (not a prediction): KRW 5,000,000 held 10/20/30 years',
    'as_of': AS_OF, 'principal_krw': PRINCIPAL,
    'method': {'windows': 'calendar year-end to year-end; every window the data allow',
               'very_conservative': 'principal x (1 + worst historical rolling CAGR)^N',
               'percentile': 'numpy linear interpolation; shown but not meaningful when n<5',
               'real': 'deflated by CPI (World Bank annual-average inflation; year-end CPI = geometric mean of adjacent annual averages; 2025 year-end assumes 2026 inflation = 2025 inflation)',
               'dividends': f'stocks are price-only; KOSPI+div adds {DIV_ADDON*100:.3f}%/yr (KCMI 1990-2019 TR 345 vs PR 242) [ASSUMPTION]',
               'taxes_fees': 'ignored (no taxes, fees, transaction costs, holding costs for property)'},
    'series': results, 'cpi_windows': cpi_res, 'monthly_rolling_sensitivity_worst': monthly_sens,
    'adjustment_method_sensitivity': adj_sens,
    'kosdaq_30y_single_official_observation': {'from': '1996-07-01', 'to': '2026-10-02', 'start_level': 1000.0, 'end_level': off['2026-10-02'],
                                               'cagr': (off['2026-10-02'] / 1000) ** (1 / yrs_between('1996-07-01', '2026-10-02')) - 1,
                                               'value_krw': round(PRINCIPAL * off['2026-10-02'] / 1000)},
    'full_history_single_path': full, 'kospi_2026_ytd_to_2026_10_06': kospi_ytd_2026,
    'data_points': {'kospi_latest': {d: float(v) for d, v in kl.items()},
                    'stocks_latest': {STOCKS[c]: {'date': stock_meta[c]['latest_date'], 'price_krw': stock_meta[c]['latest_price']} for c in STOCKS},
                    'kosdaq_official_points': off, 'kosdaq_yearend_used': {str(k): {'level': round(v, 2), 'kind': kosdaq_ye_kind[k]} for k, v in sorted(kosdaq_ye.items())},
                    'kb_index_base': '2026-01 = 100', 'kb_last_month': '2026-08', 'bis_last_quarter': '2026Q1'},
    'validation': {'kospi_reconstruction_vs_official': kospi_validation,
                   'kosdaq_reconstruction_vs_official': kq_validation,
                   'kosdaq_reconstruction_drift_2000_2025': drift_total,
                   'kb_file_vs_news': kb_checks, 'samsung_latest_price_check': samsung_check},
    'adjustment_events_used': adj_events,
    'data_gaps': [
        'KOSPI dividend yield by year / KOSPI total-return index: not obtained; one 30-year average (KCMI 1990-2019) used as an assumption',
        'KOSPI 1980 year-end close: not found; 1980-01-04 base (=100) used as the start-of-1980 point',
        'KOSDAQ official year-end closes 2001-2024: not obtained; estimated from KRX stock-level data (validated method, drift-corrected)',
        'KOSPI High Dividend 50 index history and base date: not obtained (only the 2026-10-06 level)',
        'Apartment rental yield (전월세 수익률): no official series reachable -> price+rent results not computed',
        '1-year time-deposit rate by year: ECOS unreachable; only KCMI period averages (1990-2019 4.6%, 2000s 4.8%, 2010s 2.4%)',
        'KRX data portal, ECOS, KB data hub, R-ONE, KOSIS and e-나라지표 were blocked or unreachable from this environment; KRX and KB data were used through GitHub mirrors (see sources.csv)',
    ],
    'disclaimer': 'Past-based assumption calculation using historical data only. Not a forecast, not investment advice, no recommendation.',
}
with open(os.path.join(HERE, 'result.json'), 'w', encoding='utf-8') as f:
    json.dump(out, f, ensure_ascii=False, indent=1, default=float)

# ----------------------------------------------------------------------------------------------
# 11. Write result.md
# ----------------------------------------------------------------------------------------------
out_kq30 = out['kosdaq_30y_single_official_observation']
def pct(x):
    return f"{x*100:+.2f}%"
def won(x):
    return f"₩{x/10000:,.0f}만"
L = []
L.append('# ₩5,000,000 held 10 / 20 / 30 years — past-based assumption calculation (Korea)')
L.append('')
L.append(f'As of {AS_OF}. **This is a calculation on past data, not a prediction and not advice.** Price-only unless stated; taxes, fees and property holding costs ignored. "Worst" = the worst calendar-year window in the history that exists for that series.')
L.append('')
L.append('## 1. Side by side (nominal ₩; CAGR per year)')
L.append('')
for N in HORIZONS:
    L.append(f'### {N} years')
    L.append('')
    L.append('| Series | windows | WORST CAGR (window) → ₩5M becomes | 10th pct → ₩ | Median → ₩ | Worst REAL (window) → ₩ in start-year purchasing power | Median REAL → ₩ (same basis) |')
    L.append('|---|---|---|---|---|---|---|')
    for key, lab, *_ in SERIES:
        s = results[key][f'{N}y_nominal']; r = results[key][f'{N}y_real']
        dag = ' †' if results[key]['group'] == 'single-stock' else ''
        if s['n_windows'] == 0:
            extra = ''
            if key == 'kosdaq_price' and N == 30:
                o = out_kq30
                extra = f" (only one official ~30y observation: 1996-07-01 → 2026-10-02 = {pct(o['cagr'])}/yr → {won(o['value_krw'])})"
            L.append(f'| {lab}{dag} | 0 | too short — not computed{extra} | | | | |')
            continue
        flag = ' ⚠n<5' if s['n_windows'] < 5 else ''
        rtxt = f"{pct(r['worst_cagr'])} ({r['worst_window']}) → {won(r['worst_value_krw'])}" if r['n_windows'] else 'n/a'
        rmed = f"{pct(r['median_cagr'])} → {won(r['median_value_krw'])}" if r['n_windows'] else 'n/a'
        L.append(f"| {lab}{dag} | {s['n_windows']}{flag} | **{pct(s['worst_cagr'])}** ({s['worst_window']}) → **{won(s['worst_value_krw'])}** | {pct(s['p10_cagr'])} → {won(s['p10_value_krw'])} | {pct(s['median_cagr'])} → {won(s['median_value_krw'])} | {rtxt} | {rmed} |")
    c = cpi_res[f'{N}y']
    L.append(f"| *Consumer prices (CPI), for reference* | {c['n_windows']} | inflation {c['min_inflation']*100:.2f}%–{c['max_inflation']*100:.2f}%/yr (windows from 1979); latest window {c['latest_window']}: {c['latest_inflation']*100:.2f}%/yr → ₩5M must become {won(c['krw_needed_to_keep_value_latest_window'])} just to keep its value | | | | |")
    L.append('')
    L.append('† single stock chosen today with hindsight (survivorship bias); price only, cash dividends excluded. ⚠n<5: too few windows for percentiles.')
    L.append('')
L.append('Deposit reference (no annual series found): KCMI (2020) average bank deposit rate 1990–2019 = 4.6%/yr (2000s 4.8%, 2010s 2.4%), pre-tax. At 4.6% for 30 years ₩5M → ' + won(PRINCIPAL * 1.046 ** 30) + '; at 2.4% for 10 years → ' + won(PRINCIPAL * 1.024 ** 10) + '.')
L.append('')
L.append('## 2. Single stocks — full available history (one path; SURVIVORSHIP / HINDSIGHT BIAS)')
L.append('')
L.append('These four were named today *because* they are known now. Thousands of listed firms that shrank or were delisted are not in this list, so these numbers overstate what "a stock picked in advance" would have done. Price-only, dividends excluded.')
L.append('')
L.append('| Stock | from (first price in data) | to | years | multiple | CAGR | ₩5M became |')
L.append('|---|---|---|---|---|---|---|')
for key, nm in (('samsung', 'Samsung Electronics'), ('skhynix', 'SK hynix'), ('naver', 'NAVER'), ('gst', 'GST')):
    f = full[key]
    L.append(f"| {nm} | {f['from']} (adj. {f['first_price_adjusted']:,.0f}; raw {f['first_price_raw']:,.0f}) | {f['to']} ({f['latest_price']:,.0f}) | {f['years']} | ×{f['multiple']:,} | {pct(f['cagr'])} | {won(f['value_krw'])} |")
for key, nm in (('kospi_price', 'KOSPI (price)'), ('kosdaq_price', 'KOSDAQ (price)'), ('kb_apt_nationwide', 'KB apartments nationwide'), ('kb_apt_seoul', 'KB apartments Seoul')):
    f = full[key]
    L.append(f"| {nm} | {f['from']} | {f['to']} | {f['years']} | ×{f['multiple']:,} | {pct(f['cagr'])} | {won(f['value_krw'])} |")
L.append('')
L.append(f"KOSPI 2026 to date: {kospi_ye[2025]:,.2f} (2025-12-30) → {kl['2026-10-06']:,.2f} (2026-10-06) = {pct(kospi_ytd_2026)}. 2026 is NOT inside any window above (only completed calendar years are used), which keeps the 'worst' figures conservative.")
L.append('')
L.append('## 3. Monthly-rolling sensitivity (worst month-end-to-month-end window)')
L.append('')
L.append('| Series | 10y worst | 20y worst | 30y worst |')
L.append('|---|---|---|---|')
for key in ('kb_apt_nationwide', 'kb_apt_seoul', 'samsung', 'skhynix', 'naver', 'gst'):
    cells = []
    for N in HORIZONS:
        m = monthly_sens[key][f'{N}y']
        cells.append('—' if m is None else f"{pct(m['worst_cagr'])} ({m['window']}) → {won(m['worst_value_krw'])}")
    L.append(f"| {results[key]['label']} | " + ' | '.join(cells) + ' |')
L.append('')
L.append('Adjustment-method sensitivity (using KRX\'s own re-listing base prices instead of holder-value overrides):')
for key, nm in (('skhynix', 'SK hynix'), ('naver', 'NAVER')):
    a = adj_sens[key]
    parts = []
    for N in HORIZONS:
        s = a[f'{N}y_nominal']
        parts.append(f"{N}y worst " + ('n/a' if s['n_windows'] == 0 else f"{pct(s['worst_cagr'])} ({s['worst_window']}) → {won(s['worst_value_krw'])}"))
    L.append(f"* {nm}: full history ×{a['full_history_multiple']:,} ({pct(a['full_history_cagr'])}/yr); " + '; '.join(parts))
L.append('')
L.append('## 4. How each series was built (and what is assumed)')
L.append('')
L.append('* **KOSPI**: official year-end closes 1981–2025 (Wikipedia table of KRX values; 1998–2024 identical in 1stock1). Start point 1980-01-04 = 100 (base) labelled 1979*. 1980 year-end not found. Latest 6,941.39 on 2026-10-06 (아시아경제, 뉴스핌).')
L.append(f'* **KOSPI + dividends [ASSUMPTION]**: KCMI (2020) shows start-1990=100 → end-2019 price index 242 vs total-return index 345, i.e. dividends added {DIV_ADDON*100:.2f}%/yr on average. That constant add-on is applied to every window. Real yields varied (CEIC KOSPI 50/100 medians ≈1.5% in 2000–2018; KRX 2.14% in May-2025, 0.82–0.92% in Apr/May-2026).')
L.append(f"* **KOSDAQ**: official points only for base 1996-07-01 (=1000), end-1999 2,561.4, peak 2,834.4 (2000-03-10), end-2000 525.8, end-2025 925.47 and Aug–Oct 2026. Year-ends 2001–2024 are ESTIMATES: a full-market-cap, chain-linked index rebuilt from KRX daily stock data (the same method reproduces official KOSPI year by year within ±0.4%p from 2002 on, −1.3%p in 2001, and with only +0.07% cumulative drift 2000→2025), then drift-corrected so it meets the official end-2000 and end-2025 values (raw reconstruction drift 2000→2025: {drift_total*100:+.1f}% cumulative). The rebuild does NOT match KOSDAQ before 2001 (cause not verified; in the rebuild, new large listings such as 한통프리텔 and 하나로통신 dominate the 1999 return), so 1996–1998 year-ends are not used and 1999/2000 use official values only.")
L.append('* **Four stocks**: KRX daily closes (FinanceData/marcap mirror of KRX 전종목시세). Adjusted price = chain of KRX base prices (기준가) on ex-dates (rights, bonus issues, stock dividends) with overrides for splits / reverse split / market transfer / NAVER 2013 split-off (see derived/stock_adjustment_events.csv). Cash dividends excluded. Samsung\'s 1995–1999 adjustments are 10 KRX ex-date base-price changes (−0.4% to −23.1%); SK hynix series starts at its first trade 1997-01-03 (₩20,000; the 1996-12-26/27 rows have zero volume). Example raw year-end closes in the KRX data (Samsung 2017–2024): 2,548,000 / 38,700 (after 50:1 split) / 55,800 / 81,000 / 78,300 / 55,300 / 78,500 / 53,200; 2025: 119,900.')
L.append('* **KOSPI 1997 close**: Wikipedia lists 376.31 but its own 1998 % change and 1stock1 imply 375.15 (0.3% gap, unresolved; does not touch the worst windows).')
L.append('* **Dividend assumption**: the 1.19%/yr add-on is the 1990–2019 average; earlier years\' dividend yields were not found, and recent yields are lower (0.8–0.9% in 2026). Treat KOSPI+dividends as indicative only.')
L.append('* **Apartments**: KB 월간 아파트 매매가격지수 (Excel export dated 2026-09-14, base 2026-01=100, Jan-1986..Aug-2026) via a GitHub mirror; December values; Jan-1986 used as start-of-1986 (1985*). Cross-checked against news citing the same KB series (1998 −14.6%, 2002 +30.7%, 2006 +24.1%, 2021 +16.4%: file gives −14.6, +30.8, +24.1, +16.4). BIS all-dwellings nationwide (via FRED) adds 1975–1985 but its pre-1986 source is not verified.')
L.append('* **Price + rent for apartments: NOT computed** — no official rental-yield series could be reached. Every 1%p/yr of net rent (after holding costs) would add roughly 1%p to the apartment CAGRs above.')
L.append('* **Real values**: CPI index from World Bank annual-average inflation 1960–2025 (FRED FPCPITOTLZGKOR); year-end CPI ≈ geometric mean of adjacent annual averages; 2025 year-end assumes 2026 inflation = 2025 inflation [ASSUMPTION].')
L.append('')
L.append('## 5. Validation')
L.append('')
L.append('KOSPI rebuilt from KRX stock data vs official (ratio = rebuilt/official, anchored end-1995): ' + ', '.join(f"{v['year']}: {v['ratio']}" for v in kospi_validation if v['year'] in (1996, 1997, 1998, 1999, 2000, 2005, 2010, 2015, 2020, 2025)) + ' — i.e. the method tracks KOSPI almost exactly after 2000; 1996–1999 drift +12% (crisis-era delistings).')
L.append('')
L.append('KOSDAQ rebuilt (anchored only at 2026-10-02) vs official: ' + ', '.join(f"{v['date']}: {v['ratio']}" for v in kq_validation))
L.append('')
L.append('KB file vs news: ' + '; '.join(f"{c['item']}: file {c['kb_file']} vs news {c['news']}" for c in kb_checks))
L.append('')
L.append(f"Samsung latest: KRX data {samsung_check['krx_2026_10_02']:,.0f} on 2026-10-02 = stockanalysis.com {samsung_check['stockanalysis_2026_10_02']:,.0f}.")
L.append('')
L.append('## 6. Data gaps')
L.append('')
for g in out['data_gaps']:
    L.append(f'* {g}')
L.append('')
L.append('Sources: raw/sources.csv (URL + access date + as-of for every series). Derived tables: derived/*.csv.')
L.append('')
L.append('*과거 자료로 한 가정 계산이며 예측이 아닙니다. 투자 권유가 아닙니다.*')
with open(os.path.join(HERE, 'result.md'), 'w', encoding='utf-8') as f:
    f.write('\n'.join(L) + '\n')
print('written result.json, result.md and derived/*.csv')
