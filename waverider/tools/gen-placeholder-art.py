#!/usr/bin/env python3
"""Generate the Wave Rider placeholder art.

Six 1440x810 gameplay/menu mockups plus the app mark and the OG card, all drawn
from the game's real world palettes (Docs/Design world definitions) so they read
as stylized promo art rather than grey boxes. Replace with real captures from
Tools > Wave Rider > Store > Capture Screenshots when the build can produce them.
"""
import math
import os

OUT = os.path.join(os.path.dirname(__file__), "out")
W, H = 1440, 810

FONT = "'Helvetica Neue', Helvetica, Arial, sans-serif"

PALETTES = {
    "pacific": dict(sky_top="#7FD3E8", sky_low="#CDEFF5", cloud="#EAF7FA",
                    far="#3E9BA8", near="#1F5F5C", accent="#E8C48A",
                    surf="#23A9BE", band="#14507A", deep="#0A2C57", crest="#6FE0DC"),
    "lake":    dict(sky_top="#A8C8DE", sky_low="#EBD9C4", cloud="#F2E6D8",
                    far="#8FA3B8", near="#4E6B63", accent="#F0E4CE",
                    surf="#4E8FA8", band="#1F4E70", deep="#132F4C", crest="#9ED8DC"),
    "arctic":  dict(sky_top="#8FA9C0", sky_low="#DCE8F0", cloud="#EDF3F7",
                    far="#6F8BA3", near="#2E4257", accent="#CFE4F2",
                    surf="#2E7E9B", band="#124366", deep="#08243F", crest="#A8E4E8"),
}

GOLD = "#FFC93C"
AQUA = "#6FE0DC"
INK = "#0A1A2C"
PANEL = "#16324B"
PANEL_DK = "#102436"
TEXT = "#EAF4FB"
DIM = "#7B94A9"


# --------------------------------------------------------------------------- #
# wave geometry
# --------------------------------------------------------------------------- #
def wave_y(x, base, waves, phase=0.0):
    y = base
    for amp, length, off in waves:
        y += amp * math.sin(2 * math.pi * (x / length) + off + phase)
    return y


def wave_path(base, waves, phase=0.0, step=12, bottom=H):
    pts = []
    x = -20
    while x <= W + 20:
        pts.append((x, wave_y(x, base, waves, phase)))
        x += step
    d = "M-20 %.1f" % pts[0][1]
    for px, py in pts[1:]:
        d += " L%.1f %.1f" % (px, py)
    d += " L%d %d L-20 %d Z" % (W + 20, bottom, bottom)
    return d


def crest_caps(base, waves, phase, color, count=7, scale=1.0):
    """Foam caps sitting on the local high points of a wave line."""
    out = []
    for i in range(count):
        x = (i + 0.5) * (W / count)
        # walk to the nearest local peak (smallest y) within half a period
        best = min(((wave_y(x + dx, base, waves, phase), x + dx)
                    for dx in range(-70, 71, 5)))
        y, cx = best
        w = 46 * scale
        out.append(
            f'<path d="M{cx-w:.0f} {y+7:.0f} q{w*0.45:.0f} -{16*scale:.0f} {w:.0f} -{4*scale:.0f} '
            f'q{w*0.5:.0f} {10*scale:.0f} {w:.0f} {4*scale:.0f} q-{w:.0f} {16*scale:.0f} -{2*w:.0f} 0 Z" '
            f'fill="{color}" opacity=".9"/>')
    return "".join(out)


