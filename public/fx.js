// Effets visuels et sonores : cartes jouées (mêlée, distance, magie, protection), attaques du boss,
// dégâts, soins et capacités du boss.
// Le serveur publie des événements numérotés (game.events) ; chaque navigateur rejoue les nouveaux.
// Les effets sont dessinés dans un calque fixe (#fx) au-dessus de la page, pour survivre aux re-rendus.

const fxLayer = document.createElement('div');
fxLayer.id = 'fx';
document.body.appendChild(fxLayer);

const reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
let lastFxId = null;

// Appelé à chaque nouvel état : ne joue que les événements jamais vus.
function handleFx(g) {
  if (!g) { lastFxId = null; return; }
  const events = g.events || [];
  const max = events.length ? events[events.length - 1].id : 0;
  if (lastFxId === null || max < lastFxId) { lastFxId = max; return; } // première vue ou nouveau combat : on ne rejoue pas l'historique
  const fresh = events.filter((e) => e.id > lastFxId);
  lastFxId = max;
  // File d'attente : chaque effet attend la fin du précédent, même s'ils arrivent dans plusieurs états.
  for (const e of fresh) {
    const start = Math.max(Date.now(), fxQueueEnd);
    fxQueueEnd = start + (FX_DURATION[e.kind] || 380);
    setTimeout(() => playFx(e, latestGame || g), start - Date.now());
  }
  latestGame = g;
}

// Temps laissé à chaque effet avant le suivant (ms).
const FX_DURATION = { hit: 420, protect: 420, bossAttack: 650, hurt: 380, heal: 320, ability: 1100, curse: 450, curseReveal: 700 };
let fxQueueEnd = 0;
let latestGame = null;

function geometry(g) {
  const screen = document.querySelector('.screen');
  if (!screen) return null;
  const r = screen.getBoundingClientRect();
  const seatPoint = (i) => {
    const el = document.querySelector(`[data-hero="${i}"]`);
    if (!el) return { x: r.left + r.width / 2, y: r.bottom };
    const b = el.getBoundingClientRect();
    return { x: b.left + b.width / 2, y: b.top + Math.min(b.height / 2, 40) };
  };
  return { r, seatPoint, boss: { x: r.left + r.width * 0.5, y: r.top + r.height * 0.42 } };
}

function spawn(cls, x, y, html = '') {
  const el = document.createElement('div');
  el.className = `fx ${cls}`;
  el.style.left = `${x}px`;
  el.style.top = `${y}px`;
  el.innerHTML = html;
  fxLayer.appendChild(el);
  return el;
}

const done = (el, ms) => setTimeout(() => el.remove(), ms);

function shake() {
  if (reduceMotion) return;
  const t = document.querySelector('.tablet');
  if (!t) return;
  t.classList.remove('shake');
  void t.offsetWidth; // relance l'animation
  t.classList.add('shake');
  setTimeout(() => t.classList.remove('shake'), 450);
}

// Projectile qui part de la place du joueur et vole jusqu'au boss.
function fly(cls, from, to, ms, html = '') {
  const el = spawn(cls, from.x, from.y, html);
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const angle = (Math.atan2(dy, dx) * 180) / Math.PI;
  el.style.setProperty('--angle', `${angle}deg`);
  const anim = el.animate(
    [
      { transform: `translate(-50%, -50%) rotate(${angle}deg) scale(.6)`, opacity: 0 },
      { transform: `translate(-50%, -50%) rotate(${angle}deg) scale(1)`, opacity: 1, offset: 0.15 },
      { transform: `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px)) rotate(${angle}deg) scale(1)`, opacity: 1 },
    ],
    { duration: ms, easing: 'cubic-bezier(.45,.05,.8,.6)', fill: 'forwards' },
  );
  anim.onfinish = () => el.remove();
}

function floatNumber(text, cls, at, delay = 0) {
  setTimeout(() => {
    const jitter = (Math.random() - 0.5) * 80;
    const el = spawn(`num ${cls}`, at.x + jitter, at.y - 10, text);
    done(el, 1300);
  }, delay);
}

function damageNumbers(e, at, delay) {
  if (e.shield) floatNumber(`🛡 -${e.shield}`, 'num-shield', { x: at.x, y: at.y + 40 }, delay);
  if (e.broke) floatNumber('Bouclier brisé !', 'num-broke', { x: at.x, y: at.y - 30 }, delay + 120);
  if (e.life) floatNumber(`-${e.life}`, `num-life num-${e.dmg}`, at, delay + 60);
  if (!e.shield && !e.life) floatNumber('0', 'num-shield', at, delay);
}

