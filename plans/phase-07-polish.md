# Phase 7 — Search, polish, multi-version scaffold

> **Read [`CONTEXT.md`](./CONTEXT.md) first.**

## Goal

Production-ready quality. Search works, mobile is good, version dropdown is real (even with one version), 404 page exists, broken-link checker strict, deploy is green and fast.

## Prerequisites

- Phases 0-6 complete. All content phases done.
- Live deploy currently green.

## Steps

1. **Install local search:**
   ```
   npm install @cmfcmf/docusaurus-search-local
   ```
   Configure in `docusaurus.config.ts` plugins:
   ```ts
   themes: [
     [require.resolve('@cmfcmf/docusaurus-search-local'), {
       indexDocs: true,
       indexBlog: false,
       indexPages: false,
       language: 'en',
     }],
   ],
   ```
   Restart `npm run start` and verify search bar appears in navbar.

2. **Create the 404 page** at `src/pages/404.tsx`:
   - Friendly message: "this page hasn't been written yet (or is here in a future MC version)".
   - Link to GitHub issues: "Spot a missing page? Open an issue."
   - Search bar prominent.
   - Use Docusaurus `Layout` component to inherit theme.

3. **SEO meta + OG image:**
   - In `docusaurus.config.ts` themeConfig: add `image: 'img/og.png'`, set `metadata` with description, keywords.
   - Generate `static/img/og.png` (1200×630). For now, a simple TR-orange background with "Tech Reborn Wiki" white text is fine. Hand-create with any image tool, or write a Node script using `sharp` to render.
   - Add `<meta>` tags via `themeConfig.metadata` for og:title, og:description, og:image.

4. **Broken-link checker — strict mode:**
   - In `docusaurus.config.ts`: change `onBrokenLinks: "warn"` → `onBrokenLinks: "throw"`.
   - Run `npm run build`. Fix every broken link reported. This catches the `<!-- TODO link: ... -->` placeholders from Phase 3-6.
   - When a link target doesn't exist (item not yet covered), either: create a stub page, or remove the link, or move the destination text into a non-link mention. Don't suppress the warning.

5. **Mobile audit:**
   - Open DevTools, set viewport to 375×667 (iPhone SE).
   - Walk every top-level category. Look for: horizontal scroll, overlapping content, unreadable tooltips on touch.
   - Fix component CSS as needed:
     - `<CraftingGrid>` may need `flex-direction: column` on the grid+output below 480px.
     - `<MachineRecipeList>` `<details>` should be tappable, not just clickable.
     - `<MultiblockShape>` layer selector must be touch-friendly.

6. **Lighthouse audit:**
   - Run on a content page (e.g., the Compressor) in Chrome DevTools → Lighthouse → Mobile.
   - Target: Performance ≥ 90, Accessibility ≥ 95, Best Practices ≥ 95, SEO ≥ 95.
   - Common fixes: image dimensions on `<ItemIcon>` (always set width/height), font-display: swap, lazy-load offscreen images.
   - Document the score in `README.md`.

7. **`CONTRIBUTING.md`:**
   - How to add a machine/item page (point at the templates from phase plans, now in `plans/done/`).
   - How to update recipe data (re-run extract pipeline).
   - The "never invent recipes" rule, repeated for contributors.
   - Style guide pointers from `CONTEXT.md`.
   - PR process: fork, branch, build clean, link to issue.

8. **Version dropdown — make it real for 1.20.1:**
   - Create the first versioned snapshot:
     ```
     npm run docusaurus docs:version 1.20.1
     ```
     This snapshots `docs/` → `versioned_docs/version-1.20.1/`. Now `docs/` becomes the "next" version.
   - Configure in `docusaurus.config.ts`:
     ```ts
     presets: [['classic', {
       docs: {
         lastVersion: '1.20.1',
         versions: {
           current: { label: 'Next (in development)', path: 'next', banner: 'unreleased' },
           '1.20.1': { label: '1.20.1', path: '1.20.1' },
         },
       },
     }]],
     ```
   - The dropdown now shows "1.20.1" (default) and "Next (in development)".
   - Future MC versions are added the same way (`docs:version 1.20.4`, `docs:version 1.19.2`, etc.) but only when content is ready.

9. **Update `TODO_QUARRY_REBORN.md`** with the concrete checklist:
   - **Pages to add:**
     - `docs/multiblocks/quarry.mdx` (or under a new `docs/quarry-reborn/` section if treating as separate mod-coverage)
     - Quarry block recipe + behavior
     - Quarry config options
     - Integration guide: connecting Quarry Reborn output to AE2/Refined Storage/vanilla chests
   - **Cross-links to add:**
     - `tools/advanced-drill.mdx` → mention quarry as alternative late-game mining
     - `multiblocks/industrial-blast-furnace.mdx` → mention IBF unlocks the quarry build
   - **Source:** github.com/TED-inc/FabricQuarry
   - **Note:** verify Quarry Reborn supports MC 1.20.1 before scoping; may require its own version selector strategy.

10. **`README.md` polish:**
    - Add badge: GH Action status (`![Build](https://github.com/jakehowden/TechRebornWiki/actions/workflows/deploy.yml/badge.svg)`).
    - Add deployed URL prominently.
    - Add a screenshot (take one of a polished page like the Compressor and commit to `static/img/screenshots/`).
    - Link to `CONTRIBUTING.md` and `plans/README.md`.
    - Lighthouse score line.

## Verification

- [ ] Search returns relevant results for: "compressor", "steel", "rubber tree", "carbon plate", "fusion".
- [ ] 404 page renders at `/TechRebornWiki/this-page-does-not-exist`.
- [ ] OG image returns 200 at `/TechRebornWiki/img/og.png`.
- [ ] Mobile (375px viewport): no horizontal scroll on any page; tap targets ≥ 44px.
- [ ] `npm run build` passes with `onBrokenLinks: "throw"`.
- [ ] Version dropdown shows 1.20.1 (default) and "Next" — `1.20.1/compressor` URL works.
- [ ] Lighthouse Performance ≥ 90 on a content page.
- [ ] Live deploy reflects all changes.

## Commit message

```
Phase 07: search, SEO, mobile polish, version dropdown live
```

Body: search plugin version, Lighthouse scores, broken-links fixed count, version snapshot taken.

## Workflow on completion

1. `git mv plans/phase-07-polish.md plans/done/phase-07-polish.md`
2. Commit + push.
3. Report: deploy URL, Lighthouse scores, search query examples that worked.

## On failure

- Local search plugin doesn't index versioned docs → check `indexVersions` option, may need explicit `versions: ['1.20.1']`.
- Broken-link errors are unfixable because the linked item is genuinely out of scope → remove the link, don't create a stub just to satisfy the checker.
- Lighthouse Performance < 90 → likely large images. Compress with `sharp` or `imagemin`. Item icons are 16×16 so this should be cheap; storage block textures may be larger.
