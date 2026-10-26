# Ink Bounce: website

The marketing and support site for **Ink Bounce**, a one-thumb arcade game for iOS and Android.
Plain static HTML, CSS and JS: no build step, no dependencies. Hosted on GitHub Pages inside the
`smartlifeutils.github.io` repo, next to `../waverider` and `../budgetbuddy`.

It is built from the game's own material: the world art, the boss sprites, the badge icons, loops
cut from the trailer, and numbers read out of the Unity project.

## Pages

| File | URL | Purpose |
|---|---|---|
| `index.html` | `/inkbounce/` | Home: the name, a stack of the five worlds as folders with a playable level in the front one, the three modes, how a line works, the worlds, gear switches, the numbers, download |
| `worlds.html` | `/inkbounce/worlds` | Every world: art, what it adds and its boss; then the boss fight and how stars are won |
| `endless.html` | `/inkbounce/endless` | Endless: what changes the further you go, Fever, challenges and leaderboards |
| `gear.html` | `/inkbounce/gear` | The five gear pieces, the four boosts, all 54 orb skins in a picker, the badges |
| `support.html` | `/inkbounce/support` | **Store-required support URL**: contact, questions, bug reports |
| `privacy.html` | `/inkbounce/privacy` | **Store-required privacy policy** |
| `terms.html` | `/inkbounce/terms` | Terms of service |
| `play.html` | `/inkbounce/play` | **The link to share**: a phone goes straight to its store; anything else sees both badges. `?platform=ios\|android\|none` forces a branch |
| `404.html` | direct hits only | GitHub Pages serves the repo-root 404 for unknown paths |

Canonical URLs are the clean forms (`/inkbounce/worlds`), which GitHub Pages serves for every
`.html` file. Internal links use the `.html` names so the site also works from a local server.

## Local preview

From the repo root:

```bash
python3 -m http.server 8010
```

Then open <http://localhost:8010/inkbounce/>.

**After changing any CSS or JS, bump `?v=` on its links in every page** (one find-and-replace).

## The design

The site was redesigned with the taste skill (direction "One motif", seed 823048799, notes in
`.taste-skill/direction.json`) and checked with its inspector at 1440, 768 and 390 pixels.

- **The motif is the ink stroke.** The pink line (`--pink: #ff149e`, the colour of the default ink in
  the trailer and the store art) runs under pictures (`.inked`), is the bullet of every list
  (`.ink-list`), the underline of the current page, and the shape of every button (round caps).
- **The worlds lend their colours.** `--w1` to `--w5` are the accent colours from each
  `world.json`, `--w1-dark` to `--w5-dark` their dark tones. The hero folders, the gear bands, the
  boss hit row and the footer letters all use them.
- **Type:** Bebas Neue for display, Rajdhani 500/600/700 for text, self-hosted in `assets/fonts/`.
- **Rules kept:** no gradients, no resting shadows, no eyebrow labels, headlines of two lines at most.

### The live things

- **The toy** (`assets/js/toy.js`): a small level on a canvas. Draw under the orb and it bounces off
  your line into the portal. It uses the game's gravity (2.4 times Earth), its cost of 1.5 ink per
  unit of line, and its 4-second line life. The three levels and their "Draw one for me" lines were
  solved in a simulation of the same physics; if you change the physics or a level, re-check that
  the helper line still reaches the portal. Without JavaScript the still `screenshot-1.jpg` shows.
- **The gear switches** on the home page, and **the skin picker** on Gear (`assets/js/skins.js`,
  all 54 skins with their core and glow colours and how to get each one).

### Copy

Write for a player deciding whether to install: what a world, a mode or a piece of gear does for
them, in a sentence or two. Leave out the game's internals (multipliers, timings, percentages, coin
prices, odds, level numbers) and full lists. The site was trimmed once for exactly this; the
numbers below are the ones it still states.

## Numbers on the page come from the game

The store listing has drifted (old world names, 42 skins), so every figure here was read from the
Unity project. Re-check them after a content update.

| Claim | Source |
|---|---|
| 100 levels, 5 worlds of 20, 300 stars, a boss at the end of each world, hunt levels | `Resources/Campaign/Worlds/World<N>/world.json`, `Levels/` |
| The Wall is Ice Valley's boss; bosses take more hits in later worlds | the level files, `BossController2D.cs` |
| Stars for reaching the portal, saving ink and speed | `SessionRuntimeCoordinator.cs` |
| Five gear pieces and what each does | `Progression/GearType.cs`, `GearCatalog.cs` |
| Four boosts | `PowerupCatalog.cs` |
| 54 skins, their colours and how to get them | `Resources/Skins/BallTrailSkinCatalog.asset`, `Skins/BallTrailSkinService.cs` |
| 104 badges (53 campaign, 25 endless, 26 mastery) | `Progression/AchievementService.cs` |
| 4 leaderboards, Game Center and Google Play Games | platform setup, `PlatformGameIds.cs` |

## Art

| Folder | What | Source |
|---|---|---|
| `assets/images/worlds-lg/` | The five worlds, 1200 px | `Assets/_Game/UI/Resources/CampaignWorlds/World_0N_*.jpg` |
| `assets/images/worlds/` | The same at 800 px, used as touch thumbnails on the Worlds index | as above |
| `assets/images/boss/` | The boss at its three damage stages, transparent PNG | `Assets/_Game/Sprites/Boss/BossStage1-3.png` |
| `assets/images/badges/` | 18 badge icons | `Docs/AchievementIcons/*.png`. Two file names differ from the badge names: "Half Kilometer" is *Half-Kilometer Headspace*, "Long Haul" is *Long Hall* |
| `assets/images/beats/` | Wide stills cropped above the caption band | the store screenshots and the trailer, cut with `tools/crop.swift` |
| `assets/video/loop-*.mp4` | Five silent 2–3 s square loops with a poster each | cut from `trailer.mp4` below the HUD and above the captions |
| `assets/video/trailer.mp4` | The 29 s trailer, opened in a dialog, `preload="none"` | the trailer master |

To cut a loop again (ffmpeg is installed with Homebrew):

```bash
ffmpeg -ss 2.0 -t 3.0 -i trailer.mp4 -an -vf "crop=500:500:390:56,scale=600:600,fps=30" \
  -c:v libx264 -crf 27 -preset slow -pix_fmt yuv420p -movflags +faststart loop-draw.mp4
```

The trailer has a caption band burned into its lower third, so every crop stays above it.

## Before you launch

- [ ] `privacy.html` lists Google AdMob, Firebase Analytics, Firebase Crashlytics and the store
      billing. The game source shows AdMob, Firebase Analytics, Unity IAP and Play Games / Game
      Center; confirm Crashlytics ships, or remove it.
- [ ] The App Store and Google Play descriptions still use the pre-rename world names and say 42
      skins. The site is right; the listings need updating.
- [ ] The game's "Third Socket" badge asks for 30 gear ranks while the third slot opens at 10.
