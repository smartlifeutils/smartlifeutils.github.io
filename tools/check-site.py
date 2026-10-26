#!/usr/bin/env python3
"""Checks the static sites in this repo before a push.

Run from the repo root:  python3 tools/check-site.py

It reports:
  - links, images, posters and scripts that point at files that do not exist
  - pages missing a <title>, a meta description or a canonical URL
  - sitemap entries that point at no file, and indexable pages no sitemap lists
  - a site whose pages load its CSS/JS with different ?v= stamps
Exit code 1 when anything is wrong, so it can gate a commit.
"""
import glob
import os
import re
import sys

ROOT = "https://smartlifeutils.github.io/"
SITES = ["waverider", "inkbounce", "budgetbuddy"]
NOT_INDEXED = {"play.html", "404.html"}
problems = []


def page_files():
    files = ["index.html"]
    for site in SITES:
        files += sorted(glob.glob(f"{site}/*.html"))
    return files


def local_path(page, url):
    url = url.split("#")[0].split("?")[0]
    if not url or url.startswith(("http:", "https:", "mailto:", "tel:", "data:", "//", "javascript:")):
        return None
    base = "." if url.startswith("/") else os.path.dirname(page) or "."
    path = os.path.normpath(os.path.join(base, url.lstrip("/")))
    if url.endswith("/") or os.path.isdir(path):
        path = os.path.join(path, "index.html")
    elif not os.path.splitext(path)[1] and os.path.exists(path + ".html"):
        path += ".html"
    return path


def url_to_file(loc):
    rel = loc[len(ROOT):] if loc.startswith(ROOT) else None
    if rel is None:
        return None
    if rel == "" or rel.endswith("/"):
        return rel + "index.html"
    if not os.path.splitext(rel)[1]:
        return rel + ".html"
    return rel


for page in page_files():
    html = open(page, encoding="utf-8").read()
    for attr, url in re.findall(r'\b(href|src|poster|data-preview)="([^"]+)"', html):
        path = local_path(page, url)
        if path and not os.path.exists(path):
            problems.append(f"{page}: {attr}=\"{url}\" points at a missing file")
    name = os.path.basename(page)
    if "<title>" not in html:
        problems.append(f"{page}: no <title>")
    if name not in NOT_INDEXED and 'name="description"' not in html:
        problems.append(f"{page}: no meta description")
    if name not in NOT_INDEXED and 'rel="canonical"' not in html:
        problems.append(f"{page}: no canonical URL")

listed = set()
for sitemap in ["sitemap.xml"] + glob.glob("*/sitemap.xml"):
    for loc in re.findall(r"<loc>([^<]+)</loc>", open(sitemap, encoding="utf-8").read()):
        f = url_to_file(loc)
        if f is None or not f.endswith(".html"):
            continue
        listed.add(os.path.normpath(f))
        if not os.path.exists(f):
            problems.append(f"{sitemap}: {loc} has no file ({f})")

for page in page_files():
    html = open(page, encoding="utf-8").read()
    if os.path.basename(page) in NOT_INDEXED or "noindex" in html:
        continue
    if os.path.normpath(page) not in listed:
        problems.append(f"{page}: indexable but in no sitemap")

for site in SITES:
    stamps = {}
    for page in glob.glob(f"{site}/*.html"):
        for asset, v in re.findall(r'(?:href|src)="([^"]+\.(?:css|js))\?v=([^"]+)"', open(page, encoding="utf-8").read()):
            stamps.setdefault(v, set()).add(page)
    if len(stamps) > 1:
        detail = ", ".join(f"v={v} on {len(p)} page(s)" for v, p in sorted(stamps.items()))
        problems.append(f"{site}: mixed asset versions ({detail})")

if problems:
    print("\n".join(problems))
    print(f"\n{len(problems)} problem(s).")
    sys.exit(1)
print("All pages, links, sitemaps and asset versions check out.")
