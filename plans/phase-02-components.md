# Phase 2 — React/MDX components

> **Read [`CONTEXT.md`](./CONTEXT.md) first.**

## Goal

Reusable React components for rendering items and recipes, registered globally so MDX content pages can use them with no per-file imports. A component-gallery page proves they work.

## Prerequisites

- Phases 0–1 complete.
- `src/data/items.json` and `src/data/recipes.json` populated.
- `static/img/items/` and `static/img/blocks/` populated.

## Components to build

All in `src/components/`, TypeScript. One folder per component with `index.tsx` + `styles.module.css`.

### 1. `<ItemIcon />`

```tsx
<ItemIcon id="techreborn:copper_ingot" size={32} />
```

- Renders the PNG referenced in `items.json[id].texture`.
- Tooltip on hover shows `displayName` from `items.json`.
- If a wiki page exists for this item (look up in a build-time generated `items-with-pages.json` from the docs/ tree), wraps in `<Link to="...">`.
- Falls back to a gray square with `?` if texture missing — and logs to the console in dev.
- Supports `size` prop (default 32). Must use `image-rendering: pixelated` for the Minecraft look.
- Accepts vanilla IDs too: `id="minecraft:redstone"` resolves via `static/img/vanilla/redstone.png`.

### 2. `<CraftingGrid />`

```tsx
<CraftingGrid
  pattern={["RRR", "III", "RRR"]}
  legend={{ R: "techreborn:rubber", I: "minecraft:copper_ingot" }}
  output={{ id: "techreborn:insulated_copper_cable", count: 6 }}
/>
```

- 3×3 grid of slots. Empty slots render an empty slot bg, filled slots render an `<ItemIcon>`.
- Right side: arrow + output `<ItemIcon>` + count badge (only shown if count > 1).
- Vanilla crafting-table styling: dark slate slot bg (`#8B8B8B`), beveled borders.
- Accessible: each slot has `aria-label` describing the item; the whole grid is a `<table role="grid">`.
- Support 2×2 patterns (auto-pad to 3×3 with empty slots).

### 3. `<ShapelessRecipe />`

```tsx
<ShapelessRecipe
  inputs={["techreborn:carbon_fiber", "techreborn:carbon_fiber"]}
  output={{ id: "techreborn:carbon_mesh", count: 1 }}
/>
```

- Horizontal row of input icons → arrow → output. Visually distinct from shaped (no 3×3 frame).

### 4. `<MachineRecipe />`

```tsx
<MachineRecipe
  machine="compressor"
  inputs={[{ id: "minecraft:copper_ingot", count: 1 }]}
  outputs={[{ id: "techreborn:copper_plate", count: 1 }]}
  power={10}
  time={300}
  heat={null}
/>
```

- Boxed component: machine icon (left) + inputs column → arrow → outputs column.
- Footer row: power (E/t), time (ticks → also show seconds at 20 t/s), and heat (if present, with the IBF coil tier needed).
- Multiple inputs/outputs stack vertically inside their column.
- `heat` is `null` for non-blast-furnace recipes — don't render the heat row in that case.

### 5. `<RecipeFromData />` *(the workhorse — used everywhere in content phases)*

```tsx
<RecipeFromData id="techreborn:compressor/copper_plate" />
```

- Looks up the recipe in `recipes.json` and dispatches to the right component:
  - `minecraft:crafting_shaped` → `<CraftingGrid>`
  - `minecraft:crafting_shapeless` → `<ShapelessRecipe>`
  - any `techreborn:*` machine type → `<MachineRecipe>`
- If the ID isn't found, render a visible error placeholder (red border, "Recipe not found: <id>") and log to console.
- Content pages should use this exclusively — never hand-type ingredient/output arrays.

### 6. `<MachineRecipeList />`

```tsx
<MachineRecipeList machine="compressor" />
```

- Queries `recipes.json` for every recipe whose `type === "techreborn:compressor"` (or matches the machine string).
- Renders each inside a `<details>` element (collapsed by default), labeled by output item name.
- Used on machine reference pages.

### 7. `<MultiblockShape />`