# --------------------------------------------------------------------------- #
# actors
# --------------------------------------------------------------------------- #
def boat(x, y, angle=0.0, scale=1.0, captain=True, wash=True):
    """Side-on speedboat silhouette. Origin is the hull centre at the waterline."""
    g = (f'<g transform="translate({x} {y}) rotate({angle}) scale({scale})">'
         # hull
         '<path d="M-100 -10 L96 -20 C106 -6 96 16 76 18 L-70 18 C-92 18 -100 4 -100 -10 Z" fill="#0D2740"/>'
         '<path d="M-100 -10 L96 -20 L97 -12 L-100 -2 Z" fill="#1B4A70"/>'
         f'<path d="M-88 -5 L88 -15 L88 -9 L-88 1 Z" fill="{GOLD}" opacity=".85"/>')
    if wash:
        # engine wash under the stern — only when the boat is actually moving
        g += ('<path d="M-100 -3 q-20 4 -30 12 q22 -4 30 -6 Z" fill="#FFFFFF" opacity=".42"/>'
              '<path d="M-100 1 q-14 3 -22 9 q16 -3 22 -5 Z" fill="#FFFFFF" opacity=".3"/>')
    if captain:
        # The skipper sits aft of the screen, so draw the figure first and let
        # the cabin overlap his legs — otherwise he reads as standing on the bow.
        g += ('<path d="M-52 -14 L-49 -36 q12 -7 24 0 L-22 -14 Z" fill="#A6413A"/>'
              '<circle cx="-37" cy="-46" r="11" fill="#E8C48A"/>'
              f'<path d="M-49 -50 q12 -11 24 -2 l10 2 -10 4 q-12 3 -24 -4 Z" fill="{GOLD}"/>')
    # cabin + windscreen, drawn over the figure
    g += ('<path d="M-30 -12 L-14 -44 L28 -44 L42 -12 Z" fill="#153B5C"/>'
          f'<path d="M-6 -18 L4 -38 L23 -38 L31 -18 Z" fill="{AQUA}" opacity=".75"/>')
    return g + "</g>"


def spray(x, y, n=14, spread=120, color="#FFFFFF"):
    out = []
    for i in range(n):
        a = math.pi * (0.15 + 0.7 * i / max(n - 1, 1))
        r = spread * (0.35 + 0.65 * ((i * 37) % 11) / 10)
        cx = x - math.cos(a) * r
        cy = y - math.sin(a) * r * 0.8
        rr = 5 + (i % 4) * 3
        out.append(f'<circle cx="{cx:.0f}" cy="{cy:.0f}" r="{rr}" fill="{color}" opacity="{0.75 - i*0.035:.2f}"/>')
    return "".join(out)


def coin(x, y, r=17):
    return (f'<g transform="translate({x} {y})">'
            f'<circle r="{r}" fill="{GOLD}"/><circle r="{r*0.72:.0f}" fill="#E0A81F"/>'
            f'<path d="M-{r*0.3:.0f} -{r*0.42:.0f} h{r*0.6:.0f} M0 -{r*0.42:.0f} v{r*0.84:.0f} '
            f'M-{r*0.3:.0f} {r*0.42:.0f} h{r*0.6:.0f}" stroke="#FFF0B8" stroke-width="{max(r*0.16,2):.0f}" '
            f'fill="none" stroke-linecap="round"/></g>')


def text(x, y, s, size=30, fill=TEXT, weight="700", anchor="start", ls=2, op=1):
    esc = s.replace("&", "&amp;").replace("<", "&lt;")
    return (f'<text x="{x}" y="{y}" font-family="{FONT}" font-size="{size}" font-weight="{weight}" '
            f'fill="{fill}" text-anchor="{anchor}" letter-spacing="{ls}" opacity="{op}">{esc}</text>')


def panel(x, y, w, h, r=14, fill=PANEL, stroke="#204058", op=1):
    return (f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="{r}" fill="{fill}" '
            f'stroke="{stroke}" stroke-width="2" opacity="{op}"/>')


