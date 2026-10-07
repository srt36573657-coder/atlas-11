#!/usr/bin/env python3
"""
Calculation on past data only: what KRW 5,000,000 became over 10 / 20 / 30 years for
(1) monopoly-type listed companies and (2) a high-dividend index.  Companion to ../longterm/calc.py and
uses the same method so the numbers are comparable.

Run:  nice -n 19 python3 -I scripts/calc2.py   (needs pandas + numpy; reads ../raw relative to this script,
                                              writes ../result.json, ../result.md, ../derived/*.csv)

Method (identical to longterm/calc.py):
  * every series -> calendar year-end values (last trading day of each year, completed years only, <= 2025)
  * for N in (10, 20, 30) every window [y, y+N] whose two year-ends both exist; CAGR = (V[y+N]/V[y])**(1/N) - 1
  * worst (with years), 10th percentile (numpy linear interpolation), median; KRW 5,000,000 * (1 + CAGR)**N
  * a series too short for N -> null (no extrapolation)
  * stocks: KRX daily closes back-adjusted with KRX base prices (기준가) on ex-dates, with documented overrides;
    price-only (cash dividends excluded)
  * full history: first adjusted price -> latest close, years = days / 365.25
  * real values: CPI index from World Bank annual-average inflation; year-end CPI = geometric mean of adjacent
    annual averages; 2025 year-end assumes 2026 inflation = 2025 inflation (same assumption as longterm/calc.py)
"""
import json, math, os
import numpy as np
import pandas as pd

HERE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))   # research/longterm2
RAW = os.path.join(HERE, 'raw')
DER = os.path.join(HERE, 'derived')
os.makedirs(DER, exist_ok=True)
PRINCIPAL = 5_000_000
HORIZONS = (10, 20, 30)
AS_OF = '2026-10-07'
ACCESSED = '2026-10-07'
LAST_FULL_YEAR = 2025
# read-only reference to the earlier research (KOSPI year-ends for side-by-side context only)
EARLIER_YE = os.path.join(HERE, '..', 'longterm', 'derived', 'series_yearend_used.csv')

def rd(name, **kw):
    return pd.read_csv(os.path.join(RAW, name), **kw)

src = rd('sources.csv').set_index('source_id')
def source(sid, what=None):
    r = src.loc[sid]
    return {'url': r['url'], 'accessed': r['accessed'], 'asOf': r['as_of'], 'what': what or r['description']}

# ----------------------------------------------------------------------------------------------
# CPI (same construction as longterm/calc.py)
# ----------------------------------------------------------------------------------------------
cpi = rd('korea_cpi_inflation_annual_worldbank.csv')
cpi_avg, lvl = {}, 100.0
for y, p in zip(cpi['year'], cpi['cpi_inflation_pct']):
    if y != cpi['year'].min():
        lvl *= (1 + p / 100)
    cpi_avg[int(y)] = lvl
cpi_ye = {y: math.sqrt(cpi_avg[y] * cpi_avg[y + 1]) for y in cpi_avg if y + 1 in cpi_avg}
last_cpi_year = max(cpi_avg)
p_last = float(cpi.loc[cpi['year'] == last_cpi_year, 'cpi_inflation_pct'].iloc[0])
cpi_ye[last_cpi_year] = cpi_avg[last_cpi_year] * math.sqrt(1 + p_last / 100)   # [ASSUMPTION]

# ----------------------------------------------------------------------------------------------
# 1. Monopoly-type stocks: KRX daily data -> corporate-action adjusted prices (price only)
# ----------------------------------------------------------------------------------------------
STOCKS = {
    '015760': {'id': 'kepco', 'nameKo': '한국전력', 'nameEn': 'KEPCO (Korea Electric Power)'},
    '035250': {'id': 'kangwonland', 'nameKo': '강원랜드', 'nameEn': 'Kangwon Land'},
    '036460': {'id': 'kogas', 'nameKo': '한국가스공사', 'nameEn': 'KOGAS (Korea Gas Corp.)'},
    '033780': {'id': 'ktng', 'nameKo': 'KT&G', 'nameEn': 'KT&G'},
}
daily = rd('krx_marcap_monopoly4_daily_raw.csv', dtype={'Code': str}, parse_dates=['Date'])

# Overrides where KRX's base price is not a pure corporate-action ratio (same rule as longterm/calc.py)
OVERRIDES = {
    ('035250', '2003-09-04'): (1.0, 'move from KOSDAQ to KOSPI: no corporate action, holder value continuous (KRX listing base would give 1.0577)'),
    ('035250', '2003-11-04'): (0.1, '10:1 stock split (par 5,000 -> 500; shares 20,000,000 -> 200,000,000); KRX base gives the same 0.1'),
}
NOTE = {
    ('015760', '1996-01-03'): 'KRX base price on the first trading day of the year (year-end ex-date adjustment, cause not verified; same kind as Samsung 1996-1999 in the earlier research)',
    ('015760', '1997-01-03'): 'KRX base price on the first trading day of the year (year-end ex-date adjustment, cause not verified)',
    ('015760', '1998-01-03'): 'KRX base price on the first trading day of the year (year-end ex-date adjustment, cause not verified)',
    ('035250', '2003-12-29'): 'KRX base price: stock-dividend ex-date (new shares listed 2004-04-07, 200,000,000 -> 213,940,500 = +6.97%; pure ratio 0.93484)',
    ('036460', '2013-09-05'): 'KRX base price: rights-issue ex-date (new shares listed 2013-11-08, 77,284,510 -> 92,313,000)',
}

