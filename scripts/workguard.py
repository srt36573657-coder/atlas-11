#!/usr/bin/env python3
"""WorkGuard 1.0 — Codex Stop hook. Python 3.9+, standard library only.

This is not a universal ChatGPT injection. A supported, trusted Stop hook
must actually call this program. It cannot override cancellation, approvals,
quotas or an unavailable runtime. Validators must be trusted, read-only code.
"""
import argparse
import hashlib
import json
import os
from pathlib import Path
import re
import shlex
import signal
import subprocess
import sys
import tempfile
import time


def digest(data):
    return hashlib.sha256(data).hexdigest()


def read(path):
    return json.loads(path.read_text(encoding="utf-8"))


def write(path, value):
    path.parent.mkdir(parents=True, exist_ok=True)
    fd, name = tempfile.mkstemp(dir=path.parent, prefix="wg-")
    try:
        with os.fdopen(fd, "w", encoding="utf-8") as f:
            json.dump(value, f, ensure_ascii=False, indent=2, allow_nan=False)
            f.flush()
            os.fsync(f.fileno())
        os.replace(name, path)
    finally:
        if os.path.exists(name):
            os.unlink(name)


def validate(plan):
    if not isinstance(plan, dict) or not str(plan.get("goal", "")).strip():
        raise ValueError("goal must describe the requested outcome")
    checks = plan.get("checks")
    if not isinstance(checks, list) or not checks or len(checks) > 100:
        raise ValueError("checks must contain 1..100 acceptance checks")
    seen = set()
    for c in checks:
        if not isinstance(c, dict):
            raise ValueError("invalid check")
        cid = c.get("id", "")
        if not isinstance(cid, str) or not re.fullmatch(r"[A-Za-z0-9_-]{1,50}", cid) or cid in seen:
            raise ValueError("check IDs must be unique ASCII identifiers")
        seen.add(cid)
        if not str(c.get("requirement", "")).strip():
            raise ValueError("every check needs a requirement")
        argv = c.get("argv")
        if not isinstance(argv, list) or not argv or not all(isinstance(s, str) and s for s in argv):
            raise ValueError("argv must be a non-empty argument array")
        timeout = c.get("timeout", 5)
        if type(timeout) not in (int, float) or not 0 < timeout <= 30:
            raise ValueError("check timeout must be in (0, 30]")
    for key, default in (("max_continuations", 20), ("max_unchanged", 5)):
        n = plan.get(key, default)
        if type(n) is not int or not 1 <= n <= 100:
            raise ValueError(key + " must be an integer in [1, 100]")
    if sum(c.get("timeout", 5) for c in checks) > 45:
        raise ValueError("combined check timeouts must not exceed 45 seconds")


def run_check(check, root):
    # No shell expansion; capture logs on disk to avoid unbounded RAM use.
    with tempfile.TemporaryFile() as out:
        p = None
        try:
            p = subprocess.Popen(check["argv"], cwd=root, stdin=subprocess.DEVNULL,
                                 stdout=out, stderr=subprocess.STDOUT,
                                 start_new_session=(os.name == "posix"))
            code = p.wait(timeout=check.get("timeout", 5))
        except subprocess.TimeoutExpired:
            if os.name == "posix":
                try:
                    os.killpg(p.pid, signal.SIGKILL)
                except ProcessLookupError:
                    pass
            else:
                p.kill()
            p.wait()
            return False, "validator timed out"
        except OSError as exc:
            return False, str(exc)
        out.seek(0, 2)
        out.seek(max(0, out.tell() - 1600))
        detail = out.read().decode("utf-8", errors="replace").strip()
        return code == 0, (detail or "exit=" + str(code))


def load_plan(folder):
    raw = (folder / "contract.json").read_bytes()
    if digest(raw) != read(folder / "seal.json")["sha256"]:
        raise ValueError("acceptance contract changed; completion cannot be verified")
    plan = json.loads(raw)
    validate(plan)
    return plan


def audit(folder, event, result):
    with (folder / "events.jsonl").open("a", encoding="utf-8") as f:
        f.write(json.dumps({"time": time.time(), "session_id": event.get("session_id"),
                            "turn_id": event.get("turn_id"), **result}, ensure_ascii=False) + "\n")


