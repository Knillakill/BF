# Boss Fighters entre amis

Version web **non officielle** de *Boss Fighters QR* (Pegasus Spiele), pour jouer à distance entre amis qui possèdent le jeu.
Projet privé, non commercial. Aucune illustration du jeu original n'est utilisée : les visuels sont faits maison.

## Lancer le jeu

```bash
npm install
npm start
```

Puis ouvrir http://localhost:3000.

1. Un joueur crée un salon et partage le code de 4 lettres (ou le lien avec « Copier le lien »).
2. Les autres rejoignent avec ce code.
3. Comme dans l'appli officielle, chacun clique sur une place libre (« + ») au bord de la tablette, choisit son héros et sa classe, puis s'assoit.
   L'ordre du tour suit les places dans le sens des aiguilles d'une montre. Cliquer sur son héros le renvoie à la sélection ; l'hôte peut retirer un joueur (poubelle).
4. L'hôte choisit le boss et la difficulté, puis lance le combat avec la flèche verte.
5. La campagne avance toute seule après chaque victoire (M. Pantin → le Prince → la Chasseuse d'âmes). L'hôte peut aussi la régler à la main.
   Après le Prince (★1) : chaque joueur choisit un butin ★1 et peut retirer une carte de son paquet, le Porte-bonheur est débloqué,
   et la pioche de 17 malédictions est utilisée par les boss qui maudissent.

Si quelqu'un recharge la page ou perd la connexion, il retrouve automatiquement sa partie.

## Jouer à distance

Tes amis ne peuvent pas accéder à `localhost`. Deux options :

- **Rapide, depuis ton PC** : installe [cloudflared](https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/downloads/) puis lance
  `cloudflared tunnel --url http://localhost:3000`. Il affiche une adresse `https://….trycloudflare.com` à envoyer à tes amis. Le jeu reste accessible tant que ton PC et la commande tournent.
- **En ligne en permanence** : héberge le projet sur Render, Railway ou Fly.io (offre gratuite ou presque, commande de démarrage `npm start`). Garde le lien privé.

## D'où viennent les données

- **Règles** : livret officiel (PDF).
- **Noms et répartition des cartes de départ** : fiche officielle Pegasus « Box Contents Sheet ».
- **Valeurs des cartes** : photos de cartes (galerie BoardGameGeek, éditions anglaise, hongroise, polonaise et allemande), recoupées entre elles.
- **Comportement du Prince** : transcriptions de 7 parties filmées et photos de l'écran d'info du boss dans l'appli.

Chaque carte indique sa fiabilité : 📷 vue en photo, ≈ valeur probable (vidéo, photo floue), ? carte non retrouvée.

## Contenu de la boîte (référence)

- **243 cartes au total** (63×88 mm) : boîte de rangement 62 + coffre de butin bronze 64 + argent 64 + or 53.
- 72 jetons d'état (30 Poison, 12 Panique, 12 Paralysie, 18 Feu), 11 jetons objet, 4 compteurs de vie, 9 boîtes de rangement (dont 3 coffres de butin), la règle du jeu.

Où en est le catalogue :

| Boîte | Cartes | Dans le jeu en ligne |
|---|---|---|
| Rangement | 62 | 48 cartes d'action + 8 Héros/Classe ; les 4 aides de jeu et 2 STOP n'ont pas d'usage en ligne |
| Bronze (boss 1-2) | 64 | 32 cartes avancées (30 réelles + 2 supposées), Sac à dos, Potion, Le Prince, 5 butins ★1 saisis ; il manque les 17 malédictions, le Porte-bonheur et la Chasseuse d'âmes |
| Argent (boss 3-7) | 64 | pas encore |
| Or (boss 8-10) | 53 | pas encore |

## Ce qui est fidèle

- Les 7 phases du tour, 3 tours d'action par joueur, l'Éclair, Attaques / Soutiens / Protections, le Poison, la limite de main.
- PV et cartes en main des 4 héros et 4 classes (l'Elfe a 14 PV).
- Les **48 cartes de départ** (44 vues en photo, 4 probables) et **31 cartes avancées sur 32**, avec leurs mécaniques :
  action immédiate donnée à un autre héros, bonus sur la prochaine Attaque, Déjà-vu, Masque de clairvoyance,
  Malédiction du corbeau, Anti-Boss-3000, Aide chevaleresque, Improvisation, bonus « si tu as 15 PV ou plus »…
- **Le Prince** : environ 25 PV par héros, enragé au tour 5. Ses boucliers changent à chaque tour. Ses 4 capacités : Crachat empoisonné (coup de force 4 ou plus), Coup de langue (tours impairs), Écrasement (tours pairs), Gonflé (à 50 % de vie). Ses répliques sont reprises.

## Ce qui reste approximatif

| Élément | Où le modifier |
|---|---|
| Les cartes marquées ≈ ou ? | [src/data/cards.js](src/data/cards.js) |
| Les valeurs exactes du Prince selon la difficulté et le nombre de joueurs | [src/data/bosses.js](src/data/bosses.js) |
| M. Pantin (adouci pour rester un tutoriel) | [src/data/bosses.js](src/data/bosses.js) |
| Les dégâts en trop après un bouclier détruit (le livret ne le précise pas) | `SHIELD_OVERFLOW` dans [src/engine.js](src/engine.js) |
| La répartition des cartes avancées entre Halfelin/Roublard et Elfe/Druide | `advanced` dans [src/data/cards.js](src/data/cards.js) |

- La Malédiction du corbeau est utilisée automatiquement dès qu'une capacité ⌛ touche son porteur.
- Malédictions : 13 textes relevés en vidéo, la répartition des 17 cartes (doublons) est supposée.
- Pas encore géré : butin ★2 et plus, Panique, Paralysie, Feu, capacités de héros et de classe, boss 3 à 10.

## Tests

```bash
npm test        # règles, cartes spéciales et 320 combats simulés
npm run smoke   # serveur : 2 joueurs, salon, combat, reconnexion
```

## Visuels et crédits

- **Illustrations** (`public/img/`) : créations originales générées avec l'IA de Canva (Prince, M. Pantin, Troll, Halfelin, Nain, Elfe, table ronde). Aucune illustration du jeu original n'est utilisée.
- **Icônes** (`public/icons/`) : [game-icons.net](https://game-icons.net), licence CC BY 3.0 — Lorc, Delapouite, Skoll, Sbed, Zeromancer, Quoting, Faithtoken.
- **Polices** : Grenze Gotisch et Alegreya (Google Fonts).
- `node test/screenshots.js` prend des captures de l'interface avec Edge (serveur lancé sur le port 3000).