def adjust(code, overrides, log=None):
    """Back-adjusted daily prices: adj_t = close_t * prod_{s>t} factor_s, factor_s = KRX base_s / close_{s-1}
    (ex-date adjustments) unless overridden.  Identical to longterm/calc.py adjust()."""
    g = daily[daily['Code'] == code].sort_values('Date').reset_index(drop=True)
    base = g['Close'] - g['Changes']
    factor = (base / g['Close'].shift(1)).fillna(1.0)
    factor[(factor - 1).abs() <= 0.001] = 1.0
    factor.iloc[0] = 1.0
    for i in range(1, len(g)):
        key = (code, g.loc[i, 'Date'].strftime('%Y-%m-%d'))
        if key in overrides:
            factor.iloc[i] = overrides[key][0]
        if log is not None and (factor.iloc[i] != 1.0 or key in overrides):
            log.append({'code': code, 'name': STOCKS[code]['nameEn'], 'date': key[1], 'prev_close': float(g.loc[i - 1, 'Close']),
                        'close': float(g.loc[i, 'Close']), 'krx_base': float(base.iloc[i]),
                        'krx_base_factor': float(base.iloc[i] / g.loc[i - 1, 'Close']), 'factor_used': float(factor.iloc[i]),
                        'rule': overrides[key][1] if key in overrides else NOTE.get(key, 'KRX base price (rights / bonus issue / stock dividend ex-date)')})
    cum = np.cumprod(factor.values[::-1])[::-1]
    later = np.append(cum[1:], 1.0)
    g['adj_close'] = g['Close'].values * later
    return g[['Date', 'Close', 'adj_close', 'Volume', 'Stocks', 'Market']].copy()

adj_events = []
stock_daily = {c: adjust(c, OVERRIDES, adj_events) for c in STOCKS}
pd.DataFrame(adj_events).to_csv(os.path.join(DER, 'stock_adjustment_events.csv'), index=False)

def year_ends(g, col='adj_close'):
    g = g.copy(); g['Y'] = g['Date'].dt.year
    last = g.groupby('Y').tail(1)
    return {int(r.Y): float(getattr(r, col)) for r in last.itertuples() if r.Y <= LAST_FULL_YEAR}, last

stock_ye, rows = {}, []
for code, g in stock_daily.items():
    ye, last = year_ends(g)
    stock_ye[code] = ye
    for r in last.itertuples():
        rows.append({'code': code, 'name': STOCKS[code]['nameEn'], 'year': int(r.Y), 'last_trading_day': r.Date.strftime('%Y-%m-%d'),
                     'raw_close': float(r.Close), 'adjusted_close_latest_share_basis': round(float(r.adj_close), 4),
                     'used_in_windows': int(r.Y) <= LAST_FULL_YEAR})
pd.DataFrame(rows).to_csv(os.path.join(DER, 'stocks_yearend_adjusted.csv'), index=False)

# Sensitivities of the adjustment method
SENS = {
    'kepco_no_newyear_base': ('015760', {**OVERRIDES, **{('015760', d): (1.0, 'ignored') for d in ('1996-01-03', '1997-01-03', '1998-01-03')}},
                              'KEPCO without the three first-trading-day KRX base changes of 1996-1998 (pure raw closes)'),
    'kangwonland_krx_listing_base': ('035250', {k: v for k, v in OVERRIDES.items() if k != ('035250', '2003-09-04')},
                                     'Kangwon Land using KRX listing base at the 2003-09-04 KOSDAQ->KOSPI move (factor 1.0577) instead of 1.0'),
}
sens_daily = {k: adjust(c, ov) for k, (c, ov, _) in SENS.items()}

# ----------------------------------------------------------------------------------------------
# 2. MSCI Korea High Dividend Yield (KRW, gross = dividends reinvested): calendar-year returns -> levels
# ----------------------------------------------------------------------------------------------
fs = rd('msci_korea_hdy_factsheet_20260930.csv')
summ = rd('msci_factsheet_summary_20260930.csv')
def summ_val(index, currency, item):
    r = summ[(summ['index'] == index) & (summ['currency'] == currency) & (summ['item'] == item)]
    return float(r['value'].iloc[0])

def levels_from_returns(col, start_year=2011, start_level=100.0):
    lv = {start_year: start_level}
    for y, r in zip(fs['year'], fs[col]):
        lv[int(y)] = lv[int(y) - 1] * (1 + float(r) / 100)
    return lv

hdy_ye = levels_from_returns('msci_korea_hdy_krw_gross_pct')
mk_ye = levels_from_returns('msci_korea_krw_gross_pct')
HDY_SINCE = summ_val('MSCI Korea High Dividend Yield', 'KRW', 'annualised since 1998-12-31') / 100
HDY_YTD = summ_val('MSCI Korea High Dividend Yield', 'KRW', 'YTD 2026') / 100
HDY_YEARS = 27.75                                          # 1998-12-31 -> 2026-09-30 (333 months)
hdy_2026_09_30 = hdy_ye[2025] * (1 + HDY_YTD)
hdy_1998_derived = hdy_2026_09_30 / (1 + HDY_SINCE) ** HDY_YEARS
hdy_ye_with_1998 = dict(sorted({1998: hdy_1998_derived, **hdy_ye}.items()))

