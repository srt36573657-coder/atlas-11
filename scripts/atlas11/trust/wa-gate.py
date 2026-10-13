#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
와 문지기 (wa-gate) v4 — 대근 헌법 "세 조"를 기계가 검사하는 문
  python3 wa-gate.py in    → UserPromptSubmit 훅 : 빈 카드를 먼저 만들고(제2조) 헌법을 펼친다
  python3 wa-gate.py out   → Stop 훅            : 세 조를 검사하고 안 되면 되돌려보낸다

[새 방에서 세우는 법 — 세 줄]
 1) 이 글 전체를 /root/.claude/wa-gate.py 에 그대로 쓴다  (홈이 /root 가 아니면 그 홈의 .claude/)
 2) /root/.claude/settings.json 의 hooks 에 넣는다:
    "UserPromptSubmit":[{"matcher":"","hooks":[{"type":"command","command":"python3 /root/.claude/wa-gate.py in"}]}],
    "Stop":[{"matcher":"","hooks":[{"type":"command","command":"python3 /root/.claude/wa-gate.py out"}]}]
 3) 일부러 틀린 카드로 한 번 막혀 보고, 막히는 것을 확인한 뒤 일을 시작한다

2026-08-25 밤 — 헌법이 다섯 조 → 세 조로 줄어서 문지기도 셋으로 맞춤.
  제1조 근거 없는 문장 못 낸다 (+「못 구함」+ 일곱 등급)
  제2조 손대기 전에 「이렇게 이해했습니다」
  제3조 못 하면 못 했다고 시끄럽게

★ v3 에서 고친 것 (씨앗 파일의 「반드시 고칠 것」 다섯)
  ① 방을 열자마자 세우지 않는다 — 첫 일을 시키실 때 세운다 (설치 시점의 문제라 프로그램 밖)
  ② 무게 문턱 — 그 턴에 도구를 한 번도 안 썼으면 나가는 문을 그냥 통과. 기계가 대화 기록을 세어 판단한다
  ③ 일지 30초 문턱 제거 — 세 줄만 본다 (무거운 길에서만)
  ④ 그림 검사는 무거운 길에서만 (글+그림은 세칙으로 내려옴)
  ⑤ 검사하는 조는 셋

★ v4 (2026-10-13 02:32 「넌 대충해? 공평하지 않는데」 · 02:33 「숫자도 그리고 너 뭘걸거야?」)
  ⑥ 그림마다 「못 한 것 N가지」 — N = 카드 「못한것」 목록 수(0 이어도). 「다 했다」만 쓰고 끝내지 못함
  ⑦ 그림마다 「틀림 장부 N건」 — N = 저장소 reports/atlas11/trust 장부의 모두 건수(제 틀림을 늘 달고 다님)
  ⑧ 일하는 중에 새 말씀이 와도 앞 턴이 안 닫혔으면 무거운 길 그대로 · 도구 수는 앞 턴 처음부터 셈
     (02:20 · 02:21 — 앞 턴이 막힌 채 새 말씀이 와서 카드가 지워지고 도구 0번 가벼운 길로 나간 구멍)
  ⑨ 문지기 시계 — 컨테이너 시계가 이미 서울이라 +9시간 어긋나던 것을 고침(그 전 기록의 때는 9시간 빼서 읽음)

★ v5 쉬운 말 문 (2026-10-13 22:52 「어렵게 이야기 했어 쉽게 이야기해 시스템으오 여구 세팅해」)
  ⑩ 사장님 눈에 그대로 닿는 글을 기계가 읽는다 — 마지막 도구 뒤의 답 글 + 보낸 말(SendUserMessage)
     · 도구를 안 쓴 짧은 답(가벼운 길)도 본다 · 막힌 뒤에는 막힌 때 뒤의 새 글만 본다(대화 기록의 때로 거름)
  ⑪ 걸리는 것: 어려운 말 목록(HARD · 바꿀 쉬운 말과 함께) · 「3해」 같은 말 · 소문자 영어 낱말 ·
     한 문장 35자(띄어쓰기 빼고) 넘음 · 「·」 둘 이상 · 괄호((가) 같은 고르기 표시는 됨) · 「→」 둘 이상 · 숫자 넷 이상
  ⑫ 그림도 본다 — 접은 칸(<details>) 밖 글만 · 어려운 말 목록과 영어만(그림은 줄 · 칸이라 문장 길이는 안 잼)
  ⑬ 안 보는 것: 안전 문장 · 「틀림 장부 N건 · 못 한 것 N가지」 줄 · 「출처:」 아래 · 코드 칸 · 주소
  ⑭ 미리 재 보기: python3 wa-gate.py easy <글 파일>  → 걸리는 것을 줄마다 보여 줌(막지는 않음)
