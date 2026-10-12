// Captures d'écran de l'interface avec Edge en mode headless (accueil, salon, combat).
// Lancer : node test/screenshots.js [dossier de sortie]   (le serveur doit tourner sur le port 3000)

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
  const ctxA = await browser.createBrowserContext();
  const ctxB = await browser.createBrowserContext();
  const a = await ctxA.newPage();
  const b = await ctxB.newPage();
  const c = await (await browser.createBrowserContext()).newPage();
  for (const p of [a, b, c]) await p.setViewport({ width: 1440, height: 1000 });

  await a.goto(URL, { waitUntil: 'networkidle0' });
  await wait(800);
  await a.screenshot({ path: path.join(OUT, '1-accueil.png') });

  await a.type('#name', 'Lisa');
  await a.click('[data-action="create"]');
  await a.waitForSelector('.code');
  const code = await a.$eval('.code', (el) => el.textContent.trim());

  await b.goto(URL, { waitUntil: 'networkidle0' });
  await b.type('#name', 'Tom');
  await b.type('#code', code);
  await b.click('[data-action="join"]');
  await b.waitForSelector('.seat-slot');
  await c.goto(URL, { waitUntil: 'networkidle0' });
  await c.type('#name', 'Sam');
  await c.type('#code', code);
  await c.click('[data-action="join"]');
  await c.waitForSelector('.seat-slot');

  // Chacun clique sur une place vide, choisit héros et classe, puis s'assoit.
  const sitDown = async (page, seat, hero, cls) => {
    await page.click(`[data-action="seat"][data-seat="${seat}"]`); await wait(300);
    await page.click(`[data-kind="hero"][data-id="${hero}"]`); await wait(300);
    await page.click(`[data-kind="cls"][data-id="${cls}"]`); await wait(300);
    await page.click('[data-action="sit"]'); await wait(400);
  };
  await sitDown(a, 0, 'dwarf', 'warrior');
  await b.click('[data-action="seat"][data-seat="3"]'); await wait(300);
  await b.click('[data-kind="hero"][data-id="elf"]'); await wait(300);
  await b.screenshot({ path: path.join(OUT, '2b-selection.png') });
  await b.click('[data-kind="cls"][data-id="rogue"]'); await wait(300);
  await b.click('[data-action="sit"]'); await wait(400);
  await sitDown(c, 6, 'troll', 'mage');
  await wait(400);
  await a.screenshot({ path: path.join(OUT, '2-salon.png'), fullPage: true });

  await a.click('[data-action="start"]');
  await a.waitForSelector('.crests');
  await a.click('[data-action="starter"][data-idx="0"]');
  await wait(800);
  await a.screenshot({ path: path.join(OUT, '3-combat.png'), fullPage: true });

  // Joue une carte pour voir un état en cours de partie.
  const uid = await a.$eval('.hand .card.clickable', (el) => el.dataset.uid).catch(() => null);
  if (uid) {
    await a.click(`.hand .card[data-uid="${uid}"]`);
    await wait(400);
    const targeting = await a.$('.hero.targetable');
    if (targeting) { await targeting.click(); await wait(400); }
  }
  await wait(600);
  await a.screenshot({ path: path.join(OUT, '4-combat-en-cours.png'), fullPage: true });

  await b.setViewport({ width: 420, height: 900 });
  await wait(500);
  await b.screenshot({ path: path.join(OUT, '5-mobile.png'), fullPage: true });

  await browser.close();
  console.log('Captures dans', OUT);
})().catch((e) => { console.error(e); process.exit(1); });
