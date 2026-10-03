# Wave Rider — Website

The marketing and support site for **Wave Rider: Boat Stunt Racing**, a physics boat game for iOS
and Android. Plain static HTML, CSS and JS: no build step at runtime, no dependencies, hosted on
GitHub Pages inside the `smartlifeutils.github.io` repo, next to `../inkbounce`.

It is built to look like the game, not like a web template. Everything on it is the game's own
art, exported from the Unity repo by one script, and every number on it is read from the game's
assets or design docs.

## Pages

| File | URL | Purpose |
|---|---|---|
| `index.html` | `/waverider/` | Home: the boot splash, a playable live sea, tricks, boats, seas, the garage, daily goals, download |
| `support.html` | `/waverider/support.html` | **Store-required support URL**: contact, FAQ, bug reports |
| `privacy.html` | `/waverider/privacy.html` | **Store-required privacy policy** (same text as the in-game one) |
| `terms.html` | `/waverider/terms.html` | Terms of service (same text as the in-game one) |
| `404.html` | direct hits only | GitHub Pages serves the repo-root 404 for unknown paths |

Store submission URLs are the ones in the game repo's `Docs/Release/01_IDENTITY.md`:
`https://smartlifeutils.github.io/waverider/privacy.html`, `…/terms.html`, and the support page.
`app-ads.txt` lives at the repo root, shared by every SmartLife app.

## Local preview

```bash
python3 -m http.server 8000
```

Then open <http://localhost:8000>. The only absolute URLs are the `canonical`, `og:url` and
`og:image` tags in each `<head>`.

## What the site shows, and what it doesn't

The site names **only the launch set**. Content that hasn't shipped never appears, so an update can
be announced rather than walked back:

| | Shown |
|---|---|
| Boats | Motor Dinghy (free), Speedboat, Jet Ski, Rescue RIB |
| Seas | Calm Lake, Nile, Loch Ness, Pacific, Caribbean |

Counts are never printed ("4 boats" reads small next to the genre). Each list ends on a locked
**?** card, the same reveal-a-window trick the game's own world carousel uses. If the Caribbean
does not make 1.0, delete its `<article class="world">` and its picker button in `index.html`.

### Adding a boat or sea when it ships

1. Add it to `BOATS` / `WORLDS` / `ACTORS` in `tools/build-assets.py` and re-run the script.
2. Add a card to `#boats` or `#seas` in `index.html` (copy a neighbour).
3. Add its picker button under the live sea, and a row to `BOATS` or `SEAS` in `assets/js/sea.js`
   (the comment above each table says which asset fields to copy).

### Where the numbers come from

| On the page | Source in the game repo |
|---|---|
| Boat prices, world unlock prices and free-path distances | `BoatDefinition_*.asset` / `WorldDefinition_*.asset` `unlockCost`, `unlockMilestoneMetres` |
| Boat promises | `Docs/Design/04_BOAT_CATALOG.md` |
| Stat pips (0–10) | Asset values, floored and capped at 10: speed = `targetTopSpeed` × 0.6, air = `airTorque` ÷ 16, stability = (`capsizeAngle` − 68) ÷ 5, range = `tankSize` ÷ `drainRate` × `targetTopSpeed` ÷ 50 |
| Sea signatures, stars, actors and their lines | `Docs/Design/06_WORLD_CATALOG.md`, `mutatorLabel` / `mutatorHint` on each world |
| Trick names and payouts | `Docs/Design/01_CORE_LOOP_AND_CONTROLS.md` *Scoring* (only the fixed numbers: +50/s air, +200 flip, +300 the big one) |
| Garage demo | The Rescue RIB: PlaningWork family totals from `05_UPGRADES.md`, base 1,250, cost = base × 1.28ⁿ, rounded per `UpgradeTable.RoundCost` |
| Missions, streak, ranks | `09_META_AND_ECONOMY.md`, `BadgeBook.RankTitles` |

Re-check these against the game before each release; the game wins any disagreement.

## Art: `tools/build-assets.py`

Every file under `assets/img/` (except `badges/`) and `assets/fonts/` is generated from the Unity
repo. Re-run it whenever the game's art changes:

