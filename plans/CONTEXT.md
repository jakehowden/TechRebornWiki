# Shared Context (read before any phase)

## Project

A replacement for the official Tech Reborn wiki at https://wiki.techreborn.ovh — which is incomplete and hard to use. We're building a Docusaurus site at `jakehowden/TechRebornWiki`, deployed to `https://jakehowden.github.io/TechRebornWiki/`, focused on **Tech Reborn** for **Minecraft 1.20.1**, with the architecture wired for additional MC versions later.

**Quarry Reborn (a separate mod) is out of scope.** Maintain `TODO_QUARRY_REBORN.md` at repo root as a checklist for a future pass; do not author Quarry Reborn content in `docs/`.

The user's existing `QUARRY_PROGRESSION_GUIDE.md` was a personal note used only to calibrate tone. It will be deleted in Phase 0.

## Locked decisions (do not relitigate)

| # | Decision | Choice |
|---|---|---|
| 1 | Framework | Docusaurus 3.x (TypeScript template) |
| 2 | Versioning | Per-version site builds (URLs `/1.20.1/...`); only 1.20.1 authored, dropdown wired up. **Hybrid content model**: single source `docs/` + `<Tabs groupId="mc-version">` for differences. Snapshot to `versioned_docs/` only when versions diverge enough to warrant. |
| 3 | Scope | Reference (every machine/item) + mechanics explainers. Progression guides are user-driven follow-ups; only ship one beginner guide in MVP. Aim for parity with the existing wiki's 35 machine pages on day one. |
| 4 | Recipe display | Visual 3×3 HTML/CSS grid with real item icons. Custom `<CraftingGrid>`, `<MachineRecipe>`, `<ShapelessRecipe>`, `<ItemIcon>` MDX components. |
| 5 | Recipe data source | Build TR mod's datagen (`./gradlew runDatagen` in `../TechReborn` on branch `1.20.1`) → import generated JSON at extract time. Commit JSON to wiki repo. |
| 6 | Stats source | Parsed from `TRContent.java` + `TechRebornConfig.java` + recipe JSON at extract time. Stats labeled as defaults (server-configurable). |
| 7 | Sidebar org | **Functional**: Power, Processing, Tools & Armor, Materials, Storage, Multiblocks, World, Mechanics, Guides. Hand-curated `sidebars.ts`. |
| 8 | Upstream content reuse | Clone `github.com/TechReborn/Wiki` to `../TechReborn-Wiki-Upstream` as **read-only reference**. Do **not** copy MDX into our repo. Re-author using our components. Credit in `NOTICE.md`. |
| 9 | Theme | Dark mode default, TR-orange accent (~#E87B22), text-only logo. |
| 10 | Search | `@cmfcmf/docusaurus-search-local` (free, local index, version-aware). |
| 11 | Deploy | `jakehowden/TechRebornWiki` → `https://jakehowden.github.io/TechRebornWiki/`, `baseUrl: "/TechRebornWiki/"`, GH Action on push to `main`. |
| 12 | License | MIT + `NOTICE.md` crediting TechReborn/Wiki and the TechReborn mod. |
| 13 | Quarry Reborn | Out of scope. Maintain `TODO_QUARRY_REBORN.md` at repo root. |

## Critical rule — never invent a recipe

If a recipe, stat, or texture cannot be verified from `../TechReborn` source, you **must stop and ask the user** before authoring. Do not guess. Do not fall back on "the existing wiki says X" — verify against the actual mod source. When you defer something, leave a `<!-- VERIFY: <what to check> -->` HTML comment in the MDX and surface it in your phase report.

## Critical files

| Path | What's there |
|---|---|
| `../TechReborn/src/main/java/techreborn/init/TRContent.java` | Item & block registry — 19 enums covering ~650 items / ~200 blocks |
| `../TechReborn/src/datagen/groovy/techreborn/datagen/recipes/` | Recipe sources (Groovy DSL, 39 providers across `crafting/` and `machine/{compressor,blast_furnace,...}/`) |
| `../TechReborn/src/main/resources/assets/techreborn/textures/{item,block}/` | 874 PNGs, MIT-licensed, ready to copy |
| `../TechReborn/src/main/java/techreborn/blockentity/machine/multiblock/` | Multiblock structures (Java code via `MultiblockWriter` API) |
| `../TechReborn/src/main/java/techreborn/config/TechRebornConfig.java` | Default power/storage values |
| `../TechReborn/build/generated/data/techreborn/recipes/` | Created by `./gradlew runDatagen`, our extraction target |
| `../TechReborn-Wiki-Upstream/docs/` | Upstream wiki MDX (read-only reference, cloned in Phase 1) |

## Phase workflow (mandatory)

For every phase, the executing agent must:

1. Read this `CONTEXT.md` first.
2. Read the phase file (`plans/phase-NN-*.md`) in full.
3. Execute the phase's steps. **Never invent recipes** — stop and ask if uncertain.
4. Run the phase's verification block. If anything fails, stop and report — do **not** proceed to step 5.
5. Move the phase file: `git mv plans/phase-NN-name.md plans/done/phase-NN-name.md`
6. Stage everything: `git add -A`
7. Commit using the phase file's specified commit message.
8. Push: `git push origin main`
9. Print a short report: files changed, anything skipped, any `<!-- VERIFY -->` comments left.

The next agent picks up by listing `plans/*.md` (excluding `README.md`, `CONTEXT.md`, and `done/`), sorting numerically, and starting the lowest.

## Tone & writing style for content pages

- Direct, factual, low fluff. Like the QUARRY_PROGRESSION_GUIDE.md the user wrote — but general-purpose, not user-specific.
- Each item page: one-line description, stats block, recipe, behavior bullets, optional tips, "see also" links.
- Cite default values: "32 E/t (configurable)". Don't pretend defaults are immutable.
- Use `<RecipeFromData id="..." />` lookups instead of typing recipes by hand.
- Keep paragraphs short. Tables for variant lists. Code blocks for in-game commands only.
