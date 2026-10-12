// Client : affiche l'état envoyé par le serveur et lui transmet les actions des joueurs.

const socket = io();
const $app = document.getElementById('app');
const $toast = document.getElementById('toast');

const store = {
  get(k) { try { return localStorage.getItem(k); } catch { return null; } },
  set(k, v) { try { localStorage.setItem(k, v); } catch { /* stockage indisponible */ } },
  del(k) { try { localStorage.removeItem(k); } catch { /* stockage indisponible */ } },
};

let token = store.get('bf-token');
if (!token) {
  token = (crypto.randomUUID ? crypto.randomUUID() : String(Math.random()).slice(2) + Date.now());
  store.set('bf-token', token);
}

let catalog = null;
let state = null;
// pending : ciblage en cours { kind: 'card' | 'choose' | 'potion', uid?, steps: [libellés], targets: [] }
// seatModal : place vide cliquée, en attente du choix du héros et de la classe.
const ui = { pending: null, discardSel: new Set(), lastPhaseKey: '', homeRendered: false, seatModal: null };

// ---------- Visuels ----------

// Illustrations générées avec Canva (public/img).
const HERO_IMG = { troll: 'img/troll.jpg', halfling: 'img/halfling.jpg', dwarf: 'img/dwarf.jpg', elf: 'img/elf.jpg' };
const BOSS_IMG = { toad: 'img/prince.jpg', puppet: 'img/puppet.jpg' };
const CLASS_ICON = { warrior: 'cls-warrior', mage: 'cls-mage', rogue: 'cls-rogue', druid: 'cls-druid' };
const TYPE_ICON = { melee: 'melee', ranged: 'ranged', magic: 'magic', protect: 'protect', heal: 'heal', util: 'draw' };
const AB_ICON = { attack: 'attack-boss', threshold: 'broken-heart', reaction: 'fangs', recurring: 'hourglass', shield: 'protect' };
const AB_LABEL = { attack: 'Attaque', threshold: 'Seuil de vie', reaction: 'Réaction', recurring: 'Récurrente', shield: 'Bouclier' };
const DMG_NAME = { melee: 'Mêlée', ranged: 'Distance', magic: 'Magie' };

const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const ic = (name, cls = '') => `<i class="ic ${cls}" style="--i:url(icons/${name}.svg)" aria-hidden="true"></i>`;
// Les textes d'effets du serveur commencent par un emoji : on le retire, l'icône le remplace.
const plain = (t) => t.replace(/^[^\p{L}\p{N}]+/u, '');

function portrait(heroId, cls = '') {
  const src = HERO_IMG[heroId];
  return src
    ? `<div class="portrait ${cls}" style="background-image:url(${src})"></div>`
    : `<div class="portrait ${cls} no-img">${ic(heroId === 'elf' ? 'elf' : 'crown')}</div>`;
}

function toast(msg) {
  $toast.textContent = msg;
  $toast.hidden = false;
  clearTimeout(toast.t);
  toast.t = setTimeout(() => { $toast.hidden = true; }, 3500);
}

// ---------- Réseau ----------

socket.on('connect', () => {
  const code = store.get('bf-room');
  if (code) socket.emit('join', { token, code, name: store.get('bf-name') });
});
socket.on('catalog', (c) => { catalog = c; render(); });
socket.on('joined', ({ code }) => store.set('bf-room', code));
socket.on('oops', (msg) => {
  if (msg.startsWith('Salon introuvable') && !state) store.del('bf-room');
  toast(msg);
});
socket.on('state', (s) => {
  state = s;
  const g = s.game;
  const key = g ? `${g.round}-${g.phase}-${g.current}` : 'lobby';
  if (key !== ui.lastPhaseKey) {
    ui.lastPhaseKey = key;
    ui.pending = null;
    if (!g || g.phase !== 'discard') ui.discardSel.clear();
  }
  render();
});

const act = (a) => socket.emit('act', a);

// ---------- Rendu ----------

function render() {
  if (!catalog) { $app.innerHTML = '<p class="loading">Connexion à la taverne…</p>'; return; }
  if (!state) {
    if (!ui.homeRendered) renderHome();
    return;
  }
  ui.homeRendered = false;
  if (!state.game) renderLobby();
  else renderGame();
}

