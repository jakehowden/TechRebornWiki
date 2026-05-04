# Phase 20 — Per-item pages: craftable items beyond materials

> **Read [`CONTEXT.md`](./CONTEXT.md) first.**

## Goal

Phase 16 generated stub pages for the five core material families (dusts, small piles, ingots, nuggets, plates) — ~205 pages. But `src/data/items.json` has 653 items total and only 313 are mapped to pages in `docs/items-with-pages.json`. The 340 remaining items render as a clickable `<ItemRef>` or `<ItemIcon>` whose link resolves to a dead end (or, for `minecraft:*`, falls back to `minecraft.wiki`).

Of the 340 missing, ~185 have at least one extractable recipe in `src/data/recipes.json`. This phase extends the existing generator to cover those remaining craftable items: parts, gems, raw metals, storage blocks, cables, storage units / tank units, upgrades, and uncategorised TR items / blocks.

The goal is a clickable navigation experience — every item with a recipe should resolve to a real page. Page quality is **shell-level**, not deep prose; future phases can enrich the high-traffic ones.

## Prerequisites

- Phases 0–19 complete.
- `scripts/generate-item-pages.mjs` exists and works for the five existing families.
- `src/data/items.json` and `src/data/recipes.json` populated.
- `static/img/techreborn/` has textures for the items being generated (skip-with-warning if not).

## Scope

| Category in `items.json` | Approx. count missing & with ≥1 recipe | Suggested folder |
|---|---|---|
| `part` (circuits, carbon mesh, coolant cells) | ~30 | `docs/materials/parts/` |
| `gem` (refined gems with grinder/blast recipes) | ~3 | `docs/materials/gems-individual/` (existing `gems.mdx` is the group page) |
| `raw_metal` | ~3 | `docs/materials/raw-metals-individual/` |
| `storage_block` | ~30 | `docs/materials/storage-blocks-individual/` |
| `cable` | ~3 | `docs/power/cables/per-cable/` |
| `storage_unit` / `tank_unit` | ~10 | `docs/storage/units/` (or per the existing storage tree) |
| `upgrade` | ~5 | `docs/processing/upgrades/per-upgrade/` |
| `solar_panel` | (already mostly covered; verify) | n/a |
| Uncategorised `item` (frequency cassette, manuals, batteries, filled cells, …) | ~80 | `docs/items/` (catch-all) |
| Uncategorised `block` (lamps, alarm, etc.) | ~20 | `docs/blocks/misc-generated/` |

The "uncategorised" buckets are unavoidable — the data has many items without a finer category. Place them in a single catch-all folder per side (item / block) rather than inventing fake categories.

**Tools and armor are out of scope here** — they should remain hand-authored.

## Steps

1. **Extend `FAMILIES` in `scripts/generate-item-pages.mjs`** with one entry per row in the table above (excluding tools-armor and solar-panel). Each entry follows the existing shape:
   ```js
   {
     category: 'part',
     folder: 'parts',
     singular: 'part',
     label: 'Parts',
     deriveDesc: derivePartDescription,
   }
   ```

2. **Add description-derivation helpers** in the same file. Re-use the existing `recipesThatProduce(itemId)` and `itemsProducedUsing(itemId)` lookups — they're general:
   - `derivePartDescription`: prefer the assembling-machine recipe; fall back to crafting; fall back to compressor.
   - `deriveGemDescription`: gems usually have an industrial-grinder recipe (gem → dust); cite that.
   - `deriveRawMetalDescription`: cite the smelting / IBF recipe that consumes it.
   - `deriveStorageBlockDescription`: 9× ingot or 9× gem in a crafting table; prefer the shaped recipe ingredient name.
   - `deriveCableDescription`: cite the rolling-machine or crafting recipe.
   - `deriveStorageUnitDescription` / `deriveTankUnitDescription`: cite the assembling-machine or crafting recipe.
   - `deriveUpgradeDescription`: cite the assembling-machine recipe.
   - For the catch-all `item` and `block` buckets, fall back to a generic stub with `<!-- VERIFY: write description for <id> -->`.

3. **Reuse the existing template** (`generateMdx` in `generate-item-pages.mjs`). The shell page format is:
   ```mdx
   ---
   title: <Display Name>
   description: <Display Name> in Tech Reborn
   sidebar_label: <Display Name>
   ---

   <ItemHeader id="<id>" />

   # <Display Name>

   <derived description>

   ## Recipes

   <RecipeFromData id="..." /> (one per producer)

   ## Used in

   - <ItemRef id="..." /> (capped at 10, then "…and N more")

   ## See also

   - [<Family>](../<family>)
   ```

4. **Drop a `_category_.json`** in each new family folder so the sidebar stays collapsed by default:
   ```json
   { "label": "<Family>", "collapsed": true, "collapsible": true }
   ```

5. **Skip if the file exists** (the generator already does this — verify the existence check still applies before any new write path).

6. **Mirror to `versioned_docs/version-1.20.1/`** as the existing generator does (it walks both `docs/` and `versioned_docs/` already).

7. **Re-run the page index.** `npm run build-items-with-pages` regenerates `docs/items-with-pages.json` from MDX scans. Confirm the new pages register.

8. **Run `npm run build`** with `onBrokenLinks: "throw"`. Fix any new broken links — typical cause is `<ItemRef id="<tag>"/>` resolving to an id whose page now exists in a different folder than the link assumed.

## Verification

- [ ] `npm run generate-item-pages` runs cleanly; logs include counts per family.
- [ ] `git status` shows only new files + `_category_.json` + `items-with-pages.json` updates. No existing MDX overwritten.
- [ ] Spot-check 10 random new pages: hero renders, recipes section non-empty, "Used in" non-empty for ingredient items.
- [ ] `npm run build` passes.
- [ ] `<!-- VERIFY -->` count below 50 across the new pages; surface any higher counts in the report.
- [ ] `docs/items-with-pages.json` mapped count grows by ~185 (313 → ~498).

## Commit message

```
Phase 20: per-item pages for parts, gems, raw metals, storage blocks, cables, units, upgrades
```

Body: per-family page counts, before/after `items-with-pages.json` mapped count, VERIFY count.

## Workflow on completion

1. `git mv plans/phase-20-per-item-pages-craftable.md plans/done/phase-20-per-item-pages-craftable.md`
2. `git add -A`
3. `git commit -m "Phase 20: …"`
4. `git push origin main`
5. Report: pages created per family, VERIFY total, any items skipped due to missing texture.

## On failure

- Generator emits a page with empty "Recipes" — that's a data gap, not a script bug. Page still useful as a stub; surface in report.
- Sidebar overflows even with `_category_.json` collapses → consider hand-curating `sidebars.ts` with explicit children for the worst offenders. Avoid splitting a family into sub-buckets unless count > 50.
- Catch-all `item` / `block` buckets feel like a junk drawer → that's fine for shell coverage. Future phases can promote individual items into curated buckets.
- Broken-link error on build for a tag that resolves to an id outside the generated set → add the id to a sensible family or extend the catch-all bucket.
