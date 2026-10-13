// Simule des combats complets avec des joueurs automatiques pour vérifier le moteur.
// Lancer : npm test

const assert = require('assert');
const { Game, needsTarget, TOP_OF_DRAW } = require('../src/engine');
const { CARDS, HEROES, CLASSES } = require('../src/data/cards');

const players = [
  { id: 'a', name: 'Lisa', hero: 'dwarf', cls: 'warrior' },
  { id: 'b', name: 'Tom', hero: 'elf', cls: 'mage' },
  { id: 'c', name: 'Sam', hero: 'troll', cls: 'rogue' },
];

// Toutes les cartes référencées existent
for (const deck of [...Object.values(HEROES), ...Object.values(CLASSES)]) {
  assert.strictEqual(deck.cards.length, 6);
  assert.strictEqual(deck.advanced.length, 4);
  for (const id of [...deck.cards, ...deck.advanced]) assert.ok(CARDS[id], `carte inconnue : ${id}`);
}

function totalCards(h) {
  return h.hand.length + h.draw.length + h.discard.length + h.play.length + h.exiled.length + (h.raven ? 1 : 0);
}
const { CURSES } = require('../src/data/curses');

// Met une carte en main et donne la main au joueur idx.
function give(g, idx, id, uid = `t${Math.random()}`) {
  g.current = idx;
  g.awaitingStarter = false;
  g.interrupts = [];
  g.resumeStack = [];
  for (const h of g.heroes) h.bonusTurn = false;
  g.heroes[idx].turnActions = Math.max(1, g.heroes[idx].turnActions);
  g.heroes[idx].turnsLeft = Math.max(1, g.heroes[idx].turnsLeft);
  g.heroes[idx].hand.push({ uid, id });
  return uid;
}

// Joueur automatique simple : potion si besoin, sinon une carte au hasard.
function botTurn(g) {
  const h = g.heroes[g.current];
  const threatened = g.attacks.reduce((best, a, i) => (a.value > g.attacks[best].value ? i : best), 0);
  if (h.hp < 10 && g.items && g.items.potions > 0) return g.useItem(h.playerId, 'potion', g.current);
  if (h.hand.length === 0) return g.items ? g.useItem(h.playerId, 'backpack') : g.pass(h.playerId);
  // Priorités : se protéger si menacé, Soutien utile, Attaque, sinon n'importe quoi.
  const has = (c, t) => CARDS[c.id].effects.some((e) => e.t === t);
  const usefulSupport = (c) => CARDS[c.id].effects.some((e) => e.t === 'support' && g.typesThisRound.includes
    ? g.typesThisRound.includes(e.dmg) : g.typesThisRound.has(e.dmg));
  const card = (g.attacks[threatened].value > 0 && h.hand.find((c) => has(c, 'protect')))
    || h.hand.find(usefulSupport)
    || h.hand.find((c) => has(c, 'attack'))
    || h.hand.find((c) => !has(c, 'support'))
    || h.hand[0];
  const other = threatened === g.current ? (g.current + 1) % g.heroes.length : threatened;
  const targets = CARDS[card.id].effects.filter(needsTarget).map((e) => (e.t === 'redirect' ? other : threatened));
  try {
    g.playCard(h.playerId, card.uid, targets);
  } catch (err) {
    if (/rediriger|autre héros|sacrifice/.test(err.message)) return g.pass(h.playerId);
    throw err;
  }
}

