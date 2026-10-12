# 문지기 v4 시험 — 따로 만든 방(turn · 장부 · 대화 기록)에서 다섯 길을 돌려 봄
import json, os, subprocess, sys, time, shutil
G = sys.argv[1]; base = os.path.join(os.path.dirname(G), 'sandbox'); shutil.rmtree(base, ignore_errors=True)
turn = os.path.join(base, 'turn'); led = os.path.join(base, 'ledger'); os.makedirs(turn); os.makedirs(led)
tr = os.path.join(base, 'tr.jsonl'); open(tr, 'w').write('{"x":1}\n')
env = dict(os.environ, WA_TURN_DIR=turn, WA_LEDGER=led)
def run(mode, payload):
    p = subprocess.run(['python3', G, mode], input=json.dumps(payload), capture_output=True, text=True, env=env)
    assert p.returncode == 0, p.stderr
    return p.stdout.strip()
def tool(n=1):
    with open(tr, 'a') as f:
        for _ in range(n): f.write('{"type":"assistant","content":[{"type":"tool_use"}]}\n')
def card(img, nd, extra=None):
    d = {"understood": "이렇게 이해했습니다 — 시험 카드입니다 스물다섯 자를 넘게 적습니다", "answer": {"이해보고": True, "채점표": True},
         "image": img, "claims": [{"text": "시험", "link": tr, "grade": "높다"}], "not_found": ["시험"], "result": {"made": [img], "empty_reason": ""},
         "steps": {"누적": "앞 지시와 이번 말씀을 붙임 시험 한 줄", "7사고": "지어낸 것 없음 듣기 좋은 말 없음 시험", "실패만": "실패 없음 좋은 말 안 붙임 시험 한 줄"}, "못한것": nd}
    if extra: d.update(extra)
    time.sleep(0.05); json.dump(d, open(os.path.join(turn, 'claims.json'), 'w'), ensure_ascii=False)
    with open(os.path.join(turn, 'progress.log'), 'w') as f: f.write('1 a\n2 b\n3 c\n')
def page(body):
    p = os.path.join(base, 'card%d.html' % int(time.time() * 1000)); time.sleep(0.02)
    open(p, 'w').write('<html><body>' + body + '<p>' + 'ㄱ' * 2100 + '</p><p>이걸로 될까요?</p></body></html>'); return p
json.dump({"items": [{"what": "a"}, {"what": "b"}]}, open(os.path.join(led, 'm1.json'), 'w'))
res = []
P = {"transcript_path": tr, "prompt": "해 봐"}
# ① 장부 · 못 한 것 줄 없는 그림 → 막힘(둘 다)
run('in', P); tool(2); card(page('<h1>다 했습니다</h1>'), [])
o = run('out', P); res.append(('① 줄 없음 → 막힘', '"ok": false' in o and '못 한 것 0가지' in o and '틀림 장부 2건' in o))
# ② 못 한 것 수가 카드와 다름 → 막힘
card(page('<p>못 한 것 <b>0</b>가지 · 틀림 장부 2건</p>'), ['코스닥 흉내'])
o = run('out', P); res.append(('② 수 다름 → 막힘', '"ok": false' in o and '못 한 것 1가지' in o and '틀림 장부' not in o.split('못 한 것 1가지')[1][:5]))
# ③ 맞는 그림 → 통과 · 닫힘 기록
card(page('<p>못 한 것 1가지 · 틀림 장부 <b>2</b>건</p>'), ['코스닥 흉내'])
o = run('out', P); res.append(('③ 맞음 → 통과 · 닫힘', o == '' and os.path.exists(os.path.join(turn, '.closed'))))
# ④ 닫힌 뒤 새 말씀 · 도구 0번 → 가벼운 길
run('in', P); m = json.load(open(os.path.join(turn, '.meta.json')))
o = run('out', P); res.append(('④ 닫힌 뒤 도구 0 → 가벼운 길', o == '' and m['force_heavy'] is False and m['carried'] is False))
# ⑤ 일하는 중 새 말씀(앞 턴 안 닫힘) → 무거운 길 · 앞 턴 처음부터 셈
run('in', P); l0 = json.load(open(os.path.join(turn, '.meta.json')))['line0']; tool(3)
run('in', P); m = json.load(open(os.path.join(turn, '.meta.json')))
o = run('out', P); res.append(('⑤ 안 닫힌 채 새 말씀 → 무거운 길', m['force_heavy'] is True and m['carried'] is True and m['line0'] == l0 and '"ok": false' in o))
# ⑥ 장부를 못 읽음 → 막힘
open(os.path.join(led, 'bad.json'), 'w').write('{깨짐')
card(page('<p>못 한 것 0가지 · 틀림 장부 2건</p>'), [])
o = run('out', P); res.append(('⑥ 장부 깨짐 → 막힘', '"ok": false' in o and '장부' in o)); os.remove(os.path.join(led, 'bad.json'))
# ⑦ 장부 폴더가 없는 다른 일 → 장부 줄 안 봄(못 한 것 줄은 봄)
env['WA_LEDGER'] = os.path.join(base, 'none')
card(page('<p>못 한 것 0가지</p>'), [])
o = run('out', P); res.append(('⑦ 장부 없는 일 → 통과', o == ''))
# ⑧ 시계 — 서울 시각
o = subprocess.run(['python3', '-c', 'import importlib.util,sys;s=importlib.util.spec_from_file_location("g",sys.argv[1]);g=importlib.util.module_from_spec(s);s.loader.exec_module(g);print(g.kst())', G], capture_output=True, text=True, env=env).stdout.strip()
res.append(('⑧ 시계 = 서울(' + o[11:16] + ')', o[11:16] == time.strftime('%H:%M', time.gmtime(time.time() + 9 * 3600))))
for k, ok in res: print('통과' if ok else '실패', k)
print('실패', sum(1 for _, ok in res if not ok), '/', len(res))
