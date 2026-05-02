#!/usr/bin/env node
// Usage:
//   node scripts/extract-tr-data.mjs [--tr-source <path>] [--dry-run]
//
// Reads TechReborn 1.20.1 source to produce:
//   static/img/items/   — item PNGs (flattened)
//   static/img/blocks/  — block PNGs (flattened)
//   static/img/vanilla/ — placeholder dir for vanilla textures (hand-authored later)
//   src/data/recipes.json
//   src/data/items.json
//   src/data/multiblocks.json

import { readFileSync, writeFileSync, mkdirSync, copyFileSync, existsSync, readdirSync, statSync } from 'fs';
import { join, dirname, basename, extname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const WIKI_ROOT = join(__dirname, '..');

// ---------- args ----------
const args = process.argv.slice(2);
const trSourceIdx = args.indexOf('--tr-source');
const TR = trSourceIdx !== -1
  ? args[trSourceIdx + 1]
  : join(WIKI_ROOT, '..', 'TechReborn');
const DRY_RUN = args.includes('--dry-run');

// ---------- paths ----------
const TR_GENERATED = join(TR, 'src', 'main', 'generated', 'data', 'techreborn', 'recipes');
const TR_STATIC    = join(TR, 'src', 'main', 'resources', 'data', 'techreborn', 'recipes');
const TR_TEXTURES  = join(TR, 'src', 'main', 'resources', 'assets', 'techreborn', 'textures');
const TR_LANG      = join(TR, 'src', 'main', 'resources', 'assets', 'techreborn', 'lang', 'en_us.json');
const TR_CONTENT   = join(TR, 'src', 'main', 'java', 'techreborn', 'init', 'TRContent.java');

const OUT_ITEMS_DIR  = join(WIKI_ROOT, 'static', 'img', 'items');
const OUT_BLOCKS_DIR = join(WIKI_ROOT, 'static', 'img', 'blocks');
const OUT_VANILLA_DIR= join(WIKI_ROOT, 'static', 'img', 'vanilla');
const OUT_DATA_DIR   = join(WIKI_ROOT, 'src', 'data');

// ---------- utilities ----------
function warn(msg) { console.warn(`[WARN] ${msg}`); }
function info(msg) { console.log(`[INFO] ${msg}`); }

function ensureDir(dir) {
  if (!DRY_RUN) mkdirSync(dir, { recursive: true });
}

/** Recursively list all files under dir */
function walk(dir, results = []) {
  if (!existsSync(dir)) return results;
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      walk(full, results);
    } else {
      results.push(full);
    }
  }
  return results;
}

/** Read a JSON file, return parsed object or null on error */
function readJSON(path) {
  try {
    return JSON.parse(readFileSync(path, 'utf8'));
  } catch (e) {
    warn(`Failed to parse JSON at ${path}: ${e.message}`);
    return null;
  }
}

// ---------- 1. Copy textures ----------
function copyTextures(srcDir, destDir, kind) {
  ensureDir(destDir);
  const files = walk(srcDir).filter(f => extname(f) === '.png');
  const seen = new Map(); // filename → source path
  let copied = 0;

  for (const src of files) {
    const name = basename(src);
    if (seen.has(name)) {
      const parent = basename(dirname(src));
      const prevParent = basename(dirname(seen.get(name)));
      warn(`Duplicate ${kind} PNG filename "${name}" — found in "${parent}" and "${prevParent}". Namespacing by parent dir.`);
      // Namespace both: parent_filename.png
      const nsName = `${basename(dirname(seen.get(name)))}_${name}`;
      const nsNameNew = `${parent}_${name}`;
      if (!DRY_RUN) {
        copyFileSync(seen.get(name), join(destDir, nsName));
        copyFileSync(src, join(destDir, nsNameNew));
      }
      seen.set(name, src); // keep last for now
    } else {
      seen.set(name, src);
      if (!DRY_RUN) copyFileSync(src, join(destDir, name));
      copied++;
    }
  }
  info(`Copied ${copied} ${kind} PNGs to ${destDir}`);
  return copied;
}

// ---------- 2. Collect recipe files ----------
/**
 * Collect all recipe JSON file paths from a directory tree,
 * keyed by their path relative to the recipes root (e.g. "compressor/copper_plate.json").
 */
function collectRecipeFiles(recipesRoot) {
  const map = new Map();
  if (!existsSync(recipesRoot)) return map;
  for (const full of walk(recipesRoot)) {
    if (extname(full) !== '.json') continue;
    // Build relative path: "compressor/copper_plate.json"
    const rel = full.slice(recipesRoot.length + 1).replace(/\\/g, '/');
    map.set(rel, full);
  }
  return map;
}

