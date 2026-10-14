// Catalogue des héros, classes, cartes et objets de Boss Fighters QR.
//
// Sources : fiche officielle « Box Contents » de Pegasus (noms et répartition des cartes de départ),
// photos de cartes (galerie BoardGameGeek, éditions anglaise, hongroise, polonaise, allemande),
// transcriptions de parties filmées. Noms traduits en français, nom anglais officiel dans `en`.
//
// conf : 'sûr'      = texte lu sur une photo de la carte
//        'probable' = valeur entendue en vidéo ou partiellement lisible
//        'supposé'  = carte non retrouvée, valeurs inventées dans l'esprit du jeu
// adv  : true = carte d'action avancée (boîte de butin bronze), ajoutée après le combat d'entraînement
//
// Effets :
//   attack  {dmg, v}       Attaque (dmg = 'melee' | 'ranged' | 'magic')
//   support {dmg, v}       Soutien : seulement si une Attaque du même type a été jouée ce tour
//   protect {v, clear}     Protection sur un héros au choix (clear = annule aussi l'effet additionnel)
//   lightning              Action supplémentaire
//   heal / draw {v, target} / cleanse {v, target}
//   grant  {target}        Le héros ciblé effectue immédiatement 1 action
//   selfDamage {v}         Le joueur perd des PV
//   poisonBoss {v}         Le boss reçoit des jetons Poison
//   bossLoss {v}           Le boss perd directement des PV
//   ifHp {min, then}       Effets appliqués seulement si tu as au moins `min` PV
//   nextAttack {boost} / {heal, target}   Bonus sur la prochaine Attaque jouée
//   redirect {target}      Chevaleresque : annule ton attaque et prend celle d'un autre héros
//   raven                  Malédiction du corbeau : posée devant toi, bloque une capacité ⌛
//   antiBoss               La prochaine capacité ⌛ du boss est empêchée
//   improvise {v, target}  Le héros ciblé joue les v cartes du dessus de sa pioche
//   choose {from}          Déjà-vu ('dejavu') ou Masque de clairvoyance ('mask')
// Valeurs spéciales : v = 'd3' (1 à 3 au hasard), 'round' (numéro du tour), 'myAttack' (attaque qui te vise)
// target : 'self' (soi), 'one' (un héros au choix), 'all' (tous) ; same: true = même héros que l'effet précédent

const A = (dmg, v, extra = {}) => ({ t: 'attack', dmg, v, ...extra });
const S = (dmg, v) => ({ t: 'support', dmg, v });
const P = (v, clear = false) => ({ t: 'protect', v, clear });
const L = { t: 'lightning' };
const H = (v, target = 'self', extra = {}) => ({ t: 'heal', v, target, ...extra });
const D = (v, target = 'self', extra = {}) => ({ t: 'draw', v, target, ...extra });
const C = (v, target = 'one') => ({ t: 'cleanse', v, target });
const G = (extra = {}) => ({ t: 'grant', target: 'one', ...extra });
const SD = (v) => ({ t: 'selfDamage', v });
const PB = (v) => ({ t: 'poisonBoss', v });
const IF = (min, then) => ({ t: 'ifHp', min, then });

