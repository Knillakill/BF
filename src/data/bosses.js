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
//   onAttackDone(g, n)   Fin de la phase 4 : n = nombre de héros blessés par l'attaque
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
// (répartis différemment selon les parties). Attaques 4 à 6 ; dès le tour 2, chacune ajoute 2 Poison (vidéo pAqJAM7xdE0).
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
    // Vidéo : au tour 3 (enragé) il attaque encore à 5/4/6 → la rage ne compte qu'à partir du tour suivant.
    const rage = g.boss.enraged ? 2 * (g.round - g.boss.enrageAt) : 0;
    return g.heroes.map(() => ({
      value: Math.max(1, rnd(4, 6) + g.diff.atk + rage),
      effects: g.round >= 2 ? { poison: 2 } : {}, // vidéo : « deux poisons et 5 dégâts » dès le tour 2
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
    // Sablier rouge (capacité du tutoriel) : au début du tour 3, il s'épuise et perd une grosse part de sa vie.
    if (!g.ability('exhaust', 'Épuisé', `M. Pantin est épuisé par tous ses efforts et perd ${loss} points de vie. C'est le moment de l'achever !`)) return;
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
    const rage = g.boss.enraged ? 2 * (g.round - g.boss.enrageAt) : 0;
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
    // Vidéo : « il est enragé… il va se shield plus » (bouclier distance à 5 au tour 5).
    if (g.boss.enraged) for (const t of Object.keys(s)) s[t] += 1;
    return s;
  },
  onHit(g, hero, dmgType, result, isAttack, strength) {
    if (strength >= 4 && g.ability('reaction', 'Crachat empoisonné',
      'Le Prince crache du poison quand une Attaque ou un Soutien inflige trop de dégâts (force 4 ou plus).')) {
      if (!g.wards(hero)) g.addPoison(hero, 1);
    }
    if (g.boss.toxic === dmgType && result.shield > 0 &&
        g.ability('shield', 'Bouclier venimeux', 'Toucher le bouclier venimeux (☠️) du Prince empoisonne.')) {
      if (!g.wards(hero)) g.addPoison(hero, 1);
    }
  },
  // Coup de langue observé : 3 (Normal, 2 héros), 4 (4 héros), 6 (Difficile, 3 héros).
  // Écrasement observé : 2 (Normal, 2 héros), 3 (4 héros ; Difficile, 3 héros). Gonflé ne les augmente pas
  // (vidéo : après « Gonflé », « tous les joueurs perdent 3 » et « ces dégâts n'ont pas augmenté »).
  onStatus(g) {
    const n = g.heroes.length;
    const lick = Math.max(2, 3 + g.diff.atk + (n >= 3 ? 1 + g.diff.atk : 0));
    const overrun = Math.max(1, 2 + Math.max(0, g.diff.atk) + (n >= 4 ? 1 : 0));
    if (g.round % 2 === 1) {
      if (!g.ability('recurring', 'Coup de langue',
        'Tous les 2 tours (tours impairs), le héros qui a le plus de PV perd des PV et reçoit 1 Poison.')) return;
      g.pickHero('hp', 'Coup de langue', (h) => {
        if (g.wards(h)) return;
        g.hurtHero(h, lick, 'Coup de langue');
        g.addPoison(h, 1);
      });
    } else {
      if (!g.ability('recurring', 'Écrasement', 'Tous les 2 tours (tours pairs), chaque héros perd des PV.')) return;
      for (const h of g.heroes) if (!g.wards(h)) g.hurtHero(h, overrun, 'Écrasement');
    }
  },
  thresholds: [
    {
      at: 0.5,
      run(g) {
        if (!g.ability('threshold', 'Gonflé',
          'Le Prince a perdu la moitié de sa vie. Ses attaques et ses boucliers augmentent, et un de ses boucliers devient venimeux à chaque tour.')) return;
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
//   Drain de vie : elle se soigne de 2/3/4 PV quand son attaque blesse (une fois par phase d'attaque).
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
    const rage = g.boss.enraged ? 2 * (g.round - g.boss.enrageAt) : 0;
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
    // Vidéo : « si on attaque à distance ou au cac, on prend une malédiction » → deux boucliers maudits.
    const types = ['melee', 'ranged', 'magic'];
    const safe = g.round === 1 ? 'magic' : pick(types);
    g.boss.cursedShields = types.filter((t) => t !== safe);
    return { melee: rnd(1, 3) + up, ranged: rnd(2, 4) + up, magic: rnd(1, 3) + up };
  },
  onHit(g, hero, dmgType, result) {
    if (g.boss.cursedShields.includes(dmgType) && result.shield > 0 &&
        g.ability('shield', 'Bouclier maudit', 'Le héros qui touche un bouclier marqué d’un crâne violet reçoit une malédiction.')) {
      if (!g.wards(hero)) g.curse(hero, 'bouclier maudit');
    }
  },
  // Drain de vie : si son attaque blesse au moins un héros, elle se soigne (une fois par attaque).
  // Vidéo : deux héros blessés → « elle se heal de 4… et c'est tout ».
  onAttackDone(g, hurt) {
    if (!hurt) return;
    const n = Math.min(4, Math.max(2, 3 + g.diff.atk));
    if (!g.ability('attack', 'Drain de vie', `Son attaque a drainé votre vie : elle se soigne de ${n} PV.`)) return;
    g.healBoss(n);
  },
  onStatus(g) {
    if (g.round % 2 === 1) {
      const x = { beginner: 3, advanced: 4, pro: 6, insane: 7 }[g.difficulty] || 4;
      if (!g.ability('recurring', 'Chasse aux âmes',
        'Tours impairs : le héros qui a le plus de PV perd des PV et reçoit une malédiction.')) return;
      g.pickHero('hp', 'Chasse aux âmes', (h) => {
        if (g.wards(h)) return;
        g.hurtHero(h, x, 'Chasse aux âmes');
        g.curse(h, 'Chasse aux âmes');
      });
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
    // Anti-Boss-3000 : la capacité est complètement empêchée, elle ne se relève pas.
    if (!g.ability('threshold', 'Résurrection', 'La Chasseuse d’âmes se relève d’entre les morts en riant ! Chaque héros reçoit une malédiction.')) return false;
    const life = Math.round(this.phase2PerHero * g.heroes.length * g.diff.life);
    g.boss.maxLife = life;
    g.boss.life = life;
    for (const h of g.heroes) if (!g.wards(h)) g.curse(h, 'Résurrection');
    return true;
  },
};

const TYPES = ['melee', 'ranged', 'magic'];
const byDiff = (g, table) => table[g.difficulty] ?? table.advanced;

// ===== 3. Dragon de l'éther =====
// Observé (docs/recherche/bosses_0-4.md, section 3) :
//   PV 71/72/82 à 2 héros selon le niveau. Enragé au tour 5. Statut : Panique.
//   Il commence en vol : impossible de le toucher en mêlée ; une jauge se remplit avec les dégâts et il atterrit
//   (boucliers hauts, attaques plus faibles). Au sol, une jauge se remplit avec les ACTIONS des joueurs : pleine,
//   il attaque immédiatement en pleine phase d'actions, puis redécolle (boucliers en baisse, pas d'attaque en fin de tour).
//   À 20 PV ou moins, il est trop blessé pour voler et reste au sol.
//   Battement d'ailes (⌛, en vol) : chaque héros perd 1 PV par carte en main.
//   Cri perçant (⌛) : le héros qui a le plus de PV perd 4 PV (5 enragé) et reçoit 1 Panique.
//   Boucliers à pointes : toucher ce bouclier blesse l'attaquant (4, 5 au niveau 3).
//   Attaques : 6 à 9 avec 1-2 Panique en vol, plus faibles au sol.
const dragon = {
  name: "Le Dragon de l'éther",
  order: 3,
  art: 'dragon',
  lifePerHero: 36,
  enrageRound: 5,
  statuses: ['Panique'],
  items: true,
  legend: "Ce seigneur des dragons vous foudroie d'éclairs d'éther. Son hurlement infernal sème la panique chez ses " +
          "adversaires, qui agissent alors sans réfléchir. Sa cuirasse est en partie hérissée de pointes acérées. Au sol, " +
          "il peut sembler pataud, mais dans les airs il est d'autant plus dangereux. Alors faites-le descendre !\n" +
          "Âge : environ 1200 ans · Pics des orages · Trésor : un cocon de fée.\n" +
          "Astuce : attaquez-le en vol pour le faire atterrir, et protégez-vous avant qu'il ne redécolle.",
  quotes: {
    0: 'De minuscules importuns troublent mon sommeil.',
    1: 'Ils sont si chétifs que je les vois à peine.',
    2: 'Ils fuiront de panique, comme tous ceux d’avant.',
    3: 'Mes éclairs vont griller ces asticots.',
    4: 'Ces vermines ne valent pas mon temps.',
    5: 'Assez perdu de temps.',
    win: 'Impossible… vaincu par des vermisseaux…',
    lose: 'Retournez à la poussière, minuscules créatures.',
  },
  onStart(g) {
    const n = g.heroes.length;
    g.boss.flags.flying = true;
    g.boss.flags.land = 0;
    g.boss.flags.landMax = 6 * n; // dégâts à infliger en vol pour le faire atterrir
    g.boss.flags.wrath = 0;
    g.boss.flags.wrathMax = 2 * n; // actions des joueurs avant qu'il ne redécolle
    g.boss.spiked = [];
    g.say('ab-shield', 'Le Dragon vole. Essayez de le ramener au sol !');
  },
  gauges(g) {
    const f = g.boss.flags;
    if (f.grounded) return [{ label: 'Au sol (trop blessé pour voler)', value: 1, max: 1, kind: 'ground' }];
    return f.flying
      ? [{ label: '🪽 En vol · jauge d’atterrissage', value: f.land, max: f.landMax, kind: 'land' }]
      : [{ label: '⛰️ Au sol · colère avant l’envol', value: f.wrath, max: f.wrathMax, kind: 'wrath' }];
  },
  planAttacks(g) {
    const rage = g.boss.enraged ? 2 * (g.round - g.boss.enrageAt) : 0;
    const landed = !g.boss.flags.flying;
    return g.heroes.map(() => ({
      value: Math.max(1, rnd(5, 7) + g.diff.atk + rage - (landed ? 2 : 0)),
      effects: Math.random() < 0.55 ? { panic: Math.random() < 0.3 ? 2 : 1 } : {},
    }));
  },
  shields(g) {
    const n = g.heroes.length;
    const s = {};
    for (const t of TYPES) s[t] = g.boss.flags.flying ? rnd(0, 2) : rnd(3, 5) + (n > 2 ? 1 : 0);
    return s;
  },
  // En vol, la mêlée ne l'atteint pas (les autres effets de la carte s'appliquent quand même).
  dodges(g, dmgType) {
    if (dmgType === 'melee' && g.boss.flags.flying) return 'Le Dragon de l’éther est en vol : la mêlée ne peut pas l’atteindre.';
    return null;
  },
  onHit(g, hero, dmgType, result, isAttack, strength) {
    if (g.boss.spiked.includes(dmgType) && result.shield > 0 &&
        g.ability('shield', 'Boucliers à pointes', 'Toucher un bouclier à pointes blesse l’attaquant.')) {
      if (!g.wards(hero)) g.hurtHero(hero, byDiff(g, { beginner: 3, advanced: 4, pro: 5, insane: 6 }), 'Boucliers à pointes');
    }
    if (g.result || !g.boss.flags.flying) return;
    g.boss.flags.land += strength;
    if (g.boss.flags.land >= g.boss.flags.landMax) this.land(g);
  },
  land(g) {
    const f = g.boss.flags;
    f.flying = false;
    f.land = 0;
    f.wrath = 0;
    g.boss.shields = { melee: rnd(3, 5), ranged: rnd(3, 5), magic: rnd(3, 5) };
    g.boss.spiked = [pick(['ranged', 'magic'])];
    for (const a of g.attacks) if (a.value > 0) a.value = Math.max(1, a.value - 2);
    g.say('ab-shield', 'Le Dragon de l’éther atterrit ! Ses boucliers se renforcent (à pointes), mais ses attaques faiblissent.');
    g.fx({ kind: 'ability', abKind: 'shield', name: 'Atterrissage' });
  },
  // Au sol : chaque action des joueurs remplit sa colère ; pleine, il attaque tout de suite et redécolle.
  onAction(g) {
    const f = g.boss.flags;
    if (f.flying || f.grounded) return;
    f.wrath++;
    if (f.wrath < f.wrathMax) return;
    if (!g.ability('attack', 'Colère du dragon', 'Le Dragon vous a laissé assez de temps : il attaque immédiatement, puis s’envole. Ses boucliers baissent.')) {
      f.wrath = 0;
      return;
    }
    g.applyAttacks();
    if (g.result) return;
    g.attacks = g.heroes.map(() => ({ value: 0, effects: {} })); // il a déjà attaqué ce tour
    f.flying = true;
    f.land = 0;
    f.wrath = 0;
    for (const t of TYPES) g.boss.shields[t] = Math.floor(g.boss.shields[t] / 2);
    g.boss.spiked = [pick(['ranged', 'magic'])];
  },
  onStatus(g) {
    if (g.boss.flags.flying &&
        g.ability('recurring', 'Battement d’ailes', 'Tant qu’il vole, à la fin de chaque tour, chaque héros perd 1 PV par carte en main.')) {
      for (const h of g.heroes) {
        if (g.result) return;
        if (!g.wards(h) && h.hand.length) g.hurtHero(h, h.hand.length, 'Battement d’ailes');
      }
    }
    if (g.result) return;
    if (!g.ability('recurring', 'Cri perçant', 'À la fin de chaque tour, le héros qui a le plus de PV perd des PV et reçoit 1 Panique.')) return;
    const dmg = 4 + (g.boss.enraged ? 1 : 0) + Math.max(0, g.diff.atk - 1);
    g.pickHero('hp', 'Cri perçant', (h) => {
      if (g.wards(h)) return;
      g.hurtHero(h, dmg, 'Cri perçant');
      g.addStatus(h, 'panic', 1);
    });
  },
  thresholds: [
    {
      life: 20,
      run(g) {
        if (!g.ability('threshold', 'Trop blessé pour voler', 'Le Dragon est trop blessé pour voler : il atterrit pour de bon et se bat pour sa survie.')) return;
        g.boss.flags.grounded = true;
        if (g.boss.flags.flying) dragon.land(g);
      },
    },
  ],
};

// ===== 4. Golem de pierre =====
// Observé (docs/recherche/bosses_0-4.md, section 4 ; une seule partie, version d'avant la sortie) :
//   ~75 PV à 3 héros (renforcé ensuite). Enragé au tour 5. Statut : Paralysie (limite de main -1 par jeton).
//   Peau de pierre (⌛) : ses boucliers repoussent et grossissent à chaque tour.
//   Éclats de bouclier : briser un de ses boucliers coûte 7 PV (niveau 3) à celui qui le brise.
//   Attaque de pierrolins (réaction) : frapper trop fort dans un tour blesse le héros actif (1, puis 2, puis 3).
//   Tour 2 : « il n'attaque pas ; chaque héros perd 2 PV par jeton Paralysie ».
//   Il se soigne quand ses boucliers ne sont pas brisés.
const golem = {
  name: 'Le Golem de pierre',
  order: 4,
  art: 'golem',
  lifePerHero: 29,
  enrageRound: 5,
  statuses: ['Paralysie'],
  items: true,
  legend: "Cet ancien habitant des gorges de grès vous attaque avec une force brutale. De son poing de pierre, il " +
          "provoque des séismes. Il utilise la magie des cristaux pour se soigner et vous paralyser. Sa peau rocheuse " +
          "repousse sans cesse, et les pierres qui tournoient autour de lui se vengent dès que vous le malmenez trop.\n" +
          "Gorges de grès.\n" +
          "Astuce : brisez ses boucliers au bon moment, et ne frappez pas trop fort d'un coup.",
  quotes: {
    1: 'Pierres dures, corps tendres. Qui va gagner ?',
    2: 'De la douleur pour vous, de simples égratignures pour moi.',
    3: 'Le sable crisse, les os craquent.',
    5: 'Je vais vous réduire en poussière.',
    win: 'Je… retourne… à la roche…',
    lose: 'La montagne ne cède jamais.',
  },
  onStart(g) {
    g.boss.flags.energy = 0;
    g.boss.flags.energyMax = 5 * g.heroes.length;
    g.boss.flags.stonelings = 0;
  },
  gauges(g) {
    return [{ label: '💎 Énergie absorbée', value: g.boss.flags.energy, max: g.boss.flags.energyMax, kind: 'energy' }];
  },
  planAttacks(g) {
    g.boss.flags.energy = 0; // la jauge des pierrolins repart de zéro à chaque tour
    // Tours pairs : il n'attaque pas (cristaux paralysants, voir onAttackDone).
    if (g.round % 2 === 0) return g.heroes.map(() => ({ value: 0, effects: {} }));
    const rage = g.boss.enraged ? 2 * (g.round - g.boss.enrageAt) : 0;
    return g.heroes.map(() => ({
      value: Math.max(1, rnd(4, 6) + g.diff.atk + rage),
      effects: Math.random() < 0.5 ? { paralysis: g.diff.atk >= 1 ? 2 : 1 } : {},
    }));
  },
  shields(g) {
    const grows = g.round > 1 && g.ability('recurring', 'Peau de pierre', 'Les boucliers du Golem repoussent et deviennent plus forts à chaque tour.');
    const grow = grows ? Math.min(4, g.round - 1) : 0;
    const extra = g.heroes.length > 2 ? 1 : 0;
    return { melee: rnd(1, 3) + grow + extra, ranged: rnd(1, 3) + grow + extra, magic: rnd(1, 3) + grow + extra };
  },
  onShieldBroken(g, hero) {
    if (!g.ability('shield', 'Éclats de bouclier', 'Briser un bouclier du Golem projette des éclats sur celui qui le brise.')) return;
    if (!g.wards(hero)) g.hurtHero(hero, byDiff(g, { beginner: 4, advanced: 5, pro: 7, insane: 8 }), 'Éclats de bouclier');
  },
  onHit(g, hero, dmgType, result) {
    const f = g.boss.flags;
    f.energy += result.shield + result.life;
    while (!g.result && f.energy >= f.energyMax) {
      f.energy -= f.energyMax;
      f.stonelings = Math.min(3, f.stonelings + 1);
      const name = ['Attaque de pierrolins', 'Puissante attaque de pierrolins', 'Incroyable attaque de pierrolins'][f.stonelings - 1];
      if (!g.ability('reaction', name, 'Le Golem absorbe l’énergie de vos coups : si vous frappez trop fort dans un même tour, ses pierrolins se vengent (de plus en plus fort).')) continue;
      if (!g.wards(hero)) g.hurtHero(hero, f.stonelings, name);
    }
  },
  // Tours pairs : pas d'attaque, mais chaque héros perd 2 PV par jeton Paralysie.
  onAttackDone(g) {
    if (g.round % 2 !== 0) return;
    if (!g.ability('recurring', 'Cristaux paralysants', 'Un tour sur deux, le Golem n’attaque pas : chaque héros perd 2 PV par jeton Paralysie.')) return;
    for (const h of g.heroes) {
      if (g.result) return;
      if (h.paralysis && !g.wards(h)) g.hurtHero(h, 2 * h.paralysis, 'Cristaux paralysants');
    }
  },
  // Soin cristallin : il se soigne de 3 PV par bouclier resté intact.
  onStatus(g) {
    const intact = TYPES.filter((t) => g.boss.shields[t] > 0).length;
    if (!intact) return;
    if (!g.ability('recurring', 'Soin cristallin', 'À la fin du tour, le Golem se soigne pour chaque bouclier que vous n’avez pas brisé.')) return;
    g.healBoss(3 * intact);
  },
};

// ===== 5. Ogre à trois têtes =====
// Observé (docs/recherche/bosses_5-10.md, boss 5 ; une partie, version d'avant la sortie, chiffres incertains) :
//   ~145 PV à 4 héros (renforcé ensuite). Enragé au tour 6.
//   Trois têtes (Saber, Hörnchen, Zotte), chacune avec sa jauge, liées à un type de dégâts. Une tête vidée est
//   assommée ; elles se réveillent au tour suivant. Les trois assommées dans le même tour : il « titube » et ses
//   attaques faiblissent fortement. Une tête assommée seule « motive les autres » : ses attaques augmentent.
//   Saber crache du poison (1 Poison chacun), Hörnchen maudit (chaque héros retire les 2 cartes du dessus de sa
//   pioche du combat, et il n'attaque pas), Zotte frappe avec sa massue. Au tour 2, chaque héros reçoit une malédiction.
//   Hypothèse : chaque tête mène l'attaque à tour de rôle (Saber, Hörnchen, Zotte…) ; l'assommer annule son effet.
const ogre = {
  name: "L'Ogre à trois têtes",
  order: 5,
  art: 'ogre',
  lifePerHero: 46,
  enrageRound: 6,
  statuses: ['Poison', 'Malédiction'],
  items: true,
  curses: true,
  legend: "Trois têtes, trois caractères, un seul estomac. Saber crache son venin, Hörnchen jette des malédictions et " +
          "Zotte cogne avec sa massue. Assommez-les… mais toutes en même temps, sinon les autres s'énervent !\n" +
          "Taille : 16 m · Âges : 27, 48 et 82 ans.\n" +
          "Astuce : visez la tête qui mène l'attaque de ce tour, et tâchez de les assommer ensemble.",
  quotes: {
    1: 'Saber : « Mangez mon poison ! »',
    2: 'Hörnchen : « Je vais vous maudire, vous et vos ancêtres ! »',
    3: 'Zotte : « Massue ! Massue ! »',
    6: 'Les trois têtes hurlent en chœur : fini de rire !',
    win: 'Zotte veut sa maman…',
    lose: 'Trois têtes valent mieux qu’une !',
  },
  onStart(g) {
    const max = 4 + 3 * g.heroes.length;
    g.boss.heads = [
      { id: 'saber', name: 'Saber', dmg: 'ranged', hp: max, max, down: false },
      { id: 'hornchen', name: 'Hörnchen', dmg: 'magic', hp: max, max, down: false },
      { id: 'zotte', name: 'Zotte', dmg: 'melee', hp: max, max, down: false },
    ];
  },
  gauges(g) {
    const lead = g.boss.flags.leader;
    return g.boss.heads.map((h) => ({
      label: `${h.id === lead ? '👑 ' : ''}${h.name} (${{ melee: '⚔️', ranged: '🏹', magic: '✨' }[h.dmg]})${h.down ? ' — assommé' : ''}`,
      value: h.down ? 0 : h.hp, max: h.max, kind: h.down ? 'down' : 'head',
    }));
  },
  planAttacks(g) {
    const f = g.boss.flags;
    // Les têtes assommées se réveillent au début du tour.
    for (const h of g.boss.heads) {
      if (h.down) g.say('ab-recurring', `${h.name} se remet et retrouve toute sa force.`);
      h.down = false;
      h.hp = h.max;
    }
    f.knocked = 0;
    const lead = g.boss.heads[(g.round - 1) % 3];
    f.leader = lead.id;
    g.say('ab-recurring', `${lead.name} mène l'attaque ce tour-ci.`);
    if (g.round === 2 && g.ability('recurring', 'Malédiction d’entrée', 'L’Ogre vous maudit : chaque héros reçoit une malédiction face cachée.')) {
      for (const h of g.heroes) if (!g.wards(h)) g.curse(h, 'Ogre');
    }
    const rage = g.boss.enraged ? 2 * (g.round - g.boss.enrageAt) : 0;
    return g.heroes.map(() => {
      if (lead.id === 'hornchen') return { value: 0, effects: {} }; // Hörnchen maudit au lieu d'attaquer
      return {
        value: Math.max(1, rnd(5, 7) + g.diff.atk + rage + (lead.id === 'zotte' ? 2 : 0)),
        effects: lead.id === 'saber' ? { poison: 1 } : {},
      };
    });
  },
  shields(g) {
    // Vidéo : « il n'y a que deux boucliers ».
    const open = pick(TYPES);
    const extra = g.heroes.length > 2 ? 1 : 0;
    const s = {};
    for (const t of TYPES) s[t] = t === open ? 0 : rnd(2, 4) + extra;
    return s;
  },
  onHit(g, hero, dmgType, result, isAttack, strength) {
    const f = g.boss.flags;
    const head = g.boss.heads.find((x) => x.dmg === dmgType && !x.down);
    if (!head) return;
    head.hp -= strength;
    if (head.hp > 0) return;
    head.hp = 0;
    head.down = true;
    f.knocked++;
    g.say('ab-threshold', `${head.name} est assommé ! Espérons que vous avez choisi le bon moment.`);
    g.fx({ kind: 'ability', abKind: 'threshold', name: `${head.name} assommé` });
    const lead = g.boss.heads.find((x) => x.id === f.leader);
    if (g.boss.heads.every((x) => x.down)) {
      if (!g.ability('threshold', 'L’Ogre titube', 'Les trois têtes sont assommées : ses attaques faiblissent fortement.')) return;
      for (const a of g.attacks) a.value = Math.max(0, a.value - 3);
    } else if (head === lead) {
      // La tête qui mène est assommée : son effet est annulé.
      g.say('protect', `${head.name} ne peut plus mener l'attaque : son effet est annulé.`);
      for (const a of g.attacks) {
        if (head.id === 'saber') delete a.effects.poison;
        if (head.id === 'zotte') a.value = Math.max(0, a.value - 2);
      }
    } else if (g.ability('reaction', 'Têtes motivées', 'Assommer une tête qui ne mène pas l’attaque motive les autres : les attaques de l’Ogre augmentent.')) {
      for (const a of g.attacks) if (a.value > 0) a.value += 1;
    }
  },
  // Hörnchen mène et n'est pas assommé : chaque héros retire les 2 cartes du dessus de sa pioche du combat.
  onAttackDone(g) {
    const lead = g.boss.heads.find((x) => x.id === g.boss.flags.leader);
    if (lead.id !== 'hornchen' || lead.down) return;
    if (!g.ability('recurring', 'Malédiction de Hörnchen', 'Hörnchen n’attaque pas : chaque héros retire les 2 cartes du dessus de sa pioche du combat.')) return;
    for (const h of g.heroes) {
      if (g.wards(h)) continue;
      for (let k = 0; k < 2; k++) {
        const c = g.takeTop(h);
        if (c) h.exiled.push(c);
      }
      g.say('curse', `${h.name} retire 2 cartes de sa pioche du combat.`);
    }
  },
};

const BOSSES = { puppet, prince, huntress, dragon, golem, ogre };
for (const [id, b] of Object.entries(BOSSES)) b.id = id;

module.exports = { BOSSES, DIFFICULTIES };
