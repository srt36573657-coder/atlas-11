#!/usr/bin/env python3
"""
시연 영상용 — 찍은 그림(JPEG)마다 아래 왼쪽 끝 여덟 칸에 새겨 둔 번호를 읽는다(일꾼 D1 · 무대 stage.mjs 의 #seq)
  입력: 그림 파일 경로 목록이 든 JSON 파일(배열) · 출력(표준 출력): 같은 차례의 [번호, 폰 화면 평균 밝기] 배열 JSON(번호 0 ~ 255 · 못 읽으면 -1)
  칸 하나 = 폭 6 · 높이 6 화소(영상 2배 기준) · 맨 아래 줄에서 왼쪽부터 · 꺼짐 #101828 · 켜짐 #2a3f66 사이 가운데 밝기로 가름
쓰는 법: python3 -I seq_scan.py <목록.json> [--scale 2]
"""
import json, sys
from PIL import Image, ImageStat

def main():
    lst = json.load(open(sys.argv[1]))
    u = int(sys.argv[sys.argv.index('--scale') + 1]) if '--scale' in sys.argv else 2
    cw = 3 * u
    out = []
    for fp in lst:
        try:
            im = Image.open(fp).convert('L')
            w, h = im.size
            y0 = h - cw  # 맨 아래 줄 칸
            px = im.load()
            val, ok = 0, True
            for k in range(8):
                cx, cy = k * cw + cw // 2, y0 + cw // 2
                if cx >= w or cy >= h:
                    ok = False; break
                s = [px[x, y] for x in range(cx - 1, cx + 2) for y in range(cy - 1, cy + 2)]
                m = sum(s) / len(s)
                if m > 42:  # 꺼짐 약 23 · 켜짐 약 61
                    val |= 1 << k
            # 폰 화면 칸(위 띠와 아래 띠 사이)의 평균 밝기 — 쪽을 옮기는 사이 잠깐 새까매지는 그림을 가려내려고
            lum = ImageStat.Stat(im.crop((0, 44 * u, w, 744 * u)).resize((78, 140))).mean[0]
            out.append([val if ok else -1, round(lum, 1)])
        except Exception:
            out.append([-1, 255.0])
    json.dump(out, sys.stdout)

main()