function playMelee(e, geo) {
  Sfx.play('slash');
  const scale = e.support ? 0.75 : 1;
  const el = spawn('slash', geo.boss.x, geo.boss.y, `
    <svg viewBox="0 0 300 300" style="transform:scale(${scale})">
      <path class="cut c1" d="M40 70 L260 230" />
      <path class="cut c2" d="M70 40 L230 270" />
      ${e.v >= 4 ? '<path class="cut c3" d="M260 80 L50 210" />' : ''}
    </svg>`);
  done(el, 900);
  setTimeout(shake, 120);
  damageNumbers(e, geo.boss, 200);
}

function playRanged(e, geo) {
  Sfx.play('arrow');
  const from = geo.seatPoint(e.hero);
  const arrows = e.support ? 1 : Math.min(3, Math.max(1, Math.ceil(e.v / 2)));
  for (let k = 0; k < arrows; k++) {
    const to = { x: geo.boss.x + (k - (arrows - 1) / 2) * 34, y: geo.boss.y + (k % 2) * 16 };
    setTimeout(() => fly('arrow', from, to, 420, '<span class="shaft"></span><span class="head"></span><span class="fletch"></span>'), k * 90);
  }
  setTimeout(() => {
    const burst = spawn('impact impact-ranged', geo.boss.x, geo.boss.y);
    done(burst, 700);
    damageNumbers(e, geo.boss, 0);
  }, 420 + (arrows - 1) * 90);
}

function playMagic(e, geo) {
  Sfx.play('magic');
  const from = geo.seatPoint(e.hero);
  fly(`orb ${e.support ? 'small' : ''}`, from, geo.boss, 600, '<span class="core"></span>');
  setTimeout(() => {
    const rune = spawn('rune', geo.boss.x, geo.boss.y, '<span class="ring r1"></span><span class="ring r2"></span><span class="flash"></span>');
    done(rune, 1000);
    for (let k = 0; k < 10; k++) {
      const a = (k / 10) * Math.PI * 2;
      const sp = spawn('spark', geo.boss.x, geo.boss.y);
      sp.animate(
        [{ transform: 'translate(-50%, -50%) scale(1)', opacity: 1 },
          { transform: `translate(calc(-50% + ${Math.cos(a) * 120}px), calc(-50% + ${Math.sin(a) * 120}px)) scale(.2)`, opacity: 0 }],
        { duration: 700, easing: 'ease-out', fill: 'forwards' },
      ).onfinish = () => sp.remove();
    }
    damageNumbers(e, geo.boss, 0);
  }, 600);
}

function playProtect(e, geo) {
  Sfx.play('shield');
  const at = geo.seatPoint(e.target);
  if (e.hero !== e.target) {
    fly('glint', geo.seatPoint(e.hero), at, 380);
  }
  setTimeout(() => {
    const dome = spawn('dome', at.x, at.y, `<span class="dome-shell"></span><i class="ic" style="--i:url(icons/protect.svg)"></i>`);
    done(dome, 1300);
    floatNumber(`🛡 +${e.v}`, 'num-protect', { x: at.x, y: at.y - 50 }, 150);
  }, e.hero !== e.target ? 380 : 0);
}

// Le boss frappe un héros : l'écran rougit, des crocs volent vers le héros, griffures et dégâts.
function playBossAttack(e, geo) {
  Sfx.play('bossAttack');
  const r = geo.r;
  const flash = spawn('boss-flash', r.left + r.width / 2, r.top + r.height / 2);
  flash.style.width = `${r.width}px`;
  flash.style.height = `${r.height}px`;
  done(flash, 600);
  const at = geo.seatPoint(e.target);
  fly('fang-shot', geo.boss, at, 380, '<i class="ic" style="--i:url(icons/fangs.svg)"></i>');
  setTimeout(() => {
    const claw = spawn('claw', at.x, at.y, `
      <svg viewBox="0 0 120 120"><path class="cut" d="M20 15 L60 105" /><path class="cut c2" d="M45 10 L85 100" /><path class="cut c3" d="M70 15 L105 90" /></svg>`);
    done(claw, 800);
    hitCard(e.target);
    floatNumber(`-${e.v}`, 'num-life', at);
    if (e.poison) floatNumber(`☠ +${e.poison}`, 'num-poison', { x: at.x + 50, y: at.y - 20 }, 200);
  }, 380);
}

