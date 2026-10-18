#!/usr/bin/env python3
"""
시연 영상 맞춰 보기 — 완성된 demo.mp4 에서 직접 재어 본다(일꾼 D1 · 사장님 2026-10-18 order-0015 [11] 5 「말과 글상자를 같게」)
  ① 글상자 글이 바뀐 때(영상 그림에서 처음 달라진 때)와 읽는 소리가 처음 들린 때(영상 속 소리) 사이 차이 — 글이 뜰 때 소리가 시작하는지
  ② 누르는 곳 표시와 함께 바뀌는 「누름 N」 숫자가 바뀐 때 — 만들 때 적어 둔 때와 같은지 · 호박색 테가 실제로 보였는지
  ③ 영상 길이 · 코덱 · 60초 안인지
쓰는 법: python3 -I check_sync.py <폴더(events.json · demo.mp4 가 있는 곳)> [--json 결과파일] [--append-notes]
결과: 표 + 한 줄 — 글↔소리 차이가 −0.05 ~ 0.25초 밖이거나 표시 어긋남이 −0.1 ~ 0.15초 밖이면 종료 코드 1
"""
import json, subprocess, sys, struct, wave, os
import numpy as np

FPS = 30.0
W, H = 390, 844  # 영상을 반으로 줄여 읽음(= 폰 390 폭 기준 좌표)

def sh(cmd):
    return subprocess.run(cmd, capture_output=True, check=True)

