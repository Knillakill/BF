// Moteur de jeu : applique les règles du livret côté serveur.
// Le serveur est la seule source de vérité ; les clients envoient des actions.

const { CARDS, HEROES, CLASSES, ITEMS, DMG_LABEL } = require('./data/cards');
const { BOSSES, DIFFICULTIES } = require('./data/bosses');
const { CURSES, CURSE_DECK_1 } = require('./data/curses');

// Le livret ne précise pas si les dégâts en trop passent après avoir détruit un bouclier.
// true = l'excédent touche la vie du boss ; false = il est perdu.
const SHIELD_OVERFLOW = true;
const ACTIONS_PER_ROUND = 3;
const POTION_HEAL = 8;
const TOP_OF_DRAW = '__top';

const PHASES = {
  planning: 'Planification',
  shield: 'Boucliers',
  action: 'Actions',
  attack: 'Attaque du boss',
  status: 'États',
  discard: 'Défausse',
  draw: 'Pioche',
  over: 'Fin du combat',
};

function shuffle(a) {
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Effets pour lesquels le joueur choisit un héros (dans l'ordre de la carte).
const needsTarget = (e) => (e.t === 'protect' || e.target === 'one') && !e.same;

class Game {
  // opts.stars : progression de la campagne (★1 = Prince vaincu : butin ★1, Porte-bonheur, malédictions).
  // players[i].loot / .removed : cartes de butin ajoutées et cartes d'action retirées du paquet.
  constructor(players, bossId, difficulty, opts = {}) {
    this.def = BOSSES[bossId];
    if (!this.def) throw new Error('Boss inconnu');
    this.difficulty = DIFFICULTIES[difficulty] ? difficulty : 'advanced';
    this.diff = DIFFICULTIES[this.difficulty];
    this.log = [];
    this.discovered = [];

    // Combat d'entraînement : 6 + 6 cartes de départ. Ensuite : + 4 + 4 cartes avancées (20 cartes).
    const withAdvanced = !this.def.starterOnly;
    this.heroes = players.map((p, i) => {
      const h = HEROES[p.hero];
      const c = CLASSES[p.cls];
      const ids = [...h.cards, ...c.cards, ...(withAdvanced ? [...h.advanced, ...c.advanced, ...(p.loot || [])] : [])];
      if (withAdvanced) {
        for (const r of p.removed || []) {
          const k = ids.indexOf(r);
          if (k >= 0) ids.splice(k, 1);
        }
      }
      const deck = ids.map((id, k) => ({ uid: `${i}-${k}`, id }));
      return {
        playerId: p.id,
        name: p.name,
        seat: p.seat ?? i,
        hero: p.hero,
        cls: p.cls,
        maxHp: h.hp + c.hp,
        hp: h.hp + c.hp,
        handLimit: h.hand + c.hand,
        draw: shuffle(deck),
        hand: [],
        discard: [],
        play: [],
        exiled: [],
        raven: null,
        nextMods: [],
        poison: 0,
        turnsLeft: 0,
        turnActions: 0,
        bonusTurn: false,
        curses: [], // malédictions actives (identifiants)
        pendingCurses: [], // reçues face cachée, révélées au début de la phase d'actions
      };
    });

    const n = this.heroes.length;
    const life = Math.round(this.def.lifePerHero * n * this.diff.life);
    this.boss = {
      life,
      maxLife: life,
      shields: { melee: 0, ranged: 0, magic: 0 },
      poison: 0,
      enraged: false,
      enrageAt: Math.max(2, this.def.enrageRound + this.diff.enrage),
      thresholdsDone: [],
      toxic: null,
      cursedShield: null,
      antiBoss: 0,
      flags: {},
    };
    this.stars = opts.stars || 0;
    this.items = this.def.items ? { backpack: true, potions: n, charm: this.stars >= 1 } : null;
    // Pioche de malédictions (après le Prince) : utilisée par les boss qui maudissent.
    this.curseDeck = this.def.curses ? shuffle([...CURSE_DECK_1]) : [];
    this.curseDiscard = [];
    this.round = 0;
    this.phase = 'planning';
    this.attacks = [];
    this.typesThisRound = new Set();
    this.current = null;
    this.awaitingStarter = false;
    this.interrupts = []; // héros qui doivent agir immédiatement (Cor du chef, Poudre de champignon…)
    this.resumeStack = [];
    this.choice = null; // choix de carte en cours (Déjà-vu, Masque de clairvoyance)
    this.discardReady = new Set();
    this.result = null;
    // Événements visuels (coups, protections) rejoués par les navigateurs, numérotés pour ne pas les rejouer deux fois.
    this.events = [];
    this.eventSeq = 0;

    this.say('info', `Le combat contre ${this.def.name} commence (${this.diff.label}) !`);
    this.quote(0);
    for (const h of this.heroes) this.drawCards(h, h.handLimit);
    this.startRound();
  }

  // ---------- Outils pour les boss ----------

  say(k, m) {
    this.log.push({ k, m, r: this.round });
    if (this.log.length > 200) this.log.shift();
  }

  fx(e) {
    this.events.push({ id: ++this.eventSeq, ...e });
    if (this.events.length > 30) this.events.shift();
  }

  quote(key) {
    const q = this.def.quotes && this.def.quotes[key];
    if (q) this.say('quote', `${this.def.name} : « ${q} »`);
  }

  // Annonce une capacité du boss. Renvoie false si elle est empêchée (Anti-Boss-3000).
  ability(kind, name, text) {
    if (kind === 'recurring' && this.boss.antiBoss > 0) {
      this.boss.antiBoss--;
      this.say('protect', '🤖 Anti-Boss-3000 empêche une capacité du boss !');
      return false;
    }
    if (!this.discovered.some((a) => a.name === name)) this.discovered.push({ kind, name, text });
    this.say(`ab-${kind}`, `${name} : ${text}`);
    this.fx({ kind: 'ability', abKind: kind, name });
    return true;
  }

  // Malédiction du corbeau : bloque l'effet d'une capacité ⌛ contre ce héros.
  wards(h) {
    if (!h.raven) return false;
    h.discard.push(h.raven);
    h.raven = null;
    this.say('protect', `🐦‍⬛ ${h.name} défausse la Malédiction du corbeau et ignore l'effet.`);
    return true;
  }

  heroWithMost(field) {
    let best = 0;
    this.heroes.forEach((h, i) => { if (h[field] > this.heroes[best][field]) best = i; });
    return best;
  }

  hurtHero(h, n, why) {
    if (this.result || n <= 0) return;
    h.hp = Math.max(0, h.hp - n);
    if (why !== 'attaque du boss') this.fx({ kind: 'hurt', target: this.heroes.indexOf(h), v: n, why: why || '' });
    if (why) this.say('dmg', `${h.name} perd ${n} PV (${why}).`);
    if (h.hp === 0) this.end('lose', `${h.name} est tombé au combat…`);
  }

  healHero(h, n) {
    const before = h.hp;
    h.hp = Math.min(h.maxHp, h.hp + n);
    this.say('heal', `${h.name} regagne ${h.hp - before} PV.`);
    if (h.hp > before) this.fx({ kind: 'heal', target: this.heroes.indexOf(h), v: h.hp - before });
  }

  addPoison(h, n) {
    if (n <= 0) return;
    h.poison += n;
    this.say('poison', `${h.name} reçoit ${n} Poison (total ${h.poison}).`);
  }

  addShields(s) {
    for (const t of Object.keys(s)) this.boss.shields[t] += s[t];
  }

  healBoss(n) {
    const before = this.boss.life;
    this.boss.life = Math.min(this.boss.maxLife, this.boss.life + n);
    if (this.boss.life > before) this.say('heal', `${this.def.name} regagne ${this.boss.life - before} PV.`);
  }

  // Limite de main effective (réduite par les malédictions permanentes).
  limitOf(h) {
    return Math.max(0, h.handLimit - h.curses.reduce((n, id) => n + (CURSES[id].handMinus || 0), 0));
  }

  hasCurse(h, flag) {
    return h.curses.some((id) => CURSES[id][flag]);
  }

  // Le héros reçoit une malédiction face cachée ; elle sera révélée au début de la prochaine phase d'actions.
  curse(h, why = '') {
    if (this.result) return;
    if (this.curseDeck.length === 0) {
      if (this.curseDiscard.length === 0) return;
      this.curseDeck = shuffle(this.curseDiscard);
      this.curseDiscard = [];
    }
    h.pendingCurses.push(this.curseDeck.pop());
    this.say('curse', `${h.name} reçoit une malédiction face cachée${why ? ` (${why})` : ''}.`);
    this.fx({ kind: 'curse', target: this.heroes.indexOf(h) });
  }

  revealCurses() {
    for (const h of this.heroes) {
      for (const id of h.pendingCurses) {
        const c = CURSES[id];
        this.say('curse', `${h.name} révèle « ${c.name} » : ${c.text}`);
        this.fx({ kind: 'curseReveal', target: this.heroes.indexOf(h), name: c.name });
        if (c.kind === 'instant') {
          if (c.instant.hurt) this.hurtHero(h, c.instant.hurt, c.name);
          if (c.instant.poison) this.addPoison(h, c.instant.poison);
          this.curseDiscard.push(id);
        } else {
          h.curses.push(id);
        }
        if (this.result) return;
      }
      h.pendingCurses = [];
    }
  }

  // Malédictions déclenchées par une carte jouée de la main.
  applyPlayCurses(h, card) {
    const has = (t) => card.effects.some((e) => e.t === t);
    for (const id of h.curses) {
      const on = CURSES[id].onPlay;
      if (!on) continue;
      const match = on.per === 'any' || (on.per === 'attack' && has('attack')) || (on.per === 'support' && has('support')) || (on.per === 'protect' && has('protect'));
      if (!match) continue;
      if (on.hurt) this.hurtHero(h, on.hurt, CURSES[id].name);
      if (on.poison) this.addPoison(h, on.poison);
      if (this.result) return;
    }
  }

  // Met les n cartes du dessus de la pioche dans la défausse.
  millTop(h, n) {
    let done = 0;
    for (let k = 0; k < n && h.draw.length; k++) { h.discard.push(h.draw.pop()); done++; }
    if (done) this.say('info', `${h.name} défausse les ${done} carte(s) du dessus de sa pioche.`);
  }

  // ---------- Déroulement d'un tour ----------

  startRound() {
    if (this.result) return;
    this.round++;
    this.typesThisRound.clear();
    this.say('round', `— Tour ${this.round} —`);
    this.quote(this.round);

    // Phase 1 : planification
    this.phase = 'planning';
    if (!this.boss.enraged && this.round >= this.boss.enrageAt) {
      this.boss.enraged = true;
      this.say('ab-recurring', `😡 ${this.def.name} est enragé : ses attaques sont de plus en plus fortes !`);
      if (this.def.onEnrage) this.def.onEnrage(this);
      if (this.result) return;
    }
    this.attacks = this.def.planAttacks(this).map((a) => ({ value: Math.max(0, a.value), effects: { ...a.effects } }));

    // Phase 2 : boucliers
    this.phase = 'shield';
    this.boss.toxic = null;
    this.boss.cursedShield = null;
    const s = this.def.shields ? this.def.shields(this) : null;
    if (s) {
      this.boss.shields = { melee: 0, ranged: 0, magic: 0, ...s };
      this.say('shield', `Le boss reçoit ses boucliers : ⚔️ ${this.boss.shields.melee}  🏹 ${this.boss.shields.ranged}  ✨ ${this.boss.shields.magic}`);
    }

    // Phase 3 : actions
    this.phase = 'action';
    for (const h of this.heroes) {
      h.turnsLeft = ACTIONS_PER_ROUND;
      h.turnActions = 0;
      h.bonusTurn = false;
    }
    this.current = null;
    this.interrupts = [];
    this.resumeStack = [];
    this.revealCurses();
    if (this.result) return;
    this.awaitingStarter = true;
    this.starterVotes = {}; // playerId -> index du héros choisi
  }

  chooseStarter(playerId, heroIdx) {
    this.heroOf(playerId);
    if (this.phase !== 'action' || !this.awaitingStarter) throw new Error("Ce n'est pas le moment de choisir.");
    if (!this.heroes[heroIdx]) throw new Error('Héros inconnu');
    this.awaitingStarter = false;
    this.current = heroIdx;
    this.heroes[heroIdx].turnActions = 1;
    this.say('info', `${this.heroes[heroIdx].name} commence ce tour.`);
  }

  // Vote pour le héros qui commence : la majorité l'emporte, égalité = tirage au sort.
  // onlineIds : joueurs connectés ; les absents ne bloquent pas le vote.
  voteStarter(playerId, heroIdx, onlineIds = null) {
    const voter = this.heroOf(playerId);
    if (this.phase !== 'action' || !this.awaitingStarter) throw new Error("Ce n'est pas le moment de voter.");
    if (!this.heroes[heroIdx]) throw new Error('Héros inconnu');
    this.starterVotes[playerId] = heroIdx;
    this.say('info', `${voter.name} vote pour ${this.heroes[heroIdx].name}.`);
    const voters = this.heroes.filter((h) => !onlineIds || onlineIds.includes(h.playerId));
    if (!voters.every((h) => h.playerId in this.starterVotes)) return;

    const tally = this.heroes.map(() => 0);
    for (const idx of Object.values(this.starterVotes)) tally[idx]++;
    const best = Math.max(...tally);
    const tied = tally.map((n, i) => (n === best ? i : -1)).filter((i) => i >= 0);
    const winner = tied[Math.floor(Math.random() * tied.length)];
    if (tied.length > 1) {
      this.say('info', `Égalité (${tied.map((i) => this.heroes[i].name).join(', ')}) : tirage au sort !`);
    }
    this.chooseStarter(this.heroes[winner].playerId, winner);
  }

  // Appelé après chaque action : action immédiate accordée, retour au joueur interrompu ou joueur suivant.
  afterAction() {
    if (this.result || this.choice) return;
    if (this.interrupts.length) {
      const t = this.interrupts.shift();
      this.resumeStack.push({ idx: this.current, actions: this.heroes[this.current].turnActions });
      this.current = t;
      this.heroes[t].bonusTurn = true;
      this.heroes[t].turnActions = 1;
      this.say('info', `✱ ${this.heroes[t].name} effectue immédiatement une action.`);
      return;
    }
    const h = this.heroes[this.current];
    if (h.turnActions > 0) return;
    if (h.bonusTurn) {
      h.bonusTurn = false;
      const back = this.resumeStack.pop();
      this.current = back.idx;
      this.heroes[back.idx].turnActions = back.actions;
      return this.afterAction();
    }
    h.turnsLeft--;
    const n = this.heroes.length;
    for (let k = 1; k <= n; k++) {
      const idx = (this.current + k) % n;
      if (this.heroes[idx].turnsLeft > 0) {
        this.current = idx;
        this.heroes[idx].turnActions = 1;
        return;
      }
    }
    this.endActionPhase();
  }

  endActionPhase() {
    this.current = null;
    // Les malédictions temporaires sont défaussées à la fin de la phase d'actions.
    for (const h of this.heroes) {
      const keep = [];
      for (const id of h.curses) (CURSES[id].kind === 'temp' ? this.curseDiscard : keep).push(id);
      h.curses = keep;
    }

    // Phase 4 : attaque du boss
    this.phase = 'attack';
    this.heroes.forEach((h, i) => {
      const a = this.attacks[i];
      if (!a || a.value <= 0) return;
      this.fx({ kind: 'bossAttack', target: i, v: a.value, poison: a.effects.poison || 0 });
      this.hurtHero(h, a.value, 'attaque du boss');
      if (this.result) return;
      if (a.effects.poison) this.addPoison(h, a.effects.poison);
      if (a.effects.curse) this.curse(h, 'attaque du boss');
      for (const id of h.curses) if (CURSES[id].hitPoison) this.addPoison(h, CURSES[id].hitPoison);
      if (this.def.onAttackHit) this.def.onAttackHit(this, h, a.value);
    });
    if (this.result) return;

    // Phase 5 : états
    this.phase = 'status';
    for (const h of this.heroes) {
      if (h.poison > 0) this.hurtHero(h, h.poison, 'poison');
    }
    if (this.result) return;
    if (this.boss.poison > 0) {
      this.say('poison', `Le poison inflige ${this.boss.poison} dégâts au boss.`);
      this.hitBossLife(this.boss.poison);
    }
    if (this.result) return;
    if (this.def.onStatus) this.def.onStatus(this);
    if (this.result) return;

    // Phase 6 : défausse
    this.phase = 'discard';
    for (const h of this.heroes) {
      h.discard.push(...h.play);
      h.play = [];
      h.nextMods = [];
    }
    this.discardReady.clear();
  }

  submitDiscard(playerId, uids) {
    const h = this.heroOf(playerId);
    if (this.phase !== 'discard') throw new Error("Ce n'est pas la phase de défausse.");
    if (this.discardReady.has(h.playerId)) throw new Error('Tu as déjà validé ta défausse.');
    const set = new Set(uids || []);
    if ([...set].some((u) => !h.hand.some((c) => c.uid === u))) throw new Error('Carte inconnue');
    if (h.hand.length - set.size > this.limitOf(h)) {
      throw new Error(`Tu dois garder au maximum ${this.limitOf(h)} cartes en main.`);
    }
    h.discard.push(...h.hand.filter((c) => set.has(c.uid)));
    h.hand = h.hand.filter((c) => !set.has(c.uid));
    this.discardReady.add(h.playerId);
    if (this.discardReady.size === this.heroes.length) this.drawPhase();
  }

  drawPhase() {
    this.phase = 'draw';
    for (const h of this.heroes) this.drawCards(h, Math.max(0, this.limitOf(h) - h.hand.length));
    this.startRound();
  }

  // Reforme la pioche avec la défausse si elle est vide. Renvoie false s'il n'y a plus rien.
  refill(h) {
    if (h.draw.length > 0) return true;
    if (h.discard.length === 0) return false;
    h.draw = shuffle(h.discard);
    h.discard = [];
    this.say('info', `${h.name} mélange sa défausse pour reformer sa pioche.`);
    return true;
  }

  drawCards(h, n) {
    for (let k = 0; k < n; k++) {
      if (!this.refill(h)) return;
      h.hand.push(h.draw.pop());
    }
  }

  // ---------- Actions des joueurs ----------

  heroOf(playerId) {
    const h = this.heroes.find((x) => x.playerId === playerId);
    if (!h) throw new Error('Tu ne participes pas à ce combat.');
    return h;
  }

  checkTurn(playerId) {
    if (this.result) throw new Error('Le combat est terminé.');
    if (this.phase !== 'action') throw new Error("Ce n'est pas la phase d'actions.");
    if (this.awaitingStarter) throw new Error("Choisissez d'abord qui commence.");
    if (this.choice) throw new Error('Un choix de carte est en cours.');
    const h = this.heroOf(playerId);
    if (this.heroes[this.current] !== h) throw new Error("Ce n'est pas ton tour.");
    return h;
  }

  playCard(playerId, uid, targets = []) {
    const h = this.checkTurn(playerId);
    let pos = h.hand.findIndex((c) => c.uid === uid);
    if (pos < 0) throw new Error("Cette carte n'est pas dans ta main.");
    // Malédiction du chaos : la carte est tirée au hasard dans la main (cibles choisies automatiquement).
    if (this.hasCurse(h, 'random')) {
      pos = Math.floor(Math.random() * h.hand.length);
      targets = [];
      this.say('curse', `Malédiction du chaos : ${h.name} joue une carte au hasard.`);
    }
    const inst = h.hand[pos];
    if (targets.length) this.validateTargets(h, CARDS[inst.id], targets);
    // Malédiction du sacrifice : défausser d'abord une autre carte de la main.
    if (this.hasCurse(h, 'discardFirst')) {
      const others = h.hand.filter((c) => c !== inst);
      if (!others.length) throw new Error('Malédiction du sacrifice : il te faut une autre carte en main à défausser.');
      const victim = others[Math.floor(Math.random() * others.length)];
      h.hand = h.hand.filter((c) => c !== victim);
      h.discard.push(victim);
      this.say('curse', `Malédiction du sacrifice : ${h.name} défausse « ${CARDS[victim.id].name} ».`);
    }
    h.hand = h.hand.filter((c) => c !== inst);
    h.turnActions--;
    this.playInstance(h, inst, targets);
    if (!this.result) this.applyPlayCurses(h, CARDS[inst.id]);
    this.afterAction();
  }

  validateTargets(h, card, targets) {
    const me = this.heroes.indexOf(h);
    card.effects.filter(needsTarget).forEach((e, i) => {
      const t = targets[i];
      if (t !== undefined && !this.heroes[t]) throw new Error('Cible inconnue');
      if (e.t === 'redirect') {
        if (t === undefined || t === me) throw new Error("Choisis un autre héros dont tu prends l'attaque.");
        if (!this.attacks[t] || this.attacks[t].value <= 0) throw new Error("Ce héros n'est visé par aucune attaque à rediriger.");
      }
    });
  }

  // Joue une carte (déjà retirée de la main ou de la pioche) et résout ses effets.
  playInstance(h, inst, targets, opts = {}) {
    const card = CARDS[inst.id];
    const mods = h.nextMods;
    h.nextMods = [];
    this.say('play', `${h.name} joue « ${card.name} ».`);
    let where = 'play';
    if (card.exile || opts.exile) where = 'exiled';
    if (card.effects.some((e) => e.t === 'raven')) where = 'raven';
    if (where === 'play') h.play.push(inst);
    else if (where === 'exiled') h.exiled.push(inst);
    else {
      if (h.raven) h.discard.push(h.raven);
      h.raven = inst;
    }
    const usedMods = this.resolveEffects(h, card.effects, targets, { mods, auto: opts.auto, noLightning: opts.noLightning });
    if (mods.length && !usedMods) this.say('info', `Le bonus de « prochaine Attaque » est perdu : « ${card.name} » n'est pas une Attaque.`);
  }

  useItem(playerId, item, target) {
    const h = this.checkTurn(playerId);
    if (!this.items) throw new Error("Pas d'objets contre ce boss.");
    if (item === 'backpack') {
      this.say('play', `${h.name} fouille dans le ${ITEMS.backpack.name}.`);
      h.turnActions--;
      this.drawCards(h, 3);
    } else if (item === 'potion') {
      if (this.items.potions <= 0) throw new Error('Plus de potions !');
      const t = this.heroes[target];
      if (!t) throw new Error('Choisis un héros à soigner.');
      this.items.potions--;
      h.turnActions--;
      this.say('play', `${h.name} utilise une ${ITEMS.potion.name} sur ${t.name}.`);
      this.healHero(t, POTION_HEAL);
    } else if (item === 'charm') {
      // Porte-bonheur : joue la carte du dessus de la pioche ; ses éclairs sont ignorés.
      if (!this.items.charm) throw new Error('Le Porte-bonheur n’est pas encore débloqué.');
      if (!this.refill(h)) throw new Error('Ta pioche est vide.');
      h.turnActions--;
      this.say('play', `${h.name} utilise le ${ITEMS.charm.name}.`);
      this.playInstance(h, h.draw.pop(), [], { auto: true, noLightning: true });
    } else {
      throw new Error('Objet inconnu');
    }
    this.afterAction();
  }

  pass(playerId) {
    const h = this.checkTurn(playerId);
    this.say('info', `${h.name} passe.`);
    h.turnActions = 0;
    this.afterAction();
  }

  giveUp(playerId) {
    this.heroOf(playerId);
    if (!this.result) this.end('lose', 'Les héros abandonnent le combat.');
  }

  // Déjà-vu / Masque de clairvoyance : le joueur choisit la carte à jouer.
  choose(playerId, uid, targets = [], under = false) {
    const h = this.heroOf(playerId);
    const c = this.choice;
    if (!c || this.heroes[c.hero] !== h) throw new Error("Tu n'as pas de carte à choisir.");
    let inst;
    if (uid === TOP_OF_DRAW && c.allowTop) {
      if (!this.refill(h)) throw new Error('Ta pioche est vide.');
      inst = h.draw.pop();
      targets = null;
    } else {
      inst = c.options.find((o) => o.uid === uid);
      if (!inst) throw new Error('Carte inconnue');
      this.validateTargets(h, CARDS[inst.id], targets);
    }
    if (c.from === 'dejavu') {
      if (inst.uid !== TOP_OF_DRAW) h.discard = h.discard.filter((x) => x !== inst);
    } else {
      // Masque : les cartes non choisies retournent sur la pioche (même ordre) ou dessous, au choix.
      const rest = c.options.filter((o) => o !== inst);
      if (under) h.draw.unshift(...rest);
      else h.draw.push(...rest.reverse());
    }
    this.choice = null;
    this.playInstance(h, inst, targets || [], { exile: c.from === 'dejavu', auto: targets === null });
    this.afterAction();
  }

  // ---------- Résolution des effets ----------

  // Cible par défaut quand le joueur n'a pas choisi (cartes jouées automatiquement).
  autoTarget(h, e) {
    if (e.t === 'protect') return this.attacks.reduce((b, a, i) => (a.value > this.attacks[b].value ? i : b), 0);
    if (e.t === 'heal') return this.heroes.reduce((b, x, i) => (x.hp / x.maxHp < this.heroes[b].hp / this.heroes[b].maxHp ? i : b), 0);
    if (e.t === 'cleanse') return this.heroWithMost('poison');
    return this.heroes.indexOf(h);
  }

  // Renvoie true si un bonus de « prochaine Attaque » a été consommé.
  resolveEffects(h, effects, targets, ctx = {}) {
    const queue = [...targets];
    const me = this.heroes.indexOf(h);
    let last = me;
    let usedMods = false;
    const pick = (e) => {
      if (e.same) return last;
      const idx = queue.shift();
      last = this.heroes[idx] ? idx : this.autoTarget(h, e);
      return last;
    };
    const targetsOf = (e) =>
      e.target === 'all' ? this.heroes : e.target === 'one' ? [this.heroes[pick(e)]] : [h];
    const valueOf = (v) => {
      if (v === 'd3') return 1 + Math.floor(Math.random() * 3);
      if (v === 'round') return this.round;
      if (v === 'myAttack') return this.attacks[me] ? this.attacks[me].value : 0;
      return v;
    };

    for (const e of effects) {
      if (this.result) return usedMods;
      let v = valueOf(e.v);
      switch (e.t) {
        case 'attack': {
          if (ctx.mods && ctx.mods.length && !usedMods) {
            usedMods = true;
            for (const m of ctx.mods) {
              if (m.boost) {
                v += m.boost;
                this.say('info', `Diadème : l'Attaque gagne +${m.boost} (force ${v}).`);
              }
            }
          }
          this.typesThisRound.add(e.dmg);
          this.damageBoss(h, e.dmg, v, true);
          if (usedMods) {
            for (const m of ctx.mods.filter((x) => x.heal !== undefined)) this.healHero(this.heroes[m.heal], v);
            ctx.mods = [];
          }
          if (e.backlash && v >= e.backlash.min) this.hurtHero(h, e.backlash.v, 'contrecoup');
          break;
        }
        case 'support':
          if (this.typesThisRound.has(e.dmg)) this.damageBoss(h, e.dmg, v, false);
          else this.say('info', `Soutien ${DMG_LABEL[e.dmg]} sans effet : aucune Attaque de ce type n'a été jouée ce tour.`);
          break;
        case 'protect': {
          const idx = pick(e);
          const a = this.attacks[idx];
          const before = a.value;
          a.value = Math.max(0, a.value - v);
          if (a.value === 0 || e.clear) a.effects = {};
          this.say('protect', `Protection ${v} sur ${this.heroes[idx].name} : attaque ${before} → ${a.value}.`);
          this.fx({ kind: 'protect', hero: me, target: idx, v });
          break;
        }
        case 'lightning':
          // Vu en partie filmée : une carte jouée par Improvisation donne ses actions au héros
          // qui la joue, immédiatement. (Le Porte-bonheur, lui, ignore les éclairs : noLightning.)
          if (ctx.noLightning) {
            this.say('info', '⚡ Éclair ignoré.');
          } else if (this.heroes[this.current] === h) {
            h.turnActions++;
            this.say('info', `⚡ ${h.name} gagne une action supplémentaire.`);
          } else {
            this.interrupts.push(me);
            this.say('info', `⚡ ${h.name} effectuera immédiatement une action supplémentaire.`);
          }
          break;
        case 'heal':
          for (const t of targetsOf(e)) this.healHero(t, v);
          break;
        case 'draw': {
          const ts = targetsOf(e);
          for (const t of ts) this.drawCards(t, v);
          this.say('info', `🃏 ${ts.map((t) => t.name).join(', ')} pioche${ts.length > 1 ? 'nt' : ''} ${v} carte(s).`);
          break;
        }
        case 'cleanse':
          for (const t of targetsOf(e)) {
            const n = Math.min(v, t.poison);
            t.poison -= n;
            this.say('heal', `${t.name} retire ${n} jeton(s) Poison.`);
          }
          break;
        case 'grant': {
          const idx = pick(e);
          if (idx === this.current) this.heroes[idx].turnActions++;
          else this.interrupts.push(idx);
          break;
        }
        case 'selfDamage':
          this.hurtHero(h, v, 'contrecoup');
          break;
        case 'poisonBoss': {
          const n = this.def.onBossPoison ? this.def.onBossPoison(this, v) : v;
          this.boss.poison += n;
          if (n > 0) this.say('poison', `Le boss reçoit ${n} Poison (total ${this.boss.poison}).`);
          break;
        }
        case 'bossLoss':
          this.say('hit', `Le boss perd ${v} PV.`);
          this.hitBossLife(v);
          break;
        case 'ifHp':
          if (h.hp >= e.min) usedMods = this.resolveEffects(h, e.then, [], ctx) || usedMods;
          else this.say('info', `Moins de ${e.min} PV : effet bonus non déclenché.`);
          break;
        case 'nextAttack':
          h.nextMods.push(e.boost ? { boost: e.boost } : { heal: pick(e) });
          break;
        case 'redirect': {
          const idx = pick(e);
          if (idx === me || ctx.auto) break;
          this.attacks[me] = this.attacks[idx];
          this.attacks[idx] = { value: 0, effects: {} };
          this.say('protect', `${h.name} prend pour lui l'attaque qui visait ${this.heroes[idx].name}.`);
          break;
        }
        case 'raven':
          this.say('info', `${h.name} pose la Malédiction du corbeau devant lui.`);
          break;
        case 'antiBoss':
          this.boss.antiBoss++;
          this.say('protect', '🤖 Anti-Boss-3000 est prêt à empêcher la prochaine capacité ⌛ du boss.');
          break;
        case 'improvise': {
          const t = this.heroes[pick(e)];
          for (let k = 0; k < v && !this.result; k++) {
            if (!this.refill(t)) break;
            const inst = t.draw.pop();
            this.playInstance(t, inst, [], { auto: true });
          }
          break;
        }
        case 'choose':
          if (ctx.auto) break;
          this.openChoice(h, e.from);
          break;
        case 'breakCurse': {
          // Brise-malédiction : une malédiction active d'un héros au choix part à la défausse.
          const t = this.heroes[pick(e)];
          const idx = t.curses.findIndex((id) => CURSES[id].kind === 'perm');
          const k = idx >= 0 ? idx : t.curses.length - 1;
          if (k < 0) { this.say('info', `${t.name} n'a aucune malédiction active.`); break; }
          const [gone] = t.curses.splice(k, 1);
          this.curseDiscard.push(gone);
          this.say('heal', `« ${CURSES[gone].name} » est retirée de ${t.name}.`);
          break;
        }
      }
    }
    return usedMods;
  }

  openChoice(h, from) {
    const hero = this.heroes.indexOf(h);
    if (from === 'dejavu') {
      if (h.discard.length === 0) {
        this.say('info', 'Défausse vide : Déjà-vu joue la carte du dessus de la pioche.');
        if (!this.refill(h)) return;
        return this.playInstance(h, h.draw.pop(), [], { exile: true, auto: true });
      }
      this.choice = { hero, from, options: [...h.discard], allowTop: true };
    } else {
      const options = [];
      for (let k = 0; k < 3 && this.refill(h); k++) options.push(h.draw.pop());
      if (!options.length) return;
      this.choice = { hero, from, options, allowTop: false };
    }
  }

  damageBoss(h, dmgType, v, isAttack) {
    const res = { shield: 0, life: 0 };
    let rest = v;
    if (this.boss.shields[dmgType] > 0) {
      res.shield = Math.min(v, this.boss.shields[dmgType]);
      this.boss.shields[dmgType] -= res.shield;
      rest = SHIELD_OVERFLOW ? v - res.shield : 0;
    }
    const broke = res.shield > 0 && this.boss.shields[dmgType] === 0;
    this.fx({ kind: 'hit', dmg: dmgType, hero: this.heroes.indexOf(h), v, shield: res.shield, life: Math.min(rest, this.boss.life), broke, support: !isAttack });
    res.life = this.hitBossLife(rest);
    const parts = [];
    if (res.shield) parts.push(`${res.shield} au bouclier${this.boss.shields[dmgType] === 0 ? ' (détruit !)' : ''}`);
    if (res.life) parts.push(`${res.life} à la vie`);
    this.say('hit', `${v} dégâts ${DMG_LABEL[dmgType]} : ${parts.join(', ') || 'aucun effet'}.`);
    if (!this.result && this.def.onHit) this.def.onHit(this, h, dmgType, res, isAttack, v);
    return res;
  }

  hitBossLife(n) {
    if (this.result || n <= 0) return 0;
    const dealt = Math.min(n, this.boss.life);
    this.boss.life -= dealt;
    if (this.boss.life <= 0) {
      // Certains boss se relèvent (Chasseuse d'âmes : Résurrection).
      if (this.def.onZero && this.def.onZero(this)) return dealt;
      this.end('win', `${this.def.name} est vaincu !`);
      return dealt;
    }
    for (const [i, t] of (this.def.thresholds || []).entries()) {
      if (!this.boss.thresholdsDone.includes(i) && this.boss.life <= this.boss.maxLife * t.at) {
        this.boss.thresholdsDone.push(i);
        t.run(this);
        if (this.result) break;
      }
    }
    return dealt;
  }

  end(result, msg) {
    if (this.result) return;
    this.result = result;
    this.phase = 'over';
    this.current = null;
    if (this.choice && this.choice.from === 'mask') this.heroes[this.choice.hero].draw.push(...this.choice.options);
    this.choice = null;
    this.say(result === 'win' ? 'win' : 'lose', msg);
    this.quote(result);
  }

  // ---------- Vue envoyée à chaque joueur (cartes des autres cachées) ----------

  view(playerId) {
    const choice = this.choice;
    return {
      round: this.round,
      phase: this.phase,
      phaseLabel: PHASES[this.phase],
      awaitingStarter: this.awaitingStarter,
      starterVotes: this.heroes.map((h, i) => Object.values(this.starterVotes || {}).filter((v) => v === i).length),
      myVote: this.starterVotes && playerId in this.starterVotes ? this.starterVotes[playerId] : null,
      current: this.current,
      result: this.result,
      difficulty: this.diff.label,
      boss: {
        id: this.def.id,
        name: this.def.name,
        art: this.def.art,
        legend: this.def.legend,
        ...this.boss,
      },
      discovered: this.discovered,
      attacks: this.attacks,
      typesThisRound: [...this.typesThisRound],
      items: this.items,
      choice: choice && {
        hero: choice.hero,
        from: choice.from,
        allowTop: choice.allowTop,
        options: this.heroes[choice.hero].playerId === playerId ? choice.options : null,
      },
      heroes: this.heroes.map((h) => {
        const mine = h.playerId === playerId;
        return {
          name: h.name,
          seat: h.seat,
          hero: h.hero,
          cls: h.cls,
          hp: h.hp,
          maxHp: h.maxHp,
          handLimit: this.limitOf(h),
          poison: h.poison,
          curses: h.curses.map((id) => ({ id, name: CURSES[id].name, text: CURSES[id].text, kind: CURSES[id].kind })),
          pendingCurses: h.pendingCurses.length,
          randomPlay: this.hasCurse(h, 'random'),
          turnsLeft: h.turnsLeft,
          turnActions: h.turnActions,
          bonusTurn: h.bonusTurn,
          handCount: h.hand.length,
          drawCount: h.draw.length,
          discardCount: h.discard.length,
          exiledCount: h.exiled.length,
          raven: !!h.raven,
          nextMods: h.nextMods.length,
          play: h.play,
          ready: this.discardReady.has(h.playerId),
          mine,
          hand: mine ? h.hand : null,
        };
      }),
      log: this.log.slice(-80),
      events: this.events.slice(-20),
    };
  }
}

module.exports = { Game, needsTarget, TOP_OF_DRAW };
