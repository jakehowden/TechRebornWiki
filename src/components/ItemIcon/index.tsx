import React, { useState } from 'react';
import Link from '@docusaurus/Link';
import { useLocation } from '@docusaurus/router';
import useBaseUrl from '@docusaurus/useBaseUrl';
import { useActiveVersion } from '@docusaurus/plugin-content-docs/client';
import styles from './styles.module.css';
import itemsData from '@site/src/data/items.json';
import tagsData from '@site/src/data/tags.json';
import { shortId, titleCase, wikiPageName } from '@site/src/utils/itemFormatters';

type ItemsWithPages = Record<string, Record<string, string>>;
let itemsWithPages: ItemsWithPages = {};
try {
  itemsWithPages = require('@site/docs/items-with-pages.json');
} catch (e) {
  // generated at build time
}

export interface ItemIconProps {
  id: string;
  size?: number;
  className?: string;
}

export default function ItemIcon({ id, size = 32, className = '' }: ItemIconProps) {
  const [imgError, setImgError] = useState(false);
  const location = useLocation();
  const activeVersion = useActiveVersion('default') as { name: string; path: string } | undefined;

  const resolvedId = (id in tagsData) ? (tagsData as Record<string, string>)[id] : id;
  const short = shortId(resolvedId);
  const itemInfo = (itemsData as Record<string, { displayName?: string; texture?: string; category?: string }>)[resolvedId];

  let texturePath: string | undefined;
  if (resolvedId.startsWith('techreborn:')) texturePath = `/img/techreborn/${short}.png`;
  else if (resolvedId.startsWith('minecraft:')) texturePath = `/img/vanilla/${short}.png`;
  else texturePath = itemInfo?.texture;

  const displayName = itemInfo?.displayName ?? titleCase(short);
  const src = useBaseUrl(texturePath || '/img/unknown.png');

  const versionMap = itemsWithPages[resolvedId];
  const route = versionMap && (versionMap[activeVersion?.name ?? 'current'] ?? versionMap['1.20.1'] ?? versionMap['current']);
  let pageUrl = route ? `${activeVersion?.path ?? ''}${route}` : undefined;
  if (pageUrl === location.pathname) pageUrl = undefined;

  const externalUrl = !pageUrl && resolvedId.startsWith('minecraft:') && resolvedId !== 'minecraft:air'
    ? `https://minecraft.wiki/w/${wikiPageName(short)}`
    : undefined;

  const content = (
    <div
      className={`${styles.iconWrapper} ${className}`}
      style={{ width: size, height: size }}
      title={displayName}
    >
      {!imgError && texturePath ? (
        <img
          src={src}
          alt={displayName}
          className={`mc-pixelated ${styles.iconImg}`}
          onError={() => {
            console.warn(`Missing texture for ${resolvedId} at ${src}`);
            setImgError(true);
          }}
        />
      ) : (
        <div className={styles.missingTexture} title={displayName}>
          {(displayName || '??').substring(0, 2).toUpperCase()}
        </div>
      )}
    </div>
  );

  const linkTo = pageUrl ?? externalUrl;
  if (!linkTo) return content;
  const externalProps = externalUrl ? { target: '_blank', rel: 'noopener noreferrer' } : {};
  return <Link to={linkTo} className={styles.iconLink} {...externalProps}>{content}</Link>;
}
