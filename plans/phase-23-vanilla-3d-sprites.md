# Phase 23 — Vanilla 3D sprite sheet (port upstream `icon-32` system)

> **Read [`CONTEXT.md`](./CONTEXT.md) first.**

## Goal

Vanilla `minecraft:*` icons currently render as flat 2D PNGs from `static/img/vanilla/*.png`. The upstream Minecraft Wiki and TechReborn Wiki render them as isometric **3D pre-rendered** sprites using a single sprite sheet plus per-item CSS classes. The user-facing example is:

```html
<div class="icon-32 furnace" style="--n: 0.6666666666666666;"></div>
```

This phase ports that system. The sheet is MIT-licensed and exists locally at `../TechReborn-Wiki-Upstream/static/img/minecraft.png` (1.1 MB), with class definitions in `../TechReborn-Wiki-Upstream/src/css/minecraft.css` (~400 KB of CSS rules — one rule per item).

TR `techreborn:*` items continue to render as flat PNGs — upstream does the same. TR icons are mostly inherently 2D in the mod and aren't represented in upstream's sheet.

## Prerequisites

- Phases 0–19 complete.
- `../TechReborn-Wiki-Upstream/` cloned (per `CONTEXT.md` § Locked decision 8).
- `<ItemIcon>` and `<ItemHeader>` already render vanilla items via `<img>` — keep that path as fallback.

## Steps

### 1. Copy assets from upstream

From `../TechReborn-Wiki-Upstream/`:
- Copy `static/img/minecraft.png` → `static/img/minecraft.png` in this repo.
- Copy the per-item class CSS from `../TechReborn-Wiki-Upstream/src/css/minecraft.css` into a new file `src/css/minecraft-sprites.css`. Keep:
  - The leading `.icon-32 { background-image: url('/img/minecraft.png'); ... }` block — **but update the URL** to use Docusaurus's `baseUrl`-aware path. Either keep `/img/minecraft.png` and rely on the static directory served at the site root, or use a dynamic `useBaseUrl` import in JS-side rendering. Test which works given the wiki's `baseUrl: "/TechRebornWiki/"`.
  - Every per-class rule of the form `.<slug> { --n:1; --i:-X; --j:-Y; }`.
  - The `.icon-size-64`, `.icon-size-128` etc. helpers if they appear.
- Preserve the `1024px` × `3648px` background-size dimensions in the base rule — they're tied to the pixel layout of the sheet. Do not edit.

### 2. Wire the sprite CSS into the build

Add `@import './minecraft-sprites.css';` to the top of `src/css/minecraft.css` (or directly to `src/css/custom.css` if `minecraft.css` is the wrong layer for it). Verify the rules end up in the production CSS bundle.

If `/img/minecraft.png` resolves wrong because of `baseUrl`, change the `background-image` URL to a relative form that Docusaurus will rewrite. As a fallback, generate the rule in JS on the client side via `useBaseUrl`.

### 3. Build a sprite-coverage map

Write `scripts/build-vanilla-sprite-map.mjs` (~30 lines) that:
- Reads `src/css/minecraft-sprites.css`.
- Extracts class names matching `\.([a-z0-9-]+)\s*{` (skip the base `.icon-32` rule).
- Writes `src/data/vanilla-sprite-map.json` as `{ [slugWithHyphens]: true }` — e.g. `{ "furnace": true, "acacia-boat": true, ... }`.

This lets `<ItemIcon>` decide at render time whether to use the sprite path or fall back to `<img>`. Wire into `package.json`:

```json
"build-vanilla-sprite-map": "node scripts/build-vanilla-sprite-map.mjs"
```

Run it manually after copying the sprite CSS. Don't add to `prebuild` — it's a one-shot until the sheet changes.

### 4. Update `<ItemIcon>` (`src/components/ItemIcon/index.tsx`)

- Import `vanilla-sprite-map.json`.
- For `id` starting with `minecraft:`:
  - Convert `short` from `under_score` to `under-score` (replace `_` with `-`).
  - If the slug is in the sprite map, render the sprite div instead of `<img>`:
    ```tsx
    <div
      className={`icon-32 ${slug} ${className}`}
      style={{ '--n': 32 / size, width: size, height: size } as React.CSSProperties}
      title={displayName}
    />
    ```
  - Otherwise, fall through to the existing `<img>` path (the per-PNG fallback under `static/img/vanilla/`).
