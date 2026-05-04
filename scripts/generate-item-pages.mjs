/**
 * generate-item-pages.mjs
 *
 * Generates shell MDX pages for material items (dusts, small piles, ingots,
 * nuggets, plates) and updates docs/items-with-pages.json with their routes.
 *
 * Usage: node scripts/generate-item-pages.mjs [--dry-run]
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

const DRY_RUN = process.argv.includes('--dry-run');

// ─── Data ─────────────────────────────────────────────────────────────────────

const items = JSON.parse(fs.readFileSync(path.join(ROOT, 'src/data/items.json'), 'utf8'));
const recipes = JSON.parse(fs.readFileSync(path.join(ROOT, 'src/data/recipes.json'), 'utf8'));
const tags = JSON.parse(fs.readFileSync(path.join(ROOT, 'src/data/tags.json'), 'utf8'));
// ─── Helpers ──────────────────────────────────────────────────────────────────

function shortId(id) {
  const idx = id.indexOf(':');
  return idx === -1 ? id : id.slice(idx + 1);
}

function titleCase(slug) {
  return slug
    .replace(/^[-_]*(.)/, (_, c) => c.toUpperCase())
    .replace(/[-_]+(.)/g, (_, c) => ' ' + c.toUpperCase());
}

const MACHINE_NAMES = {
  'techreborn:grinder': 'Grinder',
  'techreborn:blast_furnace': 'Industrial Blast Furnace',
  'techreborn:compressor': 'Compressor',
  'techreborn:centrifuge': 'Industrial Centrifuge',
  'techreborn:industrial_electrolyzer': 'Industrial Electrolyzer',
  'techreborn:industrial_grinder': 'Industrial Grinder',
  'techreborn:chemical_reactor': 'Chemical Reactor',
  'techreborn:alloy_smelter': 'Alloy Smelter',
  'techreborn:vacuum_freezer': 'Vacuum Freezer',
  'techreborn:wire_mill': 'Wire Mill',
  'techreborn:solid_canning_machine': 'Solid Canning Machine',
  'techreborn:distillation_tower': 'Distillation Tower',
  'techreborn:assembling_machine': 'Assembling Machine',
  'techreborn:implosion_compressor': 'Implosion Compressor',
  'minecraft:crafting_shaped': 'Crafting Table',
  'minecraft:crafting_shapeless': 'Crafting Table',
  'minecraft:smelting': 'Furnace',
  'minecraft:blasting': 'Blast Furnace',
};

function machineName(type) {
  return MACHINE_NAMES[type] ?? titleCase(shortId(type));
}

function displayName(id) {
  return items[id]?.displayName ?? titleCase(shortId(id));
}

// ─── Recipe lookups ───────────────────────────────────────────────────────────

/** Returns true if the given itemId is used as an ingredient in the recipe. */
function recipeUsesItem(recipe, itemId) {
  const ings = recipe.ingredients ?? [];
  for (const ing of ings) {
    if (ing.id === itemId) return true;
    if (ing.tag && tags[ing.tag] === itemId) return true;
  }
  // crafting_shaped key
  if (recipe.key) {
    for (const val of Object.values(recipe.key)) {
      if (typeof val === 'string' && val === itemId) return true;
      if (val && typeof val === 'object') {
        if (val.id === itemId) return true;
        if (val.tag && tags[val.tag] === itemId) return true;
      }
    }
  }
  // crafting_shapeless ingredients (may be strings)
  if (recipe.type === 'minecraft:crafting_shapeless') {
    for (const ing of (recipe.ingredients ?? [])) {
      if (typeof ing === 'string' && ing === itemId) return true;
    }
  }
  // smelting ingredient
  if (recipe.ingredient) {
    const ing = recipe.ingredient;
    if (typeof ing === 'string' && ing === itemId) return true;
    if (ing && typeof ing === 'object') {
      if (ing.id === itemId) return true;
      if (ing.tag && tags[ing.tag] === itemId) return true;
    }
  }
  return false;
}

