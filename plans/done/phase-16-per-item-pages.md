# Phase 16 — Per-item material pages

> **Read [`CONTEXT.md`](./CONTEXT.md) first.**

## Goal

Today, `docs/materials/` covers material families with table-style group pages (12 pages total: dusts, ingots, plates, etc.). Upstream has **341 individual item pages** — every dust, nugget, plate, ingot, gem, fluid cell, small pile, and storage block has its own page. This makes every `<ItemIcon>` / `<ItemRef>` resolve to a real page instead of dead-ending.

This phase generates a **shell page per item** in the existing material families, programmatically, so coverage closes without requiring 300+ hand-authored pages.

**Scope is shell-quality, not full-quality.** Each generated page contains: hero header, one-line description, recipe(s) for this item, downstream uses. Not deep prose. Future passes can enrich the high-traffic ones.

## Prerequisites

- Phases 0–8 complete.
- **Phase 11 (`<ItemHeader>`) merged.** Hero image is a hard requirement for these pages.
- **Phase 10 (`<ItemRef>`) merged.** "See also" cross-links read better with it.
- **Phase 15 (recipe collapsibles) merged.** The recipe lists on these pages will be one or two entries each, but consistency.
- `src/data/items.json` and `src/data/recipes.json` populated.
- `static/img/techreborn/` has a texture for every item we'll generate.

## Scope (in order of priority)

| Family | Source location | Page count (approx) |
|---|---|---|
| Dusts | `items.json` entries with `category === "dust"` (or `id` matching `*_dust` pattern) | ~60 |
| Small piles | `id` matching `small_pile_of_*` | ~60 |
| Nuggets | `*_nugget` | ~25 |
| Ingots | `*_ingot` | ~25 |
| Plates | `*_plate` | ~35 |
| Gems | enum values from `TRContent.Gems` (or items with category `gem`) | ~6 |
| Fluid cells | `*_cell` | ~40 |
| Storage blocks | `*_storage_block` | ~30 |
| Parts | `category === "part"` (carbon fiber, heating coils, circuits, coolant cells, etc.) | ~30 |
| Raw metals | `raw_*` | ~3 |

**Pick a subset for this phase if total is overwhelming.** Recommended split:
- **Phase 16a (this phase):** dusts, small piles, ingots, nuggets, plates. ~205 pages.
- **Phase 16b (future):** gems, fluid cells, storage blocks, parts, raw metals. ~110 pages.
- File phase 16b as a follow-up plan if 16a goes well.

If the agent picking this up is comfortable with the full scope, do it all in one go. Otherwise, split.

## Steps

1. **Write a generator script** at `scripts/generate-item-pages.mjs` that:
   - Reads `src/data/items.json`.
   - Filters to the in-scope item ids per the table above.
   - For each item:
     - Determines target path under `docs/materials/<family>/<short-id>.mdx`. Family folders are: `dusts`, `small-piles`, `ingots`, `nuggets`, `plates` (kebab-case, matching our existing `materials/` style).
     - Skips if the file already exists (do not overwrite hand-authored pages).
     - Generates content from a template (see step 2).
   - Logs counts: created, skipped (exists), skipped (no texture).

2. **Page template:**
   ```mdx
   ---
   title: <Display Name>
   description: <Display Name> in Tech Reborn
   sidebar_label: <Display Name>
   ---

   <ItemHeader id="techreborn:<id>" />

   **<Display Name>** is a <family-singular> in Tech Reborn. <one-line context — see derivation below>.

   ## Recipes

   <MachineRecipeList machine="<machine>" /> {/* if there are exactly one or two crafting recipes producing this item, use <RecipeFromData id="..."/> directly */}

   ## Used in

   {/* List of recipes where this item appears as an input — see step 3 */}

   ## See also

   - [<Family group page>](/docs/materials/<family>)
   ```

   Adapt for each family — small piles, for example, are usually 4×→1 dust assemblies; ingots have multiple production paths.

3. **"Used in" derivation.**
   Scan `src/data/recipes.json` for any recipe that includes this item id in its `ingredients` or `input` array. Render a bulleted list of `<ItemRef id="<output-id>"/>` (one per recipe). Cap at 10 entries with a "see all" expander or omit excess.

