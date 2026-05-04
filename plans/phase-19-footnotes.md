# Phase 19 — Markdown footnotes for nuance

> **Read [`CONTEXT.md`](./CONTEXT.md) first.**

## Goal

Adopt markdown footnotes (`[^1]`) for asides, disclaimers, and tier-edge cases that currently live as parenthetical text or `:::note` admonitions cluttering the reading flow. Modeled on upstream's `solar_panels.mdx` pattern.

This is a **conventions + light cleanup** phase — not a content phase. No new pages.

## Prerequisites

- Phases 0–8 complete.
- Docusaurus 3.x with MDX 3 — already supports GFM footnotes natively (verify: `package.json` has `@docusaurus/core: 3.10.x`).

## Steps

1. **Verify footnote rendering works** in our Docusaurus version. Create a temporary scratch file:
   ```mdx
   This panel outputs ∞ E/t[^1].

   [^1]: Creative-only, no recipe.
   ```
   Render it locally. If footnotes don't render correctly:
   - Check `docusaurus.config.ts` `markdown` config — may need `markdown: { format: 'mdx', mdx1Compat: false }`.
   - As a fallback, use `remark-gfm` plugin explicitly. Add to `markdown.remarkPlugins` if needed.

2. **Document the convention** in `docs/contributing/authoring.mdx` (added in phase 9). New section "Footnotes":
   - When to use: tier-edge cases (creative panels), config-default disclaimers ("server-configurable"), pedantic clarifications, source citations.
   - When NOT to use: anything load-bearing for the reader (use prose), warnings (use `:::warning`), tips (use `:::tip`), trivia (skip — wiki space is for facts).
   - Format: `[^1]` references, footnote bodies grouped at the bottom of the page.
   - Numbering: per-page, starts at 1. Docusaurus handles the linking.

3. **Inventory existing parenthetical cruft.** Grep for patterns that should become footnotes:
   ```sh
   grep -rn "configurable" docs/
   grep -rn "(except" docs/
   grep -rn "(only" docs/
   grep -rn "(see also" docs/
   ```
   Build a candidate list. Don't refactor mass — pick ~10 prominent cases for this phase as examples.

4. **Refactor 5–10 high-traffic pages** to use footnotes for prominent asides:
   - `docs/power/generators/solar-panel-creative.mdx` — "no recipe, creative-only" footnote.
   - `docs/mechanics/power-tiers.mdx` — "values are defaults; server-configurable" footnote.
   - `docs/power/storage/index.mdx` — battery I/O caveats.
   - `docs/processing/lv-machines/grinder.mdx` — overclocker stacking caveats.
   - Pick 5 more from the inventory.
   Replace inline parentheticals with `[^N]` and a footnote body at page bottom.

5. **Add a CSS polish** in `src/css/custom.css` for footnote refs (Docusaurus's defaults are functional but bland):
   ```css
   .markdown a[href^='#user-content-fn-'] {
     font-size: 0.75em;
     vertical-align: super;
     line-height: 0;
   }
   .markdown section[data-footnotes] {
     margin-top: 3rem;
     padding-top: 1rem;
     border-top: 1px solid var(--ifm-color-emphasis-200);
     font-size: 0.875rem;
   }
   ```
   Verify in light + dark mode.

6. **Add gallery example** in `docs/_dev/component-gallery.mdx` showing two footnote uses with surrounding prose so contributors see the rendered output.

## Verification

- [ ] Footnote refs (`[^1]`) render as superscript links.
- [ ] Clicking a footnote ref scrolls to the footnote definition; back-link arrow works.
- [ ] Footnote section appears at the bottom of the page with a subtle separator.
- [ ] All ~5–10 refactored pages render correctly (no broken markdown).
- [ ] `npm run build` passes with `onBrokenLinks: "throw"`.

## Commit message

```
Phase 19: footnote convention + refactor selected pages
```

Body: list of pages refactored, contributing docs updated, CSS polish.

## Workflow on completion

1. `git mv plans/phase-19-footnotes.md plans/done/phase-19-footnotes.md`
2. `git add -A`
3. `git commit -m "Phase 19: …"`
4. `git push origin main`
5. Report: pages refactored, before/after screenshot of one (e.g. solar-panel-creative).

## On failure

- Footnotes don't render in our MDX setup → enable `remark-gfm` explicitly in `docusaurus.config.ts`. If that still fails, document the limitation and mark this phase as deferred — convert to a P2 issue and skip the refactor.
- Footnote refs collide with other anchor links on the page → Docusaurus auto-namespaces with `user-content-fn-`; if a custom anchor uses that prefix, rename the custom one.
- Refactored prose loses readability ("we removed too many caveats from inline text") → revert that page; footnotes are for genuinely-skippable nuance, not for things readers need.
