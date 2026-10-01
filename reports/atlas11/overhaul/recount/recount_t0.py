#!/usr/bin/env python3
"""Independent recount ("세는 이") of the 1-trading-day cells for 2026-09-29 and 2026-09-30.

Reads ONLY
  reports/atlas11/ledger/*/*.jsonl            (score, analysis and collection records)
  config/atlas11/scoring-policy.v1.json       (only to cross-check two thresholds)
Writes ONLY
  reports/atlas11/overhaul/recount-2.json     (aggregate counts, same keys as recount-1.json)
  reports/atlas11/overhaul/recount-cells.json (104 per-cell rows)
  recount-1.json is never written by this version (it was produced by the first run,
  whose bin-3 reading also counted pre-issue disclosures; that reading is still printed
  under --explain as a sensitivity line).

Python 3 standard library only.  Deterministic.  Decisions (directions, thresholds, bins,
means) use exact arithmetic: JSON numbers are parsed as Decimal and computed with
fractions.Fraction; means are rounded half-away-from-zero once at the end.  The per-cell
file reports plain IEEE floats computed in the order the formulas are written
(e.g. predRet = p50 / anchor - 1), with no rounding.
Run with --explain to print per-cell diagnostics and sensitivity checks to stderr
(stderr never changes the output files).

Definitions used by default
  zero-weight cell : the first modelContribution line states all three parts
                     (절편, 자기 추세, 52종목 폭·평균) as an unsigned 0.00% — the
                     formatter prints exact zero unsigned and any non-zero value with a
                     sign, so "+0.00%" means a non-zero part (or total) and is NOT zero.
  bin 3 (놓친것)   : read literally — a company SCHEDULE (기업 일정) knowable before the
                     forecast: the cell's analysis facts list a confirmed schedule inside
                     the cell window with 기업 >= 1 ("기간 안 확인된 일정 N건(기업 K · …)").
                     Disclosures (공시) and news (기사) are NOT counted.  The "more common
                     among wrong cells than among correct cells" test is pooled over all
                     cells in scope.
"""
import json
import re
import sys
from datetime import datetime, timedelta, timezone
from decimal import Decimal
from fractions import Fraction
from pathlib import Path

ROOT = Path(__file__).resolve().parents[4]
LEDGER = ROOT / "reports" / "atlas11" / "ledger"
POLICY = ROOT / "config" / "atlas11" / "scoring-policy.v1.json"
OUT_COUNTS = ROOT / "reports" / "atlas11" / "overhaul" / "recount-2.json"
OUT_CELLS = ROOT / "reports" / "atlas11" / "overhaul" / "recount-cells.json"

# Representative 1-day forecast for each target date (given by the audit brief).
REP = {
    "2026-09-29": "2026-09-28-rolling20-13cd892134e517b4",
    "2026-09-30": "2026-09-29-atlas11-128de9174cfdfa1f",
}
LABEL = {"2026-09-29": "9/29", "2026-09-30": "9/30"}
EXPECTED_PER_DATE = 52

FLAT = Fraction(1, 1000)        # actual direction: |actual/anchor - 1| <= 0.1 % is flat
SIZE_TOL = Fraction(15, 1000)   # size correct: |p50 - actual| / actual <= 1.5 %
COIN = Fraction(5, 100)         # bin 1: top probability - second < 5 percentage points
HALF = Fraction(1, 2)           # bin 2: market part >= 50 % of the actual move
TIE_ORDER = ("flat", "up", "down")
KST = timezone(timedelta(hours=9))

NUM = r"([+\-−]?\d+(?:\.\d+)?)"
PARTS_RE = re.compile(r"기대 누적 " + NUM + r"% = 절편 " + NUM + r"% \+ 자기 추세 " + NUM
                      + r"% \+ 52종목 폭·평균 " + NUM + r"%")