# --------------------------------------------------------------------------- #
# scene chrome
# --------------------------------------------------------------------------- #
def backdrop(p, horizon=330):
    """Sky, sun, clouds and two silhouette ridges."""
    s = (f'<rect width="{W}" height="{H}" fill="url(#sky)"/>'
         f'<circle cx="1130" cy="150" r="86" fill="{p["cloud"]}" opacity=".55"/>'
         f'<circle cx="1130" cy="150" r="54" fill="#FFFFFF" opacity=".8"/>')
    for cx, cy, sc, op in ((250, 130, 1.0, .85), (620, 96, .7, .6), (960, 178, .55, .5), (1330, 110, .8, .7)):
        s += (f'<g transform="translate({cx} {cy}) scale({sc})" fill="{p["cloud"]}" opacity="{op}">'
              '<ellipse cx="0" cy="0" rx="92" ry="30"/><ellipse cx="-46" cy="8" rx="56" ry="22"/>'
              '<ellipse cx="40" cy="6" rx="64" ry="24"/><ellipse cx="6" cy="-18" rx="48" ry="26"/></g>')
    # far ridge
    s += (f'<path d="M-20 {horizon} L120 {horizon-92} L250 {horizon-38} L400 {horizon-116} '
          f'L560 {horizon-30} L700 {horizon-72} L880 {horizon-22} L1040 {horizon-96} '
          f'L1220 {horizon-34} L1380 {horizon-80} L{W+20} {horizon-16} L{W+20} {horizon+40} L-20 {horizon+40} Z" '
          f'fill="{p["far"]}" opacity=".85"/>')
    # Near shore. It runs well past the top of the furthest water band so no
    # sliver of sky can show through the seam between the two.
    s += (f'<path d="M-20 {horizon+34} L180 {horizon-16} L330 {horizon+22} L520 {horizon-34} '
          f'L720 {horizon+16} L900 {horizon-24} L1120 {horizon+20} L1300 {horizon-20} '
          f'L{W+20} {horizon+26} L{W+20} {H} L-20 {H} Z" fill="{p["near"]}"/>')
    return s


def sea(p, base=520, phase=0.0):
    """Three parallax water bands, front band capped with foam."""
    back = [(16, 640, 0.4), (7, 250, 1.9)]
    mid = [(26, 520, 0.9), (11, 210, 2.6)]
    front = [(40, 470, 0.0), (16, 190, 1.2)]
    s = (f'<path d="{wave_path(base - 78, back, phase*0.5)}" fill="{p["band"]}"/>'
         f'<path d="{wave_path(base - 34, mid, phase*0.75)}" fill="{p["surf"]}"/>'
         + crest_caps(base - 34, mid, phase * 0.75, p["crest"], 6, .8) +
         f'<path d="{wave_path(base, front, phase)}" fill="url(#water)"/>'
         + crest_caps(base, front, phase, "#FFFFFF", 7, 1.0))
    # light ribbons in the deep
    for i, (yy, ww, op) in enumerate(((0.42, 300, .10), (0.62, 220, .08), (0.80, 380, .06))):
        s += (f'<rect x="-20" y="{base + (H-base)*yy:.0f}" width="{W+40}" height="{6+i*3}" '
              f'fill="{p["crest"]}" opacity="{op}" rx="4"/>')
    return s


