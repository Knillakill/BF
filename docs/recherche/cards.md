# Boss Fighters QR – card / item / ability research from video transcripts

Sources: 22 transcripts in `scratchpad/yt_all/para/` + `ytc/ljd_prince.txt` (EN, FR, DE, IT auto-captions), all read in full by 6 parallel readers, cross-checked here.
Evidence format: `[video-id mm:ss] "quote"`. Confidence: **H** high / **M** medium / **L** low.
Official box-content sheet (`scratchpad/docs/contents.txt`) used for structure (what unlocks when).

## 0. Who plays what (basis for deck attribution)

| Video | Players (hero + class) |
|---|---|
| 2oLVFqeeX6Y (FR, Penelope) | Dwarf+Warrior; Troll+Mage |
| auGmMR4G4-g (IT, Lo Chef) | Elf+Warrior ("Arwen"); Dwarf+Druid ("Durin") |
| 8g2r2DRHxlo (EN, MMATT) | Halfling+Rogue; Elf+Druid |
| gtZlsI0ZlI8 (EN, One Last Hand) | Troll+Druid; Dwarf+Warrior |
| i4hZkiiLZD0 (EN, BGG) | Troll+Mage; Halfling+Rogue; Elf+Druid; Dwarf+Warrior |
| QWO1y4VAMEI (EN, One Stop) | Dwarf+Warrior; Troll+Mage |
| epTuGIoZMvs (EN/IT) | Dwarf+Warrior; Troll+Mage |
| pAqJAM7xdE0 + ytc/ljd_prince (FR, JdD) | Troll+Mage (Max); Halfling+Warrior (Marie); Elf+Rogue |
| 3Hs-ECigZFo (FR, Armicwan) | Dwarf+Warrior (Armic); Troll+Druid (Lulu) |
| -V40B9z8HuY, 4XWvG_o65PI (FR) | Troll+Druid; Elf+Rogue |
| jQ49C9ymzmI (FR) | solo 4 heroes, Elf+Mage |
| VGxhoQvD5iA (DE, Geekpunkt) | Dwarf+Rogue (Basti); Elf+Mage (Connie) |
| e0z4d603TE8 (DE, Brettspielblog) | Troll+Warrior (Flo); Halfling+Rogue (Ben) |
| IJ13O0AxXuw (DE, Brettspielblog, 3p, bosses 1-5) | Troll+Druid; Elf+Mage; Halfling+Rogue |
| 5Pczj34gmtY (DE, Pegasus Elite mode, endgame decks) | Troll+Mage (M. Palm); Elf+Warrior; Dwarf+Druid; Halfling+Rogue |
| aLUeHAx8UJ4 (DE, Pegasus) | Troll+Rogue; Halfling+Druid; Elf+Warrior |

HP / hand values in cards.js are confirmed by every sum heard (Troll 16/4, Halfling 11/6, Dwarf 14/5, Elf 14/5, Warrior 10/+1, Mage 7/+2, Rogue 10/+1, Druid 7/+2). Examples: Troll+Rogue 26/5, Halfling+Druid 18/8, Elf+Warrior 24/6 [aLUeHAx8UJ4 4:03-4:44]. **H**

## 1. Advanced action cards (bronze box) – final allocation

Method: intersect the hero+class of every player seen playing or holding each card.

| Deck | 4 advanced cards | Conf |
|---|---|---|
| Troll | Bone Club, Shoulder Ram, Grandma's Helmet, **"Kawumm"** (melee = round + ⚡) | H |
| Halfling | Lucky Brooch, Improvise, Snarl Root, **Magic Slingshot** (new) | H |
| Dwarf | Guard Helmet, Rune of the King, Runestone, **Anti-Boss-3000** | H |
| Elf | **Lyria's Ring**, Protection Spell, Diadem of Invisibility, Precision Shot | H |
| Warrior | Chivalrous Assistance, Feint, Shoulder Spikes, **Rune of Vengeance** | H |
| Mage | Meteor Shower, Demonic Pact, Arcane Overload, Déjà-vu | H |
| Rogue | Curse of the Raven, Poison Blade, Smoke Bomb, Viper Tooth | H |
| Druid | Mushroom Powder, Antidote, Phoenix Owl, **Mask of Clairvoyance** | H |

Key evidence:
- **Anti-Boss-3000 = Dwarf.** [VGxhoQvD5iA 38:17] the Dwarf+Rogue player, unlocking cards: "Ich bekomme für meinen Zwerg … ich kriege den Antiboss 3000 … Bekommen wir natürlich noch Karten für unsere Klasse. Da bekomme ich noch den Vieperzahn". He plays it at [58:47] and [130:29]. In [auGmMR4G4-g 20:30] the Dwarf+Druid player's Mask reveals "antiboss … Roomstone … Tatium Bracher", and he plays it at [38:09]. In 4+ fights Flo (Troll+Warrior, e0z4d603TE8) never has it. The invented `dwarf_unknown` must go. A 4th reader proposed Shoulder Spikes as the Dwarf card, but that is refuted by Flo (Troll+Warrior) playing "Schulterdorn" [e0z4 4:11, 19:51, 151:42].
- **Rune of Vengeance = Warrior.**
  - It is played by a Dwarf+Warrior [i4hZ 48:52; QWO 16:23], by an Elf+Warrior [auGm 30:43], by a Halfling+Warrior (Marie, [pAq 65:32-66:13; ljd 65:49]) and by a Troll+Warrior (Flo, [e0z4 18:29, 72:41, 112:06, 229:11]).
  - Also [IJ13 238:33] "Rune der Rache für Zwerge … Nee, Kämpfer ist das oder? Ja … Krieger".
  - [3Hs 31:37] Dwarf+Warrior lists his 8 new cards: "acte chevaleresque, la feinte, les épaulettes à pointe, la rune de vengeance, la rune du roi, la pierre de rune, le casque de garde, l'antiboss 3000".
