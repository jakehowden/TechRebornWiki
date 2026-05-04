# Phase 18 — Vanilla sprite sheet (optional optimization)

> **Read [`CONTEXT.md`](./CONTEXT.md) first.**

## Goal

Replace the ~990 individual vanilla Minecraft texture PNGs at `static/img/vanilla/*.png` with a single sprite sheet (`static/img/minecraft.png`) plus generated CSS that positions each item's slice. Reduces file count, simplifies static asset hosting, matches upstream's approach.

**This phase is optional and labeled as such.** The current setup (one PNG per item) works fine and is conceptually simpler. Only run this phase if:
- The build artifact size or file count is causing actual deploy/CI friction.
- The user explicitly asks to align with upstream's sprite-sheet approach.

If neither condition holds, **skip this phase** — move it to `plans/done/` with a one-line report ("skipped — not needed at current scale").

## Prerequisites

- Phases 0–8 complete.
- `static/img/vanilla/` populated with ~990 PNGs.
- `scripts/extract-vanilla-textures.mjs` exists (it does — verified at audit).
- Image processing tooling: `sharp` library (add to devDependencies).

## Steps

1. **Decide whether to actually run this phase.** Read the goal above. If skipping:
   - Add a one-paragraph note at the top of this file: "Skipped on YYYY-MM-DD — current per-PNG approach has no operational issues."
   - Move directly to `plans/done/`.
   - Commit message: `Phase 18: skipped (not needed)`.
   - Stop.

2. **If proceeding:** add `sharp` to devDependencies:
   ```sh
   npm install --save-dev sharp
   ```

3. **Write `scripts/build-vanilla-spritesheet.mjs`:**
   - Reads every `*.png` from `static/img/vanilla/`.
   - Standardizes to 32×32 (vanilla items are 16×16, scale up 2× with nearest-neighbor for crispness, or keep 16×16 — match upstream which uses 32×32 logical with `--n` scaling).
   - Lays out in a grid; track each item's `(i, j)` cell coordinate by id.
   - Outputs:
     - `static/img/minecraft.png` (the composite sprite sheet)
     - `src/css/minecraft-sprites.css` (auto-generated, one CSS class per item, format below)
     - `src/data/vanilla-sprite-map.json` (id → `{ i, j }` lookup, for the component to read at build time)

   Example generated CSS class (matches upstream):
   ```css
   .acacia-boat {
     --i: -19;
     --j: -28;
   }
   ```
   Where `--i` and `--j` are the negated cell coordinates. The shared rule:
   ```css
   .icon-32 {
     background-image: url('/img/minecraft.png');
     image-rendering: pixelated;
     display: inline-block;
     height: calc(32px / var(--n));
     width: calc(32px / var(--n));
     background-position: calc(var(--j) / var(--n) * 32px) calc(var(--i) / var(--n) * 32px);
     background-size: calc(<grid-w-px> / var(--n)) calc(<grid-h-px> / var(--n));
     --n: 1;
   }
   ```
   Width/height of the sprite sheet must be parameterized into the rule (or hardcoded once after first generation).

4. **Update `<ItemIcon>` to use sprites for vanilla items:**
   - When `id` starts with `minecraft:` AND a sprite mapping exists in `vanilla-sprite-map.json`, render `<div class="icon-32 ${id-with-hyphens}" style="--n: ${32/size}">` instead of `<img>`.
   - When `id` starts with `techreborn:` or no sprite mapping found, keep the existing `<img src=…>` path.
   - Tooltip / link logic unchanged.

5. **Wire generation into the data pipeline.**
   ```json
   "vanilla-spritesheet": "node scripts/build-vanilla-spritesheet.mjs"
   ```
   Don't add to `prebuild` — sprite sheet only regenerates when vanilla textures change. Document in `docs/contributing/data-pipeline.mdx` (phase 9).

6. **Decision: keep individual PNGs or delete?**
   - **Recommended:** keep them. They're free as static files and serve as fallback for items not in the sprite sheet (new items added between regenerations).
   - If deleting: update `.gitignore` to exclude `static/img/vanilla/` and rely on the sprite sheet only. Document the trade-off in the report.

7. **Verify visual parity.** Open `/_dev/component-gallery` before/after — every vanilla item should render identically. Test multiple sizes (`size={16}`, `size={32}`, `size={48}`) to confirm `--n` scaling works.

## Verification

- [ ] `npm run vanilla-spritesheet` runs cleanly.
- [ ] `static/img/minecraft.png` exists, size reasonable (~few MB).
- [ ] `src/data/vanilla-sprite-map.json` exists and has ~990 entries.
- [ ] `<ItemIcon id="minecraft:redstone"/>` renders identically before/after (visual diff or screenshot comparison).
- [ ] Page weight on a heavy page (e.g. industrial blast furnace recipes) drops measurably (network tab, total bytes).
- [ ] `npm run build` passes.
- [ ] `tsc --noEmit` clean.

## Commit message

```
Phase 18: vanilla sprite sheet for ItemIcon
```

(Or `Phase 18: skipped (not needed)` if skipping.)

Body: bytes-saved estimate, before/after file counts in the build artifact.

## Workflow on completion

1. `git mv plans/phase-18-vanilla-spritesheet.md plans/done/phase-18-vanilla-spritesheet.md`
2. `git add -A`
3. `git commit -m "Phase 18: …"`
4. `git push origin main`
5. Report: bytes saved, any items that fell back to `<img>` (i.e. weren't in the sprite map).

## On failure

- Sprite sheet ends up huge (>10MB) → reduce per-cell size to 16×16 (logical), let `--n` upscale at render. Or split into multiple sheets by category (vanilla blocks vs items vs entities).
- Background-position math is off by sub-pixel and items render blurry → ensure `image-rendering: pixelated` is on the rendered class, and that all coordinates are integers (no fractional cells).
- `<ItemIcon>` link/tooltip logic breaks when switching from `<img>` to `<div>` → wrap the new div in the same `<Link>` / tooltip ancestors. The icon is just a presentation swap; everything around it stays.
- Decided to skip and forgot to move file → just do the move now, no rework.
