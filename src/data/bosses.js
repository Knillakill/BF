// Définition des boss.
//
// Le comportement exact des boss est caché dans l'appli officielle. Ces boss sont reconstruits
// à partir de parties filmées (transcriptions YouTube) et de photos de l'écran d'info du boss.
// Les valeurs observées sont notées en commentaire ; tout est facile à ajuster ici.
//
// Chaque boss peut définir :
//   lifePerHero          PV du boss par héros (multiplié par la difficulté)
//   enrageRound          tour à partir duquel le boss est enragé
//   items                true = Sac à dos et Potions disponibles
//   quotes               { round: 'réplique' } affichées au début des tours
//   planAttacks(g)       Phase 1 : renvoie [{ value, effects: { poison } }] pour chaque héros
//   shields(g)           Phase 2 : renvoie { melee, ranged, magic } ou null (pas de bouclier)
//   onHit(g, hero, dmgType, result, isAttack, strength)   Réaction quand un héros touche le boss
//   onStatus(g)          Fin de la phase 5 : capacités récurrentes
//   onBossPoison(g, n)   Quand le boss reçoit du poison, renvoie le nombre réellement posé
//   thresholds           [{ at: 0.5, run(g) }] capacités déclenchées sous un % de vie
//
// Types de capacités pour g.ability(kind, ...) :
//   'attack' | 'threshold' | 'reaction' | 'recurring' | 'shield'

// PV observés pour le Prince à 3 joueurs : 60 / 75 / 84 / 95 (vidéo « Les Joueurs du Dimanche »).
const DIFFICULTIES = {
  beginner: { label: 'Débutant',      life: 0.8,  atk: -1, enrage: 1 },
  advanced: { label: 'Avancé',        life: 1,    atk: 0,  enrage: 0 },
  pro:      { label: 'Professionnel', life: 1.12, atk: 1,  enrage: 0 },
  insane:   { label: 'Démentiel',     life: 1.27, atk: 2,  enrage: -1 },
};

const rnd = (min, max) => min + Math.floor(Math.random() * (max - min + 1));
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

// Observé : 48 PV à 2 héros, 72 à 3 héros. Pas de bouclier au tour 1, puis boucliers 3 / 5 / 7
// (répartis différemment selon les parties). Attaques 4 à 6 ; dès le tour 2, chacune ajoute 2 Poison.
// Au tour 3 il devient enragé, puis « épuisé » : il perd 34 % de sa vie.
const puppet = {
  name: 'M. Pantin',
  order: 0,
  art: 'puppet',
  lifePerHero: 24,
  enrageRound: 3,
  statuses: ['Poison'],
  items: false,
  starterOnly: true, // combat d'entraînement : seulement les 12 cartes de départ
  legend: "Un mannequin d'entraînement plus vrai que nature. Aucune capacité spéciale : parfait pour apprendre les règles.",
  quotes: {
    1: 'Le combat d\'entraînement commence. Réduisez l\'attaque prévue à 0 avec vos Protections !',
    2: 'Le pantin a reçu ses boucliers : concentrez-vous sur un ou deux types de dégâts.',
  },
  planAttacks(g) {
    const rage = g.boss.enraged ? 2 * (g.round - g.boss.enrageAt + 1) : 0;
    return g.heroes.map(() => ({
      value: Math.max(1, rnd(4, 6) + g.diff.atk + rage),
      effects: g.round >= 2 ? { poison: 2 } : {},
    }));
  },
  shields(g) {
    if (g.round === 1) return null;
    const [melee, ranged, magic] = [3, 5, 7].sort(() => Math.random() - 0.5);
    return { melee, ranged, magic };
  },
  // Vidéos : après l'épuisement, il lui reste 8 PV à 2 héros et 12 à 3 héros (4 PV par héros).
  onEnrage(g) {
    const loss = Math.max(0, g.boss.life - 4 * g.heroes.length);
    g.ability('threshold', 'Épuisé', `M. Pantin est épuisé par tous ses efforts et perd ${loss} points de vie. C'est le moment de l'achever !`);
    g.hitBossLife(loss);
  },
};