/** Derive the recipes.json map key from a relative recipe path and its type string */
function recipeKey(relPath, type) {
  // relPath: "compressor/copper_plate.json" or "crafting_table/cable/copper_cable.json"
  const parts = relPath.split('/');
  const filename = basename(relPath, '.json');

  if (type === 'minecraft:crafting_shaped' || type === 'minecraft:crafting_shapeless' || type === 'minecraft:crafting_special') {
    return `techreborn:crafting/${filename}`;
  }
  if (type && type.startsWith('techreborn:')) {
    const typePath = type.replace('techreborn:', '');
    return `techreborn:${typePath}/${filename}`;
  }
  if (type && type.startsWith('minecraft:')) {
    // smelting, blasting, smoking, etc.
    const typePath = type.replace('minecraft:', '');
    return `techreborn:${typePath}/${filename}`;
  }
  // Fallback: use directory name as type short
  const typeShort = parts.length > 1 ? parts[0].replace('crafting_table', 'crafting') : 'unknown';
  return `techreborn:${typeShort}/${filename}`;
}

/** Normalize an ingredient entry from raw recipe JSON to schema format */
function normalizeIngredient(raw) {
  if (!raw) return null;
  if (Array.isArray(raw)) {
    // Some ingredients are arrays (alternative items) — take first
    return raw.map(normalizeIngredient).filter(Boolean);
  }
  if (raw.tag) {
    return { tag: raw.tag, count: raw.count ?? 1 };
  }
  if (raw.item) {
    return { id: raw.item, count: raw.count ?? 1 };
  }
  // Bare string?
  if (typeof raw === 'string') {
    return { id: raw, count: 1 };
  }
  return null;
}

/** Normalize a result/output entry */
function normalizeOutput(raw) {
  if (!raw) return null;
  if (Array.isArray(raw)) return raw.map(normalizeOutput).filter(Boolean);
  if (typeof raw === 'string') return { id: raw, count: 1 };
  const id = raw.item || raw.id;
  if (!id) {
    warn(`Output entry missing item ID: ${JSON.stringify(raw)}`);
    return null;
  }
  const out = { id, count: raw.count ?? 1 };
  if (raw.chance !== undefined) out.chance = raw.chance;
  if (raw.nbt !== undefined) out.nbt = raw.nbt;
  return out;
}

/** Parse a raw recipe JSON file into our schema entry. Returns [key, entry] or null. */
function parseRecipe(relPath, raw) {
  if (!raw || !raw.type) {
    warn(`Recipe ${relPath} has no type — skipping`);
    return null;
  }

  const type = raw.type;
  const key = recipeKey(relPath, type);

  try {
    if (type === 'minecraft:crafting_shaped') {
      // Normalize key map: each value can be { item } or { tag } → simplify to string or tag obj
      const normalizedKey = {};
      for (const [ch, val] of Object.entries(raw.key ?? {})) {
        if (Array.isArray(val)) {
          // Multiple alternatives — take first, or preserve tag if present
          const first = val[0];
          normalizedKey[ch] = first?.tag ? { tag: first.tag } : (first?.item ?? '?');
        } else if (val.tag) {
          normalizedKey[ch] = { tag: val.tag };
        } else if (val.item) {
          normalizedKey[ch] = val.item;
        } else {
          normalizedKey[ch] = val;
        }
      }
      const resultItem = raw.result?.item ?? raw.result;
      return [key, {
        type,
        pattern: raw.pattern,
        key: normalizedKey,
        output: { id: resultItem, count: raw.result?.count ?? 1 },
      }];
    }

    if (type === 'minecraft:crafting_shapeless') {
      const ingredients = (raw.ingredients ?? []).map(normalizeIngredient).filter(Boolean);
      const resultItem = raw.result?.item ?? raw.result;
      return [key, {
        type,
        ingredients,
        output: { id: resultItem, count: raw.result?.count ?? 1 },
      }];
    }

    // Vanilla smelting / blasting / smoking
    if (['minecraft:smelting', 'minecraft:blasting', 'minecraft:smoking', 'minecraft:campfire_cooking'].includes(type)) {
      const ing = normalizeIngredient(raw.ingredient);
      const resultItem = raw.result?.item ?? raw.result;
      const entry = {
        type,
        ingredient: ing,
        output: { id: resultItem, count: raw.result?.count ?? 1 },
      };
      if (raw.experience !== undefined) entry.experience = raw.experience;
      if (raw.cookingtime !== undefined) entry.cookingtime = raw.cookingtime;
      return [key, entry];
    }

    // TechReborn machine recipes
    if (type.startsWith('techreborn:')) {
      const ingredients = (raw.ingredients ?? []).map(normalizeIngredient).filter(Boolean);
      const outputs = (raw.results ?? []).map(normalizeOutput).filter(Boolean);

      if (ingredients.length === 0) {
        warn(`Machine recipe ${relPath} has no ingredients — skipping`);
        return null;
      }
      if (outputs.length === 0) {
        warn(`Machine recipe ${relPath} has no outputs — skipping`);
        return null;
      }

      const entry = { type, ingredients, outputs };
      if (raw.power !== undefined) entry.power = raw.power;
      if (raw.time !== undefined) entry.time = raw.time;
      if (raw.heat !== undefined) entry.heat = raw.heat;
      if (raw.fluid_per_tick !== undefined) entry.fluid_per_tick = raw.fluid_per_tick;

      return [key, entry];
    }

    warn(`Unknown recipe type "${type}" in ${relPath} — skipping`);
    return null;
  } catch (e) {
    warn(`Failed to parse recipe ${relPath}: ${e.message}`);
    return null;
  }
}

