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
| 0 | [`phase-00-bootstrap.md`](./phase-00-bootstrap.md) | Repo, Docusaurus shell, GH Pages deploy | — |
| 1 | [`phase-01-data-pipeline.md`](./phase-01-data-pipeline.md) | Extract recipes/items/textures from TR source | Phase 0 |
| 2 | [`phase-02-components.md`](./phase-02-components.md) | MDX components for items + recipes | Phase 1 |
| 3 | [`phase-03-mechanics.md`](./phase-03-mechanics.md) | Mechanics explainers + getting-started guide | Phase 2 |
| 4 | [`phase-04-power-reference.md`](./phase-04-power-reference.md) | Generators, energy storage, cables pages | Phase 2 |
| 5 | [`phase-05-processing-reference.md`](./phase-05-processing-reference.md) | LV/MV/HV processing machine pages | Phase 2 |
| 6 | [`phase-06-remaining-reference.md`](./phase-06-remaining-reference.md) | Multiblocks, materials, tools, armor, storage, world | Phase 2 |
| 7 | [`phase-07-polish.md`](./phase-07-polish.md) | Search, SEO, mobile, version dropdown live | Phases 3–6 |
| 8 | [`phase-08-code-review.md`](./phase-08-code-review.md) | Independent audit, REVIEW.md, follow-up issues | Phase 7 |

The master plan (with full rationale and all decisions) lives at `C:\Users\jakeh\.claude\plans\we-are-building-a-giggly-kurzweil.md` — these per-phase files are the operational extracts.
