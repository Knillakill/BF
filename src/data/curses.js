// Paquet de malédictions ★1 (17 cartes, débloqué après le Prince).
//
// Textes relevés dans les parties filmées (docs/recherche/cards.md, section 4) : 13 textes différents.
// La boîte en contient 17 : la répartition des 4 doublons est supposée.
//
// kind : 'temp'    = défaussée à la fin de la phase d'actions
//        'perm'    = gardée jusqu'à la fin du combat
//        'instant' = résolue en la révélant, puis défaussée
// Effets :
//   onPlay { per: 'any'|'attack'|'support'|'protect', hurt, poison }   à chaque carte jouée DE LA MAIN
//   random          les cartes de la main sont jouées au hasard
//   discardFirst    avant de jouer une carte de la main, en défausser une autre
//   handMinus       limite de main réduite
//   hitPoison       Poison reçu chaque fois que l'attaque du boss inflige des dégâts
//   instant { hurt, poison }
// Les cartes jouées par Improvisation ou le Porte-bonheur ne viennent pas de la main : elles échappent aux malédictions.

const CURSES = {
  hurt_any:       { name: 'Malédiction de l’usure',     kind: 'temp', onPlay: { per: 'any', hurt: 1 },
                    text: 'Tu perds 1 PV pour chaque carte que tu joues de ta main.' },
  hurt_protect:   { name: 'Malédiction du bouclier',    kind: 'temp', onPlay: { per: 'protect', hurt: 2 },
                    text: 'Tu perds 2 PV pour chaque carte avec Protection que tu joues de ta main.' },
  hurt_attack:    { name: 'Malédiction de la lame',     kind: 'temp', onPlay: { per: 'attack', hurt: 2 },
                    text: 'Tu perds 2 PV pour chaque carte avec une Attaque que tu joues de ta main.' },
  hurt_support:   { name: 'Malédiction du renfort',     kind: 'temp', onPlay: { per: 'support', hurt: 2 },
                    text: 'Tu perds 2 PV pour chaque carte avec un Soutien que tu joues de ta main.' },
  poison_support: { name: 'Malédiction du venin',       kind: 'temp', onPlay: { per: 'support', poison: 1 },
                    text: 'Tu reçois 1 Poison pour chaque carte avec un Soutien que tu joues de ta main.' },
  poison_protect: { name: 'Malédiction de la rouille',  kind: 'temp', onPlay: { per: 'protect', poison: 1 },
                    text: 'Tu reçois 1 Poison pour chaque carte avec Protection que tu joues de ta main.' },
  poison_attack:  { name: 'Malédiction de la morsure',  kind: 'temp', onPlay: { per: 'attack', poison: 1 },
                    text: 'Tu reçois 1 Poison pour chaque carte avec une Attaque que tu joues de ta main.' },
  discard_first:  { name: 'Malédiction du sacrifice',   kind: 'temp', discardFirst: true,
                    text: 'Avant de jouer une carte de ta main, tu dois en défausser une autre.' },
  random:         { name: 'Malédiction du chaos',       kind: 'temp', random: true,
                    text: 'Les cartes que tu joues de ta main sont choisies au hasard.' },
  perm_hitpoison: { name: 'Malédiction permanente du sang', kind: 'perm', hitPoison: 2,
                    text: 'Jusqu’à la fin du combat, tu reçois 2 Poison chaque fois que l’attaque du boss te blesse.' },
  perm_hand:      { name: 'Malédiction permanente de l’oubli', kind: 'perm', handMinus: 1,
                    text: 'Ta limite de cartes en main est réduite de 1 jusqu’à la fin du combat.' },
  instant_hurt:   { name: 'Malédiction instantanée',    kind: 'instant', instant: { hurt: 3 },
                    text: 'Tu perds immédiatement 3 PV.' },
  instant_poison: { name: 'Malédiction instantanée du poison', kind: 'instant', instant: { poison: 2 },
                    text: 'Tu reçois immédiatement 2 Poison.' },
};

// Composition du paquet ★1 (17 cartes).
const CURSE_DECK_1 = [
  'hurt_any', 'hurt_protect', 'hurt_attack', 'hurt_attack', 'hurt_support',
  'poison_support', 'poison_protect', 'poison_protect', 'poison_attack',
  'discard_first', 'random', 'perm_hitpoison', 'perm_hand',
  'instant_hurt', 'instant_hurt', 'instant_poison', 'instant_poison',
];

for (const [id, c] of Object.entries(CURSES)) c.id = id;

module.exports = { CURSES, CURSE_DECK_1 };
