# Phase 13 — `/energy` consolidated power primer

> **Read [`CONTEXT.md`](./CONTEXT.md) first.**

## Goal

A single standalone primer at `/energy` that answers "how does power work in Tech Reborn?" without making the reader walk three sidebar branches (generators / cables / batteries / mechanics). Modeled on upstream's `src/pages/energy.md`.

This **complements**, doesn't replace, the existing detailed pages under `docs/power/` and `docs/mechanics/cables-and-transformers.mdx`. `/energy` is the elevator-pitch overview with deep-link jump-offs.

## Prerequisites

- Phases 0–8 complete.
- `docs/power/`, `docs/mechanics/cables-and-transformers.mdx`, `docs/mechanics/power-tiers.mdx` all populated (they are — verified at audit).
- Phase 10 (`<ItemRef>`) strongly recommended for inline mentions; fall back to `<ItemIcon>` if not merged.

## Steps

1. **Create `src/pages/energy.mdx`:**
   - Frontmatter: `title: Energy & Power`, `description: How energy generation, storage, transfer, and consumption work in Tech Reborn`.

2. **Page outline** (rewrite, do not copy upstream):

   ### How it works
   Brief flow diagram in prose: **generators → cables → batteries → machines**, with `<ItemRef>` for each role's representative item. One-paragraph each:
   - Generators produce energy per tick → push to adjacent machines/cables → buffer internally.
   - Cables carry energy with a per-tier I/O limit and an internal buffer; oversend = burn.
   - Batteries (`mfe`, `mfsu`, etc.) input from up to 5 sides, output to one preferred direction.
   - Machines consume per recipe; rate determined by tier + overclocker upgrades.

   ### Energy tiers
   Reproduce the table from `docs/mechanics/power-tiers.mdx` — link to that page for the source of truth, mark this copy as a quick reference. Columns:
   | Tier | I/O Rate (E/t) | Min. Cable | Example Machines |
   Verify all numbers against `src/data/` or `../TechReborn/src/main/java/techreborn/config/TechRebornConfig.java`. Do NOT invent.

   ### Cable sizing rule of thumb
   - Long-distance: gold or HV; insulate to prevent shock damage.
   - Local distribution: copper/tin is fine.
   - **Place a battery every 10–15 blocks** to prevent loss-on-distance behavior.
   - Link to `/docs/power/cables/` for the full list.

   ### GUI walkthrough
   Reuse `static/img/docs/blocks/machines/grinder_interface.png` (and the I/O + redstone interface images, if they exist in `static/`) — same images upstream uses. If the assets aren't in our repo, copy them from `../TechReborn-Wiki-Upstream/static/img/docs/` (they are MIT, attribution already in `NOTICE.md`). Verify each is present before linking.
   - Main interface: numbered callouts (input slot, progress, output, power, battery slot, upgrades, I/O, redstone).
   - I/O config interface: input vs output coloring, auto pull/push.
   - Redstone interface: I/O / power / crafting toggles.

   ### Common pitfalls
   - Generators not pushing to an adjacent battery → check the battery's I/O config.
   - Cables burning out → tier mismatch (LV cable being fed MV power).
   - Machine slow → no overclocker upgrade or insufficient input rate.

   ### See also
   - [Power Tiers](/docs/mechanics/power-tiers)
   - [Cables & Transformers](/docs/mechanics/cables-and-transformers)
   - [Generators](/docs/power/generators) / [Storage](/docs/power/storage) / [Cables](/docs/power/cables)

3. **Add a navbar link** to `docusaurus.config.ts`:
   ```ts
   { to: '/energy', label: 'Energy', position: 'left' },
   ```
   Place after the "Getting Started" link from phase 12 (if merged) or in the same position otherwise.

4. **Add cross-links from existing pages:**
   - `docs/mechanics/index.mdx`: top-line "For an overview, see the [/energy primer](/energy)."
   - `docs/power/index.mdx`: same line at the top.
   - `docs/mechanics/cables-and-transformers.mdx`: brief mention.

5. **Asset check.** Upstream copies these images from their `static/img/docs/blocks/machines/`:
   - `grinder_interface.png`
   - `grinder_io_interface.png`
   - `grinder_redstone_interface.png`
   - `389956634-4523abef-e0c6-45f3-a9db-d6d06ba58471.gif` (slot priority demo)
   Confirm whether each is present under our `static/img/`. If missing, copy from `../TechReborn-Wiki-Upstream/static/img/` to our `static/img/docs/blocks/machines/`. NOTICE.md already attributes the upstream wiki — no further work needed.

6. **Verify every stat against TR source.** I/O rates, cable buffers, battery I/O sides — all must trace to `TechRebornConfig.java` or recipe JSON. Apply **never invent recipes** rule.

## Verification

- [ ] `npm run start` → `/energy` renders, navbar link visible.
- [ ] All images load (no 404s in browser console).
- [ ] Tier table numbers match `docs/mechanics/power-tiers.mdx` exactly (no drift).
- [ ] All <ItemRef> / <ItemIcon> links resolve.
- [ ] Mobile (375px): table scrolls horizontally if needed without breaking layout.
- [ ] `npm run build` passes with `onBrokenLinks: "throw"`.

## Commit message

```
Phase 13: /energy primer page + cross-links
```

Body: assets copied (if any), cross-link locations, verification of tier numbers vs. TechRebornConfig.java.

## Workflow on completion

1. `git mv plans/phase-13-energy-primer.md plans/done/phase-13-energy-primer.md`
2. `git add -A`
3. `git commit -m "Phase 13: …"`
4. `git push origin main`
5. Report: deployed `/energy` URL, list of assets copied, any VERIFY comments left.

## On failure

- Tier numbers in `docs/mechanics/power-tiers.mdx` disagree with `TechRebornConfig.java` → fix the canonical doc first, then mirror in `/energy`. Tag the divergence as a P1 issue.
- Missing GUI images and we can't reach `../TechReborn-Wiki-Upstream/static/` → leave the captions with `<!-- VERIFY: GUI image -->` comments, ship the page without them, file a P2.
- Navbar gets crowded → consider grouping "Getting Started" and "Energy" under a "Guides" dropdown — but only if it's actually overflowing on desktop. Do not drop the version dropdown.