function logo() {
  return `<div class="logo"><span class="logo-top">Boss Fighters</span><span class="logo-sub">entre amis</span></div>`;
}

function renderHome() {
  ui.homeRendered = true;
  const name = esc(store.get('bf-name') || '');
  // Lien partagé : https://…/#CODE pré-remplit le code du salon.
  const hashCode = esc(location.hash.replace('#', '').toUpperCase().slice(0, 4));
  $app.innerHTML = `
    <div class="home">
      <div class="home-art">
        <div class="home-hero" style="background-image:url(img/dwarf.jpg)"></div>
        <div class="home-hero boss" style="background-image:url(img/prince.jpg)"></div>
        <div class="home-hero" style="background-image:url(img/halfling.jpg)"></div>
      </div>
      <div class="parchment home-box">
        ${logo()}
        <p class="sub">Version web non officielle, pour affronter les boss à distance avec ses amis.</p>
        <label>Ton nom de héros <input id="name" maxlength="20" value="${name}" placeholder="Ex. Lisa"></label>
        <button class="btn primary" data-action="create">Créer un salon</button>
        <div class="or"><span>ou rejoindre un salon</span></div>
        <div class="row">
          <input id="code" maxlength="4" placeholder="CODE" class="code-input" value="${hashCode}">
          <button class="btn" data-action="join">Rejoindre</button>
        </div>
      </div>
    </div>`;
}

// ---------- Places autour de la tablette ----------
// 8 places sur les bords de l'écran, numérotées dans le sens horaire (vu du dessus) :
// en bas de droite à gauche, à gauche de bas en haut, en haut de gauche à droite, à droite de haut en bas.
// L'ordre du tour suit ces numéros, comme les joueurs autour de la vraie tablette.
const SEATS = [
  { x: 77, y: 100, side: 'bottom' }, { x: 23, y: 100, side: 'bottom' },
  { x: 0, y: 70, side: 'left' }, { x: 0, y: 30, side: 'left' },
  { x: 23, y: 0, side: 'top' }, { x: 77, y: 0, side: 'top' },
  { x: 100, y: 30, side: 'right' }, { x: 100, y: 70, side: 'right' },
];
const seatStyle = (i) => `--x:${SEATS[i].x}%;--y:${SEATS[i].y}%`;

function heroPickCard(id, x, selected, taken) {
  return `
    <button class="hero-card ${selected ? 'sel' : ''}" data-action="pick" data-kind="hero" data-id="${id}" ${taken ? 'disabled' : ''}>
      ${portrait(id, 'fill')}
      <span class="stats"><span class="stat" title="Cartes en main">${ic('hand')}<b>${x.hand}</b></span><span class="stat hp" title="Points de vie">${ic('heal')}<b>${x.hp}</b></span></span>
      <span class="name-band">${esc(x.name)}</span>
      ${taken ? '<span class="taken">pris</span>' : ''}
    </button>`;
}

function classPickCard(id, x, selected, taken) {
  return `
    <button class="class-banner c-${id} ${selected ? 'sel' : ''}" data-action="pick" data-kind="cls" data-id="${id}" ${taken ? 'disabled' : ''}>
      <span class="banner-cloth">${ic(CLASS_ICON[id], 'big')}</span>
      <span class="stats"><span class="stat" title="Cartes en main">${ic('hand')}<b>${x.hand}</b></span><span class="stat hp" title="Points de vie">${ic('heal')}<b>${x.hp}</b></span></span>
      <span class="name-band">${esc(x.name)}</span>
      ${taken ? '<span class="taken">prise</span>' : ''}
    </button>`;
}

