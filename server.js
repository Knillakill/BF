// Serveur multijoueur : salons avec code, choix des héros, puis combat géré par src/engine.js.

const path = require('path');
const http = require('http');
const express = require('express');
const { Server } = require('socket.io');
const { Game } = require('./src/engine');
const { CARDS, HEROES, CLASSES, ITEMS } = require('./src/data/cards');
const { BOSSES, DIFFICULTIES } = require('./src/data/bosses');

const PORT = process.env.PORT || 3000;
const MAX_PLAYERS = 4;
// 8 places sur les bords de la tablette, numérotées dans le sens horaire (voir public/app.js).
const SEATS = 8;

const app = express();
// Pas de cache navigateur pour la page, le CSS et le JS : chaque mise à jour s'affiche tout de suite.
app.use(express.static(path.join(__dirname, 'public'), {
  setHeaders(res, file) {
    if (/\.(html|css|js)$/.test(file)) res.setHeader('Cache-Control', 'no-cache');
  },
}));
const server = http.createServer(app);
const io = new Server(server);

// Données publiques envoyées aux clients (sans les fonctions des boss).
const catalog = {
  cards: CARDS,
  heroes: HEROES,
  classes: CLASSES,
  items: ITEMS,
  difficulties: DIFFICULTIES,
  bosses: Object.fromEntries(Object.values(BOSSES).map((b) => [b.id, {
    id: b.id, name: b.name, art: b.art, legend: b.legend, lifePerHero: b.lifePerHero, order: b.order,
    enrageRound: b.enrageRound, statuses: b.statuses, starterOnly: !!b.starterOnly,
  }])),
};

const rooms = new Map(); // code -> { code, hostId, players: [{ id, name, hero, cls, socketId }], boss, difficulty, game }

function newCode() {
  const letters = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  let code;
  do {
    code = Array.from({ length: 4 }, () => letters[Math.floor(Math.random() * letters.length)]).join('');
  } while (rooms.has(code));
  return code;
}

function cleanName(name) {
  return String(name || '').trim().slice(0, 20) || 'Héros';
}

// Progression : nombre de boss vaincus dans l'ordre de la campagne (0 = rien, 1 = M. Pantin, 2 = le Prince…).
// Les étoiles de butin commencent après le Prince : ★1 = Prince vaincu.
const starsOf = (room) => Math.max(0, room.beaten - 1);

// Place attribuée en entrant dans le salon : la première libre après celle du dernier arrivé,
// dans le sens des aiguilles d'une montre (le premier joueur prend la place 0).
function nextSeat(room) {
  const taken = new Set(room.players.map((p) => p.seat).filter((s) => s !== null && s !== undefined));
  const last = [...room.players].reverse().find((p) => p.seat !== null && p.seat !== undefined);
  const start = last ? last.seat + 1 : 0;
  for (let k = 0; k < SEATS; k++) {
    const s = (start + k) % SEATS;
    if (!taken.has(s)) return s;
  }
  return null;
}

// Après une victoire contre le boss suivant de la campagne, la progression avance.
function progress(room) {
  const g = room.game;
  if (!g || g.result !== 'win' || g.progressed) return;
  g.progressed = true;
  if (BOSSES[room.boss].order !== room.beaten) return;
  room.beaten++;
  // Le boss suivant de la campagne est proposé d'office.
  const next = Object.values(BOSSES).find((b) => b.order === room.beaten);
  if (next) room.boss = next.id;
}

// Niveaux de butin (★) qu'un joueur n'a pas encore choisis.
const missingLoot = (room, p) => {
  const have = new Set((p.loot || []).map((id) => CARDS[id].loot));
  return Array.from({ length: starsOf(room) }, (_, k) => k + 1).filter((lvl) => !have.has(lvl));
};

function broadcast(room) {
  for (const p of room.players) {
    if (!p.socketId) continue;
    io.to(p.socketId).emit('state', {
      code: room.code,
      hostId: room.hostId,
      boss: room.boss,
      difficulty: room.difficulty,
      beaten: room.beaten,
      stars: starsOf(room),
      players: room.players.map(({ id, name, hero, cls, seat, loot, removed, socketId }) => ({ id, name, hero, cls, seat, loot, removed, online: !!socketId })),
      game: room.game ? room.game.view(p.id) : null,
    });
  }
}