/** Returns the list of output item ids from a recipe. */
function recipeOutputs(recipe) {
  if (recipe.outputs) return recipe.outputs.map(o => o.id ?? o).filter(Boolean);
  if (recipe.output) {
    const o = recipe.output;
    return [(typeof o === 'string' ? o : o.id)].filter(Boolean);
  }
  return [];
}

/** Returns all recipe keys that produce the given itemId. */
function recipesThatProduce(itemId) {
  return Object.entries(recipes).filter(([, r]) =>
    recipeOutputs(r).includes(itemId)
  );
}

/** Returns all output item ids from recipes that use the given itemId as input. */
function itemsProducedUsing(itemId) {
  const seen = new Set();
  const result = [];
  for (const [, recipe] of Object.entries(recipes)) {
    if (!recipeUsesItem(recipe, itemId)) continue;
    for (const outId of recipeOutputs(recipe)) {
      if (!seen.has(outId)) {
        seen.add(outId);
        result.push(outId);
      }
    }
  }
  return result;
}

// ─── Description derivation ───────────────────────────────────────────────────

function deriveDustDescription(itemId, name) {
  // What does this dust produce when used as input?
  const usedIn = Object.entries(recipes).filter(([, r]) => recipeUsesItem(r, itemId));
  if (usedIn.length === 0) {
    return `**${name}** is a dust material in Tech Reborn.`;
  }
  // Pick the most relevant recipe (prefer blast_furnace, then grinder, then anything)
  const priority = ['techreborn:blast_furnace', 'techreborn:industrial_electrolyzer', 'techreborn:centrifuge'];
  let best = usedIn.find(([, r]) => priority[0] === r.type)
    ?? usedIn.find(([, r]) => priority[1] === r.type)
    ?? usedIn.find(([, r]) => priority[2] === r.type)
    ?? usedIn[0];
  const [, bestRecipe] = best;
  const outputs = recipeOutputs(bestRecipe);
  if (outputs.length === 0) {
    return `**${name}** is a dust material in Tech Reborn.`;
  }
  const outName = displayName(outputs[0]);
  const machine = machineName(bestRecipe.type);
  return `**${name}** is a dust used to produce **${outName}** in the ${machine}.`;
}

function deriveSmallPileDescription(itemId, name) {
  // Look for crafting recipe that produces the full dust from this small pile
  const crafting = Object.entries(recipes).find(([, r]) =>
    (r.type === 'minecraft:crafting_shapeless' || r.type === 'minecraft:crafting_shaped') &&
    recipeUsesItem(r, itemId)
  );
  if (crafting) {
    const [, recipe] = crafting;
    const outputs = recipeOutputs(recipe);
    if (outputs.length > 0) {
      const outName = displayName(outputs[0]);
      return `**${name}** — combine 4 in a crafting grid to produce one **${outName}**.`;
    }
  }
  // Fall back to blast furnace use
  const blastUse = Object.entries(recipes).find(([, r]) =>
    r.type === 'techreborn:blast_furnace' && recipeUsesItem(r, itemId)
  );
  if (blastUse) {
    const [, recipe] = blastUse;
    const outputs = recipeOutputs(recipe);
    if (outputs.length > 0) {
      const outName = displayName(outputs[0]);
      return `**${name}** is a small-pile byproduct of ore processing, used in the Industrial Blast Furnace to produce **${outName}**.`;
    }
  }
  return `**${name}** is a small pile of dust in Tech Reborn.`;
}