// Écran de sélection (héros + classe) ouvert en cliquant sur une place vide.
function seatModal(me) {
  const takenHero = (id) => state.players.some((p) => p.hero === id && p.id !== token);
  const takenCls = (id) => state.players.some((p) => p.cls === id && p.id !== token);
  const ok = me.hero && me.cls;
  return `
    <div class="modal-back">
      <div class="modal parchment">
        <h2>Choisis ton héros</h2>
        <div class="hero-picks">${Object.entries(catalog.heroes).map(([id, x]) => heroPickCard(id, x, me.hero === id, takenHero(id))).join('')}</div>
        <h2>Choisis ta classe</h2>
        <div class="class-picks">${Object.entries(catalog.classes).map(([id, x]) => classPickCard(id, x, me.cls === id, takenCls(id))).join('')}</div>
        ${ok ? `<p class="totals">${ic('heal')} <b>${catalog.heroes[me.hero].hp + catalog.classes[me.cls].hp}</b> PV de départ · ${ic('hand')} <b>${catalog.heroes[me.hero].hand + catalog.classes[me.cls].hand}</b> cartes en main</p>` : ''}
        <div class="modal-actions">
          <button class="btn ghost-dark" data-action="close-modal">Annuler</button>
          <button class="btn go" data-action="sit" ${ok ? '' : 'disabled'}>S'asseoir ici ${ic('grant')}</button>
        </div>
      </div>
    </div>`;
}

function renderLobby() {
  const me = state.players.find((p) => p.id === token);
  const isHost = state.hostId === token;
  const boss = catalog.bosses[state.boss];
  const starterOnly = boss.starterOnly;
  const ready = state.players.every((p) => p.hero && p.cls && p.seat !== null);
  const bySeat = {};
  for (const p of state.players) if (p.seat !== null && p.seat !== undefined) bySeat[p.seat] = p;

  const seat = (i) => {
    const p = bySeat[i];
    if (!p) {
      return `<button class="seat-slot empty s-${SEATS[i].side}" style="${seatStyle(i)}" data-action="seat" data-seat="${i}" title="S'asseoir ici">+</button>`;
    }
    const mine = p.id === token;
    return `
      <div class="seat-slot taken s-${SEATS[i].side} ${mine ? 'mine' : ''} ${p.online ? '' : 'offline'}" style="${seatStyle(i)}"
           ${mine ? 'data-action="unseat" title="Retourner à la sélection"' : ''}>
        ${portrait(p.hero, 'sq')}
        <span class="seat-name">${esc(p.name)}</span>
        <span class="seat-cls c-${p.cls}">${ic(CLASS_ICON[p.cls])}</span>
        ${isHost && !mine ? `<button class="trash" data-action="kick" data-id="${esc(p.id)}" title="Retirer ce joueur">${ic('discard')}</button>` : ''}
      </div>`;
  };

  const waiting = state.players.filter((p) => p.seat === null || p.seat === undefined);
  const deck = me.hero && me.cls
    ? `<section class="parchment deck">
         <h2>Ton paquet</h2>
         <h3>Cartes de départ <small>(12)</small></h3>
         <div class="cards">${[...catalog.heroes[me.hero].cards, ...catalog.classes[me.cls].cards].map((id) => cardHtml(id)).join('')}</div>
         <h3>Cartes avancées <small>(8)${starterOnly ? ' — pas utilisées contre M. Pantin' : ''}</small></h3>
         <div class="cards ${starterOnly ? 'dim' : ''}">${[...catalog.heroes[me.hero].advanced, ...catalog.classes[me.cls].advanced].map((id) => cardHtml(id)).join('')}</div>
         <p class="legend-conf">📷 carte vue en photo · ≈ valeur probable · ? carte non retrouvée</p>
       </section>`
    : '';

  $app.innerHTML = `
    <div class="lobby">
      <header class="topbar">
        ${logo()}
        <div class="room">Salon <b class="code">${esc(state.code)}</b>
          <button class="btn small" data-action="copy">Copier le lien</button>
          <button class="btn small ghost" data-action="leave">Quitter</button>
        </div>
      </header>
      <div class="scene">
        <div class="tablet">
          <div class="screen-wrap">
            <div class="screen lobby-screen" style="background-image:url(${BOSS_IMG[boss.art] || ''})">
              <div class="lobby-center">
                <h2 class="screen-title">Choisissez vos places</h2>
                <p class="screen-sub">Cliquez sur une place au bord de l'écran, là où vous seriez assis autour de la tablette. L'ordre du tour suit le sens des aiguilles d'une montre.</p>
                <div class="boss-pick">
                  ${Object.values(catalog.bosses).map((b) => `
                    <button class="boss-card ${state.boss === b.id ? 'sel' : ''}" data-action="boss" data-id="${b.id}" ${isHost ? '' : 'disabled'}>
                      <span class="boss-thumb" style="background-image:url(${BOSS_IMG[b.art] || ''})"></span>
                      <span class="name-band">${esc(b.name)}</span>
                      <span class="stats top"><span class="stat" title="Enragé au tour ${b.enrageRound}">${ic('skull')}<b>${b.enrageRound}</b></span></span>
                    </button>`).join('')}
                </div>
                <div class="lobby-controls">
                  <select data-action="difficulty" ${isHost ? '' : 'disabled'}>
                    ${Object.entries(catalog.difficulties).map(([id, d]) => `<option value="${id}" ${state.difficulty === id ? 'selected' : ''}>${esc(d.label)}</option>`).join('')}
                  </select>
                  ${isHost
                    ? `<button class="btn go" data-action="start" ${ready ? '' : 'disabled'} title="Lancer le combat">${ic('grant')}</button>`
                    : '<span class="screen-sub">L’hôte lancera le combat.</span>'}
                </div>
                ${waiting.length ? `<p class="screen-sub">En attente de place : ${waiting.map((p) => esc(p.name)).join(', ')}</p>` : ''}
              </div>
            </div>
            ${SEATS.map((_, i) => seat(i)).join('')}
          </div>
        </div>
      </div>
      <div class="below">
        <section class="parchment legend-box">
          <h3>${esc(boss.name)}</h3>
          <p class="legend">${esc(boss.legend)}</p>
        </section>
        ${deck}
      </div>
      ${ui.seatModal !== null ? seatModal(me) : ''}
    </div>`;
}