# cross-checks: KRW/USD consistency of the two columns, every year
fx_check = []
for r in fs.itertuples():
    a = (1 + r.msci_korea_hdy_krw_gross_pct / 100) / (1 + r.msci_korea_hdy_usd_gross_pct / 100)
    b = (1 + r.msci_korea_krw_gross_pct / 100) / (1 + r.msci_korea_usd_gross_pct / 100)
    fx_check.append({'year': int(r.year), 'hdy_krw_over_usd': round(a, 4), 'msci_korea_krw_over_usd': round(b, 4), 'diff': round(a - b, 4)})
pd.DataFrame(fx_check).to_csv(os.path.join(DER, 'msci_fx_consistency_check.csv'), index=False)

# ----------------------------------------------------------------------------------------------
# 3. Rolling-window engine (same as longterm/calc.py)
# ----------------------------------------------------------------------------------------------
def windows(ye, N, real=False):
    out = []
    for y0 in sorted(ye):
        y1 = y0 + N
        if y1 not in ye:
            continue
        m = ye[y1] / ye[y0]
        if real:
            if y0 not in cpi_ye or y1 not in cpi_ye:
                continue
            m /= cpi_ye[y1] / cpi_ye[y0]
        out.append((y0, y1, m ** (1 / N) - 1))
    return out

def stats(ws, N):
    if not ws:
        return None
    c = np.array([w[2] for w in ws])
    i = int(c.argmin())
    def pack(x):
        return {'cagr': round(float(x), 6), 'won': int(round(PRINCIPAL * (1 + float(x)) ** N))}
    res = {'n': len(ws),
           'worst': {**pack(c[i]), 'from': int(ws[i][0]), 'to': int(ws[i][1])},
           'p10': pack(np.percentile(c, 10)),
           'median': pack(np.median(c))}
    j = int(c.argmax())
    res['best'] = {**pack(c[j]), 'from': int(ws[j][0]), 'to': int(ws[j][1])}
    res['latest'] = {**pack(ws[-1][2]), 'from': int(ws[-1][0]), 'to': int(ws[-1][1])}
    if len(ws) < 5:
        res['caution'] = f'only {len(ws)} window(s): percentiles are not meaningful'
    return res

all_windows = []
def window_block(key, ye, real=False):
    out = {}
    for N in HORIZONS:
        ws = windows(ye, N, real)
        out[str(N)] = stats(ws, N)
        if not real:
            for a, b, c in ws:
                all_windows.append({'series': key, 'N': N, 'start': a, 'end': b, 'cagr_nominal': round(c, 6),
                                    'won': int(round(PRINCIPAL * (1 + c) ** N))})
    return out

def monthly_worst(series, N):
    s = series.dropna()
    best = None
    for t in s.index:
        t1 = (pd.Period(t, 'M') + 12 * N).strftime('%Y-%m')
        if t1 in s.index:
            c = (s[t1] / s[t]) ** (1 / N) - 1
            if best is None or c < best[0]:
                best = (c, t, t1)
    return None if best is None else {'cagr': round(float(best[0]), 6), 'from': best[1], 'to': best[2],
                                      'won': int(round(PRINCIPAL * (1 + best[0]) ** N))}

def yrs(a, b):
    return (pd.Timestamp(b) - pd.Timestamp(a)).days / 365.25

# ----------------------------------------------------------------------------------------------
# 4. Assemble series
# ----------------------------------------------------------------------------------------------
facts = rd('monopoly_facts.csv', dtype={'code': str})
series = []
for code, meta in STOCKS.items():
    g = stock_daily[code]
    ye = stock_ye[code]
    first, last = g.iloc[0], g.iloc[-1]
    T = yrs(first['Date'], last['Date'])
    mult = float(last['Close'] / first['adj_close'])
    f = facts[facts['code'] == code]
    main = f.iloc[0]
    g2 = g.copy(); g2['m'] = g2['Date'].dt.strftime('%Y-%m')
    me = g2.groupby('m')['adj_close'].last()      # all months incl. 2026 (last = 2026-10-02), as in longterm/calc.py
    status = main['status']
    s = {
        'id': meta['id'], 'nameKo': meta['nameKo'], 'nameEn': meta['nameEn'], 'code': code, 'kind': 'monopoly',
        'basis': 'price-only',
        'from': first['Date'].strftime('%Y-%m-%d'), 'to': last['Date'].strftime('%Y-%m-%d'),
        'monopolyFact': {'ko': main['fact_ko'], 'url': main['url']},
        'monopolyStatus': status,
        'hindsightPicked': True,
        'windows': window_block(meta['id'], ye),
        'windowsReal': window_block(meta['id'] + '_real', ye, real=True),
        'full': {'from': first['Date'].strftime('%Y-%m-%d'), 'to': last['Date'].strftime('%Y-%m-%d'), 'years': round(T, 2),
                 'multiple': round(mult, 4), 'cagr': round(mult ** (1 / T) - 1, 6), 'won': int(round(PRINCIPAL * mult)),
                 'firstPriceAdjusted': round(float(first['adj_close']), 2), 'firstPriceRaw': float(first['Close']),
                 'latestPrice': float(last['Close'])},
        'yearEnd': [[y, round(v, 2)] for y, v in sorted(ye.items())],
        'monthlyWorst': {str(N): monthly_worst(me, N) for N in HORIZONS},
        'sources': [source('SRC_KRX_MARCAP', 'KRX daily closes and base prices (Close - Changes), corporate actions; data to 2026-10-02')]
                   + [source(r.source_id, f"monopoly fact: {r.quote_ko}") for r in f.itertuples()]
                   + [source('SRC_WB_FRED_CPI', 'CPI for the windowsReal block only')],
    }
    series.append(s)

