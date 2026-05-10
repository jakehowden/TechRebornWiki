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
const itemsWithPages = JSON.parse(fs.readFileSync(path.join(ROOT, 'docs/items-with-pages.json'), 'utf8'));
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
  const prods = recipesThatProduce(itemId);
  if (prods.length === 0) {
    return `**${name}** is an ingot in Tech Reborn.`;
  }
  const priority = ['techreborn:blast_furnace', 'minecraft:smelting', 'techreborn:alloy_smelter'];

  function firstIngId(recipe) {
    const first = (recipe.ingredients ?? [])[0] ?? recipe.ingredient;
    if (!first) return null;
    return first.id ?? first.tag ?? null;
  }

  // Drop recipes whose primary ingredient is a tool or armor piece
  const filtered = prods.filter(([, r]) => {
    const id = firstIngId(r);
    if (!id) return true;
    const short = shortId(id);
    return !TOOL_ARMOR_PATTERNS.some(p => short.includes(p));
  });
  const candidates = filtered.length > 0 ? filtered : prods;

  // Within the remaining candidates, prefer dust-based recipes
  const stem = shortId(itemId).replace(/_ingot$/, '');
  const dustPool = candidates.filter(([, r]) => {
    const id = firstIngId(r);
    if (!id) return false;
    const short = shortId(id);
    return short.endsWith('_dust') || short === `${stem}_dust`;
  });
  const pool = dustPool.length > 0 ? dustPool : candidates;

  const best = pool.find(([, r]) => r.type === priority[0])
    ?? pool.find(([, r]) => r.type === priority[1])
    ?? pool.find(([, r]) => r.type === priority[2])
    ?? pool[0];
  const [, recipe] = best;
  const machine = machineName(recipe.type);
  const mainIng = (recipe.ingredients ?? [])[0] ?? recipe.ingredient;
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

// ─── Description derivation — new families ────────────────────────────────────

function derivePartDescription(itemId, name) {
  const prods = recipesThatProduce(itemId);
  if (prods.length === 0) {
    return `**${name}** is a crafted component in Tech Reborn. <!-- VERIFY: write description for ${itemId} -->`;
  }
  const priority = ['techreborn:assembling_machine', 'minecraft:crafting_shaped', 'minecraft:crafting_shapeless', 'techreborn:compressor'];
  const best = prods.find(([, r]) => r.type === priority[0])
    ?? prods.find(([, r]) => r.type === priority[1])
    ?? prods.find(([, r]) => r.type === priority[2])
    ?? prods.find(([, r]) => r.type === priority[3])
    ?? prods[0];
  const [, recipe] = best;
  const machine = machineName(recipe.type);
  return `**${name}** is a crafted component used in various Tech Reborn recipes. It is produced in the ${machine}.`;
}

function deriveGemDescription(itemId, name) {
  const prods = recipesThatProduce(itemId);
  if (prods.length === 0) {
    return `**${name}** is a gem found in the world as an ore drop in Tech Reborn.`;
  }
  const best = prods.find(([, r]) => r.type === 'techreborn:industrial_grinder')
    ?? prods.find(([, r]) => r.type === 'techreborn:grinder')
    ?? prods[0];
  const [, recipe] = best;
  const machine = machineName(recipe.type);
  const ings = recipe.ingredients ?? [];
  const mainIng = ings[0];
  if (mainIng) {
    const ingName = mainIng.id ? displayName(mainIng.id)
      : mainIng.tag ? titleCase(shortId(mainIng.tag)) : null;
    if (ingName) {
      return `**${name}** is a gem obtained by processing **${ingName}** in the ${machine}.`;
    }
  }
  return `**${name}** is a gem material produced in the ${machine}.`;
}

function deriveRawMetalDescription(itemId, name) {
  const usedIn = Object.entries(recipes).filter(([, r]) => recipeUsesItem(r, itemId));
  if (usedIn.length === 0) {
    return `**${name}** is a raw ore drop in Tech Reborn. <!-- VERIFY: write description for ${itemId} -->`;
  }
  const priority = ['techreborn:blast_furnace', 'minecraft:smelting', 'minecraft:blasting'];
  const best = usedIn.find(([, r]) => r.type === priority[0])
    ?? usedIn.find(([, r]) => r.type === priority[1])
    ?? usedIn.find(([, r]) => r.type === priority[2])
    ?? usedIn[0];
  const [, recipe] = best;
  const outputs = recipeOutputs(recipe);
  if (outputs.length > 0) {
    const outName = displayName(outputs[0]);
    const machine = machineName(recipe.type);
    return `**${name}** is dropped by mining ore. Smelt it in the ${machine} to produce **${outName}**.`;
  }
  return `**${name}** is a raw ore drop in Tech Reborn.`;
}