function simulate(bossId, difficulty) {
  const g = new Game(players, bossId, difficulty);
  const counts = g.heroes.map(totalCards);
  let guard = 0;
  while (!g.result && guard++ < 3000) {
    if (g.choice) {
      const h = g.heroes[g.choice.hero];
      g.choose(h.playerId, g.choice.allowTop ? TOP_OF_DRAW : g.choice.options[0].uid, []);
    } else if (g.phase === 'action' && g.awaitingStarter) g.chooseStarter('a', g.round % players.length);
    else if (g.phase === 'action') botTurn(g);
    else if (g.phase === 'discard') {
      for (const h of g.heroes) {
        const extra = h.hand.length - g.limitOf(h);
        g.submitDiscard(h.playerId, extra > 0 ? h.hand.slice(0, extra).map((c) => c.uid) : []);
      }
    } else throw new Error(`Phase inattendue : ${g.phase}`);

    // Invariants : aucune carte ne se perd, PV et boucliers dans les bornes.
    g.heroes.forEach((h, i) => {
      const inChoice = g.choice && g.choice.hero === i && g.choice.from === 'mask' ? g.choice.options.length : 0;
      assert.strictEqual(totalCards(h) + inChoice, counts[i], `${h.name} a perdu ou gagné des cartes`);
      assert.ok(h.hp >= 0 && h.hp <= h.maxHp, `PV hors bornes pour ${h.name}`);
    });
    assert.ok(g.boss.life >= 0 && g.boss.life <= g.boss.maxLife);
    for (const v of Object.values(g.boss.shields)) assert.ok(v >= 0);
  }
  assert.ok(g.result, 'le combat ne se termine jamais');
  return g;
}

// ----- Règles de base -----
{
  const g = new Game(players, 'puppet', 'advanced');
  assert.strictEqual(g.heroes[0].maxHp, 24, 'Nain + Guerrier = 14 + 10 PV (exemple du livret)');
  assert.strictEqual(g.heroes[0].handLimit, 6, 'Nain + Guerrier = 5 + 1 cartes (exemple du livret)');
  assert.strictEqual(totalCards(g.heroes[0]), 12, 'entraînement : 12 cartes de départ');
  assert.strictEqual(g.boss.shields.melee, 0, "pas de bouclier au tour 1 de l'entraînement");
  assert.throws(() => g.playCard('a', g.heroes[0].hand[0].uid), /qui commence/);
  g.chooseStarter('b', 1);
  assert.throws(() => g.playCard('a', g.heroes[0].hand[0].uid), /pas ton tour/);

  // Un éclair donne une action de plus dans le même tour.
  const tom = g.heroes[1];
  tom.hand.push({ uid: 'x1', id: 'magic_vortex' });
  g.playCard('b', 'x1');
  assert.strictEqual(g.current, 1, 'après un éclair, le même joueur rejoue');
  assert.strictEqual(tom.turnActions, 1);

  // Un Soutien sans Attaque du même type ne fait rien.
  tom.hand.push({ uid: 'x2', id: 'arrow_volley' });
  const life = g.boss.life;
  g.playCard('b', 'x2');
  assert.strictEqual(g.boss.life, life, 'Soutien à distance sans Attaque à distance : aucun dégât');
  assert.strictEqual(g.current, 2, 'le tour passe au joueur suivant (sens horaire)');

  // La Protection réduit l'attaque prévue et annule l'effet si elle tombe à 0.
  g.heroes[2].hand.push({ uid: 'x3', id: 'chest_piece' });
  g.attacks[0] = { value: 3, effects: { poison: 2 } };
  g.playCard('c', 'x3', [0]);
  assert.deepStrictEqual(g.attacks[0], { value: 0, effects: {} });
  assert.strictEqual(g.current, 0, 'après le dernier joueur, on revient au premier');
}

// ----- Vote pour qui commence -----
{
  const g = new Game(players, 'puppet', 'advanced');
  g.voteStarter('a', 1);
  assert.ok(g.awaitingStarter, 'on attend tous les votes');
  g.voteStarter('a', 2); // on peut changer d'avis
  g.voteStarter('b', 2);
  g.voteStarter('c', 0);
  assert.strictEqual(g.awaitingStarter, false);
  assert.strictEqual(g.current, 2, 'Sam a 2 voix sur 3');

  // Égalité : tirage au sort entre les ex æquo uniquement
  const winners = new Set();
  for (let k = 0; k < 40; k++) {
    const t = new Game(players, 'puppet', 'advanced');
    t.voteStarter('a', 0); t.voteStarter('b', 1); t.voteStarter('c', 2);
    winners.add(t.current);
  }
  assert.ok(winners.size > 1, 'égalité parfaite : le tirage varie');

  // Un joueur déconnecté ne bloque pas le vote
  const d = new Game(players, 'puppet', 'advanced');
  d.voteStarter('a', 1, ['a', 'b']);
  d.voteStarter('b', 1, ['a', 'b']);
  assert.strictEqual(d.current, 1);
}