# notes per stock
ev = pd.DataFrame(adj_events)
def ev_txt(code):
    e = ev[ev['code'] == code]
    return '; '.join(f"{r.date} factor {r.factor_used:.6f} ({r.rule.split(':')[0].split('(')[0].strip()})" for r in e.itertuples()) or 'none'
NOTES = {
    '015760': ('Data start 1995-05-02 is the start of the KRX dataset, not the listing date (KEPCO listed 1989); '
               'windows therefore start at year-end 1995. '),
    '035250': ('Listed on KOSDAQ 2001-10-25 (first close 137,000, limit-up days followed), moved to KOSPI 2003-09-04. '),
    '036460': ('Listed on KOSPI 1999-12-15. '),
    '033780': ('Listed on KOSPI 1999-10-08 as 담배인삼공사 (renamed KT&G 2003). FORMER monopoly: the legal cigarette-manufacturing '
               'monopoly ended with the 2001 Tobacco Business Act amendment, so for most of the 1999-2026 data period this was a '
               'dominant company, not a legal monopoly. '),
}
for s in series:
    code = s['code']
    s['notes'] = (NOTES[code] + 'Hindsight pick (survivorship bias): chosen today because it is known now. Price only: cash dividends '
                  'excluded (no reliable per-year dividend history could be reached), which understates the holder\'s result; '
                  'these companies paid dividends in many years. Adjustment events: ' + ev_txt(code) + '. Windows use completed '
                  'calendar years only (to 2025); the full-history line runs to 2026-10-02.')
    s['noteKo'] = {'015760': '판매 독점(현재). 1995년 이후 자료, 배당 빼고 주가만.',
                   '035250': '내국인 카지노 독점(현재). 2001년 상장, 배당 빼고 주가만.',
                   '036460': '천연가스 도매 독점(현재). 1999년 상장, 배당 빼고 주가만.',
                   '033780': '옛 독점(2001년 끝남). 1999년 상장, 배당 빼고 주가만.'}[code]

# sensitivities
sens_out = {}
for k, (code, ov, desc) in SENS.items():
    g = sens_daily[k]
    ye, _ = year_ends(g)
    first, last = g.iloc[0], g.iloc[-1]
    T = yrs(first['Date'], last['Date']); mult = float(last['Close'] / first['adj_close'])
    sens_out[k] = {'what': desc, 'windows': {str(N): stats(windows(ye, N), N) for N in HORIZONS},
                   'full': {'multiple': round(mult, 4), 'cagr': round(mult ** (1 / T) - 1, 6), 'won': int(round(PRINCIPAL * mult))}}

# MSCI high-dividend series
hdy_full_mult = (1 + HDY_SINCE) ** HDY_YEARS
hdy = {
    'id': 'msci_korea_hdy', 'nameKo': 'MSCI 한국 고배당 지수', 'nameEn': 'MSCI Korea High Dividend Yield Index (KRW, gross)',
    'code': None, 'kind': 'dividend', 'basis': 'total-return',
    'from': '1998-12-31', 'to': '2026-09-30',
    'hindsightPicked': False,
    'windows': window_block('msci_korea_hdy', hdy_ye_with_1998),
    'windowsReal': window_block('msci_korea_hdy_real', hdy_ye_with_1998, real=True),
    'full': {'from': '1998-12-31', 'to': '2026-09-30', 'years': HDY_YEARS, 'multiple': round(hdy_full_mult, 4),
             'cagr': round(HDY_SINCE, 6), 'won': int(round(PRINCIPAL * hdy_full_mult))},
    'yearEnd': [[y, round(v, 4)] for y, v in hdy_ye_with_1998.items()],
    'yearEndNote': 'levels rebuilt from calendar-year gross returns with end-2011 = 100; the 1998 value is DERIVED from MSCI\'s '
                   '"since Dec 31, 1998" annualised 13.88% and the 2026 YTD 45.23% (both as of 2026-09-30)',
    'sources': [source('SRC_MSCI_HDY_KRW_GROSS'), source('SRC_MSCI_HDY_USD_GROSS'), source('SRC_MSCI_KOREA_KRW_GROSS_20260930'),
                source('SRC_MSCI_HDY_PAGE'), source('SRC_WB_FRED_CPI', 'CPI for the windowsReal block only')],
    'notes': ('Total return in KRW with dividends reinvested before tax (MSCI "gross"); no fees or taxes. Calendar-year returns '
              'exist for 2012-2025 only, so 10-year windows are 2011-2021 ... 2015-2025 (5 windows, all inside one 14-year '
              'stretch); the single 20-year window 1998-2018 uses the 1998 level derived from MSCI\'s since-base figure; no '
              '30-year window. Index launched 2013-07-12: values before that date are back-tested by MSCI. The index page lists '
              'a maximum drawdown of 63.53% (1999-07-07 to 2000-12-04). The full-history line starts right after the 1997-98 '
              'crisis low and includes the 2025-2026 rally (2025 +57.57%, 2026 to Sep +45.23%), so it is not a conservative '
              'figure. Not comparable one-to-one with the price-only stock series (dividends add roughly the dividend yield '
              'per year; current yield 2.42%).'),
    'noteKo': '배당을 다시 넣은 총수익. 2012~2025년 연간 수익률만 있어 10년 구간 5개뿐.',
}
for blk in ('windows', 'windowsReal'):
    if hdy[blk]['20'] is not None:
        hdy[blk]['20']['note'] = ('single window; the end-1998 level is derived from MSCI\'s "since Dec 31, 1998" annualised '
                                  'figure (13.88%) and 2026 YTD (45.23%), both rounded to 0.01%')
