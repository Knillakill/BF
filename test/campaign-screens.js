// Captures de la campagne : salon après le Prince (butin ★1) et combat contre la Chasseuse d'âmes.
// Lancer : node test/campaign-screens.js [dossier]   (le serveur doit tourner sur le port 3000 avec BF_DEV=1)

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
const click = (p, sel) => p.evaluate((s) => document.querySelector(s)?.click(), sel);

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
  await click(a, '[data-action="create"]');
  await a.waitForSelector('.code');
  const code = await a.$eval('.code', (el) => el.textContent.trim());
  await b.goto(URL, { waitUntil: 'networkidle0' });
  await b.type('#name', 'Tom');
  await b.type('#code', code);
  await click(b, '[data-action="join"]');
  await b.waitForSelector('.seat-slot');

  const sit = async (p, seat, hero, cls) => {
    await click(p, `[data-kind="hero"][data-id="${hero}"]`); await wait(300);
    await click(p, `[data-kind="cls"][data-id="${cls}"]`); await wait(300);
    await click(p, '[data-action="close-modal"]'); await wait(400);
    if (seat !== undefined) { await p.evaluate((s) => document.querySelector(`[data-action="seat"][data-seat="${s}"]`)?.click(), seat); await wait(300); }
  };
  await sit(a, 0, 'dwarf', 'warrior');
  await sit(b, 4, 'elf', 'rogue');

  // Campagne : le Prince est vaincu (★1), on choisit la Chasseuse d'âmes et un butin.
  // Progression forcée (Prince vaincu) : nécessite BF_DEV=1 côté serveur.
  await a.evaluate(() => socket.emit('settings', { beaten: 2 })); await wait(400);
  await click(a, '[data-action="boss"][data-id="huntress"]'); await wait(400);
  await click(a, '[data-action="loot"][data-id="blade_of_wind"]'); await wait(400);
  await click(a, '[data-action="remove-card"][data-id="tunnel_blaster"]'); await wait(500);
  await a.screenshot({ path: path.join(OUT, 'campagne-salon.png'), fullPage: true });

  await click(a, '[data-action="start"]');
  await a.waitForSelector('.crests');
  // Phases 1 et 2 affichées au centre : on clique « Continuer » jusqu'au vote.
  for (let k = 0; k < 3 && await a.$('[data-action="continue"]'); k++) { await a.click('[data-action="continue"]'); await wait(400); }
  for (const p of pages) await click(p, '[data-action="vote"][data-idx="0"]');
  await wait(800);
  await a.screenshot({ path: path.join(OUT, 'campagne-chasseuse.png') });
  await browser.close();
  console.log('Captures dans', OUT);
})().catch((e) => { console.error(e); process.exit(1); });
