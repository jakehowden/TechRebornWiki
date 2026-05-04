/*
 * Populates static/img/vanilla/ with PNG icons for every minecraft:* id
 * referenced in src/data/recipes.json.
 *
 * Run: `npm run vanilla-textures`
 *
 * Idempotent: skips files already present. To force a refresh, delete the
 * target file (or the whole directory) before re-running.
 *
 * Source: https://github.com/PrismarineJS/minecraft-assets (data/1.20.2,
 * the closest tagged version to TR's 1.20.1). Underlying assets are
 * © Mojang Studios — see NOTICE.md.
 */
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const RECIPES = path.join(ROOT, 'src', 'data', 'recipes.json');
const OUT_DIR = path.join(ROOT, 'static', 'img', 'vanilla');
const VERSION = '1.20.2'; // closest tagged version in PrismarineJS minecraft-assets to TR's 1.20.1
const BASE = `https://raw.githubusercontent.com/PrismarineJS/minecraft-assets/master/data/${VERSION}`;

function collectMinecraftIds(node, out) {
  if (node === null || node === undefined) return;
  if (typeof node === 'string') {
    if (node.startsWith('minecraft:')) out.add(node.slice('minecraft:'.length));
    return;
  }
  if (Array.isArray(node)) {
    for (const child of node) collectMinecraftIds(child, out);
    return;
  }
  if (typeof node === 'object') {
    for (const value of Object.values(node)) collectMinecraftIds(value, out);
  }
}

async function tryFetch(url) {
  const res = await fetch(url);
  if (res.status === 200) {
    const buf = Buffer.from(await res.arrayBuffer());
    return buf;
  }
  return null;
}

// For variant blocks that don't have their own PNG (e.g. oak_slab uses oak_planks),
// generate a list of fallback texture names to try in order.
function fallbackNames(name) {
  const out = [];

  // Strip plural "s" tag-like names: "oak_logs" -> "oak_log", "wooden_doors" -> "wooden_door"
  if (name.endsWith('_logs')) out.push(name.slice(0, -1), name.slice(0, -1) + '_top');
  if (name.endsWith('_stems')) out.push(name.slice(0, -1), name.slice(0, -1) + '_top');

  // Wood variants -> planks
  for (const suffix of ['_slab', '_stairs', '_fence', '_fence_gate', '_pressure_plate', '_button', '_trapdoor', '_door', '_sign']) {
    if (name.endsWith(suffix)) {
      const base = name.slice(0, -suffix.length);
      out.push(`${base}_planks`);
      break;
    }
  }

  // Bed/carpet -> wool
  if (name.endsWith('_bed')) out.push(name.replace('_bed', '_wool'));
  if (name.endsWith('_carpet')) out.push(name.replace('_carpet', '_wool'));

  // Stained glass pane -> stained glass
  if (name.endsWith('_stained_glass_pane')) out.push(name.replace('_stained_glass_pane', '_stained_glass'));

  // Hyphae (stripped log variants for nether wood)
  if (name === 'crimson_hyphae') out.push('crimson_stem', 'crimson_log');
  if (name === 'warped_hyphae') out.push('warped_stem', 'warped_log');
  if (name === 'stripped_crimson_hyphae') out.push('stripped_crimson_stem');
  if (name === 'stripped_warped_hyphae') out.push('stripped_warped_stem');

  // Multi-face blocks: try common face filenames
  const sideFaces = {
    furnace: ['furnace_front', 'furnace_side'],
    crafting_table: ['crafting_table_front', 'crafting_table_top'],
    chest: ['oak_planks'],
    ender_chest: ['obsidian'],
    piston: ['piston_top', 'piston_side'],
    sticky_piston: ['piston_top_sticky', 'piston_side'],
    tnt: ['tnt_side'],
    pumpkin: ['pumpkin_side', 'pumpkin_top'],
    grass_block: ['grass_block_top', 'grass_block_side'],
    mycelium: ['mycelium_top', 'mycelium_side'],
    podzol: ['podzol_top', 'podzol_side'],
    magma_block: ['magma'],
    ancient_debris: ['ancient_debris_side', 'ancient_debris_top'],
    cactus: ['cactus_side', 'cactus_top'],
    glass_pane: ['glass'],
    iron_bars: ['iron_bars'],
    nether_brick_fence: ['nether_bricks'],
    sculk_sensor: ['sculk_sensor_side'],
    sculk_shrieker: ['sculk_shrieker_side'],
    sculk_catalyst: ['sculk_catalyst_side', 'sculk_catalyst_top'],
    ochre_froglight: ['ochre_froglight_side', 'ochre_froglight_top'],
    verdant_froglight: ['verdant_froglight_side', 'verdant_froglight_top'],
    pearlescent_froglight: ['pearlescent_froglight_side', 'pearlescent_froglight_top'],
    smooth_sandstone: ['sandstone_top'],
    smooth_red_sandstone: ['red_sandstone_top'],
    smooth_sandstone_slab: ['sandstone_top'],
    smooth_red_sandstone_slab: ['red_sandstone_top'],
    smooth_sandstone_stairs: ['sandstone_top'],
    smooth_red_sandstone_stairs: ['red_sandstone_top'],
    sandstone_slab: ['sandstone'],
    sandstone_stairs: ['sandstone'],
    sandstone_wall: ['sandstone'],
    red_sandstone_slab: ['red_sandstone'],
    red_sandstone_stairs: ['red_sandstone'],
    red_sandstone_wall: ['red_sandstone'],
    cut_sandstone_slab: ['cut_sandstone'],
    cut_red_sandstone_slab: ['cut_red_sandstone'],
    quartz_block: ['quartz_block_side', 'quartz_block_top'],
    skeleton_skull: ['bone_block_top', 'bone'],
    wither_skeleton_skull: ['soul_sand', 'bone'],
    player_head: ['oak_planks'],
    stone_button: ['stone'],
    mangrove_roots: ['mangrove_roots_top', 'mangrove_log'],
    muddy_mangrove_roots: ['muddy_mangrove_roots_top', 'mangrove_roots_top', 'mud'],
    enchanted_golden_apple: ['golden_apple'],
    water: ['water_still'],
    lava: ['lava_still'],
    lilac: ['lilac_top'],
    peony: ['peony_top'],
    rose_bush: ['rose_bush_top'],
    sunflower: ['sunflower_front'],
    compass: ['compass_16'],
    recovery_compass: ['recovery_compass_16'],
    crossbow: ['crossbow_standby'],

    // tag-like plurals
    planks: ['oak_planks'],
    leaves: ['oak_leaves'],
    saplings: ['oak_sapling'],
    wool: ['white_wool'],
    beds: ['white_wool'],
    banners: ['white_wool'],
    signs: ['oak_planks'],
    wooden_buttons: ['oak_planks'],
    wooden_doors: ['oak_door'],
    wooden_fences: ['oak_planks'],
    wooden_pressure_plates: ['oak_planks'],
    wooden_slabs: ['oak_planks'],
    wooden_stairs: ['oak_planks'],
    wooden_trapdoors: ['oak_trapdoor'],
    bamboo_blocks: ['bamboo_planks'],
    bamboo_mosaic_slab: ['bamboo_mosaic'],
    bamboo_mosaic_stairs: ['bamboo_mosaic'],
    gold_ores: ['gold_ore'],
    trim_templates: ['coast_armor_trim_smithing_template'],
  };
  if (sideFaces[name]) out.push(...sideFaces[name]);

  return out;
}