- **Feint and Shoulder Spikes = Warrior.** Flo (Troll+Warrior) holds Bone Club, Shoulder Ram, Grandma's Helmet, Kawumm, Feint, Shoulder Spikes, Chivalrous and Rune of Vengeance, which is exactly 8 [e0z4].
- **Halfling.**
  - Magic Slingshot ("Zauberzwille") is played by Halfling+Rogue players [e0z4 224:20; IJ13 49:25; i4hZ 50:56].
  - Improvise is played by Halfling+Rogue players [i4hZ 68:40; 8g2r 20:53; 5Pcz 19:08; e0z4 17:48] and by a Halfling+Warrior (Marie, [ljd 54:53, 83:39], where she targets herself).
  - Rogue's four are fixed by the Dwarf+Rogue player [VGxh 38:17, 58:05, 67:42, 83:24]. One FR reader attributed Improvise to the Elf+Rogue player in pAq; the line at [pAq 55:26] is ambiguous and is outweighed by the evidence above.
- **Lyria's Ring = Elf.** It is played by an Elf+Warrior [auGm 18:29, 26:38], an Elf+Druid [i4hZ 38:03] and an Elf+Mage [IJ13 40:29, 93:40, 161:56; VGxh 85:28].
- **Mask of Clairvoyance = Druid.** It is played by a Troll+Druid [IJ13 45:15, 94:21], a Dwarf+Druid [auGm 19:49; 5Pcz 15:44 "Maske der Hellsicht, das [ist] meine … Druidenfähigkeit"] and an Elf+Druid [i4hZ 51:37; 8g2r 16:11].
- **Phoenix Owl, Antidote and Mushroom Powder = Druid.** They are played by a Troll+Druid [IJ13 46:37, 63:59, 66:01, 157:03; 3Hs 44:36, 46:43], a Dwarf+Druid and an Elf+Druid, and by a Halfling+Druid for Mushroom Powder [aLUe 10:52].
- **Protection Spell, Diadem and Precision Shot = Elf.** They are played by an Elf+Mage [IJ13 70:15, 41:10; VGxh 47:07, 119:34, 122:18], an Elf+Warrior [auGm 30:43, 32:03, 35:25] and an Elf+Druid [8g2r 16:11, 16:52].

## 2. Card texts (all decks) with FR / DE names

FR = name heard in French videos (Gigamic edition). The catalog's current FR name is noted where it differs. DE = German name heard.

### Troll (FR Troll de la jungle / DE Dschungeltroll)
| id | EN | FR heard | DE heard | Effect (verified) | Conf |
|---|---|---|---|---|---|
| throwing_axe | Throwing Axe | Hache de lancer | Wurfbeil | ranged attack 2 [QWO 8:12; e0z4 3:29; 4XW 9:35] | H |
| grandpas_belt | Grandpa's Belt | Ceinture / **Ceinturon** de grand-père (both heard) | Opas Gürtel | Protection 3 [IJ13 284:37; 3Hs 50:11; e0z4 3:29] | H |
| toad_smoothie | Toad Smoothie | Smoothie de crapaud | Krötensmoothie | a hero gains 3 HP, that hero draws 2 [3Hs 43:14; QWO 4:44] | H |
| spirit_spear | Spirit Spear | Lance spirituelle | Geisterspeer | magic attack 3 [e0z4 57:29; IJ13 147:12] | H |
| horn_chieftain | Horn of the Chieftain | Corne du chef | Horn des Häuptlings | a hero draws 3, that hero immediately does 1 action (can be yourself) [3Hs 12:26; e0z4 143:18] | H |
| ancestral_stone | Ancestral Stone | Pierre ancestrale | Ahnenstein | magic support 4 | H |
| bone_club | Bone Club | Matraque d'os | Knochenkeule | melee 4; if ≥15 HP draw 2 | H |
| shoulder_ram | Shoulder Ram | "Épaulette bélier" (heard) | Schulterramme | melee support 3; if ≥15 HP gain 3 HP [3Hs 46:43; e0z4 98:09] | H (FR name L) |
| grandmas_helmet | Grandma's Helmet | Casque de grand-mère | Omas Helm | Protection 4 (any hero); if you have ≥15 HP remove 2 of YOUR status tokens [5Pcz 51:49; IJ13 288:06] | H |
| troll_round_blow | ? (EN maybe "Whack", gtZ 3:24, L) | "Craque" (heard [3Hs 55:03], L) | **Kawumm / Krawumm** (heard many times, IJ13 & e0z4, M) | melee attack = current round number; ⚡ [gtZ 3:24 "Melee attack. The strength of this attack is equal to the current round … Perform one additional action"] | H effect |

