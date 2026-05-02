# Phase 4 — Reference: Power, Generators, Energy Storage, Cables

> **Read [`CONTEXT.md`](./CONTEXT.md) first.** This is the first heavy content phase. Every recipe via `<RecipeFromData>`. Every stat traced to source.

## Goal

Every power-related block in Tech Reborn 1.20.1 has a reference page. Generators produce energy; energy storage holds it; cables move it; transformers step voltages. After this phase, the entire `docs/power/` section is filled in.

## Prerequisites

- Phases 0–2 complete. Phase 3 helpful but not strictly required (forward-links from Phase 3 land here).
- `recipes.json`, `items.json`, all components live.
- `../TechReborn-Wiki-Upstream/docs/blocks/generators/` available for phrasing reference.

## Pages to write

All under `docs/power/`. Update `sidebars.ts` to register them.

### Generators (`docs/power/generators/`)

Verify each one exists in 1.20.1's `TRContent.java#Machine` enum before authoring. If a generator is named differently or absent in 1.20.1, update the page list and report.

- `solid-fuel-generator.mdx`
- `water-mill.mdx`
- `wind-mill.mdx`
- `solar-panel-basic.mdx`
- `solar-panel-advanced.mdx`
- `solar-panel-industrial.mdx`
- `solar-panel-ultimate.mdx`
- `solar-panel-quantum.mdx`
- `solar-panel-creative.mdx` *(verify; may be creative-only and worth noting)*
- `thermal-generator.mdx`
- `diesel-generator.mdx`
- `gas-turbine.mdx` *(verify presence)*
- `semi-fluid-generator.mdx`
- `plasma-generator.mdx` *(verify)*
- `lightning-rod.mdx`

### Energy storage (`docs/power/storage/`)

- `batbox.mdx` (LV — 40,000 E, 32 E/t I/O)
- `mfe.mdx` (MV — 4,000,000 E, 128 E/t I/O)
- `mfsu.mdx` (HV — 40,000,000 E, 512 E/t I/O)
- `aesu.mdx` *(EV — verify presence and stats)*
- `idsu.mdx` *(interdimensional — verify)*
- `lapotronic-energy-orb.mdx` *(verify)*

### Cables & transformers (`docs/power/cables/`)

- `tin-cable.mdx`, `copper-cable.mdx`, `gold-cable.mdx`, `hv-cable.mdx`, `glassfiber-cable.mdx`, `superconductor-cable.mdx`
- `lv-transformer.mdx`, `mv-transformer.mdx`, `hv-transformer.mdx`, `ev-transformer.mdx`

For cables, each page covers both insulated and uninsulated where both exist; use a `<Tabs>` block to toggle within the page. The bare/insulated distinction matters more than splitting into separate pages.

## Per-page template

```mdx
---
title: <Display Name from items.json>
description: <One-line description, < 160 chars>
sidebar_position: <numeric position within category>
---

<MachineStats {...defaults from TRContent / TechRebornConfig} />

<ItemIcon id="techreborn:<id>" size={64} />

## Overview
<2-3 sentences. What it does, when in progression you'd build it.>

## Recipe
<RecipeFromData id="techreborn:crafting/<id>" />

## Behavior
- Input: <details>
- Output: <details>
- Special: <e.g., higher tier accepts more>
- Configurable values: <list any from TechRebornConfig.java referencing this block>

## Tips *(optional, 1-3 bullets)*

## See also
- [Related item 1](../path)
- [Related item 2](../path)
```

Skip "Tips" section if you don't have a real tip. Don't invent flavor text.

## Drafting workflow per page

1. **Look up the block in `TRContent.java`** — confirm enum name, ID, and any associated tier.
2. **Look up the recipe in `recipes.json`** — get the exact recipe ID for `<RecipeFromData>`. If multiple recipes exist (a crafting recipe + an alternate), render both.
3. **Look up the stats**:
   - Power input cap: usually a constant in the block class or in `TechRebornConfig.java`. Search for the block name + "Power", "Input", "Capacity".
   - Energy buffer: same.
   - Tier: derived from cable compatibility.
4. **Open the upstream page** at `../TechReborn-Wiki-Upstream/docs/blocks/{generators,batteries,cables}/<file>.mdx` if it exists. Take note of phrasing; do not copy.
5. **Author the page using the template.**
6. **Cross-link**: any item the recipe uses gets a `<!-- TODO link: ... -->` if its page doesn't exist yet.

## Sidebar updates

After writing pages, update `sidebars.ts` to list them under their categories. Use `sidebar_position` in frontmatter to control intra-category order; group by tier where it matters (basic → advanced → industrial → ultimate → quantum for solar; LV → MV → HV → EV for storage).

## Verification

- [ ] Every generator/storage/cable in `TRContent.java` for 1.20.1 has either a page or an explicit "skipped because <reason>" entry in the phase report.
- [ ] No `<RecipeFromData>` returns "not found" — if one does, the recipe genuinely isn't in `recipes.json`; pause and investigate before authoring.
- [ ] `<MachineStats>` values match `TechRebornConfig.java` defaults — spot-check 5 pages.
- [ ] Sidebar shows all new pages under Power → Generators / Energy Storage / Cables & Transformers.
- [ ] `npm run build` succeeds; only warnings allowed are forward-link TODOs.
- [ ] Random spot-check: pick 3 pages, click every link, verify no 404s within Phase 4 content.

## Commit message

```
Phase 04: reference pages for generators, energy storage, cables
```

Body: page count, list of any items skipped (with reason), list of `<!-- VERIFY -->` comments left.

## Workflow on completion

1. `git mv plans/phase-04-power-reference.md plans/done/phase-04-power-reference.md`
2. Commit + push.
3. Report: page count, list of unresolved cross-links (Phase 7 will close them).

## On failure

- An item exists in `TRContent.java` but no recipe in `recipes.json` → the item is craft-table-shaped and the JSON Phase 1 generated may have a different key format than expected. Investigate the actual key by inspecting `recipes.json` keys — don't guess.
- Stats can't be found in `TechRebornConfig.java` → leave a `<!-- VERIFY: <stat> for <block> -->` and move on. Surface in report.
- An entire generator type doesn't exist in 1.20.1 → drop the page from the list; note in the report.