4. **Description derivation** (one-line, no prose padding):
   - Dusts: "**Bauxite Dust** is a dust used to produce <ItemRef id="techreborn:aluminum_dust"/> in <ItemRef id="techreborn:industrial_electrolyzer"/>." (derive from a recipe lookup if possible — what does this dust electrolyze/smelt into?)
   - Small piles: "**Small Pile of Bauxite Dust** combines (4) into a <ItemRef id="techreborn:bauxite_dust"/> via the crafting table." (derive from the crafting recipe).
   - Nuggets/ingots/plates: "**Aluminum Plate** is a plate of <ItemRef id="techreborn:aluminum_ingot"/> made in the <ItemRef id="techreborn:compressor"/>." (derive from the compressor recipe).
   - **Never invent** a description. If derivation fails, leave a `<!-- VERIFY: write description for <id> -->` comment and use a generic stub like "**X** is an item in Tech Reborn." Surface VERIFY counts in the report.

5. **Sidebar autoload.** The existing `cat("Materials", "materials")` in `sidebars.ts` autogenerates children — just adding the files is enough. But the sidebar will balloon to ~200 entries. Wrap each family folder with a `_category_.json`:
   ```json
   {
     "label": "Dusts",
     "collapsed": true,
     "collapsible": true
   }
   ```
   Place at `docs/materials/dusts/_category_.json`, `…/small-piles/_category_.json`, etc. This keeps the materials sidebar entry collapsible and per-family collapsed by default.

6. **Update `docs/materials/dusts.mdx`** (and the equivalent group pages) to link to each individual item page via the existing dust list. Replace plain text item names with `<ItemRef id="…"/>` so each item links to its newly-generated page.

7. **Run audit script.** Re-run `scripts/audit-coverage.mjs` (or whatever its current path is). Record the before/after coverage delta in the report.

8. **Wire generator script into `package.json`:**
   ```json
   "generate-item-pages": "node scripts/generate-item-pages.mjs"
   ```
   Don't add to `prebuild` — generator runs are manual / on-demand. Document in `docs/contributing/data-pipeline.mdx` (added in phase 9 if merged).

## Verification

- [ ] `npm run generate-item-pages` runs cleanly, creating ~205 (or full ~315) new `.mdx` files.
- [ ] No existing files overwritten (check `git status` for unexpected modifications).
- [ ] Spot-check 10 random generated pages: hero image renders, recipe(s) display, "used in" list reasonable, `<ItemRef>` cross-links work.
- [ ] Sidebar shows "Materials" with per-family collapsibles; clicking expands.
- [ ] `npm run build` passes with `onBrokenLinks: "throw"`.
- [ ] Coverage audit reports a meaningful drop in unconvered items.
- [ ] No `<!-- VERIFY -->` count above 50 (if higher, recheck the description derivation logic).

## Commit message

```
Phase 16: per-item material pages (dusts, small piles, ingots, nuggets, plates)
```

(Or extend the title if doing the full scope.)

Body: page counts per family, before/after coverage audit numbers, VERIFY comment count.

## Workflow on completion

1. `git mv plans/phase-16-per-item-pages.md plans/done/phase-16-per-item-pages.md`
2. `git add -A`
3. `git commit -m "Phase 16: …"`
4. `git push origin main`
5. Report: total pages created, build size delta (probably significant), sidebar screenshot.

## On failure

- Generator creates pages with no recipes / no usages → that means our data is sparse for those items, not the script's fault. Generate the page anyway with the description and a `## Recipes` section showing "_No recipes found in extracted data._". File a P2 to check the extraction script.
- Sidebar balloons unmanageably even with `_category_.json` collapses → consider switching the materials sidebar entry to a hand-curated `cat("Materials", "materials", [/* explicit items */])` with grouped categories. Hand-curated wins over autogenerated when count is high.
- A texture is missing for an item we need to generate → skip that page, log the missing texture, file as a P2 batch (not 200 individual issues).
- Recipe id collisions (e.g. multiple recipes output `aluminum_ingot`) → that's expected; phase 15's collapsibles handle it via `<MachineRecipeList machine=…/>`. The per-item page is just the reverse-lookup view.