"""
import html as _html
import json, os, re, sys, time

TURN_DIR = os.environ.get("WA_TURN_DIR", "/home/claude/turn")
MARK  = os.path.join(TURN_DIR, ".turnstart")
CARD  = os.path.join(TURN_DIR, "claims.json")
JOURNAL = os.path.join(TURN_DIR, "progress.log")
META  = os.path.join(TURN_DIR, ".meta.json")     # 턴 시작 때의 대화기록 줄 수 · 무거운 길 강제 여부
CLOSED = os.path.join(TURN_DIR, ".closed")       # v4 ⑧ — 나가는 문을 통과한 때(턴이 닫힘)
LEDGER = os.environ.get("WA_LEDGER", "/home/claude/atlas-11/reports/atlas11/trust")   # v4 ⑦ 틀림 장부


def kst():
    """v4 ⑨ — 서울 시각(컨테이너 시계와 상관없이)"""
    return time.strftime("%Y-%m-%d %H:%M:%S", time.gmtime(time.time() + 9 * 3600))


def plain(page):
    t = re.sub(r"<script.*?</script>|<style.*?</style>", " ", page, flags=re.S | re.I)
    t = _html.unescape(re.sub(r"<[^>]+>", " ", t))
    return re.sub(r"\s+", " ", t)


def ledger_count():
    """v4 ⑦ — 장부 폴더의 .json 마다 items 수를 더함 · 폴더가 없으면 None(다른 일) · 못 읽으면 -1"""
    if not os.path.isdir(LEDGER):
        return None
    n = 0
    for fn in sorted(os.listdir(LEDGER)):
        if not fn.endswith(".json"):
            continue
        try:
            with open(os.path.join(LEDGER, fn), encoding="utf-8") as f:
                n += len(json.load(f).get("items") or [])
        except Exception:
            return -1
    return n


def close_turn():
    try:
        with open(CLOSED, "w") as f:
            f.write(str(time.time()))
    except Exception:
        pass

FLATTERY = ["그래도 좋았던", "그러나 좋았던", "어제의 저였으면", "예전의 저였다면",
            "완벽합니다", "완벽하게", "훌륭하게 해냄", "자랑스럽", "대단히 잘"]

GRADES = ["거의 아니다", "아주 낮다", "낮다", "반반", "높다", "아주 높다", "거의 확실하다"]

LAZY = ("함", "했음", "했습니다", "밫음", "ok", "o", "◇", "yes", "네", "다 함", "전부 함", "-", "없음")

# ── v5 쉬운 말 문 ── 사장님(코딩 · 영어 모름 · 주식 어려운 말 모름)께 나가는 글을 기계가 잰다
EASY_LIMIT = {"chars": 35, "dots": 1, "arrows": 1, "numbers": 3}
HARD = [  # (찾는 말, 바꿀 쉬운 말) — 영어는 앞뒤가 영어 글자가 아닐 때만 잡는다
    ("ROE", "자기 돈 100원으로 번 돈"), ("PER", "1년 번 돈의 몇 배 값"), ("PBR", "회사 재산의 몇 배 값"),
    ("EPS", "한 주가 번 돈"), ("부채비율", "빚이 자기 돈의 몇 %"), ("자기자본", "자기 돈"),
    ("시가총액", "회사 몸값"), ("거래대금", "하루에 사고판 돈"), ("결산", "1년 성적표"),
    ("예상치", "미리 짐작한 숫자"), ("컨센서스", "증권사들이 짐작한 숫자"), ("밸류에이션", "값 매기기"),
    ("레버리지", "빚"), ("포트폴리오", "가진 주식 묶음"), ("변동성", "오르내림"), ("모멘텀", "오르는 힘"),
    ("백분위", "몇 번째쯤"), ("중앙값", "가운데 값"), ("표본", "센 것"), ("몬테카를로", "여러 번 흉내 내 보기"),
    ("알고리즘", "계산 순서"), ("파라미터", "정해 둔 숫자"), ("임계", "선"), ("필터", "거르는 조건"),
    ("스크리닝", "거르기"), ("유니버스", "고르는 대상"), ("리밸런싱", "다시 고르기"),
    ("흑자", "돈을 벌어 남김"), ("적자", "돈을 잃음"), ("추정", "짐작"), ("지표", "재는 숫자"),
    ("시안", "처음 만들어 본 것"), ("철저판", "멍거 조건만 쓴 것"), ("기본 문", "기본 조건"),
    ("빚 선", "빚을 어디까지 봐줄지"), ("깔때기", "거르는 그림"), ("회차", "업데이트"), ("탐침", "확인"), ("문턱", "선"),
    ("파이썬", "말하지 않음"), ("노드", "말하지 않음"), ("Python", "말하지 않음"), ("Node", "말하지 않음"),
    ("스크립트", "계산 파일"), ("커밋", "저장"), ("푸시", "올림"), ("배포", "사이트에 올림"), ("브랜치", "갈래"),
    ("JSON", "자료 파일"), ("HTML", "화면 파일"), ("API", "자료 받는 길"),
    ("데이터", "자료"), ("로직", "방법"), ("프로세스", "순서"), ("리스크", "위험"), ("이슈", "문제"), ("피드백", "의견"),
]
EASY_RE = [
    (re.compile(r"\d\s?해(?![가-힣])"), "「n해」 → 「n년」"),
    (re.compile(r"(?<![A-Za-z])[a-z]{3,}(?![A-Za-z])"), "영어 낱말 → 우리말"),
]
SAFE_RE = re.compile(r"저는 투자 상담사가 아닙니다.*?권하지 않습니다\.?", re.S)
LEDGER_LINE_RE = re.compile(r"틀림\s*장부\s*\d+\s*건\s*·\s*못\s*한\s*것\s*\d+\s*가지")
OPT_RE = re.compile(r"\((?:가|나|다|라|마|바)\)")
EASY_HEAD = ("쉬운 말 문 — 사장님께 나간 글에 어려운 데가 있습니다. 앞 글은 이미 나갔습니다. "
             "같은 뜻을 쉬운 말 · 짧은 문장으로 다시 말씀드리고 끝내십시오:\n- ")


def easy_strip(text):
    """⑬ 안 보는 것을 뺀다 — 코드 칸 · 안전 문장 · 장부 줄 · 출처 아래 · 주소"""
    t = re.sub(r"```.*?```", " ", text or "", flags=re.S)
    t = re.sub(r"`[^`]*`", " ", t)
    t = SAFE_RE.sub(" ", t)
    t = LEDGER_LINE_RE.sub(" ", t)
    t = re.split(r"(?m)^\s*(?:출처|Sources?)\s*[:：]", t)[0]
    t = re.sub(r"\]\([^)]*\)", "]", t)
    t = re.sub(r"https?://\S+", " ", t)
    return t


def easy_sentences(t):
    out = []
    for ln in t.splitlines():
        ln = re.sub(r"^\s*(?:[-*>#]+|\d+[.)])\s*", "", ln)
        ln = re.sub(r"[*_]{2,3}", "", ln).strip()
        if not ln:
            continue
        for x in re.split(r"(?<=[.?!])\s+", ln):
            x = x.strip()
            if x:
                out.append(x)
    return out


def easy_check(text, structure=True):
    """⑪ 걸리는 것 목록(빈 목록이면 통과)"""
    bad = []
    t = easy_strip(text)
    for hard, easy in HARD:
        if re.search(r"[A-Za-z]", hard):
            hit = re.search(r"(?<![A-Za-z])%s(?![A-Za-z])" % re.escape(hard), t)
        else:
            hit = hard in t
        if hit:
            bad.append("어려운 말 「%s」 → 「%s」" % (hard, easy))
    for rx, fix in EASY_RE:
        m = rx.search(t)
        if m:
            bad.append("「%s」 — %s" % (m.group(0), fix))
    if structure:
        L = EASY_LIMIT
        for x in easy_sentences(t):
            y = OPT_RE.sub("", x)
            n = len(re.sub(r"\s", "", y))
            why = []
            if n > L["chars"]:
                why.append("%d자(%d자까지)" % (n, L["chars"]))
            if y.count("·") > L["dots"]:
                why.append("「·」 %d번(%d번까지)" % (y.count("·"), L["dots"]))
            if "(" in y or "（" in y:
                why.append("괄호")
            if y.count("→") > L["arrows"]:
                why.append("「→」 %d번" % y.count("→"))
            k = len(re.findall(r"\d[\d,.]*", y))
            if k > L["numbers"]:
                why.append("숫자 %d개(%d개까지)" % (k, L["numbers"]))
            if why:
                bad.append("어려운 문장(%s): 「%s」 → 짧게 나누십시오" % (" · ".join(why), x[:45]))
    return bad


def card_text(page):
    """⑫ 그림에서 볼 글 — 머리 · 접은 칸 밖"""
    return plain(re.sub(r"<head.*?</head>|<details.*?</details>", " ", page or "", flags=re.S | re.I))


def _iso(ts):
    try:
        import calendar
        base = calendar.timegm(time.strptime(ts[:19], "%Y-%m-%dT%H:%M:%S"))
        frac = float("0" + ts[19:].split("Z")[0].split("+")[0]) if ts[19:20] == "." else 0.0
        return base + frac
    except Exception:
        return None


def last_block_time(t0):
    """⑩ 이번 턴에 마지막으로 막힌 때(초) — 없으면 턴 시작"""
    t = t0
    try:
        import calendar
        with open(os.path.join(TURN_DIR, "blocks.jsonl"), encoding="utf-8") as f:
            for ln in f:
                try:
                    b = json.loads(ln)
                except Exception:
                    continue
                bt = b.get("t")
                if bt is None and b.get("때"):
                    try:
                        bt = calendar.timegm(time.strptime(b["때"], "%Y-%m-%d %H:%M:%S")) - 9 * 3600
                    except Exception:
                        bt = None
                if isinstance(bt, (int, float)) and bt > t:
                    t = bt
    except Exception:
        pass
    return t


def reply_texts(tpath, since, line0=-1):
    """⑩ 사장님 눈에 그대로 닿는 글 — 마지막 도구 뒤의 답 글 · 보낸 말(SendUserMessage) · since 뒤 것만"""
    final, sent = [], []
    if not tpath or not os.path.exists(tpath):
        return final, sent
    try:
        with open(tpath, encoding="utf-8", errors="replace") as f:
            for i, ln in enumerate(f):
                try:
                    d = json.loads(ln)
                except Exception:
                    continue
                ts = d.get("timestamp")
                tt = _iso(ts) if isinstance(ts, str) else None
                if tt is not None:
                    if tt <= since:
                        continue
                elif i < max(line0, 0):
                    continue
                typ = d.get("type")
                msg = d.get("message") if isinstance(d.get("message"), dict) else {}
                c = msg.get("content", d.get("content"))
                if typ == "user":
                    final = []
                    continue
                if typ != "assistant" or not isinstance(c, list):
                    continue
                for x in c:
                    if not isinstance(x, dict):
                        continue
                    if x.get("type") == "text":
                        final.append(str(x.get("text") or ""))
                    elif x.get("type") == "tool_use":
                        final = []
                        if x.get("name") == "SendUserMessage":
                            sent.append(str((x.get("input") or {}).get("message") or ""))
    except Exception:
        pass
    return final, sent


def easy_log(data, final, sent, bad):
    """⑩ 문지기가 무엇을 읽었는지 남긴다(읽은 글이 비면 구멍인지 볼 수 있게)"""
    try:
        with open(os.path.join(TURN_DIR, "easy.jsonl"), "a", encoding="utf-8") as f:
            f.write(json.dumps({"때": kst(), "keys": sorted(data.keys()) if isinstance(data, dict) else [],
                                "final": (" ".join(final))[:80], "sent": len(sent), "걸림": len(bad)},
                               ensure_ascii=False) + "\n")
    except Exception:
        pass

RULES = """[문지기가 펼친 대근 헌법 — 신대근 사장님 방]
★ 규칙 0 : 「이 조항이 지금 해당되나?」를 스스로 판단하지 않는다. 애매하면 무조건 적용한다.
★ 규칙 0-2 (가벼운 길) : 이 턴에 도구를 한 번도 안 쓰면 나가는 문이 그냥 통과시킨다.
   도구를 한 번이라도 쓰면 무거운 길 — 아래를 전부 본다. 「제대로」라고 치시면 무조건 무거운 길.