function hitCard(i) {
  const el = document.querySelector(`[data-hero="${i}"]`);
  if (!el || reduceMotion) return;
  el.classList.remove('hit');
  void el.offsetWidth;
  el.classList.add('hit');
  setTimeout(() => el.classList.remove('hit'), 500);
}

// Autres dégâts : poison (bulles vertes), capacités et contrecoups (éclat rouge).
function playHurt(e, geo) {
  const at = geo.seatPoint(e.target);
  const isPoison = /poison/i.test(e.why);
  Sfx.play(isPoison ? 'poison' : 'hurt');
  if (isPoison) {
    for (let k = 0; k < 7; k++) {
      const b = spawn('bubble', at.x + (Math.random() - 0.5) * 70, at.y + 10);
      b.animate([{ transform: 'translate(-50%, -50%) scale(.4)', opacity: 1 },
        { transform: `translate(-50%, calc(-50% - ${50 + Math.random() * 40}px)) scale(1.1)`, opacity: 0 }],
      { duration: 700 + Math.random() * 300, delay: k * 50, easing: 'ease-out', fill: 'forwards' }).onfinish = () => b.remove();
    }
  } else {
    const burst = spawn('impact impact-hurt', at.x, at.y);
    done(burst, 600);
  }
  hitCard(e.target);
  floatNumber(`-${e.v}`, isPoison ? 'num-poison' : 'num-life', at);
}

function playHeal(e, geo) {
  Sfx.play('heal');
  const at = geo.seatPoint(e.target);
  for (let k = 0; k < 6; k++) {
    const sp = spawn('heal-spark', at.x + (Math.random() - 0.5) * 80, at.y + 15, '+');
    sp.animate([{ transform: 'translate(-50%, -50%)', opacity: 1 },
      { transform: `translate(-50%, calc(-50% - ${40 + Math.random() * 40}px))`, opacity: 0 }],
    { duration: 800, delay: k * 60, easing: 'ease-out', fill: 'forwards' }).onfinish = () => sp.remove();
  }
  floatNumber(`+${e.v}`, 'num-heal', at, 100);
}

// Capacité du boss : grand bandeau sur l'écran du boss.
function playAbility(e, geo) {
  Sfx.play('ability');
  const r = geo.r;
  const el = spawn(`ab-banner ab-${e.abKind}`, r.left + r.width / 2, r.top + r.height * 0.5, `<span>${esc(e.name)} !</span>`);
  done(el, 1500);
}

// Malédiction reçue : une carte violette face cachée tombe sur le héros.
function playCurse(e, geo) {
  Sfx.play('curse');
  const at = geo.seatPoint(e.target);
  const el = spawn('curse-card', at.x, at.y - 60, '<span>🂠</span>');
  el.animate([{ transform: 'translate(-50%, -150%) rotate(-25deg) scale(.6)', opacity: 0 },
    { transform: 'translate(-50%, -50%) rotate(8deg) scale(1.1)', opacity: 1, offset: 0.5 },
    { transform: 'translate(-50%, -20%) rotate(0deg) scale(.8)', opacity: 0 }], { duration: 900, easing: 'ease-out', fill: 'forwards' }).onfinish = () => el.remove();
}

// Malédiction révélée : son nom s'affiche au-dessus du héros.
function playCurseReveal(e, geo) {
  Sfx.play('curse');
  const at = geo.seatPoint(e.target);
  floatNumber(esc(e.name), 'num-curse', { x: at.x, y: at.y - 40 });
}

function playFx(e, g) {
  const geo = geometry(g);
  if (!geo) return;
  if (e.kind === 'protect') return playProtect(e, geo);
  if (e.kind === 'bossAttack') return playBossAttack(e, geo);
  if (e.kind === 'hurt') return playHurt(e, geo);
  if (e.kind === 'heal') return playHeal(e, geo);
  if (e.kind === 'ability') return playAbility(e, geo);
  if (e.kind === 'curse') return playCurse(e, geo);
  if (e.kind === 'curseReveal') return playCurseReveal(e, geo);
  if (e.kind !== 'hit') return;
  if (e.dmg === 'melee') playMelee(e, geo);
  else if (e.dmg === 'ranged') playRanged(e, geo);
  else playMagic(e, geo);
}
