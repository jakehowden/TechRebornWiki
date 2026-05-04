# Phase 21 — Per-item pages: world-obtained / uncraftable items

> **Read [`CONTEXT.md`](./CONTEXT.md) first.**

## Goal

Phase 20 covers items with at least one extractable recipe. There are still ~160 items in `src/data/items.json` that have **no** producer recipe — they're obtained from world generation, mob drops, or as terminal end-of-chain products. These items still need pages so the navigation chain stays unbroken when a user clicks `<ItemRef id="techreborn:peridot"/>` from a related page.

Examples in scope:
- Gems mined from world (peridot, sapphire, red_garnet, yellow_garnet)
- Raw ores (`techreborn:tin_ore`, `lead_ore`, … ~26 entries)
- `techreborn:scrap`, `techreborn:scrap_box`
- `techreborn:uu_matter`
- `techreborn:machine_parts`
- Heating coils (`cupronickel_heating_coil`, `kanthal_heating_coil`, `nichrome_heating_coil`) — verify whether these have crafting recipes; some may belong in Phase 20
- Various mod drops and uncategorised items without recipes

The page template differs from Phase 20: the lead section is `## How to obtain` (world / drop / processing-chain product) rather than `## Recipes`. `## Used in` remains.

## Prerequisites

- Phase 20 complete.
- `src/data/items.json`, `src/data/recipes.json`, `src/data/tags.json` populated.

## Steps

1. **Add a generator path** alongside the existing one in `scripts/generate-item-pages.mjs` (or a sibling `scripts/generate-world-item-pages.mjs`, whichever keeps the file readable). Selection criterion:
   - Items with **zero** recipes producing them (`recipesThatProduce(itemId).length === 0`)
   - AND with category in `{gem, ore, raw_metal, part, item, block}` (excluding categories handled in Phase 20 if they had recipes)
   - AND not already covered by an existing hand-authored page

2. **Page template:**
   ```mdx
   ---
   title: <Display Name>
   description: <Display Name> in Tech Reborn
   sidebar_label: <Display Name>
   ---

   <ItemHeader id="<id>" />

   # <Display Name>

   <one-line derived description — see step 3>

   ## How to obtain

   <!-- VERIFY: where does this come from? mob drop, ore vein, end-of-chain processing? -->

   {/* Conservative default text per category — never invent. */}

   ## Used in

   <bulleted list of <ItemRef> for items this produces (capped at 10 + "…and N more")>

   ## See also

   - [<Family group page>](../<family>)
   ```

3. **One-line description hints by category.** These are *defaults* — never invent specifics. If unsure, leave a `<!-- VERIFY -->` and use a generic stub.
   - `gem`: "**X** is a gemstone obtained from world generation. Process via the Industrial Grinder for dust."
   - `ore`: "**X** is an ore block. Mine and process via the Industrial Grinder (boosted yield) or Furnace (1× ingot)."
   - `raw_metal`: "**X** drops from mining the corresponding ore. Process via Furnace (1×) or Industrial Blast Furnace (2×)."
   - `scrap` / `scrap_box`: "**Scrap** is a Recycler output. Combine 9 scrap into a Scrap Box, then run through the Scrapboxinator for random items."
   - `uu_matter`: "**UU-Matter** is a Matter Fabricator output, used as a universal crafting material."
   - `machine_parts`: "**Machine Parts** are a recycler-style component used in machine crafting recipes. <!-- VERIFY: source -->"
   - heating coils: "**X Heating Coil** is required by the Industrial Blast Furnace to reach a minimum heat threshold. <!-- VERIFY: confirm crafting recipe path -->"
   - Catch-all `item` / `block`: "**X** is an item in Tech Reborn. <!-- VERIFY: source and purpose -->"

4. **Never invent.** If the source can't be verified from `recipes.json` or upstream content, leave `<!-- VERIFY -->` and surface the count in the report.

5. **`itemsProducedUsing(itemId)` already gives "Used in"** — reuse the helper from Phase 16's generator. Cap at 10 entries with a "…and N more" footer.

6. **Mirror to `versioned_docs/version-1.20.1/`** as Phase 20 does.

7. **Drop a `_category_.json`** in any new folder.

8. **Skip if file exists** — never overwrite hand-authored content.

9. **Re-run** `npm run build-items-with-pages` to refresh `docs/items-with-pages.json`.

10. **Manual sanity pass.** Pick 5–10 high-traffic items (peridot, sapphire, scrap_box, uu_matter, raw_tin) and **upgrade them from stub to real content** — replace the `<!-- VERIFY -->` with a verified sentence, drawing from `../TechReborn` source or `../TechReborn-Wiki-Upstream/docs/`. This is part of this phase, not deferred.

11. **Run `npm run build`** with `onBrokenLinks: "throw"` and fix any warnings.

## Verification

- [ ] All ~160 stub pages created (counts logged per category).
- [ ] `npm run build` passes.
- [ ] Spot-check 10 random pages: hero renders, "Used in" non-empty for items that *are* ingredients (most of them).
- [ ] `scripts/audit-coverage.mjs` reports near-zero items without pages.
- [ ] 5–10 high-traffic items have real "How to obtain" prose, not a `<!-- VERIFY -->`.
- [ ] Total `<!-- VERIFY -->` count surfaced in the report.

## Commit message

```
Phase 21: per-item pages for world-obtained and uncraftable items
```

Body: page counts per category, list of items hand-upgraded in step 10, total VERIFY count remaining.

## Workflow on completion

1. `git mv plans/phase-21-per-item-pages-world.md plans/done/phase-21-per-item-pages-world.md`
2. `git add -A`
3. `git commit -m "Phase 21: …"`
4. `git push origin main`
5. Report: stubs vs hand-authored pages, VERIFY count, any items intentionally skipped (e.g. items that should always link to upstream Minecraft Wiki).

## On failure

- A category turns out to be entirely empty after filtering → fine; just don't generate the empty folder. Note in report.
- A "world-obtained" item turns out to *have* a recipe that the Phase 20 pass missed → move it into Phase 20's bucket and regenerate. Cleaner than authoring two competing pages.
- The catch-all `item` / `block` page count balloons → keep it; the sidebar `_category_.json` collapses default. Consider adding a "Misc" splash page that lists the children with brief descriptions for discovery.
- Manual sanity-pass content can't be verified from sources → leave the VERIFY in place and call it out in the report. Don't invent.
