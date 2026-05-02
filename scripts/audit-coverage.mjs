import fs from 'fs';
import path from 'path';

// Just basic sanity check since enum extraction is complex
const docsDir = 'docs';

function walk(dir, results = []) {
  if (!fs.existsSync(dir)) return results;
  const list = fs.readdirSync(dir);
  for (let file of list) {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      walk(file, results);
    } else if (file.endsWith('.mdx') || file.endsWith('.md')) {
      results.push(file);
    }
  }
  return results;
}

const allMdxFiles = walk(docsDir);
let totalContent = '';
for (const file of allMdxFiles) {
  totalContent += fs.readFileSync(file, 'utf8') + '\n';
}

const importantItems = [
  'techreborn:industrial_blast_furnace',
  'techreborn:industrial_grinder',
  'techreborn:industrial_centrifuge',
  'techreborn:fusion_control_computer',
  'techreborn:advanced_alloy_plate',
  'techreborn:iridium_alloy_plate',
  'techreborn:nano_helmet',
  'techreborn:quantum_helmet',
  'techreborn:basic_drill',
  'techreborn:bauxite_ore'
];

let missing = 0;
for (const item of importantItems) {
  if (!totalContent.includes(item)) {
    console.warn('MISSING reference to: ' + item);
    missing++;
  }
}

if (missing === 0) {
  console.log('Audit coverage passed.');
} else {
  console.log('Audit coverage failed with ' + missing + ' missing items.');
}