제1조  근거 없는 문장은 못 낸다.
       · 주장마다 근거 링크(http 또는 실제 있는 파일 경로)를 단다. 못 찾았으면 지우고 not_found 로 옮긴다.
       · 「못 구함」(not_found)이 비어 있으면 그것도 실패다. 최소 하나는 적는다.
       · 확실성은 말 일곱 등급으로 : 거의 아니다 / 아주 낮다 / 낮다 / 반반 / 높다 / 아주 높다 / 거의 확실하다

제2조  손대기 전에 「이렇게 이해했습니다」를 앞 지시와 붙여서 먼저 낸다. (25자 이상)

제3조  못 하면 못 했다고 시끄럽게 말한다. 조용히 멈추는 것이 진짜 실패다.
       · 낸 것이 없으면 까닭을 적는다. 냈다고 적은 파일이 실제로 없어도 막힌다.

세칙(무거운 길에서만 본다) : 글 하나에 그림 하나 · 그림 글씨 21px 이상 · 설명은 한 번에 한 가지 ·
  아첨어 금지 · 판단·결론은 의문형으로 · 숫자보다 말 등급 · 오래 걸리면 끝나는 시각을 알림 ·
  일지를 남긴다(세 줄) · 채점표 세 칸.        전문은 기억 [[claude-operating-system]]