def evaluate(root, event, hook=False):
    folder = root / ".workguard"
    if not (folder / "contract.json").exists():
        return {"systemMessage": "WorkGuard: acceptance criteria are not registered; guard inactive."}
    if (folder / "PAUSED").exists():
        return {"systemMessage": "WorkGuard paused; completion has NOT been verified."}
    sid = event.get("session_id", "manual-check")
    if not isinstance(sid, str) or not sid:
        raise ValueError("missing session_id")
    key = digest(sid.encode())[:24]
    state_path = folder / ("state-" + key + ".json")
    # Separate state per session; atomic writes retain restart progress.
    state = read(state_path) if state_path.exists() else {}
    try:
        plan = load_plan(folder)
        fingerprint = digest((folder / "contract.json").read_bytes())
        if state.get("contract") != fingerprint:
            state = {"contract": fingerprint}
        results = []
        for c in plan["checks"]:
            ok, detail = run_check(c, root)
            results.append({"id": c["id"], "requirement": c["requirement"],
                            "passed": ok, "detail": detail})
        failed = [r["id"] for r in results if not r["passed"]]
        report = {"status": "complete" if not failed else "incomplete", "checks": results}
    except (OSError, ValueError, KeyError, TypeError) as exc:
        plan = {"max_continuations": 20, "max_unchanged": 5}
        failed = ["GUARD_ERROR"]
        report = {"status": "incomplete", "error": str(exc), "checks": []}
    if hook:
        unchanged = state.get("unchanged", 0) + 1 if state.get("failed") == failed else 1
        count = state.get("continuations", 0)
        blocked = bool(failed) and count < plan.get("max_continuations", 20) and unchanged <= plan.get("max_unchanged", 5)
        state.update(failed=failed, unchanged=unchanged,
                     continuations=count + int(blocked), report=report, updated_at=time.time())
        write(state_path, state)
        audit(folder, event, report)
        if not failed:
            return {"systemMessage": "WorkGuard: all registered acceptance checks passed."}
        if not blocked:
            return {"continue": False, "stopReason": "WorkGuard: incomplete; retry limit reached.",
                    "systemMessage": "WorkGuard 미완료: 반복 한도 도달. 실패 항목: " + ", ".join(failed) + ". 결과 기록: " + str(state_path)}
        requirements = [r["id"] + ": " + r["requirement"] for r in report["checks"] if not r["passed"]]
        reason = ("WorkGuard 검사 결과 미완료입니다. 남은 항목을 수행하고 다시 검증하세요. "
                  "검사 기준을 줄이거나 성공값을 조작하지 마세요. 사용자 중단·승인·접근 제한은 준수하세요. "
                  "실패 원인과 상세 로그는 " + str(state_path) + "에 있습니다.\n" + "\n".join(requirements))
        return {"decision": "block", "reason": reason[:5500]}
    return report


def install(root):
    folder = root / ".workguard"
    folder.mkdir(parents=True, exist_ok=True)
    target = folder / "workguard.py"
    source = Path(__file__).resolve()
    if source != target:
        target.write_bytes(source.read_bytes())
    cfg_path = root / ".codex" / "hooks.json"
    cfg = read(cfg_path) if cfg_path.exists() else {"hooks": {}}
    argv = [sys.executable, str(target), "hook", "--root", str(root)]
    command = subprocess.list2cmdline(argv) if os.name == "nt" else shlex.join(argv)
    handler = {"type": "command", "command": command, "timeout": 60,
               "statusMessage": "WorkGuard: checking completion"}
    groups = cfg.setdefault("hooks", {}).setdefault("Stop", [])
    if not any(handler in group.get("hooks", []) for group in groups):
        if cfg_path.exists():
            backup = cfg_path.with_name("hooks.json.backup-" + str(time.time_ns()))
            backup.write_bytes(cfg_path.read_bytes())
        groups.append({"hooks": [handler]})
        write(cfg_path, cfg)
    return {"status": "configured_not_activated", "config": str(cfg_path),
            "next": "Supported Codex runtime must load this project config. Review/trust via /hooks where available. Verify a real Stop event; writing files alone does not activate the guard."}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("action", choices=["install", "start", "check", "hook", "pause", "resume"])
    parser.add_argument("--root", default=".")
    parser.add_argument("--plan", help="start: JSON acceptance contract")
    args = parser.parse_args()
    root = Path(args.root).resolve()
    folder = root / ".workguard"
    event = {}
    if args.action == "hook":
        event = json.load(sys.stdin)
        if event.get("hook_event_name") != "Stop":
            result = {}
        else:
            result = evaluate(root, event, hook=True)
    elif args.action == "install":
        result = install(root)
    elif args.action == "start":
        if not args.plan:
            parser.error("start requires --plan")
        plan = read(Path(args.plan))
        validate(plan)
        folder.mkdir(parents=True, exist_ok=True)
        if (folder / "contract.json").exists():
            archive = folder / ("contract-" + str(time.time_ns()) + ".json")
            archive.write_bytes((folder / "contract.json").read_bytes())
        write(folder / "contract.json", plan)
        write(folder / "seal.json", {"sha256": digest((folder / "contract.json").read_bytes())})
        (folder / "PAUSED").unlink(missing_ok=True)
        result = {"status": "criteria_registered", "checks": len(plan["checks"])}
    elif args.action == "pause":
        folder.mkdir(parents=True, exist_ok=True)
        (folder / "PAUSED").write_text("user pause", encoding="utf-8")
        result = {"status": "paused"}
    elif args.action == "resume":
        load_plan(folder)
        (folder / "PAUSED").unlink(missing_ok=True)
        # Explicit resumption renews retry budget, retaining the audit history.
        for path in folder.glob("state-*.json"):
            state = read(path)
            state.update(continuations=0, unchanged=0)
            write(path, state)
        result = {"status": "ready_for_next_supported_turn"}
    else:
        result = evaluate(root, {})
    print(json.dumps(result, ensure_ascii=False))
    return 1 if args.action == "check" and result.get("status") != "complete" else 0


if __name__ == "__main__":
    try:
        sys.exit(main())
    except Exception as exc:
        # Hook errors must never be presented as successful completion.
        print(json.dumps({"continue": False, "stopReason": "WorkGuard internal error",
                          "systemMessage": "WorkGuard 미완료/오류: " + str(exc)}, ensure_ascii=False))
        sys.exit(1)
