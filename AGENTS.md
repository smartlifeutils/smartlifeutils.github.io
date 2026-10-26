# SmartLifeUtils websites

This repo is **smartlifeutils.github.io**, a GitHub Pages user site. `main` is the live site:
a push goes live in a minute or two, with no build step and no review. Treat every push as a
release.

Everything is plain static HTML, CSS and JS. Nothing is compiled, bundled or installed.

| Path | URL | What it is |
|---|---|---|
| `index.html` | `/` | The SmartLifeUtils homepage: one entry per app, with its art, pitch and store links |
| `waverider/` | `/waverider/` | Wave Rider: Boat Stunt Racing (game) |
| `inkbounce/` | `/inkbounce/` | Ink Bounce (game) |
| `budgetbuddy/` | `/budgetbuddy/` | Budget Buddy (expense tracker) |
| `sitemap.xml` | `/sitemap.xml` | Sitemap for the homepage, Ink Bounce and Budget Buddy |
| `waverider/sitemap.xml` | `/waverider/sitemap.xml` | Wave Rider's own sitemap, with image and video entries |
| `robots.txt` | `/robots.txt` | Points crawlers at both sitemaps. Crawlers only read it at the root |
| `app-ads.txt`, `*/app-ads.txt` | | AdMob publisher files. **Never edit or move them** |
| `tools/check-site.py` | | The pre-push check (see below) |

**Each site has a `README.md`. Read it before you touch that site.** It lists the pages, where
every number on them comes from, how the art was exported, and the site's own rules. When you
change a site, keep its README true.

## The checklist after any change

Do every step that applies before you commit.

1. **Bump the asset version.** CSS and JS are linked as `style.css?v=YYYYMMDD-n` (today's date,
   `n` counting up within the day). After changing any CSS or JS, bump the stamp on **every page of
   that site** in one find-and-replace, so a visitor never gets a new page with an old stylesheet.
   GitHub Pages lets browsers cache assets for 10 minutes.
2. **Update the sitemap.**
   - Homepage, `inkbounce/` and `budgetbuddy/` pages go in the root `sitemap.xml`. Wave Rider
     pages go in `waverider/sitemap.xml`.
   - Changed a page's content? Set its `<lastmod>` to today.
   - Added a page? Add a `<url>`. Removed one? Remove it.
   - Never list `play.html` or `404.html`: they are `noindex`.
   - If a site gets its own sitemap, add a `Sitemap:` line for it to `robots.txt`.
3. **Keep each page's head complete.** Every indexable page needs `<title>`, a meta description,
   a canonical URL, `og:title`, `og:description`, `og:url` and `og:image`. Use each site's canonical
   style:
   - Wave Rider and Budget Buddy: `.../waverider/boats.html`.
   - Ink Bounce: clean, `.../inkbounce/worlds`.
   - Home pages always end in `/`, never `index.html`. Internal links to a home page use `./`.
4. **Update the shared parts everywhere.** Nav, footer and head are copied into every page of a
   site (there is no template engine). Changing the nav means changing every page of that site.
5. **Update structured data** when facts change: the JSON-LD in each site's home page (price,
   platforms, store links, trailer `uploadDate` and `duration`) and the `ItemList` in the root
   `index.html`.
6. **Update the root homepage** when an app's pitch changes, a new app ships, or an app gets a new
   og image. Each entry links to the site and both stores.
7. **Run the checks** (next section) and fix what they report.
8. **Commit one site per commit**, and push only when asked.

## Checks

From the repo root:

```bash
python3 tools/check-site.py
```

It fails on:
- missing link targets, images, posters and scripts;
- a page without a title, description or canonical;
- sitemap entries with no file, and indexable pages no sitemap lists;
- mixed `?v=` stamps within a site.

To preview locally:

```bash
python3 -m http.server 8010
```

Then open <http://localhost:8010/waverider/> (or `/inkbounce/`, `/budgetbuddy/`). Each site
handles its own 404, but only for direct hits on `/<site>/404.html`; there is no root 404 page.

For design work, the sites were built and checked with the taste skill's inspector, which
screenshots a page at 1440, 768 and 390 px and measures it. Run it from the site folder so its
working files land in that site's `.taste-skill/` (git ignores it):