def hud(distance="1 240 M", fuel=0.62, thrust=0.8, rpm=0.9, prop_out=False, best=False):
    s = ""
    # distance + best
    s += panel(48, 44, 300, 92, 16, "rgba(10,26,44,.72)")
    s += text(72, 82, "DISTANCE", 20, DIM, "700", ls=5)
    s += text(72, 122, distance, 42, TEXT, "700", ls=1)
    if best:
        s += panel(364, 44, 176, 46, 12, "rgba(255,201,60,.16)", GOLD)
        s += text(452, 76, "NEW BEST", 22, GOLD, "700", anchor="middle", ls=4)
    # fuel bar
    s += panel(48, 152, 300, 54, 14, "rgba(10,26,44,.72)")
    s += text(72, 187, "FUEL", 20, DIM, "700", ls=5)
    s += f'<rect x="146" y="168" width="180" height="20" rx="10" fill="#0A1A2C" stroke="#204058" stroke-width="2"/>'
    fc = GOLD if fuel > .3 else "#A6413A"
    s += f'<rect x="149" y="171" width="{174*fuel:.0f}" height="14" rx="7" fill="{fc}"/>'
    # gauges (RPM / THRUST) top-right
    for i, (label, val, col) in enumerate((("RPM", rpm, AQUA), ("THRUST", thrust, GOLD))):
        cx, cy, r = W - 220 + i * 140, 118, 52
        s += f'<circle cx="{cx}" cy="{cy}" r="{r}" fill="rgba(10,26,44,.78)" stroke="#204058" stroke-width="3"/>'
        a0, a1 = math.radians(150), math.radians(150 + 240 * val)
        rr = r - 13
        large = 1 if 240 * val > 180 else 0
        s += (f'<path d="M{cx+rr*math.cos(a0):.1f} {cy+rr*math.sin(a0):.1f} '
              f'A{rr} {rr} 0 {large} 1 {cx+rr*math.cos(a1):.1f} {cy+rr*math.sin(a1):.1f}" '
              f'stroke="{col}" stroke-width="9" fill="none" stroke-linecap="round"/>')
        # Sits inside the arc: at this radius the ring passes ~38px either side of
        # centre, so a wider label would collide with it.
        s += text(cx, cy + 7, label, 15, DIM, "700", anchor="middle", ls=1)
    if prop_out:
        s += panel(W - 300, 196, 252, 50, 12, "rgba(166,65,58,.22)", "#A6413A")
        s += text(W - 174, 229, "PROP OUT", 24, "#F2A79F", "700", anchor="middle", ls=4)
    # pedals
    s += ('<g opacity=".9">'
          f'<circle cx="140" cy="{H-120}" r="76" fill="rgba(10,26,44,.6)" stroke="#204058" stroke-width="3"/>'
          f'<circle cx="140" cy="{H-120}" r="52" fill="#B4BCC6" opacity=".28"/>'
          + text(140, H - 110, "BRAKE", 20, TEXT, "700", anchor="middle", ls=3) +
          f'<circle cx="{W-140}" cy="{H-120}" r="76" fill="rgba(10,26,44,.6)" stroke="#204058" stroke-width="3"/>'
          f'<circle cx="{W-140}" cy="{H-120}" r="52" fill="{GOLD}" opacity=".32"/>'
          + text(W - 140, H - 110, "GO", 24, TEXT, "700", anchor="middle", ls=3) + '</g>')
    return s


def banner(label, sub=None, y=250, col=GOLD):
    w = max(len(label) * 30 + 120, 420)
    s = panel((W - w) / 2, y, w, 96 if sub else 78, 18, "rgba(10,26,44,.8)", col)
    s += text(W / 2, y + (52 if sub else 54), label, 46, col, "700", anchor="middle", ls=6)
    if sub:
        s += text(W / 2, y + 82, sub, 24, TEXT, "600", anchor="middle", ls=3)
    return s


def wrap(body, p):
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" width="{W}" height="{H}">'
            '<defs>'
            f'<linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">'
            f'<stop offset="0" stop-color="{p["sky_top"]}"/><stop offset="1" stop-color="{p["sky_low"]}"/></linearGradient>'
            f'<linearGradient id="water" x1="0" y1="0" x2="0" y2="1">'
            f'<stop offset="0" stop-color="{p["surf"]}"/><stop offset="1" stop-color="{p["deep"]}"/></linearGradient>'
            '</defs>' + body + '</svg>')


# --------------------------------------------------------------------------- #
# the six shots
# --------------------------------------------------------------------------- #
def shot_riding():
    p = PALETTES["pacific"]
    front = [(40, 470, 0.0), (16, 190, 1.2)]
    x = 470
    y = wave_y(x, 520, front) - 10
    slope = math.degrees(math.atan2(wave_y(x + 30, 520, front) - wave_y(x - 30, 520, front), 60))
    b = backdrop(p) + sea(p) + boat(x, y, slope, 1.5) + spray(x - 165, y + 10, 12, 130)
    b += hud("1 240 M", .62, .82, .88)
    return wrap(b, p)


def shot_launch():
    p = PALETTES["pacific"]
    front = [(40, 470, 0.0), (16, 190, 1.2)]
    x = 560
    y = wave_y(x, 520, front) - 120
    b = backdrop(p) + sea(p)
    b += spray(x - 90, y + 150, 20, 220)
    b += boat(x, y, -26, 1.5)
    b += banner("WAVE HOP x3", "+450", 236)
    b += hud("1 615 M", .55, .95, .96)
    return wrap(b, p)