// ----- Cartes spéciales -----
{
  const g = new Game(players, 'prince', 'advanced');
  assert.strictEqual(totalCards(g.heroes[0]), 20, 'après l’entraînement : 20 cartes');
  for (const h of g.heroes) h.hp = 50, h.maxHp = 50; // éviter une défaite pendant les tests
  g.boss.shields = { melee: 0, ranged: 0, magic: 0 };

  // Cor du chef : Sam (2) fait piocher Lisa (0), qui agit immédiatement, puis Sam reprend.
  let uid = give(g, 2, 'horn_chieftain');
  const handBefore = g.heroes[0].hand.length;
  g.heroes[2].turnActions = 2;
  g.playCard('c', uid, [0]);
  assert.strictEqual(g.heroes[0].hand.length, handBefore + 3);
  assert.strictEqual(g.current, 0, 'Lisa agit immédiatement');
  assert.ok(g.heroes[0].bonusTurn);
  g.pass('a');
  assert.strictEqual(g.current, 2, 'Sam reprend son tour');
  assert.strictEqual(g.heroes[2].turnActions, 1);

  // Diadème : +3 à la prochaine Attaque.
  uid = give(g, 1, 'diadem');
  g.playCard('b', uid);
  const life = g.boss.life;
  uid = give(g, 1, 'fireball');
  g.playCard('b', uid);
  assert.strictEqual(life - g.boss.life, 7, 'Boule de feu 4 + Diadème 3');
  assert.ok(g.heroes[1].poison >= 1, 'force 7 : le Prince crache du poison');

  // Aide chevaleresque : prend l'attaque d'un autre héros.
  g.attacks = [{ value: 2, effects: {} }, { value: 6, effects: { poison: 1 } }, { value: 3, effects: {} }];
  uid = give(g, 0, 'chivalrous');
  assert.throws(() => g.playCard('a', uid, [0]), /autre héros/);
  g.playCard('a', uid, [1]);
  assert.deepStrictEqual(g.attacks[0], { value: 6, effects: { poison: 1 } });
  assert.strictEqual(g.attacks[1].value, 0);

  // Malédiction du corbeau : posée devant le héros, le boss perd 2 PV.
  const life2 = g.boss.life;
  uid = give(g, 2, 'curse_raven');
  g.playCard('c', uid);
  assert.strictEqual(life2 - g.boss.life, 2);
  assert.ok(g.heroes[2].raven);
  assert.ok(g.wards(g.heroes[2]));
  assert.strictEqual(g.heroes[2].raven, null);

  // Anti-Boss-3000 : empêche la prochaine capacité ⌛ et quitte le combat.
  uid = give(g, 0, 'anti_boss');
  g.playCard('a', uid);
  assert.strictEqual(g.boss.antiBoss, 1);
  assert.strictEqual(g.heroes[0].exiled.length, 1);
  assert.strictEqual(g.ability('recurring', 'Test', 'test'), false);
  assert.strictEqual(g.ability('recurring', 'Test', 'test'), true);

  // Déjà-vu : rejoue une carte de la défausse, qui quitte ensuite le combat.
  const tom = g.heroes[1];
  tom.discard.push({ uid: 'old', id: 'sunfire' });
  uid = give(g, 1, 'deja_vu');
  g.playCard('b', uid);
  assert.ok(g.choice && g.choice.from === 'dejavu');
  assert.throws(() => g.pass('b'), /choix/);
  const life3 = g.boss.life;
  g.choose('b', 'old', []);
  assert.strictEqual(life3 - g.boss.life, 4);
  assert.ok(tom.exiled.some((c) => c.uid === 'old'));
  assert.strictEqual(g.choice, null);

  // Masque de clairvoyance : 3 cartes, on en joue une, les 2 autres retournent sur la pioche.
  tom.draw.push({ uid: 'm3', id: 'star_blade' }, { uid: 'm2', id: 'sunfire' }, { uid: 'm1', id: 'fireball' });
  const drawBefore = tom.draw.length;
  uid = give(g, 1, 'mask_clairvoyance');
  g.playCard('b', uid);
  assert.deepStrictEqual(g.choice.options.map((c) => c.uid), ['m1', 'm2', 'm3']);
  g.choose('b', 'm2', []);
  assert.strictEqual(tom.draw.length, drawBefore - 1);
  assert.deepStrictEqual(tom.draw.slice(-2).map((c) => c.uid), ['m3', 'm1'], 'les 2 autres retournent sur la pioche, dans le même ordre');

  // Improvisation : le héros ciblé joue automatiquement les 2 cartes du dessus de sa pioche.
  const sam = g.heroes[2];
  const playBefore = sam.play.length + sam.exiled.length + (sam.raven ? 1 : 0);
  uid = give(g, 0, 'improvise');
  g.playCard('a', uid, [2]);
  assert.ok(sam.play.length + sam.exiled.length + (sam.raven ? 1 : 0) >= playBefore + 1);

  // Improvisation + éclair : le héros ciblé effectue immédiatement l'action gagnée (vu en vidéo).
  g.heroes[2].draw.push({ uid: 'imp2', id: 'star_blade' }, { uid: 'imp1', id: 'hornet_sting' });
  uid = give(g, 0, 'improvise');
  g.heroes[0].turnActions = 1;
  g.playCard('a', uid, [2]);
  assert.strictEqual(g.current, 2, "l'éclair de Piqûre de frelon donne une action immédiate à Sam");
  g.pass('c');
  assert.strictEqual(g.heroes[2].bonusTurn, false, "l'action immédiate est terminée");
  assert.strictEqual(g.resumeStack.length, 0, 'puis le tour reprend normalement');

  // Matraque d'os : pioche 2 seulement avec 15 PV ou plus.
  sam.hp = 10;
  const h0 = sam.hand.length;
  uid = give(g, 2, 'bone_club');
  g.playCard('c', uid);
  assert.strictEqual(sam.hand.length, h0, 'moins de 15 PV : pas de pioche');
}

