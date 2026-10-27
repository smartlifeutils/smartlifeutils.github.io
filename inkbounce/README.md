# Ink Bounce: website

The marketing and support site for **Ink Bounce**, a one-thumb arcade game for iOS and Android.
Plain static HTML, CSS and JS: no build step, no dependencies. Hosted on GitHub Pages inside the
`smartlifeutils.github.io` repo, next to `../waverider` and `../budgetbuddy`.

It is built from the game's own material: the world art, the boss sprites, the badge icons, loops
cut from the trailer, and numbers read out of the Unity project.

## Pages

| File | URL | Purpose |
|---|---|---|
| `index.html` | `/inkbounce/` | Home: the name and the trailer, the three modes, how to play, the five worlds, the numbers, download |
| `worlds.html` | `/inkbounce/worlds` | Every world: art, what it adds and its boss; then the boss fight and how stars are won |
| `endless.html` | `/inkbounce/endless` | Endless: what changes the further you go, Fever, challenges and leaderboards |
| `gear.html` | `/inkbounce/gear` | The five gear pieces, the four boosts, orb skins, badges |
| `support.html` | `/inkbounce/support` | **Store-required support URL**: contact, questions, bug reports |
| `privacy.html` | `/inkbounce/privacy` | **Store-required privacy policy** |
| `terms.html` | `/inkbounce/terms` | Terms of service |
| `press.html` | `/inkbounce/press` | Press kit: fact sheet, short and long descriptions to copy, key features, the trailer, gameplay stills, world art, key art and icon with links to the full files, press contact. Linked from every footer |
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

The site was first built with the taste skill (direction "One motif", seed 823048799), then
calmed down after review. It is checked with the taste inspector at 1440, 768 and 390 pixels.

- **The game is the picture.** The home page opens on the trailer; the modes, worlds, gear and
  support pages carry the world art, the boss sprites, badge icons and short silent loops cut
  from the trailer. There are no interactive try-outs.
- **One accent motif.** The pink ink stroke (`--pink: #ff149e`, the colour of the default ink in
  the trailer and the store art) runs under pictures (`.inked`), marks list items (`.ink-list`),
  underlines the current page, and gives buttons their round caps. Actions are green.
- **No decorative colour blocks.** The world colours (`--w1` to `--w5`) tint each world's own
  section on the Worlds page and its heading, nothing else.
- **Type:** Bebas Neue for display, Rajdhani 500/600/700 for text, self-hosted in `assets/fonts/`.
- **Rules kept:** no gradients, no resting shadows, no eyebrow labels, headlines of two lines at most.

### Copy

Write for a player deciding whether to install: what a world, a mode or a piece of gear does for
them, in a sentence or two. Leave out the game's internals (multipliers, timings, percentages, coin
prices, odds, level numbers) and full lists. The numbers below are the ones the site still states.

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
| iOS 15 or later, Android 7.1 or later, iPhone and iPad, landscape only | `ProjectSettings.asset`: `iOSTargetOSVersionString`, `AndroidMinSdkVersion: 25`, `targetDevice: 2`, autorotate flags |
| Free with ads; Remove Ads (non-consumable) turns off banners and interstitials, rewarded ads stay; coin and gem packs are consumables | `Resources/Monetization/monetization_settings.json`, `Monetization/AdPlacementService.cs`, `Progression/UnityIapStoreController.cs`, `CoinPackCatalog.cs`, `GemPackCatalog.cs` |
| Restore Purchases in Settings (and the coin store) brings back Remove Ads only | `UI/Scripts/SettingsScreen.cs`, `CoinStoreScreen.cs`, `UnityIapStoreController.RestorePurchases` |
| Progress is saved on the device only, no cloud save | `CampaignProgressService.cs` (PlayerPrefs), the in-game privacy text in `Resources/Legal/legal_content.json` |
| English only | `Scripts/Localization/` and `Resources/Localization/` are empty |
| Released on the App Store 24 August 2026, rated 4+ | the App Store listing (id 6792821983) |

## Search

- Every page except `play.html` carries `<meta name="apple-itunes-app" content="app-id=6792821983">`, so
  Safari on iPhone shows the App Store banner. `play.html` skips it because it redirects phones anyway.
- Every indexable page has its own title, description (155 characters at most), canonical, Open Graph
  tags with `og:image:alt`, and JSON-LD:
  - `index.html`: the game (`VideoGame` + `MobileApplication`: both stores as `installUrl` and `sameAs`,
    the six store screenshots, `datePublished`, free), the trailer (`VideoObject`: its `duration` and
    `uploadDate` must follow `trailer.mp4`), the `WebSite` (`/inkbounce/#website`), the home `WebPage`
    and the publisher (`https://smartlifeutils.github.io/#org`, with logo and both developer pages as `sameAs`).
  - every other indexable page: a `WebPage` (`isPartOf` the website, `about` the game `#game`) and a
    two-step `BreadcrumbList`.
  - `support.html`: the page is a `FAQPage`. **Its questions and answers must match the visible FAQ word
    for word**; change both together.
- `play.html` and `404.html` are `noindex`. Every other page goes in the repo-root `sitemap.xml`.
- Check JSON-LD at <https://search.google.com/test/rich-results> after editing it.

## Art

| Folder | What | Source |
|---|---|---|
| `assets/images/worlds-lg/` | The five worlds, 1200 px | `Assets/_Game/UI/Resources/CampaignWorlds/World_0N_*.jpg` |
| `assets/images/worlds/` | The same at 800 px, used as touch thumbnails on the Worlds index | as above |
| `assets/images/boss/` | The boss at its three damage stages, transparent PNG | `Assets/_Game/Sprites/Boss/BossStage1-3.png` |
| `assets/images/badges/` | 18 badge icons | `Docs/AchievementIcons/*.png`. Two file names differ from the badge names: "Half Kilometer" is *Half-Kilometer Headspace*, "Long Haul" is *Long Hall* |
| `assets/images/beats/` | Wide stills cropped above the caption band | the store screenshots and the trailer, cut with `tools/crop.swift` |
| `assets/video/loop-*.mp4` | Five silent 2–3 s square loops with a poster each | cut from `trailer.mp4` below the HUD and above the captions |
| `assets/images/icon-512.png` | The app icon at 512 px, offered on the press kit | `Docs/Branding/Assets/app-icon-512.png` (the Google Play icon master) |
| `assets/images/screenshot-1..6.jpg` | The six store screenshots, 1440 × 810, caption bands included. Only linked from the press kit and listed in the home JSON-LD; never shown on a page | the store listing |
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
