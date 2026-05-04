# Phase 17 — Per-block coverage for missing categories

> **Read [`CONTEXT.md`](./CONTEXT.md) first.**

## Goal

Close the block-coverage gap. Upstream covers blocks we currently skip entirely: batteries (as standalone pages), cables (some), frames, casings, miscellaneous machines, transformers, and various utility blocks. Add reference pages for each, **using extracted data** — never invent recipes or stats.

## Prerequisites

- Phases 0–8 complete.
- **Phase 11 (`<ItemHeader>`) merged.** Hero image is required.
- **Phase 10 (`<ItemRef>`) merged.** Inline links throughout.
- `src/data/blocks.json`, `src/data/items.json`, `src/data/recipes.json` populated.
- `static/img/blocks/` and `static/img/techreborn/` have textures for the blocks below.

## Scope

Cross-reference of upstream block pages we don't currently have, organized by destination.

### Batteries (new sidebar category: `docs/power/batteries/`)
- `mfe.mdx`
- `mfsu.mdx`
- `aesu.mdx` (Adjustable SU — already exists at `docs/power/storage/adjustable-su.mdx`? Verify and dedupe — keep the existing path, don't duplicate)
- `idsu.mdx` (Interdimensional SU — same dedupe check)
- `lesu.mdx` + `lesu_storage.mdx`
- `battery_box.mdx`
- `superconductor_upgrade.mdx`

These overlap heavily with `docs/power/storage/`. **First step: audit overlap and pick one canonical location.** Recommend keeping `docs/power/storage/` for the SU family, adding a new `docs/power/batteries/` only for items that don't fit (battery_box, MFE, MFSU as low-tier siblings of LV-SU/MV-SU). Decide and document.

### Frames (new: `docs/blocks/frames/`)
- `basic-machine-frame.mdx`
- `advanced-machine-frame.mdx`
- `industrial-machine-frame.mdx`

### Casings (new: `docs/blocks/casings/`)
- `standard-machine-casing.mdx`
- `advanced-machine-casing.mdx`
- `industrial-machine-casing.mdx`

### Miscellaneous (new: `docs/blocks/miscellaneous/`)
- `alarm.mdx`
- `basin.mdx`
- `fusion-coil.mdx`
- `industrial-chunkloader.mdx`
- `nuke.mdx`
- `player-detector.mdx`
- `storage-buffer.mdx`

### Utility machines (extend existing `docs/processing/lv-machines/` or new section)
Currently missing from our processing tree:
- `block-breaker.mdx`
- `block-placer.mdx`
- `charge-o-mat.mdx` (HV)
- `drain.mdx`
- `elevator.mdx`
- `fishing-station.mdx`
- `iron-alloy-furnace.mdx` (non-electric)
- `launchpad.mdx` (MV)
- `pump.mdx`
- `resin-basin.mdx` (non-electric)
- `greenhouse-controller.mdx`
- `scrapboxinator.mdx` (we have it — verify spelling matches our existing file)

### Machine upgrades (new: `docs/processing/upgrades/`)
- `overclocker-upgrade.mdx`
- `transformer-upgrade.mdx`
- `energy-storage-upgrade.mdx`
- An index page explaining how upgrades slot into machines.

### Transformers (new or extend `docs/power/cables/`)
We have `lv-transformer.mdx`, `mv-transformer.mdx`, `hv-transformer.mdx` (verified). Add:
- `ev-transformer.mdx`

## Steps

1. **Audit overlap.** Before generating anything, run:
   ```sh
   ls docs/power/storage/ docs/power/cables/ docs/processing/lv-machines/ docs/processing/mv-machines/ docs/processing/hv-machines/
   ```
   Cross-reference the scope list above. For each item:
   - Already exists with a canonical name → skip, do nothing.
   - Already exists under a different name → keep existing path, add a `_category_.json` redirect if needed, note in report.
   - Missing → generate.
   Record the full audit table in the report.

2. **Reuse the generator from phase 16,** generalizing `scripts/generate-item-pages.mjs` (or a sibling `generate-block-pages.mjs`) to handle blocks. Page template:

   ```mdx
   ---
   title: <Display Name>
   description: <one-line>
   sidebar_label: <Display Name>
   ---

   <ItemHeader id="techreborn:<id>" />

   **<Display Name>** is a <category-singular> in Tech Reborn. <derived description>.

   ## Stats {/* if applicable, e.g. machines, batteries */}

   <MachineStats power={…} buffer={…} tier="…"/>

   ## Recipe

   <RecipeFromData id="<recipe-id>" />

   ## Behavior {/* prose section, often hand-authored */}

   {/* For utility machines: explain what it does. For frames/casings: what they're used in. */}

   ## See also

   - <ItemRef id="<related-id>"/>
   ```

3. **Verify everything against TR source.** For each block:
   - Stats from `TechRebornConfig.java` or the block's class (`../TechReborn/src/main/java/techreborn/blocks/...`).
   - Recipe from `src/data/recipes.json` (already extracted from datagen — trust it).
   - Behavior prose: read the Java source for the block's `BlockEntity` to understand. Cite line ranges in the VERIFY comments if unclear.

4. **Hand-author behavior sections.** Generation can fill stats and recipes, but each block's "what does it do" section needs human writing. **Never invent** behavior. Concrete approach:
   - Frames/casings: short — "used as a multiblock component" with a list of multiblocks they're part of.
   - Batteries (MFE, MFSU): tier I/O, faces, GUI behavior.
   - Utility machines (block_breaker, fishing_station, launchpad): describe input, output, unique behavior. Cite the BlockEntity class name + line in a comment.
   - Miscellaneous (alarm, nuke, player_detector): brief flavor + practical use.
   - Upgrades: how they're applied, which machines accept them, stacking rules.

5. **Sidebar wiring.** Update `sidebars.ts`:
   - Add `cat("Frames & Casings", "blocks", [cat("Frames", "blocks/frames"), cat("Casings", "blocks/casings")])` (or merge under one).
   - Add `cat("Miscellaneous", "blocks/miscellaneous")` if pages exist.
   - Add `cat("Upgrades", "processing/upgrades")` to the Processing tree.
   - Confirm new utility machines land under their existing tier folders (LV/MV/HV).
   - Verify the sidebar still reads cleanly — large nests should `collapsed: true` by default.

6. **Cross-link from existing pages.**
   - `docs/power/storage/index.mdx` → mention batteries, link to new pages.
   - `docs/processing/lv-machines/index.mdx` → list block_breaker, block_placer, etc.
   - `docs/multiblocks/industrial-blast-furnace.mdx` → link to standard/advanced/industrial casings.
   - `docs/mechanics/multiblocks.mdx` → list frames + casings.

7. **Re-run coverage audit** (`scripts/audit-coverage.mjs`). Record before/after.

## Verification

- [ ] `npm run start` → spot-check 10 random new pages: hero, stats, recipe render correctly.
- [ ] Sidebar shows new categories without horizontal overflow.
- [ ] Cross-links from existing pages all resolve.
- [ ] `npm run build` passes with `onBrokenLinks: "throw"`.
- [ ] `<!-- VERIFY -->` comment count is documented in the report.
- [ ] Coverage audit shows a meaningful improvement.
- [ ] Mobile (375px): no layout breakage on new pages.

## Commit message

```
Phase 17: per-block coverage for batteries, frames, casings, utilities, upgrades, transformers
```

Body: page counts per category, deduped pages, audit before/after.

## Workflow on completion

1. `git mv plans/phase-17-missing-blocks.md plans/done/phase-17-missing-blocks.md`
2. `git add -A`
3. `git commit -m "Phase 17: …"`
4. `git push origin main`
5. Report: total pages added, sidebar screenshot, audit numbers.

## On failure

- A block has no recipe in `src/data/recipes.json` (e.g. fusion_coil obtained via multiblock) → omit the recipe section, document in behavior prose how it's obtained, file a P2 to verify extraction completeness.
- Stats unclear from source (some utility machines aren't in `TechRebornConfig.java`) → leave stats off the page, write "_Configuration values not yet documented — see [TechRebornConfig.java](https://github.com/TechReborn/TechReborn/blob/1.20.1/src/main/java/techreborn/config/TechRebornConfig.java)._" Add a VERIFY comment.
- Sidebar gets too tall → break out a "Building Blocks" parent category (frames + casings + miscellaneous) above the existing categories. Don't sacrifice browsability for shallow trees.
- Behavior prose is hard for blocks I can't test (no Minecraft setup) → write a one-line stub and a VERIFY comment with the relevant Java class + line range. Surface in report.