io.on('connection', (socket) => {
  socket.emit('catalog', catalog);
  let room = null;
  let me = null;

  const attach = (r, playerId) => {
    room = r;
    me = r.players.find((p) => p.id === playerId);
    me.socketId = socket.id;
    socket.emit('joined', { code: r.code });
    broadcast(r);
  };

  const handle = (fn) => (...args) => {
    try {
      fn(...args);
    } catch (err) {
      socket.emit('oops', err.message);
    }
  };

  socket.on('create', handle(({ token, name }) => {
    if (!token) throw new Error('Identifiant manquant');
    const code = newCode();
    const r = { code, hostId: token, players: [], boss: 'puppet', difficulty: 'advanced', beaten: 0, game: null }; // la campagne commence par le tutoriel
    r.players.push({ id: token, name: cleanName(name), hero: null, cls: null, seat: nextSeat(r), loot: [], removed: [], socketId: null });
    rooms.set(code, r);
    attach(r, token);
  }));

  socket.on('join', handle(({ token, name, code }) => {
    const r = rooms.get(String(code || '').toUpperCase().trim());
    if (!r) throw new Error('Salon introuvable. Vérifie le code.');
    const existing = r.players.find((p) => p.id === token);
    if (existing) {
      if (name) existing.name = cleanName(name);
      return attach(r, token);
    }
    if (r.game) throw new Error('Un combat est déjà en cours dans ce salon.');
    if (r.players.length >= MAX_PLAYERS) throw new Error('Le salon est complet (4 joueurs).');
    r.players.push({ id: token, name: cleanName(name), hero: null, cls: null, seat: nextSeat(r), loot: [], removed: [], socketId: null });
    attach(r, token);
  }));

  // Chacun est assis d'office en entrant ; il choisit son héros et sa classe, et peut changer de place libre.
  socket.on('pick', handle(({ hero, cls, seat }) => {
    if (!room || room.game) return;
    if (seat !== undefined && seat !== null) {
      const s = Number(seat);
      if (!Number.isInteger(s) || s < 0 || s >= SEATS) throw new Error('Place inconnue');
      if (room.players.some((p) => p !== me && p.seat === s)) throw new Error('Cette place est déjà prise.');
      me.seat = s;
    }
    if (hero !== undefined) {
      if (hero && !HEROES[hero]) throw new Error('Héros inconnu');
      if (hero && room.players.some((p) => p !== me && p.hero === hero)) throw new Error('Ce héros est déjà pris.');
      if (me.hero !== (hero || null)) me.removed = [];
      me.hero = hero || null;
    }
    if (cls !== undefined) {
      if (cls && !CLASSES[cls]) throw new Error('Classe inconnue');
      if (cls && room.players.some((p) => p !== me && p.cls === cls)) throw new Error('Cette classe est déjà prise.');
      if (me.cls !== (cls || null)) me.removed = [];
      me.cls = cls || null;
    }
    broadcast(room);
  }));

  socket.on('kick', handle(({ id }) => {
    if (!room || room.game) return;
    if (room.hostId !== me.id) throw new Error("Seul l'hôte peut retirer un joueur.");
    if (id === me.id) return;
    room.players = room.players.filter((p) => p.id !== id);
    broadcast(room);
  }));

  socket.on('settings', handle(({ boss, difficulty, beaten }) => {
    if (!room || room.game) return;
    if (room.hostId !== me.id) throw new Error("Seul l'hôte peut changer le boss.");
    if (boss && BOSSES[boss]) {
      // Campagne : un boss n'est accessible qu'une fois le précédent vaincu.
      if (BOSSES[boss].order > room.beaten) throw new Error('Ce boss se débloque en battant le précédent.');
      room.boss = boss;
    }
    if (difficulty && DIFFICULTIES[difficulty]) room.difficulty = difficulty;
    // Réglage manuel de la progression : réservé aux scripts de test (BF_DEV=1).
    if (process.env.BF_DEV && Number.isInteger(beaten) && beaten >= 0 && beaten <= Object.keys(BOSSES).length) {
      room.beaten = beaten;
      if (BOSSES[room.boss].order > beaten) room.boss = 'puppet';
      // Le butin au-delà des étoiles débloquées n'est plus autorisé.
      for (const p of room.players) {
        p.loot = (p.loot || []).filter((id) => CARDS[id].loot <= starsOf(room));
        p.removed = (p.removed || []).slice(0, p.loot.length);
      }
    }
    broadcast(room);
  }));

  // Préparation du paquet : 1 butin par étoile débloquée, et autant de cartes d'action retirées (20 cartes minimum).
  socket.on('loadout', handle(({ loot = [], removed = [] }) => {
    if (!room || room.game) return;
    const stars = starsOf(room);
    const levels = new Set();
    for (const id of loot) {
      const c = CARDS[id];
      if (!c || !c.loot || c.loot > stars) throw new Error('Butin non débloqué.');
      if (levels.has(c.loot)) throw new Error('Un seul butin par niveau d’étoile.');
      // Chaque carte de butin n'existe qu'en un exemplaire (livret p.12).
      if (room.players.some((p) => p !== me && (p.loot || []).includes(id))) throw new Error('Un autre joueur a déjà pris ce butin.');
      levels.add(c.loot);
    }
    if (!me.hero || !me.cls) throw new Error('Choisis d’abord ton héros et ta classe.');
    const deck = [...HEROES[me.hero].cards, ...HEROES[me.hero].advanced, ...CLASSES[me.cls].cards, ...CLASSES[me.cls].advanced];
    if (removed.length > loot.length) throw new Error('Tu peux retirer une carte par butin ajouté.');
    for (const id of removed) {
      const k = deck.indexOf(id);
      if (k < 0) throw new Error('Carte absente de ton paquet.');
      deck.splice(k, 1);
    }
    me.loot = [...loot];
    me.removed = [...removed];
    broadcast(room);
  }));

  socket.on('start', handle(() => {
    if (!room) return;
    if (room.hostId !== me.id) throw new Error("Seul l'hôte peut lancer le combat.");
    if (room.players.length < 2) throw new Error('Il faut au moins 2 joueurs pour lancer un combat (2 à 4).');
    // Après chaque boss vaincu (à partir du Prince), chacun ajoute une carte de butin à son paquet.
    const noLoot = BOSSES[room.boss].starterOnly ? [] : room.players.filter((p) => missingLoot(room, p).length);
    if (noLoot.length) throw new Error(`Butin à choisir avant le combat : ${noLoot.map((p) => p.name).join(', ')}.`);
    if (room.players.some((p) => !p.hero || !p.cls || p.seat === null)) {
      throw new Error('Tout le monde doit choisir un héros, une classe et une place.');
    }
    // L'ordre du tour suit les places dans le sens horaire.
    const seated = [...room.players].sort((a, b) => a.seat - b.seat);
    room.game = new Game(seated, room.boss, room.difficulty, { stars: starsOf(room) });
    broadcast(room);
  }));

  socket.on('act', handle((a) => {
    if (!room || !room.game) return;
    const g = room.game;
    switch (a.type) {
      case 'starter': g.chooseStarter(me.id, a.hero); break;
      case 'vote': g.voteStarter(me.id, a.hero, room.players.filter((p) => p.socketId).map((p) => p.id)); break;
      case 'play': g.playCard(me.id, a.uid, a.targets); break;
      case 'item': g.useItem(me.id, a.item, a.target); break;
      case 'pass': g.pass(me.id); break;
      case 'choose': g.choose(me.id, a.uid, a.targets, !!a.under); break;
      case 'discard': g.submitDiscard(me.id, a.uids); break;
      case 'continue': g.continueStep(me.id, a.step); break;
      case 'tie': g.resolveTie(me.id, a.hero); break;
      case 'raven': g.setRavenKeep(me.id, a.keep); break;
      case 'giveup': g.giveUp(me.id); break;
      default: throw new Error('Action inconnue');
    }
    progress(room);
    broadcast(room);
  }));

  socket.on('lobby', handle(() => {
    if (!room || !room.game || !room.game.result) return;
    room.game = null;
    broadcast(room);
  }));

  socket.on('leave', handle(() => {
    if (!room) return;
    if (!room.game) room.players = room.players.filter((p) => p !== me);
    else me.socketId = null;
    if (room.hostId === me.id && room.players[0]) room.hostId = room.players[0].id;
    if (room.players.length === 0) rooms.delete(room.code);
    else broadcast(room);
    room = null;
    me = null;
  }));

  socket.on('disconnect', () => {
    if (!room || !me) return;
    me.socketId = null;
    broadcast(room);
    // Salon abandonné : on le supprime au bout d'une heure sans personne.
    const r = room;
    setTimeout(() => {
      if (rooms.get(r.code) === r && r.players.every((p) => !p.socketId)) rooms.delete(r.code);
    }, 60 * 60 * 1000);
  });
});

server.listen(PORT, () => {
  console.log(`Boss Fighters en ligne : http://localhost:${PORT}`);
});