```tsx
<MultiblockShape data={multiblocksJson["industrial_blast_furnace"]} />
```

- Phase 2 ships a placeholder rendering: 2D top-down ASCII-style view as a grid of `<ItemIcon>` cells per layer.
- Layer selector (radio buttons or a simple slider).
- Full 3D isometric rendering deferred — note in component comments. Future work.
- For Phase 2 the data shape is just `{ layers: [["air", "air", "casing"], ["casing", "lava", "casing"], ...] }`. Phase 6 hand-authors the actual structure data.

### 8. `<MachineStats />`

```tsx
<MachineStats power={32} buffer={1000} tier="LV" inputSlots={1} outputSlots={1} />
```

- Compact stat block for the top of a machine page.
- Renders as a small bordered table or a horizontal tag row.
- Optional props all rendered conditionally.

### 9. `<VersionContent />` and version-tabs helper

```tsx
<VersionContent version="1.20.1">
  This block only renders when MC version 1.20.1 is selected.
</VersionContent>
```

- Wraps Docusaurus `<Tabs groupId="mc-version">` for the hybrid versioning model. Phase 2 ships the wrapper but only 1.20.1 will exercise it; Phase 7 makes the version dropdown reflect this.
- For now, content tagged with `version="1.20.1"` always renders. Full multi-version conditional logic is Phase 7+.

## Registration

Create `src/theme/MDXComponents.tsx`:

```tsx
import MDXComponents from '@theme-original/MDXComponents';
import ItemIcon from '@site/src/components/ItemIcon';
import CraftingGrid from '@site/src/components/CraftingGrid';
// ...etc

export default {
  ...MDXComponents,
  ItemIcon,
  CraftingGrid,
  ShapelessRecipe,
  MachineRecipe,
  RecipeFromData,
  MachineRecipeList,
  MultiblockShape,
  MachineStats,
  VersionContent,
};
```

After this, MDX pages use `<CraftingGrid …/>` directly without imports.

## Demo gallery

Create `docs/_dev/component-gallery.mdx`:
- Frontmatter: `sidebar_class_name: dev-only-hidden` (and add CSS to hide that class from the sidebar).
- One section per component with realistic example data drawn from the actual `recipes.json`.
- Keep this page permanently — it's the dev reference.

## Styling guidelines

- Component CSS lives in `src/components/<Component>/styles.module.css` (CSS modules).
- Global utility CSS for the Minecraft look in `src/css/minecraft.css` (imported from custom.css):
  - `image-rendering: pixelated; image-rendering: crisp-edges;`
  - Slot borders: 2px solid `#373737` outer, 2px solid `#8B8B8B` inner.
  - Output arrow: a CSS-drawn triangle, not an icon.
- Don't go full skeuomorphic — match the spirit, not every pixel.
- All components must work in both light and dark mode.

## Verification

- [ ] `npm run start` → navigate to `/_dev/component-gallery` → all 9 components render correctly.
- [ ] `<RecipeFromData id="techreborn:compressor/copper_plate" />` renders the real recipe with `<ItemIcon>` slots and stat footer.
- [ ] Hover any `<ItemIcon>` → tooltip with display name.
- [ ] Mobile viewport (375px in DevTools): grids stay usable; output column doesn't overflow.
- [ ] `npm run build` succeeds with no TypeScript errors.
- [ ] Light mode + dark mode both visually correct on the gallery.

## Commit message

```
Phase 02: MDX components for items, recipes, machine stats
```

Body: list components added, gallery page URL, any visual choices made (e.g. slot border color).

## Workflow on completion

1. `git mv plans/phase-02-components.md plans/done/phase-02-components.md`
2. Commit + push.
3. Report: gallery URL on the live site once deploy completes.

## On failure

- TypeScript complains about JSON imports → add `"resolveJsonModule": true` to `tsconfig.json` and ensure `.json` is in `esModuleInterop` chain.
- `RecipeFromData` lookups all return "not found" → check the key format the script generated in Phase 1 matches what the component queries.
- Hot reload doesn't pick up component changes → known Docusaurus quirk, restart `npm run start`.