// ----- Le Prince : crachat empoisonné et poison sur le boss -----
{
  const g = new Game(players, 'prince', 'advanced');
  g.boss.shields = { melee: 0, ranged: 0, magic: 0 };
  let uid = give(g, 0, 'star_blade');
  g.playCard('a', uid);
  assert.strictEqual(g.heroes[0].poison, 0, 'force 3 : pas de crachat');
  uid = give(g, 0, 'rock_cleaver');
  g.playCard('a', uid);
  assert.strictEqual(g.heroes[0].poison, 1, 'force 4 : crachat empoisonné');
  uid = give(g, 2, 'poison_blade');
  g.playCard('c', uid);
  assert.strictEqual(g.boss.poison, 1, 'le Prince peut être empoisonné');
}

// ----- Campagne : butin, cartes retirées, Porte-bonheur -----
{
  const withLoot = players.map((p, i) => (i === 0 ? { ...p, loot: ['blade_of_wind'], removed: ['tunnel_blaster'] } : p));
  const g = new Game(withLoot, 'prince', 'advanced', { stars: 1 });
  const all = [...g.heroes[0].hand, ...g.heroes[0].draw].map((c) => c.id);
  assert.strictEqual(all.length, 20, '20 cartes + 1 butin - 1 retirée');
  assert.ok(all.includes('blade_of_wind') && !all.includes('tunnel_blaster'));
  assert.ok(g.items.charm, 'Porte-bonheur débloqué après le Prince');
  assert.strictEqual(new Game(players, 'prince', 'advanced').items.charm, false);

  // Porte-bonheur : joue la carte du dessus, éclair ignoré
  g.voteStarter('a', 0); g.voteStarter('b', 0); g.voteStarter('c', 0);
  g.heroes[0].draw.push({ uid: 'lc', id: 'magic_vortex' });
  const before = g.heroes[0].turnActions;
  g.useItem('a', 'charm');
  assert.ok(g.heroes[0].play.some((c) => c.uid === 'lc'));
  assert.notStrictEqual(g.current === 0 && g.heroes[0].turnActions > before - 1, true, "l'éclair du Porte-bonheur est ignoré");
}

