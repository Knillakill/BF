# Boss Fighters QR – Bosses 0–4 (Mr. Puppet, Prince, Soul Huntress, Aether Dragon, Stone Golem)

This file pulls together 22 YouTube transcripts (EN/FR/DE/IT, mostly auto-generated captions). Per-video detail notes are in this folder as `notes_*.md` (IJ13O0AxXuw, e0z4d603TE8, VGxhoQvD5iA, pAqJAM7xdE0).

**Confidence:** **H** = several sources agree, or an exact app/card text was read aloud. **M** = one clear source. **L** = garbled or inferred.

**Source keys**

| Key | Video | Language / players |
|---|---|---|
| ARM | 3Hs-ECigZFo (Armicwan) | FR, 2p |
| LCST | -V40B9z8HuY (Les Cartes sur Table) | FR, 2p |
| REN | 4XWvG_o65PI (Renard Ludique) | FR |
| DFM | jQ49C9ymzmI (Des Filles et des Meeples, review after finishing the campaign) | FR |
| JDD | pAqJAM7xdE0 (Les Joueurs du Dimanche) | FR, 3p, app in EN. LJD = ytc/ljd_prince.txt, same session |
| PEN | 2oLVFqeeX6Y (Penelope Gaming) | FR, 2p |
| BGG | i4hZkiiLZD0 (BoardGameGeek GameNight) | EN, 4p |
| DT | 3C6Mede8Bb0 (Dice Tower) | EN |
| MMT | 8g2r2DRHxlo (Meet Me At The Table) | EN, 2p |
| OSC | QWO1y4VAMEI (One Stop Co-op Shop) | EN, 2p |
| OLH | gtZlsI0ZlI8 (One Last Hand) | EN, solo with 2 heroes |
| ITA | auGmMR4G4-g (Lo Chef Ludico) | IT, 2p |
| GEEK | VGxhoQvD5iA (Geekpunkt) | DE, 2p, probably "leicht" (easy) |
| BB3 | IJ13O0AxXuw (Brettspielblog) | DE, 3p, **pre-release app build** |
| BB2 | e0z4d603TE8 (Brettspielblog Flo & Ben) | DE, 2p |
| PEG | aLUeHAx8UJ4 (Pegasus overview) | DE, 3p |
| ELITE | 5Pczj34gmtY (Pegasus Elite-Boss mode) | DE, 4p |
| GIO | epTuGIoZMvs (Gioconauta) | EN ASR of IT, 2p |
| HBX | HBXMgj-EaXY (Dice Diary) | DE |

**Global caveats**
- HP values differ by app version. BB3 was played about 3 weeks before release, and a Pegasus person said in chat that levels 3 and 4 would get "+10–15 HP for 3p" in the next update (said of the Golem/Ogre).
- The players were often unsure which difficulty level they were on.
- In the app the difficulty selector sits in the boss info window and has **4 levels**:
  - EN: Family/Beginner – Advanced/Normal – Pro – Insane/Legendary
  - FR: Débutant/Facile – Intermédiaire/Normal – Pro/Difficile – Démentiel/Extrême
  - DE: Stufe 1–4 (leicht … schwer)
  - Level 2 ("Normal"/"Intermédiaire") is the middle/default option.
  - The tutorial (Mr. Puppet) has no difficulty choice. (H)
- Boss info screen contents: HP, the round the boss enrages (skull icon with a number), the status effects it inflicts, a difficulty rating of 1–5 hearts, Legend (height/age/territory/favourite treasure), Tips (unlocked after a defeat) and Abilities (described in full in the tips/defeat screen). (H)

---

## Generic boss-system rules (they apply to every boss)

- **Round = 7 phases (H, many sources).**
  1. Planning: the app shows the attack value per hero, plus any status icon (poison, curse, panic…).
  2. Shields: the boss gets shields per type (melee/red, ranged/yellow-grey, magic/blue). Some shields carry a symbol (poison, curse, spikes…).
  3. Action phase: the group picks who starts. Heroes then alternate, 1 action at a time, 3 actions each. Lightning on a card gives +1 action straight away.
  4. Boss attack: each hero loses whatever attack value remains after protection.
  5. Status: poison does 1 HP per token, to heroes and to the boss.
  6. Discard: discard all played cards, plus any hand cards you choose.
  7. Draw back up to hand size, reshuffling the discard pile when the draw pile is empty.
  - Recurring (hourglass) abilities resolve after phase 5 and before discard.
