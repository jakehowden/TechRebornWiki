import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const OUT = path.join(ROOT, 'docs', 'items-with-pages.json');

const HERO_RE = /<ItemIcon\s+(?:[^>]*?\s+)?id=["']([^"']+)["'][^>]*?size=\{(\d+)\}|<ItemIcon\s+(?:[^>]*?\s+)?size=\{(\d+)\}[^>]*?id=["']([^"']+)["']/g;
// Also match <ItemHeader id="..." /> as a hero (no size attribute required)
const ITEM_HEADER_RE = /<ItemHeader\s+(?:[^>]*?\s+)?id=["']([^"']+)["']/g;

async function walkMdx(dir) {
  const files = [];
  let entries;
  try {
    entries = await fs.readdir(dir, { withFileTypes: true });
  } catch {
    return files;
  }
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory() && !entry.name.startsWith('_')) {
      files.push(...await walkMdx(full));
    } else if (entry.name.endsWith('.mdx') && entry.name !== 'index.mdx' && !entry.name.startsWith('_')) {
      files.push(full);
    }
  }
  return files;
}

async function scanDir(baseDir, versionLabel, map) {
  const files = await walkMdx(baseDir);
  let count = 0;
  for (const file of files) {
    const text = await fs.readFile(file, 'utf8');
    const rel = path.relative(baseDir, file).replace(/\\/g, '/').replace(/\.mdx$/, '');
    const route = rel.endsWith('/index') ? rel.slice(0, -6) : rel;

    // Try large ItemIcon first (explicit hero)
    HERO_RE.lastIndex = 0;
    let heroId = null;
    let match;
    while ((match = HERO_RE.exec(text)) !== null) {
      const id = match[1] ?? match[4];
      const sizeStr = match[2] ?? match[3];
      if (!id || !sizeStr) continue;
      if (Number(sizeStr) < 64) continue;
      heroId = id;
      break;
    }

    // Fall back to ItemHeader (generated pages use this)
    if (!heroId) {
      ITEM_HEADER_RE.lastIndex = 0;
      const headerMatch = ITEM_HEADER_RE.exec(text);
      if (headerMatch) heroId = headerMatch[1];
    }

    if (!heroId) continue;
    if (!map[heroId]) map[heroId] = {};
    if (!map[heroId][versionLabel]) {
      map[heroId][versionLabel] = '/' + route;
      count++;
    }
  }
  return count;
}

const map = {};
const docsDir = path.join(ROOT, 'docs');
const versionedDir = path.join(ROOT, 'versioned_docs', 'version-1.20.1');

const currentCount = await scanDir(docsDir, 'current', map);
const versionedCount = await scanDir(versionedDir, '1.20.1', map);

// Merge manual aliases (scan results take priority; aliases fill the rest)
const aliasPath = path.join(__dirname, 'item-page-aliases.json');
const aliases = JSON.parse(await fs.readFile(aliasPath, 'utf8'));
let aliasCount = 0;
for (const [id, routes] of Object.entries(aliases)) {
  if (!map[id]) map[id] = {};
  for (const [version, route] of Object.entries(routes)) {
    if (!map[id][version]) { map[id][version] = route; aliasCount++; }
  }
}

await fs.writeFile(OUT, JSON.stringify(map, null, 2) + '\n');
console.log(`items-with-pages.json: ${currentCount} current + ${versionedCount} v1.20.1 entries + ${aliasCount} aliases → ${Object.keys(map).length} items`);