```bash
pip install pillow fonttools brotli
python3 tools/build-assets.py ~/Projects/UnityProjects/WaveRider
```

It exports the splash, icon and an `og:image` crop of the splash; lifts the **WAVE RIDER** title
off the splash's sky into a transparent logo; crops the boats, skipper, actors, UI icons and pedals
to their pixels; copies the world cards, backdrop strips and UI skin plates; draws the three
seamless water tiles that roll under the hero (`surf/*.svg`: the Pacific's water colours, Gerstner
crests, the game's rim and crest lines, foam on the peaks); subsets Lilita One
(the game's font) and Nunito (body text, OFL, found via `$NUNITO_DIR`) to latin woff2; and writes
`assets/js/art.js`, the crop box of each sprite so the live sea can place a cropped hull exactly
where the game places the full PNG.

The official store badges in `assets/img/badges/` are not generated. Apple's has an opaque white
corner, so `.badge img` rounds it.

## The live sea: `assets/js/sea.js`

A small toy, not a port of the game, built from the game's data:

- each sea's palette, swell and backdrop strips come from its `WorldDefinition`, `WaterBiome` and
  `WaveProfile` assets, with the swell scaled to what a mid-run sea looks like;
- each hull is fitted the way `BoatVisual` fits it (PNG width = `hullLength × hullSpriteScale`
  metres; the skipper's canvas = 1.35 m × `captainScale`, centred at the deck line +
  `captainOffset`; drawn over, under or not at all per `captainDraw`);
- the controls and the trick names are D/01's.

It pauses off screen and in a background tab, and with *reduce motion* on it only runs while a
pedal is held. `window.__waveToy.tick(seconds)` steps it by hand for testing (a hidden tab gets
no animation frames).

## Trailer and screenshots

Both sections are in `index.html` with a `hidden` attribute, so they can't show up empty:

- **Trailer**: put `assets/video/trailer.mp4` and `assets/video/trailer-poster.jpg` in place, add
  `poster="assets/video/trailer-poster.jpg"` to the `<video>`, delete `hidden` on `#trailer`.
- **Screenshots**: capture with *Tools ▸ Wave Rider ▸ Store ▸ Capture Screenshots*, convert to
  1440-wide WebP in `assets/img/shots/`, list them in `.shots`, delete `hidden` on
  `#screenshots`. Any image there opens in the lightbox.

## Design rules (from the game's `UI_DESIGN_SYSTEM.md`)

- **One display face**, Lilita One, always uppercase, white with a heavy ink keyline and a hard
  drop (`.gt`, `.h-display`). Nunito is only for sentences.
- **Panels are the game's card**: `.frame` slices `skin/card.webp` with `border-image`, the same
  9-slice the game uses (slice numbers are `UiSkinMenu.Pieces`' border fractions × sprite size).
- **Plates follow the game's colour rule**: green (`.plate--go`) is the priority action only,
  blue (`aria-pressed="true"` / `.plate--here`) is "you are here", steel is everything else.
- Flat colour blocks joined by wave edges (`.sec::before`). No glows, no gradients on chrome,
  no outline-only icons. Copy follows the store listing's voice: concrete, warm, no em dashes.

## Before launch

- [ ] **Store links.** Turn the `<span class="badge">` elements in `index.html` (hero and
      `#download`) into links, drop the **Soon** stickers, and change "Coming soon" copy. Play's
      URL is `https://play.google.com/store/apps/details?id=com.smartlife.waverider`; Apple's needs
      the app id. Consider a `play.html` smart link like `../inkbounce/play.html`.
- [ ] **Leaderboards.** The Captain rank tile mentions leaderboards; `STORE_LISTING.md` says to cut
      them if the Play Games ids are still `REPLACE_ME` at 1.0.
- [ ] **Firebase.** The privacy policy (here and in `legal_content.json`) names Firebase Analytics
      and Crashlytics, which are not installed (`02_MONETIZATION.md`, open decision). Ship it or
      take it out of both copies.
- [ ] **Notification example.** Both copies of the policy say a reminder might be "that your fuel
      is topped off"; the game's reminders are about the daily streak (`09_META_AND_ECONOMY.md`).
- [ ] **Trailer and screenshots**, above.
