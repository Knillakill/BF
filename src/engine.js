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

// Textes d'aide de l'appli officielle, affichés la première fois qu'un type de capacité apparaît (vidéo pAqJAM7xdE0).
const ABILITY_HELP = {
  reaction: 'Les capacités avec les crocs sont des réactions directes à vos actions. Si vous comprenez pourquoi le boss l’a utilisée, vous pourrez l’éviter à l’avenir.',
  recurring: 'Les capacités avec un sablier se répètent à intervalle régulier.',
  threshold: 'Les capacités avec un cœur brisé se déclenchent quand le boss passe sous un seuil de vie.',
};

const STATUS_LABEL = { poison: 'Poison', panic: 'Panique', paralysis: 'Paralysie' };

// Titres des étapes affichées au centre de l'écran.
const STEP_TITLES = {
  planning: 'Phase 1 · Planification',
  shield: 'Phase 2 · Boucliers',
  attack: 'Phase 4 · Attaque du boss',
  status: 'Phase 5 · États',
};

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
        ravenKeep: false,
        nextMods: [],
        poison: 0,
        panic: 0, // Panique (Dragon) : les cartes de la main sont jouées au hasard, 1 jeton retiré par carte
        paralysis: 0, // Paralysie (Golem) : limite de main -1 par jeton (phase 7)
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
      cursedShields: [],
      antiBoss: 0,
      flags: {},
    };
    this.stars = opts.stars || 0;
    this.items = this.def.items
      ? { backpack: true, potions: n, charm: this.stars >= 1, medbag: this.stars >= 2, waterskin: this.stars >= 3, waterskins: this.stars >= 3 ? n : 0 }
      : null;
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
    this.choice = null; // choix de carte en cours (Déjà-vu, Masque de clairvoyance, carte révélée à cibler)
    // Étape affichée au centre et validée par « Continuer » (phases 1, 2, 4 et 5, comme l'appli officielle).
    this.step = null;
    this.stepSeq = 0;
    this.logSeq = 0;
    // Égalité pour une capacité qui vise « le héros qui a le plus de… » : les joueurs choisissent (livret p.9).
    this.tie = null;
    this.discardReady = new Set();
    this.result = null;
    // Événements visuels (coups, protections) rejoués par les navigateurs, numérotés pour ne pas les rejouer deux fois.
    this.events = [];
    this.eventSeq = 0;

    this.say('info', `Le combat contre ${this.def.name} commence (${this.diff.label}) !`);
    this.quote(0);
    for (const h of this.heroes) this.drawCards(h, h.handLimit);
    if (this.def.onStart) this.def.onStart(this);
    this.startRound();
  }

  // ---------- Outils pour les boss ----------

  say(k, m) {
    this.log.push({ k, m, r: this.round, n: ++this.logSeq });
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

  // Annonce une capacité du boss. Renvoie false si elle est empêchée : l'appelant n'applique alors pas l'effet.
  // Anti-Boss-3000 (livret p.11) : « la prochaine fois que le boss utilise une capacité, elle est complètement empêchée ».
  ability(kind, name, text) {
    if (this.boss.antiBoss > 0) {
      this.boss.antiBoss--;
      this.say('protect', `🤖 Anti-Boss-3000 empêche « ${name} » !`);
      return false;
    }
    const firstOfKind = !this.discovered.some((a) => a.kind === kind);
    if (!this.discovered.some((a) => a.name === name)) this.discovered.push({ kind, name, text });
    this.say(`ab-${kind}`, `${name} : ${text}`);
    // Comme l'appli officielle : un texte d'aide la première fois qu'un type de capacité apparaît.
    if (firstOfKind && ABILITY_HELP[kind]) this.say('tip', ABILITY_HELP[kind]);
    this.fx({ kind: 'ability', abKind: kind, name });
    return true;
  }

  // Malédiction du corbeau : le héros peut la défausser pour ignorer l'effet d'une capacité du boss sur lui.
  // C'est un choix (livret p.11) : le joueur peut la « garder » pour une capacité plus dangereuse.
  wards(h) {
    if (!h.raven || h.ravenKeep) return false;
    h.discard.push(h.raven);
    h.raven = null;
    h.ravenKeep = false;
    this.say('protect', `🐦‍⬛ ${h.name} défausse la Malédiction du corbeau et ignore l'effet.`);
    return true;
  }

  heroWithMost(field) {
    let best = 0;
    this.heroes.forEach((h, i) => { if (h[field] > this.heroes[best][field]) best = i; });
    return best;
  }

  // Capacité qui vise « le héros qui a le plus de … » : en cas d'égalité, les joueurs choisissent (livret p.9).
  pickHero(field, label, apply) {
    const max = Math.max(...this.heroes.map((h) => h[field]));
    const tied = this.heroes.map((h, i) => (h[field] === max ? i : -1)).filter((i) => i >= 0);
    if (tied.length === 1) return apply(this.heroes[tied[0]]);
    this.tie = { candidates: tied, label, apply };
    this.say('info', `Égalité (${tied.map((i) => this.heroes[i].name).join(', ')}) : choisissez qui subit « ${label} ».`);
  }

  resolveTie(playerId, idx) {
    this.heroOf(playerId);
    const t = this.tie;
    if (!t) throw new Error("Il n'y a pas d'égalité à trancher.");
    if (!t.candidates.includes(idx)) throw new Error('Ce héros ne fait pas partie des ex æquo.');
    this.tie = null;
    this.say('info', `${this.heroes[idx].name} subit « ${t.label} ».`);
    t.apply(this.heroes[idx]);
  }

  // Le joueur garde sa Malédiction du corbeau (au lieu de la défausser à la prochaine capacité qui le vise).
  setRavenKeep(playerId, keep) {
    const h = this.heroOf(playerId);
    if (!h.raven) throw new Error("Tu n'as pas de Malédiction du corbeau posée.");
    h.ravenKeep = !!keep;
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

  // Jetons d'état autres que le Poison : 'panic' (Panique) ou 'paralysis' (Paralysie).
  addStatus(h, kind, n) {
    if (n <= 0) return;
    h[kind] += n;
    this.say(kind, `${h.name} reçoit ${n} ${STATUS_LABEL[kind]} (total ${h[kind]}).`);
  }

  // Retire n jetons d'état d'un héros : le Poison d'abord (il blesse), puis la Paralysie, puis la Panique.
  removeStatus(h, n) {
    const gone = [];
    for (const k of ['poison', 'paralysis', 'panic']) {
      const m = Math.min(n, h[k]);
      if (m > 0) { h[k] -= m; n -= m; gone.push(`${m} ${STATUS_LABEL[k]}`); }
    }
    this.say('heal', gone.length ? `${h.name} retire ${gone.join(', ')}.` : `${h.name} n'a aucun jeton d'état.`);
  }

  // Le boss frappe avec ses attaques prévues (phase 4, ou en pleine phase d'actions pour le Dragon).
  // Renvoie le nombre de héros blessés.
  applyAttacks() {
    let hurt = 0;
    this.heroes.forEach((h, i) => {
      const a = this.attacks[i];
      if (this.result || !a || a.value <= 0) return;
      this.fx({ kind: 'bossAttack', target: i, v: a.value, poison: a.effects.poison || 0 });
      this.hurtHero(h, a.value, 'attaque du boss');
      hurt++;
      if (this.result) return;
      if (a.effects.poison) this.addPoison(h, a.effects.poison);
      if (a.effects.panic) this.addStatus(h, 'panic', a.effects.panic);
      if (a.effects.paralysis) this.addStatus(h, 'paralysis', a.effects.paralysis);
      if (a.effects.curse) this.curse(h, 'attaque du boss');
      for (const id of h.curses) if (CURSES[id].hitPoison) this.addPoison(h, CURSES[id].hitPoison);
    });
    return hurt;
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
    return Math.max(0, h.handLimit - h.paralysis - h.curses.reduce((n, id) => n + (CURSES[id].handMinus || 0), 0));
  }

  // Cartes de la main jouées au hasard : Malédiction du chaos ou jetons Panique.
  playsAtRandom(h) {
    return h.panic > 0 || this.hasCurse(h, 'random');
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
    this.refill(h);
  }

  // ---------- Déroulement d'un tour ----------

  // Met le jeu en pause sur une étape (texte au centre) jusqu'à ce qu'un joueur clique « Continuer ».
  // since : numéro du dernier message de la chronique avant l'étape ; les messages suivants la décrivent.
  pause(kind, since) {
    if (this.result) return;
    if (this.logSeq === since) {
      const quiet = { attack: 'Toutes les attaques du boss ont été bloquées !', status: 'Aucun effet d’état ce tour.' }[kind];
      if (quiet) this.say('info', quiet);
    }
    this.step = { id: ++this.stepSeq, kind, since };
  }

  // Un joueur valide l'étape affichée. stepId évite qu'un double clic saute deux étapes.
  continueStep(playerId, stepId) {
    this.heroOf(playerId);
    if (!this.step || this.step.id !== stepId) return;
    if (this.tie) throw new Error("Choisissez d'abord le héros visé.");
    const kind = this.step.kind;
    this.step = null;
    if (kind === 'planning') this.shieldPhase();
    else if (kind === 'shield') this.actionPhase();
    else if (kind === 'attack') this.statusPhase();
    else if (kind === 'status') this.discardPhase();
  }

  startRound() {
    if (this.result) return;
    this.round++;
    this.typesThisRound.clear();
    this.say('round', `— Tour ${this.round} —`);
    const since = this.logSeq;
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
    const attacks = this.heroes.map((h, i) => {
      const a = this.attacks[i];
      const extra = [a.effects.poison ? `${a.effects.poison} Poison` : '', a.effects.panic ? `${a.effects.panic} Panique` : '',
        a.effects.paralysis ? `${a.effects.paralysis} Paralysie` : '', a.effects.curse ? 'une malédiction' : ''].filter(Boolean).join(' + ');
      return `${h.name} ${a.value}${extra ? ` + ${extra}` : ''}`;
    });
    this.say('plan', `Le boss prépare ses attaques : ${attacks.join(' · ')}.`);
    this.pause('planning', since);
  }

  // Phase 2 : boucliers (sautée quand le boss n'en a pas, comme au tour 1 de l'entraînement).
  shieldPhase() {
    const since = this.logSeq;
    this.phase = 'shield';
    this.boss.toxic = null;
    this.boss.cursedShields = [];
    const s = this.def.shields ? this.def.shields(this) : null;
    if (!s) return this.actionPhase();
    this.boss.shields = { melee: 0, ranged: 0, magic: 0, ...s };
    this.say('shield', `Le boss reçoit ses boucliers : ⚔️ ${this.boss.shields.melee}  🏹 ${this.boss.shields.ranged}  ✨ ${this.boss.shields.magic}`);
    if (this.boss.toxic) this.say('shield', `Bouclier venimeux : ${DMG_LABEL[this.boss.toxic]}.`);
    if (this.boss.cursedShields.length) this.say('shield', `Boucliers maudits : ${this.boss.cursedShields.map((t) => DMG_LABEL[t]).join(' et ')}.`);
    this.pause('shield', since);
  }

  // Phase 3 : actions
  actionPhase() {
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

    this.attackPhase();
  }

  // Phase 4 : attaque du boss
  attackPhase() {
    const since = this.logSeq;
    this.phase = 'attack';
    const hurt = this.applyAttacks();
    if (this.result) return;
    if (this.def.onAttackDone) this.def.onAttackDone(this, hurt);
    this.pause('attack', since);
  }

  // Phase 5 : états
  statusPhase() {
    const since = this.logSeq;
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
    this.pause('status', since);
  }

  // Phase 6 : défausse
  discardPhase() {
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

  // Prend la carte du dessus de la pioche. Livret p.8 : dès que la pioche est vide, on mélange
  // « immédiatement » la défausse (sans les cartes de la zone de jeu) pour la reformer.
  takeTop(h) {
    if (!this.refill(h)) return null;
    const c = h.draw.pop();
    this.refill(h);
    return c;
  }

  drawCards(h, n) {
    for (let k = 0; k < n; k++) {
      const c = this.takeTop(h);
      if (!c) return;
      h.hand.push(c);
    }
  }

  // Carte jouée depuis le dessus de la pioche (Porte-bonheur, Improvisation, Déjà-vu) :
  // si elle demande de choisir un héros, son joueur choisit la cible avant qu'elle soit résolue.
  // then : cartes d'Improvisation encore à retourner ensuite.
  playRevealed(h, inst, opts = {}, then = 0) {
    const card = CARDS[inst.id];
    const me = this.heroes.indexOf(h);
    // Acte chevaleresque sans aucune attaque à reprendre : la carte est jouée sans effet.
    const canRedirect = !card.effects.some((e) => e.t === 'redirect') || this.attacks.some((a, i) => i !== me && a.value > 0);
    if (card.effects.some(needsTarget) && canRedirect) {
      this.choice = { hero: this.heroes.indexOf(h), from: 'reveal', options: [inst], allowTop: false, opts, then };
      this.say('info', `${h.name} révèle « ${CARDS[inst.id].name} » et choisit sa cible.`);
      return true;
    }
    this.playInstance(h, inst, [], { ...opts, auto: true });
    if (then > 0) this.improvise(h, then);
    return false;
  }

  // Improvisation : le héros joue les n cartes du dessus de sa pioche, l'une après l'autre.
  improvise(t, n) {
    if (n <= 0 || this.result) return;
    const inst = this.takeTop(t);
    if (!inst) return;
    this.playRevealed(t, inst, {}, n - 1);
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
    if (this.playsAtRandom(h)) {
      pos = Math.floor(Math.random() * h.hand.length);
      targets = [];
      this.say(h.panic > 0 ? 'panic' : 'curse', `${h.panic > 0 ? 'Panique' : 'Malédiction du chaos'} : ${h.name} joue une carte au hasard.`);
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
    const panicked = h.panic > 0;
    this.playInstance(h, inst, targets);
    if (panicked && h.panic > 0) { h.panic--; this.say('panic', `${h.name} défausse un jeton Panique (reste ${h.panic}).`); }
    if (!this.result) this.applyPlayCurses(h, CARDS[inst.id]);
    this.playerActed();
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
    } else if (item === 'medbag') {
      if (!this.items.medbag) throw new Error('Le Sac de remèdes n’est pas encore débloqué.');
      const t = this.heroes[target];
      if (!t) throw new Error('Choisis un héros.');
      h.turnActions--;
      this.say('play', `${h.name} utilise le ${ITEMS.medbag.name} sur ${t.name}.`);
      this.removeStatus(t, 2);
    } else if (item === 'waterskin') {
      if (!(this.items.waterskins > 0)) throw new Error('Plus de gorgées dans l’Outre !');
      const t = this.heroes[target];
      if (!t) throw new Error('Choisis un héros à soigner.');
      this.items.waterskins--;
      h.turnActions--;
      this.say('play', `${h.name} fait boire l’${ITEMS.waterskin.name} à ${t.name}.`);
      this.healHero(t, 3);
    } else if (item === 'charm') {
      // Porte-bonheur : joue la carte du dessus de la pioche ; ses éclairs sont ignorés.
      if (!this.items.charm) throw new Error('Le Porte-bonheur n’est pas encore débloqué.');
      if (!this.refill(h)) throw new Error('Ta pioche est vide.');
      h.turnActions--;
      this.say('play', `${h.name} utilise le ${ITEMS.charm.name}.`);
      this.playRevealed(h, this.takeTop(h), { noLightning: true });
    } else {
      throw new Error('Objet inconnu');
    }
    this.playerActed();
    this.afterAction();
  }

  pass(playerId) {
    const h = this.checkTurn(playerId);
    this.say('info', `${h.name} passe.`);
    h.turnActions = 0;
    this.afterAction();
  }

  // Après chaque action d'un joueur (pour les boss qui comptent les actions, comme le Dragon de l'éther).
  playerActed() {
    if (!this.result && this.phase === 'action' && this.def.onAction) this.def.onAction(this);
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
    if (uid === TOP_OF_DRAW && c.allowTop) {
      // Déjà-vu : la carte du dessus de la pioche est révélée ; on choisit sa cible si besoin.
      if (!this.refill(h)) throw new Error('Ta pioche est vide.');
      this.choice = null;
      this.playRevealed(h, this.takeTop(h), { exile: true });
      return this.afterAction();
    }
    const inst = c.options.find((o) => o.uid === uid);
    if (!inst) throw new Error('Carte inconnue');
    this.validateTargets(h, CARDS[inst.id], targets);
    if (c.from === 'dejavu') {
      h.discard = h.discard.filter((x) => x !== inst);
    } else if (c.from === 'mask') {
      // Masque : les cartes non choisies retournent sur la pioche (même ordre) ou dessous, au choix.
      const rest = c.options.filter((o) => o !== inst);
      if (under) h.draw.unshift(...rest);
      else h.draw.push(...rest.reverse());
    }
    this.choice = null;
    const opts = c.from === 'reveal' ? c.opts : { exile: c.from === 'dejavu' };
    this.playInstance(h, inst, targets || [], opts);
    if (c.from === 'reveal' && c.then > 0) this.improvise(h, c.then);
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
          for (const t of targetsOf(e)) this.removeStatus(t, v);
          break;
        case 'shieldDown': {
          // Le plus faible bouclier encore debout perd v points, sans toucher la vie du boss.
          const types = ['melee', 'ranged', 'magic'].filter((x) => this.boss.shields[x] > 0);
          if (!types.length) { this.say('info', 'Le boss n’a plus de bouclier.'); break; }
          const t = types.reduce((b, x) => (this.boss.shields[x] < this.boss.shields[b] ? x : b));
          const n = Math.min(v, this.boss.shields[t]);
          this.boss.shields[t] -= n;
          const broke = this.boss.shields[t] === 0;
          this.say('hit', `Le bouclier ${DMG_LABEL[t]} perd ${n}${broke ? ' et se brise !' : '.'}`);
          this.fx({ kind: 'hit', dmg: t, hero: me, v: n, shield: n, life: 0, broke, support: true });
          if (broke && e.poisonIfBroken) { this.boss.poison += e.poisonIfBroken; this.say('poison', `Le boss reçoit ${e.poisonIfBroken} Poison.`); }
          if (broke && !e.silent && this.def.onShieldBroken) this.def.onShieldBroken(this, h, t);
          break;
        }
        case 'drawDiscard':
          for (const t of this.heroes) {
            this.drawCards(t, e.draw);
            for (let k = 0; k < e.discard && t.hand.length; k++) {
              const [c] = t.hand.splice(Math.floor(Math.random() * t.hand.length), 1);
              t.discard.push(c);
            }
          }
          this.say('info', `Chaque héros pioche ${e.draw} cartes et en défausse ${e.discard}.`);
          break;
        case 'pestbote': {
          // Messager de la peste : une autre carte de la main retourne sur la pioche (au hasard), puis le boss est empoisonné.
          if (!h.hand.length) { this.say('info', 'Aucune autre carte en main : le Messager de la peste est sans effet.'); break; }
          const [c] = h.hand.splice(Math.floor(Math.random() * h.hand.length), 1);
          h.draw.push(c);
          this.boss.poison += v;
          this.say('poison', `${h.name} remet « ${CARDS[c.id].name} » sur sa pioche ; le boss reçoit ${v} Poison.`);
          break;
        }
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
        case 'improvise':
          this.improvise(this.heroes[pick(e)], v);
          break;
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
        const top = this.takeTop(h);
        if (top) this.playRevealed(h, top, { exile: true });
        return;
      }
      this.choice = { hero, from, options: [...h.discard], allowTop: true };
    } else {
      const options = [];
      for (let k = 0; k < 3; k++) {
        const c = this.takeTop(h);
        if (!c) break;
        options.push(c);
      }
      if (!options.length) return;
      this.choice = { hero, from, options, allowTop: false };
    }
  }

  damageBoss(h, dmgType, v, isAttack) {
    const res = { shield: 0, life: 0, broke: false };
    // Certains boss ne peuvent pas être touchés par un type de dégâts (Dragon de l'éther en vol : pas de mêlée).
    const dodge = this.def.dodges && this.def.dodges(this, dmgType);
    if (dodge) {
      this.say('info', dodge);
      return res;
    }
    let rest = v;
    if (this.boss.shields[dmgType] > 0) {
      res.shield = Math.min(v, this.boss.shields[dmgType]);
      this.boss.shields[dmgType] -= res.shield;
      rest = SHIELD_OVERFLOW ? v - res.shield : 0;
    }
    const broke = res.shield > 0 && this.boss.shields[dmgType] === 0;
    res.broke = broke;
    this.fx({ kind: 'hit', dmg: dmgType, hero: this.heroes.indexOf(h), v, shield: res.shield, life: Math.min(rest, this.boss.life), broke, support: !isAttack });
    res.life = this.hitBossLife(rest);
    const parts = [];
    if (res.shield) parts.push(`${res.shield} au bouclier${this.boss.shields[dmgType] === 0 ? ' (détruit !)' : ''}`);
    if (res.life) parts.push(`${res.life} à la vie`);
    this.say('hit', `${v} dégâts ${DMG_LABEL[dmgType]} : ${parts.join(', ') || 'aucun effet'}.`);
    if (!this.result && this.def.onHit) this.def.onHit(this, h, dmgType, res, isAttack, v);
    if (!this.result && broke && this.def.onShieldBroken) this.def.onShieldBroken(this, h, dmgType);
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
      const limit = t.life !== undefined ? t.life : this.boss.maxLife * t.at;
      if (!this.boss.thresholdsDone.includes(i) && this.boss.life <= limit) {
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
    if (this.choice && this.choice.from === 'reveal') this.heroes[this.choice.hero].discard.push(...this.choice.options);
    this.choice = null;
    this.step = null;
    this.tie = null;
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
      step: this.step && {
        id: this.step.id,
        kind: this.step.kind,
        title: STEP_TITLES[this.step.kind],
        lines: this.log.filter((l) => l.n > this.step.since).map((l) => ({ k: l.k, m: l.m })),
      },
      tie: this.tie && { candidates: this.tie.candidates, label: this.tie.label },
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
      gauges: this.def.gauges ? this.def.gauges(this) : [],
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
          panic: h.panic,
          paralysis: h.paralysis,
          curses: h.curses.map((id) => ({ id, name: CURSES[id].name, text: CURSES[id].text, kind: CURSES[id].kind })),
          pendingCurses: h.pendingCurses.length,
          randomPlay: this.playsAtRandom(h),
          turnsLeft: h.turnsLeft,
          turnActions: h.turnActions,
          bonusTurn: h.bonusTurn,
          handCount: h.hand.length,
          drawCount: h.draw.length,
          discardCount: h.discard.length,
          exiledCount: h.exiled.length,
          raven: !!h.raven,
          ravenKeep: h.ravenKeep,
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
