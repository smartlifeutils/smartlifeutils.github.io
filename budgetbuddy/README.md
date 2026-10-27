# Budget Buddy — Website

The marketing and support site for **Budget Buddy**, the expense tracker and budget planner for
iPhone and Android (`com.smartlife.budgetbuddy`). Plain static HTML, CSS and JS, no build step at
runtime, hosted on GitHub Pages inside the `smartlifeutils.github.io` repo next to `../waverider`
and `../inkbounce`.

The page does not describe the app so much as run small, working pieces of it. Every number on the
site comes from the app's own demo account (`assets/BudgetBuddy_demo_en.json` in the Flutter
project), the same data shown in the store screenshots.

## Pages

| File | URL | Purpose |
|---|---|---|
| `index.html` | `/budgetbuddy/` | Home: the September 2025 overview built in HTML (balance, donuts, insight chips, the month's top categories), the app's screens in a carousel, one coffee in four steps, the ten-month spending chart, links to every topic page, questions, and a download band |
| `tracking.html` | `/budgetbuddy/tracking.html` | Logging: the keypad, scanning bills, receipts and warranties, repeating payments and reminders, categories and search, accounts and import |
| `budgets.html` | `/budgetbuddy/budgets.html` | Budgets: a working "when will it run out" calculator (the circle fills as you spend), how a budget is set up, the track record, savings goals |
| `insights.html` | `/budgetbuddy/insights.html` | The month on one screen, spending charts, net flow, the day that costs most, Plan Ahead in a sentence, smart insights, the monthly recap |
| `data.html` | `/budgetbuddy/data.html` | Your data: on-device storage, no account, the store privacy labels, PIN and biometric lock, weekly backups, export and delete, what uses the network, policy links |
| `premium.html` | `/budgetbuddy/premium.html` | Free against Premium, from the limits the app enforces in code, and what the subscription costs |
| `support.html` | `/budgetbuddy/support.html` | Contact, FAQ, bug reports, policies |
| `press.html` | `/budgetbuddy/press.html` | Press kit: fact sheet, key features, screenshots linked to their full files, about SmartLifeUtils. Linked from every footer |
| `download.html` | `/budgetbuddy/download` | **The link to share**: a phone goes straight to its store; desktops see a download card. `?platform=ios\|android\|none` forces a branch for testing |
| `play.html` | `/budgetbuddy/play` | The old share link, kept so links already out keep working. It forwards to `download`, query string included |
| `404.html` | direct hits only | GitHub Pages serves the repo-root 404 for unknown paths |

`app-ads.txt` here is the AdMob publisher file; leave it alone. The privacy policy and terms are
hosted on flycricket and linked from the footer, `data.html` and `support.html`.

## Where the numbers come from

| Claim | Source |
|---|---|
| September 2025: −3000.42, +3982.73, balance +982.31, top spend Rent 28%, top 3 61% | demo JSON, September expenses and incomes |
| 36,712 spent, 354 purchases, monthly bars March–December, median 64.18 | demo JSON, all expenses |
| Net flow per month, weekday totals | demo JSON |
| Pace, forecast, “Safe this month”, near limit at 85% | `Budgets/Screens/BudgetOverviewScreen.dart` (`_projectionForBudget`), `Budgets/Widgets/CategoryBudgetsListWidget.dart` |
| Free limits (1 account, under 10 categories per type, 5 favourites, 3 budgets, QR, recurring, insight chips, ads) | `lib/subscription_manager.dart` and its call sites |
| 11 starter categories, 180 icons, 121 currencies, 5 number formats | onboarding pages, `assets/icons/`, currency_picker, settings |
| Premium 9.99 $ (App Store) and 10.99 $ (Google Play) | the US store listings, October 2026 |
| “Data Not Collected” / “No data collected or shared” | the App Store privacy label and Google Play data safety section |
| iOS 13 or later, Android 7.0 or later | `ios/Podfile` and the Xcode deployment target; Android `minSdk = flutter.minSdkVersion`, which is 24 in the installed Flutter |
| First released 17 February 2026, Finance, rated 4+ | the App Store listing (lookup API), October 2026 |
| No network use besides ads and store purchases | no HTTP calls in `lib/`; `google_mobile_ads` and `in_app_purchase` only |

Receipts, warranties, saved searches and CSV import are in the Android build (2.4.2) before the App
Store (2.4.1); the Tracking page and the Support answer on importing say so in one line each. Remove
those lines once iOS catches up.

## Copy

Write for the person deciding whether to install: what a feature does for them, in a sentence or
two. Leave out how the app works inside (formats a parser reads, file names, thresholds, settings
names) and lists of everything it supports. The site was trimmed once for exactly this.

Sample content, not from the demo data: the Dining budget of 200.00 in the four steps, the
Groceries budget in the calculator, the headphones with a warranty, and the Summer trip goal.

## Assets

- `assets/img/shots/` — raw app captures from `images/play store/phone/2026 ios/screenshot*.{jpeg,PNG}`
  and `2026/new_screenshot{4,6,7}.png`, status bar cropped, 720 px wide JPEG. No device frames.
- `assets/img/icons/` — 41 of the app's 180 category icons, copied from `assets/icons/`.
- `assets/img/brand/` — the logo (`images/logo.png`, `logo_foreground_layer.png`), store badges,
  and `og-image.jpg` from `images/play store/featured_graphic/google featured 2026.png`.
- `assets/fonts/inter-latin.woff2` — Inter, variable 400–800, latin subset (SIL OFL). The app itself
  uses Helvetica Neue, which cannot be served on the web; Inter is the closest open face.

To refresh a screenshot after a new build, take the raw capture, then:

```bash
ffmpeg -i screenshot5.PNG -vf "crop=iw:ih-150:0:150,scale=720:-2" -q:v 3 assets/img/shots/budget.jpg
```

## Local preview

```bash
python3 -m http.server 8000
```

Run it from the repo root and open <http://localhost:8000/budgetbuddy/>.

**After changing any CSS or JS, bump `?v=` on its links in every page** (one find-and-replace), as on
the Wave Rider site.

## Search

- Each indexable page has its own title (60 characters or fewer), meta description (155 or fewer),
  canonical URL, Open Graph tags (`og:site_name`, `og:image:alt`) and `twitter:card`. Keep `og:title`,
  `og:description` and the JSON-LD `WebPage` name and description equal to the title and description.
- Every page but `play.html` has `<meta name="apple-itunes-app" content="app-id=6758464704" />`, the
  Safari smart app banner.
- JSON-LD on every indexable page: `Organization` (`@id` `https://smartlifeutils.github.io/#org`,
  country SI, `sameAs` both store developer pages), `MobileApplication` (`FinanceApplication`,
  `datePublished` 2026-02-17, free `Offer`, `featureList` of shipped features, both store links),
  `WebPage` and `WebSite`. Subpages add a `BreadcrumbList` (Budget Buddy → the page). No
  `softwareVersion`, so nothing goes stale with each release.
- `FAQPage` on the home and support pages is the visible questions and answers word for word (link
  text left out). Change a question on the page and change the markup with it. The two pages ask
  different questions, so no question is marked up twice.
- The first big picture on each page has `fetchpriority="high"` and is never lazy; everything below
  the fold, including the store badges in the closing band, is `loading="lazy"`.
- `download.html`, `play.html` and `404.html` are `noindex`. Add every new page to the repo-root
  `sitemap.xml`.
