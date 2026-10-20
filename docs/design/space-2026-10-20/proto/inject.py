import sys
src, data, out = sys.argv[1:4]
s = open(src, encoding='utf-8').read(); d = open(data, encoding='utf-8').read().replace('</', '<\\/')
assert s.count('__DATA__') == 1
open(out, 'w', encoding='utf-8').write(s.replace('__DATA__', d))
print('bytes', len(open(out, encoding='utf-8').read().encode('utf-8')))
