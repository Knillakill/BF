// Captures des effets visuels : joue une carte de chaque type et photographie l'animation en cours.
// Lancer : node test/fx-screens.js [dossier]   (le serveur doit tourner sur le port 3000)

const path = require('path');
const fs = require('fs');
const puppeteer = require('puppeteer-core');

const EDGE = [
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
  'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
].find((p) => fs.existsSync(p));
const OUT = process.argv[2] || path.join(__dirname, '..', 'screenshots');
const URL = 'http://localhost:3000';
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const browser = await puppeteer.launch({ executablePath: EDGE, headless: true, args: ['--no-sandbox'] });
  const pages = [];
  for (let k = 0; k < 2; k++) {
    const p = await (await browser.createBrowserContext()).newPage();
    await p.setViewport({ width: 1366, height: 768 });
    pages.push(p);
  }
  const [a, b] = pages;
  await a.goto(URL, { waitUntil: 'networkidle0' });
  await a.type('#name', 'Lisa');
  await a.click('[data-action="create"]');
  await a.waitForSelector('.code');
  const code = await a.$eval('.code', (el) => el.textContent.trim());
  await b.goto(URL, { waitUntil: 'networkidle0' });
  await b.type('#name', 'Tom');
  await b.type('#code', code);
  await b.click('[data-action="join"]');
  await b.waitForSelector('.seat-slot');

  const sit = async (p, seat, hero, cls) => {
    await p.click(`[data-kind="hero"][data-id="${hero}"]`); await wait(250);
    await p.click(`[data-kind="cls"][data-id="${cls}"]`); await wait(250);
    await p.click('[data-action="close-modal"]'); await wait(350);
    if (seat !== undefined) { await p.evaluate((s) => document.querySelector(`[data-action="seat"][data-seat="${s}"]`)?.click(), seat); await wait(300); }
  };
  await sit(a, 0, 'dwarf', 'warrior');
  await sit(b, 4, 'elf', 'mage');
  await a.click('[data-action="start"]');
  await a.waitForSelector('.crests');
  // Phases 1 et 2 affichées au centre : on clique « Continuer » jusqu'au vote.
  for (let k = 0; k < 3 && await a.$('[data-action="continue"]'); k++) { await a.click('[data-action="continue"]'); await wait(400); }
  for (const p of pages) await p.evaluate(() => document.querySelector('[data-action="vote"][data-idx="0"]')?.click()); // tout le monde vote pour le premier héros
  await wait(600);

  // Le joueur dont c'est le tour joue une carte du type voulu ; on photographie l'écran de Lisa.
  const wanted = ['melee', 'ranged', 'magic', 'protect'];
  for (const type of wanted) {
    let played = false;
    for (let tries = 0; tries < 6 && !played; tries++) {
      for (const p of pages) {
        const uid = await p.evaluate((t) => {
          const g = state.game;
          const me = g.heroes.find((h) => h.mine);
          if (!me || g.heroes[g.current] !== me || g.awaitingStarter) return null;
          const c = me.hand.find((x) => {
            const e = catalog.cards[x.id].effects[0];
            return e && (t === 'protect' ? e.t === 'protect' : e.t === 'attack' && e.dmg === t);
          });
          return c ? c.uid : null;
        }, type);
        if (uid) {
          await p.evaluate((u) => document.querySelector(`.hand .card[data-uid="${u}"]`)?.click(), uid);
          await wait(200);
          await p.evaluate(() => document.querySelector('[data-action="target"]')?.click());
          played = true;
          break;
        }
      }
      if (!played) {
        // Personne n'a la bonne carte sous la main : le joueur actif passe.
        for (const p of pages) {
          const clicked = await p.evaluate(() => { const b = document.querySelector('[data-action="pass"]'); if (b) b.click(); return !!b; });
          if (clicked) break;
        }
        await wait(400);
      }
    }
    if (!played) { console.log('Pas de carte', type, 'disponible'); continue; }
    for (const ms of [250, 600]) {
      await wait(ms === 250 ? 250 : 350);
      await a.screenshot({ path: path.join(OUT, `fx-${type}-${ms}.png`) });
    }
    await wait(1600);
  }
  // Tout le monde passe jusqu'à l'attaque du boss, puis on photographie son animation.
  for (let k = 0; k < 12; k++) {
    const phase = await a.evaluate(() => state.game.phase);
    if (phase !== 'action') break;
    for (const p of pages) {
      const clicked = await p.evaluate(() => { const b = document.querySelector('[data-action="pass"]'); if (b) b.click(); return !!b; });
      if (clicked) break;
    }
    await wait(250);
  }
  for (const ms of [500, 1000, 1600, 2300]) {
    await wait(ms === 500 ? 500 : 600);
    await a.screenshot({ path: path.join(OUT, `fx-boss-${ms}.png`) });
  }
  await browser.close();
  console.log('Captures dans', OUT);
})().catch((e) => { console.error(e); process.exit(1); });
