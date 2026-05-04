# Phase 11 — `<ItemHeader>` hero-image convention

> **Read [`CONTEXT.md`](./CONTEXT.md) first.**

## Goal

A consistent, right-floated hero image at the top of every block/item/multiblock page, using a new `<ItemHeader>` component. Establishes visual identity for reference pages and matches the upstream `<ItemImage>` pattern.

## Prerequisites

- Phases 0–8 complete.
- `static/img/techreborn/` and `static/img/blocks/` populated.
- `src/data/items.json` populated (used for displayName fallback for the alt attribute).

## Design decision

**Use a component, not a raw `<img>`,** so:
- We can centralize float/clear behavior (mobile collapses to non-floated).
- Alt text auto-derives from `items.json[id].displayName` if not provided.
- Texture path resolves the same way `<ItemIcon>` does (technically reusing the same util from phase 10).

Don't extend `<ItemIcon>` — header semantics differ (large, decorative, floated, no link).

## Steps

1. **Create `src/components/ItemHeader/index.tsx`:**
   ```tsx
   export interface ItemHeaderProps {
     id?: string;          // preferred: derive texture + alt from items.json
     file?: string;        // fallback: explicit filename under /img/techreborn/, no extension (matches upstream ItemImage)
     alt?: string;         // override
     size?: number;        // default 200
     float?: 'left' | 'right' | 'none'; // default 'right'
   }
   ```
   - If `id` given: resolve texture path the same way `ItemIcon` does (`techreborn:` → `/img/techreborn/<short>.png`, `minecraft:` → `/img/vanilla/<short>.png`).
   - If `file` given (legacy/escape hatch for non-standard paths): build `/img/techreborn/<file>.png`.
   - Alt text precedence: `alt` prop → `items.json[id].displayName` → titleCase of the short id → "Tech Reborn".
   - Render: `<img src=… alt=… width={size} class={styles.header} style={{ float }}>` plus an inline-styled clear-both spacer the consumer can append manually if needed.

2. **Add `src/components/ItemHeader/styles.module.css`:**
   - `.header { image-rendering: pixelated; margin: 0 0 1rem 1rem; max-width: 40%; }`
   - Below 768px viewport: float collapses to `none`, max-width becomes 100%, centered (matches mobile reading order).

3. **Register in `src/theme/MDXComponents.tsx`** alongside `ItemIcon`, `ItemRef`, etc.

4. **Auto-clear floats after the header.** Pages that follow with a short paragraph + table can have the table wrap awkwardly. Document in the contributor guide (and add a CSS rule on `.markdown` to set `clear: both` on `h2` elements after a floated `.header`):
   ```css
   .markdown h2 { clear: both; }
   ```
   Add this to `src/css/custom.css`. This matches Wikipedia / upstream behavior.

5. **Backfill existing pages** in this prioritized order. Use `<ItemHeader id="…"/>` immediately after frontmatter, before the H1 / first paragraph:
   - `docs/processing/lv-machines/*.mdx` (10 pages)
   - `docs/processing/mv-machines/*.mdx` (5 pages)
   - `docs/processing/hv-machines/*.mdx` (3 pages)
   - `docs/power/generators/*.mdx` (15 pages)
   - `docs/power/storage/*.mdx` (7 pages)
   - `docs/power/cables/*.mdx` (11 pages)
   - `docs/multiblocks/*.mdx` (9 pages)
   - `docs/storage/*.mdx` (3 pages)
   - `docs/tools-armor/**/*.mdx` (20 pages)
   - `docs/world/*.mdx` (4 pages)
   - `docs/materials/*.mdx` — only the existing 12 group pages; phase 16 handles per-item.

   For each page, use the page's own item id when available. If the page covers a category (e.g. `lv-machines/index.mdx`), pick a representative item or skip the header.

6. **Document in the contributor guide.** If Phase 9 has merged, add a "Hero image" section to `docs/contributing/authoring.mdx` with the rule: "Every reference page begins with `<ItemHeader id='…'/>` immediately after the frontmatter." If Phase 9 has not yet merged, leave a `<!-- VERIFY phase 9: document hero header convention -->` comment in `plans/done/phase-09-…md` (do NOT modify a done file — instead, add a TODO line to `CONTRIBUTING.md` at repo root).

7. **Add a gallery section** in `docs/_dev/component-gallery.mdx` showing `<ItemHeader>` with id, with file fallback, and on a narrow viewport.

## Verification

- [ ] `npm run start` → spot-check 5 pages from different categories: hero image renders, floats right, text wraps around it on desktop, full-width on mobile (<768px).
- [ ] No layout regressions on pages with tables directly after the H1 (`solar_panels.mdx` style — verify the H2 clear rule works).
- [ ] `<ItemHeader>` with bad id renders the missing-texture fallback (small `?` square at the requested size, no broken image icon).
- [ ] `npm run build` passes with `onBrokenLinks: "throw"`.
- [ ] `tsc --noEmit` clean.
- [ ] Lighthouse Accessibility ≥ 95 on a backfilled page (alt text matters).

## Commit message

```
Phase 11: ItemHeader component + backfill across reference pages
```

Body: count of pages backfilled per category, any pages skipped (and why).

## Workflow on completion

1. `git mv plans/phase-11-itemheader-hero.md plans/done/phase-11-itemheader-hero.md`
2. `git add -A`
3. `git commit -m "Phase 11: …"`
4. `git push origin main`
5. Report: total page count backfilled, screenshot of one before/after page if possible.

## On failure

- Float wraps badly on a specific page (table, list, etc.) → set `<ItemHeader … float="none"/>` on that page; don't fight the layout.
- Texture missing for an id you backfilled → file as a P2 issue, leave the `<ItemHeader>` in place (it falls back gracefully), do not block the phase on it.
- `clear: both` on `h2` breaks an unrelated page layout → scope the rule with a `.with-hero` class added by `<ItemHeader>` to its parent (or `body`), and apply the clear rule under that scope.
