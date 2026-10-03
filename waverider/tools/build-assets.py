import collections
import json
import math
import os
import sys
from pathlib import Path

from PIL import Image, ImageOps
from fontTools import subset
from fontTools.ttLib import TTFont

SITE = Path(__file__).resolve().parent.parent
GAME = Path(sys.argv[1] if len(sys.argv) > 1 else os.environ.get(
    "WAVERIDER_REPO", Path.home() / "Projects/UnityProjects/WaveRider"))
NUNITO = Path(os.environ.get(
    "NUNITO_DIR", Path.home() / "Projects/Flutter projects/monefy_v3/fonts/Nunito"))

ART = GAME / "WaveRider/Assets/_Game/Art"
SRC = GAME / "ArtSource"
BRAND = GAME / "Docs/Branding/Assets"
SHOTS = GAME / "WaveRider/Build/screenshots/website"
OUT = SITE / "assets/img"

BOATS = {
    "motor-dinghy": "Boat_MotorDinghy",
    "speedboat": "Boat_Speedboat",
    "jet-ski": "Boat_Jetski",
    "rescue-rib": "Boat_RescueRib",
}
WORLDS = {
    "calm-lake": "CalmLake",
    "nile": "Nile",
    "loch-ness": "LochNess",
    "pacific": "Pacific",
    "caribbean": "Caribbean",
}
ACTORS = {
    "paddleboarder": "Paddleboarder",
    "hippo": "Hippo",
    "nessie": "NessieHump",
    "whale": "WhaleBack",
    "manta": "Manta",
    "jet-ski-rider": "JetSki",
}
SCREENSHOTS = {
    "jetski-pacific": "01_jetski_pacific_launch_hud",
    "jetski-backflip": "02_jetski_nile_backflip_hud",
    "dinghy-capsize": "03_dinghy_calmlake_capsize",
    "rib-lochness": "04_rib_lochness_nessie_hud",
    "dinghy-hippo": "05_dinghy_nile_hippo_hud",
    "speedboat-caribbean": "06_speedboat_caribbean_manta",
    "garage": "07_garage_tune_rib",
    "results": "08_results_new_best",
}

manifest = {}


def save(img, rel, quality=84, lossless=False):
    path = OUT / rel
    path.parent.mkdir(parents=True, exist_ok=True)
    if path.suffix == ".webp":
        img.save(path, "WEBP", quality=quality, method=6, lossless=lossless)
    elif path.suffix == ".jpg":
        img.convert("RGB").save(path, "JPEG", quality=quality, optimize=True, progressive=True)
    else:
        img.save(path, "PNG", optimize=True)
    print(f"  {rel:42} {img.size[0]}x{img.size[1]}  {path.stat().st_size // 1024} KB")


def fit_width(img, width):
    if img.width <= width:
        return img
    return img.resize((width, round(img.height * width / img.width)), Image.LANCZOS)


def sprite(src, rel, width, key=None, quality=88):

    img = Image.open(src).convert("RGBA")
    box = img.split()[3].point(lambda a: 255 if a > 8 else 0).getbbox()
    img = img.crop(box)
    full_w, full_h = Image.open(src).size
    img = fit_width(img, width)
    save(img, rel, quality)
    if key:
        manifest[key] = {
            "src": "assets/img/" + rel,
            "w": img.width,
            "h": img.height,
            "box": [round(box[0] / full_w, 5), round(box[1] / full_h, 5),
                    round(box[2] / full_w, 5), round(box[3] / full_h, 5)],
            "frame": [full_w, full_h],
        }
    return img


def logo_from_splash(splash):

    reg = splash.crop((1012, 170, 1760, 650)).convert("RGB")
    w, h = reg.size
    px = reg.load()
    lum = lambda p: (p[0] + p[1] + p[2]) / 3
    dark = lambda p: lum(p) < 70
    sky = bytearray(w * h)
    q = collections.deque()
    for x in range(w):
        q.extend(((x, 0), (x, h - 1)))
    for y in range(h):
        q.extend(((0, y), (w - 1, y)))
    while q:
        x, y = q.popleft()
        i = y * w + x
        if sky[i] or dark(px[x, y]):
            continue
        sky[i] = 1
        for nx, ny in ((x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1)):
            if 0 <= nx < w and 0 <= ny < h and not sky[ny * w + nx]:
                q.append((nx, ny))

    out = Image.new("RGBA", (w, h))
    op = out.load()
    for y in range(h):
        for x in range(w):
            p = px[x, y]
            if not sky[y * w + x]:
                op[x, y] = (*p, 255)
                continue
            near = any(
                0 <= x + dx < w and 0 <= y + dy < h and not sky[(y + dy) * w + x + dx]
                for dx in (-2, -1, 0, 1, 2) for dy in (-2, -1, 0, 1, 2))
            if near:
                a = max(0.0, min(1.0, 1 - lum(p) / 150))
                op[x, y] = (16, 20, 24, round(a * 255))
    return out.crop(out.split()[3].getbbox())