function deriveStorageBlockDescription(itemId, name) {
  const prods = recipesThatProduce(itemId);
  if (prods.length === 0) {
    return `**${name}** is a compact storage block in Tech Reborn. <!-- VERIFY: write description for ${itemId} -->`;
  }
  const shaped = prods.find(([, r]) => r.type === 'minecraft:crafting_shaped') ?? prods[0];
  const [, recipe] = shaped;
  if (recipe.key) {
    const firstVal = Object.values(recipe.key)[0];
    if (firstVal) {
      const ingName = typeof firstVal === 'string' ? displayName(firstVal)
        : firstVal.id ? displayName(firstVal.id)
        : firstVal.tag ? titleCase(shortId(firstVal.tag)) : null;
      if (ingName) {
        return `**${name}** is a compact storage block. Craft 9× **${ingName}** in a crafting grid to create one, or reverse the recipe to retrieve them.`;
      }
    }
  }
  if (recipe.ingredients?.length > 0) {
    const ing = recipe.ingredients[0];
    const ingName = ing.id ? displayName(ing.id) : ing.tag ? titleCase(shortId(ing.tag)) : null;
    if (ingName) {
      return `**${name}** is a compact storage block crafted from 9× **${ingName}**.`;
    }
  }
  return `**${name}** is a compact storage block in Tech Reborn.`;
}

function deriveCableDescription(itemId, name) {
  const prods = recipesThatProduce(itemId);
  if (prods.length === 0) {
    return `**${name}** is a power cable in Tech Reborn. <!-- VERIFY: write description for ${itemId} -->`;
  }
  const best = prods.find(([, r]) => r.type === 'techreborn:wire_mill')
    ?? prods.find(([, r]) => r.type === 'minecraft:crafting_shaped')
    ?? prods[0];
  const [, recipe] = best;
  const machine = machineName(recipe.type);
  return `**${name}** is a power cable in Tech Reborn, produced in the ${machine}.`;
}

function deriveStorageUnitDescription(itemId, name) {
  const prods = recipesThatProduce(itemId);
  if (prods.length === 0) {
    return `**${name}** is an item storage unit in Tech Reborn.`;
  }
  const best = prods.find(([, r]) => r.type === 'techreborn:assembling_machine')
    ?? prods.find(([, r]) => r.type === 'minecraft:crafting_shaped')
    ?? prods[0];
  const [, recipe] = best;
  const machine = machineName(recipe.type);
  return `**${name}** is an item storage unit in Tech Reborn, produced in the ${machine}.`;
}

function deriveTankUnitDescription(itemId, name) {
  const prods = recipesThatProduce(itemId);
  if (prods.length === 0) {
    return `**${name}** is a portable fluid storage tank in Tech Reborn.`;
  }
  const best = prods.find(([, r]) => r.type === 'techreborn:assembling_machine')
    ?? prods.find(([, r]) => r.type === 'minecraft:crafting_shaped')
    ?? prods[0];
  const [, recipe] = best;
  const machine = machineName(recipe.type);
  return `**${name}** is a fluid storage tank in Tech Reborn, produced in the ${machine}.`;
}

function deriveGenericDescription(itemId, name) {
  return `**${name}** is an item in Tech Reborn. <!-- VERIFY: write description for ${itemId} -->`;
}

// ─── Ore dimension map (verified from docs/world/ores.mdx) ────────────────────

const ORE_DIMENSION_MAP = {
  'techreborn:bauxite_ore': 'Overworld',
  'techreborn:galena_ore': 'Overworld',
  'techreborn:iridium_ore': 'Overworld',
  'techreborn:lead_ore': 'Overworld',
  'techreborn:ruby_ore': 'Overworld',
  'techreborn:sapphire_ore': 'Overworld',
  'techreborn:silver_ore': 'Overworld',
  'techreborn:tin_ore': 'Overworld',
  'techreborn:deepslate_bauxite_ore': 'Overworld deepslate',
  'techreborn:deepslate_galena_ore': 'Overworld deepslate',
  'techreborn:deepslate_iridium_ore': 'Overworld deepslate',
  'techreborn:deepslate_lead_ore': 'Overworld deepslate',
  'techreborn:deepslate_ruby_ore': 'Overworld deepslate',
  'techreborn:deepslate_sapphire_ore': 'Overworld deepslate',
  'techreborn:deepslate_silver_ore': 'Overworld deepslate',
  'techreborn:deepslate_tin_ore': 'Overworld deepslate',
  'techreborn:pyrite_ore': 'Nether',
  'techreborn:cinnabar_ore': 'Nether',
  'techreborn:sphalerite_ore': 'Nether',
  'techreborn:peridot_ore': 'End',
  'techreborn:sodalite_ore': 'End',
  'techreborn:sheldonite_ore': 'End',
  'techreborn:tungsten_ore': 'End',
};

