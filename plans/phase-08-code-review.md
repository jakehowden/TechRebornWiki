# Phase 8 — Code review

> **Read [`CONTEXT.md`](./CONTEXT.md) first. Read it carefully — this entire phase is about checking that prior phases respected it.**

## Goal

Independent audit of everything Phases 0–7 produced. Catch bugs, recipe inaccuracies, broken cross-references, accessibility regressions, license/attribution gaps. Open follow-up issues. Produce `REVIEW.md`.

This phase is performed by a **fresh agent** (or the user) acting as code reviewer. They have **not** read the implementation conversation. They read `CONTEXT.md`, then audit the repo against it.

## Prerequisites

- Phases 0-7 complete; their plan files all in `plans/done/`.
- Live deploy at `https://jakehowden.github.io/TechRebornWiki/` is green.
- Reviewer has access to `../TechReborn` source (for cross-referencing recipes/stats).

## Review checklist

For each item, mark PASS / FAIL / PARTIAL in `REVIEW.md` with one-line evidence.

### 1. Locked decisions compliance

Verify each of the 13 locked decisions in `CONTEXT.md` is reflected in the repo. If any was deviated from without a recorded reason in a phase report, that's a FAIL.

Specifically check:
- [ ] Framework: Docusaurus 3.x in `package.json`.
- [ ] Versioning: `versioned_docs/version-1.20.1/` exists; dropdown shows it.
- [ ] Recipe components: `src/components/CraftingGrid/`, `MachineRecipe/`, etc., all present.
- [ ] Stats source: `<MachineStats>` props pulled from data files, not hardcoded inline.
- [ ] Sidebar: matches functional structure exactly.
- [ ] Theme: `--ifm-color-primary: #E87B22`. Dark default.
- [ ] Search: `@cmfcmf/docusaurus-search-local` in dependencies and configured.
- [ ] Deploy: `.github/workflows/deploy.yml` present and recently green.
- [ ] License: `LICENSE` is MIT. `NOTICE.md` credits TR mod and TR Wiki.
- [ ] Quarry Reborn: zero references in `docs/`. `TODO_QUARRY_REBORN.md` exists with a real checklist.

### 2. Recipe accuracy spot-check

Pick **10 random recipes** from `src/data/recipes.json`. For each:
- Find the corresponding Groovy source in `../TechReborn/src/datagen/groovy/techreborn/datagen/recipes/`.
- Confirm ingredients, output count, power, time match.
- If any don't match: P0 issue.

### 3. Stat accuracy spot-check