series.append(hdy)

# context: MSCI Korea (KRW, gross) and KOSPI price-only on the same windows
context = {'msci_korea_krw_gross': {'what': 'MSCI Korea Index (KRW, gross total return), same factsheet, same windows',
                                    'windows': {'10': stats(windows(mk_ye, 10), 10)},
                                    'sinceBase': {'from': '1994-05-31', 'cagr': summ_val('MSCI Korea', 'KRW', 'annualised since 1994-05-31') / 100},
                                    'source': source('SRC_MSCI_HDY_KRW_GROSS', 'MSCI Korea column of the HDY factsheet (identical to the MSCI Korea KRW factsheet)')}}
if os.path.exists(EARLIER_YE):
    e = pd.read_csv(EARLIER_YE)
    k = e[e['series'] == 'kospi_price']
    kye = {int(str(y).rstrip('*')): float(v) for y, v in zip(k['year_end'], k['value']) if not str(y).endswith('*')}
    kw = [w for w in windows(kye, 10) if w[0] >= 2011]
    context['kospi_price_same_windows'] = {'what': 'KOSPI price only (official year-ends from the earlier research), 10-year windows starting 2011-2015',
                                           'windows': {'10': stats(kw, 10)},
                                           'source': {'url': 'https://en.wikipedia.org/wiki/KOSPI', 'accessed': ACCESSED, 'asOf': '2025-12-30',
                                                      'what': 'see longterm/raw/sources.csv (SRC_KOSPI_WIKI_EN, SRC_DGMBC_2025)'}}
    kw20 = [w for w in windows(kye, 20) if w[0] == 1998]
    context['kospi_price_same_windows']['windows']['20'] = stats(kw20, 20)

pd.DataFrame(all_windows).to_csv(os.path.join(DER, 'rolling_windows_all.csv'), index=False)

# ----------------------------------------------------------------------------------------------
# 5. Not found
# ----------------------------------------------------------------------------------------------
def nf(what, pairs):
    return {'what': what, 'tried': [u for u, _ in pairs], 'outcome': [o for _, o in pairs]}