function deriveOreDescription(itemId, name) {
  const dim = ORE_DIMENSION_MAP[itemId];
  if (!dim) {
    return `**${name}** is a Tech Reborn ore block. Mine and process via the Industrial Grinder (boosted yield) or Furnace. <!-- VERIFY: dimension for ${itemId} -->`;
  }
  return `**${name}** is a Tech Reborn ore block found in the ${dim}. Mine and process via the Industrial Grinder (boosted yield) or Furnace.`;
}

function getHowToObtainOre(itemId, _name) {
  const dim = ORE_DIMENSION_MAP[itemId];
  if (!dim) {
    return `Found in world generation. Mine with a pickaxe to obtain the ore drop. Use Silk Touch to collect the block itself.\n\n<!-- VERIFY: dimension and Y-level distribution for ${itemId} -->`;
  }
  if (dim === 'Overworld') {
    return `Found in Overworld stone layers during world generation. Mine with a pickaxe to obtain the ore drop, or use Silk Touch to collect the block itself.\n\n<!-- VERIFY: exact Y-level distribution for ${itemId} -->`;
  }
  if (dim === 'Overworld deepslate') {
    return `Found in deep Overworld layers (deepslate zone, typically below Y 0) during world generation. Mine with a pickaxe to obtain the ore drop, or use Silk Touch to collect the block itself.\n\n<!-- VERIFY: exact Y-level distribution for ${itemId} -->`;
  }
  if (dim === 'Nether') {
    return `Found in the Nether during world generation. Mine with a pickaxe to obtain the ore drop, or use Silk Touch to collect the block itself.\n\n<!-- VERIFY: Y-level distribution in the Nether for ${itemId} -->`;
  }
  if (dim === 'End') {
    return `Found in The End during world generation. Mine with a pickaxe to obtain the ore drop, or use Silk Touch to collect the block itself.\n\n<!-- VERIFY: spawn conditions and Y-level for ${itemId} -->`;
  }
  return `Found in world generation. Mine with a pickaxe to obtain the ore drop. Use Silk Touch to collect the block itself.\n\n<!-- VERIFY: dimension and Y-level distribution for ${itemId} -->`;
}

// ─── Tool / armor id patterns (excluded from catch-all generation) ─────────────

const TOOL_ARMOR_PATTERNS = [
  'axe', 'sword', 'pickaxe', 'spade', 'shovel', 'hoe',
  'helmet', 'chestplate', 'leggings', 'boots',
  'chainsaw', 'drill', 'mining_tool', 'jackhammer',
  'scanner', 'wrench', 'omni_tool', 'nanosaber', 'rock_cutter',
];

// ─── Family configuration ─────────────────────────────────────────────────────
//
// relDir   — path relative to docs/ (and to versioned_docs/version-1.20.1/)
// seeAlsoLink — MDX link text for the "See also" section (null = omit the section)
// filter   — optional (itemId) => bool; if provided, only matching items are generated