const CARDS = {
  // ===== Troll de la jungle =====
  throwing_axe:     { name: 'Hache de lancer',          en: 'Throwing Axe',          effects: [A('ranged', 2)], conf: 'sûr' },
  grandpas_belt:    { name: 'La Ceinture de Grand-père',   en: "Grandpa's Belt",        effects: [P(3)], conf: 'sûr' },
  toad_smoothie:    { name: 'Smoothie de crapaud',      en: 'Toad Smoothie',         effects: [H(3, 'one'), D(2, 'one', { same: true })], conf: 'sûr' },
  spirit_spear:     { name: 'Lance spirituelle',        en: 'Spirit Spear',          effects: [A('magic', 3)], conf: 'sûr' },
  horn_chieftain:   { name: 'Corne du Chef',           en: 'Horn of the Chieftain', effects: [D(3, 'one'), G({ same: true })], conf: 'sûr' },
  ancestral_stone:  { name: 'Pierre ancestrale',        en: 'Ancestral Stone',       effects: [S('magic', 4)], conf: 'sûr' },
  // avancées
  bone_club:        { name: "Matraque d'os",            en: 'Bone Club',             effects: [A('melee', 4), IF(15, [D(2)])], conf: 'sûr', adv: true },
  shoulder_ram:     { name: 'Épaulette bélier',            en: 'Shoulder Ram',          effects: [S('melee', 3), IF(15, [H(3)])], conf: 'sûr', adv: true },
  grandmas_helmet:  { name: 'Le Casque de Grand-mère',     en: "Grandma's Helmet",      effects: [P(4), IF(15, [C(2, 'self')])], conf: 'sûr', adv: true },
  // Vue en vidéo (Troll Mage) : « attaque de mêlée, force = manche en cours, puis rejouer ». Nom inconnu.
  troll_round_blow: { name: 'Crac !',           en: '?',                     effects: [A('melee', 'round'), L], conf: 'sûr', adv: true },

  // ===== Halfelin des collines =====
  blinky:           { name: 'Scintillance',                 en: 'Blinky',                effects: [A('magic', 3)], conf: 'sûr' },
  dent_maker:       { name: 'Casse-dents',                en: 'Dent Maker',            effects: [A('ranged', 3)], conf: 'sûr' },
  ornate_dagger:    { name: 'Dague ornée',              en: 'Ornate Dagger',         effects: [A('melee', 2)], conf: 'sûr' },
  whisper_cloak:    { name: 'Cape des Murmures',          en: 'Whisper Cloak',         effects: [P(3)], conf: 'sûr' },
  pebble_friends:   { name: 'Amis galets',         en: 'Pebble Friends',        effects: [S('ranged', 4)], conf: 'sûr' },
  // avancées (le paquet de chaque carte est donné par HEROES / CLASSES, recoupé dans les parties filmées)
  magic_slingshot:  { name: 'Fronde magique',           en: 'Magic Slingshot',       effects: [A('ranged', 2), A('magic', 2)], conf: 'sûr', adv: true },
  lucky_brooch:     { name: 'Broche Porte-bonheur',     en: 'Lucky Brooch',          effects: [P(2), L], conf: 'sûr', adv: true },
  improvise:        { name: 'Improvisation',            en: 'Improvise',             effects: [{ t: 'improvise', v: 2, target: 'one' }], conf: 'sûr', adv: true },
  snarl_root:       { name: 'Herbes à pipe',            en: 'Snarl Root',            effects: [H(3), L, L], conf: 'sûr', adv: true },
  // Carte avancée du Guerrier : jouée en vidéo par des Guerriers de tous les héros.
  rune_vengeance:   { name: 'Rune de Vengeance',        en: 'Rune of Vengeance',     effects: [A('ranged', 'myAttack', { backlash: { min: 9, v: 4 } })], conf: 'sûr', adv: true },

  // ===== Nain de cuivre =====
  rock_cleaver:     { name: 'Tranche-roche',            en: 'Rock Cleaver',          effects: [A('melee', 4)], conf: 'sûr' },
  tunnel_blaster:   { name: 'Souffleur de tunnel',      en: 'Tunnel Blaster',        effects: [A('ranged', 2)], conf: 'sûr' },
  chest_piece:      { name: 'Plastron',                 en: 'Chest Piece',           effects: [P(4)], conf: 'sûr' },
  brass_knuckles:   { name: 'Poing de cuivre',          en: 'Brass Knuckles',        effects: [S('melee', 3)], conf: 'sûr' },
  morning_star:     { name: "Fléau d'arme",            en: 'Morning Star',          effects: [S('melee', 5), SD(2)], conf: 'sûr' },
  titanium_bracers: { name: 'Brassards de titane',      en: 'Titanium Bracers',      effects: [P(2), P(2)], conf: 'sûr' },
  // avancées
  guard_helmet:     { name: 'Casque de garde',          en: 'Guard Helmet',          effects: [P(2), C(1)], conf: 'sûr', adv: true },
  rune_king:        { name: 'Rune du Roi',              en: 'Rune of the King',      effects: [D(1, 'all'), L], conf: 'sûr', adv: true },
  runestone:        { name: 'Pierre de Rune',           en: 'Runestone',             effects: [A('magic', 'round'), L], conf: 'sûr', adv: true },

  // ===== Elfe des bois =====
  star_blade:       { name: 'Lame Étoile',             en: 'Star Blade',            effects: [A('melee', 3)], conf: 'sûr' },
  arrow_volley:     { name: 'Volée de flèches',         en: 'Arrow Volley',          effects: [S('ranged', 4)], conf: 'sûr' },
  sunfire:          { name: 'Feu solaire',              en: 'Sunfire',               effects: [A('magic', 4)], conf: 'sûr' },
  magic_arrow_flurry: { name: 'Salve de flèches magiques', en: 'Magic Arrow Flurry', effects: [S('magic', 3)], conf: 'sûr' },
  shield_of_light:  { name: 'Bouclier de lumière',      en: 'Shield of Light',       effects: [P(3)], conf: 'sûr' },
  gaias_bow:        { name: 'Arc de Gaïa',              en: "Gaia's Bow",            effects: [A('ranged', 4), D(1, 'one')], conf: 'sûr' },
  // avancées (le paquet de chaque carte est donné par HEROES / CLASSES, recoupé dans les parties filmées)
  precision_shot:   { name: 'Tir de précision',         en: 'Precision Shot',        effects: [A('ranged', 'round'), L], conf: 'sûr', adv: true },
  protection_spell: { name: 'Sort de protection',       en: 'Protection Spell',      effects: [P(2), L], conf: 'sûr', adv: true },
  diadem:           { name: "Diadème d'invisibilité",   en: 'Diadem of Invisibility', effects: [{ t: 'nextAttack', boost: 3 }, L], conf: 'sûr', adv: true },
  mask_clairvoyance: { name: 'Masque de clairvoyance',  en: 'Mask of Clairvoyance',  effects: [{ t: 'choose', from: 'mask' }], conf: 'sûr', adv: true },

  // ===== Guerrier =====
  amulet_bear:      { name: "Amulette de l'Ours",       en: 'Amulet of the Bear',    effects: [S('melee', 3)], conf: 'sûr' },
  hand_crossbow:    { name: 'Arbalète à main',          en: 'Hand Crossbow',         effects: [A('ranged', 3)], conf: 'sûr' },
  throwing_daggers: { name: 'Dagues de lancer',         en: 'Throwing Daggers',      effects: [S('ranged', 3)], conf: 'sûr' },
  lightning_blade:  { name: 'Lame de foudre',           en: 'Lightning Blade',       effects: [A('magic', 3)], conf: 'sûr' },
  chain_mail:       { name: 'Cotte de mailles',         en: 'Chain Mail',            effects: [P(4)], conf: 'sûr' },
  sword_ruby_guard: { name: 'Épée à la garde de Rubis',   en: 'Sword of the Ruby Guard', effects: [A('melee', 4)], conf: 'sûr' },
  // avancées
  anti_boss:        { name: 'Anti-Boss 3000',           en: 'Anti-Boss-3000',        effects: [{ t: 'antiBoss' }], conf: 'sûr', adv: true, exile: true },
  chivalrous:       { name: 'Acte chevaleresque',       en: 'Chivalrous Assistance', effects: [{ t: 'redirect', target: 'one' }], conf: 'sûr', adv: true },
  shoulder_spikes:  { name: 'Épaulette à pointes',     en: 'Shoulder Spikes',       effects: [A('melee', 2), P(2)], conf: 'sûr', adv: true },
  feint:            { name: 'Feinte',                   en: 'Feint',                 effects: [S('melee', 2), L], conf: 'sûr', adv: true },

  // ===== Mage =====
  fireball:         { name: 'Boule de feu',             en: 'Fireball',              effects: [A('magic', 4)], conf: 'sûr' },
  magic_explosion:  { name: 'Explosion magique',        en: 'Magic Explosion',       effects: [S('magic', 4)], conf: 'sûr' },
  ritual_dagger:    { name: 'Dague rituelle',           en: 'Ritual Dagger',         effects: [A('melee', 3)], conf: 'sûr' },
  flame_shield:     { name: 'Bouclier de flammes',      en: 'Flame Shield',          effects: [S('magic', 2), P(2)], conf: 'sûr' },
  obsidian_shards:  { name: "Éclats d'Obsidienne",      en: 'Obsidian Shards',       effects: [A('ranged', 3)], conf: 'sûr' },
  energy_drain:     { name: "Drain d'énergie",          en: 'Energy Drain',          effects: [A('magic', 2), H(2, 'one')], conf: 'sûr' },
  // avancées
  meteor_shower:    { name: 'Pluie de météores',        en: 'Meteor Shower',         effects: [A('melee', 'd3'), A('ranged', 'd3'), A('magic', 'd3'), SD(2)], conf: 'sûr', adv: true },
  demonic_pact:     { name: 'Pacte démoniaque',         en: 'Demonic Pact',          effects: [P(5), SD(2)], conf: 'sûr', adv: true },
  arcane_overload:  { name: 'Surcharge arcanique',      en: 'Arcane Overload',       effects: [A('magic', 2), L], conf: 'sûr', adv: true },
  deja_vu:          { name: 'Déjà-vu',                  en: 'Déjà-Vu',               effects: [{ t: 'choose', from: 'dejavu' }], conf: 'sûr', adv: true },

  // ===== Roublard =====
  shadow_blade:     { name: "Lame d'Ombre",             en: 'Shadow Blade',          effects: [A('melee', 3)], conf: 'sûr' },
  thorn_trap:       { name: 'Piège acéré',           en: 'Thorn Trap',            effects: [S('melee', 4)], conf: 'sûr' },
  throwing_knives:  { name: 'Couteaux de lancer',       en: 'Throwing Knives',       effects: [S('ranged', 3)], conf: 'sûr' },
  shadow_robe:      { name: "Robe d'Ombre",             en: 'Shadow Robe',           effects: [P(3)], conf: 'sûr' },
  hornet_sting:     { name: 'Piqûre de frelon',         en: 'Hornet Sting',          effects: [A('ranged', 2), L], conf: 'sûr' },
  // avancées (le paquet de chaque carte est donné par HEROES / CLASSES, recoupé dans les parties filmées)
  curse_raven:      { name: 'Malédiction du Corbeau',   en: 'Curse of the Raven',    effects: [{ t: 'bossLoss', v: 2 }, { t: 'raven' }], conf: 'sûr', adv: true },
  poison_blade:     { name: 'Lame empoisonnée',         en: 'Poison Blade',          effects: [A('melee', 2), PB(1)], conf: 'sûr', adv: true },
  smoke_bomb:       { name: 'Bombe fumigène',           en: 'Smoke Bomb',            effects: [P(2, true), L], conf: 'sûr', adv: true },
  viper_tooth:      { name: 'Croc de vipère',           en: 'Viper Tooth',           effects: [A('ranged', 2), PB(1)], conf: 'sûr', adv: true },

  // ===== Druide =====
  bluethorn_staff:  { name: 'Bâton Bleuépine',      en: 'Bluethorn Staff',       effects: [A('magic', 3)], conf: 'sûr' },
  wall_of_roots:    { name: 'Mur de racines',           en: 'Wall of Roots',         effects: [P(3)], conf: 'sûr' },
  wyrmtooth_blade:  { name: 'Lame à dent de Vouivre',     en: 'Wyrmtooth Blade',       effects: [A('melee', 3)], conf: 'sûr' },
  murder_of_crows:  { name: 'Nuée de corbeaux',         en: 'Murder of Crows',       effects: [A('ranged', 4)], conf: 'sûr' },
  magic_vortex:     { name: 'Vortex magique',           en: 'Magic Vortex',          effects: [A('magic', 2), L], conf: 'sûr' },
  // avancées (le paquet de chaque carte est donné par HEROES / CLASSES, recoupé dans les parties filmées)
  mushroom_powder:  { name: 'Poudre de champignons',     en: 'Mushroom Powder',       effects: [H(5, 'one'), G({ same: true })], conf: 'sûr', adv: true },
  antidote:         { name: 'Antidote',                 en: 'Antidote',              effects: [C(2), L], conf: 'sûr', adv: true },
  phoenix_owl:      { name: 'Phénix-Hibou',          en: 'Phoenix Owl',           effects: [{ t: 'nextAttack', heal: true, target: 'one' }, L], conf: 'sûr', adv: true },
  lyrias_ring:      { name: 'Anneau de Lyria',          en: "Lyria's Ring",          effects: [H(2, 'all'), L], conf: 'sûr', adv: true },

  // ===== Butin ★1 (après le Prince ; pas encore utilisé) =====
  curse_breaker:    { name: 'Brise-malédiction',        en: 'Curse Breaker',         effects: [{ t: 'breakCurse', target: 'one' }], conf: 'sûr', loot: 1 },
  arcane_monocle:   { name: 'Monocle arcanique',        en: 'Arcane Monocle',        effects: [S('ranged', 3), S('magic', 3)], conf: 'sûr', loot: 1 },
  banner_courage:   { name: 'Bannière de bravoure',     en: 'Banner of Courage',     effects: [G(), L], conf: 'sûr', loot: 1 },
  blade_of_wind:    { name: 'Lame du Vent',             en: 'Blade of Wind',         effects: [A('melee', 3), L], conf: 'sûr', loot: 1 },
  living_boots:     { name: 'Bottes animées',           en: 'Living Boots',          effects: [P(1), D(1, 'one'), L], conf: 'sûr', loot: 1 },

  // ===== Butin ★2 (après la Chasseuse d'âmes ; textes lus en vidéo, noms traduits de l'allemand) =====
  spur_on:          { name: 'Encouragement',            en: 'Spur On',               effects: [D(3, 'one'), G({ same: true })], conf: 'probable', loot: 2 },
  gladiator_shield: { name: 'Bouclier de lancer du gladiateur', en: "Gladiator's Throwing Shield", effects: [S('ranged', 3), P(3)], conf: 'probable', loot: 2 },
  weapon_poison:    { name: "Poison d'arme",            en: 'Weapon Poison',         effects: [{ t: 'shieldDown', v: 2, poisonIfBroken: 2 }], conf: 'probable', loot: 2 },
  coin_of_fate:     { name: 'Pièce du destin',          en: 'Coin of Fate',          effects: [S('melee', 5)], conf: 'probable', loot: 2 },
  sky_rune:         { name: 'Rune céleste',             en: 'Sky Rune',              effects: [A('magic', 4), D(1, 'one')], conf: 'probable', loot: 2 },

  // ===== Butin ★3 (après le Dragon de l'éther) =====
  blessed_pauldrons: { name: 'Épaulières consacrées',   en: 'Blessed Pauldrons',     effects: [P(4, true)], conf: 'probable', loot: 3 },
  carefree_elixir:  { name: "Élixir d'insouciance",     en: 'Elixir of Carelessness', effects: [C(1, 'all')], conf: 'probable', loot: 3 },
  piercing_volley:  { name: 'Volée perçante',           en: '?',                     effects: [S('ranged', 5)], conf: 'supposé', loot: 3 },
  healing_chant:    { name: 'Chant de guérison',        en: '?',                     effects: [H(3, 'all'), L], conf: 'supposé', loot: 3 },
  pyro_trap:        { name: 'Piège pyrotechnique',      en: 'Pyro Trap',             effects: [{ t: 'shieldDown', v: 4, silent: true }], conf: 'probable', loot: 3 },

  // ===== Butin ★4 (après le Golem de pierre) =====
  magic_skin:       { name: 'Peau magique',             en: 'Magic Skin',            effects: [P('round'), L], conf: 'probable', loot: 4 },
  arcane_blade:     { name: 'Lame arcanique',           en: 'Arcane Blade',          effects: [S('melee', 4), S('magic', 3)], conf: 'probable', loot: 4 },
  perfect_teamwork: { name: 'Coopération parfaite',     en: 'Perfect Teamwork',      effects: [{ t: 'drawDiscard', draw: 2, discard: 1 }, L], conf: 'probable', loot: 4 },
  crushing_blow:    { name: 'Coup écrasant',            en: '?',                     effects: [{ t: 'bossLoss', v: 3 }, L], conf: 'supposé', loot: 4 },
  plague_herald:    { name: 'Messager de la peste',     en: 'Plague Herald',         effects: [{ t: 'pestbote', v: 2 }], conf: 'probable', loot: 4 },
};

