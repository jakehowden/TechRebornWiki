# Phase 12 — `/tutorial` standalone getting-started page

> **Read [`CONTEXT.md`](./CONTEXT.md) first.**

## Goal

A real, prominent **Getting Started** page at `/tutorial` (not buried under `/docs/guides/`), surfaced in the navbar so a first-time visitor lands on it. Modeled on upstream's `src/pages/tutorial.md` flow but rewritten in our voice and using our components.

The existing `docs/guides/getting-started.mdx` should remain — it's a longer-form follow-up. `/tutorial` is the orientation page.

## Prerequisites

- Phases 0–8 complete.
- **Strongly recommended**: phase 10 (`<ItemRef>`) merged, since prose reads dramatically better with inline item links. If phase 10 hasn't merged, fall back to `<ItemIcon>` + manual `[name](/docs/…)` links.
- Phase 11 (`<ItemHeader>`) optional but encouraged for the page header.

## Steps

1. **Create `src/pages/tutorial.mdx`:**
   - Frontmatter: `title: Getting Started`, `description: First steps with the Tech Reborn mod for Minecraft 1.20.1`.
   - Use `.mdx` not `.md` so MDX components work (upstream is `.md` because they don't use ItemRef-style components inline; we do).

2. **Page outline** (mirror upstream's flow but rewrite — do NOT copy text verbatim, the upstream is MIT but we re-author per locked decision #8):

   ### Acquiring Rubber
   - Need a <ItemRef id="techreborn:treetap"/>.
   - Find a Rubber Tree (link to `/docs/world/rubber-tree`) — describe how it looks, biome bias.
   - Right-click sap spots with treetap.
   - Smelt sap into <ItemRef id="techreborn:rubber"/> for insulated cables.
   - Embed the rubber-tree screenshot at `/img/rubbertree.png` if it exists; if not, leave a `<!-- VERIFY: add rubber tree screenshot -->` comment.

   ### Refining Iron
   - Smelt iron ingot in any furnace → <ItemRef id="techreborn:refined_iron_ingot"/>.
   - Refined iron is the gateway to most early machine recipes.

   ### First Generator
   - <ItemRef id="techreborn:solid_fuel_generator"/> as the entry-level power source.
   - Output rate, fuel types, basic placement (cite stats from `src/data/`).
   - Brief mention of side-channel power: directly-adjacent machines auto-power without cables.

   ### First Machines
   - <ItemRef id="techreborn:electric_furnace"/> — smelting efficiency vs. iron furnace vs. vanilla furnace (cite numbers — verify against TR source, do not guess).
   - <ItemRef id="techreborn:grinder"/> — ore doubling.
   - <ItemRef id="techreborn:extractor"/> — sap → rubber, etc.

   ### Cables and Power Distribution
   - <ItemRef id="techreborn:tin_cable"/> for LV machines.
   - One-line callout: cables transfer inefficiently over distance — use batteries every 10–15 blocks. Link to phase 13's `/energy` page (or `/docs/mechanics/cables-and-transformers` if phase 13 hasn't run).

   ### Where to next
   - Bullet list of next milestones with links: industrial grinder path, blast furnace path, multiblock construction.
   - Link to longer guides under `/docs/guides/`.

3. **Verify every stat and recipe against `src/data/` or `../TechReborn` source.** Apply the **never invent recipes** rule. If you can't verify a number (e.g., specific smelting multipliers from upstream), leave a `<!-- VERIFY: <what> -->` comment and surface it in the report.

4. **Add the navbar link.** In `docusaurus.config.ts`, prepend a navbar item before the version dropdown:
   ```ts
   { to: '/tutorial', label: 'Getting Started', position: 'left' },
   ```
   Position it as the FIRST left-aligned item so it leads the navbar.

5. **Update homepage CTA.** In `src/pages/index.tsx`, change the "Get Started" hero button from `to="/docs/intro"` to `to="/tutorial"`. Keep the existing feature cards as the secondary CTAs.

6. **Cross-link from `docs/intro.mdx`** at the top: a one-line "New to Tech Reborn? Start with the [getting-started tutorial](/tutorial)." callout (use a `:::tip` block).

7. **Avoid duplication with `docs/guides/getting-started.mdx`.** Read that page first; if it overlaps significantly, leave a note at its top: "This is a more detailed walkthrough — for a quick orientation see [`/tutorial`](/tutorial)." Do not delete the longer guide.

## Verification

- [ ] `npm run start` → `/tutorial` renders, navbar link shows "Getting Started" as the first left item.
- [ ] Homepage "Get Started" button now lands on `/tutorial`.
- [ ] Every <ItemRef> in the page resolves to a wiki page or external Minecraft wiki link (no broken links with `onBrokenLinks: throw`).
- [ ] No `<!-- VERIFY -->` comments left unless explicitly listed in the report.
- [ ] Mobile (375px): page reads top-to-bottom cleanly; navbar collapses correctly.
- [ ] `npm run build` passes.

## Commit message

```
Phase 12: /tutorial getting-started page + navbar surface
```

Body: section list, verification points (stats cross-checked vs which sources), homepage CTA changed, any VERIFY comments left.

## Workflow on completion

1. `git mv plans/phase-12-tutorial-page.md plans/done/phase-12-tutorial-page.md`
2. `git add -A`
3. `git commit -m "Phase 12: …"`
4. `git push origin main`
5. Report: deployed `/tutorial` URL, screenshot of the navbar.

## On failure

- Page sits inside a Docusaurus version path unexpectedly → `src/pages/` is unversioned by design, that's correct. Don't move it under `docs/`.
- Navbar overflows on mobile after adding the new item → make "Getting Started" `position: 'left'` and rely on the mobile menu drawer to handle overflow. Don't drop the version dropdown.
- A stat can't be verified (e.g., furnace efficiency number) → leave the VERIFY comment AND choose conservative phrasing ("significantly more efficient than a vanilla furnace") rather than a wrong number.
