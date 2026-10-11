# Maths Allophones · Niveau 3 · Lycée professionnel

Les mathématiques du bac pro, de la seconde à la terminale, en français facile, pour les élèves allophones qui arrivent au lycée professionnel.

**En ligne :** https://tom-rougeaud.github.io/fls3/
**Niveau 1 (le vocabulaire de base) :** https://tom-rougeaud.github.io/fls/
**Niveau 2 (les maths de 3ᵉ) :** https://tom-rougeaud.github.io/fls2/

## Ce que contient l’application

**28 chapitres répartis sur les trois années.** L’élève choisit son année, son groupement (A, B ou C) et dit si sa spécialité a de la physique-chimie. Les chapitres qui ne sont pas au programme de sa classe restent visibles mais sont signalés.

| Année | Chapitres |
|---|---|
| Seconde (9) | Les maths au lycée professionnel · Statistique à une variable · Fluctuation et probabilités · Équations et inéquations du premier degré · Fonctions · Calculs commerciaux · Géométrie dans l’espace · Pythagore et trigonométrie · Python |
| Première (11) | Statistique à deux variables · Tableaux croisés et événements · Suites arithmétiques · Résolutions graphiques · Second degré · Dérivation · Géométrie dans l’espace · Vecteurs du plan (A, B) · Cercle trigonométrique (A, B) · Intérêts composés et crédit (sans physique-chimie) · Logique et algorithmique |
| Terminale (8) | Suites géométriques · Polynômes de degré 3 · Exponentielles et logarithme (A, B) · Modéliser : affine ou exponentiel · Probabilités conditionnelles · Emprunts (sans physique-chimie) · Vecteurs de l’espace (B) · Signaux sinusoïdaux et Fresnel (A) |

Chaque chapitre commence par **une situation de métier** (atelier, commerce, bâtiment, énergie…) et une question : le premier problème « comme à l’examen » reprend cette situation.

- **Le cours sur deux colonnes** (177 fiches) : « en français facile » à gauche, « comme dans le manuel » à droite. L’élève peut afficher les deux colonnes ou une seule.
- **Les méthodes** (86) : les étapes, puis un exemple résolu pas à pas (avec l’outil : calculatrice, tableur ou Python).
- **Les mots** (236 nouveaux mots) : un dessin, une définition simple, la définition « du manuel », le sens dans la vie de tous les jours pour les mots à double sens, et des phrases à réutiliser.
- **Les exercices**, sur trois niveaux :
  1. *Je comprends l’énoncé* (224 exercices) ;
  2. *Je calcule* : 106 nouveaux générateurs (et ceux du niveau 2 quand ils sont utiles) ;
  3. *Comme à l’examen* (84 problèmes) en trois versions : **guidée** (la première aide s’affiche), **standard**, **examen** (consignes à l’infinitif, comme dans un vrai sujet, avec un petit lexique « Calculer = calcule »). Chaque question indique la compétence travaillée : s’approprier, analyser, réaliser, valider, communiquer.

S’y ajoutent un **sujet d’entraînement** par année (4 problèmes en version examen, tirés dans les chapitres de la classe) et la révision en spirale.

**Un glossaire commun aux trois années**, avec un filtre par année et, en option, les 341 mots des niveaux 1 et 2 en rappel.

**Comme aux niveaux 1 et 2 :** la voix (voix du professeur enregistrée dans le studio, sinon voix naturelle Piper, sinon voix de l’appareil ; une phrase est toujours dite en entier), les commentaires façon match de foot, les verbes d’action en **gras souligné**, les familles de couleurs, les fractions sur deux étages, les vecteurs avec leur flèche, le zoom, le carnet de progression (export / import / effacement) et la fiche imprimable par chapitre.

Il n’y a aucune traduction dans une autre langue : l’élève peut noter sa propre traduction dans la fiche d’un mot (« Dans ma langue »), elle reste sur son appareil.

## La voix du professeur et le partage avec les niveaux 1 et 2

- Les enregistrements du niveau 3 vont dans les tables `fls3_clips` / `fls3_textes` et le stockage `fls3-voix`, dans le même projet Supabase que les niveaux 1 et 2.
- Le niveau 3 **lit aussi** (sans jamais les modifier) les enregistrements du niveau 2, puis ceux du niveau 1 : une phrase déjà enregistrée (commentaire, définition…) est réutilisée telle quelle.
- Pour créer les tables, exécuter dans l’éditeur SQL de Supabase le fichier `supabase/schema.example.sql`, après y avoir remplacé `ton.adresse@exemple.fr` par l’adresse du compte professeur.

## Organisation du dépôt

```
index.html            l’application (un seul fichier, construit à partir de sources/)
vendor/               voix naturelle (ONNX Runtime Web, phonémiseur Piper) et encodeur MP3 du studio
supabase/             schéma des tables et du stockage (modèle, sans adresse personnelle)
sources/
  content/            le contenu : base.json (rappels des niveaux 1-2, commentaires) + un fichier JSON par chapitre (2de-…, 1re-…, tle-…)
  src/                code (core, db, voice, illus, illus2, illus3, maths, maths3, exos, studio, views, main), style, gabarit
  build.py            construit et vérifie l’application
  test/               tests automatiques
```

## Modifier le contenu

1. Modifier le fichier du chapitre dans `sources/content/chap/`. Marques utiles :
   - `[[texte|id]]` : mot du lexique cliquable ;
   - `**verbe**` : verbe d’action (il passe à l’infinitif dans la version examen) ;
   - `{{3/4}}` : fraction ;
   - `~AB~` : vecteur (avec sa flèche) ;
   - `P_A(B)` : probabilité conditionnelle.
2. Construire :
   ```
   cd sources
   python3 build.py --publier
   ```
   Le script vérifie les mots inconnus, les marques mal fermées, les cours sans colonne « manuel » et les exercices incomplets, puis recopie l’application dans `index.html` à la racine.
3. Tester (facultatif) :
   ```
   cd test && npm install
   node gens.js && node content.js && node run.js
   ```
   - `gens.js` : chaque générateur, tiré des centaines de fois, et sa réponse vérifiée par le correcteur ;
   - `content.js` : les problèmes, les dessins, la lecture à voix haute ;
   - `run.js` : un parcours complet de l’appli (toutes les pages, toutes les séries, les trois sujets d’entraînement).

   `test/e2e/` contient un test dans un vrai navigateur (Playwright) avec un faux Supabase local.

## Vie privée

- Aucune donnée d’élève n’est envoyée : la progression reste dans le navigateur.
- Pas de traceur, pas de police ni de script venant d’un autre site.
- Le seul envoi vers Supabase est la voix du professeur, et seulement depuis le studio, après connexion.
- Le modèle de voix Piper est téléchargé une fois par navigateur, à la demande. Il est partagé avec les niveaux 1 et 2.

## Licence

© Tom Rougeaud — [CC BY-NC 4.0](https://creativecommons.org/licenses/by-nc/4.0/deed.fr). Les fichiers du dossier `vendor/` gardent leurs propres licences (voir `vendor/LICENCES.md`).