function buildRecipesJson() {
  // Load both recipe file sets; generated takes precedence over static
  const staticFiles    = collectRecipeFiles(TR_STATIC);
  const generatedFiles = collectRecipeFiles(TR_GENERATED);

  const merged = new Map([...staticFiles, ...generatedFiles]); // generated overwrites static

  const recipes = {};
  let parsed = 0, skipped = 0;
  const keyConflicts = new Map(); // key → count

  for (const [relPath, fullPath] of merged) {
    const raw = readJSON(fullPath);
    if (!raw) { skipped++; continue; }

    const result = parseRecipe(relPath, raw);
    if (!result) { skipped++; continue; }

    const [key, entry] = result;

    if (recipes[key]) {
      // Conflict: same key, different recipe
      const n = (keyConflicts.get(key) ?? 1) + 1;
      keyConflicts.set(key, n);
      const newKey = `${key}_${n}`;
      warn(`Key conflict for "${key}" — using "${newKey}" for ${relPath}`);
      recipes[newKey] = entry;
    } else {
      recipes[key] = entry;
    }
    parsed++;
  }

  info(`Parsed ${parsed} recipes, skipped ${skipped}`);
  return recipes;
}

// ---------- 3. Build items.json ----------

// Enum → category mapping
const ENUM_CATEGORY = {
  Dusts: 'dust',
  SmallDusts: 'small_dust',
  Ingots: 'ingot',
  Nuggets: 'nugget',
  Plates: 'plate',
  Gems: 'gem',
  Parts: 'part',
  Ores: 'ore',
  RawMetals: 'raw_metal',
  StorageBlocks: 'storage_block',
  Cables: 'cable',
  StorageUnit: 'storage_unit',
  TankUnit: 'tank_unit',
  SolarPanels: 'solar_panel',
  Machine: 'machine',
  Upgrades: 'upgrade',
};

// Enum → item ID suffix mapping
const ENUM_SUFFIX = {
  Dusts: '_dust',
  SmallDusts: '_small_dust',
  Ingots: '_ingot',
  Nuggets: '_nugget',
  Plates: '_plate',
  Gems: '',       // gems use bare name (e.g. ruby, sapphire)
  Parts: '',      // parts use bare name
  Ores: '_ore',
  RawMetals: '_raw_metal', // actually "raw_<metal>"
  StorageBlocks: '_storage_block',
  Cables: '_cable',
  StorageUnit: '_storage_unit',
  TankUnit: '_tank',
  SolarPanels: '_solar_panel',
  Machine: '',    // machines use lowercase name directly
  Upgrades: '_upgrade',
};

/** Parse Java enum members from source. Returns array of constant names (UPPER_CASE). */
function parseEnumMembers(javaSource, enumName) {
  const startIdx = javaSource.indexOf(`enum ${enumName}`);
  if (startIdx === -1) return [];

  const bodyStart = javaSource.indexOf('{', startIdx) + 1;
  // Walk to the first ';' at paren depth 0 (end of enum constants)
  let depth = 0;
  let i = bodyStart;
  while (i < javaSource.length) {
    const ch = javaSource[i];
    if (ch === '(') depth++;
    else if (ch === ')') depth--;
    else if (ch === ';' && depth === 0) break;
    i++;
  }
  const section = javaSource.slice(bodyStart, i);
  const members = [];
  let currentSegment = "";
  let parenDepth = 0;
  for (let j = 0; j < section.length; j++) {
    const char = section[j];
    if (char === '(') parenDepth++;
    else if (char === ')') parenDepth--;
    else if (char === ',' && parenDepth === 0) {
      const match = currentSegment.match(/\b([A-Z][A-Z0-9_]+)\b/);
      if (match) members.push(match[1]);
      currentSegment = "";
      continue;
    }
    currentSegment += char;
  }
  if (currentSegment.trim()) {
    const match = currentSegment.match(/\b([A-Z][A-Z0-9_]+)\b/);
    if (match) members.push(match[1]);
  }
  return members;
}

