# Phase 3 — Mechanics & foundational pages

> **Read [`CONTEXT.md`](./CONTEXT.md) first.** Especially the "never invent recipes" rule — every recipe rendered here must come from `<RecipeFromData>`.

## Goal

Foundational explainer pages for the core systems any reference page assumes the reader understands, plus one beginner guide. After this phase, content phases (4-6) can cross-link to "see [power tiers]" without writing it themselves.

## Prerequisites

- Phases 0–2 complete.
- Components registered globally; `<RecipeFromData>` works.
- Upstream wiki cloned at `../TechReborn-Wiki-Upstream` for phrasing reference.

## Pages to write

All in `docs/mechanics/` unless noted. Use the page template defined in Phase 4 (Overview, then specific sections per page).

### 1. `mechanics/power-tiers.mdx`

- Voltage tiers (LV/MV/HV/EV/IV) and their max E/t values.
- Cable max transfer per tier.
- What happens on overvoltage (machines explode by default — note configurability).
- Source of truth: `RcEnergyTier` in RebornCore, plus cable definitions in `TRContent.java` (the `Cables` enum, especially the `transferRate` field if exposed).
- Table format for tiers. Cite values as defaults.

### 2. `mechanics/cables-and-transformers.mdx`

- Insulated vs bare cables (loss in rain, shock damage).
- Rubber chain: rubber tree → treetap → sap → extractor → rubber. Cross-link the upcoming `world/rubber-tree.mdx` and `tools-armor/tools/treetap.mdx`.
- Insulated copper cable recipe — render with `<RecipeFromData id="techreborn:crafting/insulated_copper_cable" />` (verify exact key after Phase 1 runs).
- Transformers: when to step down (LV from MV, etc), per-tier recipes.

### 3. `mechanics/circuits.mdx`

- Electronic Circuit and Advanced Circuit recipes via `<RecipeFromData>`.
- List of machines that consume each — generated from a quick query against `recipes.json` looking for these as ingredients (the agent can run a one-off Node script during authoring; doesn't need to be a permanent component).

### 4. `mechanics/multiblocks.mdx`

- Generic intro: what a controller block is, how multiblocks scale heat/output.
- Casing tier system (basic / advanced / industrial — verify exact names from `TRContent.java`).
- IBF heat mechanic in particular: more lava + better casings = more heat = more recipes unlocked.
- "Use JEI's 'Show Structure' button" tip.
- Specific multiblocks (IBF, Industrial Grinder, etc.) get their own pages in Phase 6 — link forward.

### 5. `mechanics/fluids-and-cells.mdx`

- Empty Cell crafting (4 tin plates).
- How cells store fluid items vs how machines pipe fluids directly.
- Tank Units (covered in detail in Phase 6).
- Common fluids (lithium, hydrogen, oil) — link to the Phase 6 fluids index.

### 6. `mechanics/jei-integration.mdx`

- Short page: how to look up TR recipes in JEI, the "U" / "R" keybinds.
- "Show recipe" / "Show uses" buttons.
- Note that this wiki mirrors what JEI shows — JEI is the in-game source of truth.

### 7. `guides/getting-started.mdx`

> **Important:** this is a **general-purpose** guide, not the user's quarry-specific path.

Stop the guide at "you now have basic LV automation". Outline:
1. Find a rubber tree, build a treetap, harvest sap.
2. Smelt some iron in a vanilla furnace to get refined iron (TR-specific).
3. Build a Basic Machine Frame (8 refined iron).
4. Build a generator (solid fuel) and an electric furnace, link them with insulated copper cables.
5. Build an Extractor for rubber processing.
6. Build a Compressor and a Grinder for plates and dust.
7. Build an Alloy Smelter for bronze.
8. "What's next" pointer to MV machines (Phase 4-5 reference) and the IBF page (Phase 6).

Use `<RecipeFromData>` for every recipe shown. Cross-link mechanics pages.

## Drafting approach

For each page:

1. Read the corresponding upstream page in `../TechReborn-Wiki-Upstream/docs/` if it exists. Only for phrasing inspiration — re-author in our voice.
2. Check `TRContent.java` and relevant `*Config.java` for any values cited.
3. Use `<RecipeFromData>` for every recipe; never hand-type.
4. Cite stats as defaults: "32 E/t (configurable in `techreborn.cfg`)".
5. Internal links should resolve — Phase 4-6 pages don't exist yet, so use `<!-- TODO link: power/generators/solid-fuel-generator -->` placeholders that get filled in Phase 7 (broken-link checker will catch them).

## Verification

- [ ] All 7 pages render in dev (`npm run start`) without error.
- [ ] Every `<RecipeFromData>` lookup resolves (no "Recipe not found" placeholders left). If one doesn't resolve, the recipe wasn't in `recipes.json` from Phase 1 — stop and investigate, don't substitute.
- [ ] All 7 pages appear in the Mechanics or Guides sidebar category.
- [ ] `npm run build` clean (broken links from forward-references should be warnings only — flip to errors in Phase 7).
- [ ] Read each page top-to-bottom: facts cite source, no "I think" hedging, no recipe invented.

## Commit message

```
Phase 03: mechanics pages and beginner getting-started guide
```

Body: list pages added, any `<!-- VERIFY -->` comments left, any forward-link `<!-- TODO link: ... -->` placeholders.

## Workflow on completion

1. `git mv plans/phase-03-mechanics.md plans/done/phase-03-mechanics.md`
2. Commit + push.
3. Report: page URLs once deployed, count of forward-link TODOs (Phase 7 will resolve them).

## On failure

- A `<RecipeFromData>` lookup fails → the recipe ID format used in Phase 1's data may not match. Inspect `recipes.json`, find the correct ID, update the MDX. **Do not fall back to typing the recipe by hand.**
- A stat value can't be confirmed from source → leave a `<!-- VERIFY: <what> at <file:line> -->` comment and move on; surface in the report.
- Upstream wiki page doesn't exist for the topic → skip the inspiration step; author from TR source directly.
