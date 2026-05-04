export function shortId(id: string): string {
  const idx = id.indexOf(':');
  return idx === -1 ? id : id.slice(idx + 1);
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
  const route =
    versionMap &&
    (versionMap[activeVersion?.name ?? 'current'] ??
      versionMap['1.20.1'] ??
      versionMap['current']);
  let pageUrl = route ? `${activeVersion?.path ?? ''}${route}` : undefined;
  if (pageUrl === locationPathname) pageUrl = undefined;

  if (pageUrl) return { to: pageUrl, external: false };

  if (resolvedId.startsWith('minecraft:') && resolvedId !== 'minecraft:air') {
    return { to: `https://minecraft.wiki/w/${wikiPageName(shortId(resolvedId))}`, external: true };
  }
  return undefined;
}
