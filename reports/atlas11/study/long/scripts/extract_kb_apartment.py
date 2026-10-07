"""Extract KB 월간 아파트 매매가격지수 (KB Kookmin Bank / KB부동산 데이터허브) from the
Excel export '월간 아파트 매매가격지수_20260914.xlsx' (GitHub mirror, see sources.csv).
Writes month, region columns. Usage: python -I extract_kb_apartment.py <xlsx> <out.csv>"""
import sys, datetime, csv, openpyxl
src, out = sys.argv[1], sys.argv[2]
wb = openpyxl.load_workbook(src, read_only=True, data_only=True)
ws = wb.worksheets[0]
rows = list(ws.iter_rows(values_only=True))
hdr = rows[0]
months = [d.strftime('%Y-%m') if isinstance(d, datetime.datetime) else None for d in hdr[1:]]
want = ['전국', '서울', '강남11개구', '강북14개구', '수도권', '6개광역시']
found = {}
for r in rows[1:]:
    if r[0] in want and r[0] not in found:   # first occurrence = aggregate rows (district names repeat later)
        found[r[0]] = r[1:]
with open(out, 'w', newline='', encoding='utf-8') as f:
    w = csv.writer(f)
    w.writerow(['month'] + ['kb_apt_' + {'전국':'nationwide','서울':'seoul','강남11개구':'seoul_gangnam11','강북14개구':'seoul_gangbuk14','수도권':'capital_region','6개광역시':'six_metro_cities'}[k] for k in want])
    for i, m in enumerate(months):
        if m is None: continue
        vals = []
        for k in want:
            v = found[k][i]
            vals.append('' if v in ('-', None, '') else repr(float(v)))
        w.writerow([m] + vals)
print('regions found:', list(found), 'months:', months[0], '->', [m for m in months if m][-1])
