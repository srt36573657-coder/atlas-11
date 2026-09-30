import os, json, re
from datetime import datetime, timedelta, timezone
from collections import Counter, defaultdict
ROOT = "/home/claude/atlas/ATLAS/reports/atlas11/ledger"
KST = timezone(timedelta(hours=9))
keys = defaultdict(Counter)
mismatch = defaultdict(Counter)   # type -> Counter of (file_date, at_kst_date)
kst1001_elsewhere = []
noat = Counter()
for t in sorted(os.listdir(ROOT)):
    for fn in sorted(os.listdir(os.path.join(ROOT, t))):
        fdate = fn[:10]
        with open(os.path.join(ROOT, t, fn), encoding="utf-8") as f:
            for i, line in enumerate(f, 1):
                if not line.strip(): continue
                r = json.loads(line)
                keys[t].update(r.keys() if isinstance(r, dict) else ["<non-dict>"])
                at = r.get("at") if isinstance(r, dict) else None
                if not isinstance(at, str):
                    noat[t] += 1; continue
                try:
                    d = datetime.fromisoformat(at.replace("Z", "+00:00")).astimezone(KST).date().isoformat()
                except Exception:
                    noat[t] += 1; continue
                if d != fdate:
                    mismatch[t][(fdate, d)] += 1
                if d == "2026-10-01" and fdate != "2026-10-01":
                    kst1001_elsewhere.append((t, fn, i, at))
for t in keys:
    top = [k for k, _ in keys[t].most_common(12)]
    print(t, "top keys:", top)
print("records without parseable 'at':", dict(noat))
print("file-date vs at(KST)-date mismatches:", {t: dict(c) for t, c in mismatch.items()})
print("records whose 'at' is KST 2026-10-01 but filed under another date:", len(kst1001_elsewhere), kst1001_elsewhere[:5])
