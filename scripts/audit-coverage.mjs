import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');

const items = JSON.parse(readFileSync(resolve(root, 'src/data/items.json'), 'utf8'));
const pages = JSON.parse(readFileSync(resolve(root, 'docs/items-with-pages.json'), 'utf8'));

const EXTERNAL_PREFIXES = ['minecraft:'];
const total = Object.keys(items).length;

let mapped = 0;
let external = 0;
const unmapped = [];

for (const id of Object.keys(items)) {
  if (pages[id]) {
    mapped++;
  } else if (EXTERNAL_PREFIXES.some(p => id.startsWith(p))) {
    external++;
  } else {
    unmapped.push(id);
  }
}

const covered = mapped + external;
const pct = ((covered / total) * 100).toFixed(1);

console.log(`Coverage: ${covered}/${total} (${pct}%) — ${mapped} mapped, ${external} external, ${unmapped.length} gaps`);
if (unmapped.length > 0) {
  console.log('\nUnmapped TR items:');
  for (const id of unmapped.sort()) console.log(`  ${id}`);
  process.exitCode = 1;
}
