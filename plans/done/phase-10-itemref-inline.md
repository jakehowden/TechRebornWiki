# Phase 10 — `<ItemRef>` inline link component

> **Read [`CONTEXT.md`](./CONTEXT.md) first.**

## Goal

A new MDX component `<ItemRef id="…"/>` that renders **icon + bold linked display name inline** for natural prose. Modeled on upstream's `<McItem slug="…"/>` pattern, but reusing our existing data lookup infrastructure (`items.json`, `tags.json`, `items-with-pages.json`).

This unblocks readable wiki prose like:

> Place the <ItemRef id="techreborn:industrial_blast_furnace"/> in the center of the bottom layer and connect it to a <ItemRef id="techreborn:solid_fuel_generator"/>.

Today the same sentence with `<ItemIcon>` is icon-only and prose has to repeat the name in plain text or a manual link. `<ItemRef>` collapses that to one tag.

## Prerequisites

- Phases 0–8 complete.
- `src/components/ItemIcon/` exists and works (we reuse its texture/tooltip/link-resolution logic).
- `src/data/items.json`, `src/data/tags.json`, `docs/items-with-pages.json` populated.

## Design decision

**Build a new `<ItemRef>` component, do not overload `<ItemIcon>` with an `inline` prop.** Two reasons:
- Existing `<ItemIcon>` consumers in `Machine.tsx`, `MultiblockShape.tsx`, `MachineRecipeList.tsx` must keep working untouched.
- The visual contracts differ: `ItemIcon` is a fixed-size square; `ItemRef` is a baseline-aligned inline element with text.

`ItemRef` should compose `ItemIcon` internally for the icon half — do not re-implement texture lookup.

## Steps

1. **Create `src/components/ItemRef/index.tsx`:**
   ```tsx
   export interface ItemRefProps {
     id: string;
     size?: number;          // icon size, default 20
     name?: string;          // override displayName from items.json
     showName?: boolean;     // default true; set false to mimic ItemIcon
     bold?: boolean;         // default true
   }
   ```
   - Resolve `id` through `tagsData` (same as `ItemIcon`).
   - Look up `displayName` from `itemsData[resolvedId]`; fallback to `titleCase(shortId(resolvedId))`.
   - Compose `<ItemIcon id={id} size={size}/>` for the icon.
   - Render: `<span class={styles.ref}><ItemIcon … /><strong>{displayName}</strong></span>`.
   - **Linking:** reuse the same lookup `ItemIcon` performs (factor it into a shared util if it isn't already — see step 2). Wrap the whole span in a `<Link>` if a wiki page exists; external link to `minecraft.wiki/w/<name>` for vanilla items without a wiki page; otherwise no link.
   - When wrapped in a link, the link should NOT add an underline by default (Docusaurus default behavior decorates the wrapped icon weirdly). Use `styles.ref` to override.

2. **Refactor link-resolution out of `ItemIcon`:**
   - Extract the `resolvedId → pageUrl | externalUrl | undefined` logic in `src/components/ItemIcon/index.tsx` (lines ~30-50) into `src/utils/itemFormatters.ts` as `function resolveItemLink(id, activeVersion, currentPath): { to: string, external: boolean } | undefined`.
   - Update `ItemIcon` to call the util.
   - `ItemRef` calls the same util.
   - Add a unit test (or at least manual verification) that `ItemIcon` still links correctly after the refactor — pick three cases: `techreborn:grinder` (internal), `minecraft:redstone` (external), `minecraft:air` (no link).

3. **Add `src/components/ItemRef/styles.module.css`:**
   - `.ref { display: inline-flex; align-items: center; gap: 0.25em; vertical-align: baseline; }`
   - `.ref :global(.${ItemIcon styles iconWrapper class}) { vertical-align: text-bottom; }` — match icon baseline to text baseline.
   - When inside a link: `.ref strong { color: var(--ifm-link-color); }` so the bold name picks up theme link color.
   - No underline on the icon; underline on hover for the text only.

4. **Register in `src/theme/MDXComponents.tsx`:**
   ```tsx
   import ItemRef from '@site/src/components/ItemRef';
   export default { ...MDXComponents, ItemIcon, ItemRef, /* … */ };
   ```

5. **Document in the component gallery:**
   - Add a section to `docs/_dev/component-gallery.mdx` showing four cases:
     - Internal-link item (`techreborn:grinder`)
     - External-link vanilla item (`minecraft:redstone`)
     - Item with no page and no external (`minecraft:air` or similar — the component should render as plain text with icon, no link)
     - Custom `name` override (`<ItemRef id="techreborn:grinder" name="Pulveriser"/>`)
   - Add example prose paragraph using two `<ItemRef>` calls inline so the reader sees real-world usage.

6. **Document in the contributor docs** (if Phase 9 has merged): add `<ItemRef>` section to `docs/contributing/components.mdx` with props table + examples. If Phase 9 has not yet merged, do nothing — that phase is responsible for picking it up.

7. **Smoke-test in real content:** convert exactly **one** existing page from `<ItemIcon>` + manual linked name to `<ItemRef>` so we have a real-world example. Pick `docs/intro.mdx` or `docs/mechanics/index.mdx`. Do **not** do a mass conversion — that's a separate cleanup pass once contributors have lived with `<ItemRef>` for a bit.

## Verification

- [ ] `npm run start` → component gallery section renders all four cases correctly.
- [ ] Hovering an `<ItemRef>` for an internal item navigates to its wiki page on click.
- [ ] Vanilla `<ItemRef>` for a non-wiki item opens minecraft.wiki in a new tab.
- [ ] `<ItemIcon>` everywhere else still works unchanged (refactor regression check).
- [ ] Inline `<ItemRef>` does NOT cause line-break or icon-misalignment in a wrapped paragraph (test in light + dark mode at desktop and 375px viewport).
- [ ] `npm run build` passes with `onBrokenLinks: "throw"`.
- [ ] `tsc --noEmit` clean.

## Commit message

```
Phase 10: ItemRef inline link component
```

Body: list files added/changed (`ItemRef/index.tsx`, `ItemRef/styles.module.css`, refactored `ItemIcon`, util extraction, gallery section, smoke-test page). Note any baseline-alignment quirks discovered.

## Workflow on completion

1. `git mv plans/phase-10-itemref-inline.md plans/done/phase-10-itemref-inline.md`
2. `git add -A`
3. `git commit -m "Phase 10: …"`
4. `git push origin main`
5. Report: gallery URL, the page you used as smoke-test.

## On failure

- Baseline misalignment in browsers/themes → use `vertical-align` on the `<img>` inside the icon wrapper, not on the wrapper itself. Last-resort: `display: inline-block; transform: translateY(2px);` per environment.
- Refactoring `ItemIcon`'s link logic breaks an existing render → revert step 2; have `ItemRef` duplicate the logic temporarily and file a P2 to deduplicate later.
- TS complains about `useActiveVersion` in the util → keep the util pure (input-only) and pass `activeVersion`/`location` from each component's render. Don't put React hooks in utils.
