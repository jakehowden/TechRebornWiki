# Phase 22 — Recipe UI for complex machines (fluids, heat, scrapbox, sawmill)

> **Read [`CONTEXT.md`](./CONTEXT.md) first.**

## Goal

The `<Machine>` component already supports multi-input / multi-output layouts via `TOOL_LAYOUTS`, but several machine recipes render confusingly today:

1. **Distillation Tower / Centrifuge fluid outputs** — outputs are all `techreborn:cell` items differentiated only by `nbt.fluid`. The current renderer shows three identical cell icons with no fluid label, so the user can't tell Diesel from Glyceryl.
2. **Industrial Sawmill** — missing from `TOOL_LAYOUTS`, falls through to a default 1-in / 1-out grid even though sawmill recipes have 2 outputs (planks + sawdust).
3. **Industrial Blast Furnace heat threshold** — currently rendered as `🔥 1700`. Heat is a *prerequisite* (the heating coil must meet this threshold), not an output stat. Wording matters.
4. **Scrapboxinator** — 279 individual recipes for the same input (`scrap_box`) flood `MachineRecipeList` and imply deterministic outputs. The output is actually random; the UI should communicate that.
5. **Fluid Replicator** — no recipes in current `recipes.json`. Either extraction is incomplete or the recipe type isn't preserved.
6. **Multi-output chance / probability** — TR's datagen may emit chance metadata that our extraction script drops. Investigate.

This phase touches `<Machine>`, `<RecipeFromData>`, `<MachineRecipeList>`, and (potentially) `scripts/extract-tr-data.mjs`. No new pages.

## Prerequisites

- Phases 0–19 complete.
- `src/data/recipes.json` populated; `npm run extract-data` available if regeneration needed.
- Familiarity with the `MachineSlot` / `MachineConfig` shape in `src/components/Machine/index.tsx`.

## Steps

### 1. Cell-with-fluid output rendering

When a slot is `techreborn:cell` with `nbt.fluid: "techreborn:diesel"` (or any fluid id), the user should see the cell icon **and** a small label naming the fluid.

- **`src/components/RecipeFromData/index.tsx`**: extend `outputToSlot` to read `out.nbt?.fluid` and pass it through:
  ```ts
  function outputToSlot(out: Ingredient | undefined): MachineSlot {
    if (!out) return { id: 'minecraft:air', qty: 1 };
    if (typeof out === 'string') return { id: out, qty: 1 };
    return {
      id: out.id ?? out.tag ?? 'minecraft:air',
      qty: out.count ?? 1,
      fluid: (out as any).nbt?.fluid,
    };
  }
  ```
- **`src/components/Machine/index.tsx`**: extend `MachineSlot` with `fluid?: string`. In the slot render, when `slot.fluid` is set:
  ```tsx
  <div className="slot" key={idx} data-quantity={item.qty ?? 1}>
    {item.id && item.id !== 'minecraft:air' && <ItemIcon id={item.id} size={32} />}
    {item.fluid && <span className="slot-label">{titleCase(shortId(item.fluid))}</span>}
  </div>
  ```
- **`src/css/custom.css`**: add a `.slot-label` rule:
  ```css
  .slot-label {
    position: absolute;
    bottom: -1.1em;
    left: 0;
    right: 0;
    text-align: center;
    font-size: 0.7rem;
    color: var(--ifm-color-emphasis-700);
    white-space: nowrap;
  }
  ```
  Adjust `.slot` to allow overflow if the absolute positioning bleeds out — or render the label inside the slot bottom band.

### 2. Industrial Sawmill layout

In `src/components/Machine/index.tsx` `TOOL_LAYOUTS`, add:

```ts
'techreborn:industrial_sawmill': { input: { '--cols': '1', '--rows': '1' }, output: { '--cols': '2', '--rows': '1' } },
```

Verify on the sawmill page (currently `docs/processing/hv-machines/industrial-sawmill.mdx` if it exists; create the page during this phase if absent — use `<MachineRecipeList machine="industrial_sawmill" />`).

### 3. Scrapboxinator random output

In `src/components/MachineRecipeList/index.tsx`, special-case `targetType === 'techreborn:scrapbox'`:

- Aggregate all 279 recipes into one summary view: "Random output (279 possibilities)" with a flat icon grid of all unique output ids inside.
- Skip the per-recipe `<details>` collapsibles for scrapbox specifically.

Pseudocode:
```ts
if (targetType === 'techreborn:scrapbox') {
  const possibilities = Array.from(new Set(matchingKeys.map(k => getPrimaryOutputId((recipesData as any)[k]))));
  return (
    <details>
      <summary>Random output ({possibilities.length} possibilities)</summary>
      <div className={styles.scrapboxGrid}>
        {possibilities.map(id => <ItemIcon key={id} id={id} size={32} />)}
      </div>
    </details>
  );
}
```