v4 덧붙임(2026-10-13 「넌 대충해?」 · 「뭘 걸거야?」) : 그림마다 「못 한 것 N가지」(카드 「못한것」 수) ·
  「틀림 장부 N건」(저장소 reports/atlas11/trust 모두 건수) · 일하는 중 새 말씀이 와도 앞 턴이 안 닫혔으면 무거운 길.
v5 쉬운 말 문(2026-10-13 「어렵게 이야기 했어 쉽게 이야기해 … 시스템으로 영구 세팅해」) : 사장님께 나가는 모든 글
  (도구 안 쓴 짧은 답 · 보낸 말 포함)과 그림(접은 칸 밖)을 기계가 잰다 — 어려운 말 목록 · 영어 낱말 ·
  한 문장 35자(띄어쓰기 빼고) · 「·」 한 번 · 괄호 없음((가) 표시는 됨) · 「→」 한 번 · 숫자 셋까지. 걸리면 다시 쉽게 말하고 끝낸다.
  안 보는 것: 안전 문장 · 틀림 장부 줄 · 「출처:」 아래 · 코드 칸. 미리 재기: python3 /root/.claude/wa-gate.py easy <파일>

★ 턴을 끝내려면 /home/claude/turn/claims.json 을 채워야 한다 (무거운 길). 칸:
  understood(제2조) · answer{이해보고,채점표} · image(세칙) · claims[{text,link,grade}](제1조) ·
  not_found(제1조) · result{made[],empty_reason}(제3조) · steps{누적,7사고,실패만} · 못한것[](v4)