function cardType(card) {
  const e = card.effects[0];
  if (!e) return 'util';
  if (e.t === 'attack' || e.t === 'support') return e.dmg;
  if (e.t === 'protect') return 'protect';
  if (e.t === 'heal') return 'heal';
  return 'util';
}

// Médaillons de valeur en haut à gauche de la carte, comme sur les vraies cartes.
function badges(card) {
  const out = [];
  const val = (v) => (v === 'd3' ? '1-3' : v === 'round' ? 'T' : v === 'myAttack' ? '?' : v);
  for (const e of card.effects) {
    if (out.length >= 4) break;
    switch (e.t) {
      case 'attack': out.push(`<span class="badge b-${e.dmg}">${ic(e.dmg)}<b>${val(e.v)}</b></span>`); break;
      case 'support': out.push(`<span class="badge b-${e.dmg} support">${ic(e.dmg)}<b>${val(e.v)}</b></span>`); break;
      case 'protect': out.push(`<span class="badge b-protect">${ic('protect')}<b>${e.v}</b></span>`); break;
      case 'heal': out.push(`<span class="badge b-heal">${ic('heal')}<b>+${e.v}</b></span>`); break;
      case 'draw': out.push(`<span class="badge b-util">${ic('draw')}<b>+${e.v}</b></span>`); break;
      case 'cleanse': out.push(`<span class="badge b-util">${ic('cleanse')}<b>${e.v}</b></span>`); break;
      case 'selfDamage': out.push(`<span class="badge b-hurt">${ic('broken-heart')}<b>-${e.v}</b></span>`); break;
      case 'bossLoss': out.push(`<span class="badge b-hurt">${ic('broken-heart')}<b>${e.v}</b></span>`); break;
      case 'poisonBoss': out.push(`<span class="badge b-poison">${ic('poison')}<b>${e.v}</b></span>`); break;
      case 'lightning': out.push(`<span class="badge round">${ic('lightning')}</span>`); break;
      case 'grant': out.push('<span class="badge round grant">✱</span>'); break;
      default: break;
    }
  }
  return out.join('');
}

