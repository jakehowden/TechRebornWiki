const fs = require('fs');
const path = require('path');
const items = require('../src/data/items.json');

const additions = {
  'minecraft:glass': { displayName: 'Glass', texture: '/img/blocks/reinforced_glass.png', category: 'block' },
  'minecraft:glass_pane': { displayName: 'Glass Pane', texture: '/img/blocks/reinforced_glass.png', category: 'block' },
  'minecraft:iron_ingot': { displayName: 'Iron Ingot', texture: '/img/items/refined_iron_ingot.png', category: 'item' },
  'minecraft:gold_ingot': { displayName: 'Gold Ingot', texture: '/img/items/gold.png', category: 'item' },
  'minecraft:copper_ingot': { displayName: 'Copper Ingot', texture: '/img/items/copper_ingot.png', category: 'item' },
  'minecraft:diamond': { displayName: 'Diamond', texture: '/img/items/diamond_plate.png', category: 'item' },
  'minecraft:emerald': { displayName: 'Emerald', texture: '/img/items/emerald_plate.png', category: 'item' },
  'minecraft:coal': { displayName: 'Coal', texture: '/img/items/coal_dust.png', category: 'item' },
  'minecraft:redstone': { displayName: 'Redstone', texture: '/img/items/redstone_plate.png', category: 'item' },
  'minecraft:lapis_lazuli': { displayName: 'Lapis Lazuli', texture: '/img/items/lazurite_dust.png', category: 'item' },
  'minecraft:quartz': { displayName: 'Nether Quartz', texture: '/img/items/quartz_dust.png', category: 'item' },
  'minecraft:netherite_ingot': { displayName: 'Netherite Ingot', texture: '/img/items/tungstensteel_ingot.png', category: 'item' },
  'minecraft:blaze_rod': { displayName: 'Blaze Rod', texture: '/img/items/kanthal_heating_coil.png', category: 'item' },
  'minecraft:ender_pearl': { displayName: 'Ender Pearl', texture: '/img/items/ender_pearl_dust.png', category: 'item' },
  'minecraft:ghast_tear': { displayName: 'Ghast Tear', texture: '/img/items/helium_coolant_cell_60k.png', category: 'item' },
  'minecraft:gunpowder': { displayName: 'Gunpowder', texture: '/img/items/sulfur_dust.png', category: 'item' },
  'minecraft:flint': { displayName: 'Flint', texture: '/img/items/flint_dust.png', category: 'item' },
  'minecraft:clay_ball': { displayName: 'Clay Ball', texture: '/img/items/clay_dust.png', category: 'item' },
  'minecraft:slime_ball': { displayName: 'Slime Ball', texture: '/img/items/sap.png', category: 'item' },
  'minecraft:stick': { displayName: 'Stick', texture: '/img/items/carbon_plate.png', category: 'item' },
  'minecraft:string': { displayName: 'String', texture: '/img/items/glassfiber.png', category: 'item' },
  'minecraft:paper': { displayName: 'Paper', texture: '/img/items/wood_plate.png', category: 'item' },
  'minecraft:iron_nugget': { displayName: 'Iron Nugget', texture: '/img/items/refined_iron_nugget.png', category: 'item' },
  'minecraft:gold_nugget': { displayName: 'Gold Nugget', texture: '/img/items/gold.png', category: 'item' },
  'minecraft:obsidian': { displayName: 'Obsidian', texture: '/img/items/obsidian_plate.png', category: 'block' },
  'minecraft:cobblestone': { displayName: 'Cobblestone', texture: '/img/blocks/basic_machine_casing.png', category: 'block' },
  'minecraft:gravel': { displayName: 'Gravel', texture: '/img/items/flint_dust.png', category: 'block' },
  'minecraft:sand': { displayName: 'Sand', texture: '/img/items/quartz_dust.png', category: 'block' },
  'minecraft:oak_planks': { displayName: 'Oak Planks', texture: '/img/items/wood_plate.png', category: 'block' },
  'minecraft:oak_log': { displayName: 'Oak Log', texture: '/img/items/wood_plate.png', category: 'block' },
  'minecraft:basalt': { displayName: 'Basalt', texture: '/img/items/obsidian_dust.png', category: 'block' },
  'minecraft:barrel': { displayName: 'Barrel', texture: '/img/items/wood_plate.png', category: 'block' },
  'minecraft:crafting_table': { displayName: 'Crafting Table', texture: '/img/blocks/auto_crafting_table_top.png', category: 'block' },
  'minecraft:iron_ore': { displayName: 'Iron Ore', texture: '/img/items/iron_dust.png', category: 'block' },
  'minecraft:gold_ore': { displayName: 'Gold Ore', texture: '/img/items/gold_dust.png', category: 'block' },
  'minecraft:coal_ore': { displayName: 'Coal Ore', texture: '/img/items/coal_dust.png', category: 'block' },
  'minecraft:diamond_ore': { displayName: 'Diamond Ore', texture: '/img/items/diamond_dust.png', category: 'block' },
  'minecraft:emerald_ore': { displayName: 'Emerald Ore', texture: '/img/items/emerald_dust.png', category: 'block' },
  'minecraft:lapis_ore': { displayName: 'Lapis Ore', texture: '/img/items/lazurite_dust.png', category: 'block' },
  'minecraft:cooked_beef': { displayName: 'Cooked Beef', texture: '/img/items/carbon_plate.png', category: 'item' },
  'minecraft:sponge': { displayName: 'Sponge', texture: '/img/items/sponge_piece.png', category: 'block' },
  'techreborn:rubber_planks': { displayName: 'Rubber Planks', texture: '/img/items/wood_plate.png', category: 'block' },
  'techreborn:rubber_fence': { displayName: 'Rubber Fence', texture: '/img/items/wood_plate.png', category: 'block' },
  'techreborn:rubber_slab': { displayName: 'Rubber Slab', texture: '/img/items/wood_plate.png', category: 'block' },
  'techreborn:rubber_stair': { displayName: 'Rubber Stair', texture: '/img/items/wood_plate.png', category: 'block' },
};

// Verify each texture file exists
let added = 0, skipped = 0;
for (const [id, data] of Object.entries(additions)) {
  if (items[id]) { skipped++; continue; }
  const filePath = path.join(__dirname, '../static' + data.texture);
  if (!require('fs').existsSync(filePath)) {
    console.log('TEXTURE MISSING:', id, data.texture);
    continue;
  }
  items[id] = data;
  added++;
}

console.log('Added:', added, 'Skipped (already exist):', skipped);
fs.writeFileSync(path.join(__dirname, '../src/data/items.json'), JSON.stringify(items, null, 2));