Pick **5 random machine pages**. For each `<MachineStats>` block:
- Find the corresponding constant in `TechRebornConfig.java` or the block class.
- Confirm `power`, `buffer`, `tier` match the source defaults.
- Mismatches: P1 issue (unless it's a clear typo, which is P0).

### 4. Item coverage audit

Run the coverage audit script (built in Phase 6, or write it now if missing) that:
- Lists every entry in every `TRContent.java` enum.
- Greps the `docs/` tree for the item ID.
- Reports any item with zero mentions.

Items with zero coverage are P1 unless they're verifiably out-of-scope (e.g. removed in 1.20.1).

### 5. `<!-- VERIFY -->` comments

Grep all MDX for `VERIFY` comments:
```
grep -rn "VERIFY" docs/
```
List them in REVIEW.md. Each is either:
- Resolved by you (read source, fix the page), and removed.
- Filed as a GitHub issue with link.

### 6. Build hygiene

- [ ] `npm ci && npm run build` clean — no warnings, no errors, no broken links.
- [ ] `npm run start` then visit 5 random pages — no console errors in browser DevTools.
- [ ] No `console.log` left in `src/components/` or `src/theme/`.
- [ ] `tsc --noEmit` clean (or whatever the TS check command is).

### 7. Component correctness

Open `/_dev/component-gallery` on the deployed site:
- [ ] Every component renders.
- [ ] `<ItemIcon>` tooltips work on hover.
- [ ] `<CraftingGrid>` has correct alt text on every slot.
- [ ] `<MachineRecipe>` aria-roles correct.
- [ ] Color contrast (DevTools Lighthouse → Accessibility) ≥ 95.

### 8. Deploy verification

- [ ] `https://jakehowden.github.io/TechRebornWiki/` responds 200.
- [ ] Search returns results for "compressor", "steel", "rubber tree".
- [ ] Version dropdown shows 1.20.1 + Next.
- [ ] `/1.20.1/processing/lv/compressor` returns the Compressor page.
- [ ] 404 page shows for an invalid path.
- [ ] OG image at `/img/og.png` returns 200.

### 9. License & attribution

- [ ] `LICENSE` file present, MIT, copyright "Jake Howden 2026" (or current year).
- [ ] `NOTICE.md` present, credits TR mod (MIT) and TR Wiki (MIT).
- [ ] `README.md` mentions both upstream projects.
- [ ] No upstream MDX content was copied into the repo (compare a few pages against `../TechReborn-Wiki-Upstream/docs/`).

### 10. Quarry Reborn boundary

- [ ] `grep -ri "quarry" docs/` returns zero hits (or only "diamond drill / quarry-equivalent in other mods" mentions, no actual coverage).
- [ ] `TODO_QUARRY_REBORN.md` exists at repo root, has a real checklist (not just the placeholder).

## Output

### `REVIEW.md` at repo root

Structure:

```markdown
# Code Review — Tech Reborn Wiki

**Reviewed by:** <name/agent>
**Date:** <YYYY-MM-DD>
**Commit reviewed:** <git rev-parse HEAD>
**Recommendation:** <ship | fix-and-reship | major-rework>

## Checklist results

| # | Area | Result | Evidence |
|---|---|---|---|
| 1 | Locked decisions compliance | PASS / PARTIAL / FAIL | <one line> |
| 2 | Recipe accuracy spot-check | ... | ... |
| ... | ... | ... | ... |

## Issues filed

### P0 (blockers)
- [#N] <title> — <one-line description>

### P1 (should-fix)
- [#N] ...

### P2 (nice-to-have)
- [#N] ...

## Notes

<Anything else worth recording — observations, tech debt to track, suggestions for future phases.>
```

### GitHub issues

Open one issue per P0 and P1. Title: `[REVIEW] <area>: <one-line>`. Body: description, evidence (file:line if applicable), suggested fix. Label with `review` and severity (`p0`/`p1`).

P2s can stay in `REVIEW.md` only — don't clutter the issue tracker.

## Decision rule

- **Only P2s found** → mark phase complete. Recommendation: `ship`.
- **Any P1s** → recommendation: `fix-and-reship`. Phase still completes (issues are filed, work is done), but the user knows there's follow-up.
- **Any P0s** → recommendation: `fix-and-reship` at minimum. **Do not move the phase file or commit "Phase 08 complete" until P0s are filed as issues.** The actual fix is a future Phase 9 (or in-place fix).

## Verification

- [ ] `REVIEW.md` exists at repo root, fully filled in.
- [ ] All P0/P1 issues are filed and visible in `gh issue list`.
- [ ] No claims in REVIEW.md without specific evidence (file paths, commit hashes, screenshots).

## Commit message

```
Phase 08: code review and follow-up issues filed
```

Body: recommendation, P0/P1/P2 counts, link to the GH issue search, anything urgent to flag for the user.

## Workflow on completion

1. `git mv plans/phase-08-code-review.md plans/done/phase-08-code-review.md`
2. Commit + push.
3. Print final report. **Tag the user** in the report: this is the end of the planned work; their attention is required to triage P0/P1 issues.

## On failure

- Reviewer can't access `../TechReborn` source → ask user to ensure it's checked out.
- A P0 surfaces that fundamentally invalidates a prior phase (e.g., recipes are systematically wrong because Phase 1's parser missed a case) → file the P0, write the recommendation as `major-rework`, do **not** mark the phase complete. The user decides the next move.

## End state

After Phase 8:
- The wiki is live, content-complete for Tech Reborn 1.20.1, polished, searchable, mobile-friendly, versioned.
- `REVIEW.md` documents quality and remaining follow-ups.
- `TODO_QUARRY_REBORN.md` is the seed for the next initiative.
- `plans/done/` contains all 9 phase files in order.