// Observé (vidéos) :
//   PV : 49 / 51 / 54 à 2 héros selon la difficulté, 75 à 84 à 3 héros, environ 100 à 4 héros.
//   Enragé au tour 5 : la force des attaques augmente à chaque tour.
//   Boucliers dès le tour 1, différents à chaque tour (ex. 3/2/2, 1/2/3).
//   Attaques (2 héros, difficulté 3) : T1 3+1P / 4, T2 5+1P / 3+2P, T3 3 / 5, T4 6+1P / 5, T5 6+2P / 8, T6 8 / 10.
//   Crachat empoisonné : un coup de force 4 ou plus donne 1 Poison au joueur.
//   Coup de langue : tours impairs, le héros le plus en forme perd X PV et reçoit 1 Poison.
//   Écrasement : tours pairs, chaque héros perd X PV.
//   Gonflé : à 50 % de vie, ses attaques et ses boucliers augmentent, certains boucliers deviennent venimeux.
const prince = {
  name: 'Le Prince',
  order: 1,
  art: 'toad',
  lifePerHero: 25,
  enrageRound: 5,
  statuses: ['Poison'],
  items: true,
  legend: "Autrefois un charmant prince humain, sa cupidité et sa cruauté lui ont valu une terrible malédiction : " +
          "il a été changé en grenouille monstrueuse. D'une morsure venimeuse et d'une langue gluante, il s'en prend à " +
          "quiconque ose l'approcher. Il empoisonne, écrase et piétine ses ennemis sans pitié. Poussez-le à bout et il " +
          "se met à enfler de rage. Un conseil : ne lui dites pas à quel point il est hideux maintenant.\n" +
          "Astuce : évitez de jouer trop de cartes puissantes, surtout au début. Il devient enragé au tour 5 : battez-le vite !",
  quotes: {
    0: 'Vous pouvez dîner avec le Prince. Au menu du jour : ragoût de héros.',
    1: 'Bienvenue dans mon marais… et dans votre tombe.',
    2: 'Je vois bien que vous êtes des débutants.',
    3: 'Vous devriez avoir honte d\'être encore en vie.',
    4: 'J\'ai des choses plus importantes à faire que de vous écraser.',
    5: 'Ça suffit. Fini de jouer.',
    6: 'Je ne comprends pas pourquoi vous n\'abandonnez pas.',
    win: 'Vous m\'avez vraiment vaincu… Mais quelqu\'un pourrait-il quand même m\'embrasser ?',
    lose: 'Bande de mauviettes. Vous êtes trop maigres, même pour mon festin.',
  },
  planAttacks(g) {
    const rage = g.boss.enraged ? 2 * (g.round - g.boss.enrageAt + 1) : 0;
    const bloat = g.boss.flags.bloated ? 2 : 0;
    return g.heroes.map(() => {
      const poison = Math.random() < 0.5 ? (Math.random() < 0.3 ? 2 : 1) : 0;
      return {
        value: Math.max(1, rnd(3, 5) + g.diff.atk + rage + bloat),
        effects: poison ? { poison } : {},
      };
    });
  },
  shields(g) {
    const extra = g.heroes.length - 2;
    const s = {
      melee: rnd(1, 3) + Math.max(0, extra),
      ranged: rnd(1, 3) + Math.max(0, extra),
      magic: rnd(1, 3) + Math.max(0, extra),
    };
    if (g.boss.flags.bloated) {
      for (const t of Object.keys(s)) s[t] += 2;
      g.boss.toxic = pick(['melee', 'ranged', 'magic']);
    }
    return s;
  },
  onHit(g, hero, dmgType, result, isAttack, strength) {
    if (strength >= 4) {
      g.ability('reaction', 'Crachat empoisonné',
        'Le Prince crache du poison quand une Attaque ou un Soutien inflige trop de dégâts (force 4 ou plus).');
      g.addPoison(hero, 1);
    }
    if (g.boss.toxic === dmgType && result.shield > 0) {
      g.ability('shield', 'Bouclier venimeux', 'Toucher le bouclier venimeux (☠️) du Prince empoisonne.');
      g.addPoison(hero, 1);
    }
  },
  // Coup de langue observé : 3 (Normal, 2 héros), 4 (4 héros), 6 (Difficile, 3 héros).
  // Écrasement observé : 2 (Normal, 2 héros), 3 (4 héros ; Difficile, 3 héros). Gonflé ne les augmente pas.
  onStatus(g) {
    const n = g.heroes.length;
    // Relevés : Coup de langue 2–3 (2 héros), 4 (2 héros Pro), 6 (3 héros Pro), 4 (4 héros) ;
    // Écrasement 2–4 (2 héros), 3 (3 héros Pro), 5 (3 héros Démentiel), 3 (4 héros), +2 après « Gonflé ».
    const lick = Math.max(2, 3 + g.diff.atk + (n >= 3 ? 1 + g.diff.atk : 0));
    const overrun = Math.max(1, 2 + Math.max(0, g.diff.atk) + (n >= 4 ? 1 : 0) + (g.boss.flags.bloated ? 2 : 0));
    if (g.round % 2 === 1) {
      if (!g.ability('recurring', 'Coup de langue',
        'Tous les 2 tours (tours impairs), le héros qui a le plus de PV perd des PV et reçoit 1 Poison.')) return;
      const h = g.heroes[g.heroWithMost('hp')];
      if (g.wards(h)) return;
      g.hurtHero(h, lick, 'Coup de langue');
      g.addPoison(h, 1);
    } else {
      if (!g.ability('recurring', 'Écrasement', 'Tous les 2 tours (tours pairs), chaque héros perd des PV.')) return;
      for (const h of g.heroes) if (!g.wards(h)) g.hurtHero(h, overrun, 'Écrasement');
    }
  },
  thresholds: [
    {
      at: 0.5,
      run(g) {
        g.ability('threshold', 'Gonflé',
          'Le Prince a perdu la moitié de sa vie. Ses attaques et ses boucliers augmentent, et un de ses boucliers devient venimeux à chaque tour.');
        g.boss.flags.bloated = true;
        g.addShields({ melee: 2, ranged: 2, magic: 2 });
        g.boss.toxic = pick(['melee', 'ranged', 'magic']);
        for (const a of g.attacks) if (a.value > 0) a.value += 2;
      },
    },
  ],
};