// PV / cartes en main lus sur les cartes Héros et Classe.
const HEROES = {
  troll:    { name: 'Troll de la jungle',    en: 'Jungle Troll',  emoji: '🧌', hp: 16, hand: 4,
              cards: ['throwing_axe', 'grandpas_belt', 'toad_smoothie', 'spirit_spear', 'horn_chieftain', 'ancestral_stone'],
              advanced: ['bone_club', 'shoulder_ram', 'grandmas_helmet', 'troll_round_blow'] },
  halfling: { name: 'Halfelin des collines', en: 'Hill Halfling', emoji: '🧒', hp: 11, hand: 6,
              cards: ['blinky', 'ancestral_stone', 'dent_maker', 'ornate_dagger', 'whisper_cloak', 'pebble_friends'],
              advanced: ['lucky_brooch', 'improvise', 'snarl_root', 'magic_slingshot'] },
  dwarf:    { name: 'Nain de cuivre',        en: 'Copper Dwarf',  emoji: '🧔', hp: 14, hand: 5,
              cards: ['rock_cleaver', 'tunnel_blaster', 'chest_piece', 'brass_knuckles', 'morning_star', 'titanium_bracers'],
              advanced: ['guard_helmet', 'rune_king', 'runestone', 'anti_boss'] },
  elf:      { name: 'Elfe des bois',         en: 'Wood Elf',      emoji: '🧝', hp: 14, hand: 5,
              cards: ['star_blade', 'arrow_volley', 'sunfire', 'magic_arrow_flurry', 'shield_of_light', 'gaias_bow'],
              advanced: ['precision_shot', 'protection_spell', 'diadem', 'lyrias_ring'] },
};

