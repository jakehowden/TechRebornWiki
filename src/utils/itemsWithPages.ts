type ItemsWithPages = Record<string, Record<string, string>>;
let loaded: ItemsWithPages = {};
try {
  loaded = require('@site/docs/items-with-pages.json');
} catch {
  // not available until build time
}
export default loaded;