const FAMILIES = [
  {
    category: 'dust',
    relDir: 'materials/dusts',
    singular: 'dust',
    label: 'Dusts',
    deriveDesc: deriveDustDescription,
    seeAlsoLink: '[Dusts](../dusts)',
  },
  {
    category: 'small_dust',
    relDir: 'materials/small-piles',
    singular: 'small pile of dust',
    label: 'Small Piles',
    deriveDesc: deriveSmallPileDescription,
    seeAlsoLink: '[Small Piles](../small-piles)',
  },
  {
    category: 'ingot',
    relDir: 'materials/ingots',
    singular: 'ingot',
    label: 'Ingots',
    deriveDesc: deriveIngotDescription,
    seeAlsoLink: '[Ingots](../ingots)',
  },
  {
    category: 'nugget',
    relDir: 'materials/nuggets',
    singular: 'nugget',
    label: 'Nuggets',
    deriveDesc: deriveNuggetDescription,
    seeAlsoLink: '[Nuggets](../nuggets)',
  },
  {
    category: 'plate',
    relDir: 'materials/plates',
    singular: 'plate',
    label: 'Plates',
    deriveDesc: derivePlateDescription,
    seeAlsoLink: '[Plates](../plates)',
  },
  {
    category: 'part',
    relDir: 'materials/parts',
    singular: 'part',
    label: 'Parts',
    deriveDesc: derivePartDescription,
    seeAlsoLink: '[Materials](../)',
    filter: (itemId) => !itemsWithPages[itemId],
  },
  {
    category: 'gem',
    relDir: 'materials/gems-individual',
    singular: 'gem',
    label: 'Gems',
    deriveDesc: deriveGemDescription,
    seeAlsoLink: '[Gems](../gems)',
    filter: (itemId) => !itemsWithPages[itemId],
  },
  {
    category: 'raw_metal',
    relDir: 'materials/raw-metals-individual',
    singular: 'raw metal',
    label: 'Raw Metals',
    deriveDesc: deriveRawMetalDescription,
    seeAlsoLink: '[Raw Metals](../raw-metals)',
    filter: (itemId) => !itemsWithPages[itemId],
  },
  {
    category: 'storage_block',
    relDir: 'materials/storage-blocks-individual',
    singular: 'storage block',
    label: 'Storage Blocks',
    deriveDesc: deriveStorageBlockDescription,
    seeAlsoLink: '[Storage Blocks](../storage-blocks)',
    filter: (itemId) => !itemsWithPages[itemId],
  },
  {
    category: 'cable',
    relDir: 'power/cables/per-cable',
    singular: 'cable',
    label: 'Cables',
    deriveDesc: deriveCableDescription,
    seeAlsoLink: '[Cables](../)',
    filter: (itemId) => !itemsWithPages[itemId],
  },
  {
    category: 'storage_unit',
    relDir: 'storage/units',
    singular: 'storage unit',
    label: 'Storage Units',
    deriveDesc: deriveStorageUnitDescription,
    seeAlsoLink: '[Storage](../)',
    filter: (itemId) => !itemsWithPages[itemId],
  },
  {
    category: 'tank_unit',
    relDir: 'storage/tank-units',
    singular: 'tank unit',
    label: 'Tank Units',
    deriveDesc: deriveTankUnitDescription,
    seeAlsoLink: '[Storage](../)',
    filter: (itemId) => !itemsWithPages[itemId],
  },
  {
    category: 'ore',
    relDir: 'world/ores-individual',
    singular: 'ore',
    label: 'Ores',
    deriveDesc: deriveOreDescription,
    getHowToObtain: getHowToObtainOre,
    seeAlsoLink: '[Ores](../ores)',
    filter: (itemId) => !itemsWithPages[itemId],
  },
  {
    category: 'item',
    relDir: 'items',
    singular: 'item',
    label: 'Items',
    deriveDesc: deriveGenericDescription,
    seeAlsoLink: null,
    filter: (itemId) => {
      if (!itemId.startsWith('techreborn:')) return false;
      if (itemsWithPages[itemId]) return false;
      const short = itemId.split(':')[1];
      return !TOOL_ARMOR_PATTERNS.some(p => short.includes(p));
    },
  },
  {
    category: 'block',
    relDir: 'blocks/misc-generated',
    singular: 'block',
    label: 'Misc Blocks',
    deriveDesc: deriveGenericDescription,
    seeAlsoLink: null,
    filter: (itemId) => itemId.startsWith('techreborn:') && !itemsWithPages[itemId],
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
  const description = family.deriveDesc(itemId, name);
  const mainSection = family.getHowToObtain
    ? `## How to obtain\n\n${family.getHowToObtain(itemId, name)}`
    : `## Recipes\n\n${renderRecipesSection(itemId)}`;
  const usedInSection = renderUsedInSection(itemId);
  const seeAlso = family.seeAlsoLink
    ? `\n## See also\n\n- ${family.seeAlsoLink}\n`
    : '';

  return `---
title: ${name}
description: ${name} in Tech Reborn
sidebar_label: ${name}
---

<ItemHeader id="${itemId}" />

# ${name}

${description}

${mainSection}

## Used in

${usedInSection}
${seeAlso}`;
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
  const docsDirs = [path.join(ROOT, 'docs', family.relDir)];
  if (hasVersionedDocs) {
    docsDirs.push(path.join(VERSIONED_DIR, family.relDir));
  }

  let familyCreated = 0;
  let familySkipped = 0;
  let familyNoTexture = 0;
  let familyVerify = 0;

  const familyItems = Object.entries(items).filter(([id, v]) => {
    if (v.category !== family.category) return false;
    if (family.filter && !family.filter(id)) return false;
    return true;
  });

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
