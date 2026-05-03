const fs = require('fs');
const path = require('path');
const items = require('../src/data/items.json');

const check = [
  'techreborn:basic_solar_panel', 'techreborn:advanced_solar_panel',
  'techreborn:industrial_solar_panel', 'techreborn:ultimate_solar_panel',
  'techreborn:quantum_solar_panel', 'techreborn:solid_fuel_generator',
  'techreborn:basic_machine_frame', 'techreborn:red_cell_battery',
  'techreborn:advanced_circuit', 'techreborn:reinforced_glass',
  'minecraft:furnace', 'techreborn:lapotron_crystal',
];

const fixes = {
  'techreborn:basic_solar_panel': '/img/blocks/basic_solar_panel_top.png',
  'techreborn:advanced_solar_panel': '/img/blocks/advanced_solar_panel_top.png',
  'techreborn:industrial_solar_panel': '/img/blocks/industrial_solar_panel_top.png',
  'techreborn:ultimate_solar_panel': '/img/blocks/ultimate_solar_panel_top.png',
  'techreborn:quantum_solar_panel': '/img/blocks/quantum_solar_panel_top.png',
};

let changed = false;

for (const id of check) {
  const item = items[id];
  if (!item) {
    console.log('NOT IN JSON:', id);
    continue;
  }
  const filePath = path.join(__dirname, '../static' + item.texture);
  const exists = fs.existsSync(filePath);
  if (!exists) {
    const fix = fixes[id];
    if (fix) {
      const fixPath = path.join(__dirname, '../static' + fix);
      const fixExists = fs.existsSync(fixPath);
      if (fixExists) {
        console.log('FIXING:', id, item.texture, '->', fix);
        items[id].texture = fix;
        changed = true;
      } else {
        console.log('MISSING FILE (no fix):', id, item.texture);
      }
    } else {
      console.log('MISSING FILE:', id, item.texture);
    }
  } else {
    console.log('OK:', id, '->', item.texture);
  }
}

if (changed) {
  fs.writeFileSync(path.join(__dirname, '../src/data/items.json'), JSON.stringify(items, null, 2));
  console.log('Saved fixes to items.json');
}
