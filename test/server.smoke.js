// Test de bout en bout : démarre le serveur, connecte 2 joueurs, lance un combat et joue une carte.
// Lancer : npm run smoke

process.env.PORT = process.env.PORT || '3999';
require('../server');
const { io } = require('socket.io-client');
const assert = require('assert');

const URL = `http://localhost:${process.env.PORT}`;
const wait = (sock, ev, pred = () => true) => new Promise((resolve, reject) => {
  const t = setTimeout(() => reject(new Error(`timeout en attendant ${ev}`)), 3000);
  const h = (data) => { if (pred(data)) { clearTimeout(t); sock.off(ev, h); resolve(data); } };
  sock.on(ev, h);
});

(async () => {
  const a = io(URL);
  const b = io(URL);
  await Promise.all([wait(a, 'catalog'), wait(b, 'catalog')]);

  a.emit('create', { token: 'A', name: 'Lisa' });
  const { code } = await wait(a, 'joined');
  b.emit('join', { token: 'B', name: 'Tom', code });
  const joined = await wait(a, 'state', (s) => s.players.length === 2);
  // Chacun est assis en arrivant, dans le sens des aiguilles d'une montre.
  assert.deepStrictEqual(joined.players.map((p) => p.seat), [0, 1], 'places attribuées à l’arrivée');

  // Campagne : le Prince est verrouillé tant que M. Pantin n'est pas battu.
  a.emit('settings', { boss: 'prince' });
  assert.match(await wait(a, 'oops'), /débloque/);

  a.emit('pick', { hero: 'dwarf' });
  b.emit('pick', { hero: 'dwarf' });
  assert.match(await wait(b, 'oops'), /déjà pris/);
  b.emit('pick', { hero: 'elf', cls: 'mage' });
  a.emit('pick', { cls: 'warrior' });
  await wait(a, 'state', (s) => s.players.every((p) => p.hero && p.cls));

  // Changer de place : seulement vers une place libre.
  a.emit('pick', { seat: 5 });
  await wait(b, 'state', (s) => s.players.find((p) => p.id === 'A').seat === 5);
  b.emit('pick', { seat: 5 });
  assert.match(await wait(b, 'oops'), /déjà prise/);
  b.emit('pick', { seat: 2 });
  await wait(a, 'state', (s) => s.players.find((p) => p.id === 'B').seat === 2);

  b.emit('start');
  assert.match(await wait(b, 'oops'), /hôte/);
  a.emit('start');
  const sa = await wait(a, 'state', (s) => s.game);
  assert.deepStrictEqual(sa.game.heroes.map((h) => h.name), ['Tom', 'Lisa'], "l'ordre du tour suit les places (2 avant 5)");
  assert.strictEqual(sa.game.heroes[1].hand.length, 6, 'Lisa voit sa main');
  assert.strictEqual(sa.game.heroes[0].hand, null, "Lisa ne voit pas la main de Tom");

  // Phase 1 affichée au centre : un joueur clique « Continuer » (le tutoriel n'a pas de boucliers au tour 1).
  assert.strictEqual(sa.game.step.kind, 'planning', 'le combat commence par la planification');
  b.emit('act', { type: 'continue', step: sa.game.step.id });
  await wait(b, 'state', (s) => s.game.phase === 'action' && !s.game.step);

  b.emit('act', { type: 'starter', hero: 0 });
  const sb = await wait(b, 'state', (s) => s.game.current === 0);
  const card = sb.game.heroes[0].hand[0];
  b.emit('act', { type: 'play', uid: card.uid, targets: [0] });
  const after = await wait(a, 'state', (s) => s.game.heroes[0].play.length === 1);
  assert.strictEqual(after.game.heroes[0].play[0].uid, card.uid);

  // Reconnexion : Tom recharge la page et retrouve sa partie.
  b.disconnect();
  const b2 = io(URL);
  await wait(b2, 'catalog');
  b2.emit('join', { token: 'B', code });
  const back = await wait(b2, 'state');
  assert.ok(back.game && back.game.heroes[0].mine, 'Tom retrouve son héros après reconnexion');

  console.log('Test serveur OK ✔ (salon', code + ')');
  a.close(); b2.close();
  process.exit(0);
})().catch((e) => { console.error(e); process.exit(1); });
