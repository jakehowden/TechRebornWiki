# Phase 15 — Recipe collapsibles by output family

> **Read [`CONTEXT.md`](./CONTEXT.md) first.**

## Goal

When a single machine page has many recipes (e.g. industrial blast furnace's dozens of bronze/steel/silver/iron variants), today's `<MachineRecipeList>` renders a flat scroll of `<details>` elements — readable but exhausting. Group recipes by their **output item family** so similar variants nest under one parent collapsible. Modeled on upstream's `generate.js` `_from`-grouping heuristic.

## Prerequisites

- Phases 0–8 complete.
- `src/components/MachineRecipeList/index.tsx` exists.
- `src/data/recipes.json` populated with recipe records keyed by id.
- `src/data/items.json` for displayName lookup.

## Steps

1. **Inspect current behavior** by visiting a machine page with many recipes, e.g. `/docs/processing/mv-machines/industrial-blast-furnace` (or whichever one has the most variants in our data). Record the count and visual baseline (screenshot).

2. **Update `src/components/MachineRecipeList/index.tsx`:**
   - After filtering recipes by `recipe.type === targetType`, group them by **output family key**:
     - Compute the primary output id (`recipe.outputs?.[0]?.id || recipe.output?.id || recipe.output`).
     - Family key derivation, in order of preference:
       1. If the recipe id includes `_from`, use the prefix before `_from`.
       2. Else if the recipe id ends in `_2`, `_3`, etc. (single-digit suffix), strip it.
       3. Else use the primary output id (full namespaced).
   - Build a Map keyed by family → array of recipe ids.
   - **Single-item families** (key has one recipe) render flat — directly as a `<details>` with the recipe inside, same as today.
   - **Multi-item families** render as nested:
     ```tsx
     <details>
       <summary>
         <ItemIcon id={primaryOutputId} size={20}/>
         <span>{displayName(primaryOutputId)} ({n} variants)</span>
       </summary>
       <div>
         {recipes.map(r => (
           <details key={r.id}>
             <summary>{r.id.split('_from').pop() || r.id}</summary>
             <RecipeFromData id={r.id}/>
           </details>
         ))}
       </div>
     </details>
     ```
   - Sort families alphabetically by displayName. Within a family, sort recipes alphabetically by id.

3. **Improve summary labels.** Today's summary uses raw recipe id (`bronze_ingot_from_axe` etc). Replace with a humanized label:
   - Strip the family prefix and `_from_` → `"from axe"`, `"from chestplate"`, etc.
   - Title-case the result.
   - For non-`_from` variants, fall back to the recipe id minus the family prefix.

4. **Performance check.** With ~2,500 recipes total and the largest single page having ~80 recipes, render is cheap. Don't add memoization / virtualization unless a real perf issue surfaces.

5. **Persist `<details>` open/closed state across navigation** by using `name=` attribute (HTML grouping) keyed by `${machine}-${family}` so that opening a family on one visit doesn't auto-collapse on rerender. Optional polish — skip if it bloats this phase.

6. **Update component styles** at `src/components/MachineRecipeList/styles.module.css`:
   - Nested `<details>`: indent the inner ones (~1.5rem padding-left).
   - Summary: flexbox so icon + name + variant-count align on baseline.
   - Variant count badge: small grey pill.

7. **Add gallery example** in `docs/_dev/component-gallery.mdx`: a `<MachineRecipeList machine="industrial_blast_furnace"/>` showing nested groups. (No new entry needed if it's already there; update it.)

8. **Smoke-test all machine pages** that use `<MachineRecipeList>`. Browse them and verify nothing regressed visually:
   - `docs/processing/lv-machines/*.mdx`
   - `docs/processing/mv-machines/*.mdx`
   - `docs/processing/hv-machines/*.mdx`
   - `docs/multiblocks/*.mdx`
   Note any page where grouping looks weird and document it in the report.

## Verification

- [ ] `/docs/processing/mv-machines/industrial-blast-furnace` shows nested collapsibles for bronze/steel/iron/silver/etc. variants.
- [ ] Family with one recipe still renders flat (no double-nest).
- [ ] Summary labels read like "Bronze Ingot (8 variants)" not "bronze_ingot_from".
- [ ] No layout overflow on mobile.
- [ ] `npm run build` passes.
- [ ] `tsc --noEmit` clean.

## Commit message

```
Phase 15: group MachineRecipeList by output family with nested collapsibles
```

Body: largest before/after recipe counts per page, any pages where the grouping heuristic produced odd results.

## Workflow on completion

1. `git mv plans/phase-15-recipe-collapsibles.md plans/done/phase-15-recipe-collapsibles.md`
2. `git add -A`
3. `git commit -m "Phase 15: …"`
4. `git push origin main`
5. Report: side-by-side screenshot of the IBF page before/after.

## On failure

- Family-key heuristic mis-groups recipes (e.g. `iron_ingot_from_bars` and `iron_ingot_from_rails` end up under different families because the script matched `_2`) → tighten the heuristic order: only strip `_2`/`_3` suffix if it immediately follows a known family base.
- Recipes have no `_from` and no `_N` suffix and the primary output id collides across machines → key by output id PLUS the recipe id prefix to disambiguate. As long as it's reasonable, file outliers as P2 issues, don't block.
- Nested `<details>` accordion behavior breaks accessibility (focus order, screen reader) → keep it simple; the native HTML `<details>` is already accessible. Do not introduce a custom accordion component.
