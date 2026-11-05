# Budget Buddy — Website

The marketing and support site for **Budget Buddy**, the expense tracker and budget planner for
iPhone and Android (`com.smartlife.budgetbuddy`). Plain static HTML, CSS and JS, no build step at
runtime, hosted on GitHub Pages inside the `smartlifeutils.github.io` repo next to `../waverider`
and `../inkbounce`.

Every screenshot and most numbers come from the store captures of November 2026: the "Emily" test
persona (USD, October 2026) from `test_driver/seed/demo_seed.dart`, captured into
`images/store/2026-11/raw/ios/` in the Flutter project. The same captures make the store
screenshots and trailer. A few older HTML panels on the Insights and Tracking pages (net flow,
weekdays, smart insights, keypad) still show the 2025 demo dataset (`assets/BudgetBuddy_demo_en.json`).

## Pages

| File | URL | Purpose |
|---|---|---|
| `index.html` | `/budgetbuddy/` | Home: the October Home screen built in HTML (balance, Left to spend today, goals, donuts, insight chips), the 8 App Store screenshots in a sideways strip, the trailer, the app's screens in a carousel, one purchase in four steps, a sentence with screenshot slots, the 26 languages band, links to every topic page, questions, and a download band with the App Store preview video looping |
| `tracking.html` | `/budgetbuddy/tracking.html` | Logging: the keypad, scanning bills, receipts and warranties, repeating payments and reminders, categories and search, accounts and import |
| `budgets.html` | `/budgetbuddy/budgets.html` | Budgets: a working "when will it run out" calculator (the circle fills as you spend), how a budget is set up, the track record, savings goals |
| `insights.html` | `/budgetbuddy/insights.html` | The month on one screen, spending charts, net flow, the day that costs most, Plan Ahead in a sentence, smart insights, the monthly recap |
| `data.html` | `/budgetbuddy/data.html` | Your data: on-device storage, no account, what ads and usage statistics collect, PIN and biometric lock, cloud and weekly backups, export and delete, everything that uses the network, policy links |
| `privacy.html` | `/budgetbuddy/privacy.html` | Privacy policy (GDPR): what stays on the phone, usage statistics, ads and consent, purchases, currency rates, permissions, backups incl. Google Drive / iCloud, rights. **The app and both stores link here** |
| `terms.html` | `/budgetbuddy/terms.html` | Terms of use and EULA: licence, Premium subscription terms, Apple's minimum EULA terms, liability, Slovenian law |
| `premium.html` | `/budgetbuddy/premium.html` | Free against Premium, from the limits the app enforces in code, and what the subscription costs |
| `support.html` | `/budgetbuddy/support.html` | Contact, FAQ, bug reports, policies |
| `press.html` | `/budgetbuddy/press.html` | Press kit: fact sheet, key features, trailer, store screenshots and raw screens linked to their full files, app icon, about SmartLifeUtils. Linked from every footer |
| `download.html` | `/budgetbuddy/download` | **The link to share**: a phone goes straight to its store; desktops see a download card. `?platform=ios\|android\|none` forces a branch for testing |
| `play.html` | `/budgetbuddy/play` | The old share link, kept so links already out keep working. It forwards to `download`, query string included |
| `404.html` | direct hits only | GitHub Pages serves the repo-root 404 for unknown paths |

`app-ads.txt` here is the AdMob publisher file; leave it alone. The privacy policy and terms live on
this site (`privacy.html`, `terms.html`, effective 2 November 2026; privacy updated 5 November 2026 for Google Analytics and cloud backup) and are linked from every footer,
`data.html` and `support.html`. They replace the old flycricket pages; the app's Settings and paywall
links and the store listings must point here too. Change them together with the app when ads,
permissions or network use change.

## Where the numbers come from