function deriveIngotDescription(itemId, name) {
  // Find the primary production recipe
  const prods = recipesThatProduce(itemId);
  if (prods.length === 0) {
    return `**${name}** is an ingot in Tech Reborn.`;
  }
  const priority = ['techreborn:blast_furnace', 'minecraft:smelting', 'techreborn:alloy_smelter'];
  const best = prods.find(([, r]) => r.type === priority[0])
    ?? prods.find(([, r]) => r.type === priority[1])
    ?? prods.find(([, r]) => r.type === priority[2])
    ?? prods[0];
  const [, recipe] = best;
  const machine = machineName(recipe.type);
  // Try to describe what goes in
  const ings = recipe.ingredients ?? [];
  const mainIng = ings[0];
  if (mainIng) {
    const ingName = mainIng.id ? displayName(mainIng.id) : (mainIng.tag ? titleCase(shortId(mainIng.tag)) : null);
    if (ingName) {
      return `**${name}** is an ingot produced from **${ingName}** in the ${machine}.`;
    }
  }
  return `**${name}** is an ingot produced in the ${machine}.`;
}

function deriveNuggetDescription(itemId, name) {
  // Find the production recipe
  const prods = recipesThatProduce(itemId);
  if (prods.length === 0) {
    return `**${name}** is a nugget in Tech Reborn.`;
  }
  const [, recipe] = prods[0];
  const machine = machineName(recipe.type);
  const ings = recipe.ingredients ?? [];
  const mainIng = ings[0];
  if (mainIng) {
    const ingName = mainIng.id ? displayName(mainIng.id)
      : mainIng.tag ? titleCase(shortId(mainIng.tag)) : null;
    if (ingName) {
      return `**${name}** is obtained by processing **${ingName}** in the ${machine}.`;
    }
  }
  return `**${name}** is a nugget-form material in Tech Reborn.`;
}

function derivePlateDescription(itemId, name) {
  const prods = recipesThatProduce(itemId);
  const compressor = prods.find(([, r]) => r.type === 'techreborn:compressor');
  if (compressor) {
    const [, recipe] = compressor;
    const ings = recipe.ingredients ?? [];
    const mainIng = ings[0];
    if (mainIng) {
      const ingName = mainIng.id ? displayName(mainIng.id)
        : mainIng.tag ? titleCase(shortId(mainIng.tag)) : null;
      if (ingName) {
        return `**${name}** is a plate made by compressing **${ingName}** in the Compressor.`;
      }
    }
    return `**${name}** is a plate produced in the Compressor.`;
  }
  if (prods.length > 0) {
    const [, recipe] = prods[0];
    const machine = machineName(recipe.type);
    return `**${name}** is a plate produced in the ${machine}.`;
  }
  return `**${name}** is a plate in Tech Reborn.`;
}

// ─── Family configuration ─────────────────────────────────────────────────────

const FAMILIES = [
  {
    category: 'dust',
    folder: 'dusts',
    singular: 'dust',
    label: 'Dusts',
    deriveDesc: deriveDustDescription,
  },
  {
    category: 'small_dust',
    folder: 'small-piles',
    singular: 'small pile of dust',
    label: 'Small Piles',
    deriveDesc: deriveSmallPileDescription,
  },
  {
    category: 'ingot',
    folder: 'ingots',
    singular: 'ingot',
    label: 'Ingots',
    deriveDesc: deriveIngotDescription,
  },
  {
    category: 'nugget',
    folder: 'nuggets',
    singular: 'nugget',
    label: 'Nuggets',
    deriveDesc: deriveNuggetDescription,
  },
  {
    category: 'plate',
    folder: 'plates',
    singular: 'plate',
    label: 'Plates',
    deriveDesc: derivePlateDescription,
  },
];

// ─── Template ─────────────────────────────────────────────────────────────────

function renderRecipesSection(itemId) {
  const prods = recipesThatProduce(itemId);
  if (prods.length === 0) {
    return '_No recipes found in extracted data._';
  }
  return prods
    .map(([key]) => `<RecipeFromData id="${key}" />`)
    .join('\n\n');
}

function renderUsedInSection(itemId) {
  const usedIn = itemsProducedUsing(itemId);
  if (usedIn.length === 0) {
    return '_This item is not a direct ingredient in any extracted recipes._';
  }
  const capped = usedIn.slice(0, 10);
  const lines = capped.map(id => `- <ItemRef id="${id}" />`);
  if (usedIn.length > 10) {
    lines.push(`- _…and ${usedIn.length - 10} more_`);
  }
  return lines.join('\n');
}

