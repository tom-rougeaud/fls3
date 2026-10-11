"""Tests de bout en bout dans Chromium (vrai navigateur), avec le faux Supabase.
   Micro simulé (Chromium fournit un son de test) pour essayer le studio."""
import asyncio, json, sys, urllib.request
from playwright.async_api import async_playwright
BASE = 'http://127.0.0.1:8899/index.html'
import os, tempfile
OUT = os.environ.get('CAPTURES', os.path.join(tempfile.gettempdir(), 'captures-fls3'))
ok = 0; ko = []
def check(c, m):
    global ok
    if c: ok += 1
    else: ko.append(m); print('✗', m)
def log(): return json.loads(urllib.request.urlopen(urllib.request.Request('http://127.0.0.1:8899/sb/__log', headers={'apikey': 'sb_publishable_test'})).read())

async def main():
    import os; os.makedirs(OUT, exist_ok=True)
    async with async_playwright() as p:
        b = await p.chromium.launch(args=['--use-fake-ui-for-media-stream', '--use-fake-device-for-media-stream', '--autoplay-policy=no-user-gesture-required'])
        errs = []
        async def page_for(vp):
            ctx = await b.new_context(viewport=vp, permissions=['microphone'])
            pg = await ctx.new_page(); pg.on('pageerror', lambda e: errs.append(str(e)))
            pg.on('console', lambda m: m.type == 'error' and errs.append(m.text))
            return pg
        # ---------- ordinateur ----------
        pg = await page_for({'width': 1280, 'height': 900})
        await pg.goto(BASE + '#/'); await pg.wait_for_timeout(800)
        check(await pg.locator('.chapcard').count() == 9, '9 cartes de chapitres en seconde')
        await pg.goto(BASE + '#/chapitres/tle'); await pg.wait_for_timeout(300)
        check(await pg.locator('.chapcard').count() == 8, '8 chapitres en terminale')
        await pg.screenshot(path=f'{OUT}/d-chapitres-tle.png', full_page=True)
        await pg.screenshot(path=f'{OUT}/d-accueil.png', full_page=False)
        for tab in ['', '/cours', '/methode', '/mots', '/exos']:
            await pg.goto(BASE + f'#/chap/fonctions{tab}'); await pg.wait_for_timeout(300)
            await pg.screenshot(path=f'{OUT}/d-fonctions{tab.replace("/","-")}.png', full_page=False)
        # bulle de définition au survol
        await pg.goto(BASE + '#/chap/pythagore-trigo/cours'); await pg.wait_for_timeout(300)
        await pg.locator('#main .lex').first.hover(); await pg.wait_for_timeout(600)
        check(await pg.locator('#pop').is_visible(), 'bulle au survol')
        await pg.screenshot(path=f'{OUT}/d-bulle.png')
        # exercices : un de chaque sorte
        for h, n in [('#/maths/stat1/1', 'comprendre'), ('#/maths/degre2/2', 'calcul'), ('#/maths/derivee/3', 'examen'), ('#/maths/python/2', 'python'), ('#/exo/vecteurs/1', 'mots'), ('#/chap/vecteurs/cours', 'vecteurs'), ('#/chap/fresnel/cours', 'fresnel')]:
            await pg.goto(BASE + h); await pg.wait_for_timeout(500); await pg.screenshot(path=f'{OUT}/d-{n}.png', full_page=True)
        # brevet : une mauvaise réponse → aide ; puis la bonne
        # problème d’examen : une mauvaise réponse → aide ; puis la bonne
        Q = "(()=>{const it=Q.items[Q.i]; const q=it.qs.find(q=>!(q.st&&q.st.done)); return {t:q.type, a:q.type==='num'?plain(answerShow(q)):null}})()"
        for _ in range(8):
            await pg.goto(BASE + '#/maths/premier-degre/3'); await pg.wait_for_timeout(400)
            cur = await pg.evaluate(Q)
            if cur['t'] == 'num': break
        await pg.fill('#pqcur input[name=a]', '123456'); await pg.click('#pqcur button[type=submit]'); await pg.wait_for_timeout(200)
        check(await pg.locator('#pqcur .paide').count() == 1, 'aide après une erreur')
        await pg.fill('#pqcur input[name=a]', cur['a']); await pg.click('#pqcur button[type=submit]'); await pg.wait_for_timeout(200)
        check(await pg.locator('[data-act=pnext]').count() == 1, 'question suivante après bonne réponse')
        await pg.screenshot(path=f'{OUT}/d-examen-corr.png', full_page=True)
        # version examen (consignes à l’infinitif) : sujet d’entraînement
        await pg.goto(BASE + '#/examen'); await pg.wait_for_timeout(500)
        check(await pg.locator('.inflex').count() >= 1, 'lexique des consignes à l’infinitif')
        await pg.screenshot(path=f'{OUT}/d-sujet.png', full_page=True)
        # voix des niveaux 2 et 1 réutilisées (même texte)
        await pg.goto(BASE + '#/'); await pg.wait_for_timeout(1200)
        await pg.evaluate("speak('Et c’est le but !')"); await pg.wait_for_timeout(800)
        check(any('fls-voix/clips/n1/a.mp3' in l for l in log()['log']), 'enregistrement du niveau 1 joué')
        await pg.evaluate("speak('Magnifique ! C’est juste !')"); await pg.wait_for_timeout(800)
        check(any('fls2-voix/clips/n2/b.mp3' in l for l in log()['log']), 'enregistrement du niveau 2 joué')
        # glossaire, carnet, paramètres, pages
        for h in ['glossaire', 'carnet', 'parametres', 'a-propos', 'confidentialite', 'entrainement', 'chapitres']:
            await pg.goto(BASE + '#/' + h); await pg.wait_for_timeout(300); await pg.screenshot(path=f'{OUT}/d-{h}.png')
        # ---------- studio : connexion, enregistrement, rattachement ----------
        await pg.goto(BASE + '#/studio'); await pg.wait_for_timeout(500)
        await pg.fill('#lgE', 'prof@test.fr'); await pg.fill('#lgP', 'secret'); await pg.click('form[data-form=login] button'); await pg.wait_for_timeout(1200)
        check(await pg.locator('.studio-tabs').count() == 1, 'studio ouvert après connexion')
        await pg.click('[data-act=st-grp][data-g=cours]'); await pg.wait_for_timeout(300)
        await pg.screenshot(path=f'{OUT}/d-studio.png')
        await pg.click('[data-act=st-rec]'); await pg.wait_for_timeout(1500); await pg.click('[data-act=st-stop]'); await pg.wait_for_timeout(1500)
        check(await pg.locator('#stWave').count() == 1, 'prise enregistrée (aperçu)')
        await pg.click('[data-act=st-keep]'); await pg.wait_for_timeout(2500)
        L = log(); check(len(L['db']['fls3_clips']) == 1, 'prise envoyée dans fls3_clips'); check(any(l.startswith('POST /sb/storage/v1/object/fls3-voix/') for l in L['log']), 'son envoyé dans fls3-voix')
        check(not any(('/fls_clips' in l or '/fls2_clips' in l) and not l.startswith('GET') for l in L['log']), 'aucune écriture dans les tables des niveaux 1 et 2')
        # commentaire partagé : marqué « niveau 1 »
        await pg.click('[data-act=st-grp][data-g=commentaires]'); await pg.click('[data-act=st-filtre][data-f=all]'); await pg.wait_for_timeout(300)
        t = await pg.locator('#stList').inner_text(); check(t.count('niv. 1-2') >= 2, 'commentaires des niveaux 1 et 2 signalés')
        # orphelin : on modifie la clé en base, puis on rattache
        cle = L['db']['fls3_clips'][0]['cle']
        await pg.evaluate("Bank.rows[0].cle='texte disparu'; Bank.rows[0].texte='Texte disparu'; Bank.clips=bankIndex(Bank.rows);")
        await pg.click('[data-act=st-grp][data-g=orphelins]'); await pg.wait_for_timeout(300)
        check(await pg.locator('.orph').count() == 1, 'prise à rattacher listée')
        await pg.click('[data-act=st-attach]'); await pg.wait_for_timeout(800)
        check(log()['db']['fls3_clips'][0]['cle'] != 'texte disparu', 'prise rattachée')
        # ---------- téléphone ----------
        mp = await page_for({'width': 390, 'height': 844})
        for h, n in [('#/', 'accueil'), ('#/chap/degre2/cours', 'cours'), ('#/chap/degre2/methode', 'methode'), ('#/chap/degre2/mots', 'mots'), ('#/maths/commerce/2', 'calcul'), ('#/maths/emprunts/3', 'examen'), ('#/maths/stat2/1', 'comprendre'), ('#/maths/python/2', 'python'), ('#/glossaire', 'glossaire'), ('#/studio', 'studio')]:
            await mp.goto(BASE + h); await mp.wait_for_timeout(500)
            sw = await mp.evaluate('document.documentElement.scrollWidth')
            check(sw <= 392, f'pas de défilement horizontal sur mobile ({h} : {sw}px)')
            await mp.screenshot(path=f'{OUT}/m-{n}.png', full_page=True)
        # zoom 200 %
        await mp.evaluate("S.zoom=2; saveS(); applySettings();"); await mp.goto(BASE + '#/chap/pythagore-trigo/methode'); await mp.wait_for_timeout(400)
        await mp.screenshot(path=f'{OUT}/m-zoom.png')
        check(not errs, 'aucune erreur JavaScript : ' + ' | '.join(errs[:5]))
        await b.close()
    print(f'{ok} vérifications OK, {len(ko)} problèmes')
asyncio.run(main())