not_found = [
    nf('KRX 코스피 고배당 50 (KOSPI High Dividend 50): base date and year-end history (only scattered price-index levels found: '
       '2021-01-04 2254.53, 2021-05-12 3004.02, 2026-10-06 4642.84)',
       [('https://index.krx.co.kr/contents/MKD/03/0304/03040101/MKD03040101.jsp', 'permission prompt not answered'),
        ('https://news.bizwatch.co.kr/article/market/2014/10/21/0026', 'rate-limited (HTTP 429), not read'),
        ('https://mofe.go.kr/sisa/dictionary/detail?idx=2566', 'robots.txt fetch timed out'),
        ('https://newstomato.com/ReadNews.aspx?no=1043940', 'two 2021 levels only'),
        ('https://view.asiae.co.kr/article/2020111711594636273', 'one level of a different index (KRX 고배당 50)'),
        ('https://www.investing.com/indices/kospi-high-dividend-yield-50-historical-data', 'last month only (earlier research)'),
        ('https://www.funetf.co.kr/product/etf/view/KR7210780003', 'TIGER 코스피고배당 ETF: NAV return since 2014-12-05 listing only, no yearly table'),
        ('https://stock.pstatic.net/stock-research/invest/21/20241212_invest_631207000.pdf', 'broker PDF, text not readable'),
        ('https://api.github.com/search/code?q=%22%EC%BD%94%EC%8A%A4%ED%94%BC+%EA%B3%A0%EB%B0%B0%EB%8B%B9+50%22+extension%3Acsv', 'blocked: session limited to configured repositories')]),
    nf('KRX 코스피 배당성장 50 (KOSPI Dividend Growth 50): base date and history',
       [('https://www.ajunews.com/view/20141215141242535', 'ETF listing news (2014-12-15), no base date or history'),
        ('https://www.trackinsight.com/en/fund/211900/characteristics', 'KODEX 배당성장 ETF: inception 2014-12-16 and current NAV only')]),
    nf('MSCI Korea High Dividend Yield calendar-year returns before 2012 (needed for more 10/20-year windows) and any 30-year window',
       [('https://app2.msci.com/products/service/index/indexmaster/getLevelDataForGraph?currency_symbol=KRW&index_variant=GRTR&start_date=19981231&end_date=20260930&data_frequency=END_OF_MONTH&index_codes=145813', 'permission prompt not answered'),
        ('https://web.archive.org/cdx/search/cdx?url=msci.com/resources/factsheets/index_fact_sheet/msci-korea-high*', 'permission prompt not answered'),
        ('https://www.msci.com/indexes/index/145813/msci-korea-high-dividend-yield-index', 'risk figures only (max drawdown 63.53%)'),
        ('https://www.msci.com/eqb/hdy/indexperf/dailyperf.html', '2013 page, no Korea row')]),
    nf('FnGuide / KODI high-dividend indexes: year-end history',
       [('https://www.plusetf.co.kr/upload/fund/PLUS_고배당주_20260630.pdf', 'FnGuide 고배당주 base 2009-01-02 = 1000 only; no yearly table'),
        ('https://mondovisione.com/media-and-resources/news/korea-stock-exchange-introduction-of-korea-dividend-stock-price-index-kodi-2011124/', 'KODI base 2001-07-01 = 1000, launch 2003-07-21 only')]),
    nf('Dividend (DPS) history for the four monopoly stocks, needed for a total-return version',
       [('https://stockanalysis.com/quote/krx/033780/dividend/', 'permission prompt not answered')]),
    nf('Law text for the monopolies; news and KDI sources used instead',
       [('https://ko.wikipedia.org/wiki/KT%26G', 'permission prompt not answered'),
        ('https://ko.wikisource.org/wiki/%EB%8B%B4%EB%B0%B0%EC%82%AC%EC%97%85%EB%B2%95', 'cache-only domain, not fetched'),
        ('https://www.hankyung.com/amp/2002090424401', 'HTTP 403')]),
]

# ordered log of the high-dividend attempts (task order: KRX -> MSCI -> FnGuide / others)
hd_attempts = [
    {'step': 1, 'target': 'KRX 코스피 고배당 50 / 코스피 배당성장 50 (KRX pages, news, ETF pages TIGER / KODEX)',
     'returned': 'no base date, no year-end history; only levels 2021-01-04 2254.53, 2021-05-12 3004.02 (newstomato) and 2026-10-06 '
                 '4642.84 (investing.com); TIGER 코스피고배당 NAV +233.15% since 2014-12-05; KODEX 배당성장 inception 2014-12-16',
     'usable': False},
    {'step': 2, 'target': 'MSCI Korea High Dividend Yield Index factsheet (KRW, gross)',
     'returned': 'calendar-year returns 2012-2025, annualised 13.88% since 1998-12-31, YTD 2026 45.23% (as of 2026-09-30); '
                 'launch 2013-07-12, earlier data back-tested',
     'usable': True},
    {'step': 3, 'target': 'FnGuide / KODI / other Korean high-dividend indexes (PLUS 고배당주 factsheet, KSE KODI notice)',
     'returned': 'base dates only (FnGuide 고배당주 2009-01-02 = 1000; KODI 2001-07-01 = 1000)',
     'usable': False},
]

out = {'asOf': AS_OF, 'principal': PRINCIPAL,
       'method': {'windows': 'calendar year-end to year-end, completed years only (to 2025); every window the data allow; same engine as longterm/calc.py',
                  'worst': 'principal x (1 + worst rolling CAGR)^N; p10 = numpy linear interpolation; median',
                  'stocks': 'KRX daily closes back-adjusted with KRX base prices on ex-dates (overrides documented); price only, cash dividends excluded',
                  'dividendIndex': 'MSCI Korea High Dividend Yield (KRW, gross total return) rebuilt from calendar-year returns',
                  'real': 'windowsReal = deflated by CPI (World Bank annual-average inflation, year-end = geometric mean of adjacent annual averages; 2025 year-end assumes 2026 inflation = 2025 inflation)',
                  'taxesFees': 'ignored'},
       'series': series, 'context': context, 'sensitivity': sens_out,
       'validation': {'msci_krw_vs_usd_columns': fx_check},
       'adjustmentEvents': adj_events,
       'highDividendAttempts': hd_attempts,
       'notFound': not_found,
       'disclaimer': 'Calculation on past data only. Not investment advice.'}
with open(os.path.join(HERE, 'result.json'), 'w', encoding='utf-8') as fh:
    json.dump(out, fh, ensure_ascii=False, indent=1)

# ----------------------------------------------------------------------------------------------
# 6. result.md
# ----------------------------------------------------------------------------------------------
def pct(x):
    t = f"{x*100:+.2f}%"
    return '0.00%' if t in ('-0.00%', '+0.00%') else t
def won(x):
    return f"₩{x/10000:,.0f}만"
