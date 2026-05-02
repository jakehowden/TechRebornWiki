const fs = require('fs');
const path = require('path');

const items = JSON.parse(fs.readFileSync('src/data/items.json', 'utf8'));

const outDir = 'docs/materials';
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

function generateTablePage(idFilter, title, desc, filename, order) {
  const matched = Object.keys(items).filter(k => idFilter(k));
  if (matched.length === 0) return;
  
  matched.sort();

  let content = `---
title: ${title}
description: ${desc}
sidebar_position: ${order}
---

import ItemIcon from '@site/src/components/ItemIcon';

# ${title}
${desc}

| Icon | Item ID | Name |
| :---: | :--- | :--- |
`;

  for (const id of matched) {
    const name = items[id].name;
    content += `| <ItemIcon id="${id}" /> | \`${id}\` | ${name} |\n`;
  }

  fs.writeFileSync(path.join(outDir, filename), content);
}

generateTablePage(k => k.endsWith('_ingot'), 'Ingots', 'A complete list of ingots available in Tech Reborn.', 'ingots.mdx', 1);
generateTablePage(k => k.endsWith('_plate'), 'Plates', 'A complete list of plates available in Tech Reborn.', 'plates.mdx', 2);
generateTablePage(k => k.endsWith('_dust') && !k.includes('small_'), 'Dusts', 'A complete list of standard dusts available in Tech Reborn.', 'dusts.mdx', 3);
generateTablePage(k => k.includes('small_') && k.endsWith('_dust'), 'Small Dusts', 'Small dusts (1/4th of a standard dust).', 'small-dusts.mdx', 4);
generateTablePage(k => k.endsWith('_nugget'), 'Nuggets', 'Nuggets (1/9th of an ingot).', 'nuggets.mdx', 5);
generateTablePage(k => k.endsWith('_gem') || ['techreborn:ruby', 'techreborn:sapphire', 'techreborn:peridot', 'techreborn:red_garnet', 'techreborn:yellow_garnet'].includes(k), 'Gems', 'Gems found in the world or processed from ores.', 'gems.mdx', 6);
generateTablePage(k => k.startsWith('techreborn:raw_'), 'Raw Metals', 'Raw materials mined from ores before processing.', 'raw-metals.mdx', 7);
generateTablePage(k => k.endsWith('_cell'), 'Cells', 'Fluid cells used to store various liquids.', 'cells.mdx', 8);
generateTablePage(k => k.endsWith('_storage_block'), 'Storage Blocks', 'Blocks used for compact storage of materials.', 'storage-blocks.mdx', 9);

console.log('Material tables generated.');