def main():
    d = sys.argv[1]
    out_json = sys.argv[sys.argv.index('--json') + 1] if '--json' in sys.argv else None
    ej = json.load(open(os.path.join(d, 'events.json')))
    rep, events = ej['rep'], ej['events']
    tl = rep['timeline']
    mp4 = os.path.join(d, 'demo.mp4')
    taps = [e for e in events if e['name'] == 'tap']

    pr = json.loads(sh(['ffprobe', '-v', 'error', '-show_entries', 'stream=codec_name,codec_type,width,height,duration', '-show_entries', 'format=duration', '-of', 'json', mp4]).stdout)
    v = next(s for s in pr['streams'] if s['codec_type'] == 'video')
    a = next(s for s in pr['streams'] if s['codec_type'] == 'audio')
    dur = float(pr['format']['duration'])

    # 영상 그림 읽기(30 fps · 390×844 · 색) — 글상자 칸은 그림마다 앞 그림과 견줌 · 누르는 곳 둘레는 그 누름 앞뒤만 모아 둠
    p = subprocess.Popen(['ffmpeg', '-v', 'error', '-i', mp4, '-vf', f'fps=30,scale={W}:{H}:flags=area', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-'], stdout=subprocess.PIPE)
    size = W * H * 3
    prev = None
    cap_diff, chip_diff = [], []
    ring = {t['n']: {} for t in tl['taps']}  # 누르는 곳 둘레의 「호박색 테」 화소 수(그 누름 앞뒤만)
    pos = {e['n']: (int(e['x']), int(e['y'])) for e in taps}
    at_of = {t['n']: t['at'] for t in tl['taps']}
    k = 0
    while True:
        buf = p.stdout.read(size)
        if len(buf) < size:
            break
        f = np.frombuffer(buf, dtype=np.uint8).reshape(H, W, 3).astype(np.int16)
        cap_diff.append(0.0 if prev is None else float(np.abs(f[744:844, 0:262] - prev[744:844, 0:262]).mean()))
        chip_diff.append(0.0 if prev is None else float(np.abs(f[754:834, 270:390] - prev[754:834, 270:390]).mean()))
        for n, (x, y) in pos.items():
            if int((at_of[n] - 0.4) * FPS) <= k <= int((at_of[n] + 1.0) * FPS):
                roi = f[max(0, y - 36):y + 36, max(0, x - 36):x + 36]
                ring[n][k] = int(((roi[..., 0] > 215) & (roi[..., 1] > 150) & (roi[..., 1] < 205) & (roi[..., 2] < 90)).sum())
        prev = f
        k += 1
    p.wait()
    nframes = k

    def first_idx(series, lo, hi, thr):
        for i in range(max(0, int(lo * FPS)), min(len(series), int(hi * FPS) + 1)):
            if series[i] > thr:
                return i / FPS
        return None

    # 영상 속 소리 풀기 → 10ms 마다 크기
    wav = os.path.join(d, '_check_audio.wav')
    sh(['ffmpeg', '-v', 'error', '-y', '-i', mp4, '-vn', '-ac', '1', '-ar', '22050', wav])
    w = wave.open(wav); n = w.getnframes(); sr = w.getframerate()
    x = np.array(struct.unpack('<%dh' % n, w.readframes(n)), dtype=np.float32) / 32768.0
    w.close(); os.remove(wav)
    hop = int(0.01 * sr)
    rms = np.array([np.sqrt((x[i:i + hop] ** 2).mean()) for i in range(0, len(x) - hop, hop)])

    def voice_onset(lo, hi):
        for i in range(max(0, int(lo * 100)), min(len(rms), int(hi * 100))):
            if rms[i] > 0.02:
                return i / 100
        return None

    rows = []
    says = tl['says']
    for i, s in enumerate(says):
        lo = max(s['at'] - 0.5, (says[i - 1]['voiceEnd'] + 0.02) if i else 0)
        vo = voice_onset(lo, s['at'] + 1.2)
        cv = None if s['id'] == 'n0' else first_idx(cap_diff, s['at'] - 0.5, s['at'] + 1.0, 1.2)  # 맨 처음 글은 영상 시작과 같이 뜸
        rows.append({'what': f"글 {s['id']}", 'at': s['at'], 'video': cv, 'voice': vo, 'voice_expect': s['voiceStart'],
                     'voice_vs_expect': None if vo is None else round(vo - s['voiceStart'], 2),
                     'voice_minus_video': None if (vo is None or cv is None) else round(vo - cv, 2),
                     'video_vs_at': None if cv is None else round(cv - s['at'], 2)})
    for t in tl['taps']:
        # 누름 수 칸이 바뀐 때(숫자가 한 번에 바뀌어 또렷함) — 표시 · 숫자는 같은 그림에서 함께 시작함
        got = first_idx(chip_diff, t['at'] - 0.12, t['at'] + 0.5, 1.5)  # 바로 앞 글상자 글(이름표가 같이 바뀜)과 섞이지 않게 좁게
        cnt = ring[t['n']]
        base = min([cnt[kk] for kk in cnt if kk / FPS <= t['at'] - 0.05] or [0])
        peak = max([cnt[kk] for kk in cnt if t['at'] - 0.05 <= kk / FPS <= t['at'] + 0.7] or [0])
        seen = peak - base > 150  # 호박색 테가 실제로 보였는지
        rows.append({'what': f"누름 {t['n']} 표시", 'at': t['at'], 'video': got, 'video_vs_at': None if got is None else round(got - t['at'], 2), 'ring_seen': bool(seen)})

    cross = [r['voice_minus_video'] for r in rows if r.get('voice_minus_video') is not None]
    vexp = [abs(r['voice_vs_expect']) for r in rows if r.get('voice_vs_expect') is not None]
    ring_off = [r['video_vs_at'] for r in rows if r['what'].startswith('누름') and r['video_vs_at'] is not None]
    unseen = [r['what'] for r in rows if r['what'].startswith('누름') and not r.get('ring_seen')]
    miss = [r['what'] for r in rows if (r['what'].startswith('누름') and r['video'] is None) or (r['what'].startswith('글') and r['voice'] is None)
            or (r['what'].startswith('글 n') and r['what'] != '글 n0' and r['video'] is None)]
    ok = (not miss and not unseen and dur <= 60.0 and all(-0.05 <= c <= 0.25 for c in cross) and all(e <= 0.12 for e in vexp) and all(-0.1 <= r <= 0.12 for r in ring_off))
    res = {'frames': nframes, 'duration': round(dur, 2), 'video': {kk: v.get(kk) for kk in ('codec_name', 'width', 'height')}, 'audio': {'codec_name': a.get('codec_name')},
           'under60': dur <= 60.0, 'voice_minus_video': {'min': min(cross) if cross else None, 'max': max(cross) if cross else None},
           'voice_vs_expect_worst': max(vexp) if vexp else None, 'ring_vs_at': {'min': min(ring_off) if ring_off else None, 'max': max(ring_off) if ring_off else None},
           'missing': miss, 'ring_unseen': unseen, 'ok': ok, 'rows': rows}
    print(f"영상 {res['video']} · 소리 {res['audio']} · 길이 {res['duration']}초 · 60초 안 {res['under60']} · 그림 {nframes}장")
    for r in rows:
        if r['what'].startswith('글'):
            print(f"{r['what']:<10} 글 {str(r['video']):>6} (기대 {r['at']:>6}) · 소리 {str(r['voice']):>6} (기대 {r['voice_expect']:>6}) · 소리−글 {str(r.get('voice_minus_video')):>6}")
        else:
            print(f"{r['what']:<10} 숫자 {str(r['video']):>6} (기대 {r['at']:>6}) · 어긋남 {str(r['video_vs_at']):>6} · 테 보임 {r['ring_seen']}")
    print(f"소리−글 차이 {res['voice_minus_video']} · 소리 기대와 가장 큰 차이 {res['voice_vs_expect_worst']} · 누름 숫자 어긋남 {res['ring_vs_at']} · 테 안 보인 누름 {unseen} · 못 찾은 것 {miss} · 통과 {ok}")
    if out_json:
        json.dump(res, open(out_json, 'w'), ensure_ascii=False, indent=1)
    if '--append-notes' in sys.argv:  # 메모 끝에 영상에서 직접 잰 결과를 덧붙임(이미 있으면 새로 씀)
        np_ = os.path.join(d, 'notes.md')
        body = open(np_).read() if os.path.exists(np_) else ''
        body = body.split('\n## 영상에서 직접 맞춰 본 결과')[0].rstrip('\n') + '\n'
        body += (f"\n## 영상에서 직접 맞춰 본 결과(check_sync.py · 완성된 mp4 를 풀어서 잰 것)\n"
                 f"- 글상자 글이 뜬 때 → 읽는 소리가 들리기 시작한 때: 소리가 {res['voice_minus_video']['min']} ~ {res['voice_minus_video']['max']}초 뒤(−0.05 ~ 0.25초 안이면 통과 · 글 {len(cross)}곳)\n"
                 f"- 읽는 소리가 만들 때 적어 둔 때와 다른 정도: 가장 큰 차이 {res['voice_vs_expect_worst']}초\n"
                 f"- 누를 때 「누름 N」 숫자가 바뀐 때(누르는 곳 표시와 같은 그림) − 적어 둔 때: {res['ring_vs_at']['min']} ~ {res['ring_vs_at']['max']}초(누름 {len(ring_off)}번 모두 찾음) · 호박색 테가 보인 누름 {sum(1 for r in rows if r.get('ring_seen'))}번\n"
                 f"- 영상 {res['duration']}초(60초 안 {res['under60']}) · {res['video']['codec_name']} {res['video']['width']}×{res['video']['height']} + {res['audio']['codec_name']} · 30 fps · 그림 {nframes}장\n"
                 f"- 통과: {ok}" + (f" · 못 찾은 것 {miss}" if miss else "") + "\n")
        open(np_, 'w').write(body)
    sys.exit(0 if ok else 1)

main()