/** Derive a TR item ID from an enum name and member constant */
function enumMemberToItemId(enumName, member) {
  const baseName = member.toLowerCase();
  switch (enumName) {
    case 'Dusts':        return `techreborn:${baseName}_dust`;
    case 'SmallDusts':   return `techreborn:${baseName}_small_dust`;
    case 'Ingots':       return `techreborn:${baseName}_ingot`;
    case 'Nuggets':      return `techreborn:${baseName}_nugget`;
    case 'Plates':       return `techreborn:${baseName}_plate`;
    case 'Gems':         return `techreborn:${baseName}`;
    case 'Parts':        return `techreborn:${baseName}`;
    case 'Ores':         return `techreborn:${baseName}_ore`;
    case 'RawMetals':    return `techreborn:raw_${baseName}`;
    case 'StorageBlocks':return `techreborn:${baseName}_storage_block`;
    case 'Cables':       return `techreborn:${baseName}_cable`;
    case 'StorageUnit':  return `techreborn:${baseName}_storage_unit`;
    case 'TankUnit':     return `techreborn:${baseName}_tank`;
    case 'SolarPanels':  return `techreborn:${baseName}_solar_panel`;
    case 'Machine':      return `techreborn:${baseName}`;
    case 'Upgrades':     return `techreborn:${baseName}_upgrade`;
    default:             return `techreborn:${baseName}`;
  }
}

/** Derive a display name from an item ID (snake_case → Title Case) */
function idToDisplayName(id) {
  const path = id.includes(':') ? id.split(':')[1] : id;
  return path.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}

/** Determine the texture path for an item, based on what was copied */
function texturePathForItem(id, copiedItems, copiedBlocks) {
  const path = id.includes(':') ? id.split(':')[1] : id;
  const filename = `${path}.png`;
  if (copiedItems.has(filename)) return `/img/items/${filename}`;
  if (copiedBlocks.has(filename)) return `/img/blocks/${filename}`;
  return null;
}

function buildItemsJson(lang, javaSource, copiedItems, copiedBlocks) {
  const items = {};

  for (const [enumName, category] of Object.entries(ENUM_CATEGORY)) {
    const members = parseEnumMembers(javaSource, enumName);

    for (const member of members) {
      const id = enumMemberToItemId(enumName, member);

      // Display name from lang file
      const path = id.split(':')[1];
      const langKeyItem  = `item.techreborn.${path}`;
      const langKeyBlock = `block.techreborn.${path}`;
      let displayName = lang[langKeyItem] ?? lang[langKeyBlock];
      if (!displayName) {
        displayName = idToDisplayName(id);
        // Only warn for TR items (not vanilla cross-references)
        warn(`No lang entry for ${id} — derived: "${displayName}"`);
      }

      const texturePath = texturePathForItem(id, copiedItems, copiedBlocks);
      if (!texturePath) {
        warn(`No texture found for ${id}`);
      }

      items[id] = {
        displayName,
        texture: texturePath ?? `/img/items/${path}.png`,
        category,
      };
    }
  }

  info(`Built items.json with ${Object.keys(items).length} entries`);
  return items;
}

