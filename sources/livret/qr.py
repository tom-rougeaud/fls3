#!/usr/bin/env python3
"""QR codes des manuels niveau 3 (adresses stables : ne jamais les changer)."""
import json, sys, pathlib, segno
BASE = 'https://tom-rougeaud.github.io/fls3/'
ids = json.loads(sys.argv[1])
urls = {'home': BASE, 'examen': BASE + '#/examen', 'glossaire': BASE + '#/glossaire'}
for i in ids:
    urls[i] = BASE + '#/chap/' + i
    urls[i + ':mots'] = BASE + '#/chap/' + i + '/mots'
    urls[i + ':calc'] = BASE + '#/maths/' + i + '/2'
    urls[i + ':exam'] = BASE + '#/maths/' + i + '/3'
out = {}
for k, u in urls.items():
    q = segno.make(u, error='m')
    out[k] = {'url': u, 'svg': q.svg_inline(scale=1, border=1, dark='#1D2240')}
(pathlib.Path(__file__).parent / 'build').mkdir(exist_ok=True)
(pathlib.Path(__file__).parent / 'build' / 'qr.json').write_text(json.dumps(out), encoding='utf-8')
print(len(out), 'QR codes')
