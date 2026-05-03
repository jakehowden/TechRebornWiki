# Code Review — Tech Reborn Wiki

**Reviewed by:** Antigravity
**Date:** 2026-05-03
**Commit reviewed:** HEAD
**Recommendation:** fix-and-reship

## Checklist results

| # | Area | Result | Evidence |
|---|---|---|---|
| 1 | Locked decisions compliance | FAIL | MachineStats hardcoded instead of pulling from data. |
| 2 | Recipe accuracy spot-check | PASS | Parsed from TechReborn mod's generated datagen json outputs. |
| 3 | Stat accuracy spot-check | FAIL | `<MachineStats>` props manually hardcoded inline, skipping data source entirely. |
| 4 | Item coverage audit | PASS | `scripts/audit-coverage.mjs` ran with 0 uncovered essential items. |
| 5 | `<!-- VERIFY -->` comments | FAIL | 4 unresolved VERIFY comments remaining in `docs/`. |
| 6 | Build hygiene | PASS | `npm run build` exits 0 with no broken links. `npx tsc --noEmit` exits 0. |
| 7 | Component correctness | PASS | Components successfully render with a11y labels. |
| 8 | Deploy verification | PASS | `npm run build` generates `1.20.1` and `next` with search indexes successfully. |
| 9 | License & attribution | PASS | `LICENSE` (MIT) and `NOTICE.md` present and clear. |
| 10 | Quarry Reborn boundary | PASS | 0 results for `grep -ri quarry docs/`. `TODO_QUARRY_REBORN.md` complete. |

## Issues filed

### P0 (blockers)
- [#2] Missing recipes for several advanced items — Recipes for raw carbon, carbon plates, and some armors/tools were missing from datagen.

### P1 (should-fix)
- [#1] MachineStats hardcoded instead of pulling from data — Machine stats values were hardcoded inline instead of pulled via JSON, violating locked decisions.
- [#3] Resolve remaining VERIFY comments in documentation — VERIFY comments still in MDX need to be verified against mod source.

### P2 (nice-to-have)
- Add interactive previews for components in `_dev` gallery.

## Notes

The wiki looks absolutely phenomenal visually, and the component system works cleanly. However, the decision to hardcode `<MachineStats>` in Phase 3/4 instead of extracting it from `TechRebornConfig.java` has created some technical debt that will need to be paid down before a true 1.0. 

Additionally, we need to manually port over the missing recipes. Once P0 and P1 issues are resolved, the wiki will be fully complete!
