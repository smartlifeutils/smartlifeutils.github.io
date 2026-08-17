# Wave Rider — Website

The marketing + support website for **Wave Rider**, a 2D physics arcade game —
Hill Climb Racing on water. Plain static HTML/CSS/JS — no build step, no dependencies.
Designed to be hosted on **GitHub Pages** and to satisfy the App Store / Google Play
support & privacy URL requirements.

Sibling site to `../inkbounce`, same publisher, same structure and component language.
Different palette (deep-ocean navy / turquoise / gold instead of near-black / green)
and two extra content sections: **the fleet** and **the garage**.

## Pages

| File | URL | Purpose |
|---|---|---|
| `index.html` | `/waverider/` | Landing page — hero, features, fleet, upgrades, waters, screenshots, download |
| `support.html` | `/waverider/support` | **Store-required support URL** — contact, FAQ, bug reports |
| `privacy.html` | `/waverider/privacy` | **Store-required privacy policy** |
| `terms.html` | `/waverider/terms` | Terms of service |
| `404.html` | (direct hits only) | Themed not-found page |

> GitHub Pages serves the **repo-root** `404.html` for unknown paths, so this one is only
> seen if someone opens `/waverider/404.html` directly. It exists for parity and uses
> relative asset paths so it renders correctly from the subfolder.

## Local preview

From this folder:

```bash
python3 -m http.server 8000
```

Then open <http://localhost:8000>. (Any static server works — e.g. `npx serve`.)

## Deploying to GitHub Pages

This folder lives inside the `smartlifeutils.github.io` user-page repo, so it is published
at `https://smartlifeutils.github.io/waverider/` automatically when pushed. `.nojekyll`
tells Pages to skip Jekyll processing. GitHub Pages serves `support.html` at both
`/waverider/support.html` **and** `/waverider/support`, so the clean store URLs work.

All in-page asset paths are relative, so the site also works unchanged from a different
subfolder or a custom domain. The only absolute URLs are the `canonical` / `og:url` /
`og:image` tags in each `<head>` — update those if the site moves.

### Store submission URLs

- **Marketing:** `https://smartlifeutils.github.io/waverider/`
- **Support:** `https://smartlifeutils.github.io/waverider/support`
- **Privacy:** `https://smartlifeutils.github.io/waverider/privacy`

These match the URLs already planned in the game repo's `Docs/Release/01_IDENTITY.md`.
`app-ads.txt` lives at the **repo root**, not here — it is shared across all the
publisher's apps and already carries the correct AdMob publisher ID.

## ✅ Before you launch

- [x] Publisher name — **SmartLifeUtils**. In footers + both legal pages.
- [x] Support email — **smartlife.utilities@gmail.com** (all pages + mailto links).
- [x] Domain — **https://smartlifeutils.github.io/waverider/** (`canonical` / `og:url` / `og:image`).
- [x] "Last updated" date — **August 17, 2026** (privacy + terms).
- [x] Governing law — **Slovenia** (terms).
- [x] **Third-party services** in `privacy.html` — matched against what the build actually
      ships: Google AdMob, Google UMP consent, Firebase Analytics, Firebase Crashlytics,
      Unity IAP (App Store / Play Billing), Google Play Games Services, Apple Game Center,
      and local notifications. Re-check if any of those compile defines are dropped.
- [ ] **Real screenshots** — replace `assets/images/screenshot-*.svg` with captures from
      `Tools ▸ Wave Rider ▸ Store ▸ Capture Screenshots` in the Unity project (see below).
- [ ] **Real app icon** — replace `icon.svg` and the PNGs it generates once the game has a
      final icon.
- [ ] **Store badges** — point the App Store / Google Play `href`s at the live listings
      once published, and drop the "coming soon" copy in the hero and download sections.
- [ ] **The name.** `Docs/Design/00_OVERVIEW.md` flags that "Wave Rider" is already used by
      a Steam game and a Play Store app (`com.affinity.waverider`), and recommends a
      distinctive variant before store release. Renaming is a find/replace across the five
      HTML files plus the `<title>`/`og:` tags.

## Art (in `assets/images/`)