"""

SKELETON = {
    "understood": "",
    "answer": {"이해보고": False, "채점표": False},
    "image": "",
    "claims": [],
    "not_found": [],
    "result": {"made": [], "empty_reason": ""},
    "steps": {"누적": "", "7사고": "", "실패만": ""},
    "못한것": [],
    "_안내": "제2조 — 이 빈 카드는 문지기가 턴 시작 때 만들어 둔 것이다. 알아낸 때마다 여기 바로 적어라.",
}


def read_stdin_json():
    try:
        raw = sys.stdin.read()
    except Exception:
        return {}
    try:
        return json.loads(raw) if raw and raw.strip() else {}
    except Exception:
        return {}


def block(reason):
    # 안전장치 — 같은 문에 여덟 번 연속 걸리면 문이 풀린다. 그 전에 크게 알린다.
    try:
        n = 0
        p = os.path.join(TURN_DIR, "blocks.jsonl")
        if os.path.exists(p) and os.path.exists(MARK):
            t0 = os.path.getmtime(MARK)
            with open(p, encoding="utf-8") as f:
                for ln in f:
                    if ln.strip():
                        n += 1
            if os.path.getmtime(p) < t0:
                n = 0
        if n >= 5:
            reason = ("★★ 이번에 벌써 %d번 걸렸습니다. 여덟 번 연속이면 안전장치가 문을 풀어 줍니다. "
                      "그러면 이 답은 규칙 없이 나갑니다. 지금 고치십시오. ★★\n" % n) + reason
    except Exception:
        pass
    # 재는 자 ① — 막힌 것을 남긴다.
    try:
        os.makedirs(TURN_DIR, exist_ok=True)
        with open(os.path.join(TURN_DIR, "blocks.jsonl"), "a", encoding="utf-8") as f:
            f.write(json.dumps({
                "때": kst(),
                "t": time.time(),
                "까닭": reason,
                "조": sorted(set(a for a in ("제1조", "제2조", "제3조") if a in reason)),
            }, ensure_ascii=False) + "\n")
    except Exception:
        pass
    print(json.dumps({"ok": False, "reason": reason}, ensure_ascii=False))
    sys.exit(0)


def lazy(v):
    v = str(v or "").strip()
    return (not v) or v.lower() in LAZY


def count_lines(path):
    try:
        n = 0
        with open(path, "rb") as f:
            for _ in f:
                n += 1
        return n
    except Exception:
        return -1


def tools_used_since(path, start_line):
    """② 무게 문턱 — 기계가 센다. 이번 턴에 도구를 몇 번 썼는가.
    셀 수 없으면 -1 을 돌려주고, 부르는 쪽은 안전하게 '무거운 길'로 본다."""
    if not path or not os.path.exists(path) or start_line < 0:
        return -1
    n = 0
    try:
        with open(path, encoding="utf-8", errors="replace") as f:
            for i, ln in enumerate(f):
                if i < start_line:
                    continue
                if '"tool_use"' in ln or '"tool_result"' in ln:
                    n += 1
    except Exception:
        return -1
    return n


def mode_in():
    """제2조를 기계가 대신 이행한다 — 빈 카드를 턴 시작에 먼저 만들어 둔다."""
    data = read_stdin_json()
    os.makedirs(TURN_DIR, exist_ok=True)
    # v4 ⑧ — 앞 턴이 안 닫혔나(막힌 채 · 일하는 중에 새 말씀)
    prev = {}
    try:
        with open(META, encoding="utf-8") as f:
            prev = json.load(f)
    except Exception:
        prev = {}
    open_turn = os.path.exists(MARK) and (not os.path.exists(CLOSED) or os.path.getmtime(CLOSED) < os.path.getmtime(MARK))
    try:
        with open(CARD, "w", encoding="utf-8") as f:
            json.dump(SKELETON, f, ensure_ascii=False, indent=1)
    except Exception:
        pass
    try:
        os.remove(JOURNAL)          # 지난 턴 일지는 지운다
    except Exception:
        pass

    prompt = str(data.get("prompt") or "")
    tpath = data.get("transcript_path") or ""
    line0 = count_lines(tpath) if tpath else -1
    carried = False
    p0 = prev.get("line0")
    if open_turn and prev.get("transcript") == tpath and isinstance(p0, int) and 0 <= p0 <= max(line0, 0):
        line0, carried = p0, True
    meta = {
        "transcript": tpath,
        "line0": line0,
        "force_heavy": ("제대로" in prompt) or open_turn,
        "carried": carried,
    }
    try:
        with open(META, "w", encoding="utf-8") as f:
            json.dump(meta, f, ensure_ascii=False)
    except Exception:
        pass

    time.sleep(0.05)
    with open(MARK, "w") as f:
        f.write(str(time.time()))
    print(json.dumps({
        "hookSpecificOutput": {
            "hookEventName": "UserPromptSubmit",
            "additionalContext": RULES,
        }
    }, ensure_ascii=False))
    sys.exit(0)


def mode_out():
    data = read_stdin_json()
    if not os.path.exists(MARK):
        sys.exit(0)
    t0 = os.path.getmtime(MARK)

    # ── ② 무게 문턱 ── 도구를 한 번도 안 썼으면 그냥 통과 (가벼운 길)
    meta = {}
    try:
        with open(META, encoding="utf-8") as f:
            meta = json.load(f)
    except Exception:
        meta = {}
    tpath = data.get("transcript_path") or meta.get("transcript") or ""
    used = tools_used_since(tpath, meta.get("line0", -1))
    light = (used == 0) and not meta.get("force_heavy")

    # ── v5 쉬운 말 문 ── 가벼운 길 · 무거운 길 모두 — 사장님 눈에 그대로 닿는 글
    final, sent = reply_texts(tpath, last_block_time(t0), meta.get("line0", -1))
    lam = data.get("last_assistant_message") if isinstance(data, dict) else None
    if isinstance(lam, str) and lam.strip():
        final = [lam]
    easy_bad = easy_check("\n".join(final + sent))
    easy_log(data, final, sent, easy_bad)
    if light and easy_bad:
        block(EASY_HEAD + "\n- ".join(easy_bad[:12]))
    if light:
        try:
            with open(os.path.join(TURN_DIR, "light.jsonl"), "a", encoding="utf-8") as f:
                f.write(json.dumps({
                    "때": kst(),
                    "가벼운 길": "도구 0번 — 나가는 문 그냥 통과",
                }, ensure_ascii=False) + "\n")
        except Exception:
            pass
        close_turn()
        sys.exit(0)

    # ── 여기서부터 무거운 길 ──  (카드가 없어 일찍 막혀도 쉬운 말 문 걸림을 같이 알린다)
    tail = ("\n- " + EASY_HEAD + "\n- ".join(easy_bad[:12])) if easy_bad else ""
    if not os.path.exists(CARD):
        block("주장 카드가 없습니다. /home/claude/turn/claims.json 을 채우고 다시 끝내십시오." + tail)

    if os.path.getmtime(CARD) <= t0:
        block("빈 카드 그대로입니다 — 아무것도 안 적으셨습니다. "
              "/home/claude/turn/claims.json 의 understood · claims · not_found · result · steps 를 채우십시오." + tail)

    try:
        with open(CARD, encoding="utf-8") as f:
            d = json.load(f)
    except Exception as e:
        block("주장 카드를 읽을 수 없습니다(형식 오류): %s" % e + tail)

    bad = []
    if easy_bad:
        bad.append(EASY_HEAD + "\n- ".join(easy_bad[:12]))

    # ── 제2조 · 이해 보고 ──
    und = str(d.get("understood") or "").strip()
    if lazy(und) or len(und) < 25:
        bad.append("제2조 — 「이렇게 이해했습니다」가 없습니다. understood 칸에 "
                   "앞 지시와 이번 말씀을 붙여 무엇으로 알아들었는지 한 줄로 적으십시오(25자 이상).")

    ans = d.get("answer")
    if not isinstance(ans, dict):
        bad.append("제2조 — answer 칸이 없습니다. 화면에 나가는 답에 이해 보고와 채점표를 "
                   "실제로 넣었는지 {\"이해보고\":true,\"채점표\":true} 로 적으십시오.")
    else:
        if ans.get("이해보고") is not True:
            bad.append("제2조 — 화면 답변에 「이렇게 이해했습니다」를 넣지 않았습니다. "
                       "카드에 적는 것과 사장님께 보이는 것은 다릅니다.")
        if ans.get("채점표") is not True:
            bad.append("세칙 — 화면 답변 끝에 채점표를 붙이지 않았습니다. 어긴 것이 사장님 눈에 보여야 합니다.")

    # ── 세칙 · 글 하나 그림 하나 (④ 무거운 길에서만) ──
    img = (d.get("image") or "").strip()
    if not img:
        bad.append("세칙 — 그림이 없습니다. 어떤 말이든 글 하나 · 그림 하나로 냅니다. "
                   "image 칸에 이번에 만든 그림 파일 경로를 적으십시오.")
    elif not os.path.exists(img):
        bad.append("세칙 — 적어 낸 그림 파일이 실제로 없습니다: %s" % img)
    elif os.path.getmtime(img) <= t0:
        bad.append("세칙 — 그림이 이번 턴에 만든 것이 아닙니다: %s. 지난 것을 다시 내지 마십시오." % img)

    # ── 세칙 · 일지 (③ 세 줄만, 30초 문턱 없음) ──
    lines = []
    if os.path.exists(JOURNAL):
        try:
            with open(JOURNAL, encoding="utf-8") as f:
                for ln in f:
                    if ln.strip():
                        lines.append(ln.strip())
        except Exception:
            pass
    if len(lines) < 3:
        bad.append("세칙 — 일지가 없거나 너무 짧습니다(%d줄). 일하면서 알아낸 것을 그때그때 "
                   "`echo \"$(date +%%s) 무엇을 알았다\" >> /home/claude/turn/progress.log` 로 **세 줄 이상** 적으십시오." % len(lines))

    # ── 세칙 · 그림 알맹이 · 아첨 · 의문형 ──
    page = ""
    if img and os.path.exists(img):
        try:
            page = open(img, encoding="utf-8").read()
        except Exception:
            page = ""
    if page:
        if len(page) < 2000:
            bad.append("세칙 — 그림이 너무 얄팍합니다(%d자). 알맹이를 채우십시오." % len(page))
        hit = [w for w in FLATTERY if w in page]
        if hit:
            bad.append("세칙 — 실패에 좋은 말을 붙였습니다: 「%s」. 빼고 다시 끝내십시오. 실패는 실패만 보고합니다."
                       % ", ".join(hit))
        if page.count("?") < 1 and "니까" not in page:
            bad.append("세칙 — 판단·결론을 하나도 의문형으로 쓰지 않았습니다. 단정형만 늘어놓지 마십시오.")
        cb = easy_check(card_text(page), structure=False)
        if cb:
            bad.append("쉬운 말 문(그림 · 접은 칸 밖) — 그림을 쉬운 말로 고치십시오:\n- " + "\n- ".join(cb[:12]))

    # ── v4 ⑥ ⑦ · 못 한 것 · 틀림 장부 ──
    nd = d.get("못한것")
    if not isinstance(nd, list):
        bad.append("제3조 — 「못한것」 칸이 없습니다. 이번 말씀 가운데 못 한 것을 목록으로 적으십시오(없으면 []).")
        nd = None
    txt = plain(page) if page else ""
    if page and nd is not None:
        n_nd = len([x for x in nd if str(x).strip()])
        got = [int(m) for m in re.findall(r"못\s*한\s*것\s*(\d+)\s*가지", txt)]
        if n_nd not in got:
            bad.append("제3조 — 그림에 「못 한 것 %d가지」 줄이 없습니다(카드 「못한것」 %d개). "
                       "「다 했다」만 쓰지 말고 못 한 것을 숫자로 함께 보이십시오(0이어도)." % (n_nd, n_nd))
    led = ledger_count()
    if led == -1:
        bad.append("세칙 — 틀림 장부(%s)를 읽을 수 없습니다. 장부를 고치지 말고 새 파일로만 더하십시오." % LEDGER)
    elif led is not None and page:
        got = [int(m) for m in re.findall(r"틀림\s*장부\s*(\d+)\s*건", txt)]
        if led not in got:
            bad.append("세칙 — 그림에 「틀림 장부 %d건」 줄이 없습니다. 제 틀림 숫자는 그림마다 달고 다닙니다(%s)." % (led, LEDGER))

    # ── 제1조 · 근거와 일곱 등급 ──
    claims = d.get("claims")
    if not isinstance(claims, list) or len(claims) == 0:
        bad.append("제1조 — 주장이 하나도 없습니다. 이번 답에서 무엇을 주장했는지 적으십시오.")
    else:
        for i, c in enumerate(claims, 1):
            if not isinstance(c, dict):
                bad.append("%d번 주장의 모양이 틀렸습니다." % i); continue
            if not (c.get("text") or "").strip():
                bad.append("%d번 주장에 내용이 없습니다." % i)
            link = (c.get("link") or "").strip()
            ok_link = link.startswith("http") or (link.startswith("/") and os.path.exists(link))
            if not ok_link:
                bad.append("제1조 — %d번 주장에 근거가 없습니다 → 「%s」. 바깥 자료면 http 주소를, "
                           "이 방에서 본 것이면 실제 있는 파일 경로를 다십시오. 둘 다 못 대면 not_found 로 옮기십시오."
                           % (i, (c.get("text") or "")[:40]))
            g = (c.get("grade") or "").strip()
            if g not in GRADES:
                bad.append("제1조 — %d번 주장에 확실성 등급이 없습니다. 일곱 중 하나로: %s" % (i, " / ".join(GRADES)))

    nf = d.get("not_found")
    if not isinstance(nf, list) or len([x for x in (nf or []) if str(x).strip()]) == 0:
        bad.append("제1조 — 「못 구함」이 비어 있습니다. 다 찾았다는 말은 못 믿습니다 — 최소 하나 적으십시오.")

    # ── 제3조 · 못 하면 시끄럽게 ──
    res = d.get("result")
    if not isinstance(res, dict):
        bad.append("제3조 — result 칸이 없습니다. "
                   "{\"made\":[\"이번에 실제로 낸 파일이나 주소\"],\"empty_reason\":\"\"} 형태로 적으십시오.")
    else:
        made = [str(x).strip() for x in (res.get("made") or []) if str(x).strip()]
        why = str(res.get("empty_reason") or "").strip()
        gone = [m for m in made if m.startswith("/") and not os.path.exists(m)]
        if gone:
            bad.append("제3조 — 냈다고 적은 것이 실제로 없습니다: %s. 지어내지 말고 못 냈다고 적으십시오." % ", ".join(gone))
        if not made:
            if lazy(why) or len(why) < 20:
                bad.append("제3조 — 이번 턴에 낸 것이 하나도 없는데 까닭이 비었습니다. "
                           "empty_reason 에 무엇을 못 했고 왜 못 했는지 적으십시오(20자 이상). "
                           "조용히 끝내는 것이 진짜 실패입니다.")

    # ── 세칙 · 채점표 세 칸 ──
    steps = d.get("steps")
    NEED = {
        "누적": "앞 지시가 무엇이었고 이번 말씀과 어떻게 붙였는지 한 줄로",
        "7사고": "일곱 중 ④내가 지어낸 것 / ⑤듣기 좋은 말인가 의 답을 한 줄로",
        "실패만": "이번 답에 실패가 있었나, 좋은 말을 붙이지 않았나 한 줄로",
    }
    if not isinstance(steps, dict):
        bad.append("채점표 세 칸의 증거가 없습니다. steps 에 누적 · 7사고 · 실패만 을 각각 한 줄로 적으십시오.")
    else:
        for k, why in NEED.items():
            v = str(steps.get(k) or "").strip()
            if lazy(v) or len(v) < 15:
                bad.append("steps 의 「%s」가 비었거나 「했음」 식입니다 — %s." % (k, why))

    if bad:
        block("문지기가 막았습니다. 고치고 다시 끝내십시오.\n- " + "\n- ".join(bad))

    try:
        d["_통과시각"] = kst()
        d["_도구수"] = used
        with open(os.path.join(TURN_DIR, "log.jsonl"), "a", encoding="utf-8") as f:
            f.write(json.dumps(d, ensure_ascii=False) + "\n")
    except Exception:
        pass
    close_turn()
    sys.exit(0)


def mode_easy(path):
    """⑭ 미리 재 보기 — 글 파일(또는 .html 그림)을 재서 걸리는 것을 보여 줌 · 막지 않음"""
    try:
        txt = open(path, encoding="utf-8").read()
    except Exception as e:
        print("못 읽음: %s" % e)
        sys.exit(1)
    if path.endswith(".html"):
        bad = easy_check(card_text(txt), structure=False)
    else:
        bad = easy_check(txt)
    print("쉬운 말 문 — 걸림 %d" % len(bad))
    for x in bad:
        print("- " + x)
    sys.exit(0)


if __name__ == "__main__":
    m = sys.argv[1] if len(sys.argv) > 1 else "out"
    if m == "in":
        mode_in()
    elif m == "easy":
        mode_easy(sys.argv[2] if len(sys.argv) > 2 else "")
    else:
        mode_out()
