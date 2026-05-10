import tagsData from '@site/src/data/tags.json';
import vanillaSpriteMap from '@site/src/data/vanilla-sprite-map.json';

export function shortId(id: string): string {
  const idx = id.indexOf(':');
  return idx === -1 ? id : id.slice(idx + 1);
}

export function resolveTagId(id: string): string {
  return (id in tagsData) ? (tagsData as Record<string, string>)[id] : id;
}

export function resolveTexture(
  resolvedId: string,
  itemInfo?: { texture?: string },
): { texturePath?: string; spriteSlug: string | null } {
  const short = shortId(resolvedId);
  if (resolvedId.startsWith('techreborn:')) {
    return { texturePath: `/img/techreborn/${short}.png`, spriteSlug: null };
  }
  if (resolvedId.startsWith('minecraft:')) {
    const slug = short.replace(/_/g, '-');
    const useSprite = (vanillaSpriteMap as Record<string, boolean>)[slug] === true;
    return { texturePath: `/img/vanilla/${short}.png`, spriteSlug: useSprite ? slug : null };
  }
  return { texturePath: itemInfo?.texture, spriteSlug: null };
}

export function titleCase(slug: string): string {
  return slug
    .replace(/^[-_]*(.)/, (_, c) => c.toUpperCase())
    .replace(/[-_]+(.)/g, (_, c) => ' ' + c.toUpperCase());
}

export function wikiPageName(slug: string): string {
  return slug
    .split('_')
    .map((w) => (w ? w[0].toUpperCase() + w.slice(1) : w))
    .join('_');
}

export function resolveItemLink(
  resolvedId: string,
  activeVersion: { name: string; path: string } | undefined,
  locationPathname: string,
  itemsWithPages: Record<string, Record<string, string>>
): { to: string; external: boolean } | undefined {
  const versionMap = itemsWithPages[resolvedId];
  const versionName = activeVersion?.name ?? 'current';
  const route = versionMap?.[versionName];
  let pageUrl = route ? `${activeVersion?.path ?? '/docs'}${route}` : undefined;
  if (pageUrl === locationPathname) pageUrl = undefined;

  if (pageUrl) return { to: pageUrl, external: false };

  if (resolvedId.startsWith('minecraft:') && resolvedId !== 'minecraft:air') {
    return { to: `https://minecraft.wiki/w/${wikiPageName(shortId(resolvedId))}`, external: true };
  }
  return undefined;
}