def cell(w, key):
    if w is None:
        return '—'
    v = w[key]
    yrs_ = f" ({v['from']}-{v['to']})" if 'from' in v else ''
    return f"{pct(v['cagr'])}{yrs_} → {won(v['won'])}"

L = ['# ₩5,000,000 held 10 / 20 / 30 years — monopoly-type companies and a high-dividend index (Korea)', '',
     f'As of {AS_OF}. **Calculation on past data only, not advice.** Same method as `../longterm/result.md` '
     '(calendar year-end windows, worst / 10th percentile / median). Taxes and fees ignored. The four companies are '
     '**price-only** (dividends left out); the MSCI high-dividend index is **total return** (dividends reinvested), so the two '
     'groups are not directly comparable.', '',
     '## 0. In one look — worst window, what ₩5,000,000 became', '',
     '| Series | basis | 10 years | 20 years | 30 years |', '|---|---|---|---|---|']
for s in series:
    cells0 = []
    for N in HORIZONS:
        w = s['windows'][str(N)]
        cells0.append('not enough history' if w is None else
                      f"{won(w['worst']['won'])} ({w['worst']['from']}-{w['worst']['to']}, n={w['n']})")
    nm = s['nameKo'] + (' (옛 독점)' if s.get('monopolyStatus', '').startswith('former') else '')
    L.append(f"| {nm} | {s['basis']} | " + ' | '.join(cells0) + ' |')
L += ['', '## 1. Results (nominal ₩)', '']
for N in HORIZONS:
    L += [f'### {N} years', '',
          '| Series | basis | windows | WORST CAGR (window) → ₩5M becomes | 10th pct → ₩ | Median → ₩ | Worst REAL (window) → ₩ (start-year money) |',
          '|---|---|---|---|---|---|---|']
    for s in series:
        w = s['windows'][str(N)]; wr = s['windowsReal'][str(N)]
        tag = ' †' if s.get('hindsightPicked') else ''
        tag += ' (former monopoly)' if s.get('monopolyStatus', '').startswith('former') else ''
        name = f"{s['nameKo']} {s['code'] or ''}{tag}".strip()
        if w is None:
            L.append(f"| {name} | {s['basis']} | 0 | too short — not computed | | | |")
            continue
        flag = ' ⚠n<5' if w['n'] < 5 else ''
        L.append(f"| {name} | {s['basis']} | {w['n']}{flag} | **{pct(w['worst']['cagr'])}** ({w['worst']['from']}-{w['worst']['to']}) → **{won(w['worst']['won'])}** | "
                 f"{pct(w['p10']['cagr'])} → {won(w['p10']['won'])} | {pct(w['median']['cagr'])} → {won(w['median']['won'])} | {cell(wr, 'worst') if wr else 'n/a'} |")
    L += ['', '† chosen today with hindsight (survivorship bias). ⚠n<5: too few windows for percentiles to mean much.', '']

L += ['## 2. Full available history (one path)', '',
      '| Series | basis | from | to | years | multiple | CAGR | ₩5M became |', '|---|---|---|---|---|---|---|---|']
for s in series:
    f = s['full']
    extra = f" (adj. {f['firstPriceAdjusted']:,.0f}; raw {f['firstPriceRaw']:,.0f})" if 'firstPriceRaw' in f else ''
    L.append(f"| {s['nameKo']} | {s['basis']} | {f['from']}{extra} | {f['to']} | {f['years']} | ×{f['multiple']:,} | {pct(f['cagr'])} | {won(f['won'])} |")
L += ['', 'Full-history lines include 2026 to date (KOSPI rose about 65% in 2026 before 2026-10-06), so they are not conservative; the '
      'window tables above use completed calendar years only.', '']

L += ['## 3. Monopoly facts (one line each)', '', '| Company | status | fact | source |', '|---|---|---|---|']
for s in series:
    if s['kind'] == 'monopoly':
        L.append(f"| {s['nameKo']} {s['code']} | {s['monopolyStatus']} | {s['monopolyFact']['ko']} | {s['monopolyFact']['url']} |")
L += ['', 'Exact quotes: raw/monopoly_facts.csv. KT&G is kept but marked FORMER: its legal manufacturing monopoly ended in 2001 '
      '(two of its 27 listed years), so it does not meet "monopoly for most of the period"; show it separately or drop it.', '']

L += ['## 4. Context for the high-dividend windows (same years)', '']
c = context['msci_korea_krw_gross']['windows']['10']
h = hdy['windows']['10']
L.append(f"* MSCI Korea High Dividend Yield (TR): 10-year worst {cell(h, 'worst')}, median {pct(h['median']['cagr'])}.")
L.append(f"* MSCI Korea, whole market (TR, same factsheet): 10-year worst {cell(c, 'worst')}, median {pct(c['median']['cagr'])}.")
if 'kospi_price_same_windows' in context:
    k10 = context['kospi_price_same_windows']['windows']['10']; k20 = context['kospi_price_same_windows']['windows']['20']
    L.append(f"* KOSPI price only (earlier research), windows starting 2011-2015: worst {cell(k10, 'worst')}, median {pct(k10['median']['cagr'])}; "
             f"20-year 1998-2018: {cell(k20, 'worst')}.")
