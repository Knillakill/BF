# Transcription des vidéos du jeu

Outils pour récupérer les sous-titres des vidéos YouTube sur Boss Fighters QR (données de boss, cartes, règles).
120 vidéos ont été trouvées ; 21 sont transcrites dans `docs/recherche/transcriptions/`, les autres ont été
bloquées par YouTube (limite de requêtes sur l'adresse IP).

## Reprendre plus tard (autre réseau, ou après plusieurs heures)

```bash
cd tools/videos
python -m pip install --target pylib youtube-transcript-api
mkdir -p yt_all && cp candidates.json status.json order.txt yt_all/
python -I tr_all.py pylib $(cat yt_all/order.txt) >> yt_all/run.log 2>&1
python -I mkindex.py
```

- `tr_all.py` attend 20 à 35 s entre deux vidéos, recule en cas de blocage, saute les vidéos déjà faites (`status.json`).
- Les transcriptions arrivent dans `yt_all/<id>.txt` (brut horodaté) et `yt_all/para/<id>.txt` (paragraphes).
- `mkindex.py` reconstruit `yt_all/INDEX.md` (liste complète : `docs/recherche/videos.md`).
- `disc.py` relance la recherche de vidéos.

Les plus utiles à transcrire en premier : `JZyh67BVLSs` (boss 5 à 7), `Hah1CqBGfrQ` (boss 4 et 5),
`PAtOqdtmh1Q` et `gj4qbE_wEm4` (longues parties), puis les interviews des auteurs.