const CLASSES = {
  warrior: { name: 'Guerrier', en: 'Warrior', emoji: '🛡️', hp: 10, hand: 1,
             cards: ['amulet_bear', 'hand_crossbow', 'throwing_daggers', 'lightning_blade', 'chain_mail', 'sword_ruby_guard'],
             advanced: ['rune_vengeance', 'chivalrous', 'shoulder_spikes', 'feint'] },
  mage:    { name: 'Mage',     en: 'Mage',    emoji: '🔮', hp: 7,  hand: 2,
             cards: ['fireball', 'magic_explosion', 'ritual_dagger', 'flame_shield', 'obsidian_shards', 'energy_drain'],
             advanced: ['meteor_shower', 'demonic_pact', 'arcane_overload', 'deja_vu'] },
  rogue:   { name: 'Roublard', en: 'Rogue',   emoji: '🗡️', hp: 10, hand: 1,
             cards: ['shadow_blade', 'thorn_trap', 'hand_crossbow', 'throwing_knives', 'shadow_robe', 'hornet_sting'],
             advanced: ['curse_raven', 'poison_blade', 'smoke_bomb', 'viper_tooth'] },
  druid:   { name: 'Druide',   en: 'Druid',   emoji: '🌿', hp: 7,  hand: 2,
             cards: ['bluethorn_staff', 'magic_explosion', 'wall_of_roots', 'wyrmtooth_blade', 'murder_of_crows', 'magic_vortex'],
             advanced: ['mushroom_powder', 'antidote', 'phoenix_owl', 'mask_clairvoyance'] },
};