function cardHtml(id, opts = {}) {
  const c = catalog.cards[id];
  const type = cardType(c);
  const conf = { 'sûr': ['📷', 'vue en photo'], probable: ['≈', 'valeur probable'], 'supposé': ['?', 'carte non retrouvée, valeurs supposées'] }[c.conf] || ['?', ''];
  const title = `${c.en && c.en !== '?' ? c.en + ' — ' : ''}${conf[1]}`;
  return `
    <div class="card t-${type} ${c.adv ? 'adv' : ''} ${opts.cls || ''}" ${opts.attrs || ''} title="${esc(title)}">
      <div class="card-name">${esc(c.name)}</div>
      <div class="card-art">${ic(TYPE_ICON[type], 'art-icon')}<div class="badges">${badges(c)}</div></div>
      <div class="card-text">${c.text.map((t) => `<p>${esc(plain(t))}</p>`).join('')}</div>
      <div class="card-foot"><span>${c.adv ? '★' : ''}</span><span>${conf[0]}</span></div>
    </div>`;
}

function renderGame() {
  const g = state.game;
  const myIdx = g.heroes.findIndex((h) => h.mine);
  const me = g.heroes[myIdx];
  const myTurn = g.phase === 'action' && !g.awaitingStarter && !g.choice && g.current === myIdx;
  const targeting = !!ui.pending;
  const b = g.boss;
  const online = (h) => (state.players.find((p) => p.seat === h.seat) || {}).online !== false;

  // Héros à sa place au bord de l'écran, comme dans l'appli.
  const heroSeat = (h, i) => {
    const atk = g.attacks[i] || { value: 0, effects: {} };
    const active = g.current === i && g.phase === 'action';
    const dots = g.phase === 'action'
      ? Array.from({ length: 3 }, (_, k) => `<i class="dot ${k < h.turnsLeft ? 'on' : ''}"></i>`).join('') +
        (active && h.turnActions > 1 ? '<i class="dot bonus"></i>'.repeat(h.turnActions - 1) : '')
      : '';
    const seatIdx = h.seat ?? i;
    return `
      <div class="seat-slot hero-seat s-${SEATS[seatIdx].side} ${active ? 'active' : ''} ${h.mine ? 'mine' : ''} ${targeting ? 'targetable' : ''} ${online(h) ? '' : 'offline'}"
           style="${seatStyle(seatIdx)}" ${targeting ? `data-action="target" data-idx="${i}"` : ''}
           title="${esc(h.name)} — ${esc(catalog.heroes[h.hero].name)} ${esc(catalog.classes[h.cls].name)}">
        <div class="seat-main">
          <div class="seat-portrait">
            ${portrait(h.hero, 'sq')}
            <span class="seat-hp" title="Points de vie">${h.hp}</span>
          </div>
          <div class="seat-dots">${dots}</div>
          <div class="seat-attack ${atk.value === 0 ? 'zero' : ''}" title="Attaque prévue du boss">
            <span>${ic('fangs')}<b>${atk.value}</b></span>
            ${atk.effects.poison ? `<span class="fx">${ic('poison')}<b>${atk.effects.poison}</b></span>` : ''}
          </div>
        </div>
        <div class="seat-info">
          <span class="seat-name">${esc(h.name)}${h.mine ? ' (toi)' : ''}</span>
          ${h.poison ? `<span class="tok poison" title="Jetons Poison">${ic('poison')}${h.poison}</span>` : ''}
          ${h.raven ? '<span class="tok" title="Malédiction du corbeau posée">🐦‍⬛</span>' : ''}
          ${h.nextMods ? `<span class="tok" title="Bonus sur la prochaine Attaque">${ic('magic')}</span>` : ''}
          ${g.phase === 'discard' ? `<span class="tok">${h.ready ? '✔' : '…'}</span>` : ''}
        </div>
      </div>`;
  };

  // Message central en jaune, comme l'appli (« X, effectue 1 action. »).
  let message = '';
  let actions = '';
  if (g.result) {
    message = g.result === 'win' ? 'Victoire !' : 'Défaite…';
    actions = '<button class="btn primary" data-action="lobby">Retour au salon</button>';
  } else if (ui.pending) {
    message = `Choisis un héros : ${plain(ui.pending.steps[ui.pending.targets.length])}`;
    actions = '<span>Clique sur un héros autour de l’écran.</span><button class="btn small ghost" data-action="cancel">Annuler</button>';
  } else if (g.choice) {
    const who = g.heroes[g.choice.hero];
    message = `${who.name} choisit une carte…`;
    if (who.mine) {
      const what = g.choice.from === 'dejavu'
        ? 'Déjà-vu : choisis une carte de ta défausse à rejouer (elle sera retirée du combat)'
        : 'Masque de clairvoyance : choisis la carte à jouer (les autres retournent sur ta pioche)';
      actions = `<div class="choice"><b>${what}</b>
        <div class="cards">${g.choice.options.map((c) => cardHtml(c.id, { cls: 'clickable', attrs: `data-action="choose" data-uid="${esc(c.uid)}"` })).join('')}</div>
        ${g.choice.allowTop ? '<button class="btn small" data-action="choose" data-uid="__top">Jouer plutôt la carte du dessus de ma pioche</button>' : ''}</div>`;
    }
  } else if (g.phase === 'action' && g.awaitingStarter) {
    message = 'Qui commence ce tour ?';
    actions = `<span>Discutez-en, puis :</span>${g.heroes.map((h, i) => `<button class="btn small" data-action="starter" data-idx="${i}">${esc(h.name)}</button>`).join('')}`;
  } else if (g.phase === 'action') {
    const cur = g.heroes[g.current];
    message = `${cur.name}, effectue ${cur.turnActions} action${cur.turnActions > 1 ? 's' : ''}.`;
    if (myTurn) actions = `<span>À toi ! ${me.turnsLeft} tour${me.turnsLeft > 1 ? 's' : ''} restant${me.turnsLeft > 1 ? 's' : ''}.</span><button class="btn small ghost" data-action="pass">Passer</button>`;
  } else if (g.phase === 'discard') {
    message = 'Défaussez vos cartes.';
    const keep = me.handCount - ui.discardSel.size;
    actions = me.ready
      ? '<span>Défausse validée. En attente des autres joueurs…</span>'
      : `<span>Clique sur les cartes à défausser (garde au maximum ${me.handLimit} cartes, tu en gardes ${keep}).</span>
         <button class="btn check" data-action="discard" ${keep > me.handLimit ? 'disabled' : ''} title="Valider">✔</button>`;
  }

  const handClickable = (myTurn && !targeting) || (g.phase === 'discard' && !me.ready);
  const hand = me.hand.map((c) => cardHtml(c.id, {
    cls: `${handClickable ? 'clickable' : ''} ${ui.discardSel.has(c.uid) ? 'selected' : ''}`,
    attrs: handClickable ? `data-action="card" data-uid="${esc(c.uid)}"` : '',
  })).join('');

  const items = g.items ? `
    <div class="items">
      <button class="item" data-action="item" data-item="backpack" ${myTurn && !targeting ? '' : 'disabled'} title="${esc(catalog.items.backpack.text)}">
        ${ic('backpack', 'big')}<span>${esc(catalog.items.backpack.name)}</span><small>∞</small></button>
      <button class="item" data-action="item" data-item="potion" ${myTurn && !targeting && g.items.potions > 0 ? '' : 'disabled'} title="${esc(catalog.items.potion.text)}">
        ${ic('potion', 'big')}<span>${esc(catalog.items.potion.name)}</span><small>× ${g.items.potions}</small></button>
    </div>` : '';

  // Boucliers en écussons : nombre au centre, type de dégâts en dessous.
  const shield = (t) => `
    <div class="crest s-${t} ${b.shields[t] ? '' : 'broken'} ${g.typesThisRound.includes(t) ? 'lit' : ''} ${b.toxic === t ? 'toxic' : ''}"
         title="Bouclier ${DMG_NAME[t]}${b.toxic === t ? ' — venimeux : le toucher empoisonne' : ''}${g.typesThisRound.includes(t) ? ' — Attaque jouée : les Soutiens fonctionnent' : ''}">
      <div class="crest-shield">${ic(b.toxic === t ? 'poison' : 'skull', 'crest-mark')}<b>${b.shields[t]}</b></div>
      <div class="crest-type">${ic(t)}</div>
    </div>`;

  $app.innerHTML = `
    <div class="game">
      <header class="topbar">
        ${logo()}
        <div class="round-info"><span class="phase">${esc(g.phaseLabel)}</span><span class="diff">${esc(g.difficulty)}</span></div>
        <div class="room">Salon <b class="code">${esc(state.code)}</b></div>
      </header>
      <div class="game-grid">
        <div class="main">
          <div class="scene">
            <div class="tablet ${b.enraged ? 'enraged' : ''}">
              <div class="screen-wrap">
                <div class="screen" style="background-image:url(${BOSS_IMG[b.art] || ''})">
                  ${g.result ? '' : `<button class="corner tl skull-btn" data-action="giveup" title="Abandonner le combat">${ic('skull')}</button>`}
                  <div class="boss-title">${esc(b.name)}
                    <span class="enrage ${b.enraged ? 'on' : ''}" title="${b.enraged ? 'Enragé !' : `Enragé au tour ${b.enrageAt}`}">${ic('skull')}<b>${b.enraged ? '!' : b.enrageAt}</b></span>
                  </div>
                  <div class="screen-message ${g.result || ''}">${esc(message)}</div>
                  <div class="crests">${['melee', 'ranged', 'magic'].map(shield).join('')}</div>
                  <div class="corner bl round-box" title="Tour">${ic('hourglass')}<b>${g.round}</b></div>
                  <div class="corner br heart-box" title="Vie du boss : ${b.life} / ${b.maxLife}">
                    ${b.poison ? `<span class="boss-tok" title="Poison sur le boss">${ic('poison')}${b.poison}</span>` : ''}
                    ${b.antiBoss ? `<span class="boss-tok" title="Anti-Boss-3000 actif">🤖${b.antiBoss}</span>` : ''}
                    <b>${b.life}</b><span class="heart">${ic('heal')}</span>
                  </div>
                </div>
                ${g.heroes.map(heroSeat).join('')}
              </div>
            </div>
          </div>
          ${actions ? `<div class="action-bar ${myTurn || (g.phase === 'discard' && !me.ready) || ui.pending ? 'mine' : ''}">${actions}</div>` : ''}
          <section class="hand-zone">
            <div class="cards hand">${hand || '<p class="muted">Aucune carte en main.</p>'}</div>
            ${items}
          </section>
        </div>
        <aside class="side">
          <div class="abilities parchment">
            <h3>Capacités du boss</h3>
            ${g.discovered.length
              ? `<ul>${g.discovered.map((a) => `<li><span class="ab ab-${a.kind}" title="${AB_LABEL[a.kind] || ''}">${ic(AB_ICON[a.kind] || 'skull')}</span><div><b>${esc(a.name)}</b><span>${esc(a.text)}</span></div></li>`).join('')}</ul>`
              : '<p class="muted">Aucune découverte pour l’instant. Observez le boss !</p>'}
          </div>
          <div class="log parchment">
            <h3>Chronique du combat</h3>
            <ul>${g.log.slice().reverse().map((l) => `<li class="k-${esc(l.k)}">${esc(l.m)}</li>`).join('')}</ul>
          </div>
        </aside>
      </div>
    </div>`;
}

