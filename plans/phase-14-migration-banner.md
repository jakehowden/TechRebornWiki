# Phase 14 — Wiki migration / coverage banner

> **Read [`CONTEXT.md`](./CONTEXT.md) first.**

## Goal

Set visitor expectations: this wiki is unofficial, actively under construction, and welcomes contributions. A small admonition banner at the top of `docs/intro.mdx` and the homepage hero — borrowed in spirit from upstream's "🚧 Wiki Migration in Progress" callout, adapted to our context (we're not migrating dokuwiki — we're building from scratch).

## Prerequisites

- Phases 0–8 complete.
- Repo public on GitHub at `jakehowden/TechRebornWiki`.
- `CONTRIBUTING.md` exists at repo root (it does — verified at audit).

## Steps

1. **Add a `:::info` admonition to `docs/intro.mdx`,** placed immediately after frontmatter, before the H1:
   ```mdx
   :::info[🛠️ Coverage in progress]

   This is an **unofficial** community wiki for Tech Reborn 1.20.1, currently being built out. Some items, blocks, and machines may not yet have dedicated pages — see the [GitHub issue tracker](https://github.com/jakehowden/TechRebornWiki/issues) or [open a PR](https://github.com/jakehowden/TechRebornWiki/blob/main/CONTRIBUTING.md). The official wiki is at [wiki.techreborn.ovh](https://wiki.techreborn.ovh/).

   :::
   ```

   Adjust wording — be honest, friendly, no emoji-soup. The link to the official upstream wiki is mandatory (NOTICE.md attributes them; the link is the polite acknowledgement).

2. **Add a smaller homepage banner** to `src/pages/index.tsx`. Insert a `<div>` between `<HomepageHeader />` and the feature cards `<main>`:
   ```tsx
   <div className={styles.coverageNotice}>
     Unofficial Tech Reborn 1.20.1 wiki — coverage in progress.{' '}
     <Link to="/docs/contributing">Contribute</Link> ·{' '}
     <a href="https://wiki.techreborn.ovh/">Official wiki</a>
   </div>
   ```
   Add `coverageNotice` styles to `src/pages/index.module.css`: small, centered, theme-aware (use `var(--ifm-color-emphasis-100)` background), 0.85em font, ~0.5rem vertical padding. Should NOT scream — it's a one-liner, not a banner.

3. **(Optional) Add to `src/pages/tutorial.mdx`** if phase 12 has merged: same `:::info` block at the top so first-time-tutorial readers also see it.

4. **Don't blast the banner across every page.** Resist the urge to put it on every doc page. Two surfaces (intro + homepage) are enough; a third (tutorial) only if phase 12 merged.

5. **Update `README.md` at repo root** to make the same point, in one line, near the top: "Unofficial community wiki for Tech Reborn 1.20.1. The official upstream is at wiki.techreborn.ovh." Keep `NOTICE.md`'s detailed attribution untouched.

## Verification

- [ ] `npm run start` → `/docs/intro` shows the info admonition, well-styled in both light and dark mode.
- [ ] Homepage shows the coverage notice; it does NOT push the feature cards below the fold on a 1280×800 viewport.
- [ ] All three external links resolve (issue tracker, CONTRIBUTING, official wiki).
- [ ] Mobile (375px): banner wraps cleanly, doesn't overflow.
- [ ] `npm run build` passes.

## Commit message

```
Phase 14: coverage-in-progress banners on intro + homepage
```

Body: which surfaces touched, README.md update.

## Workflow on completion

1. `git mv plans/phase-14-migration-banner.md plans/done/phase-14-migration-banner.md`
2. `git add -A`
3. `git commit -m "Phase 14: …"`
4. `git push origin main`
5. Report: screenshot of the homepage with the banner, screenshot of the intro page admonition.

## On failure

- Admonition rendering is broken because of MDX 3 syntax → use `:::info` (not `:::info[Title]` if Docusaurus version doesn't support it). Check `package.json` Docusaurus version.
- Banner pushes content below the fold on mobile → tighten padding to `0.25rem`, drop the second line.
- "Coverage in progress" feels off after a year of inactivity → that's a future-proofing concern, not this phase's. The wording is honest at time of authoring; future phases can revise or remove.