Add a `.scrapboxGrid` class with `display: flex; flex-wrap: wrap; gap: 4px;`.

### 4. Industrial Blast Furnace heat phrasing

In `src/components/Machine/index.tsx`, in the meta-info block, change:

```tsx
{config.meta.heat != null && (
  <div className="info-item">
    <span aria-label="Heat" role="img">🔥</span>
    <span>{config.meta.heat}</span>
  </div>
)}
```

to:

```tsx
{config.meta.heat != null && (
  <div className="info-item">
    <span aria-label="Heat" role="img">🔥</span>
    <span>Requires {config.meta.heat} K heat</span>
  </div>
)}
```

Order the meta items so heat appears **before** time/power, since heat is a hard prerequisite (you need a coil that meets the threshold, otherwise the recipe doesn't run at all).

### 5. Chance / probabilistic outputs

Investigate whether TR's datagen JSON includes chance / probability metadata. Sample a known probabilistic recipe (e.g. industrial_grinder secondary outputs) directly from `../TechReborn/build/generated/data/techreborn/recipes/` after a fresh `./gradlew runDatagen` run.

- If chance exists in the source JSON but not in `src/data/recipes.json`, update `scripts/extract-tr-data.mjs` to preserve it.
- Then in `RecipeFromData` / `Machine`, render a `xN @ Y%` overlay on each output slot (similar to the `data-quantity` attribute already used).
- If chance is **not** present in the source, document the limitation in the phase report. Don't invent percentages.

### 6. Fluid Replicator

`recipes.json` currently has zero `techreborn:fluid_replicator` entries. Run `npm run extract-data` (which calls `../TechReborn` datagen) and check whether they appear post-regeneration.

- If they do, re-run downstream scripts and verify the existing layout renders sensibly.
- If they don't, the recipe type may need explicit handling in `scripts/extract-tr-data.mjs`. Add it. If the source doesn't emit fluid_replicator recipes either, flag for upstream follow-up.

### 7. `<MachineRecipeList>` empty-state polish

Replace the current bare line `No recipes found for <code>...</code>.` with a helpful placeholder:

```tsx
return (
  <div className={styles.emptyList}>
    <p>No recipes were extracted for <code>{targetType}</code>. This may indicate:</p>
    <ul>
      <li>The machine has no datagen-emitted recipes (configured in-world, not in source).</li>
      <li>The extraction script needs an update for this recipe type.</li>
    </ul>
  </div>
);
```

Style `.emptyList` modestly.

## Verification

- [ ] `/processing/hv-machines/distillation-tower` (or wherever the page lives): each fluid output slot shows the contained fluid name.
- [ ] `/processing/hv-machines/industrial-sawmill`: 1-input / 2-output layout renders.
- [ ] `/processing/lv-machines/scrapboxinator` (or equivalent): random-output expander present, NOT 279 nested collapsibles.
- [ ] `/processing/hv-machines/industrial-blast-furnace`: heat shows as "Requires 1700 K heat" before time/power.
- [ ] `/processing/hv-machines/industrial-grinder`: secondary outputs show chance % if data supports it.
- [ ] `/processing/hv-machines/fluid-replicator`: either renders recipes (if extraction works) or shows the empty-state placeholder.
- [ ] `npm run build` passes; no console warnings about unsupported recipe types beyond the documented ones.
- [ ] `tsc --noEmit` clean.

## Commit message

```
Phase 22: recipe UI for fluids, heat, sawmill, scrapbox
```

Body: list of recipe types now rendered with extra meta (fluid labels, heat phrasing, sawmill layout, scrapbox aggregation), state of chance metadata, fluid_replicator status.

## Workflow on completion

1. `git mv plans/phase-22-complex-recipe-ui.md plans/done/phase-22-complex-recipe-ui.md`
2. `git add -A`
3. `git commit -m "Phase 22: …"`
4. `git push origin main`
5. Report: before/after screenshots of distillation-tower, scrapboxinator, industrial-blast-furnace.

## On failure

- Fluid label overflows the slot box → clip with `text-overflow: ellipsis` and add a `title` attribute for hover. The slot grid layout should not change shape.
- `nbt.fluid` is sometimes nested differently in real recipe data (e.g. `nbt.Fluid`, capital F) → check actual data and normalize in `outputToSlot`.
- Scrapbox aggregation accidentally hides recipes for *other* machines that share a fallback path → confirm the `targetType` check is exact-match before special-casing.
- IBF heat phrasing breaks because some recipes legitimately have `heat: 0` → guard with `config.meta.heat > 0` instead of `!= null`.
- Chance metadata not in datagen → document the limitation; don't simulate or guess. File a P2 to revisit if/when TR adds it.
