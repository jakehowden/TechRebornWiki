const fs = require('fs');
const path = require('path');
const items = require('../src/data/items.json');
const tags = require('../src/data/tags.json');

// Verify all tag targets exist in items.json
console.log('=== TAG TARGET VERIFICATION ===');
let tagBroken = 0;
for (const [tag, targetId] of Object.entries(tags)) {
  if (!items[targetId]) {
    console.log('MISSING:', tag, '->', targetId);
    tagBroken++;
  }
}
console.log(tagBroken === 0 ? 'All tag targets OK' : `${tagBroken} broken tag targets`);

// Scan static/img/blocks/ for actual face textures
console.log('\n=== BLOCK FACE TEXTURE SCAN ===');
const blocksDir = path.join(__dirname, '../static/img/blocks');
const blockFiles = fs.readdirSync(blocksDir).filter(f => f.endsWith('.png'));

const fronts = blockFiles.filter(f => f.includes('_front_off') || (f.includes('_front') && !f.includes('_on') && !f.includes('_glow') && !f.includes('_overlay')));
const sides = blockFiles.filter(f => f.includes('_side_off') || (f.includes('_side') && !f.includes('_on') && !f.includes('_glow')));
const tops = blockFiles.filter(f => f.includes('_top_off') || (f.includes('_top') && !f.includes('_on') && !f.includes('_glow')));

console.log('Front textures found:', fronts.length);
fronts.sort().forEach(f => console.log(' ', f));
console.log('\nSide textures found:', sides.length);
sides.sort().forEach(f => console.log(' ', f));
console.log('\nTop textures found:', tops.length);
tops.sort().forEach(f => console.log(' ', f));

// Verify specific textures planned in blocks.json
console.log('\n=== PLANNED BLOCKS.JSON TEXTURE VERIFICATION ===');
const planned = [
  'basic_machine_casing.png',
  'advanced_machine_casing.png',
  'industrial_machine_casing.png',
  'electric_furnace_front_off.png',
  'grinder_front_off.png',
  'grinder_top_off.png',
  'compressor_front_off.png',
  'extractor_front_off.png',
  'recycler_front_off.png',
  'electric_alloy_smelter_front_off.png',
  'wiremill_front_off.png',
  'scrapboxinator_front_off.png',
  'rolling_machine_front_off.png',
  'assembling_machine_front_off.png',
  'chemical_reactor_front_off.png',
  'industrial_electrolyzer_front_off.png',
  'industrial_sawmill_front_off.png',
  'industrial_grinder_front_off.png',
  'industrial_grinder_top_off.png',
  'industrial_centrifuge_front_off.png',
  'industrial_centrifuge_top_off.png',
  'industrial_blast_furnace_front_off.png',
  'implosion_compressor_front_off.png',
  'vacuum_freezer_front_off.png',
  'vacuum_freezer_top_off.png',
  'distillation_tower_front_off.png',
  'fluid_replicator_front_off.png',
  'fusion_control_computer_front_off.png',
  'fusion_control_computer_east.png',
  'generator_top.png',
  'generator_side.png',
  'furnace_front_off.png',
  'thermal_generator_top_off.png',
  'thermal_generator_side_off.png',
  'diesel_generator_top_off.png',
  'diesel_generator_side_off.png',
  'semi_fluid_generator_top_off.png',
  'semi_fluid_generator_side_off.png',
  'plasma_generator_top_off.png',
  'plasma_generator_side_off.png',
  'lightning_rod_top.png',
  'lightning_rod_side.png',
  'dragon_egg_syphon_top.png',
  'dragon_egg_syphon_side_off.png',
  'basic_solar_panel_top.png',
  'advanced_solar_panel_top.png',
  'industrial_solar_panel_top.png',
  'ultimate_solar_panel_top.png',
  'quantum_solar_panel_top.png',
  'quantum_solar_panel_side_off.png',
  'solar_panel_side_off.png',
  'lv_transformer_front.png',
  'lv_transformer_side.png',
  'mv_transformer_front.png',
  'mv_transformer_side.png',
  'hv_transformer_front.png',
  'hv_transformer_side.png',
  'basic_storage_unit_top.png',
  'basic_storage_unit_side.png',
  'advanced_storage_unit_top.png',
  'advanced_storage_unit_side.png',
  'industrial_storage_unit_top.png',
  'industrial_storage_unit_side.png',
  'low_voltage_su_front.png',
  'medium_voltage_su_front.png',
  'high_voltage_su_front.png',
  'lapotronic_su_front.png',
  'lapotronic_su_side.png',
  'adjustable_su_front.png',
  'adjustable_su_side.png',
  'interdimensional_su_front.png',
  'interdimensional_su_side.png',
  'wind_mill_top.png',
  'wind_mill_front.png',
  'wind_mill_left.png',
  'chunk_loader_top.png',
  'iron_alloy_furnace_front_off.png',
  'fishing_station.png',
  'player_detector_all.png',
];

let missing = [];
for (const file of planned) {
  const fp = path.join(blocksDir, file);
  if (!fs.existsSync(fp)) {
    missing.push(file);
  }
}
if (missing.length === 0) {
  console.log('All planned textures exist!');
} else {
  console.log('MISSING planned textures:');
  missing.forEach(f => console.log(' ', f));
}
