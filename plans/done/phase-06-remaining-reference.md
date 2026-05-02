# Phase 6 — Reference: Multiblocks, Materials, Tools, Armor, Storage, World

> **Read [`CONTEXT.md`](./CONTEXT.md) first.** Largest content phase. Recipes from data only.

## Goal

Cover every remaining content category: multiblocks (with structure data), materials (as category tables), tools, armor, storage units, world content. After this, every Tech Reborn item from `TRContent.java` is either on a per-item page or in a category-table page.

## Prerequisites

- Phases 0-5 complete.
- `<MultiblockShape>`, `<MachineStats>`, `<RecipeFromData>` working.
- `src/data/multiblocks.json` exists (was empty `{}` from Phase 1; this phase populates it).

## Sub-areas

This phase has six independent sub-areas. The agent may split into sub-commits but produces **one** phase plan move + push at the end.

### 6.1 Multiblocks (`docs/multiblocks/`)

Pages (verify presence in 1.20.1):
- `industrial-blast-furnace.mdx` (heat tiers, casing tiers, multiblock structure)
- `industrial-grinder.mdx`
- `industrial-centrifuge.mdx`
- `fusion-reactor.mdx` (control computer + coil ring)
- `nuclear-reactor.mdx` *(verify; TR may have removed in some versions)*
- `distillation-tower.mdx` *(if multiblock in 1.20.1)*

For each:
1. Read the corresponding `*BlockEntity.java` in `../TechReborn/src/main/java/techreborn/blockentity/machine/multiblock/`.
2. Find `writeMultiblock()` (or `writeStructure()`) and parse the calls (`fill`, `ring`, `setBlock`, etc.) into a layered grid.
3. Hand-author the result into `src/data/multiblocks.json`. Schema:
   ```json
   {
     "industrial_blast_furnace": {
       "layers": [
         [["casing","casing","casing"],["casing","controller","casing"],["casing","casing","casing"]],
         [["casing","casing","casing"],["casing","lava","casing"],["casing","casing","casing"]],
         [["casing","casing","casing"],["casing","lava","casing"],["casing","casing","casing"]],
         [["casing","casing","casing"],["casing","casing","casing"],["casing","casing","casing"]]
       ],
       "legend": {
         "casing": "techreborn:basic_machine_casing",
         "controller": "techreborn:industrial_blast_furnace",
         "lava": "minecraft:lava"
       },
       "heat_table": [
         { "casing": "techreborn:basic_machine_casing", "lava_layers": 0, "heat": 500 },
         { "casing": "techreborn:basic_machine_casing", "lava_layers": 2, "heat": 1000 },
         { "casing": "techreborn:advanced_machine_casing", "lava_layers": 2, "heat": 1700 },
         { "casing": "techreborn:industrial_machine_casing", "lava_layers": 2, "heat": 2000 }
       ]
     }
   }
   ```
4. Render with `<MultiblockShape data={multiblocksJson["industrial_blast_furnace"]} />`.
5. List recipes with `<MachineRecipeList machine="blast_furnace" />`.

> **Verify the heat formula and casing names against the actual Java source.** The example above is illustrative — TR's exact heat values may differ. Never invent.

### 6.2 Materials (`docs/materials/`)

Each is a **table page** covering all variants — not one page per ingot.

- `ingots.mdx` — every ingot (refined iron, steel, bronze, brass, invar, electrum, cupronickel, aluminum, titanium, iridium, tungsten, tungsten-steel, lead, silver, nickel, zinc, +others). Columns: icon, name, primary recipe (link or inline), primary use.
- `plates.mdx` — every plate.
- `dusts.mdx` — every dust (regular size).
- `small-dusts.mdx` — small dusts (1/4 unit).
- `nuggets.mdx`
- `gems.mdx` — ruby, sapphire, peridot, red garnet, yellow garnet.
- `raw-metals.mdx` — raw iridium, raw lead, raw silver, raw tin, raw tungsten, raw uranium.
- `cells.mdx` — empty cell + every fluid cell (water, lava, oil, hydrogen, lithium, etc.).
- `storage-blocks.mdx` — every metal storage block.

Plus dedicated pages for non-obvious crafting chains:
- `carbon-plate-chain.mdx` — coal dust → carbon fiber → carbon mesh → carbon plate.
- `mixed-metal-and-advanced-alloy.mdx` — mixed metal ingot (crafting) → smelt → advanced alloy ingot → compress → advanced alloy plate.
- `iridium-alloy.mdx` — implosion compressor recipe.