SECTOR_RE = re.compile(r"고유 몫 평균 " + NUM + r"%")
SCHED_RE = re.compile(r"^기간 안 확인된 일정 (\d+)건\(기업 (\d+) · 중요 (\d+)\)")
# Only for the --explain sensitivity lines: exchange trading notices, not company filings.
EXCHANGE_NOTICE_WORDS = ("가격제한폭", "공매도", "투자경고", "투자주의", "투자위험", "단기과열", "투자유의")

EXPLAIN = "--explain" in sys.argv[1:]


def say(*parts):
    if EXPLAIN:
        print(*parts, file=sys.stderr)


def frac(x):
    """Exact Fraction from an int / Decimal parsed out of JSON."""
    if isinstance(x, bool) or x is None:
        raise ValueError("not a number: %r" % (x,))
    return Fraction(x)


def plain(x):
    """Ledger number as written: int stays int, Decimal becomes the nearest float."""
    return x if isinstance(x, int) and not isinstance(x, bool) else float(x)


def signed_value(token):
    return frac(Decimal(token.replace("−", "-")))


def sgn(x):
    return (x > 0) - (x < 0)


def round2(x):
    """Round an exact Fraction half away from zero to 2 decimals; return a float."""
    q = abs(x) * 100
    whole = q.numerator // q.denominator
    if q - whole >= HALF:
        whole += 1
    if whole == 0:
        return 0.0
    return float(Fraction(sgn(x) * whole, 100))


def pct(x):
    return round2(x * 100)


def mean(values):
    values = list(values)
    return sum(values, Fraction(0)) / len(values) if values else Fraction(0)


def parse_time(text):
    if text.endswith("Z"):
        text = text[:-1] + "+00:00"
    dt = datetime.fromisoformat(text)
    if dt.tzinfo is None:
        dt = dt.replace(tzinfo=KST)
    return dt


def day_start_kst(iso_date):
    y, m, d = (int(p) for p in iso_date.split("-"))
    return datetime(y, m, d, tzinfo=KST)


def dump(obj):
    return json.dumps(obj, ensure_ascii=False, separators=(",", ":")).encode("utf-8")


def load_records():
    out = []
    for path in sorted(LEDGER.glob("*/*.jsonl")):
        with path.open(encoding="utf-8") as fh:
            for lineno, line in enumerate(fh, 1):
                line = line.strip()
                if line:
                    out.append((str(path.relative_to(ROOT)), lineno,
                                json.loads(line, parse_float=Decimal)))
    return out


def pick_latest(rows, what):
    """rows: key -> list of (file, line, record); keep the record with the latest `at`."""
    chosen, notes = {}, []
    for key in sorted(rows):
        cands = sorted(rows[key], key=lambda t: (t[2].get("at") or "", t[0], t[1]))
        if len(cands) > 1:
            notes.append((what, key, [(c[2]["id"], c[2].get("at")) for c in cands]))
            if cands[-1][2].get("at") == cands[-2][2].get("at"):
                notes.append((what + " TIE-ON-AT", key, None))
        chosen[key] = cands[-1][2]
    return chosen, notes


def predicted_from_probs(pr):
    best = None
    for c in TIE_ORDER:  # strict '>' keeps the earlier class on ties: flat -> up -> down
        if best is None or pr[c] > pr[best]:
            best = c
    return best


