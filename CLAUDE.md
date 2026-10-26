@AGENTS.md

## Notes for Claude Code

- **Pushing to `main` publishes the site.** Commit and push only when asked. When asked, push to
  `main` directly, as the history does; there are no pull requests here.
- Before committing, run `python3 tools/check-site.py`. Show the result if it fails.
- After editing a site, read that site's `README.md` once more and update it if a page, number,
  asset or rule changed.
- **Skills**
  - The `taste-skill` plugin is enabled only inside `waverider/` (`waverider/.claude/settings.json`).
    For the other sites, read its `SKILL.md` straight from
    `~/.claude/plugins/cache/taste-skill/taste-skill/2.1.5/skills/taste-skill/` and run its scripts
    from the site folder.
  - Use `ui-ux-pro-max` for accessibility and interaction checks only. Its style picks (glass,
    script fonts) clash with these sites.
- **Previewing**
  - `.claude/launch.json` defines a `site` server on port 8010 for the Browser pane.
  - When the pane is hidden it pauses animation, so scroll reveals and canvas toys look frozen.
    Use the taste inspector's headless screenshots, or a small script on its
    `scripts/lib/cdp.mjs`, to check motion and interaction.
- **Several sessions may work in this repo at once**, usually one per site.
  - Before committing, `git fetch` and check `git log origin/main`.
  - Stage only the site you changed (`git add <site>/`), never `git add -A` at the root.
- Media tools on this Mac: `ffmpeg` and `sips` for video and images, `swift <site>/tools/crop.swift`
  for top-left crops (sips ignores crop offsets).
