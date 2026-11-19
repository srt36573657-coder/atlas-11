# 샘플용 한 폭: 붉은 등불 → 금빛 · 늘 오르던 정산 선 → 평평한 물결(반대 참모 g27 · 색 참모 g29 지적)
import sys, os, re
p = sys.argv[1]; t = open(p, encoding='utf-8').read()
t = t.replace('#CF5446', '#C08A3E').replace('#B9473B', '#9A6F22')
t = re.sub(r'<path filter="url\(#wet\)" fill="#9FCFD0" opacity="0.35" d="M40,924[^"]*"/>', '<path filter="url(#wet)" fill="#9FCFD0" opacity="0.35" d="M40,926 C70,918 100,930 130,920 C160,930 190,918 220,928 C250,918 280,930 310,920 L330,924 L330,932 L40,932 Z"/>', t)
t = re.sub(r'(<path filter="url\(#wc\)" fill="none" stroke="#2F4048" stroke-width="2.6"[^>]*d=")M40,924[^"]*(")', r'\1M40,924 C60,918 80,930 100,924 C120,918 140,930 160,924 C180,918 200,930 220,924 C240,918 260,930 280,924 C300,918 315,928 330,924\2', t)
t = t.replace('<circle cx="330" cy="880" r="3.4" fill="#2F4048"/>', '<circle cx="330" cy="924" r="3.4" fill="#2F4048"/>')
os.remove(p); open(p, 'w', encoding='utf-8').write(t)
print('scroll fixed', '#CF5446' in t, 'M40,924 C60,918' in t)
