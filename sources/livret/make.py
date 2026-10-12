#!/usr/bin/env python3
"""Construit les manuels PDF du niveau 3 (seconde, première, terminale pro).
   python3 make.py              → les trois années, version élève + version professeur
   python3 make.py 2de          → une seule année
   python3 make.py --html       → seulement les HTML
   python3 make.py --publier    → en plus, copie les manuels ÉLÈVES dans ../../pdf et écrit ../content/manuels.json
                                  (page de chaque chapitre, pour les liens de l’appli ; relancer ensuite build.py --publier)
La version professeur (build/*-professeur.pdf) n’est jamais publiée."""
import asyncio, json, subprocess, sys, pathlib, shutil
from playwright.async_api import async_playwright
from pypdf import PdfReader, PdfWriter
from pypdf.generic import NameObject, TextStringObject

HERE = pathlib.Path(__file__).parent
B = HERE / 'build'
DATA = json.loads((HERE.parent / 'dist' / 'data.json').read_text(encoding='utf-8'))
IDS = [m['id'] for m in DATA['modules']]
NOM = {'2de': 'Seconde pro', '1re': 'Première pro', 'tle': 'Terminale pro'}
FICH = {'2de': 'seconde', '1re': 'premiere', 'tle': 'terminale'}

async def render(name, pdf):
    async with async_playwright() as p:
        b = await p.chromium.launch()
        pg = await b.new_page(viewport={'width': 794, 'height': 1123})
        await pg.goto((B / f'{name}.html').as_uri())
        await pg.wait_for_function('window.__result', timeout=900000)
        res = await pg.evaluate('window.__result')
        await pg.pdf(path=str(pdf), prefer_css_page_size=True, print_background=True, tagged=True)
        await b.close()
    return res

def bookmarks(w, res, log, prof):
    S = res['secs']; pg = lambda k: S.get(k)
    def add(title, key, parent=None):
        p = pg(key) if isinstance(key, str) else key
        return w.add_outline_item(title, p - 1, parent=parent) if p else None
    add('Couverture', 1); add('Mon manuel : comment ça marche ?', 'guide'); add('Mes phrases pour la classe', 'phrases'); add('Sommaire', 'sommaire')
    for c in log['chapitres']:
        top = add(f"Chapitre {c['n']} · {c['titre']}", c['id'])
        for k, t in [('', 'La situation et les mots'), ('-cours', 'Le cours'), ('-meth', 'Les méthodes'), ('-ex', 'Les exercices')]:
            add(t, c['id'] + k, top)
    add('L’essentiel de l’année', 'ess')
    for i, (a, b) in enumerate(log['sujets']): add(f'Sujet d’entraînement {i + 1} · chapitres {a} à {b}', f'sujet{i + 1}')
    top = add('Glossaire', 'glo-intro')
    for c in log['chapitres']: add(f"Chapitre {c['n']} · {c['titre']}", 'g-' + c['id'], top)
    add('Glossaire de A à Z', 'az'); add('Les mots déjà vus', 'rap'); add('Mes nouveaux mots', 'fin')
    if prof: add('Corrigé express', 'corr')

def meta(path, title, res=None, log=None, prof=False):
    r = PdfReader(str(path)); w = PdfWriter(clone_from=r)
    if res: bookmarks(w, res, log, prof); w.page_mode = '/UseOutlines'
    w._root_object[NameObject('/Lang')] = TextStringObject('fr-FR')
    w.add_metadata({'/Title': title, '/Author': 'Tom Rougeaud', '/Subject': 'Maths Allophones · Niveau 3 — CC BY-NC 4.0'})
    w.compress_identical_objects(remove_identicals=True, remove_orphans=True)
    with open(path, 'wb') as f: w.write(f)
    if shutil.which('qpdf'):
        tmp = path.with_suffix('.tmp.pdf')
        subprocess.run(['qpdf', '--object-streams=generate', '--recompress-flate', '--compression-level=9', str(path), str(tmp)], check=True)
        tmp.replace(path)

async def main():
    years = [a for a in sys.argv[1:] if not a.startswith('--')] or ['2de', '1re', 'tle']
    subprocess.run(['python3', 'qr.py', json.dumps(IDS)], check=True, cwd=HERE)
    ok = True
    for y in years:
        subprocess.run(['node', 'gen.js', y], check=True, cwd=HERE)
        if '--html' in sys.argv: continue
        for kind, pdf, title in [('eleve', B / f'manuel-maths-allophones-niveau-3-{FICH[y]}.pdf', f'Maths Allophones · Niveau 3 · {NOM[y]} — manuel'),
                                 ('prof', B / f'manuel-niveau-3-{FICH[y]}-professeur.pdf', f'Maths Allophones · Niveau 3 · {NOM[y]} — version professeur')]:
            res = await render(f'{y}-{kind}', pdf)
            (B / f'{y}-{kind}.result.json').write_text(json.dumps(res, ensure_ascii=False, indent=1), encoding='utf-8')
            print(f"{y} {kind} : {res['pages']} pages · {res['notes']} zones de notes · {res['fits']} textes réduits")
            for e in res['errors'][:30]: print('  ✗', e); ok = False
            for e in res['warnings'][:20]: print('  ⚠', e)
            meta(pdf, title, res, json.loads((B / f'{y}-log.json').read_text(encoding='utf-8')), kind == 'prof')
    if '--publier' in sys.argv and ok:
        dest = HERE.parent.parent / 'pdf'; dest.mkdir(exist_ok=True)
        mf = HERE.parent / 'content' / 'manuels.json'
        man = json.loads(mf.read_text(encoding='utf-8')) if mf.exists() else {}
        for y in years:
            src = B / f'manuel-maths-allophones-niveau-3-{FICH[y]}.pdf'
            shutil.copy(src, dest / src.name)
            res = json.loads((B / f'{y}-eleve.result.json').read_text(encoding='utf-8'))
            log = json.loads((B / f'{y}-log.json').read_text(encoding='utf-8'))
            man[y] = {'fichier': 'pdf/' + src.name, 'pages': res['pages'], 'mo': round(src.stat().st_size / 1e6, 1),
                      'chap': {c['id']: res['secs'][c['id']] for c in log['chapitres']}}
            print('publié :', src.name)
        mf.write_text(json.dumps(man, ensure_ascii=False, indent=1), encoding='utf-8')
        print('écrit :', mf)
    sys.exit(0 if ok else 1)

asyncio.run(main())
