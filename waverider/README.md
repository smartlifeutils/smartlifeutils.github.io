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
| `index.html` | `/waverider/` | Home: the boot splash, the trailer, a playable live sea, the screenshot gallery, tricks, a short boat line-up (the full story is on `boats.html`), the seas board, the garage, daily goals and the streak, download |
| `play.html` | `/waverider/play` | **The link to share**: a phone goes straight to its store (Android to Play, iPhone and iPad to the App Store); desktops, Fire tablets and anything unknown see a download card. `?platform=ios\|android\|none` forces a branch for testing |
| `boats.html` | `/waverider/boats.html` | Every boat in depth, built around the All Boats Showcase YouTube video: role, where it does best, stock vs upgraded meters |
| `seas.html` | `/waverider/seas.html` | Every sea in depth (water, hazards, view, locals, unlock) and the boat × sea fit table, from the game's `06_WORLD_CATALOG.md` and `07_BOAT_WORLD_MATRIX.md` (launch seas only). Room for a seas video when one exists |
| `garage.html` | `/waverider/garage.html` | The upgrade lanes and a stock vs upgraded table, built around the Garage YouTube video, whose chapters seek the player (`data-seek` in `main.js`) |
| `support.html` | `/waverider/support.html` | **Store-required support URL**: contact, FAQ, bug reports. The FAQ answers what players ask (free? remove ads? offline? iPad? new phone? restore? kids?) and is mirrored word for word in its `FAQPage` JSON-LD |
| `press.html` | `/waverider/press.html` | Press kit for writers and video makers: fact sheet, descriptions to copy, key features, the trailer (with a download link) and the two YouTube videos, every screenshot, the title screen, logo and icon with links to the full files, press contact. Linked from every footer. No release date, quotes, awards, ratings or download numbers |
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

Then open <http://localhost:8000>. The only absolute URLs are the `canonical`, `og:url`,
`og:image` and JSON-LD tags in each `<head>`, and `sitemap.xml`.

## Search

- `sitemap.xml` lists the indexable pages (home, boats, seas, garage, support, privacy, terms,
  press) plus the home page's screenshots, the Seas cards and the press kit's art. `robots.txt` lives at the repo root (crawlers only read it there) and points to it.
  **Bump `<lastmod>` on a page whenever its content changes**, and add a `<url>` for any new page.
