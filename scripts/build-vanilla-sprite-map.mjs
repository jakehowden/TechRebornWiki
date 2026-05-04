import { readFileSync, writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');

const css = readFileSync(resolve(root, 'static/css/minecraft-sprites.css'), 'utf8');
const map = {};
const re = /^\.([a-z0-9][a-z0-9-]*)\s*\{/gm;
let match;
while ((match = re.exec(css)) !== null) {
  const slug = match[1];
  if (slug === 'icon-32' || slug.startsWith('icon-size-')) continue;
  map[slug] = true;
}

const out = resolve(root, 'src/data/vanilla-sprite-map.json');
writeFileSync(out, JSON.stringify(map, null, 2));
console.log(`Wrote ${Object.keys(map).length} sprite entries to src/data/vanilla-sprite-map.json`);
