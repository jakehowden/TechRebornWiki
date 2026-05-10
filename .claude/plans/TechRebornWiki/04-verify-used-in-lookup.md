# Phase 4: Verify "Used in" lookup for ingots

## Problem
`docs/materials/ingots/iridium_alloy_ingot.mdx` lists under "Used in":
- `techreborn:dark_ashes_dust`
- `techreborn:ender_eye_small_dust`

These look like upstream ingredients, not downstream uses. Likely a bug in `itemsProducedUsing` / `recipeUsesItem` in `scripts/generate-item-pages.mjs`.

## Change
File: `scripts/generate-item-pages.mjs`

1. Trace recipes in `src/data/recipes.json` that reference `techreborn:iridium_alloy_ingot`. Confirm whether it is genuinely an ingredient producing dark ashes / ender eye small dust, or whether the lookup is matching the wrong direction (e.g. confusing `outputs` with `ingredients`, or treating the output as an ingredient).
2. If genuine: leave as-is, mark phase done.
3. If bug: fix `recipeUsesItem` (line 70) and/or `itemsProducedUsing` so they only match real ingredient slots. Then re-run:
   ```
   node scripts/generate-item-pages.mjs
   ```

## Acceptance
- Iridium Alloy Ingot "Used in" list is correct (verified against `recipes.json`).
- No regressions in other ingots' "Used in" sections (compare `git diff` of regenerated `.mdx` files).

## Verify
```
node -e "const r=require('./src/data/recipes.json'); for (const [k,v] of Object.entries(r)) { const ings=[...(v.ingredients||[]),v.ingredient,...Object.values(v.key||{})].filter(Boolean); if (ings.some(i => (i.id||i)==='techreborn:iridium_alloy_ingot')) console.log(k, '->', v.outputs||v.output); }"
```
Output should match what the page lists.
