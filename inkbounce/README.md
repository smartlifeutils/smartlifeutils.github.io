# Ink Bounce — Website

The marketing + support website for **Ink Bounce**, a 2D hyper-casual mobile game.
Plain static HTML/CSS/JS — no build step, no dependencies. Designed to be hosted on
**GitHub Pages** and to satisfy the App Store / Google Play support & privacy URL
requirements.

## Pages

| File | URL | Purpose |
|---|---|---|
| `index.html` | `/` | Landing page — hero, features, worlds, screenshots, download |
| `support.html` | `/support` | **Store-required support URL** — contact, FAQ, bug reports |
| `privacy.html` | `/privacy` | **Store-required privacy policy** |
| `terms.html` | `/terms` | Terms of service |
| `404.html` | (fallback) | Themed not-found page |

## Local preview

From this folder:

```bash
python3 -m http.server 8000
# then open http://localhost:8000
```

(Any static server works — e.g. `npx serve`.)

## Deploying to GitHub Pages

1. Push this folder to a GitHub repository.
2. In the repo: **Settings → Pages** → set **Source** to *Deploy from a branch*,
   pick your branch and the folder that contains these files.
3. Your site will be at `https://<username>.github.io/<repo>/`.
4. GitHub Pages serves `support.html` at both `/support.html` **and** `/support`, so
   the clean store URLs work automatically. All asset paths are relative, so the site
   works on a project page, a user page, or a custom domain without edits.

### Store submission URLs

- **Marketing:** `https://smartlifeutils.github.io/`
- **Support:** `https://smartlifeutils.github.io/support`
- **Privacy:** `https://smartlifeutils.github.io/privacy`

> These clean URLs require the site to be served at the **root** of a repo named
> `smartlifeutils.github.io` (a GitHub user page). If you instead put it in a project
> repo, the site lives at `/<repo>/` and the 404 page's absolute `/assets/...` paths
> would need to be made relative.

### Custom domain (optional)

Add a file named `CNAME` containing just your domain (e.g. `inkbounce.com`), then
configure the domain's DNS as described in GitHub's docs.

## ✅ Before you launch — replace these placeholders

Search the project for each token and swap in the real value:

- [x] Publisher name — **SmartLifeUtils** (indie dev). In footers + both legal pages.
- [x] Support email — **smartlife.utilities@gmail.com** (all pages + mailto links).
- [x] Domain — **https://smartlifeutils.github.io/** (`canonical` / `og:url` / `og:image`).
- [x] "Last updated" date — **July 1, 2026** (privacy + terms).
- [x] Governing law — **Slovenia** (terms).
- [ ] **Third-party services** in `privacy.html` — confirm they match what the build
      actually ships (currently: Google AdMob, Firebase Analytics, Firebase Crashlytics,
      store billing). Remove/add as needed.
- [ ] **Store badges** — point the App Store / Google Play links (`href`) to the live
      listings once published, and swap in official store badge images if desired.

### Replace the placeholder art (in `assets/images/`)

All images are placeholder SVGs. Swap in real assets, keeping the same filenames (or
update the references):

- [ ] `logo.svg` — game wordmark
- [ ] `icon.svg` — app icon
- [ ] `favicon.svg` — browser/tab icon
- [ ] `og-image.svg` → replace with a **1200×630 PNG/JPG** for reliable social sharing
      (many platforms don't render SVG OG images). Update the `og:image` paths if you
      change the extension.
- [ ] `screenshot-1.svg` … `screenshot-5.svg` — real gameplay screenshots (landscape)
- [ ] `badge-appstore.svg`, `badge-googleplay.svg` — official store badges (optional)

> Tip: for a gameplay clip, add an autoplaying muted looping `<video>` (or a GIF) into
> the hero's `.phone-frame` in `index.html`.

## Structure

```
inkbounce/
├── index.html · support.html · privacy.html · terms.html · 404.html
├── .nojekyll                 # tells GitHub Pages to skip Jekyll processing
├── README.md
└── assets/
    ├── css/style.css         # design tokens + all components
    ├── js/main.js            # nav toggle, FAQ, footer year, scroll reveal
    ├── fonts/                # self-hosted woff2 (latin) + fonts.css
    └── images/               # placeholder SVG art
```

## Design

Brand values (colors, fonts, component language) are pulled from the game's own UI —
dark, neon-ink, cinematic. **Bebas Neue** (display) + **Rajdhani** (body). Dark theme
only. See `assets/css/style.css` `:root` for the full token set.

**Fonts are self-hosted** (`assets/fonts/`, latin subset woff2, ~44 KB total) rather
than loaded from Google Fonts. This keeps them same-origin and cached, so navigating
between pages doesn't flash/reflow (no external round-trip), and it's better for
privacy/GDPR. The two most-used weights are `<link rel="preload">`ed in each page's
`<head>`. To add another weight, drop the woff2 in `assets/fonts/`, add an
`@font-face` to `fonts.css`, and (optionally) preload it.