def brand():
    print("brand")
    splash = Image.open(BRAND / "Splash_Source_1795.webp").convert("RGB")
    save(splash, "brand/splash-1792.webp", 82)
    save(fit_width(splash, 1100), "brand/splash-1100.webp", 82)
    save(fit_width(splash, 720), "brand/splash-720.webp", 80)
    save(splash.crop((0, 0, 1004, 876)).resize((640, 558), Image.LANCZOS),
         "brand/splash-skipper-640.webp", 82)

    logo = logo_from_splash(splash)
    save(fit_width(logo, 740), "brand/logo.webp", 90)

    icon = Image.open(BRAND / "AppIcon_AppStore_1024.png").convert("RGB")
    save(icon.resize((256, 256), Image.LANCZOS), "brand/icon-256.webp", 86)
    for size in (180, 64, 32):
        save(icon.resize((size, size), Image.LANCZOS), f"brand/icon-{size}.png")

    og = splash.crop((96, 0, 96 + 1669, 876)).resize((1200, 630), Image.LANCZOS)
    save(og, "brand/og-image.jpg", 86)


def boats():
    print("boats")
    for slug, name in BOATS.items():
        sprite(ART / f"Boats/{name}.png", f"boats/{slug}.webp", 900, f"boat:{slug}")
    sprite(ART / "Captain/Captain_Skipper_Sitting.png", "captain/sitting.webp", 420, "captain:sitting")
    sprite(SRC / "Captain/Captain_Skipper_Standing.png", "captain/standing.webp", 420, "captain:standing")


def worlds():
    print("worlds")
    for slug, wid in WORLDS.items():
        card = Image.open(ART / f"WorldCards/Card_{wid}.png").convert("RGB")
        save(fit_width(card, 780), f"worlds/{slug}.webp", 82)
        for f in sorted((ART / f"Resources/Backdrop/{wid}").glob("*.png")):
            part = f.stem.split("_", 2)[2]
            img = Image.open(f).convert("RGBA")
            rel = f"backdrop/{slug}/{part.lower()}.webp"
            save(img, rel, 82)
            manifest[f"backdrop:{slug}:{part}"] = {
                "src": "assets/img/" + rel, "w": img.width, "h": img.height}


def actors():
    print("actors")
    for slug, name in ACTORS.items():
        sprite(SRC / f"Actors/{name}/{name}_Full.png", f"actors/{slug}.webp", 560, f"actor:{slug}")


def ui():
    print("ui")
    sprite(ART / "UI/Hud_Pedal_Brake.png", "ui/pedal-brake.webp", 360)
    sprite(ART / "UI/Hud_Pedal_Throttle.png", "ui/pedal-throttle.webp", 360)
    for name in ("Engine", "Hull", "Propeller", "Trim", "Fuel"):
        sprite(ART / f"UI/Skin/Ui_{name}.png", f"ui/{name.lower()}.webp", 200)
    sprite(ART / "Pickups/Coin.png", "ui/coin.webp", 160)
    for name in ("Win_Mission", "Win_Badge", "Win_Rank"):
        sprite(ART / f"UI/{name}.png", f"ui/{name.lower().replace('_', '-')}.webp", 240)

    for name, slug in (("Card", "card"), ("PrimaryTextButton", "btn-primary"),
                       ("TextButton", "btn"), ("SelectedTextButton", "btn-selected"),
                       ("CurrencyContainer", "counter")):
        img = Image.open(ART / f"UI/Skin/Ui_{name}.png").convert("RGBA")
        save(img, f"skin/{slug}.webp", 92)


