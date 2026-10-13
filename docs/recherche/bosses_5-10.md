# Boss Fighters QR – bosses 5-10, seasonal bosses, Elite mode: research from transcripts and the web

Sources searched: all `yt_all/*.txt` (22 transcripts), `yt_all/para/`, and `ytc/*.txt`. Boss-name keyword grep: Oger|Ogre|Tentakel|Tentacol|Kraken|Krake|Magma|Bombossa|Bombe|Jelly|Gelee|Glibber|Schleim|Slime|Voodoo|Vaudou|Grumpy|Eggsecutor|Elite|Jungle Fever|köpfig|trois têtes.

## Main finding: coverage gap

The transcripts cover these bosses only very thinly.

- **Three-Headed Ogre:** the only later boss with a full fight on video. It is in IJ13O0AxXuw (Brettspielblog live let's play, from about 268:00 to 318:00). That was a **pre-release build** (bosses 1-5 only, recorded "3 weeks before release"). Numbers may differ from the final app. The developers said on stream: "der Oger hat auch etwas wenig Leben auch im nächsten Update" (the ogre also has too little life, fixed in the next update).
- **Tentacolossus / Kraken:** only its legend screen (IJ13O0AxXuw 320:46).
- **Jelly and Bombossa:** one or two sentences each (jQ49C9ymzmI).
- **Magmaros and Madame Voodoo:** named only (pAqJAM7xdE0 166:45).
- **Grumpybeard, Eggsecutor, Elite mode, Jungle Fever:** web sources only. Elite mode is also shown in 5Pczj34gmtY, but against the Prince.
- **Videos that would cover bosses 5-10 but have NOT been transcribed:** `Hah1CqBGfrQ` (Brettspielblog "Boss 4 & 5", 120 min), `JZyh67BVLSs` (Brettspielblog "Boss 5, 6 & 7", 328 min) and `PAtOqdtmh1Q` (Geekpunkt XXL uncut, 208 min). A fetch attempt in this session failed with YouTube `IpBlocked`. **These are the top priority to transcribe** once the IP block lifts.
- **BoardGameGeek:** returns 403 to WebFetch, and the XML API now needs authorization, so forum threads could not be read. Thread titles seen in search results: "Three-Headed Ogre Hero Abilities (Dreiköpfiger Oger)", "Boss 8 Question / Tipp", "How does Tentacle whirl work" (so the Kraken has an ability named **"Tentacle Whirl"**, EN), and "What about Eggs? - New seasonal Boss released" (https://boardgamegeek.com/thread/3682857).

## Campaign order (High)

pAqJAM7xdE0 [166:36-167:13] (Les Joueurs du Dimanche, reading the campaign material): "la chasseuse d'âme, le dragon des terres, le golem de pierre, l'ogre à trois têtes, le Kraken, Magmarot [Magmaros], Bombossa, le monstre gélatineux et enfin madame Vaudou".

| # | Boss | Notes |
|---|---|---|
| 0 | Mr. Puppet (tutorial) | |
| 1 | Prince (frog prince) | |
| 2 | Soul Huntress | |
| 3 | Aether/Earth Dragon | |
| 4 | Stone Golem / Steinriese | |
| **5** | **Three-Headed Ogre** | Confirmed boss "Nummer fünf" in IJ13O0AxXuw [319:27]: "Steinriese war nach dem Etherdrachen der dreiköpfige Oger" (332:38) |
| 6 | Kraken / Tentacolossus | Its info screen appears right after the ogre rewards (IJ13 320:46) |
| 7 | Magmaros | |
| 8 | Bombossa | Confirmed as Boss No. 8 by the BGG "campaign review" search snippet; the hardest boss for that reviewer (6 attempts). https://boardgamegeek.com/thread/3747077 |
| 9 | Jelly monster (monstre gélatineux) | BGG review: beaten first try. App 1.0.818 (06/11/2025): "fixed faulty Boss 9 mechanic, Boss 9 slightly weaker" |
| 10 | Madame Voodoo (Madame Vaudou) | |

Loot decks (pAqJAM7xdE0 [165:54], High): Bronze = boss 1-2, Silver = boss 3-7 (64 cards), Gold = boss 8-10 (53 cards). This matches the box contents memory (62+64+64+53).

App changelog (App Store NZ, https://apps.apple.com/nz/app/boss-fighters-qr/id1607885054):

- 1.0.792 (15/10/2025): pre-release with bosses 1-5; bosses 6-10 expected 24 Oct 2025.
- 1.0.735: bosses 4 and 5 made more resilient; damage display for bosses 3 and 5 improved.
- 1.1.833 (16/12/2025): "the Three-headed Ogre can now be attacked in melee during round 6"; the Soul Huntress made slightly easier; winter event added.

---

## Boss 5: Three-Headed Ogre (DE "Dreiköpfiger Oger", FR "l'Ogre à trois têtes")

Evidence: IJ13O0AxXuw (DE, pre-release, level 3 ("Stufe 3"), apparently 4 heroes: elf mage, troll druid, plus Annika and Karl), 268:00-318:05.

### Legend / info screen (High for the ages; height probably ASR-correct)
- "Hier ist der dreiköpfige Oger. Der ist ja auch **16 m hoch** und er ist **27, 48 und 82 Jahre alt**" [268:46]. Each head has its own age. Terrain and treasure were not read aloud.

### Heads (Medium for the names, ASR)
Three named heads:
- **"Saber"** (possibly "Sabber" = drool, which fits poison spitting)
- **"Hörnchen"**
- **"Zotte"**

Each head has its own damage bar ("Das sind die Balken von denen" [277:38]) and each does something different ("jeder Kopf macht was anderes" [275:49]). The colours seem to match damage types ("korrespondiert so ein bisschen zu Farben" [286:00]).

Per-head effects seen:
- **Saber:** "Saber übernimmt: fresst mein Gift! Saber spuckt euch an, erhaltet jeweils eine Giftmarke" [276:58-277:04]. Every hero gets 1 poison. Seen at the start of round 1, i.e. a round-start / hourglass effect.
- **Hörnchen:** "Hörnchen verfluchen ... Jeder Held entfernt die zwei [obersten] Karten seines Nachziehstapels aus dem Spiel" [306:57-307:02]. Each hero removes the top 2 cards of their draw pile from the game. This happened in the boss phase of round 2 instead of a normal attack ("Er greift nicht an").
- **Round 2 start:** "[Ogre] zum Einstieg verflucht euch. Zieht jeweils eine Fluchkarte und legt sie verdeckt neben die Heldenkarte" [293:13]. Every hero draws 1 curse card face down; it is revealed in the "Fluchphase". Players later concluded this was a transition-phase effect, not a reaction, and "Du hättest die Flüche abwehren können" [309:51].
- **Zotte:** its knock-out line is "Zotte will zu Mutti" [291:03 / 317:46]; the "Keule" (club) attack is probably Zotte's. Players speculated about a schedule: "Runde 1 der Gift..., Runde 2 ... an der Keule Runde drei" [308:29-308:52] (Low).

### Life (Medium; pre-release)
- On screen at start: "145 Lebenspunkte pro Kopf. Nein, hier 49, hier 131" [275:41-275:46]. Later: "der hatte 145 Lebenspunkte" in total [322:12], "Wo hat die angefangen? Bei 175. Nee, 145 oder so" [285:19].
- Best reading: about 145 total HP at level 3 with 4 heroes (pre-release; the ogre was buffed afterwards, see app 1.0.735).
- With 41 left [312:08] they needed 39, then 28 more [313:19-313:59]. Killed at the end of round 3.

### Enrage (Medium)
- "**Enrage erst Runde 6**" [275:59]. Later the app patch (1.1.833) mentions melee during round 6, so something about melee changes in round 6. Perhaps melee could not be used in round 6 before the patch, or the ogre becomes unreachable in melee.

### Shields (Medium)
- It has boss shields. Annika (halfling) destroying a shield triggered her "boss loses 4 life" hero ability [280:17, 297:14].
- "Es gibt nur zwei Schutze" (only two shields?) [286:00]; a "Magieschild" is mentioned [297:26, 313:59]; "Pyrofalle: lower a boss shield of your choice by 4" (a card).
- An unidentified marker: "Wissen wir, was das bedeutet, dass da so ein fieses rosa Viech als Schild?" [310:32] (Low).

### Head knockout mechanic (High that it exists; numbers Low)
- When a head's bar is emptied: "<Kopf> wird bewusstlos. Hoffentlich habt ihr den richtigen Zeitpunkt getroffen." [289:21, 290:49, 291:06, 317:41-317:51]. Flavour lines: "Saber fühlt sich so schlapp", "Zotte will zu Mutti".
- All three knocked out in the same round: "Der dreiköpfige Oger taumelt, seine Attacken werden schwächer" [291:10]. The boss then did not attack normally ("Er greift nicht an ... ich bin so schwach. Nimm das!"), but "**jeder erhält zwei Giftmarker**" [291:25]. So even weakened, a head effect gives 2 poison each.
- Two heads knocked out at once in round 3: "Seine Attacken werden schwächer ... aber auch drastisch ... 3, 5, 6" [317:55-318:01]. The attack values dropped to 3/5/6.
- At the next round start: "Saber erholt sich und ist wieder bei voller Stärke. Hörnchen erholt sich ... Zotte erholt sich ..." [292:44-292:51]. Knocked-out heads recover at the start of the next round, and their bars refill.
- **Punishment for bad timing:** knocking out a head alone or at the wrong time triggers "**<Kopf> hat die anderen Köpfe motiviert. Die Bossattacken werden stärker**" [309:10-309:14]. Also, at a marker on a bar: "**Oger! Die Attacke des dreiköpfigen Ogers wird stärker**" [313:19]. Players read this as "the head deals more damage to whoever did it" [313:21]. A further line at 315:28-315:35 again says "Die Attacke wird stärker".
- Post-game player summary: "you want to time it so you knock all heads down evenly ... if you knock one head down it doesn't help much, they wake it up next round" [326:21] (Medium).

### Reaction "Gebiss" (Medium)
- "Ach, jetzt schon ist ein Stachel. Kriegst ein Gift ... ich krieg zweimal Gift" [279:52]. This happened while acting. Later: "das Gebiss ist eine Reaktion auf unsere Aktion" [309:38-309:49]. So there is a "Gebiss" (teeth) reaction ability that gives poison to the acting hero, possibly per attack.
- Player recap [325:41]: "Machst du vier plus Schaden, kriegst du Gift". Probably: deal 4+ damage in one attack and you receive 1 poison (Low-Medium; it may refer to the frog Prince instead).

### Poison on the boss
- "Der dreiköpfige Oger kriegt zwei Giftschaden" [307:49]. Boss poison works normally; the boss loses 1 poison token per round (discussed at 270:50).

### Rewards after the ogre (High; pre-release)
- Species card upgrade "Nummer fünf": hero life +5 (or +6) ("alle kriegen fünf Leben mehr ... die Fähigkeiten bleiben gleich") [319:27]. Troll druid becomes "Trollhäuptling" [318:46].
- Loot shown [319:27-320:50]:
  - **Wunderlampe**: "Ein Held deiner Wahl spielt drei Karten seines Nachziehstapels aus" (play 3 top cards), and the lamp is then removed for the rest of the boss fight. The FR review mentions "lampe magique ... joue trois cartes de sa pioche".
  - **Hypernova**: magic enhancement 7, you lose 2 HP.
  - **Borax Kriegshammer**: melee attack; a hero of your choice removes 1 status token.
  - **Amulett der Zeit**: the last played card with an attack is repeated.
  - **Geisterrüstung**: Protection 3, plus take one status token of your choice (from someone).
- Class special abilities unlocked:
  - Mage: each time you lose 1+ HP, draw a card.
  - Rogue: enhancements may be played without a prior attack.
  - Warrior: first attack each round ignores the shield.
  - Druid: the first protection played each round gets a lightning bolt.
- Earlier loot, before the ogre fight: "Magische Haut: Schutz = aktuelle Runde, führe eine weitere Aktion durch" [269:27], "Arkane Klinge", "Perfektes Zusammenspiel: jeder zieht 2 Karten, legt 1 ab", "Pestbote: boss gets 2 poison; only playable if you put another hand card on your draw pile".

---

## Boss 6: Tentacolossus / Kraken (DE "Tentakelboss" in speech)

- **Info screen (Medium, ASR):** "Und dann kommt der Tentakelboss. Der ist nur **40 m hoch und 7 Jahre alt** und wohnt auf dem/im **Sirenen[-meer/-see?]**. Lieblingsschatz: **Helm des Windes**" (IJ13O0AxXuw [320:46-320:52]).
  - The "Helm des Windes" is a card, probably a loot reward: "Helm des Windes ... Schutz 3" (5Pczj34gmtY [29:01-29:05]).
- **Ability name:** "Tentacle Whirl" (EN). Known only from a BGG rules-thread title seen in search results; the content could not be read (403). Low-Medium.
- No life, enrage, shield or attack data. Not covered by any transcript.

## Boss 7: Magmaros

- Named only (pAqJAM7xdE0 [166:55] "Magmarot"). A "Boss Magma" illustration caption appears on the Pegasus press page (https://news.pegasus.de/?p=10003, per search snippet).
- Likely tied to the **fire tokens** (rule below), but that is unconfirmed. No data.

## Boss 8: Bombossa

- **Bomb token (Medium):** "Après, on a encore ces petits jetons là mais qui appartiennent à des boss en particulier. Celui-ci très drôle: en fait, on va se passer de personnage à personnage la bombe en espérant qu'elle ne pète pas quand elle est chez nous" (jQ49C9ymzmI [22:52-23:35]). So the Ticking Bomb is passed from hero to hero, and it hurts whoever holds it when it explodes. Exact timing and damage are unknown.
- BGG campaign review (search snippet): Bombossa = Boss No. 8, hardest of the campaign, 6 attempts, needed deck rebuilds and learning the attack patterns. https://boardgamegeek.com/thread/3747077 (Medium).
- Another BGG thread title: "Boss 8 Question / Tipp" (content not read).

## Boss 9: Jelly / gelatinous monster (FR "monstre gélatineux")

- "Contre le monstre gélatineux qui va nous envoyer du **slime** et qui lui va **absorber nos cartes**. Va être assez compliqué." (jQ49C9ymzmI [19:26-19:38]) (Medium).
- jQ49 [13:15] says one boss is "très vicieux qui sert à **vider notre deck**", so starting with a big deck is better. This is probably the Jelly (or the Ogre's Hörnchen, which exiles 2 cards per hero) (Low).
- App 1.0.818 (06/11/2025): "Fixed faulty Boss 9 mechanic; Boss 9 slightly weaker".
- No numbers. The slime / lost pile rules are not in the transcripts.

## Boss 10: Madame Voodoo (FR "Madame Vaudou")

- Named only (pAqJAM7xdE0 [167:09]). No data about the Voodoo doll in any transcript or web result.

---

## Seasonal app bosses (web, High for dates and unlocks)

Source: App Store version history, https://apps.apple.com/nz/app/boss-fighters-qr/id1607885054 (also /us/).

- **Grumpybeard (winter event):** app 1.1.833 (16 Dec 2025). Available until 31 Jan; unlocked after defeating the first 3 bosses. No mechanics found.
- **Eggsecutor (US listing spelling "Eggsekutor"; Easter event):** app 1.2.883/1.2.886 (25-27 Mar 2026). Available until 30 Apr; unlocked after the first 5 bosses. BGG thread "What about Eggs? - New seasonal Boss released" (https://boardgamegeek.com/thread/3682857): you face it with loot cards up to 5 stars. No mechanics found.

## Elite Boss Mode

- **App:** 1.3.1023 (15 Jun 2026): "A new challenge awaits after completing the Campaign: Elite Boss Mode". It replays **the first 5 bosses** at higher strength, for heroes at star level 10 (App Store, High).
- **jQ49C9ymzmI** [24:58-29:09] (FR, High):
  - Elite available for Prince, Soul Huntress, Earth Dragon, Golem and Three-Headed Ogre. The first difficulty shown was called "mode légende".
  - Elite Dragon: attacks of **10-11 damage per hero** ("m'attaquera pour 11 dégâts"; "va attaquer tous les personnages de 10 dégâts ou plus") plus status effects.
  - Shields reach **8-9** instead of 3/4/5. Life is "pratiquement à 300".
  - Fully upgraded heroes have 30-35 HP. A fight takes about 1h30.
- **5Pczj34gmtY** (Pegasus, with designer Michael Palm; DE, High; pre-release elite build; vs Prince):
  - Elite Prince on difficulty **2 of 4** with 3 heroes: **244 HP** (normal Prince with 3 heroes ≈ 75 HP) [4:09].
  - "Seine Fähigkeiten sind ein Ticken stärker." Round 1 attack: "Dreier-Angriff ... aber dafür dreimal Gift" [6:12].
  - Abilities "Giftspucken" [10:19] and "Zungenhieb: eine Giftmarke für den mit den meisten Lebenspunkten" [23:54].
  - Damage in one round up to 14 per hero; "auf Stufe 4 ... 22 Schaden oder so" [23:54].
  - "Runde 5: Der Boss wird wütend" (enrage at round 5) [77:09].
  - Heroes had 30-34 HP (troll mage 33, others 34/30/30) [5:32].
- **Designer** [78:31-79:53]: on levels 3 and 4 the bosses partly get **new abilities**. Some bosses will get new abilities in Elite mode, because pure upscaling was not enough. The first 5 elite bosses come before Christmas and the other 5 later, possibly with extra challenges.

## Jungle Fever / Dschungelfieber expansion (web, High)

- Announced 10 Jul 2026, release Oct 2026 (https://www.wericmartin.com/boss-fighters-get-jungle-fever/; BGG id 474431).
- Contents:
  - **5 new jungle bosses** (not named anywhere).
  - New heroes: goblin tinkerer and dryad (shapeshifter).
  - New classes: Paladin and Shaman.
  - 20 new loot cards; new items including a Machete and a Torch.
  - Components: a box of 62 cards, 2 life counters and 83 punch-outs; a box of 47 cards, 2 hero boxes and a campaign token box; a rulebook. €28.99 (alternate.de: https://www.alternate.de/Pegasus/Boss-Fighters-QR-Dschungelfieber-Brettspiel/html/product/100215526).
- The transcripts' "Jungle Fever" hits in the INDEX are false positives ("Dschungeltroll" = Jungle Troll hero).

---

## Status token rules seen in play

| Token | Rule | Evidence | Conf. |
|---|---|---|---|
| **Poison** (Gift) | Lose 1 HP per poison token in the status phase, then poison goes down by 1. "Je mehr Gift auf ihm, desto länger ... er verliert immer nur einen" | IJ13 [270:50]; jQ49 [20:08] "on va perdre un point de vie par jeton poison" | High |
| **Panic** (Panik) | Put it on your hero card. While you have ≥1 panic you may only play hand cards at random: shuffle your hand, draw one at random and play it, then **immediately discard 1 panic token**. Items of your choice can still be used; panic does not affect them. Introduced with the Aether Dragon. | VGxhoQvD5iA [100:47-101:17] (read from the rules card); IJ13 [187:50-188:09]; jQ49 [20:08] (FR: "jouer une carte de ma main mais au hasard") | High |
| **Paralysis** (Lähmung) | Put it on your hero card. **Hand size −1 per paralysis token**, relevant only in phase 7 (refill). Can be discarded **only by card effects**. Introduced with the Stone Golem. | IJ13 [233:56-234:11]; jQ49 [20:49] "piocher des cartes en moins" | High |
| **Fire** (Feuer) | Per fire token, in **phase 5 (status effects)** reveal the top card of your draw pile. Then either **remove that card for the rest of the boss fight** or put it on your discard pile and **lose 2 HP**. | IJ13 [330:46-331:08] | High |
| **Curse cards** (Fluch) | Drawn face down next to the hero card and revealed in the curse phase. Three kinds: permanent; kept during your turn (discarded at the end of the round: "legt eure nicht permanenten Flüche jetzt auf den Ablagestapel"); and resolved when drawn. Examples: "gain 1 paralysis whenever you take boss-attack damage"; "gain 1 panic per protection card you play from hand". | IJ13 [293:13-293:47, 306:29, 310:17]; jQ49 [19:26] | High/Med |
| **Slime / lost pile** | Only "monstre gélatineux qui va nous envoyer du slime et absorber nos cartes". No rule text. | jQ49 [19:26] | Low |

## Items seen

| Item | Effect | Evidence | Conf. |
|---|---|---|---|
| **Medical Bag** (Medizintasche / sac de remède) | Discard 2 status tokens. Unlocked around the Dragon. | jQ49 [21:29]; VGxhoQvD5iA [101:19] | High |
| **Waterskin** (Trinkschlauch / outre) | Heal 3 HP. | IJ13 [226:32] "Mit Trinkschlauch kann man sich um drei heilen"; jQ49 [21:29] | High |
| **Grandpa's Glass Eye** (Opas Glasauge / œil de verre de grand-père) | Look at the top 3 cards of your draw pile and put them back in any order. Usable as the bonus action of the troll's ability ("play top card or use Opas Glasauge"). | IJ13 [226:38]; 5Pczj34gmtY [13:48-14:05]; jQ49 [22:12] | High |
| Healing potion | +8 HP, can be given to another hero; 1 per player. | jQ49 [21:29] | High |
| Phoenix essence | Shuffle your hand into your draw pile and redraw the same number. | jQ49 [22:12] | High |
| Lucky charm (porte-bonheur) | Play the top card of your draw pile; its lightning (bonus action) is ignored. | jQ49 [22:12-22:52] | High |
| Backpack (sac à dos) | Draw 3 cards. | jQ49 [22:52] | High |
| **Ticking Bomb** | Boss-specific token passed from hero to hero; hope it doesn't explode while you hold it (Bombossa). | jQ49 [22:52-23:35] | Medium |
| **Voodoo doll** | No evidence found. | — | — |
| Wunderlampe | Loot after the ogre (see above). | IJ13 [319:27] | High |

## Next steps to fill the gaps

1. When the YouTube IP block lifts, transcribe `JZyh67BVLSs` (Boss 5, 6, 7), `Hah1CqBGfrQ` (Boss 4 & 5) and `PAtOqdtmh1Q` (Geekpunkt uncut, likely later bosses). Then search further down the INDEX list for "Boss 8/9/10" videos.
2. Read the BGG threads in a logged-in browser: "Three-Headed Ogre Hero Abilities", "Tentacle whirl", "Boss 8 Question / Tipp", "What about Eggs?".
3. The boss rule cards in the box (each later boss comes with a small rule card for its new token: "der Boss ist in der Anleitung beschrieben, wenn er kommt ... eine kleine Karte dabei", VGxhoQvD5iA [100:39]). The owner's physical cards and rulebook are the most reliable source for slime, bomb and voodoo doll rules.
