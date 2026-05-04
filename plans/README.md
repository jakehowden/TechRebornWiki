# Phase Plans

This directory holds the per-phase work plans for the Tech Reborn Wiki build. Each `phase-NN-*.md` file is a complete brief for one phase, designed to be picked up by a separate agent (or future-you) without prior conversation context.

## How to use this directory

1. **List remaining phases**: anything in `plans/*.md` (excluding `README.md`, `CONTEXT.md`, and the `done/` subdirectory) is unfinished. Sort numerically and pick the lowest.
2. **Before starting**: read [`CONTEXT.md`](./CONTEXT.md) to absorb the project decisions, critical files, and the "never invent recipes" rule. Then read your phase file in full.
3. **Execute the phase's steps.** Use the verification block to confirm completion.
4. **On success, finalize the phase:**
   - `git mv plans/phase-NN-name.md plans/done/phase-NN-name.md`
   - `git add -A`
   - `git commit -m "Phase NN: <one-line summary>"` (use the commit message specified in the phase file)
   - `git push origin main`
5. **On failure or ambiguity**: do **not** move the file or commit. Stop and report. The "never invent recipes" rule from CONTEXT.md is non-negotiable — if you cannot verify a recipe from the TR source, ask the user.

## Phase index

| # | File | Goal | Depends on |
|---|---|---|---|
| 0 | [`done/phase-00-bootstrap.md`](./done/phase-00-bootstrap.md) | Repo, Docusaurus shell, GH Pages deploy | — |
| 1 | [`done/phase-01-data-pipeline.md`](./done/phase-01-data-pipeline.md) | Extract recipes/items/textures from TR source | Phase 0 |
| 2 | [`done/phase-02-components.md`](./done/phase-02-components.md) | MDX components for items + recipes | Phase 1 |
| 3 | [`done/phase-03-mechanics.md`](./done/phase-03-mechanics.md) | Mechanics explainers + getting-started guide | Phase 2 |
| 4 | [`done/phase-04-power-reference.md`](./done/phase-04-power-reference.md) | Generators, energy storage, cables pages | Phase 2 |
| 5 | [`done/phase-05-processing-reference.md`](./done/phase-05-processing-reference.md) | LV/MV/HV processing machine pages | Phase 2 |
| 6 | [`done/phase-06-remaining-reference.md`](./done/phase-06-remaining-reference.md) | Multiblocks, materials, tools, armor, storage, world | Phase 2 |
| 7 | [`done/phase-07-polish.md`](./done/phase-07-polish.md) | Search, SEO, mobile, version dropdown live | Phases 3–6 |
| 8 | [`done/phase-08-code-review.md`](./done/phase-08-code-review.md) | Independent audit, REVIEW.md, follow-up issues | Phase 7 |

### Upstream-parity phases (open)

Phases 9-19 close gaps surfaced by an audit against `../TechReborn-Wiki-Upstream`. Phases 10 and 11 are foundational components other phases depend on; the table records hard prerequisites only — phases without explicit deps can run in any order.

| # | File | Goal | Depends on |
|---|---|---|---|
| 9 | [`phase-09-contributor-docs.md`](./phase-09-contributor-docs.md) | `docs/contributing/` — component reference, authoring guide, data pipeline docs | Phase 8 |
| 10 | [`phase-10-itemref-inline.md`](./phase-10-itemref-inline.md) | `<ItemRef>` inline icon+name link component for prose | Phase 8 |
| 11 | [`phase-11-itemheader-hero.md`](./phase-11-itemheader-hero.md) | `<ItemHeader>` floated hero image + backfill across reference pages | Phase 8 |
| 12 | [`phase-12-tutorial-page.md`](./phase-12-tutorial-page.md) | `/tutorial` standalone getting-started page + navbar surface | Phase 10 (recommended) |
| 13 | [`phase-13-energy-primer.md`](./phase-13-energy-primer.md) | `/energy` consolidated power primer page | Phase 10 (recommended) |
| 14 | [`phase-14-migration-banner.md`](./phase-14-migration-banner.md) | Coverage-in-progress banner on intro + homepage | Phase 8 |
| 15 | [`phase-15-recipe-collapsibles.md`](./phase-15-recipe-collapsibles.md) | Group `MachineRecipeList` by output family with nested `<details>` | Phase 8 |
| 16 | [`phase-16-per-item-pages.md`](./phase-16-per-item-pages.md) | Per-item material pages (dusts, ingots, plates, …) — generator + ~205 pages | Phases 10, 11, 15 |
| 17 | [`phase-17-missing-blocks.md`](./phase-17-missing-blocks.md) | Per-block coverage: batteries, frames, casings, utilities, upgrades, transformers | Phases 10, 11 |
| 18 | [`phase-18-vanilla-spritesheet.md`](./phase-18-vanilla-spritesheet.md) | Optional sprite-sheet replacement for vanilla PNGs | Phase 8 |
| 19 | [`phase-19-footnotes.md`](./phase-19-footnotes.md) | Adopt markdown footnote convention; refactor selected pages | Phase 8 |

The master plan (with full rationale and all decisions) lives at `C:\Users\jakeh\.claude\plans\we-are-building-a-giggly-kurzweil.md` — these per-phase files are the operational extracts.