### Halfling (FR Halfelin(e) des collines / DE Hügelhalbling)
| id | EN | FR | DE | Effect | Conf |
|---|---|---|---|---|---|
| blinky | Blinky | – | Blinky | magic 3 | H |
| dent_maker | Dent Maker | – | Beulenmacher | ranged 3 | H |
| ornate_dagger | Ornate Dagger | – | – | (melee 2, not heard) | – |
| whisper_cloak | Whisper Cloak | Cape du murmure | – | Protection 3 | H |
| pebble_friends | Pebble Friends | – | Kieselfreunde | ranged support 4 | H |
| lucky_brooch | Lucky Brooch | – | Glücksbrosche | Protection 2 (a hero of your choice) + ⚡ [e0z4 139:52; IJ13 145:52 "Welcher Held erhält Schutz"] | H |
| improvise | Improvise | Improvisation | Improvisieren | a hero of your choice plays the top 2 cards of their draw pile one after the other. Resolve ⚡ of the 1st card before the 2nd [ljd 89:12, M]. Cards played this way are not "from hand" for curses [e0z4 26:42] | H |
| snarl_root | Snarl Root | (said in EN "Snarl root") | "Sausekraut" (heard) | you gain 3 HP (self only); 2× ⚡ | H |
| **magic_slingshot (NEW)** | Magic Slingshot | (FR name not heard; [ljd 53:00] "ça qui fait 2 et 2 … distance et magie") | Zauberzwille | ranged attack 2 + magic attack 2 [e0z4 224:20 "Fernkampfangriff 2, Magieangriff 2"; IJ13 69:33] | H |

### Dwarf (FR Nain de cuivre / DE Kupferzwerg)
| id | EN | FR heard | DE | Effect | Conf |
|---|---|---|---|---|---|
| rock_cleaver | Rock Cleaver | **Tranche-roche** (catalog: Fendeur de roche) | Felsspalter | melee 4 | H (FR M-H) |
| tunnel_blaster | Tunnel Blaster | **Souffleur de tunnel** [2oLV 50:20] | Stollensprenger | ranged 2 | H (FR M) |
| chest_piece | Chest Piece | Plastron | Wampenschoner | Protection 4 (any hero) | H |
| brass_knuckles | Brass Knuckles | "point/poing de cuivre" (catalog: Poing américain) | Schlagring | melee support 3 | H (FR M) |
| morning_star | Morning Star | **Fléau d'armes** (catalog: Morgenstern) | Morgenstern | melee support 5; you lose 2 HP, even if the support is ineffective [VGxh 116:08] | H |
| titanium_bracers | Titanium Bracers | Brassard(s) de/en titane | Titan-Armschienen | Protection 2 + Protection 2 (same or different heroes) | H |
| guard_helmet | Guard Helmet | Casque de garde | Gardehelm | Protection 2 (any hero) + remove 1 status token from any hero | H |
| rune_king | Rune of the King | Rune du roi | Rune des Königs | each hero draws 1; ⚡ | H |
| runestone | Runestone | **Pierre de rune** (catalog: Pierre runique) | Runenstein | magic attack = round number; ⚡ | H |
| anti_boss | Anti-Boss-3000 | Antiboss 3000 | Antiboss 3000 | the next (hourglass ⌛) boss ability is prevented; remove this card for the rest of the fight. The app also used it to block the *reaction* ability "Crachat empoisonné / Giftspucken" [2oLV 51:45; VGxh 64:57] | H |

### Elf (FR Elfe des bois / DE Waldelfe)
| id | EN | FR | DE | Effect | Conf |
|---|---|---|---|---|---|
| star_blade | Star Blade | – | Sternenklinge | melee 3 | H |
| arrow_volley | Arrow Volley | Volée de flèches | Pfeilsalve | ranged support 4 | H |
| sunfire | Sunfire | Feu solaire | Sonnenfeuer | magic 4 | H |
| magic_arrow_flurry | Magic Arrow Flurry | – | Magischer Pfeilsturm | magic support 3 | H |
| shield_of_light | Shield of Light | – | Lichtschild | Protection 3 | H |
| gaias_bow | Gaia's Bow | Arc de Gaïa ("coup d'arc") | Gajas Bogen | ranged 4 + a hero of your choice draws 1 | H |
| precision_shot | Precision Shot | Tir de précision | Gezielter Schuss | ranged = round; ⚡ | H |
| protection_spell | Protection Spell | Sort de protection | Schutzzauber | Protection 2 + ⚡ [pAq 53:25 "me donne que deux en protection mais … action supplémentaire"; 8g2r 16:11; IJ13 70:15] | **H** (was supposé) |
| diadem | Diadem of Invisibility | Diadème d'invisibilité | Diadem der Unsichtbarkeit | if the very next card you play has an attack, +3 to it; ⚡. Does not boost supports [8g2r 23:35; VGxh 127:03]. With Meteor Shower only the first attack gets +3 [IJ13 181:30] | H |
| lyrias_ring | Lyria's Ring | (not heard) | Lyrias Ring | ALL heroes gain 2 HP; ⚡ [IJ13 161:56; i4hZ 38:03, 80:10; auGm 26:38] | H |

