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
    id: b.id, name: b.name, art: b.art, legend: b.legend, lifePerHero: b.lifePerHero,
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

function broadcast(room) {
  for (const p of room.players) {
    if (!p.socketId) continue;
    io.to(p.socketId).emit('state', {
      code: room.code,
      hostId: room.hostId,
      boss: room.boss,
      difficulty: room.difficulty,
      players: room.players.map(({ id, name, hero, cls, seat, socketId }) => ({ id, name, hero, cls, seat, online: !!socketId })),
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
    const r = { code, hostId: token, players: [], boss: 'prince', difficulty: 'advanced', game: null };
    r.players.push({ id: token, name: cleanName(name), hero: null, cls: null, seat: null, socketId: null });
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
    r.players.push({ id: token, name: cleanName(name), hero: null, cls: null, seat: null, socketId: null });
    attach(r, token);
  }));

  // Comme dans l'appli : on choisit héros et classe, puis une place au bord de la tablette.
  // seat = null renvoie le héros à l'écran de sélection.
  socket.on('pick', handle(({ hero, cls, seat }) => {
    if (!room || room.game) return;
    if (seat !== undefined) {
      if (seat === null) me.seat = null;
      else {
        const s = Number(seat);
        if (!Number.isInteger(s) || s < 0 || s >= SEATS) throw new Error('Place inconnue');
        if (room.players.some((p) => p !== me && p.seat === s)) throw new Error('Cette place est déjà prise.');
        me.seat = s;
      }
    }
    if (hero !== undefined) {
      if (hero && !HEROES[hero]) throw new Error('Héros inconnu');
      if (hero && room.players.some((p) => p !== me && p.hero === hero)) throw new Error('Ce héros est déjà pris.');
      me.hero = hero || null;
    }
    if (cls !== undefined) {
      if (cls && !CLASSES[cls]) throw new Error('Classe inconnue');
      if (cls && room.players.some((p) => p !== me && p.cls === cls)) throw new Error('Cette classe est déjà prise.');
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

  socket.on('settings', handle(({ boss, difficulty }) => {
    if (!room || room.game) return;
    if (room.hostId !== me.id) throw new Error("Seul l'hôte peut changer le boss.");
    if (boss && BOSSES[boss]) room.boss = boss;
    if (difficulty && DIFFICULTIES[difficulty]) room.difficulty = difficulty;
    broadcast(room);
  }));

  socket.on('start', handle(() => {
    if (!room) return;
    if (room.hostId !== me.id) throw new Error("Seul l'hôte peut lancer le combat.");
    if (room.players.some((p) => !p.hero || !p.cls || p.seat === null)) {
      throw new Error('Tout le monde doit choisir un héros, une classe et une place.');
    }
    // L'ordre du tour suit les places dans le sens horaire.
    const seated = [...room.players].sort((a, b) => a.seat - b.seat);
    room.game = new Game(seated, room.boss, room.difficulty);
    broadcast(room);
  }));

  socket.on('act', handle((a) => {
    if (!room || !room.game) return;
    const g = room.game;
    switch (a.type) {
      case 'starter': g.chooseStarter(me.id, a.hero); break;
      case 'play': g.playCard(me.id, a.uid, a.targets); break;
      case 'item': g.useItem(me.id, a.item, a.target); break;
      case 'pass': g.pass(me.id); break;
      case 'choose': g.choose(me.id, a.uid, a.targets); break;
      case 'discard': g.submitDiscard(me.id, a.uids); break;
      case 'giveup': g.giveUp(me.id); break;
      default: throw new Error('Action inconnue');
    }
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