// ---------- Interactions ----------

// Libellés des cibles à choisir pour une carte (même règle que needsTarget côté serveur).
function targetSteps(card) {
  return card.effects
    .map((e, i) => ({ e, label: card.text[i] }))
    .filter(({ e }) => (e.t === 'protect' || e.target === 'one') && !e.same)
    .map(({ label }) => label);
}

function startPlay(uid, kind = 'card', id = null) {
  const cardId = id || state.game.heroes.find((h) => h.mine).hand.find((c) => c.uid === uid).id;
  const steps = targetSteps(catalog.cards[cardId]);
  const type = kind === 'card' ? 'play' : 'choose';
  if (steps.length === 0) return act({ type, uid, targets: [] });
  ui.pending = { kind, uid, steps, targets: [] };
  render();
}

function pickTarget(idx) {
  const p = ui.pending;
  p.targets.push(idx);
  if (p.targets.length < p.steps.length) return render();
  ui.pending = null;
  if (p.kind === 'card') act({ type: 'play', uid: p.uid, targets: p.targets });
  else if (p.kind === 'choose') act({ type: 'choose', uid: p.uid, targets: p.targets });
  else act({ type: 'item', item: 'potion', target: p.targets[0] });
  render();
}

document.addEventListener('click', (ev) => {
  const el = ev.target.closest('[data-action]');
  if (!el || el.disabled) return;
  const a = el.dataset.action;
  const nameVal = () => {
    const n = (document.getElementById('name')?.value || '').trim();
    if (n) store.set('bf-name', n);
    return n;
  };

  switch (a) {
    case 'create': {
      const name = nameVal();
      if (!name) return toast('Entre ton nom.');
      socket.emit('create', { token, name });
      break;
    }
    case 'join': {
      const name = nameVal();
      const code = (document.getElementById('code')?.value || '').trim().toUpperCase();
      if (!name) return toast('Entre ton nom.');
      if (code.length !== 4) return toast('Le code du salon fait 4 lettres.');
      socket.emit('join', { token, name, code });
      break;
    }
    case 'copy': {
      const url = `${location.origin}/#${state.code}`;
      navigator.clipboard?.writeText(url).then(() => toast('Lien copié !'), () => toast(url));
      break;
    }
    case 'leave':
      socket.emit('leave');
      store.del('bf-room');
      state = null;
      ui.homeRendered = false;
      render();
      break;
    case 'pick': {
      const me = state.players.find((p) => p.id === token);
      const cur = el.dataset.kind === 'hero' ? me.hero : me.cls;
      const val = cur === el.dataset.id ? '' : el.dataset.id;
      socket.emit('pick', { [el.dataset.kind]: val });
      break;
    }
    case 'seat': ui.seatModal = Number(el.dataset.seat); render(); break;
    case 'sit':
      socket.emit('pick', { seat: ui.seatModal });
      ui.seatModal = null;
      break;
    case 'close-modal': ui.seatModal = null; render(); break;
    case 'unseat': socket.emit('pick', { seat: null }); break;
    case 'kick':
      if (confirm('Retirer ce joueur du salon ?')) socket.emit('kick', { id: el.dataset.id });
      break;
    case 'boss': socket.emit('settings', { boss: el.dataset.id }); break;
    case 'start': socket.emit('start'); break;
    case 'starter': act({ type: 'starter', hero: Number(el.dataset.idx) }); break;
    case 'card':
      if (state.game.phase === 'discard') {
        const uid = el.dataset.uid;
        if (ui.discardSel.has(uid)) ui.discardSel.delete(uid); else ui.discardSel.add(uid);
        render();
      } else {
        startPlay(el.dataset.uid);
      }
      break;
    case 'choose': {
      const uid = el.dataset.uid;
      if (uid === '__top') act({ type: 'choose', uid, targets: [] });
      else startPlay(uid, 'choose', state.game.choice.options.find((c) => c.uid === uid).id);
      break;
    }
    case 'target': pickTarget(Number(el.dataset.idx)); break;
    case 'cancel': ui.pending = null; render(); break;
    case 'item':
      if (el.dataset.item === 'potion') {
        ui.pending = { kind: 'potion', steps: ['Potion de soin (+8 PV)'], targets: [] };
        render();
      } else {
        act({ type: 'item', item: el.dataset.item });
      }
      break;
    case 'pass': act({ type: 'pass' }); break;
    case 'discard': act({ type: 'discard', uids: [...ui.discardSel] }); break;
    case 'giveup':
      if (confirm('Abandonner le combat ?')) act({ type: 'giveup' });
      break;
    case 'lobby': socket.emit('lobby'); break;
  }
});

document.addEventListener('change', (ev) => {
  if (ev.target.dataset.action === 'difficulty') socket.emit('settings', { difficulty: ev.target.value });
});

document.addEventListener('keydown', (ev) => {
  if (ev.key === 'Enter' && ev.target.id === 'code') document.querySelector('[data-action="join"]')?.click();
});
