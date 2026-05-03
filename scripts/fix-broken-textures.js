const fs = require('fs');
const path = require('path');
const items = require('../src/data/items.json');

const fixes = {
  'techreborn:peridot': '/img/items/peridot_gem.png',
  'techreborn:red_garnet': '/img/items/red_garnet_gem.png',
  'techreborn:ruby': '/img/items/ruby_gem.png',
  'techreborn:sapphire': '/img/items/sapphire_gem.png',
  'techreborn:yellow_garnet': '/img/items/yellow_garnet_gem.png',
  'techreborn:superconductor': '/img/items/part_superconductor.png',
  'techreborn:insulated_copper_cable': '/img/items/insulatedcopper.png',
  'techreborn:insulated_gold_cable': '/img/items/insulatedgold.png',
  'techreborn:insulated_hv_cable': '/img/items/insulatedhv.png',
  'techreborn:buffer_storage_unit': '/img/blocks/storage_buffer_top.png',
  'techreborn:crude_storage_unit': '/img/blocks/crude_storage_unit_top.png',
  'techreborn:basic_storage_unit': '/img/blocks/basic_storage_unit_top.png',
  'techreborn:advanced_storage_unit': '/img/blocks/advanced_storage_unit_top.png',
  'techreborn:industrial_storage_unit': '/img/blocks/industrial_storage_unit_top.png',
  'techreborn:quantum_storage_unit': '/img/blocks/quantum_storage_unit_front.png',
  'techreborn:creative_storage_unit': '/img/blocks/creative_storage_unit_front.png',
  'techreborn:basic_tank': '/img/blocks/basic_tank_unit_top.png',
  'techreborn:advanced_tank': '/img/blocks/advanced_tank_unit_top.png',
  'techreborn:industrial_tank': '/img/blocks/industrial_tank_unit_top.png',
  'techreborn:quantum_tank': '/img/blocks/quantum_tank_unit_top.png',
  'techreborn:creative_tank': '/img/blocks/creative_tank_unit_top.png',
  'techreborn:creative_solar_panel': '/img/blocks/creative_solar_panel_top.png',
};

// Remove clearly invalid entries
const toDelete = ['techreborn:basic', 'techreborn:advanced', 'techreborn:industrial', 'techreborn:not_nugget'];

let fixed = 0;
for (const [id, texturePath] of Object.entries(fixes)) {
  if (items[id]) {
    const filePath = path.join(__dirname, '../static' + texturePath);
    if (fs.existsSync(filePath)) {
      items[id].texture = texturePath;
      fixed++;
    } else {
      console.log('Fix file does not exist:', texturePath);
    }
  }
}

let deleted = 0;
for (const id of toDelete) {
  if (items[id]) {
    delete items[id];
    deleted++;
  }
}

console.log('Fixed:', fixed, 'Deleted:', deleted);
fs.writeFileSync(path.join(__dirname, '../src/data/items.json'), JSON.stringify(items, null, 2));
