# Phase 1 — Data extraction pipeline

> **Read [`CONTEXT.md`](./CONTEXT.md) first.** The "never invent recipes" rule starts mattering this phase — every recipe in the wiki traces back to data extracted here.

## Goal

Recipe JSON, item metadata, and item/block textures imported from the local TR source into the wiki repo. A reusable extraction script lives in the repo so re-running on a new TR release is one command.

## Prerequisites

- Phase 0 complete (live deploy at `https://jakehowden.github.io/TechRebornWiki/`).
- `../TechReborn` checked out (the user has it at `C:\Users\jakeh\Documents\GitHub\TechReborn\`).
- JDK 17+ available (TR builds need 17). Verify: `java --version`.
- Internet access for the upstream wiki clone.

## Steps

1. **Clone the upstream wiki as a read-only reference.** From the *parent* directory of the wiki repo:
   ```
   git clone https://github.com/TechReborn/Wiki ../TechReborn-Wiki-Upstream
   ```
   This is a sibling of `TechRebornWiki/`, not nested inside it. We never copy MDX from here; later phases read it for phrasing inspiration only.

2. **Switch the TR source to the 1.20.1 branch:**
   ```
   cd ../TechReborn
   git fetch
   git checkout 1.20.1
   git status   # confirm clean
   ```
   If the branch name is different (e.g. `1.20`), inspect `git branch -a` and pick the closest 1.20.1 branch. Document the choice in the script comments.

3. **Run the TR datagen.** From `../TechReborn`:
   ```
   ./gradlew runDatagen
   ```
   On Windows this is `.\gradlew.bat runDatagen`. If `runDatagen` isn't a task, inspect `build.gradle(.kts)` and `settings.gradle(.kts)` for tasks named `runData`, `generateData`, `runDataGen`, or any task referencing `net.minecraft.data` or `fabric-data-gen-api`. Pick the right one. Output goes to `../TechReborn/build/generated/data/techreborn/recipes/`.

4. **Write the extraction script** at `scripts/extract-tr-data.mjs` (Node ESM). It accepts `--tr-source` (default `../TechReborn`) and produces:
   - `static/img/items/<item_filename>.png` — copies of every PNG from `<TR>/src/main/resources/assets/techreborn/textures/item/**`. Flatten the directory tree; preserve filename. If two PNGs share a filename, log a warning and namespace by parent directory.
   - `static/img/blocks/<block_filename>.png` — same for `block/**`.
   - `static/img/vanilla/<item>.png` — bundled set of ~30 common vanilla items TR recipes reference. For Phase 1, hand-author the icon list (just the filenames you need); leave actual PNGs as a TODO. The script logs `MISSING VANILLA TEXTURE: <id>` for any vanilla referent without a bundled icon. Do **not** download vanilla textures from web sources — that's a licensing minefield. Bundle textures the user provides explicitly, or use a transparent placeholder + label.
   - `src/data/recipes.json` — consolidated map. Schema:
     ```json
     {
       "techreborn:crafting/insulated_copper_cable": {
         "type": "minecraft:crafting_shaped",
         "pattern": ["RRR", "III", "RRR"],
         "key": { "R": "techreborn:rubber", "I": "minecraft:copper_ingot" },
         "output": { "id": "techreborn:insulated_copper_cable", "count": 6 }
       },
       "techreborn:compressor/copper_plate": {
         "type": "techreborn:compressor",
         "ingredients": [{ "id": "minecraft:copper_ingot", "count": 1 }],
         "outputs": [{ "id": "techreborn:copper_plate", "count": 1 }],
         "power": 10,
         "time": 300
       },
       "techreborn:blast_furnace/steel_ingot": {
         "type": "techreborn:blast_furnace",
         "ingredients": [...],
         "outputs": [...],
         "power": 120,
         "time": 400,
         "heat": 1000
       }
     }
     ```
     The map key is `<namespace>:<recipe_type_short>/<output_id>` for uniqueness.
   - `src/data/items.json` — `{ "techreborn:copper_ingot": { "displayName": "Copper Ingot", "texture": "/img/items/copper_ingot.png", "category": "ingot" } }`. Display names come from `<TR>/src/main/resources/assets/techreborn/lang/en_us.json`. Texture paths use `baseUrl`-relative paths (Docusaurus prepends baseUrl at runtime). Category is inferred from the enum name in `TRContent.java` (Ingots → "ingot", Plates → "plate", etc.).
   - `src/data/multiblocks.json` — empty `{}` for now. Phase 6 hand-authors entries.

5. **Edge cases the script must handle:**
   - Recipes with `"tag"` ingredients (e.g. `"#c:copper_ingots"`) → preserve as `{ "tag": "..." }` and resolve to a representative item at render time, not extract time.
   - Recipes with multiple outputs (centrifuge, electrolyzer): preserve as an array.
   - Recipes referencing items from other mods (rare in TR but possible) → log warning, include in JSON anyway. Texture lookup falls back to a placeholder.
   - Some machine recipes have probability fields (`"chance"` or similar) on outputs → preserve.
   - Output `count` defaults to 1 if absent.

6. **Add the npm script** in `package.json`:
   ```
   "scripts": {
     "extract-data": "node scripts/extract-tr-data.mjs",
     "extract-data:dry": "node scripts/extract-tr-data.mjs --dry-run"
   }
   ```

7. **Run the extraction** (`npm run extract-data`). Verify counts in the script's summary output:
   - ~426 item PNGs copied
   - ~448 block PNGs copied
   - hundreds of recipes in `recipes.json` (expect 200+ machine recipes plus crafting recipes)
   - `items.json` entries for every item enum in `TRContent.java`

8. **Commit assets.** Add `static/img/items/`, `static/img/blocks/`, `static/img/vanilla/`, and `src/data/` to git — we want fast Docusaurus builds and reproducible content, so we commit the data. Check the diff size; if it's >50MB raise it for review before committing.

9. **Document the workflow** in `README.md` under a new "Updating TR data" section: how to bump the TR submodule/checkout, re-run datagen, re-run extract-data, verify the diff, commit. Include the gradle command and the expected counts so future runs can sanity-check.

## Verification

- [ ] `../TechReborn-Wiki-Upstream/` exists and `git -C ../TechReborn-Wiki-Upstream log -1` returns a recent commit.
- [ ] `../TechReborn` is on branch `1.20.1` (or the agreed equivalent if the exact name differs).
- [ ] `../TechReborn/build/generated/data/techreborn/recipes/` has files in it after datagen.
- [ ] `static/img/items/copper_ingot.png` exists and is a 16×16 PNG.
- [ ] `src/data/recipes.json` has the compressor recipe for `techreborn:copper_plate` with `power: 10` and `time: 300`. **Note:** if the actual values differ, that's the answer of record — update CONTEXT.md and the master plan, do not "fix" the data to match expectations.
- [ ] `src/data/recipes.json` has an IBF (`techreborn:blast_furnace`) recipe for `techreborn:steel_ingot` with a `heat` field present.
- [ ] `src/data/items.json` has display names for at least 90% of items (some may be missing from the lang file — those get `displayName` derived from the ID by snake-case-to-title-case as fallback).
- [ ] `npm run build` still succeeds with the new assets in place.

## Commit message

```
Phase 01: data extraction pipeline + initial TR 1.20.1 dataset
```

Body: gradle command used, counts of items/blocks/recipes extracted, total diff size, anything that fell back to a warning.

## Workflow on completion

1. `git mv plans/phase-01-data-pipeline.md plans/done/phase-01-data-pipeline.md`
2. `git add -A`
3. Commit + push as above.
4. Print report: counts, any warnings, anything skipped.

## On failure

Do **not** commit partial data.
- Gradle datagen fails → check Java version, check that the branch builds standalone (`./gradlew build` first as a smoke test).
- Output JSON malformed → the script's parser may need to handle a recipe type we didn't anticipate; iterate. Don't filter out recipes the script can't parse — log them and stop, ask the user.
- Diff size huge (>200MB) → likely picked up unintended files (build outputs, .git from upstream wiki). Audit the script's source paths.