L.append(f"* MSCI Korea (TR) since 1994-05-31: {context['msci_korea_krw_gross']['sinceBase']['cagr']*100:.2f}%/yr; MSCI Korea High Dividend Yield (TR) since 1998-12-31: {HDY_SINCE*100:.2f}%/yr (both as of 2026-09-30).")
L += ['', 'All five high-dividend 10-year windows lie inside 2011-2025, a stretch that ends with the 2025 rally, so even the '
      '"worst" of these five is a short-sample figure. The index page reports a 63.53% fall from 1999-07-07 to 2000-12-04, '
      'which no window above captures.', '']

L += ['## 5. Monthly-rolling sensitivity (worst month-end to month-end window; all months to 2026-10-02, as in the earlier research)', '',
      '| Series | 10y worst | 20y worst | 30y worst |', '|---|---|---|---|']
for s in series:
    if 'monthlyWorst' in s:
        cells_ = []
        for N in HORIZONS:
            m = s['monthlyWorst'][str(N)]
            cells_.append('—' if m is None else f"{pct(m['cagr'])} ({m['from']}..{m['to']}) → {won(m['won'])}")
        L.append(f"| {s['nameKo']} | " + ' | '.join(cells_) + ' |')
L += ['', 'Adjustment-method sensitivity:']
for k, v in sens_out.items():
    parts = []
    for N in HORIZONS:
        w = v['windows'][str(N)]
        parts.append(f"{N}y worst " + ('n/a' if w is None else f"{pct(w['worst']['cagr'])} ({w['worst']['from']}-{w['worst']['to']}) → {won(w['worst']['won'])}"))
    L.append(f"* {v['what']}: full history ×{v['full']['multiple']} ({pct(v['full']['cagr'])}/yr); " + '; '.join(parts))
L += ['']

L += ['## 6. Method', '',
      '* **Windows**: calendar year-end values (last trading day; completed years to 2025). For N = 10/20/30 every window [y, y+N] '
      'whose two year-ends exist; CAGR = (V[y+N]/V[y])^(1/N) − 1; worst with its years, 10th percentile (numpy linear '
      'interpolation), median; ₩5,000,000 × (1+CAGR)^N. A series too short for N gives null. Identical to `../longterm/calc.py`.',
      '* **Stocks**: KRX daily closes (FinanceData/marcap mirror of KRX 전종목시세, to 2026-10-02). Adjusted price = chain of KRX '
      'base prices (기준가 = Close − Changes) on ex-dates; overrides: Kangwon Land KOSDAQ→KOSPI move 2003-09-04 = 1.0 (holder value '
      'continuous) and 10:1 split 2003-11-04 = 0.1. Events used are listed in derived/stock_adjustment_events.csv. KT&G had no '
      'adjusting events. Price only: cash dividends excluded.',
      '* **KEPCO** data start 1995-05-02 is the dataset start, not the listing (1989). Its three first-trading-day base-price changes '
      '(1996-01-03 −0.32%, 1997-01-03 −0.81%, 1998-01-03 −0.64%) are applied as in the earlier Samsung series; removing them '
      'changes little (see sensitivity).',
      '* **MSCI Korea High Dividend Yield (KRW, gross)**: the factsheet (as of 2026-09-30) gives calendar-year returns 2012-2025, '
      'annualised since 1998-12-31 = 13.88% and 2026 YTD = 45.23%. Year-end levels: end-2011 = 100, chained by the yearly returns; '
      'the end-1998 level is derived as level(2026-09-30) / 1.1388^27.75. "Gross" = dividends reinvested before withholding tax. '
      'MSCI launched the index on 2013-07-12; earlier values are back-tested.',
      '* **Checks**: the MSCI Korea column of the HDY factsheet equals the separate MSCI Korea (KRW) factsheet for all 14 years; '
      'the KRW/USD ratio of the HDY column equals that of the MSCI Korea column every year (largest gap '
      f"{max(abs(r['diff']) for r in fx_check):.4f}; derived/msci_fx_consistency_check.csv).",
      '* **Real values**: CPI from World Bank annual-average inflation (same file and construction as the earlier research).', '']

L += ['## 7. High-dividend data: what each attempt returned (in the order tried)', '',
      '| step | target | returned | usable |', '|---|---|---|---|']
for a in hd_attempts:
    L.append(f"| {a['step']} | {a['target']} | {a['returned']} | {'yes' if a['usable'] else 'no'} |")
L += ['', '## 8. Data gaps (not found)', '']
for item in not_found:
    L.append(f"* **{item['what']}** — tried: " + '; '.join(f"{u} ({o})" for u, o in zip(item['tried'], item['outcome'])))
L += ['', 'Sources with access date and as-of date: raw/sources.csv. Derived tables: derived/*.csv. Reproduce: '
      '`nice -n 19 python3 -I scripts/extract_marcap2.py <marcap_dir> raw/krx_marcap_monopoly4_daily_raw.csv` then '
      '`nice -n 19 python3 -I scripts/calc2.py`.', '',
      '*과거 자료로 한 계산입니다. 투자 권유가 아닙니다.*']
with open(os.path.join(HERE, 'result.md'), 'w', encoding='utf-8') as fh:
    fh.write('\n'.join(L) + '\n')
print('written result.json, result.md, derived/*.csv')