```bash
node ~/.claude/plugins/cache/taste-skill/taste-skill/2.1.5/skills/taste-skill/scripts/inspect.mjs index.html
node ~/.claude/plugins/cache/taste-skill/taste-skill/2.1.5/skills/taste-skill/scripts/lint.mjs .
```

Every marketing page was at 0 FAIL when last shipped; keep it there. Legal pages, `play.html` and
`404.html` may fail the picture and motion rules (pass
`--allow few-pictures,still-page,no-footage`), because they are documents and redirects.

## Content rules

- **Facts come from the app, not the store listing.** The listings lag behind; the sites were
  checked against the source projects. Re-check a number there before changing it:

  | App | Source project | Look in |
  |---|---|---|
  | Wave Rider | `~/Projects/UnityProjects/WaveRider` | `Docs/` design docs; art via `waverider/tools/build-assets.py` |
  | Ink Bounce | `~/Projects/UnityProjects/InkBounce` | `Assets/_Game/Resources/Campaign/Worlds/*/world.json`, `Assets/_Game/Scripts/` (Scoring, Progression, Skins), `Docs/` |
  | Budget Buddy | `~/Projects/Flutter projects/monefy_v3` (the Dart package is still called monefy_v3) | `lib/`, `lib/subscription_manager.dart` for what Premium locks, `assets/BudgetBuddy_demo_en.json` for every figure the site shows |

- **Never invent proof**: no testimonials, ratings, download counts, press quotes or user numbers.
  Neither store shows ratings yet.
- **Use only shipped features.** An idea in a design doc or an `Ideas.md` is not a feature.
  Budget Buddy: no encryption, cloud sync, bank linking, widgets, currency conversion or languages
  other than English. Its Premium page lists only what the code locks.
- **Mark sample content** in the site's README when a page shows example data the app does not
  contain.
- **Pictures** are the app's own: art exported from the project, screenshots, trailer loops. Crop
  store screenshots above their caption bands.
- English, sentence case, plain words. One or two em dashes per page at most.

## Design rules

Each site keeps its own look: Wave Rider is a loud flat poster, Ink Bounce a dark game site built
on its pink ink stroke and world colours, Budget Buddy a light product site whose pictures are
working pieces of the app. Extend the look a site already has; don't restyle it toward the others.

House rules, which the inspector measures:
- headlines of two lines or fewer at every width;
- one `h1` per page that says what it is, and a heading on every section;
- no eyebrow labels above headings, no tiny letter-spaced capitals;
- no gradients, no shadows on resting elements, no glass;
- no rows of identical icon cards, no monospace outside code;
- equal side margins, and no section with half the width empty;
- body text 16px or larger, in the full ink colour;
- every control keyboard-usable with a visible focus;
- every animation has a `prefers-reduced-motion` fallback.

## Store-required URLs

App Store Connect and Google Play point at these, so they must keep working at the same address:

| App | Privacy | Terms | Support |
|---|---|---|---|
| Wave Rider | `/waverider/privacy.html` | `/waverider/terms.html` | `/waverider/support.html` |
| Ink Bounce | `/inkbounce/privacy` | `/inkbounce/terms` | `/inkbounce/support` |
| Budget Buddy | flycricket (linked from the site) | flycricket | `/budgetbuddy/` and `/budgetbuddy/support.html` |

Each app's `play.html` is the share link: a phone goes straight to its own store. Don't rename it.

## Commits

Message style: `<Site> site: <what changed, in plain words>`. Examples:
- `Wave Rider site: a Seas page, and boat fits that match the game`
- `Ink Bounce site: a home page and Worlds, Endless and Gear pages`

Use `SmartLifeUtils homepage: …` for the root page. Don't commit `.taste-skill/` (ignored) or
`.DS_Store`. The root `.claude/launch.json` (the local preview server) is shared and belongs in git.

## Contact and names

- Publisher on the sites: **SmartLifeUtils**, a one-person studio in Slovenia.
- Support email everywhere: **smartlife.utilities@gmail.com**.
- The App Store lists the seller as Domen Dolanc. Keep that out of page copy unless asked.