// Observé (docs/recherche/bosses_0-4.md, section 2) :
//   Deux phases : PV 21 (2 héros, niv. 1), 23→~32 (2 héros, niv. 3), 38→55 (3 héros), 47→63 (3 héros, niv. 4).
//   Enragée au tour 5. Attaques 3 à 6 par héros, avec malédiction et/ou poison en effet additionnel.
//   Drain de vie : elle se soigne de 2/3/4 PV pour chaque héros que son attaque blesse.
//   Bouclier maudit : le héros qui touche ce bouclier reçoit une malédiction.
//   Chasse aux âmes (tours impairs) : le héros qui a le plus de PV perd 3/4/7 PV et reçoit une malédiction.
//   Cauchemar (tours pairs) : chaque héros perd 6 PV puis défausse 2 cartes de sa pioche (4 au tour 4).
//   Résurrection : à 0 PV, elle se relève avec ses PV de phase 2 et chaque héros reçoit une malédiction.
const huntress = {
  name: "La Chasseuse d'âmes",
  order: 2,
  art: 'huntress',
  lifePerHero: 12,
  phase2PerHero: 17,
  enrageRound: 5,
  statuses: ['Poison', 'Malédiction'],
  items: true,
  curses: true,
  legend: "Lorsque cette gigantesque silhouette fantomatique appartenait encore au monde des vivants, elle était une " +
          "puissante mage du ciel. Mais elle se tourna vers la magie noire et y perdit son âme. Dorénavant, elle est en " +
          "quête d'êtres faibles d'esprit comme vous. Par le biais de malédictions, elle leur vole leur âme. Ça vous tente ?\n" +
          "Taille : plus de 7 m · Âge : 237 ans · Ruines de Port-Sombre · Trésor : une rune céleste.\n" +
          "Astuce : réduisez ses attaques à zéro pour l'empêcher de se soigner, et soignez-vous avant de la vaincre une première fois…",
  quotes: {
    0: 'Donnez-moi votre âme et j’épargnerai vos corps faibles.',
    1: 'Des esprits faibles sont venus me visiter. Approchez-vous.',
    2: 'Vous aurais-je sous-estimés ? Impossible.',
    3: 'Mes malédictions vous plaisent-elles ?',
    4: 'Vos âmes veulent me rejoindre. Elles sentent si bon.',
    5: 'Assez joué. Il est temps d’en finir.',
    win: 'Vous avez libéré les âmes innombrables… et la mienne peut enfin reposer en paix.',
    lose: 'Vos âmes m’appartiennent désormais.',
  },
  planAttacks(g) {
    const rage = g.boss.enraged ? 2 * (g.round - g.boss.enrageAt + 1) : 0;
    return g.heroes.map(() => {
      const r = Math.random();
      return {
        value: Math.max(1, rnd(3, 5) + g.diff.atk + rage),
        effects: r < 0.4 ? { curse: 1 } : r < 0.6 ? { poison: 2 } : {},
      };
    });
  },
  shields(g) {
    const up = Math.floor((g.round - 1) / 2) + Math.max(0, g.heroes.length - 2);
    g.boss.cursedShield = pick(['melee', 'ranged', 'magic']);
    return { melee: rnd(1, 3) + up, ranged: rnd(2, 4) + up, magic: rnd(1, 3) + up };
  },
  onHit(g, hero, dmgType, result) {
    if (g.boss.cursedShield === dmgType && result.shield > 0) {
      g.ability('shield', 'Bouclier maudit', 'Le héros qui touche le bouclier marqué d’un crâne violet reçoit une malédiction.');
      g.curse(hero, 'bouclier maudit');
    }
  },
  // Drain de vie : chaque héros blessé par son attaque la soigne.
  onAttackHit(g) {
    const n = Math.min(4, Math.max(2, 3 + g.diff.atk));
    g.ability('attack', 'Drain de vie', `Son attaque draine votre vie : elle se soigne de ${n} PV pour chaque héros blessé.`);
    g.healBoss(n);
  },
  onStatus(g) {
    if (g.round % 2 === 1) {
      const x = { beginner: 3, advanced: 4, pro: 6, insane: 7 }[g.difficulty] || 4;
      if (!g.ability('recurring', 'Chasse aux âmes',
        'Tours impairs : le héros qui a le plus de PV perd des PV et reçoit une malédiction.')) return;
      const h = g.heroes[g.heroWithMost('hp')];
      if (g.wards(h)) return;
      g.hurtHero(h, x, 'Chasse aux âmes');
      g.curse(h, 'Chasse aux âmes');
    } else {
      if (!g.ability('recurring', 'Cauchemar',
        'Tours pairs : chaque héros perd 6 PV puis défausse des cartes du dessus de sa pioche (2, puis 4…).')) return;
      for (const h of g.heroes) {
        if (g.wards(h)) continue;
        g.hurtHero(h, 6, 'Cauchemar');
        if (g.result) return;
        g.millTop(h, g.round);
      }
    }
  },
  // Résurrection : la première fois qu'elle tombe à 0 PV, elle se relève (phase 2).
  onZero(g) {
    if (g.boss.flags.risen) return false;
    g.boss.flags.risen = true;
    const life = Math.round(this.phase2PerHero * g.heroes.length * g.diff.life);
    g.boss.maxLife = life;
    g.boss.life = life;
    g.ability('threshold', 'Résurrection', 'La Chasseuse d’âmes se relève d’entre les morts en riant ! Chaque héros reçoit une malédiction.');
    for (const h of g.heroes) g.curse(h, 'Résurrection');
    return true;
  },
};

const BOSSES = { puppet, prince, huntress };
for (const [id, b] of Object.entries(BOSSES)) b.id = id;

module.exports = { BOSSES, DIFFICULTIES };