async function downloadOne(name) {
  const candidates = [name, ...fallbackNames(name)];
  for (const candidate of candidates) {
    for (const folder of ['items', 'blocks']) {
      const url = `${BASE}/${folder}/${candidate}.png`;
      const buf = await tryFetch(url);
      if (buf) {
        await fs.writeFile(path.join(OUT_DIR, `${name}.png`), buf);
        return `${folder}/${candidate}`;
      }
    }
  }
  return null;
}

async function main() {
  await fs.mkdir(OUT_DIR, { recursive: true });

  const recipes = JSON.parse(await fs.readFile(RECIPES, 'utf8'));
  const ids = new Set();
  collectMinecraftIds(recipes, ids);
  ids.delete('air');
  // crafting recipe types are not items, drop the few non-item ids
  for (const t of ['crafting_shaped', 'crafting_shapeless', 'smelting', 'blasting', 'smoking', 'campfire_cooking']) {
    ids.delete(t);
  }

  const sorted = [...ids].sort();
  console.log(`Found ${sorted.length} distinct minecraft:* ids in recipes.json`);

  const existing = new Set((await fs.readdir(OUT_DIR).catch(() => [])).map((f) => f.replace(/\.png$/, '')));
  const todo = sorted.filter((n) => !existing.has(n));
  console.log(`${existing.size} already present, ${todo.length} to fetch`);

  const found = [];
  const missing = [];
  let i = 0;
  for (const name of todo) {
    i++;
    process.stdout.write(`[${i}/${todo.length}] ${name} ... `);
    try {
      const where = await downloadOne(name);
      if (where) {
        process.stdout.write(`ok (${where})\n`);
        found.push(name);
      } else {
        process.stdout.write(`MISSING\n`);
        missing.push(name);
      }
    } catch (e) {
      process.stdout.write(`ERROR ${e.message}\n`);
      missing.push(name);
    }
  }

  console.log(`\nDone. Downloaded ${found.length}, missing ${missing.length}.`);
  if (missing.length) {
    console.log('\nMissing ids (need manual handling):');
    for (const m of missing) console.log(`  - minecraft:${m}`);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
