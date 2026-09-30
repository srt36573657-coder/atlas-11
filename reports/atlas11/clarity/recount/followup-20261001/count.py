import os, json, glob, re
from datetime import datetime, timedelta, timezone

ROOT = "/home/claude/atlas/ATLAS/reports/atlas11/ledger"
KST = timezone(timedelta(hours=9))

per_type_date = {}   # (type, date) -> count
bad_json = []        # (file, lineno, snippet)
ws_only = []         # whitespace-only lines
other_files = []     # anything not matching <type>/<YYYY-MM-DD>.jsonl
line_date_mismatch = 0

for entry in sorted(os.listdir(ROOT)):
    p = os.path.join(ROOT, entry)
    if not os.path.isdir(p):
        other_files.append(p); continue
    for fn in sorted(os.listdir(p)):
        fp = os.path.join(p, fn)
        m = re.fullmatch(r"(\d{4}-\d{2}-\d{2})\.jsonl", fn)
        if not m or not os.path.isfile(fp):
            other_files.append(fp); continue
        date = m.group(1)
        n = 0
        with open(fp, "rb") as f:
            raw = f.read()
        text = raw.decode("utf-8")
        for i, line in enumerate(text.split("\n"), 1):
            if line == "":
                continue
            if line.strip() == "":
                ws_only.append((fp, i)); continue
            n += 1
            try:
                json.loads(line)
            except Exception as e:
                bad_json.append((fp, i, line[:80]))
        per_type_date[(entry, date)] = n

# 1. records dated 2026-10-01
D = "2026-10-01"
day = {t: c for (t, d), c in per_type_date.items() if d == D}
print("== 1. dated", D, "total:", sum(day.values()), "split:", day)

# 2. total
print("== 2. total all dates/types:", sum(per_type_date.values()))

# 3. per type
types = sorted({t for t, _ in per_type_date})
per_type = {t: sum(c for (tt, d), c in per_type_date.items() if tt == t) for t in types}
print("== 3. per type:", per_type)
print("   types with >=1 record:", sum(1 for v in per_type.values() if v > 0), "of", len(types))

print("== per (type,date):")
for k in sorted(per_type_date):
    print("  ", k, per_type_date[k])

# 4. operation/2026-10-01 'at'
fp = os.path.join(ROOT, "operation", "2026-10-01.jsonl")
ats = []
with open(fp, encoding="utf-8") as f:
    for i, line in enumerate(f, 1):
        if not line.strip(): continue
        rec = json.loads(line)
        at = rec.get("at")
        ats.append((i, at))
print("== 4. operation/2026-10-01 'at' values:")
parsed = []
for i, at in ats:
    dt = datetime.fromisoformat(at.replace("Z", "+00:00")) if isinstance(at, str) else None
    parsed.append(dt)
    print(f"   line {i}: {at}  -> KST {dt.astimezone(KST).isoformat() if dt else None}")
latest = max(p for p in parsed if p)
print("   latest UTC:", latest.isoformat(), " KST HH:MM:", latest.astimezone(KST).strftime("%H:%M"),
      " KST date:", latest.astimezone(KST).date())

print("== checks: bad_json:", len(bad_json), bad_json[:5])
print("   whitespace-only lines:", len(ws_only), ws_only[:5])
print("   non-ledger files/dirs:", other_files)