const ITEMS = {
  backpack: { name: 'Sac à dos',      emoji: '🎒', text: 'Pioche 3 cartes. Utilisable sans limite.' },
  potion:   { name: 'Potion de soin', emoji: '🧪', text: 'Un héros au choix regagne 8 PV. 1 potion par héros et par combat.' },
  charm:    { name: 'Porte-bonheur',  emoji: '🍀', text: 'Joue la carte du dessus de ta pioche. Ses éclairs sont ignorés. Débloqué après le Prince.' },
  // Après la Chasseuse d'âmes (★2) et le Dragon de l'éther (★3) — vus en vidéo.
  medbag:   { name: 'Sac de remèdes', emoji: '💼', text: "Un héros au choix retire 2 jetons d'état. Utilisable sans limite. Débloqué après la Chasseuse d'âmes." },
  waterskin: { name: 'Outre',         emoji: '🫗', text: 'Un héros au choix regagne 3 PV. 1 gorgée par héros et par combat. Débloquée après le Dragon de l’éther.' },
};

const DMG_LABEL = { melee: 'de mêlée', ranged: 'à distance', magic: 'magique' };
const DMG_ICON = { melee: '⚔️', ranged: '🏹', magic: '✨' };

function targetLabel(e) {
  if (e.same) return ' (ce même héros)';
  return { self: '', one: ' (un héros au choix)', all: ' (tous les héros)' }[e.target] || '';
}

