import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const OUT = path.join(ROOT, 'docs', 'items-with-pages.json');

const HERO_RE = /<ItemIcon\s+(?:[^>]*?\s+)?id=["']([^"']+)["'][^>]*?size=\{(\d+)\}|<ItemIcon\s+(?:[^>]*?\s+)?size=\{(\d+)\}[^>]*?id=["']([^"']+)["']/g;

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
    if (entry.isDirectory()) {
      files.push(...await walkMdx(full));
    } else if (entry.name.endsWith('.mdx') && entry.name !== 'index.mdx') {
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
    HERO_RE.lastIndex = 0;
    let match;
    while ((match = HERO_RE.exec(text)) !== null) {
      const id = match[1] ?? match[4];
      const sizeStr = match[2] ?? match[3];
      if (!id || !sizeStr) continue;
      if (Number(sizeStr) < 64) continue;

      const rel = path.relative(baseDir, file).replace(/\\/g, '/').replace(/\.mdx$/, '');
      const route = rel.endsWith('/index') ? rel.slice(0, -6) : rel;

      if (!map[id]) {
        map[id] = {};
      }
      if (!map[id][versionLabel]) {
        map[id][versionLabel] = '/' + route;
        count++;
      }
      break; // only first hero per file
    }
  }
  return count;
}

const map = {};
const docsDir = path.join(ROOT, 'docs');
const versionedDir = path.join(ROOT, 'versioned_docs', 'version-1.20.1');

const currentCount = await scanDir(docsDir, 'current', map);
const versionedCount = await scanDir(versionedDir, '1.20.1', map);

await fs.writeFile(OUT, JSON.stringify(map, null, 2) + '\n');
console.log(`items-with-pages.json: ${currentCount} current + ${versionedCount} v1.20.1 entries → ${Object.keys(map).length} items`);