| Claim | Source |
|---|---|
| Home: +$2,394.00 balance, $49.76 left today, goals $10,650 of $24,200, −$5,019.43 / +$7,413.43, Rent 37%, top 3 61% | `raw/ios/01_home_left_today.png` and `01_home.png`; the donut segments were measured from that capture |
| $24.90 Groceries, $533.44 left after it; budgets $236.93 of $1,680.00, 4 on track, Groceries $191.66 of $750 | `02b_add_filled.png`, `03_budgets.png` (the four steps add $24.90 to those) |
| Subscriptions $2,790.97 a month, "Up $2.50 since last time" | `04a_subscriptions_detect.png`, `04c_price_rise.png` |
| Plan ahead −9%, recap 28 of 31 active days, washing machine warranty in 1 month | `05_plan_ahead.png`, `06b_recap_heatmap.png`, `11_receipt_warranty.png` |
| Pace, forecast, "Safe this month", near limit at 85% | `Budgets/Screens/BudgetOverviewScreen.dart` (`_projectionForBudget`), `Budgets/Widgets/CategoryBudgetsListWidget.dart` |
| Free limits (1 account, fewer than 10 categories per type, 5 favourites, 3 budgets, QR, recurring, insight chips, ads) | `lib/subscription_manager.dart` and its call sites |
| 26 languages, 121 currencies, 180 icons, 5 number formats | `lib/l10n/`, currency_picker, `assets/icons/`, settings |
| Premium yearly subscription, 9.99 $ (App Store) and 10.99 $ (Google Play) | the US store listings, October 2026; the owner confirmed in Nov 2026 that Premium stays a yearly subscription |
| Ads: AdMob with Google's consent form (EEA, UK, Switzerland), no ATT prompt on iPhone | `lib/ads_manager.dart` |
| Network: ads, store purchases, the ECB rate from `api.frankfurter.dev` (two currency codes) when converting, Google Analytics usage events (no entries, no ad ID, no user ID), and the optional daily cloud backup to the user's own Drive `appDataFolder` / iCloud container | `lib/Settings/CurrencyConversion.dart`, `lib/analytics.dart` + `docs/ANALYTICS.md`, `lib/Settings/Cloud/`; nothing else calls out |
| Usage statistics kept 14 months, Google signals off | GA4 settings recommended in `docs/ANALYTICS.md`; the privacy policy promises them, so keep GA4 set that way |
| iOS 15 or later, Android 7.0 or later | `ios/Podfile`; Android `minSdk = flutter.minSdkVersion` (24) |
| First released 17 February 2026, Finance, rated 4+ | the App Store listing |

The old claim "Data Not Collected" / "No data collected or shared" is gone everywhere: AdMob collects
device and ad data, and the store privacy labels are being corrected (STORE_LISTING.md §5 P0).

The site describes app version 2.5.0. Publish it when 2.5.0 is live on both stores.

## Copy

Write for the person deciding whether to install: what a feature does for them, in a sentence or
two. Leave out how the app works inside (formats a parser reads, file names, thresholds, settings
names) and lists of everything it supports. The site was trimmed once for exactly this.

Keep visible copy free of version numbers, "demo data" notes and remarks on where a picture came
from (the owner's rule, Nov 2026). Facts like that belong in this README.

Sample content, not from the captures: the Groceries budget in the budgets calculator.

## Assets

- `assets/img/shots/` — raw iPhone captures from `images/store/2026-11/raw/ios/*.png` in the Flutter
  project, status bar cropped, 720 px wide JPEG, no device frames. `qr.jpg` and `budget-stats.jpg`
  are older captures kept because no new one shows the bill scanner or the streaks.
- `assets/img/store/` — the 8 App Store screenshots with captions
  (`fastlane/screenshots/ios/en-US/1_iphone69_0*.png`), 660 px wide JPEG. Home strip and press kit.
- `assets/video/` — `trailer-720.mp4` (from `images/store/2026-11/video/out/trailer_1920x1080.mp4`,
  1280×720, with music) and `preview-portrait.mp4` (from `app_preview_886x1920.mp4`, 540 px wide, no
  sound, plays muted in the closing band when in view and reduced motion is off), each with a poster.
- `assets/img/icons/` — 41 of the app's 180 category icons, copied from `assets/icons/`.
- `assets/img/brand/` — the Progress B icon (from the iOS 1024 px app icon, rounded corners cut for
  favicon, nav mark and `icon-512.png`; `apple-touch-icon.png` stays square), store badges, and
  `og-image.jpg` from `fastlane/metadata/android/en-US/images/featureGraphic.png` (1024×500). The
  root homepage's `assets/budget-buddy-banner.jpg` and `budget-buddy-180.png` are the same files.
- `assets/fonts/inter-latin.woff2` — Inter, variable 400–800, latin subset (SIL OFL). The app itself
  uses Helvetica Neue, which cannot be served on the web; Inter is the closest open face.

To refresh after a new capture or render (run from the Flutter project, `W` = this folder):

```bash
ffmpeg -i images/store/2026-11/raw/ios/03_budgets.png -vf "crop=iw:ih-180:0:180,scale=720:-2:flags=lanczos" -q:v 4 "$W/assets/img/shots/budgets.jpg"
ffmpeg -i fastlane/screenshots/ios/en-US/1_iphone69_01.png -vf "scale=660:-2:flags=lanczos" -q:v 4 "$W/assets/img/store/store-01.jpg"
ffmpeg -i images/store/2026-11/video/out/trailer_1920x1080.mp4 -vf scale=1280:720 -c:v libx264 -preset slow -crf 26 -pix_fmt yuv420p -c:a aac -b:a 128k -movflags +faststart "$W/assets/video/trailer-720.mp4"
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