- **Reacting mid-round:** bosses can act during phase 3 (reactions, the Dragon's interrupt attack, thresholds). Threshold effects such as "shields and attacks increase" apply immediately. (H)
- **Shields:** damage of a type first reduces that shield, and the excess goes to HP.
  - A broken shield stays broken for the rest of the round, so later hits of that type do full damage.
  - Shields are re-rolled every round. Their values are random between plays ("ça a changé par rapport à hier", ARM). (H)
- **Status riders:** a status rider on an attack (poison/curse/panic) is applied only if at least 1 damage gets through. Reducing that hero's attack to 0 also cancels the rider. (H; DT, BGG, ARM, GEEK, BB3, MMT, OSC)
  - Rauchbombe/Bombe fumigène (Schutz 2) and Geweihte Schulterplatten remove the "extra effect" of the attack even when damage still gets through. (M)
- **Ties for "the hero with the most HP":** the players choose (rulebook text: "si plusieurs héros répondent à ce critère, vous pouvez choisir"; GEEK; OSC). BB2 saw the app pick one. (H)
- **Boss poison:** cards like Viper Tooth, Poison Blade and Waffengift put poison on the boss, and the boss takes 1 per token in phase 5.
  - Several sources say the boss's poison count decreases each round ("Vergiftung sinkt", BB2 Dragon, ELITE Prince, BB3 "Bosse verlieren jede Runde ein Gift"). (M)
  - **Hero poison never decreases on its own.** Rule card: "jetons d'état que vous devez conserver jusqu'à la fin du combat". (H)
- **Defeat:** the fight is lost as soon as any hero reaches 0 HP. Hero HP is tracked on dials, not in the app, so the players press "lost". The app then offers an immediate retry and unlocks Tips. (H)
- **Victory:** the boss reaches 0 HP and the app declares the win.
- **Between fights:** HP is fully restored, all status tokens are discarded, and the deck is reshuffled. (H)
- **Enrage text** (identical for all bosses, H):
  - EN: "X has become enraged. The strength of the boss's attacks now increases each round."
  - FR: "…entre en état de rage. La puissance des attaques de boss augmente maintenant à chaque manche."
  - DE: "…wird wütend. Die Stärke der Bossattacken steigt nun jede Runde."
  - Enrage does not end the fight. The fight continues until a hero dies; wins in round 6 are documented (OLH, PEN, BB2).
- **First-use tutorial popups:**
  - Teeth symbol: "Direct reaction abilities with the teeth symbol are direct reactions to your actions. If you can figure out why the boss uses this ability, you may be able to prevent it in the future." (H)
  - Hourglass: "Abilities with an hourglass symbol will repeat at regular intervals, for example every round or every other round." (H)
  - First attack of a type: "the background of his damage type is glowing. From now on, supports of this damage type can deal damage as well." (H)
- **Ability symbols (rulebook p.9–10):** attack, threshold (broken heart: HP below a value), reaction (teeth), recurring (hourglass), shield effect. (H)
- **Counters:**
  - **Antiboss 3000:** "the next reaction or recurring (hourglass) ability of the boss is prevented"; then remove it from the fight. The app reports e.g. "Overrun was prevented", "Poison spit was prevented by the Anti-Boss 3000". (H)
  - **Curse of the Raven / Fluch des Raben / Malédiction du corbeau:** the boss loses 2 immediately. Keep the card face up and discard it to ignore one hourglass ability that targets you; this protects only the holder, per a rulebook example. (H)

---

## 0. MR. PUPPET (tutorial)
FR "l'Épouvantail" (le mannequin tournoyant); DE "Mr. Puppet"; one FR speaker says "Monsieur Pepette".

**Legend (H):**
- EN: "This spinning dummy appears harmless and does not seem to have any special abilities. Do not expect any resistance."
- FR: "Ce mannequin tournoyant semble inoffensif et ne semble posséder aucune capacité particulière. N'imaginez pas rencontrer la moindre résistance."
- FR Tips: "Malheureusement, nous ne connaissons qu'une astuce susceptible de vous aider à vaincre ce boss. Cordialement, les auteurs."
- FR Abilities: "Des capacités ? Mais quelle capacité ? Il ne fait que tourner sur lui-même et lancer quelques attaques inoffensives. Au bout d'un moment, il va se fatiguer." (ARM 6:57)
- Info icons: enrage at 3 (skull "3"); status: poison.

### HP (no difficulty selection)
| Players | HP | Sources | Conf. |
|---|---|---|---|
| 2 | **48** | ARM 6:57, PEN 17:39, OSC 1:21, GEEK 21:54 | H |
| 3 | **72** | JDD 20:22 (BB3 is consistent: "40 left" during R2) | H |
| 4 | **96** | DFM 16:02 | H |

That is **24 HP per hero**.

### Enrage
Round 3. "C'est le dernier tour… Rage." (H)

### Shields
- **R1:** none ("c'est le premier boss, il n'a pas de bouclier", DFM; GEEK 23:16; PEN; GIO). (H)
- **R2:** the three types get the values **3, 5 and 7** in a random order. (H for the set {3,5,7}; the order varies)
  | Source | Melee / Ranged / Magic |
  |---|---|
  | GEEK | 3 / 7 / 5 |
  | OSC | 3 / 5 / 7 |
  | ARM | 7 / 3 / 5? |
  | JDD | 5? / 7 / 3 |
  | BB3 | magic 7 |
- **R3:** new shields. ARM had "faible résistance au mêlé" with melee 3; JDD had only ranged left. (M)

### Attacks per hero
**R1:** values 4–6, no status. (H)
- 2p: 6 & 5 (ARM, GEEK); 5 & 4 (PEN, OSC, GIO)
- 3p: 6/5/4 (JDD); 5/5/6 (BB3)
- 4p: 4/6/5/5 (DFM)
- BB3 heard the attack name "**Rundumschlag**" (spin attack). (M)

**R2:** about **5 (4–6) + 2 poison** per hero. (H)
- OSC 5+2P each; ARM 5 & 5 + 2P; PEN 6 and 5+2P; JDD 5/4/6 + 2P each; BB3 4+2P.

**R3 (enraged):**
- GEEK 8 & 7 + 2P; OSC "6 or 8 and 6" + 2P; PEN 6 & 5; ARM "6 4 7"; JDD 5/4/6 + poison. (M)
- A remake could use about +2 on R2 values plus 2 poison.

### Abilities
- **Épuisé / Exhausted** (scripted threshold at the start of R3, after enrage). (H that it exists)
  - Text: "Il a été affaibli par tous ses efforts… Battez-le maintenant" / "Mr Puppet is exhausted. Kill him now."
  - The boss loses a large chunk of HP by itself.
  - **The data fit "HP set to 4 × number of heroes"** (M; inferred, but several data points match):
    | Source | Before | After |
    |---|---|---|
    | ARM (2p) | 31 | "h" = 8 |
    | OSC (2p) | 23 | −15 = 8 |
    | GEEK (2p) | 25 | "verliert 17" = 8 |
    | PEN (2p) | 19 | "il reste 4" (after a further hit) |
    | BB3 (3p) | — | "auf 12" |
    | JDD (3p) | — | lost 34 by himself |
- Otherwise he has no abilities.
- The tutorial teaches supports, shields, protection and poison step by step.

### Rewards
Bronze loot box, sorted, do not shuffle. (H; ARM, PEN, JDD, LJD, OSC)
- Promo card "**Essence du phénix / Phönixessenz**" sits on top of the pack. It is not part of the base pack. Single use: "Chaque héros mélange toutes les cartes de sa main à sa pioche puis en reprend autant qu'il en avait en main."
- Stop card, verbatim FR: "Vous pouvez intégrer au jeu les **36** prochaines cartes: **32 cartes action, deux objets, une carte règle poison, une carte boss**." Each hero adds 4 race + 4 class cards, taking the deck from 12 to 20.
- **Sac à dos / Backpack / Rucksack:** "Scan as an action to draw 3 cards", unlimited use, shared.
- **Potion de soin / Heiltrank:** "Scan as an action, a hero of your choice gains **8** HP."
  - One potion per hero per fight, as a shared pool; one hero may use several.
  - BB3 (3p) says "ihr habt drei Heiltränke" and BB2 (2p) has 2, both consistent with this. (H)
- **Poison rule card:** "When you receive a poison token, place it on your hero card. You lose 1 HP for each poison token you have during phase 5 (status phase). You can only remove poison tokens with certain card or item effects." (H)
- Boss card for the Prince.

---

## 1. THE PRINCE
FR "le Prince"; DE "der Prinz"; a toad/frog.

**Legend (H):**
- EN: "Once a charming human prince, his greed and cruelty brought a terrible curse upon him, transforming him into a monstrous frog. With a venomous bite and a slimy tongue, he lashes out at anyone who dares to approach. He poisons, flattens, and stomps his enemies without mercy. Push him too far and he begins to swell with rage. A word of advice, don't mention how hideous he looks."
- FR: "…Il empoisonne, piétine et aplatit ses ennemis sans aucune pitié. Si vous le poussez à bout, il deviendra bouffi de rage…"
- DE: "…Er vergiftet, überrollt und zerstampft seine Gegner. Reizt man ihn zu sehr, bläht er sich auf."
- Facts: height **5 m**, age **32**, territory **The Plagued Swamps / les marais pestilentiels**, favourite treasure **Lucky charm / porte-bonheur / Glücksbringer**. (H)
- Boss card: enrage round 5, status poison, difficulty 3 of 5 hearts. (H; ARM, OLH, OSC)

**Quotes (H):**
| When | EN | FR | DE |
|---|---|---|---|
| Intro | "You may dine with the prince. Today's menu is heroes stew." | "…au menu ce soir un ragoût de héros" | "Heute gibt es Heldenragout" |
| R1 | "Welcome to my swamp and your grave." | | |
| R2 | "I can tell you're beginners." | | |
| R3 | "You should be ashamed to still be alive." | | |
| R4 | "I have more important things to do than crush you." | | |
| R5 | "That's enough. No more playing around." | "Ça suffit de jouer" | |
| R6 | "I don't understand why you don't just give up." | | |
| Win | "You actually defeated me. But could someone still give me a kiss?" | | |
| Loss | "Weak-willed good-for-nothings. You're too skinny even for my feast." | | |

**Info-screen tips (FR, PEN 56:29, H):**
- "Évitez de jouer trop de cartes attaque ou soutien puissantes, surtout au début."
- "Le prince se met en colère au 5e round. Battez-le rapidement…"
- "Utilisez vos potions de soin dès le début car les capacités récurrentes du prince peuvent infliger des dégâts imprévus."
- In-fight hint R3: "Remember that you have two healing potions. Use them."

### HP
| Players | L1 Family | L2 Advanced/Normal | L3 Pro | L4 Insane |
|---|---|---|---|---|
| 2 | ~40? (L) | **49** (H: OSC card, OLH, GEEK, LCST) — but FR "Normal/Intermédiaire" showed **51** (H: ARM, PEN) | **54** (H: ITA "difficile"; MMT ≈53–54) | ~61? (L) |
| 3 | **60** (L-M) | **75** (M: JDD/LJD default screen; ELITE "zu dritt ungefähr 75") | **84** (H: JDD played it, "en pro") | **95** (M: JDD garbled list; BB3 hardest "knapp unter 100", 72 left after part of R1) |
| 4 | ? | ~110 (L: BGG, "97 more" after ~13–15 damage, level not stated) | ? | ? |

- 3p values come from JDD 48:04: "Il a 75… il passe à 84… 60 84 et l'autre c'est quoi ? 95".
- The 49 vs 51 discrepancy is unresolved. Possible causes: app version or language, or 51 = L2 and 49 = L1. Recommended for a remake: 2p 49 / 3p 75 at the default level, which scales roughly ×1.53 from 2p to 3p.
- **ELITE mode** (post-campaign, not base game): **244 HP** at 4p, difficulty 2 of 4. (H)

### Enrage
Round 5. (H everywhere)
- Enraged attack values: OLH 2p R5 6+2P and 8, R6 8 and 10; ITA (Pro) R5 10 and 7; ARM R5 7; LCST "4 et 2…". (M)
- JDD: on enrage he also raises shields ("il va se shield plus"), and the ranged shield was 5. (M)

### Shields (R1 = random distribution)
| Source | Melee / Ranged / Magic |
|---|---|
| ARM (2p, L2) | 3 / 1 / 2 |
| LCST (2p) | 1 / 3 / 2 |
| MMT (2p, Pro) | 1 / 3 / 2 |
| OLH (2p) | 3 / 2 / 2 |
| REN | 2 / 2 / 3 |
| GEEK | ~2 / high / 2 |
| PEG (3p) | ~3 / ~2 / ≤3 |
| BGG (4p) | ? / **5** / **3** |
| DT | melee 3 |

- **2p:** values from {1, 2, 3}, randomly assigned. (H)
- Later rounds: re-rolled. Typical values: ARM R4 "5 1 3" (L); ITA R4 magic 4; JDD R5 ranged 5; BGG after half HP, melee about 7.
- **Half-HP threshold:** shields rise by about **+2**. MMT: "Now we have two more defense". (M-H)
- **Poison-symbol shield, from about R3–R4 or after half HP.** One shield shows a poison icon. **Whoever breaks it gets 1 poison**; only the breaking attack is poisoned (LJD 85:07). This applies even with a 3-damage attack (MMT R3).
  - MMT: "if we break this one, somebody gains a poison. Whoever breaks it."
  - ITA: "lo scudo col veleno".
  - BGG: "now there is a new symbol… when I break the [magic] shield I get a poison".
  - BB3/JDD: "after half HP, magic damage gives poison".
  - (H that it exists; the type varies by play: magic in BB3/BGG/JDD, ranged in GEEK/PEN)

### Boss attacks per hero (planned values before protection; +nP = poison riders)
Each hero has their own value, typically 3–7 with 0–2 poison riders. After Bloat about +2. From R5 (enrage) it increases each round.

| Setting | R1 | R2 | R3 | R4 | R5 | R6 |
|---|---|---|---|---|---|---|
| 2p L1/L2 (OLH) | 3+1P / 4 | 5+1P / 3+2P | 3 / 5 | 6+1P / 5 (post-Bloat) | 6+2P / 8 | 8 / 10 |
| 2p L2 (PEN try 1, Normal) | 3+1P / 3 | 5+1P / 3+2P | 5+1P / 3+1P | 7+1P (post-Bloat) | – | – |
| 2p L2 (ARM, Intermédiaire) | 4 / 5+1P | 3 / 5 | – | 2+P (net) | 7 | – |
| 2p (LCST) | 4–5+1P / 4 | 3+2P / 5+1P | 4+P / 3+P | 6+P / 4 (post-Bloat) | – | – |
| 2p L3 Pro (MMT) | 6+1P / 4+1P | 4 / 6 → after Bloat 6+2P / 4+1P | 7 / 6 | – | – | – |
| 2p L3 Pro (ITA) | 5 / 4 | 6+1P / 4+2P | 6 → 8 after Bloat | ~7 / 5 | 10 / 7 | – |
| 3p L3 Pro (JDD) | 4+1P each | 6+1P / 4+1P / 4+2P | 8+1P / 6+2P (post-Bloat), up to 10 | – | – | – |
| 3p L4 (BB3) | 6 / 5 / 0 | ~7 | 7 / 7 | – | – | – |
| 4p (BGG) | – | 5–6 | 4+2P / 6+1P | – | – | – |

- Attack names heard in the attack phase (L-M): EN "Leap", "Stomp", "Toxic (bite)", "Croak of Doom" (LJD); DE "Zahnloser Biss" (damage), "Unkenruf" (1 poison only) (PEG, H for the names).

### Abilities
**(a) Poison Spit** — FR "Crachat empoisonné", DE "Giftspucke(n)". **REACTION (teeth).** (H)
- Info-screen description (FR, PEN 57:09): "Le prince crache du poison si vous infligez trop de dégâts avec une attaque ou un soutien."
- **Trigger:** a single attack or support card of **strength ≥ 4** (≤3 is safe).
  - Confirmed by ARM, LCST, PEN, BGG, MMT, OSC, OLH, JDD, PEG and BB3.
  - It counts **the card's strength including modifiers** (e.g. Diadem +3), **even if the shield absorbs it**. JDD: "dès que tu mets quatre, bouclier ou pas"; MMT: 4 ranged into a 3-shield still poisoned.
  - Meteor Shower (split 2/2/2) never triggers it.
  - BB3 thought the app counts actual damage dealt (minority view, L).
- **Effect:** the hero who played the card gets **1 poison token**. No limit per round.
- **After half HP** the reaction also covers the poison-symbol shield (see Shields).
- **Counter:** play low cards early, or use Antiboss 3000 (ARM: "Crachat empoisonné était bloqué par l'antiboss 3000").
- Unclear: BGG, OSC and PEN R3 report that Antiboss "prevented Poison Spit". Either Antiboss consumed itself on the next reaction, or the R3 hourglass shares the name. (L)
- Also listed on the FR info screen: "Bave empoisonnée" (effect not read, L).

**(b) Tongue Lash** — FR "Langue lacérante", DE "Zungenhieb". **RECURRING (hourglass), odd rounds R1, R3, R5.** (H)
- **Effect:** "The hero with the most HP receives 1 poison token and loses X HP."
- **X by setting:**
  | Setting | X |
  |---|---|
  | 2p, L1/L2? (OLH, LCST, GEEK) | 2 |
  | 2p L2 Normal/Intermédiaire (ARM, PEN, REN) | 3 |
  | 2p L3 Pro (MMT, OSC, ITA) | 4 |
  | 3p L3 Pro (JDD) and 3p L4 (BB3) | 6 |
  | 4p (BGG) | 4 |
  | ELITE 4p L2 | 14 (+1P); L4 about 22 |
- Not increased by Bloat (JDD: "ces dégâts n'ont pas augmenté"). (M)

**(c) Overrun** — FR "Submergé", DE "Überrollen". **RECURRING (hourglass), even rounds R2, R4.** (H)
- **Effect:** "Each hero loses Y HP."
- **Y by setting:**
  | Setting | Y |
  |---|---|
  | 2p L2 (ARM, PEN) | 2 |
  | 2p (LCST) | 3; R4 after Bloat 4 |
  | 2p L3 Pro (OSC, ITA) | 4; after Bloat 5 (MMT, ITA R4) |
  | 2p (GEEK) | 4 |
  | 3p Pro (JDD) | 3 |
  | 3p L4 (BB3) | 5 |
  | 4p (BGG) | 3 |
  | ELITE 4p | 4 |
- Pattern quoted by JDD: "c'est 3 puis 6 puis 3 puis 6".
- Counter: Antiboss 3000 (OLH: "Overrun was prevented"), Curse of the Raven (holder only).

**(d) Bloat** — FR "Bouffi de rage", DE "bläht sich auf". **THRESHOLD (broken heart) at 50% HP.** (H)
- Text: "The prince has lost half his life. His attacks and shields increase."
- Takes effect immediately mid-round: attacks about +2 (ITA 6→8), shields about +2, and new shields are placed.
- OSC: an attack already cancelled stays cancelled.
- Seen in R2–R4 (MMT R2, OSC/OLH/ITA/JDD/BB3 R3, ARM/LCST R4).

**(e) ELITE-only:**
- "Bläht sich auf"-style reaction after a hero's 3rd attack in a turn ("der Boss bläht sich auf und wird stärker"). (L)
- Poison shield: attacking it gives 1 poison, and over-damage >4 gives another (L).
- Every hero loses 4 on even rounds.

### Fight flows (for HP sanity)
| Source | Flow | Result |
|---|---|---|
| ARM (2p, 51) | 44 after R1, 36 after R2, 28 at R4 start, Bloat, ~11 | won R5 |
| PEN try 1 | Bloat at 25 | lost R4 |
| PEN try 2 | R5: 15 → 7 | won R6 |
| OLH (49) | 22 at R4 start | won R6 |
| ITA (54) | 34 at R3, Bloat at 27, 18 at R4 | won R5 |
| MMT (54) | 45 / 32 / 23 | lost R3 |
| JDD (84) | 34 after R3, 25 in R4 | won R5 |
| BB3 | – | won R4 |
| BGG 4p | half after R2, 19 at R4 | won R4 |

### Rewards (H; ARM 62:38, PEN 86:46, JDD, OLH, GEEK)
- "Take the next **25** cards: **5 loot cards, 17 curses, 1 item, 1 curse rule card, 1 boss card**." Each hero chooses 1 loot card for their deck. Shuffle the curses face down as the curse pile for all future fights. "Do not open the silver box until you've defeated the Soul Huntress."
- **5 loot cards (★1):**
  | EN | FR | DE | Effect |
  |---|---|---|---|
  | Arcane Monocle | Monocle arcanique | Arkanes Monokel | ranged support 3 + magic support 3 |
  | Curse Breaker | Brise-malédiction | Fluchbrecher | move one active curse of any hero to the curse discard |
  | Banner of Courage | Bannière de bravoure | Banner des Mutes | another hero of your choice immediately performs 1 action, and you get +1 action |
  | Blade of Wind | Lame du vent | Klinge des Windes | melee attack 3 + extra action |
  | Living/Animated Boots | Bottes animées | – | protection 1, a hero of your choice draws 1, + extra action |
- **Item: Lucky Charm** (Porte-bonheur / Glücksbringer): "Scan as an action to play the top card of your draw pile. Any lightning on the played card is ignored." Unlimited.
- **Curse rule card:** "If you receive a curse, draw a curse card and place it face down next to your hero card without looking. Reveal all curse cards at the start of the next action phase (phase 3) and resolve them."
  - The German card misprints "Phase 5"; the app and help card say Phase 3. (H)
  - Non-permanent curses are discarded at the end of the action phase; the app says "Legt eure aktiven nicht permanenten Flüche auf den Fluchablagestapel". Permanent ones say "Behalte diesen Fluch bis zum Ende des Kampfes". (H)

---

## 2. SOUL HUNTRESS
FR "la Chasseuse d'âme(s)"; DE "die Seelenjägerin".

**Legend (H):**
- FR: "Lorsque cette gigantesque silhouette fantomatique appartenait encore au monde des vivants, elle était une puissante mage du ciel. Mais elle se tourna vers la magie noire et y perdit son âme. Dorénavant elle est en quête d'êtres faibles d'esprit comme vous… par le biais de malédictions, leur vole leur âme."
- DE: "Als die riesenhafte Geistergestalt noch unter den Lebenden wandelte, war sie eine mächtige Himmelsmagierin, bis sie sich der dunklen Magie bediente und ihre Seele verlor. Nun ist sie immer auf der Suche nach Wesen mit schwachem Geist, um sie zu verfluchen und ihnen die Seele zu rauben."
- Facts:
  - Height **7 m+** (H).
  - Age **237** (H).
  - Territory **ruins of Port-Sombre / "Darkport"** (M: ASR "port sombr").
  - Favourite treasure **une rune céleste / sky rune** (M; one source).
- Boss card: enrage round 5, status **poison + curse**, difficulty **1 of 5 hearts** (low HP, because of phase 2). (H)

**Quotes (H):**
| When | EN | FR | DE |
|---|---|---|---|
| Intro | "Give me your souls and I'll spare your weak bodies." | "Donnez-moi votre âme et j'épargnerai vos corps faibles" | "Gebt mir eure Seelen. Ich verschone euren schwächlichen Körper." |
| R1 | | "Des esprits faibles sont venus me visiter. Approchez-vous." | "Schwache Geister, besucht mich. Tretet näher." |
| R2 | | "Vous aurais-je sous-estimé ? Impossible." | "Ich habe euch unterschätzt. Unmöglich." |
| R3 | | | "Gefallen euch meine Flüche?" |
| R4 | | | "Eure Seelen wollen zu mir. Sie duften so süß." |
| R5 | "Enough time to end this." | | "Genug Zeit, die Sache zu beenden." |
| Win (defeated) | | | "Ihr habt die zahllosen Seelen befreit und meine kann in Frieden ruhen." |

### HP (two phases)
| Setting | Phase 1 | Phase 2 (after Resurrection) | Source / Conf. |
|---|---|---|---|
| 2p L1 "leicht" | **21** | not read (≥17, ~21?) | GEEK (H / L) |
| 2p L3 | **23** in fight (info screen said 24) | **~32** | BB2 (H / M) |
| 3p L1 | ~40–44? | **~57–60** ("60 hoch und 57") | BB3 (L / M) |
| 3p (JDD, "hardcore"?) | **38** | **55** | JDD (H / H) |
| 3p L4 (pre-release) | **47** | **+63** | BB3 (M / H) |

- Phase 2 is roughly 1.35–1.45 × phase 1.
- JDD: "quand on a choisi la difficulté… il y a seulement un HP qui changeait". (L)
- Healing cannot exceed her max HP (JDD). (M)

### Enrage
Round 5 ("Auf Stufe 5 eskaliert sie"; JDD; BB3 attempt A reached R5 and lost). (H)

### Shields
- R1 is fairly low. Ranged was often the highest (BB2 "da hat sie am meisten Schutz"); magic was open in JDD. No exact numbers were read, except a ranged shield of 6 in JDD R3 (M).
- **Curse Shield / Fluchschild (shield effect / reaction):** one shield type carries a curse symbol. **The hero whose attack breaks or hits it draws a curse** (face down).
  | Source | Type | Note |
  |---|---|---|
  | BB2 | magic | "Fluchschild. Flo zieht einen Fluch" — once broken, magic is safe |
  | BB3 | – | "es bekommt der, der jetzt durchbricht" |
  | GEEK | melee | "ein Fluch, wenn wir auf Rot kämpfen" |
  | JDD | melee and ranged | "si on attaque à distance ou au cac, on prend une malédiction… dès que tu touches"; a hit of 0 did not trigger, a hit of 1 did |
  - (H that it exists; the type varies)

### Boss attacks per hero
About 3–6 damage per hero, with a **curse rider** (curse icon) and/or poison riders. (H)

| Setting | R1 | R2 | R3 | R4 | R5 |
|---|---|---|---|---|---|
| 2p L3 (BB2) | 5+curse (Flo) | 3+curse | 5 | – | – |
| 2p L1 (GEEK) | curse / poison | 4 / 1(+curse) | 4+2P / curses | – | – |
| 3p (JDD) | 5 / 5+curse / 4 | – | 5+2P / 3+2P | fully blocked | – |
| 3p L4 (BB3) | 2 | – | 6(+2P from a curse) / 3+1P | 4 (+2P) | 3+curse / 5 |
| 3p L1 (BB3) | 1 | – | 6+curse | 4+2P | – |

BB3 says attacks on L1 are about 1–2 lower than on L4.

### Abilities
**(a) Life Drain** — DE "Lebensentzug", FR "elle se heal". **Passive on her attack.** (H)
- "The boss's attack has drained your life. The boss heals by N."
- **N:** 2 (GEEK 2p L1), **3** (BB2 2p L3; BB3 3p L1), **4** (JDD 3p; BB3 3p L4).
- It is applied **per hero damaged** (BB3: "heilt sich immer um 12" = 3 heroes × 4; JDD first thought the same). JDD later concluded "4 flat". (M for per-hero)
- **Counter:** reduce every attack to 0 ("wenn wir verhindern, dass er angreift, kann er sich auch nicht heilen", GEEK). A hero card exists that prevents her heal at an HP cost (BB3). Healing cannot exceed max.

**(b) Soul Hunt** — DE "Seelenjagd". **RECURRING (hourglass), odd rounds R1, R3 (R5).** (H)
- "The hero with the most HP loses X HP and draws a curse."
- **X:** 3 (GEEK 2p L1), **4** (BB2 2p L3; BB3 3p L1, which sounded like "zwei Fluch", L), **7** (JDD 3p; BB3 3p L4).

**(c) Nightmare** — DE "Albtraum", EN "Nightmare". **RECURRING, even rounds R2, R4. Two parts ("1 von 2" / "2 von 2").** (H)
- Part 1: "Each hero loses **6** HP." It is 6 in every version seen (2p L1, 2p L3, 3p L1, 3p L4). JDD R4 had about 7 (L).
- Part 2: "Each hero puts the top **2** cards of their draw pile onto their discard pile." In R4 it is the top **4** cards (BB3 L1 and L4; JDD). (H)

**(d) Resurrection** — DE "Auferstehung", EN "rises laughing from the dead". **THRESHOLD at 0 HP of phase 1.** (H)
- "Soul Huntress rises laughing from the dead." She refills to the phase-2 HP.
- "Each hero draws a curse and places it face down next to their hero card."
- Happened in R2 or R3 in all plays.
- Tip (GEEK): heal before killing phase 1.

**(e) Defeat-screen ability recap (BB3, H):**
- "Albtraum: every hero loses HP and must discard cards from their draw pile. The hero with the most HP must draw curses. Lebensentzug: her attacks damage you and heal her… and Auferstehung."
- Tips: "Flüche können euch stark einschränken. Mit Beutekarten wie Fluchbrecher könnt ihr besonders schlimme Flüche unschädlich machen. Sprecht euch gut ab und reduziert einzelne Bossattacken mit Schutzeffekten möglichst auf null."

- She can be poisoned like other bosses.

### Curse deck (17 cards after the Prince; texts heard, H/M)
- Instant: "Lose 3 HP." / "Lose 3 HP and receive 2 poison tokens."
- "Lose 1 HP for each card you play from your hand."
- "Lose 2 HP for each hand card with protection / with support (Verstärkung) / with an attack that you play." A support is NOT an attack for these curses.
- "Receive 1 poison token for each hand card with protection / support / attack that you play."
- "If you play a card from your hand, it must be chosen at random."
- "Before playing a hand card you must first discard another hand card."
- PERMANENT: "Until the end of the fight, you receive 2 poison tokens whenever you take damage from the boss attack."
- PERMANENT: "Your hand limit is reduced by 1 until the end of the fight."
- Cards played from the deck (Improvise, Lucky Charm) do not count as hand cards. (M)

### Rewards (H; BB2, BB3, GEEK)
- "Open the **silver** loot box and flip the top stop card."
- **5 loot cards (★2):**
  - **Anspornen** (Spur On): a hero of your choice draws 3 cards and may immediately take an action.
  - **Wurfschild des Gladiators** (Gladiator's Throwing Shield): ranged support 3 + protection 3.
  - **Waffengift** (Weapon Poison): "Lower a boss shield of your choice by 2. If it is destroyed by this, the boss gets 2 poison."
  - **Schicksalsmünze** (Coin of Fate): melee support 5.
  - **Himmelsrune** (Sky Rune): magic attack 4, a hero of your choice draws 1.
- **New item: Medizintasche** (Medicine Bag): action, remove 2 status markers, reusable.
- **New rule: Panic** (for the Dragon).
- **5 new curses**, e.g. "receive 1 Panic marker for each hand card with protection you play".
- Aether Dragon boss card.

---

## 3. AETHER DRAGON
FR "Dragon de l'éther" (ASR "dragon des terres"); DE "Ätherdrache" (ASR "Etherdrache").

**Legend (DE, BB2 34:55, H):** "Dieser Drachenfürst schleudert Ätherblitze auf euch. Sein Höllenschrei versetzt seine Widersacher in Panik, sodass sie kopflos agieren. Sein Panzer besteht teilweise aus messerscharfen Stacheln. Am Boden mag er schwerfällig wirken, doch in der Luft ist er umso gefährlicher. Also holt ihn besser herunter."
- Facts:
  - Height "**68 m**" (ASR; possibly "6–8 m", L).
  - Age **about 1200** (M).
  - Territory **Gewitterhöhengipfel / thunder peaks** (M).
  - Favourite treasure **Feenkokon / fairy cocoon** (M).
- Info screen: enrage round 5, status **Panic**, HP rating 4 of 5. (H)

**Quotes (DE, H):**
| When | Quote |
|---|---|
| Intro | "Lästige Winzlinge stören meinen Schlaf." |
| R1 | "Sie sind so mickrig, ich kann sie kaum sehen." |
| R2 | "Sie werden in Panik fliehen wie alle anderen vor ihnen." |
| R3 | "Meine Blitze werden diese Maden rösten." |
| R4 | "Diese lästigen Viecher sind meiner Zeit nicht wert." |
| R5 | "Jetzt ist Schluss mit (der) Zeitverschwendung." |
| Other | "Der Ätherdrache wappnet sich." |

**Tips screen (BB2 122:25, H):**
- "In der Luft ist der Drache am gefährlichsten. Greift mit allen Mitteln an, um ihn zum Landen zu bringen."
- "Wenn ihr denkt, dass der Drache diese Runde nicht landen wird, zieht möglichst wenig Karten nach, sonst verliert ihr viele Lebenspunkte."
- "Greift den Ätherdrachen am Boden weniger an als in der Luft. Seine Schilde blockieren ohnehin einen Großteil des Schadens."
- "Wenn der Ätherdrache wieder losfliegt, führt er seine Attacken durch; nutzt die Aktion, bevor er abhebt, um euch zu schützen."
- "Hat der Drache Stachelschilde, konzentriert euch möglichst auf den Schaden, mit dem ihr am meisten Schaden zufügen könnt."

### HP
| Setting | HP | Source / Conf. |
|---|---|---|
| 2p L1 | **71** | GEEK, H (level M) |
| 2p L2 | **72** | BB2, H |
| 2p L3 | **82** | BB2, H |
| 3p L1 (pre-release) | **>100** | BB3, M |
| Legend/Elite, 4 heroes | ~300 | DFM, L |

### Enrage
Round 5. (H) Round 6 is usually lethal: BB2 L3 saw **12–13 damage per hero** in R6, and GEEK L1 saw 11 and 9.

### Core mechanic: Flying / Landed (H)
- **Start:** "Der Drache fliegt. Versucht ihn zurück auf den Boden zu holen."
- **While flying:** he **cannot be hit by melee** ("Ätherdrache kann mit Nahkampfschaden nicht angegriffen werden"). A melee card still resolves its extra-action effect.
  - A **landing gauge** fills with damage dealt; BB2 saw about 1–2 damage per segment.
  - Flying shields are low ("Seine Schilde sinken" on take-off).
- **Landing** ("Der Ätherdrache landet"): he gets **new, high shields** (e.g. 3+, "die Schilde sind echt hart"; one reading of "15", L), and **his attacks become weaker**.
- **Take-off timer** (DE "Drachenzorn"): a second bar fills with **player actions, not damage**.
  - When full: "Der Ätherdrache hat euch genug Zeit gelassen und attackiert euch" — he **performs his attack immediately, mid-phase 3**, then "schwingt sich in die Lüfte. Seine Schilde sinken."
  - He does not attack again at the end of that round.
  - Counter: protect before he lifts off, then burst him while his shields are down.
- **Permanent landing at ≤ 20 HP** (threshold): "Der Drache ist zu verwundet, um zu fliegen und landet. Er kämpft um sein Überleben." Shields reset. (H; BB2 ×3, BB3, GEEK "Er landet. Er ist verwundet.")

### Abilities
**(a) Wing Beat** — DE "Schwingenschlag / Flügelschlag". **RECURRING at end of round while airborne.** (H)
- "Every hero loses 1 HP per card in hand."
- It does not happen if he is landed.
- Blocked once by Antiboss 3000.
- Up to 7 damage seen.

**(b) Piercing Shriek** — DE "Durchdringendes Kreischen". **RECURRING.** (H)
- "The hero with the most HP loses **4** HP and receives a Panic marker." Later or enraged it is 5 (BB2, BB3), and 6 in R6 (BB2, M).
- GEEK also saw a 3 + Panic version (landed, R2).
- Curse of the Raven negates it for its holder.
- BB3 once heard "verliere zwei durch durchdringendes Kreischen" (L).

**(c) Spiked shields** — DE "Stachelschilde / Stachelpanzer". **SHIELD EFFECT / REACTION.** (H)
- Attacking a spiked shield **damages the attacker**: **5** on BB2 L3, **4** on BB3 L1 and GEEK.
- Often on magic ("der Stachel war ständig auf Magie") or ranged.
- He gets them when he takes off or lands ("Wenn er losfliegt, dann macht der Drache Stachelschilde").

**(d) Attack riders and values**
- Attacks give **Panic markers**, 1–2 per hero (e.g. "2 Panik").
- Some attacks show **"?" damage**, hidden or random ("Meine Blitze…", Ätherblitz). BB3 had a "Benommenheitsmarker" (L).
- Values:
  | Setting | R1 | R2 | R3 | R4 | R5 | R6 |
  |---|---|---|---|---|---|---|
  | 2p L3 (BB2) | 9 / 7 (net −6 / −1, +2 Panic) | 7 flying → 4+Panic after landing | ~5+Panic | ~5+Panic | 7 / "15"? | 12–13 |
  | 2p L1 (GEEK) | 6+2 Panic | 2 (landed) | interrupt 4 / 5+Panic | – | interrupt 7+Panic / 4 | 11 / 9 |
  | 2p L2 (BB2) | net −3 / −4 ("feels weaker"); fewer panic markers | | | | | |

**(e) Panic rule card** (verbatim DE, BB2 46:34 / GEEK 100:33, H): "Erhältst du einen Panikmarker, lege ihn auf deine Heldenkarte. Hast du einen oder mehr Panikmarker, darfst du Handkarten nur noch zufällig spielen. Möchtest du eine Handkarte spielen, mische deine Handkarten, ziehe eine zufällig und spiele sie. Lege nach dem Spielen der Karte sofort einen Panikmarker ab. Du darfst weiterhin Gegenstände deiner Wahl nutzen."

### Fight flows
| Source | Flow | Result |
|---|---|---|
| GEEK (71) | 47 (R2), 38 (R3), 25 (R4), 23 (R6) | lost R6 |
| BB2 L3, attempt 4 | 59 (R2), 28 (R4), lands at 20 in R5, 15 in R6 | lost |
| BB2 L2 (72) | 64 after R1 | won R6 |
| BB3 3p L1 | – | won R4 |

### Rewards (BB3 225:35, M-H)
- "Take the next **18** cards" (★3). Includes:
  - 4 "experienced" species/hero upgrade cards with passive skills:
    - "Zerstörst du einen Bossschild, verliert der Boss sofort 4"
    - "Verstärkungen +2, wenn du diese Runde bereits einen Angriff dieser Art gespielt hast"
    - "Fügst du das erste Mal in deinem Zug dem Boss mit einem Angriff Schaden zu, spiele die oberste Karte deines Decks (oder nutze Opas Glasauge)"
  - Items: **Trinkschlauch** (heal 3) and **Opas Glasauge** (look at the top 3 of your draw pile and put them back in any order).
  - Rule card: **Paralysis / Lähmung** — "Für jede Lähmungsmarke ist dein Handkartenlimit um eins reduziert. Dies ist nur in Phase 7 relevant. Nur durch Karteneffekte abwerfbar."
  - Loot cards:
    - Geweihte Schulterplatten: protection 4 + remove the extra effect of the reduced boss attack
    - Elixier der Sorglosigkeit: remove 1 status marker from each hero
    - Ranged support 5
    - "All heroes gain 3 HP" + extra action
    - Pyrofalle: lower a boss shield of your choice by 4 without triggering the shield's effect
  - Stone Golem boss card.

---

## 4. STONE GOLEM
FR "Golem de pierre"; DE app name "**Steinriese**" (also "Steingolem"). Only BB3 shows a fight (3p, Stufe 3, pre-release build). BB2 reads the lore.

**Legend (DE, H):** "Dieser uralte Bewohner der Sandsteinschluchten greift euch mit brachialer Gewalt an. Mit seiner Steinfaust sorgt er für Erdbeben und Sand in euren Schuhen. Er nutzt Kristallmagie, um sich zu heilen [und euch zu lähmen?]. Seine felsige Haut wächst ständig nach. Die um ihn schwirrenden Steine/Steinlinge rächen sich an euch, sobald ihr dem Riesen zu eifrig zusetzt."
- Territory: Sandsteinschluchten (sandstone canyons). Height, age and treasure not read.

**Quotes (DE, H):** "Harte Steine, weiche Körper. Wer gewinnt wohl?" (R1), "Schmerzen für euch, nur Kratzer für mich.", "Sandknirschen, Knochen knacken."

**Boss card:** enrage **round 5**, status **Paralysis (Lähmung)**. (H)

### HP
- 3p Stufe 3, pre-release: **~75** ("der hat nur 71" right after a 4-damage shield break). (M)
- Pegasus said the next update adds about +10–15 at 3p on levels 3 and 4. A remake could use about 85–90 for 3p L3. (L)
- Won in round 3, so enrage was not seen.

### Abilities
- **Stone Skin** — DE "Steinhaut". **Shield effect / recurring:** "Die Schilde des Bosses werden stärker." Shields regrow and grow each round. (H)
- **Shield-based healing:** if his shields are not broken he heals ("Er heilt sich um acht"; an "um zwei Leben" variant is garbled). (L-M)
- **Dangerous Stone Shield Splinter** — DE "Gefährlicher (Stein-)Schildsplitter". **Shield effect:** **breaking a shield costs the breaker 7 HP**. Breaking two in one turn costs 7 + 7. (H)
- **Stoneling Attack** — DE "Steinling-Attacke". **REACTION when you deal too much in a round ("zu eifrig").** (H for the escalation)
  - Hits the active hero and escalates each time: "Steinling-Attacke" −1 HP, then "Mächtige Steinling-Attacke" −2, then "Unglaubliche Steinling-Attacke" −3.
  - Linked to "**Der Steinriese absorbiert Energie**", a bar that fills with damage dealt. (M)
- **Attacks:**
  - Planned about 6 on one hero in R1.
  - Riders give **Lähmung** markers (e.g. 2). In R3: "jeder Held hält eine Lähmungsmarke".
- **R2 special:** "Der Steinriese greift nicht an. Jeder Held verliert 2 Lebenspunkte pro Lähmungsmarke." (H)
- **DFM (Elite):** the Golem has an elite/legend version.

### Rewards (BB3 268:46, M)
Cards:
- **Magische Haut:** protection equal to the current round, + action
- **Arkane Klinge:** melee support 4 / magic support 3
- **Perfektes Zusammenspiel:** everyone draws 2 and discards 1, + action
- A card "der Boss verliert 3", + action
- **Pestbote:** play only if you also put another hand card onto your draw pile; the boss gets 2 poison

Plus the Three-headed Ogre boss card.

---

## Other bosses (for reference)
- **Three-headed Ogre** (boss 5), 3p Stufe 3, pre-release:
  - 145 HP, enrage round 6.
  - Heads: Saber (spits poison), Hörnchen (curses: remove the top 2 deck cards from the game), Zotte (club). Each head has its own bar and is knocked out when emptied; with all heads down, attacks weaken; heads recover the next round.
  - Info: 16 m; ages 27 / 48 / 82.
- **Campaign order (JDD app list):**
  1. Prince
  2. Soul Huntress
  3. Aether Dragon
  4. Stone Golem
  5. Three-headed Ogre
  6. Kraken/tentacle boss (40 m, age 7, Sirenenfelsen, treasure "Helm des Windes")
  7. "Magmarot"? (fire/burn boss)
  8. bomb boss?
  9. Gelatinous monster (slime)
  10. Madame Voodoo (last)
  - Mr. Puppet is boss 0. There are also seasonal app bosses (Christmas, Easter).
- **Loot boxes:** Bronze (Puppet → Soul Huntress), Silver (64 cards, after Soul Huntress, bosses 3–7), Gold (53 cards, bosses 8–10). (JDD, M)
- **ELITE mode:** first 5 elite bosses (Prince, Soul Huntress, Dragon, Golem, Ogre); much higher HP (e.g. Prince 4p L2 = 244), new or stronger abilities.

---

## Rules clarifications found in play (with evidence)
1. **Supports (soutien / Verstärkung):** a support deals damage only if any hero (including you) has already played an attack of the same type this round. Otherwise it does nothing and the action is still spent. This resets each round. (H; rulebook quoted by JDD 26:26, PEN, BGG, GEEK, BB2)
   - Diadem of Invisibility (+3) does not apply to supports (MMT, GEEK). (M)
2. **Protection:** you choose the target hero, including yourself.
   - Some cards split it (Titanium Bracers 2+2).
   - JDD: a single protection value cannot be split. (M)
   - Demonic Pact: the card's owner pays the 2 HP. (H)
3. **Status riders** are cancelled only if that hero's attack is reduced to 0. (H)
4. **Poison:** 1 HP per token in phase 5. Tokens stay all fight unless removed by effects:
   - Antidote (remove 2)
   - Medicine bag (remove 2)
   - Guard helmet (remove 1)
   - Grandma's helmet (remove 2 if ≥15 HP)
   - Smoke bomb
   - (H)
   - GEEK once read "2 per marker" in the Prince fight (L, likely a misreading).
5. **Healing never exceeds starting HP** (heroes and bosses). (H)
6. **Heal potion:** +8, one per hero per fight, shared pool (one hero may drink several). Backpack: draw 3, unlimited. Lucky Charm: unlimited. Medicine bag: remove 2 markers, reusable. (H)
7. **Draw effects:** may exceed hand size during the round. Refill in phase 7 up to your hand value; discard any hand cards in phase 6. Reshuffle only when you need to draw. (H)
8. **Lightning (extra action):** chains without limit. Improvise (play the top 2 cards of your draw pile): resolve the first card's bonus actions before the second card (chat answer, M). The Lucky Charm ignores lightning. An extra action still triggers even if the card's main effect fizzles (melee against the flying dragon). (M)
9. **Chivalrous Act / Ritterlicher Beistand:** "The boss attack targeting you is cancelled; redirect another hero's boss attack to you." Its riders move with it. Playable only while you are threatened (designer, BB2). (H)
10. **Talking:** players may name card types and roles but not exact numbers. (H)
11. **No Undo in the app** ("it wouldn't work for some boss effects", OSC). A support played without a matching attack is lost. (H)
12. **Deck building:** minimum 20 cards. At most 1 loot card per star level. You may swap loot cards between fights. You may leave out one deck card for each additional loot card added (rulebook "Fortgeschrittene Kampfvorbereitung", from boss 2; designer ruling BB2 82:15). (H)
13. **Hero stats = race card + class card:**
    | Race | HP | Hand |
    |---|---|---|
    | Dwarf | 14 | 5 |
    | Elf | 14 | 5 |
    | Troll | 16 | 4 |
    | Halfling | 11 | 6? |

    | Class | HP | Hand |
    |---|---|---|
    | Warrior | +10 | +1 |
    | Rogue | +10 | +1 |
    | Mage | +7 | +2 |
    | Druid | +7 | +2 |

    - Examples: Dwarf Warrior 24/6, Troll Mage 23/6, Elf Mage 21/7, Halfling Rogue 21/7, Troll Warrior 26/5.
    - Starting deck: 6 race + 6 class = 12 cards, then 20 after the tutorial. (H)