def surf():

    print("surf")
    out = OUT / "surf"
    out.mkdir(parents=True, exist_ok=True)
    H = 104
    layers = {
        "back": (760, 46, [(16, 2, 0.6, 0.4), (6, 1, 0.35, 1.9)],
                 "#6ddbee", "#1a8fc4", "#d2fbfd", "#b8f3f8", 0),
        "mid": (560, 62, [(16, 2, 0.72, 0.9), (6, 1, 0.3, 2.4)],
                "#1fa4e0", "#0d5f9e", "#8feff5", "#62d0f0", 0.6),
        "front": (720, 80, [(19, 2, 0.82, 0.5), (7, 1, 0.35, 1.2)],
                  "#0a8ad4", "#083f6e", "#8feff5", "#3fb0e8", 1),
    }
    for name, (w, mean, comps, fill, rim, crest, streak, foam) in layers.items():
        def height(x):
            h = 0.0
            for amp, n, steep, phase in comps:
                p = 2 * math.pi * n * x / w + phase
                th = p
                for _ in range(6):
                    th = p + steep * math.sin(th)
                h += amp * math.cos(th)
            return h

        xs = list(range(0, w + 1, 4))
        hs = [height(x) for x in xs]
        top = max(hs)
        pts = [(x, mean - h) for x, h in zip(xs, hs)]
        line = " ".join(f"{x},{y:.1f}" for x, y in pts)
        body = [f'<path d="M0,{H} L{line} L{w},{H} Z" fill="{fill}"/>']

        for depth, damp, periods, phase, width in ((15, 0.7, 3, 0.4, 3), (29, 0.45, 2, 2.1, 2.5)):
            if mean + depth > H - 4:
                continue
            seg = []
            for x, h in zip(xs, hs):
                on = math.sin(2 * math.pi * periods * x / w + phase) > 0.2
                if on:
                    seg.append(f"{x},{mean + depth - h * damp:.1f}")
                elif seg:
                    body.append(f'<polyline points="{" ".join(seg)}" fill="none" stroke="{streak}" '
                                f'stroke-width="{width}" stroke-linecap="round" opacity=".55"/>')
                    seg = []
            if seg:
                body.append(f'<polyline points="{" ".join(seg)}" fill="none" stroke="{streak}" '
                            f'stroke-width="{width}" stroke-linecap="round" opacity=".55"/>')

        body.append(f'<polyline points="{line}" fill="none" stroke="{rim}" stroke-width="4" stroke-linejoin="round"/>')
        body.append(f'<polyline points="{line}" transform="translate(0 4)" fill="none" stroke="{crest}" '
                    f'stroke-width="3.5" stroke-linejoin="round"/>')

        if foam:
            for (x0, y0), (x1, y1) in zip(pts, pts[1:]):
                t = (mean - min(y0, y1)) / top
                if t < 0.5:
                    continue
                k = (t - 0.5) / 0.5
                body.append(f'<line x1="{x0}" y1="{y0 + 1:.1f}" x2="{x1}" y2="{y1 + 1:.1f}" stroke="#fff" '
                            f'stroke-width="{(3 + 7 * k) * foam:.1f}" stroke-linecap="round"/>')
            peaks = [i for i in range(1, len(pts) - 1)
                     if pts[i][1] < pts[i - 1][1] and pts[i][1] <= pts[i + 1][1]]
            for i in peaks:
                x, y = pts[i]
                for dx, dy, r in ((-17, 10, 3.6), (-33, 15, 2.6), (-49, 12, 1.8), (-8, 18, 1.6)):
                    body.append(f'<circle cx="{(x + dx) % w}" cy="{y + dy:.1f}" r="{r * foam:.1f}" '
                                f'fill="#fff" opacity=".85"/>')

        svg = (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w} {H}" width="{w}" height="{H}">'
               + "".join(body) + "</svg>\n")
        (out / f"{name}.svg").write_text(svg)
        print(f"  surf/{name}.svg {' ' * 30} {w}x{H}  {len(svg) // 1024} KB")


def screenshots():
    print("screenshots")
    if not SHOTS.is_dir():
        print(f"  skipped: no {SHOTS}")
        return
    for slug, name in SCREENSHOTS.items():
        img = Image.open(SHOTS / f"{name}.png").convert("RGB")
        save(fit_width(img, 1600), f"shots/{slug}-1600.webp", 82)
        save(fit_width(img, 480), f"shots/{slug}-480.webp", 80)


def fonts():
    print("fonts")
    out = SITE / "assets/fonts"
    out.mkdir(parents=True, exist_ok=True)
    jobs = [(ART / "UI/Fonts/LilitaOne-Regular.ttf", "lilita-one.woff2")]
    for weight, name in ((400, "Regular"), (700, "Bold"), (800, "ExtraBold"), (900, "Black")):
        jobs.append((NUNITO / f"Nunito-{name}.ttf", f"nunito-{weight}.woff2"))
    unicodes = list(range(0x20, 0x7F)) + list(range(0xA0, 0x100)) + [
        0x2013, 0x2014, 0x2018, 0x2019, 0x201C, 0x201D, 0x2022, 0x2026,
        0x00D7, 0x2605, 0x20AC, 0x2122]
    for src, name in jobs:
        font = TTFont(src)
        opts = subset.Options()
        opts.flavor = "woff2"
        opts.layout_features = ["kern", "liga", "calt", "tnum", "lnum"]
        opts.name_IDs = ["*"]
        sub = subset.Subsetter(opts)
        sub.populate(unicodes=unicodes)
        sub.subset(font)
        font.flavor = "woff2"
        font.save(out / name)
        print(f"  fonts/{name:36} {(out / name).stat().st_size // 1024} KB")


def write_manifest():
    path = SITE / "assets/js/art.js"
    body = json.dumps(manifest, indent=1, sort_keys=True)
    path.write_text(f"window.WR_ART = {body};\n")
    print(f"  js/art.js  {len(manifest)} entries")


if __name__ == "__main__":
    if not ART.is_dir():
        sys.exit(f"Not a Wave Rider repo: {GAME}")
    brand()
    boats()
    worlds()
    actors()
    ui()
    surf()
    screenshots()
    fonts()
    write_manifest()