// ----- Masque de clairvoyance : cartes remises sous la pioche -----
{
  const g = new Game(players, 'prince', 'advanced');
  const tom = g.heroes[1];
  tom.draw.push({ uid: 'u3', id: 'star_blade' }, { uid: 'u2', id: 'sunfire' }, { uid: 'u1', id: 'fireball' });
  const uid = give(g, 1, 'mask_clairvoyance');
  g.playCard('b', uid);
  g.choose('b', 'u1', [], true);
  assert.deepStrictEqual(tom.draw.slice(0, 2).map((c) => c.uid), ['u2', 'u3'], 'les 2 autres vont sous la pioche');
}

// ----- Malédictions -----
{
  const g = new Game(players, 'huntress', 'advanced', { stars: 1 });
  assert.strictEqual(g.curseDeck.length, 17);
  const lisa = g.heroes[0];
  g.curse(lisa);
  assert.strictEqual(lisa.pendingCurses.length, 1, 'reçue face cachée');
  // Révélation au début de la phase d'actions
  lisa.pendingCurses = ['perm_hand', 'hurt_attack', 'instant_poison'];
  const p0 = lisa.poison;
  g.revealCurses();
  assert.deepStrictEqual(lisa.curses, ['perm_hand', 'hurt_attack']);
  assert.strictEqual(lisa.poison, p0 + 2, 'instantanée : 2 Poison');
  assert.strictEqual(g.limitOf(lisa), lisa.handLimit - 1, 'limite de main -1');
  // Carte d'attaque jouée de la main : -2 PV
  lisa.hp = 30; lisa.maxHp = 30;
  const uid = give(g, 0, 'star_blade');
  g.playCard('a', uid);
  assert.ok(lisa.hp <= 28, 'Malédiction de la lame : -2 PV');
  // Fin de la phase d'actions : la temporaire part, la permanente reste
  g.endActionPhase();
  assert.deepStrictEqual(lisa.curses, ['perm_hand']);
  // Brise-malédiction
  const uid2 = give(g, 1, 'curse_breaker');
  g.phase = 'action';
  g.playCard('b', uid2, [0]);
  assert.deepStrictEqual(lisa.curses, []);
}

// ----- La Chasseuse d'âmes -----
{
  const g = new Game(players, 'huntress', 'advanced', { stars: 1 });
  for (const h of g.heroes) { h.hp = 60; h.maxHp = 60; }
  const life1 = g.boss.maxLife;
  g.hitBossLife(g.boss.life);
  assert.strictEqual(g.result, null, 'elle se relève');
  assert.ok(g.boss.flags.risen && g.boss.maxLife > life1, 'phase 2 plus résistante');
  assert.ok(g.heroes.every((h) => h.pendingCurses.length >= 1), 'chaque héros reçoit une malédiction');
  g.hitBossLife(g.boss.life);
  assert.strictEqual(g.result, 'win', 'la deuxième fois, elle est vaincue');

  // Drain de vie : elle se soigne quand son attaque blesse
  const d = new Game(players, 'huntress', 'advanced', { stars: 1 });
  d.boss.life = 10;
  d.attacks = d.heroes.map(() => ({ value: 2, effects: {} }));
  for (const h of d.heroes) { h.hp = 60; h.maxHp = 60; h.turnsLeft = 0; }
  d.awaitingStarter = false;
  d.endActionPhase();
  assert.ok(d.boss.life > 10, 'Drain de vie');
}

// ----- Simulations complètes -----
const tally = {};
for (const boss of ['puppet', 'prince', 'huntress']) {
  for (const diff of ['beginner', 'advanced', 'pro', 'insane']) {
    let wins = 0;
    let rounds = 0;
    const N = 40;
    for (let i = 0; i < N; i++) {
      const g = simulate(boss, diff);
      if (g.result === 'win') wins++;
      rounds += g.round;
    }
    tally[`${boss}/${diff}`] = `${Math.round((wins / N) * 100)}% de victoires (bots simples), ${(rounds / N).toFixed(1)} tours en moyenne`;
  }
}
console.log('Tous les tests passent ✔');
console.table(tally);