// ---------- 4. Main ----------
async function main() {
  console.log(`TR source: ${TR}`);
  console.log(`Dry run:   ${DRY_RUN}`);

  // Verify TR source
  if (!existsSync(TR)) {
    console.error(`ERROR: TR source not found at ${TR}`);
    process.exit(1);
  }
  if (!existsSync(TR_GENERATED) && !existsSync(TR_STATIC)) {
    console.error(`ERROR: No recipe directories found under ${TR}`);
    process.exit(1);
  }
  if (!existsSync(TR_GENERATED)) {
    warn('Datagen output not found — using static source recipes only. Run ./gradlew runDatagen first for complete data.');
  }

  // 1. Copy textures, track filenames
  ensureDir(OUT_ITEMS_DIR);
  ensureDir(OUT_BLOCKS_DIR);
  ensureDir(OUT_VANILLA_DIR);

  const itemFiles  = walk(join(TR_TEXTURES, 'item')).filter(f => extname(f) === '.png');
  const blockFiles = walk(join(TR_TEXTURES, 'block')).filter(f => extname(f) === '.png');

  const copiedItems  = new Set();
  const copiedBlocks = new Set();

  // Track duplicates to apply namespacing
  const itemNameCount  = new Map();
  const blockNameCount = new Map();
  for (const f of itemFiles)  itemNameCount.set(basename(f),  (itemNameCount.get(basename(f))  ?? 0) + 1);
  for (const f of blockFiles) blockNameCount.set(basename(f), (blockNameCount.get(basename(f)) ?? 0) + 1);

  for (const src of itemFiles) {
    const name = basename(src);
    let dest = name;
    if (itemNameCount.get(name) > 1) {
      dest = `${basename(dirname(src))}_${name}`;
      warn(`Duplicate item PNG "${name}" — namespaced to "${dest}"`);
    }
    if (!DRY_RUN) copyFileSync(src, join(OUT_ITEMS_DIR, dest));
    copiedItems.add(dest);
  }

  for (const src of blockFiles) {
    const name = basename(src);
    let dest = name;
    if (blockNameCount.get(name) > 1) {
      dest = `${basename(dirname(src))}_${name}`;
      warn(`Duplicate block PNG "${name}" — namespaced to "${dest}"`);
    }
    if (!DRY_RUN) copyFileSync(src, join(OUT_BLOCKS_DIR, dest));
    copiedBlocks.add(dest);
  }

  info(`Copied ${copiedItems.size} item PNGs`);
  info(`Copied ${copiedBlocks.size} block PNGs`);
  info(`Vanilla placeholder dir created at ${OUT_VANILLA_DIR} (hand-author textures later)`);

  // 2. Build recipes.json
  const recipes = buildRecipesJson();

  const vanillaRefs = new Set();
  for (const recipe of Object.values(recipes)) {
    if (recipe.ingredients) {
      for (const ing of recipe.ingredients) {
        if (ing.id && ing.id.startsWith('minecraft:')) vanillaRefs.add(ing.id);
      }
    }
    if (recipe.ingredient && recipe.ingredient.id && recipe.ingredient.id.startsWith('minecraft:')) {
      vanillaRefs.add(recipe.ingredient.id);
    }
    if (recipe.key) {
      for (const val of Object.values(recipe.key)) {
        if (typeof val === 'string' && val.startsWith('minecraft:')) vanillaRefs.add(val);
      }
    }
    if (recipe.outputs) {
      for (const out of recipe.outputs) {
        if (out.id && out.id.startsWith('minecraft:')) vanillaRefs.add(out.id);
      }
    }
    if (recipe.output && recipe.output.id && recipe.output.id.startsWith('minecraft:')) {
      vanillaRefs.add(recipe.output.id);
    }
  }

  let missingVanilla = 0;
  for (const ref of vanillaRefs) {
    const filename = `${ref.replace('minecraft:', '')}.png`;
    if (!existsSync(join(OUT_VANILLA_DIR, filename))) {
      warn(`MISSING VANILLA TEXTURE: ${ref}`);
      missingVanilla++;
    }
  }

  // 3. Build items.json
  const lang = readJSON(TR_LANG) ?? {};
  const javaSource = existsSync(TR_CONTENT) ? readFileSync(TR_CONTENT, 'utf8') : '';
  if (!javaSource) warn('TRContent.java not found — items.json will be empty');

  const itemsJson = buildItemsJson(lang, javaSource, copiedItems, copiedBlocks);

  // 4. Write output files
  ensureDir(OUT_DATA_DIR);

  if (!DRY_RUN) {
    writeFileSync(join(OUT_DATA_DIR, 'recipes.json'), JSON.stringify(recipes, null, 2), 'utf8');
    writeFileSync(join(OUT_DATA_DIR, 'items.json'),   JSON.stringify(itemsJson, null, 2), 'utf8');
    writeFileSync(join(OUT_DATA_DIR, 'multiblocks.json'), '{}', 'utf8');
  }

  // 5. Summary
  console.log('\n=== EXTRACTION SUMMARY ===');
  console.log(`  Item PNGs:    ${copiedItems.size}`);
  console.log(`  Block PNGs:   ${copiedBlocks.size}`);
  console.log(`  Recipes:      ${Object.keys(recipes).length}`);
  console.log(`  Items:        ${Object.keys(itemsJson).length}`);
  if (DRY_RUN) console.log('\nDRY RUN — no files written.');
}

main().catch(e => { console.error(e); process.exit(1); });