**Everything except the two store badges is placeholder art.** It is hand-drawn SVG built
from the game's real world palettes (`Docs/Design` world definitions) and UI palette
(`Scripts/UI/UiKit.cs`), so it reads as stylized promo art in the right colours — but it is
not the game.

| File | What it is |
|---|---|
| `screenshot-1..6.svg` | 1440×810 (16:9, matching `.phone-frame`) — riding a face, launching off a crest, a mid-air flip, a perfect landing, the garage, the water select |
| `icon.svg` | App mark, rounded. Used as the SVG favicon |
| `favicon-32.png`, `icon-64.png`, `icon-180.png` | Rasterized from a **square** build of the mark — iOS composites the touch icon behind its own mask, and transparent corners can show through as black |
| `og-image.svg` / `og-image.png` | 1200×630 social card. `og:image` must be raster; scrapers do not accept SVG |
| `badge-appstore.png`, `badge-googleplay.png` | The real official Apple / Google badges, copied from the Ink Bounce site. Both are full-bleed at ~3.37:1 so they line up at a shared CSS height. The Apple badge has an opaque white background, so `.store-badges img` clips it with a `border-radius` — keep that if you re-export them |

### Regenerating the placeholders

`tools/gen-placeholder-art.py` draws every SVG above. Edit the palettes or scene functions
in it and re-run:

```bash
python3 tools/gen-placeholder-art.py
```

It writes to `tools/out/`; copy the SVGs into `assets/images/`. The PNGs are rasterized
separately — macOS has no bundled SVG rasterizer that preserves aspect ratio (`qlmanage`
letterboxes into a square and crops), so use headless Chrome:

```bash
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless --disable-gpu \
  --hide-scrollbars --force-device-scale-factor=1 --window-size=1200,630 \
  --screenshot=og-image.png "http://localhost:8000/assets/images/og-image.svg"
```

### Swapping in real screenshots

Capture from the Unity project with `Tools ▸ Wave Rider ▸ Store ▸ Capture Screenshots`
(Google phone preset, 1920×1080 landscape), then downscale to the 16:9 frame size:

```sh
cd /path/to/WaveRider/build/screenshots/google/phone
for i in 1 2 3 4 5 6; do
  sips -Z 1440 -s format jpeg -s formatOptions 72 "${i}_1920x1080.png" \
    --out "/path/to/waverider/assets/images/screenshot-$i.jpg"
done
```

Then update the six `<img src>` values and their `alt` text in `index.html` — the alt text
doubles as the lightbox caption, so keep it descriptive.

> Tip: for a gameplay clip, add an autoplaying muted looping `<video>` (or a GIF) into the
> hero's `.phone-frame` in `index.html`.

## Structure

```
waverider/
├── index.html · support.html · privacy.html · terms.html · 404.html
├── .nojekyll                 # tells GitHub Pages to skip Jekyll processing
├── README.md
├── tools/
│   └── gen-placeholder-art.py
└── assets/
    ├── css/style.css         # design tokens + all components
    ├── js/main.js            # nav toggle, footer year, scroll reveal, shots rail, lightbox
    ├── fonts/                # self-hosted woff2 (latin) + fonts.css
    └── images/               # placeholder SVG art + rasterized icons + store badges
```

## Design

Brand values are pulled from the game's own UI palette (`Scripts/UI/UiKit.cs`) and the
Pacific world definition: deep-ocean navy panels, a single turquoise action accent, gold
for coins and rewards. **Pure white is reserved for foam and spray** — that is the game's
own art rule, so don't reach for `#fff` on UI chrome. Dark theme only. See
`assets/css/style.css` `:root` for the full token set.

**Bebas Neue** (display) + **Rajdhani** (body), same pair as the Ink Bounce site so the two
read as one publisher. **Fonts are self-hosted** (`assets/fonts/`, latin subset woff2,
~44 KB total) rather than loaded from Google Fonts. This keeps them same-origin and cached,
so navigating between pages doesn't flash/reflow, and it's better for privacy/GDPR. The two
most-used weights are `<link rel="preload">`ed in each page's `<head>`. To add another
weight, drop the woff2 in `assets/fonts/`, add an `@font-face` to `fonts.css`, and
(optionally) preload it.

`assets/js/main.js` is shared verbatim with the Ink Bounce site — if you fix something in
one, port it to the other.
