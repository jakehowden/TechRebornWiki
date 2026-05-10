# Phase 3: Collapse Mixed Metal Ingot variants

## Problem
`docs/materials/ingots/mixed_metal_ingot.mdx` (and the `versioned_docs/version-1.20.1/...` copy) inline ~30 `<RecipeFromData>` cards, each with its own header. Wall-of-cards UX even after Phase 1.

## Change

### A. Extend `MachineRecipeList` to filter by output
File: `src/components/MachineRecipeList/index.tsx`

1. Add optional prop `output?: string` to `MachineRecipeListProps`.
2. When `output` is set, filter `matchingKeys` to recipes whose primary output id (via existing `getPrimaryOutputId`) equals `output` (resolve tags via `tagsData` if needed — see `src/utils/itemFormatters.ts` `resolveTagId`).
3. Keep existing grouping/labeling untouched (`humanizeVariantLabel` already produces good labels like "Aluminum Invar Bronze").

### B. Replace recipe list on Mixed Metal Ingot pages
Files:
- `docs/materials/ingots/mixed_metal_ingot.mdx`
- `versioned_docs/version-1.20.1/materials/ingots/mixed_metal_ingot.mdx`

Replace lines 15–81 (all the `<RecipeFromData>` calls) with:
```mdx
<MachineRecipeList machine="minecraft:crafting_shaped" output="techreborn:mixed_metal_ingot" />
```

## Acceptance
- Mixed Metal Ingot page shows one collapsible group with N variants inside.
- Variant labels use ingredient names (e.g. "Aluminum Invar Bronze"), not recipe keys.
- No other pages affected — `MachineRecipeList` without `output` keeps current behavior.

## Verify
```
npm run start
```
Open `/docs/materials/ingots/mixed_metal_ingot`. Confirm single collapsible with all variants nested.
