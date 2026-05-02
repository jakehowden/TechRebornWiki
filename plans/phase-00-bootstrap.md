# Phase 0 — Repo bootstrap, scaffold, deploy

> **Read [`CONTEXT.md`](./CONTEXT.md) first.** Locked decisions and the "never invent recipes" rule apply across every phase.

## Goal

A live, empty Docusaurus site deployed to GitHub Pages with the orange dark theme and version dropdown skeleton. **No content yet** — content phases come next.

## Prerequisites

- Node 20+ (`node --version` to verify; the user has 22 confirmed).
- npm available.
- `gh` CLI authenticated as `jakehowden` (`gh auth status` to verify; confirmed at planning time).
- `git` configured with the user's name/email globally.
- Working directory: `C:\Users\jakeh\Documents\GitHub\TechRebornWiki\`.
- `plans/` already exists with the per-phase markdown files. **Do not re-create them.**

## Steps

1. **Read `QUARRY_PROGRESSION_GUIDE.md` once for tone calibration**, then `git rm` it (or just delete; it's not yet tracked). It is a personal note, not template content.
2. `git init -b main`. Set up `.gitignore` covering Node + Docusaurus standard ignores (`node_modules/`, `.docusaurus/`, `build/`, `.env*.local`, `npm-debug.log*`, `.DS_Store`).
3. Create `LICENSE` — MIT, copyright "Jake Howden 2026".
4. Create `NOTICE.md` listing:
   - **TechReborn mod** (MIT) — github.com/TechReborn/TechReborn — textures and recipe data
   - **TechReborn/Wiki** (MIT) — github.com/TechReborn/Wiki — content reference for structure & phrasing
5. Create `README.md` with: project description, local dev commands (`npm install`, `npm run start`, `npm run build`), link to deployed site (`https://jakehowden.github.io/TechRebornWiki/`), pointer to `CONTRIBUTING.md` (created in Phase 7) and `plans/README.md` for the development workflow.
6. Run `npx create-docusaurus@latest temp-scaffold classic --typescript`, then move the generated files into the project root (preserving `plans/`, `LICENSE`, `NOTICE.md`, `README.md`, `TODO_QUARRY_REBORN.md`). Delete `temp-scaffold/`. Alternative: run it directly in the current directory if it accepts an existing non-empty target — verify behavior. Either way, the existing `plans/`, license, etc. must survive.
7. Replace the boilerplate `docusaurus.config.ts` with a configuration that has:
   - `title: "Tech Reborn Wiki"`, `tagline: "An unofficial reference for the Tech Reborn Minecraft mod"`
   - `url: "https://jakehowden.github.io"`, `baseUrl: "/TechRebornWiki/"`
   - `organizationName: "jakehowden"`, `projectName: "TechRebornWiki"`, `deploymentBranch: "gh-pages"` (kept for reference, but we deploy via Pages-from-Actions, not the gh-pages branch)
   - `trailingSlash: false`
   - `onBrokenLinks: "warn"` for now (Phase 7 flips it to `"throw"`)
   - `themeConfig.colorMode`: `defaultMode: "dark"`, `respectPrefersColorScheme: true`
   - **Disable the blog plugin** (we don't need a blog) — pass `blog: false` to the classic preset
   - Navbar: title, `docsVersionDropdown` (left side), GitHub link (right), search placeholder (Phase 7 wires real search)
   - Footer: simple, links to GitHub repo and TechReborn mod page
   - `i18n.defaultLocale: "en"` and `locales: ["en"]`
8. Override theme CSS in `src/css/custom.css` to set the TR-orange palette. Use `--ifm-color-primary: #E87B22` plus the standard Infima primary-dark/-darker/-darkest/-light/-lighter/-lightest variants. Compute the variants properly (don't just darken/lighten by guesses — use a palette generator like https://docusaurus.io/docs/styling-layout#styling-your-site-with-infima or pre-compute them). Make sure dark-mode contrast still passes WCAG AA on the homepage.
9. Replace the generated `sidebars.ts` with the **functional** structure. Categories should be collapsibles with `link: { type: "generated-index" }` pointing at the category index page. Order:
   - Home (`intro`)
   - Power → subcategories: Generators, Energy Storage, Cables & Transformers
   - Processing → subcategories: LV Machines, MV Machines, HV+ Machines
   - Tools & Armor → subcategories: Tools, Armor
   - Materials → subcategories: Ingots, Plates, Dusts, Cells, Misc
   - Storage Units & Tanks
   - Multiblocks
   - World → subcategories: Ores, Rubber, Fluids
   - Mechanics
   - Guides
   Initially, every leaf except Home is empty. The category-index pages (step 11) keep them from 404-ing.
10. Create `docs/intro.md` as a one-page placeholder explaining the wiki, who it's for, and that content is being built out. Link to the GitHub repo for issues. Single H1 from frontmatter.
11. Create empty category index pages so the sidebar doesn't 404:
    - `docs/power/index.mdx`
    - `docs/processing/index.mdx`
    - `docs/tools-armor/index.mdx`
    - `docs/materials/index.mdx`
    - `docs/storage/index.mdx`
    - `docs/multiblocks/index.mdx`
    - `docs/world/index.mdx`
    - `docs/mechanics/index.mdx`
    - `docs/guides/index.mdx`
    Each: a one-paragraph "this section covers X. Pages coming soon." Frontmatter `title` and `sidebar_position: 1`.
12. Create `TODO_QUARRY_REBORN.md` at repo root. Contents: a stub heading "Quarry Reborn Coverage TODO" and a one-line note that this checklist is filled in during Phase 7. Leave it mostly empty for now.
13. Create `.github/workflows/deploy.yml` using Docusaurus's official Pages-from-Actions template. Trigger on push to `main` and on manual dispatch. Steps: checkout, setup-node 20, npm ci, npm run build, upload artifact, deploy via `actions/deploy-pages@v4`. Permissions: `pages: write`, `id-token: write`. Concurrency group `pages` with cancel-in-progress false.
14. Run `npm install`, then `npm run build` locally. Resolve any errors before continuing — typically: TypeScript strict-mode complaints, missing imports in `sidebars.ts`. Build must complete cleanly.
15. Create the GitHub repo and push:
    ```
    gh repo create jakehowden/TechRebornWiki --public --source=. --remote=origin --description "Unofficial wiki for the Tech Reborn Minecraft mod"
    git add -A
    git commit -m "Phase 00: bootstrap Docusaurus, theme, GH Pages deploy"
    git push -u origin main
    ```
    Then enable Pages-from-Actions: `gh api repos/jakehowden/TechRebornWiki/pages -X POST -f build_type=workflow` (404s if Pages already enabled — that's fine, just confirm with `gh api repos/jakehowden/TechRebornWiki/pages`). Watch the deploy: `gh run watch`.

## Verification

- [ ] `node --version` ≥ 20.
- [ ] `npm run start` serves locally without errors. Visiting `http://localhost:3000/TechRebornWiki/` shows the home page.
- [ ] `npm run build` produces a clean `build/` directory.
- [ ] Sidebar shows all 9 functional top-level categories (collapsible, mostly empty index pages).
- [ ] Dark mode is the default. Toggle works. Orange accent visible on links/buttons.
- [ ] After push: GH Action runs to completion (`gh run list --limit 1`).
- [ ] Live URL `https://jakehowden.github.io/TechRebornWiki/` returns the home page within ~3 minutes of the Action completing.
- [ ] `plans/` survived the create-docusaurus scaffold and still contains the 8 remaining phase files.

## Commit message

```
Phase 00: bootstrap Docusaurus, theme, GH Pages deploy
```

Body should list: docusaurus version installed, theme color, sidebar structure, deploy workflow path, deployed URL once verified.

## Workflow on completion

1. `git mv plans/phase-00-bootstrap.md plans/done/phase-00-bootstrap.md`
2. `git add -A`
3. `git commit -m "Phase 00: bootstrap Docusaurus, theme, GH Pages deploy"`
4. `git push origin main`
5. Print report: live URL, build status, anything skipped.

## On failure

Do **not** move the phase file or commit. Report what failed and stop. Common failure modes:
- `gh repo create` fails because repo already exists → ask user; offer to push to existing repo.
- GH Action fails on first deploy → inspect logs (`gh run view --log-failed`), most likely a baseUrl/url mismatch or a missing dependency.
- `npm run build` complains about a missing component import → the sidebar references a doc that doesn't exist; fix and rebuild.