def shot_flip():
    p = PALETTES["pacific"]
    b = backdrop(p) + sea(p, base=620)
    b += boat(560, 430, 205, 1.45)
    for i in range(7):
        b += coin(830 + i * 78, 372 + int(56 * math.sin(i * .7)), 22)
    b += banner("HUGE AIR x2.5", "AIR TIME 4.8s", 150)
    b += hud("2 090 M", .48, .35, .95, prop_out=True)
    return wrap(b, p)


def shot_landing():
    p = PALETTES["lake"]
    front = [(40, 470, 0.0), (16, 190, 1.2)]
    x = 690
    y = wave_y(x, 520, front) - 8
    slope = math.degrees(math.atan2(wave_y(x + 30, 520, front) - wave_y(x - 30, 520, front), 60))
    b = backdrop(p) + sea(p)
    b += spray(x - 60, y + 8, 22, 240)
    b += boat(x, y, slope, 1.5)
    b += banner("PERFECT LANDING", "+500", 268, AQUA)
    b += hud("3 480 M", .34, .74, .8, best=True)
    return wrap(b, p)


def shot_garage():
    p = PALETTES["pacific"]
    b = f'<rect width="{W}" height="{H}" fill="{INK}"/>'
    b += (f'<path d="M0 0 H{W} V{H} H0 Z" fill="url(#water)" opacity=".18"/>')
    # top bar: title + balances
    b += panel(0, 0, W, 96, 0, "#081524", "#204058")
    b += text(56, 62, "GARAGE", 44, TEXT, "700", ls=8)
    b += coin(952, 48, 20) + text(982, 60, "184 500", 32, GOLD, "700")
    b += (f'<circle cx="1252" cy="48" r="18" fill="#D1E6FF"/><circle cx="1252" cy="48" r="11" fill="#FFFFFF" opacity=".7"/>'
          + text(1282, 60, "126", 32, "#D1E6FF", "700"))
    # tab strip
    for i, t in enumerate(("VEHICLE", "WORLD", "TUNE", "STYLE")):
        x = 56 + i * 190
        act = i == 2
        b += panel(x, 124, 172, 58, 12, "#2F6E92" if act else "#28374A", "#204058")
        b += text(x + 86, 162, t, 24, TEXT if act else DIM, "700", anchor="middle", ls=4)
    # boat display
    b += panel(56, 214, 620, 330, 18, PANEL_DK)
    b += (f'<path d="M56 452 h620 v74 a18 18 0 0 1 -18 18 h-584 a18 18 0 0 1 -18 -18 Z" fill="{p["deep"]}"/>'
          f'<path d="M56 452 h620 v10 h-620 Z" fill="{p["surf"]}" opacity=".7"/>')
    b += boat(366, 452, 0, 1.5, wash=False)
    b += text(366, 290, "SPEEDBOAT", 52, TEXT, "700", anchor="middle", ls=6)
    b += text(366, 328, "LIGHT MOTOR  ·  OWNED", 22, DIM, "700", anchor="middle", ls=5)
    # upgrade lanes
    lanes = (("GO", "ENGINE", 7, 15), ("HULL", "HULL", 4, 15), ("BITE", "PROPELLER", 9, 15),
             ("ANGLE", "TRIM", 3, 15), ("RANGE", "FUEL", 11, 15))
    for i, (name, what, lvl, cap) in enumerate(lanes):
        y = 214 + i * 66
        b += panel(712, y, 672, 54, 12, PANEL)
        b += text(736, y + 36, name, 28, TEXT, "700", ls=4)
        b += text(898, y + 35, what, 16, DIM, "700", ls=2)
        for k in range(cap):
            px = 1040 + k * 17
            b += (f'<rect x="{px}" y="{y+20}" width="11" height="15" rx="3" '
                  f'fill="{GOLD if k < lvl else "#28374A"}"/>')
        b += text(1360, y + 36, f"{lvl}/{cap}", 22, DIM, "700", anchor="end", ls=2)
    b += panel(712, 546, 672, 76, 14, "#2F6E92", AQUA)
    b += text(1048, 594, "START", 40, TEXT, "700", anchor="middle", ls=8)
    return wrap(b, p)


