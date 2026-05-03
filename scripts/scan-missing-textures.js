const fs = require('fs');
const path = require('path');
const items = require('../src/data/items.json');

const broken = [];
for (const [id, item] of Object.entries(items)) {
  if (!item.texture) continue;
  const filePath = path.join(__dirname, '../static' + item.texture);
  if (!fs.existsSync(filePath)) {
    broken.push({ id, texture: item.texture });
  }
}

console.log('Broken texture references:', broken.length);
for (const { id, texture } of broken) {
  console.log(id, '->', texture);
}