### Warrior (FR Guerrier / DE Krieger)
| id | EN | FR heard | DE | Effect | Conf |
|---|---|---|---|---|---|
| amulet_bear | Amulet of the Bear | Amulette de l'ours | (Amulett des Bären?) | melee support 3 | H |
| hand_crossbow | Hand Crossbow | **Arbalète à main** [2oLV 12:54] (catalog: de poing) | Handarmbrust | ranged attack 3 | H (FR M) |
| throwing_daggers | Throwing Daggers | Dagues de lancer | Wurfdolche | **ranged SUPPORT 3** [3Hs 13:10 "Comme j'ai joué une arbalète, je vais jouer un soutien … dagues de lancer … trois de dégâts à distance"; epTu 8:10 Dwarf Warrior "range support"] | M-H |
| lightning_blade | Lightning Blade | **Lame de foudre** [2oLV 12:54, 31:11] (catalog: Lame-éclair) | Klingenblitz | magic 3 | H (FR M-H) |
| chain_mail | Chain Mail | Cotte de mailles | Kettenhemd | **Protection 4** [e0z4 138:29 "vier Schutz"; auGm 23:52; 5Pcz 41:38] | M-H |
| sword_ruby_guard | Sword of the Ruby Guard | Épée à la garde de rubis | Schwert der Rubingarde | melee 4 | H |
| chivalrous | Chivalrous Assistance | **Acte chevaleresque** (heard 3×; catalog: Aide chevaleresque) | Ritterlicher Beistand | the boss attack currently targeting you is cancelled; redirect a boss attack targeting another hero onto you. Only useful if you are targeted AND the other hero is still targeted [e0z4 91:16-94:44, editor's chat ruling] | H |
| shoulder_spikes | Shoulder Spikes | Épaulettes à pointe(s) | Schulterdornen | melee attack 2 + Protection 2 (a hero of your choice) | H |
| feint | Feint | Feinte | Finte | **melee SUPPORT 2 + ⚡** [e0z4 11:01 "Die Finte. Verstärkung 2. Ich führe eine weitere Aktion aus"; 3Hs 31:37; auGm 12:56] | H |
| rune_vengeance | Rune of Vengeance | Rune de vengeance | Rune der Rache | ranged attack = value of the boss attack targeting you; if it deals ≥9 damage, you lose 4 HP. Protection you put on yourself first lowers it [ljd 65:49] | H |

### Mage (FR Mage / DE Magier)
| id | EN | FR | DE | Effect | Conf |
|---|---|---|---|---|---|
| fireball | Fireball | Boule de feu | Feuerball | magic 4 | H |
| magic_explosion | Magic Explosion | Explosion magique | Magische Explosion | magic support 4 (also in Druid deck) | H |
| ritual_dagger | Ritual Dagger | Dague rituelle | Ritualdolch | melee 3 | H |
| flame_shield | Flame Shield | Bouclier de flammes | Flammenschild | magic support 2 + Protection 2 (any hero) | H |
| obsidian_shards | Obsidian Shards | Éclats d'obsidienne | Obsidiansplitter | ranged 3 [5Pcz 21:10] | H |
| energy_drain | Energy Drain | Drain d'énergie | Energiesog / Energieentzug | magic 2 + a hero gains 2 HP | H |
| meteor_shower | Meteor Shower | Pluie de météores | Meteoritenschauer | melee 1-3, ranged 1-3, magic 1-3 (random); you lose 2 HP | H |
| demonic_pact | Demonic Pact | Pacte démoniaque | Dämonischer Pakt | Protection 5 (any hero); the card's player loses 2 HP [pAq 87:15-88:38] | H |
| arcane_overload | Arcane Overload | Surcharge arcanique | Arkane Überladung | magic 2 + ⚡ | H |
| deja_vu | Déjà-vu | Déjà vu | Déjà-vu | play 1 card from your discard pile or the top of your draw pile; then remove THAT played card for the rest of the fight | H |

### Rogue (FR Roublard(e), sometimes "Voleur" / DE Schurke)
| id | EN | FR | DE | Effect | Conf |
|---|---|---|---|---|---|
| shadow_blade | Shadow Blade | – | Schattenklinge | melee 3 [VGxh 91:38] | M |
| thorn_trap | Thorn Trap | – | Dornenfalle | melee support 4 | H |
| throwing_knives | Throwing Knives | – | Wurfmesser | ranged support 3 | H |
| shadow_robe | Shadow Robe | – | Schattenrobe | Protection 3 | H |
| hornet_sting | Hornet Sting | Piqûre de frelon | Hornissenstachel | ranged 2 + ⚡ | H |
| curse_raven | Curse of the Raven | Malédiction du corbeau | Fluch des Raben | boss immediately loses 2 HP. Place face-up next to your hero; discard it to prevent the effect of one ⌛ ability that targets you (other heroes are still hit) [i4hZ 33:59; pAq 92:02, 150:23]. It goes to the discard pile, not removed [i4hZ 44:08] | H |
| poison_blade | Poison Blade | Lame empoisonnée | Giftklinge | melee 2 + boss gets 1 poison | H |
| smoke_bomb | Smoke Bomb | Bombe fumigène | Rauchbombe | Protection 2 (any hero) + cancels the additional effect of the reduced boss attack; ⚡ | H |
| viper_tooth | Viper Tooth | (Croc de vipère?, not heard) | Vipernzahn | ranged 2 + boss gets 1 poison [e0z4 175:56] | H |

### Druid (FR Druide / DE Druide)
| id | EN | FR | DE | Effect | Conf |
|---|---|---|---|---|---|
| bluethorn_staff | Bluethorn Staff | – | Blaudornstab | magic 3 | H |
| wall_of_roots | Wall of Roots | Mur de racines | Wurzelwand | Protection 3 | H |
| wyrmtooth_blade | Wyrmtooth Blade | "Lame à dent de wyvre/vouivre" (L) | Wurmzahnklinge | melee 3 | H |
| murder_of_crows | Murder of Crows | Nuée de corbeaux | Krähenschwarm | ranged 4 | H |
| magic_vortex | Magic Vortex | Vortex magique | Magiewirbel | magic 2 + ⚡ | H |
| mushroom_powder | Mushroom Powder | – | Pilzpulver | a hero gains 5 HP; that hero may immediately do 1 action | H |
| antidote | Antidote | Antidote | Antidot | remove 2 status tokens from a hero of your choice; ⚡ [3Hs 46:43; IJ13 63:59; i4hZ 27:48] | H |
| phoenix_owl | Phoenix Owl | "Phénix-hibou" (heard, M) | Phönixeule | if the next card you play has an attack, heal a hero of your choice by that attack's strength; ⚡. Not with supports [IJ13 178:40] | H |
| mask_clairvoyance | Mask of Clairvoyance | (Masque de clairvoyance, not heard) | Maske der Hellsicht | look at your top 3 cards, play 1, put the other 2 back in any order OR under your draw pile | H |

## 3. Loot cards (5 per star level; each player takes 1; max 1 loot per star level in a deck)

### ★1 (after the Prince, bronze box). All 5 are confirmed. **H**
- **Arcane Monocle** (FR Monocle arcanique, DE Arkanes Monokel): ranged support 3 + magic support 3 [e0z4 6:14; ljd 101:47]. gtZ "ranged and melee" is a misspeak.
- **Curse Breaker** (FR Brise-malédiction, DE Fluchbrecher): move one active curse from a hero of your choice to the curse discard pile. No ⚡.
- **Banner of Courage** (FR Bannière de bravoure, DE Banner des Mutes): ANOTHER hero of your choice immediately does 1 action; ⚡.
- **Blade of Wind** (FR Lame du vent, DE Klinge des Windes): melee attack 3; ⚡ [e0z4 2:07 "Nahkampfangriff 3"].
- **Living Boots** (FR Bottes animées): Protection 1; a hero of your choice draws 1; ⚡.

### ★2 (after the Soul Huntress) [e0z4 36:18; IJ13 183:36]. **M**
- **Himmelsrune** (DE; ≈ "Sky/Celestial Rune", FR lore "rune céleste"): magic attack 4 + a hero of your choice draws 1.
- **Ansporn(en)** (DE, name unsure): a hero of your choice draws 3, that hero immediately does 1 action.
- **Wurfschild des Gladiators** ("Gladiator's throwing shield"): ranged support 3 + Protection 3. One mention says "melee", so the type is uncertain.
- **Waffengift** ("weapon poison"): lower a boss shield of your choice by 2; if that destroys it, the boss gets 2 poison.
- **Schicksalsmünze** ("coin of fate"): melee support 5.

### ★3 (after the Aether Dragon) [IJ13 226:56]. **M/L**
- **Geweihte Schulterplatten** ("consecrated pauldrons"): Protection 4 + cancels the additional effect of the reduced boss attack.
- **Elixier der Sorglosigkeit**: remove status token(s) (one hero / every hero; garbled).
- An unnamed ranged support 5.
- **"Kokon"?**: ALL heroes gain 3 HP; ⚡. Also [5Pcz 34:10] and [jQ 11:54] "Tous les héros gagnent chacun trois points de vie … action supplémentaire", "unlocked very fast". This is NOT Lyria's Ring.
- **Pyrofalle** ("pyro trap"): lower a boss shield of your choice by 4 without triggering the shield's effect.

### ★4 (after the Stone Golem) [IJ13 269:27]. **M/L**
- **Magische Haut** ("magic skin"): Protection = round number; ⚡. [5Pcz 42:19] instead says heal 3 + ⚡, so it is uncertain.
- **Arkane Klinge**: melee support 4 + magic support 3.
- **Perfektes Zusammenspiel** ("perfect teamwork"): every hero draws 2, then puts 1 hand card back. Per [5Pcz 19:08] it goes face-down on top of the draw pile; per [IJ13] it is discarded. ⚡.
- "Bumerang"?: boss loses 3 HP; ⚡.
- **Pestbote** ("plague herald"): playable only if you also put another hand card on top of your draw pile; the boss gets 2 poison.

### ★5 (after the Three-Headed Ogre) [IJ13 319:27-320:50]. **L/M**
- **Wunderlampe** ("magic lamp"): a hero of your choice plays the top 3 cards of their draw pile; remove the lamp for the rest of the fight.
- **Hypernova**: magic support 7; you lose 2 HP.
- **Borax' Kriegshammer**: melee attack (value missed) + a hero removes 1 status token.
- **Amulett der Zeit** ("amulet of time"): repeat the last played card with an attack.
- **Geisterrüstung** ("ghost armour"): big protection plus a drawback. [IJ13] reads "Protection 3 + take a status token of your choice"; [5Pcz 50:29] reads "sechs Schutz und dann noch mal drei".

### Star level unknown (Elite-mode endgame decks [5Pcz]; IJ13 end sorting). **L**
- Stachel des Frostskorpions: boss loses 3 HP + gets 2 poison.
- Giftexplosion: boss takes 3 damage per poison token on it, then its poison is removed.
- Toxikum: for the rest of the fight, poison deals +1 to the boss.
- Lichtpfeile: if the next card is a ranged attack, it gets ⚡.
- Zwillingsklinge: melee support 4 + …
- Helm des Windes: Protection 3 …
- Geflügelter Schild: the chosen hero is not attacked + ⚡.
- Träne des Mitleids: kept in front of you, later cancels damage.
- Lavaaxt: attack; you get poison and lose 2.
- Druidenarmschienen: protection.
- An unnamed card: melee attack 4; if the next card has protection, +3 to it.

★6-★10 loot was never seen.

## 4. Curses (bronze ★1: 17 cards; +5 at ★2; +5 at ★3)

Rule card, read aloud [3Hs 66:46; VGxh 80:41; gtZ 30:27; ljd 106:51]:
- When you receive a curse, draw a curse card and place it face down next to your hero without reading it.
- Reveal all curses you received at the start of **phase 3 (action phase)** and resolve them. The printed DE rulebook says "phase 5"; the players treat that as a misprint and the app uses phase 3.
- A curse drawn mid-round is not active yet [IJ13 82:39].

Types:
- **Temporary**: "Place this curse on the curse discard pile at the end of the action phase."
- **Permanent**: "Keep this curse until the end of the fight."
- **Instant** ("Sofortiger Fluch"): resolve on reveal, then discard.

All curses are cleared after the fight. Protection that cancels the additional effect of an attack also prevents the curse [IJ13 81:15].

Curse texts heard (mostly **H**, several heard in 2+ videos):
1. Lose 1 HP for each card you play from your hand.
2. Lose 2 HP for each hand card with a Protection you play.
3. Lose 2 HP for each hand card with an Attack you play. A support is not "a card with an attack" [pAq 146:59].
4. Lose 2 HP for each hand card with a Support you play.
5. Gain 1 poison for each hand card with a Support you play.
6. Gain 1 poison for each hand card with a Protection you play.
7. Gain 1 poison for each hand card with an Attack you play.
8. PERMANENT: until the end of the fight, gain 2 poison whenever you take damage from a boss attack.
9. Before playing a hand card, you must discard another hand card.
10. You may only play hand cards at random (shuffle your hand, draw one, play it).
11. PERMANENT: your hand limit is reduced by 1 until the end of the fight.
12. INSTANT: lose 3 HP.
13. INSTANT: gain 2 poison.
14. Lose 3 HP and gain 2 poison [pAq 104:13]. This may be the same card as 12 or 13. M.

Later sets (from ★3+, Ogre era) [IJ13 293:30, 309:51]. **M**
- PERMANENT: gain 1 paralysis whenever you take boss-attack damage.
- Gain 1 paralysis per hand card with an Attack.
- Gain 1 panic per hand card with Protection.

Cards played through Improvise or the Lucky Charm are not "from your hand" and dodge these curses [e0z4 26:42; pAq 121:25].

### Status tokens
- **Poison**: in phase 5, lose 1 HP per token. Tokens stay until removed by card or item effects; they also hurt the boss.
- **Panic** (rule card ★2) [VGxh 100:33]: with ≥1 panic you may only play hand cards at random. After playing, discard 1 panic. Items can still be chosen freely.
- **Paralysis** (rule ★3) [IJ13 233:47]: −1 hand limit per token (only matters in phase 7). Removable only by card effects.
- **Fire** (rule ★6) [IJ13 330:37]: in phase 5, for each fire token reveal your top card and either remove it for the fight or discard it and lose 2 HP.
- **Slime** (★8, 20 slime cards + rule card, boss Jelly): no transcript reached it. Nothing found.

## 5. Hero and class abilities / levels

Unlock schedule (box sheet + IJ13):
- Hero level 2 cards at ★3, after Aether Dragon [IJ13 225:35 "Nehmt die nächsten 18 Karten. Vier Heldenkarten"].
- Hero level 3 at ★5.
- Class level 2 at ★6.
- Class level 3 at ★8.

Level 2 hero: HP and hand unchanged [IJ13 230:23 "ich habe immer noch nur 21"]. **H**

**Hero abilities (level 2; per IJ13 the ability stays the same at level 3):**
- **Troll**: the first time in your turn you damage the boss with an attack, play the top card of your draw pile [IJ13 229:00, 297:40]. A later version adds "or use Grandpa's Glass Eye" [e0z4 244:45; 5Pcz 13:43]. **H**
- **Halfling**: when you destroy a boss shield, the boss immediately loses 4 HP [IJ13 225:35; 5Pcz 8:57]. **H**
- **Elf**: your supports deal +2 damage if you yourself already played an attack of that type this round [IJ13 229:43, 305:07]. **H**
- **Dwarf**: when you fully protect a hero (reduce an attack to 0), you may immediately play an attack [5Pcz 6:54, 12:21, 30:04]. **M-H**

**Hero level 3**: same ability, more HP [IJ13 318:46-319:27]. **M**
- Troll +6 (16→22): "mein Lebenspunkt um sechs erhöhen. Der Rest ist gleich".
- Halfling +4 (11→15).
- Elf +5 (14→19).
- Dwarf: not heard.

Level-3 titles (DE): Trollhäuptling, Elfenbewahrerin, Zwergen-Schatzhüter, Halbling-Glücksmeisterin.

**Class abilities** (read from the class level stack [IJ13 320:50, 328:29]; 5Pcz endgame):
- **Mage**: each time you lose 1+ HP, you may draw 1 card [IJ13; 5Pcz 23:13]. **H**
- **Rogue**: you may play supports without an attack of that type having been played [IJ13]. **H**
- **Druid**: the first Protection you play each round gains ⚡ [IJ13, M]. 5Pcz shows a Druid extra action after protecting or healing another hero. **M**
- **Warrior**: with your first attack in a round, ignore the boss's shield [IJ13]. **M**

Class level-3 titles: Erzmagier, Elitekriegerin, Hochdruide, Schurkenkönigin.

Class level-3 HP: not heard. 5Pcz endgame 4-player HP were 33/34/30/30 (Troll+Mage / Elf+Warrior / Dwarf+Druid / Halfling+Rogue, order uncertain). That is about +9-10 per player over the base, consistent with hero +4..+6 plus class +4..+5. **L**

## 6. Items

| Item | Unlock | Effect | Conf |
|---|---|---|---|
| Backpack (Sac à dos / Rucksack) | after tutorial | Action: draw 3. Unlimited uses; no ⚡ | H |
| Healing Potion (Potion de soin / Heiltrank) | after tutorial | Action: a hero of your choice gains 8 HP, then the potion is removed. The group has 1 potion PER HERO per fight, as a shared pool (one hero may drink several, can target others); refilled each fight [pAq 101:32 "En tant que groupe, vous possédez une potion de soin par héros pour chaque combat"] | H |
| Lucky Charm (Porte-bonheur / Glücksbringer) | ★1, Prince's treasure | Action: play the top card of your draw pile; ⚡ on it is ignored. Unlimited; the card is not "from hand" | H |
| Medical Bag (Sac médical / "sac de remède" / Medizintasche) | ★2 | Action: remove 2 of your status tokens. Reusable [VGxh 101:13 "kannst du auch öfters benutzen"] | M-H |
| Waterskin (Trinkschlauch; FR "gourde"? not heard) | ★3 | Action: gain 3 HP [IJ13 229:00; jQ 21:29]. Probably unlimited | M |
| Grandpa's Glass Eye (Œil de verre de grand-père / Opas Glasauge) | ★3 | Action: look at your top 3 cards and put them back in any order (you do NOT play one) [5Pcz 18:28; IJ13; jQ 22:12] | M-H |
| Phoenix Essence (Essence de phénix / Phönixessenz), promo | sits on top of the bronze box | Once per fight: every hero shuffles their hand into their draw pile and redraws the same number [pAq 39:12, 44:44; 5Pcz 66:10] | M-H |
| Ticking Bomb | Bombossa boss | a boss token passed from hero to hero, not a player item [jQ 22:52] | L |
| Voodoo doll | – | not found in any transcript | – |

Other items mentioned: an app promo "mysterious egg" [e0z4 246:56]; "Omas alter Hut" [HBXM 10:14] (L).

## 7. Rules clarifications seen in play

- **Deck building** (rulebook read aloud [VGxh 142:39-145:21]):
  - The deck must have at least 20 cards. Max 1 loot card per star level. Before each fight you may rebuild freely.
  - For each extra card you may leave one card out.
  - Unchosen loot goes back to the box.
  - The editor confirmed in chat: "du darfst von jeder Sternstufe je eine mitnehmen", swappable between fights [e0z4 82:15]. **H**
- **Deck size**: tutorial 6+6 = 12; after the tutorial +4 hero +4 class = 20. Nothing can be removed at that point [IJ13 26:44].
- **Support**: needs an attack (not a support) of the same type played earlier THIS round by ANY hero. Otherwise the app says "Ineffective", but the card's other effects still happen (⚡ of Feint, self-damage of Morning Star) [e0z4 91:58; VGxh 116:08; i4hZ 48:12].
- **⚡ chains** are unlimited. ⚡ from a card played via the Lucky Charm is ignored. Improvise: resolve the first card's ⚡ before the second card.
- **Protection**: you can give it to any hero. Reducing an attack to 0 cancels its additional effect (poison, curse).
- **Healing** never goes above starting HP. Full reset between fights (HP, tokens, removed cards, curses, potions).
- **Round phases**:
  1. Boss prepares attacks.
  2. Shields.
  3. Actions: 3 per hero, alternating; the team chooses who starts.
  4. Boss attacks.
  5. Status (poison).
  6. Recurring abilities.
  7. Discard played cards plus any you want, then draw up to the hand size. Hand size is not a maximum during the round.
- One hero dying = everyone loses. You may not tell each other exact numbers.
- **Boss order**:
  1. Mr. Puppet (FR l'Épouvantail): tutorial, 48 HP with 2 players.
  2. Prince (FR le Prince, DE der Prinz).
  3. Soul Huntress (FR la Chasseuse d'âme, DE Seelenjägerin).
  4. Aether Dragon (FR "Dragon des terres"?, DE Ätherdrache).
  5. Stone Golem (DE Steinriese).
  6. Three-Headed Ogre (FR Ogre à trois têtes, DE Dreiköpfiger Oger).
  7. Tentacolossus (FR "Kraken").
  8. Magmaros.
  9. Bombossa.
  10. Jelly (FR Monstre gélatineux).
  11. Madame Voodoo (FR Madame Vaudou).
- Difficulty has 4 levels (FR débutant/intermédiaire/pro/extrême). There is also an Elite mode.

## Corrections to cards.js

Each change below is supported by the evidence above.

1. **`dwarf_unknown` → DELETE.** It is invented. Replace with `anti_boss` in `HEROES.dwarf.advanced`.
2. **`anti_boss`**: move from `CLASSES.warrior.advanced` to `HEROES.dwarf.advanced` (H, VGxh 38:17). Optional: effect text "next boss ability (⌛, the app also blocks reactions)".
3. **`rune_vengeance`**: move from `HEROES.halfling.advanced` to `CLASSES.warrior.advanced` (H). Add `fr: 'Rune de vengeance'`. Effect unchanged.
4. **Warrior advanced** = `['chivalrous', 'feint', 'shoulder_spikes', 'rune_vengeance']`.
5. **ADD `magic_slingshot`**: `{ name: 'Lance-pierre magique' /* FR non entendu */, en: 'Magic Slingshot', de: 'Zauberzwille', effects: [A('ranged', 2), A('magic', 2)], conf: 'sûr', adv: true }`.
   - Halfling advanced = `['lucky_brooch', 'improvise', 'snarl_root', 'magic_slingshot']` (H).
   - Remove the "(répartition supposée)" comments for Halfling/Rogue and Elf/Druid.
6. **`lyrias_ring`**: move Druid → Elf. Effect `[H(2, 'all'), L]` is confirmed, so conf → 'sûr'.
7. **`mask_clairvoyance`**: move Elf → Druid. Text: "put the other 2 back on top in any order **or under your draw pile**".
8. Elf advanced = `['precision_shot', 'protection_spell', 'diadem', 'lyrias_ring']`. Druid advanced = `['mushroom_powder', 'antidote', 'phoenix_owl', 'mask_clairvoyance']`.
9. **`protection_spell`**: effects `[P(2), L]` confirmed; conf 'supposé' → 'sûr'.
10. **`feint`**: `[A('melee', 2), L]` → `[S('melee', 2), L]`, conf 'sûr'.
11. **`throwing_daggers`**: `[A('ranged', 3)]` → `[S('ranged', 3)]` (M-H: 3Hs 13:10, epTu 8:10).
12. **`chain_mail`**: `P(3)` → `P(4)` (M-H: e0z4 138:29, auGm 23:52, 5Pcz 41:38).
13. **`troll_round_blow`**: effect confirmed (H). Set `name: 'Kawumm'` (DE as heard; FR heard "Craque", L), `en: '?'`, conf 'sûr'.
14. **`grandpas_belt`**: conf → 'sûr' (P3 confirmed). FR is heard both as "Ceinture" and "Ceinturon de grand-père".
15. **`grandmas_helmet`**: P(4) can target any hero; the cleanse is 2 of your own tokens (already `C(2,'self')`).
16. **`throwing_axe`, `shadow_blade`, `smoke_bomb`, `viper_tooth`, `poison_blade`**: conf → 'sûr'. Effects match, except `smoke_bomb`: its protection may go to any hero.
17. **`antidote`**: confirm `[C(2,'one'), L]`. **`snarl_root`**: H(3) is self only (already self).
18. **`deja_vu`** text OK. **`demonic_pact`**: the player loses the 2 HP even when protecting someone else (OK).
19. **`morning_star`**: self-damage applies even when the support is ineffective. Engine note: a support with no matching attack should still resolve its non-damage effects.
20. **`arcane_monocle`, `banner_courage`, `blade_of_wind`, `living_boots`**: conf → 'sûr'. Banner's grant must target ANOTHER hero.
21. **French names to fix** (Gigamic edition as heard):
    - `rock_cleaver` → 'Tranche-roche'
    - `tunnel_blaster` → 'Souffleur de tunnel' (M)
    - `morning_star` → "Fléau d'armes" (M-H)
    - `brass_knuckles` → 'Poing de cuivre' (M)
    - `titanium_bracers` → 'Brassards de titane'
    - `runestone` → 'Pierre de rune'
    - `chivalrous` → 'Acte chevaleresque'
    - `shoulder_spikes` → 'Épaulettes à pointes'
    - `lightning_blade` → 'Lame de foudre'
    - `hand_crossbow` → 'Arbalète à main' (M)
    - `shoulder_ram` → 'Épaulette bélier' (L)
    - `throwing_axe` → 'Hache de lancer'
    - `sword_ruby_guard` → 'Épée à la garde de rubis'
    - `phoenix_owl` → 'Phénix-hibou' (M)
    - Hero names: "Halfeline des collines" for the female halfling; Rogue = "Roublard(e)".
22. **ITEMS**:
    - `potion`: "1 potion per hero per fight, as a shared pool; one hero may drink several".
    - Add `lucky_charm` (Porte-bonheur, ★1): play your top card, its ⚡ is ignored, unlimited.
    - Add `medical_bag` (Sac médical, ★2): remove 2 of your status tokens, reusable.
    - Add `waterskin` (★3): gain 3 HP.
    - Add `glass_eye` (Œil de verre de grand-père, ★3): look at the top 3 and reorder.
    - Add `phoenix_essence` (promo): once per fight every hero reshuffles their hand into their deck and redraws the same number.
23. Add the ★2 loot (M) if desired: Himmelsrune `[A('magic',4), D(1,'one')]`; Ansporn `[D(3,'one'), G({same:true})]`; Wurfschild des Gladiators `[S('ranged',3), P(3)]`; Waffengift (shield −2, if broken boss +2 poison); Schicksalsmünze `[S('melee',5)]`.
24. Optional: add a `de` field. German names are listed in section 2.