- Keep all link-resolution logic (`<Link to={link.to}>` wrapping) unchanged.
- TR `techreborn:*` items are unaffected.

### 5. Update `<ItemHeader>` (`src/components/ItemHeader/index.tsx`)

Hero usage. Same pattern:
- For a `minecraft:*` id present in the sprite map, render an `icon-32` div with `--n` derived from the requested hero size (e.g. `size=200` → `--n: 32/200`). Apply the float style as today.
- Otherwise, keep the `<img>` path.

Hand-authored pages that hero a vanilla item (most do not — hero is usually TR-side) should still render correctly. Add a quick test in `docs/_dev/component-gallery.mdx` if no production page exercises this path.

### 6. Update `NOTICE.md`

Edit the "Vanilla Minecraft textures" section:
- Note that `static/img/minecraft.png` is sourced from `TechReborn/Wiki` (MIT), which composited it from Mojang assets.
- Keep the existing `static/img/vanilla/*.png` block — those PNGs remain the fallback for any item not in the sheet.
- Add a one-liner about regeneration: copying from upstream is the regeneration mechanism for now.

### 7. Decision: keep individual vanilla PNGs?

**Recommended: keep them.** They're the fallback path. Total cost is ~6 MB. They also serve any hand-authored MDX that hard-codes `/img/vanilla/foo.png`.

If deletion is desired, do it as a *separate* commit after a stable period — this phase should not delete to keep blast radius small.

### 8. Visual parity check

`docs/_dev/component-gallery.mdx` exists per Phase 19. Add (or verify) a row that renders 5–10 representative vanilla items at sizes 16, 32, 48, 64. Confirm:
- Crisp rendering at all sizes (`image-rendering: pixelated` or upstream's `crisp-edges`).
- `--n` scaling math is correct (size / 32 = `--n` factor).
- Sprite items sit alongside `<img>`-rendered TR items without visual misalignment.

## Verification

- [ ] `npm run build` passes; CSS bundle increases by ~400 KB (acceptable; gzip cuts it heavily).
- [ ] On a page that renders `<ItemIcon id="minecraft:furnace" />`, the furnace renders as an isometric 3D sprite, not a flat PNG.
- [ ] Resizing (16 / 32 / 48 / 64) scales correctly via `--n`.
- [ ] Items not in the sprite map (rare modded edge cases or 1.20.1 additions) fall through to `<img>` without errors.
- [ ] No console warnings from `<ItemIcon>` about missing textures for items that previously worked.
- [ ] Tooltips and links still work — hover shows the display name; clicking navigates to the item page or external Minecraft Wiki.
- [ ] `docs/_dev/component-gallery.mdx` renders the new sprites alongside flat-PNG items without visual misalignment.

## Commit message

```
Phase 23: vanilla 3D sprite sheet via icon-32
```

Body: bytes added (PNG + CSS), sprite-map entry count, list of items that fell back to `<img>` (i.e. weren't in the sheet).

## Workflow on completion

1. `git mv plans/phase-23-vanilla-3d-sprites.md plans/done/phase-23-vanilla-3d-sprites.md`
2. `git add -A`
3. `git commit -m "Phase 23: …"`
4. `git push origin main`
5. Report: before/after screenshot of one page with vanilla blocks (e.g. solid-fuel-generator), sprite-map count.

## On failure

- `background-image: url('/img/minecraft.png')` 404s under `baseUrl: "/TechRebornWiki/"` — switch to a Docusaurus-rewritten path. Either use `useBaseUrl` in JS to construct a runtime style, or use `url('/TechRebornWiki/img/minecraft.png')` literally if base path is stable.
- Background-position math is off by sub-pixel and items render blurry — ensure `image-rendering: pixelated` (or `crisp-edges` per upstream) is set on the rendered class. Do not change the 32 cell size.
- `<ItemIcon>` link/tooltip logic breaks when switching from `<img>` to `<div>` — wrap the new div in the same `<Link>` ancestor; it's a presentation swap only.
- The sprite sheet's `1024 × 3648` dimensions don't match what's in upstream's CSS — use whatever upstream's CSS declares; never edit those constants.
- A vanilla id resolves to a slug that *should* be in the sheet but isn't (sprite map miss) — log it during the map build, then either accept the `<img>` fallback or hand-author a sprite class entry. Don't fail the build over it.
