# Phase 2: Fix misleading ingot lead sentence

## Problem
`docs/materials/ingots/bronze_ingot.mdx:11` reads:
> Bronze Ingot is an ingot produced from Bronze Axe in the Industrial Blast Furnace.

`deriveIngotDescription` in `scripts/generate-item-pages.mjs:190` picks the first matching recipe; for bronze that's a tool-scrap recipe (axe/sword/armor → ingot), not the canonical production path.

## Change
File: `scripts/generate-item-pages.mjs`

1. In `deriveIngotDescription` (line 190), when selecting `best`, filter out recipes whose first ingredient short-id contains any token in `TOOL_ARMOR_PATTERNS` (already defined at line 449 — reuse it).
2. Among remaining candidates, prefer ingredients ending in `_dust` or matching the ingot's metal stem (e.g. `bronze_dust` for `bronze_ingot`).
3. Keep the existing priority order (`techreborn:blast_furnace` > `minecraft:smelting` > `techreborn:alloy_smelter`) within the filtered set.
4. Re-run:
   ```
   node scripts/generate-item-pages.mjs
   ```
   This regenerates `.mdx` files in both `docs/materials/ingots/` and `versioned_docs/version-1.20.1/materials/ingots/`.

## Acceptance
- `bronze_ingot.mdx` lead sentence references a dust or alloy ingredient, not a tool/armor piece.
- No ingot page mentions axe/sword/pickaxe/shovel/hoe/helmet/chestplate/leggings/boots in its lead sentence.
- `git diff` shows only lead-sentence changes; no structural changes to ingot pages.

## Verify
```
grep -E "produced from \*\*[A-Z][a-z]+ (Axe|Sword|Pickaxe|Shovel|Hoe|Helmet|Chestplate|Leggings|Boots)" docs/materials/ingots/ versioned_docs/version-1.20.1/materials/ingots/
```
Should return no matches.