### 6.3 Tools (`docs/tools-armor/tools/`)

Verify each in `TRContent.java#Tool` (or wherever tools live).

- `treetap.mdx`, `wrench.mdx`, `painting-tool.mdx`, `omni-tool.mdx`
- `basic-drill.mdx`, `advanced-drill.mdx`, `industrial-drill.mdx`
- `basic-chainsaw.mdx`, `advanced-chainsaw.mdx`, `industrial-chainsaw.mdx`
- `basic-jackhammer.mdx`, `advanced-jackhammer.mdx`, `industrial-jackhammer.mdx`
- `nano-saber.mdx` *(verify)*
- `frequency-transmitter.mdx`, `cloaking-device.mdx` *(verify)*

Page template per tool:
```mdx
<MachineStats power={...} buffer={...} tier="LV" />
<ItemIcon id="..." size={64} />

## Overview
<what it does, mining speed if applicable>

## Recipe
<RecipeFromData id="techreborn:crafting/<id>" />

## Charging
<which tier of energy storage charges it>

## Mining behavior *(drills/chainsaws/jackhammers only)*
<dimensions for jackhammer, what blocks for chainsaw>

## See also
```

### 6.4 Armor (`docs/tools-armor/armor/`)

- `nano-armor.mdx` — single page covering all 4 pieces in a table.
- `quantum-armor.mdx` — same.
- `lapotronic-orbpack.mdx` *(verify naming)* / `energy-flow-chestplate.mdx` *(verify)*.

Each piece's recipe rendered with `<RecipeFromData>`.

### 6.5 Storage units (`docs/storage/`)

- `storage-unit.mdx` — one page covering all 4 tiers (basic, advanced, industrial, quantum) + creative. Table with capacity per tier.
- `tank-unit.mdx` — same pattern for fluid storage.
- `quantum-chest.mdx`, `quantum-tank.mdx` *(verify presence — may be subsumed by storage-unit/tank-unit pages)*.

### 6.6 World (`docs/world/`)

- `ores.mdx` — single page with a table of all ore types (bauxite, galena, iridium, lead, pyrite, ruby, sapphire, silver, sodalite, sphalerite, tin, tungsten, cinnabar, sheldonite, peridot, +). Columns: ore icon, deepslate-variant icon, drops, Y-range (verify from world-gen JSON), biome restrictions.
- `rubber-tree.mdx` — appearance, where it spawns, sap mechanic, processing chain (link to Extractor in Phase 5).
- `fluids.mdx` — table of all 30+ fluids from `ModFluids.java`. Columns: name, source (cell, machine, world-gen), uses.

## Drafting workflow

Same rigor as Phase 4-5. Specifically for this phase:

- **Multiblocks:** read the Java source to extract structure data. Hand-author into `multiblocks.json`. The user must approve the IBF heat table before publishing — it's the most complex multiblock.
- **Material tables:** generate the table from a one-off Node script that reads `items.json` and groups by category. Don't hand-list 50 items.
- **World pages:** ore Y-ranges live in `../TechReborn/src/main/resources/data/techreborn/worldgen/`. Cite the source.

## Verification

- [ ] For each enum in `TRContent.java`, every entry is either on a per-item page or in a category-table page. Run the audit script: `node scripts/audit-coverage.mjs` (write this small script as part of the phase — reads enum entries and checks every item ID appears in at least one MDX file).
- [ ] `multiblocks.json` has at least the IBF entry; `<MultiblockShape>` renders it correctly.
- [ ] All `<MachineRecipeList>` calls in multiblock pages return non-empty results.
- [ ] `npm run build` succeeds.
- [ ] Spot-check 5 random pages for broken links.

## Commit message

```
Phase 06: reference pages for multiblocks, materials, tools, armor, storage, world
```

Body: count per sub-area, list of any items skipped (with reason), list of `<!-- VERIFY -->` left, list of multiblocks whose structure couldn't be confirmed.

## Workflow on completion

1. `git mv plans/phase-06-remaining-reference.md plans/done/phase-06-remaining-reference.md`
2. Commit + push.
3. Report.

## On failure

- An entire enum has zero coverage → the audit script will catch it; add the missing pages or a category-table entry.
- Multiblock structure too complex to hand-extract from Java → leave a `<!-- VERIFY: structure for <multiblock> -->` and ship a placeholder shape; surface in report. The user may need to look at the in-game JEI Show Structure view.
- A tool/armor item exists in 1.20.1 but is unfamiliar → check `TRContent.java`, look at the texture, ask user if behavior unclear. Don't invent.