def main():
    records = load_records()
    superseded = {r["supersedes"] for _, _, r in records if r.get("supersedes")}
    current = [t for t in records if t[2].get("id") not in superseded]

    # ---- 1. score cells -------------------------------------------------------
    score_rows = {}
    for t in current:
        r = t[2]
        if r.get("type") != "score":
            continue
        b = r.get("body") or {}
        td = b.get("targetDate")
        if b.get("horizon") != 1 or REP.get(td) != b.get("forecastId"):
            continue
        score_rows.setdefault((b["forecastId"], b["code"], td), []).append(t)
    scores, score_dups = pick_latest(score_rows, "score")

    # ---- 2. matching cause-analysis records --------------------------------
    an_rows = {}
    for t in current:
        r = t[2]
        if r.get("type") != "analysis":
            continue
        b = r.get("body") or {}
        if b.get("kind") != "cell" or b.get("horizon") != 1:
            continue
        key = (b.get("forecastId"), b.get("code"), b.get("targetDate"))
        if key in score_rows:
            an_rows.setdefault(key, []).append(t)
    analyses, an_multi = pick_latest(an_rows, "analysis")

    # ---- 3. per-stock disclosure lists (only for --explain sensitivity lines) ------
    disclosures = {}
    for _, _, r in current:
        b = r.get("body") or {}
        if r.get("type") == "collection" and b.get("kind") == "context_disclosures":
            for it in b.get("items") or []:
                disclosures.setdefault(b.get("code"), {})[it.get("id")] = it

    warnings = []
    for td in REP:
        n = sum(1 for k in scores if k[2] == td)
        if n != EXPECTED_PER_DATE:
            warnings.append("target %s has %d cells (expected %d)" % (td, n, EXPECTED_PER_DATE))
    missing = sorted(k for k in scores if k not in analyses)
    if missing:
        warnings.append("cells without analysis record: %r" % (missing,))

    # policy cross-check (the definitions in the brief are authoritative)
    try:
        policy = json.loads(POLICY.read_text(encoding="utf-8"), parse_float=Decimal)
        if frac(policy["flatDelta"]) != FLAT:
            warnings.append("policy flatDelta differs from brief")
        if frac(policy["priceHitTolerancePct"]["1"]) / 100 != SIZE_TOL:
            warnings.append("policy 1-day tolerance differs from brief")
    except (OSError, KeyError, ValueError) as exc:
        warnings.append("policy not readable: %s" % exc)

    # ---- 4. per-cell values ----------------------------------------------------
    cells = []
    disagreements = []
    checks = {"unparsed_contribution_line": 0, "zero_parts_vs_total": 0,
              "unparsed_sector_hypothesis": 0, "sign_realizedLog_vs_return": 0,
              "float_vs_exact_decision": 0}
    for key in sorted(scores, key=lambda k: (k[2], k[1])):
        rec = scores[key]
        s = rec["body"]
        a = analyses.get(key, {}).get("body", {})
        anchor = frac(s["anchor"])
        actual = frac(s["actual"])
        p50 = frac(s["predicted"]["p50"])
        pr = {c: frac(s["probabilities"][c]) for c in TIE_ORDER}

        rule_dir = predicted_from_probs(pr)
        stored = s.get("predictedDirection")
        pred = stored if stored in TIE_ORDER else rule_dir

        ret = actual / anchor - 1
        act = "up" if ret > FLAT else ("down" if ret < -FLAT else "flat")
        dir_ok = pred == act

        err = abs(p50 - actual) / actual
        size_ok = err <= SIZE_TOL
        base_err = abs(anchor - actual) / actual
        base_ok = base_err <= SIZE_TOL
        group = 1 if dir_ok and size_ok else 2 if dir_ok else 3 if size_ok else 4

        for what, mine, theirs in (
                ("predictedDirection vs probability rule", rule_dir, stored),
                ("actualDirection", act, s.get("actualDirection")),
                ("score directionCorrect", dir_ok, s.get("directionCorrect")),
                ("analysis directionCorrect", dir_ok, a.get("directionCorrect")),
                ("score class", group, s.get("class")),
                ("analysis class", group, a.get("class"))):
            if mine != theirs:
                disagreements.append((key[2], key[1], what, mine, theirs))

        ranked = sorted(pr.values(), reverse=True)
        top_gap = ranked[0] - ranked[1]
        gap_pp = (pr["down"] - pr["up"]) * 100

        lines = a.get("modelContribution") or []
        pm = PARTS_RE.search(lines[0]) if lines else None
        if pm:
            total_t, parts_t = pm.group(1), pm.groups()[1:]
            zero = all(t == "0.00" for t in parts_t)
            if zero != (total_t == "0.00"):
                checks["zero_parts_vs_total"] += 1
        else:
            checks["unparsed_contribution_line"] += 1
            total_t, parts_t, zero = None, None, False

        d = a.get("decomposition") or {}
        realized = frac(d["realizedLog"])
        market = frac(d["marketPartLog"])
        if sgn(realized) != sgn(ret):
            checks["sign_realizedLog_vs_return"] += 1
        market_ok = realized != 0 and sgn(market) == sgn(realized) and market / realized >= HALF

        sector_ok = False
        for h in a.get("hypotheses") or []:
            if h.get("category") != "업종 변화":
                continue
            hm = SECTOR_RE.search(h.get("evidence") or "")
            if not hm:
                checks["unparsed_sector_hypothesis"] += 1
                continue
            hsign = sgn(signed_value(hm.group(1)))
            if h.get("strength") in ("중", "강") and hsign != 0 and hsign == sgn(realized):
                sector_ok = True

        schedules = []
        for fact in a.get("facts") or []:
            sm = SCHED_RE.match(fact)
            if sm and int(sm.group(2)) >= 1:
                schedules.append(fact)

        if top_gap < COIN:
            first_bins = "반반"
        elif market_ok or sector_ok:
            first_bins = "시장업종"
        else:
            first_bins = None

        # plain floats for the per-cell file, computed in the written order
        anchor_v, actual_v = plain(s["anchor"]), plain(s["actual"])
        p50_f = float(s["predicted"]["p50"])
        pred_ret_f = p50_f / anchor_v - 1
        act_ret_f = actual_v / anchor_v - 1
        err_won_f = p50_f - actual_v
        ape_f = abs(p50_f - actual_v) / actual_v
        act_f = "up" if act_ret_f > 0.001 else ("down" if act_ret_f < -0.001 else "flat")
        if act_f != act or (ape_f <= 0.015) != size_ok:
            checks["float_vs_exact_decision"] += 1

        cells.append({
            "key": key, "date": key[2], "code": key[1], "name": s.get("name"),
            "score_id": rec["id"], "issued": parse_time(s["issuedAt"]),
            "origin0": day_start_kst(s["originDate"]),
            "pred": pred, "act": act, "dir_ok": dir_ok, "ret": ret,
            "err": err, "size_ok": size_ok, "base_err": base_err, "base_ok": base_ok,
            "group": group, "top_gap": top_gap, "gap_pp": gap_pp,
            "zero": zero, "total_t": total_t, "parts_t": parts_t,
            "market_ok": market_ok, "sector_ok": sector_ok, "first_bins": first_bins,
            "schedules": schedules,
            "pred_mag": abs(p50 / anchor - 1), "act_mag": abs(ret),
            "row": {
                "date": key[2], "code": key[1], "name": s.get("name"),
                "anchor": anchor_v, "p50": p50_f, "predRet": pred_ret_f,
                "actual": actual_v, "actRet": act_ret_f, "errWon": err_won_f, "ape": ape_f,
                "predDir": stored, "actDir": act, "dirOk": dir_ok, "sizeOk": size_ok,
                "group": group, "scoreId": rec["id"],
            },
            "analysis_version": a.get("analysisVersion"),
            "analysis_at": analyses.get(key, {}).get("at"),
        })

    # ---- 5. why-wrong bins (direction-wrong cells only) ------------------------
    wrong = [c for c in cells if not c["dir_ok"]]
    right = [c for c in cells if c["dir_ok"]]

    def event_test(has_event):
        ew = sum(1 for c in wrong if has_event(c))
        er = sum(1 for c in right if has_event(c))
        more = bool(wrong) and bool(right) and Fraction(ew, len(wrong)) > Fraction(er, len(right))
        missed = [c for c in wrong if c["first_bins"] is None and has_event(c)] if more else []
        return ew, er, more, missed

    def has_schedule(c):
        return bool(c["schedules"])

    ev_wrong, ev_right, more_in_wrong, missed = event_test(has_schedule)
    missed_keys = {c["key"] for c in missed}
    bins = {"반반": 0, "시장업종": 0, "놓친것": 0, "모름": 0}
    for c in wrong:
        if c["first_bins"]:
            c["bin"] = c["first_bins"]
        elif c["key"] in missed_keys:
            c["bin"] = "놓친것"
        else:
            c["bin"] = "모름"
        bins[c["bin"]] += 1

    # ---- 6. aggregates -----------------------------------------------------------
    def four(td):
        g = [0, 0, 0, 0]
        for c in cells:
            if c["date"] == td:
                g[c["group"] - 1] += 1
        return g

    zero_cells = [c for c in cells if c["zero"]]
    weighted = [c for c in cells if not c["zero"]]
    counts = {
        "범위": "1거래일 9/29·9/30",
        "칸": len(cells),
        "방향맞음": len(right),
        "방향틀림": len(wrong),
        "네묶음": {LABEL[td]: four(td) for td in sorted(REP)},
        "틀린까닭": bins,
        "예측하락": sum(1 for c in cells if c["pred"] == "down"),
        "실제하락": sum(1 for c in cells if c["act"] == "down"),
        "늘하락맞음": sum(1 for c in cells if c["act"] == "down"),
        "무게0칸": {
            "합": len(zero_cells),
            "9/29": sum(1 for c in zero_cells if c["date"] == "2026-09-29"),
            "9/30": sum(1 for c in zero_cells if c["date"] == "2026-09-30"),
        },
        "무게0하락": sum(1 for c in zero_cells if c["pred"] == "down"),
        "무게0확률차평균": round2(mean(c["gap_pp"] for c in zero_cells)),
        "맞힘중무게0하락": sum(1 for c in zero_cells if c["dir_ok"] and c["pred"] == "down"),
        "무게있음": {"칸": len(weighted), "맞음": sum(1 for c in weighted if c["dir_ok"])},
        "오차율평균": {
            "모델": pct(mean(c["err"] for c in cells)),
            "종가그대로": pct(mean(c["base_err"] for c in cells)),
        },
        "폭맞음": {
            "모델": sum(1 for c in cells if c["size_ok"]),
            "종가그대로": sum(1 for c in cells if c["base_ok"]),
        },
        "크기평균": {
            "예측": pct(mean(c["pred_mag"] for c in cells)),
            "실제": pct(mean(c["act_mag"] for c in cells)),
        },
    }
    OUT_COUNTS.write_bytes(dump(counts))
    OUT_CELLS.write_bytes(dump([c["row"] for c in cells]))

    # ---- 7. diagnostics (stderr only) -------------------------------------------
    for w in warnings:
        print("WARNING:", w, file=sys.stderr)
    for dsg in disagreements:
        print("DISAGREEMENT:", dsg, file=sys.stderr)
    for name, n in checks.items():
        if n:
            print("CHECK %s: %d" % (name, n), file=sys.stderr)
    if not EXPLAIN:
        return
    say("records read:", len(records), "| superseded ids:", len(superseded))
    say("score duplicates among current records:", len(score_dups), score_dups)
    say("cells with more than one current analysis record (latest `at` used):",
        sum(1 for n in an_multi if "TIE" not in n[0]),
        "| ties on `at`:", sum(1 for n in an_multi if "TIE" in n[0]))
    say("analysis versions used:",
        sorted({(c["date"], c["analysis_version"], c["analysis_at"]) for c in cells}))
    say("disagreements with stored fields:", len(disagreements), "| checks:", checks)
    say("zero-weight by parts:", len(zero_cells),
        "| totals of zero-weight cells:", sorted({c["total_t"] for c in zero_cells}),
        "| non-zero cells whose total prints as ±0.00:",
        [(c["date"], c["code"], c["name"], c["total_t"], c["parts_t"]) for c in weighted
         if c["total_t"] and signed_value(c["total_t"]) == 0])
    near = [(c["key"], "flat-edge") for c in cells if abs(abs(c["ret"]) - FLAT) < Fraction(1, 10**5)]
    near += [(c["key"], "size-edge") for c in cells if abs(c["err"] - SIZE_TOL) < Fraction(1, 10**6)]
    near += [(c["key"], "size-edge-base") for c in cells
             if abs(c["base_err"] - SIZE_TOL) < Fraction(1, 10**6)]
    near += [(c["key"], "coin-edge") for c in cells if abs(c["top_gap"] - COIN) < Fraction(1, 10**4)]
    say("near-threshold cells:", near)
    say("bin-3 test (company schedules): wrong %d/%d, correct %d/%d -> more common in wrong: %s"
        % (ev_wrong, len(wrong), ev_right, len(right), more_in_wrong))
    say("   wrong cells with a company schedule and their bin:",
        [(c["date"], c["code"], c["name"], c["bin"]) for c in wrong if c["schedules"]])
    say("per-cell: date code name | pred act ok grp | err% base% | zero gap_pp topgap_pp | mkt sector sched | bin")
    for c in cells:
        say("%s %s %s | %s %s %d %d | %.4f %.4f | %d %.2f %.2f | %d %d %d | %s"
            % (c["date"], c["code"], c["name"], c["pred"], c["act"], c["dir_ok"], c["group"],
               float(c["err"] * 100), float(c["base_err"] * 100), c["zero"],
               float(c["gap_pp"]), float(c["top_gap"] * 100), c["market_ok"], c["sector_ok"],
               bool(c["schedules"]), c.get("bin", "-")))

    def disc_items(c, start, words_excluded=False, flagged_only=False):
        out_items = []
        for it in disclosures.get(c["code"], {}).values():
            t = parse_time(it["publishedAt"])
            if not (start <= t < c["issued"]):
                continue
            if words_excluded and any(w in (it.get("title") or "") for w in EXCHANGE_NOTICE_WORDS):
                continue
            if flagged_only and not it.get("corporateAction"):
                continue
            out_items.append(it)
        return out_items

    variants = [
        ("recount-1 reading: schedule or origin-day disclosure",
         lambda c: has_schedule(c) or bool(disc_items(c, c["origin0"]))),
        ("origin-day disclosure only", lambda c: bool(disc_items(c, c["origin0"]))),
        ("disclosure after anchor close (15:30 KST) only",
         lambda c: bool(disc_items(c, c["origin0"] + timedelta(hours=15, minutes=30)))),
        ("schedule or origin-day disclosure without exchange trading notices",
         lambda c: has_schedule(c) or bool(disc_items(c, c["origin0"], words_excluded=True))),
        ("schedule or origin-day corporateAction-flagged disclosure",
         lambda c: has_schedule(c) or bool(disc_items(c, c["origin0"], flagged_only=True))),
        ("schedule or disclosure in last 24h before issue",
         lambda c: has_schedule(c) or bool(disc_items(c, c["issued"] - timedelta(hours=24)))),
        ("schedule or disclosure in last 3 days before issue",
         lambda c: has_schedule(c) or bool(disc_items(c, c["issued"] - timedelta(days=3)))),
        ("schedule or disclosure in last 7 days before issue",
         lambda c: has_schedule(c) or bool(disc_items(c, c["issued"] - timedelta(days=7)))),
    ]
    for name, fn in variants:
        ew, er, more, miss = event_test(fn)
        say("sensitivity [%s]: wrong %d/%d, correct %d/%d, more common in wrong: %s -> 놓친것 %d %s"
            % (name, ew, len(wrong), er, len(right), more, len(miss),
               [(c["date"], c["code"], c["name"]) for c in miss]))


if __name__ == "__main__":
    main()
