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
| `index.html` | `/waverider/` | Home: the boot splash, the trailer, a playable live sea, the gallery, tricks, boats, seas, the garage, daily goals, download |
| `play.html` | `/waverider/play` | **The link to share**: a phone goes straight to its store (Android to Play, iPhone and iPad to the App Store); desktops, Fire tablets and anything unknown see a download card. `?platform=ios\|android\|none` forces a branch for testing |
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

**After changing any CSS or JS, bump `?v=` on its links in every page** (one find-and-replace).
GitHub Pages lets browsers keep assets for 10 minutes, so without a new version a fresh page can
load next to the old stylesheet and show half old, half new.

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
| Boat unlock order ("2nd unlock"…) and sea free-path distances | `BoatDefinition_*.asset` `unlockCost` (the garage sorts by it), `WorldDefinition_*.asset` `unlockMilestoneMetres` |
| Boat promises | `Docs/Design/04_BOAT_CATALOG.md` |
| Stat pips (1–10): `--v` stock, `--m` fully upgraded | The game's garage meters (`Docs/Design/05_UPGRADES.md` *The garage meters*). Copy them from the log of the EditMode test `BoatStatsTests.MeterTable` — never re-derive them here |
| Sea signatures, stars, actors and their lines | `Docs/Design/06_WORLD_CATALOG.md`, `mutatorLabel` / `mutatorHint` on each world |
| Trick names and payouts | `Docs/Design/01_CORE_LOOP_AND_CONTROLS.md` *Scoring* (only the fixed numbers: +50/s air, +200 flip, +300 the big one) |
| Garage demo | The Rescue RIB: PlaningWork family totals from `05_UPGRADES.md`, base 1,250, cost = base × 1.28ⁿ, rounded per `UpgradeTable.RoundCost` |
| Missions, streak, ranks | `09_META_AND_ECONOMY.md`, `BadgeBook.RankTitles` |

Coin prices for boats and seas are deliberately left off: they are balance numbers that move
with every tuning pass, and six-figure prices next to coin packs read as grind to someone who
hasn't played. The garage demo keeps its costs, since it is showing the upgrade loop itself.

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

## Screenshots and trailer

**Screenshots** are real captures from the game, 1920×1080, from two folders in the Unity repo:
the store set at `WaveRider/Build/store-shots/play/` (framed, with the store captions burned in;
see `Tools/store-shots/`) and the plain captures at `WaveRider/Build/screenshots/website/`.
`tools/build-assets.py` exports the ones listed in its `SCREENSHOTS` table to `assets/img/shots/`
(1600 and 480 wide WebP). They appear in three places:

| Where | Shot |
|---|---|
| `#screenshots`, the gallery after the live sea | The store set: JUMP HUGE WAVES, FLIP IT. LAND IT., FROM THE NILE TO THE PACIFIC, MEET THE LOCALS, FROM DINGHY TO RESCUE RIB, UPGRADE ENGINE, HULL AND MORE, DAILY MISSIONS AND BADGES, PLAY OFFLINE, NO ACCOUNT. REAL WATER PHYSICS is left out: the frame is dimmed and the wipeout box already shows a capsize |
| `#tricks`, the big picture | Jet Ski backflip over the Nile (ORBIT +50 and FLIP +200 in the popup lane, the Triple Axel secret found) |
| `#tricks`, the wipeout box | Motor Dinghy capsized on the Calm Lake (the clean capture: the HUD one shows a stray "+82 BADGES") |

MEET THE LOCALS is not in the store set. It is the plain Caribbean capture
(`06_speedboat_caribbean_manta.png`) run through the store caption tool, saved next to it as
`06_speedboat_caribbean_manta_caption.png`:

```bash
mkdir -p /tmp/cap/raw/play && cp WaveRider/Build/screenshots/website/06_speedboat_caribbean_manta.png /tmp/cap/raw/play/caribbean.png
echo '[{"name":"caribbean","caption":"MEET THE LOCALS"}]' > /tmp/cap/captions.json
swiftc -O Tools/store-shots/caption.swift -o /tmp/cap/caption
/tmp/cap/caption /tmp/cap/raw /tmp/cap/out /tmp/cap/captions.json WaveRider/Assets/_Game/Art/UI/Fonts/LilitaOne-Regular.ttf
cp /tmp/cap/out/play/01-caribbean.png WaveRider/Build/screenshots/website/06_speedboat_caribbean_manta_caption.png
```

(run from the Unity repo root). The gallery shows 8 thumbnails in a 4-column grid; change
`.viewer__thumbs` in `style.css` if the count changes.

To change them: recapture, update `SCREENSHOTS` and the matching thumbnails
(`.viewer__thumb`, whose `data-cap` is the caption under the picture) in `index.html`, and re-run the script.
Captures must show launch content only.

**Trailer**: `#trailer` is the first thing under the hero ("This is the game."), ahead of the
live sea ("Now you try") and the gallery ("That was the toy."), because most visitors decide on
the first screen. The hero's TRAILER pill scrolls to it and starts it. `assets/video/trailer.mp4` is the game repo's
`WaveRider/Build/trailer/out/hero_1920x1080_60.mp4` re-encoded for the web (1080p60, about 12 MB):

    ffmpeg -i hero_1920x1080_60.mp4 -c:v libx264 -preset slow -crf 23 -maxrate 7M -bufsize 14M \
      -profile:v high -level 4.2 -pix_fmt yuv420p -c:a aac -b:a 160k -movflags +faststart trailer.mp4

`trailer-poster.jpg` is the frame at 21.1 s (the Speedboat airborne over a crest), 1600 wide.
`main.js` swaps the poster's play button for native controls on the first click and shows the
end card (store badges, Watch again) when it finishes; with JS off it is a plain `<video>`.

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

- [x] **Store links.** The hero and `#download` badges link to the App Store
      (`id6819839167`) and Google Play (`com.smartlife.waverider`); the copy says "Out now", and
      `play.html` is the one link to share.
- [ ] **Leaderboards.** The Captain rank tile mentions leaderboards; `STORE_LISTING.md` says to cut
      them if the Play Games ids are still `REPLACE_ME` at 1.0.
- [ ] **Firebase.** The privacy policy (here and in `legal_content.json`) names Firebase Analytics
      and Crashlytics, which are not installed (`02_MONETIZATION.md`, open decision). Ship it or
      take it out of both copies.
- [ ] **Notification example.** Both copies of the policy say a reminder might be "that your fuel
      is topped off"; the game's reminders are about the daily streak (`09_META_AND_ECONOMY.md`).
- [x] **Trailer**, above.
