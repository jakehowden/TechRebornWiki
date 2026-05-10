# Remove internal-ID leaks from ingot pages

Goal: ingot pages show only player-useful info; no recipe-key fragments, no misleading auto-generated copy.

Phases (run in order; each is independent once prior phases are merged):

1. `01-fix-machine-header.md` — stop deriving recipe-card header from raw recipe key.
2. `02-fix-ingot-description.md` — stop picking tool/armor scrap recipes as the "primary" production path in generator.
3. `03-collapse-mixed-metal-ingot.md` — group the 30+ Mixed Metal Ingot variants under one collapsible.
4. `04-verify-used-in-lookup.md` — verify/fix suspect "Used in" entries on Iridium Alloy Ingot.

Out of scope: the `id="techreborn:..."` props on `<ItemHeader>` / `<ItemRef>` / `<RecipeFromData>` in MDX. These are data-binding props, never rendered as text.