function valueLabel(v) {
  if (v === 'd3') return '1-3 (au hasard)';
  if (v === 'round') return '= numéro du tour';
  if (v === 'myAttack') return "= attaque du boss qui te vise";
  return v;
}

function effectText(e) {
  const v = valueLabel(e.v);
  switch (e.t) {
    case 'attack': return `${DMG_ICON[e.dmg]} Attaque ${DMG_LABEL[e.dmg]} ${v}` +
      (e.backlash ? ` (si elle inflige ${e.backlash.min}+ : tu perds ${e.backlash.v} PV)` : '');
    case 'support': return `${DMG_ICON[e.dmg]}➕ Soutien ${DMG_LABEL[e.dmg]} ${v}`;
    case 'protect': return `🛡️ Protection ${v}${e.clear ? " (annule l'effet additionnel de l'attaque réduite)" : ''}`;
    case 'lightning': return '⚡ Action supplémentaire';
    case 'heal': return `❤️ Soin ${v}${targetLabel(e)}`;
    case 'draw': return `🃏 Pioche ${v}${targetLabel(e)}`;
    case 'cleanse': return `🧼 Retire ${v} jeton(s) d'état${e.target === 'self' ? ' (les tiens)' : targetLabel(e)}`;
    case 'grant': return `✱ ${e.same ? 'Ce héros' : 'Un autre héros au choix'} effectue immédiatement 1 action`;
    case 'selfDamage': return `💢 Tu perds ${v} PV`;
    case 'poisonBoss': return `☠️ Le boss reçoit ${v} Poison`;
    case 'bossLoss': return `💔 Le boss perd immédiatement ${v} PV`;
    case 'ifHp': return `Si tu as alors ${e.min} PV ou plus : ${e.then.map(effectText).join(', ')}`;
    case 'nextAttack': return e.boost
      ? `Si tu joues une Attaque ensuite, sa force augmente de ${e.boost}`
      : "Si tu joues une Attaque ensuite, un héros au choix est soigné de la force de cette Attaque";
    case 'redirect': return "✱ L'attaque du boss qui te vise est annulée. Redirige vers toi l'attaque visant un autre héros";
    case 'raven': return 'Pose cette carte devant toi : elle bloque le prochain effet d\'une capacité ⌛ du boss contre toi';
    case 'antiBoss': return 'La prochaine capacité ⌛ du boss est empêchée. Retire cette carte du combat';
    case 'improvise': return `Un héros au choix joue les ${e.v} cartes du dessus de sa pioche, l'une après l'autre`;
    case 'breakCurse': return '✂️ Une malédiction active d’un héros au choix va à la défausse des malédictions';
    case 'shieldDown': return `🔻 Le plus faible bouclier encore debout du boss perd ${v}` +
      (e.poisonIfBroken ? ` ; s'il est détruit, le boss reçoit ${e.poisonIfBroken} Poison` : '') +
      (e.silent ? " (sans déclencher l'effet du bouclier)" : '');
    case 'drawDiscard': return `🃏 Chaque héros pioche ${e.draw} cartes puis en défausse ${e.discard} au hasard`;
    case 'pestbote': return `Remets une autre carte de ta main sur ta pioche ; le boss reçoit ${v} Poison`;
    case 'choose': return e.from === 'dejavu'
      ? 'Joue 1 carte de ta défausse ou celle du dessus de ta pioche, puis retire-la du combat'
      : 'Regarde les 3 cartes du dessus de ta pioche, joues-en 1 et remets les autres dessus ou dessous';
    default: return '?';
  }
}

for (const [id, card] of Object.entries(CARDS)) {
  card.id = id;
  card.text = card.effects.map(effectText);
}

module.exports = { CARDS, HEROES, CLASSES, ITEMS, DMG_LABEL, DMG_ICON };
