const fs = require('fs');
const recipes = JSON.parse(fs.readFileSync('src/data/recipes.json', 'utf8'));

const targets = ['insulated_copper_cable', 'electronic_circuit', 'advanced_circuit', 'machine_frame', 'extractor', 'electric_furnace', 'compressor', 'grinder', 'alloy_smelter', 'cell'];

const results = {};

for (const [key, value] of Object.entries(recipes)) {
  for (const target of targets) {
    if (key.includes(target) && (key.startsWith('techreborn:crafting') || key.startsWith('techreborn:assembling'))) {
      if (!results[target]) results[target] = [];
      results[target].push(key);
    }
  }
}

console.log(JSON.stringify(results, null, 2));
