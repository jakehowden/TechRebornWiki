import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');

const tags = JSON.parse(readFileSync(resolve(root, 'src/data/tags.json'), 'utf8'));
const pages = JSON.parse(readFileSync(resolve(root, 'docs/items-with-pages.json'), 'utf8'));

let gaps = 0;
for (const [tag, id] of Object.entries(tags)) {
  if (!pages[id]) {
    console.log(`tag ${tag} → ${id} has no page`);
    gaps++;
  }
}

if (gaps === 0) {
  console.log('Tag coverage OK — all tags resolve to items with pages.');
} else {
  console.log(`\n${gaps} tag(s) resolve to items without pages.`);
}
