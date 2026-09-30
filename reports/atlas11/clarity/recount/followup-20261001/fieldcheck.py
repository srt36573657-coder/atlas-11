import os, json
from collections import Counter
ROOT = "/home/claude/atlas/ATLAS/reports/atlas11/ledger"
dk_mis, type_mis, ids, sup, notrail = [], [], Counter(), 0, []
for t in sorted(os.listdir(ROOT)):
    for fn in sorted(os.listdir(os.path.join(ROOT, t))):
        fp = os.path.join(ROOT, t, fn)
        raw = open(fp, "rb").read()
        if not raw.endswith(b"\n"): notrail.append(f"{t}/{fn}")
        for i, line in enumerate(raw.decode("utf-8").split("\n"), 1):
            if not line.strip(): continue
            r = json.loads(line)
            if r.get("dateKST") != fn[:10]: dk_mis.append((t, fn, i, r.get("dateKST")))
            if r.get("type") != t: type_mis.append((t, fn, i, r.get("type")))
            ids[r.get("id")] += 1
            if r.get("supersedes"): sup += 1
print("dateKST != file date:", len(dk_mis), dk_mis[:5])
print("type field != folder:", len(type_mis), type_mis[:5])
print("distinct ids:", len(ids), " duplicated ids:", sum(1 for v in ids.values() if v > 1))
print("records with non-empty 'supersedes':", sup)
print("files without trailing newline:", notrail)