function generateMdx(itemId, family) {
  const name = displayName(itemId);
  const short = shortId(itemId);
  const description = family.deriveDesc(itemId, name);
  const recipesSection = renderRecipesSection(itemId);
  const usedInSection = renderUsedInSection(itemId);
  const groupLink = `[${family.label}](../${family.folder})`;

  return `---
title: ${name}
description: ${name} in Tech Reborn
sidebar_label: ${name}
---

<ItemHeader id="${itemId}" />

# ${name}

${description}

## Recipes

${recipesSection}

## Used in

${usedInSection}

## See also

- ${groupLink}
`;
}

// ─── _category_.json ──────────────────────────────────────────────────────────

function categoryJson(label) {
  return JSON.stringify({ label, collapsed: true, collapsible: true }, null, 2) + '\n';
}

// ─── Main ─────────────────────────────────────────────────────────────────────

const VERSIONED_DIR = path.join(ROOT, 'versioned_docs/version-1.20.1');
const hasVersionedDocs = fs.existsSync(VERSIONED_DIR);

let totalCreated = 0;
let totalSkipped = 0;
let totalNoTexture = 0;
let totalVerify = 0;

for (const family of FAMILIES) {
  const docsDirs = [path.join(ROOT, 'docs/materials', family.folder)];
  if (hasVersionedDocs) {
    docsDirs.push(path.join(VERSIONED_DIR, 'materials', family.folder));
  }

  let familyCreated = 0;
  let familySkipped = 0;
  let familyNoTexture = 0;
  let familyVerify = 0;

  const familyItems = Object.entries(items).filter(([, v]) => v.category === family.category);

  for (const docsDir of docsDirs) {
    const categoryJsonPath = path.join(docsDir, '_category_.json');

    if (!DRY_RUN) {
      fs.mkdirSync(docsDir, { recursive: true });
      if (!fs.existsSync(categoryJsonPath)) {
        fs.writeFileSync(categoryJsonPath, categoryJson(family.label));
      }
    }

    for (const [itemId, itemInfo] of familyItems) {
      const short = shortId(itemId);
      const filePath = path.join(docsDir, `${short}.mdx`);

      // Skip existing hand-authored pages
      if (fs.existsSync(filePath)) {
        if (docsDir === docsDirs[0]) familySkipped++;
        continue;
      }

      // Check texture exists
      const textureSrc = itemInfo.texture;
      if (!textureSrc) {
        if (docsDir === docsDirs[0]) {
          console.warn(`  SKIP (no texture): ${itemId}`);
          familyNoTexture++;
        }
        continue;
      }

      const content = generateMdx(itemId, family);

      // Count VERIFY comments (only count once, from first dir)
      if (docsDir === docsDirs[0]) {
        const verifyCount = (content.match(/<!-- VERIFY:/g) || []).length;
        familyVerify += verifyCount;
        familyCreated++;
      }

      if (DRY_RUN) {
        if (docsDir === docsDirs[0]) {
          console.log(`  [dry-run] Would create: ${path.relative(ROOT, filePath)}`);
        }
      } else {
        fs.writeFileSync(filePath, content);
      }
    }
  }

  totalCreated += familyCreated;
  totalSkipped += familySkipped;
  totalNoTexture += familyNoTexture;
  totalVerify += familyVerify;

  console.log(`[${family.label}] created=${familyCreated} skipped=${familySkipped} noTexture=${familyNoTexture} verify=${familyVerify}`);
}

// Rebuild items-with-pages.json from scan (let build-items-with-pages handle it)
if (!DRY_RUN) {
  console.log('\nRun "npm run build-items-with-pages" (or npm start/build) to update items-with-pages.json.');
}

console.log(`\nSummary: created=${totalCreated} skipped=${totalSkipped} noTexture=${totalNoTexture} verify=${totalVerify}`);