def shot_worlds():
    p = PALETTES["pacific"]
    b = f'<rect width="{W}" height="{H}" fill="{INK}"/>'
    b += panel(0, 0, W, 96, 0, "#081524", "#204058")
    b += text(56, 62, "CHOOSE YOUR WATER", 44, TEXT, "700", ls=8)
    b += coin(952, 48, 20) + text(982, 60, "184 500", 32, GOLD, "700")

    tiles = (("CALM LAKE", "FORCE 1 · LIGHT AIR", "lake", "OWNED", None),
             ("PACIFIC", "FORCE 4 · MODERATE BREEZE", "pacific", "OWNED", None),
             ("ARCTIC", "FORCE 7 · NEAR GALE", "arctic", None, "4 000 000"))
    for i, (name, note, pal, owned, cost) in enumerate(tiles):
        q = PALETTES[pal]
        x = 60 + i * 448
        b += f'<g transform="translate({x} 168)">'
        b += (f'<clipPath id="t{i}"><rect width="408" height="330" rx="18"/></clipPath>'
              f'<g clip-path="url(#t{i})">'
              f'<rect width="408" height="330" fill="{q["sky_low"]}"/>'
              f'<rect width="408" height="150" fill="{q["sky_top"]}"/>'
              f'<circle cx="330" cy="52" r="30" fill="#FFFFFF" opacity=".75"/>'
              f'<path d="M0 168 L70 122 L150 160 L240 108 L330 156 L408 124 L408 200 L0 200 Z" fill="{q["far"]}"/>'
              f'<path d="M0 196 L96 166 L200 200 L300 168 L408 198 L408 240 L0 240 Z" fill="{q["near"]}"/>'
              f'<path d="M0 214 q68 -30 136 0 t136 0 t136 0 V330 H0 Z" fill="{q["surf"]}"/>'
              f'<path d="M0 250 q68 -32 136 0 t136 0 t136 0 V330 H0 Z" fill="{q["deep"]}"/>'
              f'<path d="M0 246 q68 -32 136 0 t136 0 t136 0" stroke="{q["crest"]}" stroke-width="6" fill="none"/>'
              '</g>')
        b += '<rect width="408" height="330" rx="18" fill="none" stroke="#204058" stroke-width="3"/>'
        if cost:
            b += ('<rect width="408" height="330" rx="18" fill="#0A1A2C" opacity=".72"/>'
                  + text(204, 168, "?", 120, DIM, "700", anchor="middle", ls=0))
        b += text(204, 386, name, 40, TEXT, "700", anchor="middle", ls=5)
        b += text(204, 420, note, 20, DIM, "700", anchor="middle", ls=4)
        if cost:
            b += panel(94, 442, 220, 56, 12, PANEL, "#204058")
            b += coin(140, 470, 15) + text(168, 482, cost, 26, GOLD, "700")
        else:
            b += panel(124, 442, 160, 56, 12, "rgba(79,168,61,.18)", "#4FA83D")
            b += text(204, 482, owned, 24, "#8FD97F", "700", anchor="middle", ls=4)
        b += '</g>'
    b += text(W / 2, 736, "WATER CHANGES THE PHYSICS — DENSITY, CURRENT, WIND, GRAVITY", 24, DIM, "700",
              anchor="middle", ls=5)
    return wrap(b, p)