- Internal links to the home page use `./`, never `index.html`, so only one home address exists.
- `index.html` carries JSON-LD: the game (`VideoGame` + `MobileApplication`, free, both store
  links), the publisher (`Organization` `https://smartlifeutils.github.io/#org`, the same `@id`,
  description, country and `sameAs` developer pages as the root homepage's) and the trailer
  (`VideoObject`, its `duration` and `uploadDate` must follow `trailer.mp4`). Every other indexable
  page has a `WebPage` + `BreadcrumbList` pointing back at the game and the site; `support.html`
  adds a `FAQPage` whose questions and answers are its visible FAQ text, word for word (change both
  together). Check them at <https://search.google.com/test/rich-results> after editing.
- Every indexable page has `<meta name="apple-itunes-app" content="app-id=6819839167">`, Safari's
  smart app banner for the App Store listing (it shows nothing while the listing isn't live).
  Not on `play.html` or `404.html`.
- Share images: `og:image` is a JPEG or the YouTube thumbnail on every page, because Facebook,
  LinkedIn and iMessage handle JPEG best. Seas uses `assets/img/shots/nile-1600.jpg`, made from the
  WebP with `sips -s format jpeg -s formatOptions 82 nile-1600.webp --out nile-1600.jpg`
  (`build-assets.py` doesn't write it, so redo it when the shot changes). Every page also sets
  `og:image:alt`, `og:site_name`, `og:locale` and `twitter:card`.
- The first section's pictures load eagerly; everything below it has `loading="lazy"`.
- `play.html` and `404.html` are `noindex` on purpose.
- Topic pages (`boats.html`, `seas.html`, `garage.html`) each carry one YouTube video, embedded from
  `youtube-nocookie.com`, described by a `VideoObject` (plus `Clip`s for chapters) and by a
  `<video:video>` entry in the sitemap. Their stats repeat the home page's, so change both together.
  A new video gets its own topic page the same way: one video per page, plenty of text around it.
- Google Search Console: meant to be a URL-prefix property for
  `https://smartlifeutils.github.io/waverider/`, but **the verification file is not in the repo**
  (no `google*.html` here or in the git history). Verify it again from Search Console (the HTML
  file into this folder, or a `google-site-verification` meta tag on `index.html`), commit what
  Google issues, and never delete it. Then submit `sitemap.xml` there.

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
does not make 1.0, delete its `<article class="tile tile--carib">` and its picker button in `index.html`,
and re-place the remaining tiles in the `.tile--*` grid rules in `style.css` so the board has no empty cell.

### Adding a boat or sea when it ships

1. Add it to `BOATS` / `WORLDS` / `ACTORS` in `tools/build-assets.py` and re-run the script.
2. In `index.html`, add an `<li>` to the `.fleet` line-up in `#boats` (before the **?** item; the
   grid is five across, so widen `.fleet` too) and a row to `boats.html`, or a tile to the `#seas`
   board (copy a neighbour and give it a place in the `.tile--*` grid rules).
3. Add its picker button under the live sea, and a row to `BOATS` or `SEAS` in `assets/js/sea.js`
   (copy a neighbouring row and take its fields from the game's assets, see *The live sea* below).

### Where the numbers come from

| On the page | Source in the game repo |
|---|---|
| Boat unlock order ("2nd unlock"…) and sea prices | `unlockCost` on `BoatDefinition_*.asset` (the garage sorts by it) and on `WorldDefinition_*.asset`. Every sea opens by coins only since 2026-10-08 (D/09 *Unlocks*); the free path is dormant |
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

Every file under `assets/img/` (except `badges/` and `shots/nile-1600.jpg`, see *Search*) and
`assets/fonts/` is generated from the Unity repo. Re-run it whenever the game's art changes:

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
the store set at `WaveRider/Build/listing/google-play/screenshots_1920x1080/` (framed, with the store captions burned in;
see `Tools/store-shots/`) and the plain captures at `WaveRider/Build/screenshots/website/`.
`tools/build-assets.py` exports the ones listed in its `SCREENSHOTS` table to `assets/img/shots/`
(1600 and 480 wide WebP). They appear in two places:

| Where | Shot |
|---|---|
| `#screenshots`, the gallery after the live sea | The store set: JUMP HUGE WAVES, FLIP IT. LAND IT., FROM THE NILE TO THE PACIFIC, MEET THE LOCALS, FROM DINGHY TO RESCUE RIB, UPGRADE ENGINE, HULL AND MORE, DAILY MISSIONS AND BADGES, PLAY OFFLINE, NO ACCOUNT. REAL WATER PHYSICS is left out: the frame is dimmed and the tricks section already shows a capsize |
| `#tricks`, beside the trick list | The Speedboat tipped past vertical mid-flip over the Pacific, ORBIT +200 (`09_speedboat_pacific_flip_hud.png`, 2026-10-19), and under it the Motor Dinghy capsized on the Pacific, sinking under the wave (`10_dinghy_pacific_sinking_hud.png`, 2026-10-19) |

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

(run from the Unity repo root). `press.html` lists all ten, linked to their 1600 files. The gallery is one big shot with all eight thumbnails beside it (two
columns on desktop, a row of four on phones); change `.viewer__thumbs` in `style.css` if the count
changes. Clicking a thumbnail swaps the big shot, and clicking the big shot opens it full screen.

To change them: recapture, update `SCREENSHOTS` and the matching thumbnails
(`.viewer__thumb`, whose `data-cap` is the caption under the picture) in `index.html`, and re-run the script.
Captures must show launch content only.

**Trailer**: `#trailer` is the first thing under the hero ("This is the game."), ahead of the
live sea ("Now you try") and the gallery ("The real sea is bigger"), because most visitors
decide on the first screen. The hero's TRAILER pill scrolls to it and starts it. `assets/video/trailer.mp4` is the game repo's
`WaveRider/Build/listing/youtube/promo-trailer_1920x1080_60fps.mp4` re-encoded for the web (1080p60, about 14 MB):

    ffmpeg -i promo-trailer_1920x1080_60fps.mp4 -c:v libx264 -preset slow -crf 23 -maxrate 7M -bufsize 14M \
      -profile:v high -level 4.2 -pix_fmt yuv420p -c:a aac -b:a 160k -movflags +faststart trailer.mp4

`trailer-poster.jpg` is the frame at 2.3 s (the Speedboat airborne over a crest under JUMP HUGE WAVES), 1600 wide.
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

The page layout (the 2026-10-26 redesign):

- **The ink keyline belongs to the type.** Panels, pictures and boxes carry no ink outline and no
  hard drop shadow; they are flat fields told apart by colour, with one corner radius (`--radius`,
  28px). The game's own interface pieces (the live sea, the garage lanes, the store card) keep their
  look and are marked `data-ui`.
- **A small set of type sizes**, as tokens: `--fs-display` (section titles), `--fs-title`,
  `--fs-lead`, `--fs-body` and `--fs-small`. Headings
  stay on two lines at every width.
- **Sections vary their layout** (title beside the trailer, the gallery, the trick list beside its
  shots, the seas board), left-aligned on one grid with `--gutter` margins. The one exception is
  the hero, which is the game's boot splash as it was before the redesign.
- **Subpages** open with the same sky intro (`.page-hero`) but their own art: the four boats on
  Boats, Nessie on Seas, the Rescue RIB on Garage, the skipper on Support and the legal pages, the logo on the press kit.
  Section titles sit left with their sentence beside them (`.head`), videos carry their notes and
  chapters beside them (`.watch`), and the legal pages keep an "On this page" list beside the text
  (`.legal`; each numbered `<h2>` has an `id` of `s` plus its number).
- **Gold pill** (`.kicker`): the "Now you try" badge over the live sea. Keep it rare so it stays loud.
- **Section colour fields** keep white keyline titles readable: dark fields for most sections,
  `--sea` for the download section.
- **Motion**: sections enter once as they scroll in
  (`data-reveal`, in `main.js`), and under *reduce motion* nothing moves.

## Before launch

- [x] **Store links.** The hero and `#download` badges link to the App Store
      (`id6819839167`) and Google Play (`com.smartlife.waverider`); the copy says "Out now", and
      `play.html` is the one link to share. On 2026-10-27 both listing URLs still answered 404 to
      the public, so check them before sharing anything. The site gives no release date until they work.
- [ ] **Leaderboards.** The Captain rank tile mentions leaderboards; `STORE_LISTING.md` says to cut
      them if the Play Games ids are still `REPLACE_ME` at 1.0.
- [ ] **Firebase.** The privacy policy (here and in `legal_content.json`) names Firebase Analytics
      and Crashlytics, which are not installed (`02_MONETIZATION.md`, open decision). Ship it or
      take it out of both copies.
- [ ] **Notification example.** Both copies of the policy say a reminder might be "that your fuel
      is topped off"; the game's reminders are about the daily streak (`09_META_AND_ECONOMY.md`).
- [x] **Trailer**, above.
