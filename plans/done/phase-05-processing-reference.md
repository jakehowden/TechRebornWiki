# Phase 5 — Reference: Processing machines (LV/MV/HV)

> **Read [`CONTEXT.md`](./CONTEXT.md) first.** Heavy content phase. Recipes from data only.

## Goal

Every Tech Reborn processing machine has a reference page, and each page lists every recipe that machine accepts (via `<MachineRecipeList>`).

## Prerequisites

- Phases 0–2 complete. Phase 4 is independent (can run in parallel with this in principle, though sequencing simpler).
- `<MachineRecipeList>` component working.

## Pages to write

All under `docs/processing/`. Verify presence in 1.20.1's `TRContent.java#Machine` enum before authoring.

### LV (`docs/processing/lv/`)

- `compressor.mdx`
- `extractor.mdx`
- `grinder.mdx`
- `electric-furnace.mdx`
- `iron-furnace.mdx` *(may be a basic non-electric variant; verify)*
- `alloy-smelter.mdx`
- `recycler.mdx`
- `auto-crafting-table.mdx`
- `scrapboxinator.mdx`
- `solid-canning-machine.mdx`

### MV (`docs/processing/mv/`)

- `industrial-electrolyzer.mdx`
- `rolling-machine.mdx`
- `assembling-machine.mdx`
- `industrial-centrifuge.mdx`
- `industrial-grinder.mdx`
- `chemical-reactor.mdx`

### HV+ (`docs/processing/hv/`)

- `implosion-compressor.mdx`
- `distillation-tower.mdx`
- `fluid-replicator.mdx`
- `vacuum-freezer.mdx`
- `industrial-sawmill.mdx`
- `wire-mill.mdx`
- `matter-fabricator.mdx` *(verify presence + tier)*

## Per-page template (extends Phase 4)

```mdx
---
title: <Display Name>
description: <One-liner>
---

<MachineStats power={...} buffer={...} tier="LV" inputSlots={1} outputSlots={1} />

<ItemIcon id="techreborn:<id>" size={64} />

## Overview
<2-3 sentences>

## Recipe
<RecipeFromData id="techreborn:crafting/<id>" />

## Behavior
- Input: <one or more slots, fluid?>
- Output: <slots, byproducts?>
- Power: <input cap E/t> from <cable tier>
- Special: <e.g., upgrades supported, fluid input>

## Recipes accepted

<MachineRecipeList machine="compressor" />

## See also
- ...
```

The `## Recipes accepted` section is what makes this phase distinct from Phase 4. `<MachineRecipeList>` queries `recipes.json` for everything where `type === "techreborn:<machine>"` and renders each in a collapsed `<details>`.

## Drafting workflow

Same as Phase 4, plus:

- **Verify the machine type string matches `recipes.json`.** TR uses underscored type IDs like `techreborn:compressor`, `techreborn:industrial_grinder`. The `MachineRecipeList`'s `machine` prop must match exactly.
- **Cross-check recipe count** against the existing wiki's machine page (https://wiki.techreborn.ovh) and JEI if the user is in-game. Differences ≠ bugs (they may have stale data) but flag big mismatches.

## Verification

- [ ] Every machine in `TRContent.java#Machine` for 1.20.1 with category "processing" has either a page or a documented skip.
- [ ] `<MachineRecipeList machine="compressor" />` on the Compressor page shows >5 recipes (the basic plate set: copper, tin, iron, gold, lead, etc.).
- [ ] `<MachineRecipeList machine="blast_furnace" />` is **not** rendered here — that's a multiblock, lives in Phase 6.
- [ ] Spot-check the Industrial Grinder page: it should show fluid input + secondary output recipes (the "ore + water → 2 dust + chance of secondary" pattern). Verify against the source.
- [ ] `<MachineStats>` values match `TechRebornConfig.java` for the spot-checked pages.
- [ ] `npm run build` succeeds.

## Commit message

```
Phase 05: reference pages for all LV/MV/HV processing machines
```

Body: page count per tier, list of any machines skipped, list of `<!-- VERIFY -->` left.

## Workflow on completion

1. `git mv plans/phase-05-processing-reference.md plans/done/phase-05-processing-reference.md`
2. Commit + push.
3. Report.

## On failure

- `<MachineRecipeList>` returns zero recipes → machine type string mismatch. Check `recipes.json` for the actual `type` value used.
- Recipe count wildly different from what the existing wiki shows → could be a TR version difference, or could be a parse bug from Phase 1. Investigate; don't gloss over.
- Power values look wrong (e.g. 0 or absurdly high) → check the recipe's `power` field exists; TR sometimes specifies it on the recipe, sometimes inherits from machine config.