# --------------------------------------------------------------------------- #
# brand marks
# --------------------------------------------------------------------------- #
def icon(rounded=True):
    """App mark. The rounded build is the SVG favicon; the square build is what
    gets rasterized, because iOS composites the touch icon behind its own mask
    and transparent corners can show through as black."""
    p = PALETTES["pacific"]
    r = 112 if rounded else 0
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">'
            '<defs><linearGradient id="s" x1="0" y1="0" x2="0" y2="1">'
            f'<stop offset="0" stop-color="{p["sky_top"]}"/><stop offset="1" stop-color="{p["sky_low"]}"/></linearGradient>'
            '<linearGradient id="w" x1="0" y1="0" x2="0" y2="1">'
            f'<stop offset="0" stop-color="{p["surf"]}"/><stop offset="1" stop-color="{p["deep"]}"/></linearGradient>'
            f'<clipPath id="c"><rect width="512" height="512" rx="{r}"/></clipPath></defs>'
            '<g clip-path="url(#c)">'
            '<rect width="512" height="512" fill="url(#s)"/>'
            f'<circle cx="380" cy="120" r="56" fill="#FFFFFF" opacity=".8"/>'
            f'<path d="M0 258 q64 -46 128 0 t128 0 t128 0 t128 0 V512 H0 Z" fill="{p["band"]}"/>'
            '<path d="M0 306 q64 -50 128 0 t128 0 t128 0 t128 0 V512 H0 Z" fill="url(#w)"/>'
            f'<path d="M0 300 q64 -50 128 0 t128 0 t128 0 t128 0" stroke="{p["crest"]}" stroke-width="16" fill="none"/>'
            + boat(256, 300, -10, 1.28) +
            '</g></svg>')


def og():
    p = PALETTES["pacific"]
    ow, oh = 1200, 630
    front = [(30, 470, 0.0), (13, 190, 1.2)]
    body = (f'<rect width="{ow}" height="{oh}" fill="{INK}"/>'
            f'<rect width="{ow}" height="{oh}" fill="url(#sky)" opacity=".16"/>')
    for cx, cy, sc, op in ((190, 96, .8, .12), (860, 70, .6, .1)):
        body += (f'<g transform="translate({cx} {cy}) scale({sc})" fill="#FFFFFF" opacity="{op}">'
                 '<ellipse rx="92" ry="30"/><ellipse cx="-46" cy="8" rx="56" ry="22"/>'
                 '<ellipse cx="40" cy="6" rx="64" ry="24"/></g>')
    body += (f'<path d="{wave_path(470, [(20,640,.4),(9,250,1.9)], 0, bottom=oh)}" fill="{p["band"]}"/>'
             f'<path d="{wave_path(510, front, 0, bottom=oh)}" fill="url(#water)"/>'
             + crest_caps(510, front, 0, "#FFFFFF", 6, .9).replace(str(H), str(oh)))
    body += boat(880, 498, -8, 1.05)
    body += spray(790, 504, 12, 110)
    body += text(96, 236, "WAVE RIDER", 116, TEXT, "700", ls=6)
    body += text(100, 292, "RIDE THE WAVE. DON'T RUN DRY.", 34, AQUA, "700", ls=8)
    body += text(100, 352, "A physics arcade game on always-moving water.", 30, "#A9BECF", "600", ls=1)
    body += panel(96, 396, 236, 58, 12, "rgba(255,201,60,.14)", GOLD)
    body += text(214, 434, "COMING SOON", 26, GOLD, "700", anchor="middle", ls=4)
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {ow} {oh}" width="{ow}" height="{oh}">'
            '<defs>'
            f'<linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">'
            f'<stop offset="0" stop-color="{p["sky_top"]}"/><stop offset="1" stop-color="{p["sky_low"]}"/></linearGradient>'
            f'<linearGradient id="water" x1="0" y1="0" x2="0" y2="1">'
            f'<stop offset="0" stop-color="{p["surf"]}"/><stop offset="1" stop-color="{p["deep"]}"/></linearGradient>'
            '</defs>' + body + '</svg>')


if __name__ == "__main__":
    os.makedirs(OUT, exist_ok=True)
    files = {
        "screenshot-1.svg": shot_riding(),
        "screenshot-2.svg": shot_launch(),
        "screenshot-3.svg": shot_flip(),
        "screenshot-4.svg": shot_landing(),
        "screenshot-5.svg": shot_garage(),
        "screenshot-6.svg": shot_worlds(),
        "icon.svg": icon(),
        "icon-square.svg": icon(rounded=False),
        "og-image.svg": og(),
    }
    for name, svg in files.items():
        with open(os.path.join(OUT, name), "w") as f:
            f.write(svg)
        print(f"{name}  {len(svg)/1024:.1f} KB")
